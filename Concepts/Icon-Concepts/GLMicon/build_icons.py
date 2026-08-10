#!/usr/bin/env python3
"""
PM Icon Generator — builds all cross-platform app-icon + tray bundles from the source SVGs.

Toolchain (must be on PATH):
  - resvg   : SVG -> PNG (same engine Slint uses, so output matches Slint's rendering)
  - iconutil: macOS, builds .icns from an .iconset folder
  - Pillow  : PNG -> ICO, resize/arrange (pip install Pillow)

Usage:
  python3 build_icons.py            # build everything, all themes
  python3 build_icons.py --theme friendly-dark   # build one theme only

Reads:  static/pm-<theme>.svg , tray/source/glyph-*.svg
Writes: build/  (PNG ladders, .icns, .ico, web manifest icons, tray PNGs)

This script is a deliverable — re-run it any time the source art changes.
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(ROOT, "static")
TRAY_SRC = os.path.join(ROOT, "tray", "source")
BUILD = os.path.join(ROOT, "build")

THEMES = [
    "retro-dark", "retro-light",
    "basic-light", "basic-dark",
    "glass-dark", "glass-light",
    "friendly-dark", "friendly-light",
]

# Per-theme accent color (for the web maskable background + tray color fill).
# Verbatim from PMConcept7.
ACCENT = {
    "retro-dark": "#00FF41", "retro-light": "#0047AB",
    "basic-light": "#0056B3", "basic-dark": "#64B5F6",
    "glass-dark": "#B79CFF", "glass-light": "#8B6ED9",
    "friendly-dark": "#6FC6E8", "friendly-light": "#3F9CC7",
}

# App-icon size ladder (macOS iconset + Windows ico + Linux hicolor + web)
MAC_ICONSET = {  # filename -> actual pixels
    "icon_16x16.png": 16, "icon_16x16@2x.png": 32,
    "icon_32x32.png": 32, "icon_32x32@2x.png": 64,
    "icon_128x128.png": 128, "icon_128x128@2x.png": 256,
    "icon_256x256.png": 256, "icon_256x256@2x.png": 512,
    "icon_512x512.png": 512, "icon_512x512@2x.png": 1024,
}
ICO_SIZES = [16, 24, 32, 48, 64, 128, 256]
HICOLOR_SIZES = [16, 22, 32, 48, 64, 128, 256, 512]
WEB_SIZES = [192, 512]
TRAY_SIZES = {"mac": [16, 32], "win": [16, 32], "linux": [22]}


# ----------------------------- helpers -----------------------------

def need(*tools):
    missing = [t for t in tools if shutil.which(t) is None]
    if missing:
        sys.exit(f"Missing required tools on PATH: {', '.join(missing)}\n"
                 f"  resvg:  brew install resvg\n"
                 f"  Pillow: pip install Pillow\n"
                 f"  iconutil: macOS only (built-in)")


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        sys.exit(f"Command failed ({r.returncode}): {' '.join(cmd)}\n{r.stderr}")
    return r


def resvg(svg_path, png_path, size):
    """Rasterize SVG to a square PNG at `size`px using resvg (Slint's engine)."""
    os.makedirs(os.path.dirname(png_path), exist_ok=True)
    run(["resvg", "-w", str(size), "-h", str(size), svg_path, png_path])


def pad_svg_to_master(svg_text, master_size=1024, safe_inset=0.10):
    """Wrap a full-bleed logo SVG into a `master_size`x`master_size` master with
    safe-area padding (Apple squircle convention: glyph inset ~10%)."""
    inner = 1.0 - 2 * safe_inset
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{master_size}" height="{master_size}" viewBox="0 0 {master_size} {master_size}">
<g transform="translate({master_size*safe_inset},{master_size*safe_inset}) scale({inner})">
{svg_text.split('</defs>',1)[-1].split('<g id="Layer_1-2"',1)[0] if False else ''}
{_inner_mark(svg_text, master_size)}
</g>
</svg>'''


def _inner_mark(svg_text, master_size):
    """Pull just the mark group out of a themed static svg, scaled to fill master."""
    # The static svgs have viewBox 0 0 43.2 43.2. Re-embed the whole svg as an <svg> child.
    # (Nested <svg> is valid SVG and resvg renders it correctly.)
    # Strip the XML prolog to avoid duplicate declarations.
    body = re.sub(r'^<\?xml[^>]*\?>\s*', '', svg_text.strip())
    return f'<g transform="scale({master_size/43.2})">{body}</g>'


def write(p, content_bytes):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "wb") as f:
        f.write(content_bytes)


def glyph_color_svg(glyph_svg_text, color):
    """Take a tray glyph (black fill) and recolor it to `color` for color trays.
    White elements (e.g. puppet eyes) are kept as negative space on the canvas bg."""
    return re.sub(r'fill="#000000"', f'fill="{color}"', glyph_svg_text)


def glyph_template_svg(glyph_svg_text):
    """Build a macOS template-image SVG: black silhouette with any white elements
    punched through as TRANSPARENT holes (macOS reads the alpha channel only, so
    cut-outs must be alpha=0, not white). Achieved with a mask: black everywhere
    EXCEPT where the glyph's white shapes sit."""
    # Replace black fills with a marker color we treat as opaque, white stays as hole.
    body = re.sub(r'^<\?xml[^>]*\?>\s*', '', glyph_svg_text.strip())
    # Mark black shapes opaque (id) and white shapes as the hole, via a mask in defs.
    body_marked = body.replace('fill="#000000"', 'fill="#000000" class="g-opaque"')
    # Extract an SVG so we can inject defs; wrap.
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <defs>
    <!-- opaque = union of black shapes; holes = white shapes subtracted -->
    <mask id="tpl">
      <!-- white in mask = visible -->
      <rect width="24" height="24" fill="black"/>
      <g>{body_marked.replace('fill="#000000" class="g-opaque"', 'fill="white"').replace('fill="#FFFFFF"', 'fill="black"')}</g>
    </mask>
  </defs>
  <rect width="24" height="24" fill="#000000" mask="url(#tpl)"/>
</svg>'''


def flatten_to_template(png_path):
    """Force a PNG to be strictly black + alpha: copy alpha to all of RGB=0.
    Removes anti-aliasing grays so the file is unambiguous as a mac template image."""
    from PIL import Image
    im = Image.open(png_path).convert("RGBA")
    a = im.split()[3]
    black = Image.new("L", im.size, 0)
    im2 = Image.merge("RGBA", (black, black, black, a))
    im2.save(png_path)


# ----------------------------- builders -----------------------------

def build_app_icons(theme):
    """Build .icns, .ico, hicolor PNG ladder, and web manifest icons for one theme."""
    from PIL import Image
    src_svg = os.path.join(STATIC, f"pm-{theme}.svg")
    if not os.path.exists(src_svg):
        sys.exit(f"Source not found: {src_svg}")
    src_text = open(src_svg).read()

    tdir = os.path.join(BUILD, theme, "app-icon")
    png_dir = os.path.join(tdir, "png")
    os.makedirs(png_dir, exist_ok=True)

    # 1. Render a single full-bleed 1024 master, then downscale for every size.
    #    (Downscaling a large master beats rendering tiny sizes directly — better AA.)
    master_png = os.path.join(png_dir, "_master-1024.png")
    resvg(src_svg, master_png, 1024)

    # 2. macOS iconset
    iconset = os.path.join(tdir, "mac", f"PM-{theme}.iconset")
    if os.path.exists(iconset):
        shutil.rmtree(iconset)
    os.makedirs(iconset, exist_ok=True)
    master = Image.open(master_png).convert("RGBA")
    for fname, px in MAC_ICONSET.items():
        master.resize((px, px), Image.LANCZOS).save(os.path.join(iconset, fname))
    icns = os.path.join(tdir, "mac", f"PM-{theme}.icns")
    run(["iconutil", "-c", "icns", iconset, "-o", icns])
    shutil.rmtree(iconset)  # leave only the .icns

    # 3. Windows .ico — pass the 256 master + all desired sizes; Pillow generates
    #    each size entry from the base, PNG-compressing the 256 entry.
    ico_path = os.path.join(tdir, "windows", f"PM-{theme}.ico")
    os.makedirs(os.path.dirname(ico_path), exist_ok=True)
    master_256 = master.resize((256, 256), Image.LANCZOS)
    master_256.save(ico_path, format="ICO",
                    sizes=[(s, s) for s in ICO_SIZES],
                    bitmap_format="png")

    # 4. Linux hicolor ladder + scalable svg
    hicolor = os.path.join(tdir, "linux", "hicolor")
    for s in HICOLOR_SIZES:
        d = os.path.join(hicolor, f"{s}x{s}", "apps"); os.makedirs(d, exist_ok=True)
        master.resize((s, s), Image.LANCZOS).save(os.path.join(d, f"pm-{theme}.png"))
    scalable = os.path.join(hicolor, "scalable", "apps"); os.makedirs(scalable, exist_ok=True)
    shutil.copy(src_svg, os.path.join(scalable, f"pm-{theme}.svg"))

    # 5. Web: any + maskable. Maskable = logo inset to central 80% on accent background.
    web = os.path.join(tdir, "web"); os.makedirs(web, exist_ok=True)
    for s in WEB_SIZES:
        master.resize((s, s), Image.LANCZOS).save(os.path.join(web, f"icon-{s}.png"))
    # maskable: render a master with logo at 80% on solid accent bg
    maskable_svg = make_maskable_svg(src_text, ACCENT[theme])
    mask_master = os.path.join(web, "_maskable-1024.png")
    with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as tf:
        tf.write(maskable_svg); tmp = tf.name
    resvg(tmp, mask_master, 1024)
    os.unlink(tmp)
    mimg = Image.open(mask_master).convert("RGBA")
    for s in WEB_SIZES:
        mimg.resize((s, s), Image.LANCZOS).save(os.path.join(web, f"icon-{s}-maskable.png"))
    # favicon.ico (16,32,48) — generate all entries from a single base
    fav_base = master.resize((48, 48), Image.LANCZOS)
    fav_base.save(os.path.join(web, "favicon.ico"), format="ICO",
                  sizes=[(16, 16), (32, 32), (48, 48)], bitmap_format="png")
    # apple-touch-icon 180
    master.resize((180, 180), Image.LANCZOS).save(os.path.join(web, "apple-touch-icon.png"))
    # manifest
    manifest = {
        "name": "Puppet Master",
        "icons": [
            {"src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "icon-192-maskable.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
            {"src": "icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    write(os.path.join(web, "manifest.webmanifest"), json.dumps(manifest, indent=2).encode())

    # cleanup intermediate masters
    os.remove(master_png)
    if os.path.exists(mask_master):
        os.remove(mask_master)
    print(f"  [{theme}] app-icon: .icns + .ico + hicolor({len(HICOLOR_SIZES)}) + web ✓")


def make_maskable_svg(src_text, bg_color):
    """Logo inset to central 80% on a solid accent background (maskable safe-zone)."""
    body = re.sub(r'^<\?xml[^>]*\?>\s*', '', src_text.strip())
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<rect width="1024" height="1024" fill="{bg_color}"/>
<g transform="translate(102.4,102.4) scale(0.8)">
<g transform="scale(1024/43.2)">{body}</g>
</g>
</svg>'''


def build_tray(theme):
    """Build tray PNGs for all 3 glyph variants: mac mono-template + win/linux color."""
    from PIL import Image
    glyphs = {
        "pm-monogram": "glyph-pm-monogram.svg",
        "puppet-string": "glyph-puppet-string.svg",
        "simplified-mark": "glyph-simplified-mark.svg",
    }
    # macOS template: render glyph as-is (black+alpha), in a tray-sized canvas.
    # We render at 4x then downscale for crisp anti-aliasing on the thin shapes.
    for gname, gfile in glyphs.items():
        gpath = os.path.join(TRAY_SRC, gfile)
        gtext = open(gpath).read()
        tdir = os.path.join(BUILD, theme, "tray", gname)
        os.makedirs(tdir, exist_ok=True)

        # --- macOS monochrome template (alpha-only: black on transparent).
        #     White glyph elements become transparent holes; output flattened to
        #     pure black + alpha so it is unambiguous as an NSImage template. ---
        mac = os.path.join(tdir, "mac")
        template_svg = glyph_template_svg(gtext)
        for px in TRAY_SIZES["mac"]:
            hi = px * 4  # supersample
            with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as tf:
                tf.write(template_svg); tmp = tf.name
            hi_png = os.path.join(mac, f"_hi-{px}.png")
            resvg(tmp, hi_png, hi); os.unlink(tmp)
            from PIL import Image as I
            out_png = os.path.join(mac, f"tray-template-{gname}-{px}.png")
            I.open(hi_png).convert("RGBA").resize((px, px), I.LANCZOS).save(out_png)
            flatten_to_template(out_png)
            os.remove(hi_png)
        # add a retina-named copy
        shutil.copy(os.path.join(mac, f"tray-template-{gname}-32.png"),
                    os.path.join(mac, f"tray-template-{gname}-16@2x.png"))

        # --- Windows / Linux color (accent fill) ---
        for plat in ("windows", "linux"):
            pdir = os.path.join(tdir, plat); os.makedirs(pdir, exist_ok=True)
            colored = glyph_color_svg(gtext, ACCENT[theme])
            for px in TRAY_SIZES["win" if plat == "windows" else "linux"]:
                hi = px * 4
                with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as tf:
                    tf.write(colored); tmp = tf.name
                hi_png = os.path.join(pdir, f"_hi-{px}.png")
                resvg(tmp, hi_png, hi); os.unlink(tmp)
                from PIL import Image as I
                I.open(hi_png).convert("RGBA").resize((px, px), I.LANCZOS).save(
                    os.path.join(pdir, f"tray-color-{gname}-{px}.png"))
                os.remove(hi_png)
    print(f"  [{theme}] tray: 3 glyphs × (mac-template + win/linux color) ✓")


def main():
    ap = argparse.ArgumentParser(description="Build PM cross-platform icon bundles.")
    ap.add_argument("--theme", default=None, help="build only one theme (default: all)")
    args = ap.parse_args()
    need("resvg", "iconutil")
    try:
        import PIL  # noqa
    except ImportError:
        sys.exit("Pillow not installed: pip install Pillow")

    themes = [args.theme] if args.theme else THEMES
    if os.path.exists(BUILD):
        # clean only the themes being rebuilt
        for t in themes:
            d = os.path.join(BUILD, t)
            if os.path.exists(d):
                shutil.rmtree(d)
    os.makedirs(BUILD, exist_ok=True)

    print(f"Building {len(themes)} theme(s) into {os.path.relpath(BUILD, ROOT)}/")
    for t in themes:
        if t not in THEMES and args.theme:
            sys.exit(f"Unknown theme: {t}\nKnown: {', '.join(THEMES)}")
        build_app_icons(t)
        build_tray(t)
    print("Done.")


if __name__ == "__main__":
    main()
