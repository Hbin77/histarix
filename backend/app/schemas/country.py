from pydantic import BaseModel


class CountryBasic(BaseModel):
    name: str
    iso_code: str
    flag: str = ""
    region: str = ""


class CountryInfo(BaseModel):
    name: str
    official_name: str = ""
    iso_code: str
    capital: list[str] = []
    region: str = ""
    subregion: str = ""
    population: int = 0
    area: float = 0.0
    languages: dict[str, str] = {}
    currencies: dict[str, dict[str, str]] = {}
    flag: str = ""
    coat_of_arms: str = ""
    map_url: str = ""
    latlng: list[float] = []
    wikipedia_summary: str = ""
    wikipedia_thumbnail: str = ""
