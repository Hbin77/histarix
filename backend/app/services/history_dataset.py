"""Curated multilingual history dataset (en/ko/zh/ja).

One JSON file per country in app/data/history/{ISO}.json:

    {"events": [{"year": -2333, "importance": 1,
                 "title": {"en": ..., "ko": ..., "zh": ..., "ja": ...},
                 "description": {...}}]}

This is the primary source for country history — authored and reviewed
content in the user's language, no external API, no cold latency. The
DB-seed/Wikidata paths remain only as fallback for countries without a
dataset file.
"""

import json
import logging
from functools import lru_cache
from pathlib import Path

from app.schemas.history import HistoricalEvent

logger = logging.getLogger("histarix")

_DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "history"

LANGS = ("en", "ko", "zh", "ja")


@lru_cache(maxsize=None)
def _load(iso: str) -> list[dict] | None:
    path = _DATA_DIR / f"{iso}.json"
    if not path.exists():
        return None
    try:
        with path.open(encoding="utf-8") as f:
            return json.load(f)["events"]
    except Exception as e:  # malformed file must not take the endpoint down
        logger.warning("history dataset %s unreadable: %s", iso, e)
        return None


def _format_year(year: int) -> str:
    return str(year) if year < 0 else f"{year:04d}"


def get_dataset_events(iso: str, lang: str = "en") -> list[HistoricalEvent] | None:
    """Events for a country in the requested language, or None if no file."""
    raw = _load(iso.upper())
    if raw is None:
        return None
    lang = lang if lang in LANGS else "en"
    events = []
    for e in raw:
        title = e.get("title", {})
        description = e.get("description", {})
        events.append(
            HistoricalEvent(
                label=title.get(lang) or title.get("en", ""),
                description=description.get(lang) or description.get("en", ""),
                date=_format_year(e["year"]),
                year=e["year"],
            )
        )
    return events
