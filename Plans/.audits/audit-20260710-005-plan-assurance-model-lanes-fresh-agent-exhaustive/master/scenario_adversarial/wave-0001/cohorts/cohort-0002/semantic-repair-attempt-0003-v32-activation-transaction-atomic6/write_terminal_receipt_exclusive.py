#!/usr/bin/env python3
"""Future-only exclusive terminal-receipt writer for one authorized Attempt3 leaf."""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import re
import stat
import sys
from pathlib import Path
from typing import Any

sys.dont_write_bytecode = True
from jsonschema import Draft202012Validator

HERE = Path(__file__).resolve().parent
CORE = HERE / "ACTIVATION_CORE.json"
MANIFEST = HERE / "dispatch_manifest.jsonl"
SEAL = HERE / "ACTIVATION_SEAL.json"
PASS = HERE / "validation/PRELAUNCH_PASS.json"
RECEIPT_SCHEMA = HERE / "schemas/terminal_receipt.schema.json"
RESULT_SCHEMA = HERE.parent / "semantic-repair-attempt-0003-v32/schema/result.schema.json"
SEMANTIC_VALIDATOR = HERE.parent / "semantic-repair-attempt-0003-v32/preflight_attempt3_v32.py"
SEMANTIC_VALIDATOR_SHA256 = "882568bba4f626a9589d4526b18458508d6fe8f6251399fa42a8ec79ba6ab340"
IDS = ("A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016")
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
_SEMANTIC_MODULE: Any | None = None


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def stable_read(path: Path) -> bytes:
    lexical = path.lstat()
    if stat.S_ISLNK(lexical.st_mode) or not stat.S_ISREG(lexical.st_mode) or lexical.st_nlink != 1:
        raise ValueError(f"unsafe-regular:{path}")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        before = os.fstat(fd)
        chunks: list[bytes] = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
        after = os.fstat(fd)
    finally:
        os.close(fd)
    now = path.lstat()
    identity = lambda v: (v.st_dev, v.st_ino, v.st_mode, v.st_nlink, v.st_size, v.st_mtime_ns, v.st_ctime_ns)
    if identity(before) != identity(after) or identity(after) != identity(now):
        raise ValueError(f"toctou:{path}")
    raw = b"".join(chunks)
    if len(raw) != after.st_size:
        raise ValueError(f"short-read:{path}")
    return raw


def load(path: Path) -> Any:
    return json.loads(stable_read(path))


def semantic_module() -> Any:
    global _SEMANTIC_MODULE
    if _SEMANTIC_MODULE is not None:
        return _SEMANTIC_MODULE
    if sha(stable_read(SEMANTIC_VALIDATOR)) != SEMANTIC_VALIDATOR_SHA256:
        raise ValueError("semantic-validator-hash")
    source_root = str(SEMANTIC_VALIDATOR.parent)
    if source_root not in sys.path:
        sys.path.insert(0, source_root)
    spec = importlib.util.spec_from_file_location("attempt3_exact_semantic_preflight_for_receipt", SEMANTIC_VALIDATOR)
    if spec is None or spec.loader is None:
        raise ValueError("semantic-validator-import")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    _SEMANTIC_MODULE = module
    return module


def lexical_absent(path: Path) -> bool:
    try:
        path.lstat()
    except FileNotFoundError:
        return True
    return False


def real_directory(path: Path) -> None:
    observed = path.lstat()
    if stat.S_ISLNK(observed.st_mode) or not stat.S_ISDIR(observed.st_mode):
        raise ValueError(f"unsafe-directory:{path}")


def exclusive_write(path: Path, raw: bytes) -> None:
    if not lexical_absent(path):
        raise FileExistsError(f"target-present:{path}")
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(path, flags, 0o444)
    try:
        offset = 0
        while offset < len(raw):
            offset += os.write(fd, raw[offset:])
        os.fsync(fd)
        os.fchmod(fd, 0o444)
    except BaseException:
        os.close(fd)
        try:
            path.unlink()
        except OSError:
            pass
        raise
    else:
        os.close(fd)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True, choices=IDS)
    parser.add_argument("--native-child-thread-id", required=True)
    args = parser.parse_args()
    if not UUID_RE.fullmatch(args.native_child_thread_id):
        raise ValueError("invalid-native-child-thread-id")

    core = load(CORE)
    prelaunch = load(PASS)
    seal = load(SEAL)
    if core.get("activation_id") != "SCENARIO-C2-ATTEMPT3-V32-ACTIVATION-ATOMIC6":
        raise ValueError("activation-id")
    if prelaunch.get("status") != "PASS_ATOMIC6_AUTHORIZED_UNLAUNCHED_CREDIT_ZERO":
        raise ValueError("prelaunch-not-pass")
    if prelaunch.get("launch_authorized") is not True or prelaunch.get("semantic_launch") is not False:
        raise ValueError("prelaunch-authority")
    if prelaunch.get("source_seal_sha256") != sha(stable_read(SEAL)):
        raise ValueError("prelaunch-seal-binding")
    if seal.get("status") != "sealed_static_sources":
        raise ValueError("source-seal-status")

    rows = [json.loads(line) for line in stable_read(MANIFEST).decode("utf-8").splitlines() if line]
    row = next((value for value in rows if value.get("assignment_id") == args.assignment_id), None)
    if row is None or [value.get("assignment_id") for value in rows] != list(IDS):
        raise ValueError("manifest-membership")
    auth_path = Path(row["authorization"]["path"])
    auth_raw = stable_read(auth_path)
    if sha(auth_raw) != row["authorization"]["raw_sha256"]:
        raise ValueError("authorization-hash")
    auth = json.loads(auth_raw)
    if auth["authorization"]["single_use_state"] != "unconsumed" or auth["authorization"]["credit"] != 0:
        raise ValueError("authorization-state")

    output = Path(auth["leaf_binding"]["output_directory"]["path"])
    real_directory(output)
    target = Path(auth["leaf_binding"]["terminal_receipt_path"])
    result_path = Path(auth["leaf_binding"]["result_path"])
    if target.parent != output or result_path.parent != output:
        raise ValueError("target-parent")
    if not lexical_absent(target):
        raise FileExistsError("receipt-already-present")
    members = sorted(entry.name for entry in output.iterdir())
    if members != ["result.json"]:
        raise ValueError(f"output-members-before-receipt:{members}")

    result_raw = stable_read(result_path)
    result = json.loads(result_raw)
    errors = sorted(Draft202012Validator(load(RESULT_SCHEMA)).iter_errors(result), key=lambda e: list(e.absolute_path))
    if errors:
        raise ValueError(f"result-schema:{len(errors)}")
    semantic_errors = semantic_module().result_errors(result, args.assignment_id)
    if semantic_errors:
        raise ValueError("result-semantic:" + json.dumps(semantic_errors, sort_keys=True))
    leaf = auth["leaf_binding"]
    expected = {
        "assignment_id": args.assignment_id,
        "attempt_id": "attempt-0003",
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
        "task_thread_id": leaf["canonical_agent_path"],
        "status": "completed",
    }
    for key, value in expected.items():
        if result.get(key) != value:
            raise ValueError(f"result-identity:{key}")
    if result.get("coverage", {}).get("feature_count") != leaf["feature_count"]:
        raise ValueError("result-feature-count")

    for other_id in IDS:
        other = HERE.parent / f"semantic-repair-attempt-0003-v32/outputs/{other_id}/attempt-0003/terminal_receipt.json"
        if other == target or lexical_absent(other):
            continue
        if load(other).get("native_child_thread_id") == args.native_child_thread_id:
            raise ValueError("duplicate-native-child-thread-id")

    receipt = {
        "schema_version": "audit005-scenario-c2-attempt3-terminal-receipt-v1",
        "activation_id": "SCENARIO-C2-ATTEMPT3-V32-ACTIVATION-ATOMIC6",
        "assignment_id": args.assignment_id,
        "attempt_id": "attempt-0003",
        "authorization_sha256": sha(auth_raw),
        "native_child_thread_id": args.native_child_thread_id,
        "canonical_agent_path": leaf["canonical_agent_path"],
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
        "result": {"path": str(result_path), "raw_sha256": sha(result_raw)},
        "result_validation": {
            "status": "pass",
            "error_count": 0,
            "validator_path": str(SEMANTIC_VALIDATOR),
            "validator_raw_sha256": SEMANTIC_VALIDATOR_SHA256,
            "function": "result_errors",
        },
        "terminal_status": "completed",
        "descendants": 0,
        "followups": 0,
        "retries": 0,
        "credit": 0,
    }
    schema_errors = list(Draft202012Validator(load(RECEIPT_SCHEMA)).iter_errors(receipt))
    if schema_errors:
        raise ValueError(f"receipt-schema:{len(schema_errors)}")
    raw = (json.dumps(receipt, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")
    exclusive_write(target, raw)
    print(json.dumps({"status": "written_exclusive", "assignment_id": args.assignment_id, "path": str(target), "raw_sha256": sha(raw), "credit": 0}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
