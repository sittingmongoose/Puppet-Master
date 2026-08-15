#!/usr/bin/env python3
"""Dispatch exactly one fresh R8 subject task and print one typed receipt.

This disposable adapter delegates prompt compilation and cell admission to the
frozen R8 harness.  It never scores, retries, repairs, or writes evidence.
Candidate and run identities are controller metadata only and are never added
to the provider-visible semantic payload.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import select
import subprocess
import sys
import time
from typing import Any


REPO = Path("/mnt/Cursor/PuppetMaster")
LANE = REPO / "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v1"
HARNESS = LANE / "r8_harness.py"
CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-1"
WRAPPER_SOURCE_THREAD_ID = "019ffbff-994a-76f0-9c06-57bab28b7ee3"
ROUTES = {
    "slot-alpha": ("gpt-5.4-mini", "xhigh"),
    "slot-bravo": ("gpt-5.4-mini", "medium"),
    "slot-charlie": ("gpt-5.6-luna", "medium"),
}
RUN_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")


class DriverError(RuntimeError):
    """A typed controller failure; never a semantic subject result."""


PENDING: list[dict[str, Any]] = []


def canonical(value: Any) -> str:
    return json.dumps(value, separators=(",", ":"), ensure_ascii=False)


def send(proc: subprocess.Popen[str], message: dict[str, Any]) -> None:
    assert proc.stdin is not None
    proc.stdin.write(canonical(message) + "\n")
    proc.stdin.flush()


def next_message(proc: subprocess.Popen[str], deadline: float) -> dict[str, Any]:
    assert proc.stdout is not None
    while time.monotonic() < deadline:
        ready, _, _ = select.select(
            [proc.stdout], [], [], min(30.0, max(0.0, deadline - time.monotonic()))
        )
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


def wait_response(
    proc: subprocess.Popen[str], request_id: int, deadline: float
) -> dict[str, Any]:
    for index, pending in enumerate(PENDING):
        if pending.get("id") == request_id:
            message = PENDING.pop(index)
            break
    else:
        while True:
            message = next_message(proc, deadline)
            if message.get("id") != request_id:
                PENDING.append(message)
                continue
            break
    if "error" in message:
        raise DriverError(f"request {request_id} failed: {canonical(message['error'])}")
    result = message.get("result")
    if not isinstance(result, dict):
        raise DriverError(f"request {request_id} returned a non-object result")
    return result


def render_semantic_prompt(
    slot: str, cell: str, execution_root: str
) -> tuple[str, dict[str, Any]]:
    """Use the harness itself as the closed-world cell admission authority."""
    run = subprocess.run(
        [
            sys.executable,
            "-B",
            str(HARNESS),
            "render",
            "--slot",
            slot,
            "--cell",
            cell,
            "--execution-root",
            execution_root,
        ],
        cwd=REPO,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if run.returncode != 0:
        detail = run.stderr.decode(errors="replace").strip()
        raise DriverError(f"frozen render failed rc={run.returncode}: {detail}")
    storage = run.stdout
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"):
        raise DriverError("frozen renderer must have exactly one terminal storage LF")
    payload = storage[:-1]
    try:
        prompt = payload.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise DriverError("frozen renderer output is not UTF-8") from exc
    return prompt, {
        "render_storage_sha256": hashlib.sha256(storage).hexdigest(),
        "render_storage_bytes": len(storage),
        "provider_visible_payload_sha256": hashlib.sha256(payload).hexdigest(),
        "provider_visible_payload_bytes": len(payload),
    }


def wait_rollout_terminal(
    proc: subprocess.Popen[str], thread_id: str, turn_id: str, deadline: float
) -> dict[str, Any]:
    assert proc.stdout is not None
    while time.monotonic() < deadline:
        while select.select([proc.stdout], [], [], 0.0)[0]:
            line = proc.stdout.readline()
            if line == "":
                break
        matches = list(Path("/home/sittingmongoose/.codex/sessions").rglob(f"*{thread_id}.jsonl"))
        if len(matches) == 1:
            try:
                rows = [json.loads(line) for line in matches[0].read_bytes().splitlines()]
            except (json.JSONDecodeError, OSError):
                rows = []
            for row in rows:
                payload = row.get("payload", {})
                if (
                    row.get("type") == "event_msg"
                    and payload.get("type") == "task_complete"
                    and payload.get("turn_id") == turn_id
                ):
                    return {"id": turn_id, "status": "completed"}
        time.sleep(0.05)
    raise DriverError("rollout task_complete deadline exceeded")


def rollout_path(thread_id: str) -> Path:
    matches = list(Path("/home/sittingmongoose/.codex/sessions").rglob(f"*{thread_id}.jsonl"))
    if len(matches) != 1:
        raise DriverError(f"expected one rollout for {thread_id}, found {len(matches)}")
    return matches[0]


def reopen_rollout(
    thread_id: str, turn_id: str, prompt: str, model: str, effort: str
) -> dict[str, Any]:
    path = rollout_path(thread_id)
    storage = path.read_bytes()
    rows = [json.loads(line) for line in storage.splitlines()]
    metas = [row["payload"] for row in rows if row.get("type") == "session_meta"]
    turns = [
        row["payload"]
        for row in rows
        if row.get("type") == "turn_context" and row.get("payload", {}).get("turn_id") == turn_id
    ]
    tasks = [
        row["payload"]
        for row in rows
        if row.get("type") == "event_msg"
        and row.get("payload", {}).get("type") == "task_complete"
        and row.get("payload", {}).get("turn_id") == turn_id
    ]
    finals = [
        row["payload"]
        for row in rows
        if row.get("type") == "response_item"
        and row.get("payload", {}).get("type") == "message"
        and row["payload"].get("role") == "assistant"
        and row["payload"].get("phase") == "final_answer"
    ]
    subjects = [
        row["payload"]
        for row in rows
        if row.get("type") == "response_item"
        and row.get("payload", {}).get("type") == "message"
        and row["payload"].get("role") == "user"
        and row["payload"].get("content")
        and row["payload"]["content"][0].get("text", "").startswith("<codex_delegation>")
    ]
    if not (len(metas) == len(turns) == len(tasks) == len(finals) == len(subjects) == 1):
        raise DriverError("rollout must contain one matching route, input, terminal, and final answer")
    meta, turn, task = metas[0], turns[0], tasks[0]
    wrapper = (
        "<codex_delegation>\n"
        f"  <source_thread_id>{WRAPPER_SOURCE_THREAD_ID}</source_thread_id>\n"
        f"  <input>{prompt}</input>\n"
        "</codex_delegation>"
    )
    if subjects[0]["content"][0]["text"] != wrapper:
        raise DriverError("provider-visible subject wrapper drift")
    if meta.get("model_provider") != "openai":
        raise DriverError("provider identity drift in rollout")
    if turn.get("model") != model or turn.get("effort") != effort:
        raise DriverError("route identity drift in rollout")
    prohibited = [
        row["payload"].get("type")
        for row in rows
        if row.get("type") == "response_item"
        and row.get("payload", {}).get("type")
        in {
            "function_call",
            "function_call_output",
            "web_search_call",
            "computer_tool_call",
            "image_generation_call",
        }
    ]
    if prohibited:
        raise DriverError(f"prohibited subject activity: {prohibited}")
    final_content = finals[0].get("content")
    if not isinstance(final_content, list) or len(final_content) != 1:
        raise DriverError("subject final answer must contain exactly one content item")
    final_text = final_content[0].get("text")
    if not isinstance(final_text, str):
        raise DriverError("subject final answer is not text")
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


def stop_app_server(proc: subprocess.Popen[str] | None) -> None:
    if proc is None:
        return
    if proc.stdin is not None:
        try:
            proc.stdin.close()
        except OSError:
            pass
    try:
        proc.wait(timeout=15)
    except subprocess.TimeoutExpired:
        proc.terminate()
        try:
            proc.wait(timeout=15)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait(timeout=15)


def execute(args: argparse.Namespace) -> dict[str, Any]:
    if not RUN_ID_RE.fullmatch(args.run_id):
        raise DriverError("run-id must match [A-Za-z0-9][A-Za-z0-9._-]{0,127}")
    model, effort = ROUTES[args.slot]
    args._phase = "frozen_render"
    prompt, identities = render_semantic_prompt(
        args.slot, args.cell, args.execution_root
    )
    args._identities = identities
    wrapper = (
        "<codex_delegation>\n"
        f"  <source_thread_id>{WRAPPER_SOURCE_THREAD_ID}</source_thread_id>\n"
        f"  <input>{prompt}</input>\n"
        "</codex_delegation>"
    )
    proc: subprocess.Popen[str] | None = None
    thread_id: str | None = None
    turn_id: str | None = None
    args._phase = "app_server_start"
    try:
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
        deadline = time.monotonic() + args.timeout_seconds
        args._phase = "initialize"
        send(proc, {"method": "initialize", "id": 1, "params": {"clientInfo": {"name": "codex_vscode", "title": "Codex Desktop", "version": "0.147.0"}, "capabilities": {"experimentalApi": True}}})
        wait_response(proc, 1, deadline)
        send(proc, {"method": "initialized", "params": {}})
        args._phase = "thread_start"
        send(proc, {"method": "thread/start", "id": 2, "params": {"model": model, "modelProvider": "openai", "cwd": str(REPO), "approvalPolicy": "never", "approvalsReviewer": "user", "sandbox": "danger-full-access", "personality": "friendly", "ephemeral": False, "threadSource": "subagent", "allowProviderModelFallback": False}})
        started = wait_response(proc, 2, deadline)
        thread_id = started["thread"]["id"]
        args._thread_id = thread_id
        args._phase = "thread_name"
        send(proc, {"method": "thread/name/set", "id": 3, "params": {"threadId": thread_id, "name": f"R8 {CANDIDATE_ID} {args.run_id} {args.slot} {args.cell}"}})
        wait_response(proc, 3, deadline)
        args._phase = "turn_start"
        args._subject_call_started = True
        send(proc, {"method": "turn/start", "id": 4, "params": {"threadId": thread_id, "input": [{"type": "text", "text": wrapper}], "cwd": str(REPO), "approvalPolicy": "never", "approvalsReviewer": "user", "model": model, "effort": effort, "personality": "friendly", "collaborationMode": {"mode": "default", "settings": {"model": model, "reasoning_effort": effort, "developer_instructions": None}}}})
        start_result = wait_response(proc, 4, deadline)
        turn_id = start_result["turn"]["id"]
        args._turn_id = turn_id
        args._phase = "subject_execution"
        terminal = wait_rollout_terminal(proc, thread_id, turn_id, deadline)
        if terminal.get("status") != "completed":
            raise DriverError(f"subject turn terminal was {terminal.get('status')}")
    finally:
        stop_app_server(proc)
    args._phase = "rollout_reopen"
    assert thread_id is not None and turn_id is not None
    reopened = reopen_rollout(thread_id, turn_id, prompt, model, effort)
    return {
        "schema_id": "pw-r8-direct-appserver-subject-receipt-v1",
        "candidate_id": CANDIDATE_ID,
        "run_id": args.run_id,
        "slot": args.slot,
        "cell": args.cell,
        "execution_root": args.execution_root,
        "requested_model": model,
        "requested_thinking": effort,
        "provider_effective_model": None,
        "provider_effective_thinking": None,
        "host_id": "remote-ssh-discovered:pm-dev",
        "thread_id": thread_id,
        "turn_id": reopened["turn_id"],
        "status": "completed",
        "subject_call_started": True,
        "fresh_context": True,
        "first_attempt_subject_call": True,
        "retry_count": 0,
        "best_of": False,
        "replacement_result": False,
        **identities,
        **reopened,
        "identity_limitation": "Requested route, openai provider, turn-context model/effort, and pm-dev thread/turn are observable; a separate provider-effective serving snapshot is not exposed.",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--slot", choices=tuple(ROUTES), required=True)
    parser.add_argument("--cell", required=True)
    parser.add_argument("--execution-root", required=True)
    parser.add_argument("--timeout-seconds", type=float, default=600.0)
    args = parser.parse_args()
    if args.timeout_seconds <= 0 or args.timeout_seconds > 3600:
        parser.error("--timeout-seconds must be greater than zero and at most 3600")
    args._phase = "argument_validation"
    args._subject_call_started = False
    args._thread_id = None
    args._turn_id = None
    args._identities = {}
    try:
        receipt = execute(args)
        exit_code = 0
    except Exception as exc:  # typed fail-closed boundary for disposable control-plane errors
        model, effort = ROUTES[args.slot]
        receipt = {
            "schema_id": "pw-r8-direct-appserver-controller-invalid-v1",
            "candidate_id": CANDIDATE_ID,
            "run_id": args.run_id,
            "slot": args.slot,
            "cell": args.cell,
            "execution_root": args.execution_root,
            "requested_model": model,
            "requested_thinking": effort,
            "status": "controller_invalid",
            "phase": args._phase,
            "subject_call_started": args._subject_call_started,
            "thread_id": args._thread_id,
            "turn_id": args._turn_id,
            **args._identities,
            "error_type": type(exc).__name__,
            "error": str(exc),
            "empirical_credit": False,
            "retry_permitted_by_driver": False,
        }
        exit_code = 2
    sys.stdout.write(canonical(receipt) + "\n")
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
