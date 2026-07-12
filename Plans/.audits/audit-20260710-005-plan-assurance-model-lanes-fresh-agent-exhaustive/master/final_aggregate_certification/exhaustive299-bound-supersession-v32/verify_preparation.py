#!/usr/bin/env python3
"""Fail-closed verifier for the inert exact-299 aggregate preparation.

The verifier reads audit metadata only.  Inventory member paths are treated as
opaque strings and are never opened or dereferenced.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import stat
import sys
from typing import Any, Callable, Dict, Iterable, List, Optional, Sequence, Tuple

sys.dont_write_bytecode = True

try:
    import jsonschema
except Exception as exc:  # pragma: no cover - fail closed in main
    jsonschema = None
    JSONSCHEMA_IMPORT_ERROR = repr(exc)
else:
    JSONSCHEMA_IMPORT_ERROR = None


HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parents[5]
AUDIT_ROOT = HERE.parents[2]
STALE_ROOT = HERE.parent / "final-aggregate-certification-prep-0001"
EXACT_ROOT = (
    AUDIT_ROOT
    / "master/final_live_head_delta/final-live-head-delta-0002/"
      "exhaustive-live-head-inventory-v32/append-only-repair-attempt-0002"
)

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
PREPARATION_ID = "exhaustive299-bound-supersession-v32"

EXACT_SEAL_SHA256 = "d68c77a3157e77ecc398899823f239078a529355c840f2db3b9ebc35256d14ab"
EXACT_TERMINAL_SHA256 = "97c60cd2ed69032a6def576cceb59ab630cbe5b062763bfd497af46fe97dbca3"
EXACT_CONTENT_STATE_SHA256 = "cd988d47ef4c935baf4347d7199cfa293d508393363a2bf77b77336aad695a1f"
EXACT_INVENTORY_SHA256 = "1dda90bcda254840520525b2c614e1f8c9df3f2faa2b037bf4e84f075ead0a3f"
EXACT_PATH_SET_SHA256 = "6af46a1fc6c3178d030b48ef757caeca4d00840dc824da3eab8948f0329619f4"
EXACT_TREE_SHA256 = "6d3aedc5cb3fa7de932ca7c314ced8af4a04d1509cc66a2c7546cfcdaef7e504"
EXACT_TREE_FILE_COUNT = 13
EXACT_TREE_BYTE_COUNT = 229491

STALE_SCOPE_COUNT = 15
STALE_OBSERVATION_SHA256 = "d1d758a3adca96b76f2afa3d04a283a7fad2911e422a9b213aa13b6b744c88fb"
STALE_UNRESOLVED_SHA256 = "cab4b3819e485570d1bef7cb836c20768d49b972c83ea71f22f9dfc9bcef5cef"
STALE_AUTHORITY_SHA256 = "da3c3706aff1eb2d50cf4699dd0155603811069f5dcc4cd26e52c22ac310a0ec"
STALE_TREE_SHA256 = "fb8090286bda484a6af89f9df0b2abe7a891aed1fe640f48e4661872447959a9"
STALE_TREE_FILE_COUNT = 17
STALE_TREE_BYTE_COUNT = 212675

SCENARIO_ATTEMPT2_PRIMARY_REF = (
    "Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive/"
    "master/scenario_adversarial/wave-0001/cohorts/cohort-0002/"
    "semantic-repair-attempt-0002-activation-v32-exact6/validation/primary-postrun-v32.json"
)
SCENARIO_ATTEMPT2_PRIMARY_SHA256 = "b44f7748b5092b190b41340c6094b7c3670b0c3d06d9aabdfdc9df65ca1b221b"

SEMANTIC_MEMBERS = {
    "Plans/FinalGUISpec.md": "0c52e700714839fefab1f760a7aca55bbb0e19ab2792961fca22bdb4996286ed",
    "Plans/PRD_Builder.md": "27dacbbe7a1bcad074c650e89c8411bf044858dcacfeb0236b7b9492a590cbda",
    "Plans/Planning_Wizard.md": "fee6e23abff2aafb251f978165fdf014bcfe9a9beba3d805857ddf4212000ec0",
}

BLOCKER_IDS = [f"A005-AGG-B{i:03d}" for i in range(1, 8)]
CURRENT_NOTES = {
    "A005-AGG-B001": "Exact-299 metadata is sealed, but no semantic prose review, affected-join settlement, independent checkpoint, or credit exists.",
    "A005-AGG-B002": "Preparation activity does not adjudicate the five quarantined edges; the fail-closed state remains open.",
    "A005-AGG-B003": "The research-shadow retry remains preparation-only with zero accepted execution evidence or credit.",
    "A005-AGG-B004": "Attempt 0002 terminally rejected the exact same six assignments with zero credit and no fresh Luna postrun.",
    "A005-AGG-B005": "Late cohorts remain zero-state preparation and cannot advance while cohort 0002 is open.",
    "A005-AGG-B006": "The V32 policy remains prospective, execution-disabled, and unsealed for aggregate authority.",
    "A005-AGG-B007": "The final fresh independent aggregate checkpoint remains absent while prior blockers are open.",
}

PROHIBITIONS = [
    "activation",
    "agent_dispatch",
    "canonical_writes",
    "capture",
    "certification_credit",
    "closure",
    "coverage_credit",
    "launches",
    "merge_credit",
    "promotion",
    "receipts",
    "research_credit",
    "results",
    "reviewer_dispatch",
    "spec_credit",
]
ZERO_COUNTERS = [
    "activation_transactions",
    "agent_dispatches",
    "canonical_writes",
    "capture_rows",
    "certification_credit",
    "closure_credit",
    "coverage_credit",
    "launches",
    "merge_credit",
    "promotion_credit",
    "receipts",
    "research_credit",
    "results",
    "reviewer_dispatches",
    "spec_credit",
]

CORE_FILES = sorted(
    [
        "authority.json",
        "blocker_inventory.json",
        "build_preparation.py",
        "inventory_snapshot.jsonl",
        "readiness.json",
        "runtime_lock.json",
        "supersession_lineage.json",
        "test_preparation.py",
        "verify_preparation.py",
        "zero_state.json",
    ]
    + [
        "schema/authority.schema.json",
        "schema/blocker_inventory.schema.json",
        "schema/inventory_member.schema.json",
        "schema/supersession_lineage.schema.json",
        "schema/terminal_preparation.schema.json",
    ]
)
FINAL_FILES = sorted(
    CORE_FILES
    + [
        "ARTIFACT_SEAL.json",
        "TERMINAL_SEAL.json",
        "terminal-preparation-report.json",
        "test-report.json",
    ]
)


class ValidationError(RuntimeError):
    pass


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")


def canonical_compact_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def rel_ref(path: Path) -> str:
    return path.resolve().relative_to(PROJECT_ROOT.resolve()).as_posix()


def ref_path(ref: str, project_root: Path = PROJECT_ROOT) -> Path:
    lexical = Path(ref)
    if lexical.is_absolute() or not lexical.parts or any(part in {"", ".", ".."} for part in lexical.parts):
        raise ValidationError(f"unsafe project-relative reference: {ref}")
    if lexical.parts[0] != "Plans":
        raise ValidationError(f"reference is outside Plans: {ref}")
    # Keep the lexical final component intact.  Resolving here would hide a
    # malicious replacement symlink before strict_read_bytes can lstat it.
    return Path(project_root) / lexical


def verify_evidence_ref(
    evidence: Dict[str, str],
    trace: Optional[List[str]] = None,
    project_root: Path = PROJECT_ROOT,
) -> None:
    path = ref_path(evidence["ref"], project_root=project_root)
    if file_sha256(path, trace) != evidence["sha256"]:
        raise ValidationError(f"current blocker evidence drift: {evidence['ref']}")


def strict_read_bytes(
    path: Path,
    trace: Optional[List[str]] = None,
    after_open_hook: Optional[Callable[[], None]] = None,
) -> bytes:
    """Read a single-link regular file and reject symlink/TOCTOU changes."""
    path = Path(path)
    try:
        before_lstat = os.lstat(path)
    except OSError as exc:
        raise ValidationError(f"unreadable path: {path}: {exc}") from exc
    if not stat.S_ISREG(before_lstat.st_mode):
        raise ValidationError(f"non-regular or symlink path rejected: {path}")
    if before_lstat.st_nlink != 1:
        raise ValidationError(f"multi-link path rejected: {path}")
    flags = os.O_RDONLY
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    try:
        fd = os.open(path, flags)
    except OSError as exc:
        raise ValidationError(f"safe open failed: {path}: {exc}") from exc
    try:
        before_fd = os.fstat(fd)
        if not stat.S_ISREG(before_fd.st_mode) or before_fd.st_nlink != 1:
            raise ValidationError(f"opened object is not a single-link regular file: {path}")
        if (before_fd.st_dev, before_fd.st_ino) != (before_lstat.st_dev, before_lstat.st_ino):
            raise ValidationError(f"TOCTOU identity mismatch before read: {path}")
        if after_open_hook is not None:
            after_open_hook()
        chunks: List[bytes] = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
        after_fd = os.fstat(fd)
    finally:
        os.close(fd)
    try:
        after_lstat = os.lstat(path)
    except OSError as exc:
        raise ValidationError(f"path disappeared after read: {path}: {exc}") from exc
    fd_fingerprint = (
        before_fd.st_dev,
        before_fd.st_ino,
        before_fd.st_size,
        before_fd.st_mtime_ns,
        before_fd.st_nlink,
    )
    after_fd_fingerprint = (
        after_fd.st_dev,
        after_fd.st_ino,
        after_fd.st_size,
        after_fd.st_mtime_ns,
        after_fd.st_nlink,
    )
    after_path_fingerprint = (
        after_lstat.st_dev,
        after_lstat.st_ino,
        after_lstat.st_size,
        after_lstat.st_mtime_ns,
        after_lstat.st_nlink,
    )
    if fd_fingerprint != after_fd_fingerprint or fd_fingerprint != after_path_fingerprint:
        raise ValidationError(f"TOCTOU mutation detected: {path}")
    if trace is not None:
        trace.append(str(path.resolve()))
    return b"".join(chunks)


def load_json(path: Path, trace: Optional[List[str]] = None) -> Any:
    try:
        return json.loads(strict_read_bytes(path, trace).decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValidationError(f"invalid JSON: {path}: {exc}") from exc


def load_jsonl(path: Path, trace: Optional[List[str]] = None) -> List[Any]:
    raw = strict_read_bytes(path, trace)
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ValidationError(f"invalid UTF-8 JSONL: {path}") from exc
    rows = []
    for index, line in enumerate(text.splitlines(), 1):
        if not line:
            raise ValidationError(f"blank JSONL row {index}: {path}")
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError as exc:
            raise ValidationError(f"invalid JSONL row {index}: {path}: {exc}") from exc
    return rows


def file_sha256(path: Path, trace: Optional[List[str]] = None) -> str:
    return sha256_bytes(strict_read_bytes(path, trace))


def tree_inventory(root: Path, trace: Optional[List[str]] = None) -> Tuple[List[Dict[str, Any]], int, str]:
    rows: List[Dict[str, Any]] = []
    for path in sorted(root.rglob("*"), key=lambda p: p.relative_to(root).as_posix()):
        lst = os.lstat(path)
        if path.is_dir() and not stat.S_ISLNK(lst.st_mode):
            continue
        if not stat.S_ISREG(lst.st_mode) or lst.st_nlink != 1:
            raise ValidationError(f"tree contains non-regular, symlink, or multi-link entry: {path}")
        data = strict_read_bytes(path, trace)
        rows.append(
            {
                "byte_count": len(data),
                "path": path.relative_to(root).as_posix(),
                "sha256": sha256_bytes(data),
            }
        )
    byte_count = sum(row["byte_count"] for row in rows)
    return rows, byte_count, sha256_bytes(canonical_compact_bytes(rows))


def source_inventory_rows(trace: Optional[List[str]] = None) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    inventory_path = EXACT_ROOT / "inventory.jsonl"
    if file_sha256(inventory_path, trace) != EXACT_INVENTORY_SHA256:
        raise ValidationError("exact inventory JSONL hash drift")
    source_rows = load_jsonl(inventory_path, trace)
    if len(source_rows) != 299:
        raise ValidationError("exact source inventory must contain 299 rows")
    digest_payload = "".join(
        f"{row['xy']}\t{row['path']}\t{row['working_tree']['sha256']}\n"
        for row in sorted(source_rows, key=lambda row: row["path"])
    ).encode("utf-8")
    if sha256_bytes(digest_payload) != EXACT_CONTENT_STATE_SHA256:
        raise ValidationError("exact content-state digest drift")
    path_payload = "".join(f"{row['path']}\n" for row in sorted(source_rows, key=lambda row: row["path"])).encode("utf-8")
    if sha256_bytes(path_payload) != EXACT_PATH_SET_SHA256:
        raise ValidationError("exact path-set digest drift")
    simplified: List[Dict[str, Any]] = []
    class_map = {
        "semantic_canonical": "semantic_document",
        "generated_governance": "generated_governance_integrity_join",
    }
    for ordinal, row in enumerate(sorted(source_rows, key=lambda row: row["path"]), 1):
        try:
            category = class_map[row["classification"]["class"]]
        except (KeyError, TypeError) as exc:
            raise ValidationError("unknown source inventory classification") from exc
        simplified.append(
            {
                "category": category,
                "ordinal": ordinal,
                "path": row["path"],
                "sha256": row["working_tree"]["sha256"],
            }
        )
    return source_rows, simplified


def legacy_unresolved(trace: Optional[List[str]] = None) -> Dict[str, Any]:
    path = STALE_ROOT / "unresolved_inventory.json"
    if file_sha256(path, trace) != STALE_UNRESOLVED_SHA256:
        raise ValidationError("stale unresolved inventory bytes changed")
    value = load_json(path, trace)
    if value.get("blocker_count") != 7 or value.get("blocker_ids") != BLOCKER_IDS:
        raise ValidationError("legacy blocker inventory is not exact seven")
    return value


def make_blocker_inventory(legacy: Dict[str, Any]) -> Dict[str, Any]:
    blockers: List[Dict[str, Any]] = []
    for source in legacy["blockers"]:
        blocker_id = source["blocker_id"]
        current_evidence = copy.deepcopy(source["evidence"])
        current_facts = copy.deepcopy(source["facts"])
        if blocker_id == "A005-AGG-B001":
            current_facts = {
                "activation_transactions": 0,
                "content_state_sha256": EXACT_CONTENT_STATE_SHA256,
                "credit": 0,
                "generated_governance_integrity_joins": 296,
                "member_count": 299,
                "native_capture_rows": 0,
                "receipts": 0,
                "results": 0,
                "semantic_documents": 3,
                "semantic_prose_reads": 0,
            }
            current_evidence = [
                {"ref": rel_ref(EXACT_ROOT / "ARTIFACT_SEAL.json"), "sha256": EXACT_SEAL_SHA256},
                {"ref": rel_ref(EXACT_ROOT / "terminal-preparation-report.json"), "sha256": EXACT_TERMINAL_SHA256},
                {"ref": rel_ref(EXACT_ROOT / "inventory.jsonl"), "sha256": EXACT_INVENTORY_SHA256},
            ]
        elif blocker_id == "A005-AGG-B004":
            current_facts = {
                "attempt_0002_credit": 0,
                "attempt_0002_eligible": 0,
                "attempt_0002_rejected": 6,
                "attempt_0002_semantic_errors": 15831,
                "fresh_luna_postrun_present": False,
                "rejected_assignment_ids": [
                    "A005SA-0009",
                    "A005SA-0010",
                    "A005SA-0012",
                    "A005SA-0013",
                    "A005SA-0014",
                    "A005SA-0016",
                ],
            }
            current_evidence = copy.deepcopy(source["evidence"]) + [
                {"ref": SCENARIO_ATTEMPT2_PRIMARY_REF, "sha256": SCENARIO_ATTEMPT2_PRIMARY_SHA256}
            ]
        blockers.append(
            {
                "blocker_id": blocker_id,
                "current_evidence": current_evidence,
                "current_facts": current_facts,
                "current_state_note": CURRENT_NOTES[blocker_id],
                "lane_id": source["lane_id"],
                "legacy_evidence": copy.deepcopy(source["evidence"]),
                "legacy_facts": copy.deepcopy(source["facts"]),
                "legacy_object_sha256": sha256_bytes(canonical_compact_bytes(source)),
                "satisfaction_condition": source["satisfaction_condition"],
                "state": source["state"],
                "status": "OPEN_PRESERVED_NO_CREDIT",
            }
        )
    return {
        "audit_id": AUDIT_ID,
        "blocker_count": 7,
        "blocker_ids": BLOCKER_IDS,
        "blockers": blockers,
        "credit": 0,
        "schema_version": "audit005-exhaustive299-blocker-inventory-v32",
        "status": "BLOCKED_EXACT_SEVEN_PRESERVED",
    }


def false_authorizations() -> Dict[str, bool]:
    return {name: False for name in PROHIBITIONS}


def zero_state() -> Dict[str, int]:
    return {name: 0 for name in ZERO_COUNTERS}


def validate_inventory(rows: List[Dict[str, Any]], expected: List[Dict[str, Any]]) -> None:
    if rows != expected:
        raise ValidationError("inventory membership/order/path/hash/category differs from sealed exact-299 source")
    if len(rows) != 299:
        raise ValidationError("inventory count is not 299")
    if [row.get("ordinal") for row in rows] != list(range(1, 300)):
        raise ValidationError("inventory ordinals are not exact and ordered")
    if [row.get("path") for row in rows] != sorted(row.get("path") for row in rows):
        raise ValidationError("inventory path order drift")
    if len({row.get("path") for row in rows}) != 299:
        raise ValidationError("inventory contains duplicate paths")
    semantic = {row["path"]: row["sha256"] for row in rows if row.get("category") == "semantic_document"}
    generated = [row for row in rows if row.get("category") == "generated_governance_integrity_join"]
    if semantic != SEMANTIC_MEMBERS or len(generated) != 296:
        raise ValidationError("semantic/generated classification is not exact 3/296")
    for row in rows:
        if set(row) != {"category", "ordinal", "path", "sha256"}:
            raise ValidationError("inventory rows may bind path/hash/category/ordinal only")


def validate_blockers(value: Dict[str, Any], expected: Dict[str, Any]) -> None:
    if value != expected:
        raise ValidationError("blocker removal, relabel, evidence drift, or state drift")
    if value.get("blocker_count") != 7 or value.get("blocker_ids") != BLOCKER_IDS:
        raise ValidationError("exact seven blockers not preserved")
    if value.get("credit") != 0:
        raise ValidationError("blocker inventory leaks credit")


def validate_authority(value: Dict[str, Any], expected_bindings: Dict[str, str]) -> None:
    expected_keys = {
        "append_only", "audit_id", "authorizations", "bindings", "blocker_count",
        "credit", "future_aggregate_scope", "preparation_id", "preparation_only",
        "read_policy", "ready", "schema_version", "status", "zero_state",
    }
    if set(value) != expected_keys:
        raise ValidationError("authority fields drift or stale-scope leakage")
    if value.get("append_only") is not True or value.get("preparation_only") is not True:
        raise ValidationError("authority is not append-only preparation")
    if value.get("ready") is not False or value.get("credit") != 0:
        raise ValidationError("authority readiness/credit leakage")
    if value.get("authorizations") != false_authorizations():
        raise ValidationError("forbidden authority enabled or authorization surface drifted")
    if value.get("bindings") != expected_bindings:
        raise ValidationError("authority sealed binding drift")
    if value.get("zero_state") != zero_state():
        raise ValidationError("authority zero-state drift")
    scope = value.get("future_aggregate_scope")
    if scope != {
        "content_state_sha256": EXACT_CONTENT_STATE_SHA256,
        "generated_governance_integrity_join_count": 296,
        "member_count": 299,
        "semantic_document_count": 3,
    }:
        raise ValidationError("authority active scope is not exact 299/3/296")
    policy = value.get("read_policy")
    if policy != {
        "canonical_member_paths_dereferenced": False,
        "inventory_metadata_only": True,
        "semantic_prose_reads": 0,
    }:
        raise ValidationError("read policy permits prose reads")


def validate_lineage(value: Dict[str, Any]) -> None:
    expected_keys = {
        "active_scope_authority", "audit_id", "does_not_supersede_lane_blockers",
        "predecessor_bytes_preserved", "schema_version", "stale_predecessor",
        "status", "supersedes_for_future_aggregate_scope",
    }
    if set(value) != expected_keys:
        raise ValidationError("supersession lineage fields drift")
    active = value.get("active_scope_authority", {})
    expected_active = {
        "artifact_seal_ref": rel_ref(EXACT_ROOT / "ARTIFACT_SEAL.json"),
        "artifact_seal_sha256": EXACT_SEAL_SHA256,
        "content_state_sha256": EXACT_CONTENT_STATE_SHA256,
        "generated_governance_integrity_join_count": 296,
        "inventory_ref": rel_ref(EXACT_ROOT / "inventory.jsonl"),
        "inventory_sha256": EXACT_INVENTORY_SHA256,
        "member_count": 299,
        "namespace_byte_count": EXACT_TREE_BYTE_COUNT,
        "namespace_file_count": EXACT_TREE_FILE_COUNT,
        "namespace_tree_sha256": EXACT_TREE_SHA256,
        "path_set_sha256": EXACT_PATH_SET_SHA256,
        "semantic_document_count": 3,
        "terminal_ref": rel_ref(EXACT_ROOT / "terminal-preparation-report.json"),
        "terminal_sha256": EXACT_TERMINAL_SHA256,
    }
    if active != expected_active:
        raise ValidationError("supersession does not bind exact active scope")
    stale = value.get("stale_predecessor", {})
    expected_stale = {
        "authority_ref": rel_ref(STALE_ROOT / "AUTHORITY.json"),
        "authority_sha256": STALE_AUTHORITY_SHA256,
        "current_live_head_observation_ref": rel_ref(STALE_ROOT / "current_live_head_observation.json"),
        "current_live_head_observation_sha256": STALE_OBSERVATION_SHA256,
        "namespace_byte_count": STALE_TREE_BYTE_COUNT,
        "namespace_file_count": STALE_TREE_FILE_COUNT,
        "namespace_tree_sha256": STALE_TREE_SHA256,
        "observed_scope_count": STALE_SCOPE_COUNT,
        "scope_authority_usable": False,
        "stale_membership_carried_forward": False,
        "unresolved_inventory_ref": rel_ref(STALE_ROOT / "unresolved_inventory.json"),
        "unresolved_inventory_sha256": STALE_UNRESOLVED_SHA256,
    }
    if stale != expected_stale:
        raise ValidationError("stale predecessor identity, immutability, or non-authority drift")
    if value.get("does_not_supersede_lane_blockers") is not True:
        raise ValidationError("lane blockers were improperly superseded")
    if value.get("predecessor_bytes_preserved") is not True:
        raise ValidationError("predecessor immutability not preserved")


def validate_zero_state(value: Dict[str, Any]) -> None:
    expected = {
        "authorizations": false_authorizations(),
        "expected_namespace_files": FINAL_FILES,
        "preparation_id": PREPARATION_ID,
        "schema_version": "audit005-exhaustive299-zero-state-v32",
        "semantic_prose_reads": 0,
        "status": "ZERO_STATE_PREPARATION_ONLY",
        "zero_state": zero_state(),
    }
    if value != expected:
        raise ValidationError("zero-state contract drift")


def validate_readiness(value: Dict[str, Any]) -> None:
    expected_keys = {
        "activation_ready", "audit_id", "blocker_count", "credit", "exact_scope",
        "preparation_complete", "preparation_id", "schema_version", "status", "zero_state",
    }
    if set(value) != expected_keys:
        raise ValidationError("readiness fields drift")
    if value.get("activation_ready") is not False or value.get("credit") != 0:
        raise ValidationError("readiness leaks activation or credit")
    if value.get("blocker_count") != 7 or value.get("zero_state") != zero_state():
        raise ValidationError("readiness blocker/zero-state drift")
    if value.get("exact_scope") != {
        "content_state_sha256": EXACT_CONTENT_STATE_SHA256,
        "generated_governance_integrity_join_count": 296,
        "member_count": 299,
        "semantic_document_count": 3,
    }:
        raise ValidationError("readiness exact scope drift")


def validate_artifact_seal(value: Dict[str, Any], core_hashes: Dict[str, Tuple[int, str]]) -> None:
    if set(value) != {"files", "preparation_id", "schema_version", "sealed_file_count", "status"}:
        raise ValidationError("artifact seal fields drift")
    if value.get("status") != "SEALED_IMMUTABLE_PREPARATION_CORE":
        raise ValidationError("artifact seal status drift")
    expected_files = [
        {"byte_count": core_hashes[name][0], "path": name, "sha256": core_hashes[name][1]}
        for name in CORE_FILES
    ]
    if value.get("files") != expected_files or value.get("sealed_file_count") != len(CORE_FILES):
        raise ValidationError("artifact seal membership/hash drift")


def validate_terminal(value: Dict[str, Any], artifact_seal_sha: str, test_report: Dict[str, Any]) -> None:
    if value.get("artifact_seal_sha256") != artifact_seal_sha:
        raise ValidationError("terminal artifact-seal binding drift")
    if value.get("authorizations") != false_authorizations() or value.get("zero_state") != zero_state():
        raise ValidationError("terminal authority/zero-state leakage")
    if value.get("credit") != 0 or value.get("ready_for_activation") is not False:
        raise ValidationError("terminal credit/activation leakage")
    if value.get("semantic_prose_reads") != 0 or value.get("blocker_count") != 7:
        raise ValidationError("terminal prose/blocker drift")
    exact_scope = value.get("exact_scope", {})
    if exact_scope != {
        "content_state_sha256": EXACT_CONTENT_STATE_SHA256,
        "generated_governance_integrity_join_count": 296,
        "member_count": 299,
        "semantic_document_count": 3,
    }:
        raise ValidationError("terminal scope drift")
    tests = value.get("test_report", {})
    if tests.get("sha256") != sha256_bytes(canonical_bytes(test_report)):
        raise ValidationError("terminal test-report hash drift")
    if tests.get("total") != test_report.get("total") or test_report.get("failed") != 0:
        raise ValidationError("terminal test counts drift")
    if test_report.get("total", 0) < 500:
        raise ValidationError("terminal has fewer than 500 fail-closed tests")
    pred = value.get("predecessor_immutability", {})
    if pred != {
        "exact_inventory_tree_sha256": EXACT_TREE_SHA256,
        "exact_inventory_unchanged": True,
        "stale_preparation_tree_sha256": STALE_TREE_SHA256,
        "stale_preparation_unchanged": True,
    }:
        raise ValidationError("terminal predecessor immutability drift")


def validate_terminal_seal(value: Dict[str, Any], expected: List[Dict[str, Any]]) -> None:
    if value != {
        "files": expected,
        "preparation_id": PREPARATION_ID,
        "schema_version": "audit005-exhaustive299-terminal-seal-v32",
        "sealed_file_count": 3,
        "status": "SEALED_TERMINAL_PREPARATION",
    }:
        raise ValidationError("terminal seal drift")


def validate_bundle_model(
    bundle: Dict[str, Any],
    expected_inventory: List[Dict[str, Any]],
    expected_blockers: Dict[str, Any],
) -> None:
    inventory_jsonl_sha = sha256_bytes(b"".join(canonical_bytes(row) for row in expected_inventory))
    expected_bindings = {
        "blocker_inventory_sha256": sha256_bytes(canonical_bytes(expected_blockers)),
        "exact_content_state_sha256": EXACT_CONTENT_STATE_SHA256,
        "exact_inventory_artifact_seal_sha256": EXACT_SEAL_SHA256,
        "exact_inventory_namespace_tree_sha256": EXACT_TREE_SHA256,
        "exact_inventory_source_sha256": EXACT_INVENTORY_SHA256,
        "exact_inventory_terminal_sha256": EXACT_TERMINAL_SHA256,
        "inventory_snapshot_sha256": inventory_jsonl_sha,
        "stale_preparation_namespace_tree_sha256": STALE_TREE_SHA256,
        "stale_unresolved_inventory_sha256": STALE_UNRESOLVED_SHA256,
        "supersession_lineage_sha256": sha256_bytes(canonical_bytes(bundle["lineage"])),
        "zero_state_sha256": sha256_bytes(canonical_bytes(bundle["zero_state"])),
    }
    validate_inventory(bundle["inventory"], expected_inventory)
    validate_blockers(bundle["blockers"], expected_blockers)
    validate_lineage(bundle["lineage"])
    validate_zero_state(bundle["zero_state"])
    validate_authority(bundle["authority"], expected_bindings)
    validate_readiness(bundle["readiness"])
    validate_artifact_seal(bundle["artifact_seal"], bundle["core_hashes"])


def _validate_schema(instance: Any, schema: Any, label: str) -> None:
    if jsonschema is None:
        raise ValidationError(f"jsonschema unavailable: {JSONSCHEMA_IMPORT_ERROR}")
    try:
        jsonschema.Draft202012Validator.check_schema(schema)
        jsonschema.Draft202012Validator(schema).validate(instance)
    except Exception as exc:
        raise ValidationError(f"schema validation failed for {label}: {exc}") from exc


def _runtime_check(runtime: Dict[str, Any]) -> None:
    current = {
        "jsonschema": importlib.metadata.version("jsonschema"),
        "python": ".".join(str(x) for x in sys.version_info[:3]),
    }
    if runtime != {
        "determinism": {"json_key_order": "sorted", "pythonhashseed": "0", "timestamps": "omitted"},
        "runtime": current,
        "schema_version": "audit005-exhaustive299-runtime-lock-v32",
        "status": "PINNED_CURRENT_PREPARATION_RUNTIME",
    }:
        raise ValidationError(f"runtime lock drift: current={current!r}")


def _namespace_check(root: Path) -> None:
    observed: List[str] = []
    for path in sorted(root.rglob("*")):
        lst = os.lstat(path)
        if path.is_dir() and not stat.S_ISLNK(lst.st_mode):
            continue
        if not stat.S_ISREG(lst.st_mode) or lst.st_nlink != 1:
            raise ValidationError(f"namespace contains unsafe entry: {path}")
        observed.append(path.relative_to(root).as_posix())
    if observed != FINAL_FILES:
        raise ValidationError(f"namespace membership drift: observed={observed!r}")


def verify_filesystem(
    root: Path = HERE,
    require_terminal: bool = True,
    trace: Optional[List[str]] = None,
) -> Dict[str, Any]:
    root = Path(root).resolve()
    if root != HERE:
        raise ValidationError("verifier root is pinned to the preparation namespace")

    if file_sha256(EXACT_ROOT / "ARTIFACT_SEAL.json", trace) != EXACT_SEAL_SHA256:
        raise ValidationError("exact inventory seal drift")
    if file_sha256(EXACT_ROOT / "terminal-preparation-report.json", trace) != EXACT_TERMINAL_SHA256:
        raise ValidationError("exact inventory terminal drift")
    exact_rows, exact_bytes, exact_tree = tree_inventory(EXACT_ROOT, trace)
    if (len(exact_rows), exact_bytes, exact_tree) != (
        EXACT_TREE_FILE_COUNT,
        EXACT_TREE_BYTE_COUNT,
        EXACT_TREE_SHA256,
    ):
        raise ValidationError("exact inventory namespace tree changed")
    stale_rows, stale_bytes, stale_tree = tree_inventory(STALE_ROOT, trace)
    if (len(stale_rows), stale_bytes, stale_tree) != (
        STALE_TREE_FILE_COUNT,
        STALE_TREE_BYTE_COUNT,
        STALE_TREE_SHA256,
    ):
        raise ValidationError("stale preparation tree changed")
    if file_sha256(STALE_ROOT / "current_live_head_observation.json", trace) != STALE_OBSERVATION_SHA256:
        raise ValidationError("stale observation bytes changed")
    if file_sha256(STALE_ROOT / "AUTHORITY.json", trace) != STALE_AUTHORITY_SHA256:
        raise ValidationError("stale authority bytes changed")

    _, expected_inventory = source_inventory_rows(trace)
    legacy = legacy_unresolved(trace)
    expected_blockers = make_blocker_inventory(legacy)

    runtime = load_json(root / "runtime_lock.json", trace)
    _runtime_check(runtime)
    inventory = load_jsonl(root / "inventory_snapshot.jsonl", trace)
    blockers = load_json(root / "blocker_inventory.json", trace)
    authority = load_json(root / "authority.json", trace)
    lineage = load_json(root / "supersession_lineage.json", trace)
    zero = load_json(root / "zero_state.json", trace)
    readiness = load_json(root / "readiness.json", trace)
    artifact_seal = load_json(root / "ARTIFACT_SEAL.json", trace)

    schemas = {
        name: load_json(root / f"schema/{name}.schema.json", trace)
        for name in [
            "authority",
            "blocker_inventory",
            "inventory_member",
            "supersession_lineage",
            "terminal_preparation",
        ]
    }
    for index, row in enumerate(inventory, 1):
        _validate_schema(row, schemas["inventory_member"], f"inventory[{index}]")
    _validate_schema(blockers, schemas["blocker_inventory"], "blocker_inventory")
    _validate_schema(authority, schemas["authority"], "authority")
    _validate_schema(lineage, schemas["supersession_lineage"], "supersession_lineage")

    core_hashes: Dict[str, Tuple[int, str]] = {}
    for name in CORE_FILES:
        data = strict_read_bytes(root / name, trace)
        core_hashes[name] = (len(data), sha256_bytes(data))
    bundle = {
        "artifact_seal": artifact_seal,
        "authority": authority,
        "blockers": blockers,
        "core_hashes": core_hashes,
        "inventory": inventory,
        "lineage": lineage,
        "readiness": readiness,
        "zero_state": zero,
    }
    validate_bundle_model(bundle, expected_inventory, expected_blockers)

    for blocker in blockers["blockers"]:
        for evidence in blocker["current_evidence"]:
            verify_evidence_ref(evidence, trace=trace)

    if require_terminal:
        test_report = load_json(root / "test-report.json", trace)
        terminal = load_json(root / "terminal-preparation-report.json", trace)
        terminal_seal = load_json(root / "TERMINAL_SEAL.json", trace)
        _validate_schema(terminal, schemas["terminal_preparation"], "terminal_preparation")
        artifact_seal_sha = file_sha256(root / "ARTIFACT_SEAL.json", trace)
        validate_terminal(terminal, artifact_seal_sha, test_report)
        terminal_expected = []
        for name in ["ARTIFACT_SEAL.json", "terminal-preparation-report.json", "test-report.json"]:
            data = strict_read_bytes(root / name, trace)
            terminal_expected.append({"byte_count": len(data), "path": name, "sha256": sha256_bytes(data)})
        validate_terminal_seal(terminal_seal, terminal_expected)
        _namespace_check(root)

    traced = trace or []
    inventory_member_paths = {str((PROJECT_ROOT / row["path"]).resolve()) for row in expected_inventory}
    dereferenced = sorted(set(traced) & inventory_member_paths)
    prose_reads = sorted(path for path in traced if path.endswith(".md") and "/Plans/" in path)
    if dereferenced or prose_reads:
        raise ValidationError(f"canonical inventory member/prose read detected: {dereferenced + prose_reads}")

    return {
        "blocker_count": 7,
        "credit": 0,
        "exact_inventory_tree_sha256": exact_tree,
        "generated_governance_integrity_join_count": 296,
        "member_count": 299,
        "preparation_id": PREPARATION_ID,
        "semantic_document_count": 3,
        "semantic_prose_reads": 0,
        "stale_preparation_tree_sha256": stale_tree,
        "status": "PASS_PREPARATION_ONLY_BLOCKED_ZERO_CREDIT",
        "zero_state": zero_state(),
    }


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--core-only", action="store_true")
    args = parser.parse_args(argv)
    trace: List[str] = []
    try:
        report = verify_filesystem(require_terminal=not args.core_only, trace=trace)
    except ValidationError as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL_CLOSED"}, sort_keys=True))
        return 1
    print(json.dumps(report, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
