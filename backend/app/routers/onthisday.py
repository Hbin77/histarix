from datetime import date

from fastapi import APIRouter, Path, Request

from app.cache import cached_or_fetch, ONTHISDAY_TTL
from app.schemas.onthisday import OnThisDayResponse
from app.services.wikimedia import get_on_this_day

router = APIRouter(prefix="/api/onthisday", tags=["onthisday"])


@router.get("", response_model=OnThisDayResponse)
async def on_this_day_today(request: Request, lang: str = "en") -> OnThisDayResponse:
    client = request.app.state.http_client
    today = date.today()
    safe_lang = lang if lang in ("ko", "en", "zh", "ja") else "en"
    key = f"today:{today.isoformat()}:{safe_lang}"

    async def fetch() -> OnThisDayResponse:
        return await get_on_this_day(client, lang=safe_lang)

    return await cached_or_fetch("onthisday", key, fetch, ONTHISDAY_TTL)


@router.get("/{month}/{day}", response_model=OnThisDayResponse)
async def on_this_day(
    request: Request,
    month: int = Path(ge=1, le=12),
    day: int = Path(ge=1, le=31),
    lang: str = "en",
) -> OnThisDayResponse:
    client = request.app.state.http_client
    safe_lang = lang if lang in ("ko", "en", "zh", "ja") else "en"
    key = f"{month:02d}-{day:02d}:{safe_lang}"

    async def fetch() -> OnThisDayResponse:
        return await get_on_this_day(client, month, day, safe_lang)

    return await cached_or_fetch("onthisday", key, fetch, ONTHISDAY_TTL)
