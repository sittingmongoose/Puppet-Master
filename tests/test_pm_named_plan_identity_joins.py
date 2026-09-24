"""Static NamedPlan joins through the registered aggregate; no runtime proof."""
import copy
import importlib.util
import json
from pathlib import Path
import sys
import unittest

from referencing import Registry

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_named_plan_semantics import named_plan_action_join_failures

_spec = importlib.util.spec_from_file_location("named_plan_join_gate", ROOT / "scripts/pm-new-contracts-verify.py")
GATE = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(GATE)
SCHEMA_REL = "Plans/named_plan_system_contracts.schema.json"
SCHEMA = json.loads((ROOT / SCHEMA_REL).read_text())
FIXTURES = json.loads((ROOT / "Plans/named_plan_system_contract_fixtures.json").read_text())
DEFINITION = "named_plan_action_response_validation"


class NamedPlanIdentityJoinTests(unittest.TestCase):
    def setUp(self):
        self.positives = {case["name"]: case["value"] for case in FIXTURES["valid"]}
        self.seed = copy.deepcopy(self.positives["named_plan_pair_create_accepted"])

    def valid(self, value, definition=DEFINITION):
        return GATE.validator_for(SCHEMA, {"$ref": "#/$defs/" + definition}, Registry()).is_valid(value)

    def failures(self, value):
        return GATE.contract_semantic_failures(SCHEMA_REL, DEFINITION, value)

    def matched_outcomes(self):
        for name, source in self.positives.items():
            if not name.startswith("named_plan_pair_") or not name.endswith("_accepted") or "replay" in name:
                continue
            for outcome in ("accepted", "rejected", "cancelled", "no_change"):
                value = copy.deepcopy(source)
                response, request = value["response"], value["request"]
                if request["command_id"] == "cmd.named_plan.create" and outcome == "no_change":
                    continue  # command-specific disposition is not adjudicated
                response["outcome"] = outcome
                if outcome in ("rejected", "cancelled"):
                    response.update(named_plan_id=request["named_plan_id"], named_plan_revision=None,
                                    currentness_sha256=None, thread_group_ref=None, route_ref=None,
                                    receipt_refs=[], projection_ref=None, disabled_reason=None,
                                    error_code="permission_denied" if outcome == "rejected" else "cancelled")
                elif outcome == "no_change":
                    response.update(named_plan_revision=request["expected_named_plan_revision"] or 3,
                                    currentness_sha256=request["expected_currentness_sha256"], receipt_refs=[])
                yield value

    def test_all_registered_fixtures_and_semantic_negatives(self):
        self.assertIn((SCHEMA_REL, "Plans/named_plan_system_contract_fixtures.json"), GATE.CONTRACT_PAIRS)
        for case in FIXTURES["valid"]:
            with self.subTest(positive=case["name"]):
                definition, selected = GATE.select_definition(SCHEMA, case, case["value"], require_valid=True)
                self.assertTrue(GATE.validator_for(SCHEMA, selected, Registry()).is_valid(case["value"]))
                self.assertEqual([], GATE.contract_semantic_failures(SCHEMA_REL, definition, case["value"]))
        for case in FIXTURES["invalid"]:
            with self.subTest(negative=case["name"]):
                value = GATE.materialize_invalid(case, self.positives)
                definition, selected = GATE.select_definition(SCHEMA, case, value, require_valid=False)
                structurally_valid = GATE.validator_for(SCHEMA, selected, Registry()).is_valid(value)
                if "semantic_rule" in case:
                    self.assertTrue(structurally_valid)
                    self.assertIn(case["semantic_rule"], GATE.contract_semantic_failures(SCHEMA_REL, definition, value))
                else:
                    self.assertFalse(structurally_valid)

    def test_identity_negatives_start_from_matched_schema_valid_pairs(self):
        pairs = list(self.matched_outcomes())
        self.assertEqual(23, len(pairs))
        negatives = 0
        for value in pairs:
            self.assertTrue(self.valid(value))
            self.assertEqual([], self.failures(value))
            request = value["request"]
            mutations = {
                "command_id": "cmd.named_plan.rename" if request["command_id"] != "cmd.named_plan.rename" else "cmd.named_plan.open",
                "command_instance_id": "other-instance", "project_id": "other-project",
            }
            if request["named_plan_id"] is not None:
                mutations["named_plan_id"] = "other-plan"
            for field, replacement in mutations.items():
                with self.subTest(command=request["command_id"], outcome=value["response"]["outcome"], field=field):
                    changed = copy.deepcopy(value)
                    changed["response"][field] = replacement
                    self.assertTrue(self.valid(changed))
                    self.assertTrue(self.valid(changed["request"], "named_plan_action_request"))
                    self.assertTrue(self.valid(changed["response"], "named_plan_action_result"))
                    self.assertIn("named_plan.response_" + field + "_mismatch", self.failures(changed))
                    negatives += 1
        self.assertEqual(89, negatives)

    def test_original_replay_preserves_every_outcome_and_payload(self):
        count = 0
        for value in self.matched_outcomes():
            replay = copy.deepcopy(value)
            replay["original_request"] = copy.deepcopy(value["request"])
            replay["original_result"] = copy.deepcopy(value["response"])
            replay["response"]["replayed"] = True
            self.assertTrue(self.valid(replay))
            self.assertEqual([], self.failures(replay))
            missing = copy.deepcopy(replay)
            missing.update(original_request=None, original_result=None)
            self.assertTrue(self.valid(missing))
            self.assertIn("named_plan.replay_original_pair_missing", self.failures(missing))
            route = copy.deepcopy(replay)
            route["response"]["route_ref"] = "other-opaque-route"
            self.assertTrue(self.valid(route))
            self.assertIn("named_plan.replay_original_result_mismatch", self.failures(route))
            outcome = copy.deepcopy(replay)
            outcome["response"]["outcome"] = {"accepted": "no_change", "no_change": "accepted",
                                               "rejected": "cancelled", "cancelled": "rejected"}[value["response"]["outcome"]]
            if outcome["response"]["outcome"] == "accepted":
                outcome["response"]["receipt_refs"] = ["opaque-receipt"]
            self.assertTrue(self.valid(outcome))
            self.assertIn("named_plan.replay_original_result_mismatch", self.failures(outcome))
            count += 1
        self.assertEqual(23, count)

    def test_original_normalized_request_must_match_without_reinterpreting_retries(self):
        for field, replacement in (("name", "Different request"), ("priority", "urgent"),
                                   ("source_surface", "command_palette"), ("return_route_ref", "other-route"),
                                   ("permission_snapshot_ref", "other-permission"), ("idempotency_key", "other-key")):
            with self.subTest(field=field):
                value = copy.deepcopy(self.positives["named_plan_pair_replay_accepted"])
                value["request"][field] = replacement
                self.assertTrue(self.valid(value))
                self.assertIn("named_plan.replay_original_normalized_request_mismatch", self.failures(value))

    def test_typed_errors_keep_currentness_and_null_target_but_not_foreign_identity(self):
        value = copy.deepcopy(self.positives["named_plan_pair_stale_error_reports_currentness"])
        self.assertNotEqual(value["request"]["expected_currentness_sha256"], value["response"]["currentness_sha256"])
        self.assertEqual([], self.failures(value))
        value["response"]["named_plan_id"] = None
        self.assertTrue(self.valid(value))
        self.assertEqual([], self.failures(value))
        for field, replacement in (("command_id", "cmd.named_plan.open"), ("command_instance_id", "other-instance"),
                                   ("project_id", "other-project"), ("named_plan_id", "other-plan")):
            with self.subTest(field=field):
                changed = copy.deepcopy(value)
                changed["response"][field] = replacement
                self.assertTrue(self.valid(changed))
                self.assertIn("named_plan.response_" + field + "_mismatch", self.failures(changed))

    def test_validation_wrapper_and_nested_components_fail_closed(self):
        values = [None, [], {}, {**self.seed, "unknown_field": True}, {**self.seed, "request": None},
                  {**self.seed, "response": None}, {**self.seed, "schema_version": "2.0.0"}]
        missing = copy.deepcopy(self.seed)
        del missing["original_request"]
        values.append(missing)
        for value in values:
            with self.subTest(value=value):
                self.assertFalse(self.valid(value))
                self.assertEqual(["named_plan.validation_input_invalid"], self.failures(value))
        self.assertEqual(["named_plan.request_schema_invalid"], named_plan_action_join_failures({}, self.seed["response"]))
        self.assertEqual(["named_plan.response_schema_invalid"], named_plan_action_join_failures(self.seed["request"], {}))
        value = copy.deepcopy(self.positives["named_plan_pair_replay_accepted"])
        value["original_result"]["child_work_mutated"] = True
        self.assertFalse(self.valid(value))
        self.assertEqual(["named_plan.replay_original_result_not_first_result"], named_plan_action_join_failures(
            value["request"], value["response"], original_request=value["original_request"],
            original_result=value["original_result"]))

    def test_original_pair_is_separately_validated_and_not_another_replay(self):
        value = copy.deepcopy(self.positives["named_plan_pair_replay_accepted"])
        value["original_result"]["replayed"] = True
        self.assertTrue(self.valid(value))
        self.assertIn("named_plan.replay_original_result_not_first_result", self.failures(value))
        value["original_result"]["replayed"] = False
        value["original_request"]["project_id"] = "other-project"
        self.assertTrue(self.valid(value))
        self.assertIn("named_plan.original_response_project_id_mismatch", self.failures(value))
        value["original_request"] = {}
        self.assertEqual(["named_plan.original_request_schema_invalid"], named_plan_action_join_failures(
            value["request"], value["response"], original_request=value["original_request"],
            original_result=value["original_result"]))

    def test_shape_and_reference_presence_do_not_invent_resolved_receipt_authority(self):
        value = copy.deepcopy(self.positives["named_plan_pair_create_rejected"])
        value["response"]["receipt_refs"] = ["opaque-reference"]
        self.assertTrue(self.valid(value))
        self.assertEqual([], self.failures(value))
        value = copy.deepcopy(self.seed)
        value["response"]["route_ref"] = "not-the-requested-return-route"
        self.assertTrue(self.valid(value))
        self.assertEqual([], self.failures(value))
        self.assertIn("Validation-only", SCHEMA["$defs"][DEFINITION]["description"])
        self.assertEqual([], GATE.contract_semantic_failures(SCHEMA_REL, "named_plan_action_result", value["response"]))
        self.assertEqual([], GATE.contract_semantic_failures(SCHEMA_REL, "<root>", value))


if __name__ == "__main__":
    unittest.main()
