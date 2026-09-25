"""Exact reviewed Backup lifecycle consumers; no native or persistence proof."""
import importlib.util,json,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];SCHEMA='Plans/backup_destination_lifecycle_contracts.schema.json';OLD='Plans/backup_restore_system_contracts.schema.json';CMDS={'cmd.backup.destination.test','cmd.backup.destination.remove'}
class Bindings(unittest.TestCase):
 def test_exact_public_two_and_real_receipt(self):
  rows=json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries']
  for command in CMDS:
   row=next(r for r in rows.values() if r.get('ui_command_id')==command)
   for k in ('request','result'):self.assertEqual(SCHEMA+'#/$defs/'+k,row[k+'_schema_ref'])
   self.assertEqual([SCHEMA+'#/$defs/result',SCHEMA+'#/$defs/lifecycle_receipt'],row['effect_contract']['receipt_or_event_refs'])
   self.assertEqual([],row['expected_event_types']);self.assertIn('handler_unavailable',' '.join(row['acceptance_checks']))
   self.assertEqual('handlers::backup_restore::'+command.removeprefix('cmd.').replace('.','_'),row['handler_location'])
   for path in ('Plans/Commands_System.md','Plans/Backup_Restore_System.md'):
    line=next(l for l in (ROOT/path).read_text().splitlines() if l.startswith('| `'+command+'` |') and '#/$defs/request' in l);self.assertIn(SCHEMA+'#/$defs/result',line)
    if path.endswith('Backup_Restore_System.md'):
     self.assertIn(OLD+'#/$defs/backup_restore_command_error',line)
     self.assertIn(OLD+'#/$defs/backup_restore_command_request/properties/permission_snapshot_ref',line)
     self.assertNotIn(SCHEMA+'#/$defs/request/properties/permission_snapshot_ref',line)
 def test_current_union_preserves_six_prior_branches(self):
  schema=json.loads((ROOT/OLD).read_text())
  for kind in ('request','result'):
   arms=schema['$defs']['backup_current_command_'+kind]['oneOf']
   self.assertEqual({'$ref':'#/$defs/backup_action_'+kind+'_v2'},arms[0])
   self.assertEqual({'$ref':'https://puppetmaster.local/schemas/backup_bounded_reads/1.0.0/backup_bounded_read_contracts.schema.json#/$defs/'+kind},arms[1])
   self.assertEqual({'$ref':json.loads((ROOT/SCHEMA).read_text())['$id']+'#/$defs/'+kind},arms[2])
   exclusions=arms[-1]['allOf'][1]['not']['properties']['command_id']['anyOf'];self.assertIn({'enum':sorted(CMDS)},exclusions);self.assertEqual(6,len(exclusions))
 def test_actual_current_values_and_historical_decoder(self):
  sys.path.insert(0,str(ROOT/'scripts'));spec=importlib.util.spec_from_file_location('lifecycle_binding_gate',ROOT/'scripts/pm-new-contracts-verify.py');gate=importlib.util.module_from_spec(spec);spec.loader.exec_module(gate)
  schema=json.loads((ROOT/OLD).read_text());registry=gate.offline_schema_registry();new=json.loads((ROOT/'Plans/backup_destination_lifecycle_contract_fixtures.json').read_text());old=json.loads((ROOT/'Plans/backup_restore_system_contract_fixtures.json').read_text());reads=json.loads((ROOT/'Plans/backup_bounded_read_fixtures.json').read_text())
  for kind in ('request','result'):
   current=gate.validator_for(schema,{'$ref':'#/$defs/backup_current_command_'+kind},registry);historical=gate.validator_for(schema,{'$ref':'#/$defs/backup_restore_command_'+kind},registry)
   for c in new['valid']:self.assertEqual([],list(current.iter_errors(c['value'][kind])),c['name'])
   for c in reads['valid']:
    if c['definition']=='fixture_case':self.assertEqual([],list(current.iter_errors(c['value'][kind])))
   for c in old['valid']:
    if c.get('definition')=='backup_action_'+kind+'_v2':self.assertEqual([],list(current.iter_errors(c['value'])))
   if kind=='request':values=[c['value'] for c in old['valid'] if c.get('definition')=='backup_restore_command_request' and c['value']['command_id'] in CMDS]
   else:
    template=next(c['value'] for c in old['valid'] if c.get('definition')=='backup_restore_command_result');values=[dict(template,command_id=cmd,recovery_state='not_applicable') for cmd in CMDS]
   self.assertEqual(CMDS,{v['command_id'] for v in values})
   for value in values:self.assertEqual([],list(historical.iter_errors(value)));self.assertTrue(list(current.iter_errors(value)))
 def test_three_logical_groups_cover_only_real_records(self):
  registry=json.loads((ROOT/'Plans/storage_value_registry.json').read_text());rows=[r for r in registry['contract_family_dispositions'] if r['schema_ref']==SCHEMA]
  self.assertEqual(3,len(rows));kinds=set()
  for r in rows:
   kinds.update(r['record_kinds']);self.assertFalse(r['runtime_evidence']);self.assertEqual([],r['existing_family_refs'])
   transient=r['disposition_id']=='scd.backup.destination_lifecycle_transport.v1';self.assertEqual('not_applicable_nonpersisted' if transient else 'physical_family_registration_pending',r['physical_family_status'])
  schema=json.loads((ROOT/SCHEMA).read_text());expected={v['properties']['schema_id']['const'] for k,v in schema['$defs'].items() if k!='fixture_case' and 'schema_id' in v.get('properties',{})};self.assertEqual(expected,kinds);self.assertEqual(10,len(kinds))
 def test_existing_touch_partial_no_new_profile(self):
  touch=json.loads((ROOT/'Plans/touch_closure.json').read_text());rows=[r for r in touch['rows'] if r[3] in CMDS];self.assertEqual(2,len(rows))
  for r in rows:self.assertEqual('TCP-BACKUP',r[1]);self.assertEqual('partial',r[4]);self.assertTrue(r[5])
if __name__=='__main__':unittest.main()
