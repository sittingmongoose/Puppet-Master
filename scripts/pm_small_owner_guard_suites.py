"""DM guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py).

Adapter only: no table module imports it, so the tool scans just the phase
table under test. Every witness of the DM checker runs once per family under
the checker's observation recorder (the complete family suites, the guard
catalogue positives/negatives and the numeric/retry boundaries of
pm-small-owner-events.py main()). An accepted phase evaluation is a control
of its table; a refused evaluation gives its first refusing row as the
negative's target. Negatives whose observation fails more than that one row
are reported masked by the lane matrix and excluded from tool proof; they
stay refused in the complete checker. Nothing here decides a checker result.
"""
import copy
import hashlib
import importlib
import io
import contextlib
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402
import importlib.util  # noqa: E402

TABLE_PREFIX = 'pm_small_owner_table_'
RETURN_SOURCE = 'return g.Case(table, check, context)'
FAMILIES = (
    'format.applied', 'lsp.server.lifecycle_changed', 'model.catalog_refreshed',
    'subagent.context_rehydrated', 'subagent.context_shrunk', 'project.added',
    'project.created', 'git.clone.completed',
)


def _dm():
    spec = importlib.util.spec_from_file_location('dm_checker', ROOT / 'scripts/pm-small-owner-events.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def table_rows(phase):
    module = importlib.import_module(TABLE_PREFIX + phase)
    case = module.case(None)
    return [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]


def _key(observed):
    return hashlib.sha256(json.dumps(observed, sort_keys=True).encode()).hexdigest()


def collect(progress=None):
    dm = _dm()
    dm.RECORDER = []
    counts = dict(records=0, accepted=0, refused=0)
    collected = {}
    for family in FAMILIES:
        os.environ['PM_DM_FAMILY'] = family
        with contextlib.redirect_stdout(io.StringIO()):
            dm.main()
        if progress:
            progress(family)
    os.environ.pop('PM_DM_FAMILY', None)
    import pm_small_owner_p2a_cases as p2a
    counts['p2a_witnesses'] = p2a.run_all(dm)
    if progress:
        progress('p2a')
    for phase, observed, first in dm.RECORDER:
        counts['records'] += 1
        slot = collected.setdefault(phase, dict(controls={}, negatives={}))
        key = _key(observed)
        if first is None:
            counts['accepted'] += 1
            slot['controls'].setdefault(key, dict(id=f'control/{phase}/{len(slot["controls"])}', value=observed))
        else:
            counts['refused'] += 1
            row, code = first
            slot['negatives'].setdefault(key, dict(id=f'negative/{phase}/{len(slot["negatives"])}',
                                                   value=observed, target=row, code=code))
    dm.RECORDER = None
    return collected, counts


def lane_matrix(phase, controls, negatives):
    """Direct check of every row on every collected case (tool repeats it)."""
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
    negatives = []
    masked = {p['case'] for p in lane_matrix(phase, [], list(slot['negatives'].values()))}
    for row in sorted({n['target'] for n in slot['negatives'].values()}):
        own = [n for n in slot['negatives'].values() if n['target'] == row and n['id'] not in masked]
        negatives += own[:negative_limit]
    if not negatives:
        return None
    first = controls[0]['id']
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], first,
                     'complete-checker observation whose first refusal is this row')
          for n in negatives]
    path = f'scripts/{module}.py'
    factory = importlib.import_module(module).case
    return g.Suite(f'DM {phase}', factory, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
