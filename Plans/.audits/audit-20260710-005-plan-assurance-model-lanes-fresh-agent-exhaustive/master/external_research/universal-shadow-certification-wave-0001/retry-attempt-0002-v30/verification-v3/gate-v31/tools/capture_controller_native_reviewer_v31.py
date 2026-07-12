#!/usr/bin/env python3
"""Append-only fixed-slot capture writer for future V31 atomic8 Luna reviewers.

The only caller-supplied value is the sealed slot. Native identity, turn, session,
model, effort, fork, terminal mapping, and hashes are derived from native logs.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parents[1]
VERIFIER = HERE / "tools/verify_gate_v31.py"
spec = importlib.util.spec_from_file_location("gate_v31_verifier", VERIFIER)
module = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(module)


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def write_once(path: Path, raw: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        os.write(descriptor, raw)
        os.fsync(descriptor)
    finally:
        os.close(descriptor)
    directory = os.open(path.parent, os.O_RDONLY)
    try:
        os.fsync(directory)
    finally:
        os.close(directory)


def output_text(row: dict[str, Any]) -> str:
    output = row.get("payload", {}).get("output", "")
    if isinstance(output, str):
        return output
    if isinstance(output, list):
        return "\n".join(str(item.get("text", "")) for item in output if isinstance(item, dict))
    return json.dumps(output)


def main() -> None:
    authority = module.load(HERE / "AUTHORITY_V31.json")
    atomic_slots = [slot_id for slot_id, slot in authority["slots"].items() if slot["role"] == "atomic8-prelaunch"]
    parser = argparse.ArgumentParser()
    parser.add_argument("--slot", required=True, choices=atomic_slots)
    args = parser.parse_args()
    slot_id = args.slot
    slot = authority["slots"][slot_id]
    report_path = module.AUDIT / slot["report_path"]
    checkpoint_path = HERE / slot["checkpoint_path"]
    capture_path = HERE / slot["capture_path"]
    if checkpoint_path.exists() or capture_path.exists():
        raise SystemExit("append-only capture/checkpoint already exists; issue a new gate version")
    if not module.regular_contained(report_path, HERE):
        raise SystemExit("fixed-slot report missing, escaped, or symlinked")
    report_raw, report_stat, stable = module.stable_file_read(report_path)
    if not stable:
        raise SystemExit("report changed during double read")
    report = json.loads(report_raw)
    report_errors = module.validate_atomic8_report(slot_id, slot, report, module.load(module.REPORT_SCHEMA_PATH))
    if report_errors:
        raise SystemExit("invalid atomic8 report: " + ",".join(report_errors))
    report_sha = module.sha_bytes(report_raw)

    parent_path = module.find_native_session(authority["controller"]["native_thread_id"])
    parent_raw, parent_rows = module.load_jsonl_raw(parent_path)
    spawn_matches: list[tuple[int, dict[str, Any]]] = []
    for index, row in enumerate(parent_rows):
        payload = row.get("payload", {})
        source = str(payload.get("input", ""))
        if (
            row.get("type") == "response_item"
            and payload.get("type") == "custom_tool_call"
            and slot["spawn_marker"] in source
            and slot["report_path"] in source
            and "spawn_agent" in source
        ):
            spawn_matches.append((index, row))
    if len(spawn_matches) != 1:
        raise SystemExit(f"expected one fixed-marker native spawn, found {len(spawn_matches)}")
    spawn_index, spawn_row = spawn_matches[0]
    spawn_payload = spawn_row["payload"]
    spawn_source = str(spawn_payload.get("input", ""))
    for required in ('model: "gpt-5.6-luna"', 'reasoning_effort: "max"', "fork_context: false"):
        if required not in spawn_source:
            raise SystemExit("native spawn missing exact lane/fork binding: " + required)
    call_id = spawn_payload.get("call_id")
    spawn_results = [
        (index, row)
        for index, row in enumerate(parent_rows[spawn_index + 1:], start=spawn_index + 1)
        if row.get("type") == "response_item"
        and row.get("payload", {}).get("type") == "custom_tool_call_output"
        and row.get("payload", {}).get("call_id") == call_id
    ]
    if len(spawn_results) != 1:
        raise SystemExit(f"expected one native spawn result, found {len(spawn_results)}")
    spawn_result_index, spawn_result_row = spawn_results[0]
    ids = sorted(set(re.findall(r"\b[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b", output_text(spawn_result_row))))
    if len(ids) != 1:
        raise SystemExit(f"expected one native reviewer id in fixed-slot result, found {len(ids)}")
    child_id = ids[0]
    child_path = module.find_native_session(child_id)
    child_raw, child_rows = module.load_jsonl_raw(child_path)
    metas = [(i, row) for i, row in enumerate(child_rows) if row.get("type") == "session_meta"]
    starts = [(i, row) for i, row in enumerate(child_rows) if row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_started"]
    contexts = [(i, row) for i, row in enumerate(child_rows) if row.get("type") == "turn_context"]
    completes = [(i, row) for i, row in enumerate(child_rows) if row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_complete"]
    if not (len(metas) == len(starts) == len(contexts) == len(completes) == 1):
        raise SystemExit("fresh child must have exactly one meta/start/context/complete")
    meta_index, meta = metas[0]
    start_index, start = starts[0]
    context_index, context = contexts[0]
    complete_index, complete = completes[0]
    turn_id = start["payload"].get("turn_id")
    ctx = context["payload"]
    collaboration = ctx.get("collaboration_mode", {}).get("settings", {})
    if (
        meta["payload"].get("id") != child_id
        or meta["payload"].get("parent_thread_id") != authority["controller"]["native_thread_id"]
        or meta["payload"].get("forked_from_id") is not None
        or ctx.get("turn_id") != turn_id
        or ctx.get("model") != "gpt-5.6-luna"
        or ctx.get("effort") != "max"
        or collaboration.get("model") != "gpt-5.6-luna"
        or collaboration.get("reasoning_effort") != "max"
        or complete_index != len(child_rows) - 1
        or complete["payload"].get("turn_id") != turn_id
        or report_sha not in str(complete["payload"].get("last_agent_message", ""))
        or module.child_descendant_spawn_count(child_rows) != 0
    ):
        raise SystemExit("child native identity/lane/terminal closure failed")

    terminal_matches = [
        (index, row)
        for index, row in enumerate(parent_rows[spawn_result_index + 1:], start=spawn_result_index + 1)
        if row.get("type") == "response_item"
        and row.get("payload", {}).get("type") == "custom_tool_call_output"
        and child_id in output_text(row)
        and report_sha in output_text(row)
        and "completed" in output_text(row)
    ]
    if len(terminal_matches) != 1:
        raise SystemExit(f"expected one native terminal mapping, found {len(terminal_matches)}")
    terminal_index, terminal_row = terminal_matches[0]
    turn_starts = [
        (index, row)
        for index, row in enumerate(parent_rows[:spawn_index + 1])
        if row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_started"
    ]
    if not turn_starts:
        raise SystemExit("parent task start missing")
    parent_turn_start, parent_started = turn_starts[-1]
    parent_turn_id = parent_started["payload"]["turn_id"]
    parent_completes = [
        (index, row)
        for index, row in enumerate(parent_rows[terminal_index:], start=terminal_index)
        if row.get("type") == "event_msg"
        and row.get("payload", {}).get("type") == "task_complete"
        and row.get("payload", {}).get("turn_id") == parent_turn_id
    ]
    if len(parent_completes) != 1:
        raise SystemExit("run capture in a later controller turn after the spawn turn closes")
    parent_turn_end, _ = parent_completes[0]
    parent_contexts = [
        row
        for row in parent_rows[parent_turn_start:parent_turn_end + 1]
        if row.get("type") == "turn_context" and row.get("payload", {}).get("turn_id") == parent_turn_id
    ]
    if len(parent_contexts) != 1 or parent_contexts[0]["payload"].get("model") != "gpt-5.6-luna" or parent_contexts[0]["payload"].get("effort") != "max":
        raise SystemExit("parent controller native lane mismatch")
    prefix_count = parent_turn_end + 1
    action_counts = module.count_forbidden_parent_actions(parent_rows, child_id, prefix_count)
    if any(action_counts.values()):
        raise SystemExit("followup/message/interrupt detected")
    matching_spawns = sum(
        1
        for row in parent_rows[:prefix_count]
        if row.get("type") == "response_item"
        and row.get("payload", {}).get("type") == "custom_tool_call"
        and slot["spawn_marker"] in str(row.get("payload", {}).get("input", ""))
        and "spawn_agent" in str(row.get("payload", {}).get("input", ""))
    )
    if matching_spawns != 1:
        raise SystemExit("retry or duplicate fixed-slot spawn detected")

    checkpoint_records = [
        {"record": "parent_native_spawn_call", "slot_id": slot_id, "controller_thread_id": authority["controller"]["native_thread_id"], "controller_turn_id": parent_turn_id, "native_call_id": call_id, "parent_line": spawn_index + 1, "raw_record_sha256": module.sha_bytes(parent_raw[spawn_index])},
        {"record": "parent_native_spawn_result", "slot_id": slot_id, "native_call_id": call_id, "native_thread_id": child_id, "parent_line": spawn_result_index + 1, "raw_record_sha256": module.sha_bytes(parent_raw[spawn_result_index])},
        {"record": "parent_native_terminal_mapping", "slot_id": slot_id, "native_thread_id": child_id, "report_sha256": report_sha, "parent_line": terminal_index + 1, "raw_record_sha256": module.sha_bytes(parent_raw[terminal_index])},
        {"record": "child_native_session", "slot_id": slot_id, "native_thread_id": child_id, "native_turn_id": turn_id, "session_line_count": len(child_raw), "session_sha256": module.sha_bytes(b"".join(child_raw)), "session_meta_record_sha256": module.sha_bytes(child_raw[meta_index]), "task_started_record_sha256": module.sha_bytes(child_raw[start_index]), "turn_context_record_sha256": module.sha_bytes(child_raw[context_index]), "task_complete_record_sha256": module.sha_bytes(child_raw[complete_index]), "report_sha256": report_sha},
    ]
    checkpoint_raw = b"".join(canonical(record) for record in checkpoint_records)
    checkpoint_sha = module.sha_bytes(checkpoint_raw)
    capture = {
        "schema_version": "universal-shadow-certification-controller-native-reviewer-capture-v31-v1",
        "audit_id": authority["audit_id"],
        "wave_id": authority["wave_id"],
        "attempt_id": authority["attempt_id"],
        "slot_id": slot_id,
        "capture_authority": "controller_parent_native_session_records",
        "identity_authority": "native_session_not_report_self_attestation",
        "controller_native": {
            "native_thread_id": authority["controller"]["native_thread_id"],
            "native_turn_id": parent_turn_id,
            "actual_model": "gpt-5.6-luna",
            "actual_reasoning_effort": "max",
            "session_prefix_line_count": prefix_count,
            "session_prefix_sha256": module.sha_bytes(b"".join(parent_raw[:prefix_count])),
            "turn_start_line": parent_turn_start + 1,
            "turn_end_line": parent_turn_end + 1,
            "turn_segment_sha256": module.sha_bytes(b"".join(parent_raw[parent_turn_start:parent_turn_end + 1])),
            "spawn_call_line": spawn_index + 1,
            "spawn_call_id": call_id,
            "spawn_record_sha256": module.sha_bytes(parent_raw[spawn_index]),
            "spawn_result_line": spawn_result_index + 1,
            "spawn_result_record_sha256": module.sha_bytes(parent_raw[spawn_result_index]),
            "terminal_record_line": terminal_index + 1,
            "terminal_record_sha256": module.sha_bytes(parent_raw[terminal_index]),
        },
        "reviewer_native": {
            "native_thread_id": child_id,
            "native_turn_id": turn_id,
            "parent_thread_id": authority["controller"]["native_thread_id"],
            "session_sha256": module.sha_bytes(b"".join(child_raw)),
            "session_line_count": len(child_raw),
            "session_meta_line": meta_index + 1,
            "session_meta_record_sha256": module.sha_bytes(child_raw[meta_index]),
            "task_started_line": start_index + 1,
            "task_started_record_sha256": module.sha_bytes(child_raw[start_index]),
            "turn_context_line": context_index + 1,
            "turn_context_record_sha256": module.sha_bytes(child_raw[context_index]),
            "task_complete_line": complete_index + 1,
            "task_complete_record_sha256": module.sha_bytes(child_raw[complete_index]),
            "task_complete_is_last_line": True,
            "actual_model": "gpt-5.6-luna",
            "actual_reasoning_effort": "max",
            "collaboration_model": "gpt-5.6-luna",
            "collaboration_reasoning_effort": "max",
            "fork_context": False,
            "fork_turns": "none",
            "forked_from_id": None,
            "terminal_status": "completed",
            "terminal_report_sha256": report_sha,
        },
        "closure": {"matching_spawn_count": 1, "followup_task_count": 0, "send_message_count": 0, "interrupt_count": 0, "retry_count": 0, "descendant_spawn_count": 0, "post_terminal_reuse_actions": []},
        "hash_closure": {"stable_double_read": True, "path_symlink": False, "report_sha256": report_sha, "checkpoint_sha256": checkpoint_sha, "child_session_sha256": module.sha_bytes(b"".join(child_raw)), "parent_session_prefix_sha256": module.sha_bytes(b"".join(parent_raw[:prefix_count])), "parent_turn_segment_sha256": module.sha_bytes(b"".join(parent_raw[parent_turn_start:parent_turn_end + 1])), "spawn_record_sha256": module.sha_bytes(parent_raw[spawn_index]), "spawn_result_record_sha256": module.sha_bytes(parent_raw[spawn_result_index]), "terminal_record_sha256": module.sha_bytes(parent_raw[terminal_index])},
        "report_binding": {"relative_path": slot["report_path"], "raw_sha256": report_sha, "byte_count": len(report_raw), "inode": report_stat.st_ino, "mtime_epoch": int(report_stat.st_mtime), "semantic_status": "PASS", "identity_fields_authoritative": False, "terminal_sender_native_thread_id": child_id, "terminal_report_sha256": report_sha},
        "checkpoint": {"relative_path": slot["checkpoint_path"], "raw_sha256": checkpoint_sha, "record_count": 4},
        "scope": {"activation_authorized": False, "launch_authorized": False, "spawn": "none", "spawn_count": 0, "result_count": 0, "receipt_count": 0, "runtime_native_capture_rows": 0, "activation_transactions": 0, "credit": 0},
    }
    errors = module.validate_capture_document(capture, slot_id, {**slot, "report_sha256": report_sha}, module.load(module.CAPTURE_SCHEMA_PATH), {**slot, "native_thread_id": child_id, "native_turn_id": turn_id})
    if errors:
        raise SystemExit("capture schema/semantic failure: " + ",".join(errors))
    write_once(checkpoint_path, checkpoint_raw)
    write_once(capture_path, json.dumps(capture, indent=2, sort_keys=True).encode() + b"\n")
    print(json.dumps({"status": "captured_proof_only", "slot_id": slot_id, "native_thread_id": child_id, "native_turn_id": turn_id, "child_session_sha256": capture["reviewer_native"]["session_sha256"], "report_sha256": report_sha, "checkpoint_sha256": checkpoint_sha, "capture_sha256": module.sha(capture_path), "activation_authorized": False, "launch_authorized": False, "credit": 0}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
