"""Applies a quest audit: removes quests that are closed for good and applies text fixes.

Input files: {"results": [{key, verdict: ok|fix|closed|unsure, evidence, note, fix?: {title, desc, tip, q, ll, months}}]}
Usage: python tools/apply_audit.py audit1.json [audit2.json ...]
"""
import io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import regions_io as R

results = []
for f in sys.argv[1:]:
    results += json.load(io.open(f, encoding="utf-8"))["results"]
cities, touched = {}, set()


def city(cid):
    if cid not in cities:
        cities[cid] = R.load(os.path.join(ROOT, "web", "cities", cid + ".js"))
    return cities[cid]


removed, fixed, unsure = [], [], []
for r in results:
    cid, qid = r["key"].split("/")
    c = city(cid)
    q = next((x for x in c["quests"] if x["id"] == qid), None)
    if q is None:
        continue
    if r["verdict"] == "closed":
        c["quests"].remove(q); c["coords"].pop(qid, None); touched.add(cid)
        removed.append((r["key"], q["title"], r.get("note", "")))
    elif r["verdict"] == "fix" and r.get("fix"):
        for k, v in r["fix"].items():
            if k == "ll" and isinstance(v, list) and len(v) == 2:
                c["coords"][qid] = [round(v[0], 4), round(v[1], 4)]
            elif k in ("title", "desc", "tip", "q") and isinstance(v, str) and v.strip():
                q[k] = v.strip()
            elif k == "months":
                if v: q["months"] = v
                else: q.pop("months", None)
        touched.add(cid)
        fixed.append((r["key"], q["title"], r.get("note", "")))
    elif r["verdict"] == "unsure":
        unsure.append((r["key"], q["title"], r.get("note", "")))

for cid in touched:
    R.dump(os.path.join(ROOT, "web", "cities", cid + ".js"), cities[cid])
for label, rows in (("REMOVED", removed), ("FIXED", fixed), ("UNSURE", unsure)):
    print("%s (%d)" % (label, len(rows)))
    for k, t, n in rows:
        print("  %-30s %s | %s" % (k, t[:50], n[:140]))
