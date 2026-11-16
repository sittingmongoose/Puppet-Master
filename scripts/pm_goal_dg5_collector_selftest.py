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


def check_stateless_reducer_not_an_entry():
    import pm_goal_dg5_adapter as adapter
    import pm_goal_test_source as source

    adapter.install()
    reducer = source.LifecycleReducer('run')
    state = reducer.initial()
    state = reducer.step(state, dict(event_type='goal_run.started', event_id='e1', sequence_id=1),
                          dict(group_digest='g'))
    assert state['status'] == 'started'


def check_schema_validate_routing_guard():
    """A schema row's own validate must not let its inner routed refusal replace the row."""
    import pm_goal_dg5_boundaries as bridge
    import pm_goal_dg5_entries as plumbing

    seen = {}

    class Bank:
        def errors(self, root, value):
            return [object()]

        def validate(self, root, value, code='root'):
            seen['routing'] = bridge.ROUTING[0]
            raise RuntimeError('inner routed refusal')

    plumbing.schema_entry(Bank)
    old_decide, old_active = tables.decide, bridge.ACTIVE[0]
    tables.decide = lambda name, holds, site=None: object()
    bridge.ACTIVE[0] = True
    try:
        try:
            Bank().validate('root', {}, 'x/y')
        except RuntimeError:
            pass
    finally:
        tables.decide, bridge.ACTIVE[0] = old_decide, old_active
    assert seen['routing'] is True, seen


def check_boundaries_schema_row_guard():
    """install_schema_rows (the DG-U banks' path) keeps the schema row identity too."""
    import types

    import pm_goal_dg5_boundaries as bridge

    seen = {}
    fake = types.ModuleType('pm_goal_fake_bank')

    class Bank:
        def errors(self, root, value):
            return [object()]

        def validate(self, root, value, code='root'):
            seen['routing'] = bridge.ROUTING[0]
            raise RuntimeError('inner routed refusal')

    fake.Bank = Bank
    old_banks, old_decide, old_active = bridge.SCHEMA_BANKS, tables.decide, bridge.ACTIVE[0]
    sys.modules['pm_goal_fake_bank'] = fake
    bridge.SCHEMA_BANKS = (('pm_goal_fake_bank', 'Bank', 1, lambda a, k: 'x/y'),)
    tables.decide = lambda name, holds, site=None: object()
    bridge.ACTIVE[0] = True
    try:
        bridge.install_schema_rows()
        try:
            Bank().validate('root', {}, 'x/y')
        except RuntimeError:
            pass
    finally:
        bridge.SCHEMA_BANKS, tables.decide, bridge.ACTIVE[0] = old_banks, old_decide, old_active
        del sys.modules['pm_goal_fake_bank']
    assert seen['routing'] is True, seen


def main():
    check_shard_partition()
    check_collector_releases_sealed_values()
    check_stateless_reducer_not_an_entry()
    check_schema_validate_routing_guard()
    check_boundaries_schema_row_guard()
    print('pm_goal_dg5_collector_selftest: PASS')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
