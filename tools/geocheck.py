"""Cross-checks quest coordinates against OpenStreetMap (Nominatim), politely (about 1 request per second).

Usage: python tools/geocheck.py web/cities/<region>.js [more files...] > geo.txt
Each output line: <region>:<quest id> <TAB> <distance>m | NONE | ERR <TAB> <osm lat, lng> <TAB> <osm name>
Then apply the safe corrections with tools/geoapply.py.
"""
import json, math, os, re, sys, time, urllib.parse, urllib.request


def dist(a, b):
    dy = (a[0] - b[0]) * 111320
    dx = (a[1] - b[1]) * 111320 * math.cos(math.radians(a[0]))
    return math.hypot(dx, dy)


for path in sys.argv[1:]:
    src = open(path, encoding="utf-8").read()
    tag = os.path.basename(path)[:-3]
    coords = {m[0]: (float(m[1]), float(m[2])) for m in re.findall(r"(\w+): \[(-?\d+\.\d+), (-?\d+\.\d+)\]", src)}
    only = set(os.environ.get("ONLY", "").split(",")) - {""}  # optionally check just these quest ids
    for qid, q in re.findall(r'\{ id: "(\w+)".*?q: "([^"]+)"', src, re.S):
        if only and qid not in only:
            continue
        url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
            {"q": q, "format": "json", "limit": 1, "countrycodes": "nl,be,de,lu,fr,dk"})
        req = urllib.request.Request(url, headers={"User-Agent": "city-quest-coordinate-check/1.0"})
        try:
            res = json.load(urllib.request.urlopen(req, timeout=20))
        except Exception as e:
            print(f"{tag}:{qid}\tERR\t{e}"); time.sleep(1.2); continue
        if not res:
            print(f"{tag}:{qid}\tNONE\t{q}")
        else:
            got = (float(res[0]["lat"]), float(res[0]["lon"]))
            d = dist(got, coords.get(qid, (0, 0)))
            print(f"{tag}:{qid}\t{d:.0f}m\t{got[0]:.4f}, {got[1]:.4f}\t{res[0]['display_name'][:70]}")
        sys.stdout.flush()
        time.sleep(1.2)
