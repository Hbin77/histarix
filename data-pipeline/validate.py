"""Validate backend/app/data/chronicle/{ISO}.json against AUTHORING_SPEC.md.

Usage: validate.py ISO [ISO...] | --all
Bundle-dependent checks (QIDs, polity names, curated years) run only when
out/bundles/{ISO}.json exists.
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "backend/app/data/chronicle"
LANGS = ("en", "ko", "zh", "ja")
KINDS = {"state", "culture", "colonial", "period"}
CATS = {"politics", "war", "culture", "religion", "science", "economy", "society", "disaster"}
SMALL = {"EH", "NC", "PR", "GL", "SB", "VU", "BS", "TT", "FJ", "BN"}
SCRIPT = {"ko": re.compile(r"[가-힣]"), "ja": re.compile(r"[぀-ヿ一-鿿]"),
          "zh": re.compile(r"[一-鿿]")}


def check(iso):
    errs = []
    path = DATA / f"{iso}.json"
    if not path.exists():
        return [f"missing {path}"]
    try:
        d = json.load(open(path))
    except Exception as e:
        return [f"invalid JSON: {e}"]
    bpath = HERE / f"out/bundles/{iso}.json"
    b = json.load(open(bpath)) if bpath.exists() else None
    if b:
        known_q = {x["qid"] for k in ("states", "cultures", "wd_events") for x in b[k]} | \
                  {p["wikidata"] for p in b["polities"] if p.get("wikidata")}
        pol_names = {p["name"] for p in b["polities"]}
    if d.get("iso") != iso:
        errs.append("iso mismatch")

    def ml(obj, field, where, min_len):
        v = obj.get(field)
        if not isinstance(v, dict):
            errs.append(f"{where}: {field} not an object")
            return
        for l in LANGS:
            t = v.get(l)
            if not isinstance(t, str) or len(t.strip()) < min_len:
                errs.append(f"{where}: {field}.{l} missing/too short")
            elif l in SCRIPT and not SCRIPT[l].search(t):
                errs.append(f"{where}: {field}.{l} not in {l} script")

    cov = [False] * (2026 + 3000 + 1)
    for i, e in enumerate(d.get("eras", [])):
        w = f"era[{i}]"
        if not (isinstance(e.get("from"), int) and isinstance(e.get("to"), int)) or e["from"] > e["to"]:
            errs.append(f"{w}: bad from/to")
            continue
        if e.get("kind") not in KINDS:
            errs.append(f"{w}: bad kind {e.get('kind')}")
        if b and e.get("qid") and e["qid"] not in known_q:
            errs.append(f"{w}: qid {e['qid']} not in bundle")
        if b and e.get("polity") and e["polity"] not in pol_names:
            errs.append(f"{w}: polity '{e['polity']}' not in bundle")
        ml(e, "name", w, 2)
        ml(e, "summary", w, 30)
        for y in range(max(e["from"], -3000), min(e["to"], 2026) + 1):
            cov[y + 3000] = True
    gaps, start = [], None
    for i, c in enumerate(cov + [True]):
        y = i - 3000
        if not c and start is None:
            start = y
        if c and start is not None:
            gaps.append((start, y - 1))
            start = None
    gaps = [g for g in gaps if g != (0, 0)]  # year 0 does not exist
    if gaps:
        errs.append(f"era coverage gaps: {gaps[:8]}")

    events = d.get("events", [])
    for i, e in enumerate(events):
        w = f"event[{i}] ({e.get('year')})"
        if not isinstance(e.get("year"), int) or e["year"] == 0 or e["year"] > 2026:
            errs.append(f"{w}: bad year")
        if b and e.get("qid") and e["qid"] not in known_q:
            errs.append(f"{w}: qid {e['qid']} not in bundle")
        if e.get("importance") not in (1, 2, 3):
            errs.append(f"{w}: bad importance")
        if e.get("category") not in CATS:
            errs.append(f"{w}: bad category {e.get('category')}")
        ml(e, "title", w, 2)
        ml(e, "description", w, 40)
    # uninhabited / tiny territories have little recorded history
    target = {"AQ": 8, "TF": 10, "FK": 15}.get(iso, 25 if iso in SMALL else 40)
    if len(events) < target:
        errs.append(f"only {len(events)} events (< {target})")
    if b:
        missing = {c["year"] for c in b["curated"]} - {e.get("year") for e in events}
        if missing:
            errs.append(f"curated years missing: {sorted(missing)}")
    return errs


if __name__ == "__main__":
    isos = sys.argv[1:]
    if isos == ["--all"]:
        isos = sorted(p.stem for p in DATA.glob("*.json"))
    bad = 0
    for iso in isos:
        errs = check(iso)
        if errs:
            bad += 1
            print(f"{iso}: {len(errs)} problem(s)")
            for e in errs[:25]:
                print("  -", e)
        else:
            print(f"{iso}: OK")
    sys.exit(1 if bad else 0)
