#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path


ROOT_THREAD_ID = "019f49e2-1cad-7230-b892-72a2a4da54a4"
MODEL = "gpt-5.6-sol"
EFFORT = "ultra"


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text("".join(json.dumps(row, separators=(",", ":"), ensure_ascii=False) + "\n" for row in rows), encoding="utf-8")


def file_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def find_session(agent_path: str, sessions_root: Path) -> Path:
    proc = subprocess.run(
        ["rg", "-l", "--hidden", "--glob", "*.jsonl", agent_path, str(sessions_root)],
        check=False,
        text=True,
        capture_output=True,
    )
    candidates = [Path(line) for line in proc.stdout.splitlines() if line.strip()]
    matches: list[Path] = []
    for path in candidates:
        for row in read_jsonl(path):
            if row.get("type") != "session_meta":
                continue
            payload = row.get("payload", {})
            if payload.get("agent_path") == agent_path:
                matches.append(path)
            break
    if len(matches) != 1:
        raise SystemExit(f"expected one native session for {agent_path}, got {len(matches)}")
    return matches[0]


def parse_session(path: Path) -> dict:
    session_meta = None
    turn_context = None
    final_text = None
    completed_at = None
    token_info = None
    for row in read_jsonl(path):
        kind = row.get("type")
        payload = row.get("payload", {})
        if kind == "session_meta":
            session_meta = payload
        elif kind == "turn_context" and turn_context is None:
            turn_context = payload
        elif kind == "response_item" and payload.get("type") == "message" and payload.get("role") == "assistant" and payload.get("phase") == "final_answer":
            texts = [item.get("text", "") for item in payload.get("content", []) if item.get("type") == "output_text"]
            if texts:
                final_text = "".join(texts)
        elif kind == "event_msg" and payload.get("type") == "token_count":
            token_info = payload.get("info")
        elif kind == "event_msg" and payload.get("type") == "task_complete":
            completed_at = row.get("timestamp")
    if session_meta is None or turn_context is None or final_text is None or completed_at is None:
        raise SystemExit("native session is incomplete")
    return {
        "session_meta": session_meta,
        "turn_context": turn_context,
        "final_text": final_text,
        "completed_at": completed_at,
        "token_info": token_info or {},
    }


def load_validator(path: Path):
    spec = importlib.util.spec_from_file_location("runner_validator", path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--runner-root", required=True)
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--agent-path", required=True)
    parser.add_argument("--sessions-root", default="/Users/jaredsmacbookair/.codex/sessions")
    args = parser.parse_args()

    runner_root = Path(args.runner_root)
    audit_root = runner_root.parents[1]
    registry_path = runner_root / "fresh_agent_assignment_registry.jsonl"
    manifest_path = runner_root / "result_manifest.jsonl"
    registry = read_jsonl(registry_path)
    attempts = [
        row for row in registry
        if row.get("assignment_id") == args.assignment_id
        and row.get("agent_path") == args.agent_path
        and row.get("attempt_state") == "running"
    ]
    if len(attempts) != 1:
        raise SystemExit(f"expected one running attempt, got {len(attempts)}")
    attempt = attempts[0]

    session_path = find_session(args.agent_path, Path(args.sessions_root))
    session = parse_session(session_path)
    meta = session["session_meta"]
    turn = session["turn_context"]
    receipt_errors: list[str] = []
    if meta.get("id") is None:
        receipt_errors.append("missing_agent_thread_id")
    if meta.get("parent_thread_id") != ROOT_THREAD_ID:
        receipt_errors.append("parent_thread_id_mismatch")
    if meta.get("agent_path") != args.agent_path:
        receipt_errors.append("agent_path_mismatch")
    if turn.get("model") != MODEL:
        receipt_errors.append("model_mismatch")
    if turn.get("effort") != EFFORT:
        receipt_errors.append("reasoning_effort_mismatch")
    if receipt_errors:
        raise SystemExit(json.dumps(receipt_errors))

    final_text = session["final_text"]
    try:
        json.loads(final_text)
    except json.JSONDecodeError as exc:
        # Preserve the malformed result exactly, then mark it invalid.
        parse_error = f"result_invalid_json:{exc.msg}"
    else:
        parse_error = None
    result_path = Path(attempt["result_ref"])
    if result_path.exists():
        raise SystemExit(f"result path already exists: {result_path}")
    result_path.write_text(final_text, encoding="utf-8")

    packet = read_jsonl(audit_root / "assignments" / "runner-12.jsonl")
    assignment = next((row for row in packet if row.get("assignment_id") == args.assignment_id), None)
    if assignment is None:
        raise SystemExit("assignment missing from immutable packet")
    capsule = json.loads(Path(assignment["capsule_ref"]).read_text(encoding="utf-8"))
    validator = load_validator(runner_root / "validation" / "validate_runner.py")
    validation_errors = [parse_error] if parse_error else validator.validate_result(result_path, assignment, capsule)
    validation_status = "valid" if not validation_errors else "invalid"

    token_info = session["token_info"].get("total_token_usage", {})
    attempt["agent_thread_id"] = meta["id"]
    attempt["agent_thread_id_source"] = "native_subagent_session_meta_id"
    attempt["agent_nickname"] = meta.get("agent_nickname")
    attempt["session_ref"] = str(session_path)
    attempt["created_at"] = meta.get("timestamp")
    attempt["completed_at"] = session["completed_at"]
    attempt["result_hash"] = file_sha256(result_path)
    attempt["result_bytes"] = result_path.stat().st_size
    attempt["attempt_state"] = "completed_valid" if validation_status == "valid" else "failed_attempt_zero_coverage"
    attempt["coverage_credit"] = 1 if validation_status == "valid" else 0
    attempt["validation_passed"] = validation_status == "valid"
    attempt["exact_evidence_validation_passed"] = validation_status == "valid"
    attempt["validation_errors"] = validation_errors
    attempt["session_input_tokens"] = token_info.get("input_tokens")
    attempt["session_cached_input_tokens"] = token_info.get("cached_input_tokens")
    attempt["session_output_tokens"] = token_info.get("output_tokens")
    attempt["session_reasoning_output_tokens"] = token_info.get("reasoning_output_tokens")
    attempt["session_total_tokens"] = token_info.get("total_tokens")
    write_jsonl(registry_path, registry)

    attempt_dir = runner_root / "attempt_receipts"
    attempt_dir.mkdir(parents=True, exist_ok=True)
    attempt_receipt_path = attempt_dir / f"{attempt['attempt_id']}.json"
    if attempt_receipt_path.exists():
        raise SystemExit("immutable completed attempt receipt already exists")
    attempt_receipt = dict(attempt)
    attempt_receipt["receipt_type"] = "immutable_completed_attempt"
    attempt_receipt_path.write_text(json.dumps(attempt_receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    attempt["attempt_receipt_ref"] = str(attempt_receipt_path)
    attempt["attempt_receipt_sha256"] = file_sha256(attempt_receipt_path)
    write_jsonl(registry_path, registry)

    if validation_status == "valid":
        manifest = read_jsonl(manifest_path)
        if any(row.get("attempt_id") == attempt.get("attempt_id") for row in manifest):
            raise SystemExit("attempt already present in result manifest")
        manifest_row = dict(attempt)
        manifest_row["validation_status"] = "completed_valid"
        manifest_row["validation_passed"] = True
        manifest_row["exact_evidence_validation_passed"] = True
        manifest.append(manifest_row)
        write_jsonl(manifest_path, manifest)
    else:
        failure_path = runner_root / "failed_attempts.jsonl"
        failures = read_jsonl(failure_path)
        failure_row = dict(attempt)
        failure_row["validation_status"] = "failed_attempt_zero_coverage"
        failure_row["status"] = "failed_attempt_zero_coverage"
        failure_row["validation_passed"] = False
        failure_row["exact_evidence_validation_passed"] = False
        failure_row["immutable"] = True
        failures.append(failure_row)
        write_jsonl(failure_path, failures)

    summary = {
        "assignment_id": args.assignment_id,
        "attempt_id": attempt["attempt_id"],
        "agent_path": args.agent_path,
        "agent_thread_id": meta["id"],
        "agent_nickname": meta.get("agent_nickname"),
        "model": turn.get("model"),
        "reasoning_effort": turn.get("effort"),
        "created_at": meta.get("timestamp"),
        "completed_at": session["completed_at"],
        "result_ref": attempt["result_ref"],
        "result_hash": attempt["result_hash"],
        "result_bytes": attempt["result_bytes"],
        "validation_status": validation_status,
        "validation_error_count": len(validation_errors),
        "validation_errors": validation_errors,
        "session_total_tokens": attempt["session_total_tokens"],
    }
    print(json.dumps(summary, indent=2, sort_keys=True))
    return 0 if validation_status == "valid" else 2


if __name__ == "__main__":
    raise SystemExit(main())
