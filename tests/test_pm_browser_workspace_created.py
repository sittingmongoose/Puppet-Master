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


# Conditional v2 successor: these tests do not replace v1 admission or prove
# native migration, source bytes, permissions or crash recovery.
V2_SPEC = importlib.util.spec_from_file_location('workspace_created_v2', ROOT / 'scripts/pm_browser_workspace_created_v2.py')
V2 = importlib.util.module_from_spec(V2_SPEC)
V2_SPEC.loader.exec_module(V2)


class ConditionalCreatedV2Tests(unittest.TestCase):
    def setUp(self):
        self.cp, self.index, self.obs, self.old = V2.fixture_values()

    def bind(self, before, after, custody=None):
        observation = copy.deepcopy(self.obs)
        observation['prior_checkpoint'] = copy.deepcopy(before)
        observation['generation_transaction'].update(
            before=copy.deepcopy(before), after=copy.deepcopy(after),
            selected_publication_id=after['publication_id'], committed_at_utc=after['published_at_utc'],
            checkpoint_key=V2.key(after), v1_custody=copy.deepcopy(custody))
        if custody is not None:
            observation['resolved_v1_hold_refs'] = copy.deepcopy(custody['hold_refs'])
        return observation

    def handoff(self, withdrawn=False, holds=None):
        before = copy.deepcopy(self.old)
        if withdrawn:
            before.update(state='withdrawn', withdrawn_at_utc='2026-09-11T12:00:00Z')
        after = copy.deepcopy(self.cp)
        custody = {'publication_id': 'publication:created-v1-custody', 'codec': 'messagepack_canonical',
                   'hold_refs': holds or []}
        core = copy.deepcopy(before)
        if not withdrawn:
            core.update(state='withdrawn', updated_at_utc=after['published_at_utc'], withdrawn_at_utc=after['published_at_utc'])
        after['retired_generations'] = [{
            'identity_origin': 'v1_custody_bound_at_handoff', 'publication_id': custody['publication_id'],
            'custody_bound_at_utc': after['published_at_utc'], 'retired_at_utc': core['withdrawn_at_utc'],
            'successor_publication_id': after['publication_id'], 'hold_refs': custody['hold_refs'], 'legacy_checkpoint': core}]
        return before, after, self.bind(before, after, custody)

    def rotate(self, before, name, time):
        after = copy.deepcopy(before)
        after.update(publication_id=name, published_at_utc=time, updated_at_utc=time, state='current', withdrawn_at_utc=None)
        core = {k: copy.deepcopy(v) for k, v in before.items() if k != 'retired_generations'}
        if core['state'] != 'withdrawn':
            core.update(state='withdrawn', updated_at_utc=time, withdrawn_at_utc=time)
        after['retired_generations'].append({'checkpoint_core': core, 'successor_publication_id': name})
        return after, self.bind(before, after)

    def test_conditional_initial_and_entire_generic_range(self):
        self.assertEqual(V2.advance_failures(None, self.cp, self.index, self.obs), [])
        self.assertEqual(V2.source_failures(self.cp, self.index, self.obs, disclosure=True), [])
        self.assertEqual(V2.load(V2.SCHEMA)['x-pm-definition-status'], 'conditional_not_admitted')
        self.assertEqual(self.obs['generation_transaction']['after'], self.cp)
        self.assertNotIn('reset', self.obs['generation_transaction']['checkpoint_key'])
        changed = copy.deepcopy(self.cp)
        changed['first_retained_sequence_id'] = 1 if changed['first_retained_sequence_id'] != 1 else 2
        self.assertTrue(V2.source_failures(changed, self.index, self.obs))

    def test_v1_handoff_preimage_and_finalization(self):
        for withdrawn in (False, True):
            with self.subTest(withdrawn=withdrawn):
                before, after, obs = self.handoff(withdrawn, ['hold:legacy'])
                self.assertEqual(V2.advance_failures(before, after, self.index, obs, replacement=True), [])
                entry = after['retired_generations'][0]
                self.assertEqual(obs['generation_transaction']['before'], before)
                if withdrawn:
                    self.assertEqual(entry['legacy_checkpoint'], before)
                    self.assertEqual(entry['retired_at_utc'], before['withdrawn_at_utc'])
                else:
                    self.assertEqual(entry['legacy_checkpoint']['state'], 'withdrawn')
                    self.assertEqual(entry['retired_at_utc'], after['published_at_utc'])
                self.assertEqual(entry['custody_bound_at_utc'], after['published_at_utc'])
                self.assertTrue(V2.advance_failures(before, after, self.index, obs))

    def test_v1_wrapper_only_finalization_and_anchor_reset_rejected(self):
        for withdrawn in (False, True):
            before, after, obs = self.handoff(withdrawn)
            entry = after['retired_generations'][0]
            if withdrawn:
                entry['retired_at_utc'] = after['published_at_utc']
            else:
                entry['legacy_checkpoint'] = copy.deepcopy(before)
            obs = self.bind(before, after, obs['generation_transaction']['v1_custody'])
            self.assertTrue(V2.generation_failures(before, after, obs))

    def test_schema_rejects_missing_token_wrong_family_and_bad_time(self):
        for field in self.cp['index_read_token']:
            changed = copy.deepcopy(self.cp)
            del changed['index_read_token'][field]
            self.assertTrue(V2.checkpoint_failures(changed), field)
        for field, value in [('event_type', 'browser.workspace.reset'), ('schema_version', '1.0.0'),
                             ('published_at_utc', 'invalid')]:
            changed = copy.deepcopy(self.cp); changed[field] = value
            self.assertTrue(V2.checkpoint_failures(changed), field)
        self.assertTrue(V2.checkpoint_failures(self.old))

    def test_schema_valid_custody_mutations_rejected(self):
        mutations = {
            'preimage': lambda b, a, o: o['generation_transaction']['before'].update(current_selection_sha256='f' * 64),
            'key': lambda b, a, o: o['generation_transaction'].update(checkpoint_key='other:key'),
            'selected': lambda b, a, o: o['generation_transaction'].update(selected_publication_id='publication:wrong'),
            'unknown_commit': lambda b, a, o: o.update(generation_transaction_resolved=False),
            'codec': lambda b, a, o: o.update(v1_codec_supported=False),
            'custody': lambda b, a, o: o.update(v1_custody_verified=False),
            'holds': lambda b, a, o: o.update(resolved_v1_hold_refs=[]),
            'hold_fence': lambda b, a, o: o.update(hold_ref_fence_current=False),
            'capacity': lambda b, a, o: o.update(capacity_reserved=False),
        }
        for name, change in mutations.items():
            with self.subTest(name=name):
                before, after, obs = self.handoff(holds=['hold:protected'])
                change(before, after, obs)
                self.assertTrue(V2.generation_failures(before, after, obs))
        for field, value in [('successor_publication_id', 'publication:unrelated'),
                             ('hold_refs', []), ('publication_id', self.cp['publication_id'])]:
            before, after, obs = self.handoff(holds=['hold:protected'])
            after['retired_generations'][0][field] = value
            obs = self.bind(before, after, obs['generation_transaction']['v1_custody'])
            self.assertTrue(V2.generation_failures(before, after, obs), field)

    def test_cross_scope_and_contradictory_cursor_rejected(self):
        for target, field, value in [('token', 'storage_instance_id', '22222222-2222-4222-8222-222222222222'),
                                     ('cp', 'scope_partition', 'project~wrong'),
                                     ('cp', 'index_through_sequence_id', 99999)]:
            changed = copy.deepcopy(self.cp)
            (changed['index_read_token'] if target == 'token' else changed)[field] = value
            self.assertTrue(V2.source_failures(changed, self.index, self.obs))
        before, after, obs = self.handoff()
        after['retired_generations'][0]['legacy_checkpoint']['project_id'] = 'other-project'
        self.assertTrue(V2.checkpoint_failures(after))

    def test_fresh_snapshot_and_source_access_deletion_fences(self):
        self.assertEqual(V2.source_failures(self.cp, self.index, None), ['source_observation_schema'])
        for field in ('generic_source_verified', 'created_sources_validated', 'project_filter_complete',
                      'source_dedupe_verified', 'access_allowed', 'deletion_allows_audit',
                      'disclosure_fence_current', 'binding_supported'):
            changed = copy.deepcopy(self.obs); changed[field] = False
            self.assertTrue(V2.source_failures(self.cp, self.index, changed, disclosure=True), field)
        changed = copy.deepcopy(self.obs); changed['before_commit_fence_current'] = False
        self.assertTrue(V2.source_failures(self.cp, self.index, changed))
        self.assertEqual(V2.source_failures(self.cp, self.index, changed, disclosure=True), [])
        # The stored nine-field token carries no snapshot id: commit and each
        # disclosure join the snapshot actually pinned now, and need one.
        changed = copy.deepcopy(self.obs); changed['redb_snapshot_id'] = 'snapshot:other'
        self.assertEqual(V2.source_failures(self.cp, self.index, changed), [])
        self.assertEqual(V2.source_failures(self.cp, self.index, changed, disclosure=True), [])
        for missing in (None, ''):
            unpinned = copy.deepcopy(self.obs); unpinned['redb_snapshot_id'] = missing
            self.assertEqual(V2.source_failures(self.cp, self.index, unpinned), ['generic_index_schema'])
            self.assertEqual(V2.source_failures(self.cp, self.index, unpinned, disclosure=True), ['generic_index_schema'])
        stale = copy.deepcopy(self.cp)
        stale['index_read_token']['frontier_sha256'] = 'f' * 64
        self.assertTrue(V2.source_failures(stale, self.index, changed, disclosure=True))
        changed = copy.deepcopy(self.index)
        changed['generations'][changed['current_generation_id']]['frontier']['publication_revision'] += 1
        self.assertTrue(V2.source_failures(self.cp, changed, self.obs))

    def test_second_generation_preserves_v1_and_v2_history_and_capacity(self):
        _, first, _ = self.handoff(withdrawn=True, holds=['hold:original'])
        second, obs = self.rotate(first, 'publication:created-v2-second', '2026-09-12T20:00:00Z')
        self.assertEqual(V2.advance_failures(first, second, self.index, obs, replacement=True), [])
        self.assertEqual(second['retired_generations'][0], first['retired_generations'][0])
        third, obs = self.rotate(second, 'publication:created-v2-third', '2026-09-13T20:00:00Z')
        self.assertTrue(V2.advance_failures(second, third, self.index, obs, replacement=True))
        # Even a schema-valid replacement that drops protected history fails.
        third['retired_generations'].pop(0)
        obs = self.bind(second, third)
        self.assertTrue(V2.generation_failures(second, third, obs))

    def test_refresh_preserves_generation_history_and_holds(self):
        _, before, _ = self.handoff()
        after = copy.deepcopy(before); after['updated_at_utc'] = '2026-09-12T20:00:00Z'
        obs = self.bind(before, after)
        self.assertEqual(V2.advance_failures(before, after, self.index, obs), [])
        for field, value in [('publication_id', 'publication:changed'), ('hold_refs', ['hold:new']), ('retired_generations', [])]:
            changed = copy.deepcopy(after); changed[field] = value
            self.assertTrue(V2.advance_failures(before, changed, self.index, obs), field)

    def test_frontier_only_refresh_uses_fresh_token_without_new_generation(self):
        before = copy.deepcopy(self.cp)
        after = copy.deepcopy(before)
        index = copy.deepcopy(self.index)
        frontier = index['generations'][index['current_generation_id']]['frontier']
        frontier['publication_revision'] += 1
        frontier['predecessor_frontier_sha256'] = before['index_read_token']['frontier_sha256']
        after['index_read_token']['frontier_revision'] = frontier['publication_revision']
        after['index_read_token']['frontier_sha256'] = V2.sibling('pm_browser_workspace_reset').digest(frontier)
        after['updated_at_utc'] = '2026-09-12T20:00:00Z'
        obs = copy.deepcopy(self.obs)
        obs.update(prior_checkpoint=before, redb_snapshot_id='snapshot:created-v2-refresh')
        self.assertEqual(V2.advance_failures(before, after, index, obs), [])
        self.assertEqual(after['publication_id'], before['publication_id'])
        self.assertEqual(after['index_read_token']['generation_id'], before['index_read_token']['generation_id'])
        self.assertTrue(V2.source_failures(before, index, obs))

    def test_every_token_value_is_joined_to_actual_snapshot(self):
        for field, value in self.cp['index_read_token'].items():
            changed = copy.deepcopy(self.cp)
            if isinstance(value, dict):
                changed['index_read_token'][field]['storage_instance_id'] = '22222222-2222-4222-8222-222222222222'
            elif isinstance(value, int):
                changed['index_read_token'][field] += 1
            elif field == 'storage_instance_id':
                changed['index_read_token'][field] = '22222222-2222-4222-8222-222222222222'
            elif field.endswith('sha256'):
                changed['index_read_token'][field] = 'f' * 64
            else:
                changed['index_read_token'][field] += '-changed'
            self.assertTrue(V2.source_failures(changed, self.index, self.obs), field)

    def test_cleanup_original_clock_holds_and_exact_cas(self):
        _, before, _ = self.handoff(withdrawn=True)
        after = copy.deepcopy(before); after['retired_generations'] = []
        publication = before['retired_generations'][0]['publication_id']
        obs = {'prior_checkpoint': before, 'now_utc': '2026-09-18T12:00:00Z', 'resolved_hold_refs': [],
               'active_hold_refs': [], 'resolved_references': [], 'all_applicable_holds_enumerated': True,
               'hold_ref_fence_current': True, 'cleanup_transaction_resolved': True,
               'maintenance_authorized': True, 'access_allowed': True, 'deletion_allows_audit': True}
        obs['cleanup_transaction'] = {'schema_id': 'pm.browser_workspace_created_checkpoint_cleanup_transaction.v2',
            'transaction_ref': 'transaction:created-v2-cleanup', 'before': before, 'after': after, 'checkpoint_key': V2.key(before),
            'selected_publication_id': publication, 'committed_at_utc': obs['now_utc'], 'status': 'committed'}
        self.assertEqual(V2.cleanup_failures(before, after, publication, obs), [])
        for field, value in [('now_utc', '2026-09-18T11:59:59Z'), ('resolved_hold_refs', ['hold:current']),
                             ('active_hold_refs', ['hold:current']), ('all_applicable_holds_enumerated', False),
                             ('resolved_references', ['ref:current']), ('hold_ref_fence_current', False),
                             ('cleanup_transaction_resolved', False), ('prior_checkpoint', None),
                             ('maintenance_authorized', False), ('access_allowed', False),
                             ('deletion_allows_audit', False)]:
            changed = copy.deepcopy(obs); changed[field] = value
            self.assertTrue(V2.cleanup_failures(before, after, publication, changed), field)
        _, held_before, _ = self.handoff(withdrawn=True, holds=['hold:original'])
        held_after = copy.deepcopy(held_before); held_after['retired_generations'] = []
        held = copy.deepcopy(obs)
        held.update(prior_checkpoint=held_before, resolved_hold_refs=['hold:original'],
                    active_hold_refs=['hold:original'])
        held['cleanup_transaction'].update(before=held_before, after=held_after)
        self.assertTrue(V2.cleanup_failures(held_before, held_after, publication, held))
        held['active_hold_refs'] = []
        self.assertEqual(V2.cleanup_failures(held_before, held_after, publication, held), [])

    def test_stored_token_is_nine_field_durable_token(self):
        generic = V2.load(V2.GENERIC)['$defs']['read_token']['required']
        self.assertEqual(list(self.cp['index_read_token']), [f for f in generic if f != 'redb_snapshot_id'])
        persisted = copy.deepcopy(self.cp)
        persisted['index_read_token']['redb_snapshot_id'] = self.obs['redb_snapshot_id']
        self.assertEqual(V2.checkpoint_failures(persisted), ['checkpoint_schema'])
        self.assertEqual(V2.source_failures(persisted, self.index, self.obs), ['checkpoint_schema'])
        _, first, _ = self.handoff(withdrawn=True)
        second, _ = self.rotate(first, 'publication:created-v2-second', '2026-09-12T20:00:00Z')
        self.assertEqual(V2.checkpoint_failures(second), [])
        second['retired_generations'][1]['checkpoint_core']['index_read_token']['redb_snapshot_id'] = 'snapshot:old'
        self.assertEqual(V2.checkpoint_failures(second), ['checkpoint_schema'])

    # S-01: SP-278 degraded survivors are complete coverage. A v2 value born or
    # refreshed over them commits and discloses as degraded history, never healthy.
    def degraded(self):
        return V2.fixture_values(generic_case='degraded_survivors')[:3]

    def test_degraded_survivor_commit_and_disclosure_pass(self):
        cp, index, obs = self.degraded()
        self.assertEqual((cp['state'], cp['health']), ('degraded', 'degraded'))
        self.assertEqual(V2.advance_failures(None, cp, index, obs), [])
        self.assertEqual(V2.source_failures(cp, index, obs, disclosure=True), [])

    def test_degraded_survivors_false_healthy_rejected(self):
        cp, index, obs = self.degraded()
        false_healthy = {**cp, 'state': 'current', 'health': 'healthy'}
        obs['generation_transaction']['after'] = copy.deepcopy(false_healthy)
        self.assertEqual(V2.checkpoint_failures(false_healthy), [])
        self.assertIn('complete_examined_range_join', V2.advance_failures(None, false_healthy, index, obs))
        self.assertIn('complete_examined_range_join', V2.source_failures(false_healthy, index, obs, disclosure=True))

    def test_degraded_survivors_incomplete_filter_rejected(self):
        cp, index, obs = self.degraded()
        incomplete = {**cp, 'filter_complete': False}
        obs['generation_transaction']['after'] = copy.deepcopy(incomplete)
        self.assertEqual(V2.checkpoint_failures(incomplete), [])
        self.assertIn('checkpoint_not_current', V2.advance_failures(None, incomplete, index, obs))
        self.assertIn('checkpoint_not_current', V2.source_failures(incomplete, index, obs, disclosure=True))

    # S-02: every schema conditional has a negative on the current value, on a
    # bare core and inside retired history, with the valid shapes as controls.
    CONDITIONAL_VIOLATIONS = {
        'current_filter_incomplete': {'state': 'current', 'filter_complete': False},
        'current_health_degraded': {'state': 'current', 'health': 'degraded'},
        'current_withdrawal_time': {'state': 'current', 'withdrawn_at_utc': '2026-09-11T20:00:00Z'},
        'degraded_health_healthy': {'state': 'degraded', 'health': 'healthy'},
        'degraded_withdrawal_time': {'state': 'degraded', 'health': 'degraded',
                                     'withdrawn_at_utc': '2026-09-11T20:00:00Z'},
        'withdrawn_null_time': {'state': 'withdrawn', 'withdrawn_at_utc': None},
        'null_cursor_integer_bounds': {'source_cursor': None},
        'cursor_null_bounds': {'first_retained_sequence_id': None, 'index_through_sequence_id': None},
    }

    def test_schema_conditionals_reject_each_violation(self):
        _, first, _ = self.handoff(withdrawn=True)
        rotated, _ = self.rotate(first, 'publication:created-v2-second', '2026-09-12T20:00:00Z')
        self.assertEqual(V2.checkpoint_failures(rotated), [])
        for name, change in self.CONDITIONAL_VIOLATIONS.items():
            with self.subTest(violation=name):
                value = {**copy.deepcopy(self.cp), **copy.deepcopy(change)}
                self.assertEqual(V2.checkpoint_failures(value), ['checkpoint_schema'])
                core = {k: v for k, v in value.items() if k != 'retired_generations'}
                self.assertEqual(V2.core_failures(core), ['checkpoint_core_schema'])
                retired = copy.deepcopy(rotated)
                retired['retired_generations'][1]['checkpoint_core'].update(copy.deepcopy(change))
                self.assertEqual(V2.checkpoint_failures(retired), ['checkpoint_schema'])
        for name, change in {'degraded': {'state': 'degraded', 'health': 'degraded'},
                             'withdrawn': {'state': 'withdrawn', 'withdrawn_at_utc': '2026-09-11T20:00:00Z'},
                             'empty': {'source_cursor': None, 'first_retained_sequence_id': None,
                                       'index_through_sequence_id': None}}.items():
            with self.subTest(valid=name):
                value = {**copy.deepcopy(self.cp), **change}
                self.assertEqual(V2.checkpoint_failures(value), [])
                self.assertEqual(V2.core_failures({k: v for k, v in value.items() if k != 'retired_generations'}), [])

    def test_verified_empty_source_is_explicit_null_cursor(self):
        cp, index, obs, _ = V2.fixture_values(generic_case='verified_empty')
        self.assertEqual((cp['first_retained_sequence_id'], cp['index_through_sequence_id'], cp['source_cursor']),
                         (None, None, None))
        self.assertEqual(V2.advance_failures(None, cp, index, obs), [])
        self.assertEqual(V2.source_failures(cp, index, obs, disclosure=True), [])
        fabricated = {**cp, 'index_through_sequence_id': 0}
        self.assertEqual(V2.checkpoint_failures(fabricated), ['checkpoint_schema'])
        frame = {'segment_generation': 1, 'segment_name': 'seg-000001-00000000000000000000.active',
                 'byte_offset': 0, 'frame_end_offset': 1, 'last_sequence_id': 0, 'last_event_id': 'event:fabricated'}
        fabricated = {**cp, 'first_retained_sequence_id': 0, 'index_through_sequence_id': 0, 'source_cursor': frame}
        self.assertEqual(V2.checkpoint_failures(fabricated), [])
        self.assertEqual(V2.source_failures(fabricated, index, obs, disclosure=True), ['complete_examined_range_join'])

    def test_source_withdrawn_and_project_join_rejected(self):
        withdrawn = {**copy.deepcopy(self.cp), 'state': 'withdrawn', 'withdrawn_at_utc': self.cp['updated_at_utc']}
        self.assertEqual(V2.source_failures(withdrawn, self.index, self.obs, disclosure=True), ['checkpoint_not_current'])
        other = copy.deepcopy(self.obs); other['project_id'] = 'project-other'
        self.assertEqual(V2.source_failures(self.cp, self.index, other), ['project_join'])
        self.assertEqual(V2.source_failures(self.cp, self.index, other, disclosure=True), ['project_join'])

    def test_refresh_negative_exits(self):
        before = copy.deepcopy(self.cp)
        after = copy.deepcopy(before); after['updated_at_utc'] = '2026-09-12T20:00:00Z'
        obs = copy.deepcopy(self.obs); obs['prior_checkpoint'] = copy.deepcopy(before)
        self.assertEqual(V2.advance_failures(before, after, self.index, obs), [])
        invalid = {**copy.deepcopy(before), 'unexpected': True}
        self.assertEqual(V2.advance_failures(invalid, after, self.index, obs), ['checkpoint_schema'])
        wrong = copy.deepcopy(obs); wrong['prior_checkpoint'] = None
        self.assertEqual(V2.advance_failures(before, after, self.index, wrong), ['prior_value_cas'])
        cases = {
            'withdrawn_requires_replacement': {'state': 'withdrawn', 'withdrawn_at_utc': before['updated_at_utc']},
            'observation_time_regressed': {'updated_at_utc': '2026-09-13T20:00:00Z'},
        }
        for error, change in cases.items():
            prior = {**copy.deepcopy(before), **change}
            prior_obs = copy.deepcopy(obs); prior_obs['prior_checkpoint'] = copy.deepcopy(prior)
            self.assertEqual(V2.advance_failures(prior, after, self.index, prior_obs), [error])
        wider = copy.deepcopy(before)
        wider['index_through_sequence_id'] += 1
        wider['source_cursor']['last_sequence_id'] += 1
        wider_obs = copy.deepcopy(obs); wider_obs['prior_checkpoint'] = copy.deepcopy(wider)
        self.assertEqual(V2.advance_failures(wider, after, self.index, wider_obs), ['refresh_range_regressed'])
        empty, empty_index, empty_obs, _ = V2.fixture_values(generic_case='verified_empty')
        empty['updated_at_utc'] = '2026-09-12T20:00:00Z'
        empty_obs['prior_checkpoint'] = copy.deepcopy(before)
        self.assertEqual(V2.advance_failures(before, empty, empty_index, empty_obs), ['refresh_range_regressed'])

    def test_generation_negative_exits(self):
        self.assertEqual(V2.generation_failures(None, self.cp, None), ['generation_observation_schema'])
        withdrawn = {**copy.deepcopy(self.cp), 'state': 'withdrawn', 'withdrawn_at_utc': self.cp['published_at_utc']}
        self.assertEqual(V2.generation_failures(None, withdrawn, self.bind(None, withdrawn)), ['generation_birth'])
        refreshed = {**copy.deepcopy(self.cp), 'updated_at_utc': '2026-09-12T20:00:00Z'}
        self.assertEqual(V2.generation_failures(None, refreshed, self.bind(None, refreshed)), ['generation_birth'])
        _, handed, _ = self.handoff()
        self.assertEqual(V2.generation_failures(None, handed, self.bind(None, handed)), ['initial_history'])
        custody = {'publication_id': 'publication:created-v1-custody', 'codec': 'messagepack_canonical', 'hold_refs': []}
        self.assertEqual(V2.generation_failures(None, self.cp, self.bind(None, self.cp, custody)), ['initial_history'])
        before, after, obs = self.handoff()
        broken = {**copy.deepcopy(before), 'unexpected': True}
        obs = self.bind(broken, after, obs['generation_transaction']['v1_custody'])
        self.assertIn('legacy_schema', V2.generation_failures(broken, after, obs))
        _, first, _ = self.handoff(withdrawn=True)
        first['updated_at_utc'] = '2026-09-13T20:00:00Z'
        second, obs = self.rotate(first, 'publication:created-v2-second', '2026-09-12T20:00:00Z')
        self.assertEqual(V2.checkpoint_failures(second), [])
        self.assertEqual(V2.generation_failures(first, second, obs), ['replacement_scope_or_time'])
        _, first, _ = self.handoff(withdrawn=True)
        second, obs = self.rotate(first, 'publication:created-v2-second', '2026-09-12T20:00:00Z')
        self.assertEqual(V2.generation_failures(first, second, obs), [])
        self.assertEqual(V2.generation_failures(first, second, self.bind(first, second, custody)),
                         ['replacement_identity'])
        reused, obs = self.rotate(first, first['publication_id'], '2026-09-12T20:00:00Z')
        self.assertEqual(V2.generation_failures(first, reused, obs), ['history_identity'])

    def test_history_time_negative_exits(self):
        _, after, _ = self.handoff(withdrawn=True)
        early = copy.deepcopy(after)
        early['retired_generations'][0]['custody_bound_at_utc'] = '2026-09-11T12:00:30Z'
        self.assertEqual(V2.checkpoint_failures(early), ['legacy_custody_time'])
        late = copy.deepcopy(after)
        late['retired_generations'][0]['custody_bound_at_utc'] = '2026-09-12T00:00:00Z'
        self.assertEqual(V2.checkpoint_failures(late), ['history_time'])

    def cleanup_obs(self, before, after, publication, now='2026-09-18T12:00:00Z'):
        return {'prior_checkpoint': copy.deepcopy(before), 'now_utc': now, 'resolved_hold_refs': [],
                'active_hold_refs': [], 'resolved_references': [], 'all_applicable_holds_enumerated': True,
                'hold_ref_fence_current': True, 'cleanup_transaction_resolved': True,
                'maintenance_authorized': True, 'access_allowed': True, 'deletion_allows_audit': True,
                'cleanup_transaction': {
                    'schema_id': 'pm.browser_workspace_created_checkpoint_cleanup_transaction.v2',
                    'transaction_ref': 'transaction:created-v2-cleanup', 'before': copy.deepcopy(before),
                    'after': copy.deepcopy(after), 'checkpoint_key': V2.key(before),
                    'selected_publication_id': publication, 'committed_at_utc': now, 'status': 'committed'}}

    def test_cleanup_negative_exits(self):
        _, first, _ = self.handoff(withdrawn=True)
        second, _ = self.rotate(first, 'publication:created-v2-second', '2026-09-12T20:00:00Z')
        v1_publication = second['retired_generations'][0]['publication_id']
        after = copy.deepcopy(second); after['retired_generations'].pop(0)
        obs = self.cleanup_obs(second, after, v1_publication)
        self.assertEqual(V2.cleanup_failures(second, after, v1_publication, obs), [])
        self.assertEqual(V2.cleanup_failures(second, after, v1_publication, None), ['cleanup_observation_schema'])
        invalid = {**copy.deepcopy(second), 'unexpected': True}
        self.assertEqual(V2.cleanup_failures(invalid, after, v1_publication, obs), ['checkpoint_schema'])
        self.assertEqual(V2.cleanup_failures(second, after, 'publication:missing', obs), ['cleanup_publication_missing'])
        for now in ('not-a-time', None, 20260918):
            changed = copy.deepcopy(obs); changed['now_utc'] = now
            self.assertIn('cleanup_protected_or_unexpired', V2.cleanup_failures(second, after, v1_publication, changed))
        missing = copy.deepcopy(obs); del missing['now_utc']
        self.assertIn('cleanup_protected_or_unexpired', V2.cleanup_failures(second, after, v1_publication, missing))
        malformed = copy.deepcopy(obs); malformed['cleanup_transaction']['status'] = 'pending'
        self.assertEqual(V2.cleanup_failures(second, after, v1_publication, malformed), ['cleanup_transaction_schema'])
        for target in ('current', 'sibling'):
            altered = copy.deepcopy(after)
            if target == 'current':
                altered['updated_at_utc'] = '2026-09-18T12:00:00Z'
            else:
                altered['retired_generations'][0]['checkpoint_core']['hold_refs'] = ['hold:altered']
            self.assertEqual(V2.checkpoint_failures(altered), [])
            self.assertEqual(V2.cleanup_failures(second, altered, v1_publication,
                                                 self.cleanup_obs(second, altered, v1_publication)),
                             ['cleanup_changed_survivors'])
        # A retired v2 core is anchored at its own first withdrawal.
        v2_publication = second['retired_generations'][1]['checkpoint_core']['publication_id']
        after = copy.deepcopy(second); after['retired_generations'].pop(1)
        for now, expected in (('2026-09-19T19:59:59Z', ['cleanup_protected_or_unexpired']), ('2026-09-19T20:00:00Z', [])):
            self.assertEqual(V2.cleanup_failures(second, after, v2_publication,
                                                 self.cleanup_obs(second, after, v2_publication, now)), expected)


if __name__ == '__main__':
    unittest.main()
