"""Static committed transition fixtures only; not native/persistence proof."""

import copy
import importlib.util
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
spec = importlib.util.spec_from_file_location("testing_session_events", ROOT / "scripts/pm-testing-session-event-admission.py")
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class TestingSessionEventTests(unittest.TestCase):
    def test_complete_scoped_admission_and_all_authored_negatives(self):
        report = gate.validate()
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["positive_cases"], 4)
        self.assertEqual(report["negative_cases"], 124)
        self.assertFalse(report["native_producer_proven"])

    def test_every_event_replays_without_an_effect_or_checkpoint_advance(self):
        for case in gate.fixture_cases():
            with self.subTest(event=case["event"]["event_type"]):
                oracle = gate.ReplayOracle()
                self.assertEqual(oracle.consume(case), "projected_no_effect")
                checkpoint = oracle.checkpoint
                self.assertEqual(oracle.consume(case), "duplicate_no_effect")
                self.assertEqual(oracle.checkpoint, checkpoint)
                self.assertEqual(oracle.projected_count, 1)
                self.assertEqual(oracle.executed_effects, 0)

    def test_readiness_resolves_real_payload_pointers_without_lifting_pinned_kernel(self):
        owner = gate.response.module("testing_event_readiness_reader", "pm-implementation-readiness.py")
        registry = gate.load("Plans/event_family_registry.json")
        for family in registry["families"]:
            with self.subTest(event=family["event_type"]):
                payload, schema_id = owner.event_family_payload_schema(family)
                self.assertIsInstance(payload, dict)
                self.assertEqual(schema_id, family["payload_schema_id"])
        failures = owner.event_family_registry_data_failures(
            registry, gate.load("Plans/event_family_registry.schema.json"),
            path_label="test:session-events", include_residuals=False)
        # The historical readiness pin is intentionally not a fresh seal.
        self.assertEqual({failure["error"] for failure in failures},
                         {"event_family_registry_kernel_row_count_mismatch"})
        self.assertEqual(owner.EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT, 39)

    def test_duplicate_new_transport_id_is_remembered_and_conflicts_quarantine(self):
        for case in gate.fixture_cases():
            with self.subTest(event=case["event"]["event_type"]):
                oracle = gate.ReplayOracle()
                oracle.consume(case)
                duplicate = copy.deepcopy(case)
                duplicate["event"]["event_id"] = "event:duplicate-alias"
                duplicate["event"]["sequence_id"] += 10
                self.assertEqual(oracle.consume(duplicate), "duplicate_no_effect")
                conflict = copy.deepcopy(duplicate)
                conflict["snapshot"]["projection_generation"] += 1
                conflict["event"]["payload"]["projection_generation"] += 1
                self.assertEqual(oracle.consume(conflict), "quarantined_without_checkpoint_advance")
                self.assertEqual(oracle.checkpoint, case["event"]["sequence_id"])
                self.assertEqual(oracle.projected_count, 1)

    def test_conflicting_global_event_id_cannot_cross_event_types(self):
        first, second = list(gate.fixture_cases())[:2]
        oracle = gate.ReplayOracle()
        oracle.consume(first)
        second["event"]["event_id"] = first["event"]["event_id"]
        self.assertEqual(oracle.consume(second), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.projected_count, 1)

    def test_global_event_id_cannot_cross_project_partition(self):
        case = next(gate.fixture_cases())
        other = copy.deepcopy(case)
        other["request"]["context"]["project_id"] = "project:other"
        binding = gate.response.request_digest(other["request"])
        other["request"]["idempotency"]["binding_sha256"] = binding
        result = other["event"]["payload"]["owner_result"]
        result["context"]["project_id"] = "project:other"
        result["request_binding_sha256"] = binding
        other["snapshot"]["context"] = copy.deepcopy(result["context"])
        other["snapshot"]["settled_result"] = copy.deepcopy(result)
        other["event"]["project_id"] = "project:other"
        other["event"]["sequence_id"] += 1
        self.assertEqual(gate.event_failures(other["event"], other["producer"], other["request"], other["snapshot"]), [])
        oracle = gate.ReplayOracle()
        oracle.consume(case)
        self.assertEqual(oracle.consume(other), "quarantined_without_checkpoint_advance")
        other["event"]["event_id"] = "event:other-project"
        self.assertEqual(oracle.consume(other), "projected_no_effect")

    def test_unadmitted_event_does_not_consume_checkpoint_or_identity(self):
        for case in gate.fixture_cases():
            oracle = gate.ReplayOracle()
            invalid = copy.deepcopy(case)
            invalid["event"]["event_type"] = "testing.session.invented"
            self.assertEqual(oracle.consume(invalid), "quarantined_without_checkpoint_advance")
            self.assertEqual(oracle.checkpoint, -1)
            self.assertEqual(oracle.consume(case), "projected_no_effect")

    def test_recovery_replays_original_snapshot_without_redispatch(self):
        journal = list(gate.fixture_cases())
        first, restarted = gate.ReplayOracle(), gate.ReplayOracle()
        for case in journal:
            self.assertEqual(first.consume(case), "projected_no_effect")
            self.assertEqual(restarted.consume(case), "projected_no_effect")
        for case in journal:
            self.assertEqual(restarted.consume(case), "duplicate_no_effect")
        self.assertEqual(restarted.generations, first.generations)
        self.assertEqual(restarted.checkpoint, first.checkpoint)
        self.assertEqual(restarted.executed_effects, 0)

    def test_protected_extra_fields_and_settlement_identity_are_closed(self):
        for case in gate.fixture_cases():
            for extra in ("raw_frame", "credential", "screenshot_bytes", "raw_dom"):
                changed = copy.deepcopy(case)
                changed["event"]["payload"]["owner_result"][extra] = "synthetic-forbidden"
                self.assertIn("payload_schema", gate.event_failures(
                    changed["event"], changed["producer"], changed["request"], changed["snapshot"]))
            changed = copy.deepcopy(case)
            changed["event"]["payload"]["owner_result"]["operation_id"] = "operation:foreign"
            self.assertIn("settled_owner_binding", gate.event_failures(
                changed["event"], changed["producer"], changed["request"], changed["snapshot"]))


if __name__ == "__main__":
    unittest.main()
