#!/usr/bin/env python3
"""Tiny standalone transport backend for the R9 stabilization controller.

``invoke`` is deliberately data-only from the experiment's point of view: it
does not create or mutate controller evidence.  Synthetic mode is entirely
local.  Actual mode owns one fresh Codex app-server process, one fresh thread,
and one first-attempt turn, waits synchronously for its rollout task_complete,
reopens that rollout, then reaps the child.  It never retries or substitutes a
result.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import re
import select
import subprocess
import sys
import time
from datetime import datetime, timedelta, timezone
from typing import Any

sys.dont_write_bytecode = True

REQUEST_SCHEMA_ID = "pw-r9-backend-request-v1"
RESULT_SCHEMA_ID = "pw-r9-backend-result-v1"
ROUTES = {
    "slot-alpha": {"slot": "slot-alpha", "model": "gpt-5.4-mini", "thinking": "xhigh"},
    "slot-bravo": {"slot": "slot-bravo", "model": "gpt-5.4-mini", "thinking": "medium"},
    "slot-charlie": {"slot": "slot-charlie", "model": "gpt-5.6-luna", "thinking": "medium"},
}
SCENARIOS = {
    "pass": "immediate",
    "immediate": "immediate",
    "yielded": "yielded_multi_poll",
    "yielded_multi_poll": "yielded_multi_poll",
    "yielded-multi-poll-complete-stdout": "yielded_multi_poll",
    "nonzero": "nonzero_exit",
    "nonzero_exit": "nonzero_exit",
    "nonzero-exit": "nonzero_exit",
    "missing": "missing_output",
    "missing_output": "missing_output",
    "missing-output": "missing_output",
    "lf_only_output": "lf_only_output",
    "lf-only-output": "lf_only_output",
    "partial": "partial_output",
    "partial_output": "partial_output",
    "partial-output": "partial_output",
    "malformed": "malformed_output",
    "malformed_output": "malformed_output",
    "malformed-output": "malformed_output",
    "abrupt_stop": "abrupt_stop_before_task_complete",
    "abrupt_stop_before_task_complete": "abrupt_stop_before_task_complete",
    "abrupt-stop-during-backend": "abrupt_stop_before_task_complete",
    "abrupt_stop_after_task_complete": "abrupt_stop_after_task_complete",
}
HEX64 = re.compile(r"^[0-9a-f]{64}$")
TOKEN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,255}$")
SAFE_RESPONSE_ITEM_TYPES = frozenset({"message", "reasoning"})
REPO = Path(__file__).resolve().parents[5]
IDENTITY_LIMITATION = (
    "Codex app-server exposes a fresh thread_id and its sole turn_id but no "
    "separate platform task_id. task_id is therefore the stable derived value "
    "codex-task:<thread_id>, not a separately exposed platform identity; "
    "freshness is proven by the new thread plus its one new turn and the request nonce."
)


class BackendError(RuntimeError):
    """The admitted transport could not produce a valid backend envelope."""


def _canonical(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _require_request(request: Any) -> dict[str, Any]:
    if not isinstance(request, dict):
        raise BackendError("request must be an object")
    required = {
        "schema_id", "mode", "run_id", "slot", "cell", "index", "route",
        "nonce", "provider_input_utf8", "provider_input_sha256",
        "provider_input_bytes", "attempt_sha256", "attempt_bytes",
    }
    optional = {
        "scenario", "synthetic_scenario", "synthetic_expected_output_utf8",
        "synthetic_response_utf8", "synthetic_poll_count", "synthetic_returncode",
        "timeout_seconds",
    }
    if set(request) - required - optional:
        raise BackendError("request has unsupported fields")
    if not required.issubset(request):
        raise BackendError("request is missing required fields")
    if request["schema_id"] != REQUEST_SCHEMA_ID:
        raise BackendError("request schema_id mismatch")
    if request["mode"] not in {"synthetic", "actual"}:
        raise BackendError("mode must be synthetic or actual")
    for name in ("run_id", "slot", "cell"):
        if not isinstance(request[name], str) or not TOKEN.fullmatch(request[name]):
            raise BackendError(f"invalid {name}")
    if isinstance(request["index"], bool) or not isinstance(request["index"], int) or request["index"] < 0:
        raise BackendError("index must be a non-negative integer")
    if request["slot"] not in ROUTES or request["route"] != ROUTES[request["slot"]]:
        raise BackendError("route is not the exact frozen slot route")
    if not isinstance(request["nonce"], str) or not HEX64.fullmatch(request["nonce"]):
        raise BackendError("nonce must be lowercase SHA-256 text")
    if not isinstance(request["provider_input_utf8"], str):
        raise BackendError("provider_input_utf8 must be text")
    provider = request["provider_input_utf8"].encode("utf-8")
    if request["provider_input_sha256"] != _sha(provider) or request["provider_input_bytes"] != len(provider):
        raise BackendError("provider input digest or byte count mismatch")
    if not isinstance(request["attempt_sha256"], str) or not HEX64.fullmatch(request["attempt_sha256"]):
        raise BackendError("attempt_sha256 must be lowercase SHA-256 text")
    if (isinstance(request["attempt_bytes"], bool) or
            not isinstance(request["attempt_bytes"], int) or request["attempt_bytes"] <= 0):
        raise BackendError("attempt_bytes must be positive")
    for name in ("synthetic_expected_output_utf8", "synthetic_response_utf8"):
        if name in request and not isinstance(request[name], str):
            raise BackendError(f"{name} must be text")
    if "synthetic_poll_count" in request and (
        isinstance(request["synthetic_poll_count"], bool)
        or not isinstance(request["synthetic_poll_count"], int)
        or not 2 <= request["synthetic_poll_count"] <= 1000
    ):
        raise BackendError("synthetic_poll_count must be in [2,1000]")
    if "synthetic_returncode" in request and (
        isinstance(request["synthetic_returncode"], bool)
        or not isinstance(request["synthetic_returncode"], int)
        or request["synthetic_returncode"] == 0
    ):
        raise BackendError("synthetic_returncode must be a nonzero integer")
    if "timeout_seconds" in request and (
        isinstance(request["timeout_seconds"], bool)
        or not isinstance(request["timeout_seconds"], (int, float))
        or not 1 <= request["timeout_seconds"] <= 3600
    ):
        raise BackendError("timeout_seconds must be in [1,3600]")
    return request


def _identity_seed(request: dict[str, Any]) -> bytes:
    return _canonical({
        "schema_id": "pw-r9-synthetic-identity-seed-v1",
        "run_id": request["run_id"],
        "slot": request["slot"],
        "cell": request["cell"],
        "index": request["index"],
        "nonce": request["nonce"],
        "provider_input_sha256": request["provider_input_sha256"],
        "attempt_sha256": request["attempt_sha256"],
    })


def _synthetic_identity(seed: bytes, kind: str) -> str:
    return f"synthetic-{kind}-{_sha(kind.encode('ascii') + b':' + seed)[:32]}"


def _synthetic_time(seed: bytes, milliseconds: int) -> str:
    # Stable evidence times make repeated clean traversals byte-comparable while
    # remaining unique enough to distinguish nonce-bound rows.
    offset = int(_sha(seed)[:8], 16) % (20 * 365 * 24 * 60 * 60)
    value = datetime(2000, 1, 1, tzinfo=timezone.utc) + timedelta(seconds=offset, milliseconds=milliseconds)
    return value.isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _synthetic(request: dict[str, Any]) -> dict[str, Any]:
    named = request.get("scenario", request.get("synthetic_scenario", "pass"))
    if not isinstance(named, str) or named not in SCENARIOS:
        raise BackendError("unknown synthetic scenario")
    scenario = SCENARIOS[named]
    expected = request.get("synthetic_expected_output_utf8", "")
    response = request.get("synthetic_response_utf8", expected)
    if scenario in {"immediate", "yielded_multi_poll", "nonzero_exit", "abrupt_stop_after_task_complete"}:
        stdout = response
    elif scenario == "missing_output" or scenario == "abrupt_stop_before_task_complete":
        stdout = ""
    elif scenario == "lf_only_output":
        stdout = "\n"
    elif scenario == "partial_output":
        stdout = response[: max(1, len(response) // 2)] if response else "partial"
    else:
        stdout = request.get("synthetic_response_utf8", "{malformed-output\n")

    seed = _identity_seed(request)
    task_id = _synthetic_identity(seed, "task")
    thread_id = _synthetic_identity(seed, "thread")
    turn_id = _synthetic_identity(seed, "turn")
    count = request.get("synthetic_poll_count", 4 if scenario == "yielded_multi_poll" else 2)
    if scenario in {"immediate", "missing_output", "lf_only_output", "partial_output", "malformed_output"}:
        states = ["TASK_COMPLETE_OBSERVED"]
        terminal_status, returncode, stderr = "TASK_COMPLETE", 0, ""
    elif scenario == "yielded_multi_poll":
        states = ["RUNNING"] * (count - 1) + ["TASK_COMPLETE_OBSERVED"]
        terminal_status, returncode, stderr = "TASK_COMPLETE", 0, ""
    elif scenario == "nonzero_exit":
        states = ["RUNNING", "PROCESS_EXITED_NONZERO"]
        terminal_status = "PROCESS_EXIT_NONZERO"
        returncode = request.get("synthetic_returncode", 17)
        stderr = "synthetic process exited nonzero before task_complete\n"
    elif scenario == "abrupt_stop_before_task_complete":
        states = ["RUNNING", "STOP_REQUESTED", "PROCESS_EXITED_BEFORE_TASK_COMPLETE"]
        terminal_status, returncode = "PROCESS_EXIT_BEFORE_TASK_COMPLETE", -15
        stderr = "synthetic abrupt stop before task_complete\n"
    else:
        states = ["RUNNING", "TASK_COMPLETE_OBSERVED", "STOP_REQUESTED_AFTER_TASK_COMPLETE",
                  "PROCESS_EXITED_AFTER_TASK_COMPLETE"]
        terminal_status, returncode = "TASK_COMPLETE", -15
        stderr = "synthetic abrupt stop after task_complete\n"

    polls = [
        {"poll_index": index, "observed_utc": _synthetic_time(seed, index * 10),
         "state": state, "process_returncode": returncode if index == len(states) - 1 else None,
         "rollout_match_count": 1,
         "task_complete_match_count": 1 if "TASK_COMPLETE" in state else 0}
        for index, state in enumerate(states)
    ]
    completed = any("TASK_COMPLETE" in state for state in states)
    started_utc = _synthetic_time(seed, 0)
    ended_utc = _synthetic_time(seed, max(1, len(states) - 1) * 10)
    process = {
        "kind": "synthetic-in-process",
        "pid": None,
        "started_utc": started_utc,
        "ended_utc": ended_utc,
        "terminal_reason": terminal_status,
        "scenario": scenario,
        "poll_count": len(polls),
        "live_poll_count": sum(row["state"] == "RUNNING" for row in polls),
        "polls": polls,
        "task_complete_observed": completed,
        "task_terminal": ({"type": "task_complete", "turn_id": turn_id,
                           "synthetic": True, "observed_utc": ended_utc} if completed else None),
        "child_reaped": True,
        "reap_action": "synthetic-none",
        "protocol_stdout_sha256": _sha(b""),
        "protocol_stdout_bytes": 0,
        "stderr_sha256": _sha(stderr.encode("utf-8")),
        "stderr_bytes": len(stderr.encode("utf-8")),
    }
    return {
        "schema_id": RESULT_SCHEMA_ID,
        "mode": "synthetic",
        "terminal": True,
        "nonce": request["nonce"],
        "resolved_route": request["route"],
        "provider_input_sha256": request["provider_input_sha256"],
        "provider_input_bytes": request["provider_input_bytes"],
        "task_id": task_id,
        "thread_id": thread_id,
        "turn_id": turn_id,
        "returncode": returncode,
        "stdout_utf8": stdout,
        "stderr_utf8": stderr,
        "process": process,
        "dispatch_count": 1,
        "retry_count": 0,
        "best_of": False,
        "replacement_result": False,
        "terminal_status": terminal_status,
        "first_attempt": True,
        "fresh_context": True,
        "provider_model_fallback_allowed": False,
        "task_identity_basis": "synthetic_nonce_bound_distinct_identities",
        "task_identity_kind": "SYNTHETIC_DISTINCT_IDENTITY",
        "identity_limitation": None,
        "output_capture": {
            "status": "PRESENT" if stdout else "MISSING",
            "sha256": _sha(stdout.encode("utf-8")),
            "bytes": len(stdout.encode("utf-8")),
        },
        "prohibited_activity_observations": {
            "present": False,
            "item_count": 0,
            "item_types": [],
            "items": [],
            "items_sha256": _sha(b"[]"),
            "items_bytes": 2,
        },
        "rollout": {
            "kind": "synthetic-no-durable-rollout",
            "path": None,
            "storage_sha256": None,
            "storage_bytes": 0,
            "task_started": {"type": "task_started", "turn_id": turn_id, "synthetic": True},
            "task_complete": process["task_terminal"],
        },
    }


class _Protocol:
    def __init__(self, process: subprocess.Popen[bytes]) -> None:
        self.process = process
        self.messages: list[dict[str, Any]] = []
        self.stdout = bytearray()
        self.stderr = bytearray()

    def poll_io(self, timeout: float) -> None:
        streams = [stream for stream in (self.process.stdout, self.process.stderr) if stream is not None]
        if not streams:
            return
        ready, _, _ = select.select(streams, [], [], max(0.0, timeout))
        for stream in ready:
            line = stream.readline()
            if not line:
                continue
            if stream is self.process.stderr:
                self.stderr.extend(line)
                continue
            self.stdout.extend(line)
            try:
                value = json.loads(line)
            except (UnicodeDecodeError, json.JSONDecodeError):
                continue
            if isinstance(value, dict):
                self.messages.append(value)

    def send(self, message: dict[str, Any]) -> None:
        if self.process.stdin is None:
            raise BackendError("app-server stdin unavailable")
        self.process.stdin.write(_canonical(message) + b"\n")
        self.process.stdin.flush()

    def response(self, request_id: int, deadline: float) -> dict[str, Any]:
        while time.monotonic() < deadline:
            for index, message in enumerate(self.messages):
                if message.get("id") != request_id:
                    continue
                self.messages.pop(index)
                if "error" in message:
                    raise BackendError(f"app-server request {request_id} failed")
                result = message.get("result")
                if not isinstance(result, dict):
                    raise BackendError(f"app-server request {request_id} returned non-object")
                return result
            if self.process.poll() is not None:
                raise BackendError(f"app-server exited during request {request_id}")
            self.poll_io(min(0.25, deadline - time.monotonic()))
        raise BackendError(f"app-server request {request_id} timed out")

    def drain(self) -> None:
        for _ in range(10000):
            streams = [stream for stream in (self.process.stdout, self.process.stderr) if stream is not None]
            if not streams or not select.select(streams, [], [], 0.0)[0]:
                break
            self.poll_io(0.0)


def _sessions_root() -> Path:
    configured = os.environ.get("CODEX_HOME")
    return (Path(configured) if configured else Path.home() / ".codex") / "sessions"


def _session_matches(thread_id: str) -> list[Path]:
    root = _sessions_root()
    return sorted(root.rglob(f"*{thread_id}.jsonl")) if root.is_dir() else []


def _parse_in_progress_rollout(path: Path) -> tuple[bytes, list[dict[str, Any]]]:
    storage = path.read_bytes()
    lines = storage.split(b"\n")
    complete = lines[:-1] if not storage.endswith(b"\n") else lines[:-1]
    rows: list[dict[str, Any]] = []
    for line in complete:
        if not line:
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            raise BackendError("rollout contains malformed completed JSONL row") from exc
        if not isinstance(value, dict):
            raise BackendError("rollout JSONL row is not an object")
        rows.append(value)
    return storage, rows


def _matching_events(rows: list[dict[str, Any]], event_type: str, turn_id: str) -> list[dict[str, Any]]:
    return [
        row["payload"] for row in rows
        if row.get("type") == "event_msg"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == event_type
        and row["payload"].get("turn_id") == turn_id
    ]


def _wait_task_complete(
    protocol: _Protocol, thread_id: str, turn_id: str, deadline: float,
    polls: list[dict[str, Any]],
) -> Path:
    rollout_path: Path | None = None
    while time.monotonic() < deadline:
        protocol.poll_io(0.05)
        matches = _session_matches(thread_id) if rollout_path is None else [rollout_path]
        complete_count = 0
        if len(matches) == 1:
            rollout_path = matches[0]
            _, rows = _parse_in_progress_rollout(rollout_path)
            complete_count = len(_matching_events(rows, "task_complete", turn_id))
        polls.append({
            "poll_index": len(polls),
            "observed_utc": _utc_now(),
            "state": "TASK_COMPLETE_OBSERVED" if complete_count == 1 else "RUNNING",
            "process_returncode": protocol.process.poll(),
            "rollout_match_count": len(matches),
            "task_complete_match_count": complete_count,
        })
        if len(matches) > 1:
            raise BackendError("more than one rollout matches the fresh thread")
        if complete_count == 1 and rollout_path is not None:
            return rollout_path
        if complete_count > 1:
            raise BackendError("multiple task_complete events match the fresh turn")
        if protocol.process.poll() is not None:
            raise BackendError("app-server exited before rollout task_complete")
    raise BackendError("rollout task_complete deadline exceeded")


def _reopen_rollout(
    path: Path, thread_id: str, turn_id: str, provider_input: str,
    model: str, thinking: str,
) -> dict[str, Any]:
    storage = path.read_bytes()
    if not storage.endswith(b"\n"):
        raise BackendError("closed rollout lacks terminal LF")
    try:
        rows = [json.loads(line) for line in storage.splitlines()]
    except json.JSONDecodeError as exc:
        raise BackendError("closed rollout is not parseable JSONL") from exc
    if not all(isinstance(row, dict) for row in rows):
        raise BackendError("closed rollout contains a non-object row")
    metas = [row["payload"] for row in rows if row.get("type") == "session_meta" and isinstance(row.get("payload"), dict)]
    turns = [
        row["payload"] for row in rows
        if row.get("type") == "turn_context" and isinstance(row.get("payload"), dict)
        and row["payload"].get("turn_id") == turn_id
    ]
    starts = _matching_events(rows, "task_started", turn_id)
    completes = _matching_events(rows, "task_complete", turn_id)
    inputs = [
        row["payload"] for row in rows
        if row.get("type") == "response_item" and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "message" and row["payload"].get("role") == "user"
    ]
    if not (len(metas) == len(turns) == len(starts) == len(completes) == len(inputs) == 1):
        raise BackendError("rollout identity or terminal cardinality is uncertain")
    content = inputs[0].get("content")
    if (not isinstance(content, list) or len(content) != 1 or
            not isinstance(content[0], dict) or content[0].get("text") != provider_input):
        raise BackendError("rollout does not preserve the sole exact provider input")
    if metas[0].get("model_provider") != "openai":
        raise BackendError("rollout model provider drift")
    if turns[0].get("model") != model or turns[0].get("effort") != thinking:
        raise BackendError("rollout requested route drift")
    if completes[0].get("turn_id") != turn_id:
        raise BackendError("rollout terminal turn drift")

    finals = [
        row["payload"] for row in rows
        if row.get("type") == "response_item" and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "message"
        and row["payload"].get("role") == "assistant"
        and row["payload"].get("phase") == "final_answer"
    ]
    prohibited: list[Any] = []
    prohibited_types: list[str] = []
    for row in rows:
        if row.get("type") != "response_item":
            continue
        payload = row.get("payload")
        item_type = payload.get("type") if isinstance(payload, dict) else None
        if not isinstance(item_type, str) or item_type not in SAFE_RESPONSE_ITEM_TYPES:
            prohibited.append(payload)
            prohibited_types.append(item_type if isinstance(item_type, str) else "<missing-or-invalid-type>")
    stdout = ""
    output_status = "MISSING"
    raw_text: str | None = None
    normalization = "NOT_APPLIED_NO_SINGLE_TEXT"
    if len(finals) == 1:
        final_content = finals[0].get("content")
        if (isinstance(final_content, list) and len(final_content) == 1
                and isinstance(final_content[0], dict)
                and final_content[0].get("type") == "output_text"
                and isinstance(final_content[0].get("text"), str)):
            raw_text = final_content[0]["text"]
            if raw_text.endswith("\n"):
                stdout = raw_text
                normalization = "UNCHANGED_TERMINAL_LF_PRESENT"
            else:
                stdout = raw_text + "\n"
                normalization = "APPENDED_ONE_TERMINAL_LF"
            output_status = "PROHIBITED_ACTIVITY" if prohibited else "COMPLETE_SINGLE_TEXT"
        else:
            output_status = "MALFORMED_FINAL"
    elif len(finals) > 1:
        output_status = "MULTIPLE_FINALS"
    stdout_bytes = stdout.encode("utf-8")
    raw_text_bytes = raw_text.encode("utf-8") if raw_text is not None else None
    prohibited_storage = _canonical(prohibited)
    return {
        "stdout_utf8": stdout,
        "output_capture": {
            "status": output_status,
            "sha256": _sha(stdout_bytes),
            "bytes": len(stdout_bytes),
            "assistant_final_message_count": len(finals),
            "normalization": normalization,
            "raw_text_sha256": _sha(raw_text_bytes) if raw_text_bytes is not None else None,
            "raw_text_bytes": len(raw_text_bytes) if raw_text_bytes is not None else None,
        },
        "prohibited_activity_observations": {
            "present": bool(prohibited),
            "item_count": len(prohibited),
            "item_types": prohibited_types,
            "items": prohibited,
            "items_sha256": _sha(prohibited_storage),
            "items_bytes": len(prohibited_storage),
        },
        "rollout": {
            "kind": "codex-session-jsonl",
            "path": str(path),
            "storage_sha256": _sha(storage),
            "storage_bytes": len(storage),
            "parsed_row_count": len(rows),
            "session_meta": metas[0],
            "turn_context": turns[0],
            "task_started": starts[0],
            "task_complete": completes[0],
            "provider_input_message": inputs[0],
            "assistant_final_messages": finals,
        },
    }


def _reap(process: subprocess.Popen[bytes], protocol: _Protocol) -> str:
    if process.stdin is not None:
        try:
            process.stdin.close()
        except OSError:
            pass
    deadline = time.monotonic() + 15.0
    while process.poll() is None and time.monotonic() < deadline:
        protocol.poll_io(0.05)
    if process.poll() is not None:
        protocol.drain()
        return "stdin_closed_graceful_exit"
    process.terminate()
    deadline = time.monotonic() + 5.0
    while process.poll() is None and time.monotonic() < deadline:
        protocol.poll_io(0.05)
    if process.poll() is not None:
        protocol.drain()
        return "terminate_after_graceful_timeout"
    process.kill()
    process.wait(timeout=5.0)
    protocol.drain()
    return "kill_after_terminate_timeout"


def _actual(request: dict[str, Any]) -> dict[str, Any]:
    timeout = float(request.get("timeout_seconds", 600.0))
    model = request["route"]["model"]
    thinking = request["route"]["thinking"]
    provider_input = request["provider_input_utf8"]
    started_utc = _utc_now()
    process = subprocess.Popen(
        ["codex", "app-server", "--listen", "stdio://"],
        cwd=REPO,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        bufsize=0,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
    )
    protocol = _Protocol(process)
    thread_id: str | None = None
    turn_id: str | None = None
    dispatch_count = 0
    rollout_path: Path | None = None
    polls: list[dict[str, Any]] = []
    reopened: dict[str, Any] | None = None
    error: Exception | None = None
    terminal_status = "BACKEND_ERROR"
    deadline = time.monotonic() + timeout
    try:
        protocol.send({
            "method": "initialize", "id": 1,
            "params": {"clientInfo": {"name": "puppet-master-r9-backend",
                                        "title": "Puppet Master R9 backend", "version": "1.0.0"},
                       "capabilities": {"experimentalApi": True}},
        })
        protocol.response(1, deadline)
        protocol.send({"method": "initialized", "params": {}})
        protocol.send({
            "method": "thread/start", "id": 2,
            "params": {
                "model": model,
                "modelProvider": "openai",
                "cwd": str(REPO),
                "approvalPolicy": "never",
                "approvalsReviewer": "user",
                "sandbox": "danger-full-access",
                "ephemeral": False,
                "threadSource": "subagent",
                "allowProviderModelFallback": False,
            },
        })
        thread = protocol.response(2, deadline).get("thread")
        if not isinstance(thread, dict) or not isinstance(thread.get("id"), str) or not thread["id"]:
            raise BackendError("thread/start did not return a fresh thread id")
        thread_id = thread["id"]
        # Exactly one logical text input is sent.  No nonce, wrapper, task name,
        # controller metadata, or other dynamic text is provider-visible here.
        protocol.send({
            "method": "turn/start", "id": 3,
            "params": {
                "threadId": thread_id,
                "input": [{"type": "text", "text": provider_input}],
                "cwd": str(REPO),
                "approvalPolicy": "never",
                "approvalsReviewer": "user",
                "model": model,
                "effort": thinking,
                "collaborationMode": {
                    "mode": "default",
                    "settings": {"model": model, "reasoning_effort": thinking,
                                 "developer_instructions": None},
                },
            },
        })
        dispatch_count = 1
        turn = protocol.response(3, deadline).get("turn")
        if not isinstance(turn, dict) or not isinstance(turn.get("id"), str) or not turn["id"]:
            raise BackendError("turn/start did not return a fresh turn id")
        turn_id = turn["id"]
        rollout_path = _wait_task_complete(protocol, thread_id, turn_id, deadline, polls)
        reopened = _reopen_rollout(rollout_path, thread_id, turn_id, provider_input, model, thinking)
        terminal_status = "TASK_COMPLETE"
    except Exception as exc:  # a closed first-attempt transport envelope preserves the failure
        error = exc
        terminal_status = (
            "PROCESS_EXIT_BEFORE_TASK_COMPLETE" if process.poll() is not None
            else "TIMEOUT_BEFORE_TASK_COMPLETE" if time.monotonic() >= deadline
            else "BACKEND_ERROR"
        )
    finally:
        reap_action = _reap(process, protocol)
    ended_utc = _utc_now()

    if thread_id is None or turn_id is None:
        # The controller intentionally rejects this closed envelope as invalid;
        # inventing fresh platform identities would conceal where dispatch failed.
        task_id = thread_id or ""
        turn_value = turn_id or ""
    else:
        task_id = f"codex-task:{thread_id}"
        turn_value = turn_id
    if reopened is None:
        stdout = ""
        output_capture = {"status": "UNAVAILABLE", "sha256": _sha(b""), "bytes": 0,
                          "assistant_final_message_count": 0}
        rollout = {
            "kind": "codex-session-jsonl",
            "path": str(rollout_path) if rollout_path else None,
            "storage_sha256": None,
            "storage_bytes": None,
            "task_started": None,
            "task_complete": None,
        }
        prohibited_activity = {
            "present": False, "item_count": 0, "item_types": [], "items": [],
            "items_sha256": _sha(b"[]"), "items_bytes": 2,
        }
    else:
        stdout = reopened["stdout_utf8"]
        output_capture = reopened["output_capture"]
        rollout = reopened["rollout"]
        prohibited_activity = reopened["prohibited_activity_observations"]
    stderr_bytes = bytes(protocol.stderr)
    process_meta = {
        "kind": "codex-app-server-stdio",
        "pid": process.pid,
        "started_utc": started_utc,
        "ended_utc": ended_utc,
        "terminal_reason": terminal_status,
        "poll_count": len(polls),
        "live_poll_count": sum(row.get("state") == "RUNNING" for row in polls),
        "polls": polls,
        "task_complete_observed": terminal_status == "TASK_COMPLETE",
        "task_terminal": rollout.get("task_complete"),
        "child_reaped": process.poll() is not None,
        "reap_action": reap_action,
        "protocol_stdout_sha256": _sha(bytes(protocol.stdout)),
        "protocol_stdout_bytes": len(protocol.stdout),
        "stderr_sha256": _sha(stderr_bytes),
        "stderr_bytes": len(stderr_bytes),
        "child_returncode": process.returncode,
        "error_type": type(error).__name__ if error else None,
        "error": str(error) if error else None,
    }
    return {
        "schema_id": RESULT_SCHEMA_ID,
        "mode": "actual",
        "terminal": True,
        "nonce": request["nonce"],
        "resolved_route": request["route"],
        "provider_input_sha256": request["provider_input_sha256"],
        "provider_input_bytes": request["provider_input_bytes"],
        "task_id": task_id,
        "thread_id": thread_id or "",
        "turn_id": turn_value,
        "returncode": (86 if prohibited_activity["present"] and process.returncode == 0
                       else process.returncode if isinstance(process.returncode, int) else -1),
        "stdout_utf8": stdout,
        "stderr_utf8": stderr_bytes.decode("utf-8", errors="replace"),
        "process": process_meta,
        "dispatch_count": dispatch_count,
        "retry_count": 0,
        "best_of": False,
        "replacement_result": False,
        "terminal_status": terminal_status,
        "first_attempt": True,
        "fresh_context": True,
        "provider_model_fallback_allowed": False,
        "task_identity_basis": "derived_from_fresh_thread_id",
        "task_identity_kind": "DERIVED_FROM_FRESH_THREAD_ID",
        "identity_limitation": IDENTITY_LIMITATION,
        "output_capture": output_capture,
        "prohibited_activity_observations": prohibited_activity,
        "rollout": rollout,
    }


def invoke(request: dict) -> dict:
    """Run exactly one closed synthetic or actual first-attempt transport."""
    checked = _require_request(request)
    return _synthetic(checked) if checked["mode"] == "synthetic" else _actual(checked)


def _self_test() -> dict[str, Any]:
    base = {
        "schema_id": REQUEST_SCHEMA_ID,
        "mode": "synthetic",
        "run_id": "self-test",
        "slot": "slot-alpha",
        "cell": "CELL-001",
        "index": 0,
        "route": ROUTES["slot-alpha"],
        "nonce": "1" * 64,
        "provider_input_utf8": "exact input",
        "provider_input_sha256": _sha(b"exact input"),
        "provider_input_bytes": len(b"exact input"),
        "attempt_sha256": "2" * 64,
        "attempt_bytes": 123,
        "synthetic_expected_output_utf8": "{\"ok\":true}\n",
    }
    cases = [
        "pass", "yielded-multi-poll-complete-stdout", "nonzero-exit",
        "missing-output", "lf_only_output", "partial-output", "malformed-output",
        "abrupt-stop-during-backend", "abrupt_stop_after_task_complete",
    ]
    results: dict[str, dict[str, Any]] = {}
    for index, scenario in enumerate(cases):
        request = dict(base, scenario=scenario, nonce=f"{index + 1:064x}")
        result = invoke(request)
        if result["dispatch_count"] != 1 or result["retry_count"] != 0 or not result["terminal"]:
            raise BackendError(f"synthetic invariant failed for {scenario}")
        if not result["process"]["child_reaped"] or not result["process"]["polls"]:
            raise BackendError(f"synthetic terminal metadata missing for {scenario}")
        if len({result["task_id"], result["thread_id"], result["turn_id"]}) != 3:
            raise BackendError(f"synthetic identities are not distinct for {scenario}")
        results[scenario] = {
            "terminal_status": result["terminal_status"],
            "returncode": result["returncode"],
            "poll_count": result["process"]["poll_count"],
            "stdout_bytes": len(result["stdout_utf8"].encode("utf-8")),
        }
    repeat = invoke(dict(base, scenario="pass"))
    if repeat != invoke(dict(base, scenario="pass")):
        raise BackendError("synthetic result is not deterministic")
    return {
        "schema_id": "pw-r9-backend-self-test-v1",
        "status": "PASS",
        "cases": results,
        "synthetic_invocations": len(cases) + 2,
        "actual_invocations": 0,
        "provider_calls": 0,
        "durable_experiment_writes": 0,
    }


if __name__ == "__main__":
    if sys.argv[1:] != ["self-test"]:
        raise SystemExit("usage: backend.py self-test")
    sys.stdout.buffer.write(_canonical(_self_test()) + b"\n")
