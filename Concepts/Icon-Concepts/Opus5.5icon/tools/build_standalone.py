#!/usr/bin/env python3
"""Build one self-contained HTML file of the Pip gallery, for sharing.

Everything the gallery loads is inlined: fonts, styles, the Glass wallpapers, the generator
(pm-logo.js) and the gallery script. The result opens by double-click on any machine, with no
server and no network. The live PMConcept7 frame cannot travel (it needs the 32 MB app beside it),
so the single file shows a capture of the real top bar instead.

    python3 tools/build_standalone.py OUTPUT.html
"""
import base64
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent


def read(name):
    return (HERE / name).read_text(encoding="utf-8")


def data_uri(name, mime):
    return f"data:{mime};base64," + base64.b64encode((HERE / name).read_bytes()).decode("ascii")


def swap(text, old, new):
    if text.count(old) != 1:
        sys.exit(f"build_standalone: expected one {old!r}, found {text.count(old)}")
    return text.replace(old, new)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    out = pathlib.Path(sys.argv[1])

    app = read("app.js")
    for scheme in ("dark", "light"):
        app = swap(app, f"url(wall-ribbons-{scheme}.webp)", f"url({data_uri(f'wall-ribbons-{scheme}.webp', 'image/webp')})")
    boot = "window.PM_STANDALONE = { live: '" + data_uri("in-pmconcept7.webp", "image/webp") + "' };"

    html = read("index.html")
    html = swap(html, '<link rel="stylesheet" href="fonts.css">', "<style>\n" + read("fonts.css") + "\n</style>")
    html = swap(html, '<link rel="stylesheet" href="styles.css">', "<style>\n" + read("styles.css") + "\n</style>")
    # the Concept Hub bridge only matters inside the Hub
    html = swap(html, '  <script src="concept-hub-bridge.js"></script>\n', "")
    # every file the page itself references must be inlined (checked before scripts go in, since
    # their template strings hold attributes of their own)
    left = [r for r in re.findall(r'(?:src|href)="([^"]+)"', html) if not r.startswith(("data:", "#", "http")) and r not in ("pm-logo.js", "app.js")]
    if left:
        sys.exit(f"build_standalone: local references left: {left}")
    for name in ("pm-logo.js", "app.js"):
        body = app if name == "app.js" else read(name)
        if "</script" in body:
            sys.exit(f"build_standalone: {name} contains a closing script tag")
        html = swap(html, f'<script src="{name}"></script>', "<script>\n" + (boot + "\n" if name == "app.js" else "") + body + "\n</script>")

    out.write_text(html, encoding="utf-8")
    print(f"{out}  {out.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
