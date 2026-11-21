#!/usr/bin/env python3
"""Build self-contained HTML files of Pip's sound, round two (Fable 5.2), for sharing.

Writes two files into OUTDIR: the listening room and the onboarding window. Every local stylesheet and script is
inlined, every local url() in a stylesheet becomes a data URI, Glass's wallpapers are carried inside the file, and the
two link to each other. Each file opens by double-click anywhere (and in T3's file viewer, and on a phone), with no
server and no network. The Concept Hub bridge is left out.

    python3 tools/build_standalone.py OUTDIR [--debug]

--debug also writes a copy of the listening room that shows what the sound is doing in a green line at the bottom
(for a device that stays silent).
"""
import base64
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent
ICON = HERE.parent.parent.parent / "Icon-Concepts" / "Opus5.5icon"
MIME = {".webp": "image/webp", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml"}
PAGES = {"index.html": "pip-sound2-room.html", "onboarding.html": "pip-sound2-onboarding.html"}


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


def build(src, out_name, outdir, debug=False):
    page = HERE / src
    html = page.read_text(encoding="utf-8")
    walls = {s: data_uri(ICON / f"wall-ribbons-{s}.webp") for s in ("dark", "light")}
    boot = 'window.PIP_WALLS = {"dark": "%s", "light": "%s"};\n' % (walls["dark"], walls["light"])
    if debug:
        boot += "window.PIP_AUDIO_DEBUG = 1;\n"
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
    if re.search(r'(?:src|href)="(?!data:|https?:|#|pip-sound2-)[^"]+\.(?:js|css|html)"', html):
        sys.exit(f"build_standalone: {src} still names a local file")
    out = outdir / out_name
    out.write_text(html, encoding="utf-8")
    print(f"{out}  {out.stat().st_size / 1024:.0f} KB")


def main():
    args = [a for a in sys.argv[1:] if a != "--debug"]
    if len(args) != 1:
        sys.exit(__doc__)
    outdir = pathlib.Path(args[0])
    outdir.mkdir(parents=True, exist_ok=True)
    for src, out in PAGES.items():
        build(src, out, outdir)
    if "--debug" in sys.argv:
        build("index.html", "pip-sound2-room-debug.html", outdir, debug=True)


if __name__ == "__main__":
    main()
