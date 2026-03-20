from pydantic import BaseModel


class HistoricalEvent(BaseModel):
    label: str
    date: str = ""
    description: str = ""
    wikidata_id: str = ""


class CountryHistory(BaseModel):
    country_name: str
    iso_code: str
    events: list[HistoricalEvent] = []
