import logging

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI, APIError

from app.config import settings
from app.schemas.chat import ChatRequest, ChatResponse

logger = logging.getLogger("histarix")

router = APIRouter(prefix="/api/chat", tags=["chat"])

SYSTEM_PROMPT = """You are Histy, an AI history guide for the Histarix platform — an interactive world-map-based history learning tool.

Your role:
- Answer questions about world history, historical events, figures, civilizations, and cultures
- When a country context is provided, focus on that country's history
- Provide accurate, educational, and engaging responses
- Cite time periods and key dates when relevant
- Connect historical events to broader patterns and themes
- Be concise but informative (2-4 paragraphs max)

Guidelines:
- Respond in the user's language
- Use a friendly, knowledgeable tone appropriate for students and history enthusiasts
- If uncertain about a specific fact, say so rather than fabricating
- Suggest related topics or events the user might find interesting
- Format key terms and dates with emphasis when helpful"""

LANG_INSTRUCTIONS = {
    "ko": "한국어로 답변해주세요.",
    "en": "Please respond in English.",
    "zh": "请用中文回答。",
    "ja": "日本語で回答してください。",
}


def _build_system(country_context: str | None, lang: str) -> str:
    parts = [SYSTEM_PROMPT]
    if country_context:
        parts.append(f"\nThe user is currently viewing: {country_context}. Relate answers to this country when relevant.")
    parts.append(f"\n{LANG_INSTRUCTIONS.get(lang, LANG_INSTRUCTIONS['en'])}")
    return "\n".join(parts)


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request) -> ChatResponse:
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="AI chat is not configured")

    client = AsyncOpenAI(api_key=settings.openai_api_key)

    messages = [{"role": "system", "content": _build_system(req.country_context, req.lang)}]
    for m in req.history:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": req.message})

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=1024,
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

    client = AsyncOpenAI(api_key=settings.openai_api_key)

    messages = [{"role": "system", "content": _build_system(req.country_context, req.lang)}]
    for m in req.history:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": req.message})

    async def generate():
        try:
            stream = await client.chat.completions.create(
                model="gpt-4o-mini",
                max_tokens=1024,
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

    return StreamingResponse(generate(), media_type="text/event-stream")
