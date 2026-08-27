#!/usr/bin/env python3
"""Independent data-only checker and mutation corpus for the Goal harness."""

from __future__ import annotations

import argparse
import ast
import copy
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import stat
import sys
import tempfile
from typing import Any, Callable

import goal_mode_attestor as ga
import goal_mode_harness as gh


THREAD_ID = "11111111-1111-4111-8111-111111111111"
GOAL_ID = "22222222-2222-4222-8222-222222222222"
SUBJECT = b"Return exactly the compact JSON object {\"goal_mode\":true} and nothing else."
FINAL = '{"goal_mode":true}'


def write(path: Path, raw: bytes, mode: int = 0o600) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(raw)
    os.chmod(path, mode)


def write_json(path: Path, value: Any, mode: int = 0o600) -> None:
    write(path, ga.canon(value), mode)


def row(adapter: str = gh.ADAPTER) -> dict[str, Any]:
    criteria = {"answer_once": True, "oracle_hidden": True}
    control = {"attempt": 0, "delegation": False, "retry": False}
    subject_hash = ga.sha256(SUBJECT)
    objective = gh._expected_objective("fixture-run", "row-000", criteria, control, subject_hash)
    return {
        "adapter": adapter,
        "attempt": 0,
        "cli_version": "0.148.0",
        "control_envelope": control,
        "criteria": criteria,
        "model": "gpt-5.6-luna",
        "objective": objective,
        "reasoning_effort": "medium",
        "row_id": "row-000",
        "run_id": "fixture-run",
        "schema_id": ga.ROW_SCHEMA,
        "subject_utf8_bytes": len(SUBJECT),
        "subject_utf8_sha256": subject_hash,
    }


def call(call_id: str, code: str) -> dict[str, Any]:
    return {"type": "response_item", "payload": {"type": "custom_tool_call", "name": "exec", "call_id": call_id, "input": code}}


def output(call_id: str, value: dict[str, Any] | str) -> dict[str, Any]:
    text = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return {"type": "response_item", "payload": {"type": "custom_tool_call_output", "call_id": call_id, "output": [{"type": "input_text", "text": text}]}}


def goal_result(objective: str, status: str) -> dict[str, Any]:
    return {"goal": {"threadId": THREAD_ID, "objective": objective, "status": status, "createdAt": 1001, "updatedAt": 1001}, "remainingTokens": None, "completionBudgetReport": None}


def records(spec: dict[str, Any], bootstrap: str) -> list[dict[str, Any]]:
    return [
        {"type": "session_meta", "payload": {"type": None, "id": THREAD_ID, "session_id": THREAD_ID, "source": "exec", "originator": "codex_exec", "cli_version": "0.148.0"}},
        {"type": "turn_context", "turn_id": "activation-turn"},
        {"type": "response_item", "payload": {"type": "message", "role": "user", "content": [{"type": "input_text", "text": bootstrap}]}},
        call("g0", "const r = await tools.get_goal({});\ntext(r);"),
        output("g0", {"goal": None, "remainingTokens": None, "completionBudgetReport": None}),
        call("g1", f"const r = await tools.create_goal({{objective:{json.dumps(spec['objective'])}}});\ntext(r);"),
        output("g1", goal_result(spec["objective"], "active")),
        call("g2", "const r = await tools.get_goal({});\ntext(r);"),
        output("g2", goal_result(spec["objective"], "active")),
        {"type": "response_item", "payload": {"type": "message", "role": "assistant", "content": [{"type": "output_text", "text": "GOAL_ACTIVE_AWAITING_NATIVE_CONTINUATION"}]}},
        {"type": "turn_context", "turn_id": "subject-turn"},
        {"type": "response_item", "payload": {"type": "message", "role": "user", "content": [{"type": "input_text", "text": "<codex_internal_context source=\"goal\">Continue working toward the active thread goal.</codex_internal_context>"}]}},
        call("reader", f"const r = await tools.exec_command({{cmd:\"python3 -B read_goal_subject.py --sha256 {spec['subject_utf8_sha256']} --bytes {spec['subject_utf8_bytes']}\"}});\ntext(r.output);"),
        output("reader", SUBJECT.decode("utf-8")),
        {"type": "response_item", "payload": {"type": "reasoning", "summary": []}},
        call("done", 'const r = await tools.update_goal({status:"complete"});\ntext(r);'),
        output("done", goal_result(spec["objective"], "complete")),
        {"type": "response_item", "payload": {"type": "message", "role": "assistant", "content": [{"type": "output_text", "text": FINAL}]}},
    ]


def make_dbs(home: Path, rollout: Path, spec: dict[str, Any], goal_status: str = "complete") -> None:
    state = sqlite3.connect(home / "state_5.sqlite")
    state.execute("CREATE TABLE threads (id TEXT PRIMARY KEY, source TEXT, thread_source TEXT, model TEXT, reasoning_effort TEXT, cli_version TEXT, created_at_ms INTEGER, rollout_path TEXT)")
    state.execute("INSERT INTO threads VALUES (?,?,?,?,?,?,?,?)", (THREAD_ID, "exec", "user", spec["model"], spec["reasoning_effort"], spec["cli_version"], 1000, str(rollout)))
    state.commit(); state.close()
    goals = sqlite3.connect(home / "goals_1.sqlite")
    goals.execute("CREATE TABLE thread_goals (thread_id TEXT PRIMARY KEY, goal_id TEXT, objective TEXT, status TEXT, token_budget INTEGER, tokens_used INTEGER, time_used_seconds INTEGER, created_at_ms INTEGER, updated_at_ms INTEGER)")
    goals.execute("INSERT INTO thread_goals VALUES (?,?,?,?,?,?,?,?,?)", (THREAD_ID, GOAL_ID, spec["objective"], goal_status, None, 10, 1, 1001, 2000))
    goals.commit(); goals.close()


def fixture(root: Path, mutate: Callable[[list[dict[str, Any]], dict[str, Any]], None] | None = None) -> tuple[Path, Path, Path]:
    home = root / "codex-home"; home.mkdir()
    capture = root / "capture"; capture.mkdir()
    spec = row()
    row_path = root / "row.json"; write_json(row_path, spec, 0o644)
    bootstrap = "FIXTURE BOOTSTRAP WITHOUT SUBJECT CONTENT\n"
    recs = records(spec, bootstrap)
    snapshot = {"captured_at_ms": 900, "goal_ids": [], "schema_id": ga.SNAPSHOT_SCHEMA, "thread_ids": []}
    if mutate:
        mutate(recs, snapshot)
    rollout = home / "sessions" / "fixture" / f"rollout-{THREAD_ID}.jsonl"
    rollout.parent.mkdir(parents=True)
    write(rollout, b"".join(ga.canon(item) for item in recs))
    make_dbs(home, rollout, spec)
    write(capture / "bootstrap_prompt.txt", bootstrap.encode())
    write(capture / "subject_input.txt", SUBJECT)
    stdout = b"\n".join([
        json.dumps({"type": "thread.started", "thread_id": THREAD_ID}, separators=(",", ":")).encode(),
        b'{"type":"turn.started"}',
        b'{"type":"item.completed","item":{"id":"activation","type":"agent_message","text":"GOAL_ACTIVE_AWAITING_NATIVE_CONTINUATION"}}',
        b'{"type":"turn.completed","usage":{"input_tokens":1,"output_tokens":1}}',
        b'{"type":"turn.started"}',
        json.dumps({"type": "item.completed", "item": {"id": "item_0", "type": "agent_message", "text": FINAL}}, separators=(",", ":")).encode(),
        b'{"type":"turn.completed","usage":{"input_tokens":1,"output_tokens":1}}',
    ]) + b"\n"
    write(capture / "codex_stdout.jsonl", stdout)
    write(capture / "codex_stderr.bin", b"")
    write(capture / "output_last_message.txt", FINAL.encode())
    write_json(capture / "prelaunch_snapshot.json", snapshot)
    launch_argv = [
        "codex", "exec", "--strict-config", "-C", "/fixture", "--sandbox", "read-only",
        "--color", "never", "--json", "-m", spec["model"], "-c",
        f'model_reasoning_effort="{spec["reasoning_effort"]}"', "-c",
        "suppress_unstable_features_warning=true", "-o", "/fixture/output", "-",
    ]
    write_json(capture / "launch_receipt.json", {
        "argv": launch_argv, "pid": 123, "schema_id": ga.LAUNCH_SCHEMA, "started_at_ms": 999,
        "stdin": {"bytes": len(bootstrap.encode()), "sha256": ga.sha256(bootstrap.encode())},
    })
    write_json(capture / "process_receipt.json", {
        "activation_error": None, "ended_at_ms": 2001, "pid": 123, "processes": 1, "rc": 0,
        "requests": 1, "retries": 0, "schema_id": ga.PROCESS_SCHEMA, "started_at_ms": 999,
        "stdin_closed": True, "subject_delivery": {"bytes": len(SUBJECT), "closed_at_ms": 1500, "sha256": ga.sha256(SUBJECT), "status": "DELIVERED_ONCE"},
        "subject_fifo_removed": True, "subject_release": "AFTER_NATIVE_GOAL_ACTIVE_ATTESTATION", "timed_out": False,
    })
    return row_path, capture, home


def expect_fail(root: Path, mutator: Callable[[list[dict[str, Any]], dict[str, Any]], None], label: str) -> str:
    case = root / label; case.mkdir()
    row_path, capture, home = fixture(case, mutator)
    try:
        ga.attest_codex(row_path, capture, home)
    except ga.Invalid:
        return label
    raise AssertionError(f"mutation accepted: {label}")


def check_static(root: Path) -> dict[str, Any]:
    contract = ga.load_json(root / "goal_mode_contract.json", 4_000_000)
    assert contract["authority"]["qualification_credit"] == 0
    assert contract["omp_lane"]["launch_argv"] == ["omp", "--cwd", "P:\\"]
    assert contract["admission_contract"]["required_status"] == "PASS_INDEPENDENT_GOAL_HARNESS_REVIEW"
    assert contract["record_shapes"]["codex_process_receipt"] == [
        "activation_error", "ended_at_ms", "pid", "processes", "rc", "requests", "retries",
        "schema_id", "started_at_ms", "stdin_closed", "subject_delivery", "subject_fifo_removed",
        "subject_release", "timed_out",
    ]
    popen = 0
    for name in ("goal_mode_attestor.py", "goal_mode_harness.py", "read_goal_subject.py"):
        tree = ast.parse((root / name).read_text(), filename=name)
        if name == "goal_mode_harness.py":
            popen = sum(isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "Popen" for node in ast.walk(tree))
        if name == "goal_mode_attestor.py":
            assert not any(isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in {"Popen", "run", "call"} for node in ast.walk(tree))
    assert popen == 1
    return {"popen_sites": popen, "source_files": 3}


def check_omp(root: Path) -> None:
    spec = row("OMP_NATIVE_GOAL_WINDOWS_EXTERNAL_V1")
    row_path = root / "omp-row.json"; write_json(row_path, spec)
    criteria_hash = ga.sha256(ga.canon(spec["criteria"], newline=False))
    control_hash = ga.sha256(ga.canon(spec["control_envelope"], newline=False))
    receipt = {
        "adapter": spec["adapter"], "control_envelope_sha256": control_hash,
        "controller": "PREARRANGED_EXTERNAL_WINDOWS_HOST_CONTROLLER", "criteria_sha256": criteria_hash,
        "goal_activated_at_ms": 2, "goal_id": "omp-goal-1", "goal_mode": "OMP_NATIVE_GOAL_MODE",
        "launch_argv": ["omp", "--cwd", "P:\\"], "native_goal_creation_receipt": {"status": "active"},
        "native_goal_terminal_receipt": {"status": "complete"}, "objective": spec["objective"],
        "raw_capture_inventory": [{"bytes": 1, "sha256": "0" * 64}], "retry": False,
        "reuse": False, "schema_id": ga.OMP_SCHEMA, "subject_dispatched_at_ms": 3,
        "subject_turns": [{"ended_at_ms": 4, "started_at_ms": 3, "turn_id": "turn-1"}],
        "subject_utf8_bytes": len(SUBJECT), "subject_utf8_sha256": ga.sha256(SUBJECT),
        "task_created_at_ms": 1, "task_id": "omp-task-1", "terminal_goal_at_ms": 5,
        "terminal_goal_state": "complete",
    }
    receipt_path = root / "omp-receipt.json"; write_json(receipt_path, receipt)
    omp_result = ga.attest_omp(row_path, receipt_path)
    assert omp_result["status"].startswith("PASS_OMP_WINDOWS_BOUNDARY")
    assert omp_result["authority"]["external_gate_eligible"] is False
    bad = copy.deepcopy(receipt); bad["launch_argv"] = ["omp", "--cwd", "C:\\"]
    bad_path = root / "omp-bad.json"; write_json(bad_path, bad)
    try:
        ga.attest_omp(row_path, bad_path)
    except ga.Invalid:
        return
    raise AssertionError("wrong OMP launch boundary accepted")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", required=True)
    args = parser.parse_args()
    source = Path(__file__).resolve().parent
    result: dict[str, Any] = {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "first_mismatch": None,
        "mutation_count": 0,
        "schema_id": "pw-r9-goal-mode-harness-independent-check-v1",
        "status": "FAIL",
        "workspace_writes": 0,
    }
    try:
        result["static"] = check_static(source)
        with tempfile.TemporaryDirectory(prefix="pw-r9-goal-check-") as tmp:
            root = Path(tmp)
            good = root / "good"; good.mkdir()
            row_path, capture, home = fixture(good)
            attestation = ga.attest_codex(row_path, capture, home)
            assert attestation["status"].startswith("PASS_NATIVE_CODEX")
            mutations = [
                ("subject_before_activation", lambda recs, snap: recs.insert(3, {"type": "response_item", "payload": {"type": "message", "role": "developer", "content": [{"type": "input_text", "text": SUBJECT.decode()}]}})),
                ("thread_reuse", lambda recs, snap: snap["thread_ids"].append(THREAD_ID)),
                ("goal_reuse", lambda recs, snap: snap["goal_ids"].append(GOAL_ID)),
                ("pre_goal_tool", lambda recs, snap: recs.insert(3, call("bad", "const r = await tools.exec_command({cmd:\"true\"}); text(r);"))),
                ("same_turn_subject", lambda recs, snap: recs.pop(10)),
                ("terminal_before_subject", lambda recs, snap: recs.__setitem__(slice(12, 17), [recs[15], recs[16], recs[12], recs[13], recs[14]])),
            ]
            rejected = [expect_fail(root, mutator, label) for label, mutator in mutations]
            result["mutation_count"] = len(rejected) + 1
            result["mutations_rejected"] = rejected + ["wrong_omp_windows_boundary"]
            check_omp(root)
        result["status"] = "PASS_DATA_ONLY_SYNTHETIC_GOAL_LIFECYCLE_AND_MUTATIONS_ZERO_CREDIT_NO_LAUNCH"
        sys.stdout.buffer.write(ga.canon(result))
        return 0
    except BaseException as exc:
        result["first_mismatch"] = f"{type(exc).__name__}:{exc}"
        sys.stdout.buffer.write(ga.canon(result))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
