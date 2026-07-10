#!/usr/bin/env python3
"""Fail-closed post-run coverage validator v2 for audit-004 runner receipts.

This validator never edits runner output. It identifies mechanically eligible
coverage candidates only when a completed registry receipt, a positive
result-manifest validation receipt, and the referenced raw result agree with
the immutable global assignment and capsule. It never edits runner output;
``--output`` may write a versioned evidence snapshot.
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
HERE = Path(__file__).resolve()
ROOT = HERE.parents[2] if HERE.parent.name == "frozen" else HERE.parents[1]
REPO = ROOT.parents[2]
REQUIRED_OUTPUT_LISTS = (
    "observations",
    "candidate_findings",
    "explicit_non_gaps",
    "unknowns",
    "exact_evidence_refs",
)
POSITIVE_STATUSES = {
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
NEGATIVE_STATUSES = {
    "error",
    "fail",
    "failed",
    "failed_attempt",
    "failed_attempt_zero_coverage",
    "invalid",
    "pending",
    "quarantined",
    "rejected",
    "zero_coverage",
}


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


def normalized_text(value: str) -> str:
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


def evidence_issues(
    ref: Any,
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    source_lines: list[str],
    *,
    require_quote: bool,
) -> list[str]:
    if not isinstance(ref, dict):
        return ["evidence reference is not an object"]
    path, start, end, quote = evidence_parts(ref)
    issues: list[str] = []
    if path != assignment["document_path"]:
        issues.append("evidence document path mismatch")
    if not isinstance(start, int):
        issues.append("evidence line_start missing or invalid")
        return issues
    if end is None:
        end = start
    if not isinstance(end, int) or start > end:
        issues.append("evidence line range invalid")
        return issues
    ranges = [assignment["core_range"], *capsule.get("context_ranges", [])]
    if not any(start >= low and end <= high for low, high in ranges):
        issues.append("evidence range outside assigned capsule")
    if start < 1 or end > len(source_lines):
        issues.append("evidence range outside canonical source")
        return issues
    if require_quote:
        if not isinstance(quote, str) or not quote.strip():
            issues.append("exact evidence quote missing")
        else:
            source_text = normalized_text("\n".join(source_lines[start - 1 : end]))
            if normalized_text(quote) not in source_text:
                issues.append("exact evidence quote mismatch")
    return issues


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
    parser.add_argument(
        "--output",
        type=Path,
        help="Write the canonical JSON report to this path as well as stdout.",
    )
    args = parser.parse_args()

    errors: list[str] = []
    localized_receipt_errors: list[str] = []
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
        ingest_error_rows = load_jsonl(runner_dir / "ingest_errors.jsonl", runner_errors)
        failure_rows.extend(ingest_error_rows)
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

    raw_dispatch_record_count = len(dispatches)
    grouped_dispatches: dict[tuple[Any, ...], dict[str, Any]] = {}
    for row in dispatches:
        key = (
            row.get("runner_id"),
            row.get("assignment_id"),
            attempt_token(row),
            row.get("agent_instance_id"),
            row.get("agent_thread_id"),
            row.get("agent_path"),
        )
        if key not in grouped_dispatches:
            grouped_dispatches[key] = dict(row)
            grouped_dispatches[key]["_receipt_members"] = [
                f"{row.get('_receipt_file')}:{row.get('_receipt_line')}"
            ]
            continue
        combined = grouped_dispatches[key]
        for name, value in row.items():
            if value is not None:
                combined[name] = value
        combined["_receipt_members"].append(
            f"{row.get('_receipt_file')}:{row.get('_receipt_line')}"
        )
    dispatches = list(grouped_dispatches.values())
    for runner_id, counts in per_runner.items():
        counts["dispatch_attempts"] = sum(
            1 for row in dispatches if row.get("runner_id") == runner_id
        )

    coordination_quarantine = load_jsonl(
        ROOT / "coordination/QUARANTINE_REGISTRY.jsonl", errors
    )
    failed_by_assignment: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in [*failed_rows, *coordination_quarantine]:
        if row.get("assignment_id"):
            failed_by_assignment[str(row["assignment_id"])].append(row)

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
                localized_receipt_errors.append(reason)
                for row in rows:
                    failed_by_assignment[str(row.get("assignment_id"))].append(row)
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
    valid_result_receipts: list[dict[str, Any]] = []
    referenced_raw: set[Path] = set()
    result_row_counts = Counter(row.get("assignment_id") for row in manifests if row.get("assignment_id"))

    zero_credit_failed_attempts = 0
    for row in failed_rows:
        assignment_id = row.get("assignment_id")
        issues: list[str] = []
        if assignment_id not in expected:
            issues.append("failed-attempt assignment_id is missing or not expected")
        if row.get("coverage_credit") not in (None, 0, False):
            issues.append("failed-attempt receipt grants nonzero coverage")
        if any(row.get(field) is True for field in ("validation_passed", "valid", "valid_coverage")):
            issues.append("failed-attempt receipt contains a positive validation flag")
        statuses = {
            str(row[field]).lower()
            for field in ("validation_status", "status", "result_status", "state", "attempt_state")
            if row.get(field) is not None
        }
        if statuses & POSITIVE_STATUSES:
            issues.append(f"failed-attempt receipt contains a positive status: {sorted(statuses & POSITIVE_STATUSES)}")
        result_ref = first(row, "result_ref", "raw_result_ref", "bad_capture_ref")
        result_path = repo_path(result_ref)
        if result_path is not None and result_path.exists():
            referenced_raw.add(result_path)
            expected_failed_hash = (
                hash_field(row, "result")
                or row.get("bad_capture_sha256")
                or row.get("bad_capture_hash")
            )
            if expected_failed_hash and cached_hash(result_path) != expected_failed_hash:
                issues.append("failed-attempt raw result hash mismatch")
        elif result_ref:
            issues.append("failed-attempt raw result is missing")
        capture_validation_ref = row.get("bad_capture_validation_ref")
        if capture_validation_ref:
            capture_validation_path = repo_path(capture_validation_ref)
            if capture_validation_path is None or not capture_validation_path.exists():
                issues.append("failed-capture validation receipt is missing")
            else:
                capture_validation = load_json(capture_validation_path, errors)
                if isinstance(capture_validation, dict):
                    original_ref = capture_validation.get("result_ref")
                    original_hash = hash_field(capture_validation, "result")
                    original_path = repo_path(original_ref)
                    if (
                        original_path is not None
                        and original_path.exists()
                        and original_hash
                        and cached_hash(original_path) != original_hash
                    ):
                        issues.append(
                            "failed-attempt result_ref was overwritten after immutable failure receipt"
                        )
        zero_credit_failed_attempts += 1
        if issues:
            quarantine.append(
                {
                    "runner_id": row.get("runner_id"),
                    "assignment_id": assignment_id,
                    "attempt_id": first(row, "attempt_id", "attempt", "attempt_no"),
                    "receipt": f"{row.get('_receipt_file')}:{row.get('_receipt_line')}",
                    "reasons": sorted(set(issues)),
                }
            )

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
        for identity_field in ("agent_instance_id", "agent_thread_id", "agent_path"):
            identity_value = row.get(identity_field)
            if identity_value:
                candidates = [
                    item for item in candidates if item.get(identity_field) == identity_value
                ]
                break
        row_attempt = attempt_token(row)
        if row_attempt is not None:
            candidates = [
                item
                for item in candidates
                if attempt_token(item) in (None, row_attempt)
            ]
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

        vetoes = [
            failed
            for failed in failed_by_assignment.get(str(assignment_id), [])
            if same_attempt(row, failed)
        ]
        if vetoes:
            sources = sorted(
                {
                    f"{item.get('_receipt_file', 'coordination/QUARANTINE_REGISTRY.jsonl')}:{item.get('_receipt_line', '?')}"
                    for item in vetoes
                }
            )
            issues.append(f"explicit failed-attempt/quarantine veto: {sources}")

        credit_value = first(row, "coverage_credit", "valid_coverage", "coverage_count")
        positive_credit = credit_value is True or credit_value == 1
        if not positive_credit:
            issues.append("result manifest does not explicitly grant one coverage credit")
        validation_positive = False
        for name in (
            "validation_passed",
            "valid",
            "valid_coverage",
            "schema_validation_passed",
            "dispatch_validation_passed",
            "exact_evidence_validation_passed",
            "scope_validation_passed",
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
            if lowered in NEGATIVE_STATUSES or any(
                marker in lowered for marker in ("fail", "invalid", "reject", "quarant")
            ):
                issues.append(f"{name} is not positive: {current}")
            elif lowered in POSITIVE_STATUSES:
                validation_positive = True
        for name in ("validation_errors", "errors"):
            value = row.get(name)
            if isinstance(value, list) and value:
                issues.append(f"{name} is nonempty")
        if not validation_positive:
            issues.append("result manifest lacks explicit positive validation")

        validation_ref = row.get("validation_ref")
        if validation_ref:
            validation_path = repo_path(validation_ref)
            expected_validation_dir = (
                ROOT
                / "runners"
                / str(assignment.get("runner_id") if assignment else "")
                / "validation"
            )
            if validation_path is None or not validation_path.exists():
                issues.append("referenced validation receipt missing")
            elif not under(validation_path, expected_validation_dir):
                issues.append("validation_ref spills outside runner validation namespace")
            else:
                validation_hash = hash_field(row, "validation")
                if validation_hash and cached_hash(validation_path) != validation_hash:
                    issues.append("validation receipt hash mismatch")
                validation = load_json(validation_path, errors)
                if not isinstance(validation, dict):
                    issues.append("validation receipt is not an object")
                else:
                    if validation.get("assignment_id") not in (None, assignment_id):
                        issues.append("validation receipt assignment_id mismatch")
                    receipt_positive = any(
                        validation.get(field) is True
                        for field in ("passed", "validation_passed", "valid", "valid_coverage")
                    ) or str(
                        first(validation, "validation_status", "status", "state") or ""
                    ).lower() in POSITIVE_STATUSES
                    if not receipt_positive:
                        issues.append("referenced validation receipt is not explicitly positive")

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
                    document_path = repo_path(assignment["document_path"])
                    if document_path is None or not document_path.exists():
                        issues.append("canonical source unavailable for exact-evidence validation")
                    else:
                        source_lines = document_path.read_text(encoding="utf-8").splitlines()
                        exact_refs = raw.get("exact_evidence_refs", [])
                        if raw.get("candidate_findings") and not exact_refs:
                            issues.append("candidate findings lack exact_evidence_refs")
                        if isinstance(exact_refs, list):
                            for index, value in enumerate(exact_refs):
                                for problem in evidence_issues(
                                    value,
                                    assignment,
                                    capsule,
                                    source_lines,
                                    require_quote=True,
                                ):
                                    issues.append(f"exact_evidence_refs[{index}]: {problem}")
                        for value in walk_dicts(raw):
                            if isinstance(exact_refs, list) and value in exact_refs:
                                continue
                            compact_ref = value.get("ref")
                            has_line_ref = any(
                                key in value for key in ("line_start", "start_line")
                            ) or (
                                isinstance(compact_ref, str)
                                and re.fullmatch(r".+:\d+(?:-\d+)?", compact_ref.strip())
                            )
                            if not has_line_ref:
                                continue
                            for problem in evidence_issues(
                                value,
                                assignment,
                                capsule,
                                source_lines,
                                require_quote=True,
                            ):
                                issues.append(f"nested evidence: {problem}")

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
                localized_receipt_errors.append(
                    f"invalid positive-credit result receipt: {row.get('runner_id')}:{assignment_id}"
                )
        else:
            valid_results.add(assignment_id)
            valid_result_receipts.append(
                {
                    "assignment_id": assignment_id,
                    "runner_id": assignment["runner_id"],
                    "attempt": attempt_token(row),
                    "agent_instance_id": row.get("agent_instance_id"),
                    "agent_thread_id": row.get("agent_thread_id"),
                    "result_ref": result_ref,
                    "result_sha256": result_hash,
                }
            )
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
    seal_integrity_passed = all(value == "pass" for value in seal_checks.values())
    credited_results = set(valid_results) if seal_integrity_passed else set()
    credited_id_digest = hashlib.sha256(
        ("\n".join(sorted(credited_results)) + ("\n" if credited_results else "")).encode(
            "utf-8"
        )
    ).hexdigest()
    root_credit = len(credited_results)
    report = {
        "audit_id": AUDIT_ID,
        "validator": "postrun_validator_v2.py",
        "validator_version": "2.0.0",
        "observed_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "mode": "final" if args.final else "in_progress",
        "status": (
            "fail"
            if errors or localized_receipt_errors
            else "pass"
            if args.final and pending_assignments == 0
            else "in_progress"
        ),
        "authority": "frozen_postrun_coverage_authority_when_hash_matches_VALIDATOR_AUTHORITY_V2",
        "seal_checks": seal_checks,
        "counts": {
            "expected_assignments": len(expected),
            "dispatch_records": raw_dispatch_record_count,
            "dispatch_attempts": len(dispatches),
            "unique_dispatched_assignments": len(dispatch_by_assignment),
            "result_manifest_records": len(manifests),
            "raw_result_files": len(raw_files),
            "unmanifested_raw_result_files": len(unmanifested_raw),
            "failed_attempt_records": len(failed_rows),
            "zero_credit_failed_attempts": zero_credit_failed_attempts,
            "coordination_quarantine_records": len(coordination_quarantine),
            "validated_results": len(valid_results),
            "mechanically_eligible_assignments": len(valid_results),
            "credited_assignments": root_credit,
            "pending_assignments": pending_assignments,
            "runner_complete_receipts": len(complete_receipts),
            "pending_agent_thread_identity_receipts": pending_identity_receipts,
            "quarantine_candidates": len(quarantine),
            "localized_receipt_errors": len(set(localized_receipt_errors)),
        },
        "identity_uniqueness": {
            field: {
                "recorded": len(mapping),
                "duplicate_values": sum(1 for rows in mapping.values() if len(rows) > 1),
            }
            for field, mapping in identity_maps.items()
        },
        "validated_assignment_ids_sha256": valid_id_digest,
        "mechanically_eligible_assignment_ids": sorted(valid_results),
        "credited_assignment_ids_sha256": credited_id_digest,
        "credited_assignment_ids": sorted(credited_results),
        "seal_integrity_allows_per_assignment_credit": seal_integrity_passed,
        "mechanically_eligible_result_receipts": sorted(
            valid_result_receipts, key=lambda item: str(item["assignment_id"])
        ),
        "per_runner": per_runner,
        "unmanifested_raw_result_files": unmanifested_raw,
        "quarantine_candidates": quarantine,
        "warnings": warnings,
        "errors": sorted(set(errors)),
        "localized_receipt_errors": sorted(set(localized_receipt_errors)),
        "coverage_policy": (
            "An assignment is eligible only after one complete fresh-agent dispatch receipt, "
            "one matching result-manifest receipt, immutable metadata/hash agreement, a confined "
            "raw result with required output arrays and exact in-range evidence quotes, no explicit "
            "failed-attempt or quarantine veto for that attempt, and no identity reuse. Invalid attempts "
            "remain zero-credit without erasing unrelated validated assignment credit. A failure of any "
            "READY-sealed input hash suppresses all assignment credit."
        ),
    }
    rendered = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0 if report["status"] != "fail" else 1


if __name__ == "__main__":
    sys.exit(main())
