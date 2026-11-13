#!/usr/bin/env python3
"""What Chrome restyles when a hover, a press or a selection changes: the page-wide style invalidation sets.

Chrome does not look up which rules a state change can affect. For every class, attribute, id and pseudo-class that a
rule uses LEFT of its last compound (`.card:hover .title`: `:hover`), it keeps ONE set for the whole page of what to
restyle below an element whose state changes, filled from every such rule's last compound (`.title`). A last compound
that names a class, an attribute or an id adds that name. One that names only a tag (`svg`, `span`, `:where(b, path)`)
adds the tag: every element of that tag below the changed element is restyled. One that names nothing (`*`,
`:where(*)`, `:first-child`, `*::before`) makes the set "whole subtree": everything below is restyled. The sets do
not care which look a rule's own attributes match, so a NieR-only cursor rule costs in every look.

Measured 2026-11-11 (lane I, Windows 120 Hz): a pointer moving from one Usage card to the next restyled 752 elements
(12.8 ms of style, the whole frame is 8.3 ms) because a handful of rules made the :hover and .pmh-on sets whole-subtree
or tag-keyed; with those rules keyed on classes, 359.

How Chrome narrows a compound to its features (Blink rule_invalidation_data_visitor.cc, InvalidationSetFeatures): a
type selector comes first; a class replaces a tag or an attribute; an attribute replaces a tag; an id is kept only when
nothing came before it; :is()/:where() whose every arm has features replace what came before only when there was
nothing, so `svg:where(.nx)` stays keyed on `svg` (write `:where(svg.nx)` or `svg.nx`). :not(), :has(), :nth-*() and
other pseudo-classes add nothing.

usage: invalidation_sets.py <built page.html> [--token :hover --token .pmh-on --token [aria-selected] --token :has]
                            [--all] [--json out.json]
       invalidation_sets.py <built page.html> --guard     (the build's check: GUARDED sets, KNOWN exceptions)
"""
from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

# Pseudo-classes that change on their own at runtime (the others in a non-last compound are structure or the page).
STATE_PSEUDOS = ('hover', 'focus-visible', 'focus-within', 'focus', 'active', 'checked', 'target', 'open',
                 'popover-open', 'placeholder-shown', 'disabled', 'enabled', 'invalid', 'valid', 'indeterminate',
                 'default', 'user-invalid', 'autofill', 'fullscreen', 'modal', 'playing', 'paused', 'defined')
ARGLESS_IGNORED = ('first-child', 'last-child', 'only-child', 'first-of-type', 'last-of-type', 'only-of-type', 'empty',
                   'root', 'scope', 'link', 'any-link', 'visited', 'read-only', 'read-write', 'required', 'optional',
                   'in-range', 'out-of-range', 'host')
PSEUDO_ELEMENTS = ('before', 'after', 'marker', 'placeholder', 'selection', 'backdrop', 'first-line', 'first-letter',
                   'file-selector-button', 'cue', 'part', 'slotted', 'highlight', 'view-transition',
                   'view-transition-group', 'view-transition-image-pair', 'view-transition-old', 'view-transition-new',
                   'scroll-marker', 'scroll-marker-group', 'details-content', 'picker', 'checkmark', 'picker-icon',
                   'target-text', 'spelling-error', 'grammar-error', 'search-text', 'column')


# ---------------------------------------------------------------- CSS text -> rules

def strip_comments(css: str) -> str:
    return re.sub(r'/\*.*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group(0)), css, flags=re.S)


# Only a media condition proved false for the measured mouse/screen desktop may be skipped.
# Width, scheme, motion and unknown features remain possible; OR/NOT must preserve that possibility.
_DESKTOP = {'hover': 'hover', 'any-hover': 'hover', 'pointer': 'fine', 'forced-colors': 'none'}


def _top_parts(text: str, separator: str) -> list[str]:
    """Split at an unquoted, unescaped separator outside () and []; words need token boundaries."""
    out, start, i, depth, quote = [], 0, 0, 0, None
    while i < len(text):
        c = text[i]
        if c == '\\':
            i += 2
            continue
        if quote:
            if c == quote:
                quote = None
        elif c in '\"\'':
            quote = c
        elif c in '([':
            depth += 1
        elif c in ')]':
            depth -= 1
        elif depth == 0 and text.startswith(separator, i) and (len(separator) == 1 or (
                (i == 0 or not re.match(r'[\w-]', text[i - 1])) and
                (i + len(separator) == len(text) or not re.match(r'[\w-]', text[i + len(separator)])))):
            out.append(text[start:i].strip())
            i += len(separator)
            start = i
            continue
        i += 1
    out.append(text[start:].strip())
    return out


def _media_values(q: str) -> set[bool]:
    """Possible truth values; uncertainty is kept rather than hiding a live rule."""
    q = q.strip()
    # A media-type prefix's `not` negates the entire query, including its `and` condition.
    if re.match(r'^not\s+[a-z][\w-]*(?:\s|$)', q):
        return {not v for v in _media_values(q[4:])}
    for word in (',', 'or', 'and'):
        parts = _top_parts(q, word)
        if len(parts) > 1:
            vals = _media_values(parts[0])
            for p in parts[1:]:
                other = _media_values(p)
                vals = {(a and b) if word == 'and' else (a or b) for a in vals for b in other}
            return vals
    if q.startswith('not '):
        return {not v for v in _media_values(q[4:])}
    if q.startswith('only '):
        return _media_values(q[5:])
    if q.startswith('(') and q.endswith(')'):
        inner = q[1:-1].strip()
        m = re.fullmatch(r'([\w-]+)\s*:\s*([\w-]+)', inner)
        if m:
            name, value = m.groups()
            if name in _DESKTOP:
                return {value == _DESKTOP[name]}
            if name == 'prefers-contrast' and value in ('more', 'custom'):
                return {False}
            return {False, True}
        return _media_values(inner)
    if q in ('screen', 'all'):
        return {True}
    if q == 'print':
        return {False}
    return {False, True}


def media_inactive(prelude: str) -> bool:
    return _media_values(prelude[len('@media'):].strip().lower()) == {False}


# Strings and escapes are atomic, so braces/commas/brackets inside attributes or strings are never delimiters.
_CSS_TOKEN = re.compile(r'/\*.*?\*/|\\.|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|[{};()\[\]]', re.S)
_AMP_TOKEN = re.compile(r'\\.|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|&', re.S)


def rules(css: str, base_line: int = 1, parent: str = ''):
    """Style rules, including native nesting with explicit & or implicit descendants.

    Grouping rules keep their enclosing style context. A parent selector list is :is()-wrapped, matching native
    nesting's parent-list semantics. Declarations are skipped at semicolons outside strings/functions/attributes.
    """
    i, n, nl_pos, nl_count = 0, len(css), 0, 0

    def line_at(pos):
        nonlocal nl_pos, nl_count
        nl_count += css.count('\n', nl_pos, pos)
        nl_pos = pos
        return base_line + nl_count

    while i < n:
        depth, opening = 0, None
        for m in _CSS_TOKEN.finditer(css, i):
            t = m.group()
            if t in ('(', '['):
                depth += 1
            elif t in (')', ']'):
                depth -= 1
            elif depth == 0 and t in (';', '{'):
                opening = m
                break
        if opening is None:
            break
        if opening.group() == ';':
            i = opening.end()
            continue
        j = opening.start()
        prelude = _CSS_TOKEN.sub(lambda m: '' if m.group().startswith('/*') else m.group(), css[i:j]).strip()
        start = i + len(css[i:j]) - len(css[i:j].lstrip())
        line = line_at(start)
        body_line = line_at(j + 1)
        depth, end = 1, n
        for m in _CSS_TOKEN.finditer(css, j + 1):
            if m.group() == '{':
                depth += 1
            elif m.group() == '}':
                depth -= 1
                if not depth:
                    end = m.start()
                    break
        body = css[j + 1:end]
        if prelude.startswith('@'):
            match = re.match(r'@[\w-]+', prelude)
            name = match.group() if match else ''
            if name in ('@media', '@supports', '@layer', '@container', '@scope', '@starting-style', '@document'):
                if not (name == '@media' and media_inactive(prelude)):
                    yield from rules(body, body_line, parent)
        elif prelude and not prelude.startswith('--'):
            sels = []
            for sel in split_top(prelude):
                if parent:
                    has_amp = any(m.group() == '&' for m in _AMP_TOKEN.finditer(sel))
                    sel = _AMP_TOKEN.sub(lambda m: parent if m.group() == '&' else m.group(), sel) if has_amp else parent + ' ' + sel
                sels.append(' '.join(sel.split()))
            resolved = ', '.join(sels)
            yield resolved, line
            ancestor = resolved if len(sels) == 1 else ':is(' + resolved + ')'
            yield from rules(body, body_line, ancestor)
        i = end + 1


def split_top(sel: str, ch: str = ',') -> list[str]:
    return [x for x in _top_parts(sel, ch) if x]


def compounds(sel: str) -> list[tuple[str, str]]:
    """[(combinator before it, compound)]; only unescaped top-level spaces and >+~ split compounds."""
    out, cur, comb, depth, quote, i = [], '', '', 0, None, 0

    def flush():
        nonlocal cur, comb
        if cur:
            out.append((comb or (' ' if out else ''), cur))
            cur, comb = '', ''

    while i < len(sel):
        c = sel[i]
        if c == '\\':
            cur += sel[i:i + 2]
            i += 2
            continue
        if quote:
            cur += c
            if c == quote:
                quote = None
        elif c in '\"\'':
            cur += c
            quote = c
        elif c in '([':
            depth += 1
            cur += c
        elif c in ')]':
            depth -= 1
            cur += c
        elif not depth and (c.isspace() or c in '>+~'):
            flush()
            if c in '>+~':
                comb = c
        else:
            cur += c
        i += 1
    flush()
    return out


def simples(comp: str) -> list[tuple[str, str, str]]:
    """The simple selectors of one compound: (kind, name, argument). kind: tag, universal, id, class, attr, pseudo,
    element (a pseudo-element)."""
    out, i, n = [], 0, len(comp)
    while i < n:
        c = comp[i]
        if c == '*' or (c == '|' and i == 0):
            m = re.match(r'(?:[\w-]*|\*)?\|?\*', comp[i:])
            out.append(('universal', '*', ''))
            i += m.end() if m else 1
            continue
        if re.match(r'[A-Za-z_\\-]', c) and not out:
            m = re.match(r'(?:[\w-]+\|)?((?:\\.|[\w-])+)', comp[i:])
            if not m:
                i += 1
                continue
            out.append(('tag', m.group(1).lower() if not re.search(r'[A-Z]', m.group(1)) else m.group(1), ''))
            i += m.end()
            continue
        if c == '#':
            m = re.match(r'#((?:\\.|[\w-])+)', comp[i:])
            out.append(('id', m.group(1) if m else '', ''))
            i += m.end() if m else 1
            continue
        if c == '.':
            m = re.match(r'\.((?:\\.|[\w-])+)', comp[i:])
            out.append(('class', m.group(1) if m else '', ''))
            i += m.end() if m else 1
            continue
        if c == '[':
            depth, j, q = 1, i + 1, None
            while j < n and depth:
                ch = comp[j]
                if q:
                    if ch == q:
                        q = None
                elif ch in '"\'':
                    q = ch
                elif ch == '[':
                    depth += 1
                elif ch == ']':
                    depth -= 1
                j += 1
            inner = comp[i + 1:j - 1]
            m = re.match(r'\s*(?:[\w-]*\|)?([\w-]+)', inner)
            out.append(('attr', m.group(1).lower() if m else inner, inner))
            i = j
            continue
        if c == ':':
            element = comp[i:i + 2] == '::'
            m = re.match(r'::?([\w-]+)', comp[i:])
            name = m.group(1).lower() if m else ''
            j = i + (m.end() if m else 1)
            arg = ''
            if j < n and comp[j] == '(':
                depth, k, q = 1, j + 1, None
                while k < n and depth:
                    ch = comp[k]
                    if q:
                        if ch == q:
                            q = None
                    elif ch in '"\'':
                        q = ch
                    elif ch == '(':
                        depth += 1
                    elif ch == ')':
                        depth -= 1
                    k += 1
                arg = comp[j + 1:k - 1]
                j = k
            is_el = element or name in ('before', 'after', 'first-line', 'first-letter', 'marker', 'placeholder',
                                        'selection', 'backdrop', '-webkit-scrollbar')
            out.append(('element' if is_el else 'pseudo', name, arg))
            i = j
            continue
        i += 1
    return out


# ---------------------------------------------------------------- Blink's feature narrowing

class Features:
    __slots__ = ('ids', 'classes', 'attrs', 'tags')

    def __init__(self):
        self.ids, self.classes, self.attrs, self.tags = [], [], [], []

    def size(self):
        return len(self.ids) + len(self.classes) + len(self.attrs) + len(self.tags)

    def clear(self):
        self.ids, self.classes, self.attrs, self.tags = [], [], [], []

    def add(self, o: 'Features'):
        self.ids += o.ids
        self.classes += o.classes
        self.attrs += o.attrs
        self.tags += o.tags

    def to_class(self, c):
        if self.size() == 1 and (self.ids or self.classes):
            return
        self.clear()
        self.classes = [c]

    def to_attr(self, a):
        if self.size() == 1 and (self.ids or self.classes or self.attrs):
            return
        self.clear()
        self.attrs = [a]

    def to_id(self, i):
        if self.size() == 1:
            return
        self.clear()
        self.ids = [i]

    def to_tag(self, t):
        if self.size() == 1:
            return
        self.clear()
        self.tags = [t]

    def to_features(self, o: 'Features'):
        s, os_ = self.size(), o.size()
        if s == 0 or (1 <= os_ < s):
            self.clear()
            self.add(o)

    def kind(self):
        """whole: nothing to key on; tags: any tag in the set (a mixed `:where(.k, svg)` keeps svg beside .k, measured in
        Chrome 157, lane J's probe); keyed: classes, attributes or ids only."""
        if not self.size():
            return 'whole'
        if self.tags:
            return 'tags'
        return 'keyed'

    def text(self):
        if self.tags:
            return ' '.join(self.tags)
        return ' '.join(['#' + x for x in self.ids] + ['.' + x for x in self.classes] +
                        ['[%s]' % x for x in self.attrs]) or '(nothing: whole subtree)'


def features(comp: str) -> Features:
    f = Features()
    ss = simples(comp)
    # Blink puts the type selector first in a compound
    ss.sort(key=lambda s: 0 if s[0] in ('tag', 'universal') else 1)
    for kind, name, arg in ss:
        if kind == 'tag':
            f.to_tag(name)
        elif kind == 'id':
            f.to_id(name)
        elif kind == 'class':
            f.to_class(name)
        elif kind == 'attr':
            f.to_attr(name)
        elif kind == 'pseudo' and name in ('is', 'where', 'matches', '-webkit-any'):
            arms = split_top(arg)
            sub = Features()
            ok = bool(arms)
            for a in arms:
                cs = compounds(a)
                af = features(cs[-1][1]) if cs else Features()
                if not af.size():
                    ok = False
                    break
                sub.add(af)
            if ok:
                f.to_features(sub)
    return f


# ---------------------------------------------------------------- which sets a rule writes to

def tokens_of(comp: str, into: set, nested: bool = False):
    """The state names a compound can change on (classes, attributes, ids, pseudo-classes), including those inside
    :is()/:where()/:not() (any compound of their arms), not those inside :has() (that is the :has set's business)."""
    for kind, name, arg in simples(comp):
        if kind == 'class':
            into.add('.' + name)
        elif kind == 'attr':
            into.add('[' + name + ']')
        elif kind == 'id':
            into.add('#' + name)
        elif kind == 'pseudo':
            if name in ('is', 'where', 'matches', '-webkit-any', 'not'):
                for a in split_top(arg):
                    for _c, cp in compounds(a):
                        tokens_of(cp, into, True)
            elif name == 'has':
                into.add(':has')
            elif not arg and name not in ARGLESS_IGNORED:
                into.add(':' + name)


def nested_left_tokens(comp: str) -> set:
    """State names in the non-last compounds of complex arms nested in the last compound's :is()/:where()/:not()
    (`.x:is(.a:hover .b)`): their changes invalidate down to the last compound too."""
    out = set()
    for kind, name, arg in simples(comp):
        if kind == 'pseudo' and name in ('is', 'where', 'matches', '-webkit-any', 'not'):
            for a in split_top(arg):
                cs = compounds(a)
                for _c, cp in cs[:-1]:
                    tokens_of(cp, out)
                if cs:
                    out |= nested_left_tokens(cs[-1][1])
    return out


PSEUDO_ELEMENT_RE = re.compile(r'::?(?:' + '|'.join(re.escape(p) for p in PSEUDO_ELEMENTS) + r')(?:\([^)]*\))?')


def last_compound_key(comp: str) -> str:
    """The last compound without pseudo-elements (`.x::before` is restyled through .x)."""
    return PSEUDO_ELEMENT_RE.sub('', comp) or '*'


def set_entries(sel: str):
    """For one complex selector: [(token, kind, features, sibling)] for each state set it adds to."""
    cs = compounds(sel)
    if not cs:
        return []
    last = last_compound_key(cs[-1][1])
    f = features(last)
    out = []
    seen = set()
    for idx, (_comb, comp) in enumerate(cs[:-1]):
        toks = set()
        tokens_of(comp, toks)
        sib = any(c in ('+', '~') for c, _ in cs[idx + 1:])
        for t in toks:
            if (t, sib) not in seen:
                seen.add((t, sib))
                out.append((t, f.kind(), f, sib))
    for t in nested_left_tokens(cs[-1][1]):
        if (t, False) not in seen:
            seen.add((t, False))
            out.append((t, f.kind(), f, False))
    return out


def blocks_of(page: str):
    """Actual HTML style blocks; a <style> literal in a script/comment is not a stylesheet."""
    out, pos, line = [], 0, 1
    tags = re.compile(r'<!--.*?-->|<(script|style)\b([^>]*)>', re.S | re.I)
    closes = {k: re.compile(r'</' + k + r'\s*>', re.I) for k in ('script', 'style')}
    while (m := tags.search(page, pos)):
        line += page.count('\n', pos, m.end())
        if m.group(1) is None:
            pos = m.end()
            continue
        kind = m.group(1).lower()
        close = closes[kind].search(page, m.end())
        if close is None:
            break
        end = close.start()
        if kind == 'style':
            attrs = m.group(2)
            idm = re.search(r'\bid="([^"]+)"', attrs) or re.search(r'data-pm-split-of="([^"]+)"', attrs)
            out.append((idm.group(1) if idm else 'style@%d' % line, page[m.end():end], line))
        next_pos = close.end()
        line += page.count('\n', m.end(), next_pos)
        pos = next_pos
    return out


def census(page_text: str, tokens: list[str] | None = None, kinds=('whole', 'tags')):
    """{token: [(block, line, selector, kind, features text, sibling)]} for the rules that make a set whole-subtree or
    tag-keyed (kinds), for the named tokens (all when None)."""
    res = defaultdict(list)
    for bid, css, line0 in blocks_of(page_text):
        for sel_list, line in rules(css, line0):
            for sel in split_top(sel_list):
                if sel.startswith('@') or re.match(r'^(?:from|to|\d+%)', sel):
                    continue
                if ' ' not in sel.strip() and '>' not in sel and '+' not in sel and '~' not in sel and '(' not in sel:
                    continue  # one compound: it restyles only the element itself
                for tok, kind, f, sib in set_entries(sel):
                    if kind in kinds and (tokens is None or tok in tokens):
                        res[tok].append((bid, line, sel, kind, f.text(), sib))
    return res


# ---------------------------------------------------------------- the build's guard

# The sets a hover, a press or a selection change uses on every pointer move, press, tab or menu change. A rule that
# makes one of them whole-subtree or tag-keyed again fails the build (build.py lint), with its source file and line.
GUARDED = (':hover', ':focus-visible', ':active', '.pmh-on', '.active', '[aria-selected]', ':has')

# Rules that still do it, each named by its exact selector as the built page has it, with why it stays. Nothing else
# may join: key the rule's last compound on a class its element has (or add one in the markup that builds it).
_TD = ("a hovered table row lights its own cells; the tag reaches only the cells of a table inside an element whose "
       "hover changes (the old Settings data tables, Home's trace table), never a Usage card, a Files or rail row or the "
       "title bar. A class on every cell means every table template (base pm4-settings-js.js, home 44-artifact.js)")
_CHAT = ("the chat's NieR cursor on its chosen thread row (5.6 Pro nier-parts.css, P5): the row's status mark varies with "
         "the variant and the host's glyphs, so its parts need a census before a class list replaces :where(*); see J-REPORT")
_PICK = ("the Settings picker's marks and sub-line have no class; naming them needs one in "
         "src/settings/kit.d/30-inspector.js (Settings), which lane J was not cleared to change")
KNOWN: dict[str, str] = {
    '#panel-settings .data-table tbody tr:hover td': _TD,
    '.pmw-art-table tbody tr:hover td': _TD,
    'html[data-theme^="retro"]:not([data-o55-nier="on"]) .pmw-art-table tbody tr:hover td': _TD,
    '[data-rail-skin="d"][data-theme^="glass"] :is(#panel-files,#panel-search,#panel-source,#panel-git,#panel-docker,'
    '#panel-testing,#panel-run,#panel-agents,#panel-artifacts) .pm-segtab-item.active svg':
        "a Liquid Glass slot (liquid-glass/opus-5.5/src/slots/leftrail-redesign/src/concepts/d/css/90-themes.src/G0790.css),"
        " another owner's file: its owner can write `:where(.pm-isvg):is(svg), :where(.nx):is(svg)` (every svg there is a"
        " raw icon carrying .pm-isvg or a neon glyph carrying .nx)",
    '#panel-settings .o55-pick-item:is(.is-active, [aria-selected="true"]) .o55-pick-copy :is(em)': _PICK,
    '#panel-settings .o55-pick-item:is(.is-active, [aria-selected="true"]) .o55-pick-copy :is(small)': _PICK,
    'html[data-o55-nier-parts~="cursor"] .pm56-host .thread-row.active :where(*)': _CHAT,
}

# PERF-R5, Jared 2026-11-13: restore main's tag arms for generic cursor carriers (rules 0/1/2/6).
# These carriers include future options/menus, so a finite class census cannot preserve their contract.
# Same guard, main6 / 385f155c8c / restore: 326 / 0 / 145 reported rows. The restore accounts for all145.
# Permit only the approved main tags, in these exact carriers, after css_bucket_split emits singleton arms.
# A new tag, a changed carrier, or an unrelated selector still fails. Class additions need no exception.
_RESTORED_CURSOR_TAGS = {
    0: 'b br circle div ellipse g i line path polygon polyline rect small span strong svg',
    1: 'b circle g line mask path polygon polyline rect span svg',
    2: 'circle defs desc ellipse feComposite feDisplacementMap feGaussianBlur feImage filter g line '
       'linearGradient mask path polygon polyline rect stop svg text title use',
    6: 'b br circle div g i line path polygon polyline rect small span strong svg',
}
for _cursor_rule in json.loads(Path(__file__).with_name('active_descendant_rules.json').read_text())['rules']:
    if _cursor_rule['rule'] in _RESTORED_CURSOR_TAGS:
        _cursor_prefix, _cursor_arms = _cursor_rule['replacement'].rsplit(':where(', 1)
        for _cursor_tag in _RESTORED_CURSOR_TAGS[_cursor_rule['rule']].split():
            if _cursor_tag in _cursor_arms[:-1].split(','):
                KNOWN[_cursor_prefix + ':where(' + _cursor_tag + ')'] = (
                    'PERF-R5: main cursor tag restored for generic carriers; guard rows main326/before0/after145; '
                    'see reviews/M-REPORT.md Seventh task and active_descendant_restore.test.mjs')

CONCEPTS = Path(__file__).resolve().parents[3]
SOURCE_ROOTS = ['onboarding/opus-5.5/src', 'onboarding/opus-5.5/base/style', 'leftrail-redesign/src',
                'glyph-system/opus-5.5/src', 'chat-assistant-concepts/5.6 Pro', 'home-redesign/src', 'usage-redesign/src']
_SOURCES: list | None = None


def _sources():
    """[(path, comment-free text with whitespace collapsed, offsets of each line start in it)] for every source CSS."""
    global _SOURCES
    if _SOURCES is None:
        _SOURCES = []
        for root in SOURCE_ROOTS:
            base = CONCEPTS / root
            for p in sorted(base.rglob('*.css')) if base.is_dir() else []:
                if any(x in p.parts for x in ('harness', 'snapshots', 'proposed.d', 'node_modules')) or p.name == 'd.css':
                    continue
                raw = strip_comments(p.read_text(encoding='utf-8', errors='replace'))
                out, lines, line = [], [], 1
                prev_space = False
                for ch in raw:
                    if ch == '\n':
                        line += 1
                    if ch.isspace():
                        if not prev_space:
                            out.append(' ')
                            lines.append(line)
                        prev_space = True
                        continue
                    prev_space = False
                    out.append(ch)
                    lines.append(line)
                # drop the spaces next to , > + ~ ( ) so a lookup does not depend on how a source spaced them
                keep = [i for i, ch in enumerate(out) if not (ch == ' ' and (
                    (i and out[i - 1] in ',>+~(') or (i + 1 < len(out) and out[i + 1] in ',>+~)')))]
                _SOURCES.append((p, ''.join(out[i] for i in keep), [lines[i] for i in keep]))
    return _SOURCES


def _norm(sel: str) -> str:
    return re.sub(r'\s*([,>+~()])\s*', r'\1', ' '.join(sel.split()))


def source_of(sel: str) -> str:
    """'path:line' of the source rule a built selector came from, found by its last two compounds as written (the chat's
    .pm56-host scope and the build's specificity wrappers removed first); '' when no source holds them."""
    s = re.sub(r'(?:div)?\.pm56-host(?:\[data-theme\])?\s*', '', sel)
    s = re.sub(r':not\((?:#t7|\.t7|t7)[#.t7]*:not\(\*\)\)', '', s)
    cs = compounds(s)
    cands = []
    if len(cs) >= 2:
        cands.append(cs[-2][1] + ' ' + (cs[-1][0].strip() + ' ' if cs[-1][0].strip() else '') + cs[-1][1])
        cands.append(cs[-2][1])
    cands.append(cs[-1][1] if cs else s)
    for c in cands:
        c = _norm(c)
        if len(c) < 6:
            continue
        for p, text, lines in _sources():
            i = text.find(c)
            if i >= 0:
                return '%s:%d' % (p.relative_to(CONCEPTS), lines[i])
    return ''


def published_problems(page_text: str, known: dict | None = None) -> list[str]:
    """One problem per rule of the built page that makes a GUARDED set whole-subtree or tag-keyed, unless KNOWN."""
    known = KNOWN if known is None else known
    res = census(page_text, list(GUARDED))
    out, seen = [], set()
    for tok in GUARDED:
        for bid, line, sel, kind, ft, sib in res.get(tok, []):
            if sel in known or (tok, sel) in seen:
                continue
            seen.add((tok, sel))
            src = source_of(sel)
            what = 'whole subtree' if kind == 'whole' else 'tag-keyed (%s)' % ft
            out.append(f'invalidation set {tok} made {what} by {src or "(source not found)"} `{sel[:160]}` (built page '
                       f'<style id={bid}> line {line}): every {tok} change anywhere restyles '
                       + ('the whole subtree of the changed element' if kind == 'whole' else f'every {ft} below it')
                       + '; key the last compound on a class (tools/invalidation_sets.py)')
    return out


DEFAULT_TOKENS = [':hover', ':focus-visible', ':focus-within', ':active', '.pmh-on', '.active', '.is-current',
                  '[aria-selected]', ':has', '.o55np-cur-over', '.wk-off', '.wk-hid']


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    page = Path(argv[0]).read_text(encoding='utf-8', errors='replace')
    if '--guard' in argv:
        probs = published_problems(page)
        for p in probs:
            print('GUARD:', p)
        print('guard', 'ok' if not probs else f'failed ({len(probs)})')
        return 1 if probs else 0
    toks = [argv[i + 1] for i, a in enumerate(argv) if a == '--token'] or (None if '--all' in argv else DEFAULT_TOKENS)
    res = census(page, toks)
    if '--json' in argv:
        Path(argv[argv.index('--json') + 1]).write_text(json.dumps(res, indent=1))
    order = toks or sorted(res, key=lambda t: -len(res[t]))
    for t in order:
        rs = res.get(t, [])
        whole = sum(1 for r in rs if r[3] == 'whole')
        tags = sorted({x for r in rs if r[3] == 'tags' for x in r[4].split()})
        print('\n== %s: %d rules (%d whole subtree, %d tag-keyed: %s)' % (t, len(rs), whole, len(rs) - whole,
                                                                         ' '.join(tags)))
        for bid, line, sel, kind, ft, sib in rs:
            print('   %-28s %7d %-5s %s%s  -> %s' % (bid[:28], line, kind, 'SIBLING ' if sib else '', sel[:220], ft))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
