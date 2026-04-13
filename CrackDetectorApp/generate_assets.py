"""
Generates the required Expo asset images:
  assets/icon.png           1024x1024  (app icon)
  assets/adaptive-icon.png  1024x1024  (Android adaptive icon foreground)
  assets/splash.png         1284x2778  (splash screen)

Run from CrackDetectorApp/:
  python generate_assets.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs("assets", exist_ok=True)

BG       = (15, 23, 42)      # #0f172a
CYAN     = (34, 211, 238)    # #22d3ee
RED      = (239, 68, 68)     # #ef4444
WHITE    = (255, 255, 255)


def draw_icon(draw, cx, cy, size):
    """Draw a simple crack-detection icon: magnifier + zigzag crack."""
    r = size // 2

    # Magnifier circle
    lw = max(4, size // 20)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=CYAN, width=lw)

    # Handle
    hlen = size // 3
    hoff = int(r * 0.707)
    draw.line([cx + hoff, cy + hoff, cx + hoff + hlen, cy + hoff + hlen],
              fill=CYAN, width=lw)

    # Zigzag crack inside lens
    zs = size // 3
    pts = [
        (cx - zs // 2, cy - zs // 2),
        (cx,           cy - zs // 6),
        (cx - zs // 4, cy + zs // 6),
        (cx + zs // 2, cy + zs // 2),
    ]
    draw.line(pts, fill=RED, width=max(3, size // 28), joint="curve")


def make_icon(path, size=1024, bg=BG):
    img  = Image.new("RGBA", (size, size), bg + (255,))
    draw = ImageDraw.Draw(img)
    # Subtle circle background
    pad = size // 8
    draw.ellipse([pad, pad, size - pad, size - pad],
                 fill=(30, 41, 59, 255))
    draw_icon(draw, size // 2, size // 2, size // 3)
    img.save(path, "PNG")
    print(f"  Saved: {path}")


def make_splash(path, w=1284, h=2778, bg=BG):
    img  = Image.new("RGBA", (w, h), bg + (255,))
    draw = ImageDraw.Draw(img)

    cx, cy = w // 2, h // 2

    # Faint grid lines for tech feel
    step = 80
    for x in range(0, w, step):
        draw.line([(x, 0), (x, h)], fill=(30, 41, 59, 255), width=1)
    for y in range(0, h, step):
        draw.line([(0, y), (w, y)], fill=(30, 41, 59, 255), width=1)

    # Icon
    icon_size = 220
    draw_icon(draw, cx, cy - 60, icon_size)

    # App name text
    try:
        font_lg = ImageFont.truetype("arial.ttf", 72)
        font_sm = ImageFont.truetype("arial.ttf", 36)
    except Exception:
        font_lg = ImageFont.load_default()
        font_sm = font_lg

    title = "Crack Detector"
    bbox  = draw.textbbox((0, 0), title, font=font_lg)
    tw    = bbox[2] - bbox[0]
    draw.text((cx - tw // 2, cy + icon_size // 2 + 20), title,
              font=font_lg, fill=WHITE)

    sub = "On-Device Structural Inspection"
    bbox2 = draw.textbbox((0, 0), sub, font=font_sm)
    sw    = bbox2[2] - bbox2[0]
    draw.text((cx - sw // 2, cy + icon_size // 2 + 110), sub,
              font=font_sm, fill=(148, 163, 184, 255))

    img.save(path, "PNG")
    print(f"  Saved: {path}")


print("Generating Expo assets...")
make_icon("assets/icon.png")
make_icon("assets/adaptive-icon.png")
make_splash("assets/splash.png")
print("Done.")
