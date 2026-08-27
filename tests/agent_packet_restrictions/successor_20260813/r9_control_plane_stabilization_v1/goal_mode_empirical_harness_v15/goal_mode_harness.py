#!/usr/bin/env python3
"""Three-turn native Goal harness with a subject-free activation turn."""

from __future__ import annotations

import argparse
import ast
import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import stat
import subprocess
import sys
import time
from typing import Any

import goal_mode_three_turn_attestor as ga


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
V10_ROOT = BASE / "goal_mode_empirical_harness_v10"
V10_PATH = V10_ROOT / "goal_mode_harness.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_harness_v10_for_v15", V10_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V10 harness loader unavailable")
v10 = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v10
sys.path.insert(0, str(V10_ROOT))
SPEC.loader.exec_module(v10)
v10.ga = ga


ADMISSION_SCHEMA = "pw-r9-goal-mode-row-admission-v15"
RESULT_SCHEMA = "pw-r9-goal-mode-v15-row-result-v1"
STDERR_SCHEMA = "pw-r9-goal-mode-v15-stderr-classification-v1"
FAILURE_SCHEMA = "pw-r9-goal-mode-harness-failure-v15"
DEFAULT_TIMEOUT_SECONDS = 3600
MAX_SUBJECT_BYTES = 8_000_000
READER = BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"
DESIGN = BASE / "r9_goal_mode_v15_three_turn_successor_design_v1.json"
V14_FAILURE = BASE / "r9_goal_mode_v14_structural_context_matrix_001_runtime_failure_receipt_v1.json"
PER_TEST_TAKER = BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json"
OMP_CLARIFICATION = BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json"
SOURCES = (
    ("goal_mode_empirical_harness_v15/goal_mode_contract.json", ROOT / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v15/goal_mode_harness.py", ROOT / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v15/goal_mode_three_turn_attestor.py", ROOT / "goal_mode_three_turn_attestor.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_harness.py", V10_PATH),
    ("goal_mode_empirical_harness_v13/goal_mode_terminal_closure_attestor.py", BASE / "goal_mode_empirical_harness_v13" / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", READER),
    (DESIGN.name, DESIGN),
    (V14_FAILURE.name, V14_FAILURE),
    (PER_TEST_TAKER.name, PER_TEST_TAKER),
    (OMP_CLARIFICATION.name, OMP_CLARIFICATION),
)


class LaunchFailure(ga.Invalid):
    pass


def _bindings() -> list[dict[str, Any]]:
    return [v10._identity(label, path) for label, path in SOURCES]


def _load_admission(path: Path, row_path: Path, row: dict[str, Any]) -> dict[str, Any]:
    value = ga.load_json(path, 8_000_000)
    ga.require(isinstance(value, dict), "admission object")
    ga.base._exact_keys(value, {"authority", "bindings", "review", "row_spec", "schema_id", "status"}, "admission")
    ga.require(
        value["schema_id"] == ADMISSION_SCHEMA
        and value["status"] == "PASS_INDEPENDENT_V15_THREE_TURN_HARNESS_REVIEW",
        "admission schema/status",
    )
    ga.require(
        value["authority"]
        == {
            "adapter": ga.ADAPTER,
            "canary_launch": True,
            "launch_count": 1,
            "matrix_launch": False,
            "qualification": False,
            "retry": False,
            "row_id": row["row_id"],
            "run_id": row["run_id"],
        },
        "admission authority",
    )
    ga.require(value["bindings"] == _bindings(), "admission bindings")
    reference = value["review"]
    ga.require(isinstance(reference, dict), "review reference")
    ga.base._exact_keys(reference, {"bytes", "mode", "path", "sha256"}, "review reference")
    ga.require(isinstance(reference["path"], str) and reference["path"] == Path(reference["path"]).name, "review basename")
    review_path = path.parent / reference["path"]
    ga.require(v10._identity(reference["path"], review_path) == reference, "review identity")
    review = ga.load_json(review_path, 16_000_000)
    ga.require(
        review.get("schema_id") == "pw-r9-goal-mode-harness-v15-independent-static-review-v1"
        and review.get("status") == "PASS_INDEPENDENT_STATIC_REVIEW_V15_THREE_TURN_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
        and review.get("first_mismatch") is None
        and review.get("bindings") == _bindings(),
        "review verdict",
    )
    raw = ga.base._read_regular(row_path, 2_000_000)
    ga.require(value["row_spec"] == {"bytes": len(raw), "sha256": ga.sha256(raw)}, "row binding")
    return value


def make_row_spec(args: argparse.Namespace) -> dict[str, Any]:
    subject = ga.base._read_regular(args.subject, MAX_SUBJECT_BYTES)
    ga.require(subject and b"\x00" not in subject, "subject nonempty NUL-free")
    subject.decode("utf-8")
    criteria = ga.load_json(args.criteria, 2_000_000)
    control = ga.load_json(args.control_envelope, 2_000_000)
    ga.require(isinstance(criteria, dict) and isinstance(control, dict), "criteria/control objects")
    row: dict[str, Any] = {
        "adapter": ga.ADAPTER,
        "attempt": 0,
        "cli_version": args.cli_version,
        "control_envelope": control,
        "criteria": criteria,
        "model": args.model,
        "objective": "",
        "reasoning_effort": args.reasoning_effort,
        "row_id": args.row_id,
        "run_id": args.run_id,
        "schema_id": ga.ROW_SCHEMA,
        "subject_utf8_bytes": len(subject),
        "subject_utf8_sha256": ga.sha256(subject),
    }
    row["objective"] = ga.prior._expected_objective(row)
    v10._write_json(args.output, row, 0o644)
    return {"row_spec": v10._identity(args.output.name, args.output), "status": "ROW_SPEC_CREATED_ZERO_CREDIT_NO_LAUNCH"}


def _bootstrap_prompt(row: dict[str, Any]) -> bytes:
    get_code = ga.prior.get_goal_code().rstrip("\n")
    create_code = ga.prior.create_goal_code(row["objective"]).rstrip("\n")
    prompt = f"""R9 NATIVE GOAL MODE SUBJECT-FREE ACTIVATION TURN — NO SCORED SUBJECT IS PRESENT.

You are one fresh empirical test taker. Before any file access, command, web request, collaboration action, memory action, delegation, or subject reasoning, invoke exactly three native Goal actions as separate calls: get_goal, create_goal, then get_goal. If Goal tools are exposed directly, call them directly with the exact arguments. Otherwise use the exact code-mode forms below.

1. {get_code}
Require goal null.
2. {create_code}
Require the exact objective and status active.
3. {get_code}
Require the same Goal and status active.

Commitments only: run_id={row['run_id']}; row_id={row['row_id']}; attempt=0; criteria_sha256={ga.sha256(ga.canon(row['criteria'], newline=False))}; control_envelope_sha256={ga.sha256(ga.canon(row['control_envelope'], newline=False))}; subject_commitment_sha256={row['subject_utf8_sha256']}; subject_utf8_bytes={row['subject_utf8_bytes']}.

The scored subject is not contained in this turn. After call 3 succeeds, invoke no other action, perform no subject work, and leave the Goal active. Emit exactly {ga.BOOTSTRAP_MARKER} as the terminal assistant message with no decoration.
"""
    raw = prompt.encode("utf-8")
    ga.require(row["subject_utf8_sha256"].encode() in raw and str(row["subject_utf8_bytes"]).encode() in raw, "bootstrap commitments")
    return raw


def _scored_prompt(row: dict[str, Any], capture: Path, workspace: Path, bootstrap: dict[str, Any]) -> bytes:
    reader = ga.prior.reader_code(row, capture, workspace).rstrip("\n")
    prompt = f"""R9 NATIVE GOAL MODE SCORED SAME-TASK RESUME — THE SUBJECT IS STILL CONTROLLER-GATED.

This is the documented continuation of the exact fresh task and native Goal created in the completed subject-free activation turn. The activation attestation is sha256={ga.sha256(ga.canon(bootstrap))}; bytes={len(ga.canon(bootstrap))}. The native Goal context injected by the runtime must carry the exact active objective before this prompt.

Do not invoke get_goal, create_goal, update_goal, a file action, web request, collaboration action, memory action, delegation, or any other action before the subject reader. Your first and only action in this turn must be exactly:

{reader}

The reader blocks while the controller independently reopens the completed activation receipt and the active native Goal. Treat its returned UTF-8 text as the sole scored subject prompt. Perform every subject-reasoning step only after that return, in this same task and active Goal. Do not retry, relaunch, replace, delegate, or invoke another action. Leave the Goal active for the separate subject-free closure turn. Emit only the exact subject answer as the terminal assistant message.
"""
    raw = prompt.encode("utf-8")
    ga.require(row["subject_utf8_sha256"].encode() in reader.encode("utf-8") and ga.BOOTSTRAP_MARKER.encode() not in raw, "scored prompt reader/phase separation")
    return raw


def _closure_prompt(row: dict[str, Any], scored_gate: dict[str, Any]) -> bytes:
    get_code = ga.prior.get_goal_code().rstrip("\n")
    update_code = ga.prior.update_goal_code().rstrip("\n")
    prompt = f"""R9 NATIVE GOAL MODE SUBJECT-FREE TERMINAL CLOSURE TURN — NO SCORED SUBJECT IS PRESENT.

This is the documented continuation of the same fresh test-taker task after its scored answer was durably captured. Do not repeat, revise, explain, replace, or re-answer the scored subject. The scored-phase attestation is sha256={scored_gate['sha256']}; bytes={scored_gate['bytes']}.

Before any other action, invoke exactly these three native Goal actions as separate calls. If Goal tools are exposed directly, call them directly with exact arguments. Otherwise use the exact code-mode forms below.

1. {get_code}
Require the exact same Goal, objective, and status active.
2. {update_code}
Require the exact same Goal and status complete.
3. {get_code}
Require the exact same Goal, objective, and status complete.

Invoke no file, command, web, collaboration, memory, delegation, subject, or other action. Perform no scored-subject reasoning. After call 3, emit exactly {ga.CLOSURE_MARKER} as the terminal assistant message with no decoration.
"""
    raw = prompt.encode("utf-8")
    ga.require(row["subject_utf8_sha256"].encode() not in raw, "closure prompt leaks subject commitment")
    return raw


def _bootstrap_argv(codex: Path, row: dict[str, Any], workspace: Path, last: Path) -> list[str]:
    return v10._scored_argv(codex, row, workspace, last)


def _resume_argv(codex: Path, row: dict[str, Any], workspace: Path, last: Path, thread_id: str) -> list[str]:
    return v10._closure_argv(codex, row, workspace, last, thread_id)


def _wait_phase(
    process: subprocess.Popen[bytes],
    threads: list[Any],
    last: Path,
    timeout_seconds: int,
) -> tuple[bool, list[str]]:
    timed_out = False
    try:
        process.wait(timeout=max(0.1, timeout_seconds))
    except subprocess.TimeoutExpired:
        timed_out = True
        v10._terminate(process)
    for thread in threads:
        thread.join(timeout=10)
    if last.exists():
        v10._normalize(last)
    return timed_out, []


def _simple_process_receipt(process: subprocess.Popen[bytes], started: int, timed_out: bool, schema: str) -> dict[str, Any]:
    return {
        "ended_at_ms": int(time.time() * 1000),
        "pid": process.pid,
        "rc": process.returncode,
        "schema_id": schema,
        "started_at_ms": started,
        "stdin_closed": True,
        "timed_out": timed_out,
    }


def _precreate_last(path: Path) -> None:
    v10._write_exclusive(path, b"", 0o600)


def run_codex_row(args: argparse.Namespace) -> dict[str, Any]:
    row = ga.load_row(args.row_spec)
    subject = ga.base._read_regular(args.subject, MAX_SUBJECT_BYTES)
    subject.decode("utf-8")
    ga.require(len(subject) == row["subject_utf8_bytes"] and ga.sha256(subject) == row["subject_utf8_sha256"], "subject identity")
    _load_admission(args.admission, args.row_spec, row)
    ga.require(args.capture_root.is_absolute() and not args.capture_root.exists(), "capture root must be absent absolute path")
    args.capture_root.mkdir(mode=0o700, parents=False)
    os.chmod(args.capture_root, 0o700)
    v10._write_json(args.capture_root / "prelaunch_snapshot.json", v10._snapshot(args.codex_home))

    workspace = args.workspace.resolve()
    codex = args.codex.resolve()
    bootstrap_prompt = _bootstrap_prompt(row)
    v10._write_exclusive(args.capture_root / "bootstrap_prompt.txt", bootstrap_prompt)
    bootstrap_last = args.capture_root / "bootstrap_output_last_message.txt"
    _precreate_last(bootstrap_last)
    bootstrap_process, bootstrap_threads, bootstrap_box, bootstrap_errors, bootstrap_started = v10._start(
        _bootstrap_argv(codex, row, workspace, bootstrap_last),
        bootstrap_prompt,
        args.capture_root,
        "bootstrap",
        ga.BOOTSTRAP_LAUNCH_SCHEMA,
        args.workspace,
    )
    bootstrap_timed_out, _ = _wait_phase(bootstrap_process, bootstrap_threads, bootstrap_last, args.timeout_seconds)
    v10._write_json(
        args.capture_root / "bootstrap_process_receipt.json",
        _simple_process_receipt(bootstrap_process, bootstrap_started, bootstrap_timed_out, ga.BOOTSTRAP_PROCESS_SCHEMA),
    )
    if bootstrap_process.returncode != 0 or bootstrap_timed_out or bootstrap_errors:
        raise LaunchFailure(f"bootstrap process failure:rc={bootstrap_process.returncode}:timeout={bootstrap_timed_out}:pump={bootstrap_errors}")
    bootstrap = ga.attest_bootstrap(args.row_spec, args.capture_root, args.codex_home)
    ga.require(bootstrap_box == [bootstrap["goal"]["thread_id"]], "bootstrap thread.started identity")
    v10._write_json(args.capture_root / "bootstrap_attestation.json", bootstrap)

    fifo = args.capture_root / "subject.fifo"
    os.mkfifo(fifo, 0o600)
    os.chmod(fifo, 0o600)
    scored_prompt = _scored_prompt(row, args.capture_root, workspace, bootstrap)
    v10._write_exclusive(args.capture_root / "scored_prompt.txt", scored_prompt)
    scored_last = args.capture_root / "scored_output_last_message.txt"
    _precreate_last(scored_last)
    scored_process, scored_threads, scored_box, scored_errors, scored_started = v10._start(
        _resume_argv(codex, row, workspace, scored_last, bootstrap["goal"]["thread_id"]),
        scored_prompt,
        args.capture_root,
        "scored",
        ga.SCORED_LAUNCH_SCHEMA,
        args.workspace,
    )
    release: dict[str, Any] | None = None
    release_error = "same-task active Goal release gate timeout"
    release_deadline = time.monotonic() + min(300, args.timeout_seconds)
    while time.monotonic() < release_deadline and scored_process.poll() is None:
        if scored_box and not scored_errors:
            try:
                release = ga.attest_release(args.row_spec, args.capture_root, args.codex_home)
                break
            except (ga.Invalid, OSError, sqlite3.Error, UnicodeError) as exc:
                release_error = str(exc)
        time.sleep(0.05)
    delivery: dict[str, Any] = {}
    scored_timed_out = False
    if release is not None:
        v10._write_json(args.capture_root / "goal_active_subject_release_gate.json", release)
        delivery = v10._deliver(fifo, subject, scored_process, time.monotonic() + 30)
        if delivery.get("status") == "DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE":
            v10._write_json(args.capture_root / "subject_delivery.json", delivery)
            v10._write_exclusive(args.capture_root / "subject_input.txt", subject)
    if release is None or delivery.get("status") != "DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE":
        v10._terminate(scored_process)
    else:
        try:
            scored_process.wait(timeout=max(0.1, args.timeout_seconds))
        except subprocess.TimeoutExpired:
            scored_timed_out = True
            v10._terminate(scored_process)
    for thread in scored_threads:
        thread.join(timeout=10)
    if scored_last.exists():
        v10._normalize(scored_last)
    quiescence = v10._quiesce(fifo)
    if not quiescence["remaining_pids"] and fifo.exists():
        fifo.unlink()
        dfd = os.open(args.capture_root, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_CLOEXEC", 0))
        try:
            os.fsync(dfd)
        finally:
            os.close(dfd)
    scored_receipt = {
        "ended_at_ms": int(time.time() * 1000),
        "goal_release_error": None if release is not None else release_error,
        "pid": scored_process.pid,
        "rc": scored_process.returncode,
        "reader_quiescence": quiescence,
        "schema_id": ga.SCORED_PROCESS_SCHEMA,
        "started_at_ms": scored_started,
        "stdin_closed": True,
        "subject_delivery": delivery,
        "subject_fifo_removed": not fifo.exists(),
        "subject_release": "AFTER_COMPLETED_SUBJECT_FREE_GOAL_ACTIVATION" if release is not None else "NOT_RELEASED",
        "timed_out": scored_timed_out,
    }
    v10._write_json(args.capture_root / "scored_process_receipt.json", scored_receipt)
    if release is None:
        raise LaunchFailure(f"same-task active Goal gate failed; subject withheld:{release_error}")
    if delivery.get("status") != "DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE":
        raise LaunchFailure(f"subject delivery failed:{delivery}")
    if scored_process.returncode != 0 or scored_timed_out or scored_errors:
        raise LaunchFailure(f"scored process failure:rc={scored_process.returncode}:timeout={scored_timed_out}:pump={scored_errors}")
    if quiescence["term_sent"] or quiescence["kill_sent"] or quiescence["remaining_pids"]:
        raise LaunchFailure(f"reader forced cleanup:{quiescence}")
    scored = ga.attest_scored(args.row_spec, args.capture_root, args.codex_home)
    ga.require(scored_box == [bootstrap["goal"]["thread_id"]], "scored thread.started identity")
    v10._write_json(args.capture_root / "scored_phase_attestation.json", scored)

    scored_gate = v10._file_identity(args.capture_root / "scored_phase_attestation.json")
    closure_prompt = _closure_prompt(row, scored_gate)
    ga.require(subject not in closure_prompt, "closure prompt contains subject")
    v10._write_exclusive(args.capture_root / "closure_prompt.txt", closure_prompt)
    closure_last = args.capture_root / "closure_output_last_message.txt"
    _precreate_last(closure_last)
    closure_process, closure_threads, closure_box, closure_errors, closure_started = v10._start(
        _resume_argv(codex, row, workspace, closure_last, bootstrap["goal"]["thread_id"]),
        closure_prompt,
        args.capture_root,
        "closure",
        ga.CLOSURE_LAUNCH_SCHEMA,
        args.workspace,
    )
    closure_timed_out, _ = _wait_phase(closure_process, closure_threads, closure_last, args.timeout_seconds)
    v10._write_json(
        args.capture_root / "closure_process_receipt.json",
        _simple_process_receipt(closure_process, closure_started, closure_timed_out, ga.CLOSURE_PROCESS_SCHEMA),
    )
    if closure_process.returncode != 0 or closure_timed_out or closure_errors:
        raise LaunchFailure(f"closure process failure:rc={closure_process.returncode}:timeout={closure_timed_out}:pump={closure_errors}")
    ga.require(closure_box == [bootstrap["goal"]["thread_id"]], "closure thread.started identity")
    final = ga.attest_final(args.row_spec, args.capture_root, args.codex_home)
    classifications = {
        "bootstrap": v10._classify_stderr(ga.base._read_regular(args.capture_root / "bootstrap_stderr.bin", 64_000_000), final, args.codex_home, "BOOTSTRAP"),
        "closure": v10._classify_stderr(ga.base._read_regular(args.capture_root / "closure_stderr.bin", 64_000_000), final, args.codex_home, "CLOSURE"),
        "schema_id": STDERR_SCHEMA,
        "scored": v10._classify_stderr(ga.base._read_regular(args.capture_root / "scored_stderr.bin", 64_000_000), final, args.codex_home, "SCORED"),
        "status": "PASS_EXACT_THREE_PHASE_STDERR_CLASSIFICATIONS_AFTER_FULL_ATTESTATION",
    }
    v10._write_json(args.capture_root / "goal_mode_attestation.json", final)
    v10._write_json(args.capture_root / "stderr_classification.json", classifications)
    return {
        "attestation": final,
        "schema_id": RESULT_SCHEMA,
        "status": "PASS_THREE_TURN_SAME_TASK_NATIVE_GOAL_SUBJECT_FREE_ACTIVATION_SCORED_RESUME_TERMINAL_CLOSURE_ZERO_CREDIT",
        "stderr_classification": classifications,
    }


def check(args: argparse.Namespace) -> dict[str, Any]:
    contract = ga.load_json(ROOT / "goal_mode_contract.json", 8_000_000)
    ga.require(
        contract["schema_id"] == "pw-r9-goal-mode-empirical-harness-contract-v15"
        and contract["status"] == "STATIC_THREE_TURN_GOAL_ARCHITECTURE_ZERO_CREDIT_NO_LAUNCH"
        and contract["authority"]
        == {
            "canary_launch": False,
            "matrix_launch": False,
            "qualification_credit": 0,
            "qualification_streak_clean_matrices": 0,
            "release": False,
        },
        "contract",
    )
    ga.require(
        contract["architecture"]
        == {
            "adapter": ga.ADAPTER,
            "process_topology": "THREE_CODEX_PROCESSES_ONE_FRESH_PERSISTED_TASK_ONE_FRESH_GOAL_THREE_DISTINCT_TURNS",
            "subject_release": "ONLY_AFTER_COMPLETED_ACTIVATION_TURN_AND_ACTIVE_GOAL_REOPEN",
        },
        "contract architecture",
    )
    ga.require(
        contract["omp_lane"]
        == {
            "duplicate_spawn": False,
            "goal_mode_required_per_fresh_test_taker": True,
            "host": "WINDOWS",
            "launch_argv": ["omp", "--cwd", "P:\\"],
            "linux_process_inference": False,
            "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED",
        },
        "OMP boundary",
    )
    trees: dict[str, ast.AST] = {}
    for name in ("goal_mode_harness.py", "goal_mode_three_turn_attestor.py"):
        trees[name] = ast.parse((ROOT / name).read_text(encoding="utf-8"), filename=name)
    source = (ROOT / "goal_mode_harness.py").read_text(encoding="utf-8")
    ga.require(source.index('"bootstrap_attestation.json"') < source.index("os.mkfifo") < source.index('"scored_prompt.txt"'), "subject channel ordering")
    precreate_calls = sum(
        isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "_precreate_last"
        for node in ast.walk(trees["goal_mode_harness.py"])
    )
    ga.require(precreate_calls == 3, "three output precreate calls")
    forbidden_processes: list[str] = []
    for node in ast.walk(trees["goal_mode_harness.py"]):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute) or node.func.attr not in {"Popen", "run"} or not node.args:
            continue
        argv_node = node.args[0]
        if isinstance(argv_node, (ast.List, ast.Tuple)) and argv_node.elts:
            first = argv_node.elts[0]
            if isinstance(first, ast.Constant) and first.value in {"omp", "ps"}:
                forbidden_processes.append(first.value)
    ga.require(not forbidden_processes, "forbidden OMP/Linux process launch")
    version = subprocess.run([str(args.codex), "--version"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    resume = subprocess.run([str(args.codex), "exec", "resume", "--help"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    ga.require(version.returncode == 0 and version.stderr == b"" and version.stdout.strip() == b"codex-cli 0.148.0", "Codex version")
    ga.require(resume.returncode == 0 and resume.stderr == b"" and b"Resume a previous session" in resume.stdout and b"read from stdin" in resume.stdout, "Codex resume surface")
    failure = ga.load_json(V14_FAILURE, 8_000_000)
    ga.require(failure.get("status") == "FAIL_PERMANENT_V14_MATRIX_001_PRE_GOAL_ACTION_ZERO_CREDIT_NO_RETRY", "V14 failure preservation")
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": _bindings(),
        "checks": {
            "bootstrap_subject_absent": "PASS_STATIC",
            "codex_cli_version": "codex-cli 0.148.0",
            "fresh_goal_activation_turn": ["get_goal", "create_goal", "get_goal"],
            "matrix_qualification_streak": "0_OF_2",
            "omp_lane": "EXISTING_WINDOWS_OMP_CWD_P_DRIVE_NO_DUPLICATE",
            "output_last_message_precreated_mode": "0600",
            "same_task_three_turn_resume": "PASS_STATIC_SUPPORTED_SURFACE",
            "source_ast": "PASS",
            "v14_matrix_001": "PERMANENT_FAIL_ZERO_CREDIT",
        },
        "schema_id": "pw-r9-goal-mode-harness-check-v15",
        "status": "PASS_STATIC_THREE_TURN_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT",
    }


def emit(value: dict[str, Any]) -> None:
    sys.stdout.buffer.write(ga.canon(value))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    pcheck = sub.add_parser("check")
    pcheck.add_argument("--codex", type=Path, required=True)
    make = sub.add_parser("make-row-spec")
    for flag in ("subject", "criteria", "control-envelope", "output"):
        make.add_argument(f"--{flag}", type=Path, required=True)
    for flag in ("run-id", "row-id", "model", "reasoning-effort"):
        make.add_argument(f"--{flag}", required=True)
    make.add_argument("--cli-version", default="0.148.0")
    run = sub.add_parser("run-codex-row")
    for flag in ("row-spec", "subject", "admission", "capture-root", "codex-home", "codex", "workspace"):
        run.add_argument(f"--{flag}", type=Path, required=True)
    run.add_argument("--timeout-seconds", type=int, default=DEFAULT_TIMEOUT_SECONDS)
    args = parser.parse_args(argv)
    try:
        if args.command == "check":
            result = check(args)
        elif args.command == "make-row-spec":
            result = make_row_spec(args)
        else:
            ga.require(60 <= args.timeout_seconds <= 7200, "timeout bounds")
            result = run_codex_row(args)
        emit(result)
        return 0
    except (ga.Invalid, OSError, sqlite3.Error, UnicodeError, subprocess.SubprocessError) as exc:
        emit(
            {
                "authority": {"qualification_credit": 0, "subject_release": False},
                "error": str(exc),
                "schema_id": FAILURE_SCHEMA,
                "status": "FAIL_CLOSED_ZERO_CREDIT_NO_RETRY",
            }
        )
        return 1
    finally:
        while v10._ACTIVE:
            process = v10._ACTIVE.pop()
            v10._terminate(process)
            for stream in (process.stdin, process.stdout, process.stderr):
                try:
                    if stream is not None:
                        stream.close()
                except OSError:
                    pass


if __name__ == "__main__":
    raise SystemExit(main())
