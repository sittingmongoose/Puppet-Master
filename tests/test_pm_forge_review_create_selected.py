"""Installed ACT048 static protocol tests; all proof adapters are synthetic doubles."""
from copy import deepcopy
import importlib.util,json,os,sys,unittest
from pathlib import Path
from referencing import Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(ROOT/'scripts'))
import pm_forge_review_create_selected_semantics as m
import pm_ui_command_response as ui

class T(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.fixtures=json.loads((ROOT/'Plans/forge_review_create_selected_contract_fixtures.json').read_text());cls.schema=json.loads((ROOT/m.SCHEMA).read_text())
  spec=importlib.util.spec_from_file_location('create_gate',CANON/'scripts/pm-new-contracts-verify.py');cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central)
  cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
 def value(self,name='created_without_publication'):return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name']==name))
 def check(self,v,**override):
  deps=m.fixture_dependencies(v);deps.update(override)
  return m.validate_create_result(v['request'],v['result'],v['original_binding_ref'],v['outcome_ref'],v['response_ref'],v['delivery_return_context'],**deps)
 def bundle(self,v):
  o=v['records'][v['original_binding_ref']]
  return {'response':v['records'][v['response_ref']],'response_ref':v['response_ref'],'owner_result':v['result'],'owner_request':v['request'],'original_binding_ref':v['original_binding_ref'],'delivery_return_context':v['delivery_return_context'],'resolved_outcome_ref':v['outcome_ref'],'outcome':v['records'][v['outcome_ref']],'resolved_owner_result_ref':v['records'][v['outcome_ref']]['owner_result_ref'],'original_response':None,'normalized_request':{'request_ref':o['request_ref'],'command_id':m.COMMAND,'command_instance_id':o['identity']['command_instance_id'],'operation_id':o['identity']['operation_id'],'owner_identity':o['identity'],**{k:o[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}}
 def central_check(self,v,**override):
  deps=m.fixture_dependencies(v);deps.update(override)
  return ui.response_bundle_failures(self.bundle(v),forge_create_selected_dependencies=deps)
 def pin(self,v):
  r=v['records'];o=r[v['original_binding_ref']];o['arguments']=deepcopy(v['request']);o['payload_sha256']=m.owner_result_digest(v['request']);r[v['result']['original_request_ref']]=deepcopy(v['request']);out=r[v['outcome_ref']];out['payload_sha256']=o['payload_sha256'];out['owner_result_sha256']=m.owner_result_digest(v['result']);r[out['owner_result_ref']]=deepcopy(v['result'])
 def test_actual_gate_metadata(self):
  self.assertEqual(self.schema['x-schema-id'],self.fixtures['contract_schema_id'])
  for group in ('valid','invalid'):
   for c in self.fixtures[group]:
    d,s=self.central.select_definition(self.schema,c,c['value'],require_valid=group=='valid');self.assertEqual([],list(self.central.validator_for(self.schema,s,self.registry).iter_errors(c['value'])),c['name']);f=ui.contracts().contract_semantic_failures(m.SCHEMA,d,c['value'])
    if group=='valid':self.assertEqual([],f,c['name'])
    else:self.assertIn(c['semantic_rule'],f,c['name'])
 def test_actual_central_all_paths(self):
  for c in self.fixtures['valid']:self.assertEqual([],self.central_check(deepcopy(c['value'])),c['name'])
 def test_historical_ui_fixtures(self):
  for c in json.loads((CANON/'Plans/ui_command_response_fixtures.json').read_text())['valid']:self.assertEqual([],ui.response_bundle_failures(c))
 def test_mandatory_native_adapters(self):self.assertIn('create_native_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
 def test_original_common_authority_unchanged(self):self.assertEqual({'$ref':m.schemas()[0]['Plans/forge_integration_contracts.schema.json']['$id']+'#/$defs/command_request'},self.schema['$defs']['request']['properties']['authority'])
 def test_exact_create_inputs(self):
  for key,val in [('title','substitute'),('body','substitute'),('draft',False)]:
   v=self.value();v['records']['observation:reply']['selection'][key]=val;self.assertIn('observation_original',self.central_check(v))
 def test_base_head_source_original(self):
  for key in ('head','base'):
   v=self.value();v['records']['source:create'][key]['object_id']='foreign';self.assertIn('create_source_original',self.central_check(v))
 def test_agent_draft_policy(self):
  v=self.value();v['request']['authority']['permission']['actor_kind']='agent';v['request']['selection']['draft']=False;v['records']['observation:reply']['selection']=deepcopy(v['request']['selection']);self.pin(v);self.assertIn('agent_non_draft_policy_missing',self.central_check(v));v['records']['source:create']['draft_policy_ref']='policy:actual-explicit';self.assertEqual([],self.central_check(v))
 def test_issued_review_requires_receipt(self):
  v=self.value();v['records']['observation:reply']['provider_receipt_ref']=None;self.assertIn('created_identity_missing',self.central_check(v))
 def test_no_invented_preexisting_review(self):
  v=self.value();v['request']['authority']['target']['provider_review_id']='review:invented';self.pin(v);self.assertTrue(self.central_check(v))
 def test_unknown_error_cannot_deny_effect(self):
  v=self.value('unknown_create');v['result']['owner_result']['outcome']='failed';v['records'][v['result']['owner_result']['receipt_ref']]['outcome']='failed';v['result']['owner_result']['error']['effect_state']='known_not_applied';v['records']['error:reply']['error']=deepcopy(v['result']['owner_result']['error']);self.pin(v);self.assertIn('error_denies_create_effect',self.central_check(v))
 def test_failed_retains_issued_review(self):
  v=self.value('unknown_create');r=v['result']['owner_result'];r.update(outcome='failed');r['error']['effect_state']='known_applied';v['records'][r['receipt_ref']]['outcome']='failed';v['records']['observation:reply'].update(outcome='created',effect_state='known_applied',provider_review_id='review:issued',provider_receipt_ref='receipt:provider');v['records']['error:reply']['error']=deepcopy(r['error']);v['records'][v['outcome_ref']]['outcome']='failed';v['records'][v['response_ref']]['result_status']='failed';self.pin(v);self.assertEqual([],self.central_check(v))
 def test_cancelled_null_ui_and_noop(self):
  v=self.value('cancelled_before_creation');self.assertIsNone(v['records'][v['response_ref']]['error']);self.assertEqual([],self.central_check(v));v['records'][v['response_ref']]['result_status']='no_op';self.assertIn('response_outcome',self.central_check(v))
 def test_accepted_actual_work_nonterminal(self):
  v=self.value('accepted_create');v['records']['work:reply'].update(work_state='completed',result_receipt_ref='receipt:foreign',cancel_available=False,background_available=False);self.assertIn('accepted_work_terminal',self.central_check(v))
 def test_error_projection_scope(self):
  v=self.value('unknown_create');v['records']['projection:error:reply']['identity']['operation_id']='foreign';self.assertIn('error_projection_source',self.central_check(v))
 def test_error_value_exact(self):
  v=self.value('unknown_create');v['records'][v['response_ref']]['error']['reason']='foreign';self.assertIn('error_projection_value',self.central_check(v))
 def test_original_caller(self):
  v=self.value();v['delivery_return_context']['route_ref']='route:foreign';self.assertIn('original_return',self.central_check(v))
 def test_digest_owner_callback(self):self.assertIn('original_digest',self.check(self.value(),canonical_digest=lambda v:'f'*64))
 def test_native_refusal(self):
  for k in ('verify_original_admission','verify_review_authority','verify_create_effect','check_current_disclosure'):
   self.assertTrue(any('revoked' in e for e in self.central_check(self.value(),**{k:lambda *a:['revoked']})))
 def test_boolean_not_authority(self):
  for k in ('verify_original_admission','verify_review_authority','verify_create_effect','check_current_disclosure'):
   self.assertTrue(any('invalid_proof' in e for e in self.central_check(self.value(),**{k:lambda *a:True})))
 def test_callback_mutation(self):
  def mutate(o,*a):o['actor_ref']='foreign';return []
  self.assertIn('proof_input_mutated',self.central_check(self.value(),verify_original_admission=mutate))
 def test_late_original_mutation(self):
  v=self.value()
  def mutate(*a):v['records'][v['original_binding_ref']]['actor_ref']='foreign';return []
  self.assertIn('original_mutated',self.central_check(v,check_current_disclosure=mutate))
 def test_publication_distinct_identity(self):
  for kind in ('git','jj'):
   v=self.value('created_with_'+kind);self.assertNotEqual(v['records']['publication:selected']['identity']['operation_id'],v['records'][v['original_binding_ref']]['identity']['operation_id']);self.assertEqual([],self.central_check(v))
 def test_publication_authentication_refusal(self):
  for k in ('verify_publication_approval','verify_publication_owner'):
   for kind in ('git','jj'):
    self.assertTrue(any('revoked' in e for e in self.central_check(self.value('created_with_'+kind),**{k:lambda *a:['revoked']})));self.assertTrue(any('invalid_proof' in e for e in self.central_check(self.value('created_with_'+kind),**{k:lambda *a:True})))
 def test_publication_approval_scope_and_digest(self):
  for kind in ('git','jj'):
   for key,value,expected in [('effective_account_binding','foreign','publication_approval_account'),('approval_target_ref','foreign','publication_approval_target'),('reviewed_values_sha256','e'*64,'publication_approval_digest')]:
    v=self.value('created_with_'+kind);v['records']['approval:selected'][key]=value;self.assertIn(expected,self.central_check(v))
 def test_publication_previews_not_hash_only(self):
  v=self.value('created_with_git');v['records']['preview:push:origin']['push_url']='ssh://foreign.example/repo';self.assertIn('publication_preview_push_url',self.central_check(v))
 def test_publication_selected_head(self):
  for kind in ('git','jj'):
   v=self.value('created_with_'+kind);v['request']['selection']['publication']['destination_ref']='refs/heads/foreign';v['records']['observation:reply']['selection']=deepcopy(v['request']['selection']);self.pin(v);self.assertIn('publication_review_head',self.central_check(v))
 def test_git_success_native_readback(self):
  v=self.value('created_with_git');v['records']['observation:remote-target:origin']['observed_heads'][0]['head']['object_id']='f'*40;self.assertIn('publication_success_evidence',self.central_check(v))
 def test_git_unknown_not_complete(self):
  v=self.value('created_with_git');v['records']['observation:remote-target:origin'].update(outcome='outcome_unknown',effect_state='unknown');v['records']['reconciliation:remote-target:origin']['state']='outcome_unknown';self.assertIn('publication_unknown_overall',self.central_check(v))
 def test_git_object_format(self):
  v=self.value('created_with_git');v['records']['preview:push:origin']['mappings'][0]['source_object']='f'*64;self.assertIn('publication_mapping_object_format',self.central_check(v))
 def test_git_receipt_original(self):
  v=self.value('created_with_git');v['records']['receipt:jj:result:1']['operation_id']='foreign';self.assertIn('publication_receipt_operation_id',self.central_check(v))
 def test_jj_actual_oracle_runs(self):
  v=self.value('created_with_jj');v['records']['observation:remote-target:origin']['observed_heads'][0]['head']['object_id']='foreign';self.assertTrue(self.central_check(v))
 def test_jj_actual_dispatch_original(self):
  v=self.value('created_with_jj');v['records']['sir:jj:original']['identity']['operation_id']='foreign';self.assertIn('publication_jj_original_dispatch',self.central_check(v))
 def test_late_publication_mutation(self):
  v=self.value('created_with_git')
  def mutate(*a):v['records']['approval:selected']['effective_account_binding']='foreign';return []
  self.assertIn('original_mutated',self.central_check(v,check_current_disclosure=mutate))
 def test_prebirth_cancellation_needs_no_fabricated_work(self):
  v=self.value('cancelled_before_creation');v['request']['authority']['observable_work_id']=None;v['result']['owner_result']['observable_work_id']=None;v['records'][v['result']['owner_result']['receipt_ref']]['observable_work_id']=None;v['records']['observation:reply']['effect_state']='not_attempted';self.pin(v);self.assertEqual([],m.shape('fixture_case',v));self.assertEqual([],self.central_check(v))
 def test_git_partial_peer_does_not_erase_selected_success(self):
  v=self.value('created_with_git');r=v['records'];r['publication:selected']['status']='failed';r['receipt:jj:result:1']['outcome']='failed';r['observation:remote-target:upstream'].update(outcome='failed',effect_state='known_not_applied',native_receipt_ref=None,observed_heads=[]);r['reconciliation:remote-target:upstream']['state']='observed_failure';self.assertEqual([],self.central_check(v))
 def test_git_unknown_evidence_retained(self):
  v=self.value('created_with_git');r=v['records'];r['publication:selected']['status']='unknown';r['receipt:jj:result:1']['outcome']='effect_unknown';r['observation:remote-target:upstream'].update(outcome='outcome_unknown',effect_state='unknown',native_receipt_ref=None,observed_heads=[]);r['reconciliation:remote-target:upstream']['state']='outcome_unknown';self.assertEqual([],self.central_check(v))
 def test_git_lease_is_real_original(self):
  v=self.value('created_with_git');v['records']['lease:jj:29']['expires_at_utc']='2026-08-31T19:59:30Z';self.assertIn('publication_original_lease_time',self.central_check(v))
 def test_git_force_keeps_existing_guard(self):
  v=self.value('created_with_git');v['records']['preview:push:origin']['force_guard'].update(force_requested=True,expected_head_ref='preview:foreign',lease_ref='lease:foreign',dangerous_action_policy_ref='policy:real');self.assertIn('publication_force_original',self.central_check(v))
 def test_original_result_digest_not_replaced(self):
  v=self.value();v['records'][v['outcome_ref']]['owner_result_sha256']='f'*64;self.assertIn('original_digest',self.central_check(v))
 def test_response_cannot_predate_effect(self):
  v=self.value();v['records'][v['response_ref']]['ts']='2026-09-25T09:00:00Z';self.assertIn('response_before_result',self.central_check(v))
 def test_non_secret_git_native_url_grammar_preserved(self):
  v=self.value('created_with_git');r=v['records'];remote=r['remote-operation:original'];remote['push_targets'][0]['push_url']='git@example.invalid:owner/repo.git';r['preview:push:origin']['push_url']=remote['push_targets'][0]['push_url'];a=r['approval:selected'];values={'original_request_ref':'request:original','identity':r['publication:selected']['identity'],'remote_target':remote,'previews':[r[t['preview_ref']] for t in remote['push_targets']]};a['reviewed_values_sha256']=a['confirmation']['target_binding_sha256']=m.owner_result_digest(values);self.assertEqual([],self.central_check(v))
 def test_replay_remains_same_original(self):
  v=self.value();response=v['records'][v['response_ref']];original=deepcopy(response);v['records'][original['dispatch_id']]=original;response.update(dispatch_id='dispatch:replay',replayed=True,original_dispatch_id=original['dispatch_id']);b=self.bundle(v);b['original_response']=original;self.assertEqual([],ui.response_bundle_failures(b,forge_create_selected_dependencies=m.fixture_dependencies(v)));response['receipt_ref']='receipt:foreign';self.assertTrue(ui.response_bundle_failures(b,forge_create_selected_dependencies=m.fixture_dependencies(v)))
 def test_actual_issued_revision_not_invented_original(self):
  v=self.value();f=json.loads((CANON/'Plans/forge_integration_contract_fixtures.json').read_text());rev=deepcopy(next(c['value'] for c in f['valid'] if c['value'].get('schema_id')=='pm.forge.review_revision.v1'));rev.update(review_revision_id='revision:issued',provider_review_id='review:new',provider=v['request']['authority']['provider'],repository_binding_ref=v['request']['authority']['repository_binding_ref'],head_revision=v['request']['selection']['head']['object_id'],base_revision=v['request']['selection']['base']['object_id']);v['records']['revision:issued']=rev;v['records']['observation:reply']['returned_revision_ref']='revision:issued';self.assertEqual([],self.central_check(v));rev['head_revision']='foreign';self.assertIn('created_revision_original',self.central_check(v))
 def test_git_explicit_original_work_preserved(self):
  v=self.value('created_with_git');v['records']['request:original']['observable_work_id']='work:foreign';self.assertEqual([],m.shape('fixture_case',v));self.assertIn('publication_original_work_reference',self.central_check(v))
  v=self.value('created_with_git');del v['records']['request:original']['observable_work_id'];self.assertEqual([],self.central_check(v))
 def test_jj_actual_dispatch_digest_permission_idempotency(self):
  for field,value,rule in [('payload_sha256','e'*64,'publication_jj_original_payload'),('idempotency_key','foreign','publication_jj_original_idempotency'),('permission_snapshot_ref','foreign','publication_jj_original_permission')]:
   v=self.value('created_with_jj');v['records']['sir:jj:original'][field]=value;self.assertEqual([],m.shape('fixture_case',v));self.assertIn(rule,self.central_check(v))
 def test_jj_actual_admission_chronology(self):
  for stamp in ('2026-08-31T19:59:00Z','2026-08-31T20:11:00Z'):
   v=self.value('created_with_jj');v['records']['sir:jj:original']['accepted_at_utc']=stamp;self.assertIn('publication_jj_original_admission_time',self.central_check(v))

if __name__=='__main__':unittest.main()
