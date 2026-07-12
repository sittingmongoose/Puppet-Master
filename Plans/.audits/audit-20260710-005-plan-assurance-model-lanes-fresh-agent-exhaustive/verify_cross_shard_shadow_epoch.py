#!/usr/bin/env python3
"""Independent reconstruction verifier for the reverse-orientation shadow epoch."""

from __future__ import annotations

import itertools
import json
from collections import defaultdict

from cross_shard_shadow_common import (
    HARD_CAP, MAX_PACKET_BYTES, ORIENTATION, POLICY_REF, POLICY_SHA256, SHADOW_CONCURRENCY,
    SHADOW_EPOCH, SHADOW_ROOT, TEMPORARY_PRE_RESET_TARGET, digest_strings, load_jsonl,
    load_obj, result_schema,
)
from macro_v2_common import AUDIT_ID, ROOT, root_hash, sha


def main() -> None:
    epoch = SHADOW_ROOT / "frozen" / SHADOW_EPOCH
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
        coverage_path = ROOT / lineage["owner_coverage_ref"]
        ledger_path = ROOT / lineage["owner_provisional_ledger_ref"]
        ledger = load_jsonl(ledger_path)
        topology_path = ROOT / lineage["primary_pair_registry_topology_assertion_ref"]
        topology = load_jsonl(topology_path)
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": [f"load:{type(exc).__name__}:{exc}"]}, indent=2))
        raise SystemExit(1)

    if authority.get("audit_id") != AUDIT_ID or authority.get("epoch_id") != SHADOW_EPOCH or authority.get("status") != "CANDIDATE_PENDING_INDEPENDENT_VALIDATION":
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
    if sha(coverage_path.read_bytes()) != lineage.get("owner_coverage_sha256"):
        errors.append("owner coverage lineage mismatch")
    if sha(ledger_path.read_bytes()) != lineage.get("owner_provisional_ledger_sha256") or len(ledger) != 3888:
        errors.append("owner provisional ledger lineage mismatch")
    if sha(topology_path.read_bytes()) != lineage.get("primary_pair_registry_topology_assertion_sha256") or len(topology) != 11:
        errors.append("primary topology assertion mismatch")
    policy_path = ROOT / POLICY_REF
    if not policy_path.is_file() or sha(policy_path.read_bytes()) != POLICY_SHA256:
        errors.append("concurrency policy file mismatch")
    if authority.get("concurrency_policy_sha256") != POLICY_SHA256:
        errors.append("authority policy binding mismatch")

    by_ref = {row["provisional_feature_ref"]: row for row in ledger}
    by_domain_assignment: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    for row in ledger:
        by_domain_assignment[row["owner_domain"]][row["assignment_id"]].add(row["provisional_feature_ref"])
    expected_keys = {
        (domain, left, right)
        for domain, shards in by_domain_assignment.items()
        for left, right in itertools.combinations(sorted(shards), 2)
    }
    topology_by_id = {row["pair_id"]: row for row in topology}
    topology_keys = {(row["owner_domain"], row["left_owner_assignment_id"], row["right_owner_assignment_id"]) for row in topology}
    if topology_keys != expected_keys:
        errors.append("topology does not equal reconstructed owner pairs")

    if len(assignments) != SHADOW_CONCURRENCY or authority.get("assignment_count") != SHADOW_CONCURRENCY:
        errors.append("assignment count is not exact 40")
    assignment_by_id = {row.get("assignment_id"): row for row in assignments}
    registry_by_id = {row.get("assignment_id"): row for row in registry}
    pair_by_id = {row.get("shadow_pair_id"): row for row in pairs}
    if len(assignment_by_id) != len(assignments) or set(assignment_by_id) != set(registry_by_id):
        errors.append("assignment/packet registry identity mismatch")
    if len(pairs) != 11 or len(pair_by_id) != 11:
        errors.append("shadow pair registry count/uniqueness mismatch")

    ranked_topology = sorted(
        topology,
        key=lambda row: (-(row["left_feature_count"] * row["right_feature_count"]), row["pair_id"]),
    )
    expected_rank = {row["pair_id"]: index for index, row in enumerate(ranked_topology, 1)}
    anchors_by_pair: dict[str, list[str]] = defaultdict(list)
    for assignment_id, assignment in sorted(assignment_by_id.items()):
        packet_path = epoch / assignment["packet_ref"]
        if not packet_path.is_file():
            errors.append(f"packet missing:{assignment_id}")
            continue
        packet_bytes = packet_path.read_bytes()
        try:
            packet = json.loads(packet_bytes)
        except Exception as exc:
            errors.append(f"packet parse:{assignment_id}:{type(exc).__name__}")
            continue
        if sha(packet_bytes) != assignment.get("packet_sha256") or len(packet_bytes) != assignment.get("packet_bytes") or len(packet_bytes) >= MAX_PACKET_BYTES:
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
        left = assignment.get("original_left_owner_assignment_id")
        right = assignment.get("original_right_owner_assignment_id")
        if assignment.get("orientation") != ORIENTATION or assignment.get("anchor_owner_assignment_id") != right or assignment.get("comparator_owner_assignment_id") != left:
            errors.append(f"assignment reverse orientation mismatch:{assignment_id}")
        if packet.get("orientation") != ORIENTATION or packet.get("anchor_owner_assignment_id") != right or packet.get("comparator_owner_assignment_id") != left:
            errors.append(f"packet reverse orientation mismatch:{assignment_id}")
        if set(anchors) - by_domain_assignment[domain][right] or set(comparators) != by_domain_assignment[domain][left]:
            errors.append(f"reversed source shard mismatch:{assignment_id}")
        if any(by_ref.get(ref, {}).get("owner_domain") != domain for ref in anchors + comparators):
            errors.append(f"packet cross-domain content:{assignment_id}")
        if set(anchors) & set(comparators):
            errors.append(f"packet anchor/comparator overlap:{assignment_id}")
        serialized_packet = json.dumps(packet)
        forbidden_semantic_fields = {"primary_result_ref", "primary_decisions", "primary_candidate_lists", "primary_candidate_refs"}
        if "cross_shard_v1" in serialized_packet or forbidden_semantic_fields & set(packet):
            errors.append(f"primary semantic payload reference:{assignment_id}")
        anchors_by_pair[assignment["shadow_pair_id"]].extend(anchors)
        reg = registry_by_id[assignment_id]
        if reg.get("packet_sha256") != assignment.get("packet_sha256") or reg.get("orientation") != ORIENTATION:
            errors.append(f"packet registry mismatch:{assignment_id}")
        output = ROOT / assignment["output_directory"]
        if not output.is_dir() or any(output.iterdir()):
            errors.append(f"prelaunch output not empty:{assignment_id}")

    for shadow_pair_id, pair in pair_by_id.items():
        primary_id = pair["topology_assertion_pair_id"]
        primary = topology_by_id.get(primary_id)
        if not primary:
            errors.append(f"unknown topology assertion pair:{shadow_pair_id}")
            continue
        domain = pair["owner_domain"]
        left = pair["original_left_owner_assignment_id"]
        right = pair["original_right_owner_assignment_id"]
        if (domain, left, right) != (primary["owner_domain"], primary["left_owner_assignment_id"], primary["right_owner_assignment_id"]):
            errors.append(f"pair topology mapping mismatch:{shadow_pair_id}")
        rank = expected_rank[primary_id]
        expected_slices = 4 if rank <= 7 else 3
        if pair.get("work_rank") != rank or pair.get("shadow_slice_count") != expected_slices or len(pair.get("shadow_assignment_ids", [])) != expected_slices:
            errors.append(f"pair allocation mismatch:{shadow_pair_id}")
        anchors = anchors_by_pair[shadow_pair_id]
        right_refs = by_domain_assignment[domain][right]
        left_refs = by_domain_assignment[domain][left]
        if len(anchors) != len(set(anchors)) or set(anchors) != right_refs or pair.get("shadow_anchor_refs_digest") != digest_strings(anchors):
            errors.append(f"reversed anchor partition mismatch:{shadow_pair_id}")
        if pair.get("shadow_comparator_refs_digest") != digest_strings(list(left_refs)):
            errors.append(f"shadow comparator digest mismatch:{shadow_pair_id}")

    if sum(row.get("shadow_slice_count", 0) for row in pairs) != SHADOW_CONCURRENCY:
        errors.append("pair slice total mismatch")
    if sum(row.get("shadow_slice_count") == 4 for row in pairs) != 7 or sum(row.get("shadow_slice_count") == 3 for row in pairs) != 4:
        errors.append("four/three slice allocation mismatch")
    if load_obj(epoch / "schemas/cross_shard_shadow_result.schema.json") != result_schema():
        errors.append("published schema differs from executable contract")
    if architecture.get("orientation") != ORIENTATION or architecture.get("semantic_concurrency") != SHADOW_CONCURRENCY:
        errors.append("architecture orientation/concurrency mismatch")
    if architecture.get("temporary_pre_reset_target") != TEMPORARY_PRE_RESET_TARGET or architecture.get("hard_cap") != HARD_CAP:
        errors.append("architecture capacity mismatch")
    if architecture.get("concurrency_policy_sha256") != POLICY_SHA256 or architecture.get("primary_decisions_or_candidates_consumed") is not False:
        errors.append("architecture policy/independence mismatch")

    report = {
        "audit_id": AUDIT_ID,
        "checker": "cross_shard_shadow_epoch_independent_v1",
        "epoch_id": SHADOW_EPOCH,
        "status": "pass" if not errors else "fail",
        "errors": sorted(set(errors)),
        "counts": {
            "assignments": len(assignments), "shard_pairs": len(pairs),
            "multi_shard_domains": len({row.get("owner_domain") for row in pairs}),
            "provisional_features": len(ledger),
            "four_slice_pairs": sum(row.get("shadow_slice_count") == 4 for row in pairs),
            "three_slice_pairs": sum(row.get("shadow_slice_count") == 3 for row in pairs),
        },
        "owner_active_sha256": sha(owner_active_path.read_bytes()),
        "owner_provisional_ledger_sha256": sha(ledger_path.read_bytes()),
        "primary_pair_registry_topology_assertion_sha256": sha(topology_path.read_bytes()),
        "concurrency_policy_sha256": sha(policy_path.read_bytes()),
        "authority_sha256": sha((epoch / "authority.json").read_bytes()),
        "launch_seal_sha256": sha((epoch / "launch_seal.json").read_bytes()),
        "packet_bytes_max": max((row.get("packet_bytes", 0) for row in assignments), default=0),
        "anchor_refs_total": sum(row.get("anchor_count", 0) for row in assignments),
        "pair_domain_coverage": sorted({f"{row['topology_assertion_pair_id']}:{row['owner_domain']}" for row in pairs}),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
