"""Static authority/identity/replay checks; no Browser runtime is started."""

import copy
import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch


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


def synthetic_family(row):
    """Complete isolated fixture; never live registration or authority proof."""
    index = next(index for index, candidate in enumerate(CONTEXT[0]["rows"]) if candidate["event_type"] == row["event_type"])
    return {
        **{key: copy.deepcopy(row[key]) for key in ("event_type", "family_id", "family_revision", "payload_schema_ref", "retention_policy_ref")},
        "scope_policy": "project_only",
        "payload_schema_id": row["payload_schema_ref"]["schema_id"],
        "semantic_owner_doc": row["semantic_owner_ref"],
        "payload_owner_doc": "Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe",
        "source_refs": [
            "Plans/browser_event_admission.json#/rows/" + str(index),
            row["semantic_owner_ref"],
            row["payload_schema_ref"]["path"] + row["payload_schema_ref"]["json_pointer"],
        ],
        "legacy": {
            "aliases": [], "admitted_extensions": [],
            "identity_json_pointers": {field: ["/payload/context/" + field] for field in GATE.IDENTITIES},
            "referenced_event_id_pointer": None,
            "redaction": {"mode": "reject_unhandled_secrets", "transform_id": None, "transform_version": None},
        },
    }


def registry_snapshot(registry):
    """Replace only the central registry; keep schemas and owner reads real."""
    original_load = GATE.load_json
    return patch.object(GATE, "load_json", side_effect=lambda path: registry if path == "Plans/event_family_registry.json" else original_load(path))


def all_prepared_snapshot():
    """Synthetic all-prepared case, independent of future live admissions."""
    context = (copy.deepcopy(CONTEXT[0]), *CONTEXT[1:])
    for row in context[0]["rows"]:
        row["admission_status"] = "prepared_not_admitted"
    registry = copy.deepcopy(GATE.load_json("Plans/event_family_registry.json"))
    baseline_ids = set(context[0]["preexisting_family_ids"]) | {"event-family-context-compaction-completed"}
    registry["families"] = [row for row in registry["families"] if row["family_id"] in baseline_ids]
    if len(registry["families"]) != 40 or GATE.fingerprint(registry["families"]) != "4f701c9598003d7c01a405f18f7991b373379eca8b182cf6222540a4746d1756":
        raise AssertionError("Synthetic admission fixture requires the unchanged live upstream40")
    return context, registry


class BrowserPreparedAdmissionTests(unittest.TestCase):
    def assert_quarantined_unchanged(self, oracle, value, context):
        before = copy.deepcopy(vars(oracle))
        self.assertEqual(oracle.consume(value, producer(value), context), "quarantined_without_checkpoint_advance")
        self.assertEqual(vars(oracle), before)

    def test_live_consistency_counts_match_exact_manifest_and_registry(self):
        report = GATE.validate()
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["failures"], [])
        admitted = {row["event_type"] for row in ROWS.values() if row["admission_status"] == "admitted_static_contract"}
        prepared = {row["event_type"] for row in ROWS.values() if row["admission_status"] == "prepared_not_admitted"}
        central = GATE.load_json("Plans/event_family_registry.json")["families"]
        central_browser = [row["event_type"] for row in central if row["event_type"] in ROWS]
        self.assertEqual(set(central_browser), admitted)
        self.assertEqual(len(central_browser), len(admitted))
        self.assertEqual(admitted | prepared, set(ROWS))
        self.assertEqual(report["prepared_scoped_event_families"], len(prepared))
        self.assertEqual(report["admitted_scoped_event_families"], len(admitted))
        self.assertEqual(report["registry_family_count"], 40 + len(admitted))
        self.assertEqual(report["admission_complete"], len(admitted) == 53)

    def test_isolated_prepared_consistency_is_not_admission_completion(self):
        context, registry = all_prepared_snapshot()
        with patch.object(GATE, "contract_context", return_value=context), registry_snapshot(registry):
            report = GATE.validate()
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["prepared_scoped_event_families"], 53)
        self.assertEqual(report["admitted_scoped_event_families"], 0)
        self.assertFalse(report["admission_complete"])

    def test_default_replay_quarantines_all_prepared_candidates_without_state_change(self):
        context, registry = all_prepared_snapshot()
        oracle = GATE.ReplayOracle()
        for ordinal, case in enumerate(FIXTURES["valid"], 1):
            value = GATE.fixture_event(case, ordinal)
            with self.subTest(event=value["event_type"]):
                with registry_snapshot(registry):
                    self.assertEqual(GATE.candidate_failures(value, producer(value), context), [])
                    self.assertEqual(GATE.event_failures(value, producer(value), context), ["event_not_admitted"])
                    self.assert_quarantined_unchanged(oracle, value, context)
        self.assertEqual(oracle.checkpoint, -1)
        self.assertEqual(oracle.projected_count, 0)
        self.assertEqual(oracle.executed_effects, 0)

    def test_admitted_manifest_label_cannot_bypass_absent_central_family(self):
        context, registry = all_prepared_snapshot()
        row = context[0]["rows"][0]
        row["admission_status"] = "admitted_static_contract"
        value = event(row["event_type"])
        self.assertTrue(GATE.event_failures(value, producer(value), context, families={}))
        with registry_snapshot(registry):
            self.assert_quarantined_unchanged(GATE.ReplayOracle(), value, context)

    def test_central_family_cannot_bypass_prepared_manifest_label(self):
        context, _ = all_prepared_snapshot()
        row = context[0]["rows"][0]
        value = event(row["event_type"])
        families = {row["event_type"]: synthetic_family(row)}
        self.assertIn("event_not_admitted", GATE.event_failures(value, producer(value), context, families=families))
        with registry_snapshot({"families": list(families.values())}):
            self.assert_quarantined_unchanged(GATE.ReplayOracle(), value, context)

    def test_isolated_mixed_subset_projects_only_exact_admitted_family(self):
        context, _ = all_prepared_snapshot()
        admitted, pending = context[0]["rows"][:2]
        admitted["admission_status"] = "admitted_static_contract"
        family = synthetic_family(admitted)
        value, sibling = event(admitted["event_type"]), event(pending["event_type"], 2)
        self.assertEqual(GATE.event_failures(value, producer(value), context, families={admitted["event_type"]: family}), [])
        with registry_snapshot({"families": [family]}):
            oracle = GATE.ReplayOracle()
            self.assertEqual(oracle.consume(value, producer(value), context), "projected_no_effect")
            self.assert_quarantined_unchanged(oracle, sibling, context)
            self.assertEqual(oracle.projected_count, 1)
            self.assertEqual(oracle.checkpoint, 1)
            self.assertEqual(oracle.executed_effects, 0)

    def test_mutated_central_binding_cannot_project_admitted_label(self):
        context = (copy.deepcopy(CONTEXT[0]), *CONTEXT[1:])
        row = context[0]["rows"][0]
        row["admission_status"] = "admitted_static_contract"
        value = event(row["event_type"])
        for field, replacement in (("family_id", "event-family-browser-wrong"),
                                   ("family_revision", "99.0.0"),
                                   ("payload_schema_id", "wrong"),
                                   ("scope_policy", "application_only"),
                                   ("retention_policy_ref", {}),
                                   ("payload_schema_ref", {}),
                                   ("semantic_owner_doc", "Plans/Contracts_V0.md#CV-001"),
                                   ("payload_owner_doc", row["semantic_owner_ref"]),
                                   ("source_refs", ["Plans/browser_event_admission.json#/rows/1", row["semantic_owner_ref"], row["payload_schema_ref"]["path"] + row["payload_schema_ref"]["json_pointer"]]),
                                   ("legacy", {})):
            with self.subTest(field=field):
                family = synthetic_family(row)
                family[field] = replacement
                self.assertTrue(GATE.event_failures(value, producer(value), context, families={row["event_type"]: family}))
                with registry_snapshot({"families": [family]}):
                    self.assert_quarantined_unchanged(GATE.ReplayOracle(), value, context)

    def test_unadmitted_legacy_transforms_and_missing_fields_cannot_project(self):
        context = (copy.deepcopy(CONTEXT[0]), *CONTEXT[1:])
        row = context[0]["rows"][0]
        row["admission_status"] = "admitted_static_contract"
        value = event(row["event_type"])
        for target in ("transform_id", "transform_version", "referenced_event_id_pointer", "missing_source_refs"):
            with self.subTest(target=target):
                family = synthetic_family(row)
                if target == "missing_source_refs":
                    del family["source_refs"]
                elif target == "referenced_event_id_pointer":
                    family["legacy"][target] = "/payload/event_id"
                else:
                    family["legacy"]["redaction"][target] = "unadmitted-transform"
                self.assertTrue(GATE.event_failures(value, producer(value), context, families={row["event_type"]: family}))
                with registry_snapshot({"families": [family]}):
                    self.assert_quarantined_unchanged(GATE.ReplayOracle(), value, context)

    def test_validate_cannot_hide_manifest_registry_mismatch_in_payloads_only_mode(self):
        for mutation in ("prepared_registered", "admitted_absent", "duplicate_central_family"):
            for payloads_only in (False, True):
                with self.subTest(mutation=mutation, payloads_only=payloads_only):
                    context, registry = all_prepared_snapshot()
                    row = context[0]["rows"][0]
                    if mutation == "prepared_registered":
                        registry["families"].append(synthetic_family(row))
                    elif mutation == "admitted_absent":
                        row["admission_status"] = "admitted_static_contract"
                    else:
                        registry["families"].append(copy.deepcopy(registry["families"][0]))
                    with patch.object(GATE, "contract_context", return_value=context), registry_snapshot(registry):
                        report = GATE.validate(payloads_only=payloads_only)
                    self.assertEqual(report["status"], "fail")
                    expected_error = "duplicate_central_event_family" if mutation == "duplicate_central_family" else "exact_admitted_subset_mismatch"
                    self.assertIn(expected_error, {failure["error"] for failure in report["failures"]})
                    self.assertFalse(report["admission_complete"])

    def test_validator_accepts_isolated_one_admitted_fifty_two_prepared_subset(self):
        context, registry = all_prepared_snapshot()
        row = context[0]["rows"][0]
        row["admission_status"] = "admitted_static_contract"
        registry["families"].append(synthetic_family(row))
        with patch.object(GATE, "contract_context", return_value=context), registry_snapshot(registry):
            report = GATE.validate()
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["admitted_scoped_event_families"], 1)
        self.assertEqual(report["prepared_scoped_event_families"], 52)
        self.assertEqual(report["registry_family_count"], 41)
        self.assertFalse(report["admission_complete"])


class BrowserEventAdmissionTests(unittest.TestCase):
    def setUp(self):
        # Retain all payload/replay semantics with zero synthetic admission,
        # regardless of how many live families gain independent admission later.
        context, registry = all_prepared_snapshot()
        self.context_patch = patch(__name__ + ".CONTEXT", context)
        self.context_patch.start()
        self.addCleanup(self.context_patch.stop)
        self.registry_patch = registry_snapshot(registry)
        self.registry_patch.start()
        self.addCleanup(self.registry_patch.stop)
        self.contract_patch = patch.object(GATE, "contract_context", return_value=context)
        self.contract_patch.start()
        self.addCleanup(self.contract_patch.stop)

    def test_exact_census_and_all_rejection_fixtures(self):
        report = GATE.validate(payloads_only=True)
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["required_event_families"], 53)
        self.assertEqual(report["positive_cases"], 53)
        self.assertGreaterEqual(report["negative_cases"], 558)
        self.assertFalse(report["runtime_producer_proven"])
        self.assertFalse(report["governance_sealed"])
        self.assertEqual(report["global_event_denominator"], "UNKNOWN_OPEN")

    def test_every_candidate_projects_once_without_reexecuting(self):
        oracle = GATE.CandidateReplayOracle()
        for ordinal, case in enumerate(FIXTURES["valid"], 1):
            value = GATE.fixture_event(case, ordinal)
            with self.subTest(event=case["event_type"]):
                self.assertEqual(oracle.consume(value, producer(value), CONTEXT), "projected_no_effect")
                self.assertEqual(oracle.consume(value, producer(value), CONTEXT), "duplicate_no_effect")
        self.assertEqual(oracle.projected_count, 53)
        self.assertEqual(oracle.executed_effects, 0)

    def test_invalid_input_cannot_advance_checkpoint(self):
        oracle = GATE.CandidateReplayOracle()
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
        oracle = GATE.CandidateReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        changed = copy.deepcopy(value)
        changed["payload"]["transition_receipt_ref"] = "receipt:different-transition"
        self.assertEqual(oracle.consume(changed, producer(changed), CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.projected_count, 1)

    def test_idempotency_collision_is_not_new_effect(self):
        oracle = GATE.CandidateReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        duplicate = event("browser.workspace.created", 2)
        duplicate["idempotency_key"] = value["idempotency_key"]
        self.assertEqual(oracle.consume(duplicate, producer(duplicate), CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.executed_effects, 0)

    def test_out_of_order_live_append_cannot_lower_cursor(self):
        oracle = GATE.CandidateReplayOracle()
        newer = event("browser.page.created", 2)
        oracle.consume(newer, producer(newer), CONTEXT)
        older = event("browser.workspace.created", 1)
        self.assertEqual(oracle.consume(older, producer(older), CONTEXT), "quarantined_without_checkpoint_advance")
        self.assertEqual(oracle.checkpoint, 2)

    def test_same_scoped_key_and_semantic_digest_returns_original(self):
        oracle = GATE.CandidateReplayOracle()
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
        oracle = GATE.CandidateReplayOracle()
        created = event("browser.workspace.created")
        closed = event("browser.workspace.closed", 2)
        closed["idempotency_key"] = created["idempotency_key"]
        oracle.consume(created, producer(created), CONTEXT)
        self.assertEqual(oracle.consume(closed, producer(closed), CONTEXT), "projected_no_effect")

    def test_global_event_id_cannot_be_reused_in_another_project(self):
        oracle = GATE.CandidateReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        other = copy.deepcopy(value)
        other["project_id"] = "project-other"
        other["payload"]["context"]["project_id"] = "project-other"
        self.assertEqual(oracle.consume(other, producer(other), CONTEXT), "quarantined_without_checkpoint_advance")

    def test_reconnect_observation_timestamp_does_not_duplicate(self):
        oracle = GATE.CandidateReplayOracle()
        value = event("browser.workspace.created")
        oracle.consume(value, producer(value), CONTEXT)
        observed_again = copy.deepcopy(value)
        observed_again["observed_at_utc"] = "2026-09-10T01:00:00Z"
        self.assertEqual(oracle.consume(observed_again, producer(value), CONTEXT), "duplicate_no_effect")

    def test_historical_projection_never_restores_old_page_generation(self):
        oracle = GATE.CandidateReplayOracle()
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
        self.assertEqual(GATE.candidate_failures(value, producer(value), CONTEXT), [])

    def test_runtime_retention_has_actual_run_anchor(self):
        for row in ROWS.values():
            if row["retention_policy_ref"]["policy_id"] == "RP-RUNTIME-365D":
                with self.subTest(event=row["event_type"]):
                    self.assertTrue({"run_id", "attempt_id"} <= set(row["required_context_fields"]))

    def test_closed_payload_and_byte_budget_block_unbounded_material(self):
        value = event("browser.program.completed")
        value["payload"]["artifact_refs"] = ["artifact:" + str(index) + "x" * 450 for index in range(64)]
        value["payload"]["facts"]["completed_action_ids"] = ["action-" + str(index) + "x" * 170 for index in range(256)]
        self.assertIn("payload_byte_limit", GATE.candidate_failures(value, producer(value), CONTEXT))


class BrowserCandidateSuccessorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location("browser_candidate_inspection", ROOT / "scripts/pm-assistant-contract-check.py")
        cls.checker = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.checker)

    def test_exact_candidate_roster_has_distinct_conditionally_admitted_successors(self):
        candidates = GATE.load_json("Plans/browser_event_admission_candidates.json")["rows"]
        registry = {r["event_type"]: r for r in GATE.load_json("Plans/event_family_registry.json")["families"]}
        self.assertEqual({r["event_type"] for r in candidates}, set(ROWS))
        for candidate in candidates:
            with self.subTest(event=candidate["event_type"]):
                row = ROWS[candidate["event_type"]]
                self.assertNotEqual(candidate["payload_schema_id"], row["payload_schema_ref"]["schema_id"])
                family = registry.get(candidate["event_type"])
                if row["admission_status"] == "admitted_static_contract":
                    self.assertIsNotNone(family)
                    self.assertIsNone(self.checker.payload_binding_error(candidate, family, row))
                else:
                    self.assertEqual(row["admission_status"], "prepared_not_admitted")
                    self.assertIsNone(family)
                    synthetic_family = {"payload_schema_id": row["payload_schema_ref"]["schema_id"]}
                    self.assertIsNotNone(self.checker.payload_binding_error(candidate, synthetic_family, row))

    def test_registered_id_difference_requires_exact_admitted_successor(self):
        candidate = {"event_type": "browser.workspace.created", "payload_schema_id": "candidate"}
        family = {"payload_schema_id": "admitted"}
        self.assertIsNotNone(self.checker.payload_binding_error(candidate, family))
        successor = {"event_type": candidate["event_type"], "admission_status": "admitted_static_contract", "payload_schema_ref": {"schema_id": "admitted"}}
        self.assertIsNone(self.checker.payload_binding_error(candidate, family, successor))
        for successor in ({"event_type": "browser.other", "admission_status": "admitted_static_contract"},
                          {"event_type": candidate["event_type"], "admission_status": "proposed"},
                          {"event_type": candidate["event_type"], "admission_status": "admitted_static_contract", "payload_schema_ref": {"schema_id": "different"}}):
            self.assertIsNotNone(self.checker.payload_binding_error(candidate, family, successor))

    def test_candidate_payload_is_not_accepted_as_admitted_schema(self):
        value = event("browser.workspace.created")
        value["payload"]["schema_id"] = "pm.browser_event.workspace_created.v1"
        self.assertIn("payload_schema", GATE.candidate_failures(value, producer(value), CONTEXT))


if __name__ == "__main__":
    unittest.main()
