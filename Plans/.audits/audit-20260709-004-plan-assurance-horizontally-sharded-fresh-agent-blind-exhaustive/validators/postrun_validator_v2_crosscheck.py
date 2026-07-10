#!/usr/bin/env python3
"""Independent safety cross-check for audit-004 postrun validator v2.

This script intentionally does not import the primary validator. It proves
that every mechanically eligible receipt in a v2 snapshot has a positive
manifest, a matching completed dispatch, an immutable raw-result hash, the
required arrays, exact in-range evidence quotes, and no attempt-level failure
or quarantine veto. It also verifies fail-closed root-credit accounting.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve()
ROOT = HERE.parents[2] if HERE.parent.name == "frozen" else HERE.parents[1]
REPO = ROOT.parents[2]
REQUIRED_ARRAYS = (
    "observations",
    "candidate_findings",
    "explicit_non_gaps",
    "unknowns",
    "exact_evidence_refs",
)
POSITIVE = {
    "accepted",
    "complete",
    "completed",
    "completed_valid",
    "pass",
    "passed",
    "success",
    "succeeded",
    "valid",
    "validated",
    "valid_result",
    "valid_terminal",
}
REVOKED_ASSIGNMENTS = {
    "A004-000018-ADVERSARIAL-WIN-510B3DE676A3-0003",
    "A004-000023-EXACT-WIN-F25915291C7A-0002",
    "A004-000028-ADVERSARIAL-WIN-C45446C7AC96-0003",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        row = json.loads(line)
        row["_source"] = f"{path.relative_to(ROOT)}:{line_no}"
        rows.append(row)
    return rows


def first(record: dict[str, Any], *names: str) -> Any:
    for name in names:
        if name in record:
            return record[name]
    return None


def attempt_token(record: dict[str, Any]) -> str | None:
    value = first(record, "attempt_id", "attempt", "attempt_no", "attempt_number")
    if value is None:
        return None
    if isinstance(value, int):
        return str(value)
    text = str(value)
    match = re.search(r"attempt[-_]?(\d+)$", text, re.IGNORECASE)
    return str(int(match.group(1))) if match else text


def same_attempt(left: dict[str, Any], right: dict[str, Any]) -> bool:
    if left.get("assignment_id") != right.get("assignment_id"):
        return False
    for field in ("agent_instance_id", "agent_thread_id", "agent_path"):
        if left.get(field) and right.get(field):
            return left[field] == right[field]
    left_attempt = attempt_token(left)
    right_attempt = attempt_token(right)
    if left_attempt is not None and right_attempt is not None:
        return left_attempt == right_attempt
    return True


def resolve_ref(value: Any) -> Path | None:
    if not isinstance(value, str) or not value:
        return None
    path = Path(value)
    if path.is_absolute():
        return path
    if path.parts and path.parts[0] in {
        "assignments",
        "capsules",
        "coordination",
        "manifests",
        "runners",
        "validators",
    }:
        return ROOT / path
    return REPO / path


def under(path: Path, parent: Path) -> bool:
    try:
        path.resolve().relative_to(parent.resolve())
        return True
    except (OSError, ValueError):
        return False


def normalized(value: str) -> str:
    return " ".join(value.split())


def evidence_parts(ref: dict[str, Any]) -> tuple[Any, Any, Any, Any]:
    path = first(ref, "path", "document_path", "file")
    start = first(ref, "line_start", "start_line")
    end = first(ref, "line_end", "end_line")
    quote = first(ref, "quote", "excerpt", "exact_excerpt", "exact_quote")
    compact = ref.get("ref")
    if (path is None or start is None) and isinstance(compact, str):
        match = re.fullmatch(r"(.+):(\d+)(?:-(\d+))?", compact.strip())
        if match:
            path = path or match.group(1)
            start = start or int(match.group(2))
            end = end or int(match.group(3) or match.group(2))
    return path, start, end, quote


def manifest_positive(row: dict[str, Any]) -> bool:
    credit = first(row, "coverage_credit", "valid_coverage", "coverage_count")
    if credit not in (1, True):
        return False
    if any(row.get(field) is False for field in ("validation_passed", "valid", "valid_coverage")):
        return False
    if any(isinstance(row.get(field), list) and row[field] for field in ("errors", "validation_errors")):
        return False
    if any(
        row.get(field) is True
        for field in (
            "validation_passed",
            "valid",
            "valid_coverage",
            "schema_validation_passed",
            "dispatch_validation_passed",
            "exact_evidence_validation_passed",
            "scope_validation_passed",
        )
    ):
        return True
    return any(
        str(row.get(field, "")).lower() in POSITIVE
        for field in (
            "schema_validation",
            "hash_validation",
            "range_validation",
            "validation_status",
            "status",
            "result_status",
            "state",
            "attempt_state",
        )
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--snapshot", type=Path, required=True)
    parser.add_argument("--validator", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    errors: list[str] = []
    snapshot = load_json(args.snapshot)
    assignments = {
        row["assignment_id"]: row
        for row in load_jsonl(ROOT / "assignments/global_assignment_manifest.jsonl")
    }
    eligible = snapshot.get("mechanically_eligible_assignment_ids", [])
    credited = snapshot.get("credited_assignment_ids", [])
    receipts = snapshot.get("mechanically_eligible_result_receipts", [])
    receipt_by_assignment = {row.get("assignment_id"): row for row in receipts}

    if snapshot.get("validator_version") != "2.0.0":
        errors.append("snapshot is not validator version 2.0.0")
    if len(eligible) != len(set(eligible)) or len(eligible) != len(receipts):
        errors.append("eligible IDs and receipt list are not one-to-one")
    digest = hashlib.sha256(
        ("\n".join(sorted(eligible)) + ("\n" if eligible else "")).encode("utf-8")
    ).hexdigest()
    if digest != snapshot.get("validated_assignment_ids_sha256"):
        errors.append("eligible assignment digest mismatch")
    credited_digest = hashlib.sha256(
        ("\n".join(sorted(credited)) + ("\n" if credited else "")).encode("utf-8")
    ).hexdigest()
    if credited_digest != snapshot.get("credited_assignment_ids_sha256"):
        errors.append("credited assignment digest mismatch")
    if snapshot.get("counts", {}).get("credited_assignments") != len(credited):
        errors.append("credited assignment count does not match credited ID list")
    if any(value != "pass" for value in snapshot.get("seal_checks", {}).values()):
        if credited:
            errors.append("credit exists despite a failed READY-sealed input hash")
    elif set(credited) != set(eligible):
        errors.append("sealed inputs pass but eligible and credited assignment sets differ")
    if REVOKED_ASSIGNMENTS & set(credited):
        errors.append(f"revoked assignments appear credited: {sorted(REVOKED_ASSIGNMENTS & set(credited))}")

    manifests: dict[str, list[dict[str, Any]]] = defaultdict(list)
    dispatches: dict[str, list[dict[str, Any]]] = defaultdict(list)
    failures: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for number in range(1, 13):
        runner_dir = ROOT / "runners" / f"runner-{number:02d}"
        for row in load_jsonl(runner_dir / "result_manifest.jsonl"):
            manifests[str(row.get("assignment_id"))].append(row)
        for row in load_jsonl(runner_dir / "fresh_agent_assignment_registry.jsonl"):
            dispatches[str(row.get("assignment_id"))].append(row)
        for filename in ("failed_attempts.jsonl", "ingest_errors.jsonl"):
            for row in load_jsonl(runner_dir / filename):
                failures[str(row.get("assignment_id"))].append(row)
    for row in load_jsonl(ROOT / "coordination/QUARANTINE_REGISTRY.jsonl"):
        failures[str(row.get("assignment_id"))].append(row)

    for assignment_id in credited:
        assignment = assignments.get(assignment_id)
        receipt = receipt_by_assignment.get(assignment_id)
        if assignment is None or receipt is None:
            errors.append(f"{assignment_id}: missing assignment or v2 receipt")
            continue
        rows = [row for row in manifests.get(assignment_id, []) if same_attempt(row, receipt)]
        if len(rows) != 1:
            errors.append(f"{assignment_id}: expected one matching manifest, found {len(rows)}")
            continue
        row = rows[0]
        if not manifest_positive(row):
            errors.append(f"{assignment_id}: manifest is not explicitly positive")
        if any(same_attempt(row, failed) for failed in failures.get(assignment_id, [])):
            errors.append(f"{assignment_id}: eligible attempt has failure/quarantine veto")

        matching_dispatches = [
            dispatch
            for dispatch in dispatches.get(assignment_id, [])
            if same_attempt(row, dispatch)
        ]
        if not matching_dispatches:
            errors.append(f"{assignment_id}: no matching dispatch receipt")
        elif not any(
            dispatch.get("completed_at")
            and first(dispatch, "result_ref", "raw_result_ref")
            and first(dispatch, "result_sha256", "result_hash")
            for dispatch in matching_dispatches
        ):
            errors.append(f"{assignment_id}: matching dispatch is not completed and hashed")

        result_ref = first(row, "result_ref", "raw_result_ref")
        result_hash = first(row, "result_sha256", "result_hash")
        result_path = resolve_ref(result_ref)
        expected_dir = ROOT / "runners" / assignment["runner_id"] / "raw_results"
        if result_path is None or not result_path.exists() or not under(result_path, expected_dir):
            errors.append(f"{assignment_id}: raw result path missing or out of scope")
            continue
        if not result_hash or sha256(result_path) != result_hash:
            errors.append(f"{assignment_id}: raw result hash mismatch")
            continue
        raw = load_json(result_path)
        if raw.get("assignment_id") != assignment_id:
            errors.append(f"{assignment_id}: raw result assignment mismatch")
        if any(not isinstance(raw.get(name), list) for name in REQUIRED_ARRAYS):
            errors.append(f"{assignment_id}: required result arrays missing")
            continue
        if raw.get("candidate_findings") and not raw.get("exact_evidence_refs"):
            errors.append(f"{assignment_id}: findings lack exact evidence")
        source_path = resolve_ref(assignment["document_path"])
        capsule_path = resolve_ref(assignment["capsule_ref"])
        if source_path is None or capsule_path is None:
            errors.append(f"{assignment_id}: source or capsule path unavailable")
            continue
        source_lines = source_path.read_text(encoding="utf-8").splitlines()
        capsule = load_json(capsule_path)
        allowed_ranges = [assignment["core_range"], *capsule.get("context_ranges", [])]
        for index, evidence in enumerate(raw["exact_evidence_refs"]):
            if not isinstance(evidence, dict):
                errors.append(f"{assignment_id}: exact evidence {index} is not an object")
                continue
            path, start, end, quote = evidence_parts(evidence)
            end = start if end is None else end
            if path != assignment["document_path"]:
                errors.append(f"{assignment_id}: exact evidence {index} path mismatch")
                continue
            if not isinstance(start, int) or not isinstance(end, int) or start > end:
                errors.append(f"{assignment_id}: exact evidence {index} range invalid")
                continue
            if not any(start >= low and end <= high for low, high in allowed_ranges):
                errors.append(f"{assignment_id}: exact evidence {index} is out of capsule range")
                continue
            if start < 1 or end > len(source_lines) or not isinstance(quote, str) or not quote.strip():
                errors.append(f"{assignment_id}: exact evidence {index} quote/range missing")
                continue
            source_text = normalized("\n".join(source_lines[start - 1 : end]))
            if normalized(quote) not in source_text:
                errors.append(f"{assignment_id}: exact evidence {index} quote mismatch")

    report = {
        "audit_id": snapshot.get("audit_id"),
        "crosscheck": "postrun_validator_v2_crosscheck.py",
        "observed_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "status": "pass" if not errors else "fail",
        "validator_sha256": sha256(args.validator),
        "snapshot_sha256": sha256(args.snapshot),
        "eligible_assignments_reported": len(eligible),
        "credited_assignments_checked": len(credited),
        "root_credited_assignments_observed": snapshot.get("counts", {}).get("credited_assignments"),
        "revoked_assignments_absent": not bool(REVOKED_ASSIGNMENTS & set(credited)),
        "errors": errors,
    }
    rendered = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
