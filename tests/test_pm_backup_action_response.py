"""Current-shape admission and actual-domain response joins, not native proof."""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_backup_action_semantics as SEM


class BackupActionResponseTests(unittest.TestCase):
    def setUp(self):
        pack = json.loads((ROOT / 'Plans/backup_restore_system_contract_fixtures.json').read_text())
        self.valid = pack['valid']
        self.join = copy.deepcopy(next(row['value'] for row in self.valid if row['name'] == 'backup_update_join_applied'))
        self.original = self.join['original_operation']
        self.request = {key: value for key, value in self.original.items() if key not in ('operation_id', 'selected_input')}
        self.request.update(schema_id='pm.backup_restore_system.action_request.v2', schema_version='2.0.0',
                            action_input=copy.deepcopy(self.original['selected_input']))
        self.response = dict(schema_id='pm.backup_restore_system.action_result.v2', schema_version='2.0.0',
            command_id=self.original['command_id'], command_instance_id=self.original['command_instance_id'],
            outcome='completed', original_operation=copy.deepcopy(self.original), domain_result_kind='destination_update',
            domain_result_ref='destination-result:original', observable_work_ref=None,
            currentness_ref='currentness:disclosure', currentness_sha256='2' * 64,
            error_ref=None, disabled_reason=None, replayed=False)

    def check(self, **overrides):
        def domain(kind, original, record):
            self.assertEqual('destination_update', kind)
            joined = copy.deepcopy(self.join)
            joined['original_operation'] = original
            joined['resolved_metadata'] = record
            return SEM.backup_action_semantic_failures('backup_destination_update_validation_input', joined)
        args = dict(resolve_original_operation=lambda _: self.original,
                    resolve_domain_result=lambda *args: self.join['resolved_metadata'],
                    validate_domain_result=domain, verify_response_admission=lambda *args: [],
                    check_current_disclosure=lambda *args: [])
        args.update(overrides)
        return SEM.validate_action_response(self.request, self.response, **args)

    def test_fresh_response_consumes_real_domain_relation_validator(self):
        self.assertEqual([], self.check())

    def test_current_union_preserves_other_37_and_rejects_four_legacy_shapes(self):
        four = set(SEM._schema()['$defs']['backup_action_request_v2']['properties']['command_id']['enum'])
        seen = set()
        for row in self.valid:
            value = row['value']
            if value.get('schema_id') == 'pm.backup_restore_system.command_request.v1':
                seen.add(value['command_id'])
                errors = SEM.structural_errors('backup_current_command_request', value)
                self.assertEqual(value['command_id'] in four, bool(errors), row['name'])
                self.assertEqual([], SEM.structural_errors('backup_restore_command_request', value))
            elif value.get('schema_id') == 'pm.backup_restore_system.action_request.v2':
                self.assertEqual([], SEM.structural_errors('backup_current_command_request', value))
        self.assertEqual(41, len(seen))
        self.assertEqual(37, len(seen - four))

    def test_replay_keeps_original_operation_despite_fresh_disclosure_invocation(self):
        self.request['command_instance_id'] = self.response['command_instance_id'] = 'command:replay'
        self.request['permission_snapshot_ref'] = 'permission:current-reader'
        self.response['replayed'] = True
        self.assertEqual([], self.check())
        self.response['replayed'] = False
        self.assertIn('backup_response_fresh_original_binding', self.check())

    def test_same_idempotency_cannot_substitute_selection(self):
        self.request['action_input']['patch']['display_name'] = 'Different'
        self.assertIn('backup_response_selected_input', self.check())

    def test_original_and_domain_sources_cannot_be_borrowed(self):
        self.response['original_operation']['command_instance_id'] = 'command:borrowed'
        self.assertIn('backup_response_original_binding', self.check())
        self.response['original_operation'] = copy.deepcopy(self.original)
        self.join['resolved_metadata']['last_update']['before_generation'] = 200
        self.assertIn('backup_response_domain_validation', self.check())

    def test_accepted_is_not_a_completed_domain_result(self):
        self.response.update(outcome='accepted', domain_result_kind=None, domain_result_ref=None,
                             observable_work_ref='work:original')
        self.assertEqual([], self.check())
        self.response['outcome'] = 'completed'
        self.assertIn('backup_response_schema', self.check())

    def test_running_idempotent_retry_can_replay_accepted_without_new_work(self):
        self.request['command_instance_id'] = self.response['command_instance_id'] = 'command:retry-running'
        self.response.update(outcome='accepted', domain_result_kind=None, domain_result_ref=None,
                             observable_work_ref='work:original', replayed=True)
        self.assertEqual([], self.check())
        self.assertIn('backup_response_admission', self.check(
            verify_response_admission=lambda *args: ['original_work_missing']))

    def test_native_dependencies_cannot_be_omitted_or_replace_failure_with_boolean(self):
        with self.assertRaises(TypeError):
            SEM.validate_action_response(self.request, self.response)
        self.assertIn('backup_response_domain_validation_invalid_response', self.check(validate_domain_result=lambda *args: True))
        self.assertIn('backup_response_admission', self.check(verify_response_admission=lambda *args: ['not admitted']))

    def test_missing_historical_result_does_not_reexecute(self):
        def missing(*args):
            raise KeyError('expired original result')
        self.assertIn('backup_response_domain_unavailable', self.check(resolve_domain_result=missing))

    def test_final_disclosure_is_rechecked(self):
        calls = []
        def check(*args):
            calls.append(1)
            return [] if len(calls) == 1 else ['revoked']
        self.assertIn('backup_response_disclosure', self.check(check_current_disclosure=check))
        self.assertEqual(2, len(calls))


if __name__ == '__main__':
    unittest.main()
