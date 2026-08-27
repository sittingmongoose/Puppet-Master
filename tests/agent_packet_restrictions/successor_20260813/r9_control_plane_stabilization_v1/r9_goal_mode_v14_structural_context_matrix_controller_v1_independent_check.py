#!/usr/bin/env python3
"""Independent source, mutation, and exact-argv check for the V14 Goal matrices."""

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


SCHEMA = "pw-r9-goal-mode-v14-structural-context-matrix-controller-independent-check-v1"
CONTROLLER_NAME = "r9_goal_mode_v14_structural_context_matrix_controller_v1.py"
CONTROLLER_SHA256 = "e1831e003217d138b6a83a24e3d57687a18a48e17852986f8186e33686945b13"
CONTROLLER_BYTES = 17713
MANIFEST_NAME = "goal_mode_v14_structural_context_matrix_pair_001_002_inputs_v1/manifest.json"
MANIFEST_SHA256 = "5b2901787502545e94fef87b358416989c9ee41390f4bf11789604ec66eb4cc0"
MANIFEST_BYTES = 522058
PAIR_REVIEW_NAME = "r9_goal_mode_v14_structural_context_matrix_pair_independent_review_v1.json"
PAIR_REVIEW_SHA256 = "6854a015b265a56b5f9e97a513b25f02e42bbf6aef6bff0f938054d2cd60ab8b"
PAIR_REVIEW_BYTES = 2826
HARNESS = "goal_mode_empirical_harness_v14"
PAIR_ROOT = "goal_mode_v14_structural_context_matrix_pair_001_002_inputs_v1"
MATRIX_IDS = (
    "goal-mode-v14-structural-context-matrix-001",
    "goal-mode-v14-structural-context-matrix-002",
)
ROW_COUNT = 291


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


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int = 64_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0 <= before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require((before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), f"changing file:{path}")
    require(len(raw) == before.st_size, f"short read:{path}")
    return raw


def load_json(path: Path, limit: int = 64_000_000) -> dict[str, Any]:
    raw = read_regular(path, limit)
    value = json.loads(raw, object_pairs_hook=pairs)
    require(isinstance(value, dict), f"JSON object:{path}")
    return value


def load_controller(path: Path) -> Any:
    spec = importlib.util.spec_from_file_location("_r9_v14_matrix_controller_check_target", path)
    require(spec is not None and spec.loader is not None, "controller loader")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def audit_source(text: str) -> dict[str, Any]:
    tree = ast.parse(text)
    functions = {node.name for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    required = {"bindings", "load_manifest", "predecessor", "load_admission", "row_paths", "row_argv", "launch_one", "run_matrix", "check", "main"}
    require(required <= functions, "required functions")
    calls = [node for node in ast.walk(tree) if isinstance(node, ast.Call)]
    popen = [node for node in calls if isinstance(node.func, ast.Attribute) and node.func.attr == "Popen"]
    require(len(popen) == 1, "one controller Popen")
    require("ThreadPoolExecutor" not in text and "spawn_agent" not in text and "create_thread" not in text, "no parallel/delegated launch")
    require('MATRIX_IDS = ("goal-mode-v14-structural-context-matrix-001", "goal-mode-v14-structural-context-matrix-002")' in text, "matrix IDs")
    require("ROW_COUNT = 291" in text and "MAX_PARALLEL = 1" in text, "serial cardinality")
    require('HARNESS = BASE / "goal_mode_empirical_harness_v14"' in text, "V14 harness")
    require('PAIR_ROOT = BASE / "goal_mode_v14_structural_context_matrix_pair_001_002_inputs_v1"' in text, "frozen pair")
    require('MATRIX_001_RECEIPT = BASE / "r9_goal_mode_v14_structural_context_matrix_001_success_receipt_v1.json"' in text, "ordered predecessor")
    require('if receipt["status"] != "PASS":\n            break' in text, "fail-fast break")
    require('value.get("authority") == {"matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False}' in text, "frozen manifest zero authority")
    require('"planned": ROW_COUNT, "qualification_credit": 0, "retries": 0' in text, "zero retry/credit accounting")
    require('subprocess.Popen(' in text and 'start_new_session=True' in text and 'stdin=subprocess.DEVNULL' in text, "bounded process launch")
    require('"max_parallel": 1, "serialized": True' in text, "serialized terminal")
    require('(\"r9_goal_mode_omp_windows_transport_clarification_v3.json\", BASE / \"r9_goal_mode_omp_windows_transport_clarification_v3.json\")' in text, "OMP boundary binding")
    require('["omp"' not in text and "Popen([\"omp\"" not in text and "omp --cwd" not in text, "no duplicate OMP launch")
    require('sub.add_parser("check")' in text and 'sub.add_parser("run-matrix")' in text, "closed controller grammar")
    require("run-canary" not in text and "resume" not in text, "no alternate empirical surface")
    return {"functions": sorted(functions), "popen_sites": len(popen)}


def mutation_self_test(raw: bytes) -> list[dict[str, Any]]:
    text = raw.decode("utf-8")
    mutations = {
        "drop_fail_fast": text.replace('if receipt["status"] != "PASS":\n            break', 'if False:\n            break', 1),
        "harness_v13": text.replace('HARNESS = BASE / "goal_mode_empirical_harness_v14"', 'HARNESS = BASE / "goal_mode_empirical_harness_v13"', 1),
        "matrix_id_reuse": text.replace("goal-mode-v14-structural-context-matrix-002", "goal-mode-v14-structural-context-matrix-001", 1),
        "max_parallel_two": text.replace("MAX_PARALLEL = 1", "MAX_PARALLEL = 2", 1),
        "omp_binding_removed": text.replace("r9_goal_mode_omp_windows_transport_clarification_v3.json", "removed_omp_boundary.json", 1),
        "predecessor_removed": text.replace("r9_goal_mode_v14_structural_context_matrix_001_success_receipt_v1.json", "unbound_predecessor.json", 1),
        "qualification_credit_one": text.replace('"qualification_credit": 0', '"qualification_credit": 1', 1),
        "retry_one": text.replace('"retries": 0', '"retries": 1', 1),
        "row_count_290": text.replace("ROW_COUNT = 291", "ROW_COUNT = 290", 1),
    }
    results: list[dict[str, Any]] = []
    for name, mutated in sorted(mutations.items()):
        require(mutated != text, f"mutation applied:{name}")
        rejected = False
        try:
            audit_source(mutated)
        except (Invalid, SyntaxError):
            rejected = True
        require(rejected, f"mutation survived:{name}")
        results.append({"mutation": name, "status": "REJECTED"})
    return results


def verify_manifest(base: Path) -> dict[str, Any]:
    path = base / MANIFEST_NAME
    raw = read_regular(path)
    require(len(raw) == MANIFEST_BYTES and sha(raw) == MANIFEST_SHA256 and stat.S_IMODE(os.lstat(path).st_mode) == 0o644, "manifest identity")
    manifest = json.loads(raw, object_pairs_hook=pairs)
    require(isinstance(manifest, dict), "manifest object")
    require(manifest.get("pair_order") == list(MATRIX_IDS) and len(manifest.get("matrices", [])) == 2, "manifest pair")
    require(manifest.get("authority") == {"matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False}, "manifest zero authority")
    for matrix_index, matrix_id in enumerate(MATRIX_IDS):
        matrix = manifest["matrices"][matrix_index]
        require(matrix.get("matrix_id") == matrix_id and matrix.get("row_count") == ROW_COUNT and len(matrix.get("rows", [])) == ROW_COUNT, "manifest matrix rows")
    return manifest


def exact_argv(module: Any, base: Path, manifest: dict[str, Any]) -> list[dict[str, Any]]:
    pair_root = base / PAIR_ROOT
    all_results: list[dict[str, Any]] = []
    summaries: list[dict[str, Any]] = []
    for matrix_index, matrix_id in enumerate(MATRIX_IDS):
        args = argparse.Namespace(
            matrix_id=matrix_id,
            codex_home=Path("/accepted/codex-home"),
            codex=Path("/accepted/codex"),
            workspace=Path("/accepted/workspace"),
            row_timeout_seconds=1200,
        )
        matrix_results: list[dict[str, Any]] = []
        for index, item in enumerate(manifest["matrices"][matrix_index]["rows"]):
            capture = Path("/accepted/capture") / matrix_id / f"row-{index:03d}"
            expected = [
                sys.executable,
                "-B",
                str(base / HARNESS / "goal_mode_harness.py"),
                "run-codex-row",
                "--row-spec",
                str(pair_root / item["row_spec"]["path"]),
                "--subject",
                str(pair_root / item["subject"]["path"]),
                "--admission",
                str(pair_root / item["admission"]["path"]),
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
            actual = module.row_argv(index, args, capture, manifest)
            require(actual == expected, f"exact argv mismatch:{matrix_id}:{index}")
            raw = canon(actual)[:-1]
            result = {"bytes": len(raw), "index": index, "matrix_id": matrix_id, "sha256": sha(raw)}
            matrix_results.append(result)
            all_results.append(result)
        projection = canon(matrix_results)[:-1]
        summaries.append({
            "first": matrix_results[0],
            "last": matrix_results[-1],
            "matrix_id": matrix_id,
            "projection_bytes": len(projection),
            "projection_sha256": sha(projection),
            "rows": len(matrix_results),
        })
    union = canon(all_results)[:-1]
    return summaries + [{"matrices": 2, "projection_bytes": len(union), "projection_sha256": sha(union), "rows": len(all_results)}]


def run_controller_check(base: Path, controller: Path) -> dict[str, Any]:
    process = subprocess.run(
        [sys.executable, "-B", str(controller), "check"],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=base,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        timeout=120,
        check=False,
    )
    require(process.returncode == 0 and process.stderr == b"", "controller check process")
    result = json.loads(process.stdout, object_pairs_hook=pairs)
    require(process.stdout == canon(result), "controller check canonical")
    require(
        result.get("schema_id") == "pw-r9-goal-mode-v14-structural-context-matrix-controller-check-v1"
        and result.get("status") == "PASS_STATIC_DATA_ONLY_ZERO_CREDIT_NO_LAUNCH"
        and result.get("authority") == {"matrix_launch": False, "qualification_credit": 0}
        and result.get("checks", {}).get("matrix_rows_each") == ROW_COUNT
        and result.get("checks", {}).get("max_parallel") == 1
        and result.get("checks", {}).get("omp_process_calls") == 0,
        "controller check result",
    )
    return {"rc": process.returncode, "stderr": {"bytes": len(process.stderr), "sha256": sha(process.stderr)}, "stdout": {"bytes": len(process.stdout), "sha256": sha(process.stdout)}}


def check(base: Path) -> dict[str, Any]:
    controller = base / CONTROLLER_NAME
    raw = read_regular(controller)
    require(len(raw) == CONTROLLER_BYTES and sha(raw) == CONTROLLER_SHA256, "controller identity")
    require(stat.S_IMODE(os.lstat(controller).st_mode) == 0o644, "controller mode")
    pair_review = base / PAIR_REVIEW_NAME
    pair_raw = read_regular(pair_review)
    require(len(pair_raw) == PAIR_REVIEW_BYTES and sha(pair_raw) == PAIR_REVIEW_SHA256 and stat.S_IMODE(os.lstat(pair_review).st_mode) == 0o644, "pair review identity")
    pair_value = json.loads(pair_raw, object_pairs_hook=pairs)
    require(pair_raw == canon(pair_value), "pair review canonical")
    require(pair_value.get("status") == "PASS_INDEPENDENT_SOURCE_DERIVED_V14_MATRIX_PAIR_ZERO_CREDIT_CONTROLLER_WORK_ONLY", "pair review verdict")
    manifest = verify_manifest(base)
    source = audit_source(raw.decode("utf-8"))
    module = load_controller(controller)
    require(tuple(module.MATRIX_IDS) == MATRIX_IDS and module.ROW_COUNT == ROW_COUNT and module.MAX_PARALLEL == 1, "module constants")
    return {
        "authority": {"matrix_001_admission_eligible": True, "matrix_launch": False, "qualification_credit": 0},
        "checks": {
            "controller_process": run_controller_check(base, controller),
            "exact_all_row_argv_projections": exact_argv(module, base, manifest),
            "mutation_self_test": mutation_self_test(raw),
            "source": source,
        },
        "controller": {"bytes": len(raw), "mode": "0644", "path": CONTROLLER_NAME, "sha256": sha(raw)},
        "first_mismatch": None,
        "lineage": {"matrix005": "PERMANENT_FAIL", "matrix006": "INVALIDATED", "v13_canary": "PASS_ZERO_CREDIT"},
        "omp_lane": {"duplicate_launch": False, "launch_boundary": "omp --cwd P:\\", "linux_process_inference": False, "status": "UNTOUCHED"},
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_STATIC_CHECK_V14_STRUCTURAL_CONTEXT_MATRIX_001_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.base.is_absolute(), "CLI")
        result, rc = check(args.base), 0
    except (Invalid, OSError, UnicodeError, subprocess.SubprocessError, json.JSONDecodeError) as exc:
        result = {"error": str(exc), "first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
