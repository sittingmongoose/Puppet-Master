#!/usr/bin/env python3
"""Read-only independent reopen of the once-only V19 three-turn Goal canary."""

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


SCHEMA = "pw-r9-goal-mode-v19-three-turn-route-canary-independent-runtime-verification-v1"
RUN_ID = "goal-mode-v19-three-turn-canary-001"
ROW_RESULT_SCHEMA = "pw-r9-goal-mode-v19-row-result-v1"
ROW_RESULT_STATUS = "PASS_THREE_TURN_SAME_TASK_NATIVE_GOAL_SUBJECT_FREE_ACTIVATION_SCORED_RESUME_TERMINAL_CLOSURE_ZERO_CREDIT"
ATTESTATION_STATUS = "PASS_THREE_TURN_SAME_TASK_NATIVE_GOAL_SUBJECT_GATED_TERMINAL_CLOSURE_ZERO_CREDIT"
BOUND = (
    ("r9_goal_mode_v19_three_turn_route_canary_controller_v1.py", 29786, "14d9da404f554cf8fc7e6120cb412e76c3af688f3d4e4b33ffd2418b956399b5"),
    ("goal_mode_v19_three_turn_canary_001_inputs/manifest.json", 4721, "1123ef30405a4e8bc7f72080976c5c4aed08ff214d627312e7dbbf15856198b8"),
    ("goal_mode_empirical_harness_v19/goal_mode_contract.json", 2630, "2b4a69afe158c81591fad07e57ec49134a07f9cffb50465843a086b06a658997"),
    ("goal_mode_empirical_harness_v19/goal_mode_harness.py", 19255, "8e00162e0465dc43237ef9acfff96400c822f880164eb90589ae7bea988cfbeb"),
    ("goal_mode_empirical_harness_v19/goal_mode_three_turn_attestor.py", 24432, "22e2003a38a3ad5cb163d7d5c3ea2f04b06876b5864463d30d19f7b8bb8f31d2"),
    ("r9_goal_mode_v19_closed_runtime_module_contract_successor_design_v1.json", 1737, "fefe1912a56d39121eeb3726136770306f4b7671433507c89f4d23428a4a90fc"),
    ("r9_goal_mode_v18_three_turn_canary_001_runtime_failure_receipt_v1.json", 4269, "db1acb3b4a5e9f7803b72de55249890bf67ad873a7da9978f8796574b3c17d6f"),
    ("r9_goal_mode_per_test_taker_binding_correction_v2.json", 5976, "6c846d9cfe24b3e199f96ed3ea6829d631091284b636c5ac11ee0a7dd12d06f8"),
    ("r9_goal_mode_omp_windows_transport_clarification_v3.json", 1440, "a8b5fc0d064dabe923b9ea6072c8a4b7b663d14133c4334b8dcc98e5a1d185e2"),
    ("r9_goal_mode_harness_v19_independent_static_review_v1.json", 7221, "972b16e57cb18ec3535f39e91fc9cfc91ed254a57276403eb18f8c9940f8ac68"),
)
EXPECTED_ROW_FILES = {
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
    require(
        (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
        == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
        and len(raw) == before.st_size,
        f"changing file:{path}",
    )
    return raw


def load(path: Path, limit: int = 128_000_000) -> Any:
    raw = read_regular(path, limit)
    require(raw.endswith(b"\n") and not raw.endswith(b"\n\n") and b"\r" not in raw and b"\x00" not in raw, f"JSON framing:{path}")
    try:
        value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise Invalid(f"JSON:{path}:{exc}") from exc
    require(raw == canon(value), f"noncanonical:{path}")
    return value


def identity(path: Path, label: str | None = None) -> dict[str, Any]:
    raw = read_regular(path)
    return {"bytes": len(raw), "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}", "path": label or path.name, "sha256": sha(raw)}


def inventory(root: Path) -> dict[str, Any]:
    require(root.is_absolute() and root.is_dir() and not root.is_symlink(), "evidence root")
    rows: list[dict[str, Any]] = []
    directories = 0
    for path in sorted(root.rglob("*"), key=lambda item: item.relative_to(root).as_posix()):
        st = os.lstat(path)
        require(not stat.S_ISLNK(st.st_mode), f"symlink:{path}")
        if stat.S_ISDIR(st.st_mode):
            require(stat.S_IMODE(st.st_mode) == 0o700, f"directory mode:{path}")
            directories += 1
            continue
        require(stat.S_ISREG(st.st_mode) and stat.S_IMODE(st.st_mode) == 0o600, f"file custody:{path}")
        raw = read_regular(path)
        rows.append({"bytes": len(raw), "mode": "0600", "path": path.relative_to(root).as_posix(), "sha256": sha(raw)})
    projection = canon(rows, newline=False)
    return {
        "aggregate_file_bytes": sum(row["bytes"] for row in rows),
        "directories": directories,
        "files": len(rows),
        "projection_bytes": len(projection),
        "projection_sha256": sha(projection),
        "rows": rows,
    }


def load_attestor(base: Path) -> Any:
    path = base / "goal_mode_empirical_harness_v19" / "goal_mode_three_turn_attestor.py"
    spec = importlib.util.spec_from_file_location("_r9_v19_runtime_reopen_attestor", path)
    require(spec is not None and spec.loader is not None, "attestor loader")
    module = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(path.parent))
    spec.loader.exec_module(module)
    return module


def connect_ro(path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=5)
    connection.row_factory = sqlite3.Row
    return connection


def verify_sources(base: Path) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for relative, size, digest in BOUND:
        path = base / relative
        item = identity(path, relative)
        require(item == {"bytes": size, "mode": "0644", "path": relative, "sha256": digest}, f"source identity:{relative}")
        result.append(item)
    return result


def verify(args: argparse.Namespace) -> dict[str, Any]:
    sources = verify_sources(args.base)
    before = inventory(args.evidence)
    require(before["files"] == 88 and before["directories"] == 5, "evidence cardinality")
    require({path.name for path in (args.evidence / "controller_results").iterdir()} == {f"row-{index:03d}.{suffix}" for index in range(3) for suffix in ("receipt.json", "stderr", "stdout")}, "controller results inventory")
    require({path.name for path in (args.evidence / "rows").iterdir()} == {f"row-{index:03d}" for index in range(3)}, "row directory inventory")
    terminal = load(args.evidence / "controller_terminal.json")
    require(
        terminal
        == {
            "accounting": {"aborted_unlaunched": 0, "consumed": 3, "failed": 0, "passed": 3, "planned": 3, "qualification_credit": 0, "retries": 0},
            "first_failure": None,
            "isolation": {"all_consumed_rows_quiescent_before_successor": True, "max_parallel": 1, "serialized": True},
            "pre_model_runtime_preflight": {
                "runtime_api_missing": [],
                "schema_id": "pw-r9-goal-mode-v19-runtime-module-wiring-preflight-v1",
                "status": "PASS_READ_ONLY_PRE_MODEL_RUNTIME_WIRING_ZERO_CREDIT_NO_LAUNCH",
                "validated_rows": 3,
            },
            "run_id": RUN_ID,
            "schema_id": "pw-r9-goal-mode-v19-three-turn-route-canary-controller-terminal-v1",
            "started_at_ms": terminal.get("started_at_ms"),
            "status": "PASS_THREE_ROUTE_V19_THREE_TURN_NATIVE_GOAL_CANARY_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY",
        },
        "controller terminal",
    )
    require(isinstance(terminal["started_at_ms"], int) and terminal["started_at_ms"] > 0, "controller start")
    attestor = load_attestor(args.base)
    thread_ids: list[str] = []
    goal_ids: list[str] = []
    turn_ids: list[str] = []
    row_results: list[dict[str, Any]] = []
    previous_end = terminal["started_at_ms"]
    goals_path = attestor.base._db_path(args.codex_home, "goals")
    state_path = attestor.base._db_path(args.codex_home, "state")
    with connect_ro(goals_path) as goals, connect_ro(state_path) as state:
        for index in range(3):
            row_id = f"row-{index:03d}"
            capture = args.evidence / "rows" / row_id
            require({path.name for path in capture.iterdir()} == EXPECTED_ROW_FILES, f"row inventory:{index}")
            receipt = load(args.evidence / "controller_results" / f"{row_id}.receipt.json")
            require(
                receipt.get("index") == index
                and receipt.get("row_id") == row_id
                and receipt.get("schema_id") == "pw-r9-goal-mode-v19-three-turn-route-canary-row-process-receipt-v1"
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
            stderr = read_regular(args.evidence / "controller_results" / f"{row_id}.stderr")
            stdout = read_regular(args.evidence / "controller_results" / f"{row_id}.stdout")
            require(stderr == b"" and receipt["stderr"] == {"bytes": 0, "sha256": sha(b"")}, f"row stderr:{index}")
            require(receipt["stdout"] == {"bytes": len(stdout), "sha256": sha(stdout)}, f"row stdout identity:{index}")
            harness_result = json.loads(stdout, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
            require(stdout == canon(harness_result), f"row stdout canonical:{index}")
            require(harness_result.get("schema_id") == ROW_RESULT_SCHEMA and harness_result.get("status") == ROW_RESULT_STATUS, f"row stdout:{index}")
            row_path = args.base / "goal_mode_v19_three_turn_canary_001_inputs" / f"{row_id}.row.json"
            row = load(row_path)
            stored = load(capture / "goal_mode_attestation.json")
            reopened = attestor.reopen_final(row_path, capture, args.codex_home)
            require(reopened == stored == harness_result.get("attestation"), f"independent attestation reopen:{index}")
            goal = stored["goal"]
            require(goal.get("status") == "complete" and isinstance(goal.get("thread_id"), str) and isinstance(goal.get("goal_id"), str), f"terminal Goal:{index}")
            require(isinstance(goal.get("turn_ids"), list) and len(goal["turn_ids"]) == 3 and len(set(goal["turn_ids"])) == 3, f"Goal turns:{index}")
            require(stored.get("process_accounting") == {"fresh_tasks": 1, "processes": 3, "resume_operations": 2, "retries": 0, "subject_deliveries": 1}, f"process accounting:{index}")
            require(stored.get("authority") == {"external_matrix_qualification_required": True, "qualification_credit": 0}, f"row authority:{index}")
            require(stored.get("bootstrap", {}).get("goal", {}).get("status") == "active", f"bootstrap Goal:{index}")
            require(
                stored["bootstrap"]["goal"].get("goal_action_transport") in {"DIRECT_NATIVE_FUNCTION", "NESTED_CODE_EXACT_ORDERED_BATCH"}
                and stored.get("closure", {}).get("goal_actions") in {"DIRECT_NATIVE_FUNCTION", "NESTED_CODE_EXACT_ORDERED_BATCH"},
                f"Goal action transport:{index}",
            )
            require(stored.get("scored", {}).get("goal", {}).get("status") == "active", f"scored Goal:{index}")
            require(isinstance(stored.get("scored", {}).get("reader_output_line"), int), f"scored reader output:{index}")
            require(
                stored["bootstrap"]["goal"].get("goal_id_source") == "READ_ONLY_CODEX_GOALS_DATABASE_THREAD_GOALS.GOAL_ID"
                and stored["bootstrap"]["goal"].get("native_projection_identity_field") == "threadId",
                f"bootstrap Goal identity sources:{index}",
            )
            require(stored["bootstrap"]["goal"]["thread_id"] == stored["scored"]["goal"]["thread_id"] == goal["thread_id"], f"same task:{index}")
            require(stored["bootstrap"]["goal"]["goal_id"] == stored["scored"]["goal"]["goal_id"] == goal["goal_id"], f"same Goal:{index}")
            require(stored["bootstrap"]["goal"]["turn_id"] == goal["turn_ids"][0] and stored["scored"]["goal"]["turn_id"] == goal["turn_ids"][1] and stored["closure"]["turn_id"] == goal["turn_ids"][2], f"turn order:{index}")
            context = stored["scored"]["native_goal_context"]
            require(context.get("contract") == attestor.CONTEXT_CONTRACT and context.get("objective_bound") is True, f"scored structural Goal context:{index}")
            closure_context = stored["closure"]["native_goal_context"]
            require(closure_context.get("contract") == attestor.CONTEXT_CONTRACT and closure_context.get("objective_bound") is True, f"closure structural Goal context:{index}")
            historical = stored["historical_scored_rollout"]
            require(historical.get("strict_prefix") is True and historical.get("logical_path") == stored["rollout"]["logical_path"] and historical.get("bytes") < stored["rollout"]["bytes"], f"rollout prefix:{index}")
            expected_answer = row["criteria"]["expected_exact_utf8"].encode("utf-8")
            actual_answer = read_regular(capture / "scored_output_last_message.txt")
            require(actual_answer == expected_answer and stored["scored"]["answer"] == {"bytes": len(actual_answer), "sha256": sha(actual_answer)}, f"scored answer:{index}")
            snapshot = load(capture / "prelaunch_snapshot.json")
            require(goal["thread_id"] not in snapshot["thread_ids"] and goal["goal_id"] not in snapshot["goal_ids"], f"fresh prelaunch identity:{index}")
            goal_rows = goals.execute("SELECT * FROM thread_goals WHERE thread_id=?", (goal["thread_id"],)).fetchall()
            require(len(goal_rows) == 1 and goal_rows[0]["goal_id"] == goal["goal_id"] and goal_rows[0]["objective"] == row["objective"] and goal_rows[0]["status"] == "complete", f"Goal DB:{index}")
            thread_rows = state.execute("SELECT * FROM threads WHERE id=?", (goal["thread_id"],)).fetchall()
            require(len(thread_rows) == 1 and thread_rows[0]["rollout_path"].endswith(stored["rollout"]["logical_path"]), f"thread DB:{index}")
            classification = harness_result.get("stderr_classification")
            require(
                isinstance(classification, dict)
                and classification.get("status") == "PASS_EXACT_THREE_PHASE_STDERR_CLASSIFICATIONS_AFTER_FULL_ATTESTATION"
                and all(classification.get(phase, {}).get("accepted") is True for phase in ("bootstrap", "scored", "closure")),
                f"stderr classification:{index}",
            )
            thread_ids.append(goal["thread_id"])
            goal_ids.append(goal["goal_id"])
            turn_ids.extend(goal["turn_ids"])
            row_results.append({"goal_id": goal["goal_id"], "index": index, "model": row["model"], "reasoning_effort": row["reasoning_effort"], "row_id": row_id, "status": "PASS", "thread_id": goal["thread_id"], "turn_ids": goal["turn_ids"]})
    require(len(set(thread_ids)) == 3 and len(set(goal_ids)) == 3 and len(set(turn_ids)) == 9, "cross-row fresh identities")
    after = inventory(args.evidence)
    require(after == before, "evidence inventory drift")
    return {
        "authority": {"canary_pass": True, "matrix_harness_work": True, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False},
        "checks": {
            "cross_row_unique_goal_ids": len(set(goal_ids)),
            "cross_row_unique_thread_ids": len(set(thread_ids)),
            "cross_row_unique_turn_ids": len(set(turn_ids)),
            "evidence_inventory": {key: before[key] for key in ("aggregate_file_bytes", "directories", "files", "projection_bytes", "projection_sha256")},
            "goal_action_transport": "PASS_DIRECT_OR_EXACT_ORDERED_BATCH_3_OF_3",
            "independent_attestation_reopen": "PASS_PURE_SEALED_REOPEN_3_OF_3_EXACT",
            "pre_model_runtime_preflight": "PASS_EXECUTED_BEFORE_EVIDENCE_ROOT_3_ROWS",
            "qualification_credit": 0,
            "rows": row_results,
            "subject_free_activation_before_subject": "PASS_3_OF_3",
            "three_turn_goal_lifecycle": "PASS_3_OF_3",
        },
        "first_mismatch": None,
        "lineage": {"prior_non_goal_architectures": "DIAGNOSTIC_ONLY_ZERO_CREDIT", "qualification_streak_clean_matrices": 0, "v14_matrix_001": "PERMANENT_FAIL_ZERO_CREDIT", "v15_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY", "v16_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY", "v17_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY", "v18_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY"},
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False, "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED"},
        "run_id": RUN_ID,
        "schema_id": SCHEMA,
        "sources": sources,
        "status": "PASS_INDEPENDENT_RUNTIME_VERIFY_V19_THREE_ROUTE_THREE_TURN_NATIVE_GOAL_CANARY_ZERO_CREDIT_MATRIX_HARNESS_WORK_ONLY",
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
