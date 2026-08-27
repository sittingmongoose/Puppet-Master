#!/usr/bin/env python3
"""Independent zero-launch check for the V11 prefix-aware canary controller."""

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


SCHEMA = "pw-r9-goal-mode-v11-prefix-aware-terminal-closure-route-canary-controller-independent-check-v1"
CONTROLLER_NAME = "r9_goal_mode_v11_prefix_aware_terminal_closure_route_canary_controller_v1.py"
CONTROLLER_BYTES = 17918
CONTROLLER_SHA256 = "3c39641ee7bae2c608c839aa0c4ac12eb26e857b49b0095b92f3dfbecdc5cb91"
RUN_ID = "goal-mode-v11-prefix-aware-terminal-closure-canary-001"
ADAPTER = "CODEX_NATIVE_GOAL_SCORED_TURN_THEN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AWARE_V2"


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


def load(path: Path) -> Any:
    raw = read_regular(path)
    require(raw.endswith(b"\n") and b"\r" not in raw and b"\x00" not in raw, f"framing:{path}")
    value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(item)))
    require(raw == canon(value), f"noncanonical:{path}")
    return value


def write_temp_json(path: Path, value: Any) -> None:
    raw = canon(value)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), 0o600)
    try:
        offset = 0
        while offset < len(raw):
            offset += os.write(fd, raw[offset:])
        os.fsync(fd)
    finally:
        os.close(fd)
    require(path.read_bytes() == raw, f"temp reopen:{path}")


def load_controller(path: Path) -> Any:
    spec = importlib.util.spec_from_file_location("_r9_v11_canary_controller_check_target", path)
    require(spec is not None and spec.loader is not None, "controller loader")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def controller_ast(raw: bytes) -> dict[str, Any]:
    tree = ast.parse(raw.decode("utf-8"), filename=CONTROLLER_NAME)
    popens = [
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and isinstance(node.func.value, ast.Name)
        and node.func.value.id == "subprocess"
        and node.func.attr == "Popen"
    ]
    require(len(popens) == 1, "Popen cardinality")
    keywords = {item.arg: item.value for item in popens[0].keywords if item.arg is not None}
    require(isinstance(keywords.get("start_new_session"), ast.Constant) and keywords["start_new_session"].value is True, "new process session")
    functions = {node.name: node for node in tree.body if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    require({"capture_quiescent", "launch_one", "run", "check", "main"} <= set(functions), "required functions")
    require(any(isinstance(node, ast.Break) for node in ast.walk(functions["run"])), "fail-fast break")
    require(any(isinstance(node, ast.For) for node in ast.walk(functions["run"])), "serialized row loop")
    text = raw.decode("utf-8")
    for required in (
        ADAPTER,
        '"strict_prefix"',
        'historical["bytes"] < historical["final_bytes"]',
        '"v10_canary": "PERMANENT_FAIL_ZERO_CREDIT"',
        '"matrix_006": "INVALIDATED_NO_LAUNCH_AUTHORITY"',
        '"existing_launch": "omp --cwd P:\\\\"',
        '"max_parallel": 1',
        '"retry": False',
    ):
        require(required in text, f"source commitment:{required}")
    require("subprocess.Popen([\"omp\"" not in text and "os.system" not in text, "OMP duplicate or shell launch")
    return {"ast": "PASS", "popen_sites": 1, "serialized_loop": "PASS", "fail_fast_break": "PASS"}


def manifest_mutations(module: Any, manifest_path: Path) -> list[str]:
    original_path = module.MANIFEST
    original = load(manifest_path)
    mutations = {
        "adapter": lambda item: item["architecture"].__setitem__("adapter", "CODEX_NATIVE_GOAL_NON_PREFIX"),
        "lineage": lambda item: item["lineage"].__setitem__("v10_canary", "PASS"),
        "max_parallel": lambda item: item.__setitem__("max_parallel", 2),
        "omp_boundary": lambda item: item["omp_boundary"].__setitem__("existing_launch", "omp --cwd C:\\"),
        "run_id": lambda item: item.__setitem__("run_id", "goal-mode-v10-terminal-closure-canary-001"),
    }
    rejected: list[str] = []
    with tempfile.TemporaryDirectory(prefix="r9-v11-controller-manifest-") as td:
        root = Path(td)
        for name, mutate in mutations.items():
            value = json.loads(json.dumps(original))
            mutate(value)
            path = root / f"{name}.json"
            write_temp_json(path, value)
            module.MANIFEST = path
            try:
                module.load_manifest()
            except (module.Invalid, OSError):
                rejected.append(name)
            else:
                raise Invalid(f"manifest mutation accepted:{name}")
            finally:
                module.MANIFEST = original_path
    require(sorted(rejected) == sorted(mutations), "manifest mutation coverage")
    return rejected


def quiescence_mutations(module: Any) -> list[str]:
    baseline = {
        "scored": {
            "reader_quiescence": {"detected_pids": [], "kill_sent": 0, "remaining_pids": [], "term_sent": 0},
            "rc": 0,
            "stdin_closed": True,
            "subject_fifo_removed": True,
        },
        "closure": {"rc": 0, "stdin_closed": True, "timed_out": False},
        "attestation": {
            "goal": {"status": "complete"},
            "historical_scored_rollout": {"bytes": 100, "final_bytes": 200, "strict_prefix": True},
            "process_accounting": {"fresh_tasks": 1, "processes": 2, "resume_operations": 1, "retries": 0, "subject_deliveries": 1},
            "status": "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_PREFIX_AWARE_ZERO_CREDIT",
        },
    }
    mutations = {
        "equal_length": lambda item: item["attestation"]["historical_scored_rollout"].__setitem__("final_bytes", 100),
        "goal_active": lambda item: item["attestation"]["goal"].__setitem__("status", "active"),
        "reader_not_quiet": lambda item: item["scored"]["reader_quiescence"].__setitem__("remaining_pids", [123]),
        "strict_prefix_false": lambda item: item["attestation"]["historical_scored_rollout"].__setitem__("strict_prefix", False),
        "subject_deliveries_two": lambda item: item["attestation"]["process_accounting"].__setitem__("subject_deliveries", 2),
    }
    rejected: list[str] = []
    with tempfile.TemporaryDirectory(prefix="r9-v11-controller-quiescence-") as td:
        root = Path(td)

        def materialize(value: dict[str, Any]) -> None:
            write_temp_json(root / "scored_process_receipt.json", value["scored"])
            write_temp_json(root / "closure_process_receipt.json", value["closure"])
            write_temp_json(root / "goal_mode_attestation.json", value["attestation"])

        materialize(json.loads(json.dumps(baseline)))
        require(module.capture_quiescent(root), "baseline quiescence")
        for path in root.iterdir():
            path.unlink()
        for name, mutate in mutations.items():
            value = json.loads(json.dumps(baseline))
            mutate(value)
            materialize(value)
            require(not module.capture_quiescent(root), f"quiescence mutation accepted:{name}")
            rejected.append(name)
            for path in root.iterdir():
                path.unlink()
    return rejected


def run_check(base: Path, controller: Path) -> dict[str, Any]:
    process = subprocess.run(
        [sys.executable, "-B", str(controller), "check"],
        cwd=base.parents[3],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        check=False,
        timeout=60,
    )
    require(process.returncode == 0 and process.stderr == b"", "controller check process")
    result = json.loads(process.stdout, object_pairs_hook=pairs)
    require(process.stdout == canon(result), "controller check canonical stdout")
    require(
        result.get("status") == "PASS_STATIC_ZERO_CREDIT_NO_LAUNCH"
        and result.get("authority") == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0}
        and result.get("checks", {}).get("exact_historical_scored_rollout_prefix") == "PASS_STATIC"
        and result.get("checks", {}).get("v10_failure_preserved") is True,
        "controller check result",
    )
    return {
        "rc": process.returncode,
        "stderr_bytes": len(process.stderr),
        "stderr_sha256": sha(process.stderr),
        "stdout_bytes": len(process.stdout),
        "stdout_sha256": sha(process.stdout),
    }


def check(base: Path) -> dict[str, Any]:
    controller = base / CONTROLLER_NAME
    raw = read_regular(controller)
    require(len(raw) == CONTROLLER_BYTES and sha(raw) == CONTROLLER_SHA256, "controller identity")
    require(stat.S_IMODE(os.lstat(controller).st_mode) == 0o644, "controller mode")
    ast_result = controller_ast(raw)
    module = load_controller(controller)
    require(module.RUN_ID == RUN_ID and module.ADAPTER == ADAPTER, "controller constants")
    manifest = base / "goal_mode_v11_prefix_aware_terminal_closure_canary_001_inputs" / "manifest.json"
    require(not (base / "goal_mode_v11_prefix_aware_terminal_closure_canary_001_evidence").exists(), "fresh evidence root")
    return {
        "authority": {"canary_admission_eligible": True, "canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "checks": {
            "controller_process": run_check(base, controller),
            "manifest_mutations_rejected": manifest_mutations(module, manifest),
            "quiescence_mutations_rejected": quiescence_mutations(module),
            "source": ast_result,
        },
        "controller": {"bytes": len(raw), "mode": "0644", "path": CONTROLLER_NAME, "sha256": sha(raw)},
        "first_mismatch": None,
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False},
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_STATIC_CHECK_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.base.is_absolute(), "CLI")
        result, rc = check(args.base), 0
    except (Invalid, OSError, subprocess.SubprocessError, UnicodeError, json.JSONDecodeError) as exc:
        result = {"first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
