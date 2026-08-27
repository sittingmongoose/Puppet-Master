#!/usr/bin/env python3
"""Read-only mechanical verification of the consumed V17 canary failure."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import stat
import sys
from typing import Any


SCHEMA = "pw-r9-goal-mode-v17-three-turn-canary-001-failure-mechanical-verification-v1"
RUN_ID = "goal-mode-v17-three-turn-canary-001"
ROW_002_THREAD = "01a029b1-91e3-78f2-8f61-f8596276e262"
ROW_002_GOAL = "9df29047-4110-4950-a0d9-381db6251cf8"
ROW_002_ROLLOUT = "sessions/2026/08/22/rollout-2026-08-22T13-38-18-01a029b1-91e3-78f2-8f61-f8596276e262.jsonl"
BOUND = (
    ("r9_goal_mode_v17_three_turn_route_canary_controller_v1.py", 26979, "5e0a2ec54c540d896b4e60f8fbceb2d7023eda3683d2c39518e4bfc7f4433a59"),
    ("r9_goal_mode_v17_three_turn_canary_001_controller_admission_v1.json", 5044, "59379bc0ed3b51a659015eb934ce6416dd4195b369cc37f4ab56560de4214f86"),
    ("r9_goal_mode_v17_three_turn_route_canary_controller_v1_independent_static_review_v1.json", 7764, "69ccac27a0416236fa6784222a5befa530bc855f74ef3d54e6851c9d6b2c7f9a"),
    ("goal_mode_v17_three_turn_canary_001_inputs/manifest.json", 4365, "820ff8a8aad93f7ed67f4d8f48324f5144622e18be24933a1b19ad31179a4109"),
    ("goal_mode_empirical_harness_v17/goal_mode_harness.py", 14208, "876b79a838df82e81c2e0a7f411fbf7a71a4c61534c3a443cc2aec1e6820b86d"),
    ("goal_mode_empirical_harness_v17/goal_mode_three_turn_attestor.py", 16134, "d35c2da52bce8d7843c16d473e3ad3ef62cc38159baa429a755d1cffde057978"),
)
ROW_002_FILES = {
    "bootstrap_launch_receipt.json",
    "bootstrap_output_last_message.txt",
    "bootstrap_process_receipt.json",
    "bootstrap_prompt.txt",
    "bootstrap_stderr.bin",
    "bootstrap_stdout.jsonl",
    "prelaunch_snapshot.json",
}
PASS_ROW_FILES = {
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
    value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    require(raw == canon(value), f"noncanonical:{path}")
    return value


def identity(path: Path, label: str) -> dict[str, Any]:
    raw = read_regular(path)
    return {"bytes": len(raw), "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}", "path": label, "sha256": sha(raw)}


def inventory(root: Path) -> dict[str, Any]:
    root_stat = os.lstat(root)
    require(stat.S_ISDIR(root_stat.st_mode) and not root.is_symlink() and stat.S_IMODE(root_stat.st_mode) == 0o700, "evidence root")
    rows: list[dict[str, Any]] = []
    directories = 0
    for path in sorted(root.rglob("*"), key=lambda item: item.relative_to(root).as_posix()):
        info = os.lstat(path)
        require(not stat.S_ISLNK(info.st_mode), f"symlink:{path}")
        if stat.S_ISDIR(info.st_mode):
            require(stat.S_IMODE(info.st_mode) == 0o700, f"directory mode:{path}")
            directories += 1
            continue
        require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o600, f"file custody:{path}")
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


def connect_ro(path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=5)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA query_only=ON")
    return connection


def db_path(codex_home: Path, stem: str) -> Path:
    matches = sorted(codex_home.glob(f"{stem}_*.sqlite"))
    require(len(matches) == 1, f"{stem} database cardinality")
    read_regular(matches[0])
    return matches[0]


def parse_stdout(raw: bytes, marker: str) -> str:
    require(raw.endswith(b"\n") and b"\r" not in raw, "stdout framing")
    lines = raw.splitlines()
    require(len(lines) == 4, "stdout line cardinality")
    events = [json.loads(line, object_pairs_hook=pairs) for line in lines]
    require(events[0].get("type") == "thread.started" and isinstance(events[0].get("thread_id"), str), "thread start")
    require(events[1] == {"type": "turn.started"}, "turn start")
    require(
        events[2].get("type") == "item.completed"
        and events[2].get("item", {}).get("type") == "agent_message"
        and events[2].get("item", {}).get("text") == marker,
        "agent marker",
    )
    require(events[3].get("type") == "turn.completed" and isinstance(events[3].get("usage"), dict), "turn complete")
    return events[0]["thread_id"]


def records(raw: bytes) -> list[dict[str, Any]]:
    require(raw.endswith(b"\n") and b"\r" not in raw and b"\x00" not in raw, "rollout framing")
    result = []
    for line_number, line in enumerate(raw.splitlines(), 1):
        value = json.loads(line, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
        require(isinstance(value, dict), f"rollout object:{line_number}")
        result.append({"line": line_number, "value": value})
    return result


def response_payload(entry: dict[str, Any]) -> dict[str, Any]:
    value = entry["value"]
    payload = value.get("payload")
    return payload if value.get("type") == "response_item" and isinstance(payload, dict) else {}


def verify_pass_row(base: Path, evidence: Path, codex_home: Path, index: int) -> dict[str, Any]:
    row_id = f"row-{index:03d}"
    row_path = base / "goal_mode_v17_three_turn_canary_001_inputs" / f"{row_id}.row.json"
    capture = evidence / "rows" / row_id
    require({path.name for path in capture.iterdir()} == PASS_ROW_FILES, f"PASS row inventory:{index}")
    receipt = load(evidence / "controller_results" / f"{row_id}.receipt.json")
    require(receipt.get("index") == index and receipt.get("status") == "PASS" and receipt.get("rc") == 0 and receipt.get("timed_out") is False and receipt.get("process_reaped") is True and receipt.get("quiescent_before_next") is True, f"PASS receipt:{index}")
    stored = load(capture / "goal_mode_attestation.json")
    stdout = read_regular(evidence / "controller_results" / f"{row_id}.stdout")
    result = json.loads(stdout, object_pairs_hook=pairs)
    require(stdout == canon(result) and stored == result.get("attestation"), f"PASS attestation:{index}")
    row = load(row_path)
    goal = stored.get("goal", {})
    require(goal.get("status") == "complete" and stored.get("authority", {}).get("qualification_credit") == 0, f"PASS Goal:{index}")
    require(
        stored.get("bootstrap", {}).get("goal", {}).get("status") == "active"
        and stored.get("scored", {}).get("goal", {}).get("status") == "active"
        and stored["bootstrap"]["goal"]["goal_id"] == stored["scored"]["goal"]["goal_id"] == goal.get("goal_id")
        and stored["bootstrap"]["goal"]["thread_id"] == stored["scored"]["goal"]["thread_id"] == goal.get("thread_id"),
        f"PASS same active Goal:{index}",
    )
    require(isinstance(goal.get("turn_ids"), list) and len(goal["turn_ids"]) == 3 and len(set(goal["turn_ids"])) == 3, f"PASS turns:{index}")
    require(isinstance(stored.get("scored", {}).get("reader_output_line"), int), f"PASS reader output:{index}")
    require(stored.get("process_accounting") == {"fresh_tasks": 1, "processes": 3, "resume_operations": 2, "retries": 0, "subject_deliveries": 1}, f"PASS accounting:{index}")
    expected = row["criteria"]["expected_exact_utf8"].encode()
    require(read_regular(capture / "scored_output_last_message.txt") == expected, f"PASS answer:{index}")
    for phase in ("bootstrap", "scored", "closure"):
        process = load(capture / f"{phase}_process_receipt.json")
        require(process.get("rc") == 0 and process.get("timed_out") is False and process.get("stdin_closed") is True, f"PASS process:{index}:{phase}")
    with connect_ro(db_path(codex_home, "goals")) as goals, connect_ro(db_path(codex_home, "state")) as state:
        goal_rows = goals.execute("SELECT * FROM thread_goals WHERE thread_id=?", (goal["thread_id"],)).fetchall()
        thread_rows = state.execute("SELECT * FROM threads WHERE id=?", (goal["thread_id"],)).fetchall()
    require(len(goal_rows) == 1 and goal_rows[0]["goal_id"] == goal["goal_id"] and goal_rows[0]["objective"] == row["objective"] and goal_rows[0]["status"] == "complete", f"PASS Goal DB:{index}")
    require(len(thread_rows) == 1 and isinstance(thread_rows[0]["rollout_path"], str), f"PASS thread DB:{index}")
    return {"goal_id": stored["goal"]["goal_id"], "row_id": row_id, "status": "PASS_DIAGNOSTIC_ZERO_CREDIT", "thread_id": stored["goal"]["thread_id"], "turn_ids": stored["goal"]["turn_ids"]}


def verify_failed_row(base: Path, evidence: Path, codex_home: Path) -> dict[str, Any]:
    index = 2
    row_id = "row-002"
    capture = evidence / "rows" / row_id
    require({path.name for path in capture.iterdir()} == ROW_002_FILES, "failed row inventory")
    receipt = load(evidence / "controller_results" / f"{row_id}.receipt.json")
    require(
        receipt.get("index") == index
        and receipt.get("status") == "FAIL"
        and receipt.get("rc") == 1
        and receipt.get("timed_out") is False
        and receipt.get("process_reaped") is True
        and receipt.get("quiescent_before_next") is False,
        "failed row receipt",
    )
    row_stdout = read_regular(evidence / "controller_results" / f"{row_id}.stdout")
    require(
        row_stdout
        == canon(
            {
                "authority": {"qualification_credit": 0, "subject_release": False},
                "error": "nested Goal call malformed",
                "schema_id": "pw-r9-goal-mode-harness-failure-v17",
                "status": "FAIL_CLOSED_ZERO_CREDIT_NO_RETRY",
            }
        ),
        "failed row stdout",
    )
    require(read_regular(evidence / "controller_results" / f"{row_id}.stderr") == b"" and read_regular(capture / "bootstrap_stderr.bin") == b"", "failed row stderr")
    launch = load(capture / "bootstrap_launch_receipt.json")
    process = load(capture / "bootstrap_process_receipt.json")
    prompt = read_regular(capture / "bootstrap_prompt.txt")
    require(launch.get("phase") == "BOOTSTRAP" and launch.get("stdin") == {"bytes": len(prompt), "sha256": sha(prompt)}, "bootstrap launch")
    require(process.get("rc") == 0 and process.get("timed_out") is False and process.get("stdin_closed") is True and process.get("pid") == launch.get("pid"), "bootstrap process")
    marker = "GOAL_ACTIVE_SUBJECT_NOT_SEEN_V17"
    thread_id = parse_stdout(read_regular(capture / "bootstrap_stdout.jsonl"), marker)
    require(thread_id == ROW_002_THREAD and read_regular(capture / "bootstrap_output_last_message.txt") == marker.encode(), "bootstrap thread/marker")
    row = load(base / "goal_mode_v17_three_turn_canary_001_inputs" / "row-002.row.json")
    subject = read_regular(base / "goal_mode_v17_three_turn_canary_001_inputs" / "row-002.subject.txt")
    require(subject not in prompt and not (capture / "subject_input.txt").exists() and not (capture / "subject_delivery.json").exists(), "subject-free failure")
    goals_path = db_path(codex_home, "goals")
    state_path = db_path(codex_home, "state")
    with connect_ro(goals_path) as goals, connect_ro(state_path) as state:
        goal_rows = goals.execute("SELECT * FROM thread_goals WHERE thread_id=?", (thread_id,)).fetchall()
        thread_rows = state.execute("SELECT * FROM threads WHERE id=?", (thread_id,)).fetchall()
    require(len(goal_rows) == 1 and len(thread_rows) == 1, "failed row DB cardinality")
    goal = dict(goal_rows[0])
    thread = dict(thread_rows[0])
    require(goal.get("goal_id") == ROW_002_GOAL and goal.get("status") == "active" and goal.get("objective") == row.get("objective"), "active Goal DB")
    rollout_path = Path(thread["rollout_path"])
    require(rollout_path.is_absolute() and rollout_path.is_relative_to(codex_home), "rollout confinement")
    logical = rollout_path.relative_to(codex_home).as_posix()
    rollout_raw = read_regular(rollout_path)
    require(logical == ROW_002_ROLLOUT and len(rollout_raw) == 80741 and sha(rollout_raw) == "1ebd0b047f445ff4d29579bab374144c1a2a05cfd799c920956831877e6e6580", "rollout identity")
    require(subject not in rollout_raw, "subject absent from rollout")
    parsed = records(rollout_raw)
    calls = [response_payload(entry) | {"line": entry["line"]} for entry in parsed if response_payload(entry).get("type") in {"custom_tool_call", "function_call"}]
    outputs = [response_payload(entry) | {"line": entry["line"]} for entry in parsed if response_payload(entry).get("type") in {"custom_tool_call_output", "function_call_output"}]
    require(len(calls) == 1 and calls[0].get("type") == "custom_tool_call" and calls[0].get("name") == "exec" and len(outputs) == 1 and outputs[0].get("type") == "custom_tool_call_output", "one nested Goal batch")
    expected_code = (
        "const r1 = await tools.get_goal({});\n"
        "text(r1);\n"
        f"const r2 = await tools.create_goal({{objective:{json.dumps(row['objective'], ensure_ascii=False)}}});\n"
        "text(r2);\n"
        "const r3 = await tools.get_goal({});\n"
        "text(r3);"
    )
    require(calls[0].get("input") == expected_code and calls[0].get("call_id") == outputs[0].get("call_id") and outputs[0]["line"] > calls[0]["line"], "exact nested Goal batch")
    output = outputs[0].get("output")
    require(isinstance(output, list) and len(output) == 4 and all(item.get("type") == "input_text" and isinstance(item.get("text"), str) for item in output), "nested output shape")
    projections = [json.loads(item["text"], object_pairs_hook=pairs) for item in output[1:]]
    require(projections[0].get("goal") is None, "initial Goal projection")
    for projection in projections[1:]:
        projected = projection.get("goal")
        require(isinstance(projected, dict) and projected.get("threadId") == thread_id and projected.get("objective") == row["objective"] and projected.get("status") == "active", "active Goal projection")
    require(projections[1]["goal"] == projections[2]["goal"], "created/reopened Goal projection")
    return {
        "failure_family": "GOAL_ACTIVATION_PROOF_PARSER_SINGLE_CALL_CARDINALITY_FALSE_REJECTION",
        "goal_id": ROW_002_GOAL,
        "goal_status": "active",
        "native_goal_batch": ["get_goal", "create_goal", "get_goal"],
        "rollout": {"bytes": len(rollout_raw), "logical_path": logical, "sha256": sha(rollout_raw)},
        "row_id": row_id,
        "status": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY_SUBJECT_NOT_RELEASED",
        "thread_id": thread_id,
    }


def verify(args: argparse.Namespace) -> dict[str, Any]:
    sources = []
    for relative, size, digest in BOUND:
        item = identity(args.base / relative, relative)
        require(item == {"bytes": size, "mode": "0644", "path": relative, "sha256": digest}, f"source identity:{relative}")
        sources.append(item)
    before = inventory(args.evidence)
    require(
        {key: before[key] for key in ("aggregate_file_bytes", "directories", "files", "projection_bytes", "projection_sha256")}
        == {"aggregate_file_bytes": 423441, "directories": 5, "files": 69, "projection_bytes": 10423, "projection_sha256": "627480c063fe9dfa2b416b397b38628b67b4c80ef92b7043fe7fb4ba0d521184"},
        "evidence inventory identity",
    )
    terminal = load(args.evidence / "controller_terminal.json")
    require(
        terminal
        == {
            "accounting": {"aborted_unlaunched": 0, "consumed": 3, "failed": 1, "passed": 2, "planned": 3, "qualification_credit": 0, "retries": 0},
            "first_failure": {"index": 2, "rc": 1, "stderr_sha256": sha(b""), "stdout_sha256": "a6c90e488e1895bfcb2dcda2caf8a39c5ab32cc3a9749f346abaf1cdc47d042f"},
            "isolation": {"all_consumed_rows_quiescent_before_successor": False, "max_parallel": 1, "serialized": True},
            "run_id": RUN_ID,
            "schema_id": "pw-r9-goal-mode-v17-three-turn-route-canary-controller-terminal-v1",
            "started_at_ms": terminal.get("started_at_ms"),
            "status": "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY",
        },
        "controller terminal",
    )
    require(isinstance(terminal["started_at_ms"], int) and terminal["started_at_ms"] > 0, "controller start")
    require({path.name for path in (args.evidence / "controller_results").iterdir()} == {f"row-{index:03d}.{suffix}" for index in range(3) for suffix in ("receipt.json", "stderr", "stdout")}, "controller result inventory")
    require({path.name for path in (args.evidence / "rows").iterdir()} == {f"row-{index:03d}" for index in range(3)}, "row directory inventory")
    pass_rows = [verify_pass_row(args.base, args.evidence, args.codex_home, index) for index in range(2)]
    failed_row = verify_failed_row(args.base, args.evidence, args.codex_home)
    require(len({row["thread_id"] for row in pass_rows} | {failed_row["thread_id"]}) == 3 and len({row["goal_id"] for row in pass_rows} | {failed_row["goal_id"]}) == 3, "cross-row fresh identities")
    after = inventory(args.evidence)
    require(after == before, "evidence inventory drift")
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "release": False, "retry": False},
        "checks": {
            "consumed_rows": 3,
            "evidence_inventory": {key: before[key] for key in ("aggregate_file_bytes", "directories", "files", "projection_bytes", "projection_sha256")},
            "failed_row": failed_row,
            "passed_rows": pass_rows,
            "qualification_credit": 0,
            "subject_work_before_goal_activation": 0,
        },
        "first_mismatch": {
            "family": "GOAL_ACTIVATION_PROOF_PARSER_SINGLE_CALL_CARDINALITY_FALSE_REJECTION",
            "phase": "BOOTSTRAP_ATTESTATION_REOPEN",
            "row_id": "row-002",
        },
        "schema_id": SCHEMA,
        "sources": sources,
        "status": "PASS_MECHANICAL_VERIFICATION_OF_PERMANENT_V17_FAILURE_ZERO_CREDIT_NO_RETRY",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--evidence", type=Path, required=True)
    parser.add_argument("--codex-home", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.base.is_absolute() and args.evidence.is_absolute() and args.codex_home.is_absolute(), "CLI")
        result, rc = verify(args), 0
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, sqlite3.Error) as exc:
        result = {"authority": {"qualification_credit": 0}, "error": str(exc), "first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_MECHANICAL_VERIFICATION_ZERO_CREDIT_NO_RETRY"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
