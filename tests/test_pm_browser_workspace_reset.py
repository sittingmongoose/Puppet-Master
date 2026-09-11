"""Reset-only synthetic oracle checks; no native or indexed-reset E2E proof.

The SP-278 fixtures are separate generic source controls. Their successful
joins do not assert that the modeled reset was present in that source/index.
All resolved-owner and verified-source observations are adapter assumptions.
"""

import copy
from pathlib import Path
import sys
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_browser_workspace_reset as reset_contract


class ResetTests(unittest.TestCase):
    def setUp(self):
        self.reset, _, _, _ = reset_contract.fixture_values()
        self.gate = reset_contract.sibling("pm-browser-event-admission")
        self.semantic = self.gate.envelope_oracle().event_producer_semantic_digest
        transition = self.reset["transition"]
        self.oracle = reset_contract.ResetOracle(
            transition["subject"], transition["checked_workspace_revision"],
            transition["prior_workspace_generation"], self.semantic,
        )

    def apply(self, values=None, outcome="committed", admitted=True):
        return self.oracle.reset(**(values or self.reset), append_outcome=outcome, admitted=admitted)

    def assert_counts(self, resets, appends, publications):
        self.assertEqual(
            (self.oracle.reset_count, self.oracle.append_count, self.oracle.publication_count),
            (resets, appends, publications),
        )

    def next_reset(self, revision=57):
        values = copy.deepcopy(self.reset)
        values["event"]["event_id"] = "event-browser-reset-next"
        for item in (values["event"], values["request"], values["transition"]):
            item["idempotency_key"] = "browser-reset-next"
        for item in (values["request"], values["result"], values["transition"]):
            item["command_instance_id"] = "command-reset-next"
        for item in (values["request"], values["result"]):
            item["scope"]["expected_workspace_revision"] = revision
        values["transition"]["checked_workspace_revision"] = revision
        for item in (values["event"]["payload"]["facts"], values["transition"]):
            item["prior_workspace_generation"] = self.oracle.generation
            item["workspace_generation"] = self.oracle.generation + 5
        return values

    def test_base_preflight(self):
        self.assertEqual(reset_contract.reset_preflight_failures(**self.reset), [])

    def test_every_named_fixture_negative(self):
        cases = reset_contract.load(reset_contract.FIXTURE_PATH)["reset_invalid"]
        self.assertEqual(len(cases), 28)
        self.assertEqual(len({case["case_id"] for case in cases}), 28)
        for case in cases:
            with self.subTest(case=case["case_id"]):
                changed = copy.deepcopy(self.reset)
                self.gate.set_pointer(changed[case["target"]], case["pointer"], case["value"])
                self.assertIn(case["expected_error"], reset_contract.reset_preflight_failures(**changed))
                self.assertEqual(self.apply(changed), "rejected_no_reset")
                self.assert_counts(0, 0, 0)

    def test_wrong_and_missing_producer_receipt_permission(self):
        for target, field in (
            ("witness", "producer_component"), ("witness", "producer_authenticated"),
            ("witness", "transition_receipt_resolved"), ("witness", "permission_valid_at_transition"),
            ("result", "dispatch_receipt_ref"), ("request", "permission_snapshot_ref"),
            ("transition", "transition_receipt_ref"),
        ):
            for missing in (False, True):
                with self.subTest(target=target, field=field, missing=missing):
                    changed = copy.deepcopy(self.reset)
                    if missing:
                        changed[target].pop(field)
                    else:
                        changed[target][field] = False if isinstance(changed[target][field], bool) else "other:ref"
                    self.assertTrue(reset_contract.reset_preflight_failures(**changed))
                    self.assertEqual(self.apply(changed), "rejected_no_reset")
                    self.assert_counts(0, 0, 0)

    def test_generation_strictly_increases_without_plus_one_requirement(self):
        for generation in (0, 2, 3):
            changed = copy.deepcopy(self.reset)
            for item in (changed["event"]["payload"]["facts"], changed["transition"]):
                item["workspace_generation"] = generation
            with self.subTest(generation=generation):
                self.assertTrue(reset_contract.reset_preflight_failures(**changed))
                self.assertEqual(self.apply(changed), "rejected_no_reset")
        changed = copy.deepcopy(self.reset)
        for item in (changed["event"]["payload"]["facts"], changed["transition"]):
            item["workspace_generation"] = 17
        self.assertEqual(reset_contract.reset_preflight_failures(**changed), [])
        self.assertEqual(self.apply(changed), "reset_event_committed_and_published")
        self.assertEqual(self.oracle.generation, 17)
        self.assertIsNone(self.oracle.revision)
        self.assert_counts(1, 1, 1)

    def test_revision_and_generation_have_separate_owner_joins(self):
        for field, value in (("revision", 3), ("generation", 41)):
            original = getattr(self.oracle, field)
            setattr(self.oracle, field, value)
            with self.subTest(field=field):
                self.assertEqual(self.apply(), "stale_owner_no_reset")
                self.assert_counts(0, 0, 0)
            setattr(self.oracle, field, original)

    def test_all_command_lineage_and_subject_fields_join_context(self):
        for target in ("request", "result"):
            for field in reset_contract.LINEAGE:
                changed = copy.deepcopy(self.reset)
                changed[target]["scope"]["lineage"][field] = "other-value"
                with self.subTest(target=target, lineage=field):
                    self.assertTrue(reset_contract.reset_preflight_failures(**changed))
            for field in ("browser_session_id", "browser_workspace_id", "session_security_class"):
                changed = copy.deepcopy(self.reset)
                changed[target]["scope"][field] = "other-value"
                with self.subTest(target=target, subject=field):
                    self.assertTrue(reset_contract.reset_preflight_failures(**changed))
        for field in reset_contract.SUBJECT:
            changed = copy.deepcopy(self.reset)
            changed["transition"]["subject"][field] = "other-value"
            with self.subTest(resolved_subject=field):
                self.assertIn("reset_resolved_subject_mismatch", reset_contract.reset_preflight_failures(**changed))

    def test_controller_authority_exact_parity(self):
        for field in self.reset["transition"]["controller_authority"]:
            changed = copy.deepcopy(self.reset)
            value = changed["transition"]["controller_authority"][field]
            changed["transition"]["controller_authority"][field] = value + 1 if isinstance(value, int) else "other:holder"
            with self.subTest(field=field):
                self.assertIn("reset_controller_join", reset_contract.reset_preflight_failures(**changed))
        changed = copy.deepcopy(self.reset)
        changed["result"]["scope"]["controller_authority"]["lease_epoch"] += 1
        self.assertIn("reset_request_result_scope_mismatch", reset_contract.reset_preflight_failures(**changed))

    def test_full_resolved_context_and_optional_command_subject_join(self):
        for field, value in self.reset["transition"]["context"].items():
            changed = copy.deepcopy(self.reset)
            changed["transition"]["context"][field] = value + 1 if isinstance(value, int) else "different-value"
            with self.subTest(context=field):
                self.assertTrue(reset_contract.reset_preflight_failures(**changed))
        for target in ("request", "result"):
            for field in ("browser_page_id", "page_generation", "browser_program_id", "program_workspace_id"):
                changed = copy.deepcopy(self.reset)
                changed[target]["scope"][field] = 9 if field == "page_generation" else "different-value"
                with self.subTest(target=target, field=field):
                    self.assertTrue(reset_contract.reset_preflight_failures(**changed))

    def test_each_resolved_owner_reference_joins_payload(self):
        for field in ("owner_record_ref", "transition_receipt_ref", "permission_snapshot_ref", "capability_snapshot_ref"):
            changed = copy.deepcopy(self.reset)
            changed["transition"][field] = "other:reference"
            with self.subTest(field=field):
                self.assertIn("reset_reference_join:" + field, reset_contract.reset_preflight_failures(**changed))

    def test_prepared_unadmitted_has_no_effect(self):
        self.assertEqual(self.apply(admitted=False), "rejected_no_reset")
        self.assertEqual(self.oracle.generation, 3)
        self.assert_counts(0, 0, 0)
        self.assertEqual(self.oracle.pending, {})

    def test_failed_and_unknown_append_preserve_effect_and_block_repeats(self):
        for outcome in ("failed", "unknown"):
            with self.subTest(outcome=outcome):
                self.setUp()
                self.assertEqual(self.apply(outcome=outcome), "reset_effect_committed_event_pending_recovery")
                self.assertEqual(self.oracle.generation, 4)
                self.assert_counts(1, 0, 0)
                self.assertEqual(len(self.oracle.pending), 1)
                self.assertEqual(self.apply(), "original_reset_pending_recovery_no_repeat")
                self.assertEqual(self.apply(self.next_reset()), "owner_recovery_required_no_reset")
                key = next(iter(self.oracle.pending))
                semantic = self.semantic(self.reset["event"])
                self.assertEqual(self.oracle.resolve_append(key, "0" * 64, "committed"), "original_append_identity_unresolved")
                self.assertEqual(self.oracle.resolve_append(key, semantic, outcome), "original_append_pending_no_reset")
                self.assert_counts(1, 0, 0)
                self.assertEqual(self.oracle.resolve_append(key, semantic, "committed"), "reset_event_committed_and_published")
                self.assert_counts(1, 1, 1)
                self.assertEqual(self.apply(), "original_result_no_reset")
                self.assertEqual(self.apply(self.next_reset()), "owner_revision_unresolved_no_reset")
                # Explicit assumed owner observation, not generation arithmetic.
                self.oracle.revision = 57
                self.assertEqual(self.apply(self.next_reset()), "reset_event_committed_and_published")
                self.assertEqual(self.oracle.generation, 9)
                self.assert_counts(2, 2, 2)

    def test_ack_lost_retry_returns_original_without_rewinding_newer_generation(self):
        self.assertEqual(self.apply(outcome="committed_ack_lost"), "reset_event_committed_ack_lost")
        self.assert_counts(1, 1, 0)
        self.assertEqual(self.apply(), "original_result_no_reset")
        self.assertEqual(self.apply(self.next_reset()), "owner_revision_unresolved_no_reset")
        self.oracle.revision = 57
        self.assertEqual(self.apply(self.next_reset()), "reset_event_committed_and_published")
        self.assertEqual(self.oracle.generation, 9)
        self.assertEqual(self.apply(), "original_result_no_reset")
        self.assertEqual(self.oracle.generation, 9)
        self.assert_counts(2, 2, 1)

    def test_altered_request_result_and_idempotency_conflict(self):
        self.assertEqual(self.apply(), "reset_event_committed_and_published")
        for target, field, value in (
            ("request", "requested_at_utc", "2026-09-11T12:00:02Z"),
            ("result", "completed_at_utc", "2026-09-11T12:00:03Z"),
            ("event", "actor_ref", "actor:changed"),
        ):
            changed = copy.deepcopy(self.reset)
            changed[target][field] = value
            with self.subTest(target=target, field=field):
                self.assertEqual(reset_contract.reset_preflight_failures(**changed), [])
                self.assertEqual(self.apply(changed), "idempotency_conflict")
                self.assert_counts(1, 1, 1)
        changed = copy.deepcopy(self.reset)
        for item in (changed["event"], changed["request"], changed["transition"]):
            item["idempotency_key"] = "changed-key-same-event"
        self.assertEqual(self.apply(changed), "idempotency_conflict")
        self.assert_counts(1, 1, 1)

    def test_original_result_current_access_required(self):
        self.assertEqual(self.apply(), "reset_event_committed_and_published")
        for missing in (False, True):
            changed = copy.deepcopy(self.reset)
            if missing:
                changed["witness"].pop("current_result_access")
            else:
                changed["witness"]["current_result_access"] = False
            with self.subTest(missing=missing):
                self.assertEqual(self.apply(changed), "original_result_access_denied")
                self.assert_counts(1, 1, 1)


class CheckpointTests(unittest.TestCase):
    def setUp(self):
        _, self.cp, self.index, self.obs = reset_contract.fixture_values()
        self.oracle = reset_contract.CheckpointOracle()

    def advance(self, cp=None, index=None, obs=None, admitted=True):
        return self.oracle.advance(cp or self.cp, index or self.index, obs or self.obs, admitted=admitted)

    def assert_no_commit(self):
        self.assertEqual(self.oracle.commit_count, 0)
        self.assertEqual(self.oracle.runtime_effect_count, 0)
        self.assertIsNone(self.oracle.checkpoint)

    def test_base_checkpoint_and_token(self):
        self.assertEqual(reset_contract.checkpoint_failures(self.cp), [])
        self.assertEqual(reset_contract.index_token_failures(self.cp["index_read_token"], self.index, self.obs), [])
        self.assertEqual(self.advance(), "checkpoint_committed_no_runtime_effect")
        self.assertEqual(self.oracle.disclose(self.index, self.obs), "historical_reset_fact_no_runtime_authority")
        self.assertEqual((self.oracle.commit_count, self.oracle.disclosure_count, self.oracle.runtime_effect_count), (1, 1, 0))

    def test_unadmitted_no_checkpoint_advance(self):
        self.assertEqual(self.advance(admitted=False), "event_not_admitted_no_advance")
        self.assert_no_commit()

    def test_every_read_token_field_exactly_joins(self):
        token = self.cp["index_read_token"]
        changed_values = {
            "storage_instance_id": "22222222-2222-4222-8222-222222222222",
            "checkpoint_key": token["checkpoint_key"] + "-other",
            "checkpoint_ref": token["checkpoint_ref"] + "-other",
            "generation_id": "eig_" + "0" * 64,
            "generation_anchor_sha256": "0" * 64,
            "frontier_revision": token["frontier_revision"] + 1,
            "frontier_sha256": "0" * 64,
            "index_dataset_name": "event_record_index.v2@eig_" + "0" * 64,
            "source_selection": {**token["source_selection"], "manifest_generation": 999},
            "redb_snapshot_id": "snapshot:other",
        }
        self.assertEqual(set(changed_values), set(token))
        for field, value in changed_values.items():
            with self.subTest(field=field):
                cp = copy.deepcopy(self.cp)
                cp["index_read_token"][field] = value
                self.assertTrue(reset_contract.index_token_failures(cp["index_read_token"], self.index, self.obs))
                self.assertNotEqual(self.advance(cp=cp), "checkpoint_committed_no_runtime_effect")
                self.assert_no_commit()

    def test_unresolved_root_current_generation_and_dataset(self):
        for mutation in ("no_current", "missing_node", "wrong_dataset", "wrong_node_identity"):
            index = copy.deepcopy(self.index)
            selected = index["current_generation_id"]
            if mutation == "no_current":
                index["current_generation_id"] = None
            elif mutation == "missing_node":
                del index["generations"][selected]
            elif mutation == "wrong_dataset":
                index["generations"][selected]["index_dataset_name"] = "event_record_index.v2@eig_" + "0" * 64
            else:
                index["generations"][selected]["generation_id"] = "eig_" + "0" * 64
            with self.subTest(mutation=mutation):
                self.assertTrue(reset_contract.index_token_failures(self.cp["index_read_token"], index, self.obs))
                self.assertEqual(self.advance(index=index), "generic_index_unavailable_no_advance")
                self.assert_no_commit()

    def test_changed_anchor_invalidates_token(self):
        index = copy.deepcopy(self.index)
        index["generations"][index["current_generation_id"]]["anchor"]["generation_seed_sha256"] = "0" * 64
        self.assertEqual(self.advance(index=index), "generic_index_unavailable_no_advance")
        self.assert_no_commit()

    def test_current_generation_is_unique_and_not_staged(self):
        for mutation in ("two_current", "selected_staged"):
            index = copy.deepcopy(self.index)
            selected = index["current_generation_id"]
            node = index["generations"][selected]
            if mutation == "two_current":
                other_id = "eig_" + "0" * 64
                other = copy.deepcopy(node)
                other["generation_id"] = other_id
                other["index_dataset_name"] = "event_record_index.v2@" + other_id
                index["generations"][other_id] = other
            else:
                node["state"] = "staged"
                node["activated_at_utc"] = None
            with self.subTest(mutation=mutation):
                self.assertEqual(self.advance(index=index), "generic_index_unavailable_no_advance")
                self.assert_no_commit()

    def test_same_generation_changed_frontier_invalidates_advance_and_disclosure(self):
        self.assertEqual(self.advance(), "checkpoint_committed_no_runtime_effect")
        index = copy.deepcopy(self.index)
        frontier = index["generations"][index["current_generation_id"]]["frontier"]
        frontier["publication_revision"] += 1
        frontier["predecessor_frontier_sha256"] = self.cp["index_read_token"]["frontier_sha256"]
        self.assertEqual(index["current_generation_id"], self.cp["index_read_token"]["generation_id"])
        self.assertEqual(self.oracle.disclose(index, self.obs), "read_unavailable_no_disclosure")
        obs = {**self.obs, "prior_checkpoint": copy.deepcopy(self.cp)}
        self.assertEqual(self.advance(index=index, obs=obs), "generic_index_unavailable_no_advance")
        fresh = copy.deepcopy(self.cp)
        fresh["index_read_token"]["frontier_revision"] = frontier["publication_revision"]
        fresh["index_read_token"]["frontier_sha256"] = reset_contract.digest(frontier)
        self.assertEqual(self.advance(cp=fresh, index=index, obs=obs), "checkpoint_committed_no_runtime_effect")
        self.assertEqual(self.oracle.runtime_effect_count, 0)

    def test_frontier_hash_checks_contents_even_without_revision_change(self):
        index = copy.deepcopy(self.index)
        index["generations"][index["current_generation_id"]]["frontier"]["index_row_set_sha256"] = "0" * 64
        self.assertEqual(self.advance(index=index), "generic_index_unavailable_no_advance")
        self.assert_no_commit()

    def test_current_source_selection_and_snapshot_observation(self):
        for field in self.obs["source_selection"]:
            obs = copy.deepcopy(self.obs)
            value = obs["source_selection"][field]
            obs["source_selection"][field] = value + 1 if isinstance(value, int) else value + "x"
            with self.subTest(field=field):
                self.assertEqual(self.advance(obs=obs), "generic_index_unavailable_no_advance")
                self.assert_no_commit()
        for field, value in (("redb_snapshot_id", "snapshot:other"), ("generic_source_verified", False)):
            obs = {**self.obs, field: value}
            with self.subTest(field=field):
                self.assertEqual(self.advance(obs=obs), "generic_index_unavailable_no_advance")
                self.assert_no_commit()

    def test_before_commit_permission_deletion_and_source_fences(self):
        for field in ("project_filter_complete", "reset_sources_validated", "source_dedupe_verified",
                      "access_allowed", "deletion_allows_audit", "binding_supported", "before_commit_fence_current"):
            for missing in (False, True):
                obs = copy.deepcopy(self.obs)
                if missing:
                    obs.pop(field)
                else:
                    obs[field] = False
                with self.subTest(field=field, missing=missing):
                    self.assertEqual(self.advance(obs=obs), "filter_or_fence_unproved_no_advance")
                    self.assert_no_commit()

    def test_before_disclosure_permission_deletion_and_source_fences(self):
        self.assertEqual(self.advance(), "checkpoint_committed_no_runtime_effect")
        for field in ("access_allowed", "deletion_allows_audit", "disclosure_fence_current", "generic_source_verified"):
            for missing in (False, True):
                obs = copy.deepcopy(self.obs)
                if missing:
                    obs.pop(field)
                else:
                    obs[field] = False
                with self.subTest(field=field, missing=missing):
                    self.assertEqual(self.oracle.disclose(self.index, obs), "read_unavailable_no_disclosure")
        obs = copy.deepcopy(self.obs)
        obs["source_selection"]["manifest_generation"] += 1
        self.assertEqual(self.oracle.disclose(self.index, obs), "read_unavailable_no_disclosure")
        self.assertEqual((self.oracle.disclosure_count, self.oracle.runtime_effect_count), (0, 0))

    def test_new_snapshot_same_persistent_binding_discloses_without_write(self):
        self.assertEqual(self.advance(), "checkpoint_committed_no_runtime_effect")
        before = copy.deepcopy(self.oracle.checkpoint)
        obs = {**self.obs, "redb_snapshot_id": "snapshot:read-only-restart"}
        # A token presented as an exact current read still requires its snapshot.
        self.assertTrue(reset_contract.index_token_failures(self.cp["index_read_token"], self.index, obs))
        # The read oracle may reacquire a snapshot for the unchanged persistent
        # binding. The stored historical snapshot identifier is not rewritten.
        self.assertEqual(self.oracle.disclose(self.index, obs), "historical_reset_fact_no_runtime_authority")
        self.assertEqual(self.oracle.checkpoint, before)
        self.assertEqual((self.oracle.commit_count, self.oracle.disclosure_count, self.oracle.runtime_effect_count), (1, 1, 0))

    def test_new_snapshot_does_not_relax_any_persistent_token_join(self):
        for field in self.cp["index_read_token"]:
            if field == "redb_snapshot_id":
                continue
            cp = copy.deepcopy(self.cp)
            value = cp["index_read_token"][field]
            if isinstance(value, dict):
                value["manifest_generation"] += 1
            elif isinstance(value, int):
                cp["index_read_token"][field] = value + 1
            elif field.endswith("sha256"):
                cp["index_read_token"][field] = "0" * 64
            else:
                cp["index_read_token"][field] = value + "x"
            with self.subTest(field=field):
                oracle = reset_contract.CheckpointOracle(cp)
                obs = {**self.obs, "redb_snapshot_id": "snapshot:new"}
                self.assertEqual(oracle.disclose(self.index, obs), "read_unavailable_no_disclosure")
                self.assertEqual((oracle.commit_count, oracle.disclosure_count, oracle.runtime_effect_count), (0, 0, 0))

    def test_full_examined_range_not_last_matching_row(self):
        # The separate mixed-scope generic fixture ends on a non-reset event.
        self.assertEqual(self.cp["index_through_sequence_id"], 8)
        self.assertEqual(self.cp["source_cursor"]["last_event_id"], "hold-set-event-A")
        cp = copy.deepcopy(self.cp)
        cp["index_through_sequence_id"] = 7
        cp["source_cursor"]["last_sequence_id"] = 7
        self.assertEqual(self.advance(cp=cp), "filtered_range_not_global_coverage")
        cp = copy.deepcopy(self.cp)
        cp["first_retained_sequence_id"] = 8
        self.assertEqual(self.advance(cp=cp), "filtered_range_not_global_coverage")
        cp = copy.deepcopy(self.cp)
        cp["source_cursor"]["last_event_id"] = "claimed-last-reset"
        self.assertEqual(self.advance(cp=cp), "filtered_range_not_global_coverage")
        self.assert_no_commit()

    def test_project_scope_and_cas(self):
        cp = {**self.cp, "scope_partition": reset_contract.scope_partition("another-project")}
        self.assertEqual(self.advance(cp=cp), "checkpoint_invalid_no_advance")
        self.assertEqual(self.advance(obs={**self.obs, "project_id": "another-project"}), "filtered_project_mismatch")
        self.assertEqual(self.advance(obs={**self.obs, "prior_checkpoint": self.cp}), "checkpoint_cas_conflict_no_advance")
        self.assert_no_commit()
        self.assertEqual(self.advance(), "checkpoint_committed_no_runtime_effect")
        self.assertEqual(self.advance(), "checkpoint_cas_conflict_no_advance")
        cp = copy.deepcopy(self.cp)
        cp["project_id"] = "another-project"
        cp["scope_partition"] = reset_contract.scope_partition(cp["project_id"])
        obs = {**self.obs, "project_id": cp["project_id"], "prior_checkpoint": copy.deepcopy(self.cp)}
        self.assertEqual(self.advance(cp=cp, obs=obs), "checkpoint_scope_change_no_advance")
        self.assertEqual(self.oracle.commit_count, 1)

    def test_disclosure_requires_same_project_scope(self):
        self.assertEqual(self.advance(), "checkpoint_committed_no_runtime_effect")
        obs = {**self.obs, "project_id": "another-project"}
        self.assertEqual(self.oracle.disclose(self.index, obs), "read_unavailable_no_disclosure")
        self.assertEqual(self.oracle.disclosure_count, 0)

    def test_empty_generic_source_is_explicit_null_cursor(self):
        _, cp, index, obs = reset_contract.fixture_values(generic_case="verified_empty")
        self.assertIsNone(cp["source_cursor"])
        self.assertIsNone(cp["first_retained_sequence_id"])
        self.assertIsNone(cp["index_through_sequence_id"])
        self.assertEqual(self.advance(cp=cp, index=index, obs=obs), "checkpoint_committed_no_runtime_effect")
        self.assertEqual(self.oracle.disclose(index, obs), "historical_reset_fact_no_runtime_authority")
        self.assertEqual(self.oracle.runtime_effect_count, 0)
        fabricated = {**cp, "index_through_sequence_id": 0}
        self.assertTrue(reset_contract.checkpoint_failures(fabricated))

    def test_degraded_generic_survivors_retain_health(self):
        _, cp, index, obs = reset_contract.fixture_values(generic_case="degraded_survivors")
        self.assertEqual((cp["state"], cp["health"]), ("degraded", "degraded"))
        self.assertEqual(self.advance(cp=cp, index=index, obs=obs), "checkpoint_committed_no_runtime_effect")
        self.assertEqual(self.oracle.disclose(index, obs), "historical_reset_fact_no_runtime_authority")
        self.assertEqual(self.oracle.runtime_effect_count, 0)
        self.oracle = reset_contract.CheckpointOracle()
        false_healthy = {**cp, "state": "current", "health": "healthy"}
        self.assertEqual(self.advance(cp=false_healthy, index=index, obs=obs), "filtered_range_not_global_coverage")
        incomplete = {**cp, "filter_complete": False}
        self.assertEqual(self.advance(cp=incomplete, index=index, obs=obs), "filter_incomplete_no_advance")
        self.assert_no_commit()

    def test_cursor_regression_and_empty_regression_require_rebuild(self):
        previous = copy.deepcopy(self.cp)
        previous["index_through_sequence_id"] += 1
        previous["source_cursor"]["last_sequence_id"] += 1
        self.assertEqual(reset_contract.checkpoint_failures(previous), [])
        self.oracle = reset_contract.CheckpointOracle(previous)
        obs = {**self.obs, "prior_checkpoint": previous}
        self.assertEqual(self.advance(obs=obs), "cursor_regression_requires_governed_rebuild")
        _, empty, index, empty_obs = reset_contract.fixture_values(generic_case="verified_empty")
        empty_obs["prior_checkpoint"] = previous
        self.assertEqual(self.advance(cp=empty, index=index, obs=empty_obs), "cursor_regression_requires_governed_rebuild")
        self.assertEqual(self.oracle.checkpoint, previous)
        self.assertEqual((self.oracle.commit_count, self.oracle.runtime_effect_count), (0, 0))

    def test_withdrawal_anchor_immutable_and_no_ordinary_revival(self):
        self.assertEqual(self.advance(), "checkpoint_committed_no_runtime_effect")
        at = "2026-09-11T21:00:00Z"
        self.assertEqual(self.oracle.withdraw(at), "withdrawn_publication_fenced")
        withdrawn = copy.deepcopy(self.oracle.checkpoint)
        self.assertEqual(withdrawn["withdrawn_at_utc"], at)
        self.assertEqual(self.oracle.withdraw("2026-09-12T21:00:00Z"), "already_withdrawn_original_anchor")
        self.assertEqual(self.oracle.checkpoint, withdrawn)
        self.assertEqual(self.oracle.disclose(self.index, self.obs), "read_unavailable_no_disclosure")
        obs = {**self.obs, "prior_checkpoint": withdrawn}
        self.assertEqual(self.advance(obs=obs), "withdrawn_no_advance")
        self.assertEqual(self.oracle.checkpoint, withdrawn)
        self.assertEqual((self.oracle.commit_count, self.oracle.disclosure_count, self.oracle.runtime_effect_count), (1, 0, 0))

    def test_invalid_withdrawal_does_not_mutate_current_checkpoint(self):
        self.assertEqual(self.advance(), "checkpoint_committed_no_runtime_effect")
        for at in ("invalid", "2026-09-11T19:59:59Z", "2026-09-11T21:00:00"):
            with self.subTest(at=at):
                self.assertEqual(self.oracle.withdraw(at), "invalid_withdrawal")
                self.assertEqual(self.oracle.checkpoint, self.cp)


class HistoricalConsumerTests(unittest.TestCase):
    def setUp(self):
        self.reset, _, _, _ = reset_contract.fixture_values()
        self.subject = self.reset["transition"]["subject"]
        self.flags = dict(admitted=True, source_verified=True, access_allowed=True,
                          deletion_allows_audit=True, checkpoint_read_token_valid=True)

    def test_exact_historical_edge_without_mutation_or_current_authority(self):
        before = copy.deepcopy(self.reset)
        result = reset_contract.workspace_history_fact(self.reset["event"], self.subject, **self.flags)
        self.assertEqual(result, {"outcome": "historical_reset_fact", "fact": {
            "event_id": self.reset["event"]["event_id"], "scope": self.subject,
            "prior_workspace_generation": 3, "workspace_generation_at_reset": 4},
            "current_runtime_authority": False})
        self.assertEqual(self.reset, before)

    def test_every_required_proof_flag_fails_closed(self):
        for flag in self.flags:
            for value in (None, False, 1, "true"):
                with self.subTest(flag=flag, value=value):
                    result = reset_contract.workspace_history_fact(
                        self.reset["event"], self.subject, **{**self.flags, flag: value})
                    self.assertEqual(result, {"outcome": "read_unavailable", "fact": None,
                                              "current_runtime_authority": False})

    def test_exact_seven_part_subject_and_closed_input(self):
        for field in reset_contract.SUBJECT:
            changed = {**self.subject, field: "other-subject"}
            with self.subTest(field=field):
                result = reset_contract.workspace_history_fact(self.reset["event"], changed, **self.flags)
                self.assertEqual(result["outcome"], "verified_scope_nonmatch")
                self.assertIsNone(result["fact"])
                del changed[field]
                self.assertEqual(reset_contract.workspace_history_fact(
                    self.reset["event"], changed, **self.flags)["outcome"], "read_unavailable")
        self.assertEqual(reset_contract.workspace_history_fact(
            self.reset["event"], {**self.subject, "current_generation": 4}, **self.flags)["outcome"], "read_unavailable")

    def test_sibling_malformed_protected_and_nonadvancing_facts_not_disclosed(self):
        gate = reset_contract.sibling("pm-browser-event-admission")
        created = next(case for case in reset_contract.load("Plans/browser_event_admission_fixtures.json")["valid"]
                       if case["event_type"] == "browser.workspace.created")
        values = [None, {}, gate.fixture_event(created, 2)]
        for path, value in (("/payload/context/session_security_class", "protected_auth"),
                            ("/payload/facts/workspace_generation", 3),
                            ("/payload/facts/prior_workspace_generation", None)):
            changed = copy.deepcopy(self.reset["event"])
            gate.set_pointer(changed, path, value)
            values.append(changed)
        for event in values:
            with self.subTest(event=event):
                result = reset_contract.workspace_history_fact(event, self.subject, **self.flags)
                self.assertEqual(result["outcome"], "read_unavailable")
                self.assertIsNone(result["fact"])


class CheckpointRetentionTests(unittest.TestCase):
    def setUp(self):
        _, self.cp, self.index, self.obs = reset_contract.fixture_values()
        self.oracle = reset_contract.CheckpointOracle()
        self.assertEqual(self.oracle.advance(self.cp, self.index, self.obs, admitted=True), "checkpoint_committed_no_runtime_effect")

    def successor(self, identity="publication:reset-fixture-2", at="2026-09-11T21:00:00Z"):
        before = copy.deepcopy(self.oracle.checkpoint)
        old = {k: copy.deepcopy(v) for k, v in before.items() if k != "retired_generations"}
        if old["state"] != "withdrawn":
            old.update(state="withdrawn", updated_at_utc=at, withdrawn_at_utc=at)
        after = {**copy.deepcopy(self.cp), "publication_id": identity, "published_at_utc": at, "updated_at_utc": at,
                 "retired_generations": before["retired_generations"] + [{"checkpoint_core": old, "successor_publication_id": identity}]}
        obs = copy.deepcopy(self.obs)
        obs["prior_checkpoint"] = before
        obs["generation_transaction"].update(before=before, after=copy.deepcopy(after),
                                              selected_publication_id=identity, committed_at_utc=at)
        return after, obs

    def cleanup_observation(self):
        return {"prior_checkpoint": copy.deepcopy(self.oracle.checkpoint), "maintenance_authorized": True,
                "all_applicable_holds_resolved": True, "no_applicable_hold_or_live_ref": True,
                "hold_ref_fence_current": True, "access_allowed": True, "deletion_allows_audit": True}

    def test_initial_generation_transaction_is_required_and_exact(self):
        for target in ("before", "checkpoint_key", "selected_publication_id", "committed_at_utc", "after"):
            obs = copy.deepcopy(self.obs)
            obs["generation_transaction"][target] = self.cp if target == "before" else "wrong"
            with self.subTest(target=target):
                model = reset_contract.CheckpointOracle()
                self.assertEqual(model.advance(self.cp, self.index, obs, admitted=True), "generation_admission_invalid_no_advance")
                self.assertEqual(model.commit_count, 0)
        for flag in ("generation_transaction_resolved", "coordinator_admitted", "complete_rebuild_verified", "capacity_reserved", "hold_ref_fence_current"):
            with self.subTest(flag=flag):
                model = reset_contract.CheckpointOracle()
                self.assertEqual(model.advance(self.cp, self.index, {**self.obs, flag: False}, admitted=True), "generation_admission_invalid_no_advance")

    def test_atomic_replacement_stores_exact_predecessor_and_then_preserves_siblings(self):
        first = copy.deepcopy(self.oracle.checkpoint)
        after, obs = self.successor()
        self.assertEqual(reset_contract.generation_admission_failures(first, after, obs), [])
        self.assertEqual(self.oracle.replace(after, self.index, obs, admitted=True), "checkpoint_committed_no_runtime_effect")
        archived = copy.deepcopy(self.oracle.checkpoint["retired_generations"])
        self.assertEqual(archived[0]["checkpoint_core"], {**{k:v for k,v in first.items() if k != "retired_generations"},
                         "state": "withdrawn", "updated_at_utc": "2026-09-11T21:00:00Z", "withdrawn_at_utc": "2026-09-11T21:00:00Z"})
        third, third_obs = self.successor("publication:reset-fixture-3", "2026-09-11T22:00:00Z")
        self.assertEqual(self.oracle.replace(third, self.index, third_obs, admitted=True), "checkpoint_committed_no_runtime_effect")
        self.assertEqual(self.oracle.checkpoint["retired_generations"][:1], archived)
        before = copy.deepcopy(self.oracle.checkpoint)
        fourth, obs = self.successor("publication:reset-fixture-4", "2026-09-11T23:00:00Z")
        self.assertEqual(self.oracle.replace(fourth, self.index, obs, admitted=True), "checkpoint_invalid_no_advance")
        self.assertEqual(self.oracle.checkpoint, before)
        # Repair the maxItems shape by illicitly dropping a sibling: still fail.
        fourth["retired_generations"].pop(0)
        obs["generation_transaction"]["after"] = copy.deepcopy(fourth)
        self.assertEqual(self.oracle.replace(fourth, self.index, obs, admitted=True), "generation_admission_invalid_no_advance")
        self.assertEqual(self.oracle.checkpoint, before)

    def test_already_withdrawn_anchor_and_core_are_preserved(self):
        self.assertEqual(self.oracle.withdraw("2026-09-11T20:30:00Z"), "withdrawn_publication_fenced")
        withdrawn = {k:v for k,v in copy.deepcopy(self.oracle.checkpoint).items() if k != "retired_generations"}
        after, obs = self.successor()
        self.assertEqual(self.oracle.replace(after, self.index, obs, admitted=True), "checkpoint_committed_no_runtime_effect")
        self.assertEqual(self.oracle.checkpoint["retired_generations"][0]["checkpoint_core"], withdrawn)

    def test_paired_forged_history_and_transaction_cannot_change_predecessor(self):
        for field, value in (("publication_id", "publication:forged"), ("hold_refs", ["hold:forged"]),
                             ("published_at_utc", "2026-09-11T19:00:00Z"), ("updated_at_utc", "2026-09-11T22:00:00Z")):
            after, obs = self.successor()
            after["retired_generations"][0]["checkpoint_core"][field] = value
            obs["generation_transaction"]["after"] = copy.deepcopy(after)
            with self.subTest(field=field):
                self.assertEqual(self.oracle.replace(after, self.index, obs, admitted=True), "generation_admission_invalid_no_advance")
                self.assertEqual(self.oracle.checkpoint, self.cp)

    def test_ordinary_refresh_cannot_change_generation_birth_holds_or_history(self):
        after, obs = self.successor()
        self.assertEqual(self.oracle.replace(after, self.index, obs, admitted=True), "checkpoint_committed_no_runtime_effect")
        for field, value in (("publication_id", "publication:forged"), ("published_at_utc", "2026-09-11T21:00:01Z"),
                             ("hold_refs", ["hold:new"]), ("retired_generations", [])):
            changed = {**copy.deepcopy(after), field: value, "updated_at_utc": "2026-09-11T22:00:00Z"}
            with self.subTest(field=field):
                self.assertEqual(self.oracle.advance(changed, self.index, {**self.obs, "prior_checkpoint": after}, admitted=True),
                                 "generation_identity_or_history_changed_no_advance")
                self.assertEqual(self.oracle.checkpoint, after)
        refreshed = {**copy.deepcopy(after), "updated_at_utc": "2026-09-11T22:00:00Z"}
        self.assertEqual(self.oracle.advance(refreshed, self.index, {**self.obs, "prior_checkpoint": after}, admitted=True),
                         "checkpoint_committed_no_runtime_effect")

    def test_cleanup_exact_ttl_cas_holds_and_sibling_preservation(self):
        after, obs = self.successor()
        self.assertEqual(self.oracle.replace(after, self.index, obs, admitted=True), "checkpoint_committed_no_runtime_effect")
        third, obs = self.successor("publication:reset-fixture-3", "2026-09-11T22:00:00Z")
        self.assertEqual(self.oracle.replace(third, self.index, obs, admitted=True), "checkpoint_committed_no_runtime_effect")
        observation = self.cleanup_observation()
        original = copy.deepcopy(self.oracle.checkpoint)
        identity = self.cp["publication_id"]
        self.assertEqual(self.oracle.cleanup(identity, "2026-09-18T20:59:59Z", observation), "cleanup_retention_window_open")
        for flag in observation:
            if flag == "prior_checkpoint":
                continue
            with self.subTest(flag=flag):
                self.assertEqual(self.oracle.cleanup(identity, "2026-09-18T21:00:00Z", {**observation, flag: False}),
                                 "cleanup_authority_or_hold_unproved")
                self.assertEqual(self.oracle.checkpoint, original)
        self.assertEqual(self.oracle.cleanup(identity, "2026-09-18T21:00:00Z", {**observation, "prior_checkpoint": after}),
                         "cleanup_invalid_or_cas_conflict")
        self.assertEqual(self.oracle.cleanup(original["publication_id"], "2026-09-18T21:00:00Z", observation), "cleanup_retired_identity_missing")
        self.assertEqual(self.oracle.cleanup(identity, "2026-09-18T21:00:00Z", observation), "eligible_retired_generation_removed")
        expected = {**original, "retired_generations": original["retired_generations"][1:]}
        self.assertEqual(self.oracle.checkpoint, expected)
        fourth, obs = self.successor("publication:reset-fixture-4", "2026-09-18T22:00:00Z")
        self.assertEqual(self.oracle.replace(fourth, self.index, obs, admitted=True), "checkpoint_committed_no_runtime_effect")
        self.assertEqual(len(self.oracle.checkpoint["retired_generations"]), 2)
        self.assertEqual(self.oracle.runtime_effect_count, 0)


class ResetBindingTests(unittest.TestCase):
    def setUp(self):
        self.row = next(row for row in reset_contract.load("Plans/browser_event_admission.json")["rows"]
                        if row["event_type"] == reset_contract.EVENT_TYPE)

    def test_exact_registered_binding_and_inline_schema(self):
        self.assertEqual(reset_contract.binding_failures(self.row), [])
        _, cp, _, _ = reset_contract.fixture_values()
        from jsonschema import Draft202012Validator, FormatChecker
        self.assertTrue(Draft202012Validator(reset_contract.checkpoint_bundle(), format_checker=FormatChecker()).is_valid(cp))
        family = reset_contract.expected_storage_family()
        self.assertEqual(family["producer"], [reset_contract.PROJECTOR + "@1.0.0"])
        self.assertEqual(family["consumers"], [reset_contract.CONSUMER + "@1.0.0"])

    def test_reset_admission_requires_exact_central_and_owner_bindings(self):
        gate = reset_contract.sibling("pm-browser-event-admission")
        event = reset_contract.fixture_values()[0]["event"]
        context = gate.contract_context()
        producer = "BrowserRuntimeService.workspace"
        self.assertEqual(gate.event_failures(event, producer, context), [])
        self.assertIn("central_family_missing", gate.event_failures(event, producer, context, families={}))
        prepared = copy.deepcopy(context)
        row = next(row for row in prepared[0]["rows"] if row["event_type"] == reset_contract.EVENT_TYPE)
        row["admission_status"] = "prepared_not_admitted"
        self.assertIn("event_not_admitted", gate.event_failures(event, producer, prepared))
        oracle = gate.ReplayOracle()
        self.assertEqual(oracle.consume(event, producer, prepared), "quarantined_without_checkpoint_advance")
        self.assertEqual((oracle.checkpoint, oracle.projected_count, oracle.executed_effects), (-1, 0, 0))
        forged = copy.deepcopy(context)
        row = next(row for row in forged[0]["rows"] if row["event_type"] == reset_contract.EVENT_TYPE)
        row["authority_contract_ref"] = "Plans/browser_workspace_created_contracts.schema.json#/x-pm-event-authority-binding"
        self.assertIn("reset_authority_contract_ref_mismatch", gate.event_failures(event, producer, forged))

    def test_unreviewed_siblings_cannot_borrow_reset_binding(self):
        gate = reset_contract.sibling("pm-browser-event-admission")
        rows = gate.contract_context()[0]["rows"]
        admitted = {row["event_type"] for row in rows if row["admission_status"] == "admitted_static_contract"}
        self.assertEqual(admitted, {"browser.workspace.created", "browser.workspace.reset"})
        self.assertEqual(len([row for row in rows if row["admission_status"] == "prepared_not_admitted"]), 51)
        for row in rows:
            if row["event_type"] in admitted:
                continue
            forged = {**row, "admission_status": "admitted_static_contract", "authority_contract_ref": self.row["authority_contract_ref"]}
            with self.subTest(sibling=row["event_type"]):
                self.assertEqual(gate.authority_binding_failures(forged), ["complete_browser_authority_binding_missing"])

    def test_mutated_missing_and_duplicate_storage_bindings_are_rejected(self):
        original_load = reset_contract.load
        original_registry = original_load("Plans/storage_value_registry.json")
        for mutation in ("absent", "duplicate", "producer", "consumer", "key", "schema", "retention", "generic_token"):
            registry = copy.deepcopy(original_registry)
            family = next(f for f in registry["families"] if f["family_id"] == reset_contract.CHECKPOINT_FAMILY)
            if mutation == "absent":
                registry["families"].remove(family)
            elif mutation == "duplicate":
                registry["families"].append(copy.deepcopy(family))
            elif mutation == "generic_token":
                family["value_schema"]["$defs"]["generic_read_token"]["required"].remove("frontier_sha256")
            else:
                key = {"producer": "producer", "consumer": "consumers", "key": "key_shape",
                       "schema": "schema_version", "retention": "retention_policy_ref"}[mutation]
                family[key] = ["sibling@1.0.0"] if isinstance(family[key], list) else "sibling"
            with self.subTest(mutation=mutation), mock.patch.object(reset_contract, "load", side_effect=lambda path, root=ROOT:
                    registry if path == "Plans/storage_value_registry.json" else original_load(path, root)):
                self.assertIn("reset_checkpoint_family_disposition_mismatch", reset_contract.binding_failures(self.row))

    def test_authority_role_version_and_owner_refs_are_exact(self):
        original_load = reset_contract.load
        original_schema = original_load(reset_contract.CONTRACT_PATH)
        for field in reset_contract.expected_binding():
            schema = copy.deepcopy(original_schema)
            schema["x-pm-event-authority-binding"][field] = "wrong-binding"
            with self.subTest(field=field), mock.patch.object(reset_contract, "load", side_effect=lambda path, root=ROOT:
                    schema if path == reset_contract.CONTRACT_PATH else original_load(path, root)):
                self.assertIn("exact_reset_authority_binding_mismatch", reset_contract.binding_failures(self.row))
        for field in ("authority_contract_ref", "semantic_owner_ref", "producer_component", "consumer_contract_refs"):
            changed = {**self.row, field: [] if field == "consumer_contract_refs" else "sibling"}
            with self.subTest(row=field):
                self.assertTrue(reset_contract.binding_failures(changed))

    def test_checkpoint_timestamp_and_withdrawal_order_are_strict(self):
        _, cp, _, _ = reset_contract.fixture_values()
        for value in ("2026-09-11", "2026-02-30T20:00:00Z", "2026-09-11T20:00:00", "invalid"):
            with self.subTest(timestamp=value):
                self.assertTrue(reset_contract.checkpoint_failures({**cp, "updated_at_utc": value}))
        self.assertIn("withdrawal_after_observation", reset_contract.checkpoint_failures({
            **cp, "state": "withdrawn", "withdrawn_at_utc": "2026-09-12T20:00:00Z"}))


if __name__ == "__main__":
    unittest.main()
