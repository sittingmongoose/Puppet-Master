#!/usr/bin/env python3
"""build_preview.py - the notification review page: a built PMConcept7 plus the Notification lab (src/lab.css, src/lab.js).

    python3 build_preview.py --out <path.html> [--base Concepts/PMConcept7.html] [--lg [--lg-ref <git ref>]]

Writes only --out (a review copy for the share folder; PMConcept7 itself is published only by opus-5.5 build.py).
--lg also adds the Liquid Glass overlay from Concepts/liquid-glass/opus-5.5 exactly as that concept's build_proto.py
does, so Glass can be reviewed with it on; --lg-ref reads the overlay from a commit instead (the Liquid Glass owner's
unlanded head, git show), so the preview can carry that owner's newer opt-ins. Adds <style id="pmn-lab-css"> before </head> and <script id="pmn-lab-js">
before </body>, each once, and stamps data-concept-model="Opus 5.5".
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
LG = CONCEPTS / 'liquid-glass' / 'opus-5.5'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--base', default=str(CONCEPTS / 'PMConcept7.html'))
    ap.add_argument('--lg', action='store_true')
    ap.add_argument('--lg-ref', default=None)
    a = ap.parse_args()
    out_path = pathlib.Path(a.out).resolve()
    if CONCEPTS.resolve() in out_path.parents:
        sys.exit('--out must be outside Concepts/ (this is a review copy)')
    base = pathlib.Path(a.base).read_text(encoding='utf-8')
    if 'id="pmn-lab-css"' in base or 'id="pmn-lab-js"' in base:
        sys.exit('base already carries the lab')
    for f in ('lab.js',):
        chk = subprocess.run(['node', '--check', str(PKG / 'src' / f)], capture_output=True, text=True)
        if chk.returncode:
            sys.exit(f + ': ' + chk.stderr)
    head, tail = '<style id="pmn-lab-css">\n' + (PKG / 'src' / 'lab.css').read_text(encoding='utf-8') + '</style>\n', ''
    if a.lg:
        rel = LG.relative_to(CONCEPTS.parent).as_posix()

        def lg_bytes(name):
            if not a.lg_ref:
                return (LG / 'src' / name).read_bytes()
            r = subprocess.run(['git', '-C', str(CONCEPTS.parent), 'show', f'{a.lg_ref}:{rel}/src/{name}'], capture_output=True)
            if r.returncode:
                sys.exit(f'--lg-ref {a.lg_ref}: {name}: ' + r.stderr.decode()[:200])
            return r.stdout
        if a.lg_ref:
            listing = subprocess.run(['git', '-C', str(CONCEPTS.parent), 'ls-tree', '--name-only', f'{a.lg_ref}:{rel}/src/walls'], capture_output=True, text=True)
            names = sorted(n for n in listing.stdout.split() if n.endswith('.webp'))
        else:
            names = sorted(w.name for w in (LG / 'src' / 'walls').glob('*.webp'))
        css = lg_bytes('glass.css').decode('utf-8')
        walls = ''.join(f"  --lg-wall-{n[:-5]}: url(data:image/webp;base64,{base64.b64encode(lg_bytes('walls/' + n)).decode()});\n" for n in names)
        head += f'<style id="lg-css">\nhtml {{\n{walls}}}\n{css}</style>\n'
        tail += '<script id="lg-js">\n' + lg_bytes('glass.js').decode('utf-8') + '</script>\n'
    tail += '<script id="pmn-lab-js">\n' + (PKG / 'src' / 'lab.js').read_text(encoding='utf-8') + '</script>\n'
    # the page's scripts can hold '</head>' or '</body>' in string literals: the head ends at the first, the body at the last
    h, b = base.find('</head>'), base.rfind('</body>')
    if h < 0 or b < 0 or b < h:
        sys.exit('base: no </head> before </body>')
    out = base[:h] + head + base[h:b] + tail + base[b:]
    out = out.replace('<html lang="en"', '<html lang="en" data-concept-model="Opus 5.5"', 1)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(out, encoding='utf-8')
    print(f'{out_path} {len(out):,} bytes sha256 {hashlib.sha256(out.encode()).hexdigest()[:16]}')


if __name__ == '__main__':
    main()
