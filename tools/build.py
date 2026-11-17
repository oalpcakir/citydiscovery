"""Assembles web/app.js from the numbered parts in src/ (they share one closure, so order matters).
Usage: python tools/build.py
"""
import glob, io, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
parts = sorted(glob.glob(os.path.join(ROOT, "src", "*.js")))
text = "// Built by tools/build.py from src/*.js. Edit the parts in src/, not this file.\n" + "".join(io.open(p, encoding="utf-8").read() for p in parts)
with io.open(os.path.join(ROOT, "web", "app.js"), "w", encoding="utf-8", newline="\n") as f:
    f.write(text)
print("web/app.js:", len(text.splitlines()), "lines from", [os.path.basename(p) for p in parts])
