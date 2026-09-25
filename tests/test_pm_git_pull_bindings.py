"""Installed exact pull integration; static metadata is not native proof."""
import json,os
from pathlib import Path
import unittest
ROOT=Path(os.environ.get('PM_CANON_ROOT',Path(__file__).resolve().parents[1]))
DOMAIN='Plans/git_pull_selected.schema.json';SIR='Plans/sir_git_pull_dispatch.schema.json'
class Bindings(unittest.TestCase):
 def test_public_and_exact_wiring(self):
  entries=json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries'];r=entries['catalog.git_pull']
  self.assertEqual('cmd.git.pull',r['ui_command_id']);self.assertEqual('handlers::git::pull',r['handler_location']);self.assertEqual([],r['expected_event_types'])
  for kind in ('request','result'):self.assertEqual(DOMAIN+'#/$defs/'+kind,r[kind+'_schema_ref'])
  self.assertNotIn('stash_selected',json.dumps(r['acceptance_checks']));self.assertNotIn('two_step',json.dumps(r));self.assertNotIn('cmd.git.stash_pop',json.dumps(r))
  pop=next(v for v in entries.values() if v['ui_command_id']=='cmd.source_control.stash.pop')
  self.assertIn('stash_selected',json.dumps(pop));self.assertIn('two_step',json.dumps(pop))
  for f in ('Plans/Commands_System.md','Plans/UI_Command_Catalog.md'):
   text=(ROOT/f).read_text();self.assertIn('`'+DOMAIN+'#/$defs/request` -> `'+DOMAIN+'#/$defs/result`',text);self.assertIn(SIR,text)
 def test_touch_one_partial_pull(self):
  d=json.loads((ROOT/'Plans/touch_closure.json').read_text());rows=[r for r in d['rows'] if r[3]=='cmd.git.pull']
  self.assertEqual(1,len(rows));self.assertEqual(['TOUCH-GITPULL-001','TCP-GIT-PULL','command','cmd.git.pull','partial'],rows[0][:5])
  p=next(p for p in d['profiles'] if p['profile_id']=='TCP-GIT-PULL')
  self.assertEqual('SCS-003',p['plan_unit']);self.assertEqual(DOMAIN+'#/$defs/error',p['error_schema_ref']);self.assertEqual(DOMAIN+'#/$defs/request',p['payload_schema_ref'])
  checker=(ROOT/'scripts/pm-touch-closure-verify.py').read_text();self.assertIn('pull_schema["$defs"]["request"]["properties"]["command_id"]["const"]',checker)
 def test_runtime_custody_exact_and_no_new_family(self):
  d=json.loads((ROOT/'Plans/storage_value_registry.json').read_text());rows=[r for r in d['contract_family_dispositions'] if r['schema_ref'] in (DOMAIN,SIR)]
  self.assertEqual(4,len(rows));expected=set();seen=set()
  for f in (DOMAIN,SIR):
   schema=json.loads((ROOT/f).read_text());expected.update(v['properties']['schema_id']['const'] for k,v in schema['$defs'].items() if k!='fixture_case' and 'schema_id' in v.get('properties',{}))
  for r in rows:
   self.assertFalse(r['runtime_evidence']);self.assertEqual([],r['existing_family_refs']);self.assertFalse(seen.intersection(r['record_kinds']));seen.update(r['record_kinds'])
   pending=any(s in r['disposition_id'] for s in ('source_effect','dispatch'))
   self.assertEqual('physical_family_registration_pending' if pending else 'not_applicable_nonpersisted',r['physical_family_status'])
  self.assertEqual(expected,seen);self.assertEqual(11,len(seen));self.assertEqual(294,len(d['families']))
if __name__=='__main__':unittest.main()
