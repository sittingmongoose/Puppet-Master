"""W3B guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py, 004bdedd63).

Adapter only: no table module imports it, so the tool scans just the table under test, whose predicates are the
row refusal tests the checker itself runs. Every W3B case (each positive and each stored one-defect negative of
Plans/w3b_event_fixtures.json) is evaluated once through the complete checker (pm_w3b_event_oracles.derive and the
generated predicates in table order). For each table, a case none of whose rows refuses contributes the table's
projected value as a control; the table holding the case's first refusal contributes its value as a negative of
that row. Entailed rows (pm_w3b_event_oracles.ENTAILED) never refuse first, so their tables receive no negative and
stay unproved with their written proof. Nothing here decides a checker result.
"""
import copy
import hashlib
import importlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402
import pm_w3b_event_oracles as w3b  # noqa: E402

TABLE_PREFIX = w3b.TABLE_PREFIX
RETURN_SOURCE = 'return g.Case(table, check, context)'
BOUNDARY = {'append': 'append', 'retry': 'retry', 'history': 'retained_history'}


def table_rows(table):
    module = importlib.import_module(TABLE_PREFIX + table)
    case = module.case(None)
    return [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]


def _key(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, default=repr).encode()).hexdigest()


def _gates(value):
    return sum(1 for k, v in value.items() if k.startswith('g_') and v is True)


def collect(progress=None):
    collected = {table: dict(controls={}, negatives={}) for table in w3b.TABLES}
    counts = dict(cases=0, accepted=0, refused=0, judged_errors=0)
    findings = []
    for number, (cid, scenario, case) in enumerate(w3b.cases()):
        counts['cases'] += 1
        with w3b.exact_digits():
            facts = w3b.derive(scenario)
            first, failing, per_table = None, [], {}
            for table in w3b.TABLES:
                value, refused = w3b.table_refusals(table, facts)
                per_table[table] = (value, refused)
                failing += [name for name, _ in refused]
                if refused and first is None:
                    first = (table, refused)
        verdict = w3b.judge(case, first[1][0] if first else None, failing, [])
        if verdict:
            counts['judged_errors'] += 1
            findings.append(dict(case=cid, verdict=verdict))
        boundary = BOUNDARY.get(scenario.get('path'), 'synthetic')
        for table, (value, refused) in per_table.items():
            slot = collected[table]
            key = _key(value)
            if not refused:
                if key not in slot['controls']:
                    slot['controls'][key] = dict(id=f'control/{table}/{len(slot["controls"])}', value=value, boundary=boundary,
                                                 source=cid, gates=_gates(value))
            elif first is not None and first[0] == table:
                row, code = refused[0]
                slot['negatives'].setdefault(key, dict(id=f'negative/{table}/{len(slot["negatives"])}', value=value, target=row,
                                                       code=code, rows=[n for n, _ in refused], source=cid, boundary=boundary))
        counts['accepted' if first is None else 'refused'] += 1
        if progress and number % 2000 == 0:
            progress(number)
    return collected, counts, findings


def lane_matrix(table, controls, negatives):
    """Direct check of every row on every collected case of the table (the tool repeats it)."""
    rows = table_rows(table)
    problems = []
    for c in controls:
        failing = [name for name, predicate, ctx in rows if predicate(c['value'], ctx) is not None]
        if failing:
            problems.append(dict(case=c['id'], kind='control_refused', rows=failing))
    for n in negatives:
        failing = [name for name, predicate, ctx in rows if predicate(n['value'], ctx) is not None]
        if failing != [n['target']]:
            problems.append(dict(case=n['id'], source=n['source'], kind='not_single_row', target=n['target'], rows=failing))
    return problems


def pick_controls(slot, limit):
    """Prefer controls under which the table's rows actually evaluate (most readiness gates open), one per path first."""
    ranked = sorted(slot['controls'].values(), key=lambda c: (-c['gates'], c['id']))
    out, seen_boundaries = [], set()
    for c in ranked:
        if c['boundary'] not in seen_boundaries:
            out.append(c)
            seen_boundaries.add(c['boundary'])
    for c in ranked:
        if len(out) >= limit:
            break
        if c not in out:
            out.append(c)
    return out[:limit]


def suite_for(table, slot, negative_limit=2, control_limit=4):
    module = TABLE_PREFIX + table
    controls = pick_controls(slot, control_limit)
    if not controls:
        return None
    masked = {p['case'] for p in lane_matrix(table, [], list(slot['negatives'].values()))}
    negatives = []
    for row in sorted({n['target'] for n in slot['negatives'].values()}):
        own = [n for n in slot['negatives'].values() if n['target'] == row and n['id'] not in masked]
        negatives += own[:negative_limit]
    if not negatives:
        return None
    first = controls[0]['id']
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), c['boundary']) for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], first,
                     'complete-checker value of ' + n['source'] + ' whose first refusal is this row')
          for n in negatives]
    path = f'scripts/{module}.py'
    factory = importlib.import_module(module).case
    return g.Suite(f'W3B {table}', factory, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
