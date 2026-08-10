#!/usr/bin/env python3
"""Deterministic compact source and protected-state receipts for Stage A v1.1.

The module deliberately stores commitments and bounded bucket summaries, never
the 114k-row source manifest or raw/base64 Git outputs.  Production validation
must replay the collectors against the live roots; producer assertions are not
evidence of themselves.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import stat
import struct
import subprocess
import unicodedata
from collections import defaultdict
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


PACKET_ID = "stage-a-plan-assurance-rolling-trial-packet-v1_1"
IDENTITY_DOMAIN = b"pm.plan_assurance.identity.v1.1"
SOURCE_DOMAIN = b"pm.plan_assurance.source_snapshot.merkle.v1.1"
SOURCE_ALGORITHM_ID = "pm.plan_assurance.source_snapshot.merkle.v1.1"
PROTECTED_ALGORITHM_ID = "pm.plan_assurance.protected_state.compact.v1.1"
STATUS_ALGORITHM_ID = "pm.git-status-normalized.v1.1"
BUCKET_COUNT = 256
BUCKETS_PER_SHARD = 16
SHARD_COUNT = 16

PACKET_TERMINAL_FILES = {
    "PACKET_VALIDATION.json", "V1_1_REPAIR_DECISION.json", "CONTROLLER_DECISION.json",
    "FINAL_REPORT.md", "ROOT_TERMINAL_HANDOFF.json",
}
PACKET_CORE_FILES = {
    "ARTIFACT_BUDGET_MANIFEST.schema.json", "CANARY_REGISTRY.schema.json", "CAPABILITY_SLICE_MANIFEST.schema.json", "CHANGED_FROM_V1.json", "EXPECTATION_PACKET.schema.json", "EXTERNAL_TRANSMISSION_MANIFEST.schema.json",
    "LAUNCH_AUTHORITY.schema.json", "LAUNCH_AUTHORITY_USED.schema.json", "LAUNCH_REQUEST.schema.json",
    "PREDISPATCH_FRESHNESS_RECEIPT.schema.json", "PROTECTED_STATE.schema.json", "README.md", "ROLLING_TRIAL_CONTRACT.json", "SEMANTIC_ARTIFACT_ENVELOPE.schema.json",
    "SEMANTIC_EXECUTION_ENVELOPE.schema.json", "SOURCE_SNAPSHOT.schema.json", "SOURCE_SNAPSHOT_BUCKET_SHARD.schema.json",
    "STRUCTURAL_COVERAGE_MAP.schema.json", "TRIAL_SUMMARY.schema.json", "TRUSTED_LAUNCH_CAPABILITY.schema.json",
    "fixtures/budget-root/ARTIFACT_BUDGET_MANIFEST.json", "fixtures/budget-root/ARTIFACTS/a.json",
    "compact_receipts.py", "validate_packet.py", "validate_trial_artifacts.py",
}
PACKET_CORE_DIRECTORIES = {"fixtures", "fixtures/budget-root", "fixtures/budget-root/ARTIFACTS"}

PATH_CLASSES = [
    "canonical",
    "generated",
    "governance_support",
    "source_lineage",
    "audit",
    "retired",
    "unknown",
]

ARTIFACT_ROLES = [
    "active_normative_prose",
    "active_machine_contract",
    "acceptance_or_fixture_evidence",
    "navigation_or_decision_index",
    "external_reference_or_provenance",
    "retired_or_source_lineage",
    "generated_governance_or_projection",
    "ledger_audit_pipeline_or_concept_source",
    "unknown",
]

CLASSIFICATION_POLICY = {
    "policy_id": "pm.plan_assurance.path_classification.v1.1",
    "ordered_rules": [
        {"id": "audit", "kind": "prefix", "value": "Plans/.audits", "path_class": "audit"},
        {"id": "generated_shards", "kind": "prefix", "value": "Plans/_shards", "path_class": "generated"},
        {"id": "generated_evidence", "kind": "prefix", "value": "Plans/.evidence", "path_class": "generated"},
        {"id": "migration_lineage", "kind": "prefix", "value": "Plans/.plan_migration", "path_class": "source_lineage"},
        {"id": "ledger_lineage", "kind": "prefix", "value": "Plans/ledgers", "path_class": "source_lineage"},
        {"id": "readiness_governance", "kind": "prefix", "value": "Plans/.implementation_readiness", "path_class": "governance_support"},
        {"id": "index_governance", "kind": "prefix", "value": "Plans/.plan_index", "path_class": "governance_support"},
        {"id": "spec_lock", "kind": "exact", "value": "Plans/Spec_Lock.json", "path_class": "governance_support"},
        {"id": "auto_decisions", "kind": "exact", "value": "Plans/auto_decisions.jsonl", "path_class": "governance_support"},
        {"id": "generated_plan_graph", "kind": "exact", "value": "Plans/plan_graph.json", "path_class": "generated"},
        {"id": "retired_chain_wizard", "kind": "exact", "value": "Plans/chain-wizard.md", "path_class": "retired"},
        {"id": "retired_chain_flex", "kind": "exact", "value": "Plans/chain-wizard-flexibility.md", "path_class": "retired"},
        {"id": "known_os_metadata", "kind": "exact", "value": "Plans/.DS_Store", "path_class": "source_lineage"},
        {"id": "unknown_dot_path", "kind": "dot_component", "path_class": "unknown"},
        {"id": "canonical_default", "kind": "default", "path_class": "canonical"},
    ],
    "role_rules": "regular-file role derives from path class, basename and extension; non-files have null role",
    "unknown_policy": "unknown remains visible and blocks G1 before semantic work",
}

GIT_COMMAND_CONTRACT = {
    "environment": {
        "PATH": "/usr/bin:/bin:/usr/sbin:/sbin",
        "LC_ALL": "C",
        "LANG": "C",
        "GIT_OPTIONAL_LOCKS": "0",
        "GIT_PAGER": "cat",
        "GIT_CONFIG_NOSYSTEM": "1",
        "GIT_CONFIG_GLOBAL": "/dev/null",
    },
    "commands": {
        "object_format": ["/usr/bin/git", "rev-parse", "--show-object-format"],
        "head_commit": ["/usr/bin/git", "rev-parse", "--verify", "HEAD^{commit}"],
        "head_tree": ["/usr/bin/git", "rev-parse", "--verify", "HEAD^{tree}"],
        "symbolic_ref": ["/usr/bin/git", "symbolic-ref", "-q", "HEAD"],
        "index_entries": ["/usr/bin/git", "ls-files", "--stage", "-z"],
        "status": ["/usr/bin/git", "status", "--porcelain=v2", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"],
        "staged_diff": ["/usr/bin/git", "diff", "--cached", "--binary", "--full-index", "--no-ext-diff", "--no-textconv", "--no-renames", "--"],
        "tracked_diff": ["/usr/bin/git", "diff", "--binary", "--full-index", "--no-ext-diff", "--no-textconv", "--no-renames", "--"],
        "index_path": ["/usr/bin/git", "rev-parse", "--git-path", "index"],
    },
}


class ReceiptError(RuntimeError):
    pass


def _canonicalize(value: Any) -> Any:
    if isinstance(value, str):
        return unicodedata.normalize("NFC", value)
    if isinstance(value, list):
        return [_canonicalize(item) for item in value]
    if isinstance(value, tuple):
        return [_canonicalize(item) for item in value]
    if isinstance(value, dict):
        normalized: dict[str, Any] = {}
        for raw_key, raw_value in value.items():
            key = unicodedata.normalize("NFC", str(raw_key))
            if key in normalized:
                raise ReceiptError("DUPLICATE_KEY_AFTER_NFC")
            normalized[key] = _canonicalize(raw_value)
        return {key: normalized[key] for key in sorted(normalized, key=lambda item: item.encode("utf-8"))}
    if isinstance(value, float):
        raise ReceiptError("FLOAT_FORBIDDEN_IN_IDENTITY")
    return value


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(_canonicalize(value), ensure_ascii=False, sort_keys=True,
                      separators=(",", ":"), allow_nan=False).encode("utf-8")


def strict_json_loads(text: str) -> Any:
    def closed_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for raw_key, value in pairs:
            key = unicodedata.normalize("NFC", raw_key)
            if key in result: raise ReceiptError("DUPLICATE_JSON_KEY_AFTER_NFC")
            result[key] = value
        return result
    return json.loads(text, object_pairs_hook=closed_pairs, parse_constant=lambda value: (_ for _ in ()).throw(ReceiptError(f"NONFINITE_JSON:{value}")))


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def identity_hash(kind: str, value: Any) -> str:
    return sha256_bytes(IDENTITY_DOMAIN + b"\0" + kind.encode("utf-8") + b"\0" + canonical_bytes(value))


def source_hash(kind: str, value: Any) -> str:
    return sha256_bytes(SOURCE_DOMAIN + b"\0" + kind.encode("utf-8") + b"\0" + canonical_bytes(value))


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _prefix(path: str, prefix: str) -> bool:
    return path == prefix or path.startswith(prefix + "/")


def classify_path(path: str, entry_kind: str) -> tuple[str, str | None, bool, str | None, str]:
    selected = CLASSIFICATION_POLICY["ordered_rules"][-1]
    for rule in CLASSIFICATION_POLICY["ordered_rules"]:
        kind = rule["kind"]
        if kind == "prefix" and _prefix(path, rule["value"]):
            selected = rule; break
        if kind == "exact" and path == rule["value"]:
            selected = rule; break
        if kind == "dot_component" and any(part.startswith(".") for part in path.split("/")[1:]):
            selected = rule; break
        if kind == "default":
            selected = rule; break
    path_class = selected["path_class"]
    if entry_kind != "regular_file":
        return path_class, None, False, None, selected["id"]
    basename = path.rsplit("/", 1)[-1]
    lower = basename.lower()
    if path_class == "canonical":
        if basename in {"00-plans-index.md", "Decision_Log.md", "Decision_Policy.md", "Crosswalk.md", "DRY_Rules.md"}:
            role = "navigation_or_decision_index"
        elif "fixture" in lower or "/fixtures/" in path.lower():
            role = "acceptance_or_fixture_evidence"
        elif lower.endswith((".json", ".jsonl", ".schema", ".yaml", ".yml", ".toml")):
            role = "active_machine_contract"
        else:
            role = "active_normative_prose"
    elif path_class in {"generated", "governance_support"}:
        role = "generated_governance_or_projection"
    elif path_class in {"source_lineage", "retired"}:
        role = "retired_or_source_lineage"
    elif path_class == "audit":
        role = "ledger_audit_pipeline_or_concept_source"
    else:
        role = "unknown"
    if lower.endswith(".md"):
        parser = "markdown"
    elif lower.endswith(".json"):
        parser = "json"
    elif lower.endswith(".jsonl"):
        parser = "jsonl"
    else:
        parser = "text"
    return path_class, role, path_class == "canonical", parser, selected["id"]


def _entry_kind(st_mode: int) -> str:
    if stat.S_ISREG(st_mode): return "regular_file"
    if stat.S_ISDIR(st_mode): return "directory"
    if stat.S_ISLNK(st_mode): return "symlink"
    return "nonregular"


def _normalize_relative(path: Path, base: Path) -> str:
    raw = os.fsencode(path.relative_to(base).as_posix())
    try:
        decoded = raw.decode("utf-8", "strict")
    except UnicodeDecodeError as exc:
        raise ReceiptError("PATH_NOT_UTF8") from exc
    normalized = unicodedata.normalize("NFC", decoded)
    if normalized.startswith("/") or "\\" in normalized or any(part in {"", ".", ".."} for part in normalized.split("/")):
        raise ReceiptError("INVALID_RELATIVE_PATH")
    return normalized


def inventory_rows(plans_root: Path, excluded_roots: Iterable[Path] = ()) -> list[dict[str, Any]]:
    plans_root = plans_root.resolve()
    base = plans_root.parent.resolve()
    exclusions = [path.resolve() for path in excluded_roots]
    for excluded in exclusions:
        if excluded == plans_root or plans_root not in excluded.parents:
            raise ReceiptError("EXCLUDED_ROOT_OUTSIDE_PLANS")
    all_paths = [plans_root]
    for path in plans_root.rglob("*"):
        resolved_parent = path.parent.resolve()
        if any(path == item or item in path.parents for item in exclusions):
            continue
        if resolved_parent != path.parent and path.parent != plans_root:
            raise ReceiptError("SYMLINKED_PARENT")
        all_paths.append(path)
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for path in all_paths:
        rel = _normalize_relative(path, base)
        if rel in seen:
            raise ReceiptError("NFC_PATH_COLLISION")
        seen.add(rel)
        st = path.lstat()
        kind = _entry_kind(st.st_mode)
        size: int | None = None
        digest: str | None = None
        symlink_bytes: int | None = None
        symlink_sha: str | None = None
        nonregular_type: int | None = None
        nonregular_rdev: int | None = None
        if kind == "regular_file":
            data = path.read_bytes()
            post = path.lstat()
            if (st.st_mode, st.st_size, st.st_ino, st.st_mtime_ns) != (post.st_mode, post.st_size, post.st_ino, post.st_mtime_ns):
                raise ReceiptError("FILE_CHANGED_DURING_HASH")
            size = len(data); digest = sha256_bytes(data)
        elif kind == "symlink":
            target = os.fsencode(os.readlink(path))
            symlink_bytes = len(target); symlink_sha = sha256_bytes(target)
        elif kind == "nonregular":
            nonregular_type = stat.S_IFMT(st.st_mode); nonregular_rdev = int(st.st_rdev)
        path_class, role, semantic, parser, rule_id = classify_path(rel, kind)
        physical = {
            "path": rel, "entry_kind": kind, "mode": stat.S_IMODE(st.st_mode),
            "bytes": size, "sha256": digest, "link_count": int(st.st_nlink),
            "symlink_target_bytes": symlink_bytes, "symlink_target_sha256": symlink_sha,
            "nonregular_type": nonregular_type, "nonregular_rdev": nonregular_rdev,
        }
        physical_leaf = source_hash("physical-leaf", physical)
        classification = {
            "physical_leaf_sha256": physical_leaf, "path_class": path_class,
            "artifact_role": role, "semantic_authority": semantic, "parser": parser,
            "classification_rule_id": rule_id,
        }
        rows.append({**physical, **classification, "classification_leaf_sha256": source_hash("classification-leaf", classification)})
    rows.sort(key=lambda row: row["path"].encode("utf-8"))
    return rows


def _merkle_root(kind: str, bucket: int, leaves: list[str]) -> str:
    if not leaves:
        return source_hash("merkle-empty", [kind, f"{bucket:02x}"])
    nodes = list(leaves)
    level = 0
    while len(nodes) > 1:
        nxt: list[str] = []
        for index in range(0, len(nodes), 2):
            if index + 1 < len(nodes):
                nxt.append(source_hash("merkle-node", [kind, f"{bucket:02x}", level, nodes[index], nodes[index + 1]]))
            else:
                nxt.append(source_hash("merkle-promote", [kind, f"{bucket:02x}", level, nodes[index]]))
        nodes = nxt; level += 1
    return nodes[0]


def _ordered_counts(keys: list[str], counts: dict[str, int]) -> list[list[Any]]:
    return [[key, int(counts.get(key, 0))] for key in keys]


def build_bucket_summaries(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        bucket = int(source_hash("path-bucket", row["path"])[:2], 16)
        buckets[bucket].append(row)
    summaries: list[dict[str, Any]] = []
    for bucket in range(BUCKET_COUNT):
        members = sorted(buckets.get(bucket, []), key=lambda row: row["path"].encode("utf-8"))
        class_counts: dict[str, int] = defaultdict(int)
        role_counts: dict[str, int] = defaultdict(int)
        kinds: dict[str, int] = defaultdict(int)
        regular_bytes = 0
        for row in members:
            class_counts[row["path_class"]] += 1
            if row["artifact_role"] is not None: role_counts[row["artifact_role"]] += 1
            kinds[row["entry_kind"]] += 1
            regular_bytes += row["bytes"] or 0
        physical_root = _merkle_root("physical", bucket, [row["physical_leaf_sha256"] for row in members])
        classification_root = _merkle_root("classification", bucket, [row["classification_leaf_sha256"] for row in members])
        common = {
            "bucket": f"{bucket:02x}", "entry_count": len(members),
            "regular_file_count": kinds["regular_file"], "directory_entry_count": kinds["directory"],
            "symlink_count": kinds["symlink"], "nonregular_count": kinds["nonregular"],
            "regular_file_bytes": regular_bytes, "path_class_counts": _ordered_counts(PATH_CLASSES, class_counts),
            "artifact_role_counts": _ordered_counts(ARTIFACT_ROLES, role_counts),
        }
        summaries.append({
            **common,
            "physical_merkle_root_sha256": physical_root,
            "classification_merkle_root_sha256": classification_root,
            "physical_bucket_commitment_sha256": source_hash("physical-bucket", [common, physical_root]),
            "classification_bucket_commitment_sha256": source_hash("classification-bucket", [common, classification_root]),
        })
    return summaries


def _population_counts(rows: list[dict[str, Any]]) -> dict[str, Any]:
    kinds: dict[str, int] = defaultdict(int)
    classes: dict[str, int] = defaultdict(int)
    roles: dict[str, int] = defaultdict(int)
    total_bytes = 0
    for row in rows:
        kinds[row["entry_kind"]] += 1; classes[row["path_class"]] += 1
        if row["artifact_role"] is not None: roles[row["artifact_role"]] += 1
        total_bytes += row["bytes"] or 0
    return {
        "entry_count": len(rows), "regular_file_count": kinds["regular_file"],
        "directory_entry_count": kinds["directory"], "symlink_count": kinds["symlink"],
        "nonregular_count": kinds["nonregular"], "regular_file_bytes": total_bytes,
        "path_class_counts": _ordered_counts(PATH_CLASSES, classes),
        "artifact_role_counts": _ordered_counts(ARTIFACT_ROLES, roles),
        "unknown_classification_count": classes["unknown"],
    }


def build_source_bundle(
    plans_root: Path,
    excluded_run_root: Path,
    trial_id: str,
    generation_id: str,
    packet_core_population_sha256: str,
    created_at_utc: str | None = None,
    scan_a_rows: list[dict[str, Any]] | None = None,
    scan_b_rows: list[dict[str, Any]] | None = None,
    allow_existing_excluded_run_root: bool = False,
) -> dict[str, Any]:
    if excluded_run_root.exists() and not allow_existing_excluded_run_root:
        raise ReceiptError("EXCLUDED_RUN_ROOT_EXISTS_AT_FREEZE")
    rows_a = scan_a_rows if scan_a_rows is not None else inventory_rows(plans_root, [excluded_run_root])
    rows_b = scan_b_rows if scan_b_rows is not None else inventory_rows(plans_root, [excluded_run_root])
    buckets_a = build_bucket_summaries(rows_a); buckets_b = build_bucket_summaries(rows_b)
    physical_a = source_hash("physical-population", [row["physical_bucket_commitment_sha256"] for row in buckets_a])
    class_a = source_hash("classification-population", [row["classification_bucket_commitment_sha256"] for row in buckets_a])
    physical_b = source_hash("physical-population", [row["physical_bucket_commitment_sha256"] for row in buckets_b])
    class_b = source_hash("classification-population", [row["classification_bucket_commitment_sha256"] for row in buckets_b])
    if physical_a != physical_b or class_a != class_b or _population_counts(rows_a) != _population_counts(rows_b):
        raise ReceiptError("UNSTABLE_DOUBLE_SCAN")
    policy_sha = identity_hash("classification-policy", CLASSIFICATION_POLICY)
    index_path = plans_root / "00-plans-index.md"
    classifier_binding = {
        "classifier_id": CLASSIFICATION_POLICY["policy_id"],
        "rule_bundle_sha256": policy_sha,
        "plans_index_sha256": sha256_bytes(index_path.read_bytes()),
        "path_class_enum": PATH_CLASSES,
        "artifact_role_enum": ARTIFACT_ROLES,
    }
    classifier_binding["classifier_binding_sha256"] = identity_hash("classifier-binding", classifier_binding)
    snapshot_id = identity_hash("source-snapshot-id", [trial_id, generation_id, physical_a, class_a, packet_core_population_sha256])
    shards: list[dict[str, Any]] = []
    shard_bindings: list[dict[str, Any]] = []
    for shard_index in range(SHARD_COUNT):
        first = shard_index * BUCKETS_PER_SHARD; last = first + BUCKETS_PER_SHARD - 1
        shard = {
            "schema_version": "1.1.0", "packet_id": PACKET_ID, "snapshot_id": snapshot_id,
            "shard_index": shard_index, "first_bucket": f"{first:02x}", "last_bucket": f"{last:02x}",
            "buckets": buckets_a[first:last + 1],
        }
        shard["payload_sha256"] = identity_hash("source-bucket-shard", shard)
        raw = canonical_bytes(shard)
        ref = f"SOURCE_SNAPSHOT_BUCKETS/{first:02x}-{last:02x}.json"
        shards.append(shard)
        shard_bindings.append({
            "shard_index": shard_index, "ref": ref, "first_bucket": f"{first:02x}", "last_bucket": f"{last:02x}",
            "bucket_count": BUCKETS_PER_SHARD, "bytes": len(raw), "file_sha256": sha256_bytes(raw),
            "payload_sha256": shard["payload_sha256"],
        })
    counts = _population_counts(rows_a)
    population = source_hash("source-snapshot", {
        "algorithm_id": SOURCE_ALGORITHM_ID, "plans_root": str(plans_root.resolve()),
        "excluded_future_run_root": str(excluded_run_root.resolve()), "counts": counts,
        "physical_population_sha256": physical_a, "classification_population_sha256": class_a,
        "classifier_binding_sha256": classifier_binding["classifier_binding_sha256"],
        "ordered_shard_payload_sha256s": [row["payload_sha256"] for row in shard_bindings],
    })
    root = {
        "schema_version": "1.1.0", "packet_id": PACKET_ID,
        "receipt_id": f"source.{trial_id}.{generation_id}", "snapshot_id": snapshot_id,
        "trial_id": trial_id, "generation_id": generation_id,
        "packet_core_population_sha256": packet_core_population_sha256,
        "plans_root": str(plans_root.resolve()), "excluded_future_run_root": str(excluded_run_root.resolve()),
        "excluded_future_run_root_absent_at_freeze": True,
        "created_at_utc": created_at_utc or utc_now(),
        "algorithm": {"algorithm_id": SOURCE_ALGORITHM_ID, "hash": "sha256", "bucket_count": BUCKET_COUNT,
                      "receipt_shard_count": SHARD_COUNT, "canonical_json": "pm.plan_assurance.identity.v1.1",
                      "path_normalization": "UTF-8 NFC repository-relative forward-slash path; no dot segments",
                      "filesystem_scan": "lstat root and every descendant; never follow symlinks",
                      "merkle_odd_rule": "domain-separated promotion", "stable_double_scan_required": True},
        "classifier_binding": classifier_binding, "counts": counts,
        "physical_population_sha256": physical_a, "classification_population_sha256": class_a,
        "population_sha256": population,
        "stable_double_scan": {"scan_a_physical_sha256": physical_a, "scan_a_classification_sha256": class_a,
                               "scan_b_physical_sha256": physical_b, "scan_b_classification_sha256": class_b,
                               "identical": True},
        "bucket_shards": shard_bindings,
        "terminal": "PASS" if counts["symlink_count"] == 0 and counts["nonregular_count"] == 0 and counts["unknown_classification_count"] == 0 else "BLOCKED",
    }
    root["snapshot_payload_sha256"] = identity_hash("source-snapshot-receipt", root)
    return {"root": root, "shards": shards, "rows": rows_a,
            "canonical_bytes": len(canonical_bytes(root)) + sum(len(canonical_bytes(row)) for row in shards),
            "largest_artifact_bytes": max([len(canonical_bytes(root))] + [len(canonical_bytes(row)) for row in shards])}


def _git(repo_root: Path, argv: list[str], allowed: set[int] = {0}) -> tuple[int, bytes]:
    result = subprocess.run(argv, cwd=repo_root, env=GIT_COMMAND_CONTRACT["environment"],
                            stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode not in allowed:
        raise ReceiptError(f"GIT_COMMAND_FAILED:{argv[1]}:{result.returncode}")
    return result.returncode, result.stdout


def digest_descriptor(raw: bytes, record_count: int | None = None) -> dict[str, Any]:
    result: dict[str, Any] = {"bytes": len(raw), "sha256": sha256_bytes(raw)}
    if record_count is not None: result["record_count"] = record_count
    return result


def _length_hash(tag: str, rows: Iterable[bytes]) -> tuple[dict[str, Any], list[bytes]]:
    ordered = list(rows)
    digest = hashlib.sha256(IDENTITY_DOMAIN + b"\0" + tag.encode("utf-8") + b"\0")
    encoded_bytes = 0
    for row in ordered:
        prefix = struct.pack(">Q", len(row)); digest.update(prefix); digest.update(row)
        encoded_bytes += len(prefix) + len(row)
    return {"encoded_bytes": encoded_bytes, "sha256": digest.hexdigest(), "record_count": len(ordered)}, ordered


def parse_porcelain_v2(raw: bytes, run_relative: str) -> dict[str, Any]:
    try:
        run_raw = run_relative.encode("ascii")
    except UnicodeEncodeError as exc:
        raise ReceiptError("RUN_ROOT_NOT_ASCII") from exc
    if run_relative.startswith("/") or "\\" in run_relative or any(part in {"", ".", ".."} for part in run_relative.split("/")):
        raise ReceiptError("INVALID_RUN_ROOT_RELATIVE")
    records = [row for row in raw.split(b"\0") if row]
    parsed: list[tuple[bytes, bytes, bytes]] = []
    for record in records:
        kind = record[:1]
        if kind == b"1":
            fields = record.split(b" ", 8)
            if len(fields) != 9: raise ReceiptError("MALFORMED_STATUS_1")
            xy, path = fields[1], fields[8]
        elif kind == b"u":
            fields = record.split(b" ", 10)
            if len(fields) != 11: raise ReceiptError("MALFORMED_STATUS_U")
            xy, path = fields[1], fields[10]
        elif kind == b"?":
            xy, path = b"??", record[2:]
        elif kind == b"!":
            raise ReceiptError("IGNORED_STATUS_ROW")
        elif kind == b"2":
            raise ReceiptError("RENAME_ROW_FORBIDDEN")
        else:
            raise ReceiptError("UNKNOWN_STATUS_RECORD")
        touches = path == run_raw or path.startswith(run_raw + b"/")
        if touches and kind != b"?":
            raise ReceiptError("TRACKED_OR_STAGED_RUN_ROOT_ENTRY")
        parsed.append((path, kind, record))
    included = sorted([row for row in parsed if not (row[1] == b"?" and (row[0] == run_raw or row[0].startswith(run_raw + b"/")))], key=lambda row: (row[0], row[1], row[2]))
    excluded = sorted([row for row in parsed if row not in included], key=lambda row: (row[0], row[1], row[2]))
    classes: dict[str, list[bytes]] = {key: [] for key in ("staged", "tracked_worktree", "unmerged", "untracked_outside_run_root", "excluded_run_root_untracked")}
    for path, kind, record in included:
        if kind == b"u": classes["unmerged"].append(record)
        elif kind == b"?": classes["untracked_outside_run_root"].append(record)
        else:
            fields = record.split(b" ", 2); xy = fields[1]
            if xy[:1] != b".": classes["staged"].append(record)
            if xy[1:2] != b".": classes["tracked_worktree"].append(record)
    classes["excluded_run_root_untracked"] = [row[2] for row in excluded]
    normalized, _ = _length_hash(STATUS_ALGORITHM_ID, [row[2] for row in included])
    class_receipts = {name: _length_hash(STATUS_ALGORITHM_ID + "." + name, values)[0] for name, values in classes.items()}
    return {"normalized": {"algorithm_id": STATUS_ALGORITHM_ID, **normalized},
            "classifications": class_receipts,
            "included_paths": [row[0] for row in included], "excluded_paths": [row[0] for row in excluded],
            "untracked_outside_paths": [row[0] for row in included if row[1] == b"?"]}


def _path_population(repo_root: Path, relative_paths: Iterable[bytes], scope: str) -> dict[str, Any]:
    rows: list[bytes] = []; counts: dict[str, int] = defaultdict(int); total = 0
    for raw in sorted(set(relative_paths)):
        try: rel = raw.decode("utf-8", "strict")
        except UnicodeDecodeError as exc: raise ReceiptError("GIT_PATH_NOT_UTF8") from exc
        path = repo_root / rel
        st = path.lstat(); kind = _entry_kind(st.st_mode); counts[kind] += 1
        size = None; digest = None
        if kind == "regular_file":
            data = path.read_bytes(); size = len(data); digest = sha256_bytes(data); total += size
        row = [scope, rel, kind, stat.S_IMODE(st.st_mode), int(st.st_nlink), size, digest]
        rows.append(canonical_bytes(row))
    receipt, _ = _length_hash("filesystem-population." + scope, rows)
    return {"algorithm_id": "pm.filesystem-population.v1.1", "population_sha256": receipt["sha256"],
            "entry_count": len(rows), "regular_file_count": counts["regular_file"],
            "directory_count": counts["directory"], "symlink_count": counts["symlink"],
            "nonregular_count": counts["nonregular"], "regular_file_bytes": total}


def _run_root_observation(repo_root: Path, run_root: Path, excluded_status_paths: list[bytes]) -> dict[str, Any]:
    if not run_root.exists():
        return {"exists": False, "filesystem_population_sha256": None, "entry_count": 0,
                "regular_file_count": 0, "directory_count": 0, "regular_file_bytes": 0,
                "symlink_count": 0, "nonregular_count": 0, "multi_link_regular_file_count": 0,
                "filesystem_regular_path_set_sha256": None,
                "excluded_status_path_set_sha256": identity_hash("path-set", sorted(path.hex() for path in excluded_status_paths)),
                "path_sets_equal": len(excluded_status_paths) == 0}
    if run_root.is_symlink() or not run_root.is_dir(): raise ReceiptError("RUN_ROOT_NOT_REAL_DIRECTORY")
    base = repo_root.resolve(); paths = [run_root] + list(run_root.rglob("*"))
    rows: list[bytes] = []; regular_paths: list[str] = []; counts: dict[str, int] = defaultdict(int); total = 0; multilink = 0
    for path in sorted(paths, key=lambda item: item.relative_to(base).as_posix().encode("utf-8")):
        rel = _normalize_relative(path, base); st = path.lstat(); kind = _entry_kind(st.st_mode); counts[kind] += 1
        size = None; digest = None
        if kind == "regular_file":
            data = path.read_bytes(); size = len(data); digest = sha256_bytes(data); total += size; regular_paths.append(rel)
            if st.st_nlink != 1: multilink += 1
        rows.append(canonical_bytes([rel, kind, stat.S_IMODE(st.st_mode), int(st.st_nlink), size, digest]))
    pop, _ = _length_hash("run-root-population", rows)
    file_set = identity_hash("path-set", sorted(regular_paths, key=lambda item: item.encode("utf-8")))
    excluded_set = identity_hash("path-set", sorted(path.decode("utf-8", "strict") for path in excluded_status_paths))
    return {"exists": True, "filesystem_population_sha256": pop["sha256"], "entry_count": len(rows),
            "regular_file_count": counts["regular_file"], "directory_count": counts["directory"],
            "regular_file_bytes": total, "symlink_count": counts["symlink"], "nonregular_count": counts["nonregular"],
            "multi_link_regular_file_count": multilink, "filesystem_regular_path_set_sha256": file_set,
            "excluded_status_path_set_sha256": excluded_set, "path_sets_equal": file_set == excluded_set}


def _bound_inputs(entries: list[dict[str, Any]]) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    for entry in sorted(entries, key=lambda row: row["id"].encode("utf-8")):
        path = Path(entry["path"]); st = path.lstat()
        if not stat.S_ISREG(st.st_mode) or st.st_nlink != 1: raise ReceiptError("BOUND_INPUT_NOT_SINGLE_REGULAR_FILE")
        data = path.read_bytes(); digest = sha256_bytes(data)
        if len(data) != entry["bytes"] or digest != entry["sha256"]: raise ReceiptError("BOUND_INPUT_DRIFT")
        rows.append({"input_id": entry["id"], "contract_path_sha256": identity_hash("bound-input-path", str(path)),
                     "entry_kind": "regular_file", "mode": stat.S_IMODE(st.st_mode), "link_count": int(st.st_nlink),
                     "bytes": len(data), "sha256": digest})
    return {"population_sha256": identity_hash("bound-input-population", rows), "entry_count": len(rows), "entries": rows}


def build_protected_receipt(
    repo_root: Path,
    run_root: Path,
    source_snapshot: dict[str, Any],
    bound_inputs: list[dict[str, Any]],
    effective_contract_sha256: str,
    packet_core_population_sha256: str,
    trial_id: str,
    generation_id: str,
    phase: str = "BEFORE",
    before_receipt: dict[str, Any] | None = None,
    captured_at_utc: str | None = None,
) -> dict[str, Any]:
    repo_root = repo_root.resolve(); run_root = run_root.resolve()
    run_relative = run_root.relative_to(repo_root).as_posix()
    if not _prefix(run_relative, "Plans/.audits"):
        raise ReceiptError("RUN_ROOT_NOT_AUDIT_LOCAL")
    if phase == "BEFORE" and run_root.exists(): raise ReceiptError("RUN_ROOT_EXISTS_BEFORE")
    if phase == "AFTER" and not run_root.is_dir(): raise ReceiptError("RUN_ROOT_MISSING_AFTER")
    raw: dict[str, bytes] = {}
    for name, argv in GIT_COMMAND_CONTRACT["commands"].items():
        allowed = {0, 1} if name == "symbolic_ref" else {0}
        _, raw[name] = _git(repo_root, argv, allowed)
    symbolic_ref = raw["symbolic_ref"].strip().decode("utf-8") or None
    ref_target = None
    if symbolic_ref:
        _, ref_bytes = _git(repo_root, ["/usr/bin/git", "rev-parse", "--verify", symbolic_ref + "^{commit}"])
        ref_target = ref_bytes.strip().decode("ascii")
    status = parse_porcelain_v2(raw["status"], run_relative)
    untracked_content = _path_population(repo_root, status["untracked_outside_paths"], "untracked-outside-run-root")
    index_path_text = raw["index_path"].strip().decode("utf-8")
    index_path = Path(index_path_text) if os.path.isabs(index_path_text) else repo_root / index_path_text
    index_data = index_path.read_bytes(); index_st = index_path.lstat()
    git_executable = Path("/usr/bin/git")
    _, version_raw = _git(repo_root, ["/usr/bin/git", "--version"])
    collector = {
        "collector_sha256": sha256_bytes(Path(__file__).read_bytes()),
        "command_contract_sha256": identity_hash("git-command-contract", GIT_COMMAND_CONTRACT),
        "algorithm_id": PROTECTED_ALGORITHM_ID,
        "git_executable_sha256": sha256_bytes(git_executable.read_bytes()),
        "git_version": version_raw.strip().decode("utf-8"),
        "git_object_format": raw["object_format"].strip().decode("ascii"),
    }
    exclusion = {"authorized_run_root": str(run_root), "repo_relative_run_root": run_relative,
                 "repo_relative_path_encoding": "ascii", "strict_subtree_match": True,
                 "only_untracked_status_rows_may_be_excluded": True,
                 "tracked_or_staged_row_is_terminal": True, "symlink_or_nonregular_entry_is_terminal": True,
                 "created_regular_file_link_count_must_equal": 1, "absent_before": True}
    exclusion["exclusion_contract_sha256"] = identity_hash("run-root-exclusion", exclusion)
    git_state = {
        "head": {"commit_oid": raw["head_commit"].strip().decode("ascii"),
                 "tree_oid": raw["head_tree"].strip().decode("ascii"),
                 "symbolic_ref": symbolic_ref, "symbolic_ref_target_oid": ref_target},
        "index": {"logical_stage_entries_z": digest_descriptor(raw["index_entries"], len([r for r in raw["index_entries"].split(b"\0") if r])),
                  "storage_file": {"identity": "git-path:index", "entry_kind": "regular_file",
                                   "mode": stat.S_IMODE(index_st.st_mode), "bytes": len(index_data),
                                   "sha256": sha256_bytes(index_data)}},
        "status": {"raw_porcelain_v2_z": digest_descriptor(raw["status"], len([r for r in raw["status"].split(b"\0") if r])),
                   "normalized": status["normalized"], "classifications": status["classifications"],
                   "untracked_outside_run_root_content": untracked_content},
        "diffs": {"index_vs_head": digest_descriptor(raw["staged_diff"]),
                  "worktree_vs_index": digest_descriptor(raw["tracked_diff"])},
    }
    protected = {"plans_excluding_run_root": {"algorithm_id": SOURCE_ALGORITHM_ID,
                  "population_sha256": source_snapshot["population_sha256"], **source_snapshot["counts"],
                  "equals_source_snapshot_population": True},
                 "bound_inputs": _bound_inputs(bound_inputs)}
    run_observation = _run_root_observation(repo_root, run_root, status["excluded_paths"])
    invariant = {"trial_id": trial_id, "generation_id": generation_id, "packet_id": PACKET_ID,
                 "packet_core_population_sha256": packet_core_population_sha256,
                 "effective_contract_sha256": effective_contract_sha256,
                 "repository_root": str(repo_root), "collector": collector, "exclusion_contract": exclusion,
                 "head": git_state["head"], "index": git_state["index"],
                 "normalized_status": git_state["status"]["normalized"],
                 "status_classes": {key: value for key, value in git_state["status"]["classifications"].items() if key != "excluded_run_root_untracked"},
                 "untracked_outside_run_root_content": untracked_content, "diffs": git_state["diffs"],
                 "protected_populations": protected, "source_snapshot_population_sha256": source_snapshot["population_sha256"]}
    invariant_sha = identity_hash("protected-invariance", invariant)
    comparison = None
    if phase == "AFTER":
        if before_receipt is None: raise ReceiptError("AFTER_REQUIRES_BEFORE")
        mismatches = [] if before_receipt.get("invariance_payload_sha256") == invariant_sha else ["PROTECTED_INVARIANCE_DRIFT"]
        comparison = {"before_receipt_file_sha256": sha256_bytes(canonical_bytes(before_receipt)),
                      "before_invariance_payload_sha256": before_receipt.get("invariance_payload_sha256"),
                      "after_invariance_payload_sha256": invariant_sha,
                      "comparison_contract_sha256": identity_hash("protected-comparison-contract", ["all invariant fields", "raw status and run root excluded"]),
                      "mismatch_count": len(mismatches), "mismatch_codes": mismatches,
                      "terminal": "PASS" if not mismatches else "INPUT_DRIFT_STOP"}
    receipt = {"schema_version": "1.1.0", "packet_id": PACKET_ID,
               "receipt_id": f"protected.{phase.lower()}.{trial_id}.{generation_id}",
               "trial_id": trial_id, "generation_id": generation_id, "phase": phase,
               "effective_contract_sha256": effective_contract_sha256,
               "packet_core_population_sha256": packet_core_population_sha256,
               "source_snapshot_sha256": sha256_bytes(canonical_bytes(source_snapshot)),
               "source_snapshot_population_sha256": source_snapshot["population_sha256"],
               "repository_root": str(repo_root), "captured_at_utc": captured_at_utc or utc_now(),
               "collector": collector, "exclusion_contract": exclusion, "git_state": git_state,
               "protected_populations": protected, "run_root_observation": run_observation,
               "invariance_payload_sha256": invariant_sha, "comparison": comparison,
               "verification_mode": "LIVE_CAPTURED",
               "terminal": "PASS" if (phase == "BEFORE" or not comparison["mismatch_codes"]) else "INPUT_DRIFT_STOP"}
    receipt["receipt_payload_sha256"] = identity_hash("protected-state-receipt", receipt)
    return receipt


def receipt_contains_forbidden_raw(value: Any) -> bool:
    if isinstance(value, dict):
        for key, item in value.items():
            if key in {"data", "protected_entries"} or str(item).lower() == "base64": return True
            if receipt_contains_forbidden_raw(item): return True
    elif isinstance(value, list):
        return any(receipt_contains_forbidden_raw(item) for item in value)
    return False


def packet_population(root: Path, excluded: set[str] | None = None) -> tuple[list[dict[str, Any]], str]:
    excluded = excluded or set()
    rows = []
    paths = []
    for path in root.rglob("*"):
        rel = path.relative_to(root).as_posix()
        if "/" not in rel and rel in excluded: continue
        if stat.S_ISDIR(path.lstat().st_mode): continue
        paths.append(path)
    for path in sorted(paths, key=lambda p: p.relative_to(root).as_posix().encode("utf-8")):
        st = path.lstat(); rel = path.relative_to(root).as_posix()
        if not stat.S_ISREG(st.st_mode) or st.st_nlink != 1:
            raise ReceiptError(f"PACKET_NON_SINGLE_REGULAR_FILE:{rel}")
        data = path.read_bytes()
        rows.append({"path": rel, "entry_kind": "regular_file", "mode": stat.S_IMODE(st.st_mode), "link_count": int(st.st_nlink), "bytes": len(data), "sha256": sha256_bytes(data)})
    return rows, identity_hash("packet-core-population", rows)


def packet_directories(root: Path) -> set[str]:
    directories: set[str] = set()
    for path in root.rglob("*"):
        st = path.lstat()
        if stat.S_ISDIR(st.st_mode): directories.add(path.relative_to(root).as_posix())
    return directories
