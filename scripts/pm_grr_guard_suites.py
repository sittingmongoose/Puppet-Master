"""PNC-019 rv8b guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py, Method B).

Adapter only: no table module imports it, so the tool scans just the table under test. Every case of the complete
checker (pm_goal_run_replan_oracles.all_cases: positives and one-defect negatives over the command, publication,
retry, reducer, checkpoint, retained-read, retention and source boundaries) runs once under the checker's
observation recorder. An accepted table evaluation is a control of that table; a refused evaluation gives that
table's observation as a negative targeted at its first refusing row. Negatives whose observation fails more than
that one row are reported by the lane matrix and never given to the tool. Nothing here decides a result.
The structure is the PNC-019 S2 adapter's (scripts/pm_s2_guard_suites.py on plans/ea-pnc-s2-20261114).
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
import pm_goal_run_replan_oracles as m  # noqa: E402

TABLE_PREFIX = m.TABLE_PREFIX
RETURN_SOURCE = 'return g.Case(table, check, context)'


def table_rows(table):
    module = importlib.import_module(TABLE_PREFIX + table)
    case = module.case(None)
    return [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]


def _key(observed):
    return hashlib.sha256(json.dumps(observed, sort_keys=True).encode()).hexdigest()


def collect(progress=None):
    cases = m.all_cases()
    m.RECORDER = []
    collected, counts = {}, dict(cases=len(cases), records=0, accepted=0, refused=0)
    origins = {}
    for i, (cid, boundary, value, _expected) in enumerate(cases):
        start = len(m.RECORDER)
        m.outcome(boundary, value)
        for table, observed, first in m.RECORDER[start:]:
            origins.setdefault((table, _key(observed)), set()).add(cid)
        if progress and i % 50 == 0:
            progress(i)
    for table, observed, first in m.RECORDER:
        counts['records'] += 1
        slot = collected.setdefault(table, dict(controls={}, negatives={}))
        key = _key(observed)
        if first is None:
            counts['accepted'] += 1
            slot['controls'].setdefault(key, dict(id=f'control/{table}/{len(slot["controls"])}', value=observed,
                                                  cases=sorted(origins[(table, key)])[:3]))
        else:
            counts['refused'] += 1
            _t, row, code = first
            slot['negatives'].setdefault(key, dict(id=f'negative/{table}/{len(slot["negatives"])}', value=observed,
                                                   target=row, code=code, cases=sorted(origins[(table, key)])[:3]))
    m.RECORDER = None
    return collected, counts


def lane_matrix(table, controls, negatives):
    """Every row on every collected case: controls pass all rows, a negative fails exactly its target."""
    rows = table_rows(table)
    problems = []
    for ctl in controls:
        failing = [name for name, predicate, ctx in rows if predicate(ctl['value'], ctx) is not None]
        if failing:
            problems.append(dict(case=ctl['id'], kind='control_refused', rows=failing))
    for neg in negatives:
        failing = [name for name, predicate, ctx in rows if predicate(neg['value'], ctx) is not None]
        if failing != [neg['target']]:
            problems.append(dict(case=neg['id'], kind='not_single_row', target=neg['target'], rows=failing, origin=neg['cases']))
    return problems


def suite_for(table, slot, negative_limit=4, control_limit=6):
    module = TABLE_PREFIX + table
    controls = list(slot['controls'].values())[:control_limit]
    if not controls:
        return None
    masked = {p['case'] for p in lane_matrix(table, [], list(slot['negatives'].values()))}
    negatives = []
    for row in [name for name, _, _ in table_rows(table)]:
        own = [n for n in slot['negatives'].values() if n['target'] == row and n['id'] not in masked]
        negatives += own[:negative_limit]
    if not negatives:
        return None
    first = controls[0]['id']
    gc = [g.Control(ctl['id'], copy.deepcopy(ctl['value']), 'synthetic') for ctl in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], first,
                     'complete-checker observation whose first refusal is this row') for n in negatives]
    path = f'scripts/{module}.py'
    factory = importlib.import_module(module).case
    return g.Suite(f'rv8b {table}', factory, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
