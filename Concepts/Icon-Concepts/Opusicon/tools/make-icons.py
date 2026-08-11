#!/usr/bin/env python3
"""
Opusicon / tools/make-icons.py

Packs a folder of PNGs into the container formats each OS actually wants:

    .ico            Windows  (taskbar, title bar, notification area, installers)
    .iconset/.icns  macOS    (Dock, Finder, About box)
    hicolor/        Linux    (freedesktop icon theme)
    web/            favicon.ico + PWA manifest icons

Standard library only -- no Pillow, no ImageMagick, no cairosvg. None of those
are present on a stock macOS install, so depending on them would make the build
unreproducible. What IS on every Mac: sips, iconutil, qlmanage.

It does not rasterise. Rasterising SVG correctly needs a real renderer, and the
one already in the loop is the browser: open ../index.html, use "Bundle
everything", and unzip. That produces png/<size>/*.png in the layout this script
expects. Point --png-dir at it.

    python3 tools/make-icons.py --png-dir ~/Downloads/opusicon-all/png \\
                               --out build --name puppet-master

On macOS the .icns is produced with the system `iconutil`, which is
byte-identical to what Xcode ships. Elsewhere the .iconset directory is still
written and the script says so rather than emitting a subtly wrong .icns.
"""

import argparse
import shutil
import struct
import subprocess
import sys
import zlib
from pathlib import Path

# --- sizes ------------------------------------------------------------------
# Windows: Microsoft's "bare minimum" is 16/24/32/48/256; the extra entries
# cover the 125-400% scale factors for the taskbar and notification area.
ICO_SIZES = [16, 20, 24, 32, 40, 48, 64, 96, 128, 256]

# macOS .iconset filenames are a fixed contract -- iconutil rejects anything else.
ICONSET = [
    ("icon_16x16.png", 16), ("icon_16x16@2x.png", 32),
    ("icon_32x32.png", 32), ("icon_32x32@2x.png", 64),
    ("icon_128x128.png", 128), ("icon_128x128@2x.png", 256),
    ("icon_256x256.png", 256), ("icon_256x256@2x.png", 512),
    ("icon_512x512.png", 512), ("icon_512x512@2x.png", 1024),
]

HICOLOR_SIZES = [16, 22, 24, 32, 48, 64, 128, 256, 512]
FAVICON_SIZES = [16, 32, 48]


# --- PNG inspection ---------------------------------------------------------
def png_size(data: bytes):
    """Read width/height out of the IHDR chunk. Validates the signature too."""
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("not a PNG")
    # 8 sig + 4 len + 4 type, then w,h as big-endian u32
    w, h = struct.unpack(">II", data[16:24])
    return w, h


def find_png(png_dir: Path, size: int):
    """Locate a PNG of the requested size, preferring png/<size>/*.png."""
    exact = png_dir / str(size)
    if exact.is_dir():
        for p in sorted(exact.glob("*.png")):
            return p
    for p in sorted(png_dir.rglob("*.png")):
        try:
            if png_size(p.read_bytes()) == (size, size):
                return p
        except Exception:
            continue
    return None


# --- .ico -------------------------------------------------------------------
def write_ico(entries, out: Path):
    """
    entries: [(size, png_bytes)]

    Layout:
        ICONDIR       u16 reserved=0 | u16 type=1 | u16 count
        ICONDIRENTRY  u8 w | u8 h | u8 colours=0 | u8 reserved=0
          x count     u16 planes=1 | u16 bpp=32 | u32 bytes | u32 offset
        payloads      PNG verbatim (Vista+; must be 32bpp ARGB)

    The width/height bytes MUST be 0 for 256 -- a single byte cannot hold 256,
    and writing 255 there produces an .ico that Explorer silently ignores. This
    is the most common bug in hand-rolled .ico writers.
    """
    entries = sorted(entries, key=lambda e: e[0])
    count = len(entries)
    header = struct.pack("<HHH", 0, 1, count)
    offset = 6 + 16 * count
    dir_bytes, payloads = b"", b""
    for size, data in entries:
        byte = 0 if size >= 256 else size
        dir_bytes += struct.pack("<BBBBHHII", byte, byte, 0, 0, 1, 32, len(data), offset)
        payloads += data
        offset += len(data)
    out.write_bytes(header + dir_bytes + payloads)
    return count


# --- main -------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--png-dir", required=True, type=Path,
                    help="directory of PNGs (png/<size>/*.png from the dashboard bundle)")
    ap.add_argument("--out", default="build", type=Path)
    ap.add_argument("--name", default="puppet-master")
    ap.add_argument("--app-id", default="com.platyr.puppetmaster")
    args = ap.parse_args()

    if not args.png_dir.is_dir():
        sys.exit(f"error: --png-dir {args.png_dir} is not a directory")

    out = args.out
    made, missing = [], []

    def get(size):
        p = find_png(args.png_dir, size)
        if p is None:
            missing.append(size)
            return None
        return p.read_bytes()

    # -- Windows .ico
    ico_entries = [(s, d) for s in ICO_SIZES for d in [get(s)] if d]
    if ico_entries:
        (out / "windows").mkdir(parents=True, exist_ok=True)
        n = write_ico(ico_entries, out / "windows" / f"{args.name}.ico")
        made.append(f"windows/{args.name}.ico  ({n} entries: "
                    f"{', '.join(str(s) for s, _ in ico_entries)})")

    # -- Web favicon.ico (16/32/48 only, per current guidance)
    fav = [(s, d) for s in FAVICON_SIZES for d in [get(s)] if d]
    if fav:
        (out / "web").mkdir(parents=True, exist_ok=True)
        write_ico(fav, out / "web" / "favicon.ico")
        made.append("web/favicon.ico  (16, 32, 48)")
        for src, dst in [(180, "apple-touch-icon.png"), (192, "icon-192.png"),
                         (512, "icon-512.png")]:
            d = get(src)
            if d:
                (out / "web" / dst).write_bytes(d)
                made.append(f"web/{dst}")
        (out / "web" / "manifest.webmanifest").write_text(
            '{\n  "name": "Puppet Master",\n  "icons": [\n'
            '    { "src": "/icon-192.png", "type": "image/png", "sizes": "192x192" },\n'
            '    { "src": "/icon-512.png", "type": "image/png", "sizes": "512x512" },\n'
            '    { "src": "/icon-maskable-512.png", "type": "image/png",'
            ' "sizes": "512x512", "purpose": "maskable" }\n  ]\n}\n')
        made.append("web/manifest.webmanifest")

    # -- macOS .iconset (+ .icns via the system iconutil)
    iconset = out / "macos" / f"{args.name}.iconset"
    wrote_any = False
    for fname, size in ICONSET:
        d = get(size)
        if d:
            iconset.mkdir(parents=True, exist_ok=True)
            (iconset / fname).write_bytes(d)
            wrote_any = True
    if wrote_any:
        made.append(f"macos/{args.name}.iconset  ({len(list(iconset.glob('*.png')))} PNGs)")
        if shutil.which("iconutil"):
            icns = out / "macos" / f"{args.name}.icns"
            r = subprocess.run(["iconutil", "-c", "icns", str(iconset), "-o", str(icns)],
                               capture_output=True, text=True)
            if r.returncode == 0:
                made.append(f"macos/{args.name}.icns")
            else:
                print(f"  iconutil failed: {r.stderr.strip()}", file=sys.stderr)
        else:
            print("  note: iconutil not found (not macOS) — .iconset written, "
                  ".icns skipped.\n        Run `iconutil -c icns "
                  f"{iconset}` on a Mac to finish.", file=sys.stderr)

    # -- Linux hicolor
    for size in HICOLOR_SIZES:
        d = get(size)
        if d:
            p = out / "linux" / "hicolor" / f"{size}x{size}" / "apps"
            p.mkdir(parents=True, exist_ok=True)
            (p / f"{args.app_id}.png").write_bytes(d)
    scalable = out / "linux" / "hicolor" / "scalable" / "apps"
    src_svg = Path(__file__).resolve().parent.parent / "static"
    pick = sorted(src_svg.glob("pm-*-ground-full.svg"))
    if pick:
        scalable.mkdir(parents=True, exist_ok=True)
        shutil.copy(pick[0], scalable / f"{args.app_id}.svg")
    (out / "linux").mkdir(parents=True, exist_ok=True)
    (out / "linux" / f"{args.app_id}.desktop").write_text(
        "[Desktop Entry]\nType=Application\nName=Puppet Master\n"
        f"Exec={args.name}\nIcon={args.app_id}\n"
        f"StartupWMClass={args.app_id}\nCategories=Development;\n")
    made.append(f"linux/hicolor/**  +  {args.app_id}.desktop")

    # -- report
    print("\n".join("  wrote " + m for m in made) or "  nothing written")
    if missing:
        uniq = sorted(set(missing))
        print(f"\n  missing source PNGs for: {', '.join(map(str, uniq))}")
        print("  Export those sizes from index.html (Bundle everything) and re-run.")
    print("\nNotes:")
    print("  * .ico entries are PNG-compressed. Windows Vista and later read this;")
    print("    a few older installer toolchains only grok BMP below 48px.")
    print("  * Icon= in the .desktop file is a NAME, not a path — it resolves")
    print("    through the hicolor theme. Keep it equal to StartupWMClass.")
    print("  * macOS 26 (Tahoe) prefers an Icon Composer .icon bundle; a")
    print("    full-bleed .icns gets a grey plate behind it. Ship both.")


if __name__ == "__main__":
    main()
