#!/usr/bin/env python3
"""Mechanical dispatcher/recorder for audit-004 runner-01.

This script performs only schema, hash, range, identity, and lifecycle checks.
It never interprets or rewrites reviewer semantics.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


RUNNER_ROOT = Path(__file__).resolve().parent
AUDIT_ROOT = RUNNER_ROOT.parents[1]
REPO_ROOT = AUDIT_ROOT.parents[2]
ASSIGNMENT_FILE = AUDIT_ROOT / "assignments" / "runner-01.jsonl"
REGISTRY_FILE = RUNNER_ROOT / "fresh_agent_assignment_registry.jsonl"
RESULT_MANIFEST_FILE = RUNNER_ROOT / "result_manifest.jsonl"
FAILED_ATTEMPTS_FILE = RUNNER_ROOT / "failed_attempts.jsonl"
ATTEMPT_RECEIPTS_FILE = RUNNER_ROOT / "attempt_receipts.jsonl"
DISPATCH_RECEIPTS_FILE = RUNNER_ROOT / "dispatch_receipts.jsonl"
IDENTITY_RECEIPTS_FILE = RUNNER_ROOT / "native_identity_receipts.jsonl"
CHECKPOINT_FILE = RUNNER_ROOT / "CHECKPOINT.json"
CONFIG_FILE = RUNNER_ROOT / "RUNNER_CONFIG.json"
RAW_DIR = RUNNER_ROOT / "raw_results"
VALIDATION_DIR = RUNNER_ROOT / "validation"
PROMPT_DIR = RUNNER_ROOT / "dispatch_prompts"
AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
RUNNER_ID = "runner-01"
MODEL = "gpt-5.6-sol"
EFFORT = "ultra"


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists() or path.stat().st_size == 0:
        return []
    rows: list[dict[str, Any]] = []
    for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"invalid JSONL at {path}:{lineno}: {exc}") from exc
        if not isinstance(value, dict):
            raise SystemExit(f"non-object JSONL row at {path}:{lineno}")
        rows.append(value)
    return rows


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")
    temp.replace(path)


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    body = "".join(json.dumps(row, sort_keys=True, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows)
    temp.write_text(body, encoding="utf-8")
    temp.replace(path)


def assignments() -> list[dict[str, Any]]:
    return load_jsonl(ASSIGNMENT_FILE)


def attempt_token(record: dict[str, Any]) -> str | None:
    value = record.get("attempt_number", record.get("attempt_id"))
    if value is None:
        return None
    if isinstance(value, int):
        return str(value)
    text = str(value)
    match = re.search(r"attempt[-_]?(\d+)$", text, re.IGNORECASE)
    return str(int(match.group(1))) if match else text


def grouped_registry_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[tuple[Any, ...], dict[str, Any]] = {}
    for row in rows:
        key = (
            row.get("runner_id"),
            row.get("assignment_id"),
            attempt_token(row),
            row.get("agent_instance_id"),
            row.get("agent_thread_id"),
            row.get("agent_path"),
        )
        if key not in grouped:
            grouped[key] = dict(row)
        else:
            for name, value in row.items():
                if value is not None:
                    grouped[key][name] = value
    return list(grouped.values())


def assignment_map() -> dict[str, dict[str, Any]]:
    rows = assignments()
    mapping = {row["assignment_id"]: row for row in rows}
    if len(mapping) != len(rows):
        raise SystemExit("duplicate assignment_id in immutable packet")
    return mapping


def repo_path(ref: str) -> Path:
    candidate = (REPO_ROOT / ref).resolve()
    try:
        candidate.relative_to(REPO_ROOT.resolve())
    except ValueError as exc:
        raise SystemExit(f"reference escapes repository: {ref}") from exc
    return candidate


def capsule_for(row: dict[str, Any]) -> dict[str, Any]:
    capsule_path = repo_path(row["capsule_ref"])
    source_path = repo_path(row["source_excerpt_ref"])
    capsule_bytes = capsule_path.read_bytes()
    source_bytes = source_path.read_bytes()
    failures: list[str] = []
    if len(capsule_bytes) != row["capsule_bytes"]:
        failures.append("capsule_bytes_mismatch")
    if sha256_bytes(capsule_bytes) != row["capsule_sha256"]:
        failures.append("capsule_sha256_mismatch")
    if len(source_bytes) != row["source_excerpt_bytes"]:
        failures.append("source_excerpt_bytes_mismatch")
    if sha256_bytes(source_bytes) != row["source_excerpt_sha256"]:
        failures.append("source_excerpt_sha256_mismatch")
    if len(capsule_bytes) + len(source_bytes) != row["capsule_package_bytes"]:
        failures.append("capsule_package_bytes_mismatch")
    if failures:
        raise SystemExit(",".join(failures))
    capsule = json.loads(capsule_bytes)
    matches = {
        "assignment_id": row["assignment_id"],
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "role": row["role"],
        "role_key": row["role_key"],
        "window_id": row["window_id"],
        "doc_id": row["doc_id"],
        "document_path": row["document_path"],
        "core_range": row["core_range"],
        "source_sha256": row["source_sha256"],
        "source_excerpt_ref": row["source_excerpt_ref"],
        "source_excerpt_sha256": row["source_excerpt_sha256"],
    }
    for key, expected in matches.items():
        if capsule.get(key) != expected:
            raise SystemExit(f"capsule_field_mismatch:{key}")
    return capsule


def assert_packet() -> dict[str, Any]:
    rows = assignments()
    errors: list[str] = []
    if len(rows) != 212:
        errors.append(f"assignment_count:{len(rows)}")
    seen_ids: set[str] = set()
    seen_windows: set[str] = set()
    total_token_estimate = 0
    total_capsule_package_bytes = 0
    for row in rows:
        assignment_id = row.get("assignment_id")
        if assignment_id in seen_ids:
            errors.append(f"duplicate_assignment_id:{assignment_id}")
        seen_ids.add(assignment_id)
        window_id = row.get("window_id")
        if window_id in seen_windows:
            errors.append(f"duplicate_window_id:{window_id}")
        seen_windows.add(window_id)
        required = {
            "audit_id": AUDIT_ID,
            "runner_id": RUNNER_ID,
            "required_model": MODEL,
            "required_reasoning_effort": EFFORT,
            "prior_substantive_assignment_count": 0,
            "terminal_after_result": True,
            "followup_reuse_forbidden": True,
            "fresh_agent_required": True,
            "state": "ready_unassigned",
        }
        for key, expected in required.items():
            if row.get(key) != expected:
                errors.append(f"{assignment_id}:{key}")
        if row.get("capsule_package_bytes", 0) > 65536:
            errors.append(f"{assignment_id}:capsule_over_64KiB")
        try:
            capsule_for(row)
        except SystemExit as exc:
            errors.append(f"{assignment_id}:{exc}")
        total_token_estimate += int(row.get("token_estimate", 0))
        total_capsule_package_bytes += int(row.get("capsule_package_bytes", 0))
    result = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "validated_at": utc_now(),
        "assignment_count": len(rows),
        "assignment_packet_sha256": sha256_bytes(ASSIGNMENT_FILE.read_bytes()),
        "unique_assignment_ids": len(seen_ids),
        "unique_window_ids": len(seen_windows),
        "total_token_estimate": total_token_estimate,
        "total_capsule_package_bytes": total_capsule_package_bytes,
        "errors": errors,
        "status": "pass" if not errors else "fail",
    }
    write_json(VALIDATION_DIR / "RUNNER_PACKET_VALIDATION.json", result)
    if errors:
        raise SystemExit(json.dumps(result))
    return result


def prompt_text(row: dict[str, Any], agent_instance_id: str, agent_path: str) -> str:
    capsule = capsule_for(row)
    core = row["core_range"]
    role_instructions = capsule["role_instructions"]
    return f"""You are a fresh, terminal, read-only reviewer for exactly one blind audit assignment. Required runtime identity: native {MODEL} with reasoning_effort={EFFORT}. Perform no other task and spawn no agents.

Immutable assignment
- assignment_id: {row['assignment_id']}
- runner_id: {RUNNER_ID}
- role: {row['role']}
- window_id: {row['window_id']}
- doc_id: {row['doc_id']}
- document_path: {row['document_path']}
- core_range: [{core[0]},{core[1]}]
- source_sha256: {row['source_sha256']}
- capsule_ref: {row['capsule_ref']}
- capsule_sha256: {row['capsule_sha256']}
- source_excerpt_ref: {row['source_excerpt_ref']}
- source_excerpt_sha256: {row['source_excerpt_sha256']}
- capsule_package_bytes: {row['capsule_package_bytes']}
- agent_instance_id: {agent_instance_id}
- agent_path: {agent_path}

Scope firewall
Read the two files named by capsule_ref and source_excerpt_ref. You may additionally read only the assigned core/context line ranges from the canonical document_path to validate canonical 1-based evidence lines; do not read any other part of the underlying document. Do not read AGENTS.md, Plans/00-plans-index.md, any other capsule/window, any runner result, any audit 001-003 path, git history/status/diff, web sources, or unrelated repository files. Do not write or modify any file. Verify both capsule file hashes before review. The capsule plus the bounded canonical ranges is your entire evidence universe.

Fixed universal lens
Within only the assigned role and capsule, test correctness, completeness, internal consistency, implementability, verifiability, authority/consumer boundaries, states and transitions, failure/recovery behavior, permissions/security implications, GUI-visible truth, acceptance evidence, and consequential builder discretion. Do not import requirements from outside the capsule.

Role card
{role_instructions}

Identity receipt
Call the read-only get_goal({{}}) tool once if available solely to obtain this child thread's real threadId; do not create a Goal. Put the exact returned threadId in agent_thread_id, or null only if the API exposes none.

Output contract
Return exactly one valid JSON object and no markdown fences or prose outside it. Required top-level keys and values:
- assignment_id={row['assignment_id']}; runner_id={RUNNER_ID}; status=valid_result or infrastructure_error
- agent_instance_id={agent_instance_id}; agent_path={agent_path}; agent_thread_id=<real child thread UUID or null if unavailable>
- model={MODEL}; reasoning_effort={EFFORT}; role={row['role']}; window_id={row['window_id']}; doc_id={row['doc_id']}; document_path={row['document_path']}; core_range=[{core[0]},{core[1]}]
- observations: array of objects with observation_id, statement, evidence_ref_ids
- candidate_findings: array of objects with finding_id, severity (critical|high|medium|low), gap_type, statement, why_consequential, evidence_ref_ids
- explicit_non_gaps: array of objects with non_gap_id, statement, evidence_ref_ids
- unknowns: array of objects with unknown_id, statement, evidence_ref_ids
- exact_evidence_refs: array of objects with evidence_id, document_path, line_start, line_end, quote
- scope_confirmation={{"capsule_only":true,"prior_audits_used":false,"other_results_used":false,"unrelated_windows_used":false}}
- terminal_after_result=true
Every substantive item must cite at least one evidence_ref_id. Every evidence ref must name the assigned document_path, use canonical 1-based line_start/line_end fully inside one assigned core/context range, and contain an exact quote occurring within those canonical source lines. Do not derive line numbers from source-excerpt header lines. Return at least one exact evidence reference for valid_result. Arrays may otherwise be empty when justified by the capsule. On any hash mismatch, use status=infrastructure_error and describe it only in unknowns. After returning this object, you are terminal and must perform no further work."""


def update_checkpoint(wave: int | None = None, state: str | None = None) -> dict[str, Any]:
    registry_rows = load_jsonl(REGISTRY_FILE)
    registry = grouped_registry_rows(registry_rows)
    identities = [row.get("agent_instance_id") for row in registry]
    paths = [row.get("agent_path") for row in registry]
    thread_ids = [row.get("agent_thread_id") for row in registry if row.get("agent_thread_id")]
    valid_rows = [row for row in registry if row.get("state") == "valid_result"]
    failed_rows = load_jsonl(FAILED_ATTEMPTS_FILE) + load_jsonl(RUNNER_ROOT / "ingest_errors.jsonl")
    active_rows = [row for row in registry if row.get("state") == "dispatched"]
    config = read_json(CONFIG_FILE)
    created = dt.datetime.fromisoformat(config["created_at"].replace("Z", "+00:00"))
    now = dt.datetime.now(dt.timezone.utc)
    existing = read_json(CHECKPOINT_FILE) if CHECKPOINT_FILE.exists() else {}
    checkpoint = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "state": state or existing.get("state", "running"),
        "wave": wave if wave is not None else existing.get("wave", 0),
        "assignment_count": len(assignments()),
        "dispatch_records": len(registry_rows),
        "dispatch_attempts": len(registry),
        "valid_assignments": len({row["assignment_id"] for row in valid_rows}),
        "failed_attempts": len(failed_rows),
        "active_agents": len(active_rows),
        "unique_agent_instances": len(set(identities)),
        "duplicate_agent_instances": len(identities) - len(set(identities)),
        "duplicate_agent_paths": len(paths) - len(set(paths)),
        "duplicate_agent_thread_ids": len(thread_ids) - len(set(thread_ids)),
        "reused_agent_instances": sum(1 for identity in set(identities) if identities.count(identity) > 1),
        "multi_scope_agent_instances": sum(
            1
            for identity in set(identities)
            if len({row["assignment_id"] for row in registry if row.get("agent_instance_id") == identity}) > 1
        ),
        "valid_token_estimate": sum(int(row.get("token_estimate", 0)) for row in valid_rows),
        "valid_capsule_package_bytes": sum(int(row.get("capsule_package_bytes", 0)) for row in valid_rows),
        "attempted_token_estimate": sum(int(row.get("token_estimate", 0)) for row in registry),
        "attempted_capsule_package_bytes": sum(int(row.get("capsule_package_bytes", 0)) for row in registry),
        "elapsed_seconds": int((now - created).total_seconds()),
        "updated_at": utc_now(),
    }
    write_json(CHECKPOINT_FILE, checkpoint)
    return checkpoint


def command_prompt(args: argparse.Namespace) -> None:
    row = assignment_map().get(args.assignment_id)
    if row is None:
        raise SystemExit("unknown assignment_id")
    prompt = prompt_text(row, args.agent_instance_id, args.agent_path)
    PROMPT_DIR.mkdir(parents=True, exist_ok=True)
    prompt_ref = PROMPT_DIR / f"{row['assignment_id']}__{args.agent_instance_id}.txt"
    prompt_ref.write_text(prompt, encoding="utf-8")
    print(prompt)


def command_dispatch(args: argparse.Namespace) -> None:
    mapping = assignment_map()
    row = mapping.get(args.assignment_id)
    if row is None:
        raise SystemExit("unknown assignment_id")
    capsule = capsule_for(row)
    registry = load_jsonl(REGISTRY_FILE)
    if any(r.get("state") == "dispatched" and r.get("assignment_id") == args.assignment_id for r in registry):
        raise SystemExit("assignment already has active attempt")
    if any(r.get("state") == "valid_result" and r.get("assignment_id") == args.assignment_id for r in registry):
        raise SystemExit("assignment already has valid result")
    for field, value in (
        ("agent_instance_id", args.agent_instance_id),
        ("agent_path", args.agent_path),
    ):
        if any(r.get(field) == value for r in registry):
            raise SystemExit(f"duplicate {field}")
    if args.agent_thread_id and any(r.get("agent_thread_id") == args.agent_thread_id for r in registry):
        raise SystemExit("duplicate agent_thread_id")
    attempt_number = 1 + sum(1 for r in registry if r.get("assignment_id") == args.assignment_id)
    attempt_id = f"{args.assignment_id}__attempt-{attempt_number:02d}"
    prompt_path = PROMPT_DIR / f"{row['assignment_id']}__{args.agent_instance_id}.txt"
    prompt_hash = sha256_bytes(prompt_path.read_bytes()) if prompt_path.exists() else None
    record = {
        "attempt_id": attempt_id,
        "attempt_number": attempt_number,
        "assignment_id": row["assignment_id"],
        "assignment_seq": row["assignment_seq"],
        "runner_id": RUNNER_ID,
        "runner_thread_id": row["runner_thread_id"],
        "agent_instance_id": args.agent_instance_id,
        "agent_path": args.agent_path,
        "agent_thread_id": args.agent_thread_id,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "role": row["role"],
        "role_key": row["role_key"],
        "window_id": row["window_id"],
        "doc_id": row["doc_id"],
        "document_path": row["document_path"],
        "core_range": row["core_range"],
        "overlap_ranges": capsule["context_ranges"],
        "source_hash": row["source_sha256"],
        "core_sha256": row["core_sha256"],
        "capsule_ref": row["capsule_ref"],
        "capsule_hash": row["capsule_sha256"],
        "capsule_bytes": row["capsule_bytes"],
        "capsule_package_bytes": row["capsule_package_bytes"],
        "source_excerpt_ref": row["source_excerpt_ref"],
        "source_excerpt_hash": row["source_excerpt_sha256"],
        "source_excerpt_bytes": row["source_excerpt_bytes"],
        "token_estimate": row["token_estimate"],
        "prompt_ref": str(prompt_path.relative_to(REPO_ROOT)) if prompt_path.exists() else None,
        "prompt_sha256": prompt_hash,
        "created_at": args.created_at or utc_now(),
        "completed_at": None,
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "result_ref": None,
        "result_hash": None,
        "no_followup_reuse": True,
        "coverage_credit": 0,
        "state": "dispatched",
        "wave": args.wave,
    }
    registry.append(record)
    write_jsonl(REGISTRY_FILE, registry)
    update_checkpoint(wave=args.wave, state="running")
    print(json.dumps(record, sort_keys=True))


def command_prepare_dispatch(args: argparse.Namespace) -> None:
    row = assignment_map().get(args.assignment_id)
    if row is None:
        raise SystemExit("unknown assignment_id")
    capsule = capsule_for(row)
    registry_rows = load_jsonl(REGISTRY_FILE)
    registry = grouped_registry_rows(registry_rows)
    prepared = load_jsonl(DISPATCH_RECEIPTS_FILE)
    identities = [*registry_rows, *prepared]
    for field, value in (("agent_instance_id", args.agent_instance_id), ("agent_path", args.agent_path)):
        if any(item.get(field) == value for item in identities):
            raise SystemExit(f"duplicate {field}")
    active = [
        item for item in registry
        if item.get("assignment_id") == args.assignment_id and item.get("state") == "dispatched"
    ]
    if active:
        raise SystemExit("assignment already has an active native attempt")
    failed = load_jsonl(FAILED_ATTEMPTS_FILE) + load_jsonl(RUNNER_ROOT / "ingest_errors.jsonl")
    completed_for_assignment = [
        item for item in registry
        if item.get("assignment_id") == args.assignment_id and item.get("result_ref")
    ]
    if completed_for_assignment and not any(item.get("assignment_id") == args.assignment_id for item in failed):
        raise SystemExit("assignment already has an unrevoked completed result")
    prior_attempts = {
        int(token)
        for item in [*registry_rows, *prepared]
        if item.get("assignment_id") == args.assignment_id
        for token in [attempt_token(item)]
        if token is not None and token.isdigit()
    }
    attempt_number = max(prior_attempts, default=0) + 1
    attempt_id = f"{args.assignment_id}__attempt-{attempt_number:02d}"
    prompt_path = PROMPT_DIR / f"{row['assignment_id']}__{args.agent_instance_id}.txt"
    if not prompt_path.exists():
        raise SystemExit("immutable dispatch prompt missing")
    receipt = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "runner_thread_id": row["runner_thread_id"],
        "assignment_id": row["assignment_id"],
        "assignment_seq": row["assignment_seq"],
        "attempt_id": attempt_id,
        "attempt_number": attempt_number,
        "agent_instance_id": args.agent_instance_id,
        "agent_path": args.agent_path,
        "agent_thread_id": None,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "role": row["role"],
        "role_key": row["role_key"],
        "window_id": row["window_id"],
        "doc_id": row["doc_id"],
        "document_path": row["document_path"],
        "core_range": row["core_range"],
        "overlap_ranges": capsule["context_ranges"],
        "source_hash": row["source_sha256"],
        "core_sha256": row["core_sha256"],
        "capsule_ref": row["capsule_ref"],
        "capsule_hash": row["capsule_sha256"],
        "capsule_bytes": row["capsule_bytes"],
        "capsule_package_bytes": row["capsule_package_bytes"],
        "source_excerpt_ref": row["source_excerpt_ref"],
        "source_excerpt_hash": row["source_excerpt_sha256"],
        "source_excerpt_bytes": row["source_excerpt_bytes"],
        "token_estimate": row["token_estimate"],
        "prompt_ref": str(prompt_path.relative_to(REPO_ROOT)),
        "prompt_sha256": sha256_bytes(prompt_path.read_bytes()),
        "dispatch_prepared_at": utc_now(),
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "fork_turns": "none",
        "dispatch_state": "prepared_before_launch",
        "coverage_credit": 0,
        "immutable": True,
        "wave": args.wave,
    }
    prepared.append(receipt)
    write_jsonl(DISPATCH_RECEIPTS_FILE, prepared)
    print(json.dumps(receipt, sort_keys=True))


def allowed_line(line: int, capsule: dict[str, Any]) -> bool:
    ranges = [capsule["core_range"], *capsule["context_ranges"]]
    return any(start <= line <= end for start, end in ranges)


def normalized(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def validate_result(data: bytes, row: dict[str, Any], record: dict[str, Any]) -> tuple[dict[str, Any] | None, list[str]]:
    errors: list[str] = []
    try:
        value = json.loads(data.decode("utf-8"))
    except Exception as exc:  # exact parser failure is recorded, never repaired
        return None, [f"json_parse_error:{type(exc).__name__}"]
    if not isinstance(value, dict):
        return None, ["result_not_object"]
    expected = {
        "assignment_id": row["assignment_id"],
        "runner_id": RUNNER_ID,
        "status": "valid_result",
        "agent_instance_id": record["agent_instance_id"],
        "agent_path": record["agent_path"],
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "role": row["role"],
        "window_id": row["window_id"],
        "doc_id": row["doc_id"],
        "document_path": row["document_path"],
        "core_range": row["core_range"],
        "terminal_after_result": True,
    }
    for key, expected_value in expected.items():
        if value.get(key) != expected_value:
            errors.append(f"field_mismatch:{key}")
    agent_thread_id = value.get("agent_thread_id")
    if agent_thread_id is not None and (
        not isinstance(agent_thread_id, str) or not re.fullmatch(r"[0-9a-fA-F-]{16,}", agent_thread_id)
    ):
        errors.append("invalid_reported_agent_thread_id")
    scope = value.get("scope_confirmation")
    if scope != {
        "capsule_only": True,
        "prior_audits_used": False,
        "other_results_used": False,
        "unrelated_windows_used": False,
    }:
        errors.append("scope_confirmation_mismatch")
    arrays = ["observations", "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs"]
    for key in arrays:
        if not isinstance(value.get(key), list):
            errors.append(f"not_array:{key}")
    if errors and any(error.startswith("not_array:") for error in errors):
        return value, errors
    evidence = value.get("exact_evidence_refs", [])
    if not evidence:
        errors.append("missing_exact_evidence")
    evidence_ids: set[str] = set()
    capsule = capsule_for(row)
    source_lines = repo_path(row["document_path"]).read_text(encoding="utf-8").splitlines()
    for idx, item in enumerate(evidence):
        if not isinstance(item, dict):
            errors.append(f"evidence_not_object:{idx}")
            continue
        evidence_id = item.get("evidence_id")
        if not isinstance(evidence_id, str) or not evidence_id:
            errors.append(f"evidence_id_invalid:{idx}")
        elif evidence_id in evidence_ids:
            errors.append(f"evidence_id_duplicate:{evidence_id}")
        else:
            evidence_ids.add(evidence_id)
        if item.get("document_path") != row["document_path"]:
            errors.append(f"evidence_path_scope_spill:{idx}")
        start = item.get("line_start")
        end = item.get("line_end")
        if not isinstance(start, int) or not isinstance(end, int) or start > end:
            errors.append(f"evidence_range_invalid:{idx}")
        elif not any(start >= low and end <= high for low, high in [capsule["core_range"], *capsule["context_ranges"]]):
            errors.append(f"evidence_range_scope_spill:{idx}")
        quote = item.get("quote")
        if not isinstance(quote, str) or not quote.strip():
            errors.append(f"evidence_quote_missing:{idx}")
        elif isinstance(start, int) and isinstance(end, int) and 1 <= start <= end <= len(source_lines):
            canonical_text = normalized("\n".join(source_lines[start - 1 : end]))
            if normalized(quote) not in canonical_text:
                errors.append(f"evidence_quote_not_in_canonical_lines:{idx}")
        else:
            errors.append(f"evidence_range_outside_canonical_source:{idx}")
    item_specs = {
        "observations": ("observation_id", "statement"),
        "candidate_findings": ("finding_id", "statement", "why_consequential", "gap_type", "severity"),
        "explicit_non_gaps": ("non_gap_id", "statement"),
        "unknowns": ("unknown_id", "statement"),
    }
    for array_name, required_fields in item_specs.items():
        for idx, item in enumerate(value.get(array_name, [])):
            if not isinstance(item, dict):
                errors.append(f"item_not_object:{array_name}:{idx}")
                continue
            for field in required_fields:
                if not isinstance(item.get(field), str) or not item[field].strip():
                    errors.append(f"item_field_missing:{array_name}:{idx}:{field}")
            refs = item.get("evidence_ref_ids")
            if not isinstance(refs, list) or not refs:
                errors.append(f"item_evidence_missing:{array_name}:{idx}")
            elif any(ref not in evidence_ids for ref in refs):
                errors.append(f"item_evidence_unknown:{array_name}:{idx}")
    if any(key.lower().startswith("adversarial") for key in value):
        errors.append("role_leak_adversarial_key")
    return value, sorted(set(errors))


def command_result(args: argparse.Namespace) -> None:
    mapping = assignment_map()
    row = mapping.get(args.assignment_id)
    if row is None:
        raise SystemExit("unknown assignment_id")
    registry = load_jsonl(REGISTRY_FILE)
    matches = [
        r for r in registry
        if r.get("assignment_id") == args.assignment_id
        and r.get("state") == "dispatched"
        and r.get("agent_instance_id") == args.agent_instance_id
        and r.get("agent_path") == args.agent_path
    ]
    if len(matches) != 1:
        raise SystemExit(f"expected exactly one active attempt, found {len(matches)}")
    record = matches[0]
    raw = sys.stdin.buffer.read()
    if not raw:
        raise SystemExit("empty result input")
    raw_ref = RAW_DIR / f"{record['attempt_id']}.json"
    raw_ref.parent.mkdir(parents=True, exist_ok=True)
    if raw_ref.exists():
        raise SystemExit("immutable raw result path already exists")
    raw_ref.write_bytes(raw)
    value, errors = validate_result(raw, row, record)
    completed_at = args.completed_at or utc_now()
    result_hash = sha256_bytes(raw)
    validation_ref = VALIDATION_DIR / f"{record['attempt_id']}.json"
    if validation_ref.exists():
        raise SystemExit("immutable validation receipt path already exists")
    valid = not errors
    validation = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "attempt_id": record["attempt_id"],
        "assignment_id": args.assignment_id,
        "validated_at": utc_now(),
        "result_ref": str(raw_ref.relative_to(REPO_ROOT)),
        "result_sha256": result_hash,
        "result_bytes": len(raw),
        "checks": {
            "json_schema_shape": "pass" if not any("json_" in e or "not_" in e or "item_" in e for e in errors) else "fail",
            "identity_model_effort": "pass" if not any("field_mismatch" in e or "agent_thread" in e for e in errors) else "fail",
            "exact_evidence": "pass" if not any("evidence" in e for e in errors) else "fail",
            "capsule_scope": "pass" if not any("scope" in e or "role_leak" in e for e in errors) else "fail",
            "terminal_lifecycle": "pass" if "field_mismatch:terminal_after_result" not in errors else "fail",
        },
        "errors": errors,
        "validation_passed": valid,
        "status": "pass" if valid else "fail",
    }
    write_json(validation_ref, validation)
    completion = dict(record)
    completion["completed_at"] = completed_at
    completion["result_ref"] = str(raw_ref.relative_to(REPO_ROOT))
    completion["result_hash"] = result_hash
    completion["result_sha256"] = result_hash
    completion["result_bytes"] = len(raw)
    completion["validation_ref"] = str(validation_ref.relative_to(REPO_ROOT))
    completion["validation_sha256"] = sha256_bytes(validation_ref.read_bytes())
    completion["validation_passed"] = valid
    completion["terminal_after_result"] = True
    completion["coverage_credit"] = 1 if valid else 0
    completion["zero_coverage"] = not valid
    completion["state"] = "valid_result" if valid else "failed_attempt_zero_coverage"
    completion["validation_errors"] = errors
    completion["receipt_kind"] = "completed_attempt"
    registry.append(completion)
    write_jsonl(REGISTRY_FILE, registry)
    manifest = load_jsonl(RESULT_MANIFEST_FILE)
    manifest.append({
        "attempt_id": completion["attempt_id"],
        "attempt_number": completion["attempt_number"],
        "assignment_id": args.assignment_id,
        "runner_id": RUNNER_ID,
        "agent_instance_id": completion["agent_instance_id"],
        "agent_path": completion["agent_path"],
        "agent_thread_id": completion.get("agent_thread_id"),
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "role": row["role"],
        "window_id": row["window_id"],
        "result_ref": completion["result_ref"],
        "result_hash": result_hash,
        "result_sha256": result_hash,
        "result_bytes": len(raw),
        "completed_at": completed_at,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "valid": valid,
        "validation_passed": valid,
        "validation_status": "passed" if valid else "failed",
        "coverage_credit": 1 if valid else 0,
        "validation_ref": completion["validation_ref"],
        "validation_sha256": completion["validation_sha256"],
        "validation_errors": errors,
    })
    write_jsonl(RESULT_MANIFEST_FILE, manifest)
    attempts = load_jsonl(ATTEMPT_RECEIPTS_FILE)
    attempts.append({
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "attempt_id": completion["attempt_id"],
        "attempt_number": completion["attempt_number"],
        "assignment_id": completion["assignment_id"],
        "agent_instance_id": completion["agent_instance_id"],
        "agent_path": completion["agent_path"],
        "agent_thread_id": completion.get("agent_thread_id"),
        "completed_at": completed_at,
        "result_ref": completion["result_ref"],
        "result_sha256": result_hash,
        "validation_ref": completion["validation_ref"],
        "validation_sha256": completion["validation_sha256"],
        "validation_passed": valid,
        "coverage_credit": 1 if valid else 0,
        "status": "completed_valid" if valid else "failed_attempt_zero_coverage",
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "immutable": True,
    })
    write_jsonl(ATTEMPT_RECEIPTS_FILE, attempts)
    if not valid:
        failures = load_jsonl(FAILED_ATTEMPTS_FILE)
        failures.append({
            "audit_id": AUDIT_ID,
            "runner_id": RUNNER_ID,
            "attempt_id": completion["attempt_id"],
            "attempt_number": completion["attempt_number"],
            "assignment_id": completion["assignment_id"],
            "agent_instance_id": completion["agent_instance_id"],
            "agent_path": completion["agent_path"],
            "agent_thread_id": completion.get("agent_thread_id"),
            "completed_at": completed_at,
            "result_ref": completion["result_ref"],
            "result_sha256": result_hash,
            "validation_ref": completion["validation_ref"],
            "validation_sha256": completion["validation_sha256"],
            "validation_passed": False,
            "validation_errors": errors,
            "coverage_credit": 0,
            "status": "failed_attempt_zero_coverage",
            "terminal_after_result": True,
            "no_followup_reuse": True,
            "immutable": True,
        })
        write_jsonl(FAILED_ATTEMPTS_FILE, failures)
    checkpoint = update_checkpoint(wave=completion["wave"], state="running")
    print(json.dumps({"valid": valid, "errors": errors, "checkpoint": checkpoint}, sort_keys=True))


def command_checkpoint(args: argparse.Namespace) -> None:
    print(json.dumps(update_checkpoint(wave=args.wave, state=args.state), sort_keys=True))


def command_receipt(args: argparse.Namespace) -> None:
    registry = load_jsonl(REGISTRY_FILE)
    matches = [
        record
        for record in registry
        if record.get("assignment_id") == args.assignment_id
        and record.get("agent_instance_id") == args.agent_instance_id
        and record.get("agent_path") == args.agent_path
        and record.get("state") == "dispatched"
    ]
    if len(matches) != 1:
        raise SystemExit(f"expected one active dispatch receipt target, found {len(matches)}")
    if any(
        record.get("agent_thread_id") == args.agent_thread_id and record is not matches[0]
        for record in registry
    ):
        raise SystemExit("duplicate agent_thread_id")
    record = matches[0]
    if args.actual_model != MODEL or args.actual_reasoning_effort != EFFORT:
        raise SystemExit("session receipt model/effort mismatch")
    record["agent_thread_id"] = args.agent_thread_id
    record["created_at"] = args.created_at
    record["actual_model"] = args.actual_model
    record["actual_reasoning_effort"] = args.actual_reasoning_effort
    record["agent_thread_id_source"] = "native_session_meta"
    record["session_receipt_validated"] = True
    write_jsonl(REGISTRY_FILE, registry)
    update_checkpoint(wave=record["wave"], state="running")
    print(json.dumps(record, sort_keys=True))


def command_repair_capture(args: argparse.Namespace) -> None:
    registry = load_jsonl(REGISTRY_FILE)
    matches = [
        record
        for record in registry
        if record.get("assignment_id") == args.assignment_id
        and record.get("agent_instance_id") == args.agent_instance_id
        and record.get("state") == "failed_attempt"
        and record.get("validation_errors") == ["json_parse_error:JSONDecodeError"]
    ]
    if len(matches) != 1:
        raise SystemExit(f"expected one JSON capture failure, found {len(matches)}")
    record = matches[0]
    raw_path = repo_path(record["result_ref"])
    validation_path = repo_path(record["validation_ref"])
    capture_raw_path = raw_path.with_suffix(".capture_error.txt")
    capture_validation_path = validation_path.with_suffix(".capture_error.json")
    raw_path.replace(capture_raw_path)
    validation_path.replace(capture_validation_path)
    ingest_errors_file = RUNNER_ROOT / "ingest_errors.jsonl"
    ingest_errors = load_jsonl(ingest_errors_file)
    ingest_errors.append({
        "attempt_id": record["attempt_id"],
        "assignment_id": record["assignment_id"],
        "agent_instance_id": record["agent_instance_id"],
        "agent_thread_id": record.get("agent_thread_id"),
        "error_kind": "recorder_concatenated_progress_and_terminal_messages",
        "coverage_credit": 0,
        "bad_capture_ref": str(capture_raw_path.relative_to(REPO_ROOT)),
        "bad_capture_sha256": record["result_hash"],
        "bad_capture_validation_ref": str(capture_validation_path.relative_to(REPO_ROOT)),
        "recorded_at": utc_now(),
    })
    write_jsonl(ingest_errors_file, ingest_errors)
    manifest = [
        row
        for row in load_jsonl(RESULT_MANIFEST_FILE)
        if not (
            row.get("attempt_id") == record["attempt_id"]
            and row.get("valid") is False
            and row.get("result_hash") == record["result_hash"]
        )
    ]
    write_jsonl(RESULT_MANIFEST_FILE, manifest)
    for key in (
        "result_ref", "result_hash", "result_bytes", "validation_ref",
        "completed_at", "validation_errors", "zero_coverage"
    ):
        record[key] = None
    record["coverage_credit"] = 0
    record["state"] = "dispatched"
    record["capture_error_count"] = int(record.get("capture_error_count", 0)) + 1
    write_jsonl(REGISTRY_FILE, registry)
    update_checkpoint(wave=record["wave"], state="running")
    print(json.dumps(record, sort_keys=True))


def command_quarantine_attempt(args: argparse.Namespace) -> None:
    registry = load_jsonl(REGISTRY_FILE)
    candidates = [
        record
        for record in registry
        if record.get("assignment_id") == args.assignment_id
        and attempt_token(record) == str(args.attempt)
        and record.get("result_ref")
        and record.get("result_hash")
    ]
    if not candidates:
        raise SystemExit("completed attempt receipt not found")
    record = candidates[-1]
    failures = load_jsonl(FAILED_ATTEMPTS_FILE)
    if any(
        row.get("assignment_id") == args.assignment_id
        and attempt_token(row) == str(args.attempt)
        and row.get("agent_instance_id") == record.get("agent_instance_id")
        for row in failures
    ):
        raise SystemExit("immutable failed-attempt receipt already exists")
    raw_path = repo_path(record["result_ref"])
    if not raw_path.exists() or sha256_bytes(raw_path.read_bytes()) != record["result_hash"]:
        raise SystemExit("completed attempt raw result/hash mismatch")
    quarantine_receipt = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "assignment_id": args.assignment_id,
        "attempt_id": record["attempt_id"],
        "attempt_number": record["attempt_number"],
        "agent_instance_id": record["agent_instance_id"],
        "agent_path": record["agent_path"],
        "agent_thread_id": record.get("agent_thread_id"),
        "model": record["model"],
        "reasoning_effort": record["reasoning_effort"],
        "status": "failed_attempt_zero_coverage",
        "validation_passed": False,
        "coverage_credit": 0,
        "failure_kind": args.failure_kind,
        "failure_detail": args.failure_detail,
        "result_ref": record["result_ref"],
        "result_sha256": record["result_hash"],
        "result_bytes": record.get("result_bytes"),
        "completed_at": record.get("completed_at"),
        "quarantined_at": utc_now(),
        "source_validator_ref": args.source_validator_ref,
        "source_validator_sha256": args.source_validator_sha256,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "immutable": True,
    }
    receipt_ref = VALIDATION_DIR / f"{record['attempt_id']}.frozen-v2-quarantine.json"
    write_json(receipt_ref, quarantine_receipt)
    failure_row = dict(quarantine_receipt)
    failure_row["quarantine_receipt_ref"] = str(receipt_ref.relative_to(REPO_ROOT))
    failure_row["quarantine_receipt_sha256"] = sha256_bytes(receipt_ref.read_bytes())
    failures.append(failure_row)
    write_jsonl(FAILED_ATTEMPTS_FILE, failures)
    print(json.dumps(failure_row, sort_keys=True))


def native_session_info(agent_path: str) -> tuple[dict[str, Any], bytes]:
    session_root = Path.home() / ".codex" / "sessions"
    candidates = sorted(session_root.rglob("rollout-*.jsonl"), key=lambda path: path.stat().st_mtime, reverse=True)
    for path in candidates:
        try:
            first_line = path.open("r", encoding="utf-8").readline()
            session_meta = json.loads(first_line)
        except Exception:
            continue
        if not isinstance(session_meta, dict) or session_meta.get("type") != "session_meta":
            continue
        payload = session_meta.get("payload")
        if not isinstance(payload, dict):
            continue
        source = payload.get("source")
        if not isinstance(source, dict):
            continue
        subagent = source.get("subagent")
        if not isinstance(subagent, dict):
            continue
        spawn = subagent.get("thread_spawn")
        if not isinstance(spawn, dict):
            continue
        if spawn.get("agent_path") != agent_path:
            continue
        if spawn.get("parent_thread_id") != read_json(CONFIG_FILE)["runner_thread_id"]:
            continue
        entries: list[dict[str, Any]] = []
        for line in path.read_text(encoding="utf-8").splitlines():
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue
        turns = [entry for entry in entries if entry.get("type") == "turn_context"]
        if not turns:
            raise SystemExit(f"native session has no turn_context: {agent_path}")
        turn = turns[0]["payload"]
        messages: list[tuple[str, str]] = []
        for entry in entries:
            payload = entry.get("payload", {})
            if entry.get("type") != "response_item" or payload.get("type") != "message" or payload.get("role") != "assistant":
                continue
            for content in payload.get("content", []):
                if content.get("type") == "output_text" and isinstance(content.get("text"), str):
                    messages.append((entry.get("timestamp"), content["text"]))
        completed = [
            entry.get("timestamp")
            for entry in entries
            if entry.get("type") == "event_msg" and entry.get("payload", {}).get("type") == "task_complete"
        ]
        info = {
            "agent_path": agent_path,
            "agent_thread_id": session_meta["payload"]["id"],
            "parent_thread_id": spawn["parent_thread_id"],
            "created_at": session_meta["payload"]["timestamp"],
            "actual_model": turn.get("model"),
            "actual_reasoning_effort": turn.get("effort"),
            "assistant_message_count": len(messages),
            "terminal_message_at": messages[-1][0] if messages else None,
            "completed_at": completed[-1] if completed else None,
            "terminal": bool(completed),
        }
        terminal_bytes = messages[-1][1].encode("utf-8") if messages else b""
        return info, terminal_bytes
    raise SystemExit(f"native collaboration session not found for {agent_path}")


def command_session_info(args: argparse.Namespace) -> None:
    info, _ = native_session_info(args.agent_path)
    print(json.dumps(info, sort_keys=True))


def command_register_session_dispatch(args: argparse.Namespace) -> None:
    info, _ = native_session_info(args.agent_path)
    if info["actual_model"] != MODEL or info["actual_reasoning_effort"] != EFFORT:
        raise SystemExit("native session model/effort mismatch")
    command_dispatch(argparse.Namespace(
        assignment_id=args.assignment_id,
        agent_instance_id=args.agent_instance_id,
        agent_path=args.agent_path,
        agent_thread_id=None,
        created_at=info["created_at"],
        wave=args.wave,
    ))
    command_receipt(argparse.Namespace(
        assignment_id=args.assignment_id,
        agent_instance_id=args.agent_instance_id,
        agent_path=args.agent_path,
        agent_thread_id=info["agent_thread_id"],
        created_at=info["created_at"],
        actual_model=info["actual_model"],
        actual_reasoning_effort=info["actual_reasoning_effort"],
    ))


def command_register_prepared_native(args: argparse.Namespace) -> None:
    prepared = load_jsonl(DISPATCH_RECEIPTS_FILE)
    matches = [
        item for item in prepared
        if item.get("assignment_id") == args.assignment_id
        and item.get("agent_instance_id") == args.agent_instance_id
        and item.get("agent_path") == args.agent_path
    ]
    if len(matches) != 1:
        raise SystemExit(f"expected one immutable prelaunch dispatch receipt, found {len(matches)}")
    prelaunch = matches[0]
    registry = load_jsonl(REGISTRY_FILE)
    if any(item.get("agent_instance_id") == args.agent_instance_id for item in registry):
        raise SystemExit("native dispatch registry receipt already exists")
    info, _ = native_session_info(args.agent_path)
    if info["actual_model"] != MODEL or info["actual_reasoning_effort"] != EFFORT:
        raise SystemExit("native session model/effort mismatch")
    if any(item.get("agent_thread_id") == info["agent_thread_id"] for item in registry):
        raise SystemExit("duplicate native agent_thread_id")
    record = dict(prelaunch)
    record.update({
        "agent_thread_id": info["agent_thread_id"],
        "created_at": info["created_at"],
        "actual_model": info["actual_model"],
        "actual_reasoning_effort": info["actual_reasoning_effort"],
        "agent_thread_id_source": "native_session_meta",
        "session_receipt_validated": True,
        "completed_at": None,
        "result_ref": None,
        "result_hash": None,
        "state": "dispatched",
        "receipt_kind": "native_dispatch",
    })
    registry.append(record)
    write_jsonl(REGISTRY_FILE, registry)
    identities = load_jsonl(IDENTITY_RECEIPTS_FILE)
    identity_receipt = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "assignment_id": args.assignment_id,
        "attempt_id": record["attempt_id"],
        "attempt_number": record["attempt_number"],
        "agent_instance_id": args.agent_instance_id,
        "agent_path": args.agent_path,
        "agent_thread_id": info["agent_thread_id"],
        "parent_thread_id": info["parent_thread_id"],
        "created_at": info["created_at"],
        "model": info["actual_model"],
        "reasoning_effort": info["actual_reasoning_effort"],
        "prompt_ref": record["prompt_ref"],
        "prompt_sha256": record["prompt_sha256"],
        "prior_substantive_assignment_count": 0,
        "immutable": True,
    }
    identities.append(identity_receipt)
    write_jsonl(IDENTITY_RECEIPTS_FILE, identities)
    update_checkpoint(wave=record["wave"], state="running")
    print(json.dumps(identity_receipt, sort_keys=True))


def command_ingest_terminal(args: argparse.Namespace) -> None:
    info, terminal_bytes = native_session_info(args.agent_path)
    if not info["terminal"]:
        raise SystemExit("native agent is not terminal")
    if not terminal_bytes:
        raise SystemExit("native agent has no terminal assistant result")
    registry = load_jsonl(REGISTRY_FILE)
    matches = [
        record
        for record in registry
        if record.get("assignment_id") == args.assignment_id
        and record.get("agent_instance_id") == args.agent_instance_id
        and record.get("agent_path") == args.agent_path
        and record.get("state") == "dispatched"
    ]
    if len(matches) != 1:
        raise SystemExit(f"expected one active terminal ingest target, found {len(matches)}")
    record = matches[0]
    if record.get("agent_thread_id") != info["agent_thread_id"]:
        raise SystemExit("native terminal thread id mismatch")
    proc = subprocess.run(
        [
            sys.executable,
            str(Path(__file__).resolve()),
            "result",
            "--assignment-id",
            args.assignment_id,
            "--agent-instance-id",
            args.agent_instance_id,
            "--agent-path",
            args.agent_path,
            "--completed-at",
            info["completed_at"],
        ],
        input=terminal_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=False,
    )
    sys.stdout.buffer.write(proc.stdout)
    if proc.returncode:
        raise SystemExit(proc.returncode)


def command_finalize(_: argparse.Namespace) -> None:
    packet = assert_packet()
    registry = load_jsonl(REGISTRY_FILE)
    manifest = load_jsonl(RESULT_MANIFEST_FILE)
    rows = assignments()
    valid_by_assignment: dict[str, list[dict[str, Any]]] = {}
    for record in registry:
        if record.get("state") == "valid_result":
            valid_by_assignment.setdefault(record["assignment_id"], []).append(record)
    identities = [r.get("agent_instance_id") for r in registry]
    paths = [r.get("agent_path") for r in registry]
    thread_ids = [r.get("agent_thread_id") for r in registry]
    errors: list[str] = []
    for row in rows:
        count = len(valid_by_assignment.get(row["assignment_id"], []))
        if count != 1:
            errors.append(f"valid_result_count:{row['assignment_id']}:{count}")
    if any(r.get("state") == "dispatched" for r in registry):
        errors.append("active_attempts_remain")
    if len(identities) != len(set(identities)):
        errors.append("duplicate_agent_instance_id")
    if len(paths) != len(set(paths)):
        errors.append("duplicate_agent_path")
    if any(not thread_id for thread_id in thread_ids):
        errors.append("missing_agent_thread_id")
    if len(thread_ids) != len(set(thread_ids)):
        errors.append("duplicate_agent_thread_id")
    if len(manifest) != len(registry):
        errors.append("result_manifest_registry_count_mismatch")
    for record in registry:
        if record.get("model") != MODEL or record.get("reasoning_effort") != EFFORT:
            errors.append(f"wrong_model_effort:{record.get('attempt_id')}")
        if record.get("prior_substantive_assignment_count") != 0:
            errors.append(f"prior_assignment_count_nonzero:{record.get('attempt_id')}")
        if record.get("no_followup_reuse") is not True or record.get("terminal_after_result") is not True:
            errors.append(f"lifecycle_flag_failure:{record.get('attempt_id')}")
    checkpoint = update_checkpoint(state="complete" if not errors else "validation_failed")
    validation = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "validated_at": utc_now(),
        "assignment_count": len(rows),
        "dispatch_attempt_count": len(registry),
        "valid_assignment_count": len(valid_by_assignment),
        "failed_attempt_count": sum(1 for r in registry if r.get("state") == "failed_attempt"),
        "unique_agent_count": len(set(identities)),
        "duplicate_agent_instance_count": len(identities) - len(set(identities)),
        "duplicate_agent_path_count": len(paths) - len(set(paths)),
        "duplicate_agent_thread_id_count": len(thread_ids) - len(set(thread_ids)),
        "recycled_agent_count": sum(1 for identity in set(identities) if identities.count(identity) > 1),
        "multi_scope_agent_count": sum(
            1
            for identity in set(identities)
            if len({r["assignment_id"] for r in registry if r.get("agent_instance_id") == identity}) != 1
        ),
        "errors": errors,
        "status": "pass" if not errors else "fail",
    }
    write_json(VALIDATION_DIR / "FINAL_RUNNER_VALIDATION.json", validation)
    if errors:
        raise SystemExit(json.dumps(validation))
    complete = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "runner_thread_id": read_json(CONFIG_FILE)["runner_thread_id"],
        "completed_at": utc_now(),
        "status": "complete",
        "assignment_count": len(rows),
        "valid_assignments": len(valid_by_assignment),
        "failed_attempts": validation["failed_attempt_count"],
        "actual_unique_agents_spawned": len(set(identities)),
        "required_model": MODEL,
        "required_reasoning_effort": EFFORT,
        "valid_token_estimate": packet["total_token_estimate"],
        "valid_capsule_package_bytes": packet["total_capsule_package_bytes"],
        "attempted_token_estimate": checkpoint["attempted_token_estimate"],
        "attempted_capsule_package_bytes": checkpoint["attempted_capsule_package_bytes"],
        "elapsed_seconds": checkpoint["elapsed_seconds"],
        "duplicate_agent_instances": 0,
        "recycled_agent_instances": 0,
        "multi_scope_agent_instances": 0,
        "wrong_model_effort_count": 0,
        "source_capsule_mismatch_count": 0,
        "scope_spill_count": 0,
        "role_leak_count": 0,
        "post_terminal_output_count": 0,
        "unresolved_infrastructure_issues": [],
        "fresh_agent_assignment_registry_ref": str(REGISTRY_FILE.relative_to(REPO_ROOT)),
        "result_manifest_ref": str(RESULT_MANIFEST_FILE.relative_to(REPO_ROOT)),
        "final_validation_ref": str((VALIDATION_DIR / "FINAL_RUNNER_VALIDATION.json").relative_to(REPO_ROOT)),
    }
    write_json(RUNNER_ROOT / "RUNNER_COMPLETE.json", complete)
    print(json.dumps(complete, sort_keys=True))


def main() -> None:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)

    packet_parser = sub.add_parser("validate-packet")
    packet_parser.set_defaults(func=lambda _: print(json.dumps(assert_packet(), sort_keys=True)))

    prompt_parser = sub.add_parser("prompt")
    prompt_parser.add_argument("--assignment-id", required=True)
    prompt_parser.add_argument("--agent-instance-id", required=True)
    prompt_parser.add_argument("--agent-path", required=True)
    prompt_parser.set_defaults(func=command_prompt)

    dispatch_parser = sub.add_parser("dispatch")
    dispatch_parser.add_argument("--assignment-id", required=True)
    dispatch_parser.add_argument("--agent-instance-id", required=True)
    dispatch_parser.add_argument("--agent-path", required=True)
    dispatch_parser.add_argument("--agent-thread-id")
    dispatch_parser.add_argument("--created-at")
    dispatch_parser.add_argument("--wave", required=True, type=int)
    dispatch_parser.set_defaults(func=command_dispatch)

    prepare_parser = sub.add_parser("prepare-dispatch")
    prepare_parser.add_argument("--assignment-id", required=True)
    prepare_parser.add_argument("--agent-instance-id", required=True)
    prepare_parser.add_argument("--agent-path", required=True)
    prepare_parser.add_argument("--wave", required=True, type=int)
    prepare_parser.set_defaults(func=command_prepare_dispatch)

    result_parser = sub.add_parser("result")
    result_parser.add_argument("--assignment-id", required=True)
    result_parser.add_argument("--agent-instance-id", required=True)
    result_parser.add_argument("--agent-path", required=True)
    result_parser.add_argument("--completed-at")
    result_parser.set_defaults(func=command_result)

    checkpoint_parser = sub.add_parser("checkpoint")
    checkpoint_parser.add_argument("--wave", type=int)
    checkpoint_parser.add_argument("--state")
    checkpoint_parser.set_defaults(func=command_checkpoint)

    receipt_parser = sub.add_parser("receipt")
    receipt_parser.add_argument("--assignment-id", required=True)
    receipt_parser.add_argument("--agent-instance-id", required=True)
    receipt_parser.add_argument("--agent-path", required=True)
    receipt_parser.add_argument("--agent-thread-id", required=True)
    receipt_parser.add_argument("--created-at", required=True)
    receipt_parser.add_argument("--actual-model", required=True)
    receipt_parser.add_argument("--actual-reasoning-effort", required=True)
    receipt_parser.set_defaults(func=command_receipt)

    capture_parser = sub.add_parser("repair-capture")
    capture_parser.add_argument("--assignment-id", required=True)
    capture_parser.add_argument("--agent-instance-id", required=True)
    capture_parser.set_defaults(func=command_repair_capture)

    quarantine_parser = sub.add_parser("quarantine-attempt")
    quarantine_parser.add_argument("--assignment-id", required=True)
    quarantine_parser.add_argument("--attempt", required=True, type=int)
    quarantine_parser.add_argument("--failure-kind", required=True)
    quarantine_parser.add_argument("--failure-detail", required=True)
    quarantine_parser.add_argument("--source-validator-ref", required=True)
    quarantine_parser.add_argument("--source-validator-sha256", required=True)
    quarantine_parser.set_defaults(func=command_quarantine_attempt)

    info_parser = sub.add_parser("session-info")
    info_parser.add_argument("--agent-path", required=True)
    info_parser.set_defaults(func=command_session_info)

    register_parser = sub.add_parser("register-session-dispatch")
    register_parser.add_argument("--assignment-id", required=True)
    register_parser.add_argument("--agent-instance-id", required=True)
    register_parser.add_argument("--agent-path", required=True)
    register_parser.add_argument("--wave", required=True, type=int)
    register_parser.set_defaults(func=command_register_session_dispatch)

    prepared_register_parser = sub.add_parser("register-prepared-native")
    prepared_register_parser.add_argument("--assignment-id", required=True)
    prepared_register_parser.add_argument("--agent-instance-id", required=True)
    prepared_register_parser.add_argument("--agent-path", required=True)
    prepared_register_parser.set_defaults(func=command_register_prepared_native)

    ingest_parser = sub.add_parser("ingest-terminal")
    ingest_parser.add_argument("--assignment-id", required=True)
    ingest_parser.add_argument("--agent-instance-id", required=True)
    ingest_parser.add_argument("--agent-path", required=True)
    ingest_parser.set_defaults(func=command_ingest_terminal)

    finalize_parser = sub.add_parser("finalize")
    finalize_parser.set_defaults(func=command_finalize)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
