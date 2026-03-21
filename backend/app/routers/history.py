from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import select

from app.cache import cached_or_fetch, EVENT_TTL
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
        # Try DB first
        from app.database import async_session
        from app.models import HistoricalEvent as EventModel

        async with async_session() as db:
            query = select(EventModel).where(EventModel.country_iso == code)
            if year_from is not None:
                query = query.where(EventModel.year >= year_from)
            if year_to is not None:
                query = query.where(EventModel.year <= year_to)
            query = query.order_by(EventModel.year)
            result = await db.execute(query)
            db_events = result.scalars().all()

        if db_events:
            return [
                HistoricalEvent(
                    label=e.title,
                    description=e.description or "",
                    date=e.date or "",
                    wikidata_id=e.wikidata_id or "",
                    year=e.year,
                )
                for e in db_events
            ]

        # Fallback to Wikidata
        return await get_country_events(client, qid)

    # When filtering by year, use a unique cache key
    cache_suffix = code
    if year_from is not None or year_to is not None:
        cache_suffix = f"{code}:{year_from or ''}:{year_to or ''}"

    events: list[HistoricalEvent] = await cached_or_fetch(
        "events", cache_suffix, fetch, EVENT_TTL
    )

    return events
