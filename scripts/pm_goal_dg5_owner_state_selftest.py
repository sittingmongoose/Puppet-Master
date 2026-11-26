#!/usr/bin/env python3
"""No-store collection must reject mutations in both cold and warmed owner state."""
import argparse
import json
from pathlib import Path
import tempfile
import unittest

import pm_goal_dg5_direct_calls_c8_selftest as c8
import pm_goal_dg5_owner_state as owner_state


OWNER = c8.OWNER + '''
GRAPH = {str(i): ([{'counter': int('1234567')}], tuple(range(16))) for i in range(128)}
TARGET = GRAPH['127'][0][0]
MUTATE = False
R5_WORLD = None

def read_graph():
    if MUTATE:
        GRAPH['127'][0].append({'counter': 2345678})
        GRAPH['127'][0].pop(0)
    return 7

def change_r5_bank():
    R5_WORLD.start_world.edition.bank.name += '/injected-mutation'
    return 8

def change_r5_world():
    R5_WORLD.permissions['project'] = False
    return 9
'''


class CollectorMutationTests(unittest.TestCase):
    def setUp(self):
        self.folder = Path(self.enterContext(tempfile.TemporaryDirectory(prefix='dg5-owner-state-')))
        self.addCleanup(setattr, c8, 'OWNER', c8.OWNER)
        c8.OWNER = OWNER
        methods = ['pm_goal_dg_c8self_owner:' + name for name in ('read_graph', 'change_r5_bank', 'change_r5_world')]
        self.bridge, _dc, self.owner, self.report = c8.setup(self.folder, methods)
        self.bridge.CASE[0] = dict(id='c8b/owner-mutation', expected=None)
        self.addCleanup(self.bridge.CASE.__setitem__, 0, None)

    def assert_mutation_refused(self, action, expected):
        reason = 'owner state changed in the child run'
        before = self.report.get('no_store_reasons', {}).get(reason, 0)
        recorded = self.report['recorded_calls']
        self.assertEqual(action(), expected)
        self.assertEqual(self.report['recorded_calls'], recorded)
        self.assertEqual(self.report.get('no_store_reasons', {}).get(reason), before + 1, self.report)

    def test_mutation_below_warmed_fragment(self):
        self.assertEqual(self.owner.read_graph(), 7)
        self.assertEqual(self.report['recorded_calls'], 1)
        hook = owner_state.HOOKS[c8.FAMILY]
        if hasattr(hook, 'checkpoint') and owner_state.prepare_checkpoints() is not None:
            block = hook._checkpoints[id(self.owner.GRAPH)]
            self.assertIn(id(self.owner.TARGET), block.memo)
        self.owner.MUTATE = True
        self.assert_mutation_refused(self.owner.read_graph, 7)
        self.assertEqual(self.owner.GRAPH['127'][0][0]['counter'], 2345678)
        self.assertEqual(self.owner.TARGET['counter'], 1234567)

    def test_r5_bank_mutation(self):
        import pm_goal_dg_int_old as old
        world = old.World(base=self.folder)
        self.addCleanup(world.close)
        self.owner.R5_WORLD = world
        bank = world.start_world.edition.bank
        original = bank.name
        self.addCleanup(setattr, bank, 'name', original)
        self.assert_mutation_refused(self.owner.change_r5_bank, 8)
        self.assertEqual(bank.name, original + '/injected-mutation')

    def test_r5_world_mutation(self):
        import pm_goal_dg_int_old as old
        world = old.World(base=self.folder)
        self.addCleanup(world.close)
        self.owner.R5_WORLD = world
        self.assert_mutation_refused(self.owner.change_r5_world, 9)
        self.assertIs(world.permissions['project'], False)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(CollectorMutationTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    problems = {str(case): traceback for case, traceback in result.failures + result.errors}
    args.out.write_text(json.dumps(dict(passed=result.testsRun - len(problems), total=result.testsRun,
                                        problems=problems), indent=2) + '\n')
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())
