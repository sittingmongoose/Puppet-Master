#!/usr/bin/env python3
"""Validate PM semantic audit closure registry and repair closure matrices."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
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
    "semantic_risks.jsonl",
    "atom_fidelity_matrix.jsonl",
    "planunit_source_claims.jsonl",
    "owner_routing_findings.jsonl",
]
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


def stable_strings(value: Any) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, list):
        return [str(value)]
    return sorted({str(item) for item in value})


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


def evidence_path_from_ref(ref: str) -> Path | None:
    token = ref.split("#", 1)[0]
    if ":" in token:
        before, after = token.rsplit(":", 1)
        if after.isdigit() or after == "no matching GoalRun/WorkNode cost owner change":
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


def validate_registry(registry_path: Path) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    rows = read_jsonl(registry_path, errors, required=True)
    closure_ids: set[str] = set()
    open_by_key: dict[str, list[str]] = {}
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
                warnings.append(f"{label}: reopened finding remains open until a later closure row resolves it")

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


def source_row_key(artifact: str, source_row: Any) -> tuple[str, str] | None:
    if source_row is None:
        return None
    if isinstance(source_row, int):
        return (artifact, str(source_row))
    if isinstance(source_row, str) and source_row:
        return (artifact, source_row)
    return None


def validate_audit_dir(audit_dir: Path, *, require_matrix: bool, source_artifacts: list[str] | None) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    audit_dir = audit_dir if audit_dir.is_absolute() else ROOT / audit_dir
    matrix_path = audit_dir / "repair_closure_matrix.jsonl"
    if not audit_dir.exists():
        return {"path": rel(audit_dir), "errors": [f"missing audit dir {rel(audit_dir)}"], "warnings": warnings}
    if not matrix_path.exists():
        if require_matrix:
            errors.append(f"missing required {rel(matrix_path)}")
        else:
            warnings.append(f"no repair_closure_matrix.jsonl found for {rel(audit_dir)}; completeness check skipped")
        return {"path": rel(audit_dir), "errors": errors, "warnings": warnings, "matrix_rows": 0}

    rows = read_jsonl(matrix_path, errors, required=True)
    covered: set[tuple[str, str]] = set()
    status_counts: dict[str, int] = {}

    for row in rows:
        label = f"{rel(matrix_path)}:{row.get('_line_no')}"
        status = str(row.get("closure_status", ""))
        status_counts[status] = status_counts.get(status, 0) + 1
        if status not in ALLOWED_STATUSES:
            errors.append(f"{label}: invalid closure_status {status}")
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

        evidence = row.get("closure_evidence", row.get("evidence"))
        if isinstance(evidence, list):
            for ref in evidence:
                if isinstance(ref, str):
                    ref_path = evidence_path_from_ref(ref)
                    if ref_path is not None and not ref_path.exists():
                        warnings.append(f"{label}: missing evidence ref {ref}")

    requested_artifacts = source_artifacts
    if requested_artifacts is None:
        requested_artifacts = [name for name in DEFAULT_AUDIT_SOURCE_ARTIFACTS if (audit_dir / name).exists()]
        if "semantic_risks.jsonl" in requested_artifacts:
            requested_artifacts = ["semantic_risks.jsonl"]

    missing_coverage: list[dict[str, Any]] = []
    for artifact in requested_artifacts:
        row_total = artifact_row_count(audit_dir / artifact, errors)
        for line_no in range(1, row_total + 1):
            if (artifact, str(line_no)) not in covered:
                missing_coverage.append({"source_artifact": artifact, "source_row": line_no})

    if missing_coverage:
        errors.append(f"{rel(matrix_path)}: missing closure rows for {len(missing_coverage)} source rows")

    return {
        "path": rel(audit_dir),
        "matrix": rel(matrix_path),
        "matrix_rows": len(rows),
        "status_counts": status_counts,
        "coverage_artifacts": requested_artifacts,
        "missing_coverage": missing_coverage[:50],
        "errors": errors,
        "warnings": warnings,
    }


def cmd_validate(args: argparse.Namespace) -> int:
    registry = validate_registry(repo_path(args.registry))
    audit_reports = [
        validate_audit_dir(repo_path(audit_dir), require_matrix=args.require_closure_matrix, source_artifacts=args.source_artifact)
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


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command")
    validate = sub.add_parser("validate", help="Validate semantic closure registry and optional audit closure matrix.")
    validate.add_argument("--registry", default=str(DEFAULT_REGISTRY), help="Path to _semantic_closure_registry.jsonl.")
    validate.add_argument("--audit-dir", action="append", default=[], help="Audit directory to validate.")
    validate.add_argument("--require-closure-matrix", action="store_true", help="Fail if an audit dir lacks repair_closure_matrix.jsonl.")
    validate.add_argument(
        "--source-artifact",
        action="append",
        default=None,
        help="Audit JSONL artifact that must be covered by repair_closure_matrix.jsonl. Repeatable.",
    )
    validate.set_defaults(func=cmd_validate)

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
