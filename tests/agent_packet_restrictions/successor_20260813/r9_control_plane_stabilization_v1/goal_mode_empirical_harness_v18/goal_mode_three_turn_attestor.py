#!/usr/bin/env python3
"""V18 attestor with exact ordered Goal batches and pure sealed reopen."""

from __future__ import annotations

import importlib.util
import json
import os
from pathlib import Path
import re
import sys
from typing import Any


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
V17_PATH = BASE / "goal_mode_empirical_harness_v17" / "goal_mode_three_turn_attestor.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_attestor_v17_for_v18", V17_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V17 attestor loader unavailable")
v17 = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v17
sys.path.insert(0, str(V17_PATH.parent))
SPEC.loader.exec_module(v17)
v15 = v17.v15
base = v17.base
prior = v17.prior
legacy = v15.legacy


ADAPTER = "CODEX_NATIVE_GOAL_SUBJECT_FREE_ACTIVATION_EXACT_DIRECT_OR_ORDERED_BATCH_THEN_SCORED_RESUME_THEN_TERMINAL_CLOSURE_PURE_SEALED_REOPEN_V4"
ROW_SCHEMA = "pw-r9-goal-mode-row-spec-v18"
BOOTSTRAP_LAUNCH_SCHEMA = "pw-r9-goal-mode-bootstrap-launch-receipt-v18"
BOOTSTRAP_PROCESS_SCHEMA = "pw-r9-goal-mode-bootstrap-process-receipt-v18"
BOOTSTRAP_ATTESTATION_SCHEMA = "pw-r9-goal-mode-bootstrap-attestation-v18"
SCORED_LAUNCH_SCHEMA = "pw-r9-goal-mode-three-turn-scored-launch-receipt-v18"
SCORED_PROCESS_SCHEMA = "pw-r9-goal-mode-three-turn-scored-process-receipt-v18"
RELEASE_SCHEMA = "pw-r9-goal-mode-three-turn-subject-release-gate-v18"
DELIVERY_SCHEMA = "pw-r9-goal-mode-three-turn-subject-delivery-v18"
SCORED_ATTESTATION_SCHEMA = "pw-r9-goal-mode-three-turn-scored-attestation-v18"
CLOSURE_LAUNCH_SCHEMA = "pw-r9-goal-mode-three-turn-closure-launch-receipt-v18"
CLOSURE_PROCESS_SCHEMA = "pw-r9-goal-mode-three-turn-closure-process-receipt-v18"
FINAL_ATTESTATION_SCHEMA = "pw-r9-goal-mode-three-turn-final-attestation-v18"
BOOTSTRAP_MARKER = "GOAL_ACTIVE_SUBJECT_NOT_SEEN_V18"
CLOSURE_MARKER = "GOAL_COMPLETE_SUBJECT_NOT_REPEATED_V18"
BOOTSTRAP_ATTESTATION_STATUS = "PASS_SUBJECT_FREE_FRESH_NATIVE_GOAL_ACTIVATION_EXACT_REPRESENTATION_PROJECTION_DB_CROSS_BOUND_ZERO_CREDIT"
SCORED_ATTESTATION_STATUS = "PASS_SAME_TASK_ACTIVE_GOAL_SCORED_SUBJECT_ZERO_CREDIT"
FINAL_ATTESTATION_STATUS = "PASS_THREE_TURN_SAME_TASK_NATIVE_GOAL_SUBJECT_GATED_TERMINAL_CLOSURE_ZERO_CREDIT"
CONTEXT_CONTRACT = v17.CONTEXT_CONTRACT
GOAL_PROJECTION_KEYS = v17.GOAL_PROJECTION_KEYS
DIRECT_NATIVE = legacy.DIRECT_NATIVE
NESTED_CODE = legacy.NESTED_CODE
NESTED_BATCH = "NESTED_CODE_EXACT_ORDERED_BATCH"
Invalid = v17.Invalid
require = v17.require
load_json = v17.load_json
canon = v17.canon
sha256 = v17.sha256
_read_regular = v17._read_regular
_exact_keys = v17._exact_keys


def batch_goal_code(methods: list[str], objective: str) -> str:
    require(methods in (["get_goal", "create_goal", "get_goal"], ["get_goal", "update_goal", "get_goal"]), "batch method sequence")
    middle = (
        f"const r2 = await tools.create_goal({{objective:{json.dumps(objective, ensure_ascii=False)}}});"
        if methods[1] == "create_goal"
        else 'const r2 = await tools.update_goal({status:"complete"});'
    )
    return (
        "const r1 = await tools.get_goal({});\n"
        "text(r1);\n"
        f"{middle}\n"
        "text(r2);\n"
        "const r3 = await tools.get_goal({});\n"
        "text(r3);"
    )


def _strict_object(raw: Any, label: str) -> dict[str, Any]:
    require(isinstance(raw, str), f"{label} JSON text")
    value = json.loads(raw, object_pairs_hook=base._pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    require(isinstance(value, dict), f"{label} object")
    return value


def _batch_outputs(raw: Any, count: int) -> list[dict[str, Any]]:
    require(isinstance(raw, list) and len(raw) == count + 1, "batch output cardinality")
    require(all(isinstance(item, dict) and set(item) == {"text", "type"} and item.get("type") == "input_text" and isinstance(item.get("text"), str) for item in raw), "batch output envelope")
    require(re.fullmatch(r"Script completed\nWall time [0-9]+(?:\.[0-9]+)? seconds\nOutput:\n", raw[0]["text"]) is not None, "batch output header")
    return [_strict_object(item["text"], f"batch projection:{index}") for index, item in enumerate(raw[1:])]


def _native_goal_calls(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    outputs: dict[tuple[str, str], tuple[int, Any]] = {}
    for entry in records:
        payload = base._payload(entry)
        kind = payload.get("type")
        call_id = payload.get("call_id")
        if kind in {"custom_tool_call_output", "function_call_output"} and isinstance(call_id, str):
            key = (kind, call_id)
            require(key not in outputs, "duplicate Goal output call id")
            outputs[key] = (entry["line"], payload.get("output"))
    result: list[dict[str, Any]] = []
    for entry in records:
        payload = base._payload(entry)
        kind = payload.get("type")
        call_id = payload.get("call_id")
        if kind == "custom_tool_call":
            code = payload.get("input")
            require(isinstance(code, str), "nested Goal call code")
            methods = base.TOOL_RE.findall(code)
            goal_methods = [method for method in methods if method in {"get_goal", "create_goal", "update_goal"}]
            if not goal_methods:
                continue
            require(payload.get("name") == "exec" and isinstance(call_id, str) and call_id and len(methods) == len(goal_methods), "nested Goal call envelope")
            key = ("custom_tool_call_output", call_id)
            require(key in outputs, "nested Goal output missing")
            output_line, output = outputs[key]
            require(output_line > entry["line"], "nested Goal output precedes call")
            if len(goal_methods) == 1:
                result.append(
                    {
                        "arguments": None,
                        "batch": False,
                        "call_id": call_id,
                        "call_line": entry["line"],
                        "code": code,
                        "method": goal_methods[0],
                        "output": base._tool_result_json(output),
                        "output_line": output_line,
                        "representation": NESTED_CODE,
                    }
                )
            else:
                require(goal_methods in (["get_goal", "create_goal", "get_goal"], ["get_goal", "update_goal", "get_goal"]), "nested Goal batch sequence")
                projections = _batch_outputs(output, len(goal_methods))
                for batch_index, (method, projection) in enumerate(zip(goal_methods, projections)):
                    result.append(
                        {
                            "arguments": None,
                            "batch": True,
                            "batch_index": batch_index,
                            "call_id": call_id,
                            "call_line": entry["line"],
                            "code": code,
                            "method": method,
                            "output": projection,
                            "output_line": output_line,
                            "representation": NESTED_BATCH,
                        }
                    )
        elif kind == "function_call" and payload.get("name") in {"get_goal", "create_goal", "update_goal"}:
            require(isinstance(call_id, str) and call_id, "direct Goal call id")
            arguments = payload.get("arguments")
            _strict_object(arguments, "direct Goal arguments")
            key = ("function_call_output", call_id)
            require(key in outputs, "direct Goal output missing")
            output_line, output = outputs[key]
            require(output_line > entry["line"], "direct Goal output precedes call")
            result.append(
                {
                    "arguments": arguments,
                    "batch": False,
                    "call_id": call_id,
                    "call_line": entry["line"],
                    "code": None,
                    "method": payload["name"],
                    "output": _strict_object(output, "direct Goal output"),
                    "output_line": output_line,
                    "representation": DIRECT_NATIVE,
                }
            )
    return result


def _outer_action_lines(calls: list[dict[str, Any]]) -> list[int]:
    return list(dict.fromkeys(call["call_line"] for call in calls))


def _goal_calls(records: list[dict[str, Any]], prompt_line: int, methods: list[str], objective: str) -> tuple[list[dict[str, Any]], str]:
    calls = [call for call in _native_goal_calls(records) if call["call_line"] > prompt_line]
    require(len(calls) >= len(methods) and [call["method"] for call in calls[: len(methods)]] == methods, "Goal action sequence")
    calls = calls[: len(methods)]
    if all(call.get("batch") is True for call in calls):
        require(
            len({call["call_id"] for call in calls}) == 1
            and [call["batch_index"] for call in calls] == list(range(len(methods)))
            and all(call["code"] == batch_goal_code(methods, objective) for call in calls),
            "exact Goal batch invocation",
        )
    else:
        require(not any(call.get("batch") for call in calls), "mixed Goal representation")
        require(len({call["representation"] for call in calls}) == 1 and all(legacy._exact_goal_invocation(call, objective) for call in calls), "Goal invocation")
    turns = base._line_turns(records)
    turn_id = turns.get(prompt_line)
    require(isinstance(turn_id, str) and all(turns.get(call["call_line"]) == turn_id and turns.get(call["output_line"]) == turn_id for call in calls), "Goal turn")
    actions = base._action_calls(records, prompt_line, calls[-1]["output_line"])
    action_lines = _outer_action_lines(calls)
    require(len(actions) == len(action_lines) and [action["line"] for action in actions] == action_lines, "non-Goal action in Goal sequence")
    return calls, turn_id


def _bootstrap_common(
    row: dict[str, Any],
    capture: Path,
    codex_home: Path,
    require_active: bool,
    historical_rollout: dict[str, Any] | None = None,
) -> dict[str, Any]:
    v15._capture_modes(capture)
    launch = v15._launch(row, capture, "bootstrap", BOOTSTRAP_LAUNCH_SCHEMA)
    process = v15._process(capture, "bootstrap", BOOTSTRAP_PROCESS_SCHEMA, launch)
    snapshot = v15._snapshot(capture)
    prompt = _read_regular(capture / "bootstrap_prompt.txt", 4_000_000).decode("utf-8")
    lifecycle = base._stdout_lifecycle(_read_regular(capture / "bootstrap_stdout.jsonl", 64_000_000), "bootstrap", complete=True)
    require(lifecycle["messages"] == [BOOTSTRAP_MARKER], "bootstrap stdout marker")
    thread_id = lifecycle["thread_id"]
    require(thread_id not in snapshot["thread_ids"], "bootstrap thread reused")
    goal, records, rollout, logical = v15._thread_goal(row, codex_home, thread_id)
    require(goal["goal_id"] not in snapshot["goal_ids"] and goal["thread_id"] == thread_id, "bootstrap Goal freshness/DB binding")
    prompt_lines = base._message_lines(records, "user", prompt)
    require(len(prompt_lines) == 1, "bootstrap prompt cardinality")
    calls, turn_id = _goal_calls(records, prompt_lines[0], ["get_goal", "create_goal", "get_goal"], row["objective"])
    require(base._goal_projection(calls[0]["output"]) is None, "initial Goal non-null")
    created = base._goal_projection(calls[1]["output"])
    reopened = base._goal_projection(calls[2]["output"])
    require(isinstance(created, dict) and isinstance(reopened, dict), "bootstrap Goal projections")
    v17._assert_native_goal_projection(created, thread_id, row["objective"], "active", "created Goal projection")
    v17._assert_native_goal_projection(reopened, thread_id, row["objective"], "active", "reopened Goal projection")
    require(created["threadId"] == reopened["threadId"] == goal["thread_id"] == thread_id, "bootstrap projection/DB thread identity")
    require(created["createdAt"] == reopened["createdAt"] == goal["created_at_ms"] // 1000, "bootstrap projection/DB creation time")
    current_status = "active" if require_active else "complete"
    require(goal["objective"] == row["objective"] and goal["status"] == current_status, "bootstrap Goal DB objective/status")
    turns = base._line_turns(records)
    actions = [item for item in base._action_calls(records, prompt_lines[0], len(records) + 1) if turns.get(item["line"]) == turn_id]
    action_lines = _outer_action_lines(calls)
    require(len(actions) == len(action_lines) and [item["line"] for item in actions] == action_lines, "bootstrap action closure")
    marker_lines = [line for line in base._message_lines(records, "assistant", BOOTSTRAP_MARKER) if turns.get(line) == turn_id]
    require(len(marker_lines) == 1 and marker_lines[0] > calls[-1]["output_line"], "bootstrap rollout marker")
    if require_active:
        require(goal.get("status") == "active", "Goal not active after bootstrap")
    require(_read_regular(capture / "bootstrap_output_last_message.txt", 1_000_000) == BOOTSTRAP_MARKER.encode(), "bootstrap marker")
    v17._validate_subject_temporal_state(row, capture, process, thread_id, goal["goal_id"], historical_rollout is not None)
    rollout_identity = {"bytes": len(rollout), "logical_path": logical, "sha256": sha256(rollout)}
    if historical_rollout is not None:
        _exact_keys(historical_rollout, {"bytes", "logical_path", "sha256"}, "historical bootstrap rollout")
        prefix_bytes = base._assert_rollout_prefix(codex_home, historical_rollout, "historical bootstrap")
        require(historical_rollout["logical_path"] == logical and prefix_bytes < len(rollout), "bootstrap rollout strict prefix")
        rollout_identity = historical_rollout
    return {
        "authority": {"qualification_credit": 0, "subject_release": False},
        "goal": {
            "goal_action_transport": calls[0]["representation"],
            "goal_id": goal["goal_id"],
            "goal_id_source": "READ_ONLY_CODEX_GOALS_DATABASE_THREAD_GOALS.GOAL_ID",
            "native_projection_identity_field": "threadId",
            "status": "active",
            "thread_id": thread_id,
            "turn_id": turn_id,
        },
        "process": {"ended_at_ms": process["ended_at_ms"], "pid": process["pid"], "started_at_ms": launch["started_at_ms"]},
        "rollout": rollout_identity,
        "schema_id": BOOTSTRAP_ATTESTATION_SCHEMA,
        "status": BOOTSTRAP_ATTESTATION_STATUS,
    }


def _attest_final_core(row_path: Path, capture: Path, codex_home: Path, sealed: bool) -> dict[str, Any]:
    row = load_row(row_path)
    v15._capture_modes(capture)
    expected = set(v15.EXPECTED_PRE_FINAL_FILES)
    if sealed:
        expected |= {"goal_mode_attestation.json", "stderr_classification.json"}
    require({path.name for path in capture.iterdir()} == expected, "sealed final capture inventory" if sealed else "pre-final capture inventory")
    stored_bootstrap = load_json(capture / "bootstrap_attestation.json", 8_000_000)
    bootstrap = _bootstrap_common(row, capture, codex_home, False, stored_bootstrap.get("rollout"))
    require(stored_bootstrap == bootstrap, "final bootstrap reopen")
    scored = load_json(capture / "scored_phase_attestation.json", 8_000_000)
    rederived_scored, _, _ = v17._scored_common(row, capture, codex_home, True, False)
    historical_scored = scored.get("rollout")
    require(isinstance(historical_scored, dict), "historical scored rollout")
    prefix_bytes = base._assert_rollout_prefix(codex_home, historical_scored, "historical scored")
    require(historical_scored.get("logical_path") == rederived_scored["rollout"]["logical_path"] and prefix_bytes < rederived_scored["rollout"]["bytes"], "scored rollout strict prefix")
    rederived_scored["rollout"] = historical_scored
    expected_answer = row["criteria"]["expected_exact_utf8"].encode()
    rederived_scored.update(
        {
            "answer": {"bytes": len(expected_answer), "sha256": sha256(expected_answer)},
            "reader_output_line": scored.get("reader_output_line"),
            "schema_id": SCORED_ATTESTATION_SCHEMA,
            "status": SCORED_ATTESTATION_STATUS,
        }
    )
    require(scored == rederived_scored and _read_regular(capture / "scored_output_last_message.txt", 8_000_000) == expected_answer, "final scored reopen")
    launch = v15._launch(row, capture, "closure", CLOSURE_LAUNCH_SCHEMA, bootstrap["goal"]["thread_id"])
    process = v15._process(capture, "closure", CLOSURE_PROCESS_SCHEMA, launch)
    prompt = _read_regular(capture / "closure_prompt.txt", 4_000_000).decode()
    lifecycle = base._stdout_lifecycle(_read_regular(capture / "closure_stdout.jsonl", 64_000_000), "closure", complete=True)
    require(lifecycle["messages"] == [CLOSURE_MARKER], "closure stdout marker")
    thread_id = lifecycle["thread_id"]
    require(thread_id == bootstrap["goal"]["thread_id"] == scored["goal"]["thread_id"], "closure task changed")
    goal, records, rollout, logical = v15._thread_goal(row, codex_home, thread_id)
    require(goal.get("status") == "complete", "Goal not complete")
    prompt_lines = base._message_lines(records, "user", prompt)
    require(len(prompt_lines) == 1, "closure prompt cardinality")
    calls, turn_id = _goal_calls(records, prompt_lines[0], ["get_goal", "update_goal", "get_goal"], row["objective"])
    require(turn_id not in {bootstrap["goal"]["turn_id"], scored["goal"]["turn_id"]}, "closure turn identity")
    first = base._goal_projection(calls[0]["output"])
    updated = base._goal_projection(calls[1]["output"])
    reopened = base._goal_projection(calls[2]["output"])
    require(isinstance(first, dict) and isinstance(updated, dict) and isinstance(reopened, dict), "closure Goal projections")
    v17._assert_native_goal_projection(first, thread_id, row["objective"], "active", "closure initial projection")
    v17._assert_native_goal_projection(updated, thread_id, row["objective"], "complete", "closure updated projection")
    v17._assert_native_goal_projection(reopened, thread_id, row["objective"], "complete", "closure reopened projection")
    context = prior._native_goal_context(records, prompt_lines[0], turn_id, row["objective"])
    turns = base._line_turns(records)
    actions = [item for item in base._action_calls(records, prompt_lines[0], len(records) + 1) if turns.get(item["line"]) == turn_id]
    action_lines = _outer_action_lines(calls)
    require(len(actions) == len(action_lines) and [item["line"] for item in actions] == action_lines, "closure action closure")
    marker_lines = [line for line in base._message_lines(records, "assistant", CLOSURE_MARKER) if turns.get(line) == turn_id]
    require(len(marker_lines) == 1 and marker_lines[0] > calls[-1]["output_line"], "closure rollout marker")
    require(_read_regular(capture / "closure_output_last_message.txt", 1_000_000) == CLOSURE_MARKER.encode(), "closure marker")
    result = {
        "authority": {"external_matrix_qualification_required": True, "qualification_credit": 0},
        "bootstrap": bootstrap,
        "closure": {
            "goal_actions": calls[0]["representation"],
            "native_goal_context": context,
            "process": {"ended_at_ms": process["ended_at_ms"], "pid": process["pid"], "started_at_ms": launch["started_at_ms"]},
            "turn_id": turn_id,
        },
        "goal": {
            "goal_id": goal["goal_id"],
            "status": "complete",
            "thread_id": thread_id,
            "turn_ids": [bootstrap["goal"]["turn_id"], scored["goal"]["turn_id"], turn_id],
        },
        "historical_scored_rollout": {"bytes": historical_scored["bytes"], "final_bytes": len(rollout), "logical_path": logical, "sha256": historical_scored["sha256"], "strict_prefix": True},
        "process_accounting": {"fresh_tasks": 1, "processes": 3, "resume_operations": 2, "retries": 0, "subject_deliveries": 1},
        "rollout": {"bytes": len(rollout), "logical_path": logical, "sha256": sha256(rollout)},
        "schema_id": FINAL_ATTESTATION_SCHEMA,
        "scored": scored,
        "status": FINAL_ATTESTATION_STATUS,
    }
    if sealed:
        require(load_json(capture / "goal_mode_attestation.json", 32_000_000) == result, "sealed final attestation")
        classification = load_json(capture / "stderr_classification.json", 8_000_000)
        require(
            classification.get("status") == "PASS_EXACT_THREE_PHASE_STDERR_CLASSIFICATIONS_AFTER_FULL_ATTESTATION"
            and all(classification.get(phase, {}).get("accepted") is True for phase in ("bootstrap", "scored", "closure")),
            "sealed stderr classification",
        )
    return result


def attest_final(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    return _attest_final_core(row_path, capture, codex_home, False)


def reopen_final(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    return _attest_final_core(row_path, capture, codex_home, True)


for _name, _value in {
    "ADAPTER": ADAPTER,
    "ROW_SCHEMA": ROW_SCHEMA,
    "BOOTSTRAP_LAUNCH_SCHEMA": BOOTSTRAP_LAUNCH_SCHEMA,
    "BOOTSTRAP_PROCESS_SCHEMA": BOOTSTRAP_PROCESS_SCHEMA,
    "BOOTSTRAP_ATTESTATION_SCHEMA": BOOTSTRAP_ATTESTATION_SCHEMA,
    "SCORED_LAUNCH_SCHEMA": SCORED_LAUNCH_SCHEMA,
    "SCORED_PROCESS_SCHEMA": SCORED_PROCESS_SCHEMA,
    "RELEASE_SCHEMA": RELEASE_SCHEMA,
    "DELIVERY_SCHEMA": DELIVERY_SCHEMA,
    "SCORED_ATTESTATION_SCHEMA": SCORED_ATTESTATION_SCHEMA,
    "CLOSURE_LAUNCH_SCHEMA": CLOSURE_LAUNCH_SCHEMA,
    "CLOSURE_PROCESS_SCHEMA": CLOSURE_PROCESS_SCHEMA,
    "FINAL_ATTESTATION_SCHEMA": FINAL_ATTESTATION_SCHEMA,
    "BOOTSTRAP_MARKER": BOOTSTRAP_MARKER,
    "CLOSURE_MARKER": CLOSURE_MARKER,
}.items():
    setattr(v15, _name, _value)
    setattr(v17, _name, _value)
v15._goal_calls = _goal_calls
v15._bootstrap_common = _bootstrap_common
v17._bootstrap_common = _bootstrap_common
v15._scored_common = v17._scored_common


load_row = v15.load_row
attest_bootstrap = v15.attest_bootstrap
attest_release = v17.attest_release
attest_scored = v17.attest_scored
_assert_native_goal_projection = v17._assert_native_goal_projection


__all__ = (
    "ADAPTER",
    "BOOTSTRAP_ATTESTATION_SCHEMA",
    "BOOTSTRAP_LAUNCH_SCHEMA",
    "BOOTSTRAP_MARKER",
    "BOOTSTRAP_PROCESS_SCHEMA",
    "CLOSURE_LAUNCH_SCHEMA",
    "CLOSURE_MARKER",
    "CLOSURE_PROCESS_SCHEMA",
    "CONTEXT_CONTRACT",
    "DELIVERY_SCHEMA",
    "FINAL_ATTESTATION_SCHEMA",
    "GOAL_PROJECTION_KEYS",
    "Invalid",
    "RELEASE_SCHEMA",
    "ROW_SCHEMA",
    "SCORED_ATTESTATION_SCHEMA",
    "SCORED_LAUNCH_SCHEMA",
    "SCORED_PROCESS_SCHEMA",
    "attest_bootstrap",
    "attest_final",
    "attest_release",
    "attest_scored",
    "batch_goal_code",
    "canon",
    "load_json",
    "load_row",
    "reopen_final",
    "require",
    "sha256",
)
