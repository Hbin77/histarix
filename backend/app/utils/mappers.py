from app.models import HistoricalEvent as EventModel
from app.schemas.history import HistoricalEvent


def db_event_to_schema(event: EventModel) -> HistoricalEvent:
    return HistoricalEvent(
        label=event.title,
        description=event.description or "",
        date=event.date or "",
        year=event.year,
        wikidata_id=event.wikidata_id or "",
    )
