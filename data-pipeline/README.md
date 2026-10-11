# data-pipeline

Builds the historical data behind the time slider:

- `backend/app/data/chronicle/{ISO}.json`: eras and year-by-year events for each modern country's land, 3000 BC–2026, en/ko/zh/ja
- `frontend/public/data/borders/`: polity borders by century, with localized names and palette slots

`raw/`, `out/`, `work/` and `venv/` are gitignored. Only the scripts and the two outputs above are committed.

## Sources

| Source | License | Used for |
|---|---|---|
| [Cliopatria](https://github.com/Seshat-Global-History-Databank/cliopatria) v0.2.1 (Seshat Global History Databank), saved as `raw/cliopatria.geojson` | CC BY 4.0 (the UI must credit it) | polity borders |
| Wikidata | CC0 | states, archaeological cultures, dated events (used to anchor facts) |

Cliopatria's Wikidata QIDs are often wrong (e.g. "Republic of Korea" points to North Korea), so never trust them.

## Steps

Run the scripts from `data-pipeline/` with `venv/bin/python` (it has shapely).

1. `scripts/map_polities.py`: matches each Cliopatria polity to the modern countries it covered. Writes `out/iso_polities.json`.
2. `scripts/polity_labels.py`: Wikidata labels for each polity, used as hints only. Writes `out/polity_labels.json`.
3. `scripts/collect_entities.py cultures|states`: writes `out/cultures.json` and `out/states.json`.
4. `scripts/collect_events.py [ISO…]`: Wikidata dated events per country. Writes `out/events/{ISO}.json`.
5. `scripts/build_bundles.py [ISO…]`: combines steps 1–4 into one input bundle per country. Writes `out/bundles/{ISO}.json`.
6. Authoring: agents write the chronicles from the bundles, following `AUTHORING_SPEC.md` and the prompt in `AGENT_PROMPT.txt`. Check the output with `python3 validate.py --all`.
7. Polity names: the 4-language display names in `out/polity_names.json` were translated by agents.
8. `scripts/simplify_borders.py [tol]`: simplifies the polygons and splits them into century buckets. Writes `out/borders/`.
9. `scripts/assign_slots.py`: gives each polity one palette slot so that touching polities differ. Writes `out/borders/slots.json`. The spatial join is cached in `out/polity_neighbours.json`; delete that file after changing the borders.
10. `scripts/export_borders.py`: copies the buckets and `polities.json` (names and slots) into `frontend/public/data/borders/`.

Keep long runs inside this folder, never in /tmp, and run `caffeinate` during multi-hour agent runs.
