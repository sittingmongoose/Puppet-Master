"""Installed exact stash-apply integration; static metadata is not native proof."""
import json,os
from pathlib import Path
import unittest
ROOT=Path(os.environ.get('PM_CANON_ROOT',Path(__file__).resolve().parents[1]))
DOMAIN='Plans/git_stash_apply_selected.schema.json';SIR='Plans/sir_git_stash_apply_dispatch.schema.json'
class Bindings(unittest.TestCase):
 def test_public_and_exact_wiring(self):
  entries=json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries'];r=entries['catalog.source_control_stash_apply']
  self.assertEqual('cmd.source_control.stash.apply',r['ui_command_id']);self.assertEqual('handlers::source_control::stash_apply',r['handler_location']);self.assertEqual([],r['expected_event_types'])
  for kind in ('request','result'):self.assertEqual(DOMAIN+'#/$defs/'+kind,r[kind+'_schema_ref'])
  self.assertNotIn('two_step',json.dumps(r));self.assertNotIn('cmd.git.stash',json.dumps(r))
  self.assertIn('Plans/Source_Control_System.md#SCS-003',r['evidence_required']);self.assertIn('#SCS-024',r['evidence_required'])
  self.assertIn('SCS-003/SCS-024',json.dumps(r['acceptance_checks']))
  pop=next(v for v in entries.values() if v['ui_command_id']=='cmd.source_control.stash.pop')
  drop=next(v for v in entries.values() if v['ui_command_id']=='cmd.source_control.stash.drop')
  for row in (pop,drop):
   self.assertIn('stash_selected',json.dumps(row));self.assertIn('two_step',json.dumps(row))
  catalog=(ROOT/'Plans/UI_Command_Catalog.md').read_text()
  self.assertIn('`'+DOMAIN+'#/$defs/request` -> `'+DOMAIN+'#/$defs/result`',catalog);self.assertIn(SIR,catalog)
  self.assertIn('| `cmd.source_control.stash.apply` | Apply Stash | `domain_action` | selection (`stash_selected`) | none | `blocked_state_required`, `stale_projection` | source_control |',catalog)
  self.assertNotIn('stash-apply preview/index-restoration contracts remain pending',catalog)
  commands=(ROOT/'Plans/Commands_System.md').read_text()
  destructive=[line for line in commands.split('\n') if 'cmd.source_control.stash.drop' in line]
  self.assertEqual(1,len(destructive));self.assertIn('cmd.git.discard_hunks',destructive[0])
  self.assertNotIn('cmd.source_control.stash.apply',destructive[0])
 def test_no_new_command_or_event_record(self):
  entries=json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries']
  actions={entry['ui_command_id'] for entry in entries.values()}
  self.assertIn('cmd.source_control.stash.apply',actions)
  self.assertNotIn('cmd.git.stash.apply',actions);self.assertNotIn('cmd.git.stash_apply',actions)
  self.assertFalse([a for a in actions if a.startswith('cmd.git.stash') and not a.startswith('cmd.git.stash.')],sorted(actions))
  for row in entries.values():
   if row['ui_command_id']=='cmd.source_control.stash.apply':self.assertEqual([],row['expected_event_types'])
  events=json.loads((ROOT/'Plans/event_family_registry.schema.json').read_text()) if (ROOT/'Plans/event_family_registry.schema.json').is_file() else None
  if events is not None:self.assertNotIn('stash_apply',json.dumps(events))
 def test_touch_closure_needs_no_stash_apply_row(self):
  d=json.loads((ROOT/'Plans/touch_closure.json').read_text())
  self.assertEqual([], [row for row in d['rows'] if row[3] in ('cmd.source_control.stash.apply','cmd.source_control.stash.create')])
  self.assertEqual([], [p for p in d['profiles'] if DOMAIN in json.dumps(p) or SIR in json.dumps(p)])
  actions={row[3] for row in d['rows']}
  self.assertNotIn('cmd.source_control.stash.apply',actions)
  self.assertNotIn('cmd.source_control.stash.create',actions)
 def test_runtime_custody_exact_and_no_new_family(self):
  d=json.loads((ROOT/'Plans/storage_value_registry.json').read_text());rows=[r for r in d['contract_family_dispositions'] if r['schema_ref'] in (DOMAIN,SIR)]
  self.assertEqual(4,len(rows));expected=set();seen=set()
  for f in (DOMAIN,SIR):
   schema=json.loads((ROOT/f).read_text());expected.update(v['properties']['schema_id']['const'] for k,v in schema['$defs'].items() if k!='fixture_case' and 'schema_id' in v.get('properties',{}))
  for r in rows:
   self.assertFalse(r['runtime_evidence']);self.assertEqual([],r['existing_family_refs']);self.assertFalse(seen.intersection(r['record_kinds']));seen.update(r['record_kinds'])
   self.assertNotIn('fixture_case',json.dumps(r['record_kinds']))
   pending=any(s in r['disposition_id'] for s in ('source_effect','dispatch'))
   self.assertEqual('physical_family_registration_pending' if pending else 'not_applicable_nonpersisted',r['physical_family_status'])
  self.assertEqual(expected,seen);self.assertEqual(11,len(seen));self.assertEqual(294,len(d['families']))
  projection=next(r for r in rows if r['disposition_id']=='scd.sir.git_stash_apply_error_projection.v1')
  self.assertEqual('ephemeral_nonpersisted',projection['persistence_disposition'])
  self.assertIn('cancelled apply may keep the UI error null',projection['rationale'])
  for r in rows:self.assertNotIn('delivery_return_context',json.dumps(r['record_kinds']))
if __name__=='__main__':unittest.main()
