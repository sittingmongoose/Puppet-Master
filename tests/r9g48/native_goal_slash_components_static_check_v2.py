#!/usr/bin/env python3
"""Read-only mechanical gate for the simplified native `/goal` matrix lane."""

from __future__ import annotations

import ast
import hashlib
import json
import os
import stat
import subprocess
import sys
from pathlib import Path

SCHEMA = "pw-r9-native-goal-slash-components-static-check-v2"
REPO = Path("/mnt/Cursor/PuppetMaster")
BASE = REPO / "tests/r9g48"
CODEX = Path("/home/sittingmongoose/.local/bin/codex")
CODEX_REAL = Path(
    "/home/sittingmongoose/.codex/packages/standalone/releases/"
    "0.148.0-x86_64-unknown-linux-musl/bin/codex"
)
RUNTIME_ID = {
    "bytes": 251271488,
    "mode": "0755",
    "path": str(CODEX_REAL),
    "sha256": "ac2cfed85fb647d61e0150b8548102b330e4799d9d81ad5d354de701edf6b074",
    "version": "codex-cli 0.148.0",
}
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
        28328,
        "5a19806638eb1d50ea35fc3c2487dbff832b883f3576426ed0dc511b1d54aecf",
    ),
    "verifier": (
        BASE / "native_goal_slash_matrix_verifier_v1.py",
        51487,
        "463991aed3c8621600f500b8a88dd7d643255a1dbafd0bba4699c67c6fa096de",
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


def fail(message: str) -> None:
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


def unique_object(pairs):
    value = {}
    for key, item in pairs:
        if key in value:
            fail(f"duplicate-key:{key}")
        value[key] = item
    return value


def parse(data: bytes, label: str):
    try:
        value = json.loads(
            data.decode("utf-8"),
            object_pairs_hook=unique_object,
            parse_constant=lambda item: fail(f"nonfinite:{label}:{item}"),
        )
    except Invalid:
        raise
    except Exception as exc:
        fail(f"json:{label}:{type(exc).__name__}")
    if canonical(value) != data:
        fail(f"canonical:{label}")
    return value


def read(path: Path, label: str, mode: int = 0o644) -> bytes:
    if not path.is_absolute():
        fail(f"absolute:{label}")
    before = path.lstat()
    if path.resolve(strict=True) != path or not stat.S_ISREG(before.st_mode):
        fail(f"type:{label}")
    if stat.S_IMODE(before.st_mode) != mode:
        fail(f"mode:{label}")
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


def projection() -> str:
    rows = []
    for path in sorted(BASE.rglob("*")):
        if path.is_symlink():
            fail(f"projection-symlink:{path}")
        if path.is_file():
            raw = read(path.resolve(strict=True), f"projection:{path.name}")
            rows.append(
                {
                    "bytes": len(raw),
                    "mode": f"{stat.S_IMODE(path.stat().st_mode):04o}",
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


def function(tree: ast.Module, name: str) -> ast.FunctionDef:
    matches = [
        node
        for node in tree.body
        if isinstance(node, ast.FunctionDef) and node.name == name
    ]
    if len(matches) != 1:
        fail(f"function:{name}")
    return matches[0]


def literal_keys(value: ast.AST) -> set[str]:
    if isinstance(value, ast.Dict):
        nodes = value.keys
    elif isinstance(value, ast.Set):
        nodes = value.elts
    else:
        fail("literal-key-container")
    try:
        result = {ast.literal_eval(node) for node in nodes}
    except Exception:
        fail("literal-key")
    if not all(isinstance(item, str) for item in result):
        fail("literal-key-type")
    return result


def assigned_keys(func: ast.FunctionDef, name: str) -> set[str]:
    matches = []
    for node in ast.walk(func):
        if not isinstance(node, ast.Assign):
            continue
        if any(isinstance(target, ast.Name) and target.id == name for target in node.targets):
            if isinstance(node.value, (ast.Dict, ast.Set)):
                matches.append(literal_keys(node.value))
    if len(matches) != 1:
        fail(f"assigned-keys:{func.name}:{name}")
    return matches[0]


def verifier_set(func: ast.FunctionDef, required: set[str]) -> set[str]:
    matches = []
    for node in ast.walk(func):
        if isinstance(node, ast.Set):
            values = literal_keys(node)
            if required <= values:
                matches.append(values)
    if len(matches) != 1:
        fail(f"verifier-set:{sorted(required)}")
    return matches[0]


def analyze_sources(raws: dict[str, bytes]) -> dict[str, object]:
    trees = {
        name: ast.parse(raw.decode("utf-8"), filename=name)
        for name, raw in raws.items()
        if name in {"harness", "runner", "verifier"}
    }
    runner = trees["runner"]
    verifier = trees["verifier"]
    runner_calls = [
        call_name(node) for node in ast.walk(runner) if isinstance(node, ast.Call)
    ]
    verifier_calls = [
        call_name(node) for node in ast.walk(verifier) if isinstance(node, ast.Call)
    ]
    if runner_calls.count("h.launch_goal") != 1:
        fail("runner-dispatch-cardinality")
    pools = [
        node
        for node in ast.walk(runner)
        if isinstance(node, ast.Call)
        and call_name(node) == "concurrent.futures.ThreadPoolExecutor"
    ]
    if (
        len(pools) != 1
        or len(pools[0].keywords) != 1
        or pools[0].keywords[0].arg != "max_workers"
        or not isinstance(pools[0].keywords[0].value, ast.Constant)
        or pools[0].keywords[0].value.value != 3
    ):
        fail("runner-concurrency")
    forbidden_verifier = {
        "open",
        "Path.mkdir",
        "Path.unlink",
        "Path.write_bytes",
        "Path.write_text",
        "os.mkdir",
        "os.makedirs",
        "os.remove",
        "os.rename",
        "os.replace",
        "os.write",
        "shutil.copy",
        "shutil.copy2",
        "shutil.rmtree",
    }
    if forbidden_verifier.intersection(verifier_calls):
        fail("verifier-write-call")
    harness_text = raws["harness"].decode("utf-8")
    runner_text = raws["runner"].decode("utf-8")
    verifier_text = raws["verifier"].decode("utf-8")
    if any(token in runner_text for token in ("create_goal", "spawn_agent", "followup_task", ".agents/skills")):
        fail("runner-worker-bootstrap")
    if "r9-goal-" in runner_text or "omp " in runner_text.lower() or "omp " in verifier_text.lower():
        fail("superseded-lane-reference")
    if "h.CODEX = CODEX_REAL" not in runner_text:
        fail("runner-direct-runtime")
    for token in (
        'meta.get("cli_version") != "0.148.0"',
        'meta.get("model_provider") != "openai"',
        'meta.get("thread_source") != "user"',
    ):
        if token not in verifier_text:
            fail(f"verifier-runtime-trace:{token}")
    if (
        "PROMPT_MAX = 349" not in harness_text
        or 'f"/goal {objective}"' not in harness_text
        or "Complete Goal with update_goal; use no other tool; answer only." not in harness_text
        or "terminal_goal_get" not in harness_text
    ):
        fail("harness-minimal-goal-contract")
    if verifier_text.count('"r9-goal-"') != 1 or 'if "r9-goal-" in developer' not in verifier_text:
        fail("verifier-skill-exclusion")
    runner_admission = assigned_keys(function(runner, "read_admission"), "exact")
    verify_func = function(verifier, "verify_run")
    verifier_admission = verifier_set(
        verify_func, {"predecessor_verification", "verification_component"}
    )
    if runner_admission != verifier_admission:
        fail("admission-schema-mismatch")
    schema_pairs = (
        (
            "run",
            assigned_keys(function(runner, "run_matrix"), "run_record"),
            verifier_set(verify_func, {"admission", "route_order", "runtime"}),
        ),
        (
            "task",
            assigned_keys(function(runner, "archive_task"), "record"),
            verifier_set(verify_func, {"atom_id", "trace_copy", "verification"}),
        ),
        (
            "terminal",
            assigned_keys(function(runner, "seal_matrix"), "terminal"),
            assigned_keys(verify_func, "expected_terminal"),
        ),
        (
            "accounting",
            assigned_keys(function(runner, "seal_matrix"), "accounting"),
            assigned_keys(verify_func, "expected_accounting"),
        ),
    )
    for label, produced, accepted in schema_pairs:
        if produced != accepted:
            fail(f"{label}-schema-mismatch")
    return {
        "admission_field_count": len(runner_admission),
        "accounting_field_count": len(schema_pairs[3][1]),
        "run_field_count": len(schema_pairs[0][1]),
        "task_field_count": len(schema_pairs[1][1]),
        "terminal_field_count": len(schema_pairs[2][1]),
    }


def run_check(path: Path, expected_status: str) -> dict[str, object]:
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
    if (
        value.get("status") != expected_status
        or value.get("workspace_writes") != 0
        or value.get("qualification_credit") != 0
    ):
        fail(f"component-check-result:{path.name}")
    return {
        "bytes": len(process.stdout),
        "sha256": sha(process.stdout),
        "status": value["status"],
    }


def runtime_check() -> None:
    raw = read(CODEX_REAL, "codex-runtime", 0o755)
    if len(raw) != RUNTIME_ID["bytes"] or sha(raw) != RUNTIME_ID["sha256"]:
        fail("runtime-identity")
    if not CODEX.is_symlink() or CODEX.resolve(strict=True) != CODEX_REAL:
        fail("runtime-launcher")
    process = subprocess.run(
        [str(CODEX), "--version"],
        cwd=REPO,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=10,
        check=False,
    )
    if (
        process.returncode != 0
        or process.stderr
        or process.stdout != (RUNTIME_ID["version"] + "\n").encode("utf-8")
    ):
        fail("runtime-version")


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
    before = projection()
    raws = {}
    identities = {}
    for name, (path, size, digest) in FILES.items():
        raw = read(path, name)
        if len(raw) != size or sha(raw) != digest:
            fail(f"identity:{name}")
        raws[name] = raw
        identities[name] = {
            "bytes": size,
            "mode": "0644",
            "path": str(path.relative_to(REPO)),
            "sha256": digest,
        }
    manifest = parse(raws["manifest"], "manifest")
    canary = parse(raws["canary"], "canary")
    if (
        manifest.get("qualification", {}).get("credit") != "0/2"
        or manifest.get("authority", {}).get("matrix_011_launch") is not False
        or manifest.get("authority", {}).get("matrix_012_launch") is not False
    ):
        fail("manifest-authority")
    if (
        canary.get("status")
        != "PASS_ROSTER_CANARY_ONLY_ZERO_CREDIT_NO_MATRIX_AUTHORITY"
        or [row.get("status") for row in canary.get("routes", [])]
        != ["PASS_PROBE_ONLY"] * 3
    ):
        fail("canary")
    failure_raw = read(MATRIX009_FAILURE.resolve(strict=True), "matrix009-failure")
    if (
        len(failure_raw) != 5960
        or sha(failure_raw)
        != "40a3738d63328b414600aeb2264c399535629ee045d8e3daf8bb6b04bdd639af"
    ):
        fail("matrix009-failure")
    for matrix_id in (
        "codex-native-slash-goal-matrix-011",
        "codex-native-slash-goal-matrix-012",
    ):
        if (BASE / "evidence" / matrix_id).exists():
            fail(f"matrix-root-present:{matrix_id}")
    runtime_check()
    schema_counts = analyze_sources(raws)
    runner_check = run_check(
        FILES["runner"][0],
        "PASS_STATIC_RUNNER_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
    )
    verifier_check = run_check(
        FILES["verifier"][0],
        "PASS_STATIC_INDEPENDENT_VERIFIER_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
    )
    after = projection()
    if before != after:
        fail("workspace-drift")
    return {
        "assertion_count": 37,
        "authority": False,
        "checker": self_identity(),
        "component_identities": identities,
        "first_mismatch": None,
        "matrix_011_launch": False,
        "matrix_012_launch": False,
        "qualification_credit": 0,
        "runner_check": runner_check,
        "runtime": RUNTIME_ID,
        "schema_counts": schema_counts,
        "schema_id": SCHEMA,
        "status": "PASS_MECHANICAL_COMPONENTS_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "verifier_check": verifier_check,
        "workspace_projection_sha256": after,
        "workspace_writes": 0,
    }


def main() -> int:
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
