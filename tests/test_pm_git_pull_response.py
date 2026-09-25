"""Installed actual central pipeline; all fixture records are synthetic doubles."""
import json,os,sys,unittest
from pathlib import Path
from copy import deepcopy as cp
ROOT=Path(os.environ.get('PM_CANON_ROOT',Path(__file__).resolve().parents[1]));sys.path.insert(0,str(ROOT/'scripts'))
import pm_ui_command_response as UI
import pm_git_pull_response as m
STAGE=Path(m.__file__).resolve().parents[1]
FIX=json.loads((STAGE/'Plans/sir_git_pull_dispatch_fixtures.json').read_text())
def check(x,**kwargs):
 deps=m.fixture_dependencies(x,ui_module=UI);deps.update(kwargs);return UI.response_bundle_failures(x['bundle'],**deps)
class Response(unittest.TestCase):
 def setUp(self):self.x=cp(FIX['valid'][0]['value'])
 def test_central_metadata_and_actual_composition(self):
  schema=json.loads((STAGE/m.SCHEMA).read_text());gate=UI.contracts();registry=UI.registry().with_resource(schema['$id'],m.Resource.from_contents(schema))
  self.assertEqual(FIX['schema_version'],'1.0.0')
  for positive,cases in ((True,FIX['valid']),(False,FIX['invalid'])):
   for c in cases:
    d,selected=gate.select_definition(schema,c,c['value'],require_valid=positive)
    self.assertEqual(list(gate.validator_for(schema,selected,registry).iter_errors(c['value'])),[],c['name'])
    failures=m.git_pull_dispatch_semantic_failures(d,c['value'],ui_module=UI)
    if positive:self.assertEqual(failures,[],c['name'])
    else:self.assertIn(c['semantic_rule'],failures)
 def test_foreign_and_null_delivery(self):
  self.x['bundle']['delivery_return_context']=None;self.assertIn('git_pull_response_delivery_original',check(self.x))
 def test_completed_success_rejects_unresolved_native_conflict(self):
  x=self.x;records=x['records'];p=records['preview:pull'];after=records['state:after'];o=records['observation:pull'];content=cp(after['view']['paths'][0]['worktree'])
  conflict=dict(path='src/main.rs',native_state='unresolved',base=cp(content),ours=cp(content),theirs=cp(content))
  p['proposed']['conflicts']=[cp(conflict)];after['view']['conflicts']=[cp(conflict)];p['effects'][0]['disposition']='conflicted';o['actual_effects'][0]['disposition']='conflicted';records['qualification:pull']['proposed']=cp(p['proposed']);records['qualification:pull']['effects']=cp(p['effects'])
  self.assertIn('git_pull_completed_unresolved_conflict',check(x))
 def test_upstream_oid_must_match_original_format(self):
  self.x['records']['upstream:original']['upstream_commit_oid']='b'*64;self.assertIn('git_pull_object_format',check(self.x))
 def test_post_revision_cannot_change_object_format(self):
  records=self.x['records'];after=records['state:after'];after['revision'].update(object_format='sha256',commit_oid='b'*64);after['view']['head_commit_oid']='b'*64;records['receipt:pull']['after_revision']=cp(after['revision'])
  self.assertIn('git_pull_state_object_format',check(self.x))
 def test_actual_sha256_repositories_all_strategies(self):
  oid_keys={'commit_oid','head_commit_oid','head_tree_oid','index_tree_oid','upstream_commit_oid','upstream_tree_oid','before_oid','after_oid','object_id'};oid_lists={'merge_base_oids','rewritten_commit_oids','fetched_object_oids'}
  def convert(v):
   if isinstance(v,dict):
    for k,x in v.items():
     if k=='object_format':v[k]='sha256'
     elif k in oid_keys and x is not None:v[k]=x[0]*64
     elif k in oid_lists:v[k]=[a[0]*64 for a in x]
     else:convert(x)
   elif isinstance(v,list):
    for x in v:convert(x)
  for source in FIX['valid'][:3]:
   x=cp(source['value']);convert(x);b=x['bundle'];original=x['records'][b['original_binding_ref']];digest=UI.owner_result_digest(b['owner_request']);original['payload_sha256']=digest;b['outcome']['payload_sha256']=digest;b['normalized_request']['payload_sha256']=digest;b['outcome']['owner_result_sha256']=UI.owner_result_digest(b['owner_result'])
   self.assertEqual(check(x),[],source['name'])
 def test_missing_delivery_not_null(self):
  del self.x['bundle']['delivery_return_context'];self.assertIn('git_pull_delivery_owner_value_missing',check(self.x))
 def test_plan_goal_topology_scope(self):
  for key in ('plan_id','goal_id','project_id','execution_host_id'):
   self.setUp();q=self.x['bundle']['owner_request'];self.x['records'][q['repository_context_ref']]['lineage'][key]='foreign';self.assertTrue(check(self.x))
 def test_wrong_result_schema(self):
  self.x['bundle']['response']['owner_result_schema_ref']['schema_id']='pm.source_control.git_selected.result.v1';self.assertIn('git_pull_owner_result_binding',check(self.x))
 def test_payload_not_binding_container(self):
  b=self.x['bundle'];o=self.x['records'][b['original_binding_ref']];o['payload_sha256']=UI.owner_result_digest(o);self.assertIn('git_pull_response_original_payload',check(self.x))
 def test_actual_cancelled_partial_keeps_owner_error_and_null_ui(self):
  self.x=cp(FIX['valid'][5]['value']);self.assertIsNone(self.x['bundle']['response']['error']);self.assertIsNotNone(self.x['bundle']['owner_result']['error_ref']);self.assertEqual(check(self.x),[])
 def test_foreign_error_reference(self):
  self.x=cp(FIX['valid'][4]['value']);self.x['bundle']['outcome']['error_ref']='error:foreign';self.assertIn('git_pull_response_error_ref',check(self.x))
 def test_actual_receipt_events_not_grafted(self):
  self.x['records']['receipt:pull']['event_refs']=['foreign:event'];self.assertIn('git_pull_response_receipt_events',check(self.x))
 def test_unrelated_ui_error_text(self):
  self.x=cp(FIX['valid'][4]['value']);self.x['bundle']['response']['error']['reason']='unrelated';self.assertIn('git_pull_response_error_projection_value',check(self.x))
 def test_owner_error_payload_not_replaced(self):
  self.x=cp(FIX['valid'][4]['value']);self.x['records']['error:pull']['detail_ref']='foreign';self.assertIn('git_pull_response_error_projection_payload',check(self.x))
 def test_cancelled_retains_error_projection_caller(self):
  self.x=cp(FIX['valid'][5]['value']);self.x['records']['error-projection:pull']['return_context']=None;self.assertIn('git_pull_response_error_disclosure',check(self.x))
 def test_accepted_rejects_terminal_work(self):
  for status in ('completed','failed','cancelled','recovery-required'):
   self.x=cp(FIX['valid'][3]['value']);w=self.x['records']['work:pull'];w.update(work_state=status,cancel_available=False,background_available=False)
   if status in ('completed','cancelled'):w['result_receipt_ref']='receipt:terminal'
   else:w['error_ref']='error:terminal'
   self.assertIn('git_pull_response_work_terminal_at_acceptance',check(self.x))
 def test_accepted_rejects_terminal_work_receipt(self):
  self.x=cp(FIX['valid'][3]['value']);self.x['records']['work:pull']['result_receipt_ref']='receipt:terminal';self.assertIn('git_pull_response_work_premature_receipt',check(self.x))
 def test_unknown_error_overrides_failed_label(self):
  self.x=cp(FIX['valid'][4]['value']);e=self.x['records']['error:pull'];e.update(error_code='effect_unknown',effect_state='effect_unknown',safe_next_actions=['reconcile_effects']);self.x['records']['error-projection:pull']['owner_error']=cp(e);self.assertIn('git_pull_error_unknown',check(self.x))
 def test_unknown_central_not_failed(self):
  self.x=cp(FIX['valid'][6]['value']);b=self.x['bundle'];b['outcome']['outcome']='failed';b['response']['result_status']='failed';self.assertIn('git_pull_response_outcome',check(self.x))
 def test_accepted_not_terminal_receipt(self):
  self.x=cp(FIX['valid'][3]['value']);self.x['bundle']['outcome']['result_receipt_ref']='receipt:foreign';self.assertTrue(check(self.x))
 def test_replay_original_preserved(self):
  b=self.x['bundle'];b['original_response']=cp(b['response']);b['response'].update(replayed=True,original_dispatch_id=b['response']['dispatch_id'],dispatch_id='dispatch:retry');self.assertEqual(check(self.x),[])
  b['response']['receipt_ref']='receipt:foreign';self.assertTrue(check(self.x))
 def test_digest_callback_mutation(self):
  def digest(x):x['preview_ref']='foreign';return 'a'*64
  self.assertIn('git_pull_response_digest_mutated',check(self.x,canonical_request_digest=digest))
 def test_late_live_original_mutation(self):
  records=cp(self.x['records']);ref=self.x['bundle']['original_binding_ref']
  def reader(key):
   if key=='receipt:pull':records[ref]['target_generation']=999
   return records[key]
  self.assertIn('git_pull_response_owner_record_mutated',check(self.x,resolve_owner_record=reader))
if __name__=='__main__':unittest.main()
