"""Static Browser result/lineage/handoff regressions; no runtime execution."""

import copy
import importlib.util
import json
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("browser_owner_gate", ROOT / "scripts/pm-new-contracts-verify.py")
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)
SCHEMA_REL = "Plans/section15_browser_program_contracts.schema.json"
SCHEMA = json.loads((ROOT / SCHEMA_REL).read_text())
FIXTURES = json.loads((ROOT / "Plans/section15_browser_program_contract_fixtures.json").read_text())
VALUES = {case["name"]: case["value"] for case in FIXTURES["valid"]}


def validator(definition):
    body = SCHEMA["$defs"].get(definition, SCHEMA)
    return Draft202012Validator({**body, "$defs": SCHEMA["$defs"]}, format_checker=FormatChecker())


class BrowserProgramSemanticsTests(unittest.TestCase):
    def assert_valid(self, value):
        definition = value["record_kind"]
        self.assertEqual([], [error.message for error in validator(definition).iter_errors(value)])
        self.assertEqual([], GATE.contract_semantic_failures(SCHEMA_REL, definition, value))

    def test_all_positive_contracts(self):
        Draft202012Validator.check_schema(SCHEMA)
        for name, value in VALUES.items():
            with self.subTest(case=name):
                self.assert_valid(value)

    def test_all_negatives_preserve_their_intended_failure(self):
        for case in FIXTURES["invalid"]:
            with self.subTest(case=case["name"]):
                value = GATE.materialize_invalid(case, VALUES)
                definition = case.get("definition", value.get("record_kind", "<root>"))
                structure = list(validator(definition).iter_errors(value))
                semantics = GATE.contract_semantic_failures(SCHEMA_REL, definition, value)
                if "semantic_rule" in case:
                    self.assertEqual([], [error.message for error in structure])
                    self.assertIn(case["semantic_rule"], semantics)
                else:
                    self.assertTrue(structure)

    def test_each_representation_measure_is_mandatory_not_an_opaque_result_promise(self):
        for field in ("result_count", "omitted_count", "byte_estimate", "token_estimate"):
            with self.subTest(field=field):
                value = copy.deepcopy(VALUES["partial_representation_is_truthful"])
                value.pop(field)
                self.assertTrue(list(validator("representation_query_result").iter_errors(value)))

    def test_invalidation_reason_is_not_a_peer_current_state(self):
        current = copy.deepcopy(VALUES["partial_representation_is_truthful"])
        current["invalidation_reason"] = "navigation"
        self.assertTrue(list(validator("representation_query_result").iter_errors(current)))
        stale = copy.deepcopy(VALUES["invalidated_representation_is_historical_with_reason"])
        stale.pop("invalidation_reason")
        self.assertTrue(list(validator("representation_query_result").iter_errors(stale)))

    def test_every_manual_nonprogram_command_can_have_null_run_and_attempt(self):
        for name, original in VALUES.items():
            if not name.startswith("browser_command_request_") or original["scope"]["command_id"].startswith("cmd.browser.program."):
                continue
            with self.subTest(case=name):
                value = copy.deepcopy(original)
                value["scope"]["lineage"].update(run_id=None, attempt_id=None)
                self.assert_valid(value)

    def test_every_program_command_requires_its_real_run_and_attempt(self):
        for name, original in VALUES.items():
            if not name.startswith("browser_command_request_") or not original["scope"]["command_id"].startswith("cmd.browser.program."):
                continue
            with self.subTest(case=name):
                value = copy.deepcopy(original)
                value["scope"]["lineage"].update(run_id=None, attempt_id=None)
                self.assertTrue(list(validator("browser_command_request").iter_errors(value)))

    def test_execution_records_consume_one_run_bound_lineage(self):
        for name in ("browser_program_compile_request", "browser_program", "browser_program_result", "external_browser_adapter_receipt"):
            self.assertEqual({"$ref": "#/$defs/run_bound_lineage"}, SCHEMA["$defs"][name]["properties"]["lineage"])

    def test_all_noncompleted_handoff_states_do_not_invent_destination(self):
        for state in ("blocked_source_not_fenced", "blocked_unknown_effects", "destination_failed", "interrupted"):
            value = copy.deepcopy(VALUES["handoff_" + state + "_does_not_claim_future_reconstruction"])
            with self.subTest(state=state):
                self.assertIsNone(value["destination_browser_session_id"])
                self.assertIsNone(value["checkpoint_ref"])
                self.assertFalse(value["reconstructed"])
                self.assertFalse(value["retry_allowed"])
                self.assert_valid(value)

    def test_completed_handoff_requires_all_existing_prerequisites(self):
        for field in ("destination_home_server_id", "destination_execution_host_id", "destination_execution_environment_id", "destination_browser_session_id", "destination_browser_workspace_id", "destination_page_generation", "checkpoint_ref"):
            with self.subTest(field=field):
                value = copy.deepcopy(VALUES["handoff_is_reconstructive_and_source_fenced"])
                value[field] = None
                self.assertTrue(list(validator("browser_handoff_receipt").iter_errors(value)))

    def test_aggregate_dispatch_cannot_skip_browser_cross_field_validation(self):
        value = copy.deepcopy(VALUES["partial_representation_is_truthful"])
        value["coverage"]["frames_covered"] = 99
        self.assertIn("representation_coverage_bounds", GATE.contract_semantic_failures(SCHEMA_REL, "<root>", value))


if __name__ == "__main__":
    unittest.main()
