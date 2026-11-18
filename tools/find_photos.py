"""Finds a free cover photo for each quest and writes web/photos.js.

1. Searches Wikipedia (nl/en for the Netherlands, nl/fr/en for Belgium, de/en for Germany, fr/de/en for Luxembourg, fr/en for France, da/en for Denmark) for the quest's place name and accepts an article only if
   its coordinates lie within 400 m of the quest pin; the article's lead image (free licences only) is used.
2. For "see" quests without a match, takes the nearest Wikimedia Commons photo within 90 m of the pin.
Every photo keeps its author, licence and source page for the credit line. Results are cached in
tools/photo_cache.json, so re-runs only look up new quests.

Usage: python tools/find_photos.py
"""
import concurrent.futures, glob, html, io, json, math, os, re, sys, threading, time, urllib.error, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import regions_io as R

UA = {"User-Agent": "CityQuestPhotoFinder/1.0 (open-source hobby map app)"}
CACHE = os.path.join(HERE, "photo_cache.json")
cache = json.load(io.open(CACHE, encoding="utf-8")) if os.path.exists(CACHE) else {}
lock = threading.Lock()


class Failed(Exception):
    pass


last_call = [0.0]


def api(host, params):
    """One polite request at a time (one every 3 s); when Wikimedia says to slow down, waits as long as it asks."""
    params.update({"action": "query", "format": "json", "formatversion": "2", "maxlag": "5"})
    url = "https://%s/w/api.php?%s" % (host, urllib.parse.urlencode(params))
    for attempt in range(10):
        with lock:
            wait = last_call[0] + 3 - time.time()
            if wait > 0:
                time.sleep(wait)
            last_call[0] = time.time()
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25))
            if "error" not in d:
                return d
            time.sleep(5)
        except urllib.error.HTTPError as e:
            if e.code != 429 and e.code < 500:
                raise Failed(url)
            time.sleep(int(e.headers.get("Retry-After") or 20) + 2)
        except Exception:
            time.sleep(3 * (attempt + 1))
    raise Failed(url)


def dist(a, b):
    return math.hypot((a[0] - b[0]) * 111320, (a[1] - b[1]) * 111320 * math.cos(math.radians(a[0])))


def clean(s):
    s = html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()
    s = re.sub(r"\s+", " ", s)
    return s[:60]


def bare(url):
    """Wikimedia adds tracking parameters (?utm_source=...) to its URLs; the app does not need them."""
    return (url or "").split("?")[0]


def info_to_photo(ii):
    if not ii or not ii.get("thumburl"):
        return None
    if not re.search(r"\.jpe?g$", bare(ii.get("url")), re.I):
        return None
    meta = ii.get("extmetadata", {})
    lic = clean(meta.get("LicenseShortName", {}).get("value", ""))
    if not lic:
        return None
    return [bare(ii["thumburl"]), clean(meta.get("Artist", {}).get("value", "")) or "Wikimedia Commons", lic, bare(ii.get("descriptionurl"))]


def from_wikipedia(q, ll, langs):
    for lang in langs:
        host = lang + ".wikipedia.org"
        d = api(host, {"generator": "search", "gsrsearch": q, "gsrlimit": "4", "prop": "coordinates|pageimages",
                       "piprop": "name", "pilicense": "free", "colimit": "max"})
        best = None
        for p in d.get("query", {}).get("pages", []):
            if not p.get("pageimage") or not p.get("coordinates"):
                continue
            c = p["coordinates"][0]
            m = dist(ll, (c["lat"], c["lon"]))
            if m <= 400 and (best is None or m < best[0]):
                best = (m, p["pageimage"])
        if best:
            d2 = api(host, {"titles": "File:" + best[1], "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": "500"})
            pages = d2.get("query", {}).get("pages", [])
            ph = info_to_photo((pages[0].get("imageinfo") or [None])[0]) if pages else None
            if ph:
                return ph
    return None


def from_commons(ll):
    d = api("commons.wikimedia.org", {"generator": "geosearch", "ggscoord": "%f|%f" % ll, "ggsradius": "90", "ggslimit": "6",
                                      "ggsnamespace": "6", "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": "500"})
    for p in sorted(d.get("query", {}).get("pages", []), key=lambda p: p.get("index", 0)):
        ph = info_to_photo((p.get("imageinfo") or [None])[0])
        if ph:
            return ph
    return None


def work(job):
    key, q, ll, cat, country = job
    langs = {"Belgium": ["nl", "fr", "en"], "Germany": ["de", "en"], "Luxembourg": ["fr", "de", "en"], "France": ["fr", "en"], "Denmark": ["da", "en"]}.get(country, ["nl", "en"])
    try:
        ph = from_wikipedia(q, ll, langs)
        if not ph and cat == "gor":
            ph = from_commons(ll)
    except Failed:
        return key, None  # not cached: the next run tries again
    cache[key] = ph or 0
    return key, ph


jobs = []
for p in sorted(glob.glob(os.path.join(ROOT, "web", "cities", "*.js"))):
    c = R.load(p)
    for q in c["quests"]:
        key = "%s/%s" % (c["id"], q["id"])
        if key not in cache:
            jobs.append((key, q["q"], tuple(c["coords"][q["id"]]), q["cat"], c["country"]))
jobs.sort(key=lambda j: not j[0].startswith(("rotterdam/", "amsterdam/")))  # the busiest regions first
print("to look up:", len(jobs), "cached:", len(cache)); sys.stdout.flush()

def write_photos():
    photos = {k: v for k, v in sorted(cache.items()) if v}
    with io.open(os.path.join(ROOT, "web", "photos.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write("// Generated by tools/find_photos.py. PHOTOS[quest key] = [image url, author, licence, source page].\n"
                "// Photos come from Wikimedia Commons / Wikipedia under free licences; the app shows the credit.\n"
                "window.PHOTOS = " + json.dumps(photos, ensure_ascii=False, separators=(",", ":")) + ";\n")


done = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
    for key, ph in ex.map(work, jobs):
        done += 1
        if done % 25 == 0:
            json.dump(cache, io.open(CACHE, "w", encoding="utf-8"), ensure_ascii=False)
            write_photos()
            print(done, "/", len(jobs), "photos:", sum(1 for v in cache.values() if v)); sys.stdout.flush()
json.dump(cache, io.open(CACHE, "w", encoding="utf-8"), ensure_ascii=False)

write_photos()
print("photos:", sum(1 for v in cache.values() if v), "of", len(cache))
