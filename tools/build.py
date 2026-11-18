"""Assembles web/app.js from the numbered parts in src/ (they share one closure, so order matters).
Usage: python tools/build.py
"""
import glob, io, os, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
parts = sorted(glob.glob(os.path.join(ROOT, "src", "*.js")))
text = "// Built by tools/build.py from src/*.js. Edit the parts in src/, not this file.\n" + "".join(io.open(p, encoding="utf-8").read() for p in parts)
for attempt in range(8):  # OneDrive can lock the file for a moment while it syncs
    try:
        with io.open(os.path.join(ROOT, "web", "app.js"), "w", encoding="utf-8", newline="\n") as f:
            f.write(text)
        break
    except OSError:
        time.sleep(0.5 * (attempt + 1))
else:
    raise OSError("could not write web/app.js")
print("web/app.js:", len(text.splitlines()), "lines from", [os.path.basename(p) for p in parts])
