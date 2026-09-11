"""Regression evidence for full-thread value contracts; no runtime is executed."""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("pm_full_thread_semantics", ROOT / "scripts/pm_full_thread_semantics.py")
SEMANTICS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SEMANTICS)
GATE_SPEC = importlib.util.spec_from_file_location("pm_new_contracts_verify", ROOT / "scripts/pm-new-contracts-verify.py")
GATE = importlib.util.module_from_spec(GATE_SPEC)
GATE_SPEC.loader.exec_module(GATE)
SCHEMA = json.loads((ROOT / "Plans/full_thread_runtime_contracts.schema.json").read_text())
FIXTURES = json.loads((ROOT / "Plans/full_thread_runtime_contract_fixtures.json").read_text())
KINDS = {
    "command_outcome": "CommandOutcomeRecord", "observable_work": "ObservableWorkRecord",
    "full_thread_projection": "FullThreadProjectionRecord", "continuity": "ContinuityRecord",
    "governor_decision": "GovernorDecisionRecord", "public_ingress_gate": "PublicIngressGateDecision",
}


def example(name):
    return copy.deepcopy(next(case["instance"] for case in FIXTURES["positive"] if case["name"] == name))


def structure_errors(record):
    return list(Draft202012Validator(SCHEMA, format_checker=FormatChecker()).iter_errors(record))


def semantic_errors(record):
    return SEMANTICS.full_thread_semantic_failures(KINDS[record["record_kind"]], record)


class FullThreadContractTests(unittest.TestCase):
    def assert_valid(self, record):
        self.assertEqual([], [error.message for error in structure_errors(record)])
        self.assertEqual([], semantic_errors(record))

    def assert_invalid(self, record):
        self.assertTrue(structure_errors(record) or semantic_errors(record))

    def assert_semantic_rejection(self, record, rule):
        self.assertEqual([], [error.message for error in structure_errors(record)])
        self.assertIn(rule, semantic_errors(record))

    def work(self):
        return example("waiting_work_has_reason_and_reevaluation")

    def projection(self):
        record = example("hidden_projection_does_not_cancel_work")
        record.update(window_start=10, window_count=3, overscan_count=2,
                      total_item_count=20, stable_item_ids=["a", "b", "c", "d", "e"],
                      hidden_surface_policy="visible_hydrated")
        return record

    def test_all_authored_positives(self):
        Draft202012Validator.check_schema(SCHEMA)
        for case in FIXTURES["positive"]:
            with self.subTest(case=case["name"]):
                self.assert_valid(case["instance"])

    def test_command_terminal_evidence_and_nonterminal_boundaries(self):
        for outcome in SCHEMA["$defs"]["CommandOutcomeRecord"]["properties"]["outcome"]["enum"]:
            record = example("same_frame_command_acknowledgement")
            record["outcome"] = outcome
            if outcome in {"succeeded", "failed", "cancelled", "rejected", "terminal_unknown"}:
                record.update(owner_result_ref="owner-result:terminal", owner_result_sha256="a" * 64,
                              owner_result_schema_ref={"path": "Plans/shared_runtime_command_contracts.schema.json",
                                                       "json_pointer": "#/$defs/environment_connection_command_result",
                                                       "schema_id": "pm.shared_runtime.command_result.v1"})
            if outcome in {"succeeded", "cancelled"}:
                record["result_receipt_ref"] = "receipt:terminal"
            if outcome in {"failed", "rejected", "terminal_unknown"}:
                record["error_ref"] = "error:terminal"
            with self.subTest(outcome=outcome):
                self.assert_valid(record)
                if outcome in {"succeeded", "cancelled"}:
                    record["result_receipt_ref"] = None
                    self.assert_invalid(record)
                if outcome in {"failed", "rejected", "terminal_unknown"}:
                    record["error_ref"] = None
                    self.assert_invalid(record)

    def test_all_authored_negatives_and_central_semantic_dispatch(self):
        positives = {case["name"]: case["instance"] for case in FIXTURES["positive"]}
        for case in FIXTURES["negative"]:
            with self.subTest(case=case["name"]):
                record = GATE.materialize_invalid(case, positives)
                structural = structure_errors(record)
                failures = GATE.contract_semantic_failures(
                    "Plans/full_thread_runtime_contracts.schema.json", "<root>", record)
                if "semantic_rule" in case:
                    self.assertEqual([], [error.message for error in structural])
                    self.assertIn(case["semantic_rule"], failures)
                else:
                    self.assertTrue(structural)

    def test_acknowledged_command_needs_receipt_even_after_dispatch_frame(self):
        record = example("same_frame_command_acknowledgement")
        record.update(same_frame_acknowledged=False, acknowledgement_frame_id="frame-102",
                      acknowledgement_frame_offset=1)
        self.assert_valid(record)
        record["acknowledgement_receipt_ref"] = None
        self.assert_invalid(record)

    def test_same_frame_requires_matching_frame_identity(self):
        record = example("same_frame_command_acknowledgement")
        record["acknowledgement_frame_id"] = "different-frame"
        self.assert_semantic_rejection(record, "command_acknowledgement_frame_parity")

    def test_command_instance_is_not_an_optional_command_binding(self):
        record = example("same_frame_command_acknowledgement")
        record["identity"]["command_instance_id"] = None
        self.assert_invalid(record)

    def test_every_work_state_is_representable_and_terminal_controls_are_truthful(self):
        for state in SCHEMA["$defs"]["ObservableWorkRecord"]["properties"]["work_state"]["enum"]:
            record = self.work()
            record["work_state"] = state
            if state in {"completed", "cancelled"}:
                record["result_receipt_ref"] = "receipt:work-terminal"
            if state in {"failed", "recovery-required"}:
                record["error_ref"] = "error:work-terminal"
            if state in {"completed", "failed", "cancelled"}:
                record.update(cancel_available=False, background_available=False)
            with self.subTest(state=state):
                self.assert_valid(record)
                if state in {"completed", "cancelled"}:
                    record["result_receipt_ref"] = None
                    self.assert_invalid(record)
                if state in {"failed", "recovery-required"}:
                    record["error_ref"] = None
                    self.assert_invalid(record)

    def test_work_shape_cannot_silently_drop_packet_fields(self):
        for field in ("title", "subject_refs", "blocking_scope", "last_activity_at", "heartbeat_at",
                      "activity_evidence_ref", "progress_source", "parent_work_id", "child_work_ids"):
            record = self.work()
            del record[field]
            with self.subTest(field=field):
                self.assert_invalid(record)

    def test_determinate_progress_requires_known_source_and_real_denominator(self):
        record = self.work()
        record.update(progress_kind="bytes", completed_units=4, total_units=10,
                      progress_source="measured", progress_source_ref="measurement:bytes")
        self.assert_valid(record)
        for mutation in ({"progress_source": "unknown"}, {"total_units": 0}, {"progress_source_ref": None}):
            with self.subTest(mutation=mutation):
                self.assert_invalid({**record, **mutation})
        record["completed_units"] = 11
        self.assert_semantic_rejection(record, "work_progress_exceeds_denominator")

    def test_parent_child_cycles_and_future_activity_are_rejected(self):
        record = self.work()
        record["parent_work_id"] = record["observable_work_id"]
        self.assert_semantic_rejection(record, "work_relationship_cycle")
        record = self.work()
        record["child_work_ids"] = [record["observable_work_id"]]
        self.assert_semantic_rejection(record, "work_relationship_cycle")
        record = self.work()
        record["heartbeat_at"] = "2099-01-01T00:00:00Z"
        self.assert_semantic_rejection(record, "work_activity_in_future")

    def test_projection_bounds_and_exact_window_cardinality(self):
        record = self.projection()
        self.assert_valid(record)
        for mutation in ({"window_start": 21}, {"window_start": 19}, {"total_item_count": 4}):
            with self.subTest(mutation=mutation):
                self.assert_semantic_rejection({**record, **mutation}, "projection_window_out_of_bounds")
        for ids in (["a"], ["a", "b", "c", "d", "e", "f"]):
            self.assert_semantic_rejection({**record, "stable_item_ids": ids}, "projection_stable_id_cardinality")
        record.update(window_start=0, window_count=0, overscan_count=0, total_item_count=0, stable_item_ids=[])
        self.assert_valid(record)

    def test_projection_stale_current_and_future_generation_labels(self):
        record = self.projection()
        for disposition in ("rejected", "superseded_projection_only"):
            stale = {**record, "projection_generation": 43, "stale_generation_disposition": disposition}
            self.assert_valid(stale)
        for mutation in ({"projection_generation": 43}, {"projection_generation": 45},
                         {"stale_generation_disposition": "rejected"}):
            with self.subTest(mutation=mutation):
                self.assert_semantic_rejection({**record, **mutation}, "projection_generation_disposition")

    def test_continuity_keeps_identity_and_suppresses_duplicate_effects_and_usage(self):
        record = example("reconnect_preserves_operation_and_deduplicates_usage")
        for trigger in ("reconnect", "restart", "sleep", "external-return"):
            self.assert_valid({**record, "continuity_trigger": trigger})
        changed = copy.deepcopy(record)
        changed["identity"]["operation_id"] = "different-operation"
        self.assert_semantic_rejection(changed, "continuity_logical_identity_changed")
        self.assert_semantic_rejection({**record, "current_transport_epoch": 0}, "continuity_transport_epoch_regressed")
        self.assert_semantic_rejection({**record, "continuation_generation": 0}, "continuity_generation_disposition")
        stale = {**record, "continuation_generation": 0, "disposition": "stale_generation_rejected"}
        self.assert_valid(stale)
        for field in ("duplicate_effect_count", "duplicate_usage_count"):
            self.assert_invalid({**record, field: 1})

    def test_physical_gpu_and_media_budgets_use_the_existing_governor(self):
        for family in ("gpu", "media"):
            record = example("governor_degraded_admission_keeps_physical_parent")
            record["resource_family"] = family
            self.assert_valid(record)

    def test_owner_result_join_cannot_switch_command_operation_or_side_record(self):
        outcome = example("same_frame_command_acknowledgement")
        owner = {"command_id": outcome["command_id"],
                 "command_instance_id": outcome["identity"]["command_instance_id"],
                 "operation_id": outcome["identity"]["operation_id"],
                 "command_outcome_ref": "outcome:one"}
        self.assertEqual([], SEMANTICS.command_outcome_binding_failures(owner, outcome, "outcome:one"))
        for field in ("command_id", "command_instance_id", "operation_id", "command_outcome_ref"):
            with self.subTest(field=field):
                self.assertTrue(SEMANTICS.command_outcome_binding_failures({**owner, field: "different"}, outcome, "outcome:one"))


if __name__ == "__main__":
    unittest.main()
