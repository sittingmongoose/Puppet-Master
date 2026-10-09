#!/usr/bin/env python3
"""Generate concept D's stylesheet: src/concepts/d/css/*.src.css (with selector macros) -> src/concepts/d/d.css.

  python3 Concepts/leftrail-redesign/tools/build_d_css.py          # write d.css
  python3 Concepts/leftrail-redesign/tools/build_d_css.py --check  # exit 1 when d.css is not the expansion of the sources

Edit the .src.css files, never d.css. The Look settings scaler (o55PaintScales: text size, animation speed) only
rescales flat top-level rules, so the skin cannot use CSS nesting; the macros keep its long scoping selectors short.
Macros (followed by a space or a selector character):
  §R   [data-rail-skin="d"]                                            the skin root (html)
  §    [data-rail-skin="d"] :is(<every rail panel in PANELS>)            the shared rules of all nine panels
  §F / §S / §K   [data-rail-skin="d"] #panel-files / #panel-source / #panel-docker
  §B   [data-rail-skin="d"] #activityBar
  §@name   [data-rail-skin="d"] #panel-name   (search, run, git, artifacts, testing, agents, or any panel id suffix)
  §@#id    [data-rail-skin="d"] #id           (any other element of the rail band: bottomDebugHost, the More tray ...)
  §{fam,...}X  the same with theme guards on the root: basic friendly glass retro light dark nier notnier
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

PKG = Path(__file__).resolve().parent.parent
SRC = PKG / 'src' / 'concepts' / 'd' / 'css'
OUT = PKG / 'src' / 'concepts' / 'd' / 'd.css'
ROOT = '[data-rail-skin="d"]'
# the nine rail panels (activity bar order); keep in step with PANEL_IDS in src/concepts/d/00-d.js
PANEL_IDS = ('files', 'search', 'source', 'git', 'docker', 'testing', 'run', 'agents', 'artifacts')
PANELS = ':is(' + ','.join('#panel-' + p for p in PANEL_IDS) + ')'
FAM = {
    'basic': '[data-theme^="basic"]', 'friendly': '[data-theme^="friendly"]', 'glass': '[data-theme^="glass"]',
    'retro': '[data-theme^="retro"]', 'light': '[data-theme$="-light"]', 'dark': '[data-theme$="-dark"]',
    'nier': '[data-o55-nier="on"]', 'notnier': ':not([data-o55-nier="on"])',
}
TAIL = {'': ' ' + PANELS, 'R': '', 'F': ' #panel-files', 'S': ' #panel-source', 'K': ' #panel-docker', 'B': ' #activityBar'}
HEAD = ('/* Concept D (Polish): today\'s rail, polished. GENERATED from src/concepts/d/css/*.src.css by\n'
        '   tools/build_d_css.py: edit the sources, never this file. Every rule is scoped to html[data-rail-skin="d"] and\n'
        '   to the three panels it restyles (#panel-files, #panel-source, #panel-docker) plus the activity bar. Written flat\n'
        '   on purpose: the Look settings scaler (text size, animation speed) only rescales top-level rules. */\n')


def expand(text: str) -> str:
    def rep(m):
        guard = ''.join(FAM[f.strip()] for f in (m.group(1) or '{}')[1:-1].split(',') if f.strip())
        if m.group(3):
            name = m.group(3)
            return ROOT + guard + ' ' + (name if name.startswith('#') else '#panel-' + name)
        return ROOT + guard + TAIL[m.group(2) or '']
    return re.sub(r'§(\{[a-z,]+\})?(?:([RFSKB])|@(#?[A-Za-z][\w-]*))?(?![A-Za-z@])', rep, text)


def generate() -> str:
    parts = [expand(p.read_text(encoding='utf-8')).rstrip() + '\n' for p in sorted(SRC.glob('*.src.css'))]
    out = HEAD + '\n'.join(parts)
    if '§' in out:
        raise SystemExit('build_d_css: a macro did not expand')
    return out


def stale() -> bool:
    return not SRC.is_dir() or not OUT.exists() or OUT.read_text(encoding='utf-8') != generate()


def main() -> int:
    if '--check' in sys.argv[1:]:
        if stale():
            print('build_d_css: d.css is not the expansion of src/concepts/d/css (run tools/build_d_css.py)')
            return 1
        print('build_d_css: check ok')
        return 0
    OUT.write_text(generate(), encoding='utf-8')
    print(f'build_d_css: wrote {OUT.relative_to(PKG)} ({OUT.stat().st_size} bytes)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
