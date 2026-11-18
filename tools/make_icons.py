"""Draws the app icons and the link-preview image (same design as web/icon.svg). Needs pillow.
Usage: python tools/make_icons.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

WEB = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web")
GREEN, WHITE = (11, 107, 58), (255, 255, 255)


def compass(size, scale=1.0, bg=GREEN):
    """The compass mark on a square; scale < 1 leaves a margin (for maskable icons)."""
    S = size * 4  # draw large, then shrink for smooth edges
    img = Image.new("RGB", (S, S), bg)
    d = ImageDraw.Draw(img)
    k = S / 108 * scale
    o = S / 2
    P = lambda x, y: (o + (x - 54) * k, o + (y - 54) * k)
    d.ellipse([P(30, 30), P(78, 78)], outline=WHITE, width=max(1, round(5 * k)))
    d.polygon([P(65, 43), P(58, 58), P(43, 65), P(50, 50)], fill=WHITE)
    d.ellipse([P(51, 51), P(57, 57)], fill=bg)
    return img.resize((size, size), Image.LANCZOS)


def font(px, bold=True):
    for name in (["segoeuib.ttf", "arialbd.ttf"] if bold else ["segoeui.ttf", "arial.ttf"]) + ["DejaVuSans-Bold.ttf", "DejaVuSans.ttf"]:
        try:
            return ImageFont.truetype(name, px)
        except OSError:
            pass
    return ImageFont.load_default()


compass(192).save(os.path.join(WEB, "icon-192.png"))
compass(512).save(os.path.join(WEB, "icon-512.png"))
compass(512, 0.72).save(os.path.join(WEB, "icon-maskable-512.png"))
compass(180).save(os.path.join(WEB, "apple-touch-icon.png"))

# Link preview (Open Graph): 1200 x 630
og = Image.new("RGB", (1200, 630), GREEN)
og.paste(compass(300), (90, 165))
d = ImageDraw.Draw(og)
d.text((450, 200), "City Disco", font=font(104), fill=WHITE)
d.text((454, 330), "Your city. Your adventure.", font=font(46, False), fill=(214, 240, 226))
d.text((454, 400), "Quests to see, eat and do, on a map you complete.", font=font(30, False), fill=(170, 215, 192))
og.save(os.path.join(WEB, "og.png"))
print("icons written")
