#!/usr/bin/env python3
"""Build the settings-scope concept as single files, for sharing and for the browser-check kit.

Writes two files into OUTDIR:
  settings-scope.html      this folder's index.html with PMConcept7 carried inside its frame (srcdoc) and the layer
                           (layer/*) inlined into it, in index.html's load order: it opens by double-click, with the
                           review strip, and needs no server or network. For sharing with Jared.
  settings-scope-app.html  PMConcept7 with the layer inlined before </body> and no host page. With no parent, the layer
                           reads its review config from the URL hash, for example
                           #psx=opt.end=origin,opt.changed=outline,ctx.project=tastebook,homenas=down,moment=11.1
                           For the browser-check kit, which opens a page directly (--set page=...).

A frame given as srcdoc has no address, so PMConcept7 cannot read ?o55=off there; a first script in its head writes an
onboarding record when none exists (the host page removes it again when it closes), so the app opens rather than setup.
In a sandboxed preview (T3's file preview) the frame has no storage at all: PMConcept7 then gets an in-memory stand-in.
The app file has no stand-in (the kit's sandbox check asserts the opaque origin; PMConcept7 and the layer keep their state
in memory there) and no host to put PMConcept7's own Settings keys back when it closes, so its first script does that.

    python3 tools/build_standalone.py OUTDIR [path/to/PMConcept7.html] [--inventory path/to/settings_inventory.json]

Inventory alignment (2026-11-13): Plans' inventory layering is the per-row authority (SSYS-059), so both files carry the
repository's Plans/settings_inventory.json (each row's id, type and layering, the group titles, and the file's SHA-256)
as window.PSX_LAYERING, ahead of the layer. The served index.html fetches the same file instead.
"""
import hashlib
import html
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent
PM7 = HERE.parent.parent / "PMConcept7.html"
INVENTORY = HERE.parent.parent.parent / "Plans" / "settings_inventory.json"


def layering(path):
    """The part of Plans' inventory the layer reads: every row's id, type and layering, the group titles, the source."""
    raw = path.read_bytes()
    d = json.loads(raw)
    rows = [{"id": r["id"], "type": r.get("type"), "layering": r["layering"]} for r in d.get("settings", []) if isinstance(r, dict) and r.get("id") and isinstance(r.get("layering"), dict)]
    if not rows:
        sys.exit(f"build_standalone: {path} has no rows with layering")
    groups = {f"{c['id']}.{g['id']}": g.get("title") for c in d.get("categories", []) for g in c.get("subgroups", [])}
    try:
        shown = str(path.resolve().relative_to(HERE.parent.parent.parent))
    except ValueError:
        shown = str(path)
    data = {"source": {"path": shown, "sha256": hashlib.sha256(raw).hexdigest(), "schema_version": d.get("schema_version"), "rows": len(rows)}, "groups": groups, "settings": rows}
    return "<script>window.PSX_LAYERING=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";</script>\n"
FIRST = ("<script>(function(){var ok=true;try{localStorage.getItem('x');}catch(e){ok=false;}"
         "if(!ok){var m=new Map();var s={getItem:function(k){return m.has(String(k))?m.get(String(k)):null;},"
         "setItem:function(k,v){m.set(String(k),String(v));},removeItem:function(k){m.delete(String(k));},clear:function(){m.clear();},"
         "key:function(i){return Array.from(m.keys())[i]||null;},get length(){return m.size;}};"
         "try{Object.defineProperty(window,'localStorage',{value:s,configurable:true});}catch(e){}}"
         "try{if(!localStorage.getItem('pm.o55.onboarding.v1')){localStorage.setItem('pm.o55.onboarding.v1',"
         "JSON.stringify({schema:'pm.o55.onboarding.v1',status:'done',source:'settings-scope'}));}}catch(e){}})();</script>")
# the app file has no stand-in storage: the kit opens it with ?o55=off, PMConcept7 keeps Settings in memory on a page
# with no storage, and the layer does too, so a sandboxed run still sees the opaque origin the kit's sandbox check asserts
FIRST_APP = ("<script>(function(){try{window.__psxOB=localStorage.getItem('pm.o55.onboarding.v1');if(!window.__psxOB){localStorage.setItem('pm.o55.onboarding.v1',"
             "JSON.stringify({schema:'pm.o55.onboarding.v1',status:'done',source:'settings-scope'}));}}catch(e){}})();</script>")
# the app file only: PMConcept7's own per-project Settings keys are put back when the page closes (the host page does
# this for settings-scope.html and for the served concept)
RESTORE = ("<script>(function(){if(window.parent!==window)return;var P=['tastebook','harbor','loom','docs-site','legacy-app',"
           "'experiment','garden-notes','recipe-app','lighting-rig','psx-none'],K=P.map(function(p){return 'pm7:settings:tome-tabs:v1:'+"
           "encodeURIComponent(p);}),S={},OB='pm.o55.onboarding.v1';try{K.forEach(function(k){S[k]=localStorage.getItem(k);});}catch(e){}"
           "window.addEventListener('pagehide',function(){try{K.forEach(function(k){if(S[k]===null)localStorage.removeItem(k);"
           "else localStorage.setItem(k,S[k]);});var v=localStorage.getItem(OB);if(window.__psxOB===null){if(/settings-scope/.test(v||''))localStorage.removeItem(OB);}"
           "else if(typeof window.__psxOB==='string'&&v!==window.__psxOB)localStorage.setItem(OB,window.__psxOB);}catch(e){}});})();</script>")


def parts(host):
    """The layer files in index.html's own order (its STEPS list), so the single file loads exactly what the page does."""
    m = re.search(r"const STEPS = \[(.*?)\]\.map", host, re.S)
    if not m:
        sys.exit("build_standalone: index.html has no STEPS list")
    return [("style" if k == "css" else "script", HERE / p) for k, p in re.findall(r"\['(css|js)', '([^']+)'\]", m.group(1))]


def layered(app, host, first, inv):
    layer = inv
    for tag, path in parts(host):
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
    app, n = re.subn(r"<html\b", '<html data-psx-layer="on"', app, count=1)
    if n != 1:
        sys.exit("build_standalone: PMConcept7 has no <html> tag")
    return app


def main():
    args = sys.argv[1:]
    inventory = INVENTORY
    if "--inventory" in args:
        i = args.index("--inventory")
        if i + 1 >= len(args):
            sys.exit(__doc__)
        inventory = pathlib.Path(args[i + 1])
        del args[i:i + 2]
    if len(args) not in (1, 2):
        sys.exit(__doc__)
    if not inventory.is_file():
        sys.exit(f"build_standalone: no inventory at {inventory} (Plans/settings_inventory.json, or --inventory PATH)")
    inv = layering(inventory)
    out = pathlib.Path(args[0])
    out.mkdir(parents=True, exist_ok=True)
    pm7 = pathlib.Path(args[1]) if len(args) == 2 else PM7
    raw = pm7.read_text(encoding="utf-8")
    host = (HERE / "index.html").read_text(encoding="utf-8")
    # the shared file: the host page, PMConcept7 with the layer in its frame
    app = layered(raw, host, FIRST, inv)
    frame = 'src="../../PMConcept7.html?o55=off"'
    if frame not in host:
        sys.exit("build_standalone: index.html no longer frames ../../PMConcept7.html?o55=off")
    shared = host.replace(frame, 'srcdoc="' + html.escape(app, quote=True) + '"')
    bridge = (HERE / "concept-hub-bridge.js").read_text(encoding="utf-8")
    shared = shared.replace('<script src="concept-hub-bridge.js"></script>', "<script>\n" + bridge + "\n</script>")
    target = out / "settings-scope.html"
    target.write_text(shared, encoding="utf-8")
    print(f"{target} ({target.stat().st_size / 1e6:.1f} MB)")
    # the app file: PMConcept7 with the layer, no host
    app2 = layered(raw, host, FIRST_APP + RESTORE, inv)
    target2 = out / "settings-scope-app.html"
    target2.write_text(app2, encoding="utf-8")
    print(f"{target2} ({target2.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
