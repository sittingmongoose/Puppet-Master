#!/usr/bin/env python3
"""Create-only three-route canary driver for the continuation-aware Goal kernel."""

from __future__ import annotations

import argparse
import gzip
import hashlib
import importlib.util
import json
import os
import stat
import subprocess
import sys
from pathlib import Path

SCHEMA = "pw-r9-native-goal-continuation-roster-canary-driver-v1"
REPO = Path("/mnt/Cursor/PuppetMaster")
BASE = REPO / "tests/r9g49"
HARNESS = BASE / "native_goal_continuation_harness_v3.py"
HARNESS_ID = {
    "bytes": 16107,
    "mode": "0644",
    "path": "tests/r9g49/native_goal_continuation_harness_v3.py",
    "sha256": "faf09b0e3004fa51199c59236d0ae55c83fe51875ac6978e6ff4c40b29776d8c",
}
ROUTES = {
    "slot-alpha": ("a", "gpt-5.4-mini", "xhigh", BASE / "roster-alpha-001"),
    "slot-bravo": ("b", "gpt-5.4-mini", "medium", BASE / "roster-bravo-001"),
    "slot-charlie": ("c", "gpt-5.6-luna", "medium", BASE / "roster-charlie-001"),
}


class Invalid(Exception):
    pass


def fail(message: str) -> None:
    raise Invalid(message)


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read(path: Path, label: str) -> bytes:
    before = path.lstat()
    if (
        path.resolve(strict=True) != path
        or not stat.S_ISREG(before.st_mode)
        or stat.S_IMODE(before.st_mode) != 0o644
    ):
        fail(f"custody:{label}")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            fail(f"race:{label}")
        chunks = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
    finally:
        os.close(fd)
    after = path.lstat()
    if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (
        before.st_dev,
        before.st_ino,
        before.st_size,
        before.st_mtime_ns,
    ):
        fail(f"drift:{label}")
    return b"".join(chunks)


_raw = read(HARNESS, "harness")
if len(_raw) != HARNESS_ID["bytes"] or sha(_raw) != HARNESS_ID["sha256"]:
    raise RuntimeError("harness-identity")
_spec = importlib.util.spec_from_file_location("r9g49_continuation_harness_v3", HARNESS)
if _spec is None or _spec.loader is None:
    raise RuntimeError("harness-import")
h = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = h
_spec.loader.exec_module(h)


def canonical(value: object) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        allow_nan=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8") + b"\n"


def self_identity() -> dict[str, object]:
    path = Path(__file__).resolve(strict=True)
    raw = read(path, "self")
    return {
        "bytes": len(raw),
        "mode": "0644",
        "path": str(path.relative_to(REPO)),
        "sha256": sha(raw),
    }


def check() -> dict[str, object]:
    h.v2.runtime_check()
    if h.self_identity() != HARNESS_ID:
        fail("harness-self-identity")
    return {
        "authority": False,
        "driver": self_identity(),
        "first_mismatch": None,
        "harness": HARNESS_ID,
        "matrix_launch": False,
        "qualification_credit": 0,
        "routes": {
            route: {"model": model, "reasoning_effort": effort}
            for route, (_code, model, effort, _root) in ROUTES.items()
        },
        "schema_id": SCHEMA,
        "status": "PASS_STATIC_ROSTER_CANARY_DRIVER_ZERO_CREDIT_NO_MATRIX_AUTHORITY",
        "subject_calls": 0,
        "workspace_writes": 0,
    }


def run(route: str, output_root: Path, timeout_seconds: int) -> dict[str, object]:
    if route not in ROUTES or timeout_seconds != 180:
        fail("run-arguments")
    code, model, effort, expected_root = ROUTES[route]
    if output_root != expected_root or output_root.exists():
        fail("output-root")
    h.v2.runtime_check()
    h.make_dir(output_root)
    capsule_value = {
        "c": "Uppercase the letter in p.",
        "p": "m",
        "q": "One uppercase ASCII letter only.",
    }
    capsule = h.base.canonical_no_lf(capsule_value)
    execution = sha(
        b"r9g49-roster\0" + route.encode("utf-8") + b"\0" + capsule
    )[:24]
    objective = h.base.goal_objective(execution, capsule)
    result = h.launch_goal(objective, model, effort, None, timeout_seconds)
    trace_raw = result.pop("trace_raw")
    tui_raw = result.pop("tui_raw")
    trace_gzip = gzip.compress(trace_raw, compresslevel=9, mtime=0)
    tui_gzip = gzip.compress(tui_raw, compresslevel=9, mtime=0)
    h.base.write_exact(output_root / "rollout.jsonl.gz", trace_gzip)
    h.base.write_exact(output_root / "tui.txt.gz", tui_gzip)
    passed = (
        result.get("verification_error") is None
        and result.get("result_utf8") == "M"
        and isinstance(result.get("task_turn_count"), int)
        and 1 <= result["task_turn_count"] <= h.MAX_GOAL_TURNS
    )
    first_mismatch = None if passed else result.get("verification_error") or "canary-result"
    status = (
        "PASS_ROSTER_CANARY_ONLY_ZERO_CREDIT_NO_MATRIX_AUTHORITY"
        if passed
        else "FAIL_ROSTER_CANARY_CONSUMED_ZERO_CREDIT_NO_RETRY_NO_MATRIX_AUTHORITY"
    )
    receipt = {
        "authority": False,
        "driver": self_identity(),
        "execution_id": execution,
        "expected_result_utf8": "M",
        "first_mismatch": first_mismatch,
        "goal_command_bytes": len(("/goal " + objective).encode("utf-8")),
        "goal_objective": objective,
        "harness": HARNESS_ID,
        "model_requested": model,
        "qualification_credit": 0,
        "reasoning_effort_requested": effort,
        "route": route,
        "route_code": code,
        "schema_id": SCHEMA,
        "status": status,
        "trace_copy": {
            "bytes": len(trace_gzip),
            "raw_bytes": len(trace_raw),
            "raw_sha256": sha(trace_raw),
            "sha256": sha(trace_gzip),
        },
        "tui_copy": {
            "bytes": len(tui_gzip),
            "raw_bytes": len(tui_raw),
            "raw_sha256": sha(tui_raw),
            "sha256": sha(tui_gzip),
        },
        "verification": result,
    }
    artifact = output_root / ("receipt.json" if passed else "failure.json")
    h.base.write_exact(artifact, canonical(receipt))
    artifact_raw = read(artifact.resolve(strict=True), "artifact")
    return {
        "artifact": {"bytes": len(artifact_raw), "sha256": sha(artifact_raw)},
        "authority": False,
        "first_mismatch": first_mismatch,
        "qualification_credit": 0,
        "route": route,
        "schema_id": SCHEMA,
        "status": status,
    }


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(add_help=False)
    sub = result.add_subparsers(dest="command", required=True)
    check = sub.add_parser("check", add_help=False)
    check.add_argument("--check", action="store_true")
    launch = sub.add_parser("run", add_help=False)
    launch.add_argument("--route", required=True)
    launch.add_argument("--output-root", required=True)
    launch.add_argument("--timeout-seconds", type=int, default=180)
    return result


def main() -> int:
    try:
        args, extra = parser().parse_known_args()
        if extra:
            fail("CLI-extra")
        if args.command == "check":
            if not args.check:
                fail("CLI-check")
            output = check()
        else:
            output = run(
                args.route,
                Path(args.output_root).resolve(strict=False),
                args.timeout_seconds,
            )
        code = 0 if output.get("first_mismatch") is None else 1
    except (Invalid, OSError, RuntimeError, ValueError, TypeError, KeyError, subprocess.SubprocessError) as exc:
        output = {
            "authority": False,
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_MATRIX_AUTHORITY",
        }
        code = 1
    sys.stdout.buffer.write(canonical(output))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
