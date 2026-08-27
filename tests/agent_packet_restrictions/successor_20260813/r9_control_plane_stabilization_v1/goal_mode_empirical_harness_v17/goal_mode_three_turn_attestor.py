#!/usr/bin/env python3
"""V17 attestor: phase-aware historical bootstrap revalidation."""

from __future__ import annotations

import importlib.util
from pathlib import Path
import sys
from typing import Any


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
V15_PATH = BASE / "goal_mode_empirical_harness_v15" / "goal_mode_three_turn_attestor.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_v15_attestor_for_v17", V15_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V15 attestor loader unavailable")
v15 = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v15
sys.path.insert(0, str(V15_PATH.parent))
SPEC.loader.exec_module(v15)


ADAPTER = "CODEX_NATIVE_GOAL_SUBJECT_FREE_ACTIVATION_THEN_SCORED_RESUME_THEN_TERMINAL_CLOSURE_DB_IDENTITY_PHASE_AWARE_V3"
ROW_SCHEMA = "pw-r9-goal-mode-row-spec-v17"
SNAPSHOT_SCHEMA = "pw-r9-goal-mode-three-turn-prelaunch-snapshot-v17"
BOOTSTRAP_LAUNCH_SCHEMA = "pw-r9-goal-mode-bootstrap-launch-receipt-v17"
BOOTSTRAP_PROCESS_SCHEMA = "pw-r9-goal-mode-bootstrap-process-receipt-v17"
BOOTSTRAP_ATTESTATION_SCHEMA = "pw-r9-goal-mode-bootstrap-attestation-v17"
SCORED_LAUNCH_SCHEMA = "pw-r9-goal-mode-three-turn-scored-launch-receipt-v17"
SCORED_PROCESS_SCHEMA = "pw-r9-goal-mode-three-turn-scored-process-receipt-v17"
RELEASE_SCHEMA = "pw-r9-goal-mode-three-turn-subject-release-gate-v17"
DELIVERY_SCHEMA = "pw-r9-goal-mode-three-turn-subject-delivery-v17"
SCORED_ATTESTATION_SCHEMA = "pw-r9-goal-mode-three-turn-scored-attestation-v17"
CLOSURE_LAUNCH_SCHEMA = "pw-r9-goal-mode-three-turn-closure-launch-receipt-v17"
CLOSURE_PROCESS_SCHEMA = "pw-r9-goal-mode-three-turn-closure-process-receipt-v17"
FINAL_ATTESTATION_SCHEMA = "pw-r9-goal-mode-three-turn-final-attestation-v17"
BOOTSTRAP_MARKER = "GOAL_ACTIVE_SUBJECT_NOT_SEEN_V17"
CLOSURE_MARKER = v15.CLOSURE_MARKER
CONTEXT_CONTRACT = v15.CONTEXT_CONTRACT

for _name in (
    "ADAPTER",
    "ROW_SCHEMA",
    "SNAPSHOT_SCHEMA",
    "BOOTSTRAP_LAUNCH_SCHEMA",
    "BOOTSTRAP_PROCESS_SCHEMA",
    "BOOTSTRAP_ATTESTATION_SCHEMA",
    "SCORED_LAUNCH_SCHEMA",
    "SCORED_PROCESS_SCHEMA",
    "RELEASE_SCHEMA",
    "DELIVERY_SCHEMA",
    "SCORED_ATTESTATION_SCHEMA",
    "CLOSURE_LAUNCH_SCHEMA",
    "CLOSURE_PROCESS_SCHEMA",
    "FINAL_ATTESTATION_SCHEMA",
    "BOOTSTRAP_MARKER",
):
    setattr(v15, _name, globals()[_name])


Invalid = v15.Invalid
require = v15.require
canon = v15.canon
sha256 = v15.sha256
load_json = v15.load_json
base = v15.base
prior = v15.prior
_exact_keys = v15._exact_keys
_read_regular = v15._read_regular

GOAL_PROJECTION_KEYS = {
    "createdAt",
    "objective",
    "status",
    "threadId",
    "timeUsedSeconds",
    "tokensUsed",
    "updatedAt",
}


def _assert_native_goal_projection(
    value: dict[str, Any],
    thread_id: str,
    objective: str,
    status: str,
    label: str,
) -> None:
    _exact_keys(value, GOAL_PROJECTION_KEYS, label)
    require(value["threadId"] == thread_id, f"{label} threadId")
    require(value["objective"] == objective and value["status"] == status, f"{label} objective/status")
    for field in ("createdAt", "updatedAt", "tokensUsed", "timeUsedSeconds"):
        require(isinstance(value[field], int) and not isinstance(value[field], bool) and value[field] >= 0, f"{label} {field}")
    require(value["updatedAt"] >= value["createdAt"], f"{label} timestamp order")


def _strict_base_assert_goal(value: dict[str, Any], thread_id: str, objective: str, status: str) -> None:
    _assert_native_goal_projection(value, thread_id, objective, status, "native Goal projection")


def _validate_subject_temporal_state(
    row: dict[str, Any],
    capture: Path,
    bootstrap_process: dict[str, Any],
    thread_id: str,
    goal_id: str,
    historical_reopen: bool,
) -> None:
    subject_path = capture / "subject_input.txt"
    delivery_path = capture / "subject_delivery.json"
    subject_present = subject_path.exists()
    delivery_present = delivery_path.exists()
    require(subject_present == delivery_present, "partial subject delivery state")
    if not subject_present:
        return
    require(historical_reopen, "subject existed during initial bootstrap")
    subject = _read_regular(subject_path, 8_000_000)
    require(
        len(subject) == row["subject_utf8_bytes"] and sha256(subject) == row["subject_utf8_sha256"],
        "historical subject identity",
    )
    delivery = load_json(delivery_path, 4_000_000)
    _exact_keys(delivery, {"bytes", "closed_at_ms", "schema_id", "sha256", "status"}, "historical subject delivery")
    require(
        delivery
        == {
            "bytes": len(subject),
            "closed_at_ms": delivery.get("closed_at_ms"),
            "schema_id": DELIVERY_SCHEMA,
            "sha256": sha256(subject),
            "status": "DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE",
        }
        and isinstance(delivery["closed_at_ms"], int),
        "historical subject delivery identity",
    )
    scored_launch = v15._launch(row, capture, "scored", SCORED_LAUNCH_SCHEMA, thread_id)
    scored_process = v15._process(capture, "scored", SCORED_PROCESS_SCHEMA, scored_launch)
    require(
        scored_process.get("goal_release_error") is None
        and scored_process.get("subject_delivery") == delivery
        and scored_process.get("subject_fifo_removed") is True
        and scored_process.get("subject_release") == "AFTER_COMPLETED_SUBJECT_FREE_GOAL_ACTIVATION"
        and scored_process.get("reader_quiescence")
        == {"detected_pids": [], "kill_sent": 0, "remaining_pids": [], "term_sent": 0},
        "historical scored process release",
    )
    gate = load_json(capture / "goal_active_subject_release_gate.json", 8_000_000)
    require(
        gate.get("schema_id") == RELEASE_SCHEMA
        and gate.get("status") == "PASS_SAME_TASK_ACTIVE_GOAL_SCORED_SUBJECT_RELEASE_AUTHORIZED"
        and gate.get("authority") == {"qualification_credit": 0, "subject_release": True}
        and gate.get("goal", {}).get("goal_id") == goal_id
        and gate.get("goal", {}).get("thread_id") == thread_id
        and gate.get("goal", {}).get("status") == "active",
        "historical active Goal release gate",
    )
    require(
        bootstrap_process["ended_at_ms"]
        <= scored_launch["started_at_ms"]
        <= delivery["closed_at_ms"]
        <= scored_process["ended_at_ms"],
        "historical bootstrap/release/delivery temporal order",
    )


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
    require(goal["goal_id"] not in snapshot["goal_ids"], "bootstrap Goal reused")
    require(goal["thread_id"] == thread_id, "Goal DB thread binding")
    prompt_lines = base._message_lines(records, "user", prompt)
    require(len(prompt_lines) == 1, "bootstrap prompt cardinality")
    calls, turn_id = v15._goal_calls(records, prompt_lines[0], ["get_goal", "create_goal", "get_goal"], row["objective"])
    require(base._goal_projection(calls[0]["output"]) is None, "initial Goal non-null")
    created = base._goal_projection(calls[1]["output"])
    reopened = base._goal_projection(calls[2]["output"])
    require(isinstance(created, dict) and isinstance(reopened, dict), "bootstrap Goal projections")
    _assert_native_goal_projection(created, thread_id, row["objective"], "active", "created Goal projection")
    _assert_native_goal_projection(reopened, thread_id, row["objective"], "active", "reopened Goal projection")
    require(created["threadId"] == reopened["threadId"] == goal["thread_id"] == thread_id, "bootstrap projection/DB thread identity")
    require(created["createdAt"] == reopened["createdAt"] == goal["created_at_ms"] // 1000, "bootstrap projection/DB creation time")
    current_status = "active" if require_active else "complete"
    require(goal["objective"] == row["objective"] and goal["status"] == current_status, "bootstrap Goal DB objective/status")
    turns = base._line_turns(records)
    actions = [item for item in base._action_calls(records, prompt_lines[0], len(records) + 1) if turns.get(item["line"]) == turn_id]
    require(len(actions) == 3 and [item["line"] for item in actions] == [call["call_line"] for call in calls], "bootstrap action closure")
    marker_lines = [line for line in base._message_lines(records, "assistant", BOOTSTRAP_MARKER) if turns.get(line) == turn_id]
    require(len(marker_lines) == 1 and marker_lines[0] > calls[-1]["output_line"], "bootstrap rollout marker")
    if require_active:
        require(goal.get("status") == "active", "Goal not active after bootstrap")
    output = _read_regular(capture / "bootstrap_output_last_message.txt", 1_000_000)
    require(output == BOOTSTRAP_MARKER.encode("utf-8"), "bootstrap marker")
    _validate_subject_temporal_state(row, capture, process, thread_id, goal["goal_id"], historical_rollout is not None)
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
        "status": "PASS_SUBJECT_FREE_FRESH_NATIVE_GOAL_ACTIVATION_PROJECTION_DB_CROSS_BOUND_ZERO_CREDIT",
    }


def _scored_common(
    row: dict[str, Any],
    capture: Path,
    codex_home: Path,
    complete: bool,
    require_active: bool,
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    v15._capture_modes(capture)
    bootstrap = load_json(capture / "bootstrap_attestation.json", 8_000_000)
    require(bootstrap == _bootstrap_common(row, capture, codex_home, require_active, bootstrap.get("rollout")), "bootstrap attestation reopen")
    launch = v15._launch(row, capture, "scored", SCORED_LAUNCH_SCHEMA, bootstrap["goal"]["thread_id"])
    prompt = _read_regular(capture / "scored_prompt.txt", 4_000_000).decode("utf-8")
    lifecycle = base._stdout_lifecycle(_read_regular(capture / "scored_stdout.jsonl", 64_000_000), "scored", complete=complete)
    thread_id = lifecycle["thread_id"]
    require(thread_id == bootstrap["goal"]["thread_id"], "scored task changed")
    goal, records, rollout, logical = v15._thread_goal(row, codex_home, thread_id)
    if require_active:
        require(goal.get("status") == "active", "Goal not active in scored turn")
    prompt_lines = base._message_lines(records, "user", prompt)
    require(len(prompt_lines) == 1, "scored prompt cardinality")
    prompt_line = prompt_lines[0]
    turns = base._line_turns(records)
    turn_id = turns.get(prompt_line)
    require(isinstance(turn_id, str) and turn_id != bootstrap["goal"]["turn_id"], "scored turn identity")
    context = prior._native_goal_context(records, prompt_line, turn_id, row["objective"])
    workspace = Path(launch["argv"][2])
    code = prior.reader_code(row, capture, workspace)
    command = prior.reader_command(row, capture, workspace)
    reader = v15.legacy._reader_call(records, code, command, str(workspace))
    require(reader["line"] > prompt_line and turns.get(reader["line"]) == turn_id, "scored reader turn")
    actions = base._action_calls(records, prompt_line, reader["line"])
    require(len(actions) == 1 and actions[0]["line"] == reader["line"], "action before scored reader")
    if complete:
        all_actions = [item for item in base._action_calls(records, prompt_line, len(records) + 1) if turns.get(item["line"]) == turn_id]
        require(len(all_actions) == 1 and all_actions[0]["line"] == reader["line"], "scored action closure")
        subject = _read_regular(capture / "subject_input.txt", 8_000_000)
        reader_result = v15.legacy._reader_result(records, reader, command, str(workspace), subject)
        reader = {**reader, "output_line": reader_result["tool_output_line"]}
    result = {
        "authority": {"qualification_credit": 0},
        "goal": {"goal_id": goal["goal_id"], "status": "active", "thread_id": thread_id, "turn_id": turn_id},
        "native_goal_context": context,
        "reader": {"call_id": reader["call_id"], "call_line": reader["line"], "transport": reader["representation"]},
        "rollout": {"bytes": len(rollout), "logical_path": logical, "sha256": sha256(rollout)},
    }
    return result, reader, lifecycle


v15._bootstrap_common = _bootstrap_common
v15._scored_common = _scored_common
v15.base._assert_goal = _strict_base_assert_goal

load_row = v15.load_row
attest_bootstrap = v15.attest_bootstrap


def _require_same_persisted_goal(capture: Path, result: dict[str, Any], label: str) -> None:
    bootstrap = load_json(capture / "bootstrap_attestation.json", 8_000_000)
    require(
        result["goal"]["goal_id"] == bootstrap["goal"]["goal_id"]
        and result["goal"]["thread_id"] == bootstrap["goal"]["thread_id"],
        f"{label} persisted Goal changed",
    )


def attest_release(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    result = v15.attest_release(row_path, capture, codex_home)
    _require_same_persisted_goal(capture, result, "release")
    return result


def attest_scored(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    result = v15.attest_scored(row_path, capture, codex_home)
    _require_same_persisted_goal(capture, result, "scored")
    return result


def attest_final(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    result = v15.attest_final(row_path, capture, codex_home)
    require(
        result["goal"]["goal_id"]
        == result["bootstrap"]["goal"]["goal_id"]
        == result["scored"]["goal"]["goal_id"],
        "final persisted Goal changed",
    )
    return result


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
    "SNAPSHOT_SCHEMA",
    "_assert_native_goal_projection",
    "attest_bootstrap",
    "attest_final",
    "attest_release",
    "attest_scored",
    "base",
    "canon",
    "load_json",
    "load_row",
    "prior",
    "require",
    "sha256",
)
