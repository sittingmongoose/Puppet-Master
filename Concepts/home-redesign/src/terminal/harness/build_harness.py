#!/usr/bin/env python3
"""Build the terminal's standalone harness page, assembled the way CONTRACT.md section 1.1 assembles the home layer.

    python3 build_harness.py                 write src/terminal/harness/terminal-harness.html
    python3 build_harness.py --out PATH      write it somewhere else
    python3 build_harness.py --stub          also build in the harness-only stub kind (tests the host without a terminal)
    python3 build_harness.py --check         lint src/terminal/js and src/terminal/css, assemble in memory and run
                                             `node --check` on the assembled script; writes nothing, exits 1 on problems

Assembly (the same order and wrapping as the layer, with harness/mock-host.* standing in for the panels part):
  CSS  harness/mock-host.css, then src/terminal/css/*.css sorted. Every url("o55font:<file>") is inlined as a
       data:font/woff2;base64 URI looked up in src/terminal/fonts/.
  JS   harness/mock-host.js (the panels core: publishes window.PM_HOME), then the terminal: src/terminal/js/*.js
       sorted, concatenated into ONE scope wrapped as
         try { (function (PM_HOME) { 'use strict'; <files> })(window.PM_HOME); }
         catch (e) { console.error('[pm-home] terminal failed', e); }
       then the stub kind (with --stub), then harness/demos.js when it exists (it fills window.PMT_HARNESS_DEMOS for
       the toolbar's Demo menu), then the boot call. Each part fails alone and logs "[pm-home] <part> failed".

The js folder may be empty or partial (files land one at a time); the build and the check still run.
"""
from __future__ import annotations

import argparse
import base64
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HARNESS = Path(__file__).resolve().parent
TERM = HARNESS.parent                      # src/terminal
JS_DIR, CSS_DIR, FONT_DIR = TERM / 'js', TERM / 'css', TERM / 'fonts'
TEMPLATE = HARNESS / 'harness.template.html'
DEMOS = HARNESS / 'demos.js'                # optional: harness demo scripts (window.PMT_HARNESS_DEMOS)
DEFAULT_OUT = HARNESS / 'terminal-harness.html'

# The emoji ranges of Concepts/onboarding/opus-5.5/tools/build.py (EMOJI), written as escapes so this file holds none:
# the supplementary pictographs, Misc Symbols and Dingbats (U+2600-27BF), Misc Symbols and Arrows (U+2B00-2BFF) and
# the emoji presentation selector U+FE0F. Box drawing, blocks, braille and arrows outside these ranges are allowed.
EMOJI = re.compile('[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F]')
FONT_REF = re.compile(r'url\(\s*(["\']?)o55font:([A-Za-z0-9._-]+)\1\s*\)')
CSS_COMMENT = re.compile(r'/\*.*?\*/', re.S)
SIDE_BORDER = re.compile(r'border-(?:left|inline-start)(?:-width)?\s*:\s*([^;}]+)')
JS_SIDE_BORDER = re.compile(r'border(?:Left|InlineStart)(?:Width)?\s*=\s*[\'"`]([^\'"`]+)')
PX = re.compile(r'(\d+(?:\.\d+)?)px')
CSS_PILL_CLASS = re.compile(r'\.[A-Za-z0-9_-]*pill[A-Za-z0-9_-]*', re.I)
JS_PILL_CLASS = [
    re.compile(r'\b(?:pm[a-z]|o55[a-z]*)-[A-Za-z0-9_-]*pill', re.I),                    # a prefixed class token
    re.compile(r'class(?:Name)?\s*[=:]\s*[\'"`][^\'"`]*pill', re.I),                    # className = '... pill'
    re.compile(r'class=\\?["\'][^"\'>]*pill', re.I),                                     # markup in a string
    re.compile(r'classList\.(?:add|toggle|replace|contains)\([^)]*pill', re.I),
]
MEDIA = re.compile(r'@media\b([^{]*)\{', re.I)
VIEWPORT_FEATURE = re.compile(r'\b(?:min-|max-)?(?:device-)?(?:width|height|aspect-ratio)\b|\(\s*\d+(?:\.\d+)?px\s*[<>]=?\s*width|\bwidth\s*[<>]', re.I)
JS_WINDOW_SIZE = re.compile(r'\b(?:window\.)?inner(?:Width|Height)\b|matchMedia\(\s*[\'"`][^\'"`]*(?:width|height)', re.I)


class BuildError(RuntimeError):
    pass


def read(p: Path) -> str:
    return p.read_text(encoding='utf-8')


def rel(p: Path) -> str:
    try:
        return p.relative_to(TERM.parent.parent).as_posix()          # Concepts/home-redesign/...
    except ValueError:
        return str(p)


def sources(folder: Path, suffix: str) -> list[Path]:
    if not folder.is_dir():
        return []
    return sorted(p for p in folder.iterdir() if p.is_file() and p.suffix == suffix and not p.name.startswith('.'))


# ---------------------------------------------------------------------------------------------------------------------
# Assembly
# ---------------------------------------------------------------------------------------------------------------------
def inline_fonts(css: str, where: str, problems: list[str] | None = None) -> str:
    def sub(m: re.Match) -> str:
        name = m.group(2)
        f = FONT_DIR / name
        if '/' in name or '\\' in name or not f.is_file():
            msg = f'{where}: font o55font:{name} not found in {rel(FONT_DIR)}'
            if problems is None:
                raise BuildError(msg)
            problems.append(msg)
            return m.group(0)
        mime = {'.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf'}.get(f.suffix, 'font/woff2')
        return f'url("data:{mime};base64,{base64.b64encode(f.read_bytes()).decode("ascii")}")'
    return FONT_REF.sub(sub, css)


def assemble_css(problems: list[str] | None = None) -> str:
    parts = [f'/* ---- harness/mock-host.css ---- */\n{read(HARNESS / "mock-host.css")}']
    for p in sources(CSS_DIR, '.css'):
        parts.append(f'/* ---- src/terminal/css/{p.name} ---- */\n{inline_fonts(read(p), rel(p), problems)}')
    return '\n'.join(parts).replace('</style', '<\\/style')


def stub_source(template: str) -> str:
    m = re.search(r'<!-- PMX:STUB:START -->\s*<script[^>]*id="pmx-stub-src"[^>]*>(.*?)</script>\s*<!-- PMX:STUB:END -->', template, re.S)
    if not m:
        raise BuildError('harness.template.html: the PMX:STUB block is missing')
    return m.group(1)


def part(name: str, body: str, arg: str = '', param: str = '') -> str:
    return (f"/* ==== part: {name} ==== */\n"
            f"try {{ (function ({param}) {{ 'use strict';\n{body}\n}})({arg}); }} "
            f"catch (e) {{ console.error('[pm-home] {name} failed', e); }}\n")


def assemble_js(stub: bool) -> str:
    template = read(TEMPLATE)
    files = sources(JS_DIR, '.js')
    terminal = '\n'.join(f'/* ---- src/terminal/js/{p.name} ---- */\n{read(p)}' for p in files)
    if not files:
        terminal = "console.warn('[pm-home] src/terminal/js is empty; the terminal kind is not built in');"
    out = [
        part('host', read(HARNESS / 'mock-host.js')),
        part('terminal', terminal, 'window.PM_HOME', 'PM_HOME'),
    ]
    if stub:
        out.append(part('stub', stub_source(template)))
    if DEMOS.is_file():
        out.append(part('demos', read(DEMOS)))
    out.append("/* ==== boot ==== */\ntry { window.PM_HOME.boot(); } catch (e) { console.error('[pm-home] boot failed', e); }\n")
    return '\n'.join(out).replace('</script', '<\\/script')


def build_text(stub: bool) -> str:
    template = read(TEMPLATE)
    for marker in ('/*PMX:CSS*/', '/*PMX:JS*/'):
        if template.count(marker) != 1:
            raise BuildError(f'harness.template.html: expected one {marker}')
    page = re.sub(r'\s*<!-- PMX:STUB:START -->.*?<!-- PMX:STUB:END -->\s*', '\n', template, flags=re.S)
    page = page.replace('/*PMX:CSS*/', assemble_css())
    page = page.replace('/*PMX:JS*/', assemble_js(stub))
    return page


# ---------------------------------------------------------------------------------------------------------------------
# Lint (CONTRACT.md section 13 and ARCHITECTURE.md section 2), over src/terminal/js and src/terminal/css
# ---------------------------------------------------------------------------------------------------------------------
def line_of(text: str, idx: int) -> int:
    return text.count('\n', 0, idx) + 1


def lint_side_border(value: str) -> bool:
    w = PX.search(value)
    if w and float(w.group(1)) >= 2:
        return True
    return bool(re.search(r'\b(?:medium|thick)\b', value))


def lint_css(p: Path, text: str, problems: list[str]) -> None:
    where = rel(p)
    body = CSS_COMMENT.sub(lambda m: re.sub(r'[^\n]', ' ', m.group(0)), text)   # keep offsets, drop comments
    for m in SIDE_BORDER.finditer(body):
        if lint_side_border(m.group(1)):
            problems.append(f'{where}:{line_of(body, m.start())}: side border of 2 px or more: {m.group(0).strip()[:80]}')
    if ':has(' in body:
        problems.append(f'{where}:{line_of(body, body.index(":has("))}: :has( is not allowed in the layer CSS')
    for m in CSS_PILL_CLASS.finditer(re.sub(r'url\([^)]*\)', '', body)):
        problems.append(f'{where}: class name containing "pill": {m.group(0)}')
    if 'o55font:' in FONT_REF.sub('', body):
        problems.append(f'{where}: an o55font: reference that is not url("o55font:<file name>")')
    for m in MEDIA.finditer(body):
        if VIEWPORT_FEATURE.search(m.group(1)):
            problems.append(f'{where}:{line_of(body, m.start())}: viewport-width @media {m.group(1).strip()[:60]!r}; '
                            'use @container pmw-body (...)')


def lint_js(p: Path, text: str, problems: list[str], notes: list[str]) -> None:
    where = rel(p)
    for rx in JS_PILL_CLASS:
        for m in rx.finditer(text):
            problems.append(f'{where}:{line_of(text, m.start())}: class name containing "pill": {m.group(0)[:60]}')
    for m in SIDE_BORDER.finditer(text):
        if lint_side_border(m.group(1)):
            problems.append(f'{where}:{line_of(text, m.start())}: side border of 2 px or more in a style string: {m.group(0)[:60]}')
    for m in JS_SIDE_BORDER.finditer(text):
        if lint_side_border(m.group(1)):
            problems.append(f'{where}:{line_of(text, m.start())}: side border of 2 px or more: {m.group(0)[:60]}')
    for m in re.finditer(r'[\'"`][^\'"`\n]*:has\([^\'"`\n]*[\'"`]', text):
        if re.search(r'<style|insertRule|textContent|innerHTML', text[max(0, m.start() - 80):m.start()]):
            problems.append(f'{where}:{line_of(text, m.start())}: :has( in injected CSS')
    for m in JS_WINDOW_SIZE.finditer(text):
        notes.append(f'{where}:{line_of(text, m.start())}: sizes against the window ({m.group(0)}); '
                     'a tab body sizes with api.size() or @container pmw-body')


def lint_sources(extra: list[Path] | None = None) -> tuple[list[str], list[str]]:
    problems: list[str] = []
    notes: list[str] = []
    files = sources(JS_DIR, '.js') + sources(CSS_DIR, '.css') + list(extra or [])
    for p in files:
        try:
            text = read(p)
        except UnicodeDecodeError:
            problems.append(f'{rel(p)}: not UTF-8')
            continue
        for m in EMOJI.finditer(text):
            problems.append(f'{rel(p)}:{line_of(text, m.start())}: emoji character U+{ord(m.group(0)):04X} '
                            '(build it at runtime with String.fromCodePoint)')
        if p.suffix == '.css':
            lint_css(p, text, problems)
            inline_fonts(text, rel(p), problems)
        elif p.suffix == '.js':
            lint_js(p, text, problems, notes)
    return problems, notes


def node_check(script: str) -> list[str]:
    node = shutil.which('node')
    if not node:
        return ['node is not on PATH; the assembled script was not syntax-checked']
    with tempfile.TemporaryDirectory(prefix='pmt-harness-') as d:
        f = Path(d) / 'assembled.js'
        f.write_text(script.replace('<\\/script', '</script'), encoding='utf-8')
        r = subprocess.run([node, '--check', str(f)], capture_output=True, text=True)
        if r.returncode != 0:
            msg = (r.stderr or r.stdout).strip()
            m = re.search(r'assembled\.js:(\d+)', msg)
            if m:
                n = int(m.group(1))
                lines = script.split('\n')
                origin = next((lines[i] for i in range(min(n, len(lines)) - 1, -1, -1)
                               if lines[i].startswith('/* ---- ') or lines[i].startswith('/* ==== part')), '')
                msg = f'{msg}\n  (line {n} of the assembled script, inside {origin.strip()})'
            return [f'node --check failed on the assembled script:\n{msg}']
    return []


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    ap.add_argument('--out', type=Path, default=DEFAULT_OUT, help=f'output path (default {rel(DEFAULT_OUT)})')
    ap.add_argument('--check', action='store_true', help='lint and syntax-check only; write nothing')
    ap.add_argument('--stub', action='store_true', help='build in the harness-only stub kind')
    a = ap.parse_args(argv)
    try:
        if a.check:
            harness_files = [HARNESS / 'mock-host.js', HARNESS / 'mock-host.css', TEMPLATE] + ([DEMOS] if DEMOS.is_file() else [])
            problems, notes = lint_sources()
            hp, _ = lint_sources_only_emoji(harness_files)
            problems += hp
            script = assemble_js(stub=True)
            problems += node_check(script)
            problems = list(dict.fromkeys(problems))
            for n in notes:
                print('NOTE:', n, file=sys.stderr)
            js_n, css_n = len(sources(JS_DIR, '.js')), len(sources(CSS_DIR, '.css'))
            if problems:
                print(f'build_harness --check: {len(problems)} problem(s) in {js_n} js and {css_n} css files', file=sys.stderr)
                for p in problems:
                    print('  ' + p, file=sys.stderr)
                return 1
            print(f'build_harness --check: ok ({js_n} js, {css_n} css, assembled script {len(script):,} bytes)')
            return 0
        page = build_text(a.stub)
        out = a.out.resolve()
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page, encoding='utf-8')
        warn = node_check(assemble_js(a.stub))
        for w in warn:
            print('WARNING:', w, file=sys.stderr)
        print(f'wrote {out} ({len(page.encode("utf-8")):,} bytes; {len(sources(JS_DIR, ".js"))} js, '
              f'{len(sources(CSS_DIR, ".css"))} css{", stub kind" if a.stub else ""})')
        return 0
    except BuildError as e:
        print(f'build_harness: {e}', file=sys.stderr)
        return 1


def lint_sources_only_emoji(files: list[Path]) -> tuple[list[str], list[str]]:
    """The harness's own files are chrome too: they get the emoji check (and nothing that would trip on the copied
    page tokens)."""
    problems = []
    for p in files:
        text = read(p)
        for m in EMOJI.finditer(text):
            problems.append(f'{rel(p)}:{line_of(text, m.start())}: emoji character U+{ord(m.group(0)):04X}')
    return problems, []


if __name__ == '__main__':
    sys.exit(main())
