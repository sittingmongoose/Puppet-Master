"""W3C guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py, 004bdedd63).

Adapter only: no table module imports it, so the tool scans just the table under test. Every W3C case
(each positive and each one-defect negative of Plans/w3c_event_fixtures.json) is evaluated once through
the complete checker (pm_w3c_event_oracles.observe and the table predicates in table order). A table whose
rows all hold on a case contributes that observation as a control; the table holding the case's first
refusal contributes its observation as a negative of that row. Entailed rows (pm_w3c_event_oracles.ENTAILED)
never refuse first, so their tables receive no negative and stay unproved with their written proof.
Nothing here decides a checker result.
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
import pm_w3c_event_oracles as w3c  # noqa: E402

TABLE_PREFIX = w3c.TABLE_PREFIX
RETURN_SOURCE = 'return g.Case(table, check, context)'
BOUNDARY = {'append': 'append', 'retry': 'retry', 'history': 'retained_history', 'install': 'synthetic', 'operation': 'synthetic', 'checkpoint': 'synthetic'}


def table_rows(table):
    module = importlib.import_module(TABLE_PREFIX + table)
    case = module.case(None)
    return [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]


def _key(observed):
    return hashlib.sha256(json.dumps(observed, sort_keys=True).encode()).hexdigest()


def collect(progress=None):
    collected = {table: dict(controls={}, negatives={}) for table in w3c.TABLES}
    counts = dict(cases=0, accepted=0, refused=0, judged_errors=0)
    findings = []
    for number, (cid, scenario, case) in enumerate(w3c.cases()):
        counts['cases'] += 1
        facts, errors = w3c.observe(scenario)
        first, failing, per_table = None, [], {}
        for table in w3c.TABLES:
            observed, refused = w3c.table_refusals(table, facts)
            per_table[table] = (observed, refused)
            failing += [name for name, _ in refused]
            if refused and first is None:
                first = (table, refused)
        verdict = w3c.judge(case, first[1][0] if first else None, failing, errors)
        if verdict:
            counts['judged_errors'] += 1
            findings.append(dict(case=cid, verdict=verdict))
        boundary = BOUNDARY.get(scenario.get('path'), 'synthetic')
        for table, (observed, refused) in per_table.items():
            slot = collected[table]
            key = _key(observed)
            if not refused:
                slot['controls'].setdefault(key, dict(id=f'control/{table}/{len(slot["controls"])}', value=observed,
                                                      boundary=boundary, source=cid))
            elif first is not None and first[0] == table:
                row, code = refused[0]
                slot['negatives'].setdefault(key, dict(id=f'negative/{table}/{len(slot["negatives"])}', value=observed,
                                                       target=row, code=code, rows=[n for n, _ in refused],
                                                       source=cid, boundary=boundary))
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


def suite_for(table, slot, negative_limit=2, control_limit=4):
    module = TABLE_PREFIX + table
    controls = list(slot['controls'].values())[:control_limit]
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
                     'complete-checker observation of ' + n['source'] + ' whose first refusal is this row')
          for n in negatives]
    path = f'scripts/{module}.py'
    factory = importlib.import_module(module).case
    return g.Suite(f'W3C {table}', factory, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
