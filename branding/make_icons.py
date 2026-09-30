"""Generate Genosai Voice app + tray icons (run from repo root)."""
from PIL import Image, ImageDraw, ImageFilter
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, "src-tauri", "resources")
BRAND = os.path.join(ROOT, "branding")

TOP = (58, 123, 255)     # #3A7BFF
BOTTOM = (14, 44, 150)   # #0E2C96
ACCENT = (120, 220, 255)


def gradient(size):
    g = Image.new("RGB", (size, size))
    d = ImageDraw.Draw(g)
    for y in range(size):
        t = y / (size - 1)
        c = tuple(int(TOP[i] * (1 - t) + BOTTOM[i] * t) for i in range(3))
        d.line([(0, y), (size, y)], fill=c)
    return g


def mic(draw, cx, cy, s, color, width, filled=False, capsule_fill=None):
    """Microphone glyph centred at (cx, cy); s = overall scale (px)."""
    cw, ch = s * 0.30, s * 0.46
    top = cy - s * 0.42
    box = [cx - cw / 2, top, cx + cw / 2, top + ch]
    if filled or capsule_fill:
        draw.rounded_rectangle(box, radius=cw / 2, fill=capsule_fill or color)
    else:
        draw.rounded_rectangle(box, radius=cw / 2, outline=color, width=width)
    # holder arc
    aw = s * 0.50
    arc_box = [cx - aw / 2, top + ch * 0.35, cx + aw / 2, top + ch * 0.35 + aw]
    draw.arc(arc_box, start=0, end=180, fill=color, width=width)
    # stem + base
    stem_top = top + ch * 0.35 + aw
    stem_bot = cy + s * 0.40
    draw.line([(cx, stem_top), (cx, stem_bot)], fill=color, width=width)
    draw.line([(cx - s * 0.16, stem_bot), (cx + s * 0.16, stem_bot)], fill=color, width=width)


def app_icon(size=1024):
    ss = 4
    S = size * ss
    canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    # macOS-style inset rounded square
    inset = int(S * 0.09)
    radius = int(S * 0.2)
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([inset, inset, S - inset, S - inset], radius=radius, fill=255)
    # soft drop shadow
    shadow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sm = Image.new("L", (S, S), 0)
    ImageDraw.Draw(sm).rounded_rectangle([inset, inset + S * 0.012, S - inset, S - inset + S * 0.012], radius=radius, fill=90)
    shadow.putalpha(sm.filter(ImageFilter.GaussianBlur(S * 0.015)))
    canvas = Image.alpha_composite(canvas, shadow)
    bg = gradient(S).convert("RGBA")
    # glossy highlight
    hl = Image.new("L", (S, S), 0)
    ImageDraw.Draw(hl).ellipse([-S * 0.3, -S * 0.75, S * 1.3, S * 0.45], fill=40)
    white = Image.new("RGBA", (S, S), (255, 255, 255, 255))
    bg = Image.composite(white, bg, hl.filter(ImageFilter.GaussianBlur(S * 0.03)))
    bg.putalpha(mask)
    canvas = Image.alpha_composite(canvas, bg)

    d = ImageDraw.Draw(canvas)
    cx, cy = S / 2, S / 2 + S * 0.02
    w = int(S * 0.034)
    mic(d, cx, cy, S * 0.52, (255, 255, 255, 255), w, capsule_fill=(255, 255, 255, 255))
    # sound waves
    for i, r in enumerate([0.30, 0.38]):
        rr = S * r
        box = [cx - rr, cy - S * 0.13 - rr, cx + rr, cy - S * 0.13 + rr]
        col = ACCENT + (255 if i == 0 else 170,)
        d.arc(box, start=-35, end=35, fill=col, width=w)
        d.arc(box, start=145, end=215, fill=col, width=w)
    return canvas.resize((size, size), Image.LANCZOS)


def tray(color, variant, size=64):
    ss = 8
    S = size * ss
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    w = int(S * 0.085)
    if variant == "idle":
        mic(d, S / 2, S / 2, S * 0.92, color, w)
    elif variant == "recording":
        mic(d, S / 2, S / 2, S * 0.92, color, w, filled=True)
    elif variant == "transcribing":
        mic(d, S * 0.42, S / 2, S * 0.92, color, w)
        for i in range(3):
            y = S * (0.28 + i * 0.22)
            r = S * 0.055
            d.ellipse([S * 0.86 - r, y - r, S * 0.86 + r, y + r], fill=color)
    elif variant == "warning":
        mic(d, S * 0.42, S / 2, S * 0.92, color, w)
        d.line([(S * 0.86, S * 0.18), (S * 0.86, S * 0.62)], fill=color, width=w)
        r = S * 0.06
        d.ellipse([S * 0.86 - r, S * 0.78 - r, S * 0.86 + r, S * 0.78 + r], fill=color)
    return im.resize((size, size), Image.LANCZOS)


def main():
    icon = app_icon(1024)
    icon.save(os.path.join(BRAND, "icon-1024.png"))
    white, black, blue = (255, 255, 255, 255), (0, 0, 0, 255), TOP + (255,)
    for v, name in [("idle", "idle"), ("recording", "recording"), ("transcribing", "transcribing"), ("warning", "idle_warning")]:
        tray(white, v).save(os.path.join(RES, f"tray_{name}.png"))
        tray(black, v).save(os.path.join(RES, f"tray_{name}_dark.png"))
    tray(blue, "idle").save(os.path.join(RES, "handy.png"))
    tray(blue, "warning").save(os.path.join(RES, "handy_warning.png"))
    tray(blue, "recording").save(os.path.join(RES, "recording.png"))
    tray(blue, "transcribing").save(os.path.join(RES, "transcribing.png"))
    print("icons written")


if __name__ == "__main__":
    main()
