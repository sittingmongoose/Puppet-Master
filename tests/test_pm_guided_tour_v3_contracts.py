"""Focused static regressions for Guided Tour v3; never runtime or GUI proof."""

from __future__ import annotations

import copy
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "Plans/guided_tour_contracts.schema.json"
FIXTURES_PATH = ROOT / "Plans/guided_tour_contract_fixtures.json"


class GuidedTourV3ContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
        cls.fixtures = json.loads(FIXTURES_PATH.read_text(encoding="utf-8"))
        cls.positives = {case["name"]: case for case in cls.fixtures["valid"]}
        cls.negatives = {case["name"]: case for case in cls.fixtures["invalid"]}

    def validator(self, definition: str, schema: dict | None = None) -> Draft202012Validator:
        owner = schema or self.schema
        return Draft202012Validator({**owner, "$ref": f"#/$defs/{definition}"})

    def errors(self, definition: str, instance: dict, schema: dict | None = None) -> list:
        return list(self.validator(definition, schema).iter_errors(instance))

    @staticmethod
    def materialize(base: dict, case: dict) -> dict:
        result = copy.deepcopy(base)
        for dotted, value in case.get("patch", {}).items():
            parts = dotted.split(".")
            current = result
            for part in parts[:-1]:
                current = current[int(part)] if isinstance(current, list) else current[part]
            leaf = parts[-1]
            if isinstance(current, list):
                current[int(leaf)] = copy.deepcopy(value)
            else:
                current[leaf] = copy.deepcopy(value)
        for dotted in case.get("remove", []):
            parts = dotted.split(".")
            current = result
            for part in parts[:-1]:
                current = current[int(part)] if isinstance(current, list) else current[part]
            leaf = parts[-1]
            if isinstance(current, list):
                del current[int(leaf)]
            else:
                current.pop(leaf, None)
        return result

    def negative_instance(self, name: str) -> tuple[str, dict]:
        case = self.negatives[name]
        base = self.positives[case["base_valid"]]["value"]
        return case["definition"], self.materialize(base, case)

    @staticmethod
    def without_rule(schema: dict, definition: str, rule: str) -> dict:
        weakened = copy.deepcopy(schema)
        contract = weakened["$defs"][definition]
        contract["allOf"] = [item for item in contract.get("allOf", []) if item.get("x-rule") != rule]
        return weakened

    def test_schema_and_fixture_pack_are_v3(self) -> None:
        Draft202012Validator.check_schema(self.schema)
        self.assertEqual(
            self.schema["$id"],
            "https://puppetmaster.local/schemas/guided_tour/3.0.0/guided_tour_contracts.schema.json",
        )
        self.assertEqual(self.fixtures["schema_id"], "pm.guided_tour.contract_fixtures.v3")
        self.assertEqual(self.fixtures["schema_version"], "3.0.0")
        self.assertEqual(self.fixtures["owner_schema"], "Plans/guided_tour_contracts.schema.json")

    def test_all_positive_controls_validate_their_named_definitions(self) -> None:
        self.assertEqual(len(self.fixtures["valid"]), 24)
        for case in self.fixtures["valid"]:
            self.assertFalse(
                self.errors(case["definition"], case["value"]),
                f"positive {case['name']} must validate",
            )

    def test_all_counterexamples_are_rejected_by_the_target_definition(self) -> None:
        self.assertEqual(len(self.fixtures["invalid"]), 55)
        for case in self.fixtures["invalid"]:
            base = self.positives[case["base_valid"]]["value"]
            instance = self.materialize(base, case)
            self.assertTrue(
                self.errors(case["definition"], instance),
                f"negative {case['name']} must be rejected by $defs/{case['definition']}",
            )

    def test_stable_external_definition_and_action_pointer_names_are_preserved(self) -> None:
        defs = self.schema["$defs"]
        self.assertIn("story_order", defs)
        self.assertIn("ui_actions", defs)
        self.assertIn("guided_tour_checkpoint", defs)
        expected_actions = [
            "ui.guided_tour.start",
            "ui.guided_tour.next",
            "ui.guided_tour.show_me",
            "ui.guided_tour.back",
            "ui.guided_tour.pause",
            "ui.guided_tour.resume",
            "ui.guided_tour.skip",
            "ui.guided_tour.focus_route",
            "ui.guided_tour.toggle_eli5",
            "ui.guided_tour.finish",
            "ui.guided_tour.replay",
        ]
        action_enum = defs["guided_tour_action_request"]["properties"]["action_id"]["enum"]
        self.assertEqual(action_enum, expected_actions)
        self.assertEqual([item["const"] for item in defs["ui_actions"]["prefixItems"]], expected_actions)

    def test_story_is_chat_workspace_planning_and_v2_is_only_predecessor(self) -> None:
        storyboard = self.positives["canonical_newbie_first_storyboard"]["value"]
        self.assertEqual(storyboard["order"], ["chat_teacher", "workspace", "planning_wizard"])
        self.assertEqual(storyboard["ui_actions"][2], "ui.guided_tour.show_me")
        self.assertEqual(storyboard["predecessors"][1]["schema_id"], "pm.guided_tour.storyboard.v2")
        self.assertIn("superseded", storyboard["predecessors"][1]["disposition"])
        definition, predecessor = self.negative_instance("v2_storyboard_identity_is_rejected")
        self.assertTrue(self.errors(definition, predecessor))

    def test_checkpoint_is_closed_bounded_and_ref_only(self) -> None:
        props = self.schema["$defs"]["guided_tour_checkpoint"]["properties"]
        expected = {
            "schema_id", "schema_version", "checkpoint_id", "tour_session_id", "project_id",
            "storyboard_schema_id", "storyboard_revision", "step", "step_id",
            "completed_predicate_refs", "layout_owner_snapshot_ref", "chat_owner_snapshot_ref",
            "effective_explanation_mode", "session_revision", "checkpoint_revision",
            "owner_state_revision_refs", "persistence_scope", "domain_work_replay_allowed",
            "evidence_scope", "production_receipt_claim",
        }
        self.assertEqual(set(props), expected)
        for name in (
            "checkpoint_rejects_raw_conversation",
            "checkpoint_rejects_raw_draft",
            "checkpoint_rejects_credential_material",
            "checkpoint_rejects_transient_geometry",
        ):
            definition, instance = self.negative_instance(name)
            errors = self.errors(definition, instance)
            self.assertTrue(errors)
            self.assertTrue(any(error.validator == "additionalProperties" for error in errors), name)
        for name in (
            "checkpoint_rejects_chat_snapshot_in_layout_field",
            "checkpoint_rejects_layout_snapshot_in_chat_field",
        ):
            definition, instance = self.negative_instance(name)
            self.assertTrue(self.errors(definition, instance), name)

    def test_live_session_persists_only_bounded_checkpoint(self) -> None:
        session = self.positives["current_workspace_session_with_ref_only_capture"]["value"]
        self.assertEqual(session["durability_class"], "ephemeral_live_session")
        self.assertEqual(session["session_persistence"], "bounded_checkpoint_only")
        self.assertTrue(session["checkpoint_ref"])
        captured = session["captured_state"]
        self.assertTrue(captured["owner_refs_only"])
        self.assertTrue(captured["layout_owner_snapshot_ref"].startswith("layout_owner_snapshot:"))
        self.assertTrue(captured["chat_owner_snapshot_ref"].startswith("chat_owner_snapshot:"))

    def test_teacher_runtime_shape_has_one_answer_identity_and_no_copy_fields(self) -> None:
        props = self.schema["$defs"]["teacher_practice"]["properties"]
        self.assertIn("answer_ref", props)
        self.assertNotIn("eli5_answer_ref", props)
        self.assertNotIn("answer_text", props)
        self.assertNotIn("user_message", props)
        chat = self.positives["chat_first_local_stream_and_same_answer_eli5"]["value"]
        self.assertTrue(chat["teacher_practice"]["same_answer"])
        self.assertTrue(chat["eli5"]["same_facts"])
        self.assertEqual(chat["reply"]["provider_use_count"], 0)
        self.assertEqual(chat["reply"]["usage_increment"], 0)

    def test_compatible_noncontroller_contracts_keep_their_record_ids(self) -> None:
        defs = self.schema["$defs"]
        self.assertEqual(defs["guided_tour_teacher_copy_contract"]["properties"]["schema_id"]["const"], "pm.guided_tour.teacher_copy.v2")
        self.assertEqual(defs["guided_tour_teacher_library_contract"]["properties"]["schema_id"]["const"], "pm.guided_tour.teacher_library.v2")
        self.assertEqual(defs["guided_tour_focus_route_result"]["properties"]["schema_id"]["const"], "pm.guided_tour.focus_route_result.v1")

    def test_usage_focus_route_compatibility_does_not_change_story_order(self) -> None:
        request = self.positives["focus_route_is_typed_local_presentation"]["value"]
        result = self.positives["focus_route_result_is_local_and_nonpersistent"]["value"]
        self.assertEqual(request["step"], "workspace")
        self.assertEqual(request["route_target"], {"page_id": "usage"})
        self.assertEqual(result["after_page_id"], "usage")
        definition, wrong_page = self.negative_instance("focus_route_rejects_workspace_as_page_identity")
        self.assertTrue(self.errors(definition, wrong_page))
        storyboard = self.positives["canonical_newbie_first_storyboard"]["value"]
        self.assertEqual(storyboard["order"], ["chat_teacher", "workspace", "planning_wizard"])

    def test_planning_majority_thresholds_are_machine_checked(self) -> None:
        planning = self.positives["planning_majority_real_edit_and_boundary"]["value"]
        self.assertGreaterEqual(planning["majority"]["planning_action_share_basis_points"], 5000)
        self.assertGreaterEqual(planning["majority"]["planning_dwell_share_basis_points"], 5000)
        for name in ("planning_action_share_must_be_at_least_half", "planning_dwell_share_must_be_at_least_half"):
            definition, instance = self.negative_instance(name)
            self.assertTrue(self.errors(definition, instance))

    def test_restoration_failure_rule_is_causal(self) -> None:
        definition, instance = self.negative_instance("restoration_failure_cannot_report_completed")
        self.assertTrue(self.errors(definition, instance))
        weakened = self.without_rule(self.schema, definition, "restoration_failure_not_completed")
        weakened["$defs"][definition]["allOf"] = [
            rule
            for rule in weakened["$defs"][definition]["allOf"]
            if rule.get("x-rule") != "completed_restore_requires_applied_owner_restoration"
        ]
        self.assertFalse(self.errors(definition, instance, weakened))

    def test_completed_restore_applied_owner_rule_is_causal(self) -> None:
        definition, instance = self.negative_instance("completed_restore_cannot_claim_not_required")
        self.assertTrue(self.errors(definition, instance))
        weakened = self.without_rule(
            self.schema, definition, "completed_restore_requires_applied_owner_restoration"
        )
        self.assertFalse(self.errors(definition, instance, weakened))

    def test_explicit_keep_rule_is_causal(self) -> None:
        definition, instance = self.negative_instance("finish_keep_requires_explicit_selection")
        self.assertTrue(self.errors(definition, instance))
        weakened = copy.deepcopy(self.schema)
        finish_layout = weakened["$defs"][definition]["properties"]["finish_layout"]
        finish_layout["allOf"] = [
            rule for rule in finish_layout["allOf"] if rule.get("x-rule") != "finish_keep_is_explicit"
        ]
        self.assertFalse(self.errors(definition, instance, weakened))

    def test_resume_earliest_unsatisfied_rule_is_causal(self) -> None:
        definition, instance = self.negative_instance("resume_requires_earliest_unsatisfied_prerequisite")
        self.assertTrue(self.errors(definition, instance))
        weakened = self.without_rule(
            self.schema, definition, "resume_revalidates_and_returns_to_earliest_unsatisfied"
        )
        self.assertFalse(self.errors(definition, instance, weakened))

    def test_unsure_unresolved_rule_is_causal(self) -> None:
        definition, instance = self.negative_instance("unsure_cannot_be_resolved")
        self.assertTrue(self.errors(definition, instance))
        weakened = copy.deepcopy(self.schema)
        decision = weakened["$defs"][definition]["properties"]["access_decision"]
        decision["allOf"] = [
            rule for rule in decision["allOf"] if rule.get("x-rule") != "unsure_remains_unresolved"
        ]
        self.assertFalse(self.errors(definition, instance, weakened))

    def test_owner_observation_rule_is_causal(self) -> None:
        definition, instance = self.negative_instance("applied_observation_requires_mounted_owner_result")
        self.assertTrue(self.errors(definition, instance))
        weakened = self.without_rule(
            self.schema, "owner_observation", "applied_requires_observed_owner_result"
        )
        self.assertFalse(self.errors(definition, instance, weakened))

    def test_applied_restore_rule_is_causal(self) -> None:
        definition, instance = self.negative_instance("finish_default_restore_must_restore_layout")
        self.assertTrue(self.errors(definition, instance))
        weakened = self.without_rule(
            self.schema, definition, "applied_restore_uses_original_layout_and_chat_snapshots"
        )
        self.assertFalse(self.errors(definition, instance, weakened))

    def test_claim_boundary_remains_explicit(self) -> None:
        description = self.schema["description"]
        for excluded_layer in ("browser", "native Slint", "runtime", "visual", "product acceptance"):
            self.assertIn(excluded_layer, description)
        for case in self.fixtures["valid"]:
            value = case["value"]
            if "production_receipt_claim" in value:
                self.assertFalse(value["production_receipt_claim"])


if __name__ == "__main__":
    unittest.main()
