ALIAS_REFS={'TCP-GITHUB-PR': {'payload_schema_ref': 'Plans/forge_review_create_selected_contracts.schema.json#/$defs/request', 'result_schema_ref': 'Plans/forge_review_create_selected_contracts.schema.json#/$defs/result'}, 'TCP-FORGE-PR-COMPAT': {'payload_schema_ref': 'cmd.source_control.pr.create -> Plans/forge_review_create_selected_contracts.schema.json#/$defs/request; cmd.source_control.pr.merge -> Plans/forge_integration_contracts.schema.json#/$defs/command_request', 'result_schema_ref': 'cmd.source_control.pr.create -> Plans/forge_review_create_selected_contracts.schema.json#/$defs/result; cmd.source_control.pr.merge -> Plans/forge_integration_contracts.schema.json#/$defs/command_result'}}
"""Exact ACT072 routing and preservation; static contracts, not native proof."""
import json,subprocess,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];BASE='270f7a74293e3566464648bbfda83739fb255d1f';S='Plans/forge_retry_selected_contracts.schema.json';CMD='cmd.forge.pipeline.retry'
def load(p):return json.loads((ROOT/p).read_text())
def prior(p):return json.loads(subprocess.check_output(['git','show',BASE+':'+p],cwd=ROOT,text=True))
class Bindings(unittest.TestCase):
 def test_only_retry_public_route(self):
  p='Plans/Wiring_Matrix.production.json';a=prior(p)['entries'];b=load(p)['entries'];self.assertEqual({'catalog.forge_pipeline_retry','catalog.forge_pipeline_run','catalog.git_push','catalog.git_fetch','catalog.forge_review_create'},{k for k in a if a[k]!=b[k]})
  row=b['catalog.forge_pipeline_retry'];self.assertEqual('handlers::forge::pipeline_retry',row['handler_location']);self.assertEqual([],row['expected_event_types']);self.assertIn('handler_unavailable',' '.join(row['acceptance_checks']))
  for k in ('request','result'):self.assertEqual(S+'#/$defs/'+k,row[k+'_schema_ref'])
  for p in ('Plans/Commands_System.md','Plans/Forge_Integrations.md'):
   line=next(l for l in (ROOT/p).read_text().splitlines() if l.startswith('| `'+CMD+'` |') and '#/$defs/request' in l);self.assertIn(S+'#/$defs/request` -> `'+S+'#/$defs/result',line)
 def test_actual_union_preserves_list_and_every_predecessor(self):
  p='Plans/forge_integration_contracts.schema.json';a=prior(p);b=load(p);self.assertEqual({'command_request_admission'},{k for k in a['$defs'] if a['$defs'][k]!=b['$defs'][k]})
  old=a['$defs']['command_request_admission']['oneOf'];new=b['$defs']['command_request_admission']['oneOf'];self.assertEqual(11,len(new));self.assertEqual(old[1:],new[1:-3]);self.assertEqual({'$ref':load(S)['$id']+'#/$defs/request'},new[-3]);self.assertEqual(set(old[0]['allOf'][1]['not']['properties']['command_id']['enum'])|{CMD,"cmd.forge.pipeline.run","cmd.forge.review.create"},set(new[0]['allOf'][1]['not']['properties']['command_id']['enum']))
 def test_one_narrow_touch_profile_no_other_row_changes(self):
  p='Plans/touch_closure.json';a=prior(p);b=load(p);self.assertEqual((646,148),(len(b['rows']),len(b['profiles'])));self.assertEqual([dict(p,**ALIAS_REFS.get(p['profile_id'],{})) for p in a['profiles']],b['profiles'][:-4]);changed=[(x,y) for x,y in zip(a['rows'],b['rows']) if x!=y];self.assertEqual(3,len(changed));x,y=next((x,y) for x,y in changed if y[3]==CMD);self.assertEqual(CMD,y[3]);self.assertEqual('partial',y[4]);x[1]='TCP-FORGE-RETRY-SELECTED';self.assertEqual(x,y)
  profile=next(p for p in b['profiles'] if p['profile_id']=='TCP-FORGE-RETRY-SELECTED');self.assertEqual('TCP-FORGE-RETRY-SELECTED',profile['profile_id']);self.assertEqual(S+'#/$defs/result',profile['result_schema_ref']);self.assertEqual(S+'#/$defs/request',profile['payload_schema_ref'])
  for k in ('alias_bindings','excluded_tokens','external_disposition_registries'):self.assertEqual(a[k],b[k])
 def test_eight_kinds_four_groups_no_physical_enrollment(self):
  p='Plans/storage_value_registry.json';a=prior(p);b=load(p);self.assertEqual(a['families'],b['families']);self.assertEqual(294,len(b['families']));rows=b['contract_family_dispositions'];self.assertEqual(146,len(rows));self.assertEqual(a['contract_family_dispositions'],rows[:127]);added=rows[127:131];self.assertEqual(4,len(added));kinds=[k for r in added for k in r['record_kinds']];self.assertEqual(8,len(kinds));self.assertEqual({v['properties']['schema_id']['const'] for k,v in load(S)['$defs'].items() if k!='fixture_case' and 'schema_id'in v.get('properties',{})},set(kinds))
  for r in added:
   self.assertEqual(S,r['schema_ref']);self.assertFalse(r['runtime_evidence']);self.assertEqual([],r['existing_family_refs']);self.assertEqual('physical_family_registration_pending' if r['persistence_disposition']=='durable' else 'not_applicable_nonpersisted',r['physical_family_status'])
if __name__=='__main__':unittest.main()
