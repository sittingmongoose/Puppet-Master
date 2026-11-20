#!/usr/bin/env python3
"""DG-CA crash matrix for the goal.cancelled original Event protocol (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Each row runs the complete C1 original path in a real child process whose
test-owner Storage carries one ``FaultPlan(cut, mode='exit')``; the process
dies by ``os._exit(73)`` at that cut inside the actual reserve / member
frames / commit frame / first receipt / terminal publication of the
cancellation Event. A fresh process then reopens the Storage directory and
reads back the bytes (reservation, frames, private first custody, terminal
cell and the route's own stored progress). Two further fresh processes
re-enter from the durable state only: the frozen ProducerInput is the one in
the stored progress record, the append request is recomputed from it, and
re-entry must converge to exactly one goal.cancelled Event, one unchanged
first receipt and unchanged stored frames, the second re-entry changing
nothing. An append without first custody is never reported as no-append.
A terminal cut leaves the terminal either absent (receipted, unpublished) or
published and immutable. Native redb/seglog fsync and restart stay NOT_RUN.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True

import pm_goal_test_storage as S
import pm_goal_test_reopen as RO

HERE = Path(__file__).resolve().parent
EXPECTED = {row['cut']: row for row in RO.MATRIX}


def _row_sha(value):
    return S.sha256(S.canonical(value, 'dg_ca/crash'))


def child_route(directory, cut):
    import pm_goal_dg_ca_owners as O
    import pm_goal_dg_ca_c1 as C1
    directory = Path(directory)
    world = O.World(directory / 'storage', faults=S.FaultPlan(cut=cut, mode='exit') if cut else None)
    route = C1.NoAssociationCancel(world, state='active')
    route.dispatch(route.user_request())
    for step in ('capture_source', 'latch_and_reserve', 'commit_receipt', 'settle_owner', 'freeze_event'):
        getattr(route, step)()
    (directory / 'route.json').write_text(json.dumps(dict(
        operation_id=route.operation_id, head=['goal_cancel_progress', route.key('goal_cancel_progress') + ':head'],
        progress_prefix=route.key('goal_cancel_progress') + ':epoch:', terminal=['goal_cancel_terminal_audit',
                                                                            route.key('goal_cancel_terminal_audit')])))
    for step in ('append_original', 'publish_control', 'terminal'):
        getattr(route, step)()
    return 0


def _stored_producer(storage, info):
    head = storage.cell(*info['head'])['value']['record']
    progress = storage.cell('goal_cancel_progress', info['progress_prefix'] + str(head['progress_epoch']))['value']['record']
    for epoch in range(head['progress_epoch'], -1, -1):
        record = storage.cell('goal_cancel_progress', info['progress_prefix'] + str(epoch))['value']['record']
        if record.get('producer_input') is not None:
            return record['producer_input'], head, progress
    raise SystemExit('no frozen producer in stored progress')


def child_read(directory):
    directory = Path(directory)
    info = json.loads((directory / 'route.json').read_text())
    storage = S.TestOwnerStorage.open(directory / 'storage')
    producer, head, progress = _stored_producer(storage, info)
    op = info['operation_id']
    r = storage.reservation_state(op)
    ids = [] if r is None else list(r['event_ids'])
    out = dict(classification=RO.classify(storage, op), reservation=None if r is None else r['state'],
               recovered=[n['kind'] for n in getattr(storage, 'recovered', [])],
               events={e: dict(frame_sha256=S.sha256(storage.read_frame(e)), sequence_id=storage.read_event(e)['sequence_id'],
                               producer_match=S.producer25(storage.read_event(e)) == producer) for e in ids},
               all_events=len(storage.events), custody={e: storage.first_custody(e) for e in ids if storage.first_custody(e)},
               terminal=storage.cell(*info['terminal']), progress_phase=progress['phase'],
               manifest_generation=storage.manifest_generation, commit_generation=storage.commit_generation)
    print(json.dumps(out, sort_keys=True, default=str))
    return 0


def child_reenter(directory):
    directory = Path(directory)
    info = json.loads((directory / 'route.json').read_text())
    storage = S.TestOwnerStorage.open(directory / 'storage')
    producer, head, progress = _stored_producer(storage, info)
    op = info['operation_id']
    request = dict(kind='TEST_ONLY:goal.cancelled.append', operation_id=op, producer_sha256=_row_sha(producer))
    if storage.reservation_state(op) is None:
        handle = storage.reserve(op, request)
    else:
        handle, _ = storage.resume(op, request)
    terminal = storage.cell(*info['terminal'])
    if terminal is None:
        storage.append(handle, [producer], durability_class='barrier')
        storage.issue_first_receipt(handle)
    return child_read(directory)


def run_child(*args):
    proc = subprocess.run([sys.executable, str(HERE / 'pm_goal_dg_ca_crash.py')] + [str(a) for a in args],
                          capture_output=True, text=True, cwd=str(HERE), env=dict(os.environ, PYTHONPATH=str(HERE)))
    return proc


def matrix(work=None):
    """Run every cut; returns one row per cut with pass/fail and observations."""
    root = Path(work or tempfile.mkdtemp(prefix='pm-dg-ca-crash-'))
    rows = []
    try:
        for expected in RO.MATRIX:
            cut = expected['cut']
            directory = root / (cut or 'control')
            directory.mkdir(parents=True)
            proc = run_child('route', directory, cut or '')
            row = dict(cut=cut, exit=proc.returncode, expected_exit=expected['exit'])
            try:
                assert proc.returncode == expected['exit'], proc.stderr[-800:]
                read = json.loads(run_child('read', directory).stdout)
                row['read'] = dict(classification=read['classification'], events=len(read['events']), custody=len(read['custody']),
                                   terminal=read['terminal'] is not None, recovered=read['recovered'], phase=read['progress_phase'])
                assert read['classification'] == expected['classification'], read['classification']
                assert len(read['events']) == expected['events'] and len(read['custody']) == expected['custody']
                assert (read['terminal'] is not None) == expected['terminal']
                for note in expected['notes']:
                    assert note in read['recovered'], (note, read['recovered'])
                if expected['events']:
                    assert all(e['producer_match'] for e in read['events'].values())
                first = json.loads(run_child('reenter', directory).stdout)
                second = json.loads(run_child('reenter', directory).stdout)
                row['reentry'] = dict(classification=first['classification'], events=len(first['events']), all_events=first['all_events'],
                                      custody=len(first['custody']), terminal=first['terminal'] is not None)
                assert len(first['events']) == 1 and first['all_events'] == 1 and len(first['custody']) == 1
                assert all(e['producer_match'] for e in first['events'].values())
                for event_id, event in read['events'].items():
                    assert first['events'][event_id]['frame_sha256'] == event['frame_sha256']
                for event_id, custody in read['custody'].items():
                    assert first['custody'][event_id] == custody
                if read['terminal'] is not None:
                    assert first['terminal'] == read['terminal']
                assert second['manifest_generation'] == first['manifest_generation'], 'second re-entry changed state'
                assert second['commit_generation'] == first['commit_generation'], 'second re-entry changed state'
                assert second['events'] == first['events'] and second['custody'] == first['custody']
                row['status'] = 'pass'
            except (AssertionError, json.JSONDecodeError, KeyError) as error:
                row['status'] = 'fail'
                row['error'] = repr(error)[:600]
            rows.append(row)
    finally:
        if work is None:
            shutil.rmtree(root, ignore_errors=True)
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['route', 'read', 'reenter', 'matrix'])
    parser.add_argument('directory', nargs='?')
    parser.add_argument('cut', nargs='?', default='')
    args = parser.parse_args()
    if args.mode == 'route':
        return child_route(args.directory, args.cut or None)
    if args.mode == 'read':
        return child_read(args.directory)
    if args.mode == 'reenter':
        return child_reenter(args.directory)
    rows = matrix()
    print(json.dumps(rows, indent=1, default=str))
    return 0 if all(r['status'] == 'pass' for r in rows) else 1


if __name__ == '__main__':
    sys.exit(main())
