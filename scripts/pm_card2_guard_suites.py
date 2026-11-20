"""DCN guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py).

Adapter only: no table module imports it, so the tool scans just the table under
test. Every DCN witness (each positive, no-event case, fixture negative and part 2A
witness or control) is evaluated once through the complete checker
(pm_card2_events.observe and the table predicates in table order). A table whose
rows all hold on a case contributes that observation as a control; the table that
holds the case's first refusal contributes its observation as a negative of that
row. Rows entailed by an earlier row (pm_card2_events.ENTAILED) never refuse first,
so their tables receive no negative and stay unproved with their written proof.
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
import pm_card2_events as dcn  # noqa: E402

TABLE_PREFIX = dcn.TABLE_PREFIX
RETURN_SOURCE = 'return g.Case(table, check, context)'
BOUNDARY = {'append': 'append', 'retry': 'retry', 'history': 'retained_history', 'no_event': 'synthetic'}


def table_rows(table):
    module = importlib.import_module(TABLE_PREFIX + table)
    case = module.case(None)
    return [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]


def _key(observed):
    return hashlib.sha256(json.dumps(observed, sort_keys=True).encode()).hexdigest()


def witnesses():
    """(case id, scenario, expected) for every DCN case, in a fixed order."""
    fixtures = dcn.load('card2_event_fixtures.json')
    p2a = dcn.load('card2_event_p2a_cases.json')
    bases = {c['id']: c for c in fixtures['positives'] + fixtures['no_event_cases']}
    for c in bases.values():
        yield c['id'], c, None
    for case in fixtures['negative_cases']:
        yield case['id'], dcn.mutate(bases[case['base']], case['changes']), case
    for case in p2a.get('cases', []):
        yield case['id'], dcn.mutate(bases[case['base']], case['changes']), (None if case.get('expect') == 'accept' else case)


def collect(progress=None):
    collected = {table: dict(controls={}, negatives={}) for table in dcn.TABLES}
    counts = dict(cases=0, accepted=0, refused=0, judged_errors=0)
    findings = []
    for number, (cid, c, case) in enumerate(witnesses()):
        counts['cases'] += 1
        facts = dcn.observe(c)
        first = None
        failing = []
        per_table = {}
        for table in dcn.TABLES:
            observed, refused = dcn.table_refusals(table, facts)
            per_table[table] = (observed, refused)
            failing += [name for name, _ in refused]
            if refused and first is None:
                first = (table, refused)
        if case is None and failing:
            findings.append(dict(case=cid, kind='control_refused', rows=failing))
        if case is not None:
            verdict = dcn.judge(case, first[1][0] if first else None, failing)
            if verdict:
                counts['judged_errors'] += 1
                findings.append(dict(case=cid, kind='judge', verdict=verdict, rows=failing))
        boundary = BOUNDARY.get(c.get('path'), 'synthetic')
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
        if first is None:
            counts['accepted'] += 1
        else:
            counts['refused'] += 1
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
    return g.Suite(f'DCN {table}', factory, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
