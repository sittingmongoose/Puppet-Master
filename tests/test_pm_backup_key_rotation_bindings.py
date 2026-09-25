"""ACT118 public/custody routing only; no native authority claim."""
import importlib.util,json,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];SCHEMA='Plans/backup_key_rotation_contracts.schema.json';OLD='Plans/backup_restore_system_contracts.schema.json';CMD='cmd.backup.recovery_key.rotate'
class Bindings(unittest.TestCase):
 def test_exact_public_route_and_session_receipt(self):
  r=json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries']['catalog.backup_recovery_key_rotate']
  self.assertEqual(CMD,r['ui_command_id']);self.assertEqual('handlers::backup_restore::recovery_key_rotate',r['handler_location']);self.assertEqual([],r['expected_event_types']);self.assertIn('handler_unavailable',' '.join(r['acceptance_checks']))
  for k in ('request','result'):self.assertEqual(SCHEMA+'#/$defs/'+k,r[k+'_schema_ref'])
  self.assertEqual([SCHEMA+'#/$defs/'+k for k in ('result','session_association','transition','rotation_receipt')],r['effect_contract']['receipt_or_event_refs'])
  for p in ('Plans/Commands_System.md','Plans/Backup_Restore_System.md'):
   line=next(l for l in (ROOT/p).read_text().splitlines() if l.startswith('| `'+CMD+'` |'));self.assertIn('`'+SCHEMA+'#/$defs/request` -> `'+SCHEMA+'#/$defs/result`',line)
  self.assertIn('same owner error / human step-up; add/verify before remove',line)
 def test_actual_union_all_phases_and_historical_refusal(self):
  sys.path.insert(0,str(ROOT/'scripts'));spec=importlib.util.spec_from_file_location('rotation_binding_gate',ROOT/'scripts/pm-new-contracts-verify.py');g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g);registry=g.offline_schema_registry()
  s=json.loads((ROOT/OLD).read_text());new=json.loads((ROOT/'Plans/backup_key_rotation_contract_fixtures.json').read_text());old=json.loads((ROOT/'Plans/backup_restore_system_contract_fixtures.json').read_text());url=json.loads((ROOT/SCHEMA).read_text())['$id']
  for k in ('request','result'):
   arms=s['$defs']['backup_current_command_'+k]['oneOf'];self.assertEqual(9,len(arms));self.assertEqual({'$ref':url+'#/$defs/'+k},arms[5]);self.assertEqual(8,len(arms[-1]['allOf'][1]['not']['properties']['command_id']['anyOf']))
   current=g.validator_for(s,{'$ref':'#/$defs/backup_current_command_'+k},registry);historical=g.validator_for(s,{'$ref':'#/$defs/backup_restore_command_'+k},registry)
   for c in new['valid']:self.assertEqual([],list(current.iter_errors(c['value'][k])));self.assertTrue(list(historical.iter_errors(c['value'][k])))
   for c in old['valid']:
    if c.get('definition')=='backup_restore_command_'+k:
     self.assertEqual([],list(historical.iter_errors(c['value'])))
     if c['value']['command_id']==CMD:self.assertTrue(list(current.iter_errors(c['value'])))
 def test_all_eleven_kinds_separate_protected_submission(self):
  rows=[r for r in json.loads((ROOT/'Plans/storage_value_registry.json').read_text())['contract_family_dispositions'] if r['schema_ref']==SCHEMA];self.assertEqual(5,len(rows));kinds=[k for r in rows for k in r['record_kinds']];self.assertEqual(11,len(kinds));self.assertEqual(11,len(set(kinds)))
  s=json.loads((ROOT/SCHEMA).read_text());self.assertEqual({v['properties']['schema_id']['const'] for k,v in s['$defs'].items() if k!='fixture_case' and 'schema_id' in v.get('properties',{})},set(kinds))
  for r in rows:
   self.assertFalse(r['runtime_evidence']);self.assertEqual([],r['existing_family_refs'])
   self.assertEqual('physical_family_registration_pending' if r['persistence_disposition']=='durable' else 'not_applicable_nonpersisted',r['physical_family_status'])
  protected=next(r for r in rows if r['disposition_id']=='scd.backup.key_rotation_protected_submission.v1');self.assertEqual('ephemeral_nonpersisted',protected['persistence_disposition']);self.assertEqual([s['$defs']['submission']['properties']['schema_id']['const']],protected['record_kinds'])
 def test_existing_touch_no_new_profile(self):
  t=json.loads((ROOT/'Plans/touch_closure.json').read_text());self.assertEqual(646,len(t['rows']));self.assertEqual(151,len(t['profiles']));row=next(r for r in t['rows'] if r[3]==CMD);self.assertEqual('TCP-BACKUP',row[1]);self.assertEqual('partial',row[4])
if __name__=='__main__':unittest.main()
