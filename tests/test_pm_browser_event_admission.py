"""Static authority/identity/replay checks; no Browser runtime is started."""

import copy
import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("browser_admission", ROOT / "scripts/pm-browser-event-admission.py")
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)
CONTEXT = GATE.contract_context()
FIXTURES = GATE.load_json("Plans/browser_event_admission_fixtures.json")
CASES = {case["event_type"]: case for case in FIXTURES["valid"]}
ROWS = {row["event_type"]: row for row in CONTEXT[0]["rows"]}


def event(event_type, sequence=1):
    return GATE.fixture_event(CASES[event_type], sequence)


def producer(value):
    return ROWS[value["event_type"]]["producer_component"]


class BrowserEventAdmissionTests(unittest.TestCase):
    def test_exact_census_and_all_rejection_fixtures(self):
        report = GATE.validate(payloads_only=True)
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["required_event_families"], 53)
        self.assertEqual(report["positive_cases"], 53)
        self.assertGreaterEqual(report["negative_cases"], 558)
        self.assertFalse(report["runtime_producer_proven"])
        self.assertFalse(report["governance_sealed"])
        self.assertEqual(report["global_event_denominator"], "UNKNOWN_OPEN")

    def test_every_family_projects_once_without_reexecuting(self):
        oracle = GATE.ReplayOracle()
        for ordinal, case in enumerate(FIXTURES["valid"], 1):
            value = GATE.fixture_event(case, ordinal)
            with self.subTest(event=case["event_type"]):
                self.assertEqual(oracle.consume(value, producer(value), CONTEXT), "projected_no_effect")
                self.assertEqual(oracle.consume(value, producer(value), CONTEXT), "duplicate_no_effect")
        self.assertEqual(oracle.projected_count, 53)
        self.assertEqual(oracle.executed_effects, 0)

    def test_invalid_input_cannot_advance_checkpoint(self):
        oracle = GATE.ReplayOracle()
        good = event("browser.workspace.created")
        oracle.consume(good, producer(good), CONTEXT)
        bad = event("browser.page.created", 2)
        bad["payload"]["context"]["project_id"] = "project-other"
        self.assertEqual(oracle.consume(bad, producer(bad), CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.checkpoint, 1)

    def test_unknown_event_never_advances_checkpoint(self):
        oracle = GATE.ReplayOracle()
        value = event("browser.workspace.created")
        value["event_type"] = "browser.unregistered_family"
        self.assertEqual(oracle.consume(value, "BrowserRuntimeService.workspace", CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.checkpoint, -1)

    def test_event_id_collision_is_not_replay(self):
        oracle = GATE.ReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        changed = copy.deepcopy(value)
        changed["payload"]["transition_receipt_ref"] = "receipt:different-transition"
        self.assertEqual(oracle.consume(changed, producer(changed), CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.projected_count, 1)

    def test_idempotency_collision_is_not_new_effect(self):
        oracle = GATE.ReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        duplicate = event("browser.workspace.created", 2)
        duplicate["idempotency_key"] = value["idempotency_key"]
        self.assertEqual(oracle.consume(duplicate, producer(duplicate), CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.executed_effects, 0)

    def test_out_of_order_live_append_cannot_lower_cursor(self):
        oracle = GATE.ReplayOracle()
        newer = event("browser.page.created", 2)
        oracle.consume(newer, producer(newer), CONTEXT)
        older = event("browser.workspace.created", 1)
        self.assertEqual(oracle.consume(older, producer(older), CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.checkpoint, 2)

    def test_same_scoped_key_and_semantic_digest_returns_original(self):
        oracle = GATE.ReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        same = copy.deepcopy(value)
        same["event_id"] = "event-browser-retry"
        same["sequence_id"] = 2
        same["persisted_at_utc"] = "2026-09-10T01:00:00Z"
        self.assertEqual(oracle.consume(same, producer(same), CONTEXT), "duplicate_no_effect")
        self.assertEqual(oracle.projected_count, 1)
        self.assertEqual(oracle.checkpoint, 1)

    def test_idempotency_identity_includes_the_event_type(self):
        oracle = GATE.ReplayOracle()
        created = event("browser.workspace.created")
        closed = event("browser.workspace.closed", 2)
        closed["idempotency_key"] = created["idempotency_key"]
        oracle.consume(created, producer(created), CONTEXT)
        self.assertEqual(oracle.consume(closed, producer(closed), CONTEXT), "projected_no_effect")

    def test_global_event_id_cannot_be_reused_in_another_project(self):
        oracle = GATE.ReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        other = copy.deepcopy(value)
        other["project_id"] = "project-other"
        other["payload"]["context"]["project_id"] = "project-other"
        self.assertEqual(oracle.consume(other, producer(other), CONTEXT), "quarantined_without_checkpoint_advance")

    def test_reconnect_observation_timestamp_does_not_duplicate(self):
        oracle = GATE.ReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        observed_again = copy.deepcopy(value)
        observed_again["observed_at_utc"] = "2026-09-10T01:00:00Z"
        self.assertEqual(oracle.consume(observed_again, producer(value), CONTEXT), "duplicate_no_effect")

    def test_historical_projection_never_restores_old_page_generation(self):
        oracle = GATE.ReplayOracle()
        newer = event("browser.navigation.generation_changed")
        newer["payload"]["context"]["page_generation"] = 9
        oracle.consume(newer, producer(newer), CONTEXT)
        older_fact = event("browser.page.activated", 2)
        oracle.consume(older_fact, producer(older_fact), CONTEXT)
        self.assertEqual(next(iter(oracle.page_generations.values())), 9)
        self.assertEqual(oracle.executed_effects, 0)

    def test_manual_route_before_cef_needs_no_fabricated_run_or_page(self):
        value = event("browser.route.fetch_selected")
        subject = value["payload"]["context"]
        for field in ("run_id", "attempt_id", "browser_page_id", "browser_workspace_id", "browser_session_id"):
            self.assertIsNone(subject[field])
        self.assertEqual(GATE.event_failures(value, producer(value), CONTEXT), [])

    def test_runtime_retention_has_actual_run_anchor(self):
        for row in ROWS.values():
            if row["retention_policy_ref"]["policy_id"] == "RP-RUNTIME-365D":
                with self.subTest(event=row["event_type"]):
                    self.assertTrue({"run_id", "attempt_id"} <= set(row["required_context_fields"]))

    def test_closed_payload_and_byte_budget_block_unbounded_material(self):
        value = event("browser.program.completed")
        value["payload"]["artifact_refs"] = ["artifact:" + str(index) + "x" * 450 for index in range(64)]
        value["payload"]["facts"]["completed_action_ids"] = ["action-" + str(index) + "x" * 170 for index in range(256)]
        self.assertIn("payload_byte_limit", GATE.event_failures(value, producer(value), CONTEXT))


class BrowserCandidateSuccessorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location("browser_candidate_inspection", ROOT / "scripts/pm-assistant-contract-check.py")
        cls.checker = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.checker)

    def test_exact_candidate_roster_has_distinct_valid_successors(self):
        candidates = GATE.load_json("Plans/browser_event_admission_candidates.json")["rows"]
        registry = {r["event_type"]: r for r in GATE.load_json("Plans/event_family_registry.json")["families"]}
        self.assertEqual({r["event_type"] for r in candidates}, set(ROWS))
        for candidate in candidates:
            with self.subTest(event=candidate["event_type"]):
                row = ROWS[candidate["event_type"]]
                self.assertNotEqual(candidate["payload_schema_id"], row["payload_schema_ref"]["schema_id"])
                self.assertIsNone(self.checker.payload_binding_error(candidate, registry[candidate["event_type"]], row))

    def test_registered_id_difference_requires_exact_admitted_successor(self):
        candidate = {"event_type": "browser.workspace.created", "payload_schema_id": "candidate"}
        family = {"payload_schema_id": "admitted"}
        self.assertIsNotNone(self.checker.payload_binding_error(candidate, family))
        for successor in ({"event_type": "browser.other", "admission_status": "admitted_static_contract"},
                          {"event_type": candidate["event_type"], "admission_status": "proposed"},
                          {"event_type": candidate["event_type"], "admission_status": "admitted_static_contract", "payload_schema_ref": {"schema_id": "different"}}):
            self.assertIsNotNone(self.checker.payload_binding_error(candidate, family, successor))

    def test_candidate_payload_is_not_accepted_as_admitted_schema(self):
        value = event("browser.workspace.created")
        value["payload"]["schema_id"] = "pm.browser_event.workspace_created.v1"
        self.assertTrue(GATE.event_failures(value, producer(value), CONTEXT))


if __name__ == "__main__":
    unittest.main()
