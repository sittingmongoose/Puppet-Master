#!/usr/bin/env python3
"""Build the 32-assignment cross-shard same-owner candidate-discovery epoch."""

from __future__ import annotations

import itertools
import json
import math
import os
from collections import defaultdict

from cross_shard_common import (
    CROSS_ATTEMPT, CROSS_CONCURRENCY, CROSS_EPOCH, CROSS_OUTPUT_ROOT, CROSS_ROOT,
    MAX_PACKET_BYTES, canonical_json, digest_strings, load_jsonl, result_schema, write_jsonl, write_obj,
)
from macro_v2_common import AUDIT_ID, ROOT, load_obj, root_hash, sha


def compact_feature(row: dict) -> dict:
    return {
        "provisional_feature_ref": row["provisional_feature_ref"],
        "title": row["title"],
        "summary": row["summary"],
        "feature_kinds": row["feature_kinds"],
        "aliases": row["aliases"],
        "local_feature_count": len(row["local_feature_refs"]),
        "source_documents": row["source_documents"],
        "source_unit_refs": row["source_unit_refs"],
        "risk_level": row["risk_level"],
        "spec_state": row["spec_state"],
        "gap_summary": row["gap_summary"],
        "cross_domain_terms": row["cross_domain_terms"],
        "confidence": row["confidence"],
    }


def main() -> None:
    staging = CROSS_ROOT / "staging" / CROSS_EPOCH
    final = CROSS_ROOT / "frozen" / CROSS_EPOCH
    if staging.exists() or final.exists():
        raise RuntimeError("refusing to overwrite cross-shard epoch")
    owner_active_path = ROOT / "master/owner_merge/live/ACTIVE.json"
    owner_active = load_obj(owner_active_path)
    if owner_active.get("status") != "ACTIVE_OWNER_SHARDS_COMPLETE":
        raise RuntimeError("owner shard merge is not active-complete")
    coverage_path = ROOT / owner_active["coverage_ref"]
    ledger_path = ROOT / owner_active["provisional_feature_ledger_ref"]
    if sha(coverage_path.read_bytes()) != owner_active["coverage_sha256"] or sha(ledger_path.read_bytes()) != owner_active["provisional_feature_ledger_sha256"]:
        raise RuntimeError("owner active binding mismatch")
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

    pair_specs: list[tuple[str, str, str, list[dict], list[dict], int]] = []
    for domain, assignments in sorted(by_domain_assignment.items()):
        assignment_ids = sorted(assignments)
        if len(assignment_ids) == 1:
            continue
        for left_id, right_id in itertools.combinations(assignment_ids, 2):
            slices = 2 if domain == "source_control_workspace_code" else 3
            pair_specs.append((domain, left_id, right_id, assignments[left_id], assignments[right_id], slices))
    if sum(spec[5] for spec in pair_specs) != CROSS_CONCURRENCY:
        raise RuntimeError("cross-shard pair slicing does not produce exact 32 assignments")

    staging.mkdir(parents=True)
    assignments_out: list[dict] = []
    registry: list[dict] = []
    pair_registry: list[dict] = []
    sequence = 0
    for pair_index, (domain, left_id, right_id, left_rows, right_rows, slice_count) in enumerate(pair_specs, 1):
        pair_id = f"CSPAIR-{pair_index:04d}"
        base, extra = divmod(len(left_rows), slice_count)
        offset = 0
        pair_anchor_refs: list[str] = []
        assignment_ids: list[str] = []
        for slice_index in range(1, slice_count + 1):
            sequence += 1
            size = base + (1 if slice_index <= extra else 0)
            anchors = left_rows[offset:offset + size]
            offset += size
            anchor_refs = [row["provisional_feature_ref"] for row in anchors]
            comparator_refs = [row["provisional_feature_ref"] for row in right_rows]
            packet_id = f"CSPKT-{sequence:04d}"
            assignment_id = f"A005CS-{sequence:04d}"
            packet = {
                "audit_id": AUDIT_ID,
                "schema_version": "cross-shard-packet-v1",
                "epoch_id": CROSS_EPOCH,
                "phase": "cross_shard_same_owner_candidate_discovery",
                "pair_id": pair_id,
                "packet_id": packet_id,
                "assignment_id": assignment_id,
                "attempt_id": CROSS_ATTEMPT,
                "owner_domain": domain,
                "left_owner_assignment_id": left_id,
                "right_owner_assignment_id": right_id,
                "anchor_slice_index": slice_index,
                "anchor_slice_count": slice_count,
                "anchor_count": len(anchor_refs),
                "anchor_refs": anchor_refs,
                "anchor_refs_digest": digest_strings(anchor_refs),
                "comparator_count": len(comparator_refs),
                "comparator_refs": comparator_refs,
                "comparator_refs_digest": digest_strings(comparator_refs),
                "anchor_features": [compact_feature(row) for row in anchors],
                "comparator_features": [compact_feature(row) for row in right_rows],
                "result_schema_ref": "schemas/cross_shard_result.schema.json",
                "instructions": {
                    "objective": "For every anchor, exhaustively compare all comparator features from another shard of the same owner domain and identify only true same-feature candidates.",
                    "merge_rule": "A merge candidate must represent the same product feature under the same authority and lifecycle; vocabulary overlap, adjacency, dependency, or shared UI is insufficient.",
                    "distinct_rule": "Use related_but_distinct_refs for plausible near-neighbors separated by authority, lifecycle, consumer, state machine, failure/recovery, security boundary, or user-visible promise.",
                    "coverage_rule": "Emit exactly one decision per anchor and consider every comparator for every anchor; empty candidate and related lists are valid only after the exhaustive comparison.",
                    "scope_rule": "Do not compare within a source shard or across owner domains. Do not browse or read peer results; external research remains mandatory later.",
                    "output_rule": "Write exactly one strict-schema JSON payload in the assigned output directory, then return PMR1.",
                },
            }
            packet_ref = f"packets/{packet_id}.json"
            packet_path = staging / packet_ref
            write_obj(packet_path, packet)
            packet_bytes = len(packet_path.read_bytes())
            if packet_bytes > MAX_PACKET_BYTES:
                raise RuntimeError(f"cross-shard packet exceeds byte cap:{assignment_id}:{packet_bytes}")
            output = CROSS_OUTPUT_ROOT / assignment_id / "attempts" / CROSS_ATTEMPT
            assignment = {
                "audit_id": AUDIT_ID,
                "schema_version": "cross-shard-assignment-v1",
                "epoch_id": CROSS_EPOCH,
                "assignment_id": assignment_id,
                "attempt_id": CROSS_ATTEMPT,
                "pair_id": pair_id,
                "packet_id": packet_id,
                "packet_ref": packet_ref,
                "packet_sha256": sha(packet_path.read_bytes()),
                "packet_bytes": packet_bytes,
                "owner_domain": domain,
                "left_owner_assignment_id": left_id,
                "right_owner_assignment_id": right_id,
                "anchor_slice_index": slice_index,
                "anchor_slice_count": slice_count,
                "anchor_count": len(anchor_refs),
                "anchor_refs": anchor_refs,
                "anchor_refs_digest": packet["anchor_refs_digest"],
                "comparator_count": len(comparator_refs),
                "comparator_refs": comparator_refs,
                "comparator_refs_digest": packet["comparator_refs_digest"],
                "result_schema_ref": "schemas/cross_shard_result.schema.json",
                "output_directory": output.relative_to(ROOT).as_posix(),
                "model": "gpt-5.6-sol",
                "reasoning_effort": "xhigh",
                "fresh_child_required": True,
                "coverage_credit_before_validation": 0,
            }
            assignments_out.append(assignment)
            registry.append({
                "assignment_id": assignment_id, "pair_id": pair_id, "packet_id": packet_id,
                "packet_ref": packet_ref, "packet_sha256": assignment["packet_sha256"],
                "packet_bytes": packet_bytes, "anchor_count": len(anchor_refs),
                "comparator_count": len(comparator_refs), "owner_domain": domain,
            })
            pair_anchor_refs.extend(anchor_refs)
            assignment_ids.append(assignment_id)
        if offset != len(left_rows) or len(pair_anchor_refs) != len(set(pair_anchor_refs)) or set(pair_anchor_refs) != {row["provisional_feature_ref"] for row in left_rows}:
            raise RuntimeError(f"pair anchor partition mismatch:{pair_id}")
        pair_registry.append({
            "pair_id": pair_id, "owner_domain": domain,
            "left_owner_assignment_id": left_id, "right_owner_assignment_id": right_id,
            "left_feature_count": len(left_rows), "right_feature_count": len(right_rows),
            "anchor_assignment_ids": assignment_ids,
            "left_refs_digest": digest_strings(pair_anchor_refs),
            "right_refs_digest": digest_strings([row["provisional_feature_ref"] for row in right_rows]),
        })
    if len(assignments_out) != CROSS_CONCURRENCY:
        raise RuntimeError("cross-shard assignment count is not exact 32")

    write_jsonl(staging / "manifests/assignment_manifest.jsonl", assignments_out)
    write_jsonl(staging / "manifests/packet_registry.jsonl", registry)
    write_jsonl(staging / "manifests/pair_registry.jsonl", pair_registry)
    write_obj(staging / "schemas/cross_shard_result.schema.json", result_schema())
    lineage = {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-lineage-v1",
        "owner_active_ref": owner_active_path.relative_to(ROOT).as_posix(),
        "owner_active_sha256": sha(owner_active_path.read_bytes()),
        "owner_coverage_ref": owner_active["coverage_ref"],
        "owner_coverage_sha256": owner_active["coverage_sha256"],
        "owner_provisional_ledger_ref": owner_active["provisional_feature_ledger_ref"],
        "owner_provisional_ledger_sha256": owner_active["provisional_feature_ledger_sha256"],
        "provisional_feature_count": len(ledger),
        "multi_shard_domain_count": len({spec[0] for spec in pair_specs}),
        "shard_pair_count": len(pair_specs),
    }
    write_obj(staging / "lineage/owner_merge.json", lineage)
    write_obj(staging / "protocols/architecture.json", {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-architecture-v1",
        "objective": "exhaustive anchor-to-comparator comparison for every unordered pair of shards within each multi-shard owner domain",
        "assignment_count": len(assignments_out),
        "shard_pair_count": len(pair_specs),
        "semantic_concurrency": CROSS_CONCURRENCY,
        "max_packet_bytes": MAX_PACKET_BYTES,
        "second_independent_shadow_wave_required": True,
        "candidate_adjudication_required": True,
        "external_research_later_required": True,
        "canonical_plan_writes_authorized": False,
    })
    payload_files = sorted(path for path in staging.rglob("*") if path.is_file())
    write_obj(staging / "authority.json", {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-authority-v1",
        "epoch_id": CROSS_EPOCH,
        "status": "CANDIDATE_PENDING_INDEPENDENT_VALIDATION",
        "payload_root_sha256": root_hash(payload_files, staging),
        "owner_coverage_sha256": owner_active["coverage_sha256"],
        "provisional_feature_count": len(ledger),
        "shard_pair_count": len(pair_specs),
        "assignment_count": len(assignments_out),
        "coverage_credit_before_validation": 0,
        "canonical_plan_writes_authorized": False,
    })
    seal_inputs = sorted(path for path in staging.rglob("*") if path.is_file())
    write_obj(staging / "launch_seal.json", {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-launch-seal-v1",
        "epoch_id": CROSS_EPOCH,
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
        "status": "built_candidate", "epoch_id": CROSS_EPOCH,
        "assignments": len(assignments_out), "shard_pairs": len(pair_specs),
        "multi_shard_domains": len({spec[0] for spec in pair_specs}),
        "max_packet_bytes": max(row["packet_bytes"] for row in assignments_out),
        "max_anchor_count": max(row["anchor_count"] for row in assignments_out),
        "max_comparator_count": max(row["comparator_count"] for row in assignments_out),
        "authority_sha256": sha((final / "authority.json").read_bytes()),
        "launch_seal_sha256": sha((final / "launch_seal.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
