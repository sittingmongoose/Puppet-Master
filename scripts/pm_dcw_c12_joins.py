#!/usr/bin/env python3
"""C12-DCW copy-join witnesses: each side of every two-copy join row is mutated on its own.

A join row compares two independently held copies of one fact (slot vs custody
receipt, source vs payload, stored row vs frame, token vs checkpoint, ...).
For every lane witness refused first at such a row, the observation at that row
is compared with the observation the same family's accepting control records at
the same site and operation: `left` (only v0 moved), `right` (only v1 moved) or
`both`. A join row is closed when it has a distinct left witness and a distinct
right witness, or when one side is derived inside the checker from the other
inputs (recorded as `derived_side`, with the derivation text).
"""
import argparse
import copy
import json
import pickle
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dcw_event_oracles as m
import pm_dcw_guard_rows as rows
import pm_dcw_guard_suites as suites
import pm_dcw_c12_boundary as boundary

# A side is an input copy only when it is a plain subscript chain over checker
# inputs (optionally wrapped in typed_observation); anything else is derived.
COPY = re.compile(r"^(?:m\.)?(?:typed_observation\()?[a-z_]+(?:\[[^\]]+\]|\.get\(.*\))*\)?$")


INPUT_NAMES = {'gid', 'value'}


def derived_side(text):
    text = text.strip()
    bare = text.removeprefix('m.').removeprefix('typed_observation(').rstrip(')')
    if bare in INPUT_NAMES:
        return False
    # A bare local name is a value the checker computed (identity, digest, byte string, recipe).
    return COPY.match(text) is None or ('[' not in text and '.get(' not in text)


def join_rows():
    spec = {}
    import ast
    tree = ast.parse((ROOT / 'scripts/pm-dcw-table-generate.py').read_text())
    specs = next(ast.literal_eval(a.value) for a in tree.body if isinstance(a, ast.Assign)
                 and any(isinstance(t, ast.Name) and t.id == 'ROWS' for t in a.targets))
    for r in specs:
        fields = r.get('fields', {})
        if r['predicate'] in ("value['v0'] == value['v1']",) and 'v1' in fields:
            derived = [k for k in ('v0', 'v1') if derived_side(fields[k])]
            spec[r['id']] = dict(source=r['source'], v0=fields['v0'], v1=fields['v1'], derived=derived)
    return spec


def observations(w):
    recorded = []
    rows.RECORDER = recorded
    try:
        try:
            suites.invoke(w)
        except Exception:
            # A refusal or an exception both end the run; the recorded rows are what was observed.
            pass
    finally:
        rows.RECORDER = None
    return recorded


REPAIRS = {}


def control_for(w):
    if w['id'] + '/repair' in REPAIRS:
        return REPAIRS[w['id'] + '/repair']
    if 'repair' in w:
        return dict(w, value=copy.deepcopy(w['repair']), expected='accept', target=None)
    row = w.get('row')
    if row is None or 'cases' not in row or w.get('kind') is not None:
        return None
    case = next((c for c in row['cases'] if c['expected'] == 'accept' and c['operation'] == w['operation']), None)
    if case is None:
        return None
    from pm_dcw_event_regressions import scenario
    return dict(w, value=scenario(row, case), expected='accept', target=None)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--search-only', action='store_true', help='run the missing-side search on an existing joins.json')
    parser.add_argument('--dispositions', action='store_true', help='apply the written dispositions to the rows still open')
    args = parser.parse_args()
    if args.search_only:
        finish(args.out / 'joins.json')
        return
    if args.dispositions:
        disposition(args.out / 'joins.json')
        return
    joins = join_rows()
    sides = defaultdict(lambda: defaultdict(list))
    witnesses = list(boundary.all_witnesses())
    REPAIRS.update({w['id']: w for w in witnesses if w['id'].endswith('/repair')})
    for w in witnesses:
        if w['expected'] == 'accept':
            continue
        first = boundary.run(w)
        name = first.get('row')
        if name not in joins:
            continue
        seen = [v for n, v, _ in observations(w) if n == name]
        control = control_for(w)
        if not seen or control is None:
            sides[name]['unclassified'].append(w['id'])
            continue
        refused = seen[-1]
        base = [v for n, v, _ in observations(control) if n == name]
        if not base:
            sides[name]['unclassified'].append(w['id'])
            continue
        # The control observation of the same occurrence position, else the first one.
        index = min(len(seen) - 1, len(base) - 1)
        ref = base[index]
        left, right = refused.get('v0') != ref.get('v0'), refused.get('v1') != ref.get('v1')
        sides[name]['left' if left and not right else 'right' if right and not left else 'both'].append(w['id'])
    report, open_rows = {}, []
    for name, spec in sorted(joins.items()):
        s = {k: v for k, v in sides.get(name, {}).items()}
        need = {'left', 'right'} - {'v0' == d and 'left' or 'right' for d in spec['derived']}
        have = {k for k in ('left', 'right') if s.get(k)}
        missing = sorted(need - have)
        status = 'not_reached' if not s else ('closed' if not missing else 'open')
        report[name] = dict(spec, sides={k: v[:5] for k, v in s.items()}, counts={k: len(v) for k, v in s.items()},
                            missing=missing, status=status)
        if status == 'open':
            open_rows.append(name)
    args.out.mkdir(parents=True, exist_ok=True)
    summary = dict(status='pass' if not open_rows else 'open', join_rows=len(joins), open=open_rows,
                   closed=sum(r['status'] == 'closed' for r in report.values()),
                   not_reached=sorted(k for k, r in report.items() if r['status'] == 'not_reached'))
    (args.out / 'joins.json').write_text(json.dumps(dict(summary=summary, rows=report), indent=1, sort_keys=True) + '\n')
    print(json.dumps(summary, sort_keys=True))



# ---------------------------------------------------------------- missing-side search

def locations(value, parts=()):
    yield parts, value
    if isinstance(value, dict):
        for k, v in value.items():
            yield from locations(v, parts + (k,))
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from locations(v, parts + (i,))


def setting(value, parts, new):
    value = copy.deepcopy(value)
    target = value
    for p in parts[:-1]:
        target = target[p]
    target[parts[-1]] = new
    return value


def perturb(v):
    if type(v) is str:
        return v + '-c12'
    if type(v) is bool:
        return not v
    if type(v) is int:
        return v + 1
    if isinstance(v, (dict, list)):
        # A container copy: change its first scalar leaf, nothing else.
        for parts, leaf in locations(v):
            if parts and perturb(leaf) is not None and not isinstance(leaf, (dict, list)):
                return setting(v, parts, perturb(leaf))
    return None


def search(joins, report, limit=40):
    """For each missing side, find one input location whose change moves only that side, refused first at the row."""
    fams = {r['event_type']: r for r in m.load('Plans/dcw_event_contract_fixtures.json')['families']}
    from pm_dcw_event_regressions import scenario
    from pm_dcw_blockage_fixtures import base
    controls = []
    special = ('restore', 'reference', 'compatibility', 'nonlatest')
    for name, row in fams.items():
        for op in ('append', 'publish', 'retry', 'read', 'rebuild', 'compatibility_read'):
            picked = [c for c in row['cases'] if c['expected'] == 'accept' and c['operation'] == op]
            chosen = picked[:1] + [c for c in picked[1:] if any(k in c['case_id'] for k in special)][:3]
            for case in chosen:
                controls.append(dict(id=name + '/control/' + op + '/' + case['case_id'], family=name, row=row,
                                     value=scenario(row, case), operation=op, expected='accept'))
    from pm_dcw_blockage_fixtures import restore as blockage_restore
    for name in ('wizard.blocked', 'wizard.unblocked'):
        for op in ('append', 'read'):
            controls.append(dict(id=name + '/control/' + op, family=name, row=None, value=base(name), operation=op, expected='accept'))
        restored = base(name)
        blockage_restore(restored)
        controls.append(dict(id=name + '/control/publish/restore', family=name, row=None, value=restored, operation='publish',
                             expected='accept'))
    observed = {c['id']: observations(c) for c in controls}
    for name, entry in report.items():
        if entry['status'] != 'open':
            continue
        previous = entry.get('search', {})
        entry['search'] = {}
        for side in entry['missing']:
            if previous.get(side, {}).get('status') in ('witnessed', 'pinned'):
                entry['search'][side] = previous[side]
                continue
            key, other = ('v0', 'v1') if side == 'left' else ('v1', 'v0')
            tried, outcome = 0, dict(status='pinned_earlier', first_refusals={})
            for control in controls:
                seen = [v for n, v, _ in observed[control['id']] if n == name]
                if not seen:
                    continue
                target, keep = seen[0].get(key), seen[0].get(other)
                for parts, value in locations(control['value']):
                    if not parts:
                        continue
                    if value != target and m.typed_observation(value) != target:
                        continue
                    new = perturb(value)
                    if new is None:
                        continue
                    tried += 1
                    w = dict(control, value=setting(control['value'], parts, new), id=control['id'] + '/join-search')
                    first = boundary.run(w)
                    at = [v for n, v, _ in observations(w) if n == name]
                    if first.get('row') == name and at and at[-1].get(key) != target and at[-1].get(other) == keep:
                        outcome = dict(status='witnessed', family=control['family'], operation=control['operation'],
                                       path='/'.join(map(str, parts)), code=first['outcome'])
                        break
                    if outcome['status'] != 'pinned' and first.get('row') not in (None, name) and first['outcome'] != 'EXCEPTION':
                        # Disable the earlier rows that refuse this one change until the join row is reached.
                        disabled = {first['row']}
                        for _ in range(6):
                            again = boundary.run(w, disabled)
                            rows.DISABLED = frozenset(disabled)
                            try:
                                seen_at = [v for n, v, _ in observations(w) if n == name]
                            finally:
                                rows.DISABLED = frozenset()
                            moved = [v for v in seen_at if v.get(key) != target and v.get(other) == keep]
                            if moved:
                                outcome = dict(status='pinned', family=control['family'], operation=control['operation'],
                                               path='/'.join(map(str, parts)), pinned_by=sorted(disabled),
                                               first_refusals=outcome['first_refusals'])
                                break
                            if again.get('row') in (None, name) or again['outcome'] == 'EXCEPTION':
                                break
                            disabled.add(again['row'])
                    outcome['first_refusals'][str(first.get('row') or first['outcome'])] = outcome['first_refusals'].get(
                        str(first.get('row') or first['outcome']), 0) + 1
                    if tried >= limit:
                        break
                if outcome['status'] == 'witnessed' or tried >= limit:
                    break
            outcome['tried'] = tried
            entry['search'][side] = outcome
        states = {entry['search'][s]['status'] for s in entry['missing']}
        entry['status'] = ('closed_by_search' if states == {'witnessed'} else
                           'closed_pinned' if states <= {'witnessed', 'pinned'} else 'open')


def finish(path):
    data = json.loads(Path(path).read_text())
    joins = join_rows()
    search(joins, data['rows'])
    counts = {}
    for entry in data['rows'].values():
        counts[entry['status']] = counts.get(entry['status'], 0) + 1
    data['summary']['after_search'] = counts
    Path(path).write_text(json.dumps(data, indent=1, sort_keys=True, default=repr) + '\n')
    print(json.dumps(counts, sort_keys=True))



# Written dispositions for the join rows the bounded search left open. Each names
# why the second copy has no separate witness; none is counted as a kill.
DISPOSITIONS = {
    'B039': 'payload project/run/blockage ids are pinned first by B005 (envelope), B021 (source key) and B026 (observation); the repair record copy is witnessed',
    'B041': 'payload ids are pinned first by B005, B021, B024 and B026; the predecessor copy is witnessed',
    'B047': 'payload ids are pinned first by B005, B021, B024 and B026; the route copy is witnessed',
    'B059': 'payload ids are pinned first by B005, B021, B024 and B026; the clearing-action copy is witnessed',
    'B105': 'configuration pair: the registry value_schema_ref is witnessed by blockage-preflight/schema-ref; the fixture row source schema selects the owner document itself',
    'O191': 'configuration pair: the registry value_schema_ref is witnessed by preflight/value_schema_ref; the fixture row source schema selects the owner document itself',
    'L007': 'legacy callback boundary: legacy/* witnesses change the envelope causation or the payload predecessor directly; on the complete path both are pinned first by O020/O021',
    'L019': 'legacy callback boundary: legacy/* witnesses change each side directly; on the complete path the payload predecessor is pinned by L007/O021 (located) and the previous phase by O078/O061',
    'L020': 'legacy callback boundary: legacy/* witnesses change each side directly; on the complete path the payload field is pinned by L002/L003/L005/O016/O018 (located) and the previous phase by O058',
    'O004': 'the right side is canonical_json of the parsed descriptor (derived); the event payload_ref copy is witnessed by six first refusals at O004',
    'O032': 'the event_id is its identity hash, pinned first by O016 and by the exact source and original copies (O037, O078)',
    'O039': 'the event_id is its identity hash, pinned first by O016 and by the exact source and original copies (O037, O078)',
    'O040': 'the event sequence_id is pinned first by its exact source and original copies (O037, O078) and by the index frame join',
    'O061': 'the phase payload predecessor is pinned first by L019/O021 and the slot exact-equality join',
    'O069': 'the slot result copy is pinned first by the original result join O066; the payload safe_point copy is witnessed',
    'O081': 'the event actor_ref is pinned first by its exact source and original copies (O078, O037); the authority actor copy is witnessed',
    'O120': 'the frontier predecessor digest is pinned first by the frontier digest O230 and the token/frontier joins; the reader copy is witnessed',
    'O131': 'the generation dataset name is pinned first by O218 (dataset == prefix + key) and the dataset lookup; the token copy is witnessed',
    'O139': 'the right side is the literal 16384; the registry profile copy is witnessed',
    'O164': 'the right side is derived from the parsed event payload reference; the restored inventory copy is witnessed by six first refusals at O164',
    'O214': 'the current_generation_id pointer selects the generation being compared; changing it alone selects no generation (structural); the generation copy is witnessed',
    'O228': 'the right side is the row recomputed from the captured frame (derived); the stored row copy is witnessed by 230 first refusals',
    'R006': 'the right side is the registry-selected payload schema id (configuration); the event copy is witnessed by 36 first refusals at R006',
    'R007': 'the right side is the registry-selected payload schema id (configuration); the reference copy is witnessed',
}


def disposition(path):
    data = json.loads(Path(path).read_text())
    for name, entry in data['rows'].items():
        if entry['status'] == 'open' and name in DISPOSITIONS:
            entry.update(status='closed_written', disposition=DISPOSITIONS[name])
    counts = {}
    for entry in data['rows'].values():
        counts[entry['status']] = counts.get(entry['status'], 0) + 1
    data['summary']['final'] = counts
    data['summary']['status'] = 'pass' if not counts.get('open') else 'open'
    Path(path).write_text(json.dumps(data, indent=1, sort_keys=True, default=repr) + '\n')
    print(json.dumps(counts, sort_keys=True))


if __name__ == '__main__':
    main()
