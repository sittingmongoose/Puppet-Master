"""Static compare record joins and mandatory native-integration refusal tests."""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_backup_compare_semantics import (backup_compare_semantic_failures,
    fixture_dependencies, structural_errors, validate_compare_result)


class BackupCompareResults(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures = json.loads((ROOT / 'Plans/backup_compare_result_contract_fixtures.json').read_text())
        cls.valid = {v['name']: v for v in cls.fixtures['valid']}

    def run_value(self, value, **changes):
        dependencies = fixture_dependencies(value)
        dependencies.update(changes)
        return validate_compare_result(value['original_operation']['operation_id'], **dependencies)

    def test_fixture_pair(self):
        for case in self.fixtures['valid']:
            with self.subTest(case=case['name']):
                self.assertEqual([], structural_errors(case['definition'], case['value']))
                self.assertEqual([], backup_compare_semantic_failures(case['definition'], case['value']))
        for case in self.fixtures['invalid']:
            value = copy.deepcopy(self.valid[case['base_valid']]['value'])
            for path, replacement in case['patch'].items():
                cursor = value
                parts = path.split('.')
                for part in parts[:-1]:
                    cursor = cursor[part]
                cursor[parts[-1]] = replacement
            with self.subTest(case=case['name']):
                structural = structural_errors(case['definition'], value)
                if 'semantic_rule' in case:
                    self.assertEqual([], structural)
                    self.assertIn(case['semantic_rule'], backup_compare_semantic_failures(case['definition'], value))
                else:
                    self.assertTrue(structural)

    def test_every_proof_dependency_is_required_and_refusal_is_effective(self):
        value = self.valid['ordinary_file']['value']
        for name in ('validate_snapshot', 'verify_original_admission', 'verify_target_resolution',
                     'verify_content_custody', 'verify_comparison', 'verify_result_facts', 'check_current_disclosure'):
            with self.subTest(callback=name):
                self.assertTrue(self.run_value(value, **{name: lambda *args: ['native_denied']}))
                self.assertTrue(self.run_value(value, **{name: lambda *args: True}))
                dependencies = fixture_dependencies(value)
                dependencies.pop(name)
                with self.assertRaises(TypeError):
                    validate_compare_result(value['original_operation']['operation_id'], **dependencies)

    def test_same_selected_strings_do_not_authenticate_owner_or_content(self):
        value = self.valid['dirty_buffer']['value']
        def missing(*args):
            raise KeyError('disposed or owner unavailable')
        self.assertIn('backup_compare_target_resolution_unavailable', self.run_value(value, verify_target_resolution=missing))
        self.assertIn('backup_compare_target_custody_unavailable', self.run_value(value, verify_content_custody=missing))
        self.assertIn('backup_compare_snapshot_unavailable', self.run_value(value, resolve_snapshot=missing))

    def test_native_owner_rejects_consistently_relabelled_target(self):
        # Relation checks alone cannot detect a forged coherent record. The real
        # producer lookup must reject it even if all caller strings agree.
        value = copy.deepcopy(self.valid['dirty_buffer']['value'])
        authentic = copy.deepcopy(value['target_read'])
        value['target_read']['resolved']['identity']['buffer_identity_ref'] = 'buffer:other'
        def actual_owner(original, target):
            return [] if target == authentic else ['not_original_owner_output']
        self.assertIn('backup_compare_target_resolution', self.run_value(value, verify_target_resolution=actual_owner))

    def test_current_disclosure_rechecked_before_release(self):
        calls = []
        def disclosure(*args):
            calls.append(1)
            return [] if len(calls) == 1 else ['revoked']
        self.assertIn('backup_compare_disclosure', self.run_value(self.valid['ordinary_file']['value'], check_current_disclosure=disclosure))
        self.assertEqual(2, len(calls))

    def test_denied_admission_does_not_resolve_content(self):
        def unexpected_read(*args):
            self.fail('read after denied original admission')
        self.assertIn('backup_compare_original_admission', self.run_value(
            self.valid['ordinary_file']['value'], resolve_read=unexpected_read,
            verify_original_admission=lambda *args: ['denied']))

    def test_native_owner_rejects_same_commit_different_file_or_worktree(self):
        for field, replacement in (('selected_file_ref', 'repo-file:other'),
                                   ('workspace_id', 'workspace:other')):
            value = copy.deepcopy(self.valid['git_target']['value'])
            authentic = copy.deepcopy(value['target_read'])
            identity = value['target_read']['resolved']['identity']
            if field == 'workspace_id':
                identity['repository_context'][field] = replacement
            else:
                identity[field] = replacement
            def native_read(original, target):
                return [] if target == authentic else ['selected_native_read_mismatch']
            with self.subTest(field=field):
                self.assertIn('backup_compare_target_resolution', self.run_value(value, verify_target_resolution=native_read))

    def test_failed_reads_do_not_become_empty_success_or_erase_prior_effects(self):
        value = self.valid['denied_after_source_read']['value']
        def actual_facts(original, result, reads):
            return [] if result['read_effects'] == ['source_read'] else ['lost_prior_read']
        self.assertEqual([], self.run_value(value, verify_result_facts=actual_facts))
        changed = copy.deepcopy(value)
        changed['result']['read_effects'] = []
        self.assertIn('backup_compare_result_facts', self.run_value(changed, verify_result_facts=actual_facts))


if __name__ == '__main__':
    unittest.main()
