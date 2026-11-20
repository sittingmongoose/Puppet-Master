#!/usr/bin/env python3
"""Fail on a CSS comment that ends early: a `*/` the browser never reads as a comment close.

A CSS comment ends at its FIRST `*/`. A comment that writes a glob or a path such as
`(width/height/min-*/ overflow)` therefore closes at `min-*/`, and the rest of its words become a
selector prelude. The rule after them is dropped whole, with no console error, no invalid rule in
the CSSOM and nothing in the page to see: FO-166 (2026-11-12) found PM6's `.pm-home-surface` rule
(base/style/pm6-css-dashboard.css) missing that way, so every Home surface lost its 360 px basis,
border, radius, surface background and `isolation`, and every look Jared had seen rendered without it.

This scans text the way a browser tokenizes CSS (comments and strings consumed, `\\` escapes kept)
and reports every `*/` left in the code, which can only be a comment that ended early. It also
reports a comment that never closes.

  python3 tools/css_comment_lint.py --check                       # base/style, src, the published page
  python3 tools/css_comment_lint.py Concepts/PMConcept7.html      # named files and directories
  python3 tools/css_comment_lint.py --selftest                    # the detector on a bad and a good snippet
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
CONCEPTS = PKG.parents[1]
PAGE = CONCEPTS / 'PMConcept7.html'

STYLE_BLOCK = re.compile(r'<style\b[^>]*>(.*?)</style>', re.S | re.I)
SCRIPT_BLOCK = re.compile(r'<script\b[^>]*>.*?</script>', re.S | re.I)


def _line_of(text: str, pos: int) -> int:
    return text.count('\n', 0, pos) + 1


def stray_comment_ends(text: str) -> list[tuple[int, int, str]]:
    """(line of the stray `*/`, line the last comment closed on, the line's text) for every `*/` the
    browser reads as code, plus an unclosed comment reported at its own line with close line 0."""
    found: list[tuple[int, int, str]] = []
    i, n = 0, len(text)
    close_line = 0
    while i < n:
        c = text[i]
        if c == '/' and text.startswith('/*', i):
            j = text.find('*/', i + 2)
            if j < 0:
                found.append((_line_of(text, i), 0, _line(text, i)))
                return found
            close_line = _line_of(text, j)
            i = j + 2
            continue
        if c in '"\'':
            # A quote only opens a string where CSS allows one to begin. An apostrophe inside a word is prose left in
            # the code stream by a comment that ended early (`the dashboard's scroller`), and treating it as a string
            # opener would swallow the stray `*/` that is the whole finding.
            prev = text[i - 1] if i else ''
            if prev.isalnum() or prev in '-_':
                i += 1
                continue
            j = i + 1
            while j < n:
                if text[j] == '\\':
                    j += 2
                    continue
                if text[j] == c or text[j] == '\n':
                    j += 1
                    break
                j += 1
            i = j
            continue
        if c == '\\':
            i += 2
            continue
        if c == '*' and text.startswith('*/', i):
            found.append((_line_of(text, i), close_line, _line(text, i)))
            i += 2
            continue
        i += 1
    return found


def _line(text: str, pos: int) -> str:
    start = text.rfind('\n', 0, pos) + 1
    end = text.find('\n', pos)
    return text[start:end if end >= 0 else len(text)].strip()[:160]


def problems(text: str, name: str, first_line: int = 1) -> list[str]:
    """The lint's messages for one CSS text, its line numbers shifted by `first_line - 1`."""
    out = []
    for line, close_line, line_text in stray_comment_ends(text):
        at = line + first_line - 1
        if close_line == 0:
            out.append(f'{name}:{at}: CSS comment never closes: {line_text}')
            continue
        closed = close_line + first_line - 1
        out.append(f'{name}:{closed}: CSS comment ends early (stray */ at line {at}), so the text between them is '
                   f'read as a selector and the rule after it is dropped: {line_text}')
    return out


def page_problems(html: str, name: str = 'page') -> list[str]:
    """The lint's messages for every `<style>` body in an HTML page, at the page's own line numbers.
    Script bodies are blanked first, newlines kept: a JS regex or string such as `/\\/\\*/` is not CSS."""
    blanked = SCRIPT_BLOCK.sub(lambda m: re.sub(r'[^\n]', ' ', m.group(0)), html)
    out = []
    for match in STYLE_BLOCK.finditer(blanked):
        out.extend(problems(match.group(1), name, _line_of(blanked, match.start(1))))
    return out


def tree_problems(paths: list[Path]) -> list[str]:
    out = []
    for path in paths:
        files = [path] if path.is_file() else sorted(
            p for p in path.rglob('*') if p.is_file() and p.suffix.lower() in ('.css', '.html'))
        for f in files:
            rel = f.relative_to(CONCEPTS.parent) if f.is_relative_to(CONCEPTS.parent) else f
            text = f.read_text(encoding='utf-8', errors='replace')
            out.extend(page_problems(text, str(rel)) if f.suffix.lower() == '.html' else problems(text, str(rel)))
    return out


def default_paths() -> list[Path]:
    """What a build lints: the shell's stylesheets, the O55 layers, and the published page."""
    return [PKG / 'base' / 'style', PKG / 'src', PAGE]


SELFTEST_BAD = '.a { color: red; }\n/* the wall (width/height/min-*/\n   overflow) is what broke it. */\n.b { color: blue; }\n'
SELFTEST_GOOD = '.a { color: red; }\n/* the wall (width/height/min-* and\n   overflow) is what broke it. */\n.b { color: blue; }\n'


def selftest() -> int:
    bad, good = problems(SELFTEST_BAD, 'bad'), problems(SELFTEST_GOOD, 'good')
    ok = len(bad) == 1 and ':2:' in bad[0] and 'stray */ at line 3' in bad[0] and not good
    print('selftest', 'ok' if ok else 'FAILED', bad, good)
    return 0 if ok else 1


def main(argv: list[str]) -> int:
    if '--selftest' in argv:
        return selftest()
    paths = [Path(a).expanduser().resolve() for a in argv if not a.startswith('--')]
    if '--check' in argv or not paths:
        paths = default_paths()
    missing = [p for p in paths if not p.exists()]
    if missing:
        print('missing: ' + ', '.join(str(p) for p in missing), file=sys.stderr)
        return 2
    found = tree_problems(paths)
    for line in found:
        print('CSS COMMENT:', line)
    print('css comment lint', 'ok' if not found else f'failed ({len(found)})')
    return 0 if not found else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
