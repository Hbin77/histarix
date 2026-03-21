from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Country
from app.utils.country_mapping import ISO_TO_WIKIDATA, ISO_TO_NAME

async def seed_countries(session: AsyncSession) -> None:
    """Seed countries table if empty."""
    result = await session.execute(select(Country).limit(1))
    if result.scalar_one_or_none():
        return  # Already seeded

    for iso_code, name in ISO_TO_NAME.items():
        wikidata_id = ISO_TO_WIKIDATA.get(iso_code)
        country = Country(
            iso_a2=iso_code,
            name_en=name,
            wikidata_id=wikidata_id,
        )
        session.add(country)
    await session.commit()
