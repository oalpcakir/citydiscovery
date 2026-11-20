"""Builds web/regions.js: fixed region outlines based on travel time from hub cities.

Every Dutch municipality (CBS, via cartomap.github.io/nl) and every Belgian arrondissement, German district
(Kreis), Luxembourg, French département, Danish landsdel, Swiss canton and Turkish province (Eurostat NUTS-3, 1:3 million) joins the hub in its own
country that is fastest to reach by road (OSRM). Denmark's units and Skåne come from the 1:1 million file instead, because at
1:3 million their narrow coasts and small islands (Skagen, Christiansø, Kullaberg) fall outside the outline. The rest of
Sweden stays at 1:3 million to keep web/regions.js small; Switzerland (lakes) and Türkiye (Bosphorus, islands,
coast) also come from the 1:1 million file; move a län into FINE when its region gets quests. Travel times are cached in
tools/traveltimes.json, so the borders only change when hubs change, never because of quest content.

Usage (needs shapely; pillow only for the preview):
  python tools/rebuild_regions.py <nl_gemeente_2023.geojson> <NUTS_RG_03M_2021_4326_LEVL_3.geojson> <NUTS_RG_01M_2021_4326_LEVL_3.geojson> [preview.png]
The files: cartomap.github.io/nl/wgs84/gemeente_2023.geojson and gisco-services.ec.europa.eu/distribution/v2/nuts/geojson/.
"""
import collections, io, json, os, sys, time, urllib.request

from shapely.geometry import shape
from shapely.ops import unary_union
from shapely.strtree import STRtree
from shapely.validation import make_valid

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
nl_path, nuts_path, nuts_fine_path = sys.argv[1:4]
preview = sys.argv[4] if len(sys.argv) > 4 else None
FINE = ("DK", "SE224", "DEF0C", "CH", "TR", "CY", "EL")  # units (by NUTS id prefix) from the 1:1 million file: Denmark, Skåne,
# Schleswig-Flensburg (the Schlei), Switzerland, Türkiye, Cyprus
hubs = {k: v for k, v in json.load(io.open(os.path.join(HERE, "hubs.json"), encoding="utf-8")).items() if not k.startswith("_")}
cache_path = os.path.join(HERE, "traveltimes.json")
cache = json.load(io.open(cache_path, encoding="utf-8")) if os.path.exists(cache_path) else {}
PALETTE = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899"]
# Regions whose automatic colour looked wrong on the map (blue Istanbul vanished into the Bosphorus and the Sea of Marmara).
FIXED_COLORS = {"istanbul": "#ec4899"}

# ── Units ────────────────────────────────────────────────
units = []  # (unit id, country, name, geometry)
for f in json.load(io.open(nl_path, encoding="utf-8"))["features"]:
    p = f["properties"]
    units.append(("NL:" + p["statcode"], "NL", p["statnaam"], make_valid(shape(f["geometry"]))))
nuts = [f for f in json.load(io.open(nuts_path, encoding="utf-8"))["features"] if not f["properties"]["NUTS_ID"].startswith(FINE)]
nuts += [f for f in json.load(io.open(nuts_fine_path, encoding="utf-8"))["features"] if f["properties"]["NUTS_ID"].startswith(FINE)]
for f in nuts:
    p = f["properties"]
    # France: mainland départements and Corsica (the overseas départements, FRY, are left out)
    if p["CNTR_CODE"] in ("BE", "DE", "LU", "FR", "DK", "SE", "CH", "TR", "CY", "EL") and p["LEVL_CODE"] == 3 and not p["NUTS_ID"].startswith("FRY"):
        units.append((p["CNTR_CODE"] + ":" + p["NUTS_ID"], p["CNTR_CODE"], p["NAME_LATN"], make_valid(shape(f["geometry"]))))

# ── Travel times (minutes from each hub point to each unit) ─
hub_points = [(h, i, pt) for h, v in hubs.items() for i, pt in enumerate(v["points"])]


def fetch(country, todo):
    hp = [(h, i, pt) for h, i, pt in hub_points if hubs[h]["country"] == country]
    size = 100 - len(hp)  # the public server takes at most 100 coordinates per table request
    for start in range(0, len(todo), size):
        batch = todo[start:start + size]
        coords = [pt for _, _, pt in hp] + [(u[3].representative_point().y, u[3].representative_point().x) for u in batch]
        url = ("https://router.project-osrm.org/table/v1/driving/" + ";".join("%.5f,%.5f" % (lng, lat) for lat, lng in coords) +
               "?sources=" + ";".join(str(i) for i in range(len(hp))) +
               "&destinations=" + ";".join(str(len(hp) + j) for j in range(len(batch))) + "&annotations=duration")
        req = urllib.request.Request(url, headers={"User-Agent": "city-discovery-region-builder/1.0"})
        data = json.load(urllib.request.urlopen(req, timeout=60))
        if data.get("code") != "Ok":
            raise RuntimeError(data)
        for j, u in enumerate(batch):
            cache[u[0]] = {"%s#%d" % (h, i): (None if data["durations"][k][j] is None else round(data["durations"][k][j] / 60, 1))
                           for k, (h, i, _) in enumerate(hp)}
        print("fetched", country, start + len(batch), "/", len(todo)); sys.stdout.flush()
        time.sleep(1.5)  # be gentle with the public server


need_keys = {"%s#%d" % (h, i) for h, i, _ in hub_points}
for country in ("NL", "BE", "DE", "LU", "FR", "DK", "SE", "CH", "TR", "CY", "EL"):
    todo = [u for u in units if u[1] == country and not need_keys <= set(k for k in cache.get(u[0], {}) if k.split("#")[0] in hubs and hubs[k.split("#")[0]]["country"] == country) | {k for k in need_keys if hubs[k.split("#")[0]]["country"] != country}]
    if todo:
        fetch(country, todo)
json.dump(cache, io.open(cache_path, "w", encoding="utf-8"), indent=0, sort_keys=True)

# ── Assignment: fastest hub in the same country ──────────
assign = {}
for uid, country, name, g in units:
    best, bt = None, 1e9
    for h, v in hubs.items():
        if v["country"] != country: continue
        times = [cache[uid].get("%s#%d" % (h, i)) for i in range(len(v["points"]))]
        times = [t for t in times if t is not None]
        if times and min(times) < bt: best, bt = h, min(times)
    if best is None:  # unreachable by road: fall back to straight-line distance
        c = g.representative_point()
        best = min((h for h, v in hubs.items() if v["country"] == country),
                   key=lambda h: min((c.y - p[0]) ** 2 + ((c.x - p[1]) * 0.62) ** 2 for p in hubs[h]["points"]))
    assign[uid] = best

overrides = json.load(io.open(os.path.join(HERE, "hubs.json"), encoding="utf-8")).get("_overrides", {})
for uid, h in overrides.items():
    if uid in assign and h in hubs: assign[uid] = h

# Enclaves: a unit entirely surrounded by one other region joins it.
geoms = [u[3] for u in units]
tree = STRtree([g.buffer(0.0005) for g in geoms])
for _ in range(2):
    for i, (uid, country, name, g) in enumerate(units):
        nb = [j for j in tree.query(g.buffer(0.0005)) if j != i and units[j][1] == country]
        if len(nb) >= 2:
            cnt = collections.Counter(assign[units[j][0]] for j in nb)
            top, n = cnt.most_common(1)[0]
            if top != assign[uid] and n == len(nb) and uid not in overrides:
                assign[uid] = top

FINE_HUBS = {assign[u[0]] for u in units if u[0].split(":")[1].startswith(FINE)}

# ── Merge into outlines ──────────────────────────────────
shapes = {}
for h in hubs:
    gs = [u[3] for u in units if assign[u[0]] == h]
    if gs:
        shapes[h] = unary_union(gs).buffer(0.0004).buffer(-0.0004).simplify(0.0018, preserve_topology=True)


def ring(coords):
    pts, last = [], None
    for x, y in coords:
        p = [round(y, 4), round(x, 4)]
        if p != last: pts.append(p); last = p
    if len(pts) > 1 and pts[0] == pts[-1]: pts.pop()
    return pts


out = {}
for h, g in shapes.items():
    out[h] = []
    for p in (list(g.geoms) if g.geom_type == "MultiPolygon" else [g]):
        if p.area < (3e-6 if h in FINE_HUBS else 3e-5): continue  # keep small inhabited islands such as Christiansø
        out[h].append([ring(p.exterior.coords)] + [ring(r.coords) for r in p.interiors if abs(r.convex_hull.area) > 3e-5])

# Colours: neighbouring regions never share one. Regions keep the colour they already had (from the current
# web/regions.js) as long as no neighbour has it, so adding regions does not repaint the map.
old_colors = {}
try:
    import re as _re
    _m = _re.search(r"window\.REGION_COLORS = (\{.*?\});", io.open(os.path.join(ROOT, "web", "regions.js"), encoding="utf-8").read())
    old_colors = json.loads(_m.group(1)) if _m else {}
except OSError:
    pass
ids = sorted(shapes, key=lambda r: -shapes[r].area)
adj = {r: set() for r in ids}
for a in ids:
    for b in ids:
        if a < b and shapes[a].buffer(0.02).intersects(shapes[b]):
            adj[a].add(b); adj[b].add(a)
colors = {r: c for r, c in FIXED_COLORS.items() if r in adj}
for r in sorted(ids, key=lambda r: -len(adj[r])):  # first pass: keep old colours where they still fit
    if r in colors:
        continue
    if old_colors.get(r) in PALETTE and all(colors.get(n) != old_colors[r] for n in adj[r]):
        colors[r] = old_colors[r]
for r in sorted(ids, key=lambda r: -len(adj[r])):
    if r in colors:
        continue
    used = {colors[n] for n in adj[r] if n in colors}
    count = collections.Counter(colors.values())
    colors[r] = min([c for c in PALETTE if c not in used] or PALETTE, key=lambda c: count[c])

with io.open(os.path.join(ROOT, "web", "regions.js"), "w", encoding="utf-8", newline="\n") as f:
    f.write("// Generated by tools/rebuild_regions.py: each municipality (NL), arrondissement (BE), district (DE, LU), département (FR), landsdel (DK), län (SE), canton (CH) or province (TR) belongs to\n"
            "// the hub city that is fastest to reach by road. Boundaries: CBS municipalities, Eurostat NUTS-3; travel times: OSRM.\n"
            "// REGIONS[id] = polygons; polygon = rings (outer first, then holes); ring = [[lat, lng], ...]\n"
            "window.REGIONS = " + json.dumps(out, separators=(",", ":")) + ";\n"
            "window.REGION_COLORS = " + json.dumps(colors, separators=(",", ":")) + ";\n"
            "// Names for regions that have no quests yet (shown as 'coming soon').\n"
            "window.REGION_INFO = " + json.dumps({h: {"name": v["name"], "subtitle": v.get("subtitle", ""), "cc": v["country"],
                                                     "at": v["points"][0]} for h, v in hubs.items() if v.get("name") and h in out},
                                                 ensure_ascii=False, separators=(",", ":")) + ";\n")
json.dump({u[0]: [u[2], assign[u[0]]] for u in units}, io.open(os.path.join(HERE, "unit_assignment.json"), "w", encoding="utf-8"),
          indent=0, ensure_ascii=False, sort_keys=True)
print({h: sum(1 for u in units if assign[u[0]] == h) for h in hubs})

if preview:
    from PIL import Image, ImageDraw
    W, H, west, east, south, north = 1500, 1650, -5.2, 15.2, 41.3, 55.1
    kx, ky = W / (east - west), H / (north - south)
    img = Image.new("RGB", (W, H), "#dbeafe"); d = ImageDraw.Draw(img)
    pr = lambda lat, lng: ((lng - west) * kx, (north - lat) * ky)
    for h, plist in out.items():
        for pol in plist:
            d.polygon([pr(*p) for p in pol[0]], fill=colors[h], outline="#ffffff")
            for hole in pol[1:]: d.polygon([pr(*p) for p in hole], fill="#dbeafe", outline="#ffffff")
    for h, v in hubs.items():
        for p in v["points"]:
            x, y = pr(*p); d.ellipse([x - 4, y - 4, x + 4, y + 4], fill="#111827"); d.text((x + 6, y - 6), h, fill="#111827")
    img.save(preview)
