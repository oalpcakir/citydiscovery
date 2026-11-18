"""Precomputes walking geometries for all trails so the live app makes zero external routing calls.
Usage: python tools/build_routes.py
"""
import io, json, math, os, re, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CITIES_DIR = os.path.join(ROOT, "web", "cities")
CACHE_FILE = os.path.join(ROOT, "tools", "trail_routes_cache.json")
OUT_FILE = os.path.join(ROOT, "web", "routes.js")
OSRM_URL = "https://routing.openstreetmap.de/routed-foot/route/v1/driving/{path}?overview=full&geometries=geojson"

def km(a, b):
    return math.hypot((a[0] - b[0]) * 111.32, (a[1] - b[1]) * 111.32 * math.cos(math.radians(a[0])))

def route_km(lst):
    return sum(km(lst[i - 1]["ll"], lst[i]["ll"]) for i in range(1, len(lst)))

def best_route(pool, min_stops, max_stops, max_km):
    pool = [q for q in pool if q.get("ll")]
    if len(pool) < min_stops:
        return None
    best = None
    for start in pool[:24]:
        route, total = [start], 0.0
        while len(route) < max_stops:
            last = route[-1]
            pick, pd = None, float("inf")
            for q in pool:
                if q in route:
                    continue
                d = km(last["ll"], q["ll"])
                if d < pd:
                    pd, pick = d, q
            if not pick or total + pd > max_km:
                break
            route.append(pick)
            total += pd
        if len(route) < min_stops:
            continue
        cats = {q["cat"] for q in route}
        score = len(route) * 10 + len(cats) * 3 - total
        if not best or score > best[0]:
            best = (score, route)
    if not best:
        return None
    r = list(best[1])
    improved = True
    while improved:
        improved = False
        for i in range(1, len(r) - 1):
            for j in range(i + 1, len(r)):
                cand = r[:i] + list(reversed(r[i : j + 1])) + r[j + 1 :]
                if route_km(cand) < route_km(r) - 0.01:
                    r = cand
                    improved = True
    return r

def load_cities():
    cities = {}
    for fn in sorted(os.listdir(CITIES_DIR)):
        if not fn.endswith(".js"):
            continue
        raw = io.open(os.path.join(CITIES_DIR, fn), encoding="utf-8").read()
        m = re.search(r'window\.CITIES\["([^"]+)"\]\s*=\s*(\{.*\})\s*;?\s*$', raw, re.S)
        if not m:
            continue
        cid = m.group(1)
        data = json.loads(m.group(2))
        coords = data.get("coords") or {}
        for q in data.get("quests") or []:
            q["ll"] = coords.get(q["id"])
        cities[cid] = data
    return cities

def build_trails(cities):
    all_trails = []
    for cid, c in cities.items():
        lst = []
        in_city = [q for q in c.get("quests", []) if q.get("area") != "cevre" and q.get("ll") and not q.get("months")]
        def add(route):
            if not route:
                return
            if any(sum(1 for q in route if q in t) > len(route) / 2 for t in lst):
                return
            lst.append(route)
        for a in (c.get("areas") or {}).keys():
            if a == "cevre":
                continue
            pool = [q for q in in_city if q.get("area") == a and q.get("cat") != "ye"]
            add(best_route(pool, 4, 7, 3.2))
        add(best_route([q for q in in_city if q.get("cat") == "ye"], 4, 6, 3.5))
        add(best_route([q for q in in_city if "rainy day" in (q.get("tags") or [])], 3, 5, 4.0))
        rest = [q for q in c.get("quests", []) if q.get("area") == "cevre" and q.get("ll") and not q.get("months")]
        groups = []
        for q in rest:
            g = next((g for g in groups if any(km(x["ll"], q["ll"]) < 2.5 for x in g)), None)
            if g:
                g.append(q)
            else:
                groups.append([q])
        for g in sorted([g for g in groups if len(g) >= 3], key=len, reverse=True)[:4]:
            add(best_route(g, 3, 6, 6.0))
        all_trails.extend(lst)
    return all_trails

def sig_of(route):
    return ";".join(f"{q['ll'][0]:.4f},{q['ll'][1]:.4f}" for q in route)

def fetch_route(route):
    path = ";".join(f"{q['ll'][1]:.5f},{q['ll'][0]:.5f}" for q in route)
    req = urllib.request.Request(OSRM_URL.format(path=path), headers={"User-Agent": "CityDisco-Build/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        d = json.loads(resp.read().decode("utf-8"))
    rt = (d.get("routes") or [None])[0]
    if d.get("code") != "Ok" or not rt:
        return None
    coords = [[round(p[0], 5), round(p[1], 5)] for p in rt["geometry"]["coordinates"]]
    return {"c": coords, "km": round(rt["distance"] / 100) / 10, "min": round(rt["duration"] / 60)}

def main():
    cache = {}
    if os.path.exists(CACHE_FILE):
        cache = json.load(io.open(CACHE_FILE, encoding="utf-8"))
    cities = load_cities()
    trails = build_trails(cities)
    active = {}
    fetched = 0
    for route in trails:
        sig = sig_of(route)
        if sig not in cache:
            try:
                res = fetch_route(route)
                if res:
                    cache[sig] = res
                    fetched += 1
                    print(f"Fetched route ({fetched}): {sig[:32]}...")
                    time.sleep(0.35)
            except Exception as e:
                print(f"Warning: could not fetch {sig[:32]}: {e}")
        if sig in cache:
            active[sig] = cache[sig]
    with io.open(CACHE_FILE, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cache, f, separators=(",", ":"))
    with io.open(OUT_FILE, "w", encoding="utf-8", newline="\n") as f:
        f.write("// Built by tools/build_routes.py. Precomputed walking paths for trails.\n")
        f.write("window.TRAIL_ROUTES = " + json.dumps(active, separators=(",", ":")) + ";\n")
    print(f"web/routes.js: {len(active)}/{len(trails)} trails ready ({fetched} newly fetched).")

if __name__ == "__main__":
    main()
