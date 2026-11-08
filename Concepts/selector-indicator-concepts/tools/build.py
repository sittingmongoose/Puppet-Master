#!/usr/bin/env python3
"""Build Concepts/selector-indicator-concepts/index.html: one self-contained page that works from file://.

Inlines src/style.css and src/app.js into src/page.html, the product's own Inter and Poppins Latin faces (from
Concepts/onboarding/opus-5.5/src/fonts, the bytes the product embeds) as data: URIs, and the "Today" crops in
assets/today/ (captured by tools/capture-today.check.mjs) as data: URIs with their pixel sizes.

Usage: python3 -B Concepts/selector-indicator-concepts/tools/build.py [--out <path>] [--check]
"""
from __future__ import annotations

import base64
import json
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT.parent / 'onboarding' / 'opus-5.5' / 'src' / 'fonts'
FACES = [
    ('Inter', 'normal', '100 900', 'inter-latin-100-900-normal.woff2'),
    ('Poppins', 'normal', '400', 'poppins-latin-400-normal.woff2'),
    ('Poppins', 'normal', '500', 'poppins-latin-500-normal.woff2'),
    ('Poppins', 'normal', '600', 'poppins-latin-600-normal.woff2'),
    ('Poppins', 'normal', '700', 'poppins-latin-700-normal.woff2'),
]
LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'


def b64(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode('ascii')


def png_size(path: Path) -> tuple[int, int]:
    head = path.read_bytes()[:24]
    if head[:8] != b'\x89PNG\r\n\x1a\n':
        raise SystemExit(f'not a PNG: {path}')
    return struct.unpack('>II', head[16:24])


def build() -> str:
    page = (ROOT / 'src' / 'page.html').read_text(encoding='utf-8')
    css = (ROOT / 'src' / 'style.css').read_text(encoding='utf-8')
    js = (ROOT / 'src' / 'app.js').read_text(encoding='utf-8')
    fonts = '\n'.join(
        f"@font-face {{ font-family: '{fam}'; font-style: {style}; font-weight: {weight}; font-display: swap; "
        f"src: url(data:font/woff2;base64,{b64(FONTS / name)}) format('woff2'); unicode-range: {LATIN}; }}"
        for fam, style, weight, name in FACES)
    imgs = {}
    for p in sorted((ROOT / 'assets' / 'today').glob('*.png')):
        w, h = png_size(p)
        imgs[p.stem] = {'src': 'data:image/png;base64,' + b64(p), 'w': w, 'h': h}
    js = js.replace('/*{{IMGS}}*/', 'const IMGS = ' + json.dumps(imgs, separators=(',', ':')) + ';', 1)
    for token, body in (('/*{{FONTS}}*/', fonts), ('/*{{CSS}}*/', css), ('//{{JS}}', js)):
        if page.count(token) != 1:
            raise SystemExit(f'template token {token} found {page.count(token)} times')
        page = page.replace(token, body, 1)
    return page


def main(argv: list[str]) -> int:
    out = ROOT / 'index.html'
    if '--out' in argv:
        out = Path(argv[argv.index('--out') + 1]).resolve()
    text = build()
    if '--check' in argv:
        cur = (ROOT / 'index.html').read_text(encoding='utf-8') if (ROOT / 'index.html').exists() else ''
        if cur != text:
            print('index.html is stale: run tools/build.py', file=sys.stderr)
            return 1
        print('index.html is current')
        return 0
    out.write_text(text, encoding='utf-8')
    print(json.dumps({'output': str(out), 'bytes': len(text.encode('utf-8'))}))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
