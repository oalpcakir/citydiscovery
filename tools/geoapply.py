"""Applies OpenStreetMap coordinates from tools/geocheck.py output where they differ by 150 m to 3 km.

Larger differences are usually a wrong match (a namesake elsewhere), so they are only listed for review.
Usage: python tools/geoapply.py web/cities geo.txt [more.txt ...]
"""
import io, re, sys

cities_dir, geo_files = sys.argv[1], sys.argv[2:]
applied, review = 0, []
for gf in geo_files:
    for line in io.open(gf, encoding="utf-8"):
        parts = line.rstrip("\n").split("\t")
        if len(parts) < 4 or not parts[1].endswith("m"):
            continue
        city, qid = parts[0].split(":")
        d = int(parts[1][:-1])
        if d < 150:
            continue
        if d > 3000:
            review.append(line.strip()); continue
        lat, lng = [float(x) for x in parts[2].split(",")]
        path = "%s/%s.js" % (cities_dir, city)
        s = io.open(path, encoding="utf-8").read()
        others = [(float(a), float(b)) for k, a, b in re.findall(r"(\w+): \[(-?\d+\.\d+), (-?\d+\.\d+)\]", s) if k != qid]
        while any(abs(lat - a) < 0.0003 and abs(lng - b) < 0.0003 for a, b in others):
            lat += 0.0004  # keep pins from landing exactly on top of each other
        s, n = re.subn(r"\b%s: \[-?\d+\.\d+, -?\d+\.\d+\]" % qid, "%s: [%.4f, %.4f]" % (qid, lat, lng), s)
        if n != 1:
            review.append("NOT-APPLIED " + line.strip()); continue
        io.open(path, "w", encoding="utf-8", newline="\n").write(s)
        applied += 1
print("applied", applied)
print("\n".join(review))
