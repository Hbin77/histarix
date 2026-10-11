"""Per-country chronicle: eras + year-by-year events (en/ko/zh/ja).

One JSON file per modern country in app/data/chronicle/{ISO}.json, built by
data-pipeline/ (see data-pipeline/AUTHORING_SPEC.md). The territory is the
modern country's land; eras cover every year from 3000 BC to 2026 with no
gaps, so any year on the time slider resolves to at least one era.
"""

import json
import logging
from functools import lru_cache
from pathlib import Path

from app.schemas.history import Chronicle, ChronicleEra, ChronicleEvent

logger = logging.getLogger("histarix")

_DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "chronicle"

LANGS = ("en", "ko", "zh", "ja")


# bounded: the full dataset is ~38MB of JSON, far more as Python objects
@lru_cache(maxsize=64)
def _load(iso: str) -> dict | None:
    path = _DATA_DIR / f"{iso}.json"
    if not path.exists():
        return None
    try:
        with path.open(encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:  # malformed file must not take the endpoint down
        logger.warning("chronicle %s unreadable: %s", iso, e)
        return None


@lru_cache(maxsize=256)
def get_chronicle(iso: str, lang: str = "en") -> Chronicle | None:
    """Chronicle for a country in the requested language, or None if no file."""
    raw = _load(iso.upper())
    if raw is None:
        return None
    lang = lang if lang in LANGS else "en"
    try:
        return _localize(iso.upper(), raw, lang)
    except (KeyError, TypeError, ValueError) as e:  # malformed entry: 404, not 500
        logger.warning("chronicle %s malformed: %s", iso, e)
        return None


def _localize(iso: str, raw: dict, lang: str) -> Chronicle:
    def pick(field: dict) -> str:
        return field.get(lang) or field.get("en", "")

    eras = [
        ChronicleEra(
            from_year=e["from"],
            to_year=e["to"],
            kind=e["kind"],
            polity=e.get("polity"),
            name=pick(e["name"]),
            summary=pick(e["summary"]),
        )
        for e in sorted(raw["eras"], key=lambda e: (e["from"], e["to"]))
    ]
    events = [
        ChronicleEvent(
            year=e["year"],
            importance=e["importance"],
            category=e["category"],
            wikidata_id=e.get("qid"),
            title=pick(e["title"]),
            description=pick(e["description"]),
        )
        for e in sorted(raw["events"], key=lambda e: (e["year"], e["importance"]))
    ]
    return Chronicle(iso_code=iso, eras=eras, events=events)
