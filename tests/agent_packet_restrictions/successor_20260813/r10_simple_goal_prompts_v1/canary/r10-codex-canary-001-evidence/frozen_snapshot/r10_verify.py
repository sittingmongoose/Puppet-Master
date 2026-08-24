#!/usr/bin/env python3
"""Independent snapshot-only verifier for captured R10 Codex canary runs."""

from __future__ import annotations

import argparse
import gzip
import json
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
    "bravo": ("gpt-5.4-mini", "medium"),
    "charlie": ("gpt-5.6-luna", "medium"),
}
EXPECTED_ACCEPTANCE = {
    "external_user_submission_count_per_row": 1,
    "goal_create_count_per_row": 1,
    "goal_terminal_count_per_row": 1,
    "same_goal_thread_identity": True,
    "activation_before_semantic_result": True,
    "actual_tool_calls_subset": ["create_goal", "get_goal", "update_goal"],
    "filesystem_writes_by_subject": 0,
    "network_calls_by_subject": 0,
    "schema_validation": "strict",
    "semantic_score": "exact_json_value",
    "required_pass": 3,
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
    "canary/response.schema.json",
    "canary/capsule.json",
    "canary/oracle.json",
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


def require(condition: bool, message: str) -> None:
    if not condition:
        raise VerifyError(message)


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


def json_objects(text: str) -> list[dict[str, Any]]:
    decoder = json.JSONDecoder(object_pairs_hook=contract._no_duplicates)
    values: list[dict[str, Any]] = []
    for index, character in enumerate(text):
        if character != "{":
            continue
        try:
            value, _end = decoder.raw_decode(text[index:])
        except (json.JSONDecodeError, contract.ContractError):
            continue
        if isinstance(value, dict):
            values.append(value)
    return values


def goal_from_output(payload: dict[str, Any]) -> dict[str, Any] | None:
    for text in text_parts(payload.get("output")):
        for value in reversed(json_objects(text)):
            if isinstance(value.get("goal"), dict):
                return value["goal"]
    return None


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
            value = json.loads(line, object_pairs_hook=contract._no_duplicates)
        except (json.JSONDecodeError, contract.ContractError) as exc:
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
            objective = json.loads(match.group("objective"))
        except json.JSONDecodeError as exc:
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
        args = json.loads(raw, object_pairs_hook=contract._no_duplicates)
    except (json.JSONDecodeError, contract.ContractError) as exc:
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


def load_snapshot_contract(evidence: Path) -> tuple[dict[str, Any], dict[str, Any], str]:
    manifest_raw = (evidence / "manifest.json").read_bytes()
    commitment_raw = (evidence / "manifest.commitment.json").read_bytes()
    manifest = contract.load_json_bytes(manifest_raw, "evidence manifest")
    commitment = contract.load_json_bytes(commitment_raw, "evidence manifest commitment")
    manifest_sha = contract.sha256(manifest_raw)
    require(
        commitment == {
            "schema_id": "pm.r10.manifest_commitment.v1",
            "manifest_path": "canary/manifest.json",
            "manifest_sha256": manifest_sha,
        },
        "evidence manifest commitment mismatch",
    )
    require(manifest.get("schema_id") == "pm.r10.run_manifest.v1", "manifest schema")
    require(manifest.get("run_id") == "r10-codex-canary-001", "run identity")
    require(manifest.get("kind") == "three_route_codex_canary", "canary kind")
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
    require(isinstance(rows, list) and len(rows) == EXPECTED_ACCEPTANCE["required_pass"] == 3, "exact row denominator")
    require([row.get("route_id") for row in rows] == list(EXPECTED_ROSTER), "route roster drift")
    require(len({row.get("row_id") for row in rows}) == 3 and len({row.get("nonce") for row in rows}) == 3, "row/nonce uniqueness")
    for row in rows:
        require((row.get("model"), row.get("reasoning_effort")) == EXPECTED_ROSTER[row["route_id"]], f"route binding drift: {row['route_id']}")
        require(row.get("row_id") == f"row-{row['route_id']}-000", f"row identity drift: {row['route_id']}")
    frozen = manifest.get("frozen_files")
    require(isinstance(frozen, list) and len(frozen) == len({item.get("path") for item in frozen}), "frozen path cardinality")
    require({item.get("path") for item in frozen} == EXPECTED_FROZEN_PATHS, "frozen path set drift")
    for expected in frozen:
        path = snapshot_owned(evidence, expected["path"])
        raw = path.read_bytes()
        require({"path": expected["path"], "utf8_bytes": len(raw), "sha256": contract.sha256(raw)} == expected, f"snapshot identity drift: {expected['path']}")
    preflight = contract.load_json(evidence / "preflight_receipt.json")
    require(preflight.get("status") == "PASS_BEFORE_ANY_SUBJECT_LAUNCH", "preflight receipt")
    require(preflight.get("manifest_sha256") == manifest_sha and preflight.get("subject_launch_count") == 0, "preflight custody")
    require(preflight.get("runtime") == manifest["runtime"] and preflight.get("controller_runtime") == manifest["controller_runtime"], "preflight runtime join")
    require(preflight.get("frozen_files") == manifest["frozen_files"], "preflight frozen-file join")
    git_custody = preflight.get("git_custody")
    require(isinstance(git_custody, dict) and git_custody.get("status") == "PASS_PUSHED_HEAD_EXACT_INPUTS", "pushed git custody receipt")
    require(git_custody.get("repository") == EXPECTED_RUNTIME["repository"] and git_custody.get("branch") == "main", "git repository/branch custody")
    commit = git_custody.get("head")
    require(isinstance(commit, str) and re.fullmatch(r"[0-9a-f]{40}", commit) is not None and commit == git_custody.get("origin_main"), "git commit custody")
    repository = Path(EXPECTED_RUNTIME["repository"])
    r10_relative = R10_REPO_RELATIVE
    expected_tracked = {
        f"{r10_relative}/canary/manifest.json",
        f"{r10_relative}/canary/manifest.commitment.json",
        *(f"{r10_relative}/{item['path']}" for item in frozen),
    }
    require(set(git_custody.get("tracked_launch_inputs", [])) == expected_tracked, "tracked launch-input set drift")
    committed_inputs = {
        f"{r10_relative}/canary/manifest.json": manifest_raw,
        f"{r10_relative}/canary/manifest.commitment.json": commitment_raw,
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
    summary = contract.load_json(evidence / "capture_summary.json")
    require(summary.get("status") == "TERMINAL_UNVERIFIED", "capture summary status")
    require(summary.get("row_count") == 3 and summary.get("capture_count") == 3 and summary.get("subject_launch_count") == 3, "complete three-row capture")
    return manifest, summary, manifest_sha


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
    require(attempt.get("schema_id") == "pm.r10.attempt.v1", "attempt schema")
    require(capture.get("schema_id") == "pm.r10.process_capture.v1", "capture schema")
    for record, label in ((attempt, "attempt"), (capture, "capture")):
        require(record.get("run_id") == manifest["run_id"], f"{label} run identity")
        require(record.get("row_id") == row["row_id"], f"{label} row identity")
        require(record.get("route_id") == row["route_id"], f"{label} route identity")
        require(record.get("attempt") == 0, f"{label} attempt identity")
        require(record.get("manifest_sha256") == manifest_sha, f"{label} manifest custody")
        require(record.get("qualification_credit") == 0, f"{label} qualification credit")
    require(attempt.get("unit_id") == capsule["unit_id"], "attempt unit identity")
    require(attempt.get("nonce") == row["nonce"], "attempt nonce")
    require(attempt.get("retry") is False and attempt.get("replacement") is False, "attempt retry/replacement")
    require(isinstance(attempt.get("started_at_unix_ms"), int) and attempt["started_at_unix_ms"] > 0, "attempt start time")
    require(attempt.get("environment") == manifest["runtime"]["environment"], "child environment drift")
    require(attempt.get("timeout_seconds") == manifest["runtime"]["timeout_seconds"], "timeout drift")

    argv = attempt.get("argv")
    require(isinstance(argv, list) and all(isinstance(item, str) for item in argv), "argv record")
    temp_dir = Path(argv[4]) if len(argv) > 4 else Path("")
    require(temp_dir.is_absolute() and temp_dir.parent == Path(manifest["runtime"]["temporary_root"]), "temporary directory root")
    require(temp_dir.name.startswith(f"r10-{manifest['run_id']}-{row['row_id']}-"), "temporary directory identity")
    expected_argv = [
        manifest["codex_binary"]["path"], "exec", "--strict-config", "-C", str(temp_dir),
        "--skip-git-repo-check", "--ignore-user-config", "--ignore-rules",
        "--sandbox", manifest["runtime"]["sandbox"], "--color", "never", "--json",
        "-m", row["model"], "-c", f'model_reasoning_effort="{row["reasoning_effort"]}"',
        "-c", "suppress_unstable_features_warning=true",
        "--output-schema", str(snapshot_owned(evidence, row["response_schema_path"])),
        "-o", str(row_root / "last_message.txt"), "-",
    ]
    require(argv == expected_argv, "argv/configuration drift")

    require(capture.get("status") == "CAPTURED_UNVERIFIED", "capture status")
    require(isinstance(capture.get("pid"), int) and capture["pid"] > 0, "capture PID")
    require(isinstance(capture.get("elapsed_ms"), int) and capture["elapsed_ms"] >= 0, "capture elapsed time")
    require(isinstance(capture.get("last_message"), dict), "last-message capture")


def verify_row(manifest: dict[str, Any], manifest_sha: str, row: dict[str, Any], evidence: Path, oracle: dict[str, Any]) -> dict[str, Any]:
    row_root = evidence / "rows" / row["row_id"]
    require(row_root.is_dir(), "row directory missing")
    require(not (row_root / "runner_failure.json").exists(), "runner failure present")
    attempt = contract.load_json(row_root / "attempt.json")
    capture = contract.load_json(row_root / "process_capture.json")
    capsule = contract.load_json(snapshot_owned(evidence, row["capsule_path"]))
    validate_recorded_launch(manifest, manifest_sha, row, capsule, evidence, row_root, attempt, capture)
    require(capture["returncode"] == 0 and capture["timed_out"] is False, "process terminal")
    require(capture["stdin_submission_count"] == 1 and capture["stdin_closed"] is True, "submission count")
    require(capture.get("snapshot_integrity_after") == "PASS" and capture.get("snapshot_integrity_errors") == [], "snapshot integrity")
    require(isinstance(capture.get("thread_id"), str) and capture["thread_id"], "missing thread id")
    require(capture["rollout_error"] is None and isinstance(capture.get("rollout"), dict), "rollout capture missing")

    capsule_schema = contract.load_json(snapshot_owned(evidence, "prompt_capsule.schema.json"))
    prompt, metrics = contract.render_prompt(capsule, "codex", capsule_schema)
    prompt_raw = (row_root / "submitted_user_prompt.txt").read_bytes()
    require(prompt_raw == prompt.encode("utf-8"), "submitted prompt drift")
    require(metrics["prompt_sha256"] == row["submitted_user_prompt_sha256"], "prompt manifest hash")
    require(attempt["submitted_user_prompt_sha256"] == metrics["prompt_sha256"], "attempt prompt hash")
    require(attempt["submitted_user_prompt_utf8_bytes"] == metrics["prompt_utf8_bytes"], "attempt prompt bytes")

    stdout = (row_root / "stdout.jsonl").read_bytes()
    stderr = (row_root / "stderr.bin").read_bytes()
    require(contract.sha256(stdout) == capture["stdout_sha256"] and len(stdout) == capture["stdout_bytes"], "stdout identity")
    require(contract.sha256(stderr) == capture["stderr_sha256"] and len(stderr) == capture["stderr_bytes"], "stderr identity")
    require(stderr == b"", "nonempty stderr")

    compressed = (row_root / "rollout.jsonl.gz").read_bytes()
    require(contract.sha256(compressed) == capture["rollout"]["gzip_sha256"], "rollout gzip hash")
    raw = gzip.decompress(compressed)
    require(contract.sha256(raw) == capture["rollout"]["raw_sha256"] and len(raw) == capture["rollout"]["raw_bytes"], "rollout raw identity")
    trace = parse_trace(raw)

    session = [item["payload"] for item in trace if item.get("type") == "session_meta"]
    require(len(session) == 1, "session_meta count")
    session_id = session[0].get("id") or session[0].get("session_id")
    require(session_id == capture["thread_id"], "session/thread mismatch")
    if session[0].get("id") is not None and session[0].get("session_id") is not None:
        require(session[0]["id"] == session[0]["session_id"], "session identity fields disagree")
    require(session[0].get("cli_version") == manifest["codex_cli_version"], "CLI version mismatch")

    turn_contexts = [item["payload"] for item in trace if item.get("type") == "turn_context"]
    require(turn_contexts, "missing turn contexts")
    require(all(item.get("model") == row["model"] for item in turn_contexts), "effective model mismatch")
    require(all(item.get("effort") == row["reasoning_effort"] for item in turn_contexts), "effective effort mismatch")
    intervals = task_intervals(trace)

    user_messages: list[tuple[int, str, str | None]] = []
    final_messages: list[tuple[int, str, str | None]] = []
    for item in trace:
        if item.get("type") != "response_item":
            continue
        payload = item.get("payload", {})
        if payload.get("type") != "message":
            continue
        text = message_text(payload)
        if payload.get("role") == "user":
            user_messages.append((item["ordinal"], text, turn_id(payload)))
        if payload.get("role") == "assistant" and payload.get("phase") == "final_answer":
            final_messages.append((item["ordinal"], text, turn_id(payload)))

    external = [entry for entry in user_messages if not entry[1].startswith("<environment_context>") and not entry[1].startswith('<codex_internal_context source="goal">')]
    require(len(external) == 1 and external[0][1] == prompt, "exactly one external user prompt required")
    require_inside(intervals, external[0][2], external[0][0], "external user prompt")

    calls, outputs = tool_projection(trace)
    by_tool = {name: [call for call in calls if call["tool"] == name] for name in GOAL_TOOLS}
    require(len(by_tool["create_goal"]) == 1, "create_goal count")
    require(len(by_tool["update_goal"]) == 1, "update_goal count")
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

    require(len(final_messages) == 1, f"assistant final count: {len(final_messages)}")
    semantic_ordinal, semantic_text, semantic_turn = final_messages[0]
    try:
        result = json.loads(semantic_text, object_pairs_hook=contract._no_duplicates)
    except (json.JSONDecodeError, contract.ContractError) as exc:
        raise VerifyError(f"semantic final JSON: {exc}") from exc
    response_schema = contract.load_json(snapshot_owned(evidence, row["response_schema_path"]))
    jsonschema.Draft202012Validator(response_schema).validate(result)
    expected = oracle[capsule["unit_id"]]
    require(result == expected, "semantic result mismatch")
    require_inside(intervals, semantic_turn, semantic_ordinal, "semantic final")
    require(update["turn_id"] == semantic_turn, "terminal Goal call and semantic final must share a task turn")
    require(
        create["ordinal"] < create_output["ordinal"] < update["ordinal"] < update_output["ordinal"] < semantic_ordinal,
        "Goal activation/terminal/result causal order",
    )

    last_raw = (row_root / "last_message.txt").read_bytes()
    require(contract.sha256(last_raw) == capture["last_message"]["sha256"], "last message hash")
    require(json.loads(last_raw, object_pairs_hook=contract._no_duplicates) == result, "last message not semantic result")

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


def exclusive_json(path: Path, value: Any) -> None:
    raw = contract.canonical_bytes(value) + b"\n"
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), 0o644)
    try:
        os.write(descriptor, raw)
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--evidence-root", type=Path, required=True)
    parser.add_argument("--write-receipts", action="store_true")
    args = parser.parse_args(argv)
    try:
        evidence = args.evidence_root.resolve()
        require(ROOT.name == "frozen_snapshot", "verifier must execute from the captured frozen snapshot")
        require(evidence == ROOT.parent and (evidence / "frozen_snapshot").resolve() == ROOT, "snapshot/evidence execution join")
        r10_root = (Path(EXPECTED_RUNTIME["repository"]) / R10_REPO_RELATIVE).resolve()
        require(evidence == r10_root or r10_root in evidence.parents, "evidence outside exclusive R10 root")
        require(Path(contract.__file__).resolve().parent == ROOT, "contract module not loaded from frozen snapshot")
        manifest, _capture_summary, manifest_sha = load_snapshot_contract(evidence)
        frozen_by_path = {item["path"]: item for item in manifest["frozen_files"]}
        require(contract.sha256(Path(__file__).read_bytes()) == frozen_by_path["r10_verify.py"]["sha256"], "executing verifier identity drift")
        require(contract.sha256(Path(contract.__file__).read_bytes()) == frozen_by_path["r10_contract.py"]["sha256"], "executing contract identity drift")
        oracle = contract.load_json(snapshot_owned(evidence, manifest["oracle_path"]))
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
        passed = not failures and len(receipts) == EXPECTED_ACCEPTANCE["required_pass"] == len(manifest["rows"])
        status = "PASS_CANARY_ZERO_CREDIT" if passed else "FAIL_CONSUMED_ZERO_CREDIT_NO_RETRY"
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
