"""Tiny Wikidata helpers (SPARQL + entity labels) with polite retry."""
import json
import time
import urllib.parse
import urllib.request

UA = "HistarixDataBot/0.1 (https://histarix.semo3.com)"
LANGS = ("en", "ko", "zh", "ja")


def _get(url, data=None, tries=6):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=data, headers={
                "User-Agent": UA, "Accept": "application/sparql-results+json, application/json"})
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)
        except Exception as e:  # 429/5xx/timeouts: back off
            wait = 5 * (2 ** i)
            print(f"  retry {i+1} after {wait}s: {e}", flush=True)
            time.sleep(wait)
    raise RuntimeError(f"failed: {url[:120]}")


def sparql(query):
    body = urllib.parse.urlencode({"query": query, "format": "json"}).encode()
    res = _get("https://query.wikidata.org/sparql", data=body)
    return res["results"]["bindings"]


def entities(qids, props="labels|descriptions|sitelinks"):
    """Fetch entities in batches of 50 via wbgetentities."""
    out = {}
    qids = list(dict.fromkeys(q for q in qids if q))
    for i in range(0, len(qids), 50):
        batch = qids[i:i + 50]
        url = ("https://www.wikidata.org/w/api.php?action=wbgetentities&format=json"
               f"&props={props}&languages=en|ko|zh|ja|zh-hans|zh-cn"
               f"&ids={'|'.join(batch)}")
        out.update(_get(url).get("entities", {}))
        time.sleep(0.2)
    return out


def labels_of(ent):
    lab = ent.get("labels", {})
    res = {}
    for lang in LANGS:
        for key in ((lang,) if lang != "zh" else ("zh-hans", "zh-cn", "zh")):
            if key in lab:
                res[lang] = lab[key]["value"]
                break
    return res


def sitelink_count(ent):
    return len(ent.get("sitelinks", {}))


def year(v):
    """Year from a SPARQL date binding; None for 'unknown value' placeholders."""
    if v.get("type") == "uri":
        return None
    s = v["value"]
    y = int(s.lstrip("-").split("-")[0])
    return -y if s.startswith("-") else y
