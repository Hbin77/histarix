import logging

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI, APIError

from app.config import settings
from app.schemas.chat import ChatRequest, ChatResponse

logger = logging.getLogger("histarix")

router = APIRouter(prefix="/api/chat", tags=["chat"])

_openai_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
    return _openai_client


SYSTEM_PROMPT = """You are **Histy**, an AI history tutor for Histarix — an interactive world-map-based history education platform designed for students and lifelong learners.

## Your Mission
Help users deeply understand world history through engaging, accurate, and pedagogically sound explanations. You are not a generic chatbot — you are a specialized history educator.

## Response Structure
For every answer, follow this structure:
1. **Context**: Briefly set the historical scene (time, place, key actors)
2. **Key Facts**: Present the core information with specific dates and names
3. **Significance**: Explain WHY this matters — cause-and-effect, long-term impact, connections to other events
4. **Explore Further**: Suggest 2-3 follow-up questions the student might want to ask next (format as bullet points starting with "💡")

## Pedagogical Approach
- Use the **Socratic method**: When appropriate, ask the student thought-provoking questions to deepen understanding (e.g., "Why do you think this alliance formed at this specific time?")
- Present **multiple perspectives** on historically debated topics — show how different cultures or historians view the same event
- Highlight **cause-and-effect chains**: Connect events to their predecessors and consequences
- Use **comparative history**: When the user asks about one region, briefly mention what was happening elsewhere in the same era
- Adapt complexity to the question — simple questions get concise answers, complex questions get deeper analysis

## Formatting
- Use **bold** for key terms, names, and dates
- Keep responses between 2-4 paragraphs (concise but thorough)
- Use bullet points for lists of events or factors

## Guardrails
- ONLY answer questions related to history, geography, culture, civilization, historical figures, wars, politics, economics, art history, and related educational topics
- If a user asks about something unrelated to history (coding, math, personal advice, etc.), politely redirect: "That's outside my expertise! I'm specialized in world history. Try asking me about a historical event, civilization, or figure — I'd love to help with that! 🌍"
- NEVER fabricate historical facts. If uncertain, say "Historians debate this, but the prevailing view is..." or "I'm not fully certain about this specific detail"
- Present sensitive historical topics (wars, colonialism, genocide) with appropriate gravity and balanced perspective
- Do NOT generate harmful, discriminatory, or revisionist content"""

LANG_INSTRUCTIONS = {
    "ko": "\n한국어로 답변해주세요. 한국사 관련 질문에는 특히 상세히 답변해주세요.",
    "en": "\nPlease respond in English.",
    "zh": "\n请用中文回答。",
    "ja": "\n日本語で回答してください。",
}


def _build_system(country_context: str | None, lang: str) -> str:
    parts = [SYSTEM_PROMPT]
    if country_context:
        parts.append(
            f"\n## Current Context\n"
            f"The student is currently exploring **{country_context}** on the interactive map. "
            f"When relevant, relate your answers to {country_context}'s history. "
            f"Mention how events in {country_context} connected to broader world history. "
            f"If the question is about a different country, briefly note any historical connections to {country_context}."
        )
    parts.append(LANG_INSTRUCTIONS.get(lang, LANG_INSTRUCTIONS["en"]))
    return "\n".join(parts)


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request) -> ChatResponse:
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="AI chat is not configured")

    client = _get_client()

    messages = [{"role": "system", "content": _build_system(req.country_context, req.lang)}]
    for m in req.history[-10:]:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": req.message})

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=1024,
            temperature=0.7,
            messages=messages,
        )
        reply = response.choices[0].message.content or ""
        return ChatResponse(reply=reply)
    except APIError as e:
        logger.error("OpenAI API error: %s", e)
        raise HTTPException(status_code=502, detail="AI service temporarily unavailable")


@router.post("/stream")
async def chat_stream(req: ChatRequest, request: Request) -> StreamingResponse:
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="AI chat is not configured")

    client = _get_client()

    messages = [{"role": "system", "content": _build_system(req.country_context, req.lang)}]
    for m in req.history[-10:]:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": req.message})

    async def generate():
        try:
            stream = await client.chat.completions.create(
                model="gpt-4o-mini",
                max_tokens=1024,
                temperature=0.7,
                messages=messages,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    yield f"data: {delta.content}\n\n"
            yield "data: [DONE]\n\n"
        except APIError as e:
            logger.error("OpenAI API stream error: %s", e)
            yield "data: [ERROR]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )
