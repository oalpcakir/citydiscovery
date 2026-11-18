"""Writes the City Disco brand assets (Mirror Pin route) and renders the PNGs.
Rules: docs/brand.md. Usage: python tools/brand_assets.py
SVGs are written directly; PNGs are rendered with headless Microsoft Edge (or Chrome).
"""
import base64, io, os, shutil, subprocess, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = os.path.join(ROOT, "web")
BRAND = os.path.join(ROOT, "docs", "brand")
FONT = os.path.join(WEB, "fonts", "bricolage-grotesque-latin.woff2")

MINT, MINT_DARK, SPARK, SPARK_DARK = "#0e9f6e", "#34d399", "#ffc53d", "#ffd66b"
INK, DAYLIGHT, NIGHT = "#0f1f2e", "#f4f7f5", "#141c21"

# The mark in a 108 x 108 box (Android adaptive-icon units). Its bounding box centre is (60, 52.5).
PIN = "M54 90C46 79 30 66 30 47a24 24 0 0 1 48 0c0 19-16 32-24 43z"
FACET = "M41.6 39H48.4Q47.5 43 47.5 47H39A15 15 0 0 1 41.6 39z"
GRID = "M39 47h30M41.6 39h24.8M41.6 55h24.8"
SPARKLE = "M80 15q1.6 8.4 10 10-8.4 1.6-10 10-1.6-8.4-10-10 8.4-1.6 10-10z"


def mark(pin="#fff", ball=MINT, spark=SPARK, grid="#fff", detail=True, stroke=2.2):
    """detail=False drops the facet grid for sizes under ~48 px."""
    out = ['<path d="%s" fill="%s"/>' % (PIN, pin), '<circle cx="54" cy="47" r="%s" fill="%s"/>' % (15 if detail else 14, ball)]
    if detail:
        out.append('<path d="%s" fill="%s"/>' % (FACET, spark))
        out.append('<g fill="none" stroke="%s" stroke-width="%s"><ellipse cx="54" cy="47" rx="6.5" ry="15"/><path d="%s"/></g>' % (grid, stroke, GRID))
    out.append('<path d="%s" fill="%s"/>' % (SPARKLE, spark))
    return "".join(out)


def icon_svg(bg=MINT, rx=24, scale=1.0, **kw):
    # Centre the mark's bounding box on (54, 54), optionally shrunk for mask safe zones.
    g = '<g transform="translate(54 54) scale(%s) translate(-60 -52.5)">%s</g>' % (scale, mark(**kw))
    rect = '<rect width="108" height="108" rx="%s" fill="%s"/>' % (rx, bg)
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">%s%s</svg>\n' % (rect, g)


def font_face():
    with open(FONT, "rb") as f:
        data = base64.b64encode(f.read()).decode()
    return "@font-face{font-family:'Bricolage Grotesque';font-weight:600 800;src:url(data:font/woff2;base64,%s) format('woff2')}" % data


def wordmark_svg(ink=INK, spark=SPARK):
    # Text with the brand font embedded, so the file renders the same anywhere.
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 96"><style>%s'
            ".w{font:800 80px 'Bricolage Grotesque',sans-serif;letter-spacing:-2.4px}</style>"
            '<text class="w" x="2" y="74" fill="%s">city disco</text>'
            '<path d="M412 6q1.9 10.1 12 12-10.1 1.9-12 12-1.9-10.1-12-12 10.1-1.9 12-12z" fill="%s"/></svg>\n') % (font_face(), ink, spark)


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    print("wrote", os.path.relpath(path, ROOT))


def browser():
    # Chrome first: Edge's launcher can return before the screenshot is written.
    for p in [r"C:\Program Files\Google\Chrome\Application\chrome.exe", shutil.which("google-chrome") or "", shutil.which("chromium") or "",
              r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"]:
        if p and os.path.exists(p):
            return p
    raise SystemExit("Edge or Chrome is needed to render the PNGs")


def render(html, out, w, h, transparent=False):
    tmp = tempfile.mkdtemp()
    page = os.path.join(tmp, "p.html")
    with io.open(page, "w", encoding="utf-8") as f:
        f.write('<!doctype html><meta charset="utf-8"><style>html,body{margin:0;width:%dpx;height:%dpx;overflow:hidden;background:%s}</style>%s'
                % (w, h, "transparent" if transparent else DAYLIGHT, html))
    args = [browser(), "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
            "--user-data-dir=" + os.path.join(tmp, "prof"), "--window-size=%d,%d" % (w, h), "--screenshot=" + out]
    if transparent:
        args.append("--default-background-color=00000000")
    subprocess.run(args + ["file:///" + page.replace("\\", "/")], check=True, capture_output=True, timeout=120)
    shutil.rmtree(tmp, ignore_errors=True)
    print("rendered", os.path.relpath(out, ROOT), "%dx%d" % (w, h))


def img(svg, size):
    return '<img width="%d" height="%d" style="display:block" src="data:image/svg+xml;base64,%s">' % (size, size, base64.b64encode(svg.encode()).decode())


def og_html():
    font = os.path.abspath(FONT).replace("\\", "/")
    dots = [(70, 120, "#2f7cf6"), (250, 90, "#f97316"), (330, 210, "#9b5cf6"), (110, 300, "#f97316"), (300, 360, "#2f7cf6"),
            (200, 420, "#9b5cf6"), (60, 400, "#2f7cf6"), (360, 120, "#2f7cf6")]
    dot_svg = "".join('<circle cx="%d" cy="%d" r="11" fill="%s" stroke="#fff" stroke-width="4"/>' % d for d in dots)
    mapsvg = ('<svg width="420" height="470" viewBox="0 0 420 470"><rect width="420" height="470" rx="36" fill="#fff"/>'
              '<path d="M-10 250C80 230 140 300 230 270S360 180 430 200" stroke="#d4e7f7" stroke-width="26" fill="none"/>'
              '<g stroke="#e8eeea" stroke-width="10" fill="none" stroke-linecap="round"><path d="M40 0v470M150 0l-20 470M270 0l30 470M380 0v470"/>'
              '<path d="M0 60h420M0 170l420-30M0 360h420M0 440l420-20"/></g>'
              '<rect x="300" y="380" width="80" height="60" rx="14" fill="#dff5ec"/><rect x="40" y="190" width="70" height="50" rx="12" fill="#dff5ec"/>'
              + dot_svg +
              '<g transform="translate(150 150) scale(1.9) translate(-30 -15)">' + mark(pin=MINT, ball="#fff", grid=MINT) + '</g></svg>')
    chip = lambda t, c: '<span style="display:inline-flex;align-items:center;gap:10px;padding:10px 18px;border-radius:999px;background:#fff;font:700 22px system-ui,sans-serif;color:%s;box-shadow:0 1px 2px rgba(15,31,46,.06),0 6px 16px rgba(15,31,46,.06)"><i style="width:14px;height:14px;border-radius:50%%;background:%s"></i>%s</span>' % (INK, c, t)
    return ('<style>@font-face{font-family:B;font-weight:600 800;src:url("file:///%s") format("woff2")}</style>'
            '<div style="display:flex;align-items:center;justify-content:space-between;height:630px;padding:0 80px;box-sizing:border-box;background:%s">'
            '<div style="max-width:560px">'
            '<div style="display:flex;align-items:center;gap:22px">%s'
            '<div style="font:800 72px/1 B,sans-serif;letter-spacing:-2px;color:%s">city disco<svg width="24" height="24" viewBox="0 0 20 20" style="vertical-align:top;margin:-4px 0 0 0"><path d="M10 0q1.6 8.4 10 10-8.4 1.6-10 10-1.6-8.4-10-10 8.4-1.6 10-10z" fill="%s"/></svg></div></div>'
            '<div style="font:800 46px/1.1 B,sans-serif;letter-spacing:-1px;color:%s;margin-top:44px">Your city, your adventure.</div>'
            '<div style="font:500 24px/1.45 system-ui,sans-serif;color:#5a6b78;margin-top:16px">Quests to see, eat and do across seven countries, on a map you complete as you go.</div>'
            '<div style="display:flex;gap:12px;margin-top:34px">%s%s%s</div></div>%s</div>'
            ) % (font, DAYLIGHT, img(icon_svg(), 96), INK, SPARK, INK, chip("See", "#2f7cf6"), chip("Eat &amp; drink", "#f97316"), chip("Do", "#9b5cf6"), mapsvg)


def main():
    write(os.path.join(WEB, "icon.svg"), icon_svg())
    write(os.path.join(WEB, "favicon.svg"), icon_svg(detail=False))
    write(os.path.join(BRAND, "icon-dark.svg"), icon_svg(bg=NIGHT, pin=MINT_DARK, ball=NIGHT, spark=SPARK_DARK, grid=MINT_DARK, stroke=2.6))
    write(os.path.join(BRAND, "icon-maskable.svg"), icon_svg(rx=0, scale=.8))
    write(os.path.join(BRAND, "wordmark.svg"), wordmark_svg())
    write(os.path.join(BRAND, "wordmark-dark.svg"), wordmark_svg(ink="#edf3f1", spark=SPARK_DARK))
    render(img(icon_svg(), 192), os.path.join(WEB, "icon-192.png"), 192, 192, transparent=True)
    render(img(icon_svg(), 512), os.path.join(WEB, "icon-512.png"), 512, 512, transparent=True)
    render(img(icon_svg(rx=0, scale=.8), 512), os.path.join(WEB, "icon-maskable-512.png"), 512, 512)
    render(img(icon_svg(rx=0, scale=.9), 180), os.path.join(WEB, "apple-touch-icon.png"), 180, 180)
    render(og_html(), os.path.join(WEB, "og.png"), 1200, 630)


if __name__ == "__main__":
    main()
