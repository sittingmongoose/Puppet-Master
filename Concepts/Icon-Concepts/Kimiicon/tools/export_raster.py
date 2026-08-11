#!/usr/bin/env python3
"""Raster packaging for the Kimiicon logo suite (macOS, no third-party deps).

Input:  png/{theme}/icon-1024.png  (1024x1024 transparent masters)
Output: png/{theme}/icon-{16..512}.png   (sips downsample)
        ico/icon-{theme}.ico             (multi-size PNG-compressed ICO)
        icns/icon-{theme}.icns           (via iconutil .iconset)

Masters are produced from static/*.svg (rendered via headless Chromium at
build time). If masters are missing and rsvg-convert is installed, this script
can regenerate them itself:  export_raster.py --render-masters
"""
import shutil
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PNG_ROOT = ROOT / "png"
ICO_DIR = ROOT / "ico"
ICNS_DIR = ROOT / "icns"
STATIC_DIR = ROOT / "static"

PNG_SIZES = [16, 24, 32, 48, 64, 128, 256, 512]
ICO_SIZES = [16, 24, 32, 48, 64, 128, 256]
ICONSET = [
    ("icon_16x16", 16), ("icon_16x16@2x", 32),
    ("icon_32x32", 32), ("icon_32x32@2x", 64),
    ("icon_128x128", 128), ("icon_128x128@2x", 256),
    ("icon_256x256", 256), ("icon_256x256@2x", 512),
    ("icon_512x512", 512), ("icon_512x512@2x", 1024),
]


def sips_resize(src: Path, dst: Path, size: int):
    subprocess.run(
        ["sips", "-z", str(size), str(size), str(src), "--out", str(dst)],
        check=True, capture_output=True,
    )


def render_masters():
    """Fallback master renderer using rsvg-convert, if available."""
    if not shutil.which("rsvg-convert"):
        sys.exit("rsvg-convert not found; produce png/{theme}/icon-1024.png masters first")
    for svg in sorted(STATIC_DIR.glob("icon-*.svg")):
        theme = svg.stem.replace("icon-", "")
        out_dir = PNG_ROOT / theme
        out_dir.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["rsvg-convert", "-w", "1024", "-h", "1024", str(svg),
             "-o", str(out_dir / "icon-1024.png")],
            check=True,
        )
        print(f"master: {theme}")


def write_ico(png_by_size: dict, dst: Path):
    sizes = sorted(png_by_size)
    header = struct.pack("<HHH", 0, 1, len(sizes))
    offset = 6 + 16 * len(sizes)
    entries, blobs = [], []
    for s in sizes:
        blob = png_by_size[s]
        dim = 0 if s >= 256 else s  # ICO stores 256 as 0
        entries.append(struct.pack("<BBBBHHII", dim, dim, 0, 0, 1, 32, len(blob), offset))
        blobs.append(blob)
        offset += len(blob)
    dst.write_bytes(header + b"".join(entries) + b"".join(blobs))


def build_theme(theme_dir: Path):
    theme = theme_dir.name
    master = theme_dir / "icon-1024.png"
    if not master.exists():
        print(f"SKIP {theme}: no icon-1024.png master")
        return False

    for size in PNG_SIZES:
        sips_resize(master, theme_dir / f"icon-{size}.png", size)

    ico_pngs = {}
    for size in ICO_SIZES:
        buf = theme_dir / f".ico-tmp-{size}.png"
        sips_resize(master, buf, size)
        ico_pngs[size] = buf.read_bytes()
        buf.unlink()
    ICO_DIR.mkdir(exist_ok=True)
    write_ico(ico_pngs, ICO_DIR / f"icon-{theme}.ico")

    ICNS_DIR.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        iconset = Path(td) / "icon.iconset"
        iconset.mkdir()
        for name, size in ICONSET:
            sips_resize(master, iconset / f"{name}.png", size)
        subprocess.run(
            ["iconutil", "-c", "icns", str(iconset),
             "-o", str(ICNS_DIR / f"icon-{theme}.icns")],
            check=True, capture_output=True,
        )
    print(f"OK {theme}: {len(PNG_SIZES)} PNGs + ICO + ICNS")
    return True


def main():
    if "--render-masters" in sys.argv:
        render_masters()
    themes = [d for d in sorted(PNG_ROOT.iterdir()) if d.is_dir()]
    if not themes:
        sys.exit("no png/{theme} directories found")
    ok = sum(build_theme(d) for d in themes)
    print(f"done: {ok}/{len(themes)} themes packaged")


if __name__ == "__main__":
    main()
