"""Merges researched treasure cards into the app.

Reads content/treasures/<region>.json ({"picks": [5 quest ids], "cards": {id: {name, art, slogan, line, by?, source}}}),
checks the picks against web/cities/<region>.js (they exist, no seasonal quests, at most 2 per area (3 if the region has only 2 areas), at most 1 eat &
drink) and the card texts, then writes the picks into tools/treasures_manual.json and the texts (without `source`)
into web/treasure_cards.js keyed "<region>/<id>". Entries of regions without a research file (Amsterdam, Rotterdam)
are kept as they are. Finally runs tools/pick_treasures.py --offline so web/treasures.js follows the hand picks.

Usage: python tools/merge_treasure_cards.py [--check]   (--check: report problems, write nothing)
"""
import glob, io, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import regions_io as R

ARTS = {"tower", "bridge", "windmill", "museum", "palace", "canalhouses", "cubes", "market", "church", "castle",
        "park", "harbour", "skyline"}
CARDS_JS = os.path.join(ROOT, "web", "treasure_cards.js")
MANUAL = os.path.join(HERE, "treasures_manual.json")
HEADER = """// Treasure card texts, keyed by quest key. name: the landmark, short. art: the drawing on the card (tower, bridge,
// windmill, museum, palace, canalhouses, cubes, market, church, castle, park, harbour, skyline). slogan: one line of our own.
// line: a real quote (with `by`) or a true fact (no `by`). Quotes must be verified before they go in.
// Cards without an entry still work: the name comes from the quest and the drawing is guessed from its words.
"""


def load_cards():
    src = io.open(CARDS_JS, encoding="utf-8").read()
    return json.loads(R._to_json(src[src.index("{"):src.rindex("}") + 1]))


def check(rid, data):
    errs, warns = [], []
    path = os.path.join(ROOT, "web", "cities", rid + ".js")
    if not os.path.exists(path):
        return ["no region file"], warns
    region = R.load(path)
    quests = {q["id"]: q for q in region["quests"]}
    per_area = max(2, -(-5 // len(region["areas"])))  # regions with only two areas may have three in one
    picks, cards = data.get("picks", []), data.get("cards", {})
    if len(picks) != 5 or len(set(picks)) != 5:
        errs.append("need 5 different picks, got %d" % len(set(picks)))
    areas, eat = {}, 0
    for i in picks:
        q = quests.get(i)
        if not q:
            errs.append("%s: no such quest" % i); continue
        if q.get("months"):
            errs.append("%s: seasonal quest" % i)
        areas[q["area"]] = areas.get(q["area"], 0) + 1
        eat += q["cat"] == "ye"
        if q["cat"] != "gor":
            warns.append("%s: cat %s" % (i, q["cat"]))
        c = cards.get(i)
        if not c:
            errs.append("%s: no card" % i); continue
        for k in ("name", "art", "slogan", "line"):
            if not (c.get(k) or "").strip():
                errs.append("%s: no %s" % (i, k))
        if c.get("art") not in ARTS:
            errs.append("%s: art %r" % (i, c.get("art")))
        if len(c.get("slogan", "")) > 80:
            warns.append("%s: slogan %d chars" % (i, len(c["slogan"])))
        if c.get("by") and len(c.get("line", "").split()) > 25:
            warns.append("%s: quote %d words" % (i, len(c["line"].split())))
    if any(n > per_area for n in areas.values()) and not data.get("waive_area_cap"):  # a reason why, when a region's sights all sit in one area
        errs.append("more than %d picks in one area: %s" % (per_area, areas))
    if eat > 1:
        errs.append("more than 1 eat & drink pick")
    return errs, warns


def main():
    only_check = "--check" in sys.argv
    existing = load_cards()
    manual = json.load(io.open(MANUAL, encoding="utf-8"))
    researched, bad = {}, 0
    for f in sorted(glob.glob(os.path.join(ROOT, "content", "treasures", "*.json"))):
        rid = os.path.splitext(os.path.basename(f))[0]
        data = json.load(io.open(f, encoding="utf-8"))
        errs, warns = check(rid, data)
        for w in warns:
            print("  warn %s: %s" % (rid, w))
        if errs:
            bad += 1
            print("SKIP %s: %s" % (rid, "; ".join(errs))); continue
        researched[rid] = data
    print("regions ok:", len(researched), " skipped:", bad)
    if only_check:
        return
    cards = {k: v for k, v in existing.items() if k.split("/")[0] not in researched}
    for rid, data in researched.items():
        manual[rid] = data["picks"]
        for i in data["picks"]:
            c = data["cards"][i]
            cards[rid + "/" + i] = {k: c[k].strip() for k in ("name", "art", "slogan", "line", "by") if c.get(k, "").strip()}
    manual = dict(sorted(manual.items()))
    with io.open(MANUAL, "w", encoding="utf-8", newline="\n") as f:
        f.write("{\n" + ",\n".join('  %s: %s' % (json.dumps(k), json.dumps(v, ensure_ascii=False)) for k, v in manual.items()) + "\n}\n")
    order = sorted(cards, key=lambda k: (k.split("/")[0], manual.get(k.split("/")[0], []).index(k.split("/")[1])
                                         if k.split("/")[1] in manual.get(k.split("/")[0], []) else 99))
    entries = []
    for k in order:
        c, j = cards[k], lambda s: json.dumps(s, ensure_ascii=False)
        e = "  %s: { name: %s, art: %s,\n    slogan: %s,\n    line: %s" % (j(k), j(c["name"]), j(c["art"]), j(c["slogan"]), j(c["line"]))
        if c.get("by"):
            e += ", by: %s" % j(c["by"])
        entries.append(e + " }")
    with io.open(CARDS_JS, "w", encoding="utf-8", newline="\n") as f:
        f.write(HEADER + "window.TREASURE_CARDS = {\n" + ",\n".join(entries) + "\n};\n")
    print("cards written:", len(cards))
    r = subprocess.run([sys.executable, os.path.join(HERE, "pick_treasures.py"), "--offline"], capture_output=True, text=True)
    print(r.stdout.strip().splitlines()[-1] if r.returncode == 0 else r.stderr)


if __name__ == "__main__":
    main()
