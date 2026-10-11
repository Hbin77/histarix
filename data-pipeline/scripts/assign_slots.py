"""Give every Cliopatria polity one of the globe's 6 palette slots.

Two polities are neighbours when any of their shapes exist at the same time and
touch (within ~0.2°). Greedy colouring, most-constrained first; a collision
that the palette cannot avoid goes to the neighbour with the least shared time.
One slot per polity for all years keeps a polity's colour stable while the
time slider plays (MASTER.md: adjacent polities never share a slot).

Reads out/borders/{bucket}.json, writes out/borders/slots.json {name: slot}.
"""
import json
from collections import defaultdict
from pathlib import Path

from shapely import STRtree
from shapely.geometry import MultiPolygon, Polygon

ROOT = Path(__file__).resolve().parents[1]
BORDERS = ROOT / "out/borders"
SLOTS = 6
# each polity starts from a name hash so reruns give the same colours

GRAPH = ROOT / "out/polity_neighbours.json"  # cache: the spatial join takes minutes


def build_graph():
    shapes = {}
    for f in BORDERS.glob("*.json"):
        if not f.stem.lstrip("-").isdigit():
            continue
        for s in json.load(open(f)):
            key = (s["p"], s["from"], s["to"], json.dumps(s["g"][0][0][:3]))
            if key not in shapes:
                polys = [Polygon(p[0], p[1:]) for p in s["g"] if len(p[0]) >= 4]
                shapes[key] = (s["p"], s["from"], s["to"], MultiPolygon(polys).buffer(0.1))
    items = list(shapes.values())
    tree = STRtree([g for *_, g in items])
    shared = defaultdict(int)  # (a, b) -> years both exist while touching
    for i, (p, a0, a1, g) in enumerate(items):
        for j in tree.query(g, predicate="intersects"):
            q, b0, b1, _ = items[j]
            if j <= i or p == q:
                continue
            overlap = min(a1, b1) - max(a0, b0) + 1
            if overlap > 0:
                k = (min(p, q), max(p, q))
                shared[k] = max(shared[k], overlap)
    return {"names": sorted({p for p, *_ in items}), "pairs": [[p, q, w] for (p, q), w in shared.items()]}


if not GRAPH.exists():
    json.dump(build_graph(), open(GRAPH, "w"))
graph = json.load(open(GRAPH))
names = graph["names"]
shared = {(p, q): w for p, q, w in graph["pairs"]}
nbrs = defaultdict(dict)
for (p, q), w in shared.items():
    nbrs[p][q] = w
    nbrs[q][p] = w


def h(name):
    v = 0
    for c in name:
        v = (v * 31 + ord(c)) & 0xFFFFFFFF
    return v


slot = {}
for n in sorted(names, key=lambda n: (-len(nbrs[n]), n)):
    cost = [0] * SLOTS
    for m, w in nbrs[n].items():
        if m in slot:
            cost[slot[m]] += w
    start = h(n) % SLOTS
    slot[n] = min(range(SLOTS), key=lambda k: (cost[k], (k - start) % SLOTS))
# local search: re-pick each polity's best slot until nothing improves
for _ in range(20):
    changed = False
    for n in names:
        cost = [0] * SLOTS
        for m, w in nbrs[n].items():
            cost[slot[m]] += w
        best = min(range(SLOTS), key=lambda k: (cost[k], k != slot[n]))
        if cost[best] < cost[slot[n]]:
            slot[n] = best
            changed = True
    if not changed:
        break
clash = sum(1 for (p, q) in shared if slot[p] == slot[q])
json.dump(slot, open(BORDERS / "slots.json", "w"), separators=(",", ":"))
print("polities", len(names), "neighbour pairs", len(shared), "same-slot pairs", clash)
