"""Thread reply's exact consumer/custody boundary, never native proof."""
import json
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1]
SCHEMA='Plans/forge_thread_reply_contracts.schema.json'

class Bindings(unittest.TestCase):
    def test_exact_command_routes(self):
        entries=json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries']
        row=entries['catalog.forge_review_thread_reply']
        self.assertEqual('cmd.forge.review.thread.reply',row['ui_command_id'])
        self.assertEqual('handlers::forge::review_thread_reply',row['handler_location'])
        self.assertEqual([],row['expected_event_types'])
        self.assertIn('handler_unavailable',' '.join(row['acceptance_checks']))
        for kind in ('request','result'):self.assertEqual(SCHEMA+'#/$defs/'+kind,row[kind+'_schema_ref'])
        for path in ('Plans/Commands_System.md','Plans/Forge_Integrations.md'):
            line=next(s for s in (ROOT/path).read_text().splitlines() if s.startswith('| `cmd.forge.review.thread.reply` |') and '#/$defs/request' in s)
            self.assertIn('`'+SCHEMA+'#/$defs/request` -> `'+SCHEMA+'#/$defs/result`',line)

    def test_touch_partial_single_successor(self):
        d=json.loads((ROOT/'Plans/touch_closure.json').read_text())
        rows=[r for r in d['rows'] if r[1]=='TCP-FORGE-THREAD-REPLY']
        self.assertEqual(1,len(rows));self.assertEqual('TOUCH-FGI-022',rows[0][0]);self.assertEqual(['command','cmd.forge.review.thread.reply','partial'],rows[0][2:5]);self.assertTrue(rows[0][5])
        p=next(p for p in d['profiles'] if p['profile_id']=='TCP-FORGE-THREAD-REPLY')
        self.assertEqual(SCHEMA+'#/$defs/request',p['payload_schema_ref'])
        self.assertEqual(SCHEMA+'#/$defs/result',p['result_schema_ref'])

    def test_exact_runtime_kinds_have_pending_or_transient_custody(self):
        d=json.loads((ROOT/'Plans/storage_value_registry.json').read_text())
        rows=[r for r in d['contract_family_dispositions'] if r['schema_ref']==SCHEMA]
        self.assertEqual(4,len(rows))
        kinds=set()
        for r in rows:
            kinds.update(r['record_kinds']);self.assertFalse(r['runtime_evidence']);self.assertEqual([],r['existing_family_refs'])
            pending=r['disposition_id'] in ('scd.forge.thread_reply_observation.v1','scd.sir.forge_thread_reply_dispatch.v1')
            self.assertEqual('physical_family_registration_pending' if pending else 'not_applicable_nonpersisted',r['physical_family_status'])
        schema=json.loads((ROOT/SCHEMA).read_text())
        expected={v['properties']['schema_id']['const'] for k,v in schema['$defs'].items() if k!='fixture_case' and 'schema_id' in v.get('properties',{})}
        self.assertEqual(expected,kinds)
        self.assertEqual(5,len(kinds))

if __name__=='__main__':unittest.main()
