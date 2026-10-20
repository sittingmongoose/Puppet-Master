#!/usr/bin/env python3
"""Check the published Home panels or build a private copy of Concepts/PMConcept7.html.

Usage (from the repository root):
  python3 Concepts/home-redesign/tools/build_home.py --out PATH   # write a private build (workers, screenshots)
  python3 Concepts/home-redesign/tools/build_home.py --check      # rebuild in memory: lint, syntax, markers, parity

The Home layer is published: opus-5.5 build.build_text() applies tools/home_layer.py at step 6, after Usage, the rail
and glyphs, so build.py --publish-pm7 writes PMConcept7.html with the panels and the terminal. A review
copy can be built privately with --out; the Concept Hub frames PMConcept7.html from opus-5.5-hub/.
--check fails when the Home sources break the layer's rules, a script does not parse, a HOME marker or a kept anchor
is not there exactly once, or PMConcept7.html differs from a fresh build (run opus-5.5 build.py --publish-pm7).
There is no committed Home review output. Every output is generated: never
hand-edit it.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
CONCEPTS = PKG.parent
OPUS_TOOLS = CONCEPTS / 'onboarding' / 'opus-5.5' / 'tools'
sys.path.insert(0, str(OPUS_TOOLS))
sys.path.insert(0, str(TOOLS))

import build  # noqa: E402  (opus-5.5 tools/build.py)
import home_layer  # noqa: E402

PUBLISHED = CONCEPTS / 'PMConcept7.html'


def build_page() -> tuple[str, dict]:
    text = build.build_text()
    return text, build.SETTINGS_NOTES.get('home') or {}


def problems_for(text: str) -> list[str]:
    problems = home_layer.lint() + home_layer.published_problems(text) + build.syntax_check(text)
    head = text[:text.find('</head>')] if '</head>' in text else text
    # only the page's own <head> title counts (a terminal fixture may hold an HTML file with its own <title>)
    if head.count('<title>') != 1:
        problems.append('the page head does not hold exactly one <title>')
    return problems


def report(text: str, notes: dict, target: Path | None) -> dict:
    data = text.encode('utf-8')
    try:
        shown = str(target.relative_to(CONCEPTS.parent)) if target is not None else None
    except ValueError:
        shown = str(target)
    return {'output': shown, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()[:16],
            'input_bytes': notes.get('bytes_in'), 'home_css_bytes': notes.get('home_css_bytes'),
            'home_js_bytes': notes.get('home_js_bytes'), 'terminal_present': notes.get('terminal_present'),
            'nier_registry_lists': notes.get('nier registry lists')}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='check the Home layer and published page; write nothing')
    parser.add_argument('--out', type=Path, help='private output path')
    args = parser.parse_args()
    check = args.check
    target = args.out.expanduser().resolve() if args.out is not None else None
    if target == PUBLISHED.resolve():
        parser.error('--out must not be the published page (opus-5.5 build.py publishes it)')
    if not check and target is None:
        parser.error('use --out PATH for a private build, or --check to verify without writing')
    try:
        text, notes = build_page()
    except (build.BuildError, ValueError) as exc:
        print(f'BUILD FAILED: {exc}', file=sys.stderr)
        return 2
    problems = problems_for(text)
    data = text.encode('utf-8')
    if not PUBLISHED.exists() or PUBLISHED.read_bytes() != data:
        message = (f'{PUBLISHED.relative_to(CONCEPTS.parent)} differs from a fresh build (the Home layer is published): run '
                   f'opus-5.5 build.py --publish-pm7')
        if check:
            problems.append(message)
        else:
            print('WARNING:', message, file=sys.stderr)
    if check:
        for p in problems:
            print('CHECK:', p)
        print(json.dumps(report(text, notes, target)))
        print('check', 'ok' if not problems else f'failed ({len(problems)})')
        return 0 if not problems else 1
    if problems:
        for p in problems:
            print('LINT:', p)
        return 1
    target.parent.mkdir(parents=True, exist_ok=True)
    tmp = target.with_name(target.name + '.tmp')
    tmp.write_bytes(data)
    tmp.replace(target)
    print(json.dumps(report(text, notes, target)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
