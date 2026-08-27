#!/usr/bin/env python3
"""Read-only attestor for the explicit-resume Goal-per-test-taker harness."""

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


ATTESTATION_SCHEMA = "pw-r9-codex-native-goal-resume-row-attestation-v4"
ROW_SCHEMA = "pw-r9-goal-mode-row-spec-v4"
LAUNCH_SCHEMA = "pw-r9-goal-mode-codex-launch-receipt-v4"
ACTIVATION_PROCESS_SCHEMA = "pw-r9-goal-mode-activation-process-receipt-v4"
RESUME_PROCESS_SCHEMA = "pw-r9-goal-mode-resume-process-receipt-v4"
SNAPSHOT_SCHEMA = "pw-r9-goal-mode-codex-prelaunch-snapshot-v4"
OMP_SCHEMA = "pw-r9-omp-native-goal-row-attestation-v2"
ADAPTER = "CODEX_NATIVE_GOAL_EXPLICIT_RESUME_FIFO_V4"
OMP_ADAPTER = "OMP_NATIVE_GOAL_WINDOWS_EXTERNAL_V1"
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX64_RE = re.compile(r"^[0-9a-f]{64}$")
TOOL_RE = re.compile(r"tools\.([A-Za-z_][A-Za-z0-9_]*)")


class Invalid(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise Invalid(message)


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        require(key not in out, f"duplicate JSON key: {key}")
        out[key] = value
    return out


def canon(value: Any, newline: bool = True) -> bytes:
    raw = json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return raw + (b"\n" if newline else b"")


def sha256(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def _read_regular(path: Path, limit: int) -> bytes:
    st = os.lstat(path)
    require(stat.S_ISREG(st.st_mode) and not path.is_symlink(), f"unsafe regular file: {path}")
    require(0 <= st.st_size <= limit, f"file size outside limit: {path}")
    raw = path.read_bytes()
    st2 = os.lstat(path)
    require(len(raw) == st.st_size, f"short read: {path}")
    require((st.st_dev, st.st_ino, st.st_size, st.st_mtime_ns) == (st2.st_dev, st2.st_ino, st2.st_size, st2.st_mtime_ns), f"changing file: {path}")
    return raw


def load_json(path: Path, limit: int = 8_000_000) -> Any:
    raw = _read_regular(path, limit)
    require(raw.endswith(b"\n") and not raw.endswith(b"\n\n") and b"\r" not in raw and b"\x00" not in raw, f"JSON framing: {path}")
    try:
        value = json.loads(raw, object_pairs_hook=_pairs, parse_constant=lambda value: (_ for _ in ()).throw(Invalid(f"nonfinite JSON: {value}")))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise Invalid(f"invalid JSON {path}: {exc}") from exc
    require(raw == canon(value), f"noncanonical JSON: {path}")
    return value


def _exact_keys(value: dict[str, Any], keys: Iterable[str], label: str) -> None:
    expected = set(keys)
    require(set(value) == expected, f"{label} keys mismatch: {sorted(set(value) ^ expected)}")


def _db_path(codex_home: Path, stem: str) -> Path:
    matches = sorted(codex_home.glob(f"{stem}_*.sqlite"))
    require(len(matches) == 1, f"expected one {stem} database")
    st = os.lstat(matches[0])
    require(stat.S_ISREG(st.st_mode) and not matches[0].is_symlink(), f"unsafe {stem} database")
    return matches[0]


def _connect_ro(path: Path) -> sqlite3.Connection:
    con = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=5)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA query_only=ON")
    return con


def _one_row(con: sqlite3.Connection, sql: str, args: tuple[Any, ...], label: str) -> dict[str, Any]:
    rows = con.execute(sql, args).fetchall()
    require(len(rows) == 1, f"expected one {label} row, got {len(rows)}")
    return dict(rows[0])


def _logical_rollout(codex_home: Path, raw_path: str) -> tuple[Path, str]:
    home = codex_home.resolve()
    path = Path(raw_path).resolve(strict=True)
    try:
        rel = path.relative_to(home)
    except ValueError as exc:
        raise Invalid("rollout escapes CODEX_HOME") from exc
    require(rel.parts and rel.parts[0] in {"sessions", "archived_sessions"}, "unexpected rollout namespace")
    return path, rel.as_posix()


def _rollout_records(path: Path) -> tuple[list[dict[str, Any]], bytes]:
    raw = _read_regular(path, 256_000_000)
    require(raw.endswith(b"\n"), "rollout must end LF")
    records: list[dict[str, Any]] = []
    for line_no, line in enumerate(raw.splitlines(), 1):
        require(line and b"\r" not in line, f"rollout framing line {line_no}")
        try:
            value = json.loads(line, object_pairs_hook=_pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite JSON: {item}")))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise Invalid(f"rollout JSON line {line_no}: {exc}") from exc
        require(isinstance(value, dict), f"rollout line {line_no} not object")
        records.append({"line": line_no, "record": value})
    require(records, "empty rollout")
    return records, raw


def _payload(entry: dict[str, Any]) -> dict[str, Any]:
    value = entry["record"].get("payload")
    return value if isinstance(value, dict) else {}


def _texts(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        return [text for item in value for text in _texts(item)]
    if isinstance(value, dict):
        return [text for item in value.values() for text in _texts(item)]
    return []


def _tool_result_json(output: Any) -> dict[str, Any]:
    candidates = [text for text in _texts(output) if text.strip().startswith("{")]
    parsed: list[dict[str, Any]] = []
    for text in candidates:
        try:
            value = json.loads(text.strip(), object_pairs_hook=_pairs)
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
            require(payload["call_id"] not in outputs, "duplicate custom tool output")
            outputs[payload["call_id"]] = (entry["line"], payload.get("output"))
    result: list[dict[str, Any]] = []
    for entry in records:
        payload = _payload(entry)
        if payload.get("type") != "custom_tool_call":
            continue
        call_id = payload.get("call_id")
        code = payload.get("input")
        require(isinstance(call_id, str) and call_id and isinstance(code, str), "custom tool call malformed")
        methods = TOOL_RE.findall(code)
        goal_methods = [method for method in methods if method in {"get_goal", "create_goal", "update_goal"}]
        if not goal_methods:
            continue
        require(payload.get("name") == "exec" and len(methods) == 1 and len(goal_methods) == 1, "goal call must be one nested code-mode method")
        require(call_id in outputs, "goal tool output missing")
        output_line, output = outputs[call_id]
        require(output_line > entry["line"], "goal output precedes call")
        result.append({"call_line": entry["line"], "code": code, "method": goal_methods[0], "output": _tool_result_json(output), "output_line": output_line})
    return result


def _goal_projection(output: dict[str, Any]) -> dict[str, Any] | None:
    goal = output.get("goal")
    require(goal is None or isinstance(goal, dict), "goal projection malformed")
    return goal


def _assert_goal(goal: dict[str, Any], thread_id: str, objective: str, status: str) -> None:
    require(goal.get("threadId") == thread_id, "Goal thread mismatch")
    require(goal.get("objective") == objective, "Goal objective mismatch")
    require(goal.get("status") == status, "Goal status mismatch")


def _message_lines(records: list[dict[str, Any]], role: str, text: str) -> list[int]:
    lines: list[int] = []
    for entry in records:
        payload = _payload(entry)
        if payload.get("type") != "message" or payload.get("role") != role:
            continue
        joined = "".join(item.get("text", "") for item in payload.get("content", []) if isinstance(item, dict) and item.get("type") in {"input_text", "output_text"})
        if joined == text:
            lines.append(entry["line"])
    return lines


def _action_calls(records: list[dict[str, Any]], after: int, through: int) -> list[dict[str, Any]]:
    kinds = {"function_call", "custom_tool_call", "local_shell_call", "web_search_call", "image_generation_call", "tool_search_call"}
    return [{"line": entry["line"], "payload": _payload(entry)} for entry in records if after < entry["line"] <= through and _payload(entry).get("type") in kinds]


def _line_turns(records: list[dict[str, Any]]) -> dict[int, str | None]:
    current: str | None = None
    result: dict[int, str | None] = {}
    for entry in records:
        record = entry["record"]
        if record.get("type") == "turn_context":
            candidate = record.get("turn_id")
            if candidate is None and isinstance(record.get("payload"), dict):
                candidate = record["payload"].get("turn_id")
            require(isinstance(candidate, str) and candidate, "turn_context missing turn_id")
            current = candidate
        result[entry["line"]] = current
    return result


def _stdout_lifecycle(raw: bytes, phase: str, complete: bool) -> dict[str, Any]:
    require(raw.endswith(b"\n") and b"\r" not in raw, f"{phase} stdout framing")
    events: list[dict[str, Any]] = []
    for index, line in enumerate(raw.splitlines(), 1):
        require(line, f"{phase} empty stdout line")
        try:
            event = json.loads(line, object_pairs_hook=_pairs)
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise Invalid(f"{phase} stdout JSON line {index}: {exc}") from exc
        require(isinstance(event, dict) and isinstance(event.get("type"), str), f"{phase} stdout event malformed")
        events.append(event)
    require(events and events[0].get("type") == "thread.started", f"{phase} thread.started first")
    require(sum(event.get("type") == "thread.started" for event in events) == 1, f"{phase} thread.started cardinality")
    require(not any(event.get("type") in {"turn.failed", "error"} for event in events), f"{phase} terminal failure event")
    state = "BETWEEN"
    started = completed_count = 0
    for event in events[1:]:
        kind = event.get("type")
        if kind == "turn.started":
            require(state == "BETWEEN", f"{phase} nested turn")
            state = "IN_TURN"; started += 1
        elif kind == "turn.completed":
            require(state == "IN_TURN", f"{phase} completion without turn")
            state = "BETWEEN"; completed_count += 1
        else:
            require(kind in {"item.started", "item.completed"} and state == "IN_TURN", f"{phase} item outside turn or unknown event")
    require(started == 1, f"{phase} must contain exactly one turn")
    if complete:
        require(completed_count == 1 and state == "BETWEEN" and events[-1].get("type") == "turn.completed", f"{phase} incomplete turn")
    else:
        require(completed_count in {0, 1}, f"{phase} completion cardinality")
    thread_id = events[0].get("thread_id")
    require(isinstance(thread_id, str) and UUID_RE.fullmatch(thread_id), f"{phase} thread_id malformed")
    messages = [event.get("item", {}).get("text") for event in events if event.get("type") == "item.completed" and isinstance(event.get("item"), dict) and event["item"].get("type") == "agent_message"]
    return {"events": len(events), "messages": messages, "thread_id": thread_id, "turn_completed": completed_count == 1}


def _activation_argv_identity(argv: Any, row: dict[str, Any], capture: Path) -> dict[str, str]:
    require(isinstance(argv, list) and all(isinstance(item, str) for item in argv), "activation argv type")
    require(len(argv) == 19, "activation argv length")
    require(argv[1:4] == ["exec", "--strict-config", "-C"], "activation argv prefix")
    require(argv[5:12] == ["--sandbox", "read-only", "--color", "never", "--json", "-m", row["model"]], "activation execution envelope")
    require(argv[12:17] == ["-c", f'model_reasoning_effort="{row["reasoning_effort"]}"', "-c", "suppress_unstable_features_warning=true", "-o"], "activation config envelope")
    require(Path(argv[17]) == capture / "activation_output_last_message.txt" and argv[18] == "-", "activation output/stdin paths")
    require("--ephemeral" not in argv and "resume" not in argv, "activation persistence/freshness")
    return {"codex": argv[0], "workspace": argv[4]}


def _resume_argv_identity(argv: Any, row: dict[str, Any], capture: Path, activation: dict[str, Any]) -> None:
    require(isinstance(argv, list) and all(isinstance(item, str) for item in argv), "resume argv type")
    require(len(argv) == 19, "resume argv length")
    require(argv[:6] == [activation["codex"], "-C", activation["workspace"], "--sandbox", "read-only", "exec"], "resume global envelope")
    require(argv[6:11] == ["resume", "--strict-config", "--json", "-m", row["model"]], "resume surface/model")
    require(argv[11:16] == ["-c", f'model_reasoning_effort="{row["reasoning_effort"]}"', "-c", "suppress_unstable_features_warning=true", "-o"], "resume config envelope")
    require(Path(argv[16]) == capture / "resume_output_last_message.txt" and argv[17:] == [activation["thread_id"], "-"], "resume output/session/stdin")
    require("--ephemeral" not in argv and argv.count("resume") == 1, "resume persistence/cardinality")


def _capture_modes(capture: Path) -> None:
    root = os.lstat(capture)
    require(stat.S_ISDIR(root.st_mode) and not capture.is_symlink() and stat.S_IMODE(root.st_mode) == 0o700, "capture root mode")
    for path in capture.iterdir():
        st = os.lstat(path)
        if stat.S_ISREG(st.st_mode):
            require(not path.is_symlink() and stat.S_IMODE(st.st_mode) == 0o600, f"capture file mode: {path.name}")
        elif stat.S_ISFIFO(st.st_mode):
            require(path.name == "subject.fifo" and stat.S_IMODE(st.st_mode) == 0o600, "capture FIFO mode")
        else:
            raise Invalid(f"unexpected capture member: {path.name}")


def _load_row(path: Path) -> dict[str, Any]:
    row = load_json(path, 2_000_000)
    require(isinstance(row, dict), "row object")
    _exact_keys(row, {"adapter", "attempt", "cli_version", "control_envelope", "criteria", "model", "objective", "reasoning_effort", "row_id", "run_id", "schema_id", "subject_utf8_bytes", "subject_utf8_sha256"}, "row")
    require(row["schema_id"] == ROW_SCHEMA and row["adapter"] in {ADAPTER, OMP_ADAPTER}, "row schema/adapter")
    require(row["attempt"] == 0 and isinstance(row["run_id"], str) and row["run_id"] and isinstance(row["row_id"], str) and row["row_id"], "row identity")
    require(isinstance(row["criteria"], dict) and isinstance(row["control_envelope"], dict), "row criteria/control")
    require(isinstance(row["subject_utf8_sha256"], str) and HEX64_RE.fullmatch(row["subject_utf8_sha256"]), "row subject hash")
    require(isinstance(row["subject_utf8_bytes"], int) and row["subject_utf8_bytes"] > 0, "row subject bytes")
    criteria_hash = sha256(canon(row["criteria"], newline=False))
    control_hash = sha256(canon(row["control_envelope"], newline=False))
    expected = f"R9 Goal Mode test taker {row['run_id']}/{row['row_id']}/0; criteria_sha256={criteria_hash}; control_envelope_sha256={control_hash}; subject_commitment_sha256={row['subject_utf8_sha256']}; execute exactly one gated subject after native Goal activation and settle terminal Goal state."
    require(row["objective"] == expected, "row objective derivation")
    return row


def _thread_goal(row: dict[str, Any], codex_home: Path, thread_id: str) -> tuple[dict[str, Any], dict[str, Any], list[dict[str, Any]], bytes, str]:
    with _connect_ro(_db_path(codex_home, "state")) as state:
        thread = _one_row(state, "SELECT * FROM threads WHERE id=?", (thread_id,), "thread")
    with _connect_ro(_db_path(codex_home, "goals")) as goals:
        goal = _one_row(goals, "SELECT * FROM thread_goals WHERE thread_id=?", (thread_id,), "goal")
    require(thread.get("source") == "exec" and thread.get("thread_source") == "user", "not direct exec task")
    require(thread.get("model") == row["model"] and thread.get("reasoning_effort") == row["reasoning_effort"] and thread.get("cli_version") == row["cli_version"], "recorded task envelope mismatch")
    require(goal.get("objective") == row["objective"] and goal.get("token_budget") is None, "Goal DB binding")
    rollout_path, logical = _logical_rollout(codex_home, thread["rollout_path"])
    records, raw = _rollout_records(rollout_path)
    session = _payload(records[0])
    require(records[0]["record"].get("type") == "session_meta" and session.get("id") == thread_id and session.get("session_id") == thread_id, "session identity")
    require(session.get("source") == "exec" and session.get("originator") == "codex_exec", "session origin")
    return thread, goal, records, raw, logical


def _assert_rollout_prefix(codex_home: Path, identity: Any, label: str) -> int:
    require(isinstance(identity, dict), f"{label} rollout prefix object")
    _exact_keys(identity, {"bytes", "logical_path", "sha256"}, f"{label} rollout prefix")
    require(isinstance(identity["bytes"], int) and identity["bytes"] > 0 and isinstance(identity["logical_path"], str) and isinstance(identity["sha256"], str) and HEX64_RE.fullmatch(identity["sha256"]), f"{label} rollout prefix identity")
    path = (codex_home / identity["logical_path"]).resolve(strict=True)
    try:
        path.relative_to(codex_home.resolve())
    except ValueError as exc:
        raise Invalid(f"{label} rollout prefix escapes CODEX_HOME") from exc
    raw = _read_regular(path, 256_000_000)
    require(identity["bytes"] <= len(raw), f"{label} rollout prefix longer than final")
    prefix = raw[:identity["bytes"]]
    require(prefix.endswith(b"\n") and sha256(prefix) == identity["sha256"], f"{label} rollout prefix mismatch")
    return identity["bytes"]


def _activation(row: dict[str, Any], capture: Path, codex_home: Path, require_active: bool) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    prompt_raw = _read_regular(capture / "activation_prompt.txt", 2_000_000)
    prompt = prompt_raw.decode("utf-8")
    launch = load_json(capture / "activation_launch_receipt.json", 2_000_000)
    snapshot = load_json(capture / "prelaunch_snapshot.json", 32_000_000)
    _exact_keys(launch, {"argv", "phase", "pid", "schema_id", "started_at_ms", "stdin"}, "activation launch")
    _exact_keys(snapshot, {"captured_at_ms", "goal_ids", "schema_id", "thread_ids"}, "snapshot")
    require(launch["schema_id"] == LAUNCH_SCHEMA and launch["phase"] == "ACTIVATION", "activation launch schema")
    require(snapshot["schema_id"] == SNAPSHOT_SCHEMA and snapshot["thread_ids"] == sorted(set(snapshot["thread_ids"])) and snapshot["goal_ids"] == sorted(set(snapshot["goal_ids"])), "snapshot identity")
    require(launch["stdin"] == {"bytes": len(prompt_raw), "sha256": sha256(prompt_raw)}, "activation stdin")
    argv_identity = _activation_argv_identity(launch["argv"], row, capture)
    lifecycle = _stdout_lifecycle(_read_regular(capture / "activation_stdout.jsonl", 64_000_000), "activation", complete=True)
    require(lifecycle["messages"] == ["GOAL_ACTIVE_READY_FOR_EXPLICIT_RESUME_HANDOFF"], "activation marker")
    thread_id = lifecycle["thread_id"]
    require(thread_id not in snapshot["thread_ids"], "thread reused")
    thread, goal, records, rollout_raw, logical = _thread_goal(row, codex_home, thread_id)
    require(goal.get("goal_id") not in snapshot["goal_ids"], "Goal reused")
    if require_active:
        require(goal.get("status") == "active", "Goal not active at activation handoff")
    lines = _message_lines(records, "user", prompt)
    require(len(lines) == 1, "activation prompt cardinality")
    calls = [call for call in _goal_calls(records) if call["call_line"] > lines[0]]
    require(len(calls) >= 3 and [call["method"] for call in calls[:3]] == ["get_goal", "create_goal", "get_goal"], "activation Goal sequence")
    require(_goal_projection(calls[0]["output"]) is None, "initial get_goal non-null")
    created = _goal_projection(calls[1]["output"]); reopened = _goal_projection(calls[2]["output"])
    require(isinstance(created, dict) and isinstance(reopened, dict), "active Goal projections")
    _assert_goal(created, thread_id, row["objective"], "active"); _assert_goal(reopened, thread_id, row["objective"], "active")
    require(json.dumps(row["objective"], ensure_ascii=False) in calls[1]["code"], "create_goal objective input")
    actions = _action_calls(records, lines[0], calls[2]["output_line"])
    require(len(actions) == 3 and all(item["payload"].get("type") == "custom_tool_call" for item in actions), "pre-activation non-Goal action")
    turns = _line_turns(records)
    activation_turn = turns.get(calls[2]["output_line"])
    require(isinstance(activation_turn, str), "activation turn identity")
    marker_lines = _message_lines(records, "assistant", "GOAL_ACTIVE_READY_FOR_EXPLICIT_RESUME_HANDOFF")
    require(len(marker_lines) == 1 and marker_lines[0] > calls[2]["output_line"] and turns.get(marker_lines[0]) == activation_turn, "activation rollout marker")
    return {"activation_turn_id": activation_turn, "codex": argv_identity["codex"], "create_goal_output_line": calls[1]["output_line"], "goal_id": goal["goal_id"], "rollout": {"bytes": len(rollout_raw), "logical_path": logical, "sha256": sha256(rollout_raw)}, "second_get_goal_output_line": calls[2]["output_line"], "thread_id": thread_id, "workspace": argv_identity["workspace"]}, records, thread, goal


def _resume(row: dict[str, Any], capture: Path, codex_home: Path, activation: dict[str, Any], complete: bool) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, Any]]:
    prompt_raw = _read_regular(capture / "continuation_prompt.txt", 2_000_000)
    prompt = prompt_raw.decode("utf-8")
    launch = load_json(capture / "resume_launch_receipt.json", 2_000_000)
    _exact_keys(launch, {"argv", "phase", "pid", "schema_id", "started_at_ms", "stdin"}, "resume launch")
    require(launch["schema_id"] == LAUNCH_SCHEMA and launch["phase"] == "RESUME" and launch["stdin"] == {"bytes": len(prompt_raw), "sha256": sha256(prompt_raw)}, "resume launch binding")
    _resume_argv_identity(launch["argv"], row, capture, activation)
    lifecycle = _stdout_lifecycle(_read_regular(capture / "resume_stdout.jsonl", 64_000_000), "resume", complete=complete)
    require(lifecycle["thread_id"] == activation["thread_id"], "resume stdout changed task")
    _, goal, records, _, _ = _thread_goal(row, codex_home, activation["thread_id"])
    require(goal.get("goal_id") == activation["goal_id"], "resume Goal identity changed")
    if not complete:
        require(goal.get("status") == "active", "Goal not active at resumed release gate")
    lines = _message_lines(records, "user", prompt)
    require(len(lines) == 1 and lines[0] > activation["second_get_goal_output_line"], "continuation prompt position")
    calls = [call for call in _goal_calls(records) if call["call_line"] > lines[0]]
    require(calls and calls[0]["method"] == "get_goal", "resumed first Goal call must be get_goal")
    resumed_goal = _goal_projection(calls[0]["output"])
    require(isinstance(resumed_goal, dict), "resumed get_goal output")
    _assert_goal(resumed_goal, activation["thread_id"], row["objective"], "active")
    actions = _action_calls(records, lines[0], calls[0]["output_line"])
    require(len(actions) == 1 and actions[0]["payload"].get("type") == "custom_tool_call", "action before resumed Goal gate")
    turns = _line_turns(records)
    resume_turn = turns.get(calls[0]["output_line"])
    require(isinstance(resume_turn, str) and resume_turn != activation["activation_turn_id"], "resume did not create distinct Goal turn")
    prior_messages = [entry for entry in records if entry["line"] < lines[0] and turns.get(entry["line"]) == resume_turn and _payload(entry).get("type") == "message"]
    require(len(prior_messages) == 1, "native Goal context cardinality")
    context_payload = _payload(prior_messages[0])
    context_content = context_payload.get("content")
    require(context_payload.get("role") == "user" and isinstance(context_content, list) and len(context_content) == 1 and isinstance(context_content[0], dict) and context_content[0].get("type") == "input_text" and isinstance(context_content[0].get("text"), str), "native Goal context envelope")
    context_text = context_content[0]["text"]
    require(context_text.startswith('<codex_internal_context source="goal">\nContinue working toward the active thread goal.\n') and context_text.endswith("\n</codex_internal_context>"), "native Goal context framing")
    require(context_text.count(f"<objective>\n{row['objective']}\n</objective>") == 1 and "This goal persists across turns." in context_text and "Only use status `blocked`" in context_text, "native Goal context objective/lifecycle")
    prior_reasoning = [entry for entry in records if entry["line"] < lines[0] and turns.get(entry["line"]) == resume_turn and _payload(entry).get("type") == "reasoning"]
    prior_actions = [entry for entry in _action_calls(records, 0, lines[0]) if turns.get(entry["line"]) == resume_turn]
    require(not prior_reasoning and not prior_actions, "action or reasoning preceded explicit continuation prompt")
    early_turn_actions = [item for item in _action_calls(records, 0, calls[0]["output_line"]) if turns.get(item["line"]) == resume_turn]
    require(len(early_turn_actions) == 1 and early_turn_actions[0]["line"] == calls[0]["call_line"], "action preceded resumed bootstrap Goal gate")
    context_raw = context_text.encode("utf-8")
    return {"continuation_prompt_line": lines[0], "get_goal_call_line": calls[0]["call_line"], "get_goal_output_line": calls[0]["output_line"], "native_goal_context": {"bytes": len(context_raw), "line": prior_messages[0]["line"], "objective_bound": True, "sha256": sha256(context_raw)}, "resume_turn_id": resume_turn, "stdout_messages": lifecycle["messages"]}, records, goal


def attest_codex(row_path: Path, capture: Path, codex_home: Path, stage: str = "final") -> dict[str, Any]:
    row = _load_row(row_path)
    require(row["adapter"] == ADAPTER, "not explicit-resume Codex row")
    _capture_modes(capture)
    activation, _, _, _ = _activation(row, capture, codex_home, require_active=stage != "final")
    if stage == "activation":
        return {"activation": activation, "authority": {"qualification_credit": 0, "resume_launch": True, "subject_release": False}, "schema_id": ATTESTATION_SCHEMA, "status": "PASS_NATIVE_GOAL_ACTIVE_EXPLICIT_RESUME_AUTHORIZED_SUBJECT_WITHHELD"}
    resume, records, goal = _resume(row, capture, codex_home, activation, complete=stage == "final")
    if stage == "resume":
        return {"activation": activation, "authority": {"qualification_credit": 0, "subject_release": True}, "resume": resume, "schema_id": ATTESTATION_SCHEMA, "status": "PASS_SAME_TASK_RESUMED_GOAL_ACTIVE_SUBJECT_RELEASE_AUTHORIZED"}
    activation_gate = load_json(capture / "activation_goal_active_gate.json", 4_000_000)
    resume_gate = load_json(capture / "resume_goal_active_gate.json", 4_000_000)
    require(isinstance(activation_gate, dict) and activation_gate.get("schema_id") == ATTESTATION_SCHEMA and activation_gate.get("status") == "PASS_NATIVE_GOAL_ACTIVE_EXPLICIT_RESUME_AUTHORIZED_SUBJECT_WITHHELD", "durable activation gate receipt")
    require(activation_gate.get("authority") == {"qualification_credit": 0, "resume_launch": True, "subject_release": False}, "activation gate authority")
    require(isinstance(activation_gate.get("activation"), dict) and all(activation_gate["activation"].get(key) == activation.get(key) for key in ("activation_turn_id", "create_goal_output_line", "goal_id", "second_get_goal_output_line", "thread_id")), "activation gate stable identity")
    require(isinstance(resume_gate, dict) and resume_gate.get("schema_id") == ATTESTATION_SCHEMA and resume_gate.get("status") == "PASS_SAME_TASK_RESUMED_GOAL_ACTIVE_SUBJECT_RELEASE_AUTHORIZED", "durable resume gate receipt")
    require(resume_gate.get("authority") == {"qualification_credit": 0, "subject_release": True}, "resume gate authority")
    require(isinstance(resume_gate.get("resume"), dict) and all(resume_gate["resume"].get(key) == resume.get(key) for key in ("continuation_prompt_line", "get_goal_call_line", "get_goal_output_line", "native_goal_context", "resume_turn_id")), "resume gate stable identity")
    require(isinstance(resume_gate.get("activation"), dict) and all(resume_gate["activation"].get(key) == activation.get(key) for key in ("activation_turn_id", "goal_id", "thread_id")), "resume gate activation identity")
    activation_prefix_bytes = _assert_rollout_prefix(codex_home, activation_gate["activation"].get("rollout"), "activation gate")
    resume_prefix_bytes = _assert_rollout_prefix(codex_home, resume_gate["activation"].get("rollout"), "resume gate")
    require(activation_prefix_bytes < resume_prefix_bytes <= activation["rollout"]["bytes"], "Goal gate rollout prefix chronology")
    subject = _read_regular(capture / "subject_input.txt", 8_000_000)
    require(len(subject) == row["subject_utf8_bytes"] and sha256(subject) == row["subject_utf8_sha256"], "subject identity")
    subject_text = subject.decode("utf-8")
    for entry in records:
        if entry["line"] <= resume["get_goal_output_line"]:
            require(not any(subject_text in text for text in _texts(entry["record"])), "subject appeared before resumed active Goal gate")
    outputs: dict[str, tuple[int, Any]] = {}
    for entry in records:
        payload = _payload(entry)
        if payload.get("type") == "custom_tool_call_output" and isinstance(payload.get("call_id"), str):
            outputs[payload["call_id"]] = (entry["line"], payload.get("output"))
    readers: list[dict[str, int]] = []
    for entry in records:
        payload = _payload(entry)
        if payload.get("type") != "custom_tool_call" or not isinstance(payload.get("input"), str) or "read_goal_subject.py" not in payload["input"]:
            continue
        call_id = payload.get("call_id")
        require(isinstance(call_id, str) and call_id in outputs, "reader output missing")
        output_line, output = outputs[call_id]
        require(subject_text in "\n".join(_texts(output)), "reader output lacks exact subject")
        require(row["subject_utf8_sha256"] in payload["input"] and str(row["subject_utf8_bytes"]) in payload["input"] and "--timeout-seconds 20" in payload["input"] and "--kill-after=5s 25s" in payload["input"], "reader commitment")
        readers.append({"call_line": entry["line"], "output_line": output_line})
    require(len(readers) == 1 and readers[0]["call_line"] > resume["get_goal_output_line"], "reader cardinality/order")
    reader = readers[0]
    turns = _line_turns(records)
    require(turns.get(reader["call_line"]) == resume["resume_turn_id"], "subject escaped resumed Goal turn")
    updates = [call for call in _goal_calls(records) if call["method"] == "update_goal" and call["call_line"] > reader["output_line"]]
    require(len(updates) == 1, "terminal update_goal cardinality")
    update = updates[0]
    require(turns.get(update["call_line"]) == resume["resume_turn_id"] and re.search(r"status\s*:\s*[\"']complete[\"']", update["code"]), "terminal update Goal turn/status")
    terminal_goal = _goal_projection(update["output"])
    require(isinstance(terminal_goal, dict), "terminal Goal output")
    _assert_goal(terminal_goal, activation["thread_id"], row["objective"], "complete")
    require(goal.get("status") == "complete", "Goal DB not complete")
    reasoning = [entry for entry in records if reader["output_line"] < entry["line"] < update["call_line"] and _payload(entry).get("type") == "reasoning" and turns.get(entry["line"]) == resume["resume_turn_id"]]
    require(reasoning, "no subject reasoning before Goal completion")
    require(not _action_calls(records, update["output_line"], 1 << 62), "action after terminal Goal receipt")
    finals: list[str] = []
    for entry in records:
        if entry["line"] <= update["output_line"] or turns.get(entry["line"]) != resume["resume_turn_id"]:
            continue
        payload = _payload(entry)
        if payload.get("type") == "message" and payload.get("role") == "assistant":
            text = "".join(item.get("text", "") for item in payload.get("content", []) if isinstance(item, dict) and item.get("type") == "output_text")
            if text:
                finals.append(text)
    require(len(finals) == 1, "terminal assistant message cardinality")
    require(resume["stdout_messages"] == [finals[0]], "resume JSONL terminal message mismatch")
    last = _read_regular(capture / "resume_output_last_message.txt", 8_000_000)
    require(last.decode("utf-8") == finals[0], "resume output-last-message mismatch")
    activation_process = load_json(capture / "activation_process_receipt.json", 2_000_000)
    resume_process = load_json(capture / "resume_process_receipt.json", 2_000_000)
    _exact_keys(activation_process, {"ended_at_ms", "handoff", "pid", "rc", "schema_id", "started_at_ms", "stdin_closed", "timed_out"}, "activation process")
    _exact_keys(resume_process, {"ended_at_ms", "goal_restore_error", "pid", "rc", "reader_quiescence", "schema_id", "started_at_ms", "stdin_closed", "subject_delivery", "subject_fifo_removed", "subject_release", "timed_out"}, "resume process")
    require(activation_process["schema_id"] == ACTIVATION_PROCESS_SCHEMA and activation_process["handoff"] in {"PROCESS_EXITED_AFTER_GATE", "CONTROLLER_TERMINATED_AFTER_GATE"} and activation_process["timed_out"] is False and activation_process["stdin_closed"] is True, "activation handoff process")
    require((activation_process["handoff"] == "PROCESS_EXITED_AFTER_GATE" and activation_process["rc"] == 0) or (activation_process["handoff"] == "CONTROLLER_TERMINATED_AFTER_GATE" and activation_process["rc"] in {-15, -9}), "activation exit code/handoff mismatch")
    require(resume_process["schema_id"] == RESUME_PROCESS_SCHEMA and resume_process["rc"] == 0 and resume_process["stdin_closed"] is True and resume_process["timed_out"] is False and resume_process["goal_restore_error"] is None, "resume process failure")
    require(resume_process["subject_fifo_removed"] is True and resume_process["subject_release"] == "AFTER_RESUMED_SAME_GOAL_ACTIVE_ATTESTATION", "resume subject release")
    require(resume_process["reader_quiescence"] == {"detected_pids": [], "kill_sent": 0, "remaining_pids": [], "term_sent": 0}, "reader process did not quiesce naturally")
    delivery = resume_process["subject_delivery"]
    require(isinstance(delivery, dict), "delivery object")
    _exact_keys(delivery, {"bytes", "closed_at_ms", "sha256", "status"}, "delivery")
    require(delivery["bytes"] == len(subject) and delivery["sha256"] == sha256(subject) and delivery["status"] == "DELIVERED_ONCE" and isinstance(delivery["closed_at_ms"], int), "delivery identity")
    require(_read_regular(capture / "activation_stderr.bin", 64_000_000) == b"" and _read_regular(capture / "resume_stderr.bin", 64_000_000) == b"", "Codex stderr must be empty")
    return {"activation": activation, "adapter": ADAPTER, "authority": {"external_gate_eligible": True, "qualification_credit": 0}, "process_accounting": {"fresh_tasks": 1, "processes": 2, "resume_operations": 1, "retries": 0, "subject_deliveries": 1}, "resume": resume, "row": {"attempt": 0, "row_id": row["row_id"], "run_id": row["run_id"]}, "schema_id": ATTESTATION_SCHEMA, "status": "PASS_NATIVE_CODEX_GOAL_EXPLICIT_RESUME_LIFECYCLE_ZERO_INTERNAL_CREDIT", "subject": {"reader_call_line": reader["call_line"], "reader_output_line": reader["output_line"], "utf8_bytes": len(subject), "utf8_sha256": sha256(subject)}, "terminal": {"final_message": {"bytes": len(last), "sha256": sha256(last)}, "goal_status": "complete", "update_goal_call_line": update["call_line"], "update_goal_output_line": update["output_line"]}}


def attest_omp(row_path: Path, receipt_path: Path) -> dict[str, Any]:
    row = _load_row(row_path)
    require(row["adapter"] == OMP_ADAPTER, "not OMP row")
    receipt = load_json(receipt_path, 8_000_000)
    required = {"adapter", "controller", "goal_activated_at_ms", "goal_id", "goal_mode", "launch_argv", "native_goal_creation_receipt", "native_goal_terminal_receipt", "objective", "raw_capture_inventory", "retry", "reuse", "schema_id", "subject_dispatched_at_ms", "subject_turns", "subject_utf8_bytes", "subject_utf8_sha256", "task_created_at_ms", "task_id", "terminal_goal_at_ms", "terminal_goal_state"}
    require(isinstance(receipt, dict), "OMP receipt object"); _exact_keys(receipt, required, "OMP receipt")
    require(receipt["schema_id"] == OMP_SCHEMA and receipt["adapter"] == OMP_ADAPTER, "OMP schema")
    require(receipt["controller"] == "PREARRANGED_EXTERNAL_WINDOWS_HOST_CONTROLLER" and receipt["launch_argv"] == ["omp", "--cwd", "P:\\"], "OMP Windows boundary")
    require(receipt["goal_mode"] == "OMP_NATIVE_GOAL_MODE" and receipt["objective"] == row["objective"], "OMP Goal binding")
    require(receipt["subject_utf8_sha256"] == row["subject_utf8_sha256"] and receipt["subject_utf8_bytes"] == row["subject_utf8_bytes"], "OMP subject binding")
    require(receipt["task_created_at_ms"] <= receipt["goal_activated_at_ms"] < receipt["subject_dispatched_at_ms"] <= receipt["terminal_goal_at_ms"], "OMP chronology")
    require(receipt["terminal_goal_state"] == "complete" and receipt["retry"] is False and receipt["reuse"] is False, "OMP terminal/reuse")
    require(isinstance(receipt["native_goal_creation_receipt"], dict) and isinstance(receipt["native_goal_terminal_receipt"], dict) and isinstance(receipt["raw_capture_inventory"], list) and receipt["raw_capture_inventory"], "OMP native evidence")
    return {"adapter": OMP_ADAPTER, "authority": {"external_gate_eligible": False, "qualification_credit": 0}, "goal_id": receipt["goal_id"], "schema_id": OMP_SCHEMA, "status": "PASS_OMP_WINDOWS_BOUNDARY_DECLARED_NATIVE_GOAL_SHAPE_ZERO_CREDIT_VERIFIER_PENDING", "task_id": receipt["task_id"]}


def _emit(value: dict[str, Any]) -> None:
    sys.stdout.buffer.write(canon(value))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    for name in ("attest-activation", "attest-resume", "attest-final"):
        item = sub.add_parser(name); item.add_argument("--row-spec", type=Path, required=True); item.add_argument("--capture-root", type=Path, required=True); item.add_argument("--codex-home", type=Path, required=True)
    omp = sub.add_parser("attest-omp"); omp.add_argument("--row-spec", type=Path, required=True); omp.add_argument("--receipt", type=Path, required=True)
    args = parser.parse_args(argv)
    try:
        if args.command == "attest-omp":
            result = attest_omp(args.row_spec, args.receipt)
        else:
            stage = {"attest-activation": "activation", "attest-resume": "resume", "attest-final": "final"}[args.command]
            result = attest_codex(args.row_spec, args.capture_root, args.codex_home, stage)
        _emit(result); return 0
    except (Invalid, OSError, sqlite3.Error, UnicodeError) as exc:
        _emit({"authority": {"qualification_credit": 0, "subject_release": False}, "error": str(exc), "schema_id": "pw-r9-goal-mode-attestation-failure-v4", "status": "FAIL_CLOSED_ZERO_CREDIT"}); return 1


if __name__ == "__main__":
    raise SystemExit(main())
