#!/usr/bin/env python3
"""Build a self-contained HTML file of the Projects concepts, for sharing.

Writes OUTDIR/projects-concepts.html: this folder's index.html with PMConcept7 carried inside its frame (srcdoc) and the
concepts' layer (layer/*, concepts/*) inlined into it, in index.html's load order, so the file opens by double-click with
no server and no network. PMConcept7 is already self-contained.

A frame given as srcdoc has no address, so PMConcept7 cannot read ?o55=off there; a first script in its head writes an
onboarding record when none exists (the host page removes it again when it closes), so the app opens rather than setup.
In a sandboxed preview (T3's file preview) the frame has no storage at all: PMConcept7 then gets an in-memory stand-in.

    python3 tools/build_standalone.py OUTDIR [path/to/PMConcept7.html]
"""
import html
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent
PM7 = HERE.parent.parent / "PMConcept7.html"
FIRST = ("<script>(function(){var ok=true;try{localStorage.getItem('x');}catch(e){ok=false;}"
         "if(!ok){var m=new Map();var s={getItem:function(k){return m.has(String(k))?m.get(String(k)):null;},"
         "setItem:function(k,v){m.set(String(k),String(v));},removeItem:function(k){m.delete(String(k));},clear:function(){m.clear();},"
         "key:function(i){return Array.from(m.keys())[i]||null;},get length(){return m.size;}};"
         "try{Object.defineProperty(window,'localStorage',{value:s,configurable:true});}catch(e){}}"
         "try{if(!localStorage.getItem('pm.o55.onboarding.v1')){localStorage.setItem('pm.o55.onboarding.v1',"
         "JSON.stringify({schema:'pm.o55.onboarding.v1',status:'done',source:'projects-concept'}));}}catch(e){}})();</script>")


def parts(host):
    """The layer files in index.html's own order (its STEPS list), so the single file loads exactly what the page does."""
    m = re.search(r"const STEPS = \[(.*?)\]\.map", host, re.S)
    if not m:
        sys.exit("build_standalone: index.html has no STEPS list")
    return [("style" if k == "css" else "script", HERE / p) for k, p in re.findall(r"\['(css|js)', '([^']+)'\]", m.group(1))]


def main():
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    out = pathlib.Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    pm7 = pathlib.Path(sys.argv[2]) if len(sys.argv) == 3 else PM7
    app = pm7.read_text(encoding="utf-8")
    host = (HERE / "index.html").read_text(encoding="utf-8")
    layer = ""
    for tag, path in parts(host):
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
    app, n = re.subn(r"<html\b", '<html data-pjx-layer="on"', app, count=1)
    if n != 1:
        sys.exit("build_standalone: PMConcept7 has no <html> tag")
    frame = 'src="../../PMConcept7.html?o55=off"'
    if frame not in host:
        sys.exit("build_standalone: index.html no longer frames ../../PMConcept7.html?o55=off")
    host = host.replace(frame, 'srcdoc="' + html.escape(app, quote=True) + '"')
    bridge = (HERE / "concept-hub-bridge.js").read_text(encoding="utf-8")
    host = host.replace('<script src="concept-hub-bridge.js"></script>', "<script>\n" + bridge + "\n</script>")
    target = out / "projects-concepts.html"
    target.write_text(host, encoding="utf-8")
    print(f"{target} ({target.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
