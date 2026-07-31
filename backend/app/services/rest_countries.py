"""Country metadata from a bundled snapshot of the restcountries v3.1 dataset.

The public restcountries.com API was deprecated (v3.1 now redirects to a
deprecation notice; v5 requires an API key). Country facts change rarely, so
the app ships a slimmed snapshot of the open dataset instead — same response
shape the routers already parse, no external dependency, no key. Flag images
still point at flagcdn.com URLs contained in the data.

The httpx client parameters are kept so router call sites stay unchanged.
"""

import json
from pathlib import Path

import httpx

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "countries_v31.json"

_countries: list[dict] | None = None
_by_code: dict[str, dict] = {}


def _load() -> list[dict]:
    global _countries
    if _countries is None:
        with _DATA_PATH.open(encoding="utf-8") as f:
            _countries = json.load(f)
        for country in _countries:
            for key in ("cca2", "cca3"):
                code = country.get(key, "")
                if code:
                    _by_code[code] = country
    return _countries


async def get_country_by_code(
    client: httpx.AsyncClient, iso_code: str
) -> dict | None:
    _load()
    return _by_code.get(iso_code.upper())


async def search_countries(client: httpx.AsyncClient, query: str) -> list[dict]:
    q = query.strip().lower()
    if not q:
        return []
    results = []
    for country in _load():
        name = country.get("name", {})
        haystacks = [name.get("common", ""), name.get("official", "")]
        for translation in (country.get("translations") or {}).values():
            if isinstance(translation, dict):
                haystacks.append(translation.get("common", ""))
        if any(q in h.lower() for h in haystacks if h):
            results.append(country)
    results.sort(
        key=lambda c: (
            not c.get("name", {}).get("common", "").lower().startswith(q),
            c.get("name", {}).get("common", ""),
        )
    )
    return results
