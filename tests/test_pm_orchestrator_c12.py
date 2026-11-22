"""Real DO boundary regressions for the C12 closure, not native authority."""
import copy
import io
import importlib.util
import json
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
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

    def test_malformed_schema_roots_return_named_refusals(self):
        base = self.fixtures['event_cases'][0]
        for value in (None, False, 0, 1.0, 'unresolved-original', [], [None]):
            case = copy.deepcopy(base)
            case['event'] = value
            with self.subTest(root='event', value=repr(value)):
                self.assertEqual(closure.o.event_errors(case, self.schema, closure.c.identity, closure.c.retry_allowed,
                                                      ROOT, closure.c.UTC_FORMAT), ['event_schema'])
                self.assertEqual(closure.o.historical_read_errors(case, self.schema, closure.c), ['historical_original_recipe'])
            case = copy.deepcopy(base)
            case['read']['row'] = value
            with self.subTest(root='index_row', value=repr(value)):
                self.assertEqual(closure.o.checkpoint_errors(case, ROOT, closure.c.UTC_FORMAT), ['index_row_schema'])
            for i, board in enumerate(self.fixtures['board_storage_cases']):
                if board['payload']['scope'] != 'application':
                    continue
                case = copy.deepcopy(board)
                case['source'] = value
                with self.subTest(root='source', path=i, value=repr(value)):
                    self.assertEqual(closure.c.board_join_errors(case), ['application_source_schema'])

    def test_object_subclasses_cannot_skip_replay_or_copy_checks(self):
        class DecodedObject(dict):
            pass
        case = copy.deepcopy(self.fixtures['event_cases'][0])
        case['event'] = DecodedObject(case['event'], replay_policy='append_once')
        errors = closure.o.event_errors(case, self.schema, closure.c.identity, closure.c.retry_allowed,
                                       ROOT, closure.c.UTC_FORMAT)
        self.assertIn('family_current_replay_policy', errors)
        case = copy.deepcopy(self.fixtures['event_cases'][0])
        case['read']['row'] = DecodedObject(case['read']['row'], event_id='evt_do_' + 'a' * 64)
        self.assertIn('index_row_event_id', closure.o.checkpoint_errors(case, ROOT, closure.c.UTC_FORMAT))

    def test_copy_tree_covers_all_equality_partitions(self):
        with tempfile.TemporaryDirectory(prefix='copy-tree-', dir=Path.home() / 'pm-scratch/ea-c12-do') as tmp:
            closure.copy_tree_evidence(Path(tmp))
            result = json.loads((Path(tmp) / 'copy-tree.json').read_text())
        self.assertEqual(result['equality_partitions'], 877)
        self.assertEqual(len(result['independent_witnesses']), 6)

    def test_matrix_diagnostic_and_strict_exits(self):
        spec = importlib.util.spec_from_file_location('c12_exit_test', ROOT / 'scripts/pm-orchestrator-guard-proof.py')
        proof = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(proof)
        clean = {'rows': ['row'], 'controls': [], 'negatives': [], 'errors': [], 'unwitnessed_rows': ['row']}
        defect = {'id': 'negative', 'defect': 'refused_by_no_row', 'refused_by': [], 'expected_codes': ['row']}
        cases = [
            (clean, 0),
            (dict(clean, negatives=[defect]), 1),
            (dict(clean, errors=[('control_refused', 'control', ['row'])]), 1),
        ]
        for matrix, expected_strict in cases:
            with self.subTest(matrix=matrix), patch.object(proof, 'fixtures_now', return_value={}):
                matrices = {'board': matrix, 'checkpoint': clean}
                with patch.object(proof, 'boundary_matrix', side_effect=lambda name, _: matrices[name]):
                    for flags, expected in (([], 0), (['--strict'], expected_strict)):
                        with self.subTest(flags=flags), redirect_stdout(io.StringIO()) as out:
                            code = proof.main(['matrix', '--boundary', 'board', '--boundary', 'checkpoint', *flags])
                            self.assertEqual(code or 0, expected)
                            summary = json.loads(out.getvalue().splitlines()[0])
                            self.assertEqual(summary['negative_defects'], len(matrix['negatives']))
                            self.assertEqual(summary['control_errors'], len(matrix['errors']))
                            self.assertIn('"boundary": "checkpoint"', out.getvalue())

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
