#!/usr/bin/env python3
"""Create-only V19 wrapper with exact Goal batches and pure sealed reopen."""

from __future__ import annotations

import argparse
import ast
import importlib.util
from pathlib import Path
import subprocess
import sys
from typing import Any

import goal_mode_three_turn_attestor as ga


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
V17_ROOT = BASE / "goal_mode_empirical_harness_v17"
V17_PATH = V17_ROOT / "goal_mode_harness.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_harness_v17_for_v19", V17_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V17 harness loader unavailable")
v17 = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v17
sys.path.insert(0, str(V17_ROOT))
SPEC.loader.exec_module(v17)
v15 = v17.v15
v17.ga = ga
v15.ga = ga
v15.v10.ga = ga


ADMISSION_SCHEMA = "pw-r9-goal-mode-row-admission-v19"
RESULT_SCHEMA = "pw-r9-goal-mode-v19-row-result-v1"
STDERR_SCHEMA = "pw-r9-goal-mode-v19-stderr-classification-v1"
FAILURE_SCHEMA = "pw-r9-goal-mode-harness-failure-v19"
DESIGN = BASE / "r9_goal_mode_v19_closed_runtime_module_contract_successor_design_v1.json"
V14_FAILURE = BASE / "r9_goal_mode_v14_structural_context_matrix_001_runtime_failure_receipt_v1.json"
V15_FAILURE = BASE / "r9_goal_mode_v15_three_turn_canary_001_runtime_failure_receipt_v1.json"
V16_FAILURE = BASE / "r9_goal_mode_v16_three_turn_canary_001_runtime_failure_receipt_v1.json"
V17_FAILURE = BASE / "r9_goal_mode_v17_three_turn_canary_001_runtime_failure_receipt_v1.json"
V18_FAILURE = BASE / "r9_goal_mode_v18_three_turn_canary_001_runtime_failure_receipt_v1.json"
PER_TEST_TAKER = BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json"
OMP_CLARIFICATION = BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json"
SOURCES = (
    ("goal_mode_empirical_harness_v19/goal_mode_contract.json", ROOT / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v19/goal_mode_harness.py", ROOT / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v19/goal_mode_three_turn_attestor.py", ROOT / "goal_mode_three_turn_attestor.py"),
    ("goal_mode_empirical_harness_v17/goal_mode_contract.json", V17_ROOT / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v17/goal_mode_harness.py", V17_PATH),
    ("goal_mode_empirical_harness_v17/goal_mode_three_turn_attestor.py", V17_ROOT / "goal_mode_three_turn_attestor.py"),
    ("goal_mode_empirical_harness_v15/goal_mode_contract.json", BASE / "goal_mode_empirical_harness_v15" / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v15/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v15" / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v15/goal_mode_three_turn_attestor.py", BASE / "goal_mode_empirical_harness_v15" / "goal_mode_three_turn_attestor.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v10" / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v13/goal_mode_terminal_closure_attestor.py", BASE / "goal_mode_empirical_harness_v13" / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"),
    (DESIGN.name, DESIGN),
    (V14_FAILURE.name, V14_FAILURE),
    (V15_FAILURE.name, V15_FAILURE),
    (V16_FAILURE.name, V16_FAILURE),
    (V17_FAILURE.name, V17_FAILURE),
    (V18_FAILURE.name, V18_FAILURE),
    (PER_TEST_TAKER.name, PER_TEST_TAKER),
    (OMP_CLARIFICATION.name, OMP_CLARIFICATION),
)


def _bindings() -> list[dict[str, Any]]:
    return [v15.v10._identity(label, path) for label, path in SOURCES]


def _load_admission(path: Path, row_path: Path, row: dict[str, Any]) -> dict[str, Any]:
    value = ga.load_json(path, 8_000_000)
    ga.require(isinstance(value, dict), "admission object")
    ga.base._exact_keys(value, {"authority", "bindings", "review", "row_spec", "schema_id", "status"}, "admission")
    ga.require(value["schema_id"] == ADMISSION_SCHEMA and value["status"] == "PASS_INDEPENDENT_V19_THREE_TURN_HARNESS_REVIEW", "admission schema/status")
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
        review.get("schema_id") == "pw-r9-goal-mode-harness-v19-independent-static-review-v1"
        and review.get("status") == "PASS_INDEPENDENT_STATIC_REVIEW_V19_CLOSED_RUNTIME_API_EXECUTED_PRE_MODEL_PREFLIGHT_EXACT_ORDERED_GOAL_BATCH_PURE_SEALED_REOPEN_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
        and review.get("first_mismatch") is None
        and review.get("bindings") == _bindings(),
        "review verdict",
    )
    raw = ga.base._read_regular(row_path, 2_000_000)
    ga.require(value["row_spec"] == {"bytes": len(raw), "sha256": ga.sha256(raw)}, "row binding")
    return value


def _bootstrap_prompt(row: dict[str, Any]) -> bytes:
    direct_get = ga.prior.get_goal_code().rstrip("\n")
    direct_create = ga.prior.create_goal_code(row["objective"]).rstrip("\n")
    batch = ga.batch_goal_code(["get_goal", "create_goal", "get_goal"], row["objective"])
    prompt = f"""R9 NATIVE GOAL MODE SUBJECT-FREE ACTIVATION TURN — NO SCORED SUBJECT IS PRESENT.

You are one fresh empirical test taker. Before any file access, command, web request, collaboration action, memory action, delegation, or subject reasoning, execute exactly this native Goal lifecycle: get_goal must prove null, create_goal must create the exact objective below in active state, and get_goal must reopen that same active Goal.

Use exactly one of these two representations:
A. If Goal tools are directly exposed, invoke three separate direct native calls in this order with the exact arguments:
1.
{direct_get}
2.
{direct_create}
3.
{direct_get}
B. Otherwise invoke exactly one code-mode exec call whose complete source is exactly:
{batch}

Do not mix representations. Do not invoke any other tool or method.

Commitments only: run_id={row['run_id']}; row_id={row['row_id']}; attempt=0; criteria_sha256={ga.sha256(ga.canon(row['criteria'], newline=False))}; control_envelope_sha256={ga.sha256(ga.canon(row['control_envelope'], newline=False))}; subject_commitment_sha256={row['subject_utf8_sha256']}; subject_utf8_bytes={row['subject_utf8_bytes']}.

The scored subject is not contained in this turn. After the exact lifecycle succeeds, invoke no other action, perform no subject work, and leave the Goal active. Emit exactly {ga.BOOTSTRAP_MARKER} as the terminal assistant message with no decoration.
"""
    raw = prompt.encode()
    ga.require(row["subject_utf8_sha256"].encode() in raw and str(row["subject_utf8_bytes"]).encode() in raw, "bootstrap commitments")
    return raw


def _closure_prompt(row: dict[str, Any], scored_gate: dict[str, Any]) -> bytes:
    direct_get = ga.prior.get_goal_code().rstrip("\n")
    direct_update = ga.prior.update_goal_code().rstrip("\n")
    batch = ga.batch_goal_code(["get_goal", "update_goal", "get_goal"], row["objective"])
    prompt = f"""R9 NATIVE GOAL MODE SUBJECT-FREE TERMINAL CLOSURE TURN — NO SCORED SUBJECT IS PRESENT.

This is the same fresh task and same native Goal used for the single scored subject. The immutable scored release gate is sha256={ga.sha256(ga.canon(scored_gate))}; bytes={len(ga.canon(scored_gate))}. The Goal must still be active before closure.

Use exactly one of these two representations:
A. If Goal tools are directly exposed, invoke three separate direct native calls in this order:
1.
{direct_get}
2.
{direct_update}
3.
{direct_get}
B. Otherwise invoke exactly one code-mode exec call whose complete source is exactly:
{batch}

Do not mix representations. Require the first projection active, the update projection complete, and the last projection the same complete Goal. Invoke no file, command, web, collaboration, memory, delegation, subject, or other action. Perform no scored-subject reasoning. After the exact lifecycle succeeds, emit exactly {ga.CLOSURE_MARKER} as the terminal assistant message with no decoration.
"""
    raw = prompt.encode()
    ga.require(row["subject_utf8_sha256"].encode() not in raw, "closure prompt leaks subject commitment")
    return raw


def runtime_preflight(codex_home: Path, row_items: list[tuple[Path, Path]] | None = None) -> dict[str, Any]:
    ga.require(codex_home.is_absolute() and codex_home.is_dir(), "Codex home")
    contract = ga.runtime_api_contract()
    ga.require(contract == {"attributes": list(ga.RUNTIME_API_CONTRACT), "missing": [], "status": "PASS"}, "closed runtime API")
    snapshot = v15.v10._snapshot(codex_home)
    ga.base._exact_keys(snapshot, {"captured_at_ms", "goal_ids", "schema_id", "thread_ids"}, "runtime snapshot")
    ga.require(
        snapshot["schema_id"] == ga.SNAPSHOT_SCHEMA
        and isinstance(snapshot["captured_at_ms"], int)
        and isinstance(snapshot["goal_ids"], list)
        and isinstance(snapshot["thread_ids"], list)
        and all(isinstance(item, str) and item for item in snapshot["goal_ids"] + snapshot["thread_ids"]),
        "runtime snapshot contract",
    )
    rows: list[dict[str, Any]] = []
    for row_path, admission_path in row_items or []:
        row = ga.load_row(row_path)
        _load_admission(admission_path, row_path, row)
        bootstrap = _bootstrap_prompt(row)
        closure = _closure_prompt(row, {"schema_id": "PW_R9_V19_PREFLIGHT_ONLY_ZERO_CREDIT"})
        ga.require(
            bootstrap.endswith(b"\n")
            and closure.endswith(b"\n")
            and ga.BOOTSTRAP_MARKER.encode() in bootstrap
            and ga.CLOSURE_MARKER.encode() in closure
            and row["subject_utf8_sha256"].encode() in bootstrap
            and row["subject_utf8_sha256"].encode() not in closure,
            f"prompt construction:{row['row_id']}",
        )
        rows.append({"admission": admission_path.name, "row_id": row["row_id"], "row_spec": row_path.name, "status": "PASS"})
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "runtime_api": contract,
        "schema_id": "pw-r9-goal-mode-v19-runtime-module-wiring-preflight-v1",
        "snapshot": {"goal_count": len(snapshot["goal_ids"]), "schema_id": snapshot["schema_id"], "thread_count": len(snapshot["thread_ids"])},
        "status": "PASS_READ_ONLY_PRE_MODEL_RUNTIME_WIRING_ZERO_CREDIT_NO_LAUNCH",
        "validated_rows": rows,
    }


def check(args: argparse.Namespace) -> dict[str, Any]:
    contract = ga.load_json(ROOT / "goal_mode_contract.json", 8_000_000)
    ga.require(
        contract.get("schema_id") == "pw-r9-goal-mode-empirical-harness-contract-v19"
        and contract.get("status") == "STATIC_CLOSED_RUNTIME_API_EXECUTED_PRE_MODEL_PREFLIGHT_EXACT_ORDERED_GOAL_BATCH_PURE_SEALED_REOPEN_ZERO_CREDIT_NO_LAUNCH"
        and contract.get("authority")
        == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False},
        "contract",
    )
    ga.require(
        contract.get("architecture", {}).get("adapter") == ga.ADAPTER
        and contract["architecture"]["goal_action_transport"]
        == {
            "direct": "EXACT_THREE_SEPARATE_NATIVE_CALLS",
            "nested": "EXACT_ONE_EXEC_BATCH_THREE_NATIVE_CALLS_THREE_DURABLE_PROJECTIONS",
            "other": "FAIL_CLOSED",
        }
        and contract["architecture"]["sealed_capture_reopen"] == "PURE_READ_ONLY_FINAL_REDERIVATION_ACCEPTS_EXACT_SEALED_INVENTORY"
        and contract["architecture"]["runtime_module_contract"]
        == {
            "attribute_source": "AST_DERIVED_UNION_OF_ALL_INHERITED_GA_ATTRIBUTE_REFERENCES",
            "import_time_missing_attribute_assertion": True,
            "pre_model_preflight": "EXECUTED_READ_ONLY_SNAPSHOT_PLUS_ROW_ADMISSION_AND_PROMPT_CONSTRUCTION",
            "preflight_before_evidence_root_creation": True,
        },
        "contract architecture",
    )
    ga.require(
        contract.get("omp_lane")
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
    harness_source = (ROOT / "goal_mode_harness.py").read_text()
    attestor_source = (ROOT / "goal_mode_three_turn_attestor.py").read_text()
    harness_tree = ast.parse(harness_source)
    ast.parse(attestor_source)
    ga.require(
        "def batch_goal_code(" in attestor_source
        and "NESTED_CODE_EXACT_ORDERED_BATCH" in attestor_source
        and "def reopen_final(" in attestor_source
        and '"goal_mode_attestation.json", "stderr_classification.json"' in attestor_source,
        "V19 attestor surfaces",
    )
    ga.require(
        "Use exactly one of these two representations:" in harness_source
        and "Do not mix representations." in harness_source
        and "v15._bootstrap_prompt = _bootstrap_prompt" in harness_source,
        "V19 prompt surfaces",
    )
    forbidden = []
    for node in ast.walk(harness_tree):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute) or node.func.attr not in {"Popen", "run"} or not node.args:
            continue
        argv = node.args[0]
        if isinstance(argv, (ast.List, ast.Tuple)) and argv.elts and isinstance(argv.elts[0], ast.Constant) and argv.elts[0].value in {"omp", "ps"}:
            forbidden.append(argv.elts[0].value)
    ga.require(not forbidden, "forbidden OMP/Linux process launch")
    version = subprocess.run([str(args.codex), "--version"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    resume = subprocess.run([str(args.codex), "exec", "resume", "--help"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    ga.require(version.returncode == 0 and version.stderr == b"" and version.stdout.strip() == b"codex-cli 0.148.0", "Codex version")
    ga.require(resume.returncode == 0 and resume.stderr == b"" and b"Resume a previous session" in resume.stdout and b"read from stdin" in resume.stdout, "Codex resume surface")
    v17_failure = ga.load_json(V17_FAILURE, 16_000_000)
    v18_failure = ga.load_json(V18_FAILURE, 16_000_000)
    ga.require(
        v17_failure.get("status") == "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY_DISTINCT_V18_SUCCESSOR_REQUIRED"
        and v17_failure.get("authority", {}).get("qualification_credit") == 0
        and v17_failure.get("first_mismatch", {}).get("family") == "GOAL_ACTIVATION_PROOF_PARSER_SINGLE_CALL_CARDINALITY_FALSE_REJECTION"
        and v17_failure.get("latent_success_verifier_blocker", {}).get("family") == "RUNTIME_VERIFIER_STATEFUL_PRE_FINAL_SURFACE_REUSE",
        "V17 failure preservation",
    )
    ga.require(
        v18_failure.get("status") == "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY_DISTINCT_V19_RUNTIME_MODULE_CONTRACT_SUCCESSOR_REQUIRED"
        and v18_failure.get("authority", {}).get("qualification_credit") == 0
        and v18_failure.get("first_mismatch", {}).get("family") == "HARNESS_WRAPPER_RUNTIME_EXPORT_CONTRACT_UNDERBINDING"
        and v18_failure.get("calls", {}).get("codex_model_processes_started") == 0,
        "V18 failure preservation",
    )
    ga.require(ga.runtime_api_contract()["missing"] == [], "runtime API import assertion")
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings,
        "checks": {
            "codex_cli_version": "codex-cli 0.148.0",
            "exact_goal_representations": ["DIRECT_NATIVE_FUNCTION", "NESTED_CODE_EXACT_ORDERED_BATCH"],
            "matrix_qualification_streak": "0_OF_2",
            "omp_lane": "EXISTING_WINDOWS_OMP_CWD_P_DRIVE_NO_DUPLICATE",
            "pure_sealed_reopen": "PASS_STATIC_SURFACE_PRESENT",
            "runtime_module_contract": "PASS_IMPORT_TIME_COMPLETE_ATTRIBUTE_SET",
            "runtime_preflight": "AVAILABLE_READ_ONLY_PRE_MODEL",
            "subject_free_activation_before_release": "PASS_STATIC",
            "v14_matrix_001": "PERMANENT_FAIL_ZERO_CREDIT",
            "v15_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY",
            "v16_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY",
            "v17_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY",
            "v18_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY",
        },
        "schema_id": "pw-r9-goal-mode-harness-check-v19",
        "status": "PASS_STATIC_V19_EXACT_ORDERED_GOAL_BATCH_PURE_SEALED_REOPEN_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT",
    }


for _name in ("ADMISSION_SCHEMA", "RESULT_SCHEMA", "STDERR_SCHEMA", "FAILURE_SCHEMA"):
    setattr(v15, _name, globals()[_name])
v15.SOURCES = SOURCES
v15._bindings = _bindings
v15._load_admission = _load_admission
v15._bootstrap_prompt = _bootstrap_prompt
v15._closure_prompt = _closure_prompt
v15.check = check


def main(argv: list[str] | None = None) -> int:
    raw = list(sys.argv[1:] if argv is None else argv)
    if not raw or raw[0] != "runtime-preflight":
        return v15.main(raw)
    parser = argparse.ArgumentParser()
    parser.add_argument("runtime-preflight")
    parser.add_argument("--codex-home", type=Path, required=True)
    parser.add_argument("--row-spec", type=Path, action="append", default=[])
    parser.add_argument("--admission", type=Path, action="append", default=[])
    args = parser.parse_args(raw)
    try:
        ga.require(len(args.row_spec) == len(args.admission), "preflight row/admission cardinality")
        result, rc = runtime_preflight(args.codex_home, list(zip(args.row_spec, args.admission))), 0
    except (ga.Invalid, OSError, UnicodeError):
        result, rc = {
            "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
            "schema_id": "pw-r9-goal-mode-v19-runtime-module-wiring-preflight-v1",
            "status": "FAIL_ZERO_CREDIT_NO_LAUNCH",
        }, 1
    sys.stdout.buffer.write(ga.canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
