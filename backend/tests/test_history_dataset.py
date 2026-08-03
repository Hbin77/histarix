import json
import re
from pathlib import Path

from app.services.history_dataset import get_dataset_events

DATA_DIR = Path(__file__).resolve().parent.parent / "app" / "data" / "history"
HANGUL = re.compile(r"[가-힣]")


def test_dataset_files_parse_and_localize() -> None:
    files = sorted(DATA_DIR.glob("*.json"))
    assert files, "history dataset must ship at least one country file"
    for path in files:
        data = json.load(path.open(encoding="utf-8"))
        assert len(data["events"]) >= 10, path.name
        iso = path.stem
        ko = get_dataset_events(iso, "ko")
        assert ko and all(e.label for e in ko), iso
        assert any(HANGUL.search(e.label + e.description) for e in ko), (
            f"{iso}: Korean output lacks Hangul"
        )
        years = [e.year for e in ko]
        assert years == sorted(years), f"{iso}: not chronological"


def test_missing_country_returns_none() -> None:
    assert get_dataset_events("ZZ", "ko") is None


def test_unknown_lang_falls_back_to_english() -> None:
    files = sorted(DATA_DIR.glob("*.json"))
    if not files:
        return
    iso = files[0].stem
    events = get_dataset_events(iso, "xx")
    assert events and events[0].label
