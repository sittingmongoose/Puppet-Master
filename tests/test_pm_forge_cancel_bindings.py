"""Cancellation's exact consumer/custody boundary, never native proof."""
import json
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1]
SCHEMA='Plans/forge_cancel_selected_contracts.schema.json'

class Bindings(unittest.TestCase):
    def test_exact_command_routes(self):
        entries=json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries']
        row=entries['catalog.forge_pipeline_cancel']
        self.assertEqual('cmd.forge.pipeline.cancel',row['ui_command_id'])
        self.assertEqual('handlers::forge::pipeline_cancel',row['handler_location'])
        self.assertEqual([],row['expected_event_types'])
        self.assertIn('handler_unavailable',' '.join(row['acceptance_checks']))
        for kind in ('request','result'):self.assertEqual(SCHEMA+'#/$defs/'+kind,row[kind+'_schema_ref'])
        for path in ('Plans/Commands_System.md','Plans/Forge_Integrations.md'):
            line=next(s for s in (ROOT/path).read_text().splitlines() if s.startswith('| `cmd.forge.pipeline.cancel` |') and '#/$defs/request' in s)
            self.assertIn('`'+SCHEMA+'#/$defs/request` -> `'+SCHEMA+'#/$defs/result`',line)

    def test_touch_partial_single_successor(self):
        d=json.loads((ROOT/'Plans/touch_closure.json').read_text())
        rows=[r for r in d['rows'] if r[1]=='TCP-FORGE-CANCEL-SELECTED']
        self.assertEqual(1,len(rows));self.assertEqual(['command','cmd.forge.pipeline.cancel','partial'],rows[0][2:5]);self.assertTrue(rows[0][5])
        p=next(p for p in d['profiles'] if p['profile_id']=='TCP-FORGE-CANCEL-SELECTED')
        self.assertEqual(SCHEMA+'#/$defs/request',p['payload_schema_ref'])
        self.assertEqual(SCHEMA+'#/$defs/result',p['result_schema_ref'])

    def test_exact_runtime_kinds_have_pending_or_transient_custody(self):
        d=json.loads((ROOT/'Plans/storage_value_registry.json').read_text())
        rows=[r for r in d['contract_family_dispositions'] if r['schema_ref']==SCHEMA]
        self.assertEqual(4,len(rows))
        kinds=set()
        for r in rows:
            kinds.update(r['record_kinds']);self.assertFalse(r['runtime_evidence']);self.assertEqual([],r['existing_family_refs'])
            pending=r['disposition_id'] in ('scd.forge.cancel_metadata.v1','scd.sir.forge_cancel_dispatch.v1')
            self.assertEqual('physical_family_registration_pending' if pending else 'not_applicable_nonpersisted',r['physical_family_status'])
        schema=json.loads((ROOT/SCHEMA).read_text())
        expected={v['properties']['schema_id']['const'] for k,v in schema['$defs'].items() if k!='fixture_case' and 'schema_id' in v.get('properties',{})}
        self.assertEqual(expected,kinds)
        self.assertEqual(7,len(kinds))

if __name__=='__main__':unittest.main()
