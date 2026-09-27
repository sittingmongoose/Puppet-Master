#!/usr/bin/env python3
"""Schema-valid hostile joins exercise FGI-021 evidence comparisons."""
import copy
import json
import sys
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_forge_packet_semantics import forge_packet_semantic_failures, validate_forge_counterexamples

SCHEMA = json.loads((ROOT / 'Plans/forge_integration_contracts.schema.json').read_text())
SCS = json.loads((ROOT / 'Plans/source_control_contracts.schema.json').read_text())
REGISTRY = Registry().with_resource(SCS['$id'], Resource.from_contents(SCS))
FIXTURES = json.loads((ROOT / 'Plans/forge_integration_contract_fixtures.json').read_text())
VALID = {x['name']: x for x in FIXTURES['valid']}


class ForgeEvidenceJoins(unittest.TestCase):
    def check_bad(self, name, patch, code):
        case = copy.deepcopy(VALID[name])
        patch(case['value'])
        Draft202012Validator({**SCHEMA, '$ref': '#/$defs/' + case['definition']}, registry=REGISTRY).validate(case['value'])
        self.assertIn(code, forge_packet_semantic_failures(case['definition'], case['value']))

    def test_positive_witnesses_are_structural_and_semantic_valid(self):
        for case in VALID.values():
            if case['definition'] in ('hosted_ci_command_roundtrip', 'hosted_ci_capability_admission'):
                with self.subTest(case=case['name']):
                    Draft202012Validator({**SCHEMA, '$ref': '#/$defs/' + case['definition']}, registry=REGISTRY).validate(case['value'])
                    self.assertEqual([], forge_packet_semantic_failures(case['definition'], case['value']))

    def test_all_counterexamples_compute_their_named_rejection(self):
        self.assertEqual([], validate_forge_counterexamples(SCHEMA, FIXTURES, registry=REGISTRY))

    def test_request_and_terminals_cannot_together_lie_about_digest(self):
        def patch(v):
            v['request']['target']['expected_digest'] = 'f' * 64
            for k in ('result', 'receipt'):
                v[k]['artifact_identity']['expected_digest'] = 'f' * 64
        self.check_bad('hosted_ci_roundtrip_artifact_download', patch, 'forge_roundtrip_digest_mismatch')

    def test_scs_run_from_another_instance_rejected(self):
        self.check_bad('hosted_ci_roundtrip_artifact_download', lambda v: v['artifact_evidence']['run_record'].update(instance_id='instance:foreign'), 'forge_roundtrip_run_binding_mismatch')

    def test_scs_artifact_from_another_repository_rejected(self):
        self.check_bad('hosted_ci_roundtrip_artifact_download', lambda v: v['artifact_evidence']['artifact_record'].update(repository_id='repo:foreign'), 'forge_roundtrip_run_binding_mismatch')

    def test_receipt_run_substitution_rejected(self):
        self.check_bad('hosted_ci_roundtrip_artifact_download', lambda v: v['receipt']['artifact_identity'].update(automation_run_id='run:foreign'), 'forge_roundtrip_run_binding_mismatch')

    def test_successful_create_of_other_repository_rejected(self):
        def patch(v):
            for k in ('verified_create_result', 'verified_create_receipt'):
                v[k]['repository_binding_ref'] = 'binding:foreign'
        self.check_bad('hosted_ci_roundtrip_repository_delete', patch, 'forge_roundtrip_verified_create_result_mismatch')

    def test_create_result_foreign_target_rejected(self):
        self.check_bad('hosted_ci_roundtrip_repository_delete', lambda v: v['verified_create_result'].update(target_ref='create-target:foreign'), 'forge_roundtrip_verified_create_target_mismatch')

    def test_create_target_witness_cannot_retarget_selected_repository(self):
        def patch(v):
            v['verified_create_target']['target_ref'] = v['verified_create_result']['target_ref'] = 'create-target:foreign'
            v['verified_create_target']['repository_binding']['provider_repository_id'] = 'provider-repo:foreign'
        self.check_bad('hosted_ci_roundtrip_repository_delete', patch, 'forge_roundtrip_verified_create_target_mismatch')

    def test_different_service_uses_automation_repository_identity(self):
        case = copy.deepcopy(VALID['hosted_ci_roundtrip_artifact_download'])
        v = case['value']
        for k in ('request', 'result', 'receipt', 'automation_binding'):
            v[k]['provider'] = 'github'
        v['request']['provider_variant'] = 'github_cloud'
        for k in ('request', 'automation_binding'):
            v[k]['normalized_host'] = 'github.com'
            v[k]['account_id'] = 'account:github:automation'
        v['automation_binding'].update(repository_relationship='different_service', instance_id='instance:github:automation', service_kind='github_actions')
        v['request']['target']['provider_repository_id'] = 'provider-repo:github:automation'
        v['artifact_evidence']['service_repository_id'] = 'provider-repo:github:automation'
        for k in ('run_record', 'artifact_record'):
            v['artifact_evidence'][k].update(provider_kind='github', instance_id='instance:github:automation', account_id='account:github:automation', repository_id='provider-repo:github:automation')
        validator = Draft202012Validator({**SCHEMA, '$ref': '#/$defs/' + case['definition']}, registry=REGISTRY)
        validator.validate(v)
        self.assertEqual([], forge_packet_semantic_failures(case['definition'], v))
        # A record substituted from the storage forge must now be rejected.
        v['artifact_evidence']['run_record']['repository_id'] = v['repository_binding']['provider_repository_id']
        validator.validate(v)
        self.assertIn('forge_roundtrip_run_binding_mismatch', forge_packet_semantic_failures(case['definition'], v))

    def test_agreeing_claims_cannot_override_admin_write_record(self):
        def patch(v):
            row = next(x for x in v['admin_surface']['actions'] if x['area'] == 'secrets')
            row['write_state'] = 'permission_denied'
        self.check_bad('hosted_ci_admission_secret_set', patch, 'forge_admission_admin_not_ready')

    def test_stale_dimension_cannot_authorize_available(self):
        self.check_bad('hosted_ci_admission_artifact_download', lambda v: v['dimension_observation'].update(currentness='stale'), 'forge_admission_matrix_not_ready')

    def test_permission_claim_cannot_override_owner_record(self):
        self.check_bad('hosted_ci_admission_secret_set', lambda v: v['permission_record'].update(decision='deny'), 'forge_admission_permission_not_ready')

    def test_profile_substitution_rejected(self):
        self.check_bad('hosted_ci_admission_artifact_download', lambda v: v['dimension_observation'].update(profile_id='github_cloud'), 'forge_admission_profile_mismatch')

    def test_duplicate_admin_area_is_ambiguous(self):
        def patch(v):
            row = copy.deepcopy(next(x for x in v['admin_surface']['actions'] if x['area'] == 'secrets'))
            row['receipt_or_external_route_ref'] = 'route:different'
            v['admin_surface']['actions'].append(row)
        self.check_bad('hosted_ci_admission_secret_set', patch, 'forge_admission_admin_area_mismatch')

    def test_bad_counterexample_path_fails_closed(self):
        fixtures = copy.deepcopy(FIXTURES)
        fixtures['semantic_counterexamples'][0]['patch'] = {'result.no_such_field': 5}
        result = validate_forge_counterexamples(SCHEMA, fixtures, registry=REGISTRY)
        self.assertEqual('forge_counterexample_unevaluable', result[0]['code'])

    def test_semantically_bad_base_cannot_be_negative_evidence(self):
        fixtures = copy.deepcopy(FIXTURES)
        base = next(x for x in fixtures['valid'] if x['name'] == 'hosted_ci_roundtrip_artifact_download')
        base['value']['receipt']['operation_id'] = 'operation:foreign'
        result = validate_forge_counterexamples(SCHEMA, fixtures, registry=REGISTRY)
        self.assertTrue(any(x['code'] == 'forge_counterexample_unevaluable' for x in result))


if __name__ == '__main__':
    unittest.main()
