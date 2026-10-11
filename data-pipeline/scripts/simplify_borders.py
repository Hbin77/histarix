"""Simplify Cliopatria polygons for the web globe, split into century buckets.

Writes to out/borders/:
  polities.json   {name: {"wikidata", "labels": {en,ko,zh,ja}}}   (labels from out/polity_names.json)
  {bucket}.json   [{"p": name, "from": y, "to": y, "g": [[[lon,lat],...], ...]}]
                  every shape alive at any year in [bucket, bucket+99]
Overlay entries ("(…)" names) are dropped — they duplicate a real polity's land.
Usage: simplify_borders.py [tolerance=0.1]
"""
import json
import sys
from pathlib import Path

from shapely import make_valid
from shapely.geometry import MultiPolygon, Polygon, shape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out/borders"
OUT.mkdir(parents=True, exist_ok=True)
tol = float(sys.argv[1]) if len(sys.argv) > 1 else 0.1
labels = json.load(open(ROOT / "out/polity_names.json"))
wikidata = {n: v["wikidata"] for n, v in json.load(open(ROOT / "out/polity_labels.json")).items()}


def rings(g):
    out = []
    for p in (g.geoms if isinstance(g, MultiPolygon) else [g]):
        if not isinstance(p, Polygon) or p.is_empty or p.area < tol * tol:
            continue
        out.append([[[round(x, 2), round(y, 2)] for x, y in p.exterior.coords]] +
                   [[[round(x, 2), round(y, 2)] for x, y in r.coords] for r in p.interiors])
    return out


shapes, used = [], set()
for f in json.load(open(ROOT / "raw/cliopatria.geojson"))["features"]:
    p = f["properties"]
    if p["Name"].startswith("("):
        continue
    g = make_valid(shape(f["geometry"])).simplify(tol, preserve_topology=True)
    if g.geom_type == "GeometryCollection":
        g = MultiPolygon([x for x in g.geoms if isinstance(x, Polygon)])
    r = rings(g)
    if r:
        shapes.append({"p": p["Name"], "from": p["FromYear"], "to": p["ToYear"], "g": r})
        used.add(p["Name"])

json.dump({"source": "Cliopatria v0.2.1 (Seshat Global History Databank), CC BY 4.0",
           "polities": {n: {"wikidata": wikidata.get(n), "labels": labels[n]} for n in sorted(used)}},
          open(OUT / "polities.json", "w"), ensure_ascii=False, separators=(",", ":"))
start = min(s["from"] for s in shapes) // 100 * 100
for b in range(start, 2100, 100):
    part = sorted((s for s in shapes if s["from"] <= b + 99 and s["to"] >= b), key=lambda s: s["from"])
    json.dump(part, open(OUT / f"{b}.json", "w"), separators=(",", ":"))
print("shapes", len(shapes), "polities", len(used), "buckets from", start)
