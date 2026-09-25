"""Static BRS-030 joins with explicit mock native readers; never runtime proof."""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_backup_snapshot_semantics import (structural_errors,
    backup_snapshot_semantic_failures, validate_snapshot_resolution,
    validate_verification_receipt)


class SnapshotResults(unittest.TestCase):
    def setUp(self):
        self.fixtures = json.loads((ROOT / 'Plans/backup_snapshot_result_contract_fixtures.json').read_text())
        self.sources = self.fixtures['static_join_sources']
        self.original = self.sources['operation']
        self.resolution = self.fixtures['valid'][0]['value']
        self.receipt = self.fixtures['valid'][2]['value']
        # Immutable expectation retained independently of mutations under test.
        self.authenticated = copy.deepcopy(self.resolution)

    def reader(self, kind, ref):
        expected = self.authenticated['resolved_source']
        table = {
            ('backup_repository_binding', expected['repository_binding_id']): self.sources['repository_binding'],
            (expected['origin_kind'], expected['origin_ref']): self.sources['origin'],
            ('backup_manifest', expected['manifest_ref']): self.sources['manifest'],
            ('backup_manifest', self.sources['origin'].get('manifest_ref')): self.sources['manifest'],
        }
        return table[(kind, ref)]

    def mock_custody(self, original, resolution, binding, origin, manifest, attempt):
        # TEST ONLY: models opaque association lookup; never authenticates bytes.
        if resolution['disposition'] == 'unresolved':
            return [] if resolution['selection']['snapshot_id'] == 'snapshot:missing' else ['unexpected_absence']
        d = resolution['resolved_source']
        expected = self.authenticated['resolved_source']
        keys = ('repository_snapshot_ref', 'commit_receipt_ref', 'destination_attempt_id', 'manifest_ref')
        return [] if all(d[k] == expected[k] for k in keys) and resolution['selection'] == self.authenticated['selection'] else ['opaque_association_mismatch']

    def check_resolution(self):
        return validate_snapshot_resolution(self.original, self.resolution,
            resolve_record=self.reader, verify_source_custody=self.mock_custody,
            check_current_disclosure=lambda *_: [])

    def check_receipt(self, engine=lambda *_: []):
        return validate_verification_receipt(self.original, self.receipt,
            resolve_record=self.reader, verify_source_custody=self.mock_custody,
            verify_engine_outcome=engine, verify_receipt_scope=self.mock_scope,
            check_current_disclosure=lambda *_: [])

    def mock_scope(self, original, receipt):
        return [] if set(receipt['project_ids']) == set(self.sources['origin']['project_ids']) else ['project_scope_mismatch']

    def test_receipt_project_scope_requires_actual_owner_join(self):
        self.receipt['project_ids'] = ['project:unrelated']
        self.assertIn('receipt_scope:project_scope_mismatch', self.check_receipt())

    def test_fixture_shapes_and_intrinsic_semantics(self):
        for case in self.fixtures['valid']:
            with self.subTest(case=case['name']):
                self.assertEqual([], structural_errors(case['definition'], case['value']))
                self.assertEqual([], backup_snapshot_semantic_failures(case['definition'], case['value']))
        for kind, key in [('backup_run', 'origin'), ('backup_manifest', 'manifest'), ('backup_repository_binding', 'repository_binding')]:
            self.assertEqual([], structural_errors(kind, self.sources[key]))

    def test_partial_run_committed_copy_and_opaque_refs(self):
        self.assertEqual('partial', self.sources['origin']['state'])
        self.assertNotEqual(self.sources['origin']['manifest_ref'], self.sources['manifest']['manifest_id'])
        self.assertNotEqual(self.resolution['selection']['snapshot_id'], self.resolution['resolved_source']['repository_snapshot_ref'])
        self.assertEqual([], self.check_resolution())
        self.assertEqual([], self.check_receipt())

    def test_snapshot_selection_and_descriptor_mutations(self):
        for key in ('repository_binding_id', 'backup_run_id', 'backup_id', 'capture_set_id', 'destination_attempt_id', 'commit_receipt_ref', 'repository_snapshot_ref', 'manifest_id', 'recovery_set_id', 'server_id', 'project_id', 'project_vault_id'):
            with self.subTest(key=key):
                self.setUp()
                self.resolution['resolved_source'][key] = 'substituted:identity'
                self.assertTrue(self.check_resolution())
        self.setUp()
        self.resolution['resolved_source']['manifest_sha256'] = 'f' * 64
        self.assertTrue(self.check_resolution())
        for key in ('repository_id', 'backup_destination_id', 'snapshot_id'):
            with self.subTest(selection=key):
                self.setUp()
                self.resolution['selection'][key] = 'substituted:selection'
                self.assertTrue(self.check_resolution())

    def test_original_and_binding_membership(self):
        self.resolution['operation_binding']['operation_id'] = 'operation:other'
        self.assertIn('original_operation_mismatch', self.check_resolution())
        self.setUp()
        self.sources['repository_binding']['destination_binding_ids'] = ['destination:other']
        self.assertIn('destination_not_bound', self.check_resolution())
        self.setUp()
        self.sources['origin']['repository_binding_ids'] = ['binding:other']
        self.assertIn('run_binding_missing', self.check_resolution())

    def test_duplicate_attempt_and_noncommitted_copy(self):
        self.sources['origin']['destination_attempts'].append(copy.deepcopy(self.sources['origin']['destination_attempts'][0]))
        self.assertIn('attempt_missing_or_ambiguous', self.check_resolution())
        self.setUp()
        attempt = self.sources['origin']['destination_attempts'][0]
        attempt['upload_state'] = 'outcome_unknown'
        attempt['failure_ref'] = 'failure:unknown'
        self.assertIn('attempt_not_committed', self.check_resolution())

    def test_opaque_membership_alone_not_authority(self):
        self.sources['origin']['repository_snapshot_refs'] = ['opaque:borrowed']
        self.sources['manifest']['repository_snapshot_refs'] = ['opaque:borrowed']
        self.resolution['resolved_source']['repository_snapshot_ref'] = 'opaque:borrowed'
        self.assertIn('source_custody:opaque_association_mismatch', self.check_resolution())
        self.setUp()
        self.sources['manifest']['repository_snapshot_refs'] = ['opaque:other']
        self.assertIn('snapshot_ref_missing', self.check_resolution())

    def test_all_selected_outcomes_required_exactly_once(self):
        self.receipt['outcomes'].pop()
        self.assertIn('outcomes_not_exact_selected_set', self.check_receipt())
        self.setUp()
        self.receipt['outcomes'].append(copy.deepcopy(self.receipt['outcomes'][0]))
        self.assertIn('outcomes_not_exact_selected_set', self.check_receipt())

    def test_missing_cannot_pass_and_weaker_scope_cannot_pass(self):
        self.receipt['status'] = 'passed'
        self.assertIn('selected_set_pass_mismatch', self.check_receipt())
        self.setUp()
        self.receipt['outcomes'][1]['achieved_scope'] = 'structural'
        self.assertTrue(self.check_receipt())
        self.setUp()
        self.receipt['outcomes'][0]['requested_scope'] = 'full_data_read'
        self.assertIn('insufficient_achieved_scope', self.check_receipt())

    def test_native_authentication_and_engine_proof_remain_mandatory(self):
        self.assertIn('engine_outcome:not_genuine', self.check_receipt(lambda *_: ['not_genuine']))
        self.assertTrue(validate_snapshot_resolution(self.original, self.resolution,
            resolve_record=self.reader, verify_source_custody=lambda *_: ['commit_unavailable'],
            check_current_disclosure=lambda *_: []))
        self.assertTrue(validate_snapshot_resolution(self.original, self.resolution,
            resolve_record=self.reader, verify_source_custody=lambda *_: True,
            check_current_disclosure=lambda *_: []))
        with self.assertRaises(TypeError):
            validate_snapshot_resolution(self.original, self.resolution, resolve_record=self.reader)

    def test_reordered_selected_set_and_late_disclosure_revocation(self):
        self.original['selected_input']['snapshot_ids'].reverse()
        self.assertEqual([], self.check_receipt())
        calls = []
        def disclosure(*args):
            calls.append(args[1]['schema_id'])
            return ['revoked'] if args[1] is self.receipt else []
        result = validate_verification_receipt(self.original, self.receipt,
            resolve_record=self.reader, verify_source_custody=self.mock_custody,
            verify_engine_outcome=lambda *_: [], verify_receipt_scope=self.mock_scope,
            check_current_disclosure=disclosure)
        self.assertIn('current_disclosure:revoked', result)
        self.assertEqual(self.receipt['schema_id'], calls[-1])

    def test_catalog_in_full_server_nonempty_project_sets_and_set_order(self):
        originals = json.loads((ROOT / 'Plans/backup_restore_system_contract_fixtures.json').read_text())['valid']
        manifest = copy.deepcopy(next(x['value'] for x in originals if x['definition'] == 'backup_manifest'))
        binding = copy.deepcopy(next(x['value'] for x in originals if x['name'] == 'catalog_repository_is_separate'))
        run = self.sources['origin']
        for key in ('backup_id', 'capture_set_id', 'backup_type', 'project_ids', 'project_vault_ids', 'repository_snapshot_refs', 'portable_secret_envelope_id'):
            run[key] = copy.deepcopy(manifest[key])
        run['project_ids'].reverse()
        run['project_vault_ids'].reverse()
        run['catalog_revision'] = 8
        run['repository_binding_ids'] = [binding['repository_binding_id']]
        run['destination_attempts'][0]['repository_id'] = binding['repository_id']
        self.sources['repository_binding'] = binding
        self.sources['manifest'] = manifest
        self.original['selected_input']['repository_id'] = binding['repository_id']
        self.resolution['operation_binding'] = copy.deepcopy(self.original)
        self.resolution['selection']['repository_id'] = binding['repository_id']
        d = self.resolution['resolved_source']
        for key in ('repository_binding_id', 'boundary_kind', 'project_id', 'project_vault_id'):
            d[key] = binding[key]
        for key in ('backup_id', 'capture_set_id', 'manifest_id', 'manifest_sha256'):
            d[key] = manifest[key]
        d['repository_snapshot_ref'] = manifest['repository_snapshot_refs'][0]
        self.authenticated = copy.deepcopy(self.resolution)
        self.assertEqual([], self.check_resolution())


if __name__ == '__main__':
    unittest.main()
