#!/usr/bin/env python3
"""Prefix-aware V11 harness built on the frozen V10 process controller."""

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

import goal_mode_terminal_closure_attestor as ga


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
V10_ROOT = BASE / "goal_mode_empirical_harness_v10"
V10_HARNESS_PATH = V10_ROOT / "goal_mode_harness.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_harness_v10", V10_HARNESS_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V10 harness loader unavailable")
v10 = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v10
SPEC.loader.exec_module(v10)


ADMISSION_SCHEMA = "pw-r9-goal-mode-row-admission-v11"
RESULT_SCHEMA = "pw-r9-goal-mode-v11-row-result-v1"
STDERR_SCHEMA = "pw-r9-goal-mode-v11-stderr-classification-v1"
READER = BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"
DESIGN = BASE / "r9_goal_mode_v11_historical_scored_prefix_successor_design_v1.json"
V10_FAILURE = BASE / "r9_goal_mode_v10_terminal_closure_canary_001_runtime_failure_receipt_v1.json"
PER_TEST_TAKER = BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json"
OMP_CLARIFICATION = BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json"
SOURCES = (
    ("goal_mode_empirical_harness_v11/goal_mode_contract.json", ROOT / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v11/goal_mode_harness.py", ROOT / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v11/goal_mode_terminal_closure_attestor.py", ROOT / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_harness.py", V10_ROOT / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_terminal_closure_attestor.py", V10_ROOT / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", READER),
    (DESIGN.name, DESIGN),
    (V10_FAILURE.name, V10_FAILURE),
    (PER_TEST_TAKER.name, PER_TEST_TAKER),
    (OMP_CLARIFICATION.name, OMP_CLARIFICATION),
)


for name, value in {
    "ROOT": ROOT,
    "BASE": BASE,
    "READER": READER,
    "DESIGN": DESIGN,
    "MATRIX_005_FAILURE": V10_FAILURE,
    "PER_TEST_TAKER": PER_TEST_TAKER,
    "OMP_CLARIFICATION": OMP_CLARIFICATION,
    "SOURCES": SOURCES,
    "ADMISSION_SCHEMA": ADMISSION_SCHEMA,
    "ADAPTER": ga.ADAPTER,
    "RESULT_SCHEMA": RESULT_SCHEMA,
    "STDERR_SCHEMA": STDERR_SCHEMA,
    "ga": ga,
}.items():
    setattr(v10, name, value)


def _bindings() -> list[dict[str, Any]]:
    return v10._bindings()


def _load_admission(path: Path, row_path: Path, row: dict[str, Any]) -> dict[str, Any]:
    value = ga.load_json(path, 8_000_000)
    ga.require(isinstance(value, dict), "admission object")
    ga.base._exact_keys(value, {"authority", "bindings", "review", "row_spec", "schema_id", "status"}, "admission")
    ga.require(
        value["schema_id"] == ADMISSION_SCHEMA
        and value["status"] == "PASS_INDEPENDENT_V11_PREFIX_AWARE_TERMINAL_CLOSURE_HARNESS_REVIEW",
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
        review.get("schema_id") == "pw-r9-goal-mode-harness-v11-independent-static-review-v1"
        and review.get("status")
        == "PASS_INDEPENDENT_STATIC_REVIEW_V11_PREFIX_AWARE_TERMINAL_CLOSURE_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
        and review.get("first_mismatch") is None,
        "review status",
    )
    ga.require(review.get("bindings") == _bindings(), "review bindings")
    raw = ga.base._read_regular(row_path, 2_000_000)
    ga.require(value["row_spec"] == {"bytes": len(raw), "sha256": ga.sha256(raw)}, "row binding")
    return value


v10._load_admission = _load_admission


def make_row_spec(args: argparse.Namespace) -> dict[str, Any]:
    return v10.make_row_spec(args)


def run_codex_row(args: argparse.Namespace) -> dict[str, Any]:
    result = v10.run_codex_row(args)
    ga.require(
        result.get("attestation", {}).get("status")
        == "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_PREFIX_AWARE_ZERO_CREDIT",
        "V11 final attestation status",
    )
    result["schema_id"] = RESULT_SCHEMA
    result["status"] = "PASS_NATIVE_GOAL_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AWARE_ZERO_CREDIT"
    result["stderr_classification"]["schema_id"] = STDERR_SCHEMA
    return result


def check(args: argparse.Namespace) -> dict[str, Any]:
    contract = ga.load_json(ROOT / "goal_mode_contract.json", 8_000_000)
    ga.require(
        contract["schema_id"] == "pw-r9-goal-mode-empirical-harness-contract-v11"
        and contract["status"] == "STATIC_PREFIX_AWARE_SAME_TASK_TERMINAL_CLOSURE_ZERO_CREDIT_NO_LAUNCH"
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
        contract["architecture"]["adapter"] == ga.ADAPTER
        and contract["architecture"]["historical_scored_rollout"]
        == "EXACT_STORED_PREFIX_OF_FINAL_SAME_TASK_ROLLOUT_WITH_ALL_OTHER_FIELDS_RECOMPUTED",
        "contract architecture",
    )
    ga.require(
        contract["historical_prefix_contract"]
        == {
            "closure_launch_receipt_binds_stored_scored_attestation": True,
            "exact_prefix_required": True,
            "final_rollout_must_be_strictly_longer": True,
            "logical_rollout_path_unchanged": True,
            "non_rollout_scored_fields_recomputed": True,
            "prefix_must_end_lf": True,
            "prefix_sha256_and_bytes_reopened": True,
            "stored_scored_attestation_must_equal_recomputed_projection": True,
        },
        "historical prefix contract",
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
    for name in ("goal_mode_harness.py", "goal_mode_terminal_closure_attestor.py"):
        ast.parse((ROOT / name).read_text(encoding="utf-8"), filename=name)
    version = subprocess.run([str(args.codex), "--version"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    resume = subprocess.run([str(args.codex), "exec", "resume", "--help"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    ga.require(version.returncode == 0 and version.stderr == b"" and version.stdout.strip() == b"codex-cli 0.148.0", "Codex version")
    ga.require(
        resume.returncode == 0
        and resume.stderr == b""
        and b"Resume a previous session" in resume.stdout
        and b"read from stdin" in resume.stdout,
        "Codex resume surface",
    )
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": _bindings(),
        "checks": {
            "exact_historical_rollout_prefix": "PASS_STATIC",
            "matrix006_invalidated": True,
            "non_rollout_scored_recomputation": "PASS_STATIC",
            "omp_lane": "EXISTING_WINDOWS_OMP_CWD_P_DRIVE_NO_DUPLICATE",
            "same_task_resume": "PASS_STATIC_SUPPORTED_SURFACE",
            "source_ast": "PASS",
            "v10_canary_failure_preserved": True,
        },
        "schema_id": "pw-r9-goal-mode-harness-check-v11",
        "status": "PASS_STATIC_PREFIX_AWARE_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT",
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
    run.add_argument("--timeout-seconds", type=int, default=v10.DEFAULT_TIMEOUT_SECONDS)
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
                "schema_id": "pw-r9-goal-mode-harness-failure-v11",
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
