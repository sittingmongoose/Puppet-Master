"""Installed static ACT017 tests; synthetic records are not native proof."""
import json,os,sys,unittest
from pathlib import Path
from copy import deepcopy as cp
ROOT=Path(os.environ.get('PM_CANON_ROOT',Path(__file__).resolve().parents[1]));sys.path.insert(0,str(ROOT/'scripts'))
import pm_git_pull_selected as m
import pm_ui_command_response as UI
from referencing import Resource
STAGE=Path(m.__file__).resolve().parents[1]
FIX=json.loads((STAGE/'Plans/git_pull_selected_fixtures.json').read_text())
def check(x,reader=None):return m.pull_failures(x['request'],x['result'],resolve_record=reader or m.fixture_dependencies(x)['resolve_record'],canon_root=ROOT)
class Pull(unittest.TestCase):
 def setUp(self):self.x=cp(FIX['valid'][0]['value'])
 def test_full_positive_and_negative_values(self):
  self.assertEqual(FIX['schema_version'],'1.0.0')
  for c in FIX['valid']:
   self.assertEqual(m.shape_failures('fixture_case',c['value'],canon_root=ROOT),[],c['name']);self.assertEqual(check(c['value']),[],c['name'])
  for c in FIX['invalid']:self.assertIn(c['semantic_rule'],check(c['value']))
 def test_actual_central_fixture_metadata_route(self):
  schema=json.loads((STAGE/'Plans/git_pull_selected.schema.json').read_text());gate=UI.contracts();registry=gate.offline_schema_registry().with_resource(schema['$id'],Resource.from_contents(schema))
  for positive,cases in ((True,FIX['valid']),(False,FIX['invalid'])):
   for c in cases:
    definition,selected=gate.select_definition(schema,c,c['value'],require_valid=positive)
    self.assertEqual(list(gate.validator_for(schema,selected,registry).iter_errors(c['value'])),[],c['name'])
    failures=m.git_pull_semantic_failures(definition,c['value'])
    if positive:self.assertEqual(failures,[],c['name'])
    else:self.assertIn(c['semantic_rule'],failures)
 def test_foreign_actual_receipt_ids(self):
  for ref,key in [('receipt:pull','receipt_id'),('native:integrate','receipt_id'),('lease:writer:1','lease_id'),('state:before','source_id'),('upstream:original','source_id'),('qualification:pull','qualification_id')]:
   with self.subTest(ref=ref):
    self.setUp();self.x['records'][ref][key]='foreign';self.assertTrue(check(self.x))
 def test_original_remote_ref_strategy(self):
  for key in ('remote_id','fetch_url','branch_ref','strategy'):
   self.setUp();self.x['request']['selection'][key]='rebase' if key=='strategy' else 'foreign';self.assertTrue(check(self.x))
 def test_unrelated_generations(self):
  self.assertNotEqual(self.x['request']['selection']['remote_selection_generation'],self.x['request']['writer_lease_generation']);self.assertEqual(check(self.x),[])
 def test_actual_config_drift(self):
  self.x['records']['state:before']['config']['native_configuration_sha256']='b'*64;self.assertIn('git_pull_preview_before',check(self.x))
 def test_git_oid_format_across_native_values(self):
  paths=[('state:before','view','head_tree_oid'),('state:after','view','index_tree_oid'),('upstream:original','upstream_tree_oid'),('preview:pull','proposed','paths',0,'worktree','object_id'),('preview:pull','ancestry','merge_base_oids',0)]
  for path in paths:
   self.setUp();node=self.x['records']
   for key in path[:-1]:node=node[key]
   node[path[-1]]='b'*64
   self.assertIn('git_pull_object_format',check(self.x),path)
 def test_fetch_object_and_ref_update_oid_format(self):
  for which in ('object','before','after'):
   self.x=cp(FIX['valid'][4]['value']);phase=self.x['records']['observation:pull']['fetch']
   if which=='object':phase['fetched_object_oids'][0]='b'*64
   else:phase['ref_updates'][0][which+'_oid']='b'*64
   self.x['records']['native:fetch']['phase']=cp(phase)
   self.assertIn('git_pull_object_format',check(self.x))
 def test_actual_credential_identity_and_host(self):
  x=self.x;q=x['request'];q['credential_lease_ref']='credential:pull';x['records']['original:pull']=cp(q)
  x['records']['receipt:pull']['credential_lease_ref']='credential:pull';x['records']['native:integrate']['credential_lease_ref']='credential:pull'
  c=dict(schema_id='pm.source_control.credential_lease.v1',credential_lease_id='credential:pull',credential_ref='secure:credential',transport='https',repo_id='repo:alpha',host_identity='fixture.invalid',operation_id=q['operation_id'],goal_run_id=None,issued_at_utc='2026-09-25T09:59:00Z',expires_at_utc='2026-09-25T10:10:00Z',revocation_state='active',prompt_suppressed=True,use_http_path=True)
  x['records']['credential:pull']=c;self.assertEqual(check(x),[])
  c['host_identity']='foreign';self.assertIn('git_pull_credential_remote',check(x));c['host_identity']='fixture.invalid';c['credential_lease_id']='foreign';self.assertTrue(check(x))
 def test_actual_index_drift(self):
  self.x['records']['state:before']['view']['index_tree_oid']='b'*40;self.assertIn('git_pull_preview_before',check(self.x))
 def test_actual_worktree_drift(self):
  self.x['records']['state:before']['view']['worktree_snapshot_sha256']='b'*64;self.assertIn('git_pull_preview_before',check(self.x))
 def test_ff_only_never_falls_back(self):
  self.x=cp(FIX['valid'][2]['value']);self.x['records']['preview:pull']['ancestry']['upstream_is_descendant']='no';self.assertIn('git_pull_ff_only_ancestry',check(self.x))
 def test_complete_effects(self):
  self.x['records']['preview:pull']['effects']=[];self.assertIn('git_pull_effects_complete',check(self.x))
 def test_native_conflict_retained_despite_clean_worktree(self):
  x=self.x;records=x['records'];p=records['preview:pull'];after=records['state:after'];o=records['observation:pull']
  content=cp(after['view']['paths'][0]['worktree']);conflict=dict(path='src/main.rs',native_state='unresolved',base=cp(content),ours=cp(content),theirs=cp(content))
  p['proposed']['conflicts']=[cp(conflict)];after['view']['conflicts']=[cp(conflict)];p['effects'][0]['disposition']='conflicted';o['actual_effects'][0]['disposition']='conflicted'
  records['qualification:pull']['proposed']=cp(p['proposed']);records['qualification:pull']['effects']=cp(p['effects'])
  o['completion']='partial';o['integration']['state']='failed';records['native:integrate']['phase']=cp(o['integration']);records['receipt:pull']['outcome']='failed';x['result']['outcome']='failed'
  self.assertEqual(check(x),[])
  o['actual_effects'][0]['disposition']='integrated';self.assertIn('git_pull_conflict_erasure',check(x))
 def test_unqualified_native_preview(self):
  self.x['records']['preview:pull']['qualification']='unknown';self.assertIn('git_pull_integration_qualification',check(self.x))
 def test_unknown_native_input(self):
  self.x['records']['preview:pull']['before']['paths'][0]['worktree']={'state':'unknown','object_id':None,'mode':None};self.assertIn('git_pull_integration_qualification',check(self.x))
 def test_completed_preview_not_actual_truth(self):
  self.x['records']['state:after']['view']['worktree_snapshot_sha256']='b'*64;self.assertIn('git_pull_completed_preview',check(self.x))
 def test_fetched_object_cannot_replace_preview(self):
  self.x=cp(FIX['valid'][4]['value']);u=cp(self.x['records']['upstream:original']);u.update(source_id='upstream:foreign',upstream_commit_oid='b'*40);self.x['records']['upstream:foreign']=u
  self.x['records']['observation:pull']['fetch']['upstream_source_ref']='upstream:foreign';self.assertIn('git_pull_fetch_qualified_object',check(self.x))
 def test_failed_fetch_effects_not_lost(self):
  self.x=cp(FIX['valid'][4]['value']);self.x['records']['observation:pull']['fetch']['effect_state']='none';self.assertTrue(check(self.x))
 def test_unknown_cannot_succeed(self):
  self.x=cp(FIX['valid'][6]['value']);self.x['result']['outcome']='succeeded';self.assertIn('git_pull_unknown_outcome',check(self.x))
 def test_live_resolved_original_mutation(self):
  records=cp(self.x['records'])
  def reader(ref):
   if ref=='receipt:pull':records['original:pull']['selection']['branch_ref']='foreign'
   return records[ref]
  self.assertIn('git_pull_owner_record_mutated',check(self.x,reader))
if __name__=='__main__':unittest.main()
