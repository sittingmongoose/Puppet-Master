"""Installed-only ACT071 regressions; no native effect proof."""
from copy import deepcopy
import importlib.util,json,os,sys,unittest
from pathlib import Path
from referencing import Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(ROOT/'scripts'))
import pm_forge_cancel_selected_semantics as m
import pm_ui_command_response as ui

class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures=json.loads((ROOT/'Plans/forge_cancel_selected_contract_fixtures.json').read_text());cls.schema=json.loads((ROOT/m.SCHEMA).read_text())
        spec=importlib.util.spec_from_file_location('cancel_gate',CANON/'scripts/pm-new-contracts-verify.py');cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central)
        cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
    def value(self,name='completed_cancel'):return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name']==name))
    def check(self,v,**override):
        deps=m.fixture_dependencies(v);deps.update(override)
        return m.validate_cancel_result(v['request'],v['result'],v['original_binding_ref'],v['outcome_ref'],v['response_ref'],v['delivery_return_context'],**deps)
    def bundle(self,v):
        original=v['records'][v['original_binding_ref']]
        return {'response':v['records'][v['response_ref']],'response_ref':v['response_ref'],'owner_result':v['result'],
                'owner_request':v['request'],'original_binding_ref':v['original_binding_ref'],'delivery_return_context':v['delivery_return_context'],
                'resolved_outcome_ref':v['outcome_ref'],'outcome':v['records'][v['outcome_ref']],
                'resolved_owner_result_ref':v['records'][v['outcome_ref']]['owner_result_ref'],'original_response':None,
                'normalized_request':{'request_ref':original['request_ref'],'command_id':m.COMMAND,
                    'command_instance_id':original['identity']['command_instance_id'],'operation_id':original['identity']['operation_id'],
                    'owner_identity':original['identity'],**{k:original[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}}
    def test_actual_central_fixture_protocol(self):
        for group in ('valid','invalid'):
            for c in self.fixtures[group]:
                d,s=self.central.select_definition(self.schema,c,c['value'],require_valid=group=='valid')
                self.assertEqual([],list(self.central.validator_for(self.schema,s,self.registry).iter_errors(c['value'])))
                actual=ui.contracts().contract_semantic_failures(m.SCHEMA,d,c['value'])
                if group=='valid':self.assertEqual([],actual,c['name'])
                else:self.assertIn(c['semantic_rule'],actual)
    def test_actual_ui_positives(self):
        for c in self.fixtures['valid']:
            v=deepcopy(c['value']);self.assertEqual([],ui.response_bundle_failures(self.bundle(v),forge_cancel_dependencies=m.fixture_dependencies(v)),c['name'])
    def test_native_dependencies_mandatory(self):
        self.assertIn('cancel_native_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
    def test_old_authority_composed_unchanged(self):
        self.assertEqual({'$ref':m.schemas()[0]['Plans/forge_integration_contracts.schema.json']['$id']+'#/$defs/command_request'},self.schema['$defs']['request']['properties']['authority'])
    def test_fence_not_normalized_state(self):
        v=self.value();v['records']['state:original']['state_ref']='running';self.assertIn('fence_selection',self.check(v))
    def test_wrong_run(self):
        v=self.value();v['records']['pipeline:projection']['provider_pipeline_id']='foreign';self.assertIn('run_identity',self.check(v))
    def test_wrong_account(self):
        v=self.value();v['records']['state:original']['account_id']='foreign';self.assertIn('fence_provider_identity',self.check(v))
    def test_wrong_generation(self):
        v=self.value();v['records']['state:original']['binding_generation']+=1;self.assertIn('fence_selection',self.check(v))
    def test_changed_fence_cannot_authorize_effect(self):
        v=self.value();v['records'][v['request']['authority']['currentness']['direct_revalidation_ref']]['disposition']='changed';self.assertIn('effect_without_matching_fence',self.check(v))
    def test_actual_native_refusal(self):
        self.assertIn('fence:stale',self.check(self.value(),verify_run_fence=lambda *a:['stale']))
        self.assertIn('disclosure:revoked',self.check(self.value(),check_current_disclosure=lambda *a:['revoked']))
    def test_boolean_not_proof(self):
        for k in ('verify_original_admission','verify_run_fence','verify_effect_authority','check_current_disclosure'):
            self.assertTrue(any(x.endswith('invalid_proof') for x in self.check(self.value(),**{k:lambda *a:True})))
    def test_callback_mutation(self):
        def mutate(o,*a):o['actor_ref']='foreign';return []
        self.assertIn('proof_input_mutated',self.check(self.value(),verify_original_admission=mutate))
    def test_late_original_mutation(self):
        v=self.value()
        def mutate(*a):v['records'][v['original_binding_ref']]['actor_ref']='foreign';return []
        self.assertIn('original_mutated',self.check(v,check_current_disclosure=mutate))
    def test_no_inferred_noop(self):
        v=self.value();v['records'][v['response_ref']]['result_status']='no_op';self.assertIn('response_outcome',self.check(v))
    def test_accepted_not_success(self):
        v=self.value('accepted_work');v['records'][v['response_ref']].update(result_status='succeeded',receipt_ref='receipt:borrowed');self.assertIn('response_outcome',self.check(v))
    def test_unknown_not_failed(self):
        v=self.value('unknown_effect');v['records'][v['outcome_ref']]['outcome']='failed';self.assertIn('terminal_outcome',self.check(v))
    def test_completion_requires_native_receipt(self):
        v=self.value();v['records']['observation:cancel']['provider_receipt_ref']=None;self.assertIn('completion_without_provider_receipt',self.check(v))
    def test_actual_work_identity(self):
        v=self.value();v['records'][v['request']['authority']['observable_work_id']]['identity']['operation_id']='foreign';self.assertIn('original_work',self.check(v))
    def test_original_caller(self):
        v=self.value();v['delivery_return_context']={'surface_id':'settings','route_ref':'route:foreign','focus_id':None,'invocation_token':'i','caller_context_ref':'c','expected_caller_revision':1,'continuation_generation':1};self.assertIn('original_return',self.check(v))
    def test_receipt_identity(self):
        v=self.value();v['records'][v['result']['owner_result']['receipt_ref']]['receipt_id']='foreign';self.assertIn('receipt_identity',self.check(v))
    def test_terminal_observation_required(self):
        v=self.value('known_rejected');v['result']['observation_ref']=None;v['result']['owner_result']['terminal_provider_result_ref']=None
        v['records']['result:logs']=deepcopy(v['result']);v['records'][v['outcome_ref']]['owner_result_sha256']=m.owner_result_digest(v['result'])
        self.assertIn('terminal_observation_missing',self.check(v))
    def test_central_routes_domain_failure(self):
        v=self.value();v['records']['state:original']['provider_run_id']='foreign'
        self.assertIn('fence_selection',ui.response_bundle_failures(self.bundle(v),forge_cancel_dependencies=m.fixture_dependencies(v)))
    def test_historical_ui_positive_fixtures(self):
        f=json.loads((CANON/'Plans/ui_command_response_fixtures.json').read_text())
        for c in f['valid']:self.assertEqual([],ui.response_bundle_failures(c))

    def test_actual_error_projection_not_unrelated_ui(self):
        v=self.value('unknown_effect');v['records'][v['response_ref']]['error']['reason']='Unrelated error'
        self.assertIn('error_projection_value',self.check(v))
        self.assertIn('error_projection_value',ui.response_bundle_failures(self.bundle(v),forge_cancel_dependencies=m.fixture_dependencies(v)))
    def test_actual_error_reference_not_substituted(self):
        v=self.value('unknown_effect');v['records']['error:foreign']=deepcopy(v['records']['error:cancel']);v['records'][v['outcome_ref']]['error_ref']='error:foreign'
        self.assertIn('error_projection_source',self.check(v))
    def test_error_projection_original_and_mutation(self):
        v=self.value('unknown_effect');v['records']['projection:error:cancel']['identity']['operation_id']='foreign'
        self.assertIn('error_projection_source',self.check(v))
        v=self.value('unknown_effect')
        def mutate(*args):v['records']['projection:error:cancel']['ui_error']['reason']='late change';return []
        self.assertIn('original_mutated',self.check(v,check_current_disclosure=mutate))
    def test_accepted_cannot_borrow_terminal_work(self):
        for state,receipt in [('completed','receipt:foreign')]:
            v=self.value('accepted_work');v['records']['observable-work:forge:31'].update(work_state=state,result_receipt_ref=receipt,cancel_available=False,background_available=False)
            self.assertIn('accepted_work_terminal',self.check(v))
            self.assertIn('accepted_work_terminal',ui.response_bundle_failures(self.bundle(v),forge_cancel_dependencies=m.fixture_dependencies(v)))
    def test_cancelled_retains_owner_error_with_null_ui(self):
        v=self.value('unknown_effect');r=v['result']['owner_result'];r.update(outcome='cancelled',terminal_provider_result_ref='observation:cancel');r['error']['effect_state']='known_not_applied'
        v['records'][r['receipt_ref']]['outcome']='cancelled';v['records']['observation:cancel'].update(outcome='cancelled',effect_state='known_not_applied')
        v['records'][v['outcome_ref']]['outcome']='cancelled';v['records'][v['response_ref']].update(result_status='cancelled',error=None)
        v['records']['error:cancel']['error']=deepcopy(r['error']);v['records']['projection:error:cancel']['ui_error']=None
        v['records']['result:logs']=deepcopy(v['result']);v['records'][v['outcome_ref']]['owner_result_sha256']=m.owner_result_digest(v['result'])
        self.assertEqual([],self.check(v))
        self.assertEqual([],ui.response_bundle_failures(self.bundle(v),forge_cancel_dependencies=m.fixture_dependencies(v)))

if __name__=='__main__':unittest.main()
