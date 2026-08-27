#!/usr/bin/env python3
"""Read-only independent verifier for V14 Goal-per-test-taker matrices 001/002."""

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


SCHEMA = "pw-r9-goal-mode-v14-structural-context-matrix-independent-runtime-verification-v1"
BASE = Path(__file__).resolve().parent
MATRIX_IDS = (
    "goal-mode-v14-structural-context-matrix-001",
    "goal-mode-v14-structural-context-matrix-002",
)
ROW_COUNT = 291
PAIR_ROOT = BASE / "goal_mode_v14_structural_context_matrix_pair_001_002_inputs_v1"
MANIFEST = PAIR_ROOT / "manifest.json"
MANIFEST_SHA256 = "5b2901787502545e94fef87b358416989c9ee41390f4bf11789604ec66eb4cc0"
MANIFEST_BYTES = 522058
CONTROLLER = BASE / "r9_goal_mode_v14_structural_context_matrix_controller_v1.py"
CONTROLLER_SHA256 = "e1831e003217d138b6a83a24e3d57687a18a48e17852986f8186e33686945b13"
CONTROLLER_BYTES = 17713
HARNESS = BASE / "goal_mode_empirical_harness_v14" / "goal_mode_harness.py"
HARNESS_SHA256 = "c0f147659ea0dc34bd2c8daf69fca6e51fba2396558312cad71b0bd51dbca3d4"
HARNESS_BYTES = 10096
ATTESTOR = BASE / "goal_mode_empirical_harness_v13" / "goal_mode_terminal_closure_attestor.py"
ATTESTOR_SHA256 = "39e3ad541ae7522bd704418185811b0a511e9ea9b9cd72e3636a420dcaa14056"
ATTESTOR_BYTES = 7121
CANARY_RECEIPT = BASE / "r9_goal_mode_v13_structural_context_terminal_closure_canary_001_success_receipt_v1.json"
MATRIX_001_RECEIPT = BASE / "r9_goal_mode_v14_structural_context_matrix_001_success_receipt_v1.json"
MATRIX_001_EVIDENCE = BASE / "goal_mode_v14_structural_context_matrix_001_evidence"
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


def file_identity(label: str, path: Path, limit: int = 256_000_000) -> dict[str, Any]:
    raw = read_regular(path, limit)
    return {"bytes": len(raw), "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}", "path": label, "sha256": sha(raw)}


def inventory(root: Path) -> dict[str, Any]:
    require(root.is_absolute() and root.is_dir() and not root.is_symlink() and stat.S_IMODE(os.lstat(root).st_mode) == 0o700, "evidence root")
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


def inventory_summary(value: dict[str, Any]) -> dict[str, Any]:
    return {key: value[key] for key in ("aggregate_file_bytes", "directories", "files", "projection_bytes", "projection_sha256")}


def load_attestor() -> Any:
    raw = read_regular(ATTESTOR)
    require(len(raw) == ATTESTOR_BYTES and sha(raw) == ATTESTOR_SHA256 and stat.S_IMODE(os.lstat(ATTESTOR).st_mode) == 0o644, "attestor identity")
    spec = importlib.util.spec_from_file_location("_r9_v14_matrix_runtime_reopen_attestor", ATTESTOR)
    require(spec is not None and spec.loader is not None, "attestor loader")
    module = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(ATTESTOR.parent))
    spec.loader.exec_module(module)
    return module


def connect_ro(path: Path) -> sqlite3.Connection:
    con = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=5)
    con.row_factory = sqlite3.Row
    return con


def manifest_matrix(manifest: dict[str, Any], matrix_id: str) -> dict[str, Any]:
    values = [item for item in manifest["matrices"] if item.get("matrix_id") == matrix_id]
    require(len(values) == 1, "matrix manifest cardinality")
    matrix = values[0]
    require(matrix.get("row_count") == ROW_COUNT and len(matrix.get("rows", [])) == ROW_COUNT, "matrix row count")
    return matrix


def source_preflight() -> dict[str, Any]:
    controller = read_regular(CONTROLLER)
    harness = read_regular(HARNESS)
    manifest_raw = read_regular(MANIFEST)
    require(len(controller) == CONTROLLER_BYTES and sha(controller) == CONTROLLER_SHA256 and stat.S_IMODE(os.lstat(CONTROLLER).st_mode) == 0o644, "controller identity")
    require(len(harness) == HARNESS_BYTES and sha(harness) == HARNESS_SHA256 and stat.S_IMODE(os.lstat(HARNESS).st_mode) == 0o644, "harness identity")
    require(len(manifest_raw) == MANIFEST_BYTES and sha(manifest_raw) == MANIFEST_SHA256 and stat.S_IMODE(os.lstat(MANIFEST).st_mode) == 0o644, "manifest identity")
    manifest = load(MANIFEST)
    require(
        manifest.get("schema_id") == "pw-r9-goal-mode-v14-structural-context-matrix-pair-input-manifest-v1"
        and manifest.get("pair_order") == list(MATRIX_IDS)
        and manifest.get("architecture") == "V14_SERIAL_FRESH_TASK_FRESH_NATIVE_GOAL_SAME_TASK_TERMINAL_CLOSURE_STRUCTURAL_CONTEXT",
        "manifest schema/architecture",
    )
    require(manifest.get("authority") == {"matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False}, "manifest authority")
    for matrix_id in MATRIX_IDS:
        matrix = manifest_matrix(manifest, matrix_id)
        require(len({row["row_spec"]["sha256"] for row in matrix["rows"]}) == ROW_COUNT, "row spec uniqueness")
    return manifest


def add_attestation_identities(attestation: dict[str, Any], threads: set[str], goals: set[str], turns: set[str]) -> None:
    goal = attestation.get("goal")
    require(isinstance(goal, dict), "prior Goal")
    thread_id = goal.get("thread_id")
    goal_id = goal.get("goal_id")
    turn_ids = goal.get("turn_ids")
    require(isinstance(thread_id, str) and isinstance(goal_id, str) and isinstance(turn_ids, list) and len(turn_ids) == 2 and all(isinstance(item, str) for item in turn_ids), "prior identities")
    require(thread_id not in threads and goal_id not in goals and not (set(turn_ids) & turns), "prior identity collision")
    threads.add(thread_id)
    goals.add(goal_id)
    turns.update(turn_ids)


def prior_identities(matrix_id: str) -> tuple[set[str], set[str], set[str], dict[str, Any]]:
    threads: set[str] = set()
    goals: set[str] = set()
    turns: set[str] = set()
    canary = load(CANARY_RECEIPT, 32_000_000)
    require(canary.get("status") == "PASS_V13_THREE_ROUTE_NATIVE_GOAL_STRUCTURAL_CONTEXT_CANARY_ZERO_CREDIT_MATRIX_HARNESS_WORK_ONLY" and len(canary.get("rows", [])) == 3, "canary predecessor")
    for row in canary["rows"]:
        reference = row.get("attestation")
        require(isinstance(reference, dict) and set(reference) == {"bytes", "mode", "path", "sha256"}, "canary attestation reference")
        path = BASE / reference["path"]
        require(file_identity(reference["path"], path) == reference, "canary attestation identity")
        add_attestation_identities(load(path), threads, goals, turns)
    predecessor: dict[str, Any] = {"identity": file_identity(CANARY_RECEIPT.name, CANARY_RECEIPT), "status": canary["status"]}
    if matrix_id == MATRIX_IDS[1]:
        receipt = load(MATRIX_001_RECEIPT, 256_000_000)
        require(receipt.get("status") == "PASS_CLEAN_FULL_V14_STRUCTURAL_CONTEXT_NATIVE_GOAL_MATRIX_STREAK_1_OF_2_ZERO_QUALIFICATION_CREDIT" and receipt.get("matrix_id") == MATRIX_IDS[0], "Matrix001 predecessor")
        prior_inventory = inventory(MATRIX_001_EVIDENCE)
        require(receipt.get("evidence") == {"path": MATRIX_001_EVIDENCE.name, **inventory_summary(prior_inventory)}, "Matrix001 evidence binding")
        prior_rows = MATRIX_001_EVIDENCE / "rows"
        require({path.name for path in prior_rows.iterdir()} == {f"row-{index:03d}" for index in range(ROW_COUNT)}, "Matrix001 rows")
        for index in range(ROW_COUNT):
            add_attestation_identities(load(prior_rows / f"row-{index:03d}" / "goal_mode_attestation.json"), threads, goals, turns)
        predecessor = {"identity": file_identity(MATRIX_001_RECEIPT.name, MATRIX_001_RECEIPT), "status": receipt["status"]}
    return threads, goals, turns, predecessor


def verify(matrix_id: str, evidence: Path, codex_home: Path) -> dict[str, Any]:
    require(matrix_id in MATRIX_IDS, "matrix id")
    manifest = source_preflight()
    matrix = manifest_matrix(manifest, matrix_id)
    before = inventory(evidence)
    require(before["files"] == 6403 and before["directories"] == 293, "evidence cardinality")
    controller_results = evidence / "controller_results"
    rows_root = evidence / "rows"
    require({path.name for path in controller_results.iterdir()} == {f"row-{index:03d}.{suffix}" for index in range(ROW_COUNT) for suffix in ("receipt.json", "stderr", "stdout")}, "controller result inventory")
    require({path.name for path in rows_root.iterdir()} == {f"row-{index:03d}" for index in range(ROW_COUNT)}, "row directory inventory")
    terminal = load(evidence / "matrix_terminal.json")
    require(
        terminal
        == {
            "accounting": {"aborted_unlaunched": 0, "consumed": ROW_COUNT, "failed": 0, "passed": ROW_COUNT, "planned": ROW_COUNT, "qualification_credit": 0, "retries": 0},
            "first_failure": None,
            "isolation": {"all_consumed_rows_quiescent_before_successor": True, "max_parallel": 1, "serialized": True},
            "matrix_id": matrix_id,
            "schema_id": "pw-r9-goal-mode-v14-structural-context-matrix-controller-terminal-v1",
            "started_at_ms": terminal.get("started_at_ms"),
            "status": "PASS_ALL_ROWS_V14_STRUCTURAL_CONTEXT_NATIVE_GOALS_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY",
        },
        "matrix terminal",
    )
    require(isinstance(terminal["started_at_ms"], int) and terminal["started_at_ms"] > 0, "matrix start")
    attestor = load_attestor()
    prior_threads, prior_goals, prior_turns, predecessor = prior_identities(matrix_id)
    current_threads: set[str] = set()
    current_goals: set[str] = set()
    current_turns: set[str] = set()
    row_summaries: list[dict[str, Any]] = []
    row_capture_projections: list[dict[str, Any]] = []
    previous_end = terminal["started_at_ms"]
    goal_databases = list(codex_home.glob("goals_*.sqlite"))
    state_databases = list(codex_home.glob("state_*.sqlite"))
    require(len(goal_databases) == 1 and len(state_databases) == 1, "Codex databases")
    with connect_ro(goal_databases[0]) as goals_db, connect_ro(state_databases[0]) as state_db:
        for index, item in enumerate(matrix["rows"]):
            row_id = f"row-{index:03d}"
            require(item.get("index") == index and item.get("row_id") == row_id, f"row order:{index}")
            row_path = PAIR_ROOT / item["row_spec"]["path"]
            subject_path = PAIR_ROOT / item["subject"]["path"]
            admission_path = PAIR_ROOT / item["admission"]["path"]
            for label, path in (("row_spec", row_path), ("subject", subject_path), ("admission", admission_path)):
                raw = read_regular(path, 16_000_000)
                reference = item[label]
                require(len(raw) == reference["bytes"] and sha(raw) == reference["sha256"] and stat.S_IMODE(os.lstat(path).st_mode) == 0o644, f"input identity:{index}:{label}")
            row = load(row_path, 4_000_000)
            control = row.get("control_envelope")
            require(
                row.get("run_id") == matrix_id
                and row.get("row_id") == row_id
                and row.get("model") == item["model"]
                and row.get("reasoning_effort") == item["reasoning_effort"]
                and isinstance(control, dict)
                and control.get("matrix") is True
                and control.get("full_matrix") is True
                and control.get("goal_mode_required") is True
                and control.get("max_parallel") == 1
                and control.get("serialized") is True
                and control.get("qualification_credit") == 0,
                f"row authority:{index}",
            )
            capture = rows_root / row_id
            require({path.name for path in capture.iterdir()} == EXPECTED_ROW_FILES, f"row inventory:{index}")
            receipt = load(controller_results / f"{row_id}.receipt.json")
            require(
                receipt.get("index") == index
                and receipt.get("row_id") == row_id
                and receipt.get("schema_id") == "pw-r9-goal-mode-v14-structural-context-matrix-row-process-receipt-v1"
                and receipt.get("status") == "PASS"
                and receipt.get("rc") == 0
                and receipt.get("timed_out") is False
                and receipt.get("process_reaped") is True
                and receipt.get("quiescent_before_next") is True
                and isinstance(receipt.get("started_at_ms"), int)
                and receipt.get("started_at_ms") >= previous_end
                and isinstance(receipt.get("ended_at_ms"), int)
                and receipt.get("ended_at_ms") >= receipt.get("started_at_ms"),
                f"row receipt:{index}",
            )
            previous_end = receipt["ended_at_ms"]
            stderr = read_regular(controller_results / f"{row_id}.stderr")
            stdout = read_regular(controller_results / f"{row_id}.stdout")
            require(stderr == b"" and receipt["stderr"] == {"bytes": 0, "sha256": sha(b"")}, f"row stderr:{index}")
            require(receipt["stdout"] == {"bytes": len(stdout), "sha256": sha(stdout)}, f"row stdout identity:{index}")
            harness_result = json.loads(stdout, object_pairs_hook=pairs)
            require(stdout == canon(harness_result), f"row stdout canonical:{index}")
            require(
                harness_result.get("schema_id") == "pw-r9-goal-mode-v14-matrix-row-result-v1"
                and harness_result.get("status") == "PASS_NATIVE_GOAL_MATRIX_ROW_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_ZERO_CREDIT",
                f"row result:{index}",
            )
            classification = harness_result.get("stderr_classification")
            require(
                isinstance(classification, dict)
                and classification.get("status") == "PASS_EXACT_PHASE_STDERR_CLASSIFICATIONS_AFTER_FULL_ATTESTATION"
                and classification.get("scored", {}).get("accepted") is True
                and classification.get("closure", {}).get("accepted") is True,
                f"stderr classification:{index}",
            )
            stored = load(capture / "goal_mode_attestation.json")
            reopened = attestor.attest_final(row_path, capture, codex_home)
            require(reopened == stored == harness_result.get("attestation"), f"independent attestation reopen:{index}")
            require(stored.get("status") == "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_ZERO_CREDIT", f"attestation status:{index}")
            goal = stored["goal"]
            thread_id = goal.get("thread_id")
            goal_id = goal.get("goal_id")
            turn_ids = goal.get("turn_ids")
            require(
                goal.get("status") == "complete"
                and isinstance(thread_id, str)
                and isinstance(goal_id, str)
                and isinstance(turn_ids, list)
                and len(turn_ids) == 2
                and len(set(turn_ids)) == 2
                and all(isinstance(item, str) for item in turn_ids),
                f"terminal Goal:{index}",
            )
            require(thread_id not in prior_threads | current_threads and goal_id not in prior_goals | current_goals and not (set(turn_ids) & (prior_turns | current_turns)), f"fresh global identity:{index}")
            goal_transport = stored["scored"]["goal"].get("goal_action_transport")
            require(goal_transport in {"DIRECT_NATIVE_FUNCTION", "NESTED_CODE_MODE_EXEC"}, f"Goal transport:{index}")
            require(stored["scored"]["goal"] == {"goal_action_transport": goal_transport, "goal_id": goal_id, "status": "active", "thread_id": thread_id, "turn_id": turn_ids[0]}, f"scored active Goal:{index}")
            require(stored["scored"]["transport"] == {"goal_actions": goal_transport, "reader": goal_transport}, f"scored transport:{index}")
            require(stored["closure"]["turn_id"] == turn_ids[1] and stored["closure"]["goal_actions"] == goal_transport, f"closure Goal:{index}")
            context = stored["closure"]["native_goal_context"]
            require(context.get("contract") == CONTEXT_CONTRACT and context.get("objective_bound") is True and len(context.get("section_offsets", [])) == 7, f"structural Goal context:{index}")
            offsets = [entry["offset"] for entry in context["section_offsets"]]
            require(offsets == sorted(offsets) and len(set(offsets)) == 7, f"Goal context order:{index}")
            historical = stored["historical_scored_rollout"]
            require(historical.get("strict_prefix") is True and historical.get("logical_path") == stored["rollout"]["logical_path"] and historical.get("bytes") < stored["rollout"]["bytes"], f"rollout prefix:{index}")
            require(stored["process_accounting"] == {"fresh_tasks": 1, "processes": 2, "resume_operations": 1, "retries": 0, "subject_deliveries": 1}, f"process accounting:{index}")
            require(stored["authority"] == {"external_matrix_qualification_required": True, "qualification_credit": 0}, f"row authority:{index}")
            expected_answer = row["criteria"]["expected_exact_utf8"].encode("utf-8")
            actual_answer = read_regular(capture / "scored_output_last_message.txt", 16_000_000)
            require(actual_answer == expected_answer and stored["scored"]["answer"] == {"bytes": len(actual_answer), "sha256": sha(actual_answer)}, f"scored answer:{index}")
            subject = read_regular(subject_path, 16_000_000)
            require(read_regular(capture / "subject_input.txt", 16_000_000) == subject, f"subject fidelity:{index}")
            snapshot = load(capture / "prelaunch_snapshot.json", 256_000_000)
            require(thread_id not in snapshot["thread_ids"] and goal_id not in snapshot["goal_ids"], f"fresh prelaunch identity:{index}")
            goal_rows = goals_db.execute("SELECT * FROM thread_goals WHERE thread_id=?", (thread_id,)).fetchall()
            require(len(goal_rows) == 1 and goal_rows[0]["goal_id"] == goal_id and goal_rows[0]["objective"] == row["objective"] and goal_rows[0]["status"] == "complete", f"Goal DB:{index}")
            thread_rows = state_db.execute("SELECT * FROM threads WHERE id=?", (thread_id,)).fetchall()
            require(len(thread_rows) == 1 and thread_rows[0]["rollout_path"].endswith(stored["rollout"]["logical_path"]), f"thread DB:{index}")
            current_threads.add(thread_id)
            current_goals.add(goal_id)
            current_turns.update(turn_ids)
            capture_files = [file_identity(path.name, path) for path in sorted(capture.iterdir(), key=lambda path: path.name)]
            capture_projection = canon(capture_files, newline=False)
            row_capture_projections.append({"bytes": len(capture_projection), "index": index, "sha256": sha(capture_projection)})
            row_summaries.append({
                "answer": {"bytes": len(expected_answer), "sha256": sha(expected_answer)},
                "goal_action_transport": goal_transport,
                "goal_id": goal_id,
                "index": index,
                "model": row["model"],
                "reasoning_effort": row["reasoning_effort"],
                "row_id": row_id,
                "status": "PASS",
                "thread_id": thread_id,
                "turn_ids": turn_ids,
            })
    require(len(current_threads) == ROW_COUNT and len(current_goals) == ROW_COUNT and len(current_turns) == ROW_COUNT * 2, "current identity cardinality")
    after = inventory(evidence)
    require(after == before, "evidence inventory drift")
    row_projection = canon(row_capture_projections, newline=False)
    streak = 1 if matrix_id == MATRIX_IDS[0] else 2
    qualification_credit = 0 if streak == 1 else 2
    status_value = "PASS_CLEAN_FULL_V14_STRUCTURAL_CONTEXT_NATIVE_GOAL_MATRIX_STREAK_1_OF_2_ZERO_QUALIFICATION_CREDIT" if streak == 1 else "PASS_CLEAN_FULL_V14_STRUCTURAL_CONTEXT_NATIVE_GOAL_MATRIX_STREAK_2_OF_2_QUALIFICATION_CREDIT_2_OF_2"
    return {
        "authority": {
            "matrix_002_admission_candidate": streak == 1,
            "qualification_candidate": streak == 2,
            "qualification_credit": qualification_credit,
            "qualification_streak_clean_matrices": streak,
            "release": False,
        },
        "evidence": {"path": evidence.name, **inventory_summary(before)},
        "first_mismatch": None,
        "lineage": {"matrix005": "PERMANENT_FAIL_ZERO_CREDIT", "matrix006": "INVALIDATED_NO_LAUNCH_AUTHORITY", "v13_canary": "PASS_ZERO_CREDIT"},
        "matrix_id": matrix_id,
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False, "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED"},
        "predecessor": predecessor,
        "row_capture_projection": {"bytes": len(row_projection), "sha256": sha(row_projection)},
        "rows": row_summaries,
        "runtime_identity_counts": {"goals": len(current_goals), "tasks": len(current_threads), "turns": len(current_turns)},
        "schema_id": SCHEMA,
        "status": status_value,
        "verified_rows": ROW_COUNT,
    }


def check() -> dict[str, Any]:
    manifest = source_preflight()
    for matrix_id in MATRIX_IDS:
        matrix = manifest_matrix(manifest, matrix_id)
        require(len({row["subject"]["sha256"] for row in matrix["rows"]}) == 97, "subject cardinality")
        require([row["index"] for row in matrix["rows"]] == list(range(ROW_COUNT)), "row order")
    return {
        "authority": {"matrix_launch": False, "qualification_credit": 0, "release": False},
        "checks": {
            "expected_directories": 293,
            "expected_files": 6403,
            "fresh_goal_ids_per_matrix": 291,
            "fresh_task_ids_per_matrix": 291,
            "fresh_turn_ids_per_matrix": 582,
            "matrix_ids": list(MATRIX_IDS),
            "read_only": True,
            "rows_per_matrix": ROW_COUNT,
            "serialized": True,
            "structural_goal_context": CONTEXT_CONTRACT,
        },
        "schema_id": "pw-r9-goal-mode-v14-structural-context-matrix-independent-runtime-verifier-check-v1",
        "status": "PASS_STATIC_DATA_ONLY_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("check")
    run = sub.add_parser("verify")
    run.add_argument("--matrix-id", required=True)
    run.add_argument("--evidence", type=Path, required=True)
    run.add_argument("--codex-home", type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.command == "check":
            result, rc = check(), 0
        else:
            require(args.evidence.is_absolute() and args.codex_home.is_absolute(), "absolute runtime paths")
            result, rc = verify(args.matrix_id, args.evidence, args.codex_home), 0
    except (Invalid, OSError, UnicodeError, sqlite3.Error, json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
        result = {"authority": {"matrix_launch": False, "qualification_credit": 0, "release": False}, "error": str(exc), "first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_RETRY"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
