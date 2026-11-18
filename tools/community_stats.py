"""Builds web/community.json: anonymous totals over all signed-in explorers, for the Stats → Everyone screen
and the "Done by N explorers" line on quests. Run once a day by .github/workflows/community.yml.

Needs a Firebase service account key (JSON text) in the environment variable FIREBASE_SERVICE_ACCOUNT;
see docs/community-stats.md. Without it the script says so and changes nothing.

Only totals are written, never who did what:
  explorers   how many explorers have done at least one quest
  quests      per quest key, how many explorers have done it
  regions     per region id, how many explorers have done a quest there
  countries   per country name, the same
  recent      per quest key, explorers who did it in the last 30 days
Counts below MIN_COUNT are left out, and nothing at all is published until MIN_EXPLORERS explorers have a quest.
Explorers who turned off "Count me in the community rankings" (profile.noStats) are skipped.

Usage: python tools/community_stats.py [--dry-run]
"""
import glob, io, json, os, re, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "web", "community.json")
MIN_COUNT = 3
MIN_EXPLORERS = 10
RECENT_DAYS = 30


def region_countries():
    out = {}
    for path in glob.glob(os.path.join(ROOT, "web", "cities", "*.js")):
        text = io.open(path, encoding="utf-8").read()
        rid = re.search(r'\bid:\s*"([^"]+)"', text)
        country = re.search(r'\bcountry:\s*"([^"]+)"', text)
        if rid and country:
            out[rid.group(1)] = country.group(1)
    return out


def moved_keys():
    text = io.open(os.path.join(ROOT, "web", "moved.js"), encoding="utf-8").read()
    return dict(re.findall(r'"([^"]+)":\s*"([^"]+)"', text))


def tally(saves, countries, moved, now_ms):
    """saves: the parsed `data` of each user document. Returns the dict written to community.json."""
    quests, regions, ctry, recent, explorers = {}, {}, {}, {}, 0
    since = now_ms - RECENT_DAYS * 86400000
    for s in saves:
        if (s.get("profile") or {}).get("noStats"):
            continue
        done = {}
        for key, rec in (s.get("done") or {}).items():
            if not isinstance(rec, dict) or not rec.get("at"):
                continue
            key = moved.get(key, key)
            if key.split("/")[0] in countries:
                done[key] = rec["at"]
        if not done:
            continue
        explorers += 1
        regs = {k.split("/")[0] for k in done}
        for k, at in done.items():
            quests[k] = quests.get(k, 0) + 1
            if at >= since:
                recent[k] = recent.get(k, 0) + 1
        for r in regs:
            regions[r] = regions.get(r, 0) + 1
        for c in {countries[r] for r in regs}:
            ctry[c] = ctry.get(c, 0) + 1
    keep = lambda d: {k: v for k, v in sorted(d.items()) if v >= MIN_COUNT}
    day = time.strftime("%Y-%m-%d", time.gmtime(now_ms / 1000))
    if explorers < MIN_EXPLORERS:
        return {"updated": day, "explorers": 0}
    return {"updated": day, "explorers": explorers, "quests": keep(quests), "regions": keep(regions),
            "countries": keep(ctry), "recent": keep(recent)}


def load_saves():
    import firebase_admin
    from firebase_admin import credentials, firestore
    firebase_admin.initialize_app(credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT"])))
    saves = []
    for doc in firestore.client().collection("users").stream():
        raw = (doc.to_dict() or {}).get("data")
        try:
            saves.append(json.loads(raw) if raw else {})
        except ValueError:
            pass
    return saves


def main():
    if not os.environ.get("FIREBASE_SERVICE_ACCOUNT"):
        print("FIREBASE_SERVICE_ACCOUNT is not set; nothing to do (see docs/community-stats.md).")
        return
    out = tally(load_saves(), region_countries(), moved_keys(), int(time.time() * 1000))
    text = json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n"
    print("explorers:", out["explorers"], "| quests listed:", len(out.get("quests", {})))
    if "--dry-run" in sys.argv:
        return
    old = io.open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
    strip = lambda t: re.sub(r'"updated":"[^"]*",?', "", t)
    if strip(old) == strip(text):  # same totals: keep the file as it is, so no commit is made
        print("No change in the totals.")
        return
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(text)
    print("Wrote", OUT)


if __name__ == "__main__":
    main()
