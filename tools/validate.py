"""Checks the quest data for mistakes a machine can find. Exit code 1 when there are errors.

Errors: missing or empty fields, unknown category or area, missing or duplicate coordinates entry, duplicate ids,
a quest outside its region's outline, invalid months, malformed source links or photo entries.
Warnings: two quests in one region within 15 m of each other with similar titles (possible duplicates), em/en dashes,
very long or very short texts, pins slightly outside the outline (coasts are simplified).

Usage: python tools/validate.py
"""
import glob, io, json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import regions_io as R

src = io.open(os.path.join(ROOT, "web", "regions.js"), encoding="utf-8").read()
REG = json.loads(re.search(r"window\.REGIONS = (\{.*?\});\n", src, re.S).group(1))
ph = io.open(os.path.join(ROOT, "web", "photos.js"), encoding="utf-8").read()
PHOTOS = json.loads(re.search(r"window\.PHOTOS = (\{.*\});", ph, re.S).group(1))
errors, warnings = [], []


def dist(a, b):
    return math.hypot((a[0] - b[0]) * 111320, (a[1] - b[1]) * 111320 * math.cos(math.radians(a[0])))


def in_ring(ring, lat, lng):
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        yi, xi, yj, xj = ring[i][0], ring[i][1], ring[j][0], ring[j][1]
        if (yi > lat) != (yj > lat) and lng < (xj - xi) * (lat - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def in_region(cid, lat, lng):
    return any(in_ring(poly[0], lat, lng) and not any(in_ring(h, lat, lng) for h in poly[1:]) for poly in REG.get(cid, []))


def seg_dist(p, a, b):
    """Metres from p to the segment a-b (small-area flat approximation)."""
    k = math.cos(math.radians(p[0]))
    ax, ay, bx, by, px, py = a[1] * k, a[0], b[1] * k, b[0], p[1] * k, p[0]
    dx, dy = bx - ax, by - ay
    t = 0 if dx == dy == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy)) * 111320


def edge_dist(cid, ll):
    return min((seg_dist(ll, r[i - 1], r[i]) for poly in REG.get(cid, []) for r in [poly[0]] for i in range(len(r))), default=0)


def words(s):
    return set(re.findall(r"[a-zà-ÿ0-9]{4,}", s.lower()))


all_keys, total = set(), 0
for path in sorted(glob.glob(os.path.join(ROOT, "web", "cities", "*.js"))):
    c = R.load(path)
    cid, seen = c["id"], set()
    if cid not in REG:
        errors.append("%s: no outline in regions.js" % cid)
    for q in c["quests"]:
        total += 1
        key = "%s/%s" % (cid, q.get("id"))
        all_keys.add(key)
        if q.get("id") in seen:
            errors.append("%s: duplicate id" % key)
        seen.add(q.get("id"))
        for f in ("id", "cat", "area", "title", "desc", "q"):
            if not str(q.get(f) or "").strip():
                errors.append("%s: missing %s" % (key, f))
        if q.get("cat") not in ("gor", "ye", "dene"):
            errors.append("%s: unknown category %r" % (key, q.get("cat")))
        if q.get("area") not in c["areas"]:
            errors.append("%s: unknown area %r" % (key, q.get("area")))
        ll = c["coords"].get(q.get("id"))
        if not ll or len(ll) != 2 or not (41 < ll[0] < 56 and -6 < ll[1] < 16):
            errors.append("%s: missing or impossible coordinates %r" % (key, ll))
        elif cid in REG and not in_region(cid, ll[0], ll[1]):
            d = edge_dist(cid, ll)
            (errors if d > 3000 else warnings).append("%s: pin lies %.1f km outside the region outline" % (key, d / 1000))
        m = q.get("months")
        if m is not None and (not isinstance(m, list) or not m or any(not isinstance(x, int) or x < 1 or x > 12 for x in m)):
            errors.append("%s: invalid months %r" % (key, m))
        for u in q.get("src", []):
            if not re.match(r"https?://[^\s]+\.[^\s]+", u):
                errors.append("%s: malformed source link %r" % (key, u))
        for t in q.get("tags", []):
            if t not in ("free", "rainy day"):
                warnings.append("%s: unusual tag %r" % (key, t))
        text = " ".join(str(q.get(f) or "") for f in ("title", "desc", "tip"))
        if "—" in text or "–" in text:
            warnings.append("%s: em or en dash in the text" % key)
        if len(q.get("title") or "") > 70:
            warnings.append("%s: long title (%d characters)" % (key, len(q["title"])))
        if len(q.get("desc") or "") < 40:
            warnings.append("%s: very short description" % key)
    for qid in c["coords"]:
        if qid not in seen:
            warnings.append("%s/%s: coordinates without a quest" % (cid, qid))
    qs = [q for q in c["quests"] if c["coords"].get(q["id"])]
    for i, a in enumerate(qs):
        for b in qs[i + 1:]:
            if a["cat"] == b["cat"] and dist(c["coords"][a["id"]], c["coords"][b["id"]]) < 15:
                wa, wb = words(a["title"] + " " + a["q"]), words(b["title"] + " " + b["q"])
                if wa & wb and len(wa & wb) >= min(len(wa), len(wb)) / 2:
                    warnings.append("%s/%s and %s: same spot, similar names (duplicate?)" % (cid, a["id"], b["id"]))

for k, v in PHOTOS.items():
    if k not in all_keys:
        warnings.append("photo for a quest that no longer exists: %s" % k)
    if not (isinstance(v, list) and len(v) == 4 and str(v[0]).startswith("https://") and "wikimedia.org/" in v[0] and v[2]):
        errors.append("malformed photo entry: %s" % k)

print("%d quests, %d photos" % (total, len(PHOTOS)))
print("ERRORS (%d)" % len(errors))
for e in errors:
    print("  " + e)
print("WARNINGS (%d)" % len(warnings))
for w in warnings:
    print("  " + w)
sys.exit(1 if errors else 0)
