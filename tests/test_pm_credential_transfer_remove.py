"""Focused SIR-024 transfer/remove companion regression; synthetic doubles establish no native proof."""
from copy import deepcopy
import ast
import json
import os
import sys
import subprocess
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

HERE = Path(__file__).resolve().parent
CAND = HERE.parent
JOB = CAND.parent
CANON = JOB / 'inputs' if (JOB / 'inputs' / 'Plans').is_dir() else CAND
sys.path.insert(0, str(CAND / 'scripts'))
from pm_credential_transfer_remove import (SCHEMA, case_failures, canonical_request_digest,
                                          credential_transfer_remove_semantic_failures,
                                          fixture_dependencies, structural_failures)

DEPENDENCIES = ('verify_original_admission', 'verify_preview_portability', 'verify_transfer_authorization',
                'verify_envelope_admission', 'verify_removal_facts', 'check_current_disclosure')
CALLBACKS = ('resolve_record', 'canonical_digest') + DEPENDENCIES

def original_json(relative_path):
    if CANON != CAND:
        return json.loads((CANON / relative_path).read_text())
    # Pin pre-integration source for assertions about the selected row migration.
    return json.loads(subprocess.check_output(
        ['git', 'show', '2c2abc315caf55c124b015bad302e63d4d5a2606:' + relative_path],
        cwd=CAND, text=True))


def deps(value, **overrides):
    args = fixture_dependencies(value)
    args.update(overrides)
    return args


class CredentialTransferRemove(unittest.TestCase):
    def setUp(self):
        self.pack = json.loads((CAND / 'Plans/credential_transfer_remove_fixtures.json').read_text())
        self.schema = json.loads((CAND / SCHEMA).read_text())

    def test_pair(self):
        for entry in self.pack['valid']:
            with self.subTest(name=entry['name']):
                self.assertEqual(structural_failures('fixture_case', entry['value'], canon_root=CANON), [])
                self.assertEqual(credential_transfer_remove_semantic_failures('fixture_case', entry['value'], canon_root=CANON), [])
        for entry in self.pack['invalid']:
            with self.subTest(name=entry['name']):
                self.assertEqual(structural_failures('fixture_case', entry['value'], canon_root=CANON), [])
                errors = credential_transfer_remove_semantic_failures('fixture_case', entry['value'], canon_root=CANON)
                if 'semantic_rule' in entry:
                    self.assertIn(entry['semantic_rule'], errors)
                else:
                    self.assertTrue(errors)

    def test_negative_pairs_pass_absent_the_semantic_join(self):
        valid_by_name = {entry['name']: entry['value'] for entry in self.pack['valid']}
        for entry in self.pack['invalid']:
            if 'base' not in entry:
                continue
            with self.subTest(name=entry['name'], base=entry['base']):
                base = valid_by_name[entry['base']]
                self.assertEqual(credential_transfer_remove_semantic_failures('fixture_case', base, canon_root=CANON), [])

    def test_record_level_schema_rejection(self):
        records = {entry['name']: entry['value']['records'] for entry in self.pack['invalid']}
        self.assertTrue(structural_failures('apply_request', records['apply_selection_secret_field']['request:apply-one'], canon_root=CANON))
        self.assertTrue(structural_failures('availability', records['availability_fabricated_native_evidence']['availability:transfer_preview'], canon_root=CANON))
        self.assertTrue(structural_failures('preview_record', records['preview_must_be_read_only']['preview:plan-one'], canon_root=CANON))
        self.assertTrue(structural_failures('envelope_admission', records['envelope_admission_carries_no_backup_id']['envelope-admission:one'], canon_root=CANON))
        valid = self.pack['valid'][2]['value']['records']
        self.assertEqual(structural_failures('apply_request', valid['request:apply-one'], canon_root=CANON), [])

    def test_current_dependencies_required(self):
        case = deepcopy(self.pack['valid'][2]['value'])
        for name in CALLBACKS:
            args = deps(case, **{name: None})
            self.assertIn('transfer_remove_dependencies_missing', case_failures(case, canon_root=CANON, **args))

    def test_boolean_and_refusal_callbacks_not_authority(self):
        by_name = {entry['name']: entry['value'] for entry in self.pack['valid']}
        case_for = {
            'verify_original_admission': 'apply_reference_transfer',
            'verify_preview_portability': 'preview_reference_ready',
            'verify_transfer_authorization': 'apply_reference_transfer',
            'verify_envelope_admission': 'apply_envelope_transfer',
            'verify_removal_facts': 'remove_clean_no_dependents',
            'check_current_disclosure': 'apply_reference_transfer',
        }
        for name in DEPENDENCIES:
            for response in (True, ['authentic_owner_refusal']):
                case = deepcopy(by_name[case_for[name]])
                args = deps(case, **{name: lambda *_, v=response: v})
                self.assertTrue(case_failures(case, canon_root=CANON, **args), name)

    def test_original_mutation_rejected(self):
        case = deepcopy(self.pack['valid'][2]['value'])
        records = case['records']
        args = deps(case)

        def mutate(*_):
            records['original:apply-one']['actor_ref'] = 'actor:other'
            return []

        args['verify_transfer_authorization'] = mutate
        self.assertIn('transfer_remove_inputs_mutated', case_failures(case, canon_root=CANON, **args))

    def test_callback_copy_mutation(self):
        case = deepcopy(self.pack['valid'][0]['value'])
        args = deps(case)

        def mutate(request, *_):
            request['authority']['actor_ref'] = 'actor:other'
            return []

        args['verify_original_admission'] = mutate
        self.assertIn('transfer_remove_original_admission_inputs_mutated',
                      case_failures(case, canon_root=CANON, **args))

    def test_digest_mandatory_native_contract(self):
        case = deepcopy(self.pack['valid'][2]['value'])
        self.assertIn('transfer_remove_dependencies_missing',
                      case_failures(case, canon_root=CANON, **deps(case, canonical_digest=None)))
        self.assertIn('transfer_remove_digest_contract',
                      case_failures(case, canon_root=CANON, **deps(case, canonical_digest=lambda _: True)))

    def test_preview_is_not_an_apply_or_portability_grant(self):
        case = deepcopy(self.pack['valid'][2]['value'])
        case['records']['request:apply-one']['selection']['approval_ref'] = 'preview:plan-one'
        self.assertTrue(case_failures(case, canon_root=CANON, **deps(case)))
        preview = deepcopy(self.pack['valid'][0]['value']['records']['preview:plan-one'])
        preview.pop('read_only')
        self.assertTrue(structural_failures('preview_record', preview, canon_root=CANON))
        self.assertNotIn('approval', self.schema['$defs']['preview_record']['properties'])

    def test_no_secret_material_shapes(self):
        forbidden = {'password', 'passwd', 'secret', 'secret_bytes', 'cookie', 'private_key', 'api_key',
                     'access_token', 'refresh_token', 'ciphertext', 'raw_secret'}

        def walk(node):
            if isinstance(node, dict):
                for key, value in node.items():
                    self.assertNotIn(key, forbidden, key)
                    walk(value)
            elif isinstance(node, list):
                for item in node:
                    walk(item)

        for entry in self.pack['valid']:
            walk(entry['value'])
        request = deepcopy(self.pack['valid'][2]['value']['records']['request:apply-one'])
        request['authority']['raw_secret_material_present'] = True
        self.assertTrue(structural_failures('apply_request', request, canon_root=CANON))

    def test_family_grammar_unchanged(self):
        expansion = json.loads((CANON / 'Plans/shared_integration_runtime_expansion_contracts.schema.json').read_text())
        pack = json.loads((CANON / 'Plans/shared_integration_runtime_expansion_fixtures.json').read_text())
        registry = Registry().with_resource(expansion['$id'], Resource.from_contents(expansion))
        checked = 0
        for entry in pack['command_cases']:
            if entry['schema_family'] != 'integration_credential':
                continue
            for kind in ('request', 'result', 'permission'):
                selected = {'$ref': expansion['$id'] + '#/$defs/' + entry[kind + '_schema_def']}
                validator = Draft202012Validator(selected, registry=registry)
                self.assertEqual(list(validator.iter_errors(entry[kind])), [], entry['command_id'])
                checked += 1
        self.assertEqual(checked, 30)

    def test_touch_closure_binding(self):
        registry = json.loads((CAND / 'Plans/touch_closure.json').read_text())
        profile_id = 'TCP-INTEGRATION-CREDENTIAL-TRANSFER-REMOVE'
        profile = next(p for p in registry['profiles'] if p['profile_id'] == profile_id)
        self.assertEqual(profile['plan_unit'], 'SIR-024')
        self.assertEqual(profile['handler_status'], 'specified')
        self.assertEqual(profile['wiring_status'], 'specified')
        for field in ('dry_contract_ref', 'payload_schema_ref'):
            self.assertTrue((CAND / profile[field]).is_file(), profile[field])
        for ref in profile['receipt_refs'] + profile['test_refs']:
            path = ref.split('#', 1)[0]
            self.assertTrue((CAND / path).is_file() or (CANON / path).is_file(), ref)
        targets = {'cmd.credential_attachment.transfer.apply', 'cmd.credential_attachment.transfer.preview', 'cmd.credential_source.remove'}
        bound = {row[3]: row for row in registry['rows'] if row[1] == profile_id}
        self.assertEqual(set(bound), targets)
        for row in bound.values():
            self.assertEqual(row[4], 'partial')
        family_rows = {row[3] for row in registry['rows'] if row[1] == 'TCP-INTEGRATION-CREDENTIAL'}
        self.assertEqual(family_rows, {
            'cmd.credential_attachment.revoke', 'cmd.credential_attachment.revoke_active', 'cmd.credential_attachment.test',
            'cmd.credential_source.test', 'cmd.provider_binding.copy', 'cmd.provider_binding.resolve_on_destination'})
        source_add = original_json('Plans/touch_closure.json')
        before = {row[0]: row for row in source_add['rows']}
        for row in registry['rows']:
            if row[1] == profile_id:
                self.assertEqual(before[row[0]][1], 'TCP-INTEGRATION-CREDENTIAL')
                self.assertEqual(before[row[0]][2:], row[2:])
        if CANON != CAND:
            self.assertEqual(registry['external_disposition_registries'], source_add['external_disposition_registries'])

    def test_wiring_entries(self):
        wiring = json.loads((CAND / 'Plans/Wiring_Matrix.production.json').read_text())
        original = json.loads((CANON / 'Plans/Wiring_Matrix.production.json').read_text())
        schema = self.schema
        expected = {
            'catalog.credential_attachment_transfer_preview': ('preview_request', 'preview_result', 'preview_record'),
            'catalog.credential_attachment_transfer_apply': ('apply_request', 'apply_result', 'transfer_effect_receipt'),
            'catalog.credential_source_remove': ('remove_request', 'remove_result', 'removal_effect_receipt'),
        }
        for key, (req_def, res_def, receipt_def) in expected.items():
            entry = wiring['entries'][key]
            self.assertEqual(entry['request_schema_ref'], SCHEMA + '#/$defs/' + req_def)
            self.assertEqual(entry['result_schema_ref'], SCHEMA + '#/$defs/' + res_def)
            self.assertEqual(entry['effect_contract']['receipt_or_event_refs'][0], SCHEMA + '#/$defs/' + receipt_def)
            self.assertEqual(entry['effect_contract']['receipt_or_event_refs'][1], 'missing_event_registration')
            self.assertEqual(entry['expected_event_types'], [])
            self.assertIn(entry['acceptance_checks'][1], entry['acceptance_checks'])
            self.assertTrue(entry['acceptance_checks'][1].startswith('Validate the exact typed'))
            for def_name in (req_def, res_def, receipt_def):
                self.assertIn(def_name, schema['$defs'])
        untouched = {k: v for k, v in wiring['entries'].items() if k not in expected}
        original_untouched = {k: v for k, v in original['entries'].items() if k not in expected}
        self.assertEqual(untouched, original_untouched)

    def test_verifier_enrollment_is_narrow(self):
        source = (CAND / 'scripts/pm-new-contracts-verify.py').read_text()
        tree = ast.parse(source)
        pairs = count = None
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign) and getattr(node.targets[0], 'id', '') == 'CONTRACT_PAIRS':
                pairs = [elt.elts[0].value for elt in node.value.elts]
            if isinstance(node, ast.Assign) and getattr(node.targets[0], 'id', '') == 'EXPECTED_CONTRACT_PAIR_COUNT':
                count = node.value.value
        self.assertEqual(len(pairs), count)
        self.assertEqual(pairs.count('Plans/credential_transfer_remove_contracts.schema.json'), 1)
        self.assertIn('Plans/credential_transfer_remove_contracts.schema.json', pairs)
        self.assertIn('from pm_credential_transfer_remove import credential_transfer_remove_semantic_failures', source)
        self.assertIn('credential_transfer_remove_semantic_failures(definition_name, value, canon_root=ROOT)', source)


if __name__ == '__main__':
    unittest.main()
