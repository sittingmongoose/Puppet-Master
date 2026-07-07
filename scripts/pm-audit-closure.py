#!/usr/bin/env python3
"""Validate PM semantic audit closure registry and repair closure matrices."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_REGISTRY = ROOT / "Plans/.audits/_semantic_closure_registry.jsonl"

ALLOWED_STATUSES = {
    "repaired",
    "false_positive",
    "explicitly_deferred",
    "source_lineage_only",
    "not_for_plan",
    "stale_retired",
    "blocked_requires_user_decision",
    "reopened",
}
OPEN_STATUSES = {"blocked_requires_user_decision", "reopened"}
FINDING_LEVELS = {"blocker", "warning", "observation", "error", "info"}
TERMINAL_CLASSIFICATIONS = {"exact_present", "equivalent_with_evidence", "previously_closed"}
AUDIT_REF_FIELDS = ("audit_id", "ledger_id", "baseline_ref", "subject_ref", "observation_ref")
ROW_SCOPED_REF_FIELDS = {"ledger_id", "subject_ref", "observation_ref"}
AUDIT_SOURCE_FINDING_REQUIRED_FIELDS = {
    "finding_family",
    "ledger_id",
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "detail_keys",
    "exact_tokens",
    "repair_required",
    "finding_level",
    "finding_key",
}
AUDIT_SOURCE_FINDING_LIST_FIELDS = {
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "detail_keys",
    "exact_tokens",
}
AUDIT_FINDING_ARTIFACTS = {
    "semantic_risks.jsonl",
    "owner_routing_findings.jsonl",
}
SCOPE_MANIFEST = "audit_scope_manifest.jsonl"
SCOPE_REQUIRED_FAMILIES = {
    "compiled_atom_detail",
    "compile_target",
    "planunit_claim",
    "reciprocal_source_lineage",
    "owner_consumer_route",
    "schema_contract_identity",
    "dependency_edge",
    "ledger_projection_field",
    "index_governance_check",
    "forbidden_artifact_check",
}
CURRENT_SCOPE_ROW_TYPE_FAMILIES = {
    "atom_acceptance": "compiled_atom_detail",
    "atom_detail": "compiled_atom_detail",
    "atom_exact_token": "compiled_atom_detail",
    "atom_key_shape": "compiled_atom_detail",
    "atom_negative_constraint": "compiled_atom_detail",
    "atom_not_for_plan": "compiled_atom_detail",
    "atom_source_ref": "compiled_atom_detail",
    "planunit_preserved_token": "compiled_atom_detail",
    "atom_to_planunit_target": "compile_target",
    "planunit_canonical_claim": "planunit_claim",
    "planunit_reciprocal_source_lineage": "reciprocal_source_lineage",
    "owner_consumer_route": "owner_consumer_route",
    "schema_contract_identity": "schema_contract_identity",
    "cycle_boundary": "dependency_edge",
    "dependency_edge": "dependency_edge",
    "ledger_projection_field": "ledger_projection_field",
    "ledger_registry_field": "ledger_projection_field",
    "changed_file": "index_governance_check",
    "index_governance_check": "index_governance_check",
    "validator_check": "index_governance_check",
    "forbidden_artifact_check": "forbidden_artifact_check",
}
SCOPE_REQUIRED_FIELDS = {
    "check_id",
    "check_family",
    "audit_id",
    "ledger_id",
    "baseline_ref",
    "subject_ref",
    "observation_ref",
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "detail_keys",
    "exact_tokens",
    "covered_artifacts",
    "classification",
    "repair_required",
    "finding_level",
}
SCOPE_LIST_FIELDS = {
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "detail_keys",
    "exact_tokens",
    "covered_artifacts",
    "finding_keys",
}
UNCLASSIFIED_VALUES = {"", "pending", "todo", "unchecked", "unclassified", "unknown"}
IMPACT_MATRIX = "repair_impact_matrix.jsonl"
IMPACT_REQUIRED_FIELDS = {
    "impact_id",
    "audit_id",
    "ledger_id",
    "baseline_ref",
    "subject_ref",
    "observation_ref",
    "source_artifact",
    "source_row",
    "finding_key",
    "files",
    "plan_unit_ids",
    "schemas",
    "dependency_edges",
    "owner_refs",
    "ledger_projection_fields",
    "index_artifacts",
    "governance_artifacts",
    "scope_check_ids",
    "post_repair_semantic_audit",
}
IMPACT_LIST_FIELDS = {
    "files",
    "plan_unit_ids",
    "schemas",
    "dependency_edges",
    "owner_refs",
    "ledger_projection_fields",
    "index_artifacts",
    "governance_artifacts",
    "scope_check_ids",
}
POST_REPAIR_DRIFT_FIELDS = {
    "schema_identity",
    "reciprocal_lineage",
    "dependencies",
    "owner_routing",
    "ledger_projections",
}
REOPEN_CONDITIONS = {
    "source_atom_hash_changed",
    "plan_unit_hash_changed",
    "owner_evidence_hash_changed",
    "closure_evidence_hash_changed",
    "closure_status_blocked_or_reopened",
}
REGISTRY_REQUIRED_FIELDS = {
    "closure_id",
    "finding_key",
    "finding_family",
    "ledger_id",
    "audit_ids",
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "consumer_docs",
    "detail_keys",
    "exact_tokens",
    "closure_status",
    "closure_evidence",
    "closure_reason",
    "hashes",
    "created_at",
    "updated_at",
    "closed_by_audit_id",
    "reopen_conditions",
}
REGISTRY_LIST_FIELDS = {
    "audit_ids",
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "consumer_docs",
    "detail_keys",
    "exact_tokens",
    "closure_evidence",
    "reopen_conditions",
}
DEFAULT_AUDIT_SOURCE_ARTIFACTS = [
    "gui_platform_currentness_findings.jsonl",
    "storage_coordination_canon_findings.jsonl",
    "platform_specs_authority_findings.jsonl",
    "semantic_risks.jsonl",
    "atom_fidelity_matrix.jsonl",
    "planunit_source_claims.jsonl",
    "owner_routing_findings.jsonl",
    "ledger_consistency.json",
    "validator_results.json",
]
TERMINAL_STATE = "terminal_state.json"
EFFECTIVE_STATUS = "effective_status.json"
GOVERNANCE_FILES = {
    "Plans/Spec_Lock.json",
    "Plans/auto_decisions.jsonl",
    "Plans/plan_graph.json",
    "Plans/sharding_config.json",
}
MATRIX_REQUIRED_FIELDS = {
    "source_artifact",
    "source_row",
    "finding_family",
    "audit_id",
    "ledger_id",
    "baseline_ref",
    "subject_ref",
    "observation_ref",
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "detail_keys",
    "exact_tokens",
    "finding_key",
    "closure_status",
    "closure_evidence",
    "closure_reason",
    "registry_closure_id",
}
ISO_UTC_RE = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")


def rel(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def repo_path(value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else ROOT / path


def read_jsonl(path: Path, errors: list[str], *, required: bool = True) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        if required:
            errors.append(f"missing {rel(path)}")
        return rows
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"{rel(path)}:{line_no}: invalid JSONL: {exc}")
            continue
        if not isinstance(row, dict):
            errors.append(f"{rel(path)}:{line_no}: JSONL row is not an object")
            continue
        row["_line_no"] = line_no
        rows.append(row)
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            clean = {key: value for key, value in row.items() if key != "_line_no"}
            handle.write(json.dumps(clean, sort_keys=True, ensure_ascii=False))
            handle.write("\n")


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def stable_strings(value: Any) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, list):
        return [str(value)]
    return sorted({str(item) for item in value})


def audit_source_atom_ids(row: dict[str, Any]) -> Any:
    if "source_atom_ids" in row:
        return row.get("source_atom_ids")
    return row.get("atom_ids", [])


def normalized_audit_finding_row(row: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(row)
    if "source_atom_ids" not in normalized and "atom_ids" in normalized:
        normalized["source_atom_ids"] = normalized.get("atom_ids", [])
    return normalized


def is_substantive_subject_path(path: str) -> bool:
    """Return true when a path belongs to the audit subject, not audit hygiene."""
    normalized = path.strip().lstrip("./")
    if not normalized:
        return False
    if normalized.startswith("Plans/.audits/"):
        return False
    if normalized.startswith("Plans/.plan_index/"):
        return True
    if normalized.startswith("Plans/_shards/"):
        return True
    if normalized.startswith("Plans/.evidence/"):
        return True
    if normalized in GOVERNANCE_FILES:
        return True
    if normalized.startswith("Plans/ledgers/v2/"):
        return True
    if normalized.startswith("Plans/") and normalized.endswith(".md"):
        return True
    if normalized.startswith("scripts/") and normalized.endswith(".py"):
        return True
    return False


def has_substantive_subject_paths(paths: list[str]) -> bool:
    return any(is_substantive_subject_path(path) for path in paths)


def compute_finding_key(row: dict[str, Any]) -> str:
    payload = {
        "finding_family": str(row.get("finding_family", "")),
        "ledger_id": str(row.get("ledger_id", "")),
        "source_atom_ids": stable_strings(row.get("source_atom_ids")),
        "plan_unit_ids": stable_strings(row.get("plan_unit_ids")),
        "owner_docs": stable_strings(row.get("owner_docs")),
        "detail_keys": stable_strings(row.get("detail_keys")),
        "exact_tokens": stable_strings(row.get("exact_tokens")),
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return f"sfk-{hashlib.sha256(encoded).hexdigest()[:24]}"


def compute_check_id(row: dict[str, Any]) -> str:
    payload = {
        "check_family": str(row.get("check_family", "")),
        "ledger_id": str(row.get("ledger_id", "")),
        "source_atom_ids": stable_strings(row.get("source_atom_ids")),
        "plan_unit_ids": stable_strings(row.get("plan_unit_ids")),
        "owner_docs": stable_strings(row.get("owner_docs")),
        "detail_keys": stable_strings(row.get("detail_keys")),
        "exact_tokens": stable_strings(row.get("exact_tokens")),
        "covered_artifacts": stable_strings(row.get("covered_artifacts")),
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return f"chk-{hashlib.sha256(encoded).hexdigest()[:24]}"


def compute_impact_id(row: dict[str, Any]) -> str:
    payload = {
        "ledger_id": str(row.get("ledger_id", "")),
        "source_artifact": str(row.get("source_artifact", "")),
        "source_row": str(row.get("source_row", "")),
        "finding_key": str(row.get("finding_key", "")),
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return f"imp-{hashlib.sha256(encoded).hexdigest()[:24]}"


def evidence_path_from_ref(ref: str) -> Path | None:
    token = ref.split("#", 1)[0]
    if ":" in token:
        before, after = token.rsplit(":", 1)
        before_path = ROOT / before
        if before.startswith(("Plans/", "scripts/")) and before_path.exists():
            token = before
        elif re.match(r"^\d+(?:-\d+)?$", after) or after == "no matching GoalRun/WorkNode cost owner change":
            token = before
    if token.startswith(("Plans/", "scripts/")) or token in {"AGENTS.md"}:
        return ROOT / token
    return None


def validate_evidence_refs(refs: Any, path_label: str, errors: list[str]) -> None:
    if not isinstance(refs, list) or not refs:
        errors.append(f"{path_label}: closure_evidence must be a non-empty list")
        return
    for ref in refs:
        if not isinstance(ref, str) or not ref.strip():
            errors.append(f"{path_label}: closure_evidence contains a non-string or blank ref")
            continue
        ref_path = evidence_path_from_ref(ref)
        if ref_path is not None and not ref_path.exists():
            errors.append(f"{path_label}: missing evidence ref {ref}")


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate_current_hashes(hash_group: Any, group_name: str, path_label: str, errors: list[str]) -> None:
    if not isinstance(hash_group, dict):
        return
    for ref, stored_hash in sorted(hash_group.items()):
        if not isinstance(ref, str) or not isinstance(stored_hash, str):
            errors.append(f"{path_label}: {group_name} entries must map string refs to string sha256 hashes")
            continue
        ref_path = evidence_path_from_ref(ref)
        if ref_path is None:
            continue
        if not ref_path.exists():
            errors.append(f"{path_label}: {group_name} hash ref is missing: {ref}")
            continue
        if not ref_path.is_file():
            continue
        current_hash = sha256_file(ref_path)
        if stored_hash != current_hash:
            errors.append(
                f"{path_label}: {group_name} for {ref} is stale "
                f"(stored {stored_hash}, current {current_hash})"
            )


def refresh_current_hashes(hash_group: Any) -> tuple[int, list[str]]:
    if not isinstance(hash_group, dict):
        return 0, []
    updated = 0
    missing: list[str] = []
    for ref, stored_hash in sorted(list(hash_group.items())):
        if not isinstance(ref, str) or not isinstance(stored_hash, str):
            continue
        ref_path = evidence_path_from_ref(ref)
        if ref_path is None:
            continue
        if not ref_path.exists():
            missing.append(ref)
            continue
        if not ref_path.is_file():
            continue
        current_hash = sha256_file(ref_path)
        if stored_hash != current_hash:
            hash_group[ref] = current_hash
            updated += 1
    return updated, missing


def validate_hashes(hashes: Any, path_label: str, errors: list[str]) -> None:
    if not isinstance(hashes, dict):
        errors.append(f"{path_label}: hashes must be an object")
        return
    if not any(
        hashes.get(key)
        for key in ("source_atom_hashes", "plan_unit_hashes", "owner_evidence_hashes", "closure_evidence_hashes")
    ):
        errors.append(
            f"{path_label}: hashes must include source_atom_hashes, plan_unit_hashes, "
            "owner_evidence_hashes, or closure_evidence_hashes"
        )
    validate_current_hashes(hashes.get("owner_evidence_hashes"), "owner_evidence_hashes", path_label, errors)
    validate_current_hashes(hashes.get("closure_evidence_hashes"), "closure_evidence_hashes", path_label, errors)


def validate_reopened_proof(row: dict[str, Any], prior_closed: list[dict[str, Any]], path_label: str, errors: list[str]) -> None:
    if not prior_closed:
        errors.append(f"{path_label}: reopened row requires a prior closed row with the same finding_key")
    hashes = row.get("hashes")
    if not isinstance(hashes, dict):
        errors.append(f"{path_label}: reopened row hashes must be an object")
        return
    reopen_changes = hashes.get("reopen_hash_changes")
    if isinstance(reopen_changes, dict) and reopen_changes:
        return
    paired_fields = (
        ("previous_source_atom_hashes", "source_atom_hashes"),
        ("previous_plan_unit_hashes", "plan_unit_hashes"),
        ("previous_owner_evidence_hashes", "owner_evidence_hashes"),
        ("previous_closure_evidence_hashes", "closure_evidence_hashes"),
    )
    if not any(
        hashes.get(previous) and hashes.get(current) and hashes.get(previous) != hashes.get(current)
        for previous, current in paired_fields
    ):
        errors.append(
            f"{path_label}: reopened row must prove changed source/PlanUnit/owner/closure hashes "
            "with reopen_hash_changes or previous/current hash pairs"
        )


def validate_registry(registry_path: Path) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    rows = read_jsonl(registry_path, errors, required=True)
    closure_ids: set[str] = set()
    open_by_key: dict[str, list[str]] = {}
    closed_by_key: dict[str, list[dict[str, Any]]] = {}
    status_counts: dict[str, int] = {}

    for row in rows:
        label = f"{rel(registry_path)}:{row.get('_line_no')}"
        missing = sorted(REGISTRY_REQUIRED_FIELDS - set(row))
        if missing:
            errors.append(f"{label}: missing required fields {missing}")
            continue

        closure_id = str(row.get("closure_id", ""))
        if not closure_id:
            errors.append(f"{label}: closure_id is blank")
        elif closure_id in closure_ids:
            errors.append(f"{label}: duplicate closure_id {closure_id}")
        closure_ids.add(closure_id)

        for field in REGISTRY_LIST_FIELDS:
            if not isinstance(row.get(field), list):
                errors.append(f"{label}: {field} must be a list")

        status = str(row.get("closure_status", ""))
        status_counts[status] = status_counts.get(status, 0) + 1
        if status not in ALLOWED_STATUSES:
            errors.append(f"{label}: invalid closure_status {status}")

        expected_key = compute_finding_key(row)
        if row.get("finding_key") != expected_key:
            errors.append(f"{label}: finding_key {row.get('finding_key')} does not match deterministic {expected_key}")

        audit_ids = row.get("audit_ids")
        closed_by = row.get("closed_by_audit_id")
        if isinstance(audit_ids, list) and closed_by not in audit_ids:
            errors.append(f"{label}: closed_by_audit_id must be present in audit_ids")

        for field in ("created_at", "updated_at"):
            value = row.get(field)
            if not isinstance(value, str) or not ISO_UTC_RE.match(value):
                errors.append(f"{label}: {field} must use YYYY-MM-DDTHH:MM:SSZ")

        if not isinstance(row.get("closure_reason"), str) or not row.get("closure_reason", "").strip():
            errors.append(f"{label}: closure_reason must be non-empty")

        validate_evidence_refs(row.get("closure_evidence"), label, errors)
        validate_hashes(row.get("hashes"), label, errors)

        conditions = set(stable_strings(row.get("reopen_conditions")))
        unknown_conditions = sorted(conditions - REOPEN_CONDITIONS)
        if unknown_conditions:
            errors.append(f"{label}: unknown reopen_conditions {unknown_conditions}")
        missing_conditions = sorted(REOPEN_CONDITIONS - conditions)
        if missing_conditions:
            errors.append(f"{label}: reopen_conditions missing {missing_conditions}")

        finding_key = str(row.get("finding_key", ""))
        if status in OPEN_STATUSES:
            open_by_key.setdefault(finding_key, []).append(closure_id)
            if status == "reopened":
                validate_reopened_proof(row, closed_by_key.get(finding_key, []), label, errors)
                warnings.append(f"{label}: reopened finding remains open until a later closure row resolves it")
        elif status in ALLOWED_STATUSES:
            closed_by_key.setdefault(finding_key, []).append(row)

    for finding_key, ids in sorted(open_by_key.items()):
        if len(ids) > 1:
            errors.append(f"{rel(registry_path)}: duplicate open finding_key {finding_key}: {ids}")

    return {
        "path": rel(registry_path),
        "row_count": len(rows),
        "status_counts": status_counts,
        "errors": errors,
        "warnings": warnings,
    }


def artifact_row_count(path: Path, errors: list[str]) -> int:
    count = 0
    if not path.exists():
        errors.append(f"missing source artifact {rel(path)}")
        return count
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"{rel(path)}:{line_no}: invalid JSONL: {exc}")
            continue
        count += 1
    return count


def explicit_repair_required(
    row: dict[str, Any],
    path_label: str,
    errors: list[str],
) -> bool | None:
    has_repair_required = "repair_required" in row
    has_finding_level = "finding_level" in row
    if not has_repair_required and not has_finding_level:
        return None

    repair_required = row.get("repair_required")
    finding_level = row.get("finding_level")
    if not isinstance(repair_required, bool):
        errors.append(f"{path_label}: repair_required must be a boolean")
    if not isinstance(finding_level, str) or finding_level not in FINDING_LEVELS:
        errors.append(f"{path_label}: finding_level must be one of {sorted(FINDING_LEVELS)}")
    return bool(repair_required) if isinstance(repair_required, bool) else None


def load_json_object(path: Path, errors: list[str], *, required: bool = True) -> dict[str, Any] | None:
    if not path.exists():
        if required:
            errors.append(f"missing {rel(path)}")
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"{rel(path)}: invalid JSON: {exc}")
        return None
    if not isinstance(data, dict):
        errors.append(f"{rel(path)}: JSON root must be an object")
        return None
    return data


def validate_ref_fields(
    row: dict[str, Any],
    expected: dict[str, str],
    path_label: str,
    errors: list[str],
    *,
    require: bool,
    allow_row_scoped_refs: bool = False,
) -> None:
    for field, expected_value in expected.items():
        value = row.get(field)
        if value is None:
            if require:
                errors.append(f"{path_label}: missing required ref field {field}")
            continue
        if not isinstance(value, str) or not value.strip():
            errors.append(f"{path_label}: {field} must be a non-empty string")
            continue
        if allow_row_scoped_refs and field in ROW_SCOPED_REF_FIELDS:
            continue
        if expected_value and value != expected_value:
            errors.append(f"{path_label}: {field} {value!r} does not match audit_report {expected_value!r}")


def load_audit_report(audit_dir: Path, errors: list[str]) -> tuple[dict[str, Any] | None, dict[str, str]]:
    report_path = audit_dir / "audit_report.json"
    report = load_json_object(report_path, errors, required=True)
    refs: dict[str, str] = {}
    if report is None:
        return None, refs
    label = rel(report_path)
    for field in AUDIT_REF_FIELDS:
        value = report.get(field)
        if not isinstance(value, str) or not value.strip():
            errors.append(f"{label}: {field} must be a non-empty string")
            refs[field] = ""
        else:
            refs[field] = value
    return report, refs


def is_finding_row(row: dict[str, Any], artifact: str) -> bool:
    classification = str(row.get("classification", ""))
    return (
        artifact in AUDIT_FINDING_ARTIFACTS
        or row.get("repair_required") is True
        or bool(row.get("finding_key"))
        or bool(row.get("finding_family"))
        or classification == "missing_or_drift"
    )


def validate_source_finding_row(
    row: dict[str, Any],
    artifact: str,
    path_label: str,
    refs: dict[str, str],
    errors: list[str],
) -> None:
    if not is_finding_row(row, artifact):
        return
    row = normalized_audit_finding_row(row)
    missing = sorted(AUDIT_SOURCE_FINDING_REQUIRED_FIELDS - set(row))
    if missing:
        errors.append(f"{path_label}: audit finding missing required fields {missing}")
    validate_ref_fields(row, refs, path_label, errors, require=False, allow_row_scoped_refs=True)
    for field in AUDIT_SOURCE_FINDING_LIST_FIELDS:
        if field in row and not isinstance(row.get(field), list):
            errors.append(f"{path_label}: {field} must be a list")
    explicit_repair_required(row, path_label, errors)
    audit_id = refs.get("audit_id", "")
    finding_key = row.get("finding_key")
    if isinstance(finding_key, str):
        if not finding_key.startswith("sfk-"):
            errors.append(f"{path_label}: finding_key must use deterministic sfk-* form, got {finding_key!r}")
        if audit_id and (finding_key.startswith(audit_id) or f"{audit_id}::" in finding_key or "::" in finding_key):
            errors.append(f"{path_label}: finding_key must not contain audit-specific identity {finding_key!r}")
        if row.get("schema_id") != "pm.semantic_risk.v1":
            expected_key = compute_finding_key(row)
            if finding_key != expected_key:
                errors.append(f"{path_label}: finding_key {finding_key} does not match deterministic {expected_key}")


def validate_source_jsonl_artifact(path: Path, artifact: str, refs: dict[str, str], errors: list[str]) -> int:
    if not path.exists():
        return 0
    finding_count = 0
    for row in read_jsonl(path, errors, required=True):
        label = f"{rel(path)}:{row.get('_line_no')}"
        validate_ref_fields(row, refs, label, errors, require=False, allow_row_scoped_refs=True)
        if is_finding_row(row, artifact):
            finding_count += 1
            validate_source_finding_row(row, artifact, label, refs, errors)
    return finding_count


def validate_source_json_artifact(path: Path, artifact: str, refs: dict[str, str], errors: list[str]) -> int:
    data = load_json_object(path, errors, required=False)
    if data is None:
        return 0
    validate_ref_fields(data, refs, rel(path), errors, require=True, allow_row_scoped_refs=True)
    finding_count = 0
    for field in ("warnings", "findings", "semantic_risks"):
        values = data.get(field)
        if not isinstance(values, list):
            continue
        for index, item in enumerate(values):
            if not isinstance(item, dict):
                continue
            label = f"{rel(path)}:{field}[{index}]"
            validate_ref_fields(item, refs, label, errors, require=False, allow_row_scoped_refs=True)
            if is_finding_row(item, artifact):
                finding_count += 1
                validate_source_finding_row(item, artifact, label, refs, errors)
    return finding_count


def validate_source_artifacts(
    audit_dir: Path,
    requested_artifacts: list[str],
    refs: dict[str, str],
    errors: list[str],
) -> dict[str, Any]:
    finding_count = 0
    for artifact in requested_artifacts:
        path = audit_dir / artifact
        if artifact.endswith(".jsonl"):
            finding_count += validate_source_jsonl_artifact(path, artifact, refs, errors)
        elif artifact.endswith(".json"):
            finding_count += validate_source_json_artifact(path, artifact, refs, errors)
    return {"finding_count": finding_count}


def validate_scope_manifest(audit_dir: Path, refs: dict[str, str], errors: list[str]) -> dict[str, Any]:
    path = audit_dir / SCOPE_MANIFEST
    rows = read_jsonl(path, errors, required=True)
    check_ids: set[str] = set()
    families: set[str] = set()
    classified_rows = 0
    finding_keys: set[str] = set()
    current_scope_schema = any(row.get("schema_id") == "pm.audit_scope_manifest.row.v1" for row in rows)
    for row in rows:
        label = f"{rel(path)}:{row.get('_line_no')}"
        if current_scope_schema:
            row_type = row.get("row_type")
            family = CURRENT_SCOPE_ROW_TYPE_FAMILIES.get(str(row_type))
            if family is None:
                errors.append(f"{label}: unknown row_type {row_type!r}")
            else:
                families.add(family)
            if "atom_ids" in row and not isinstance(row.get("atom_ids"), list):
                errors.append(f"{label}: atom_ids must be a list")
            if not isinstance(row.get("check_id"), str) or not row.get("check_id", "").strip():
                errors.append(f"{label}: check_id must be a non-empty string")
            elif row.get("check_id") in check_ids:
                errors.append(f"{label}: duplicate check_id {row.get('check_id')}")
            else:
                check_ids.add(str(row.get("check_id")))
            validate_ref_fields(row, refs, label, errors, require=True)
            for field in ("atom_ids", "plan_unit_ids", "owner_docs", "detail_keys", "exact_tokens", "source_refs"):
                if field in row and not isinstance(row.get(field), list):
                    errors.append(f"{label}: {field} must be a list")
            continue

        missing = sorted(SCOPE_REQUIRED_FIELDS - set(row))
        if missing:
            errors.append(f"{label}: missing required fields {missing}")
        validate_ref_fields(row, refs, label, errors, require=True, allow_row_scoped_refs=True)
        check_id = row.get("check_id")
        if not isinstance(check_id, str) or not check_id.strip():
            errors.append(f"{label}: check_id must be a non-empty string")
        else:
            if check_id in check_ids:
                errors.append(f"{label}: duplicate check_id {check_id}")
            check_ids.add(check_id)
            expected_id = compute_check_id(row)
            if check_id != expected_id:
                errors.append(f"{label}: check_id {check_id} does not match deterministic {expected_id}")
            audit_id = refs.get("audit_id", "")
            if audit_id and audit_id in check_id:
                errors.append(f"{label}: check_id must not contain audit_id {audit_id}")
        family = row.get("check_family")
        if isinstance(family, str):
            families.add(family)
            if family not in SCOPE_REQUIRED_FAMILIES:
                errors.append(f"{label}: unknown check_family {family!r}")
        else:
            errors.append(f"{label}: check_family must be a string")
        for field in SCOPE_LIST_FIELDS:
            if field in row and not isinstance(row.get(field), list):
                errors.append(f"{label}: {field} must be a list")
        classification = str(row.get("classification", "")).strip().lower()
        if classification in UNCLASSIFIED_VALUES:
            errors.append(f"{label}: classification must be final, not {row.get('classification')!r}")
        else:
            classified_rows += 1
        explicit_repair_required(row, label, errors)
        for key in stable_strings(row.get("finding_keys")):
            finding_keys.add(key)
    missing_families = sorted(SCOPE_REQUIRED_FAMILIES - families)
    if missing_families:
        errors.append(f"{rel(path)}: missing required check_family coverage {missing_families}")
    return {
        "path": rel(path),
        "row_count": len(rows),
        "classified_rows": classified_rows,
        "check_family_count": len(families),
        "missing_check_families": missing_families,
        "finding_keys": sorted(finding_keys),
    }


def validate_post_repair_audit(value: Any, path_label: str, errors: list[str]) -> None:
    if not isinstance(value, dict):
        errors.append(f"{path_label}: post_repair_semantic_audit must be an object")
        return
    status = value.get("status")
    if status not in {"PASS", "PASS_WITH_WARNINGS"}:
        errors.append(f"{path_label}: post_repair_semantic_audit.status must be PASS or PASS_WITH_WARNINGS")
    if value.get("repair_required_count") != 0:
        errors.append(f"{path_label}: post_repair_semantic_audit.repair_required_count must be 0")
    if value.get("covered_original_scope") is not True:
        errors.append(f"{path_label}: post_repair_semantic_audit.covered_original_scope must be true")
    if value.get("covered_impact_rows") is not True:
        errors.append(f"{path_label}: post_repair_semantic_audit.covered_impact_rows must be true")
    drift = value.get("drift")
    if not isinstance(drift, dict):
        errors.append(f"{path_label}: post_repair_semantic_audit.drift must be an object")
        return
    for field in sorted(POST_REPAIR_DRIFT_FIELDS):
        if drift.get(field) is not False:
            errors.append(f"{path_label}: post_repair_semantic_audit.drift.{field} must be false")


def validate_repair_impact_matrix(
    audit_dir: Path,
    refs: dict[str, str],
    actionable_rows: set[tuple[str, str]],
    errors: list[str],
) -> dict[str, Any]:
    path = audit_dir / IMPACT_MATRIX
    if not path.exists():
        if actionable_rows:
            errors.append(f"missing required {rel(path)}")
        return {
            "path": rel(path),
            "row_count": 0,
            "missing_coverage": [
                {"source_artifact": artifact, "source_row": source_row}
                for artifact, source_row in sorted(actionable_rows)
            ][:50],
            "extra_coverage": [],
        }

    rows = read_jsonl(path, errors, required=True)
    covered: set[tuple[str, str]] = set()
    impact_ids: set[str] = set()
    for row in rows:
        label = f"{rel(path)}:{row.get('_line_no')}"
        missing = sorted(IMPACT_REQUIRED_FIELDS - set(row))
        if missing:
            errors.append(f"{label}: missing required fields {missing}")
        validate_ref_fields(row, refs, label, errors, require=True, allow_row_scoped_refs=True)
        impact_id = row.get("impact_id")
        if not isinstance(impact_id, str) or not impact_id.strip():
            errors.append(f"{label}: impact_id must be a non-empty string")
        else:
            if impact_id in impact_ids:
                errors.append(f"{label}: duplicate impact_id {impact_id}")
            impact_ids.add(impact_id)
            expected_id = compute_impact_id(row)
            if impact_id != expected_id:
                errors.append(f"{label}: impact_id {impact_id} does not match deterministic {expected_id}")
            audit_id = refs.get("audit_id", "")
            if audit_id and audit_id in impact_id:
                errors.append(f"{label}: impact_id must not contain audit_id {audit_id}")
        for field in IMPACT_LIST_FIELDS:
            if field in row and not isinstance(row.get(field), list):
                errors.append(f"{label}: {field} must be a list")
        key = source_row_key(str(row.get("source_artifact", "")), row.get("source_row"))
        if key is None:
            errors.append(f"{label}: source_artifact/source_row must identify an actionable audit row")
        else:
            covered.add(key)
        finding_key = row.get("finding_key")
        if not isinstance(finding_key, str) or not finding_key.startswith("sfk-"):
            errors.append(f"{label}: finding_key must use deterministic sfk-* form")
        validate_post_repair_audit(row.get("post_repair_semantic_audit"), label, errors)

    missing_coverage = [
        {"source_artifact": artifact, "source_row": source_row}
        for artifact, source_row in sorted(actionable_rows - covered)
    ]
    if missing_coverage:
        errors.append(f"{rel(path)}: missing impact rows for {len(missing_coverage)} source rows")
    extra_coverage = sorted(covered - actionable_rows)
    if extra_coverage:
        errors.append(f"{rel(path)}: impact rows present for {len(extra_coverage)} non-actionable source rows")
    return {
        "path": rel(path),
        "row_count": len(rows),
        "missing_coverage": missing_coverage[:50],
        "extra_coverage": [
            {"source_artifact": artifact, "source_row": source_row}
            for artifact, source_row in extra_coverage[:50]
        ],
    }


def validate_audit_report_status(
    audit_report: dict[str, Any] | None,
    audit_dir: Path,
    repair_required_count: int,
    finding_count: int,
    errors: list[str],
) -> None:
    if audit_report is None:
        return
    label = rel(audit_dir / "audit_report.json")
    reported_count = audit_report.get("repair_required_count")
    if reported_count != repair_required_count:
        errors.append(
            f"{label}: repair_required_count {reported_count!r} does not match computed {repair_required_count}"
        )
    status = str(audit_report.get("status", "")).upper()
    if repair_required_count > 0 and status != "BLOCKED":
        errors.append(f"{label}: status must be BLOCKED when repair_required_count is {repair_required_count}")
    if repair_required_count == 0 and status == "BLOCKED":
        errors.append(f"{label}: status must not be BLOCKED when repair_required_count is 0")
    if repair_required_count == 0 and finding_count > 0 and status == "PASS":
        errors.append(f"{label}: status should be PASS_WITH_WARNINGS when non-actionable findings exist")


def validate_terminal_state_projection(
    audit_dir: Path,
    refs: dict[str, str],
    projection: dict[str, Any],
    errors: list[str],
) -> dict[str, Any] | None:
    path = audit_dir / TERMINAL_STATE
    if not path.exists():
        return None
    data = load_json_object(path, errors, required=False)
    if data is None:
        return None
    label = rel(path)
    if data.get("schema_id") != "pm.audit_terminal_state.v1":
        errors.append(f"{label}: schema_id must be pm.audit_terminal_state.v1")
    if data.get("audit_id") != refs.get("audit_id"):
        errors.append(f"{label}: audit_id does not match audit_report")
    for field in ("terminal_repair_state", "original_repair_required_count", "open_repair_required_count"):
        if data.get(field) != projection.get(field):
            errors.append(f"{label}: {field} {data.get(field)!r} does not match computed {projection.get(field)!r}")
    if projection.get("terminal_repair_state") == "repair_validated":
        if data.get("effective_terminal_report") != "post_repair_audit_report.json":
            errors.append(f"{label}: effective_terminal_report must be post_repair_audit_report.json for repair_validated")
        if data.get("historical_audit_report") != "audit_report.json":
            errors.append(f"{label}: historical_audit_report must preserve audit_report.json")
    return {
        "path": label,
        "terminal_repair_state": data.get("terminal_repair_state"),
        "effective_terminal_report": data.get("effective_terminal_report"),
    }


def optional_json_object(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else None


def final_report_status(audit_dir: Path) -> dict[str, Any]:
    path = audit_dir / "FINAL_REPORT.md"
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8", errors="replace")
    status_match = re.search(r"(?im)^Status:\s*`?([A-Z_]+)`?", text)
    next_action_match = re.search(r"(?ims)^## Next Action\s+(.+?)(?:\n## |\Z)", text)
    repair_count_match = re.search(r"repair_required_count\s*=\s*(\d+)", text)
    result: dict[str, Any] = {"path": "FINAL_REPORT.md"}
    if status_match:
        result["status"] = status_match.group(1)
    if next_action_match:
        result["next_action"] = " ".join(next_action_match.group(1).split())
    if repair_count_match:
        result["repair_required_count"] = int(repair_count_match.group(1))
    return result


def normalized_terminal_status(status: Any, *, finding_count: int = 0) -> str:
    value = str(status or "").upper()
    if value in {"PASS", "PASS_WITH_WARNINGS", "BLOCKED"}:
        return value
    return "PASS_WITH_WARNINGS" if finding_count else "PASS"


def build_effective_status_projection(audit_dir: Path, audit_validation: dict[str, Any]) -> dict[str, Any]:
    audit_dir = audit_dir if audit_dir.is_absolute() else ROOT / audit_dir
    audit_report = optional_json_object(audit_dir / "audit_report.json") or {}
    post_repair = optional_json_object(audit_dir / "post_repair_audit_report.json") or {}
    terminal_state = optional_json_object(audit_dir / TERMINAL_STATE) or {}
    final_status = final_report_status(audit_dir)

    audit_id = str(audit_report.get("audit_id") or post_repair.get("audit_id") or terminal_state.get("audit_id") or audit_dir.name)
    ledger_id = audit_report.get("ledger_id") or post_repair.get("ledger_id")
    original_count = audit_validation.get("original_repair_required_count")
    if not isinstance(original_count, int):
        original_count = audit_report.get("repair_required_count")
    if not isinstance(original_count, int):
        original_count = final_status.get("repair_required_count")
    open_count = audit_validation.get("repair_required_count")
    if not isinstance(open_count, int):
        open_count = post_repair.get("repair_required_count")
    if not isinstance(open_count, int):
        open_count = audit_report.get("repair_required_count")
    if not isinstance(open_count, int):
        open_count = final_status.get("repair_required_count")

    finding_count = 0
    source_artifacts = audit_validation.get("source_artifacts")
    if isinstance(source_artifacts, dict):
        finding_count = int(source_artifacts.get("finding_count", 0) or 0)

    post_count = post_repair.get("repair_required_count")
    post_status = post_repair.get("status")
    terminal_repair_state = audit_validation.get("terminal_repair_state")
    if terminal_state.get("terminal_repair_state"):
        terminal_repair_state = terminal_state.get("terminal_repair_state")

    if isinstance(post_count, int) and post_count == 0:
        effective_terminal_report = "post_repair_audit_report.json"
        effective_status = normalized_terminal_status(post_status, finding_count=finding_count)
        terminal_repair_state = "repair_validated"
        repair_required_count = 0
    elif isinstance(open_count, int) and open_count > 0:
        effective_terminal_report = "audit_report.json" if audit_report else final_status.get("path", "FINAL_REPORT.md")
        effective_status = "BLOCKED"
        terminal_repair_state = "repair_required"
        repair_required_count = open_count
    else:
        effective_terminal_report = "audit_report.json" if audit_report else final_status.get("path", "FINAL_REPORT.md")
        raw_status = audit_report.get("status") or final_status.get("status")
        if str(raw_status or "").upper() == "BLOCKED":
            effective_status = "PASS_WITH_WARNINGS" if finding_count else "PASS"
        else:
            effective_status = normalized_terminal_status(raw_status, finding_count=finding_count)
        terminal_repair_state = "no_repair_required"
        repair_required_count = 0 if not isinstance(open_count, int) else open_count

    superseded: list[str] = []
    audit_status = str(audit_report.get("status") or "").upper()
    if audit_report and audit_status == "BLOCKED" and effective_status != "BLOCKED":
        superseded.append("audit_report.json")
    if final_status.get("status") == "BLOCKED" and effective_status != "BLOCKED":
        superseded.append("FINAL_REPORT.md")
    if effective_terminal_report == "post_repair_audit_report.json" and (audit_dir / TERMINAL_STATE).exists():
        superseded.append(TERMINAL_STATE)

    projection = {
        "schema_id": "pm.audit_effective_status.v1",
        "audit_id": audit_id,
        "ledger_id": ledger_id,
        "effective_status": effective_status,
        "terminal_repair_state": terminal_repair_state,
        "repair_required_count": repair_required_count,
        "repair_required_count_source": "closure_validation" if isinstance(audit_validation.get("repair_required_count"), int) else "report_projection",
        "original_repair_required_count": original_count,
        "effective_terminal_report": effective_terminal_report,
        "superseded_historical_reports": sorted(set(superseded)),
        "status_sources": {
            "audit_report_status": audit_report.get("status"),
            "audit_report_repair_required_count": audit_report.get("repair_required_count"),
            "final_report_status": final_status.get("status"),
            "final_report_repair_required_count": final_status.get("repair_required_count"),
            "post_repair_status": post_repair.get("status"),
            "post_repair_repair_required_count": post_repair.get("repair_required_count"),
            "terminal_state_status": terminal_state.get("terminal_status"),
        },
        "notes": [],
    }
    if superseded:
        projection["notes"].append("Historical status artifacts are preserved but superseded by this effective status projection.")
    if effective_status == "BLOCKED":
        projection["notes"].append("BLOCKED is effective only while repair_required_count is greater than zero or no later no-repair terminal evidence exists.")
    else:
        projection["notes"].append("No open actionable repair is represented by this audit effective status.")
    return projection


def validate_effective_status_projection(
    audit_dir: Path,
    audit_validation: dict[str, Any],
    errors: list[str],
    *,
    required: bool,
) -> dict[str, Any] | None:
    path = audit_dir / EFFECTIVE_STATUS
    expected = build_effective_status_projection(audit_dir, audit_validation)
    if not path.exists():
        if required:
            errors.append(f"missing {rel(path)}")
        return None
    data = load_json_object(path, errors, required=False)
    if data is None:
        return None
    label = rel(path)
    for field in (
        "schema_id",
        "audit_id",
        "effective_status",
        "terminal_repair_state",
        "repair_required_count",
        "effective_terminal_report",
        "superseded_historical_reports",
    ):
        if data.get(field) != expected.get(field):
            errors.append(f"{label}: {field} {data.get(field)!r} does not match computed {expected.get(field)!r}")
    if data.get("schema_id") != "pm.audit_effective_status.v1":
        errors.append(f"{label}: schema_id must be pm.audit_effective_status.v1")
    return {
        "path": label,
        "effective_status": data.get("effective_status"),
        "repair_required_count": data.get("repair_required_count"),
        "effective_terminal_report": data.get("effective_terminal_report"),
    }


def legacy_actionable_jsonl_row(row: dict[str, Any], artifact: str) -> bool:
    """Compatibility inference for pre-repair_required audit artifacts."""
    risk_key = str(row.get("risk_key", "")).lower()
    finding_family = str(row.get("finding_family", "")).lower()
    if any(
        token in risk_key or token in finding_family
        for token in (
            "latest_audit_projection_stale",
            "repair_report_next_safe_action_stale",
            "review_commit",
            "review_or_commit",
            "audit_artifact_historical_next_action",
            "audit_artifact_wording",
        )
    ):
        return False
    if artifact == "semantic_risks.jsonl":
        classification = str(row.get("classification", ""))
        severity = str(row.get("severity", row.get("finding_level", ""))).lower()
        if classification in {"source_lineage_only", "not_for_plan", "stale_retired", "explicitly_deferred"}:
            return False
        return classification == "missing_or_drift" or severity in {"blocker", "high"}

    classification = str(row.get("classification", ""))
    if classification in TERMINAL_CLASSIFICATIONS:
        return False
    if classification == "missing_or_drift":
        return True

    status = str(row.get("status", "")).lower()
    if status in {"fail", "failed", "blocked", "blocker"}:
        return True

    claim_status = str(row.get("claim_status", ""))
    if claim_status and claim_status != "source_lineage_supported":
        return True

    issues = row.get("issues")
    if isinstance(issues, list) and bool(issues):
        return True

    for field in (
        "overclaim_notes",
        "missing_from_planunit_source_atoms",
        "extra_planunit_source_atoms_not_in_compile_queue",
    ):
        value = row.get(field)
        if isinstance(value, list) and value:
            return True
    return False


def actionable_jsonl_rows(path: Path, artifact: str, errors: list[str]) -> list[str]:
    rows: list[str] = []
    if not path.exists():
        errors.append(f"missing source artifact {rel(path)}")
        return rows
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"{rel(path)}:{line_no}: invalid JSONL: {exc}")
            continue
        explicit = explicit_repair_required(row, f"{rel(path)}:{line_no}", errors)
        if explicit is True:
            rows.append(str(line_no))
            continue
        if explicit is False:
            continue
        if legacy_actionable_jsonl_row(row, artifact):
            rows.append(str(line_no))
    return rows


def actionable_warning_rows(data: dict[str, Any], artifact: str, errors: list[str]) -> list[str]:
    rows: list[str] = []
    for field in ("warnings", "findings", "semantic_risks"):
        values = data.get(field)
        if not isinstance(values, list):
            continue
        for index, item in enumerate(values):
            if not isinstance(item, dict):
                continue
            explicit = explicit_repair_required(item, f"{artifact}:{field}[{index}]", errors)
            if explicit is True:
                rows.append(f"{field}[{index}]")
            elif explicit is None and legacy_actionable_jsonl_row(item, artifact):
                rows.append(f"{field}[{index}]")
    return rows


def actionable_json_rows(path: Path, artifact: str, errors: list[str]) -> list[str]:
    if not path.exists():
        errors.append(f"missing source artifact {rel(path)}")
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"{rel(path)}: invalid JSON: {exc}")
        return []
    rows: list[str] = []
    if isinstance(data, dict):
        explicit = explicit_repair_required(data, rel(path), errors)
        if explicit is True:
            rows.append("$")
        elif explicit is False:
            return rows

    if artifact == "ledger_consistency.json":
        rows.extend(actionable_warning_rows(data, artifact, errors))
        new_units = (
            data.get("compile_queue", {})
            .get("range_new_plan_units_not_in_compile_queue", [])
        )
        if new_units:
            rows.append("compile_queue.range_new_plan_units_not_in_compile_queue")
        questions = (
            data.get("sealed_ledger_open_item_policy", {})
            .get("open_questions", [])
        )
        if questions:
            rows.append("sealed_ledger_open_item_policy.open_questions")
    elif artifact == "validator_results.json":
        if data.get("non_audit_side_effects"):
            rows.append("non_audit_side_effects")
        for result in data.get("results", []):
            name = str(result.get("name", "unnamed"))
            explicit = explicit_repair_required(result, f"{rel(path)}:results.{name}", errors)
            if explicit is True:
                rows.append(f"results.{name}")
                continue
            if explicit is False:
                continue
            status = result.get("status")
            passed = status == "pass" or (status is None and result.get("exit_code") == 0)
            side_effect_count = result.get("side_effect_count", 0)
            if not passed or (isinstance(side_effect_count, int) and side_effect_count > 0):
                rows.append(f"results.{name}")
    return rows


def actionable_artifact_rows(path: Path, artifact: str, errors: list[str]) -> list[str]:
    if artifact.endswith(".jsonl"):
        return actionable_jsonl_rows(path, artifact, errors)
    if artifact.endswith(".json"):
        return actionable_json_rows(path, artifact, errors)
    return [str(line_no) for line_no in range(1, artifact_row_count(path, errors) + 1)]


def source_row_key(artifact: str, source_row: Any) -> tuple[str, str] | None:
    if source_row is None:
        return None
    if isinstance(source_row, int):
        return (artifact, str(source_row))
    if isinstance(source_row, str) and source_row:
        return (artifact, source_row)
    return None


def registry_lookup(registry_path: Path, errors: list[str]) -> dict[str, dict[str, Any]]:
    rows = read_jsonl(registry_path, errors, required=True)
    lookup: dict[str, dict[str, Any]] = {}
    for row in rows:
        closure_id = row.get("closure_id")
        if isinstance(closure_id, str) and closure_id:
            lookup[closure_id] = row
    return lookup


def validate_audit_dir(
    audit_dir: Path,
    *,
    require_matrix: bool,
    require_effective_status: bool,
    source_artifacts: list[str] | None,
    registry_path: Path,
) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    audit_dir = audit_dir if audit_dir.is_absolute() else ROOT / audit_dir
    matrix_path = audit_dir / "repair_closure_matrix.jsonl"
    if not audit_dir.exists():
        return {"path": rel(audit_dir), "errors": [f"missing audit dir {rel(audit_dir)}"], "warnings": warnings}

    audit_report, audit_refs = load_audit_report(audit_dir, errors)

    requested_artifacts = source_artifacts
    if requested_artifacts is None:
        requested_artifacts = [name for name in DEFAULT_AUDIT_SOURCE_ARTIFACTS if (audit_dir / name).exists()]

    source_report = validate_source_artifacts(audit_dir, requested_artifacts, audit_refs, errors)
    scope_report = validate_scope_manifest(audit_dir, audit_refs, errors)

    actionable_rows: set[tuple[str, str]] = set()
    for artifact in requested_artifacts:
        for source_row in actionable_artifact_rows(audit_dir / artifact, artifact, errors):
            actionable_rows.add((artifact, str(source_row)))

    impact_report = validate_repair_impact_matrix(audit_dir, audit_refs, actionable_rows, errors)
    validate_audit_report_status(
        audit_report,
        audit_dir,
        repair_required_count=len(actionable_rows),
        finding_count=int(source_report.get("finding_count", 0)),
        errors=errors,
    )

    if not matrix_path.exists():
        if require_matrix and actionable_rows:
            errors.append(f"missing required {rel(matrix_path)}")
        else:
            if not require_matrix:
                warnings.append(f"no repair_closure_matrix.jsonl found for {rel(audit_dir)}; completeness check skipped")
        effective_status_report = validate_effective_status_projection(
            audit_dir,
            {
                "source_artifacts": source_report,
                "original_repair_required_count": len(actionable_rows),
                "repair_required_count": len(actionable_rows),
                "terminal_repair_state": "repair_required" if actionable_rows else "no_repair_required",
            },
            errors,
            required=require_effective_status,
        )
        report = {
            "path": rel(audit_dir),
            "errors": errors,
            "warnings": warnings,
            "matrix_rows": 0,
            "coverage_artifacts": requested_artifacts,
            "source_artifacts": source_report,
            "scope_manifest": {key: value for key, value in scope_report.items() if key != "finding_keys"},
            "repair_impact_matrix": impact_report,
            "original_repair_required_count": len(actionable_rows),
            "repair_required_count": len(actionable_rows),
            "matrix_required": bool(actionable_rows),
            "terminal_repair_state": "repair_required" if actionable_rows else "no_repair_required",
            "missing_coverage": [
                {"source_artifact": artifact, "source_row": source_row}
                for artifact, source_row in sorted(actionable_rows)
            ][:50] if actionable_rows else [],
        }
        if effective_status_report is not None:
            report["effective_status_projection"] = effective_status_report
        return report

    rows = read_jsonl(matrix_path, errors, required=True)
    registry_by_id = registry_lookup(registry_path, errors)
    covered: set[tuple[str, str]] = set()
    status_counts: dict[str, int] = {}
    open_matrix_rows: list[dict[str, Any]] = []

    for row in rows:
        label = f"{rel(matrix_path)}:{row.get('_line_no')}"
        missing = sorted(MATRIX_REQUIRED_FIELDS - set(row))
        if missing:
            errors.append(f"{label}: missing required fields {missing}")
        validate_ref_fields(row, audit_refs, label, errors, require=True, allow_row_scoped_refs=True)
        status = str(row.get("closure_status", ""))
        status_counts[status] = status_counts.get(status, 0) + 1
        if status not in ALLOWED_STATUSES:
            errors.append(f"{label}: invalid closure_status {status}")
        if status == "reopened":
            errors.append(f"{label}: repair_closure_matrix rows must close the item, not use reopened")
        if status in OPEN_STATUSES:
            open_matrix_rows.append(
                {
                    "source_artifact": row.get("source_artifact"),
                    "source_row": row.get("source_row"),
                    "finding_key": row.get("finding_key"),
                    "closure_status": status,
                }
            )
        finding_key = row.get("finding_key")
        if not isinstance(finding_key, str) or not finding_key.strip():
            errors.append(f"{label}: finding_key must be non-empty")
        elif finding_key != compute_finding_key(row):
            errors.append(f"{label}: finding_key {finding_key} does not match deterministic {compute_finding_key(row)}")
        for field in ("source_atom_ids", "plan_unit_ids", "owner_docs", "detail_keys", "exact_tokens"):
            if not isinstance(row.get(field), list):
                errors.append(f"{label}: {field} must be a list")
        closure_reason = row.get("closure_reason")
        if not isinstance(closure_reason, str) or not closure_reason.strip():
            errors.append(f"{label}: closure_reason must be non-empty")
        registry_closure_id = row.get("registry_closure_id")
        if not isinstance(registry_closure_id, str) or not registry_closure_id.strip():
            errors.append(f"{label}: registry_closure_id must be non-empty")
        elif registry_closure_id not in registry_by_id:
            errors.append(f"{label}: registry_closure_id {registry_closure_id} is not present in registry")
        else:
            registry_row = registry_by_id[registry_closure_id]
            if registry_row.get("finding_key") != finding_key:
                errors.append(f"{label}: registry row finding_key does not match matrix finding_key")
            if registry_row.get("closure_status") != status:
                errors.append(f"{label}: registry row closure_status does not match matrix closure_status")
            if audit_dir.name not in registry_row.get("audit_ids", []):
                errors.append(f"{label}: registry row audit_ids does not include {audit_dir.name}")
            if registry_row.get("closed_by_audit_id") != audit_dir.name:
                errors.append(f"{label}: registry row closed_by_audit_id does not match {audit_dir.name}")
        artifact = row.get("source_artifact")
        if artifact is not None and not isinstance(artifact, str):
            errors.append(f"{label}: source_artifact must be a string")
            continue
        if isinstance(artifact, str):
            source_path = audit_dir / artifact
            if not source_path.exists():
                errors.append(f"{label}: source_artifact does not exist: {artifact}")
            key = source_row_key(artifact, row.get("source_row"))
            if key:
                covered.add(key)
            else:
                errors.append(f"{label}: source_row must be a non-empty string or integer")

        evidence = row.get("closure_evidence", row.get("evidence"))
        validate_evidence_refs(evidence, label, errors)

    missing_coverage: list[dict[str, Any]] = []
    for artifact, source_row in sorted(actionable_rows):
        if (artifact, source_row) not in covered:
            missing_coverage.append({"source_artifact": artifact, "source_row": source_row})

    if missing_coverage:
        errors.append(f"{rel(matrix_path)}: missing closure rows for {len(missing_coverage)} source rows")

    extra_coverage = sorted(covered - actionable_rows)
    if extra_coverage:
        errors.append(f"{rel(matrix_path)}: closure rows present for {len(extra_coverage)} non-actionable source rows")

    open_repair_required_count = len(missing_coverage) + len(open_matrix_rows)
    if open_repair_required_count:
        terminal_repair_state = "repair_required"
    elif actionable_rows:
        terminal_repair_state = "repair_validated"
    else:
        terminal_repair_state = "no_repair_required"
    terminal_projection = {
        "terminal_repair_state": terminal_repair_state,
        "original_repair_required_count": len(actionable_rows),
        "open_repair_required_count": open_repair_required_count,
        "effective_terminal_report": "post_repair_audit_report.json" if terminal_repair_state == "repair_validated" else "audit_report.json",
        "historical_audit_report": "audit_report.json",
        "matrix_status_counts": status_counts,
    }
    terminal_state_report = validate_terminal_state_projection(audit_dir, audit_refs, terminal_projection, errors)
    effective_status_report = validate_effective_status_projection(
        audit_dir,
        {
            "source_artifacts": source_report,
            "original_repair_required_count": len(actionable_rows),
            "repair_required_count": open_repair_required_count,
            "terminal_repair_state": terminal_repair_state,
        },
        errors,
        required=require_effective_status,
    )

    report = {
        "path": rel(audit_dir),
        "matrix": rel(matrix_path),
        "matrix_rows": len(rows),
        "status_counts": status_counts,
        "coverage_artifacts": requested_artifacts,
        "source_artifacts": source_report,
        "scope_manifest": {key: value for key, value in scope_report.items() if key != "finding_keys"},
        "repair_impact_matrix": impact_report,
        "original_repair_required_count": len(actionable_rows),
        "repair_required_count": open_repair_required_count,
        "matrix_required": bool(actionable_rows),
        "terminal_repair_state": terminal_repair_state,
        "terminal_projection": terminal_projection,
        "open_matrix_rows": open_matrix_rows,
        "missing_coverage": missing_coverage[:50],
        "extra_coverage": [
            {"source_artifact": artifact, "source_row": source_row}
            for artifact, source_row in extra_coverage[:50]
        ],
        "errors": errors,
        "warnings": warnings,
    }
    if terminal_state_report is not None:
        report["terminal_state_projection"] = terminal_state_report
    if effective_status_report is not None:
        report["effective_status_projection"] = effective_status_report
    return report


def cmd_validate(args: argparse.Namespace) -> int:
    registry_path = repo_path(args.registry)
    registry = validate_registry(registry_path)
    audit_reports = [
        validate_audit_dir(
            repo_path(audit_dir),
            require_matrix=args.require_closure_matrix,
            require_effective_status=args.require_effective_status,
            source_artifacts=args.source_artifact,
            registry_path=registry_path,
        )
        for audit_dir in args.audit_dir
    ]
    errors = list(registry["errors"])
    warnings = list(registry["warnings"])
    for report in audit_reports:
        errors.extend(report.get("errors", []))
        warnings.extend(report.get("warnings", []))

    result = {
        "schema_id": "pm.audit_closure.validator_report.v1",
        "status": "fail" if errors else "pass",
        "registry": registry,
        "audit_dirs": audit_reports,
        "errors": errors,
        "warnings": warnings,
    }
    print(json.dumps(result, indent=2, sort_keys=True))
    return 1 if errors else 0


def cmd_effective_status(args: argparse.Namespace) -> int:
    registry_path = repo_path(args.registry)
    audit_dirs = [repo_path(audit_dir) for audit_dir in args.audit_dir]
    if args.all:
        audit_dirs.extend(sorted(path for path in (ROOT / "Plans/.audits").iterdir() if path.is_dir()))
    seen: set[str] = set()
    unique_audit_dirs: list[Path] = []
    for audit_dir in audit_dirs:
        key = str(audit_dir.resolve())
        if key not in seen:
            seen.add(key)
            unique_audit_dirs.append(audit_dir)

    projections: list[dict[str, Any]] = []
    errors: list[str] = []
    for audit_dir in unique_audit_dirs:
        validation = validate_audit_dir(
            audit_dir,
            require_matrix=False,
            require_effective_status=False,
            source_artifacts=args.source_artifact,
            registry_path=registry_path,
        )
        projection = build_effective_status_projection(audit_dir, validation)
        projections.append(projection)
        if args.write:
            write_json(audit_dir / EFFECTIVE_STATUS, projection)
        if projection["effective_status"] == "BLOCKED" and projection.get("repair_required_count") == 0:
            errors.append(f"{rel(audit_dir / EFFECTIVE_STATUS)}: BLOCKED cannot have repair_required_count=0")

    result = {
        "schema_id": "pm.audit_effective_status.summary.v1",
        "status": "fail" if errors else "pass",
        "write": bool(args.write),
        "audit_count": len(projections),
        "status_counts": {},
        "errors": errors,
        "audits": projections,
    }
    for projection in projections:
        status = str(projection.get("effective_status"))
        result["status_counts"][status] = result["status_counts"].get(status, 0) + 1
    print(json.dumps(result, indent=2, sort_keys=True))
    return 1 if errors else 0


def cmd_refresh_hashes(args: argparse.Namespace) -> int:
    registry_path = repo_path(args.registry)
    errors: list[str] = []
    rows = read_jsonl(registry_path, errors, required=True)
    if errors:
        print(json.dumps({
            "schema_id": "pm.audit_closure.refresh_hashes_report.v1",
            "status": "fail",
            "path": rel(registry_path),
            "errors": errors,
        }, indent=2, sort_keys=True))
        return 1

    owner_updates = 0
    closure_updates = 0
    missing_refs: list[dict[str, Any]] = []
    touched_rows = 0
    now = utc_now()
    for row in rows:
        hashes = row.get("hashes")
        if not isinstance(hashes, dict):
            continue
        before_owner = owner_updates
        before_closure = closure_updates
        updated, missing = refresh_current_hashes(hashes.get("owner_evidence_hashes"))
        owner_updates += updated
        missing_refs.extend(
            {"line": row.get("_line_no"), "group": "owner_evidence_hashes", "ref": ref}
            for ref in missing
        )
        updated, missing = refresh_current_hashes(hashes.get("closure_evidence_hashes"))
        closure_updates += updated
        missing_refs.extend(
            {"line": row.get("_line_no"), "group": "closure_evidence_hashes", "ref": ref}
            for ref in missing
        )
        if owner_updates != before_owner or closure_updates != before_closure:
            row["updated_at"] = now
            touched_rows += 1

    if missing_refs:
        print(json.dumps({
            "schema_id": "pm.audit_closure.refresh_hashes_report.v1",
            "status": "fail",
            "path": rel(registry_path),
            "missing_refs": missing_refs,
        }, indent=2, sort_keys=True))
        return 1

    if not args.dry_run:
        write_jsonl(registry_path, rows)

    print(json.dumps({
        "schema_id": "pm.audit_closure.refresh_hashes_report.v1",
        "status": "pass",
        "path": rel(registry_path),
        "dry_run": bool(args.dry_run),
        "row_count": len(rows),
        "touched_rows": touched_rows,
        "owner_evidence_hash_updates": owner_updates,
        "closure_evidence_hash_updates": closure_updates,
    }, indent=2, sort_keys=True))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command")
    validate = sub.add_parser("validate", help="Validate semantic closure registry and optional audit closure matrix.")
    validate.add_argument("--registry", default=str(DEFAULT_REGISTRY), help="Path to _semantic_closure_registry.jsonl.")
    validate.add_argument("--audit-dir", action="append", default=[], help="Audit directory to validate.")
    validate.add_argument("--require-closure-matrix", action="store_true", help="Fail if an audit dir lacks repair_closure_matrix.jsonl.")
    validate.add_argument("--require-effective-status", action="store_true", help="Fail if an audit dir lacks effective_status.json.")
    validate.add_argument(
        "--source-artifact",
        action="append",
        default=None,
        help="Audit JSONL artifact that must be covered by repair_closure_matrix.jsonl. Repeatable.",
    )
    validate.set_defaults(func=cmd_validate)
    effective = sub.add_parser("effective-status", help="List or write per-audit effective terminal status projections.")
    effective.add_argument("--registry", default=str(DEFAULT_REGISTRY), help="Path to _semantic_closure_registry.jsonl.")
    effective.add_argument("--audit-dir", action="append", default=[], help="Audit directory to summarize.")
    effective.add_argument("--all", action="store_true", help="Summarize every directory under Plans/.audits.")
    effective.add_argument("--write", action="store_true", help="Write effective_status.json in each selected audit dir.")
    effective.add_argument(
        "--source-artifact",
        action="append",
        default=None,
        help="Audit JSONL artifact to use for closure validation. Repeatable.",
    )
    effective.set_defaults(func=cmd_effective_status)
    refresh = sub.add_parser("refresh-hashes", help="Refresh current owner/closure evidence file hashes in the semantic closure registry.")
    refresh.add_argument("--registry", default=str(DEFAULT_REGISTRY), help="Path to _semantic_closure_registry.jsonl.")
    refresh.add_argument("--dry-run", action="store_true", help="Report updates without writing.")
    refresh.set_defaults(func=cmd_refresh_hashes)

    if len(sys.argv) == 1:
        args = parser.parse_args(["validate"])
    else:
        args = parser.parse_args()
    if not hasattr(args, "func"):
        parser.print_help()
        return 2
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
