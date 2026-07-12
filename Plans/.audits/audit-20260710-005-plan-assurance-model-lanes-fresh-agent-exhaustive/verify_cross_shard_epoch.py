#!/usr/bin/env python3
"""Independent local reconstruction of the cross-shard epoch candidate."""

from __future__ import annotations

import itertools
import json
from collections import defaultdict

from cross_shard_common import CROSS_CONCURRENCY, CROSS_EPOCH, CROSS_ROOT, MAX_PACKET_BYTES, digest_strings, load_jsonl, result_schema
from macro_v2_common import AUDIT_ID, ROOT, load_obj, root_hash, sha


def main() -> None:
    epoch = CROSS_ROOT / "frozen" / CROSS_EPOCH
    errors: list[str] = []
    try:
        authority = load_obj(epoch / "authority.json")
        seal = load_obj(epoch / "launch_seal.json")
        lineage = load_obj(epoch / "lineage/owner_merge.json")
        architecture = load_obj(epoch / "protocols/architecture.json")
        assignments = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
        registry = load_jsonl(epoch / "manifests/packet_registry.jsonl")
        pairs = load_jsonl(epoch / "manifests/pair_registry.jsonl")
        owner_active_path = ROOT / lineage["owner_active_ref"]
        owner_active = load_obj(owner_active_path)
        ledger_path = ROOT / lineage["owner_provisional_ledger_ref"]
        ledger = load_jsonl(ledger_path)
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": [f"load:{type(exc).__name__}:{exc}"]}, indent=2))
        raise SystemExit(1)
    if authority.get("audit_id") != AUDIT_ID or authority.get("epoch_id") != CROSS_EPOCH or authority.get("status") != "CANDIDATE_PENDING_INDEPENDENT_VALIDATION":
        errors.append("authority identity/status mismatch")
    if seal.get("status") != "PRELAUNCH_CANDIDATE_ZERO_CREDIT" or seal.get("coverage_credit_before_validation") != 0:
        errors.append("launch seal status/credit mismatch")
    if seal.get("authority_sha256") != sha((epoch / "authority.json").read_bytes()):
        errors.append("authority hash mismatch")
    payload_files = sorted(path for path in epoch.rglob("*") if path.is_file() and path.name not in {"authority.json", "launch_seal.json"})
    if authority.get("payload_root_sha256") != root_hash(payload_files, epoch):
        errors.append("payload root mismatch")
    sealed_files = sorted(path for path in epoch.rglob("*") if path.is_file() and path.name != "launch_seal.json")
    if seal.get("sealed_payload_root_sha256") != root_hash(sealed_files, epoch):
        errors.append("sealed root mismatch")
    if sha(owner_active_path.read_bytes()) != lineage.get("owner_active_sha256") or owner_active.get("status") != "ACTIVE_OWNER_SHARDS_COMPLETE":
        errors.append("owner active lineage mismatch")
    if sha(ledger_path.read_bytes()) != lineage.get("owner_provisional_ledger_sha256") or len(ledger) != lineage.get("provisional_feature_count"):
        errors.append("owner provisional ledger lineage mismatch")
    by_ref = {row["provisional_feature_ref"]: row for row in ledger}
    by_domain_assignment: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    for row in ledger:
        by_domain_assignment[row["owner_domain"]][row["assignment_id"]].add(row["provisional_feature_ref"])
    if len(assignments) != CROSS_CONCURRENCY or authority.get("assignment_count") != CROSS_CONCURRENCY:
        errors.append("assignment count is not exact 32")
    assignment_by_id = {row.get("assignment_id"): row for row in assignments}
    registry_by_id = {row.get("assignment_id"): row for row in registry}
    pair_by_id = {row.get("pair_id"): row for row in pairs}
    if len(assignment_by_id) != len(assignments) or set(assignment_by_id) != set(registry_by_id):
        errors.append("assignment/registry identity mismatch")
    anchors_by_pair: dict[str, list[str]] = defaultdict(list)
    for assignment_id, assignment in sorted(assignment_by_id.items()):
        packet_path = epoch / assignment["packet_ref"]
        if not packet_path.is_file():
            errors.append(f"packet missing:{assignment_id}")
            continue
        packet_bytes = packet_path.read_bytes()
        packet = json.loads(packet_bytes)
        if sha(packet_bytes) != assignment.get("packet_sha256") or len(packet_bytes) != assignment.get("packet_bytes") or len(packet_bytes) > MAX_PACKET_BYTES:
            errors.append(f"packet byte binding mismatch:{assignment_id}")
        anchors = packet.get("anchor_refs", [])
        comparators = packet.get("comparator_refs", [])
        if anchors != assignment.get("anchor_refs") or anchors != [row.get("provisional_feature_ref") for row in packet.get("anchor_features", [])]:
            errors.append(f"anchor closure mismatch:{assignment_id}")
        if comparators != assignment.get("comparator_refs") or comparators != [row.get("provisional_feature_ref") for row in packet.get("comparator_features", [])]:
            errors.append(f"comparator closure mismatch:{assignment_id}")
        if digest_strings(anchors) != assignment.get("anchor_refs_digest") or digest_strings(comparators) != assignment.get("comparator_refs_digest"):
            errors.append(f"packet digest mismatch:{assignment_id}")
        domain = assignment.get("owner_domain")
        left = assignment.get("left_owner_assignment_id")
        right = assignment.get("right_owner_assignment_id")
        if set(anchors) - by_domain_assignment[domain][left] or set(comparators) != by_domain_assignment[domain][right]:
            errors.append(f"packet source shard mismatch:{assignment_id}")
        if any(by_ref.get(ref, {}).get("owner_domain") != domain for ref in anchors + comparators):
            errors.append(f"packet cross-domain content:{assignment_id}")
        if set(anchors) & set(comparators):
            errors.append(f"packet anchor/comparator overlap:{assignment_id}")
        anchors_by_pair[assignment["pair_id"]].extend(anchors)
        reg = registry_by_id[assignment_id]
        if reg.get("packet_sha256") != assignment.get("packet_sha256") or reg.get("anchor_count") != len(anchors) or reg.get("comparator_count") != len(comparators):
            errors.append(f"packet registry mismatch:{assignment_id}")
        output = ROOT / assignment["output_directory"]
        if not output.is_dir() or any(output.iterdir()):
            errors.append(f"prelaunch output not empty:{assignment_id}")
    for pair_id, pair in pair_by_id.items():
        domain = pair["owner_domain"]
        left_refs = by_domain_assignment[domain][pair["left_owner_assignment_id"]]
        right_refs = by_domain_assignment[domain][pair["right_owner_assignment_id"]]
        anchors = anchors_by_pair[pair_id]
        if len(anchors) != len(set(anchors)) or set(anchors) != left_refs or pair.get("left_refs_digest") != digest_strings(anchors):
            errors.append(f"pair anchor partition mismatch:{pair_id}")
        if pair.get("right_refs_digest") != digest_strings(list(right_refs)):
            errors.append(f"pair comparator digest mismatch:{pair_id}")
    expected_pairs = sum(len(list(itertools.combinations(sorted(shards), 2))) for shards in by_domain_assignment.values() if len(shards) > 1)
    if len(pairs) != expected_pairs or authority.get("shard_pair_count") != expected_pairs:
        errors.append("pair registry does not cover all multi-shard owner pairs")
    if load_obj(epoch / "schemas/cross_shard_result.schema.json") != result_schema():
        errors.append("published schema differs from executable contract")
    if architecture.get("semantic_concurrency") != CROSS_CONCURRENCY or architecture.get("assignment_count") != CROSS_CONCURRENCY or architecture.get("second_independent_shadow_wave_required") is not True:
        errors.append("architecture concurrency/shadow contract mismatch")
    report = {
        "audit_id": AUDIT_ID,
        "checker": "cross_shard_epoch_independent_v1",
        "epoch_id": CROSS_EPOCH,
        "status": "pass" if not errors else "fail",
        "errors": sorted(set(errors)),
        "counts": {"assignments": len(assignments), "shard_pairs": len(pairs), "provisional_features": len(ledger)},
        "owner_active_sha256": sha(owner_active_path.read_bytes()),
        "owner_provisional_ledger_sha256": sha(ledger_path.read_bytes()),
        "authority_sha256": sha((epoch / "authority.json").read_bytes()),
        "launch_seal_sha256": sha((epoch / "launch_seal.json").read_bytes()),
        "packet_bytes_max": max((row.get("packet_bytes", 0) for row in assignments), default=0),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
