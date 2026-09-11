"""Synthetic owner-contract models only; no native Browser or Storage proof."""

import copy
import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("workspace_created", ROOT / "scripts/pm_browser_workspace_created.py")
MODEL = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODEL)
GATE, CONTEXT = MODEL.candidate_gate(ROOT)
FIXTURES = MODEL.load(MODEL.FIXTURE_PATH)
EVENT_CASE = next(case for case in GATE.load_json("Plans/browser_event_admission_fixtures.json")["valid"]
                  if case["case_id"] == FIXTURES["creation_fixture"]["event_case_id"])


def creation():
    value = copy.deepcopy(FIXTURES["creation_fixture"])
    value.pop("event_case_id")
    value["event"] = GATE.fixture_event(EVENT_CASE, 1)
    return value


def oracle():
    return MODEL.CreationOracle(GATE.envelope_oracle().event_producer_semantic_digest)


def checkpoint():
    return copy.deepcopy(FIXTURES["checkpoint_fixture"])


def observation(candidate=None, prior=None):
    value = copy.deepcopy(FIXTURES["observation_fixture"])
    if candidate is not None:
        value["resolved_checkpoint_fields"] = {field: copy.deepcopy(candidate[field])
                                               for field in value["resolved_checkpoint_fields"]}
    value["prior_checkpoint_sha256"] = MODEL.digest(prior) if prior is not None else None
    return value


def disclose(model, **changes):
    inputs = dict(current_token=True, access_allowed=True, deletion_allows_audit=True)
    inputs.update(changes)
    return model.disclose(MODEL.digest(model.checkpoint), **inputs)


class WorkspaceCreationTests(unittest.TestCase):
    def test_fixture_claims_only_synthetic_contract_checks(self):
        self.assertIn("synthetic", FIXTURES["claim_boundary"])
        self.assertIn("No authenticated native producer", FIXTURES["claim_boundary"])

    def test_complete_resolved_creation_fixture(self):
        self.assertEqual(MODEL.creation_preflight_failures(**creation()), [])

    def test_creation_negative_fixtures(self):
        for case in FIXTURES["creation_invalid"]:
            with self.subTest(case=case["case_id"]):
                value = creation()
                GATE.set_pointer(value[case["target"]], case["pointer"], case["value"])
                self.assertIn(case["expected_error"], MODEL.creation_preflight_failures(**value))
                model = oracle()
                before = copy.deepcopy(vars(model))
                self.assertEqual(model.create(**value, append_outcome="committed", admitted=True), "rejected_no_append")
                self.assertEqual(vars(model), before)

    def test_component_label_without_admission_has_no_authority(self):
        model = oracle()
        self.assertEqual(model.create(**creation(), append_outcome="committed", admitted=False), "rejected_no_append")
        self.assertEqual((model.append_count, model.published_count, model.workspace_ids), (0, 0, set()))

    def test_envelope_identity_and_closed_payload_are_validated(self):
        for pointer, replacement, error in (("/project_id", "other-project", "envelope_scope"),
                                             ("/payload/facts/unowned", True, "payload_schema"),
                                             ("/sequence_id", -1, "envelope_schema")):
            with self.subTest(pointer=pointer):
                value = creation()
                GATE.set_pointer(value["event"], pointer, replacement)
                self.assertIn(error, MODEL.creation_preflight_failures(**value))

    def test_run_bound_creation_requires_exact_request_result_join(self):
        value = creation()
        for field, identity in (("run_id", "run-fixture"), ("attempt_id", "attempt-fixture")):
            value["event"][field] = identity
            value["event"]["payload"]["context"][field] = identity
            for kind in ("request", "result"):
                value[kind]["scope"]["lineage"][field] = identity
        self.assertEqual(MODEL.creation_preflight_failures(**value), [])
        value["result"]["scope"]["lineage"]["attempt_id"] = "other-attempt"
        self.assertIn("creation_lineage_mismatch", MODEL.creation_preflight_failures(**value))

    def test_generation_zero_and_nonzero_are_new_identity_not_reset(self):
        for generation in (0, 4, 100):
            value = creation()
            value["event"]["payload"]["facts"]["workspace_generation"] = generation
            value["witness"]["workspace_generation"] = generation
            self.assertEqual(MODEL.creation_preflight_failures(**value), [])

    def test_committed_retry_reuses_original_result_without_second_resource(self):
        model, value = oracle(), creation()
        self.assertEqual(model.create(**value, append_outcome="committed", admitted=True), "creation_committed_and_published")
        before = copy.deepcopy(vars(model))
        for field in ("unused_workspace_identity", "resource_isolated", "resource_unexposed"):
            value["witness"][field] = False
        self.assertEqual(model.create(**value, append_outcome="committed", admitted=True), "original_result_no_effect")
        self.assertEqual(vars(model), before)
        self.assertEqual((model.append_count, model.published_count, len(model.workspace_ids)), (1, 1, 1))

    def test_committed_lost_ack_retry_cannot_append_or_allocate_again(self):
        model, value = oracle(), creation()
        self.assertEqual(model.create(**value, append_outcome="committed_ack_lost", admitted=True), "committed_original_ack_lost")
        self.assertEqual(model.create(**value, append_outcome="committed", admitted=True), "original_result_no_effect")
        self.assertEqual((model.append_count, model.published_count, len(model.workspace_ids)), (1, 0, 1))

    def test_unknown_append_fences_original_without_second_effect(self):
        model, value = oracle(), creation()
        self.assertEqual(model.create(**value, append_outcome="unknown", admitted=True), "unexposed_resource_fenced_unknown_append")
        before = copy.deepcopy(vars(model))
        self.assertEqual(model.create(**value, append_outcome="committed", admitted=True), "uncertain_original_requires_resolution")
        self.assertEqual(vars(model), before)
        self.assertEqual((model.append_count, model.published_count, len(model.pending)), (0, 0, 1))

    def test_failed_append_disposes_unexposed_resource(self):
        model = oracle()
        before = copy.deepcopy(vars(model))
        self.assertEqual(model.create(**creation(), append_outcome="failed", admitted=True), "unexposed_resource_disposed_no_append")
        self.assertEqual(vars(model), before)

    def test_same_event_id_changed_semantics_is_conflict(self):
        model, value = oracle(), creation()
        model.create(**value, append_outcome="committed", admitted=True)
        value["event"]["payload"]["facts"]["workspace_generation"] += 1
        value["witness"]["workspace_generation"] += 1
        self.assertEqual(model.create(**value, append_outcome="committed", admitted=True), "idempotency_conflict")
        self.assertEqual(model.append_count, 1)

    def test_new_key_cannot_create_already_committed_workspace(self):
        model, value = oracle(), creation()
        model.create(**value, append_outcome="committed", admitted=True)
        value["event"]["event_id"] = "event-browser-new"
        for kind in ("event", "request", "witness"):
            value[kind]["idempotency_key"] = "other-key"
        self.assertEqual(model.create(**value, append_outcome="committed", admitted=True), "workspace_identity_already_committed")
        self.assertEqual(model.append_count, 1)

    def test_same_event_id_cannot_alias_other_project(self):
        model, value = oracle(), creation()
        model.create(**value, append_outcome="committed", admitted=True)
        value["event"]["project_id"] = "other-project"
        value["event"]["payload"]["context"]["project_id"] = "other-project"
        for kind in ("request", "result"):
            value[kind]["scope"]["lineage"]["project_id"] = "other-project"
        self.assertEqual(MODEL.creation_preflight_failures(**value), [])
        self.assertEqual(model.create(**value, append_outcome="committed", admitted=True), "idempotency_conflict")
        self.assertEqual(model.append_count, 1)


class WorkspaceCheckpointTests(unittest.TestCase):
    def test_complete_checkpoint_and_historical_disclosure(self):
        model, candidate = MODEL.CheckpointOracle(), checkpoint()
        self.assertEqual(MODEL.checkpoint_failures(candidate), [])
        self.assertEqual(model.advance(candidate, observation()), "checkpoint_committed_no_runtime_effect")
        self.assertEqual(disclose(model), "historical_fact_no_runtime_authority")
        self.assertEqual((model.commit_count, model.disclosure_count, model.runtime_effect_count), (1, 1, 0))

    def test_checkpoint_negative_fixtures_never_advance(self):
        for case in FIXTURES["checkpoint_invalid"]:
            with self.subTest(case=case["case_id"]):
                candidate, model = checkpoint(), MODEL.CheckpointOracle()
                GATE.set_pointer(candidate, case["pointer"], case["value"])
                self.assertIn(case["expected_error"], MODEL.checkpoint_failures(candidate))
                before = copy.deepcopy(vars(model))
                self.assertEqual(model.advance(candidate, observation(candidate)), "checkpoint_rejected_without_advance")
                self.assertEqual(vars(model), before)

    def test_each_source_and_before_commit_fence_is_required(self):
        for field in ("index_published", "range_complete", "source_verified", "dedupe_verified", "access_allowed",
                      "deletion_allows_audit", "binding_supported", "before_commit_fence_current"):
            for missing in (False, None):
                with self.subTest(field=field, value=missing):
                    model, observed = MODEL.CheckpointOracle(), observation()
                    observed[field] = missing
                    self.assertEqual(model.advance(checkpoint(), observed), "source_or_fence_unavailable_without_advance")
                    self.assertIsNone(model.checkpoint)
                    self.assertEqual(model.commit_count, 0)

    def test_each_resolved_source_identity_is_required(self):
        for field in observation()["resolved_checkpoint_fields"]:
            with self.subTest(field=field):
                observed, model = observation(), MODEL.CheckpointOracle()
                del observed["resolved_checkpoint_fields"][field]
                self.assertEqual(model.advance(checkpoint(), observed), "source_identity_mismatch_without_advance")
                self.assertIsNone(model.checkpoint)

    def test_empty_range_requires_independent_verified_empty_proof(self):
        candidate, model = checkpoint(), MODEL.CheckpointOracle()
        for field in ("first_retained_sequence_id", "index_through_sequence_id", "source_cursor"):
            candidate[field] = None
        observed = observation(candidate)
        self.assertEqual(MODEL.checkpoint_failures(candidate), [])
        self.assertEqual(model.advance(candidate, observed), "empty_range_unproved_without_advance")
        observed["empty_range_verified"] = True
        self.assertEqual(model.advance(candidate, observed), "checkpoint_committed_no_runtime_effect")

    def test_prior_checkpoint_cas_prevents_stale_writer(self):
        model = MODEL.CheckpointOracle(checkpoint())
        before = copy.deepcopy(vars(model))
        self.assertEqual(model.advance(checkpoint(), observation()), "checkpoint_cas_conflict_without_advance")
        self.assertEqual(vars(model), before)

    def test_restart_inclusive_reread_has_no_runtime_effect(self):
        prior = checkpoint()
        model = MODEL.CheckpointOracle(prior)
        self.assertEqual(model.advance(prior, observation(prior, prior)), "checkpoint_committed_no_runtime_effect")
        self.assertEqual(model.checkpoint, prior)
        self.assertEqual(disclose(model), "historical_fact_no_runtime_authority")
        self.assertEqual(model.runtime_effect_count, 0)

    def test_cursor_regression_requires_governed_rebuild(self):
        prior, candidate = checkpoint(), checkpoint()
        candidate["index_through_sequence_id"] = candidate["source_cursor"]["last_sequence_id"] = 4
        model = MODEL.CheckpointOracle(prior)
        self.assertEqual(model.advance(candidate, observation(candidate, prior)), "cursor_regression_requires_governed_rebuild")
        self.assertEqual(model.checkpoint, prior)

    def test_scope_change_cannot_advance_existing_checkpoint(self):
        prior, candidate = checkpoint(), checkpoint()
        candidate["storage_instance_id"] = "87654321-4321-4321-4321-210987654321"
        model = MODEL.CheckpointOracle(prior)
        self.assertEqual(model.advance(candidate, observation(candidate, prior)), "checkpoint_scope_change_without_advance")
        self.assertEqual(model.checkpoint, prior)

    def test_current_switch_requires_new_verified_source_observation(self):
        prior, candidate = checkpoint(), checkpoint()
        candidate["current_selection_sha256"] = "c" * 64
        candidate["source_cursor"]["manifest_generation"] += 1
        model = MODEL.CheckpointOracle(prior)
        self.assertEqual(model.advance(candidate, observation(prior, prior)), "source_identity_mismatch_without_advance")
        self.assertEqual(model.advance(candidate, observation(candidate, prior)), "checkpoint_committed_no_runtime_effect")
        self.assertEqual(model.runtime_effect_count, 0)

    def test_after_commit_access_deletion_and_token_fences(self):
        for field in ("current_token", "access_allowed", "deletion_allows_audit"):
            with self.subTest(field=field):
                model = MODEL.CheckpointOracle(checkpoint())
                self.assertEqual(disclose(model, **{field: False}), "read_unavailable_no_disclosure")
                self.assertEqual(model.disclosure_count, 0)

    def test_stale_read_digest_cannot_disclose(self):
        model = MODEL.CheckpointOracle(checkpoint())
        self.assertEqual(model.disclose("0" * 64, current_token=True, access_allowed=True,
                                        deletion_allows_audit=True), "read_unavailable_no_disclosure")
        self.assertEqual(model.disclosure_count, 0)

    def test_recovered_invalid_checkpoint_never_discloses(self):
        for case in FIXTURES["checkpoint_invalid"]:
            with self.subTest(case=case["case_id"]):
                candidate = checkpoint()
                GATE.set_pointer(candidate, case["pointer"], case["value"])
                model = MODEL.CheckpointOracle(candidate)
                self.assertEqual(disclose(model), "read_unavailable_no_disclosure")
                self.assertEqual(model.disclosure_count, 0)

    def test_degraded_complete_history_never_claims_runtime_authority(self):
        candidate = checkpoint()
        candidate.update(state="degraded", health="degraded")
        model = MODEL.CheckpointOracle()
        self.assertEqual(model.advance(candidate, observation(candidate)), "checkpoint_committed_no_runtime_effect")
        self.assertEqual(disclose(model), "historical_fact_no_runtime_authority")
        self.assertEqual(model.checkpoint["health"], "degraded")
        self.assertEqual(model.runtime_effect_count, 0)

    def test_incomplete_degraded_filter_neither_advances_nor_discloses(self):
        candidate = checkpoint()
        candidate.update(state="degraded", health="degraded", filter_complete=False)
        model = MODEL.CheckpointOracle()
        self.assertEqual(model.advance(candidate, observation(candidate)), "filter_incomplete_without_advance")
        self.assertEqual(disclose(MODEL.CheckpointOracle(candidate)), "read_unavailable_no_disclosure")

    def test_terminal_withdrawal_anchor_is_preserved(self):
        model = MODEL.CheckpointOracle(checkpoint())
        first = "2026-09-11T12:02:00Z"
        self.assertEqual(model.withdraw(first), "withdrawn_publication_fenced")
        before = copy.deepcopy(model.checkpoint)
        self.assertEqual(model.withdraw("2026-09-12T12:02:00Z"), "already_withdrawn_original_anchor")
        self.assertEqual(model.checkpoint, before)
        self.assertEqual(model.checkpoint["withdrawn_at_utc"], first)
        self.assertEqual(disclose(model), "read_unavailable_no_disclosure")
        self.assertEqual(model.advance(checkpoint(), observation(checkpoint(), before)), "withdrawn_without_advance")
        self.assertEqual(model.runtime_effect_count, 0)

    def test_invalid_or_retrograde_withdrawal_does_not_change_checkpoint(self):
        for timestamp in ("not-a-time", "2026-09-10T00:00:00Z"):
            model = MODEL.CheckpointOracle(checkpoint())
            before = copy.deepcopy(model.checkpoint)
            self.assertEqual(model.withdraw(timestamp), "invalid_withdrawal")
            self.assertEqual(model.checkpoint, before)


class WorkspaceHistoricalReadTests(unittest.TestCase):
    def read(self, event=None, subject=None, **changes):
        event = event if event is not None else creation()["event"]
        subject = subject if subject is not None else {field: event["payload"]["context"][field] for field in MODEL.SUBJECT}
        checks = dict(source_verified=True, access_allowed=True, deletion_allows_audit=True, checkpoint_read_token_valid=True)
        checks.update(changes)
        return MODEL.workspace_history_fact(event, subject, **checks)

    def test_exact_historical_source_is_not_live_workspace_authority(self):
        result = self.read()
        self.assertEqual(result["outcome"], "historical_creation_fact")
        self.assertEqual(result["fact"]["workspace_generation_at_creation"], 4)
        self.assertFalse(result["current_runtime_authority"])
        self.assertEqual(set(result["fact"]), {"event_id", "scope", "workspace_generation_at_creation"})

    def test_each_topology_session_and_workspace_scope_is_exact(self):
        subject = {field: creation()["event"]["payload"]["context"][field] for field in MODEL.SUBJECT}
        for field in MODEL.SUBJECT:
            with self.subTest(field=field):
                result = self.read(subject={**subject, field: "other-identity"})
                self.assertEqual(result["outcome"], "verified_scope_nonmatch")
                self.assertIsNone(result["fact"])
                self.assertFalse(result["current_runtime_authority"])

    def test_each_source_access_deletion_and_checkpoint_fence_is_required(self):
        for field in ("source_verified", "access_allowed", "deletion_allows_audit", "checkpoint_read_token_valid"):
            with self.subTest(field=field):
                self.assertEqual(self.read(**{field: False})["outcome"], "read_unavailable")

    def test_ref_text_or_wrong_family_is_not_historical_creation_evidence(self):
        for replacement in (None, [], {"payload": {}}):
            self.assertEqual(MODEL.workspace_history_fact(replacement, {}, source_verified=True, access_allowed=True,
                                                        deletion_allows_audit=True, checkpoint_read_token_valid=True)["outcome"], "read_unavailable")
        value = creation()["event"]
        value["event_type"] = "browser.workspace.reset"
        self.assertEqual(self.read(event=value)["outcome"], "read_unavailable")

    def test_corrupt_source_is_not_a_verified_scope_nonmatch(self):
        value = creation()["event"]
        value["project_id"] = "wrong-envelope-project"
        self.assertEqual(self.read(event=value)["outcome"], "read_unavailable")


if __name__ == "__main__":
    unittest.main()
