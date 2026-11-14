"""W3G guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py, 004bdedd63).

Adapter only: no table module imports it, so the tool scans just the table under test. Every W3G case
(each positive and single-defect negative of pm_w3g_cases.all_cases) is evaluated once through the complete
checker (pm_w3g_events.observe and the table predicates in the boundary's table order). A table whose rows
all hold on a case contributes that observation as a control; the table that holds the case's first refusal
contributes its observation as a negative of that row. Rows entailed by an earlier row
(pm_w3g_events.entailed_proofs) never refuse first, so their single-row tables receive no negative and stay
unproved with their written proof. Nothing here decides a checker result.
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
import pm_w3g_events as m  # noqa: E402
import pm_w3g_cases as c  # noqa: E402

TABLE_PREFIX = m.TABLE_PREFIX
RETURN_SOURCE = 'return g.Case(table, check, context)'
BOUNDARY = {m.A: 'append', m.RT: 'retry', m.HI: 'retained_history', m.RS: 'synthetic'}


def table_rows(table):
    module = importlib.import_module(TABLE_PREFIX + table)
    case = module.case(None)
    return [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]


def _key(observed):
    return hashlib.sha256(json.dumps(observed, sort_keys=True).encode()).hexdigest()


def tables_for(f):
    slug = m.FAM[f]['slug']
    return [p for p in m.all_phases() if p in m.ROWS or slug in p]


def table_refusals(table, obs):
    rows = table_rows(table)
    fields = importlib.import_module(TABLE_PREFIX + table).FIELDS
    observed = {k: obs[k] is True for k in fields}
    return observed, [(name, predicate(observed, ctx)) for name, predicate, ctx in rows if predicate(observed, ctx) is not None]


def collect(progress=None):
    collected = {table: dict(controls={}, negatives={}) for table in m.all_phases()}
    counts = dict(cases=0, accepted=0, refused=0, judged_errors=0)
    findings = []
    for number, x in enumerate(c.all_cases()):
        counts['cases'] += 1
        w = m.build_world(x['family'], x['scope'], boundary=x['boundary'], **x['kwargs'])
        if x['mut'] is not None:
            x['mut'](w)
        with m.exact_integer_digits():
            obs, _ = m.observe(w)
        first = None
        per_table = {}
        for table in tables_for(x['family']):
            per_table[table] = table_refusals(table, obs)
        for table in m.order(w):
            if per_table[table][1]:
                first = (table, per_table[table][1])
                break
        got = None if first is None else (first[0], first[1][0][0], first[1][0][1])
        exp = x['expect']
        if (got is None) != (exp is None) or (got is not None and tuple(got) != tuple(exp)):
            counts['judged_errors'] += 1
            findings.append(dict(case=x['id'], kind='judge', expected=exp, got=got))
        boundary = BOUNDARY[x['boundary']]
        for table, (observed, refused) in per_table.items():
            slot = collected[table]
            key = _key(observed)
            if not refused:
                slot['controls'].setdefault(key, dict(id=f'control/{table}/{len(slot["controls"])}', value=observed,
                                                      boundary=boundary, source=x['id']))
            elif first is not None and first[0] == table and x['id'].startswith('neg/'):
                # only the per-row single-defect witnesses are tool negatives; extra and entailment-demonstration cases
                # are complete-checker expectations (pm-w3g-event-contracts), not single-row witnesses
                row, code = refused[0]
                slot['negatives'].setdefault(key, dict(id=f'negative/{table}/{len(slot["negatives"])}', value=observed,
                                                       target=row, code=code, rows=[n for n, _ in refused],
                                                       source=x['id'], boundary=boundary))
        counts['accepted' if first is None else 'refused'] += 1
        if progress and number % 2000 == 0:
            progress(number)
    return collected, counts, findings


def lane_matrix(table, controls, negatives):
    """Direct check of every row on every collected case of the table (the tool repeats it)."""
    rows = table_rows(table)
    problems = []
    for x in controls:
        failing = [name for name, predicate, ctx in rows if predicate(x['value'], ctx) is not None]
        if failing:
            problems.append(dict(case=x['id'], kind='control_refused', rows=failing))
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
    gc = [g.Control(x['id'], copy.deepcopy(x['value']), x['boundary']) for x in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], first,
                     'complete-checker observation of ' + n['source'] + ' whose first refusal is this row')
          for n in negatives]
    path = f'scripts/{module}.py'
    factory = importlib.import_module(module).case
    return g.Suite(f'W3G {table}', factory, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
