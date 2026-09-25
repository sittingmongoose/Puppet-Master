"""Installed-only ACT072 regressions; no native effect proof."""
from copy import deepcopy
import importlib.util,json,os,sys,unittest
from pathlib import Path
from referencing import Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(ROOT/'scripts'))
import pm_forge_retry_selected_semantics as m
import pm_ui_command_response as ui

class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures=json.loads((ROOT/'Plans/forge_retry_selected_contract_fixtures.json').read_text());cls.schema=json.loads((ROOT/m.SCHEMA).read_text())
        spec=importlib.util.spec_from_file_location('retry_gate',CANON/'scripts/pm-new-contracts-verify.py');cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central)
        cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
    def value(self,name='completed_retry'):return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name']==name))
    def check(self,v,**override):
        deps=m.fixture_dependencies(v);deps.update(override)
        return m.validate_retry_result(v['request'],v['result'],v['original_binding_ref'],v['outcome_ref'],v['response_ref'],v['delivery_return_context'],**deps)
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
            v=deepcopy(c['value']);self.assertEqual([],ui.response_bundle_failures(self.bundle(v),forge_retry_dependencies=m.fixture_dependencies(v)),c['name'])
    def test_native_dependencies_mandatory(self):
        self.assertIn('retry_native_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
    def test_aggregate_identity(self):
        self.assertEqual(self.fixtures['contract_schema_id'],self.schema['x-schema-id'])
    def test_exact_predecessor_authority_difference(self):
        old=m.schemas()[0]['Plans/forge_integration_contracts.schema.json'];expected=deepcopy(old['$defs']['command_request'])
        def absolute(v):
            if isinstance(v,dict):return {k:old['$id']+x if k=='$ref' and isinstance(x,str) and x.startswith('#/') else absolute(x) for k,x in v.items()}
            if isinstance(v,list):return [absolute(x) for x in v]
            return v
        expected=absolute(expected);expected['properties']['schema_id']={'const':'pm.forge.retry_selected.authority.v1'};expected['properties']['command_id']={'const':m.COMMAND}
        del expected['allOf'][14]['then']['properties']['observable_work_id']
        self.assertEqual(expected,self.schema['$defs']['authority'])
        self.assertEqual({'$ref':old['$id']+'#/$defs/non_empty_string'},expected['allOf'][14]['then']['properties']['target']['properties']['pipeline_id'])
        v=self.value('cancelled_before_submission');self.assertEqual([],self.central_check(v))
        v['request']['authority']['target']['pipeline_id']=None;self.assertTrue(m.shape('request',v['request']))
    def test_null_work_never_accepted(self):
        v=self.value('accepted_work');v['request']['authority']['observable_work_id']=None;v['result']['owner_result']['observable_work_id']=None
        self.assertIn('owner_result_schema',self.central_check(self.pin(v)))
    def test_fence_not_normalized_state(self):
        v=self.value();v['records']['state:original']['preview_id']='running';self.assertIn('fence_selection',self.check(v))
    def test_wrong_run(self):
        v=self.value();v['records']['pipeline:projection']['provider_pipeline_id']='foreign';self.assertIn('run_identity',self.check(v))
    def test_wrong_account(self):
        v=self.value();v['records']['state:original']['account_id']='foreign';self.assertIn('fence_provider_identity',self.check(v))
    def test_wrong_generation(self):
        v=self.value();v['records']['state:original']['binding_generation']+=1;self.assertIn('fence_selection',self.check(v))
    def test_changed_fence_cannot_authorize_effect(self):
        v=self.value();v['records'][v['request']['authority']['currentness']['direct_revalidation_ref']]['disposition']='changed';self.assertIn('effect_without_matching_fence',self.check(v))
    def test_actual_native_refusal(self):
        self.assertIn('fence:stale',self.check(self.value(),verify_retry_preview=lambda *a:['stale']))
        self.assertIn('disclosure:revoked',self.check(self.value(),check_current_disclosure=lambda *a:['revoked']))
    def test_boolean_not_proof(self):
        for k in ('verify_original_admission','verify_retry_preview','verify_effect_authority','check_current_disclosure'):
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
        v=self.value();v['records']['observation:retry']['provider_receipt_ref']=None;self.assertIn('completion_without_provider_receipt',self.check(v))
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
        self.assertIn('fence_selection',ui.response_bundle_failures(self.bundle(v),forge_retry_dependencies=m.fixture_dependencies(v)))
    def test_historical_ui_positive_fixtures(self):
        f=json.loads((CANON/'Plans/ui_command_response_fixtures.json').read_text())
        for c in f['valid']:self.assertEqual([],ui.response_bundle_failures(c))

    def test_actual_error_projection_not_unrelated_ui(self):
        v=self.value('unknown_effect');v['records'][v['response_ref']]['error']['reason']='Unrelated error'
        self.assertIn('error_projection_value',self.check(v))
        self.assertIn('error_projection_value',ui.response_bundle_failures(self.bundle(v),forge_retry_dependencies=m.fixture_dependencies(v)))
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
            self.assertIn('accepted_work_terminal',ui.response_bundle_failures(self.bundle(v),forge_retry_dependencies=m.fixture_dependencies(v)))
    def test_cancelled_retains_owner_error_with_null_ui(self):
        v=self.value('unknown_effect');r=v['result']['owner_result'];r.update(outcome='cancelled',terminal_provider_result_ref='observation:retry');r['error']['effect_state']='known_not_applied'
        v['records'][r['receipt_ref']]['outcome']='cancelled';v['records']['observation:retry'].update(outcome='cancelled',effect_state='known_not_applied')
        v['records']['observation:retry']['member_effects']=[];v['records']['observation:retry']['returned_work']=[]
        v['records'][v['outcome_ref']]['outcome']='cancelled';v['records'][v['response_ref']].update(result_status='cancelled',error=None)
        v['records']['error:cancel']['error']=deepcopy(r['error']);v['records']['projection:error:cancel']['ui_error']=None
        v['records']['result:logs']=deepcopy(v['result']);v['records'][v['outcome_ref']]['owner_result_sha256']=m.owner_result_digest(v['result'])
        self.assertEqual([],self.check(v))
        self.assertEqual([],ui.response_bundle_failures(self.bundle(v),forge_retry_dependencies=m.fixture_dependencies(v)))

    def pin(self,v):
        rec=v['records'];r=v['result'];d=rec[v['original_binding_ref']];o=rec[v['outcome_ref']]
        d['arguments']=deepcopy(v['request']);d['payload_sha256']=m.owner_result_digest(v['request']);o['payload_sha256']=d['payload_sha256'];o['owner_result_sha256']=m.owner_result_digest(r);rec[r['original_request_ref']]=deepcopy(v['request']);rec[o['owner_result_ref']]=deepcopy(r)
        if r['owner_result']['error'] is not None:rec[o['error_ref']]['error']=deepcopy(r['owner_result']['error']);rec[r['error_projection_ref']]['ui_error']=deepcopy(rec[v['response_ref']]['error'])
        return v
    def central_check(self,v):return ui.response_bundle_failures(self.bundle(v),forge_retry_dependencies=m.fixture_dependencies(v))
    def test_exact_scopes_no_default(self):
        for name in ('completed_retry','completed_all','completed_supported_failed_jobs'):self.assertEqual([],self.central_check(self.value(name)))
        v=self.value();del v['request']['selection']['retry_scope'];self.assertTrue(m.shape('fixture_case',v))
    def test_preview_scope_not_latest_choice(self):
        v=self.value();v['records']['state:original']['retry_scope']='all';self.assertIn('fence_selection',self.central_check(v))
    def test_selected_cannot_be_empty_or_native_ambiguous(self):
        v=self.value();v['request']['selection']['selected_members']=[];self.assertIn('scope_members',self.central_check(self.pin(v)))
        v=self.value();member=deepcopy(v['request']['selection']['selected_members'][0]);member['parent_native_id']='another';v['request']['selection']['selected_members'].append(member);self.assertIn('duplicate_native_member',self.central_check(self.pin(v)))
    def test_nested_native_hierarchy_not_flattened(self):
        v=self.value();s=v['request']['selection'];member=s['selected_members'][0];member.update(native_kind='native-stage',parent_native_id='native:parent',ancestor_native_ids=[s['provider_run_id'],'native:parent'])
        for r in v['records'].values():
            if 'selection' in r:r['selection']=deepcopy(s)
            if r.get('schema_id')=='pm.forge.retry_preview.v1':r['selected_members']=deepcopy(s['selected_members'])
        v['records']['observation:retry']['member_effects'][0]['member']=deepcopy(member)
        self.assertEqual([],self.central_check(self.pin(v)))
    def test_selection_completion_exact(self):
        v=self.value();v['records']['observation:retry']['member_effects']=[];self.assertIn('selected_completion_incomplete',self.central_check(v))
        v=self.value();v['records']['observation:retry']['member_effects'][0]['member']['native_id']='other';self.assertIn('effect_outside_selection',self.central_check(v))
    def test_all_scope_still_authenticates_observed_member_ancestry(self):
        v=self.value('completed_all');v['records']['observation:retry']['member_effects']=deepcopy(self.value()['records']['observation:retry']['member_effects']);v['records']['observation:retry']['member_effects'][0]['member']['ancestor_native_ids']=['foreign'];self.assertIn('effect_member_run_ancestry',self.central_check(v))
    def test_known_partial_failure_and_nullable_cancellation_retained(self):
        for name in ('partial_failed','partial_cancelled','failed_unknown_with_known_effect'):self.assertEqual([],self.central_check(self.value(name)))
        v=self.value('partial_failed');v['result']['owner_result']['error']['effect_state']='known_not_applied';self.assertIn('error_contradicts_known_effect',self.central_check(self.pin(v)))
    def test_no_unknown_member_false_success(self):
        v=self.value();v['records']['observation:retry']['member_effects'][0]['effect_state']='unknown';self.assertIn('lost_unknown_member',self.central_check(v))
    def test_actual_unknown_effect_cannot_be_denied_by_owner_error(self):
        for outcome in ('failed','cancelled'):
            for denied in ('none','known_not_applied'):
                v=self.value('unknown_effect');r=v['result']['owner_result'];r['outcome']=outcome;r['error']['effect_state']=denied;v['records'][r['receipt_ref']]['outcome']=outcome
                self.pin(v);self.assertEqual([],m.shape('fixture_case',v));self.assertIn('error_denies_unknown_effect',self.central_check(v))
        v=self.value('unknown_effect');v['records']['observation:retry']['effect_state']='known_not_applied';v['records']['observation:retry']['outcome']='rejected';v['result']['owner_result']['error']['effect_state']='known_not_applied'
        v['result']['owner_result']['outcome']='failed';v['records'][v['result']['owner_result']['receipt_ref']]['outcome']='failed'
        self.assertIn('error_denies_unknown_effect',self.central_check(self.pin(v)))
        for name in ('unknown_effect','failed_unknown_with_known_effect','partial_failed','partial_cancelled'):
            self.assertEqual([],self.central_check(self.value(name)))
    def test_duplicate_provider_work_identity(self):
        v=self.value();w=deepcopy(v['records']['observation:retry']['returned_work'][0]);w['parent_native_id']='other';v['records']['observation:retry']['returned_work'].append(w);self.assertIn('duplicate_returned_work',self.central_check(v))
    def test_replay_does_not_admit_new_scope(self):
        v=self.value();v['request']['selection']['retry_scope']='all';self.assertIn('original_request',self.central_check(v))
    def test_provider_can_update_same_run_not_forced_new(self):
        v=self.value('completed_all');v['records']['observation:retry']['returned_work']=[{'native_kind':'run','native_id':v['request']['selection']['provider_run_id'],'parent_native_id':None}];self.assertEqual([],self.central_check(v))
    def test_bare_result_semantics_do_not_fake_composition(self):
        self.assertEqual([],m.retry_selected_semantic_failures('result',self.value()['result']))
        self.assertIn('retry_native_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
    def test_candidate_current_admission_preserves_every_existing_arm(self):
        from jsonschema import Draft202012Validator
        path='Plans/forge_integration_contracts.schema.json';old=json.loads((CANON/path).read_text());candidate=deepcopy(old)
        arms=candidate['$defs']['command_request_admission']['oneOf'];prior=deepcopy(arms)
        excluded=arms[0]['allOf'][1]['not']['properties']['command_id']['enum'];new_arm={'$ref':self.schema['$id']+'#/$defs/request'}
        if m.COMMAND not in excluded:
            excluded.append(m.COMMAND);arms.append(new_arm);self.assertEqual(prior[1:],arms[1:-1])
        else:self.assertEqual(1,arms.count(new_arm));self.assertEqual(prior,arms)
        self.assertEqual(old['$defs']['command_request'],candidate['$defs']['command_request'])
        registry=self.registry.with_resource(candidate['$id'],Resource.from_contents(candidate))
        validate=Draft202012Validator({'$ref':candidate['$id']+'#/$defs/command_request_admission'},registry=registry)
        for c in self.fixtures['valid']:
            self.assertEqual([],list(validate.iter_errors(c['value']['request'])))
            self.assertTrue(list(validate.iter_errors(c['value']['request']['authority'])))
        for filename in ('forge_review_decision_fixtures.json','forge_log_selection_contract_fixtures.json','forge_cancel_selected_contract_fixtures.json','forge_thread_reply_contract_fixtures.json','forge_review_comment_contract_fixtures.json'):
            for c in json.loads((CANON/'Plans'/filename).read_text())['valid']:
                if 'request' in c['value']:self.assertEqual([],list(validate.iter_errors(c['value']['request'])),filename)

if __name__=='__main__':unittest.main()
