#!/usr/bin/env python3
"""Build a family contact sheet: one family's glyphs at 12/14/16/20 px and in mock surfaces, in every look.

  python3 Concepts/glyph-system/opus-5.5/tools/family_sheet.py terminal --out /tmp/x/terminal-sheet.html

The page renders one look per frame (?look=<look>-<mode>&motion=full|reduced). Without ?look it shows all ten looks
side by side in iframes of itself, which is the contact sheet a family is reviewed on. It uses the catalog's own CSS and
JS (build_catalog.parts(), the catalog chrome left out), so every glyph is drawn by the real renderer. Designer previews
only: write it to a scratch path, never commit the output.
OWNER: pm7-glyphs-designer2 (2026-10-10).
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build_catalog as bc  # noqa: E402

SHEETS = HERE.parent / 'src' / 'sheets'

PAGE = """<!doctype html>
<html lang="en" data-theme="basic-dark">
<head>
<meta charset="utf-8">
<title>PMG family sheet: %(family)s</title>
<script>
(function () {
  var q = new URLSearchParams(location.search), html = document.documentElement;
  var m = /^(basic|friendly|glass|retro|nier)-(light|dark)$/.exec(q.get('look') || '');
  if (!m) { html.setAttribute('data-pmg-matrix', '1'); return; }
  var theme = (m[1] === 'nier' ? 'basic' : m[1]) + '-' + m[2];
  html.setAttribute('data-theme', theme);
  html.setAttribute('data-pmg-look', m[1] + '-' + m[2]);
  if (m[1] === 'nier') { html.setAttribute('data-o55-nier', 'on'); html.setAttribute('data-o55-nier-parts', 'icons'); }
  if (q.get('motion') === 'reduced') html.setAttribute('data-motion', 'reduced');
})();
</script>
<style>
%(css)s
</style>
</head>
<body>
<main id="sheet"></main>
%(js)s
</body>
</html>
"""


def main() -> int:
    if len(sys.argv) < 2 or sys.argv[1].startswith('-'):
        print(__doc__)
        return 2
    family = sys.argv[1]
    if '--out' not in sys.argv:
        print('--out PATH is required (a scratch path; never commit the sheet)', file=sys.stderr)
        return 2
    out = Path(sys.argv[sys.argv.index('--out') + 1]).resolve()
    css, js, data = bc.parts()
    css = [p for p in css if p.parent.name != 'catalog']
    phos = HERE.parent / 'src' / 'bridge' / 'pm7-retro-phosphor.css'
    if phos.exists() and phos not in css:  # only if build_catalog.py does not list it (it loads it after neon-icons.css)
        css.insert(next(i for i, p in enumerate(css) if p.name == 'pm7-bridge.css') + 1, phos)
    css += [SHEETS / 'sheet.css']
    js = [p for p in js if p.parent.name != 'catalog'] + [SHEETS / 'sheet.js', SHEETS / (family + '.js')]
    for p in css + js:
        if not p.exists():
            print(f'missing: {p}', file=sys.stderr)
            return 1
    style = '\n'.join(bc.guard(bc.read(p), str(p)) for p in css)
    data_js = 'window.PMG_DATA = ' + json.dumps(data, separators=(',', ':')).replace('</', '<\\/') + ';'
    body = '\n'.join(f'<script>\n{s}\n</script>' for s in [data_js] + [bc.guard(bc.read(p), str(p)) for p in js])
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes((PAGE % {'family': family, 'css': style, 'js': body}).encode('utf-8'))
    print(f'wrote {out}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
