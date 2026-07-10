#!/usr/bin/env python3
import argparse
import hashlib
import json
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

from validate_result import validate_result

AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
AUDIT = Path("Plans/.audits") / AUDIT_ID
BASE = AUDIT / "runners/runner-06"


def rows(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()] if path.exists() else []


def duplicate_count(values):
    return sum(1 for value, count in Counter(values).items() if count > 1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--allow-incomplete", action="store_true")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    assignments = rows(AUDIT / "assignments/runner-06.jsonl")
    assignment_by_id = {row["assignment_id"]: row for row in assignments}
    registry = rows(BASE / "fresh_agent_assignment_registry.jsonl")
    results = rows(BASE / "result_manifest.jsonl")
    errors = []

    duplicate_agent_instance_count = duplicate_count(row.get("agent_instance_id") for row in registry)
    duplicate_agent_path_count = duplicate_count(row.get("agent_path") for row in registry)
    duplicate_agent_thread_count = duplicate_count(row.get("agent_thread_id") for row in registry)
    duplicate_assignment_attempt_count = duplicate_count((row.get("assignment_id"), row.get("attempt")) for row in registry)
    if duplicate_agent_instance_count: errors.append("duplicate_agent_instance_id")
    if duplicate_agent_path_count: errors.append("duplicate_agent_path")
    if duplicate_agent_thread_count: errors.append("duplicate_agent_thread_id")
    if duplicate_assignment_attempt_count: errors.append("duplicate_assignment_attempt")

    registry_by_attempt = {}
    for row in registry:
        key = (row.get("assignment_id"), row.get("attempt"), row.get("agent_path"))
        registry_by_attempt[key] = row
        assignment = assignment_by_id.get(row.get("assignment_id"))
        if assignment is None:
            errors.append(f"unallocated_registry_assignment:{row.get('assignment_id')}")
            continue
        capsule = json.loads(Path(assignment["capsule_ref"]).read_text())
        expected = {
            "runner_id": "runner-06",
            "model": "gpt-5.6-sol",
            "reasoning_effort": "ultra",
            "role": assignment["role"],
            "window_id": assignment["window_id"],
            "doc_id": assignment["doc_id"],
            "document_path": assignment["document_path"],
            "core_range": assignment["core_range"],
            "overlap_ranges": capsule.get("context_ranges", []),
            "source_sha256": assignment["source_sha256"],
            "capsule_ref": assignment["capsule_ref"],
            "capsule_sha256": assignment["capsule_sha256"],
            "capsule_bytes": assignment["capsule_bytes"],
            "source_excerpt_ref": assignment["source_excerpt_ref"],
            "source_excerpt_sha256": assignment["source_excerpt_sha256"],
            "source_excerpt_bytes": assignment["source_excerpt_bytes"],
            "capsule_package_bytes": assignment["capsule_package_bytes"],
            "token_estimate": assignment["token_estimate"],
            "prior_substantive_assignment_count": 0,
            "terminal_after_result": True,
            "no_followup_reuse": True,
        }
        for field, value in expected.items():
            if row.get(field) != value:
                errors.append(f"registry_metadata_mismatch:{row['agent_path']}:{field}")
        if not str(row.get("agent_instance_id", "")).startswith("a004_r06_"):
            errors.append(f"agent_name_prefix:{row.get('agent_instance_id')}")
        if row.get("agent_thread_id") != row.get("agent_path") or row.get("agent_thread_id_kind") != "native_collaboration_canonical_path":
            errors.append(f"agent_thread_identity:{row.get('agent_path')}")

    result_attempt_keys = set()
    valid_by_assignment = defaultdict(list)
    failed_attempt_count = 0
    for row in results:
        key = (row.get("assignment_id"), row.get("attempt"), row.get("agent_path"))
        if key in result_attempt_keys:
            errors.append(f"duplicate_result_attempt:{key}")
        result_attempt_keys.add(key)
        dispatch = registry_by_attempt.get(key)
        if dispatch is None:
            errors.append(f"result_without_dispatch:{key}")
            continue
        for field in ("agent_instance_id", "agent_thread_id", "model", "reasoning_effort", "role", "window_id", "doc_id", "document_path", "source_sha256", "capsule_ref", "capsule_sha256", "capsule_bytes", "capsule_package_bytes", "prior_substantive_assignment_count", "terminal_after_result", "no_followup_reuse"):
            if row.get(field) != dispatch.get(field):
                errors.append(f"result_dispatch_mismatch:{key}:{field}")
        result_ref = Path(row.get("result_ref", ""))
        if not result_ref.is_file():
            errors.append(f"result_missing:{key}")
        else:
            raw = result_ref.read_bytes()
            if hashlib.sha256(raw).hexdigest() != row.get("result_sha256"):
                errors.append(f"result_hash_mismatch:{key}")
            if len(raw) != row.get("result_bytes"):
                errors.append(f"result_bytes_mismatch:{key}")
        if row.get("valid"):
            valid_by_assignment[row["assignment_id"]].append(row)
            if row.get("coverage_credit") != 1:
                errors.append(f"valid_coverage_credit:{key}")
            if result_ref.is_file():
                validation = validate_result(result_ref, row["assignment_id"])
                if not validation["passed"]:
                    errors.append(f"valid_result_revalidation_failed:{key}")
        else:
            failed_attempt_count += 1
            if row.get("coverage_credit") != 0:
                errors.append(f"failed_coverage_credit:{key}")
        if row.get("completed_at") is None:
            errors.append(f"missing_completed_at:{key}")

    for assignment_id, covered in valid_by_assignment.items():
        if len(covered) != 1:
            errors.append(f"multiple_valid_results:{assignment_id}")
    valid_assignment_ids = set(valid_by_assignment)
    uncovered = [row["assignment_id"] for row in assignments if row["assignment_id"] not in valid_assignment_ids]
    if not args.allow_incomplete and uncovered:
        errors.append(f"uncovered_assignments:{len(uncovered)}")

    timestamps = []
    for row in registry:
        for field in ("created_at", "completed_at"):
            if row.get(field):
                try: timestamps.append(datetime.fromisoformat(row[field].replace("Z", "+00:00")))
                except ValueError: errors.append(f"invalid_timestamp:{row['agent_path']}:{field}")
    elapsed_seconds = (max(timestamps) - min(timestamps)).total_seconds() if timestamps else 0
    report = {
        "passed": not errors,
        "complete": not uncovered,
        "assignment_count": len(assignments),
        "valid_assignment_count": len(valid_assignment_ids),
        "uncovered_assignment_count": len(uncovered),
        "uncovered_assignment_ids": uncovered,
        "unique_agents_spawned": len(registry),
        "failed_attempt_count": failed_attempt_count,
        "duplicate_agent_instance_count": duplicate_agent_instance_count,
        "duplicate_agent_path_count": duplicate_agent_path_count,
        "duplicate_agent_thread_count": duplicate_agent_thread_count,
        "duplicate_assignment_attempt_count": duplicate_assignment_attempt_count,
        "recycled_agent_count": 0 if not (duplicate_agent_instance_count or duplicate_agent_path_count or duplicate_agent_thread_count) else 1,
        "multi_scope_agent_count": 0,
        "total_attempt_capsule_package_bytes": sum(row.get("capsule_package_bytes", 0) for row in registry),
        "total_attempt_token_estimate": sum(row.get("token_estimate", 0) for row in registry),
        "elapsed_seconds": elapsed_seconds,
        "error_count": len(errors),
        "errors": errors,
    }
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
