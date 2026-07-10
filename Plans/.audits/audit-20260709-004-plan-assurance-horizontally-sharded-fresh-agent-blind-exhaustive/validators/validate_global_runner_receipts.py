#!/usr/bin/env python3
"""Independent, read-only advisory validator for audit-004 runner receipts.

This validator never edits runner output. It identifies mechanically eligible
coverage candidates only when a completed registry receipt, a positive
result-manifest validation receipt, and the referenced raw result agree with
the immutable global assignment and capsule. Final coverage authority remains
with the frozen validator named by validators/VALIDATOR_AUTHORITY.json.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[2]
REQUIRED_OUTPUT_LISTS = (
    "observations",
    "candidate_findings",
    "explicit_non_gaps",
    "unknowns",
    "exact_evidence_refs",
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def file_bytes(path: Path) -> int:
    return path.stat().st_size


def load_json(path: Path, errors: list[str]) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: invalid JSON: {exc}")
        return None


def load_jsonl(path: Path, errors: list[str]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        return rows
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except Exception as exc:
            errors.append(f"{path.relative_to(ROOT)}:{line_no}: invalid JSON: {exc}")
            continue
        if not isinstance(value, dict):
            errors.append(f"{path.relative_to(ROOT)}:{line_no}: row is not an object")
            continue
        value["_receipt_file"] = str(path.relative_to(ROOT))
        value["_receipt_line"] = line_no
        rows.append(value)
    return rows


def first(record: dict[str, Any], *names: str) -> Any:
    for name in names:
        if name in record:
            return record[name]
    return None


def hash_field(record: dict[str, Any], stem: str) -> Any:
    return first(record, f"{stem}_sha256", f"{stem}_hash")


def normalize_ref(value: Any) -> str | None:
    if not isinstance(value, str) or not value:
        return None
    return value


def repo_path(ref: Any) -> Path | None:
    ref = normalize_ref(ref)
    if ref is None:
        return None
    path = Path(ref)
    if path.is_absolute():
        return path
    if path.parts and path.parts[0] in {
        "assignments",
        "capsules",
        "coordination",
        "manifests",
        "merged",
        "reports",
        "runners",
        "validators",
    }:
        return ROOT / path
    return REPO / path


def under(path: Path, parent: Path) -> bool:
    try:
        path.resolve().relative_to(parent.resolve())
        return True
    except (ValueError, OSError):
        return False


def equal_field(
    issues: list[str],
    record: dict[str, Any],
    expected: dict[str, Any],
    receipt_names: tuple[str, ...],
    expected_name: str,
    required: bool = True,
) -> None:
    actual = first(record, *receipt_names)
    if actual is None and not required:
        return
    if actual is None:
        issues.append(f"missing {receipt_names[0]}")
    elif actual != expected.get(expected_name):
        issues.append(
            f"{receipt_names[0]} mismatch: {actual!r} != {expected.get(expected_name)!r}"
        )


def allowed_line_ref(ref: dict[str, Any], assignment: dict[str, Any], capsule: dict[str, Any]) -> bool:
    path = first(ref, "path", "document_path", "file")
    start = first(ref, "line_start", "start_line")
    end = first(ref, "line_end", "end_line")
    if path is None or start is None:
        return True
    if path != assignment["document_path"]:
        return False
    if end is None:
        end = start
    if not isinstance(start, int) or not isinstance(end, int) or start > end:
        return False
    ranges = [assignment["core_range"], *capsule.get("context_ranges", [])]
    return any(start >= low and end <= high for low, high in ranges)


def walk_dicts(value: Any):
    if isinstance(value, dict):
        yield value
        for nested in value.values():
            yield from walk_dicts(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from walk_dicts(nested)


def check_receipt_metadata(
    record: dict[str, Any],
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    *,
    strict_identity: bool,
) -> list[str]:
    issues: list[str] = []
    equal_field(issues, record, assignment, ("runner_id",), "runner_id")
    equal_field(issues, record, assignment, ("role",), "role")
    equal_field(issues, record, assignment, ("window_id",), "window_id")
    equal_field(issues, record, assignment, ("doc_id",), "doc_id")
    equal_field(issues, record, assignment, ("document_path",), "document_path")
    equal_field(issues, record, assignment, ("core_range",), "core_range")
    equal_field(issues, record, assignment, ("capsule_ref",), "capsule_ref")
    equal_field(
        issues, record, assignment, ("capsule_sha256", "capsule_hash"), "capsule_sha256"
    )
    equal_field(issues, record, assignment, ("capsule_bytes",), "capsule_bytes")
    equal_field(
        issues,
        record,
        assignment,
        ("source_sha256", "source_hash"),
        "source_sha256",
    )
    equal_field(
        issues,
        record,
        assignment,
        ("source_excerpt_ref",),
        "source_excerpt_ref",
        required=False,
    )
    equal_field(
        issues,
        record,
        assignment,
        ("source_excerpt_sha256", "source_excerpt_hash"),
        "source_excerpt_sha256",
        required=False,
    )
    equal_field(
        issues,
        record,
        assignment,
        ("source_excerpt_bytes",),
        "source_excerpt_bytes",
        required=False,
    )
    if first(record, "model") != assignment["required_model"]:
        issues.append("wrong or missing model")
    if first(record, "reasoning_effort") != assignment["required_reasoning_effort"]:
        issues.append("wrong or missing reasoning_effort")
    if first(record, "prior_substantive_assignment_count") != 0:
        issues.append("prior_substantive_assignment_count must equal 0")
    if first(record, "terminal_after_result") is not True:
        issues.append("terminal_after_result must be true")
    if first(record, "no_followup_reuse") is not True:
        issues.append("no_followup_reuse must be true")
    if first(record, "fork_turns") not in (None, "none"):
        issues.append("fork_turns must be none when recorded")
    context = first(record, "context_ranges", "overlap_ranges")
    if context is not None and context != capsule.get("context_ranges", []):
        issues.append("context/overlap ranges mismatch capsule")
    for field in ("agent_instance_id", "agent_path"):
        if not first(record, field):
            issues.append(f"missing {field}")
    if strict_identity and not first(record, "agent_thread_id"):
        issues.append("missing agent_thread_id")
    return issues


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--final",
        action="store_true",
        help="Require all assignments and runner completion receipts.",
    )
    args = parser.parse_args()

    errors: list[str] = []
    warnings: list[str] = []
    quarantine: list[dict[str, Any]] = []

    assignment_rows = load_jsonl(ROOT / "assignments/global_assignment_manifest.jsonl", errors)
    expected: dict[str, dict[str, Any]] = {}
    for row in assignment_rows:
        assignment_id = row.get("assignment_id")
        if not assignment_id:
            errors.append("global assignment without assignment_id")
        elif assignment_id in expected:
            errors.append(f"duplicate global assignment: {assignment_id}")
        else:
            expected[assignment_id] = row

    ready = load_json(ROOT / "coordination/READY_FOR_RUNNERS.json", errors) or {}
    runner_threads = load_json(ROOT / "coordination/runner_thread_registry.json", errors) or {}
    sealed = {
        "assignment_manifest": (
            ROOT / "assignments/global_assignment_manifest.jsonl",
            ready.get("manifest_sha256"),
        ),
        "window_manifest": (
            ROOT / "manifests/window_manifest.jsonl",
            ready.get("window_manifest_sha256"),
        ),
        "capsule_registry": (
            ROOT / "manifests/context_capsule_registry.jsonl",
            ready.get("capsule_registry_sha256"),
        ),
        "runner_registry": (
            ROOT / "coordination/runner_thread_registry.json",
            ready.get("runner_registry_sha256"),
        ),
        "validator_result": (
            ROOT / "validator_results.json",
            ready.get("validator_result_sha256"),
        ),
    }
    seal_checks: dict[str, str] = {}
    for name, (path, wanted) in sealed.items():
        actual = sha256(path) if path.exists() else None
        seal_checks[name] = "pass" if wanted and actual == wanted else "fail"
        if seal_checks[name] == "fail":
            errors.append(f"sealed {name} hash mismatch")

    capsule_cache: dict[str, dict[str, Any]] = {}
    source_hash_cache: dict[str, str] = {}
    file_hash_cache: dict[Path, str] = {}

    def cached_hash(path: Path) -> str:
        if path not in file_hash_cache:
            file_hash_cache[path] = sha256(path)
        return file_hash_cache[path]

    dispatches: list[dict[str, Any]] = []
    manifests: list[dict[str, Any]] = []
    raw_files: set[Path] = set()
    failed_rows: list[dict[str, Any]] = []
    complete_receipts: dict[str, dict[str, Any]] = {}
    per_runner: dict[str, dict[str, int]] = {}

    for number in range(1, 13):
        runner_id = f"runner-{number:02d}"
        runner_dir = ROOT / "runners" / runner_id
        runner_errors: list[str] = []
        registry = load_jsonl(runner_dir / "fresh_agent_assignment_registry.jsonl", runner_errors)
        result_rows = load_jsonl(runner_dir / "result_manifest.jsonl", runner_errors)
        failure_rows = load_jsonl(runner_dir / "failed_attempts.jsonl", runner_errors)
        errors.extend(runner_errors)
        dispatches.extend(registry)
        manifests.extend(result_rows)
        failed_rows.extend(failure_rows)
        runner_raw = set((runner_dir / "raw_results").glob("*.json"))
        raw_files.update(runner_raw)
        complete_path = runner_dir / "RUNNER_COMPLETE.json"
        if complete_path.exists():
            complete_receipts[runner_id] = load_json(complete_path, errors) or {}
        per_runner[runner_id] = {
            "expected_assignments": sum(1 for row in expected.values() if row["runner_id"] == runner_id),
            "dispatch_records": len(registry),
            "result_manifest_records": len(result_rows),
            "raw_result_files": len(runner_raw),
            "failed_attempt_records": len(failure_rows),
            "validated_results": 0,
            "runner_complete_receipts": int(complete_path.exists()),
        }

    dispatch_by_assignment: dict[str, list[dict[str, Any]]] = defaultdict(list)
    identity_maps: dict[str, dict[str, list[dict[str, Any]]]] = {
        name: defaultdict(list)
        for name in ("agent_instance_id", "agent_path", "agent_thread_id")
    }
    pending_identity_receipts = 0

    for row in dispatches:
        assignment_id = row.get("assignment_id")
        runner_id = row.get("runner_id")
        assignment = expected.get(assignment_id)
        issues: list[str] = []
        if assignment is None:
            issues.append("assignment_id is missing or not expected")
        elif runner_id != assignment["runner_id"]:
            issues.append("runner scope spill or wrong runner_id")
        if assignment is not None:
            capsule_ref = repo_path(assignment["capsule_ref"])
            if capsule_ref is None or not capsule_ref.exists():
                issues.append("expected capsule missing")
                capsule = {}
            else:
                capsule = capsule_cache.setdefault(
                    assignment_id, load_json(capsule_ref, errors) or {}
                )
                issues.extend(
                    check_receipt_metadata(row, assignment, capsule, strict_identity=False)
                )
                if cached_hash(capsule_ref) != assignment["capsule_sha256"]:
                    issues.append("live capsule hash mismatch")
                if file_bytes(capsule_ref) != assignment["capsule_bytes"]:
                    issues.append("live capsule byte count mismatch")
                excerpt = repo_path(assignment["source_excerpt_ref"])
                if excerpt is None or not excerpt.exists():
                    issues.append("source excerpt missing")
                else:
                    if cached_hash(excerpt) != assignment["source_excerpt_sha256"]:
                        issues.append("live source excerpt hash mismatch")
                    if file_bytes(excerpt) != assignment["source_excerpt_bytes"]:
                        issues.append("live source excerpt byte count mismatch")
                document = repo_path(assignment["document_path"])
                if document is None or not document.exists():
                    issues.append("canonical source missing")
                else:
                    key = str(document)
                    source_hash_cache.setdefault(key, cached_hash(document))
                    if source_hash_cache[key] != assignment["source_sha256"]:
                        issues.append("live canonical source hash mismatch")
        if not row.get("agent_thread_id"):
            pending_identity_receipts += 1
        for field, mapping in identity_maps.items():
            value = row.get(field)
            if value:
                mapping[str(value)].append(row)
        if assignment_id:
            dispatch_by_assignment[assignment_id].append(row)
        if issues:
            quarantine.append(
                {
                    "runner_id": runner_id,
                    "assignment_id": assignment_id,
                    "attempt_id": first(row, "attempt_id", "attempt", "attempt_no", "attempt_number"),
                    "receipt": f"{row.get('_receipt_file')}:{row.get('_receipt_line')}",
                    "reasons": sorted(set(issues)),
                }
            )

    for field, mapping in identity_maps.items():
        for value, rows in mapping.items():
            assignments = {row.get("assignment_id") for row in rows}
            if len(rows) > 1 or len(assignments) > 1:
                reason = f"duplicate or recycled {field}: {value}"
                errors.append(reason)
                for row in rows:
                    quarantine.append(
                        {
                            "runner_id": row.get("runner_id"),
                            "assignment_id": row.get("assignment_id"),
                            "attempt_id": first(
                                row, "attempt_id", "attempt", "attempt_no", "attempt_number"
                            ),
                            "receipt": f"{row.get('_receipt_file')}:{row.get('_receipt_line')}",
                            "reasons": [reason],
                        }
                    )

    valid_results: set[str] = set()
    referenced_raw: set[Path] = set()
    result_row_counts = Counter(row.get("assignment_id") for row in manifests if row.get("assignment_id"))

    for row in manifests:
        assignment_id = row.get("assignment_id")
        assignment = expected.get(assignment_id)
        issues: list[str] = []
        if assignment is None:
            issues.append("result assignment_id is missing or not expected")
            capsule = {}
        else:
            capsule_ref = repo_path(assignment["capsule_ref"])
            capsule = capsule_cache.setdefault(
                assignment_id,
                load_json(capsule_ref, errors) if capsule_ref and capsule_ref.exists() else {},
            ) or {}
        if result_row_counts.get(assignment_id, 0) != 1:
            issues.append("expected exactly one result-manifest row for assignment")

        candidates = dispatch_by_assignment.get(assignment_id, [])
        agent_id = row.get("agent_instance_id")
        attempt_id = row.get("attempt_id")
        if agent_id:
            candidates = [item for item in candidates if item.get("agent_instance_id") == agent_id]
        if attempt_id:
            candidates = [item for item in candidates if item.get("attempt_id") == attempt_id]
        if len(candidates) != 1:
            issues.append("result does not resolve to exactly one dispatch receipt")
            dispatch = {}
        else:
            dispatch = candidates[0]
            combined = dict(dispatch)
            combined.update({key: value for key, value in row.items() if value is not None})
            if assignment is not None:
                issues.extend(
                    check_receipt_metadata(
                        combined, assignment, capsule, strict_identity=True
                    )
                )
            if not dispatch.get("agent_thread_id"):
                issues.append("completed dispatch lacks agent_thread_id")
            if not dispatch.get("completed_at"):
                issues.append("completed dispatch lacks completed_at")
            if not first(dispatch, "result_ref", "raw_result_ref"):
                issues.append("completed dispatch lacks result_ref")
            if not hash_field(dispatch, "result"):
                issues.append("completed dispatch lacks result hash")

        credit_value = first(row, "coverage_credit", "valid_coverage")
        positive_credit = credit_value is True or credit_value == 1
        if not positive_credit:
            issues.append("result manifest does not explicitly grant one coverage credit")
        validation_positive = False
        for name in (
            "validation_passed",
            "valid",
            "schema_validation_passed",
            "dispatch_validation_passed",
            "schema_validation",
            "hash_validation",
            "range_validation",
            "validation_status",
            "status",
            "result_status",
            "state",
        ):
            if name not in row or row[name] is None:
                continue
            current = row[name]
            if current is True:
                validation_positive = True
                continue
            if current is False:
                issues.append(f"{name} is false")
                continue
            lowered = str(current).lower()
            if any(
                marker in lowered
                for marker in (
                    "fail",
                    "invalid",
                    "pending",
                    "reject",
                    "quarant",
                    "zero_coverage",
                    "error",
                )
            ):
                issues.append(f"{name} is not positive: {current}")
            elif lowered in {
                "pass",
                "passed",
                "valid",
                "accepted",
                "complete",
                "completed",
                "completed_valid",
                "success",
            }:
                validation_positive = True
        if not validation_positive:
            issues.append("result manifest lacks explicit positive validation")

        result_ref = first(row, "result_ref", "raw_result_ref") or first(
            dispatch, "result_ref", "raw_result_ref"
        )
        result_hash = hash_field(row, "result") or hash_field(dispatch, "result")
        result_path = repo_path(result_ref)
        expected_result_dir = ROOT / "runners" / str(assignment.get("runner_id") if assignment else "") / "raw_results"
        if result_path is None or not result_path.exists():
            issues.append("referenced raw result missing")
            raw = None
        elif not under(result_path, expected_result_dir):
            issues.append("result_ref spills outside runner raw_results namespace")
            raw = None
        else:
            referenced_raw.add(result_path)
            if not result_hash:
                issues.append("missing result hash")
            elif cached_hash(result_path) != result_hash:
                issues.append("result hash mismatch")
            raw = load_json(result_path, errors)
            if not isinstance(raw, dict):
                issues.append("raw result is not an object")
            else:
                if raw.get("assignment_id") != assignment_id:
                    issues.append("raw result assignment_id mismatch")
                for field in REQUIRED_OUTPUT_LISTS:
                    if not isinstance(raw.get(field), list):
                        issues.append(f"raw result {field} must be an array")
                if assignment is not None and capsule:
                    for value in walk_dicts(raw):
                        if any(key in value for key in ("line_start", "start_line")):
                            if not allowed_line_ref(value, assignment, capsule):
                                issues.append("raw result contains evidence outside assigned source/ranges")
                                break

        if issues:
            quarantine.append(
                {
                    "runner_id": row.get("runner_id"),
                    "assignment_id": assignment_id,
                    "attempt_id": first(row, "attempt_id", "attempt"),
                    "receipt": f"{row.get('_receipt_file')}:{row.get('_receipt_line')}",
                    "reasons": sorted(set(issues)),
                }
            )
            if positive_credit:
                errors.append(
                    f"invalid positive-credit result receipt: {row.get('runner_id')}:{assignment_id}"
                )
        else:
            valid_results.add(assignment_id)
            per_runner[assignment["runner_id"]]["validated_results"] += 1

    unmanifested_raw = sorted(str(path.relative_to(ROOT)) for path in raw_files - referenced_raw)
    if unmanifested_raw:
        warnings.append(f"{len(unmanifested_raw)} raw result files are not creditable yet")

    quarantine_by_key: dict[str, dict[str, Any]] = {}
    for item in quarantine:
        key = json.dumps(
            [item.get("runner_id"), item.get("assignment_id"), item.get("attempt_id"), item.get("receipt")],
            sort_keys=True,
        )
        if key not in quarantine_by_key:
            quarantine_by_key[key] = item
        else:
            quarantine_by_key[key]["reasons"] = sorted(
                set(quarantine_by_key[key]["reasons"]) | set(item["reasons"])
            )
    quarantine = sorted(
        quarantine_by_key.values(),
        key=lambda item: (
            str(item.get("runner_id")),
            str(item.get("assignment_id")),
            str(item.get("attempt_id")),
        ),
    )

    pending_assignments = len(expected) - len(valid_results)
    if args.final:
        if pending_assignments:
            errors.append(f"final mode: {pending_assignments} assignments lack a valid result")
        if len(complete_receipts) != 12:
            errors.append(
                f"final mode: expected 12 RUNNER_COMPLETE receipts, found {len(complete_receipts)}"
            )
        if unmanifested_raw:
            errors.append("final mode: unmanifested raw results remain")
        if pending_identity_receipts:
            errors.append("final mode: incomplete agent thread identity receipts remain")
    valid_id_digest = hashlib.sha256(
        ("\n".join(sorted(valid_results)) + ("\n" if valid_results else "")).encode("utf-8")
    ).hexdigest()
    report = {
        "audit_id": AUDIT_ID,
        "validator": "validate_global_runner_receipts.py",
        "observed_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "mode": "final" if args.final else "in_progress",
        "status": (
            "fail"
            if errors
            else "pass"
            if args.final and pending_assignments == 0
            else "in_progress"
        ),
        "authority": "independent_advisory_not_final_coverage_authority",
        "seal_checks": seal_checks,
        "counts": {
            "expected_assignments": len(expected),
            "dispatch_records": len(dispatches),
            "unique_dispatched_assignments": len(dispatch_by_assignment),
            "result_manifest_records": len(manifests),
            "raw_result_files": len(raw_files),
            "unmanifested_raw_result_files": len(unmanifested_raw),
            "failed_attempt_records": len(failed_rows),
            "validated_results": len(valid_results),
            "mechanically_eligible_assignments": len(valid_results),
            "credited_assignments": 0,
            "pending_assignments": pending_assignments,
            "runner_complete_receipts": len(complete_receipts),
            "pending_agent_thread_identity_receipts": pending_identity_receipts,
            "quarantine_candidates": len(quarantine),
        },
        "identity_uniqueness": {
            field: {
                "recorded": len(mapping),
                "duplicate_values": sum(1 for rows in mapping.values() if len(rows) > 1),
            }
            for field, mapping in identity_maps.items()
        },
        "validated_assignment_ids_sha256": valid_id_digest,
        "per_runner": per_runner,
        "unmanifested_raw_result_files": unmanifested_raw,
        "quarantine_candidates": quarantine,
        "warnings": warnings,
        "errors": sorted(set(errors)),
        "coverage_policy": (
            "This advisory marks a candidate eligible only after one complete fresh-agent dispatch receipt, "
            "one matching result-manifest receipt, immutable metadata/hash agreement, a confined "
            "raw result with required output arrays and in-range evidence, and no identity reuse. "
            "It never grants root coverage by itself."
        ),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
