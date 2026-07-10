#!/usr/bin/env python3
"""Frozen read-only global runner/result validator for audit-004.

Unlike the prelaunch validator, this validator inspects runner namespaces,
fresh-agent registries, result receipts, hashes, and RUNNER_COMPLETE markers.
It never edits runner output and cannot report PASS until every assignment has
exactly one receipt-valid completion.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
REPO = ROOT.parents[2]
AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_jsonl(path: Path, violations: list[str]) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    rows: list[dict[str, Any]] = []
    for line_no, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        try:
            row = json.loads(raw)
        except Exception as exc:
            violations.append(f"invalid_jsonl:{path.relative_to(ROOT)}:{line_no}:{exc}")
            continue
        if not isinstance(row, dict):
            violations.append(f"non_object_jsonl:{path.relative_to(ROOT)}:{line_no}")
            continue
        rows.append(row)
    return rows


def value(row: dict[str, Any], *names: str) -> Any:
    for name in names:
        if name in row and row[name] is not None:
            return row[name]
    return None


def is_completed(row: dict[str, Any]) -> bool:
    state = str(value(row, "state", "attempt_state", "attempt_status", "dispatch_status") or "").lower()
    return bool(row.get("completed_at")) and bool(value(row, "result_ref")) and bool(value(row, "result_sha256", "result_hash")) and state not in {"running", "dispatched", "in_progress", "dispatched_active"}


def resolve_ref(ref: str | None) -> Path | None:
    if not ref:
        return None
    path = Path(ref)
    return path if path.is_absolute() else REPO / path


def validate() -> dict[str, Any]:
    violations: list[str] = []
    pending: list[str] = []
    expected_rows = read_jsonl(ROOT / "assignments" / "global_assignment_manifest.jsonl", violations)
    expected = {row["assignment_id"]: row for row in expected_rows}
    if len(expected) != 2538 or len(expected) != len(expected_rows):
        violations.append(f"expected_assignment_manifest:{len(expected_rows)}:{len(expected)}")
    runner_threads = json.loads((ROOT / "coordination" / "runner_thread_registry.json").read_text(encoding="utf-8"))
    capsule_rows = read_jsonl(ROOT / "manifests" / "context_capsule_registry.jsonl", violations)
    capsules = {row["assignment_id"]: row for row in capsule_rows}

    seen_attempts: set[str] = set()
    agent_path_owner: dict[str, str] = {}
    agent_instance_owner: dict[str, str] = {}
    agent_thread_owner: dict[str, str] = {}
    registry_assignments: dict[str, list[dict[str, Any]]] = defaultdict(list)
    valid_completed: dict[str, dict[str, Any]] = {}
    runner_summaries: dict[str, Any] = {}

    for runner_id, runner_thread_id in sorted(runner_threads.items()):
        runner_root = ROOT / "runners" / runner_id
        packet_rows = read_jsonl(ROOT / "assignments" / f"{runner_id}.jsonl", violations)
        packet_ids = {row.get("assignment_id") for row in packet_rows}
        expected_runner_ids = {aid for aid, row in expected.items() if row.get("runner_id") == runner_id}
        if packet_ids != expected_runner_ids:
            violations.append(f"runner_packet_mismatch:{runner_id}:{len(packet_ids)}:{len(expected_runner_ids)}")

        registry_path = runner_root / "fresh_agent_assignment_registry.jsonl"
        registry = read_jsonl(registry_path, violations)
        results_manifest = read_jsonl(runner_root / "result_manifest.jsonl", violations)
        nonblank_result_rows = len(results_manifest)
        runner_valid = 0
        runner_pending_identity = 0

        if not registry:
            pending.append(f"registry_empty:{runner_id}")

        for row_index, row in enumerate(registry, 1):
            assignment_id = value(row, "assignment_id")
            attempt_id = str(value(row, "attempt_id") or f"{assignment_id}:row-{row_index}")
            if attempt_id in seen_attempts:
                violations.append(f"duplicate_attempt_id:{attempt_id}")
            seen_attempts.add(attempt_id)
            if assignment_id not in expected:
                violations.append(f"unknown_assignment:{runner_id}:{assignment_id}")
                continue
            exp = expected[assignment_id]
            registry_assignments[assignment_id].append(row)
            if exp.get("runner_id") != runner_id or row.get("runner_id") != runner_id:
                violations.append(f"runner_scope_spill:{runner_id}:{assignment_id}")
            if value(row, "runner_thread_id") not in (None, runner_thread_id):
                violations.append(f"runner_thread_mismatch:{assignment_id}")
            comparisons = (
                ("window_id", value(row, "window_id"), exp.get("window_id")),
                ("document_path", value(row, "document_path"), exp.get("document_path")),
                ("role", value(row, "role"), exp.get("role")),
                ("source_hash", value(row, "source_sha256", "source_hash"), exp.get("source_sha256")),
                ("capsule_hash", value(row, "capsule_sha256", "capsule_hash"), exp.get("capsule_sha256")),
            )
            for label, actual, wanted in comparisons:
                if actual not in (None, wanted):
                    violations.append(f"{label}_mismatch:{assignment_id}")
            if value(row, "model") != "gpt-5.6-sol" or value(row, "reasoning_effort") != "ultra":
                violations.append(f"model_effort:{assignment_id}")
            if value(row, "prior_substantive_assignment_count") != 0:
                violations.append(f"prior_assignment_count:{assignment_id}")
            if value(row, "terminal_after_result") is not True:
                violations.append(f"terminal_flag:{assignment_id}")
            if value(row, "no_followup_reuse") is not True:
                violations.append(f"followup_reuse_flag:{assignment_id}")

            agent_path = str(value(row, "agent_path") or "")
            agent_instance = str(value(row, "agent_instance_id") or "")
            agent_thread = str(value(row, "agent_thread_id") or "")
            if not agent_path:
                violations.append(f"missing_agent_path:{assignment_id}")
            else:
                owner = agent_path_owner.setdefault(agent_path, assignment_id)
                if owner != assignment_id:
                    violations.append(f"agent_path_reuse:{agent_path}:{owner}:{assignment_id}")
            if not agent_instance:
                violations.append(f"missing_agent_instance:{assignment_id}")
            else:
                owner = agent_instance_owner.setdefault(agent_instance, assignment_id)
                if owner != assignment_id:
                    violations.append(f"agent_instance_reuse:{agent_instance}:{owner}:{assignment_id}")
            if not agent_thread:
                runner_pending_identity += 1
                pending.append(f"agent_thread_receipt_missing:{assignment_id}")
            else:
                owner = agent_thread_owner.setdefault(agent_thread, assignment_id)
                if owner != assignment_id:
                    violations.append(f"agent_thread_reuse:{agent_thread}:{owner}:{assignment_id}")

            cap = capsules.get(assignment_id)
            if not cap:
                violations.append(f"capsule_registry_missing:{assignment_id}")
            else:
                for ref_name, hash_name in (("capsule_ref", "capsule_sha256"), ("source_excerpt_ref", "source_excerpt_sha256")):
                    path = resolve_ref(str(cap.get(ref_name) or ""))
                    if not path or not path.is_file() or sha(path) != cap.get(hash_name):
                        violations.append(f"capsule_receipt:{assignment_id}:{ref_name}")

            if is_completed(row):
                result_ref = str(value(row, "result_ref") or "")
                result_hash = str(value(row, "result_sha256", "result_hash") or "")
                result_path = resolve_ref(result_ref)
                completion_errors = []
                if not agent_thread:
                    completion_errors.append("missing_agent_thread_receipt")
                if not result_path or not result_path.is_file():
                    completion_errors.append("missing_result_file")
                elif sha(result_path) != result_hash:
                    completion_errors.append("result_hash_mismatch")
                else:
                    try:
                        body = json.loads(result_path.read_text(encoding="utf-8"))
                        if isinstance(body, dict) and body.get("assignment_id") not in (None, assignment_id):
                            completion_errors.append("result_assignment_mismatch")
                    except Exception:
                        completion_errors.append("result_not_json")
                if completion_errors:
                    violations.extend(f"completion:{assignment_id}:{item}" for item in completion_errors)
                else:
                    if assignment_id in valid_completed:
                        violations.append(f"multiple_valid_completions:{assignment_id}")
                    valid_completed[assignment_id] = row
                    runner_valid += 1

        complete_path = runner_root / "RUNNER_COMPLETE.json"
        if not complete_path.is_file():
            pending.append(f"runner_complete_missing:{runner_id}")
        else:
            try:
                complete = json.loads(complete_path.read_text(encoding="utf-8"))
                if complete.get("runner_id") not in (None, runner_id):
                    violations.append(f"runner_complete_identity:{runner_id}")
            except Exception as exc:
                violations.append(f"runner_complete_invalid:{runner_id}:{exc}")

        runner_summaries[runner_id] = {
            "expected_assignments": len(expected_runner_ids),
            "registry_rows": len(registry),
            "result_manifest_rows": nonblank_result_rows,
            "receipt_valid_completions": runner_valid,
            "pending_agent_thread_receipts": runner_pending_identity,
            "runner_complete_present": complete_path.is_file(),
        }

    for assignment_id, rows in registry_assignments.items():
        # Multiple attempts are allowed only with distinct identities and only
        # one receipt-valid completion. The global identity maps above enforce
        # that failed attempts cannot recycle an agent.
        if len(rows) > 1 and len({value(row, "agent_path") for row in rows}) != len(rows):
            violations.append(f"retry_agent_reuse:{assignment_id}")

    completed_count = len(valid_completed)
    runner_complete_count = sum(1 for row in runner_summaries.values() if row["runner_complete_present"])
    if violations:
        status = "fail"
    elif completed_count == len(expected) and runner_complete_count == len(runner_threads):
        status = "pass"
    else:
        status = "in_progress"
    return {
        "audit_id": AUDIT_ID,
        "validator": "postrun_validator_v1",
        "observed_at": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "coverage_credit": completed_count if status != "fail" else 0,
        "expected_assignments": len(expected),
        "registry_assignment_count": len(registry_assignments),
        "receipt_valid_completed_assignments": completed_count,
        "runner_complete_count": runner_complete_count,
        "globally_unique_agent_paths": len(agent_path_owner),
        "globally_unique_agent_instances": len(agent_instance_owner),
        "globally_unique_agent_threads": len(agent_thread_owner),
        "runner_summaries": runner_summaries,
        "pending_count": len(pending),
        "pending_sample": pending[:100],
        "violation_count": len(violations),
        "violations": violations[:200],
        "pass_rule": "All 2538 assignments have exactly one receipt-valid completion, all identities are globally unique, all hashes match, and all 12 RUNNER_COMPLETE receipts exist.",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output")
    args = parser.parse_args()
    result = validate()
    if args.output:
        output = Path(args.output).resolve()
        if ROOT not in output.parents:
            raise RuntimeError("output must stay inside audit root")
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2, sort_keys=True))
    if result["status"] == "fail":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
