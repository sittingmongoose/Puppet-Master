ALIAS_REFS={'TCP-GITHUB-PR': {'payload_schema_ref': 'Plans/forge_review_create_selected_contracts.schema.json#/$defs/request', 'result_schema_ref': 'Plans/forge_review_create_selected_contracts.schema.json#/$defs/result'}, 'TCP-FORGE-PR-COMPAT': {'payload_schema_ref': 'cmd.source_control.pr.create -> Plans/forge_review_create_selected_contracts.schema.json#/$defs/request; cmd.source_control.pr.merge -> Plans/forge_integration_contracts.schema.json#/$defs/command_request', 'result_schema_ref': 'cmd.source_control.pr.create -> Plans/forge_review_create_selected_contracts.schema.json#/$defs/result; cmd.source_control.pr.merge -> Plans/forge_integration_contracts.schema.json#/$defs/command_result'}}
"""Census/copy correction only: no native dispatch or exact remote schema proof."""
import importlib.util,json,subprocess,unittest
from pathlib import Path
from unittest.mock import patch
from pm_historical_storage_expectations import with_recorded_usage_id_correction
ROOT=Path(__file__).resolve().parents[1]
BASE='b53b2f81c7f0b66927d2759b8f9ebe1b293b9e75'
def load(p):return json.loads((ROOT/p).read_text())
def prior(p):return json.loads(subprocess.check_output(['git','show',BASE+':'+p],cwd=ROOT,text=True))
class GitRemoteCensus(unittest.TestCase):
 def test_exact_append_without_rewriting_prior_inventory(self):
  p='Plans/touch_closure.json';a=prior(p);b=load(p)
  self.assertEqual((646,150),(len(b['rows']),len(b['profiles'])))
  expected_rows=json.loads(json.dumps(a['rows']));next(r for r in expected_rows if r[3]=='cmd.forge.review.create')[1]='TCP-FORGE-REVIEW-CREATE'
  for command in ('cmd.jujutsu.operation.undo','cmd.jujutsu.operation.restore'):next(r for r in expected_rows if r[3]==command)[1]='TCP-JJ-RECOVERY'
  for command in ('cmd.source_control.backend.select','cmd.source_control.diff.open','cmd.source_control.history.open','cmd.source_control.remote.fetch','cmd.source_control.remote.publish','cmd.source_control.workspace.remove'):next(r for r in expected_rows if r[3]==command)[1]='TCP-SCM-SELECTED'
  self.assertEqual(expected_rows,b['rows'][:644]);self.assertEqual([dict(p,**ALIAS_REFS.get(p['profile_id'],{})) for p in a['profiles']],b['profiles'][:146])
  recovery=next(p for p in b['profiles'] if p['profile_id']=='TCP-JJ-RECOVERY')
  for kind in ('request','result'):self.assertEqual('Plans/jj_operation_recovery.schema.json#/$defs/'+kind,recovery[('payload' if kind=='request' else kind)+'_schema_ref'])
  successor=next(p for p in b['profiles'] if p['profile_id']=='TCP-SCM-SELECTED')
  self.assertEqual('Plans/source_control_selected_operands.schema.json#/$defs/request',successor['payload_schema_ref'])
  self.assertEqual('Plans/sir_source_control_selected_dispatch.schema.json#/$defs/result_binding',successor['result_schema_ref'])
  self.assertEqual('Plans/source_control_contracts.schema.json#/$defs/source_control_command_error',successor['error_schema_ref'])
  self.assertIn('remain absent',successor['production_or_simulation'])
  for k in a:
   if k not in ('rows','profiles'):self.assertEqual(a[k],b[k])
  self.assertEqual(['TOUCH-GITREMOTE-001','TOUCH-GITREMOTE-002'],[r[0] for r in b['rows'][644:]])
  self.assertEqual(['cmd.git.push','cmd.git.fetch'],[r[3] for r in b['rows'][644:]])
  for r in b['rows'][644:]:self.assertEqual(('TCP-GIT-REMOTE-LEGACY','partial'),(r[1],r[4]))
  p=next(p for p in b['profiles'] if p['profile_id']=='TCP-GIT-REMOTE-LEGACY')
  for field,kind in [('payload_schema_ref','request'),('result_schema_ref','result'),('error_schema_ref','error')]:self.assertEqual('unbound_exact_git_push_fetch_'+kind,p[field])
  self.assertIn('no native',p['production_or_simulation'])
 def test_only_two_existing_wiring_rows_no_effect_or_handler_change(self):
  p='Plans/Wiring_Matrix.production.json';a=prior(p);b=load(p);self.assertEqual(1142,len(b['entries']))
  self.assertEqual({'catalog.git_push','catalog.git_fetch','catalog.forge_review_create','catalog.jujutsu_operation_undo','catalog.jujutsu_operation_restore','catalog.source_control_backend_select','catalog.source_control_diff_open','catalog.source_control_history_open','catalog.source_control_remote_fetch','catalog.source_control_remote_publish','catalog.source_control_workspace_remove'},{k for k in a['entries'] if a['entries'][k]!=b['entries'][k]})
  for key in ('catalog.source_control_backend_select','catalog.source_control_remote_fetch','catalog.source_control_workspace_remove'):
   row=b['entries'][key]
   self.assertEqual('Plans/source_control_selected_operands.schema.json#/$defs/request',row['request_schema_ref'])
   self.assertEqual('Plans/sir_source_control_selected_dispatch.schema.json#/$defs/result_binding',row['result_schema_ref'])
   self.assertEqual([],row['expected_event_types'])
   self.assertIn('handler_unavailable',' '.join(row['acceptance_checks']))
  for command,handler in (('undo','handlers::jujutsu::operation_undo'),('restore','handlers::jujutsu::operation_restore')):
   row=b['entries']['catalog.jujutsu_operation_'+command];self.assertEqual('cmd.jujutsu.operation.'+command,row['ui_command_id']);self.assertEqual(handler,row['handler_location']);self.assertEqual([],row['expected_event_types'])
   for kind in ('request','result'):self.assertEqual('Plans/jj_operation_recovery.schema.json#/$defs/'+kind,row[kind+'_schema_ref'])
  for key in ('catalog.git_push','catalog.git_fetch'):
   old=a['entries'][key];new=b['entries'][key]
   self.assertEqual({'acceptance_checks','accessibility_contract','test_evidence'},{k for k in old if old[k]!=new[k]})
   for k in ('ui_command_id','handler_location','expected_event_types','state_selector','disabled_reason_projection','effect_contract','evidence_required'):self.assertEqual(old[k],new[k])
   self.assertEqual([],new['expected_event_types']);self.assertNotIn('request_schema_ref',new);self.assertNotIn('result_schema_ref',new)
   self.assertNotIn('cmd.git.stash_pop',json.dumps(new));self.assertNotIn('confirmation class two_step',json.dumps(new))
  stash=[k for k,v in a['entries'].items() if v['ui_command_id']=='cmd.source_control.stash.pop'];self.assertTrue(stash)
  for k in stash:self.assertEqual(a['entries'][k],b['entries'][k])
 def test_independent_owner_extraction_and_source_drift(self):
  p=ROOT/'scripts/pm-touch-closure-verify.py';namespace={'__file__':str(p),'__name__':'git_remote_checker'};exec(compile(p.read_text(),str(p),'exec'),namespace)
  inv,issues=namespace['expected_inventory']()
  for cmd in ('cmd.git.push','cmd.git.fetch'):self.assertEqual(('TCP-GIT-REMOTE-LEGACY','command','partial'),inv[cmd])
  read=namespace['read']
  def drift(path):
   text=read(path)
   return text.replace('| `cmd.git.pull` / `cmd.git.push` / `cmd.git.fetch` |','| `cmd.git.pull` / `cmd.git.push` |') if path=='Plans/UI_Command_Catalog.md' else text
  namespace['read']=drift
  with self.assertRaisesRegex(ValueError,'core Git remote owner registration drift'):namespace['expected_inventory']()
 def test_prior_git_owners_survive_exact_later_create_metadata(self):
  p='Plans/source_control_contracts.schema.json';self.assertEqual(prior(p),load(p))
  p='Plans/storage_value_registry.json';self.assertEqual(prior(p)['families'],load(p)['families']);self.assertEqual(with_recorded_usage_id_correction(prior(p)['contract_family_dispositions']),load(p)['contract_family_dispositions'][:137])
  p='Plans/UI_Command_Catalog.md';before=subprocess.check_output(['git','show',BASE+':'+p],cwd=ROOT,text=True);now=(ROOT/p).read_text();self.assertEqual([l for l in before.splitlines() if l.startswith('|')],[l for l in now.splitlines() if l.startswith('|')])
if __name__=='__main__':unittest.main()
