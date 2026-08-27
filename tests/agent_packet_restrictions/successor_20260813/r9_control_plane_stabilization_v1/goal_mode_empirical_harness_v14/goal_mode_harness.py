#!/usr/bin/env python3
"""V14 matrix admission wrapper over the proven V13 native-Goal lifecycle."""

from __future__ import annotations

import argparse
import ast
import importlib.util
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
from typing import Any


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
V13_ROOT = BASE / "goal_mode_empirical_harness_v13"
V13_PATH = V13_ROOT / "goal_mode_harness.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_harness_v13_for_matrix", V13_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V13 harness loader unavailable")
sys.path.insert(0, str(V13_ROOT))
v13 = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v13
SPEC.loader.exec_module(v13)
ga = v13.ga


ADMISSION_SCHEMA = "pw-r9-goal-mode-matrix-row-admission-v14"
ADMISSION_STATUS = "PASS_INDEPENDENT_V14_MATRIX_ROW_NATIVE_GOAL_HARNESS_REVIEW"
RESULT_SCHEMA = "pw-r9-goal-mode-v14-matrix-row-result-v1"
RESULT_STATUS = "PASS_NATIVE_GOAL_MATRIX_ROW_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_ZERO_CREDIT"
REVIEW_SCHEMA = "pw-r9-goal-mode-harness-v14-independent-static-review-v1"
REVIEW_STATUS = "PASS_INDEPENDENT_STATIC_REVIEW_V14_MATRIX_ROW_NATIVE_GOAL_HARNESS_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
DESIGN = BASE / "r9_goal_mode_v14_matrix_harness_successor_design_v1.json"
CANARY = BASE / "r9_goal_mode_v13_structural_context_terminal_closure_canary_001_success_receipt_v1.json"
PER_TEST_TAKER = BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json"
OMP_CLARIFICATION = BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json"
SOURCES = (
    ("goal_mode_empirical_harness_v14/goal_mode_contract.json", ROOT / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v14/goal_mode_harness.py", ROOT / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v13/goal_mode_contract.json", V13_ROOT / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v13/goal_mode_harness.py", V13_ROOT / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v13/goal_mode_terminal_closure_attestor.py", V13_ROOT / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v11/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v11" / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v11/goal_mode_terminal_closure_attestor.py", BASE / "goal_mode_empirical_harness_v11" / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v10" / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_terminal_closure_attestor.py", BASE / "goal_mode_empirical_harness_v10" / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"),
    (DESIGN.name, DESIGN),
    (CANARY.name, CANARY),
    (PER_TEST_TAKER.name, PER_TEST_TAKER),
    (OMP_CLARIFICATION.name, OMP_CLARIFICATION),
)


def _bindings() -> list[dict[str, Any]]:
    return [v13.v11.v10._identity(label, path) for label, path in SOURCES]


def _load_admission(path: Path, row_path: Path, row: dict[str, Any]) -> dict[str, Any]:
    value = ga.load_json(path, 8_000_000)
    ga.require(isinstance(value, dict), "admission object")
    ga.base._exact_keys(value, {"authority", "bindings", "review", "row_spec", "schema_id", "status"}, "admission")
    ga.require(value["schema_id"] == ADMISSION_SCHEMA and value["status"] == ADMISSION_STATUS, "matrix admission schema/status")
    ga.require(
        value["authority"]
        == {
            "adapter": ga.ADAPTER,
            "canary_launch": False,
            "launch_count": 1,
            "matrix_launch": True,
            "qualification": False,
            "retry": False,
            "row_id": row["row_id"],
            "run_id": row["run_id"],
        },
        "matrix admission authority",
    )
    ga.require(value["bindings"] == _bindings(), "matrix admission bindings")
    reference = value["review"]
    ga.require(isinstance(reference, dict), "review reference")
    ga.base._exact_keys(reference, {"bytes", "mode", "path", "sha256"}, "review reference")
    ga.require(reference["path"] == Path(reference["path"]).name, "review basename")
    review_path = path.parent / reference["path"]
    ga.require(v13.v11.v10._identity(reference["path"], review_path) == reference, "review identity")
    review = ga.load_json(review_path, 16_000_000)
    ga.require(
        review.get("schema_id") == REVIEW_SCHEMA
        and review.get("status") == REVIEW_STATUS
        and review.get("first_mismatch") is None
        and review.get("bindings") == _bindings(),
        "matrix harness review verdict",
    )
    raw = ga.base._read_regular(row_path, 2_000_000)
    ga.require(value["row_spec"] == {"bytes": len(raw), "sha256": ga.sha256(raw)}, "row binding")
    return value


for module in (v13, v13.v11, v13.v11.v10):
    module.SOURCES = SOURCES
    module.ADMISSION_SCHEMA = ADMISSION_SCHEMA
    module._bindings = _bindings
v13.v11.v10._load_admission = _load_admission


def make_row_spec(args: argparse.Namespace) -> dict[str, Any]:
    return v13.make_row_spec(args)


def run_codex_row(args: argparse.Namespace) -> dict[str, Any]:
    result = v13.run_codex_row(args)
    ga.require(result.get("status") == "PASS_NATIVE_GOAL_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_ZERO_CREDIT", "V13 row result")
    result["schema_id"] = RESULT_SCHEMA
    result["status"] = RESULT_STATUS
    return result


def check(args: argparse.Namespace) -> dict[str, Any]:
    contract = ga.load_json(ROOT / "goal_mode_contract.json", 8_000_000)
    ga.require(
        contract.get("schema_id") == "pw-r9-goal-mode-empirical-harness-contract-v14"
        and contract.get("status") == "STATIC_MATRIX_ROW_ADMISSION_WRAPPER_ZERO_CREDIT_NO_LAUNCH"
        and contract.get("authority") == {"matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False},
        "V14 contract",
    )
    ga.require(
        contract.get("matrix") == {"fail_fast": True, "max_parallel": 1, "no_retry": True, "rows": 291, "scored_subject_deliveries_per_row": 1, "two_consecutive_clean_matrices_required": True},
        "matrix contract",
    )
    ga.require(
        contract.get("omp_lane") == {"duplicate_spawn": False, "goal_mode_required_per_fresh_test_taker": True, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False, "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED"},
        "OMP boundary",
    )
    ast.parse((ROOT / "goal_mode_harness.py").read_text(encoding="utf-8"), filename="goal_mode_harness.py")
    version = subprocess.run([str(args.codex), "--version"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    resume = subprocess.run([str(args.codex), "exec", "resume", "--help"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    ga.require(version.returncode == 0 and version.stderr == b"" and version.stdout.strip() == b"codex-cli 0.148.0", "Codex version")
    ga.require(resume.returncode == 0 and resume.stderr == b"" and b"Resume a previous session" in resume.stdout and b"read from stdin" in resume.stdout, "Codex resume surface")
    return {
        "authority": {"matrix_launch": False, "qualification_credit": 0},
        "bindings": _bindings(),
        "checks": {"matrix_row_admission": "PASS_STATIC", "same_task_terminal_closure": "PASS_INHERITED_V13", "serialized": True, "structural_goal_context": "PASS_INHERITED_V13", "v13_canary": "PASS_BOUND_ZERO_CREDIT"},
        "schema_id": "pw-r9-goal-mode-harness-check-v14",
        "status": "PASS_STATIC_MATRIX_ROW_NATIVE_GOAL_WRAPPER_DATA_ONLY_NO_LAUNCH_ZERO_CREDIT",
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
    run.add_argument("--timeout-seconds", type=int, default=v13.v11.v10.DEFAULT_TIMEOUT_SECONDS)
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
        emit({"authority": {"qualification_credit": 0, "subject_release": False}, "error": str(exc), "schema_id": "pw-r9-goal-mode-harness-failure-v14", "status": "FAIL_CLOSED_ZERO_CREDIT_NO_RETRY"})
        return 1
    finally:
        while v13.v11.v10._ACTIVE:
            process = v13.v11.v10._ACTIVE.pop()
            v13.v11.v10._terminate(process)
            for stream in (process.stdin, process.stdout, process.stderr):
                try:
                    if stream is not None:
                        stream.close()
                except OSError:
                    pass


if __name__ == "__main__":
    raise SystemExit(main())
