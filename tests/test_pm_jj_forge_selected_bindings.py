"""Exact public successor bindings; static metadata is not runtime admission."""
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
PROFILES={
    'catalog.jujutsu_git_push':('cmd.jujutsu.git.push','Plans/jj_publication_selected.schema.json','handlers::jujutsu::git_push'),
    'catalog.forge_pipeline_open_logs':('cmd.forge.pipeline.open_logs','Plans/forge_log_selection_contracts.schema.json','handlers::forge::pipeline_open_logs'),
}

class SelectedBindings(unittest.TestCase):
    def test_touch_successors_bind_exact_schemas_without_promoting_readiness(self):
        data=json.loads((ROOT/'Plans/touch_closure.json').read_text())
        profiles={p['profile_id']:p for p in data['profiles']}
        rows={r[3]:r for r in data['rows']}
        expected={
            'cmd.jujutsu.operation.undo':('TCP-JJ-RECOVERY','Plans/jj_operation_recovery.schema.json'),
            'cmd.jujutsu.operation.restore':('TCP-JJ-RECOVERY','Plans/jj_operation_recovery.schema.json'),
            'cmd.jujutsu.git.push':('TCP-JJ-PUBLICATION','Plans/jj_publication_selected.schema.json'),
            'cmd.forge.pipeline.open_logs':('TCP-FORGE-LOG-SELECTION','Plans/forge_log_selection_contracts.schema.json'),
            'cmd.forge.review.approve':('TCP-FORGE-REVIEW-DECISIONS','Plans/forge_review_decisions.schema.json'),
            'cmd.forge.review.request_changes':('TCP-FORGE-REVIEW-DECISIONS','Plans/forge_review_decisions.schema.json'),
        }
        self.assertEqual((646,149),(len(data['rows']),len(profiles)))
        for command,(profile,path) in expected.items():
            with self.subTest(command=command):
                self.assertEqual([profile,'command',command,'partial'],rows[command][1:5])
                self.assertTrue(rows[command][5])
                for kind in ('payload','result'):
                    definition='request' if kind=='payload' else kind
                    self.assertEqual(path+'#/$defs/'+definition,profiles[profile][kind+'_schema_ref'])

    def test_exact_public_routes_keep_existing_handlers_and_no_events(self):
        entries=json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries']
        command_text=(ROOT/'Plans/Commands_System.md').read_text()
        for key,(command,path,handler) in PROFILES.items():
            with self.subTest(command=command):
                row=entries[key]
                self.assertEqual(command,row['ui_command_id'])
                self.assertEqual(handler,row['handler_location'])
                self.assertEqual([],row['expected_event_types'])
                self.assertIn('handler_unavailable',' '.join(row['acceptance_checks']))
                for kind in ('request','result'):
                    self.assertEqual(path+'#/$defs/'+kind,row[kind+'_schema_ref'])
                self.assertIn(path+'#/$defs/result',row['effect_contract']['receipt_or_event_refs'])
                line=next(x for x in command_text.splitlines() if x.startswith('| `'+command+'` |'))
                self.assertIn('`'+path+'#/$defs/request` -> `'+path+'#/$defs/result`',line)
                self.assertEqual(1,sum(r.get('ui_command_id')==command for r in entries.values()))

    def test_native_enablement_not_granted_by_disposition(self):
        data=json.loads((ROOT/'Plans/storage_value_registry.json').read_text())
        ids={'scd.source_control.jj_publication_transport.v1','scd.source_control.jj_publication_metadata.v1',
             'scd.sir.jj_publication_dispatch_binding.v1','scd.forge.log_selection_transport.v1',
             'scd.forge.log_read_observation.v1','scd.sir.forge_log_dispatch_binding.v1'}
        rows=[r for r in data['contract_family_dispositions'] if r['disposition_id'] in ids]
        self.assertEqual(ids,{r['disposition_id'] for r in rows})
        self.assertEqual(6,len(rows))
        for r in rows:
            self.assertFalse(r['runtime_evidence'])
            self.assertEqual([],r['existing_family_refs'])
            self.assertIn(r['physical_family_status'],('not_applicable_nonpersisted','physical_family_registration_pending'))
            self.assertEqual('receipt_only_no_eventrecord_pending_event_authority',r['event_effect_policy'])

if __name__=='__main__':unittest.main()
