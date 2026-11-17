"""Reads and writes web/cities/<region>.js files as plain Python data.

The files are JavaScript object literals with unquoted keys. `load` turns one into a dict by quoting the keys
and dropping comments and trailing commas (string contents are left untouched); `dump` writes the canonical
layout the other tools expect (one quest per block, three coordinates per line).
"""
import io, json, re

HEADER = ("// Quests for the %s region.\n"
          "// cat: gor (see) | ye (eat & drink) | dene (do); area: a key of `areas`;\n"
          "// months: only for quests tied to certain months (1-12). To add a region, add a hub to tools/hubs.json\n"
          "// and run tools/rebuild_regions.py and tools/reassign_quests.py.\n")


def _to_json(src):
    out, i, n = [], 0, len(src)
    while i < n:
        c = src[i]
        if c == '"':  # copy a string literal verbatim
            j = i + 1
            while src[j] != '"':
                j += 2 if src[j] == "\\" else 1
            out.append(src[i:j + 1]); i = j + 1; continue
        if src.startswith("//", i):  # line comment
            i = src.index("\n", i) if "\n" in src[i:] else n; continue
        m = re.match(r"[A-Za-z_][A-Za-z0-9_]*", src[i:])
        if m and re.match(r"\s*:", src[i + m.end():]):
            out.append('"%s"' % m.group(0)); i += m.end(); continue
        out.append(c); i += 1
    text = "".join(out)
    return re.sub(r",(\s*[}\]])", r"\1", text)


def load(path):
    s = io.open(path, encoding="utf-8").read()
    body = s[s.index("= {", s.index("window.CITIES.")) + 2:].strip().rstrip(";").strip()
    return json.loads(_to_json(body))


J = lambda v: json.dumps(v, ensure_ascii=False)


def dump(path, c):
    L = [HEADER % c["name"], "window.CITIES = window.CITIES || {};", "window.CITIES.%s = {" % c["id"]]
    for k in ("id", "name", "subtitle", "country"):
        L.append("  %s: %s," % (k, J(c[k])))
    L.append("  levels: %s," % J(c["levels"]))
    L.append("  areas: {")
    L.append(",\n".join("    %s: %s" % (k, J(v)) for k, v in c["areas"].items()))
    L.append("  },")
    L.append("  // Map view when the region opens (the main city) and quest positions [lat, lng].")
    L.append("  bounds: %s," % J(c["bounds"]))
    L.append("  coords: {")
    items = ["%s: [%.4f, %.4f]" % (q["id"], c["coords"][q["id"]][0], c["coords"][q["id"]][1]) for q in c["quests"]]
    L.append(",\n".join("    " + ", ".join(items[i:i + 3]) for i in range(0, len(items), 3)))
    L.append("  },")
    L.append("  // Area badges: a third of an area's quests earns bronze, two thirds silver, all of them gold.")
    L.append("  areaBadges: {")
    L.append(",\n".join("    %s: { icon: %s, name: %s }" % (k, J(v["icon"]), J(v["name"])) for k, v in c["areaBadges"].items()))
    L.append("  },")
    L.append("  quests: [")
    qs = []
    for q in c["quests"]:
        extra = "".join(", %s: %s" % (k, J(q[k])) for k in ("months", "tags", "src") if q.get(k))
        qs.append("    { id: %s, cat: %s, area: %s, title: %s,\n      desc: %s,\n      tip: %s, q: %s%s }" % (
            J(q["id"]), J(q["cat"]), J(q["area"]), J(q["title"]), J(q["desc"]), J(q.get("tip", "")), J(q["q"]), extra))
    L.append(",\n".join(qs))
    L.append("  ]")
    L.append("};")
    text = "\n".join(L) + "\n"
    for attempt in range(8):  # OneDrive can briefly lock files while syncing
        try:
            with io.open(path, "w", encoding="utf-8", newline="\n") as f:
                f.write(text)
            return
        except OSError:
            import time; time.sleep(0.5 * (attempt + 1))
    raise OSError("could not write " + path)
