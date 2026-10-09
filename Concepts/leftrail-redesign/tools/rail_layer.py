#!/usr/bin/env python3
"""Rail layer: add the left-rail redesign concepts (src/) to the built concept page.

  text, notes = rail_layer.apply(text, need)   # text = opus-5.5 build.build_text(); need = build.need
  problems = rail_layer.lint()                 # source rules for ../src
  problems = rail_layer.syntax_check(text)     # node --check of <script id="pm-rail-js">

Concept round (2026-10-02): the original rail band stays in the page untouched. It keeps serving the six panels the
concepts do not redesign yet, and it is the switcher's "Current" option. apply() only adds:
  1. <style id="pm-rail-css"> before </head>: src/css/*.css, then src/concepts/<id>/*.css for each concept.
  2. <script id="pm-rail-js"> before </body>: the core (src/js/*.js in one strict wrapper, so those files share one
     scope and publish window.PMR), then each concept's src/concepts/<id>/*.js in a wrapper of its own, then the boot.
  3. The rail's generic NieR Mode hooks (.pmr-cur, .pmr-chosen, .pmr-strip) in the Settings script's NieR selector
     lists. The anchors differ from the usage-redesign layer's on purpose (agreed with that thread 2026-10-02), so
     both layers can be applied to the same text in either order.
Every step is guarded: each anchor must be found exactly once, the band must be where it was, and the layer markers
must not be in the input already.
"""
from __future__ import annotations

import re
import subprocess
import sys
import tempfile
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
SRC = PKG / 'src'
CONCEPTS_SRC = SRC / 'concepts'
CONCEPTS = PKG.parent
OPUS_TOOLS = CONCEPTS / 'onboarding' / 'opus-5.5' / 'tools'

CSS_START, CSS_END = '<!-- RAIL:CSS:START -->', '<!-- RAIL:CSS:END -->'
JS_START, JS_END = '<!-- RAIL:BODY:START -->', '<!-- RAIL:BODY:END -->'
HEAD_ANCHOR = '<!-- O55:CSS:END -->\n</head>'
BODY_ANCHOR = '</body>\n</html>'

# The band the concepts restyle and add views to. Each must exist exactly once (a moved or duplicated rail fails the
# build instead of rendering concepts against the wrong markup).
BAND = ['      <div class="left-panel">', '<nav class="activity-bar collapsed" id="activityBar" aria-label="Activity bar">',
        'id="activityBarToggle"', '<aside class="side-panel-slot" id="sidePanelSlot">', 'id="panel-files"',
        'id="panel-source"', 'id="panel-docker"', 'id="fileContextMenu"', 'id="leftPanelResizer"', 'id="abMoreBtn"']

# NieR Mode selector lists in the Settings script (opus-5.5 src/settings/kit.d/19-nier-parts.js). Each patch inserts the
# rail's generic hook classes; concepts tag their elements with these classes instead of growing the lists.
NIER_SELECTOR_PATCHES = [
    ("    '.chat-dropdown-item', '.pm6-chat-more-item',",
     "    '.pmr-cur:not(.active):not([aria-disabled=\"true\"])', '.chat-dropdown-item', '.pm6-chat-more-item',",
     'nier cursor list (rail)'),
    ('.page-index-title, .pm-segtab-item, .activity-bar .icon,',
     '.page-index-title, .pm-segtab-item, .pmr-chosen, .activity-bar .icon,',
     'nier chosen list (rail)'),
    ("const STRIP_SEL = '.page-tab, ",
     "const STRIP_SEL = '.page-tab, .pmr-strip, ",
     'nier strip list (rail)'),
    # Target brackets on a chosen item whose box changes when it is chosen (a rail tab shows its label): the brackets
    # are placed on the next frame, after the click has landed, and lock on afresh there, so they frame the box the
    # ink fills instead of the tab as it was before the click (concept D's tabs carry .pmr-lock, 31-tabs.js)
    ("    if (retLock) window.clearTimeout(retLock);\n    retT = t; retPlace(t);\n    retLock = later(",
     "    if (retLock) window.clearTimeout(retLock);\n    retT = t;\n"
     "    if (t.closest('.pmr-lock')) window.requestAnimationFrame(() => { if (retT === t && ret) { ret.removeAttribute('data-on'); retPlace(t); } });\n"
     "    else retPlace(t);\n    retLock = later(",
     'nier brackets lock after the click (rail)'),
]

CONCEPT_IDS = ('a', 'b', 'c', 'd')
# Shell classes whose names contain "pill" and that a skin concept (D) must select to take the capsule away. The pill
# lint stops concepts from creating pill classes; naming these shell classes in order to restyle them is allowed, and
# only inside skin concept folders.
SHELL_PILL_CLASSES = {'sh-pill'}
SKIN_CONCEPTS = {'d'}
# build_rail.py --only x sets this so a builder's private build includes (and lints) only the core and concept x
ONLY: list[str] | None = None


def _count_once(need, text: str, needle: str, where: str) -> int:
    n = text.count(needle)
    need(n == 1, f'rail layer: {needle!r} found {n} times in {where} (need exactly 1)')
    return text.index(needle)


def replace_once(need, text: str, old: str, new: str, label: str) -> str:
    n = text.count(old)
    need(n == 1, f'rail layer: anchor for {label} found {n} times (need exactly 1)')
    return text.replace(old, new, 1)


def read_parts(folder: Path, suffix: str) -> str:
    if not folder.is_dir():
        return ''
    out = []
    for p in sorted(folder.glob('*' + suffix)):
        out.append(f'/* ---- {p.relative_to(SRC).as_posix()} ---- */\n' + p.read_text(encoding='utf-8').rstrip() + '\n')
    return ''.join(out)


def concept_dirs() -> list[Path]:
    ids = [c for c in CONCEPT_IDS if ONLY is None or c in ONLY]
    return [CONCEPTS_SRC / c for c in ids if (CONCEPTS_SRC / c).is_dir()]


def build_css() -> str:
    css = read_parts(SRC / 'css', '.css')
    for d in concept_dirs():
        css += read_parts(d, '.css')
    return css


def build_script() -> str:
    core = read_parts(SRC / 'js', '.js')
    parts = ["try {\n(function () {\n'use strict';\n" + core + "})();\n"
             "} catch (error) { try { console.error('[pm-rail] core failed', error); } catch (_) {} }\n"]
    for d in concept_dirs():
        js = read_parts(d, '.js')
        if js.strip():
            parts.append("try {\n(function (PMR) {\n'use strict';\nif (!PMR) return;\n" + js
                         + f"}})(window.PMR);\n}} catch (error) {{ try {{ console.error('[pm-rail] concept {d.name} failed', error); }} catch (_) {{}} }}\n")
    parts.append("try { if (window.PMR && typeof window.PMR.boot === 'function') window.PMR.boot(); }"
                 " catch (error) { try { console.error('[pm-rail] boot failed', error); } catch (_) {} }\n")
    return ''.join(parts)


def apply(text: str, need) -> tuple[str, dict]:
    notes: dict = {'bytes_in': len(text.encode('utf-8'))}
    for marker in (CSS_START, CSS_END, JS_START, JS_END, 'id="pm-rail-css"', 'id="pm-rail-js"'):
        need(marker not in text, f'rail layer: {marker} already in the input (layer applied twice?)')
    a = _count_once(need, text, BAND[0], 'the page')
    z = _count_once(need, text, 'id="leftPanelResizer"', 'the page')
    need(a < z, 'rail layer: the left panel opens after its resizer')
    band = text[a:z]
    for needle in BAND[1:]:
        if needle == 'id="leftPanelResizer"':
            continue
        _count_once(need, text, needle, 'the page')
        need(needle in band, f'rail layer: {needle!r} is not inside the left panel band')

    css = build_css()
    script = build_script()
    for name, chunk in (('src css', css), ('src js', script)):
        for marker in (CSS_START, CSS_END, JS_START, JS_END, '<!-- O55:CSS:START -->', '<!-- O55:CSS:END -->',
                       '<!-- O55:BODY:START -->', '<!-- O55:BODY:END -->'):
            need(marker not in chunk, f'rail layer: {name} contains the build marker {marker}')
    need(not re.search(r'</style', css, re.I), 'rail layer: src css contains "</style"')
    need(not re.search(r'</script', script, re.I), 'rail layer: src js contains "</script"')

    text = replace_once(need, text, HEAD_ANCHOR,
                        '<!-- O55:CSS:END -->\n' + CSS_START + f'\n<style id="pm-rail-css">\n{css}</style>\n' + CSS_END
                        + '\n</head>', 'head end')
    text = replace_once(need, text, BODY_ANCHOR,
                        JS_START + f'\n<script id="pm-rail-js">\n{script}</script>\n' + JS_END + '\n</body>\n</html>',
                        'body end')
    for old, new, label in NIER_SELECTOR_PATCHES:
        text = replace_once(need, text, old, new, label)
    notes['nier selector patches'] = [label for _, _, label in NIER_SELECTOR_PATCHES]
    notes['concepts'] = [d.name for d in concept_dirs()]
    notes['rail_css_bytes'] = len(css.encode('utf-8'))
    notes['rail_js_bytes'] = len(script.encode('utf-8'))
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


def blank_comments(css: str) -> str:
    return re.sub(r'/\*[\s\S]*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group()), css)


def lint() -> list[str]:
    build = _opus_build()
    problems: list[str] = []
    tops: dict[str, list[str]] = {}
    for p in sorted(SRC.rglob('*')):
        if not p.is_file():
            continue
        if ONLY is not None and CONCEPTS_SRC in p.parents and p.relative_to(CONCEPTS_SRC).parts[0] not in ONLY:
            continue
        rel = p.relative_to(PKG).as_posix()
        text = p.read_text(encoding='utf-8')
        skin = CONCEPTS_SRC in p.parents and p.relative_to(CONCEPTS_SRC).parts[0] in SKIN_CONCEPTS
        allowed = SHELL_PILL_CLASSES if skin else set()
        if build.EMOJI.search(text):
            problems.append(f'emoji glyph in {rel}')
        if p.suffix == '.css':
            code = blank_comments(text)
            if ':has(' in code:
                problems.append(f':has() in rail CSS {rel} (rail styles use no :has())')
            for m in re.finditer(r'border-(?:left|inline-start)(?:-width)?\s*:\s*([^;}]+)', code):
                width = re.search(r'(\d+(?:\.\d+)?)px', m.group(1))
                if width and float(width.group(1)) >= 2:
                    problems.append(f'coloured side border in {rel}: {m.group(0).strip()}')
            for m in re.finditer(r'box-shadow\s*:\s*inset\s+(\d+(?:\.\d+)?)px\s+0', code):
                if float(m.group(1)) >= 2:
                    problems.append(f'inset side bar in {rel}: {m.group(0).strip()}')
            for sel in re.findall(r'([^{}]+)\{', code):
                for cls in CSS_CLASS.findall(sel):
                    if 'pill' in cls.lower() and not cls.startswith('pm6-') and cls not in allowed:
                        problems.append(f'pill class name in {rel}: .{cls}')
        if p.suffix == '.js':
            code = re.sub(r'/\*[\s\S]*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group()), text)
            for rx in PILL_MARKUP:
                for m in rx.finditer(code):
                    names = re.findall(r'(?<![\w-])(?!pm6-)[\w-]*pill[\w-]*', m.group(1), re.I)
                    if [x for x in names if x not in allowed]:
                        problems.append(f'pill class name in {rel}: {m.group(0)[:80]}')
            if p.parent == SRC / 'js':
                for n, line in enumerate(code.split('\n'), 1):
                    m = TOP_FUNCTION.match(line) or TOP_BINDING.match(line)
                    if m:
                        tops.setdefault(m.group(1), []).append(f'{p.name}:{n}')
                if re.match(r'\d+-data-', p.name):
                    stripped = re.sub(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"", "''", code)
                    for m in re.finditer(r'\b(window|document)\s*[.\[]', stripped):
                        problems.append(f'{rel} reads {m.group(1)} (fixture files are data only)')
                    if re.search(r'\bfunction\b|=>', stripped):
                        problems.append(f'{rel} contains code (fixture files are data only)')
    for name, where in sorted(tops.items()):
        if len(where) > 1:
            problems.append(f'top-level name {name!r} declared more than once across src/js: {", ".join(where)}')
    for d in concept_dirs():
        if not any(d.glob('*.js')):
            problems.append(f'concept {d.name} has no script')
    # concept D's stylesheet is generated from src/concepts/d/css/*.src.css (selector macros, see build_d_css.py)
    if (CONCEPTS_SRC / 'd' / 'css').is_dir() and (ONLY is None or 'd' in ONLY):
        sys.path.insert(0, str(TOOLS))
        import build_d_css  # noqa: E402
        if build_d_css.stale():
            problems.append('src/concepts/d/d.css is stale: run tools/build_d_css.py')
    return problems


def syntax_check(built: str) -> list[str]:
    found = re.findall(r'<script\b[^>]*\bid="pm-rail-js"[^>]*>(.*?)</script>', built, re.S)
    if len(found) != 1:
        return [f'script pm-rail-js found {len(found)} times (need exactly 1)']
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as fh:
        fh.write(found[0])
        path = fh.name
    try:
        r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    finally:
        Path(path).unlink(missing_ok=True)
    if r.returncode:
        return ['syntax error in pm-rail-js: ' + ' | '.join(r.stderr.strip().splitlines()[-4:])[:600]]
    return []
