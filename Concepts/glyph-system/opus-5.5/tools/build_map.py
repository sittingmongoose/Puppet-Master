#!/usr/bin/env python3
"""Build src/data/map.json: every icon PMConcept7 draws today, with the neon glyph that replaces it.

Reads the inventory bundle in reports/pm7-glyphs-20261010/inventory/ (the workers' censuses, reviewed by the lead):
  icon-tables.csv, icon-tables-b.csv (PM7 sources), mapping-draft.csv (their neon candidates),
  panels-terminal-icons.csv, panels-terminal-mapping.csv (the unpublished panels and terminal packages).
A worker candidate is kept at high or medium confidence; LEAD overrides it (the lead's mapping decisions, with the
reason). The catalog checks each target at run time: a name the renderer cannot draw shows as "to draw".
  python3 Concepts/glyph-system/opus-5.5/tools/build_map.py
"""
from __future__ import annotations
import csv
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
INV = REPO / 'reports' / 'pm7-glyphs-20261010' / 'inventory'
OUT = HERE.parent / 'src' / 'data' / 'map.json'

# The lead's decisions: PM7 name (lower case) -> neon glyph. Where the worker had no or a weak candidate, or where a PM7
# icon names a concept that now has its own glyph (objects.js, controls.js, 10-status.js).
LEAD = {
    'palette': 'palette', 'puzzle': 'puzzle', 'film': 'film', 'toolbox': 'wrench', 'tool': 'wrench', 'scales': 'scales',
    'home': 'home', 'robot': 'robot', 'agents': 'robot', 'plant': 'sprout', 'seed': 'sprout', 'party': 'party',
    'telescope': 'telescope', 'dial': 'gauge', 'gauge': 'gauge', 'layers': 'layers', 'stack': 'layers', 'bell': 'bell',
    'key': 'key', 'cloud': 'cloud', 'server': 'server', 'phone': 'phone', 'computer': 'monitor', 'monitor': 'monitor',
    'flame': 'flame', 'rocket': 'rocket', 'vault': 'vault', 'coin': 'coin', 'wallet': 'wallet', 'briefcase': 'briefcase',
    'pulse': 'pulse', 'arrowup': 'arrow-up', 'arrowdn': 'arrow-down', 'arrowdown': 'arrow-down', 'grip': 'grip',
    'drag': 'grip', 'toolgrip': 'grip', 'xcircle': 'st-failed-ring', 'minuscircle': 'st-off', 'masks': 'users',
    'error': 'st-failed-ring', 'cross': 'close',
    # names the chat set already draws under another name (lead, 2026-10-10)
    'chev': 'chevron-down', 'caretdown': 'chevron-down', 'collapse-chevron': 'chevron-down', 'closex': 'close',
    'editor-x': 'close', 'duplicate': 'copy', 'sendico': 'send', 'stopico': 'stop', 'popout': 'open',
    'external': 'open', 'branchsm': 'branch', 'git': 'branch', 'warndot': 'st-warning', 'alert': 'st-warning',
    'arrowright': 'arrow-right', 'volume': 'speaker', 'test': 'flask', 'wave': 'hand', 'map': 'plan',
    'memory': 'kind-memory', 'brackets': 'code', 'book': 'notebook', 'dots': 'more', 'spark': 'sparkles',
    'checkcircle': 'check-circle', 'zap': 'lightning', 'oplog': 'history', 'chat-check': 'check',
    'usage-grip': 'grip', 'usage-kebab': 'more', 'tools-mark:error': 'st-failed-ring', 'doc:cross': 'close',
    'jump': 'arrow-down', 'box': 'archive', 'cpu': 'cpu', 'database': 'database', 'hammer': 'hammer', 'radio': 'signal',
    'wifi': 'signal', 'network': 'signal', 'system': 'cpu', 'helpcircle': 'help',
    # the rail's status marks are the status set (F3-619; DL-162)
    'live': 'st-working', 'run': 'st-working', 'idle': 'st-idle', 'pending': 'st-pending', 'stale': 'st-skipped',
    'orphan': 'st-skipped', 'unknown': 'st-pending', 'dirty': 'change-modified', 'conflict': 'change-conflict',
    'current': 'ring-dot',
}
NOT_GLYPHS = {'notch', 'diamond', 'halfcircle', 'provider', 'swirl'}   # functional marks, placeholders or art


def rows(name: str):
    p = INV / name
    return list(csv.DictReader(p.open(encoding='utf-8'))) if p.exists() else []


def viewbox(markup: str) -> str:
    nums = [abs(float(x)) for x in re.findall(r'-?\d*\.?\d+', re.sub(r'(?:stroke-width|r|rx|ry|opacity)="[^"]*"', '', markup))]
    return '0 0 16 16' if nums and max(nums) <= 16.5 else '0 0 24 24'


def clean(markup: str) -> str:
    m = (markup or '').strip()
    if re.fullmatch(r'[Mm][\d\s.,MmLlHhVvCcSsQqTtAaZz-]+', m):      # bare path data (the panels' PMW.icon table)
        return '<path d="' + m + '"/>'
    if m and not m.startswith('<'):
        m = '<' + m
    m = re.sub(r'\s(on\w+|style)="[^"]*"', '', m)          # nothing executable or styled from the census
    return m if re.fullmatch(r'(\s*</?(path|circle|rect|ellipse|line|polyline|polygon|g)\b[^<>]*>\s*)+', m) else ''


def unwrap(raw: str):
    """(viewBox or None, inner markup) for markup that may come wrapped in its own <svg>."""
    raw = (raw or '').strip()
    vb = re.search(r'<svg\b[^>]*viewBox="([^"]+)"', raw)
    return (vb.group(1) if vb else None), re.sub(r'^\s*<svg\b[^>]*>|</svg>\s*$', '', raw)


def surfaces(s: str) -> list:
    return [x.strip() for x in re.split(r'[+;,]', s or '') if x.strip()] or ['pm7']


def main() -> None:
    cand = {}
    for r in rows('mapping-draft.csv'):
        if r.get('confidence') in ('high', 'medium', 'med') and r.get('neon_name') not in (None, '', 'NONE'):
            cand[(r['pm7_table'], r['pm7_name'].lower())] = (r['neon_name'], r['confidence'])
    out, seen = [], set()
    for r in rows('icon-tables.csv') + rows('icon-tables-b.csv'):
        name, table = r['glyph_name'], r['table_id']
        key = (table, name.lower())
        if key in seen or name.lower() in NOT_GLYPHS or table == 'T-symbols':   # T-symbols: font characters in text
            continue
        seen.add(key)
        vb, inner = unwrap(r.get('markup', ''))
        markup = clean(inner)
        if not markup:
            continue
        glyph, conf = LEAD.get(name.lower(), ''), 'lead'
        if not glyph and key in cand:
            glyph, conf = cand[key]
        if not glyph:
            glyph, conf = name.lower(), 'same-name'
        sl = surfaces(r.get('used_by_surfaces'))
        out.append({'surface': sl[0], 'surfaces': sl, 'table': table, 'name': name, 'old': markup,
                    'vb': vb or '0 0 24 24', 'glyph': glyph, 'by': conf, 'at': f"{Path(r['file']).name}:{r['line']}"})
    pcand = {(r['package'], r['name']): (r['neon_candidate'], r['confidence']) for r in rows('panels-terminal-mapping.csv')}
    for r in rows('panels-terminal-icons.csv'):
        if r.get('kind') != 'svg':
            continue
        name, pkg = r['name'], r['package']
        key = ('home-' + pkg, name.lower())
        if key in seen:
            continue
        seen.add(key)
        vb, raw = unwrap(r.get('markup_or_char'))
        markup = clean(raw)
        if not markup:
            continue
        glyph, conf = LEAD.get(name.lower(), ''), 'lead'
        if not glyph:
            c = pcand.get((pkg, name))
            glyph, conf = (c[0], c[1]) if c and c[0] not in ('', 'NONE') and c[1] in ('high', 'med', 'medium') else (name.lower(), 'same-name')
        out.append({'surface': pkg, 'surfaces': [pkg], 'table': 'home-' + pkg, 'name': name, 'old': markup, 'vb': vb or viewbox(markup),  # the packages' 16-grid icons say so; guess only when they don't
                   
                    'glyph': glyph, 'by': conf, 'at': f"{r['file']}:{r['line']}"})
    OUT.write_text(json.dumps({'source': 'reports/pm7-glyphs-20261010/inventory', 'items': out}, indent=0) + '\n', encoding='utf-8')
    print(f'wrote {OUT.relative_to(REPO)}: {len(out)} icons')


if __name__ == '__main__':
    main()
