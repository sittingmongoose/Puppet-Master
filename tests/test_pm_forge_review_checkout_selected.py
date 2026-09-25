"""Installed-only DL-097 checkout regressions; no native effect proof."""
from copy import deepcopy
import importlib.util
import json
import os
import sys
import unittest
from pathlib import Path
from referencing import Resource

ROOT = Path(__file__).resolve().parents[1]
CANON = Path(os.environ.get('PM_CANON_ROOT', ROOT))
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_forge_review_checkout_selected_semantics as m
import pm_ui_command_response as ui


class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures = json.loads((ROOT / 'Plans/forge_review_checkout_selected_contract_fixtures.json').read_text())
        cls.schema = json.loads((ROOT / m.SCHEMA).read_text())
        spec = importlib.util.spec_from_file_location('checkout_gate', CANON / 'scripts/pm-new-contracts-verify.py')
        cls.central = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.central)
        cls.registry = cls.central.offline_schema_registry().with_resource(cls.schema['$id'], Resource.from_contents(cls.schema))

    def value(self, name='separate_workspace_checked_out'):
        return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name'] == name))

    def check(self, v, **override):
        deps = m.fixture_dependencies(v)
        deps.update(override)
        return m.validate_checkout_result(v['request'], v['result'], v['original_binding_ref'],
                                           v['outcome_ref'], v['response_ref'],
                                           v['delivery_return_context'], **deps)

    def bundle(self, v):
        original = v['records'][v['original_binding_ref']]
        return {'response': v['records'][v['response_ref']], 'response_ref': v['response_ref'],
                'owner_result': v['result'], 'owner_request': v['request'],
                'original_binding_ref': v['original_binding_ref'],
                'delivery_return_context': v['delivery_return_context'],
                'resolved_outcome_ref': v['outcome_ref'], 'outcome': v['records'][v['outcome_ref']],
                'resolved_owner_result_ref': v['records'][v['outcome_ref']]['owner_result_ref'],
                'original_response': None,
                'normalized_request': {'request_ref': original['request_ref'], 'command_id': m.COMMAND,
                                       'command_instance_id': original['identity']['command_instance_id'],
                                       'operation_id': original['identity']['operation_id'],
                                       'owner_identity': original['identity'],
                                       **{k: original[k] for k in ('payload_sha256', 'idempotency_key', 'target_generation', 'dispatch_frame_id')}}}

    def central_check(self, v, **override):
        deps = m.fixture_dependencies(v)
        deps.update(override)
        return ui.response_bundle_failures(self.bundle(v), forge_checkout_dependencies=deps)

    def pin(self, v):
        r = v['records']
        o = r[v['original_binding_ref']]
        o['arguments'] = deepcopy(v['request'])
        o['payload_sha256'] = m.owner_result_digest(v['request'])
        r[v['result']['original_request_ref']] = deepcopy(v['request'])
        out = r[v['outcome_ref']]
        out['payload_sha256'] = o['payload_sha256']
        out['owner_result_sha256'] = m.owner_result_digest(v['result'])
        r[out['owner_result_ref']] = deepcopy(v['result'])

    def test_actual_gate_metadata(self):
        self.assertEqual('Plans/forge_review_checkout_selected_contracts.schema.json', self.fixtures['owner_schema'])
        for group in ('valid', 'invalid'):
            for c in self.fixtures[group]:
                d, s = self.central.select_definition(self.schema, c, c['value'], require_valid=group == 'valid')
                self.assertEqual([], list(self.central.validator_for(self.schema, s, self.registry).iter_errors(c['value'])), c['name'])
                actual = ui.contracts().contract_semantic_failures(m.SCHEMA, d, c['value'])
                if group == 'valid':
                    self.assertEqual([], actual, c['name'])
                else:
                    self.assertIn(c['semantic_rule'], actual, c['name'])

    def test_actual_central_all_paths(self):
        for c in self.fixtures['valid']:
            self.assertEqual([], self.central_check(deepcopy(c['value'])), c['name'])

    def test_historical_ui_fixtures(self):
        for c in json.loads((CANON / 'Plans/ui_command_response_fixtures.json').read_text())['valid']:
            self.assertEqual([], ui.response_bundle_failures(c))

    def test_historical_forge_fixtures(self):
        gate = self.central
        schema_rel = 'Plans/forge_integration_contracts.schema.json'
        schema = json.loads((CANON / schema_rel).read_text())
        fixtures = json.loads((CANON / 'Plans/forge_integration_contract_fixtures.json').read_text())
        registry = gate.offline_schema_registry()
        positive_by_name = {}
        selected_by_name = {}
        for c in fixtures['valid']:
            name = str(c.get('name', c.get('case_id', 'unnamed')))
            value = c.get('value', c.get('record', c.get('instance')))
            positive_by_name[name] = value
            d, s = gate.select_definition(schema, c, value, require_valid=True)
            selected_by_name[name] = d
            self.assertEqual([], list(gate.validator_for(schema, s, registry).iter_errors(value)), name)
            self.assertEqual([], gate.contract_semantic_failures(schema_rel, d, value), name)
        invalids = []
        invalids.extend(fixtures.get('invalid', []))
        invalids.extend(fixtures.get('negative', []))
        invalids.extend(fixtures.get('negative_cases', []))
        invalids.extend(fixtures.get('pairwise_invalid', []))
        self.assertTrue(invalids, 'historical forge pack has no negative cases')
        for c in invalids:
            name = str(c.get('name', c.get('case_id', 'unnamed')))
            value = gate.materialize_invalid(c, positive_by_name)
            selector_case = dict(c)
            if 'definition' not in selector_case and 'schema_ref' not in selector_case:
                base_name = selector_case.get('base_valid', selector_case.get('left_valid'))
                if base_name in selected_by_name:
                    selector_case['definition'] = selected_by_name[base_name]
            d, s = gate.select_definition(schema, selector_case, value, require_valid=False)
            accepted = gate.validator_for(schema, s, registry).is_valid(value)
            semantic_rule = c.get('semantic_rule')
            if semantic_rule is not None:
                self.assertTrue(accepted, name)
                self.assertIn(semantic_rule, gate.contract_semantic_failures(schema_rel, d, value), name)
            elif c in fixtures.get('pairwise_invalid', []):
                left = positive_by_name.get(c.get('left_valid'))
                self.assertTrue(accepted, name)
                self.assertTrue(gate.pairwise_invariant_is_violated(left, value), name)
            else:
                self.assertFalse(accepted, name)

    def test_mandatory_native_adapters(self):
        self.assertIn('checkout_native_dependencies_missing', ui.response_bundle_failures(self.bundle(self.value())))

    def test_old_authority_composed_unchanged(self):
        self.assertEqual({'$ref': m.schemas()[0]['Plans/forge_integration_contracts.schema.json']['$id'] + '#/$defs/command_request'},
                         self.schema['$defs']['request']['properties']['authority'])

    def test_placement_has_no_default(self):
        v = self.value()
        del v['request']['selection']['placement']
        self.assertTrue(m.shape('request', v['request']))
        self.assertTrue(m.shape('fixture_case', v))

    def test_placement_source_revision_preview_mismatch(self):
        v = self.value()
        v['request']['selection']['placement'] = 'current_workspace'
        self.pin(v)
        self.assertIn('preview_placement', self.central_check(v))
        v = self.value()
        v['records']['preview:checkout:31']['repo_id'] = 'repo:foreign'
        self.assertIn('preview_repo', self.central_check(v))
        v = self.value()
        v['records']['preview:checkout:31']['expected_revision']['commit_oid'] = 'f' * 40
        self.assertIn('preview_expected_revision', self.central_check(v))
        v = self.value()
        v['request']['selection']['checkout_preview_digest'] = 'f' * 64
        self.pin(v)
        self.assertIn('preview_digest', self.central_check(v))

    def test_separate_and_current_targets(self):
        v = self.value('separate_workspace_checked_out')
        preview = v['records']['preview:checkout:31']
        self.assertNotEqual(preview['target_workspace_id'], preview['source_workspace_id'])
        self.assertEqual([], self.central_check(v))
        v = self.value('current_workspace_checked_out')
        preview = v['records']['preview:checkout:32']
        self.assertEqual(preview['target_workspace_id'], preview['source_workspace_id'])
        self.assertEqual([], self.central_check(v))
        preview['target_workspace_id'] = 'workspace:foreign'
        v['records']['observation:checkout:32']['target_workspace_id'] = 'workspace:foreign'
        self.assertIn('preview_current_target', self.central_check(v))

    def test_backend_native_workspace_kinds(self):
        v = self.value('jujutsu_separate_checked_out')
        self.assertEqual('jujutsu_workspace', v['records']['preview:checkout:33']['target_workspace_kind'])
        self.assertEqual([], self.central_check(v))
        v['records']['preview:checkout:33']['target_workspace_kind'] = 'git_worktree'
        self.assertIn('preview_target_kind', self.central_check(v))
        v = self.value()
        v['request']['selection']['scm_backend'] = 'jujutsu'
        self.pin(v)
        self.assertIn('checkout_revision_backend', self.central_check(v))

    def test_dirty_discard_and_autostash_rejected(self):
        v = self.value()
        obs = v['records']['observation:checkout:31']
        obs['dirty_state'].update(preserved=False, discarded_paths=['src/notes.md'], after_snapshot_sha256='e' * 64)
        self.assertIn('checkout_dirty_discarded', self.central_check(v))
        v = self.value()
        v['records']['observation:checkout:31']['dirty_state']['autostash_observed'] = True
        self.assertIn('checkout_dirty_discarded', self.central_check(v))
        v = self.value()
        v['records']['observation:checkout:31']['dirty_state']['after_snapshot_sha256'] = 'e' * 64
        self.assertIn('dirty_snapshot_changed', self.central_check(v))

    def test_filesafe_lease_caller(self):
        v = self.value()
        v['request']['authority']['file_safe_decision_ref'] = 'filesafe:foreign'
        self.pin(v)
        self.assertIn('preview_filesafe', self.central_check(v))
        v = self.value()
        v['records']['preview:checkout:31']['writer_lease_generation'] = 99
        self.assertIn('lease_generation', self.central_check(v))
        v = self.value()
        target_lease = v['records']['preview:checkout:31']['writer_lease_ref']
        v['records'][target_lease]['workspace_id'] = 'workspace:foreign'
        self.assertIn('lease_scope', self.central_check(v))
        v = self.value()
        v['delivery_return_context']['route_ref'] = 'route:foreign'
        self.assertIn('original_return', self.central_check(v))

    def test_mutation_safety_not_waived(self):
        v = self.value()
        v['request']['authority']['currentness']['mutation_safety'] = 'reads_only'
        self.pin(v)
        self.assertIn('checkout_mutation_safety', self.central_check(v))

    def test_unknown_and_conflict_not_terminal_success(self):
        v = self.value('unknown_checkout')
        v['result']['owner_result']['outcome'] = 'succeeded'
        v['result']['owner_result']['error'] = None
        v['result']['owner_result']['terminal_provider_result_ref'] = v['result']['observation_ref']
        self.pin(v)
        self.assertIn('success_without_checked_out_effect', self.central_check(v))
        v = self.value()
        v['records']['preview:checkout:31']['conflicts'] = [{'path': 'src/review.rs', 'state': 'unresolved'}]
        self.assertIn('preview_conflict_qualified', self.central_check(v))

    def test_no_provider_effect_or_publication(self):
        v = self.value()
        v['records']['observation:checkout:31']['provider_receipt_ref'] = 'receipt:provider:foreign'
        self.assertIn('checkout_provider_effect_forbidden', self.central_check(v))

    def test_forged_receipt(self):
        v = self.value()
        v['records']['receipt:checkout:31']['receipt_id'] = 'receipt:foreign'
        self.assertIn('receipt_identity', self.central_check(v))
        v = self.value()
        v['records']['scm-receipt:checkout:31']['receipt_id'] = 'scm-receipt:foreign'
        self.assertIn('scm_receipt_identity', self.central_check(v))

    def test_source_location_and_forge_binding(self):
        v = self.value()
        v['records']['sir:checkout:31']['identity']['source_location_id'] = 'source:foreign'
        self.assertIn('checkout_source_location', self.central_check(v))
        v = self.value()
        v['records']['scm-context:alpha:main:31']['forge_binding']['binding_ref'] = 'forge-binding:foreign'
        self.assertIn('checkout_forge_binding', self.central_check(v))

    def test_replay_remains_same_original(self):
        v = self.value()
        response = v['records'][v['response_ref']]
        original = deepcopy(response)
        v['records'][original['dispatch_id']] = original
        response.update(dispatch_id='dispatch:replay', replayed=True, original_dispatch_id=original['dispatch_id'])
        b = self.bundle(v)
        b['original_response'] = original
        self.assertEqual([], ui.response_bundle_failures(b, forge_checkout_dependencies=m.fixture_dependencies(v)))
        response['receipt_ref'] = 'receipt:foreign'
        self.assertTrue(ui.response_bundle_failures(b, forge_checkout_dependencies=m.fixture_dependencies(v)))

    def test_cancelled_null_ui_and_noop(self):
        v = self.value('cancelled_before_checkout')
        self.assertIsNone(v['records'][v['response_ref']]['error'])
        self.assertEqual([], self.central_check(v))
        v['records'][v['response_ref']]['result_status'] = 'no_op'
        self.assertIn('response_outcome', self.central_check(v))

    def test_accepted_actual_work_nonterminal(self):
        v = self.value('accepted_checkout')
        v['records']['work:checkout:34'].update(work_state='completed', result_receipt_ref='receipt:foreign',
                                                cancel_available=False, background_available=False)
        self.assertIn('accepted_work_terminal', self.central_check(v))

    def test_error_projection_scope_and_value(self):
        v = self.value('unknown_checkout')
        v['records']['projection:error:checkout:35']['identity']['operation_id'] = 'foreign'
        self.assertIn('error_projection_source', self.central_check(v))
        v = self.value('unknown_checkout')
        v['records'][v['response_ref']]['error']['reason'] = 'foreign'
        self.assertIn('error_projection_value', self.central_check(v))

    def test_digest_owner_callback(self):
        self.assertIn('original_digest', self.check(self.value(), canonical_digest=lambda v: 'f' * 64))

    def test_native_refusal(self):
        for k in ('verify_original_admission', 'verify_review_authority', 'verify_checkout_effect', 'check_current_disclosure'):
            self.assertTrue(any('revoked' in e for e in self.central_check(self.value(), **{k: lambda *a: ['revoked']})))

    def test_boolean_not_authority(self):
        for k in ('verify_original_admission', 'verify_review_authority', 'verify_checkout_effect', 'check_current_disclosure'):
            self.assertTrue(any('invalid_proof' in e for e in self.central_check(self.value(), **{k: lambda *a: True})))

    def test_callback_mutation(self):
        def mutate(o, *a):
            o['actor_ref'] = 'foreign'
            return []
        self.assertIn('proof_input_mutated', self.central_check(self.value(), verify_original_admission=mutate))

    def test_late_original_mutation(self):
        v = self.value()

        def mutate(*a):
            v['records'][v['original_binding_ref']]['actor_ref'] = 'foreign'
            return []
        self.assertIn('original_mutated', self.central_check(v, check_current_disclosure=mutate))

    def test_central_routes_domain_failure(self):
        v = self.value()
        v['records']['observation:checkout:31']['selection']['placement'] = 'current_workspace'
        self.assertIn('observation_original', self.central_check(v))

    def test_response_cannot_predate_effect(self):
        v = self.value()
        v['records'][v['response_ref']]['ts'] = '2026-09-25T09:00:00Z'
        self.assertIn('response_before_result', self.central_check(v))

    def test_checked_out_effect_matches_preview(self):
        v = self.value()
        v['records']['observation:checkout:31']['actual_effects'][0]['disposition'] = 'preserved'
        self.assertIn('checked_out_effect_mismatch', self.central_check(v))

    def test_separate_target_lease_scope(self):
        v = self.value('separate_workspace_checked_out')
        s = v['request']['selection']
        preview = v['records'][s['checkout_preview_ref']]
        context = v['records'][s['repository_context_ref']]
        target_lease = v['records'][preview['writer_lease_ref']]
        self.assertEqual(target_lease['workspace_id'], preview['target_workspace_id'])
        self.assertNotEqual(preview['target_workspace_id'], context['workspace_id'])
        self.assertNotEqual(preview['writer_lease_ref'], context['writer_lease_ref'])
        self.assertEqual([], self.central_check(v))
        source_lease = v['records'][context['writer_lease_ref']]
        preview['writer_lease_ref'] = source_lease['lease_id']
        preview['writer_lease_generation'] = source_lease['generation']
        preview['writer_lease_epoch'] = source_lease['epoch']
        obs = v['records'][v['result']['observation_ref']]
        v['records'][obs['scm_operation_receipt_ref']]['writer_lease_ref'] = source_lease['lease_id']
        s['checkout_preview_digest'] = m.owner_result_digest(preview)
        self.pin(v)
        failures = self.central_check(v)
        self.assertIn('target_reuses_source_lease', failures)
        self.assertIn('lease_scope', failures)

    def test_current_target_lease_is_source_lease(self):
        v = self.value('current_workspace_checked_out')
        s = v['request']['selection']
        preview = v['records'][s['checkout_preview_ref']]
        context = v['records'][s['repository_context_ref']]
        self.assertEqual(preview['target_workspace_id'], context['workspace_id'])
        self.assertEqual(preview['writer_lease_ref'], context['writer_lease_ref'])
        self.assertEqual([], self.central_check(v))

    def test_source_lease_revalidation(self):
        v = self.value()
        context = v['records'][v['request']['selection']['repository_context_ref']]
        v['records'][context['writer_lease_ref']]['workspace_id'] = 'workspace:foreign'
        self.assertIn('source_lease_scope', self.central_check(v))
        v = self.value()
        context = v['records'][v['request']['selection']['repository_context_ref']]
        v['records'][context['writer_lease_ref']]['state'] = 'revoked'
        self.assertIn('source_lease_current', self.central_check(v))

    def test_preview_owner_qualification(self):
        v = self.value()
        v['records']['preview:checkout:31']['schema_id'] = 'pm.forge.review_checkout.preview.v1'
        self.assertIn('owner_resolution:ValueError', self.central_check(v))

    def test_stale_preview_cannot_check_out(self):
        v = self.value()
        v['records']['preview:checkout:31']['currentness_state'] = 'stale'
        self.assertIn('checked_out_without_qualified_preview', self.central_check(v))

    def test_foreign_owner_result_binding_rejected(self):
        v = self.value()
        b = self.bundle(v)
        forged = deepcopy(b['response'])
        forged['owner_result_schema_ref'] = {'path': 'Plans/forge_review_create_selected_contracts.schema.json', 'json_pointer': '#/$defs/result', 'schema_id': 'pm.forge.review_create_selected.result.v1'}
        b['response'] = forged
        failures = ui.response_bundle_failures(b, forge_checkout_dependencies=m.fixture_dependencies(v))
        self.assertIn('forge_checkout_owner_binding', failures)


if __name__ == '__main__':
    unittest.main()
