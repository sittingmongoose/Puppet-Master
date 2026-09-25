"""Review comment's exact consumer/custody boundary, never native proof."""
import json
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1]
SCHEMA='Plans/forge_review_comment_contracts.schema.json'

class Bindings(unittest.TestCase):
    def test_exact_command_routes(self):
        entries=json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries']
        row=entries['catalog.forge_review_comment']
        self.assertEqual('cmd.forge.review.comment',row['ui_command_id'])
        self.assertEqual('handlers::forge::review_comment',row['handler_location'])
        self.assertEqual([],row['expected_event_types'])
        self.assertIn('handler_unavailable',' '.join(row['acceptance_checks']))
        for kind in ('request','result'):self.assertEqual(SCHEMA+'#/$defs/'+kind,row[kind+'_schema_ref'])
        for path in ('Plans/Commands_System.md','Plans/Forge_Integrations.md'):
            line=next(s for s in (ROOT/path).read_text().splitlines() if s.startswith('| `cmd.forge.review.comment` |') and '#/$defs/request' in s)
            self.assertIn('`'+SCHEMA+'#/$defs/request` -> `'+SCHEMA+'#/$defs/result`',line)

    def test_touch_partial_single_successor(self):
        d=json.loads((ROOT/'Plans/touch_closure.json').read_text())
        rows=[r for r in d['rows'] if r[1]=='TCP-FORGE-REVIEW-COMMENT']
        self.assertEqual(1,len(rows));self.assertEqual('TOUCH-FGI-015',rows[0][0]);self.assertEqual(['command','cmd.forge.review.comment','partial'],rows[0][2:5]);self.assertTrue(rows[0][5])
        p=next(p for p in d['profiles'] if p['profile_id']=='TCP-FORGE-REVIEW-COMMENT')
        self.assertEqual(SCHEMA+'#/$defs/request',p['payload_schema_ref'])
        self.assertEqual(SCHEMA+'#/$defs/result',p['result_schema_ref'])

    def test_exact_runtime_kinds_have_pending_or_transient_custody(self):
        d=json.loads((ROOT/'Plans/storage_value_registry.json').read_text())
        rows=[r for r in d['contract_family_dispositions'] if r['schema_ref']==SCHEMA]
        self.assertEqual(4,len(rows))
        kinds=set()
        for r in rows:
            kinds.update(r['record_kinds']);self.assertFalse(r['runtime_evidence']);self.assertEqual([],r['existing_family_refs'])
            pending=r['disposition_id'] in ('scd.forge.review_comment_observation.v1','scd.sir.forge_review_comment_dispatch.v1')
            self.assertEqual('physical_family_registration_pending' if pending else 'not_applicable_nonpersisted',r['physical_family_status'])
        schema=json.loads((ROOT/SCHEMA).read_text())
        expected={v['properties']['schema_id']['const'] for k,v in schema['$defs'].items() if k!='fixture_case' and 'schema_id' in v.get('properties',{})}
        self.assertEqual(expected,kinds)
        self.assertEqual(5,len(kinds))

    def test_prior_six_preserved_among_eight_current_successors(self):
        import importlib.util,subprocess
        from jsonschema import Draft202012Validator
        from referencing import Resource
        path='Plans/forge_integration_contracts.schema.json'
        schema=json.loads((ROOT/path).read_text())
        baseline=json.loads(subprocess.check_output(['git','show','40e590fe7:'+path],cwd=ROOT,text=True))
        self.assertEqual(baseline['$defs']['command_request'],schema['$defs']['command_request'])
        self.assertEqual(baseline['$defs']['command_request_admission']['oneOf'][1],schema['$defs']['command_request_admission']['oneOf'][1])
        self.assertEqual(8,len(schema['$defs']['command_request_admission']['oneOf']))
        spec=importlib.util.spec_from_file_location('comment_binding_gate',ROOT/'scripts/pm-new-contracts-verify.py');gate=importlib.util.module_from_spec(spec);spec.loader.exec_module(gate)
        registry=gate.offline_schema_registry().with_resource(schema['$id'],Resource.from_contents(schema))
        admission=Draft202012Validator({'$ref':schema['$id']+'#/$defs/command_request_admission'},registry=registry)
        historical=Draft202012Validator({'$ref':schema['$id']+'#/$defs/command_request'},registry=registry)
        expected={'cmd.forge.review.approve','cmd.forge.review.request_changes','cmd.forge.pipeline.open_logs','cmd.forge.pipeline.cancel','cmd.forge.review.thread.reply','cmd.forge.review.comment'}
        seen=set()
        for fixture in ('forge_review_decision_fixtures.json','forge_log_selection_contract_fixtures.json','forge_cancel_selected_contract_fixtures.json','forge_thread_reply_contract_fixtures.json','forge_review_comment_contract_fixtures.json'):
            for case in json.loads((ROOT/'Plans'/fixture).read_text())['valid']:
                request=case['value'].get('request')
                if request is None:continue
                self.assertEqual([],list(admission.iter_errors(request)),fixture)
                if request['authority']['schema_id']=='pm.forge.command_request.v1':
                    self.assertEqual([],list(historical.iter_errors(request['authority'])),fixture)
                self.assertTrue(list(admission.iter_errors(request['authority'])),fixture)
                seen.add(request['authority']['command_id'])
        self.assertEqual(expected,seen)

if __name__=='__main__':unittest.main()
