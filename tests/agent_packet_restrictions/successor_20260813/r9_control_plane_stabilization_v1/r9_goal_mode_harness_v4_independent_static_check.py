#!/usr/bin/env python3
"""Independent source-level admission check for Goal harness v4.

This checker never imports the implementation modules and never starts a Codex
task. It may execute the implementation's disposable data checker as a child.
"""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
import time
from typing import Any


FILES = ("check_goal_mode_harness.py", "goal_mode_attestor.py", "goal_mode_contract.json", "goal_mode_harness.py", "read_goal_subject.py")


class Invalid(RuntimeError):
    pass


def require(value: bool, message: str) -> None:
    if not value:
        raise Invalid(message)


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"


def identity(path: Path) -> dict[str, Any]:
    st = os.lstat(path)
    require(stat.S_ISREG(st.st_mode) and not path.is_symlink(), f"unsafe source: {path.name}")
    require(stat.S_IMODE(st.st_mode) == 0o644, f"source mode: {path.name}")
    raw = path.read_bytes()
    st2 = os.lstat(path)
    require((st.st_dev, st.st_ino, st.st_size, st.st_mtime_ns) == (st2.st_dev, st2.st_ino, st2.st_size, st2.st_mtime_ns), f"source drift: {path.name}")
    return {"bytes": len(raw), "mode": "0644", "path": path.name, "sha256": hashlib.sha256(raw).hexdigest()}


def function(tree: ast.Module, name: str) -> ast.FunctionDef:
    matches = [node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == name]
    require(len(matches) == 1, f"function cardinality: {name}")
    return matches[0]


def calls_named(node: ast.AST, name: str) -> list[ast.Call]:
    return [item for item in ast.walk(node) if isinstance(item, ast.Call) and ((isinstance(item.func, ast.Name) and item.func.id == name) or (isinstance(item.func, ast.Attribute) and item.func.attr == name))]


def literal_strings(node: ast.AST) -> list[str]:
    return [item.value for item in ast.walk(node) if isinstance(item, ast.Constant) and isinstance(item.value, str)]


def inspect_sources(root: Path) -> tuple[list[dict[str, Any]], dict[str, str]]:
    bindings = [identity(root / name) for name in FILES]
    contract_raw = (root / "goal_mode_contract.json").read_bytes()
    contract = json.loads(contract_raw)
    require(contract_raw == canon(contract), "contract not canonical")
    require(contract["schema_id"] == "pw-r9-goal-mode-empirical-harness-contract-v4", "contract schema")
    require(contract["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False}, "contract authority")
    require(contract["qualification"]["current_clean_matrix_streak"] == 0 and contract["qualification"]["clean_matrix_streak_required"] == 2, "qualification freeze")
    require(contract["omp_lane"]["launch_argv"] == ["omp", "--cwd", "P:\\"] and contract["omp_lane"]["duplicate_spawn"] is False and contract["omp_lane"]["linux_process_census_authority"] is False, "OMP Windows boundary")
    require(contract["codex_lane"]["fresh_task"] == {"cli_originator": "codex_exec", "ephemeral": False, "reuse": False, "source": "exec", "task_count": 1}, "one-task contract")
    require(contract["codex_lane"]["resume_process"]["first_nested_tool"] == "GET_GOAL_SAME_ACTIVE", "resumed Goal gate contract")
    admission_contract = contract["admission_contract"]
    require(admission_contract["create_only"] is True, "admission create-only contract")
    require(admission_contract["required_status"] == "PASS_INDEPENDENT_GOAL_RESUME_HARNESS_REVIEW", "admission status contract")
    require(admission_contract["top_level_exact_fields"] == ["authority", "bindings", "review", "row_spec", "schema_id", "status"], "admission exact fields")
    require(admission_contract["binding_rule"] == "EXACT_SHA256_BYTES_MODE_AND_BASENAME_FOR_ALL_V4_SOURCES_PLUS_EXACT_ROW_SPEC_AND_INDEPENDENT_REVIEW_V4_IDENTITIES", "admission review binding rule")

    trees: dict[str, ast.Module] = {}
    texts: dict[str, str] = {}
    for name in FILES:
        if not name.endswith(".py"):
            continue
        text = (root / name).read_text(encoding="utf-8")
        texts[name] = text
        trees[name] = ast.parse(text, filename=name)
    for name, tree in trees.items():
        popen_count = sum(isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "Popen" for node in ast.walk(tree))
        require(popen_count == (1 if name == "goal_mode_harness.py" else 0), f"Popen ownership: {name}")
    harness_tree = trees["goal_mode_harness.py"]
    run = function(harness_tree, "run_codex_row")
    require(len(calls_named(run, "_start_process")) == 2, "exactly two process starts required")
    require(sum(isinstance(item, ast.Name) and item.id == "_fifo_writer" for item in ast.walk(run)) == 1, "one FIFO writer construction required")
    require(len(calls_named(run, "_load_admission")) == 1, "admission cardinality")
    load_admission = function(harness_tree, "_load_admission")
    load_admission_text = ast.get_source_segment(texts["goal_mode_harness.py"], load_admission) or ""
    required_review_chain_tokens = (
        '"review"',
        '"pw-r9-goal-mode-harness-v4-independent-static-review-v1"',
        '"PASS_INDEPENDENT_STATIC_REVIEW_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"',
        '"canary_admission_eligible": True',
        '"canary_launch": False',
        '"matrix_launch": False',
        '"qualification_credit": 0',
        '"qualification_streak_clean_matrices": 0',
        '"release": False',
        'f"goal_mode_empirical_harness_v4/{item[\'path\']}"',
        'review.get("bindings") == expected_review_bindings',
        'review_ref["path"] == Path(review_ref["path"]).name',
        '_file_identity(review_path) == review_ref',
    )
    require(all(token in load_admission_text for token in required_review_chain_tokens), "independent review binding chain source")
    run_text = ast.get_source_segment(texts["goal_mode_harness.py"], run) or ""
    require(run_text.index('"activation_goal_active_gate.json"') < run_text.index('_resume_argv('), "activation gate not durable before resume")
    require(run_text.index('"resume_goal_active_gate.json"') < run_text.index("target=_fifo_writer"), "resume gate not durable before FIFO writer")
    require("if resume_result is not None" in run_text and "AFTER_RESUMED_SAME_GOAL_ACTIVE_ATTESTATION" in run_text, "resume release guard")
    require("_load_admission(args.admission" in run_text and run_text.index("_load_admission(args.admission") < run_text.index("_start_process("), "admission must precede process")
    activation_prompt = function(harness_tree, "_activation_prompt")
    activation_text = ast.get_source_segment(texts["goal_mode_harness.py"], activation_prompt) or ""
    require("read_goal_subject.py" not in activation_text and "subject.decode" not in activation_text, "activation prompt contains reader or subject source")
    require(all(token in activation_text for token in ("tools.get_goal", "tools.create_goal", "GOAL_ACTIVE_READY_FOR_EXPLICIT_RESUME_HANDOFF")), "activation Goal sequence source")
    continuation_prompt = function(harness_tree, "_continuation_prompt")
    continuation_text = ast.get_source_segment(texts["goal_mode_harness.py"], continuation_prompt) or ""
    require(continuation_text.index("tools.get_goal") < continuation_text.index("{exec_code}") < continuation_text.index("tools.update_goal") and "reader_cmd" in continuation_text and "--fifo" in continuation_text, "continuation source order")
    resume_argv = function(harness_tree, "_resume_argv")
    resume_literals = literal_strings(resume_argv)
    require("resume" in resume_literals and "--ephemeral" not in resume_literals and "--sandbox" in resume_literals and "read-only" in resume_literals, "resume argv surface")
    require("--color" not in resume_literals and "never" not in resume_literals, "unsupported resume color option survived")
    require(all(token in texts["goal_mode_harness.py"] for token in ("_normalize_regular_if_present(resume_last)", "_wait_reader_quiescence(fifo)", "os.pidfd_open", "signal.pidfd_send_signal", "--kill-after=5s", "READER_TIMEOUT_SECONDS = 20", "READER_OUTER_TIMEOUT_SECONDS = 25")), "bounded reader/quiescence source")
    require(not any(token in texts["goal_mode_harness.py"] for token in ("spawn_agent", "create_thread", "omp --cwd", "subprocess.call")), "forbidden launch surface")

    attestor = texts["goal_mode_attestor.py"]
    required_attestor_tokens = (
        "action preceded resumed bootstrap Goal gate", "rollout prefix mismatch",
        "Goal gate rollout prefix chronology", "resume JSONL terminal message mismatch",
        "subject appeared before resumed active Goal gate", "subject escaped resumed Goal turn",
        "activation exit code/handoff mismatch", "Codex stderr must be empty",
        "PROCESS_EXITED_AFTER_GATE", "CONTROLLER_TERMINATED_AFTER_GATE",
        "capture file mode", "capture FIFO mode",
        "native Goal context cardinality", "native Goal context objective/lifecycle", "reader process did not quiesce naturally",
    )
    require(all(token in attestor for token in required_attestor_tokens), "attestor closure token missing")
    require("os.fchmod(fd, 0o600)" in texts["goal_mode_harness.py"], "raw stream mode normalization source")
    require('["omp", "--cwd", "P:\\\\"]' in attestor and "PREARRANGED_EXTERNAL_WINDOWS_HOST_CONTROLLER" in attestor, "attestor OMP boundary")
    reader_tree = trees["read_goal_subject.py"]
    forbidden_reader_calls = {"Popen", "run", "call", "system", "execve"}
    require(not any(isinstance(node, ast.Call) and ((isinstance(node.func, ast.Name) and node.func.id in forbidden_reader_calls) or (isinstance(node.func, ast.Attribute) and node.func.attr in forbidden_reader_calls)) for node in ast.walk(reader_tree)), "reader subprocess surface")
    reader_text = texts["read_goal_subject.py"]
    require(all(token in reader_text for token in ("os.O_NONBLOCK", "timeout_before_subject", "timeout_before_eof", "args.timeout_seconds")), "reader self-timeout source")
    return bindings, {"activation_gate_before_resume": "PASS", "admission_review_binding_chain": "PASS", "exact_two_process_one_task_source": "PASS", "fifo_after_resumed_goal_gate": "PASS", "native_goal_context_binding": "PASS", "omp_windows_boundary": "PASS", "raw_stream_mode_enforcement": "PASS", "read_only_attestor": "PASS", "reader_bounded_quiescence": "PASS", "resume_option_scope": "PASS", "subject_turn_distinct": "PASS"}


def reader_self_test(root: Path) -> dict[str, Any]:
    subject = b"goal-reader-self-test\n"
    digest = hashlib.sha256(subject).hexdigest()
    with tempfile.TemporaryDirectory(prefix="r9-goal-v4-reader-") as temp:
        base = Path(temp)
        fifo = base / "happy.fifo"
        os.mkfifo(fifo, 0o600); os.chmod(fifo, 0o600)
        process = subprocess.Popen([sys.executable, "-B", str(root / "read_goal_subject.py"), "--fifo", str(fifo), "--sha256", digest, "--bytes", str(len(subject)), "--timeout-seconds", "2"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        time.sleep(0.05)
        fd = os.open(fifo, os.O_WRONLY | getattr(os, "O_CLOEXEC", 0))
        try:
            os.write(fd, subject)
        finally:
            os.close(fd)
        stdout, stderr = process.communicate(timeout=5)
        require(process.returncode == 0 and stdout == subject and stderr == b"", "reader happy path")
        timeout_fifo = base / "timeout.fifo"
        os.mkfifo(timeout_fifo, 0o600); os.chmod(timeout_fifo, 0o600)
        started = time.monotonic()
        timeout_run = subprocess.run([sys.executable, "-B", str(root / "read_goal_subject.py"), "--fifo", str(timeout_fifo), "--sha256", digest, "--bytes", str(len(subject)), "--timeout-seconds", "1"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=5)
        elapsed_ms = int((time.monotonic() - started) * 1000)
        require(timeout_run.returncode != 0 and timeout_run.stdout == b"" and b"GOAL_SUBJECT_READER_FAIL:timeout_before_subject" in timeout_run.stderr and elapsed_ms < 4000, "reader timeout path")
        return {"happy_stdout_bytes": len(stdout), "happy_stdout_sha256": hashlib.sha256(stdout).hexdigest(), "timeout_bounded_under_ms": 4000, "timeout_rc_nonzero": True}


def main() -> int:
    parser = argparse.ArgumentParser(); parser.add_argument("--source-root", type=Path, required=True); parser.add_argument("--codex", type=Path, required=True); parser.add_argument("--check", action="store_true", required=True); args = parser.parse_args()
    result: dict[str, Any] = {"authority": {"canary_admission_eligible": False, "canary_launch": False, "matrix_launch": False, "qualification_credit": 0}, "schema_id": "pw-r9-goal-mode-harness-v4-independent-static-check-v1", "status": "FAIL", "workspace_writes": 0}
    try:
        root = args.source_root.resolve(strict=True)
        require(root.name == "goal_mode_empirical_harness_v4", "source root basename")
        bindings, checks = inspect_sources(root)
        help_run = subprocess.run([str(args.codex.resolve()), "exec", "resume", "--help"], cwd=root, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
        require(help_run.returncode == 0 and help_run.stderr == b"" and b"--json" in help_run.stdout and b"--output-last-message" in help_run.stdout and b"--color" not in help_run.stdout, "resume option-scope help")
        reader_result = reader_self_test(root)
        completed = subprocess.run([sys.executable, "-B", str(root / "check_goal_mode_harness.py"), "--codex", str(args.codex.resolve())], cwd=root, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=30)
        require(completed.returncode == 0 and completed.stderr == b"", "data checker process")
        data = json.loads(completed.stdout)
        require(completed.stdout == canon(data), "data checker canonical stdout")
        require(data.get("status") == "PASS_DATA_ONLY_EXPLICIT_RESUME_MODEL_ZERO_CREDIT_NO_LAUNCH" and data.get("authority") == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0} and len(data.get("mutations_rejected", [])) >= 18, "data checker result")
        result.update({"authority": {"canary_admission_eligible": True, "canary_launch": False, "matrix_launch": False, "qualification_credit": 0}, "bindings": bindings, "checks": checks, "data_checker": {"bytes": len(completed.stdout), "sha256": hashlib.sha256(completed.stdout).hexdigest(), "status": data["status"]}, "reader_self_test": reader_result, "residuals": ["Actual V4 Codex 0.148.0 Goal restoration, native Goal context, and gated subject delivery remain untested until one fresh admitted zero-credit canary.", "Direct containment is limited to PIDFD-bound reader cleanup and is not cgroup or PID-namespace containment.", "Requested model and local task record do not attest the platform-effective provider model.", "Canaries 001 and 002 are permanently consumed zero-credit failure evidence and cannot be retried."], "status": "PASS_INDEPENDENT_STATIC_REVIEW_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"})
        os.write(1, canon(result)); return 0
    except Exception as exc:
        result["error"] = f"{type(exc).__name__}:{exc}"; os.write(1, canon(result)); return 1


if __name__ == "__main__":
    raise SystemExit(main())
