#!/usr/bin/env python3
"""Create exactly one fresh Codex subject task through the local app-server.

This is a disposable controller adapter. It does not render alternative prompts,
score outputs, retry a turn, or write experiment evidence. It prints one
canonical JSON receipt to stdout; the root controller stores that receipt with
apply_patch after independently reopening the rollout.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import select
import subprocess
import sys
import time
from typing import Any


REPO = Path("/mnt/Cursor/PuppetMaster")
LANE = REPO / "tests/agent_packet_restrictions/successor_20260813/model_retest_r7_replication_20260814_v1"
HARNESS = LANE / "r7_replication_harness.py"
REPLICATE_ID = "PW-R7-REPLICATION-20260814.1"
SOURCE_THREAD_ID = "019ffb7d-29ac-7e82-93b3-fff057d7a561"
WRAPPER_SOURCE_THREAD_ID = "019ffbff-994a-76f0-9c06-57bab28b7ee3"
ROUTES = {
    "slot-bravo": ("gpt-5.4-mini", "medium"),
    "slot-charlie": ("gpt-5.6-luna", "medium"),
}


class DriverError(RuntimeError):
    pass


def canonical(value: Any) -> str:
    return json.dumps(value, separators=(",", ":"), ensure_ascii=False)


def send(proc: subprocess.Popen[str], message: dict[str, Any]) -> None:
    assert proc.stdin is not None
    proc.stdin.write(canonical(message) + "\n")
    proc.stdin.flush()


def next_message(proc: subprocess.Popen[str], deadline: float) -> dict[str, Any]:
    assert proc.stdout is not None
    while time.monotonic() < deadline:
        ready, _, _ = select.select([proc.stdout], [], [], min(30.0, max(0.0, deadline - time.monotonic())))
        if not ready:
            continue
        line = proc.stdout.readline()
        if line == "":
            raise DriverError(f"app-server exited before terminal, rc={proc.poll()}")
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            return value
    raise DriverError("app-server event deadline exceeded")


def wait_response(proc: subprocess.Popen[str], request_id: int, deadline: float) -> dict[str, Any]:
    while True:
        message = next_message(proc, deadline)
        if message.get("id") != request_id:
            continue
        if "error" in message:
            raise DriverError(f"request {request_id} failed: {canonical(message['error'])}")
        return message["result"]


def render_semantic_prompt(slot: str, cell: str) -> tuple[str, dict[str, Any]]:
    run = subprocess.run(
        [sys.executable, "-B", str(HARNESS), "render", "--slot", slot, "--cell", cell],
        cwd=REPO,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if run.returncode != 0:
        raise DriverError(f"frozen render failed rc={run.returncode}: {run.stderr.decode(errors='replace')}")
    storage = run.stdout
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"):
        raise DriverError("frozen renderer must have exactly one terminal storage LF")
    payload = storage[:-1]
    return payload.decode("utf-8"), {
        "render_storage_sha256": hashlib.sha256(storage).hexdigest(),
        "render_storage_bytes": len(storage),
        "provider_visible_payload_sha256": hashlib.sha256(payload).hexdigest(),
        "provider_visible_payload_bytes": len(payload),
    }


def rollout_path(thread_id: str) -> Path:
    matches = list((Path("/home/sittingmongoose/.codex/sessions")).rglob(f"*{thread_id}.jsonl"))
    if len(matches) != 1:
        raise DriverError(f"expected one rollout for {thread_id}, found {len(matches)}")
    return matches[0]


def reopen_rollout(thread_id: str, slot: str, cell: str, prompt: str, model: str, effort: str) -> dict[str, Any]:
    path = rollout_path(thread_id)
    storage = path.read_bytes()
    rows = [json.loads(line) for line in storage.splitlines()]
    meta = next(row["payload"] for row in rows if row["type"] == "session_meta")
    turn = next(row["payload"] for row in rows if row["type"] == "turn_context")
    task = next(
        row["payload"]
        for row in rows
        if row["type"] == "event_msg" and row["payload"].get("type") == "task_complete"
    )
    finals = [
        row["payload"]
        for row in rows
        if row["type"] == "response_item"
        and row["payload"].get("type") == "message"
        and row["payload"].get("role") == "assistant"
        and row["payload"].get("phase") == "final_answer"
    ]
    subjects = [
        row["payload"]
        for row in rows
        if row["type"] == "response_item"
        and row["payload"].get("type") == "message"
        and row["payload"].get("role") == "user"
        and row["payload"]["content"][0]["text"].startswith("<codex_delegation>")
    ]
    if len(finals) != 1 or len(subjects) != 1:
        raise DriverError("rollout must contain one subject input and one final answer")
    wrapper = (
        "<codex_delegation>\n"
        f"  <source_thread_id>{WRAPPER_SOURCE_THREAD_ID}</source_thread_id>\n"
        f"  <input>{prompt}</input>\n"
        "</codex_delegation>"
    )
    if subjects[0]["content"][0]["text"] != wrapper:
        raise DriverError("provider-visible subject wrapper drift")
    if meta.get("model_provider") != "openai" or turn.get("model") != model or turn.get("effort") != effort:
        raise DriverError("route identity drift in rollout")
    prohibited = [
        row["payload"].get("type")
        for row in rows
        if row["type"] == "response_item"
        and row["payload"].get("type")
        in {"function_call", "function_call_output", "web_search_call", "computer_tool_call", "image_generation_call"}
    ]
    if prohibited:
        raise DriverError(f"prohibited subject activity: {prohibited}")
    final_text = finals[0]["content"][0]["text"]
    return {
        "rollout_path": str(path),
        "rollout_storage_sha256": hashlib.sha256(storage).hexdigest(),
        "rollout_storage_bytes": len(storage),
        "model_provider": meta["model_provider"],
        "turn_context_model": turn["model"],
        "turn_context_effort": turn["effort"],
        "turn_id": task["turn_id"],
        "started_at_epoch_seconds": task["started_at"],
        "completed_at_epoch_seconds": task["completed_at"],
        "duration_ms": task["duration_ms"],
        "raw_final_output": final_text,
        "prohibited_activity_item_types": prohibited,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--slot", choices=tuple(ROUTES), required=True)
    parser.add_argument("--cell", required=True)
    parser.add_argument("--existing-empty-thread")
    args = parser.parse_args()
    model, effort = ROUTES[args.slot]
    prompt, identities = render_semantic_prompt(args.slot, args.cell)
    wrapper = (
        "<codex_delegation>\n"
        f"  <source_thread_id>{WRAPPER_SOURCE_THREAD_ID}</source_thread_id>\n"
        f"  <input>{prompt}</input>\n"
        "</codex_delegation>"
    )
    proc = subprocess.Popen(
        ["codex", "app-server", "--listen", "stdio://"],
        cwd=REPO,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
    )
    deadline = time.monotonic() + 600.0
    try:
        send(proc, {"method": "initialize", "id": 1, "params": {"clientInfo": {"name": "codex_vscode", "title": "Codex Desktop", "version": "0.147.0"}}})
        wait_response(proc, 1, deadline)
        send(proc, {"method": "initialized", "params": {}})
        if args.existing_empty_thread:
            thread_id = args.existing_empty_thread
            send(proc, {"method": "thread/resume", "id": 2, "params": {"threadId": thread_id, "model": model, "modelProvider": "openai", "cwd": str(REPO), "approvalPolicy": "never", "approvalsReviewer": "user", "sandbox": "danger-full-access", "personality": "friendly"}})
            wait_response(proc, 2, deadline)
        else:
            send(proc, {"method": "thread/start", "id": 2, "params": {"model": model, "modelProvider": "openai", "cwd": str(REPO), "approvalPolicy": "never", "approvalsReviewer": "user", "sandbox": "danger-full-access", "personality": "friendly", "ephemeral": False, "threadSource": "subagent", "allowProviderModelFallback": False}})
            started = wait_response(proc, 2, deadline)
            thread_id = started["thread"]["id"]
        send(proc, {"method": "thread/name/set", "id": 3, "params": {"threadId": thread_id, "name": f"R7 {args.slot} {args.cell}"}})
        wait_response(proc, 3, deadline)
        send(proc, {"method": "turn/start", "id": 4, "params": {"threadId": thread_id, "input": [{"type": "text", "text": wrapper}], "cwd": str(REPO), "approvalPolicy": "never", "approvalsReviewer": "user", "model": model, "effort": effort, "personality": "friendly", "collaborationMode": {"mode": "default", "settings": {"model": model, "reasoning_effort": effort, "developer_instructions": None}}}})
        start_result = wait_response(proc, 4, deadline)
        turn_id = start_result["turn"]["id"]
        terminal = None
        while terminal is None:
            message = next_message(proc, deadline)
            if message.get("method") == "turn/completed":
                candidate = message.get("params", {}).get("turn", {})
                if candidate.get("id") == turn_id:
                    terminal = candidate
        if terminal.get("status") != "completed":
            raise DriverError(f"subject turn terminal was {terminal.get('status')}")
    finally:
        if proc.stdin is not None:
            try:
                proc.stdin.close()
            except OSError:
                pass
        try:
            proc.wait(timeout=15)
        except subprocess.TimeoutExpired:
            proc.terminate()
            proc.wait(timeout=15)
    reopened = reopen_rollout(thread_id, args.slot, args.cell, prompt, model, effort)
    receipt = {
        "schema_id": "pw-r7-direct-appserver-subject-receipt-v1",
        "replicate_id": REPLICATE_ID,
        "slot": args.slot,
        "cell": args.cell,
        "requested_model": model,
        "requested_thinking": effort,
        "provider_effective_model": None,
        "provider_effective_thinking": None,
        "host_id": "remote-ssh-discovered:pm-dev",
        "thread_id": thread_id,
        "turn_id": reopened["turn_id"],
        "status": "completed",
        "fresh_context": True,
        "first_attempt_subject_call": True,
        "retry_count": 0,
        "best_of": False,
        "replacement_result": False,
        **identities,
        **reopened,
        "identity_limitation": "Requested route, openai provider, turn-context model/effort, and pm-dev thread/turn are observable; a separate provider-effective serving snapshot is not exposed.",
    }
    sys.stdout.write(canonical(receipt) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
