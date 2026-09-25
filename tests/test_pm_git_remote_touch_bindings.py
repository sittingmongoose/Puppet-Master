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
  self.assertEqual((646,151),(len(b['rows']),len(b['profiles'])))
  expected_rows=json.loads(json.dumps(a['rows']));next(r for r in expected_rows if r[3]=='cmd.forge.review.create')[1]='TCP-FORGE-REVIEW-CREATE'
  for command in ('cmd.jujutsu.operation.undo','cmd.jujutsu.operation.restore'):next(r for r in expected_rows if r[3]==command)[1]='TCP-JJ-RECOVERY'
  next(r for r in expected_rows if r[3]=='cmd.forge.review.checkout')[1]='TCP-FORGE-REVIEW-CHECKOUT'
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
  for r in b['rows'][644:]:self.assertEqual(('TCP-GIT-REMOTE-SELECTED','partial'),(r[1],r[4]))
  p=next(p for p in b['profiles'] if p['profile_id']=='TCP-GIT-REMOTE-SELECTED')
  for field,kind in [('payload_schema_ref','request'),('result_schema_ref','result'),('error_schema_ref','error')]:self.assertEqual('Plans/git_remote_selected.schema.json#/$defs/'+kind,p[field])
  self.assertEqual('SCS-025',p['plan_unit']);self.assertIn('Plans/Shared_Integration_Runtime.md#SIR-042',p['requirement_refs'])
  self.assertIn('physical custody remain absent',p['production_or_simulation'])
  self.assertIn('handlers::git::push',p['handler_owner']);self.assertIn('handler_unavailable',p['availability_rule'])
  for command in ('cmd.git.push','cmd.git.fetch'):
   row=next(r for r in b['rows'] if r[3]==command)
   self.assertEqual('TCP-GIT-REMOTE-SELECTED',row[1])
   self.assertIn('enrolled closed request/result/error binding',row[5])
 def test_only_two_existing_wiring_rows_no_effect_or_handler_change(self):
  p='Plans/Wiring_Matrix.production.json';a=prior(p);b=load(p);self.assertEqual(1142,len(b['entries']))
  self.assertEqual({'catalog.git_push','catalog.git_fetch','catalog.forge_review_create','catalog.forge_review_checkout','catalog.jujutsu_operation_undo','catalog.jujutsu_operation_restore','catalog.source_control_backend_select','catalog.source_control_diff_open','catalog.source_control_history_open','catalog.source_control_remote_fetch','catalog.source_control_remote_publish','catalog.source_control_stash_apply','catalog.source_control_workspace_remove','catalog.usage_export','catalog.usage_refresh'},{k for k in a['entries'] if a['entries'][k]!=b['entries'][k]})
  for key in ('catalog.source_control_backend_select','catalog.source_control_remote_fetch','catalog.source_control_workspace_remove'):
   row=b['entries'][key]
   self.assertEqual('Plans/source_control_selected_operands.schema.json#/$defs/request',row['request_schema_ref'])
   self.assertEqual('Plans/sir_source_control_selected_dispatch.schema.json#/$defs/result_binding',row['result_schema_ref'])
   self.assertEqual([],row['expected_event_types'])
   self.assertIn('handler_unavailable',' '.join(row['acceptance_checks']))
  for command,handler in (('undo','handlers::jujutsu::operation_undo'),('restore','handlers::jujutsu::operation_restore')):
   row=b['entries']['catalog.jujutsu_operation_'+command];self.assertEqual('cmd.jujutsu.operation.'+command,row['ui_command_id']);self.assertEqual(handler,row['handler_location']);self.assertEqual([],row['expected_event_types'])
   for kind in ('request','result'):self.assertEqual('Plans/jj_operation_recovery.schema.json#/$defs/'+kind,row[kind+'_schema_ref'])
  for key,command in (('catalog.git_push','push'),('catalog.git_fetch','fetch')):
   old=a['entries'][key];new=b['entries'][key]
   self.assertEqual({'acceptance_checks','accessibility_contract','test_evidence','evidence_required','request_schema_ref','result_schema_ref'},
                    {k for k in old if old[k]!=new[k]} | (new.keys()-old.keys()))
   for k in ('ui_command_id','handler_location','expected_event_types','state_selector','disabled_reason_projection','effect_contract'):self.assertEqual(old[k],new[k])
   self.assertEqual('Plans/git_remote_selected.schema.json#/$defs/request',new['request_schema_ref'])
   self.assertEqual('Plans/git_remote_selected.schema.json#/$defs/result',new['result_schema_ref'])
   self.assertEqual('handlers::git::'+command,new['handler_location']);self.assertEqual([],new['expected_event_types'])
   self.assertIn('not an alias of',json.dumps(new['acceptance_checks']));self.assertIn('SCS-025',new['evidence_required'])
   self.assertIn('handler_unavailable',new['evidence_required'])
   self.assertNotIn('cmd.git.stash_pop',json.dumps(new));self.assertNotIn('confirmation class two_step',json.dumps(new))
  stash=[k for k,v in a['entries'].items() if v['ui_command_id']=='cmd.source_control.stash.pop'];self.assertTrue(stash)
  for k in stash:self.assertEqual(a['entries'][k],b['entries'][k])
 def test_independent_owner_extraction_and_source_drift(self):
  p=ROOT/'scripts/pm-touch-closure-verify.py';namespace={'__file__':str(p),'__name__':'git_remote_checker'};exec(compile(p.read_text(),str(p),'exec'),namespace)
  inv,issues=namespace['expected_inventory']()
  for cmd in ('cmd.git.push','cmd.git.fetch'):self.assertEqual(('TCP-GIT-REMOTE-SELECTED','command','partial'),inv[cmd])
  read=namespace['read']
  def drift(path):
   text=read(path)
   return text.replace('| `cmd.git.pull` / `cmd.git.push` / `cmd.git.fetch` |','| `cmd.git.pull` / `cmd.git.push` |') if path=='Plans/UI_Command_Catalog.md' else (
    text.replace('"cmd.git.push"','"cmd.git.fetch"',1) if path=='Plans/sir_git_remote_dispatch.schema.json' else text)
  namespace['read']=drift
  with self.assertRaises(ValueError) as raised:
   namespace['expected_inventory']()
  self.assertIn(str(raised.exception),('core Git remote owner registration drift','Git remote adapter owner discriminator drift'))
  namespace['read']=read
 def test_prior_git_owners_survive_exact_later_create_metadata(self):
  p='Plans/source_control_contracts.schema.json';old=prior(p);new=load(p);added={'review_checkout_path_effect','review_checkout_conflict','review_checkout_preview'};self.assertEqual(set(new['$defs'])-set(old['$defs']),added);self.assertEqual(old['$defs'],{k:v for k,v in new['$defs'].items() if k not in added});self.assertEqual(old['oneOf'],new['oneOf'][:-1]);self.assertEqual({'$ref':'#/$defs/review_checkout_preview'},new['oneOf'][-1]);self.assertEqual({k:v for k,v in old.items() if k not in ('$defs','oneOf')},{k:v for k,v in new.items() if k not in ('$defs','oneOf')})
  p='Plans/storage_value_registry.json';self.assertEqual(prior(p)['families'],load(p)['families']);rows=load(p)['contract_family_dispositions'];self.assertEqual('scd.usage.ledger_query_transport.v1',rows[64]['disposition_id']);self.assertEqual(with_recorded_usage_id_correction(prior(p)['contract_family_dispositions']),rows[:64]+rows[65:138])
  git_remote=[d for d in load(p)['contract_family_dispositions'] if d['schema_ref'] in ('Plans/git_remote_selected.schema.json','Plans/sir_git_remote_dispatch.schema.json')]
  self.assertEqual(3,len(git_remote))
  for row in git_remote:self.assertEqual('physical_family_registration_pending' if row['persistence_disposition']=='durable' else 'not_applicable_nonpersisted',row['physical_family_status'])
  p='Plans/UI_Command_Catalog.md';before=subprocess.check_output(['git','show',BASE+':'+p],cwd=ROOT,text=True);now=(ROOT/p).read_text();self.assertEqual([l for l in before.splitlines() if l.startswith('|')],[l for l in now.splitlines() if l.startswith('|')])
if __name__=='__main__':unittest.main()
