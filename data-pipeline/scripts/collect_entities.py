"""Collect dated, geolocated Wikidata entities and attach them to modern ISO codes.

kind=cultures   archaeological cultures + historical periods (fills stateless eras)
kind=states     historical countries/states (fills polities Cliopatria lacks,
                e.g. Gojoseon) — label only, no polygon
Output: out/{kind}.json  {qid: {labels, descriptions, from, to, isos, sitelinks}}
"""
import json
import sys
from collections import defaultdict
from pathlib import Path

from shapely.geometry import Point

from geo import load_countries
from wd import entities, labels_of, sparql, year

ROOT = Path(__file__).resolve().parents[1]
kind = sys.argv[1]

CLASSES = {
    "cultures": "{ ?c wdt:P31/wdt:P279* wd:Q465299 } UNION { ?c wdt:P31 wd:Q11514315 }",
    "states": "{ ?c wdt:P31/wdt:P279* wd:Q3024240 } UNION { ?c wdt:P31 wd:Q1250464 } "
              "UNION { ?c wdt:P31 wd:Q417175 }",
}
Q = f"""
SELECT ?c ?start ?end ?coord ?iso ?sl WHERE {{
  {CLASSES[kind]}
  ?c wikibase:sitelinks ?sl .
  OPTIONAL {{ ?c wdt:P580|wdt:P571 ?start }}
  OPTIONAL {{ ?c wdt:P582|wdt:P576 ?end }}
  OPTIONAL {{ ?c wdt:P625 ?coord }}
  OPTIONAL {{ ?c wdt:P17|wdt:P495|wdt:P1366|wdt:P131 ?country . ?country wdt:P297 ?iso }}
}}"""

geoms, isos, _, tree = load_countries()
known = set(isos)

agg = defaultdict(lambda: {"from": None, "to": None, "isos": set(), "sl": 0})
for r in sparql(Q):
    qid = r["c"]["value"].rsplit("/", 1)[1]
    a = agg[qid]
    a["sl"] = int(r["sl"]["value"])
    if "start" in r and (y := year(r["start"])) is not None:
        a["from"] = y if a["from"] is None else min(a["from"], y)
    if "end" in r and (y := year(r["end"])) is not None:
        a["to"] = y if a["to"] is None else max(a["to"], y)
    if "iso" in r and r["iso"]["value"] in known:
        a["isos"].add(r["iso"]["value"])
    if "coord" in r and r["coord"]["value"].startswith("Point("):
        lon, lat = map(float, r["coord"]["value"][6:-1].split())
        pt = Point(lon, lat)
        for idx in tree.query(pt):
            if geoms[idx].contains(pt):
                a["isos"].add(isos[idx])

keep = {q: a for q, a in agg.items()
        if a["from"] is not None and a["isos"] and a["from"] <= 2026 and (a["to"] is None or a["to"] >= -3500)}
ents = entities(keep.keys(), props="labels|descriptions")
out = {}
for qid, a in keep.items():
    ent = ents.get(qid, {})
    labels = labels_of(ent)
    if "en" not in labels:
        continue
    desc = {k: v["value"] for k, v in ent.get("descriptions", {}).items() if k in ("en", "ko", "zh", "ja")}
    out[qid] = {"labels": labels, "descriptions": desc, "from": a["from"], "to": a["to"],
                "isos": sorted(a["isos"]), "sitelinks": a["sl"]}
json.dump(out, open(ROOT / f"out/{kind}.json", "w"), ensure_ascii=False, indent=1)
print(kind, "raw", len(agg), "kept", len(out))
