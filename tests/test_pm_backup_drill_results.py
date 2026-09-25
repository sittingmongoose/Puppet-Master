"""Typed isolated-drill witnesses only; mock callbacks earn no native proof."""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_backup_drill_semantics import (structural_errors, backup_drill_semantic_failures,
                                      validate_drill_receipt, validate_jj_context_receipt)


class DrillResults(unittest.TestCase):
    def setUp(self):
        self.f = json.loads((ROOT / 'Plans/backup_drill_result_contract_fixtures.json').read_text())
        self.receipt = self.f['valid'][1]['value']
        self.original = self.f['static_join_sources']['operation']
        self.expected = copy.deepcopy(self.receipt)

    def reader(self, kind, ref):
        source = self.f['static_join_sources']
        d = self.expected['source_resolution']['resolved_source']
        return {('backup_repository_binding', d['repository_binding_id']): source['repository_binding'],
                ('backup_run', d['origin_ref']): source['origin'],
                ('backup_manifest', d['manifest_ref']): source['manifest'],
                ('backup_manifest', source['origin']['manifest_ref']): source['manifest']}[(kind, ref)]

    def callbacks(self):
        # TEST ONLY expected records simulate separately retained owner outputs.
        def fields(*names):
            return lambda original, receipt: [] if all(receipt[k] == self.expected[k] for k in names) else ['owner_mismatch']
        return dict(resolve_record=self.reader, verify_source_custody=lambda *_: [],
            verify_target_admission=fields('target_admission'),
            verify_phase_effects=fields('effects', 'attempted_coverage', 'achieved_coverage'),
            verify_native_closure=fields('native_source_closure_refs', 'jj_verification_receipt_ref', 'rebuild_retained_operation_proof_refs'),
            verify_cleanup=fields('cleanup_status', 'cleanup_evidence_refs', 'residual_artifact_refs', 'recovery_ref'),
            verify_receipt_scope=fields('server_id', 'project_ids'),
            check_current_disclosure=lambda *_: [])

    def check(self, **overrides):
        callbacks = self.callbacks()
        callbacks.update(overrides)
        return validate_drill_receipt(self.original, self.receipt, **callbacks)

    def test_all_fixture_shapes_and_semantics(self):
        for case in self.f['valid']:
            with self.subTest(case=case['name']):
                self.assertEqual([], structural_errors(case['definition'], case['value']))
                self.assertEqual([], backup_drill_semantic_failures(case['definition'], case['value']))
        self.assertEqual([], self.check())

    def test_missing_target_and_foreign_effect_target(self):
        self.receipt['target_admission'] = None
        self.assertIn('effects_without_source_target', self.check())
        self.setUp()
        self.receipt['effects'][0]['target_identity_ref'] = 'target:live-project'
        self.assertIn('effect_outside_admitted_target', self.check())

    def test_current_topology_filesafe_permission_and_resource_authorities(self):
        for key in ('target_identity_ref', 'lease_ref', 'containment_ref', 'permission_decision_ref',
                    'filesafe_decision_ref', 'resource_admission_ref', 'cost_network_admission_ref'):
            with self.subTest(key=key):
                self.setUp()
                self.receipt['target_admission'][key] = 'substituted:owner'
                self.assertTrue(self.check())
        self.assertIn('target_admission:revoked', self.check(verify_target_admission=lambda *_: ['revoked']))

    def test_requested_coverage_and_native_mandatory_dependencies(self):
        self.receipt['achieved_coverage']['selected_family_ids'] = ['different.family']
        self.assertIn('passed_without_requested_coverage', self.check())
        self.setUp()
        self.assertIn('native_closure:required_jj_missing', self.check(verify_native_closure=lambda *_: ['required_jj_missing']))
        self.assertIn('native_closure:required_original_custody_missing', self.check(verify_native_closure=lambda *_: ['required_original_custody_missing']))

    def test_achieved_all_paths_requires_attempted_all_paths(self):
        self.receipt['attempted_coverage']['path_selection'] = 'selected_paths'
        self.receipt['attempted_coverage']['selected_path_refs'] = ['path:other']
        self.assertEqual([], structural_errors('backup_drill_verification_receipt_v2', self.receipt))
        self.assertIn('achieved_paths_without_attempt', self.check())

    def test_partial_cleanup_keeps_verification_separate(self):
        self.receipt = self.f['valid'][2]['value']
        self.expected = copy.deepcopy(self.receipt)
        self.assertEqual('passed', self.receipt['verification_status'])
        self.assertEqual([], self.check())
        self.receipt['operation_status'] = 'completed'
        self.assertIn('completed_with_cleanup_obligation', self.check())

    def test_cleanup_evidence_cannot_be_invented(self):
        self.receipt['cleanup_evidence_refs'] = []
        self.assertIn('cleanup_completion_unproved', self.check())
        self.setUp()
        self.assertIn('cleanup:outside_target', self.check(verify_cleanup=lambda *_: ['outside_target']))

    def test_last_disclosure_and_missing_interfaces_fail(self):
        self.assertIn('current_disclosure:revoked', self.check(check_current_disclosure=lambda *_: ['revoked']))
        self.assertIn('native_closure_invalid_response', self.check(verify_native_closure=lambda *_: True))
        callbacks = self.callbacks()
        del callbacks['verify_phase_effects']
        with self.assertRaises(TypeError):
            validate_drill_receipt(self.original, self.receipt, **callbacks)

    def test_jj_successor_preserves_native_depth_and_disjoint_context(self):
        native = self.f['valid'][3]['value']
        validate = lambda: validate_jj_context_receipt(native,
            verify_native_context=lambda *_: [], check_current_disclosure=lambda *_: [])
        self.assertEqual([], validate())
        native['verification_context']['restore_run_ref'] = 'restore:invented'
        self.assertTrue(validate())
        native['verification_context'].pop('restore_run_ref')
        native['object_verification_depth'] = 'structure_passed'
        self.assertTrue(validate())

    def test_jj_unchanged_heads_context_and_no_activation(self):
        native = self.f['valid'][3]['value']
        native['operation_heads_after_refs'] = ['operation:unexpected']
        self.assertIn('jujutsu_operation_heads_changed_during_read_only_verification',
            backup_drill_semantic_failures('backup_jj_context_verification_receipt_v2', native))
        native['outcome'] = 'ready_for_owner_activation'
        self.assertTrue(structural_errors('backup_jj_context_verification_receipt_v2', native))

    def test_jj_required_pointer_kind_and_hop_sequence_preserved(self):
        native = self.f['valid'][3]['value']
        native['pointer_resolutions'] = native['pointer_resolutions'][:1]
        self.assertEqual([], structural_errors('backup_jj_context_verification_receipt_v2', native))
        self.assertIn('jujutsu_pointer_resolution_incomplete_for_layout',
            backup_drill_semantic_failures('backup_jj_context_verification_receipt_v2', native))
        self.setUp()
        native = self.f['valid'][3]['value']
        native['pointer_resolutions'][0]['hop_index'] = 2
        self.assertEqual([], structural_errors('backup_jj_context_verification_receipt_v2', native))
        self.assertIn('jujutsu_pointer_resolution_incomplete_for_layout',
            backup_drill_semantic_failures('backup_jj_context_verification_receipt_v2', native))


if __name__ == '__main__':
    unittest.main()
