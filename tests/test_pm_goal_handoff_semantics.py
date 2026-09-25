"""Exact static GRS-047 joins; not native handoff or restart proof."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest
from unittest import mock

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("goal_handoff_gate", ROOT / "scripts/pm-new-contracts-verify.py")
gate = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(gate)
SCHEMA = "Plans/goal_handoff_contracts.schema.json"
FIXTURES = "Plans/goal_handoff_contract_fixtures.json"
ROUND_TRIP = "GoalHandoffCommandRoundTrip"


class GoalHandoffSemanticTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT / SCHEMA).read_text())
        cls.fixtures = json.loads((ROOT / FIXTURES).read_text())
        cls.positives = {case["name"]: case["value"] for case in cls.fixtures["valid"]}

    def validator(self, definition):
        return Draft202012Validator({"$ref": "#/$defs/" + definition, "$defs": self.schema["$defs"]})

    def test_explicit_closed_pair_registration_and_fixture_counts(self):
        self.assertEqual(self.schema["$id"], "https://puppetmaster.local/schemas/goal_handoff.schema.json")
        self.assertEqual(gate.CONTRACT_PAIRS.count((SCHEMA, FIXTURES)), 1)
        # The central manifest owns its growing census; this suite owns this pair.
        self.assertEqual(len(gate.CONTRACT_PAIRS), gate.EXPECTED_CONTRACT_PAIR_COUNT)
        self.assertEqual(len(self.fixtures["valid"]), 27)
        self.assertEqual(len(self.fixtures["invalid"]), 95)
        self.assertEqual(self.fixtures["coverage"]["positive_cases"], 27)
        self.assertEqual(self.fixtures["coverage"]["negative_cases"], 95)

    def test_all_positive_controls_pass_both_layers(self):
        for case in self.fixtures["valid"]:
            with self.subTest(case=case["name"]):
                self.assertTrue(self.validator(case["definition"]).is_valid(case["value"]))
                self.assertEqual(gate.contract_semantic_failures(SCHEMA, case["definition"], case["value"]), [])

    def test_all_named_negative_controls_reject_at_the_intended_layer(self):
        semantic_count = 0
        for case in self.fixtures["invalid"]:
            with self.subTest(case=case["name"]):
                value = gate.materialize_invalid(case, self.positives)
                structurally_valid = self.validator(case["definition"]).is_valid(value)
                if "semantic_rule" not in case:
                    self.assertFalse(structurally_valid)
                    continue
                semantic_count += 1
                self.assertTrue(structurally_valid)
                self.assertEqual(gate.contract_semantic_failures(SCHEMA, case["definition"], value), [case["semantic_rule"]])
                with mock.patch.object(gate, "goal_handoff_semantic_failures", return_value=[]) as check:
                    self.assertEqual(gate.contract_semantic_failures(SCHEMA, case["definition"], value), [])
                    check.assert_called_once_with(case["definition"], value)
        self.assertEqual(semantic_count, 87)

    def test_cross_command_mismatch_is_not_hidden_by_payload_discriminants(self):
        operations = ("checkpoint", "continue_on_host", "handoff_cancel", "handoff_retry", "pause", "resume_here")
        for index, operation in enumerate(operations):
            value = copy.deepcopy(self.positives["positive." + operation + ".round_trip"])
            value["result"] = copy.deepcopy(self.positives["positive." + operations[(index + 1) % 6] + ".result"])
            self.assertTrue(self.validator(ROUND_TRIP).is_valid(value))
            self.assertIn("goal_handoff.request_result_identity", gate.contract_semantic_failures(SCHEMA, ROUND_TRIP, value))

    def test_output_generation_is_not_compared_across_unadjudicated_domains(self):
        for operation in ("checkpoint", "continue_on_host", "handoff_cancel", "handoff_retry", "pause", "resume_here"):
            for generation in (0, 1, 100):
                value = copy.deepcopy(self.positives["positive." + operation + ".round_trip"])
                value["result"]["output"]["resulting_generation"] = generation
                self.assertTrue(self.validator(ROUND_TRIP).is_valid(value))
                self.assertEqual(gate.contract_semantic_failures(SCHEMA, ROUND_TRIP, value), [])

    def test_return_generation_echo_rejects_both_directions(self):
        value = copy.deepcopy(self.positives["positive.checkpoint.round_trip"])
        value["result"]["return_context"]["return_generation"] -= 1
        self.assertTrue(self.validator(ROUND_TRIP).is_valid(value))
        self.assertEqual(gate.contract_semantic_failures(SCHEMA, ROUND_TRIP, value), ["goal_handoff.exact_return_context"])

    def test_unrelated_definitions_and_schema_routes_remain_unaffected(self):
        self.assertEqual(gate.contract_semantic_failures(SCHEMA, "GoalHandoffLocalActionRequest", {}), [])
        self.assertEqual(gate.contract_semantic_failures("Plans/unrelated.schema.json", ROUND_TRIP, {}), [])
        self.assertEqual(gate.contract_semantic_failures(SCHEMA, ROUND_TRIP, {}), ["goal_handoff.invalid_record"])


if __name__ == "__main__":
    unittest.main()
