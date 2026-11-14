"""W3H guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py, gated at 004bdedd63).

Adapter only: no table module imports it, so the tool scans just the phase table under test. Every case
of the complete checker (pm_w3h_cases.all_cases: positives, single-defect witnesses, retry, transition,
cleanup, retained-read, compound and retention cases) runs once under the checker's observation recorder.
An accepted phase evaluation is a control of its table; a refused evaluation gives that phase's
observation as a negative targeted at its first refusing row. Negatives whose observation fails more than
that one row are reported by the lane matrix and never given to the tool. Nothing here decides a result.
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
import pm_w3h_events as m  # noqa: E402
import pm_w3h_cases as c  # noqa: E402

TABLE_PREFIX = m.TABLE_PREFIX
RETURN_SOURCE = 'return g.Case(table, check, context)'


def table_rows(phase):
    module = importlib.import_module(TABLE_PREFIX + phase)
    case = module.case(None)
    return [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]


def _key(observed):
    return hashlib.sha256(json.dumps(observed, sort_keys=True).encode()).hexdigest()


def collect(progress=None):
    registry = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
    cases = c.all_cases(registry)
    m.RECORDER = []
    collected, counts = {}, dict(cases=len(cases), records=0, accepted=0, refused=0)
    families = {}
    for i, (cid, f, boundary, value, _expected) in enumerate(cases):
        start = len(m.RECORDER)
        with m.exact_integer_digits():
            c.outcome(boundary, value)
        for phase, observed, first in m.RECORDER[start:]:
            families.setdefault((phase, _key(observed)), set()).add(f)
        if progress and i % 2000 == 0:
            progress(i)
    for phase, observed, first in m.RECORDER:
        counts['records'] += 1
        slot = collected.setdefault(phase, dict(controls={}, negatives={}))
        key = _key(observed)
        if first is None:
            counts['accepted'] += 1
            slot['controls'].setdefault(key, dict(id=f'control/{phase}/{len(slot["controls"])}', value=observed))
        else:
            counts['refused'] += 1
            _phase, row, code = first
            slot['negatives'].setdefault(key, dict(id=f'negative/{phase}/{len(slot["negatives"])}', value=observed,
                                                   target=row, code=code, families=sorted(families[(phase, key)])))
    m.RECORDER = None
    return collected, counts


def lane_matrix(phase, controls, negatives):
    """Every row on every collected case: controls pass all rows, a negative fails exactly its target."""
    rows = table_rows(phase)
    problems = []
    for ctl in controls:
        failing = [name for name, predicate, ctx in rows if predicate(ctl['value'], ctx) is not None]
        if failing:
            problems.append(dict(case=ctl['id'], kind='control_refused', rows=failing))
    for neg in negatives:
        failing = [name for name, predicate, ctx in rows if predicate(neg['value'], ctx) is not None]
        if failing != [neg['target']]:
            problems.append(dict(case=neg['id'], kind='not_single_row', target=neg['target'], rows=failing))
    return problems


def suite_for(phase, slot, negative_limit=4, control_limit=6):
    module = TABLE_PREFIX + phase
    controls = list(slot['controls'].values())[:control_limit]
    if not controls:
        return None
    masked = {p['case'] for p in lane_matrix(phase, [], list(slot['negatives'].values()))}
    negatives = []
    for row in [name for name, _, _ in table_rows(phase)]:
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
    return g.Suite(f'W3H {phase}', factory, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
