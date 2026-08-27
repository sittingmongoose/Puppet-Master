#!/usr/bin/env python3
"""Independent static and mutation checker for the V10 same-task closure harness."""

from __future__ import annotations

import argparse
import ast
import copy
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
from typing import Any


class Invalid(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise Invalid(message)


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in items:
        require(key not in result, f"duplicate JSON key:{key}")
        result[key] = value
    return result


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"


def load(path: Path) -> Any:
    raw = path.read_bytes()
    value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(item)))
    require(raw == canon(value), f"noncanonical:{path.name}")
    return value


def identity(path: Path, label: str) -> dict[str, Any]:
    st = os.lstat(path)
    require(stat.S_ISREG(st.st_mode) and not path.is_symlink(), f"unsafe:{label}")
    raw = path.read_bytes()
    return {
        "bytes": len(raw),
        "mode": f"{stat.S_IMODE(st.st_mode):04o}",
        "path": label,
        "sha256": hashlib.sha256(raw).hexdigest(),
    }


def functions(tree: ast.AST) -> dict[str, ast.FunctionDef | ast.AsyncFunctionDef]:
    return {
        node.name: node
        for node in ast.walk(tree)
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    }


def segment(text: str, tree: ast.AST, name: str) -> str:
    node = functions(tree).get(name)
    require(node is not None, f"missing function:{name}")
    result = ast.get_source_segment(text, node)
    require(isinstance(result, str), f"source segment:{name}")
    return result


def validate(texts: dict[str, str], contract: dict[str, Any]) -> None:
    harness = texts["goal_mode_harness.py"]
    attestor = texts["goal_mode_terminal_closure_attestor.py"]
    htree = ast.parse(harness)
    atree = ast.parse(attestor)
    require(
        contract.get("schema_id") == "pw-r9-goal-mode-empirical-harness-contract-v10"
        and contract.get("status") == "STATIC_SAME_TASK_TERMINAL_CLOSURE_DESIGN_ZERO_CREDIT_NO_LAUNCH",
        "contract schema/status",
    )
    require(
        contract.get("authority")
        == {
            "canary_launch": False,
            "matrix_launch": False,
            "qualification_credit": 0,
            "qualification_streak_clean_matrices": 0,
            "release": False,
        },
        "contract authority",
    )
    require(
        contract["architecture"]["adapter"] == "CODEX_NATIVE_GOAL_SCORED_TURN_THEN_SAME_TASK_TERMINAL_CLOSURE_V1"
        and contract["architecture"]["process_topology"] == "TWO_CODEX_PROCESSES_ONE_PERSISTED_FRESH_TASK_ONE_FRESH_GOAL_TWO_DISTINCT_TURNS",
        "contract topology",
    )
    require(
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
    require(contract["lineage"]["matrix_006"] == "INVALIDATED_NO_LAUNCH_AUTHORITY", "Matrix006 invalidation")
    scored_prompt = segment(harness, htree, "_scored_prompt")
    closure_prompt = segment(harness, htree, "_closure_prompt")
    scored_argv = segment(harness, htree, "_scored_argv")
    closure_argv = segment(harness, htree, "_closure_argv")
    start = segment(harness, htree, "_start")
    run = segment(harness, htree, "run_codex_row")
    check = segment(harness, htree, "check")
    attest_scored = segment(attestor, atree, "_attest_scored")
    attest_scored_public = segment(attestor, atree, "attest_scored")
    attest_final = segment(attestor, atree, "attest_final")
    native_context = segment(attestor, atree, "_native_goal_context")
    require("ga.create_goal_code" in scored_prompt and "ga.reader_code" in scored_prompt and "ga.update_goal_code" not in scored_prompt, "scored prompt phases")
    require("Do not call update_goal in this scored turn" in scored_prompt and "Emit only the subject answer" in scored_prompt, "scored prompt terminal")
    require("ga.update_goal_code" in closure_prompt and "ga.reader_code" not in closure_prompt, "closure Goal-only prompt")
    require(
        "ga.CLOSURE_MARKER" in closure_prompt
        and 'CLOSURE_MARKER = "GOAL_TERMINAL_CLOSURE_COMPLETE_NO_SUBJECT_REPLAY"' in attestor,
        "closure marker",
    )
    require("Do not repeat, revise, explain, replace, or re-answer" in closure_prompt, "closure no replay")
    require(closure_argv.count('"resume"') == 1 and '"--color"' not in closure_argv and "thread_id" in closure_argv, "closure argv")
    require(run.count("_start(") == 2, "process cardinality")
    require(run.count("fifo.unlink()") == 1, "subject FIFO unlink cardinality")
    order = [
        "scored_attestation = ga.attest_scored",
        '_write_json(args.capture_root / "scored_phase_attestation.json"',
        "closure_prompt = _closure_prompt",
        "_closure_argv(",
        "final = ga.attest_final",
    ]
    positions = [run.index(token) for token in order]
    require(positions == sorted(positions) and len(set(positions)) == len(positions), "scored/closure chronology")
    require('ga.require(subject not in closure_prompt, "closure prompt contains subject")' in run, "controller subject replay gate")
    require('closure_box == [scored_attestation["goal"]["thread_id"]]' in run, "controller same-task gate")
    require(
        'goal.get("status") == expected_current_goal_status' in attest_scored
        and '_attest_scored(row_path, capture, codex_home, "active")' in attest_scored_public,
        "scored Goal active",
    )
    require('["get_goal", "create_goal", "get_goal"]' in attest_scored, "scored Goal sequence")
    require("scored_output_last_message.txt" in attest_scored and "expected.encode" in attest_scored, "scored answer custody")
    require("subject not in closure_prompt_raw" in attest_final, "attestor subject prompt exclusion")
    require('["get_goal", "update_goal", "get_goal"]' in attest_final, "closure Goal sequence")
    require("closure_turn != scored[\"goal\"][\"turn_id\"]" in attest_final, "distinct turn")
    require('lifecycle["thread_id"] == scored["goal"]["thread_id"]' in attest_final, "same task")
    require('goal.get("goal_id") == scored["goal"]["goal_id"]' in attest_final, "same Goal")
    require("base._assert_goal(first" in attest_final and '"active"' in attest_final, "closure active precondition")
    require("base._assert_goal(updated" in attest_final and "base._assert_goal(final" in attest_final, "closure terminal states")
    require("messages[-1][\"text\"] == CLOSURE_MARKER" in attest_final, "closure output marker")
    require("answer_lines" in attest_final and "len(answer_lines) == 1" in attest_final, "answer no replay")
    require("scored_process[\"ended_at_ms\"] <= closure_process[\"started_at_ms\"]" in attest_final, "process chronology")
    require("native Goal context cardinality" in native_context and "objective_bound" in native_context, "native Goal context")
    require('Only use status `blocked`' in native_context, "native Goal blocked-status rule")
    require("exec\", \"resume\", \"--help\"" in check and "read from stdin" in check, "resume help check")
    start_tree = ast.parse(start)
    popen_calls = [
        node
        for node in ast.walk(start_tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "Popen"
    ]
    require(
        len(popen_calls) == 1
        and len(popen_calls[0].args) == 1
        and isinstance(popen_calls[0].args[0], ast.Name)
        and popen_calls[0].args[0].id == "argv",
        "closed process launch surface",
    )
    require("str(codex)" in scored_argv and "str(codex)" in closure_argv, "Codex-only argv source")
    require("linux_process_inference" in check and '["omp", "--cwd", "P:\\\\"]' in check, "OMP contract check")


def mutate_text(texts: dict[str, str], file: str, old: str, new: str) -> dict[str, str]:
    result = dict(texts)
    require(old in result[file], f"mutation source absent:{old}")
    result[file] = result[file].replace(old, new, 1)
    return result


def inventory(root: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted(root.iterdir(), key=lambda item: item.name):
        if path.is_file() and not path.is_symlink():
            raw = path.read_bytes()
            rows.append({"bytes": len(raw), "path": path.name, "sha256": hashlib.sha256(raw).hexdigest()})
    return rows


def run(args: argparse.Namespace) -> dict[str, Any]:
    root = args.source_root.resolve()
    source_names = ("goal_mode_harness.py", "goal_mode_terminal_closure_attestor.py")
    texts = {name: (root / name).read_text(encoding="utf-8") for name in source_names}
    contract = load(root / "goal_mode_contract.json")
    validate(texts, contract)
    rejected: list[str] = []
    text_mutations = [
        ("closure_no_resume", "goal_mode_harness.py", '"resume",', '"not-resume",'),
        ("closure_add_color", "goal_mode_harness.py", '"--strict-config",\n        "--json",', '"--strict-config",\n        "--color",\n        "--json",'),
        ("closure_subject_reader", "goal_mode_harness.py", "ga.update_goal_code", "ga.reader_code"),
        ("closure_controller_subject_gate", "goal_mode_harness.py", "subject not in closure_prompt", "True"),
        ("closure_thread_gate", "goal_mode_harness.py", 'closure_box == [scored_attestation["goal"]["thread_id"]]', "True"),
        ("duplicate_fifo_unlink", "goal_mode_harness.py", "        fifo.unlink()\n", "        fifo.unlink()\n        fifo.unlink()\n"),
        (
            "scored_goal_terminal",
            "goal_mode_terminal_closure_attestor.py",
            '_attest_scored(row_path, capture, codex_home, "active")',
            '_attest_scored(row_path, capture, codex_home, "complete")',
        ),
        ("closure_sequence", "goal_mode_terminal_closure_attestor.py", '["get_goal", "update_goal", "get_goal"]', '["get_goal", "get_goal", "update_goal"]'),
        ("closure_same_turn", "goal_mode_terminal_closure_attestor.py", 'closure_turn != scored["goal"]["turn_id"]', 'closure_turn == scored["goal"]["turn_id"]'),
        ("closure_same_thread", "goal_mode_terminal_closure_attestor.py", 'lifecycle["thread_id"] == scored["goal"]["thread_id"]', "True"),
        ("closure_subject_exclusion", "goal_mode_terminal_closure_attestor.py", "subject not in closure_prompt_raw", "True"),
        ("closure_answer_cardinality", "goal_mode_terminal_closure_attestor.py", "len(answer_lines) == 1", "len(answer_lines) >= 1"),
        ("process_chronology", "goal_mode_terminal_closure_attestor.py", 'scored_process["ended_at_ms"] <= closure_process["started_at_ms"]', "True"),
    ]
    for name, file, old, new in text_mutations:
        try:
            validate(mutate_text(texts, file, old, new), contract)
        except Invalid:
            rejected.append(name)
        else:
            raise Invalid(f"mutation accepted:{name}")
    contract_mutations = [
        ("qualification_credit", ("authority", "qualification_credit"), 1),
        ("matrix006_reenabled", ("lineage", "matrix_006"), "PENDING"),
        ("omp_duplicate", ("omp_lane", "duplicate_spawn"), True),
        ("omp_linux_inference", ("omp_lane", "linux_process_inference"), True),
    ]
    for name, path, value in contract_mutations:
        mutated = copy.deepcopy(contract)
        cursor = mutated
        for key in path[:-1]:
            cursor = cursor[key]
        cursor[path[-1]] = value
        try:
            validate(texts, mutated)
        except Invalid:
            rejected.append(name)
        else:
            raise Invalid(f"contract mutation accepted:{name}")
    before = inventory(root)
    env = dict(os.environ)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    completed = subprocess.run(
        [sys.executable, "-B", str(root / "goal_mode_harness.py"), "check", "--codex", str(args.codex.resolve())],
        cwd=root.parent,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
        timeout=30,
        env=env,
    )
    after = inventory(root)
    require(before == after, "source-root write during check")
    require(completed.returncode == 0 and completed.stderr == b"", "harness check process")
    checked = json.loads(completed.stdout, object_pairs_hook=pairs)
    require(checked.get("status") == "PASS_STATIC_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT", "harness check status")
    version = subprocess.run([str(args.codex.resolve()), "--version"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    resume = subprocess.run([str(args.codex.resolve()), "exec", "resume", "--help"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    require(version.returncode == 0 and version.stdout.strip() == b"codex-cli 0.148.0" and version.stderr == b"", "CLI version")
    require(resume.returncode == 0 and resume.stderr == b"" and b"Resume a previous session" in resume.stdout and b"read from stdin" in resume.stdout, "resume help")
    bindings = [
        identity(root / "goal_mode_contract.json", "goal_mode_empirical_harness_v10/goal_mode_contract.json"),
        identity(root / "goal_mode_harness.py", "goal_mode_empirical_harness_v10/goal_mode_harness.py"),
        identity(root / "goal_mode_terminal_closure_attestor.py", "goal_mode_empirical_harness_v10/goal_mode_terminal_closure_attestor.py"),
        identity(root.parent / "goal_mode_empirical_harness_v4" / "read_goal_subject.py", "goal_mode_empirical_harness_v4/read_goal_subject.py"),
        identity(root.parent / "r9_goal_mode_v10_same_task_terminal_closure_design_v1.json", "r9_goal_mode_v10_same_task_terminal_closure_design_v1.json"),
        identity(root.parent / "r9_goal_mode_v9_causal_matrix_005_runtime_failure_receipt_v1.json", "r9_goal_mode_v9_causal_matrix_005_runtime_failure_receipt_v1.json"),
        identity(root.parent / "r9_goal_mode_per_test_taker_binding_correction_v2.json", "r9_goal_mode_per_test_taker_binding_correction_v2.json"),
        identity(root.parent / "r9_goal_mode_omp_windows_transport_clarification_v3.json", "r9_goal_mode_omp_windows_transport_clarification_v3.json"),
    ]
    return {
        "authority": {
            "canary_admission_eligible": True,
            "canary_launch": False,
            "matrix_launch": False,
            "qualification_credit": 0,
            "qualification_streak_clean_matrices": 0,
            "release": False,
        },
        "bindings": bindings,
        "checks": {
            "closure_only_goal_actions": "PASS_STATIC",
            "matrix006_invalidated": True,
            "no_omp_launch_or_linux_inference": "PASS_STATIC",
            "same_goal_same_task_distinct_turns": "PASS_STATIC",
            "scored_answer_sealed_before_closure": "PASS_STATIC",
            "subject_absent_from_closure_prompt": "PASS_STATIC",
        },
        "data_check": {
            "rc": completed.returncode,
            "stderr_bytes": len(completed.stderr),
            "stderr_sha256": hashlib.sha256(completed.stderr).hexdigest(),
            "stdout_bytes": len(completed.stdout),
            "stdout_sha256": hashlib.sha256(completed.stdout).hexdigest(),
            "workspace_writes": 0,
        },
        "first_mismatch": None,
        "mutations_rejected": rejected,
        "schema_id": "pw-r9-goal-mode-harness-v10-independent-static-check-v1",
        "status": "PASS_INDEPENDENT_STATIC_CHECK_V10_TERMINAL_CLOSURE_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--codex", type=Path, required=True)
    parser.add_argument("--check", action="store_true", required=True)
    args = parser.parse_args()
    try:
        result = run(args)
        sys.stdout.buffer.write(canon(result))
        return 0
    except (Invalid, OSError, UnicodeError, subprocess.SubprocessError) as exc:
        sys.stdout.buffer.write(
            canon(
                {
                    "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
                    "error": str(exc),
                    "first_mismatch": str(exc),
                    "schema_id": "pw-r9-goal-mode-harness-v10-independent-static-check-v1",
                    "status": "FAIL_INDEPENDENT_STATIC_CHECK_ZERO_CREDIT_NO_LAUNCH",
                }
            )
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
