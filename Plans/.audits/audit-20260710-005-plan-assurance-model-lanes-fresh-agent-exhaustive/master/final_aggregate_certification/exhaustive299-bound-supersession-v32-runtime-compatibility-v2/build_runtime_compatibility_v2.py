#!/usr/bin/env python3
"""Deterministic builder for the audit-runtime compatibility supersession."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
from typing import Any, Dict, Optional, Sequence

sys.dont_write_bytecode = True

import verify_runtime_compatibility_v2 as verify


HERE = Path(__file__).resolve().parent


def write_json(path: Path, value: Any) -> None:
    path.write_bytes(verify.canonical_bytes(value))


def build_core() -> Dict[str, Any]:
    verify.enforce_runtime()
    terminal_names = ["TERMINAL_SEAL.json", "terminal-runtime-compatibility-report.json", "test-report.json"]
    present = [name for name in terminal_names if (HERE / name).exists()]
    if present:
        raise verify.ValidationError(f"refusing core rebuild after terminalization: {present}")

    v1_tree = verify.expected_v1_tree_inventory([])
    runtime_lock = verify.expected_runtime_lock()
    write_json(HERE / "v1_tree_inventory.json", v1_tree)
    write_json(HERE / "runtime_lock.json", runtime_lock)
    write_json(HERE / "zero_state.json", verify.expected_zero_state())
    write_json(HERE / "readiness.json", verify.expected_readiness())
    authority = verify.expected_authority(
        verify.file_sha256(HERE / "runtime_lock.json"),
        verify.file_sha256(HERE / "v1_tree_inventory.json"),
    )
    write_json(HERE / "authority.json", authority)

    hashes = {}
    for name in verify.CORE_FILES:
        data = verify.strict_read_bytes(HERE / name)
        hashes[name] = (len(data), verify.sha256_bytes(data))
    seal = {
        "files": [
            {"byte_count": hashes[name][0], "path": name, "sha256": hashes[name][1]}
            for name in verify.CORE_FILES
        ],
        "preparation_id": verify.PREPARATION_ID,
        "schema_version": "audit005-exhaustive299-runtime-compatibility-artifact-seal-v2",
        "sealed_file_count": len(verify.CORE_FILES),
        "status": "SEALED_AUDIT_RUNTIME_COMPATIBILITY_CORE",
    }
    write_json(HERE / "ARTIFACT_SEAL.json", seal)
    return {
        "artifact_seal_sha256": verify.file_sha256(HERE / "ARTIFACT_SEAL.json"),
        "member_count": 299,
        "runtime": {"jsonschema": "4.26.0", "python": "3.12.13"},
        "status": "CORE_BUILT_AUDIT_RUNTIME_COMPATIBILITY_ONLY",
        "v1_tree_sha256": verify.V1_TREE_SHA256,
    }


def build_terminal() -> Dict[str, Any]:
    verify.verify_filesystem(require_terminal=False, trace=[])
    test_report = verify.load_json(HERE / "test-report.json")
    verify.validate_test_report(test_report)
    terminal = verify.expected_terminal(
        verify.file_sha256(HERE / "ARTIFACT_SEAL.json"),
        test_report,
    )
    write_json(HERE / "terminal-runtime-compatibility-report.json", terminal)
    terminal_files = []
    for name in ["ARTIFACT_SEAL.json", "terminal-runtime-compatibility-report.json", "test-report.json"]:
        data = verify.strict_read_bytes(HERE / name)
        terminal_files.append(
            {"byte_count": len(data), "path": name, "sha256": verify.sha256_bytes(data)}
        )
    terminal_seal = {
        "files": terminal_files,
        "preparation_id": verify.PREPARATION_ID,
        "schema_version": "audit005-exhaustive299-runtime-compatibility-terminal-seal-v2",
        "sealed_file_count": 3,
        "status": "SEALED_AUDIT_RUNTIME_COMPATIBILITY_TERMINAL",
    }
    write_json(HERE / "TERMINAL_SEAL.json", terminal_seal)
    report = verify.verify_filesystem(require_terminal=True, trace=[])
    report["terminal_report_sha256"] = verify.file_sha256(
        HERE / "terminal-runtime-compatibility-report.json"
    )
    report["terminal_seal_sha256"] = verify.file_sha256(HERE / "TERMINAL_SEAL.json")
    return report


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--core", action="store_true")
    group.add_argument("--terminal", action="store_true")
    args = parser.parse_args(argv)
    try:
        report = build_core() if args.core else build_terminal()
    except verify.ValidationError as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL_CLOSED"}, sort_keys=True))
        return 1
    print(json.dumps(report, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
