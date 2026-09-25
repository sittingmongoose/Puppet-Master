"""Selected deletion's exact public/custody successor, no native proof."""
import importlib.util,json,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SCHEMA='Plans/backup_selected_delete_contracts.schema.json';OLD='Plans/backup_restore_system_contracts.schema.json';CMD='cmd.backup.delete'
class Bindings(unittest.TestCase):
 def test_exact_single_route_and_real_deletion_receipt(self):
  row=json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries']['catalog.backup_delete']
  self.assertEqual(CMD,row['ui_command_id']);self.assertEqual('handlers::backup_restore::backup_delete',row['handler_location']);self.assertEqual([],row['expected_event_types']);self.assertIn('handler_unavailable',' '.join(row['acceptance_checks']))
  for k in ('request','result'):self.assertEqual(SCHEMA+'#/$defs/'+k,row[k+'_schema_ref'])
  self.assertEqual([SCHEMA+'#/$defs/result',SCHEMA+'#/$defs/receipt'],row['effect_contract']['receipt_or_event_refs'])
  for path in ('Plans/Commands_System.md','Plans/Backup_Restore_System.md'):
   line=next(l for l in (ROOT/path).read_text().splitlines() if l.startswith('| `'+CMD+'` |') and '#/$defs/request' in l);self.assertIn('`'+SCHEMA+'#/$defs/request` -> `'+SCHEMA+'#/$defs/result`',line)
  self.assertIn(OLD+'#/$defs/backup_restore_command_request/properties/permission_snapshot_ref',line)
 def test_union_preserves_delete_among_eleven_current_commands(self):
  schema=json.loads((ROOT/OLD).read_text());url=json.loads((ROOT/SCHEMA).read_text())['$id']
  for kind in ('request','result'):
   arms=schema['$defs']['backup_current_command_'+kind]['oneOf'];self.assertEqual(7,len(arms));self.assertEqual({'$ref':url+'#/$defs/'+kind},arms[3]);self.assertIn('backup-destination-lifecycle',arms[2]['$ref']);self.assertIn('backup_bounded_reads',arms[1]['$ref'])
   exclusions=arms[-1]['allOf'][1]['not']['properties']['command_id']['anyOf'];self.assertEqual(6,len(exclusions));self.assertIn({'const':CMD},exclusions);self.assertIn({'enum':['cmd.backup.destination.remove','cmd.backup.destination.test']},exclusions)
 def test_current_successor_not_historical_fallback(self):
  sys.path.insert(0,str(ROOT/'scripts'));spec=importlib.util.spec_from_file_location('delete_binding_gate',ROOT/'scripts/pm-new-contracts-verify.py');gate=importlib.util.module_from_spec(spec);spec.loader.exec_module(gate);registry=gate.offline_schema_registry()
  schema=json.loads((ROOT/OLD).read_text());old=json.loads((ROOT/'Plans/backup_restore_system_contract_fixtures.json').read_text());new=json.loads((ROOT/'Plans/backup_selected_delete_contract_fixtures.json').read_text())
  for kind in ('request','result'):
   current=gate.validator_for(schema,{'$ref':'#/$defs/backup_current_command_'+kind},registry);historical=gate.validator_for(schema,{'$ref':'#/$defs/backup_restore_command_'+kind},registry)
   for c in new['valid']:self.assertEqual([],list(current.iter_errors(c['value'][kind])));self.assertTrue(list(historical.iter_errors(c['value'][kind])))
   if kind=='request':value=next(c['value'] for c in old['valid'] if c.get('definition')=='backup_restore_command_request' and c['value']['command_id']==CMD)
   else:value=dict(next(c['value'] for c in old['valid'] if c.get('definition')=='backup_restore_command_result'),command_id=CMD,recovery_state='not_applicable')
   self.assertEqual([],list(historical.iter_errors(value)));self.assertTrue(list(current.iter_errors(value)))
 def test_six_kinds_four_exact_classifications(self):
  registry=json.loads((ROOT/'Plans/storage_value_registry.json').read_text());rows=[r for r in registry['contract_family_dispositions'] if r['schema_ref']==SCHEMA]
  expected={'scd.backup.selected_delete_transport.v1':('request_or_preview_nonpersisted',2),'scd.sir.backup_selected_delete_error_projection.v1':('ephemeral_nonpersisted',1),'scd.sir.backup_selected_delete_dispatch.v1':('durable',1),'scd.backup.selected_delete_effect_metadata.v1':('durable',2)}
  self.assertEqual(set(expected),{r['disposition_id'] for r in rows});kinds=[]
  for r in rows:
   disposition,count=expected[r['disposition_id']];self.assertEqual(disposition,r['persistence_disposition']);self.assertEqual(count,len(r['record_kinds']));self.assertEqual('physical_family_registration_pending' if disposition=='durable' else 'not_applicable_nonpersisted',r['physical_family_status']);self.assertEqual([],r['existing_family_refs']);self.assertFalse(r['runtime_evidence']);kinds+=r['record_kinds']
  schema=json.loads((ROOT/SCHEMA).read_text());actual={v['properties']['schema_id']['const'] for k,v in schema['$defs'].items() if k!='fixture_case' and 'schema_id' in v.get('properties',{})};self.assertEqual(6,len(kinds));self.assertEqual(actual,set(kinds))
 def test_touch_unchanged_existing_profile(self):
  touch=json.loads((ROOT/'Plans/touch_closure.json').read_text());rows=[r for r in touch['rows'] if r[3]==CMD];self.assertEqual(1,len(rows));self.assertEqual('TCP-BACKUP',rows[0][1]);self.assertEqual('partial',rows[0][4]);self.assertTrue(rows[0][5]);profile=next(p for p in touch['profiles'] if p['profile_id']=='TCP-BACKUP');self.assertEqual(OLD+'#/$defs/backup_current_command_request',profile['payload_schema_ref']);self.assertEqual(OLD+'#/$defs/backup_current_command_result',profile['result_schema_ref'])
if __name__=='__main__':unittest.main()
