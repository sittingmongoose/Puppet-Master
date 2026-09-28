"""O55 Settings layer: swap the pinned base's T50 Settings refresh for the Opus 5.5 fork in ../src/settings.

The pinned base (Concepts/TestPMConcept.html) is the T50 lane's output: its Settings engine carries the T50 fixture
bands (providers, forges, events, sounds) and the appended pm51 kit + managers module, and its head carries
<style id="pm51-settings-refresh">. This step replaces exactly those pieces with the fork, so the managers are
authored as real source files here instead of as patches:

* src/settings/kit.js, managers/*.js, data.json + data.d/*.json, placement.json, styles.css — forked from
  Concepts/pm7-tools/settings_refresh (T50) and reworked for Opus 5.5;
* the T50 transform's own one-time edits (name renames, sound factory, reference-row export, widened walkers) are
  already in the base and are kept; the fork may add `o55EngineRenames` ([old, new] pairs applied exactly once to
  the engine outside the module) for copy that lives in the engine.

The placement validator and module assembly are the T50 functions, pointed at the fork's folder.
"""
from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
PKG = TOOLS.parent
FORK = PKG / 'src' / 'settings'
T50_SOURCE = PKG.parents[1] / 'pm7-tools' / 'settings_refresh_source.py'
MARKER = '/* PM51_SETTINGS_REFRESH */\n'
BOOT = '  boot();\n})();'
STYLE_OPEN = '<style id="pm51-settings-refresh">\n'


def _t50():
    """Load the T50 transform module with its source folder re-pointed at the fork."""
    spec = importlib.util.spec_from_file_location('o55_t50_settings_source', T50_SOURCE)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.SRC = FORK
    mod.HERE = FORK.parent  # load_data() reads HERE / 'settings_refresh' / 'data.d'; re-pointed below
    mod.load_data = _load_data
    return mod


def _deep_merge(base, extra):
    if isinstance(base, dict) and isinstance(extra, dict):
        out = dict(base)
        for key, value in extra.items():
            out[key] = _deep_merge(base[key], value) if key in base else value
        return out
    return extra


def _load_data() -> dict:
    data = json.loads((FORK / 'data.json').read_text(encoding='utf-8'))
    for path in sorted((FORK / 'data.d').glob('*.json')):
        data = _deep_merge(data, json.loads(path.read_text(encoding='utf-8')))
    return data


def o55_data() -> dict:
    """src/settings/o55/*.json, one key per file stem (labels.json -> O55S.labels). Per-row decisions are split by
    manager in o55/rows.d/*.json and merged into O55S.rows.rows (a row id may be decided in one file only)."""
    data = {p.stem: json.loads(p.read_text(encoding='utf-8')) for p in sorted((FORK / 'o55').glob('*.json'))}
    rows, owner = {}, {}
    for p in sorted((FORK / 'o55' / 'rows.d').glob('*.json')):
        for rid, meta in json.loads(p.read_text(encoding='utf-8')).get('rows', {}).items():
            if rid in rows:
                raise ValueError(f'row {rid} is decided in both {owner[rid]} and {p.name}')
            rows[rid], owner[rid] = meta, p.name
    data['rows'] = {'rows': rows}
    return data


def placement() -> dict:
    """placement.json plus o55/placement.d/*.json: `sections` merge by id (a patch may add or change fields, or drop a
    section with null), `overrides` are prepended in file order (first match wins, so a patch beats the base),
    `managers` and `pages` merge by id, `hand_moves` are appended in file order (after the base's moves),
    `hand_drops` ({page: [hand row ids]}) name hand-written rows that only repeat an inventory row and are not drawn, and
    `hand_ids` ({old id: inventory id}) give hand-written rows admitted to Plans/settings_inventory.json their ids."""
    base = json.loads((FORK / 'placement.json').read_text(encoding='utf-8'))
    extra_rules = []
    for p in sorted((FORK / 'o55' / 'placement.d').glob('*.json')):
        patch = json.loads(p.read_text(encoding='utf-8'))
        for sid, sec in patch.get('sections', {}).items():
            if sec is None:
                base['sections'].pop(sid, None)
            else:
                base['sections'][sid] = dict(base['sections'].get(sid, {}), **sec)
        for mid, meta in patch.get('managers', {}).items():
            base['managers'][mid] = dict(base['managers'].get(mid, {}), **meta)
        for pid, meta in patch.get('pages', {}).items():
            base['pages'][pid] = dict(base['pages'].get(pid, {}), **meta)
        base['hand_moves'] = base.get('hand_moves', []) + [dict(m, _patch=p.name) for m in patch.get('hand_moves', [])]
        base.setdefault('hand_ids', {}).update(patch.get('hand_ids', {}))
        for ws, ids in patch.get('hand_drops', {}).items():
            have = base.setdefault('hand_drops', {}).setdefault(ws, [])
            have += [i for i in ids if i not in have]
        extra_rules += [dict(r, _patch=p.name) for r in patch.get('overrides', [])]
    base['overrides'] = extra_rules + base.get('overrides', [])
    return base


def module_source() -> str:
    """The T50 module layout (PM51_DATA, PM51_PLACEMENT, kit, managers) plus the Opus 5.5 additions: O55S (the o55
    data files) before the kit, and kit.d/*.js right after it, so every manager renders through the reworked kit."""
    kit = (FORK / 'kit.js').read_text(encoding='utf-8')
    extra = [f'/* ---- kit.d/{p.name} ---- */\n' + p.read_text(encoding='utf-8') for p in sorted((FORK / 'kit.d').glob('*.js'))]
    managers = [f'/* ---- {p.name} ---- */\n' + p.read_text(encoding='utf-8') for p in sorted((FORK / 'managers').glob('*.js'))]
    data = _load_data()
    body = ('const PM51_DATA = ' + json.dumps(data['extras'], ensure_ascii=False) + ';\n'
            + 'const PM51_PLACEMENT = ' + json.dumps(placement(), ensure_ascii=False) + ';\n'
            + 'const O55S = ' + json.dumps(o55_data(), ensure_ascii=False) + ';\n'
            + kit + '\n' + '\n'.join(extra) + '\n' + '\n'.join(managers))
    return "(function pm51SettingsRefresh(){\n'use strict';\n" + body + "\n})();\n"


def styles() -> str:
    parts = [(FORK / 'styles.css').read_text(encoding='utf-8')]
    parts += [f'/* ---- styles.d/{p.name} ---- */\n' + p.read_text(encoding='utf-8') for p in sorted((FORK / 'styles.d').glob('*.css'))]
    return '\n'.join(parts)


def validate(merged: dict, engine: str, t50, need) -> dict:
    """The kit resolves every canonical id first-match-wins (hand-rendered, then the first override rule that names or
    globs it, then its subgroup, then its page default); a placement.d patch's rules come first, so it can re-home ids a
    base rule also names. Checked: every id lands in a real section of a real manager tab or page, no page default is
    used, every rule wins at least one id, subgroups cover the reference exactly, and managers named by sections exist
    in exactly one manager file."""
    import fnmatch
    rows = t50.reference_rows(engine)
    by_id = {r['id']: r for r in rows}
    sections, managers, pages = merged['sections'], merged['managers'], merged['pages']
    files = {p.name: p.read_text(encoding='utf-8') for p in sorted((FORK / 'managers').glob('*.js'))}
    for mid, meta in managers.items():
        owners = [n for n, body in files.items() if f"const ID = '{mid}';" in body]
        need(len(owners) == 1, f'O55 placement: manager {mid!r} defined by {owners}')
        tabs = set(re.findall(r"\{ id: '([a-z-]+)', label: '", files[owners[0]]))
        for tab in meta.get('tabs', {}):
            need(tab in tabs, f'O55 placement: manager {mid!r} tab {tab!r} not in {owners[0]}')
    for sid, sec in sections.items():
        to = sec['to']
        need(to in managers or to in pages, f'O55 placement: section {sid!r} points at unknown {to!r}')
        if to in managers and managers[to].get('tabs'):
            need(sec.get('tab') in managers[to]['tabs'], f'O55 placement: section {sid!r} needs a tab of {to!r}')
    for mv in merged.get('hand_moves', []):
        if mv.get('_patch'):
            need(mv.get('to_section') in sections, f"O55 placement: {mv['_patch']} moves hand rows to unknown section {mv.get('to_section')!r}")
            need(pages.get(mv.get('workspace'), {}).get('hand'), f"O55 placement: {mv['_patch']} moves hand rows from {mv.get('workspace')!r}, which draws none")
    inventory = PKG.parents[2] / 'Plans' / 'settings_inventory.json'
    if merged.get('hand_ids') and inventory.exists():
        known = {r['id'] for r in json.loads(inventory.read_text(encoding='utf-8'))['settings']}
        for old_id, new_id in merged['hand_ids'].items():
            need(new_id in known, f'O55 placement: hand row {old_id!r} maps to {new_id!r}, which Plans/settings_inventory.json does not hold')
    for ws in merged.get('hand_drops', {}):
        need(pages.get(ws, {}).get('hand'), f'O55 placement: hand_drops names {ws!r}, which draws no hand rows')
    hand = set(t50.HAND_CANONICAL_RE.findall(engine))
    rules = merged.get('overrides', [])
    wins = [0] * len(rules)
    resolved = {}
    for row in rows:
        rid = row['id']
        if rid in hand:
            resolved[rid] = None
            continue
        hit = next((i for i, r in enumerate(rules) if rid in r.get('ids', []) or (r.get('glob') and fnmatch.fnmatchcase(rid, r['glob']))), None)
        if hit is not None:
            wins[hit] += 1
            resolved[rid] = rules[hit]['section']
        else:
            resolved[rid] = merged['subgroups'].get(f"{row['cat']}.{row['sub']}")
        need(resolved[rid] in sections, f'O55 placement: {rid} resolves to missing section {resolved[rid]!r}')
        need(resolved[rid] not in set(merged['page_defaults'].values()), f'O55 placement: {rid} fell back to a page default')
    for i, r in enumerate(rules):
        for rid in r.get('ids', []):
            need(rid in by_id, f'O55 placement: rule names unknown id {rid}')
        if r.get('_patch'):
            need(wins[i] >= 1, f"O55 placement: {r['_patch']} rule for {r['section']!r} wins no id")
    declared = {f"{c}.{s['id']}" for c, meta in json.loads(engine[engine.index('window.PM12_REFERENCE = ') + 24:engine.index('\n', engine.index('window.PM12_REFERENCE = '))].rstrip(';'))['byCat'].items() for s in meta.get('subgroups', [])}
    need(set(merged['subgroups']) == declared, 'O55 placement: subgroups must cover exactly the reference subgroups')
    per = {}
    for rid, sid in resolved.items():
        if sid:
            per[sections[sid]['to']] = per.get(sections[sid]['to'], 0) + 1
    composed = sum(1 for rid, sid in resolved.items() if sid and sections[sid].get('composed'))
    return {'ids': len(rows), 'hand': len(hand), 'per_destination': per, 'composed_rows': composed,
            'advanced_rows': sum(1 for rid, sid in resolved.items() if sid and sections[sid].get('advanced'))}


def _band(text: str, start: str, end: str, replacement: str, need, label: str) -> str:
    need(text.count(start) == 1, f'O55 settings: band start {label!r} found {text.count(start)} times')
    i = text.index(start)
    j = text.find(end, i)
    need(j > i, f'O55 settings: band end {label!r} missing')
    return text[:i] + replacement + text[j:]


def _canon_defaults(doc: str, need) -> tuple[str, list]:
    """The pinned base page carries the inventory as it stood when it was pinned, twice (the page's settings data and
    the Settings engine's reference). Rows whose default Plans/settings_inventory.json has since changed by decision
    (DL-107 turned chat sounds on, DL-108 made Queue the busy-send default) take the canon default, recommendation and
    description, so the concept never shows a superseded default. Theme-owned defaults ("theme") are handled by the
    look layer, and empty and missing secrets mean the same, so neither is patched."""
    inventory = PKG.parents[2] / 'Plans' / 'settings_inventory.json'
    if not inventory.exists():
        return doc, []
    canon = {r['id']: r for r in json.loads(inventory.read_text(encoding='utf-8'))['settings']}
    empty = (None, '', {}, [])
    changed = set()
    for rid, row in canon.items():
        needle = '{"id":' + json.dumps(rid) + ','
        at = doc.find(needle)
        while at != -1:
            depth, end, quoted, esc = 0, at, False, False
            for end in range(at, len(doc)):
                ch = doc[end]
                if quoted:
                    esc, quoted = (False, quoted) if esc else (ch == '\\', ch != '"')
                elif ch == '"':
                    quoted = True
                elif ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                    if depth == 0:
                        break
            old = json.loads(doc[at:end + 1])
            new_default = row.get('default')
            if (new_default not in empty and new_default != 'theme' and old.get('default') not in empty
                    and old.get('default') != new_default):
                old.update({k: row[k] for k in ('default', 'recommended', 'desc') if k in row})
                text = json.dumps(old, ensure_ascii=False, separators=(',', ':'))
                doc = doc[:at] + text + doc[end + 1:]
                end = at + len(text) - 1
                changed.add(rid)
            at = doc.find(needle, end + 1)
    return doc, sorted(changed)


def _canon_rows(doc: str, merged: dict, need) -> tuple[str, list]:
    """Rows admitted to Plans/settings_inventory.json after the base page was pinned join both embedded copies, so a
    manager can bind them (PM51.bound, composed placement sections) and search, Details, All Settings and transfer know
    them. Rows the hand-written pages already draw under an admitted id (placement `hand_ids`) are left to those pages."""
    inventory = PKG.parents[2] / 'Plans' / 'settings_inventory.json'
    if not inventory.exists():
        return doc, []
    canon = json.loads(inventory.read_text(encoding='utf-8'))['settings']
    hand = set((merged.get('hand_ids') or {}).values())
    key = 'window.PM12_REFERENCE = '
    need(doc.count(key) == 1, 'O55 settings: PM12_REFERENCE anchor drift')
    s = doc.index(key) + len(key)
    e = doc.index('\n', s)
    ref = json.loads(doc[s:e].rstrip(';'))
    have = {r['id'] for c in ref['byCat'].values() for r in c.get('settings', [])}
    added = [r for r in canon if r['id'] not in have and r['id'] not in hand]
    for r in added:
        cat, sub, _ = r['id'].split('.', 2)
        need(cat in ref['byCat'] and any(g['id'] == sub for g in ref['byCat'][cat].get('subgroups', [])),
             f'O55 settings: admitted row {r["id"]} has no reference subgroup')
        ref['byCat'][cat]['settings'].append(dict(r, cat=cat, sub=sub))
    if not added:
        return doc, []
    ref['total'] = sum(len(c.get('settings', [])) for c in ref['byCat'].values())
    doc = doc[:s] + json.dumps(ref, ensure_ascii=False, separators=(',', ':')) + ';' + doc[e:]
    m = re.search(r'(<script type="application/json" id="pm7-settings-data">)(.*?)(</script>)', doc, re.S)
    need(m is not None, 'O55 settings: pm7-settings-data missing')
    data = json.loads(m.group(2))
    known = {r['id'] for r in data['settings']}
    data['settings'].extend(r for r in added if r['id'] not in known)
    doc = doc[:m.start(2)] + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + doc[m.end(2):]
    return doc, [r['id'] for r in added]


def apply(doc: str, need) -> tuple[str, dict]:
    t50 = _t50()
    doc, canon_defaults = _canon_defaults(doc, need)
    data = _load_data()
    t50.load_placement()  # duplicate-key guard on the base file
    merged = placement()
    doc, canon_rows = _canon_rows(doc, merged, need)
    css = styles()
    for bad in ['backdrop-filter', 'url(#']:
        need(bad not in css, 'O55 settings: unsupported paint primitive in CSS: ' + bad)

    m = re.search(r'(<script\b[^>]*\bid="pm4-settings-js"[^>]*>)(.*?)(</script>)', doc, re.S)
    need(m is not None, 'O55 settings: Settings engine script missing')
    js = m.group(2)
    need(js.count(MARKER) == 1 and js.count(BOOT) == 1, 'O55 settings: T50 module marker or boot anchor drift')
    start = js.index(MARKER) + len(MARKER)
    end = js.index(BOOT, start)
    engine = js[:js.index(MARKER)] + js[end:]  # the engine as T50 saw it, without any appended module

    census = validate(merged, engine, t50, need)
    js = js[:start] + module_source() + '\n' + js[end:]

    band_js = lambda value: json.dumps(value, ensure_ascii=False, indent=2)
    js = _band(js, '  const providers = [', '  const freeRoutes = [',
               '  const providers = ' + band_js(data['providers']) + ';\n\n', need, 'providers')
    js = _band(js, '    forges: [', '    repositories: [', '    forges: ' + band_js(data['forges']) + ',\n', need, 'forges')
    js = _band(js, '    events: [', '    sounds: [', '    events: ' + band_js(data['events']) + ',\n', need, 'events')
    js = _band(js, '    sounds: [', '    packs: [', '    sounds: ' + band_js(data['sounds']) + ',\n', need, 'sounds')
    module_at = js.index(MARKER)
    for old, new in data.get('o55EngineRenames', []):
        head = js[:module_at]
        need(head.count(old) == 1, f'O55 settings: engine rename anchor found {head.count(old)} times: {old[:60]!r}')
        js = head.replace(old, new, 1) + js[module_at:]
        module_at = js.index(MARKER)
    doc = doc[:m.start()] + m.group(1) + js + m.group(3) + doc[m.end():]

    need(doc.count(STYLE_OPEN) == 1, 'O55 settings: pm51 style block missing')
    s = doc.index(STYLE_OPEN) + len(STYLE_OPEN)
    e = doc.index('\n</style>', s)
    doc = doc[:s] + css + doc[e:]
    return doc, dict(census, providers=[p['id'] for p in data['providers']], canon_defaults=canon_defaults, canon_rows=canon_rows)
