#!/usr/bin/env python3
"""build_proto.py - the Liquid Glass concept page: published PMConcept7 plus src/glass.css, src/glass.js and src/walls/*.webp.

    python3 build_proto.py --out <path.html> [--base Concepts/PMConcept7.html]

Writes only --out (never into Concepts/: the concept page is a review copy for the share folder, PMConcept7 itself is
published only by opus-5.5 build.py). Adds <style id="lg-css"> before </head> and <script id="lg-js"> before </body>,
each exactly once, and stamps data-concept-model="Opus 5.5" on the page as the concept rules ask.
"""
import argparse
import base64
import hashlib
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
PKG = HERE.parent
CONCEPTS = PKG.parent.parent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--base', default=str(CONCEPTS / 'PMConcept7.html'))
    a = ap.parse_args()
    base = pathlib.Path(a.base).read_text(encoding='utf-8')
    for mark in ('id="lg-css"', 'id="lg-js"'):
        if mark in base:
            sys.exit(f'base already carries {mark}')
    css = (PKG / 'src' / 'glass.css').read_text(encoding='utf-8')
    js = (PKG / 'src' / 'glass.js').read_text(encoding='utf-8')
    chk = subprocess.run(['node', '--check', str(PKG / 'src' / 'glass.js')], capture_output=True, text=True)
    if chk.returncode:
        sys.exit('glass.js: ' + chk.stderr)
    vars_ = ''.join(f"  --lg-wall-{w.stem}: url(data:image/webp;base64,{base64.b64encode(w.read_bytes()).decode()});\n"
                    for w in sorted((PKG / 'src' / 'walls').glob('*.webp')))
    style = f'<style id="lg-css">\nhtml {{\n{vars_}}}\n{css}</style>\n'
    script = f'<script id="lg-js">\n{js}</script>\n'
    # the page's own scripts can hold '</head>' or '</body>' inside string literals: the document's head ends at the
    # first one, its body at the last one
    h, b = base.find('</head>'), base.rfind('</body>')
    if h < 0 or b < 0 or b < h:
        sys.exit('base: no </head> before </body>')
    out = base[:h] + style + base[h:b] + script + base[b:]
    out = out.replace('<html lang="en"', '<html lang="en" data-concept-model="Opus 5.5"', 1)
    p = pathlib.Path(a.out)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(out, encoding='utf-8')
    print(f'{p} {len(out):,} bytes (+{len(out) - len(base):,}) sha256 {hashlib.sha256(out.encode()).hexdigest()[:16]}')


if __name__ == '__main__':
    main()
