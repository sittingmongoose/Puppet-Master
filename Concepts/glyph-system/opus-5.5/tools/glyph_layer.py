#!/usr/bin/env python3
"""The glyph layer: puts the Puppet Master glyph system into PMConcept7 (build.py step 5, after the left rail).

Jared approved the catalog on 2026-10-10 (D44: GLY-0..3 as recommended). This layer is the rollout's foundation: it
adds the 5.6 Pro neon renderer, the PMG registry and its families, and the PM7 bridge to the built page, and changes
nothing that is already drawn. A surface adopts the set in its own source by calling PMG.icon(name, size) or
PMG.status(key, size); until it does, the page renders exactly as before (neon CSS styles only svg.nx and .nx-st).

What it adds, between <!-- GLYPHS:START --> and <!-- GLYPHS:END --> just before </head>:
  <style id="pm-glyph-css">  pm7-glyph-inks.css, pm7-bridge.css, neon-icons.css, pm7-retro-phosphor.css
  <script id="pm-glyph-js">  neon-icons.js, src/registry/*.js, src/registry/families/*.js
The script is in the head so window.PMG exists before any body script draws. pm7-looks.css is the catalog's copy of
PM7's own tokens and is never added (the page has the real ones).

The neon CSS keys light and dark on body[data-theme]; PMConcept7 writes data-theme on <html> only, so those selectors
are rewritten to html[data-theme...] body (same meaning, one element more specific). The rewrite is checked: no
body[data-theme survives.
"""
from __future__ import annotations
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
CONCEPTS = ROOT.parents[1]
SRC = ROOT / 'src'
NEON = CONCEPTS / 'chat-assistant-concepts' / '5.6 Pro'
START, END = '<!-- GLYPHS:START -->', '<!-- GLYPHS:END -->'


def _read(p: Path) -> str:
    t = p.read_text(encoding='utf-8')
    low = t.lower()
    if '</script' in low or '</style' in low:
        raise SystemExit(f'{p}: contains a closing </script> or </style>')
    return t


def html_theme(css: str) -> str:
    """body[data-theme...] -> html[data-theme...] body, keeping any html[...] prefix the selector already had."""
    def sub(m):
        pre, attrs, theme = m.group(1), m.group(2) or '', m.group(3)
        return f'html{attrs}{theme} body' if pre else f'html{theme} body'
    return re.sub(r'(html((?:\[[^\]]+\])*)\s+)?body(\[data-theme[^\]]*\])', sub, css)


def css_parts():
    parts = [SRC / 'bridge' / 'pm7-glyph-inks.css', SRC / 'bridge' / 'pm7-bridge.css', NEON / 'neon-icons.css']
    phos = SRC / 'bridge' / 'pm7-retro-phosphor.css'
    return parts + ([phos] if phos.exists() else [])


def js_parts():
    return [NEON / 'neon-icons.js'] + sorted((SRC / 'registry').glob('*.js')) + sorted((SRC / 'registry' / 'families').glob('*.js'))


def block() -> str:
    css = '\n'.join(f'/* {p.relative_to(CONCEPTS)} */\n' + html_theme(_read(p)) for p in css_parts())
    js = '\n'.join(f'/* {p.relative_to(CONCEPTS)} */\n' + _read(p) for p in js_parts())
    return (f'{START}\n<style id="pm-glyph-css">\n{css}\n</style>\n'
            f'<script id="pm-glyph-js">\n{js}\n</script>\n{END}\n')


def apply_published(text: str, need) -> tuple[str, dict]:
    need(START not in text and END not in text, 'glyph layer markers already present')
    need(text.count('</head>') >= 1, 'no </head> for the glyph layer')
    b = block()
    text = text.replace('</head>', b + '</head>', 1)
    return text, {'bytes': len(b.encode('utf-8')), 'css': [str(p.relative_to(CONCEPTS)) for p in css_parts()],
                  'js': len(js_parts())}


def published_problems(built: str) -> list[str]:
    out = []
    for m in (START, END, 'id="pm-glyph-css"', 'id="pm-glyph-js"'):
        if built.count(m) != 1:
            out.append(f'glyph layer: {m} appears {built.count(m)} times')
    i, j = built.find(START), built.find(END)
    if i >= 0 and j > i and re.search(r'body\[data-theme', built[i:j]):
        out.append('glyph layer: a body[data-theme selector survived the html rewrite')
    if i >= 0 and built.find('</head>') < i:
        out.append('glyph layer: block is not in the head')
    return out


if __name__ == '__main__':
    b = block()
    left = re.findall(r'body\[data-theme[^\]]*\]', b)
    print(f'glyph layer block: {len(b.encode("utf-8")):,} bytes; body[data-theme left: {len(left)}')
    for m in re.finditer(r'html[^{,]*\[data-theme[^{,]*body', b):
        print('  ', m.group(0)[:110])
