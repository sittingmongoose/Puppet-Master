#!/usr/bin/env python3
"""Sheet split that keeps a window or frame resize from restyling the whole page (SW-36, 2026-11-05).

When a media query's result changes, Blink rebuilds the rule set of every stylesheet that holds that query and schedules
style invalidation for the selectors of every rule in that sheet, not only for the rules inside the query. PMConcept7's
sheets are large (the chat's pm56-css is 1.4 MB, the shell's first sheet 285 KB), so crossing one width boundary
restyled every element of the page before the frame at the new size: 6,200-6,900 elements, 330-450 ms on the P1000 VM,
in the resize that turns docked Activity Detail into a cover at 1177 px (1390 -> 1177 crosses (max-width: 1320px),
1180px, 1179px and (max-aspect-ratio: 4/3) in six sheets). A three-rule test page shows the same: a query that flips in a
sheet restyles everything any rule of that sheet matches; the same query in a sheet of its own restyles nothing else.

This puts each top-level viewport @media block (width, height, aspect-ratio, orientation) in a <style> of its own, in
place between the two parts of the sheet it came from, with the block's condition also as the element's media
attribute. A boundary crossing then invalidates only the rules of the block that flipped, and a part whose condition
does not match is not an active sheet, so it adds nothing to rule matching (thread time per restyled element in a
forced whole-page restyle: 51.1 us before, 51.7 us after, within noise; the same split without the media attribute,
every part active, cost 54.7 us).

Nothing else changes:
  * cascade: the parts stay consecutive and in their original order, and author sheets cascade in document order, so
    every rule keeps its place relative to every other rule;
  * the block keeps its own @media rule inside its part, so code that walks cssRules sees the same @media rule with
    the same condition (the look-scale walker copies rules with their @media context);
  * the first part keeps the original element's attributes (its id) and everything before the first viewport block;
    later parts carry data-pm-split-of="<id>". apply() checks that the parts of every sheet add up to it byte for byte,
    and that each anchor in first_part_anchors (text a page script finds through getElementById(id).sheet) is still
    in that sheet's first part;
  * a sheet with @import or @namespace is left whole (both apply only to their own sheet), and so is a <style> that
    already has a media attribute.
"""
from __future__ import annotations

import html as htmllib
import json
import re
from pathlib import Path

VIEWPORT = re.compile(r'\b(?:min-|max-)?(?:device-)?(?:width|height|aspect-ratio)\b|\borientation\b', re.I)
PER_SHEET = re.compile(r'@(?:import|namespace)\b', re.I)
COMMENT = re.compile(r'/\*[\s\S]*?\*/')


def _blank(text: str) -> bool:
    return not COMMENT.sub('', text).strip()


def viewport_blocks(css: str):
    """Yield (start, end, condition) of each top-level @media block whose condition depends on the viewport size."""
    i, n, depth, stmt, head = 0, len(css), 0, 0, None
    while i < n:
        if css.startswith('/*', i):
            j = css.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        ch = css[i]
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
            if depth == 0:
                head = re.match(r'((?:\s|/\*[\s\S]*?\*/)*)@media\b([^{]*)$', css[stmt:i])
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                if head:
                    cond = ' '.join(COMMENT.sub('', head.group(2)).split())
                    if VIEWPORT.search(cond):
                        yield stmt + head.end(1), i + 1, cond
                head, stmt = None, i + 1
        elif ch == ';' and depth == 0:
            stmt = i + 1
        i += 1


def split_css(css: str) -> list[tuple[str | None, str]]:
    """[(media condition or None, text)] in order; the texts add up to css. One part when nothing splits."""
    if PER_SHEET.search(COMMENT.sub('', css)):
        return [(None, css)]
    parts: list[tuple[str | None, str]] = []
    pos = 0
    for start, end, cond in viewport_blocks(css):
        between = css[pos:start]
        if not parts:
            parts.append((None, between))   # the first part: everything before the first block, even if empty
        elif _blank(between):
            parts[-1] = (parts[-1][0], parts[-1][1] + between)   # whitespace or comments join the part before
        else:
            parts.append((None, between))
        parts.append((cond, css[start:end]))
        pos = end
    if not parts:
        return [(None, css)]
    tail = css[pos:]
    if _blank(tail):
        parts[-1] = (parts[-1][0], parts[-1][1] + tail)
    else:
        parts.append((None, tail))
    return parts


def apply(page: str, first_part_anchors: dict[str, list[str]] | None = None) -> tuple[str, dict]:
    """Every real <style> element of the finished page (never text inside a <script>)."""
    anchors = dict(first_part_anchors or {})
    stats = {'sheets_split': 0, 'viewport_parts': 0, 'style_elements_added': 0}
    pieces, pos = [], 0
    tag = re.compile(r'<(script|style)\b([^>]*)>', re.I)
    while True:
        m = tag.search(page, pos)
        if not m:
            break
        close = re.compile(r'</' + m.group(1) + r'\s*>', re.I).search(page, m.end())
        if not close:
            break
        if m.group(1).lower() != 'style' or re.search(r'\bmedia\s*=', m.group(2), re.I):
            pieces.append(page[pos:close.end()])
            pos = close.end()
            continue
        css = page[m.end():close.start()]
        parts = split_css(css)
        if ''.join(text for _, text in parts) != css:
            raise ValueError(f'css_media_split: the parts of the <style{m.group(2)}> at {m.start()} do not add up to it')
        idm = re.search(r'\bid="([^"]+)"', m.group(2))
        sheet = idm.group(1) if idm else None
        for anchor in anchors.pop(sheet, []) if sheet else []:
            if anchor not in parts[0][1]:
                raise ValueError(f'css_media_split: {anchor!r} must stay in the first part of #{sheet} (a page script '
                                 'reads that sheet by its id)')
        pieces.append(page[pos:m.start()])
        if len(parts) == 1:
            pieces.append(page[m.start():close.end()])
        else:
            of = sheet or f'style@{m.start()}'
            stats['sheets_split'] += 1
            stats['viewport_parts'] += sum(1 for cond, _ in parts if cond)
            stats['style_elements_added'] += len(parts) - 1
            for k, (cond, text) in enumerate(parts):
                attrs = m.group(2) if k == 0 else f' data-pm-split-of="{of}"'
                if cond:
                    attrs += f' media="{htmllib.escape(cond, quote=True)}"'
                pieces.append(f'<style{attrs}>{text}</style>')
        pos = close.end()
    pieces.append(page[pos:])
    if anchors:
        raise ValueError(f'css_media_split: no <style> with id {sorted(anchors)} for its first-part anchors')
    return ''.join(pieces), stats


def join(page: str) -> str:
    """The page with the split undone: what apply() was given."""
    return re.sub(r'</style><style data-pm-split-of="[^"]*"(?: media="[^"]*")?>', '', page)


if __name__ == '__main__':
    import sys
    new, st = apply(Path(sys.argv[1]).read_text(encoding='utf-8'))
    Path(sys.argv[2]).write_bytes(new.encode('utf-8'))
    print(json.dumps(st))
