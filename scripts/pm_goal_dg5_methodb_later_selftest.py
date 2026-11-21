#!/usr/bin/env python3
"""Red-first trials of the forked Method B judge's later-refusal verdict (`ForkedExample.later_refusal`).

Rulings 1121112536-0b66 (3), 1121115610-7650 and addendum 1 (1121124828-43f4 (1)).
`prove()` calls `later_refusal(record, before, disabled, restored)` whenever the
source stock judge records COVERED_LATER (any later refusal). Each trial below
gives it the trial results and after-states a real route produces, and checks
the verdict and its evidence:

  killed_code               own code (the route's declared refusal), exact, different cut code,
                            restoration repeats: KILLED_CODE
  not_own_code              intact refusal is not the route's declared code: CANNOT_DECIDE
  restoration_not_repeating restoration differs from the defect trial: CANNOT_DECIDE
  same_code_equal           same cut code, equal after-states: COVERED_LATER
  same_code_store_effect    same cut code, the cut left a different store: CANNOT_DECIDE
  same_code_owner_effect    same cut code, the cut left a different owner state: CANNOT_DECIDE
  same_code_nondeterministic same cut code, the two intact runs differ: CANNOT_DECIDE
  same_code_no_owner_digest same cut code, no owner digest (hook reason): CANNOT_DECIDE
  rebuilt_elsewhere         as killed_code, but the intact refusal's recorded origin is another site
                            (a same-code refusal rebuilt there; addendum 11): CANNOT_DECIDE
  no_origin                 as killed_code, with no recorded origin: CANNOT_DECIDE (fails closed)
Through the re-run (`prove()`'s path: `rerun=lambda: self.owner_states(...)`, with `fork_trial` stubbed to
return each repeated trial's result and after-state; review R2):
  rerun_equal               same code; the three repeats return the judged results and equal states: COVERED_LATER,
                            the cut repeat ran with exactly the row cut and every repeat walked the owners
  rerun_cut_effect          same code; the cut repeat's owner state differs: CANNOT_DECIDE (effect owner_sha256),
                            which also pins the defect, cut, restoration order of the states
  rerun_result_differs      same code; the cut repeat returns another result than when judged: CANNOT_DECIDE,
                            'a repeated trial returned another result' (fails when owner_states drops that check)

The unfixed judge has no such verdict (prove() accepted any COVERED_LATER), so
every trial fails on it. Real-input before/after: REPORT.md.

Usage: python3 scripts/pm_goal_dg5_methodb_later_selftest.py --out RESULT.json
"""
import argparse
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import pm_goal_dg5_methodb_judge as J  # noqa: E402

ROW = 'dg5/tuple/preserved/intent/schema'
CODE = 'tuple/preserved/intent/schema/'
SITE = ['scripts/pm_goal_dg_r_readers.py', 100]
AT_SITE = dict(site=SITE, frames=[SITE + ['check', False], ['scripts/pm_goal_dg_r_world.py', 176, 'validate', True]])
ELSEWHERE = dict(site=['scripts/pm_goal_dg_r_readers.py', 200],
                 frames=[SITE + ['check', False], ['scripts/pm_goal_dg_r_readers.py', 200, 'rebuild', False]])


def state(store='s0', owner='o0', reason=None):
    return dict(store_sha256=store, owner_sha256=owner, owner_hook=J.FAMILY, owner_reason=reason)


def trial(refusal):
    return dict(errors=['dg5/' + refusal.split('/schema/')[0] + '/schema' if '/schema/' in refusal else
                        'dg5/' + refusal], refusal=refusal, detail='d', observations=[])


CASES = {
    'killed_code': (CODE, 'select/unissued_value', CODE, CODE, (state(), state(), state()), 'KILLED_CODE'),
    'not_own_code': (CODE, 'select/unissued_value', CODE, 'other/declared/schema/', (state(),) * 3, 'CANNOT_DECIDE'),
    'restoration_not_repeating': (CODE, 'select/unissued_value', 'tuple/preserved/intent/schema/x', CODE,
                                  (state(),) * 3, 'CANNOT_DECIDE'),
    'same_code_equal': (CODE, CODE, CODE, CODE, (state(), state(), state()), 'COVERED_LATER'),
    'same_code_store_effect': (CODE, CODE, CODE, CODE, (state(), state(store='s1'), state()), 'CANNOT_DECIDE'),
    'same_code_owner_effect': (CODE, CODE, CODE, CODE, (state(), state(owner='o1'), state()), 'CANNOT_DECIDE'),
    'same_code_nondeterministic': (CODE, CODE, CODE, CODE, (state(), state(), state(owner='o2')), 'CANNOT_DECIDE'),
    'same_code_no_owner_digest': (CODE, CODE, CODE, CODE,
                                  (state(owner=None, reason='unclassified value x'), state(), state()), 'CANNOT_DECIDE'),
    'rebuilt_elsewhere': (CODE, 'select/unissued_value', CODE, CODE, (state(),) * 3, 'CANNOT_DECIDE'),
    'no_origin': (CODE, 'select/unissued_value', CODE, CODE, (state(),) * 3, 'CANNOT_DECIDE'),
}
ORIGINS = {'rebuilt_elsewhere': [ELSEWHERE, None, ELSEWHERE], 'no_origin': [None, None, None]}


def run():
    rows = []
    for case, (intact, cut, restoration, declared, states, expected) in CASES.items():
        example = object.__new__(J.ForkedExample)
        example.row, example.label = ROW, '0:selftest/' + case
        example.route = dict(refusal=declared, detail='d', site=SITE)
        example.after_states = list(states)  # defect, cut, restoration
        example.origins = ORIGINS.get(case, [AT_SITE, dict(site=['scripts/pm_goal_dg_r_readers.py', 150]), AT_SITE])
        before, disabled = trial(intact), trial(cut)
        restored = trial(restoration) if restoration != intact else dict(before)
        record = dict(id=1, outcome='exact_expected', kill='COVERED_LATER', errors=before['errors'])
        try:
            verdict = example.later_refusal(record, before, disabled, restored)
            error = None
        except Exception as caught:  # noqa: BLE001 - the unfixed judge has no verdict
            verdict, error = None, f'{type(caught).__name__}: {caught}'
        code = record.get('killed_code_check') or {}
        ok = verdict == expected and bool(code)
        if expected == 'KILLED_CODE':
            ok = ok and code.get('verdict') == 'KILLED_CODE'
        elif case.startswith('same_code'):
            ok = ok and code.get('reason') == 'same code' and \
                (record.get('covered_later_check') or {}).get('verdict') == expected
        else:
            ok = ok and code.get('different_code') is True and code.get('verdict') is None
        rows.append(dict(case=case, expected=expected, verdict=verdict, error=error, killed_code_check=code,
                         covered_later_check=record.get('covered_later_check'),
                         cannot_decide_reason=record.get('cannot_decide_reason'), passed=bool(ok)))
    rows.extend(rerun_cases())
    return dict(status='pass' if all(r['passed'] for r in rows) else 'fail', judge=J.__file__, cases=rows)


RERUN = {
    # case: (state per repeat kind, result override per repeat kind, expected verdict, expected reason fragment)
    'rerun_equal': ({'defect-state': 'X', 'cut-state': 'X', 'restoration-state': 'X'}, {}, 'COVERED_LATER', None),
    'rerun_cut_effect': ({'defect-state': 'X', 'cut-state': 'Y', 'restoration-state': 'X'}, {}, 'CANNOT_DECIDE',
                         'cut trial left a different after-state: owner_sha256'),
    'rerun_result_differs': ({'defect-state': 'X', 'cut-state': 'X', 'restoration-state': 'X'},
                             {'cut-state': 'other/refusal/schema/'}, 'CANNOT_DECIDE', 'returned another result'),
}


def rerun_cases():
    import pm_goal_guard_tables as tables

    rows = []
    for case, (owners, overrides, expected, reason) in RERUN.items():
        example = object.__new__(J.ForkedExample)
        example.row, example.label = ROW, '0:selftest/' + case
        example.route = dict(refusal=CODE, detail='d', site=SITE)
        before, disabled = trial(CODE), trial(CODE)
        restored = dict(before)
        example.trials = [trial('control'), before, disabled, restored]
        example.after_states = [None] * 4   # the judged trials walked no owners
        example.origins = [None, AT_SITE, AT_SITE, AT_SITE]
        example.walk_owners = False
        calls = []

        def fork_trial(world, action, inputs, edit, initial, kind, *, credited=True, owners=owners,
                       overrides=overrides, calls=calls, example=example):
            calls.append(dict(kind=kind, cut=sorted(tables.CUT), credited=credited, edit=edit,
                              walk_owners=example.walk_owners))
            earlier = {'defect-state': -3, 'cut-state': -2, 'restoration-state': -1}[kind]
            result = trial(overrides[kind]) if kind in overrides else dict(example.trials[earlier])
            return result, dict(after_state=state(owner=owners[kind]))

        example.fork_trial = fork_trial
        record = dict(id=1, outcome='exact_expected', kill='COVERED_LATER', errors=before['errors'])
        try:
            verdict = example.later_refusal(record, before, disabled, restored,
                                            rerun=lambda example=example: example.owner_states(None, None, None, None))
            error = None
        except Exception as caught:  # noqa: BLE001 - the unfixed judge has no re-run
            verdict, error = None, f'{type(caught).__name__}: {caught}'
        check = record.get('covered_later_check') or {}
        ok = verdict == expected and (reason is None or reason in (check.get('reason') or '')) \
            and [c['kind'] for c in calls] == ['defect-state', 'cut-state', 'restoration-state'] \
            and [c['cut'] for c in calls] == [[], [ROW], []] \
            and all(c['walk_owners'] and not c['credited'] and c['edit'] == J.MARKER for c in calls) \
            and example.walk_owners is False
        rows.append(dict(case=case, expected=expected, verdict=verdict, error=error, rerun_calls=calls,
                         covered_later_check=check, cannot_decide_reason=record.get('cannot_decide_reason'),
                         passed=bool(ok)))
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    report = run()
    args.out.write_text(json.dumps(report, indent=1, default=str) + '\n')
    for row in report['cases']:
        print(f"{'PASS' if row['passed'] else 'FAIL'} {row['case']}: expected {row['expected']}, got {row['verdict']}"
              + (f" ({row['error']})" if row['error'] else ''))
    print(report['status'])
    return 0 if report['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
