#!/usr/bin/env python3
"""Independent local reconstruction of the owner-domain merge epoch."""

from __future__ import annotations

import json
import math

from feature_catalog_common import OWNER_DOMAINS
from macro_v2_common import AUDIT_ID, ROOT, load_obj, root_hash, sha
from owner_merge_common import (
    MAX_OWNER_CONCURRENCY,
    MAX_PACKET_BYTES,
    MAX_SHARD_FEATURES,
    OWNER_EPOCH,
    OWNER_ROOT,
    digest_strings,
    load_jsonl,
    owner_merge_result_schema,
)


def main() -> None:
    epoch = OWNER_ROOT / "frozen" / OWNER_EPOCH
    errors: list[str] = []
    try:
        authority = load_obj(epoch / "authority.json")
        seal = load_obj(epoch / "launch_seal.json")
        lineage = load_obj(epoch / "lineage/catalog.json")
        architecture = load_obj(epoch / "protocols/architecture.json")
        assignments = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
        registry = load_jsonl(epoch / "manifests/packet_registry.jsonl")
        catalog_active_path = ROOT / lineage["catalog_active_ref"]
        catalog_active = load_obj(catalog_active_path)
        coverage_path = ROOT / catalog_active["coverage_ref"]
        ledger_path = ROOT / catalog_active["local_feature_ledger_ref"]
        ledger = load_jsonl(ledger_path)
        independent_path = ROOT / lineage["independent_catalog_postcheckpoint_ref"]
        independent = load_obj(independent_path)
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": [f"load:{type(exc).__name__}:{exc}"]}, indent=2))
        raise SystemExit(1)
    if authority.get("audit_id") != AUDIT_ID or authority.get("epoch_id") != OWNER_EPOCH:
        errors.append("authority identity mismatch")
    if authority.get("status") != "CANDIDATE_PENDING_INDEPENDENT_VALIDATION":
        errors.append("authority status mismatch")
    if seal.get("status") != "PRELAUNCH_CANDIDATE_ZERO_CREDIT" or seal.get("coverage_credit_before_validation") != 0:
        errors.append("launch status/credit mismatch")
    if seal.get("authority_sha256") != sha((epoch / "authority.json").read_bytes()):
        errors.append("authority hash mismatch")
    payload_files = sorted(path for path in epoch.rglob("*") if path.is_file() and path.name not in {"authority.json", "launch_seal.json"})
    if authority.get("payload_root_sha256") != root_hash(payload_files, epoch):
        errors.append("payload root mismatch")
    sealed_files = sorted(path for path in epoch.rglob("*") if path.is_file() and path.name != "launch_seal.json")
    if seal.get("sealed_payload_root_sha256") != root_hash(sealed_files, epoch):
        errors.append("sealed root mismatch")
    if sha(catalog_active_path.read_bytes()) != lineage.get("catalog_active_sha256"):
        errors.append("catalog active pointer mismatch")
    if sha(coverage_path.read_bytes()) != lineage.get("catalog_coverage_sha256") or lineage.get("catalog_coverage_sha256") != authority.get("catalog_coverage_sha256") or lineage.get("catalog_coverage_sha256") != seal.get("catalog_coverage_sha256"):
        errors.append("catalog coverage binding mismatch")
    if sha(ledger_path.read_bytes()) != lineage.get("local_feature_ledger_sha256"):
        errors.append("local feature ledger hash mismatch")
    if not independent_path.is_file() or sha(independent_path.read_bytes()) != lineage.get("independent_catalog_postcheckpoint_sha256") or independent.get("status") != "pass" or independent.get("errors") != []:
        errors.append("independent catalog postcheckpoint mismatch")
    ledger_refs = [row["local_feature_ref"] for row in ledger]
    ledger_by_ref = {row["local_feature_ref"]: row for row in ledger}
    if len(ledger_refs) != len(set(ledger_refs)) or len(ledger_refs) != 4131:
        errors.append("local feature ledger identity/cardinality mismatch")
    if digest_strings(ledger_refs) != lineage.get("local_feature_refs_digest") or lineage.get("local_feature_refs_digest") != authority.get("local_feature_refs_digest"):
        errors.append("local feature digest mismatch")
    if lineage.get("owner_domain_count") != len(OWNER_DOMAINS) or authority.get("owner_domain_count") != len(OWNER_DOMAINS):
        errors.append("owner domain count mismatch")
    if len(assignments) != MAX_OWNER_CONCURRENCY or authority.get("assignment_count") != len(assignments):
        errors.append("assignment count is not exact 24")
    assignment_by_id = {row.get("assignment_id"): row for row in assignments}
    registry_by_id = {row.get("assignment_id"): row for row in registry}
    if len(assignment_by_id) != len(assignments) or set(assignment_by_id) != set(registry_by_id):
        errors.append("assignment/registry identity mismatch")
    assigned_refs: list[str] = []
    domain_shards: dict[str, list[tuple[int, int, int]]] = {domain: [] for domain in OWNER_DOMAINS}
    for assignment_id, assignment in sorted(assignment_by_id.items()):
        packet_path = epoch / assignment["packet_ref"]
        if not packet_path.is_file():
            errors.append(f"packet missing:{assignment_id}")
            continue
        packet_bytes = packet_path.read_bytes()
        packet = json.loads(packet_bytes)
        if sha(packet_bytes) != assignment.get("packet_sha256") or len(packet_bytes) != assignment.get("packet_bytes"):
            errors.append(f"packet byte binding mismatch:{assignment_id}")
        if len(packet_bytes) > MAX_PACKET_BYTES:
            errors.append(f"packet exceeds byte cap:{assignment_id}")
        refs = packet.get("local_feature_refs", [])
        compact_refs = [row.get("local_feature_ref") for row in packet.get("features", [])]
        if refs != assignment.get("local_feature_refs") or refs != compact_refs:
            errors.append(f"packet local feature closure mismatch:{assignment_id}")
        if packet.get("local_feature_count") != len(refs) or not 1 <= len(refs) <= MAX_SHARD_FEATURES:
            errors.append(f"packet feature count mismatch:{assignment_id}")
        if packet.get("local_feature_refs_digest") != digest_strings(refs) or assignment.get("local_feature_refs_digest") != digest_strings(refs):
            errors.append(f"packet feature digest mismatch:{assignment_id}")
        domain = assignment.get("owner_domain")
        if domain not in OWNER_DOMAINS or packet.get("owner_domain") != domain:
            errors.append(f"packet owner domain mismatch:{assignment_id}")
        if any(ledger_by_ref.get(ref, {}).get("owner_domain") != domain for ref in refs):
            errors.append(f"packet contains cross-domain feature:{assignment_id}")
        domain_shards[domain].append((assignment["domain_shard_index"], assignment["domain_shard_count"], len(refs)))
        assigned_refs.extend(refs)
        reg = registry_by_id[assignment_id]
        if reg.get("packet_sha256") != assignment.get("packet_sha256") or reg.get("local_feature_count") != len(refs):
            errors.append(f"packet registry mismatch:{assignment_id}")
        output = ROOT / assignment["output_directory"]
        if not output.is_dir() or any(output.iterdir()):
            errors.append(f"prelaunch output not empty:{assignment_id}")
    if len(assigned_refs) != len(set(assigned_refs)) or set(assigned_refs) != set(ledger_refs):
        errors.append("owner packets do not exactly partition local features")
    domain_counts = {domain: sum(1 for row in ledger if row["owner_domain"] == domain) for domain in OWNER_DOMAINS}
    for domain, shards in domain_shards.items():
        expected_count = math.ceil(domain_counts[domain] / MAX_SHARD_FEATURES)
        indexes = sorted(index for index, count, size in shards)
        if len(shards) != expected_count or indexes != list(range(1, expected_count + 1)) or any(count != expected_count for index, count, size in shards):
            errors.append(f"domain shard topology mismatch:{domain}")
        sizes = [size for index, count, size in shards]
        if max(sizes) - min(sizes) > 1 or sum(sizes) != domain_counts[domain]:
            errors.append(f"domain shard balancing mismatch:{domain}")
    if load_obj(epoch / "schemas/owner_merge_result.schema.json") != owner_merge_result_schema():
        errors.append("published schema differs from executable contract")
    if architecture.get("shard_assignment_count") != len(assignments) or architecture.get("max_features_per_shard") != MAX_SHARD_FEATURES or architecture.get("max_packet_bytes") != MAX_PACKET_BYTES:
        errors.append("architecture sizing mismatch")
    if architecture.get("cross_domain_merges_forbidden") is not True or architecture.get("exact_membership_required") is not True:
        errors.append("architecture closure rules missing")
    report = {
        "audit_id": AUDIT_ID,
        "checker": "owner_merge_epoch_independent_v1",
        "epoch_id": OWNER_EPOCH,
        "status": "pass" if not errors else "fail",
        "errors": sorted(set(errors)),
        "counts": {"local_features": len(ledger), "owner_domains": len(OWNER_DOMAINS), "assignments": len(assignments)},
        "catalog_coverage_sha256": sha(coverage_path.read_bytes()),
        "local_feature_refs_digest": digest_strings(ledger_refs),
        "authority_sha256": sha((epoch / "authority.json").read_bytes()),
        "launch_seal_sha256": sha((epoch / "launch_seal.json").read_bytes()),
        "packet_bytes_max": max((row.get("packet_bytes", 0) for row in assignments), default=0),
        "shard_features_max": max((row.get("local_feature_count", 0) for row in assignments), default=0),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
