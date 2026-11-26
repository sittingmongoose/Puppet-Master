#!/usr/bin/env python3
"""Red-first product-finding reproductions for the DG5 owner-fix batch (TEST_ONLY)."""
from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path
import shutil
import sys
import tempfile

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import pm_goal_test_storage as S
import pm_goal_test_reopen as R
import pm_goal_dg_u_owners as U
import pm_goal_dg_cb_migration as M
import pm_goal_dg_cb_c5_cases as C5


def code_of(error):
    return getattr(error, 'code', None) or getattr(error, 'reason', None) or (
        error.klass + ':' + error.code if isinstance(error, S.FrameError) else type(error).__name__)


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def pf1(root):
    """PF-1: the BC13 :440 cut must not become a durable already_appended acceptance."""
    storage = S.TestOwnerStorage.create(root / 'pf1-storage')
    spec = R.probe_spec('pf1')
    spec['candidates'][0]['event_id'] = 'TEST_ONLY:long:' + 'a' * 5000
    original_require = S.require
    skipped = []

    def cut_require(code, condition):
        frame = sys._getframe(1)
        if code == 'frame/header_cap' and not condition:
            skipped.append(frame.f_lineno)
            return
        original_require(code, condition)

    S.require = cut_require
    try:
        handle = storage.reserve(spec['operation_id'], spec['request'])
        try:
            storage.append(handle, copy.deepcopy(spec['candidates']))
            first = dict(outcome='accepted', code=None)
        except BaseException as error:  # noqa: BLE001
            first = dict(outcome='refused', code=code_of(error), kind=type(error).__name__)
        before = sum(p.stat().st_size for p in (root / 'pf1-storage').rglob('*') if p.is_file())
        try:
            retry = storage.append(handle, copy.deepcopy(spec['candidates']))
            second = dict(outcome='accepted', status=retry.get('status'), code=None)
        except BaseException as error:  # noqa: BLE001
            second = dict(outcome='refused', status=None, code=code_of(error), kind=type(error).__name__)
    finally:
        S.require = original_require
    check(first.get('kind') == 'FrameError' or first['code'] == 'append/readback',
          'the over-cap append did not refuse at frame readback: ' + str(first))
    check(second.get('kind') == 'FrameError' or second['code'] == 'append/readback',
          'the retry did not repeat frame readback refusal: ' + str(second))
    check(first['outcome'] == 'refused', 'the over-cap append accepted')
    check(second.get('status') != 'already_appended',
          'the failed append became already_appended without a valid durable group')
    reopened = S.TestOwnerStorage.open(root / 'pf1-storage')
    state = reopened.reservation_state(spec['operation_id'])
    check(state is None or state['state'] == 'reserved', 'the failed append is durable as appended')
    return dict(first=first, second=second, bytes_after_first=before,
                reopened_state=None if state is None else state['state'], cut_sites=skipped)


def pf2(root):
    """PF-2: a pre-transfer goal.updated commit must stay fenced after reopen."""
    work = root / 'pf2-world'
    w = U.World(work)
    goal = U.birth_goal(w)
    request = U.direct_request(w, goal, 'updated objective')
    adm, _ = w.command.admit_and_capture(request)
    w.command.reserve(adm)
    w.body.advance_owner_epoch()
    try:
        w.command.commit(adm)
        before = 'accepted'
    except BaseException as error:  # noqa: BLE001
        before = code_of(error)
    check(before == 'dgu/body/commit/owner_epoch', 'in-process epoch fence did not refuse: ' + before)
    reopened = U.World(work, create=False)
    adm2, _ = reopened.command.admit_and_capture(request)
    try:
        reopened.command.commit(adm2)
        after = 'accepted'
    except BaseException as error:  # noqa: BLE001
        after = code_of(error)
    check(after == 'dgu/body/commit/owner_epoch', 'stale pre-transfer commit accepted after reopen: ' + after)
    check(reopened.body.owner_epoch == 2, 'reopen did not restore the advanced owner epoch')
    return dict(before=before, after=after, reopened_epoch=reopened.body.owner_epoch)


def pf3(root):
    """PF-3: an append retry must compare the candidate events before already_appended."""
    storage = S.TestOwnerStorage.create(root / 'pf3-storage')
    spec = R.probe_spec('pf3')
    handle = storage.reserve(spec['operation_id'], spec['request'])
    first = storage.append(handle, copy.deepcopy(spec['candidates']))
    check(first['status'] == 'appended', 'setup append did not append')
    foreign = copy.deepcopy(spec['candidates'])
    foreign[0]['actor_ref'] = 'TEST_ONLY:other-actor'
    foreign[0]['payload']['actor_ref'] = 'TEST_ONLY:other-actor'
    try:
        storage.append(handle, foreign)
        retry = 'accepted'
    except BaseException as error:  # noqa: BLE001
        retry = code_of(error)
    check(retry != 'accepted' and retry != 'already_appended',
          'foreign event accepted as already_appended')
    same = storage.append(handle, copy.deepcopy(spec['candidates']))
    check(same['status'] == 'already_appended', 'exact retry no longer reports already_appended')
    return dict(foreign_retry=retry, exact_retry=same['status'])


class _MigrationSuite:
    def __init__(self, work):
        self.work = work
        self.n = 0

    def world(self, faults=None, **kw):
        self.n += 1
        return M.migration_world(self.work / ('w%05d' % self.n), **kw)


def pf5(root):
    """PF-5: a pre-restart goal.cancelled SIR acceptance must stay fenced after reopen."""
    suite = _MigrationSuite(root / 'pf5')
    w, scope = C5.new(suite, revisions=2)
    C5.run(w, scope)
    route, request = C5.cancel_request(w, scope)
    route.dispatch(request)
    w.sir.restart()
    try:
        route.capture_source()
        before = 'accepted'
    except BaseException as error:  # noqa: BLE001
        before = code_of(error)
    check(before == 'C1/capture_source/sir_epoch', 'in-process SIR epoch fence did not refuse: ' + before)
    reopened = M.open_world(suite.work / 'w00001')
    route2, _ = C5.cancel_request(reopened, scope)
    route2.dispatch(request)
    try:
        route2.capture_source()
        after = 'accepted'
    except BaseException as error:  # noqa: BLE001
        after = code_of(error)
    check(after == 'C1/capture_source/sir_epoch', 'stale pre-restart acceptance captured after reopen: ' + after)
    check(reopened.sir.owner_epoch == 2, 'reopen did not restore the advanced SIR owner epoch')
    return dict(before=before, after=after, reopened_epoch=reopened.sir.owner_epoch)


CASES = {'PF-1': pf1, 'PF-2': pf2, 'PF-3': pf3, 'PF-5': pf5}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('cases', nargs='*', choices=sorted(CASES))
    parser.add_argument('--work')
    parser.add_argument('--output')
    args = parser.parse_args()
    root = Path(tempfile.mkdtemp(prefix='pm-goal-pf-repro-', dir=args.work or None))
    results = {}
    try:
        for name in args.cases or sorted(CASES):
            try:
                detail = CASES[name](root / name.lower())
                results[name] = dict(status='pass', detail=detail)
            except BaseException as error:  # noqa: BLE001
                results[name] = dict(status='fail', error='%s: %s' % (type(error).__name__, error))
    finally:
        shutil.rmtree(root, ignore_errors=True)
    status = 'pass' if all(r['status'] == 'pass' for r in results.values()) else 'fail'
    out = dict(qualification='TEST_ONLY', status=status, cases=results)
    if args.output:
        Path(args.output).write_text(json.dumps(out, indent=1, sort_keys=True, ensure_ascii=False) + '\n')
    print(json.dumps(out, indent=1, sort_keys=True, ensure_ascii=False))
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
