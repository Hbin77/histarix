"""Per-country input bundle for the authoring step.

out/bundles/{ISO}.json = everything we know about that territory:
  polities   Cliopatria polities that covered it (merged spans, labels)
  states     Wikidata historical states located there (no polygon)
  cultures   Wikidata archaeological cultures / periods located there
  wd_events  Wikidata dated events (top by sitelinks)
  curated    the original hand-authored events (backend/app/data/history)
Usage: build_bundles.py [ISO ...]   (default: all)
"""
import json
import sys
from pathlib import Path

from geo import load_countries

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
OUT = ROOT / "out/bundles"
OUT.mkdir(parents=True, exist_ok=True)

iso_pol = json.load(open(ROOT / "out/iso_polities.json"))
plabels = json.load(open(ROOT / "out/polity_labels.json"))
states = json.load(open(ROOT / "out/states.json"))
cultures = json.load(open(ROOT / "out/cultures.json"))
_, isos, names, _ = load_countries()
countries = dict(zip(isos, names))
wanted = sys.argv[1:] or list(countries)


def merged_polities(rows):
    by = {}
    for r in rows:
        name = r["name"]
        if name.startswith("(") or r["share"] < 0.05:  # overlay duplicates / slivers
            continue
        b = by.setdefault(name, {"name": name, "wikidata": r["wikidata"], "from": r["from"], "to": r["to"], "max_share": 0})
        b["from"] = min(b["from"], r["from"])
        b["to"] = max(b["to"], r["to"])
        b["max_share"] = max(b["max_share"], r["share"])
    for b in by.values():
        b["labels"] = plabels.get(b["name"], {}).get("labels", {})
        b["max_share"] = round(b["max_share"], 2)
    return sorted(by.values(), key=lambda b: b["from"])


def located(src, iso):
    return sorted(({"qid": q, "from": e["from"], "to": e["to"], "labels": e["labels"],
                    "description_en": e["descriptions"].get("en"), "sitelinks": e["sitelinks"]}
                   for q, e in src.items() if iso in e["isos"]), key=lambda e: e["from"])


for iso in wanted:
    ev_path = ROOT / f"out/events/{iso}.json"
    wd_events = json.load(open(ev_path)) if ev_path.exists() else []
    wd_events = sorted(wd_events, key=lambda e: -e["sitelinks"])[:250]
    wd_events = [{"qid": e["qid"], "year": e["year"], "sitelinks": e["sitelinks"], "labels": e["labels"],
                  "description_en": e["descriptions"].get("en")} for e in sorted(wd_events, key=lambda e: e["year"])]
    cur_path = REPO / f"backend/app/data/history/{iso}.json"
    curated = json.load(open(cur_path))["events"] if cur_path.exists() else []
    bundle = {"iso": iso, "name": countries[iso],
              "polities": merged_polities(iso_pol.get(iso, [])),
              "states": located(states, iso), "cultures": located(cultures, iso),
              "wd_events": wd_events, "curated": curated}
    json.dump(bundle, open(OUT / f"{iso}.json", "w"), ensure_ascii=False, indent=1)
print("bundles", len(wanted))
