"""Installed-only ACT118 finite joins; redacted synthetic doubles, not native proof."""
from copy import deepcopy
import importlib.util,json,os,sys,unittest
from pathlib import Path
from referencing import Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT));sys.path.insert(0,str(ROOT/'scripts'))
import pm_backup_key_rotation as m
import pm_ui_command_response as ui
class T(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.fixtures=json.loads((ROOT/'Plans/backup_key_rotation_contract_fixtures.json').read_text());cls.schema=json.loads((ROOT/m.SCHEMA).read_text())
  spec=importlib.util.spec_from_file_location('rotation_gate',CANON/'scripts/pm-new-contracts-verify.py');cls.central=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.central);cls.registry=cls.central.offline_schema_registry().with_resource(cls.schema['$id'],Resource.from_contents(cls.schema))
 def value(self,name='completed_two_repository_rotation'):return deepcopy(next(c['value'] for c in self.fixtures['valid'] if c['name']==name))
 def check(self,v,**override):
  deps=m.fixture_dependencies(v);deps.update(override);return m.validate_rotation_result(v['request'],v['result'],v['original_binding_ref'],v['outcome_ref'],v['response_ref'],v['delivery_return_context'],**deps)
 def bundle(self,v):
  rec=v['records'];o=rec[v['original_binding_ref']]
  return dict(response=rec[v['response_ref']],response_ref=v['response_ref'],owner_result=v['result'],owner_request=v['request'],original_binding_ref=v['original_binding_ref'],delivery_return_context=v['delivery_return_context'],resolved_outcome_ref=v['outcome_ref'],outcome=rec[v['outcome_ref']],resolved_owner_result_ref=rec[v['outcome_ref']]['owner_result_ref'],original_response=None,normalized_request=dict(request_ref=o['request_ref'],command_id=m.COMMAND,command_instance_id=o['identity']['command_instance_id'],operation_id=o['identity']['operation_id'],owner_identity=o['identity'],**{k:o[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}))
 def central_check(self,v):return ui.response_bundle_failures(self.bundle(v),backup_rotation_dependencies=m.fixture_dependencies(v))
 def pin(self,v):
  rec=v['records'];r=v['result'];q=v['request'];original=rec[v['original_binding_ref']];original['arguments']=deepcopy(q);original['payload_sha256']=m.owner_result_digest(q);rec[r['original_request_ref']]=deepcopy(q);rec[rec[v['outcome_ref']]['owner_result_ref']]=deepcopy(r);rec[v['outcome_ref']]['payload_sha256']=original['payload_sha256'];rec[v['outcome_ref']]['owner_result_sha256']=m.owner_result_digest(r)
  if r['receipt_ref'] is not None:
   for k,x in r.items():
    if k not in ('schema_id','schema_version'):rec[r['receipt_ref']][k]=deepcopy(x)
 def test_actual_central_fixture_protocol(self):
  for group in ('valid','invalid'):
   for c in self.fixtures[group]:
    d,s=self.central.select_definition(self.schema,c,c['value'],require_valid=group=='valid');self.assertEqual([],list(self.central.validator_for(self.schema,s,self.registry).iter_errors(c['value'])))
    actual=ui.contracts().contract_semantic_failures(m.SCHEMA,d,c['value'])
    if group=='valid':self.assertEqual([],actual,c['name'])
    else:self.assertIn(c['semantic_rule'],actual)
 def test_actual_backup_union_absolute_reference(self):
  aggregate=json.loads((CANON/'Plans/backup_restore_system_contracts.schema.json').read_text())
  v=self.value()
  for definition,value in (('request',v['request']),('result',v['result']),('submission',v['records'][v['request']['authority']['protected_submission_ref']])):
   candidate=deepcopy(aggregate);candidate['oneOf']=[{'$ref':self.schema['$id']+'#/$defs/'+definition}]
   self.assertEqual([],list(self.central.validator_for(candidate,candidate,self.registry).iter_errors(value)))
 def test_delayed_consumption_observation_is_not_expired_use(self):
  v=self.value();later='2026-09-25T10:06:00Z'
  v['records']['use:rotation']['observed_at_utc']=later
  v['records'][v['request']['session_association_ref']]['observed_at_utc']=later
  v['result']['observed_at_utc']=later;v['records'][v['outcome_ref']]['observed_at']=later;v['records'][v['response_ref']]['ts']=later
  self.pin(v);self.assertEqual([],self.central_check(v))
 def test_genuinely_expired_consumption_rejected(self):
  v=self.value();v['records']['use:rotation'].update(consumed_at_utc='2026-09-25T10:04:01Z',observed_at_utc='2026-09-25T10:06:00Z')
  v['records'][v['request']['session_association_ref']]['observed_at_utc']='2026-09-25T10:06:00Z';v['result']['observed_at_utc']='2026-09-25T10:06:00Z';v['records'][v['outcome_ref']]['observed_at']='2026-09-25T10:06:00Z';v['records'][v['response_ref']]['ts']='2026-09-25T10:06:00Z'
  self.pin(v);self.assertIn('expired_input_consumption',self.central_check(v))
 def test_failed_unknown_verification_binds_actual_added_generation(self):
  for name,fact in (('unknown_engine','unknown'),('partial_failed','not_applied')):
   v=self.value(name);v['records']['phase:1:verify'].update(fact=fact,slot_generation=99)
   self.assertIn('verify_selected_slot_generation',self.central_check(v))
 def test_consumption_requires_actual_bound_session_validity(self):
  v=self.value();v['records']['session:rotation']['expires_at_utc']='2026-09-25T10:00:03Z'
  self.assertIn('expired_session_consumption',self.central_check(v))
 def test_actual_common_response_all_phases(self):
  for c in self.fixtures['valid']:self.assertEqual([],self.central_check(deepcopy(c['value'])),c['name'])
 def test_pending_secure_session_without_fabricated_work(self):
  for name in ('awaiting_protected_input','engine_in_progress'):
   v=self.value(name);self.assertNotIn('observable_work_ref',v['result']);self.assertIsNone(v['result']['receipt_ref']);self.assertEqual([],self.central_check(v))
 def test_missing_native_adapters(self):self.assertIn('rotation_native_dependencies_missing',ui.response_bundle_failures(self.bundle(self.value())))
 def test_boolean_not_native_proof(self):
  for k in ('verify_original_admission','verify_rotation_sources','verify_protected_session','verify_engine_effects','check_current_disclosure'):
   self.assertTrue(any(x.endswith('invalid_proof') for x in self.check(self.value(),**{k:lambda *a:True})))
 def test_human_audience_revoked_native_owner(self):self.assertIn('protected:human_or_audience_revoked',self.check(self.value(),verify_protected_session=lambda *a:['human_or_audience_revoked']))
 def test_foreign_original_client(self):
  v=self.value();v['records'][v['original_binding_ref']]['initiating_client_id']='client:other';self.assertIn('original_client',self.central_check(v))
 def test_foreign_session_client(self):
  v=self.value();v['records']['session:rotation']['audience_client_id']='client:other';self.assertIn('protected_session_scope',self.check(v))
 def test_protected_input_never_persisted(self):
  v=self.value();v['records'][v['request']['authority']['protected_submission_ref']]['input_contract']['persistence_allowed']=True;self.assertTrue(self.check(v))
 def test_consumed_receipt_and_zeroize_required(self):
  for field in ('consume_receipt_ref','zeroize_receipt_ref'):
   v=self.value();v['records']['use:rotation'][field]=None;self.assertIn('consumed_without_zeroize_evidence',self.check(v))
 def test_consumed_input_cannot_reenter_awaiting(self):
  v=self.value('awaiting_protected_input');v['records']['use:rotation']=deepcopy(self.value()['records']['use:rotation']);self.assertIn('awaiting_input_state',self.central_check(v))
 def test_unknown_consumption_is_terminal_unknown(self):
  v=self.value('unknown_engine');v['records']['use:rotation'].update(state='unknown',reconciliation_ref=v['result']['reconciliation_ref']);self.assertEqual([],self.central_check(v))
  v['result']['outcome']='failed';v['records'][v['outcome_ref']]['outcome']='failed';v['records'][v['response_ref']]['result_status']='failed';self.pin(v);self.assertIn('unknown_consumption_erased',self.central_check(v))
 def test_independent_generations_not_plus_one(self):
  v=self.value();self.assertEqual((2,7,11),(v['records']['set:before']['recovery_set_generation'],v['records']['set:after']['recovery_set_generation'],v['records']['use:rotation']['input_generation']));self.assertEqual([],self.check(v))
 def test_global_verification_before_any_retirement(self):
  v=self.value();v['records']['phase:0:retire']['causal_predecessor_refs']=['phase:0:verify'];self.assertIn('retirement_before_global_verification',self.central_check(v))
 def test_verification_exact_added_slot(self):
  v=self.value();v['records']['phase:0:verify']['causal_predecessor_refs']=['phase:1:add'];self.assertIn('verify_without_actual_add',self.check(v))
 def test_other_repository_receipt_cannot_substitute(self):
  v=self.value();v['records']['phase:0:verify']['repository_id']=v['records']['phase:1:verify']['repository_id'];self.assertIn('phase_identity',self.check(v))
 def test_reviewed_repository_complete_inventory(self):
  v=self.value();v['records']['transition:rotation']['members'].pop();self.assertIn('transition_membership',self.check(v))
 def test_original_slot_identity(self):
  v=self.value();v['records']['review:rotation']['members'][0]['retire_slot_ids']=['slot:foreign'];self.assertTrue(self.check(v))
 def test_unreviewed_mutation_refused(self):
  v=self.value();v['records']['slots:after:0']['key_slots'].append(dict(v['records']['slots:after:0']['key_slots'][1],key_slot_id='slot:foreign'));self.assertIn('unreviewed_slot_effect',self.check(v))
 def test_partial_cancellation_preserves_effects_and_null_ui(self):
  v=self.value('partial_cancelled');self.assertEqual('known_applied',v['result']['effect_state']);self.assertIsNone(v['records'][v['response_ref']]['error']);self.assertIsNotNone(v['result']['error_ref']);self.assertEqual([],self.central_check(v))
 def test_delivery_is_not_rotation_completion(self):
  v=self.value('awaiting_protected_input');v['records']['session:rotation']['terminal_status']='delivered';self.assertIn('awaiting_input_state',self.check(v))
 def test_pending_cannot_borrow_terminal_receipt(self):
  v=self.value('awaiting_protected_input');v['result']['receipt_ref']='receipt:rotation';self.pin(v);self.assertIn('accepted_terminal_evidence',self.central_check(v))
 def test_engine_progress_requires_actual_transition(self):
  v=self.value('engine_in_progress');v['result']['transition_ref']=None;self.pin(v);self.assertIn('engine_progress_without_evidence',self.check(v))
 def test_failed_completion_not_promoted(self):
  v=self.value('partial_failed');v['result'].update(outcome='completed',error_ref=None);self.pin(v);self.assertIn('incomplete_rotation_success',self.check(v))
 def test_receipt_exact_identity(self):
  v=self.value();v['records']['receipt:rotation']['receipt_ref']='receipt:foreign';self.assertIn('receipt_identity',self.check(v))
 def test_foreign_error_ref_or_text(self):
  v=self.value('partial_failed');v['records'][v['response_ref']]['error']['reason']='foreign';self.assertIn('response_error',self.check(v))
 def test_actual_caller_not_null_equivalent(self):
  v=self.value();v['delivery_return_context']={'surface_id':'settings','route_ref':'r','focus_id':None,'invocation_token':'i','caller_context_ref':'c','expected_caller_revision':1,'continuation_generation':1};self.assertIn('original_return',self.check(v))
 def test_late_resolved_original_mutation(self):
  v=self.value()
  def mutate(*a):v['records']['review:rotation']['actor_ref']='foreign';return []
  self.assertIn('original_mutated',self.check(v,check_current_disclosure=mutate))
 def test_callback_argument_mutation(self):
  def mutate(o,*a):o['actor_ref']='foreign';return []
  self.assertIn('proof_input_mutated',self.check(self.value(),verify_original_admission=mutate))
 def test_historical_ui_cases_unchanged(self):
  for c in json.loads((CANON/'Plans/ui_command_response_fixtures.json').read_text())['valid']:self.assertEqual([],ui.response_bundle_failures(c))
 def test_delivery_is_not_saved_kit_unlock_test(self):
  v=self.value();v['records']['set:after']['kit_confirmation']='unlock_tested';self.assertIn('kit_confirmation_without_actual_session',self.check(v))
  kit=deepcopy(v['records']['session:rotation']);kit.update(delivery_session_id='kit:test',recovery_set_generation=7,action='test_saved',terminal_status='tested',result_receipt_ref='receipt:actual-kit-test');v['records']['kit:test']=kit;v['records']['set:after']['last_kit_delivery_receipt_ref']=kit['result_receipt_ref'];v['records']['transition:rotation']['kit_session_refs']=['kit:test'];self.assertEqual([],self.check(v))
  kit.update(action='acknowledge_saved',terminal_status='acknowledged');self.assertIn('kit_confirmation_without_actual_session',self.check(v))
 def test_mixed_per_repository_retirement_not_flattened(self):
  v=self.value('partial_failed');v['records']['phase:0:retire']=deepcopy(self.value()['records']['phase:0:retire']);v['records']['slots:after:0']['key_slots'][0]=deepcopy(self.value()['records']['slots:after:0']['key_slots'][0]);self.assertEqual([],self.central_check(v))
 def test_future_engine_phase_not_evidence(self):
  v=self.value();v['records']['phase:0:add']['observed_at_utc']='2026-09-26T00:00:00Z';self.assertIn('phase_time',self.check(v))
 def test_retirement_keeps_original_slot_generation(self):
  v=self.value();v['records']['phase:0:retire']['slot_generation']=99;v['records']['slots:after:0']['key_slots'][0]['generation']=99;v['records']['set:after']['key_slots'][0]['generation']=99;self.assertIn('retire_original_slot_generation',self.check(v))
 def test_expired_pending_input_not_current(self):
  v=self.value('awaiting_protected_input');v['records'][v['request']['authority']['protected_submission_ref']]['input_contract']['expires_at_utc']='2026-09-25T10:01:00Z';self.assertIn('expired_pending_input',self.check(v))
 def test_replay_preserves_original_consumption_not_resubmission(self):
  v=self.value();r=v['records'][v['response_ref']];old=deepcopy(r);original_dispatch=r['dispatch_id'];v['records'][original_dispatch]=old;r.update(dispatch_id='dispatch:replay',original_dispatch_id=original_dispatch,replayed=True)
  self.assertEqual([],self.check(v));v['records']['use:rotation'].update(state='unused',consume_receipt_ref=None,zeroize_receipt_ref=None);self.assertIn('engine_without_consumed_input',self.check(v))
if __name__=='__main__':unittest.main()
