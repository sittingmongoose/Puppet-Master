#!/usr/bin/env python3
"""Create-only V20 Goal-per-test-taker harness with a bounded control prelude."""

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
V19_ROOT = BASE / "goal_mode_empirical_harness_v19"
V19_PATH = V19_ROOT / "goal_mode_harness.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_harness_v19_for_v20", V19_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V19 harness loader unavailable")
v19h = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v19h
sys.path.insert(0, str(V19_ROOT))
SPEC.loader.exec_module(v19h)
v19h.ga = ga
v19h.v17.ga = ga
v19h.v15.ga = ga
v19h.v15.v10.ga = ga


ADMISSION_SCHEMA = "pw-r9-goal-mode-row-admission-v20"
RESULT_SCHEMA = "pw-r9-goal-mode-v20-row-result-v1"
STDERR_SCHEMA = "pw-r9-goal-mode-v20-stderr-classification-v1"
FAILURE_SCHEMA = "pw-r9-goal-mode-harness-failure-v20"
RUNTIME_PREFLIGHT_SCHEMA = "pw-r9-goal-mode-v20-runtime-module-wiring-preflight-v1"
REVIEW_SCHEMA = "pw-r9-goal-mode-harness-v20-bite-size-independent-static-review-v2"
REVIEW_STATUS = "PASS_INDEPENDENT_STATIC_REVIEW_V20_BITE_SIZE_PHASE_OWNED_GOAL_ACTIVATION_CONTROL_PURE_SEALED_REOPEN_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
ROW_ADMISSION_STATUS = "PASS_INDEPENDENT_V20_PHASE_OWNED_GOAL_ACTIVATION_CONTROL_HARNESS_REVIEW"
V19_FAILURE = BASE / "r9_goal_mode_v19_three_turn_canary_001_runtime_failure_receipt_v1.json"
ADJUDICATION = BASE / "r9_goal_mode_v19_goal_tool_discovery_churn_loop_breaker_adjudication_v1.json"
PROMPT_CORRECTION = BASE / "r9_goal_mode_v20_bite_size_prompt_decomposition_correction_v1.json"
PRIOR_V20_REVIEW = BASE / "r9_goal_mode_harness_v20_independent_static_review_v1.json"
ACTIVATION_PROMPT_MAX_BYTES = 2048
SCORED_CONTROL_PROMPT_MAX_BYTES = 1536
SCORED_SUBJECT_MAX_BYTES = 4096
CLOSURE_PROMPT_MAX_BYTES = 1024
GOAL_OBJECTIVE_MAX_BYTES = 512
SOURCES = (
    ("goal_mode_empirical_harness_v20/goal_mode_contract.json", ROOT / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v20/goal_mode_harness.py", ROOT / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v20/goal_mode_three_turn_attestor.py", ROOT / "goal_mode_three_turn_attestor.py"),
    *v19h.SOURCES,
    (V19_FAILURE.name, V19_FAILURE),
    (ADJUDICATION.name, ADJUDICATION),
    (PROMPT_CORRECTION.name, PROMPT_CORRECTION),
    (PRIOR_V20_REVIEW.name, PRIOR_V20_REVIEW),
)


def _bindings() -> list[dict[str, Any]]:
    return [v19h.v15.v10._identity(label, path) for label, path in SOURCES]


def _load_admission(path: Path, row_path: Path, row: dict[str, Any]) -> dict[str, Any]:
    value = ga.load_json(path, 8_000_000)
    ga.require(isinstance(value, dict), "admission object")
    ga.base._exact_keys(value, {"authority", "bindings", "review", "row_spec", "schema_id", "status"}, "admission")
    ga.require(value["schema_id"] == ADMISSION_SCHEMA and value["status"] == ROW_ADMISSION_STATUS, "admission schema/status")
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
    ga.require(v19h.v15.v10._identity(reference["path"], review_path) == reference, "review identity")
    review = ga.load_json(review_path, 16_000_000)
    ga.require(
        review.get("schema_id") == REVIEW_SCHEMA
        and review.get("status") == REVIEW_STATUS
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
    prompt = f"""R9 V20 GOAL ACTIVATION — NO SCORED SUBJECT IS PRESENT.
This fresh task will receive one small atomic subject later. Do no subject work now.
If Goal functions are unavailable, perform at most one tool-definition search with exactly {{"limit":{ga.GOAL_SEARCH_LIMIT},"query":{ga.canon(ga.GOAL_SEARCH_QUERY, newline=False).decode()}}}; invoke none of its returned tools.
Then make exactly these three separate native calls, with no batch or other action:
1. {direct_get}
Require null.
2. {direct_create}
Require the exact objective active.
3. {direct_get}
Require the same active Goal.
Bindings: run={row['run_id']}; row={row['row_id']}; attempt=0; criteria={ga.sha256(ga.canon(row['criteria'], newline=False))}; control={ga.sha256(ga.canon(row['control_envelope'], newline=False))}; subject={row['subject_utf8_sha256']}; subject_bytes={row['subject_utf8_bytes']}.
Leave the Goal active. Output exactly {ga.BOOTSTRAP_MARKER}.
"""
    raw = prompt.encode()
    ga.require(
        row["subject_utf8_sha256"].encode() in raw
        and str(row["subject_utf8_bytes"]).encode() in raw
        and len(row["objective"].encode()) <= GOAL_OBJECTIVE_MAX_BYTES
        and len(raw) <= ACTIVATION_PROMPT_MAX_BYTES,
        "bite-size bootstrap commitments",
    )
    return raw


def _scored_prompt(row: dict[str, Any], capture: Path, workspace: Path, bootstrap: dict[str, Any]) -> bytes:
    reader = ga.prior.reader_code(row, capture, workspace).rstrip("\n")
    prompt = f"""R9 V20 SCORED TURN — ONE SMALL ATOMIC SUBJECT.
Continue the same active Goal. Activation receipt: sha256={ga.sha256(ga.canon(bootstrap))}; bytes={len(ga.canon(bootstrap))}.
Your first and only action is exactly:
{reader}
Use its returned UTF-8 as the entire subject. Answer only that one task. Do not delegate, retry, call another tool, or combine it with other work. Leave the Goal active. Output only the answer.
"""
    raw = prompt.encode()
    ga.require(
        0 < row["subject_utf8_bytes"] <= SCORED_SUBJECT_MAX_BYTES
        and row["subject_utf8_sha256"].encode() in reader.encode()
        and len(raw) <= SCORED_CONTROL_PROMPT_MAX_BYTES,
        "bite-size scored prompt",
    )
    return raw


def _closure_prompt(row: dict[str, Any], scored_gate: dict[str, Any]) -> bytes:
    direct_get = ga.prior.get_goal_code().rstrip("\n")
    direct_update = ga.prior.update_goal_code().rstrip("\n")
    prompt = f"""R9 V20 GOAL CLOSURE — NO SCORED SUBJECT IS PRESENT.
Same task and Goal. Scored receipt: sha256={ga.sha256(ga.canon(scored_gate))}; bytes={len(ga.canon(scored_gate))}.
Make exactly these three separate native calls, with no batch or other action:
1. {direct_get}
Require the same active Goal.
2. {direct_update}
Require complete.
3. {direct_get}
Require that same complete Goal.
Do not revisit the subject. Output exactly {ga.CLOSURE_MARKER}.
"""
    raw = prompt.encode()
    ga.require(row["subject_utf8_sha256"].encode() not in raw and len(raw) <= CLOSURE_PROMPT_MAX_BYTES, "bite-size closure prompt")
    return raw


def runtime_preflight(codex_home: Path, row_items: list[tuple[Path, Path]] | None = None) -> dict[str, Any]:
    ga.require(codex_home.is_absolute() and codex_home.is_dir(), "Codex home")
    contract = ga.runtime_api_contract()
    ga.require(contract == {"attributes": list(ga.RUNTIME_API_CONTRACT), "missing": [], "status": "PASS"}, "closed runtime API")
    snapshot = v19h.v15.v10._snapshot(codex_home)
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
        scored = _scored_prompt(row, Path("/preflight/capture"), Path("/preflight/workspace"), {"schema_id": "PW_R9_V20_PREFLIGHT_ONLY_ZERO_CREDIT"})
        closure = _closure_prompt(row, {"schema_id": "PW_R9_V20_PREFLIGHT_ONLY_ZERO_CREDIT"})
        subject_path = row_path.with_name(row_path.name.replace(".row.json", ".subject.txt"))
        subject = ga.base._read_regular(subject_path, 2_000_000)
        ga.require(
            bootstrap.endswith(b"\n")
            and closure.endswith(b"\n")
            and ga.BOOTSTRAP_MARKER.encode() in bootstrap
            and ga.CLOSURE_MARKER.encode() in closure
            and bootstrap.count(ga.GOAL_SEARCH_QUERY.encode()) == 1
            and row["subject_utf8_sha256"].encode() in bootstrap
            and subject not in bootstrap
            and subject[: min(32, len(subject))] not in bootstrap
            and len(bootstrap) <= ACTIVATION_PROMPT_MAX_BYTES
            and len(scored) <= SCORED_CONTROL_PROMPT_MAX_BYTES
            and row["subject_utf8_bytes"] <= SCORED_SUBJECT_MAX_BYTES
            and len(closure) <= CLOSURE_PROMPT_MAX_BYTES
            and len(row["objective"].encode()) <= GOAL_OBJECTIVE_MAX_BYTES
            and row["subject_utf8_sha256"].encode() not in closure,
            f"prompt construction:{row['row_id']}",
        )
        rows.append({"admission": admission_path.name, "row_id": row["row_id"], "row_spec": row_path.name, "status": "PASS"})
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "runtime_api": contract,
        "schema_id": RUNTIME_PREFLIGHT_SCHEMA,
        "snapshot": {"goal_count": len(snapshot["goal_ids"]), "schema_id": snapshot["schema_id"], "thread_count": len(snapshot["thread_ids"])},
        "status": "PASS_READ_ONLY_PRE_MODEL_V20_PHASE_OWNED_ACTIVATION_CONTROL_RUNTIME_WIRING_ZERO_CREDIT_NO_LAUNCH",
        "validated_rows": rows,
    }


def check(args: argparse.Namespace) -> dict[str, Any]:
    contract = ga.load_json(ROOT / "goal_mode_contract.json", 8_000_000)
    ga.require(
        contract.get("schema_id") == "pw-r9-goal-mode-empirical-harness-contract-v20"
        and contract.get("status") == "STATIC_BITE_SIZE_PHASE_OWNED_GOAL_ACTIVATION_CONTROL_CLOSED_RUNTIME_API_PURE_SEALED_REOPEN_ZERO_CREDIT_NO_LAUNCH"
        and contract.get("authority") == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False},
        "contract",
    )
    architecture = contract.get("architecture", {})
    ga.require(
        architecture.get("adapter") == ga.ADAPTER
        and architecture.get("activation_control")
        == {
            "allowed_actions": ["ZERO_OR_ONE_EXACT_GOAL_NAMED_TOOL_SEARCH", "EXACT_NATIVE_GOAL_LIFECYCLE"],
            "other_actions": "FAIL_CLOSED",
            "phase": "SUBJECT_WITHHELD_BEFORE_GOAL_ACTIVATION",
            "returned_non_goal_tools": "MUST_NOT_BE_INVOKED",
            "search_limit": ga.GOAL_SEARCH_LIMIT,
            "search_query": ga.GOAL_SEARCH_QUERY,
        }
        and architecture.get("subject_release") == "ONLY_AFTER_EXACT_ACTIVE_NATIVE_GOAL_PROJECTION_DATABASE_CROSS_BINDING"
        and architecture.get("sealed_capture_reopen") == "PURE_READ_ONLY_FINAL_REDERIVATION_ACCEPTS_EXACT_SEALED_INVENTORY",
        "contract architecture",
    )
    ga.require(
        architecture.get("goal_action_transport") == {"direct": "EXACT_SEPARATE_NATIVE_CALLS_ONLY", "nested": "PROHIBITED", "other": "FAIL_CLOSED"}
        and architecture.get("prompt_decomposition")
        == {
            "activation_control_prompt_max_utf8_bytes": ACTIVATION_PROMPT_MAX_BYTES,
            "closure_control_prompt_max_utf8_bytes": CLOSURE_PROMPT_MAX_BYTES,
            "goal_objective_max_utf8_bytes": GOAL_OBJECTIVE_MAX_BYTES,
            "matrix_unit": "ONE_ROW_ONE_FRESH_TASK_ONE_FRESH_GOAL_ONE_ATOMIC_SUBJECT",
            "multi_cell_or_compound_subject": "PROHIBITED",
            "scored_control_prompt_max_utf8_bytes": SCORED_CONTROL_PROMPT_MAX_BYTES,
            "scored_subject_max_utf8_bytes": SCORED_SUBJECT_MAX_BYTES,
            "subject_delegation": "PROHIBITED",
            "turns": ["SMALL_GOAL_ACTIVATION_CONTROL", "ONE_ATOMIC_SCORED_SUBJECT", "SMALL_NON_SCORED_GOAL_CLOSURE"],
        },
        "bite-size prompt decomposition",
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
        "def _activation_control_search(" in attestor_source
        and "GOAL_SEARCH_PREFIX" in attestor_source
        and "nested Goal batch prohibited" in attestor_source
        and "methods[1] == \"create_goal\"" in attestor_source
        and "def runtime_preflight(" in harness_source
        and "def _scored_prompt(" in harness_source
        and "subject not in bootstrap" in harness_source,
        "V20 phase-owned surfaces",
    )
    forbidden: list[str] = []
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
    failure = ga.load_json(V19_FAILURE, 16_000_000)
    adjudication = ga.load_json(ADJUDICATION, 16_000_000)
    correction = ga.load_json(PROMPT_CORRECTION, 16_000_000)
    ga.require(
        failure.get("status") == "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY_PENDING_CHURN_LOOP_BREAKER_ADJUDICATION"
        and failure.get("first_mismatch", {}).get("family") == "GOAL_ACTIVATION_CONTROL_PLANE_TOOL_DISCOVERY_OVERCONSTRAINT"
        and failure.get("authority", {}).get("qualification_credit") == 0,
        "V19 failure preservation",
    )
    ga.require(
        adjudication.get("status") == "CHURN_THRESHOLD_REACHED_ONE_FINAL_DISTINCT_V20_IMPLEMENTATION_PERMITTED_ZERO_LAUNCH_AUTHORITY"
        and adjudication.get("loop_breaker", {}).get("successor_count_remaining") == 1
        and adjudication.get("authority", {}).get("canary_launch") is False,
        "V20 loop-breaker authority",
    )
    ga.require(
        correction.get("schema_id") == "pw-r9-goal-mode-v20-bite-size-prompt-decomposition-correction-v1"
        and correction.get("status") == "BINDING_PRELAUNCH_CORRECTION_REQUIRES_V20_REVIEW_REFRESH_ZERO_CREDIT_NO_LAUNCH"
        and correction.get("authority", {}).get("canary_launch") is False,
        "bite-size correction",
    )
    ga.require(ga.runtime_api_contract()["missing"] == [], "runtime API import assertion")
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings,
        "checks": {
            "activation_control": "ZERO_OR_ONE_EXACT_GOAL_TOOL_SEARCH_BEFORE_NATIVE_GOAL_ONLY",
            "bite_size_prompt_decomposition": "THREE_SEPARATE_BOUNDED_TURNS_ONE_ATOMIC_SUBJECT",
            "codex_cli_version": "codex-cli 0.148.0",
            "matrix_qualification_streak": "0_OF_2",
            "omp_lane": "EXISTING_WINDOWS_OMP_CWD_P_DRIVE_NO_DUPLICATE",
            "pure_sealed_reopen": "PASS_STATIC_SURFACE_PRESENT",
            "runtime_module_contract": "PASS_IMPORT_TIME_COMPLETE_ATTRIBUTE_SET",
            "subject_withheld_before_goal": "PASS_STATIC",
            "v19_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY",
        },
        "schema_id": "pw-r9-goal-mode-harness-check-v20",
        "status": "PASS_STATIC_V20_BITE_SIZE_PHASE_OWNED_ACTIVATION_CONTROL_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT",
    }


for _name, _value in {
    "ADMISSION_SCHEMA": ADMISSION_SCHEMA,
    "RESULT_SCHEMA": RESULT_SCHEMA,
    "STDERR_SCHEMA": STDERR_SCHEMA,
    "FAILURE_SCHEMA": FAILURE_SCHEMA,
}.items():
    setattr(v19h.v15, _name, _value)
v19h.v15.SOURCES = SOURCES
v19h.v15._bindings = _bindings
v19h.v15._load_admission = _load_admission
v19h.v15._bootstrap_prompt = _bootstrap_prompt
v19h.v15._scored_prompt = _scored_prompt
v19h.v15._closure_prompt = _closure_prompt
v19h.v15.check = check


def main(argv: list[str] | None = None) -> int:
    raw = list(sys.argv[1:] if argv is None else argv)
    if not raw or raw[0] != "runtime-preflight":
        return v19h.v15.main(raw)
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
            "schema_id": RUNTIME_PREFLIGHT_SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_LAUNCH",
        }, 1
    sys.stdout.buffer.write(ga.canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
