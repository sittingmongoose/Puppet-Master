#!/usr/bin/env python3
"""DG-CB crash matrix for the goal.cancelled M7-M9 migration transaction (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Each row creates a pre-enrollment Goal in one process (``setup``), runs the
original capture and atomic commit (and, for the withdrawal rows, the
withdrawal) in a second process whose test-owner Storage dies by
``os._exit(73)`` at one migration cut, reopens the Storage directory in a
third fresh process and reads the bytes back, then re-enters twice in fresh
processes from durable state and the caller's own retained request only.

* ``after_exclusion`` / ``before_migration_tx``: the exclusion is durable, no
  result, manifest part or destination member exists. Re-entry: ``recover``
  refuses ``not_committed`` and releases the stale exclusion (it never retries
  a birth), then a fresh capture and commit under the same migration identity
  enrolls once.
* ``after_migration_tx``: the whole write set is durable (lost
  acknowledgement). Re-entry: ``recover`` returns the first immutable result
  and ``commit`` with the original request replays it; no second enrollment.
* ``before_withdrawal_tx`` / ``after_withdrawal_tx``: the withdrawal record and
  SP-423 cutoff are absent or both present; re-entry withdraws once or replays.

A second re-entry must leave the Storage manifest generation unchanged.
Native redb/seglog fsync and process restart stay NOT_RUN.
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

HERE = Path(__file__).resolve().parent
ROWS = (
    dict(cut=None, exit=0, result=True, destinations=True, exclusion=False, withdrawal=False),
    dict(cut='after_exclusion', exit=73, result=False, destinations=False, exclusion=True, withdrawal=False),
    dict(cut='before_migration_tx', exit=73, result=False, destinations=False, exclusion=True, withdrawal=False),
    dict(cut='after_migration_tx', exit=73, result=True, destinations=True, exclusion=False, withdrawal=False),
    dict(cut='before_withdrawal_tx', exit=73, result=True, destinations=True, exclusion=False, withdrawal=False),
    dict(cut='after_withdrawal_tx', exit=73, result=True, destinations=True, exclusion=False, withdrawal=True),
)


def _modules():
    import pm_goal_dg_cb_owners as B
    import pm_goal_dg_cb_migration as M
    return B, M


def child_setup(directory, variant):
    B, M = _modules()
    directory = Path(directory)
    w = M.migration_world(directory / 'storage')
    scope = B.legacy_goal(w, revisions=2)
    if variant == 'pending':
        w.host_stop.manual(scope, 'stop')
        w.goal.reserve_pending(scope, w.host_stop.record(scope)['user_stop_epoch'])
    sel = M.selector(scope)
    (directory / 'info.json').write_text(json.dumps(dict(selector=sel, variant=variant)))
    return 0


def child_run(directory, cut):
    import pm_goal_test_storage as S
    B, M = _modules()
    directory = Path(directory)
    info = json.loads((directory / 'info.json').read_text())
    w = M.open_world(directory / 'storage', migration_cut=cut or None, migration_cut_mode='exit')
    request = w.coordinator.capture(info['selector'])
    (directory / 'request.json').write_text(json.dumps(request))
    result = w.coordinator.commit(request)
    if cut in ('before_withdrawal_tx', 'after_withdrawal_tx'):
        scope = w.coordinator.scope_of(info['selector'])
        wreq = dict(scope=info['selector']['scope'], migration_id=info['selector']['migration_id'], withdrawal_id='TEST_ONLY:withdrawal:crash',
                    expected_original_result=w.coordinator.result_selection(scope, info['selector']['migration_id']),
                    expected_writer_domain=result['writer_domain'])
        (directory / 'withdrawal.json').write_text(json.dumps(wreq))
        w.coordinator.withdraw(wreq)
    return 0


def observe(w, info):
    B, M = _modules()
    sel = info['selector']
    scope = w.coordinator.scope_of(sel)
    mid = sel['migration_id']
    result = w.value(M.RESULT, w.coordinator.result_key(scope, mid))
    keys = w.binding.keys(scope, 0)
    destinations = {name: w.cell(table, keys[name]) is not None for name, table in
                    (('revision', w.binding.REVISION), ('origin', w.binding.ORIGIN), ('control', w.binding.CONTROL))}
    parts = w.coordinator.manifest_parts_of(scope, mid)
    withdrawal = w.value(M.WITHDRAWAL, w.coordinator.withdrawal_key(scope, 'TEST_ONLY:withdrawal:crash'))
    return dict(result=result, result_sha256=None if result is None else B.row_sha(result), destinations=destinations,
                parts=len(parts), exclusion=w.coordinator.exclusion(scope) is not None, withdrawal=withdrawal,
                cutoff=bool(w.storage.cells.get(B.CUTOFF)), head=w.cell(w.binding.HEAD, w.binding.head_key()) is not None,
                goal_control=w.goal.control(scope)['value']['record']['schema_id'], manifest_generation=w.storage.manifest_generation, commit_generation=w.storage.commit_generation,
                stop=w.host_stop.record(scope))


def child_read(directory):
    B, M = _modules()
    directory = Path(directory)
    info = json.loads((directory / 'info.json').read_text())
    w = M.open_world(directory / 'storage')
    print(json.dumps(observe(w, info), sort_keys=True, default=str))
    return 0


def child_reenter(directory):
    B, M = _modules()
    directory = Path(directory)
    info = json.loads((directory / 'info.json').read_text())
    w = M.open_world(directory / 'storage')
    sel = info['selector']
    notes = []
    if (directory / 'withdrawal.json').exists():
        wreq = json.loads((directory / 'withdrawal.json').read_text())
        w.coordinator.withdraw(wreq)
        notes.append('withdraw')
    else:
        try:
            result = w.coordinator.recover(sel)
            notes.append('recovered:' + result['disposition'])
            request = json.loads((directory / 'request.json').read_text())
            again = w.coordinator.commit(request)
            notes.append('replayed' if again == result else 'replay_mismatch')
        except M.Refusal as error:
            if getattr(error, 'code', None) != 'M/recover/not_committed':
                raise
            notes.append('not_committed')
            request = w.coordinator.capture(sel)
            (directory / 'request.json').write_text(json.dumps(request))
            w.coordinator.commit(request)
            notes.append('enrolled_once')
    out = observe(w, info)
    out['notes'] = notes
    print(json.dumps(out, sort_keys=True, default=str))
    return 0


def run_child(*args):
    return subprocess.run([sys.executable, str(HERE / 'pm_goal_dg_cb_crash.py')] + [str(a) for a in args], capture_output=True, text=True,
                          cwd=str(HERE), env=dict(os.environ, PYTHONPATH=str(HERE)))


def matrix(work=None, variant='pending'):
    root = Path(work or tempfile.mkdtemp(prefix='pm-dg-cb-crash-'))
    rows = []
    try:
        for expected in ROWS:
            cut = expected['cut']
            directory = root / (cut or 'control')
            directory.mkdir(parents=True)
            row = dict(cut=cut, expected_exit=expected['exit'])
            try:
                setup = run_child('setup', directory, variant)
                assert setup.returncode == 0, setup.stderr[-800:]
                proc = run_child('run', directory, cut or '')
                row['exit'] = proc.returncode
                assert proc.returncode == expected['exit'], proc.stderr[-800:]
                read = json.loads(run_child('read', directory).stdout)
                row['read'] = {k: read[k] for k in ('parts', 'exclusion', 'cutoff', 'head', 'goal_control', 'destinations')}
                row['read']['result'] = read['result'] is not None
                row['read']['withdrawal'] = read['withdrawal'] is not None
                assert (read['result'] is not None) == expected['result'], 'result presence'
                assert all(read['destinations'].values()) == expected['destinations'] and (any(read['destinations'].values()) == expected['destinations']), \
                    'all destination members present or all absent'
                assert (read['parts'] > 0) == expected['result'], 'manifest parts with the result only'
                assert read['exclusion'] == expected['exclusion'], 'exclusion state'
                assert (read['withdrawal'] is not None) == expected['withdrawal'] == read['cutoff'], 'withdrawal and cutoff together'
                assert read['goal_control'] == ('pm.goal.body_control.v2' if expected['result'] else 'pm.goal.body_control.v1'), 'control edition'
                first = json.loads(run_child('reenter', directory).stdout)
                second = json.loads(run_child('reenter', directory).stdout)
                row['reentry'] = dict(notes=first['notes'], second=second['notes'])
                assert first['result'] is not None and first['result']['disposition'] == 'enrolled', 'enrolled after re-entry'
                assert all(first['destinations'].values()) and first['exclusion'] is False, 'complete enrollment, exclusion released'
                if read['result'] is not None:
                    assert first['result_sha256'] == read['result_sha256'], 'the first immutable result, never a second birth'
                if expected['cut'] in ('after_exclusion', 'before_migration_tx'):
                    assert first['notes'] == ['not_committed', 'enrolled_once'], first['notes']
                elif expected['cut'] in ('before_withdrawal_tx', 'after_withdrawal_tx'):
                    assert first['withdrawal'] is not None and first['cutoff'] is True, 'withdrawal recorded once'
                    if read['withdrawal'] is not None:
                        assert first['withdrawal'] == read['withdrawal'], 'withdrawal replay returns the original'
                else:
                    assert first['notes'] == ['recovered:enrolled', 'replayed'], first['notes']
                assert first['stop'] == read['stop'], 'Stop never rolled back or relatched'
                assert second['manifest_generation'] == first['manifest_generation'], 'second re-entry changed state'
                assert second['commit_generation'] == first['commit_generation'], 'second re-entry changed state'
                assert second['result_sha256'] == first['result_sha256'] and second['withdrawal'] == first['withdrawal']
                row['status'] = 'pass'
            except (AssertionError, json.JSONDecodeError, KeyError, TypeError) as error:
                row['status'] = 'fail'
                row['error'] = repr(error)[:800]
            rows.append(row)
    finally:
        if work is None:
            shutil.rmtree(root, ignore_errors=True)
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['setup', 'run', 'read', 'reenter', 'matrix'])
    parser.add_argument('directory', nargs='?')
    parser.add_argument('arg', nargs='?', default='')
    args = parser.parse_args()
    if args.mode == 'setup':
        return child_setup(args.directory, args.arg or 'pending')
    if args.mode == 'run':
        return child_run(args.directory, args.arg or None)
    if args.mode == 'read':
        return child_read(args.directory)
    if args.mode == 'reenter':
        return child_reenter(args.directory)
    rows = matrix()
    print(json.dumps(rows, indent=1, default=str))
    return 0 if all(r['status'] == 'pass' for r in rows) else 1


if __name__ == '__main__':
    sys.exit(main())
