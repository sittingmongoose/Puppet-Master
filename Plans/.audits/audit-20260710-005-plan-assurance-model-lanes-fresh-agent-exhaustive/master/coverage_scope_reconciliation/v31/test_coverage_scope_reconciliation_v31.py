#!/usr/bin/env python3
"""Strong mutation suite for the Audit005 V31 coverage reconciliation."""

from __future__ import annotations

import copy
import hashlib
import json
from collections import Counter
from typing import Any, Callable

import verify_coverage_scope_reconciliation_v31 as verifier


Mutation = Callable[[dict[str, Any]], None]


def set_path(path: tuple[Any, ...], value: Any) -> Mutation:
    def mutate(bundle: dict[str, Any]) -> None:
        cursor: Any = bundle
        for part in path[:-1]:
            cursor = cursor[part]
        cursor[path[-1]] = value

    return mutate


def swap_scopes(bundle: dict[str, Any]) -> None:
    bundle["report"]["scopes"][0], bundle["report"]["scopes"][1] = (
        bundle["report"]["scopes"][1],
        bundle["report"]["scopes"][0],
    )


def remove_first_blocker(bundle: dict[str, Any]) -> None:
    bundle["report"]["scopes"][2]["blockers"] = bundle["report"]["scopes"][2]["blockers"][1:]


def duplicate_quarantine(bundle: dict[str, Any]) -> None:
    ids = bundle["report"]["scopes"][1]["quarantines"]["assignment_ids"]
    ids[-1] = ids[0]


def add_unknown_report_key(bundle: dict[str, Any]) -> None:
    bundle["report"]["unexpected_authority"] = True


CASES: list[tuple[str, str, Mutation]] = [
    ("report-status", "report-status", set_path(("report", "status"), "PASS")),
    ("report-append-only", "report-append-only", set_path(("report", "append_only"), False)),
    ("report-prior-mutation", "report-prior-artifact-mutation", set_path(("report", "prior_artifacts_mutated"), True)),
    ("report-unknown-key", "schema:", add_unknown_report_key),
    ("policy-current-ref", "policy-current-ref", set_path(("report", "policy_binding", "current_policy_ref"), "master/coordination/CONCURRENCY_POLICY_V31.json")),
    ("policy-current-sha", "policy-current-sha", set_path(("report", "policy_binding", "current_policy_sha256"), "0" * 64)),
    ("policy-prior-ref", "policy-prior-ref", set_path(("report", "policy_binding", "prior_policy_ref"), "master/coordination/CONCURRENCY_POLICY_V30.json")),
    ("policy-prior-sha", "policy-prior-sha", set_path(("report", "policy_binding", "prior_policy_sha256"), "0" * 64)),
    ("policy-prior-mutated", "policy-prior-mutated", set_path(("report", "policy_binding", "prior_policy_mutated"), True)),
    ("policy-credit-gate", "policy-credit-gate", set_path(("report", "policy_binding", "candidate_credit_zero_until_primary_and_fresh_independent_checkpoint"), False)),
    ("policy-canonical-write", "policy-canonical-write", set_path(("report", "policy_binding", "live_canonical_plan_edits_authorized"), True)),
    ("shared-source-sha", "shared-source-sha", set_path(("report", "shared_frozen_universe", "source_scope", "sha256"), "0" * 64)),
    ("shared-source-rows", "shared-source-rows", set_path(("report", "shared_frozen_universe", "source_scope", "row_count"), 134)),
    ("shared-source-bytes", "shared-source-bytes", set_path(("report", "shared_frozen_universe", "source_scope", "byte_count"), 81723)),
    ("shared-source-copies", "shared-source-copy-count", set_path(("report", "shared_frozen_universe", "source_scope", "stable_copy_count"), 16)),
    ("shared-window-sha", "shared-window-manifest-sha", set_path(("report", "shared_frozen_universe", "window_universe", "manifest_sha256"), "0" * 64)),
    ("shared-window-count", "shared-window-count", set_path(("report", "shared_frozen_universe", "window_universe", "window_count"), 1268)),
    ("shared-window-digest", "shared-window-id-digest", set_path(("report", "shared_frozen_universe", "window_universe", "window_ids_digest"), "0" * 64)),
    ("scope-order", "scope-order", swap_scopes),
    ("legacy-status", "legacy-status", set_path(("report", "scopes", 0, "status"), "COMPLETE")),
    ("legacy-coverage-unit", "legacy-coverage-unit", set_path(("report", "scopes", 0, "coverage_unit"), "micro_window")),
    ("legacy-pointer-ref", "legacy-pointer-ref", set_path(("report", "scopes", 0, "coverage_pointer", "ref"), "master/macro/live/ACTIVE.json")),
    ("legacy-pointer-sha", "legacy-pointer-sha", set_path(("report", "scopes", 0, "coverage_pointer", "sha256"), "0" * 64)),
    ("legacy-registry-sha", "legacy-registry-sha", set_path(("report", "scopes", 0, "credited_registry", "sha256"), "0" * 64)),
    ("legacy-registry-digest", "legacy-registry-digest", set_path(("report", "scopes", 0, "credited_registry", "credited_assignment_ids_digest"), "0" * 64)),
    ("legacy-validation-status", "legacy-validation-status", set_path(("report", "scopes", 0, "validation", "status"), "fail")),
    ("legacy-verifier-complete", "legacy-verifier-complete", set_path(("report", "scopes", 0, "validation", "verifier_expected_complete"), True)),
    ("legacy-total", "legacy-total", set_path(("report", "scopes", 0, "counts", "total_role_assignments"), 2537)),
    ("legacy-credited", "legacy-credited", set_path(("report", "scopes", 0, "counts", "credited_role_assignments"), 64)),
    ("legacy-pending", "legacy-pending", set_path(("report", "scopes", 0, "counts", "pending_role_assignments"), 2474)),
    ("legacy-blocked", "legacy-blocked", set_path(("report", "scopes", 0, "counts", "blocked_role_assignments"), 1)),
    ("legacy-credited-windows", "legacy-credited-windows", set_path(("report", "scopes", 0, "counts", "credited_unique_windows"), 31)),
    ("legacy-dual", "legacy-dual", set_path(("report", "scopes", 0, "counts", "fully_dual_reviewed_windows"), 32)),
    ("legacy-unpaired-count", "legacy-unpaired-count", set_path(("report", "scopes", 0, "counts", "unpaired_credited_windows"), 0)),
    ("legacy-exact-role", "legacy-exact-role", set_path(("report", "scopes", 0, "roles", "exact_behavior", "credited"), 31)),
    ("legacy-adversarial-role", "legacy-adversarial-role", set_path(("report", "scopes", 0, "roles", "adversarial_negative_space", "credited"), 32)),
    ("legacy-unpaired-assignment", "legacy-unpaired-assignment", set_path(("report", "scopes", 0, "unpaired_credit", "assignment_id"), "A005-WRONG")),
    ("legacy-unpaired-window", "legacy-unpaired-window", set_path(("report", "scopes", 0, "unpaired_credit", "window_id"), "WIN-WRONG")),
    ("legacy-unpaired-role", "legacy-unpaired-role", set_path(("report", "scopes", 0, "unpaired_credit", "role"), "adversarial_negative_space")),
    ("legacy-unpaired-seeded", "legacy-unpaired-seeded", set_path(("report", "scopes", 0, "unpaired_credit", "seeded_into_macro_coverage"), True)),
    ("legacy-seed-count", "legacy-seed-count", set_path(("report", "scopes", 0, "macro_seed", "seeded_window_count"), 32)),
    ("legacy-seed-basis", "legacy-seed-basis", set_path(("report", "scopes", 0, "macro_seed", "basis"), "all_credited_roles")),
    ("legacy-producer-complete", "legacy-producer-complete", set_path(("report", "scopes", 0, "completion", "producer_complete"), True)),
    ("legacy-completion-verifier", "legacy-completion-verifier", set_path(("report", "scopes", 0, "completion", "verifier_expected_complete"), True)),
    ("legacy-reconciliation-complete", "legacy-reconciliation-complete", set_path(("report", "scopes", 0, "completion", "reconciliation_complete"), True)),
    ("legacy-activation", "legacy-activation", set_path(("report", "scopes", 0, "new_activation_authorized"), True)),
    ("legacy-new-credit", "legacy-new-credit", set_path(("report", "scopes", 0, "new_coverage_credit_granted"), 1)),
    ("legacy-canonical-write", "legacy-canonical-write", set_path(("report", "scopes", 0, "canonical_plan_writes_authorized"), True)),
    ("macro-status", "macro-status", set_path(("report", "scopes", 1, "status"), "COMPLETE_ALL_HEADS")),
    ("macro-coverage-unit", "macro-coverage-unit", set_path(("report", "scopes", 1, "coverage_unit"), "role_assignment")),
    ("macro-migration-sha", "macro-migration-sha", set_path(("report", "scopes", 1, "migration", "sha256"), "0" * 64)),
    ("macro-migration-status", "macro-migration-status", set_path(("report", "scopes", 1, "migration", "status"), "REPLACE_OLD_LINEAGE")),
    ("macro-old-coverage-ref", "macro-old-coverage-ref", set_path(("report", "scopes", 1, "migration", "old_coverage_ref"), "master/macro/live/ACTIVE.json")),
    ("macro-old-coverage-sha", "macro-old-coverage-sha", set_path(("report", "scopes", 1, "migration", "old_coverage_sha256"), "0" * 64)),
    ("macro-old-credits", "macro-old-credits", set_path(("report", "scopes", 1, "migration", "old_assignment_credits_preserved"), 0)),
    ("macro-old-dual-seed", "macro-old-dual-seed", set_path(("report", "scopes", 1, "migration", "old_fully_dual_reviewed_windows_seeded"), 32)),
    ("macro-active-sha", "macro-active-sha", set_path(("report", "scopes", 1, "active_pointer", "sha256"), "0" * 64)),
    ("macro-active-batch", "macro-active-batch", set_path(("report", "scopes", 1, "active_pointer", "batch_id"), "macro-batch-0011")),
    ("macro-active-coverage-sha", "macro-active-coverage-sha", set_path(("report", "scopes", 1, "active_pointer", "coverage_sha256"), "0" * 64)),
    ("macro-active-commit-sha", "macro-active-commit-sha", set_path(("report", "scopes", 1, "active_pointer", "transaction_commit_sha256"), "0" * 64)),
    ("macro-prior-pointer-sha", "macro-prior-pointer-sha", set_path(("report", "scopes", 1, "prior_active_pointer_lineage", "historical_sha256"), "0" * 64)),
    ("macro-prior-pointer-batch", "macro-prior-pointer-batch", set_path(("report", "scopes", 1, "prior_active_pointer_lineage", "historical_batch_id"), "macro-batch-0012")),
    ("macro-complete", "macro-complete", set_path(("report", "scopes", 1, "coverage", "complete"), False)),
    ("macro-total-windows", "macro-total-windows", set_path(("report", "scopes", 1, "coverage", "micro_window_total"), 1268)),
    ("macro-covered-windows", "macro-covered-windows", set_path(("report", "scopes", 1, "coverage", "covered_micro_windows"), 1268)),
    ("macro-pending-windows", "macro-pending-windows", set_path(("report", "scopes", 1, "coverage", "pending_micro_windows"), 1)),
    ("macro-seeded-windows", "macro-seeded-windows", set_path(("report", "scopes", 1, "coverage", "seeded_micro_windows"), 32)),
    ("macro-credited-windows", "macro-credited-windows", set_path(("report", "scopes", 1, "coverage", "macro_credited_micro_windows"), 1237)),
    ("macro-assignment-total", "macro-assignment-total", set_path(("report", "scopes", 1, "coverage", "macro_assignment_total"), 255)),
    ("macro-credited-assignments", "macro-credited-assignments", set_path(("report", "scopes", 1, "coverage", "credited_macro_assignments"), 255)),
    ("macro-transaction-count", "macro-transaction-count", set_path(("report", "scopes", 1, "coverage", "transaction_count"), 11)),
    ("macro-quarantine-count", "macro-quarantine-count", set_path(("report", "scopes", 1, "coverage", "quarantined_attempts"), 5)),
    ("macro-window-digest", "macro-window-digest", set_path(("report", "scopes", 1, "coverage", "covered_window_ids_digest"), "0" * 64)),
    ("macro-assignment-digest", "macro-assignment-digest", set_path(("report", "scopes", 1, "coverage", "credited_assignment_ids_digest"), "0" * 64)),
    ("macro-checkpoint-sha", "macro-checkpoint-sha", set_path(("report", "scopes", 1, "independent_checkpoint", "sha256"), "0" * 64)),
    ("macro-checkpoint-status", "macro-checkpoint-status", set_path(("report", "scopes", 1, "independent_checkpoint", "status"), "fail")),
    ("macro-quarantines-count", "macro-quarantines-count", set_path(("report", "scopes", 1, "quarantines", "count"), 5)),
    ("macro-quarantine-credit", "macro-quarantine-credit", set_path(("report", "scopes", 1, "quarantines", "coverage_credit_each"), 1)),
    ("macro-quarantine-ids", "macro-quarantine-ids", duplicate_quarantine),
    ("macro-completion-scope", "macro-completion-scope", set_path(("report", "scopes", 1, "completion", "applies_only_to"), "current_live_head")),
    ("macro-completion-propagation", "macro-completion-propagation", set_path(("report", "scopes", 1, "completion", "propagates_to_current_live_head"), True)),
    ("macro-activation", "macro-activation", set_path(("report", "scopes", 1, "new_activation_authorized"), True)),
    ("macro-new-credit", "macro-new-credit", set_path(("report", "scopes", 1, "new_coverage_credit_granted"), 1)),
    ("macro-canonical-write", "macro-canonical-write", set_path(("report", "scopes", 1, "canonical_plan_writes_authorized"), True)),
    ("live-status", "live-status", set_path(("report", "scopes", 2, "status"), "COMPLETE")),
    ("live-baseline", "live-baseline", set_path(("report", "scopes", 2, "baseline_scope"), "legacy_role_assignment_lineage")),
    ("live-source-sha", "live-source-sha", set_path(("report", "scopes", 2, "source_scope_binding", "source_scope_sha256"), "0" * 64)),
    ("live-binding-sha", "live-binding-sha", set_path(("report", "scopes", 2, "source_scope_binding", "binding_sha256"), "0" * 64)),
    ("live-binding-receipt-sha", "live-binding-receipt-sha", set_path(("report", "scopes", 2, "source_scope_binding", "receipt_sha256"), "0" * 64)),
    ("live-predecessor-sha", "live-predecessor-sha", set_path(("report", "scopes", 2, "preserved_predecessor_failure", "prepare_sha256"), "0" * 64)),
    ("live-predecessor-modified", "live-predecessor-modified", set_path(("report", "scopes", 2, "preserved_predecessor_failure", "modified"), True)),
    ("live-predecessor-executed", "live-predecessor-executed", set_path(("report", "scopes", 2, "preserved_predecessor_failure", "executed"), True)),
    ("live-candidate-file-count", "live-candidate-file-count", set_path(("report", "scopes", 2, "candidate_scope", "modified_file_count"), 14)),
    ("live-settled", "live-settled", set_path(("report", "scopes", 2, "candidate_scope", "settled"), True)),
    ("live-settlement-ref", "live-settlement-ref", set_path(("report", "scopes", 2, "candidate_scope", "settlement_authority_ref"), "fake.json")),
    ("live-settlement-sha", "live-settlement-sha", set_path(("report", "scopes", 2, "candidate_scope", "settlement_authority_sha256"), "0" * 64)),
    ("live-packet-ref", "live-packet-ref", set_path(("report", "scopes", 2, "candidate_scope", "semantic_packet_manifest_ref"), "fake.jsonl")),
    ("live-prelaunch-present", "live-prelaunch-present", set_path(("report", "scopes", 2, "independent_gates", "fresh_luna_prelaunch_present"), True)),
    ("live-prelaunch-ref", "live-prelaunch-ref", set_path(("report", "scopes", 2, "independent_gates", "fresh_luna_prelaunch_ref"), "fake.json")),
    ("live-postrun-present", "live-postrun-present", set_path(("report", "scopes", 2, "independent_gates", "independent_postrun_checkpoint_present"), True)),
    ("live-postrun-ref", "live-postrun-ref", set_path(("report", "scopes", 2, "independent_gates", "independent_postrun_checkpoint_ref"), "fake.json")),
    ("live-blockers", "live-blockers", remove_first_blocker),
    ("live-complete", "live-complete", set_path(("report", "scopes", 2, "complete"), True)),
    ("live-activation", "live-activation", set_path(("report", "scopes", 2, "new_activation_authorized"), True)),
    ("live-new-credit", "live-new-credit", set_path(("report", "scopes", 2, "new_coverage_credit_granted"), 1)),
    ("live-canonical-write", "live-canonical-write", set_path(("report", "scopes", 2, "canonical_plan_writes_authorized"), True)),
    ("live-zero-state", "live-zero-state", set_path(("report", "scopes", 2, "zero_state", "results"), 1)),
    ("guard-all-complete", "guard-all-complete", set_path(("report", "guardrails", "all_scopes_complete"), True)),
    ("guard-macro-complete", "guard-macro-complete", set_path(("report", "guardrails", "frozen_macro_complete"), False)),
    ("guard-live-complete", "guard-live-complete", set_path(("report", "guardrails", "current_live_head_complete"), True)),
    ("guard-propagation", "guard-propagation", set_path(("report", "guardrails", "macro_complete_propagates_to_current_live_head"), True)),
    ("guard-frozen-boundary", "guard-frozen-boundary", set_path(("report", "guardrails", "frozen_macro_complete_does_not_certify_current_live_head"), False)),
    ("guard-activation", "guard-activation", set_path(("report", "guardrails", "activation_authorized"), True)),
    ("guard-credit", "guard-credit", set_path(("report", "guardrails", "coverage_credit_granted"), 1)),
    ("guard-canonical-write", "guard-canonical-write", set_path(("report", "guardrails", "canonical_plan_writes_authorized"), True)),
    ("guard-prior-pointer", "guard-prior-pointer-mutation", set_path(("report", "guardrails", "prior_pointers_mutated"), True)),
    ("pointer-policy-sha", "pointer-policy-sha", set_path(("pointer", "current_policy_sha256"), "0" * 64)),
    ("pointer-live-complete", "pointer-live-complete", set_path(("pointer", "current_live_head_complete"), True)),
    ("pointer-propagation", "pointer-propagation", set_path(("pointer", "macro_complete_propagates_to_current_live_head"), True)),
    ("pointer-activation", "pointer-activation", set_path(("pointer", "activation_authorized"), True)),
    ("pointer-credit", "pointer-credit", set_path(("pointer", "coverage_credit_granted"), 1)),
    ("pointer-canonical-write", "pointer-canonical-write", set_path(("pointer", "canonical_plan_writes_authorized"), True)),
    ("authority-policy-sha", "authority-policy-sha", set_path(("authority", "current_policy", "sha256"), "0" * 64)),
    ("authority-legacy-pointer", "authority-legacy-pointer-sha", set_path(("authority", "protected_inputs", "legacy_coverage_snapshot", "sha256"), "0" * 64)),
    ("authority-macro-pointer", "authority-macro-pointer-sha", set_path(("authority", "protected_inputs", "macro_active_pointer", "sha256"), "0" * 64)),
    ("authority-old-pointer-mutation", "authority-old-pointer-mutation", set_path(("authority", "preservation", "old_pointer_mutation_authorized"), True)),
    ("authority-old-pointer-observed", "authority-old-pointer-observed", set_path(("authority", "preservation", "old_pointer_mutation_observed"), True)),
    ("authority-activation", "authority-activation", set_path(("authority", "permissions", "activation_authorized"), True)),
    ("authority-credit", "authority-credit", set_path(("authority", "permissions", "coverage_credit_granted"), 1)),
    ("authority-canonical-write", "authority-canonical-write", set_path(("authority", "permissions", "canonical_plan_writes_authorized"), True)),
    ("authority-packet-generation", "authority-packet-generation", set_path(("authority", "permissions", "semantic_packet_generation_authorized"), True)),
    ("readiness-status", "readiness-status", set_path(("readiness", "status"), "READY")),
    ("readiness-legacy", "readiness-legacy", set_path(("readiness", "scope_readiness", "legacy_lineage_valid"), False)),
    ("readiness-macro", "readiness-macro", set_path(("readiness", "scope_readiness", "frozen_macro_scope_complete"), False)),
    ("readiness-live", "readiness-live", set_path(("readiness", "scope_readiness", "current_live_head_ready"), True)),
    ("readiness-activation", "readiness-activation", set_path(("readiness", "scope_readiness", "activation_ready"), True)),
    ("readiness-credit", "readiness-credit", set_path(("readiness", "scope_readiness", "credit_ready"), True)),
    ("readiness-zero-state", "readiness-zero-state", set_path(("readiness", "zero_state", "credit"), 1)),
    ("readiness-canonical-write", "readiness-canonical-write", set_path(("readiness", "canonical_plan_writes_authorized"), True)),
]


def main() -> None:
    base = verifier.load_bundle()
    outcomes: list[dict[str, Any]] = []

    baseline_errors = verifier.validate_bundle(base)
    outcomes.append(
        {
            "name": "positive-typed-bundle",
            "passed": not baseline_errors,
            "errors": baseline_errors,
        }
    )

    live_report = verifier.verify()
    outcomes.append(
        {
            "name": "positive-live-reconstruction",
            "passed": live_report["verification_status"] == "pass",
            "errors": live_report["errors"],
        }
    )

    for name, expected_token, mutation in CASES:
        candidate = copy.deepcopy(base)
        mutation(candidate)
        errors = verifier.validate_bundle(candidate)
        passed = any(expected_token in error for error in errors)
        outcomes.append(
            {
                "name": name,
                "passed": passed,
                "expected_token": expected_token,
                "observed_error_count": len(errors),
                "errors": [] if passed else errors,
            }
        )

    failed = [row for row in outcomes if not row["passed"]]
    categories = Counter(row["name"].split("-", 1)[0] for row in outcomes)
    digest_material = "".join(
        f"{row['name']}\t{'pass' if row['passed'] else 'fail'}\n" for row in outcomes
    ).encode()
    report = {
        "status": "pass" if not failed else "fail_closed",
        "control_status": verifier.BLOCKED,
        "passed": len(outcomes) - len(failed),
        "total": len(outcomes),
        "failed": len(failed),
        "mutation_case_count": len(CASES),
        "categories": dict(sorted(categories.items())),
        "test_digest": hashlib.sha256(digest_material).hexdigest(),
        "failures": failed,
        "macro_complete_propagates_to_current_live_head": False,
        "activation_authorized": False,
        "coverage_credit_granted": 0,
        "canonical_plan_writes_authorized": False,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" and report["mutation_case_count"] >= 100 else 1)


if __name__ == "__main__":
    main()
