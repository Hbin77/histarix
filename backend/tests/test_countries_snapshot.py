import asyncio

from app.services.rest_countries import get_country_by_code, search_countries


def test_lookup_by_alpha2() -> None:
    data = asyncio.run(get_country_by_code(None, "FR"))  # type: ignore[arg-type]
    assert data is not None
    assert data["name"]["common"] == "France"
    assert data["capital"] == ["Paris"]
    assert data["population"] > 0
    assert data["flags"]["svg"].startswith("https://")


def test_lookup_by_alpha3_and_case() -> None:
    data = asyncio.run(get_country_by_code(None, "kor"))  # type: ignore[arg-type]
    assert data is not None
    assert data["cca2"] == "KR"


def test_search_by_name_and_translation() -> None:
    by_name = asyncio.run(search_countries(None, "franc"))  # type: ignore[arg-type]
    assert any(c["cca2"] == "FR" for c in by_name)
    # Korean translation ("프랑스") must also match
    by_korean = asyncio.run(search_countries(None, "프랑스"))  # type: ignore[arg-type]
    assert any(c["cca2"] == "FR" for c in by_korean)


def test_search_ranking_prefers_prefix() -> None:
    results = asyncio.run(search_countries(None, "in"))  # type: ignore[arg-type]
    assert results, "substring search should return results"
    assert results[0]["name"]["common"].lower().startswith("in")
