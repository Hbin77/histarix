from urllib.parse import quote

import httpx

from app.config import settings


async def get_country_summary(
    client: httpx.AsyncClient, country_name: str, lang: str = "en"
) -> dict[str, str]:
    safe_lang = lang if lang in ("ko", "en", "zh", "ja") else "en"
    base_url = f"https://{safe_lang}.wikipedia.org/api/rest_v1"
    try:
        resp = await client.get(
            f"{base_url}/page/summary/{quote(country_name, safe='')}",
            timeout=10.0,
        )
        if resp.status_code != 200:
            return {"extract": "", "thumbnail": ""}
        data = resp.json()
        extract = data.get("extract", "")
        thumbnail = ""
        if "thumbnail" in data:
            thumbnail = data["thumbnail"].get("source", "")
        return {"extract": extract, "thumbnail": thumbnail}
    except (httpx.HTTPError, ValueError):
        return {"extract": "", "thumbnail": ""}
