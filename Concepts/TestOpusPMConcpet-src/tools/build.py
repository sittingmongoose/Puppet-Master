#!/usr/bin/env python3
"""Assemble TestOpusPMConcpet.html from the pristine TestPMConcept.html base.

Idempotent: always rebuilds from base, so src/ is the single source of truth for
the new onboarding + guided tour. The four legacy blocks are replaced wholesale.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]          # Concepts/
SRC  = pathlib.Path(__file__).resolve().parents[1] / "src"  # …-src/src
BASE = ROOT / "TestPMConcept.html"
OUT  = ROOT / "TestOpusPMConcpet.html"

def read(name):
    p = SRC / name
    if not p.exists():
        print(f"  ! missing {name}, using empty", file=sys.stderr)
        return ""
    return p.read_text(encoding="utf-8")

def replace_block(html, open_re, close, new, label):
    m = re.search(open_re, html)
    if not m:
        raise SystemExit(f"FATAL: could not find opening for {label} ({open_re})")
    start = m.start()
    end = html.index(close, m.end()) + len(close)
    return html[:start] + new + html[end:]

def main():
    html = BASE.read_text(encoding="utf-8")
    n0 = len(html)

    css_ob   = read("onboarding.css") + "\n" + read("arttokens.css")
    css_tour = read("tour.css")
    js_art   = read("art.js")
    js_flow  = read("flow.js")
    js_ob    = read("onboarding.js")
    js_tour  = read("tour.js")
    markup   = read("markup.html")

    # 1. onboarding CSS block -> new onboarding CSS
    html = replace_block(html, r'<style id="pm7-onboarding-css">', '</style>',
        '<style id="pmo-onboarding-css">\n' + css_ob + '\n</style>', 'onboarding css')

    # 2. guided tour CSS block -> new tour CSS
    html = replace_block(html, r'<style id="pm7-guided-tour-css">', '</style>',
        '<style id="pmo-tour-css">\n' + css_tour + '\n</style>', 'tour css')

    # 3. guided tour JS block -> art + flow (loaded early, before markup)
    html = replace_block(html, r'<script id="pm7-guided-tour-js">', '</script>',
        '<script id="pmo-art-js">\n' + js_art + '\n</script>\n'
        '<script id="pmo-flow-js">\n' + js_flow + '\n</script>', 'tour js')

    # 4. onboarding markup (root div + resume button)
    html = replace_block(html, r'<div id="pm7-onboarding" class="pm7ob"',
        '<button type="button" id="pm7-onboarding-resume" class="pm7ob-resume" '
        'data-ui-action-id="ui.onboarding.start" data-source-surface="resume" hidden>Resume setup</button>',
        markup, 'onboarding markup')

    # 4b. legacy guided-tour markup — dead once its CSS and JS are gone
    import re as _re
    _m = _re.search(r'<div id="pm7-guided-tour"', html)
    if _m:
        _d, _i = 0, _m.start()
        for _t in _re.finditer(r'</?div\b', html[_m.start():], _re.I):
            _d += 1 if _t.group(0).lower() == '<div' else -1
            if _d == 0:
                _end = html.index('>', _m.start() + _t.end()) + 1
                html = html[:_m.start()] + html[_end:]
                break

    # 5. onboarding JS block -> onboarding + tour controllers
    html = replace_block(html, r'<script id="pm7-onboarding-js">', '</script>',
        '<script id="pmo-onboarding-js">\n' + js_ob + '\n</script>\n'
        '<script id="pmo-tour-js">\n' + js_tour + '\n</script>', 'onboarding js')

    # Guard: art.js declares its scene set; a dropped scene silently falls back
    # to `marionette` at runtime, so assert the roster here instead.
    EXPECTED_SCENES = ["marionette", "workbench", "origin", "vault",
                       "route", "constellation", "curtain"]
    found = re.findall(r"^    ([a-z]+): function \(F, id\)", js_art, re.M)
    missing = [x for x in EXPECTED_SCENES if x not in found]
    extra = [x for x in found if x not in EXPECTED_SCENES]
    if missing or extra:
        raise SystemExit(f"FATAL: scene roster drift — missing {missing}, unexpected {extra}")
    for tag in ("pm7ob-", "pm7gt-"):
        if tag in html:
            n = html.count(tag)
            print(f"   ! {n} residual '{tag}' references remain", file=sys.stderr)

    OUT.write_text(html, encoding="utf-8")
    print(f"built {OUT.name}: {n0:,} -> {len(html):,} bytes")
    for f, s in (("onboarding.css", css_ob), ("tour.css", css_tour), ("art.js", js_art),
                 ("flow.js", js_flow), ("onboarding.js", js_ob), ("tour.js", js_tour),
                 ("markup.html", markup)):
        print(f"   {f:18s} {len(s):>8,} B")

main()
