#!/usr/bin/env python3
"""Data-only model of the explicit-resume Goal harness and its attestor."""

from __future__ import annotations

import argparse
import ast
import copy
import json
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess
import tempfile
from typing import Any, Callable

import goal_mode_attestor as ga
import goal_mode_harness as gh


THREAD_ID = "12345678-1234-4234-8234-123456789abc"
GOAL_ID = "87654321-4321-4321-8321-cba987654321"
SUBJECT = b'Return exactly {"goal_mode":true} and nothing else.'
FINAL = '{"goal_mode":true}'


def write(path: Path, raw: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(raw)
    os.chmod(path, 0o600)


def write_json(path: Path, value: Any) -> None:
    write(path, ga.canon(value))


def row() -> dict[str, Any]:
    criteria = {"exact_final": FINAL}; control = {"tools": "goal-only-before-subject"}; digest = ga.sha256(SUBJECT)
    return {"adapter": ga.ADAPTER, "attempt": 0, "cli_version": "0.148.0", "control_envelope": control, "criteria": criteria, "model": "gpt-5.6-sol", "objective": gh._expected_objective("fixture-run", "row-000", criteria, control, digest), "reasoning_effort": "xhigh", "row_id": "row-000", "run_id": "fixture-run", "schema_id": ga.ROW_SCHEMA, "subject_utf8_bytes": len(SUBJECT), "subject_utf8_sha256": digest}


def goal_output(spec: dict[str, Any], status: str) -> dict[str, Any]:
    return {"completionBudgetReport": None, "goal": {"createdAt": 1001, "objective": spec["objective"], "status": status, "threadId": THREAD_ID, "updatedAt": 1002}, "remainingTokens": None}


def record_payload(payload: dict[str, Any]) -> dict[str, Any]:
    return {"payload": payload, "type": "response_item"}


def call(call_id: str, code: str) -> dict[str, Any]:
    return record_payload({"call_id": call_id, "input": code, "name": "exec", "type": "custom_tool_call"})


def output(call_id: str, value: Any) -> dict[str, Any]:
    return record_payload({"call_id": call_id, "output": [{"text": json.dumps(value, separators=(",", ":")), "type": "text"}], "type": "custom_tool_call_output"})


def message(role: str, text: str, input_message: bool = False) -> dict[str, Any]:
    return record_payload({"content": [{"text": text, "type": "input_text" if input_message else "output_text"}], "role": role, "type": "message"})


def native_goal_context(spec: dict[str, Any]) -> str:
    return f'''<codex_internal_context source="goal">
Continue working toward the active thread goal.

<objective>
{spec["objective"]}
</objective>

Continuation behavior:
- This goal persists across turns.

Blocked audit:
- Only use status `blocked` after the required audit.
</codex_internal_context>'''


def stdout(thread_id: str, message_text: str) -> bytes:
    values = [{"thread_id": thread_id, "type": "thread.started"}, {"type": "turn.started"}, {"item": {"id": "message", "text": message_text, "type": "agent_message"}, "type": "item.completed"}, {"type": "turn.completed", "usage": {"input_tokens": 1, "output_tokens": 1}}]
    return b"".join(json.dumps(value, separators=(",", ":")).encode() + b"\n" for value in values)


def build(root: Path, mutation: str | None = None, goal_status: str = "complete") -> tuple[Path, Path, Path]:
    requested_mutation = mutation
    mutation = None
    spec = row(); capture = root / "capture"; home = root / "codex-home"; workspace = root / "workspace"
    capture.mkdir(parents=True); os.chmod(capture, 0o700); workspace.mkdir(); (home / "sessions").mkdir(parents=True)
    row_path = root / "row.json"; write_json(row_path, spec)
    fifo = capture / "subject.fifo"
    activation_prompt = gh._activation_prompt(spec).decode()
    continuation_prompt = gh._continuation_prompt(spec, Path("/fixed/read_goal_subject.py"), fifo, workspace).decode()
    records: list[dict[str, Any]] = [
        {"payload": {"cli_version": "0.148.0", "id": THREAD_ID, "originator": "codex_exec", "session_id": THREAD_ID, "source": "exec"}, "type": "session_meta"},
        {"turn_id": "activation-turn", "type": "turn_context"}, message("user", activation_prompt, True),
        call("g0", "const r = await tools.get_goal({});\ntext(r);"), output("g0", {"completionBudgetReport": None, "goal": None, "remainingTokens": None}),
        call("g1", f"const r = await tools.create_goal({{objective:{json.dumps(spec['objective'])}}});\ntext(r);"), output("g1", goal_output(spec, "active")),
        call("g2", "const r = await tools.get_goal({});\ntext(r);"), output("g2", goal_output(spec, "active")),
        message("assistant", "GOAL_ACTIVE_READY_FOR_EXPLICIT_RESUME_HANDOFF"),
        {"turn_id": "resume-turn", "type": "turn_context"}, message("user", native_goal_context(spec), True), message("user", continuation_prompt, True),
        call("g3", "const r = await tools.get_goal({});\ntext(r);"), output("g3", goal_output(spec, "active")),
        call("reader", f"const r = await tools.exec_command({{cmd:\"timeout --signal=TERM --kill-after=5s 25s python3 -B read_goal_subject.py --sha256 {spec['subject_utf8_sha256']} --bytes {spec['subject_utf8_bytes']} --timeout-seconds 20\"}});\ntext(r.output);"),
        record_payload({"call_id": "reader", "output": [{"text": SUBJECT.decode(), "type": "text"}], "type": "custom_tool_call_output"}),
        record_payload({"summary": [], "type": "reasoning"}),
        call("done", 'const r = await tools.update_goal({status:"complete"});\ntext(r);'), output("done", goal_output(spec, "complete")),
        message("assistant", FINAL),
    ]
    snapshot = {"captured_at_ms": 900, "goal_ids": [], "schema_id": ga.SNAPSHOT_SCHEMA, "thread_ids": []}
    activation_stdout = stdout(THREAD_ID, "GOAL_ACTIVE_READY_FOR_EXPLICIT_RESUME_HANDOFF")
    resume_stdout = stdout(THREAD_ID, FINAL)
    activation_receipt = {"ended_at_ms": 1100, "handoff": "CONTROLLER_TERMINATED_AFTER_GATE", "pid": 101, "rc": -15, "schema_id": ga.ACTIVATION_PROCESS_SCHEMA, "started_at_ms": 901, "stdin_closed": True, "timed_out": False}
    resume_receipt = {"ended_at_ms": 1300, "goal_restore_error": None, "pid": 102, "rc": 0, "reader_quiescence": {"detected_pids": [], "kill_sent": 0, "remaining_pids": [], "term_sent": 0}, "schema_id": ga.RESUME_PROCESS_SCHEMA, "started_at_ms": 1101, "stdin_closed": True, "subject_delivery": {"bytes": len(SUBJECT), "closed_at_ms": 1200, "sha256": ga.sha256(SUBJECT), "status": "DELIVERED_ONCE"}, "subject_fifo_removed": True, "subject_release": "AFTER_RESUMED_SAME_GOAL_ACTIVE_ATTESTATION", "timed_out": False}
    if mutation == "subject_before_activation":
        records.insert(3, message("developer", SUBJECT.decode(), True))
    elif mutation == "same_turn_subject":
        records.pop(10)
    elif mutation == "missing_resume_get_goal":
        del records[11:13]
    elif mutation == "thread_reuse":
        snapshot["thread_ids"] = [THREAD_ID]
    elif mutation == "wrong_resume_thread":
        resume_stdout = stdout("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", FINAL)
    elif mutation == "wrong_resume_argv_thread":
        pass
    elif mutation == "wrong_process_receipt":
        resume_receipt["subject_release"] = "BEFORE_GOAL"
    elif mutation == "terminal_before_subject":
        records[15], records[17] = records[17], records[15]
    rollout = home / "sessions" / "rollout.jsonl"
    write(rollout, b"".join(json.dumps(value, separators=(",", ":")).encode() + b"\n" for value in records))
    state = sqlite3.connect(home / "state_1.sqlite")
    state.execute("CREATE TABLE threads(id TEXT, source TEXT, thread_source TEXT, model TEXT, reasoning_effort TEXT, cli_version TEXT, rollout_path TEXT, created_at_ms INTEGER)")
    state.execute("INSERT INTO threads VALUES(?,?,?,?,?,?,?,?)", (THREAD_ID, "exec", "user", spec["model"], spec["reasoning_effort"], spec["cli_version"], str(rollout), 901)); state.commit(); state.close()
    goals = sqlite3.connect(home / "goals_1.sqlite")
    goals.execute("CREATE TABLE thread_goals(thread_id TEXT, goal_id TEXT, objective TEXT, token_budget INTEGER, status TEXT, created_at_ms INTEGER, updated_at_ms INTEGER)")
    goals.execute("INSERT INTO thread_goals VALUES(?,?,?,?,?,?,?)", (THREAD_ID, GOAL_ID, spec["objective"], None, "active", 1001, 1250)); goals.commit(); goals.close()
    activation_argv = gh._activation_argv(Path("/usr/bin/codex"), spec, workspace, capture / "activation_output_last_message.txt")
    resume_argv = gh._resume_argv(Path("/usr/bin/codex"), spec, workspace, capture / "resume_output_last_message.txt", THREAD_ID)
    if mutation == "wrong_resume_argv_thread":
        resume_argv[-2] = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    write_json(capture / "prelaunch_snapshot.json", snapshot)
    write(capture / "activation_prompt.txt", activation_prompt.encode()); write(capture / "continuation_prompt.txt", continuation_prompt.encode())
    write_json(capture / "activation_launch_receipt.json", {"argv": activation_argv, "phase": "ACTIVATION", "pid": 101, "schema_id": ga.LAUNCH_SCHEMA, "started_at_ms": 901, "stdin": {"bytes": len(activation_prompt.encode()), "sha256": ga.sha256(activation_prompt.encode())}})
    write_json(capture / "resume_launch_receipt.json", {"argv": resume_argv, "phase": "RESUME", "pid": 102, "schema_id": ga.LAUNCH_SCHEMA, "started_at_ms": 1101, "stdin": {"bytes": len(continuation_prompt.encode()), "sha256": ga.sha256(continuation_prompt.encode())}})
    write(capture / "activation_stdout.jsonl", activation_stdout); write(capture / "resume_stdout.jsonl", resume_stdout)
    write(capture / "activation_stderr.bin", b""); write(capture / "resume_stderr.bin", b"")
    write_json(capture / "activation_process_receipt.json", activation_receipt); write_json(capture / "resume_process_receipt.json", resume_receipt)
    write(capture / "subject_input.txt", SUBJECT); write(capture / "resume_output_last_message.txt", FINAL.encode())
    write(rollout, b"".join(json.dumps(value, separators=(",", ":")).encode() + b"\n" for value in records[:10]))
    write_json(capture / "activation_goal_active_gate.json", ga.attest_codex(row_path, capture, home, "activation"))
    write(rollout, b"".join(json.dumps(value, separators=(",", ":")).encode() + b"\n" for value in records[:15]))
    write_json(capture / "resume_goal_active_gate.json", ga.attest_codex(row_path, capture, home, "resume"))
    write(rollout, b"".join(json.dumps(value, separators=(",", ":")).encode() + b"\n" for value in records))
    if goal_status != "active":
        goals = sqlite3.connect(home / "goals_1.sqlite"); goals.execute("UPDATE thread_goals SET status=? WHERE thread_id=?", (goal_status, THREAD_ID)); goals.commit(); goals.close()
    if requested_mutation in {"pre_resume_action", "subject_before_activation", "same_turn_subject", "missing_resume_get_goal", "terminal_before_subject"}:
        if requested_mutation == "pre_resume_action": records.insert(12, record_payload({"command": "true", "type": "local_shell_call"}))
        elif requested_mutation == "subject_before_activation": records.insert(3, message("developer", SUBJECT.decode(), True))
        elif requested_mutation == "same_turn_subject": records.pop(10)
        elif requested_mutation == "missing_resume_get_goal": del records[13:15]
        else: records[16], records[18] = records[18], records[16]
        write(rollout, b"".join(json.dumps(value, separators=(",", ":")).encode() + b"\n" for value in records))
    elif requested_mutation == "thread_reuse":
        snapshot["thread_ids"] = [THREAD_ID]; write_json(capture / "prelaunch_snapshot.json", snapshot)
    elif requested_mutation == "wrong_resume_thread":
        write(capture / "resume_stdout.jsonl", stdout("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", FINAL))
    elif requested_mutation == "wrong_resume_argv_thread":
        resume_argv[-2] = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"; write_json(capture / "resume_launch_receipt.json", {"argv": resume_argv, "phase": "RESUME", "pid": 102, "schema_id": ga.LAUNCH_SCHEMA, "started_at_ms": 1101, "stdin": {"bytes": len(continuation_prompt.encode()), "sha256": ga.sha256(continuation_prompt.encode())}})
    elif requested_mutation == "wrong_resume_option_scope":
        resume_argv[5:5] = ["--color", "never"]; write_json(capture / "resume_launch_receipt.json", {"argv": resume_argv, "phase": "RESUME", "pid": 102, "schema_id": ga.LAUNCH_SCHEMA, "started_at_ms": 1101, "stdin": {"bytes": len(continuation_prompt.encode()), "sha256": ga.sha256(continuation_prompt.encode())}})
    elif requested_mutation == "wrong_process_receipt":
        resume_receipt["subject_release"] = "BEFORE_GOAL"; write_json(capture / "resume_process_receipt.json", resume_receipt)
    elif requested_mutation == "resume_stdout_message_mismatch":
        write(capture / "resume_stdout.jsonl", stdout(THREAD_ID, "wrong-final"))
    elif requested_mutation == "activation_rc_mismatch":
        activation_receipt["handoff"] = "PROCESS_EXITED_AFTER_GATE"; activation_receipt["rc"] = 1; write_json(capture / "activation_process_receipt.json", activation_receipt)
    elif requested_mutation == "nonempty_stderr":
        write(capture / "resume_stderr.bin", b"unexpected\n")
    elif requested_mutation == "raw_stream_mode":
        os.chmod(capture / "resume_stdout.jsonl", 0o777)
    elif requested_mutation == "missing_native_goal_context":
        records.pop(11); write(rollout, b"".join(json.dumps(value, separators=(",", ":")).encode() + b"\n" for value in records))
    elif requested_mutation == "wrong_native_goal_objective":
        records[11] = message("user", native_goal_context({**spec, "objective": "wrong-objective"}), True); write(rollout, b"".join(json.dumps(value, separators=(",", ":")).encode() + b"\n" for value in records))
    elif requested_mutation == "pre_resume_reasoning":
        records.insert(12, record_payload({"summary": [], "type": "reasoning"})); write(rollout, b"".join(json.dumps(value, separators=(",", ":")).encode() + b"\n" for value in records))
    elif requested_mutation == "reader_forced_cleanup":
        resume_receipt["reader_quiescence"] = {"detected_pids": [999], "kill_sent": 0, "remaining_pids": [], "term_sent": 1}; write_json(capture / "resume_process_receipt.json", resume_receipt)
    return row_path, capture, home


def expect_failure(root: Path, mutation: str) -> None:
    case = root / mutation
    row_path, capture, home = build(case, mutation=mutation)
    try:
        ga.attest_codex(row_path, capture, home, "final")
    except ga.Invalid:
        return
    raise AssertionError(f"mutation accepted: {mutation}")


def static_source_checks(root: Path) -> None:
    contract = ga.load_json(root / "goal_mode_contract.json", 4_000_000)
    assert contract["authority"]["qualification_credit"] == 0
    assert contract["qualification"]["current_clean_matrix_streak"] == 0
    assert contract["omp_lane"]["launch_argv"] == ["omp", "--cwd", "P:\\"]
    harness = (root / "goal_mode_harness.py").read_text()
    assert "exec\", \"resume" in harness and "ga.attest_codex(args.row_spec, args.capture_root, args.codex_home, \"resume\")" in harness
    assert '"--color", "never", "exec", "resume"' not in harness
    assert "GOAL_ACTIVE_READY_FOR_EXPLICIT_RESUME_HANDOFF" in harness
    for name in ("goal_mode_attestor.py", "goal_mode_harness.py", "read_goal_subject.py"):
        tree = ast.parse((root / name).read_text(), filename=name)
        popen = sum(isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "Popen" for node in ast.walk(tree))
        assert popen == (1 if name == "goal_mode_harness.py" else 0)
    assert "spawn_agent" not in harness and "create_thread" not in harness


def main() -> int:
    parser = argparse.ArgumentParser(); parser.add_argument("--codex", type=Path, required=True); args = parser.parse_args()
    source_root = Path(__file__).resolve().parent
    result: dict[str, Any] = {"authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0}, "mutations_rejected": [], "schema_id": "pw-r9-goal-mode-harness-v4-data-check-v1", "status": "FAIL", "workspace_writes": 0}
    try:
        static_source_checks(source_root)
        version = subprocess.run([str(args.codex), "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.DEVNULL, check=False, timeout=10)
        assert version.returncode == 0 and version.stderr == b"" and version.stdout.decode().strip() == "codex-cli 0.148.0"
        help_run = subprocess.run([str(args.codex), "exec", "resume", "--help"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.DEVNULL, check=False, timeout=10)
        assert help_run.returncode == 0 and b"Resume a previous session" in help_run.stdout and b"If `-` is used, read from stdin" in help_run.stdout
        with tempfile.TemporaryDirectory(prefix="r9-goal-v4-check-") as temp:
            root = Path(temp)
            active_row, active_capture, active_home = build(root / "active", goal_status="active")
            assert ga.attest_codex(active_row, active_capture, active_home, "activation")["authority"]["resume_launch"] is True
            assert ga.attest_codex(active_row, active_capture, active_home, "resume")["authority"]["subject_release"] is True
            final_row, final_capture, final_home = build(root / "final")
            final = ga.attest_codex(final_row, final_capture, final_home, "final")
            assert final["status"] == "PASS_NATIVE_CODEX_GOAL_EXPLICIT_RESUME_LIFECYCLE_ZERO_INTERNAL_CREDIT" and final["process_accounting"] == {"fresh_tasks": 1, "processes": 2, "resume_operations": 1, "retries": 0, "subject_deliveries": 1}
            mutations = ["subject_before_activation", "same_turn_subject", "missing_resume_get_goal", "pre_resume_action", "thread_reuse", "wrong_resume_thread", "wrong_resume_argv_thread", "wrong_resume_option_scope", "wrong_process_receipt", "resume_stdout_message_mismatch", "activation_rc_mismatch", "nonempty_stderr", "raw_stream_mode", "missing_native_goal_context", "wrong_native_goal_objective", "pre_resume_reasoning", "reader_forced_cleanup", "terminal_before_subject"]
            for mutation in mutations:
                expect_failure(root, mutation)
            result["mutations_rejected"] = mutations
        result.update({"codex_cli_version": "codex-cli 0.148.0", "status": "PASS_DATA_ONLY_EXPLICIT_RESUME_MODEL_ZERO_CREDIT_NO_LAUNCH"})
        sys_stdout = ga.canon(result); os.write(1, sys_stdout); return 0
    except Exception as exc:
        result["error"] = f"{type(exc).__name__}:{exc}"; os.write(1, ga.canon(result)); return 1


if __name__ == "__main__":
    raise SystemExit(main())
