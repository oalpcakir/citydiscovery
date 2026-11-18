"""Looks for quests at places that may have closed, using OpenStreetMap (Overpass API).

For every "eat & drink" quest it searches named cafés, restaurants, bars, bakeries, breweries and similar places
within 300 m, including ones OSM marks as closed (disused:/was: tags). Output, one line per quest:
  <region>/<quest id> <TAB> OPEN | CLOSED | NOMATCH <TAB> <best OSM match> <TAB> <quest title>
OPEN means an open place with a matching name is nearby. CLOSED and NOMATCH need a human (or researcher) check.
Also lists quests whose text mentions a specific year (often a one-off event).

Usage: python tools/closedcheck.py > closed.txt
"""
import glob, io, json, math, os, re, sys, time, unicodedata, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import regions_io as R

UA = {"User-Agent": "city-quest-closed-check/1.0"}
FOOD = "restaurant|cafe|bar|pub|biergarten|fast_food|ice_cream|food_court"
SHOPS = "bakery|pastry|confectionery|chocolate|deli|butcher|cheese|beverages|wine|coffee|tea|seafood|greengrocer|farm"
STOP = set("""restaurant restaurants cafe café cafes brasserie bistro bar bars eetcafe grand de het een van der den the and of in at on
zum zur im am an der die das und le la les du des et au aux chez bij op 't t s brouwerij brewery brauhaus brauerei
bakkerij bakery boulangerie patisserie konditorei kaffee coffee tea koffie wine wijn weinstube taverne pub""".split())


def norm(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return [w for w in re.findall(r"[a-z0-9]+", s) if len(w) > 2 and w not in STOP]


def dist(a, b):
    return math.hypot((a[0] - b[0]) * 111320, (a[1] - b[1]) * 111320 * math.cos(math.radians(a[0])))


def overpass(bbox):
    s, w, n, e = bbox
    b = "%f,%f,%f,%f" % (s, w, n, e)
    q = ('[out:json][timeout:180];('
         'nwr["name"]["amenity"~"^(%s)$"](%s);nwr["name"]["shop"~"^(%s)$"](%s);nwr["name"]["craft"~"^(brewery|distillery|winery)$"](%s);'
         'nwr["name"]["disused:amenity"](%s);nwr["name"]["was:amenity"](%s);nwr["name"]["disused:shop"](%s);nwr["name"]["was:shop"](%s);'
         ');out center tags;') % (FOOD, b, SHOPS, b, b, b, b, b, b)
    for attempt in range(5):
        try:
            data = urllib.parse.urlencode({"data": q}).encode()
            return json.load(urllib.request.urlopen(urllib.request.Request("https://overpass-api.de/api/interpreter", data, UA), timeout=200))["elements"]
        except Exception as ex:
            sys.stderr.write("overpass retry %s\n" % ex)
            time.sleep(30 * (attempt + 1))
    raise RuntimeError("overpass failed")


def closed_tags(t):
    return any(k.startswith(("disused:", "was:", "abandoned:")) for k in t) or t.get("opening_hours") == "closed"


for path in sorted(glob.glob(os.path.join(ROOT, "web", "cities", "*.js"))):
    c = R.load(path)
    qs = [q for q in c["quests"] if q["cat"] == "ye"]
    for q in c["quests"]:
        yrs = re.findall(r"\b20[12]\d\b", q["title"] + " " + q["desc"] + " " + q.get("tip", ""))
        if yrs:
            print("%s/%s\tYEAR\t%s\t%s" % (c["id"], q["id"], ",".join(yrs), q["title"]))
    if not qs:
        continue
    lls = [c["coords"][q["id"]] for q in qs]
    bbox = (min(p[0] for p in lls) - 0.005, min(p[1] for p in lls) - 0.008, max(p[0] for p in lls) + 0.005, max(p[1] for p in lls) + 0.008)
    pois = []
    for el in overpass(bbox):
        t = el.get("tags", {})
        ll = (el["lat"], el["lon"]) if "lat" in el else (el["center"]["lat"], el["center"]["lon"]) if "center" in el else None
        if ll:
            pois.append((ll, t.get("name", ""), closed_tags(t)))
    sys.stderr.write("%s: %d quests, %d places\n" % (c["id"], len(qs), len(pois)))
    for q in qs:
        ll = c["coords"][q["id"]]
        want = set(norm(q["q"]) + norm(q["title"]))
        best = None
        for p_ll, name, closed in pois:
            d = dist(ll, p_ll)
            if d > 300:
                continue
            toks = norm(name)
            if not toks:
                continue
            hit = sum(1 for w in toks if w in want)
            score = hit / len(toks)
            if hit and score >= 0.5 and (best is None or (score, -d) > (best[0], -best[1])):
                best = (score, d, name, closed)
        if best is None:
            print("%s/%s\tNOMATCH\t\t%s" % (c["id"], q["id"], q["title"]))
        else:
            print("%s/%s\t%s\t%s (%dm)\t%s" % (c["id"], q["id"], "CLOSED" if best[3] else "OPEN", best[2], best[1], q["title"]))
    sys.stdout.flush()
    time.sleep(5)
