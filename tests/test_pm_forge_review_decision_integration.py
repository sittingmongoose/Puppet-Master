"""Installed exact-two enrollment and static joins; no native execution proof."""
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest

ROOT = Path(os.environ.get('PM_CANON_ROOT', Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(ROOT / 'scripts'))
spec = importlib.util.spec_from_file_location('forge_review_integrated_gate', ROOT / 'scripts/pm-new-contracts-verify.py')
gate = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = gate
spec.loader.exec_module(gate)
SCHEMA = 'Plans/forge_review_decisions.schema.json'
FIXTURES = 'Plans/forge_review_decision_fixtures.json'

class ForgeReviewDecisionIntegration(unittest.TestCase):
    def test_closed_pair_and_actual_central_fixture_dispatch(self):
        self.assertEqual(gate.CONTRACT_PAIRS.count((SCHEMA, FIXTURES)), 1)
        schema = json.loads((ROOT / SCHEMA).read_text())
        fixtures = json.loads((ROOT / FIXTURES).read_text())
        self.assertEqual(fixtures['schema_version'], '1.0.0')
        registry = gate.offline_schema_registry()
        for positive, cases in ((True, fixtures['valid']), (False, fixtures['invalid'])):
            for case in cases:
                definition, selected = gate.select_definition(schema, case, case['value'], require_valid=positive)
                self.assertTrue(gate.validator_for(schema, selected, registry).is_valid(case['value']))
                errors = gate.contract_semantic_failures(SCHEMA, definition, case['value'])
                if positive:
                    self.assertEqual(errors, [])
                    self.assertEqual(gate.contract_semantic_failures(SCHEMA, 'result', case['value']['result']), [])
                else:
                    self.assertIn(case['semantic_rule'], errors)

    def test_exact_two_public_rows_preserve_availability_and_no_events(self):
        entries = json.loads((ROOT / 'Plans/Wiring_Matrix.production.json').read_text())['entries']
        selected = {key for key, row in entries.items() if row.get('request_schema_ref') == SCHEMA+'#/$defs/request'}
        self.assertEqual(selected, {'catalog.forge_review_approve', 'catalog.forge_review_request_changes'})
        for key in selected:
            row = entries[key]
            self.assertEqual(row['result_schema_ref'], SCHEMA+'#/$defs/result')
            self.assertEqual(row['expected_event_types'], [])
            self.assertIn('handler_unavailable', ' '.join(row['acceptance_checks']))
            self.assertIn('Plans/forge_integration_contracts.schema.json#/$defs/command_receipt', row['effect_contract']['receipt_or_event_refs'])

    def test_transport_separate_from_pending_observation_custody(self):
        registry = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
        rows = [row for row in registry['contract_family_dispositions'] if row['schema_ref'] == SCHEMA]
        self.assertEqual(len(rows), 2)
        kinds = {kind: row for row in rows for kind in row['record_kinds']}
        self.assertEqual(set(kinds), {'pm.forge.review_decision.request.v1', 'pm.forge.review_decision.result.v1', 'pm.forge.review_decision.observation.v1'})
        for kind in ('request', 'result'):
            self.assertEqual(kinds['pm.forge.review_decision.'+kind+'.v1']['persistence_disposition'], 'request_or_preview_nonpersisted')
        observation = kinds['pm.forge.review_decision.observation.v1']
        self.assertEqual(observation['physical_family_status'], 'physical_family_registration_pending')
        self.assertEqual(observation['existing_family_refs'], [])
        self.assertFalse(observation['runtime_evidence'])

    def test_other_command_cannot_use_two_action_request(self):
        schema = json.loads((ROOT / SCHEMA).read_text())
        value = json.loads((ROOT / FIXTURES).read_text())['valid'][0]['value']['request']
        value['authority']['command_id'] = 'cmd.forge.review.comment'
        validator = gate.validator_for(schema, schema['$defs']['request'], gate.offline_schema_registry())
        self.assertFalse(validator.is_valid(value))

if __name__ == '__main__':
    unittest.main()
