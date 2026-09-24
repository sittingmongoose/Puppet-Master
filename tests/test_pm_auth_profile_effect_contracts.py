"""Owner-bound effects and origins; static checks, not authentication/runtime proof."""

import copy
import importlib.util
import json
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = "Plans/multi_account_contracts.schema.json"
FIXTURE_PATH = "Plans/multi_account_contract_fixtures.json"
SPEC = importlib.util.spec_from_file_location("auth_profile_effect_gate", ROOT / "scripts/pm-new-contracts-verify.py")
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)
ALLOWED_EFFECTS = {
    "cmd.auth_profile.rename": {"no_effect", "profile_metadata_changed"},
    "cmd.auth_profile.open_official_page": {"no_effect", "external_handoff_started"},
}
BASE_CASES = {
    "cmd.auth_profile.rename": "server_gap_rename_result",
    "cmd.auth_profile.open_official_page": "result_open_official_page_settles_return_context",
}


class AuthProfileEffectContractsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT / SCHEMA_PATH).read_text(encoding="utf-8"))
        cls.fixtures = json.loads((ROOT / FIXTURE_PATH).read_text(encoding="utf-8"))
        cls.registry = GATE.offline_schema_registry()
        cls.positives = GATE.authored_positive_cases(cls.fixtures, request_mode="template_patch")
        cls.negatives = GATE.authored_invalid_cases(cls.fixtures)
        cls.positive_by_name = {case["name"]: case["instance"] for case in cls.positives}
        cls.result_validator = GATE.validator_for(
            cls.schema, {"$ref": "#/$defs/AuthProfileCommandResult"}, cls.registry,
        )

    def test_complete_owner_fixture_pair_and_coverage_remain_valid(self):
        Draft202012Validator.check_schema(self.schema)
        self.assertEqual([], GATE.validate_authored_command_coverage(
            SCHEMA_PATH, FIXTURE_PATH, self.schema, self.fixtures, self.positives, self.negatives,
        ))
        for case in self.positives:
            with self.subTest(positive=case["name"]):
                value = case["instance"]
                definition, selected = GATE.select_definition(self.schema, case, value, require_valid=True)
                self.assertEqual([], list(GATE.validator_for(self.schema, selected, self.registry).iter_errors(value)))
                self.assertEqual([], GATE.contract_semantic_failures(SCHEMA_PATH, definition, value))
        for case in self.negatives:
            with self.subTest(negative=case["name"]):
                value = GATE.materialize_invalid(case, self.positive_by_name)
                _, selected = GATE.select_definition(self.schema, case, value, require_valid=False)
                self.assertFalse(GATE.validator_for(self.schema, selected, self.registry).is_valid(value))

    def test_every_existing_effect_for_both_commands_and_every_outcome(self):
        properties = self.schema["$defs"]["AuthProfileCommandResult"]["properties"]
        for command, allowed in ALLOWED_EFFECTS.items():
            for outcome in properties["outcome"]["enum"]:
                for effect in properties["effect_kind"]["enum"]:
                    with self.subTest(command=command, outcome=outcome, effect=effect):
                        value = copy.deepcopy(self.positive_by_name[BASE_CASES[command]])
                        value.update(outcome=outcome, effect_kind=effect)
                        self.assertEqual(effect in allowed, self.result_validator.is_valid(value))

    def test_owner_reconciler_is_admitted_only_for_verify(self):
        validator = GATE.validator_for(
            self.schema, {"$ref": "#/$defs/AuthProfileCommandRequest"}, self.registry,
        )
        commands = set()
        for case in self.positives:
            original = case["instance"]
            if original.get("record_kind") != "AuthProfileCommandRequest":
                continue
            command = original["command_id"]
            commands.add(command)
            with self.subTest(case=case["name"], command=command):
                self.assertTrue(validator.is_valid(original))
                value = copy.deepcopy(original)
                value["origin"] = "owner_reconciler"
                self.assertEqual(command == "cmd.auth_profile.verify", validator.is_valid(value))
        self.assertEqual(set(self.schema["$defs"]["AuthProfileCommandId"]["enum"]), commands)

    def test_maintenance_origin_negatives_preserve_both_human_origins(self):
        validator = GATE.validator_for(
            self.schema, {"$ref": "#/$defs/AuthProfileCommandRequest"}, self.registry,
        )
        cases = {case["name"]: case for case in self.negatives}
        for operation in ("rename", "revoke", "transfer_preview", "transfer_apply"):
            with self.subTest(operation=operation):
                case = cases[f"owner_reconciler_cannot_{operation}"]
                self.assertEqual({"origin": "owner_reconciler"}, case["patch"])
                value = GATE.materialize_invalid(case, self.positive_by_name)
                self.assertFalse(validator.is_valid(value))
                for origin in ("human_gui", "human_palette"):
                    value["origin"] = origin
                    self.assertTrue(validator.is_valid(value))

    def test_no_effect_preserves_noop_and_non_success_result_context(self):
        for command in ALLOWED_EFFECTS:
            for outcome in ("completed", "blocked", "rejected", "cancelled", "failed", "recovery_required"):
                with self.subTest(command=command, outcome=outcome):
                    original = self.positive_by_name[BASE_CASES[command]]
                    value = copy.deepcopy(original)
                    value.update(outcome=outcome, effect_kind="no_effect", observable_work_ref=None)
                    if outcome != "completed":
                        value["error_ref"] = "error:auth-profile:effect-contract-fixture"
                        value["return_settlement"].update(settlement="retained", initiating_surface_restored=False)
                    self.assertEqual([], list(self.result_validator.iter_errors(value)))
                    for field in ("command_id", "command_instance_id", "provider_id", "route_id", "profile_id", "account_id",
                                  "expected_auth_revision", "resulting_auth_revision", "expected_profile_generation",
                                  "resulting_profile_generation", "event_effect_policy"):
                        self.assertEqual(original[field], value[field])

    def test_wrong_effect_fixtures_are_rejected_only_by_effect_binding(self):
        expected = {
            "rename_cannot_report_profile_revoked": "profile_revoked",
            "official_page_cannot_report_profile_selection_changed": "profile_selection_changed",
        }
        cases = {case["name"]: case for case in self.negatives}
        self.assertTrue(set(expected) <= set(cases))
        for name, effect in expected.items():
            with self.subTest(case=name):
                case = cases[name]
                self.assertEqual({"effect_kind": effect}, case["patch"])
                value = GATE.materialize_invalid(case, self.positive_by_name)
                errors = list(self.result_validator.iter_errors(value))
                self.assertTrue(errors)
                self.assertTrue(all(list(error.path) == ["effect_kind"] and error.validator == "enum" for error in errors))


if __name__ == "__main__":
    unittest.main()
