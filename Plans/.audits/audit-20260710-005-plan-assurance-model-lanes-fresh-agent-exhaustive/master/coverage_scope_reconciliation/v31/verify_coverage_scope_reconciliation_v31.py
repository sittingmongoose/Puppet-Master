#!/usr/bin/env python3
"""Fail-closed verification for the Audit005 V31 typed coverage reconciliation."""

from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator


BASE = Path(__file__).resolve().parent
AUDIT = BASE.parents[2]
AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
RECONCILIATION_ID = "coverage-scope-reconciliation-v31-0001"
BLOCKED = "BLOCKED_AWAITING_SETTLED_FINAL_DELTA_AND_FRESH_INDEPENDENT_CHECKPOINT"
SOURCE_SCOPE_SHA = "963911b952c3909c9012ed25a35151719b4f3f18b173cc6fffc8bbc1036e4e46"
WINDOW_MANIFEST_SHA = "90ee1d111f476141c1661c0077e65ab6127af3d07aca57f649eca78416782539"
WINDOW_IDS_DIGEST = "b5cf028b0135d0d58e0b039b23e0f00b7da0a8ed606fc5e37d44148d3d5de4c3"
LEGACY_COVERAGE_SHA = "90de30e60f5314fb8db5eb66f3326138686021f1c06b321003700be10b0463ec"
LEGACY_REGISTRY_SHA = "eef8ebf279618c421691942b96abf5e647d12dc0e8bc99162f7146eaf4943304"
LEGACY_REGISTRY_DIGEST = "c3d724a72f705f975181ab855b6ceb97aa306318af2b5d551b46af6a3a17ab3b"
MIGRATION_SHA = "21d89827f26225a3c87320f80c5ac55c962890c7eb5e3a66ce7d062e3776ce45"
ACTIVE_POINTER_SHA = "a2b2365d16f5dc7c53f1a87a8a515010a25bd5cc52b7ed548f9ec9c67bc007dc"
PRIOR_ACTIVE_POINTER_SHA = "e13087420a4b6e1e71e66c7a08e2629004b7e7fc5561ac16785109c028e3bf0c"
MACRO_COVERAGE_SHA = "200d4f9ce29f35a4c29c45d056f8541e91a9cbcdd2a84e294330489981ee93f4"
MACRO_COMMIT_SHA = "539fd17bbf0951e07628b74726e960c17dc8abdb4d533b29d2d0d7f765851406"
MACRO_CHECKPOINT_SHA = "ec065ba2cae0f85867d8d7fe26f2bbe01f6a4481a4b348eb9b12105242feb311"
MACRO_ASSIGNMENT_DIGEST = "ad778630157f7d56841c8f98c8cd90577ec0bf39f924ddae319a1e82e4b157ca"
BINDING_SHA = "8484922e0f96633378af3fc32dfc973dbaffd6812acbb0f5aed2d25bcd60e00e"
BINDING_RECEIPT_SHA = "cf8e02f95c2cf3f495ba443bb7856609ef4a5573fee9bb70b3577a61ca9877a0"
PREPARE_SHA = "8cc057cdb4b7a187fde315e72aee10e565459e7fd6911d2d10db67dd13fc904b"
V31_POLICY_SHA = "95de3fd798c857751cc6b031d62a4a7a40abe931f9fa1e49590cff0fec6257b5"
V32_POLICY_SHA = "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed"
UNPAIRED_ASSIGNMENT = "A005-001053-EXACT-WIN-74C788D8A63C-0004"
UNPAIRED_WINDOW = "WIN-74C788D8A63C-0004"
EXPECTED_SCOPE_ORDER = [
    "legacy_role_assignment_lineage",
    "frozen_macro_micro_window_coverage",
    "current_live_head_delta",
]
EXPECTED_BLOCKERS = [
    "settled_final_delta_manifest_missing",
    "fresh_independent_luna_prelaunch_missing",
    "independent_postrun_checkpoint_missing",
]
EXPECTED_QUARANTINES = [
    "A005M-000015-INTEGRATED-MACRO-BCDD1AE883C0-0002",
    "A005M-000044-INTEGRATED-MACRO-AC612DBB4EFE-0002",
    "A005M-000064-INTEGRATED-MACRO-C45446C7AC96-0001",
    "A005M-000210-INTEGRATED-MACRO-ECB10B16CAAF-0001",
    "A005M15-000039-INTEGRATED-MACRO15-AC612DBB4EFE-0002",
    "A005M15-000110-INTEGRATED-MACRO15-74C788D8A63C-0002",
]
ZERO_STATE = {
    "activation": 0,
    "semantic_packets": 0,
    "launches": 0,
    "results": 0,
    "receipts": 0,
    "capture": 0,
    "credit": 0,
}


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def sha_file(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def load_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"object required: {path}")
    return value


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        value = json.loads(line)
        if not isinstance(value, dict):
            raise ValueError(f"object row required: {path}:{line_number}")
        rows.append(value)
    return rows


def resolve(ref: str) -> Path:
    path = AUDIT / ref
    if AUDIT not in path.resolve().parents:
        raise ValueError(f"reference escapes audit root: {ref}")
    return path


def load_bundle() -> dict[str, Any]:
    return {
        "report": load_json(BASE / "coverage_scope_report.json"),
        "pointer": load_json(BASE / "pointer.json"),
        "authority": load_json(BASE / "authority.json"),
        "readiness": load_json(BASE / "readiness.json"),
        "schema": load_json(BASE / "schemas/coverage_scope_reconciliation_v31.schema.json"),
    }


def validate_bundle(bundle: dict[str, Any]) -> list[str]:
    """Validate the typed documents without rereading protected inputs."""
    errors: list[str] = []

    def require(condition: bool, label: str) -> None:
        if not condition:
            errors.append(label)

    report = bundle.get("report", {})
    pointer = bundle.get("pointer", {})
    authority = bundle.get("authority", {})
    readiness = bundle.get("readiness", {})
    schema = bundle.get("schema", {})

    try:
        Draft202012Validator.check_schema(schema)
        schema_errors = sorted(
            Draft202012Validator(schema).iter_errors(report),
            key=lambda item: [str(part) for part in item.absolute_path],
        )
        errors.extend(
            "schema:" + "/".join(str(part) for part in item.absolute_path) + ":" + item.validator
            for item in schema_errors
        )
    except Exception as exc:
        errors.append(f"schema-engine:{type(exc).__name__}:{exc}")

    require(report.get("audit_id") == AUDIT_ID, "report-audit-id")
    require(report.get("reconciliation_id") == RECONCILIATION_ID, "report-reconciliation-id")
    require(report.get("status") == BLOCKED, "report-status")
    require(report.get("append_only") is True, "report-append-only")
    require(report.get("prior_artifacts_mutated") is False, "report-prior-artifact-mutation")

    policy = report.get("policy_binding", {})
    require(policy.get("current_policy_ref") == "master/coordination/CONCURRENCY_POLICY_V32.json", "policy-current-ref")
    require(policy.get("current_policy_sha256") == V32_POLICY_SHA, "policy-current-sha")
    require(policy.get("prior_policy_ref") == "master/coordination/CONCURRENCY_POLICY_V31.json", "policy-prior-ref")
    require(policy.get("prior_policy_sha256") == V31_POLICY_SHA, "policy-prior-sha")
    require(policy.get("supersession_mode") == "prospective_append_only", "policy-supersession")
    require(policy.get("prior_policy_mutated") is False, "policy-prior-mutated")
    require(policy.get("candidate_credit_zero_until_primary_and_fresh_independent_checkpoint") is True, "policy-credit-gate")
    require(policy.get("live_canonical_plan_edits_authorized") is False, "policy-canonical-write")

    shared = report.get("shared_frozen_universe", {})
    source = shared.get("source_scope", {})
    windows = shared.get("window_universe", {})
    require(source.get("sha256") == SOURCE_SCOPE_SHA, "shared-source-sha")
    require(source.get("row_count") == 135, "shared-source-rows")
    require(source.get("byte_count") == 81724, "shared-source-bytes")
    require(source.get("stable_copy_count") == 17, "shared-source-copy-count")
    require(windows.get("manifest_sha256") == WINDOW_MANIFEST_SHA, "shared-window-manifest-sha")
    require(windows.get("window_count") == 1269, "shared-window-count")
    require(windows.get("window_ids_digest") == WINDOW_IDS_DIGEST, "shared-window-id-digest")

    scopes = report.get("scopes", [])
    require(isinstance(scopes, list) and len(scopes) == 3, "scope-count")
    if not isinstance(scopes, list) or len(scopes) != 3:
        return sorted(set(errors))
    require([scope.get("scope_type") for scope in scopes] == EXPECTED_SCOPE_ORDER, "scope-order")
    legacy, macro, live = scopes

    require(legacy.get("status") == "VALIDATED_INCOMPLETE_PRESERVED_LINEAGE", "legacy-status")
    require(legacy.get("coverage_unit") == "role_assignment", "legacy-coverage-unit")
    require(legacy.get("coverage_pointer", {}).get("ref") == "master/live/coverage_state.snapshot-0015.json", "legacy-pointer-ref")
    require(legacy.get("coverage_pointer", {}).get("sha256") == LEGACY_COVERAGE_SHA, "legacy-pointer-sha")
    require(legacy.get("credited_registry", {}).get("sha256") == LEGACY_REGISTRY_SHA, "legacy-registry-sha")
    require(legacy.get("credited_registry", {}).get("credited_assignment_ids_digest") == LEGACY_REGISTRY_DIGEST, "legacy-registry-digest")
    require(legacy.get("validation", {}).get("status") == "pass", "legacy-validation-status")
    require(legacy.get("validation", {}).get("verifier_expected_complete") is False, "legacy-verifier-complete")
    legacy_counts = legacy.get("counts", {})
    require(legacy_counts.get("total_role_assignments") == 2538, "legacy-total")
    require(legacy_counts.get("credited_role_assignments") == 63, "legacy-credited")
    require(legacy_counts.get("pending_role_assignments") == 2475, "legacy-pending")
    require(legacy_counts.get("blocked_role_assignments") == 0, "legacy-blocked")
    require(legacy_counts.get("credited_unique_windows") == 32, "legacy-credited-windows")
    require(legacy_counts.get("fully_dual_reviewed_windows") == 31, "legacy-dual")
    require(legacy_counts.get("unpaired_credited_windows") == 1, "legacy-unpaired-count")
    require(legacy.get("roles", {}).get("exact_behavior") == {"total": 1269, "credited": 32}, "legacy-exact-role")
    require(legacy.get("roles", {}).get("adversarial_negative_space") == {"total": 1269, "credited": 31}, "legacy-adversarial-role")
    unpaired = legacy.get("unpaired_credit", {})
    require(unpaired.get("assignment_id") == UNPAIRED_ASSIGNMENT, "legacy-unpaired-assignment")
    require(unpaired.get("window_id") == UNPAIRED_WINDOW, "legacy-unpaired-window")
    require(unpaired.get("role") == "exact_behavior", "legacy-unpaired-role")
    require(unpaired.get("seeded_into_macro_coverage") is False, "legacy-unpaired-seeded")
    require(legacy.get("macro_seed", {}).get("seeded_window_count") == 31, "legacy-seed-count")
    require(legacy.get("macro_seed", {}).get("basis") == "dual_validated_epoch_0013_roles", "legacy-seed-basis")
    legacy_completion = legacy.get("completion", {})
    require(legacy_completion.get("producer_complete") is False, "legacy-producer-complete")
    require(legacy_completion.get("verifier_expected_complete") is False, "legacy-completion-verifier")
    require(legacy_completion.get("reconciliation_complete") is False, "legacy-reconciliation-complete")
    require(legacy.get("new_activation_authorized") is False, "legacy-activation")
    require(legacy.get("new_coverage_credit_granted") == 0, "legacy-new-credit")
    require(legacy.get("canonical_plan_writes_authorized") is False, "legacy-canonical-write")

    require(macro.get("status") == "VALIDATED_COMPLETE_FROZEN_SCOPE_ONLY", "macro-status")
    require(macro.get("coverage_unit") == "canonical_structural_micro_window", "macro-coverage-unit")
    migration = macro.get("migration", {})
    require(migration.get("sha256") == MIGRATION_SHA, "macro-migration-sha")
    require(migration.get("status") == "PRESERVE_OLD_LINEAGE_REBASE_FUTURE_COVERAGE", "macro-migration-status")
    require(migration.get("old_coverage_ref") == "master/live/coverage_state.snapshot-0015.json", "macro-old-coverage-ref")
    require(migration.get("old_coverage_sha256") == LEGACY_COVERAGE_SHA, "macro-old-coverage-sha")
    require(migration.get("old_assignment_credits_preserved") == 63, "macro-old-credits")
    require(migration.get("old_fully_dual_reviewed_windows_seeded") == 31, "macro-old-dual-seed")
    active = macro.get("active_pointer", {})
    require(active.get("ref") == "master/macro/live/ACTIVE.json", "macro-active-ref")
    require(active.get("sha256") == ACTIVE_POINTER_SHA, "macro-active-sha")
    require(active.get("batch_id") == "macro-batch-0012", "macro-active-batch")
    require(active.get("coverage_sha256") == MACRO_COVERAGE_SHA, "macro-active-coverage-sha")
    require(active.get("transaction_commit_sha256") == MACRO_COMMIT_SHA, "macro-active-commit-sha")
    prior = macro.get("prior_active_pointer_lineage", {})
    require(prior.get("historical_sha256") == PRIOR_ACTIVE_POINTER_SHA, "macro-prior-pointer-sha")
    require(prior.get("historical_batch_id") == "macro-batch-0011", "macro-prior-pointer-batch")
    require(prior.get("hash_role") == "historical_content_hash_not_current_file_hash", "macro-prior-pointer-role")
    coverage = macro.get("coverage", {})
    require(coverage.get("complete") is True, "macro-complete")
    require(coverage.get("micro_window_total") == 1269, "macro-total-windows")
    require(coverage.get("covered_micro_windows") == 1269, "macro-covered-windows")
    require(coverage.get("pending_micro_windows") == 0, "macro-pending-windows")
    require(coverage.get("seeded_micro_windows") == 31, "macro-seeded-windows")
    require(coverage.get("macro_credited_micro_windows") == 1238, "macro-credited-windows")
    require(coverage.get("macro_assignment_total") == 256, "macro-assignment-total")
    require(coverage.get("credited_macro_assignments") == 256, "macro-credited-assignments")
    require(coverage.get("transaction_count") == 12, "macro-transaction-count")
    require(coverage.get("quarantined_attempts") == 6, "macro-quarantine-count")
    require(coverage.get("covered_window_ids_digest") == WINDOW_IDS_DIGEST, "macro-window-digest")
    require(coverage.get("credited_assignment_ids_digest") == MACRO_ASSIGNMENT_DIGEST, "macro-assignment-digest")
    checkpoint = macro.get("independent_checkpoint", {})
    require(checkpoint.get("sha256") == MACRO_CHECKPOINT_SHA, "macro-checkpoint-sha")
    require(checkpoint.get("status") == "pass", "macro-checkpoint-status")
    quarantines = macro.get("quarantines", {})
    require(quarantines.get("count") == 6, "macro-quarantines-count")
    require(quarantines.get("coverage_credit_each") == 0, "macro-quarantine-credit")
    require(quarantines.get("assignment_ids") == EXPECTED_QUARANTINES, "macro-quarantine-ids")
    macro_completion = macro.get("completion", {})
    require(macro_completion.get("complete") is True, "macro-completion-complete")
    require(macro_completion.get("applies_only_to") == "shared_frozen_1269_window_universe", "macro-completion-scope")
    require(macro_completion.get("propagates_to_current_live_head") is False, "macro-completion-propagation")
    require(macro.get("new_activation_authorized") is False, "macro-activation")
    require(macro.get("new_coverage_credit_granted") == 0, "macro-new-credit")
    require(macro.get("canonical_plan_writes_authorized") is False, "macro-canonical-write")

    require(live.get("status") == BLOCKED, "live-status")
    require(live.get("baseline_scope") == "frozen_macro_micro_window_coverage", "live-baseline")
    binding = live.get("source_scope_binding", {})
    require(binding.get("source_scope_sha256") == SOURCE_SCOPE_SHA, "live-source-sha")
    require(binding.get("binding_sha256") == BINDING_SHA, "live-binding-sha")
    require(binding.get("receipt_sha256") == BINDING_RECEIPT_SHA, "live-binding-receipt-sha")
    require(binding.get("binding_status") == "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_DELTA_PRELAUNCH", "live-binding-status")
    predecessor = live.get("preserved_predecessor_failure", {})
    require(predecessor.get("prepare_sha256") == PREPARE_SHA, "live-predecessor-sha")
    require(predecessor.get("failure") == "source-scope-drift", "live-predecessor-failure")
    require(predecessor.get("modified") is False, "live-predecessor-modified")
    require(predecessor.get("executed") is False, "live-predecessor-executed")
    candidate = live.get("candidate_scope", {})
    require(candidate.get("modified_file_count") == 15, "live-candidate-file-count")
    require(len(candidate.get("semantic_files", [])) == 3, "live-semantic-file-count")
    require(len(candidate.get("derived_evidence_files", [])) == 12, "live-derived-file-count")
    require(candidate.get("settled") is False, "live-settled")
    require(candidate.get("settlement_authority_ref") is None, "live-settlement-ref")
    require(candidate.get("settlement_authority_sha256") is None, "live-settlement-sha")
    require(candidate.get("semantic_packet_manifest_ref") is None, "live-packet-ref")
    require(candidate.get("semantic_packet_manifest_sha256") is None, "live-packet-sha")
    gates = live.get("independent_gates", {})
    require(gates.get("fresh_luna_prelaunch_present") is False, "live-prelaunch-present")
    require(gates.get("fresh_luna_prelaunch_ref") is None, "live-prelaunch-ref")
    require(gates.get("fresh_luna_prelaunch_sha256") is None, "live-prelaunch-sha")
    require(gates.get("independent_postrun_checkpoint_present") is False, "live-postrun-present")
    require(gates.get("independent_postrun_checkpoint_ref") is None, "live-postrun-ref")
    require(gates.get("independent_postrun_checkpoint_sha256") is None, "live-postrun-sha")
    require(live.get("blockers") == EXPECTED_BLOCKERS, "live-blockers")
    require(live.get("complete") is False, "live-complete")
    require(live.get("new_activation_authorized") is False, "live-activation")
    require(live.get("new_coverage_credit_granted") == 0, "live-new-credit")
    require(live.get("canonical_plan_writes_authorized") is False, "live-canonical-write")
    require(live.get("zero_state") == ZERO_STATE, "live-zero-state")

    guardrails = report.get("guardrails", {})
    require(guardrails.get("all_scopes_complete") is False, "guard-all-complete")
    require(guardrails.get("frozen_macro_complete") is True, "guard-macro-complete")
    require(guardrails.get("current_live_head_complete") is False, "guard-live-complete")
    require(guardrails.get("macro_complete_propagates_to_current_live_head") is False, "guard-propagation")
    require(guardrails.get("frozen_macro_complete_does_not_certify_current_live_head") is True, "guard-frozen-boundary")
    require(guardrails.get("activation_authorized") is False, "guard-activation")
    require(guardrails.get("coverage_credit_granted") == 0, "guard-credit")
    require(guardrails.get("canonical_plan_writes_authorized") is False, "guard-canonical-write")
    require(guardrails.get("prior_pointers_mutated") is False, "guard-prior-pointer-mutation")

    require(pointer.get("audit_id") == AUDIT_ID, "pointer-audit-id")
    require(pointer.get("reconciliation_id") == RECONCILIATION_ID, "pointer-reconciliation-id")
    require(pointer.get("status") == "BOUND_TYPED_SCOPES_CURRENT_LIVE_HEAD_BLOCKED", "pointer-status")
    require(pointer.get("scope_order") == EXPECTED_SCOPE_ORDER, "pointer-scope-order")
    require(pointer.get("current_policy_sha256") == V32_POLICY_SHA, "pointer-policy-sha")
    require(pointer.get("frozen_macro_complete") is True, "pointer-macro-complete")
    require(pointer.get("current_live_head_complete") is False, "pointer-live-complete")
    require(pointer.get("macro_complete_propagates_to_current_live_head") is False, "pointer-propagation")
    require(pointer.get("activation_authorized") is False, "pointer-activation")
    require(pointer.get("coverage_credit_granted") == 0, "pointer-credit")
    require(pointer.get("canonical_plan_writes_authorized") is False, "pointer-canonical-write")
    require(pointer.get("prior_pointers_mutated") is False, "pointer-prior-mutated")

    require(authority.get("audit_id") == AUDIT_ID, "authority-audit-id")
    require(authority.get("reconciliation_id") == RECONCILIATION_ID, "authority-reconciliation-id")
    require(authority.get("status") == "SEALED_TYPED_RECONCILIATION_CURRENT_LIVE_HEAD_BLOCKED", "authority-status")
    require(authority.get("append_only") is True, "authority-append-only")
    require(authority.get("current_policy", {}).get("sha256") == V32_POLICY_SHA, "authority-policy-sha")
    protected = authority.get("protected_inputs", {})
    require(protected.get("legacy_coverage_snapshot", {}).get("sha256") == LEGACY_COVERAGE_SHA, "authority-legacy-pointer-sha")
    require(protected.get("macro_active_pointer", {}).get("sha256") == ACTIVE_POINTER_SHA, "authority-macro-pointer-sha")
    require(protected.get("current_policy_v32", {}).get("sha256") == V32_POLICY_SHA, "authority-v32-policy-sha")
    preservation = authority.get("preservation", {})
    require(preservation.get("old_pointer_mutation_authorized") is False, "authority-old-pointer-mutation")
    require(preservation.get("old_pointer_mutation_observed") is False, "authority-old-pointer-observed")
    require(preservation.get("prior_policy_mutation_authorized") is False, "authority-prior-policy-mutation")
    permissions = authority.get("permissions", {})
    require(permissions.get("activation_authorized") is False, "authority-activation")
    require(permissions.get("coverage_credit_granted") == 0, "authority-credit")
    require(permissions.get("canonical_plan_writes_authorized") is False, "authority-canonical-write")
    require(permissions.get("semantic_packet_generation_authorized") is False, "authority-packet-generation")

    require(readiness.get("audit_id") == AUDIT_ID, "readiness-audit-id")
    require(readiness.get("reconciliation_id") == RECONCILIATION_ID, "readiness-reconciliation-id")
    require(readiness.get("status") == BLOCKED, "readiness-status")
    scope_readiness = readiness.get("scope_readiness", {})
    require(scope_readiness.get("legacy_lineage_valid") is True, "readiness-legacy")
    require(scope_readiness.get("frozen_macro_scope_complete") is True, "readiness-macro")
    require(scope_readiness.get("current_live_head_ready") is False, "readiness-live")
    require(scope_readiness.get("activation_ready") is False, "readiness-activation")
    require(scope_readiness.get("credit_ready") is False, "readiness-credit")
    require(readiness.get("zero_state") == ZERO_STATE, "readiness-zero-state")
    require(readiness.get("canonical_plan_writes_authorized") is False, "readiness-canonical-write")

    return sorted(set(errors))


def verify_filesystem(bundle: dict[str, Any]) -> list[str]:
    """Reconstruct the live immutable inputs and pointer chain."""
    errors: list[str] = []

    def require(condition: bool, label: str) -> None:
        if not condition:
            errors.append(label)

    authority = bundle["authority"]
    report = bundle["report"]
    legacy, macro, live = report["scopes"]

    for label, record in authority.get("namespace_files", {}).items():
        try:
            path = resolve(record["ref"])
            require(path.is_file(), f"namespace-missing:{label}")
            require(not path.is_symlink(), f"namespace-symlink:{label}")
            if path.is_file():
                require(sha_file(path) == record["sha256"], f"namespace-hash:{label}")
        except Exception as exc:
            errors.append(f"namespace-ref:{label}:{type(exc).__name__}:{exc}")

    for label, record in authority.get("protected_inputs", {}).items():
        try:
            path = resolve(record["ref"])
            require(path.is_file(), f"protected-missing:{label}")
            require(not path.is_symlink(), f"protected-symlink:{label}")
            if path.is_file():
                require(sha_file(path) == record["sha256"], f"protected-hash:{label}")
        except Exception as exc:
            errors.append(f"protected-ref:{label}:{type(exc).__name__}:{exc}")

    pointer = bundle["pointer"]
    require(sha_file(resolve(pointer["report_ref"])) == pointer["report_sha256"], "pointer-report-binding")
    require(sha_file(resolve(pointer["schema_ref"])) == pointer["schema_sha256"], "pointer-schema-binding")
    require(sha_file(resolve(pointer["current_policy_ref"])) == pointer["current_policy_sha256"], "pointer-policy-binding")
    readiness = bundle["readiness"]
    require(sha_file(resolve(readiness["authority_ref"])) == readiness["authority_sha256"], "readiness-authority-binding")
    require(sha_file(resolve(readiness["report_ref"])) == readiness["report_sha256"], "readiness-report-binding")
    require(sha_file(resolve(readiness["pointer_ref"])) == readiness["pointer_sha256"], "readiness-pointer-binding")

    source_scope = report["shared_frozen_universe"]["source_scope"]
    legacy_source = resolve(source_scope["legacy_ref"])
    macro_source = resolve(source_scope["macro_ref"])
    require(sha_file(legacy_source) == SOURCE_SCOPE_SHA, "source-legacy-sha")
    require(sha_file(macro_source) == SOURCE_SCOPE_SHA, "source-macro-sha")
    require(legacy_source.read_bytes() == macro_source.read_bytes(), "source-copy-byte-equality")
    require(len(load_jsonl(legacy_source)) == 135, "source-row-count")
    source_copies = [
        path
        for path in (AUDIT / "master").rglob("source_scope.jsonl")
        if path.is_file() and not path.is_symlink() and sha_file(path) == SOURCE_SCOPE_SHA
    ]
    require(len(source_copies) == 17, "source-stable-copy-count")

    window_universe = report["shared_frozen_universe"]["window_universe"]
    legacy_windows_path = resolve(window_universe["legacy_manifest_ref"])
    macro_windows_path = resolve(window_universe["macro_manifest_ref"])
    require(sha_file(legacy_windows_path) == WINDOW_MANIFEST_SHA, "window-legacy-sha")
    require(sha_file(macro_windows_path) == WINDOW_MANIFEST_SHA, "window-macro-sha")
    require(legacy_windows_path.read_bytes() == macro_windows_path.read_bytes(), "window-copy-byte-equality")
    window_rows = load_jsonl(legacy_windows_path)
    window_ids = sorted(row["window_id"] for row in window_rows)
    require(len(window_rows) == 1269 and len(set(window_ids)) == 1269, "window-row-identity")
    require(sha_bytes(json.dumps(window_ids, separators=(",", ":")).encode()) == WINDOW_IDS_DIGEST, "window-id-digest-recompute")

    legacy_coverage = load_json(resolve(legacy["coverage_pointer"]["ref"]))
    legacy_registry = load_json(resolve(legacy["credited_registry"]["ref"]))
    assignment_rows = load_jsonl(resolve(legacy["assignment_manifest"]["ref"]))
    require(legacy_coverage.get("complete") is False, "legacy-input-complete")
    require(legacy_coverage.get("accepted_assignments") == 63, "legacy-input-accepted")
    require(legacy_coverage.get("pending_assignments") == 2475, "legacy-input-pending")
    require(legacy_registry.get("credited_assignment_count") == 63, "legacy-input-registry-count")
    require(legacy_registry.get("credited_assignment_ids_digest") == LEGACY_REGISTRY_DIGEST, "legacy-input-registry-digest")
    require(len(assignment_rows) == 2538, "legacy-input-assignment-count")
    credited_ids = set(legacy_registry.get("credited_assignment_ids", []))
    selected = [row for row in assignment_rows if row.get("assignment_id") in credited_ids]
    require(len(selected) == 63, "legacy-input-selected-count")
    by_window: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in selected:
        by_window[row["window_id"]].append(row)
    dual_windows = {
        window_id
        for window_id, rows in by_window.items()
        if {row.get("role") for row in rows} == {"exact_behavior", "adversarial_negative_space"} and len(rows) == 2
    }
    unpaired_rows = [rows[0] for rows in by_window.values() if len(rows) == 1]
    require(len(dual_windows) == 31, "legacy-input-dual-count")
    require(len(unpaired_rows) == 1, "legacy-input-unpaired-count")
    if len(unpaired_rows) == 1:
        require(unpaired_rows[0].get("assignment_id") == UNPAIRED_ASSIGNMENT, "legacy-input-unpaired-assignment")
        require(unpaired_rows[0].get("window_id") == UNPAIRED_WINDOW, "legacy-input-unpaired-window")
        require(unpaired_rows[0].get("role") == "exact_behavior", "legacy-input-unpaired-role")
    seeded_rows = load_jsonl(resolve(legacy["macro_seed"]["ref"]))
    seeded_ids = {row.get("window_id") for row in seeded_rows}
    require(seeded_ids == dual_windows, "legacy-input-seed-set")
    require(UNPAIRED_WINDOW not in seeded_ids, "legacy-input-unpaired-seed-leak")

    migration = load_json(resolve(macro["migration"]["ref"]))
    require(migration.get("status") == "PRESERVE_OLD_LINEAGE_REBASE_FUTURE_COVERAGE", "macro-input-migration-status")
    require(migration.get("old_coverage_ref") == "master/live/coverage_state.snapshot-0015.json", "macro-input-old-ref")
    require(migration.get("old_assignment_credits_preserved") == 63, "macro-input-old-credit")
    require(migration.get("old_fully_dual_reviewed_windows_seeded") == 31, "macro-input-old-seed")
    active = load_json(resolve(macro["active_pointer"]["ref"]))
    require(active.get("batch_id") == "macro-batch-0012", "macro-input-active-batch")
    require(active.get("coverage_sha256") == MACRO_COVERAGE_SHA, "macro-input-active-coverage")
    require(active.get("transaction_commit_sha256") == MACRO_COMMIT_SHA, "macro-input-active-commit")
    coverage = load_json(resolve(active["coverage_ref"]))
    require(coverage.get("complete") is True, "macro-input-complete")
    require(coverage.get("micro_window_total") == 1269, "macro-input-total")
    require(coverage.get("covered_micro_windows") == 1269, "macro-input-covered")
    require(coverage.get("pending_micro_windows") == 0, "macro-input-pending")
    require(coverage.get("seeded_micro_windows") == 31, "macro-input-seeded")
    require(coverage.get("macro_credited_micro_windows") == 1238, "macro-input-macro-windows")
    require(coverage.get("credited_macro_assignments") == 256, "macro-input-credited")
    require(coverage.get("quarantined_attempts") == 6, "macro-input-quarantine-count")
    require(coverage.get("covered_window_ids_digest") == WINDOW_IDS_DIGEST, "macro-input-window-digest")
    require(coverage.get("credited_assignment_ids_digest") == MACRO_ASSIGNMENT_DIGEST, "macro-input-assignment-digest")
    checkpoint = load_json(resolve(macro["independent_checkpoint"]["ref"]))
    require(checkpoint.get("status") == "pass", "macro-input-checkpoint-status")
    require(checkpoint.get("counts", {}).get("transaction_count") == 12, "macro-input-checkpoint-transactions")
    require(checkpoint.get("counts", {}).get("cumulative_covered_micro_windows") == 1269, "macro-input-checkpoint-covered")
    require(checkpoint.get("counts", {}).get("pending_micro_windows") == 0, "macro-input-checkpoint-pending")
    require(checkpoint.get("counts", {}).get("cumulative_credited_macro_assignments") == 256, "macro-input-checkpoint-assignments")
    require(checkpoint.get("counts", {}).get("quarantined_attempts_reconstructed") == 6, "macro-input-checkpoint-quarantines")
    coverage_seed = load_json(resolve(macro["prior_active_pointer_lineage"]["coverage_seed_ref"]))
    require(coverage_seed.get("active_pointer_sha256") == PRIOR_ACTIVE_POINTER_SHA, "macro-input-prior-pointer-sha")
    require(coverage_seed.get("transaction_batch_id") == "macro-batch-0011", "macro-input-prior-pointer-batch")

    transaction_dirs = sorted((AUDIT / "master/macro/transactions").glob("macro-batch-*"))
    require(len(transaction_dirs) == 12, "macro-chain-transaction-count")
    reconstructed_credited: set[str] = set()
    reconstructed_quarantined: list[str] = []
    reconstructed_windows = set(seeded_ids)
    for transaction_dir in transaction_dirs:
        commit = load_json(transaction_dir / "commit.json")
        credited_here = set(commit.get("credited_assignment_ids", []))
        quarantined_here = list(commit.get("quarantined_assignment_ids", []))
        require(not reconstructed_credited.intersection(credited_here), f"macro-chain-duplicate-credit:{transaction_dir.name}")
        reconstructed_credited.update(credited_here)
        reconstructed_windows.update(commit.get("credited_micro_window_ids", []))
        reconstructed_quarantined.extend(quarantined_here)
        for assignment_id in quarantined_here:
            outcome_path = transaction_dir / "outcomes" / f"{assignment_id}.json"
            require(outcome_path.is_file(), f"macro-chain-quarantine-outcome:{assignment_id}")
            if outcome_path.is_file():
                outcome = load_json(outcome_path)
                require(outcome.get("status") == "quarantined_zero_credit", f"macro-chain-quarantine-status:{assignment_id}")
                require(outcome.get("coverage_credit") == 0, f"macro-chain-quarantine-credit:{assignment_id}")
                require(outcome.get("credited_micro_window_ids") == [], f"macro-chain-quarantine-windows:{assignment_id}")
    require(reconstructed_credited == set(coverage.get("credited_assignment_ids", [])), "macro-chain-credited-set")
    require(reconstructed_windows == set(coverage.get("covered_window_ids", [])), "macro-chain-covered-set")
    require(reconstructed_quarantined == EXPECTED_QUARANTINES, "macro-chain-quarantine-set")

    v32 = load_json(resolve(report["policy_binding"]["current_policy_ref"]))
    v31 = load_json(resolve(report["policy_binding"]["prior_policy_ref"]))
    require(v32.get("supersedes_prospectively") == "CONCURRENCY_POLICY_V31.json", "policy-input-supersession")
    require(v32.get("invariants", {}).get("candidate_credit_zero_until_primary_and_fresh_independent_checkpoint") is True, "policy-input-credit-gate")
    require(v32.get("invariants", {}).get("never_edit_live_canonical_plans") is True, "policy-input-canonical-write")
    require(v31.get("prior_policies_mutated") is False, "policy-input-v31-preserved")

    binding = load_json(resolve(live["source_scope_binding"]["binding_ref"]))
    receipt = load_json(resolve(live["source_scope_binding"]["receipt_ref"]))
    require(binding.get("status") == "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_DELTA_PRELAUNCH", "live-input-binding-status")
    require(binding.get("source_scope", {}).get("raw_sha256") == SOURCE_SCOPE_SHA, "live-input-source-sha")
    require(binding.get("future_preparation", {}).get("activation_authorized") is False, "live-input-binding-activation")
    require(binding.get("future_preparation", {}).get("credit_authorized") is False, "live-input-binding-credit")
    require(not any(binding.get("zero_state", {}).values()), "live-input-binding-zero-state")
    require(receipt.get("status") == "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_DELTA_PRELAUNCH", "live-input-receipt-status")
    require(receipt.get("launch_authorized") is False, "live-input-receipt-launch")
    require(not any(receipt.get("zero_state", {}).values()), "live-input-receipt-zero-state")
    predecessor_dir = AUDIT / "master/final_live_head_delta/final-live-head-delta-0001"
    forbidden_prepared = [
        "authority.json",
        "local-prelaunch-candidate.json",
        "snapshot_manifest.jsonl",
        "changed_windows.jsonl",
        "assignment_manifest.jsonl",
        "packet_registry.jsonl",
        "join_manifest.jsonl",
        "result.schema.json",
        "leaf_prompt.json",
    ]
    require(not any((predecessor_dir / name).exists() for name in forbidden_prepared), "live-input-predecessor-prepared")

    return sorted(set(errors))


def verify() -> dict[str, Any]:
    errors: list[str] = []
    try:
        bundle = load_bundle()
        errors.extend(validate_bundle(bundle))
        errors.extend(verify_filesystem(bundle))
    except Exception as exc:
        errors.append(f"unhandled:{type(exc).__name__}:{exc}")
    errors = sorted(set(errors))
    return {
        "audit_id": AUDIT_ID,
        "reconciliation_id": RECONCILIATION_ID,
        "verification_status": "pass" if not errors else "fail_closed",
        "control_status": BLOCKED,
        "errors": errors,
        "error_count": len(errors),
        "scope_types": EXPECTED_SCOPE_ORDER,
        "legacy": {
            "credited_role_assignments": 63,
            "total_role_assignments": 2538,
            "fully_dual_reviewed_windows": 31,
            "unpaired_credited_windows": 1,
            "complete": False,
        },
        "frozen_macro": {
            "covered_micro_windows": 1269,
            "total_micro_windows": 1269,
            "credited_macro_assignments": 256,
            "transaction_count": 12,
            "quarantined_attempts": 6,
            "complete": True,
        },
        "current_live_head": {
            "settled": False,
            "independent_checkpoint_present": False,
            "complete": False,
            "credit": 0,
        },
        "macro_complete_propagates_to_current_live_head": False,
        "activation_authorized": False,
        "canonical_plan_writes_authorized": False,
    }


def main() -> None:
    report = verify()
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["verification_status"] == "pass" else 1)


if __name__ == "__main__":
    main()
