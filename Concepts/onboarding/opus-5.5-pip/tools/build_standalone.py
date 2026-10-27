#!/usr/bin/env python3
"""Build self-contained HTML files of the Pip onboarding concept, for sharing.

Writes two files into OUTDIR: pip-onboarding.html (the concept) and pip-sounds.html (the sound board).
Every local stylesheet and script is inlined, every local url() in a stylesheet becomes a data URI,
and Glass's wallpapers are handed to the stage as data URIs, so both files open by double-click
anywhere with no server and no network. The Concept Hub bridge is left out.

    python3 tools/build_standalone.py OUTDIR
"""
import base64
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent
ICON = HERE.parent.parent / "Icon-Concepts" / "Opus5.5icon"
MIME = {".webp": "image/webp", ".woff2": "font/woff2", ".png": "image/png", ".svg": "image/svg+xml"}
PAGES = [("index.html", "pip-onboarding.html"), ("sounds.html", "pip-sounds.html")]


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


def build(src, out_name, outdir, links):
    page = HERE / src
    html = page.read_text(encoding="utf-8")
    walls = {s: data_uri(ICON / f"wall-ribbons-{s}.webp") for s in ("dark", "light")}
    boot = ["window.PIP_WALLS = " + repr(walls).replace("'", '"') + ";\n"]

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
        if boot:
            body = boot.pop() + body
        return "<script>\n" + body + "\n</script>"

    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', link, html)
    html = re.sub(r'[ \t]*<script src="([^"]+)"></script>\n?', lambda m: (lambda r: r + "\n" if r else "")(script(m)), html)
    for a, b in links.items():
        html = html.replace(f'href="{a}"', f'href="{b}"')
    if re.search(r'(?:src|href)="(?!data:|https?:|#|pip-)[^"]+\.(?:js|css|html)"', html):
        sys.exit(f"build_standalone: {src} still names a local file")
    out = outdir / out_name
    out.write_text(html, encoding="utf-8")
    print(f"{out}  {out.stat().st_size / 1024:.0f} KB")


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    outdir = pathlib.Path(sys.argv[1])
    outdir.mkdir(parents=True, exist_ok=True)
    links = {src: out for src, out in PAGES}
    for src, out in PAGES:
        build(src, out, outdir, links)


if __name__ == "__main__":
    main()
