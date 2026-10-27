#!/usr/bin/env python3
"""Build one self-contained HTML file of the Pip onboarding concept, for sharing.

Inlines the fonts, styles, the Glass wallpapers, the logo generator and the stage, so the file opens
by double-click anywhere with no server and no network.

    python3 tools/build_standalone.py OUTPUT.html
"""
import base64
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent
ICON = HERE.parent.parent / "Icon-Concepts" / "Opus5.5icon"


def read(path):
    return path.read_text(encoding="utf-8")


def data_uri(path, mime):
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def swap(text, old, new):
    if text.count(old) != 1:
        sys.exit(f"build_standalone: expected one {old!r}, found {text.count(old)}")
    return text.replace(old, new)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    out = pathlib.Path(sys.argv[1])
    walls = {s: data_uri(ICON / f"wall-ribbons-{s}.webp", "image/webp") for s in ("dark", "light")}

    styles = read(HERE / "styles.css")
    for s in ("dark", "light"):
        styles = swap(styles, f"url(../../Icon-Concepts/Opus5.5icon/wall-ribbons-{s}.webp)", f"url({walls[s]})")

    html = read(HERE / "index.html")
    html = swap(html, '<link rel="stylesheet" href="../../Icon-Concepts/Opus5.5icon/fonts.css">', "<style>\n" + read(ICON / "fonts.css") + "\n</style>")
    html = swap(html, '<link rel="stylesheet" href="stage.css">', "<style>\n" + read(HERE / "stage.css") + "\n</style>")
    html = swap(html, '<link rel="stylesheet" href="styles.css">', "<style>\n" + styles + "\n</style>")
    html = swap(html, '  <script src="concept-hub-bridge.js"></script>\n', "")
    scripts = [("../../Icon-Concepts/Opus5.5icon/pm-logo.js", ICON / "pm-logo.js"), ("worlds.js", HERE / "worlds.js"), ("stage.js", HERE / "stage.js"), ("wizard.js", HERE / "wizard.js")]
    boot = "window.PIP_WALLS = " + repr(walls).replace("'", '"') + ";\n"
    for i, (src, path) in enumerate(scripts):
        body = read(path)
        if "</script" in body:
            sys.exit(f"build_standalone: {path.name} contains a closing script tag")
        html = swap(html, f'<script src="{src}"></script>', "<script>\n" + (boot if i == 0 else "") + body + "\n</script>")
    out.write_text(html, encoding="utf-8")
    print(f"{out}  {out.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
