from pydantic import BaseModel


class RelatedPage(BaseModel):
    title: str = ""
    description: str = ""
    thumbnail_url: str = ""
    content_url: str = ""


class OnThisDayEvent(BaseModel):
    text: str
    year: int | None = None
    pages: list[RelatedPage] = []


class OnThisDayResponse(BaseModel):
    date: str
    events: list[OnThisDayEvent] = []
