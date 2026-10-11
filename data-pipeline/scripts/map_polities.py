"""Map Cliopatria polity polygons onto modern countries.

For every (modern ISO, polity, year-span) records how much of the modern
country's territory the polity covered. Output: out/iso_polities.json
"""
import json
import sys
from collections import defaultdict
from pathlib import Path

from shapely import make_valid
from shapely.geometry import shape

from geo import load_countries

ROOT = Path(__file__).resolve().parents[1]
clio = json.load(open(ROOT / "raw/cliopatria.geojson"))["features"]
geoms, isos, _, tree = load_countries()
areas = [g.area for g in geoms]

out = defaultdict(list)
for i, f in enumerate(clio):
    p = f["properties"]
    g = make_valid(shape(f["geometry"]))
    if g.is_empty:
        continue
    for idx in tree.query(g):
        inter = g.intersection(geoms[idx]).area
        if inter <= 0:
            continue
        share_country = inter / areas[idx]
        # keep if it covers a meaningful part of the country, or if the
        # polity largely sits inside it (small states in big countries)
        if share_country >= 0.03 or inter / g.area >= 0.5:
            out[isos[idx]].append({"name": p["Name"], "wikidata": p["Wikidata"],
                                   "wikipedia": p["Wikipedia"], "from": p["FromYear"],
                                   "to": p["ToYear"], "share": round(share_country, 3)})
    if i % 2000 == 0:
        print(i, len(clio), file=sys.stderr)

for iso in out:
    out[iso].sort(key=lambda r: (r["from"], -r["share"]))
json.dump(out, open(ROOT / "out/iso_polities.json", "w"), ensure_ascii=False)
print("countries mapped", len(out), "of", len(isos))
