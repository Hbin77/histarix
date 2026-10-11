"""Modern country geometry from the frontend's countries.geo.json."""
import json
from pathlib import Path

from shapely import STRtree, make_valid
from shapely.geometry import MultiPolygon, Polygon

REPO = Path(__file__).resolve().parents[2]
COUNTRIES = REPO / "frontend/public/data/countries.geo.json"


def load_countries():
    """(geoms, isos, names) for every feature with an ISO code."""
    geoms, isos, names = [], [], []
    for c in json.load(open(COUNTRIES))["features"]:
        if not c.get("iso"):
            continue
        geoms.append(make_valid(MultiPolygon([Polygon(p[0], p[1:]) for p in c["polygons"]])))
        isos.append(c["iso"])
        names.append(c["name"])
    return geoms, isos, names, STRtree(geoms)
