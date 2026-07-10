#!/usr/bin/env python3
"""Record mechanically validated attempt receipts and checkpoint one dispatch wave."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import sys
from collections import Counter, defaultdict
from typing import Any


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
RUNNER_ID = "runner-10"
RUNNER_THREAD_ID = "019f49e2-18cb-7101-b7cb-0027862d9fcb"
REPO = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster")
AUDIT = REPO / "Plans/.audits" / AUDIT_ID
RUNNER = AUDIT / "runners/runner-10"
REGISTRY = RUNNER / "fresh_agent_assignment_registry.jsonl"
RESULTS = RUNNER / "result_manifest.jsonl"
FAILED = RUNNER / "failed_attempts.jsonl"
CHECKPOINT = RUNNER / "checkpoint.json"
ASSIGNMENTS = AUDIT / "assignments/runner-10.jsonl"


def read_jsonl(path: pathlib.Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return [json.loads(x) for x in path.read_text().splitlines() if x]


def write_jsonl(path: pathlib.Path, rows: list[dict[str, Any]]) -> None:
    data = "".join(json.dumps(x, sort_keys=True, separators=(",", ":")) + "\n" for x in rows)
    path.write_text(data)


def load_assignments() -> dict[str, dict[str, Any]]:
    return {x["assignment_id"]: x for x in read_jsonl(ASSIGNMENTS)}


def parse_time(value: str) -> dt.datetime:
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wave", type=int, required=True)
    parser.add_argument("--receipt", action="append", required=True)
    args = parser.parse_args()

    assignments = load_assignments()
    registry = read_jsonl(REGISTRY)
    results = read_jsonl(RESULTS)
    failed = read_jsonl(FAILED)
    receipts = [json.loads((REPO / x).read_text()) if not pathlib.Path(x).is_absolute() else json.loads(pathlib.Path(x).read_text()) for x in args.receipt]

    seen_receipts = set()
    wave_rows = []
    for receipt_path, receipt in zip(args.receipt, receipts):
        key = (receipt["assignment_id"], receipt["agent_path"])
        if key in seen_receipts:
            raise ValueError(f"duplicate receipt in wave: {key}")
        seen_receipts.add(key)
        matches = [x for x in registry if x.get("assignment_id") == key[0] and x.get("agent_path") == key[1]]
        if len(matches) != 1:
            raise ValueError(f"registry match count {len(matches)} for {key}")
        row = matches[0]
        assignment = assignments[key[0]]
        previous_name = row.get("agent_instance_id")
        row.update({
            "agent_name": previous_name,
            "agent_instance_id": receipt["agent_instance_id"],
            "agent_thread_id": receipt["agent_thread_id"],
            "agent_thread_id_source": "native_session_meta.id",
            "agent_nickname": receipt.get("agent_nickname"),
            "session_ref": receipt["session_ref"],
            "created_at": receipt["session_created_at"],
            "completed_at": receipt["completed_at"],
            "result_ref": receipt["result_ref"],
            "result_sha256": receipt["result_sha256"],
            "result_bytes": receipt["result_bytes"],
            "attempt_status": "valid" if receipt["validation_passed"] else "invalid_zero_coverage",
            "coverage_credit": 1 if receipt["validation_passed"] else 0,
            "validation_passed": receipt["validation_passed"],
            "validation_errors": receipt["errors"],
            "validation_ref": str(pathlib.Path(receipt_path).relative_to(REPO)) if pathlib.Path(receipt_path).is_absolute() else receipt_path,
            "terminal_after_result": True,
            "no_followup_reuse": True,
        })
        row.pop("agent_instance_id_pending_session_receipt", None)

        manifest_row = {
            "assignment_id": assignment["assignment_id"],
            "assignment_seq": assignment["assignment_seq"],
            "runner_id": RUNNER_ID,
            "runner_thread_id": RUNNER_THREAD_ID,
            "agent_name": row["agent_name"],
            "agent_instance_id": receipt["agent_instance_id"],
            "agent_path": receipt["agent_path"],
            "agent_thread_id": receipt["agent_thread_id"],
            "agent_nickname": receipt.get("agent_nickname"),
            "session_ref": receipt["session_ref"],
            "model": receipt["model"],
            "reasoning_effort": receipt["reasoning_effort"],
            "role": assignment["role"],
            "window_id": assignment["window_id"],
            "doc_id": assignment["doc_id"],
            "document_path": assignment["document_path"],
            "core_range": assignment["core_range"],
            "context_ranges": json.loads((REPO / assignment["capsule_ref"]).read_text())["context_ranges"],
            "source_sha256": assignment["source_sha256"],
            "source_excerpt_ref": assignment["source_excerpt_ref"],
            "source_excerpt_sha256": assignment["source_excerpt_sha256"],
            "source_excerpt_bytes": assignment["source_excerpt_bytes"],
            "capsule_ref": assignment["capsule_ref"],
            "capsule_sha256": assignment["capsule_sha256"],
            "capsule_bytes": assignment["capsule_bytes"],
            "capsule_package_bytes": assignment["capsule_package_bytes"],
            "token_estimate": assignment["token_estimate"],
            "created_at": receipt["session_created_at"],
            "completed_at": receipt["completed_at"],
            "prior_substantive_assignment_count": 0,
            "terminal_after_result": True,
            "result_ref": receipt["result_ref"],
            "result_sha256": receipt["result_sha256"],
            "result_bytes": receipt["result_bytes"],
            "no_followup_reuse": True,
            "scope_validation_passed": receipt["validation_passed"],
            "exact_evidence_validation_passed": receipt["validation_passed"],
            "role_leakage": False,
            "coverage_credit": 1 if receipt["validation_passed"] else 0,
        }
        if receipt["validation_passed"]:
            if any(x["assignment_id"] == assignment["assignment_id"] for x in results):
                raise ValueError(f"assignment already has valid result: {assignment['assignment_id']}")
            results.append(manifest_row)
        else:
            manifest_row["validation_errors"] = receipt["errors"]
            failed.append(manifest_row)
        wave_rows.append({
            "assignment_id": assignment["assignment_id"],
            "agent_instance_id": receipt["agent_instance_id"],
            "agent_path": receipt["agent_path"],
            "validation_passed": receipt["validation_passed"],
            "coverage_credit": manifest_row["coverage_credit"],
            "result_ref": receipt["result_ref"],
            "result_sha256": receipt["result_sha256"],
            "validation_errors": receipt["errors"],
        })

    instance_counts = Counter(x.get("agent_instance_id") for x in registry)
    path_counts = Counter(x.get("agent_path") for x in registry)
    assignments_by_instance: dict[str, set[str]] = defaultdict(set)
    assignments_by_path: dict[str, set[str]] = defaultdict(set)
    for row in registry:
        assignments_by_instance[str(row.get("agent_instance_id"))].add(row["assignment_id"])
        assignments_by_path[str(row.get("agent_path"))].add(row["assignment_id"])
    duplicate_identity_count = sum(1 for x in instance_counts.values() if x > 1) + sum(1 for x in path_counts.values() if x > 1)
    recycled_identity_count = sum(1 for x in assignments_by_instance.values() if len(x) > 1) + sum(1 for x in assignments_by_path.values() if len(x) > 1)
    multi_scope_count = recycled_identity_count
    if duplicate_identity_count or recycled_identity_count:
        raise ValueError("identity uniqueness invariant failed")

    write_jsonl(REGISTRY, registry)
    write_jsonl(RESULTS, results)
    write_jsonl(FAILED, failed)

    now = dt.datetime.now(dt.timezone.utc)
    created = parse_time("2026-07-10T03:10:05Z")
    valid_assignment_ids = {x["assignment_id"] for x in results}
    checkpoint = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "runner_thread_id": RUNNER_THREAD_ID,
        "status": "dispatching",
        "ready_sha256": "aa353b8f33dfda7c2695d7325e843deb169a67b0d4d96778214c2e6674681b4c",
        "assignment_packet_ref": f"Plans/.audits/{AUDIT_ID}/assignments/runner-10.jsonl",
        "assignment_packet_sha256": "ffc5d7b602fc512c6ff5e486f929b09533391a5a651298348c82e59efd9d2b72",
        "assignments_total": len(assignments),
        "waves_completed": args.wave,
        "attempts_recorded": len(registry),
        "valid_assignments": len(valid_assignment_ids),
        "failed_attempts": len(failed),
        "unique_agents_spawned": len({x["agent_path"] for x in registry}),
        "duplicate_identity_count": duplicate_identity_count,
        "recycled_identity_count": recycled_identity_count,
        "multi_scope_count": multi_scope_count,
        "cumulative_capsule_package_bytes_attempted": sum(x["capsule_package_bytes"] for x in registry),
        "cumulative_token_estimate_attempted": sum(x["token_estimate"] for x in registry),
        "valid_capsule_package_bytes": sum(assignments[x]["capsule_package_bytes"] for x in valid_assignment_ids),
        "valid_token_estimate": sum(assignments[x]["token_estimate"] for x in valid_assignment_ids),
        "current_wave": args.wave + 1,
        "created_at": "2026-07-10T03:10:05Z",
        "updated_at": now.isoformat().replace("+00:00", "Z"),
        "elapsed_time_seconds": int((now - created).total_seconds()),
        "unresolved_infrastructure_issues": [],
    }
    CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, sort_keys=True) + "\n")

    wave_receipt = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "wave": args.wave,
        "recorded_at": checkpoint["updated_at"],
        "attempt_count": len(wave_rows),
        "valid_count": sum(1 for x in wave_rows if x["validation_passed"]),
        "failed_count": sum(1 for x in wave_rows if not x["validation_passed"]),
        "attempts": wave_rows,
        "duplicate_identity_count": duplicate_identity_count,
        "recycled_identity_count": recycled_identity_count,
        "multi_scope_count": multi_scope_count,
        "checkpoint_ref": f"Plans/.audits/{AUDIT_ID}/runners/runner-10/checkpoint.json",
    }
    wave_path = RUNNER / "validation/waves" / f"wave-{args.wave:04d}.json"
    wave_path.parent.mkdir(parents=True, exist_ok=True)
    wave_path.write_text(json.dumps(wave_receipt, indent=2, sort_keys=True) + "\n")
    print(json.dumps(checkpoint, sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1)
