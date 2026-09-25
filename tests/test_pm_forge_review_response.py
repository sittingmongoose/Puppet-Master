"""Static exact-two SIR/Forge joins; explicit synthetic original/digest doubles."""
from copy import deepcopy
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest
STAGE=Path(__file__).resolve().parents[1]
ROOT=Path(os.environ.get('PM_CANON_ROOT',STAGE))
sys.path[:0]=[str(STAGE/'scripts'),str(ROOT/'scripts'),str(STAGE)]
import pm_forge_review_response as m

def load_ui():
    spec=importlib.util.spec_from_file_location('forge_review_installed_ui',ROOT/'scripts/pm_ui_command_response.py')
    ui=importlib.util.module_from_spec(spec);sys.modules[spec.name]=ui;spec.loader.exec_module(ui);return ui
UI=load_ui()
FIXTURES=json.loads((STAGE/'Plans/sir_forge_review_dispatch_fixtures.json').read_text())
CASES={x['name']:x['value'] for x in FIXTURES['valid']}
def check(x,**kwargs):
    deps=m.fixture_dependencies(x,ui_module=UI);deps.update(kwargs)
    return UI.response_bundle_failures(x['bundle'],**deps)
def repin(x):
    b=x['bundle'];b['outcome']['owner_result_sha256']=UI.owner_result_digest(b['owner_result'])

class ForgeReviewResponse(unittest.TestCase):
    def test_four_actual_owner_positives(self):
        for name,x in CASES.items():
            with self.subTest(name=name):self.assertEqual(check(deepcopy(x)),[])

    def test_central_metadata_pipeline(self):
        schema=json.loads((STAGE/m.SCHEMA).read_text());gate=UI.contracts()
        registry=UI.registry().with_resource(schema['$id'],m.Resource.from_contents(schema))
        self.assertEqual(FIXTURES['schema_version'],'1.0.0')
        for positive,cases in ((True,FIXTURES['valid']),(False,FIXTURES['invalid'])):
            for case in cases:
                definition,selected=gate.select_definition(schema,case,case['value'],require_valid=positive)
                self.assertTrue(gate.validator_for(schema,selected,registry).is_valid(case['value']))
                errors=gate.contract_semantic_failures(m.SCHEMA,definition,case['value'])
                if positive:self.assertEqual(errors,[])
                else:self.assertIn(case['semantic_rule'],errors)

    def test_actual_application_scope_not_provider_project(self):
        x=deepcopy(CASES['request_changes_application']);b=x['bundle']
        original=x['records'][b['original_binding_ref']]
        self.assertIsNone(original['identity']['project_id']);self.assertIsNone(original['return_context'])
        b['outcome']['identity']['project_id']='provider:project'
        self.assertTrue(check(x))

    def test_foreign_and_null_substituted_delivery(self):
        for value in (None,dict(CASES['approve_project']['bundle']['delivery_return_context'],caller_context_ref='foreign')):
            x=deepcopy(CASES['approve_project']);x['bundle']['delivery_return_context']=value
            self.assertIn('forge_delivery_original_return_mismatch',check(x))
        x=deepcopy(CASES['request_changes_application']);x['bundle']['delivery_return_context']=deepcopy(CASES['approve_project']['bundle']['delivery_return_context'])
        self.assertIn('forge_delivery_original_return_mismatch',check(x))

    def test_wrong_original_scope_and_generations(self):
        for field,value in (('project_id','foreign'),('operation_generation',33),('topology_generation',99)):
            x=deepcopy(CASES['approve_project']);b=x['bundle']
            x['records'][b['original_binding_ref']]['identity'][field]=value
            self.assertIn('forge_response_original_identity',check(x))

    def test_absent_delivery_value_is_not_authenticated_null(self):
        x=deepcopy(CASES['request_changes_application']);del x['bundle']['delivery_return_context']
        self.assertIn('forge_delivery_owner_value_missing',check(x))

    def test_terminal_owner_cannot_predate_admission(self):
        x=deepcopy(CASES['approve_project']);b=x['bundle']
        x['records'][b['original_binding_ref']]['accepted_at_utc']='2099-01-01T00:00:00Z'
        self.assertIn('forge_owner_result_before_admission',check(x))

    def test_unrelated_generations_remain_independent(self):
        x=CASES['approve_project'];o=x['records'][x['bundle']['original_binding_ref']]
        self.assertNotEqual(o['target_generation'],o['identity']['topology_generation'])
        self.assertNotEqual(o['target_generation'],o['arguments']['authority']['expected_binding_generation'])
        self.assertEqual(check(deepcopy(x)),[])

    def test_actual_work_missing_or_foreign(self):
        x=deepcopy(CASES['approve_accepted']);del x['records']['work:forge'];self.assertTrue(check(x))
        x=deepcopy(CASES['approve_accepted']);x['records']['work:forge']['identity']['operation_id']='foreign'
        self.assertIn('forge_response_actual_work_identity',check(x))

    def test_accepted_never_terminal_receipt(self):
        x=deepcopy(CASES['approve_acknowledged']);x['bundle']['outcome']['result_receipt_ref']='receipt:approve'
        self.assertIn('forge_response_acceptance_not_terminal',check(x))

    def test_degraded_explicitly_refused(self):
        x=deepcopy(CASES['approve_project']);b=x['bundle'];b['owner_result']['owner_result']['outcome']='degraded'
        x['records']['receipt:approve']['outcome']='degraded';repin(x)
        self.assertIn('forge_response_degraded_unsupported',check(x))

    def test_actual_domain_head_body_or_receipt_not_replaced(self):
        for field,value in (('body','other'),('head_revision','foreign')):
            x=deepcopy(CASES['approve_project']);x['records']['observation:approve']['selection'][field]=value
            self.assertIn('observation_selection',check(x))

    def test_failed_label_cannot_erase_unknown_effect(self):
        x=deepcopy(CASES['approve_project']);b=x['bundle'];owner=b['owner_result']['owner_result']
        owner['outcome']='failed';x['records']['receipt:approve']['outcome']='failed'
        owner['error']={'code':'permission_denied','message':'Unknown external result',
                        'retry_disposition':'after_reconciliation','effect_state':'unknown',
                        'provider_error_ref':None,'recovery_action_ids':[]}
        x['records']['observation:approve']['outcome']='unknown'
        old=next(c for c in json.loads((ROOT/'Plans/ui_command_response_fixtures.json').read_text())['valid'] if c['case_id']=='shared_failed')
        b['response']['error']=deepcopy(old['response']['error']);b['outcome']['error_ref']=old['outcome']['error_ref']
        b['outcome']['outcome']='failed';b['response']['result_status']='failed';repin(x)
        self.assertIn('forge_response_outcome',check(x))
        b['outcome']['outcome']='terminal_unknown';b['response']['result_status']='recovery_required'
        self.assertEqual(check(x),[])

    def test_original_dispatch_payload_and_permission(self):
        for field,value,rule in (('dispatch_id','foreign','forge_response_original_dispatch'),
              ('payload_sha256','a'*64,'forge_response_original_payload'),
              ('permission_snapshot_ref','foreign','forge_response_original_permission')):
            x=deepcopy(CASES['approve_project']);b=x['bundle'];x['records'][b['original_binding_ref']][field]=value
            self.assertIn(rule,check(x))

    def test_missing_dependencies_and_mutation(self):
        x=deepcopy(CASES['approve_project'])
        self.assertIn('forge_response_owner_dependencies_missing',UI.response_bundle_failures(x['bundle']))
        self.assertIn('forge_response_digest_contract',check(x,canonical_request_digest=lambda _:True))
        def digest(value):value['selection']['body']='changed';return UI.owner_result_digest(value)
        self.assertIn('forge_response_digest_input_mutated',check(x,canonical_request_digest=digest))
        def reader(ref):
            if ref=='receipt:approve':x['bundle']['delivery_return_context']=None
            return deepcopy(x['records'][ref])
        self.assertIn('forge_bundle_mutated_during_resolution',check(x,resolve_owner_record=reader))

    def test_same_original_replay_no_effect_dispatch(self):
        x=deepcopy(CASES['approve_project']);b=x['bundle'];b['original_response']=deepcopy(b['response'])
        b['response'].update(replayed=True,original_dispatch_id=b['response']['dispatch_id'],dispatch_id='replayed')
        self.assertEqual(check(x),[])
        b['response']['receipt_ref']='foreign';self.assertIn('replay_changed_original_result_identity',check(x))

    def test_wrong_family_and_local_projection_escape(self):
        x=deepcopy(CASES['approve_project']);x['bundle']['response']['owner_result_schema_ref']['json_pointer']='#'
        self.assertIn('forge_review_owner_result_binding',check(x))
        raw=json.loads((ROOT/'Plans/ui_command_response_fixtures.json').read_text())
        b=deepcopy(next(c for c in raw['valid'] if c['case_id']=='local_projection_success'))
        b['response']['command_id']=b['normalized_request']['command_id']='cmd.forge.review.approve'
        self.assertIn('durable_command_disguised_as_local_projection',UI.response_bundle_failures(b))


    def test_installed_manifest_and_pending_original_disposition(self):
        gate=UI.contracts()
        self.assertEqual(gate.CONTRACT_PAIRS.count((m.SCHEMA,'Plans/sir_forge_review_dispatch_fixtures.json')),1)
        registry=json.loads((ROOT/'Plans/storage_value_registry.json').read_text())
        rows=[row for row in registry['contract_family_dispositions'] if row['schema_ref']==m.SCHEMA]
        self.assertEqual(len(rows),1)
        row=rows[0]
        self.assertEqual(row['record_kinds'],['pm.sir.forge_review_dispatch_binding.v1'])
        self.assertEqual(row['physical_family_status'],'physical_family_registration_pending')
        self.assertEqual(row['existing_family_refs'],[])
        self.assertEqual(row['retention_disposition']['refs'],[])
        self.assertFalse(row['runtime_evidence'])

    def test_existing_responses_unchanged(self):
        for b in json.loads((ROOT/'Plans/ui_command_response_fixtures.json').read_text())['valid']:
            self.assertEqual(UI.response_bundle_failures(deepcopy(b)),[])

if __name__=='__main__':unittest.main()
