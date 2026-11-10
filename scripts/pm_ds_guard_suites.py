"""Lane DS guard-table suites for the gated shared tool (scripts/pm_guard_isolation.py).

Adapter only: no table module imports it, so the tool scans just the phase table
under test. Every witness source of the DS checkers (the complete checker CLIs and
fixtures, the DS round-2/3/4 builders, the DS cohort modules, the Browser fixture
contracts and unit tests, and the part-2A witnesses) runs once under the
observation recorder of scripts/pm_ds_tables.py. An observation where every row
holds is a control of its table; an observation where exactly one row refuses is
a single-row negative of that row; an observation where two or more rows refuse
is reported (it stays refused in the complete checker) and is never given to the
tool. Only the first refusing table of each checker call (pm_ds_tables.entry)
yields a negative: a table that refuses later in the same call is reported as
refused later and never credited. Nothing here decides a checker result.
"""
from __future__ import annotations

import contextlib
import copy
import hashlib
import importlib
import importlib.util
import io
import json
import sys
import traceback
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_guard_isolation as g  # noqa: E402
import pm_ds_tables as T  # noqa: E402

RETURN_SOURCE = 'return g.Case(table, check, context)'
COHORTS = ('binding_faults', 'body_faults', 'browser_harness_faults', 'browser_isolating', 'codec_controls',
           'fault_controls', 'format_controls', 'home4_isolating', 'home4_owner_controls', 'home4_physical',
           'reset_isolating', 'shared_harness_faults', 'shared_runtime_controls', 'structured_inputs',
           'v2_history_controls')
UNIT_TESTS = ('test_pm_browser_workspace_created', 'test_pm_browser_workspace_reset', 'test_pm_browser_event_admission')


def phases():
    return sorted(p.stem[len(T.TABLE_PREFIX):] for p in (ROOT / 'scripts').glob(T.TABLE_PREFIX + '*.py'))


def _quiet(call):
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        return call()


def _cases_of(module):
    cases = list(module.cases())
    if hasattr(module, 'source_identity_controls'):
        cases.extend(module.source_identity_controls())
    for case in cases:
        yield (case['id'], case['entry']) if isinstance(case, dict) else case


def sources(include_unit_tests=True):
    """(label, zero-argument call) for every witness source, in a fixed order."""
    import pm_home_layout_v2_slot_receipt as home
    import pm_terminal_workgroup_compatibility as terminal
    import pm_event_authority_ds_round2 as round2
    import pm_event_authority_ds_round3 as round3
    import pm_event_authority_ds_round4 as round4
    import pm_ds_p2a_cases as p2a
    out = [('home4/run', lambda: home.run(ROOT)), ('home4/self_test', lambda: home.self_test(ROOT)),
           ('terminal/run', lambda: terminal.run(json.loads((ROOT / terminal.FIXTURES).read_text()),
                                                 json.loads((ROOT / terminal.SCHEMA).read_text()))),
           ('terminal/self_test', lambda: _argv(terminal.main, ['--self-test']))]
    for name, module in (('round2', round2), ('round3', round3), ('round4', round4)):
        out.append((f'{name}/suite', lambda m=module: m.build().run()))
    out.append(('round3/type_sweep', round3.type_sweep))
    out.append(('round4/format_sweep', round4.format_sweep))
    for cohort in COHORTS:
        module = importlib.import_module('pm_ds_' + cohort)
        for ident, call in _cases_of(module):
            out.append((f'cohort/{cohort}/{ident}', call))
    for ident, call in p2a.cases():
        out.append((f'p2a/{ident}', call))
    comp = json.loads((ROOT / 'Plans/context_compaction_completion_contract_fixtures.json').read_text())

    def compaction_fixtures():
        valid = {v['name']: v for v in comp['valid']}
        for v in comp['valid']:
            round2.compaction_payload_errors(v['payload'])
        for n in comp['invalid']:
            changed = copy.deepcopy(valid[n['base_valid']]['payload'])
            changed.update(n.get('patch', {}))
            for key in n.get('remove', []):
                changed.pop(key, None)
            round2.compaction_payload_errors(changed)
        round2.compaction_event_errors(comp['valid_event'])
        for n in comp['invalid_events']:
            changed = copy.deepcopy(comp['valid_event'])
            changed.update(n.get('patch', {}))
            round2.compaction_event_errors(changed)
    out.append(('compaction/fixtures', compaction_fixtures))
    gate_spec = importlib.util.spec_from_file_location('ds_suites_admission', ROOT / 'scripts/pm-browser-event-admission.py')
    gate_module = importlib.util.module_from_spec(gate_spec)
    gate_spec.loader.exec_module(gate_module)
    out.append(('admission/validate', gate_module.validate))
    for name in ('pm_browser_workspace_created', 'pm_browser_workspace_reset'):
        module = importlib.import_module(name)
        out.append((f'{name}/validate', module.validate_fixture_contracts))
    created_v2 = importlib.import_module('pm_browser_workspace_created_v2')

    def v2_positives():
        for case in (None, 'verified_empty', 'degraded_survivors'):
            checkpoint, index, observation, _ = created_v2.fixture_values(generic_case=case)
            created_v2.advance_failures(None, checkpoint, index, observation)
            created_v2.source_failures(checkpoint, index, observation, disclosure=True)
    out.append(('pm_browser_workspace_created_v2/main', v2_positives))
    if include_unit_tests:
        for name in UNIT_TESTS:
            out.append((f'unittest/{name}', lambda n=name: _run_tests(n)))
    return out


def _argv(main, args):
    from unittest import mock
    with mock.patch.object(sys, 'argv', ['pm-ds-guard-suites'] + args):
        return main()


def _run_tests(name):
    suite = unittest.defaultTestLoader.loadTestsFromName(name)
    result = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0).run(suite)
    return {'tests': result.testsRun, 'failures': len(result.failures), 'errors': len(result.errors)}


def _key(observed):
    return hashlib.sha256(json.dumps(observed, sort_keys=True).encode()).hexdigest()


def collect(progress=None, include_unit_tests=True, only=None):
    """Run every witness source under the recorder; aggregate per phase."""
    sys.path.insert(0, str(ROOT / 'tests'))
    T.RECORDER = []
    collected = {phase: {'controls': {}, 'negatives': {}, 'multi': {}, 'later': {}} for phase in phases()}
    counts = {'sources': 0, 'source_exceptions': [], 'records': 0, 'accepted': 0, 'refused': 0, 'refused_later': 0}
    try:
        for label, call in sources(include_unit_tests):
            if only and not any(label.startswith(prefix) for prefix in only):
                continue
            start = len(T.RECORDER)
            try:
                _quiet(call)
            except Exception as exc:  # a witness source that raises is reported, never credited
                counts['source_exceptions'].append({'source': label, 'exception': repr(exc),
                                                    'trace': traceback.format_exc()[-1500:]})
            counts['sources'] += 1
            first_refusal = set()
            for phase, observed, refusing, call in T.RECORDER[start:]:
                counts['records'] += 1
                slot = collected.setdefault(phase, {'controls': {}, 'negatives': {}, 'multi': {}, 'later': {}})
                key = _key(observed)
                if not refusing:
                    counts['accepted'] += 1
                    entry = slot['controls'].setdefault(key, {'value': observed, 'sources': []})
                elif call in first_refusal:
                    # Refused later in a checker call that an earlier table row already refused:
                    # reported, never credited as a negative.
                    counts['refused_later'] += 1
                    entry = slot['later'].setdefault(key, {'value': observed, 'rows': refusing, 'sources': []})
                else:
                    first_refusal.add(call)
                    counts['refused'] += 1
                    kind = 'negatives' if len(refusing) == 1 else 'multi'
                    entry = slot[kind].setdefault(key, {'value': observed, 'rows': refusing, 'sources': []})
                if len(entry['sources']) < 12:
                    entry['sources'].append(label)
                entry['count'] = entry.get('count', 0) + 1
            del T.RECORDER[start:]
            if progress:
                progress(label)
    finally:
        T.RECORDER = None
    return collected, counts


def table_rows(phase):
    module = importlib.import_module(T.TABLE_PREFIX + phase)
    case = module.case(None)
    return [(name, guard.predicate, case.context, guard.refusal_code) for name, guard in case.table.guards.items()]


def lane_matrix(phase, slot):
    """Every row on every collected observation (the tool repeats it on its sample)."""
    rows = table_rows(phase)
    problems = []
    for key, entry in slot['controls'].items():
        failing = [name for name, predicate, ctx, _ in rows if predicate(entry['value'], ctx) is not None]
        if failing:
            problems.append({'kind': 'control_refused', 'rows': failing, 'sources': entry['sources']})
    for key, entry in slot['negatives'].items():
        failing = [name for name, predicate, ctx, _ in rows if predicate(entry['value'], ctx) is not None]
        if failing != entry['rows']:
            problems.append({'kind': 'not_single_row', 'target': entry['rows'], 'rows': failing, 'sources': entry['sources']})
    return problems


def suite_for(phase, slot):
    """One tool suite per phase: its controls and one single-row negative per witnessed row."""
    module = T.TABLE_PREFIX + phase
    rows = table_rows(phase)
    codes = {name: code for name, _, _, code in rows}
    controls = list(slot['controls'].values())
    if not controls:
        return None
    negatives = {}
    for entry in slot['negatives'].values():
        negatives.setdefault(entry['rows'][0], entry)
    if not negatives:
        return None
    gc = [g.Control(f'control/{phase}/{i}', copy.deepcopy(c['value']), 'synthetic') for i, c in enumerate(controls)]
    gn = [g.Negative(f'negative/{phase}/{row}', copy.deepcopy(entry['value']), row, codes[row], gc[0].id,
                     'complete-checker observation whose only refusing row is this row; witnesses: '
                     + ', '.join(entry['sources'][:3]))
          for row, entry in sorted(negatives.items())]
    path = f'scripts/{module}.py'
    factory = importlib.import_module(module).case
    return g.Suite(f'DS {phase}', factory, gc, gn, (path,), ROOT,
                   non_guards=[g.NonGuard(path, 'case', 'return', RETURN_SOURCE,
                                          'Construct the fresh execution Case; this return makes no acceptance or refusal decision.')])
