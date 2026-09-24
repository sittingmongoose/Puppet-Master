"""Search identity/route/return consistency only; no GUI or provider execution."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import patch

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('settings_search_gate', ROOT / 'scripts/pm-new-contracts-verify.py')
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)
import pm_settings_search_semantics as SEARCH

SCHEMA_PATH = 'Plans/settings_system_contracts.schema.json'
SCHEMA = json.loads((ROOT / SCHEMA_PATH).read_text())
PACK = json.loads((ROOT / 'Plans/settings_system_contract_fixtures.json').read_text())
POSITIVES = {case['case_id']: case for case in PACK['valid_cases']}
VALUES = {name: case['record'] for name, case in POSITIVES.items()}
NEGATIVES = [case for case in PACK['negative_cases'] if case['case_id'].startswith('search-')]


def definition(case):
    return (case.get('schema_ref') or POSITIVES[case['base_valid']]['schema_ref']).split('/')[-1]


def validator(name):
    return Draft202012Validator({'$ref': '#/$defs/' + name, '$defs': SCHEMA['$defs']})


class SettingsSearchContractTests(unittest.TestCase):
    def test_all_positive_shapes_and_semantics(self):
        Draft202012Validator.check_schema(SCHEMA)
        for name, case in POSITIVES.items():
            if not name.startswith('search-'):
                continue
            with self.subTest(name=name):
                self.assertEqual(list(validator(definition(case)).iter_errors(case['record'])), [])
                self.assertEqual(GATE.contract_semantic_failures(SCHEMA_PATH, definition(case), case['record']), [])

    def test_all_semantic_negatives_are_causal_and_structurally_valid(self):
        exercised = set()
        for case in NEGATIVES:
            rule = case.get('semantic_rule')
            if rule is None:
                continue
            with self.subTest(name=case['case_id']):
                value = GATE.materialize_invalid(case, VALUES)
                self.assertEqual(list(validator(definition(case)).iter_errors(value)), [])
                self.assertEqual(SEARCH.settings_search_semantic_failures(definition(case), value), [rule])
                # Disable the actual predicate; no alternate failure may mask it.
                with patch.dict(SEARCH.SEARCH_RULES, {rule: lambda _: True}):
                    self.assertEqual(GATE.contract_semantic_failures(SCHEMA_PATH, definition(case), value), [])
                exercised.add(rule)
        self.assertEqual(exercised, set(SEARCH.SEARCH_RULES))

    def test_all_structural_negatives_fail_closed(self):
        for case in NEGATIVES:
            if 'semantic_rule' in case:
                continue
            with self.subTest(name=case['case_id']):
                self.assertFalse(validator(definition(case)).is_valid(GATE.materialize_invalid(case, VALUES)))

    def test_seven_source_cases_have_explicit_values(self):
        names = ['grouped-results', 'duplicate-labels', 'typo-fuzzy-match', 'unavailable-result',
                 'manager-object', 'deep-setting-row', 'back-restores-query']
        self.assertTrue(all('search-' + name in VALUES for name in names))
        first, duplicate = VALUES['search-manager-object'], VALUES['search-duplicate-labels']
        self.assertEqual(first['selected_result']['human_label'], duplicate['selected_result']['human_label'])
        self.assertNotEqual(first['selected_result']['immutable_result_id'], duplicate['selected_result']['immutable_result_id'])
        self.assertNotEqual(first['route_request']['target'], duplicate['route_request']['target'])
        self.assertEqual(VALUES['search-typo-fuzzy-match']['route_request']['return_contract']['origin_query'], 'provder')
        # This checks the chosen identity, not an implementation of fuzzy search.

    def test_capability_unavailability_is_not_navigation_unavailability(self):
        value = VALUES['search-unavailable-result']
        self.assertEqual(value['current_result']['availability']['state'], 'disabled')
        self.assertEqual(value['route_availability']['state'], 'available')
        self.assertEqual(SEARCH.rejection(value), (None, 'returned'))
        self.assertFalse(value['owner_operation_authorized'])

    def test_deferred_gui_is_not_absent_canonical_route(self):
        for manager in ('onboarding-guided-tour', 'doctor'):
            value = copy.deepcopy(VALUES['search-manager-object'])
            for result in (value['selected_result'], value['current_result']):
                result['destination']['manager_id'] = manager
                result['destination']['detail_id'] = None
                result['result_type'] = 'manager'
            value['route_request']['target'] = copy.deepcopy(value['selected_result']['destination'])
            self.assertTrue(validator('settings_search_route_exchange').is_valid(value))
            self.assertEqual(SEARCH.settings_search_semantic_failures('settings_search_route_exchange', value), [])
            self.assertFalse(value['native_runtime_executed'])

    def test_selection_does_not_depend_on_native_focus_or_presentation(self):
        value = VALUES['search-result-identity-without-native-focus']
        self.assertIsNone(value['return_result']['restored_focus_id'])
        self.assertEqual(value['return_result']['restored_search_result_id'], value['selected_result']['immutable_result_id'])
        value = copy.deepcopy(VALUES['search-grouped-results'])
        value['selected_result']['human_label'] = 'Renamed display only'
        value['selected_result']['complete_settings_path'] = 'Presentation / Changed'
        self.assertEqual(SEARCH.settings_search_semantic_failures('settings_search_route_exchange', value), [])

    def test_existing_nonsearch_shapes_and_dispatch_stay_compatible(self):
        for case in PACK['valid_cases']:
            if case['case_id'].startswith('search-'):
                continue
            with self.subTest(name=case['case_id']):
                name = definition(case)
                self.assertTrue(validator(name).is_valid(case['record']))
                self.assertEqual(SEARCH.settings_search_semantic_failures(name, case['record']), [])
        request = VALUES['valid-settings-route-request']
        self.assertEqual(request['return_contract']['origin_query'], 'provider setup')
        self.assertNotIn('origin_search_result_id', request['return_contract'])
        self.assertNotIn('restored_search_result_id', VALUES['valid-settings-route-return'])

    def test_value_only_shapes_do_not_admit_new_root_records(self):
        root_refs = {entry['$ref'] for entry in SCHEMA['oneOf']}
        for name in ('settings_search_result', 'settings_search_route_exchange'):
            self.assertNotIn('#/$defs/' + name, root_refs)
            self.assertNotIn('schema_id', SCHEMA['$defs'][name]['properties'])
            self.assertNotIn('record_type', SCHEMA['$defs'][name]['properties'])
        for field, name in [('origin_search_result_id','return_contract'), ('restored_search_result_id','settings_route_return')]:
            self.assertNotIn(field, SCHEMA['$defs'][name]['required'])

    def test_all_eight_result_kinds_and_optional_help_boundary(self):
        kinds = {value['result_type'] for name,value in VALUES.items() if name.startswith('search-result-kind-')}
        self.assertEqual(kinds, set(SCHEMA['$defs']['settings_search_result']['properties']['result_type']['enum']))
        help_result = VALUES['search-result-kind-help']
        self.assertEqual(help_result['destination']['manager_id'], 'teacher-help')
        changed = copy.deepcopy(help_result)
        changed['destination']['manager_id'] = 'all-settings'
        self.assertTrue(validator('settings_search_result').is_valid(changed))
        self.assertEqual(SEARCH.settings_search_semantic_failures('settings_search_result', changed), ['search_result_kind'])


if __name__ == '__main__':
    unittest.main()
