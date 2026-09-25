"""ACT111 exact current consumer/custody classification, not native admission."""
import importlib.util,json,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];SCHEMA='Plans/backup_portable_export_contracts.schema.json';OLD='Plans/backup_restore_system_contracts.schema.json';CMD='cmd.backup.export'
class Bindings(unittest.TestCase):
 def test_exact_route_and_export_receipt(self):
  r=json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries']['catalog.backup_export']
  self.assertEqual(CMD,r['ui_command_id']);self.assertEqual('handlers::backup_restore::backup_export',r['handler_location']);self.assertEqual([],r['expected_event_types']);self.assertIn('handler_unavailable',' '.join(r['acceptance_checks']))
  for k in ('request','result'):self.assertEqual(SCHEMA+'#/$defs/'+k,r[k+'_schema_ref'])
  self.assertEqual([SCHEMA+'#/$defs/'+k for k in ('result','observation','receipt')],r['effect_contract']['receipt_or_event_refs'])
  for p in ('Plans/Commands_System.md','Plans/Backup_Restore_System.md'):
   line=next(l for l in (ROOT/p).read_text().splitlines() if l.startswith('| `'+CMD+'` |'));self.assertIn('`'+SCHEMA+'#/$defs/request` -> `'+SCHEMA+'#/$defs/result`',line)
  self.assertIn('same owner error / FileSafe',line)
 def test_export_among_eleven_current_commands(self):
  s=json.loads((ROOT/OLD).read_text());url=json.loads((ROOT/SCHEMA).read_text())['$id'];self.assertEqual(41,len(s['$defs']['backup_restore_command_id']['enum']))
  for kind in ('request','result'):
   arms=s['$defs']['backup_current_command_'+kind]['oneOf'];self.assertEqual(7,len(arms));self.assertEqual({'$ref':url+'#/$defs/'+kind},arms[4]);self.assertIn('backup_selected_delete',arms[3]['$ref']);self.assertIn('backup-destination-lifecycle',arms[2]['$ref']);self.assertIn('backup_bounded_reads',arms[1]['$ref'])
   ex=arms[-1]['allOf'][1]['not']['properties']['command_id']['anyOf'];self.assertEqual(6,len(ex));self.assertIn({'const':CMD},ex);self.assertIn({'const':'cmd.backup.delete'},ex)
 def test_actual_current_union_and_historical_decoders(self):
  sys.path.insert(0,str(ROOT/'scripts'));spec=importlib.util.spec_from_file_location('export_binding_gate',ROOT/'scripts/pm-new-contracts-verify.py');g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g);registry=g.offline_schema_registry()
  s=json.loads((ROOT/OLD).read_text());new=json.loads((ROOT/'Plans/backup_portable_export_contract_fixtures.json').read_text());old=json.loads((ROOT/'Plans/backup_restore_system_contract_fixtures.json').read_text())
  historical_requests=[c['value'] for c in old['valid'] if c.get('definition')=='backup_restore_command_request'];self.assertEqual(set(s['$defs']['backup_restore_command_id']['enum']),{v['command_id'] for v in historical_requests})
  successor_commands={'cmd.backup.destination.update','cmd.backup.verify','cmd.backup.test_restore','cmd.backup.file.compare','cmd.backup.destination.discover','cmd.backup.browse','cmd.backup.destination.test','cmd.backup.destination.remove','cmd.backup.delete',CMD,'cmd.backup.recovery_key.rotate'}
  for kind in ('request','result'):
   current=g.validator_for(s,{'$ref':'#/$defs/backup_current_command_'+kind},registry);historical=g.validator_for(s,{'$ref':'#/$defs/backup_restore_command_'+kind},registry)
   for c in new['valid']:self.assertEqual([],list(current.iter_errors(c['value'][kind])));self.assertTrue(list(historical.iter_errors(c['value'][kind])))
   for c in old['valid']:
    if c.get('definition')=='backup_restore_command_'+kind:self.assertEqual([],list(historical.iter_errors(c['value'])),c['name'])
   if kind=='request':
    fallback={v['command_id'] for v in historical_requests if not list(current.iter_errors(v))};self.assertEqual(set(s['$defs']['backup_restore_command_id']['enum'])-successor_commands,fallback);self.assertEqual(30,len(fallback))
   if kind=='request':v=next(c['value'] for c in old['valid'] if c.get('definition')=='backup_restore_command_request' and c['value']['command_id']==CMD)
   else:v=dict(next(c['value'] for c in old['valid'] if c.get('definition')=='backup_restore_command_result'),command_id=CMD,recovery_state='not_applicable')
   self.assertEqual([],list(historical.iter_errors(v)));self.assertTrue(list(current.iter_errors(v)))
 def test_five_dispositions_eight_kinds(self):
  rows=[r for r in json.loads((ROOT/'Plans/storage_value_registry.json').read_text())['contract_family_dispositions'] if r['schema_ref']==SCHEMA]
  expected={'scd.backup.portable_export_transport.v1':('request_or_preview_nonpersisted',2),'scd.sir.backup_portable_export_error_projection.v1':('ephemeral_nonpersisted',1),'scd.sir.backup_portable_export_dispatch.v1':('durable',1),'scd.backup.portable_export_effect_metadata.v1':('durable',3),'scd.backup.portable_export_destination.v1':('ephemeral_nonpersisted',1)}
  self.assertEqual(set(expected),{r['disposition_id'] for r in rows});kinds=[]
  for r in rows:
   kind,n=expected[r['disposition_id']];self.assertEqual(kind,r['persistence_disposition']);self.assertEqual(n,len(r['record_kinds']));self.assertEqual('physical_family_registration_pending' if kind=='durable' else 'not_applicable_nonpersisted',r['physical_family_status']);self.assertEqual([],r['existing_family_refs']);self.assertFalse(r['runtime_evidence']);kinds+=r['record_kinds']
  s=json.loads((ROOT/SCHEMA).read_text());self.assertEqual(8,len(kinds));self.assertEqual({v['properties']['schema_id']['const'] for k,v in s['$defs'].items() if k!='fixture_case' and 'schema_id' in v.get('properties',{})},set(kinds))
 def test_existing_touch_union_no_new_profile(self):
  t=json.loads((ROOT/'Plans/touch_closure.json').read_text());rows=[r for r in t['rows'] if r[3]==CMD];self.assertEqual(1,len(rows));self.assertEqual('TCP-BACKUP',rows[0][1]);self.assertEqual('partial',rows[0][4]);self.assertTrue(rows[0][5]);p=next(p for p in t['profiles'] if p['profile_id']=='TCP-BACKUP')
  self.assertEqual(OLD+'#/$defs/backup_current_command_request',p['payload_schema_ref']);self.assertEqual(OLD+'#/$defs/backup_current_command_result',p['result_schema_ref'])
if __name__=='__main__':unittest.main()
