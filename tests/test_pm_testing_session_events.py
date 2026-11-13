"""Static Testing candidates and DL-039 non-admission; no persistence proof."""

import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
spec = importlib.util.spec_from_file_location("testing_session_events", ROOT / "scripts/pm-testing-session-event-admission.py")
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class TestingSessionEventTests(unittest.TestCase):
    def assert_registry_matches_upstream_plus_admitted_browser(self):
        # Generalized 2026-09-25 (Step 9 batch 2 preparation): a row the coordination ledger marks
        # admitted_static_contract is accepted too, only as its exact prepared registry row, and
        # nothing else. The returned count includes it, so an admission landing moves only the pins.
        manifest = gate.load("Plans/browser_event_admission.json")
        coordination = gate.load("Plans/coordination_event_admission.json")
        families = gate.load("Plans/event_family_registry.json")["families"]
        upstream_ids = set(manifest["preexisting_family_ids"]) | {"event-family-context-compaction-completed"}
        self.assertEqual(len(upstream_ids), 40)
        upstream = [row for row in families if row["family_id"] in upstream_ids]
        self.assertEqual(len(upstream), 40)
        self.assertEqual({row["family_id"] for row in upstream}, upstream_ids)
        encoded = json.dumps(sorted(upstream, key=lambda row: row["family_id"]), sort_keys=True, separators=(",", ":")).encode()
        # Re-frozen 2026-11-05 (was b59cc61d..., last true at d86090abd9) after three landed registry
        # changes: c0d688db9f (DL-188/D42 workspace.layout_changed 2.0.0; terminal.workgroup_moved
        # source_refs), 634412b3ac (terminal.workgroup_moved source_refs) and 102a7e99e8 (CV-366 exact
        # application selectors on eleven goal rows). No Testing Session row is among the 40.
        # Re-frozen 2026-09-23 (was a3246c0e..., last true at 4fe66204bd) after six landed, recorded
        # goal v3 adoptions: 3890d86c70, 5fc9747b6f, 1136661ddc, e686963ad5, a3c511657f, f6350caf27.
        self.assertEqual(hashlib.sha256(encoded).hexdigest(), "d78354d22eef69af1ccfe7762ab49b347049f2fd764d7f07fcc29349f21aecac")
        admitted_ids = {row["family_id"] for row in manifest["rows"] if row["admission_status"] == "admitted_static_contract"}
        coordination_rows = {row["family_id"]: row["registry_row"] for row in coordination["rows"]
                             if row["admission_status"] == "admitted_static_contract"}
        live = {row["family_id"]: row for row in families}
        for family_id, prepared in coordination_rows.items():
            self.assertEqual(json.dumps(live.get(family_id), sort_keys=True, separators=(",", ":"), ensure_ascii=False),
                             json.dumps(prepared, sort_keys=True, separators=(",", ":"), ensure_ascii=False))
        admitted_ids |= set(coordination_rows)
        proposed_ids = {"event-family-settings-layer-changed", "event-family-approval-chat-tool-requested",
                        "event-family-approval-chat-tool-resolved"}
        for ident in proposed_ids:
            self.assertTrue(all(v["producer_admission"] == "requires_owner_adoption" for v in live[ident]["payload_versions"]))
        self.assertEqual({row["family_id"] for row in families}, upstream_ids | admitted_ids | proposed_ids)
        self.assertEqual(len(families), 40 + len(admitted_ids) + len(proposed_ids))
        # Registry census includes the three families DL-300 registered; their app producers still
        # require owner adoption. Same rule as the GitHub helper.
        return len(admitted_ids) + len(proposed_ids)

    def test_registry_helper_refuses_each_one_defect(self):
        registry = gate.load("Plans/event_family_registry.json")
        self.assert_registry_matches_upstream_plus_admitted_browser()

        def changed_upstream(value):
            row = next(row for row in value["families"] if row["family_id"] == "event-family-workspace-layout-changed")
            row["family_revision"] = "9.9.9"

        def unknown_family(value):
            value["families"].append(dict(copy.deepcopy(value["families"][0]), family_id="event-family-unknown"))

        def missing_proposed(value):
            value["families"] = [row for row in value["families"] if row["family_id"] != "event-family-settings-layer-changed"]

        def adopted_proposed(value):
            row = next(row for row in value["families"] if row["family_id"] == "event-family-settings-layer-changed")
            row["payload_versions"][0]["producer_admission"] = "existing_project_policy"

        real_load = gate.load
        for name, change in (("changed_upstream", changed_upstream), ("unknown_family", unknown_family),
                             ("missing_proposed", missing_proposed), ("adopted_proposed", adopted_proposed)):
            with self.subTest(defect=name):
                value = copy.deepcopy(registry)
                change(value)

                def load(path, value=value):
                    return copy.deepcopy(value) if path == "Plans/event_family_registry.json" else real_load(path)

                with patch.object(gate, "load", side_effect=load):
                    with self.assertRaises((AssertionError, KeyError)):
                        self.assert_registry_matches_upstream_plus_admitted_browser()

    def assert_quarantined_unchanged(self, oracle, case):
        before = copy.deepcopy(vars(oracle))
        self.assertEqual(oracle.consume(case), "quarantined_without_checkpoint_advance")
        self.assertEqual(vars(oracle), before)

    def test_static_candidates_and_all_authored_negatives_without_admission(self):
        report = gate.validate()
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["positive_cases"], 4)
        self.assertEqual(report["negative_cases"], 124)
        self.assertEqual(report["registry_families"], 40 + self.assert_registry_matches_upstream_plus_admitted_browser())
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
        admitted_count = self.assert_registry_matches_upstream_plus_admitted_browser()
        self.assertEqual(len(registry["families"]), 40 + admitted_count)
        for family in registry["families"]:
            with self.subTest(event=family["event_type"]):
                payload, schema_id = owner.event_family_payload_schema(family)
                self.assertIsInstance(payload, dict)
                self.assertEqual(schema_id, family["payload_schema_id"])
        failures = owner.event_family_registry_data_failures(
            registry, gate.load("Plans/event_family_registry.schema.json"),
            path_label="test:session-events", include_residuals=False)
        # The approved checkpoint is 46 (the 40 upstream rows, the two admitted Browser rows, the
        # admitted coordination.agent_registered row and the three DL-300 families), moved from 43 by
        # Jared's 2026-11-04 approval (DL-300) and before that from his 2026-09-23 Step 8 checkpoint
        # (42) under DL-078; any other registry change still needs Jared's own approval.
        self.assertEqual({failure["error"] for failure in failures},
                         {"event_family_registry_kernel_row_count_mismatch"} if 40 + admitted_count != 46 else set())
        self.assertEqual(owner.EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT, 46)

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

    def test_readiness_pins_goal_run_v3_refs_and_rejects_a_retired_v2_ref(self):
        # The landed v3 adoptions (e686963ad5, a3c511657f, f6350caf27) point these rows at whole v3
        # schemas; readiness pins exactly those paths and still rejects a row sent back to v2.
        owner = gate.response.module("testing_event_readiness_goal_refs", "pm-implementation-readiness.py")
        registry = gate.load("Plans/event_family_registry.json")
        schema = gate.load("Plans/event_family_registry.schema.json")
        rows = {row["event_type"]: row for row in registry["families"]}
        for event_type in ("goal_run.started", "goal_run.cancelled", "goal_run.certified"):
            with self.subTest(event=event_type):
                self.assertEqual(rows[event_type]["payload_schema_ref"]["path"],
                                 owner.EVENT_FAMILY_GOAL_PAYLOAD_SCHEMA_REFS[event_type])
                self.assertEqual(rows[event_type]["payload_schema_ref"]["schema_id"], rows[event_type]["payload_schema_id"])
                self.assertTrue(rows[event_type]["payload_schema_id"].endswith(".schema.v3"))
        drifted = copy.deepcopy(registry)
        next(row for row in drifted["families"] if row["event_type"] == "goal_run.started")["payload_schema_ref"]["path"] = (
            "Plans/event_payloads/goal_runtime/goal_run_started.schema.json")
        errors = {failure["error"] for failure in owner.event_family_registry_data_failures(
            drifted, schema, path_label="test:goal-run-v2-drift", include_residuals=False)}
        self.assertIn("event_family_registry_goal_payload_ref_mismatch", errors)
        self.assertIn("event_family_registry_goal_kernel_membership_mismatch", errors)


if __name__ == "__main__":
    unittest.main()
