"""Wikidata labels for every Cliopatria polity (hints only — many QIDs are wrong).

Output: out/polity_labels.json {name: {wikidata, labels, sitelinks, from, to, wikipedia}}
"""
import json
from pathlib import Path

from wd import entities, labels_of, sitelink_count

ROOT = Path(__file__).resolve().parents[1]
polities = {}
for f in json.load(open(ROOT / "raw/cliopatria.geojson"))["features"]:
    p = f["properties"]
    s = polities.setdefault(p["Name"], {"wikidata": p["Wikidata"], "wikipedia": p["Wikipedia"],
                                        "from": p["FromYear"], "to": p["ToYear"]})
    s["from"] = min(s["from"], p["FromYear"])
    s["to"] = max(s["to"], p["ToYear"])

ents = entities(v["wikidata"] for v in polities.values())
for name, v in polities.items():
    ent = ents.get(v["wikidata"], {}) if v["wikidata"] else {}
    v["labels"] = labels_of(ent)
    v["labels"].setdefault("en", name)
    v["sitelinks"] = sitelink_count(ent)
json.dump(polities, open(ROOT / "out/polity_labels.json", "w"), ensure_ascii=False, indent=1)
print("polities", len(polities))
