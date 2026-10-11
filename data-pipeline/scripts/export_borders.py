"""Copy out/borders/ into the frontend as static files the globe fetches by century.

Writes frontend/public/data/borders/:
  polities.json  {"source", "polities": {name: {"l": {en,ko,zh,ja}, "s": palette slot}}}
                 (Cliopatria QIDs dropped — unreliable; slots from assign_slots.py)
  {bucket}.json  unchanged century buckets from simplify_borders.py
Usage: export_borders.py
"""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "out/borders"
DST = ROOT.parent / "frontend/public/data/borders"
DST.mkdir(parents=True, exist_ok=True)

meta = json.load(open(SRC / "polities.json"))
slots = json.load(open(SRC / "slots.json"))
json.dump({"source": meta["source"],
           "polities": {n: {"l": v["labels"], "s": slots[n]} for n, v in meta["polities"].items()}},
          open(DST / "polities.json", "w"), ensure_ascii=False, separators=(",", ":"))
buckets = sorted(int(p.stem) for p in SRC.glob("*.json") if p.stem.lstrip("-").isdigit())
for b in buckets:
    shutil.copyfile(SRC / f"{b}.json", DST / f"{b}.json")
print("buckets", buckets[0], "…", buckets[-1], len(buckets))
