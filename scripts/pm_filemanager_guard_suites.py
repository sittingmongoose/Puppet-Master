"""DFM guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py, gated at 004bdedd63).

Adapter only: no table module imports it, so the tool scans just the phase table under test.
Every witness of the complete checker (scripts/pm-filemanager-event-contracts.py) runs once under
the checker's observation recorder: each family's positive, every negative, transition and
boundary case, and the checker-integrity witnesses. Every observation a phase passed before the
witness's first refusal (or in an accepted witness) is a control of that phase. A refused
witness's FIRST refusal gives the negative: the observation of the phase holding that refusal,
targeted at the refusing row. A witness whose refusal is not a table refusal, or whose result
differs from its fixture expectation, is reported, never relabelled. Nothing here repairs, caches
or decides a checker result.
"""
import copy
import hashlib
import importlib.util
import json
import pickle
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402

_spec = importlib.util.spec_from_file_location('pm_filemanager_event_contracts', ROOT / 'scripts/pm-filemanager-event-contracts.py')
dfm = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = dfm
_spec.loader.exec_module(dfm)

RETURN_SOURCE = 'return g.Case(table, check, context)'
TABLE_GLOB = 'pm_filemanager_table_*.py'


def key(value):
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


def phases(root=ROOT):
    return sorted(p.stem[len(dfm.TABLE_PREFIX):] for p in (root / 'scripts').glob(TABLE_GLOB))


def run_recorded(action):
    dfm.RECORDER = records = []
    try:
        action()
        error = None
    except Exception as exc:  # the harness records every outcome; it never decides one
        error = exc
    finally:
        dfm.RECORDER = None
    return error, records


def witnesses(fixtures=None, inputs=None):
    """(pair id, family, expectation, action) for every witness of the complete checker.

    expectation is None for an accepted witness, or a dict naming the fixture's expected defect.
    """
    inputs = inputs or dfm.integrity_inputs()
    fixtures = fixtures or inputs['fixtures']
    for row in fixtures['rows']:
        name = row['event_type']
        yield (f'{name}/positive', name, None, (lambda row=row: dfm.validate_case(row['event_type'], row['payload'], row['trace'])))
        for case in row['negative_cases']:
            yield (f'{name}/negative/{case["name"]}', name, case, (lambda row=row, case=case: dfm.negative_case(row, case)))
        for case in row['transition_cases']:
            yield (f'{name}/transition/{case["name"]}', name, None if case['valid'] else case,
                   (lambda row=row, case=case: dfm.transition_case(row, case)))
        for case in row['boundary_cases']:
            yield (f'{name}/boundary/{case["name"]}', name, None if case['valid'] else case,
                   (lambda row=row, case=case: dfm.boundary_case(row, case)))
    for case_id, target, action in dfm.integrity_witnesses(inputs):
        yield (case_id, 'shared', None if target is None else {'name': case_id, 'expected_row': target}, action)


def expectation_problem(expectation, error):
    """None when the outcome matches the fixture expectation; otherwise a short reason."""
    if expectation is None:
        return None if error is None else 'accepted witness refused: ' + type(error).__name__ + ': ' + str(error)[:160]
    if error is None:
        return 'negative witness accepted'
    if not isinstance(error, dfm.TableRefusal):
        return 'untracked refusal: ' + type(error).__name__ + ': ' + str(error)[:160]
    if 'expected_row' in expectation:
        return None if error.row == expectation['expected_row'] else 'refused by ' + error.row
    try:
        dfm.check_negative_reason(expectation, error)
    except AssertionError as problem:
        return str(problem)
    return None


def collect(families=None, flips=True, progress=None):
    """Replay every witness once; return per-phase controls/negatives and findings."""
    suites, findings = {}, []
    for n, (pair, family, expectation, action) in enumerate(witnesses()):
        if families is not None and family not in families:
            continue
        if progress and n % 1000 == 0:
            progress(n)
        error, records = run_recorded(action)
        problem = expectation_problem(expectation, error)
        if problem:
            findings.append(dict(kind='unexpected_result', pair=pair, problem=problem))
            continue
        refused_at = next((i for i, r in enumerate(records) if r[2] is not None), None)
        for phase, observed, _ in records[:refused_at]:
            slot = suites.setdefault(phase, dict(controls={}, negatives={}))
            k = key(observed)
            if k not in slot['controls']:
                slot['controls'][k] = dict(id=f'control/{len(slot["controls"])}/{pair}', value=observed, family=family)
        if expectation is None:
            continue
        if refused_at is None or records[refused_at][2][0] != error.row or records[refused_at][0] != error.phase:
            findings.append(dict(kind='untracked_refusal', pair=pair))
            continue
        phase, observed, (row, code) = records[refused_at]
        slot = suites.setdefault(phase, dict(controls={}, negatives={}))
        flip = complete_boundary_flip(action, phase, row) if flips else None
        k = key((row, observed))
        if k not in slot['negatives']:
            slot['negatives'][k] = dict(id=f'negative/{pair}', value=observed, target=row, code=code, family=family,
                                        defect=f'{pair} ({family}): one source change', aliases=[], flips=[flip], families={family})
        else:
            slot['negatives'][k]['aliases'].append(pair)
            slot['negatives'][k]['flips'].append(flip)
            slot['negatives'][k]['families'].add(family)
    for slot in suites.values():
        for item in slot['negatives'].values():
            item['families'] = sorted(item['families'])
    return suites, findings


def complete_boundary_flip(action, phase, row):
    """Re-run the whole witness with only its refusing row swapped to always-pass.

    'accepted' means the complete checker path then accepts it; otherwise the next refusing
    (phase, row) is reported. Tool credit is per phase table; this is lane evidence only.
    """
    entries = dfm.table_rows(phase)
    dfm._TABLE_ROWS[phase] = [(n, (lambda value, context: None) if n == row else p, c) for n, p, c in entries]
    try:
        error, records = run_recorded(action)
    finally:
        dfm._TABLE_ROWS[phase] = entries
    if error is None:
        return 'accepted'
    if isinstance(error, dfm.TableRefusal):
        return f'refused_later:{error.phase}:{error.row}'
    return 'refused_later:derivation_requires_cut_row:' + type(error).__name__


def lane_matrix(phase, controls, negatives):
    """Cheap direct check of every row on every case (the tool repeats it under certification)."""
    rows = dfm.table_rows(phase)
    problems = []
    for c in controls:
        failing = [n for n, p, ctx in rows if p(c['value'], ctx) is not None]
        if failing:
            problems.append(dict(case=c['id'], kind='control_refused', rows=failing))
    for item in negatives:
        failing = [name for name, p, ctx in rows if p(item['value'], ctx) is not None]
        if failing != [item['target']]:
            problems.append(dict(case=item['id'], kind='not_single_row', target=item['target'], rows=failing,
                                 aliases=item['aliases'][:5]))
    return problems


def tool_controls(controls, limit):
    """Every family's first control of the phase, then the rest in recorded order, up to limit."""
    chosen, seen = [], set()
    for c in controls:
        if c['family'] not in seen:
            seen.add(c['family'])
            chosen.append(c)
    for c in controls:
        if len(chosen) >= limit:
            break
        if c not in chosen:
            chosen.append(c)
    return chosen


def suite_for(phase, slot, control_limit=40):
    module = dfm.table_module(phase)
    controls = tool_controls(list(slot['controls'].values()), control_limit)
    negatives = list(slot['negatives'].values())
    if not controls:
        return None
    by_family = {}
    for c in controls:
        by_family.setdefault(c['family'], c['id'])
    first = controls[0]['id']
    gc = [g.Control(c['id'], copy.deepcopy(c['value']), 'synthetic') for c in controls]
    gn = [g.Negative(n['id'], copy.deepcopy(n['value']), n['target'], n['code'], by_family.get(n['family'], first), n['defect'])
          for n in negatives]
    path = f'scripts/{dfm.TABLE_PREFIX}{phase}.py'
    return g.Suite(f'DFM {phase}', module.case, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])


def json_safe(value):
    return json.loads(json.dumps(value, default=str))
