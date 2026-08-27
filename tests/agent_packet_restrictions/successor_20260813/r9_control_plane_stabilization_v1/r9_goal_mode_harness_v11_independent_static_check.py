#!/usr/bin/env python3
"""Independent static and data-only checker for the V11 prefix-aware harness."""

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
import tempfile
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
    require(raw == canon(value), f"noncanonical:{path}")
    return value


def identity(path: Path, label: str) -> dict[str, Any]:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink(), f"unsafe:{label}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require((before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), f"changed:{label}")
    return {"bytes": len(raw), "mode": f"{stat.S_IMODE(before.st_mode):04o}", "path": label, "sha256": hashlib.sha256(raw).hexdigest()}


def functions(tree: ast.AST) -> dict[str, ast.FunctionDef | ast.AsyncFunctionDef]:
    return {node.name: node for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}


def segment(text: str, tree: ast.AST, name: str) -> str:
    node = functions(tree).get(name)
    require(node is not None, f"missing function:{name}")
    result = ast.get_source_segment(text, node)
    require(isinstance(result, str), f"source segment:{name}")
    return result


def validate(attestor: str, harness: str, v10_attestor: str, contract: dict[str, Any]) -> None:
    atree = ast.parse(attestor)
    htree = ast.parse(harness)
    require(
        contract.get("schema_id") == "pw-r9-goal-mode-empirical-harness-contract-v11"
        and contract.get("status") == "STATIC_PREFIX_AWARE_SAME_TASK_TERMINAL_CLOSURE_ZERO_CREDIT_NO_LAUNCH",
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
        contract.get("historical_prefix_contract")
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
    require(
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
    prefix = segment(attestor, atree, "_prefix_aware_attest_scored")
    require(
        '_original_attest_scored(row_path, capture, codex_home, expected_current_goal_status)' in prefix
        and 'stored = load_json(capture / "scored_phase_attestation.json"' in prefix
        and 'stored.get("schema_id") == SCORED_ATTESTATION_SCHEMA' in prefix
        and 'base._assert_rollout_prefix(codex_home, historical, "historical scored")' in prefix
        and 'historical["logical_path"] == current.get("logical_path")' in prefix
        and 'prefix_bytes < current.get("bytes", 0)' in prefix
        and 'result["rollout"] = historical' in prefix,
        "prefix implementation",
    )
    final = segment(attestor, atree, "attest_final")
    require(
        "result = v10.attest_final" in final
        and 'historical["bytes"] < final["bytes"]' in final
        and '"strict_prefix": True' in final,
        "final prefix proof",
    )
    require('require(stored_scored == scored, "scored attestation changed")' in v10_attestor, "frozen non-rollout equality")
    require('V10_FAILURE.name, V10_FAILURE' in harness and 'V10_HARNESS_PATH' in harness, "frozen V10 lineage")
    load_admission = segment(harness, htree, "_load_admission")
    require(
        'PASS_INDEPENDENT_V11_PREFIX_AWARE_TERMINAL_CLOSURE_HARNESS_REVIEW' in load_admission
        and 'review.get("bindings") == _bindings()' in load_admission,
        "V11 admission",
    )
    run_row = segment(harness, htree, "run_codex_row")
    require(
        'PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_PREFIX_AWARE_ZERO_CREDIT' in run_row
        and 'PASS_NATIVE_GOAL_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AWARE_ZERO_CREDIT' in run_row,
        "V11 row success",
    )
    check = segment(harness, htree, "check")
    require("Popen" not in check and '"canary_launch": False' in check and '"matrix_launch": False' in check, "check zero launch")


def mutate(text: str, old: str, new: str) -> str:
    require(old in text, f"mutation source absent:{old}")
    return text.replace(old, new, 1)


def load_attestor(path: Path) -> Any:
    root = str(path.parent)
    sys.path.insert(0, root)
    try:
        spec = importlib.util.spec_from_file_location("_r9_v11_checker_attestor", path)
        require(spec is not None and spec.loader is not None, "attestor loader")
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        spec.loader.exec_module(module)
        return module
    finally:
        sys.path.remove(root)


def prefix_fixture(attestor: Any) -> dict[str, Any]:
    original = attestor._original_attest_scored
    original_assert = attestor.base._assert_rollout_prefix
    current = {"rollout": {"bytes": 200, "logical_path": "sessions/final.jsonl", "sha256": "f" * 64}}
    historical = {"bytes": 100, "logical_path": "sessions/final.jsonl", "sha256": "a" * 64}
    with tempfile.TemporaryDirectory(prefix="r9-v11-prefix-check-") as raw:
        capture = Path(raw)
        (capture / "scored_phase_attestation.json").write_bytes(
            canon({"rollout": historical, "schema_id": attestor.SCORED_ATTESTATION_SCHEMA})
        )
        try:
            attestor._original_attest_scored = lambda *_args: json.loads(json.dumps(current))
            attestor.base._assert_rollout_prefix = lambda _home, value, _label: value["bytes"]
            passed = attestor._prefix_aware_attest_scored(Path("row"), capture, Path("home"), "complete")
            require(passed["rollout"] == historical, "fixture historical projection")
            active = attestor._prefix_aware_attest_scored(Path("row"), capture, Path("home"), "active")
            require(active["rollout"] == current["rollout"], "fixture active projection")
            rejected: list[str] = []
            cases = {
                "equal_length": {**historical, "bytes": 200},
                "longer": {**historical, "bytes": 201},
                "different_path": {**historical, "logical_path": "sessions/other.jsonl"},
            }
            for name, value in cases.items():
                (capture / "scored_phase_attestation.json").write_bytes(
                    canon({"rollout": value, "schema_id": attestor.SCORED_ATTESTATION_SCHEMA})
                )
                try:
                    attestor._prefix_aware_attest_scored(Path("row"), capture, Path("home"), "complete")
                except Exception:
                    rejected.append(name)
                else:
                    raise Invalid(f"prefix fixture accepted:{name}")
            (capture / "scored_phase_attestation.json").write_bytes(
                canon({"rollout": historical, "schema_id": "wrong"})
            )
            try:
                attestor._prefix_aware_attest_scored(Path("row"), capture, Path("home"), "complete")
            except Exception:
                rejected.append("wrong_schema")
            else:
                raise Invalid("prefix fixture accepted:wrong_schema")
            attestor.base._assert_rollout_prefix = lambda *_args: (_ for _ in ()).throw(attestor.Invalid("changed prefix"))
            (capture / "scored_phase_attestation.json").write_bytes(
                canon({"rollout": historical, "schema_id": attestor.SCORED_ATTESTATION_SCHEMA})
            )
            try:
                attestor._prefix_aware_attest_scored(Path("row"), capture, Path("home"), "complete")
            except Exception:
                rejected.append("changed_prefix")
            else:
                raise Invalid("prefix fixture accepted:changed_prefix")
            return {"active_projection": "CURRENT_FULL_ROLLOUT", "complete_projection": "VERIFIED_HISTORICAL_PREFIX", "rejected": rejected}
        finally:
            attestor._original_attest_scored = original
            attestor.base._assert_rollout_prefix = original_assert


def run(args: argparse.Namespace) -> dict[str, Any]:
    base = args.base.resolve()
    root = base / "goal_mode_empirical_harness_v11"
    attestor_path = root / "goal_mode_terminal_closure_attestor.py"
    harness_path = root / "goal_mode_harness.py"
    v10_attestor_path = base / "goal_mode_empirical_harness_v10" / "goal_mode_terminal_closure_attestor.py"
    attestor_text = attestor_path.read_text(encoding="utf-8")
    harness_text = harness_path.read_text(encoding="utf-8")
    v10_text = v10_attestor_path.read_text(encoding="utf-8")
    contract = load(root / "goal_mode_contract.json")
    validate(attestor_text, harness_text, v10_text, contract)
    rejected: list[str] = []
    mutations = [
        ("prefix_assertion", 'base._assert_rollout_prefix(codex_home, historical, "historical scored")', 'historical["bytes"]'),
        ("strict_length", 'prefix_bytes < current.get("bytes", 0)', 'prefix_bytes <= current.get("bytes", 0)'),
        ("same_path", 'historical["logical_path"] == current.get("logical_path")', "True"),
        ("historical_projection", 'result["rollout"] = historical', 'result["rollout"] = current'),
        ("stored_schema", 'stored.get("schema_id") == SCORED_ATTESTATION_SCHEMA', "True"),
        ("final_strict", 'historical["bytes"] < final["bytes"]', 'historical["bytes"] <= final["bytes"]'),
    ]
    for name, old, new in mutations:
        try:
            validate(mutate(attestor_text, old, new), harness_text, v10_text, contract)
        except Invalid:
            rejected.append(name)
        else:
            raise Invalid(f"mutation accepted:{name}")
    attestor = load_attestor(attestor_path)
    fixture = prefix_fixture(attestor)
    env = dict(os.environ)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    before = [identity(path, path.name) for path in sorted(root.iterdir()) if path.is_file()]
    completed = subprocess.run(
        [sys.executable, "-B", str(harness_path), "check", "--codex", str(args.codex.resolve())],
        cwd=base,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
        timeout=30,
        env=env,
    )
    after = [identity(path, path.name) for path in sorted(root.iterdir()) if path.is_file()]
    require(before == after, "V11 source write during check")
    require(completed.returncode == 0 and completed.stderr == b"", "V11 harness check")
    checked = json.loads(completed.stdout, object_pairs_hook=pairs)
    require(checked.get("status") == "PASS_STATIC_PREFIX_AWARE_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT", "V11 check status")
    return {
        "authority": {
            "canary_admission_eligible": True,
            "canary_launch": False,
            "matrix_launch": False,
            "qualification_credit": 0,
            "qualification_streak_clean_matrices": 0,
            "release": False,
        },
        "bindings": checked["bindings"],
        "checks": {
            "historical_prefix_fixture": fixture,
            "matrix006_invalidated": True,
            "mutations_rejected": rejected,
            "no_omp_launch_or_linux_inference": "PASS_STATIC",
            "non_rollout_exact_equality": "PASS_FROZEN_V10_FINAL_COMPARISON",
            "v10_failure_preserved": True,
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
        "schema_id": "pw-r9-goal-mode-harness-v11-independent-static-check-v1",
        "status": "PASS_INDEPENDENT_STATIC_CHECK_V11_PREFIX_AWARE_TERMINAL_CLOSURE_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--codex", type=Path, required=True)
    parser.add_argument("--check", action="store_true", required=True)
    args = parser.parse_args()
    try:
        result = run(args)
        rc = 0
    except (Invalid, OSError, UnicodeError, subprocess.SubprocessError) as exc:
        result = {
            "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
            "error": str(exc),
            "first_mismatch": str(exc),
            "schema_id": "pw-r9-goal-mode-harness-v11-independent-static-check-v1",
            "status": "FAIL_INDEPENDENT_STATIC_CHECK_ZERO_CREDIT_NO_LAUNCH",
        }
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
