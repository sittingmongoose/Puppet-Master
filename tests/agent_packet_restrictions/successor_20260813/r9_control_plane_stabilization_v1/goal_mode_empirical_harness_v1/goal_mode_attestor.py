#!/usr/bin/env python3
"""Read-only Goal-per-test-taker evidence attestor.

The attestor never starts Codex or OMP and never edits their durable state.  It
binds a direct Codex exec task to its native Goal database row and rollout, or
validates the closed native-OMP receipt emitted by the already-arranged Windows
controller.  All failures are fail-closed and worth zero qualification credit.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import stat
import sys
from typing import Any, Iterable


CODEX_SCHEMA = "pw-r9-codex-native-goal-row-attestation-v1"
OMP_SCHEMA = "pw-r9-omp-native-goal-row-attestation-v1"
MANIFEST_SCHEMA = "pw-r9-goal-mode-run-manifest-v1"
ROW_SCHEMA = "pw-r9-goal-mode-row-spec-v1"
PROCESS_SCHEMA = "pw-r9-goal-mode-codex-process-receipt-v1"
LAUNCH_SCHEMA = "pw-r9-goal-mode-codex-launch-receipt-v1"
SNAPSHOT_SCHEMA = "pw-r9-goal-mode-codex-prelaunch-snapshot-v1"
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
TOOL_RE = re.compile(r"tools\.([A-Za-z_][A-Za-z0-9_]*)")
HEX64_RE = re.compile(r"^[0-9a-f]{64}$")
TERMINAL_GOAL_STATES = {"complete", "blocked", "usage_limited", "budget_limited"}


class Invalid(RuntimeError):
    pass


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise Invalid(f"duplicate JSON key: {key}")
        out[key] = value
    return out


def canon(value: Any, newline: bool = True) -> bytes:
    raw = json.dumps(
        value,
        ensure_ascii=False,
        allow_nan=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return raw + (b"\n" if newline else b"")


def sha256(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise Invalid(message)


def _read_regular(path: Path, limit: int) -> bytes:
    st = os.lstat(path)
    require(stat.S_ISREG(st.st_mode), f"not a regular file: {path}")
    require(not path.is_symlink(), f"symlink forbidden: {path}")
    require(0 <= st.st_size <= limit, f"file size outside limit: {path}")
    raw = path.read_bytes()
    require(len(raw) == st.st_size, f"short or changing read: {path}")
    st2 = os.lstat(path)
    require((st.st_dev, st.st_ino, st.st_size, st.st_mtime_ns) ==
            (st2.st_dev, st2.st_ino, st2.st_size, st2.st_mtime_ns),
            f"file changed during read: {path}")
    return raw


def load_json(path: Path, limit: int = 8_000_000) -> Any:
    raw = _read_regular(path, limit)
    require(raw.endswith(b"\n") and not raw.endswith(b"\n\n"), f"one terminal LF required: {path}")
    require(b"\r" not in raw and b"\x00" not in raw, f"invalid JSON framing: {path}")
    try:
        value = json.loads(raw, object_pairs_hook=_pairs, parse_constant=lambda x: (_ for _ in ()).throw(Invalid(f"nonfinite JSON: {x}")))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise Invalid(f"invalid JSON {path}: {exc}") from exc
    require(raw == canon(value), f"JSON is not canonical: {path}")
    return value


def _exact_keys(value: dict[str, Any], keys: Iterable[str], label: str) -> None:
    expected = set(keys)
    require(set(value) == expected, f"{label} keys mismatch: {sorted(set(value) ^ expected)}")


def _db_path(codex_home: Path, stem: str) -> Path:
    matches = sorted(codex_home.glob(f"{stem}_*.sqlite"))
    require(len(matches) == 1, f"expected exactly one {stem}_*.sqlite under CODEX_HOME")
    path = matches[0]
    st = os.lstat(path)
    require(stat.S_ISREG(st.st_mode) and not path.is_symlink(), f"unsafe database path: {stem}")
    return path


def _connect_ro(path: Path) -> sqlite3.Connection:
    con = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=5)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA query_only=ON")
    return con


def _one_row(con: sqlite3.Connection, sql: str, args: tuple[Any, ...], label: str) -> dict[str, Any]:
    rows = con.execute(sql, args).fetchall()
    require(len(rows) == 1, f"expected exactly one {label} row, got {len(rows)}")
    return dict(rows[0])


def _logical_rollout(codex_home: Path, raw_path: str) -> tuple[Path, str]:
    home = codex_home.resolve()
    path = Path(raw_path).resolve(strict=True)
    try:
        rel = path.relative_to(home)
    except ValueError as exc:
        raise Invalid("rollout path escapes CODEX_HOME") from exc
    require(rel.parts and rel.parts[0] in {"sessions", "archived_sessions"}, "unexpected rollout namespace")
    return path, rel.as_posix()


def _rollout_records(path: Path) -> tuple[list[dict[str, Any]], bytes]:
    raw = _read_regular(path, 256_000_000)
    require(raw.endswith(b"\n"), "rollout must end LF")
    records: list[dict[str, Any]] = []
    for line_no, line in enumerate(raw.splitlines(), 1):
        require(line and b"\r" not in line, f"invalid rollout line {line_no}")
        try:
            value = json.loads(line, object_pairs_hook=_pairs, parse_constant=lambda x: (_ for _ in ()).throw(Invalid(f"nonfinite JSON: {x}")))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise Invalid(f"invalid rollout JSON line {line_no}: {exc}") from exc
        require(isinstance(value, dict), f"rollout line {line_no} is not an object")
        records.append({"line": line_no, "record": value})
    require(records, "empty rollout")
    return records, raw


def _payload(entry: dict[str, Any]) -> dict[str, Any]:
    value = entry["record"].get("payload")
    return value if isinstance(value, dict) else {}


def _texts(value: Any) -> list[str]:
    out: list[str] = []
    if isinstance(value, str):
        out.append(value)
    elif isinstance(value, list):
        for item in value:
            out.extend(_texts(item))
    elif isinstance(value, dict):
        for item in value.values():
            out.extend(_texts(item))
    return out


def _tool_result_json(output: Any) -> dict[str, Any]:
    candidates: list[str] = []
    if isinstance(output, str):
        candidates.append(output)
    elif isinstance(output, list):
        for item in output:
            if isinstance(item, dict) and isinstance(item.get("text"), str):
                candidates.append(item["text"])
    parsed: list[dict[str, Any]] = []
    for text in candidates:
        stripped = text.strip()
        if not stripped.startswith("{"):
            continue
        try:
            value = json.loads(stripped, object_pairs_hook=_pairs)
        except (json.JSONDecodeError, Invalid):
            continue
        if isinstance(value, dict):
            parsed.append(value)
    require(len(parsed) == 1, "goal tool output must contain exactly one JSON object")
    return parsed[0]


def _goal_calls(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    outputs: dict[str, tuple[int, Any]] = {}
    for entry in records:
        payload = _payload(entry)
        if payload.get("type") == "custom_tool_call_output" and isinstance(payload.get("call_id"), str):
            require(payload["call_id"] not in outputs, "duplicate custom tool output call_id")
            outputs[payload["call_id"]] = (entry["line"], payload.get("output"))
    result: list[dict[str, Any]] = []
    for entry in records:
        payload = _payload(entry)
        if payload.get("type") != "custom_tool_call":
            continue
        call_id = payload.get("call_id")
        code = payload.get("input")
        require(isinstance(call_id, str) and call_id, "custom tool call_id missing")
        require(isinstance(code, str), "custom tool input missing")
        methods = TOOL_RE.findall(code)
        goal_methods = [name for name in methods if name in {"get_goal", "create_goal", "update_goal"}]
        if not goal_methods:
            continue
        require(payload.get("name") == "exec", "goal method must be invoked through code-mode exec")
        require(len(methods) == 1 and len(goal_methods) == 1, "goal call must contain exactly one nested tool method")
        require(call_id in outputs, "goal tool output missing")
        output_line, output = outputs[call_id]
        require(output_line > entry["line"], "goal tool output precedes call")
        result.append({
            "call_id": call_id,
            "call_line": entry["line"],
            "code": code,
            "method": goal_methods[0],
            "output": _tool_result_json(output),
            "output_line": output_line,
        })
    return result


def _goal_projection(value: dict[str, Any]) -> dict[str, Any] | None:
    goal = value.get("goal")
    require(goal is None or isinstance(goal, dict), "goal tool result goal field malformed")
    return goal


def _assert_goal_projection(goal: dict[str, Any], thread_id: str, objective: str, status: str) -> None:
    require(goal.get("threadId") == thread_id, "goal tool threadId mismatch")
    require(goal.get("objective") == objective, "goal tool objective mismatch")
    require(goal.get("status") == status, "goal tool status mismatch")


def _bootstrap_message_lines(records: list[dict[str, Any]], bootstrap: str) -> list[int]:
    lines: list[int] = []
    for entry in records:
        payload = _payload(entry)
        if payload.get("type") != "message" or payload.get("role") != "user":
            continue
        for content in payload.get("content", []):
            if isinstance(content, dict) and content.get("type") == "input_text" and content.get("text") == bootstrap:
                lines.append(entry["line"])
    return lines


def _action_calls(records: list[dict[str, Any]], after_line: int, through_line: int) -> list[dict[str, Any]]:
    action_types = {
        "function_call", "custom_tool_call", "local_shell_call", "web_search_call",
        "image_generation_call", "tool_search_call",
    }
    out: list[dict[str, Any]] = []
    for entry in records:
        if not (after_line < entry["line"] <= through_line):
            continue
        payload = _payload(entry)
        if payload.get("type") in action_types:
            out.append({"line": entry["line"], "payload": payload})
    return out


def _stdout_lifecycle(raw: bytes, complete: bool = True) -> dict[str, Any]:
    require(raw.endswith(b"\n"), "Codex JSONL stdout must end LF")
    events: list[dict[str, Any]] = []
    for index, line in enumerate(raw.splitlines()):
        require(line and b"\r" not in line, f"invalid stdout JSONL line {index}")
        try:
            event = json.loads(line, object_pairs_hook=_pairs)
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise Invalid(f"invalid Codex stdout JSONL: {exc}") from exc
        require(isinstance(event, dict) and isinstance(event.get("type"), str), "stdout event malformed")
        events.append(event)
    require(events and events[0].get("type") == "thread.started", "thread.started must be first")
    require(sum(e.get("type") == "thread.started" for e in events) == 1, "thread.started cardinality")
    require(not any(e.get("type") in {"turn.failed", "error"} for e in events), "Codex stdout terminal failure")
    state = "BETWEEN_TURNS"
    started = 0
    completed = 0
    for event in events[1:]:
        kind = event.get("type")
        if kind == "turn.started":
            require(state == "BETWEEN_TURNS", "nested or duplicate turn.started")
            state = "IN_TURN"
            started += 1
        elif kind == "turn.completed":
            require(state == "IN_TURN", "turn.completed without active turn")
            state = "BETWEEN_TURNS"
            completed += 1
        else:
            require(state == "IN_TURN", "stdout item outside a turn")
    if complete:
        require(started >= 2, "activation and subject must occupy distinct turns")
        require(started == completed and state == "BETWEEN_TURNS", "unclosed stdout turn")
        require(events[-1].get("type") == "turn.completed", "turn.completed must be last")
    thread_id = events[0].get("thread_id")
    require(isinstance(thread_id, str) and UUID_RE.fullmatch(thread_id), "stdout thread_id malformed")
    return {"event_count": len(events), "thread_id": thread_id, "turn_count": completed}


def _line_turns(records: list[dict[str, Any]]) -> dict[int, str | None]:
    current: str | None = None
    mapping: dict[int, str | None] = {}
    for entry in records:
        record = entry["record"]
        if record.get("type") == "turn_context":
            candidate = record.get("turn_id")
            if candidate is None and isinstance(record.get("payload"), dict):
                candidate = record["payload"].get("turn_id")
            require(isinstance(candidate, str) and candidate, "turn_context turn_id missing")
            current = candidate
        mapping[entry["line"]] = current
    return mapping


def _identity(path: Path, limit: int) -> dict[str, Any]:
    raw = _read_regular(path, limit)
    return {"bytes": len(raw), "sha256": sha256(raw)}


def _load_row(path: Path) -> dict[str, Any]:
    row = load_json(path, 2_000_000)
    require(isinstance(row, dict) and row.get("schema_id") == ROW_SCHEMA, "row spec schema mismatch")
    required = {
        "schema_id", "adapter", "run_id", "row_id", "attempt", "model", "reasoning_effort",
        "objective", "criteria", "control_envelope", "subject_utf8_sha256", "subject_utf8_bytes",
        "cli_version",
    }
    _exact_keys(row, required, "row spec")
    require(row["adapter"] in {"CODEX_NATIVE_GOAL_GATED_FIFO_V1", "OMP_NATIVE_GOAL_WINDOWS_EXTERNAL_V1"}, "row adapter")
    require(isinstance(row["run_id"], str) and row["run_id"], "run_id")
    require(isinstance(row["row_id"], str) and row["row_id"], "row_id")
    require(row["attempt"] == 0, "attempt must be zero")
    require(isinstance(row["objective"], str) and row["objective"], "objective")
    require(isinstance(row["criteria"], dict), "criteria")
    require(isinstance(row["control_envelope"], dict), "control envelope")
    require(isinstance(row["subject_utf8_sha256"], str) and HEX64_RE.fullmatch(row["subject_utf8_sha256"]), "subject hash")
    require(isinstance(row["subject_utf8_bytes"], int) and row["subject_utf8_bytes"] > 0, "subject bytes")
    criteria_hash = sha256(canon(row["criteria"], newline=False))
    control_hash = sha256(canon(row["control_envelope"], newline=False))
    expected_objective = (
        f"R9 Goal Mode test taker {row['run_id']}/{row['row_id']}/0; "
        f"criteria_sha256={criteria_hash}; control_envelope_sha256={control_hash}; "
        f"subject_commitment_sha256={row['subject_utf8_sha256']}; execute exactly one gated subject "
        "after native Goal activation and settle terminal Goal state."
    )
    require(row["objective"] == expected_objective, "row objective derivation mismatch")
    return row


def _activation(
    row: dict[str, Any], capture: Path, codex_home: Path, require_active: bool
) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    bootstrap_raw = _read_regular(capture / "bootstrap_prompt.txt", 2_000_000)
    bootstrap = bootstrap_raw.decode("utf-8")
    launch = load_json(capture / "launch_receipt.json", 2_000_000)
    snapshot = load_json(capture / "prelaunch_snapshot.json", 32_000_000)
    require(launch.get("schema_id") == LAUNCH_SCHEMA, "launch receipt schema")
    require(snapshot.get("schema_id") == SNAPSHOT_SCHEMA, "snapshot schema")
    _exact_keys(launch, {"argv", "pid", "schema_id", "started_at_ms", "stdin"}, "launch receipt")
    _exact_keys(snapshot, {"captured_at_ms", "goal_ids", "schema_id", "thread_ids"}, "prelaunch snapshot")
    require(isinstance(snapshot["thread_ids"], list) and snapshot["thread_ids"] == sorted(set(snapshot["thread_ids"])), "thread snapshot must be sorted unique")
    require(isinstance(snapshot["goal_ids"], list) and snapshot["goal_ids"] == sorted(set(snapshot["goal_ids"])), "goal snapshot must be sorted unique")
    require(launch["stdin"] == {"bytes": len(bootstrap_raw), "sha256": sha256(bootstrap_raw)}, "launch stdin binding")
    require(isinstance(launch["pid"], int) and launch["pid"] > 0, "launch pid")
    argv = launch["argv"]
    require(isinstance(argv, list) and all(isinstance(item, str) for item in argv), "launch argv")
    require(len(argv) >= 19 and argv[1] == "exec" and argv[-1] == "-", "not a fresh codex exec stdin launch")
    require("resume" not in argv and "--ephemeral" not in argv, "resume/ephemeral forbidden for fresh Goal task")
    require(argv.count("--strict-config") == 1 and argv.count("--json") == 1, "strict/json argv")
    require("--sandbox" in argv and argv[argv.index("--sandbox") + 1] == "read-only", "sandbox argv")
    require("-m" in argv and argv[argv.index("-m") + 1] == row["model"], "model argv")
    configs = [argv[index + 1] for index, token in enumerate(argv[:-1]) if token == "-c"]
    require(configs == [f'model_reasoning_effort="{row["reasoning_effort"]}"', "suppress_unstable_features_warning=true"], "config argv")
    stdout_raw = _read_regular(capture / "codex_stdout.jsonl", 64_000_000)
    lifecycle = _stdout_lifecycle(stdout_raw, complete=not require_active)
    thread_id = lifecycle["thread_id"]
    require(thread_id not in snapshot.get("thread_ids", []), "thread reused from prelaunch snapshot")

    state_path = _db_path(codex_home, "state")
    goal_path = _db_path(codex_home, "goals")
    with _connect_ro(state_path) as state:
        thread = _one_row(state, "SELECT * FROM threads WHERE id=?", (thread_id,), "thread")
    with _connect_ro(goal_path) as goals:
        goal = _one_row(goals, "SELECT * FROM thread_goals WHERE thread_id=?", (thread_id,), "goal")
    require(goal["goal_id"] not in snapshot.get("goal_ids", []), "goal reused from prelaunch snapshot")
    require(thread.get("source") == "exec" and thread.get("thread_source") == "user", "not a direct Codex exec task")
    require(thread.get("model") == row["model"], "effective recorded model mismatch")
    require(thread.get("reasoning_effort") == row["reasoning_effort"], "effective recorded reasoning effort mismatch")
    require(thread.get("cli_version") == row["cli_version"], "thread CLI version mismatch")
    require(goal.get("objective") == row["objective"], "goal DB objective mismatch")
    require(goal.get("token_budget") is None, "unrequested goal token budget")
    if require_active:
        require(goal.get("status") == "active", "goal is not active at subject-release gate")
    rollout_path, rollout_logical = _logical_rollout(codex_home, thread["rollout_path"])
    records, rollout_raw = _rollout_records(rollout_path)
    session = _payload(records[0])
    require(records[0]["record"].get("type") == "session_meta", "rollout first record is not session_meta")
    require(session.get("id") == thread_id and session.get("session_id") == thread_id, "session identity mismatch")
    require(session.get("source") == "exec" and session.get("originator") == "codex_exec", "session is not codex_exec")
    require(session.get("cli_version") == row["cli_version"], "rollout CLI version mismatch")
    bootstrap_lines = _bootstrap_message_lines(records, bootstrap)
    require(len(bootstrap_lines) == 1, "exact bootstrap prompt not found exactly once")
    calls = _goal_calls(records)
    require(len(calls) >= 3, "activation goal calls missing")
    require([c["method"] for c in calls[:3]] == ["get_goal", "create_goal", "get_goal"], "activation goal call sequence mismatch")
    require(_goal_projection(calls[0]["output"]) is None, "first get_goal was not null")
    created = _goal_projection(calls[1]["output"])
    reopened = _goal_projection(calls[2]["output"])
    require(isinstance(created, dict) and isinstance(reopened, dict), "active goal output missing")
    _assert_goal_projection(created, thread_id, row["objective"], "active")
    _assert_goal_projection(reopened, thread_id, row["objective"], "active")
    require(json.dumps(row["objective"], ensure_ascii=False) in calls[1]["code"], "create_goal input does not bind exact objective")
    actions = _action_calls(records, bootstrap_lines[0], calls[2]["output_line"])
    require(len(actions) == 3, "non-Goal action occurred before activation gate")
    require(all(a["payload"].get("type") == "custom_tool_call" for a in actions), "non-code Goal action before activation")
    launch_start = launch.get("started_at_ms")
    require(isinstance(launch_start, int), "process started_at_ms")
    require(thread.get("created_at_ms") >= launch_start and goal.get("created_at_ms") >= thread.get("created_at_ms"), "thread/goal creation chronology")
    activation = {
        "bootstrap_prompt": {"bytes": len(bootstrap_raw), "sha256": sha256(bootstrap_raw)},
        "create_goal_call_line": calls[1]["call_line"],
        "create_goal_output_line": calls[1]["output_line"],
        "goal_db_status_at_attestation": goal["status"],
        "goal_created_at_ms": goal["created_at_ms"],
        "goal_id": goal["goal_id"],
        "goal_status_at_tool_activation": "active",
        "rollout": {"bytes": len(rollout_raw), "logical_path": rollout_logical, "sha256": sha256(rollout_raw)},
        "second_get_goal_output_line": calls[2]["output_line"],
        "thread_created_at_ms": thread["created_at_ms"],
        "thread_id": thread_id,
    }
    return activation, records, thread, goal


def attest_codex(row_path: Path, capture: Path, codex_home: Path, gate_only: bool = False) -> dict[str, Any]:
    row = _load_row(row_path)
    require(row["adapter"] == "CODEX_NATIVE_GOAL_GATED_FIFO_V1", "not a Codex row")
    activation, records, thread, goal = _activation(row, capture, codex_home, require_active=gate_only)
    if gate_only:
        return {
            "schema_id": CODEX_SCHEMA,
            "status": "PASS_NATIVE_GOAL_ACTIVE_SUBJECT_RELEASE_AUTHORIZED",
            "authority": {"subject_release": True, "qualification_credit": 0},
            "activation": activation,
            "row": {"run_id": row["run_id"], "row_id": row["row_id"], "attempt": 0},
        }

    subject = _read_regular(capture / "subject_input.txt", 8_000_000)
    require(len(subject) == row["subject_utf8_bytes"] and sha256(subject) == row["subject_utf8_sha256"], "subject input identity mismatch")
    subject_text = subject.decode("utf-8")
    activation_line = activation["second_get_goal_output_line"]
    for entry in records:
        if entry["line"] <= activation_line:
            require(not any(subject_text in text for text in _texts(entry["record"])), "subject prompt appeared before Goal activation")

    reader_calls: list[dict[str, Any]] = []
    outputs: dict[str, tuple[int, Any]] = {}
    for entry in records:
        payload = _payload(entry)
        if payload.get("type") == "custom_tool_call_output" and isinstance(payload.get("call_id"), str):
            outputs[payload["call_id"]] = (entry["line"], payload.get("output"))
    for entry in records:
        payload = _payload(entry)
        if payload.get("type") != "custom_tool_call" or not isinstance(payload.get("input"), str):
            continue
        code = payload["input"]
        if "read_goal_subject.py" not in code:
            continue
        call_id = payload.get("call_id")
        require(isinstance(call_id, str) and call_id in outputs, "subject reader output missing")
        out_line, out = outputs[call_id]
        joined = "\n".join(_texts(out))
        require(subject_text in joined, "subject bytes absent from reader output")
        require(row["subject_utf8_sha256"] in code and str(row["subject_utf8_bytes"]) in code, "reader call commitment mismatch")
        reader_calls.append({"call_line": entry["line"], "output_line": out_line})
    require(len(reader_calls) == 1, "subject reader call cardinality")
    reader = reader_calls[0]
    require(reader["call_line"] > activation_line, "subject reader preceded activation")
    turns = _line_turns(records)
    activation_turn = turns.get(activation_line)
    subject_turn = turns.get(reader["call_line"])
    require(isinstance(activation_turn, str) and isinstance(subject_turn, str), "activation/subject turn identity missing")
    require(subject_turn != activation_turn, "subject was delivered in the pre-Goal activation turn")

    goal_calls = _goal_calls(records)
    updates = [call for call in goal_calls if call["method"] == "update_goal"]
    require(len(updates) == 1, "update_goal call cardinality")
    update = updates[0]
    require(update["call_line"] > reader["output_line"], "Goal completed before subject was visible")
    require(turns.get(update["call_line"]) == subject_turn, "Goal terminal update escaped subject continuation turn")
    require(re.search(r"status\s*:\s*[\"']complete[\"']", update["code"]), "update_goal did not request complete")
    terminal_projection = _goal_projection(update["output"])
    require(isinstance(terminal_projection, dict), "terminal Goal output missing")
    _assert_goal_projection(terminal_projection, activation["thread_id"], row["objective"], "complete")
    require(goal.get("status") == "complete", "Goal DB terminal state is not complete")
    require(goal.get("updated_at_ms") >= goal.get("created_at_ms"), "Goal terminal chronology")

    later_actions = _action_calls(records, update["output_line"], 1 << 62)
    require(not later_actions, "tool action occurred after terminal Goal receipt")
    final_messages: list[tuple[int, str]] = []
    for entry in records:
        if entry["line"] <= update["output_line"]:
            continue
        payload = _payload(entry)
        if payload.get("type") == "message" and payload.get("role") == "assistant":
            texts = [x.get("text") for x in payload.get("content", []) if isinstance(x, dict) and x.get("type") == "output_text" and isinstance(x.get("text"), str)]
            if texts:
                final_messages.append((entry["line"], "".join(texts)))
    require(len(final_messages) == 1, "terminal assistant message cardinality")
    require(turns.get(final_messages[0][0]) == subject_turn, "terminal delivery escaped subject continuation turn")
    reasoning_between = [
        entry for entry in records
        if reader["output_line"] < entry["line"] < update["call_line"]
        and _payload(entry).get("type") == "reasoning"
        and turns.get(entry["line"]) == subject_turn
    ]
    require(reasoning_between, "no subject reasoning evidence before terminal Goal update")
    last_raw = _read_regular(capture / "output_last_message.txt", 8_000_000)
    require(last_raw.decode("utf-8") == final_messages[0][1], "output-last-message mismatch")
    process = load_json(capture / "process_receipt.json", 2_000_000)
    _exact_keys(process, {
        "activation_error", "ended_at_ms", "pid", "processes", "rc", "requests", "retries",
        "schema_id", "started_at_ms", "stdin_closed", "subject_delivery", "subject_fifo_removed",
        "subject_release", "timed_out",
    }, "process receipt")
    require(process.get("schema_id") == PROCESS_SCHEMA, "process receipt schema")
    require(process.get("rc") == 0 and process.get("stdin_closed") is True, "Codex process did not exit cleanly")
    require(process.get("subject_fifo_removed") is True, "subject FIFO cleanup not settled")
    require(process.get("subject_release") == "AFTER_NATIVE_GOAL_ACTIVE_ATTESTATION", "subject release receipt mismatch")
    require(process.get("requests") == 1 and process.get("processes") == 1 and process.get("retries") == 0, "once-only accounting mismatch")
    require(process.get("timed_out") is False and process.get("activation_error") is None, "process failure fields")
    delivery = process.get("subject_delivery")
    require(isinstance(delivery, dict), "subject delivery receipt")
    _exact_keys(delivery, {"bytes", "closed_at_ms", "sha256", "status"}, "subject delivery")
    require(delivery == {
        "bytes": len(subject),
        "closed_at_ms": delivery["closed_at_ms"],
        "sha256": sha256(subject),
        "status": "DELIVERED_ONCE",
    } and isinstance(delivery["closed_at_ms"], int), "subject delivery identity")
    stderr_id = _identity(capture / "codex_stderr.bin", 64_000_000)
    stdout_id = _identity(capture / "codex_stdout.jsonl", 64_000_000)
    result = {
        "activation": activation,
        "adapter": row["adapter"],
        "authority": {"qualification_credit": 0, "external_gate_eligible": True},
        "process": {
            "ended_at_ms": process.get("ended_at_ms"),
            "rc": 0,
            "stderr": stderr_id,
            "stdout": stdout_id,
        },
        "row": {"attempt": 0, "row_id": row["row_id"], "run_id": row["run_id"]},
        "schema_id": CODEX_SCHEMA,
        "status": "PASS_NATIVE_CODEX_GOAL_LIFECYCLE_ZERO_INTERNAL_CREDIT_EXTERNAL_GATE_ELIGIBLE",
        "subject": {
            "activation_turn_id": activation_turn,
            "reader_call_line": reader["call_line"],
            "reader_output_line": reader["output_line"],
            "subject_turn_id": subject_turn,
            "utf8_bytes": len(subject),
            "utf8_sha256": sha256(subject),
        },
        "terminal": {
            "final_message": {"bytes": len(last_raw), "sha256": sha256(last_raw)},
            "goal_status": goal["status"],
            "goal_updated_at_ms": goal["updated_at_ms"],
            "update_goal_call_line": update["call_line"],
            "update_goal_output_line": update["output_line"],
        },
    }
    return result


def attest_omp(row_path: Path, receipt_path: Path) -> dict[str, Any]:
    row = _load_row(row_path)
    require(row["adapter"] == "OMP_NATIVE_GOAL_WINDOWS_EXTERNAL_V1", "not an OMP row")
    receipt = load_json(receipt_path, 8_000_000)
    required = {
        "schema_id", "adapter", "controller", "launch_argv", "task_id", "goal_id", "goal_mode",
        "objective", "criteria_sha256", "control_envelope_sha256", "subject_utf8_sha256",
        "subject_utf8_bytes", "task_created_at_ms", "goal_activated_at_ms", "subject_dispatched_at_ms",
        "terminal_goal_at_ms", "terminal_goal_state", "native_goal_creation_receipt",
        "native_goal_terminal_receipt", "subject_turns", "reuse", "retry", "raw_capture_inventory",
    }
    require(isinstance(receipt, dict), "OMP receipt object")
    _exact_keys(receipt, required, "OMP receipt")
    require(receipt["schema_id"] == OMP_SCHEMA and receipt["adapter"] == row["adapter"], "OMP schema/adapter")
    require(receipt["controller"] == "PREARRANGED_EXTERNAL_WINDOWS_HOST_CONTROLLER", "wrong OMP controller")
    require(receipt["launch_argv"] == ["omp", "--cwd", "P:\\"], "wrong OMP launch boundary")
    require(receipt["goal_mode"] == "OMP_NATIVE_GOAL_MODE", "not native OMP Goal Mode")
    require(receipt["objective"] == row["objective"], "OMP objective mismatch")
    require(receipt["criteria_sha256"] == sha256(canon(row["criteria"], newline=False)), "OMP criteria binding")
    require(receipt["control_envelope_sha256"] == sha256(canon(row["control_envelope"], newline=False)), "OMP control binding")
    require(receipt["subject_utf8_sha256"] == row["subject_utf8_sha256"] and receipt["subject_utf8_bytes"] == row["subject_utf8_bytes"], "OMP subject binding")
    require(all(isinstance(receipt[k], int) for k in ("task_created_at_ms", "goal_activated_at_ms", "subject_dispatched_at_ms", "terminal_goal_at_ms")), "OMP chronology types")
    require(receipt["task_created_at_ms"] <= receipt["goal_activated_at_ms"] < receipt["subject_dispatched_at_ms"] <= receipt["terminal_goal_at_ms"], "OMP Goal/subject chronology")
    require(receipt["terminal_goal_state"] == "complete", "OMP terminal Goal state")
    require(receipt["reuse"] is False and receipt["retry"] is False, "OMP reuse/retry")
    require(isinstance(receipt["task_id"], str) and receipt["task_id"], "OMP task identity")
    require(isinstance(receipt["goal_id"], str) and receipt["goal_id"], "OMP Goal identity")
    require(isinstance(receipt["subject_turns"], list) and receipt["subject_turns"], "OMP subject turns")
    for turn in receipt["subject_turns"]:
        require(isinstance(turn, dict) and set(turn) == {"ended_at_ms", "started_at_ms", "turn_id"}, "OMP turn shape")
        require(receipt["goal_activated_at_ms"] <= turn["started_at_ms"] <= turn["ended_at_ms"] <= receipt["terminal_goal_at_ms"], "OMP turn outside active Goal")
    require(isinstance(receipt["native_goal_creation_receipt"], dict) and isinstance(receipt["native_goal_terminal_receipt"], dict), "OMP native Goal receipts")
    require(isinstance(receipt["raw_capture_inventory"], list) and receipt["raw_capture_inventory"], "OMP raw capture inventory")
    return {
        "adapter": row["adapter"],
        "authority": {"external_gate_eligible": False, "qualification_credit": 0},
        "goal_id": receipt["goal_id"],
        "row": {"attempt": 0, "row_id": row["row_id"], "run_id": row["run_id"]},
        "schema_id": OMP_SCHEMA,
        "status": "PASS_OMP_WINDOWS_BOUNDARY_AND_DECLARED_GOAL_RECEIPT_SHAPE_ZERO_CREDIT_NATIVE_VERIFIER_PENDING",
        "task_id": receipt["task_id"],
    }


def attest_manifest(path: Path) -> dict[str, Any]:
    manifest = load_json(path, 64_000_000)
    require(isinstance(manifest, dict), "manifest object")
    _exact_keys(manifest, {"schema_id", "run_id", "rows", "qualification"}, "manifest")
    require(manifest["schema_id"] == MANIFEST_SCHEMA, "manifest schema")
    require(manifest["qualification"] == {"credit": 0, "clean_matrix_streak": 0}, "manifest must remain zero-credit pre-gate")
    require(isinstance(manifest["rows"], list) and manifest["rows"], "manifest rows")
    seen: dict[str, set[str]] = {key: set() for key in ("thread_id", "goal_id", "task_id", "objective_sha256", "subject_utf8_sha256", "row_key")}
    for row in manifest["rows"]:
        require(isinstance(row, dict), "manifest row")
        _exact_keys(row, {"adapter", "attestation_path", "goal_id", "objective_sha256", "row_id", "subject_utf8_sha256", "task_id"}, "manifest row")
        row_key = f"{manifest['run_id']}:{row['row_id']}:0"
        values = {
            "goal_id": row["goal_id"],
            "task_id": row["task_id"],
            "objective_sha256": row["objective_sha256"],
            "subject_utf8_sha256": row["subject_utf8_sha256"],
            "row_key": row_key,
        }
        if row["adapter"] == "CODEX_NATIVE_GOAL_GATED_FIFO_V1":
            values["thread_id"] = row["task_id"]
        for key, value in values.items():
            require(isinstance(value, str) and value and value not in seen[key], f"global uniqueness failure: {key}")
            seen[key].add(value)
    return {
        "authority": {"qualification_credit": 0, "matrix_launch": False},
        "row_count": len(manifest["rows"]),
        "run_id": manifest["run_id"],
        "schema_id": MANIFEST_SCHEMA,
        "status": "PASS_GLOBAL_GOAL_TASK_UNIQUENESS_ZERO_CREDIT",
    }


def _emit(value: dict[str, Any]) -> None:
    sys.stdout.buffer.write(canon(value))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    codex = sub.add_parser("attest-codex")
    codex.add_argument("--row-spec", type=Path, required=True)
    codex.add_argument("--capture-root", type=Path, required=True)
    codex.add_argument("--codex-home", type=Path, required=True)
    gate = sub.add_parser("attest-codex-activation")
    gate.add_argument("--row-spec", type=Path, required=True)
    gate.add_argument("--capture-root", type=Path, required=True)
    gate.add_argument("--codex-home", type=Path, required=True)
    omp = sub.add_parser("attest-omp")
    omp.add_argument("--row-spec", type=Path, required=True)
    omp.add_argument("--receipt", type=Path, required=True)
    manifest = sub.add_parser("attest-manifest")
    manifest.add_argument("--manifest", type=Path, required=True)
    args = parser.parse_args(argv)
    try:
        if args.command == "attest-codex":
            result = attest_codex(args.row_spec, args.capture_root, args.codex_home)
        elif args.command == "attest-codex-activation":
            result = attest_codex(args.row_spec, args.capture_root, args.codex_home, gate_only=True)
        elif args.command == "attest-omp":
            result = attest_omp(args.row_spec, args.receipt)
        else:
            result = attest_manifest(args.manifest)
        _emit(result)
        return 0
    except (Invalid, OSError, sqlite3.Error, UnicodeError) as exc:
        _emit({
            "authority": {"qualification_credit": 0, "subject_release": False},
            "error": str(exc),
            "schema_id": "pw-r9-goal-mode-attestation-failure-v1",
            "status": "FAIL_CLOSED_ZERO_CREDIT",
        })
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
