#!/usr/bin/env python3
"""Red-first trials of the later-refusal rules (DG5 stock judge).

Rulings 1121112536-0b66 (3), 1121115610-7650 and addendum 1 (1121124828-43f4 (1)).
Each trial is one complete call through the real bridge
(`pm_goal_dg5_boundaries.invoke`, a forked child per trial over a real
TestOwnerStorage) and the stock collector and judge
(`pm_goal_guard_sweep.Collector`). Guards are site rows exactly as the owners'
are (`dg5/site/<this file>:<line>`, routed by `require(code, condition)` with a
literal code), so KILLED_CODE's own-guard check reads them as it reads an owner.

Same-code later refusals (the after-state rule):
  write_then_later_refusal  the cut path commits a Storage cell, then refuses: CANNOT_DECIDE (store and owner differ)
  no_write                  nothing between the two checks: COVERED_LATER, equal digests, not KILLED_CODE
  inmem_issuance            the cut path issues an owner original (no store write): CANNOT_DECIDE (owner differs)
  no_hook_family            the no-write call in a family with no owner hook: CANNOT_DECIDE
  clock_only                the cut path ticks the Storage clock only: COVERED_LATER, equal digests
  intact_nondeterministic   the intact trial records a fresh uuid4 each run: CANNOT_DECIDE
Different-code later refusals (KILLED_CODE):
  killed_code               own guard and code, exact, different cut code, restoration repeats: KILLED_CODE
  not_own_code              the declared row's guard code is not the code it refuses with: CANNOT_DECIDE
  restoration_not_repeating restoration refuses at the row with another code: CANNOT_DECIDE
  crash_cut                 the cut path crashes (Storage Crash): CANNOT_DECIDE, never KILLED_CODE or cover
  rebuilt_same_code         the guard's refusal is caught and a fresh refusal with the same code is raised
                            at another site (no chained original): the origin frame is not the row's guard,
                            so CANNOT_DECIDE (addendum 11), although the code-matched errors name the row
  rebuilt_chained           the same rebuild inside the handler (`raise ... from None`, as cf3_projector.py:329):
                            the chained original carries the code unchanged from the guard: KILLED_CODE

A trial passes only when the kill class is the expected one and the record
carries the judge's evidence for it (`killed_code_check`, and for same-code
cases `covered_later_check`). The unfixed judge has neither, so every trial
fails on it (red first).

Usage: python3 -m pm_goal_dg5_covered_later_selftest --out RESULT.json [--work DIR]
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


def require(code, condition, raise_code=None):
    """One routed guard at its caller's site (the bridge's guard_wrapper contract)."""
    frame = inspect.currentframe().f_back
    path = Path(frame.f_code.co_filename)
    try:
        where = str(path.relative_to(bridge.ROOT))
    except ValueError:
        where = path.name
    name = bridge.site_name(where, frame.f_lineno)
    if tables.decide(name, condition, site=(where, frame.f_lineno)) is not None:
        raised = raise_code or code
        bridge.LAST_REFUSAL[0] = (name, raised)
        raise Refusal(raised)


def site(marker):
    """The site row of the guard line carrying `# site:<marker>` in this file."""
    path = Path(__file__)
    for number, text in enumerate(path.read_text().splitlines(), 1):
        if text.rstrip().endswith('# site:' + marker):
            try:
                where = str(path.relative_to(bridge.ROOT))
            except ValueError:
                where = path.name
            return bridge.site_name(where, number)
    raise KeyError(marker)


class SyntheticWorld:
    """A TEST_ONLY Storage, a registry with its method recorder, and one issuing owner."""

    def __init__(self, work):
        self.work = Path(work)
        self.recorder = A.MethodRecorder()
        self.registry = A.OwnerRegistry(self.recorder)
        self.storage = S.TestOwnerStorage.create(self.work)
        self.owner = A.TestOwner(self.registry)
        self.notes = []


DIFFERENT = ('killed_code', 'not_own_code', 'restoration_not_repeating', 'crash_cut', 'rebuilt_same_code',
             'rebuilt_chained')


def action_for(case, world):
    runs = world.work.parent / (world.work.name + '.runs')   # outside the store: counts the trial processes

    def action():
        if case == 'intact_nondeterministic':
            world.notes.append(str(uuid.uuid4()))      # differs in every run, cut or not
        if case == 'not_own_code':
            require('selftest/cl/literal', False, raise_code='selftest/cl/raised')  # site:not_own
        elif case == 'restoration_not_repeating':
            with runs.open('a') as handle:
                handle.write('x')
            again = runs.stat().st_size >= 3          # the third trial process is the restoration
            require('selftest/cl/flaky', False, raise_code='selftest/cl/flaky-again' if again else None)  # site:flaky
        elif case == 'rebuilt_same_code':
            failed = False
            try:
                require('selftest/cl/rebuilt', False)  # site:rebuilt
            except Refusal:
                failed = True
            if failed:
                raise Refusal('selftest/cl/rebuilt')   # rebuilt fresh at another site, same code
        elif case == 'rebuilt_chained':
            try:
                require('selftest/cl/chained', False)  # site:chained
            except Refusal as error:
                raise Refusal(error.code) from None    # rebuilt in the handler (the original stays on __context__)
        elif case in DIFFERENT:
            require('selftest/cl/first', False)        # site:first
        else:
            require('selftest/cl/shared', False)       # site:shared_first
        if case == 'write_then_later_refusal':
            world.storage.transact([dict(table='selftest_cells', key='k', expected=None, value=dict(n=1))])
        elif case == 'inmem_issuance':
            world.owner.issue(None, dict(n=1), kind='selftest')   # an owner original, in memory only
        elif case == 'clock_only':
            world.storage._tick()                      # the Storage clock moves; nothing else
        elif case == 'crash_cut':
            raise S.Crash('selftest_after_cut')
        if case in DIFFERENT:
            require('selftest/cl/second', False)       # site:second
        else:
            require('selftest/cl/shared', False)       # site:shared_second
        return 'accepted'
    target = site({'not_own_code': 'not_own', 'restoration_not_repeating': 'flaky', 'rebuilt_same_code': 'rebuilt',
                   'rebuilt_chained': 'chained'}.get(
        case, 'first' if case in DIFFERENT else 'shared_first'))
    return action, target


EXPECTED = {
    'write_then_later_refusal': ('CANNOT_DECIDE', FAMILY),
    'no_write': ('COVERED_LATER', FAMILY),
    'inmem_issuance': ('CANNOT_DECIDE', FAMILY),
    'no_hook_family': ('CANNOT_DECIDE', NO_HOOK),
    'clock_only': ('COVERED_LATER', FAMILY),
    'intact_nondeterministic': ('CANNOT_DECIDE', FAMILY),
    'killed_code': ('KILLED_CODE', FAMILY),
    'not_own_code': ('CANNOT_DECIDE', FAMILY),
    'restoration_not_repeating': ('CANNOT_DECIDE', FAMILY),
    'crash_cut': ('CANNOT_DECIDE', FAMILY),
    'rebuilt_same_code': ('CANNOT_DECIDE', FAMILY),
    'rebuilt_chained': ('KILLED_CODE', FAMILY),
}
# Which judge evidence each case must carry (what makes the verdict, not only its name).
EVIDENCE = {
    'write_then_later_refusal': ('after', ['store_sha256', 'owner_sha256']),
    'inmem_issuance': ('after', ['owner_sha256']),
    'no_hook_family': ('after', None),
    'intact_nondeterministic': ('after', None),
    'killed_code': ('code', 'KILLED_CODE'),
    'not_own_code': ('code', 'not the row guard'),
    'restoration_not_repeating': ('code', 'restoration did not repeat'),
    'crash_cut': ('code', 'crash'),
    'rebuilt_same_code': ('code', 'origin not at the row guard'),
    'rebuilt_chained': ('code', 'KILLED_CODE'),
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
            after = record.get('covered_later_check') or {}
            code = record.get('killed_code_check') or {}
            state = {name: (after.get(name) or {}) for name in ('intact', 'restoration', 'cut')}
            ok = record.get('outcome') == 'exact_expected' and record.get('kill') == expected and bool(code)
            kind, want = EVIDENCE.get(case, ('after', None))
            if expected == 'COVERED_LATER':
                ok = ok and after.get('verdict') == 'COVERED_LATER' and code.get('verdict') is None \
                    and all(state[n].get('store_sha256') and state[n].get('owner_sha256') for n in state) \
                    and len({state[n]['store_sha256'] for n in state}) == 1 \
                    and len({state[n]['owner_sha256'] for n in state}) == 1
            elif kind == 'after':
                ok = ok and after.get('verdict') == expected and (want is None or after.get('effect') == want)
            elif want == 'KILLED_CODE':
                ok = ok and code.get('verdict') == 'KILLED_CODE' and (code.get('own_guard') or {}).get('own') is True \
                    and (code.get('own_guard') or {}).get('verified_by') == 'origin frame at the row guard'
            else:
                ok = ok and code.get('verdict') is None and want in (code.get('reason') or '') + \
                    (record.get('cannot_decide_reason') or '')
            check_record = after or code
            rows.append(dict(case=case, family=family, expected_kill=expected, actual_kill=record.get('kill'),
                             outcome=record.get('outcome'), errors=record.get('errors'),
                             cut_errors=record.get('cut_errors'), restoration_errors=record.get('restoration_errors'),
                             covered_later_check=record.get('covered_later_check'),
                             killed_code_check=record.get('killed_code_check'),
                             cannot_decide_reason=record.get('cannot_decide_reason'),
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
        why = row.get('cannot_decide_reason') or (row['covered_later_check'] or {}).get('reason') or \
            (row.get('killed_code_check') or {}).get('verdict')
        print(f"{'PASS' if row['passed'] else 'FAIL'} {row['case']}: expected {row['expected_kill']}, "
              f"got {row['actual_kill']}" + (f" ({why})" if (row['covered_later_check'] or row.get('killed_code_check'))
                                             else ' (no judge evidence)'))
    print(report['status'])
    return 0 if report['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
