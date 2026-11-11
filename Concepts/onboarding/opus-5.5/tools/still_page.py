#!/usr/bin/env python3
"""The still page's pause rules (PERF-3, the owner's choice B of 2026-11-11), generated from the finished page.

After 20 s with no pointer move, press, wheel, key or touch, src/js/14-shell-still.js puts data-pm-still on <html> and
the page's endless decorative loops hold where they are, until the next input. Each endless loop keeps the compositor
drawing every refresh (about 119 frames a second at rest in every look; Glass Dark Home 450 ms a second of GPU-thread
time against 62 with them paused, lane E's P1). One page-wide rule (`html[data-pm-still] *`) would restyle all of the
page's ~28,000 elements at each toggle (the page lint forbids it), so this module writes rules for exactly the rules
of the finished page that give an element an endless animation, with the same selector under the state:

    .nx-st-working-dot { animation: pulse 2s infinite; }
    -> html[data-pm-still~="2"] .nx-st-working-dot { animation-play-state: paused !important; }        (direct)

    .activity-item svg { animation: var(--ab-anim, none); }                    (a bare tag: every svg of the page)
    -> html[data-pm-still~="1"] .activity-item { --pm-still-hold: paused; }                                (flag)
       @container style(--pm-still-hold: paused) { .activity-item svg { animation-play-state: paused !important; } }

A direct rule keeps the source rule's subject, so the toggle restyles the elements Blink files that subject under. A
subject that many elements carry (a bare tag, a class on every glyph part, BROAD_* below) is held through its nearest
small ancestor instead: the flag is inherited and a style query reads it from the parent, so the toggle restyles that
ancestor's subtree, not every span or svg of the page; with the flag off the query is false and the pause rule
overrides nothing. The toggle is spread over GROUPS frames (GROUPS below). A subject that is a bare universal (`.x *`)
would restyle the whole page; there is none, and one fails the build. Every rule keeps the @media/@supports blocks it
sits in. `!important` because some loops are set with an !important shorthand (NieR Mode's diamond loaders) and some
inline; nothing in the page sets animation-play-state: running.

What gives an element an endless loop, and how each is reached (the kit's perf-still-page check proves the result: no
endless animation is running in the page while it is still, apart from the exemptions below):
  1. `animation` or `animation-iteration-count` with `infinite` in a <style> block of the page: rules as above.
  2. The same through a custom property (`animation: var(--lens-anim, none)`): the property's values are looked up
     wherever the page's CSS sets them; one that may hold `infinite`, or one that only script sets, counts as endless
     unless SCRIPT_VARS below says what script puts there.
  3. A <style> that script writes at run time (the loaders' #pm-logo-anim): its rules are not in the page's text, so
     14-shell-still.js writes the same direct rules for it when the page goes still (runtime_sheets() finds the
     sheets from the page's scripts and hands their ids to the script as PM_STILL_SHEETS).
  4. An inline style attribute in a script's markup (`<div class="work-progress"><i style="...infinite">`): its tag
     with [style*="infinite"] under its parent's first class, held through that parent (inline_rules()).
Not reached, on purpose: Web Animations made by script (element.animate with iterations: Infinity: the look-change
cover, which is gone before the page can be still, and two NieR Mode effects that run only while a Pod line or the
NieR install plays), the code editor's caret (a closed shadow root, and a text cursor is information), and the
onboarding window and the Guided Tour (the script never sets the state while either is open).
Tests: tools/still_page.test.py (python3 Concepts/onboarding/opus-5.5/tools/still_page.test.py).
"""
from __future__ import annotations

import bisect
import re

STILL_ATTR = 'data-pm-still'
SHEET_ID = 'pm-still-css'
PLAY = 'animation-play-state: paused !important'
# The toggle is spread over GROUPS frames: data-pm-still holds the tokens "1".."4", each rule waits for one of them,
# and the script adds or removes one token a frame (the first inside the waking event). One toggle restyled about 750
# elements of Basic Dark Home in one frame (68 ms of style on the VM's P1000 host; each element of this page costs
# 50-100 us to restyle there, the glyphs' svg parts most); a quarter of that a frame keeps the waking move smooth, and
# every loop is running again four frames after the input. Rules sharing an invalidation key share a group, so a key's
# elements are matched once.
GROUPS = 4
HOLD_VAR = '--pm-still-hold'
HOLD = f'{HOLD_VAR}: paused'
HELD = f'@container style({HOLD})'
# Subject classes that nearly every element of a kind carries, so a rule keyed on them restyles all of those at each
# toggle; measured in Basic Dark Home (2026-11-11, zz-l-keys): .nx on every neon glyph's svg (604 in the page, 172
# drawn), .nx-p on each moving part (386, 133), .nx-h on each part's halo copy (717, 165). A bare tag (span, i, svg,
# circle) is the same and needs no entry. With the tag subjects and these keyed directly, going still restyled ~4,200
# elements (176 ms of style on the VM's P1000 host); keyed on their nearest narrow ancestor, a few hundred.
BROAD_CLASSES = {'nx', 'nx-p', 'nx-h'}
# An attribute that thousands of elements carry: the inline-style rule (`i[style*="infinite"]`) was keyed on style,
# which 4,324 elements of Basic Dark Home have, and cost 85 ms of style per toggle on the VM by itself.
BROAD_ATTRS = {'style'}
SVG_TAGS = {'svg', 'g', 'path', 'circle', 'rect', 'use', 'line', 'polyline', 'polygon', 'ellipse', 'text', 'tspan',
            'defs', 'symbol', 'mask', 'clippath', 'image', 'foreignobject'}

# Custom properties that only script sets (no rule of the page gives them a value) and that an animation value reads
# where an iteration count could stand: what script puts there. True: it may hold `infinite`, so the rule counts as
# endless; False: never an iteration count. A name ending in * covers every name with that start. A var() inside calc()
# or with a <time> fallback is a time, never a count, and needs no entry. One not described here counts as endless and
# is named in the build log, so a new one is never missed (only paused needlessly until described).
SCRIPT_VARS = {
    '--kl': (False, 'a neon glyph part\'s loop keyframes name (glyph-system neon renderer, partStyle)'),
    '--k1': (False, 'a neon glyph part\'s one-shot keyframes name (partStyle)'),
    '--ab-anim-*': (True, 'the Activity bar tone loop that the 5.6 Pro activity bar puts on <body> from TONE_ANIM: '
                          'ab-breathe / ab-alert ... infinite, or none'),
}

# a comment, or a string (which ends at its quote or, unclosed, at the end of its line, as CSS reads it), whichever
# comes first: one pass, so a quote inside a comment (`dashboard's`) or a `/*` inside a string never starts anything
CSS_COMMENT_OR_STRING = re.compile(r'/\*[\s\S]*?(?:\*/|$)|"(?:\\.|[^"\\\n])*"?|\'(?:\\.|[^\'\\\n])*\'?')
GROUP_AT = re.compile(r'@(media|supports|layer|container|document|scope)\b')


class StillError(RuntimeError):
    pass


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


def static_sheets(html: str) -> list[tuple[str, int, str]]:
    """(name, line, body) of every <style> element of the page itself: a <style> inside a script (markup that a script
    writes: an iframe's page, a string) is never read as the page's own style."""
    scripts = [(m.start(), m.end()) for m in re.finditer(r'<script\b[^>]*>.*?</script>', html, re.S | re.I)]
    nl = [m.start() for m in re.finditer('\n', html)]
    out, si, pos = [], 0, 0
    while True:
        m = re.compile(r'<style\b([^>]*)>', re.I).search(html, pos)
        if not m:
            break
        while si < len(scripts) and scripts[si][1] <= m.start():
            si += 1
        if si < len(scripts) and scripts[si][0] <= m.start():
            pos = scripts[si][1]  # inside a script: skip the whole script
            continue
        end = html.find('</style>', m.end())
        if end < 0:
            break
        attrs = m.group(1)
        named = re.search(r'\bid="([^"]+)"', attrs) or re.search(r'\bdata-pm-split-of="([^"]+)"', attrs)
        line = bisect.bisect_left(nl, m.end()) + 1
        out.append((named.group(1) if named else f'style@{line}', line, html[m.end():end]))
        pos = end + 8
    return out


def walk(body: str, line0: int):
    """(context preludes, selector text, declarations text, line, source part) for every style rule of one sheet,
    inside @media/@supports/@layer/@container/@scope blocks too; @keyframes, @font-face and @property bodies are not
    style rules. Comments and strings are blanked first. A rule nested in a style rule (CSS nesting) fails: the page
    has none, and its selector would need resolving against its parent's. The source part is the O55 file a rule comes
    from (read_parts writes `/* ---- css/<file> ---- */` before each)."""
    marks = [(m.start(), m.group(1)) for m in re.finditer(r'/\* ---- ([\w./-]+\.css) ---- \*/', body)]
    clean = CSS_COMMENT_OR_STRING.sub(lambda m: re.sub(r'[^\n]', ' ', m.group(0)) if m.group(0).startswith('/*')
                                      else re.sub(r'[{};,]', ' ', m.group(0)), body)
    nl = [m.start() for m in re.finditer('\n', clean)]
    line_at = lambda i: line0 + bisect.bisect_left(nl, i)
    stack, start, mi, part = [], 0, 0, ''  # ('group', prelude) | ('rule', prelude, start) | ('block', None)
    for m in re.finditer(r'[{};]', clean):
        ch, i = m.group(0), m.start()
        if ch == '{':
            prelude = clean[start:i].strip()
            if stack and stack[-1][0] == 'rule':
                raise StillError(f'nested rule at line {line_at(i)}: `{prelude[:80]}`')
            if prelude.startswith('@'):
                stack.append(('group', ' '.join(prelude.split())) if GROUP_AT.match(prelude) else ('block', None))
            elif '@' in prelude:
                # not a selector (`[data-theme^="retro"] @keyframes pulse {...}` in the shell's wizard CSS): the browser
                # drops the rule with its whole block
                stack.append(('block', None))
            elif all(e[0] == 'group' for e in stack):
                stack.append(('rule', prelude, i + 1))
            else:
                stack.append(('block', None))
            start = i + 1
        elif ch == '}':
            if stack:
                top = stack.pop()
                if top[0] == 'rule':
                    while mi < len(marks) and marks[mi][0] < top[2]:
                        part = marks[mi][1]
                        mi += 1
                    yield tuple(e[1] for e in stack), top[1], clean[top[2]:i], line_at(top[2]), part
            start = i + 1
        elif not stack or stack[-1][0] == 'group':
            start = i + 1  # @import / @charset / @layer a, b;


def declarations(text: str) -> list[tuple[str, str]]:
    out = []
    for d in split_top(text, ';'):
        if ':' in d:
            p, v = d.split(':', 1)
            out.append((p.strip().lower(), v.strip()))
    return out


VAR = re.compile(r'var\(\s*(--[\w-]+)\s*(?:,([^()]*(?:\([^()]*\)[^()]*)*))?\)')


TIME = re.compile(r'^\s*-?[\d.]+m?s\s*$')


def script_var(name: str):
    if name in SCRIPT_VARS:
        return SCRIPT_VARS[name]
    for k, v in SCRIPT_VARS.items():
        if k.endswith('*') and name.startswith(k[:-1]):
            return v
    return None


class Vars:
    """Every custom property's values as the page's CSS sets them, to answer: may this animation value be endless?"""

    def __init__(self, walked):
        self.values: dict[str, list[str]] = {}
        for _sheet, rules in walked:
            for _ctx, _sel, decls, _line, _part in rules:
                for p, v in decls:
                    if p.startswith('--'):
                        self.values.setdefault(p, []).append(v)
        self.script_only: set[str] = set()

    def endless(self, value: str, seen=()) -> bool:
        if re.search(r'(?<![\w-])infinite(?![\w-])', value, re.I):
            return True
        # a var() inside calc() is arithmetic on a time or a number: no iteration count in this page is computed
        bare = value
        while True:
            nxt = re.sub(r'calc\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)', ' 0ms ', bare)
            if nxt == bare:
                break
            bare = nxt
        for m in VAR.finditer(bare):
            name, fallback = m.group(1), (m.group(2) or '').strip()
            if name in seen:
                continue
            if fallback and self.endless(fallback, seen + (name,)):
                return True
            vals = self.values.get(name)
            if vals is not None:
                if any(self.endless(v, seen + (name,)) for v in vals):
                    return True
                continue
            if fallback and not re.match(r'^[\d.]+$', fallback):
                continue  # a time or an easing that script may change (var(--gl-drain, 420ms), var(--lg-xf-ease, linear))
            known = script_var(name)
            if known is not None:
                if known[0]:
                    return True
                continue
            self.script_only.add(name)  # set only by script and not described: counted as endless
            return True
        return False


def space_combinators(sel: str) -> str:
    """The selector with a space on each side of every > + ~ combinator, outside [] and () (`[a~="b"]` stays)."""
    out, depth = [], 0
    for ch in sel:
        if ch in '[(':
            depth += 1
        elif ch in '])':
            depth -= 1
        out.append(f' {ch} ' if depth == 0 and ch in '>+~' else ch)
    return ''.join(out)


def compounds(sel: str) -> list[str]:
    return [c for c in split_top(space_combinators(sel), ' ') if c and c not in '>+~']


def complex_parts(sel: str) -> list[tuple[str, str]]:
    """[(combinator before it, compound)] of one complex selector, left to right; the first combinator is ''."""
    spaced = space_combinators(sel.strip())
    out, comb = [], ''
    for tok in split_top(spaced, ' '):
        if not tok:
            continue
        if tok in '>+~':
            comb = tok
            continue
        out.append((comb or (' ' if out else ''), tok))
        comb = ''
    return out


def join_parts(parts: list[tuple[str, str]]) -> str:
    return ''.join((c if c == ' ' or not c else f' {c} ') + comp for c, comp in parts).strip()


def keys(comp: str) -> tuple[str, set[str], bool, set[str]]:
    """(tag, classes, has an id, attribute names) of one compound, outside its :not()/:is()/:where()/:has() and
    pseudo-elements."""
    bare = re.sub(r':(?:not|has|is|where)\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)|::?[\w-]+(?:\([^()]*\))?', '', comp)
    attrs = set(re.findall(r'\[\s*([\w-]+)', bare))
    rest = re.sub(r'\[[^\]]*\]', '', bare)
    tag = re.match(r'([a-zA-Z][\w-]*)', rest)
    return (tag.group(1).lower() if tag else ''), set(re.findall(r'\.([\w-]+)', rest)), '#' in rest, attrs


def broad(comp: str) -> bool:
    """A subject that many elements carry: a bare tag, only BROAD_CLASSES, or only BROAD_ATTRS (with any pseudo-classes).
    It is keyed on what Blink would file it under: an id, else a class, else an attribute name, else the tag."""
    tag, classes, has_id, attrs = keys(comp)
    if has_id:
        return False
    if classes:
        return classes <= BROAD_CLASSES
    if attrs:
        return attrs <= BROAD_ATTRS
    return bool(tag)


def narrow_ancestor(parts, on_html: set[str]) -> int:
    """The index of the nearest compound left of the subject that few elements match and whose subtree is small: one
    with an id, or a class that is not a BROAD_CLASSES one, never an svg's own element, never <html>/<body> (a flag
    set there would restyle the whole page). -1 when there is none."""
    for i in range(len(parts) - 2, -1, -1):
        comp = parts[i][1]
        tag, classes, has_id, _attr = keys(comp)
        if tag in SVG_TAGS or tag in ('html', 'body') or comp.startswith(':root') or could_be_html(comp, on_html):
            continue
        if has_id or (classes - BROAD_CLASSES):
            return i
    return -1


def subject_is_bare(sel: str) -> bool:
    """True when the last compound (pseudo-elements set aside) gives a style invalidation set nothing to key on."""
    last = compounds(sel)[-1]
    last = re.sub(r'::?(?:before|after|marker|placeholder|selection|backdrop|first-line|first-letter)\b(\([^)]*\))?', '', last)
    keyed = re.sub(r':(?:not|has)\((?:[^()]*|\([^()]*\))*\)', '', last)
    keyed = re.sub(r':[\w-]+(\((?:[^()]*|\([^()]*\))*\))?', lambda m: m.group(0) if re.match(r':(?:is|where)\(', m.group(0)) else '', keyed)
    return not re.search(r'[.#\[]|^[a-zA-Z]|:(?:is|where)\(\s*[.#\[a-zA-Z]', keyed.strip())


def could_be_html(comp: str, on_html: set[str]) -> bool:
    """A first compound with no tag and no id whose classes are all ones script puts on <html> (attributes and
    pseudo-classes only, mostly: `[data-theme^="glass"]`, `:is([data-theme^="nier"], [data-o55-nier="on"])`). An
    :is()/:where() whose every argument names another class cannot be <html> either."""
    if re.match(r'[a-zA-Z*|]', comp) or '#' in re.sub(r'\[[^\]]*\]', '', comp):
        return False
    for m in re.finditer(r':(?:is|where)\(((?:[^()]|\([^()]*\))*)\)', comp):
        args = [a for a in split_top(m.group(1), ',') if a.strip()]
        if args and all(set(re.findall(r'\.([\w-]+)', re.sub(r'\[[^\]]*\]', '', a))) - on_html for a in args):
            return False
    outside = re.sub(r'\[[^\]]*\]|:(?:not|has|is|where)\((?:[^()]|\([^()]*\))*\)', '', comp)
    return all(c in on_html for c in re.findall(r'\.([\w-]+)', outside))


def state(group: int) -> str:
    return f'[{STILL_ATTR}~="{group}"]'


def stilled(sel: str, on_html: set[str], group: int = 1) -> list[str]:
    """The selector under html[data-pm-still~="<group>"]. The state is on <html>, so a first compound that IS <html>
    (`html...`, `:root...`) takes the attribute itself; one that could be <html> (`[data-theme^="glass"] .x`:
    data-theme is on <html>) is written both ways; any other only as a descendant of <html>."""
    sel, at = sel.strip(), state(group)
    head = re.match(r'(html|:root)(?![\w-])', sel)
    if head:
        return [sel[:head.end()] + at + sel[head.end():]]
    comps = compounds(sel)
    out = [f'html{at} {sel}']
    if len(comps) > 1 and could_be_html(comps[0], on_html):
        out.append(f'html{at}{sel}')
    return out


def blink_key(comp: str) -> str:
    """What Blink files an invalidation for this compound under: its id, else its first class, else its first
    attribute name, else its tag (an :is()/:where() argument's when the compound has none of its own)."""
    bare = re.sub(r':(?:not|has)\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)|::?[\w-]+(?=$|[^\w(-])', '', comp)
    inner = re.findall(r':(?:is|where)\(((?:[^()]|\([^()]*\))*)\)', bare)
    bare = re.sub(r':(?:is|where)\((?:[^()]|\([^()]*\))*\)', '', bare)
    for pat, pre in ((r'#([\w-]+)', '#'), (r'\.([\w-]+)', '.'), (r'\[\s*([\w-]+)', '['), (r'^([a-zA-Z][\w-]*)', '')):
        m = re.search(pat, re.sub(r'\[[^\]]*\]', '', bare) if pre != '[' else bare)
        if m:
            return pre + m.group(1)
    for arg in inner:
        last = compounds(split_top(arg, ',')[0])[-1] if arg.strip() else ''
        if last:
            return blink_key(last)
    return '*'


def endless_rules(html: str):
    """[(sheet, line, part, context, selectors, why)] for every rule of the page's own <style> blocks that gives an
    element an endless animation, and the notes for the build log."""
    sheets = static_sheets(html)
    if any(name == SHEET_ID for name, _l, _b in sheets):
        raise StillError(f'the page already has a <style id="{SHEET_ID}">')
    # only declarations that can matter are parsed: animations and custom properties
    walked = [(name, [(ctx, sel, declarations(decls), line, part) for ctx, sel, decls, line, part in walk(body, line0)
                      if 'animation' in decls or '--' in decls])
              for name, line0, body in sheets]
    vars_ = Vars(walked)
    found = []
    for name, rules in walked:
        for ctx, sel, decls, line, part in rules:
            why = ''
            for p, v in decls:
                if p in ('animation', 'animation-iteration-count') and vars_.endless(v):
                    why = f'{p}: {" ".join(v.split())[:90]}'
            if why:
                sels = [' '.join(x.split()) for x in split_top(sel, ',') if x.strip()]
                found.append((name, line, part, ctx, sels, why))
    notes = [f'still page: {v} is set only by script and an animation reads it where an iteration count could stand; '
             f'counted as endless (say what script puts there in tools/still_page.py SCRIPT_VARS)' for v in sorted(vars_.script_only)]
    return found, notes


def html_classes(html: str) -> set[str]:
    """Classes that script puts on <html> itself (documentElement.classList.add('...'))."""
    return set(re.findall(r"documentElement\.classList\.(?:add|toggle)\('([\w-]+)'", html))


def runtime_sheets(html: str) -> list[str]:
    """Ids of the <style> elements that a script makes and fills with endless animations (the loaders' #pm-logo-anim):
    a script that creates a <style id="..."> and whose text writes `animation:... infinite` rules into a template."""
    ids = set()
    for m in re.finditer(r'<script\b[^>]*>(.*?)</script>', html, re.S | re.I):
        js = m.group(1)
        if not re.search(r'animation\s*:[^`\'"]*\binfinite\b', js) or 'createElement(\'style\')' not in js:
            continue
        if not re.search(r'`[^`]*\{\s*animation\s*:[^`]*\binfinite\b|`[^`]*\$\{ANIM\(|ANIM\s*=\s*\([^)]*\)\s*=>\s*`animation', js):
            continue
        for s in re.finditer(r"createElement\('style'\)\s*;\s*(?:\w+\.)?\w+\.id\s*=\s*'([\w-]+)'|createElement\('style'\);\s*\w+\.id\s*=\s*'([\w-]+)'", js):
            ids.add(s.group(1) or s.group(2))
    return sorted(ids)


def inline_rules(html: str) -> list[str]:
    """Selectors for the elements that a script's markup gives an inline endless animation: the element's tag with
    [style*="infinite"], under its parent's first class when the markup names one (`.work-progress > i[...]`)."""
    out = []
    for m in re.finditer(r'<script\b[^>]*>(.*?)</script>', html, re.S | re.I):
        js = m.group(1)
        for t in re.finditer(r'<([a-zA-Z][\w-]*)\b[^<>]*?\bstyle=\\?["\'][^"\'<>]*animation[^"\'<>]*\binfinite\b', js):
            tag = t.group(1).lower()
            parent = re.search(r'<[a-zA-Z][\w-]*\s[^<>]*?\bclass=\\?["\']([\w-]+)[^<>]*>\s*$', js[max(0, t.start() - 300):t.start()])
            sel = (f'.{parent.group(1)} > ' if parent else '') + f'{tag}[style*="infinite"]'
            if sel not in out:
                out.append(sel)
    return out


def generate(html: str):
    """(the generated stylesheet's text, stats, notes). Each selector of an endless rule gets, in the rule's own
    @media/@supports blocks, either
      direct:  html[data-pm-still] <selector> { animation-play-state: paused !important; }   (keyed on its subject), or
      flagged: html[data-pm-still] <selector up to its nearest narrow ancestor> { --pm-still-hold: paused; }
               @container style(--pm-still-hold: paused) { <selector> { animation-play-state: paused !important; } }
    when its subject is broad (a bare tag, or a class on every glyph part): the toggle then restyles that ancestor and
    its subtree (the flag is inherited, and a style query reads it from the parent), not every span or every glyph
    part of the page. With the flag off the query is false, so the pause rule overrides nothing."""
    found, notes = endless_rules(html)
    on_html = html_classes(html)
    bare = [f'{n}:{line} `{s}`' for n, line, _p, _c, sels, _w in found for s in sels if subject_is_bare(s)]
    if bare:
        raise StillError('an endless animation on a bare universal subject would make the still toggle restyle the '
                         'whole page; give the rule a class subject: ' + '; '.join(bare[:6]))
    inline = inline_rules(html)
    found = found + [('script markup', 0, '', (), [sel], 'inline style') for sel in inline]
    groups: dict[tuple, list[str]] = {}
    order: list[tuple] = []
    seen: set = set()
    counts = {'direct': 0, 'flagged': 0, 'broad_direct': 0}

    def emit(ctx, text):
        if (ctx, text) in seen:
            return
        seen.add((ctx, text))
        if ctx not in groups:
            groups[ctx] = []
            order.append(ctx)
        groups[ctx].append(text)

    # first the toggling rules, each with its key: [(ctx, kind, selector without the state, key)]
    toggling = []
    for name, line, part, ctx, sels, why in found:
        for s in sels:
            parts = complex_parts(s)
            subject = parts[-1][1]
            if broad(subject):
                i = narrow_ancestor(parts, on_html)
                if i >= 0:
                    toggling.append((ctx, 'flag', join_parts(parts[:i + 1]), blink_key(parts[i][1]), s))
                    counts['flagged'] += 1
                    continue
                counts['broad_direct'] += 1
                notes.append(f'still page: `{s[:100]}` ({name}:{line}) has a broad subject and no narrow ancestor: '
                             f'keyed on its subject, so each toggle restyles every element of that kind')
            toggling.append((ctx, 'direct', s, blink_key(subject), s))
            counts['direct'] += 1
    # keys to groups, heaviest first, each to the lightest group (a flag restyles its element's subtree: weight 6)
    weight: dict[str, int] = {}
    for _ctx, kind, _sel, key, _src in toggling:
        weight[key] = weight.get(key, 0) + (6 if kind == 'flag' else 1)
    load, group_of = [0] * GROUPS, {}
    for key in sorted(weight, key=lambda k: (-weight[k], k)):
        g = min(range(GROUPS), key=lambda i: (load[i], i))
        group_of[key] = g + 1
        load[g] += weight[key]
    for ctx, kind, sel, key, src in toggling:
        g = group_of[key]
        if kind == 'flag':
            emit(ctx, f'{", ".join(stilled(sel, on_html, g))} {{ {HOLD}; }}')
            emit(ctx + (HELD,), f'{src} {{ {PLAY}; }}')
        else:
            emit(ctx, f'{", ".join(stilled(sel, on_html, g))} {{ {PLAY}; }}')
    counts['group_weights'] = load
    lines = []
    for ctx in order:
        body = '\n'.join(groups[ctx])
        for at in reversed(ctx):
            body = f'{at} {{\n{body}\n}}'
        lines.append(body)
    css = '\n'.join(lines)
    stats = {'rules': len(found), 'emitted': len(seen), 'sheets': len({f[0] for f in found}), **counts,
             'inline': inline, 'runtime_sheets': runtime_sheets(html)}
    return css, stats, notes


def lint(css: str) -> list[str]:
    """The generated sheet holds only its three kinds of rule: a direct pause or a flag, each under one group of
    html[data-pm-still~="1".."4"], and a pause inside @container style(--pm-still-hold: paused)."""
    problems = []
    for ctx, sel, decls, line, _part in walk(css, 1):
        body = ' '.join(decls.split()).rstrip(';').strip()
        held = HELD in ctx
        if held:
            if body != PLAY:
                problems.append(f'line {line}: a held rule sets `{body[:60]}`')
            continue
        if body not in (PLAY, HOLD):
            problems.append(f'line {line}: a rule sets `{body[:60]}`')
        for one in split_top(sel, ','):
            if not re.search(r'\[' + STILL_ATTR + r'~="[1-' + str(GROUPS) + r']"\]', compounds(one)[0]):
                problems.append(f'line {line}: `{one.strip()[:80]}` is not under html[{STILL_ATTR}~="1..{GROUPS}"]')
    return problems


def apply(whole: str, built: str):
    """Insert the generated sheet before </head> in the page before the viewport split (whole) and in the published
    page (built), generated from the whole page so every rule's @media block is in view. Returns (whole, built, note)."""
    css, stats, notes = generate(whole)
    head = ('<!-- PM-STILL:CSS:START (tools/still_page.py: the still page\'s pause rules, generated; never hand-edit) -->\n'
            f'<style id="{SHEET_ID}">\n{css}\n</style>\n<!-- PM-STILL:CSS:END -->\n')
    anchor = re.compile(r'^</head>\s*\n<body\b', re.M)
    out = []
    for text in (whole, built):
        hits = list(anchor.finditer(text))
        if len(hits) != 1:
            raise StillError(f'</head> followed by <body> found {len(hits)} times (need exactly 1)')
        out.append(text[:hits[0].start()] + head + text[hits[0].start():])
    runtime = stats['runtime_sheets']
    js_data = f'window.PM_STILL_SHEETS={runtime!r};'.replace("'", '"')
    for i, text in enumerate(out):
        n = text.count('window.PM_STILL_SHEETS=[];')
        if n != 1:
            raise StillError(f'the still script\'s sheet list `window.PM_STILL_SHEETS=[];` found {n} times (need exactly 1)')
        out[i] = text.replace('window.PM_STILL_SHEETS=[];', js_data, 1)
    stats['notes'] = notes
    stats['bytes'] = len(css)
    return out[0], out[1], stats


if __name__ == '__main__':
    import json
    import sys
    page = open(sys.argv[1], encoding='utf-8').read()
    css, stats, notes = generate(page)
    if len(sys.argv) > 2:
        open(sys.argv[2], 'w', encoding='utf-8').write(css)
    print(json.dumps(stats, indent=1))
    for n in notes:
        print('NOTE:', n)
