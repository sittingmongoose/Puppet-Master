#!/usr/bin/env python3
"""Home layer: add the universal panel system (src/panels) and the terminal tab kind (src/terminal) to the built page.

  text, notes = home_layer.apply(text, need)       # step 6 of opus-5.5 build.build_text(), after Usage, rail and glyphs
  problems = home_layer.lint()                     # source rules for ../src (in build.py's lint_sources())
  problems = home_layer.syntax_check(text)         # node --check of <script id="pm-home-early"> and "pm-home-js"
  problems = home_layer.published_problems(text)   # build.py and --check: syntax, markers, the anchors kept exactly once

opus-5.5 build.py publishes this layer (build.py --publish-pm7 writes PMConcept7.html with it); build_home.py writes
the review copy, the same bytes.

The layer follows the Usage and left-rail layer pattern (Concepts/usage-redesign, Concepts/leftrail-redesign): it never
edits the page's own markup. apply() only adds:
  1. <style id="pm-home-css"> just before </head>: src/panels/css/*.css then src/terminal/css/*.css, with
     url("o55font:<file>") refs inlined from src/panels/fonts (none today: the terminal's faces and JetBrains Mono are
     the page's own, embedded by the opus-5.5 build from its src/fonts, DL-161).
  2. <script id="pm-home-js"> just before </body>: the panels core (src/panels/js/*.js in one strict scope that
     publishes window.PM_HOME and window.PMW), then the terminal (src/terminal/js/*.js in a scope of its own, given
     PM_HOME), then PM_HOME.boot(). Each part is guarded, so one failing part leaves the others running.
  2b. <script id="pm-home-early"> in <head> (src/panels/early/*.js): the PM_HOME_WORKSPACE compatibility shim and
     html[data-pmw-home="on"]. The retired Home controller is no longer assembled.
     Guarded app JS patches (APP_PATCHES): homeActive lets the chat stay one column on every page; the status bar's
     host item and NieR's readout of it; the left rail's Dashboard (HOME) toggle is removed.
  3. NIER_ENTRIES contributes the panels' NieR hook classes (.pmw-cur, .pmw-chosen, .pmw-strip) to the shared registry
     (opus-5.5 src/settings/kit.d/nier_registry.py). build.py emits the lists after all layers; edit data, not anchors.
At run time the panels replace the Home centre (CONTRACT.md); compatibility shims route the pages and tour code's
remaining workspace calls to the panels. Every step is guarded: each anchor must be found exactly once and
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

# The legacy Home stylesheet changes the cursor on every descendant of body. The panel gesture already captures the
# pointer; its capture element owns the cursor, and selectstart prevents selection. The legacy stylesheet remains;
# the early shim removes just these CSSOM rules for panels. An ancestor guard still invalidates the
# whole document when the body class changes, even when that guard does not match.
LEGACY_GESTURE_CSS = '''body.pm-home-dragging,
body.pm-home-dragging * { cursor: grabbing !important; }
body.pm-home-dragging { -webkit-user-select: none; user-select: none; }'''

# The page parts the panels take over or call. Each must exist exactly once in the input.
REQUIRED = ['id="pm-home-workspace"', 'id="panel-dashboard"', 'id="chatPanel"', 'id="bottomPanel"',
            'class="center-column"', 'id="leftPanelResizer"', 'id="sidePanelSlot"',
            '<div class="page page-dashboard active" id="panel-dashboard">',
            '<div class="resizer-col hidden" id="chatResizer"></div>\n<aside class="chat-panel hidden" id="chatPanel" data-pm6-chat-mount="docked">',
            'window.registerResizer(chatResizer, {',
            "setupResizer('leftPanelResizer', 'sidePanelSlot', 'editorView');",
            'window.PM_PAGES = {',
            # the Guided Tour's workspace steps (opus-5.5 83-tour-steps.js), which call the panels' tour hooks (52-tour.js)
            "id: 'workspace_orientation'", "id: 'open_from_plus'", "id: 'open_file_from_rail'", "id: 'split_by_drag'",
            "id: 'widget_action'"]
REQUIRED.append(LEGACY_GESTURE_CSS)

# Present at least once (the chat column CSS must outrank this rule; it occurs in two media variants).
PRESENT = ['body.pm7-chat-global-owner #chatPanel.pm7-global-chat-panel{']

# App JS patches (guarded, exactly once, like the Usage layer's APP_PATCHES). With the home layer on, the chat is one
# column on every page: pm7-t23's seatChatForPage treats Home like any other page (no inline flex !important).
APP_PATCHES = [
    # Same matched composer elements, specificity and declarations. The old inline-style attribute selector
    # invalidated unrelated SVG gradient stops after sibling mutations, even when Glass was not active.
    ('[data-theme^="glass"] .chat-input-area > div:first-of-type div[style*="gap:var(--md)"]',
     '[data-theme^="glass"] .chat-input-area > div:first-of-type div.pm7-chat-toggle-group',
     'composer toggle class selector'),
    ('<div style="display:flex; gap:var(--md); align-items:center; margin-left:var(--sm); font-size:10px;">',
     '<div class="pm7-chat-toggle-group" style="display:flex; gap:var(--md); align-items:center; margin-left:var(--sm); font-size:10px;">',
     'composer toggle class anchor'),
    # The published generator starts from the pinned pre-Home page, not build_pm7.py. Mirror the small hidden
    # description grouping change in pm7-tools/global_hover_tags_source.py through these exactly-once anchors.
    ('.pm-hover-sr > .pm-hover-description {',
     '/* These owners are already clipped 1px boxes. Keep their layout work inside those boxes without hiding their\n   accessible description nodes or changing the visible tooltip. */\n.pm-hover-sr, .pm-hover-bucket { contain: strict !important; }\n.pm-hover-sr > .pm-hover-bucket,\n.pm-hover-sr .pm-hover-description {',
     'hidden description group styles'),
    ('    this.root=null;this.tag=null;this.descriptions=null;this.active=null;this.activeModel=null;',
     '    this.root=null;this.tag=null;this.descriptions=null;this.descriptionBuckets=[];this.active=null;this.activeModel=null;',
     'hidden description group storage'),
    ("    this.root=root;this.tag=root.querySelector('#'+TAG_ID);this.descriptions=root.querySelector('#'+DESCRIPTIONS_ID);\n",
     "    this.root=root;this.tag=root.querySelector('#'+TAG_ID);this.descriptions=root.querySelector('#'+DESCRIPTIONS_ID);\n    /* Fixed, invisible groups bound sibling-selector invalidation when one description is added or removed.\n       The description nodes, IDs, text, roles and aria-describedby links are unchanged. Keep groups for the\n       controller's lifetime: adding/removing groups would invalidate all their descendants again. */\n    this.descriptionBuckets=Array.prototype.slice.call(this.descriptions.querySelectorAll('.pm-hover-bucket'));\n    if(!this.descriptionBuckets.length){\n      var existing=Array.prototype.slice.call(this.descriptions.children);\n      for(var bi=0;bi<64;bi++){var bucket=document.createElement('div');bucket.className='pm-hover-bucket';this.descriptions.appendChild(bucket);this.descriptionBuckets.push(bucket);}\n      for(var ei=0;ei<existing.length;ei++){var old=existing[ei];if(old.classList.contains('pm-hover-description'))this.descriptionBuckets[(parseInt(old.id.slice('pm-hover-desc-'.length),36)>>>0)%64].appendChild(old);}\n    }\n",
     'fixed hidden description groups'),
    ("    if(!desc){desc=document.createElement('span');desc.id=id;desc.className='pm-hover-description';this.descriptions.appendChild(desc);}",
     "    if(!desc){desc=document.createElement('span');desc.id=id;desc.className='pm-hover-description';this.descriptionBuckets[parseInt(hash(key),36)%64].appendChild(desc);}",
     'route description to stable group'),
    # A panel release does not resize or change the rail's accordions. Its compatibility mouseup used to force the
    # panel body's pending layout in an unrelated rail measurement. Actual rail releases and window resizes retain
    # the original pass; the PointerEvent and its compatibility MouseEvent share the input timestamp.
    ("document.addEventListener('mouseup', function () { remeasureOpenAccordions(); });",
     "document.addEventListener('mouseup', function (ev) { if (window.PMW && PMW.gesture && PMW.gesture.releasedAt === ev.timeStamp) return; remeasureOpenAccordions(); });",
     'panel release skips unrelated rail accordion measure'),
    ("  function homeActive() { return activePage() === 'dashboard'; }",
     "  function homeActive() { return false; }"
     " /* home layer: the chat is one column on every page */",
     'homeActive (home layer)'),
    # The status bar said "Execution host local · 2ms", banned wording (the cross-look review; the planner gave the page
    # shell's status bar to this layer, 2026-10-10). NieR's readout found that item by its words, so the item now
    # carries data-status-item="host" and NieR looks for that first.
    ("""'<span class="pm7-statusitem" data-status-priority="low">Execution host <strong>local</strong> · 2ms</span>'""",
     """'<span class="pm7-statusitem" data-status-priority="low" data-status-item="host">Runs on <strong>this computer</strong> · 2ms</span>'""",
     'status bar host item (home layer)'),
    ("/^Execution host/i.test(e.textContent.trim())",
     "(e.getAttribute('data-status-item') === 'host' || /^Execution host/i.test(e.textContent.trim()))",
     'NieR readout finds the host item (home layer)'),
    # The rail's Dashboard (HOME) toggle showed and hid #dashboardView, which the panels park (20-shell.css), so it was
    # always lit and did nothing (Jared, 2026-10-14). The markup goes: the shell's handlers look it up and skip a missing
    # icon, a saved bar order drops an id that is not in the bar, and no tour step, shortcut or Settings row names it.
    # The Chat switch above it is lit by the rail's tile while the chat column shows (leftrail-redesign d/40-bar.js).
    ('<div class="icon" title="Dashboard" id="dashboardToggleIcon" data-ab-id="dashboard"><span class="symbol"><svg'
     ' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
     ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect>'
     '<rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16"'
     ' width="7" height="5"></rect></svg></span><span class="icon-label">HOME</span></div>',
     '<!-- home layer: the rail\'s Dashboard toggle is removed (the panels replaced the dashboard it showed) -->',
     'rail Dashboard toggle removed (home layer)'),
]

# NieR registry contributions, filled from the looks digest. No layer patches another layer's selector text.
NIER_ENTRIES = {
    'cursor': ['.pmw-cur:not(.active):not([aria-disabled="true"])'],
    'chosen': ['.pmw-chosen'],
    'strip': ['.pmw-strip'],
}

FONT_URL = re.compile(r'url\("o55font:([^"]+)"\)')
FONT_DIRS = [PANELS / 'fonts']
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
        raise ValueError(f'home layer: embedded font {name!r} is not in src/panels/fonts (the page\'s own faces are in '
                         f'opus-5.5 src/fonts)')
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
    """<script id="pm-home-early"> in <head>: src/panels/early/*.js. It sets html[data-pmw-home="on"] and defines the
    PM_HOME_WORKSPACE compatibility shim for the tour, chat and activity bar."""
    body = read_parts(PANELS / 'early', '.js')
    return "try {\n(function () {\n'use strict';\n" + body + "})();\n} catch (error) { try { console.error('[pm-home] early failed', error); } catch (_) {} }\n"


def apply(text: str, need) -> tuple[str, dict]:
    notes: dict = {'bytes_in': len(text.encode('utf-8'))}
    for marker in (CSS_START, CSS_END, JS_START, JS_END, 'id="pm-home-css"', 'id="pm-home-js"', 'id="pm-home-early"',
                   'id="pm-home-centre"'):  # (data-pmw-home is read by the tour's own steps, 83-tour-steps.js)
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
    notes['nier selector patches'] = []
    notes['nier registry lists'] = list(NIER_ENTRIES)
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


CHOSEN_STATE = re.compile(r'\[aria-(?:selected|checked|pressed)="true"\]|\[aria-current|\[data-active\]|\.(?:is-on|is-chosen|is-active|pmw-chosen)\b')


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
            # a chosen state marked with a line under or over it (DR-069, F3-648, D5; the lead's ruling of 2026-10-11):
            # the chosen fill (45-frames.css) is the grammar, never an underline
            for m in re.finditer(r'([^{}]+)\{([^{}]*)\}', code):
                sel, body = m.group(1), m.group(2)
                if not CHOSEN_STATE.search(sel):
                    continue
                if re.search(r'::?(?:after|before)', sel) and re.search(r'(?<![\w-])height\s*:\s*[0-3](?:\.\d+)?px', body) \
                        and re.search(r'(?<![\w-])(?:bottom|top)\s*:', body):
                    problems.append(f'chosen-state underline in {rel}: {sel.strip()[:90]}')
                if re.search(r'border-(?:bottom|top)(?:-width)?\s*:\s*[1-9]', body) or re.search(r'box-shadow\s*:\s*inset\s+0\s+-?[1-9]', body):
                    problems.append(f'chosen-state line in {rel}: {sel.strip()[:90]}')
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


# what the published page must carry once the layer is in (build.py, build.py --check, build_home.py --check)
MARKERS = [CSS_START, CSS_END, JS_START, JS_END, '<script id="pm-home-early">', '<style id="pm-home-css">',
           '<script id="pm-home-js">']
# The tour's restore snapshot contract is carried by the live compatibility shim.
EXACTLY_ONCE = ['window.PM_HOME_WORKSPACE = shim;',
                '  failNextPersistenceWrite: function () { var w = W(); if (w && w.faults) w.faults.failNextWrite = true; },']
KEPT = ['id="pm-home-workspace"', 'id="chatPanel"', 'window.PM_HOME_WORKSPACE', 'o55RestoreSnapshot']


def published_problems(built: str) -> list[str]:
    """The Home layer's checks on a built page (lint() runs separately, in build.py's lint_sources())."""
    problems = syntax_check(built)
    for marker in MARKERS:
        if built.count(marker) != 1:
            problems.append(f'home: marker {marker} appears {built.count(marker)} times (need exactly 1)')
    for needle in EXACTLY_ONCE:
        if built.count(needle) != 1:
            problems.append(f'home: {needle.strip()[:60]} appears {built.count(needle)} times (need exactly 1)')
    for kept in KEPT:
        if kept not in built:
            problems.append(f'home: kept reference missing: {kept}')
    for _, new_js, label in APP_PATCHES:
        if built.count(new_js) != 1:
            problems.append(f'home: app patch {label} appears {built.count(new_js)} times (need exactly 1)')
    if 0 <= built.find(JS_START) < built.find('<!-- RAIL:BODY:END -->'):
        problems.append('home: the Home body block comes before the rail\'s (the layer runs after Usage and the rail)')
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
