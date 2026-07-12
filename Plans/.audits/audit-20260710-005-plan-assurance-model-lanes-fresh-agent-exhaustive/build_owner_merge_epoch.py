#!/usr/bin/env python3
"""Build the one-wave, 24-shard owner-domain merge epoch."""

from __future__ import annotations

import json
import math
import os
from collections import defaultdict

from feature_catalog_common import OWNER_DOMAINS
from macro_v2_common import AUDIT_ID, ROOT, load_obj, root_hash, sha
from owner_merge_common import (
    MAX_OWNER_CONCURRENCY,
    MAX_PACKET_BYTES,
    MAX_SHARD_FEATURES,
    OWNER_ATTEMPT,
    OWNER_EPOCH,
    OWNER_OUTPUT_ROOT,
    OWNER_ROOT,
    canonical_json,
    digest_strings,
    load_jsonl,
    owner_merge_result_schema,
    write_jsonl,
    write_obj,
)


def compact_feature(row: dict) -> dict:
    return {
        "local_feature_ref": row["local_feature_ref"],
        "title": row["title"],
        "summary": row["summary"],
        "feature_kind": row["feature_kind"],
        "secondary_domains": row["secondary_domains"],
        "aliases": row["aliases"],
        "atom_count": len(row["atom_ids"]),
        "atom_ids_digest": digest_strings(row["atom_ids"]),
        "source_documents": row["source_documents"],
        "source_unit_refs": row["source_unit_refs"],
        "risk_level": row["risk_level"],
        "spec_state": row["spec_state"],
        "gap_summary": row["gap_summary"],
        "cross_packet_terms": row["cross_packet_terms"],
        "confidence": row["confidence"],
        "research_obligation_count": len(row["research_questions"]),
        "scenario_obligation_count": len(row["scenario_requirements"]),
    }


def main() -> None:
    staging = OWNER_ROOT / "staging" / OWNER_EPOCH
    final = OWNER_ROOT / "frozen" / OWNER_EPOCH
    if staging.exists() or final.exists():
        raise RuntimeError("refusing to overwrite owner-merge epoch")
    catalog_active_path = ROOT / "master/feature_catalog/live/ACTIVE.json"
    if not catalog_active_path.is_file():
        raise RuntimeError("complete feature catalog is not active")
    catalog_active = load_obj(catalog_active_path)
    if catalog_active.get("status") != "ACTIVE_COMPLETE":
        raise RuntimeError("feature catalog active pointer is incomplete")
    coverage_path = ROOT / catalog_active["coverage_ref"]
    ledger_path = ROOT / catalog_active["local_feature_ledger_ref"]
    if sha(coverage_path.read_bytes()) != catalog_active["coverage_sha256"] or sha(ledger_path.read_bytes()) != catalog_active["local_feature_ledger_sha256"]:
        raise RuntimeError("feature catalog active binding mismatch")
    coverage = load_obj(coverage_path)
    if coverage.get("complete") is not True or coverage.get("pending_atoms") != 0 or coverage.get("local_feature_count") != 4131:
        raise RuntimeError("feature catalog coverage is not complete")
    independent_post_path = ROOT / "master/feature_catalog/validation/catalog-batch-0001/independent-postcheckpoint.json"
    if not independent_post_path.is_file():
        raise RuntimeError("feature catalog independent postcheckpoint is missing")
    independent_post = load_obj(independent_post_path)
    if independent_post.get("status") != "pass" or independent_post.get("errors") != []:
        raise RuntimeError("feature catalog independent postcheckpoint failed")
    ledger = load_jsonl(ledger_path)
    if len(ledger) != coverage["local_feature_count"] or len({row["local_feature_ref"] for row in ledger}) != len(ledger):
        raise RuntimeError("local feature ledger cardinality mismatch")
    by_domain: dict[str, list[dict]] = defaultdict(list)
    for row in ledger:
        if row["owner_domain"] not in OWNER_DOMAINS:
            raise RuntimeError(f"unknown owner domain:{row['owner_domain']}")
        by_domain[row["owner_domain"]].append(row)
    if set(by_domain) != set(OWNER_DOMAINS):
        raise RuntimeError("owner domain coverage mismatch")
    for rows in by_domain.values():
        rows.sort(key=lambda row: row["local_feature_ref"])

    shard_rows: list[tuple[str, int, int, list[dict]]] = []
    for domain in OWNER_DOMAINS:
        rows = by_domain[domain]
        shard_count = math.ceil(len(rows) / MAX_SHARD_FEATURES)
        base, extra = divmod(len(rows), shard_count)
        offset = 0
        for shard_index in range(1, shard_count + 1):
            size = base + (1 if shard_index <= extra else 0)
            selected = rows[offset:offset + size]
            offset += size
            shard_rows.append((domain, shard_index, shard_count, selected))
        if offset != len(rows):
            raise RuntimeError(f"domain sharding mismatch:{domain}")
    if len(shard_rows) != MAX_OWNER_CONCURRENCY:
        raise RuntimeError(f"owner merge must be exactly one 24-shard wave:{len(shard_rows)}")

    staging.mkdir(parents=True)
    assignments: list[dict] = []
    registry: list[dict] = []
    assigned_refs: list[str] = []
    for sequence, (domain, shard_index, shard_count, rows) in enumerate(shard_rows, 1):
        packet_id = f"OMPKT-{sequence:04d}"
        assignment_id = f"A005OM-{sequence:04d}"
        local_refs = [row["local_feature_ref"] for row in rows]
        packet = {
            "audit_id": AUDIT_ID,
            "schema_version": "owner-merge-packet-v1",
            "epoch_id": OWNER_EPOCH,
            "phase": "owner_domain_shard_merge",
            "packet_id": packet_id,
            "assignment_id": assignment_id,
            "attempt_id": OWNER_ATTEMPT,
            "owner_domain": domain,
            "domain_shard_index": shard_index,
            "domain_shard_count": shard_count,
            "local_feature_count": len(local_refs),
            "local_feature_refs": local_refs,
            "local_feature_refs_digest": digest_strings(local_refs),
            "features": [compact_feature(row) for row in rows],
            "result_schema_ref": "schemas/owner_merge_result.schema.json",
            "instructions": {
                "objective": "Deduplicate true synonyms within this one owner domain while preserving distinct lifecycles, authorities, consumers, states, failures, gaps, and explicit non-gaps.",
                "membership_rule": "Every assigned local_feature_ref must have exactly one membership and appear in exactly one provisional_feature.local_feature_refs list.",
                "merge_rule": "Merge only when concepts are the same product feature under the same authority/lifecycle. Shared vocabulary or adjacency is not enough.",
                "split_rule": "Keep distinct features when authority, lifecycle, consumer, state machine, failure/recovery, security boundary, or user-visible promise differs.",
                "domain_rule": f"All provisional features must retain owner_domain={domain}; cross-domain concepts become cross_domain_terms or relationships, never merges.",
                "provenance_rule": "Source documents and source-unit refs in each provisional feature must equal the union from its member local features.",
                "research_lineage_rule": "Research/scenario obligations remain in the immutable local-feature ledger and will be mechanically unioned after domain reduction; do not invent external evidence here.",
                "output_rule": "Write exactly one strict-schema JSON payload in the assigned output directory, then return PMR1.",
            },
        }
        packet_ref = f"packets/{packet_id}.json"
        packet_path = staging / packet_ref
        write_obj(packet_path, packet)
        if len(packet_path.read_bytes()) > MAX_PACKET_BYTES:
            raise RuntimeError(f"owner packet exceeds byte cap:{assignment_id}:{len(packet_path.read_bytes())}")
        output = OWNER_OUTPUT_ROOT / assignment_id / "attempts" / OWNER_ATTEMPT
        assignment = {
            "audit_id": AUDIT_ID,
            "schema_version": "owner-merge-assignment-v1",
            "epoch_id": OWNER_EPOCH,
            "assignment_id": assignment_id,
            "attempt_id": OWNER_ATTEMPT,
            "packet_id": packet_id,
            "packet_ref": packet_ref,
            "packet_sha256": sha(packet_path.read_bytes()),
            "packet_bytes": len(packet_path.read_bytes()),
            "owner_domain": domain,
            "domain_shard_index": shard_index,
            "domain_shard_count": shard_count,
            "local_feature_count": len(local_refs),
            "local_feature_refs": local_refs,
            "local_feature_refs_digest": packet["local_feature_refs_digest"],
            "result_schema_ref": "schemas/owner_merge_result.schema.json",
            "output_directory": output.relative_to(ROOT).as_posix(),
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "fresh_child_required": True,
            "coverage_credit_before_validation": 0,
        }
        assignments.append(assignment)
        registry.append({
            "assignment_id": assignment_id,
            "packet_id": packet_id,
            "owner_domain": domain,
            "packet_ref": packet_ref,
            "packet_sha256": assignment["packet_sha256"],
            "packet_bytes": assignment["packet_bytes"],
            "local_feature_count": len(local_refs),
        })
        assigned_refs.extend(local_refs)
    ledger_refs = [row["local_feature_ref"] for row in ledger]
    if len(assigned_refs) != len(set(assigned_refs)) or set(assigned_refs) != set(ledger_refs):
        raise RuntimeError("owner packets do not exactly partition local features")

    write_jsonl(staging / "manifests/assignment_manifest.jsonl", assignments)
    write_jsonl(staging / "manifests/packet_registry.jsonl", registry)
    write_obj(staging / "schemas/owner_merge_result.schema.json", owner_merge_result_schema())
    lineage = {
        "audit_id": AUDIT_ID,
        "schema_version": "owner-merge-lineage-v1",
        "catalog_active_ref": catalog_active_path.relative_to(ROOT).as_posix(),
        "catalog_active_sha256": sha(catalog_active_path.read_bytes()),
        "catalog_coverage_ref": catalog_active["coverage_ref"],
        "catalog_coverage_sha256": catalog_active["coverage_sha256"],
        "local_feature_ledger_ref": catalog_active["local_feature_ledger_ref"],
        "local_feature_ledger_sha256": catalog_active["local_feature_ledger_sha256"],
        "independent_catalog_postcheckpoint_ref": independent_post_path.relative_to(ROOT).as_posix(),
        "independent_catalog_postcheckpoint_sha256": sha(independent_post_path.read_bytes()),
        "local_feature_count": len(ledger),
        "local_feature_refs_digest": digest_strings(ledger_refs),
        "owner_domain_count": len(by_domain),
    }
    write_obj(staging / "lineage/catalog.json", lineage)
    write_obj(staging / "protocols/architecture.json", {
        "audit_id": AUDIT_ID,
        "schema_version": "owner-merge-architecture-v1",
        "objective": "one 24-worker same-owner shard wave followed by one 16-owner reduction wave",
        "local_feature_count": len(ledger),
        "owner_domain_count": len(by_domain),
        "shard_assignment_count": len(assignments),
        "max_features_per_shard": MAX_SHARD_FEATURES,
        "max_packet_bytes": MAX_PACKET_BYTES,
        "cross_domain_merges_forbidden": True,
        "exact_membership_required": True,
        "later_universal_external_research_required": True,
        "canonical_plan_writes_authorized": False,
    })
    payload_files = sorted(path for path in staging.rglob("*") if path.is_file())
    authority = {
        "audit_id": AUDIT_ID,
        "schema_version": "owner-merge-authority-v1",
        "epoch_id": OWNER_EPOCH,
        "status": "CANDIDATE_PENDING_INDEPENDENT_VALIDATION",
        "payload_root_sha256": root_hash(payload_files, staging),
        "catalog_coverage_sha256": catalog_active["coverage_sha256"],
        "local_feature_count": len(ledger),
        "local_feature_refs_digest": lineage["local_feature_refs_digest"],
        "owner_domain_count": len(by_domain),
        "assignment_count": len(assignments),
        "coverage_credit_before_validation": 0,
        "canonical_plan_writes_authorized": False,
    }
    write_obj(staging / "authority.json", authority)
    seal_inputs = sorted(path for path in staging.rglob("*") if path.is_file())
    write_obj(staging / "launch_seal.json", {
        "audit_id": AUDIT_ID,
        "schema_version": "owner-merge-launch-seal-v1",
        "epoch_id": OWNER_EPOCH,
        "status": "PRELAUNCH_CANDIDATE_ZERO_CREDIT",
        "authority_sha256": sha((staging / "authority.json").read_bytes()),
        "sealed_payload_root_sha256": root_hash(seal_inputs, staging),
        "catalog_coverage_sha256": catalog_active["coverage_sha256"],
        "coverage_credit_before_validation": 0,
    })
    final.parent.mkdir(parents=True, exist_ok=True)
    os.replace(staging, final)
    for assignment in assignments:
        (ROOT / assignment["output_directory"]).mkdir(parents=True, exist_ok=True)
    print(json.dumps({
        "status": "built_candidate",
        "epoch_id": OWNER_EPOCH,
        "local_features": len(ledger),
        "owner_domains": len(by_domain),
        "assignments": len(assignments),
        "max_shard_features": max(row["local_feature_count"] for row in assignments),
        "max_packet_bytes": max(row["packet_bytes"] for row in assignments),
        "authority_sha256": sha((final / "authority.json").read_bytes()),
        "launch_seal_sha256": sha((final / "launch_seal.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
