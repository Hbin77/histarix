import re

import httpx

from app.config import settings
from app.schemas.history import HistoricalEvent

_QID_PATTERN = re.compile(r"^Q\d+$")

SPARQL_TEMPLATE = """
SELECT DISTINCT ?event ?eventLabel ?date ?description WHERE {{
  {{ ?event wdt:P17 wd:{qid} ; wdt:P31/wdt:P279* wd:Q1190554 . }}
  UNION {{ ?event wdt:P17 wd:{qid} ; wdt:P31/wdt:P279* wd:Q178561 . }}
  UNION {{ ?event wdt:P17 wd:{qid} ; wdt:P31/wdt:P279* wd:Q198 . }}
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,ko" }}
}} ORDER BY ?date LIMIT 50
"""


async def get_country_events(
    client: httpx.AsyncClient, qid: str
) -> list[HistoricalEvent]:
    if not _QID_PATTERN.match(qid):
        return []
    query = SPARQL_TEMPLATE.format(qid=qid)
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
            events.append(
                HistoricalEvent(
                    label=label,
                    date=date_val[:10] if date_val else "",
                    description=desc,
                    wikidata_id=wikidata_id,
                )
            )
        return events
    except (httpx.HTTPError, ValueError, KeyError):
        return []
