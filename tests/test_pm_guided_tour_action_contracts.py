"""Static Tour exchanges: value consistency, never native/owner execution proof."""
import copy
import importlib.util
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_guided_tour_semantics as semantics


def materialize(base, case):
    result = copy.deepcopy(base)
    for dotted, value in case.get("patch", {}).items():
        parts = dotted.split(".")
        cursor = result
        for part in parts[:-1]:
            cursor = cursor[int(part)] if isinstance(cursor, list) else cursor[part]
        leaf = parts[-1]
        cursor[int(leaf) if isinstance(cursor, list) else leaf] = copy.deepcopy(value)
    return result


class TourActionContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT / "Plans/guided_tour_contracts.schema.json").read_text())
        cls.pack = json.loads((ROOT / "Plans/guided_tour_contract_fixtures.json").read_text())
        cls.valid = {c["name"]: c for c in cls.pack["valid"]}
        cls.invalid = {c["name"]: c for c in cls.pack["invalid"]}

    def errors(self, definition, value):
        return list(Draft202012Validator({**self.schema, "$ref": "#/$defs/" + definition}).iter_errors(value))

    def test_all_joined_positives_are_structurally_and_semantically_valid(self):
        for case in self.valid.values():
            with self.subTest(case=case["name"]):
                self.assertEqual([], self.errors(case["definition"], case["value"]))
                self.assertEqual([], semantics.guided_tour_semantic_failures(case["definition"], case["value"]))

    def test_negatives_prove_the_named_kind_of_rejection(self):
        for case in self.invalid.values():
            if case["definition"] not in {"guided_tour_action_exchange", "guided_tour_action_result"}:
                continue
            value = materialize(self.valid[case["base_valid"]]["value"], case)
            with self.subTest(case=case["name"]):
                errors = self.errors(case["definition"], value)
                if "semantic_rule" in case:
                    self.assertEqual([], errors, "semantic counterexample must stay schema-valid")
                    self.assertIn(case["semantic_rule"], semantics.guided_tour_semantic_failures(case["definition"], value))
                else:
                    self.assertTrue(errors, "structural counterexample must fail schema")

    def test_eleven_actions_have_correlation_staleness_and_effect_counterexamples(self):
        actions = self.schema["$defs"]["guided_tour_action_request"]["properties"]["action_id"]["enum"]
        self.assertEqual(11, len(actions))
        for action in actions:
            short = action.rsplit(".", 1)[1]
            self.assertEqual(action, self.valid["joined_" + short]["value"]["request"]["action_id"])
            for suffix in ("correlation_command_instance_id", "correlation_project_id", "correlation_tour_session_id", "correlation_actor_ref", "correlation_idempotency_key", "correlation_target_surface_id", "stale_revision", "stale_currentness_sha256", "forbidden_provider_use_count", "forbidden_controller_transport_persisted"):
                self.assertIn(short + "_" + suffix, self.invalid)

    def test_each_cross_record_rule_has_a_causal_counterexample(self):
        cases = {
            "tour.request_result_correlation": "start_correlation_command_instance_id",
            "tour.currentness_admission": "next_stale_currentness_sha256",
            "tour.initial_state": "start_substitutes_capture",
            "tour.replay_freshness": "replay_reuses_session",
            "tour.story_transition": "next_leaps_story",
            "tour.practice_owner_join": "show_me_other_owner",
            "tour.explanation_identity": "eli5_replaces_answer",
            "tour.pause_resume": "pause_runs_decorative_work",
            "tour.exit_restore": "skip_replacement_snapshot",
            "tour.partial_practice_retained": "eli5_partial_owner_practice_lost",
        }
        self.assertEqual(set(cases), {name for name, _ in semantics.RULES})
        for rule, name in cases.items():
            case = self.invalid[name]
            value = materialize(self.valid[case["base_valid"]]["value"], case)
            with self.subTest(rule=rule):
                self.assertEqual([], self.errors(case["definition"], value))
                self.assertEqual([rule], semantics.guided_tour_semantic_failures(case["definition"], value))
                with patch.object(semantics, "RULES", tuple(item for item in semantics.RULES if item[0] != rule)):
                    self.assertEqual([], semantics.guided_tour_semantic_failures(case["definition"], value))

    def test_initial_state_optional_intro_and_partial_practice_remain_distinct(self):
        for name, phase in (("joined_start", "comfort_intro"), ("joined_start_without_optional_intro", "open_chat")):
            value = self.valid[name]["value"]
            self.assertEqual(phase, value["result"]["state_after"]["phase"])
            self.assertIsNone(value["result"]["state_after"]["teacher_practice"])
            self.assertIsNone(value["result"]["state_after"]["checkpoint_ref"])
        value = self.valid["joined_eli5_before_answer_retains_partial_owner_practice"]["value"]
        self.assertTrue(value["context"]["partial_practice_owner_refs"])
        self.assertEqual(value["context"]["partial_practice_owner_refs"], value["partial_practice_owner_refs_after"])

    def test_each_of_eleven_actions_has_causal_correlation_and_currentness_rejection(self):
        for action in self.schema["$defs"]["guided_tour_action_request"]["properties"]["action_id"]["enum"]:
            short = action.rsplit(".", 1)[1]
            for suffix, rule in (("correlation_command_instance_id", "tour.request_result_correlation"), ("stale_currentness_sha256", "tour.currentness_admission")):
                case = self.invalid[short + "_" + suffix]
                value = materialize(self.valid[case["base_valid"]]["value"], case)
                with self.subTest(action=action, rule=rule):
                    self.assertEqual([], self.errors(case["definition"], value))
                    self.assertEqual([rule], semantics.guided_tour_semantic_failures(case["definition"], value))
                    with patch.object(semantics, "RULES", tuple(item for item in semantics.RULES if item[0] != rule)):
                        self.assertEqual([], semantics.guided_tour_semantic_failures(case["definition"], value))

    def test_pause_and_failed_restore_cannot_replace_original_capture_or_partial_practice(self):
        for name in ("joined_pause", "joined_skip_restore_recovery", "joined_finish_restore_recovery"):
            base = self.valid[name]["value"]
            for dotted, replacement in (("result.state_after.captured_state.layout_owner_snapshot_ref", "layout_owner_snapshot:replacement"), ("partial_practice_owner_refs_after", [])):
                value = materialize(base, {"patch": {dotted: replacement}})
                with self.subTest(case=name, field=dotted):
                    self.assertEqual([], self.errors("guided_tour_action_exchange", value))
                    self.assertIn("tour.partial_practice_retained", semantics.guided_tour_semantic_failures("guided_tour_action_exchange", value))

    def test_every_action_binds_the_current_actor_and_mounted_target_not_just_echoes(self):
        for action in self.schema["$defs"]["guided_tour_action_request"]["properties"]["action_id"]["enum"]:
            base = self.valid["joined_" + action.rsplit(".", 1)[1]]["value"]
            for field in ("actor_ref", "target_surface_id", "target_control_id"):
                value = materialize(base, {"patch": {"context." + field: "owner-context:other"}})
                with self.subTest(action=action, field=field):
                    self.assertEqual([], self.errors("guided_tour_action_exchange", value))
                    self.assertIn("tour.currentness_admission", semantics.guided_tour_semantic_failures("guided_tour_action_exchange", value))

    def test_durable_checkpoint_positive_is_only_a_hypothetical_fixture(self):
        value = self.valid["joined_hypothetical_checkpoint_resume_not_storage_admission"]["value"]
        self.assertEqual("hypothetical_registered_fixture_only", value["context"]["checkpoint_registration"])
        registry = json.loads((ROOT / "Plans/storage_value_registry.json").read_text())
        disposition = next(row for row in registry["contract_family_dispositions"] if row["disposition_id"] == "scd.guided_tour.checkpoint.v1")
        self.assertEqual("physical_family_registration_pending", disposition["physical_family_status"])
        self.assertFalse(value["result"]["effect_boundary"]["checkpoint_written"])
        pending = self.valid["joined_current_pending_checkpoint_unavailable"]["value"]
        self.assertEqual("disabled", pending["result"]["status"])

    def test_resume_can_return_backwards_to_revalidated_earliest_practice(self):
        for source in ("live", "checkpoint"):
            value = self.valid["joined_" + source + "_resume_returns_to_earliest_invalidated_practice"]["value"]
            self.assertNotEqual("chat_teacher", value["context"]["before"]["step"])
            self.assertEqual("select_teacher", value["result"]["state_after"]["phase"])
            self.assertEqual(value["context"]["original_capture"], value["result"]["state_after"]["captured_state"])
            self.assertEqual(value["context"]["partial_practice_owner_refs"], value["partial_practice_owner_refs_after"])
            self.assertEqual([], semantics.guided_tour_semantic_failures("guided_tour_action_exchange", value))

    def test_gate_routes_exact_tour_definition_and_fails_unknown(self):
        spec = importlib.util.spec_from_file_location("tour_contract_gate_test", ROOT / "scripts/pm-new-contracts-verify.py")
        gate = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(gate)
        case = self.invalid["show_me_other_owner"]
        value = materialize(self.valid[case["base_valid"]]["value"], case)
        self.assertIn(case["semantic_rule"], gate.contract_semantic_failures("Plans/guided_tour_contracts.schema.json", case["definition"], value))
        self.assertEqual(["tour.unknown_definition"], semantics.guided_tour_semantic_failures("unrecognized", {}))

    def test_standalone_specialized_outcome_cannot_disagree_with_outer_status(self):
        for action in ("skip", "finish", "focus_route"):
            value = copy.deepcopy(self.valid["standalone_result_" + action]["value"])
            value["status"] = "rejected"
            value["error"] = {"code": "invalid_transition", "reason": "Try again.", "retryable": True}
            with self.subTest(action=action):
                self.assertTrue(self.errors("guided_tour_action_result", value))
        recovery = copy.deepcopy(self.valid["joined_finish_restore_recovery"]["value"]["result"])
        recovery["error"]["code"] = "stale_revision"
        self.assertTrue(self.errors("guided_tour_action_result", recovery))

    def test_identical_retry_delivers_validated_history_without_reapplying_it(self):
        value = self.valid["joined_cached_next_after_live_revision_advanced"]["value"]
        self.assertGreater(value["context"]["revision"], value["request"]["expected_revision"])
        self.assertEqual(value["result"], value["context"]["prior_exchange"]["result"])
        self.assertEqual([], semantics.guided_tour_semantic_failures("guided_tour_action_exchange", value))
        recursive = copy.deepcopy(value)
        recursive["context"]["prior_exchange"]["context"]["prior_exchange"] = copy.deepcopy(value["context"]["prior_exchange"])
        self.assertTrue(self.errors("guided_tour_action_exchange", recursive))
        self.assertEqual(["tour.replay_freshness"], semantics.guided_tour_semantic_failures("guided_tour_action_exchange", recursive))


if __name__ == "__main__":
    unittest.main()
