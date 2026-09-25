"""Fabricated metadata/proof adapters only; no native pairing or secret handling."""
import copy
import json
from pathlib import Path
import subprocess
import sys
import unittest
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_server_pairing_issuance_semantics import (
    structural_errors, pairing_issuance_semantic_failures, fixture_dependencies,
    validate_issuance_result, validate_protected_display)


class PairingIssuanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = json.loads((ROOT / 'Plans/server_pairing_issuance_contract_fixtures.json').read_text())
        cls.legacy = json.loads((ROOT / 'Plans/server_system_contract_fixtures.json').read_text())

    def value(self, name='issue'):
        return copy.deepcopy(next(r['value'] for r in self.pack['valid'] if r['name'] == name))

    def check(self, value, **overrides):
        dependencies = fixture_dependencies(value)
        dependencies.update(overrides)
        return validate_issuance_result(value['result']['result_ref'], **dependencies)

    def display(self, state=None, **overrides):
        state = state or self.value()['after']
        request = dict(schema_id='pm.server_pairing.protected_display_request.v1', schema_version='1.0.0',
            request_ref='display:1', server_id=state['server_id'], server_fingerprint=state['server_fingerprint'],
            pairing_session_id=state['pairing_session_id'], expected_generation=state['generation'],
            requesting_client_id='client:viewer', audience=copy.deepcopy(state['audience']),
            client_access_policy_id=state['client_access_policy_id'], policy_generation=state['policy_generation'],
            process_instance_ref='process:1', protected_channel_ref='channel:1', view='qr',
            requested_at_utc='2026-09-25T12:00:02Z')
        dependencies = dict(resolve_display_request=lambda _: request,
            resolve_current_invitation=lambda *_: state, now_utc='2026-09-25T12:01:00Z',
            verify_protected_read=lambda *_: [], final_display_fence=lambda *_: [])
        dependencies.update(overrides)
        return request, dependencies

    def test_schema_and_authored_pairs(self):
        Draft202012Validator.check_schema(json.loads((ROOT / 'Plans/server_pairing_issuance_contracts.schema.json').read_text()))
        for group in ('valid', 'invalid'):
            for row in self.pack[group]:
                with self.subTest(case=row['name']):
                    errors = structural_errors(row['definition'], row['value']) or pairing_issuance_semantic_failures(row['definition'], row['value'])
                    self.assertEqual(bool(errors), group == 'invalid', errors)
                    if 'semantic_rule' in row:
                        self.assertIn(row['semantic_rule'], errors)

    def test_storage_classification_adds_no_physical_custody(self):
        registry = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
        before = json.loads(subprocess.check_output([
            'git', '-C', str(ROOT), 'show',
            'bad5718eede2686cc573cbc200c771f232a45815:Plans/storage_value_registry.json',
        ], text=True))
        self.assertEqual(registry['families'], before['families'])
        self.assertEqual(registry['retention_policies'], before['retention_policies'])
        added = {row['disposition_id']: row for row in registry['contract_family_dispositions']
                 if row['disposition_id'].startswith('scd.server_pairing.')}
        self.assertEqual(set(added), {'scd.server_pairing.issuance_transport.v1',
                                      'scd.server_pairing.issuance_custody.v1'})
        self.assertEqual([row for row in registry['contract_family_dispositions']
                          if row['disposition_id'] not in added], before['contract_family_dispositions'])
        transport = added['scd.server_pairing.issuance_transport.v1']
        custody = added['scd.server_pairing.issuance_custody.v1']
        self.assertEqual(transport['physical_family_status'], 'not_applicable_nonpersisted')
        self.assertEqual(custody['physical_family_status'], 'physical_family_registration_pending')
        self.assertEqual(transport['existing_family_refs'], [])
        self.assertEqual(custody['existing_family_refs'], [])
        self.assertEqual(set(transport['record_kinds'] + custody['record_kinds']), {
            'pm.server_pairing.issuance_request.v1', 'pm.server_pairing.protected_display_request.v1',
            'pm.server_pairing.invitation_state.v1', 'pm.server_pairing.issuance_result.v1'})
        schema = json.loads((ROOT / 'Plans/storage_value_registry.schema.json').read_text())
        self.assertEqual(list(Draft202012Validator(schema).iter_errors(registry)), [])

    def test_original_resolution_and_proofs_are_mandatory(self):
        value = self.value()
        self.assertEqual(self.check(value), [])
        self.assertEqual(self.check(value, resolve_record=lambda *_: None), ['original_pairing_source_unavailable'])
        for name in ('verify_original_admission', 'verify_transition', 'verify_pairing_completion', 'check_current_disclosure'):
            deps = fixture_dependencies(value)
            del deps[name]
            with self.assertRaises(TypeError):
                validate_issuance_result('result:1', **deps)
        for name in ('verify_original_admission', 'verify_transition', 'check_current_disclosure'):
            self.assertTrue(self.check(value, **{name: lambda *_: ['owner_refused']}))
            self.assertTrue(self.check(value, **{name: lambda *_: True}))

    def test_replacement_binds_whole_original_without_fixed_increment(self):
        value = self.value('replace')
        self.assertEqual(value['after']['generation'] - value['before']['generation'], 2)
        self.assertEqual(self.check(value), [])
        for field in ('audience', 'client_access_policy_id', 'server_fingerprint'):
            changed = copy.deepcopy(value)
            if field == 'audience':
                changed['after'][field]['generation'] += 1
            else:
                changed['after'][field] = 'e' * 64
            self.assertTrue(self.check(changed))
        self.assertIn('owner_transition:predecessor_not_retired',
            self.check(value, verify_transition=lambda *_: ['predecessor_not_retired']))

    def test_expired_or_consumed_invitation_cannot_be_cancelled_as_active(self):
        value = self.value('cancel')
        value['result']['settled_at_utc'] = '2026-09-25T12:10:00Z'
        self.assertIn('effect_after_expiry', self.check(value))
        value = self.value('cancel')
        value['before'].update(state='cancelled', terminal_at_utc=value['before']['issued_at_utc'])
        self.assertIn('terminal_from_inactive', self.check(value))

    def test_blocked_and_uncertain_are_not_issuance(self):
        self.assertEqual(self.check(self.value('blocked_issue')), [])
        self.assertEqual(self.check(self.value('uncertain_issue')), [])
        value = self.value()
        value['result'].update(outcome='recovery_required', failure_ref='failure:unknown')
        self.assertIn('uncertain_state_not_fenced', self.check(value))

    def test_historical_replay_never_displays_or_regenerates(self):
        value = self.value()
        original = copy.deepcopy(value)
        for _ in range(2):
            self.assertEqual(self.check(value), [])
        self.assertEqual(value, original)
        self.assertIn('current_disclosure:revoked',
            self.check(value, check_current_disclosure=lambda *_: ['revoked']))

    def test_all_three_views_use_same_current_invitation(self):
        request, deps = self.display()
        for view in ('code', 'link', 'qr'):
            request['view'] = view
            self.assertEqual(validate_protected_display('display:1', **deps), [])
        request['expected_generation'] += 1
        self.assertIn('display_generation', validate_protected_display('display:1', **deps))

    def test_protected_currentness_expiry_and_wrong_server(self):
        request, deps = self.display(now_utc='2026-09-25T12:10:00Z')
        self.assertIn('invitation_not_displayable', validate_protected_display('display:1', **deps))
        request, deps = self.display()
        request['server_id'] = 'server:foreign'
        self.assertIn('display_server_id', validate_protected_display('display:1', **deps))
        for fixture in ('cancel', 'expire'):
            request, deps = self.display(self.value(fixture)['after'])
            self.assertIn('invitation_not_displayable', validate_protected_display('display:1', **deps))

    def test_live_audience_channel_and_final_race_fence(self):
        for name in ('verify_protected_read', 'final_display_fence'):
            request, deps = self.display(**{name: lambda *_: ['source_or_authority_changed']})
            self.assertTrue(validate_protected_display('display:1', **deps))
            request, deps = self.display(**{name: lambda *_: True})
            self.assertTrue(validate_protected_display('display:1', **deps))
        request, deps = self.display()
        request['audience']['generation'] += 1
        self.assertIn('display_audience', validate_protected_display('display:1', **deps))

    def test_no_raw_material_or_handle_in_metadata(self):
        request, deps = self.display()
        for field in ('raw_code', 'qr_bytes', 'pairing_url', 'dispatch_handle'):
            bad = dict(request, **{field: 'FABRICATED_NOT_SECRET'})
            self.assertTrue(structural_errors('protected_display_request', bad))
            state = dict(self.value()['after'], **{field: 'FABRICATED_NOT_SECRET'})
            self.assertTrue(structural_errors('invitation_state', state))

    def completion(self, method='qr'):
        value = self.value('cancel')
        value['request'].update(action='consume', pairing_run_ref='run:1')
        value['result']['outcome'] = 'consumed'
        value['after'].update(state='consumed', consumed_pairing_run_ref='run:1')
        def legacy(name):
            return copy.deepcopy(next(r['value'] for r in self.legacy['valid'] if r['name'] == name))
        run = legacy('completed_pairing_has_identity_approval_and_receipt')
        receipt = legacy('positive.pairing_receipt_paired')
        trust = legacy('positive.client_trust')
        before = value['before']
        run.update(pairing_session_id=before['pairing_session_id'], server_id=before['server_id'],
            pairing_generation=before['generation'], expected_server_fingerprint=before['server_fingerprint'],
            observed_server_fingerprint=before['server_fingerprint'], requested_access_policy_id=before['client_access_policy_id'],
            method=method, pairing_material_sha256=None if method == 'manual_url' else before['pairing_material_sha256'],
            started_at_utc='2026-09-25T12:00:30Z', terminal_at_utc='2026-09-25T12:01:00Z', expires_at_utc=before['expires_at_utc'])
        receipt.update(receipt_id=run['receipt_ref'], server_id=before['server_id'],
            pairing_session_id=before['pairing_session_id'], client_id=run['candidate_client_id'],
            client_access_policy_id=before['client_access_policy_id'], policy_generation=before['policy_generation'],
            verified_fingerprint=before['server_fingerprint'], pairing_material_sha256=run['pairing_material_sha256'],
            started_at_utc=run['started_at_utc'], completed_at_utc=run['terminal_at_utc'])
        trust.update(client_trust_id=receipt['client_trust_id'], client_id=run['candidate_client_id'],
            server_id=before['server_id'], client_access_policy_id=before['client_access_policy_id'],
            policy_generation=before['policy_generation'], trust_generation=receipt['trust_generation'],
            verified_fingerprint=before['server_fingerprint'], issued_at_utc=run['terminal_at_utc'],
            expires_at_utc='2026-09-26T12:00:00Z')
        deps = fixture_dependencies(value)
        original = deps['resolve_record']
        sources = {('pairing_run', 'run:1'): run, ('pairing_receipt', run['receipt_ref']): receipt,
                   ('client_trust_record', receipt['client_trust_id']): trust}
        deps['resolve_record'] = lambda kind, ref: sources[(kind, ref)] if (kind, ref) in sources else original(kind, ref)
        return value, deps, run, receipt, trust

    def test_actual_legacy_pairing_trust_consumption_composition(self):
        for method in ('qr', 'short_code', 'manual_url'):
            value, deps, run, receipt, trust = self.completion(method)
            self.assertEqual(validate_issuance_result('result:1', **deps), [])
            deps['verify_pairing_completion'] = lambda *_: ['actual_protected_handoff_unproved']
            self.assertIn('pairing_completion:actual_protected_handoff_unproved', validate_issuance_result('result:1', **deps))

    def test_wrong_original_pairing_cannot_consume(self):
        value, deps, run, receipt, trust = self.completion()
        run['pairing_generation'] += 1
        self.assertIn('pairing_run_generation', validate_issuance_result('result:1', **deps))
        run['pairing_generation'] -= 1
        receipt['pairing_material_sha256'] = 'f' * 64
        self.assertIn('consumed_material', validate_issuance_result('result:1', **deps))
        trust['client_id'] = 'client:foreign'
        self.assertIn('trust_client', validate_issuance_result('result:1', **deps))

    def test_consumption_requires_actual_successful_unexpired_issuance(self):
        value, deps, run, receipt, trust = self.completion()
        receipt['receipt_id'] = 'receipt:other'
        self.assertIn('pairing_receipt_identity', validate_issuance_result('result:1', **deps))
        receipt['terminal_status'] = 'failed'
        receipt['failure_ref'] = 'failure:issuer'
        self.assertIn('pairing_receipt_not_successful', validate_issuance_result('result:1', **deps))
        value, deps, run, receipt, trust = self.completion()
        trust['expires_at_utc'] = run['terminal_at_utc']
        self.assertIn('trust_expired_at_pairing', validate_issuance_result('result:1', **deps))

    def test_qr_and_short_code_receipt_cannot_erase_material_binding(self):
        for method in ('qr', 'short_code'):
            value, deps, run, receipt, trust = self.completion(method)
            receipt['pairing_material_sha256'] = None
            self.assertEqual(structural_errors('pairing_receipt', receipt), [])
            self.assertIn('consumed_material', validate_issuance_result('result:1', **deps))
        value, deps, run, receipt, trust = self.completion('manual_url')
        self.assertEqual(validate_issuance_result('result:1', **deps), [])

    def test_successful_terminal_cannot_predate_original_request(self):
        value = self.value('cancel')
        value['after']['terminal_at_utc'] = value['before']['issued_at_utc']
        value['after']['updated_at_utc'] = value['before']['issued_at_utc']
        self.assertEqual(structural_errors('issuance_fixture', value), [])
        self.assertIn('terminal_before_request', self.check(value))


if __name__ == '__main__':
    unittest.main()
