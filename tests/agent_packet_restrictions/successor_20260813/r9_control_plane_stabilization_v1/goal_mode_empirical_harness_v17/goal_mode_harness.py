#!/usr/bin/env python3
"""Create-only V17 wrapper around frozen V15 three-turn runtime."""

from __future__ import annotations

import ast
import importlib.util
from pathlib import Path
import subprocess
import sys
from typing import Any

import goal_mode_three_turn_attestor as ga


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
V15_ROOT = BASE / "goal_mode_empirical_harness_v15"
V15_PATH = V15_ROOT / "goal_mode_harness.py"
V16_ROOT = BASE / "goal_mode_empirical_harness_v16"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_harness_v15_for_v17", V15_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V15 harness loader unavailable")
v15 = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v15
sys.path.insert(0, str(V15_ROOT))
SPEC.loader.exec_module(v15)
v15.ga = ga
v15.v10.ga = ga


ADMISSION_SCHEMA = "pw-r9-goal-mode-row-admission-v17"
RESULT_SCHEMA = "pw-r9-goal-mode-v17-row-result-v1"
STDERR_SCHEMA = "pw-r9-goal-mode-v17-stderr-classification-v1"
FAILURE_SCHEMA = "pw-r9-goal-mode-harness-failure-v17"
DESIGN = BASE / "r9_goal_mode_v17_phase_aware_historical_bootstrap_reopen_successor_design_v1.json"
V14_FAILURE = BASE / "r9_goal_mode_v14_structural_context_matrix_001_runtime_failure_receipt_v1.json"
V15_FAILURE = BASE / "r9_goal_mode_v15_three_turn_canary_001_runtime_failure_receipt_v1.json"
V16_FAILURE = BASE / "r9_goal_mode_v16_three_turn_canary_001_runtime_failure_receipt_v1.json"
PER_TEST_TAKER = BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json"
OMP_CLARIFICATION = BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json"
SOURCES = (
    ("goal_mode_empirical_harness_v17/goal_mode_contract.json", ROOT / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v17/goal_mode_harness.py", ROOT / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v17/goal_mode_three_turn_attestor.py", ROOT / "goal_mode_three_turn_attestor.py"),
    ("goal_mode_empirical_harness_v16/goal_mode_contract.json", V16_ROOT / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v16/goal_mode_harness.py", V16_ROOT / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v16/goal_mode_three_turn_attestor.py", V16_ROOT / "goal_mode_three_turn_attestor.py"),
    ("goal_mode_empirical_harness_v15/goal_mode_contract.json", V15_ROOT / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v15/goal_mode_harness.py", V15_PATH),
    ("goal_mode_empirical_harness_v15/goal_mode_three_turn_attestor.py", V15_ROOT / "goal_mode_three_turn_attestor.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v10" / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v13/goal_mode_terminal_closure_attestor.py", BASE / "goal_mode_empirical_harness_v13" / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"),
    (DESIGN.name, DESIGN),
    (V14_FAILURE.name, V14_FAILURE),
    (V15_FAILURE.name, V15_FAILURE),
    (V16_FAILURE.name, V16_FAILURE),
    (PER_TEST_TAKER.name, PER_TEST_TAKER),
    (OMP_CLARIFICATION.name, OMP_CLARIFICATION),
)


for _name in ("ADMISSION_SCHEMA", "RESULT_SCHEMA", "STDERR_SCHEMA", "FAILURE_SCHEMA"):
    setattr(v15, _name, globals()[_name])


def _bindings() -> list[dict[str, Any]]:
    return [v15.v10._identity(label, path) for label, path in SOURCES]


def _load_admission(path: Path, row_path: Path, row: dict[str, Any]) -> dict[str, Any]:
    value = ga.load_json(path, 8_000_000)
    ga.require(isinstance(value, dict), "admission object")
    ga.base._exact_keys(value, {"authority", "bindings", "review", "row_spec", "schema_id", "status"}, "admission")
    ga.require(
        value["schema_id"] == ADMISSION_SCHEMA
        and value["status"] == "PASS_INDEPENDENT_V17_THREE_TURN_HARNESS_REVIEW",
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
    ga.require(v15.v10._identity(reference["path"], review_path) == reference, "review identity")
    review = ga.load_json(review_path, 16_000_000)
    ga.require(
        review.get("schema_id") == "pw-r9-goal-mode-harness-v17-independent-static-review-v1"
        and review.get("status") == "PASS_INDEPENDENT_STATIC_REVIEW_V17_THREE_TURN_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
        and review.get("first_mismatch") is None
        and review.get("bindings") == _bindings(),
        "review verdict",
    )
    raw = ga.base._read_regular(row_path, 2_000_000)
    ga.require(value["row_spec"] == {"bytes": len(raw), "sha256": ga.sha256(raw)}, "row binding")
    return value


def check(args: Any) -> dict[str, Any]:
    contract = ga.load_json(ROOT / "goal_mode_contract.json", 8_000_000)
    ga.require(
        contract["schema_id"] == "pw-r9-goal-mode-empirical-harness-contract-v17"
        and contract["status"] == "STATIC_THREE_TURN_GOAL_ARCHITECTURE_PHASE_AWARE_HISTORICAL_REOPEN_ZERO_CREDIT_NO_LAUNCH"
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
            "goal_identity_proof": {
                "cross_binding": "NATIVE_THREADID_TO_FRESH_THREAD_GOALS_ROW_AFTER_EXACT_NATIVE_ACTION_SEQUENCE",
                "durable_goal_uuid_source": "READ_ONLY_CODEX_GOALS_DATABASE_THREAD_GOALS.GOAL_ID",
                "native_projection_identity_field": "threadId",
            },
            "goal_status_cross_binding": "ACTIVE_BEFORE_CLOSURE_AND_COMPLETE_DURING_FINAL_REOPEN",
            "historical_bootstrap_reopen": "INITIAL_ABSENCE_PROOF_PLUS_POST_DELIVERY_EXACT_TEMPORAL_RECEIPT_REDERIVATION",
            "process_topology": "THREE_CODEX_PROCESSES_ONE_FRESH_PERSISTED_TASK_ONE_FRESH_GOAL_THREE_DISTINCT_TURNS",
            "scored_reader_result": "INDEPENDENT_DURABLE_TOOL_OUTPUT_AND_SUBJECT_BYTE_REDERIVATION",
            "subject_release": "ONLY_AFTER_COMPLETED_ACTIVATION_TURN_ACTIVE_GOAL_REOPEN_AND_PROJECTION_DATABASE_CROSS_BINDING",
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
    bindings = _bindings()
    ga.require(len(bindings) == len(SOURCES), "binding count")
    v15_source = V15_PATH.read_text(encoding="utf-8")
    v15_tree = ast.parse(v15_source, filename=str(V15_PATH))
    wrapper_tree = ast.parse((ROOT / "goal_mode_harness.py").read_text(encoding="utf-8"), filename="goal_mode_harness.py")
    attestor_source = (ROOT / "goal_mode_three_turn_attestor.py").read_text(encoding="utf-8")
    ast.parse(attestor_source, filename="goal_mode_three_turn_attestor.py")
    ga.require(v15_source.index('"bootstrap_attestation.json"') < v15_source.index("os.mkfifo") < v15_source.index('"scored_prompt.txt"'), "subject channel ordering")
    precreate_calls = sum(isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "_precreate_last" for node in ast.walk(v15_tree))
    ga.require(precreate_calls == 3, "three output precreate calls")
    ga.require('created["goal_id"]' not in attestor_source and 'reopened["goal_id"]' not in attestor_source, "stale native projection goal_id assumption")
    ga.require("READ_ONLY_CODEX_GOALS_DATABASE_THREAD_GOALS.GOAL_ID" in attestor_source and 'created["threadId"]' in attestor_source, "projection/database proof source")
    ga.require(
        "def _validate_subject_temporal_state(" in attestor_source
        and 'require(historical_reopen, "subject existed during initial bootstrap")' in attestor_source
        and '"historical bootstrap/release/delivery temporal order"' in attestor_source
        and 'current_status = "active" if require_active else "complete"' in attestor_source,
        "phase-aware historical bootstrap source",
    )
    ga.require(
        "def _scored_common(" in attestor_source
        and "v15.legacy._reader_result(" in attestor_source
        and 'reader = {**reader, "output_line": reader_result["tool_output_line"]}' in attestor_source
        and "v15._scored_common = _scored_common" in attestor_source,
        "scored reader result rederivation",
    )
    sample = {
        "createdAt": 1,
        "objective": "o",
        "status": "active",
        "threadId": "t",
        "timeUsedSeconds": 0,
        "tokensUsed": 0,
        "updatedAt": 1,
    }
    ga._assert_native_goal_projection(sample, "t", "o", "active", "static sample")
    rejected_extra = False
    try:
        ga._assert_native_goal_projection({**sample, "goal_id": "fabricated"}, "t", "o", "active", "static mutant")
    except ga.Invalid:
        rejected_extra = True
    ga.require(rejected_extra, "native projection extra goal_id mutant accepted")
    forbidden_processes: list[str] = []
    for tree in (v15_tree, wrapper_tree):
        for node in ast.walk(tree):
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
    v14_failure = ga.load_json(V14_FAILURE, 8_000_000)
    v15_failure = ga.load_json(V15_FAILURE, 16_000_000)
    v16_failure = ga.load_json(V16_FAILURE, 16_000_000)
    ga.require(v14_failure.get("status") == "FAIL_PERMANENT_V14_MATRIX_001_PRE_GOAL_ACTION_ZERO_CREDIT_NO_RETRY", "V14 failure preservation")
    ga.require(
        v15_failure.get("status") == "FAIL_PERMANENT_V15_CANARY_001_NATIVE_GOAL_ATTESTATION_PROJECTION_SOURCE_MISMATCH_ZERO_CREDIT_NO_RETRY"
        and v15_failure.get("authority", {}).get("qualification_credit") == 0
        and v15_failure.get("goal_lifecycle", {}).get("subject_release") is False
        and v15_failure.get("failure", {}).get("persisted_goal_row", {}).get("status") == "active",
        "V15 failure preservation",
    )
    ga.require(
        v16_failure.get("status") == "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY"
        and v16_failure.get("authority", {}).get("qualification_credit") == 0
        and v16_failure.get("diagnosis", {}).get("family") == "HISTORICAL_BOOTSTRAP_REOPEN_PHASE_UNAWARE_SUBJECT_ABSENCE"
        and v16_failure.get("accounting", {}).get("aborted_unlaunched") == 2,
        "V16 failure preservation",
    )
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings,
        "checks": {
            "bootstrap_subject_absent": "PASS_STATIC",
            "codex_cli_version": "codex-cli 0.148.0",
            "goal_identity_cross_binding": "NATIVE_THREADID_PLUS_FRESH_THREAD_GOALS_GOAL_ID",
            "goal_projection_goal_id_field": "FORBIDDEN_AND_MUTANT_REJECTED",
            "historical_bootstrap_reopen": "PASS_STATIC_PHASE_AWARE_INITIAL_ABSENCE_OR_EXACT_POST_DELIVERY_TEMPORAL_RECEIPTS",
            "matrix_qualification_streak": "0_OF_2",
            "omp_lane": "EXISTING_WINDOWS_OMP_CWD_P_DRIVE_NO_DUPLICATE",
            "same_task_three_turn_resume": "PASS_STATIC_SUPPORTED_SURFACE",
            "scored_reader_result": "PASS_STATIC_DERIVED_FROM_DURABLE_TOOL_OUTPUT_AND_SUBJECT_BYTES",
            "source_ast": "PASS",
            "v14_matrix_001": "PERMANENT_FAIL_ZERO_CREDIT",
            "v15_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY",
            "v16_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY",
        },
        "schema_id": "pw-r9-goal-mode-harness-check-v17",
        "status": "PASS_STATIC_V17_THREE_TURN_PHASE_AWARE_HISTORICAL_REOPEN_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT",
    }


v15.ADMISSION_SCHEMA = ADMISSION_SCHEMA
v15.RESULT_SCHEMA = RESULT_SCHEMA
v15.STDERR_SCHEMA = STDERR_SCHEMA
v15.FAILURE_SCHEMA = FAILURE_SCHEMA
v15.SOURCES = SOURCES
v15._bindings = _bindings
v15._load_admission = _load_admission
v15.check = check

main = v15.main


if __name__ == "__main__":
    raise SystemExit(main())
