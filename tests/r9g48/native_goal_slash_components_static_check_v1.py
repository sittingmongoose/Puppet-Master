#!/usr/bin/env python3
"""Independent no-subject static gate for the native `/goal` matrix components."""

from __future__ import annotations

import ast
import hashlib
import json
import os
import stat
import subprocess
import sys
from pathlib import Path

SCHEMA = "pw-r9-native-goal-slash-components-static-check-v1"
REPO = Path("/mnt/Cursor/PuppetMaster")
BASE = REPO / "tests/r9g48"
FILES = {
    "canary": (
        BASE / "native_goal_slash_roster_canary_v1.json",
        3261,
        "3d28bb94e54fb2a62b15f537eec0b86c0c925696e853ee970fdf2c6261a2be9d",
    ),
    "harness": (
        BASE / "native_goal_slash_harness_v1.py",
        44090,
        "a0a898f2cd64b63db2a2dd75a5adc524a64477cf2445f085dd49bdec7a55558a",
    ),
    "manifest": (
        BASE / "native_goal_slash_matrix_pair_011_012_manifest_v1.json",
        5416,
        "b0821a4857b6b11effdde833b2b66dce167b2c33d63aefd4a6bc0f181fcf4bbd",
    ),
    "runner": (
        BASE / "native_goal_slash_matrix_runner_v1.py",
        26303,
        "4678c1418927b77e75ff33f96c14dac0223d3b3942a421cc7e7c89d89a66d932",
    ),
    "verifier": (
        BASE / "native_goal_slash_matrix_verifier_v1.py",
        48300,
        "2db72a557faa5fda65da05632f2d92d98e794c9019f4670c7b1fa395f2c88a45",
    ),
}
MATRIX009_FAILURE = (
    REPO
    / "tests/agent_packet_restrictions/successor_20260813/"
    "r9_control_plane_stabilization_v1/"
    "r9_codex_native_goal_tool_event_atomic_matrix_009_runtime_failure_receipt_v1.json"
)


class Invalid(Exception):
    pass


def fail(message: str):
    raise Invalid(message)


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical(value: object) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        allow_nan=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8") + b"\n"


def read(path: Path, label: str) -> bytes:
    before = path.lstat()
    if path.resolve(strict=True) != path or not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != 0o644:
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
    if (after.st_size, after.st_mtime_ns, after.st_ino, after.st_dev) != (before.st_size, before.st_mtime_ns, before.st_ino, before.st_dev):
        fail(f"drift:{label}")
    return b"".join(chunks)


def parse(data: bytes, label: str):
    try:
        value = json.loads(data)
    except Exception as exc:
        fail(f"json:{label}:{type(exc).__name__}")
    if canonical(value) != data:
        fail(f"canonical:{label}")
    return value


def projection() -> str:
    rows = []
    for path in sorted(BASE.rglob("*")):
        if path.is_symlink():
            fail(f"symlink:{path}")
        if path.is_file():
            info = path.stat()
            raw = read(path.resolve(strict=True), f"projection:{path.name}")
            rows.append(
                {
                    "bytes": len(raw),
                    "mode": f"{stat.S_IMODE(info.st_mode):04o}",
                    "path": path.relative_to(BASE).as_posix(),
                    "sha256": sha(raw),
                }
            )
    return sha(canonical(rows))


def call_name(node: ast.Call) -> str:
    value = node.func
    parts = []
    while isinstance(value, ast.Attribute):
        parts.append(value.attr)
        value = value.value
    if isinstance(value, ast.Name):
        parts.append(value.id)
    return ".".join(reversed(parts))


def analyze_sources(raws: dict[str, bytes]):
    trees = {name: ast.parse(raw.decode("utf-8"), filename=name) for name, raw in raws.items() if name in {"harness", "runner", "verifier"}}
    runner_calls = [call_name(node) for node in ast.walk(trees["runner"]) if isinstance(node, ast.Call)]
    verifier_calls = [call_name(node) for node in ast.walk(trees["verifier"]) if isinstance(node, ast.Call)]
    if runner_calls.count("h.launch_goal") != 1 or runner_calls.count("concurrent.futures.ThreadPoolExecutor") != 1:
        fail("runner-dispatch-cardinality")
    pools = [node for node in ast.walk(trees["runner"]) if isinstance(node, ast.Call) and call_name(node) == "concurrent.futures.ThreadPoolExecutor"]
    if len(pools) != 1 or len(pools[0].keywords) != 1 or pools[0].keywords[0].arg != "max_workers" or not isinstance(pools[0].keywords[0].value, ast.Constant) or pools[0].keywords[0].value.value != 3:
        fail("runner-concurrency")
    forbidden_verifier = {
        "open",
        "Path.write_bytes",
        "Path.write_text",
        "Path.mkdir",
        "Path.unlink",
        "os.write",
        "os.mkdir",
        "os.makedirs",
        "os.remove",
        "os.rename",
        "os.replace",
        "shutil.copy",
        "shutil.copy2",
        "shutil.rmtree",
    }
    if forbidden_verifier.intersection(verifier_calls):
        fail("verifier-write-call")
    runner_text = raws["runner"].decode("utf-8")
    verifier_text = raws["verifier"].decode("utf-8")
    harness_text = raws["harness"].decode("utf-8")
    if "r9-goal-" in runner_text or "omp " in runner_text.lower() or "omp " in verifier_text.lower():
        fail("superseded-lane-reference")
    if verifier_text.count('"r9-goal-"') != 1 or 'if "r9-goal-" in developer' not in verifier_text:
        fail("superseded-skill-negative-guard")
    if "PROMPT_MAX = 349" not in harness_text or "terminal_goal_get" not in harness_text:
        fail("harness-goal-contract")
    if 'sub.add_parser("run-matrix"' not in runner_text or 'sub.add_parser("verify"' not in verifier_text:
        fail("component-cli")
    if "run-canary" in runner_text or "resume" in runner_text or "retry(" in runner_text:
        fail("runner-extra-surface")


def run_check(path: Path, expected_status: str):
    process = subprocess.run(
        [sys.executable, "-B", str(path), "check", "--check"],
        cwd=REPO,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=30,
        check=False,
    )
    if process.returncode != 0 or process.stderr or not process.stdout.endswith(b"\n"):
        fail(f"component-check-process:{path.name}")
    value = parse(process.stdout, f"component-check:{path.name}")
    if value.get("status") != expected_status or value.get("workspace_writes") != 0 or value.get("qualification_credit") != 0:
        fail(f"component-check-result:{path.name}")
    return {
        "bytes": len(process.stdout),
        "sha256": sha(process.stdout),
        "status": value["status"],
    }


def check():
    before = projection()
    raws = {}
    identities = {}
    for name, (path, size, digest) in FILES.items():
        raw = read(path, name)
        if len(raw) != size or sha(raw) != digest:
            fail(f"identity:{name}")
        raws[name] = raw
        identities[name] = {"bytes": size, "mode": "0644", "path": str(path.relative_to(REPO)), "sha256": digest}
    manifest = parse(raws["manifest"], "manifest")
    canary = parse(raws["canary"], "canary")
    if manifest.get("qualification", {}).get("credit") != "0/2" or manifest.get("authority", {}).get("matrix_011_launch") is not False or manifest.get("authority", {}).get("matrix_012_launch") is not False:
        fail("manifest-authority")
    if canary.get("status") != "PASS_ROSTER_CANARY_ONLY_ZERO_CREDIT_NO_MATRIX_AUTHORITY" or [row.get("status") for row in canary.get("routes", [])] != ["PASS_PROBE_ONLY"] * 3:
        fail("canary")
    failure_raw = read(MATRIX009_FAILURE.resolve(strict=True), "matrix009-failure")
    if len(failure_raw) != 5960 or sha(failure_raw) != "40a3738d63328b414600aeb2264c399535629ee045d8e3daf8bb6b04bdd639af":
        fail("matrix009-failure")
    for matrix_id in ("codex-native-slash-goal-matrix-011", "codex-native-slash-goal-matrix-012"):
        if (BASE / "evidence" / matrix_id).exists():
            fail(f"matrix-root-present:{matrix_id}")
    analyze_sources(raws)
    runner_check = run_check(FILES["runner"][0], "PASS_STATIC_RUNNER_ZERO_CREDIT_NO_LAUNCH_AUTHORITY")
    verifier_check = run_check(FILES["verifier"][0], "PASS_STATIC_INDEPENDENT_VERIFIER_ZERO_CREDIT_NO_LAUNCH_AUTHORITY")
    after = projection()
    if before != after:
        fail("workspace-drift")
    return {
        "assertion_count": 24,
        "authority": False,
        "component_identities": identities,
        "first_mismatch": None,
        "matrix_011_launch": False,
        "matrix_012_launch": False,
        "qualification_credit": 0,
        "runner_check": runner_check,
        "schema_id": SCHEMA,
        "status": "PASS_MECHANICAL_COMPONENTS_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "verifier_check": verifier_check,
        "workspace_projection_sha256": after,
        "workspace_writes": 0,
    }


def main():
    try:
        if sys.argv != [sys.argv[0], "--check"]:
            fail("CLI")
        output = check()
        code = 0
    except (Invalid, OSError, ValueError, TypeError, KeyError, subprocess.SubprocessError) as exc:
        output = {
            "authority": False,
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
            "workspace_writes": 0,
        }
        code = 1
    sys.stdout.buffer.write(canonical(output))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
