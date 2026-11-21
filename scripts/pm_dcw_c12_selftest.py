#!/usr/bin/env python3
"""Negative self-tests for the C12-DCW evidence tools: each must refuse bad evidence.

Every test builds a deliberately wrong observation and checks the tool does not
credit it. A tool that credited any of these would make a real check falsely
pass. Exit 0 only when every test refuses as expected.
"""
import copy
import io
import json
import sys
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dcw_c12 as c12
import pm_dcw_c12_boundary as boundary
import pm_dcw_c12_implications as implications
import pm_dcw_c12_matrix as matrix
import pm_dcw_c12_retained as retained
import pm_dcw_event_oracles as m
import pm_dcw_guard_rows as rows
import pm_dcw_number_custody as custody

RESULTS = []


def test(name):
    def wrap(function):
        try:
            function()
        except AssertionError as exc:
            RESULTS.append(dict(test=name, status='fail', error=str(exc)[:300]))
        else:
            RESULTS.append(dict(test=name, status='pass'))
        return function
    return wrap


def envelope_control():
    row = m.load('Plans/dcw_event_contract_fixtures.json')['families'][0]
    return copy.deepcopy(row['positive']['event'])


@test('schema: a mutation the real checker accepts is not a kill')
def _():
    event = envelope_control()
    changed = dict(event, actor_ref='actor:another-valid-actor')
    assert c12.real(c12.ENVELOPE, None, False, changed) == ['accepted']


@test('schema: a real refusal is the exact OE001 schema refusal, and only the OE001 cut accepts it')
def _():
    event = envelope_control()
    changed = dict(event, scope_kind='not-a-scope')
    assert c12.real(c12.ENVELOPE, None, False, changed) == c12.EXPECTED
    assert c12.cut(c12.ENVELOPE, None, False, changed) == ['accepted']
    saved = rows.DISABLED
    rows.DISABLED = frozenset({'O001'})
    try:
        assert c12.real(c12.ENVELOPE, None, False, changed) == c12.EXPECTED, 'an unrelated cut must not accept'
    finally:
        rows.DISABLED = saved


@test('schema: mirror drift (a dropped keyword) breaks parity instead of being credited')
def _():
    site = c12.mirror(c12.ENVELOPE, None, False)
    site.update(path=c12.ENVELOPE, definition=None)
    drifted = copy.deepcopy(site)
    drifted['docs'][c12.ENVELOPE]['properties']['scope_kind'].pop('enum')
    from referencing import Registry, Resource
    registry = Registry().with_resources((d['$id'], Resource.from_contents(d)) for d in drifted['docs'].values())
    drifted['validator'] = m.CurrentValidator(drifted['docs'][c12.ENVELOPE], registry=registry, format_checker=m.FORMAT)
    changed = dict(envelope_control(), scope_kind='not-a-scope')
    real_refuses = c12.real(c12.ENVELOPE, None, False, changed) != ['accepted']
    mirror_accepts = not c12.mirror_errors(drifted, changed)
    assert real_refuses and mirror_accepts, 'drift must be visible to the parity assertion'


@test('schema: clause attribution names the failing keyword at its schema pointer')
def _():
    site = c12.mirror(c12.ENVELOPE, None, False)
    site.update(path=c12.ENVELOPE, definition=None)
    clauses = c12.mirror_errors(site, dict(envelope_control(), scope_kind='not-a-scope'))
    assert (c12.ENVELOPE, '/properties/scope_kind', 'enum') in clauses, clauses


@test('schema: storage_utc_z on observed_at_utc is its own clause, not the broad format')
def _():
    site = c12.mirror(c12.ENVELOPE, None, False)
    site.update(path=c12.ENVELOPE, definition=None)
    clauses = c12.mirror_errors(site, dict(envelope_control(), observed_at_utc='2026-11-04T12:00:00+00:00'))
    assert clauses == [c12.STORAGE_CLAUSE], clauses


@test('boundary: a cut that still refuses later is a chain, never complete_boundary')
def _():
    original = boundary.run
    calls = []
    def fake(w, disabled=frozenset()):
        calls.append(set(disabled))
        return dict(outcome='x', row='X') if not disabled else (dict(outcome='y', row='Y') if disabled == {'X'} else dict(outcome='accept', row=None))
    boundary.run = fake
    try:
        result = boundary.classify({}, 'X')
    finally:
        boundary.run = original
    assert result['status'] == 'chain', result


@test('boundary: an exception after the cut is an exception, never complete_boundary')
def _():
    original = boundary.run
    def fake(w, disabled=frozenset()):
        return dict(outcome='x', row='X') if not disabled else dict(outcome='EXCEPTION', row=None, type='TypeError')
    boundary.run = fake
    try:
        result = boundary.classify({}, 'X')
    finally:
        boundary.run = original
    assert result['status'] == 'exception', result


@test('implications: an entailment whose named rows never appear in the observed chain fails')
def _():
    results = {'O115': [dict(status='chain', chain=[dict(row='O999', outcome='z'), dict(row=None, outcome='accept')])]}
    report, failures = implications.check(results, {'O115': dict(best='chain')})
    assert failures == ['O115'], report


@test('implications: a precondition with the wrong exception type fails')
def _():
    results = {'O006': [dict(status='exception', cut=dict(outcome='EXCEPTION', type='KeyError',
                                                             frame=dict(text="payload['readable']")))]}
    report, failures = implications.check(results, {'O006': dict(best='exception')})
    assert failures == ['O006'], report


@test('implications: a row with no written implication fails')
def _():
    report, failures = implications.check({'O999': []}, {'O999': dict(best='chain')})
    assert failures == ['O999'], report


@test('retained: a read that changes the sealed store is caught')
def _():
    before, _ = retained.store_snapshot()
    key = next(iter(custody._ISSUED))
    saved = custody._ISSUED[key]
    custody._ISSUED['c12-forged@x@y'] = saved
    try:
        after, _ = retained.store_snapshot()
        assert before != after, 'a new receipt must change the snapshot'
    finally:
        custody._ISSUED.pop('c12-forged@x@y')


@test('retained: a missing receipt refuses, and the refusal is not a manufactured receipt')
def _():
    family = 'bundle.revision_requested'
    control = retained.controls(family)[0]
    refs = retained.references(control)
    w, restore = retained.apply_defect(control, 'missing-receipt', refs)
    try:
        before, _ = retained.store_snapshot()
        try:
            outcome = retained.suites.invoke(w)
        except m.Refusal as exc:
            outcome = (str(exc), exc.guard)
        after, _ = retained.store_snapshot()
    finally:
        restore()
    assert outcome == ('original_authority', 'N001') and before == after, outcome


def shared_credit_case(donors, target_digest):
    def coverage(family, digest):
        clause = dict(source='schema.json', schema_pointer='/properties/value', keyword='type')
        if family == 'target':
            clause.update(status='unwitnessed')
        else:
            clause.update(status='witnessed', witnesses=[family + '/witness'])
        return [dict(schema='schema.json', definition=None, historical=False, schema_sha256=digest,
                     controls=[], credited=0, invalid=0, mirror_parity_checks=0, clauses=[clause])]

    inputs = {family: coverage(family, digest) for family, digest in donors.items()}
    inputs['target'] = coverage('target', target_digest)
    inputs.update({
        'guard-results.json': {'rows': []},
        'boundary-summary.json': {},
        'implications.json': {'status': 'pass'},
        'entailments.json': {'rows': [], 'status': 'pass'},
        'retained-store.json': [],
        'retained-summary.json': {'status': 'pass'},
        'datetime-inventory.json': [],
        'datetime-summary.json': {'status': 'pass'},
        'number-lane.json': {'results': [], 'status': 'pass'},
    })
    argv = ['pm_dcw_c12_matrix.py', '--evidence', 'input', '--out', 'matrix.json']
    with (patch('sys.argv', argv), patch.object(matrix.c12, 'FAMILIES', list(donors) + ['target']),
          patch.object(matrix, 'load', side_effect=lambda path: inputs[Path(path).name]),
          patch.object(matrix, 'coverage_file', side_effect=lambda _, family: Path(family)),
          patch.object(matrix, 'supplement', return_value={}), patch.object(matrix, 'reached_rows', return_value={}),
          patch.object(Path, 'rglob', return_value=[]), patch.object(Path, 'write_text') as save,
          redirect_stdout(io.StringIO())):
        try:
            matrix.main()
        except SystemExit as exc:
            code = exc.code
    report = json.loads(save.call_args.args[0])
    return code, report['families'][-1]['schema_sites'][0]['clauses'][0]


@test('schema: an unequal shared witness schema digest is refused')
def _():
    code, clause = shared_credit_case({'donor': 'a' * 64}, 'b' * 64)
    assert code == 1 and clause['status'] == 'unwitnessed', (code, clause)


@test('schema: the matched shared witness is used even when a different digest was indexed first')
def _():
    code, clause = shared_credit_case({'first': 'a' * 64, 'matched': 'b' * 64}, 'b' * 64)
    assert code == 0 and clause.get('shared_family') == 'matched', (code, clause)


def main():
    status = 'pass' if all(r['status'] == 'pass' for r in RESULTS) else 'fail'
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    report = dict(status=status, tests=RESULTS)
    if out:
        out.write_text(json.dumps(report, indent=1) + '\n')
    print(json.dumps(report, indent=1))
    raise SystemExit(0 if status == 'pass' else 1)


if __name__ == '__main__':
    main()
