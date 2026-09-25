"""Static value joins only. Run staged tests with PM_CONTRACT_ROOT at canon."""
from copy import deepcopy
import json
import os
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
CONTRACT_ROOT = Path(os.environ.get('PM_CONTRACT_ROOT', ROOT))
sys.path.insert(0, str(CONTRACT_ROOT / 'scripts'))
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_onboarding_search_semantics as m


class SearchConsumer(unittest.TestCase):
    def value(self):
        return json.loads((ROOT / 'Plans/onboarding_search_consumer_contract_fixtures.json').read_text())['valid'][0]['value']

    def check(self, v, **overrides):
        deps = m.fixture_dependencies(v)
        deps.update(overrides)
        return m.validate_selection(v['result']['result_ref'], contract_root=CONTRACT_ROOT, **deps)

    def test_fixtures(self):
        data = json.loads((ROOT / 'Plans/onboarding_search_consumer_contract_fixtures.json').read_text())
        for row in data['valid'] + data['invalid']:
            with self.subTest(row=row['name']):
                self.assertEqual([], m.structural_errors(row['definition'], row['value'], CONTRACT_ROOT))
                self.assertEqual(row in data['invalid'], bool(self.check(row['value'])))

    def test_explicit_eligible_route(self):
        v = self.value()
        v['request'].update(mode='explicit', selected_route_ref='fixture:route:c')
        for key in ('selected_route_ref', 'selected_account_ref', 'selected_model_ref', 'readiness_proof_ref'):
            v['result'][key] = v['result'][key].replace(':b', ':c')
        self.assertEqual([], self.check(v))

    def test_skip_and_empty_are_not_ready(self):
        for mode, status in [('skip', 'skipped'), ('automatic', 'unresolved'), ('explicit', 'unresolved')]:
            v = self.value()
            v['request'].update(mode=mode, selected_route_ref='fixture:missing' if mode == 'explicit' else None)
            v['snapshot']['candidates'] = []
            v['result']['status'] = status
            for key in ('selected_route_ref', 'selected_account_ref', 'selected_model_ref', 'readiness_proof_ref'):
                v['result'][key] = None
            self.assertEqual([], self.check(v))

    def test_current_context_fields_are_exact(self):
        for field in ('revision', 'continuation_generation', 'initiating_client_id', 'return_focus_id'):
            v = self.value()
            old = v['continuation'][field]
            v['continuation'][field] = old + 1 if isinstance(old, int) else 'fixture:other'
            self.assertTrue(self.check(v), field)

    def test_real_registry_resolution_not_embedded_candidate_claim(self):
        v = self.value()
        actual = deepcopy(v['snapshot'])
        actual['candidates'][1]['selection_state'] = 'ineligible'
        self.assertTrue(self.check(v, resolve_ranked_registry=lambda *args: actual))

    def test_native_authenticity_and_currentness_are_mandatory(self):
        v = self.value()
        self.assertTrue(self.check(v, verify_registry_and_readiness=lambda *args: ['actual_account_not_eligible']))
        self.assertTrue(self.check(v, check_current_use=lambda *args: ['client_not_current']))
        self.assertTrue(self.check(v, verify_registry_and_readiness=lambda *args: True))

    def test_resolver_cannot_rewrite_original(self):
        v = self.value()
        def registry(*args):
            v['request']['mode'] = 'explicit'
            v['request']['selected_route_ref'] = 'fixture:route:b'
            return v['snapshot']
        self.assertIn('search_original_mutated', self.check(v, resolve_ranked_registry=registry))

    def test_later_helper_cannot_mutate_prior_source(self):
        v = self.value()
        def continuation(*args):
            v['snapshot']['revision'] = 'changed'
            v['result']['registry_revision'] = 'changed'
            return v['continuation']
        self.assertIn('search_original_mutated', self.check(v, resolve_current_continuation=continuation))

    def test_original_onboarding_semantics_are_composed(self):
        v = self.value()
        for key in ('return_context', 'continuation'):
            v[key]['reviewed_setup_plan_revision'] += 1
        self.assertTrue(self.check(v))

    def test_closed_context_schema_rejects_untyped_shortcut(self):
        v = self.value()
        v['return_context'] = {'project_id': 'project:new-1',
            'return_context_id': v['return_context']['return_context_id']}
        self.assertTrue(self.check(v))


if __name__ == '__main__':
    unittest.main()
