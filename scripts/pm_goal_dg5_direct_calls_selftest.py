#!/usr/bin/env python3
"""Unit trials of the direct-call collector (pm_goal_dg5_direct_calls; addendum 12 point 3).

A temporary listing (pinned for the trial) over two generated modules: an owner module (pm_goal_dg_dcself_owner,
an owner module by the census rule) with a class whose methods are listed or not, and a constructor; and a fixture
world class. bridge.entry_call is replaced by a recorder, so each trial shows whether the wrapper hands the call
to the collector (recorded) or runs it unchanged (not recorded).

  listed_direct            a listed method called from case code with a case current: recorded over its store
  listed_no_case           the same with no case current: not recorded
  listed_nested_owner      the same method called from inside another owner-module function: not recorded
  listed_inside_entry      the same with an entry under way (bridge.PARENT_CALL): not recorded
  not_listed               a method that is not on the list: not wrapped, not recorded
  constructor_not_listed   the class's constructor: not wrapped, not recorded
  constructor_listed       a listing that names a method in both owner_methods and excluded_construction: refused
  fixture_class_by_rule    a listed method of a *World class (C3) the list calls owner: not wrapped, reported
  pin                      a listing that is not the pinned bytes: load refuses
  module_function_unsealed a listed module function, direct, with no world or store to seal: not recorded, counted
  store_argument           a listed module function called with a TestOwnerStorage argument: recorded over that store

Usage: python3 -B scripts/pm_goal_dg5_direct_calls_selftest.py --out RESULT.json
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import textwrap

import pm_goal_dg5_boundaries as bridge
import pm_goal_dg5_direct_calls as dc

OWNER = textwrap.dedent('''
    class Thing:
        def __init__(self):
            self.n = 0
        def listed(self, x):
            return ('listed', x)
        def unlisted(self, x):
            return ('unlisted', x)
        def calls_listed(self, x):
            return self.listed(x)          # nested: an owner function is under way

    def pure(x):
        return ('pure', x)

    def with_store(store, x):
        return ('store', x)
    ''')


def load_module(folder, name, text):
    path = folder / (name + '.py')
    path.write_text(text)
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def listing(folder, methods):
    data = {'selftest.family': dict(owner_methods={k: dict(module='pm_goal_dg_dcself_owner', kind='owner') for k in methods},
                                    excluded_construction={'Thing.__init__': {}}, runs={})}
    path = folder / 'methods.json'
    path.write_bytes(json.dumps(data).encode())
    return path


def fresh(folder, methods, pin=True):
    path = listing(folder, methods)
    dc.METHODS, dc._LIST[:], dc.REPORTS = path, [], {}
    dc.METHODS_SHA256 = hashlib.sha256(path.read_bytes()).hexdigest() if pin else '0' * 64


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    saved = (dc.METHODS, dc.METHODS_SHA256, list(dc._LIST), dict(dc.REPORTS), bridge.entry_call, bridge.CASE[0],
             bridge.PARENT_CALL[0])
    folder = Path(tempfile.mkdtemp(prefix='dg5-direct-selftest-'))
    calls = []

    def recorder(case, label, family, action, work, **kwargs):
        calls.append(dict(label=label, family=family, work=str(work), world=kwargs.get('world')))
        return action()

    rows = []
    try:
        owner = load_module(folder, 'pm_goal_dg_dcself_owner', OWNER)
        bridge.entry_call = recorder
        fresh(folder, ['Thing.listed', 'Thing.calls_listed', 'pm_goal_dg_dcself_owner:pure',
                       'pm_goal_dg_dcself_owner:with_store'])
        report = dc.install('selftest.family')
        import pm_goal_test_storage as storage
        store = storage.TestOwnerStorage.create(folder / 'store')
        thing = owner.Thing()
        thing.storage = store          # an owner over one Storage: the store a recorded call seals

        def trial(name, run, expect_recorded, case=True, parent=False):
            calls.clear()
            bridge.CASE[0] = dict(id='selftest/' + name, expected=None) if case else None
            bridge.PARENT_CALL[0] = parent
            try:
                value = run()
            finally:
                bridge.CASE[0], bridge.PARENT_CALL[0] = None, False
            recorded = [c['label'] for c in calls]
            rows.append(dict(case=name, recorded=recorded, value=list(value) if isinstance(value, tuple) else value,
                             passed=bool(recorded) == expect_recorded))

        trial('listed_direct', lambda: thing.listed(1), True)
        rows[-1]['passed'] = rows[-1]['passed'] and calls[-1]['work'] == str(store.root)
        trial('listed_no_case', lambda: thing.listed(1), False, case=False)
        calls_listed = getattr(owner.Thing.calls_listed, '__wrapped__', owner.Thing.calls_listed)
        trial('listed_nested_owner', lambda: calls_listed(thing, 1), False)
        trial('listed_inside_entry', lambda: thing.listed(1), False, parent=True)
        trial('not_listed', lambda: thing.unlisted(1), False)
        trial('constructor_not_listed', lambda: (owner.Thing().n,), False)
        trial('module_function_unsealed', lambda: owner.pure(2), False)
        rows[-1]['passed'] = rows[-1]['passed'] and \
            dc.REPORTS['selftest.family'].get('unsealed_calls', {}).get('pm_goal_dg_dcself_owner:pure') == 1
        trial('store_argument', lambda: owner.with_store(store, 3), True)
        rows[-1]['passed'] = rows[-1]['passed'] and calls[-1]['work'] == str(store.root)
        rows.append(dict(case='install_report', wrapped=report['wrapped'], passed=sorted(report['wrapped']) ==
                         ['Thing.calls_listed', 'Thing.listed', 'pm_goal_dg_dcself_owner:pure',
                          'pm_goal_dg_dcself_owner:with_store'] and
                         not getattr(owner.Thing.unlisted, '_dg5_direct', False) and
                         not getattr(owner.Thing.__init__, '_dg5_direct', False)))
        owner = load_module(folder, 'pm_goal_dg_dcself_owner', OWNER)   # unwrapped again
        fresh(folder, ['Thing.__init__', 'Thing.listed'])
        try:
            dc.install('selftest.family')
            rows.append(dict(case='constructor_listed', passed=False, why='install accepted a name in both lists'))
        except ValueError as error:
            rows.append(dict(case='constructor_listed', passed='construction' in str(error), why=str(error)))
        owner = load_module(folder, 'pm_goal_dg_dcself_owner', OWNER + '\nclass S1Thing' + 'World:\n    def close(self):\n        return 1\n')
        fresh(folder, ['Thing.listed', 'S1ThingWorld.close'])
        report = dc.install('selftest.family')
        rows.append(dict(case='fixture_class_by_rule', passed=report['construction_by_rule'] == ['S1ThingWorld.close'] and
                         'S1ThingWorld.close' not in report['wrapped'] and
                         not getattr(owner.S1ThingWorld.close, '_dg5_direct', False), report=report))
        fresh(folder, ['Thing.listed'], pin=False)
        try:
            dc.install('selftest.family')
            rows.append(dict(case='pin', passed=False, why='load accepted unpinned bytes'))
        except ValueError as error:
            rows.append(dict(case='pin', passed='not the pinned list' in str(error), why=str(error)))
    finally:
        (dc.METHODS, dc.METHODS_SHA256, dc._LIST[:], dc.REPORTS, bridge.entry_call, bridge.CASE[0],
         bridge.PARENT_CALL[0]) = saved[0], saved[1], saved[2], saved[3], saved[4], saved[5], saved[6]
        sys.modules.pop('pm_goal_dg_dcself_owner', None)
    status = 'pass' if all(r['passed'] for r in rows) else 'fail'
    args.out.write_text(json.dumps(dict(status=status, cases=rows), indent=1, default=str) + '\n')
    for r in rows:
        print('PASS' if r['passed'] else 'FAIL', r['case'], r.get('recorded', r.get('why', '')))
    print(status)
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
