"""Synthetic metadata regressions only; no provider/procedure/native effect."""
import copy
import hashlib
import json
from pathlib import Path
import sys
import unittest
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from pm_provider_setup_manifest_semantics import (schema, structural_errors,
    provider_setup_manifest_semantic_failures, fixture_dependencies, validate_setup_binding)


class ProviderSetupManifestTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = json.loads((ROOT / 'Plans/provider_setup_manifest_contract_fixtures.json').read_text())

    def value(self):
        return copy.deepcopy(self.pack['valid'][0]['value'])

    def check(self, value, **overrides):
        deps = fixture_dependencies(value)
        deps.update(overrides)
        return validate_setup_binding(value['binding']['binding_ref'], **deps)

    def repin(self, value):
        raw = json.dumps(value['manifest'], ensure_ascii=False, separators=(',', ':')).encode()
        value['binding']['manifest']['sha256'] = hashlib.sha256(raw).hexdigest()

    def test_schema_and_authored_pairs(self):
        Draft202012Validator.check_schema(schema())
        for row in self.pack['valid']:
            self.assertEqual([], structural_errors(row['definition'], row['value']))
            self.assertEqual([], provider_setup_manifest_semantic_failures(row['definition'], row['value']))
        for row in self.pack['invalid']:
            value = self.value()
            for dotted, replacement in row['patch'].items():
                keys = dotted.split('.')
                target = value
                for key in keys[:-1]:
                    target = target[int(key)] if isinstance(target, list) else target[key]
                target[int(keys[-1]) if isinstance(target, list) else keys[-1]] = replacement
            with self.subTest(case=row['name']):
                shape = structural_errors(row['definition'], value)
                if 'semantic_rule' in row:
                    self.assertEqual([], shape)
                    self.assertIn(row['semantic_rule'], provider_setup_manifest_semantic_failures(row['definition'], value))
                else:
                    self.assertTrue(shape)

    def test_all_sixteen_dimensions_required_and_no_execution_payload(self):
        manifest = self.value()['manifest']
        fields = ['provider_id', 'setup_method_id', 'label', 'credential_owner', 'account_creation_url',
            'authorization_destination', 'instructions', 'requirements', 'secure_input', 'callback',
            'validation_procedure_id', 'model_refresh_procedure_id', 'usage_refresh_procedure_id',
            'return_destination_ref', 'known_limitations', 'provenance']
        for field in fields:
            value = dict(manifest); value.pop(field)
            self.assertTrue(structural_errors('provider_setup_manifest', value), field)
        for field in ['command', 'argv', 'script', 'raw_secret', 'dispatch_handle']:
            self.assertTrue(structural_errors('provider_setup_manifest', dict(manifest, **{field: 'fixture-only'})))

    def test_exact_source_bytes_not_reserialized_or_opaque_hash_claim(self):
        value = self.value(); deps = fixture_dependencies(value)
        raw = deps['resolve_manifest_bytes'](None)
        self.assertIn('manifest_source_bytes', self.check(value, resolve_manifest_bytes=lambda _: raw + b' '))
        self.assertIn('original_manifest_unavailable', self.check(value,
            resolve_manifest_bytes=lambda _: b'{"schema_id":1,"schema_id":2}'))
        self.assertIn('manifest_bytes_unavailable', self.check(value, resolve_manifest_bytes=lambda _: value['manifest']))

    def test_input_type_and_callback_behavior_have_actual_owner_descriptors(self):
        for field, key in [('secure_input', 'type_id'), ('callback', 'behavior_id')]:
            value = self.value()
            value['manifest'][field][key] = None
            self.repin(value)
            self.assertIn('manifest_incomplete_' + field, self.check(value))
        value = self.value()
        value['manifest']['secure_input'] = {'type_id': None, 'owner_descriptor_ref': None}
        value['manifest']['callback'] = {'behavior_id': None, 'owner_behavior_ref': None}
        self.repin(value)
        self.assertEqual([], self.check(value))
        self.assertIn('official_manifest:unsupported_input_or_callback', self.check(value,
            verify_official_manifest=lambda *args: ['unsupported_input_or_callback']))

    def test_authentic_owner_proofs_mandatory_not_boolean(self):
        value = self.value()
        for key in ['verify_official_manifest', 'verify_route_account_binding', 'check_current_use']:
            deps = fixture_dependencies(value); deps.pop(key)
            with self.assertRaises(TypeError):
                validate_setup_binding(value['binding']['binding_ref'], **deps)
            self.assertTrue(self.check(value, **{key: lambda *args: True}))
            self.assertTrue(self.check(value, **{key: lambda *args: ['owner_denied']}))

    def test_procedure_resolution_closed_exact_role_entry_method_owner(self):
        for field in ['procedure_id', 'role', 'provider_entry_id', 'setup_method_id', 'credential_owner']:
            value = self.value(); actual = value['procedures'][0]
            replacement = 'refresh_usage' if field == 'role' else 'cli' if field == 'credential_owner' else 'fixture:other'
            changed = dict(actual, **{field: replacement})
            self.assertTrue(self.check(value, resolve_trusted_procedure=lambda _: changed), field)
        value = self.value()
        def missing(_):
            raise KeyError('not in actual trusted registry')
        self.assertIn('trusted_procedure_unavailable', self.check(value, resolve_trusted_procedure=missing))

    def test_inapplicable_url_optional_usage_and_existing_account_are_not_ready(self):
        value = self.value()
        value['manifest']['account_creation_url'] = None
        value['manifest']['authorization_destination'] = {'url': None, 'allowed_hosts': []}
        value['manifest']['model_refresh_procedure_id'] = None
        value['binding']['account_ref'] = 'fixture:account'
        self.repin(value)
        self.assertEqual([], self.check(value))
        self.assertIn('route_account_binding:wrong_product', self.check(value,
            verify_route_account_binding=lambda *args: ['wrong_product']))
        self.assertIsNone(value['binding']['readiness_proof_ref'])

    def test_host_suffix_wildcard_and_secret_url_never_authorize(self):
        value = self.value()
        value['manifest']['authorization_destination']['url'] = 'https://accounts.example.invalid.attacker.invalid/auth'
        self.repin(value)
        self.assertIn('manifest_destination_not_allowlisted', self.check(value))
        value['manifest']['authorization_destination']['allowed_hosts'] = ['*.invalid']
        self.repin(value)
        self.assertIn('manifest_allowlist_host', self.check(value))

    def test_current_route_account_topology_registry_and_return_are_native_fenced(self):
        value = self.value()
        observed = []
        deps = fixture_dependencies(value)
        deps['verify_official_manifest'] = lambda *args: observed.append('manifest') or []
        deps['verify_route_account_binding'] = lambda *args: observed.append('route') or []
        deps['check_current_use'] = lambda *args: observed.append('final') or ['stale_return_or_registry']
        self.assertIn('current_use:stale_return_or_registry', validate_setup_binding(value['binding']['binding_ref'], **deps))
        self.assertEqual(['manifest', 'route', 'final'], observed)

    def test_helper_cannot_rewrite_original_binding(self):
        value = self.value()
        def change(binding, manifest):
            binding['execution_host_id'] = 'fixture:foreign'
            return []
        self.assertIn('helper_changed_original_values', self.check(value, verify_route_account_binding=change))

    def test_manifest_resolver_cannot_substitute_original_reference(self):
        value = self.value()
        replacement = copy.deepcopy(value['manifest'])
        replacement.update(manifest_ref='fixture:substituted', revision='replacement-revision')
        raw = json.dumps(replacement, separators=(',', ':')).encode()
        def substitute(reference):
            reference.update(record_ref=replacement['manifest_ref'], revision=replacement['revision'],
                sha256=hashlib.sha256(raw).hexdigest())
            return raw
        self.assertEqual(['helper_changed_original_values'], self.check(value, resolve_manifest_bytes=substitute))
        value = self.value()
        def failed(reference):
            substitute(reference)
            raise OSError('source lost after mutation')
        self.assertEqual(['original_manifest_unavailable'], self.check(value, resolve_manifest_bytes=failed))

    def test_procedure_resolver_cannot_change_admitted_binding(self):
        value = self.value()
        original = fixture_dependencies(value)['resolve_trusted_procedure']
        def mutate(pid):
            value['binding']['provider_route_id'] = 'fixture:replacement-route'
            return original(pid)
        self.assertEqual(['helper_changed_original_values'], self.check(value, resolve_trusted_procedure=mutate))

    def test_later_resolver_cannot_rewrite_already_checked_procedure(self):
        value = self.value()
        original = fixture_dependencies(value)['resolve_trusted_procedure']
        seen = []
        def mutate(pid):
            if seen:
                seen[0]['role'] = 'refresh_usage'
            result = original(pid)
            seen.append(result)
            return result
        self.assertEqual(['helper_changed_original_values'], self.check(value, resolve_trusted_procedure=mutate))

    def test_replay_has_no_effect_and_does_not_manufacture_ready(self):
        value = self.value(); original = copy.deepcopy(value)
        self.assertEqual([], self.check(value)); self.assertEqual([], self.check(value))
        self.assertEqual(original, value)
        self.assertNotIn('ready', value['binding'])


if __name__ == '__main__':
    unittest.main()
