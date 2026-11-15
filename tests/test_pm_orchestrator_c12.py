"""Real DO boundary regressions for the C12 closure, not native authority."""
import copy
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_orchestrator_c12 as closure
from pm_orchestrator_c12_cases import additional_board_inputs


class OrchestratorC12(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures, cls.schema = closure.load()

    def test_complete_nonnull_board_sources_and_exact_refusals(self):
        controls, negatives = additional_board_inputs(self.fixtures)
        self.assertEqual(len(controls), 6)
        self.assertEqual(len(negatives), 42)
        by_id = dict(controls)
        for cid, case in controls:
            with self.subTest(control=cid):
                self.assertEqual(closure.c.board_join_errors(case), [])
                self.assertIsInstance(case['source']['original_output'], dict)
        for cid, case, expected, base, _reason in negatives:
            with self.subTest(negative=cid):
                self.assertEqual(closure.c.board_join_errors(case), expected)
                self.assertEqual(closure.c.board_join_errors(by_id[base]), [])

    def test_closed_checkpoint_pattern_integer_uses_shared_rule(self):
        case = self.fixtures['event_cases'][0]
        validator = closure.o.selected_validators(ROOT, closure.c.UTC_FORMAT)['checkpoint']
        for value in (True, 1.0, '1'):
            bad = copy.deepcopy(case['read']['checkpoint'])
            node = next(iter(bad['generations'].values()))
            node['anchor']['source_selection']['manifest_generation'] = value
            with self.subTest(value=repr(value)):
                self.assertFalse(validator.is_valid(bad))

    def test_inactive_checkpoint_branch_is_not_a_clause_witness(self):
        bad = copy.deepcopy(self.fixtures['event_cases'][0]['read']['checkpoint'])
        next(iter(bad['generations'].values()))['activated_at_utc'] = None
        validator = closure.o.selected_validators(ROOT, closure.c.UTC_FORMAT)['checkpoint']
        errors = closure.error_rows(validator.iter_errors(bad))
        # The current branch requires a string; the inactive staged branch's
        # null type must receive no credit for this same input and keyword.
        self.assertTrue(any(x['keyword'] == 'type' and '/allOf/1/then/properties/activated_at_utc/type' in x['schema'] for x in errors))
        self.assertFalse(any(x['keyword'] == 'type' and '/allOf/0/then/properties/activated_at_utc/type' in x['schema'] for x in errors))

    def test_copy_tree_covers_all_equality_partitions(self):
        with tempfile.TemporaryDirectory(prefix='copy-tree-', dir=Path.home() / 'pm-scratch/ea-c12-do') as tmp:
            closure.copy_tree_evidence(Path(tmp))
            result = json.loads((Path(tmp) / 'copy-tree.json').read_text())
        self.assertEqual(result['equality_partitions'], 877)
        self.assertEqual(len(result['independent_witnesses']), 6)

    def test_matrix_cache_binds_same_object_content_and_number_type(self):
        spec = importlib.util.spec_from_file_location('c12_cache_test', ROOT / 'scripts/pm-orchestrator-guard-proof.py')
        proof = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(proof)
        fixtures = {'probe': 1}
        scratch = Path.home() / 'pm-scratch/ea-c12-do'
        with tempfile.TemporaryDirectory(prefix='matrix-cache-', dir=scratch) as tmp:
            with patch.object(proof, 'boundary_matrix', side_effect=lambda boundary, f: {'value': repr(f['probe'])}) as build:
                first = proof.cached_matrix('probe', fixtures, tmp)
                self.assertEqual(proof.cached_matrix('probe', fixtures, tmp), first)
                self.assertEqual(build.call_count, 1)
                fixtures['probe'] = 1.0
                changed = proof.cached_matrix('probe', fixtures, tmp)
                self.assertNotEqual(changed, first)
                self.assertEqual(build.call_count, 2)


if __name__ == '__main__':
    unittest.main()
