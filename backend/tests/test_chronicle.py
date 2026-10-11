import json
import re
from pathlib import Path

from app.services.chronicle import get_chronicle

DATA_DIR = Path(__file__).resolve().parent.parent / "app" / "data" / "chronicle"
HANGUL = re.compile(r"[가-힣]")


def test_every_chronicle_covers_the_slider_range() -> None:
    files = sorted(DATA_DIR.glob("*.json"))
    assert len(files) >= 170
    for path in files:
        raw = json.load(path.open(encoding="utf-8"))
        covered = set()
        for era in raw["eras"]:
            covered.update(range(max(era["from"], -3000), min(era["to"], 2026) + 1))
        missing = set(range(-3000, 2027)) - covered - {0}
        assert not missing, f"{path.stem}: years without an era, e.g. {min(missing)}"
        assert all(e["year"] != 0 for e in raw["events"]), path.stem


def test_chronicle_is_localized_and_sorted() -> None:
    kr = get_chronicle("KR", "ko")
    assert kr and kr.eras and kr.events
    assert all(HANGUL.search(e.title) for e in kr.events)
    years = [e.year for e in kr.events]
    assert years == sorted(years)
    assert [e.from_year for e in kr.eras] == sorted(e.from_year for e in kr.eras)


def test_unknown_lang_falls_back_to_english() -> None:
    assert get_chronicle("KR", "xx").events[0].title == get_chronicle("KR", "en").events[0].title


def test_chronicle_endpoint(client) -> None:
    res = client.get("/api/countries/kr/chronicle?lang=ja")
    assert res.status_code == 200
    body = res.json()
    assert body["iso_code"] == "KR" and body["eras"][0]["from_year"] <= -3000
    assert client.get("/api/countries/ZZ/chronicle").status_code == 404
    assert client.get("/api/countries/k1/chronicle").status_code == 400
