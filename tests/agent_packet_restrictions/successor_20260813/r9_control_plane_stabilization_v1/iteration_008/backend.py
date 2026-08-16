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
    indexed_rows = list(enumerate(rows))
    meta_rows = [(index, row.get("payload")) for index, row in indexed_rows
                 if row.get("type") == "session_meta"]
    turn_rows = [(index, row.get("payload")) for index, row in indexed_rows
                 if row.get("type") == "turn_context"]
    start_rows = [
        (index, row["payload"]) for index, row in indexed_rows
        if row.get("type") == "event_msg" and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "task_started"
    ]
    complete_rows = [
        (index, row["payload"]) for index, row in indexed_rows
        if row.get("type") == "event_msg" and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "task_complete"
    ]
    if not (len(meta_rows) == len(turn_rows) == len(start_rows) == len(complete_rows) == 1):
        raise BackendError("rollout identity or terminal cardinality is uncertain")
    meta_index, meta = meta_rows[0]
    turn_index, turn = turn_rows[0]
    start_index, start = start_rows[0]
    complete_index, complete = complete_rows[0]
    if not all(isinstance(value, dict) for value in (meta, turn)):
        raise BackendError("rollout identity or terminal cardinality is uncertain")
    if (meta.get("session_id") != thread_id or meta.get("id") != thread_id
            or turn.get("turn_id") != turn_id
            or start.get("turn_id") != turn_id
            or complete.get("turn_id") != turn_id
            or not meta_index < start_index < turn_index < complete_index):
        raise BackendError("rollout session, turn, or task terminal identity drift")

    post_context_users = [
        (index, row["payload"]) for index, row in indexed_rows
        if index > turn_index
        and row.get("type") == "response_item" and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "message" and row["payload"].get("role") == "user"
    ]
    if len(post_context_users) != 1:
        raise BackendError("rollout target-turn provider input cardinality is uncertain")
    input_index, provider_message = post_context_users[0]
    passthrough = provider_message.get("internal_chat_message_metadata_passthrough")
    content = provider_message.get("content")
    if (not turn_index < input_index < complete_index
            or not isinstance(passthrough, dict) or passthrough.get("turn_id") != turn_id):
        raise BackendError("rollout target-turn provider input association drift")
    if (not isinstance(content, list) or len(content) != 1
            or not isinstance(content[0], dict) or content[0].get("type") != "input_text"
            or set(content[0]) != {"type", "text"}
            or content[0].get("text") != provider_input):
        raise BackendError("rollout does not preserve the sole exact target-turn provider input")
    if meta.get("model_provider") != "openai":
        raise BackendError("rollout model provider drift")
    if turn.get("model") != model or turn.get("effort") != thinking:
        raise BackendError("rollout requested route drift")

    final_rows = [
        (index, row["payload"]) for index, row in indexed_rows
        if row.get("type") == "response_item" and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "message"
        and row["payload"].get("role") == "assistant"
        and row["payload"].get("phase") == "final_answer"
    ]
    if len(final_rows) != 1:
        raise BackendError("rollout target-turn assistant final cardinality drift")
    final_index, final_message = final_rows[0]
    final_passthrough = final_message.get("internal_chat_message_metadata_passthrough")
    if (not input_index < final_index < complete_index
            or not isinstance(final_passthrough, dict)
            or final_passthrough.get("turn_id") != turn_id):
        raise BackendError("rollout target-turn assistant final association drift")
    finals = [final_message]
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
            "session_meta": meta,
            "turn_context": turn,
            "task_started": start,
            "task_complete": complete,
            "provider_input_message": provider_message,
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

    class _MemoryRollout:
        def __init__(self, case_id: str, storage: bytes) -> None:
            self.case_id = case_id
            self.storage = storage

        def read_bytes(self) -> bytes:
            return self.storage

        def __str__(self) -> str:
            return f"memory://r9-reg-007/{self.case_id}.jsonl"

    fixture_thread = "fixture-thread"
    fixture_turn = "fixture-turn"
    other_turn = "other-turn"
    fixture_provider_input = "exact input"
    fixture_model = ROUTES["slot-alpha"]["model"]
    fixture_thinking = ROUTES["slot-alpha"]["thinking"]
    fixture_final = '{"selected_choice":"ledger_lineage_only"}'

    def _fixture_message(role: str, text: str, bound_turn: str, *, final: bool = False) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "type": "message",
            "role": role,
            "content": [{"type": "output_text" if final else "input_text", "text": text}],
            "internal_chat_message_metadata_passthrough": {"turn_id": bound_turn},
        }
        if final:
            payload["phase"] = "final_answer"
        return {"type": "response_item", "payload": payload}

    def _fixture(
        case_id: str, *, precontext_count: int = 1,
        turn_context_ids: tuple[str, ...] = (fixture_turn,),
        task_started_ids: tuple[str, ...] = (fixture_turn,),
        provider_messages: tuple[tuple[str, str], ...] = ((fixture_provider_input, fixture_turn),),
        final_turn_ids: tuple[str, ...] = (fixture_turn,),
        task_complete_ids: tuple[str, ...] = (fixture_turn,),
        post_terminal_messages: tuple[tuple[str, str], ...] = (),
        malformed_provider_content: bool = False,
        session_id: str = fixture_thread,
    ) -> _MemoryRollout:
        rows: list[dict[str, Any]] = [{
            "type": "session_meta",
            "payload": {"session_id": session_id, "id": session_id, "model_provider": "openai"},
        }]
        rows.extend({"type": "event_msg", "payload": {"type": "task_started", "turn_id": item}}
                    for item in task_started_ids)
        rows.extend(
            _fixture_message("user", f"app context {index}", fixture_turn)
            for index in range(precontext_count)
        )
        rows.extend({
            "type": "turn_context",
            "payload": {"turn_id": item, "model": fixture_model, "effort": fixture_thinking},
        } for item in turn_context_ids)
        provider_rows = [_fixture_message("user", text, bound_turn)
                         for text, bound_turn in provider_messages]
        if malformed_provider_content and len(provider_rows) == 1:
            provider_rows[0]["payload"]["content"] = [{"type": "input_text", "text": 17}]
        rows.extend(provider_rows)
        rows.extend(_fixture_message("assistant", fixture_final, item, final=True)
                    for item in final_turn_ids)
        rows.extend({"type": "event_msg", "payload": {"type": "task_complete", "turn_id": item}}
                    for item in task_complete_ids)
        rows.extend(_fixture_message("user", text, bound_turn)
                    for text, bound_turn in post_terminal_messages)
        return _MemoryRollout(case_id, b"".join(_canonical(row) + b"\n" for row in rows))

    one_precontext = _fixture("current_canary_one_precontext")
    archive_relative_path = (
        "tests/agent_packet_restrictions/successor_20260813/"
        "r9_candidate_v2_canary_01_failed_rollout.jsonl"
    )
    archive_path = Path(__file__).resolve().parents[2] / "r9_candidate_v2_canary_01_failed_rollout.jsonl"
    archive_storage = archive_path.read_bytes()
    archive_sha256 = "c081fb0d3df01214d97a1805e8e91a1667453429c5d4f4960e74a6dd3b37b86f"
    archive_bytes = 86063
    archive_thread = "01a008b5-967b-7f43-949c-ef5e0178dcb3"
    archive_turn = "01a008b5-97cc-7ec1-8be4-9a2d22c34347"
    archive_provider_sha256 = "472fb6d9361e6a5a312e4e8e60d2430b6740c0bd1c91fa757d9cd933018a477b"
    archive_provider_bytes = 2239
    if _sha(archive_storage) != archive_sha256 or len(archive_storage) != archive_bytes:
        raise BackendError("R9-REG-007 archived V2 rollout identity drift")
    predecessor_rows = [json.loads(line) for line in archive_storage.splitlines()]
    archive_turn_rows = [
        (index, row["payload"]) for index, row in enumerate(predecessor_rows)
        if row.get("type") == "turn_context" and isinstance(row.get("payload"), dict)
        and row["payload"].get("turn_id") == archive_turn
    ]
    if len(predecessor_rows) != 13 or len(archive_turn_rows) != 1:
        raise BackendError("R9-REG-007 archived V2 rollout row or turn-context drift")
    archive_turn_index, archive_turn_context = archive_turn_rows[0]
    predecessor_inputs = [
        row["payload"] for row in predecessor_rows
        if row.get("type") == "response_item" and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "message" and row["payload"].get("role") == "user"
    ]
    archive_target_inputs = [
        row["payload"] for index, row in enumerate(predecessor_rows)
        if index > archive_turn_index
        and row.get("type") == "response_item" and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") == "message" and row["payload"].get("role") == "user"
    ]
    if len(archive_target_inputs) != 1:
        raise BackendError("R9-REG-007 archived target-turn provider cardinality drift")
    archive_provider_content = archive_target_inputs[0].get("content")
    if (not isinstance(archive_provider_content, list) or len(archive_provider_content) != 1
            or not isinstance(archive_provider_content[0], dict)
            or archive_provider_content[0].get("type") != "input_text"
            or not isinstance(archive_provider_content[0].get("text"), str)):
        raise BackendError("R9-REG-007 archived target-turn provider content drift")
    archive_provider_input = archive_provider_content[0]["text"]
    if (_sha(archive_provider_input.encode("utf-8")) != archive_provider_sha256
            or len(archive_provider_input.encode("utf-8")) != archive_provider_bytes):
        raise BackendError("R9-REG-007 archived target-turn provider identity drift")
    predecessor_error: BackendError | None = None
    try:
        if len(predecessor_inputs) != 1:
            raise BackendError("rollout identity or terminal cardinality is uncertain")
    except BackendError as exc:
        predecessor_error = exc
    if predecessor_error is None or len(predecessor_inputs) != 2:
        raise BackendError("R9-REG-007 predecessor failure was not preserved")
    archive_successor = _reopen_rollout(
        archive_path, archive_thread, archive_turn, archive_provider_input,
        "gpt-5.4-mini", "xhigh",
    )
    archive_finals = archive_successor["rollout"]["assistant_final_messages"]
    archive_terminal = archive_successor["rollout"]["task_complete"]
    archive_final_storage = _canonical(archive_finals[0]) if len(archive_finals) == 1 else b""
    archive_terminal_storage = _canonical(archive_terminal)
    if (archive_successor["output_capture"]["status"] != "COMPLETE_SINGLE_TEXT"
            or archive_successor["output_capture"]["raw_text_sha256"]
            != "2ad4aadbcc2554ef4d5a73cbf78b268f3faa00b6144e6a6d0516eb970ae04e14"
            or archive_successor["output_capture"]["raw_text_bytes"] != 41
            or archive_successor["output_capture"]["sha256"]
            != "10a2f9ae11f4a60bf72c84bd0e6973e0bab7d096332f577ff5a7a37e046d189a"
            or archive_successor["output_capture"]["bytes"] != 42
            or archive_terminal.get("turn_id") != archive_turn):
        raise BackendError("R9-REG-007 archived successor final or task terminal drift")

    selector_cases: list[tuple[str, _MemoryRollout, str, str | None]] = [
        ("valid_zero_precontext", _fixture("valid_zero_precontext", precontext_count=0),
         "PASS", None),
        ("current_canary_one_precontext", one_precontext, "PASS", None),
        ("valid_two_precontext", _fixture("valid_two_precontext", precontext_count=2),
         "PASS", None),
        ("missing_provider_input", _fixture("missing_provider_input", provider_messages=()),
         "REJECT", "rollout target-turn provider input cardinality is uncertain"),
        ("duplicate_exact_prompt_after_context", _fixture(
            "duplicate_exact_prompt_after_context",
            provider_messages=((fixture_provider_input, fixture_turn),
                               (fixture_provider_input, fixture_turn))),
         "REJECT", "rollout target-turn provider input cardinality is uncertain"),
        ("wrong_prompt_after_context", _fixture(
            "wrong_prompt_after_context", provider_messages=(("wrong input", fixture_turn),)),
         "REJECT", "rollout does not preserve the sole exact target-turn provider input"),
        ("malformed_provider_input_content", _fixture(
            "malformed_provider_input_content", malformed_provider_content=True),
         "REJECT", "rollout does not preserve the sole exact target-turn provider input"),
        ("post_context_extra_nonmatching_user", _fixture(
            "post_context_extra_nonmatching_user",
            provider_messages=((fixture_provider_input, fixture_turn), ("extra input", fixture_turn))),
         "REJECT", "rollout target-turn provider input cardinality is uncertain"),
        ("post_terminal_extra_user", _fixture(
            "post_terminal_extra_user", post_terminal_messages=(("extra input", fixture_turn),)),
         "REJECT", "rollout target-turn provider input cardinality is uncertain"),
        ("provider_input_after_terminal", _fixture(
            "provider_input_after_terminal", provider_messages=(),
            post_terminal_messages=((fixture_provider_input, fixture_turn),)),
         "REJECT", "rollout target-turn provider input association drift"),
        ("provider_input_wrong_turn", _fixture(
            "provider_input_wrong_turn", provider_messages=((fixture_provider_input, other_turn),)),
         "REJECT", "rollout target-turn provider input association drift"),
        ("multiple_matching_turn_contexts", _fixture(
            "multiple_matching_turn_contexts", turn_context_ids=(fixture_turn, fixture_turn)),
         "REJECT", "rollout identity or terminal cardinality is uncertain"),
        ("multiple_turn_contexts_including_other", _fixture(
            "multiple_turn_contexts_including_other", turn_context_ids=(fixture_turn, other_turn)),
         "REJECT", "rollout identity or terminal cardinality is uncertain"),
        ("wrong_turn_task_started", _fixture(
            "wrong_turn_task_started", task_started_ids=(other_turn,)),
         "REJECT", "rollout session, turn, or task terminal identity drift"),
        ("wrong_turn_task_complete", _fixture(
            "wrong_turn_task_complete", task_complete_ids=(other_turn,)),
         "REJECT", "rollout session, turn, or task terminal identity drift"),
        ("extra_wrong_turn_task_terminals", _fixture(
            "extra_wrong_turn_task_terminals",
            task_started_ids=(fixture_turn, other_turn),
            task_complete_ids=(fixture_turn, other_turn)),
         "REJECT", "rollout identity or terminal cardinality is uncertain"),
        ("zero_final", _fixture("zero_final", final_turn_ids=()),
         "REJECT", "rollout target-turn assistant final cardinality drift"),
        ("two_finals", _fixture("two_finals", final_turn_ids=(fixture_turn, fixture_turn)),
         "REJECT", "rollout target-turn assistant final cardinality drift"),
        ("final_wrong_turn", _fixture("final_wrong_turn", final_turn_ids=(other_turn,)),
         "REJECT", "rollout target-turn assistant final association drift"),
    ]
    selector_results: dict[str, dict[str, Any]] = {}
    for case_id, fixture, expected, expected_error in selector_cases:
        try:
            reopened = _reopen_rollout(
                fixture, fixture_thread, fixture_turn, fixture_provider_input,
                fixture_model, fixture_thinking,
            )
        except BackendError as exc:
            if expected != "REJECT" or str(exc) != expected_error:
                raise BackendError(f"unexpected R9-REG-007 result for {case_id}: {exc}") from exc
            selector_results[case_id] = {"result": "REJECT", "error": str(exc)}
            continue
        if expected != "PASS":
            raise BackendError(f"R9-REG-007 fault case passed: {case_id}")
        if (reopened["stdout_utf8"] != fixture_final + "\n"
                or reopened["output_capture"]["assistant_final_message_count"] != 1
                or reopened["rollout"]["provider_input_message"]["content"]
                != [{"type": "input_text", "text": fixture_provider_input}]):
            raise BackendError(f"R9-REG-007 positive capture drift for {case_id}")
        selector_results[case_id] = {
            "result": "PASS",
            "precontext_user_count": int(case_id != "valid_zero_precontext")
            if case_id != "valid_two_precontext" else 2,
            "provider_input_count": 1,
            "assistant_final_count": 1,
            "task_complete_count": 1,
            "stdout_sha256": reopened["output_capture"]["sha256"],
            "stdout_bytes": reopened["output_capture"]["bytes"],
        }
    return {
        "schema_id": "pw-r9-backend-self-test-v1",
        "status": "PASS",
        "cases": results,
        "rollout_selector": {
            "schema_id": "pw-r9-rollout-selector-self-test-v1",
            "regression_id": "R9-REG-007",
            "variant_id": "app-server-precontext-turn-scoped-rollout-reopen",
            "normalized_signature": "SESSION_WIDE_USER_CARDINALITY_FALSE_REJECTS_TURN_BOUND_PROVIDER_INPUT",
            "normalized_variant": "R9_REG_007_ROLLOUT_PREEXISTING_USER_CONTEXT_CARDINALITY_REJECTED",
            "predecessor": {
                "candidate": "formal_candidate_v2",
                "result": "FAIL",
                "error_type": type(predecessor_error).__name__,
                "error": str(predecessor_error),
                "archive_path": archive_relative_path,
                "archive_storage_sha256": archive_sha256,
                "archive_storage_bytes": archive_bytes,
                "archive_row_count": len(predecessor_rows),
                "thread_id": archive_thread,
                "turn_id": archive_turn,
                "session_wide_user_message_count": len(predecessor_inputs),
                "target_turn_provider_input_count": len(archive_target_inputs),
                "provider_input_sha256": archive_provider_sha256,
                "provider_input_bytes": archive_provider_bytes,
            },
            "archived_successor": {
                "result": "PASS",
                "assistant_final_count": len(archive_finals),
                "assistant_final_storage_sha256": _sha(archive_final_storage),
                "assistant_final_storage_bytes": len(archive_final_storage),
                "raw_final_sha256": archive_successor["output_capture"]["raw_text_sha256"],
                "raw_final_bytes": archive_successor["output_capture"]["raw_text_bytes"],
                "normalized_stdout_sha256": archive_successor["output_capture"]["sha256"],
                "normalized_stdout_bytes": archive_successor["output_capture"]["bytes"],
                "task_complete_storage_sha256": _sha(archive_terminal_storage),
                "task_complete_storage_bytes": len(archive_terminal_storage),
                "task_complete_turn_id": archive_terminal["turn_id"],
            },
            "successor_cases": selector_results,
            "pass_case_count": sum(row["result"] == "PASS" for row in selector_results.values()),
            "rejection_case_count": sum(row["result"] == "REJECT" for row in selector_results.values()),
            "subject_calls": 0,
            "provider_calls": 0,
            "network_calls": 0,
            "actual_invocations": 0,
            "fixture_writes": 0,
        },
        "synthetic_invocations": len(cases) + 2,
        "actual_invocations": 0,
        "subject_calls": 0,
        "provider_calls": 0,
        "network_calls": 0,
        "durable_experiment_writes": 0,
    }


if __name__ == "__main__":
    if sys.argv[1:] != ["self-test"]:
        raise SystemExit("usage: backend.py self-test")
    sys.stdout.buffer.write(_canonical(_self_test()) + b"\n")
