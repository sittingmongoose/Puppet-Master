"""Exact ACT070 metadata preservation; static admission, never native proof."""
import json,subprocess,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE='f72ee5be07c9f9b6f82f4169ebf17e999b3871d6'
S='Plans/forge_run_selected_contracts.schema.json';CMD='cmd.forge.pipeline.run'
def load(p):return json.loads((ROOT/p).read_text())
def prior(p):return json.loads(subprocess.check_output(['git','show',BASE+':'+p],cwd=ROOT,text=True))
class Bindings(unittest.TestCase):
 def test_only_run_public_route(self):
  p='Plans/Wiring_Matrix.production.json';a=prior(p)['entries'];b=load(p)['entries'];self.assertEqual({'catalog.forge_pipeline_run','catalog.git_push','catalog.git_fetch'},{k for k in a if a[k]!=b[k]})
  row=b['catalog.forge_pipeline_run'];self.assertEqual('handlers::forge::pipeline_run',row['handler_location']);self.assertEqual([],row['expected_event_types']);self.assertIn('handler_unavailable',' '.join(row['acceptance_checks']))
  for k in ('request','result'):self.assertEqual(S+'#/$defs/'+k,row[k+'_schema_ref'])
  for p in ('Plans/Commands_System.md','Plans/Forge_Integrations.md'):
   line=next(l for l in (ROOT/p).read_text().splitlines() if l.startswith('| `'+CMD+'` |') and '#/$defs/request' in l);self.assertIn(S+'#/$defs/request` -> `'+S+'#/$defs/result',line)
 def test_actual_union_preserves_retry_and_every_predecessor(self):
  p='Plans/forge_integration_contracts.schema.json';a=prior(p);b=load(p);self.assertEqual({'command_request_admission'},{k for k in a['$defs'] if a['$defs'][k]!=b['$defs'][k]})
  old=a['$defs']['command_request_admission']['oneOf'];new=b['$defs']['command_request_admission']['oneOf'];self.assertEqual(10,len(new));self.assertEqual(old[1:],new[1:-1]);self.assertEqual({'$ref':load(S)['$id']+'#/$defs/request'},new[-1]);self.assertEqual(set(old[0]['allOf'][1]['not']['properties']['command_id']['enum'])|{CMD},set(new[0]['allOf'][1]['not']['properties']['command_id']['enum']))
 def test_one_narrow_touch_profile_no_other_row_changes(self):
  p='Plans/touch_closure.json';a=prior(p);b=load(p);self.assertEqual((646,147),(len(b['rows']),len(b['profiles'])));self.assertEqual(a['profiles'],b['profiles'][:-2]);changed=[(x,y) for x,y in zip(a['rows'],b['rows']) if x!=y];self.assertEqual(1,len(changed));x,y=changed[0];self.assertEqual(CMD,y[3]);self.assertEqual('partial',y[4]);x[1]='TCP-FORGE-RUN-SELECTED';self.assertEqual(x,y)
  profile=b['profiles'][-2];self.assertEqual('TCP-FORGE-RUN-SELECTED',profile['profile_id']);self.assertEqual(S+'#/$defs/result',profile['result_schema_ref']);self.assertEqual(S+'#/$defs/request',profile['payload_schema_ref'])
  for k in ('alias_bindings','excluded_tokens','external_disposition_registries'):self.assertEqual(a[k],b[k])
 def test_ten_kinds_six_owner_groups_no_physical_enrollment(self):
  p='Plans/storage_value_registry.json';a=prior(p);b=load(p);self.assertEqual(a['families'],b['families']);self.assertEqual(294,len(b['families']));rows=b['contract_family_dispositions'];self.assertEqual(137,len(rows));self.assertEqual(a['contract_family_dispositions'],rows[:131]);added=rows[131:];self.assertEqual(6,len(added));kinds=[k for r in added for k in r['record_kinds']];self.assertEqual(10,len(kinds));self.assertEqual({v['properties']['schema_id']['const'] for k,v in load(S)['$defs'].items() if k!='fixture_case' and 'schema_id'in v.get('properties',{})},set(kinds))
  for r in added:
   self.assertEqual(S,r['schema_ref']);self.assertFalse(r['runtime_evidence']);self.assertEqual([],r['existing_family_refs']);self.assertEqual('physical_family_registration_pending' if r['persistence_disposition']=='durable' else 'not_applicable_nonpersisted',r['physical_family_status'])
   for k in r['record_kinds']:self.assertEqual('Plans/Shared_Integration_Runtime.md' if k.startswith('pm.sir.') else 'Plans/Forge_Integrations.md',r['owner_doc'])
 def test_limitations_not_silently_promoted(self):
  text=(ROOT/'Plans/UI_Command_Catalog.md').read_text();self.assertIn('Unsupported required native forms remain explicitly unadmitted',text)
  text=(ROOT/'Plans/Forge_Integrations.md').read_text();self.assertIn('the ten selected successors below',text);self.assertIn('run_selected for `cmd.forge.pipeline.run`',text)
if __name__=='__main__':unittest.main()
