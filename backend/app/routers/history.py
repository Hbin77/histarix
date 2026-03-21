import logging
import re

from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import select

from app.cache import cached_or_fetch, EVENT_TTL
from app.database import async_session
from app.models import HistoricalEvent as EventModel
from app.schemas.history import HistoricalEvent
from app.services.wikidata import get_country_events
from app.utils.country_mapping import ISO_TO_WIKIDATA
from app.utils.mappers import db_event_to_schema

logger = logging.getLogger("histarix")
_ISO_PATTERN = re.compile(r"^[A-Z]{2,3}$")

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
    if not _ISO_PATTERN.match(code):
        raise HTTPException(status_code=400, detail="Invalid country code")
    qid = ISO_TO_WIKIDATA.get(code)
    if not qid:
        raise HTTPException(status_code=404, detail="Country not in Wikidata mapping")
    client = request.app.state.http_client

    async def fetch() -> list[HistoricalEvent]:
        # Try DB first
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
            return [db_event_to_schema(e) for e in db_events]

        # Fallback to Wikidata
        events = await get_country_events(client, qid)
        # Persist to DB for future requests
        try:
            async with async_session() as db:
                for ev in events:
                    db_event = EventModel(
                        title=ev.label,
                        description=ev.description,
                        year=ev.year,
                        date=ev.date,
                        country_iso=code,
                        category="wikidata",
                        importance=1,
                        wikidata_id=ev.wikidata_id,
                    )
                    db.add(db_event)
                await db.commit()
            logger.info("Persisted %d Wikidata events for %s", len(events), code)
        except Exception as e:
            logger.warning("Failed to persist Wikidata events for %s: %s", code, e)
        return events

    # When filtering by year, use a unique cache key
    cache_suffix = code
    if year_from is not None or year_to is not None:
        cache_suffix = f"{code}:{year_from or ''}:{year_to or ''}"

    events: list[HistoricalEvent] = await cached_or_fetch(
        "events", cache_suffix, fetch, EVENT_TTL
    )

    return events
