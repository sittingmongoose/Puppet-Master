"""Cross-owner transport joins over actual authored domain fixture records.

Calls the domain relation validators, never an empty domain-validation callback.
Existing test readers and authority doubles remain explicitly static; these
tests prove no original-source authentication, native effects or persistence.
"""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
sys.path.insert(0, str(ROOT / 'tests'))
import pm_backup_action_semantics as ACTION
import pm_backup_snapshot_semantics as SNAPSHOT
import pm_backup_drill_semantics as DRILL
import pm_backup_compare_semantics as COMPARE
import test_pm_backup_snapshot_results as snapshot_fixtures
import test_pm_backup_drill_results as drill_fixtures


class BackupCrossOwnerResponseTests(unittest.TestCase):
    def join(self, original, record, kind, outcome, domain_validator, *, replay=False):
        request = {key: copy.deepcopy(value) for key, value in original.items()
                   if key not in ('operation_id', 'selected_input')}
        request.update(schema_id='pm.backup_restore_system.action_request.v2',
                       schema_version='2.0.0', action_input=copy.deepcopy(original['selected_input']))
        response = dict(schema_id='pm.backup_restore_system.action_result.v2', schema_version='2.0.0',
            command_id=original['command_id'], command_instance_id=original['command_instance_id'],
            outcome=outcome, original_operation=copy.deepcopy(original), domain_result_kind=kind,
            domain_result_ref='fixture:immutable-domain-result', observable_work_ref=None,
            currentness_ref='fixture:current-disclosure', currentness_sha256='2' * 64,
            error_ref=None if outcome == 'completed' else 'fixture:actual-failure',
            disabled_reason=None, replayed=replay)
        if replay:
            request['command_instance_id'] = response['command_instance_id'] = 'command:later-disclosure'
            request['permission_snapshot_ref'] = 'permission:current-reader'

        def domain(actual_kind, actual_original, actual_record):
            if actual_kind != kind or actual_original != original:
                return ['fixture_unexpected_domain_binding']
            return domain_validator(actual_original, actual_record)

        return ACTION.validate_action_response(request, response,
            resolve_original_operation=lambda ref: original,
            resolve_domain_result=lambda selected_kind, ref: record,
            validate_domain_result=domain,
            verify_response_admission=lambda *args: [],  # explicit authority double
            check_current_disclosure=lambda *args: [])  # explicit disclosure double

    def verification(self):
        helper = snapshot_fixtures.SnapshotResults()
        helper.setUp()

        def validate(original, record):
            return SNAPSHOT.validate_verification_receipt(original, record,
                resolve_record=helper.reader, verify_source_custody=helper.mock_custody,
                verify_engine_outcome=lambda *args: [],  # explicit engine-proof double
                verify_receipt_scope=helper.mock_scope, check_current_disclosure=lambda *args: [])
        return helper, validate

    def drill(self, index):
        helper = drill_fixtures.DrillResults()
        helper.setUp()
        helper.receipt = copy.deepcopy(helper.f['valid'][index]['value'])
        helper.expected = copy.deepcopy(helper.receipt)

        def validate(original, record):
            return DRILL.validate_drill_receipt(original, record, **helper.callbacks())
        return helper, validate

    def test_verification_failed_member_prevents_completed_transport(self):
        helper, validate = self.verification()
        self.assertEqual([], self.join(helper.original, helper.receipt, 'verification', 'failed', validate))
        self.assertIn('backup_response_domain_outcome',
            self.join(helper.original, helper.receipt, 'verification', 'completed', validate))
        self.assertEqual([], self.join(helper.original, helper.receipt, 'verification', 'failed', validate, replay=True))

    def test_verification_domain_validator_rejects_missing_selected_member(self):
        helper, validate = self.verification()
        helper.receipt['outcomes'].pop()
        self.assertIn('backup_response_domain_validation',
            self.join(helper.original, helper.receipt, 'verification', 'failed', validate))

    def test_completed_drill_and_cleanup_obligation_have_distinct_transport(self):
        for index, outcome in ((1, 'completed'), (2, 'partial')):
            with self.subTest(index=index):
                helper, validate = self.drill(index)
                self.assertEqual('passed', helper.receipt['verification_status'])
                self.assertEqual([], self.join(helper.original, helper.receipt, 'isolated_drill', outcome, validate))
                self.assertEqual([], self.join(helper.original, helper.receipt, 'isolated_drill', outcome, validate, replay=True))
                if outcome == 'partial':
                    self.assertIn('backup_response_domain_outcome',
                        self.join(helper.original, helper.receipt, 'isolated_drill', 'completed', validate))

    def test_drill_domain_validator_rejects_outside_target_effect(self):
        helper, validate = self.drill(1)
        helper.receipt['effects'][0]['target_identity_ref'] = 'target:outside-admission'
        self.assertIn('backup_response_domain_validation',
            self.join(helper.original, helper.receipt, 'isolated_drill', 'completed', validate))

    def test_compare_owners_and_unavailable_result_mapping(self):
        pack = json.loads((ROOT / 'Plans/backup_compare_result_contract_fixtures.json').read_text())
        for row in pack['valid']:
            with self.subTest(case=row['name']):
                wrapper = copy.deepcopy(row['value'])
                original, record = wrapper['original_operation'], wrapper['result']

                def validate(binding, result):
                    selected = copy.deepcopy(wrapper)
                    selected['original_operation'], selected['result'] = binding, result
                    return COMPARE.backup_compare_semantic_failures('backup_compare_validation_input', selected)

                outcome = 'failed' if record['status'] == 'unavailable' else record['status']
                self.assertEqual([], self.join(original, record, 'compare', outcome, validate))
                self.assertEqual([], self.join(original, record, 'compare', outcome, validate, replay=True))
                if outcome != 'completed':
                    self.assertIn('backup_response_domain_outcome', self.join(original, record, 'compare', 'completed', validate))

    def test_compare_domain_validator_rejects_borrowed_content(self):
        pack = json.loads((ROOT / 'Plans/backup_compare_result_contract_fixtures.json').read_text())
        wrapper = copy.deepcopy(pack['valid'][0]['value'])
        wrapper['target_read']['operation_binding']['operation_id'] = 'operation:foreign'

        def validate(binding, result):
            return COMPARE.backup_compare_semantic_failures('backup_compare_validation_input', wrapper)

        self.assertIn('backup_response_domain_validation', self.join(
            wrapper['original_operation'], wrapper['result'], 'compare', 'completed', validate))


if __name__ == '__main__':
    unittest.main()
