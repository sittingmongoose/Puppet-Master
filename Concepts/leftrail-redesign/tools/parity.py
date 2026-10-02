#!/usr/bin/env python3
"""Fixture parity: every data-demo-action / data-demo-arg pair of the original rail panels must appear in the fixture.

Usage:
  python3 Concepts/leftrail-redesign/tools/parity.py            # report per panel, exit 1 on any missing pair
  python3 Concepts/leftrail-redesign/tools/parity.py --list     # also print every missing pair

The original panels are read from Concepts/PMConcept7.html (the published concept, never edited by this package).
The fixture is src/js/05-data-files.js, 06-data-source.js, 07-data-docker.js. A pair counts as present when its
action and its argument both appear, as JS string literals, inside one object literal line-range of the fixture file
of the same panel; in practice the check looks for the exact arg string and the exact action string in that file.
"""
from __future__ import annotations

import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
CONCEPTS = PKG.parent
PAGE = CONCEPTS / 'PMConcept7.html'
PANELS = {'panel-files': '05-data-files.js', 'panel-source': '06-data-source.js', 'panel-docker': '07-data-docker.js'}


class Pairs(HTMLParser):
    def __init__(self, panel: str):
        super().__init__(convert_charrefs=True)
        self.panel, self.depth, self.start, self.pairs, self.done = panel, 0, None, [], False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if self.start is None and not self.done and a.get('id') == self.panel:
            self.start = self.depth
        if self.start is not None and not self.done and a.get('data-demo-action'):
            self.pairs.append((a['data-demo-action'], a.get('data-demo-arg') or ''))
        if tag not in ('input', 'br', 'img', 'hr', 'meta', 'link', 'path', 'circle', 'rect', 'line', 'polyline',
                       'polygon', 'ellipse'):
            self.depth += 1

    def handle_endtag(self, tag):
        if tag in ('input', 'br', 'img', 'hr', 'meta', 'link', 'path', 'circle', 'rect', 'line', 'polyline',
                   'polygon', 'ellipse'):
            return
        self.depth -= 1
        if self.start is not None and not self.done and self.depth == self.start:
            self.done = True


def band_text() -> str:
    text = PAGE.read_text(encoding='utf-8')
    a = text.index('id="activityBar"')
    z = text.index('id="leftPanelResizer"')
    return text[a - 200:z]


def js_literals(src: str) -> set[str]:
    """Every single- or double-quoted or template string literal in a JS file, unescaped."""
    out = set()
    for m in re.finditer(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"|`((?:[^`\\]|\\.)*)`", src):
        raw = next(g for g in m.groups() if g is not None)
        try:
            out.add(json.loads('"' + raw.replace('"', '\\"').replace("\\'", "'") + '"'))
        except json.JSONDecodeError:
            out.add(raw)
    return out


def main() -> int:
    listing = '--list' in sys.argv
    band = band_text()
    bad = 0
    report = {}
    for panel, fname in PANELS.items():
        p = Pairs(panel)
        p.feed(band)
        pairs = sorted(set(p.pairs))
        fpath = PKG / 'src' / 'js' / fname
        if not fpath.exists():
            report[panel] = {'pairs': len(pairs), 'missing': len(pairs), 'fixture': 'absent'}
            bad += len(pairs)
            continue
        lits = js_literals(fpath.read_text(encoding='utf-8'))
        missing = [(act, arg) for act, arg in pairs if act not in lits or (arg and arg not in lits)]
        report[panel] = {'pairs': len(pairs), 'missing': len(missing)}
        bad += len(missing)
        if listing:
            for act, arg in missing:
                print(f'MISSING {panel}: {act} | {arg}')
    print(json.dumps(report))
    print('parity', 'ok' if not bad else f'failed ({bad} missing)')
    return 0 if not bad else 1


if __name__ == '__main__':
    sys.exit(main())
