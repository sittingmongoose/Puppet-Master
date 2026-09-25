"""ACT119 exact current public/custody bindings; no native evidence claim."""
import importlib.util,json,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];SCHEMA='Plans/backup_reencrypt_contracts.schema.json';OLD='Plans/backup_restore_system_contracts.schema.json';CMD='cmd.backup.recovery_key.reencrypt'
class Bindings(unittest.TestCase):
 def test_exact_public_consumer(self):
  r=json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries']['catalog.backup_recovery_key_reencrypt']
  self.assertEqual(CMD,r['ui_command_id']);self.assertEqual('handlers::backup_restore::recovery_key_reencrypt',r['handler_location']);self.assertEqual([],r['expected_event_types']);self.assertIn('handler_unavailable',' '.join(r['acceptance_checks']))
  for k in ('request','result'):self.assertEqual(SCHEMA+'#/$defs/'+k,r[k+'_schema_ref'])
  self.assertEqual([SCHEMA+'#/$defs/'+k for k in ('result','review','observation','receipt')],r['effect_contract']['receipt_or_event_refs'])
  for p in ('Plans/Commands_System.md','Plans/Backup_Restore_System.md'):
   row=next(l for l in (ROOT/p).read_text().splitlines() if l.startswith('| `'+CMD+'` |'));self.assertIn('`'+SCHEMA+'#/$defs/request` -> `'+SCHEMA+'#/$defs/result`',row)
  self.assertIn('same owner error / human step-up; preview, confirmation, lease, new RecoverySet',row)
 def test_actual_current_union_preserves_historical_authority(self):
  sys.path.insert(0,str(ROOT/'scripts'));spec=importlib.util.spec_from_file_location('reencrypt_binding_gate',ROOT/'scripts/pm-new-contracts-verify.py');g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g);registry=g.offline_schema_registry()
  s=json.loads((ROOT/OLD).read_text());schema=json.loads((ROOT/SCHEMA).read_text());fixtures=json.loads((ROOT/'Plans/backup_reencrypt_contract_fixtures.json').read_text());old=json.loads((ROOT/'Plans/backup_restore_system_contract_fixtures.json').read_text())
  self.assertEqual(41,len(s['$defs']['backup_restore_command_id']['enum']))
  for k in ('request','result'):
   arms=s['$defs']['backup_current_command_'+k]['oneOf'];self.assertEqual(9,len(arms));self.assertEqual({'$ref':schema['$id']+'#/$defs/'+k},arms[6]);self.assertIn('key-rotation',arms[5]['$ref']);ex=arms[-1]['allOf'][1]['not']['properties']['command_id']['anyOf'];self.assertEqual(8,len(ex));self.assertIn({'const':CMD},ex)
   current=g.validator_for(s,{'$ref':'#/$defs/backup_current_command_'+k},registry);historical=g.validator_for(s,{'$ref':'#/$defs/backup_restore_command_'+k},registry)
   for c in fixtures['valid']:self.assertEqual([],list(current.iter_errors(c['value'][k])));self.assertTrue(list(historical.iter_errors(c['value'][k])))
   historicals=[c['value'] for c in old['valid'] if c.get('definition')=='backup_restore_command_'+k]
   for v in historicals:self.assertEqual([],list(historical.iter_errors(v)))
   if k=='request':
    self.assertEqual(set(s['$defs']['backup_restore_command_id']['enum']),{v['command_id'] for v in historicals});self.assertEqual(28,len({v['command_id'] for v in historicals if not list(current.iter_errors(v))}))
    self.assertTrue(list(current.iter_errors(next(v for v in historicals if v['command_id']==CMD))))
 def test_five_custody_groups_nine_kinds(self):
  rows=[r for r in json.loads((ROOT/'Plans/storage_value_registry.json').read_text())['contract_family_dispositions'] if r['schema_ref']==SCHEMA];self.assertEqual(5,len(rows));kinds=[k for r in rows for k in r['record_kinds']];self.assertEqual(9,len(kinds));self.assertEqual(9,len(set(kinds)))
  s=json.loads((ROOT/SCHEMA).read_text());self.assertEqual({v['properties']['schema_id']['const'] for k,v in s['$defs'].items() if k!='fixture_case' and 'schema_id' in v.get('properties',{})},set(kinds));self.assertEqual(3,sum(r['persistence_disposition']=='durable' for r in rows))
  for r in rows:
   self.assertFalse(r['runtime_evidence']);self.assertEqual([],r['existing_family_refs']);self.assertEqual('physical_family_registration_pending' if r['persistence_disposition']=='durable' else 'not_applicable_nonpersisted',r['physical_family_status'])
 def test_existing_touch_union_unchanged(self):
  t=json.loads((ROOT/'Plans/touch_closure.json').read_text());self.assertEqual(646,len(t['rows']));self.assertEqual(151,len(t['profiles']));row=next(r for r in t['rows'] if r[3]==CMD);self.assertEqual('TCP-BACKUP',row[1]);self.assertEqual('partial',row[4]);p=next(p for p in t['profiles'] if p['profile_id']=='TCP-BACKUP')
  self.assertEqual(OLD+'#/$defs/backup_current_command_request',p['payload_schema_ref']);self.assertEqual(OLD+'#/$defs/backup_current_command_result',p['result_schema_ref'])
if __name__=='__main__':unittest.main()
