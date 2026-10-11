"""Dated historical events per modern country from Wikidata (CC0).

Per country: items with country (P17) = that country, a point in time (P585)
or start time (P580), at least MIN_SL sitelinks. Sports, creative works,
organizations etc. are dropped afterwards by type.
Usage: collect_events.py [ISO ...]   (default: all)   Output: out/events/{ISO}.json
"""
import json
import sys
import time
from pathlib import Path

from geo import load_countries
from wd import entities, labels_of, sparql, year

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out/events"
OUT.mkdir(parents=True, exist_ok=True)
MIN_SL = 3

isos = sys.argv[1:] or load_countries()[1]

rows = sparql("SELECT ?c ?iso WHERE { ?c wdt:P297 ?iso . ?c wdt:P31 ?t . "
              "VALUES ?t { wd:Q6256 wd:Q3624078 wd:Q15634554 wd:Q161243 wd:Q46395 wd:Q1763527 wd:Q779415 } }")
qid_of = {}
for r in rows:
    qid_of.setdefault(r["iso"]["value"], r["c"]["value"].rsplit("/", 1)[1])

# types we never want as "history events"
BAD_ROOTS = ["Q16510064",  # sporting event
             "Q27020041",  # sports season
             "Q17537576",  # creative work
             "Q5",         # human
             "Q2188189",   # musical work
             "Q132241",    # festival
             "Q15275719",  # recurring event
             "Q57733494",  # badminton event
             "Q46190676",  # tennis event
             "Q500834",    # tournament
             "Q43229",     # organization (universities, companies, parties)
             "Q8142",      # currency
             "Q1197685",   # public holiday
             "Q16521",     # taxon
             "Q4167410",   # disambiguation
             "Q13406463",  # list article
             ]
_bad_cache = {}


def bad_types(types):
    """Which of these type QIDs fall under a BAD_ROOT (cached across countries)."""
    todo = [t for t in types if t not in _bad_cache]
    for i in range(0, len(todo), 200):
        chunk = todo[i:i + 200]
        rows = sparql("SELECT DISTINCT ?t WHERE { VALUES ?t { %s } VALUES ?bad { %s } ?t wdt:P279* ?bad }"
                      % (" ".join("wd:" + t for t in chunk), " ".join("wd:" + b for b in BAD_ROOTS)))
        hit = {r["t"]["value"].rsplit("/", 1)[1] for r in rows}
        for t in chunk:
            _bad_cache[t] = t in hit or t in BAD_ROOTS
    return {t for t in types if _bad_cache[t]}


for iso in isos:
    path = OUT / f"{iso}.json"
    if path.exists() or iso not in qid_of:
        continue
    q = f"""
SELECT ?e ?d ?sl (GROUP_CONCAT(DISTINCT STRAFTER(STR(?t), "entity/")) AS ?types) WHERE {{
  ?e wdt:P17 wd:{qid_of[iso]} ; wdt:P585|wdt:P580 ?d ; wikibase:sitelinks ?sl ; wdt:P31 ?t .
  FILTER(?sl >= {MIN_SL})
}} GROUP BY ?e ?d ?sl"""
    try:
        res = sparql(q)
    except RuntimeError:
        # very large countries time out: retry keeping only better-known items
        try:
            res = sparql(q.replace(f"?sl >= {MIN_SL}", "?sl >= 10"))
        except RuntimeError as e:
            print(iso, "FAILED", e, flush=True)
            continue
    ev = {}
    for r in res:
        qid = r["e"]["value"].rsplit("/", 1)[1]
        y = year(r["d"])
        if y is None or y > 2026:
            continue
        cur = ev.get(qid)
        if cur is None or y < cur["year"]:
            ev[qid] = {"qid": qid, "year": y, "sitelinks": int(r["sl"]["value"]),
                       "types": r["types"]["value"].split()}
    bad = bad_types({t for e in ev.values() for t in e["types"]})
    ev = {q: e for q, e in ev.items() if not bad.intersection(e["types"])}
    ents = entities(ev.keys(), props="labels|descriptions")
    for qid, e in ev.items():
        ent = ents.get(qid, {})
        e["labels"] = labels_of(ent)
        e["descriptions"] = {k: v["value"] for k, v in ent.get("descriptions", {}).items()
                             if k in ("en", "ko", "zh", "ja")}
    out = sorted((e for e in ev.values() if "en" in e["labels"]), key=lambda e: e["year"])
    json.dump(out, open(path, "w"), ensure_ascii=False)
    print(iso, len(out), flush=True)
    time.sleep(1)
