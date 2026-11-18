"""Fast first pass for quest cover photos, using Wikidata.

For each map cell that contains quests, one Wikidata query fetches every place there that has coordinates and a
photo (P18). A quest takes the photo of the place whose name matches the quest's name and which lies within 300 m.
Author and licence come from Wikimedia Commons, 50 files per request. Results go into tools/photo_cache.json (the same
cache tools/find_photos.py uses), so afterwards tools/find_photos.py only searches Wikipedia for quests still without one.

Usage: python tools/find_photos_wikidata.py   (then: python tools/find_photos.py)
"""
import collections, glob, html, io, json, math, os, re, sys, time, unicodedata, urllib.error, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import regions_io as R

UA = {"User-Agent": "CityQuestPhotoFinder/1.0 (open-source hobby map app)", "Accept": "application/sparql-results+json"}
CACHE = os.path.join(HERE, "photo_cache.json")
cache = json.load(io.open(CACHE, encoding="utf-8")) if os.path.exists(CACHE) else {}
CELL_LAT, CELL_LNG = 0.2, 0.3
# Towns, villages, municipalities and districts are not quest places: their photo would show the whole town.
PLACES = " ".join("wd:" + x for x in """Q486972 Q515 Q3957 Q532 Q5084 Q15284 Q2039348 Q493522 Q262166 Q42744322 Q1549591 Q1637706
Q2919801 Q484170 Q123705 Q188509 Q2983893 Q1115575 Q253019 Q1852859 Q19953632 Q1187811 Q702492 Q3184121 Q1622459 Q747074""".split())
STOP = set("""the and of in at on de het een van der den des du la le les et au aux zum zur im am an die das und
sint saint sankt st ste kerk church kirche eglise museum musee park parc brug bridge brucke pont markt market marche
restaurant cafe bar brouwerij brewery brauerei castle kasteel schloss burg chateau huis haus maison house tower toren turm
see visit walk eat drink try find taste climb tour cross stroll spot meet ride""".split())


def norm(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return [w for w in re.findall(r"[a-z0-9]+", s) if len(w) > 2]


def dist(a, b):
    return math.hypot((a[0] - b[0]) * 111320, (a[1] - b[1]) * 111320 * math.cos(math.radians(a[0])))


def get(url, data=None, headers=UA):
    for attempt in range(8):
        try:
            req = urllib.request.Request(url, data=data, headers=headers)
            return json.load(urllib.request.urlopen(req, timeout=90))
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503, 504):
                raise
            time.sleep(int(e.headers.get("Retry-After") or 15) + 2)
        except Exception:
            time.sleep(5 * (attempt + 1))
    raise RuntimeError("failed: " + url[:120])


def cell_items(s, w):
    q = """SELECT ?item ?coord ?image ?lbl WHERE {
  SERVICE wikibase:box { ?item wdt:P625 ?coord .
    bd:serviceParam wikibase:cornerSouthWest "Point(%f %f)"^^geo:wktLiteral .
    bd:serviceParam wikibase:cornerNorthEast "Point(%f %f)"^^geo:wktLiteral . }
  ?item wdt:P18 ?image .
  FILTER NOT EXISTS { ?item wdt:P31 ?kind . VALUES ?kind { %s } }
  ?item rdfs:label ?lbl . FILTER(LANG(?lbl) IN ("en", "nl", "fr", "de", "lb"))
}""" % (w - 0.01, s - 0.01, w + CELL_LNG + 0.01, s + CELL_LAT + 0.01, PLACES)
    d = get("https://query.wikidata.org/sparql", urllib.parse.urlencode({"query": q, "format": "json"}).encode())
    items = {}
    for b in d["results"]["bindings"]:
        m = re.match(r"Point\(([-\d.]+) ([-\d.]+)\)", b["coord"]["value"])
        if not m:
            continue
        it = items.setdefault(b["item"]["value"], {"ll": (float(m.group(2)), float(m.group(1))), "image": b["image"]["value"], "labels": set()})
        it["labels"].add(b["lbl"]["value"])
    return list(items.values())


def match(q, region_words, items):
    ll = q["_ll"]
    # Town names never count as a match ("bell foundry in Saarburg" must not get a photo of Saarburg).
    region_words = region_words | TOWNS
    want = set(norm(q["q"]) + norm(q["title"])) - STOP - region_words
    best = None
    for it in items:
        d = dist(ll, it["ll"])
        if d > 300:
            continue
        for lbl in it["labels"]:
            toks = [t for t in norm(lbl) if t not in STOP and t not in region_words]
            if not toks:
                continue
            hit = sum(1 for t in toks if t in want)
            score = hit / len(toks)
            if hit and score >= 0.5 and (best is None or (score, -d) > (best[0], -best[1])):
                best = (score, d, it, lbl)
    return best


def clean(s):
    s = html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()
    return re.sub(r"\s+", " ", s)[:60]


def bare(url):
    return (url or "").split("?")[0]


# ── Quests that still need a photo (no photo yet; earlier "none found" results get a second chance here) ──
todo, region_words, TOWNS = [], {}, set()
_ends = collections.Counter()  # town names: words that end the map names of three or more quests ("... Rotterdam")
for p in sorted(glob.glob(os.path.join(ROOT, "web", "cities", "*.js"))):
    for q in R.load(p)["quests"]:
        last = (q.get("q") or "").split()[-1:]
        if last and last[0][:1].isupper():
            _ends.update(norm(last[0]))
TOWNS = {w for w, n in _ends.items() if n >= 3}
for p in sorted(glob.glob(os.path.join(ROOT, "web", "cities", "*.js"))):
    c = R.load(p)
    region_words[c["id"]] = set(norm(c["name"]) + norm(" ".join(c["areas"].values())) + norm(c.get("subtitle", "")))
    for q in c["quests"]:
        key = "%s/%s" % (c["id"], q["id"])
        if not cache.get(key):
            q = dict(q, _key=key, _cid=c["id"], _ll=tuple(c["coords"][q["id"]]))
            todo.append(q)
cells = collections.defaultdict(list)
for q in todo:
    cells[(math.floor(q["_ll"][0] / CELL_LAT), math.floor(q["_ll"][1] / CELL_LNG))].append(q)
print("quests without a photo:", len(todo), "map cells:", len(cells)); sys.stdout.flush()

found = {}
for n, ((a, b), qs) in enumerate(sorted(cells.items())):
    items = cell_items(a * CELL_LAT, b * CELL_LNG)
    for q in qs:
        m = match(q, region_words[q["_cid"]], items)
        if m:
            fname = urllib.parse.unquote(m[2]["image"].rsplit("/", 1)[-1])
            found[q["_key"]] = (fname, m[3], round(m[1]))
    if n % 10 == 0:
        print("cells", n + 1, "/", len(cells), "matched", len(found)); sys.stdout.flush()
    time.sleep(1.5)

# ── Author, licence and a 500px thumbnail from Commons, 50 files per request ──
files = sorted({f for f, _, _ in found.values() if re.search(r"\.jpe?g$", f, re.I)})
info = {}
for i in range(0, len(files), 50):
    batch = files[i:i + 50]
    d = get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": "2", "prop": "imageinfo", "iiprop": "url|extmetadata",
        "iiurlwidth": "500", "titles": "|".join("File:" + f for f in batch)}), headers={"User-Agent": UA["User-Agent"]})
    norm_map = {x["to"]: x["from"] for x in d.get("query", {}).get("normalized", [])}
    for pg in d.get("query", {}).get("pages", []):
        ii = (pg.get("imageinfo") or [None])[0]
        if not ii or not ii.get("thumburl"):
            continue
        meta = ii.get("extmetadata", {})
        lic = clean(meta.get("LicenseShortName", {}).get("value", ""))
        if not lic:
            continue
        title = norm_map.get(pg["title"], pg["title"])
        info[title.split(":", 1)[1]] = [bare(ii["thumburl"]), clean(meta.get("Artist", {}).get("value", "")) or "Wikimedia Commons", lic, bare(ii.get("descriptionurl"))]
    time.sleep(3)

added = 0
log = []
for key, (fname, lbl, d) in sorted(found.items()):
    ph = info.get(fname) or info.get(fname.replace("_", " "))
    if ph:
        cache[key] = ph; added += 1
        log.append("%s\t%dm\t%s" % (key, d, lbl))
json.dump(cache, io.open(CACHE, "w", encoding="utf-8"), ensure_ascii=False)
photos = {k: v for k, v in sorted(cache.items()) if v}
with io.open(os.path.join(ROOT, "web", "photos.js"), "w", encoding="utf-8", newline="\n") as f:
    f.write("// Generated by tools/find_photos.py and tools/find_photos_wikidata.py. PHOTOS[quest key] = [image url, author, licence, source page].\n"
            "// Photos come from Wikimedia Commons / Wikipedia under free licences; the app shows the credit.\n"
            "window.PHOTOS = " + json.dumps(photos, ensure_ascii=False, separators=(",", ":")) + ";\n")
io.open(os.path.join(HERE, "photo_matches_wikidata.txt"), "w", encoding="utf-8").write("\n".join(log) + "\n")
print("matched", len(found), "with usable photo", added, "photos now", len(photos))
