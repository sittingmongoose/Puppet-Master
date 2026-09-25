"""Exact ACT048 integration only; provider/native authority and custody unproved."""
import importlib.util,json,subprocess,unittest
from pathlib import Path
from referencing import Resource
from jsonschema import Draft202012Validator
from pm_historical_storage_expectations import with_recorded_usage_id_correction
ROOT=Path(__file__).resolve().parents[1];BASE='753d6ec40d19b495e672f3e148064ec66ef19c2e'
S='Plans/forge_review_create_selected_contracts.schema.json';OLD='Plans/forge_integration_contracts.schema.json';CMD='cmd.forge.review.create'
def load(p):return json.loads((ROOT/p).read_text())
def prior(p):return json.loads(subprocess.check_output(['git','show',BASE+':'+p],cwd=ROOT,text=True))
class Bindings(unittest.TestCase):
 def test_exact_provider_route_only(self):
  p='Plans/Wiring_Matrix.production.json';a=prior(p)['entries'];b=load(p)['entries'];self.assertEqual(set(a),set(b));self.assertEqual(['catalog.forge_review_create','catalog.jujutsu_operation_restore','catalog.jujutsu_operation_undo','catalog.source_control_backend_select','catalog.source_control_diff_open','catalog.source_control_history_open','catalog.source_control_remote_fetch','catalog.source_control_remote_publish','catalog.source_control_workspace_remove'],[k for k in a if a[k]!=b[k]])
  row=b['catalog.forge_review_create']
  for k in ('handler_location','ui_command_id','expected_event_types'):self.assertEqual(a['catalog.forge_review_create'][k],row[k])
  self.assertEqual('handlers::forge::review_create',row['handler_location']);self.assertEqual([],row['expected_event_types'])
  for k in ('request','result'):self.assertEqual(S+'#/$defs/'+k,row[k+'_schema_ref'])
  text=(ROOT/'Plans/Forge_Integrations.md').read_text();self.assertIn('remaining 43 use the FGI-010 common central Forge route set',text);self.assertIn('retain their provider-owner routes',text)
  self.assertIn(S+'#/$defs/request',(ROOT/'Plans/Commands_System.md').read_text());self.assertIn(S+'#/$defs/result',(ROOT/'Plans/UI_Command_Catalog.md').read_text())
 def test_exact_additive_admission_not_historical_rewrite(self):
  a=prior(OLD);b=load(OLD);self.assertEqual({'command_request_admission'},{k for k in a['$defs'] if a['$defs'][k]!=b['$defs'][k]});old=a['$defs']['command_request_admission']['oneOf'];new=b['$defs']['command_request_admission']['oneOf'];self.assertEqual(11,len(new));self.assertEqual(old[1:],new[1:-1]);self.assertEqual({'$ref':load(S)['$id']+'#/$defs/request'},new[-1]);self.assertEqual(set(old[0]['allOf'][1]['not']['properties']['command_id']['enum'])|{CMD},set(new[0]['allOf'][1]['not']['properties']['command_id']['enum']))
  spec=importlib.util.spec_from_file_location('create_binding_gate',ROOT/'scripts/pm-new-contracts-verify.py');gate=importlib.util.module_from_spec(spec);spec.loader.exec_module(gate);registry=gate.offline_schema_registry()
  admission=Draft202012Validator({'$ref':b['$id']+'#/$defs/command_request_admission'},registry=registry);historical=Draft202012Validator({'$ref':b['$id']+'#/$defs/command_request'},registry=registry)
  for c in load('Plans/forge_review_create_selected_contract_fixtures.json')['valid']:
   q=c['value']['request'];self.assertEqual([],list(admission.iter_errors(q)));self.assertEqual([],list(historical.iter_errors(q['authority'])));self.assertTrue(list(admission.iter_errors(q['authority'])))
 def test_touch_aliases_disjoint_and_primary_exact(self):
  p='Plans/touch_closure.json';a=prior(p);b=load(p);self.assertEqual((646,150),(len(b['rows']),len(b['profiles'])));self.assertEqual(a['alias_bindings'],b['alias_bindings']);self.assertEqual(a['excluded_tokens'],b['excluded_tokens']);self.assertEqual(a['external_disposition_registries'],b['external_disposition_registries'])
  pairs=[(x,y) for x,y in zip(a['rows'],b['rows']) if x!=y];self.assertEqual({'cmd.forge.review.create','cmd.jujutsu.operation.undo','cmd.jujutsu.operation.restore','cmd.source_control.backend.select','cmd.source_control.diff.open','cmd.source_control.history.open','cmd.source_control.remote.fetch','cmd.source_control.remote.publish','cmd.source_control.workspace.remove'},{y[3] for x,y in pairs});x,y=next((x,y) for x,y in pairs if y[3]==CMD);x[1]='TCP-FORGE-REVIEW-CREATE';self.assertEqual(x,y)
  for x,y in pairs:
   if y[3] in ('cmd.jujutsu.operation.undo','cmd.jujutsu.operation.restore'):x[1]='TCP-JJ-RECOVERY';self.assertEqual(x,y)
   if y[3].startswith('cmd.source_control.'):x[1]='TCP-SCM-SELECTED';self.assertEqual(x,y)
  old={p['profile_id']:p for p in a['profiles']};new={p['profile_id']:p for p in b['profiles']};self.assertEqual({'TCP-GITHUB-PR','TCP-FORGE-PR-COMPAT'},{k for k in old if old[k]!=new[k]});self.assertEqual({'TCP-FORGE-REVIEW-CREATE','TCP-JJ-RECOVERY','TCP-SCM-SELECTED'},set(new)-set(old))
  for k in ('TCP-GITHUB-PR','TCP-FORGE-PR-COMPAT'):self.assertEqual({'payload_schema_ref','result_schema_ref'},{f for f in old[k] if old[k][f]!=new[k][f]})
  for field,kind in [('payload_schema_ref','request'),('result_schema_ref','result')]:
   self.assertEqual(S+'#/$defs/'+kind,new['TCP-GITHUB-PR'][field]);self.assertEqual('cmd.source_control.pr.create -> '+S+'#/$defs/'+kind+'; cmd.source_control.pr.merge -> '+OLD+'#/$defs/command_'+kind,new['TCP-FORGE-PR-COMPAT'][field]);self.assertEqual(S+'#/$defs/'+kind,new['TCP-FORGE-REVIEW-CREATE'][field])
 def test_twelve_kinds_nine_owner_groups_no_physical_enrollment(self):
  p='Plans/storage_value_registry.json';a=prior(p);b=load(p);self.assertEqual(a['families'],b['families']);self.assertEqual(294,len(b['families']));self.assertEqual(with_recorded_usage_id_correction(a['contract_family_dispositions']),b['contract_family_dispositions'][:137]);new=b['contract_family_dispositions'][137:146];self.assertEqual(9,len(new));self.assertEqual(153,len(b['contract_family_dispositions']));kinds=[k for r in new for k in r['record_kinds']];self.assertEqual(12,len(kinds));self.assertEqual({v['properties']['schema_id']['const'] for k,v in load(S)['$defs'].items() if k!='fixture_case' and 'schema_id' in v.get('properties',{})},set(kinds));self.assertEqual(5,sum(r['physical_family_status']=='physical_family_registration_pending' for r in new))
  for r in new:self.assertFalse(r['runtime_evidence']);self.assertEqual([],r['existing_family_refs'])
  for name in ('scd.forge.review_create_source.v1','scd.source_control.git_publication_qualification.v1'):
   row=next(r for r in new if r['disposition_id']==name);self.assertEqual('ephemeral_nonpersisted',row['persistence_disposition'])
 def test_old_git_remote_census_stays_exact(self):
  d=load('Plans/touch_closure.json');a=prior('Plans/touch_closure.json');self.assertEqual(a['rows'][-2:],d['rows'][-2:]);self.assertEqual(a['profiles'][-1],next(p for p in d['profiles'] if p['profile_id']=='TCP-GIT-REMOTE-LEGACY'))
if __name__=='__main__':unittest.main()
