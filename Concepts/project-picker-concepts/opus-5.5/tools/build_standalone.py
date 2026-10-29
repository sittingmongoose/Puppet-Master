#!/usr/bin/env python3
"""Build a self-contained HTML file of the project box concept, for sharing.

Writes OUTDIR/project-box.html: this folder's index.html with PMConcept7 carried inside its frame (srcdoc) and the
concept's layer (picker.css, the logo kit's pm-logo.js, picker.js) inlined into it, so the file opens by double-click
with no server and no network. PMConcept7 is already self-contained.

A frame given as srcdoc has no address, so PMConcept7 cannot read ?o55=off there; a first script in its head writes an
onboarding record when none exists (the host page removes it again when it closes), so the app opens rather than setup.

    python3 tools/build_standalone.py OUTDIR [PMConcept7.html]

The second argument picks the PMConcept7 to carry (for example main's, from `git show origin/main:Concepts/PMConcept7.html`);
the default is the copy in this repository.
"""
import html
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent
PM7 = HERE.parent.parent / "PMConcept7.html"
PARTS = [
    ("style", HERE / "picker.css"),
    ("script", HERE.parent.parent / "Icon-Concepts" / "Opus5.5icon" / "pm-logo.js"),
    ("script", HERE / "picker.js"),
]
FIRST = ("<script>try{if(!localStorage.getItem('pm.o55.onboarding.v1')){localStorage.setItem('pm.o55.onboarding.v1',"
         "JSON.stringify({schema:'pm.o55.onboarding.v1',status:'done',source:'project-box-concept'}));}}catch(e){}</script>")


def main():
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    out = pathlib.Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    pm7 = pathlib.Path(sys.argv[2]) if len(sys.argv) == 3 else PM7
    app = pm7.read_text(encoding="utf-8")
    layer = ""
    for tag, path in PARTS:
        body = path.read_text(encoding="utf-8")
        if f"</{tag}" in body:
            sys.exit(f"build_standalone: {path.name} contains a closing {tag} tag")
        layer += f"<{tag}>\n{body}\n</{tag}>\n"
    cut = app.rfind("</body>")
    if cut < 0:
        sys.exit("build_standalone: PMConcept7 has no </body>")
    app = app[:cut] + layer + app[cut:]
    app, n = re.subn(r"<head(\s[^>]*)?>", lambda m: m.group(0) + FIRST, app, count=1)
    if n != 1:
        sys.exit("build_standalone: PMConcept7 has no <head>")
    app, n = re.subn(r"<html\b", '<html data-ppk-layer="on"', app, count=1)
    if n != 1:
        sys.exit("build_standalone: PMConcept7 has no <html> tag")
    host = (HERE / "index.html").read_text(encoding="utf-8")
    frame = 'src="../../PMConcept7.html?o55=off"'
    if frame not in host:
        sys.exit("build_standalone: index.html no longer frames ../../PMConcept7.html?o55=off")
    host = host.replace(frame, 'srcdoc="' + html.escape(app, quote=True) + '"')
    bridge = (HERE / "concept-hub-bridge.js").read_text(encoding="utf-8")
    host = host.replace('<script src="concept-hub-bridge.js"></script>', "<script>\n" + bridge + "\n</script>")
    target = out / "project-box.html"
    target.write_text(host, encoding="utf-8")
    print(f"{target} ({target.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
