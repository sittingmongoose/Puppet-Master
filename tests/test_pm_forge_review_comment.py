"""Installed-only ACT053 regressions; no native effect proof."""
from copy import deepcopy
import importlib.util,json,os,sys,unittest
from pathlib import Path
from referencing import Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(ROOT/'scripts'))
import pm_forge_review_comment_semantics as m
import pm_ui_command_response as ui

class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures=json.loads((ROOT/'Plans/forge_review_comment_contract_fixtures.json').read_text());cls.schema=json.loads((ROOT/m.SCHEMA).read_text())
        spec=importlib.util.spec_from_file_location('cancel_gate',CANON/'scripts/pm-new-contracts-verify.py');cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central)
        cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
    def value(self,name='posted_reply'):return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name']==name))
    def check(self,v,**override):
        deps=m.fixture_dependencies(v);deps.update(override)
        return m.validate_comment_result(v['request'],v['result'],v['original_binding_ref'],v['outcome_ref'],v['response_ref'],v['delivery_return_context'],**deps)
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
            v=deepcopy(c['value']);self.assertEqual([],ui.response_bundle_failures(self.bundle(v),forge_comment_dependencies=m.fixture_dependencies(v)),c['name'])
    def test_native_dependencies_mandatory(self):
        self.assertIn('reply_native_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
    def test_old_authority_composed_unchanged(self):
        self.assertEqual({'$ref':m.schemas()[0]['Plans/forge_integration_contracts.schema.json']['$id']+'#/$defs/command_request'},self.schema['$defs']['request']['properties']['authority'])
    def test_no_original_thread(self):
        v=self.value();self.assertNotIn('thread_id',v['request']['selection']);self.assertNotIn('thread:original',v['records']);self.assertEqual([],self.check(v))
    def test_anchor_fallback_refused(self):
        v=self.value();v['records']['observation:reply']['returned_anchor']=None;self.assertIn('posted_anchor_presence',self.check(v))
    def test_unanchored_stays_unanchored(self):
        v=self.value('unanchored_comment');v['records']['observation:reply']['returned_anchor']=self.value()['request']['selection']['anchor'];self.assertIn('posted_anchor_presence',self.check(v))
    def test_revision_triple(self):
        for k in ('base_revision','head_revision','merge_base_revision'):
            v=self.value();v['records'][v['request']['selection']['review_revision_ref']][k]='foreign'
            self.assertIn('revision_'+k,self.check(v))
    def test_window_review_membership(self):
        v=self.value();ref=v['request']['selection']['anchor']['revision_anchor']['created_at_review_revision_ref'];v['records'][ref]['provider_review_id']='foreign'
        self.assertIn('revision_review_scope',self.check(v))
    def test_exact_posted_body(self):
        v=self.value();v['records']['observation:reply']['selection']['body']='substituted'
        self.assertIn('observation_original',self.check(v))
    def test_actual_native_refusal(self):
        self.assertIn('review:stale',self.check(self.value(),verify_review_authority=lambda *a:['stale']))
        self.assertIn('disclosure:revoked',self.check(self.value(),check_current_disclosure=lambda *a:['revoked']))
    def test_boolean_not_proof(self):
        for k in ('verify_original_admission','verify_review_authority','verify_comment_effect','check_current_disclosure'):
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
        v=self.value('accepted_reply');v['records'][v['response_ref']].update(result_status='succeeded',receipt_ref='receipt:borrowed');self.assertIn('response_outcome',self.check(v))
    def test_unknown_not_failed(self):
        v=self.value('unknown_reply');v['records'][v['outcome_ref']]['outcome']='failed';self.assertIn('terminal_outcome',self.check(v))
    def test_completion_requires_native_receipt(self):
        v=self.value();v['records']['observation:reply']['provider_receipt_ref']=None;self.assertIn('posted_without_provider_reply',self.check(v))
    def test_actual_work_identity(self):
        v=self.value();v['records'][v['request']['authority']['observable_work_id']]['identity']['operation_id']='foreign';self.assertIn('original_work',self.check(v))
    def test_original_caller(self):
        v=self.value();v['delivery_return_context']={'surface_id':'settings','route_ref':'route:foreign','focus_id':None,'invocation_token':'i','caller_context_ref':'c','expected_caller_revision':1,'continuation_generation':1};self.assertIn('original_return',self.check(v))
    def test_receipt_identity(self):
        v=self.value();v['records'][v['result']['owner_result']['receipt_ref']]['receipt_id']='foreign';self.assertIn('receipt_identity',self.check(v))
    def test_terminal_observation_required(self):
        v=self.value('unknown_reply');v['result']['observation_ref']=None;v['result']['owner_result']['terminal_provider_result_ref']=None
        v['records']['result:logs']=deepcopy(v['result']);v['records'][v['outcome_ref']]['owner_result_sha256']=m.owner_result_digest(v['result'])
        self.assertIn('terminal_observation_missing',self.check(v))
    def test_central_routes_domain_failure(self):
        v=self.value();v['records']['observation:reply']['selection']['body']='foreign'
        self.assertIn('observation_original',ui.response_bundle_failures(self.bundle(v),forge_comment_dependencies=m.fixture_dependencies(v)))
    def test_historical_ui_positive_fixtures(self):
        f=json.loads((CANON/'Plans/ui_command_response_fixtures.json').read_text())
        for c in f['valid']:self.assertEqual([],ui.response_bundle_failures(c))
    def test_response_cannot_predate_post(self):
        v=self.value();v['records'][v['response_ref']]['ts']='2026-09-25T09:00:00Z'
        self.assertIn('response_before_result',self.check(v))
    def test_actual_error_projection_not_unrelated_ui(self):
        v=self.value('unknown_reply');v['records'][v['response_ref']]['error']['reason']='Unrelated error'
        self.assertIn('error_projection_value',self.check(v))
        self.assertIn('error_projection_value',ui.response_bundle_failures(self.bundle(v),forge_comment_dependencies=m.fixture_dependencies(v)))
    def test_actual_error_reference_not_substituted(self):
        v=self.value('unknown_reply');v['records']['error:foreign']=deepcopy(v['records']['error:reply']);v['records'][v['outcome_ref']]['error_ref']='error:foreign'
        self.assertIn('error_projection_source',self.check(v))
    def test_error_projection_original_and_mutation(self):
        v=self.value('unknown_reply');v['records']['projection:error:reply']['identity']['operation_id']='foreign'
        self.assertIn('error_projection_source',self.check(v))
        v=self.value('unknown_reply')
        def mutate(*args):v['records']['projection:error:reply']['ui_error']['reason']='late change';return []
        self.assertIn('original_mutated',self.check(v,check_current_disclosure=mutate))
    def test_accepted_cannot_borrow_terminal_work(self):
        for state,receipt in [('completed','receipt:foreign')]:
            v=self.value('accepted_reply');v['records']['work:reply'].update(work_state=state,result_receipt_ref=receipt,cancel_available=False,background_available=False)
            self.assertIn('accepted_work_terminal',self.check(v))
            self.assertIn('accepted_work_terminal',ui.response_bundle_failures(self.bundle(v),forge_comment_dependencies=m.fixture_dependencies(v)))
    def test_cancelled_retains_owner_error_with_null_ui(self):
        v=self.value('unknown_reply');r=v['result']['owner_result'];r.update(outcome='cancelled',terminal_provider_result_ref='observation:reply');r['error']['effect_state']='known_not_applied'
        v['records'][r['receipt_ref']]['outcome']='cancelled';v['records']['observation:reply'].update(outcome='cancelled',effect_state='known_not_applied')
        v['records'][v['outcome_ref']]['outcome']='cancelled';v['records'][v['response_ref']].update(result_status='cancelled',error=None)
        v['records']['error:reply']['error']=deepcopy(r['error']);v['records']['projection:error:reply']['ui_error']=None
        v['records']['result:logs']=deepcopy(v['result']);v['records'][v['outcome_ref']]['owner_result_sha256']=m.owner_result_digest(v['result'])
        self.assertEqual([],self.check(v))
        self.assertEqual([],ui.response_bundle_failures(self.bundle(v),forge_comment_dependencies=m.fixture_dependencies(v)))

    def repin(self,v):
        rec=v['records'];original=rec[v['original_binding_ref']];original['arguments']=deepcopy(v['request']);original['payload_sha256']=m.owner_result_digest(v['request'])
        rec[v['result']['original_request_ref']]=deepcopy(v['request']);rec[rec[v['outcome_ref']]['owner_result_ref']]=deepcopy(v['result']);rec[v['outcome_ref']]['payload_sha256']=original['payload_sha256'];rec[v['outcome_ref']]['owner_result_sha256']=m.owner_result_digest(v['result'])
    def test_new_native_tracking_and_optional_returned_thread(self):
        v=self.value();obs=v['records']['observation:reply'];obs['returned_anchor']['revision_anchor'].update(tracking_state='tracked',tracking_identity_ref='tracking:new-comment')
        self.assertEqual([],self.check(v))
        schema_fixtures=json.loads((CANON/'Plans/forge_integration_contract_fixtures.json').read_text())
        thread=deepcopy(next(c['value'] for c in schema_fixtures['valid'] if c['value'].get('schema_id')=='pm.forge.review_thread.v1'))
        thread.update(thread_id='thread:new',review_revision_ref=v['request']['selection']['review_revision_ref'],**deepcopy(obs['returned_anchor']))
        obs['returned_thread_ref']='thread:new';v['records']['thread:new']=thread
        self.assertEqual([],self.check(v));thread['thread_id']='foreign';self.assertIn('returned_thread_identity',self.check(v))
    def test_returned_anchor_cannot_move_original_window_or_location(self):
        for key in ('left_review_revision_ref','right_review_revision_ref','created_at_review_revision_ref'):
            v=self.value();v['records']['observation:reply']['returned_anchor']['revision_anchor'][key]='foreign';self.assertIn('posted_anchor_window',self.check(v))
        v=self.value();v['records']['observation:reply']['returned_anchor']['path']='foreign/path';self.assertIn('posted_anchor_location',self.check(v))
    def test_incomplete_or_stale_original_not_admitted(self):
        v=self.value();rev=v['records'][v['request']['selection']['review_revision_ref']];rev.update(contents_complete=False,incomplete_reason_codes=['change_list_truncated'])
        self.assertEqual([],m.shape('review_revision',rev,'Plans/forge_integration_contracts.schema.json'))
        self.assertIn('original_revision_not_current_complete',self.check(v))
    def test_null_substitution_original_anchor_fails_actual_observation(self):
        v=self.value();v['request']['selection']['anchor']=None;self.repin(v)
        self.assertIn('observation_original',self.check(v));self.assertTrue(ui.response_bundle_failures(self.bundle(v),forge_comment_dependencies=m.fixture_dependencies(v)))
    def test_late_resolved_revision_mutation(self):
        v=self.value();ref=v['request']['selection']['review_revision_ref']
        def resolve(key):
            if key=='observation:reply':v['records'][ref]['head_revision']='foreign'
            return v['records'][key]
        self.assertIn('original_mutated',self.check(v,resolve_record=resolve))
    def test_cancelled_known_applied_comment_keeps_actual_identity(self):
        v=self.value('unknown_reply');r=v['result']['owner_result'];r.update(outcome='cancelled',terminal_provider_result_ref='observation:reply');r['error']['effect_state']='known_applied'
        v['records'][r['receipt_ref']]['outcome']='cancelled';obs=v['records']['observation:reply'];obs.update(outcome='cancelled',effect_state='known_applied',provider_comment_id='comment:posted-before-cancel',provider_receipt_ref='provider:actual',returned_anchor=deepcopy(v['request']['selection']['anchor']))
        v['records'][v['outcome_ref']]['outcome']='cancelled';v['records'][v['response_ref']].update(result_status='cancelled',error=None)
        v['records']['error:reply']['error']=deepcopy(r['error']);v['records']['projection:error:reply']['ui_error']=None;self.repin(v)
        self.assertEqual([],self.check(v));self.assertEqual([],ui.response_bundle_failures(self.bundle(v),forge_comment_dependencies=m.fixture_dependencies(v)))
    def test_unknown_owner_error_overrides_failed_label(self):
        v=self.value('unknown_reply');r=v['result']['owner_result'];r['outcome']='failed';v['records'][r['receipt_ref']]['outcome']='failed'
        obs=v['records']['observation:reply'];obs.update(outcome='rejected',effect_state='known_not_applied');self.repin(v)
        self.assertEqual([],self.check(v));v['records'][v['outcome_ref']]['outcome']='failed';v['records'][v['response_ref']]['result_status']='failed'
        self.assertIn('terminal_outcome',self.check(v))

    def test_posted_effect_survives_later_failed_operation(self):
        v=self.value('unknown_reply');r=v['result']['owner_result'];r.update(outcome='failed',terminal_provider_result_ref='observation:reply');r['error']['effect_state']='known_applied'
        v['records'][r['receipt_ref']]['outcome']='failed';obs=v['records']['observation:reply'];obs.update(outcome='posted',effect_state='known_applied',provider_comment_id='comment:actually-posted',provider_receipt_ref='provider:actual',returned_anchor=deepcopy(v['request']['selection']['anchor']))
        v['records'][v['outcome_ref']]['outcome']='failed';v['records'][v['response_ref']]['result_status']='failed';v['records']['error:reply']['error']=deepcopy(r['error']);self.repin(v)
        self.assertEqual([],m.shape('fixture_case',v));self.assertEqual([],self.check(v));self.assertEqual([],ui.response_bundle_failures(self.bundle(v),forge_comment_dependencies=m.fixture_dependencies(v)))
        for contradictory in ('known_not_applied','none'):
            x=deepcopy(v);x['result']['owner_result']['error']['effect_state']=contradictory;x['records']['error:reply']['error']=deepcopy(x['result']['owner_result']['error']);self.repin(x)
            self.assertEqual([],m.shape('fixture_case',x));self.assertIn('owner_error_contradicts_applied_comment',self.check(x));self.assertIn('owner_error_contradicts_applied_comment',ui.response_bundle_failures(self.bundle(x),forge_comment_dependencies=m.fixture_dependencies(x)))
        r['error']['effect_state']='unknown';v['records']['error:reply']['error']=deepcopy(r['error']);v['records'][v['outcome_ref']]['outcome']='terminal_unknown';v['records'][v['response_ref']]['result_status']='recovery_required';self.repin(v)
        self.assertEqual([],self.check(v));self.assertEqual([],ui.response_bundle_failures(self.bundle(v),forge_comment_dependencies=m.fixture_dependencies(v)))

if __name__=='__main__':unittest.main()
