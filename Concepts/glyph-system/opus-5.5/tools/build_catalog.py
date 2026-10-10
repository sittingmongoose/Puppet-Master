#!/usr/bin/env python3
"""Build the Puppet Master glyph catalog: one self-contained HTML page (no network, no other files).

  python3 Concepts/glyph-system/opus-5.5/tools/build_catalog.py            # writes PMGlyphCatalog.html
  python3 Concepts/glyph-system/opus-5.5/tools/build_catalog.py --check    # builds in memory, reports problems
  python3 Concepts/glyph-system/opus-5.5/tools/build_catalog.py --out P    # writes P instead (designers' previews)

Order matters and is fixed here:
  CSS: src/bridge/pm7-looks.css, pm7-glyph-inks.css, pm7-bridge.css, then 5.6 Pro neon-icons.css, then src/catalog/*.css
  JS:  5.6 Pro neon-icons.js (the source set, read from its own folder, never copied), src/registry/*.js (loader first),
       src/registry/families/*.js (sorted), src/data/*.json as window.PMG_DATA, then src/catalog/*.js
The page loads itself in iframes for the side-by-side look matrix (?look=<look>&frame=<section>).
"""
from __future__ import annotations
import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent                                   # Concepts/glyph-system/opus-5.5
CONCEPTS = ROOT.parents[1]
SRC = ROOT / 'src'
NEON = CONCEPTS / 'chat-assistant-concepts' / '5.6 Pro'
TARGET = ROOT / 'PMGlyphCatalog.html'


def read(p: Path) -> str:
    return p.read_text(encoding='utf-8')


def guard(text: str, what: str) -> str:
    """A source must not close the element it is inlined into."""
    low = text.lower()
    if '</script' in low or '</style' in low:
        raise SystemExit(f'{what}: contains a closing </script> or </style>')
    return text


def parts():
    css = [SRC / 'bridge' / 'pm7-looks.css', SRC / 'bridge' / 'pm7-glyph-inks.css', SRC / 'bridge' / 'pm7-bridge.css',
           NEON / 'neon-icons.css'] + sorted((SRC / 'catalog').glob('*.css'))
    js = [NEON / 'neon-icons.js'] + sorted((SRC / 'registry').glob('*.js')) + \
        sorted((SRC / 'registry' / 'families').glob('*.js')) + sorted((SRC / 'catalog').glob('*.js'))
    data = {p.stem: json.loads(read(p)) for p in sorted((SRC / 'data').glob('*.json'))}
    return css, js, data


def build() -> str:
    css, js, data = parts()
    shell = read(SRC / 'catalog' / 'shell.html')
    style = '\n'.join(f'/* ==== {p.relative_to(CONCEPTS)} ==== */\n' + guard(read(p), str(p)) for p in css)
    data_js = 'window.PMG_DATA = ' + json.dumps(data, separators=(',', ':')).replace('</', '<\\/') + ';'
    scripts = [data_js] + [f'/* ==== {p.relative_to(CONCEPTS)} ==== */\n' + guard(read(p), str(p)) for p in js]
    body = '\n'.join(f'<script>\n{s}\n</script>' for s in scripts)
    src_hash = hashlib.sha256((style + ''.join(scripts) + shell).encode()).hexdigest()[:12]
    return (shell.replace('/*PMG:CSS*/', style)
                 .replace('<!--PMG:JS-->', body)
                 .replace('PMG:BUILD', src_hash))


def main() -> int:
    text = build()
    if '--check' in sys.argv:
        problems = []
        if TARGET.exists() and read(TARGET) != text:
            problems.append(f'{TARGET.name} differs from a fresh build; run build_catalog.py')
        if not TARGET.exists():
            problems.append(f'{TARGET.name} is missing; run build_catalog.py')
        for p in problems:
            print('PROBLEM:', p)
        print(f'check: {len(text):,} bytes, {len(problems)} problem(s)')
        return 1 if problems else 0
    out = TARGET
    if '--out' in sys.argv:
        out = Path(sys.argv[sys.argv.index('--out') + 1]).resolve()
    out.write_text(text, encoding='utf-8')
    print(f'wrote {out} ({len(text):,} bytes)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
