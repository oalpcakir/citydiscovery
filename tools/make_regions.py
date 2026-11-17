"""Split the Netherlands and Belgium into app regions: every point belongs to the nearest
region seed within its country (Voronoi cells clipped to the country outline).
Usage: make_regions.py <countries.geojson> <cities_dir> <out.js>"""
import glob, io, json, math, os, re, sys

geo_path, cities_dir, out_path = sys.argv[1:4]
K = math.cos(math.radians(51.8))  # lng scale so distances are roughly isotropic

# Seeds [lat, lng] used only for the partition (shifted a little where the content
# assigns a town to a region that is not strictly the nearest city centre).
SEEDS = {
    "Netherlands": {
        "rotterdam": (51.95, 4.38), "amsterdam": (52.37, 4.90), "denhaag": (52.13, 4.30),
        "utrecht": (52.09, 5.12), "eindhoven": (51.50, 5.25), "arnhem": (51.93, 5.88),
        "maastricht": (50.85, 5.69), "zwolle": (52.58, 6.12), "groningen": (53.20, 6.30),
    },
    "Belgium": {
        "brussel": (50.82, 4.35), "antwerpen": (51.18, 4.42), "gent": (51.03, 3.80),
        "brugge": (51.21, 3.22), "luik": (50.63, 5.57),
    },
}

def clip(poly, a, b):
    """Keep the part of ring `poly` ([lng, lat] points) that is closer to seed a than to seed b."""
    ax, ay, bx, by = a[1] * K, a[0], b[1] * K, b[0]
    nx, ny = bx - ax, by - ay
    c = (bx * bx + by * by - ax * ax - ay * ay) / 2.0
    def side(p): return nx * p[0] * K + ny * p[1] - c  # <= 0 means inside
    out = []
    for i in range(len(poly)):
        p, q = poly[i], poly[(i + 1) % len(poly)]
        sp, sq = side(p), side(q)
        if sp <= 0: out.append(p)
        if (sp < 0 < sq) or (sq < 0 < sp):
            t = sp / (sp - sq)
            out.append([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])])
    return out

def area(ring):
    return abs(sum(ring[i][0] * ring[i - 1][1] - ring[i - 1][0] * ring[i][1] for i in range(len(ring)))) / 2

def inside(pt, ring):  # pt and ring in [lng, lat]
    x, y, res = pt[0], pt[1], False
    for i in range(len(ring)):
        (x1, y1), (x2, y2) = ring[i], ring[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            res = not res
    return res

fc = json.load(io.open(geo_path, encoding="utf-8"))
regions = {}
for feat in fc["features"]:
    name = feat["properties"].get("ADMIN") or feat["properties"].get("NAME")
    if name not in SEEDS: continue
    g = feat["geometry"]
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    seeds = SEEDS[name]
    for poly in polys:
        outer = poly[0][:-1]
        if not (49 < outer[0][1] < 54.5 and 2 < outer[0][0] < 8): continue  # skip overseas parts
        for rid, seed in seeds.items():
            ring = outer
            for other, oseed in seeds.items():
                if other != rid and ring: ring = clip(ring, seed, oseed)
            if len(ring) >= 3 and area(ring) > 1e-4:
                regions.setdefault(rid, []).append([[round(p[1], 4), round(p[0], 4)] for p in ring])

# Report quests that fall into another region's polygon.
for path in sorted(glob.glob(os.path.join(cities_dir, "*.js"))):
    cid = os.path.basename(path)[:-3]
    src = io.open(path, encoding="utf-8").read()
    for qid, lat, lng in re.findall(r"(\w+): \[(-?\d+\.\d+), (-?\d+\.\d+)\]", src):
        pt = [float(lng), float(lat)]
        hit = [r for r, rings in regions.items() if any(inside(pt, [[p[1], p[0]] for p in ring]) for ring in rings)]
        if hit != [cid]: print("mismatch", cid, qid, hit)

io.open(out_path, "w", encoding="utf-8", newline="\n").write(
    "// make_regions.py ile üretildi: her nokta ülkesindeki en yakın bölge merkezine aittir.\n"
    "// Dış sınırlar: Natural Earth (kamu malı).\n"
    "window.REGIONS = " + json.dumps(regions, separators=(",", ":")) + ";\n")
print({k: (len(v), sum(len(r) for r in v)) for k, v in regions.items()}, os.path.getsize(out_path))
