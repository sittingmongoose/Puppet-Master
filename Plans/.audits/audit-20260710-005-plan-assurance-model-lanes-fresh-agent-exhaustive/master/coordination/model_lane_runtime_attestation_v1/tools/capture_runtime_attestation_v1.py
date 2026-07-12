#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path


NS = Path(__file__).resolve().parents[1]
EVIDENCE_DIR = NS / "evidence"
PARENT_SESSION = Path(
    "/Users/jaredsmacbookair/.codex/sessions/2026/07/11/"
    "rollout-2026-07-11T00-10-26-019f4f5e-96c6-7893-8c94-ce2c1b760d6c.jsonl"
)
CHILD_SESSION = Path(
    "/Users/jaredsmacbookair/.codex/sessions/2026/07/11/"
    "rollout-2026-07-11T20-02-26-019f53a1-e476-7f83-9b4b-a00df65e3396.jsonl"
)
TASK_NAME = "a005_cds_v2_luna_independent_prelaunch_terminal"
AGENT_PATH = f"/root/{TASK_NAME}"
PARENT_THREAD_ID = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"


def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_bytes(value: object) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n").encode()


def load_jsonl(path: Path) -> tuple[bytes, list[bytes], list[dict]]:
    data = path.read_bytes()
    raw = data.splitlines(keepends=True)
    rows = [json.loads(line) for line in raw]
    return data, raw, rows


def is_spawn(row: dict) -> bool:
    p = row.get("payload", {})
    return row.get("type") == "response_item" and p.get("type") == "function_call" and p.get("name") == "spawn_agent"


def parse_arguments(row: dict) -> dict:
    raw = row["payload"].get("arguments", "{}")
    return json.loads(raw) if isinstance(raw, str) else raw


def main() -> None:
    parent_data, parent_raw, parent = load_jsonl(PARENT_SESSION)
    child_data, child_raw, child = load_jsonl(CHILD_SESSION)

    matches = [(i, row, parse_arguments(row)) for i, row in enumerate(parent) if is_spawn(row) and parse_arguments(row).get("task_name") == TASK_NAME]
    if len(matches) != 1:
        raise SystemExit(f"expected one matching spawn, found {len(matches)}")
    spawn_i, spawn_row, spawn_args = matches[0]

    activity_matches = []
    for i in range(spawn_i + 1, len(parent)):
        row = parent[i]
        p = row.get("payload", {})
        if row.get("type") == "event_msg" and p.get("type") == "sub_agent_activity" and p.get("agent_path") == AGENT_PATH and p.get("kind") == "started":
            activity_matches.append((i, row))
            break
    if len(activity_matches) != 1:
        raise SystemExit("missing matching sub-agent activity")
    activity_i, activity_row = activity_matches[0]
    call_id = activity_row["payload"]["event_id"]

    output_matches = []
    for i, row in enumerate(parent):
        p = row.get("payload", {})
        if row.get("type") == "response_item" and p.get("type") == "function_call_output" and p.get("call_id") == call_id:
            output_matches.append((i, row, json.loads(p["output"])))
    if len(output_matches) != 1:
        raise SystemExit(f"expected one spawn result, found {len(output_matches)}")
    output_i, output_row, output = output_matches[0]

    terminal_matches = []
    for i, row in enumerate(parent):
        p = row.get("payload", {})
        if row.get("type") != "response_item" or p.get("type") != "agent_message":
            continue
        if p.get("author") != AGENT_PATH:
            continue
        content = "\n".join(x.get("text", "") for x in p.get("content", []) if isinstance(x, dict))
        if content.endswith("Payload:\nPMR1"):
            terminal_matches.append((i, row))
    if len(terminal_matches) != 1:
        raise SystemExit(f"expected one terminal PMR1 mapping, found {len(terminal_matches)}")
    terminal_i, terminal_row = terminal_matches[0]

    turn_start = next(
        i for i in range(spawn_i, -1, -1)
        if parent[i].get("type") == "event_msg" and parent[i].get("payload", {}).get("type") == "task_started"
    )
    turn_id = parent[turn_start]["payload"]["turn_id"]
    turn_complete = next(
        i for i in range(terminal_i, len(parent))
        if parent[i].get("type") == "event_msg"
        and parent[i].get("payload", {}).get("type") == "task_complete"
        and parent[i].get("payload", {}).get("turn_id") == turn_id
    )
    segment_bytes = b"".join(parent_raw[turn_start : turn_complete + 1])

    all_same_path_spawns = []
    for i, row in enumerate(parent):
        if is_spawn(row):
            args = parse_arguments(row)
            if args.get("task_name") == TASK_NAME:
                all_same_path_spawns.append(i)

    followup_count = message_count = descendant_spawn_count = retry_count = 0
    post_terminal_reuse_actions: list[dict] = []
    for i, row in enumerate(parent):
        p = row.get("payload", {})
        if row.get("type") == "response_item" and p.get("type") == "function_call":
            name = p.get("name")
            try:
                args = json.loads(p.get("arguments", "{}"))
            except (TypeError, json.JSONDecodeError):
                args = {}
            target = args.get("target")
            if target in {TASK_NAME, AGENT_PATH}:
                if name == "followup_task":
                    followup_count += 1
                if name == "send_message":
                    message_count += 1
                if i > terminal_i:
                    post_terminal_reuse_actions.append({"line": i + 1, "tool": name})
            if name == "spawn_agent" and i != spawn_i and args.get("task_name", "").startswith(TASK_NAME):
                retry_count += 1

    session_meta = child[0]["payload"]
    child_path = session_meta["agent_path"]
    child_id = session_meta["id"]
    turn_context_rows = [row for row in child if row.get("type") == "turn_context"]
    if len(turn_context_rows) != 1:
        raise SystemExit("expected exactly one child turn_context")
    ctx = turn_context_rows[0]["payload"]
    child_spawn_count = sum(1 for row in child if is_spawn(row))
    descendant_spawn_count += child_spawn_count
    child_complete_rows = [
        (i, row) for i, row in enumerate(child)
        if row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_complete"
    ]
    if len(child_complete_rows) != 1:
        raise SystemExit("expected exactly one child task_complete")
    child_complete_i, child_complete = child_complete_rows[0]
    child_messages = [
        row for row in child
        if row.get("type") == "response_item"
        and row.get("payload", {}).get("type") == "message"
        and row.get("payload", {}).get("phase") == "final_answer"
    ]
    child_terminal_text = "".join(
        part.get("text", "")
        for row in child_messages
        for part in row.get("payload", {}).get("content", [])
        if isinstance(part, dict)
    )

    minimal_checkpoint = [
        {
            "record": "delegation_spawn_call",
            "parent_line": spawn_i + 1,
            "timestamp": spawn_row.get("timestamp"),
            "function_call_record_id": spawn_row["payload"].get("id"),
            "native_tool_call_id": call_id,
            "argument_keys": sorted(spawn_args),
            "arguments_without_message": {k: v for k, v in spawn_args.items() if k != "message"},
            "message_sha256": sha_bytes(str(spawn_args.get("message", "")).encode()),
        },
        {
            "record": "spawn_result",
            "parent_line": output_i + 1,
            "timestamp": output_row.get("timestamp"),
            "native_tool_call_id": call_id,
            "output": output,
        },
        {
            "record": "terminal_child_mapping",
            "parent_line": terminal_i + 1,
            "timestamp": terminal_row.get("timestamp"),
            "sender": AGENT_PATH,
            "terminal_response": "PMR1",
            "native_child_thread_id": child_id,
        },
    ]
    checkpoint_bytes = b"".join(canonical_bytes(x) for x in minimal_checkpoint)

    evidence = {
        "schema_version": "audit005-model-lane-runtime-spawn-evidence-v1",
        "authority_rule": "Only explicit model and reasoning_effort fields in the parent native spawn call, corroborated by the child native runtime context, can establish the requested lane. Prompt prose and child self-attestation are non-authoritative.",
        "parent_spawn": {
            "call_count": len(matches),
            "call_id": call_id,
            "function_call_record_id": spawn_row["payload"].get("id"),
            "parent_line": spawn_i + 1,
            "arguments": spawn_args,
            "argument_keys": sorted(spawn_args),
            "message_sha256": sha_bytes(str(spawn_args.get("message", "")).encode()),
        },
        "parent_spawn_result": {
            "call_id": call_id,
            "parent_line": output_i + 1,
            "task_name": output.get("task_name"),
        },
        "terminal_mapping": {
            "count": len(terminal_matches),
            "parent_line": terminal_i + 1,
            "sender": AGENT_PATH,
            "payload": "PMR1",
            "native_child_thread_id": child_id,
        },
        "child_native_session": {
            "session_path": str(CHILD_SESSION),
            "native_child_thread_id": child_id,
            "native_child_thread_id_count": 1,
            "parent_thread_id": session_meta.get("parent_thread_id"),
            "agent_path": child_path,
            "actual_model": ctx.get("model"),
            "actual_reasoning_effort": ctx.get("effort"),
            "collaboration_model": ctx.get("collaboration_mode", {}).get("settings", {}).get("model"),
            "collaboration_reasoning_effort": ctx.get("collaboration_mode", {}).get("settings", {}).get("reasoning_effort"),
            "terminal_status": "completed" if child_complete["payload"].get("last_agent_message") == "PMR1" else "other",
            "terminal_response": child_terminal_text,
            "task_complete_line": child_complete_i + 1,
            "task_complete_is_last_line": child_complete_i == len(child) - 1,
        },
        "closure": {
            "parent_session_path": str(PARENT_SESSION),
            "parent_capture_line_count": len(parent),
            "original_turn_id": turn_id,
            "original_turn_start_line": turn_start + 1,
            "original_turn_complete_line": turn_complete + 1,
            "original_turn_segment_closed": turn_complete >= terminal_i,
            "parent_task_complete_after_terminal": turn_complete > terminal_i,
            "same_path_spawn_count": len(all_same_path_spawns),
            "followup_count": followup_count,
            "message_count": message_count,
            "descendant_spawn_count": descendant_spawn_count,
            "retry_count": retry_count,
            "post_terminal_reuse_actions": post_terminal_reuse_actions,
            "parent_suffix_scanned_through_line": len(parent),
        },
        "hash_closure": {
            "parent_capture_prefix_sha256": sha_bytes(parent_data),
            "parent_turn_segment_sha256": sha_bytes(segment_bytes),
            "minimal_checkpoint_sha256": sha_bytes(checkpoint_bytes),
            "spawn_record_sha256": sha_bytes(parent_raw[spawn_i]),
            "spawn_result_record_sha256": sha_bytes(parent_raw[output_i]),
            "terminal_record_sha256": sha_bytes(parent_raw[terminal_i]),
            "child_session_sha256": sha_bytes(child_data),
        },
        "requested_lane": {"model": "gpt-5.6-luna", "reasoning_effort": "max"},
        "mechanical_outcome": "fail",
        "launch_authorized": False,
    }

    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    checkpoint_path = EVIDENCE_DIR / "parent_spawn_checkpoint.jsonl"
    evidence_path = EVIDENCE_DIR / "runtime_spawn_evidence.json"
    checkpoint_path.write_bytes(checkpoint_bytes)
    evidence_path.write_text(json.dumps(evidence, indent=2, sort_keys=True) + "\n")
    manifest = {
        "schema_version": "audit005-model-lane-runtime-capture-manifest-v1",
        "parent_spawn_checkpoint_path": str(checkpoint_path),
        "parent_spawn_checkpoint_sha256": sha_bytes(checkpoint_path.read_bytes()),
        "runtime_spawn_evidence_path": str(evidence_path),
        "runtime_spawn_evidence_sha256": sha_bytes(evidence_path.read_bytes()),
        "source_parent_session_path": str(PARENT_SESSION),
        "source_parent_capture_prefix_sha256": evidence["hash_closure"]["parent_capture_prefix_sha256"],
        "source_child_session_path": str(CHILD_SESSION),
        "source_child_session_sha256": evidence["hash_closure"]["child_session_sha256"],
        "capture_is_read_only": True,
    }
    (EVIDENCE_DIR / "capture_manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
