#!/usr/bin/env python3
"""T2 (P1000 speed team): give the 13 '<compound with .active> *' rules a featured descendant.

Blink files invalidation by feature, not by compound. One rule of the form `X.active *` (or `:where(*)`, or `> *`)
makes the whole invalidation set of the class `active` "invalidate subtree", so every `.active` toggle anywhere
restyles the toggled element's whole subtree. A page switch removes `.active` from the outgoing page, so the outgoing
Home (~1,530 elements) was restyled inside the switch's layout (pm7-p1000-astra, astra/t2-basic.subtree-cause.json).

This step runs last in build.build_text(). It replaces each of those selectors in the composed page with the same
selector whose descendant names the classes and element types it reaches today (active_descendant_rules.json; both
`*` and `:where(...)` have specificity 0), or drops the arm for the two carriers that hold text only. Declarations,
rule order and every other selector are untouched. In the published page every original must be found exactly once.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

RULES_FILE = Path(__file__).resolve().with_name('active_descendant_rules.json')
TIGHT = set(',>()+~')


def _pattern(sel: str) -> str:
    """A regex for sel that tolerates any whitespace the sources wrote: none needed next to , > ( ) + ~, at least one
    for a descendant combinator. Runs of optional whitespace are emitted once, so the regex cannot backtrack badly."""
    sel = re.sub(r'\s*([,>()+~])\s*', r'\1', sel.strip())
    parts: list[str] = []
    def opt():
        if not parts or parts[-1] != r'\s*':
            parts.append(r'\s*')
    for ch in sel:
        if ch.isspace():
            if parts and parts[-1] == r'\s+':
                continue
            parts.append(r'\s+')
        elif ch in TIGHT:
            opt(); parts.append(re.escape(ch)); opt()
        else:
            parts.append(re.escape(ch))
    return ''.join(parts)


def apply(text: str, strict: bool, need) -> tuple[str, dict]:
    rules = json.loads(RULES_FILE.read_text(encoding='utf-8'))['rules']
    notes = {'replaced': 0, 'omitted': 0, 'missing': []}
    for r in rules:
        body = _pattern(r['original'])
        if r['omit']:
            # one arm of a selector list: take it with the comma after it, else the comma before it
            m = list(re.finditer(body + r'\s*,\s*', text)) or list(re.finditer(r'\s*,\s*' + body + r'(?=\s*\{)', text))
        else:
            m = list(re.finditer(body + r'(?=\s*[,{])', text))
        if not m:
            notes['missing'].append(r['rule'])
            need(not strict, f"T2 active rewrite: rule {r['rule']} ({r['source']}) not found in the composed page")
            continue
        need(len(m) == 1, f"T2 active rewrite: rule {r['rule']} found {len(m)} times (need exactly 1)")
        a, b = m[0].span()
        if r['omit']:
            text = text[:a] + text[b:]
            notes['omitted'] += 1
        else:
            text = text[:a] + r['replacement'] + text[b:]
            notes['replaced'] += 1
    return text, notes
