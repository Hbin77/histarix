import httpx

from app.config import settings


async def get_country_by_code(client: httpx.AsyncClient, iso_code: str) -> dict | None:
    try:
        resp = await client.get(
            f"{settings.rest_countries_api_url}/alpha/{iso_code}",
            timeout=10.0,
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        return data[0] if isinstance(data, list) else data
    except (httpx.HTTPError, ValueError, KeyError):
        return None


async def search_countries(client: httpx.AsyncClient, query: str) -> list[dict]:
    try:
        resp = await client.get(
            f"{settings.rest_countries_api_url}/name/{query}",
            timeout=10.0,
        )
        if resp.status_code != 200:
            return []
        data = resp.json()
        return data if isinstance(data, list) else []
    except (httpx.HTTPError, ValueError):
        return []
