from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(pattern=r"^(user|assistant)$")
    content: str = Field(min_length=1, max_length=2000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)
    country_context: str | None = Field(default=None, max_length=100, pattern=r"^[\w\s\-\(\),.''·]+$")
    lang: str = Field(default="ko", pattern=r"^(ko|en|zh|ja)$")


class ChatResponse(BaseModel):
    reply: str
    sources: list[str] = []
