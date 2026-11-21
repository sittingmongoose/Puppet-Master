#!/usr/bin/env python3
"""Red-first trials of the COVERED_LATER after-state rule (DG5 stock judge).

Rulings 1121112536-0b66 (3) and 1121115610-7650: a refused cut trial is
COVERED_LATER only when its after-state (store digest and the family hook's
owner in-memory digest) equals the intact trial's. Each trial below is one
complete call through the real bridge (`pm_goal_dg5_boundaries.invoke`, a
forked child per trial over a real TestOwnerStorage) and the stock collector
and judge (`pm_goal_guard_sweep.Collector`), with one declared row
`selftest/cl/<case>/first` whose cut reaches a later refusal
`selftest/cl/<case>/second`.

  write_then_later_refusal  the cut path commits a Storage cell, then refuses: CUT_LEFT_EFFECT
  no_write                  nothing between the two checks: COVERED_LATER, equal digests
  inmem_issuance            the cut path issues an owner original (no store write): CUT_LEFT_EFFECT
  no_hook_family            the same no-write call in a family with no owner hook: CANNOT_DECIDE
  clock_only                the cut path ticks the Storage clock only: COVERED_LATER, equal digests
  intact_nondeterministic   the intact trial records a fresh uuid4 each run: CANNOT_DECIDE

A trial passes only when the kill class is the expected one and, for every
later-refusal class, the record carries the judge's after-state comparison
(`covered_later_check`) with the expected verdict. The unfixed judge has
neither, so every trial fails on it (red first).

Usage: python3 scripts/pm_goal_dg5_covered_later_selftest.py --out RESULT.json [--work DIR]
"""
import argparse
import inspect
import json
from pathlib import Path
import sys
import tempfile
import uuid

import pm_goal_dg5_boundaries as bridge
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables
import pm_goal_test_owner_adapters as A
import pm_goal_test_storage as S

FAMILY = 'shared-adapter'   # a family whose owner hook walks the world it is given
NO_HOOK = 'selftest.no_hook_family'


class Refusal(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


def check(name, condition):
    """One routed predicate (the bridge's guard_wrapper contract, for a synthetic site)."""
    frame = inspect.currentframe().f_back
    path = Path(frame.f_code.co_filename)
    try:
        where = str(path.relative_to(bridge.ROOT))
    except ValueError:
        where = path.name
    if tables.decide(name, condition, site=(where, frame.f_lineno)) is not None:
        bridge.LAST_REFUSAL[0] = (name, name)
        raise Refusal(name)


class SyntheticWorld:
    """A TEST_ONLY Storage, a registry with its method recorder, and one issuing owner."""

    def __init__(self, work):
        self.work = Path(work)
        self.recorder = A.MethodRecorder()
        self.registry = A.OwnerRegistry(self.recorder)
        self.storage = S.TestOwnerStorage.create(self.work)
        self.owner = A.TestOwner(self.registry)
        self.notes = []


def action_for(case, world):
    first, second = f'selftest/cl/{case}/first', f'selftest/cl/{case}/second'

    def action():
        if case == 'intact_nondeterministic':
            world.notes.append(str(uuid.uuid4()))      # differs in every run, cut or not
        check(first, False)                            # the declared row: refuses on the intact path
        if case == 'write_then_later_refusal':
            world.storage.transact([dict(table='selftest_cells', key='k', expected=None, value=dict(n=1))])
        elif case == 'inmem_issuance':
            world.owner.issue(None, dict(n=1), kind='selftest')   # an owner original, in memory only
        elif case == 'clock_only':
            world.storage._tick()                      # the Storage clock moves; nothing else
        check(second, False)                           # the later refusal on the cut path
        return 'accepted'
    return action, first


EXPECTED = {
    'write_then_later_refusal': ('CUT_LEFT_EFFECT', FAMILY),
    'no_write': ('COVERED_LATER', FAMILY),
    'inmem_issuance': ('CUT_LEFT_EFFECT', FAMILY),
    'no_hook_family': ('CANNOT_DECIDE', NO_HOOK),
    'clock_only': ('COVERED_LATER', FAMILY),
    'intact_nondeterministic': ('CANNOT_DECIDE', FAMILY),
}


def run(work):
    saved = (tables.ACTIVE, tables.DISCOVERY, tables.COLLECTOR)
    tables.ACTIVE, tables.DISCOVERY = True, True
    collector = sweep.Collector(judge=True)
    tables.COLLECTOR = collector
    rows = []
    try:
        for case, (expected, family) in EXPECTED.items():
            world = SyntheticWorld(Path(work) / case)
            kind = 'no_write' if case == 'no_hook_family' else case
            action, target = action_for(kind, world)
            bridge.invoke('selftest/covered_later/' + case, family, action, world.work, world=world,
                          arguments=dict(receiver=world, args=(), kwargs={}), valid=False, target=target)
            record = collector.ledger[-1]
            check_record = record.get('covered_later_check') or {}
            state = {name: (check_record.get(name) or {}) for name in ('intact', 'restoration', 'cut')}
            ok = (record.get('outcome') == 'exact_expected' and record.get('kill') == expected
                  and check_record.get('verdict') == expected)
            if expected == 'COVERED_LATER':
                ok = ok and all(state[n].get('store_sha256') and state[n].get('owner_sha256') for n in state) \
                    and len({state[n]['store_sha256'] for n in state}) == 1 \
                    and len({state[n]['owner_sha256'] for n in state}) == 1
            rows.append(dict(case=case, family=family, expected_kill=expected, actual_kill=record.get('kill'),
                             outcome=record.get('outcome'), errors=record.get('errors'),
                             cut_errors=record.get('cut_errors'), restoration_errors=record.get('restoration_errors'),
                             covered_later_check=record.get('covered_later_check'),
                             after_state=record.get('after_state'), passed=bool(ok)))
    finally:
        tables.ACTIVE, tables.DISCOVERY, tables.COLLECTOR = saved
    return dict(status='pass' if all(r['passed'] for r in rows) and not collector.failures else 'fail',
                judge=dict(guard_sweep=sweep.__file__, boundaries=bridge.__file__),
                collector_failures=collector.failures, cases=rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--work', type=Path)
    args = parser.parse_args()
    work = args.work or Path(tempfile.mkdtemp(prefix='dg5-covered-later-'))
    report = run(work)
    args.out.write_text(json.dumps(report, indent=1, default=str) + '\n')
    for row in report['cases']:
        print(f"{'PASS' if row['passed'] else 'FAIL'} {row['case']}: expected {row['expected_kill']}, "
              f"got {row['actual_kill']}" + (f" ({(row['covered_later_check'] or {}).get('reason')})"
                                             if row['covered_later_check'] else ' (no after-state check)'))
    print(report['status'])
    return 0 if report['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
