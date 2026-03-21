import re

import httpx

from app.config import settings
from app.schemas.history import HistoricalEvent

_QID_PATTERN = re.compile(r"^Q\d+$")

SPARQL_TEMPLATE = """
SELECT DISTINCT ?event ?eventLabel ?date ?description WHERE {{
  ?event wdt:P17 wd:{qid} .
  {{ ?event wdt:P31/wdt:P279* wd:Q1190554 . }}
  UNION {{ ?event wdt:P31/wdt:P279* wd:Q178561 . }}
  UNION {{ ?event wdt:P31/wdt:P279* wd:Q198 . }}
  UNION {{ ?event wdt:P31/wdt:P279* wd:Q82414 . }}
  UNION {{ ?event wdt:P31 wd:Q13418847 . }}
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "{lang}") }}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "{lang},en" }}
}} ORDER BY ?date LIMIT 50
"""


async def get_country_events(
    client: httpx.AsyncClient, qid: str, lang: str = "en"
) -> list[HistoricalEvent]:
    if not _QID_PATTERN.match(qid):
        return []
    safe_lang = lang if lang in ("ko", "en", "zh", "ja") else "en"
    query = SPARQL_TEMPLATE.format(qid=qid, lang=safe_lang)
    try:
        resp = await client.get(
            settings.wikidata_api_url,
            params={"query": query, "format": "json"},
            headers={
                "Accept": "application/sparql-results+json",
                "User-Agent": settings.wikipedia_user_agent,
            },
            timeout=10.0,
        )
        if resp.status_code != 200:
            return []
        data = resp.json()
        results = data.get("results", {}).get("bindings", [])
        events: list[HistoricalEvent] = []
        seen: set[str] = set()
        for row in results:
            event_uri = row.get("event", {}).get("value", "")
            wikidata_id = event_uri.split("/")[-1] if event_uri else ""
            if wikidata_id in seen:
                continue
            seen.add(wikidata_id)
            label = row.get("eventLabel", {}).get("value", "")
            date_val = row.get("date", {}).get("value", "")
            desc = row.get("description", {}).get("value", "")
            year_val = None
            if date_val:
                try:
                    if date_val.startswith("-"):
                        year_val = -int(date_val[1:5].lstrip("0") or "0")
                    else:
                        year_str = date_val[:4].lstrip("0") or "0"
                        year_val = int(year_str)
                except ValueError:
                    pass
            events.append(
                HistoricalEvent(
                    label=label,
                    date=date_val[:10] if date_val else "",
                    year=year_val,
                    description=desc,
                    wikidata_id=wikidata_id,
                )
            )
        return events
    except (httpx.HTTPError, ValueError, KeyError):
        return []
