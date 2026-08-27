#!/usr/bin/env python3
"""V20 phase-owned native Goal attestor with bounded activation-control discovery."""

from __future__ import annotations

import importlib.util
from pathlib import Path
import sys
from typing import Any


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
V19_PATH = BASE / "goal_mode_empirical_harness_v19" / "goal_mode_three_turn_attestor.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_attestor_v19_for_v20", V19_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V19 attestor loader unavailable")
v19 = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v19
sys.path.insert(0, str(V19_PATH.parent))
SPEC.loader.exec_module(v19)

v17 = v19.v17
v15 = v19.v15
base = v19.base
prior = v19.prior
legacy = v19.legacy


ADAPTER = "CODEX_NATIVE_GOAL_BITE_SIZE_SUBJECT_WITHHELD_ACTIVATION_CONTROL_ZERO_OR_ONE_EXACT_GOAL_TOOL_SEARCH_THEN_EXACT_DIRECT_GOAL_CALLS_THEN_ONE_ATOMIC_SCORED_SUBJECT_THEN_DIRECT_TERMINAL_CLOSURE_PURE_SEALED_REOPEN_V7"
ROW_SCHEMA = "pw-r9-goal-mode-row-spec-v20"
SNAPSHOT_SCHEMA = "pw-r9-goal-mode-three-turn-prelaunch-snapshot-v20"
BOOTSTRAP_LAUNCH_SCHEMA = "pw-r9-goal-mode-bootstrap-launch-receipt-v20"
BOOTSTRAP_PROCESS_SCHEMA = "pw-r9-goal-mode-bootstrap-process-receipt-v20"
BOOTSTRAP_ATTESTATION_SCHEMA = "pw-r9-goal-mode-bootstrap-attestation-v20"
SCORED_LAUNCH_SCHEMA = "pw-r9-goal-mode-three-turn-scored-launch-receipt-v20"
SCORED_PROCESS_SCHEMA = "pw-r9-goal-mode-three-turn-scored-process-receipt-v20"
RELEASE_SCHEMA = "pw-r9-goal-mode-three-turn-subject-release-gate-v20"
DELIVERY_SCHEMA = "pw-r9-goal-mode-three-turn-subject-delivery-v20"
SCORED_ATTESTATION_SCHEMA = "pw-r9-goal-mode-three-turn-scored-attestation-v20"
CLOSURE_LAUNCH_SCHEMA = "pw-r9-goal-mode-three-turn-closure-launch-receipt-v20"
CLOSURE_PROCESS_SCHEMA = "pw-r9-goal-mode-three-turn-closure-process-receipt-v20"
FINAL_ATTESTATION_SCHEMA = "pw-r9-goal-mode-three-turn-final-attestation-v20"
BOOTSTRAP_MARKER = "GOAL_ACTIVE_SUBJECT_NOT_SEEN_V20"
CLOSURE_MARKER = "GOAL_COMPLETE_SUBJECT_NOT_REPEATED_V20"
BOOTSTRAP_ATTESTATION_STATUS = "PASS_SUBJECT_WITHHELD_FRESH_NATIVE_GOAL_ACTIVATION_BOUNDED_CONTROL_PRELUDE_EXACT_REPRESENTATION_PROJECTION_DB_CROSS_BOUND_ZERO_CREDIT"
SCORED_ATTESTATION_STATUS = "PASS_SAME_TASK_ACTIVE_GOAL_SCORED_SUBJECT_ZERO_CREDIT_V20"
FINAL_ATTESTATION_STATUS = "PASS_THREE_TURN_SAME_TASK_NATIVE_GOAL_SUBJECT_GATED_TERMINAL_CLOSURE_ZERO_CREDIT_V20"
GOAL_SEARCH_QUERY = "goal tools direct exposed get_goal create_goal update_goal"
GOAL_SEARCH_LIMIT = 5
GOAL_SEARCH_PREFIX = "SUBJECT_WITHHELD_GOAL_TOOL_DEFINITION_SEARCH_THEN_"
CONTEXT_CONTRACT = v19.CONTEXT_CONTRACT
GOAL_PROJECTION_KEYS = v19.GOAL_PROJECTION_KEYS
DIRECT_NATIVE = v19.DIRECT_NATIVE
NESTED_CODE = v19.NESTED_CODE
NESTED_BATCH = v19.NESTED_BATCH
Invalid = v19.Invalid
require = v19.require
load_json = v19.load_json
canon = v19.canon
sha256 = v19.sha256
_read_regular = v19._read_regular
_exact_keys = v19._exact_keys


def _activation_control_search(records: list[dict[str, Any]], prompt_line: int, first_goal_line: int, turn_id: str) -> list[int]:
    actions = base._action_calls(records, prompt_line, first_goal_line - 1)
    if not actions:
        return []
    require(len(actions) == 1, "activation-control action cardinality")
    action = actions[0]
    payload = action["payload"]
    require(payload.get("type") == "tool_search_call", "activation-control action kind")
    require(payload.get("arguments") == {"limit": GOAL_SEARCH_LIMIT, "query": GOAL_SEARCH_QUERY}, "exact Goal tool search arguments")
    require(payload.get("execution") == "client" and payload.get("status") == "completed", "Goal tool search call terminal")
    call_id = payload.get("call_id")
    require(isinstance(call_id, str) and call_id, "Goal tool search call id")
    outputs: list[tuple[int, dict[str, Any]]] = []
    for entry in records:
        candidate = base._payload(entry)
        if candidate.get("type") == "tool_search_output" and candidate.get("call_id") == call_id:
            outputs.append((entry["line"], candidate))
    require(len(outputs) == 1, "Goal tool search output cardinality")
    output_line, output = outputs[0]
    require(action["line"] < output_line < first_goal_line, "Goal tool search output order")
    require(base._line_turns(records).get(action["line"]) == base._line_turns(records).get(output_line) == turn_id, "Goal tool search turn")
    require(output.get("execution") == "client" and output.get("status") == "completed", "Goal tool search output terminal")
    tools = output.get("tools")
    require(isinstance(tools, list) and len(tools) <= GOAL_SEARCH_LIMIT, "Goal tool search result list")
    names: list[str] = []
    for tool in tools:
        require(isinstance(tool, dict), "Goal tool search result object")
        name = tool.get("name")
        require(isinstance(name, str) and name and tool.get("type") in {"function", "namespace"}, "Goal tool search result identity")
        names.append(name)
    require(len(names) == len(set(names)), "Goal tool search result uniqueness")
    return [action["line"]]


def _outer_action_lines(calls: list[dict[str, Any]]) -> list[int]:
    prelude = calls[0].get("activation_control_action_lines", []) if calls else []
    require(isinstance(prelude, list) and all(isinstance(item, int) for item in prelude), "activation-control line projection")
    return prelude + list(dict.fromkeys(call["call_line"] for call in calls))


def _goal_calls(records: list[dict[str, Any]], prompt_line: int, methods: list[str], objective: str) -> tuple[list[dict[str, Any]], str]:
    calls = [call for call in v19._native_goal_calls(records) if call["call_line"] > prompt_line]
    require(len(calls) >= len(methods) and [call["method"] for call in calls[: len(methods)]] == methods, "Goal action sequence")
    calls = calls[: len(methods)]
    require(not any(call.get("batch") for call in calls), "nested Goal batch prohibited")
    require(
        len({call["representation"] for call in calls}) == 1
        and all(legacy._exact_goal_invocation(call, objective) for call in calls),
        "exact separate native Goal calls",
    )
    turns = base._line_turns(records)
    turn_id = turns.get(prompt_line)
    require(isinstance(turn_id, str) and all(turns.get(call["call_line"]) == turn_id and turns.get(call["output_line"]) == turn_id for call in calls), "Goal turn")
    prelude = _activation_control_search(records, prompt_line, calls[0]["call_line"], turn_id) if methods[1] == "create_goal" else []
    calls[0]["activation_control_action_lines"] = prelude
    actions = base._action_calls(records, prompt_line, calls[-1]["output_line"])
    expected_lines = _outer_action_lines(calls)
    require(len(actions) == len(expected_lines) and [action["line"] for action in actions] == expected_lines, "activation-control plus Goal action sequence")
    if prelude:
        representation = GOAL_SEARCH_PREFIX + calls[0]["representation"]
        for call in calls:
            call["representation"] = representation
    return calls, turn_id


for _name, _value in {
    "ADAPTER": ADAPTER,
    "ROW_SCHEMA": ROW_SCHEMA,
    "SNAPSHOT_SCHEMA": SNAPSHOT_SCHEMA,
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
    "BOOTSTRAP_ATTESTATION_STATUS": BOOTSTRAP_ATTESTATION_STATUS,
    "SCORED_ATTESTATION_STATUS": SCORED_ATTESTATION_STATUS,
    "FINAL_ATTESTATION_STATUS": FINAL_ATTESTATION_STATUS,
}.items():
    setattr(v19, _name, _value)
    setattr(v15, _name, _value)
    setattr(v17, _name, _value)
v19._goal_calls = _goal_calls
v19._outer_action_lines = _outer_action_lines
v15._goal_calls = _goal_calls


def _expected_objective(row: dict[str, Any]) -> str:
    criteria_hash = sha256(canon(row["criteria"], newline=False))
    control_hash = sha256(canon(row["control_envelope"], newline=False))
    return (
        f"R9V20 atomic Goal;run={row['run_id']};row={row['row_id']};attempt=0;"
        f"subject={row['subject_utf8_sha256']};criteria={criteria_hash};control={control_hash};"
        "one subject only;keep active through answer capture;then complete in closure."
    )


v19._expected_objective = _expected_objective
v15.prior._expected_objective = _expected_objective
create_goal_code = v19.create_goal_code
get_goal_code = v19.get_goal_code
reader_code = v19.reader_code
update_goal_code = v19.update_goal_code
batch_goal_code = v19.batch_goal_code
load_row = v19.load_row
attest_bootstrap = v19.attest_bootstrap
attest_release = v19.attest_release
attest_scored = v19.attest_scored
attest_final = v19.attest_final
reopen_final = v19.reopen_final
_assert_native_goal_projection = v19._assert_native_goal_projection

RUNTIME_API_CONTRACT = v19.RUNTIME_API_CONTRACT


def runtime_api_contract() -> dict[str, Any]:
    missing = [name for name in RUNTIME_API_CONTRACT if name not in globals()]
    return {"attributes": list(RUNTIME_API_CONTRACT), "missing": missing, "status": "PASS" if not missing else "FAIL"}


require(runtime_api_contract()["missing"] == [], "closed inherited runtime API")


__all__ = tuple(sorted(set(v19.__all__) | {"GOAL_SEARCH_LIMIT", "GOAL_SEARCH_PREFIX", "GOAL_SEARCH_QUERY", "RUNTIME_API_CONTRACT", "runtime_api_contract"}))
