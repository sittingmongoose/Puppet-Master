#!/usr/bin/env python3
"""Build Concepts/HomeTestPMConcept7.html, the Home panels review copy: the published concept, byte for byte.

Usage (from the repository root):
  python3 Concepts/home-redesign/tools/build_home.py              # build and write Concepts/HomeTestPMConcept7.html
  python3 Concepts/home-redesign/tools/build_home.py --out PATH   # build to PATH instead (private builds, workers)
  python3 Concepts/home-redesign/tools/build_home.py --check      # rebuild in memory: lint, syntax, markers, parity

The Home layer is published: opus-5.5 build.build_text() applies tools/home_layer.py as its last step (step 5, after
Usage and the left rail), so build.py --publish-pm7 writes PMConcept7.html with the panels and the terminal. The review
copy is the same bytes as a fresh build (the Concept Hub frames it from opus-5.5-hub/); it has no header or title of its
own any more, so it can never drift from the published page. --check fails when the Home sources break the layer's
rules, a script does not parse, a HOME marker or a kept anchor is not there exactly once, the review copy differs from
a fresh build, or PMConcept7.html does (run opus-5.5 build.py --publish-pm7). Every output is generated: never
hand-edit it.
"""
from __future__ import annotations

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

TARGET = CONCEPTS / 'HomeTestPMConcept7.html'
PUBLISHED = (CONCEPTS / 'PMConcept7.html', CONCEPTS / 'Onboarding concepts' / 'TestOpus5.5PmConcept.html')


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


def report(text: str, notes: dict, target: Path) -> dict:
    data = text.encode('utf-8')
    try:
        shown = str(target.relative_to(CONCEPTS.parent))
    except ValueError:
        shown = str(target)
    return {'output': shown, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()[:16],
            'input_bytes': notes.get('bytes_in'), 'home_css_bytes': notes.get('home_css_bytes'),
            'home_js_bytes': notes.get('home_js_bytes'), 'terminal_present': notes.get('terminal_present'),
            'nier_registry_lists': notes.get('nier registry lists')}


def main() -> int:
    args = sys.argv[1:]
    known = {'--check', '--out'}
    stray = [a for i, a in enumerate(args) if a not in known and not (i > 0 and args[i - 1] == '--out')]
    if stray:
        # an unknown flag (--help included) never writes the tracked review copy
        print('usage: build_home.py [--check] [--out PATH]', file=sys.stderr)
        return 2
    check = '--check' in args
    target = TARGET
    if '--out' in args:
        i = args.index('--out')
        if i + 1 >= len(args):
            print('--out needs a path', file=sys.stderr)
            return 2
        target = Path(args[i + 1]).expanduser().resolve()
        if target in tuple(p.resolve() for p in PUBLISHED):
            print('--out must not be a published page (opus-5.5 build.py --publish-pm7 writes those)', file=sys.stderr)
            return 2
    try:
        text, notes = build_page()
    except (build.BuildError, ValueError) as exc:
        print(f'BUILD FAILED: {exc}', file=sys.stderr)
        return 2
    problems = problems_for(text)
    data = text.encode('utf-8')
    stale = [p for p in PUBLISHED if not p.exists() or p.read_bytes() != data]
    for p in stale:
        message = (f'{p.relative_to(CONCEPTS.parent)} differs from a fresh build (the Home layer is published): run '
                   f'opus-5.5 build.py --publish-pm7')
        if check:
            problems.append(message)
        else:
            print('WARNING:', message, file=sys.stderr)
    if check:
        if not target.exists():
            problems.append(f'{target.name} is missing; run build_home.py')
        elif target.read_bytes() != data:
            problems.append(f'{target.name} is stale or hand-edited (it must equal a fresh build); run build_home.py')
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
