#!/usr/bin/env python3
"""Build the settings-managers concept as single files, for sharing and for the browser-check kit.

Writes two files into OUTDIR:
  settings-managers.html      this folder's index.html with PMConcept7 carried inside its frame (srcdoc) and the layer
                              (layer/*) inlined into it, in index.html's load order: it opens by double-click, with the
                              review strip, and needs no server or network. For sharing with Jared.
  settings-managers-app.html  PMConcept7 with the layer inlined before </body> and no host page. With no parent, the
                              layer reads its review config from the URL hash, for example
                              #smx=route=computers/away,look=glass-dark,view=new
                              For the browser-check kit, which opens a page directly (--set page=...).

A frame given as srcdoc has no address, so PMConcept7 cannot read ?o55=off there; a first script in its head writes an
onboarding record when none exists, so the app opens rather than setup. In a sandboxed preview (T3's file preview) the
frame has no storage at all: PMConcept7 then gets an in-memory stand-in.

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
         "JSON.stringify({schema:'pm.o55.onboarding.v1',status:'done',source:'settings-managers'}));}}catch(e){}})();</script>")
# the app file: the kit opens it with ?o55=off; with no storage PMConcept7 keeps Settings in memory, and so does the layer
FIRST_APP = ("<script>(function(){try{if(!localStorage.getItem('pm.o55.onboarding.v1')){localStorage.setItem('pm.o55.onboarding.v1',"
             "JSON.stringify({schema:'pm.o55.onboarding.v1',status:'done',source:'settings-managers'}));}}catch(e){}})();</script>")


def parts(host):
    """The layer files in index.html's own order (its STEPS list), so the single file loads exactly what the page does."""
    m = re.search(r"const STEPS = \[(.*?)\]\.map", host, re.S)
    if not m:
        sys.exit("build_standalone: index.html has no STEPS list")
    return [("style" if k == "css" else "script", HERE / p) for k, p in re.findall(r"\['(css|js)', '([^']+)'\]", m.group(1))]


def layered(app, host, first):
    layer = ""
    for tag, path in parts(host):
        if not path.exists():
            sys.exit(f"build_standalone: {path} is listed in index.html but does not exist")
        body = path.read_text(encoding="utf-8")
        if f"</{tag}" in body:
            sys.exit(f"build_standalone: {path.name} contains a closing {tag} tag")
        layer += f"<{tag}>\n{body}\n</{tag}>\n"
    cut = app.rfind("</body>")
    if cut < 0:
        sys.exit("build_standalone: PMConcept7 has no </body>")
    app = app[:cut] + layer + app[cut:]
    app, n = re.subn(r"<head(\s[^>]*)?>", lambda m: m.group(0) + first, app, count=1)
    if n != 1:
        sys.exit("build_standalone: PMConcept7 has no <head>")
    app, n = re.subn(r"<html\b", '<html data-smx-layer="loading"', app, count=1)
    if n != 1:
        sys.exit("build_standalone: PMConcept7 has no <html> tag")
    return app


def main():
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    out = pathlib.Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    pm7 = pathlib.Path(sys.argv[2]) if len(sys.argv) == 3 else PM7
    raw = pm7.read_text(encoding="utf-8")
    host = (HERE / "index.html").read_text(encoding="utf-8")
    # the shared file: the host page, PMConcept7 with the layer in its frame
    app = layered(raw, host, FIRST)
    frame = 'src="../../PMConcept7.html?o55=off"'
    if frame not in host:
        sys.exit("build_standalone: index.html no longer frames ../../PMConcept7.html?o55=off")
    shared = host.replace(frame, 'srcdoc="' + html.escape(app, quote=True) + '"')
    bridge = (HERE / "concept-hub-bridge.js").read_text(encoding="utf-8")
    shared = shared.replace('<script src="concept-hub-bridge.js"></script>', "<script>\n" + bridge + "\n</script>")
    target = out / "settings-managers.html"
    target.write_text(shared, encoding="utf-8")
    print(f"{target} ({target.stat().st_size / 1e6:.1f} MB)")
    # the app file: PMConcept7 with the layer, no host
    app2 = layered(raw, host, FIRST_APP)
    target2 = out / "settings-managers-app.html"
    target2.write_text(app2, encoding="utf-8")
    print(f"{target2} ({target2.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
