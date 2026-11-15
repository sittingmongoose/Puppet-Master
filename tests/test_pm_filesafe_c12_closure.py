"""Adversarial checks for DF closure evidence attribution and observer purity."""
import copy
import importlib.util
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import pm_filesafe_c12_closure as X


class ClosureEvidenceTests(unittest.TestCase):
    def test_restore_branch_controls_preserve_the_complete_declared_schema(self):
        row = next(r for r in X.A.load('Plans/filesafe_event_authority_fixtures.json')['families']
                   if r['event_type'] == 'safe_point.restored')
        validator = X.A.context('safe_point.restored')[1]('materialization')
        for seed in row['positive'][:2]:
            original = seed['candidate']
            before = copy.deepcopy(original)
            enriched = X.df_branch_control(original)
            self.assertEqual(X.errors(validator, enriched), [])
            self.assertEqual(original, before)
        transaction = X.df_branch_control(row['positive'][0]['candidate'])['source']['native_project_record']
        self.assertEqual(len(transaction['operations']), 1)
        self.assertNotIn('repo_id', transaction)

    def test_nullable_pattern_still_gets_a_string_refusal_witness(self):
        branch = {'type': 'string', 'pattern': '^(?:[0-9a-f]{2})*$(?![\\s\\S])'}
        validator = X.SG.SlotValidator({'anyOf': [branch, {'type': 'null'}]})
        self.assertEqual(X.errors(validator, None), [])
        candidates = list(X.proposals('pattern', branch, None))
        self.assertTrue(any(X.expected_error(X.errors(validator, value), branch, 'pattern', ())
                            for tag, value in candidates))

    def test_proof_rebinding_refuses_changed_case_bytes_and_codes(self):
        path = Path(__file__).resolve().parents[1] / 'scripts/pm-filesafe-c12-proof-reuse.py'
        spec = importlib.util.spec_from_file_location('df_c12_reuse_test', path)
        reuse = importlib.util.module_from_spec(spec); spec.loader.exec_module(reuse)
        g = reuse.S.g
        suite = SimpleNamespace(controls=[g.Control('control', {}, 'synthetic')],
                                negatives=[g.Negative('negative', {'a': 1}, 'ROW', 'refusal', 'control', 'a changes')])
        report = {'controls': [{'id': 'control', 'sha256': g.digest({})}],
                  'negatives': [{'id': 'negative', 'target': 'ROW', 'code': 'refusal',
                                 'control': 'control', 'sha256': g.digest({'a': 1})}]}
        self.assertTrue(reuse.matching_cases(suite, report))
        report['negatives'][0]['sha256'] = g.digest({'a': 2})
        self.assertFalse(reuse.matching_cases(suite, report))
        report['negatives'][0]['sha256'] = g.digest({'a': 1})
        report['negatives'][0]['code'] = 'unrelated refusal'
        self.assertFalse(reuse.matching_cases(suite, report))

    def test_entailed_rows_are_singletons_without_dropping_order_or_fields(self):
        path = Path(__file__).resolve().parents[1] / 'scripts/pm-filesafe-table-generate.py'
        spec = importlib.util.spec_from_file_location('df_c12_generator_test', path)
        generator = importlib.util.module_from_spec(spec); spec.loader.exec_module(generator)
        for phase in X.T.PHASES:
            rows = X.T.rows(phase)
            for name, _, _ in rows:
                if name in generator.ENTAILED_ROWS:
                    self.assertEqual(len(rows), 1, (phase, name))

        def flattened(phase):
            result = [n for n, _, _ in X.T.rows(phase)]
            for follower in X.T.FOLLOWERS.get(phase, ()):
                result.extend(flattened(follower))
            return result

        for phase in generator.ORIGINAL_SPEC:
            if phase['phase'] in generator.GENERATED_FOLLOWERS:
                self.assertEqual(flattened(phase['phase']), [r['name'] for r in phase['rows']])
                phases = (phase['phase'], *generator.GENERATED_FOLLOWERS[phase['phase']])
                actual = {name for p in phases for name in X.T.fields(p)}
                self.assertEqual(actual, set(generator.fields_of(phase['rows'])))

    def test_unrelated_error_does_not_earn_target_credit(self):
        node = {'type': 'string', 'minLength': 2}
        validator = X.SG.SlotValidator(node)
        found = X.errors(validator, '')
        self.assertFalse(X.expected_error(found, node, 'type', ()))
        self.assertTrue(X.expected_error(found, node, 'minLength', ()))

    def test_alternative_branch_error_does_not_earn_complete_refusal(self):
        node = {'anyOf': [{'type': 'string'}, {'type': 'null'}]}
        self.assertEqual(X.errors(X.SG.SlotValidator(node), None), [])
        self.assertFalse(X.expected_error([], node['anyOf'][0], 'type', ()))

    def test_direct_schema_probe_does_not_leak_integer_slots(self):
        before = list(X.SG._SLOTS)
        X.errors(X.SG.SlotValidator({'type': 'integer'}), 2)
        self.assertEqual(X.SG._SLOTS, before)

    def test_observer_restores_original_functions_after_exception(self):
        original = (X.SG.split_errors, X.SG.SlotValidator.descend, X.T.refusals)
        keywords = dict(X.SG.SlotValidator.VALIDATORS)
        with self.assertRaisesRegex(RuntimeError, 'test interruption'):
            with X.Trace('filesafe.command_denied').installed():
                raise RuntimeError('test interruption')
        self.assertEqual(original, (X.SG.split_errors, X.SG.SlotValidator.descend, X.T.refusals))
        self.assertEqual(keywords, X.SG.SlotValidator.VALIDATORS)

    def test_mutation_does_not_change_control(self):
        original = {'payload': {'ts': '2026-01-01T00:00:00Z'}}
        before = copy.deepcopy(original)
        changed = X.replaced(original, ('payload', 'ts'), 'invalid')
        self.assertEqual(original, before)
        self.assertEqual(changed['payload']['ts'], 'invalid')

    def test_event_record_profile_keeps_owner_spellings(self):
        validator = X.SG.SlotValidator({'type': 'string', 'format': 'date-time'},
                                       format_checker=X.SG.format_checker())
        for value in ('0000-01-01T00:00:00Z', '2016-12-31T23:59:60Z',
                      '2026-01-01t00:00:00z', '2026-01-01T00:00:00+01:00'):
            self.assertEqual(X.errors(validator, value), [])
        self.assertTrue(X.errors(validator, '2026-01-01T00:00:00Z\n'))


if __name__ == '__main__':
    unittest.main()
