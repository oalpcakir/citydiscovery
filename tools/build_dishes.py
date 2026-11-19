"""Builds web/dishes.js (the must-eat dishes per region) from content/dishes/<region>.json.

  python tools/build_dishes.py

Each file: {"region": "<id>", "dishes": [{"id", "name", "local", "icon", "desc", "kw": [...]}, ...]}, 4 to 7
dishes. The research rules are in content/dishes/_brief.md. Files starting with "_" are ignored.
"""
import io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "content", "dishes")
OUT = os.path.join(ROOT, "web", "dishes.js")
CITIES = os.path.join(ROOT, "web", "cities")


def main():
    regions = {fn[:-3] for fn in os.listdir(CITIES) if fn.endswith(".js")}
    out, problems, ids = {}, [], set()
    for fn in sorted(os.listdir(SRC)):
        if not fn.endswith(".json") or fn.startswith("_"):
            continue
        data = json.load(io.open(os.path.join(SRC, fn), encoding="utf-8"))
        rid = data.get("region") or fn[:-5]
        if rid not in regions:
            problems.append("%s: unknown region %s" % (fn, rid)); continue
        dishes = []
        for d in data.get("dishes", []):
            missing = [k for k in ("id", "name", "icon", "desc") if not d.get(k)]
            if missing:
                problems.append("%s: %s misses %s" % (rid, d.get("name", "?"), ", ".join(missing))); continue
            if d["id"] in ids:
                problems.append("%s: duplicate id %s" % (rid, d["id"])); continue
            ids.add(d["id"])
            if len(d["desc"]) > 260:
                problems.append("%s: long description for %s (%d chars)" % (rid, d["name"], len(d["desc"])))
            dishes.append({"id": d["id"], "name": d["name"], "local": d.get("local") or "", "icon": d["icon"],
                           "desc": d["desc"], "kw": [k.lower() for k in d.get("kw") or []]})
        if not 4 <= len(dishes) <= 7:
            problems.append("%s: %d dishes (expected 4 to 7)" % (rid, len(dishes)))
        out[rid] = dishes
    lines = ["// Must-eat dishes per region, built by tools/build_dishes.py from content/dishes/. Do not edit by hand.",
             "window.DISHES = {"]
    lines.append(",\n".join("  %s: %s" % (rid, json.dumps(out[rid], ensure_ascii=False)) for rid in sorted(out)))
    lines.append("};")
    io.open(OUT, "w", encoding="utf-8", newline="\n").write("\n".join(lines) + "\n")
    missing = sorted(regions - set(out))
    print("%d regions, %d dishes -> web/dishes.js" % (len(out), sum(len(v) for v in out.values())))
    if missing:
        print("no dishes yet:", " ".join(missing))
    for p in problems:
        print("!", p)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
