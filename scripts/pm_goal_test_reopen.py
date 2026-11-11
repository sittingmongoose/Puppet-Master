#!/usr/bin/env python3
"""TEST_ONLY persistence, reopen protocol and fault matrix for owner adapters.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

The protocol is the generic owner append path every DG family composes:

    reserve  ->  append (frames + commit frame)  ->  first receipt  ->  terminal publication

Each step is a durable write of the TEST_ONLY Storage (pm_goal_test_storage).
A fault-matrix row kills a real child process (``os._exit``) at one cut point,
then a **fresh process** reopens the directory and reads the actual bytes back:
CURRENT, manifest, segment frames, private custody and cells. A further fresh
process re-enters with the same request and must converge to exactly one
Event, one immutable first receipt and one terminal publication. A second
re-entry must change nothing (manifest generation unchanged).

Native redb/seglog fsync, crash durability and process restart remain NOT_RUN:
the matrix proves the modeled protocol and its expected durable prefixes only.
"""
from __future__ import annotations

import argparse
import copy
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

import pm_goal_test_storage as S

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = S.NATIVE_LINE
HERE = Path(__file__).resolve().parent

# cut -> expected durable read-back in a fresh process before re-entry.
MATRIX = [
    dict(cut=None, exit=0, reservation='published', events=1, custody=1, terminal=True, notes=[],
         classification='published'),
    dict(cut='before_reservation', exit=S.CRASH_EXIT, reservation=None, events=0, custody=0, terminal=False,
         notes=[], classification='no_effect'),
    dict(cut='after_reservation', exit=S.CRASH_EXIT, reservation='reserved', events=0, custody=0, terminal=False,
         notes=[], classification='reserved_unappended'),
    dict(cut='before_append', exit=S.CRASH_EXIT, reservation='reserved', events=0, custody=0, terminal=False,
         notes=[], classification='reserved_unappended'),
    dict(cut='torn_member_frame', exit=S.CRASH_EXIT, reservation='reserved', events=0, custody=0,
         terminal=False, notes=['tail_truncated'], classification='reserved_unappended'),
    dict(cut='torn_commit_frame', exit=S.CRASH_EXIT, reservation='reserved', events=0, custody=0,
         terminal=False, notes=['tail_truncated'], classification='reserved_unappended'),
    dict(cut='after_append_frames', exit=S.CRASH_EXIT, reservation='appended', events=1, custody=0,
         terminal=False, notes=['tail_group_issued'], classification='appended_without_first_custody'),
    dict(cut='after_append', exit=S.CRASH_EXIT, reservation='appended', events=1, custody=0, terminal=False,
         notes=[], classification='appended_without_first_custody'),
    dict(cut='before_first_receipt', exit=S.CRASH_EXIT, reservation='appended', events=1, custody=0,
         terminal=False, notes=[], classification='appended_without_first_custody'),
    dict(cut='after_first_receipt', exit=S.CRASH_EXIT, reservation='receipted', events=1, custody=1,
         terminal=False, notes=[], classification='receipted_unpublished'),
    dict(cut='before_terminal', exit=S.CRASH_EXIT, reservation='receipted', events=1, custody=1,
         terminal=False, notes=[], classification='receipted_unpublished'),
    dict(cut='after_terminal', exit=S.CRASH_EXIT, reservation='published', events=1, custody=1, terminal=True,
         notes=[], classification='published'),
]


def probe_spec(tag='probe'):
    """A generic TEST_ONLY owner request; families substitute their own path."""
    project = 'TEST_ONLY-project-α-' + tag
    candidate = dict(
        schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
        event_id='TEST_ONLY:goal_test.adapter_probe:' + tag, event_type='goal_test.adapter_probe',
        project_id=project, thread_id=None, run_id=None, node_id=None, attempt_id=None,
        actor_ref='TEST_ONLY:actor:adapter-probe', requested_account_ref=None, effective_account_ref=None,
        occurred_at_utc='2026-11-11T12:00:00.000Z', producer_sequence_id=None,
        correlation_id='TEST_ONLY:correlation:' + tag, causation_event_id=None, parent_event_id=None,
        idempotency_key='TEST_ONLY:goal_test.adapter_probe:key:' + tag,
        payload_schema_id='TEST_ONLY:goal_test.adapter_probe.payload.v1',
        payload=dict(qualification=QUALIFICATION, tag=tag), payload_ref=None, redaction_profile='no_secrets',
        replay_policy='dedupe_by_idempotency_key',
        migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                       compatibility_event_type=None))
    return dict(qualification=QUALIFICATION, operation_id='TEST_ONLY:operation:' + tag,
                request=dict(kind='TEST_ONLY:adapter_probe', tag=tag), candidates=[candidate],
                terminal=dict(table='TEST_ONLY:terminal', key='TEST_ONLY:terminal:' + tag,
                              value=dict(qualification=QUALIFICATION, outcome='probe_published', tag=tag)))


def classify(storage, operation_id):
    r = storage.reservation_state(operation_id)
    if r is None or r['state'] == 'released':
        return 'no_effect'
    if r['state'] == 'reserved':
        return 'reserved_unappended'
    if r['state'] == 'appended':
        missing = [e for e in r['event_ids'] if storage.first_custody(e) is None]
        # A known append without all first custody is never reported as no_append.
        return 'appended_without_first_custody' if missing else 'receipted_unpublished'
    if r['state'] == 'receipted':
        return 'receipted_unpublished'
    return 'published'


def run_protocol(storage, spec, *, record=None):
    """Execute or resume the four-step owner protocol from the durable state."""
    op, request = spec['operation_id'], spec['request']
    if storage.reservation_state(op) is None:
        handle = storage.reserve(op, request)
    else:
        handle, _ = storage.resume(op, request)
    append = storage.append(handle, copy.deepcopy(spec['candidates']))
    receipts = [storage.receipt_of(h) for h in storage.issue_first_receipt(handle)]
    t = spec['terminal']
    terminal = storage.publish_terminal(handle, t['table'], t['key'], t['value'])
    return dict(append=append, receipts=receipts, terminal=terminal)


def read_back(storage, spec):
    op = spec['operation_id']
    r = storage.reservation_state(op)
    ids = [] if r is None else list(r['event_ids'])
    events = {}
    for event_id in ids:
        raw = storage.read_frame(event_id)
        event = storage.read_event(event_id)
        events[event_id] = dict(sequence_id=event['sequence_id'], frame_sha256=S.sha256(raw),
                                observed_at_utc=event['observed_at_utc'],
                                persisted_at_utc=event['persisted_at_utc'])
    t = spec['terminal']
    return dict(qualification=QUALIFICATION, storage_instance_id=storage.storage_instance_id,
                recovered=[n['kind'] for n in getattr(storage, 'recovered', [])],
                reservation=None if r is None else r['state'], classification=classify(storage, op),
                events=events, custody={e: storage.first_custody(e) for e in ids if storage.first_custody(e)},
                terminal=storage.cell(t['table'], t['key']), observe=storage.observe(),
                manifest_generation=storage.manifest_generation, token=storage.read_token())


def child(argv):
    p = argparse.ArgumentParser()
    p.add_argument('action', choices=('create', 'run', 'read', 'reenter', 'release'))
    p.add_argument('--root', required=True)
    p.add_argument('--spec')
    p.add_argument('--cut')
    a = p.parse_args(argv)
    spec = json.loads(Path(a.spec).read_text()) if a.spec else None
    if a.action == 'create':
        storage = S.TestOwnerStorage.create(a.root)
        print(json.dumps(dict(storage_instance_id=storage.storage_instance_id)))
        return 0
    faults = S.FaultPlan(cut=a.cut, mode='exit') if a.cut else None
    storage = S.TestOwnerStorage.open(a.root, faults=faults)
    if a.action == 'run':
        run_protocol(storage, spec)
    elif a.action == 'reenter':
        run_protocol(storage, spec)
    elif a.action == 'release':
        handle, _ = storage.resume(spec['operation_id'], spec['request'])
        storage.release(handle)
    print(json.dumps(read_back(storage, spec), sort_keys=True))
    return 0


def _spawn(args):
    result = subprocess.run([sys.executable, str(HERE / 'pm_goal_test_reopen.py'), '--child', *args],
                            capture_output=True, text=True, cwd=str(HERE))
    out = None
    if result.stdout.strip():
        out = json.loads(result.stdout.strip().splitlines()[-1])
    return result.returncode, out, result.stderr


class MatrixFailure(Exception):
    pass


def _check(cond, message):
    if not cond:
        raise MatrixFailure(message)


def run_row(row, workdir, tag=None):
    tag = tag or (row['cut'] or 'control')
    root = Path(workdir) / tag
    spec = probe_spec(tag)
    spec_path = Path(workdir) / (tag + '.spec.json')
    spec_path.write_text(json.dumps(spec))
    code, created, err = _spawn(['create', '--root', str(root)])
    _check(code == 0, 'create failed: ' + err[-400:])
    args = ['run', '--root', str(root), '--spec', str(spec_path)] + (['--cut', row['cut']] if row['cut'] else [])
    code, out, err = _spawn(args)
    _check(code == row['exit'], '%s: exit %s expected %s %s' % (tag, code, row['exit'], err[-400:]))
    code, before, err = _spawn(['read', '--root', str(root), '--spec', str(spec_path)])
    _check(code == 0, tag + ': read failed ' + err[-400:])
    _check(before['storage_instance_id'] == created['storage_instance_id'], tag + ': instance changed')
    _check(before['reservation'] == row['reservation'], '%s: reservation %s' % (tag, before['reservation']))
    _check(len(before['events']) == row['events'], '%s: events %d' % (tag, len(before['events'])))
    _check(len(before['custody']) == row['custody'], '%s: custody %d' % (tag, len(before['custody'])))
    _check((before['terminal'] is not None) == row['terminal'], tag + ': terminal visibility')
    _check(before['classification'] == row['classification'], '%s: classification %s' % (tag, before['classification']))
    _check(all(n in before['recovered'] for n in row['notes']), '%s: recovery notes %s' % (tag, before['recovered']))
    code, after, err = _spawn(['reenter', '--root', str(root), '--spec', str(spec_path)])
    _check(code == 0, tag + ': reenter failed ' + err[-400:])
    _check(after['reservation'] == 'published' and len(after['events']) == 1 and len(after['custody']) == 1,
           tag + ': re-entry did not converge')
    _check(after['observe']['events'] == 1, tag + ': second Event appended')
    for event_id, receipt in before['custody'].items():
        _check(after['custody'][event_id] == receipt, tag + ': first receipt changed after re-entry')
    for event_id, info in before['events'].items():
        _check(after['events'][event_id] == info, tag + ': stored frame changed after re-entry')
    if before['terminal'] is not None:
        _check(after['terminal'] == before['terminal'], tag + ': terminal republished')
    code, again, err = _spawn(['reenter', '--root', str(root), '--spec', str(spec_path)])
    _check(code == 0 and again['manifest_generation'] == after['manifest_generation'],
           tag + ': second re-entry changed durable state')
    _check(again['custody'] == after['custody'] and again['terminal'] == after['terminal'],
           tag + ': second re-entry changed custody or terminal')
    return dict(cut=row['cut'], exit=row['exit'], before=dict(
        reservation=before['reservation'], classification=before['classification'], events=len(before['events']),
        custody=len(before['custody']), terminal=before['terminal'] is not None, recovered=before['recovered']),
        after=dict(reservation=after['reservation'], events=len(after['events']), custody=len(after['custody']),
                   terminal=after['terminal'] is not None,
                   sequence_ids=[v['sequence_id'] for v in after['events'].values()]),
        second_reentry_manifest_unchanged=True, status='pass')


def release_row(workdir):
    """Reserved release: a reserved, unappended operation resolves to confirmed no effect."""
    tag = 'reserved_release'
    root = Path(workdir) / tag
    spec = probe_spec(tag)
    spec_path = Path(workdir) / (tag + '.spec.json')
    spec_path.write_text(json.dumps(spec))
    _spawn(['create', '--root', str(root)])
    code, _, _ = _spawn(['run', '--root', str(root), '--spec', str(spec_path), '--cut', 'after_reservation'])
    _check(code == S.CRASH_EXIT, 'release: cut')
    code, out, err = _spawn(['release', '--root', str(root), '--spec', str(spec_path)])
    _check(code == 0 and out['reservation'] == 'released' and out['classification'] == 'no_effect',
           'release: not released ' + err[-300:])
    code, out, err = _spawn(['reenter', '--root', str(root), '--spec', str(spec_path)])
    _check(code != 0 and 'append/released' in err, 'release: re-entry appended after release')
    code, out, err = _spawn(['read', '--root', str(root), '--spec', str(spec_path)])
    _check(code == 0 and len(out['events']) == 0, 'release: event after release')
    return dict(cut='after_reservation+release', status='pass', events_after=0, refusal='append/released')


def altered_reentry_row(workdir):
    """Re-entry with an altered request after a crash is a conflict, not a new effect."""
    tag = 'altered_reentry'
    root = Path(workdir) / tag
    spec = probe_spec(tag)
    spec_path = Path(workdir) / (tag + '.spec.json')
    spec_path.write_text(json.dumps(spec))
    _spawn(['create', '--root', str(root)])
    code, _, _ = _spawn(['run', '--root', str(root), '--spec', str(spec_path), '--cut', 'after_append'])
    _check(code == S.CRASH_EXIT, 'altered: cut')
    altered = copy.deepcopy(spec)
    altered['request']['tag'] = tag + '-substituted'
    alt_path = Path(workdir) / (tag + '.alt.json')
    alt_path.write_text(json.dumps(altered))
    code, out, err = _spawn(['reenter', '--root', str(root), '--spec', str(alt_path)])
    _check(code != 0 and 'resume/conflict' in err, 'altered: re-entry accepted ' + err[-300:])
    code, out, err = _spawn(['read', '--root', str(root), '--spec', str(spec_path)])
    _check(code == 0 and len(out['events']) == 1 and not out['custody'], 'altered: state changed')
    return dict(cut='after_append+altered_request', status='pass', refusal='resume/conflict')


def run_matrix(workdir=None):
    own = workdir is None
    workdir = Path(workdir or tempfile.mkdtemp(prefix='pm-goal-test-matrix-'))
    rows, failures = [], []
    try:
        for row in MATRIX:
            try:
                rows.append(run_row(row, workdir))
            except MatrixFailure as error:
                failures.append(str(error))
                rows.append(dict(cut=row['cut'], status='fail', error=str(error)))
        for extra in (release_row, altered_reentry_row):
            try:
                rows.append(extra(workdir))
            except MatrixFailure as error:
                failures.append(str(error))
                rows.append(dict(cut=extra.__name__, status='fail', error=str(error)))
    finally:
        if own:
            shutil.rmtree(workdir, ignore_errors=True)
    return dict(qualification=QUALIFICATION, native=NATIVE_LINE, rows=rows, failures=failures,
                status='pass' if not failures else 'fail')


def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--child':
        return child(sys.argv[2:])
    p = argparse.ArgumentParser()
    p.add_argument('--output')
    a = p.parse_args()
    result = run_matrix()
    text = json.dumps(result, indent=2, sort_keys=True)
    if a.output:
        Path(a.output).write_text(text + '\n')
    print(json.dumps(dict(status=result['status'], rows=len(result['rows']), failures=result['failures'])))
    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
