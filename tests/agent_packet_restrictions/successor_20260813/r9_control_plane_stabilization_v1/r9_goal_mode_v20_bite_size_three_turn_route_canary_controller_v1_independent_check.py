#!/usr/bin/env python3
"""Independent no-launch checker for the V20 bite-size Goal canary controller."""

from __future__ import annotations

import argparse
import ast
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
from typing import Any


SCHEMA = "pw-r9-goal-mode-v20-bite-size-three-turn-route-canary-controller-independent-check-v1"
CONTROLLER_NAME = "r9_goal_mode_v20_bite_size_three_turn_route_canary_controller_v1.py"
CONTROLLER_SHA256 = "0434c5030f9d991efba9ab639c1c11ce8023a94f2a55cd874bed7a89cc696538"
CONTROLLER_BYTES = 32058
RUN_ID = "goal-mode-v20-bite-size-three-turn-canary-001"
INPUTS = "goal_mode_v20_bite_size_three_turn_canary_001_inputs"
HARNESS = "goal_mode_empirical_harness_v20"
ADAPTER = "CODEX_NATIVE_GOAL_BITE_SIZE_SUBJECT_WITHHELD_ACTIVATION_CONTROL_ZERO_OR_ONE_EXACT_GOAL_TOOL_SEARCH_THEN_EXACT_DIRECT_GOAL_CALLS_THEN_ONE_ATOMIC_SCORED_SUBJECT_THEN_DIRECT_TERMINAL_CLOSURE_PURE_SEALED_REOPEN_V7"


class Invalid(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise Invalid(message)


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    value: dict[str, Any] = {}
    for key, item in items:
        require(key not in value, f"duplicate JSON key:{key}")
        value[key] = item
    return value


def canon(value: Any, newline: bool = True) -> bytes:
    raw = json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return raw + (b"\n" if newline else b"")


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int = 64_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0 <= before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require(
        (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
        == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
        and len(raw) == before.st_size,
        f"changing file:{path}",
    )
    return raw


def load_controller(path: Path) -> Any:
    spec = importlib.util.spec_from_file_location("_r9_v19_canary_controller_check_target", path)
    require(spec is not None and spec.loader is not None, "controller loader")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def audit_source(text: str) -> dict[str, Any]:
    tree = ast.parse(text)
    functions = {node.name for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    require({"row_argv", "launch_one", "run", "check", "main", "capture_attestation", "validate_row_admission", "execute_runtime_preflight"} <= functions, "required functions")
    calls = [node for node in ast.walk(tree) if isinstance(node, ast.Call)]
    popen = [node for node in calls if isinstance(node.func, ast.Attribute) and node.func.attr == "Popen"]
    require(len(popen) == 1, "one controller Popen")
    require("ThreadPoolExecutor" not in text and "spawn_agent" not in text and "create_thread" not in text, "no parallel/delegated launch")
    require(f'RUN_ID = "{RUN_ID}"' in text and f'HARNESS = BASE / "{HARNESS}"' in text and f'ADAPTER = "{ADAPTER}"' in text, "frozen constants")
    require("MAX_PARALLEL = 1" in text and "ROW_COUNT = 3" in text, "serial cardinality")
    require('str(INPUTS / f"row-{index:03d}.admission.json")' in text and 'if receipt["status"] != "PASS":' in text, "local admissions and fail-fast")
    require('"existing_launch": "omp --cwd P:\\\\"' in text and '"linux_process_inference": False' in text, "OMP boundary")
    require("subprocess.Popen(" in text and "start_new_session=True" in text and "stdin=subprocess.DEVNULL" in text, "bounded process launch")
    require('"processes": 3' in text and '"resume_operations": 2' in text and '"goal_turns_per_row": 3' in text, "three-turn accounting")
    require('"qualification_credit": 0' in text and '"retries": 0' in text, "zero credit/no retry")
    require('"nested": "PROHIBITED"' in text and '"matrix_unit": "ONE_ROW_ONE_FRESH_TASK_ONE_FRESH_GOAL_ONE_ATOMIC_SUBJECT"' in text, "direct-only bite-size contract")
    require('"scored_subject_max_utf8_bytes": 4096' in text and '"multi_cell_or_compound_subject": "PROHIBITED"' in text and '"subject_delegation": "PROHIBITED"' in text, "subject decomposition ceilings")
    require('"sealed_capture_reopen": "PURE_READ_ONLY_FINAL_REDERIVATION_ACCEPTS_EXACT_SEALED_INVENTORY"' in text, "pure sealed reopen")
    require('"pre_model_runtime_wiring": "IMPORT_ASSERTED_CLOSED_API_PLUS_EXECUTED_READ_ONLY_SNAPSHOT_ROW_ADMISSION_PROMPT_SIZE_AND_SUBJECT_ABSENCE_PREFLIGHT_BEFORE_EVIDENCE_ROOT"' in text, "runtime wiring")
    require("preflight = execute_runtime_preflight(args.codex_home)" in text and "args.output.mkdir" in text, "runtime preflight surfaces")
    require(text.index("preflight = execute_runtime_preflight(args.codex_home)") < text.index("args.output.mkdir"), "runtime preflight source order")
    require("r9_goal_mode_v19_three_turn_canary_001_runtime_failure_receipt_v1.json" in text and "r9_goal_mode_v19_goal_tool_discovery_churn_loop_breaker_adjudication_v1.json" in text, "V19 failure/adjudication preservation")
    require('RUNTIME_VERIFIER = BASE / "r9_goal_mode_v20_bite_size_three_turn_route_canary_independent_runtime_verify_v1.py"' in text and '"runtime verifier identity"' in text, "runtime verifier admission binding")
    require('goal_mode_empirical_harness_v14' not in text, "no V14 harness path")
    for node in popen:
        require(not (node.args and isinstance(node.args[0], (ast.List, ast.Tuple))), "controller Popen argv must be row_argv variable")
    return {"functions": sorted(functions), "popen_sites": len(popen)}


def mutation_self_test(raw: bytes) -> list[dict[str, Any]]:
    text = raw.decode("utf-8")
    mutations = {
        "adapter_old": text.replace(ADAPTER, "CODEX_NATIVE_GOAL_OLD"),
        "admission_escape": text.replace('str(INPUTS / f"row-{index:03d}.admission.json")', 'str(BASE / f"row-{index:03d}.admission.json")'),
        "allow_batch": text.replace('"nested": "PROHIBITED"', '"nested": "ALLOWED"'),
        "allow_compound": text.replace('"multi_cell_or_compound_subject": "PROHIBITED"', '"multi_cell_or_compound_subject": "ALLOWED"'),
        "allow_delegation": text.replace('"subject_delegation": "PROHIBITED"', '"subject_delegation": "ALLOWED"'),
        "drop_fail_fast": text.replace('if receipt["status"] != "PASS":', 'if False:', 1),
        "harness_v14": text.replace(f'HARNESS = BASE / "{HARNESS}"', 'HARNESS = BASE / "goal_mode_empirical_harness_v14"', 1),
        "max_parallel_two": text.replace("MAX_PARALLEL = 1", "MAX_PARALLEL = 2", 1),
        "qualification_one": text.replace('"qualification_credit": 0', '"qualification_credit": 1'),
        "remove_preflight": text.replace("preflight = execute_runtime_preflight(args.codex_home)", "preflight = {}", 1),
        "subject_ceiling_large": text.replace('"scored_subject_max_utf8_bytes": 4096', '"scored_subject_max_utf8_bytes": 1000000'),
        "wrong_run_id": text.replace(RUN_ID, "goal-mode-v20-wrong"),
    }
    results: list[dict[str, Any]] = []
    for name, mutated in sorted(mutations.items()):
        require(mutated != text, f"mutation applied:{name}")
        try:
            audit_source(mutated)
        except (Invalid, SyntaxError):
            results.append({"mutation": name, "status": "REJECTED"})
            continue
        raise Invalid(f"mutation survived:{name}")
    return results


def exact_argv(module: Any, base: Path) -> list[dict[str, Any]]:
    args = argparse.Namespace(
        codex_home=Path("/accepted/codex-home"),
        codex=Path("/accepted/codex"),
        workspace=Path("/accepted/workspace"),
        row_timeout_seconds=1200,
    )
    projections: list[dict[str, Any]] = []
    for index in range(3):
        capture = Path("/accepted/capture") / f"row-{index:03d}"
        expected = [
            sys.executable,
            "-B",
            str(base / HARNESS / "goal_mode_harness.py"),
            "run-codex-row",
            "--row-spec",
            str(base / INPUTS / f"row-{index:03d}.row.json"),
            "--subject",
            str(base / INPUTS / f"row-{index:03d}.subject.txt"),
            "--admission",
            str(base / INPUTS / f"row-{index:03d}.admission.json"),
            "--capture-root",
            str(capture),
            "--codex-home",
            str(args.codex_home),
            "--codex",
            str(args.codex),
            "--workspace",
            str(args.workspace),
            "--timeout-seconds",
            "1200",
        ]
        actual = module.row_argv(index, args, capture)
        require(actual == expected, f"exact argv mismatch:{index}")
        raw = canon(actual, newline=False)
        projections.append({"bytes": len(raw), "index": index, "sha256": sha(raw)})
    return projections


def run_controller_check(base: Path, controller: Path) -> dict[str, Any]:
    process = subprocess.run([sys.executable, "-B", str(controller), "check"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=base, env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"}, timeout=60, check=False)
    require(process.returncode == 0 and process.stderr == b"", "controller check process")
    result = json.loads(process.stdout, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    require(process.stdout == canon(result), "controller check canonical")
    require(result.get("schema_id") == "pw-r9-goal-mode-v20-bite-size-three-turn-route-canary-controller-check-v1" and result.get("status") == "PASS_STATIC_V20_BITE_SIZE_THREE_TURN_EXACT_ROW_ARGV_ZERO_CREDIT_NO_LAUNCH" and len(result.get("checks", {}).get("exact_row_argv_projections", [])) == 3, "controller check result")
    return {"rc": process.returncode, "stderr": {"bytes": len(process.stderr), "sha256": sha(process.stderr)}, "stdout": {"bytes": len(process.stdout), "sha256": sha(process.stdout)}}


def check(base: Path, codex_home: Path) -> dict[str, Any]:
    controller = base / CONTROLLER_NAME
    raw = read_regular(controller)
    require(len(raw) == CONTROLLER_BYTES and sha(raw) == CONTROLLER_SHA256 and stat.S_IMODE(os.lstat(controller).st_mode) == 0o644, "controller identity/mode")
    source = audit_source(raw.decode("utf-8"))
    module = load_controller(controller)
    require(module.RUN_ID == RUN_ID and module.ROW_COUNT == 3 and module.MAX_PARALLEL == 1 and module.ADAPTER == ADAPTER, "module constants")
    manifest = module.load_manifest()
    require(manifest["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0}, "manifest authority")
    require(all(row["subject"]["bytes"] <= 4096 and row["objective_utf8_bytes"] <= 512 for row in manifest["rows"]), "bite-size manifest rows")
    preflight = module.execute_runtime_preflight(codex_home)
    require(preflight.get("status") == "PASS_READ_ONLY_PRE_MODEL_V20_PHASE_OWNED_ACTIVATION_CONTROL_RUNTIME_WIRING_ZERO_CREDIT_NO_LAUNCH" and len(preflight.get("validated_rows", [])) == 3, "executed runtime preflight")
    return {
        "authority": {"canary_admission_eligible": True, "canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "checks": {"controller_process": run_controller_check(base, controller), "executed_runtime_preflight": {"runtime_api_missing": preflight["runtime_api"]["missing"], "snapshot_schema": preflight["snapshot"]["schema_id"], "validated_rows": len(preflight["validated_rows"])}, "exact_row_argv_projections": exact_argv(module, base), "mutation_self_test": mutation_self_test(raw), "source": source},
        "controller": {"bytes": len(raw), "mode": "0644", "path": CONTROLLER_NAME, "sha256": sha(raw)},
        "first_mismatch": None,
        "lineage": {"prior_non_goal_architectures": "DIAGNOSTIC_ONLY", "qualification_streak_clean_matrices": 0, "v17_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY", "v18_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY", "v19_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY"},
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False, "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED"},
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_STATIC_CHECK_V20_BITE_SIZE_THREE_TURN_EXACT_ROW_ARGV_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--codex-home", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.base.is_absolute() and args.codex_home.is_absolute(), "CLI")
        result, rc = check(args.base, args.codex_home), 0
    except (Invalid, OSError, UnicodeError, subprocess.SubprocessError, json.JSONDecodeError) as exc:
        result = {"error": str(exc), "first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
