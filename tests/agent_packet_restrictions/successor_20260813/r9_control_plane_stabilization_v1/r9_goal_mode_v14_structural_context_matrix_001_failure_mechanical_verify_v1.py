#!/usr/bin/env python3
"""Read-only mechanical reopen of the consumed V14 Matrix 001 failure."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import stat
import sys
from typing import Any


BASE = Path(__file__).resolve().parent
EVIDENCE = BASE / "goal_mode_v14_structural_context_matrix_001_evidence"
MATRIX_ID = "goal-mode-v14-structural-context-matrix-001"
ROW_COUNT = 291
PASS_COUNT = 21
FAIL_INDEX = 21
RUNTIME_VERIFIER = BASE / "r9_goal_mode_v14_structural_context_matrix_independent_runtime_verify_v1.py"
RUNTIME_VERIFIER_SHA256 = "6a738a2dd51ad56398bf3a2597d49cb84f5b927437e44113245eebee5f41aee3"
RUNTIME_VERIFIER_BYTES = 26679
FAILURE_FILES = {
    "prelaunch_snapshot.json",
    "scored_launch_receipt.json",
    "scored_output_last_message.txt",
    "scored_process_receipt.json",
    "scored_prompt.txt",
    "scored_stderr.bin",
    "scored_stdout.jsonl",
}
SCHEMA = "pw-r9-goal-mode-v14-structural-context-matrix-001-failure-mechanical-verification-v1"


class Invalid(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise Invalid(message)


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def load_runtime_verifier() -> Any:
    raw = RUNTIME_VERIFIER.read_bytes()
    require(len(raw) == RUNTIME_VERIFIER_BYTES and sha(raw) == RUNTIME_VERIFIER_SHA256 and stat.S_IMODE(os.lstat(RUNTIME_VERIFIER).st_mode) == 0o644, "runtime verifier identity")
    spec = importlib.util.spec_from_file_location("_r9_v14_matrix_failure_runtime_utilities", RUNTIME_VERIFIER)
    require(spec is not None and spec.loader is not None, "runtime verifier loader")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def matching_processes() -> list[int]:
    matches: list[int] = []
    matrix = MATRIX_ID.encode("utf-8")
    for proc in Path("/proc").iterdir():
        if not proc.name.isdigit():
            continue
        try:
            cmdline = (proc / "cmdline").read_bytes()
        except (FileNotFoundError, PermissionError, ProcessLookupError):
            continue
        if matrix in cmdline and (b"r9_goal_mode_v14_structural_context_matrix_controller_v1.py" in cmdline or b"goal_mode_empirical_harness_v14/goal_mode_harness.py" in cmdline):
            matches.append(int(proc.name))
    require(not matches, "live Matrix001 process")
    return matches


def verify(codex_home: Path) -> dict[str, Any]:
    rv = load_runtime_verifier()
    manifest = rv.source_preflight()
    matrix = rv.manifest_matrix(manifest, MATRIX_ID)
    before = rv.inventory(EVIDENCE)
    require(before["files"] == 473 and before["directories"] == 24, "failure inventory cardinality")
    require({path.name for path in (EVIDENCE / "rows").iterdir()} == {f"row-{index:03d}" for index in range(22)}, "consumed row directories")
    require({path.name for path in (EVIDENCE / "controller_results").iterdir()} == {f"row-{index:03d}.{suffix}" for index in range(22) for suffix in ("receipt.json", "stderr", "stdout")}, "controller results")
    terminal = rv.load(EVIDENCE / "matrix_terminal.json")
    require(
        terminal
        == {
            "accounting": {"aborted_unlaunched": 269, "consumed": 22, "failed": 1, "passed": 21, "planned": 291, "qualification_credit": 0, "retries": 0},
            "first_failure": {"index": 21, "rc": 1, "stderr_sha256": sha(b""), "stdout_sha256": "78b763d526326c6beaebe0e366bf28fac214645256f90ed90c744402fabda594"},
            "isolation": {"all_consumed_rows_quiescent_before_successor": False, "max_parallel": 1, "serialized": True},
            "matrix_id": MATRIX_ID,
            "schema_id": "pw-r9-goal-mode-v14-structural-context-matrix-controller-terminal-v1",
            "started_at_ms": 1787397894930,
            "status": "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY",
        },
        "failure terminal",
    )
    attestor = rv.load_attestor()
    goal_paths = list(codex_home.glob("goals_*.sqlite"))
    require(len(goal_paths) == 1, "Goal DB")
    passed_rows: list[dict[str, Any]] = []
    thread_ids: set[str] = set()
    goal_ids: set[str] = set()
    turn_ids: set[str] = set()
    with rv.connect_ro(goal_paths[0]) as goals_db:
        for index in range(PASS_COUNT):
            row_id = f"row-{index:03d}"
            item = matrix["rows"][index]
            row_path = rv.PAIR_ROOT / item["row_spec"]["path"]
            capture = EVIDENCE / "rows" / row_id
            require({path.name for path in capture.iterdir()} == rv.EXPECTED_ROW_FILES, f"pass row inventory:{index}")
            receipt = rv.load(EVIDENCE / "controller_results" / f"{row_id}.receipt.json")
            require(receipt.get("status") == "PASS" and receipt.get("rc") == 0 and receipt.get("process_reaped") is True and receipt.get("quiescent_before_next") is True and receipt.get("timed_out") is False, f"pass receipt:{index}")
            stdout = rv.read_regular(EVIDENCE / "controller_results" / f"{row_id}.stdout")
            require(rv.read_regular(EVIDENCE / "controller_results" / f"{row_id}.stderr") == b"" and receipt["stdout"] == {"bytes": len(stdout), "sha256": sha(stdout)}, f"pass streams:{index}")
            result = json.loads(stdout, object_pairs_hook=rv.pairs)
            require(stdout == rv.canon(result) and result.get("schema_id") == "pw-r9-goal-mode-v14-matrix-row-result-v1", f"pass result:{index}")
            stored = rv.load(capture / "goal_mode_attestation.json")
            require(attestor.attest_final(row_path, capture, codex_home) == stored == result.get("attestation"), f"pass attestation:{index}")
            goal = stored["goal"]
            require(goal.get("status") == "complete" and goal["thread_id"] not in thread_ids and goal["goal_id"] not in goal_ids and not (set(goal["turn_ids"]) & turn_ids), f"pass Goal identity:{index}")
            goal_row = goals_db.execute("SELECT * FROM thread_goals WHERE thread_id=?", (goal["thread_id"],)).fetchone()
            require(goal_row is not None and goal_row["goal_id"] == goal["goal_id"] and goal_row["status"] == "complete", f"pass Goal DB:{index}")
            thread_ids.add(goal["thread_id"])
            goal_ids.add(goal["goal_id"])
            turn_ids.update(goal["turn_ids"])
            passed_rows.append({"goal_id": goal["goal_id"], "index": index, "status": "PASS", "thread_id": goal["thread_id"], "turn_ids": goal["turn_ids"]})
        fail_item = matrix["rows"][FAIL_INDEX]
        fail_row_path = rv.PAIR_ROOT / fail_item["row_spec"]["path"]
        fail_row = rv.load(fail_row_path)
        fail_capture = EVIDENCE / "rows" / "row-021"
        require({path.name for path in fail_capture.iterdir()} == FAILURE_FILES, "failure row inventory")
        fail_receipt = rv.load(EVIDENCE / "controller_results" / "row-021.receipt.json")
        require(fail_receipt == {"ended_at_ms": 1787399067255, "index": 21, "pid": 3571561, "process_reaped": True, "quiescent_before_next": False, "rc": 1, "row_id": "row-021", "schema_id": "pw-r9-goal-mode-v14-structural-context-matrix-row-process-receipt-v1", "started_at_ms": 1787398957306, "status": "FAIL", "stderr": {"bytes": 0, "sha256": sha(b"")}, "stdout": {"bytes": 261, "sha256": "78b763d526326c6beaebe0e366bf28fac214645256f90ed90c744402fabda594"}, "timed_out": False}, "failure receipt")
        failure_stdout = rv.read_regular(EVIDENCE / "controller_results" / "row-021.stdout")
        failure_value = json.loads(failure_stdout, object_pairs_hook=rv.pairs)
        require(failure_stdout == rv.canon(failure_value) and failure_value == {"authority": {"qualification_credit": 0, "subject_release": False}, "error": "active Goal gate failed; subject withheld:capture file mode: scored_output_last_message.txt", "schema_id": "pw-r9-goal-mode-harness-failure-v14", "status": "FAIL_CLOSED_ZERO_CREDIT_NO_RETRY"}, "failure result")
        require(rv.read_regular(EVIDENCE / "controller_results" / "row-021.stderr") == b"", "failure controller stderr")
        process_receipt = rv.load(fail_capture / "scored_process_receipt.json")
        require(process_receipt.get("rc") == 0 and process_receipt.get("timed_out") is False and process_receipt.get("subject_release") == "NOT_RELEASED" and process_receipt.get("subject_delivery") == {} and process_receipt.get("goal_release_error") == "capture file mode: scored_output_last_message.txt", "failure scored process")
        for name in ("goal_active_subject_release_gate.json", "subject_delivery.json", "subject_input.txt", "goal_mode_attestation.json", "closure_prompt.txt"):
            require(not (fail_capture / name).exists(), f"subject/closure artifact exists:{name}")
        scored_stdout = rv.read_regular(fail_capture / "scored_stdout.jsonl")
        require(len(scored_stdout) == 2421 and sha(scored_stdout) == "80ec15cc4909ff190336ad7b429c8f827abf50cec2e5b9111a441fb2101ae762", "failure scored stdout identity")
        first_line = json.loads(scored_stdout.splitlines()[0], object_pairs_hook=rv.pairs)
        require(first_line == {"thread_id": "01a02947-ac0d-7791-89a7-44713665c5ed", "type": "thread.started"}, "failure thread")
        thread_id = first_line["thread_id"]
        goal_rows = goals_db.execute("SELECT * FROM thread_goals WHERE thread_id=?", (thread_id,)).fetchall()
        require(len(goal_rows) == 1 and goal_rows[0]["status"] == "active" and goal_rows[0]["objective"] == fail_row["objective"], "failure Goal DB")
        goal_id = goal_rows[0]["goal_id"]
        snapshot = rv.load(fail_capture / "prelaunch_snapshot.json", 256_000_000)
        require(thread_id not in snapshot["thread_ids"] and goal_id not in snapshot["goal_ids"], "failure identities not fresh")
        _, goal, records, rollout_raw, logical = attestor.v11.v10.base._thread_goal(fail_row, codex_home, thread_id)
        prompt = rv.read_regular(fail_capture / "scored_prompt.txt").decode("utf-8")
        prompt_lines = attestor.v11.v10.base._message_lines(records, "user", prompt)
        require(len(prompt_lines) == 1, "failure prompt")
        calls = [call for call in attestor.v11.v10.prior._native_goal_calls(records) if call["call_line"] > prompt_lines[0]]
        require(len(calls) >= 3 and [call["method"] for call in calls[:3]] == ["get_goal", "create_goal", "get_goal"], "failure Goal calls")
        actions = attestor.v11.v10.base._action_calls(records, prompt_lines[0], calls[2]["output_line"])
        require(len(actions) == 4 and [action["line"] for action in actions] == [14, 17, 22, 27], "pre-Goal action sequence")
        pre_goal_payload = next(attestor.v11.v10.base._payload(entry) for entry in records if entry["line"] == 14)
        require(pre_goal_payload.get("type") == "web_search_call" and pre_goal_payload.get("status") == "completed", "pre-Goal web action")
        require(goal.get("goal_id") == goal_id and goal.get("status") == "active", "failure Goal projection")
        require(rv.read_regular(fail_capture / "scored_output_last_message.txt") == b"Reader failed before subject was available: `GOAL_SUBJECT_READER_FAIL:timeout_before_subject`", "failure last message")
        failure = {
            "goal_id": goal_id,
            "goal_status": "active",
            "pre_goal_action": {"line": 14, "status": "completed", "type": "web_search_call"},
            "rollout": {"bytes": len(rollout_raw), "logical_path": logical, "sha256": sha(rollout_raw)},
            "row_id": "row-021",
            "subject_delivered": False,
            "thread_id": thread_id,
        }
    processes = matching_processes()
    after = rv.inventory(EVIDENCE)
    require(after == before, "failure inventory drift")
    return {
        "authority": {"matrix_002_launch": False, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False, "retry": False},
        "evidence": {"path": EVIDENCE.name, **rv.inventory_summary(before)},
        "failure": failure,
        "first_mismatch": {"family": "PRE_GOAL_ACTION_BEFORE_NATIVE_GOAL_ACTIVATION", "immediate_gate_error": "capture file mode: scored_output_last_message.txt", "index": 21, "row_id": "row-021"},
        "lineage": {"matrix005": "PERMANENT_FAIL_ZERO_CREDIT", "matrix006": "INVALIDATED", "v13_canary": "PASS_ZERO_CREDIT"},
        "matrix_id": MATRIX_ID,
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False, "process_inspection_performed": False, "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED"},
        "passed_rows": passed_rows,
        "processes": {"matching_matrix_processes": processes},
        "schema_id": SCHEMA,
        "status": "PASS_MECHANICAL_PRESERVATION_OF_PERMANENT_V14_MATRIX_001_FAILURE_ZERO_CREDIT_NO_RETRY",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--codex-home", type=Path, required=True)
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    try:
        require(args.verify and args.codex_home.is_absolute(), "CLI")
        result, rc = verify(args.codex_home), 0
    except (Invalid, OSError, UnicodeError, sqlite3.Error, json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
        result = {"authority": {"matrix_launch": False, "qualification_credit": 0}, "error": str(exc), "first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_MECHANICAL_REOPEN_ZERO_CREDIT_NO_AUTHORITY"}
        rc = 1
    sys.stdout.buffer.write(json.dumps(result, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n")
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
