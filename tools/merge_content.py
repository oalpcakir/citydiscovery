"""Araştırma çıktısını (content/*.json) bir bölge dosyasına ekler.
Kullanım: python tools/merge_content.py <bölge-id> content/a.json [content/b.json ...]
JSON biçimi: { "new": [ {id, cat, area, title, desc, tip, q, ll:[lat,lng], months?, tags?, src?} ] }"""
import io, json, re, sys

city, files = sys.argv[1], sys.argv[2:]
path = "web/cities/%s.js" % city
s = io.open(path, encoding="utf-8").read()
J = lambda v: json.dumps(v, ensure_ascii=False)

existing = set(re.findall(r'\{ id: "(\w+)"', s))
areas = set(re.findall(r"^    (\w+): \"", s[s.index("  areas: {"):s.index("  bounds:")], re.M))
coords, quests, skipped = [], [], []
for f in files:
    for q in json.load(io.open(f, encoding="utf-8"))["new"]:
        ok = (re.fullmatch(r"[a-z0-9]+", q["id"]) and q["id"] not in existing and q["cat"] in ("gor", "ye", "dene")
              and q["area"] in areas and len(q.get("ll", [])) == 2)
        if not ok:
            skipped.append((f, q["id"])); continue
        existing.add(q["id"])
        lat, lng = q["ll"]
        coords.append("%s: [%.4f, %.4f]" % (q["id"], lat, lng))
        extra = ""
        if q.get("months"): extra += ", months: " + J(q["months"])
        if q.get("tags"): extra += ", tags: " + J(q["tags"])
        if q.get("src"): extra += ", src: " + J(q["src"])
        quests.append('    { id: %s, cat: %s, area: %s, title: %s,\n      desc: %s,\n      tip: %s, q: %s%s }' % (
            J(q["id"]), J(q["cat"]), J(q["area"]), J(q["title"]), J(q["desc"]), J(q.get("tip", "")), J(q["q"]), extra))

# coords bloğunun sonuna ekle
a = s.index("  coords: {"); b = s.index("\n  },", a)
lines = ["    " + ", ".join(coords[i:i + 3]) for i in range(0, len(coords), 3)]
s = s[:b].rstrip().rstrip(",") + ",\n" + ",\n".join(lines) + s[b:]
# quests listesinin sonuna ekle
e = s.rindex("\n  ]\n};")
s = s[:e].rstrip().rstrip(",") + ",\n" + ",\n".join(quests) + s[e:]
io.open(path, "w", encoding="utf-8", newline="\n").write(s)
print("added", len(quests), "skipped", skipped, "total", len(re.findall(r'\{ id: "', s)))
