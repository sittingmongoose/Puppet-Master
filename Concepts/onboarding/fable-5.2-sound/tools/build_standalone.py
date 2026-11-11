#!/usr/bin/env python3
"""Build self-contained HTML files of the Pip sound concepts (Fable 5.2), for sharing.

Writes four files into OUTDIR: the listening room and the three concept pages. Every local stylesheet and script is
inlined, every local url() in a stylesheet becomes a data URI, Glass's wallpapers and PMConcept7's sound of today
(the "Today" comparison) are carried inside the file, and the links between the four point at each other. Each file
opens by double-click anywhere, with no server and no network. The Concept Hub bridge is left out.

    python3 tools/build_standalone.py OUTDIR
"""
import base64
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent
ICON = HERE.parent.parent / "Icon-Concepts" / "Opus5.5icon"
TODAY = HERE.parent / "opus-5.5-pip" / "sound.js"
MIME = {".webp": "image/webp", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml"}
PAGES = {"index.html": "pip-sound-room.html", "concept-1.html": "pip-sound-1-encore.html",
         "concept-2.html": "pip-sound-2-house-band.html", "concept-3.html": "pip-sound-3-marionette-theatre.html"}


def data_uri(path):
    return f"data:{MIME[path.suffix]};base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def css_inline(path):
    """A stylesheet with each local url() it names turned into a data URI."""
    text = path.read_text(encoding="utf-8")

    def swap(m):
        ref = m.group(2)
        if ref.startswith(("data:", "http:", "https:", "#", "%23")):
            return m.group(0)
        target = (path.parent / ref).resolve()
        if not target.is_file() or target.suffix not in MIME:
            sys.exit(f"build_standalone: {path.name} names {ref!r}, which cannot be inlined")
        return f"url({data_uri(target)})"

    return re.sub(r"url\((['\"]?)([^'\")]+)\1\)", swap, text)


def build(src, out_name, outdir):
    page = HERE / src
    html = page.read_text(encoding="utf-8")
    walls = {s: data_uri(ICON / f"wall-ribbons-{s}.webp") for s in ("dark", "light")}
    today = "data:text/javascript;base64," + base64.b64encode(TODAY.read_bytes()).decode("ascii")
    boot = 'window.PIP_WALLS = {"dark": "%s", "light": "%s"};\nwindow.PIP_ORIG_SRC = "%s";\n' % (walls["dark"], walls["light"], today)
    # the page's own line that points the wallpapers at files beside it
    html, n = re.subn(r"window\.PIP_WALLS = \{[^\n]*\};\n", lambda m: boot, html)
    if n != 1:
        sys.exit(f"build_standalone: {src} sets its wallpapers {n} times, expected once")

    def link(m):
        href = m.group(1)
        if href.startswith(("data:", "http:", "https:")):
            return m.group(0)
        return "<style>\n" + css_inline((page.parent / href).resolve()) + "\n</style>"

    def script(m):
        src_ = m.group(1)
        if src_.endswith("concept-hub-bridge.js"):
            return ""
        body = (page.parent / src_).resolve().read_text(encoding="utf-8")
        if "</script" in body:
            sys.exit(f"build_standalone: {src_} contains a closing script tag")
        return "<script>\n" + body + "\n</script>\n"

    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', link, html)
    html = re.sub(r'[ \t]*<script src="([^"]+)"></script>\n?', script, html)
    for a, b in PAGES.items():
        html = html.replace(a, b)
    if re.search(r'(?:src|href)="(?!data:|https?:|#|pip-sound-)[^"]+\.(?:js|css|html)"', html):
        sys.exit(f"build_standalone: {src} still names a local file")
    out = outdir / out_name
    out.write_text(html, encoding="utf-8")
    print(f"{out}  {out.stat().st_size / 1024:.0f} KB")


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    outdir = pathlib.Path(sys.argv[1])
    outdir.mkdir(parents=True, exist_ok=True)
    for src, out in PAGES.items():
        build(src, out, outdir)


if __name__ == "__main__":
    main()
