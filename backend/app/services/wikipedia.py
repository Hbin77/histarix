from urllib.parse import quote

import httpx

from app.config import settings


async def get_country_summary(
    client: httpx.AsyncClient, country_name: str
) -> dict[str, str]:
    try:
        resp = await client.get(
            f"{settings.wikipedia_api_url}/page/summary/{quote(country_name, safe='')}",
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
