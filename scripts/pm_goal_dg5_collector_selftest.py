#!/usr/bin/env python3
"""Focused DG5 collector regressions: whole-case sharding and per-call retention.

Run: python3 -B scripts/pm_goal_dg5_collector_selftest.py
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pm_goal_dg5_entries as entries
import pm_goal_dg5_sweep as dg5
import pm_goal_guard_sweep as sweep
import pm_goal_guard_tables as tables


def check_shard_partition():
    ids = [f'C5/case/{i}' for i in range(40)] + ['C5/pos/one', 'C6/neg/two']
    for total in (1, 2, 3, 4, 7):
        parts = [[case_id for case_id in ids if entries.case_shard_selected(case_id, f'{index}/{total}')]
                 for index in range(total)]
        assert sorted(case_id for part in parts for case_id in part) == sorted(ids), (total, parts)
        assert all(not (set(parts[i]) & set(parts[j])) for i in range(total) for j in range(i + 1, total))
    assert entries.case_shard_selected('C5/case/1', '0/2') == entries.case_shard_selected('C5/case/1', '0/2')
    for bad in ('x', '0/0', '2/2', '-1/2', '0/-1'):
        try:
            entries.case_shard_selected('C5/case/1', bad)
        except ValueError:
            pass
        else:
            raise AssertionError('invalid shard accepted: ' + bad)


def check_collector_releases_sealed_values():
    dg5.install(prove=False)
    collector = sweep.Collector(judge=True)
    tables.COLLECTOR = collector
    row = 'dg5/selftest/row'

    def evaluate(value):
        collector.observe(row, False, ('scripts/pm_goal_dg5_collector_selftest.py', 1))
        return dict(errors=[row], store_snapshot_sha256='a' * 64, store_after_sha256='b' * 64)

    value = dict(store={'big': 'x' * 100000})
    collector.invoke('selftest/negative', evaluate, value, False, target=row, family='goal.updated')
    snapshot = collector.store_snapshots[-1]
    assert 'snapshot_pickle_base64' not in snapshot, snapshot
    assert collector.candidates[row][0] is None, collector.candidates[row]
    assert collector.candidates[row][1] is None, 'candidate sealed value retained'
    assert collector.snapshots[row] is None, 'snapshot sealed value retained'


def main():
    check_shard_partition()
    check_collector_releases_sealed_values()
    print('pm_goal_dg5_collector_selftest: PASS')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
