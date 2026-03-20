from fastapi import APIRouter, HTTPException, Request

from app.cache import cached_or_fetch, event_cache
from app.schemas.history import HistoricalEvent
from app.services.wikidata import get_country_events
from app.utils.country_mapping import ISO_TO_WIKIDATA

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("/events", response_model=list[HistoricalEvent])
async def get_events(
    request: Request,
    country: str = "",
    year_from: int | None = None,
    year_to: int | None = None,
) -> list[HistoricalEvent]:
    if not country:
        raise HTTPException(status_code=400, detail="country parameter is required")
    code = country.upper()
    qid = ISO_TO_WIKIDATA.get(code)
    if not qid:
        raise HTTPException(status_code=404, detail="Country not in Wikidata mapping")
    client = request.app.state.http_client

    async def fetch() -> list[HistoricalEvent]:
        return await get_country_events(client, qid)

    events: list[HistoricalEvent] = await cached_or_fetch(
        event_cache, f"events:{code}", fetch
    )

    if year_from is not None or year_to is not None:
        filtered: list[HistoricalEvent] = []
        for e in events:
            if not e.date:
                continue
            try:
                year = int(e.date[:4])
            except ValueError:
                continue
            if year_from is not None and year < year_from:
                continue
            if year_to is not None and year > year_to:
                continue
            filtered.append(e)
        return filtered

    return events
