#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
NS = ROOT / "master/cross_domain_seams/wave-0001/window-sharding-v2"
SESSIONS = Path.home() / ".codex/sessions"
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def jsonl(path: Path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def session_index():
    found = {}
    prefix = "/root/a005_cross_domain_seam_v2_"
    for path in SESSIONS.rglob("rollout-*.jsonl"):
        try:
            first = json.loads(path.open().readline()).get("payload", {})
        except Exception:
            continue
        agent_path = first.get("agent_path")
        if isinstance(agent_path, str) and agent_path.startswith(prefix):
            if agent_path in found:
                raise RuntimeError(f"duplicate session for {agent_path}")
            found[agent_path] = (path, first)
    return found


def terminal_proof(path: Path, meta: dict):
    rows = jsonl(path)
    started = [x["payload"] for x in rows if x.get("type") == "event_msg" and x.get("payload", {}).get("type") == "task_started"]
    complete = [x["payload"] for x in rows if x.get("type") == "event_msg" and x.get("payload", {}).get("type") == "task_complete"]
    contexts = [x["payload"] for x in rows if x.get("type") == "turn_context"]
    if len(started) != 1 or len(complete) != 1 or len(contexts) < 1:
        raise RuntimeError(f"terminal cardinality {meta.get('agent_path')}")
    turn_id = started[0].get("turn_id")
    if complete[0].get("turn_id") != turn_id or complete[0].get("last_agent_message") != "PMR1":
        raise RuntimeError(f"terminal PMR1 mismatch {meta.get('agent_path')}")
    if contexts[0].get("model") != "gpt-5.6-sol" or contexts[0].get("effort") != "xhigh":
        raise RuntimeError(f"model lane mismatch {meta.get('agent_path')}")
    if meta.get("parent_thread_id") != CONTROLLER:
        raise RuntimeError(f"parent mismatch {meta.get('agent_path')}")
    return turn_id


def main():
    manifests = []
    for cohort_num in (1, 2, 3):
        manifests.extend(jsonl(NS / f"cohorts/cohort-{cohort_num:04d}/manifest.jsonl"))
    if len(manifests) != 48:
        raise RuntimeError("manifest cardinality")
    sessions = session_index()
    payloads = []
    seen_native, seen_turn = set(), set()
    for row in manifests:
        aid = row["assignment_id"]
        agent_path = row["prospective_agent_path"]
        if agent_path not in sessions:
            raise RuntimeError(f"missing native session {aid}")
        session_path, meta = sessions[agent_path]
        native_id = meta.get("id")
        turn_id = terminal_proof(session_path, meta)
        if not native_id or native_id in seen_native or turn_id in seen_turn:
            raise RuntimeError(f"identity uniqueness {aid}")
        seen_native.add(native_id); seen_turn.add(turn_id)
        intent_path = Path(row["dispatch_intent_path"])
        intent = json.loads(intent_path.read_text())
        output = Path(row["output_directory"])
        entries = sorted(p.name for p in output.iterdir())
        if entries != ["result.json"]:
            raise RuntimeError(f"output confinement {aid}: {entries}")
        result = output / "result.json"
        receipt = Path(intent["dispatch_receipt_ref"])
        if receipt.exists():
            raise RuntimeError(f"receipt already exists {aid}")
        cohort = row["cohort_id"]
        activation_name = "activation.v2.json" if cohort in {"cohort-0001", "cohort-0002"} else "activation.v3.json"
        activation = NS / "cohorts" / cohort / activation_name
        if not activation.is_file():
            raise RuntimeError(f"activation missing {aid}")
        payload = {
            "schema_version": "cross-domain-seam-window-v2-dispatch-receipt-v1",
            "audit_id": intent["audit_id"],
            "wave_id": intent["wave_id"],
            "cohort_id": cohort,
            "assignment_id": aid,
            "attempt_id": intent["attempt_id"],
            "controller_thread_id": CONTROLLER,
            "agent_path": agent_path,
            "task_thread_id": agent_path,
            "native_child_thread_id": native_id,
            "native_turn_id": turn_id,
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "fresh_child": True,
            "fork_turns": "none",
            "packet_path": row["packet_path"],
            "packet_sha256": row["packet_sha256"],
            "dispatch_intent_path": str(intent_path),
            "dispatch_intent_sha256": sha(intent_path),
            "cohort_activation_path": str(activation),
            "cohort_activation_sha256": sha(activation),
            "result_path": str(result),
            "result_sha256": sha(result),
            "terminal_status": "completed",
            "terminal_response": "PMR1",
        }
        payloads.append((receipt, payload, session_path))
    for receipt, payload, _ in payloads:
        raw = (json.dumps(payload, indent=2, sort_keys=True) + "\n").encode()
        receipt.parent.mkdir(parents=True, exist_ok=True)
        fd = os.open(receipt, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
        with os.fdopen(fd, "wb") as stream:
            stream.write(raw)
    summary = [{"assignment_id": payload["assignment_id"], "agent_path": payload["agent_path"], "native_child_thread_id": payload["native_child_thread_id"], "native_turn_id": payload["native_turn_id"], "terminal": "PMR1", "result_files": 1, "receipt_sha256": sha(receipt)} for receipt, payload, _ in payloads]
    print(json.dumps({"status": "closed", "assignments": 48, "results": 48, "receipts": 48, "mapping": summary}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
