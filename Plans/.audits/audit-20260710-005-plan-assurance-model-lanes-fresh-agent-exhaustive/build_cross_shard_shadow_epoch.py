#!/usr/bin/env python3
"""Build the independent 40-assignment reverse-orientation shadow epoch."""

from __future__ import annotations

import itertools
import json
import os
from collections import defaultdict

from cross_shard_shadow_common import (
    HARD_CAP, MAX_PACKET_BYTES, ORIENTATION, POLICY_REF, POLICY_SHA256, SHADOW_ATTEMPT,
    SHADOW_CONCURRENCY, SHADOW_EPOCH, SHADOW_OUTPUT_ROOT, SHADOW_ROOT,
    TEMPORARY_PRE_RESET_TARGET, canonical_json, compact_feature, digest_strings,
    load_jsonl, load_obj, result_schema, write_jsonl, write_obj,
)
from macro_v2_common import AUDIT_ID, ROOT, root_hash, sha


def main() -> None:
    staging = SHADOW_ROOT / "staging" / SHADOW_EPOCH
    final = SHADOW_ROOT / "frozen" / SHADOW_EPOCH
    if staging.exists() or final.exists() or SHADOW_OUTPUT_ROOT.exists():
        raise RuntimeError("refusing to overwrite shadow epoch or output namespace")

    policy_path = ROOT / POLICY_REF
    if not policy_path.is_file() or sha(policy_path.read_bytes()) != POLICY_SHA256:
        raise RuntimeError("CONCURRENCY_POLICY_V2 binding mismatch")

    owner_active_path = ROOT / "master/owner_merge/live/ACTIVE.json"
    owner_active = load_obj(owner_active_path)
    if owner_active.get("status") != "ACTIVE_OWNER_SHARDS_COMPLETE":
        raise RuntimeError("owner shard merge is not active-complete")
    coverage_path = ROOT / owner_active["coverage_ref"]
    ledger_path = ROOT / owner_active["provisional_feature_ledger_ref"]
    if sha(coverage_path.read_bytes()) != owner_active["coverage_sha256"]:
        raise RuntimeError("owner coverage hash mismatch")
    if sha(ledger_path.read_bytes()) != owner_active["provisional_feature_ledger_sha256"]:
        raise RuntimeError("owner provisional ledger hash mismatch")
    coverage = load_obj(coverage_path)
    ledger = load_jsonl(ledger_path)
    if coverage.get("complete") is not True or len(ledger) != 3888:
        raise RuntimeError("owner shard coverage is incomplete")

    by_domain_assignment: dict[str, dict[str, list[dict]]] = defaultdict(lambda: defaultdict(list))
    for row in ledger:
        by_domain_assignment[row["owner_domain"]][row["assignment_id"]].append(row)
    for assignments in by_domain_assignment.values():
        for rows in assignments.values():
            rows.sort(key=lambda row: row["provisional_feature_ref"])

    primary_pair_registry_path = ROOT / "master/cross_shard/frozen/cross-shard-epoch-0001/manifests/pair_registry.jsonl"
    primary_pairs = load_jsonl(primary_pair_registry_path)
    primary_topology = {
        (row["owner_domain"], row["left_owner_assignment_id"], row["right_owner_assignment_id"]): row
        for row in primary_pairs
    }
    reconstructed = []
    for domain, assignments in sorted(by_domain_assignment.items()):
        for left_id, right_id in itertools.combinations(sorted(assignments), 2):
            reconstructed.append((domain, left_id, right_id, assignments[left_id], assignments[right_id]))
    reconstructed_keys = {(d, l, r) for d, l, r, _, _ in reconstructed}
    if len(primary_pairs) != 11 or set(primary_topology) != reconstructed_keys:
        raise RuntimeError("primary pair registry topology assertion mismatch")
    for domain, left_id, right_id, left_rows, right_rows in reconstructed:
        primary = primary_topology[(domain, left_id, right_id)]
        if primary.get("left_feature_count") != len(left_rows) or primary.get("right_feature_count") != len(right_rows):
            raise RuntimeError(f"primary pair count assertion mismatch:{primary.get('pair_id')}")

    ranked = sorted(
        reconstructed,
        key=lambda item: (-(len(item[3]) * len(item[4])), primary_topology[(item[0], item[1], item[2])]["pair_id"]),
    )
    slice_by_key = { (d, l, r): (4 if rank <= 7 else 3) for rank, (d, l, r, _, _) in enumerate(ranked, 1) }
    if sum(slice_by_key.values()) != SHADOW_CONCURRENCY:
        raise RuntimeError("shadow allocation does not total 40")

    staging.mkdir(parents=True)
    assignments_out: list[dict] = []
    packet_registry: list[dict] = []
    pair_registry: list[dict] = []
    sequence = 0
    for rank, (domain, left_id, right_id, left_rows, right_rows) in enumerate(ranked, 1):
        primary = primary_topology[(domain, left_id, right_id)]
        suffix = primary["pair_id"].split("-")[-1]
        shadow_pair_id = f"CSSPAIR-{suffix}"
        slice_count = slice_by_key[(domain, left_id, right_id)]
        base, extra = divmod(len(right_rows), slice_count)
        offset = 0
        pair_anchor_refs: list[str] = []
        assignment_ids: list[str] = []
        for slice_index in range(1, slice_count + 1):
            sequence += 1
            size = base + (1 if slice_index <= extra else 0)
            anchors = right_rows[offset:offset + size]
            offset += size
            anchor_refs = [row["provisional_feature_ref"] for row in anchors]
            comparator_refs = [row["provisional_feature_ref"] for row in left_rows]
            packet_id = f"CSSPKT-{sequence:04d}"
            assignment_id = f"A005CSS-{sequence:04d}"
            packet = {
                "audit_id": AUDIT_ID,
                "schema_version": "cross-shard-shadow-packet-v1",
                "epoch_id": SHADOW_EPOCH,
                "phase": "cross_shard_reverse_orientation_shadow_candidate_discovery",
                "shadow_pair_id": shadow_pair_id,
                "topology_assertion_pair_id": primary["pair_id"],
                "packet_id": packet_id,
                "assignment_id": assignment_id,
                "attempt_id": SHADOW_ATTEMPT,
                "owner_domain": domain,
                "orientation": ORIENTATION,
                "original_left_owner_assignment_id": left_id,
                "original_right_owner_assignment_id": right_id,
                "anchor_owner_assignment_id": right_id,
                "comparator_owner_assignment_id": left_id,
                "anchor_slice_index": slice_index,
                "anchor_slice_count": slice_count,
                "anchor_count": len(anchor_refs),
                "anchor_refs": anchor_refs,
                "anchor_refs_digest": digest_strings(anchor_refs),
                "comparator_count": len(comparator_refs),
                "comparator_refs": comparator_refs,
                "comparator_refs_digest": digest_strings(comparator_refs),
                "anchor_features": [compact_feature(row) for row in anchors],
                "comparator_features": [compact_feature(row) for row in left_rows],
                "result_schema_ref": "schemas/cross_shard_shadow_result.schema.json",
                "instructions": {
                    "objective": "Independently compare every reversed-orientation anchor against every comparator for the same unordered owner-shard pair.",
                    "merge_rule": "Merge-equivalent means the same product authority, lifecycle, user outcome, state boundary, and failure semantics.",
                    "non_equivalence_rule": "Umbrella/member structure, adjacency, dependency, shared vocabulary or UI, and related commands are not merge-equivalent.",
                    "coverage_rule": "Emit exactly one decision per anchor and compare every comparator; empty lists require exhaustive review.",
                    "independence_rule": "Do not read primary decisions, candidate lists, peer outputs, canonical Plans, or external sources.",
                    "output_rule": "Write exactly one strict-schema JSON payload in the assigned output directory, then return PMR1.",
                },
            }
            packet_ref = f"packets/{packet_id}.json"
            packet_path = staging / packet_ref
            write_obj(packet_path, packet)
            packet_bytes = len(packet_path.read_bytes())
            if packet_bytes >= MAX_PACKET_BYTES:
                raise RuntimeError(f"shadow packet reaches/exceeds byte cap:{assignment_id}:{packet_bytes}")
            output = SHADOW_OUTPUT_ROOT / assignment_id / "attempts" / SHADOW_ATTEMPT
            assignment = {
                "audit_id": AUDIT_ID,
                "schema_version": "cross-shard-shadow-assignment-v1",
                "epoch_id": SHADOW_EPOCH,
                "assignment_id": assignment_id,
                "attempt_id": SHADOW_ATTEMPT,
                "shadow_pair_id": shadow_pair_id,
                "topology_assertion_pair_id": primary["pair_id"],
                "packet_id": packet_id,
                "packet_ref": packet_ref,
                "packet_sha256": sha(packet_path.read_bytes()),
                "packet_bytes": packet_bytes,
                "owner_domain": domain,
                "orientation": ORIENTATION,
                "original_left_owner_assignment_id": left_id,
                "original_right_owner_assignment_id": right_id,
                "anchor_owner_assignment_id": right_id,
                "comparator_owner_assignment_id": left_id,
                "anchor_slice_index": slice_index,
                "anchor_slice_count": slice_count,
                "anchor_count": len(anchor_refs),
                "anchor_refs": anchor_refs,
                "anchor_refs_digest": packet["anchor_refs_digest"],
                "comparator_count": len(comparator_refs),
                "comparator_refs": comparator_refs,
                "comparator_refs_digest": packet["comparator_refs_digest"],
                "result_schema_ref": "schemas/cross_shard_shadow_result.schema.json",
                "output_directory": output.relative_to(ROOT).as_posix(),
                "model": "gpt-5.6-sol",
                "reasoning_effort": "xhigh",
                "fresh_child_required": True,
                "coverage_credit_before_validation": 0,
            }
            assignments_out.append(assignment)
            packet_registry.append({
                "assignment_id": assignment_id, "shadow_pair_id": shadow_pair_id,
                "topology_assertion_pair_id": primary["pair_id"], "packet_id": packet_id,
                "packet_ref": packet_ref, "packet_sha256": assignment["packet_sha256"],
                "packet_bytes": packet_bytes, "anchor_count": len(anchor_refs),
                "comparator_count": len(comparator_refs), "owner_domain": domain,
                "orientation": ORIENTATION,
            })
            pair_anchor_refs.extend(anchor_refs)
            assignment_ids.append(assignment_id)
        expected_anchors = {row["provisional_feature_ref"] for row in right_rows}
        if offset != len(right_rows) or len(pair_anchor_refs) != len(set(pair_anchor_refs)) or set(pair_anchor_refs) != expected_anchors:
            raise RuntimeError(f"reversed anchor partition mismatch:{shadow_pair_id}")
        pair_registry.append({
            "shadow_pair_id": shadow_pair_id,
            "topology_assertion_pair_id": primary["pair_id"],
            "work_rank": rank,
            "work_product": len(left_rows) * len(right_rows),
            "owner_domain": domain,
            "original_left_owner_assignment_id": left_id,
            "original_right_owner_assignment_id": right_id,
            "anchor_owner_assignment_id": right_id,
            "comparator_owner_assignment_id": left_id,
            "original_left_feature_count": len(left_rows),
            "original_right_feature_count": len(right_rows),
            "shadow_anchor_feature_count": len(right_rows),
            "shadow_comparator_feature_count": len(left_rows),
            "shadow_slice_count": slice_count,
            "shadow_assignment_ids": assignment_ids,
            "shadow_anchor_refs_digest": digest_strings(pair_anchor_refs),
            "shadow_comparator_refs_digest": digest_strings([row["provisional_feature_ref"] for row in left_rows]),
        })

    if sequence != SHADOW_CONCURRENCY or len(assignments_out) != SHADOW_CONCURRENCY:
        raise RuntimeError("shadow assignment count is not exact 40")

    write_jsonl(staging / "manifests/assignment_manifest.jsonl", assignments_out)
    write_jsonl(staging / "manifests/packet_registry.jsonl", packet_registry)
    write_jsonl(staging / "manifests/pair_registry.jsonl", pair_registry)
    write_obj(staging / "schemas/cross_shard_shadow_result.schema.json", result_schema())
    write_obj(staging / "lineage/owner_merge.json", {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-shadow-lineage-v1",
        "owner_active_ref": owner_active_path.relative_to(ROOT).as_posix(),
        "owner_active_sha256": sha(owner_active_path.read_bytes()),
        "owner_coverage_ref": owner_active["coverage_ref"],
        "owner_coverage_sha256": owner_active["coverage_sha256"],
        "owner_provisional_ledger_ref": owner_active["provisional_feature_ledger_ref"],
        "owner_provisional_ledger_sha256": owner_active["provisional_feature_ledger_sha256"],
        "primary_pair_registry_topology_assertion_ref": primary_pair_registry_path.relative_to(ROOT).as_posix(),
        "primary_pair_registry_topology_assertion_sha256": sha(primary_pair_registry_path.read_bytes()),
        "primary_semantic_results_consumed": False,
        "provisional_feature_count": len(ledger),
        "multi_shard_domain_count": len({row["owner_domain"] for row in pair_registry}),
        "shard_pair_count": len(pair_registry),
    })
    write_obj(staging / "protocols/architecture.json", {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-shadow-architecture-v1",
        "objective": "independent reverse-orientation exhaustive comparison for every unordered multi-shard owner pair",
        "orientation": ORIENTATION,
        "assignment_count": SHADOW_CONCURRENCY,
        "shard_pair_count": len(pair_registry),
        "allocation_rule": "four slices for top seven pairs by (-work_product, topology_assertion_pair_id); three for remaining four",
        "semantic_concurrency": SHADOW_CONCURRENCY,
        "temporary_pre_reset_target": TEMPORARY_PRE_RESET_TARGET,
        "hard_cap": HARD_CAP,
        "concurrency_policy_ref": POLICY_REF,
        "concurrency_policy_sha256": POLICY_SHA256,
        "max_packet_bytes_exclusive": MAX_PACKET_BYTES,
        "primary_decisions_or_candidates_consumed": False,
        "candidate_adjudication_required": True,
        "external_research_later_required": True,
        "canonical_plan_writes_authorized": False,
    })
    payload_files = sorted(path for path in staging.rglob("*") if path.is_file())
    write_obj(staging / "authority.json", {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-shadow-authority-v1",
        "epoch_id": SHADOW_EPOCH,
        "status": "CANDIDATE_PENDING_INDEPENDENT_VALIDATION",
        "payload_root_sha256": root_hash(payload_files, staging),
        "owner_coverage_sha256": owner_active["coverage_sha256"],
        "owner_provisional_ledger_sha256": owner_active["provisional_feature_ledger_sha256"],
        "primary_pair_registry_topology_assertion_sha256": sha(primary_pair_registry_path.read_bytes()),
        "concurrency_policy_sha256": POLICY_SHA256,
        "provisional_feature_count": len(ledger),
        "multi_shard_domain_count": len({row["owner_domain"] for row in pair_registry}),
        "shard_pair_count": len(pair_registry),
        "assignment_count": SHADOW_CONCURRENCY,
        "coverage_credit_before_validation": 0,
        "canonical_plan_writes_authorized": False,
    })
    seal_inputs = sorted(path for path in staging.rglob("*") if path.is_file())
    write_obj(staging / "launch_seal.json", {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-shadow-launch-seal-v1",
        "epoch_id": SHADOW_EPOCH,
        "status": "PRELAUNCH_CANDIDATE_ZERO_CREDIT",
        "authority_sha256": sha((staging / "authority.json").read_bytes()),
        "sealed_payload_root_sha256": root_hash(seal_inputs, staging),
        "coverage_credit_before_validation": 0,
    })
    final.parent.mkdir(parents=True, exist_ok=True)
    os.replace(staging, final)
    for assignment in assignments_out:
        (ROOT / assignment["output_directory"]).mkdir(parents=True, exist_ok=True)
    print(json.dumps({
        "status": "built_candidate", "epoch_id": SHADOW_EPOCH,
        "assignments": len(assignments_out), "shard_pairs": len(pair_registry),
        "multi_shard_domains": len({row["owner_domain"] for row in pair_registry}),
        "four_slice_pairs": sum(row["shadow_slice_count"] == 4 for row in pair_registry),
        "three_slice_pairs": sum(row["shadow_slice_count"] == 3 for row in pair_registry),
        "max_packet_bytes": max(row["packet_bytes"] for row in assignments_out),
        "authority_sha256": sha((final / "authority.json").read_bytes()),
        "launch_seal_sha256": sha((final / "launch_seal.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
