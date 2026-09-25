"""Installed-only ACT070 regressions; no native effect proof."""
from copy import deepcopy
import importlib.util,json,os,sys,unittest
from pathlib import Path
from referencing import Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(ROOT/'scripts'))
import pm_forge_run_selected_semantics as m
import pm_ui_command_response as ui

class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures=json.loads((ROOT/'Plans/forge_run_selected_contract_fixtures.json').read_text());cls.schema=json.loads((ROOT/m.SCHEMA).read_text())
        spec=importlib.util.spec_from_file_location('run_gate',CANON/'scripts/pm-new-contracts-verify.py');cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central)
        cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
    def value(self,name='completed_run'):return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name']==name))
    def check(self,v,**override):
        deps=m.fixture_dependencies(v);deps.update(override)
        return m.validate_run_result(v['request'],v['result'],v['original_binding_ref'],v['outcome_ref'],v['response_ref'],v['delivery_return_context'],**deps)
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
            v=deepcopy(c['value']);self.assertEqual([],ui.response_bundle_failures(self.bundle(v),forge_run_dependencies=m.fixture_dependencies(v)),c['name'])
    def test_native_dependencies_mandatory(self):
        self.assertIn('run_native_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
    def test_aggregate_identity(self):
        self.assertEqual(self.fixtures['contract_schema_id'],self.schema['x-schema-id'])
    def test_null_work_never_accepted(self):
        v=self.value('accepted_work');v['request']['authority']['observable_work_id']=None;v['result']['owner_result']['observable_work_id']=None
        self.assertIn('owner_result_schema',self.central_check(self.pin(v)))
    def test_actual_native_refusal(self):
        self.assertIn('fence:stale',self.check(self.value(),verify_run_preview=lambda *a:['stale']))
        self.assertIn('disclosure:revoked',self.check(self.value(),check_current_disclosure=lambda *a:['revoked']))
    def test_boolean_not_proof(self):
        for k in ('verify_original_admission','verify_run_definition','verify_run_preview','verify_effect_authority','check_current_disclosure'):
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
    def test_historical_ui_positive_fixtures(self):
        f=json.loads((CANON/'Plans/ui_command_response_fixtures.json').read_text())
        for c in f['valid']:self.assertEqual([],ui.response_bundle_failures(c))
    def test_actual_error_projection_not_unrelated_ui(self):
        v=self.value('unknown_effect');v['records'][v['response_ref']]['error']['reason']='Unrelated error'
        self.assertIn('error_projection_value',self.check(v))
        self.assertIn('error_projection_value',ui.response_bundle_failures(self.bundle(v),forge_run_dependencies=m.fixture_dependencies(v)))
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
            self.assertIn('accepted_work_terminal',ui.response_bundle_failures(self.bundle(v),forge_run_dependencies=m.fixture_dependencies(v)))
    def pin(self,v):
        rec=v['records'];r=v['result'];d=rec[v['original_binding_ref']];o=rec[v['outcome_ref']]
        d['arguments']=deepcopy(v['request']);d['payload_sha256']=m.owner_result_digest(v['request']);o['payload_sha256']=d['payload_sha256'];o['owner_result_sha256']=m.owner_result_digest(r);rec[r['original_request_ref']]=deepcopy(v['request']);rec[o['owner_result_ref']]=deepcopy(r)
        if r['owner_result']['error'] is not None:rec[o['error_ref']]['error']=deepcopy(r['owner_result']['error']);rec[r['error_projection_ref']]['ui_error']=deepcopy(rec[v['response_ref']]['error'])
        return v
    def central_check(self,v):return ui.response_bundle_failures(self.bundle(v),forge_run_dependencies=m.fixture_dependencies(v))
    def test_bare_result_semantics_do_not_fake_composition(self):
        self.assertEqual([],m.run_selected_semantic_failures('result',self.value()['result']))
        self.assertIn('run_native_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
    def sync(self,v):
        s=v['request']['selection'];rec=v['records'];s['definition_sha256']=m.owner_result_digest(rec[s['definition_ref']])
        rec['state:original']['selection']=deepcopy(s)
        rec[v['request']['authority']['currentness']['direct_revalidation_ref']]['selection']=deepcopy(s)
        if v['result']['observation_ref']:rec[v['result']['observation_ref']]['selection']=deepcopy(s)
        return self.pin(v)
    def test_exact_authority_difference(self):
        old=m.schemas()[0]['Plans/forge_integration_contracts.schema.json'];expected=deepcopy(old['$defs']['command_request'])
        def absolute(v):
            if isinstance(v,dict):return {k:old['$id']+x if k=='$ref' and isinstance(x,str) and x.startswith('#/') else absolute(x) for k,x in v.items()}
            if isinstance(v,list):return [absolute(x) for x in v]
            return v
        expected=absolute(expected);expected['properties']['schema_id']={'const':'pm.forge.run_selected.authority.v1'};expected['properties']['command_id']={'const':m.COMMAND}
        del expected['allOf'][14]['then']['properties']['observable_work_id'];del expected['allOf'][14]['then']['properties']['target']['properties']['pipeline_id']
        self.assertEqual(expected,self.schema['$defs']['authority'])
        v=self.value('cancelled_before_submission');self.assertEqual([],self.central_check(v));v['request']['authority']['target']['pipeline_definition_ref']=None;self.assertTrue(m.shape('request',v['request']))
    def test_original_definition_revision(self):
        for k in ('definition_id','source_revision'):
            v=self.value();v['records']['definition:run'][k]='foreign';self.assertIn('definition_selection',self.central_check(self.sync(v)))
    def test_definition_digest(self):
        v=self.value();v['records']['definition:run']['owner_revision']='changed';self.assertIn('definition_original',self.central_check(v))
    def test_actual_api(self):
        v=self.value();v['records'][v['request']['authority']['api_compatibility_ref']]['probe_id']='foreign';self.assertIn('api_original',self.central_check(v))
    def test_descriptor_scope(self):
        v=self.value();v['records']['definition:run']['account_id']='foreign';self.assertIn('definition_account_id',self.central_check(self.sync(v)))
    def test_no_provider_default_invention(self):
        v=self.value();v['records']['state:original']['effective_inputs'][0]['origin']='provider_resolved';self.assertIn('submitted_input_changed',self.central_check(v))
        self.assertEqual([],self.central_check(self.value('actual_provider_resolved_omission')))
    def test_null_not_absence(self):
        self.assertEqual([],self.central_check(self.value('explicit_null_not_default')))
        v=self.value('explicit_null_not_default');v['records']['definition:run']['fields'][0]['nullable']=False;self.assertIn('input_null_disallowed',self.central_check(self.sync(v)))
    def test_order_and_duplicates_preserved(self):
        self.assertEqual([],self.central_check(self.value()))
        v=self.value();v['records']['state:original']['effective_inputs'][1]['value']['value']=['a','b'];self.assertIn('submitted_input_changed',self.central_check(v))
        v=self.value();v['records']['definition:run']['fields'][1]['unique_items']=True;self.assertIn('input_unique_items',self.central_check(self.sync(v)))
    def test_declared_bounds_and_required(self):
        v=self.value();v['records']['definition:run']['fields'][0]['maximum_length']=2;self.assertIn('input_text_bound',self.central_check(self.sync(v)))
        v=self.value();v['request']['selection']['inputs']=v['request']['selection']['inputs'][1:];self.assertIn('required_input',self.central_check(self.sync(v)))
    def test_unknown_duplicate_field(self):
        v=self.value();v['request']['selection']['inputs'].append(deepcopy(v['request']['selection']['inputs'][0]));self.assertIn('duplicate_input_field',self.central_check(self.sync(v)))
        v=self.value();v['request']['selection']['inputs'][0]['field_id']='undeclared';self.assertIn('unknown_input_field',self.central_check(self.sync(v)))
    def test_unsupported_object_not_json_escape(self):
        v=self.value();v['request']['selection']['inputs'][0]['value']={'kind':'object','value':{'vendor':'guess'}};self.assertTrue(m.shape('request',v['request']))
    def test_all_typed_kinds(self):
        values={'text':'','integer':3,'boolean':True,'enum':'native:v','text_list':['x','x'],'integer_list':[1,1],'boolean_list':[False,True,False],'enum_list':['native:v','native:v'],'resource':'resource:run','resource_list':['resource:run','resource:run']}
        for kind,value in values.items():
            v=self.value();f=v['records']['definition:run']['fields'][0];f.update(value_kind=kind,enum_values=['native:v'] if kind.startswith('enum') else [],resource_kind='native-environment' if kind.startswith('resource') else None)
            operand={'kind':kind,'value':value};v['request']['selection']['inputs'][0]['value']=deepcopy(operand);v['records']['state:original']['effective_inputs'][0]['value']=deepcopy(operand)
            a=v['request']['authority'];v['records']['resource:run']={'schema_id':'pm.forge.run_input_resource.v1','schema_version':'1.0.0','resource_ref':'resource:run',**{k:a[k] for k in ('provider','provider_variant','normalized_host','account_id')},'resource_kind':'native-environment','provider_resource_id':'native:environment','scope_ref':a['automation_binding_ref'],'currentness_ref':'native:current'}
            self.assertEqual([],self.central_check(self.sync(v)),kind)
            if kind.startswith('resource'):
                v['records']['resource:run']['scope_ref']='foreign';self.assertIn('input_resource_scope',self.central_check(v))
    def test_effective_coverage_and_constraints(self):
        v=self.value();v['records']['state:original']['effective_inputs'].pop();self.assertIn('preview_input_completeness',self.central_check(v))
        v=self.value();v['records']['definition:run']['constraints']=[{'kind':'requires','when_field_id':'fixture.label','when_operand':None,'other_field_id':'fixture.optional'}];self.assertIn('input_cross_field',self.central_check(self.sync(v)))
    def test_changed_direct_fence(self):
        v=self.value();v['records'][v['request']['authority']['currentness']['direct_revalidation_ref']].update(disposition='unavailable',observed_preview_id=None);self.assertIn('effect_without_matching_preview',self.central_check(v))
    def test_native_run_not_intended_definition(self):
        v=self.value();v['records'][v['result']['observation_ref']]['returned_work']=[];self.assertIn('completion_without_native_work',self.central_check(v))
        v=self.value();v['records'][v['result']['observation_ref']]['provider_receipt_ref']=None;self.assertIn('completion_without_native_work',self.central_check(v))
    def test_unknown_effect_error_cannot_deny(self):
        v=self.value('unknown_effect');r=v['result']['owner_result'];r['outcome']='failed';r['error']['effect_state']='known_not_applied';v['records'][r['receipt_ref']]['outcome']='failed';self.assertIn('error_denies_unknown_effect',self.central_check(self.pin(v)))
    def test_known_partial_preserved(self):
        for name in ('partial_failed','partial_cancelled','failed_unknown_with_known_effect'):self.assertEqual([],self.central_check(self.value(name)))
        v=self.value('partial_failed');v['result']['owner_result']['error']['effect_state']='known_not_applied';self.assertIn('error_contradicts_known_effect',self.central_check(self.pin(v)))
    def test_preexisting_pipeline_context_is_not_new_run(self):
        v=self.value();a=v['request']['authority'];a['target']['pipeline_id']='pipeline:existing';v['records']['state:original']['pipeline_context_ref']='pipeline:existing'
        v['records']['pipeline:existing']={'schema_id':'pm.forge.pipeline_projection.v1','pipeline_id':'pipeline:existing','provider':a['provider'],'repository_binding_ref':a['repository_binding_ref'],'provider_pipeline_id':'native:old','state':'succeeded','jobs':[],'checks':[],'review_revision_ref':None,'checks_truncated':False,'checks_expansion_cursor_ref':None,'currentness':'current','observable_work_id':None,'updated_at_utc':'2026-09-25T09:59:00Z'}
        self.assertEqual([],self.central_check(self.sync(v)))
        v['records']['pipeline:existing']['repository_binding_ref']='foreign';self.assertIn('pipeline_context_scope',self.central_check(v))
    def test_late_definition_mutation(self):
        v=self.value()
        def mutate(*args):v['records']['definition:run']['source_revision']='foreign';return []
        self.assertIn('original_mutated',self.check(v,check_current_disclosure=mutate))

    def test_candidate_current_admission_exact_additive_arm(self):
        from jsonschema import Draft202012Validator
        old=json.loads((CANON/'Plans/forge_integration_contracts.schema.json').read_text());candidate=deepcopy(old)
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
    def test_current_disclosure_cannot_mutate_prior_definition(self):
        v=self.value()
        def mutate(*a):v['records']['definition:run']['account_id']='foreign';return []
        self.assertIn('original_mutated',ui.response_bundle_failures(self.bundle(v),forge_run_dependencies={**m.fixture_dependencies(v),'check_current_disclosure':mutate}))
    def test_public_known_unknown_effect_guards(self):
        for outcome in ('failed','cancelled'):
            v=self.value('unknown_effect');r=v['result']['owner_result'];r['outcome']=outcome;r['error']['effect_state']='known_not_applied';v['records'][r['receipt_ref']]['outcome']=outcome
            self.assertIn('error_denies_unknown_effect',self.central_check(self.pin(v)))

if __name__=='__main__':unittest.main()
