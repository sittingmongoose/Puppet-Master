ALIAS_REFS={'TCP-GITHUB-PR': {'payload_schema_ref': 'Plans/forge_review_create_selected_contracts.schema.json#/$defs/request', 'result_schema_ref': 'Plans/forge_review_create_selected_contracts.schema.json#/$defs/result'}, 'TCP-FORGE-PR-COMPAT': {'payload_schema_ref': 'cmd.source_control.pr.create -> Plans/forge_review_create_selected_contracts.schema.json#/$defs/request; cmd.source_control.pr.merge -> Plans/forge_integration_contracts.schema.json#/$defs/command_request', 'result_schema_ref': 'cmd.source_control.pr.create -> Plans/forge_review_create_selected_contracts.schema.json#/$defs/result; cmd.source_control.pr.merge -> Plans/forge_integration_contracts.schema.json#/$defs/command_result'}}
"""Exact list-query integration, static evidence only; no native producer claims."""
import importlib.util,json,subprocess,unittest
from pathlib import Path
from referencing import Resource
from jsonschema import Draft202012Validator
from pm_historical_storage_expectations import with_recorded_usage_id_correction
ROOT=Path(__file__).resolve().parents[1]
BASE='64a63133a2266ee38d894f2494208027e364cfb9'
SCHEMA='Plans/forge_list_query_contracts.schema.json'
OLD='Plans/forge_integration_contracts.schema.json'
CMDS={'cmd.forge.repository.list','cmd.forge.pipeline.list'}
def load(p):return json.loads((ROOT/p).read_text())
def baseline(p):return json.loads(subprocess.check_output(['git','show',BASE+':'+p],cwd=ROOT,text=True))
class Bindings(unittest.TestCase):
 def test_only_exact_routes_handlers_and_receipts(self):
  p='Plans/Wiring_Matrix.production.json';now=load(p)['entries'];old=baseline(p)['entries'];keys={'catalog.forge_repository_list','catalog.forge_pipeline_list'}
  self.assertEqual(1142,len(now));self.assertEqual(keys|{'catalog.forge_pipeline_retry','catalog.forge_pipeline_run','catalog.git_push','catalog.git_fetch','catalog.forge_review_create','catalog.forge_review_checkout','catalog.jujutsu_operation_restore','catalog.jujutsu_operation_undo','catalog.source_control_backend_select','catalog.source_control_diff_open','catalog.source_control_history_open','catalog.source_control_remote_fetch','catalog.source_control_remote_publish','catalog.source_control_stash_apply','catalog.source_control_workspace_remove','catalog.usage_export','catalog.usage_refresh'},{k for k in now if now[k]!=old[k]})
  for k in keys:
   for f in ('handler_location','expected_event_types','ui_command_id'):self.assertEqual(old[k][f],now[k][f])
   for kind in ('request','result'):self.assertEqual(SCHEMA+'#/$defs/'+kind,now[k][kind+'_schema_ref'])
   self.assertEqual([OLD+'#/$defs/command_receipt',SCHEMA+'#/$defs/window',SCHEMA+'#/$defs/read_receipt'],now[k]['effect_contract']['receipt_or_event_refs'])
  for p in ('Plans/Commands_System.md','Plans/Forge_Integrations.md'):
   text=(ROOT/p).read_text();before=subprocess.check_output(['git','show',BASE+':'+p],cwd=ROOT,text=True)
   for cmd in CMDS:
    row=next(l for l in text.splitlines() if l.startswith('| `'+cmd+'` |') and SCHEMA+'#/$defs/request' in l)
    prior=next(l for l in before.splitlines() if l.startswith('| `'+cmd+'` |') and OLD+'#/$defs/command_request` ->' in l)
    self.assertEqual(prior.replace(OLD+'#/$defs/command_request` ->',SCHEMA+'#/$defs/request` ->').replace('-> `'+OLD+'#/$defs/command_result`','-> `'+SCHEMA+'#/$defs/result`'),row)
 def test_admission_additive_original_reader_unchanged(self):
  schema=load(OLD);old=baseline(OLD);self.assertEqual({'command_request_admission'},{k for k in old['$defs'] if old['$defs'][k]!=schema['$defs'][k]})
  arms=schema['$defs']['command_request_admission']['oneOf'];prior=old['$defs']['command_request_admission']['oneOf'];self.assertEqual(11,len(arms));self.assertEqual(prior[1:],arms[1:-4])
  self.assertEqual(set(prior[0]['allOf'][1]['not']['properties']['command_id']['enum'])|CMDS|{'cmd.forge.pipeline.retry','cmd.forge.pipeline.run','cmd.forge.review.create'},set(arms[0]['allOf'][1]['not']['properties']['command_id']['enum']))
  spec=importlib.util.spec_from_file_location('list_binding_gate',ROOT/'scripts/pm-new-contracts-verify.py');gate=importlib.util.module_from_spec(spec);spec.loader.exec_module(gate)
  registry=gate.offline_schema_registry()
  for p in (OLD,SCHEMA):s=load(p);registry=registry.with_resource(s['$id'],Resource.from_contents(s))
  def validator(d):return Draft202012Validator({'$ref':schema['$id']+'#/$defs/'+d},registry=registry)
  admission=validator('command_request_admission');historical=validator('command_request');seen=set()
  for case in load('Plans/forge_list_query_contract_fixtures.json')['valid']:
   q=case['value']['request'];seen.add(q['authority']['command_id']);self.assertEqual([],list(admission.iter_errors(q)));self.assertEqual([],list(historical.iter_errors(q['authority'])));self.assertTrue(list(admission.iter_errors(q['authority'])))
  self.assertEqual(CMDS,seen)
 def test_touch_only_two_rows_and_one_profile(self):
  p='Plans/touch_closure.json';d=load(p);old=baseline(p);self.assertEqual((646,151),(len(d['rows']),len(d['profiles'])));self.assertEqual([dict(p,**ALIAS_REFS.get(p['profile_id'],{})) for p in old['profiles']],d['profiles'][:-8])
  self.assertEqual({'TOUCH-FGI-001','TOUCH-FGI-027','TOUCH-FGI-030','TOUCH-FGI-029','TOUCH-GITREMOTE-001','TOUCH-GITREMOTE-002','TOUCH-FGI-009','TOUCH-FGI-019','TOUCH-JJI-025','TOUCH-JJI-026','TOUCH-SCM-002','TOUCH-SCM-006','TOUCH-SCM-007','TOUCH-SCM-012','TOUCH-SCM-013','TOUCH-SCM-015'},{r[0] for r in d['rows'] if r not in old['rows']})
  for command in ('cmd.jujutsu.operation.undo','cmd.jujutsu.operation.restore'):self.assertEqual('TCP-JJ-RECOVERY',next(r for r in d['rows'] if r[3]==command)[1])
  for r in d['rows']:
   if r[3] in CMDS:self.assertEqual('TCP-FORGE-LIST-QUERY',r[1])
  for k in ('alias_bindings','excluded_tokens','external_disposition_registries'):self.assertEqual(old[k],d[k])
  self.assertEqual(SCHEMA+'#/$defs/result',next(p for p in d['profiles'] if p['profile_id']=='TCP-FORGE-LIST-QUERY')['result_schema_ref'])
 def test_all_kinds_owner_separated_no_physical_admission(self):
  p='Plans/storage_value_registry.json';d=load(p);old=baseline(p);self.assertEqual(old['families'],d['families']);self.assertEqual(294,len(d['families']));rows=d['contract_family_dispositions'];self.assertEqual(163,len(rows));self.assertEqual('scd.usage.ledger_query_transport.v1',rows[64]['disposition_id']);self.assertEqual(with_recorded_usage_id_correction(old['contract_family_dispositions']),rows[:64]+rows[65:122]);new=rows[122:128]
  expected={v['properties']['schema_id']['const'] for k,v in load(SCHEMA)['$defs'].items() if k!='fixture_case' and 'schema_id' in v.get('properties',{})};actual=[k for r in new for k in r['record_kinds']];self.assertEqual(expected,set(actual));self.assertEqual(11,len(actual))
  for r in new:
   self.assertFalse(r['runtime_evidence']);self.assertEqual([],r['existing_family_refs'])
   for k in r['record_kinds']:self.assertEqual('Plans/Shared_Integration_Runtime.md' if k.startswith('pm.sir.') else 'Plans/Forge_Integrations.md',r['owner_doc'])
   pending=r['disposition_id'] in {'scd.sir.forge_list_query_dispatch.v1','scd.forge.list_query_descriptor.v1','scd.forge.list_query_read_metadata.v1'}
   self.assertEqual('physical_family_registration_pending' if pending else 'not_applicable_nonpersisted',r['physical_family_status'])
if __name__=='__main__':unittest.main()
