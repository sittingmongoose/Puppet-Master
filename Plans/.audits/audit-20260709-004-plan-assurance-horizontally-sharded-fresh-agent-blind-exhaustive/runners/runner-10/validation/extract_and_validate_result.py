#!/usr/bin/env python3
"""Mechanically extract one terminal subagent result and validate its immutable envelope.

This script performs no semantic adjudication. It copies the terminal agent message
verbatim, then checks identity, model/effort, schema, hashes, ranges, exact quotes,
and declared file-scope compliance.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import sys
from datetime import datetime
from typing import Any


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
RUNNER_ID = "runner-10"
RUNNER_THREAD_ID = "019f49e2-18cb-7101-b7cb-0027862d9fcb"
REPO = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster")
AUDIT = REPO / "Plans/.audits" / AUDIT_ID
RUNNER = AUDIT / "runners/runner-10"
SESSIONS = pathlib.Path("/Users/jaredsmacbookair/.codex/sessions")
ASSIGNMENTS = AUDIT / "assignments/runner-10.jsonl"
PROTOCOL_REF = f"Plans/.audits/{AUDIT_ID}/runners/runner-10/validation/reviewer_protocol_v1.json"
RESULT_KEYS = {
    "schema_version", "assignment_id", "runner_id", "role", "window_id",
    "doc_id", "document_path", "core_range", "context_ranges", "source_sha256",
    "source_excerpt_ref", "source_excerpt_sha256", "capsule_ref", "capsule_sha256",
    "capsule_bytes", "model", "reasoning_effort", "prior_substantive_assignment_count",
    "terminal_after_result", "no_followup_reuse", "hash_validation", "observations",
    "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs",
    "scope_compliance",
}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_assignment(assignment_id: str) -> dict[str, Any]:
    matches = []
    for line in ASSIGNMENTS.read_text().splitlines():
        row = json.loads(line)
        if row.get("assignment_id") == assignment_id:
            matches.append(row)
    if len(matches) != 1:
        raise ValueError(f"assignment match count is {len(matches)}, expected 1")
    return matches[0]


def session_candidates(agent_path: str) -> list[pathlib.Path]:
    proc = subprocess.run(
        ["rg", "-l", "-F", agent_path, str(SESSIONS)],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    return [pathlib.Path(x) for x in proc.stdout.splitlines() if x]


def load_session(agent_path: str) -> tuple[pathlib.Path, list[dict[str, Any]], dict[str, Any]]:
    matches = []
    for path in session_candidates(agent_path):
        try:
            rows = [json.loads(x) for x in path.read_text().splitlines() if x]
        except Exception:
            continue
        meta_rows = [x.get("payload", {}) for x in rows if x.get("type") == "session_meta"]
        if not meta_rows:
            continue
        meta = meta_rows[0]
        source = meta.get("source")
        if isinstance(source, dict):
            spawn = (((source.get("subagent") or {}).get("thread_spawn")) or {})
        else:
            spawn = {}
        if (
            spawn.get("agent_path") == agent_path
            and spawn.get("parent_thread_id") == RUNNER_THREAD_ID
            and meta.get("id")
        ):
            matches.append((path, rows, meta))
    if len(matches) != 1:
        raise ValueError(f"native session match count is {len(matches)}, expected 1")
    return matches[0]


def normalize_tool_paths(value: Any) -> set[str]:
    text = json.dumps(value, ensure_ascii=False)
    found = set(re.findall(r"Plans/[A-Za-z0-9_.\-/]+", text))
    return {x.rstrip("'\"),;:") for x in found}


def validate_and_write(
    agent_path: str,
    assignment_id: str,
    attempt: int | None,
    dispatch_receipt_ref: str | None,
    force_zero_credit_reason: str | None,
) -> dict[str, Any]:
    errors: list[str] = []
    assignment = load_assignment(assignment_id)
    session_path, session_rows, meta = load_session(agent_path)

    contexts = [x.get("payload", {}) for x in session_rows if x.get("type") == "turn_context"]
    if not contexts:
        errors.append("missing turn_context")
        turn = {}
    else:
        turn = contexts[-1]
    if turn.get("model") != "gpt-5.6-sol":
        errors.append(f"session model mismatch: {turn.get('model')!r}")
    if turn.get("effort") != "ultra":
        errors.append(f"session effort mismatch: {turn.get('effort')!r}")

    completes = [x for x in session_rows if x.get("type") == "event_msg" and x.get("payload", {}).get("type") == "task_complete"]
    if len(completes) != 1:
        errors.append(f"task_complete count is {len(completes)}, expected 1")
        raw = ""
        completed_at = None
        terminal_index = len(session_rows)
    else:
        complete = completes[0]
        raw = complete.get("payload", {}).get("last_agent_message", "")
        completed_at = complete.get("timestamp")
        terminal_index = session_rows.index(complete)
        for later in session_rows[terminal_index + 1:]:
            if later.get("type") == "response_item" and later.get("payload", {}).get("type") in {
                "message", "agent_message", "custom_tool_call", "function_call"
            }:
                errors.append("substantive output appears after terminal state")

    try:
        result = json.loads(raw)
    except Exception as exc:
        result = {}
        errors.append(f"terminal result is not one JSON object: {exc}")

    if result and set(result) != RESULT_KEYS:
        errors.append(f"result key mismatch missing={sorted(RESULT_KEYS-set(result))} extra={sorted(set(result)-RESULT_KEYS)}")

    capsule_path = REPO / assignment["capsule_ref"]
    source_path = REPO / assignment["source_excerpt_ref"]
    capsule = json.loads(capsule_path.read_text())

    expected = {
        "schema_version": "a004_window_review_result_v1",
        "assignment_id": assignment_id,
        "runner_id": RUNNER_ID,
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
        "context_ranges": capsule["context_ranges"],
        "source_sha256": assignment["source_sha256"],
        "source_excerpt_ref": assignment["source_excerpt_ref"],
        "source_excerpt_sha256": assignment["source_excerpt_sha256"],
        "capsule_ref": assignment["capsule_ref"],
        "capsule_sha256": assignment["capsule_sha256"],
        "capsule_bytes": assignment["capsule_bytes"],
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
    }
    for key, value in expected.items():
        if result.get(key) != value:
            errors.append(f"result {key} mismatch")

    hv = result.get("hash_validation")
    if hv != {"capsule": True, "source_excerpt": True, "sizes": True}:
        errors.append("hash_validation mismatch")
    if sha256_bytes(capsule_path.read_bytes()) != assignment["capsule_sha256"]:
        errors.append("live capsule hash mismatch")
    if capsule_path.stat().st_size != assignment["capsule_bytes"]:
        errors.append("live capsule byte mismatch")
    if sha256_bytes(source_path.read_bytes()) != assignment["source_excerpt_sha256"]:
        errors.append("live excerpt hash mismatch")
    if source_path.stat().st_size != assignment["source_excerpt_bytes"]:
        errors.append("live excerpt byte mismatch")
    canonical_path = REPO / assignment["document_path"]
    if not canonical_path.is_file():
        errors.append("canonical source missing")
        canonical_lines: list[str] = []
    else:
        canonical_bytes = canonical_path.read_bytes()
        if sha256_bytes(canonical_bytes) != assignment["source_sha256"]:
            errors.append("live canonical source hash mismatch")
        canonical_lines = canonical_bytes.decode("utf-8").splitlines()

    arrays = ["observations", "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs"]
    for key in arrays:
        if not isinstance(result.get(key), list):
            errors.append(f"{key} is not a list")

    evidence = result.get("exact_evidence_refs", []) if isinstance(result.get("exact_evidence_refs"), list) else []
    ids = [x.get("evidence_id") for x in evidence if isinstance(x, dict)]
    if not evidence:
        errors.append("exact_evidence_refs is empty")
    if len(ids) != len(set(ids)) or None in ids:
        errors.append("evidence IDs missing or duplicated")
    id_set = set(ids)
    allowed_ranges = [assignment["core_range"], *capsule["context_ranges"]]
    for ref in evidence:
        if not isinstance(ref, dict):
            errors.append("non-object evidence ref")
            continue
        if set(ref) != {"evidence_id", "path", "line_start", "line_end", "quote"}:
            errors.append(f"evidence {ref.get('evidence_id')} key mismatch")
        start, end = ref.get("line_start"), ref.get("line_end")
        if not isinstance(start, int) or not isinstance(end, int) or start > end:
            errors.append(f"evidence {ref.get('evidence_id')} invalid range")
            continue
        if not any(start >= low and end <= high for low, high in allowed_ranges):
            errors.append(f"evidence {ref.get('evidence_id')} outside capsule range")
        if ref.get("path") != assignment["document_path"]:
            errors.append(f"evidence {ref.get('evidence_id')} path mismatch")
        if start < 1 or end > len(canonical_lines):
            errors.append(f"evidence {ref.get('evidence_id')} outside canonical source")
            continue
        exact = " ".join("\n".join(canonical_lines[start - 1:end]).split())
        quote = ref.get("quote")
        normalized_quote = " ".join(quote.split()) if isinstance(quote, str) else ""
        if not normalized_quote or normalized_quote not in exact:
            errors.append(f"evidence {ref.get('evidence_id')} quote mismatch")

    semantic_specs = {
        "observations": ("observation_id", {"observation_id", "summary", "evidence_ids"}),
        "candidate_findings": ("finding_id", {"finding_id", "gap_type", "severity", "summary", "why_gap", "evidence_ids"}),
        "explicit_non_gaps": ("non_gap_id", {"non_gap_id", "summary", "evidence_ids"}),
        "unknowns": ("unknown_id", {"unknown_id", "summary", "why_unresolved_within_capsule", "evidence_ids"}),
    }
    for key, (id_key, key_set) in semantic_specs.items():
        rows = result.get(key, []) if isinstance(result.get(key), list) else []
        local_ids = []
        for item in rows:
            if not isinstance(item, dict) or set(item) != key_set:
                errors.append(f"{key} item key mismatch")
                continue
            local_ids.append(item.get(id_key))
            refs = item.get("evidence_ids")
            if not isinstance(refs, list) or not refs or any(x not in id_set for x in refs):
                errors.append(f"{key} {item.get(id_key)} lacks defined exact evidence")
            if key == "candidate_findings" and item.get("severity") not in {"critical", "high", "medium", "low"}:
                errors.append(f"finding {item.get(id_key)} invalid severity")
        if None in local_ids or len(local_ids) != len(set(local_ids)):
            errors.append(f"{key} IDs missing or duplicated")

    scope = result.get("scope_compliance")
    legacy_allowed_declared = [assignment["capsule_ref"], assignment["source_excerpt_ref"]]
    protocol_allowed_declared = [PROTOCOL_REF, assignment["capsule_ref"], assignment["source_excerpt_ref"]]
    declared_files = scope.get("allowed_files_read") if isinstance(scope, dict) else None
    allowed_declared = protocol_allowed_declared if declared_files == protocol_allowed_declared else legacy_allowed_declared
    expected_scope = {
        "allowed_files_read": allowed_declared,
        "other_files_read": [],
        "prior_audits_read": False,
        "other_results_read": False,
        "unrelated_windows_read": False,
        "role_leakage": False,
    }
    if scope != expected_scope:
        errors.append("declared scope compliance mismatch")

    observed_tool_paths: set[str] = set()
    disallowed_tool_kinds = []
    for row in session_rows:
        if row.get("type") != "response_item" or row.get("payload", {}).get("type") != "custom_tool_call":
            continue
        payload = row.get("payload", {})
        observed_tool_paths.update(normalize_tool_paths(payload.get("input", "")))
        name = str(payload.get("name", ""))
        if "web" in name.lower() or "image" in name.lower() or "spawn_agent" in name.lower():
            disallowed_tool_kinds.append(name)
    allowed_paths = set(allowed_declared)
    extras = sorted(x for x in observed_tool_paths if x not in allowed_paths)
    if extras:
        errors.append(f"tool calls mention disallowed Plans paths: {extras}")
    if disallowed_tool_kinds:
        errors.append(f"disallowed tool kinds: {disallowed_tool_kinds}")

    assignment_tokens = sorted(set(re.findall(r"A004-\d{6}-[A-Z0-9_-]+", session_path.read_text())))
    if assignment_tokens != [assignment_id]:
        errors.append(f"session assignment scope mismatch: {assignment_tokens}")

    session_id = meta.get("id")
    dispatch_receipt_hash = None
    dispatch_receipt = None
    if dispatch_receipt_ref:
        dispatch_path = REPO / dispatch_receipt_ref
        expected_dispatch_dir = RUNNER / "dispatch_receipts"
        try:
            dispatch_path.resolve().relative_to(expected_dispatch_dir.resolve())
        except (ValueError, OSError):
            errors.append("dispatch receipt spills outside runner dispatch namespace")
        if not dispatch_path.is_file():
            errors.append("dispatch receipt missing")
        else:
            dispatch_receipt_hash = sha256_bytes(dispatch_path.read_bytes())
            dispatch_receipt = json.loads(dispatch_path.read_text())
            if dispatch_receipt.get("assignment_id") != assignment_id:
                errors.append("dispatch receipt assignment mismatch")
            if dispatch_receipt.get("agent_path") != agent_path:
                errors.append("dispatch receipt agent path mismatch")
            if attempt is None or dispatch_receipt.get("attempt") != attempt:
                errors.append("dispatch receipt attempt mismatch")
            try:
                dispatched_at = datetime.fromisoformat(dispatch_receipt["created_at"].replace("Z", "+00:00"))
                session_at = datetime.fromisoformat(meta["timestamp"].replace("Z", "+00:00"))
                if dispatched_at >= session_at:
                    errors.append("dispatch receipt was not created before native session launch")
            except Exception:
                errors.append("dispatch/session timestamp validation failed")
    elif attempt is not None and force_zero_credit_reason is None:
        errors.append("immutable prelaunch dispatch receipt missing")

    if force_zero_credit_reason:
        errors.append(f"forced_zero_credit:{force_zero_credit_reason}")

    if errors:
        suffix = f"__attempt-{attempt:04d}" if attempt is not None else ""
        raw_rel = f"Plans/.audits/{AUDIT_ID}/runners/runner-10/raw_results/failed_attempts/{assignment_id}{suffix}__{session_id}.json"
        validation_rel = f"Plans/.audits/{AUDIT_ID}/runners/runner-10/validation/failed_attempts/{assignment_id}{suffix}__{session_id}.json"
    else:
        if attempt is None:
            raw_rel = f"Plans/.audits/{AUDIT_ID}/runners/runner-10/raw_results/{assignment_id}.json"
            validation_rel = f"Plans/.audits/{AUDIT_ID}/runners/runner-10/validation/results/{assignment_id}.json"
        else:
            raw_rel = f"Plans/.audits/{AUDIT_ID}/runners/runner-10/raw_results/attempts/{assignment_id}__attempt-{attempt:04d}__{session_id}.json"
            validation_rel = f"Plans/.audits/{AUDIT_ID}/runners/runner-10/validation/results/{assignment_id}__attempt-{attempt:04d}__{session_id}.json"

    receipt = {
        "assignment_id": assignment_id,
        "attempt": attempt,
        "attempt_id": f"attempt-{attempt}" if attempt is not None else None,
        "agent_path": agent_path,
        "agent_instance_id": session_id,
        "agent_thread_id": session_id,
        "agent_nickname": meta.get("agent_nickname"),
        "session_ref": str(session_path),
        "session_created_at": meta.get("timestamp"),
        "completed_at": completed_at,
        "model": turn.get("model"),
        "reasoning_effort": turn.get("effort"),
        "result_ref": raw_rel,
        "result_sha256": sha256_bytes(raw.encode("utf-8")),
        "result_bytes": len(raw.encode("utf-8")),
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "dispatch_receipt_ref": dispatch_receipt_ref,
        "dispatch_receipt_sha256": dispatch_receipt_hash,
        "validation_passed": not errors,
        "errors": errors,
    }

    validation_path = REPO / validation_rel
    validation_path.parent.mkdir(parents=True, exist_ok=True)
    validation_path.write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n")
    raw_path = REPO / raw_rel
    raw_path.parent.mkdir(parents=True, exist_ok=True)
    raw_path.write_bytes(raw.encode("utf-8"))
    if errors:
        raise ValueError(json.dumps(receipt, sort_keys=True))
    return receipt


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--agent-path", required=True)
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--attempt", type=int)
    parser.add_argument("--dispatch-receipt")
    parser.add_argument("--force-zero-credit-reason")
    args = parser.parse_args()
    try:
        receipt = validate_and_write(
            args.agent_path,
            args.assignment_id,
            args.attempt,
            args.dispatch_receipt,
            args.force_zero_credit_reason,
        )
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(json.dumps(receipt, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
