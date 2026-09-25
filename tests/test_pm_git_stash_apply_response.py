"""Installed actual central pipeline; all fixture records are synthetic doubles."""
import json,os,sys,unittest
from pathlib import Path
from copy import deepcopy as cp
ROOT=Path(os.environ.get('PM_CANON_ROOT',Path(__file__).resolve().parents[1]));sys.path.insert(0,str(ROOT/'scripts'))
import pm_ui_command_response as UI
import pm_git_stash_apply_response as m
STAGE=Path(m.__file__).resolve().parents[1]
FIX=json.loads((STAGE/'Plans/sir_git_stash_apply_dispatch_fixtures.json').read_text())
def check(x,**kwargs):
 deps=m.fixture_dependencies(x,ui_module=UI);deps.update(kwargs);return UI.response_bundle_failures(x['bundle'],**deps)
class Response(unittest.TestCase):
 def setUp(self):self.x=cp(next(c['value'] for c in FIX['valid'] if c['name']=='file_changes_only_completed'))
 def named(self,name):self.x=cp(next(c['value'] for c in FIX['valid'] if c['name']==name));return self.x
 def test_central_rejects_invented_acquisition_and_unverified_retention(self):
  self.assertEqual(check(self.x),[])
  x=cp(next(c['value'] for c in FIX['invalid'] if c['name']=='completed_success_with_unverified_after_stash_source'))
  self.assertIn('stash_apply_stash_retained_verification',check(x))
  self.setUp();self.x['records']['stash:after']['availability']='unknown'
  self.assertIn('stash_apply_stash_retained_verification',check(self.x))
  self.setUp();source=self.x['records']['stash:selected']
  source.update(availability='acquired_under_admission',acquisition_receipt_ref='native:acquire')
  receipt=cp(self.x['records']['native:apply']);receipt['receipt_id']='native:acquire'
  receipt['phase'].update(native_receipt_ref='native:acquire',finished_at_utc='2026-09-25T09:59:00Z')
  self.x['records']['native:acquire']=receipt
  self.assertIn('stash_apply_unresolved:stash_source_schema',check(self.x))
 def test_central_requires_post_apply_after_stash_source_window(self):
  self.assertEqual(check(self.x),[])
  apply=self.x['records']['observation:stash-apply']['apply']
  for observed in ('2026-09-25T09:59:05Z','2026-09-25T10:00:30Z'):
   self.setUp();self.x['records']['stash:after']['observed_at_utc']=observed
   self.assertIn('stash_apply_stash_retained_window',check(self.x),observed)
  for name in ('completed_success_with_pre_request_after_stash_source',
               'completed_success_with_after_stash_source_before_apply_completion'):
   value=cp(next(c['value'] for c in FIX['invalid'] if c['name']==name))
   self.assertIn('stash_apply_stash_retained_window',check(value),name)
  self.setUp();self.x['records']['stash:after']['observed_at_utc']=apply['finished_at_utc']
  self.assertEqual(check(self.x),[])
  for name in ('unknown_effect','cancelled_apply_null_ui_error'):
   self.named(name);self.x['records']['stash:after']['observed_at_utc']='2026-09-25T09:59:05Z'
   self.assertEqual(check(self.x),[],name)
 def test_central_metadata_and_actual_composition(self):
  schema=json.loads((STAGE/m.SCHEMA).read_text());gate=UI.contracts();registry=UI.registry().with_resource(schema['$id'],m.Resource.from_contents(schema))
  self.assertEqual(FIX['schema_version'],'1.0.0')
  for positive,cases in ((True,FIX['valid']),(False,FIX['invalid'])):
   for c in cases:
    d,selected=gate.select_definition(schema,c,c['value'],require_valid=positive)
    self.assertEqual(list(gate.validator_for(schema,selected,registry).iter_errors(c['value'])),[],c['name'])
    failures=m.stash_apply_dispatch_semantic_failures(d,c['value'],ui_module=UI)
    if positive:self.assertEqual(failures,[],c['name'])
    else:self.assertIn(c['semantic_rule'],failures,c['name'])
 def test_foreign_and_null_delivery(self):
  self.x['bundle']['delivery_return_context']=None;self.assertIn('stash_apply_response_delivery_original',check(self.x))
 def test_missing_delivery_not_null(self):
  del self.x['bundle']['delivery_return_context'];self.assertIn('git_stash_apply_delivery_owner_value_missing',check(self.x))
 def test_caller_context_substitution_inside_delivery(self):
  self.x['bundle']['delivery_return_context']['caller_context_ref']='caller:foreign'
  self.assertIn('stash_apply_response_delivery_original',check(self.x))
  self.setUp();self.x['bundle']['delivery_return_context']['continuation_generation']=9
  self.assertIn('stash_apply_response_delivery_original',check(self.x))
 def test_retained_original_must_equal_the_request(self):
  self.x['records']['original:stash-apply']['writer_lease_epoch']=9
  self.assertIn('stash_apply_original',check(self.x))
 def test_original_binding_arguments_are_the_original_request(self):
  self.x['records']['sir:stash:original']['arguments']['restoration_mode']='file_changes_plus_saved_staged_selections'
  self.assertIn('stash_apply_response_original_arguments',check(self.x))
 def test_payload_not_binding_container(self):
  b=self.x['bundle'];o=self.x['records'][b['original_binding_ref']];o['payload_sha256']=UI.owner_result_digest(o)
  self.assertIn('stash_apply_response_original_payload',check(self.x))
 def test_digest_contract_and_input_mutation(self):
  def hostile(value):
   value['writer_lease_epoch']=99
   return UI.owner_result_digest({'writer_lease_epoch':99})
  self.assertTrue(check(self.x,canonical_request_digest=hostile))
  def non_digest(value):return 'not-a-digest'
  self.assertIn('stash_apply_response_digest_contract',check(self.x,canonical_request_digest=non_digest))
  def broken(value):raise RuntimeError('unavailable')
  self.assertIn('stash_apply_response_digest_unavailable',check(self.x,canonical_request_digest=broken))
 def test_scope_and_identity_joins(self):
  for key in ('project_id','goal_id','execution_host_id','source_location_id','topology_generation'):
   self.setUp();self.x['records']['context:stash']['lineage'][key]='foreign';self.assertTrue(check(self.x))
  self.setUp();self.x['bundle']['normalized_request']['owner_identity']=dict(self.x['bundle']['response']['owner_identity'],project_id='foreign')
  self.assertIn('stash_apply_response_identity',check(self.x))
  self.setUp();self.x['bundle']['response']['operation_id']='operation:foreign'
  self.assertIn('stash_apply_response_operation',check(self.x))
 def test_wrong_result_schema_binding(self):
  self.x['bundle']['response']['owner_result_schema_ref']['schema_id']='pm.source_control.git_pull.result.v1'
  self.assertIn('git_stash_apply_owner_result_binding',check(self.x))
 def test_terminal_receipt_and_event_joins(self):
  self.x['bundle']['response']['receipt_ref']='receipt:foreign'
  self.assertIn('terminal_response_receipt_mismatch',check(self.x))
  self.setUp();self.x['records']['receipt:stash-apply']['event_refs']=['event:foreign']
  self.assertIn('stash_apply_response_receipt_events',check(self.x))
 def test_outcome_mapping_and_no_op_never_inferred(self):
  for name in ('file_changes_only_completed','blocked_unqualified','staged_selections_not_restorable',
               'cancelled_apply_null_ui_error','unknown_effect','accepted_nonterminal'):
   self.named(name);self.assertEqual(check(self.x),[],name)
  self.setUp();self.x['bundle']['response']['result_status']='no_op'
  self.assertIn('stash_apply_response_outcome',check(self.x))
  self.named('blocked_unqualified');self.x['bundle']['response']['result_status']='no_op'
  self.assertIn('response_schema',check(self.x))
  self.named('unknown_effect');self.x['bundle']['response']['result_status']='failed'
  self.assertIn('acknowledgement_is_not_terminal_success',check(self.x))
  self.named('accepted_nonterminal');self.x['bundle']['outcome']['result_receipt_ref']='receipt:stash-apply'
  self.assertIn('stash_apply_response_accepted_terminal',check(self.x))
 def test_cancelled_keeps_owner_error_with_null_ui_error(self):
  self.named('cancelled_apply_null_ui_error')
  self.assertIsNone(self.x['bundle']['response']['error'])
  self.assertIsNotNone(self.x['bundle']['owner_result']['error_ref'])
  self.assertEqual(check(self.x),[])
  self.x['records']['error-projection:stash-apply']['owner_error']['error_code']='stale_revision'
  self.assertIn('stash_apply_response_error_projection_payload',check(self.x))
 def test_error_projection_foreign_values(self):
  self.named('blocked_unqualified')
  for mutate,rule in ((lambda v:v['records']['error-projection:stash-apply'].update(ui_error=None),'stash_apply_response_error_projection_value'),
                      (lambda v:v['records']['error-projection:stash-apply'].update(owner_error_ref='error:foreign'),'stash_apply_response_error_projection_source'),
                      (lambda v:v['records']['error-projection:stash-apply'].update(return_context=None),'stash_apply_response_error_disclosure')):
   self.named('blocked_unqualified');mutate(self.x);self.assertIn(rule,check(self.x))
  self.named('blocked_unqualified');self.x['bundle']['outcome']['error_ref']='error:foreign'
  self.assertIn('stash_apply_response_error_ref',check(self.x))
  self.named('staged_selections_not_restorable')
  self.x['bundle']['owner_result']['error_ref']=None;self.x['bundle']['owner_result']['error_projection_ref']=None
  self.assertIn('stash_apply_response_error_absence',check(self.x))
 def test_replay_preserves_original_result_identity(self):
  self.x['bundle']['response']['replayed']=True
  self.x['bundle']['response']['original_dispatch_id']='dispatch:stash-apply'
  original=cp(self.x['bundle']['response'])
  self.x['bundle']['original_response']=original
  self.assertEqual(check(self.x),[])
  self.x['bundle']['original_response']['receipt_ref']='receipt:foreign'
  self.assertIn('replay_changed_original_result_identity',check(self.x))
 def test_accepted_work_is_nonterminal(self):
  self.named('accepted_nonterminal');self.assertEqual(check(self.x),[])
  work=self.x['records']['work:stash-apply']
  self.assertIsNone(work['result_receipt_ref'])
  self.assertNotIn(work['work_state'],('completed','failed','cancelled','recovery-required'))
  self.x['bundle']['outcome']['result_receipt_ref']='receipt:stash-apply'
  self.assertIn('stash_apply_response_accepted_terminal',check(self.x))
 def test_late_owner_source_mutation(self):
  records=cp(self.x['records'])
  def reader(ref):
   if ref=='receipt:stash-apply':records['state:before']['view']['worktree_snapshot_sha256']='b'*64
   return records[ref]
  self.assertIn('stash_apply_response_owner_record_mutated',check(self.x,resolve_owner_record=reader))
 def test_inputs_are_not_mutated(self):
  before=cp(self.x);self.assertEqual(check(self.x),[])
  self.assertEqual(before,self.x)
if __name__=='__main__':unittest.main()
