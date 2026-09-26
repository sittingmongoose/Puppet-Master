"""Focused static tests for the WM-029 rebuild_index typed companion.

No native builder, storage, receipt, work, dispatcher, or GUI execution.
Negative tests are causal: each trips its rule while structurally valid,
and disabling that predicate removes exactly that failure (no masking).
"""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import patch

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]


def _load_gate():
    spec = importlib.util.spec_from_file_location(
        "pm_search_rebuild_typed", ROOT / "scripts" / "pm_search_rebuild_typed.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


GATE = _load_gate()
SCHEMA = json.loads((ROOT / "Plans/search_rebuild_index.schema.json").read_text())
PACK = json.loads((ROOT / "Plans/search_rebuild_index_fixtures.json").read_text())
CASES = {bundle["case_id"]: bundle for bundle in PACK["valid"]}
NONGIT_RC = "cmd.search.rebuild_index.dispatch_receipt:rebuild:nongit:1"
OWNER_STAGED = ROOT / "Plans/full_thread_runtime_contracts.schema.json"
OWNER_PIN = "5fa07b1ee8a19c769883b6e8876bf0c5e6326b97f5992fec3b661d7ec2a541ea"
OWNER_SCHEMA = json.loads(OWNER_STAGED.read_text())
SEMANTICS_STAGED = ROOT / "scripts/pm_full_thread_semantics.py"
SEMANTICS_PIN = "f8fd8d66fe8a790c47d8fc583703689d0c827dadc0c9a918084526c91b07e931"


def mutate(case_id, fn):
    value = copy.deepcopy(CASES[case_id])
    fn(value)
    return value


def assert_causal(testcase, value, rule):
    structural = GATE.structural_failures(value, str(OWNER_STAGED), str(SEMANTICS_STAGED))
    testcase.assertEqual(structural, [], msg=structural)
    failures = GATE.bundle_semantic_failures(value)
    testcase.assertIn(rule, failures, msg=failures)
    with patch.dict(GATE.RULES, {rule: lambda _: True}):
        masked = GATE.bundle_semantic_failures(value)
    testcase.assertEqual(masked, [name for name in failures if name != rule])


class CompanionPositiveTests(unittest.TestCase):
    def test_gate_report_passes_with_static_only_claim(self):
        report = GATE.validate(str(OWNER_STAGED), str(SEMANTICS_STAGED))
        self.assertEqual(report["failures"], [], msg=report["failures"])
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["positive_cases"], 6)
        self.assertEqual(report["rules_total"], 36)
        self.assertEqual(report["claim_boundary"], "static_only_no_native_proof")
        self.assertEqual(report["native_acts_proven"], 0)

    def test_every_positive_is_structurally_and_semantically_clean(self):
        validator = Draft202012Validator(
            {"$ref": "#/$defs/search_rebuild_bundle", "$defs": SCHEMA["$defs"]})
        for case_id, bundle in CASES.items():
            with self.subTest(case_id=case_id):
                self.assertEqual(list(validator.iter_errors(bundle)), [])
                self.assertEqual(GATE.bundle_semantic_failures(bundle), [])
                self.assertEqual(GATE.genuine_outcome_failures(bundle["outcome"], OWNER_SCHEMA), [])

    def test_no_invented_adapter_gate_in_schema_or_rules(self):
        text = (ROOT / "Plans/search_rebuild_index.schema.json").read_text()
        self.assertNotIn("adapter", text)
        self.assertNotIn("verified", text)
        self.assertNotIn("search_rebuild_adapters", SCHEMA["$defs"])
        self.assertIn("search_rebuild_trusted_boundary", SCHEMA["$defs"])
        for banned in ("currentness_proved_or_open", "publication_proved_or_open", "adapter_identity"):
            self.assertNotIn(banned, GATE.RULES)
        for required in ("trusted_original_match", "trusted_current_match", "trusted_publication_match"):
            self.assertIn(required, GATE.RULES)

    def test_request_args_closed_to_project_id(self):
        args = SCHEMA["$defs"]["search_rebuild_original"]["properties"]["args"]
        self.assertEqual(set(args["properties"]), {"project_id"})
        self.assertFalse(args.get("additionalProperties", True))
        bad = mutate("git_success_with_work", lambda v: v["original"]["args"].update({"build_generation": 7}))
        self.assertTrue(GATE.structural_failures(bad, str(OWNER_STAGED), str(SEMANTICS_STAGED)))

    def test_missing_trusted_boundary_fails_structural(self):
        bad = mutate("git_success_with_work", lambda v: v.pop("trusted"))
        self.assertTrue(GATE.structural_failures(bad, str(OWNER_STAGED), str(SEMANTICS_STAGED)))


class GenuineFieldResolutionTests(unittest.TestCase):
    def test_central_fields_resolve_from_frozen_files(self):
        resolved = GATE.resolved_central_fields(str(OWNER_STAGED))
        ui = json.loads((ROOT / "Plans/ui_command_response.schema.json").read_text())
        sir = json.loads((ROOT / "Plans/shared_runtime_command_contracts.schema.json").read_text())
        row = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]["catalog.search_rebuild_index"]
        self.assertEqual(resolved["cv333_result_status"],
                         [v for v in ui["properties"]["result_status"]["enum"] if v is not None])
        self.assertEqual(resolved["cv333_error_codes"], ui["$defs"]["UICommandError"]["properties"]["code"]["enum"])
        self.assertEqual(resolved["cv333_command_id_pattern"], ui["$defs"]["CommandId"]["pattern"])
        self.assertEqual(resolved["sir_non_secret_ref_pattern"], sir["$defs"]["non_secret_ref"]["pattern"])
        self.assertEqual(resolved["sir_replay_policy"],
                         sir["$defs"]["command_idempotency"]["properties"]["replay_policy"]["enum"])
        self.assertEqual(resolved["production_row"]["ui_command_id"], row["ui_command_id"])
        self.assertEqual(resolved["production_row"]["handler_location"], row["handler_location"])
        self.assertEqual(resolved["production_row"]["expected_event_types"], row["expected_event_types"])
        self.assertTrue(resolved["catalog_row_present"])
        self.assertTrue(all(resolved["storage_tokens_present"].values()))
        self.assertTrue(all(resolved["wiring_tokens_present"].values()))

    def test_candidate_reuses_genuine_vocabularies_verbatim(self):
        resolved = GATE.resolved_central_fields()
        candidate_result = SCHEMA["$defs"]["search_rebuild_owner_result"]["properties"]["status"]["enum"]
        self.assertEqual(sorted(candidate_result), sorted(resolved["cv333_result_status"]))
        candidate_error = SCHEMA["$defs"]["ui_command_error"]["properties"]["code"]["enum"]
        self.assertEqual(sorted(candidate_error), sorted(resolved["cv333_error_codes"]))
        candidate_ref = {k: v for k, v in SCHEMA["$defs"]["non_secret_ref"].items() if not k.startswith("x-")}
        sir = json.loads((ROOT / "Plans/shared_runtime_command_contracts.schema.json").read_text())
        self.assertEqual(candidate_ref, sir["$defs"]["non_secret_ref"])
        candidate_category = SCHEMA["$defs"]["search_rebuild_owner_error"]["properties"]["category"]["enum"]
        self.assertEqual(sorted(candidate_category), sorted(resolved["sir_command_error_categories"]))

    def test_genuine_outcome_contract_composed(self):
        resolved = GATE.resolved_central_fields(str(OWNER_STAGED))
        candidate_outcome = SCHEMA["$defs"]["search_rebuild_outcome"]
        self.assertEqual(sorted(candidate_outcome["properties"]["outcome"]["enum"]),
                         sorted(resolved["genuine_outcome_enum"]))
        for field in ("owner_result_ref", "owner_result_schema_ref", "owner_result_sha256",
                      "payload_sha256", "error_ref", "result_receipt_ref",
                      "acknowledgement_receipt_ref"):
            self.assertIn(field, resolved["genuine_outcome_required"])
            self.assertIn(field, candidate_outcome["required"])
        self.assertEqual(resolved["genuine_outcome_allof_count"], 8)
        self.assertEqual(set(candidate_outcome["required"]),
                         set(resolved["genuine_outcome_required"]))


class CausalNegativeTests(unittest.TestCase):
    def test_foreign_project_in_original(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["original"]["args"].update({"project_id": "project:foreign"})), "project_join")

    def test_foreign_caller_in_result(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["owner_result"].update({"actor_ref": "actor:user:foreign"})), "caller_join")

    def test_foreign_operation_in_response(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["response"].update({"operation_id": "operation:foreign"})), "operation_join")

    def test_foreign_instance_in_receipt(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["receipt"].update({"command_instance_id": "command-instance:foreign"})), "instance_join")

    def test_foreign_current_generation(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["current_source"].update({"published_generation": 9})), "publication_join")

    def test_foreign_publication_anchor(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["publication"].update({"anchor_sha": "f" * 40})), "anchor_join")

    def test_missing_build_file(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["publication"]["files"].remove("lookup.bin")), "publication_coherence")

    def test_swap_without_sync(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["publication"].update({"synced": False})), "publication_coherence")

    def test_stale_dirty_fence_clearing(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["publication"].update({"cleared_through": 42})), "dirty_fence")

    def test_survivor_below_fence(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["publication"].update({"surviving_generations": [40]})), "dirty_fence")

    def test_receipt_swap_across_originals(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["response"].update({"receipt_ref": NONGIT_RC})), "receipt_accounting")

    def test_result_response_ref_swap(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["response"].update({"owner_result_ref": "owner-result:rebuild:nongit:1"})),
            "result_response_join")

    def test_replay_with_duplicate_effect(self):
        assert_causal(self, mutate("replay_preserves_original",
            lambda v: v["publication"].update({"claims_new_build": True, "built_generation": 8,
                                               "files": ["postings.bin", "lookup.bin", "file_map.bin", "index_meta.json"]})),
            "replay_never_rebuilds")

    def test_pre_swap_failure_claiming_new_generation(self):
        assert_causal(self, mutate("blocked_unavailable",
            lambda v: v["owner_result"].update({"effective_generation": 9})),
            "pre_swap_failure_retains_prior")

    def test_pre_swap_failure_without_fallback(self):
        assert_causal(self, mutate("blocked_unavailable",
            lambda v: v["owner_result"].update({"fallback_available": False})),
            "pre_swap_failure_retains_prior")

    def test_post_swap_settlement_claiming_prior(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["owner_result"].update({"effective_generation": 6})),
            "post_swap_settlement_truthful")

    def test_post_swap_unknown_claiming_prior(self):
        assert_causal(self, mutate("post_swap_unknown_settlement",
            lambda v: v["owner_result"].update({"effective_generation": 7})),
            "post_swap_settlement_truthful")

    def test_success_without_swap(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["publication"].update({"swapped": False})), "terminal_binding")

    def test_admission_claiming_success(self):
        assert_causal(self, mutate("pending_admission",
            lambda v: v["response"].update({"result_status": "succeeded"})), "admission_not_success")

    def test_nongit_timestamp_masquerading_as_source(self):
        assert_causal(self, mutate("nongit_success_no_work",
            lambda v: v["current_source"].update({"anchor_sha": "0" * 40})), "timestamp_never_authority")

    def test_git_missing_anchor(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: (v["current_source"].update({"anchor_sha": None}),
                       v["publication"].update({"anchor_sha": None}))), "timestamp_never_authority")

    def test_completed_work_against_pending_result(self):
        def fix(v):
            v["work"].update({"work_state": "completed",
                              "owner_result_receipt_ref": v["receipt"]["receipt_ref"]})
            v["owner_result"].update({"work_ref": v["work"]["work_id"]})
        assert_causal(self, mutate("pending_admission", fix), "work_conditional")

    def test_terminal_work_without_receipt(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["work"].update({"owner_result_receipt_ref": None})), "work_conditional")

    def test_terminal_work_without_result_backlink(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["owner_result"].update({"work_ref": None})), "work_conditional")

    def test_work_claimed_but_result_invents_none(self):
        assert_causal(self, mutate("nongit_success_no_work",
            lambda v: v.update({"work": {"operation_id": v["original"]["operation_id"],
                                           "owner_result_receipt_ref": None,
                                           "work_id": "work:rebuild:nongit:1", "work_state": "failed"}})),
            "work_conditional")

    def test_unknown_settlement_claiming_success(self):
        def fix(v):
            v["response"].update({"result_status": "succeeded", "error": None})
        assert_causal(self, mutate("post_swap_unknown_settlement", fix), "terminal_agreement")

    def test_rejected_outcome_with_owner_operation(self):
        assert_causal(self, mutate("blocked_unavailable",
            lambda v: v["outcome"].update({"outcome": "rejected"})), "terminal_agreement")

    def test_idempotency_key_mismatch(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["outcome"].update({"idempotency_key": "idem:foreign"})), "idempotency_join")

    def test_target_generation_mismatch(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["outcome"].update({"target_generation": 9})), "target_generation_join")

    def test_unexpected_event_refs(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["response"].update({"event_refs": ["event:rebuild:1"]})), "event_refs_empty")

    def test_error_on_successful_response(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["response"].update({"error": {"code": "internal_error", "offending_field": None,
                                                        "reason": "Spurious error."}})), "response_coherence")

    def test_blocked_original_with_build_effect(self):
        def fix(v):
            v["publication"].update({"claims_new_build": True, "built_generation": 9,
                                     "files": ["postings.bin", "lookup.bin", "file_map.bin", "index_meta.json"]})
            v["owner_result"].update({"built_generation": 9})
        assert_causal(self, mutate("blocked_unavailable", fix), "blocked_no_effect")

    def test_foreign_receipt_root(self):
        def fix(v):
            v["receipt"].update({"receipt_ref": "receipt:foreign:1"})
            v["response"].update({"receipt_ref": "receipt:foreign:1"})
            v["owner_result"].update({"result_receipt_ref": "receipt:foreign:1"})
        assert_causal(self, mutate("git_success_with_work", fix), "production_row_join")

    def test_trusted_original_mismatch_alone(self):
        value = mutate("git_success_with_work",
            lambda v: v["trusted"]["original"].update({"operation_id": "operation:foreign"}))
        self.assertEqual(GATE.structural_failures(value, str(OWNER_STAGED), str(SEMANTICS_STAGED)), [])
        self.assertEqual(GATE.bundle_semantic_failures(value), ["trusted_original_match"])

    def test_trusted_current_mismatch_alone(self):
        value = mutate("git_success_with_work",
            lambda v: v["trusted"]["current_source"].update({"published_generation": 99}))
        self.assertEqual(GATE.bundle_semantic_failures(value), ["trusted_current_match"])

    def test_trusted_publication_mismatch_alone(self):
        value = mutate("git_success_with_work",
            lambda v: v["trusted"]["publication"].update({"swapped": False}))
        self.assertEqual(GATE.bundle_semantic_failures(value), ["trusted_publication_match"])

    def test_comutated_trusted_input_is_not_a_valid_mutation_test(self):
        def fix(v):
            v["original"]["args"].update({"project_id": "project:foreign"})
            v["trusted"]["original"]["args"].update({"project_id": "project:foreign"})
        value = mutate("git_success_with_work", fix)
        failures = GATE.bundle_semantic_failures(value)
        self.assertIn("project_join", failures)
        self.assertNotIn("trusted_original_match", failures)

    def test_foreign_dispatch_frame_in_outcome(self):
        assert_causal(self, mutate("pending_admission",
            lambda v: v["outcome"].update({"dispatch_frame_id": "frame:rebuild:foreign"})),
            "dispatch_frame_join")

    def test_foreign_result_receipt_in_outcome(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["outcome"].update({"result_receipt_ref": NONGIT_RC})),
            "result_receipt_binding")

    def test_terminal_outcome_missing_result_receipt(self):
        bad = mutate("git_success_with_work",
            lambda v: v["outcome"].update({"result_receipt_ref": None}))
        failures = GATE.structural_failures(bad, str(OWNER_STAGED), str(SEMANTICS_STAGED))
        self.assertTrue(any(failure.startswith("genuine_outcome:") for failure in failures), failures)

    def test_terminal_work_bound_to_foreign_receipt(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["work"].update({"owner_result_receipt_ref": NONGIT_RC})),
            "work_conditional")

    def test_foreign_payload_digest_in_outcome(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["outcome"].update({"payload_sha256": "9" * 64})),
            "payload_digest_join")

    def test_foreign_owner_result_ref_in_outcome(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["outcome"].update({"owner_result_ref": "owner-result:rebuild:nongit:1"})),
            "result_response_join")

    def test_foreign_owner_result_schema_in_outcome(self):
        def fix(v):
            v["outcome"]["owner_result_schema_ref"].update(
                {"json_pointer": "#/$defs/search_rebuild_owner_error"})
        assert_causal(self, mutate("git_success_with_work", fix), "owner_result_schema_join")

    def test_foreign_owner_result_digest_in_outcome(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["outcome"].update({"owner_result_sha256": "9" * 64})),
            "owner_result_digest_join")

    def test_pending_result_identity_must_be_null_together(self):
        bad = mutate("pending_admission",
            lambda v: v["outcome"].update({"owner_result_ref": "owner-result:rebuild:pending:1"}))
        failures = GATE.structural_failures(bad, str(OWNER_STAGED), str(SEMANTICS_STAGED))
        self.assertTrue(any(failure.startswith("genuine_outcome:") for failure in failures), failures)

    def test_nonpending_result_without_identity_triple(self):
        assert_causal(self, mutate("pending_admission",
            lambda v: v["owner_result"].update({"status": "failed"})),
            "result_identity_null_together")

    def test_terminal_outcome_missing_error_evidence(self):
        bad = mutate("blocked_unavailable",
            lambda v: v["outcome"].update({"error_ref": None}))
        failures = GATE.structural_failures(bad, str(OWNER_STAGED), str(SEMANTICS_STAGED))
        self.assertTrue(any(failure.startswith("genuine_outcome:") for failure in failures), failures)

    def test_succeeded_outcome_missing_acknowledgement(self):
        bad = mutate("git_success_with_work",
            lambda v: v["outcome"].update({"acknowledgement_receipt_ref": None}))
        failures = GATE.structural_failures(bad, str(OWNER_STAGED), str(SEMANTICS_STAGED))
        self.assertTrue(any(failure.startswith("genuine_outcome:") for failure in failures), failures)

    def test_nonterminal_acceptance_carries_null_triple(self):
        pending = CASES["pending_admission"]
        self.assertEqual(pending["outcome"]["outcome"], "accepted")
        self.assertEqual(pending["owner_result"]["status"], "pending")
        self.assertIsNone(pending["outcome"]["owner_result_ref"])
        self.assertIsNone(pending["outcome"]["owner_result_schema_ref"])
        self.assertIsNone(pending["outcome"]["owner_result_sha256"])

    def test_flattened_mirror_fails_genuine_record(self):
        flat = copy.deepcopy(CASES["git_success_with_work"]["outcome"])
        identity = flat["identity"]
        for key in ("schema_id", "record_kind", "identity", "acknowledgement_frame_id",
                    "acknowledgement_frame_offset", "same_frame_acknowledged"):
            del flat[key]
        flat["command_instance_id"] = identity["command_instance_id"]
        flat["operation_id"] = identity["operation_id"]
        flat["project_id"] = identity["project_id"]
        failures = GATE.genuine_outcome_failures(flat, OWNER_SCHEMA)
        self.assertTrue(any("is a required property" in failure for failure in failures), failures)
        self.assertTrue(any("Additional properties are not allowed" in failure for failure in failures), failures)

    def test_missing_identity_fails_genuine_record(self):
        bad = mutate("git_success_with_work", lambda v: v["outcome"].pop("identity"))
        failures = GATE.structural_failures(bad, str(OWNER_STAGED), str(SEMANTICS_STAGED))
        self.assertTrue(any("genuine_outcome:" in failure and "'identity' is a required property" in failure
                            for failure in failures), failures)

    def test_contradictory_identity_operation(self):
        assert_causal(self, mutate("git_success_with_work",
            lambda v: v["outcome"]["identity"].update({"operation_id": "operation:foreign"})),
            "operation_join")

    def test_contradictory_ack_frame_offset(self):
        bad = mutate("git_success_with_work",
            lambda v: v["outcome"].update({"acknowledgement_frame_offset": 1}))
        failures = GATE.structural_failures(bad, str(OWNER_STAGED), str(SEMANTICS_STAGED))
        self.assertTrue(any(failure.startswith("genuine_outcome:") for failure in failures), failures)

    def test_owner_authority_pinned(self):
        digest = hashlib.sha256(OWNER_STAGED.read_bytes()).hexdigest()
        self.assertEqual(digest, OWNER_PIN)

    def test_owner_semantics_pinned(self):
        digest = hashlib.sha256(SEMANTICS_STAGED.read_bytes()).hexdigest()
        self.assertEqual(digest, SEMANTICS_PIN)

    def test_foreign_ack_frame_id_fails_owner_parity(self):
        bad = mutate("git_success_with_work",
            lambda v: v["outcome"].update({"acknowledgement_frame_id": "frame:foreign"}))
        failures = GATE.structural_failures(bad, str(OWNER_STAGED), str(SEMANTICS_STAGED))
        self.assertFalse(any(failure.startswith("genuine_outcome:") for failure in failures), failures)
        self.assertIn("owner_semantic:command_acknowledgement_frame_parity", failures)

    def test_wrong_ack_offset_fails_owner_parity(self):
        bad = mutate("replay_preserves_original",
            lambda v: v["outcome"].update({"acknowledgement_frame_offset": 0}))
        failures = GATE.structural_failures(bad, str(OWNER_STAGED), str(SEMANTICS_STAGED))
        self.assertFalse(any(failure.startswith("genuine_outcome:") for failure in failures), failures)
        self.assertIn("owner_semantic:command_acknowledgement_frame_parity", failures)

    def test_wrong_same_frame_flag_fails_owner_parity(self):
        bad = mutate("git_success_with_work",
            lambda v: v["outcome"].update({"same_frame_acknowledged": False}))
        failures = GATE.structural_failures(bad, str(OWNER_STAGED), str(SEMANTICS_STAGED))
        self.assertFalse(any(failure.startswith("genuine_outcome:") for failure in failures), failures)
        self.assertIn("owner_semantic:command_acknowledgement_frame_parity", failures)

    def test_absent_acknowledgement_stays_valid(self):
        failures = GATE.structural_failures(CASES["pending_admission"], str(OWNER_STAGED), str(SEMANTICS_STAGED))
        self.assertEqual(failures, [])

    def test_response_outcome_ref_binding(self):
        value = mutate("git_success_with_work",
            lambda v: v["response"].update({"command_outcome_ref": "outcome:foreign"}))
        self.assertEqual(GATE.structural_failures(value, str(OWNER_STAGED), str(SEMANTICS_STAGED)), [])
        self.assertEqual(GATE.bundle_semantic_failures(value), [])
        selected = PACK["selected_outcome_refs"]["git_success_with_work"]
        self.assertEqual(GATE.binding_failures(value, selected, str(SEMANTICS_STAGED)),
                         ["owner_binding:command_outcome_reference_mismatch"])


class PairwiseConcurrencyTests(unittest.TestCase):
    def test_serialized_publications_pass(self):
        first = CASES["git_success_with_work"]
        second = CASES["post_swap_unknown_settlement"]
        self.assertEqual(GATE.pairwise_concurrency_failures(first, second), [])

    def test_double_publish_off_same_prior_fails(self):
        first = CASES["git_success_with_work"]
        second = copy.deepcopy(CASES["post_swap_unknown_settlement"])
        second["publication"].update({"prior_generation": 6, "built_generation": 7})
        self.assertEqual(GATE.pairwise_concurrency_failures(first, second), ["single_writer_violated"])

    def test_shared_receipt_across_originals_fails(self):
        first = CASES["git_success_with_work"]
        second = copy.deepcopy(CASES["blocked_unavailable"])
        second["receipt"].update({"receipt_ref": first["receipt"]["receipt_ref"]})
        self.assertIn("receipt_shared_across_originals",
                      GATE.pairwise_concurrency_failures(first, second))

    def test_distinct_projects_are_independent(self):
        self.assertEqual(GATE.pairwise_concurrency_failures(
            CASES["git_success_with_work"], CASES["nongit_success_no_work"]), [])

    def test_blocked_second_original_is_allowed_latitude(self):
        self.assertEqual(GATE.pairwise_concurrency_failures(
            CASES["git_success_with_work"], CASES["blocked_unavailable"]), [])


class CLIExitTests(unittest.TestCase):
    def test_cli_exit_zero_on_valid_pack(self):
        with patch("sys.stdout"):
            self.assertEqual(GATE.main(["pm_search_rebuild_typed.py", str(OWNER_STAGED), str(SEMANTICS_STAGED)]), 0)

    def test_cli_exit_nonzero_on_failure(self):
        bad = mutate("git_success_with_work",
            lambda v: v["outcome"].update({"dispatch_frame_id": "frame:rebuild:foreign"}))
        with patch("sys.stdout"), patch.object(GATE, "fixtures", return_value={"valid": [bad]}):
            self.assertEqual(GATE.main(["pm_search_rebuild_typed.py", str(OWNER_STAGED), str(SEMANTICS_STAGED)]), 1)

    def test_cli_exit_nonzero_on_interop_failure(self):
        bad = mutate("git_success_with_work",
            lambda v: v["outcome"].update({"payload_sha256": "9" * 64}))
        with patch("sys.stdout"), patch.object(GATE, "fixtures", return_value={"valid": [bad]}):
            self.assertEqual(GATE.main(["pm_search_rebuild_typed.py", str(OWNER_STAGED), str(SEMANTICS_STAGED)]), 1)

    def test_cli_exit_nonzero_on_unresolved_owner_schema(self):
        with patch("sys.stdout"):
            self.assertEqual(GATE.main(["pm_search_rebuild_typed.py", "/nonexistent/owner.json"]), 1)


if __name__ == "__main__":
    unittest.main()
