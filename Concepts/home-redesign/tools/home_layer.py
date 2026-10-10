#!/usr/bin/env python3
"""Home layer: add the universal panel system (src/panels) and the terminal tab kind (src/terminal) to the built page.

  text, notes = home_layer.apply(text, need)   # text = opus-5.5 build.build_text() (or after the Usage/rail layers)
  problems = home_layer.lint()                 # source rules for ../src
  problems = home_layer.syntax_check(text)     # node --check of <script id="pm-home-js">

The layer follows the Usage and left-rail layer pattern (Concepts/usage-redesign, Concepts/leftrail-redesign): it never
edits the page's own markup. apply() only adds:
  1. <style id="pm-home-css"> just before </head>: src/panels/css/*.css then src/terminal/css/*.css, with
     url("o55font:<file>") refs inlined from src/terminal/fonts or src/panels/fonts.
  2. <script id="pm-home-js"> just before </body>: the panels core (src/panels/js/*.js in one strict scope that
     publishes window.PM_HOME and window.PMW), then the terminal (src/terminal/js/*.js in a scope of its own, given
     PM_HOME), then PM_HOME.boot(). Each part is guarded, so one failing part leaves the others running.
  2b. <script id="pm-home-early"> in <head> (src/panels/early/*.js): the PM_HOME_WORKSPACE shim, so the old Home
     controller's own guard skips it, and html[data-pmw-home="on"] (?home=current keeps today's Home for an A/B).
     One guarded app JS patch (APP_PATCHES: homeActive) lets the chat stay one column on every page.
     Every face in src/terminal/fonts/ is inlined as given and never mirrored into PM Symbols (terminals need their
     own box-drawing glyphs); no list of families is kept here.
  3. The panels' NieR hook classes (.pmw-cur, .pmw-chosen, .pmw-strip) in the Settings script's NieR selector lists, on
     anchors the Usage and rail layers do not use, so the three layers compose in either order.
At run time the panels replace the Home centre (CONTRACT.md); the old Home model stays loaded for the pages and tour
code that still call it, behind compatibility shims. Every step is guarded: each anchor must be found exactly once and
the layer markers must not be in the input already. The terminal thread owns src/terminal/**; this file is the panels
thread's.
"""
from __future__ import annotations

import base64
import re
import subprocess
import sys
import tempfile
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
SRC = PKG / 'src'
PANELS = SRC / 'panels'
TERMINAL = SRC / 'terminal'
CONCEPTS = PKG.parent
OPUS_TOOLS = CONCEPTS / 'onboarding' / 'opus-5.5' / 'tools'

CSS_START, CSS_END = '<!-- HOME:CSS:START -->', '<!-- HOME:CSS:END -->'
JS_START, JS_END = '<!-- HOME:BODY:START -->', '<!-- HOME:BODY:END -->'
HEAD_ANCHOR = '\n</head>'
BODY_ANCHOR = '\n</body>'

# The page parts the panels take over or call. Each must exist exactly once in the input.
REQUIRED = ['id="pm-home-workspace"', 'id="panel-dashboard"', 'id="chatPanel"', 'id="bottomPanel"',
            'class="center-column"', 'id="leftPanelResizer"', 'id="sidePanelSlot"',
            "    failNextPersistenceWrite: function () { faults.failNextWrite = true; },",
            # the old controller's own guard: the early shim makes it return (no second Home model)
            '  "use strict";\n  if (window.PM_HOME_WORKSPACE) return;\n',
            '<div class="page page-dashboard active" id="panel-dashboard">',
            '<div class="resizer-col hidden" id="chatResizer"></div>\n<aside class="chat-panel hidden" id="chatPanel" data-pm6-chat-mount="docked">',
            'window.registerResizer(chatResizer, {',
            "setupResizer('leftPanelResizer', 'sidePanelSlot', 'editorView');",
            'window.PM_PAGES = {',
            "id: 'workspace_orientation'", "id: 'move_or_dock_chat'", "id: 'widget_action'"]

# Present at least once (the chat column CSS must outrank this rule; it occurs in two media variants).
PRESENT = ['body.pm7-chat-global-owner #chatPanel.pm7-global-chat-panel{']

# App JS patches (guarded, exactly once, like the Usage layer's APP_PATCHES). With the home layer on, the chat is one
# column on every page: pm7-t23's seatChatForPage treats Home like any other page (no inline flex !important).
APP_PATCHES = [
    ("  function homeActive() { return activePage() === 'dashboard'; }",
     "  function homeActive() { return activePage() === 'dashboard' && document.documentElement.getAttribute('data-pmw-home') !== 'on'; }"
     " /* home layer: the chat is one column on every page */",
     'homeActive (home layer)'),
]

# NieR Mode selector lists in the Settings script (opus-5.5 src/settings/kit.d/19-nier-parts.js). Filled from the
# looks digest: anchors distinct from the Usage layer's and the rail layer's.
NIER_SELECTOR_PATCHES: list[tuple[str, str, str]] = [
    ("'.palette-item', '.search-result-item', '.slash-cmd-item',",
     "'.palette-item', '.search-result-item', '.slash-cmd-item', '.pmw-cur:not(.active):not([aria-disabled=\"true\"])',",
     'nier cursor list (home)'),
    (".resource-row';", ".resource-row, .pmw-chosen';", 'nier chosen list (home)'),
    ('.workspace-tab, .manager-tab, .orch-tab, .pm-segtab-item, .pm6-tt-mode',
     '.workspace-tab, .manager-tab, .orch-tab, .pm-segtab-item, .pmw-strip, .pm6-tt-mode',
     'nier strip list (home)'),
]

FONT_URL = re.compile(r'url\("o55font:([^"]+)"\)')
FONT_DIRS = [TERMINAL / 'fonts', PANELS / 'fonts']
BINARY_SUFFIXES = {'.woff2', '.woff', '.ttf', '.otf', '.png', '.jpg', '.jpeg', '.gif', '.webp'}
SKIP_DIRS = {'harness'}


def replace_once(need, text: str, old: str, new: str, label: str) -> str:
    n = text.count(old)
    need(n == 1, f'home layer: anchor for {label} found {n} times (need exactly 1)')
    return text.replace(old, new, 1)


def read_parts(folder: Path, suffix: str) -> str:
    if not folder.is_dir():
        return ''
    out = []
    for p in sorted(folder.glob('*' + suffix)):
        out.append(f'/* ---- {p.relative_to(SRC).as_posix()} ---- */\n' + p.read_text(encoding='utf-8').rstrip() + '\n')
    return ''.join(out)


def inline_fonts(css: str) -> str:
    def data_uri(m: re.Match) -> str:
        name = m.group(1)
        for d in FONT_DIRS:
            path = d / name
            if path.is_file():
                mime = 'font/woff2' if name.endswith('.woff2') else 'font/ttf' if name.endswith('.ttf') else 'font/otf'
                return ('url("data:' + mime + ';base64,'
                        + base64.b64encode(path.read_bytes()).decode('ascii').replace('/', '%2F') + '")')
        raise ValueError(f'home layer: embedded font {name!r} is not in src/terminal/fonts or src/panels/fonts')
    return FONT_URL.sub(data_uri, css)


def build_css() -> str:
    return inline_fonts(read_parts(PANELS / 'css', '.css') + read_parts(TERMINAL / 'css', '.css'))


def guard(part: str, body: str) -> str:
    return (f"try {{\n{body}}} catch (error) {{ try {{ console.error('[pm-home] {part} failed', error); }} catch (_) {{}} }}\n")


def build_script() -> str:
    core = read_parts(PANELS / 'js', '.js')
    term = read_parts(TERMINAL / 'js', '.js')
    parts = [guard('panels core', "(function () {\n'use strict';\n" + core + "})();\n")]
    # each panels kind in a scope of its own: it sees only the public PM_HOME and the engine's PMW
    kind_dir = PANELS / 'kinds'
    for kp in sorted(kind_dir.glob('*.js')) if kind_dir.is_dir() else []:
        body = f'/* ---- {kp.relative_to(SRC).as_posix()} ---- */\n' + kp.read_text(encoding='utf-8').rstrip() + '\n'
        parts.append(guard(f'kind {kp.stem}', "(function (PM_HOME, PMW) {\n'use strict';\nif (!PM_HOME || !PMW) return;\n"
                           + body + "})(window.PM_HOME, window.PMW);\n"))
    if term.strip():
        parts.append(guard('terminal', "(function (PM_HOME) {\n'use strict';\nif (!PM_HOME) return;\n"
                           + term + "})(window.PM_HOME);\n"))
    parts.append("try { if (window.PM_HOME && typeof window.PM_HOME.boot === 'function') window.PM_HOME.boot(); }"
                 " catch (error) { try { console.error('[pm-home] boot failed', error); } catch (_) {} }\n")
    return ''.join(parts)


def js_safe(js: str) -> str:
    """Make JS safe to inline in a <script>: '</script' and '<!--' would end or confuse the element (a terminal fixture
    holds an HTML file with a literal </script>). '<\\/' and '<\\!' mean the same characters inside JS strings,
    template literals and regular expressions."""
    js = re.sub(r'</(script)', r'<\\/\1', js, flags=re.I)
    return js.replace('<!--', '<\\!--')


def build_early() -> str:
    """<script id="pm-home-early"> in <head>: src/panels/early/*.js. It runs before the old Home controller parses, sets
    html[data-pmw-home="on"] and defines the PM_HOME_WORKSPACE compatibility shim, so the controller's own guard
    ('if (window.PM_HOME_WORKSPACE) return;') skips it. ?home=current leaves today's Home running (review A/B)."""
    body = read_parts(PANELS / 'early', '.js')
    return "try {\n(function () {\n'use strict';\n" + body + "})();\n} catch (error) { try { console.error('[pm-home] early failed', error); } catch (_) {} }\n"


def apply(text: str, need) -> tuple[str, dict]:
    notes: dict = {'bytes_in': len(text.encode('utf-8'))}
    for marker in (CSS_START, CSS_END, JS_START, JS_END, 'id="pm-home-css"', 'id="pm-home-js"', 'id="pm-home-early"',
                   'id="pm-home-centre"', 'data-pmw-home'):
        need(marker not in text, f'home layer: {marker} already in the input (layer applied twice?)')
    for needle in REQUIRED:
        n = text.count(needle)
        need(n == 1, f'home layer: {needle!r} found {n} times in the page (need exactly 1)')
    for needle in PRESENT:
        need(needle in text, f'home layer: {needle!r} is not in the page')
    css = build_css()
    script = build_script()
    for name, chunk in (('src css', css), ('src js', script)):
        for marker in (CSS_START, CSS_END, JS_START, JS_END, '<!-- O55:CSS:START -->', '<!-- O55:CSS:END -->',
                       '<!-- O55:BODY:START -->', '<!-- O55:BODY:END -->'):
            need(marker not in chunk, f'home layer: {name} contains the build marker {marker}')
    need(not re.search(r'</style', css, re.I), 'home layer: src css contains "</style"')
    script = js_safe(script)
    early = js_safe(build_early())
    need('<!-- O55:CSS:END -->' in text and text.index('<!-- O55:CSS:END -->') < text.index(HEAD_ANCHOR),
         'home layer: the O55 head block must precede </head> (the home layer runs after Usage and the rail)')
    if '<!-- RAIL:CSS:END -->' in text:
        need(text.index('<!-- RAIL:CSS:END -->') < text.index(HEAD_ANCHOR), 'home layer: the rail head block must precede </head>')
    for old_js, new_js, label in APP_PATCHES:
        text = replace_once(need, text, old_js, new_js, label)
    text = replace_once(need, text, HEAD_ANCHOR,
                        '\n' + CSS_START + f'\n<script id="pm-home-early">\n{early}</script>\n<style id="pm-home-css">\n{css}</style>\n'
                        + CSS_END + '\n</head>', 'head end')
    text = replace_once(need, text, BODY_ANCHOR,
                        '\n' + JS_START + f'\n<script id="pm-home-js">\n{script}</script>\n' + JS_END + '\n</body>',
                        'body end')
    for old, new, label in NIER_SELECTOR_PATCHES:
        text = replace_once(need, text, old, new, label)
    notes['nier selector patches'] = [label for _, _, label in NIER_SELECTOR_PATCHES]
    notes['home_css_bytes'] = len(css.encode('utf-8'))
    notes['home_js_bytes'] = len(script.encode('utf-8'))
    notes['terminal_present'] = (TERMINAL / 'js').is_dir() and any((TERMINAL / 'js').glob('*.js'))
    notes['bytes_out'] = len(text.encode('utf-8'))
    return text, notes


# ---------------------------------------------------------------------------------------------------------------------
# lint and syntax check

def _opus_build():
    main = sys.modules.get('__main__')
    if main is not None and hasattr(main, 'EMOJI') and hasattr(main, 'build_text'):
        return main
    if str(OPUS_TOOLS) not in sys.path:
        sys.path.insert(0, str(OPUS_TOOLS))
    import build  # noqa: E402
    return build


TOP_FUNCTION = re.compile(r'^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(')
TOP_BINDING = re.compile(r'^(?:var|let|const)\s+([A-Za-z_$][\w$]*)')
CSS_CLASS = re.compile(r'\.(-?[A-Za-z_][\w-]*)')
PILL_MARKUP = [
    re.compile(r'\bclass(?:Name)?\s*[=:]\s*\\?["\'`]([^"\'`\\]*)'),
    re.compile(r'classList\.(?:add|remove|toggle|contains|replace)\(([^)]*)\)'),
]
JS_STRING = re.compile(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"")
VIEWPORT_WIDTH_MEDIA = re.compile(r'@media[^{]*\((?:min|max)-width', re.I)
OWN_PREFIX = {PANELS: ('pmw-',), TERMINAL: ('pmt-',)}
# the terminal's simulated machine: strings here are program output and file contents, never PM chrome
PROGRAM_OUTPUT_FILES = {'60-vfs.js', '64-programs.js', '66-assets.js'}
PROGRAM_OUTPUT_MARK = '/* program output */'


def blank_comments(code: str) -> str:
    return re.sub(r'/\*[\s\S]*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group()), code)


def lint() -> list[str]:
    build = _opus_build()
    problems: list[str] = []
    scopes: dict[str, dict[str, list[str]]] = {}
    for p in sorted(SRC.rglob('*')):
        if not p.is_file() or p.suffix in BINARY_SUFFIXES:
            continue
        rel_parts = p.relative_to(SRC).parts
        if SKIP_DIRS.intersection(rel_parts) or p.suffix in ('.md', '.txt'):
            continue
        rel = p.relative_to(PKG).as_posix()
        text = p.read_text(encoding='utf-8')
        if build.EMOJI.search(text):
            problems.append(f'emoji glyph in {rel}')
        if p.suffix == '.css':
            code = blank_comments(text)
            if ':has(' in code:
                problems.append(f':has() in {rel} (the home layer uses no :has())')
            for m in re.finditer(r'border-(?:left|inline-start)(?:-width)?\s*:\s*([^;}]+)', code):
                width = re.search(r'(\d+(?:\.\d+)?)px', m.group(1))
                if width and float(width.group(1)) >= 2:
                    problems.append(f'coloured side border in {rel}: {m.group(0).strip()}')
            for m in re.finditer(r'box-shadow\s*:\s*inset\s+(-?\d+(?:\.\d+)?)px\s+0', code):
                if abs(float(m.group(1))) >= 2:
                    problems.append(f'inset side bar in {rel}: {m.group(0).strip()}')
            for sel in re.findall(r'([^{}]+)\{', code):
                for cls in CSS_CLASS.findall(sel):
                    if 'pill' in cls.lower():
                        problems.append(f'pill class name in {rel}: .{cls}')
            if VIEWPORT_WIDTH_MEDIA.search(code):
                problems.append(f'viewport width @media in {rel} (size against the panel: @container pmw-body)')
            for m in re.finditer(r'border-radius\s*:\s*(9{3,}|[5-9]\d{2,})px', code):
                problems.append(f'capsule radius in {rel}: {m.group(0)} (no pills)')
        if p.suffix == '.js':
            code = blank_comments(text)
            for rx in PILL_MARKUP:
                for m in rx.finditer(code):
                    names = re.findall(r'(?<![\w-])[\w-]*pill[\w-]*', m.group(1), re.I)
                    if names:
                        problems.append(f'pill class name in {rel}: {m.group(0)[:80]}')
            if re.search(r'\binnerWidth\b|\binnerHeight\b', code) and 'panels/js/44-narrow' not in rel:
                problems.append(f'{rel} reads the window size (size against the panel instead)')
            # banned copy words apply to PM's own copy; the terminal's simulated machine (file contents and program
            # output, which must read like the real programs) is exempt: whole files in PROGRAM_OUTPUT_FILES, and any
            # line that carries the comment /* program output */
            if p.name not in PROGRAM_OUTPUT_FILES or TERMINAL not in p.parents:
                raw_lines = text.split('\n')
                for m in JS_STRING.finditer(code):
                    s = m.group(0)[1:-1]
                    line_no = code.count('\n', 0, m.start())
                    if PROGRAM_OUTPUT_MARK in (raw_lines[line_no] if line_no < len(raw_lines) else ''):
                        continue
                    if ' ' in s and re.search(r'[A-Za-z]{3}', s) and build.BANNED_COPY.search(s):
                        problems.append(f'banned copy word in {rel}: {s[:70]}')
            scope = 'panels' if PANELS in p.parents and p.parent.name == 'js' else (
                'terminal' if TERMINAL in p.parents and p.parent.name == 'js' else (
                    'kind ' + p.stem if PANELS in p.parents and p.parent.name == 'kinds' else None))
            if scope:
                tops = scopes.setdefault(scope, {})
                depth = 0
                for n, line in enumerate(code.split('\n'), 1):
                    if depth == 0:
                        m = TOP_FUNCTION.match(line) or TOP_BINDING.match(line)
                        if m:
                            tops.setdefault(m.group(1), []).append(f'{p.name}:{n}')
                    stripped = JS_STRING.sub("''", re.sub(r'//.*$', '', line))
                    depth += stripped.count('{') - stripped.count('}')
                    depth = max(depth, 0)
    for scope, tops in sorted(scopes.items()):
        for name, where in sorted(tops.items()):
            if len(where) > 1:
                problems.append(f'top-level name {name!r} declared more than once in the {scope} scope: {", ".join(where)}')
    return problems


def syntax_check(built: str) -> list[str]:
    out = []
    for sid in ('pm-home-early', 'pm-home-js'):
        found = re.findall(r'<script\b[^>]*\bid="' + sid + r'"[^>]*>(.*?)</script>', built, re.S)
        if len(found) != 1:
            out.append(f'script {sid} found {len(found)} times (need exactly 1)')
            continue
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as fh:
            fh.write(found[0])
            path = fh.name
        try:
            r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
        finally:
            Path(path).unlink(missing_ok=True)
        if r.returncode:
            out.append(f'syntax error in {sid}: ' + ' | '.join(r.stderr.strip().splitlines()[-4:])[:600])
    return out
