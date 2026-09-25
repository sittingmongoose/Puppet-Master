"""Owner-source relation tests; callback doubles are NOT native authority proof."""
import copy
import importlib.util
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_backup_action_semantics as SEM

SPEC = importlib.util.spec_from_file_location('backup_destination_gate', ROOT / 'scripts/pm-new-contracts-verify.py')
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)


class DestinationResultTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = json.loads((ROOT / 'Plans/backup_restore_system_contract_fixtures.json').read_text())
        cls.positives = {row['name']: row['value'] for row in cls.pack['valid']}

    def sample(self, name='applied'):
        return copy.deepcopy(self.positives['backup_update_join_' + name])

    def call_owner(self, value, **overrides):
        outcome = value['resolved_metadata']['last_update']
        states = {outcome['before_state_ref']: value['before_state']}
        if outcome['after_state_ref'] is not None:
            states[outcome['after_state_ref']] = value['after_state']
        args = dict(resolve_original_operation=lambda identity: value['original_operation'],
                    resolve_result_metadata=lambda identity: value['resolved_metadata'],
                    resolve_destination_state=lambda ref: states[ref],
                    validate_record=SEM.structural_errors,
                    verify_original_admission=lambda *args: [],
                    verify_result_derivation=lambda *args: [],
                    check_current_disclosure=lambda *args: [])
        args.update(overrides)
        return SEM.validate_destination_update_result(value['original_operation']['operation_id'], **args)

    def test_positive_joined_records_and_registered_semantics(self):
        selected = [row for row in self.pack['valid'] if row['name'].startswith('backup_update_join_')]
        self.assertEqual(6, len(selected))
        for row in selected:
            with self.subTest(row=row['name']):
                self.assertEqual([], SEM.structural_errors(row['definition'], row['value']))
                self.assertEqual([], GATE.contract_semantic_failures(
                    'Plans/backup_restore_system_contracts.schema.json', row['definition'], row['value']))
                self.assertEqual([], self.call_owner(row['value']))

    def test_negative_fixtures_are_real_shape_or_causal_failures(self):
        selected = [row for row in self.pack['invalid'] if row['name'].startswith('backup_update_reject_')]
        self.assertEqual(22, len(selected))
        for row in selected:
            with self.subTest(row=row['name']):
                value = GATE.materialize_invalid(row, self.positives)
                errors = SEM.structural_errors(row['definition'], value)
                if 'semantic_rule' in row:
                    self.assertEqual([], errors)
                    self.assertIn(row['semantic_rule'], SEM.backup_action_semantic_failures(row['definition'], value))
                else:
                    self.assertTrue(errors)

    def test_original_authority_and_result_proof_are_independent_required_checks(self):
        for callback, expected in (
                ('verify_original_admission', 'backup_update_original_admission'),
                ('verify_result_derivation', 'backup_update_result_derivation'),
                ('check_current_disclosure', 'backup_update_disclosure')):
            with self.subTest(callback=callback):
                self.assertIn(expected, self.call_owner(self.sample(), **{callback: lambda *args: ['refused']}))
                self.assertIn(expected + '_invalid_response', self.call_owner(self.sample(), **{callback: lambda *args: True}))

    def test_result_proof_rejects_borrowed_test_even_when_ref_strings_match(self):
        value = self.sample()
        for state in (value['before_state'], value['after_state'], value['resolved_metadata']['destination']):
            state.update(state='ready', last_test_receipt_ref='test:old-destination')
        value['original_operation']['selected_input']['patch']['location_ref'] = 'location:new'
        value['resolved_metadata']['last_update']['original_operation'] = copy.deepcopy(value['original_operation'])
        value['after_state']['location_ref'] = value['resolved_metadata']['destination']['location_ref'] = 'location:new'

        def actual_owner_refusal(original, before, after, result):
            self.assertEqual(before['last_test_receipt_ref'], after['last_test_receipt_ref'])
            self.assertNotEqual(before['location_ref'], after['location_ref'])
            return ['original_test_scope_not_applicable']

        self.assertIn('backup_update_result_derivation', self.call_owner(
            value, verify_result_derivation=actual_owner_refusal))

    def test_recheck_disclosure_after_helpers(self):
        calls = []

        def disclosure(*args):
            calls.append('read')
            return [] if len(calls) == 1 else ['revoked_after_helper']

        self.assertIn('backup_update_disclosure', self.call_owner(self.sample(), check_current_disclosure=disclosure))
        self.assertEqual(2, len(calls))

    def test_missing_original_source_never_reexecutes(self):
        def missing(*args):
            raise KeyError('expired original source')
        for callback in ('resolve_original_operation', 'resolve_result_metadata', 'resolve_destination_state'):
            with self.subTest(callback=callback):
                self.assertTrue(any('unavailable' in failure for failure in self.call_owner(
                    self.sample(), **{callback: missing})))

    def test_callbacks_are_not_optional(self):
        with self.assertRaises(TypeError):
            SEM.validate_destination_update_result('operation:destination-update')

    def test_no_change_can_refresh_derived_metadata_without_forced_increment(self):
        value = self.sample('no_change_derived_refresh')
        self.assertNotEqual(value['before_state'], value['after_state'])
        self.assertEqual(value['before_state']['destination_generation'], value['after_state']['destination_generation'])
        self.assertEqual([], self.call_owner(value))

    def test_applied_result_preserves_actual_nonunit_generation_step(self):
        value = self.sample()
        self.assertEqual(7, value['after_state']['destination_generation'] - value['before_state']['destination_generation'])
        self.assertEqual([], self.call_owner(value))


if __name__ == '__main__':
    unittest.main()
