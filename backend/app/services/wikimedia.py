from datetime import date

import httpx

from app.config import settings
from app.schemas.onthisday import OnThisDayEvent, OnThisDayResponse, RelatedPage


async def get_on_this_day(
    client: httpx.AsyncClient,
    month: int | None = None,
    day: int | None = None,
    lang: str = "en",
) -> OnThisDayResponse:
    today = date.today()
    m = month or today.month
    d = day or today.day
    safe_lang = lang if lang in ("ko", "en", "zh", "ja") else "en"

    async def _fetch_otd(fetch_lang: str) -> list:
        base = f"https://api.wikimedia.org/feed/v1/wikipedia/{fetch_lang}/onthisday"
        u = f"{base}/all/{m:02d}/{d:02d}"
        try:
            r = await client.get(u, headers={"User-Agent": settings.wikipedia_user_agent}, timeout=10.0)
            if r.status_code != 200:
                return []
            dd = r.json()
            return dd.get("selected", []) + dd.get("events", [])
        except Exception:
            return []

    raw_events = await _fetch_otd(safe_lang)
    # Fallback to English if target language has no data (ko, ja often empty)
    if not raw_events and safe_lang != "en":
        raw_events = await _fetch_otd("en")

    try:
        events: list[OnThisDayEvent] = []
        for item in raw_events:
            pages: list[RelatedPage] = []
            for p in item.get("pages", []):
                thumbnail_url = ""
                if "thumbnail" in p:
                    thumbnail_url = p["thumbnail"].get("source", "")
                content_url = ""
                if "content_urls" in p and "desktop" in p["content_urls"]:
                    content_url = p["content_urls"]["desktop"].get("page", "")
                pages.append(
                    RelatedPage(
                        title=p.get("title", ""),
                        description=p.get("description", ""),
                        thumbnail_url=thumbnail_url,
                        content_url=content_url,
                    )
                )
            events.append(
                OnThisDayEvent(
                    text=item.get("text", ""),
                    year=item.get("year"),
                    pages=pages,
                )
            )
        return OnThisDayResponse(date=f"{m:02d}-{d:02d}", events=events)
    except (httpx.HTTPError, ValueError):
        return OnThisDayResponse(date=f"{m:02d}-{d:02d}", events=[])
