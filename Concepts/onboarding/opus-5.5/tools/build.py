#!/usr/bin/env python3
"""Build Concepts/Onboarding concepts/TestOpus5.5PmConcept.html from the live ../base shell sources plus ./src (onboarding, tour, Settings).

Usage:
  python3 Concepts/onboarding/opus-5.5/tools/build.py          # build TestOpus only
  python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7  # build, then publish the exact bytes as Concepts/PMConcept7.html
  python3 Concepts/onboarding/opus-5.5/tools/build.py --out /tmp/x.html  # private build: lint, then write only that path
  python3 Concepts/onboarding/opus-5.5/tools/build.py --out /tmp/ref.html --no-usage  # private build without the Usage layer (a reference page)
  python3 Concepts/onboarding/opus-5.5/tools/build.py --out /tmp/ref.html --no-home   # private build without the Home layer (today's Home)
  python3 Concepts/onboarding/opus-5.5/tools/build.py --check  # verify the built file is current, every guard holds, and PMConcept7.html is byte-identical

The live base is assembled by tools/base_source.py from ../base/manifest.json and its source files.
The old TestPMConcept.html is history. During Phase 1 the assembled bytes retain its one-time split pin. The legacy Product Onboarding and Guided Tour blocks are removed, the O55 modules are
spliced between <!-- O55:*:START/END --> markers, and a short list of guarded, exactly-once patches re-point the shell's
few remaining references (hover-tag overlay ids, labels, Doctor quiet actions, Teacher persona, owner exposures).
The Usage page is the redesign in Concepts/usage-redesign: its usage_layer replaces the base's Prism Usage page at step 2b.
Home is the universal panel system and the terminal in Concepts/home-redesign: its home_layer runs at step 5. Liquid
Glass (Concepts/liquid-glass/opus-5.5) and then the wallpapers (Concepts/wallpapers/opus-5.5) go over the page last, at
step 6. Step 7 (tools/css_bucket_split.py) rewrites the finished page's selectors so the browser can bucket them; the
page lint reads the page from before that step.
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
import base_source
import active_descendant_rewrite
import css_bucket_split

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
CONCEPTS = PKG.parents[1]
SOURCE = base_source.BASE  # live shell sources; the former page is history
TARGET = CONCEPTS / 'Onboarding concepts' / 'TestOpus5.5PmConcept.html'
PM7_TARGET = CONCEPTS / 'PMConcept7.html'
SRC = PKG / 'src'

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


def shared_fitting_patch(text: str) -> str:
    """M1: fit visible rail content in place; keep the pinned ladder and pass order.

    The region hash is in addition to the pinned-input and exactly-once guards. Intrinsic probes for one
    dock strip / breakpoint row share a read phase; dependent controls still run in their original order.
    No hidden pane is exposed for measurement. Its activation schedules the same pre-paint fit callback.
    """
    start = text.index('    function overflows(el) {', text.index('(function pillFit()'))
    end = text.index('    var scheduled = null, pendingScope = null;', start)
    old = text[start:end]
    need(hashlib.sha256(old.encode()).hexdigest() ==
         '8c2dede5e1d6a51a01c0c5c52a793ab20fad515f7ef4e4eb92c91b20793221be',
         'M1: pinned shared fitter region drift')
    # Keep probes local to a single flex row: batching unrelated fit decisions would alter leftover-space fitting.
    a = old.index('    function preferredWidth(el) {')
    b = old.index('    function bannerCrowded(st) {', a)
    intrinsic = r'''    function fitStyle(el, name, value) {
      if (el.style[name] !== value) el.style[name] = value;
    }
    function preferredWidths(elements) {
      var saved = elements.map(function (el) {
        return { width: el.style.width, flex: el.style.flex, maxWidth: el.style.maxWidth, minWidth: el.style.minWidth };
      });
      elements.forEach(function (el) {
        fitStyle(el, 'width', 'auto'); fitStyle(el, 'flex', '0 0 auto');
        fitStyle(el, 'maxWidth', 'none'); fitStyle(el, 'minWidth', '0px');
      });
      var widths = elements.map(function (el) { return Math.ceil(el.scrollWidth); });
      elements.forEach(function (el, i) {
        Object.keys(saved[i]).forEach(function (name) { fitStyle(el, name, saved[i][name]); });
      });
      return widths;
    }
    function preferredWidth(el) { return el ? preferredWidths([el])[0] : 0; }
'''
    new = old[:a] + intrinsic + old[b:]
    new = replace_once(new, "      if (fit) el.setAttribute('data-fit', fit);\n      else el.removeAttribute('data-fit');\n      void el.offsetWidth;",
                       "      if (fit) { if (el.getAttribute('data-fit') !== fit) el.setAttribute('data-fit', fit); }\n"
                       "      else if (el.hasAttribute('data-fit')) el.removeAttribute('data-fit');",
                       'M1: equal fit writes and eager flush')
    new = replace_once(new, "      el.removeAttribute('data-stack');\n      void el.offsetWidth;",
                       "      if (el.hasAttribute('data-stack')) el.removeAttribute('data-stack');",
                       'M1: breakpoint reset')
    new = replace_once(new, "        need += preferredWidth(kids[i]);",
                       "        need += widths[i];", 'M1: breakpoint intrinsic reads')
    new = replace_once(new, "      var need = 0;\n      for (var i = 0; i < kids.length; i++) {",
                       "      var widths = preferredWidths(kids);\n      var need = 0;\n      for (var i = 0; i < kids.length; i++) {",
                       'M1: breakpoint intrinsic stage')
    new = replace_once(new, "      btn.style.width = '';\n      btn.style.minWidth = '';\n      btn.style.maxWidth = '';",
                       "      fitStyle(btn, 'width', '');\n      fitStyle(btn, 'minWidth', '');\n      fitStyle(btn, 'maxWidth', '');",
                       'M1: equal configuration sizing writes')
    a = new.index('      var worst = 0;\n', new.index('    function segtabCrushed(el) {'))
    b = new.index('      return worst > el.clientWidth / items.length + 1;', a)
    new = new[:a] + r'''      var probes = Array.prototype.slice.call(items);
      var spans = [], saved = [];
      probes.forEach(function (it) {
        Array.prototype.forEach.call(it.querySelectorAll('span'), function (s) {
          spans.push(s); saved.push(s.style.maxWidth); fitStyle(s, 'maxWidth', 'none');
        });
      });
      var widths = preferredWidths(probes);
      spans.forEach(function (s, i) { fitStyle(s, 'maxWidth', saved[i]); });
      var worst = Math.max.apply(Math, widths);
''' + new[b:]
    a = new.index('    function fitIn(root) {')
    new = new[:a] + r'''    var fittedInputs = new WeakMap(), fitFontEpoch = 0;
    function fitVisible(el) {
      return !el.closest('.side-panel-view:not(.active), [data-pane].pm-hidden') &&
        isFittable(el) && !!el.getClientRects().length;
    }
    function fitInput(el, slotBox) {
      var row = el.closest(ROW) || el.parentElement;
      var box = el.getBoundingClientRect(), cs = getComputedStyle(el);
      var view = el.closest('.side-panel-view'), pane = el.closest('[data-pane]');
      return JSON.stringify([
        document.documentElement.getAttribute('data-theme'), document.documentElement.getAttribute('data-o55-nier'),
        document.documentElement.getAttribute('data-o55-nier-parts'), document.documentElement.style.cssText,
        fitFontEpoch, window.devicePixelRatio, document.body.className, slot.className, slot.clientWidth, slotBox.width,
        view && view.id, pane && pane.getAttribute('data-pane'),
        el.className, el.style.cssText, el.getAttribute('data-fit'), el.getAttribute('data-stack'),
        el.getAttribute('data-narrow'), el.innerHTML,
        cs.fontFamily, cs.fontSize, cs.fontWeight, cs.letterSpacing,
        el.clientWidth, el.scrollWidth, box.width, box.left - slotBox.left,
        row && row.clientWidth, row && row.scrollWidth, row && row.innerHTML
      ]);
    }
    function run(scope) {
      if (!slotPageActive()) return;
      var root = scope && slot.contains(scope) ? scope : slot;
      var elements = Array.prototype.filter.call(root.querySelectorAll(SELECT), fitVisible);
      if (!elements.length) return;
      var slotBox = slot.getBoundingClientRect();
      var inputs = elements.map(function (el) { return fitInput(el, slotBox); });
      if (elements.every(function (el, i) { return fittedInputs.get(el) === inputs[i]; })) return;
      /* Preserve the original sequential dependencies and the complete second pass. All writes and reads below
         finish in this callback, before the pane's first paint; fitting never defers a newly shown label. */
      elements.forEach(function (w) {
        if (w.matches('.sh-cfgwrap')) { scrubCfgTrigger(w); setFit(w, 'full'); }
      });
      elements.forEach(fitOne);
      elements.filter(function (el) { return el.matches('.sh-launchrow'); }).forEach(fitOne);
      elements.filter(function (el) { return el.matches('.sh-cfgwrap, .sh-sesswrap, .sh-bpedit'); }).forEach(fitOne);
      slotBox = slot.getBoundingClientRect();
      elements.forEach(function (el) { fittedInputs.set(el, fitInput(el, slotBox)); });
    }
    if (document.fonts && document.fonts.addEventListener) {
      document.fonts.addEventListener('loadingdone', function () { fitFontEpoch++; schedule(); });
    }
'''
    return replace_once(text, old, new, 'M1: shared visible control fitting')


PATCHES = [
    # Missing motion events must never hold interaction or leave transient styles behind.
    ('</head>', '<script id="pm7-motion-finish">\n' + (TOOLS / 'motion_finish.js').read_text(encoding='utf-8') + '\n</script>\n</head>',
     'motion completion: early shared finite-motion owner'),
    (r'''      var cleanupTimer = 0;
      function cleanupOut() {
        oldP.classList.remove('pm8-page-out');
        oldP.style.top = oldP.style.left = oldP.style.width = oldP.style.height = '';
        if (oldP.__pm8PageCleanup === cleanupOut) oldP.__pm8PageCleanup = null;
      }
      function cleanupIn() {
        clearTimeout(cleanupTimer);cleanupTimer=0;
        newP.classList.remove('pm8-page-in');
        newP.removeEventListener('animationend', onIn);
        if (newP.__pm8PageCleanup === cleanupIn) newP.__pm8PageCleanup = null;
        cleanupOut();
        document.documentElement.removeAttribute('data-pm-page-transition');
        requestAnimationFrame(function () { cachePanelRect(newP); cacheTabMetrics(); });
      }
      function onIn(ev) {
        if (ev.animationName !== 'pm8-page-in') return;
        newP.removeEventListener('animationend', onIn);
        /* Keep the fully faded outgoing page inert through Settings' own
           340 ms entrance. Hiding its large subtree at 150 ms forced a
           main-thread restyle through the middle of the visible animation. */
        cleanupTimer=setTimeout(cleanupIn,80);
      }
      oldP.__pm8PageCleanup = cleanupOut; newP.__pm8PageCleanup = cleanupIn;
      newP.addEventListener('animationend', onIn);''',
     r'''      var stopEntrance = null, finished = false;
      function cleanupOut() {
        oldP.classList.remove('pm8-page-out');
        oldP.style.top = oldP.style.left = oldP.style.width = oldP.style.height = '';
        if (oldP.__pm8PageCleanup === cleanupOut) oldP.__pm8PageCleanup = null;
      }
      function cleanupIn() {
        if (finished) return;
        finished = true;
        if (stopEntrance) stopEntrance();
        newP.classList.remove('pm8-page-in');
        if (newP.__pm8PageCleanup === cleanupIn) newP.__pm8PageCleanup = null;
        cleanupOut();
        document.documentElement.removeAttribute('data-pm-page-transition');
        requestAnimationFrame(function () { cachePanelRect(newP); cacheTabMetrics(); });
      }
      oldP.__pm8PageCleanup = cleanupOut; newP.__pm8PageCleanup = cleanupIn;
      /* Keep the existing 80 ms post-end hold: Settings still enters for
         340 ms while the faded outgoing subtree stays inert. */
      stopEntrance = window.PM7_MOTION_FINISH(newP, 'animation', 'pm8-page-in', cleanupIn, 80);''',
     'motion completion: page entrance always releases the hover rest'),
    (r'''                        firsts.push([sTab, sTab.getBoundingClientRect().left]);''',
     r'''                        firsts.push([sTab, sTab.getBoundingClientRect().left]);
                        window.PM7_MOTION_FINISH.cancel(sTab, 'transition', 'transform');
                        cancelAnimationFrame(sTab.__pmTabSlideFrame);''',
     'motion completion: retire terminal reflow before replacing its geometry'),
    (r'''                            sTab.style.transition = 'transform 250ms cubic-bezier(.22,1,.36,1)';
                            sTab.style.transform = '';
                            sTab.addEventListener('transitionend', function onSlid(te) {
                                if (te.propertyName !== 'transform') return;
                                te.target.style.transition = '';
                                te.target.style.transform = '';
                                te.target.removeEventListener('transitionend', onSlid);
                            });''',
     r'''                            (function (tab) {
                                // Old cancellation dispatches before this replacement frame.
                                tab.__pmTabSlideFrame = requestAnimationFrame(function () {
                                    tab.__pmTabSlideFrame = 0;
                                    tab.style.transition = 'transform 250ms cubic-bezier(.22,1,.36,1)';
                                    tab.style.transform = '';
                                    window.PM7_MOTION_FINISH(tab, 'transition', 'transform', function () {
                                        tab.style.transition = '';
                                        tab.style.transform = '';
                                    });
                                });
                            })(sTab);''',
     'motion completion: terminal neighbour tab reflow'),
    (r'''    if (!inspector || e.target !== inspector || e.propertyName !== 'transform') return;
    inspector.removeEventListener('transitionend', onDetailOpenSettled);''',
     r'''    if (!inspector) return;''',
     'motion completion: Settings inspector completion callback'),
    (r'''        else inspector.addEventListener('transitionend', onDetailOpenSettled);''',
     r'''        else inspector.__pmDetailFinish = window.PM7_MOTION_FINISH(inspector, 'transition', 'transform', onDetailOpenSettled);''',
     'motion completion: Settings inspector entrance'),
    (r"    inspector.removeEventListener('transitionend', onDetailOpenSettled);",
     r"    if (inspector.__pmDetailFinish) inspector.__pmDetailFinish();",
     'motion completion: retire inspector opening before reopening'),
    (r"    inspector?.removeEventListener('transitionend', onDetailOpenSettled);",
     r"    if (inspector?.__pmDetailFinish) inspector.__pmDetailFinish();",
     'motion completion: retire inspector opening on close'),
    (r'''else{const onSettled=e=>{if(e.target!==drawer||e.propertyName!=='transform')return;drawer.removeEventListener('transitionend',onSettled);if(wrap.isConnected&&wrap.classList.contains('is-open'))wrap.classList.add('is-settled');};drawer.addEventListener('transitionend',onSettled);}''',
     r'''else{window.PM7_MOTION_FINISH(drawer,'transition','transform',()=>{if(wrap.isConnected&&wrap.classList.contains('is-open'))wrap.classList.add('is-settled');});}''',
     'motion completion: Settings base drawer entrance'),
    (r'''      var settle = function (ev) {
        if (ev.target !== el || ev.propertyName !== 'transform') return;
        el.removeEventListener('transitionend', settle);
        el.style.removeProperty('transition');
        el.style.removeProperty('transform');
      };
      el.addEventListener('transitionend', settle);
      requestAnimationFrame(function () {
        el.style.transition = 'transform var(--mo-widget-reflow-dur, 240ms) var(--mo-widget-reflow-ease, cubic-bezier(.45,0,.4,1))';
        el.style.removeProperty('transform');
      });''',
     r'''      var settle = function () {
        el.style.removeProperty('transition');
        el.style.removeProperty('transform');
      };
      requestAnimationFrame(function () {
        el.style.transition = 'transform var(--mo-widget-reflow-dur, 240ms) var(--mo-widget-reflow-ease, cubic-bezier(.45,0,.4,1))';
        el.style.removeProperty('transform');
        window.PM7_MOTION_FINISH(el, 'transition', 'transform', settle);
      });''',
     'motion completion: dashboard FLIP cleanup'),
    (r"""      el.style.transition = 'none';
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';""",
     r"""      window.PM7_MOTION_FINISH.cancel(el, 'transition', 'transform');
      el.style.transition = 'none';
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';""",
     'motion completion: retire dashboard FLIP before replacing its styles'),
    (r'''      var element = entry.element;
      element.style.transition = "none";''',
     r'''      var element = entry.element;
      window.PM7_MOTION_FINISH.cancel(element, 'transition', 'transform');
      element.style.transition = "none";''',
     'motion completion: retire Home FLIP before replacing its styles'),
    (r'''      var settle = function (event) {
        if (event.target !== element || event.propertyName !== "transform") return;
        element.removeEventListener("transitionend", settle);''',
     r'''      var settle = function () {''',
     'motion completion: Home FLIP completion callback'),
    (r'''      element.addEventListener("transitionend", settle);
      requestAnimationFrame(function () {
        element.style.transition = "transform var(--pm-home-reflow-dur) var(--pm-home-reflow-ease)";
        element.style.transitionDelay = (index * 16) + "ms";
        element.style.removeProperty("transform");
      });''',
     r'''      requestAnimationFrame(function () {
        element.style.transition = "transform var(--pm-home-reflow-dur) var(--pm-home-reflow-ease)";
        element.style.transitionDelay = (index * 16) + "ms";
        element.style.removeProperty("transform");
        window.PM7_MOTION_FINISH(element, 'transition', 'transform', settle);
      });''',
     'motion completion: Home FLIP marker cleanup'),
    (r'''            v.addEventListener('animationend', function h() { v.classList.remove('pm-panel-enter'); v.removeEventListener('animationend', h); });''',
     r'''            window.PM7_MOTION_FINISH(v, 'animation', 'railPanelIn', function () { v.classList.remove('pm-panel-enter'); });''',
     'motion completion: side-panel entrance cleanup'),
    # Wizard continuity retains the outgoing stage through the incoming entrance. Rebuilding its PRD while
    # entering the workspace needlessly lays out that retained stage again. Replay similarly leaves the workspace.
    # Each stage entry renders its current content; requirement events also refresh PRD directly while it is hidden.
    ("function renderAll() {\n    if (!WS()) return;\n    try { renderPrd(); } catch (e) {}",
     "function renderAll() {\n    if (!WS()) return;\n    if (W.stage === 'prd_builder') { try { renderPrd(); } catch (e) {} }\n"
     "    if (W.stage !== 'workspace') { hydrateIcons(); return; }",
     'wizard stage continuity: render the current stage'),
    # Preserve the outgoing stage before a synchronous renderer can flush the stage visibility change.
    ("function setStage(name) {\n    W.stage = name;",
     "function setStage(name) {\n    if (window.PM_WIZARD_STAGES) window.PM_WIZARD_STAGES.prepare(name);\n    W.stage = name;",
     'wizard stage continuity: prepare before the stage write'),
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
    # Settings Home › Essential setup: Run Onboarding Again, Resume the Guided Tour and Start the Guided Tour over
    # (window.O55TourSettingsRows in src/js/95-boot.js; the two rows above stay as its fallback).
    ('<span class="setup-meta">Try the main actions again with a local example</span></span>${icon(\'chevron\')}</button>\n',
     '<span class="setup-meta">Try the main actions again with a local example</span></span>${icon(\'chevron\')}</button>`}\n',
     'settings essential setup: tour rows end'),
    ('          <button class="setup-row" data-action="replay-onboarding" data-source-surface="home_menu" data-ui-action-id="settings.onboarding.run_again">',
     '          ${window.O55TourSettingsRows ? window.O55TourSettingsRows(icon) : `<button class="setup-row" data-action="replay-onboarding" data-source-surface="home_menu" data-ui-action-id="settings.onboarding.run_again">',
     'settings essential setup: tour rows start'),
    ("      case 'start-guided-tour': if(window.PM7_GUIDED_TOUR&&typeof window.PM7_GUIDED_TOUR.start==='function')window.PM7_GUIDED_TOUR.start({source:'settings'});",
     "      case 'resume-guided-tour': if(window.PM7_GUIDED_TOUR&&typeof window.PM7_GUIDED_TOUR.resume==='function'){window.PM7_GUIDED_TOUR.resume({source:'settings'});return;}\n"
     "      case 'restart-guided-tour': if(window.PM7_GUIDED_TOUR&&typeof window.PM7_GUIDED_TOUR.restart==='function'){window.PM7_GUIDED_TOUR.restart({source:'settings'});return;}\n"
     "      case 'start-guided-tour': if(window.PM7_GUIDED_TOUR&&typeof window.PM7_GUIDED_TOUR.start==='function')window.PM7_GUIDED_TOUR.start({source:'settings'});",
     'settings: resume and restart tour actions'),
    ("      'settings.guided_tour.replay':['Replay guided tour','Learn the workspace again step by step.'],",
     "      'settings.guided_tour.resume':['Resume the Guided Tour','Pick up the tour at the step where it stopped.'],\n"
     "      'settings.guided_tour.replay':['Start the Guided Tour over','Begin the tour again from its first step.'],",
     'hover label tour resume and restart'),
    # Settings' Chat Layout row (general.visual.chat-layout-mode) is retired: the chat stays in its column and moves only
    # by its own Pop out (the planner's ruling on D3 and D32; o55/placement.d/60-app-input.json retire_ids). The paint
    # no longer sends chat.layout from the stored value, and a stored value (Overlay, Detached or any other) is ignored
    # and cleared on first read, with no pop-out and no notice.
    ("      var chat=String(settings['general.visual.chat-layout-mode']||'Docked').toLowerCase();\n"
     "      if(chat!==lastChatLayout&&window.PM_DEMO&&typeof window.PM_DEMO.emit==='function'){lastChatLayout=chat;window.PM_DEMO.emit('chat.layout',{mode:chat,origin:'settings'});}\n",
     "      /* Chat Layout (general.visual.chat-layout-mode) is retired (D3, D32): the paint sends no chat.layout */\n",
     'settings paint: chat layout retired'),
    ("      var priorAlpha=saved.settings['general.visual.glass-transparency'],alpha=clampGlassAlpha(saved.settings,priorAlpha);saved.settings['general.visual.glass-transparency']=alpha;\n",
     "      /* Chat Layout is retired (D3, D32): a stored value is ignored and cleared on first read */\n"
     "      var retiredChat='general.visual.chat-layout-mode';\n"
     "      if(projection&&projection.settings&&Object.prototype.hasOwnProperty.call(projection.settings,retiredChat)){delete projection.settings[retiredChat];if(projection.changed)delete projection.changed[retiredChat];if(Object.prototype.hasOwnProperty.call(base.settings,retiredChat))saved.settings[retiredChat]=base.settings[retiredChat];else delete saved.settings[retiredChat];if(saved.changed)delete saved.changed[retiredChat];if(source==='local_concept_fixture')try{localStorage.setItem(k,JSON.stringify(scrubCredentialSettings(projection)));}catch(_e){}}\n"
     "      var priorAlpha=saved.settings['general.visual.glass-transparency'],alpha=clampGlassAlpha(saved.settings,priorAlpha);saved.settings['general.visual.glass-transparency']=alpha;\n",
     'settings load: chat layout retired'),
    # Settings search › Restore home layout pointed its detail panel at "restore-defaults", which is not a setting on
    # App & Input, so the panel opened empty. It now opens the real row and asks the Reset Home layout question.
    ("      ['Restore home layout', 'Open structured desktop and window settings', 'general', 'app-input', 'restore-defaults'],",
     "      ['Restore home layout', 'Put Home panels, docks and the terminal back in their default places', 'general', 'app-input', 'general.startup.reset-home-layout'],",
     'settings search: restore home layout target'),
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
    # PMH, the merged hover engine (src/js/18-hover.js + src/css/22-hover.css, 2026-10-09), owns hover on every card,
    # row, tile and icon. The PM8 engine read every target's rect each pointer frame, wrote inherited custom properties
    # on the cards (a subtree restyle per write), animated a blurred box-shadow on a card-sized proxy and never stopped
    # its loop while the pointer rested on a box. It now stops right after it makes the shared pointermove dispatcher
    # (canon F3-446: exactly one document pointermove handler; the glass parallax hook and PMH both ride it). What
    # follows the return is dead code; its other patches (the nier-next theme observer, Usage A3) still find their
    # anchors there and stay harmless.
    ("    var F = { bleed: 12, edge: .45, ramp: 18, glow: .8, wash: .5, mag: 1, stiff: 170, damp: 22 };\n",
     "    /* O55 PMH (src/js/18-hover.js) owns hover; PM8 stops here. The shared pointermove dispatcher stays (F3-446). */\n"
     "    window.PM7_PMOVE = window.PM7_PMOVE || [];\n"
     "    document.addEventListener('pointermove', function (e) {\n"
     "      var hooks = window.PM7_PMOVE;\n"
     "      for (var i = 0; i < hooks.length; i++) { try { hooks[i](e); } catch (err) {} }\n"
     "    });\n"
     "    return;\n"
     "    var F = { bleed: 12, edge: .45, ramp: 18, glow: .8, wash: .5, mag: 1, stiff: 170, damp: 22 };\n",
     'pmh: pm8 engine off, dispatcher kept'),
    # With no engine the PM8 ring ::after and wash ::before would still be generated, transparent, on about 100 hosts
    # (each repaint of a card painted the ring through its four-gradient mask). Only `content` changes: the wash rule's
    # z-index:-1 and the hosts' isolation stay, because the Glass ::before highlight (its own content) relies on them.
    ('.pm6-search-hit)::after {\n      content: "";\n',
     '.pm6-search-hit)::after {\n      content: none;   /* PMH: the PM8 ring is off */\n',
     'pmh: pm8 ring off'),
    ('.pm6-search-hit)::before {\n      content: "";\n',
     '.pm6-search-hit)::before {\n      content: none;   /* PMH: the PM8 wash is off; z-index:-1 stays for Glass */\n',
     'pmh: pm8 wash off'),
    # The .pm-sheen:hover accent ring, glow and lift (base, Friendly, Glass) showed whenever the PM8 engine was not
    # running, so Reduced Motion was glowier than motion. PMH's CSS defines every hover state now. The reduced twins
    # and .pm-hover-icon stay.
    ("    .pm-sheen:hover {\n"
     "      transition-duration: var(--motion-fast);           /* fast in (120ms), instant-ish out (70ms base) */\n"
     "      transform: translateY(-2px);\n"
     "      border-color: color-mix(in srgb, var(--accent-primary) 40%, var(--border));\n"
     "      box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-primary) 30%, transparent),\n"
     "                  0 6px 18px color-mix(in srgb, var(--accent-primary) 16%, transparent);\n"
     "    }\n",
     "    /* .pm-sheen:hover: removed, PMH (src/css/22-hover.css) owns hover */\n",
     'pmh: sheen hover off (base)'),
    ("    [data-theme^=\"friendly\"] .pm-sheen:hover {\n"
     "      transform: translateY(-2px) scale(1.005);\n"
     "      border-color: color-mix(in srgb, var(--pm6-sheen-accent, var(--accent-primary)) 45%, var(--border));\n"
     "      box-shadow: 0 0 0 2px var(--pm6-sheen-accent, var(--accent-primary)),\n"
     "                  0 0 22px color-mix(in srgb, var(--pm6-sheen-accent, var(--accent-primary)) 55%, transparent);\n"
     "    }\n",
     "    /* [data-theme^=\"friendly\"] .pm-sheen:hover: removed, PMH owns hover */\n",
     'pmh: sheen hover off (friendly)'),
    ("    [data-theme^=\"glass\"] .pm-sheen:hover {\n"
     "      transform: translateY(-2px) scale(1.005);\n"
     "      border-color: color-mix(in srgb, var(--accent-primary) 40%, var(--border));\n"
     "      box-shadow: 0 0 0 1px var(--glass-hairline),\n"
     "                  0 8px 22px rgba(var(--pm6-glass-a-rgb), .22);\n"
     "    }\n",
     "    /* [data-theme^=\"glass\"] .pm-sheen:hover: removed, PMH owns hover */\n",
     'pmh: sheen hover off (glass)'),
    # Hover tags swapped any label or detail that looked internal (a file name, a path, host:port, a dotted id) for
    # generic copy ("Choose this option"), with no way out, so file refs and editor tabs in the home panels could not
    # show their path. data-pmh-tag="literal" on the element or an ancestor keeps the tag's literal text (2026-10-10).
    ("    if(looksInternal(label))label=actionCopy[0]||'Choose this option';\n",
     "    var literalTag=!!(el.closest&&el.closest('[data-pmh-tag=\"literal\"]'));   /* O55: opt out of the internal-copy swap */\n"
     "    if(!literalTag&&looksInternal(label))label=actionCopy[0]||'Choose this option';\n",
     'pmh: literal hover tag label'),
    ("    if(looksInternal(detail))detail=actionCopy[1]||'See what this control does.';\n",
     "    if(!literalTag&&looksInternal(detail))detail=actionCopy[1]||'See what this control does.';\n",
     'pmh: literal hover tag detail'),
    # NieR intel tags (src/settings/styles.d/15-nier-world.css) open below their target and go above only when below
    # has no room; the clamps that follow keep them in the viewport. The tag also carries data-literal while its target
    # opted out of the copy swap, so the intel band shows a path in its own case instead of uppercase.
    ("    var top=anchor.top-rect.height-GAP,placement='above';\n"
     "    if(top<viewport.top+marginY){top=anchor.bottom+GAP;placement='below';}\n",
     "    var top=anchor.top-rect.height-GAP,placement='above';\n"
     "    if(top<viewport.top+marginY){top=anchor.bottom+GAP;placement='below';}\n"
     "    if(document.documentElement.matches('[data-o55-nier-parts~=\"intel\"]')&&anchor.bottom+GAP+rect.height<=viewportBottom-marginY){top=anchor.bottom+GAP;placement='below';}   /* O55 NieR intel: below first */\n",
     'pmh: nier intel tag below'),
    ("    var rect=this.tag.getBoundingClientRect(),left=anchor.left+anchor.width/2-rect.width/2;\n",
     "    this.tag.toggleAttribute('data-literal',!!(this.active.closest&&this.active.closest('[data-pmh-tag=\"literal\"]')));   /* O55: before the measure */\n"
     "    var rect=this.tag.getBoundingClientRect(),left=anchor.left+anchor.width/2-rect.width/2;\n",
     'pmh: literal hover tag mark'),
    # The tag controller exempts an element when it carries any non-empty data-pm-hover-exempt itself (prepare, open
    # and finishPendingOpen test only that the attribute is set; the value and the element's ancestors are never
    # consulted). The value matters only to its census, audit(), which reports a value missing from EXEMPTIONS as
    # undocumented_exemption. Two values the page sets were missing: 'labelled-field' (Settings panel fields,
    # src/settings/kit.d/16-pages.js) and 'menu' (the Usage menu, its unlabelled rows, back button and search field,
    # usage-redesign src/js/45-menu.js). Global_hover_tags_source.py lists them too (2026-10-10).
    ("    'noninteractive-chart-geometry':'Decorative chart scaffolding; each datum mark remains independently bound.'\n"
     "  });\n",
     "    'noninteractive-chart-geometry':'Decorative chart scaffolding; each datum mark remains independently bound.',\n"
     "    'labelled-field':'A field in a Settings panel whose label and help line sit beside it; a tag would only repeat them over the heading above.',\n"
     "    'menu':'A menu and its rows, back button and search field, which already show their names; a row given its own data-pm-hover-label is not exempt and keeps its tag.'\n"
     "  });\n",
     'pmh: hover tag exemptions labelled-field and menu'),
    # The show-tooltips read deep-cloned the whole app state (PM12_KIMI.getState()) on every call, and the controller
    # calls it on every input and change event in the document, so each keystroke in a terminal or field cost a full
    # JSON clone (about 12 ms each with the CPU slowed 4x, ~200 ms over three short commands). The value is now read
    # once and kept until a Settings write: the first read wraps the Settings tome's save, load, reset and applyPaint
    # (every state change in the Settings app goes through one of them), and each call clears the kept value. Before
    # the Settings app exists the read is not kept. setVisualEnabled writes the root and tag only when they change.
    ("  HoverTagController.prototype.readVisualSetting=function(){\n"
     "    try{\n"
     "      var api=window.PM12_KIMI,state=api&&typeof api.getState==='function'?api.getState():null;\n",
     "  HoverTagController.prototype.readVisualSetting=function(){   /* O55: kept until a Settings write */\n"
     "    var tome=window.PM7_SETTINGS_TOME,api=window.PM12_KIMI,self=this;\n"
     "    if(this.visualCacheOk&&this.visualCacheApi===api)return this.visualCache;\n"
     "    if(tome&&!tome.__pmhTagWatch){['save','load','reset','applyPaint'].forEach(function(name){var f=tome[name];if(typeof f==='function')tome[name]=function(){self.visualCacheOk=false;try{return f.apply(this,arguments);}finally{self.visualCacheOk=false;}};});try{Object.defineProperty(tome,'__pmhTagWatch',{value:true});}catch(_error){}}\n"
     "    var value=this.readVisualSettingNow();\n"
     "    this.visualCacheOk=!!(api&&tome&&tome.__pmhTagWatch);this.visualCacheApi=api;this.visualCache=value;return value;\n"
     "  };\n"
     "  HoverTagController.prototype.readVisualSettingNow=function(){\n"
     "    try{\n"
     "      var api=window.PM12_KIMI,state=api&&typeof api.getState==='function'?api.getState():null;\n",
     'pmh: hover tag visual setting kept'),
    ("    this.ensureRoot();this.visualEnabled=value!==false;this.root.setAttribute('data-visual-enabled',String(this.visualEnabled));\n"
     "    if(!this.visualEnabled){this.cancelPendingOpen();this.active=null;this.activeModel=null;clearTimeout(this.departureTimer);clearTimeout(this.closeTimer);if(this.tag){this.tag.setAttribute('data-open','false');this.tag.hidden=true;}}\n",
     "    this.ensureRoot();this.visualEnabled=value!==false;setAttrIfChanged(this.root,'data-visual-enabled',String(this.visualEnabled));   /* O55: write only a change */\n"
     "    if(!this.visualEnabled){this.cancelPendingOpen();this.active=null;this.activeModel=null;clearTimeout(this.departureTimer);clearTimeout(this.closeTimer);if(this.tag){setAttrIfChanged(this.tag,'data-open','false');if(!this.tag.hidden)this.tag.hidden=true;}}\n",
     'pmh: hover tag visual setting writes'),
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
    # The page-tab ink re-measured every tab (offsetLeft/Width/Top/Height) inside the observer of a theme or motion
    # change, a microtask after the attribute write: the read forced the whole page's style and layout there (about
    # 217 ms under a Reduced Motion toggle, whose [data-motion] rules match every element), and whatever the same task
    # wrote next (Settings' re-render, the look layer) made the frame style the page again. The ink now re-measures at
    # the next frame, before that frame's paint: the read then shares the frame's own style and layout pass, and the
    # ink lands in the same frame as the new look. Several changes in one frame re-measure once.
    ("    window.PM7_PAGE_TAB_INK = { resync: resync };\n"
     "    try {\n"
     "      new MutationObserver(resync).observe(document.documentElement, {\n",
     "    window.PM7_PAGE_TAB_INK = { resync: resync };\n"
     "    var resyncFrame = 0;\n"
     "    function resyncNextFrame() {\n"
     "      if (resyncFrame) return;\n"
     "      resyncFrame = requestAnimationFrame(function () { resyncFrame = 0; resync(); });\n"
     "    }\n"
     "    try {\n"
     "      new MutationObserver(resyncNextFrame).observe(document.documentElement, {\n",
     'page-tab ink: re-measure at the next frame'),
    # With the tab ink waiting for the frame, the next reader in the same observer round forced the same whole-page
    # style instead (m2's traces, 2026-10-09): the PM8 magnet's readTheme(), a getComputedStyle of its probe for the
    # --pm8-* tokens. It now reads at the next frame too, ahead of the magnet loop's own frame (requested first), so
    # nothing in a theme or motion write forces style: the frame's own pass serves every reader once.
    ("      new MutationObserver(function () {\n"
     "        readTheme();\n"
     "        bloomHost = null;   /* radius may change with the theme */\n",
     "      var themeFrame = 0;\n"
     "      new MutationObserver(function () {\n"
     "        if (!themeFrame) themeFrame = requestAnimationFrame(function () { themeFrame = 0; readTheme(); });\n"
     "        bloomHost = null;   /* radius may change with the theme */\n",
     'magnet tokens: re-read at the next frame'),
    # Terminal output and ordinary text rewrites insert nodes throughout the page. The density observer only needs
    # to enroll new surfaces, not search the entire document after every child-list mutation. Preserve the initial
    # scan, WeakSet enrollment, ResizeObserver and synchronous density update; inspect inserted subtrees thereafter.
    ("    function enroll() {\n"
     "      $$('.pm-home-surface').forEach(function (surface) {\n"
     "        if (observed.has(surface)) return;\n"
     "        observed.add(surface); resizeObserver.observe(surface); syncHomeSurface(surface);\n"
     "      });\n"
     "    }\n"
     "    enroll();\n"
     "    new MutationObserver(enroll).observe(document.body, { childList: true, subtree: true });\n",
     "    function enrollSurface(surface) {\n"
     "      if (observed.has(surface) || !surface.isConnected) return;\n"
     "      observed.add(surface); resizeObserver.observe(surface); syncHomeSurface(surface);\n"
     "    }\n"
     "    function enroll(root) {\n"
     "      root = root || document;\n"
     "      if (root.nodeType === 1 && root.matches('.pm-home-surface')) enrollSurface(root);\n"
     "      if (root === document || root.childElementCount) {\n"
     "        root.querySelectorAll('.pm-home-surface').forEach(enrollSurface);\n"
     "      }\n"
     "    }\n"
     "    enroll();\n"
     "    new MutationObserver(function (mutations) {\n"
     "      mutations.forEach(function (mutation) {\n"
     "        mutation.addedNodes.forEach(function (node) { if (node.nodeType === 1) enroll(node); });\n"
     "      });\n"
     "    }).observe(document.body, { childList: true, subtree: true });\n",
     'home density: enroll only inserted surfaces'),
    # Settings host width (Glass owner's finding, 2026-10-14; M4 follow-up). Entering Settings at 1600 x 900 painted one
    # frame of a 751 px Settings beside the 515 px chat before the narrow "focus host" took over (1278 px): a 295 px
    # sideways jump. The T46 host already decides when Settings is shown (its panel observer, before layout), but while
    # Settings is hidden its width is 0, and the stand-in it used (the whole shell less the chat) left out the Files rail,
    # so it said 1079 px, wide enough. The first fix decided again in the resize observer after layout, which laid the
    # first frame out twice (+3.6 to 8.6 % task on the P1000). The stand-in is now the width of the column the pages
    # share, which is laid out whichever page shows, so the decision made when Settings is shown is right and the resize
    # observer stays deferred as before.
    ("var reservedChatWidth=0,shellWidth=0,panelWidth=0,chatWidth=0,resizerWidth=5,syncFrame=0;",
     "var reservedChatWidth=0,shellWidth=0,panelWidth=0,chatWidth=0,resizerWidth=5,syncFrame=0,pagesWidth=0;",
     'settings host: the pages column width'),
    ("var width=panelWidth>0?panelWidth:Math.max(0,shellWidth-reservation);",
     "var width=panelWidth>0?panelWidth:pagesWidth>0?pagesWidth:Math.max(0,shellWidth-reservation);",
     'settings host: hidden Settings stands in with the pages column'),
    ("  observeWidth(panel,function(width){panelWidth=width;});\n",
     "  observeWidth(panel,function(width){panelWidth=width;});\n"
     "  observeWidth(panel&&panel.parentElement,function(width){pagesWidth=width;});\n",
     'settings host: observe the pages column'),
    # Settings updates in place (M4, 2026-10-14). Two seams in the Settings engine: how renderApp() commits the page's
    # markup, and how the end space under the chapter's last section is sized. Both keep today's behaviour as their
    # default; the kit takes them over (src/settings/kit.d/28-in-place.js patches the page in place instead of
    # replacing it, and 27-place.js sizes the end space so it never pulls the page up under the reader).
    ("  let softRemount = false;\n",
     "  let softRemount = false;\n"
     "  let commitSettingsShell = markup => { root.innerHTML = markup; };\n"
     "  let sizeSettingsEndSpace = (scroller, end, sections) => {\n"
     "    if (!sections.length) return;\n"
     "    const last = sections[sections.length - 1];\n"
     "    end.style.height = `${Math.max(140, scroller.clientHeight - Math.min(last.offsetHeight, scroller.clientHeight * .62) + 48)}px`;\n"
     "  };\n",
     'M4: settings commit and end-space seams'),
    ("    root.innerHTML = `\n      <div class=\"pm-shell ${state.railOpen ? 'rail-open' : ''}\">",
     "    commitSettingsShell(`\n      <div class=\"pm-shell ${state.railOpen ? 'rail-open' : ''}\">",
     'M4: renderApp commits through the seam'),
    ("      <div class=\"toast-stack\" id=\"toast-stack\"></div>`;\n    root.classList.add('is-ready');",
     "      <div class=\"toast-stack\" id=\"toast-stack\"></div>`);\n    root.classList.add('is-ready');",
     'M4: renderApp commit seam close'),
    ("      if (scroller && end && sections.length) {\n"
     "        const last = sections[sections.length - 1];\n"
     "        const required = Math.max(140, scroller.clientHeight - Math.min(last.offsetHeight, scroller.clientHeight * .62) + 48);\n"
     "        end.style.height = `${required}px`;\n"
     "      }\n",
     "      if (scroller && end) sizeSettingsEndSpace(scroller, end, sections);\n",
     'M4: end space through the seam'),
    # B6 shared roots (P1000 speed team, 2026-10-16; coordinator 1016135521-581e). Two document-wide costs ran inside the
    # warm Customize open's click on the P1000 (pm7-p1000-win's traces): closeHeaderSprouts ~4.1 ms, and the hover tags'
    # pruneLiveScopes ~5.65 ms. Both keep their exact behaviour.
    # 1. closeHeaderSprouts runs on every document click. It only ever acts on an open or closing sprout, an expanded
    #    more button or an open context ring, so headerSproutOpen() decides first; when there is none, its three
    #    document-wide queries would change nothing. headerSproutOpen asks the same question as the selector
    #    ':is(<the four sprout classes>):is(.is-open, .is-closing), .pm6-chat-more-btn[aria-expanded="true"],
    #    .context-usage.is-ctx-open' in four single-class lookups the browser answers on its class fast path, instead of
    #    matching a selector list against every element (Nas1, 23.6k elements: 2.9 ms for main's three scans, 2.2 ms for
    #    the one selector-list query, 1.0 ms for these; pm7-f5-editor measured main's scans at 17-31 ms inclusive per
    #    click with the editor's Customize sheet open).
    ("  function closeHeaderSprouts(except) {\n"
     "    $all('.context-lens-popover, .pm6-chat-more-menu, .wt-bind-dropdown, .context-hover-module').forEach(function (p) {",
     "  function headerSproutOpen() {\n"
     "    var sprout = ['context-lens-popover', 'pm6-chat-more-menu', 'wt-bind-dropdown', 'context-hover-module'], state = ['is-open', 'is-closing'];\n"
     "    for (var s = 0; s < state.length; s++) {\n"
     "      var list = document.getElementsByClassName(state[s]);\n"
     "      for (var i = 0; i < list.length; i++) {\n"
     "        var cl = list[i].classList;\n"
     "        if (cl.contains(sprout[0]) || cl.contains(sprout[1]) || cl.contains(sprout[2]) || cl.contains(sprout[3])) return true;\n"
     "      }\n"
     "    }\n"
     "    return !!(document.querySelector('.pm6-chat-more-btn[aria-expanded=\"true\"]') || document.querySelector('.context-usage.is-ctx-open'));\n"
     "  }\n"
     "  function closeHeaderSprouts(except) {\n"
     "    if (!headerSproutOpen()) return;\n"
     "    $all('.context-lens-popover, .pm6-chat-more-menu, .wt-bind-dropdown, .context-hover-module').forEach(function (p) {",
     'B6 shared roots: header sprouts skip when none is open'),
    # 2. The hover tags' mutation observer called enqueueLive once per record, and each call pruned both live sets twice
    #    (isConnected, closest() for the owner, overlay containment on every member). Inside one observer callback the
    #    DOM does not change, so the sets are pruned once, at the callback's first enqueue; after that only the node an
    #    enqueue adds can fail the prune, and pruneLiveAdded checks just that node, in the same order (the size bound
    #    first, then the overlay). The sets hold the same nodes after every record as before.
    ("      if(self.pageSettling||self.overlaySettling)return;\n      for(var i=0;i<records.length;i++){",
     "      if(self.pageSettling||self.overlaySettling)return;\n      self.liveBatch=true;self.liveBatchPruned=false;try{\n"
     "      for(var i=0;i<records.length;i++){",
     'B6 shared roots: hover live batch begins'),
    ("          for(var k=0;k<record.removedNodes.length;k++)if(record.removedNodes[k].nodeType===1)self.cleanupRemoved(record.removedNodes[k]);\n"
     "        }\n      }\n      self.syncOverlayState();\n    });",
     "          for(var k=0;k<record.removedNodes.length;k++)if(record.removedNodes[k].nodeType===1)self.cleanupRemoved(record.removedNodes[k]);\n"
     "        }\n      }\n      }finally{self.liveBatch=false;self.liveBatchOverlay=null;}\n      self.syncOverlayState();\n    });",
     'B6 shared roots: hover live batch ends'),
    ("    if(this.pageSettling||this.overlaySettling||!el||el.nodeType!==1||!el.isConnected||inOwner(el))return;var self=this,covered=false,remove=[];this.pruneLiveScopes();",
     "    if(this.pageSettling||this.overlaySettling||!el||el.nodeType!==1||!el.isConnected||inOwner(el))return;var self=this,covered=false,remove=[];\n"
     "    if(!this.liveBatch||!this.liveBatchPruned){this.pruneLiveScopes();if(this.liveBatch){this.liveBatchPruned=true;this.liveBatchOverlay=activeOverlay();}}",
     'B6 shared roots: hover live prune once per callback'),
    ("    this.pruneLiveScopes();\n    if(!this.liveFrame&&!this.liveRunning){this.liveFrame=requestAnimationFrame(function(){self.liveFrame=0;self.beginLive();});}\n"
     "  };\n  HoverTagController.prototype.deferLiveScope=",
     "    if(this.liveBatch)this.pruneLiveAdded(el,deep);else this.pruneLiveScopes();\n"
     "    if(!this.liveFrame&&!this.liveRunning){this.liveFrame=requestAnimationFrame(function(){self.liveFrame=0;self.beginLive();});}\n"
     "  };\n"
     "  HoverTagController.prototype.pruneLiveAdded=function(el,deep){\n"
     "    var overlay=this.liveBatchOverlay;\n"
     "    if(this.liveDeep.size>24||this.liveShallow.size>256){var surface=overlay||activeSurface();this.liveDeep.clear();this.liveShallow.clear();if(surface&&surface.nodeType===1&&surface.isConnected&&!inOwner(surface))this.liveDeep.add(surface);return;}\n"
     "    if(overlay){if(deep){if(el!==overlay&&!overlay.contains(el))this.liveDeep.delete(el);}else if(!overlay.contains(el))this.liveShallow.delete(el);}\n"
     "  };\n"
     "  HoverTagController.prototype.deferLiveScope=",
     'B6 shared roots: hover live prune of the added node'),
]

# Text typed under a Custom choice survives a reload (2026-10-13, pm7-terminal-options-audit-sol on frozen a1ca: Terminal
# Colors and Terminal Font kept their typed names until a reload, then lost them while every other value came back).
# The Settings kit keeps that text in state.pm51.o55Custom (src/settings/kit.d/16-pages.js), and the tome's save() wrote
# only its listed keys. It now writes the typed strings too, never for a credential setting; load() needs nothing, since
# it merges the saved projection over the defaults and the kit only fills what is missing.
CUSTOM_TEXT_PATCHES = [
    ("settingsSourceSnapshot:clone(snapshot&&snapshot.settingsSourceSnapshot||null)};",
     "settingsSourceSnapshot:clone(snapshot&&snapshot.settingsSourceSnapshot||null)};"
     "var o55Typed=snapshot&&snapshot.pm51&&snapshot.pm51.o55Custom;"
     "if(o55Typed&&typeof o55Typed==='object'){owned.pm51={o55Custom:{}};Object.keys(o55Typed).forEach(function(id){"
     "if(!credentialSettingIds.has(id)&&typeof o55Typed[id]==='string')owned.pm51.o55Custom[id]=o55Typed[id];});}",
     'typed Custom text in the saved projection'),
]


# EDITOR_LOOK_ROWS (pm7-editor-customizer, 2026-10-14): the Editor look rows the editor Customize proposal adds to
# Plans/settings_inventory.json, kept in src/settings/proposed.d/*.json in the inventory's own shape. They join the
# base page's two embedded inventories (the Settings engine's window.PM12_REFERENCE and #pm7-settings-data) before the
# Settings layer reads them, exactly as settings_layer._canon_rows admits canon rows, so placement, search, Details,
# transfer and the editor treat them as the rows they are proposed to become. A row whose id canon already holds is
# skipped (the Settings layer admits canon's own), so this block retires itself row by row as canon admits them.
EDITOR_LOOK_ROWS = SRC / 'settings' / 'proposed.d'


def editor_look_rows(text: str) -> tuple[str, list]:
    files = sorted(EDITOR_LOOK_ROWS.glob('*.json')) if EDITOR_LOOK_ROWS.is_dir() else []
    if not files:
        return text, []
    inventory = PKG.parents[2] / 'Plans' / 'settings_inventory.json'
    canon = {r['id'] for r in json.loads(inventory.read_text(encoding='utf-8'))['settings']} if inventory.exists() else set()
    rows = [r for p in files for r in json.loads(p.read_text(encoding='utf-8'))['rows']]
    need(len({r['id'] for r in rows}) == len(rows), 'EDITOR_LOOK_ROWS: a proposed row id is given twice')
    key = 'window.PM12_REFERENCE = '
    need(text.count(key) == 1, 'EDITOR_LOOK_ROWS: PM12_REFERENCE anchor drift')
    s = text.index(key) + len(key)
    e = text.index('\n', s)
    ref = json.loads(text[s:e].rstrip(';'))
    have = {r['id'] for c in ref['byCat'].values() for r in c.get('settings', [])}
    added = [r for r in rows if r['id'] not in canon and r['id'] not in have]
    for r in added:
        cat, sub, _ = r['id'].split('.', 2)
        need(cat in ref['byCat'] and any(g['id'] == sub for g in ref['byCat'][cat].get('subgroups', [])),
             f'EDITOR_LOOK_ROWS: {r["id"]} has no reference subgroup')
        ref['byCat'][cat]['settings'].append(dict(r, cat=cat, sub=sub))
    if not added:
        return text, []
    ref['total'] = sum(len(c.get('settings', [])) for c in ref['byCat'].values())
    text = text[:s] + json.dumps(ref, ensure_ascii=False, separators=(',', ':')) + ';' + text[e:]
    m = re.search(r'(<script type="application/json" id="pm7-settings-data">)(.*?)(</script>)', text, re.S)
    need(m is not None, 'EDITOR_LOOK_ROWS: pm7-settings-data missing')
    data = json.loads(m.group(2))
    known = {r['id'] for r in data['settings']}
    data['settings'].extend(r for r in added if r['id'] not in known)
    text = text[:m.start(2)] + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + text[m.end(2):]
    return text, [r['id'] for r in added]


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

# The onboarding window's look preview holds the page's theme (2026-10-13, Create Project's theme flicker). While the
# window owns a preview, PM7_SETTINGS_TOME.applyPaint paints the pair the window names, src/js/60-ui-core.js
# window.O55_PAINT_PAIR() (the draft's family and Light or Dark, only while the window is open and shown), instead of
# the selected Project's stored pair: selecting the new Project at Create Project reapplied its Settings and painted
# the factory Basic Dark for a moment, and the look's save wrote its family before its mode. Loaded Settings, the seed,
# the save and the NieR paint hook (which runs on the slug below) are unchanged; with no pair, applyPaint is as before.
THEME_PREVIEW_PATCHES = [
    ("var mode=p?String(settings['general.visual.theme-mode']||explicitMode).toLowerCase():'dark';\n"
     "    if(['light','dark','auto'].indexOf(mode)<0)mode=explicitMode;\n",
     "var mode=p?String(settings['general.visual.theme-mode']||explicitMode).toLowerCase():'dark';\n"
     "    if(['light','dark','auto'].indexOf(mode)<0)mode=explicitMode;\n"
     "    var o55Pair=typeof window.O55_PAINT_PAIR==='function'?window.O55_PAINT_PAIR():null;\n"
     "    if(o55Pair){family=o55Pair[0];mode=o55Pair[1];}\n",
     'onboarding look preview holds applyPaint'),
]

# First paint (2026-10-09). The head boot script painted Basic Dark on every open (T44 had replaced its pm.themeFamily
# read with literals: project-scoped Settings owns persistence, so there is no global theme key), and the stored look
# arrived only when Settings ran: a black frame, then Basic Dark for 0.35 s before NieR's boot log, and about 3 s of
# Basic Dark before a Light family. T44's concern is that a theme is a Project's setting with one owner and one store.
# So the head stores nothing: it reads the stored projection of the Project the page opens on, under the key the
# Settings owner writes, and paints that look (data-theme, NieR Mode's attributes, glass, reduced motion and the
# ground) before the first frame. The Project the page opens on is the one the title bar selects in the markup (the
# Settings adapter's projectRecord(): PM_ACTIVE_PROJECT_ID when a host has set it, else that menu item); a reload
# always opens it, whatever was selected before. A new install's onboarding always starts in Basic Dark (Jared,
# 2026-10-09): with ?o55=fresh, or with no onboarding record yet (the window then opens by itself), the head paints
# Basic Dark and leaves the store unread; window.PM_O55_BOOT tells Settings (kit.d/18-nier.js) and the onboarding the
# same decision. While NieR's boot log will run, the page waits under a cover of the log's own paper until the log is
# up (kit.d/20-nier-world.js removes data-o55-boot-wait), so the app never shows between the first frame and the log.
SETTINGS_PREFIX = 'pm7:settings:tome-tabs:v1:'


def first_paint_patches(base: str) -> list[tuple[str, str, str]]:
    menu = re.search(r'<div class="pm6-tb-menu" id="projectMenu"[^>]*>([\s\S]*?)</div>', base)
    need(menu is not None, 'first paint: #projectMenu not found')
    picked = re.findall(r'<button[^>]*class="pm6-tb-menu-item is-selected"[^>]*data-project="([^"]+)"', menu.group(1))
    need(len(picked) == 1, f'first paint: the title bar selects {len(picked)} Projects in the markup (need exactly 1)')
    need(base.count("var PREFIX='" + SETTINGS_PREFIX + "';") == 1, 'first paint: the Settings store key changed')
    need("if(typeof window.PM_ACTIVE_PROJECT_ID==='string'){" in base, 'first paint: projectRecord() changed')
    store = (SRC / 'js' / '20-store.js').read_text(encoding='utf-8')
    onb = re.search(r"onboarding: '([^']+)'", store)
    need(onb is not None, 'first paint: the onboarding record key (src/js/20-store.js) not found')
    nier = (SRC / 'settings' / 'kit.d' / '18-nier.js').read_text(encoding='utf-8')
    parts = re.findall(r"\['(?:Look|Motion|Sound & voice|Pointer|World)', '([^']+)', '([a-z0-9]+)'(?:, '[^']*')?\]", nier)
    need(len(parts) == 29, f'first paint: found {len(parts)} NieR parts in kit.d/18-nier.js (need 29)')
    pal = (SRC / 'settings' / 'styles.d' / '13-nier.css').read_text(encoding='utf-8')
    ground = {}
    for mode in ('light', 'dark'):
        m = re.search(r'html\[data-o55-nier\]\[data-theme="basic-' + mode + r'"\] \{\n  --background: (#[0-9a-f]{6});', pal)
        need(m is not None, f'first paint: NieR {mode} ground not found in styles.d/13-nier.css')
        ground[mode] = m.group(1)
    js = lambda v: json.dumps(v, ensure_ascii=False)
    read = (
        "        var leg = null;\n"
        "        /* O55 first paint (tools/build.py): the look stored for the Project the page opens on, read and never\n"
        "           written (T44: project-scoped Settings owns persistence; nothing here stores a theme). A new install's\n"
        "           onboarding (?o55=fresh, or no onboarding record yet) always starts in Basic Dark. */\n"
        "        var o55b = { project: '', install: false, nier: false, parts: '', glassBg: '', glassN: NaN, reduced: false, boot: false };\n"
        "        try {\n"
        "          var o55sw = new URLSearchParams(location.search).get('o55') || '', o55rec = null;\n"
        f"          try {{ o55rec = JSON.parse(window.localStorage.getItem({js(onb.group(1))}) || 'null'); }} catch (e3) {{ o55rec = null; }}\n"
        "          o55b.install = o55sw === 'fresh' || (!o55rec && o55sw !== 'off' && o55sw !== 'tour' && o55sw.indexOf('screen=') !== 0);\n"
        f"          var o55pid = typeof window.PM_ACTIVE_PROJECT_ID === 'string' ? window.PM_ACTIVE_PROJECT_ID.trim() : {js(picked[0])};\n"
        "          o55b.project = o55pid && !/^(none|no-project)$/i.test(o55pid) ? o55pid : '';\n"
        f"          var o55p = o55b.project && !o55b.install ? JSON.parse(window.localStorage.getItem({js(SETTINGS_PREFIX)} + encodeURIComponent(o55b.project)) || 'null') : null;\n"
        "          var o55s = o55p && o55p.settings && typeof o55p.settings === 'object' ? o55p.settings : null;\n"
        "          if (o55s) {\n"
        "            var o55sel = String(o55s['general.visual.theme'] || 'Basic Dark').trim().toLowerCase().replace(/\\s+/g, '-').split('-');\n"
        "            fam = fams.indexOf(o55sel[0]) === -1 ? 'basic' : o55sel[0];\n"
        "            tmode = String(o55s['general.visual.theme-mode'] || o55sel[1] || 'dark').toLowerCase();\n"
        "            if (tmodes.indexOf(tmode) === -1) { tmode = o55sel[1] === 'light' ? 'light' : 'dark'; }\n"
        "            var o55on = o55s['general.visual.nier-mode'], o55pl = o55s['general.visual.nier-parts'];\n"
        "            if (o55on === true || o55on === 'true' || o55on === 'On') {\n"
        f"              var o55all = {js([[label, key] for label, key in parts])}, o55k = [];\n"
        "              for (var o55i = 0; o55i < o55all.length; o55i++) { if (!Array.isArray(o55pl) || o55pl.indexOf(o55all[o55i][0]) !== -1) { o55k.push(o55all[o55i][1]); } }\n"
        "              o55b.nier = true; o55b.parts = o55k.join(' '); fam = 'basic';\n"
        "            }\n"
        "            var o55g = String(o55s['general.visual.glass-background-mode'] || 'Mesh').toLowerCase();\n"
        "            o55b.glassBg = ['mesh', 'depth', 'minimal'].indexOf(o55g) === -1 ? 'mesh' : o55g;\n"
        "            var o55a = Number(o55s['general.visual.glass-transparency'] == null ? 0.55 : o55s['general.visual.glass-transparency']);\n"
        "            if (o55a > 1) { o55a /= 100; }\n"
        "            o55b.glassN = isFinite(o55a) ? o55a : 0.55;\n"
        "            o55b.reduced = !!o55s['general.visual.reduce-animations'];\n"
        "          }\n"
        "        } catch (eo55) { fam = 'basic'; tmode = 'dark'; o55b.nier = false; o55b.parts = ''; o55b.glassBg = ''; o55b.glassN = NaN; o55b.reduced = false; }\n"
        "        window.PM_O55_BOOT = o55b;\n")
    stamp_old = ("        /* T44: project-scoped Settings owns persistence; no global theme write. */\n"
                 "        d.setAttribute('data-theme', t);\n")
    stamp_new = (stamp_old +
                 "        if (o55b.nier) { d.setAttribute('data-o55-nier', 'on'); d.setAttribute('data-o55-nier-parts', o55b.parts); }\n"
                 "        if (o55b.reduced) { d.setAttribute('data-motion', 'reduced'); }\n"
                 "        var o55still = o55b.reduced; try { o55still = o55still || window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e4) {}\n"
                 "        o55b.boot = o55b.nier && (' ' + o55b.parts + ' ').indexOf(' boot ') !== -1 && !o55still && document.visibilityState !== 'hidden';\n"
                 "        if (o55b.boot) {\n"
                 "          d.setAttribute('data-o55-boot-wait', '');\n"
                 "          window.addEventListener('load', function () { setTimeout(function () { d.removeAttribute('data-o55-boot-wait'); }, 400); });\n"
                 "        }\n")
    ground_js = js(ground)
    return [
        ("        var leg = null;\n", read, 'first paint: read the opening Project\'s stored look'),
        (stamp_old, stamp_new, 'first paint: NieR Mode, reduced motion and the boot cover'),
        ("        var g = 'mesh';\n", "        var g = o55b.glassBg || 'mesh';\n", 'first paint: glass background'),
        ("        var a = NaN;\n",
         "        var a = NaN;\n"
         "        if (o55b.glassN === o55b.glassN) { d.style.setProperty('--glass-alpha', String(Math.max(/-light$/.test(t) ? 0.45 : 0.35, Math.min(1, o55b.glassN)))); }\n",
         'first paint: glass transparency'),
        ("        var bg = BGS[t] || '#211E26';\n",
         f"        var bg = (o55b.nier && {ground_js}[scheme]) || BGS[t] || '#211E26';\n",
         'first paint: NieR ground'),
        ("        s.textContent = 'html,body{background:' + bg + ';color-scheme:' + (isDark ? 'dark' : 'light') + ';}';\n",
         "        s.textContent = 'html,body{background:' + bg + ';color-scheme:' + (isDark ? 'dark' : 'light') + ';}'\n"
         "          + 'html[data-o55-boot-wait] body::after{content:\"\";position:fixed;inset:0;z-index:2147483399;pointer-events:none;background:' + bg + ';}';\n",
         'first paint: the boot log\'s cover'),
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


def build_text(usage: bool = True, home: bool = True) -> str:
    """The built page. usage=False leaves the base's Prism Usage page in place, and home=False today's Home: private
    reference builds only (build.py --out PATH --no-usage / --no-home; usage_boot.mjs), never published."""
    original = base_source.assemble()
    text = original.decode('utf-8')

    # 0. Settings: swap the base's T50 managers layer for the Opus 5.5 fork in src/settings. The proposed Editor look
    #    rows join the embedded inventories first (EDITOR_LOOK_ROWS), so the layer places and validates them.
    text, SETTINGS_NOTES['editor_look_rows'] = editor_look_rows(text)
    text, SETTINGS_NOTES['layer'] = settings_layer.apply(text, need)

    # Legacy onboarding/tour removal is authored in base/shell.html (Q18).

    # 2. Guarded patches.
    for old, new, label in PATCHES + NIER_PATCHES + first_paint_patches(text):
        text = replace_once(text, old, new, label)
    text = shared_fitting_patch(text)
    for old, new, label in THEME_PREVIEW_PATCHES:
        text = replace_once(text, old, new, label)
    text = replace_once(text, SETTINGS_ANCHOR, SETTINGS_EXPOSE + SETTINGS_ANCHOR, 'settings transfer exposure')
    text = replace_once(text, LAYOUT_ANCHOR, LAYOUT_EXPOSE + LAYOUT_ANCHOR, 'layout restore exposure')

    for old, new, label in CUSTOM_TEXT_PATCHES:
        text = replace_once(text, old, new, label)
    # 2a. The shell's motion fixes from the final motion QA (tools/shell_motion.py): the status bar's hover tags and
    #     the page switch. They anchor on the text the lists above leave.
    import shell_motion  # noqa: E402
    text = shell_motion.apply(text, replace_once)

    # 2b. Usage: replace the Prism Usage page with the redesign in Concepts/usage-redesign. This runs after the
    # PATCHES loop because the 'usage card cta :has restyle' patch needs the old rule present, and before the O55
    # splice so the layer never sees the O55 modules (the left rail's layer, which anchors on <!-- O55:CSS:END -->,
    # goes after the splice).
    if usage:
        text, SETTINGS_NOTES['usage'] = usage_layer.apply(text, need)
    else:
        SETTINGS_NOTES.pop('usage', None)

    # 2c. Planning Wizard + Orchestrator theme-matching fixes (tools/wizorch_layer.py)
    import wizorch_layer  # noqa: E402
    text, SETTINGS_NOTES['wizorch'] = wizorch_layer.apply(text, need)

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
    # 4. The left rail: concept D (Polish) from Concepts/leftrail-redesign, a skin over the shell's own rail panels
    #    (its CSS, its script and data-rail-* on the <html> tag); the review copy with concepts A-C is build_rail.py.
    text, SETTINGS_NOTES['rail'] = _rail().apply_published(text, need)
    # 5. The glyph system (Concepts/glyph-system, Jared's D44): the 5.6 Pro neon renderer, the PMG registry and the PM7
    #    bridge in the head, so every surface can draw PMG.icon / PMG.status; nothing changes until a surface adopts it.
    text, SETTINGS_NOTES['glyphs'] = _glyphs().apply_published(text, need)
    # 6. Home: the universal panel system and the terminal tab kind from Concepts/home-redesign (D28: after Usage and the
    #    rail). home_layer.apply() adds the early script and its CSS between HOME:CSS markers before </head>, the panels
    #    and the terminal between HOME:BODY markers before </body>, three NieR selector hooks and three guarded app JS
    #    patches; it anchors after the O55 and rail blocks, so it runs last.
    if home:
        text, SETTINGS_NOTES['home'] = _home().apply(text, need)
    else:
        SETTINGS_NOTES.pop('home', None)
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
    note = ('<!-- TestOpus5.5PmConcept (Opus 5.5): TestPMConcept.html with a rebuilt Product Onboarding and Guided Tour. '
            'Built by Concepts/onboarding/opus-5.5/tools/build.py; never hand-edit. -->\n')
    # 7. T2 (P1000 speed team): the 13 '<compound with .active> *' rules made every .active toggle restyle the toggled
    #    element's whole subtree, so a page switch restyled the outgoing Home inside its layout. active_descendant_rewrite
    #    gives each a featured descendant (same matches today, same specificity) in the finished page.
    text, SETTINGS_NOTES['active_descendants'] = active_descendant_rewrite.apply(text, usage and home, need)
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


def check(built: str) -> list[str]:
    warn_inert_sources()
    problems = (lint_sources() + syntax_check(built) + _rail().published_problems(built) + _glyphs().published_problems(built)
                + _home().published_problems(built))
    for removed in dict.fromkeys(['id="pm7-onboarding"', 'id="pm7-guided-tour"', 'pm7-onboarding-js', 'pm7-guided-tour-js',
                                  'pm7-onboarding-css', 'pm7-guided-tour-css', "'.pm7gt-callout", ".closest('.pm7gt')",
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
        problems.append('Concepts/Onboarding concepts/TestOpus5.5PmConcept.html is missing; run build.py')
    elif TARGET.read_bytes() != expected:
        problems.append('Concepts/Onboarding concepts/TestOpus5.5PmConcept.html is stale; run build.py')
    if not PM7_TARGET.exists():
        problems.append('Concepts/PMConcept7.html is missing; run build.py --publish-pm7')
    elif PM7_TARGET.read_bytes() != expected:
        problems.append('Concepts/PMConcept7.html differs from a fresh build; run build.py --publish-pm7')
    unsplit = UNSPLIT.get(built)
    if unsplit is None:
        problems.append('page lint ratchet: no page from before step 7 for this build (build_text() must run first)')
    else:
        problems.extend(page_lint_ratchet(unsplit))
    return problems


def syntax_check(built: str, usage: bool = True) -> list[str]:
    """node --check the scripts this package writes (the Settings engine with its managers, the O55 module, and the
    Usage page's pm-usage-js from Concepts/usage-redesign, which must be there exactly once unless usage=False), the
    head boot script, and pm6-js-globals, which the base-engine PATCHES (the PMH switch-off, nier-next's next-frame
    readers) rewrite: a broken patch there would otherwise pass the build and fail only in the browser."""
    import subprocess
    import tempfile
    out = []
    for sid in ('pm4-settings-js', 'pm-o55-js', 'pm6 boot', 'pm6-js-globals'):
        if sid == 'pm6 boot':  # the head boot script (no id), which first_paint_patches() extends
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
    if usage:
        out.extend(usage_layer.syntax_check(built))
    return out


def main() -> int:
    usage = '--no-usage' not in sys.argv
    home = '--no-home' not in sys.argv
    if (not usage or not home) and ('--out' not in sys.argv or '--check' in sys.argv or '--publish-pm7' in sys.argv):
        print('--no-usage and --no-home make a private reference build only: use them with --out PATH, never --check or '
              '--publish-pm7', file=sys.stderr)
        return 2
    try:
        built = build_text(usage=usage, home=home)
    except BuildError as exc:
        print(f'BUILD FAILED: {exc}', file=sys.stderr)
        return 2
    if '--check' in sys.argv:
        problems = check(built)
        for p in problems:
            print('CHECK:', p)
        print('check', 'ok' if not problems else f'failed ({len(problems)})')
        return 0 if not problems else 1
    problems = lint_sources() + syntax_check(built, usage=usage) + _rail().published_problems(built) + _glyphs().published_problems(built)
    if home:
        problems += _home().published_problems(built)
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
        PM7_TARGET.write_bytes(data)
        summary['pm7_output'] = str(PM7_TARGET.relative_to(CONCEPTS.parent))
        summary['pm7_bytes'] = len(data)
        summary['pm7_sha256'] = hashlib.sha256(data).hexdigest()
    print(json.dumps(summary))
    return 0


if __name__ == '__main__':
    sys.exit(main())
