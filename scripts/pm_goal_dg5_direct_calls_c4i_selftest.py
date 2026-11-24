#!/usr/bin/env python3
"""Regression for the C4I census correction of 2026-11-23 (METHOD-RULING addendum 12 point 3).

The ruling (dg5 C4I-census, widened by the lead's 1123220854): `WorkflowCancel.issue_assignment_audit` is called
directly by `goal.cancelled`'s own corpus in **both** groups — C4I `pm_goal_dg_ca3_inspection_cases.py:158`, `:194`,
`:204`, `:213`, `:222`, `:231`, and C3 `pm_goal_dg_ca3_cases.py:44`, `:92`, `:244`, `:522`, `:528` — so it belongs
in the pinned direct-call listing (`dg5_direct_calls/methods.json`) and the collector must wrap it; before the
correction the key is absent, the collector wraps nothing for the call, and the decisions at
`pm_goal_dg_ca3_route.py:1010/1020/1023/1025/1037` are unrecorded.

Trials, each independent (a missing collector module or a bad listing fails the trial that needs it):
  listing_carries_corpus_sites  goal.cancelled.owner_methods holds the key on module pm_goal_dg_ca3_route with
                                exactly the eleven owner-corpus call sites of both groups and the ruled metadata.
                                RED before the correction.
  only_that_row_added           the listing with that one row removed canonicalizes to the base edition's digest:
                                no other method, site or family changed.
  pin_matches_file              the pinned METHODS_SHA256 equals the file's bytes (an edited listing without an
                                edit to the pin is refused by load()).
  collector_wraps_it            with pm_goal_dg_ca3_route imported, install('goal.cancelled') reports the key
                                under ``wrapped`` (not ``entries``, not ``not_loaded``). RED before the correction.

A later census edition that changes anything else updates BASE_CANON_SHA256 with a stated reason; this file pins
the 2026-11-23 correction, not the census forever.

Usage: python3 -B scripts/pm_goal_dg5_direct_calls_c4i_selftest.py [--out RESULT.json]
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import sys
import traceback

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

KEY = 'WorkflowCancel.issue_assignment_audit'
FAMILY = 'goal.cancelled'
MODULE = 'pm_goal_dg_ca3_route'
SITES = {
    # C3 (pm_goal_dg_ca3_cases.py), counts from the ca-C3-0..3 probe runs
    'pm_goal_dg_ca3_cases.py:44(until)': 39,
    'pm_goal_dg_ca3_cases.py:92(positive)': 6,
    'pm_goal_dg_ca3_cases.py:244(fn)': 8,
    'pm_goal_dg_ca3_cases.py:522(audit_fence_lost)': 1,
    'pm_goal_dg_ca3_cases.py:528(audit_template_drift)': 1,
    # C4I (pm_goal_dg_ca3_inspection_cases.py), from the ca-C4I probe run
    'pm_goal_dg_ca3_inspection_cases.py:158(positive_late_only_sequence)': 1,
    'pm_goal_dg_ca3_inspection_cases.py:194(<lambda>)': 1,
    'pm_goal_dg_ca3_inspection_cases.py:204(<lambda>)': 1,
    'pm_goal_dg_ca3_inspection_cases.py:213(<lambda>)': 1,
    'pm_goal_dg_ca3_inspection_cases.py:222(<lambda>)': 1,
    'pm_goal_dg_ca3_inspection_cases.py:231(<lambda>)': 1,
}
EXPECTED = {
    'adopted_calls': 0,
    'call_sites': SITES,
    'call_sites_in_construction': {},
    'cases': 61,
    'decided_rows': 125,
    'example_cases': ['C3/append_altered_producer', 'C3/append_audit_substituted', 'C3/audit_fence_lost',
                      'C3/audit_template_differs_from_readiness', 'C3/boundary_append_original_final_accepted'],
    'kind': 'owner',
    'module': MODULE,
    'refusing_cases': 15,
}
# The pinned census edition before the correction (final-a19, d4e521ae…), canonicalized with that same key
# removed: json.dumps(..., sort_keys=True, separators=(',', ':'), ensure_ascii=False).
BASE_CANON_SHA256 = '53fe7d37a7fd232369f8290fa31f88d2d132d93ffdd2d54742ce944fbfd41071'


def canonical(listing):
    return hashlib.sha256(json.dumps(listing, sort_keys=True, separators=(',', ':'),
                                     ensure_ascii=False).encode()).hexdigest()


def load_listing():
    import pm_goal_dg5_direct_calls as direct_calls
    return direct_calls, json.loads(direct_calls.METHODS.read_bytes())


def trial_listing_carries_corpus_sites():
    direct_calls, listing = load_listing()
    section = listing[FAMILY]
    entry = section['owner_methods'].get(KEY)
    assert entry is not None, '%s is not in %s.owner_methods' % (KEY, FAMILY)
    assert entry == EXPECTED, 'entry differs from the ruled correction: %s' % json.dumps(entry, sort_keys=True)
    assert KEY not in section['excluded_construction'], '%s is listed as construction' % KEY
    assert entry['module'] == MODULE, entry['module']


def trial_only_that_row_added():
    direct_calls, listing = load_listing()
    section = listing[FAMILY]['owner_methods']
    assert KEY in section, 'the correction is absent: no %s row to remove' % KEY
    without = copy.deepcopy(listing)
    without[FAMILY]['owner_methods'].pop(KEY)
    digest = canonical(without)
    assert digest == BASE_CANON_SHA256, \
        'the listing differs from the base edition beyond the one added row (%s, base %s)' % (digest, BASE_CANON_SHA256)


def trial_pin_matches_file():
    import pm_goal_dg5_direct_calls as direct_calls
    digest = hashlib.sha256(direct_calls.METHODS.read_bytes()).hexdigest()
    assert digest == direct_calls.METHODS_SHA256, \
        'methods.json is %s, pinned %s' % (digest, direct_calls.METHODS_SHA256)


def trial_collector_wraps_it():
    import pm_goal_dg5_direct_calls as direct_calls
    import pm_goal_dg_ca3_route  # noqa: F401  the listed method's module must be loaded, as in the family source
    report = direct_calls.install(FAMILY)
    assert KEY in report['wrapped'], 'not wrapped: %s' % {k: report[k] for k in ('wrapped', 'entries', 'not_loaded')}
    assert KEY not in report['entries'], 'registered as an entry, not a direct call'
    assert KEY not in report['not_loaded'], 'listed but the module was not loaded'


TRIALS = [trial_listing_carries_corpus_sites, trial_only_that_row_added, trial_pin_matches_file,
          trial_collector_wraps_it]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out')
    args = parser.parse_args()
    rows = {}
    for trial in TRIALS:
        name = trial.__name__[len('trial_'):]
        try:
            trial()
        except Exception as error:  # noqa: BLE001
            rows[name] = dict(status='FAIL', error='%s: %s' % (type(error).__name__, error),
                              trace=traceback.format_exc()[-1200:])
            print('FAIL %s: %s: %s' % (name, type(error).__name__, error))
        else:
            rows[name] = dict(status='pass')
            print('PASS %s' % name)
    status = 'fail' if any(row['status'] != 'pass' for row in rows.values()) else 'pass'
    if args.out:
        Path(args.out).write_text(json.dumps(dict(status=status, cases=rows), indent=1, sort_keys=True) + '\n')
    print('status %s (%d/%d trials)' % (status, sum(row['status'] == 'pass' for row in rows.values()), len(rows)))
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
