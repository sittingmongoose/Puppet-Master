#!/usr/bin/env python3
"""Independent attestor for subject-free Goal activation, scoring, and closure."""

from __future__ import annotations

import importlib.util
import json
import os
from pathlib import Path
import stat
import sys
from typing import Any


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
PRIOR_PATH = BASE / "goal_mode_empirical_harness_v13" / "goal_mode_terminal_closure_attestor.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_v13_attestor_for_v15", PRIOR_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V13 attestor loader unavailable")
prior = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = prior
sys.path.insert(0, str(PRIOR_PATH.parent))
SPEC.loader.exec_module(prior)
base = prior.v11.v10.base
legacy = prior.v11.v10.prior


ADAPTER = "CODEX_NATIVE_GOAL_SUBJECT_FREE_ACTIVATION_THEN_SCORED_RESUME_THEN_TERMINAL_CLOSURE_V1"
ROW_SCHEMA = "pw-r9-goal-mode-row-spec-v15"
SNAPSHOT_SCHEMA = "pw-r9-goal-mode-three-turn-prelaunch-snapshot-v15"
BOOTSTRAP_LAUNCH_SCHEMA = "pw-r9-goal-mode-bootstrap-launch-receipt-v15"
BOOTSTRAP_PROCESS_SCHEMA = "pw-r9-goal-mode-bootstrap-process-receipt-v15"
BOOTSTRAP_ATTESTATION_SCHEMA = "pw-r9-goal-mode-bootstrap-attestation-v15"
SCORED_LAUNCH_SCHEMA = "pw-r9-goal-mode-three-turn-scored-launch-receipt-v15"
SCORED_PROCESS_SCHEMA = "pw-r9-goal-mode-three-turn-scored-process-receipt-v15"
RELEASE_SCHEMA = "pw-r9-goal-mode-three-turn-subject-release-gate-v15"
DELIVERY_SCHEMA = "pw-r9-goal-mode-three-turn-subject-delivery-v15"
SCORED_ATTESTATION_SCHEMA = "pw-r9-goal-mode-three-turn-scored-attestation-v15"
CLOSURE_LAUNCH_SCHEMA = "pw-r9-goal-mode-three-turn-closure-launch-receipt-v15"
CLOSURE_PROCESS_SCHEMA = "pw-r9-goal-mode-three-turn-closure-process-receipt-v15"
FINAL_ATTESTATION_SCHEMA = "pw-r9-goal-mode-three-turn-final-attestation-v15"
BOOTSTRAP_MARKER = "GOAL_ACTIVE_SUBJECT_NOT_SEEN_V15"
CLOSURE_MARKER = prior.CLOSURE_MARKER
CONTEXT_CONTRACT = prior.CONTEXT_CONTRACT
EXPECTED_PRE_FINAL_FILES = {
    "bootstrap_attestation.json",
    "bootstrap_launch_receipt.json",
    "bootstrap_output_last_message.txt",
    "bootstrap_process_receipt.json",
    "bootstrap_prompt.txt",
    "bootstrap_stderr.bin",
    "bootstrap_stdout.jsonl",
    "closure_launch_receipt.json",
    "closure_output_last_message.txt",
    "closure_process_receipt.json",
    "closure_prompt.txt",
    "closure_stderr.bin",
    "closure_stdout.jsonl",
    "goal_active_subject_release_gate.json",
    "prelaunch_snapshot.json",
    "scored_launch_receipt.json",
    "scored_output_last_message.txt",
    "scored_phase_attestation.json",
    "scored_process_receipt.json",
    "scored_prompt.txt",
    "scored_stderr.bin",
    "scored_stdout.jsonl",
    "subject_delivery.json",
    "subject_input.txt",
}


Invalid = prior.Invalid
require = prior.require
canon = prior.canon
sha256 = prior.sha256
load_json = prior.load_json


def _exact_keys(value: dict[str, Any], expected: set[str], label: str) -> None:
    require(set(value) == expected, f"{label} keys")


def _read_regular(path: Path, limit: int = 256_000_000) -> bytes:
    return base._read_regular(path, limit)


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


def load_row(path: Path) -> dict[str, Any]:
    row = load_json(path, 4_000_000)
    require(isinstance(row, dict), "row object")
    _exact_keys(row, {"adapter", "attempt", "cli_version", "control_envelope", "criteria", "model", "objective", "reasoning_effort", "row_id", "run_id", "schema_id", "subject_utf8_bytes", "subject_utf8_sha256"}, "row")
    require(row["schema_id"] == ROW_SCHEMA and row["adapter"] == ADAPTER and row["attempt"] == 0 and row["cli_version"] == "0.148.0", "row constants")
    require(isinstance(row["run_id"], str) and row["run_id"] and isinstance(row["row_id"], str) and row["row_id"], "row identity")
    require(isinstance(row["criteria"], dict) and row["criteria"].get("rule") == "EXACT_UTF8_NO_DECORATION" and isinstance(row["criteria"].get("expected_exact_utf8"), str), "criteria")
    require(isinstance(row["control_envelope"], dict) and row["control_envelope"].get("goal_mode_required") is True, "control envelope")
    require(isinstance(row["subject_utf8_bytes"], int) and 0 < row["subject_utf8_bytes"] <= 8_000_000 and isinstance(row["subject_utf8_sha256"], str) and len(row["subject_utf8_sha256"]) == 64, "subject identity")
    require(row["objective"] == prior._expected_objective(row), "objective derivation")
    return row


def _snapshot(capture: Path) -> dict[str, Any]:
    value = load_json(capture / "prelaunch_snapshot.json", 256_000_000)
    _exact_keys(value, {"captured_at_ms", "goal_ids", "schema_id", "thread_ids"}, "snapshot")
    require(value["schema_id"] == SNAPSHOT_SCHEMA and value["goal_ids"] == sorted(set(value["goal_ids"])) and value["thread_ids"] == sorted(set(value["thread_ids"])), "snapshot identity")
    return value


def _launch(
    row: dict[str, Any],
    capture: Path,
    phase: str,
    schema: str,
    thread_id: str | None = None,
) -> dict[str, Any]:
    value = load_json(capture / f"{phase}_launch_receipt.json", 4_000_000)
    _exact_keys(value, {"argv", "phase", "pid", "schema_id", "started_at_ms", "stdin"}, f"{phase} launch")
    prompt = _read_regular(capture / f"{phase}_prompt.txt", 4_000_000)
    require(value["schema_id"] == schema and value["phase"] == phase.upper() and value["stdin"] == {"bytes": len(prompt), "sha256": sha256(prompt)}, f"{phase} launch identity")
    argv = value["argv"]
    require(isinstance(argv, list) and all(isinstance(item, str) for item in argv) and len(argv) == 19, f"{phase} argv type/length")
    if phase == "bootstrap":
        require(thread_id is None, "bootstrap thread argument")
        require(argv[1:4] == ["exec", "--strict-config", "-C"], "bootstrap argv prefix")
        require(argv[5:12] == ["--sandbox", "read-only", "--color", "never", "--json", "-m", row["model"]], "bootstrap execution envelope")
        require(argv[12:17] == ["-c", f'model_reasoning_effort="{row["reasoning_effort"]}"', "-c", "suppress_unstable_features_warning=true", "-o"], "bootstrap config envelope")
        require(Path(argv[17]) == capture / "bootstrap_output_last_message.txt" and argv[18] == "-", "bootstrap output/stdin")
        require("--ephemeral" not in argv and "resume" not in argv, "bootstrap persistence/freshness")
    else:
        require(phase in {"scored", "closure"} and isinstance(thread_id, str), f"{phase} thread argument")
        bootstrap_argv = load_json(capture / "bootstrap_launch_receipt.json", 4_000_000)["argv"]
        require(argv[0] == bootstrap_argv[0] and argv[1:6] == ["-C", bootstrap_argv[4], "--sandbox", "read-only", "exec"], f"{phase} global envelope")
        require(argv[6:11] == ["resume", "--strict-config", "--json", "-m", row["model"]], f"{phase} resume/model")
        require(argv[11:16] == ["-c", f'model_reasoning_effort="{row["reasoning_effort"]}"', "-c", "suppress_unstable_features_warning=true", "-o"], f"{phase} config envelope")
        require(Path(argv[16]) == capture / f"{phase}_output_last_message.txt" and argv[17:] == [thread_id, "-"], f"{phase} output/task/stdin")
        require("--ephemeral" not in argv and argv.count("resume") == 1, f"{phase} persistence/cardinality")
    return value


def _process(capture: Path, phase: str, schema: str, launch: dict[str, Any]) -> dict[str, Any]:
    value = load_json(capture / f"{phase}_process_receipt.json", 4_000_000)
    expected = {"ended_at_ms", "pid", "rc", "schema_id", "started_at_ms", "stdin_closed", "timed_out"}
    if phase == "scored":
        expected |= {"goal_release_error", "reader_quiescence", "subject_delivery", "subject_fifo_removed", "subject_release"}
    _exact_keys(value, expected, f"{phase} process")
    require(value.get("schema_id") == schema and value.get("rc") == 0 and value.get("timed_out") is False and value.get("stdin_closed") is True, f"{phase} process")
    require(value["pid"] == launch["pid"] and value["started_at_ms"] == launch["started_at_ms"] and isinstance(value["ended_at_ms"], int) and value["ended_at_ms"] >= value["started_at_ms"], f"{phase} process binding")
    return value


def _goal_calls(records: list[dict[str, Any]], prompt_line: int, methods: list[str], objective: str) -> tuple[list[dict[str, Any]], str]:
    calls = [call for call in legacy._native_goal_calls(records) if call["call_line"] > prompt_line]
    require(len(calls) >= len(methods) and [call["method"] for call in calls[: len(methods)]] == methods, "Goal action sequence")
    calls = calls[: len(methods)]
    require(len({call["representation"] for call in calls}) == 1 and all(legacy._exact_goal_invocation(call, objective) for call in calls), "Goal invocation")
    turns = base._line_turns(records)
    turn_id = turns.get(prompt_line)
    require(isinstance(turn_id, str) and all(turns.get(call["call_line"]) == turn_id and turns.get(call["output_line"]) == turn_id for call in calls), "Goal turn")
    actions = base._action_calls(records, prompt_line, calls[-1]["output_line"])
    require(len(actions) == len(calls) and [action["line"] for action in actions] == [call["call_line"] for call in calls], "non-Goal action in Goal sequence")
    return calls, turn_id


def _thread_goal(row: dict[str, Any], codex_home: Path, thread_id: str) -> tuple[dict[str, Any], list[dict[str, Any]], bytes, str]:
    _, goal, records, rollout, logical = base._thread_goal(row, codex_home, thread_id)
    return goal, records, rollout, logical


def _bootstrap_common(
    row: dict[str, Any],
    capture: Path,
    codex_home: Path,
    require_active: bool,
    historical_rollout: dict[str, Any] | None = None,
) -> dict[str, Any]:
    _capture_modes(capture)
    launch = _launch(row, capture, "bootstrap", BOOTSTRAP_LAUNCH_SCHEMA)
    process = _process(capture, "bootstrap", BOOTSTRAP_PROCESS_SCHEMA, launch)
    snapshot = _snapshot(capture)
    prompt = _read_regular(capture / "bootstrap_prompt.txt", 4_000_000).decode("utf-8")
    lifecycle = base._stdout_lifecycle(_read_regular(capture / "bootstrap_stdout.jsonl", 64_000_000), "bootstrap", complete=True)
    require(lifecycle["messages"] == [BOOTSTRAP_MARKER], "bootstrap stdout marker")
    thread_id = lifecycle["thread_id"]
    require(thread_id not in snapshot["thread_ids"], "bootstrap thread reused")
    goal, records, rollout, logical = _thread_goal(row, codex_home, thread_id)
    require(goal["goal_id"] not in snapshot["goal_ids"], "bootstrap Goal reused")
    prompt_lines = base._message_lines(records, "user", prompt)
    require(len(prompt_lines) == 1, "bootstrap prompt cardinality")
    calls, turn_id = _goal_calls(records, prompt_lines[0], ["get_goal", "create_goal", "get_goal"], row["objective"])
    require(base._goal_projection(calls[0]["output"]) is None, "initial Goal non-null")
    created = base._goal_projection(calls[1]["output"])
    reopened = base._goal_projection(calls[2]["output"])
    require(isinstance(created, dict) and isinstance(reopened, dict), "bootstrap Goal projections")
    base._assert_goal(created, thread_id, row["objective"], "active")
    base._assert_goal(reopened, thread_id, row["objective"], "active")
    require(created["goal_id"] == goal["goal_id"] == reopened["goal_id"], "bootstrap Goal identity")
    turns = base._line_turns(records)
    actions = [item for item in base._action_calls(records, prompt_lines[0], len(records) + 1) if turns.get(item["line"]) == turn_id]
    require(len(actions) == 3 and [item["line"] for item in actions] == [call["call_line"] for call in calls], "bootstrap action closure")
    marker_lines = [line for line in base._message_lines(records, "assistant", BOOTSTRAP_MARKER) if turns.get(line) == turn_id]
    require(len(marker_lines) == 1 and marker_lines[0] > calls[-1]["output_line"], "bootstrap rollout marker")
    if require_active:
        require(goal.get("status") == "active", "Goal not active after bootstrap")
    output = _read_regular(capture / "bootstrap_output_last_message.txt", 1_000_000)
    require(output == BOOTSTRAP_MARKER.encode("utf-8"), "bootstrap marker")
    require(not (capture / "subject_input.txt").exists() and not (capture / "subject_delivery.json").exists(), "subject present during bootstrap")
    rollout_identity = {"bytes": len(rollout), "logical_path": logical, "sha256": sha256(rollout)}
    if historical_rollout is not None:
        _exact_keys(historical_rollout, {"bytes", "logical_path", "sha256"}, "historical bootstrap rollout")
        prefix_bytes = base._assert_rollout_prefix(codex_home, historical_rollout, "historical bootstrap")
        require(historical_rollout["logical_path"] == logical and prefix_bytes < len(rollout), "bootstrap rollout strict prefix")
        rollout_identity = historical_rollout
    return {
        "authority": {"qualification_credit": 0, "subject_release": False},
        "goal": {"goal_action_transport": calls[0]["representation"], "goal_id": goal["goal_id"], "status": "active", "thread_id": thread_id, "turn_id": turn_id},
        "process": {"ended_at_ms": process["ended_at_ms"], "pid": process["pid"], "started_at_ms": launch["started_at_ms"]},
        "rollout": rollout_identity,
        "schema_id": BOOTSTRAP_ATTESTATION_SCHEMA,
        "status": "PASS_SUBJECT_FREE_FRESH_NATIVE_GOAL_ACTIVATION_ZERO_CREDIT",
    }


def attest_bootstrap(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    return _bootstrap_common(load_row(row_path), capture, codex_home, True)


def _scored_common(row: dict[str, Any], capture: Path, codex_home: Path, complete: bool, require_active: bool) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    _capture_modes(capture)
    bootstrap = load_json(capture / "bootstrap_attestation.json", 8_000_000)
    require(bootstrap == _bootstrap_common(row, capture, codex_home, require_active, bootstrap.get("rollout")), "bootstrap attestation reopen")
    launch = _launch(row, capture, "scored", SCORED_LAUNCH_SCHEMA, bootstrap["goal"]["thread_id"])
    prompt = _read_regular(capture / "scored_prompt.txt", 4_000_000).decode("utf-8")
    lifecycle = base._stdout_lifecycle(_read_regular(capture / "scored_stdout.jsonl", 64_000_000), "scored", complete=complete)
    thread_id = lifecycle["thread_id"]
    require(thread_id == bootstrap["goal"]["thread_id"], "scored task changed")
    goal, records, rollout, logical = _thread_goal(row, codex_home, thread_id)
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
    reader = legacy._reader_call(records, code, command, str(workspace))
    require(reader["line"] > prompt_line and turns.get(reader["line"]) == turn_id, "scored reader turn")
    actions = base._action_calls(records, prompt_line, reader["line"])
    require(len(actions) == 1 and actions[0]["line"] == reader["line"], "action before scored reader")
    if complete:
        all_actions = [item for item in base._action_calls(records, prompt_line, len(records) + 1) if turns.get(item["line"]) == turn_id]
        require(len(all_actions) == 1 and all_actions[0]["line"] == reader["line"], "scored action closure")
    result = {
        "authority": {"qualification_credit": 0},
        "goal": {"goal_id": goal["goal_id"], "status": "active", "thread_id": thread_id, "turn_id": turn_id},
        "native_goal_context": context,
        "reader": {"call_id": reader["call_id"], "call_line": reader["line"], "transport": reader["representation"]},
        "rollout": {"bytes": len(rollout), "logical_path": logical, "sha256": sha256(rollout)},
    }
    return result, reader, lifecycle


def attest_release(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    row = load_row(row_path)
    result, _, _ = _scored_common(row, capture, codex_home, False, True)
    require(not (capture / "subject_input.txt").exists() and not (capture / "subject_delivery.json").exists(), "subject existed before release")
    return {
        "authority": {"qualification_credit": 0, "subject_release": True},
        "goal": result["goal"],
        "native_goal_context": result["native_goal_context"],
        "reader": result["reader"],
        "rollout_prefix": result["rollout"],
        "schema_id": RELEASE_SCHEMA,
        "status": "PASS_SAME_TASK_ACTIVE_GOAL_SCORED_SUBJECT_RELEASE_AUTHORIZED",
    }


def attest_scored(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    row = load_row(row_path)
    result, reader, lifecycle = _scored_common(row, capture, codex_home, True, True)
    launch = _launch(row, capture, "scored", SCORED_LAUNCH_SCHEMA, result["goal"]["thread_id"])
    process = _process(capture, "scored", SCORED_PROCESS_SCHEMA, launch)
    require(process.get("subject_release") == "AFTER_COMPLETED_SUBJECT_FREE_GOAL_ACTIVATION" and process.get("subject_fifo_removed") is True and process.get("reader_quiescence") == {"detected_pids": [], "kill_sent": 0, "remaining_pids": [], "term_sent": 0}, "scored process release")
    delivery = load_json(capture / "subject_delivery.json", 4_000_000)
    subject = _read_regular(capture / "subject_input.txt", 8_000_000)
    require(delivery == {"bytes": len(subject), "closed_at_ms": delivery.get("closed_at_ms"), "schema_id": DELIVERY_SCHEMA, "sha256": sha256(subject), "status": "DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE"} and isinstance(delivery["closed_at_ms"], int), "subject delivery")
    require(len(subject) == row["subject_utf8_bytes"] and sha256(subject) == row["subject_utf8_sha256"], "subject identity")
    expected = row["criteria"]["expected_exact_utf8"].encode("utf-8")
    answer = _read_regular(capture / "scored_output_last_message.txt", 8_000_000)
    require(answer == expected, "scored answer")
    require(lifecycle["messages"] == [expected.decode("utf-8")], "scored stdout answer")
    result.update({
        "answer": {"bytes": len(answer), "sha256": sha256(answer)},
        "reader_output_line": reader["output_line"],
        "schema_id": SCORED_ATTESTATION_SCHEMA,
        "status": "PASS_SAME_TASK_ACTIVE_GOAL_SCORED_SUBJECT_ZERO_CREDIT",
    })
    return result


def attest_final(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    row = load_row(row_path)
    _capture_modes(capture)
    require({path.name for path in capture.iterdir()} == EXPECTED_PRE_FINAL_FILES, "pre-final capture inventory")
    stored_bootstrap = load_json(capture / "bootstrap_attestation.json", 8_000_000)
    bootstrap = _bootstrap_common(row, capture, codex_home, False, stored_bootstrap.get("rollout"))
    require(load_json(capture / "bootstrap_attestation.json", 8_000_000) == bootstrap, "final bootstrap reopen")
    scored = load_json(capture / "scored_phase_attestation.json", 8_000_000)
    rederived_scored, _, _ = _scored_common(row, capture, codex_home, True, False)
    historical_scored = scored.get("rollout")
    require(isinstance(historical_scored, dict), "historical scored rollout")
    prefix_bytes = base._assert_rollout_prefix(codex_home, historical_scored, "historical scored")
    require(historical_scored.get("logical_path") == rederived_scored["rollout"]["logical_path"] and prefix_bytes < rederived_scored["rollout"]["bytes"], "scored rollout strict prefix")
    rederived_scored["rollout"] = historical_scored
    expected = row["criteria"]["expected_exact_utf8"].encode("utf-8")
    rederived_scored.update({"answer": {"bytes": len(expected), "sha256": sha256(expected)}, "reader_output_line": scored.get("reader_output_line"), "schema_id": SCORED_ATTESTATION_SCHEMA, "status": "PASS_SAME_TASK_ACTIVE_GOAL_SCORED_SUBJECT_ZERO_CREDIT"})
    require(scored == rederived_scored and _read_regular(capture / "scored_output_last_message.txt", 8_000_000) == expected, "final scored reopen")
    launch = _launch(row, capture, "closure", CLOSURE_LAUNCH_SCHEMA, bootstrap["goal"]["thread_id"])
    process = _process(capture, "closure", CLOSURE_PROCESS_SCHEMA, launch)
    prompt = _read_regular(capture / "closure_prompt.txt", 4_000_000).decode("utf-8")
    lifecycle = base._stdout_lifecycle(_read_regular(capture / "closure_stdout.jsonl", 64_000_000), "closure", complete=True)
    require(lifecycle["messages"] == [CLOSURE_MARKER], "closure stdout marker")
    thread_id = lifecycle["thread_id"]
    require(thread_id == bootstrap["goal"]["thread_id"] == scored["goal"]["thread_id"], "closure task changed")
    goal, records, rollout, logical = _thread_goal(row, codex_home, thread_id)
    require(goal.get("status") == "complete", "Goal not complete")
    prompt_lines = base._message_lines(records, "user", prompt)
    require(len(prompt_lines) == 1, "closure prompt cardinality")
    calls, turn_id = _goal_calls(records, prompt_lines[0], ["get_goal", "update_goal", "get_goal"], row["objective"])
    require(turn_id not in {bootstrap["goal"]["turn_id"], scored["goal"]["turn_id"]}, "closure turn identity")
    first = base._goal_projection(calls[0]["output"])
    updated = base._goal_projection(calls[1]["output"])
    reopened = base._goal_projection(calls[2]["output"])
    require(isinstance(first, dict) and isinstance(updated, dict) and isinstance(reopened, dict), "closure Goal projections")
    base._assert_goal(first, thread_id, row["objective"], "active")
    base._assert_goal(updated, thread_id, row["objective"], "complete")
    base._assert_goal(reopened, thread_id, row["objective"], "complete")
    context = prior._native_goal_context(records, prompt_lines[0], turn_id, row["objective"])
    turns = base._line_turns(records)
    actions = [item for item in base._action_calls(records, prompt_lines[0], len(records) + 1) if turns.get(item["line"]) == turn_id]
    require(len(actions) == 3 and [item["line"] for item in actions] == [call["call_line"] for call in calls], "closure action closure")
    marker_lines = [line for line in base._message_lines(records, "assistant", CLOSURE_MARKER) if turns.get(line) == turn_id]
    require(len(marker_lines) == 1 and marker_lines[0] > calls[-1]["output_line"], "closure rollout marker")
    require(_read_regular(capture / "closure_output_last_message.txt", 1_000_000) == CLOSURE_MARKER.encode("utf-8"), "closure marker")
    return {
        "authority": {"external_matrix_qualification_required": True, "qualification_credit": 0},
        "bootstrap": bootstrap,
        "closure": {"goal_actions": calls[0]["representation"], "native_goal_context": context, "process": {"ended_at_ms": process["ended_at_ms"], "pid": process["pid"], "started_at_ms": launch["started_at_ms"]}, "turn_id": turn_id},
        "goal": {"goal_id": goal["goal_id"], "status": "complete", "thread_id": thread_id, "turn_ids": [bootstrap["goal"]["turn_id"], scored["goal"]["turn_id"], turn_id]},
        "process_accounting": {"fresh_tasks": 1, "processes": 3, "resume_operations": 2, "retries": 0, "subject_deliveries": 1},
        "historical_scored_rollout": {"bytes": historical_scored["bytes"], "final_bytes": len(rollout), "logical_path": logical, "sha256": historical_scored["sha256"], "strict_prefix": True},
        "rollout": {"bytes": len(rollout), "logical_path": logical, "sha256": sha256(rollout)},
        "schema_id": FINAL_ATTESTATION_SCHEMA,
        "scored": scored,
        "status": "PASS_THREE_TURN_SAME_TASK_NATIVE_GOAL_SUBJECT_GATED_TERMINAL_CLOSURE_ZERO_CREDIT",
    }


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
    "Invalid",
    "RELEASE_SCHEMA",
    "ROW_SCHEMA",
    "SCORED_ATTESTATION_SCHEMA",
    "SCORED_LAUNCH_SCHEMA",
    "SCORED_PROCESS_SCHEMA",
    "SNAPSHOT_SCHEMA",
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
