#!/usr/bin/env python3
"""Future-only exclusive native-identity capture writer derived from six receipts."""
from __future__ import annotations

import argparse
import hashlib
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
A3 = HERE.parent / "semantic-repair-attempt-0003-v32"
CONTRACT = HERE / "NATIVE_CAPTURE_CONTRACT.json"
CORE = HERE / "ACTIVATION_CORE.json"
SEAL = HERE / "ACTIVATION_SEAL.json"
PASS = HERE / "validation/PRELAUNCH_PASS.json"
RECEIPT_SCHEMA = HERE / "schemas/terminal_receipt.schema.json"
IDS = ("A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016")
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


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


def lexical_absent(path: Path) -> bool:
    try:
        path.lstat()
    except FileNotFoundError:
        return True
    return False


def ensure_runtime_dir(path: Path) -> None:
    try:
        os.mkdir(path, 0o700)
    except FileExistsError:
        observed = path.lstat()
        if stat.S_ISLNK(observed.st_mode) or not stat.S_ISDIR(observed.st_mode):
            raise ValueError("unsafe-runtime-directory")
    observed = path.lstat()
    if stat.S_ISLNK(observed.st_mode) or not stat.S_ISDIR(observed.st_mode):
        raise ValueError("unsafe-runtime-directory")


def exclusive_write(path: Path, raw: bytes) -> None:
    if not lexical_absent(path):
        raise FileExistsError("capture-target-present")
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
    parser.add_argument("--controller-thread-id", required=True)
    parser.add_argument("--controller-turn-id", required=True)
    args = parser.parse_args()
    if not UUID_RE.fullmatch(args.controller_thread_id) or not UUID_RE.fullmatch(args.controller_turn_id):
        raise ValueError("invalid-controller-native-identity")

    contract = load(CONTRACT)
    prelaunch = load(PASS)
    seal_raw = stable_read(SEAL)
    if prelaunch.get("status") != "PASS_ATOMIC6_AUTHORIZED_UNLAUNCHED_CREDIT_ZERO":
        raise ValueError("prelaunch-not-pass")
    if prelaunch.get("source_seal_sha256") != sha(seal_raw):
        raise ValueError("prelaunch-seal-binding")
    target = Path(contract["target"]["path"])
    runtime = target.parent
    if target != HERE / "runtime/native_identity_capture.json":
        raise ValueError("capture-target")
    if not lexical_absent(target):
        raise FileExistsError("capture-already-present")

    receipt_schema = load(RECEIPT_SCHEMA)
    rows = []
    native_ids: set[str] = set()
    paths: set[str] = set()
    for assignment_id in IDS:
        output = A3 / f"outputs/{assignment_id}/attempt-0003"
        observed = output.lstat()
        if stat.S_ISLNK(observed.st_mode) or not stat.S_ISDIR(observed.st_mode):
            raise ValueError(f"unsafe-output:{assignment_id}")
        members = sorted(entry.name for entry in output.iterdir())
        if members != ["result.json", "terminal_receipt.json"]:
            raise ValueError(f"output-members:{assignment_id}:{members}")
        receipt_path = output / "terminal_receipt.json"
        receipt_raw = stable_read(receipt_path)
        receipt = json.loads(receipt_raw)
        errors = list(Draft202012Validator(receipt_schema).iter_errors(receipt))
        if errors or receipt.get("assignment_id") != assignment_id or receipt.get("credit") != 0:
            raise ValueError(f"receipt-invalid:{assignment_id}:{len(errors)}")
        native_id = receipt["native_child_thread_id"]
        if native_id in native_ids or not UUID_RE.fullmatch(native_id):
            raise ValueError("duplicate-or-invalid-native-id")
        native_ids.add(native_id)
        canonical_path = receipt["canonical_agent_path"]
        if canonical_path in paths:
            raise ValueError("duplicate-canonical-path")
        paths.add(canonical_path)
        rows.append({
            "assignment_id": assignment_id,
            "canonical_agent_path": canonical_path,
            "native_child_thread_id": native_id,
            "model": "gpt-5.6-sol",
            "reasoning_effort": "ultra",
            "fork_turns": "none",
            "fresh_direct": True,
            "descendants": 0,
            "followups": 0,
            "retries": 0,
            "terminal_status": "completed",
            "receipt_path": str(receipt_path),
            "receipt_sha256": sha(receipt_raw),
        })

    capture = {
        "schema_version": "audit005-scenario-c2-attempt3-native-identity-capture-v1",
        "activation_id": "SCENARIO-C2-ATTEMPT3-V32-ACTIVATION-ATOMIC6",
        "controller_identity": {
            "native_controller_thread_id": args.controller_thread_id,
            "native_controller_turn_id": args.controller_turn_id,
            "write_role": "controller_parent",
        },
        "assignment_ids": list(IDS),
        "row_count": 6,
        "rows": rows,
        "dedup": {
            "assignment_id_duplicate_count": 0,
            "canonical_agent_path_duplicate_count": 0,
            "native_child_thread_id_duplicate_count": 0,
            "receipt_path_duplicate_count": 0,
            "outcome": "pass_exact_six_unique",
        },
        "semantic_launch_observed": True,
        "results": 6,
        "receipts": 6,
        "credit": 0,
        "errors": [],
    }
    raw = (json.dumps(capture, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")
    ensure_runtime_dir(runtime)
    allowed_before = set()
    observed_before = {entry.name for entry in runtime.iterdir()}
    if observed_before != allowed_before:
        raise ValueError(f"runtime-members-before-capture:{sorted(observed_before)}")
    exclusive_write(target, raw)
    print(json.dumps({"status": "written_exclusive", "path": str(target), "row_count": 6, "raw_sha256": sha(raw), "credit": 0}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
