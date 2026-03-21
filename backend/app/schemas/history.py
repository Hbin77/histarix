from pydantic import BaseModel


class HistoricalEvent(BaseModel):
    label: str = ""
    date: str = ""
    year: int | None = None
    description: str = ""
    wikidata_id: str = ""
    wikipedia_url: str | None = None
    image_url: str | None = None


class CountryHistory(BaseModel):
    country_name: str
    iso_code: str
    events: list[HistoricalEvent] = []
