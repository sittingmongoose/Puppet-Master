#!/usr/bin/env python3
"""Read-only verifier for candidate-13 clean-room state and preflight."""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import stat
import sys
from typing import Any

sys.dont_write_bytecode = True

REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v13"
CONTROLLER_PATH = ROOT / "r8_clean_room_controller.py"
CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-13"


class Invalid(RuntimeError):
    pass


def canonical(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def regular(path: Path, label: str) -> bytes:
    before = os.lstat(path)
    if not stat.S_ISREG(before.st_mode) or stat.S_ISLNK(before.st_mode):
        raise Invalid(f"{label}: not a regular non-link")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(fd)
        chunks: list[bytes] = []
        while True:
            chunk = os.read(fd, 1 << 20)
            if not chunk:
                break
            chunks.append(chunk)
        after = os.fstat(fd)
    finally:
        os.close(fd)
    ident = lambda x: (x.st_dev, x.st_ino, x.st_size, x.st_mtime_ns)
    if ident(before) != ident(opened) or ident(opened) != ident(after):
        raise Invalid(f"{label}: changed during reopen")
    return b"".join(chunks)


def strict(data: bytes, label: str) -> dict[str, Any]:
    if not data.endswith(b"\n") or data.endswith(b"\n\n") or b"\r" in data:
        raise Invalid(f"{label}: framing invalid")
    try:
        value = json.loads(data[:-1])
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise Invalid(f"{label}: invalid JSON") from exc
    if not isinstance(value, dict) or canonical(value) + b"\n" != data:
        raise Invalid(f"{label}: noncanonical storage")
    return value


def controller():
    spec = importlib.util.spec_from_file_location("pw_r8_candidate_v13_controller_for_verifier", CONTROLLER_PATH)
    if spec is None or spec.loader is None:
        raise Invalid("controller module unavailable")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def validate_preflight() -> dict[str, Any]:
    module = controller()
    expected = module.preflight_report()
    storage = regular(ROOT / "deterministic_preflight_report.json", "stored preflight")
    observed = strict(storage, "stored preflight")
    if observed != expected or storage != canonical(expected) + b"\n":
        raise Invalid("stored preflight is not byte-reproducible")
    return {
        "schema_id": "pw-r8-preflight-reopen-validation-v1", "candidate_id": CANDIDATE_ID,
        "status": "PASS", "storage_sha256": sha(storage), "storage_bytes": len(storage),
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "filesystem_writes": 0,
    }


def validate_freeze(path_value: str) -> dict[str, Any]:
    path = Path(path_value).resolve()
    storage = regular(path, "freeze manifest")
    manifest = strict(storage, "freeze manifest")
    if manifest.get("candidate_id") != CANDIDATE_ID or manifest.get("status") != "FROZEN":
        raise Invalid("freeze manifest identity/status mismatch")
    files = manifest.get("files")
    expected_names = [
        "README.md", "architecture_contract.json", "controller_contract.json",
        "deterministic_preflight_report.json", "process_completion_contract.json",
        "r8_clean_room_controller.py", "r8_run_verifier.py", "independent_preseal_audit.json",
    ]
    if not isinstance(files, list) or [row.get("path") for row in files] != expected_names:
        raise Invalid("freeze manifest does not bind exact post-audit candidate closed world")
    for row in files:
        data = regular(ROOT / row["path"], f"frozen candidate {row['path']}")
        if (sha(data), len(data)) != (row.get("sha256"), row.get("bytes")):
            raise Invalid(f"freeze candidate binding drift: {row['path']}")
    return {
        "schema_id": "pw-r8-freeze-reopen-validation-v1", "candidate_id": CANDIDATE_ID,
        "status": "PASS", "manifest_sha256": sha(storage), "manifest_bytes": len(storage),
        "files_reopened": len(files), "subject_calls": 0, "provider_calls": 0,
        "network_calls": 0, "filesystem_writes": 0,
    }


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="command", required=True)
    q = sub.add_parser("validate-cell")
    q.add_argument("--run-id", required=True)
    q.add_argument("--execution-root", required=True)
    q.add_argument("--slot", required=True)
    q.add_argument("--cell", required=True)
    q.add_argument("--dispatch-nonce", required=True)
    q = sub.add_parser("validate-artifact")
    q.add_argument("--run-id", required=True)
    q.add_argument("--execution-root", required=True)
    q.add_argument("--slot", required=True)
    q.add_argument("--stage", required=True)
    q = sub.add_parser("validate-path")
    q.add_argument("--run-id", required=True)
    q.add_argument("--execution-root", required=True)
    q.add_argument("--slot", required=True)
    q = sub.add_parser("validate-matrix")
    q.add_argument("--run-id", required=True)
    q.add_argument("--execution-root", required=True)
    q = sub.add_parser("validate-two-runs")
    q.add_argument("--first-execution-root", required=True)
    q.add_argument("--second-execution-root", required=True)
    sub.add_parser("validate-preflight")
    q = sub.add_parser("validate-freeze")
    q.add_argument("--manifest", required=True)
    sub.add_parser("self-test")
    return p


def main() -> int:
    args = parser().parse_args()
    try:
        module = controller()
        if args.command == "validate-cell":
            value = module.validate_cell(args.run_id, args.execution_root, args.slot, args.cell, args.dispatch_nonce)
            value = {**value, "verifier": "independent_read_only_reopen"}
        elif args.command == "validate-artifact":
            value = module.validate_artifact(args.run_id, args.execution_root, args.slot, args.stage)
            value = {**value, "verifier": "independent_read_only_recompute"}
        elif args.command == "validate-path":
            value = module.validate_path(args.run_id, args.execution_root, args.slot)
            value = {**value, "verifier": "independent_read_only_reopen"}
        elif args.command == "validate-matrix":
            value = module.validate_matrix(args.run_id, args.execution_root)
            value = {**value, "verifier": "independent_read_only_reopen"}
        elif args.command == "validate-two-runs":
            value = module.validate_two_runs(args.first_execution_root, args.second_execution_root)
            value = {**value, "verifier": "independent_read_only_reopen"}
        elif args.command == "validate-preflight":
            value = validate_preflight()
        elif args.command == "validate-freeze":
            value = validate_freeze(args.manifest)
        else:
            value = module.self_test()
        sys.stdout.buffer.write(canonical(value) + b"\n")
        return 0
    except Exception as exc:
        value = {
            "schema_id": "pw-r8-run-verifier-error-v13", "candidate_id": CANDIDATE_ID,
            "status": "INVALID", "error_type": type(exc).__name__, "error": str(exc),
            "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
            "filesystem_writes": 0, "schedule_advance_allowed": False,
        }
        sys.stdout.buffer.write(canonical(value) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
