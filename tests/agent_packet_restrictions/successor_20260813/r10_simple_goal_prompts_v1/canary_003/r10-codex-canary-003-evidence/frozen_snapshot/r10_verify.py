#!/usr/bin/env python3
"""Independent snapshot-only verifier for the captured R10 Codex diagnostic."""

from __future__ import annotations

import argparse
import gzip
import os
import re
import subprocess
import sys
from importlib.metadata import version as package_version
from pathlib import Path
from typing import Any

import jsonschema

import r10_contract as contract

ROOT = Path(__file__).resolve().parent
R10_REPO_RELATIVE = "tests/agent_packet_restrictions/successor_20260813/r10_simple_goal_prompts_v1"
GOAL_TOOLS = {"create_goal", "get_goal", "update_goal"}
EXPECTED_ROSTER = {
    "alpha": ("gpt-5.4-mini", "xhigh"),
}
EXPECTED_ROW_IDS = {"alpha": "row-alpha-003"}
EXPECTED_ACCEPTANCE = {
    "external_user_submission_count_per_row": 1,
    "goal_create_count_per_row": 1,
    "goal_get_max_per_row": 4,
    "goal_terminal_count_per_row": 1,
    "goal_tool_call_max_per_row": 6,
    "same_goal_thread_identity": True,
    "activation_before_semantic_result": True,
    "actual_tool_calls_subset": ["create_goal", "get_goal", "update_goal"],
    "filesystem_writes_by_subject": 0,
    "network_calls_by_subject": 0,
    "schema_validation": "strict",
    "semantic_score": "exact_json_value",
    "deterministic_result_checks": ["source_ids_unique"],
    "provider_output_schema_enforcement": "host_only",
    "required_pass": 1,
    "allowed_fail": 0,
}
EXPECTED_FROZEN_PATHS = {
    "ARCHITECTURE.md",
    "prompt_capsule.schema.json",
    "r10_contract.py",
    "r10_runner.py",
    "r10_verify.py",
    "r10_selftest.py",
    "workflow_coverage.json",
    "canary_003/response.schema.json",
    "canary_003/capsule.json",
    "canary_003/oracle.json",
}
EXPECTED_RUNTIME = {
    "repository": "/mnt/Cursor/PuppetMaster",
    "codex_home": "/home/sittingmongoose/.codex",
    "timeout_seconds": 900,
    "sandbox": "read-only",
    "working_directory": "fresh_temporary_directory",
    "temporary_root": "/tmp",
    "stdin_submission_count": 1,
    "strict_config": True,
    "ignore_user_config": True,
    "ignore_rules": True,
    "environment": {
        "CODEX_HOME": "/home/sittingmongoose/.codex",
        "HOME": "/home/sittingmongoose",
        "LANG": "C.UTF-8",
        "LC_ALL": "C.UTF-8",
        "LOGNAME": "sittingmongoose",
        "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
        "SHELL": "/bin/bash",
        "USER": "sittingmongoose",
    },
}
EXPECTED_CONTROLLER_RUNTIME = {
    "python_executable": "/usr/bin/python3.13",
    "python_version": "3.13.7",
    "jsonschema_version": "4.19.2",
}
EXPECTED_PERMISSION_PROFILE = {
    "type": "managed",
    "file_system": {
        "type": "restricted",
        "entries": [
            {
                "path": {"type": "special", "value": {"kind": "root"}},
                "access": "read",
            }
        ],
    },
    "network": "restricted",
}
EXPECTED_EVIDENCE_ROOT = (
    Path(EXPECTED_RUNTIME["repository"])
    / R10_REPO_RELATIVE
    / "canary_003"
    / "r10-codex-canary-003-evidence"
)
CAPTURE_SUMMARY_KEYS = {
    "schema_id",
    "run_id",
    "manifest_sha256",
    "row_count",
    "attempt_count",
    "subject_launch_count",
    "subject_launch_count_exact",
    "subject_launch_lower_bound",
    "capture_count",
    "prefix_pass_count",
    "attempted_row_ids",
    "launched_row_ids",
    "launch_lower_bound_row_ids",
    "post_popen_failure_row_ids",
    "captured_row_ids",
    "prefix_passed_row_ids",
    "unconsumed_row_ids",
    "unconsumed_dispositions",
    "prefix_gate_sha256_by_row",
    "stop_reason",
    "status",
    "qualification_credit",
    "qualification_streak",
}

JSON_STRING = r'"(?:\\.|[^"\\])*"'
ASSIGNED_WRAPPER_PATTERNS = {
    "create_goal": re.compile(
        rf'\A\s*(?:const|let)\s+(?P<variable>[A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*await\s+tools\.create_goal\s*\(\s*\{{\s*(?:"objective"|objective)\s*:\s*(?P<objective>{JSON_STRING})\s*\}}\s*\)\s*;\s*text\s*\(\s*(?P=variable)\s*\)\s*;?\s*\Z',
        re.DOTALL,
    ),
    "get_goal": re.compile(
        r'\A\s*(?:const|let)\s+(?P<variable>[A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*await\s+tools\.get_goal\s*\(\s*\{\s*\}\s*\)\s*;\s*text\s*\(\s*(?P=variable)\s*\)\s*;?\s*\Z',
        re.DOTALL,
    ),
    "update_goal": re.compile(
        r'\A\s*(?:const|let)\s+(?P<variable>[A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*await\s+tools\.update_goal\s*\(\s*\{\s*(?:"status"|status)\s*:\s*"complete"\s*\}\s*\)\s*;\s*text\s*\(\s*(?P=variable)\s*\)\s*;?\s*\Z',
        re.DOTALL,
    ),
}
INLINE_WRAPPER_PATTERNS = {
    "create_goal": re.compile(
        rf'\A\s*text\s*\(\s*await\s+tools\.create_goal\s*\(\s*\{{\s*(?:"objective"|objective)\s*:\s*(?P<objective>{JSON_STRING})\s*\}}\s*\)\s*\)\s*;?\s*\Z',
        re.DOTALL,
    ),
    "get_goal": re.compile(
        r'\A\s*text\s*\(\s*await\s+tools\.get_goal\s*\(\s*\{\s*\}\s*\)\s*\)\s*;?\s*\Z',
        re.DOTALL,
    ),
    "update_goal": re.compile(
        r'\A\s*text\s*\(\s*await\s+tools\.update_goal\s*\(\s*\{\s*(?:"status"|status)\s*:\s*"complete"\s*\}\s*\)\s*\)\s*;?\s*\Z',
        re.DOTALL,
    ),
}


class VerifyError(ValueError):
    pass


class PrefixRowFailure(VerifyError):
    def __init__(self, failed_row_id: str, verified_row_ids: list[str], cause: Exception):
        self.failed_row_id = failed_row_id
        self.verified_row_ids = verified_row_ids
        super().__init__(f"row {failed_row_id}: {type(cause).__name__}: {cause}")


def prefix_failure_disposition(
    rows: list[dict[str, Any]],
    through_row_id: str,
    exc: Exception,
) -> dict[str, Any]:
    target_index = next((index for index, row in enumerate(rows) if row["row_id"] == through_row_id), None)
    require(target_index is not None, "prefix row absent from manifest")
    if not isinstance(exc, PrefixRowFailure):
        return {
            "prefix_index": target_index,
            "failed_row_id": None,
            "verified_row_ids": [],
            "not_evaluated_row_ids": [row["row_id"] for row in rows],
            "failed_stage": "prefix_controller",
        }

    failed_index = next((index for index, row in enumerate(rows) if row["row_id"] == exc.failed_row_id), None)
    require(isinstance(failed_index, int) and failed_index <= target_index, "prefix failure row/target ordering")
    expected_verified = [row["row_id"] for row in rows[:failed_index]]
    require(exc.verified_row_ids == expected_verified, "prefix verified-row attribution")
    return {
        "prefix_index": target_index,
        "failed_row_id": exc.failed_row_id,
        "verified_row_ids": exc.verified_row_ids,
        "not_evaluated_row_ids": [row["row_id"] for row in rows[failed_index + 1 :]],
        "failed_stage": "row_verification",
    }


def require(condition: bool, message: str) -> None:
    if not condition:
        raise VerifyError(message)


def require_designated_evidence_root(path: Path) -> Path:
    lexical = Path(os.path.abspath(os.fspath(path)))
    require(lexical == EXPECTED_EVIDENCE_ROOT, "evidence root identity")
    require(not lexical.is_symlink(), "evidence root symlink")
    return lexical


def require_blob_identity(
    raw: bytes,
    record: dict[str, Any],
    sha_field: str,
    bytes_field: str,
    label: str,
) -> None:
    require(record.get(sha_field) == contract.sha256(raw), f"{label} hash")
    require(record.get(bytes_field) == len(raw), f"{label} byte count")


def require_manifest_prompt_metrics(row: dict[str, Any], metrics: dict[str, Any]) -> None:
    require(row.get("capsule_sha256") == metrics["capsule_sha256"], "manifest capsule hash")
    require(row.get("submitted_user_prompt_sha256") == metrics["prompt_sha256"], "manifest prompt hash")
    require(row.get("submitted_user_prompt_utf8_bytes") == metrics["prompt_utf8_bytes"], "manifest prompt bytes")


def snapshot_owned(evidence: Path, relative: str) -> Path:
    snapshot_root = (evidence / "frozen_snapshot").resolve()
    if ROOT.name == "frozen_snapshot":
        require(snapshot_root == ROOT, "executing snapshot/evidence mismatch")
    path = (snapshot_root / relative).resolve()
    require(path == snapshot_root or snapshot_root in path.parents, f"snapshot path escapes: {relative}")
    require(path.is_file(), f"missing snapshot file: {relative}")
    return path


def text_parts(value: Any) -> list[str]:
    found: list[str] = []
    if isinstance(value, str):
        found.append(value)
    elif isinstance(value, list):
        for item in value:
            found.extend(text_parts(item))
    elif isinstance(value, dict):
        for key, item in value.items():
            if key in {"text", "output", "content"}:
                found.extend(text_parts(item))
    return found


def message_text(payload: dict[str, Any]) -> str:
    return "".join(text_parts(payload.get("content", [])))


def completed_user_submissions(trace: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Project only authoritative CLI item-completion events for submitted user input."""

    submissions: list[dict[str, Any]] = []
    for row in trace:
        if row.get("type") != "event_msg":
            continue
        payload = row.get("payload", {})
        if payload.get("type") != "item_completed":
            continue
        item = payload.get("item")
        if not isinstance(item, dict) or item.get("type") != "UserMessage":
            continue
        content = item.get("content")
        require(isinstance(content, list) and content, "completed UserMessage content")
        fragments: list[str] = []
        for part in content:
            require(isinstance(part, dict) and part.get("type") == "text", "completed UserMessage part shape")
            require(isinstance(part.get("text"), str), "completed UserMessage text")
            fragments.append(part["text"])
        item_id = item.get("id")
        thread = payload.get("thread_id")
        current_turn = turn_id(payload)
        require(isinstance(item_id, str) and item_id, "completed UserMessage item identity")
        require(isinstance(thread, str) and thread, "completed UserMessage thread identity")
        require(current_turn is not None, "completed UserMessage turn identity")
        submissions.append({
            "ordinal": row["ordinal"],
            "text": "".join(fragments),
            "turn_id": current_turn,
            "thread_id": thread,
            "item_id": item_id,
        })
    return submissions


def require_single_external_submission(
    trace: list[dict[str, Any]],
    prompt: str,
    thread_id: str,
    intervals: dict[str, tuple[int, int]],
) -> dict[str, Any]:
    external = completed_user_submissions(trace)
    require(len(external) == 1 and external[0]["text"] == prompt, "exactly one external user prompt required")
    require(external[0]["thread_id"] == thread_id, "external prompt thread identity")
    require_inside(intervals, external[0]["turn_id"], external[0]["ordinal"], "external user prompt")
    return external[0]


def require_submission_before_goal(external: dict[str, Any], create_call: dict[str, Any]) -> None:
    require(
        external.get("turn_id") == create_call.get("turn_id")
        and isinstance(external.get("ordinal"), int)
        and isinstance(create_call.get("ordinal"), int)
        and external["ordinal"] < create_call["ordinal"],
        "external prompt must causally precede Goal creation in the same task turn",
    )


def process_terminal_error(stdout: bytes, capture: dict[str, Any]) -> str:
    messages: list[str] = []
    for line in stdout.splitlines():
        try:
            value = contract.load_json_bytes(line, "CLI error JSONL")
        except contract.ContractError:
            continue
        if isinstance(value, dict) and value.get("type") in {"error", "turn.failed"}:
            raw = value.get("message")
            if raw is None and isinstance(value.get("error"), dict):
                raw = value["error"].get("message")
            if isinstance(raw, str) and raw and raw not in messages:
                messages.append(raw)
    detail = messages[0] if messages else "no structured CLI error captured"
    return f"process terminal: returncode={capture.get('returncode')}, timed_out={capture.get('timed_out')}; {detail}"


def stdout_thread_id(stdout: bytes) -> str:
    ids: list[str] = []
    for number, line in enumerate(stdout.splitlines(), 1):
        value = contract.load_json_bytes(line, f"Codex stdout JSONL line {number}")
        require(isinstance(value, dict), f"Codex stdout line is not an object: {number}")
        if value.get("type") == "thread.started" and isinstance(value.get("thread_id"), str):
            ids.append(value["thread_id"])
    require(len(ids) == 1 and ids[0], "Codex stdout thread identity")
    return ids[0]


def goal_from_output(payload: dict[str, Any]) -> dict[str, Any] | None:
    candidates: list[dict[str, Any]] = []
    for text in text_parts(payload.get("output")):
        try:
            value = contract.load_json_text(text.strip(), "Goal receipt text")
        except contract.ContractError:
            continue
        if isinstance(value, dict) and isinstance(value.get("goal"), dict):
            candidates.append(value["goal"])
    return candidates[0] if len(candidates) == 1 else None


def turn_id(payload: dict[str, Any]) -> str | None:
    direct = payload.get("turn_id")
    if isinstance(direct, str):
        return direct
    meta = payload.get("internal_chat_message_metadata_passthrough")
    return meta.get("turn_id") if isinstance(meta, dict) and isinstance(meta.get("turn_id"), str) else None


def parse_trace(raw: bytes) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for number, line in enumerate(raw.splitlines(), 1):
        try:
            value = contract.load_json_bytes(line, f"rollout JSONL line {number}")
        except contract.ContractError as exc:
            raise VerifyError(f"rollout JSONL line {number}: {exc}") from exc
        require(isinstance(value, dict), f"rollout line not object: {number}")
        require(isinstance(value.get("ordinal"), int), f"rollout ordinal missing: {number}")
        rows.append(value)
    require(all(left["ordinal"] < right["ordinal"] for left, right in zip(rows, rows[1:])), "rollout ordinals not strictly increasing")
    return rows


def validate_goal_args(tool: str, args: Any) -> dict[str, Any]:
    require(isinstance(args, dict), f"{tool} arguments not object")
    if tool == "create_goal":
        require(set(args) == {"objective"}, "create_goal argument shape")
        require(isinstance(args["objective"], str) and args["objective"].strip(), "create_goal objective")
    elif tool == "get_goal":
        require(args == {}, "get_goal argument shape")
    elif tool == "update_goal":
        require(args == {"status": "complete"}, "update_goal argument shape")
    else:
        raise VerifyError(f"non-Goal tool: {tool}")
    return args


def parse_goal_wrapper(source: str) -> tuple[str, dict[str, Any]]:
    if source.startswith("// @exec:"):
        _pragma, separator, source = source.partition("\n")
        require(bool(separator), "wrapper pragma without body")
    patterns = list(ASSIGNED_WRAPPER_PATTERNS.items()) + list(INLINE_WRAPPER_PATTERNS.items())
    matches = [(tool, pattern.fullmatch(source)) for tool, pattern in patterns]
    matches = [(tool, match) for tool, match in matches if match is not None]
    require(len(matches) == 1, "exec wrapper outside closed Goal grammar")
    tool, match = matches[0]
    if tool == "create_goal":
        try:
            objective = contract.load_json_text(match.group("objective"), "create_goal objective literal")
        except contract.ContractError as exc:
            raise VerifyError(f"create_goal objective literal: {exc}") from exc
        args = {"objective": objective}
    elif tool == "get_goal":
        args = {}
    else:
        args = {"status": "complete"}
    return tool, validate_goal_args(tool, args)


def direct_goal_call(payload: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    tool = payload.get("name")
    require(tool in GOAL_TOOLS, f"non-Goal tool call: {tool}")
    raw = payload.get("arguments")
    if raw is None:
        raw = payload.get("input")
    require(isinstance(raw, str), f"{tool} missing serialized arguments")
    try:
        args = contract.load_json_text(raw, f"{tool} arguments")
    except contract.ContractError as exc:
        raise VerifyError(f"{tool} arguments: {exc}") from exc
    return tool, validate_goal_args(tool, args)


def tool_projection(rows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, dict[str, Any]]]:
    calls: list[dict[str, Any]] = []
    outputs: dict[str, dict[str, Any]] = {}
    call_ids: set[str] = set()
    for row in rows:
        if row.get("type") != "response_item":
            continue
        payload = row.get("payload", {})
        item_type = payload.get("type")
        if item_type in {"function_call", "custom_tool_call"}:
            if item_type == "custom_tool_call" and payload.get("name") == "exec":
                source = payload.get("input")
                require(isinstance(source, str), "exec wrapper input missing")
                tool, args = parse_goal_wrapper(source)
            else:
                tool, args = direct_goal_call(payload)
            call_id = payload.get("call_id")
            require(isinstance(call_id, str) and call_id and call_id not in call_ids, "duplicate or missing call_id")
            call_ids.add(call_id)
            calls.append({
                "ordinal": row["ordinal"],
                "call_id": call_id,
                "tool": tool,
                "args": args,
                "wire_name": payload.get("name"),
                "turn_id": turn_id(payload),
            })
        elif item_type in {"function_call_output", "custom_tool_call_output"}:
            call_id = payload.get("call_id")
            require(isinstance(call_id, str) and call_id and call_id not in outputs, "duplicate or missing tool output call_id")
            outputs[call_id] = {"ordinal": row["ordinal"], "payload": payload, "turn_id": turn_id(payload)}
        elif isinstance(item_type, str) and (item_type.endswith("_call") or "tool_call" in item_type or item_type.endswith("_call_output")):
            raise VerifyError(f"unsupported tool-shaped response item: {item_type}")
    require(set(outputs) == call_ids, "tool call/output identity set mismatch")
    return calls, outputs


def validate_goal_call_counts(calls: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    by_tool = {name: [call for call in calls if call["tool"] == name] for name in GOAL_TOOLS}
    require(len(by_tool["create_goal"]) == EXPECTED_ACCEPTANCE["goal_create_count_per_row"], "create_goal count")
    require(len(by_tool["update_goal"]) == EXPECTED_ACCEPTANCE["goal_terminal_count_per_row"], "update_goal count")
    require(len(by_tool["get_goal"]) <= EXPECTED_ACCEPTANCE["goal_get_max_per_row"], "get_goal count")
    require(len(calls) <= EXPECTED_ACCEPTANCE["goal_tool_call_max_per_row"], "Goal tool-call ceiling")
    return by_tool


def task_intervals(trace: list[dict[str, Any]]) -> dict[str, tuple[int, int]]:
    open_starts: dict[str, int] = {}
    intervals: dict[str, tuple[int, int]] = {}
    for row in trace:
        if row.get("type") != "event_msg":
            continue
        payload = row.get("payload", {})
        event_type = payload.get("type")
        if event_type not in {"task_started", "task_complete"}:
            continue
        current_turn = turn_id(payload)
        require(current_turn is not None, f"{event_type} missing turn identity")
        if event_type == "task_started":
            require(not open_starts, "overlapping task intervals")
            require(current_turn not in intervals, "duplicate task_started")
            open_starts[current_turn] = row["ordinal"]
        else:
            require(current_turn in open_starts, "task_complete without matching start")
            start = open_starts.pop(current_turn)
            require(start < row["ordinal"], "task lifecycle order")
            intervals[current_turn] = (start, row["ordinal"])
    require(not open_starts and intervals, "unclosed or absent task lifecycle")
    return intervals


def require_inside(intervals: dict[str, tuple[int, int]], current_turn: str | None, ordinal: int, label: str) -> None:
    require(current_turn is not None and current_turn in intervals, f"{label} lacks paired task identity")
    start, complete = intervals[current_turn]
    require(start < ordinal < complete, f"{label} outside paired task interval")


def validate_turn_contexts(
    context_rows: list[dict[str, Any]],
    intervals: dict[str, tuple[int, int]],
    row: dict[str, Any],
    temp_dir: str,
) -> None:
    require(len(context_rows) == len(intervals), "one turn context required per task turn")
    context_turn_ids = [turn_id(item.get("payload", {})) for item in context_rows]
    require(all(isinstance(value, str) for value in context_turn_ids), "turn context identity")
    require(len(context_turn_ids) == len(set(context_turn_ids)) and set(context_turn_ids) == set(intervals), "turn context/task denominator")
    for item in context_rows:
        payload = item["payload"]
        current_turn = turn_id(payload)
        require_inside(intervals, current_turn, item["ordinal"], "turn context")
        require(payload.get("cwd") == temp_dir, "effective cwd mismatch")
        require(payload.get("workspace_roots") == [temp_dir], "effective workspace roots mismatch")
        require(payload.get("sandbox_policy") == {"type": "read-only"}, "effective sandbox mismatch")
        require(payload.get("approval_policy") == "never", "effective approval policy mismatch")
        require(payload.get("permission_profile") == EXPECTED_PERMISSION_PROFILE, "effective permission/network profile mismatch")
        require(payload.get("model") == row["model"], "effective model mismatch")
        require(payload.get("effort") == row["reasoning_effort"], "effective effort mismatch")


def select_semantic_final(
    final_messages: list[tuple[int, str, str | None]],
    intervals: dict[str, tuple[int, int]],
) -> tuple[int, str, str, dict[str, Any]]:
    require(final_messages, "assistant final absent")
    candidates: list[tuple[int, str, str, dict[str, Any]]] = []
    for ordinal, text, message_turn in final_messages:
        require_inside(intervals, message_turn, ordinal, "assistant final")
        try:
            value = contract.load_json_text(text, "assistant final JSON")
        except contract.ContractError:
            continue
        if isinstance(value, dict):
            require(isinstance(message_turn, str), "semantic final turn identity")
            candidates.append((ordinal, text, message_turn, value))
    require(len(candidates) == 1, f"semantic JSON final count: {len(candidates)}")
    return candidates[0]


def load_snapshot_contract(
    evidence: Path,
    *,
    require_capture_summary: bool,
) -> tuple[dict[str, Any], dict[str, Any] | None, str]:
    manifest_raw = (evidence / "manifest.json").read_bytes()
    commitment_raw = (evidence / "manifest.commitment.json").read_bytes()
    manifest = contract.load_json_bytes(manifest_raw, "evidence manifest")
    commitment = contract.load_json_bytes(commitment_raw, "evidence manifest commitment")
    manifest_sha = contract.sha256(manifest_raw)
    require(
        commitment == {
            "schema_id": "pm.r10.manifest_commitment.v1",
            "manifest_path": "canary_003/manifest.json",
            "manifest_sha256": manifest_sha,
        },
        "evidence manifest commitment mismatch",
    )
    require(manifest.get("schema_id") == "pm.r10.run_manifest.v1", "manifest schema")
    require(manifest.get("run_id") == "r10-codex-canary-003", "run identity")
    require(manifest.get("kind") == "single_route_output_schema_diagnostic", "canary kind")
    require(manifest.get("status") == "FROZEN_ZERO_CREDIT", "manifest freeze")
    require(manifest.get("platform") == "codex" and manifest.get("profile_id") == contract.PROFILE, "platform/profile")
    require(manifest.get("attempts_per_row") == 1 and manifest.get("retry") is False and manifest.get("replacement") is False and manifest.get("best_of") == 0, "attempt policy")
    require(manifest.get("qualification_credit") == 0 and manifest.get("qualification_streak") == 0, "canary credit")
    require(manifest.get("acceptance") == EXPECTED_ACCEPTANCE, "acceptance contract drift")
    require(manifest.get("runtime") == EXPECTED_RUNTIME, "runtime contract drift")
    require(manifest.get("controller_runtime") == EXPECTED_CONTROLLER_RUNTIME, "controller runtime contract drift")
    require(str(Path(sys.executable).resolve()) == EXPECTED_CONTROLLER_RUNTIME["python_executable"], "verifier Python executable drift")
    require(".".join(map(str, sys.version_info[:3])) == EXPECTED_CONTROLLER_RUNTIME["python_version"], "verifier Python version drift")
    require(package_version("jsonschema") == EXPECTED_CONTROLLER_RUNTIME["jsonschema_version"], "verifier jsonschema version drift")
    rows = manifest.get("rows")
    require(isinstance(rows, list) and len(rows) == EXPECTED_ACCEPTANCE["required_pass"] == len(EXPECTED_ROSTER), "exact row denominator")
    require([row.get("route_id") for row in rows] == list(EXPECTED_ROSTER), "route roster drift")
    require(len({row.get("row_id") for row in rows}) == len(EXPECTED_ROSTER) and len({row.get("nonce") for row in rows}) == len(EXPECTED_ROSTER), "row/nonce uniqueness")
    for row in rows:
        require((row.get("model"), row.get("reasoning_effort")) == EXPECTED_ROSTER[row["route_id"]], f"route binding drift: {row['route_id']}")
        require(row.get("row_id") == EXPECTED_ROW_IDS[row["route_id"]], f"row identity drift: {row['route_id']}")
    frozen = manifest.get("frozen_files")
    require(isinstance(frozen, list) and len(frozen) == len({item.get("path") for item in frozen}), "frozen path cardinality")
    require({item.get("path") for item in frozen} == EXPECTED_FROZEN_PATHS, "frozen path set drift")
    for expected in frozen:
        path = snapshot_owned(evidence, expected["path"])
        raw = path.read_bytes()
        require({"path": expected["path"], "utf8_bytes": len(raw), "sha256": contract.sha256(raw)} == expected, f"snapshot identity drift: {expected['path']}")
    capsule_schema = contract.load_json(snapshot_owned(evidence, "prompt_capsule.schema.json"))
    expected_prompt_metrics: dict[str, dict[str, Any]] = {}
    for row in rows:
        capsule = contract.load_json(snapshot_owned(evidence, row["capsule_path"]))
        _prompt, metrics = contract.render_prompt(capsule, "codex", capsule_schema)
        require_manifest_prompt_metrics(row, metrics)
        response_schema = contract.load_json(snapshot_owned(evidence, row["response_schema_path"]))
        contract.validate_provider_response_schema(response_schema)
        require(
            contract.canonical_bytes(response_schema)
            == contract.canonical_bytes(capsule["output_contract"]["inline_schema"]),
            f"inline/external schema mismatch: {row['row_id']}",
        )
        expected_prompt_metrics[row["row_id"]] = metrics
    preflight_raw = (evidence / "preflight_receipt.json").read_bytes()
    preflight = contract.load_json_bytes(preflight_raw, "preflight receipt")
    require(preflight_raw == contract.canonical_bytes(preflight) + b"\n", "preflight receipt not canonical")
    require(preflight.get("status") == "PASS_BEFORE_ANY_SUBJECT_LAUNCH", "preflight receipt")
    require(preflight.get("run_id") == manifest["run_id"], "preflight run identity")
    require(preflight.get("manifest_sha256") == manifest_sha and preflight.get("subject_launch_count") == 0, "preflight custody")
    require(preflight.get("codex_binary") == manifest["codex_binary"], "preflight Codex binary join")
    require(preflight.get("runtime") == manifest["runtime"] and preflight.get("controller_runtime") == manifest["controller_runtime"], "preflight runtime join")
    require(preflight.get("frozen_files") == manifest["frozen_files"], "preflight frozen-file join")
    require(preflight.get("row_prompt_metrics") == expected_prompt_metrics, "preflight prompt-metrics join")
    require(preflight.get("qualification_credit") == 0, "preflight qualification credit")
    git_custody = preflight.get("git_custody")
    require(isinstance(git_custody, dict) and git_custody.get("status") == "PASS_PUSHED_HEAD_EXACT_INPUTS", "pushed git custody receipt")
    require(git_custody.get("repository") == EXPECTED_RUNTIME["repository"] and git_custody.get("branch") == "main", "git repository/branch custody")
    commit = git_custody.get("head")
    require(isinstance(commit, str) and re.fullmatch(r"[0-9a-f]{40}", commit) is not None and commit == git_custody.get("origin_main"), "git commit custody")
    repository = Path(EXPECTED_RUNTIME["repository"])
    r10_relative = R10_REPO_RELATIVE
    expected_tracked = {
        f"{r10_relative}/canary_003/manifest.json",
        f"{r10_relative}/canary_003/manifest.commitment.json",
        *(f"{r10_relative}/{item['path']}" for item in frozen),
    }
    require(set(git_custody.get("tracked_launch_inputs", [])) == expected_tracked, "tracked launch-input set drift")
    committed_inputs = {
        f"{r10_relative}/canary_003/manifest.json": manifest_raw,
        f"{r10_relative}/canary_003/manifest.commitment.json": commitment_raw,
        **{f"{r10_relative}/{item['path']}": snapshot_owned(evidence, item["path"]).read_bytes() for item in frozen},
    }
    for relative, expected_raw in committed_inputs.items():
        result = subprocess.run(
            ["git", "show", f"{commit}:{relative}"],
            cwd=repository,
            env=EXPECTED_RUNTIME["environment"],
            capture_output=True,
            check=False,
            timeout=30,
        )
        require(result.returncode == 0 and result.stdout == expected_raw, f"pushed git object mismatch: {relative}")
    summary: dict[str, Any] | None = None
    if require_capture_summary:
        summary = contract.load_json(evidence / "capture_summary.json")
        validate_capture_summary(summary, manifest, manifest_sha, evidence=evidence)
    return manifest, summary, manifest_sha


def validate_capture_summary(
    summary: dict[str, Any],
    manifest: dict[str, Any],
    manifest_sha: str,
    *,
    evidence: Path | None = None,
) -> None:
    require(set(summary) == CAPTURE_SUMMARY_KEYS, "capture summary keys")
    require(summary.get("schema_id") == "pm.r10.run_capture_summary.v2", "capture summary schema")
    require(summary.get("run_id") == manifest["run_id"], "capture summary run identity")
    require(summary.get("manifest_sha256") == manifest_sha, "capture summary manifest identity")
    denominator = len(manifest["rows"])
    require(summary.get("row_count") == denominator, "capture summary row count")
    for key in ("attempt_count", "subject_launch_count", "subject_launch_lower_bound", "capture_count", "prefix_pass_count"):
        require(isinstance(summary.get(key), int) and not isinstance(summary[key], bool) and 0 <= summary[key] <= denominator, f"capture summary {key}")
    require(isinstance(summary.get("subject_launch_count_exact"), bool), "capture summary launch-count exactness")
    row_ids = [row["row_id"] for row in manifest["rows"]]
    list_fields = (
        ("attempted_row_ids", "attempt_count"),
        ("launched_row_ids", "subject_launch_count"),
        ("launch_lower_bound_row_ids", "subject_launch_lower_bound"),
        ("captured_row_ids", "capture_count"),
        ("prefix_passed_row_ids", "prefix_pass_count"),
    )
    for field, count_field in list_fields:
        require(summary.get(field) == row_ids[: summary[count_field]], f"capture summary {field}")
    require(
        summary["prefix_pass_count"] <= summary["capture_count"] <= summary["subject_launch_lower_bound"] <= summary["attempt_count"]
        and summary["subject_launch_count"] <= summary["subject_launch_lower_bound"],
        "capture summary count order",
    )
    post_popen = summary.get("post_popen_failure_row_ids")
    require(isinstance(post_popen, list) and len(post_popen) == len(set(post_popen)), "capture summary post-Popen rows")
    require(post_popen == [row_id for row_id in row_ids if row_id in set(post_popen)], "capture summary post-Popen roster/order")
    launched = summary["launched_row_ids"]
    expected_lower_bound = [row_id for row_id in row_ids if row_id in set(launched) | set(post_popen)]
    require(summary["launch_lower_bound_row_ids"] == expected_lower_bound, "capture summary launch lower-bound attribution")
    exact_from_evidence = all(row_id in launched for row_id in post_popen)
    require(summary["subject_launch_count_exact"] is exact_from_evidence, "capture summary launch exactness derivation")
    require(
        summary["subject_launch_count_exact"]
        or (summary["subject_launch_count"] < summary["subject_launch_lower_bound"] and post_popen),
        "inexact launch lower bound",
    )
    expected_unconsumed = row_ids[summary["subject_launch_lower_bound"] :]
    require(summary.get("unconsumed_row_ids") == expected_unconsumed, "capture summary unconsumed suffix")
    require(
        summary.get("unconsumed_dispositions")
        == [{"row_id": row_id, "status": "NOT_LAUNCHED_AFTER_CANARY_FAILURE"} for row_id in expected_unconsumed],
        "capture summary unconsumed dispositions",
    )
    gate_hashes = summary.get("prefix_gate_sha256_by_row")
    require(isinstance(gate_hashes, dict) and list(gate_hashes) == row_ids[: summary["prefix_pass_count"]], "capture summary gate roster")
    require(all(isinstance(value, str) and re.fullmatch(r"[0-9a-f]{64}", value) is not None for value in gate_hashes.values()), "capture summary gate hashes")
    complete = summary["prefix_pass_count"] == denominator
    if complete:
        require(summary.get("status") == "CAPTURE_COMPLETE_PENDING_FINAL_VERIFICATION_ZERO_CREDIT", "complete capture summary status")
        require(summary["subject_launch_count_exact"] is True, "complete capture launch count exactness")
        require(summary["attempt_count"] == summary["subject_launch_count"] == summary["subject_launch_lower_bound"] == summary["capture_count"] == denominator, "complete capture summary counts")
        require(post_popen == [], "complete capture post-Popen failures")
        require(summary.get("stop_reason") is None and expected_unconsumed == [], "complete capture terminal fields")
    else:
        if post_popen:
            expected_status = "FAIL_CONTROLLER_AFTER_LAUNCH_ZERO_CREDIT_NO_RETRY"
        elif summary["subject_launch_lower_bound"] == 0:
            expected_status = "FAIL_PRELAUNCH_ZERO_SUBJECT"
        else:
            expected_status = "FAIL_CONSUMED_PREFIX_ZERO_CREDIT_NO_RETRY"
        require(summary.get("status") == expected_status, "failed capture summary status")
        require(isinstance(summary.get("stop_reason"), str) and summary["stop_reason"], "failed capture stop reason")
    require(summary.get("qualification_credit") == 0 and summary.get("qualification_streak") == 0, "capture summary credit")
    if evidence is not None:
        derived = derive_capture_rosters(evidence, manifest, manifest_sha)
        require(summary["attempted_row_ids"] == derived["attempted_row_ids"], "capture summary/evidence attempts")
        require(summary["launched_row_ids"] == derived["launched_row_ids"], "capture summary/evidence launches")
        require(summary["captured_row_ids"] == derived["captured_row_ids"], "capture summary/evidence captures")
        require(summary["post_popen_failure_row_ids"] == derived["post_popen_failure_row_ids"], "capture summary/evidence post-Popen rows")
        require(summary["prefix_passed_row_ids"] == derived["prefix_passed_row_ids"], "capture summary/evidence prefix passes")
        require(summary["prefix_gate_sha256_by_row"] == derived["prefix_gate_sha256_by_row"], "capture summary/evidence prefix hashes")


def canonical_record(path: Path, label: str) -> tuple[dict[str, Any], bytes]:
    raw = path.read_bytes()
    value = contract.load_json_bytes(raw, label)
    require(isinstance(value, dict), f"{label} is not an object")
    require(raw == contract.canonical_bytes(value) + b"\n", f"{label} is not canonical")
    return value, raw


def row_evidence_identities(evidence: Path, row_ids: list[str]) -> list[dict[str, Any]]:
    names = (
        "attempt.json",
        "launch_receipt.json",
        "process_capture.json",
        "submitted_user_prompt.txt",
        "stdout.jsonl",
        "stderr.bin",
        "rollout.jsonl.gz",
        "last_message.txt",
    )
    identities: list[dict[str, Any]] = []
    for row_id in row_ids:
        for name in names:
            path = evidence / "rows" / row_id / name
            require(path.is_file(), f"missing row evidence for prefix gate: {row_id}/{name}")
            raw = path.read_bytes()
            identities.append({
                "path": path.relative_to(evidence).as_posix(),
                "bytes": len(raw),
                "sha256": contract.sha256(raw),
            })
    return identities


def load_valid_prefix_gate(
    evidence: Path,
    manifest: dict[str, Any],
    manifest_sha: str,
    prefix_index: int,
) -> tuple[dict[str, Any], bytes]:
    rows = manifest["rows"]
    require(0 <= prefix_index < len(rows), "prefix gate index")
    row = rows[prefix_index]
    path = evidence / "gates" / f"prefix-{row['row_id']}.json"
    value, raw = canonical_record(path, f"prefix gate {row['row_id']}")
    predecessor_sha: str | None = None
    if prefix_index > 0:
        _predecessor, predecessor_raw = load_valid_prefix_gate(evidence, manifest, manifest_sha, prefix_index - 1)
        predecessor_sha = contract.sha256(predecessor_raw)
    frozen = {item["path"]: item for item in manifest["frozen_files"]}
    expected_rows = [item["row_id"] for item in rows[: prefix_index + 1]]
    require(value.get("schema_id") == "pm.r10.prefix_gate.v1", "prefix gate schema")
    require(value.get("status") == "PASS_PREFIX_FOR_NEXT_LAUNCH_ZERO_CREDIT", "prefix gate not PASS")
    require(value.get("run_id") == manifest["run_id"] and value.get("manifest_sha256") == manifest_sha, "prefix gate run/manifest")
    require(value.get("through_row_id") == row["row_id"] and value.get("through_route_id") == row["route_id"], "prefix gate row/route")
    require(value.get("prefix_index") == prefix_index, "prefix gate index drift")
    require(value.get("verified_row_ids") == expected_rows and value.get("pass_count") == len(expected_rows), "prefix gate denominator")
    require(value.get("predecessor_gate_sha256") == predecessor_sha, "prefix gate chain")
    require(value.get("executing_verifier_sha256") == frozen["r10_verify.py"]["sha256"], "prefix verifier identity")
    require(value.get("executing_contract_sha256") == frozen["r10_contract.py"]["sha256"], "prefix contract identity")
    require(value.get("row_evidence") == row_evidence_identities(evidence, expected_rows), "prefix row-evidence identity")
    row_receipts = value.get("row_receipts")
    require(isinstance(row_receipts, list), "prefix row receipts")
    require([receipt.get("row_id") for receipt in row_receipts] == expected_rows, "prefix receipt row identities")
    require(all(receipt.get("status") == "PASS" for receipt in row_receipts), "prefix receipt status")
    require(value.get("qualification_credit") == 0 and value.get("qualification_streak") == 0, "prefix gate credit")
    process, process_raw = canonical_record(
        evidence / "gates" / f"prefix-{row['row_id']}.process.json",
        f"prefix gate process {row['row_id']}",
    )
    stdout = (evidence / "gates" / f"prefix-{row['row_id']}.stdout.jsonl").read_bytes()
    stderr = (evidence / "gates" / f"prefix-{row['row_id']}.stderr.bin").read_bytes()
    expected_argv = [
        manifest["controller_runtime"]["python_executable"],
        "-B",
        str(evidence / "frozen_snapshot" / "r10_verify.py"),
        "--evidence-root",
        str(evidence),
        "--prefix-row",
        row["row_id"],
        "--write-prefix-receipt",
    ]
    require(process.get("schema_id") == "pm.r10.prefix_gate_process.v1", "prefix process schema")
    require(process.get("run_id") == manifest["run_id"] and process.get("manifest_sha256") == manifest_sha, "prefix process run/manifest")
    require(process.get("row_id") == row["row_id"] and process.get("route_id") == row["route_id"], "prefix process row/route")
    require(process.get("argv") == expected_argv, "prefix process argv")
    require(process.get("returncode") == 0 and process.get("status") == "PASS" and process.get("validation_error") is None, "prefix process result")
    require(process.get("stdout_sha256") == contract.sha256(stdout) and process.get("stdout_bytes") == len(stdout), "prefix process stdout identity")
    require(process.get("stderr_sha256") == contract.sha256(stderr) and process.get("stderr_bytes") == len(stderr), "prefix process stderr identity")
    require(stdout == raw and stderr == b"", "prefix process output/gate join")
    require(process.get("gate_sha256") == contract.sha256(raw), "prefix process gate hash")
    require(process_raw == contract.canonical_bytes(process) + b"\n", "prefix process canonical identity")
    return value, raw


def derive_capture_rosters(
    evidence: Path,
    manifest: dict[str, Any],
    manifest_sha: str,
) -> dict[str, Any]:
    attempted: list[str] = []
    launched: list[str] = []
    captured: list[str] = []
    post_popen: list[str] = []
    rows = manifest["rows"]
    for row in rows:
        row_id = row["row_id"]
        row_root = evidence / "rows" / row_id
        attempt_path = row_root / "attempt.json"
        launch_path = row_root / "launch_receipt.json"
        capture_path = row_root / "process_capture.json"
        failure_path = row_root / "runner_failure.json"

        if attempt_path.is_file():
            attempt, _raw = canonical_record(attempt_path, f"attempt {row_id}")
            require(attempt.get("schema_id") == "pm.r10.attempt.v1", f"attempt schema: {row_id}")
            require(attempt.get("run_id") == manifest["run_id"] and attempt.get("manifest_sha256") == manifest_sha, f"attempt run/manifest: {row_id}")
            require(attempt.get("row_id") == row_id and attempt.get("route_id") == row["route_id"], f"attempt row/route: {row_id}")
            require(attempt.get("attempt") == 0 and attempt.get("qualification_credit") == 0, f"attempt count/credit: {row_id}")
            attempted.append(row_id)

        launch: dict[str, Any] | None = None
        if launch_path.is_file():
            launch, _raw = canonical_record(launch_path, f"launch receipt {row_id}")
            require(launch.get("schema_id") == "pm.r10.launch_receipt.v1", f"launch schema: {row_id}")
            require(launch.get("run_id") == manifest["run_id"] and launch.get("manifest_sha256") == manifest_sha, f"launch run/manifest: {row_id}")
            require(launch.get("row_id") == row_id and launch.get("route_id") == row["route_id"], f"launch row/route: {row_id}")
            require(launch.get("attempt") == 0 and launch.get("qualification_credit") == 0, f"launch count/credit: {row_id}")
            require(launch.get("status") == "POPEN_RETURNED_LAUNCH_OBSERVED", f"launch status: {row_id}")
            require(launch.get("codex_binary") == manifest["codex_binary"], f"launch binary: {row_id}")
            require(isinstance(launch.get("pid"), int) and not isinstance(launch["pid"], bool) and launch["pid"] > 0, f"launch PID: {row_id}")
            require(row_id in attempted, f"launch without attempt: {row_id}")
            launched.append(row_id)

        if capture_path.is_file():
            capture, _raw = canonical_record(capture_path, f"process capture {row_id}")
            require(capture.get("schema_id") == "pm.r10.process_capture.v1", f"capture schema: {row_id}")
            require(capture.get("run_id") == manifest["run_id"] and capture.get("manifest_sha256") == manifest_sha, f"capture run/manifest: {row_id}")
            require(capture.get("row_id") == row_id and capture.get("route_id") == row["route_id"], f"capture row/route: {row_id}")
            require(capture.get("attempt") == 0 and capture.get("qualification_credit") == 0, f"capture count/credit: {row_id}")
            require(capture.get("status") == "CAPTURED_UNVERIFIED", f"capture status: {row_id}")
            require(row_id in launched and capture.get("pid") == launch["pid"], f"capture without joined launch: {row_id}")
            captured.append(row_id)

        if failure_path.is_file():
            failure, _raw = canonical_record(failure_path, f"runner failure {row_id}")
            require(failure.get("schema_id") == "pm.r10.runner_failure.v1", f"runner failure schema: {row_id}")
            require(failure.get("run_id") == manifest["run_id"] and failure.get("manifest_sha256") == manifest_sha, f"runner failure run/manifest: {row_id}")
            require(failure.get("row_id") == row_id and failure.get("route_id") == row["route_id"], f"runner failure row/route: {row_id}")
            require(failure.get("attempt") == 0 and failure.get("qualification_credit") == 0, f"runner failure count/credit: {row_id}")
            require(failure.get("status") == "FAIL_CONSUMED_OR_CONTROLLER_INVALID_NO_RETRY", f"runner failure status: {row_id}")
            require(isinstance(failure.get("error"), str) and failure["error"], f"runner failure error: {row_id}")
            require(isinstance(failure.get("popen_observed"), bool), f"runner failure Popen observation: {row_id}")
            if failure["popen_observed"]:
                require(isinstance(failure.get("pid"), int) and not isinstance(failure["pid"], bool) and failure["pid"] > 0, f"runner failure PID: {row_id}")
                if launch is not None:
                    require(failure["pid"] == launch["pid"], f"runner failure/launch PID: {row_id}")
                post_popen.append(row_id)
            else:
                require(failure.get("pid") is None and launch is None, f"pre-Popen failure/launch conflict: {row_id}")

    prefix_passed: list[str] = []
    gate_hashes: dict[str, str] = {}
    blocked = False
    for index, row in enumerate(rows):
        gate_path = evidence / "gates" / f"prefix-{row['row_id']}.json"
        if not gate_path.is_file():
            blocked = True
            continue
        gate, raw = canonical_record(gate_path, f"prefix gate disposition {row['row_id']}")
        if gate.get("status") == "PASS_PREFIX_FOR_NEXT_LAUNCH_ZERO_CREDIT":
            require(not blocked, f"prefix PASS after missing/failing predecessor: {row['row_id']}")
            _validated, validated_raw = load_valid_prefix_gate(evidence, manifest, manifest_sha, index)
            require(validated_raw == raw, f"prefix gate revalidation join: {row['row_id']}")
            prefix_passed.append(row["row_id"])
            gate_hashes[row["row_id"]] = contract.sha256(raw)
        else:
            require(gate.get("schema_id") == "pm.r10.prefix_gate.v1", f"failed prefix schema: {row['row_id']}")
            require(gate.get("status") == "FAIL_PREFIX_CONSUMED_ZERO_CREDIT_NO_RETRY", f"failed prefix status: {row['row_id']}")
            require(gate.get("run_id") == manifest["run_id"] and gate.get("manifest_sha256") == manifest_sha, f"failed prefix run/manifest: {row['row_id']}")
            require(
                gate.get("through_row_id") == row["row_id"]
                and gate.get("through_route_id") == row["route_id"]
                and gate.get("prefix_index") == index,
                f"failed prefix row/route/index: {row['row_id']}",
            )
            require(gate.get("qualification_credit") == 0 and gate.get("qualification_streak") == 0, f"failed prefix credit: {row['row_id']}")
            blocked = True

    return {
        "attempted_row_ids": attempted,
        "launched_row_ids": launched,
        "captured_row_ids": captured,
        "post_popen_failure_row_ids": post_popen,
        "prefix_passed_row_ids": prefix_passed,
        "prefix_gate_sha256_by_row": gate_hashes,
    }


def expected_launch_authorization(
    evidence: Path,
    manifest: dict[str, Any],
    manifest_sha: str,
    row: dict[str, Any],
) -> dict[str, Any]:
    rows = manifest["rows"]
    index = next((position for position, item in enumerate(rows) if item["row_id"] == row["row_id"]), None)
    require(index is not None, "row absent from manifest roster")
    if index == 0:
        path = evidence / "preflight_receipt.json"
        raw = path.read_bytes()
        return {
            "kind": "pushed_preflight",
            "path": path.relative_to(evidence).as_posix(),
            "sha256": contract.sha256(raw),
            "predecessor_row_id": None,
        }
    _gate, raw = load_valid_prefix_gate(evidence, manifest, manifest_sha, index - 1)
    predecessor = rows[index - 1]
    path = evidence / "gates" / f"prefix-{predecessor['row_id']}.json"
    return {
        "kind": "prefix_gate",
        "path": path.relative_to(evidence).as_posix(),
        "sha256": contract.sha256(raw),
        "predecessor_row_id": predecessor["row_id"],
    }


def expected_subject_argv(
    manifest: dict[str, Any],
    row: dict[str, Any],
    temp_dir: Path,
    last_message_path: Path,
) -> list[str]:
    """Return the frozen host-only-schema subject argv expected for Canary 003."""

    return [
        manifest["codex_binary"]["path"], "exec", "--strict-config", "-C", str(temp_dir),
        "--skip-git-repo-check", "--ignore-user-config", "--ignore-rules",
        "--sandbox", manifest["runtime"]["sandbox"], "--color", "never", "--json",
        "-m", row["model"], "-c", f'model_reasoning_effort="{row["reasoning_effort"]}"',
        "-c", "suppress_unstable_features_warning=true",
        "-o", str(last_message_path), "-",
    ]


def validate_recorded_launch(
    manifest: dict[str, Any],
    manifest_sha: str,
    row: dict[str, Any],
    capsule: dict[str, Any],
    evidence: Path,
    row_root: Path,
    attempt: dict[str, Any],
    capture: dict[str, Any],
) -> None:
    launch = contract.load_json(row_root / "launch_receipt.json")
    require(attempt.get("schema_id") == "pm.r10.attempt.v1", "attempt schema")
    require(launch.get("schema_id") == "pm.r10.launch_receipt.v1", "launch receipt schema")
    require(capture.get("schema_id") == "pm.r10.process_capture.v1", "capture schema")
    for record, label in ((attempt, "attempt"), (launch, "launch"), (capture, "capture")):
        require(record.get("run_id") == manifest["run_id"], f"{label} run identity")
        require(record.get("row_id") == row["row_id"], f"{label} row identity")
        require(record.get("route_id") == row["route_id"], f"{label} route identity")
        require(record.get("attempt") == 0, f"{label} attempt identity")
        require(record.get("manifest_sha256") == manifest_sha, f"{label} manifest custody")
        require(record.get("qualification_credit") == 0, f"{label} qualification credit")
    require(attempt.get("unit_id") == capsule["unit_id"], "attempt unit identity")
    require(attempt.get("nonce") == row["nonce"], "attempt nonce")
    require(attempt.get("codex_binary") == manifest["codex_binary"], "attempt Codex binary identity")
    require(launch.get("codex_binary") == manifest["codex_binary"], "launch Codex binary identity")
    require(attempt.get("retry") is False and attempt.get("replacement") is False, "attempt retry/replacement")
    require(isinstance(attempt.get("started_at_unix_ms"), int) and attempt["started_at_unix_ms"] > 0, "attempt start time")
    require(attempt.get("environment") == manifest["runtime"]["environment"], "child environment drift")
    require(attempt.get("timeout_seconds") == manifest["runtime"]["timeout_seconds"], "timeout drift")
    authorization = expected_launch_authorization(evidence, manifest, manifest_sha, row)
    require(attempt.get("launch_authorization") == authorization, "attempt launch authorization")
    require(launch.get("launch_authorization") == authorization, "launch receipt authorization")
    require(launch.get("status") == "POPEN_RETURNED_LAUNCH_OBSERVED", "launch receipt status")
    require(launch.get("argv") == attempt.get("argv"), "launch/attempt argv join")
    require(launch.get("started_at_unix_ms") == attempt.get("started_at_unix_ms"), "launch/attempt start join")
    require(isinstance(launch.get("popen_returned_at_unix_ms"), int) and launch["popen_returned_at_unix_ms"] >= launch["started_at_unix_ms"], "launch receipt time")

    argv = attempt.get("argv")
    require(isinstance(argv, list) and all(isinstance(item, str) for item in argv), "argv record")
    temp_dir = Path(argv[4]) if len(argv) > 4 else Path("")
    require(temp_dir.is_absolute() and temp_dir.parent == Path(manifest["runtime"]["temporary_root"]), "temporary directory root")
    require(temp_dir.name.startswith(f"r10-{manifest['run_id']}-{row['row_id']}-"), "temporary directory identity")
    expected_argv = expected_subject_argv(manifest, row, temp_dir, row_root / "last_message.txt")
    require(argv == expected_argv, "argv/configuration drift")

    require(capture.get("status") == "CAPTURED_UNVERIFIED", "capture status")
    require(isinstance(capture.get("pid"), int) and capture["pid"] > 0, "capture PID")
    require(launch.get("pid") == capture.get("pid"), "launch/capture PID join")
    require(isinstance(capture.get("elapsed_ms"), int) and capture["elapsed_ms"] >= 0, "capture elapsed time")


def verify_row(manifest: dict[str, Any], manifest_sha: str, row: dict[str, Any], evidence: Path, oracle: dict[str, Any]) -> dict[str, Any]:
    row_root = evidence / "rows" / row["row_id"]
    require(row_root.is_dir(), "row directory missing")
    require(not (row_root / "runner_failure.json").exists(), "runner failure present")
    attempt = contract.load_json(row_root / "attempt.json")
    capture = contract.load_json(row_root / "process_capture.json")
    capsule = contract.load_json(snapshot_owned(evidence, row["capsule_path"]))
    validate_recorded_launch(manifest, manifest_sha, row, capsule, evidence, row_root, attempt, capture)
    require(capture["stdin_submission_count"] == 1 and capture["stdin_closed"] is True, "submission count")
    require(capture.get("snapshot_integrity_after") == "PASS" and capture.get("snapshot_integrity_errors") == [], "snapshot integrity")

    capsule_schema = contract.load_json(snapshot_owned(evidence, "prompt_capsule.schema.json"))
    prompt, metrics = contract.render_prompt(capsule, "codex", capsule_schema)
    prompt_raw = (row_root / "submitted_user_prompt.txt").read_bytes()
    require(prompt_raw == prompt.encode("utf-8"), "submitted prompt drift")
    require_manifest_prompt_metrics(row, metrics)
    require(attempt["submitted_user_prompt_sha256"] == metrics["prompt_sha256"], "attempt prompt hash")
    require(attempt["submitted_user_prompt_utf8_bytes"] == metrics["prompt_utf8_bytes"], "attempt prompt bytes")

    stdout = (row_root / "stdout.jsonl").read_bytes()
    stderr = (row_root / "stderr.bin").read_bytes()
    require_blob_identity(stdout, capture, "stdout_sha256", "stdout_bytes", "stdout")
    require_blob_identity(stderr, capture, "stderr_sha256", "stderr_bytes", "stderr")
    if capture.get("returncode") != 0 or capture.get("timed_out") is not False:
        raise VerifyError(process_terminal_error(stdout, capture))
    require(stderr == b"", "nonempty stderr")
    require(isinstance(capture.get("last_message"), dict), "last-message capture")
    require(isinstance(capture.get("thread_id"), str) and capture["thread_id"], "missing thread id")
    require(stdout_thread_id(stdout) == capture["thread_id"], "stdout/capture thread mismatch")
    require(capture["rollout_error"] is None and isinstance(capture.get("rollout"), dict), "rollout capture missing")

    compressed = (row_root / "rollout.jsonl.gz").read_bytes()
    require_blob_identity(compressed, capture["rollout"], "gzip_sha256", "gzip_bytes", "rollout gzip")
    raw = gzip.decompress(compressed)
    require_blob_identity(raw, capture["rollout"], "raw_sha256", "raw_bytes", "rollout raw")
    trace = parse_trace(raw)

    session = [item["payload"] for item in trace if item.get("type") == "session_meta"]
    require(len(session) == 1, "session_meta count")
    session_id = session[0].get("id") or session[0].get("session_id")
    require(session_id == capture["thread_id"], "session/thread mismatch")
    if session[0].get("id") is not None and session[0].get("session_id") is not None:
        require(session[0]["id"] == session[0]["session_id"], "session identity fields disagree")
    require(session[0].get("cli_version") == manifest["codex_cli_version"], "CLI version mismatch")
    require(session[0].get("originator") == "codex_exec" and session[0].get("source") == "exec", "session execution surface")
    require(session[0].get("thread_source") == "user" and session[0].get("model_provider") == "openai", "session source/provider")
    temp_dir = attempt["argv"][4]
    require(session[0].get("cwd") == temp_dir, "session cwd mismatch")
    intervals = task_intervals(trace)
    turn_context_rows = [item for item in trace if item.get("type") == "turn_context"]
    validate_turn_contexts(turn_context_rows, intervals, row, temp_dir)

    final_messages: list[tuple[int, str, str | None]] = []
    for item in trace:
        if item.get("type") != "response_item":
            continue
        payload = item.get("payload", {})
        if payload.get("type") != "message":
            continue
        text = message_text(payload)
        if payload.get("role") == "assistant" and payload.get("phase") == "final_answer":
            final_messages.append((item["ordinal"], text, turn_id(payload)))

    external = require_single_external_submission(trace, prompt, capture["thread_id"], intervals)

    calls, outputs = tool_projection(trace)
    by_tool = validate_goal_call_counts(calls)
    create = by_tool["create_goal"][0]
    update = by_tool["update_goal"][0]
    create_output = outputs[create["call_id"]]
    update_output = outputs[update["call_id"]]
    for call in calls:
        output = outputs[call["call_id"]]
        require(call["ordinal"] < output["ordinal"], f"{call['tool']} output precedes call")
        require(call["turn_id"] is not None and call["turn_id"] == output["turn_id"], f"{call['tool']} call/output turn mismatch")
        require_inside(intervals, call["turn_id"], call["ordinal"], f"{call['tool']} call")
        require_inside(intervals, output["turn_id"], output["ordinal"], f"{call['tool']} output")

    active_goal = goal_from_output(create_output["payload"])
    complete_goal = goal_from_output(update_output["payload"])
    require(active_goal is not None and complete_goal is not None, "Goal receipts not parseable")
    require(active_goal.get("status") == "active" and complete_goal.get("status") == "complete", "Goal states")
    require(active_goal.get("threadId") == capture["thread_id"] == complete_goal.get("threadId"), "Goal/thread identity join")
    require(active_goal.get("objective") == create["args"]["objective"] == complete_goal.get("objective"), "Goal objective/call drift")
    require(isinstance(active_goal.get("createdAt"), int) and active_goal.get("createdAt") == complete_goal.get("createdAt"), "Goal creation identity drift")
    require(isinstance(active_goal.get("updatedAt"), int) and isinstance(complete_goal.get("updatedAt"), int) and active_goal["updatedAt"] <= complete_goal["updatedAt"], "Goal receipt time order")
    require(capsule["unit_id"] in active_goal["objective"], "Goal objective lacks unit identity")
    require_submission_before_goal(external, create)

    semantic_ordinal, semantic_text, semantic_turn, result = select_semantic_final(final_messages, intervals)
    response_schema = contract.load_json(snapshot_owned(evidence, row["response_schema_path"]))
    contract.validate_provider_response_schema(response_schema)
    jsonschema.Draft202012Validator(response_schema).validate(result)
    source_ids = result.get("source_ids")
    require(isinstance(source_ids, list) and len(source_ids) == len(set(source_ids)), "source_ids uniqueness")
    expected = oracle[capsule["unit_id"]]
    require(result == expected, "semantic result mismatch")
    require(update["turn_id"] == semantic_turn, "terminal Goal call and semantic final must share a task turn")
    require(
        create["ordinal"] < create_output["ordinal"] < update["ordinal"] < update_output["ordinal"] < semantic_ordinal,
        "Goal activation/terminal/result causal order",
    )

    last_raw = (row_root / "last_message.txt").read_bytes()
    require_blob_identity(last_raw, capture["last_message"], "sha256", "bytes", "last message")
    require(contract.load_json_bytes(last_raw, "last message") == result, "last message not semantic result")

    return {
        "schema_id": "pm.r10.verified_row.v1",
        "run_id": manifest["run_id"],
        "row_id": row["row_id"],
        "route_id": row["route_id"],
        "unit_id": capsule["unit_id"],
        "thread_id": capture["thread_id"],
        "goal_thread_id": active_goal["threadId"],
        "goal_objective": active_goal["objective"],
        "goal_activation_output_ordinal": create_output["ordinal"],
        "goal_terminal_output_ordinal": update_output["ordinal"],
        "semantic_result_ordinal": semantic_ordinal,
        "task_turn_count": len(intervals),
        "external_user_submission_count": 1,
        "actual_tool_calls": [call["tool"] for call in calls],
        "submitted_user_prompt_sha256": metrics["prompt_sha256"],
        "raw_rollout_sha256": capture["rollout"]["raw_sha256"],
        "result": result,
        "status": "PASS",
        "qualification_credit": 0,
    }


def verify_prefix(
    evidence: Path,
    manifest: dict[str, Any],
    manifest_sha: str,
    through_row_id: str,
    oracle: dict[str, Any],
) -> dict[str, Any]:
    rows = manifest["rows"]
    prefix_index = next((index for index, row in enumerate(rows) if row["row_id"] == through_row_id), None)
    require(prefix_index is not None, "prefix row absent from manifest")
    receipts: list[dict[str, Any]] = []
    seen_threads: set[str] = set()
    seen_nonces: set[str] = set()
    for row in rows[: prefix_index + 1]:
        try:
            require(row["nonce"] not in seen_nonces, "duplicate nonce in prefix")
            seen_nonces.add(row["nonce"])
            receipt = verify_row(manifest, manifest_sha, row, evidence, oracle)
            require(receipt["thread_id"] not in seen_threads, "duplicate thread in prefix")
            seen_threads.add(receipt["thread_id"])
            receipts.append(receipt)
        except Exception as exc:
            raise PrefixRowFailure(row["row_id"], [item["row_id"] for item in receipts], exc) from exc

    predecessor_sha: str | None = None
    if prefix_index > 0:
        _predecessor, predecessor_raw = load_valid_prefix_gate(evidence, manifest, manifest_sha, prefix_index - 1)
        predecessor_sha = contract.sha256(predecessor_raw)

    frozen = {item["path"]: item for item in manifest["frozen_files"]}
    verified_row_ids = [row["row_id"] for row in rows[: prefix_index + 1]]
    through = rows[prefix_index]
    return {
        "schema_id": "pm.r10.prefix_gate.v1",
        "run_id": manifest["run_id"],
        "manifest_sha256": manifest_sha,
        "through_row_id": through["row_id"],
        "through_route_id": through["route_id"],
        "prefix_index": prefix_index,
        "predecessor_gate_sha256": predecessor_sha,
        "verified_row_ids": verified_row_ids,
        "pass_count": len(receipts),
        "row_receipts": receipts,
        "row_evidence": row_evidence_identities(evidence, verified_row_ids),
        "executing_verifier_sha256": frozen["r10_verify.py"]["sha256"],
        "executing_contract_sha256": frozen["r10_contract.py"]["sha256"],
        "status": "PASS_PREFIX_FOR_NEXT_LAUNCH_ZERO_CREDIT",
        "qualification_credit": 0,
        "qualification_streak": 0,
    }


def exclusive_json(path: Path, value: Any) -> None:
    raw = contract.canonical_bytes(value) + b"\n"
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), 0o644)
    try:
        view = memoryview(raw)
        written = 0
        while written < len(view):
            count = os.write(descriptor, view[written:])
            require(count > 0, f"short exclusive write: {path}")
            written += count
        os.fsync(descriptor)
    finally:
        os.close(descriptor)
    os.chmod(path, 0o444)
    directory = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(directory)
    finally:
        os.close(directory)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--evidence-root", type=Path, required=True)
    parser.add_argument("--write-receipts", action="store_true")
    parser.add_argument("--prefix-row")
    parser.add_argument("--write-prefix-receipt", action="store_true")
    args = parser.parse_args(argv)
    try:
        require(not (args.write_receipts and (args.prefix_row or args.write_prefix_receipt)), "final/prefix verifier mode conflict")
        require(bool(args.prefix_row) == bool(args.write_prefix_receipt), "prefix receipt mode must be explicit")
        if args.prefix_row:
            require(args.prefix_row == "row-alpha-003", "prefix row argument")
        evidence = Path(os.path.abspath(os.fspath(args.evidence_root)))
        require(ROOT.name == "frozen_snapshot", "verifier must execute from the captured frozen snapshot")
        require(evidence == ROOT.parent and (evidence / "frozen_snapshot").resolve() == ROOT, "snapshot/evidence execution join")
        require_designated_evidence_root(evidence)
        require(Path(contract.__file__).resolve().parent == ROOT, "contract module not loaded from frozen snapshot")
        manifest, capture_summary, manifest_sha = load_snapshot_contract(
            evidence,
            require_capture_summary=not bool(args.prefix_row),
        )
        frozen_by_path = {item["path"]: item for item in manifest["frozen_files"]}
        require(contract.sha256(Path(__file__).read_bytes()) == frozen_by_path["r10_verify.py"]["sha256"], "executing verifier identity drift")
        require(contract.sha256(Path(contract.__file__).read_bytes()) == frozen_by_path["r10_contract.py"]["sha256"], "executing contract identity drift")
        oracle = contract.load_json(snapshot_owned(evidence, manifest["oracle_path"]))

        if args.prefix_row:
            gate_path = evidence / "gates" / f"prefix-{args.prefix_row}.json"
            require(not gate_path.exists(), "prefix gate already exists")
            try:
                terminal = verify_prefix(evidence, manifest, manifest_sha, args.prefix_row, oracle)
                exit_code = 0
            except Exception as exc:
                rows = manifest["rows"]
                disposition = prefix_failure_disposition(rows, args.prefix_row, exc)
                index = disposition["prefix_index"]
                predecessor_sha = None
                if isinstance(index, int) and index > 0:
                    predecessor_path = evidence / "gates" / f"prefix-{rows[index - 1]['row_id']}.json"
                    if predecessor_path.is_file():
                        predecessor_sha = contract.sha256(predecessor_path.read_bytes())
                terminal = {
                    "schema_id": "pm.r10.prefix_gate.v1",
                    "run_id": manifest["run_id"],
                    "manifest_sha256": manifest_sha,
                    "through_row_id": args.prefix_row,
                    "through_route_id": rows[index]["route_id"] if isinstance(index, int) else None,
                    "prefix_index": index,
                    "predecessor_gate_sha256": predecessor_sha,
                    "verified_row_ids": disposition["verified_row_ids"],
                    "pass_count": len(disposition["verified_row_ids"]),
                    "failed_row_id": disposition["failed_row_id"],
                    "failed_stage": disposition["failed_stage"],
                    "failed_check": f"{type(exc).__name__}: {exc}",
                    "not_evaluated_row_ids": disposition["not_evaluated_row_ids"],
                    "executing_verifier_sha256": frozen_by_path["r10_verify.py"]["sha256"],
                    "executing_contract_sha256": frozen_by_path["r10_contract.py"]["sha256"],
                    "status": "FAIL_PREFIX_CONSUMED_ZERO_CREDIT_NO_RETRY",
                    "qualification_credit": 0,
                    "qualification_streak": 0,
                }
                exit_code = 1
            exclusive_json(gate_path, terminal)
            sys.stdout.buffer.write(contract.canonical_bytes(terminal) + b"\n")
            return exit_code

        require(isinstance(capture_summary, dict), "capture summary absent")
        complete_capture = (
            capture_summary.get("status") == "CAPTURE_COMPLETE_PENDING_FINAL_VERIFICATION_ZERO_CREDIT"
            and capture_summary.get("attempt_count") == EXPECTED_ACCEPTANCE["required_pass"]
            and capture_summary.get("subject_launch_count") == EXPECTED_ACCEPTANCE["required_pass"]
            and capture_summary.get("capture_count") == EXPECTED_ACCEPTANCE["required_pass"]
            and capture_summary.get("prefix_pass_count") == EXPECTED_ACCEPTANCE["required_pass"]
        )
        if not complete_capture:
            terminal = {
                "schema_id": "pm.r10.verified_run.v1",
                "run_id": manifest["run_id"],
                "manifest_sha256": manifest_sha,
                "executing_verifier_sha256": frozen_by_path["r10_verify.py"]["sha256"],
                "executing_contract_sha256": frozen_by_path["r10_contract.py"]["sha256"],
                "row_count": len(manifest["rows"]),
                "pass_count": 0,
                "fail_count": 1,
                "receipts": [],
                "failures": [{"stage": "capture_or_prefix", "error": capture_summary.get("stop_reason", "incomplete capture")}],
                "unconsumed_row_ids": capture_summary.get("unconsumed_row_ids", []),
                "status": "FAIL_PARTIAL_CAPTURE_ZERO_CREDIT_NO_RETRY",
                "qualification_credit": 0,
                "qualification_streak": 0,
            }
            if args.write_receipts:
                output = evidence / "verification.json"
                require(not output.exists(), "verification already exists")
                exclusive_json(output, terminal)
            sys.stdout.buffer.write(contract.canonical_bytes(terminal) + b"\n")
            return 1

        gate_hashes: dict[str, str] = {}
        for index, row in enumerate(manifest["rows"]):
            _gate, raw = load_valid_prefix_gate(evidence, manifest, manifest_sha, index)
            gate_hashes[row["row_id"]] = contract.sha256(raw)
        require(capture_summary.get("prefix_gate_sha256_by_row") == gate_hashes, "capture-summary prefix gate join")

        receipts: list[dict[str, Any]] = []
        failures: list[dict[str, str]] = []
        seen_threads: set[str] = set()
        seen_nonces: set[str] = set()
        for row in manifest["rows"]:
            try:
                require(row["nonce"] not in seen_nonces, "duplicate nonce")
                seen_nonces.add(row["nonce"])
                receipt = verify_row(manifest, manifest_sha, row, evidence, oracle)
                require(receipt["thread_id"] not in seen_threads, "duplicate thread")
                seen_threads.add(receipt["thread_id"])
                receipts.append(receipt)
            except Exception as exc:
                failures.append({"row_id": row["row_id"], "error": f"{type(exc).__name__}: {exc}"})
                break
        passed = not failures and len(receipts) == EXPECTED_ACCEPTANCE["required_pass"] == len(manifest["rows"])
        status = "PASS_DIAGNOSTIC_ZERO_CREDIT" if passed else "FAIL_CONSUMED_ZERO_CREDIT_NO_RETRY"
        failed_row_id = failures[0]["row_id"] if failures else None
        failed_index = next(
            (index for index, row in enumerate(manifest["rows"]) if row["row_id"] == failed_row_id),
            None,
        )
        not_evaluated_row_ids = (
            [row["row_id"] for row in manifest["rows"][failed_index + 1 :]]
            if isinstance(failed_index, int)
            else []
        )
        terminal = {
            "schema_id": "pm.r10.verified_run.v1",
            "run_id": manifest["run_id"],
            "manifest_sha256": manifest_sha,
            "executing_verifier_sha256": frozen_by_path["r10_verify.py"]["sha256"],
            "executing_contract_sha256": frozen_by_path["r10_contract.py"]["sha256"],
            "row_count": len(manifest["rows"]),
            "pass_count": len(receipts),
            "fail_count": len(failures),
            "receipts": receipts,
            "failures": failures,
            "not_evaluated_row_ids": not_evaluated_row_ids,
            "status": status,
            "qualification_credit": 0,
            "qualification_streak": 0,
        }
        if args.write_receipts:
            output = evidence / "verification.json"
            require(not output.exists(), "verification already exists")
            exclusive_json(output, terminal)
        sys.stdout.buffer.write(contract.canonical_bytes(terminal) + b"\n")
        return 0 if passed else 1
    except Exception as exc:
        failure = {
            "schema_id": "pm.r10.verifier_terminal.v1",
            "status": "FAIL_VERIFIER",
            "error": f"{type(exc).__name__}: {exc}",
            "qualification_credit": 0,
        }
        sys.stdout.buffer.write(contract.canonical_bytes(failure) + b"\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
