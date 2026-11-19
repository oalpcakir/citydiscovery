"""Picks the five treasure places of every region and writes web/treasures.js.

A treasure is a quest at a place that defines its region: the sights people travel for. Fame is measured with Wikidata:
one query per region lists every landmark in the region's box with its number of Wikipedia language editions
(sitelinks), and each quest takes the score of the landmark nearest its pin (within 150 m). Then five are chosen:
the most famous first, at most two per area, at most one eat & drink quest, seasonal quests left out, and quests with a
cover photo go first (the card shows it). Regions without enough famous places fall back to the order of the file,
where research lists the landmarks first.

Hand picks win: tools/treasures_manual.json maps a region id to a list of quest ids (exactly what you want, in order).
Wikidata answers are cached in tools/treasure_cache.json, so re-runs only ask for new regions.

Usage: python tools/pick_treasures.py [--refresh] [--offline]   (--offline: only use what is cached, ask Wikidata nothing)
"""
import glob, io, json, math, os, sys, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import regions_io as R

UA = {"User-Agent": "CityDiscoTreasurePicker/1.0 (open-source hobby map app)", "Accept": "application/sparql-results+json"}
CACHE = os.path.join(HERE, "treasure_cache.json")
MANUAL = os.path.join(HERE, "treasures_manual.json")
cache = json.load(io.open(CACHE, encoding="utf-8")) if os.path.exists(CACHE) and "--refresh" not in sys.argv else {}
manual = json.load(io.open(MANUAL, encoding="utf-8")) if os.path.exists(MANUAL) else {}
photos_js = io.open(os.path.join(ROOT, "web", "photos.js"), encoding="utf-8").read()
photos = json.loads(photos_js[photos_js.index("{"):photos_js.rindex("}") + 1])


def landmarks(box):
    """[[lat, lng, sitelinks], ...] for Wikidata items with 8+ sitelinks in the box (south, west, north, east)."""
    s, w, n, e = box
    q = """SELECT ?coord ?links WHERE {
      SERVICE wikibase:box { ?item wdt:P625 ?coord .
        bd:serviceParam wikibase:cornerSouthWest "Point(%f %f)"^^geo:wktLiteral .
        bd:serviceParam wikibase:cornerNorthEast "Point(%f %f)"^^geo:wktLiteral . }
      ?item wikibase:sitelinks ?links . FILTER(?links >= 8) }""" % (w, s, e, n)
    url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": q, "format": "json"})
    for attempt in range(8):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90))
            out = []
            for b in d["results"]["bindings"]:
                pt = b["coord"]["value"]  # Point(lng lat)
                if not pt.startswith("Point("):
                    continue
                lng, lat = map(float, pt[6:-1].split())
                out.append([round(lat, 5), round(lng, 5), int(b["links"]["value"])])
            return out
        except Exception as ex:
            print("  retry", attempt + 1, ex); sys.stdout.flush()
            time.sleep(70 if "429" in str(ex) else 10 * (attempt + 1))  # while Wikidata limits to 1 request a minute
    return None


def dist(a, b):
    return math.hypot((a[0] - b[0]) * 111320, (a[1] - b[1]) * 111320 * math.cos(math.radians(a[0])))


def pick(c, marks):
    qs = [q for q in c["quests"] if q["id"] in c["coords"] and not q.get("months")]
    has_photo = lambda q: bool(photos.get(c["id"] + "/" + q["id"]))
    order = {q["id"]: i for i, q in enumerate(c["quests"])}
    def fame(q):
        if q["cat"] == "ye" or not marks:
            return 0
        p = c["coords"][q["id"]]
        near = [m for m in marks if abs(m[0] - p[0]) < 0.002 and dist(p, m) <= 150]
        return max([m[2] for m in near] or [0])
    scored = sorted(qs, key=lambda q: (-fame(q), order[q["id"]] + (0 if has_photo(q) else 8)))  # a card looks best with a photo
    chosen, per_area, eat = [], {}, 0
    for q in scored:
        if len(chosen) == 5:
            break
        if per_area.get(q["area"], 0) >= 2 or (q["cat"] == "ye" and eat):
            continue
        chosen.append(q); per_area[q["area"]] = per_area.get(q["area"], 0) + 1; eat += q["cat"] == "ye"
    return [q["id"] for q in chosen], {q["id"]: fame(q) for q in chosen}


out, report = {}, []
for path in sorted(glob.glob(os.path.join(ROOT, "web", "cities", "*.js"))):
    c = R.load(path)
    rid = c["id"]
    if rid in manual:
        out[rid] = manual[rid]; report.append("%-14s manual" % rid); continue
    pts = list(c["coords"].values())
    if not pts:
        continue
    if rid not in cache and "--offline" not in sys.argv:
        box = (min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts))
        print("asking Wikidata for", rid); sys.stdout.flush()
        m = landmarks(box)
        if m is None:
            print("  gave up on", rid, "(file order is used)"); m = []
        else:
            cache[rid] = m
            io.open(CACHE, "w", encoding="utf-8").write(json.dumps(cache, separators=(",", ":")))
        time.sleep(62)  # Wikidata currently allows one query a minute
    ids, fame = pick(c, cache.get(rid, []))
    if len(ids) >= 3:
        out[rid] = ids
    report.append("%-14s %s" % (rid, ", ".join("%s(%d)" % (i, fame[i]) for i in ids)))

with io.open(os.path.join(ROOT, "web", "treasures.js"), "w", encoding="utf-8", newline="\n") as f:
    f.write("// Generated by tools/pick_treasures.py (hand picks in tools/treasures_manual.json).\n"
            "// TREASURES[region id] = the quest ids of its five treasure cards, most famous first.\n")
    f.write("window.TREASURES = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("\n".join(report))
print("regions with treasures:", len(out))
