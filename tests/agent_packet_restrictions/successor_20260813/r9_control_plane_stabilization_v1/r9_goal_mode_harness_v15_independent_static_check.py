#!/usr/bin/env python3
"""Independent static and data-only checker for Goal harness V15."""

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


SCHEMA = "pw-r9-goal-mode-harness-v15-independent-static-check-v1"
EXPECTED = {
    "goal_mode_contract.json": (1292, "7ef07b6a708239725d1781975aa616bc1d598cbf36936366b2a609bd10bb5e29"),
    "goal_mode_harness.py": (26904, "e6c9082ec03dccd47797f40e22e9e86fdcb2fedd7cbe1d02a4c3fd3076e44a48"),
    "goal_mode_three_turn_attestor.py": (25197, "0f38d2c4be22bf48902641ea67dab9368c348181a9cd1f99bb69908696e64147"),
}


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


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int = 64_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require(
        (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
        == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
        and len(raw) == before.st_size,
        f"changing file:{path}",
    )
    return raw


def load_json(path: Path) -> Any:
    raw = read_regular(path)
    value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    require(raw == canon(value), f"noncanonical JSON:{path.name}")
    return value


def identity(path: Path, label: str) -> dict[str, Any]:
    raw = read_regular(path)
    return {"bytes": len(raw), "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}", "path": label, "sha256": sha(raw)}


def load_module(path: Path, name: str) -> Any:
    sys.path.insert(0, str(path.parent))
    spec = importlib.util.spec_from_file_location(name, path)
    require(spec is not None and spec.loader is not None, f"module loader:{name}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def _call_lines(tree: ast.AST, name: str) -> list[int]:
    result: list[int] = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        if isinstance(node.func, ast.Name) and node.func.id == name:
            result.append(node.lineno)
        elif isinstance(node.func, ast.Attribute) and node.func.attr == name:
            result.append(node.lineno)
    return sorted(result)


def source_checks(root: Path) -> dict[str, Any]:
    identities: list[dict[str, Any]] = []
    trees: dict[str, ast.AST] = {}
    texts: dict[str, str] = {}
    for name, (size, digest) in EXPECTED.items():
        path = root / name
        raw = read_regular(path)
        require(len(raw) == size and sha(raw) == digest, f"identity:{name}")
        require(stat.S_IMODE(os.lstat(path).st_mode) == 0o644, f"mode:{name}")
        identities.append({"bytes": len(raw), "mode": "0644", "path": f"goal_mode_empirical_harness_v15/{name}", "sha256": sha(raw)})
        if name.endswith(".py"):
            texts[name] = raw.decode("utf-8")
            trees[name] = ast.parse(texts[name], filename=name)
    harness_tree = trees["goal_mode_harness.py"]
    harness_text = texts["goal_mode_harness.py"]
    attestor_text = texts["goal_mode_three_turn_attestor.py"]
    require(len(_call_lines(harness_tree, "_start")) == 3, "exact three Codex process launches")
    require(len(_call_lines(harness_tree, "_precreate_last")) == 3, "exact three private output precreates")
    require(len(_call_lines(harness_tree, "mkfifo")) == 1 and len(_call_lines(harness_tree, "_deliver")) == 1, "exact subject channel cardinality")
    for name in ("attest_bootstrap", "attest_release", "attest_scored", "attest_final"):
        require(len(_call_lines(harness_tree, name)) == 1, f"exact attestor call:{name}")
    ordered_markers = [
        'bootstrap = ga.attest_bootstrap(',
        '"bootstrap_attestation.json", bootstrap',
        "os.mkfifo(fifo",
        "release = ga.attest_release(",
        "delivery = v10._deliver(",
        "scored = ga.attest_scored(",
        "final = ga.attest_final(",
    ]
    offsets = [harness_text.index(marker) for marker in ordered_markers]
    require(offsets == sorted(offsets) and len(set(offsets)) == len(offsets), "activation/release/closure ordering")
    forbidden: list[str] = []
    for node in ast.walk(harness_tree):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute) or node.func.attr not in {"Popen", "run"} or not node.args:
            continue
        argv = node.args[0]
        if isinstance(argv, (ast.List, ast.Tuple)) and argv.elts and isinstance(argv.elts[0], ast.Constant) and argv.elts[0].value in {"omp", "ps"}:
            forbidden.append(argv.elts[0].value)
    require(not forbidden, "OMP or Linux process census launch")
    for marker in (
        'historical_rollout: dict[str, Any] | None = None',
        'base._assert_rollout_prefix(codex_home, historical_rollout, "historical bootstrap")',
        'base._assert_rollout_prefix(codex_home, historical_scored, "historical scored")',
        '"bootstrap action closure"',
        '"scored action closure"',
        '"closure action closure"',
        'lifecycle["messages"] == [BOOTSTRAP_MARKER]',
        'lifecycle["messages"] == [expected.decode("utf-8")]',
        'lifecycle["messages"] == [CLOSURE_MARKER]',
    ):
        require(marker in attestor_text, f"attestor closure marker:{marker}")
    require(not _call_lines(harness_tree, "Popen"), "V15 bypasses inherited process wrapper")
    return {
        "ast": "PASS",
        "attestor_closed_turn_checks": 9,
        "identities": identities,
        "launches": 3,
        "output_precreates": 3,
        "subject_deliveries": 1,
    }


def contract_checks(base: Path, root: Path) -> dict[str, Any]:
    contract = load_json(root / "goal_mode_contract.json")
    design = load_json(base / "r9_goal_mode_v15_three_turn_successor_design_v1.json")
    failure = load_json(base / "r9_goal_mode_v14_structural_context_matrix_001_runtime_failure_receipt_v1.json")
    omp = {
        "duplicate_spawn": False,
        "host": "WINDOWS",
        "launch_argv": ["omp", "--cwd", "P:\\"],
        "linux_process_inference": False,
        "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED",
    }
    require(contract["omp_lane"] == {**omp, "goal_mode_required_per_fresh_test_taker": True}, "contract OMP boundary")
    require(design["omp_lane"] == omp, "design OMP boundary")
    require(
        contract["architecture"]["process_topology"] == "THREE_CODEX_PROCESSES_ONE_FRESH_PERSISTED_TASK_ONE_FRESH_GOAL_THREE_DISTINCT_TURNS"
        and contract["goal_lifecycle"]["activation_actions"] == ["get_goal", "create_goal", "get_goal"]
        and contract["goal_lifecycle"]["closure_actions"] == ["get_goal", "update_goal", "get_goal"],
        "three-turn contract",
    )
    require(
        failure["status"] == "FAIL_PERMANENT_V14_MATRIX_001_PRE_GOAL_ACTION_ZERO_CREDIT_NO_RETRY"
        and design["failure_source"] == identity(base / "r9_goal_mode_v14_structural_context_matrix_001_runtime_failure_receipt_v1.json", "r9_goal_mode_v14_structural_context_matrix_001_runtime_failure_receipt_v1.json"),
        "V14 permanent failure binding",
    )
    require(contract["authority"]["qualification_streak_clean_matrices"] == 0 and contract["matrix"]["two_consecutive_clean_matrices_required"] is True, "qualification freeze")
    return {"omp_duplicate_spawn": False, "qualification_streak": "0_OF_2", "v14_matrix_001": "PERMANENT_FAIL"}


def prompt_checks(root: Path) -> dict[str, Any]:
    ga = load_module(root / "goal_mode_three_turn_attestor.py", "_r9_goal_mode_v15_attestor_independent_check")
    harness = load_module(root / "goal_mode_harness.py", "_r9_goal_mode_v15_harness_independent_check")
    row = {
        "adapter": ga.ADAPTER,
        "attempt": 0,
        "cli_version": "0.148.0",
        "control_envelope": {"goal_mode_required": True},
        "criteria": {"expected_exact_utf8": "OK", "rule": "EXACT_UTF8_NO_DECORATION"},
        "model": "gpt-5.6-luna",
        "objective": "",
        "reasoning_effort": "medium",
        "row_id": "row-fixture",
        "run_id": "v15-fixture",
        "schema_id": ga.ROW_SCHEMA,
        "subject_utf8_bytes": 7,
        "subject_utf8_sha256": "0" * 64,
    }
    row["objective"] = ga.prior._expected_objective(row)
    capture = Path("/tmp/r9-v15-static-capture-not-created")
    workspace = Path("/mnt/Cursor/PuppetMaster")
    bootstrap = harness._bootstrap_prompt(row)
    scored = harness._scored_prompt(row, capture, workspace, {"goal": {"goal_id": "fixture"}})
    closure = harness._closure_prompt(row, {"bytes": 1, "sha256": "1" * 64})
    reader_command = ga.prior.reader_command(row, capture, workspace).encode()
    require(reader_command not in bootstrap and reader_command in scored and reader_command not in closure, "subject reader phase partition")
    require(ga.prior.get_goal_code().encode() in bootstrap and ga.prior.create_goal_code(row["objective"]).encode() in bootstrap, "bootstrap Goal actions")
    require(ga.prior.get_goal_code().encode() not in scored and ga.prior.update_goal_code().encode() not in scored, "scored executable Goal action absent")
    require(ga.prior.get_goal_code().encode() in closure and ga.prior.update_goal_code().encode() in closure, "closure Goal actions")
    require(row["subject_utf8_sha256"].encode() not in closure, "closure subject commitment absent")
    return {
        "bootstrap_has_subject_reader": False,
        "closure_has_subject_reader": False,
        "scored_has_executable_goal_action": False,
        "scored_has_subject_reader": True,
    }


def run_target_check(root: Path, codex: Path) -> dict[str, Any]:
    process = subprocess.run(
        [sys.executable, "-B", str(root / "goal_mode_harness.py"), "check", "--codex", str(codex)],
        cwd=root.parents[4],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        check=False,
        timeout=60,
    )
    require(process.returncode == 0 and process.stderr == b"", "target harness check process")
    value = json.loads(process.stdout, object_pairs_hook=pairs)
    require(process.stdout == canon(value), "target harness check canonical")
    require(value.get("status") == "PASS_STATIC_THREE_TURN_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT", "target harness status")
    return {
        "bindings": value["bindings"],
        "rc": 0,
        "stderr_bytes": 0,
        "stderr_sha256": sha(process.stderr),
        "stdout_bytes": len(process.stdout),
        "stdout_sha256": sha(process.stdout),
    }


def check(base: Path, codex: Path) -> dict[str, Any]:
    root = base / "goal_mode_empirical_harness_v15"
    source = source_checks(root)
    contract = contract_checks(base, root)
    prompts = prompt_checks(root)
    target = run_target_check(root, codex)
    bindings = target.pop("bindings")
    return {
        "authority": {"canary_admission_eligible": True, "canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings,
        "checks": {"contract": contract, "prompts": prompts, "source": source, "target_check": target},
        "first_mismatch": None,
        "lineage": {"v14_matrix_001": "PERMANENT_FAIL_ZERO_CREDIT", "v14_matrix_002": "NO_LAUNCH_AUTHORITY"},
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False},
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_V15_THREE_TURN_STATIC_CHECK_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--codex", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.base.is_absolute() and args.codex.is_absolute(), "CLI")
        result, rc = check(args.base, args.codex), 0
    except (Invalid, OSError, subprocess.SubprocessError, UnicodeError, json.JSONDecodeError) as exc:
        result = {"first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
