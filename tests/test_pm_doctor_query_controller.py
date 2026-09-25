"""Finite Doctor contract tests with explicitly mocked original owner custody."""
import copy
import json
from pathlib import Path
import sys
import unittest
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_doctor_query_semantics import (structural_errors, doctor_query_semantic_failures,
                                       validate_doctor_batch, _schemas)


class DoctorQueryController(unittest.TestCase):
    def setUp(self):
        self.fixture = json.loads((ROOT / 'Plans/doctor_query_controller_contract_fixtures.json').read_text())
        values = {c['definition']: c['value'] for c in self.fixture['valid']}
        self.batch = values['doctor_batch_request']
        self.result = values['doctor_batch_result']
        self.query = values['doctor_owner_query_request']
        self.decision = values['doctor_read_admission']
        self.query_result = values['doctor_owner_query_result']
        self.owner_request = values['backup_repository_read_request']
        self.owner_result = self.fixture['static_owner_sources']['repository_binding']
        self.finding = self.fixture['static_owner_sources']['finding']
        self.freeze()

    def freeze(self):
        # Independent mock owner history, not caller booleans or a runtime adapter.
        self.original_batch = copy.deepcopy(self.batch)
        self.original_decision = copy.deepcopy(self.decision)
        self.original_request = copy.deepcopy(self.owner_request)
        self.original_result = copy.deepcopy(self.owner_result)
        self.original_query_result = copy.deepcopy(self.query_result)
        self.original_finding = copy.deepcopy(self.finding)

    def resolve(self, kind, ref):
        refs = {
            ('doctor_batch_request', 'doctor-batch:repository'): self.batch,
            ('doctor_batch_result', 'doctor-batch-result:repository'): self.result,
            ('doctor_owner_query_request', 'query-ref:repository'): self.query,
            ('doctor_read_admission', 'permission-ref:doctor-read'): self.decision,
            ('doctor_owner_query_result', 'query-result-ref:repository'): self.query_result,
            ('owner_request', 'owner-query:repository-read'): self.owner_request,
            ('owner_result', 'owner-result:repository-metadata'): self.owner_result,
            ('doctor_finding_projection', 'finding-ref:repository'): self.finding,
        }
        return refs[(kind, ref)]

    def descriptor(self, check, revision):
        matches = [m['descriptor'] for m in self.original_batch['members']
                   if m['descriptor']['check_id'] == check and m['descriptor']['descriptor_revision'] == revision]
        if len(matches) != 1:
            raise KeyError(check)
        return matches[0]

    def validate_owner(self, schema_ref, value):
        # Genuine complete existing schema resolution, not a mock shape Boolean.
        schema, registry = _schemas()
        return [e.message for e in Draft202012Validator(
            {'$schema': schema['$schema'], '$ref': schema_ref},
            registry=registry, format_checker=FormatChecker()).iter_errors(value)]

    def callbacks(self):
        def selected(batch):
            return [] if batch == self.original_batch else ['original_selection_changed']
        def admitted(batch, member, query, decision):
            return [] if decision == self.original_decision else ['not_original_permission']
        def read(batch, member, query, request, result, owner_result):
            return [] if request == self.original_request and result == self.original_query_result and owner_result == self.original_result else ['not_actual_owner_result']
        def disposition(batch, member, outcome, query, result, finding):
            return [] if finding is None or finding == self.original_finding else ['not_actual_projection']
        return dict(resolve_record=self.resolve, resolve_descriptor=self.descriptor,
            verify_frozen_selection=selected, validate_owner_value=self.validate_owner,
            verify_read_admission=admitted, verify_owner_read=read,
            verify_member_disposition=disposition, verify_batch_controls=lambda *_: [],
            check_current_disclosure=lambda *_: [])

    def check(self, **overrides):
        callbacks = self.callbacks()
        callbacks.update(overrides)
        return validate_doctor_batch('doctor-batch:repository', 'doctor-batch-result:repository', **callbacks)

    def test_positive_shapes_and_actual_typed_owner_join(self):
        for case in self.fixture['valid']:
            with self.subTest(case=case['name']):
                self.assertEqual([], structural_errors(case['definition'], case['value']))
                self.assertEqual([], doctor_query_semantic_failures(case['definition'], case['value']))
        self.assertEqual([], self.check())
        self.assertEqual('completed', self.result['status'])
        self.assertEqual('unknown', self.finding['status'])
        self.assertIsNone(self.decision['scope']['project_id'])

    def test_frozen_members_cannot_disappear_duplicate_or_expand(self):
        self.result['outcomes'] = []
        self.result['status'] = 'no_applicable_checks'
        self.assertIn('not_exact_frozen_membership', self.check())
        self.setUp()
        self.result['outcomes'].append(copy.deepcopy(self.result['outcomes'][0]))
        self.assertIn('duplicate_member_outcome', self.check())
        self.setUp()
        self.result['outcomes'][0]['member_id'] = 'member:foreign'
        self.assertIn('not_exact_frozen_membership', self.check())

    def test_descriptor_schema_and_target_cannot_be_borrowed(self):
        self.batch['members'][0]['descriptor']['result_schema_ref'] = 'schema:caller-replacement'
        self.assertIn('descriptor_original_mismatch', self.check(validate_owner_value=lambda *_: []))
        self.setUp()
        self.owner_request['repository_id'] = 'repository:other'
        self.assertIn('owner_read_repository_id', self.check())
        self.setUp()
        self.owner_result['repository_binding_id'] = 'binding:other'
        self.assertIn('backup_read_result_repository_binding_id', self.check())

    def test_owner_metadata_identity_and_currentness_not_string_presence(self):
        self.owner_result['currentness_ref'] = 'currentness:other'
        self.assertIn('backup_read_currentness_mismatch', self.check())
        self.setUp()
        self.query_result['member_id'] = 'member:other'
        self.assertIn('query_result_member_id', self.check())
        self.setUp()
        self.owner_result['state'] = 'invented_healthy'
        self.assertTrue(any(e.startswith('owner_result_shape:') for e in self.check()))

    def test_foreign_actor_scope_and_currentness_admission(self):
        for key, val in [('actor_ref', 'actor:other'), ('descriptor_revision', 2), ('expected_owner_generation', 8), ('expected_cache_generation', 4)]:
            with self.subTest(key=key):
                self.setUp()
                self.decision[key] = val
                self.assertIn('admission_' + key, self.check())
        self.setUp()
        self.decision['scope']['server_id'] = 'server:other'
        self.assertIn('admission_scope', self.check())

    def test_denied_prompt_expired_and_revoked_permission(self):
        for decision in ('deny', 'prompt_human'):
            self.setUp()
            self.decision['decision'] = decision
            self.decision['reason_ref'] = 'reason:refused'
            self.assertIn('query_without_valid_admission', self.check())
        self.setUp()
        self.decision['expires_at_utc'] = '2026-09-25T12:00:01Z'
        self.assertIn('query_without_valid_admission', self.check())
        self.setUp()
        self.assertIn('read_admission:revoked', self.check(verify_read_admission=lambda *_: ['revoked']))

    def test_budget_and_late_generation_cannot_claim_completed(self):
        self.query['deadline_utc'] = '2026-09-25T12:00:09Z'
        self.assertIn('query_exceeds_descriptor_budget', self.check())
        self.setUp()
        self.query_result['observed_owner_generation'] = 8
        self.assertIn('completed_member_unproved', self.check())
        self.setUp()
        self.finding['cache_generation'] = 4
        self.assertIn('finding_generation_mismatch', self.check())

    def test_stop_scheduling_does_not_cancel_or_permit_later_start(self):
        self.result['controls'] = [dict(control_id='control:stop', action='stop_scheduling', member_id=None,
            query_ref=None, outcome='applied', recorded_at_utc='2026-09-25T12:00:00Z', evidence_ref='evidence:stop')]
        self.assertIn('query_started_after_scheduling_stop', self.check())
        self.result['controls'][0]['recorded_at_utc'] = '2026-09-25T12:00:02Z'
        self.assertEqual([], self.check())

    def test_requested_cancel_is_not_owner_cancel(self):
        self.result['outcomes'][0]['status'] = 'cancelled'
        self.result['status'] = 'cancelled'
        self.assertIn('cancelled_member_without_owner_cancellation', self.check())
        self.setUp()
        self.result['controls'] = [dict(control_id='control:cancel', action='cancel_member', member_id='doctor-member:repository',
            query_ref='query-ref:repository', outcome='unsupported', recorded_at_utc='2026-09-25T12:00:01Z', evidence_ref='evidence:cancel-unsupported')]
        self.assertEqual([], self.check())

    def test_viewer_detach_is_not_cancellation(self):
        self.assertEqual('detach_viewer', self.result['controls'][0]['action'])
        self.assertEqual([], self.check())
        self.result['controls'][0]['outcome'] = 'owner_cancelled'
        self.assertIn('global_control_wrong_shape', self.check())

    def test_partial_members_retained_without_health_claim(self):
        extra = copy.deepcopy(self.batch['members'][0])
        extra['member_id'] = 'doctor-member:unsupported'
        extra['descriptor']['check_id'] = 'doctor.backup.repository.other'
        extra['descriptor']['support_state'] = 'unsupported'
        self.batch['members'].append(extra)
        self.result['outcomes'].append(dict(member_id=extra['member_id'], status='unsupported', query_ref=None,
            result_ref=None, finding_ref=None, disposition_evidence_ref='support:owner-unsupported'))
        self.result['status'] = 'partial'
        self.freeze()
        self.assertEqual([], self.check())
        self.result['status'] = 'completed'
        self.assertIn('batch_completion_mismatch', self.check())
        self.assertIn('member_disposition:missing_owner_adapter_is_not_unsupported',
            self.check(verify_member_disposition=lambda *_: ['missing_owner_adapter_is_not_unsupported']))

    def test_empty_applicable_selection_explicit_not_healthy(self):
        self.batch['members'] = []
        self.result['outcomes'] = []
        self.result['status'] = 'no_applicable_checks'
        self.freeze()
        self.assertEqual([], self.check())
        self.result['status'] = 'completed'
        self.assertIn('empty_batch_not_health', self.check())

    def test_actual_finding_scope_and_source_cannot_be_substituted(self):
        self.finding['project_id'] = 'project:foreign'
        self.assertIn('finding_project_id', self.check())
        self.setUp()
        self.finding['last_known_result_ref'] = 'result:unrelated'
        self.assertIn('finding_actual_result_mismatch', self.check())
        self.setUp()
        self.finding['status'] = 'healthy'
        self.assertIn('member_disposition:not_actual_projection', self.check())

    def test_final_disclosure_and_native_callbacks_required(self):
        self.assertIn('current_disclosure:revoked', self.check(check_current_disclosure=lambda *_: ['revoked']))
        self.assertIn('owner_read_invalid_response', self.check(verify_owner_read=lambda *_: True))
        callbacks = self.callbacks()
        del callbacks['verify_read_admission']
        with self.assertRaises(TypeError):
            validate_doctor_batch('doctor-batch:repository', 'doctor-batch-result:repository', **callbacks)

    def test_scoped_target_and_missing_schema_fail_closed(self):
        self.batch['members'][0]['target']['server_id'] = 'server:foreign'
        self.assertIn('selected_target_outside_server_scope', self.check())
        self.setUp()
        self.batch['members'][0]['descriptor']['result_schema_ref'] = 'schema:missing'
        self.assertIn('owner_result_shape_unavailable', self.check())

    def test_missing_owner_query_fields_return_failures_not_exception(self):
        for key in ('repository_binding_id', 'expected_currentness_ref'):
            with self.subTest(key=key):
                self.setUp()
                del self.owner_request[key]
                self.assertTrue(any(e.startswith('owner_request_shape:') for e in self.check()))


if __name__ == '__main__':
    unittest.main()
