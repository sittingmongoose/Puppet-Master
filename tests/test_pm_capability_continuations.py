"""Static CP004 owner-join tests; fabricated adapters are not native proof."""
import copy
import json
from pathlib import Path
import sys
import unittest

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_capability_continuation_semantics import (
    OwnerValue, structural_errors, fixture_dependencies,
    capability_continuation_semantic_failures, validate_capability_settlement)


class CapabilityContinuationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = json.loads((ROOT / 'Plans/capability_provisioning_continuation_contract_fixtures.json').read_text())

    def value(self, name='existing_installation'):
        return copy.deepcopy(next(r['value'] for r in self.pack['valid'] if r['name'] == name))

    def check(self, value, **overrides):
        deps = fixture_dependencies(value)
        deps.update(overrides)
        return validate_capability_settlement(value['settlement']['settlement_ref'], **deps)

    def test_schema_and_authored_fixtures(self):
        Draft202012Validator.check_schema(json.loads((ROOT / 'Plans/capability_provisioning_continuation_contracts.schema.json').read_text()))
        for group in ('valid', 'invalid'):
            for row in self.pack[group]:
                with self.subTest(case=row['name']):
                    errors = structural_errors(row['definition'], row['value']) or capability_continuation_semantic_failures(row['definition'], row['value'])
                    self.assertEqual(bool(errors), group == 'invalid', errors)
                    if 'semantic_rule' in row:
                        self.assertIn(row['semantic_rule'], errors)

    def test_off_allows_existing_not_new_installation_or_connection(self):
        self.assertEqual(self.check(self.value('off_existing_ready')), [])
        for kind in ('installation', 'connection'):
            value = self.value('provisioned_' + kind)
            value['waiter']['effective_mode'] = value['currentness']['effective_mode'] = 'Off'
            self.assertIn('capability_off_provisioning', self.check(value))

    def test_connection_needs_actual_effect_not_fabricated_installation(self):
        value = self.value('provisioned_connection')
        self.assertIsNone(value['operation']['installation_operation_ref'])
        self.assertEqual(self.check(value), [])
        deps = fixture_dependencies(value)
        original = deps['resolve_owner_record']
        def missing_effect(kind, ref):
            if kind == 'effect':
                raise KeyError(ref)
            return original(kind, ref)
        self.assertIn('capability_readiness_source_unavailable', self.check(value, resolve_owner_record=missing_effect))

    def test_each_actual_owner_proof_is_mandatory_and_fail_closed(self):
        value = self.value()
        for name in ('verify_original_admission', 'verify_readiness', 'verify_origin_snapshot', 'verify_waiter_effect', 'check_disclosure_fence'):
            with self.subTest(owner=name):
                self.assertTrue(self.check(value, **{name: lambda *args: ['actual_owner_refused']}))
                self.assertTrue(self.check(value, **{name: lambda *args: True}))
                deps = fixture_dependencies(value)
                del deps[name]
                with self.assertRaises(TypeError):
                    validate_capability_settlement('settlement:1', **deps)

    def test_missing_original_never_accepts_caller_container(self):
        value = self.value()
        deps = fixture_dependencies(value)
        original = deps['resolve_owner_record']
        for missing in ('settlement', 'waiter', 'demand', 'operation', 'currentness'):
            def read(kind, ref):
                if kind == missing:
                    raise KeyError(ref)
                return original(kind, ref)
            self.assertIn('capability_original_source_unavailable', self.check(value, resolve_owner_record=read))
        self.assertIn('capability_original_source_unavailable', self.check(value, resolve_owner_record=lambda *args: value))

    def test_actual_generation_and_verification_payload_are_bound(self):
        value = self.value()
        original = fixture_dependencies(value)['resolve_owner_record']
        for target in ('demand', 'verification', 'subject', 'effect'):
            if target == 'effect':
                value = self.value('provisioned_installation')
                original = fixture_dependencies(value)['resolve_owner_record']
            def changed(kind, ref):
                record = original(kind, ref)
                return OwnerValue(ref, record.generation + 1, record.value) if kind == target else record
            self.assertTrue(self.check(value, resolve_owner_record=changed))

    def test_detaching_one_waiter_does_not_change_shared_operation(self):
        active = self.value()
        detached = self.value()
        detached['currentness']['waiter_state'] = 'detached'
        detached['settlement'].update(outcome='detached', reason='waiter_detached', readiness_result_ref=None, continuation_result_ref=None)
        detached['readiness'] = None
        shared_before = copy.deepcopy(active['operation'])
        self.assertEqual(self.check(detached), [])
        self.assertEqual(self.check(active), [])
        self.assertEqual(detached['operation'], shared_before)
        self.assertEqual(active['operation'], shared_before)
        detached['currentness']['waiter_state'] = 'active'
        self.assertIn('capability_false_detach', self.check(detached))

    def test_failure_settlement_cannot_replace_ready_phase(self):
        for phase in ('blocked', 'failed', 'cancelled', 'recovery_required'):
            value = self.value()
            value['settlement'].update(outcome=phase, reason='operation_not_ready', readiness_result_ref=None, continuation_result_ref=None)
            value['readiness'] = None
            self.assertIn('capability_failure_phase', self.check(value))
            value['operation']['phase'] = phase
            self.assertEqual(self.check(value), [])
            value['operation']['terminal_at_utc'] = None
            self.assertIn('capability_operation_time', self.check(value))

    def test_historical_replay_verifies_original_without_dispatch(self):
        value = self.value()
        before = copy.deepcopy(value)
        verified = []
        def original_effect(*args):
            verified.append(args[-1]['continuation_result_ref'])
            return []
        self.assertEqual(self.check(value, verify_waiter_effect=original_effect), [])
        self.assertEqual(self.check(value, verify_waiter_effect=original_effect), [])
        self.assertEqual(verified, ['continuation-result:1', 'continuation-result:1'])
        self.assertEqual(value, before)
        self.assertIn('capability_disclosure', self.check(value, check_disclosure_fence=lambda *args: ['current_permission_denied']))

    def test_failed_acquisition_rolled_back_is_not_capability_ready(self):
        value = self.value()
        value['operation']['phase'] = 'rolled_back'
        value['readiness'] = None
        value['settlement'].update(outcome='failed', reason='operation_not_ready', readiness_result_ref=None, continuation_result_ref=None)
        self.assertEqual(self.check(value), [])
        self.assertEqual(value['operation']['phase'], 'rolled_back')
        value['settlement']['outcome'] = 'cancelled'
        self.assertIn('capability_failure_phase', self.check(value))

    def test_final_fence_detects_source_change_during_proof(self):
        value = self.value()
        calls = []
        def fence(*args):
            calls.append(1)
            return [] if len(calls) == 1 else ['source_changed_during_validation']
        self.assertIn('capability_disclosure', self.check(value, check_disclosure_fence=fence))
        self.assertEqual(len(calls), 2)

    def test_no_success_from_presence_of_unverified_receipt(self):
        value = self.value()
        self.assertIn('capability_waiter_effect', self.check(value, verify_waiter_effect=lambda *args: ['receipt_owner_mismatch']))
        self.assertIn('capability_readiness_proof', self.check(value, verify_readiness=lambda *args: ['verification_failed']))
        value['settlement'].update(outcome='ready_without_resume', reason='admission_refused', continuation_result_ref=None)
        self.assertEqual(self.check(value), [])
        self.assertIn('capability_waiter_effect', self.check(value, verify_waiter_effect=lambda *args: ['refusal_not_authentic']))


if __name__ == '__main__':
    unittest.main()
