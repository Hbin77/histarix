from typing import Literal

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


class ChronicleEra(BaseModel):
    from_year: int
    to_year: int
    kind: Literal["state", "culture", "colonial", "period"]
    polity: str | None = None
    name: str
    summary: str


class ChronicleEvent(BaseModel):
    year: int
    importance: Literal[1, 2, 3]
    category: Literal[
        "politics", "war", "culture", "religion", "science", "economy", "society", "disaster"
    ]
    wikidata_id: str | None = None
    title: str
    description: str


class Chronicle(BaseModel):
    iso_code: str
    eras: list[ChronicleEra] = []
    events: list[ChronicleEvent] = []
