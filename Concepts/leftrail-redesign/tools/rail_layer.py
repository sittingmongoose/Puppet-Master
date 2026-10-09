#!/usr/bin/env python3
"""Rail layer: concept D (Polish) as the left rail of the published concept, and the review copy's extra concepts.

Two profiles over the same sources (../src), so the D in the review copy is byte for byte the published D:

  text, notes = rail_layer.apply_published(text, need)  # the last step of opus-5.5 build.build_text(): PMConcept7.html
  text, notes = rail_layer.apply_review(text, need)     # build_rail.py: the review copy, stacked on the published page
  problems = rail_layer.published_problems(built)       # build.py and build.py --check: lint, syntax, markers, absences
  problems = rail_layer.lint('published' | 'review')    # source rules for the files that profile carries
  problems = rail_layer.syntax_check(text, sid)         # node --check of <script id=sid>

apply_published (concept D is a skin: the shell's rail band stays in the page, D restyles it at run time and records
every DOM change it makes, so PMR.concepts.set('current') puts the shell's own rail back byte for byte):
  1. <style id="pm-rail-css"> between RAIL:CSS markers before </head>: PUBLISHED_CSS, then src/concepts/d/d.css.
  2. <script id="pm-rail-js"> between RAIL:BODY markers before </body>: PUBLISHED_JS in one strict wrapper (those files
     share one scope and publish window.PMR), src/concepts/d/*.js in a wrapper of its own, then PMR.boot().
  3. data-rail-concept="d" data-rail-skin="d" on the <html> tag: D's CSS holds from the first frame, and the boot's
     switch to D writes nothing (setting an attribute on <html> after load restyles the whole document).
  It patches nothing in the Settings script: D's NieR hooks are kit source (opus-5.5 src/settings/kit.d/19-nier-parts.js:
  .pmr-cur in the cursor list, .pmr-lock in the brackets' click handler).
apply_review (on a page apply_published made; concepts A, B and C and the switcher, review-copy only):
  1. <style id="pm-rail-review-css"> between RAIL-REVIEW:CSS markers, right after RAIL:CSS:END: the src/css files not
     in PUBLISHED_CSS (25-review, 30-kit), then the CSS of A, B and C.
  2. <script id="pm-rail-review-js"> between RAIL-REVIEW:BODY markers, right after RAIL:BODY:END: the src/js files not
     in PUBLISHED_JS (the fixture, 08-data, 10-glyphs, 12-rules, 40-switcher) in one wrapper over window.PMR, then A, B
     and C in a wrapper each. PMR.boot() (end of the published script) waits for load, so it finds them and the switcher.
  3. The view concepts' NieR hooks .pmr-chosen and .pmr-strip in the Settings script's NieR selector lists.
Every step is guarded: each anchor must be found exactly once, the band and the nine panels must be where they were,
and the layer markers must not be in the input already.
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
REVIEW_CSS_START, REVIEW_CSS_END = '<!-- RAIL-REVIEW:CSS:START -->', '<!-- RAIL-REVIEW:CSS:END -->'
REVIEW_JS_START, REVIEW_JS_END = '<!-- RAIL-REVIEW:BODY:START -->', '<!-- RAIL-REVIEW:BODY:END -->'
PUBLISHED_MARKERS = (CSS_START, CSS_END, JS_START, JS_END, 'id="pm-rail-css"', 'id="pm-rail-js"')
REVIEW_MARKERS = (REVIEW_CSS_START, REVIEW_CSS_END, REVIEW_JS_START, REVIEW_JS_END, 'id="pm-rail-review-css"',
                  'id="pm-rail-review-js"')
HEAD_ANCHOR = '<!-- O55:CSS:END -->\n</head>'
BODY_ANCHOR = '</body>\n</html>'

# The band the concepts restyle and add views to. Each must exist exactly once (a moved or duplicated rail fails the
# build instead of rendering concepts against the wrong markup).
BAND = ['      <div class="left-panel">', '<nav class="activity-bar collapsed" id="activityBar" aria-label="Activity bar">',
        'id="activityBarToggle"', '<aside class="side-panel-slot" id="sidePanelSlot">', 'id="panel-files"',
        'id="panel-source"', 'id="panel-docker"', 'id="fileContextMenu"', 'id="leftPanelResizer"', 'id="abMoreBtn"',
        'id="panel-search"', 'id="panel-git"', 'id="panel-testing"', 'id="panel-run"', 'id="panel-agents"',
        'id="panel-artifacts"']
# the root tag: the first start tag after the doctype (the page also holds "<html" inside strings and comments)
HTML_TAG = re.compile(r'(<!DOCTYPE html>\s*<html\b)([^>]*)>', re.I)
ROOT_ATTRS = ' data-rail-concept="d" data-rail-skin="d"'

# What the published page carries, by name, so a new review file can never leak into it by accident. Every other file
# in src/js and src/css is review-only.
PUBLISHED_JS = ('00-core.js', '20-menu.js', '30-host.js', '90-boot.js')
PUBLISHED_CSS = ('00-tokens.css', '10-menu.css', '20-host.css', '40-nier.css')
PUBLISHED_CONCEPTS = ('d',)
REVIEW_CONCEPTS = ('a', 'b', 'c')
# absent from the published page: review chrome and fixture (checked in the rail blocks), the view concepts' NieR hooks
# (checked in the Settings script, since 40-nier.css names them in a comment)
PUBLISHED_ABSENT = ('pmr-switch', 'FILES_DATA', ".get('rail')", 'pmr.concept.v2', 'pm-rail-review', 'RAIL-REVIEW:')
PUBLISHED_ABSENT_SETTINGS = ('.pmr-chosen', '.pmr-strip')

# NieR Mode selector lists in the Settings script (opus-5.5 src/settings/kit.d/19-nier-parts.js). Each patch inserts the
# rail's generic hook classes; concepts tag their elements with these classes instead of growing the lists.
# Review copy only (apply_review): .pmr-chosen and .pmr-strip serve concepts A, B and C. Concept D's two hooks, .pmr-cur
# in the cursor list and the brackets locking after the click on .pmr-lock, are kit source since 2026-10-09 (published).
NIER_SELECTOR_PATCHES = [
    ('.page-index-title, .pm-segtab-item, .activity-bar .icon,',
     '.page-index-title, .pm-segtab-item, .pmr-chosen, .activity-bar .icon,',
     'nier chosen list (rail)'),
    ("const STRIP_SEL = '.page-tab, ",
     "const STRIP_SEL = '.page-tab, .pmr-strip, ",
     'nier strip list (rail)'),
]

CONCEPT_IDS = REVIEW_CONCEPTS + PUBLISHED_CONCEPTS
# Shell classes whose names contain "pill" and that a skin concept (D) must select to take the capsule away. The pill
# lint stops concepts from creating pill classes; naming these shell classes in order to restyle them is allowed, and
# only inside skin concept folders.
SHELL_PILL_CLASSES = {'sh-pill'}
SKIN_CONCEPTS = {'d'}
# build_rail.py --only x sets this so a builder's private build includes (and lints) only the review concepts named (the
# published page, D included, is always there)
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


def concept_dirs(ids=CONCEPT_IDS) -> list[Path]:
    ids = [c for c in ids if c in PUBLISHED_CONCEPTS or ONLY is None or c in ONLY]
    return [CONCEPTS_SRC / c for c in ids if (CONCEPTS_SRC / c).is_dir()]


def _core_parts(suffix: str, published: bool) -> str:
    """The src/js or src/css files of one profile, in name order: PUBLISHED_* by name, the review files as the rest."""
    folder = SRC / ('js' if suffix == '.js' else 'css')
    names = PUBLISHED_JS if suffix == '.js' else PUBLISHED_CSS
    out = []
    for p in sorted(folder.glob('*' + suffix)):
        if (p.name in names) == published:
            out.append(f'/* ---- {p.relative_to(SRC).as_posix()} ---- */\n' + p.read_text(encoding='utf-8').rstrip() + '\n')
    return ''.join(out)


def _concept_wrapper(d: Path) -> str:
    js = read_parts(d, '.js')
    if not js.strip():
        return ''
    return ("try {\n(function (PMR) {\n'use strict';\nif (!PMR) return;\n" + js
            + f"}})(window.PMR);\n}} catch (error) {{ try {{ console.error('[pm-rail] concept {d.name} failed', error); }} catch (_) {{}} }}\n")


def build_css(profile: str = 'published') -> str:
    css = _core_parts('.css', profile == 'published')
    for d in concept_dirs(PUBLISHED_CONCEPTS if profile == 'published' else REVIEW_CONCEPTS):
        css += read_parts(d, '.css')
    return css


def build_script(profile: str = 'published') -> str:
    if profile == 'published':
        parts = ["try {\n(function () {\n'use strict';\n" + _core_parts('.js', True) + "})();\n"
                 "} catch (error) { try { console.error('[pm-rail] core failed', error); } catch (_) {} }\n"]
        parts += [_concept_wrapper(d) for d in concept_dirs(PUBLISHED_CONCEPTS)]
        parts.append("try { if (window.PMR && typeof window.PMR.boot === 'function') window.PMR.boot(); }"
                     " catch (error) { try { console.error('[pm-rail] boot failed', error); } catch (_) {} }\n")
        return ''.join(parts)
    # review: its core files share one scope of their own over the published window.PMR (they use only PMR.* and each
    # other); the boot at the end of the published script waits for load, so it runs after this script
    parts = ["try {\n(function () {\n'use strict';\nconst PMR = window.PMR;\nif (!PMR) return;\n" + _core_parts('.js', False)
             + "})();\n} catch (error) { try { console.error('[pm-rail] review core failed', error); } catch (_) {} }\n"]
    parts += [_concept_wrapper(d) for d in concept_dirs(REVIEW_CONCEPTS)]
    return ''.join(parts)


def _chunk_guards(need, css: str, script: str) -> None:
    for name, chunk in (('src css', css), ('src js', script)):
        for marker in (CSS_START, CSS_END, JS_START, JS_END, REVIEW_CSS_START, REVIEW_CSS_END, REVIEW_JS_START,
                       REVIEW_JS_END, '<!-- O55:CSS:START -->', '<!-- O55:CSS:END -->', '<!-- O55:BODY:START -->',
                       '<!-- O55:BODY:END -->'):
            need(marker not in chunk, f'rail layer: {name} contains the build marker {marker}')
    need(not re.search(r'</style', css, re.I), 'rail layer: src css contains "</style"')
    need(not re.search(r'</script', script, re.I), 'rail layer: src js contains "</script"')


def d_panel_ids() -> list[str]:
    """PANEL_IDS of src/concepts/d/00-d.js (D's script) as plain ids."""
    m = re.search(r'^const PANEL_IDS = \[([^\]]*)\]', (CONCEPTS_SRC / 'd' / '00-d.js').read_text(encoding='utf-8'), re.M)
    return [x[len('panel-'):] for x in re.findall(r"'([^']+)'", m.group(1))] if m else []


def _build_d_css():
    if str(TOOLS) not in sys.path:
        sys.path.insert(0, str(TOOLS))
    import build_d_css  # noqa: E402
    return build_d_css


def apply_published(text: str, need) -> tuple[str, dict]:
    """Concept D, Polish, as the page's left rail (the last step of opus-5.5 build.build_text())."""
    notes: dict = {'bytes_in': len(text.encode('utf-8'))}
    for marker in PUBLISHED_MARKERS + REVIEW_MARKERS:
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
    panel_ids = _build_d_css().PANEL_IDS
    need(tuple(d_panel_ids()) == tuple(panel_ids),
         f'rail layer: PANEL_IDS in src/concepts/d/00-d.js {d_panel_ids()} differ from build_d_css.PANEL_IDS {list(panel_ids)}')
    for name in PUBLISHED_JS:
        need((SRC / 'js' / name).is_file(), f'rail layer: published file src/js/{name} is missing')
    for name in PUBLISHED_CSS:
        need((SRC / 'css' / name).is_file(), f'rail layer: published file src/css/{name} is missing')
    roots = HTML_TAG.findall(text)
    need(len(roots) == 1, f'rail layer: the <html> start tag after the doctype found {len(roots)} times (need exactly 1)')
    need('data-rail-' not in roots[0][1], 'rail layer: the <html> tag already carries data-rail-* attributes')

    css = build_css('published')
    script = build_script('published')
    _chunk_guards(need, css, script)
    text = replace_once(need, text, HEAD_ANCHOR,
                        '<!-- O55:CSS:END -->\n' + CSS_START + f'\n<style id="pm-rail-css">\n{css}</style>\n' + CSS_END
                        + '\n</head>', 'head end')
    text = replace_once(need, text, BODY_ANCHOR,
                        JS_START + f'\n<script id="pm-rail-js">\n{script}</script>\n' + JS_END + '\n</body>\n</html>',
                        'body end')
    text = HTML_TAG.sub(lambda m: m.group(1) + m.group(2) + ROOT_ATTRS + '>', text, count=1)
    notes['profile'] = 'published'
    notes['concepts'] = [d.name for d in concept_dirs(PUBLISHED_CONCEPTS)]
    notes['rail_css_bytes'] = len(css.encode('utf-8'))
    notes['rail_js_bytes'] = len(script.encode('utf-8'))
    notes['bytes_out'] = len(text.encode('utf-8'))
    return text, notes


def apply_review(text: str, need) -> tuple[str, dict]:
    """The review copy's extras (concepts A, B, C, their fixture, the switcher) on a page apply_published made."""
    notes: dict = {'bytes_in': len(text.encode('utf-8'))}
    for marker in PUBLISHED_MARKERS:
        n = text.count(marker)
        need(n == 1, f'rail layer: {marker} found {n} times (the review copy stacks on the published page: need exactly 1)')
    for marker in REVIEW_MARKERS:
        need(marker not in text, f'rail layer: {marker} already in the input (review layer applied twice?)')
    css = build_css('review')
    script = build_script('review')
    _chunk_guards(need, css, script)
    text = replace_once(need, text, CSS_END + '\n',
                        CSS_END + '\n' + REVIEW_CSS_START + f'\n<style id="pm-rail-review-css">\n{css}</style>\n'
                        + REVIEW_CSS_END + '\n', 'review css (after the published rail css)')
    text = replace_once(need, text, JS_END + '\n',
                        JS_END + '\n' + REVIEW_JS_START + f'\n<script id="pm-rail-review-js">\n{script}</script>\n'
                        + REVIEW_JS_END + '\n', 'review js (after the published rail js)')
    for old, new, label in NIER_SELECTOR_PATCHES:
        text = replace_once(need, text, old, new, label)
    notes['profile'] = 'review'
    notes['nier selector patches'] = [label for _, _, label in NIER_SELECTOR_PATCHES]
    notes['concepts'] = [d.name for d in concept_dirs(REVIEW_CONCEPTS)]
    notes['review_css_bytes'] = len(css.encode('utf-8'))
    notes['review_js_bytes'] = len(script.encode('utf-8'))
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


def in_profile(p: Path, profile: str) -> bool:
    """Whether a source file is carried by a profile: 'published' (the core files named in PUBLISHED_*, concept D) or
    'review' (the review copy: everything, less the review concepts --only leaves out)."""
    if CONCEPTS_SRC in p.parents:
        cid = p.relative_to(CONCEPTS_SRC).parts[0]
        return cid in PUBLISHED_CONCEPTS or (profile == 'review' and (ONLY is None or cid in ONLY))
    if p.parent == SRC / 'js':
        return profile == 'review' or p.name in PUBLISHED_JS
    if p.parent == SRC / 'css':
        return profile == 'review' or p.name in PUBLISHED_CSS
    return profile == 'review'


def lint(profile: str = 'review') -> list[str]:
    """Source rules over the files a profile carries, so a lint failure in concept A cannot block a publish."""
    build = _opus_build()
    problems: list[str] = []
    tops: dict[str, list[str]] = {}
    for p in sorted(SRC.rglob('*')):
        if not p.is_file() or not in_profile(p, profile):
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
    for d in concept_dirs(PUBLISHED_CONCEPTS if profile == 'published' else CONCEPT_IDS):
        if not any(d.glob('*.js')):
            problems.append(f'concept {d.name} has no script')
    for name in PUBLISHED_JS:
        if not (SRC / 'js' / name).is_file():
            problems.append(f'published file src/js/{name} is missing')
    for name in PUBLISHED_CSS:
        if not (SRC / 'css' / name).is_file():
            problems.append(f'published file src/css/{name} is missing')
    # concept D's stylesheet is generated from src/concepts/d/css/*.src.css (selector macros, see build_d_css.py)
    bd = _build_d_css()
    if bd.stale():
        problems.append('src/concepts/d/d.css is stale: run tools/build_d_css.py')
    if tuple(d_panel_ids()) != tuple(bd.PANEL_IDS):
        problems.append(f'PANEL_IDS in src/concepts/d/00-d.js {d_panel_ids()} differ from build_d_css.PANEL_IDS {list(bd.PANEL_IDS)}')
    return problems


def _script(built: str, sid: str) -> list[str]:
    return re.findall(r'<script\b[^>]*\bid="' + re.escape(sid) + r'"[^>]*>(.*?)</script>', built, re.S)


def syntax_check(built: str, sid: str = 'pm-rail-js') -> list[str]:
    found = _script(built, sid)
    if len(found) != 1:
        return [f'script {sid} found {len(found)} times (need exactly 1)']
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as fh:
        fh.write(found[0])
        path = fh.name
    try:
        r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
    finally:
        Path(path).unlink(missing_ok=True)
    if r.returncode:
        return [f'syntax error in {sid}: ' + ' | '.join(r.stderr.strip().splitlines()[-4:])[:600]]
    return []


def published_problems(built: str) -> list[str]:
    """What opus-5.5 build.py adds to its problem lists for the published page (PMConcept7.html carries concept D)."""
    problems = lint('published') + syntax_check(built, 'pm-rail-js')
    for marker in PUBLISHED_MARKERS:
        if built.count(marker) != 1:
            problems.append(f'rail: marker {marker} appears {built.count(marker)} times (need exactly 1)')
    if "PMR.concepts.register('d'" not in built:
        problems.append("rail: concept D does not register (PMR.concepts.register('d' missing)")
    roots = HTML_TAG.findall(built)
    if len(roots) != 1 or ROOT_ATTRS.strip() not in roots[0][1]:
        problems.append(f'rail: the <html> tag does not carry{ROOT_ATTRS}')
    rail = ''.join(re.findall(r'<style id="pm-rail-css">(.*?)</style>', built, re.S)) + ''.join(_script(built, 'pm-rail-js'))
    for absent in PUBLISHED_ABSENT:
        if absent in rail or (absent.startswith(('RAIL-REVIEW', 'pm-rail-review')) and absent in built):
            problems.append(f'rail: review-only {absent!r} is in the published page')
    settings = ''.join(_script(built, 'pm4-settings-js'))
    for absent in PUBLISHED_ABSENT_SETTINGS:
        if absent in settings:
            problems.append(f'rail: the review-only NieR hook {absent} is in the published Settings script')
    if '.pmr-cur:not(.active)' not in settings:
        problems.append('rail: the NieR cursor list does not name .pmr-cur (kit.d/19-nier-parts.js)')
    if ".closest('.pmr-lock')" not in settings:
        problems.append('rail: the NieR brackets do not lock after the click on .pmr-lock (kit.d/19-nier-parts.js)')
    return problems
