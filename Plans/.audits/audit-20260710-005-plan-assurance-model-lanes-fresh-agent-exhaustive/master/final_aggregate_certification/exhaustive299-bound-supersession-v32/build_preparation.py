#!/usr/bin/env python3
"""Deterministically materialize the inert exact-299 preparation artifacts."""

from __future__ import annotations

import argparse
import importlib.metadata
import json
from pathlib import Path
import sys
from typing import Any, Dict, Optional, Sequence

sys.dont_write_bytecode = True

import verify_preparation as verify


HERE = Path(__file__).resolve().parent


def write_json(path: Path, value: Any) -> None:
    path.write_bytes(verify.canonical_bytes(value))


def write_jsonl(path: Path, rows: Sequence[Dict[str, Any]]) -> None:
    path.write_bytes(b"".join(verify.canonical_bytes(row) for row in rows))


def build_core() -> Dict[str, Any]:
    terminal_names = ["TERMINAL_SEAL.json", "terminal-preparation-report.json", "test-report.json"]
    present = [name for name in terminal_names if (HERE / name).exists()]
    if present:
        raise verify.ValidationError(f"refusing to rebuild sealed core after terminal artifacts exist: {present}")

    trace = []
    _, inventory = verify.source_inventory_rows(trace)
    legacy = verify.legacy_unresolved(trace)
    blockers = verify.make_blocker_inventory(legacy)

    write_jsonl(HERE / "inventory_snapshot.jsonl", inventory)
    write_json(HERE / "blocker_inventory.json", blockers)

    runtime_lock = {
        "determinism": {
            "json_key_order": "sorted",
            "pythonhashseed": "0",
            "timestamps": "omitted",
        },
        "runtime": {
            "jsonschema": importlib.metadata.version("jsonschema"),
            "python": ".".join(str(x) for x in sys.version_info[:3]),
        },
        "schema_version": "audit005-exhaustive299-runtime-lock-v32",
        "status": "PINNED_CURRENT_PREPARATION_RUNTIME",
    }
    write_json(HERE / "runtime_lock.json", runtime_lock)

    lineage = {
        "active_scope_authority": {
            "artifact_seal_ref": verify.rel_ref(verify.EXACT_ROOT / "ARTIFACT_SEAL.json"),
            "artifact_seal_sha256": verify.EXACT_SEAL_SHA256,
            "content_state_sha256": verify.EXACT_CONTENT_STATE_SHA256,
            "generated_governance_integrity_join_count": 296,
            "inventory_ref": verify.rel_ref(verify.EXACT_ROOT / "inventory.jsonl"),
            "inventory_sha256": verify.EXACT_INVENTORY_SHA256,
            "member_count": 299,
            "namespace_byte_count": verify.EXACT_TREE_BYTE_COUNT,
            "namespace_file_count": verify.EXACT_TREE_FILE_COUNT,
            "namespace_tree_sha256": verify.EXACT_TREE_SHA256,
            "path_set_sha256": verify.EXACT_PATH_SET_SHA256,
            "semantic_document_count": 3,
            "terminal_ref": verify.rel_ref(verify.EXACT_ROOT / "terminal-preparation-report.json"),
            "terminal_sha256": verify.EXACT_TERMINAL_SHA256,
        },
        "audit_id": verify.AUDIT_ID,
        "does_not_supersede_lane_blockers": True,
        "predecessor_bytes_preserved": True,
        "schema_version": "audit005-exhaustive299-supersession-lineage-v32",
        "stale_predecessor": {
            "authority_ref": verify.rel_ref(verify.STALE_ROOT / "AUTHORITY.json"),
            "authority_sha256": verify.STALE_AUTHORITY_SHA256,
            "current_live_head_observation_ref": verify.rel_ref(
                verify.STALE_ROOT / "current_live_head_observation.json"
            ),
            "current_live_head_observation_sha256": verify.STALE_OBSERVATION_SHA256,
            "namespace_byte_count": verify.STALE_TREE_BYTE_COUNT,
            "namespace_file_count": verify.STALE_TREE_FILE_COUNT,
            "namespace_tree_sha256": verify.STALE_TREE_SHA256,
            "observed_scope_count": verify.STALE_SCOPE_COUNT,
            "scope_authority_usable": False,
            "stale_membership_carried_forward": False,
            "unresolved_inventory_ref": verify.rel_ref(verify.STALE_ROOT / "unresolved_inventory.json"),
            "unresolved_inventory_sha256": verify.STALE_UNRESOLVED_SHA256,
        },
        "status": "APPEND_ONLY_SCOPE_SUPERSESSION_BLOCKERS_PRESERVED",
        "supersedes_for_future_aggregate_scope": True,
    }
    write_json(HERE / "supersession_lineage.json", lineage)

    zero = {
        "authorizations": verify.false_authorizations(),
        "expected_namespace_files": verify.FINAL_FILES,
        "preparation_id": verify.PREPARATION_ID,
        "schema_version": "audit005-exhaustive299-zero-state-v32",
        "semantic_prose_reads": 0,
        "status": "ZERO_STATE_PREPARATION_ONLY",
        "zero_state": verify.zero_state(),
    }
    write_json(HERE / "zero_state.json", zero)

    inventory_snapshot_sha = verify.file_sha256(HERE / "inventory_snapshot.jsonl")
    blocker_inventory_sha = verify.file_sha256(HERE / "blocker_inventory.json")
    lineage_sha = verify.file_sha256(HERE / "supersession_lineage.json")
    zero_sha = verify.file_sha256(HERE / "zero_state.json")

    authority = {
        "append_only": True,
        "audit_id": verify.AUDIT_ID,
        "authorizations": verify.false_authorizations(),
        "bindings": {
            "blocker_inventory_sha256": blocker_inventory_sha,
            "exact_content_state_sha256": verify.EXACT_CONTENT_STATE_SHA256,
            "exact_inventory_artifact_seal_sha256": verify.EXACT_SEAL_SHA256,
            "exact_inventory_namespace_tree_sha256": verify.EXACT_TREE_SHA256,
            "exact_inventory_source_sha256": verify.EXACT_INVENTORY_SHA256,
            "exact_inventory_terminal_sha256": verify.EXACT_TERMINAL_SHA256,
            "inventory_snapshot_sha256": inventory_snapshot_sha,
            "stale_preparation_namespace_tree_sha256": verify.STALE_TREE_SHA256,
            "stale_unresolved_inventory_sha256": verify.STALE_UNRESOLVED_SHA256,
            "supersession_lineage_sha256": lineage_sha,
            "zero_state_sha256": zero_sha,
        },
        "blocker_count": 7,
        "credit": 0,
        "future_aggregate_scope": {
            "content_state_sha256": verify.EXACT_CONTENT_STATE_SHA256,
            "generated_governance_integrity_join_count": 296,
            "member_count": 299,
            "semantic_document_count": 3,
        },
        "preparation_id": verify.PREPARATION_ID,
        "preparation_only": True,
        "read_policy": {
            "canonical_member_paths_dereferenced": False,
            "inventory_metadata_only": True,
            "semantic_prose_reads": 0,
        },
        "ready": False,
        "schema_version": "audit005-exhaustive299-aggregate-authority-v32",
        "status": "BLOCKED_PREPARATION_ONLY_NO_CREDIT",
        "zero_state": verify.zero_state(),
    }
    write_json(HERE / "authority.json", authority)

    readiness = {
        "activation_ready": False,
        "audit_id": verify.AUDIT_ID,
        "blocker_count": 7,
        "credit": 0,
        "exact_scope": {
            "content_state_sha256": verify.EXACT_CONTENT_STATE_SHA256,
            "generated_governance_integrity_join_count": 296,
            "member_count": 299,
            "semantic_document_count": 3,
        },
        "preparation_complete": True,
        "preparation_id": verify.PREPARATION_ID,
        "schema_version": "audit005-exhaustive299-readiness-v32",
        "status": "PREPARATION_COMPLETE_BLOCKED_EXACT_SEVEN",
        "zero_state": verify.zero_state(),
    }
    write_json(HERE / "readiness.json", readiness)

    core_hashes = {}
    for name in verify.CORE_FILES:
        data = verify.strict_read_bytes(HERE / name)
        core_hashes[name] = (len(data), verify.sha256_bytes(data))
    artifact_seal = {
        "files": [
            {"byte_count": core_hashes[name][0], "path": name, "sha256": core_hashes[name][1]}
            for name in verify.CORE_FILES
        ],
        "preparation_id": verify.PREPARATION_ID,
        "schema_version": "audit005-exhaustive299-artifact-seal-v32",
        "sealed_file_count": len(verify.CORE_FILES),
        "status": "SEALED_IMMUTABLE_PREPARATION_CORE",
    }
    write_json(HERE / "ARTIFACT_SEAL.json", artifact_seal)

    return {
        "artifact_seal_sha256": verify.file_sha256(HERE / "ARTIFACT_SEAL.json"),
        "blocker_count": 7,
        "member_count": 299,
        "semantic_prose_reads": 0,
        "status": "CORE_BUILT_PREPARATION_ONLY",
    }


def build_terminal() -> Dict[str, Any]:
    verify.verify_filesystem(require_terminal=False, trace=[])
    test_report = verify.load_json(HERE / "test-report.json")
    if test_report.get("failed") != 0 or test_report.get("total", 0) < 500:
        raise verify.ValidationError("terminalization requires >=500 passing fail-closed tests")
    artifact_seal_sha = verify.file_sha256(HERE / "ARTIFACT_SEAL.json")
    terminal = {
        "artifact_seal_sha256": artifact_seal_sha,
        "audit_id": verify.AUDIT_ID,
        "authorizations": verify.false_authorizations(),
        "blocker_count": 7,
        "credit": 0,
        "exact_scope": {
            "content_state_sha256": verify.EXACT_CONTENT_STATE_SHA256,
            "generated_governance_integrity_join_count": 296,
            "member_count": 299,
            "semantic_document_count": 3,
        },
        "predecessor_immutability": {
            "exact_inventory_tree_sha256": verify.EXACT_TREE_SHA256,
            "exact_inventory_unchanged": True,
            "stale_preparation_tree_sha256": verify.STALE_TREE_SHA256,
            "stale_preparation_unchanged": True,
        },
        "preparation_complete": True,
        "preparation_id": verify.PREPARATION_ID,
        "ready_for_activation": False,
        "schema_version": "audit005-exhaustive299-terminal-preparation-v32",
        "semantic_prose_reads": 0,
        "status": "PASS_PREPARATION_ONLY_BLOCKED_ZERO_CREDIT",
        "test_report": {
            "case_id_digest": test_report["case_id_digest"],
            "failed": test_report["failed"],
            "passed": test_report["passed"],
            "sha256": verify.sha256_bytes(verify.canonical_bytes(test_report)),
            "total": test_report["total"],
            "valid_fixture_count": test_report["valid_fixture_count"],
        },
        "zero_state": verify.zero_state(),
    }
    write_json(HERE / "terminal-preparation-report.json", terminal)
    terminal_files = []
    for name in ["ARTIFACT_SEAL.json", "terminal-preparation-report.json", "test-report.json"]:
        data = verify.strict_read_bytes(HERE / name)
        terminal_files.append(
            {"byte_count": len(data), "path": name, "sha256": verify.sha256_bytes(data)}
        )
    terminal_seal = {
        "files": terminal_files,
        "preparation_id": verify.PREPARATION_ID,
        "schema_version": "audit005-exhaustive299-terminal-seal-v32",
        "sealed_file_count": 3,
        "status": "SEALED_TERMINAL_PREPARATION",
    }
    write_json(HERE / "TERMINAL_SEAL.json", terminal_seal)
    report = verify.verify_filesystem(require_terminal=True, trace=[])
    report["terminal_preparation_sha256"] = verify.file_sha256(HERE / "terminal-preparation-report.json")
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
