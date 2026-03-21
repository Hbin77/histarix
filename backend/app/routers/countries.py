import logging
import re

from fastapi import APIRouter, HTTPException, Query, Request
from sqlalchemy import select

from app.cache import cached_or_fetch, COUNTRY_TTL, EVENT_TTL
from app.database import async_session
from app.models import HistoricalEvent as EventModel
from app.schemas.country import CountryBasic, CountryInfo
from app.schemas.history import CountryHistory, HistoricalEvent
from app.services.rest_countries import get_country_by_code, search_countries
from app.services.wikidata import get_country_events
from app.services.wikipedia import get_country_summary
from app.utils.country_mapping import ISO_TO_NAME, ISO_TO_WIKIDATA
from app.utils.mappers import db_event_to_schema

logger = logging.getLogger("histarix")
_ISO_PATTERN = re.compile(r"^[A-Z]{2,3}$")

router = APIRouter(prefix="/api/countries", tags=["countries"])


@router.get("/search", response_model=list[CountryBasic])
async def search_countries_endpoint(request: Request, q: str = Query("", max_length=100)) -> list[CountryBasic]:
    if not q or len(q) < 2:
        return []
    client = request.app.state.http_client
    results = await search_countries(client, q)
    countries: list[CountryBasic] = []
    for c in results[:20]:
        name = c.get("name", {})
        cca2 = c.get("cca2", "")
        flag = c.get("flag", "")
        region = c.get("region", "")
        common_name = name.get("common", "") if isinstance(name, dict) else str(name)
        countries.append(
            CountryBasic(name=common_name, iso_code=cca2, flag=flag, region=region)
        )
    return countries


@router.get("/{iso_code}", response_model=CountryInfo)
async def get_country(request: Request, iso_code: str) -> CountryInfo:
    code = iso_code.upper()
    if not _ISO_PATTERN.match(code):
        raise HTTPException(status_code=400, detail="Invalid ISO code")
    client = request.app.state.http_client

    async def fetch() -> CountryInfo:
        data = await get_country_by_code(client, code)
        if not data:
            raise HTTPException(status_code=404, detail="Country not found")
        name_data = data.get("name", {})
        common_name = name_data.get("common", "")
        official_name = name_data.get("official", "")
        wiki = await get_country_summary(client, common_name)
        flag = ""
        flags = data.get("flags", {})
        if isinstance(flags, dict):
            flag = flags.get("svg", flags.get("png", ""))
        coat_of_arms = ""
        coa = data.get("coatOfArms", {})
        if isinstance(coa, dict):
            coat_of_arms = coa.get("svg", coa.get("png", ""))
        map_url = ""
        maps = data.get("maps", {})
        if isinstance(maps, dict):
            map_url = maps.get("googleMaps", "")
        return CountryInfo(
            name=common_name,
            official_name=official_name,
            iso_code=code,
            capital=data.get("capital", []),
            region=data.get("region", ""),
            subregion=data.get("subregion", ""),
            population=data.get("population", 0),
            area=data.get("area", 0.0),
            languages=data.get("languages", {}),
            currencies=data.get("currencies", {}),
            flag=flag,
            coat_of_arms=coat_of_arms,
            map_url=map_url,
            latlng=data.get("latlng", []),
            wikipedia_summary=wiki.get("extract", ""),
            wikipedia_thumbnail=wiki.get("thumbnail", ""),
        )

    return await cached_or_fetch("country", code, fetch, COUNTRY_TTL)


@router.get("/{iso_code}/history", response_model=CountryHistory)
async def get_country_history(request: Request, iso_code: str) -> CountryHistory:
    code = iso_code.upper()
    if not _ISO_PATTERN.match(code):
        raise HTTPException(status_code=400, detail="Invalid ISO code")
    qid = ISO_TO_WIKIDATA.get(code)
    country_name = ISO_TO_NAME.get(code, code)
    if not qid:
        raise HTTPException(
            status_code=404, detail="Country not found in Wikidata mapping"
        )
    client = request.app.state.http_client

    async def fetch() -> CountryHistory:
        # Try DB first
        async with async_session() as db:
            result = await db.execute(
                select(EventModel)
                .where(EventModel.country_iso == code)
                .order_by(EventModel.year)
            )
            db_events = result.scalars().all()

        if db_events:
            events = [db_event_to_schema(e) for e in db_events]
        else:
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

        return CountryHistory(country_name=country_name, iso_code=code, events=events)

    return await cached_or_fetch("event", code, fetch, EVENT_TTL)
