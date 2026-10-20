#!/usr/bin/env python3
"""Build Concepts/PMConcept7.html from the live ../base shell sources plus ./src (onboarding, tour, Settings).

Usage:
  python3 Concepts/onboarding/opus-5.5/tools/build.py          # build and publish Concepts/PMConcept7.html
  python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7  # accepted alias for the same publication
  python3 Concepts/onboarding/opus-5.5/tools/build.py --out /tmp/x.html  # private build: lint, then write only that path
  python3 Concepts/onboarding/opus-5.5/tools/build.py --check  # verify PMConcept7.html is current and every guard holds

The live shell is ordinary source in ../base/: manifest.json fixes the block list, shell.html owns markup,
and tools/base_source.py inserts raw style/script bodies byte for byte. Edit those files directly; the old
TestPMConcept.html, shell_motion.py and wizorch_layer.py are history. The split proof lives in base/README.md.
Unconditional shell edits are already in base/; the fork-owned Doctor edit is in src/settings/managers/55-doctor.js.
Settings (step 0), Usage (2b), O55 (3), rail (4), glyphs (5), Home/Glass/wallpapers (6) remain authored layers.
The NieR registry (tools/nier_registry.py) emits their list contributions after composition.
Step 7 applies active_descendant_rewrite and css_bucket_split over the finished page; page lint sees the unsplit CSS.
Concepts/PMConcept7.html is the only published page (2026-10-20 user direction). Plain runs and --publish-pm7 write
that file; --check fails while it is missing or differs from a fresh build by even one byte.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

import nier_palette
import nier_scene_art
import nier_scenes
import settings_layer
import base_source
import active_descendant_rewrite
import css_bucket_split

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
CONCEPTS = PKG.parents[1]
TARGET = CONCEPTS / 'PMConcept7.html'
PAGE_TITLE = 'PMConcept7 · Puppet Master'
SRC = PKG / 'src'

_previous_dont_write_bytecode = sys.dont_write_bytecode
sys.dont_write_bytecode = True
try:
    import nier_registry  # noqa: E402  (build-time list data and the one emitter)
finally:
    sys.dont_write_bytecode = _previous_dont_write_bytecode

sys.path.insert(0, str(CONCEPTS / 'usage-redesign' / 'tools'))
import usage_layer  # noqa: E402  (the Usage page: Concepts/usage-redesign/tools/usage_layer.py)

EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿⬀-⯿️]')
BANNED_COPY = re.compile(r'\b(repository|repositories|forge|runtime|adapter|endpoint|execution host|credential profile|'
                         r'unleash|supercharge|ai magic|shell)\b', re.I)


class BuildError(RuntimeError):
    pass


def need(cond: bool, message: str) -> None:
    if not cond:
        raise BuildError(message)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    need(count == 1, f'patch "{label}": anchor found {count} times (need exactly 1)')
    return text.replace(old, new, 1)


def read_parts(folder: Path, suffix: str) -> str:
    files = sorted(p for p in folder.rglob(f'*{suffix}') if p.is_file())
    out = []
    for p in files:
        body = base_source.read_text_source(p)
        out.append(f'/* ---- {p.relative_to(SRC).as_posix()} ---- */\n{body.rstrip()}\n')
    return '\n'.join(out)


def _merge_copy(base: dict, extra: dict, where: str) -> None:
    for k, v in extra.items():
        if isinstance(v, dict) and isinstance(base.get(k), dict):
            _merge_copy(base[k], v, f'{where}.{k}')
        elif k in base:
            raise BuildError(f'copy key {where}.{k} is defined twice (copy.json and copy.d)')
        else:
            base[k] = v


def copy_json() -> dict:
    """src/copy.json, then every src/copy.d/*.json merged in filename order (a leaf key may be defined once)."""
    path = SRC / 'copy.json'
    data = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
    for extra in sorted((SRC / 'copy.d').glob('*.json')) if (SRC / 'copy.d').is_dir() else []:
        _merge_copy(data, json.loads(extra.read_text(encoding='utf-8')), f'[{extra.name}]')
    return data


# Embedded font files (src/fonts, src/settings/nier/fonts) are inlined by settings_layer.inline_fonts, never read as text.
BINARY_SUFFIXES = {'.woff2', '.woff', '.ttf', '.otf'}

# Page-wide universal tails. A selector that starts at html (or :root, or body) with an attribute or class, and whose
# last compound is a bare universal (`*`, `*::before`, `:where(*)`, `*:not(.x)`: nothing a style invalidation set can
# key on), makes Blink restyle the whole ~17k-node document each time that attribute or class changes. That one rule
# (`html[data-o55fx-pod] ... .o55nw-pod *`) made every Pod 042 line freeze the page for about 220 ms, twice. Only the
# look's own switches may do it, because changing them repaints the whole page anyway; each is listed with why.
PAGE_STATE_OK = {
    'data-theme': 'the look family or mode changes: the whole page is restyled anyway',
    'data-motion': 'Reduced Motion is turned on or off: the whole page is restyled anyway',
    'data-o55-nier': 'NieR Mode is painted or removed: the whole page is restyled anyway',
    'data-o55-nier-mode': 'NieR Mode switches light/dark: the whole page is restyled anyway',
    'data-o55-nier-parts': 'a NieR part is installed or removed: the NieR repaint restyles the whole page anyway',
    'data-focus': 'the focus ring style is changed in Settings: a look change',
}
# Runtime switches that already have such a rule, named exactly (file, selector) so that no new one gets in. Each is a
# NOTE in every build until its owner gives it a class tail; the rule is then simply gone from here. Measured
# 2026-10-08 on the NieR look screen (16.7k elements, h-fx2-work/attrcost2.mjs): a toggle with no rule costs 0 ms.
PAGE_WIDE_DEBT = {
    ('src/css/10-window.css', 'html[data-o55-open] body > [data-o55-held] *'):
        'WINDOW: about 240 ms of style each time the onboarding window opens or closes; name the animated parts '
        '(the next rule already does) instead of every element of the app',
    ('src/css/30-art.css', 'html[data-o55-lowres] .o55-f-nier :is(.o55-nier-online .nv-scan, .o55-nier-online .nv-rest, '
                           '.o55-nier-linkrun path[style], .o55-nier-linkoff path[style], .o55-nier-stamp *)'):
        'ART: the `.o55-nier-stamp *` arm makes each low-resource switch cost about 260 ms instead of 135 ms, and it '
        'switches when the computer is already struggling; name the stamp\'s parts (`.o55-nier-stamp :is(path, rect)`)',
}
CSS_STRING = re.compile(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'')


def css_selectors(text: str):
    """(line, selector) for every style rule's selector, inside @media/@supports/@layer/@container blocks too, but not
    the frames of @keyframes or the bodies of @font-face/@property/@page. Strings and comments are blanked first, so
    a brace in content: "{" or in a comment never counts."""
    clean = re.sub(r'/\*[\s\S]*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group(0)), text)
    clean = CSS_STRING.sub(lambda m: m.group(0)[0] + re.sub(r'[{};,]', ' ', m.group(0)[1:-1]) + m.group(0)[-1], clean)
    out, stack, start = [], [], 0
    for i, ch in enumerate(clean):
        if ch == '{':
            prelude = clean[start:i].strip()
            nests = prelude.startswith('@') and re.match(r'@(media|supports|layer|container|document|scope)\b', prelude)
            if not prelude.startswith('@') and all(kind == 'group' for kind in stack):
                line = clean.count('\n', 0, start + len(clean[start:i]) - len(clean[start:i].lstrip())) + 1
                for sel in split_top(prelude, ','):
                    if sel.strip():
                        out.append((line, ' '.join(sel.split())))
            stack.append('group' if nests else 'block')
            start = i + 1
        elif ch == '}':
            if stack:
                stack.pop()
            start = i + 1
        elif ch == ';' and (not stack or stack[-1] == 'group'):
            start = i + 1  # @import / @charset / @layer a, b;
    return out


def split_top(s: str, seps: str) -> list[str]:
    """Split s on any of seps outside (), [] and strings."""
    parts, depth, cur, quote = [], 0, '', ''
    for ch in s:
        if quote:
            cur += ch
            if ch == quote:
                quote = ''
            continue
        if ch in '"\'':
            quote = ch
        elif ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        elif depth == 0 and ch in seps:
            parts.append(cur)
            cur = ''
            continue
        cur += ch
    parts.append(cur)
    return parts


def compounds(sel: str) -> list[str]:
    """The compound selectors of one complex selector, left to right (combinators dropped)."""
    spaced = re.sub(r'\s*([>+~])\s*', r' \1 ', sel)
    return [c for c in split_top(spaced, ' ') if c and c not in '>+~']


def bare_universal(comp: str) -> bool:
    """True when a compound gives a style invalidation set nothing to key on: no type, class, id or attribute of its
    own, and no :is()/:where() whose every arm ends in one (`*`, `*::after`, `:where(*)`, `*:not(.x)`, `:focus-visible`,
    `:is(.a, *)`). :not() and the other pseudo-classes key on nothing; `:is(.a, .b)` keys on .a and .b."""
    rest, depth, args, name, keyed = '', 0, '', '', False
    i = 0
    while i < len(comp):
        ch = comp[i]
        if depth == 0 and ch == '[':
            m = re.match(r'\[(?:"[^"]*"|\'[^\']*\'|[^\]])*\]', comp[i:])
            rest += m.group(0) if m else ch
            i += m.end() if m else 1
            continue
        if depth == 0 and ch == ':':
            m = re.match(r'::?([\w-]+)', comp[i:])
            name = m.group(1).lower() if m else ''
            i += m.end() if m else 1
            continue
        if ch == '(':
            depth += 1
            if depth == 1:
                args = ''
                i += 1
                continue
        elif ch == ')':
            depth -= 1
            if depth == 0:
                if name in ('is', 'where', 'matches', '-webkit-any') and args.strip():
                    arms = [a for a in split_top(args, ',') if a.strip()]
                    if arms and all(not bare_universal(compounds(a)[-1]) for a in arms if compounds(a)):
                        keyed = True
                name = ''
                i += 1
                continue
        if depth >= 1:
            args += ch
        elif depth == 0:
            rest += ch
        i += 1
    return not keyed and rest.strip() in ('', '*')


def page_wide_universal(sel: str) -> list[str] | None:
    """The html/:root/body state names a selector depends on, if its last compound is a bare universal; else None."""
    comps = compounds(sel)
    if len(comps) < 2 or not bare_universal(comps[-1]):
        return None
    names = []
    for comp in comps[:-1]:
        if not re.match(r'(?:html|body|:root)(?![\w-])', comp):
            continue
        names += re.findall(r'\[\s*([\w-]+)', comp) + ['.' + c for c in re.findall(r'\.([\w-]+)', comp)]
    return names or None


def lint_page_wide_universal(rel: str, text: str, notes: list[str] | None = None) -> list[str]:
    problems = []
    for line, sel in css_selectors(text):
        names = page_wide_universal(sel)
        if names is None:
            continue
        bad = [n for n in names if n not in PAGE_STATE_OK]
        debt = PAGE_WIDE_DEBT.get((rel.removeprefix('Concepts/onboarding/opus-5.5/'), sel))
        if bad and debt:
            if notes is not None:
                notes.append(f'known page-wide universal selector in {rel}:{line} ({", ".join(bad)}): {debt}')
        elif bad:
            problems.append(f'page-wide universal selector in {rel}:{line}: `{sel[:120]}` ends in a bare `*`, so each '
                            f'change of {", ".join(bad)} on <html>/<body> restyles the whole page (about 220 ms on the '
                            f'Pod 042 rule this replaced). End it in a class (`:is(.a, .b)`) or put the state on the '
                            f'element that needs it.')
    return problems


def lint_source_parts(path: Path):
    """Lint authored CSS fragments under their own names, preserving host checks."""
    text = base_source.read_source(path).decode('utf-8') if path.suffix == '.css' else base_source.read_text_source(path)
    if path.suffix == '.css':
        base_source.read_text_source(path)  # retain slot validation before linting authored parts
    yield path, text
    if path.suffix == '.css':
        for match in base_source.CSS_SLOT.finditer(text):
            fragment = (base_source.LG_SLOTS / match.group(1)).resolve()
            yield fragment, base_source.read_source(fragment).decode('utf-8')


def lint_sources() -> list[str]:
    problems = []
    for p in sorted(SRC.rglob('*')):
        if '__pycache__' in p.parts or not p.is_file() or p.suffix in BINARY_SUFFIXES:
            continue
        for source, text in lint_source_parts(p):
            rel = source.relative_to(PKG) if source.is_relative_to(PKG) else source.relative_to(CONCEPTS.parent)
            if EMOJI.search(text):
                problems.append(f'emoji glyph in {rel}')
            if p.suffix == '.css':
                # A :has() whose subject is html/body/:root makes every DOM insertion restyle the whole ~17k-node document
                # (measured ~90 ms each); that is what made Settings lag. Settings styles use no :has() at all.
                for m in re.finditer(r'(?:^|[\s,}])(?:html|body|:root)\b[^{},]*:has\(', text):
                    problems.append(f'page-wide :has() in {rel}: {m.group(0).strip()[:80]}')
                if 'settings' in p.relative_to(SRC).parts and ':has(' in text:
                    problems.append(f':has() in Settings styles {rel}')
                for m in re.finditer(r'border-(?:left|inline-start)\s*:\s*([^;]+);', text):
                    width = re.search(r'(\d+(?:\.\d+)?)px', m.group(1))
                    if width and float(width.group(1)) >= 2:
                        problems.append(f'left accent border in {rel}: {m.group(0)}')
                notes: list[str] = []
                problems.extend(lint_page_wide_universal(rel.as_posix(), text, notes))
                for n in notes:
                    print('NOTE:', n, file=sys.stderr)
    def walk(node, path):
        if isinstance(node, dict):
            for k, v in node.items():
                walk(v, f'{path}.{k}')
        elif isinstance(node, list):
            for i, v in enumerate(node):
                walk(v, f'{path}[{i}]')
        elif isinstance(node, str):
            # PJCT-007/PWIZ-021 fix these two recovery action labels exactly.
            owner_labels = {'.creating.recovery.open': 'Open Repository', '.creating.recovery.delete': 'Delete Repository'}
            if BANNED_COPY.search(node) and not path.split('.')[-1].startswith('detail') and owner_labels.get(path) != node:
                problems.append(f'banned word in copy.json{path}: {node[:80]}')
    walk(copy_json(), '')
    problems.extend(duplicate_keys())
    # NieR Mode's token tables are generated from the theme JSON; stale tables or a stray colour literal fail here.
    problems.extend(nier_palette.check())
    problems.extend(settings_layer.web_font_checks(SRC))
    # The scene SVGs are drawn by nier_scene_art.py and composed into kit.d/21-nier-scenes.js by nier_scenes.py.
    if nier_scene_art.main(['--check']) != 0:
        problems.append('NieR scene SVGs are stale; run tools/nier_scene_art.py --write')
    if nier_scenes.main(['--check']) != 0:
        problems.append('kit.d/21-nier-scenes.js is stale; run tools/nier_scenes.py --write')
    # The Usage page's sources (Concepts/usage-redesign/src): emoji, banned copy, :has(), accent borders, pills,
    # page-wide universal selectors, duplicate top-level names, copy and roster JSON.
    problems.extend(usage_layer.lint())
    # The Home layer's sources (Concepts/home-redesign/src): emoji, :has(), coloured side borders, pills, capsule radii,
    # viewport-width @media, window-size reads, banned copy, a top-level name declared twice in one scope.
    problems.extend(_home().lint())
    return problems


def duplicate_keys() -> list[str]:
    """A key given twice in one screen or tour-step definition: JavaScript keeps the later one without a word, which
    once dropped the backup access fields' handlers (a second `bind:` further down the protect screen). Top-level keys
    are the 4-space-indented `key:` / `key(` / `async key(` lines of each def('id', {...}) or S({ id: ... })."""
    out = []
    for p in sorted((SRC / 'js').glob('*.js')):
        cur, keys = None, {}
        for n, line in enumerate(p.read_text(encoding='utf-8').split('\n'), 1):
            m = re.match(r"\s*(?:def|S)\((?:'([\w-]+)',\s*)?\{(?:\s*id:\s*'([\w-]+)')?", line)
            if m and (m.group(1) or m.group(2)):
                cur, keys = m.group(1) or m.group(2), {}
                for k in re.findall(r"[,{]\s*(\w+)\s*:", line):
                    if k != 'id':
                        keys.setdefault(k, []).append(n)
                continue
            if cur is None:
                continue
            m = re.match(r"^    (?:async\s+)?(\w+)\s*(?::|\()", line)
            if m:
                keys.setdefault(m.group(1), []).append(n)
            if re.match(r"^  \S", line):
                out += [f'duplicate key {k!r} in {cur} ({p.name} lines {ns})' for k, ns in keys.items() if len(ns) > 1]
                cur = None
    return out


SETTINGS_NOTES: dict = {}
# the page as it was before step 7, keyed by the built text: the page lint ratchet counts what the sources wrote
UNSPLIT: dict = {}


def _rail():
    """The left rail layer (Concepts/leftrail-redesign/tools/rail_layer.py), imported when first needed."""
    rail_tools = str(CONCEPTS / 'leftrail-redesign' / 'tools')
    if rail_tools not in sys.path:
        sys.path.insert(0, rail_tools)
    import rail_layer  # noqa: E402
    return rail_layer


def _glyphs():
    """The glyph layer (Concepts/glyph-system/opus-5.5/tools/glyph_layer.py), imported when first needed."""
    glyph_tools = str(CONCEPTS / 'glyph-system' / 'opus-5.5' / 'tools')
    if glyph_tools not in sys.path:
        sys.path.insert(0, glyph_tools)
    import glyph_layer  # noqa: E402
    return glyph_layer


def _home():
    """The Home layer (Concepts/home-redesign/tools/home_layer.py: the universal panels and the terminal), imported when
    first needed."""
    home_tools = str(CONCEPTS / 'home-redesign' / 'tools')
    if home_tools not in sys.path:
        sys.path.insert(0, home_tools)
    import home_layer  # noqa: E402
    return home_layer


def _layer(folder: str, module: str):
    """A page layer's build tool (Concepts/<folder>/opus-5.5/tools/<module>.py), imported when first needed."""
    tools = str(CONCEPTS / folder / 'opus-5.5' / 'tools')
    if tools not in sys.path:
        sys.path.insert(0, tools)
    import importlib  # noqa: E402
    return importlib.import_module(module)


def emit_nier_lists(text: str, need) -> str:
    """Register only layers actually in this page; also used after rail_layer.apply_review()."""
    layers = {}
    for name, marker, module in (('usage', usage_layer.BODY_START, usage_layer),
                                 ('home', _home().JS_START, _home()),
                                 ('rail', _rail().REVIEW_JS_START, _rail())):
        if marker in text:
            layers[name] = module.NIER_ENTRIES
    return nier_registry.emit(text, need, layers)


def build_text() -> str:
    """The built page: the live base shell with every authored layer applied (published through --publish-pm7)."""
    try:
        original = base_source.assemble()
    except ValueError as exc:
        raise BuildError(str(exc)) from exc
    text = original.decode('utf-8')

    # 0. The Settings fork replaces the historical T50 bands in the live shell sources.
    text, SETTINGS_NOTES['layer'] = settings_layer.apply(text, need)

    # 2b. Usage precedes the O55 splice, so the Usage layer never sees O55 modules.
    text, SETTINGS_NOTES['usage'] = usage_layer.apply(text, need)

    # 3. Splice the O55 modules.
    css = settings_layer.inline_fonts(read_parts(SRC / 'css', '.css'), SRC / 'fonts')
    js = read_parts(SRC / 'js', '.js')
    copy = json.dumps(copy_json(), ensure_ascii=False, separators=(',', ':'))
    head_block = f'<!-- O55:CSS:START -->\n<style id="pm-o55-css">\n{css}\n</style>\n<!-- O55:CSS:END -->\n'
    text = replace_once(text, '</head>', head_block + '</head>', 'head css splice')
    body_block = (f'<!-- O55:BODY:START -->\n<script id="pm-o55-js">\n'
                  f'window.O55_COPY={copy};\n{js}\n</script>\n<!-- O55:BODY:END -->')
    text = text.replace('<!-- O55:BODY:START -->\n<!-- O55:BODY:END -->', body_block, 1)
    text = re.sub(r'<title>.*?</title>', f'<title>{PAGE_TITLE}</title>', text, count=1, flags=re.S)
    # 4. The left rail: concept D (Polish) from Concepts/leftrail-redesign, a skin over the shell's own rail panels
    #    (its CSS, its script and data-rail-* on the <html> tag); the review copy with concepts A-C is build_rail.py.
    text, SETTINGS_NOTES['rail'] = _rail().apply_published(text, need)
    # 5. The glyph system (Concepts/glyph-system, Jared's D44): the 5.6 Pro neon renderer, the PMG registry and the PM7
    #    bridge in the head, so every surface can draw PMG.icon / PMG.status; nothing changes until a surface adopts it.
    text, SETTINGS_NOTES['glyphs'] = _glyphs().apply_published(text, need)
    # 6. Home: the universal panel system and the terminal tab kind from Concepts/home-redesign (D28: after Usage and the
    #    rail). home_layer.apply() adds the early script and its CSS between HOME:CSS markers before </head>, the panels
    #    and the terminal between HOME:BODY markers before </body>, plus guarded app JS patches. Its three NieR lists
    #    are registry contributions, emitted below; it anchors after the O55 and rail blocks, so it runs after them.
    text, SETTINGS_NOTES['home'] = _home().apply(text, need)
    # 6. Liquid Glass and the wallpapers (Glass's publish: the coordinator's plan of 2026-10-14, go 2026-10-15, after the
    #    final review approved Glass round 3). Glass's layer (Concepts/liquid-glass/opus-5.5: glass.css with its prints,
    #    glass.js) and then the wallpapers package's (Concepts/wallpapers/opus-5.5: every look's prints, the catalog, the
    #    Settings gallery) go over the whole page, last, each exactly once: Glass's style before </head> and script
    #    before </body>, then the wallpapers' after them. Both are gated on their own state (html[data-lg] and a Glass
    #    look; html[data-lg-wall]), so every other look draws what it drew before.
    for folder, module in (('liquid-glass', 'build_proto'), ('wallpapers', 'build_walls')):
        layer = _layer(folder, module)
        try:
            injected = layer.inject(text)
        except layer.LayerError as exc:
            raise BuildError(f'{folder} layer: {exc}') from exc
        text = injected[0] if isinstance(injected, tuple) else injected
    text = emit_nier_lists(text, need)
    # Preserve the historical publication note byte for byte. Live edit locations are documented above.
    note = ('<!-- TestOpus5.5PmConcept (Opus 5.5): TestPMConcept.html with a rebuilt Product Onboarding and Guided Tour. '
            'Built by Concepts/onboarding/opus-5.5/tools/build.py; never hand-edit. -->\n')
    # 7. T2 (P1000 speed team): the 13 '<compound with .active> *' rules made every .active toggle restyle the toggled
    #    element's whole subtree, so a page switch restyled the outgoing Home inside its layout. active_descendant_rewrite
    #    gives each a featured descendant (same matches today, same specificity) in the finished page.
    text, SETTINGS_NOTES['active_descendants'] = active_descendant_rewrite.apply(text, True, need)
    # 7. Selector bucketing (P1000 speed team, T7): a rule whose subject is only a multi-argument :is()/:where() has no
    #    id, class, attribute or tag for the browser to file it under, so every whole-page restyle (a look or NieR
    #    switch) matches it against every element. css_bucket_split splits that one :is()/:where() into single-argument
    #    parts with the same matches and the same specificity, in every <style> block, last, so every layer is covered.
    unsplit = note + text
    built, SETTINGS_NOTES['bucket_split'] = css_bucket_split.apply(unsplit)
    UNSPLIT.clear()
    UNSPLIT[built] = unsplit
    return built


INERT_SOURCES = TOOLS / 'inert_sources.json'
PAGE_LINT_BASELINE = TOOLS / 'page_lint_baseline.json'
PAGE_LINT_KEYS = ('page_wide_star', 'html_rooted_has', 'important')


def built_stylesheets(html: str) -> list[tuple[str, str]]:
    """Every <style> body in the built page, named by its id or by style@offset."""
    sheets = []
    for match in re.finditer(r'<style\b([^>]*)>(.*?)</style>', html, re.S | re.I):
        attrs, body = match.group(1), match.group(2)
        named = re.search(r'\bid="([^"]+)"', attrs)
        sheets.append((named.group(1) if named else f'style@{match.start()}', body))
    return sheets


def page_lint_counts(html: str) -> dict[str, int]:
    """Whole-page counts of the three debts the O55 source lint already knows about.

    page_wide_star: selectors whose last compound is a bare `*` and that switch on a runtime
    state other than a look change (PAGE_STATE_OK). html_rooted_has: selectors whose first
    compound is html and that use :has(). important: `!important` in stylesheets, comments removed.
    """
    star = has = important = 0
    for _name, body in built_stylesheets(html):
        for _line, sel in css_selectors(body):
            names = page_wide_universal(sel)
            if names and any(name not in PAGE_STATE_OK for name in names):
                star += 1
            comps = compounds(sel)
            if comps and re.match(r'html(?![\w-])', comps[0]) and ':has(' in sel:
                has += 1
        important += re.sub(r'/\*[\s\S]*?\*/', '', body).count('!important')
    return {'page_wide_star': star, 'html_rooted_has': has, 'important': important}


def page_lint_growth(actual: dict[str, int], allowed: dict[str, int]) -> list[str]:
    """Fail only when a recorded count grows. A shrink stays allowed until the baseline is updated."""
    labels = {
        'page_wide_star': 'page-wide * selectors',
        'html_rooted_has': 'html-rooted :has() selectors',
        'important': '!important',
    }
    problems = []
    for key in PAGE_LINT_KEYS:
        if actual[key] > allowed[key]:
            problems.append(f'page lint ratchet: {labels[key]} grew from {allowed[key]} to {actual[key]}')
    return problems


def page_lint_ratchet(html: str) -> list[str]:
    if not PAGE_LINT_BASELINE.is_file():
        return [f'page lint ratchet: baseline missing: {PAGE_LINT_BASELINE.relative_to(CONCEPTS.parent)}']
    allowed = json.loads(PAGE_LINT_BASELINE.read_text(encoding='utf-8')).get('counts', {})
    missing = [key for key in PAGE_LINT_KEYS if key not in allowed]
    if missing:
        return [f'page lint ratchet: baseline has no count for {", ".join(missing)}']
    return page_lint_growth(page_lint_counts(html), {key: int(allowed[key]) for key in PAGE_LINT_KEYS})


def warn_inert_sources() -> None:
    """Warn when a frozen pm7-tools source or pm6-build part differs from the recorded copy.

    Those files no longer feed PMConcept7. A difference is a WARNING, not a failed check:
    edit the live source scripts/pm7-where.py names, and leave these files alone.
    """
    if not INERT_SOURCES.is_file():
        print(f'WARNING: inert source manifest missing: {INERT_SOURCES.relative_to(CONCEPTS.parent)}', file=sys.stderr)
        return
    recorded = json.loads(INERT_SOURCES.read_text(encoding='utf-8')).get('files', {})
    repo = CONCEPTS.parent
    for rel in sorted(recorded):
        path = repo / rel
        if not path.is_file():
            print(f'WARNING: inert source missing (no longer feeds PMConcept7; use scripts/pm7-where.py): {rel}',
                  file=sys.stderr)
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != recorded[rel]:
            print(f'WARNING: inert source changed (no longer feeds PMConcept7; use scripts/pm7-where.py): {rel}',
                  file=sys.stderr)


def lint_liquid_glass_slots() -> list[str]:
    """Every LG fragment must have content and exactly one authored CSS marker."""
    slots = base_source.LG_SLOTS.resolve()
    references = {}
    problems = []
    for path in sorted(CONCEPTS.rglob('*.css')):
        if path.is_relative_to(slots) or b'@pm7-lg-slot' not in path.read_bytes():
            continue
        text = base_source.read_source(path).decode('utf-8')
        for match in base_source.CSS_SLOT.finditer(text):
            target = (slots / match.group(1)).resolve()
            if not target.is_relative_to(slots):
                problems.append(f'{path}: Liquid Glass slot outside package: {match.group(1)}')
                continue
            line = text.count('\n', 0, match.start()) + 1
            references.setdefault(target, []).append(f'{path}:{line}')
        if '@pm7-lg-slot' in base_source.CSS_SLOT.sub('', text):
            problems.append(f'{path}: malformed Liquid Glass slot')
    for path in sorted(slots.rglob('*.css')):
        if not base_source.read_source(path).strip():
            problems.append(f'{path}: empty Liquid Glass slot fragment')
        uses = references.pop(path.resolve(), [])
        if len(uses) != 1:
            problems.append(f'{path}: Liquid Glass slot referenced {len(uses)} times (need exactly 1)' +
                            (f': {", ".join(uses)}' if uses else ''))
    for target, uses in references.items():
        problems.append(f'{target}: missing Liquid Glass slot fragment: {", ".join(uses)}')
    return problems


def check(built: str) -> list[str]:
    warn_inert_sources()
    problems = (lint_liquid_glass_slots() + lint_sources() + syntax_check(built) + _rail().published_problems(built)
                + _glyphs().published_problems(built) + _home().published_problems(built))
    for removed in dict.fromkeys(['id="pm7-onboarding"', 'id="pm7-guided-tour"', 'pm7-onboarding-js', 'pm7-guided-tour-js',
                                  'pm7-onboarding-css', 'pm7-guided-tour-css', 'id="pm7-settings-data"',
                                  "'.pm7gt-callout", ".closest('.pm7gt')",
                                  "getElementById('pm7-onboarding')", "getElementById('pm7-guided-tour')",
                                  'id="pm7UsageApp"', 'pm7-t31-usage-final', 'pm7-t24-usage-readability-and-fit']
                                 + usage_layer.REMOVED):
        if removed in built:
            problems.append(f'removed reference still present: {removed}')
    for kept in usage_layer.KEPT:
        if kept not in built:
            problems.append(f'kept reference missing: {kept}')
    for marker in ['<!-- O55:CSS:START -->', '<!-- O55:CSS:END -->', '<!-- O55:BODY:START -->', '<!-- O55:BODY:END -->',
                   '<!-- USAGE:BODY:START -->', '<!-- USAGE:BODY:END -->']:
        if built.count(marker) != 1:
            problems.append(f'marker {marker} appears {built.count(marker)} times')
    expected = built.encode('utf-8')
    if not TARGET.exists():
        problems.append('Concepts/PMConcept7.html is missing; run build.py --publish-pm7')
    elif TARGET.read_bytes() != expected:
        problems.append('Concepts/PMConcept7.html differs from a fresh build; run build.py --publish-pm7')
    unsplit = UNSPLIT.get(built)
    if unsplit is None:
        problems.append('page lint ratchet: no page from before step 7 for this build (build_text() must run first)')
    else:
        problems.extend(page_lint_ratchet(unsplit))
    return problems


def syntax_check(built: str) -> list[str]:
    """node --check the scripts this package writes (the Settings engine with its managers, the O55 module, and the
    Usage page's pm-usage-js from Concepts/usage-redesign, which must be there exactly once), the
    head boot script and pm6-js-globals, now authored in base/script/ along with the PMH switch-off and next-frame
    readers: malformed source there must fail at build time."""
    import subprocess
    import tempfile
    out = []
    for sid in ('pm4-settings-js', 'pm-o55-js', 'pm6 boot', 'pm6-js-globals'):
        if sid == 'pm6 boot':  # base/script/script-001.js (the head boot script without an id)
            m = re.search(r'<script>(\s*/\* pm6 boot: .*?)</script>', built, re.S)
        else:
            m = re.search(r'<script\b[^>]*\bid="' + sid + r'"[^>]*>(.*?)</script>', built, re.S)
        if not m:
            out.append(f'script {sid} missing')
            continue
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as fh:
            fh.write(m.group(1))
            path = fh.name
        r = subprocess.run(['node', '--check', path], capture_output=True, text=True)
        Path(path).unlink(missing_ok=True)
        if r.returncode:
            out.append(f'syntax error in {sid}: ' + ' | '.join(r.stderr.strip().splitlines()[-4:])[:600])
    out.extend(usage_layer.syntax_check(built))
    return out


def main() -> int:
    unknown = [a for a in sys.argv[1:] if a.startswith('--') and a not in ('--check', '--publish-pm7', '--out')]
    if unknown:
        print(f"unknown option(s): {' '.join(unknown)} (the --no-usage and --no-home private reference builds were "
              'retired on 2026-10-18)', file=sys.stderr)
        return 2
    try:
        built = build_text()
    except BuildError as exc:
        print(f'BUILD FAILED: {exc}', file=sys.stderr)
        return 2
    if '--check' in sys.argv:
        problems = check(built)
        for p in problems:
            print('CHECK:', p)
        print('check', 'ok' if not problems else f'failed ({len(problems)})')
        return 0 if not problems else 1
    problems = (lint_sources() + syntax_check(built) + _rail().published_problems(built) + _glyphs().published_problems(built)
                + _home().published_problems(built))
    if problems:
        for p in problems:
            print('LINT:', p)
        return 1
    if '--out' in sys.argv:
        # a private build (parallel workers, screenshots): writes only the given path, never the published page
        i = sys.argv.index('--out')
        out = Path(sys.argv[i + 1]).expanduser().resolve() if i + 1 < len(sys.argv) else None
        if out is None or out == TARGET.resolve() or '--publish-pm7' in sys.argv:
            print('--out needs a private path (not PMConcept7.html) and no --publish-pm7', file=sys.stderr)
            return 2
        out.parent.mkdir(parents=True, exist_ok=True)
        tmp = out.with_name(out.name + '.tmp')
        data = built.encode('utf-8')
        tmp.write_bytes(data)
        tmp.replace(out)
        print(json.dumps({'output': str(out), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()[:16]}))
        return 0
    data = built.encode('utf-8')
    TARGET.write_bytes(data)
    summary = {'output': str(TARGET.relative_to(CONCEPTS.parent)), 'bytes': len(data),
               'sha256': hashlib.sha256(data).hexdigest()[:16],
               'base_sha256': hashlib.sha256(base_source.assemble()).hexdigest()[:16]}
    if '--publish-pm7' in sys.argv:
        summary['pm7_output'] = str(TARGET.relative_to(CONCEPTS.parent))
        summary['pm7_bytes'] = len(data)
        summary['pm7_sha256'] = hashlib.sha256(data).hexdigest()
    print(json.dumps(summary))
    return 0


if __name__ == '__main__':
    sys.exit(main())
