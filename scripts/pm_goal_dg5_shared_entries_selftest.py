#!/usr/bin/env python3
"""Regression for the shared-adapter storage entries (KILL-473 route-back, 2026-11-24).

`TestOwnerStorage.append` and `TestOwnerStorage.reserve` are recorded by the collector as **entries**, not as
direct calls. `pm_goal_dg5_adapter.py:31-36` lists both in `STORAGE_ENTRIES` and `:65-66` registers them with
`pm_goal_dg5_entries.entries`, so the corpus call at `pm_goal_test_adapters_selftest.py:93` (and the reserve call at
`:92`) inside `append_one` runs through the entry wrapper and is recorded as `<case>/TestOwnerStorage.append` /
`<case>/TestOwnerStorage.reserve`. The direct-call census (`dg5_direct_calls/methods.json`) therefore lists
neither for `shared-adapter`: its `owner_methods` is the direct-call list, built by a18 from each case's
`direct` map only, and the probe files these calls under `direct_sites[...]['entry']` on every archived
full shared-adapter run (801/857 cases: 25 `append` and 20 `reserve` sites, no `direct` bucket).

Why this file exists: the `:473` route-back read the census's silence as "the collector records no decision
inside the call". It does. `append_entry_records_the_473_decision` runs the corpus's own
`adapter/storage/event_schema_extra_member` through the collector and finds the append entry's record with
`dg5/site/pm_goal_test_storage.py:473` in its signature rows, and the site row carrying that entry as a
negative. `census_lists_no_entry_as_direct` and `entry_row_is_inert` pin the census consequence: a row added
to `owner_methods` while the method is entry-wrapped is reported by `install()` under `entries`, never
wrapped, so it changes no record. If a future census edition adds the row for a stated reason, update those
two trials with the reason (as the C4I selftest updates its base digest); do not delete them silently.

Trials:
  storage_entries_registered           both methods carry the entry wrapper after the family source installs.
  append_entry_records_the_473_decision  the corpus case's append entry records the `:473` decision, and the
                                       site row carries that entry as a negative.
  census_lists_no_entry_as_direct      neither key is in `shared-adapter.owner_methods`, and the install report
                                       claims neither (not wrapped, not entries, not not_loaded).
  entry_row_is_inert                   with a constructed listing that adds both rows, `install()` reports them
                                       under `entries` and wraps neither; nothing is wrapped twice.

Usage: python3 -B scripts/pm_goal_dg5_shared_entries_selftest.py [--out RESULT.json]
"""
import argparse
import hashlib
import json
import shutil
import tempfile
from pathlib import Path
import sys
import traceback

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

FAMILY = 'shared-adapter'
KEYS = ('TestOwnerStorage.append', 'TestOwnerStorage.reserve')
CASE = 'adapter/storage/event_schema_extra_member'
ROW = 'dg5/site/pm_goal_test_storage.py:473'

_STATE = {}


def family_source():
    if 'source' not in _STATE:
        import pm_goal_dg5_adapter as source
        source.install()
        _STATE['source'] = source
    return _STATE['source']


def trial_storage_entries_registered():
    import pm_goal_test_storage as storage
    source = family_source()
    for key in KEYS:
        _, name = key.split('.')
        assert name in source.STORAGE_ENTRIES, '%s: %r not in STORAGE_ENTRIES' % (key, name)
        method = getattr(storage.TestOwnerStorage, name)
        assert getattr(method, '_dg5_entry', False), '%s is not entry-wrapped' % key


def trial_append_entry_records_the_473_decision():
    import pm_goal_dg5_boundaries as bridge
    import pm_goal_guard_sweep as sweep
    import pm_goal_guard_tables as tables
    import pm_goal_test_adapters_selftest as selftest
    import pm_goal_test_storage as storage
    family_source()
    scratch = Path(tempfile.mkdtemp(prefix='dg5-shared-entries-'))
    try:
        collector = sweep.Collector(judge=True)
        tables.COLLECTOR = collector
        tables.ACTIVE = True
        tables.DISCOVERY = True
        bridge.SLOTS[:] = []
        work = scratch / 'work'
        work.mkdir()
        store = storage.TestOwnerStorage.create(work / 'storage-main', segment_target_bytes=6000)
        suite = selftest.Suite()
        suite.negative('storage', 'event_schema_extra_member',
                       lambda: selftest.append_one(store, 'extra', dict(selftest.candidate('extra'), extension=1)),
                       'append/event/schema/')
        assert [c['status'] for c in suite.cases] == ['pass'], suite.cases
        label = CASE + '/' + KEYS[0]
        records = [r for r in collector.ledger if r.get('label') == label]
        assert records, 'no %r record; labels: %s' % (label, [r.get('label') for r in collector.ledger])
        record = records[0]
        assert ROW in record['errors'], '%s errors: %s' % (label, record['errors'])
        rows = collector.signature_list[record['sig']] if record.get('sig') is not None else ()
        assert ROW in rows, '%s signature rows: %s' % (label, sorted(rows))
        site_row = collector.rows.get(ROW)
        assert site_row is not None, '%s was not observed as a row' % ROW
        assert label in [n['source'] for n in site_row['negatives']], \
            '%s is not a negative of %s: %s' % (label, ROW, site_row['negatives'])
    finally:
        shutil.rmtree(scratch, ignore_errors=True)


def trial_census_lists_no_entry_as_direct():
    import pm_goal_dg5_direct_calls as direct_calls
    listing = json.loads(direct_calls.METHODS.read_bytes())
    section = listing[FAMILY]
    for key in KEYS:
        assert key not in section['owner_methods'], '%s is claimed as a direct call for %s' % (key, FAMILY)
        assert key not in section['excluded_construction'], '%s is claimed as construction for %s' % (key, FAMILY)
    family_source()
    report = direct_calls.REPORTS[FAMILY]
    for key in KEYS:
        assert key not in report['wrapped'], '%s is wrapped as a direct call: %s' % (key, report['wrapped'])
        assert key not in report['entries'], '%s is claimed as an entry of the census: %s' % (key, report['entries'])
        assert key not in report['not_loaded'], '%s listed but not loaded: %s' % (key, report['not_loaded'])


def trial_entry_row_is_inert():
    import pm_goal_dg5_direct_calls as direct_calls
    listing = json.loads(direct_calls.METHODS.read_bytes())
    for key in KEYS:
        listing[FAMILY]['owner_methods'][key] = dict(
            kind='owner', module='pm_goal_test_storage', cases=0, example_cases=[], decided_rows=0,
            refusing_cases=0, adopted_calls=0, call_sites={}, call_sites_in_construction={})
    scratch = Path(tempfile.mkdtemp(prefix='dg5-shared-listing-'))
    path = scratch / 'methods.json'
    path.write_bytes(json.dumps(listing, indent=1, sort_keys=True).encode())
    saved = (direct_calls.METHODS, direct_calls.METHODS_SHA256, list(direct_calls._LIST),
             direct_calls.REPORTS.get(FAMILY))
    try:
        direct_calls.METHODS = path
        direct_calls.METHODS_SHA256 = hashlib.sha256(path.read_bytes()).hexdigest()
        direct_calls._LIST[:] = []
        direct_calls.REPORTS.pop(FAMILY, None)
        import pm_goal_dg5_adapter as source
        source.install()          # re-run with the constructed listing: entry registration is idempotent
        report = direct_calls.REPORTS[FAMILY]
        for key in KEYS:
            assert key in report['entries'], '%s is not reported under entries: %s' % (key, report)
            assert key not in report['wrapped'], '%s was wrapped instead of left as an entry' % key
        assert len(report['wrapped']) == len(set(report['wrapped'])), 'a method was wrapped twice: %s' % report['wrapped']
    finally:
        direct_calls.METHODS, direct_calls.METHODS_SHA256 = saved[0], saved[1]
        direct_calls._LIST[:] = saved[2]
        direct_calls.REPORTS.pop(FAMILY, None)
        if saved[3] is not None:
            direct_calls.REPORTS[FAMILY] = saved[3]
        shutil.rmtree(scratch, ignore_errors=True)


TRIALS = [trial_storage_entries_registered, trial_append_entry_records_the_473_decision,
          trial_census_lists_no_entry_as_direct, trial_entry_row_is_inert]


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
