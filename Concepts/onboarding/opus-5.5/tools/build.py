#!/usr/bin/env python3
"""Build Concepts/Onboarding concepts/TestOpus5.5PmConcept.html from the pinned TestPMConcept.html beside it plus ./src (onboarding, tour, Settings).

Usage:
  python3 Concepts/onboarding/opus-5.5/tools/build.py          # build TestOpus only
  python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7  # build, then publish the exact bytes as Concepts/PMConcept7.html
  python3 Concepts/onboarding/opus-5.5/tools/build.py --out /tmp/x.html  # private build: lint, then write only that path
  python3 Concepts/onboarding/opus-5.5/tools/build.py --check  # verify the built file is current, every guard holds, and PMConcept7.html is byte-identical

The base file is read-only. The legacy Product Onboarding and Guided Tour blocks are removed, the O55 modules are
spliced between <!-- O55:*:START/END --> markers, and a short list of guarded, exactly-once patches re-point the shell's
few remaining references (hover-tag overlay ids, labels, Doctor quiet actions, Teacher persona, owner exposures).
Concepts/PMConcept7.html is published only from here (2026-09-26 user direction): --publish-pm7 writes the same built
bytes to both outputs, and --check fails while PMConcept7.html is missing or differs by even one byte.
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

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
CONCEPTS = PKG.parents[1]
SOURCE = CONCEPTS / 'Onboarding concepts' / 'TestPMConcept.html'
TARGET = CONCEPTS / 'Onboarding concepts' / 'TestOpus5.5PmConcept.html'
PM7_TARGET = CONCEPTS / 'PMConcept7.html'
SRC = PKG / 'src'
BASE_SHA256 = 'b3888fad4993f484ab4548e9ff212ec0042fa0a912947a7f316514db939326be'

EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿⬀-⯿️]')
BANNED_COPY = re.compile(r'\b(repository|repositories|forge|runtime|adapter|endpoint|execution host|credential profile|'
                         r'unleash|supercharge|ai magic|shell)\b', re.I)


class BuildError(RuntimeError):
    pass


def need(cond: bool, message: str) -> None:
    if not cond:
        raise BuildError(message)


def remove_block(text: str, tag: str, element_id: str) -> str:
    """Remove <tag id=element_id>...</tag> exactly once (style/script: no nesting)."""
    rx = re.compile(r'<' + tag + r'\b[^>]*\bid="' + re.escape(element_id) + r'"[^>]*>[\s\S]*?</' + tag + r'>\n?')
    text, n = rx.subn('', text, count=1)
    need(n == 1, f'expected exactly one <{tag} id="{element_id}">')
    return text


def remove_element(text: str, element_id: str) -> str:
    """Remove a balanced element by id (handles nesting of the same tag)."""
    m = re.search(r'<(?P<tag>[\w-]+)\b[^>]*\bid="' + re.escape(element_id) + r'"[^>]*>', text)
    need(m is not None, f'missing element #{element_id}')
    tag, depth = m.group('tag'), 1
    for item in re.finditer(r'</?' + re.escape(tag) + r'\b[^>]*>', text[m.end():], re.I):
        depth += -1 if item.group().startswith('</') else 1
        if depth == 0:
            end = m.end() + item.end()
            if text[end:end + 1] == '\n':
                end += 1
            return text[:m.start()] + text[end:]
    raise BuildError(f'unclosed element #{element_id}')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    need(count == 1, f'patch "{label}": anchor found {count} times (need exactly 1)')
    return text.replace(old, new, 1)


def read_parts(folder: Path, suffix: str) -> str:
    files = sorted(p for p in folder.rglob(f'*{suffix}') if p.is_file())
    out = []
    for p in files:
        body = p.read_text(encoding='utf-8')
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
    ('src/css/10-window.css', 'html[data-o55-open] body > [inert] *'):
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


def lint_sources() -> list[str]:
    problems = []
    for p in sorted(SRC.rglob('*')):
        if not p.is_file() or p.suffix in BINARY_SUFFIXES:
            continue
        text = p.read_text(encoding='utf-8')
        if EMOJI.search(text):
            problems.append(f'emoji glyph in {p.relative_to(PKG)}')
        if p.suffix == '.css':
            # A :has() whose subject is html/body/:root makes every DOM insertion restyle the whole ~17k-node document
            # (measured ~90 ms each); that is what made Settings lag. Settings styles use no :has() at all.
            for m in re.finditer(r'(?:^|[\s,}])(?:html|body|:root)\b[^{},]*:has\(', text):
                problems.append(f'page-wide :has() in {p.relative_to(PKG)}: {m.group(0).strip()[:80]}')
            if 'settings' in p.relative_to(SRC).parts and ':has(' in text:
                problems.append(f':has() in Settings styles {p.relative_to(PKG)}')
            for m in re.finditer(r'border-(?:left|inline-start)\s*:\s*([^;]+);', text):
                width = re.search(r'(\d+(?:\.\d+)?)px', m.group(1))
                if width and float(width.group(1)) >= 2:
                    problems.append(f'left accent border in {p.relative_to(PKG)}: {m.group(0)}')
            notes: list[str] = []
            problems.extend(lint_page_wide_universal(p.relative_to(PKG).as_posix(), text, notes))
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
    problems.extend(settings_layer.shared_font_drift(SRC / 'fonts'))
    # The scene SVGs are drawn by nier_scene_art.py and composed into kit.d/21-nier-scenes.js by nier_scenes.py.
    if nier_scene_art.main(['--check']) != 0:
        problems.append('NieR scene SVGs are stale; run tools/nier_scene_art.py --write')
    if nier_scenes.main(['--check']) != 0:
        problems.append('kit.d/21-nier-scenes.js is stale; run tools/nier_scenes.py --write')
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


PATCHES = [
    # Hover-tag layer: recognise the new overlay roots instead of the removed pm7 ones.
    ("function activeOverlay(){var tour=document.getElementById('pm7-guided-tour'),onboarding=document.getElementById('pm7-onboarding');",
     "function activeOverlay(){var tour=document.getElementById('pm-o55-tour'),onboarding=document.getElementById('pm-o55-onboarding');",
     'hover-tag activeOverlay'),
    ("function isProductOverlayRoot(el){return !!(el&&el.nodeType===1&&(el.id==='pm7-guided-tour'||el.id==='pm7-onboarding'));}",
     "function isProductOverlayRoot(el){return !!(el&&el.nodeType===1&&(el.id==='pm-o55-tour'||el.id==='pm-o55-onboarding'));}",
     'hover-tag isProductOverlayRoot'),
    ("added.querySelector('#pm7-guided-tour[data-open=\"true\"],#pm7-onboarding[data-open=\"true\"]')",
     "added.querySelector('#pm-o55-tour[data-open=\"true\"],#pm-o55-onboarding[data-open=\"true\"]')",
     'hover-tag overlayTransitionRoot'),
    ("this.active.closest('.pm7gt-callout,.pm7ob-window')",
     "this.active.closest('.o55t-callout,.o55-win')",
     'hover-tag teaching panel'),
    ("el.closest('.pm7gt')?'Shows where you are in this tour.'",
     "el.closest('.o55t-root')?'Shows where you are in this tour.'",
     'hover-tag tour status'),
    # Labels: Run Onboarding Again / Replay Guided Tour, separate from Doctor.
    ('<span>Run setup wizard</span>', '<span>Run Onboarding Again</span>', 'home menu label'),
    ('<span class="setup-label">Run setup wizard</span><span class="setup-meta">Start or replay the simple guided setup</span>',
     '<span class="setup-label">Run Onboarding Again</span><span class="setup-meta">Go through the first-time setup again</span>',
     'settings essential setup: onboarding row'),
    ('<span class="setup-label">Guided Tour</span><span class="setup-meta">Learn the live workspace with a local teacher</span>',
     '<span class="setup-label">Replay Guided Tour</span><span class="setup-meta">Try the main actions again with a local example</span>',
     'settings essential setup: tour row'),
    ("'settings.onboarding.run_again':['Run setup again','Review your setup choices from the beginning.']",
     "'settings.onboarding.run_again':['Run Onboarding Again','Go through the first-time setup again.']",
     'hover label settings.onboarding.run_again'),
    ("'run-onboarding':['Run setup again','Review your setup choices from the beginning.']",
     "'run-onboarding':['Run Onboarding Again','Go through the first-time setup again.']",
     'hover label run-onboarding'),
    ("return ['Run setup again','Review your setup choices from the beginning.'];",
     "return ['Run Onboarding Again','Go through the first-time setup again.'];",
     'hover label onboarding signal'),
    ("'ui.guided_tour.finish':['Finish tour','Keep Teacher on the right and return to your work.']",
     "'ui.guided_tour.finish':['Finish tour','End the tour and open Planning Wizard.']",
     'hover label tour finish'),
    # Doctor stays findings-only: the replay actions move out of its quiet row.
    ("      { label: 'Replay setup', action: 'replay-onboarding', data: { 'ui-action-id': 'settings.onboarding.run_again', 'source-surface': 'settings_rerun' } },\n"
     "      { label: 'Guided Tour', action: 'start-guided-tour', data: { 'ui-action-id': 'settings.guided_tour.replay' } },\n",
     '', 'doctor quiet actions'),
    # Settings lag: with this rule's universal subject, every DOM insertion anywhere restyled the whole document
    # (~90 ms each; the hover-tag layer inserts one description per control it binds, so scrolling and index jumps in
    # Settings ran at 2-6 fps). The :has() is implied by the descendant part; the doubled class keeps (0,3,0).
    (".pm7u-card:has(.pm7u-setup-cta) .pm7u-setup-cta > * {",
     ".pm7u-card .pm7u-setup-cta.pm7u-setup-cta > * {",
     'usage card cta :has restyle'),
    # Notification sounds: a built-in sound may carry its own recipe (sound.tones), so the library can hold more,
    # and more varied, sounds than the name-matched demo tones. A note may glide to a second pitch and set its level.
    ("    const profileFor = sound => {\n      const key = `${sound && sound.id || ''} ${sound && sound.name || ''}`.toLowerCase();",
     "    const profileFor = sound => {\n      if (sound && Array.isArray(sound.tones) && sound.tones.length) return sound.tones;\n      const key = `${sound && sound.id || ''} ${sound && sound.name || ''}`.toLowerCase();",
     'sound recipe from the sound'),
    ("        for (const [frequency, offset, length, type] of profileFor(sound)) {",
     "        for (const [frequency, offset, length, type, glideTo, level] of profileFor(sound)) {",
     'sound recipe note fields'),
    ("          oscillator.frequency.setValueAtTime(frequency, noteStart);\n          envelope.gain.setValueAtTime(.0001, noteStart);\n          envelope.gain.exponentialRampToValueAtTime(.42, noteStart + Math.min(.025, duration * .04));",
     "          oscillator.frequency.setValueAtTime(frequency, noteStart);\n          if (glideTo) oscillator.frequency.exponentialRampToValueAtTime(glideTo, noteEnd);\n          envelope.gain.setValueAtTime(.0001, noteStart);\n          envelope.gain.exponentialRampToValueAtTime(level || .42, noteStart + Math.min(.025, duration * .04));",
     'sound recipe glide and level'),
    # The Settings rail and Home count the real AI services (the list grew from 13 to 22 and each one's state is
    # live), not a fixed "7 ready · 2 need attention". Providers & Accounts defines window.O55ProviderSummary.
    ("<strong>AI Providers</strong><small>7 ready · 2 need attention</small>",
     "<strong>AI Providers</strong><small>${window.O55ProviderSummary ? window.O55ProviderSummary() : ''}</small>",
     'settings rail provider count'),
    ('<span class="setup-meta">7 ready · 2 need attention · install, sign in, choose models</span>',
     '<span class="setup-meta">${window.O55ProviderSummary ? window.O55ProviderSummary() + \' · \' : \'\'}install, sign in, choose models</span>',
     'settings home provider count'),
    # Teacher is a real persona in the Assistant Chat guide picker.
    ("var PERSONA_CATALOG = ['Product Manager', 'Architect Reviewer', 'Rust Engineer'];",
     "var PERSONA_CATALOG = ['Product Manager', 'Architect Reviewer', 'Rust Engineer', 'Teacher'];",
     'teacher persona'),
    # Setup and tour previews stop on the same events as the built-in tone preview. That player is frozen, so these
    # call the hook the notifications manager exposes (window.PM51_NOTIF_APP_PREVIEW_STOP), which calls
    # O55.sound.stopPreview(). The close line stays a prefix of SETTINGS_ANCHOR so the exposure splice still matches.
    ("settingsSoundPreview.stop('settings-surface-close');hideTooltip();",
     "settingsSoundPreview.stop('settings-surface-close');if(typeof window.PM51_NOTIF_APP_PREVIEW_STOP==='function')window.PM51_NOTIF_APP_PREVIEW_STOP();hideTooltip();",
     'setup sound preview: settings close'),
    ("case 'notification-tab': settingsSoundPreview.stop('notification-tab');switchManagerTab(el);return;",
     "case 'notification-tab': settingsSoundPreview.stop('notification-tab');if(typeof window.PM51_NOTIF_APP_PREVIEW_STOP==='function')window.PM51_NOTIF_APP_PREVIEW_STOP();switchManagerTab(el);return;",
     'setup sound preview: notification tab'),
    ("clearFiles: () => { stop('project-changed'); localFiles.clear(); },",
     "clearFiles: () => { stop('project-changed'); if(typeof window.PM51_NOTIF_APP_PREVIEW_STOP==='function')window.PM51_NOTIF_APP_PREVIEW_STOP(); localFiles.clear(); },",
     'setup sound preview: project change'),
    # Reduced Motion used to give every element a 0.01 ms transition. A theme repaint then started a transition for
    # every themed property on every element (films M4: ticking NieR in the window froze the page for 15-19 s). None
    # means a property change is just a paint. Animations stay at one instant frame so animationend still runs.
    # transitionend listeners in the base page were checked: the ones that must finish already do, via motionReduced()
    # (which includes this media query) or a timeout. The home FLIP returns before it listens when motion is reduced.
    ("    @media (prefers-reduced-motion: reduce) {\n"
     "      *, *::before, *::after {\n"
     "        animation-duration: .01ms !important;\n"
     "        animation-iteration-count: 1 !important;\n"
     "        transition-duration: .01ms !important;\n"
     "        scroll-behavior: auto !important;\n"
     "      }\n"
     "      #glass-bg * { animation: none !important; }\n"
     "    }\n"
     "    [data-motion=\"reduced\"] *,\n"
     "    [data-motion=\"reduced\"] *::before,\n"
     "    [data-motion=\"reduced\"] *::after {\n"
     "      animation-duration: .01ms !important;\n"
     "      animation-iteration-count: 1 !important;\n"
     "      transition-duration: .01ms !important;\n"
     "      scroll-behavior: auto !important;\n"
     "    }",
     "    @media (prefers-reduced-motion: reduce) {\n"
     "      *, *::before, *::after {\n"
     "        animation-duration: .01ms !important;\n"
     "        animation-iteration-count: 1 !important;\n"
     "        transition: none !important;\n"
     "        scroll-behavior: auto !important;\n"
     "      }\n"
     "      #glass-bg * { animation: none !important; }\n"
     "    }\n"
     "    [data-motion=\"reduced\"] *,\n"
     "    [data-motion=\"reduced\"] *::before,\n"
     "    [data-motion=\"reduced\"] *::after {\n"
     "      animation-duration: .01ms !important;\n"
     "      animation-iteration-count: 1 !important;\n"
     "      transition: none !important;\n"
     "      scroll-behavior: auto !important;\n"
     "    }",
     'reduced motion: no transitions'),
]


def nier_paint(var: str) -> str:
    """The family to paint for a chosen `var`: window.PM_THEME_PAINT_FAMILY(var) when the hook is present and answers a
    real family, else `var` itself (the hook never decides alone: a throw or an unknown answer paints the choice)."""
    return ("(function(f){try{var p=typeof window.PM_THEME_PAINT_FAMILY==='function'?window.PM_THEME_PAINT_FAMILY(f):f;"
            "return /^(friendly|glass|retro|basic)$/.test(p)?p:f;}catch(e){return f;}})(" + var + ")")


# NieR Mode (src/settings/kit.d/18-nier.js) is a hidden theme painted over the Basic family. The paint hook
# window.PM_THEME_PAINT_FAMILY(family) answers the family to paint: 'basic' while NieR Mode is on, the family itself
# while it is off. PM_THEME's themeState keeps the chosen family and mode, so turning NieR Mode off paints exactly what
# was chosen. Every writer of <html data-theme> that can run while NieR Mode is on goes through the hook:
#   - PM_THEME.themeApply (setFamily / setMode / set, the Auto scheme listener, the boot adoption in wireTheme);
#   - the legacy #themeSelect change bridge, which copies the menu's chosen slug back onto <html>;
#   - PM7_SETTINGS_TOME.applyPaint (its slug and its no-PM_THEME fallback). Its repaint test compared <html> with the
#     chosen slug, which under NieR Mode differs on every save, and never noticed a themeState left behind by the
#     boot adoption; it now compares the painted slug and the chosen family.
# The head boot script only ever writes basic-<scheme> (its family is the literal 'basic'), so it needs no hook.
# PM_THEME_PAINT_LABEL() names the painted look in the title-bar menu ('' while NieR Mode is off).
NIER_PATCHES = [
    ("    var slug = family + '-' + themeResolveScheme(mode);\n    var prev = document.documentElement.getAttribute('data-theme');",
     "    var slug = " + nier_paint('family') + " + '-' + themeResolveScheme(mode);\n"
     "    var prev = document.documentElement.getAttribute('data-theme');",
     'nier paint hook: themeApply'),
    ("      var title = 'Theme: ' + PM_THEME_FAMILIES[family] +\n        (mode === 'auto' ? ' (Auto)' : ' (' + PM_THEME_SLUGS[slug] + ')');",
     "      var paintLabel = typeof window.PM_THEME_PAINT_LABEL === 'function' ? window.PM_THEME_PAINT_LABEL() : '';\n"
     "      var title = paintLabel ? 'Theme: ' + paintLabel + (mode === 'auto' ? ' (Auto)' : ' (' + (scheme === 'light' ? 'Light' : 'Dark') + ')') :\n"
     "        'Theme: ' + PM_THEME_FAMILIES[family] +\n        (mode === 'auto' ? ' (Auto)' : ' (' + PM_THEME_SLUGS[slug] + ')');",
     'nier paint hook: theme menu title'),
    ("    if (label) label.textContent = PM_THEME_FAMILIES[family] || family;",
     "    if (label) label.textContent = (typeof window.PM_THEME_PAINT_LABEL === 'function' && window.PM_THEME_PAINT_LABEL()) || PM_THEME_FAMILIES[family] || family;",
     'nier paint hook: theme menu label'),
    ("              if (v) document.documentElement.setAttribute('data-theme', v);",
     "              var pm = /^([a-z]+)-(light|dark)$/.exec(v || '');\n"
     "              if (pm) v = " + nier_paint('pm[1]') + " + '-' + pm[2];\n"
     "              if (v) document.documentElement.setAttribute('data-theme', v);",
     'nier paint hook: legacy themeSelect bridge'),
    ("var slug=family+'-'+(mode==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode);",
     "var slug=" + nier_paint('family') + "+'-'+(mode==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode);",
     'nier paint hook: applyPaint slug'),
    ("if(themeKey!==lastPaintThemeKey||currentSlug!==slug){",
     "if(themeKey!==lastPaintThemeKey||currentSlug!==slug||(window.PM_THEME&&typeof window.PM_THEME.getFamily==='function'&&window.PM_THEME.getFamily()!==family)){",
     'nier paint hook: applyPaint repaint test'),
    # Pod 042 (the World part "Pod 042 in Chat", key pod042) joins the Assistant Chat persona picker after Teacher. It
    # shows only while NieR Mode and that part are on (styles.d/15-nier-world.css hides it otherwise), and
    # src/js/84-pod042-chat.js answers for it locally, as the Teacher adapter does, and hands the chat back.
    ("var PERSONA_CATALOG = ['Product Manager', 'Architect Reviewer', 'Rust Engineer', 'Teacher'];",
     "var PERSONA_CATALOG = ['Product Manager', 'Architect Reviewer', 'Rust Engineer', 'Teacher', 'Pod 042'];",
     'pod 042 persona'),
]

# Owner exposures (Astra precedent): hand the real owners to onboarding/tour without a second implementation.
SETTINGS_ANCHOR = "closeTransientUi:()=>{settingsSoundPreview.stop('settings-surface-close');"
SETTINGS_EXPOSE = r"""o55SettingsTransfer:(()=>{const pending=new Map();return {sources:()=>settingsCopySources(),categoryFor:(id)=>transferCategoryForId(id),categories:()=>{const s=new Set();const snap=Object.values(window.PM12_REFERENCE?.byCat||{}).flatMap(c=>c.settings||[]);for(const r of snap){if(!r||!r.id||TRANSFER_CREDENTIAL_IDS.has(r.id)||r.credential_ref_only)continue;const c=transferCategoryForId(r.id);if(c)s.add(c);}return [...s];},draftPreview:(sourceId,categories)=>{const snapshot=window.PM7_SETTINGS_TOME.projectSnapshot(sourceId);if(!snapshot?.settings)return {ok:false,reason:'This Project has no readable settings yet.'};const rows=Object.values(window.PM12_REFERENCE?.byCat||{}).flatMap(c=>c.settings||[]),canon=new Map(rows.map(r=>[r.id,r]));const pick=Array.isArray(categories)&&categories.length?new Set(categories):null,groups={},excluded=[];for(const [id,value] of Object.entries(snapshot.settings)){const row=canon.get(id);if(!row)continue;if(TRANSFER_CREDENTIAL_IDS.has(id)||row.credential_ref_only){excluded.push(id);continue;}const cat=transferCategoryForId(id);if(!cat||(pick&&!pick.has(cat)))continue;(groups[cat]=groups[cat]||[]).push({id,label:row.label||id,value});}return {ok:true,sourceId,groups,excludedCount:excluded.length,applied:false};},apply:(sourceId,categories,options)=>applyDetachedSettingsCopy(sourceId,categories,options||{}),applyPending:(sourceId,reservation,categories,options={})=>{
 if(window.PM_SETTINGS_REGISTRY)return {ok:false,reason:'The Settings owner has not supplied a current draft rebind and reserved-destination transaction.'};
 const dest=reservation?.destination_project_id,finalId=reservation?.fixture_project_id;
 if(!sourceId||!dest||!finalId||sourceId===dest||sourceId===finalId||!reservation.draft_ref||!Number.isInteger(reservation.draft_revision))return {ok:false,reason:'A distinct current draft reservation is required.'};
 const selection=transferSelection(categories);if(!selection.ok)return selection;
 const snapshot=window.PM7_SETTINGS_TOME.projectSnapshot(sourceId);if(!snapshot?.settings)return {ok:false,reason:'Source Settings unavailable.'};
 if(options.credentials==='Reference compatible saved accounts')return {ok:false,reason:'Saved account references require the Settings owner.'};
 const canon=new Map(Object.values(window.PM12_REFERENCE?.byCat||{}).flatMap(c=>c.settings||[]).map(r=>[r.id,r]));
 const values={},excluded=new Set(options.excludedSettings||[]),changes=[];
 for(const [id,value] of Object.entries(snapshot.settings)){
  const row=canon.get(id);if(!row||!selection.ids.has(id)||excluded.has(id)||TRANSFER_CREDENTIAL_IDS.has(id)||row.credential_ref_only)continue;
  if(JSON.stringify(value)===JSON.stringify(row.default))continue;
  const keep=options.conflicts==='Keep destination on conflicts';
  changes.push({id,decision:keep?'Keep destination':'Use source'});if(!keep)values[id]=JSON.parse(JSON.stringify(value));
 }
 const key=dest+'|'+reservation.draft_ref+'|'+reservation.draft_revision,receipt='fixture:settings-pending:'+key;
 pending.set(key,{dest,finalId,draft_ref:reservation.draft_ref,draft_revision:reservation.draft_revision,sourceId,sourceJson:JSON.stringify(snapshot.settings),values,receipt});
 return {ok:true,reservation_key:key,destination_project_id:dest,source_project_id:sourceId,draft_revision:reservation.draft_revision,count:Object.keys(values).length,receipt,fixtureMode:true,changes};
},
publishPending:(key,projectId,binding)=>{
 const staged=pending.get(key);if(!staged)return {ok:false,reason:'The pending Settings preview is no longer available.'};
 if(window.PM_SETTINGS_REGISTRY)return {ok:false,reason:'The Settings owner must rebind this draft before publication.'};
 if(projectId!==staged.finalId||binding?.draft_ref!==staged.draft_ref||binding?.draft_revision!==staged.draft_revision)return {ok:false,reason:'The listed Project does not match the pending draft reservation.'};
 const current=window.PM7_SETTINGS_TOME.projectSnapshot(staged.sourceId);
 if(!current?.settings||JSON.stringify(current.settings)!==staged.sourceJson)return {ok:false,reason:'Source Settings changed after preview.'};
 const snaps=window.PM_SETTINGS_PROJECT_SNAPSHOTS||{};
 if(Object.prototype.hasOwnProperty.call(snaps,projectId)||window.PM7_SETTINGS_TOME.project()?.id===projectId)return {ok:false,reason:'The reserved destination already exists.'};
 // The only public fixture write, after matching terminal Project evidence and before selection.
 window.PM_SETTINGS_PROJECT_SNAPSHOTS=snaps;
 snaps[projectId]={label:projectId,settings:JSON.parse(JSON.stringify(staged.values)),fixture:true,receipt_id:staged.receipt};
 pending.delete(key);return {ok:true,project_id:projectId,count:Object.keys(staged.values).length,receipt:staged.receipt,fixtureMode:true};
},
discardPending:(key)=>({ok:true,discarded:pending.delete(key)})};})(),"""
LAYOUT_ANCHOR = '    failNextPersistenceWrite: function () { faults.failNextWrite = true; },'
LAYOUT_EXPOSE = ('    o55RestoreSnapshot: function (snapshot) { var problem = validateLayout(snapshot); '
                 'if (problem) return { ok: false, reason: problem }; '
                 'var result = commitLayout(JSON.parse(JSON.stringify(snapshot)), "restore", "cmd.workspace.layout.restore", { source: "guided_tour_restore" }); '
                 'return { ok: result !== false, result: result }; },\n')


SETTINGS_NOTES: dict = {}


def build_text() -> str:
    original = SOURCE.read_bytes()
    need(hashlib.sha256(original).hexdigest() == BASE_SHA256,
         'TestPMConcept.html changed since the pin; review the strip boundaries and patches, then re-pin BASE_SHA256.')
    text = original.decode('utf-8')

    # 0. Settings: swap the base's T50 managers layer for the Opus 5.5 fork in src/settings.
    text, SETTINGS_NOTES['layer'] = settings_layer.apply(text, need)

    # 1. Strip the legacy Product Onboarding + Guided Tour.
    text = remove_block(text, 'style', 'pm7-onboarding-css')
    text = remove_block(text, 'style', 'pm7-guided-tour-css')
    text = remove_block(text, 'script', 'pm7-guided-tour-js')
    body_anchor = '<!-- PM7 Product Onboarding: simple cinematic guided setup -->'
    need(text.count(body_anchor) == 1, 'onboarding body anchor comment missing')
    text = text.replace(body_anchor, '<!-- O55:BODY:START -->\n<!-- O55:BODY:END -->', 1)
    for element_id in ['pm7-onboarding', 'pm7-onboarding-resume', 'pm7-guided-tour', 'pm7-guided-tour-resume',
                       'pm7-guided-tour-replay']:
        text = remove_element(text, element_id)
    text = remove_block(text, 'script', 'pm7-onboarding-js')
    tour_comment = '<!-- PM7 Guided Tour: deterministic real-shell teacher -->\n'
    if tour_comment in text:
        text = text.replace(tour_comment, '', 1)

    # 2. Guarded patches.
    for old, new, label in PATCHES + NIER_PATCHES:
        text = replace_once(text, old, new, label)
    text = replace_once(text, SETTINGS_ANCHOR, SETTINGS_EXPOSE + SETTINGS_ANCHOR, 'settings transfer exposure')
    text = replace_once(text, LAYOUT_ANCHOR, LAYOUT_EXPOSE + LAYOUT_ANCHOR, 'layout restore exposure')

    # 3. Splice the O55 modules.
    css = settings_layer.inline_fonts(read_parts(SRC / 'css', '.css'), SRC / 'fonts')
    js = read_parts(SRC / 'js', '.js')
    copy = json.dumps(copy_json(), ensure_ascii=False, separators=(',', ':'))
    head_block = f'<!-- O55:CSS:START -->\n<style id="pm-o55-css">\n{css}\n</style>\n<!-- O55:CSS:END -->\n'
    text = replace_once(text, '</head>', head_block + '</head>', 'head css splice')
    body_block = (f'<!-- O55:BODY:START -->\n<script id="pm-o55-js">\n'
                  f'window.O55_COPY={copy};\n{js}\n</script>\n<!-- O55:BODY:END -->')
    text = text.replace('<!-- O55:BODY:START -->\n<!-- O55:BODY:END -->', body_block, 1)
    text = re.sub(r'<title>.*?</title>', '<title>TestOpus5.5 · Puppet Master</title>', text, count=1, flags=re.S)
    note = ('<!-- TestOpus5.5PmConcept (Opus 5.5): TestPMConcept.html with a rebuilt Product Onboarding and Guided Tour. '
            'Built by Concepts/onboarding/opus-5.5/tools/build.py; never hand-edit. -->\n')
    return note + text


def check(built: str) -> list[str]:
    problems = lint_sources() + syntax_check(built)
    for removed in ['id="pm7-onboarding"', 'id="pm7-guided-tour"', 'pm7-onboarding-js', 'pm7-guided-tour-js',
                    'pm7-onboarding-css', 'pm7-guided-tour-css', "'.pm7gt-callout", ".closest('.pm7gt')",
                    "getElementById('pm7-onboarding')", "getElementById('pm7-guided-tour')"]:
        if removed in built:
            problems.append(f'removed reference still present: {removed}')
    for marker in ['<!-- O55:CSS:START -->', '<!-- O55:CSS:END -->', '<!-- O55:BODY:START -->', '<!-- O55:BODY:END -->']:
        if built.count(marker) != 1:
            problems.append(f'marker {marker} appears {built.count(marker)} times')
    expected = built.encode('utf-8')
    if not TARGET.exists():
        problems.append('Concepts/Onboarding concepts/TestOpus5.5PmConcept.html is missing; run build.py')
    elif TARGET.read_bytes() != expected:
        problems.append('Concepts/Onboarding concepts/TestOpus5.5PmConcept.html is stale; run build.py')
    if not PM7_TARGET.exists():
        problems.append('Concepts/PMConcept7.html is missing; run build.py --publish-pm7')
    elif PM7_TARGET.read_bytes() != expected:
        problems.append('Concepts/PMConcept7.html differs from a fresh build; run build.py --publish-pm7')
    return problems


def syntax_check(built: str) -> list[str]:
    """node --check the scripts this package writes (the Settings engine with its managers, and the O55 module)."""
    import subprocess
    import tempfile
    out = []
    for sid in ('pm4-settings-js', 'pm-o55-js'):
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
    return out


def main() -> int:
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
    problems = lint_sources() + syntax_check(built)
    if problems:
        for p in problems:
            print('LINT:', p)
        return 1
    if '--out' in sys.argv:
        # a private build (parallel workers, screenshots): writes only the given path, never either published output
        i = sys.argv.index('--out')
        out = Path(sys.argv[i + 1]).expanduser().resolve() if i + 1 < len(sys.argv) else None
        if out is None or out in (TARGET.resolve(), PM7_TARGET.resolve()) or '--publish-pm7' in sys.argv:
            print('--out needs a private path (not TestOpus5.5PmConcept.html or PMConcept7.html) and no --publish-pm7', file=sys.stderr)
            return 2
        out.parent.mkdir(parents=True, exist_ok=True)
        tmp = out.with_name(out.name + '.tmp')
        tmp.write_text(built, encoding='utf-8')
        tmp.replace(out)
        data = built.encode('utf-8')
        print(json.dumps({'output': str(out), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()[:16]}))
        return 0
    TARGET.write_text(built, encoding='utf-8')
    data = built.encode('utf-8')
    summary = {'output': str(TARGET.relative_to(CONCEPTS.parent)), 'bytes': len(data),
               'sha256': hashlib.sha256(data).hexdigest()[:16],
               'base_sha256': BASE_SHA256[:16]}
    if '--publish-pm7' in sys.argv:
        PM7_TARGET.write_text(built, encoding='utf-8')
        summary['pm7_output'] = str(PM7_TARGET.relative_to(CONCEPTS.parent))
        summary['pm7_bytes'] = len(data)
        summary['pm7_sha256'] = hashlib.sha256(data).hexdigest()
    print(json.dumps(summary))
    return 0


if __name__ == '__main__':
    sys.exit(main())
