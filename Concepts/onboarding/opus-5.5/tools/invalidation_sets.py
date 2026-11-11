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


# Chrome adds a rule to the style engine's rule set (and so its features to the invalidation sets) only while its @media
# matches. These never match on the desktop the looks are measured on (no high-contrast mode, a mouse, a screen); every
# other @media (widths, Reduced Motion, colour scheme) counts, because a user can be in it.
INACTIVE_MEDIA = re.compile(r'forced-colors\s*:\s*active|prefers-contrast\s*:\s*(?:more|custom)|^\s*(?:only\s+)?print\b|'
                            r'\(\s*hover\s*:\s*none\s*\)|\(\s*pointer\s*:\s*coarse\s*\)|\(\s*any-hover\s*:\s*none\s*\)')


def media_inactive(prelude: str) -> bool:
    """True for an @media that never matches on the measured desktop (every comma arm inactive)."""
    q = prelude[len('@media'):].strip().lower()
    arms = [a for a in split_top(q)] or [q]
    return all(INACTIVE_MEDIA.search(a) and not a.startswith('not ') for a in arms)


BRACE_OR_QUOTE = re.compile(r'[{}"\']')


def rules(css: str, base_line: int = 1):
    """(selector list, line) for every style rule, inside @media/@supports/@layer/@container/@scope too (not inside an
    @media that never matches on the desktop: INACTIVE_MEDIA)."""
    i, n = 0, len(css)
    nl_pos, nl_count = 0, 0  # lines counted incrementally (a count from 0 per rule was quadratic)

    def line_at(pos):
        nonlocal nl_pos, nl_count
        nl_count += css.count('\n', nl_pos, pos)
        nl_pos = pos
        return nl_count
    while i < n:
        j = css.find('{', i)
        if j < 0:
            break
        prelude = css[i:j]
        if ';' in prelude:
            prelude = prelude.split(';')[-1]
        lead = len(prelude) - len(prelude.lstrip())
        start = j - len(prelude) + lead
        prelude = prelude.strip()
        depth, k = 1, j + 1
        while depth:
            m = BRACE_OR_QUOTE.search(css, k)
            if not m:
                k = n + 1
                break
            c, k = m.group(), m.end()
            if c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
            else:  # a string: to its closing quote, past escaped ones
                while True:
                    e = css.find(c, k)
                    if e < 0:
                        k = n
                        break
                    b = e - 1
                    while b >= k and css[b] == '\\':
                        b -= 1
                    k = e + 1
                    if (e - 1 - b) % 2 == 0:
                        break
        body = css[j + 1:k - 1]
        line = base_line + line_at(max(start, nl_pos))
        if prelude.startswith('@'):
            name = prelude.split()[0].split('(')[0] if prelude.split() else ''
            if name in ('@media', '@supports', '@layer', '@container', '@scope', '@starting-style', '@document'):
                if not (name == '@media' and media_inactive(prelude)):
                    yield from rules(body, base_line + line_at(j + 1))
        elif prelude:
            yield ' '.join(prelude.split()), line
        i = k


def split_top(sel: str, ch: str = ',') -> list[str]:
    out, depth, cur, q = [], 0, '', None
    for c in sel:
        if q:
            cur += c
            if c == q:
                q = None
            continue
        if c in '"\'':
            q = c
            cur += c
            continue
        if c in '([':
            depth += 1
        elif c in ')]':
            depth -= 1
        if c == ch and depth == 0:
            out.append(cur)
            cur = ''
        else:
            cur += c
    out.append(cur)
    return [x.strip() for x in out if x.strip()]


def compounds(sel: str) -> list[tuple[str, str]]:
    """[(combinator before it, compound)] left to right; the first combinator is ''."""
    sel = re.sub(r'\s*([>+~])\s*(?![^\[]*\])', r' \1 ', sel.strip())
    toks, cur, depth, q = [], '', 0, None
    for c in sel:
        if q:
            cur += c
            if c == q:
                q = None
            continue
        if c in '"\'':
            q = c
            cur += c
            continue
        if c in '([':
            depth += 1
        elif c in ')]':
            depth -= 1
        if c == ' ' and depth == 0:
            if cur:
                toks.append(cur)
                cur = ''
            continue
        cur += c
    if cur:
        toks.append(cur)
    out, comb = [], ''
    for t in toks:
        if t in ('>', '+', '~'):
            comb = t
            continue
        out.append((comb or (' ' if out else ''), t))
        comb = ''
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
            m = re.match(r'(?:[\w-]+\|)?([\w-]+)', comp[i:])
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
    """(block id, css, first line) for every <style> of a built page."""
    out, pos, lines = [], 0, 0
    for m in re.finditer(r'<style\b([^>]*)>', page):
        e = page.find('</style>', m.end())
        if e < 0:
            continue
        lines += page.count('\n', pos, m.end())
        pos = m.end()
        idm = re.search(r'\bid="([^"]+)"', m.group(1)) or re.search(r'data-pm-split-of="([^"]+)"', m.group(1))
        out.append((idm.group(1) if idm else 'style@%d' % (lines + 1), page[m.end():e], lines + 1))
    return out


def census(page_text: str, tokens: list[str] | None = None, kinds=('whole', 'tags')):
    """{token: [(block, line, selector, kind, features text, sibling)]} for the rules that make a set whole-subtree or
    tag-keyed (kinds), for the named tokens (all when None)."""
    res = defaultdict(list)
    for bid, css, line0 in blocks_of(page_text):
        for sel_list, line in rules(strip_comments(css), line0):
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
_CHAT = ("the chat's NieR cursor on its chosen or focused row (5.6 Pro nier-parts.css, P5): the rows' parts (model, "
         "effort, thread, menu and mention rows) need a class list proved row by row against :where(*); see J-REPORT")
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
    'html[data-o55-nier-parts~="cursor"] .pm56-host .menu-item:focus-visible :where(*)': _CHAT,
    'html[data-o55-nier-parts~="cursor"] .pm56-host .menu-item.active :where(*)': _CHAT,
    'html[data-o55-nier-parts~="cursor"] .pm56-host .thread-row.active :where(*)': _CHAT,
    'html[data-o55-nier-parts~="cursor"] .pm56-host .model-row.active :where(*)': _CHAT,
    'html[data-o55-nier-parts~="cursor"] .pm56-host .effort-row.active :where(*)': _CHAT,
    'html[data-o55-nier-parts~="cursor"] .pm56-host .qs-mention-item[aria-selected="true"] :where(*)': _CHAT,
}

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
