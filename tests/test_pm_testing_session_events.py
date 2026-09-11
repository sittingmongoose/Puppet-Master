"""Static Testing candidates and DL-039 non-admission; no persistence proof."""

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
    def assert_quarantined_unchanged(self, oracle, case):
        before = copy.deepcopy(vars(oracle))
        self.assertEqual(oracle.consume(case), "quarantined_without_checkpoint_advance")
        self.assertEqual(vars(oracle), before)

    def test_static_candidates_and_all_authored_negatives_without_admission(self):
        report = gate.validate()
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["positive_cases"], 4)
        self.assertEqual(report["negative_cases"], 124)
        self.assertEqual(report["registry_families"], 93)
        self.assertEqual(report["admitted_events"], 0)
        self.assertEqual(report["event_disposition"], "quarantined_not_admitted")
        self.assertFalse(report["event_persistence_authorized"])
        self.assertFalse(report["native_producer_proven"])

    def test_valid_candidates_are_denied_without_projection_or_checkpoint_advance(self):
        for case in gate.fixture_cases():
            with self.subTest(event=case["event"]["event_type"]):
                oracle = gate.ReplayOracle()
                args = (case["event"], case["producer"], case["request"], case["snapshot"])
                self.assertEqual(gate.candidate_failures(*args), [])
                self.assertEqual(gate.event_failures(*args), ["event_not_admitted_dl039"])
                self.assert_quarantined_unchanged(oracle, case)
                self.assert_quarantined_unchanged(oracle, case)
                self.assertEqual(oracle.checkpoint, -1)
                self.assertEqual(oracle.projected_count, 0)
                self.assertEqual(oracle.executed_effects, 0)

    def test_readiness_resolves_real_payload_pointers_without_lifting_pinned_kernel(self):
        owner = gate.response.module("testing_event_readiness_reader", "pm-implementation-readiness.py")
        registry = gate.load("Plans/event_family_registry.json")
        self.assertEqual(len(registry["families"]), 93)
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

    def test_transport_aliases_and_conflicts_are_denied_without_remembering_identity(self):
        for case in gate.fixture_cases():
            with self.subTest(event=case["event"]["event_type"]):
                oracle = gate.ReplayOracle()
                self.assert_quarantined_unchanged(oracle, case)
                duplicate = copy.deepcopy(case)
                duplicate["event"]["event_id"] = "event:duplicate-alias"
                duplicate["event"]["sequence_id"] += 10
                self.assert_quarantined_unchanged(oracle, duplicate)
                conflict = copy.deepcopy(duplicate)
                conflict["snapshot"]["projection_generation"] += 1
                conflict["event"]["payload"]["projection_generation"] += 1
                self.assert_quarantined_unchanged(oracle, conflict)
                self.assertEqual(oracle.checkpoint, -1)
                self.assertEqual(oracle.projected_count, 0)

    def test_candidates_sharing_event_ids_across_types_remain_unadmitted(self):
        first, second = list(gate.fixture_cases())[:2]
        oracle = gate.ReplayOracle()
        self.assert_quarantined_unchanged(oracle, first)
        second["event"]["event_id"] = first["event"]["event_id"]
        self.assert_quarantined_unchanged(oracle, second)
        self.assertEqual(oracle.projected_count, 0)

    def test_cross_project_candidates_remain_unadmitted_with_shared_or_new_ids(self):
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
        self.assertEqual(gate.candidate_failures(other["event"], other["producer"], other["request"], other["snapshot"]), [])
        self.assertEqual(gate.event_failures(other["event"], other["producer"], other["request"], other["snapshot"]), ["event_not_admitted_dl039"])
        oracle = gate.ReplayOracle()
        self.assert_quarantined_unchanged(oracle, case)
        self.assert_quarantined_unchanged(oracle, other)
        other["event"]["event_id"] = "event:other-project"
        self.assert_quarantined_unchanged(oracle, other)

    def test_unadmitted_event_does_not_consume_checkpoint_or_identity(self):
        for case in gate.fixture_cases():
            oracle = gate.ReplayOracle()
            invalid = copy.deepcopy(case)
            invalid["event"]["event_type"] = "testing.session.invented"
            self.assert_quarantined_unchanged(oracle, invalid)
            self.assertEqual(oracle.checkpoint, -1)
            self.assert_quarantined_unchanged(oracle, case)

    def test_restart_does_not_enable_candidate_projection(self):
        journal = list(gate.fixture_cases())
        first, restarted = gate.ReplayOracle(), gate.ReplayOracle()
        for case in journal:
            self.assert_quarantined_unchanged(first, case)
            self.assert_quarantined_unchanged(restarted, case)
        for case in journal:
            self.assert_quarantined_unchanged(restarted, case)
        self.assertEqual(restarted.generations, first.generations)
        self.assertEqual(restarted.checkpoint, first.checkpoint)
        self.assertEqual(restarted.executed_effects, 0)

    def test_denial_preserves_preexisting_replay_state(self):
        oracle = gate.ReplayOracle()
        oracle.event_ids["event:retained"] = "retained-digest"
        oracle.transitions[("project:retained", "event:retained", "key:retained")] = "retained-digest"
        oracle.generations[("project:retained", "session:retained")] = 9
        oracle.checkpoint = 7
        oracle.projected_count = 1
        for case in gate.fixture_cases():
            self.assert_quarantined_unchanged(oracle, case)

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
