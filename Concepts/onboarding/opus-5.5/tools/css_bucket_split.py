#!/usr/bin/env python3
"""Exact selector rewrite that lets Blink bucket rules it would otherwise match against every element.

Blink files a style rule under its subject compound's id, class, attribute or tag, and only tries it on elements that
carry that key. A subject compound that is just a multi-argument `:is(.a, .b)` or `:where(.a, .b)` has no key of its
own, so the rule lands in the universal bucket and is matched against every element in every whole-document restyle
(a look or NieR switch). A multi-argument `:is()` in an ancestor compound likewise gives the ancestor Bloom filter no
hash to reject on.

For a complex selector whose subject compound has no id, class, attribute or tag, this splits one multi-argument
`:is()`/`:where()` (the subject's, else the rightmost ancestor compound's) into a selector list of single-argument
parts. The result is the same selector, part by part:
  * matching: `:is(a, b)` at one position is the union of `:is(a)` and `:is(b)` there;
  * specificity: `:is()` counts its most specific argument whichever one matched; when the arguments differ, a part
    whose argument is less specific is written `:where(arg)` plus an always-matching pad worth the maximum
    (`:not(.t7.t7:not(*))` is (0,2,0) and matches every element), so every part keeps the original specificity;
  * forgiving parsing: every part keeps its argument inside `:is()`/`:where()`, so an argument the browser does not
    support still drops only that part;
  * cascade order: the rule keeps its place and its declarations; only its prelude changes.
Rules with nested rules inside, and anything inside @keyframes/@font-face/@property/@page, are left alone.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

GROUP_AT = re.compile(r'@(media|supports|layer|container|document|scope)\b', re.I)
LEGACY_PE = {'before', 'after', 'first-line', 'first-letter'}


# ---- tokenizer helpers ---------------------------------------------------------------------------------------------
def _scan(s: str):
    """Yield (index, char, depth) for top-level-relevant chars, skipping strings and escapes."""
    depth, quote, i = 0, '', 0
    while i < len(s):
        ch = s[i]
        if ch == '\\':
            i += 2
            continue
        if quote:
            if ch == quote:
                quote = ''
            i += 1
            continue
        if ch in '"\'':
            quote = ch
        elif ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        else:
            yield i, ch, depth
        i += 1


def split_top(s: str, sep: str = ',') -> list[str]:
    out, start = [], 0
    for i, ch, depth in _scan(s):
        if depth == 0 and ch == sep:
            out.append(s[start:i])
            start = i + 1
    out.append(s[start:])
    return [x.strip() for x in out]


def compound_spans(s: str) -> list[tuple[int, int]]:
    """[start, end) of each top-level compound of one complex selector (combinators: whitespace > + ~)."""
    out, start = [], 0
    for i, ch, depth in _scan(s):
        if depth == 0 and (ch.isspace() or ch in '>+~'):
            if i > start:
                out.append((start, i))
            start = i + 1
    if len(s) > start:
        out.append((start, len(s)))
    return out


WORD = re.compile(r'(?:[\w\-\u00a0-\uffff]|\\[0-9a-fA-F]{1,6}\s?|\\.)+')


def simples(comp: str):
    """Top-level simple selectors of a compound: dicts with kind, name, args, start, end; None if unknown syntax."""
    out, i = [], 0
    while i < len(comp):
        st, ch = i, comp[i]
        if ch == '[':
            depth, quote = 0, ''
            while i < len(comp):
                c = comp[i]
                if c == '\\':
                    i += 2
                    continue
                if quote:
                    quote = '' if c == quote else quote
                elif c in '"\'':
                    quote = c
                elif c == '[':
                    depth += 1
                elif c == ']':
                    depth -= 1
                    if depth == 0:
                        i += 1
                        break
                i += 1
            out.append({'kind': 'attr', 'start': st, 'end': i})
            continue
        if ch in '.#':
            m = WORD.match(comp, i + 1)
            if not m:
                return None
            i = m.end()
            out.append({'kind': 'class' if ch == '.' else 'id', 'start': st, 'end': i})
            continue
        if ch == '*':
            i += 1
            out.append({'kind': 'universal', 'start': st, 'end': i})
            continue
        if ch == ':':
            pe = comp.startswith('::', i)
            i += 2 if pe else 1
            m = re.compile(r'[\w\-]+').match(comp, i)
            if not m:
                return None
            name = m.group(0).lower()
            i = m.end()
            args = None
            if i < len(comp) and comp[i] == '(':
                depth, quote, a0 = 0, '', i
                while i < len(comp):
                    c = comp[i]
                    if c == '\\':
                        i += 2
                        continue
                    if quote:
                        quote = '' if c == quote else quote
                    elif c in '"\'':
                        quote = c
                    elif c == '(':
                        depth += 1
                    elif c == ')':
                        depth -= 1
                        if depth == 0:
                            i += 1
                            break
                    i += 1
                args = comp[a0 + 1:i - 1]
            out.append({'kind': 'pseudo-element' if pe else 'pseudo-class', 'name': name, 'args': args,
                        'start': st, 'end': i})
            continue
        m = WORD.match(comp, i) or re.compile(r'[\w\-|]+').match(comp, i)
        if m and m.end() > i:
            i = m.end()
            out.append({'kind': 'tag', 'start': st, 'end': i})
            continue
        return None
    return out


# ---- specificity ---------------------------------------------------------------------------------------------------
def _add(a, b):
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def spec_list(lst: str):
    best = (0, 0, 0)
    for part in split_top(lst):
        if not part:
            continue
        sp = spec_complex(part)
        if sp is None:
            return None
        best = max(best, sp)
    return best


def spec_complex(s: str):
    total = (0, 0, 0)
    for a, b in compound_spans(s):
        sp = spec_compound(s[a:b])
        if sp is None:
            return None
        total = _add(total, sp)
    return total


def spec_compound(comp: str):
    ss = simples(comp)
    if ss is None:
        return None
    t = (0, 0, 0)
    for x in ss:
        k = x['kind']
        if k == 'id':
            t = _add(t, (1, 0, 0))
        elif k in ('class', 'attr'):
            t = _add(t, (0, 1, 0))
        elif k == 'tag':
            t = _add(t, (0, 0, 1))
        elif k == 'pseudo-element':
            if x['args'] is not None:
                return None
            t = _add(t, (0, 0, 1))
        elif k == 'pseudo-class':
            n = x['name']
            if n == 'where':
                continue
            if n in ('is', 'not', 'has', 'matches'):
                sp = spec_list(x['args'] or '')
                if sp is None:
                    return None
                t = _add(t, sp)
            elif n in ('nth-child', 'nth-last-child'):
                t = _add(t, (0, 1, 0))
                m = re.search(r'\bof\b([\s\S]*)$', x['args'] or '')
                if m:
                    sp = spec_list(m.group(1))
                    if sp is None:
                        return None
                    t = _add(t, sp)
            elif n in LEGACY_PE:
                t = _add(t, (0, 0, 1))
            elif n in ('host', 'host-context', 'slotted'):
                return None
            else:
                t = _add(t, (0, 1, 0))
    return t


def pad(S) -> str:
    """An always-matching compound of specificity S: :not(X) where X ends in :not(*) and so never matches."""
    out = ''
    if S[0] or S[1]:
        out += ':not(' + '#t7' * S[0] + '.t7' * S[1] + ':not(*))'
    out += ':not(t7:not(*))' * S[2]
    return out


def _multi(x) -> bool:
    return (x['kind'] == 'pseudo-class' and x['name'] in ('is', 'where') and x['args'] is not None
            and len([a for a in split_top(x['args']) if a]) > 1)


def rewrite_complex(cx: str, stats: dict, ancestors: bool = True):
    """An equivalent list of complex selectors for cx, or None when cx is left alone."""
    spans = compound_spans(cx)
    if not spans:
        return None
    subj = simples(cx[spans[-1][0]:spans[-1][1]])
    if subj is None:
        stats['unparsed'] += 1
        return None
    if any(x['kind'] in ('id', 'class', 'attr', 'tag') for x in subj):
        return None
    at, target = -1, None
    for k in range(len(spans) - 1, -1, -1):
        if k < len(spans) - 1 and not ancestors:
            break
        sm = simples(cx[spans[k][0]:spans[k][1]])
        if sm is None:
            stats['unparsed'] += 1
            return None
        t = next((x for x in sm if _multi(x)), None)
        if t:
            at, target = spans[k][0], t
            if k < len(spans) - 1:
                stats['ancestor'] += 1
            break
    if not target:
        return None
    head, tail = cx[:at + target['start']], cx[at + target['end']:]
    args = [a for a in split_top(target['args']) if a]
    if target['name'] == 'is':
        specs = [spec_complex(a) for a in args]
        if any(s is None for s in specs):
            stats['spec_unknown'] += 1
            return None
        if len(set(specs)) > 1:
            stats['padded'] += 1
            S = max(specs)
            return [head + (f':is({a})' if sp == S else f':where({a}){pad(S)}') + tail for a, sp in zip(args, specs)]
    return [head + f':{target["name"]}({a})' + tail for a in args]


# ---- stylesheet pass -----------------------------------------------------------------------------------------------
def norm(sel: str) -> str:
    """A selector with whitespace collapsed and combinators/commas spaced the way CSSOM serializes them."""
    out, last = [], 0
    for i, ch, depth in _scan(sel):
        if ch in '>+~' and depth == 0 or ch == ',':
            out.append(sel[last:i])
            out.append(' ' + ch + ' ' if ch != ',' else ', ')
            last = i + 1
    out.append(sel[last:])
    return ' '.join(''.join(out).split())


def rewrite_css(css: str, ancestors: bool = True, exclude: frozenset = frozenset()) -> tuple[str, dict]:
    """Rewrite every eligible style rule prelude in a stylesheet. Returns (css, stats)."""
    stats = {'rules': 0, 'changed': 0, 'selectors_in': 0, 'selectors_out': 0, 'unparsed': 0, 'spec_unknown': 0,
             'padded': 0, 'ancestor': 0, 'skipped_nested': 0, 'skipped_comment': 0, 'excluded': 0}
    out, stack, start, i, n = [], [], 0, 0, len(css)
    last = 0
    # stack entries: 'group' (@media and the like: holds rules), 'rule' (a style rule body), 'block' (anything else)
    while i < n:
        ch = css[i]
        if css.startswith('/*', i):
            j = css.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        if ch in '"\'':
            j = i + 1
            while j < n and css[j] != ch:
                j += 2 if css[j] == '\\' else 1
            i = j + 1
            continue
        if ch == '\\':
            i += 2
            continue
        if ch == '{':
            prelude_raw = css[start:i]
            prelude = _lead_comments_off(prelude_raw).strip()
            if prelude.startswith('@'):
                stack.append('group' if GROUP_AT.match(prelude) else 'block')
            elif all(k == 'group' for k in stack):
                stack.append('rule')
                stats['rules'] += 1
                body_end = _block_end(css, i)
                if '{' in _strip_strings_comments(css[i + 1:body_end]):
                    stats['skipped_nested'] += 1
                elif '/*' in _lead_comments_off(prelude_raw):
                    stats['skipped_comment'] += 1
                elif prelude:
                    parts = split_top(_lead_comments_off(prelude_raw).strip())
                    new_parts, touched = [], False
                    for p in parts:
                        if p and norm(p) in exclude:
                            stats['excluded'] += 1
                            new_parts.append(p)
                            continue
                        rw = rewrite_complex(p, stats, ancestors) if p else None
                        if rw:
                            touched = True
                            new_parts.extend(rw)
                        else:
                            new_parts.append(p)
                    if touched:
                        stats['changed'] += 1
                        stats['selectors_in'] += len(parts)
                        stats['selectors_out'] += len(new_parts)
                        body = _lead_comments_off(prelude_raw)
                        lead = prelude_raw[:len(prelude_raw) - len(body)]
                        trail = prelude_raw[len(prelude_raw.rstrip()):]
                        out.append(css[last:start])
                        out.append(lead + ',\n'.join(new_parts) + trail)
                        last = i
            else:
                stack.append('block')
            start = i + 1
        elif ch == '}':
            if stack:
                stack.pop()
            start = i + 1
        elif ch == ';' and (not stack or stack[-1] == 'group'):
            start = i + 1
        i += 1
    out.append(css[last:])
    return ''.join(out), stats


def _lead_comments_off(s: str) -> str:
    """s without the whitespace and comments before its first token."""
    while True:
        t = s.lstrip()
        if not t.startswith('/*'):
            return t
        j = t.find('*/', 2)
        s = '' if j < 0 else t[j + 2:]


def _strip_strings_comments(s: str) -> str:
    s = re.sub(r'/\*[\s\S]*?\*/', '', s)
    return re.sub(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'', '""', s)


def _block_end(css: str, open_at: int) -> int:
    depth, i, n = 0, open_at, len(css)
    while i < n:
        ch = css[i]
        if css.startswith('/*', i):
            j = css.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        if ch in '"\'':
            j = i + 1
            while j < n and css[j] != ch:
                j += 2 if css[j] == '\\' else 1
            i = j + 1
            continue
        if ch == '\\':
            i += 2
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return n


def rewrite_html(html: str, ancestors: bool = True, exclude: frozenset = frozenset()) -> tuple[str, dict]:
    """Apply rewrite_css to every <style> block of a page."""
    total: dict = {}
    def one_css(text):
        css, st = rewrite_css(text, ancestors, exclude)
        for k, v in st.items():
            total[k] = total.get(k, 0) + v
        return css
    # only real <style> elements: never text inside a <script> (a script may hold '<style' in a string or regex)
    pieces, pos = [], 0
    tag = re.compile(r'<(script|style)\b[^>]*>', re.I)
    while True:
        m = tag.search(html, pos)
        if not m:
            break
        close = re.compile(r'</' + m.group(1) + r'\s*>', re.I).search(html, m.end())
        if not close:
            break
        pieces.append(html[pos:m.end()])
        inner = html[m.end():close.start()]
        if m.group(1).lower() == 'style':
            total['style_blocks'] = total.get('style_blocks', 0) + 1
            inner = one_css(inner)
        pieces.append(inner)
        pos = close.start()
    pieces.append(html[pos:])
    return ''.join(pieces), total


EXCLUDE_FILE = Path(__file__).resolve().with_name('css_bucket_split_exclude.json')


def apply(html: str) -> tuple[str, dict]:
    """The published pass (the last step of build.build_text()): every real <style> block, less the excluded rules."""
    exclude = frozenset(norm(x) for x in json.loads(EXCLUDE_FILE.read_text(encoding='utf-8'))['selectors'])
    return rewrite_html(html, ancestors=True, exclude=exclude)


if __name__ == '__main__':
    import sys
    src, dst = sys.argv[1], sys.argv[2]
    new, st = apply(Path(src).read_text(encoding='utf-8'))
    Path(dst).write_text(new, encoding='utf-8')
    print(json.dumps(st))
