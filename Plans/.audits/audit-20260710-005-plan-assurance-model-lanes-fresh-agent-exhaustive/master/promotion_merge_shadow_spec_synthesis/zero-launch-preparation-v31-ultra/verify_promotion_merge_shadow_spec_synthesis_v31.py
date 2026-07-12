#!/usr/bin/env python3
"""Fail-closed verifier for the Audit005 zero-launch synthesis preparation."""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import sys
from typing import Any

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
NAMESPACE_REL = pathlib.Path(
    "Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive/"
    "master/promotion_merge_shadow_spec_synthesis/zero-launch-preparation-v31-ultra"
)
EXPECTED_GIT_HEAD = "7f57ffda79c88878816fee922d85fbed29567f97"
EXPECTED_FEATURE_COUNT = 3888
EXPECTED_SEAM_COUNT = 9365
EXPECTED_REVERSE_SHADOW_CANDIDATES = 46
EXPECTED_LINEAGE_ROWS = 18
EXPECTED_LIVE_HEAD_ROWS = 15
EXPECTED_FEATURE_REF_DIGEST = "82511b8d574044b0338156f59573fdcf834bb36acc412a134b65ba971e120b2b"
EXPECTED_FILES = {
    "AUTHORITY.json",
    "lineage_manifest.jsonl",
    "live_head_manifest.jsonl",
    "readiness.json",
    "schema/promotion_merge_shadow_spec_synthesis.schema.json",
    "terminal_preparation_report.json",
    "test_promotion_merge_shadow_spec_synthesis_v31.py",
    "verify_promotion_merge_shadow_spec_synthesis_v31.py",
    "zero_state_inventory.json",
}
EXPECTED_CHECKPOINTS = {
    "catalog-universe": True,
    "universal-research-source": True,
    "cross-cutting-research": True,
    "research-shadow-certification": False,
    "scenario-cumulative": False,
    "seam-aggregate": True,
    "reverse-shadow-adjudication": False,
    "live-head-delta": False,
    "luna-synthesis-prelaunch": False,
    "luna-synthesis-postrun": False,
}
EXPECTED_BLOCKERS = [
    "research_shadow_retry_requires_two_fresh_luna_rejected_set_validations",
    "research_shadow_retry_requires_two_fresh_luna_atomic8_prelaunch_gates",
    "research_shadow_retry_requires_four_fresh_luna_identities",
    "scenario_cohort_0002_exact_six_assignment_repair_not_activated_or_checkpointed",
    "scenario_cohort_0002_fresh_luna_rejected_set_confirmation_absent",
    "scenario_cohorts_0001_0002_cumulative_checkpoint_absent",
    "scenario_cohort_0003_fresh_luna_prelaunch_execution_postrun_checkpoint_absent",
    "scenario_cohort_0004_fresh_luna_prelaunch_execution_postrun_checkpoint_absent",
    "reverse_shadow_five_candidate_edges_remain_semantically_quarantined",
    "final_live_head_delta_has_binding_only_zero_packets_and_no_luna_delta_checkpoint",
    "current_15_file_live_head_delta_not_settled_or_checkpointed",
    "fresh_independent_luna_promotion_merge_shadow_spec_prelaunch_absent",
    "fresh_independent_luna_promotion_merge_shadow_spec_postrun_absent",
]
ZERO_COUNT_KEYS = {
    "semantic_packets",
    "launches",
    "activations",
    "dispatch_intents",
    "dispatch_receipts",
    "results",
    "native_capture_rows",
    "promotion_decisions_materialized",
    "merge_decisions_materialized",
    "shadow_spec_entries_materialized",
    "canonical_writes",
    "spawned_children",
    "descendants",
    "followups",
    "retries",
    "coverage_credit",
    "research_credit",
    "scenario_credit",
    "promotion_credit",
    "merge_credit",
    "spec_credit",
    "certification_credit",
}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: pathlib.Path) -> str:
    return sha256_bytes(path.read_bytes())


def load_json(path: pathlib.Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"expected JSON object: {path}")
    return value


def load_jsonl(path: pathlib.Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            raise ValueError(f"blank JSONL row at {path}:{number}")
        value = json.loads(line)
        if not isinstance(value, dict):
            raise ValueError(f"non-object JSONL row at {path}:{number}")
        rows.append(value)
    return rows


def is_sha256(value: Any) -> bool:
    return isinstance(value, str) and re.fullmatch(r"[0-9a-f]{64}", value) is not None


def safe_repo_path(root: pathlib.Path, relative: Any) -> pathlib.Path | None:
    if not isinstance(relative, str):
        return None
    candidate_rel = pathlib.PurePosixPath(relative)
    if candidate_rel.is_absolute() or ".." in candidate_rel.parts or not candidate_rel.parts:
        return None
    candidate = (root / pathlib.Path(*candidate_rel.parts)).resolve()
    try:
        candidate.relative_to(root.resolve())
    except ValueError:
        return None
    return candidate


def record(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def validate_zero_state(value: dict[str, Any], namespace: pathlib.Path, errors: list[str]) -> None:
    record(value.get("schema_version") == "audit005-promotion-merge-shadow-spec-synthesis-zero-state-v1", "zero-state-schema", errors)
    record(value.get("audit_id") == AUDIT_ID, "zero-state-audit", errors)
    record(value.get("status") == "EXACT_ZERO_STATE_BLOCKED", "zero-state-status", errors)
    counts = value.get("counts")
    record(isinstance(counts, dict), "zero-state-counts-object", errors)
    if isinstance(counts, dict):
        record(set(counts) == ZERO_COUNT_KEYS, "zero-state-count-keys", errors)
        for key in sorted(ZERO_COUNT_KEYS):
            record(counts.get(key) == 0, f"zero-state-count:{key}", errors)
    permissions = value.get("permissions")
    record(isinstance(permissions, dict) and bool(permissions), "zero-state-permissions-object", errors)
    if isinstance(permissions, dict):
        for key, permitted in permissions.items():
            record(key.endswith("_authorized"), f"zero-state-permission-name:{key}", errors)
            record(permitted is False, f"zero-state-permission:{key}", errors)
    forbidden = value.get("forbidden_namespace_paths")
    record(isinstance(forbidden, list) and len(forbidden) == len(set(forbidden or [])), "zero-state-forbidden-paths", errors)
    if isinstance(forbidden, list):
        for rel in forbidden:
            path = safe_repo_path(namespace, rel)
            record(path is not None, f"zero-state-unsafe-forbidden-path:{rel}", errors)
            if path is not None:
                record(not path.exists(), f"zero-state-forbidden-path-exists:{rel}", errors)
    record(value.get("canonical_plan_files_written") == [], "zero-state-canonical-write-list", errors)
    record(value.get("synthesis_output_files_written") == [], "zero-state-output-list", errors)


def validate_authority_shape(value: dict[str, Any], errors: list[str]) -> None:
    record(value.get("schema_version") == "audit005-promotion-merge-shadow-spec-synthesis-preparation-authority-v1", "authority-schema", errors)
    record(value.get("audit_id") == AUDIT_ID, "authority-audit", errors)
    record(value.get("status") == "BLOCKED_ZERO_LAUNCH_AWAITING_ALL_CHECKPOINTS_AND_LUNA", "authority-status", errors)
    record(value.get("preparation_only") is True, "authority-preparation-only", errors)
    scope = value.get("scope")
    record(isinstance(scope, dict), "authority-scope-object", errors)
    if isinstance(scope, dict):
        record(scope.get("feature_count") == EXPECTED_FEATURE_COUNT, "authority-feature-count", errors)
        record(scope.get("seam_count") == EXPECTED_SEAM_COUNT, "authority-seam-count", errors)
        record(scope.get("reverse_shadow_candidate_count") == EXPECTED_REVERSE_SHADOW_CANDIDATES, "authority-reverse-shadow-count", errors)
        record(scope.get("feature_ref_digest") == EXPECTED_FEATURE_REF_DIGEST, "authority-feature-ref-digest", errors)
    metadata = value.get("model_identity_metadata")
    record(isinstance(metadata, dict), "authority-model-metadata-object", errors)
    if isinstance(metadata, dict):
        record(metadata.get("requested_model") == "gpt-5.6-sol", "authority-model", errors)
        record(metadata.get("requested_reasoning_effort") == "ultra", "authority-effort", errors)
        record(metadata.get("controller") == "/root/sol_controller_v29", "authority-controller", errors)
        record(metadata.get("role") == "preparation_metadata_only_not_runtime_attestation", "authority-model-role", errors)
        record(metadata.get("authorizes_launch") is False, "authority-model-launch", errors)
        record(metadata.get("authorizes_credit") is False, "authority-model-credit", errors)
    permissions = value.get("permissions")
    record(isinstance(permissions, dict) and bool(permissions), "authority-permissions-object", errors)
    if isinstance(permissions, dict):
        for key, permitted in permissions.items():
            record(permitted is False, f"authority-permission:{key}", errors)
    record(value.get("blockers") == EXPECTED_BLOCKERS, "authority-blockers", errors)


def validate_readiness_shape(value: dict[str, Any], errors: list[str]) -> None:
    record(value.get("schema_version") == "audit005-promotion-merge-shadow-spec-synthesis-readiness-v1", "readiness-schema", errors)
    record(value.get("audit_id") == AUDIT_ID, "readiness-audit", errors)
    record(value.get("status") == "BLOCKED_ZERO_LAUNCH", "readiness-status", errors)
    record(value.get("ready") is False, "readiness-ready", errors)
    record(value.get("all_required_checkpoints_closed") is False, "readiness-all-checkpoints", errors)
    record(value.get("closed_checkpoint_count") == 4, "readiness-closed-count", errors)
    record(value.get("open_checkpoint_count") == 6, "readiness-open-count", errors)
    matrix = value.get("checkpoint_matrix")
    record(isinstance(matrix, list) and len(matrix) == len(EXPECTED_CHECKPOINTS), "readiness-matrix-count", errors)
    if isinstance(matrix, list):
        observed: dict[str, Any] = {}
        for row in matrix:
            if isinstance(row, dict):
                observed[row.get("checkpoint_id")] = row.get("closed")
                record(row.get("promotion_credit") == 0, f"readiness-matrix-credit:{row.get('checkpoint_id')}", errors)
                record(row.get("activation_proof") is False, f"readiness-matrix-activation:{row.get('checkpoint_id')}", errors)
            else:
                errors.append("readiness-matrix-row-object")
        record(observed == EXPECTED_CHECKPOINTS, "readiness-matrix-values", errors)
    record(value.get("blockers") == EXPECTED_BLOCKERS, "readiness-blockers", errors)


def validate_schema_contract(schema: dict[str, Any], errors: list[str]) -> None:
    try:
        from jsonschema import Draft202012Validator

        Draft202012Validator.check_schema(schema)
    except Exception as exc:  # pragma: no cover - exact exception is environment-specific
        errors.append(f"schema-invalid:{type(exc).__name__}:{exc}")
        return
    props = schema.get("properties", {})
    record(props.get("feature_count", {}).get("const") == EXPECTED_FEATURE_COUNT, "schema-feature-count", errors)
    record(props.get("seam_count", {}).get("const") == EXPECTED_SEAM_COUNT, "schema-seam-count", errors)
    record(props.get("reverse_shadow_candidate_count", {}).get("const") == EXPECTED_REVERSE_SHADOW_CANDIDATES, "schema-reverse-shadow-count", errors)
    for key, count in (
        ("feature_decisions", EXPECTED_FEATURE_COUNT),
        ("seam_adjudications", EXPECTED_SEAM_COUNT),
        ("reverse_shadow_adjudications", EXPECTED_REVERSE_SHADOW_CANDIDATES),
        ("shadow_spec_entries", EXPECTED_FEATURE_COUNT),
    ):
        node = props.get(key, {})
        record(node.get("minItems") == count and node.get("maxItems") == count, f"schema-exact-array:{key}", errors)
    effect_props = props.get("effects", {}).get("properties", {})
    for key in ("launch_performed", "activation_performed", "canonical_write_performed", "promotion_committed", "merge_committed", "shadow_spec_published"):
        record(effect_props.get(key, {}).get("const") is False, f"schema-effect:{key}", errors)
    credit_props = props.get("credit", {}).get("properties", {})
    for key in ("coverage", "research", "scenario", "promotion", "merge", "spec", "certification"):
        record(credit_props.get(key, {}).get("const") == 0, f"schema-credit:{key}", errors)


def validate_dependency_semantics(by_id: dict[str, dict[str, Any]], root: pathlib.Path, errors: list[str]) -> None:
    def doc(dependency_id: str) -> dict[str, Any]:
        row = by_id.get(dependency_id)
        if not row:
            errors.append(f"dependency-missing-for-semantic-check:{dependency_id}")
            return {}
        path = safe_repo_path(root, row.get("path"))
        if path is None:
            return {}
        return load_json(path)

    active = doc("catalog-active-pointer")
    record(active.get("status") == "ACTIVE_OWNER_SHARDS_COMPLETE", "dependency-semantic:catalog-active", errors)
    catalog_luna = doc("catalog-luna-postrun")
    record(catalog_luna.get("status") == "pass", "dependency-semantic:catalog-luna-status", errors)
    record(catalog_luna.get("counts", {}).get("provisional_features") == 3888, "dependency-semantic:catalog-luna-features", errors)
    universal = doc("research-universal-primary")
    record(universal.get("status") == "pass", "dependency-semantic:research-universal-status", errors)
    record(universal.get("counts", {}).get("eligible") == 24 and universal.get("counts", {}).get("rejected") == 0, "dependency-semantic:research-universal-counts", errors)
    sprint = doc("research-sprint-checkpoint")
    record(sprint.get("status") == "PASS_EXACT_CUMULATIVE_8_OF_8" and sprint.get("research_checkpoint_ready") is True, "dependency-semantic:research-sprint", errors)
    v7 = doc("research-shadow-atomic8-v7-preparation")
    record(v7.get("status") == "BLOCKED_AWAITING_V6_PASS_AND_FRESH_LUNA_ATOMIC8_GATE", "dependency-semantic:research-shadow-v7-status", errors)
    record(v7.get("topology", {}).get("feature_count") == 3888 and v7.get("zero_state", {}).get("results") == 0, "dependency-semantic:research-shadow-v7-zero", errors)
    retry = doc("research-shadow-retry-v30-terminal-verification")
    record(retry.get("status") == "PASS_PREPARATION_ONLY_BLOCKED_NO_ACTIVATION", "dependency-semantic:research-shadow-retry-status", errors)
    retry_counts = retry.get("counts", {})
    record(retry_counts.get("features") == 3888 and retry_counts.get("results") == 0 and retry_counts.get("credit") == 0, "dependency-semantic:research-shadow-retry-zero", errors)
    record(len(retry.get("prelaunch_negative_blockers", [])) == 5, "dependency-semantic:research-shadow-retry-blockers", errors)
    scenario_prep = doc("scenario-postrun-v1-preparation")
    record(scenario_prep.get("status") == "BLOCKED_AWAITING_FUTURE_SCENARIO_EXECUTION", "dependency-semantic:scenario-prep-status", errors)
    record(scenario_prep.get("scope", {}).get("assignment_count") == 16 and scenario_prep.get("scope", {}).get("feature_count") == 1640, "dependency-semantic:scenario-prep-scope", errors)
    record(scenario_prep.get("zero_state", {}).get("results") == 0, "dependency-semantic:scenario-prep-zero", errors)
    cohort1 = doc("scenario-cohort-0001-checkpoint")
    record(cohort1.get("status") == "pass" and cohort1.get("assignment_counts", {}).get("eligible") == 8, "dependency-semantic:scenario-cohort1", errors)
    cohort2 = doc("scenario-cohort-0002-luna-postrun")
    record(cohort2.get("status") == "fail_closed", "dependency-semantic:scenario-cohort2-status", errors)
    record(cohort2.get("counts", {}).get("eligible") == 2 and cohort2.get("counts", {}).get("rejected") == 6, "dependency-semantic:scenario-cohort2-counts", errors)
    record(cohort2.get("candidate_credit") == 0, "dependency-semantic:scenario-cohort2-credit", errors)
    repair = doc("scenario-cohort-0002-repair-readiness")
    record(repair.get("status") == "prepared_blocked", "dependency-semantic:scenario-repair-status", errors)
    record(repair.get("prepared_counts", {}).get("assignments") == 6 and repair.get("zero_state", {}).get("results") == 0, "dependency-semantic:scenario-repair-zero", errors)
    late = doc("scenario-cohorts-0003-0004-readiness")
    record(late.get("status") == "pass_blocked" and late.get("assignments") == 16 and late.get("features") == 2248, "dependency-semantic:scenario-late-scope", errors)
    record(late.get("zero_state", {}).get("results") == 0 and late.get("credit") == 0, "dependency-semantic:scenario-late-zero", errors)
    seam = doc("seam-aggregate-after-repair")
    record(seam.get("status") == "CHECKPOINT_READY_EXACT_64_OF_64_ZERO_PROMOTION", "dependency-semantic:seam-status", errors)
    record(seam.get("aggregate_closure", {}).get("eligible_count") == 64 and seam.get("governance_effect", {}).get("promotion_performed") is False, "dependency-semantic:seam-counts", errors)
    reverse = doc("reverse-shadow-luna-postrun")
    record(reverse.get("status") == "fail_closed_semantic_quarantine", "dependency-semantic:reverse-shadow-status", errors)
    record(reverse.get("counts", {}).get("assignments") == 40 and reverse.get("counts", {}).get("quarantined_candidate_edges") == 5, "dependency-semantic:reverse-shadow-counts", errors)
    binding = doc("live-head-delta-source-scope-binding")
    record(binding.get("status") == "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_DELTA_PRELAUNCH", "dependency-semantic:delta-binding-status", errors)
    record(all(value == 0 for value in binding.get("zero_state", {}).values()), "dependency-semantic:delta-binding-zero", errors)
    receipt = doc("live-head-delta-binding-receipt")
    record(receipt.get("status") == "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_DELTA_PRELAUNCH", "dependency-semantic:delta-receipt-status", errors)
    record(all(value == 0 for value in receipt.get("zero_state", {}).values()), "dependency-semantic:delta-receipt-zero", errors)
    v31 = doc("policy-v31-luna-controller-recovery")
    record(v31.get("status") == "POST_RESET_LUNA_CONTROLLER_RECOVERED", "dependency-semantic:policy-v31", errors)
    v32 = doc("policy-v32-prospective-pacing")
    record(v32.get("schema_version") == "audit005-concurrency-policy-v32", "dependency-semantic:policy-v32-schema", errors)
    record(v32.get("scheduling", {}).get("atomic_transaction_cap") == 8 and v32.get("invariants", {}).get("candidate_credit_zero_until_primary_and_fresh_independent_checkpoint") is True, "dependency-semantic:policy-v32-constraints", errors)


def verify(root: pathlib.Path, namespace_rel: pathlib.Path = NAMESPACE_REL) -> dict[str, Any]:
    root = root.resolve()
    namespace = (root / namespace_rel).resolve()
    errors: list[str] = []
    record(namespace.exists() and namespace.is_dir(), "namespace-missing", errors)
    try:
        namespace.relative_to(root)
    except ValueError:
        errors.append("namespace-outside-root")
    actual_files = {
        str(path.relative_to(namespace).as_posix())
        for path in namespace.rglob("*")
        if path.is_file()
    }
    record(actual_files == EXPECTED_FILES, f"namespace-file-set:{sorted(actual_files ^ EXPECTED_FILES)}", errors)
    for path in namespace.rglob("*"):
        record(not path.is_symlink(), f"namespace-symlink:{path.relative_to(namespace)}", errors)

    required = {name: namespace / name for name in EXPECTED_FILES}
    if any(not path.exists() for path in required.values()):
        return {"status": "fail", "errors": sorted(set(errors)), "counts": {"errors": len(set(errors))}}

    authority = load_json(required["AUTHORITY.json"])
    readiness = load_json(required["readiness.json"])
    zero_state = load_json(required["zero_state_inventory.json"])
    terminal = load_json(required["terminal_preparation_report.json"])
    schema = load_json(required["schema/promotion_merge_shadow_spec_synthesis.schema.json"])
    lineage = load_jsonl(required["lineage_manifest.jsonl"])
    live_head = load_jsonl(required["live_head_manifest.jsonl"])

    validate_authority_shape(authority, errors)
    validate_readiness_shape(readiness, errors)
    validate_zero_state(zero_state, namespace, errors)
    validate_schema_contract(schema, errors)

    record(len(lineage) == EXPECTED_LINEAGE_ROWS, "lineage-row-count", errors)
    ids = [row.get("dependency_id") for row in lineage]
    paths = [row.get("path") for row in lineage]
    record(len(ids) == len(set(ids)), "lineage-duplicate-id", errors)
    record(len(paths) == len(set(paths)), "lineage-duplicate-path", errors)
    by_id: dict[str, dict[str, Any]] = {}
    for row in lineage:
        dependency_id = row.get("dependency_id")
        if isinstance(dependency_id, str):
            by_id[dependency_id] = row
        path = safe_repo_path(root, row.get("path"))
        record(path is not None, f"lineage-unsafe-path:{row.get('path')}", errors)
        record(row.get("credit") == 0, f"lineage-credit:{dependency_id}", errors)
        record(isinstance(row.get("checkpoint_closed"), bool), f"lineage-checkpoint-boolean:{dependency_id}", errors)
        record(is_sha256(row.get("sha256")), f"lineage-sha-shape:{dependency_id}", errors)
        if path is not None:
            record(path.is_file(), f"lineage-file-missing:{dependency_id}", errors)
            if path.is_file():
                record(path.stat().st_size == row.get("byte_count"), f"lineage-byte-count:{dependency_id}", errors)
                record(sha256_file(path) == row.get("sha256"), f"lineage-sha:{dependency_id}", errors)
    validate_dependency_semantics(by_id, root, errors)

    feature_ledger_row = by_id.get("catalog-provisional-feature-ledger", {})
    feature_ledger_path = safe_repo_path(root, feature_ledger_row.get("path"))
    if feature_ledger_path and feature_ledger_path.is_file():
        feature_rows = load_jsonl(feature_ledger_path)
        refs = sorted(row.get("provisional_feature_ref") for row in feature_rows)
        record(len(refs) == EXPECTED_FEATURE_COUNT and len(set(refs)) == EXPECTED_FEATURE_COUNT, "feature-ledger-cardinality", errors)
        record(all(isinstance(ref, str) and re.fullmatch(r"OPF::A005OM-[0-9]{4}::PF-[0-9]{4}", ref) for ref in refs), "feature-ledger-ref-shape", errors)
        digest = sha256_bytes(("\n".join(refs) + "\n").encode("utf-8"))
        record(digest == EXPECTED_FEATURE_REF_DIGEST, "feature-ledger-ref-digest", errors)

    record(len(live_head) == EXPECTED_LIVE_HEAD_ROWS, "live-head-row-count", errors)
    live_paths = [row.get("path") for row in live_head]
    record(len(live_paths) == len(set(live_paths)), "live-head-duplicate-path", errors)
    semantic_rows = 0
    for row in live_head:
        path = safe_repo_path(root, row.get("path"))
        record(path is not None and path.is_file(), f"live-head-path:{row.get('path')}", errors)
        record(row.get("changed") is True, f"live-head-changed:{row.get('path')}", errors)
        record(row.get("settled") is False, f"live-head-settled:{row.get('path')}", errors)
        record(row.get("delta_checkpoint_ref") is None, f"live-head-delta-checkpoint:{row.get('path')}", errors)
        record(row.get("luna_checkpoint_ref") is None, f"live-head-luna-checkpoint:{row.get('path')}", errors)
        if row.get("role") == "canonical_semantic_delta_source":
            semantic_rows += 1
        if path is not None and path.is_file():
            record(path.stat().st_size == row.get("current_bytes"), f"live-head-current-bytes:{row.get('path')}", errors)
            record(sha256_file(path) == row.get("current_sha256"), f"live-head-current-sha:{row.get('path')}", errors)
        record(is_sha256(row.get("baseline_sha256")) and is_sha256(row.get("current_sha256")), f"live-head-sha-shape:{row.get('path')}", errors)
        record(row.get("baseline_sha256") != row.get("current_sha256"), f"live-head-non-delta:{row.get('path')}", errors)
    record(semantic_rows == 3, "live-head-semantic-row-count", errors)

    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root, check=True, capture_output=True, text=True).stdout.strip()
    record(head == EXPECTED_GIT_HEAD, "git-head", errors)
    for row in live_head:
        path_text = row.get("path")
        if isinstance(path_text, str) and head == EXPECTED_GIT_HEAD:
            baseline = subprocess.run(["git", "show", f"HEAD:{path_text}"], cwd=root, check=True, capture_output=True).stdout
            record(len(baseline) == row.get("baseline_bytes"), f"live-head-baseline-bytes:{path_text}", errors)
            record(sha256_bytes(baseline) == row.get("baseline_sha256"), f"live-head-baseline-sha:{path_text}", errors)

    artifact_hashes = authority.get("artifact_hashes", {})
    expected_artifact_paths = {
        "lineage_manifest": required["lineage_manifest.jsonl"],
        "live_head_manifest": required["live_head_manifest.jsonl"],
        "zero_state_inventory": required["zero_state_inventory.json"],
        "result_schema": required["schema/promotion_merge_shadow_spec_synthesis.schema.json"],
        "verifier": required["verify_promotion_merge_shadow_spec_synthesis_v31.py"],
        "tests": required["test_promotion_merge_shadow_spec_synthesis_v31.py"],
    }
    record(set(artifact_hashes) == set(expected_artifact_paths), "authority-artifact-hash-keys", errors)
    for key, path in expected_artifact_paths.items():
        record(artifact_hashes.get(key) == sha256_file(path), f"authority-artifact-hash:{key}", errors)

    authority_sha = sha256_file(required["AUTHORITY.json"])
    zero_sha = sha256_file(required["zero_state_inventory.json"])
    record(readiness.get("authority_sha256") == authority_sha, "readiness-authority-hash", errors)
    record(readiness.get("zero_state_inventory_sha256") == zero_sha, "readiness-zero-state-hash", errors)
    record(readiness.get("lineage_manifest_sha256") == sha256_file(required["lineage_manifest.jsonl"]), "readiness-lineage-hash", errors)
    record(readiness.get("live_head_manifest_sha256") == sha256_file(required["live_head_manifest.jsonl"]), "readiness-live-head-hash", errors)

    record(terminal.get("schema_version") == "audit005-promotion-merge-shadow-spec-synthesis-terminal-preparation-v1", "terminal-schema", errors)
    record(terminal.get("status") == "PASS_PREPARATION_ONLY_BLOCKED_ZERO_LAUNCH", "terminal-status", errors)
    record(terminal.get("authority_sha256") == authority_sha, "terminal-authority-hash", errors)
    record(terminal.get("readiness_sha256") == sha256_file(required["readiness.json"]), "terminal-readiness-hash", errors)
    record(terminal.get("lineage_manifest_sha256") == sha256_file(required["lineage_manifest.jsonl"]), "terminal-lineage-hash", errors)
    record(terminal.get("live_head_manifest_sha256") == sha256_file(required["live_head_manifest.jsonl"]), "terminal-live-head-hash", errors)
    record(terminal.get("zero_state_inventory_sha256") == zero_sha, "terminal-zero-state-hash", errors)
    record(terminal.get("schema_sha256") == sha256_file(required["schema/promotion_merge_shadow_spec_synthesis.schema.json"]), "terminal-schema-hash", errors)
    record(terminal.get("verifier_sha256") == sha256_file(required["verify_promotion_merge_shadow_spec_synthesis_v31.py"]), "terminal-verifier-hash", errors)
    record(terminal.get("tests_sha256") == sha256_file(required["test_promotion_merge_shadow_spec_synthesis_v31.py"]), "terminal-tests-hash", errors)
    record(terminal.get("launch_authorized") is False and terminal.get("activation_authorized") is False, "terminal-activation", errors)
    record(terminal.get("canonical_writes") == 0 and terminal.get("credit") == 0, "terminal-effects", errors)
    record(terminal.get("blockers") == EXPECTED_BLOCKERS, "terminal-blockers", errors)
    tests = terminal.get("tests", {})
    record(tests.get("status") == "pass" and tests.get("failed") == 0 and tests.get("passed") == tests.get("total"), "terminal-tests-status", errors)

    unique_errors = sorted(set(errors))
    return {
        "schema_version": "audit005-promotion-merge-shadow-spec-synthesis-verification-v1",
        "status": "pass_blocked" if not unique_errors else "fail_closed",
        "errors": unique_errors,
        "counts": {
            "lineage_rows": len(lineage),
            "live_head_rows": len(live_head),
            "feature_rows": EXPECTED_FEATURE_COUNT,
            "closed_checkpoints": 4,
            "open_checkpoints": 6,
            "semantic_packets": 0,
            "launches": 0,
            "activations": 0,
            "results": 0,
            "receipts": 0,
            "native_capture_rows": 0,
            "canonical_writes": 0,
            "credit": 0,
            "errors": len(unique_errors),
        },
        "hashes": {
            "authority": authority_sha,
            "readiness": sha256_file(required["readiness.json"]),
            "lineage_manifest": sha256_file(required["lineage_manifest.jsonl"]),
            "live_head_manifest": sha256_file(required["live_head_manifest.jsonl"]),
            "zero_state_inventory": zero_sha,
            "schema": sha256_file(required["schema/promotion_merge_shadow_spec_synthesis.schema.json"]),
        },
        "launch_authorized": False,
        "activation_authorized": False,
        "credit": 0,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[6])
    args = parser.parse_args()
    report = verify(args.root)
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass_blocked" else 1


if __name__ == "__main__":
    raise SystemExit(main())
