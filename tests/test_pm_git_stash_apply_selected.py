"""Installed static SCS-003/SCS-024 tests; synthetic records are not native proof."""
import json,os,sys,unittest
from pathlib import Path
from copy import deepcopy as cp
ROOT=Path(os.environ.get('PM_CANON_ROOT',Path(__file__).resolve().parents[1]));sys.path.insert(0,str(ROOT/'scripts'))
import pm_git_stash_apply_selected as m
import pm_ui_command_response as UI
from referencing import Resource
STAGE=Path(m.__file__).resolve().parents[1]
FIX=json.loads((STAGE/'Plans/git_stash_apply_selected_fixtures.json').read_text())
SCH=json.loads((STAGE/'Plans/git_stash_apply_selected.schema.json').read_text())
MODE_ONLY='file_changes_only'
MODE_STAGED='file_changes_plus_saved_staged_selections'
def check(x,reader=None):return m.stash_apply_failures(x['request'],x['result'],resolve_record=reader or m.fixture_dependencies(x)['resolve_record'],canon_root=ROOT)
def named(name):return cp(next(c['value'] for c in FIX['valid'] if c['name']==name))
class StashApply(unittest.TestCase):
 def setUp(self):self.x=named('file_changes_only_completed')
 def test_full_positive_and_negative_values(self):
  self.assertEqual(FIX['schema_version'],'1.0.0')
  for c in FIX['valid']:
   self.assertEqual(m.shape_failures('fixture_case',c['value'],canon_root=ROOT),[],c['name']);self.assertEqual(check(c['value']),[],c['name'])
  for c in FIX['invalid']:
   if c.get('semantic_rule') is None:
    self.assertTrue(m.shape_failures('fixture_case',c['value'],canon_root=ROOT),c['name'])
   else:
    self.assertIn(c['semantic_rule'],check(c['value']),c['name'])
 def test_actual_central_fixture_metadata_route(self):
  schema=json.loads((STAGE/'Plans/git_stash_apply_selected.schema.json').read_text());gate=UI.contracts();registry=gate.offline_schema_registry().with_resource(schema['$id'],Resource.from_contents(schema))
  for positive,cases in ((True,FIX['valid']),(False,FIX['invalid'])):
   for c in cases:
    definition,selected=gate.select_definition(schema,c,c['value'],require_valid=positive)
    errors=list(gate.validator_for(schema,selected,registry).iter_errors(c['value']))
    failures=m.stash_apply_semantic_failures(definition,c['value'])
    if positive:self.assertEqual(errors,[],c['name']);self.assertEqual(failures,[],c['name'])
    else:self.assertTrue(errors or failures,c['name'])
 def test_choice_is_required_without_default(self):
  for name in ('missing_restoration_mode_no_default','silent_adapter_default_mode_value'):
   case=next(c for c in FIX['invalid'] if c['name']==name)
   self.assertTrue(m.shape_failures('fixture_case',case['value'],canon_root=ROOT),name)
  for mode in (MODE_ONLY,MODE_STAGED):
   self.setUp();self.x['request']['restoration_mode']=mode;self.x['records']['preview:stash-apply']['restoration_mode']=mode
   self.x['records']['qualification:stash-apply']['restoration_mode']=mode
   self.x['records']['preview:stash-apply']['staged_restoration']['mode']=mode
   self.x['records']['observation:stash-apply']['staged_selection_effect']['mode']=mode
   if mode==MODE_STAGED:
    self.x['records']['observation:stash-apply']['staged_selection_effect'].update(disposition='restored',restored_paths=['src/lib.rs'],not_restored_paths=[])
    self.x['records']['observation:stash-apply']['restoration_mode']=mode
    self.assertTrue(check(self.x))
   else:
    self.assertEqual(check(self.x),[])
 def test_mode_mismatch_between_request_preview_result(self):
  for path,rule in ((('preview:stash-apply','restoration_mode'),'stash_apply_preview_restoration_mode'),
                    (('observation:stash-apply','restoration_mode'),'stash_apply_observation_restoration_mode')):
   self.setUp();self.x['records'][path[0]][path[1]]=MODE_STAGED;self.assertIn(rule,check(self.x))
  self.setUp();plan=self.x['records']['preview:stash-apply']['staged_restoration']
  plan.update(mode=MODE_STAGED,planned='unknown',reason_ref='reason:fixture')
  self.assertIn('stash_apply_plan_mode',check(self.x))
  self.setUp();staged=self.x['records']['observation:stash-apply']['staged_selection_effect']
  staged.update(mode=MODE_STAGED,reason_ref='reason:fixture')
  self.assertIn('stash_apply_staged_mode',check(self.x))
 def test_selected_stash_object_never_re_resolved(self):
  self.x['records']['stash:selected']['stash_commit_oid']='b'*40
  self.assertIn('stash_apply_stash_selected_object',check(self.x))
  self.setUp();self.x['records']['stash:selected']['selection']['stash_selection_generation']=13
  self.assertIn('stash_apply_stash_scope',check(self.x))
 def test_unknown_or_conflict_qualification_cannot_authorize_apply(self):
  for value in ('unknown','blocked'):
   self.setUp();self.x['records']['preview:stash-apply']['qualification']=value
   self.x['records']['qualification:stash-apply']['qualification']=value
   self.assertIn('stash_apply_called_qualification',check(self.x))
 def test_unresolved_conflict_cannot_be_promoted_to_success(self):
  records=self.x['records'];after=records['state:after'];content=cp(after['view']['paths'][0]['worktree'])
  conflict=dict(path='src/main.rs',native_state='unresolved',base=cp(content),ours=cp(content),theirs=cp(content))
  after['view']['conflicts']=[cp(conflict)];records['observation:stash-apply']['actual_effects'][0]['disposition']='conflicted'
  self.assertIn('stash_apply_completed_unresolved_conflict',check(self.x))
 def test_staged_selections_falsely_reported_restored(self):
  x=named('file_changes_plus_no_recorded_staged');staged=x['records']['observation:stash-apply']['staged_selection_effect']
  staged.update(disposition='restored',restored_paths=['src/lib.rs'])
  self.assertIn('stash_apply_staged_effect_recorded',check(x))
  self.setUp();staged=self.x['records']['observation:stash-apply']['staged_selection_effect']
  staged['disposition']='restored'
  self.assertTrue(m.shape_failures('observation',self.x['records']['observation:stash-apply'],canon_root=ROOT))
  self.setUp();staged=self.x['records']['observation:stash-apply']['staged_selection_effect']
  staged['restored_paths']=['src/lib.rs']
  self.assertTrue(m.shape_failures('observation',self.x['records']['observation:stash-apply'],canon_root=ROOT))
 def test_staged_selections_restored_only_when_recorded(self):
  x=named('file_changes_plus_staged_completed')
  self.assertEqual(check(x),[])
  staged=x['records']['observation:stash-apply']['staged_selection_effect']
  self.assertEqual(staged['restored_paths'],x['records']['stash:selected']['recorded_staged_paths'])
  staged['disposition']='not_restored';staged['reason_ref']='reason:changed'
  self.assertIn('stash_apply_completed_staged_restored',check(x))
 def test_not_restorable_staged_selections_reported_not_successful(self):
  x=named('staged_selections_not_restorable');self.assertEqual(check(x),[])
  self.assertEqual(x['result']['outcome'],'failed')
  x['result']['outcome']='succeeded';self.assertIn('stash_apply_false_success',check(x))
  x=named('staged_selections_not_restorable');staged=x['records']['observation:stash-apply']['staged_selection_effect']
  staged['reason_ref']=None
  self.assertTrue(m.shape_failures('observation',x['records']['observation:stash-apply'],canon_root=ROOT))
  x=named('staged_selections_not_restorable');staged=x['records']['observation:stash-apply']['staged_selection_effect']
  staged.update(mode=MODE_ONLY,reason_ref=None)
  self.assertIn('stash_apply_not_restorable_truth',check(x))
 def test_apply_retains_stash_and_never_pops_or_drops(self):
  for c in FIX['valid']:
   value=cp(c['value']);self.assertTrue(value['result']['stash_retained'],c['name'])
   if value['result']['operation_receipt_ref'] is not None:
    self.assertTrue(value['records']['observation:stash-apply']['stash_retained'],c['name'])
  removed=next(c for c in FIX['invalid'] if c['name']=='result_claims_stash_removed')
  self.assertTrue(m.shape_failures('fixture_case',removed['value'],canon_root=ROOT))
  self.setUp();self.x['records']['observation:stash-apply']['apply']['stash_after_source_ref']=None
  self.assertIn('stash_apply_stash_retained_evidence',check(self.x))
  x=named('file_changes_only_completed');x['records']['stash:after']['stash_commit_oid']='c'*40
  self.assertIn('stash_apply_stash_selected_object',check(x))
 def test_no_invented_stash_acquisition_path(self):
  self.assertNotIn('acquired_under_admission',json.dumps(SCH))
  self.assertNotIn('acquisition_receipt_ref',json.dumps(SCH))
  neg=next(c for c in FIX['invalid'] if c['name']=='selected_stash_acquired_under_same_operation_apply_receipt')
  selected=neg['value']['records']['stash:selected']
  self.assertEqual('acquired_under_admission',selected['availability'])
  self.assertEqual('native:acquire',selected['acquisition_receipt_ref'])
  self.assertEqual(neg['value']['records']['native:acquire']['operation_id'],neg['value']['request']['operation_id'])
  self.assertEqual('apply',neg['value']['records']['native:acquire']['phase']['phase'])
  self.assertLess(neg['value']['records']['native:acquire']['phase']['finished_at_utc'],neg['value']['request']['requested_at_utc'])
  self.assertIn('stash_apply_unresolved:stash_source_schema',check(neg['value']))
  for finish in ('2026-09-25T09:59:00Z','2026-09-25T10:00:59Z'):
   x=cp(self.x);source=x['records']['stash:selected']
   source.update(availability='acquired_under_admission',acquisition_receipt_ref='native:acquire')
   receipt=cp(x['records']['native:apply']);receipt['receipt_id']='native:acquire'
   receipt['phase'].update(native_receipt_ref='native:acquire',finished_at_utc=finish)
   x['records']['native:acquire']=receipt
   self.assertIn('stash_apply_unresolved:stash_source_schema',check(x),finish)
  for availability,rule in (('unknown','stash_apply_apply_stash_drift'),('unavailable','stash_apply_apply_stash_drift'),
                            ('acquired_under_admission','stash_apply_unresolved:stash_source_schema')):
   self.setUp();self.x['records']['stash:selected']['availability']=availability
   self.assertIn(rule,check(self.x),availability)
  self.setUp();self.assertEqual(check(self.x),[])
 def test_completed_success_requires_verified_after_stash_source(self):
  neg=next(c for c in FIX['invalid'] if c['name']=='completed_success_with_unverified_after_stash_source')
  self.assertEqual('unknown',neg['value']['records']['stash:after']['availability'])
  self.assertTrue(neg['value']['result']['stash_retained'])
  self.assertEqual('completed',neg['value']['records']['observation:stash-apply']['completion'])
  self.assertIn('stash_apply_stash_retained_verification',check(neg['value']))
  for availability in ('unknown','unavailable'):
   self.setUp();self.x['records']['stash:after']['availability']=availability
   self.assertIn('stash_apply_stash_retained_verification',check(self.x),availability)
  self.setUp();self.x['records']['observation:stash-apply']['apply']['stash_after_source_ref']='stash:selected'
  self.assertIn('stash_apply_stash_after_source_independent',check(self.x))
  for name in ('unknown_effect','cancelled_not_applied'):
   x=named(name);x['records']['stash:after']['availability']='unknown'
   self.assertEqual(check(x),[],name)
   self.assertNotEqual('succeeded',x['result']['outcome'],name)
  x=named('unknown_effect');x['records']['stash:after']['availability']='unknown';x['result']['outcome']='succeeded'
  self.assertIn('stash_apply_unknown_outcome',check(x))
 def test_completed_success_after_stash_source_window(self):
  x=named('file_changes_only_completed');apply=x['records']['observation:stash-apply']['apply']
  self.assertEqual(check(x),[])
  self.assertEqual('2026-09-25T10:00:55Z',x['records']['stash:after']['observed_at_utc'])
  self.assertLess(x['request']['requested_at_utc'],apply['finished_at_utc'])
  for name,observed in (('completed_success_with_pre_request_after_stash_source','2026-09-25T09:59:05Z'),
                        ('completed_success_with_after_stash_source_before_apply_completion','2026-09-25T10:00:30Z')):
   case=next(c for c in FIX['invalid'] if c['name']==name)
   self.assertEqual(observed,case['value']['records']['stash:after']['observed_at_utc'])
   self.assertLess(observed,apply['finished_at_utc'],name)
   self.assertIn('stash_apply_stash_retained_window',check(case['value']),name)
  for observed in ('2026-09-25T09:59:05Z','2026-09-25T10:00:00Z','2026-09-25T10:00:30Z','2026-09-25T10:00:49Z'):
   x=named('file_changes_only_completed');x['records']['stash:after']['observed_at_utc']=observed
   self.assertIn('stash_apply_stash_retained_window',check(x),observed)
  for observed in (apply['finished_at_utc'],'2026-09-25T10:00:55Z','2026-09-25T10:00:58Z'):
   x=named('file_changes_only_completed');x['records']['stash:after']['observed_at_utc']=observed
   self.assertEqual(check(x),[],observed)
  for name in ('unknown_effect','cancelled_not_applied'):
   x=named(name);x['records']['stash:after']['observed_at_utc']='2026-09-25T09:59:05Z'
   self.assertEqual(check(x),[],name)
   self.assertNotEqual('succeeded',x['result']['outcome'],name)
 def test_jujutsu_has_no_index_or_stash_surface(self):
  case=next(c for c in FIX['invalid'] if c['name']=='jujutsu_backend_attempt')
  self.assertIn('stash_apply_context',check(case['value']))
  self.setUp();self.x['records']['context:stash']['scm_backend']='jujutsu'
  self.x['records']['context:stash']['revision']={'kind':'jujutsu','change_id':'change:alpha','commit_id':'commit:alpha','operation_id':'operation:alpha','workspace_id':'git-worktree:alpha-main','bookmarks':[]}
  self.assertIn('stash_apply_context',check(self.x))
 def test_currentness_generation_binds_preview_and_qualification(self):
  self.assertEqual(check(self.x),[])
  self.x['records']['preview:stash-apply']['currentness_generation']=22
  self.assertIn('stash_apply_preview_currentness_generation',check(self.x))
  self.setUp();self.x['records']['qualification:stash-apply']['currentness_generation']=22
  self.assertIn('stash_apply_qualification_currentness_generation',check(self.x))
  case=next(c for c in FIX['invalid'] if c['name']=='stale_currentness_generation_after_preview')
  self.assertIn('stash_apply_preview_currentness_generation',check(case['value']))
 def test_original_receipt_and_error_bindings(self):
  for ref,key,rule in (('receipt:stash-apply','operation_id','stash_apply_receipt_operation_id'),
                       ('receipt:stash-apply','command_instance_id','stash_apply_receipt_command_instance_id'),
                       ('native:apply','receipt_id','stash_apply_unresolved:native_apply_receipt_identity'),
                       ('stash:selected','source_id','stash_apply_unresolved:stash_source_identity'),
                       ('state:before','source_id','stash_apply_unresolved:state_source_identity')):
   self.setUp();self.x['records'][ref][key]='foreign';self.assertIn(rule,check(self.x))
  x=named('blocked_unqualified');x['records']['error:stash-apply']['command_instance_id']='command:foreign'
  self.assertIn('stash_apply_error_instance',check(x))
  self.setUp();self.x['records']['lease:writer:1']['epoch']=9;self.assertIn('stash_apply_lease_generation',check(self.x))
 def test_apply_never_moves_head_or_file_only_index(self):
  self.setUp();records=self.x['records']
  self.assertEqual(records['state:after']['view']['head_commit_oid'],records['state:before']['view']['head_commit_oid'])
  self.assertEqual(records['state:after']['view']['index_tree_oid'],records['state:before']['view']['index_tree_oid'])
  records['preview:stash-apply']['proposed']['index_tree_oid']='b'*40
  self.assertIn('stash_apply_preview_index_mode',check(self.x))
  self.setUp();self.x['records']['preview:stash-apply']['proposed']['head_commit_oid']='b'*40
  self.assertIn('stash_apply_preview_head_moved',check(self.x))
  x=named('file_changes_plus_staged_completed')
  self.assertEqual(x['records']['state:after']['view']['index_tree_oid'],x['records']['stash:selected']['stash_index_tree_oid'])
  x['records']['preview:stash-apply']['proposed']['index_tree_oid']='b'*40
  self.assertIn('stash_apply_preview_index_staged',check(x))
 def test_unknown_effect_cannot_become_success(self):
  x=named('unknown_effect');self.assertEqual(check(x),[])
  x['result']['outcome']='succeeded';self.assertIn('stash_apply_unknown_outcome',check(x))
 def test_actual_sha256_repositories_all_modes(self):
  oid_keys={'stash_commit_oid','stash_tree_oid','stash_index_tree_oid','commit_oid','head_commit_oid','head_tree_oid','index_tree_oid','object_id'}
  def convert(v):
   if isinstance(v,dict):
    for k,x in v.items():
     if k=='object_format':v[k]='sha256'
     elif k in oid_keys and isinstance(x,str) and len(x)==40:v[k]=x[0]*64
     else:convert(x)
   elif isinstance(v,list):
    for x in v:convert(x)
  for name in ('file_changes_only_completed','file_changes_plus_staged_completed','staged_selections_not_restorable'):
   value=named(name);convert(value)
   self.assertEqual(check(value),[],name)
 def test_actual_credential_lease_binding(self):
  x=self.x;x['request']['credential_lease_ref']='credential:stash-apply'
  x['records']['original:stash-apply']=cp(x['request']);x['records']['receipt:stash-apply']['credential_lease_ref']='credential:stash-apply'
  x['records']['native:apply']['credential_lease_ref']='credential:stash-apply'
  x['records']['credential:stash-apply']={'schema_id':'pm.source_control.credential_lease.v1','credential_lease_id':'credential:stash-apply','credential_ref':'secure:credential','transport':'https','repo_id':'repo:alpha','host_identity':'fixture.invalid','operation_id':'operation:stash-apply','goal_run_id':None,'issued_at_utc':'2026-09-25T09:59:00Z','expires_at_utc':'2026-09-25T10:10:00Z','revocation_state':'active','prompt_suppressed':True,'use_http_path':True}
  self.assertEqual(check(x),[])
  x['records']['credential:stash-apply']['operation_id']='operation:foreign'
  self.assertIn('stash_apply_credential_scope',check(x))
 def test_live_resolved_original_mutation(self):
  records=cp(self.x['records'])
  def reader(ref):
   if ref=='receipt:stash-apply':records['stash:selected']['recorded_staged_paths']=['foreign.rs']
   return records[ref]
  self.assertIn('stash_apply_owner_record_mutated',check(self.x,reader))
 def test_inputs_are_not_mutated(self):
  request=cp(self.x['request']);result=cp(self.x['result'])
  self.assertEqual(check(self.x),[])
  self.assertEqual(request,self.x['request']);self.assertEqual(result,self.x['result'])
if __name__=='__main__':unittest.main()
