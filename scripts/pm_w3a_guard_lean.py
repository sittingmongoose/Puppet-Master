"""Lean W3A suite construction for the gated tool: imports only the engine and table modules.

Builds one Suite per table from collected observations (scripts/pm_w3a_guard_suites.py
dumps them). An accepted table evaluation is a control; a refused evaluation
gives its first refusing row as the negative's target. Negatives whose
observation fails more than that one row of the table are reported by the lane
matrix and excluded from tool proof; they stay refused in the complete checker.
Nothing here decides a checker result; credit is the tool's own report.
"""
import copy
import importlib
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402

TABLE_PREFIX = 'pm_w3a_forge_table_'
RETURN_SOURCE = 'return g.Case(table, check, context)'


def table_rows(phase):
    module = importlib.import_module(TABLE_PREFIX + phase)
    case = module.case(None)
    return [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]


def lane_matrix(phase, controls, negatives):
    """Direct check of every row on every collected case (the tool repeats it)."""
    rows = table_rows(phase)
    problems = []
    for c in controls:
        failing = [name for name, predicate, ctx in rows if predicate(c['value'], ctx) is not None]
        if failing:
            problems.append(dict(case=c['id'], kind='control_refused', rows=failing))
    for n in negatives:
        failing = [name for name, predicate, ctx in rows if predicate(n['value'], ctx) is not None]
        if failing != [n['target']]:
            problems.append(dict(case=n['id'], kind='not_single_row', target=n['target'], rows=failing))
    return problems


def suite_for(phase, slot, negative_limit=4, control_limit=6):
    module = TABLE_PREFIX + phase
    controls = list(slot['controls'].values())[:control_limit]
    if not controls:
        return None
    masked = {p['case'] for p in lane_matrix(phase, [], list(slot['negatives'].values()))}
    negatives = []
    for row in sorted({n['target'] for n in slot['negatives'].values()}):
        own = [n for n in slot['negatives'].values() if n['target'] == row and n['id'] not in masked]
        negatives += own[:negative_limit]
    first = controls[0]['id']
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], first,
                     'complete-checker observation whose first refusal is this row')
          for n in negatives]
    path = f'scripts/{module}.py'
    factory = importlib.import_module(module).case
    return g.Suite(f'W3A {phase}', factory, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
