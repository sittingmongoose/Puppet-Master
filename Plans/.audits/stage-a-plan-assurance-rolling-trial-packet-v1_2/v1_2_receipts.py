#!/usr/bin/env python3
"""v1.2 representation-only source and structural receipt helpers.

This module intentionally inherits v1.1 classification and semantic validation.
It changes only two representations: directory link counts are normalized to
null in source identities, and the logical structural map is stored as a small
descriptor plus deterministic ordered record-boundary shards.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import os
import stat
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
PLANS = REPO / "Plans"
V11_PACKET = ROOT.parent / "stage-a-plan-assurance-rolling-trial-packet-v1_1"
V11_RUN = ROOT.parent / "stage-a-plan-assurance-rolling-trial-v1_1-run-001"

PACKET_ID = "stage-a-plan-assurance-rolling-trial-packet-v1_2"
TRIAL_ID = "stage-a-plan-assurance-rolling-trial-v1_2-run-001"
GENERATION_ID = "generation-v1_2-001-20260717"
RUN_ROOT = ROOT / "backtest" / TRIAL_ID
IDENTITY_DOMAIN = b"pm.plan_assurance.identity.v1.2"
SOURCE_DOMAIN = b"pm.plan_assurance.source_snapshot.merkle.v1.2"
SOURCE_ALGORITHM_ID = "pm.plan_assurance.source_snapshot.merkle.v1.2"
DIRECTORY_LINK_POLICY_ID = "pm.plan_assurance.directory_link_count.null.v1.2"
STRUCTURAL_REPRESENTATION_ID = "pm.plan_assurance.structural_map.ordered_shards.v1.2"
BUCKET_COUNT = 256
BUCKETS_PER_SHARD = 16
SHARD_COUNT = 16
STRUCTURAL_TARGET_BYTES = 4 * 1024 * 1024
STRUCTURAL_SHARD_MAXIMUM = 8 * 1024 * 1024
ORDINARY_FILE_MAXIMUM = 1024 * 1024

COLLECTIONS = (
    "population", "documents", "sections", "machine_nodes", "plan_units",
    "acceptance_units", "references", "owner_consumer_edges",
    "capability_assignments", "identity_aliases",
)
ROW_KEYS = {
    "population": "path", "documents": "document_id", "sections": "section_id",
    "machine_nodes": "node_id", "plan_units": "plan_unit_id",
    "acceptance_units": "acceptance_key", "references": "reference_id",
    "owner_consumer_edges": "edge_id", "capability_assignments": "source_node_id",
    "identity_aliases": "alias_id",
}


def _load_module(path: Path, name: str) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"IMPORT:{path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


V11 = _load_module(V11_PACKET / "compact_receipts.py", "pm_v11_compact_for_v12")


class V12Error(RuntimeError):
    pass


def _canonicalize(value: Any) -> Any:
    if isinstance(value, str):
        return unicodedata.normalize("NFC", value)
    if isinstance(value, list) or isinstance(value, tuple):
        return [_canonicalize(item) for item in value]
    if isinstance(value, dict):
        result: dict[str, Any] = {}
        for raw_key, raw_value in value.items():
            key = unicodedata.normalize("NFC", str(raw_key))
            if key in result:
                raise V12Error("DUPLICATE_KEY_AFTER_NFC")
            result[key] = _canonicalize(raw_value)
        return {key: result[key] for key in sorted(result, key=lambda x: x.encode("utf-8"))}
    if isinstance(value, float):
        raise V12Error("FLOAT_FORBIDDEN_IN_IDENTITY")
    return value


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(_canonicalize(value), ensure_ascii=False, sort_keys=True,
                      separators=(",", ":"), allow_nan=False).encode("utf-8")


def strict_json_loads(text: str) -> Any:
    def pairs(rows: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for raw_key, value in rows:
            key = unicodedata.normalize("NFC", raw_key)
            if key in result:
                raise V12Error("DUPLICATE_JSON_KEY_AFTER_NFC")
            result[key] = value
        return result
    return json.loads(text, object_pairs_hook=pairs,
                      parse_constant=lambda value: (_ for _ in ()).throw(V12Error(f"NONFINITE_JSON:{value}")))


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def identity_hash(kind: str, value: Any) -> str:
    return sha256_bytes(IDENTITY_DOMAIN + b"\0" + kind.encode() + b"\0" + canonical_bytes(value))


def source_hash(kind: str, value: Any) -> str:
    return sha256_bytes(SOURCE_DOMAIN + b"\0" + kind.encode() + b"\0" + canonical_bytes(value))


def payload_hash(kind: str, value: dict[str, Any], field: str = "payload_sha256") -> str:
    payload = dict(value)
    payload.pop(field, None)
    return identity_hash(kind, payload)


def _lexists(path: Path) -> bool:
    try:
        path.lstat()
        return True
    except FileNotFoundError:
        return False


def _directory_identity(path: Path) -> dict[str, Any]:
    st = path.lstat()
    if not stat.S_ISDIR(st.st_mode) or stat.S_ISLNK(st.st_mode):
        raise V12Error(f"RUN_ROOT_ANCESTOR_NOT_REAL_DIRECTORY:{path}")
    return {
        "path": str(path), "device": int(st.st_dev), "inode": int(st.st_ino),
        "mode": stat.S_IMODE(st.st_mode), "entry_kind": "directory",
    }


def build_run_root_binding(run_root_raw: str, trial_id: str, require_absent: bool) -> dict[str, Any]:
    if not isinstance(run_root_raw, str) or not run_root_raw or "\0" in run_root_raw:
        raise V12Error("RUN_ROOT_RAW_INVALID")
    if unicodedata.normalize("NFC", run_root_raw) != run_root_raw:
        raise V12Error("RUN_ROOT_RAW_NOT_NFC")
    if "\\" in run_root_raw or run_root_raw.endswith("/") or "//" in run_root_raw:
        raise V12Error("RUN_ROOT_RAW_ALIAS")
    raw_parts = run_root_raw.split("/")
    if any(part in {".", ".."} for part in raw_parts):
        raise V12Error("RUN_ROOT_DOT_SEGMENT")
    path = Path(run_root_raw)
    if not path.is_absolute() or str(path) != run_root_raw:
        raise V12Error("RUN_ROOT_NOT_EXACT_ABSOLUTE")
    expected_parent = ROOT / "backtest"
    if path.parent != expected_parent or path.name != trial_id:
        raise V12Error("RUN_ROOT_NOT_EXACT_AUTHORIZED_CHILD")
    try:
        path.name.encode("ascii")
    except UnicodeEncodeError as exc:
        raise V12Error("RUN_ROOT_BASENAME_NOT_ASCII") from exc
    if not expected_parent.exists():
        raise V12Error("RUN_ROOT_PARENT_MISSING")
    chain = [_directory_identity(item) for item in (REPO, PLANS, PLANS / ".audits", ROOT, expected_parent)]
    occupied = _lexists(path)
    if require_absent and occupied:
        raise V12Error("RUN_ROOT_OCCUPIED_AT_FREEZE")
    relative = path.relative_to(REPO).as_posix()
    binding = {
        "policy_id": "pm.plan_assurance.exact_run_root_binding.v1.2",
        "repository_root_raw": str(REPO), "plans_root_raw": str(PLANS),
        "audits_root_raw": str(PLANS / ".audits"), "packet_root_raw": str(ROOT),
        "run_root_raw": run_root_raw, "run_root_canonical": run_root_raw,
        "repo_relative_run_root": relative, "direct_parent_raw": str(expected_parent),
        "basename": path.name, "trial_id": trial_id,
        "nfc_required": True, "ascii_basename_required": True,
        "no_symlink_ancestors": True, "absent_observed": not occupied,
        "ancestor_chain": chain,
        "ancestor_chain_sha256": identity_hash("run-root-ancestor-chain", chain),
    }
    binding["binding_sha256"] = payload_hash("run-root-binding", binding, "binding_sha256")
    return binding


def validate_run_root_binding(binding: dict[str, Any], require_absent: bool) -> list[str]:
    findings: list[str] = []
    try:
        rebuilt = build_run_root_binding(binding.get("run_root_raw", ""), binding.get("trial_id", ""), require_absent)
        compare = dict(binding)
        if not require_absent:
            compare["absent_observed"] = rebuilt["absent_observed"]
        if rebuilt != compare:
            findings.append("RUN_ROOT_BINDING_MISMATCH")
    except Exception as exc:
        findings.append(f"RUN_ROOT_BINDING:{exc}")
    return findings


def exclusive_create_run_root(binding: dict[str, Any]) -> dict[str, Any]:
    findings = validate_run_root_binding(binding, require_absent=True)
    if findings:
        raise V12Error(findings[0])
    parent = Path(binding["direct_parent_raw"])
    fd = os.open(parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0))
    try:
        os.mkdir(binding["basename"], mode=0o700, dir_fd=fd)
    except FileExistsError as exc:
        raise V12Error("RUN_ROOT_EXCLUSIVE_CREATE_EEXIST") from exc
    finally:
        os.close(fd)
    created = _directory_identity(Path(binding["run_root_raw"]))
    receipt = {
        "schema_version": "1.2.0", "packet_id": PACKET_ID,
        "trial_id": binding["trial_id"], "generation_id": GENERATION_ID,
        "run_root_binding_sha256": binding["binding_sha256"],
        "ancestor_chain_sha256": binding["ancestor_chain_sha256"],
        "absence_observations": ["before_scan_a", "between_scans", "after_scan_b", "immediately_precreate"],
        "creation_primitive": "os.mkdir(dir_fd=real_no_follow_parent_fd,exist_ok=false)",
        "created_directory_identity": created, "terminal": "PASS",
    }
    receipt["payload_sha256"] = payload_hash("run-root-creation-receipt", receipt)
    return receipt


def _normalized_rows(plans_root: Path, excluded_run_root: Path) -> list[dict[str, Any]]:
    rows = V11.inventory_rows(plans_root, [excluded_run_root])
    result: list[dict[str, Any]] = []
    for old in rows:
        row = {key: value for key, value in old.items()
               if key not in {"physical_leaf_sha256", "classification_leaf_sha256"}}
        if row["entry_kind"] == "directory":
            row["link_count"] = None
        physical = {key: row.get(key) for key in (
            "path", "entry_kind", "mode", "bytes", "sha256", "link_count",
            "symlink_target_bytes", "symlink_target_sha256", "nonregular_type", "nonregular_rdev",
        )}
        physical_leaf = source_hash("physical-leaf", physical)
        classification = {
            "physical_leaf_sha256": physical_leaf, "path_class": row["path_class"],
            "artifact_role": row["artifact_role"], "semantic_authority": row["semantic_authority"],
            "parser": row["parser"], "classification_rule_id": row["classification_rule_id"],
        }
        row["physical_leaf_sha256"] = physical_leaf
        row["classification_leaf_sha256"] = source_hash("classification-leaf", classification)
        result.append(row)
    result.sort(key=lambda row: row["path"].encode("utf-8"))
    return result


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
        nodes = nxt
        level += 1
    return nodes[0]


def _ordered_counts(keys: Iterable[str], counts: dict[str, int]) -> list[list[Any]]:
    return [[key, int(counts.get(key, 0))] for key in keys]


def _bucket_summaries(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[int, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        grouped[int(source_hash("path-bucket", row["path"])[:2], 16)].append(row)
    summaries: list[dict[str, Any]] = []
    for bucket in range(BUCKET_COUNT):
        members = sorted(grouped.get(bucket, []), key=lambda row: row["path"].encode("utf-8"))
        classes: dict[str, int] = defaultdict(int)
        roles: dict[str, int] = defaultdict(int)
        kinds: dict[str, int] = defaultdict(int)
        regular_bytes = 0
        multilink = 0
        for row in members:
            classes[row["path_class"]] += 1
            if row["artifact_role"] is not None:
                roles[row["artifact_role"]] += 1
            kinds[row["entry_kind"]] += 1
            regular_bytes += row["bytes"] or 0
            if row["entry_kind"] == "regular_file" and row["link_count"] != 1:
                multilink += 1
        common = {
            "bucket": f"{bucket:02x}", "entry_count": len(members),
            "regular_file_count": kinds["regular_file"], "directory_entry_count": kinds["directory"],
            "symlink_count": kinds["symlink"], "nonregular_count": kinds["nonregular"],
            "multi_link_regular_file_count": multilink, "regular_file_bytes": regular_bytes,
            "path_class_counts": _ordered_counts(V11.PATH_CLASSES, classes),
            "artifact_role_counts": _ordered_counts(V11.ARTIFACT_ROLES, roles),
        }
        physical_root = _merkle_root("physical", bucket, [r["physical_leaf_sha256"] for r in members])
        class_root = _merkle_root("classification", bucket, [r["classification_leaf_sha256"] for r in members])
        summaries.append({
            **common, "physical_merkle_root_sha256": physical_root,
            "classification_merkle_root_sha256": class_root,
            "physical_bucket_commitment_sha256": source_hash("physical-bucket", [common, physical_root]),
            "classification_bucket_commitment_sha256": source_hash("classification-bucket", [common, class_root]),
        })
    return summaries


def _counts(rows: list[dict[str, Any]]) -> dict[str, Any]:
    kinds: dict[str, int] = defaultdict(int)
    classes: dict[str, int] = defaultdict(int)
    roles: dict[str, int] = defaultdict(int)
    total_bytes = 0
    multilink = 0
    for row in rows:
        kinds[row["entry_kind"]] += 1
        classes[row["path_class"]] += 1
        if row["artifact_role"] is not None:
            roles[row["artifact_role"]] += 1
        total_bytes += row["bytes"] or 0
        if row["entry_kind"] == "regular_file" and row["link_count"] != 1:
            multilink += 1
    return {
        "entry_count": len(rows), "regular_file_count": kinds["regular_file"],
        "directory_entry_count": kinds["directory"], "symlink_count": kinds["symlink"],
        "nonregular_count": kinds["nonregular"], "multi_link_regular_file_count": multilink,
        "regular_file_bytes": total_bytes,
        "path_class_counts": _ordered_counts(V11.PATH_CLASSES, classes),
        "artifact_role_counts": _ordered_counts(V11.ARTIFACT_ROLES, roles),
        "unknown_classification_count": classes["unknown"],
    }


def build_source_bundle(plans_root: Path, run_root: Path, packet_core_sha256: str,
                        allow_created_root: bool = False) -> dict[str, Any]:
    binding = build_run_root_binding(str(run_root), TRIAL_ID, require_absent=not allow_created_root)
    rows_a = _normalized_rows(plans_root, run_root)
    rows_b = _normalized_rows(plans_root, run_root)
    if canonical_bytes(rows_a) != canonical_bytes(rows_b):
        raise V12Error("UNSTABLE_DOUBLE_SCAN")
    buckets = _bucket_summaries(rows_a)
    physical = source_hash("physical-population", [row["physical_bucket_commitment_sha256"] for row in buckets])
    classification = source_hash("classification-population", [row["classification_bucket_commitment_sha256"] for row in buckets])
    counts = _counts(rows_a)
    shard_objects: list[dict[str, Any]] = []
    shard_bindings: list[dict[str, Any]] = []
    for index in range(SHARD_COUNT):
        first = index * BUCKETS_PER_SHARD
        last = first + BUCKETS_PER_SHARD - 1
        shard = {
            "schema_version": "1.2.0", "packet_id": PACKET_ID,
            "trial_id": TRIAL_ID, "generation_id": GENERATION_ID,
            "shard_index": index, "first_bucket": f"{first:02x}", "last_bucket": f"{last:02x}",
            "buckets": buckets[first:last + 1],
        }
        shard["payload_sha256"] = payload_hash("source-bucket-shard", shard)
        raw = canonical_bytes(shard)
        shard_objects.append(shard)
        shard_bindings.append({
            "shard_index": index, "ref": f"SOURCE_SNAPSHOT_BUCKETS/{first:02x}-{last:02x}.json",
            "first_bucket": f"{first:02x}", "last_bucket": f"{last:02x}", "bucket_count": 16,
            "bytes": len(raw), "file_sha256": sha256_bytes(raw), "payload_sha256": shard["payload_sha256"],
        })
    classifier = {
        "classifier_id": V11.CLASSIFICATION_POLICY["policy_id"],
        "rule_bundle_sha256": V11.identity_hash("classification-policy", V11.CLASSIFICATION_POLICY),
        "plans_index_sha256": sha256_bytes((plans_root / "00-plans-index.md").read_bytes()),
        "path_class_enum": V11.PATH_CLASSES, "artifact_role_enum": V11.ARTIFACT_ROLES,
    }
    classifier["classifier_binding_sha256"] = identity_hash("classifier-binding", classifier)
    population_payload = {
        "algorithm_id": SOURCE_ALGORITHM_ID, "directory_link_count_policy_id": DIRECTORY_LINK_POLICY_ID,
        "plans_root": str(plans_root), "run_root_binding_sha256": binding["binding_sha256"],
        "counts": counts, "physical_population_sha256": physical,
        "classification_population_sha256": classification,
        "classifier_binding_sha256": classifier["classifier_binding_sha256"],
        "ordered_shard_payload_sha256s": [row["payload_sha256"] for row in shard_bindings],
    }
    population = source_hash("source-snapshot", population_payload)
    root = {
        "schema_version": "1.2.0", "packet_id": PACKET_ID,
        "receipt_id": f"source.{TRIAL_ID}.{GENERATION_ID}",
        "snapshot_id": identity_hash("source-snapshot-id", [TRIAL_ID, GENERATION_ID, physical, classification, packet_core_sha256]),
        "trial_id": TRIAL_ID, "generation_id": GENERATION_ID,
        "packet_core_population_sha256": packet_core_sha256,
        "plans_root": str(plans_root), "run_root_binding": binding,
        "algorithm": {
            "algorithm_id": SOURCE_ALGORITHM_ID, "hash": "sha256", "bucket_count": BUCKET_COUNT,
            "receipt_shard_count": SHARD_COUNT, "canonical_json": "pm.plan_assurance.identity.v1.2",
            "directory_link_count_policy_id": DIRECTORY_LINK_POLICY_ID,
            "directory_link_count_rule": "null for every directory; exact for every nondirectory entry",
            "stable_double_scan_required": True,
        },
        "classifier_binding": classifier, "counts": counts,
        "physical_population_sha256": physical, "classification_population_sha256": classification,
        "population_sha256": population,
        "stable_double_scan": {"scan_a_physical_sha256": physical, "scan_b_physical_sha256": physical,
                               "scan_a_classification_sha256": classification, "scan_b_classification_sha256": classification,
                               "identical": True},
        "bucket_shards": shard_bindings,
        "terminal": "PASS" if not any(counts[key] for key in ("symlink_count", "nonregular_count", "unknown_classification_count", "multi_link_regular_file_count")) else "BLOCKED",
    }
    root["snapshot_payload_sha256"] = payload_hash("source-snapshot-receipt", root, "snapshot_payload_sha256")
    return {"root": root, "shards": shard_objects, "rows": rows_a}


def validate_source_bundle(bundle: dict[str, Any]) -> list[str]:
    findings: list[str] = []
    root = bundle.get("root", {})
    shards = bundle.get("shards", [])
    if root.get("packet_id") != PACKET_ID or root.get("algorithm", {}).get("algorithm_id") != SOURCE_ALGORITHM_ID:
        findings.append("SOURCE:IDENTITY")
    if root.get("algorithm", {}).get("directory_link_count_policy_id") != DIRECTORY_LINK_POLICY_ID:
        findings.append("SOURCE:DIRECTORY_LINK_POLICY")
    if len(shards) != SHARD_COUNT or len(root.get("bucket_shards", [])) != SHARD_COUNT:
        findings.append("SOURCE:SHARD_COUNT")
    buckets: list[dict[str, Any]] = []
    refs = {row.get("shard_index"): row for row in root.get("bucket_shards", [])}
    seen: set[int] = set()
    for shard in shards:
        index = shard.get("shard_index")
        if index in seen or not isinstance(index, int) or index not in range(SHARD_COUNT):
            findings.append("SOURCE:SHARD_INDEX")
            continue
        seen.add(index)
        if shard.get("payload_sha256") != payload_hash("source-bucket-shard", shard):
            findings.append(f"SOURCE:SHARD_PAYLOAD:{index}")
        raw = canonical_bytes(shard)
        ref = refs.get(index, {})
        if ref.get("bytes") != len(raw) or ref.get("file_sha256") != sha256_bytes(raw):
            findings.append(f"SOURCE:SHARD_FILE:{index}")
        buckets.extend(shard.get("buckets", []))
    if seen != set(range(SHARD_COUNT)):
        findings.append("SOURCE:SHARD_SET")
    if [row.get("bucket") for row in buckets] != [f"{i:02x}" for i in range(BUCKET_COUNT)]:
        findings.append("SOURCE:BUCKET_ORDER")
    physical = source_hash("physical-population", [row.get("physical_bucket_commitment_sha256") for row in buckets])
    classification = source_hash("classification-population", [row.get("classification_bucket_commitment_sha256") for row in buckets])
    if physical != root.get("physical_population_sha256"):
        findings.append("SOURCE:PHYSICAL_ROOT")
    if classification != root.get("classification_population_sha256"):
        findings.append("SOURCE:CLASSIFICATION_ROOT")
    if root.get("snapshot_payload_sha256") != payload_hash("source-snapshot-receipt", root, "snapshot_payload_sha256"):
        findings.append("SOURCE:ROOT_PAYLOAD")
    if root.get("terminal") != "PASS":
        findings.append("SOURCE:TERMINAL")
    return findings


def _row_identity(collection: str, row: dict[str, Any]) -> str:
    key = ROW_KEYS[collection]
    value = row.get(key)
    if value is None and collection == "machine_nodes":
        value = row.get("machine_node_id") or row.get("json_pointer")
    if value is None and collection == "owner_consumer_edges":
        value = identity_hash("empty-owner-edge-identity", row)
    if value is None:
        raise V12Error(f"STRUCTURAL_ROW_ID_MISSING:{collection}")
    return str(value)


def _make_structural_shard(collection: str, collection_index: int, shard_index: int,
                           start: int, rows: list[dict[str, Any]], binding_sha256: str) -> dict[str, Any]:
    identities = [_row_identity(collection, row) for row in rows]
    shard = {
        "schema_version": "1.2.0", "packet_id": PACKET_ID,
        "trial_id": TRIAL_ID, "generation_id": GENERATION_ID,
        "structural_generation_binding_sha256": binding_sha256,
        "shard_index": shard_index, "collection_index": collection_index,
        "collection": collection, "row_start": start,
        "row_end_exclusive": start + len(rows), "row_count": len(rows),
        "first_identity": identities[0], "last_identity": identities[-1],
        "rows_sha256": identity_hash(f"structural-rows:{collection}", rows),
        "rows": rows,
    }
    shard["payload_sha256"] = payload_hash("structural-map-shard", shard)
    return shard


def _partition_collection(collection: str, collection_index: int, rows: list[dict[str, Any]],
                          next_shard_index: int, binding_sha256: str) -> list[dict[str, Any]]:
    if not rows:
        return []
    shards: list[dict[str, Any]] = []
    cursor = 0
    row_sizes = [len(canonical_bytes(row)) + 1 for row in rows]
    while cursor < len(rows):
        end = cursor
        estimated = 4096
        while end < len(rows) and estimated + row_sizes[end] <= STRUCTURAL_TARGET_BYTES:
            estimated += row_sizes[end]
            end += 1
        if end == cursor:
            end += 1
        selected = rows[cursor:end]
        probe = _make_structural_shard(collection, collection_index, next_shard_index + len(shards), cursor, selected, binding_sha256)
        while len(canonical_bytes(probe)) > STRUCTURAL_TARGET_BYTES and len(selected) > 1:
            selected = selected[:-1]
            probe = _make_structural_shard(collection, collection_index, next_shard_index + len(shards), cursor, selected, binding_sha256)
        while cursor + len(selected) < len(rows):
            candidate = selected + [rows[cursor + len(selected)]]
            candidate_probe = _make_structural_shard(collection, collection_index, next_shard_index + len(shards), cursor, candidate, binding_sha256)
            if len(canonical_bytes(candidate_probe)) > STRUCTURAL_TARGET_BYTES:
                break
            selected = candidate
            probe = candidate_probe
        if len(canonical_bytes(probe)) > STRUCTURAL_SHARD_MAXIMUM:
            raise V12Error(f"STRUCTURAL_RECORD_OR_SHARD_TOO_LARGE:{collection}:{cursor}")
        if not selected:
            raise V12Error(f"STRUCTURAL_EMPTY_PARTITION:{collection}:{cursor}")
        shards.append(probe)
        cursor += len(selected)
    return shards


def build_capability_slices(source_rows: list[dict[str, Any]], active_map: dict[str, Any]) -> list[dict[str, Any]]:
    documents = {row["path"]: row for row in active_map.get("documents", [])}
    source = {row["path"]: row for row in source_rows if row["entry_kind"] == "regular_file" and row["path_class"] == "canonical"}
    old_dir = V11_RUN / "CONTROL" / "CAPABILITY_SLICES"
    result: list[dict[str, Any]] = []
    for old_path in sorted(old_dir.glob("*.json"), key=lambda p: p.name.encode()):
        old = strict_json_loads(old_path.read_text(encoding="utf-8"))
        spans: list[dict[str, Any]] = []
        for binding in old.get("source_bindings", []):
            path = binding["ref"]
            row = source.get(path)
            doc = documents.get(path)
            if row is None or doc is None:
                raise V12Error(f"CAPABILITY_SLICE_NONCANONICAL_OR_MISSING:{path}")
            spans.append({
                "path": path, "document_id": doc["document_id"], "start_byte": 0,
                "end_byte": row["bytes"], "span_sha256": row["sha256"],
                "source_file_sha256": row["sha256"], "source_file_bytes": row["bytes"],
            })
        spans.sort(key=lambda row: (row["path"].encode("utf-8"), row["start_byte"], row["end_byte"]))
        family = old["family_id"]
        manifest = {
            "schema_version": "1.2.0", "packet_id": PACKET_ID,
            "trial_id": TRIAL_ID, "generation_id": GENERATION_ID,
            "family_id": family, "slice_id": f"slice.{family}.{GENERATION_ID}",
            "provenance_mode": "EXACT_CANONICAL_SOURCE_SPANS_ONLY",
            "worker_visibility": "ONLY_THIS_MANIFEST_AND_EXACT_BOUND_SPAN_BYTES_AFTER_LOCK",
            "audit_or_noncanonical_path_count": 0, "spans": spans,
            "span_population_sha256": identity_hash("capability-slice-spans", spans),
            "terminal": "FROZEN",
        }
        manifest["payload_sha256"] = payload_hash("capability-slice-manifest", manifest)
        result.append(manifest)
    return result


def build_structural_bundle(active_map: dict[str, Any], source_bundle: dict[str, Any]) -> dict[str, Any]:
    root = source_bundle["root"]
    source_rows = source_bundle["rows"]
    canonical_rows = [row for row in source_rows if row["entry_kind"] == "regular_file" and row["path_class"] == "canonical"]
    logical_bytes = canonical_bytes(active_map)
    binding_payload = {
        "packet_id": PACKET_ID, "trial_id": TRIAL_ID, "generation_id": GENERATION_ID,
        "source_population_sha256": root["population_sha256"],
        "logical_map_sha256": identity_hash("v1-active-structural-map", active_map),
    }
    generation_binding = identity_hash("structural-generation-binding", binding_payload)
    shards: list[dict[str, Any]] = []
    collections_meta: list[dict[str, Any]] = []
    for collection_index, collection in enumerate(COLLECTIONS):
        rows = active_map.get(collection)
        if not isinstance(rows, list):
            raise V12Error(f"STRUCTURAL_COLLECTION_MISSING:{collection}")
        start_index = len(shards)
        collection_shards = _partition_collection(collection, collection_index, rows, start_index, generation_binding)
        shards.extend(collection_shards)
        collections_meta.append({
            "collection_index": collection_index, "collection": collection,
            "row_count": len(rows), "shard_index_start": start_index,
            "shard_count": len(collection_shards),
            "rows_sha256": identity_hash(f"structural-rows:{collection}", rows),
        })
    if len(shards) > 32:
        raise V12Error("STRUCTURAL_TOO_MANY_SHARDS")
    shard_bindings: list[dict[str, Any]] = []
    for shard in shards:
        raw = canonical_bytes(shard)
        if len(raw) > STRUCTURAL_SHARD_MAXIMUM:
            raise V12Error("STRUCTURAL_SHARD_HARD_CAP")
        ref = f"STRUCTURAL_COVERAGE_MAP_SHARDS/{shard['shard_index']:02d}-{shard['collection']}-{shard['row_start']:06d}-{shard['row_end_exclusive']:06d}.json"
        shard_bindings.append({
            "shard_index": shard["shard_index"], "collection_index": shard["collection_index"],
            "collection": shard["collection"], "ref": ref,
            "row_start": shard["row_start"], "row_end_exclusive": shard["row_end_exclusive"],
            "row_count": shard["row_count"], "first_identity": shard["first_identity"],
            "last_identity": shard["last_identity"], "physical_bytes": len(raw),
            "decoded_bytes": len(raw), "physical_sha256": sha256_bytes(raw),
            "rows_sha256": shard["rows_sha256"], "payload_sha256": shard["payload_sha256"],
        })
    noncanonical: list[dict[str, Any]] = []
    for path_class in ("generated", "governance_support", "source_lineage", "audit", "retired", "unknown"):
        members = [row for row in source_rows if row["path_class"] == path_class]
        noncanonical.append({
            "path_class": path_class, "entry_count": len(members),
            "population_sha256": source_hash("path-class-population", [path_class, [row["classification_leaf_sha256"] for row in members]]),
            "semantic_reread": False,
        })
    slices = build_capability_slices(source_rows, active_map)
    slice_bindings = []
    for item in slices:
        raw = canonical_bytes(item)
        slice_bindings.append({
            "family_id": item["family_id"], "ref": f"CAPABILITY_SLICES/{item['family_id']}.json",
            "span_count": len(item["spans"]), "bytes": len(raw), "sha256": sha256_bytes(raw),
            "payload_sha256": item["payload_sha256"],
        })
    scalar = {key: value for key, value in active_map.items() if key not in COLLECTIONS}
    descriptor = {
        "schema_version": "1.2.0", "packet_id": PACKET_ID,
        "trial_id": TRIAL_ID, "generation_id": GENERATION_ID,
        "representation_id": STRUCTURAL_REPRESENTATION_ID,
        "structural_generation_binding_sha256": generation_binding,
        "source_snapshot_sha256": sha256_bytes(canonical_bytes(root)),
        "source_population_sha256": root["population_sha256"],
        "source_physical_population_sha256": root["physical_population_sha256"],
        "source_classification_population_sha256": root["classification_population_sha256"],
        "source_counts": root["counts"], "canonical_population_count": len(canonical_rows),
        "noncanonical_class_commitments": noncanonical,
        "logical_map": {
            "logical_decoded_bytes": len(logical_bytes),
            "logical_map_sha256": identity_hash("v1-active-structural-map", active_map),
            "v1_1_active_structural_map_sha256": V11.identity_hash("v1-active-structural-map", active_map),
            "clean_rebuild_sha256": identity_hash("v1.2-structural-clean-rebuild", active_map),
            "scalar_fields": scalar,
        },
        "collections": collections_meta, "ordered_shards": shard_bindings,
        "capability_slices": slice_bindings,
        "limits": {"ordinary_descriptor_bytes_maximum": ORDINARY_FILE_MAXIMUM,
                   "shard_physical_bytes_maximum": STRUCTURAL_SHARD_MAXIMUM,
                   "shard_decoded_bytes_maximum": STRUCTURAL_SHARD_MAXIMUM,
                   "logical_decoded_bytes_maximum": 96 * 1024 * 1024,
                   "shards_maximum": 32},
        "terminal": "PASS",
    }
    descriptor["payload_sha256"] = payload_hash("structural-map-descriptor", descriptor)
    if len(canonical_bytes(descriptor)) > ORDINARY_FILE_MAXIMUM:
        raise V12Error("STRUCTURAL_DESCRIPTOR_CAP")
    return {"descriptor": descriptor, "shards": shards, "capability_slices": slices}


def reassemble_structural_bundle(bundle: dict[str, Any]) -> tuple[dict[str, Any] | None, list[str]]:
    findings: list[str] = []
    descriptor = bundle.get("descriptor", {})
    shards = bundle.get("shards", [])
    bindings = descriptor.get("ordered_shards", [])
    if descriptor.get("packet_id") != PACKET_ID or descriptor.get("representation_id") != STRUCTURAL_REPRESENTATION_ID:
        findings.append("STRUCTURAL:IDENTITY")
    if len(canonical_bytes(descriptor)) > ORDINARY_FILE_MAXIMUM:
        findings.append("STRUCTURAL:DESCRIPTOR_CAP")
    if len(shards) != len(bindings) or len(shards) > 32:
        findings.append("STRUCTURAL:SHARD_COUNT")
    reconstructed = dict(descriptor.get("logical_map", {}).get("scalar_fields", {}))
    shard_by_index: dict[int, dict[str, Any]] = {}
    for shard in shards:
        index = shard.get("shard_index")
        if not isinstance(index, int) or index in shard_by_index:
            findings.append("STRUCTURAL:SHARD_INDEX")
            continue
        shard_by_index[index] = shard
    if set(shard_by_index) != set(range(len(shards))):
        findings.append("STRUCTURAL:SHARD_INDEX_SET")
    for collection_index, collection in enumerate(COLLECTIONS):
        rows: list[dict[str, Any]] = []
        expected_start = 0
        relevant = [row for row in bindings if row.get("collection") == collection]
        for binding in relevant:
            index = binding.get("shard_index")
            shard = shard_by_index.get(index, {})
            raw = canonical_bytes(shard)
            if binding.get("collection_index") != collection_index or shard.get("collection_index") != collection_index:
                findings.append(f"STRUCTURAL:COLLECTION_INDEX:{collection}")
            if binding.get("row_start") != expected_start or shard.get("row_start") != expected_start:
                findings.append(f"STRUCTURAL:RANGE:{collection}")
            if binding.get("row_count") != len(shard.get("rows", [])) or shard.get("row_end_exclusive") != expected_start + len(shard.get("rows", [])):
                findings.append(f"STRUCTURAL:ROW_COUNT:{collection}")
            if len(raw) > STRUCTURAL_SHARD_MAXIMUM or binding.get("physical_bytes") != len(raw) or binding.get("decoded_bytes") != len(raw):
                findings.append(f"STRUCTURAL:SHARD_CAP_OR_SIZE:{index}")
            if binding.get("physical_sha256") != sha256_bytes(raw) or shard.get("payload_sha256") != payload_hash("structural-map-shard", shard):
                findings.append(f"STRUCTURAL:SHARD_HASH:{index}")
            shard_rows = shard.get("rows", [])
            if shard_rows:
                if binding.get("first_identity") != _row_identity(collection, shard_rows[0]) or binding.get("last_identity") != _row_identity(collection, shard_rows[-1]):
                    findings.append(f"STRUCTURAL:IDENTITY_RANGE:{index}")
            rows.extend(shard_rows)
            expected_start += len(shard_rows)
        meta = next((row for row in descriptor.get("collections", []) if row.get("collection") == collection), None)
        if meta is None or meta.get("row_count") != len(rows) or meta.get("rows_sha256") != identity_hash(f"structural-rows:{collection}", rows):
            findings.append(f"STRUCTURAL:COLLECTION_ROOT:{collection}")
        identities = [_row_identity(collection, row) for row in rows]
        if len(identities) != len(set(identities)):
            findings.append(f"STRUCTURAL:DUPLICATE_ID:{collection}")
        reconstructed[collection] = rows
    logical = descriptor.get("logical_map", {})
    if logical.get("logical_decoded_bytes") != len(canonical_bytes(reconstructed)):
        findings.append("STRUCTURAL:LOGICAL_BYTES")
    if logical.get("logical_map_sha256") != identity_hash("v1-active-structural-map", reconstructed):
        findings.append("STRUCTURAL:LOGICAL_HASH")
    if logical.get("v1_1_active_structural_map_sha256") != V11.identity_hash("v1-active-structural-map", reconstructed):
        findings.append("STRUCTURAL:V1_1_LOGICAL_HASH")
    if logical.get("clean_rebuild_sha256") != identity_hash("v1.2-structural-clean-rebuild", reconstructed):
        findings.append("STRUCTURAL:CLEAN_REBUILD")
    if descriptor.get("payload_sha256") != payload_hash("structural-map-descriptor", descriptor):
        findings.append("STRUCTURAL:DESCRIPTOR_PAYLOAD")
    return reconstructed if not findings else reconstructed, findings


def write_json_exclusive(path: Path, value: Any) -> dict[str, Any]:
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = canonical_bytes(value)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0), 0o600)
    try:
        os.write(fd, raw)
        os.fsync(fd)
    finally:
        os.close(fd)
    st = path.lstat()
    if not stat.S_ISREG(st.st_mode) or st.st_nlink != 1:
        raise V12Error(f"OUTPUT_NOT_SINGLE_REGULAR_FILE:{path}")
    return {"path": path.as_posix(), "bytes": len(raw), "sha256": sha256_bytes(raw)}


def packet_core_population(core_files: Iterable[str]) -> tuple[list[dict[str, Any]], str]:
    rows: list[dict[str, Any]] = []
    for rel in sorted(core_files, key=lambda item: item.encode("utf-8")):
        path = ROOT / rel
        st = path.lstat()
        if not stat.S_ISREG(st.st_mode) or st.st_nlink != 1:
            raise V12Error(f"PACKET_CORE_NOT_SINGLE_REGULAR_FILE:{rel}")
        raw = path.read_bytes()
        rows.append({"path": rel, "mode": stat.S_IMODE(st.st_mode), "link_count": int(st.st_nlink),
                     "bytes": len(raw), "sha256": sha256_bytes(raw)})
    return rows, identity_hash("packet-core-population", rows)
