"""Quest targets per region, and how far each region is from its target.

Target = 60 + 35 per million inhabitants above the first million, plus the hub's "visit" bonus in tools/hubs.json
(tourism: 100 for Paris, 50 for major international destinations, 25 for other well-visited regions), kept between
60 and 300. Population: tools/population.json (per municipality / NUTS-3 unit), summed over tools/unit_assignment.json.

Usage: python tools/targets.py            (filled regions, biggest gap first)
       python tools/targets.py --next     (empty regions bordering a filled one, biggest target first)
"""
import glob, io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import regions_io as R

hubs = {k: v for k, v in json.load(io.open(os.path.join(HERE, "hubs.json"), encoding="utf-8")).items() if not k.startswith("_")}
units = json.load(io.open(os.path.join(HERE, "population.json"), encoding="utf-8"))["units"]
assign = json.load(io.open(os.path.join(HERE, "unit_assignment.json"), encoding="utf-8"))
pop = {}
for uid, (name, hub) in assign.items():
    pop[hub] = pop.get(hub, 0) + units.get(uid, 0)


def target(h):
    t = 60 + 35 * max(0.0, pop.get(h, 0) / 1e6 - 1) + hubs[h].get("visit", 0)
    return int(round(min(300, max(60, t)) / 5) * 5)


filled = {os.path.basename(p)[:-3]: len(R.load(p)["quests"]) for p in glob.glob(os.path.join(ROOT, "web", "cities", "*.js"))}

if "--next" in sys.argv:
    from shapely.geometry import Polygon, MultiPolygon
    src = io.open(os.path.join(ROOT, "web", "regions.js"), encoding="utf-8").read()
    REG = json.loads(re.search(r"window\.REGIONS = (\{.*?\});\n", src, re.S).group(1))
    shape = {h: MultiPolygon([Polygon([(p[1], p[0]) for p in poly[0]], [[(p[1], p[0]) for p in hole] for hole in poly[1:]]) for poly in rings]).buffer(0)
             for h, rings in REG.items()}
    rows = []
    for h in REG:
        if h in filled:
            continue
        nb = sorted(f for f in filled if f in shape and shape[h].buffer(0.02).intersects(shape[f]))
        if nb:
            rows.append((target(h), h, pop.get(h, 0), hubs[h].get("visit", 0), nb))
    print("%-14s %-36s %7s %6s %7s  %s" % ("region", "name", "pop(k)", "visit", "target", "borders"))
    for t, h, p, v, nb in sorted(rows, key=lambda r: (-r[0], r[1])):
        print("%-14s %-36s %7d %6d %7d  %s" % (h, (hubs[h].get("name", h) + " " + hubs[h].get("subtitle", ""))[:36], p / 1000, v, t, ", ".join(nb)))
    print("%d regions, %d quests to reach their targets" % (len(rows), sum(r[0] for r in rows)))
else:
    rows = sorted(((target(h) - n, h, n) for h, n in filled.items()), reverse=True)
    print("%-12s %7s %6s %7s %7s %5s" % ("region", "pop(k)", "visit", "target", "quests", "gap"))
    for gap, h, n in rows:
        print("%-12s %7d %6d %7d %7d %5s" % (h, pop.get(h, 0) / 1000, hubs[h].get("visit", 0), target(h), n, gap if gap > 0 else "ok"))
    print("total gap: %d quests in %d regions" % (sum(g for g, _, _ in rows if g > 0), sum(1 for g, _, _ in rows if g > 0)))
