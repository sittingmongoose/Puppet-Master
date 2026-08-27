#!/usr/bin/env python3
"""Read-only independent reopen of the once-only V13 native-Goal canary."""

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


SCHEMA = "pw-r9-goal-mode-v13-structural-context-route-canary-independent-runtime-verification-v1"
RUN_ID = "goal-mode-v13-structural-context-terminal-closure-canary-001"
CONTROLLER_SHA256 = "34d30bcb768734d970d49127ff153bd7979d2b69cf60f7a12e1c4d158b9d0521"
CONTROLLER_BYTES = 25059
CONTEXT_CONTRACT = "STRUCTURAL_SOURCE_WRAPPER_EXACT_OBJECTIVE_ORDERED_SECTIONS_NO_PRIOR_WORK_V1"
EXPECTED_ROW_FILES = {
    "closure_launch_receipt.json",
    "closure_output_last_message.txt",
    "closure_process_receipt.json",
    "closure_prompt.txt",
    "closure_stderr.bin",
    "closure_stdout.jsonl",
    "goal_active_subject_release_gate.json",
    "goal_mode_attestation.json",
    "prelaunch_snapshot.json",
    "scored_launch_receipt.json",
    "scored_output_last_message.txt",
    "scored_phase_attestation.json",
    "scored_process_receipt.json",
    "scored_prompt.txt",
    "scored_stderr.bin",
    "scored_stdout.jsonl",
    "stderr_classification.json",
    "subject_delivery.json",
    "subject_input.txt",
}


class Invalid(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise Invalid(message)


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    value: dict[str, Any] = {}
    for key, item in items:
        require(key not in value, f"duplicate JSON key:{key}")
        value[key] = item
    return value


def canon(value: Any, newline: bool = True) -> bytes:
    raw = json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return raw + (b"\n" if newline else b"")


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int = 256_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0 <= before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require((before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), f"changing file:{path}")
    require(len(raw) == before.st_size, f"short read:{path}")
    return raw


def load(path: Path, limit: int = 64_000_000) -> Any:
    raw = read_regular(path, limit)
    require(raw.endswith(b"\n") and not raw.endswith(b"\n\n") and b"\r" not in raw and b"\x00" not in raw, f"JSON framing:{path}")
    try:
        value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise Invalid(f"JSON:{path}:{exc}") from exc
    require(raw == canon(value), f"noncanonical:{path}")
    return value


def identity(path: Path) -> dict[str, Any]:
    raw = read_regular(path)
    return {"bytes": len(raw), "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}", "path": path.name, "sha256": sha(raw)}


def inventory(root: Path) -> dict[str, Any]:
    require(root.is_absolute() and root.is_dir() and not root.is_symlink(), "evidence root")
    rows: list[dict[str, Any]] = []
    dir_count = 0
    for path in sorted(root.rglob("*"), key=lambda item: item.relative_to(root).as_posix()):
        st = os.lstat(path)
        require(not stat.S_ISLNK(st.st_mode), f"symlink:{path}")
        if stat.S_ISDIR(st.st_mode):
            require(stat.S_IMODE(st.st_mode) == 0o700, f"directory mode:{path}")
            dir_count += 1
            continue
        require(stat.S_ISREG(st.st_mode) and stat.S_IMODE(st.st_mode) == 0o600, f"file custody:{path}")
        raw = read_regular(path)
        rows.append({"bytes": len(raw), "mode": "0600", "path": path.relative_to(root).as_posix(), "sha256": sha(raw)})
    projection = canon(rows, newline=False)
    return {"aggregate_file_bytes": sum(row["bytes"] for row in rows), "directories": dir_count, "files": len(rows), "projection_bytes": len(projection), "projection_sha256": sha(projection), "rows": rows}


def load_attestor(base: Path) -> Any:
    path = base / "goal_mode_empirical_harness_v13" / "goal_mode_terminal_closure_attestor.py"
    spec = importlib.util.spec_from_file_location("_r9_v13_runtime_reopen_attestor", path)
    require(spec is not None and spec.loader is not None, "attestor loader")
    module = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(path.parent))
    spec.loader.exec_module(module)
    return module


def connect_ro(path: Path) -> sqlite3.Connection:
    con = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=5)
    con.row_factory = sqlite3.Row
    return con


def verify(args: argparse.Namespace) -> dict[str, Any]:
    base = args.base
    evidence = args.evidence
    controller = base / "r9_goal_mode_v13_structural_context_terminal_closure_route_canary_controller_v1.py"
    raw_controller = read_regular(controller)
    require(len(raw_controller) == CONTROLLER_BYTES and sha(raw_controller) == CONTROLLER_SHA256 and stat.S_IMODE(os.lstat(controller).st_mode) == 0o644, "controller identity")
    before = inventory(evidence)
    require(before["files"] == 67 and before["directories"] == 5, "evidence cardinality")
    require({path.name for path in (evidence / "controller_results").iterdir()} == {f"row-{i:03d}.{suffix}" for i in range(3) for suffix in ("receipt.json", "stderr", "stdout")}, "controller results inventory")
    require({path.name for path in (evidence / "rows").iterdir()} == {f"row-{i:03d}" for i in range(3)}, "row directory inventory")
    terminal = load(evidence / "controller_terminal.json")
    require(
        terminal
        == {
            "accounting": {"aborted_unlaunched": 0, "consumed": 3, "failed": 0, "passed": 3, "planned": 3, "qualification_credit": 0, "retries": 0},
            "first_failure": None,
            "isolation": {"all_consumed_rows_quiescent_before_successor": True, "max_parallel": 1, "serialized": True},
            "run_id": RUN_ID,
            "schema_id": "pw-r9-goal-mode-v13-structural-context-route-canary-controller-terminal-v1",
            "started_at_ms": terminal.get("started_at_ms"),
            "status": "PASS_THREE_ROUTE_V13_STRUCTURAL_GOAL_CONTEXT_TERMINAL_CLOSURE_CANARY_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY",
        },
        "controller terminal",
    )
    require(isinstance(terminal["started_at_ms"], int) and terminal["started_at_ms"] > 0, "controller start")
    attestor = load_attestor(base)
    thread_ids: list[str] = []
    goal_ids: list[str] = []
    turn_ids: list[str] = []
    rows: list[dict[str, Any]] = []
    previous_end = terminal["started_at_ms"]
    goals_path = next(args.codex_home.glob("goals_*.sqlite"))
    state_path = next(args.codex_home.glob("state_*.sqlite"))
    with connect_ro(goals_path) as goals, connect_ro(state_path) as state:
        for index in range(3):
            row_id = f"row-{index:03d}"
            capture = evidence / "rows" / row_id
            require({path.name for path in capture.iterdir()} == EXPECTED_ROW_FILES, f"row inventory:{index}")
            receipt = load(evidence / "controller_results" / f"{row_id}.receipt.json")
            require(
                receipt.get("index") == index
                and receipt.get("row_id") == row_id
                and receipt.get("schema_id") == "pw-r9-goal-mode-v13-structural-context-route-canary-row-process-receipt-v1"
                and receipt.get("status") == "PASS"
                and receipt.get("rc") == 0
                and receipt.get("timed_out") is False
                and receipt.get("process_reaped") is True
                and receipt.get("quiescent_before_next") is True
                and receipt.get("started_at_ms") >= previous_end
                and receipt.get("ended_at_ms") >= receipt.get("started_at_ms"),
                f"row receipt:{index}",
            )
            previous_end = receipt["ended_at_ms"]
            stderr = read_regular(evidence / "controller_results" / f"{row_id}.stderr")
            stdout = read_regular(evidence / "controller_results" / f"{row_id}.stdout")
            require(stderr == b"" and receipt["stderr"] == {"bytes": 0, "sha256": sha(b"")}, f"row stderr:{index}")
            require(receipt["stdout"] == {"bytes": len(stdout), "sha256": sha(stdout)}, f"row stdout identity:{index}")
            harness_result = json.loads(stdout, object_pairs_hook=pairs)
            require(stdout == canon(harness_result) and harness_result.get("status") == "PASS_NATIVE_GOAL_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_ZERO_CREDIT", f"row stdout:{index}")
            row_path = base / "goal_mode_v13_structural_context_terminal_closure_canary_001_inputs" / f"{row_id}.row.json"
            row = load(row_path)
            stored = load(capture / "goal_mode_attestation.json")
            reopened = attestor.attest_final(row_path, capture, args.codex_home)
            require(reopened == stored == harness_result.get("attestation"), f"independent attestation reopen:{index}")
            goal = stored["goal"]
            require(goal.get("status") == "complete" and isinstance(goal.get("thread_id"), str) and isinstance(goal.get("goal_id"), str), f"terminal Goal:{index}")
            require(isinstance(goal.get("turn_ids"), list) and len(goal["turn_ids"]) == 2 and len(set(goal["turn_ids"])) == 2, f"Goal turns:{index}")
            goal_transport = stored["scored"]["goal"].get("goal_action_transport")
            require(goal_transport in {"DIRECT_NATIVE_FUNCTION", "NESTED_CODE_MODE_EXEC"}, f"Goal transport:{index}")
            require(stored["scored"]["goal"] == {"goal_action_transport": goal_transport, "goal_id": goal["goal_id"], "status": "active", "thread_id": goal["thread_id"], "turn_id": goal["turn_ids"][0]}, f"scored active Goal:{index}")
            require(stored["scored"]["transport"] == {"goal_actions": goal_transport, "reader": goal_transport}, f"scored transport:{index}")
            require(stored["closure"]["turn_id"] == goal["turn_ids"][1] and stored["closure"]["goal_actions"] == goal_transport, f"closure Goal:{index}")
            context = stored["closure"]["native_goal_context"]
            require(context.get("contract") == CONTEXT_CONTRACT and context.get("objective_bound") is True and len(context.get("section_offsets", [])) == 7, f"structural Goal context:{index}")
            offsets = [item["offset"] for item in context["section_offsets"]]
            require(offsets == sorted(offsets) and len(set(offsets)) == 7, f"Goal context section order:{index}")
            historical = stored["historical_scored_rollout"]
            require(historical.get("strict_prefix") is True and historical.get("logical_path") == stored["rollout"]["logical_path"] and historical.get("bytes") < stored["rollout"]["bytes"], f"rollout prefix:{index}")
            require(stored["process_accounting"] == {"fresh_tasks": 1, "processes": 2, "resume_operations": 1, "retries": 0, "subject_deliveries": 1}, f"process accounting:{index}")
            require(stored["authority"] == {"external_matrix_qualification_required": True, "qualification_credit": 0}, f"row authority:{index}")
            expected_answer = row["criteria"]["expected_exact_utf8"].encode("utf-8")
            actual_answer = read_regular(capture / "scored_output_last_message.txt")
            require(actual_answer == expected_answer and stored["scored"]["answer"] == {"bytes": len(actual_answer), "sha256": sha(actual_answer)}, f"scored answer:{index}")
            snapshot = load(capture / "prelaunch_snapshot.json")
            require(goal["thread_id"] not in snapshot["thread_ids"] and goal["goal_id"] not in snapshot["goal_ids"], f"fresh prelaunch identity:{index}")
            goal_rows = goals.execute("SELECT * FROM thread_goals WHERE thread_id=?", (goal["thread_id"],)).fetchall()
            require(len(goal_rows) == 1 and goal_rows[0]["goal_id"] == goal["goal_id"] and goal_rows[0]["objective"] == row["objective"] and goal_rows[0]["status"] == "complete", f"Goal DB:{index}")
            thread_rows = state.execute("SELECT * FROM threads WHERE id=?", (goal["thread_id"],)).fetchall()
            require(len(thread_rows) == 1 and thread_rows[0]["rollout_path"].endswith(stored["rollout"]["logical_path"]), f"thread DB:{index}")
            thread_ids.append(goal["thread_id"])
            goal_ids.append(goal["goal_id"])
            turn_ids.extend(goal["turn_ids"])
            rows.append({"goal_id": goal["goal_id"], "index": index, "model": row["model"], "reasoning_effort": row["reasoning_effort"], "row_id": row_id, "status": "PASS", "thread_id": goal["thread_id"], "turn_ids": goal["turn_ids"]})
    require(len(set(thread_ids)) == 3 and len(set(goal_ids)) == 3 and len(set(turn_ids)) == 6, "cross-row fresh identities")
    after = inventory(evidence)
    require(after == before, "evidence inventory drift")
    return {
        "authority": {"canary_pass": True, "matrix_harness_work": True, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False},
        "checks": {
            "cross_row_unique_goal_ids": len(set(goal_ids)),
            "cross_row_unique_thread_ids": len(set(thread_ids)),
            "cross_row_unique_turn_ids": len(set(turn_ids)),
            "evidence_inventory": {key: before[key] for key in ("aggregate_file_bytes", "directories", "files", "projection_bytes", "projection_sha256")},
            "independent_attestation_reopen": "PASS_3_OF_3_EXACT",
            "qualification_credit": 0,
            "rows": rows,
            "structural_goal_context": "PASS_3_OF_3",
        },
        "first_mismatch": None,
        "lineage": {"matrix_005": "PERMANENT_FAIL_ZERO_CREDIT", "matrix_006": "INVALIDATED_NO_LAUNCH_AUTHORITY", "v10_canary": "PERMANENT_FAIL_ZERO_CREDIT", "v11_canary": "PERMANENT_FAIL_ZERO_CREDIT", "v12_canary": "PERMANENT_FAIL_ZERO_CREDIT"},
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False, "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED"},
        "run_id": RUN_ID,
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_RUNTIME_VERIFY_V13_THREE_ROUTE_NATIVE_GOAL_STRUCTURAL_CONTEXT_CANARY_ZERO_CREDIT_MATRIX_HARNESS_WORK_ONLY",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--evidence", type=Path, required=True)
    parser.add_argument("--codex-home", type=Path, required=True)
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    try:
        require(args.verify and args.base.is_absolute() and args.evidence.is_absolute() and args.codex_home.is_absolute(), "CLI")
        result, rc = verify(args), 0
    except (Invalid, OSError, UnicodeError, sqlite3.Error, json.JSONDecodeError) as exc:
        result = {"authority": {"matrix_launch": False, "qualification_credit": 0}, "error": str(exc), "first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_RETRY"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
