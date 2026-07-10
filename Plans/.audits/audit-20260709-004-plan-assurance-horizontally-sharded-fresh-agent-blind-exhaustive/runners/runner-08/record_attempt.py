#!/usr/bin/env python3
"""Mechanically validate and record one immutable reviewer attempt."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any


RUNNER_DIR = Path(__file__).resolve().parent
AUDIT_ROOT = RUNNER_DIR.parents[1]
WORKSPACE = RUNNER_DIR.parents[4]
PACKET = AUDIT_ROOT / "assignments" / "runner-08.jsonl"
PROTOCOL = RUNNER_DIR / "reviewer_protocol.json"
UUID_RE = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def append_jsonl(path: Path, row: dict[str, Any]) -> None:
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
        handle.write("\n")


def workspace_path(ref: str) -> Path:
    return WORKSPACE / ref


def normalized_text(value: str) -> str:
    return " ".join(value.split())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--agent-instance-id", required=True)
    parser.add_argument("--agent-path", required=True)
    parser.add_argument("--created-at", required=True)
    parser.add_argument("--completed-at", required=True)
    parser.add_argument("--raw-ref", required=True)
    parser.add_argument("--attempt-no", required=True, type=int)
    parser.add_argument("--dispatch-receipt-ref", required=True)
    args = parser.parse_args()

    assignments = {row["assignment_id"]: row for row in read_jsonl(PACKET)}
    if args.assignment_id not in assignments:
        raise SystemExit(f"unknown assignment: {args.assignment_id}")
    assignment = assignments[args.assignment_id]
    capsule = json.loads(workspace_path(assignment["capsule_ref"]).read_text(encoding="utf-8"))
    raw_path = workspace_path(args.raw_ref)
    raw_bytes = raw_path.read_bytes()
    result_sha256 = sha256_bytes(raw_bytes)
    result_bytes = len(raw_bytes)
    errors: list[str] = []

    dispatch_receipt_path = workspace_path(args.dispatch_receipt_ref)
    dispatch_receipt_sha256: str | None = None
    dispatch_receipt: dict[str, Any] = {}
    if not dispatch_receipt_path.exists():
        errors.append("dispatch_receipt_missing")
    else:
        dispatch_receipt_bytes = dispatch_receipt_path.read_bytes()
        dispatch_receipt_sha256 = sha256_bytes(dispatch_receipt_bytes)
        try:
            dispatch_receipt = json.loads(dispatch_receipt_bytes.decode("utf-8"))
        except Exception as exc:
            errors.append(f"dispatch_receipt_invalid_json:{type(exc).__name__}")
            dispatch_receipt = {}
        expected_dispatch = {
            "assignment_id": assignment["assignment_id"],
            "runner_id": assignment["runner_id"],
            "attempt_no": args.attempt_no,
            "agent_instance_id": args.agent_instance_id,
            "agent_path": args.agent_path,
            "model": assignment["required_model"],
            "reasoning_effort": assignment["required_reasoning_effort"],
            "fork_turns": "none",
            "created_at": args.created_at,
            "state": "immutable_prelaunch_dispatch",
        }
        for key, expected in expected_dispatch.items():
            if dispatch_receipt.get(key) != expected:
                errors.append(f"dispatch_receipt_field_mismatch:{key}")
        if dispatch_receipt.get("agent_thread_id") is not None:
            errors.append("dispatch_receipt_not_prelaunch")
        launch_ref = dispatch_receipt.get("launch_packet_ref")
        launch_path = workspace_path(launch_ref) if isinstance(launch_ref, str) else None
        if launch_path is None or not launch_path.exists():
            errors.append("launch_packet_missing")
        else:
            launch_bytes = launch_path.read_bytes()
            if sha256_bytes(launch_bytes) != dispatch_receipt.get("launch_packet_sha256"):
                errors.append("launch_packet_hash_mismatch")
            if len(launch_bytes) != dispatch_receipt.get("launch_packet_bytes"):
                errors.append("launch_packet_bytes_mismatch")

    try:
        result = json.loads(raw_bytes.decode("utf-8"))
    except Exception as exc:  # exact raw result remains preserved
        result = None
        errors.append(f"invalid_json:{type(exc).__name__}")

    registry_path = RUNNER_DIR / "fresh_agent_assignment_registry.jsonl"
    registry = read_jsonl(registry_path)
    for field, expected in (
        ("agent_instance_id", args.agent_instance_id),
        ("agent_path", args.agent_path),
    ):
        if any(row.get(field) == expected for row in registry):
            errors.append(f"duplicate_{field}")

    thread_id = result.get("agent_thread_id") if isinstance(result, dict) else None
    if not isinstance(thread_id, str) or not UUID_RE.fullmatch(thread_id):
        errors.append("missing_or_invalid_agent_thread_id")
    elif any(row.get("agent_thread_id") == thread_id for row in registry):
        errors.append("duplicate_agent_thread_id")

    expected_top = {
        "schema_version": "a004.document_window_result.v1",
        "assignment_id": assignment["assignment_id"],
        "runner_id": assignment["runner_id"],
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "model": assignment["required_model"],
        "reasoning_effort": assignment["required_reasoning_effort"],
        "agent_instance_id": args.agent_instance_id,
        "agent_path": args.agent_path,
        "terminal_after_result": True,
    }

    if isinstance(result, dict):
        for key, expected in expected_top.items():
            if result.get(key) != expected:
                errors.append(f"field_mismatch:{key}")

        hv = result.get("hash_verification")
        required_hv = (
            "capsule_sha256_match",
            "source_excerpt_sha256_match",
            "capsule_bytes_match",
            "source_excerpt_bytes_match",
        )
        if not isinstance(hv, dict) or any(hv.get(key) is not True for key in required_hv):
            errors.append("hash_verification_failed")

        scope = result.get("scope_attestation")
        allowed_reads = {
            assignment["capsule_ref"],
            assignment["source_excerpt_ref"],
            str(PROTOCOL.relative_to(WORKSPACE)),
            str((RUNNER_DIR / "reviewer_protocol_v2.json").relative_to(WORKSPACE)),
            str((RUNNER_DIR / "reviewer_protocol_v3.json").relative_to(WORKSPACE)),
            str((RUNNER_DIR / "reviewer_protocol_v4.json").relative_to(WORKSPACE)),
            str((RUNNER_DIR / "evidence_locator.py").relative_to(WORKSPACE)),
            str((RUNNER_DIR / "evidence_locator_v2.py").relative_to(WORKSPACE)),
        }
        if not isinstance(scope, dict):
            errors.append("scope_attestation_missing")
        else:
            files_read = scope.get("files_read")
            if not isinstance(files_read, list):
                errors.append("scope_files_read_invalid")
            else:
                file_set = set(files_read)
                if assignment["capsule_ref"] not in file_set or assignment["source_excerpt_ref"] not in file_set:
                    errors.append("scope_required_files_missing")
                if not file_set.issubset(allowed_reads):
                    errors.append("scope_spill_files_read")
            for key in ("other_files_read", "prior_audits_seen", "other_results_seen", "unrelated_windows_seen"):
                if scope.get(key) is not False:
                    errors.append(f"scope_flag_invalid:{key}")

        if result.get("infrastructure_failure") is not None:
            errors.append("infrastructure_failure")

        array_fields = ("observations", "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs")
        for key in array_fields:
            if not isinstance(result.get(key), list):
                errors.append(f"array_missing:{key}")

        ranges = [capsule["core_range"], *capsule.get("context_ranges", [])]
        source_lines = workspace_path(assignment["document_path"]).read_text(encoding="utf-8").splitlines()

        def evidence_valid(ref: Any, label: str) -> None:
            if not isinstance(ref, dict):
                errors.append(f"evidence_not_object:{label}")
                return
            doc = ref.get("document_path")
            start = ref.get("line_start")
            end = ref.get("line_end")
            quote = ref.get("quote")
            if doc != assignment["document_path"]:
                errors.append(f"evidence_path_mismatch:{label}")
            if not isinstance(start, int) or not isinstance(end, int) or start > end:
                errors.append(f"evidence_range_invalid:{label}")
                return
            if not any(start >= low and end <= high for low, high in ranges):
                errors.append(f"evidence_out_of_scope:{label}:{start}-{end}")
                return
            if start < 1 or end > len(source_lines):
                errors.append(f"evidence_source_bounds:{label}")
                return
            if not isinstance(quote, str) or not quote.strip():
                errors.append(f"evidence_quote_missing:{label}")
                return
            haystack = normalized_text("\n".join(source_lines[start - 1 : end]))
            if normalized_text(quote) not in haystack:
                errors.append(f"evidence_quote_mismatch:{label}:{start}-{end}")

        id_specs = (
            ("observations", "observation_id", "evidence", "O-"),
            ("candidate_findings", "candidate_id", "evidence_refs", "CF-"),
            ("explicit_non_gaps", "non_gap_id", "evidence_refs", "NG-"),
            ("unknowns", "unknown_id", "related_evidence_refs", "U-"),
            ("exact_evidence_refs", "evidence_id", None, "E-"),
        )
        for collection, id_key, evidence_key, prefix in id_specs:
            items = result.get(collection, [])
            if not isinstance(items, list):
                continue
            seen_ids: set[str] = set()
            for index, item in enumerate(items):
                if not isinstance(item, dict):
                    errors.append(f"item_not_object:{collection}:{index}")
                    continue
                item_id = item.get(id_key)
                if not isinstance(item_id, str) or not item_id.startswith(prefix) or item_id in seen_ids:
                    errors.append(f"item_id_invalid:{collection}:{index}")
                else:
                    seen_ids.add(item_id)
                if collection == "candidate_findings" and item.get("severity") not in {"critical", "high", "medium", "low"}:
                    errors.append(f"severity_invalid:{index}")
                if evidence_key is None:
                    evidence_valid(item, f"{collection}:{index}")
                    continue
                refs = item.get(evidence_key)
                if not isinstance(refs, list):
                    errors.append(f"evidence_array_invalid:{collection}:{index}")
                    continue
                if collection != "unknowns" and not refs:
                    errors.append(f"evidence_required:{collection}:{index}")
                for ref_index, ref in enumerate(refs):
                    evidence_valid(ref, f"{collection}:{index}:{ref_index}")

        if result.get("candidate_findings") and not result.get("exact_evidence_refs"):
            errors.append("exact_evidence_refs_empty_with_findings")

    manifest_path = RUNNER_DIR / "result_manifest.jsonl"
    existing_manifest = read_jsonl(manifest_path)
    if any(row.get("assignment_id") == assignment["assignment_id"] for row in existing_manifest):
        errors.append("duplicate_valid_assignment_result")

    passed = not errors
    validation_name = f"{assignment['assignment_id']}--attempt-{args.attempt_no:02d}.validation.json"
    validation_ref = str((RUNNER_DIR / "validation" / validation_name).relative_to(WORKSPACE))
    completed_name = f"{assignment['assignment_id']}--attempt-{args.attempt_no:02d}.json"
    completed_ref = str((RUNNER_DIR / "completed_attempt_receipts" / completed_name).relative_to(WORKSPACE))
    completed_receipt = {
        "schema_version": "a004.completed_attempt_receipt.v2",
        "audit_id": assignment["audit_id"],
        "runner_id": assignment["runner_id"],
        "assignment_id": assignment["assignment_id"],
        "attempt_no": args.attempt_no,
        "agent_instance_id": args.agent_instance_id,
        "agent_path": args.agent_path,
        "agent_thread_id": thread_id,
        "model": assignment["required_model"],
        "reasoning_effort": assignment["required_reasoning_effort"],
        "fork_turns": "none",
        "created_at": args.created_at,
        "completed_at": args.completed_at,
        "dispatch_receipt_ref": args.dispatch_receipt_ref,
        "dispatch_receipt_sha256": dispatch_receipt_sha256,
        "result_ref": args.raw_ref,
        "result_sha256": result_sha256,
        "result_bytes": result_bytes,
        "validation_passed": passed,
        "coverage_credit": 1 if passed else 0,
        "validation_errors": errors,
        "state": "terminal_validated" if passed else "terminal_failed_zero_coverage",
        "terminal_after_result": True,
        "no_followup_reuse": True,
    }
    completed_path = workspace_path(completed_ref)
    try:
        with completed_path.open("x", encoding="utf-8") as handle:
            handle.write(json.dumps(completed_receipt, indent=2, sort_keys=True) + "\n")
    except FileExistsError:
        raise SystemExit(f"immutable completed receipt already exists: {completed_ref}")
    completed_receipt_sha256 = sha256_bytes(completed_path.read_bytes())
    result_record = {
        "assignment_id": assignment["assignment_id"],
        "runner_id": assignment["runner_id"],
        "agent_instance_id": args.agent_instance_id,
        "agent_path": args.agent_path,
        "agent_thread_id": thread_id,
        "model": assignment["required_model"],
        "reasoning_effort": assignment["required_reasoning_effort"],
        "role": assignment["role"],
        "role_key": assignment["role_key"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
        "core_sha256": assignment["core_sha256"],
        "source_sha256": assignment["source_sha256"],
        "capsule_ref": assignment["capsule_ref"],
        "capsule_sha256": assignment["capsule_sha256"],
        "capsule_bytes": assignment["capsule_bytes"],
        "capsule_package_bytes": assignment["capsule_package_bytes"],
        "source_excerpt_ref": assignment["source_excerpt_ref"],
        "source_excerpt_sha256": assignment["source_excerpt_sha256"],
        "source_excerpt_bytes": assignment["source_excerpt_bytes"],
        "created_at": args.created_at,
        "completed_at": args.completed_at,
        "attempt_no": args.attempt_no,
        "fork_turns": "none",
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "result_ref": args.raw_ref,
        "result_sha256": result_sha256,
        "result_bytes": result_bytes,
        "dispatch_receipt_ref": args.dispatch_receipt_ref,
        "dispatch_receipt_sha256": dispatch_receipt_sha256,
        "completed_receipt_ref": completed_ref,
        "completed_receipt_sha256": completed_receipt_sha256,
        "validation_ref": validation_ref,
        "validation_passed": passed,
        "coverage_credit": 1 if passed else 0,
        "validation_errors": errors,
    }
    append_jsonl(registry_path, result_record)

    validation = {
        "schema_version": "a004.runner_attempt_validation.v1",
        "audit_id": assignment["audit_id"],
        "runner_id": assignment["runner_id"],
        "assignment_id": assignment["assignment_id"],
        "attempt_no": args.attempt_no,
        "validated_at": args.completed_at,
        "result_ref": args.raw_ref,
        "result_sha256": result_sha256,
        "result_bytes": result_bytes,
        "passed": passed,
        "errors": errors,
    }
    workspace_path(validation_ref).write_text(json.dumps(validation, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    event = {
        "assignment_id": assignment["assignment_id"],
        "attempt_no": args.attempt_no,
        "agent_instance_id": args.agent_instance_id,
        "agent_path": args.agent_path,
        "agent_thread_id": thread_id,
        "state": "valid_result" if passed else "failed_attempt_zero_coverage",
        "created_at": args.created_at,
        "completed_at": args.completed_at,
        "result_ref": args.raw_ref,
        "validation_ref": validation_ref,
    }
    append_jsonl(RUNNER_DIR / "assignment_registry.jsonl", event)

    if passed:
        append_jsonl(manifest_path, result_record)
    else:
        append_jsonl(RUNNER_DIR / "failed_attempts.jsonl", result_record)

    print(json.dumps({
        "assignment_id": assignment["assignment_id"],
        "attempt_no": args.attempt_no,
        "passed": passed,
        "errors": errors,
        "agent_thread_id": thread_id,
        "result_sha256": result_sha256,
        "validation_ref": validation_ref,
    }, sort_keys=True))
    return 0 if passed else 2


if __name__ == "__main__":
    sys.exit(main())
