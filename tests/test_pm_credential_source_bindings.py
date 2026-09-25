"""Exact source-add consumers and pending custody, not native enablement."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = 'Plans/credential_source_add_contracts.schema.json'
OLD = 'Plans/shared_integration_runtime_expansion_contracts.schema.json'

class CredentialBindings(unittest.TestCase):
    def test_only_source_add_has_the_selected_profile(self):
        data = json.loads((ROOT/'Plans/touch_closure.json').read_text())
        profiles = {p['profile_id']: p for p in data['profiles']}
        rows = [r for r in data['rows'] if r[1] == 'TCP-CREDENTIAL-SOURCE-ADD']
        self.assertEqual(1, len(rows))
        self.assertEqual(['TOUCH-SGAPCMD-038','TCP-CREDENTIAL-SOURCE-ADD','command','cmd.credential_source.add','partial'], rows[0][:5])
        self.assertTrue(rows[0][5])
        selected = profiles['TCP-CREDENTIAL-SOURCE-ADD']
        self.assertEqual(SCHEMA+'#/$defs/request', selected['payload_schema_ref'])
        self.assertEqual(SCHEMA+'#/$defs/result', selected['result_schema_ref'])
        self.assertEqual([SCHEMA+'#/$defs/receipt'], selected['receipt_refs'])
        self.assertEqual(OLD+'#/$defs/IntegrationCredentialCommandRequest', profiles['TCP-INTEGRATION-CREDENTIAL']['payload_schema_ref'])
        self.assertEqual(9, sum(r[1]=='TCP-INTEGRATION-CREDENTIAL' for r in data['rows']))
        self.assertEqual('cmd.credential_source.add',data['alias_bindings']['cmd.credential.add']['exact_target'])

    def test_public_route_preserves_unavailable_handler_and_no_events(self):
        entries = json.loads((ROOT/'Plans/Wiring_Matrix.production.json').read_text())['entries']
        row = entries['catalog.credential_source_add']
        self.assertEqual('handlers::credential_broker::source_add',row['handler_location'])
        self.assertEqual([],row['expected_event_types'])
        self.assertIn('handler_unavailable',' '.join(row['acceptance_checks']))
        for kind in ('request','result'):
            self.assertEqual(SCHEMA+'#/$defs/'+kind,row[kind+'_schema_ref'])
        self.assertIn(SCHEMA+'#/$defs/receipt',row['effect_contract']['receipt_or_event_refs'])
        text=(ROOT/'Plans/Commands_System.md').read_text()
        line=next(s for s in text.splitlines() if s.startswith('| `cmd.credential_source.add` |'))
        self.assertIn('`'+SCHEMA+'#/$defs/request` -> `'+SCHEMA+'#/$defs/result`',line)

    def test_receipt_original_pending_and_secret_projections_not_persisted(self):
        data=json.loads((ROOT/'Plans/storage_value_registry.json').read_text())
        rows=[r for r in data['contract_family_dispositions'] if r['schema_ref']==SCHEMA]
        self.assertEqual(4,len(rows))
        kinds=set()
        for row in rows:
            kinds.update(row['record_kinds'])
            self.assertFalse(row['runtime_evidence'])
            self.assertEqual([],row['existing_family_refs'])
            pending=row['disposition_id'].endswith(('_receipt.v1','_original.v1'))
            self.assertEqual('physical_family_registration_pending' if pending else 'not_applicable_nonpersisted',row['physical_family_status'])
            self.assertEqual('excluded_unpersisted_untargetable',row['auth_browser_session_disposition'])
        self.assertEqual(7,len(kinds))

if __name__=='__main__':unittest.main()
