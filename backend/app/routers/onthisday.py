from datetime import date

from fastapi import APIRouter, Path, Request

from app.cache import cached_or_fetch, onthisday_cache
from app.schemas.onthisday import OnThisDayResponse
from app.services.wikimedia import get_on_this_day

router = APIRouter(prefix="/api/onthisday", tags=["onthisday"])


@router.get("", response_model=OnThisDayResponse)
async def on_this_day_today(request: Request) -> OnThisDayResponse:
    client = request.app.state.http_client
    today = date.today()
    key = f"today:{today.isoformat()}"

    async def fetch() -> OnThisDayResponse:
        return await get_on_this_day(client)

    return await cached_or_fetch(onthisday_cache, key, fetch)


@router.get("/{month}/{day}", response_model=OnThisDayResponse)
async def on_this_day(
    request: Request,
    month: int = Path(ge=1, le=12),
    day: int = Path(ge=1, le=31),
) -> OnThisDayResponse:
    client = request.app.state.http_client
    key = f"{month:02d}-{day:02d}"

    async def fetch() -> OnThisDayResponse:
        return await get_on_this_day(client, month, day)

    return await cached_or_fetch(onthisday_cache, key, fetch)
