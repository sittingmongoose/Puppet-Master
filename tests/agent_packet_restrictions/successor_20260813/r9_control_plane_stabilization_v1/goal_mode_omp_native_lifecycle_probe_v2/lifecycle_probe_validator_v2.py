#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import os
import re
import stat
import sys
from pathlib import Path
from typing import Any, Callable


HERE = Path(__file__).resolve().parent
CONTRACT_PATH = HERE / "lifecycle_probe_contract_v2.json"
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
EXPECTED_CONTRACT_SCHEMA = "pw-r9-goal-mode-omp-native-lifecycle-probe-contract-v2"
EXPECTED_RESPONSE_SCHEMA = "pw-r9-goal-mode-omp-native-lifecycle-probe-response-v2"
EXPECTED_PROBE_ID = "omp-goal-lifecycle-probe-002"
EXPECTED_OBJECTIVE = "Return only GOAL_LIFECYCLE_PROBE_PASS. Then use the goal tool to complete this Goal."
EXPECTED_OUTPUT = "GOAL_LIFECYCLE_PROBE_PASS"
OLD_SESSION_ID = "01a02a3e-0a95-7000-b17e-adb2ea911fde"
EXPECTED_AUTHORITY = {
    "bridge_install": False,
    "canary_launch": False,
    "headless_handoff": False,
    "lifecycle_probe_launch": False,
    "matrix_launch": False,
    "qualification_credit": 0,
    "qualification_streak_clean_matrices": 0,
    "review_atom_launch": False,
    "subject_launch": False,
}
CONTRACT_KEYS = {
    "artifact_id",
    "authority",
    "bindings",
    "evidence_contract",
    "execution_contract",
    "failure_policy",
    "lineage",
    "probe_atom",
    "qualification",
    "response_contract",
    "schema_id",
    "status",
    "upstream_source_pins",
    "validation",
}
RESPONSE_KEYS = {
    "authority",
    "calls",
    "custody",
    "first_mismatch",
    "freshness",
    "goal",
    "process",
    "probe_id",
    "records",
    "schema_id",
    "status",
    "surface",
}
RESPONSE_CONTRACT_KEYS = {
    "calls_exact_fields",
    "custody_exact_fields",
    "exact_fields",
    "freshness_exact_fields",
    "goal_exact_fields",
    "process_exact_fields",
    "record_line_sha256_basis",
    "records_exact_fields",
    "schema_id",
    "status_values",
}
CALL_KEYS = {"control_prompt_count", "new_omp_process_count", "provider_request_count", "scored_subject_count"}
CUSTODY_KEYS = {
    "copy_bytes",
    "copy_path",
    "copy_sha256",
    "session_source_basename",
    "session_source_bytes",
    "session_source_closed",
    "session_source_lock_released",
    "session_source_sha256",
    "source_copy_equal",
}
FRESHNESS_KEYS = {
    "goal_id_prior_overlap_count",
    "process_overlap_observed",
    "session_id",
    "session_id_prior_overlap_count",
}
GOAL_KEYS = {
    "goal_id",
    "objective_utf8",
    "objective_utf8_bytes",
    "objective_utf8_sha256",
    "output_utf8",
    "output_utf8_bytes",
    "output_utf8_sha256",
    "terminal_status",
}
PROCESS_KEYS = {
    "argv",
    "cwd",
    "end_utc",
    "exit_code",
    "natural_exit",
    "pid",
    "start_utc",
    "windows_owner_task_id",
}
RECORD_NAMES = (
    "active_goal",
    "assistant_output",
    "complete_goal",
    "control_user",
    "goal_completed",
    "mode_none",
    "session_header",
)
RECORD_KEYS = {"source_record_count"} | {
    suffix for name in RECORD_NAMES for suffix in (f"{name}_line", f"{name}_line_sha256")
}
ENTRY_BASE_KEYS = {"type", "id", "parentId", "timestamp"}
GOAL_REQUIRED_KEYS = {"id", "objective", "status", "tokensUsed", "timeUsedSeconds", "createdAt", "updatedAt"}
GOAL_OPTIONAL_KEYS = {"tokenBudget"}


class Invalid(ValueError):
    pass


def _reject_constant(value: str) -> None:
    raise Invalid(f"nonfinite JSON number: {value}")


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise Invalid(f"duplicate JSON key: {key}")
        out[key] = value
    return out


def _decode(data: bytes) -> Any:
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise Invalid("not UTF-8") from exc
    try:
        value = json.loads(text, object_pairs_hook=_pairs, parse_constant=_reject_constant)
    except (json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"invalid JSON: {exc}") from exc
    _finite(value)
    return value


def _finite(value: Any) -> None:
    if isinstance(value, float) and not math.isfinite(value):
        raise Invalid("nonfinite JSON number")
    if isinstance(value, list):
        for item in value:
            _finite(item)
    elif isinstance(value, dict):
        for item in value.values():
            _finite(item)


def _canon(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False) + "\n").encode()


def _read_regular(path: Path) -> bytes:
    if path.is_symlink():
        raise Invalid(f"symlink forbidden: {path}")
    try:
        st = path.stat()
    except OSError as exc:
        raise Invalid(f"missing or unreadable path: {path}") from exc
    if not stat.S_ISREG(st.st_mode):
        raise Invalid(f"regular file required: {path}")
    return path.read_bytes()


def _load_canonical(path: Path) -> tuple[dict[str, Any], bytes]:
    data = _read_regular(path)
    value = _decode(data)
    if not isinstance(value, dict):
        raise Invalid(f"top-level object required: {path}")
    if data != _canon(value):
        raise Invalid(f"canonical sorted minified JSON with one LF required: {path}")
    return value, data


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _exact_keys(value: Any, expected: set[str], label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise Invalid(f"{label}: object required")
    observed = set(value)
    if observed != expected:
        raise Invalid(f"{label}: exact keys mismatch missing={sorted(expected-observed)} extra={sorted(observed-expected)}")
    return value


def _identity(text: str) -> tuple[int, str]:
    data = text.encode("utf-8")
    return len(data), _sha(data)


def _repo_root() -> Path:
    for parent in (HERE, *HERE.parents):
        if (parent / ".git").exists():
            return parent
    raise Invalid("repository root not found")


def _check_binding(binding: dict[str, Any]) -> None:
    _exact_keys(binding, {"bytes", "mode", "path", "root", "sha256"}, "binding")
    if binding["root"] == "repo":
        path = (HERE / binding["path"]).resolve()
    elif binding["root"] == "cursor":
        path = (_repo_root().parent / binding["path"]).resolve()
    else:
        raise Invalid("binding root")
    data = _read_regular(path)
    mode = f"{stat.S_IMODE(path.stat().st_mode):04o}"
    if len(data) != binding["bytes"] or _sha(data) != binding["sha256"] or mode != binding["mode"]:
        raise Invalid(f"binding identity mismatch: {binding['path']}")


def check_contract() -> tuple[dict[str, Any], bytes]:
    contract, data = _load_canonical(CONTRACT_PATH)
    _exact_keys(contract, CONTRACT_KEYS, "contract")
    if contract["schema_id"] != EXPECTED_CONTRACT_SCHEMA:
        raise Invalid("contract schema")
    if contract["authority"] != EXPECTED_AUTHORITY:
        raise Invalid("contract authority")
    if contract["status"] != "DESIGN_AND_MECHANICAL_VALIDATION_ONLY_ZERO_CREDIT_NO_LAUNCH":
        raise Invalid("contract status")
    for binding in contract["bindings"]:
        _check_binding(binding)
    atom = contract["probe_atom"]
    if atom["atom_id"] != EXPECTED_PROBE_ID or atom["goal_objective_utf8"] != EXPECTED_OBJECTIVE:
        raise Invalid("probe atom identity")
    if atom["output_utf8"] != EXPECTED_OUTPUT:
        raise Invalid("probe output")
    for prefix, maximum in (("goal_objective", 256), ("acceptance_criterion", 256), ("output", 128)):
        text = atom[f"{prefix}_utf8"]
        size, digest = _identity(text)
        if size != atom[f"{prefix}_utf8_bytes"] or digest != atom[f"{prefix}_utf8_sha256"] or size > maximum:
            raise Invalid(f"probe {prefix} binding")
    if atom["operation_count_exact"] != 1 or atom["prompt_count_exact"] != 1:
        raise Invalid("atomic operation or prompt count")
    if atom["fresh_native_goal_count_exact"] != 1 or atom["qualification_class"] != "NON_SCORED_ZERO_CREDIT_CONTROL":
        raise Invalid("Goal or qualification class")
    execution = contract["execution_contract"]
    if execution["handoff"]["original_launch_argv"] != ["omp", "--cwd", "P:\\"]:
        raise Invalid("original Windows launch boundary")
    if execution["surfaces"]["visible_tui"]["argv"] != ["omp", "--cwd", "P:\\"]:
        raise Invalid("visible TUI argv")
    headless = execution["surfaces"]["headless_acp"]
    if headless["argv"] != ["omp", "--cwd", "P:\\", "acp"] or headless["current_runtime_authority"] is not False:
        raise Invalid("headless boundary or authority")
    if contract["qualification"] != {
        "canary_credit": 0,
        "current_streak": 0,
        "current_value": "0/2",
        "full_matrix_launch_frozen": True,
        "lifecycle_probe_credit": 0,
        "required_clean_full_matrices": 2,
    }:
        raise Invalid("qualification freeze")
    response_contract = contract["response_contract"]
    _exact_keys(response_contract, RESPONSE_CONTRACT_KEYS, "response contract")
    if response_contract["schema_id"] != EXPECTED_RESPONSE_SCHEMA or set(response_contract["exact_fields"]) != RESPONSE_KEYS:
        raise Invalid("response contract")
    exact_nested = (
        ("calls_exact_fields", CALL_KEYS),
        ("custody_exact_fields", CUSTODY_KEYS),
        ("freshness_exact_fields", FRESHNESS_KEYS),
        ("goal_exact_fields", GOAL_KEYS),
        ("process_exact_fields", PROCESS_KEYS),
        ("records_exact_fields", RECORD_KEYS),
    )
    for field, expected in exact_nested:
        if set(response_contract[field]) != expected:
            raise Invalid(f"response contract {field}")
    if response_contract["record_line_sha256_basis"] != "EXACT_JSONL_RECORD_BYTES_EXCLUDING_TERMINAL_LF":
        raise Invalid("response record hash basis")
    pins = contract["upstream_source_pins"]
    if pins["commit"] != "68874ddd906440da213ff9ee630d6822051ca219" or len(pins["sources"]) != 6:
        raise Invalid("upstream source pin set")
    for source in pins["sources"]:
        _exact_keys(source, {"bytes", "path", "sha256"}, "source pin")
        if not isinstance(source["bytes"], int) or source["bytes"] <= 0 or not SHA256_RE.fullmatch(source["sha256"]):
            raise Invalid("source pin identity")
    return contract, data


def _parse_jsonl(data: bytes) -> tuple[list[dict[str, Any]], list[bytes]]:
    if not data.endswith(b"\n") or data.endswith(b"\n\n") or b"\r" in data or b"\x00" in data:
        raise Invalid("session JSONL framing")
    raw_lines = data[:-1].split(b"\n")
    if not raw_lines or any(not line for line in raw_lines):
        raise Invalid("session JSONL empty record")
    records: list[dict[str, Any]] = []
    for index, line in enumerate(raw_lines, 1):
        value = _decode(line)
        if not isinstance(value, dict):
            raise Invalid(f"session record {index}: object required")
        records.append(value)
    return records, raw_lines


def _goal(value: Any, label: str) -> dict[str, Any]:
    obj = _exact_keys(value, GOAL_REQUIRED_KEYS | (set(value) & GOAL_OPTIONAL_KEYS) if isinstance(value, dict) else GOAL_REQUIRED_KEYS, label)
    if not GOAL_REQUIRED_KEYS <= set(obj) or not set(obj) <= GOAL_REQUIRED_KEYS | GOAL_OPTIONAL_KEYS:
        raise Invalid(f"{label}: Goal fields")
    if not isinstance(obj["id"], str) or not obj["id"] or obj["objective"] != EXPECTED_OBJECTIVE:
        raise Invalid(f"{label}: Goal identity")
    for key in ("tokensUsed", "timeUsedSeconds", "createdAt", "updatedAt"):
        if not isinstance(obj[key], int) or isinstance(obj[key], bool) or obj[key] < 0:
            raise Invalid(f"{label}: {key}")
    if "tokenBudget" in obj and (not isinstance(obj["tokenBudget"], int) or isinstance(obj["tokenBudget"], bool) or obj["tokenBudget"] <= 0):
        raise Invalid(f"{label}: tokenBudget")
    return obj


def _message_text(message: Any) -> str:
    if not isinstance(message, dict):
        return ""
    content = message.get("content")
    if isinstance(content, str):
        return content
    if not isinstance(content, list):
        return ""
    parts: list[str] = []
    for item in content:
        if isinstance(item, dict) and item.get("type") in {"text", "output_text"} and isinstance(item.get("text"), str):
            parts.append(item["text"])
    return "".join(parts)


def _contains_custom_type(value: Any, custom_type: str) -> bool:
    if isinstance(value, dict):
        if value.get("customType") == custom_type:
            return True
        return any(_contains_custom_type(item, custom_type) for item in value.values())
    if isinstance(value, list):
        return any(_contains_custom_type(item, custom_type) for item in value)
    return False


def validate_session(data: bytes, expected_session_id: str) -> dict[str, Any]:
    records, raw_lines = _parse_jsonl(data)
    headers = [(i, r) for i, r in enumerate(records) if r.get("type") == "session"]
    if len(headers) != 1:
        raise Invalid("exactly one session header")
    header_i, header = headers[0]
    if header.get("id") != expected_session_id or header.get("cwd") != "P:\\":
        raise Invalid("session header identity or cwd")
    active: list[tuple[int, dict[str, Any], dict[str, Any]]] = []
    complete: list[tuple[int, dict[str, Any], dict[str, Any]]] = []
    none: list[tuple[int, dict[str, Any]]] = []
    completed: list[tuple[int, dict[str, Any]]] = []
    users: list[tuple[int, dict[str, Any]]] = []
    assistants: list[tuple[int, dict[str, Any], str]] = []
    for i, record in enumerate(records):
        if _contains_custom_type(record, "goal-continuation"):
            raise Invalid("hidden Goal continuation present")
        if record.get("type") == "mode_change" and record.get("mode") == "goal":
            _exact_keys(record, ENTRY_BASE_KEYS | {"mode", "data"}, f"goal mode record {i+1}")
            data_obj = record.get("data")
            if not isinstance(data_obj, dict) or set(data_obj) != {"goal"}:
                raise Invalid("goal mode data")
            goal = _goal(data_obj["goal"], f"goal mode record {i+1}")
            if goal["status"] == "active":
                active.append((i, record, goal))
            if goal["status"] == "complete":
                complete.append((i, record, goal))
        elif record.get("type") == "mode_change" and record.get("mode") == "none":
            _exact_keys(record, ENTRY_BASE_KEYS | {"mode"}, f"none mode record {i+1}")
            none.append((i, record))
        elif record.get("type") == "custom" and record.get("customType") == "goal-completed":
            _exact_keys(record, ENTRY_BASE_KEYS | {"customType", "data"}, f"goal-completed record {i+1}")
            completed.append((i, record))
        elif record.get("type") == "message" and isinstance(record.get("message"), dict):
            role = record["message"].get("role")
            if role == "user":
                users.append((i, record))
            elif role == "assistant":
                text = _message_text(record["message"])
                if text:
                    assistants.append((i, record, text))
    if not active or len(complete) != 1 or len(none) != 1 or len(completed) != 1:
        raise Invalid("native Goal lifecycle record cardinality")
    active_i, active_record, active_goal = active[0]
    complete_i, complete_record, complete_goal = complete[0]
    none_i, none_record = none[0]
    completed_i, completed_record = completed[0]
    exact_users = [(i, r) for i, r in users if _message_text(r.get("message")) == EXPECTED_OBJECTIVE]
    if len(users) != 1 or len(exact_users) != 1:
        raise Invalid("exact one control user message")
    user_i, user_record = exact_users[0]
    if len(assistants) != 1 or assistants[0][2] != EXPECTED_OUTPUT:
        raise Invalid("exact terminal assistant output")
    assistant_i, assistant_record, _ = assistants[0]
    if not (active_i < user_i < none_i and active_i < complete_i < none_i and user_i <= assistant_i < none_i):
        raise Invalid("Goal lifecycle ordering")
    if completed_i != none_i + 1 or completed_record.get("parentId") != none_record.get("id"):
        raise Invalid("terminal none/goal-completed adjacency")
    if active_goal["id"] != complete_goal["id"] or active_goal["createdAt"] != complete_goal["createdAt"]:
        raise Invalid("Goal ID or creation identity changed")
    if complete_goal["status"] != "complete":
        raise Invalid("Goal not complete")
    completed_data = completed_record.get("data")
    expected_completed_keys = {"objective", "tokensUsed", "timeUsedSeconds"} | ({"tokenBudget"} if "tokenBudget" in complete_goal else set())
    _exact_keys(completed_data, expected_completed_keys, "goal-completed data")
    if completed_data["objective"] != EXPECTED_OBJECTIVE:
        raise Invalid("goal-completed objective")
    for key in ("tokensUsed", "timeUsedSeconds"):
        if completed_data[key] != complete_goal[key]:
            raise Invalid(f"goal-completed {key}")
    if "tokenBudget" in complete_goal and completed_data.get("tokenBudget") != complete_goal["tokenBudget"]:
        raise Invalid("goal-completed tokenBudget")
    selected = {
        "active_goal": active_i,
        "assistant_output": assistant_i,
        "complete_goal": complete_i,
        "control_user": user_i,
        "goal_completed": completed_i,
        "mode_none": none_i,
        "session_header": header_i,
    }
    projection: dict[str, Any] = {"source_record_count": len(records), "goal_id": active_goal["id"]}
    for name, index in selected.items():
        projection[f"{name}_line"] = index + 1
        projection[f"{name}_line_sha256"] = _sha(raw_lines[index])
    return projection


def check_response(response_path: Path) -> dict[str, Any]:
    contract, _ = check_contract()
    response, _ = _load_canonical(response_path)
    _exact_keys(response, RESPONSE_KEYS, "response")
    if response["schema_id"] != EXPECTED_RESPONSE_SCHEMA or response["probe_id"] != EXPECTED_PROBE_ID:
        raise Invalid("response schema or probe")
    if response["authority"] != EXPECTED_AUTHORITY:
        raise Invalid("response authority")
    if response["status"] != "PASS_ZERO_CREDIT_NATIVE_GOAL_LIFECYCLE_CLOSED" or response["first_mismatch"] is not None:
        raise Invalid("response is not a clean zero-credit PASS")
    if response["surface"] != "VISIBLE_TUI":
        raise Invalid("V2 admits visible TUI only; headless requires an installed-bridge successor contract")
    calls = _exact_keys(response["calls"], CALL_KEYS, "calls")
    if calls["control_prompt_count"] != 1 or calls["new_omp_process_count"] != 1 or calls["scored_subject_count"] != 0:
        raise Invalid("call accounting")
    if not isinstance(calls["provider_request_count"], int) or isinstance(calls["provider_request_count"], bool) or calls["provider_request_count"] < 1:
        raise Invalid("provider request count")
    process = _exact_keys(response["process"], PROCESS_KEYS, "process")
    if process["argv"] != ["omp", "--cwd", "P:\\"] or process["cwd"] != "P:\\":
        raise Invalid("process launch boundary")
    if process["windows_owner_task_id"] != contract["execution_contract"]["handoff"]["controlling_task_id"]:
        raise Invalid("Windows owner continuity")
    if not isinstance(process["pid"], int) or isinstance(process["pid"], bool) or process["pid"] <= 0:
        raise Invalid("process pid")
    if process["exit_code"] != 0 or process["natural_exit"] is not True:
        raise Invalid("process terminal")
    if not isinstance(process["start_utc"], str) or not isinstance(process["end_utc"], str) or process["start_utc"] >= process["end_utc"]:
        raise Invalid("process time interval")
    freshness = _exact_keys(response["freshness"], FRESHNESS_KEYS, "freshness")
    session_id = freshness["session_id"]
    if not isinstance(session_id, str) or not UUID_RE.fullmatch(session_id) or session_id == OLD_SESSION_ID:
        raise Invalid("fresh session id")
    if freshness["session_id_prior_overlap_count"] != 0 or freshness["goal_id_prior_overlap_count"] != 0 or freshness["process_overlap_observed"] is not False:
        raise Invalid("freshness or overlap")
    goal = _exact_keys(response["goal"], GOAL_KEYS, "goal")
    if goal["objective_utf8"] != EXPECTED_OBJECTIVE or goal["output_utf8"] != EXPECTED_OUTPUT or goal["terminal_status"] != "complete":
        raise Invalid("goal response")
    for prefix in ("objective", "output"):
        text = goal[f"{prefix}_utf8"]
        size, digest = _identity(text)
        if goal[f"{prefix}_utf8_bytes"] != size or goal[f"{prefix}_utf8_sha256"] != digest:
            raise Invalid(f"goal {prefix} binding")
    custody = _exact_keys(response["custody"], CUSTODY_KEYS, "custody")
    if custody["copy_path"] != contract["evidence_contract"]["create_only_shared_paths"]["closed_session_copy"]:
        raise Invalid("copy path")
    if custody["session_source_closed"] is not True or custody["session_source_lock_released"] is not True or custody["source_copy_equal"] is not True:
        raise Invalid("closed session custody")
    if not isinstance(custody["session_source_basename"], str) or "/" in custody["session_source_basename"] or "\\" in custody["session_source_basename"]:
        raise Invalid("source basename")
    if not SHA256_RE.fullmatch(custody["copy_sha256"]) or custody["copy_sha256"] != custody["session_source_sha256"]:
        raise Invalid("source/copy digest")
    if custody["copy_bytes"] != custody["session_source_bytes"] or not isinstance(custody["copy_bytes"], int) or custody["copy_bytes"] <= 0:
        raise Invalid("source/copy bytes")
    copy_path = (HERE / custody["copy_path"]).resolve()
    try:
        copy_path.relative_to(HERE)
    except ValueError as exc:
        raise Invalid("copy escapes probe root") from exc
    copy_data = _read_regular(copy_path)
    if len(copy_data) != custody["copy_bytes"] or _sha(copy_data) != custody["copy_sha256"]:
        raise Invalid("copy identity")
    projection = validate_session(copy_data, session_id)
    if projection["goal_id"] != goal["goal_id"]:
        raise Invalid("Goal ID projection")
    records = _exact_keys(response["records"], RECORD_KEYS, "records")
    for key, value in projection.items():
        if key == "goal_id":
            continue
        if records.get(key) != value:
            raise Invalid(f"record projection mismatch: {key}")
    return {"copy_bytes": len(copy_data), "copy_sha256": _sha(copy_data), "record_count": projection["source_record_count"]}


def _synthetic_entries() -> list[dict[str, Any]]:
    sid = "01900000-0000-7000-8000-000000000002"
    goal = {
        "id": "goal-002",
        "objective": EXPECTED_OBJECTIVE,
        "status": "active",
        "tokensUsed": 0,
        "timeUsedSeconds": 0,
        "createdAt": 1,
        "updatedAt": 1,
    }
    return [
        {"type": "session", "version": 3, "id": sid, "timestamp": "2026-08-22T00:00:00.000Z", "cwd": "P:\\"},
        {"type": "mode_change", "id": "e1", "parentId": None, "timestamp": "2026-08-22T00:00:01.000Z", "mode": "goal", "data": {"goal": goal}},
        {"type": "message", "id": "e2", "parentId": "e1", "timestamp": "2026-08-22T00:00:02.000Z", "message": {"role": "user", "content": EXPECTED_OBJECTIVE}},
        {"type": "message", "id": "e3", "parentId": "e2", "timestamp": "2026-08-22T00:00:03.000Z", "message": {"role": "assistant", "content": [{"type": "text", "text": EXPECTED_OUTPUT}]}},
        {"type": "mode_change", "id": "e4", "parentId": "e3", "timestamp": "2026-08-22T00:00:04.000Z", "mode": "goal", "data": {"goal": {**goal, "status": "complete", "tokensUsed": 8, "timeUsedSeconds": 1, "updatedAt": 4}}},
        {"type": "mode_change", "id": "e5", "parentId": "e4", "timestamp": "2026-08-22T00:00:05.000Z", "mode": "none"},
        {"type": "custom", "id": "e6", "parentId": "e5", "timestamp": "2026-08-22T00:00:06.000Z", "customType": "goal-completed", "data": {"objective": EXPECTED_OBJECTIVE, "tokensUsed": 8, "timeUsedSeconds": 1}},
    ]


def _jsonl(entries: list[dict[str, Any]]) -> bytes:
    return b"".join(json.dumps(entry, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n" for entry in entries)


def mutation_self_test() -> int:
    sid = "01900000-0000-7000-8000-000000000002"
    validate_session(_jsonl(_synthetic_entries()), sid)
    mutations: list[tuple[str, Callable[[list[dict[str, Any]]], None]]] = []
    def add(name: str, fn: Callable[[list[dict[str, Any]]], None]) -> None:
        mutations.append((name, fn))
    add("missing-header", lambda x: x.pop(0))
    add("duplicate-header", lambda x: x.insert(1, copy.deepcopy(x[0])))
    add("old-session", lambda x: x[0].__setitem__("id", OLD_SESSION_ID))
    add("missing-active", lambda x: x.pop(1))
    add("active-objective", lambda x: x[1]["data"]["goal"].__setitem__("objective", "wrong"))
    add("active-status", lambda x: x[1]["data"]["goal"].__setitem__("status", "paused"))
    add("user-before-active", lambda x: x.__setitem__(slice(1, 3), [x[2], x[1]]))
    add("extra-user", lambda x: x.insert(3, copy.deepcopy(x[2])))
    add("wrong-user", lambda x: x[2]["message"].__setitem__("content", "wrong"))
    add("missing-assistant", lambda x: x.pop(3))
    add("extra-assistant-text", lambda x: x[3]["message"]["content"].append({"type": "text", "text": "extra"}))
    add("missing-complete", lambda x: x.pop(4))
    add("complete-goal-id", lambda x: x[4]["data"]["goal"].__setitem__("id", "wrong"))
    add("complete-status", lambda x: x[4]["data"]["goal"].__setitem__("status", "active"))
    add("missing-none", lambda x: x.pop(5))
    add("none-data", lambda x: x[5].__setitem__("data", {}))
    add("missing-completed", lambda x: x.pop(6))
    add("wrong-custom-type", lambda x: x[6].__setitem__("customType", "wrong"))
    add("completed-objective", lambda x: x[6]["data"].__setitem__("objective", "wrong"))
    add("completed-usage", lambda x: x[6]["data"].__setitem__("tokensUsed", 9))
    add("terminal-swap", lambda x: x.__setitem__(slice(5, 7), [x[6], x[5]]))
    add("terminal-gap", lambda x: x.insert(6, {"type": "label", "id": "gap", "parentId": "e5", "timestamp": "2026-08-22T00:00:05.500Z", "targetId": "e5", "label": "gap"}))
    add("goal-continuation", lambda x: x.insert(3, {"type": "custom_message", "id": "c", "parentId": "e2", "timestamp": "2026-08-22T00:00:02.500Z", "customType": "goal-continuation", "content": "continue", "display": False}))
    add("goal-extra-key", lambda x: x[1]["data"]["goal"].__setitem__("extra", 1))
    for name, mutate in mutations:
        entries = copy.deepcopy(_synthetic_entries())
        mutate(entries)
        try:
            validate_session(_jsonl(entries), sid)
        except Invalid:
            continue
        raise Invalid(f"mutation accepted: {name}")
    base = _jsonl(_synthetic_entries())
    special = {
        "cr": base.replace(b"\n", b"\r\n", 1),
        "missing-final-lf": base[:-1],
        "blank-line": base.replace(b"\n", b"\n\n", 1),
        "duplicate-key": base.replace(b'{"type":"session"', b'{"type":"session","type":"session"', 1),
        "nonfinite": base.replace(b'"version":3', b'"version":NaN', 1),
    }
    for name, data in special.items():
        try:
            validate_session(data, sid)
        except Invalid:
            continue
        raise Invalid(f"mutation accepted: {name}")
    return len(mutations) + len(special)


def _emit(value: dict[str, Any]) -> None:
    sys.stdout.buffer.write(_canon(value))


def main() -> int:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--check-contract", action="store_true")
    group.add_argument("--mutation-self-test", action="store_true")
    group.add_argument("--check-response", type=Path)
    args = parser.parse_args()
    try:
        if args.check_contract:
            contract, data = check_contract()
            _emit({
                "authority": contract["authority"],
                "bytes": len(data),
                "first_mismatch": None,
                "schema_id": "pw-r9-goal-mode-omp-native-lifecycle-probe-contract-check-v2",
                "sha256": _sha(data),
                "status": "PASS_MECHANICAL_ZERO_CREDIT_NO_LAUNCH",
                "workspace_writes": 0,
            })
        elif args.mutation_self_test:
            check_contract()
            count = mutation_self_test()
            _emit({
                "first_mismatch": None,
                "mutation_count": count,
                "schema_id": "pw-r9-goal-mode-omp-native-lifecycle-probe-mutation-check-v2",
                "status": "PASS",
                "workspace_writes": 0,
            })
        else:
            result = check_response(args.check_response.resolve())
            _emit({
                "first_mismatch": None,
                **result,
                "schema_id": "pw-r9-goal-mode-omp-native-lifecycle-probe-response-check-v2",
                "status": "PASS_ZERO_CREDIT_NO_CANARY_AUTHORITY",
                "workspace_writes": 0,
            })
        return 0
    except Exception as exc:
        _emit({
            "first_mismatch": str(exc),
            "schema_id": "pw-r9-goal-mode-omp-native-lifecycle-probe-check-failure-v2",
            "status": "FAIL_CLOSED",
            "workspace_writes": 0,
        })
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
