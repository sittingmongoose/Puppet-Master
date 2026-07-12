#!/usr/bin/env python3
"""Capture the exact-six native sessions after all terminal PMR1 receipts exist."""
from __future__ import annotations

import hashlib
import importlib.util
import json
import os
from pathlib import Path


AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
HERE = Path(__file__).resolve().parent
GATE = AUDIT / "master/scenario_adversarial/wave-0001/cohorts/cohort-0002/semantic-repair-attempt-0002-gate-v31"
SESSIONS = Path("/Users/jaredsmacbookair/.codex/sessions")
PARENT = "019f551e-5c00-7a73-afa3-7b57d8f0f442"
IDS = ["A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016"]
ACTIVATION = "4a6ddbddfb45812831b44124e224b9adcfaec13e77714523675b27584181932c"


def sha_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_once(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode()
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        view = memoryview(raw)
        while view:
            view = view[os.write(fd, view):]
        os.fsync(fd)
    finally:
        os.close(fd)
    os.chmod(path, 0o444)


def session_for(agent_path: str) -> tuple[Path, list[bytes], list[dict]]:
    matches = []
    for path in SESSIONS.rglob("*.jsonl"):
        raw = path.read_bytes().splitlines(keepends=True)
        if not raw:
            continue
        try:
            first = json.loads(raw[0])
            spawn = first.get("payload", {}).get("source", {}).get("subagent", {}).get("thread_spawn", {})
        except Exception:
            continue
        if spawn.get("agent_path") == agent_path:
            matches.append((path, raw, [json.loads(line) for line in raw]))
    if len(matches) != 1:
        raise RuntimeError(f"native session cardinality {agent_path}: {len(matches)}")
    return matches[0]


def main() -> None:
    spec = importlib.util.spec_from_file_location("scenario_gate_semantics", GATE / "verify_gate_v31_1.py")
    gate = importlib.util.module_from_spec(spec); assert spec and spec.loader; spec.loader.exec_module(gate)
    entries = []
    native_ids: set[str] = set()
    turn_ids: set[str] = set()
    for aid in IDS:
        auth = load(HERE / "authorizations" / f"{aid}.json")
        agent_path = auth["canonical_agent_path"]
        session_path, raw, rows = session_for(agent_path)
        metas = [(i, row) for i, row in enumerate(rows) if row.get("type") == "session_meta"]
        contexts = [(i, row) for i, row in enumerate(rows) if row.get("type") == "turn_context"]
        started = [(i, row) for i, row in enumerate(rows) if row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_started"]
        complete = [(i, row) for i, row in enumerate(rows) if row.get("type") == "event_msg" and row.get("payload", {}).get("type") == "task_complete"]
        if not (len(metas) == len(contexts) == len(started) == len(complete) == 1) or complete[0][0] != len(rows) - 1:
            raise RuntimeError(f"native lifecycle cardinality: {aid}")
        meta = metas[0][1]["payload"]
        spawn = meta["source"]["subagent"]["thread_spawn"]
        native_id = meta["id"]
        turn_id = contexts[0][1]["payload"]["turn_id"]
        if meta.get("parent_thread_id") != PARENT or spawn.get("agent_path") != agent_path or spawn.get("parent_thread_id") != PARENT:
            raise RuntimeError(f"parent/path binding: {aid}")
        if complete[0][1]["payload"].get("last_agent_message") != "PMR1" or complete[0][1]["payload"].get("turn_id") != turn_id:
            raise RuntimeError(f"terminal binding: {aid}")
        result_path = Path(auth["result_path"]); receipt_path = Path(auth["terminal_receipt_path"])
        if not result_path.is_file() or not receipt_path.is_file() or result_path.is_symlink() or receipt_path.is_symlink() or result_path.stat().st_nlink != 1 or receipt_path.stat().st_nlink != 1:
            raise RuntimeError(f"result/receipt topology: {aid}")
        result = load(result_path); receipt = load(receipt_path)
        if result.get("assignment_id") != aid or result.get("attempt_id") != "attempt-0002" or result.get("task_thread_id") != agent_path or result.get("status") != "completed":
            raise RuntimeError(f"result identity: {aid}")
        if receipt.get("result_sha256") != sha(result_path) or receipt.get("terminal_response") != "PMR1" or receipt.get("terminal_status") != "completed" or any(receipt.get(key) != 0 for key in ("followups", "retries", "descendants")):
            raise RuntimeError(f"receipt binding: {aid}")
        if result_path.stat().st_mtime > receipt_path.stat().st_mtime:
            raise RuntimeError(f"receipt order: {aid}")
        forbidden_calls = 0
        for row in rows:
            payload = row.get("payload", {})
            if row.get("type") == "response_item" and payload.get("type") in {"function_call", "custom_tool_call"} and payload.get("name") in {"spawn_agent", "followup_task", "send_message", "interrupt_agent"}:
                forbidden_calls += 1
        semantic_errors = gate.result_errors(result, aid)
        native_ids.add(native_id); turn_ids.add(turn_id)
        entries.append({
            "assignment_id": aid,
            "canonical_agent_path": agent_path,
            "native_thread_id": native_id,
            "native_turn_id": turn_id,
            "agent_nickname": meta.get("agent_nickname"),
            "parent_thread_id": PARENT,
            "session_path": str(session_path),
            "session_line_count": len(raw),
            "session_sha256": sha_bytes(b"".join(raw)),
            "session_meta_record_sha256": sha_bytes(raw[metas[0][0]]),
            "turn_context_record_sha256": sha_bytes(raw[contexts[0][0]]),
            "task_started_record_sha256": sha_bytes(raw[started[0][0]]),
            "task_complete_record_sha256": sha_bytes(raw[complete[0][0]]),
            "terminal_response": "PMR1",
            "forbidden_controller_calls": forbidden_calls,
            "result_path": str(result_path),
            "result_sha256": sha(result_path),
            "result_byte_count": result_path.stat().st_size,
            "terminal_receipt_path": str(receipt_path),
            "terminal_receipt_sha256": sha(receipt_path),
            "semantic_error_count_pre_primary": len(semantic_errors),
            "semantic_error_digest_pre_primary": sha_bytes("\n".join(semantic_errors).encode()),
        })
    if len(native_ids) != 6 or len(turn_ids) != 6 or any(entry["forbidden_controller_calls"] != 0 for entry in entries):
        raise RuntimeError("fresh identity or forbidden-call failure")
    capture = {
        "schema_version": "scenario-repair-exact6-controller-native-capture-v32-v1",
        "status": "CAPTURED_EXACT6_TERMINAL_PENDING_SOL_PRIMARY",
        "activation_sha256": ACTIVATION,
        "controller_task_path": "/root/sol_controller_v29",
        "controller_native_thread_id": PARENT,
        "assignment_ids": IDS,
        "entries": entries,
        "counts": {"assignments": 6, "unique_native_thread_ids": 6, "unique_native_turn_ids": 6, "results": 6, "terminal_receipts": 6, "followups": 0, "retries": 0, "descendants": 0, "credit": 0},
        "primary_required": True,
        "fresh_luna_postrun_authorized": False,
    }
    out = HERE / "runtime/native_capture.json"
    write_once(out, capture)
    os.chmod(Path(__file__), 0o444)
    print(json.dumps({"status": capture["status"], "capture_sha256": sha(out), "native_thread_ids": sorted(native_ids), "semantic_error_counts": {entry["assignment_id"]: entry["semantic_error_count_pre_primary"] for entry in entries}}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
