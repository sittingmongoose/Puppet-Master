"""Existing proof composition with fabricated independent owner doubles only."""
import copy
import json
from pathlib import Path
import sys
import unittest
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_provider_readiness_semantics import structural_errors, fixture_dependencies, validate_readiness, provider_readiness_semantic_failures


class ProviderReadinessTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = json.loads((ROOT / 'Plans/provider_readiness_contract_fixtures.json').read_text())

    def value(self):
        return copy.deepcopy(self.pack['valid'][0]['value'])

    def test_authored_pairs(self):
        for row in self.pack['valid']:
            self.assertEqual([], structural_errors(row['definition'], row['value']))
            self.assertEqual([], provider_readiness_semantic_failures(row['definition'], row['value']))
        for row in self.pack['invalid']:
            v = self.value()
            for dotted, replacement in row['patch'].items():
                target = v; keys = dotted.split('.')
                for k in keys[:-1]: target = target[k]
                target[keys[-1]] = replacement
            self.assertEqual([], structural_errors(row['definition'], v))
            self.assertIn(row['semantic_rule'], provider_readiness_semantic_failures(row['definition'], v))

    def test_optional_generation_refusal_lowers_confidence_usage_unavailable_is_not_failure(self):
        v = self.value(); p = v['proof']; f = p['observed_facts']['generation_verification_state']
        f.update(state='unavailable', reason_ref='fixture:refusal')
        p.update(generation_proof_ref=None, generation_refusal_ref='fixture:refusal', readiness_confidence='limited')
        self.assertEqual([], provider_readiness_semantic_failures('readiness_fixture', v))

    def test_independent_original_fact_cannot_be_substituted(self):
        v = self.value(); deps = fixture_dependencies(v)
        v['proof']['observed_facts']['account_identity_state']['evidence_refs'] = ['fixture:fake']
        self.assertIn('observed_fact_substitution', validate_readiness(v['proof']['proof_ref'], **deps))

    def test_actual_required_checks_not_caller_set(self):
        v = self.value(); deps = fixture_dependencies(v)
        deps['resolve_required_checks'] = lambda *args: v['owner_required_checks'] + ['usage_telemetry_state']
        self.assertIn('required_check_set', validate_readiness(v['proof']['proof_ref'], **deps))

    def test_late_helper_cannot_rewrite_original_or_prior_fact(self):
        v = self.value(); deps = fixture_dependencies(v); source = deps['resolve_fact']; seen = []
        def mutate(ref):
            if seen: seen[0]['state'] = 'unavailable'
            result = source(ref); seen.append(result); return result
        deps['resolve_fact'] = mutate
        self.assertEqual(['readiness_source_mutated'], validate_readiness(v['proof']['proof_ref'], **deps))

    def test_authentic_ownership_and_current_disclosure_are_mandatory(self):
        v = self.value()
        for key in ['verify_route_account_and_facts', 'check_current_disclosure']:
            deps = fixture_dependencies(v); deps.pop(key)
            with self.assertRaises(TypeError): validate_readiness(v['proof']['proof_ref'], **deps)
            deps[key] = lambda *args: True
            self.assertTrue(validate_readiness(v['proof']['proof_ref'], **deps))
            deps[key] = lambda *args: ['foreign_account_product_or_revoked']
            self.assertTrue(validate_readiness(v['proof']['proof_ref'], **deps))

    def test_installation_pair_and_no_fake_direct_route_install(self):
        v = self.value(); self.assertIsNone(v['proof']['installation_id'])
        self.assertEqual([], provider_readiness_semantic_failures('readiness_fixture', v))
        v['proof']['installation_generation'] = 2
        self.assertIn('installation_pair', provider_readiness_semantic_failures('readiness_fixture', v))

    def test_each_independent_dimension_required(self):
        for key in self.value()['proof']['observed_facts']:
            v = self.value(); del v['proof']['observed_facts'][key]
            self.assertTrue(structural_errors('readiness_fixture', v))


if __name__ == '__main__': unittest.main()
