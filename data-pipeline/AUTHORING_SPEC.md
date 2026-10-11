# Histarix chronicle — authoring spec

You write `backend/app/data/chronicle/{ISO}.json` for each assigned country, using its input
bundle `data-pipeline/out/bundles/{ISO}.json` plus your own historical knowledge.

The territory is the **modern country's land**. Describe what happened on that land in every era,
whoever ruled it (e.g. Turkey in 1200 BC → Hittites; Mexico in 300 AD → Teotihuacan, Maya).

## Output schema (JSON, UTF-8)

```json
{
  "iso": "KR",
  "eras": [
    {
      "from": -3000, "to": -1500,
      "kind": "culture",                 // "state" | "culture" | "colonial" | "period"
      "qid": "Q491045",                  // ONLY a QID that appears in the bundle, else null
      "polity": null,                    // exact Cliopatria `name` from bundle.polities if this era is that polity, else null
      "name":    {"en": "...", "ko": "...", "zh": "...", "ja": "..."},
      "summary": {"en": "...", "ko": "...", "zh": "...", "ja": "..."}
    }
  ],
  "events": [
    {
      "year": 676,
      "qid": null,                       // ONLY a QID from bundle.wd_events / states / cultures, else null
      "importance": 1,                   // 1 = turning point, 2 = major, 3 = notable
      "category": "politics",            // politics | war | culture | religion | science | economy | society | disaster
      "title":       {"en": "...", "ko": "...", "zh": "...", "ja": "..."},
      "description": {"en": "...", "ko": "...", "zh": "...", "ja": "..."}
    }
  ]
}
```

## Rules

**Years**: integers, BC negative (`-2333` = 2333 BC). There is no year 0. Range −3000 … 2026
(an era may start earlier, e.g. −8000). Use the conventional date when uncertain and say
"c."/"약"/"约"/"頃" in the text.

**Eras (the backbone — no gaps)**
- Eras must jointly cover **every year from −3000 to 2026**. Overlaps are fine (rival kingdoms,
  partial occupations). Order by `from`.
- Pre-state times → `culture` (archaeological culture) or `period` (e.g. "Late Stone Age of East
  Africa", "Bantu expansion"). Colonial rule → `colonial`.
- Use bundle.polities (Cliopatria borders), bundle.states and bundle.cultures as the skeleton; fill what
  they miss from your knowledge.
- Typical count 8–30 eras. `summary`: 2–4 sentences per language: who, what, territory, legacy.

**Events (year-by-year detail)**
- Target **60–150 events** for countries with long recorded history, **40+** for others.
  Every era longer than ~200 years should have events; every century from the first written
  records onward should have at least one event where history allows.
- Include all `bundle.curated` events (you may rewrite/expand them; keep their years).
- Use `bundle.wd_events` as fact anchors (set `qid`).
- `description`: 2–4 informative sentences per language — what happened, why, consequences.
- importance 1 for ~10–15% of events, 2 for ~35%, rest 3.

**Bundle data can be wrong — check it**
- `polities[].wikidata` / `labels` come from Cliopatria and are sometimes linked to the wrong entity
  (e.g. "Republic of Korea" → North Korea's QID, "Roman Empire" → Byzantine Empire's). Use a polity's QID
  only if its labels clearly name the same polity; otherwise `qid: null` (keep `polity` = the Cliopatria name).
- A polity can be mis-mapped to the land (e.g. "British Gold Coast" on Nigeria). Ignore such entries.
- `wd_events` contain noise (sandbox items, awards, minor elections, single crashes) and sometimes wrong
  years. Skip noise; use the correct year.

**Truthfulness (critical)**
- Only state facts you are confident about. Legendary/traditional dates must be labelled as tradition.
  Contested topics: describe neutrally, note the dispute.
- Never invent QIDs, quotes, numbers or names.
- Recent years: include 2025–2026 events only if you are certain they happened as described.

**Languages**: natural native prose in each language (not literal translation). `zh` = Simplified
Chinese. Use the standard local names (e.g. ko 고구려 / zh 高句丽 / ja 高句麗).

**Validate**: `python3 data-pipeline/validate.py {ISO}` must print `OK`.
