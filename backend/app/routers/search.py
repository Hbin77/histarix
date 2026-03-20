from fastapi import APIRouter, Request

from app.schemas.country import CountryBasic
from app.services.rest_countries import search_countries

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=list[CountryBasic])
async def search(request: Request, q: str = "") -> list[CountryBasic]:
    if not q or len(q) < 2:
        return []
    client = request.app.state.http_client
    results = await search_countries(client, q)
    countries: list[CountryBasic] = []
    for c in results[:20]:
        name = c.get("name", {})
        common_name = name.get("common", "") if isinstance(name, dict) else str(name)
        countries.append(
            CountryBasic(
                name=common_name,
                iso_code=c.get("cca2", ""),
                flag=c.get("flag", ""),
                region=c.get("region", ""),
            )
        )
    return countries
