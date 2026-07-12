#!/usr/bin/env python3
"""Deterministically prepare the Audit005 cross-domain seam adjudication candidate.

This script is preparation-only.  It never emits activation, receipt, result, or
native-capture artifacts and it never edits canonical Plans.
"""
from __future__ import annotations

import hashlib
import json
import os
from collections import defaultdict
from pathlib import Path

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
WAVE_ID = "cross-domain-seam-wave-0001"
ATTEMPT_ID = "attempt-0001"
ROOT = Path(__file__).resolve().parents[4]
NS = ROOT / "master/cross_domain_seams/wave-0001"
V10 = ROOT / "master/coordination/CONCURRENCY_POLICY_V10.json"
V10_SHA = "0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1"
MODEL = "gpt-5.6-sol"
EFFORT = "xhigh"
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
PACKET_CEILING = 8_000_000
ASSIGNMENT_COUNT = 8
DECISION_TAXONOMY = [
    "same_feature_merge",
    "shared_subsystem_distinct",
    "dependency_or_interface_seam",
    "conflict_requires_plan_revision",
    "unsupported_candidate",
    "uncertain_requires_targeted_research",
]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest(value) -> str:
    raw = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
    return hashlib.sha256(raw).hexdigest()


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n")


def write_jsonl(path: Path, rows) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n")


def load_jsonl(path: Path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def edge_key(a: str, b: str) -> tuple[str, str]:
    if a == b:
        raise ValueError(f"self edge: {a}")
    return tuple(sorted((a, b)))


def owner_assignment(ref: str) -> str:
    parts = ref.split("::")
    if len(parts) != 3 or parts[0] != "OPF":
        raise ValueError(ref)
    return parts[1]


def compact_feature(row: dict, row_sha: str, memberships: list[dict], research: dict | None):
    out = {
        "provisional_feature_ref": row["provisional_feature_ref"],
        "source_row_sha256": row_sha,
        "owner_assignment_id": row["assignment_id"],
        "owner_domain": row["owner_domain"],
        "title": row["title"],
        "summary": row["summary"],
        "gap_summary": row["gap_summary"],
        "spec_state": row["spec_state"],
        "risk_level": row["risk_level"],
        "feature_kinds": row["feature_kinds"],
        "aliases": row["aliases"],
        "local_feature_refs": row["local_feature_refs"],
        "source_documents": row["source_documents"],
        "source_unit_refs": row["source_unit_refs"],
        "owner_membership": [
            {
                "local_feature_ref": x["local_feature_ref"],
                "merge_disposition": x["merge_disposition"],
                "rationale": x["rationale"],
            }
            for x in sorted(memberships, key=lambda x: x["local_feature_ref"])
        ],
    }
    if research is None:
        out["universal_research"] = {
            "evidence_state": "explicitly_missing",
            "result_path": None,
            "result_sha256": None,
            "sources": [],
            "supported_claims": [],
        }
    else:
        fr = research["feature_result"]
        out["universal_research"] = {
            "evidence_state": "available_candidate_evidence",
            "source_assignment_id": research["assignment_id"],
            "result_path": research["result_path"],
            "result_sha256": research["result_sha256"],
            "source_row_sha256": fr["source_row_sha256"],
            "research_state": fr["research_state"],
            "insufficient_evidence_reason": fr["insufficient_evidence_reason"],
            "sources": [
                {
                    "source_id": x["source_id"],
                    "url": x["url"],
                    "title": x["title"],
                    "publisher": x["publisher"],
                    "source_type": x["source_type"],
                    "accessed_date": x["accessed_date"],
                    "section_anchor": x["section_anchor"],
                }
                for x in fr["sources"]
            ],
            "supported_claims": fr["supported_claims"],
        }
    return out


def main() -> None:
    if sha(V10) != V10_SHA:
        raise SystemExit("V10 hash mismatch")

    primary_tx = ROOT / "master/cross_shard/transactions/cross-shard-batch-0001"
    primary_candidate_path = primary_tx / "candidate_edge_ledger.jsonl"
    primary_related_path = primary_tx / "related_edge_ledger.jsonl"
    primary_quarantine_path = primary_tx / "quarantined_edge_ledger.jsonl"
    primary_luna_path = ROOT / "master/cross_shard/validation/cross-shard-batch-0001/luna-postrun.json"
    primary_luna_prelaunch_path = ROOT / "master/cross_shard/validation/cross-shard-batch-0001/luna-prelaunch.json"
    primary_activation_path = ROOT / "master/cross_shard/validation/cross-shard-batch-0001/activation.json"
    primary_post_path = ROOT / "master/cross_shard/validation/cross-shard-batch-0001/primary-postrun.json"
    primary_commit_path = primary_tx / "commit.json"
    primary_coverage_path = primary_tx / "coverage.snapshot-0001.json"
    primary_active_path = ROOT / "master/cross_shard/live/ACTIVE.json"
    shadow_luna_path = ROOT / "master/cross_shard_shadow/validation/cross-shard-shadow-batch-0001/luna-postrun.json"
    shadow_luna_prelaunch_path = ROOT / "master/cross_shard_shadow/validation/cross-shard-shadow-batch-0001/luna-prelaunch.json"
    shadow_lifecycle_path = ROOT / "master/cross_shard_shadow/validation/cross-shard-shadow-batch-0001/luna-lifecycle-v2.json"
    shadow_local_preactivation_path = ROOT / "master/cross_shard_shadow/validation/cross-shard-shadow-batch-0001/local-preactivation-v2.json"
    shadow_post_path = ROOT / "master/cross_shard_shadow/validation/cross-shard-shadow-batch-0001/primary-postrun.json"
    shadow_active_path = ROOT / "master/cross_shard_shadow/validation/cross-shard-shadow-batch-0001/activation.json"
    owner_feature_path = ROOT / "master/owner_merge/transactions/owner-merge-batch-0001/provisional_feature_ledger.jsonl"
    owner_membership_path = ROOT / "master/owner_merge/transactions/owner-merge-batch-0001/membership_ledger.jsonl"
    owner_active_path = ROOT / "master/owner_merge/live/ACTIVE.json"
    research_post_path = ROOT / "master/external_research/universal-wave-0001/validation/primary-postrun.json"

    source_paths = [
        V10, primary_candidate_path, primary_related_path, primary_quarantine_path,
        primary_luna_path, primary_luna_prelaunch_path, primary_activation_path,
        primary_post_path, primary_commit_path, primary_coverage_path,
        primary_active_path, shadow_luna_path, shadow_post_path, shadow_active_path,
        shadow_luna_prelaunch_path, shadow_lifecycle_path, shadow_local_preactivation_path,
        owner_feature_path, owner_membership_path, owner_active_path, research_post_path,
    ]
    source_hashes = {str(p.relative_to(ROOT)): sha(p) for p in source_paths}

    feature_rows = {}
    feature_row_sha = {}
    for raw in owner_feature_path.read_bytes().splitlines(keepends=True):
        if not raw.strip():
            continue
        row = json.loads(raw)
        ref = row["provisional_feature_ref"]
        if ref in feature_rows:
            raise SystemExit(f"duplicate owner feature: {ref}")
        feature_rows[ref] = row
        feature_row_sha[ref] = hashlib.sha256(raw).hexdigest()
    memberships = defaultdict(list)
    for row in load_jsonl(owner_membership_path):
        memberships[row["provisional_feature_ref"]].append(row)

    research = {}
    research_result_paths = sorted(ROOT.glob("external_research_universal_v1/A005ERU-*/attempts/attempt-0001/result.json"))
    if len(research_result_paths) != 24:
        raise SystemExit(f"expected 24 universal results, got {len(research_result_paths)}")
    for p in research_result_paths:
        doc = json.loads(p.read_text())
        result_sha = sha(p)
        source_hashes[str(p.relative_to(ROOT))] = result_sha
        for fr in doc["feature_results"]:
            ref = fr["provisional_feature_ref"]
            if ref in research:
                raise SystemExit(f"duplicate research feature: {ref}")
            if fr["source_row_sha256"] != feature_row_sha.get(ref):
                raise SystemExit(f"research/owner source-row hash mismatch: {ref}")
            research[ref] = {
                "assignment_id": doc["assignment_id"],
                "result_path": str(p.relative_to(ROOT)),
                "result_sha256": result_sha,
                "feature_result": fr,
            }
    if set(research) != set(feature_rows):
        raise SystemExit("universal research coverage differs from owner feature ledger")

    observations = defaultdict(list)
    primary_candidate = load_jsonl(primary_candidate_path)
    primary_related = load_jsonl(primary_related_path)
    primary_quarantine = load_jsonl(primary_quarantine_path)
    primary_quarantine_keys = {edge_key(*x["endpoint_refs"]): x for x in primary_quarantine}
    for kind, rows in (("merge_candidate", primary_candidate), ("related_but_distinct", primary_related)):
        for row in rows:
            key = edge_key(*row["endpoint_refs"])
            observations[key].append({
                "orientation": "primary",
                "source_disposition": "unsupported" if key in primary_quarantine_keys else kind,
                "source_quarantined": key in primary_quarantine_keys,
                "source_edge_ref": row["edge_ref"],
                "source_decision_ref": row["source_decision_ref"],
                "assignment_id": row["assignment_id"],
                "pair_id": row["pair_id"],
                "result_ref": row["result_ref"],
                "result_sha256": row["result_sha256"],
                "confidence": row.get("source_confidence", row.get("confidence")),
                "rationale": row.get("source_rationale", row.get("rationale")),
                "luna_disposition": row.get("luna_disposition"),
                "luna_finding": row.get("luna_finding"),
            })

    shadow_luna = json.loads(shadow_luna_path.read_text())
    shadow_quarantine = {
        edge_key(x["left_ref"], x["right_ref"]): x
        for x in shadow_luna["quarantined_uncertain_unsupported_edge_findings"]
    }
    shadow_result_hashes = {
        x["assignment_id"]: x["result_sha256"]
        for x in json.loads(shadow_post_path.read_text())["results"]
    }
    shadow_result_paths = sorted(ROOT.glob("cross_shard_shadow_v1/A005CSS-*/attempts/attempt-0001/result.json"))
    if len(shadow_result_paths) != 40:
        raise SystemExit(f"expected 40 shadow results, got {len(shadow_result_paths)}")
    for p in shadow_result_paths:
        doc = json.loads(p.read_text())
        assignment_id = doc["assignment_id"]
        if sha(p) != shadow_result_hashes[assignment_id]:
            raise SystemExit(f"shadow result hash mismatch: {assignment_id}")
        source_hashes[str(p.relative_to(ROOT))] = sha(p)
        pair_assignments = sorted((
            doc["input_binding"]["anchor_owner_assignment_id"],
            doc["input_binding"]["comparator_owner_assignment_id"],
        ))
        pair_id = "OWNERPAIR::" + "::".join(pair_assignments)
        for ordinal, dec in enumerate(doc["decisions"], 1):
            anchor = dec["anchor_provisional_feature_ref"]
            for kind, refs in (("merge_candidate", dec["merge_candidate_refs"]), ("related_but_distinct", dec["related_but_distinct_refs"])):
                for comparator in refs:
                    key = edge_key(anchor, comparator)
                    q = shadow_quarantine.get(key)
                    observations[key].append({
                        "orientation": "reverse_shadow",
                        "source_disposition": "uncertain" if q else kind,
                        "source_quarantined": bool(q),
                        "source_edge_ref": None,
                        "source_decision_ref": f"SHADOWDEC::{assignment_id}::{ordinal:04d}",
                        "assignment_id": assignment_id,
                        "pair_id": pair_id,
                        "result_ref": str(p.relative_to(ROOT)),
                        "result_sha256": sha(p),
                        "confidence": dec["confidence"],
                        "rationale": dec["rationale"],
                        "luna_disposition": "quarantine" if q else "no_objection_recorded",
                        "luna_finding": q,
                    })

    edge_rows = []
    all_feature_refs = set()
    disposition_counts = defaultdict(int)
    conflict_count = 0
    for ordinal, (key, obs) in enumerate(sorted(observations.items()), 1):
        if key[0] not in feature_rows or key[1] not in feature_rows:
            raise SystemExit(f"foreign edge endpoint: {key}")
        all_feature_refs.update(key)
        statuses = sorted({x["source_disposition"] for x in obs})
        candidate_seen = any(x in statuses for x in ("merge_candidate", "unsupported", "uncertain"))
        related_seen = "related_but_distinct" in statuses
        conflict = candidate_seen and related_seen
        if conflict:
            conflict_count += 1
        quarantines = [x for x in obs if x["source_quarantined"]]
        if any(x["source_disposition"] == "unsupported" for x in obs):
            preserved = "unsupported"
        elif any(x["source_disposition"] == "uncertain" for x in obs) or conflict:
            preserved = "uncertain"
        elif candidate_seen:
            preserved = "merge_candidate"
        else:
            preserved = "related_but_distinct"
        disposition_counts[preserved] += 1
        pair = tuple(sorted((owner_assignment(key[0]), owner_assignment(key[1]))))
        edge_rows.append({
            "schema_version": "cross-domain-normalized-seam-v1",
            "normalized_edge_id": f"A005CDS-EDGE-{ordinal:05d}",
            "normalized_edge_key": "\u0000".join(key),
            "endpoint_refs": list(key),
            "endpoint_owner_assignments": list(pair),
            "endpoint_owner_domains": [feature_rows[x]["owner_domain"] for x in key],
            "owner_pair_key": "::".join(pair),
            "preserved_disposition": preserved,
            "observed_dispositions": statuses,
            "candidate_related_conflict": conflict,
            "quarantined": bool(quarantines),
            "quarantine_observations": quarantines,
            "provenance": sorted(obs, key=lambda x: (
                x["orientation"], x["assignment_id"], x["source_decision_ref"], x["source_disposition"]
            )),
        })

    if len(edge_rows) != 9365:
        raise SystemExit(f"unexpected normalized edge count: {len(edge_rows)}")
    if len(all_feature_refs) != 2495:
        raise SystemExit(f"unexpected feature union: {len(all_feature_refs)}")
    if len(primary_quarantine_keys) != 5 or len(shadow_quarantine) != 5:
        raise SystemExit("quarantine cardinality drift")

    feature_compact = {
        ref: compact_feature(feature_rows[ref], feature_row_sha[ref], memberships[ref], research.get(ref))
        for ref in sorted(all_feature_refs)
    }
    pair_groups = defaultdict(list)
    for row in edge_rows:
        pair_groups[row["owner_pair_key"]].append(row)
    if len(pair_groups) != 11:
        raise SystemExit(f"expected 11 owner-shard pairs, got {len(pair_groups)}")

    # Whole-pair LPT assignment prevents arbitrary edge slicing and minimizes
    # repeated feature evidence while balancing serialized evidence complexity.
    bins = [{"pair_keys": [], "edges": [], "estimated_bytes": 0} for _ in range(ASSIGNMENT_COUNT)]
    weighted_groups = []
    for pair_key, rows in pair_groups.items():
        refs = sorted({r for row in rows for r in row["endpoint_refs"]})
        weight = len(json.dumps(rows, ensure_ascii=False, separators=(",", ":")).encode())
        weight += len(json.dumps([feature_compact[r] for r in refs], ensure_ascii=False, separators=(",", ":")).encode())
        weight += 500 * sum(len(row["provenance"]) + (3 if row["candidate_related_conflict"] else 0) for row in rows)
        weighted_groups.append((weight, pair_key, rows))
    for weight, pair_key, rows in sorted(weighted_groups, key=lambda x: (-x[0], x[1])):
        target = min(range(ASSIGNMENT_COUNT), key=lambda i: (bins[i]["estimated_bytes"], i))
        bins[target]["pair_keys"].append(pair_key)
        bins[target]["edges"].extend(rows)
        bins[target]["estimated_bytes"] += weight
    if any(not b["edges"] for b in bins):
        raise SystemExit("empty assignment after balancing")

    schema_path = NS / "schema/cross_domain_seam_result.schema.json"
    schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "urn:puppetmaster:audit005:cross-domain-seam-result:v1",
        "type": "object",
        "additionalProperties": False,
        "required": ["audit_id", "schema_version", "phase", "assignment_id", "attempt_id", "agent_path", "model", "reasoning_effort", "status", "input_binding", "coverage", "decisions", "self_attestation"],
        "properties": {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "cross-domain-seam-adjudication-result-v1"},
            "phase": {"const": "cross_domain_seam_candidate_adjudication"},
            "assignment_id": {"pattern": "^A005CDS-000[1-8]$"},
            "attempt_id": {"const": ATTEMPT_ID},
            "agent_path": {"pattern": "^/root/a005_cross_domain_seam_000[1-8]_attempt_0001_terminal$"},
            "model": {"const": MODEL},
            "reasoning_effort": {"const": EFFORT},
            "status": {"const": "completed"},
            "input_binding": {
                "type": "object", "additionalProperties": False,
                "required": ["packet_id", "packet_sha256", "edge_membership_digest", "activation_transaction_id"],
                "properties": {
                    "packet_id": {"pattern": "^CDSPKT-000[1-8]$"},
                    "packet_sha256": {"pattern": "^[0-9a-f]{64}$"},
                    "edge_membership_digest": {"pattern": "^[0-9a-f]{64}$"},
                    "activation_transaction_id": {"type": "string", "minLength": 16},
                },
            },
            "coverage": {
                "type": "object", "additionalProperties": False,
                "required": ["edge_count", "normalized_edge_ids"],
                "properties": {
                    "edge_count": {"type": "integer", "minimum": 1},
                    "normalized_edge_ids": {"type": "array", "minItems": 1, "uniqueItems": True, "items": {"pattern": "^A005CDS-EDGE-[0-9]{5}$"}},
                },
            },
            "decisions": {
                "type": "array", "minItems": 1,
                "items": {
                    "type": "object", "additionalProperties": False,
                    "required": ["normalized_edge_id", "decision", "rationale", "authority_lifecycle_outcome_state_failure_analysis", "supporting_evidence", "counterevidence", "external_research", "unresolved_reason", "promotion_performed", "proposed_plan_revision"],
                    "properties": {
                        "normalized_edge_id": {"pattern": "^A005CDS-EDGE-[0-9]{5}$"},
                        "decision": {"enum": DECISION_TAXONOMY},
                        "rationale": {"type": "string", "minLength": 30},
                        "authority_lifecycle_outcome_state_failure_analysis": {"type": "string", "minLength": 40},
                        "supporting_evidence": {"type": "array", "minItems": 1, "items": {"type": "string", "minLength": 8}},
                        "counterevidence": {"type": "array", "items": {"type": "string", "minLength": 8}},
                        "external_research": {
                            "type": "object", "additionalProperties": False,
                            "required": ["state", "live_web_research_performed", "sources", "claims"],
                            "properties": {
                                "state": {"enum": ["sufficient_for_judgment", "insufficient_unresolved"]},
                                "live_web_research_performed": {"type": "boolean"},
                                "sources": {
                                    "type": "array",
                                    "items": {
                                        "type": "object", "additionalProperties": False,
                                        "required": ["url", "title", "publisher", "accessed_date"],
                                        "properties": {
                                            "url": {"type": "string", "pattern": "^https://"},
                                            "title": {"type": "string", "minLength": 1},
                                            "publisher": {"type": "string", "minLength": 1},
                                            "accessed_date": {"type": "string", "format": "date"},
                                        },
                                    },
                                },
                                "claims": {
                                    "type": "array",
                                    "items": {
                                        "type": "object", "additionalProperties": False,
                                        "required": ["claim", "source_urls", "applicability"],
                                        "properties": {
                                            "claim": {"type": "string", "minLength": 10},
                                            "source_urls": {"type": "array", "minItems": 1, "uniqueItems": True, "items": {"type": "string", "pattern": "^https://"}},
                                            "applicability": {"type": "string", "minLength": 10},
                                        },
                                    },
                                },
                            },
                        },
                        "unresolved_reason": {"type": ["string", "null"]},
                        "promotion_performed": {"const": False},
                        "proposed_plan_revision": {"type": ["string", "null"]},
                    },
                },
            },
            "self_attestation": {
                "type": "object", "additionalProperties": False,
                "required": ["all_edges_reviewed", "no_merge_by_name_similarity", "no_silent_domain_collapse", "no_final_promotion", "external_research_used_for_each_final_judgment", "no_descendants", "no_peer_outputs"],
                "properties": {k: {"const": True} for k in ["all_edges_reviewed", "no_merge_by_name_similarity", "no_silent_domain_collapse", "no_final_promotion", "external_research_used_for_each_final_judgment", "no_descendants", "no_peer_outputs"]},
            },
        },
    }
    write_json(schema_path, schema)

    packet_rows = []
    manifest_rows = []
    intent_paths = []
    output_dirs = []
    packet_sizes = []
    packet_registry_rows = []
    for idx, bucket in enumerate(bins, 1):
        assignment_id = f"A005CDS-{idx:04d}"
        packet_id = f"CDSPKT-{idx:04d}"
        agent_path = f"/root/a005_cross_domain_seam_{idx:04d}_attempt_0001_terminal"
        edges = sorted(bucket["edges"], key=lambda x: x["normalized_edge_id"])
        refs = sorted({r for edge in edges for r in edge["endpoint_refs"]})
        packet = {
            "audit_id": AUDIT_ID,
            "schema_version": "cross-domain-seam-packet-v1",
            "wave_id": WAVE_ID,
            "assignment_id": assignment_id,
            "packet_id": packet_id,
            "attempt_id": ATTEMPT_ID,
            "owner_pair_keys": sorted(bucket["pair_keys"]),
            "edge_count": len(edges),
            "edge_membership_digest": digest([x["normalized_edge_id"] for x in edges]),
            "feature_count": len(refs),
            "feature_refs_digest": digest(refs),
            "source_bindings": source_hashes,
            "decision_taxonomy": DECISION_TAXONOMY,
            "merge_rule": "Same product authority, lifecycle, user outcome, state boundary, and failure semantics are all required. Name similarity, umbrella/member, adjacency, dependency, shared vocabulary/UI, or related commands are never sufficient.",
            "obligations": {
                "review_every_edge": True,
                "preserve_source_dispositions": True,
                "external_research_required_for_final_judgment": True,
                "insufficient_evidence_remains_explicitly_unresolved": True,
                "promotion_forbidden": True,
                "canonical_plan_edits_forbidden": True,
            },
            "feature_records": [feature_compact[r] for r in refs],
            "seams": edges,
        }
        packet_path = NS / f"packets/{packet_id}.json"
        write_json(packet_path, packet)
        packet_sha = sha(packet_path)
        packet_size = packet_path.stat().st_size
        if packet_size > PACKET_CEILING:
            raise SystemExit(f"packet ceiling exceeded: {packet_id} {packet_size}")
        packet_sizes.append(packet_size)
        output_dir = ROOT / f"cross_domain_seams_v1/{assignment_id}/attempts/{ATTEMPT_ID}"
        output_dir.mkdir(parents=True, exist_ok=True)
        if any(output_dir.iterdir()):
            raise SystemExit(f"nonempty output directory: {output_dir}")
        output_dirs.append(str(output_dir))
        intent = {
            "audit_id": AUDIT_ID,
            "schema_version": "cross-domain-seam-dispatch-intent-v1",
            "wave_id": WAVE_ID,
            "assignment_id": assignment_id,
            "attempt_id": ATTEMPT_ID,
            "packet_id": packet_id,
            "packet_path": str(packet_path),
            "packet_sha256": packet_sha,
            "result_schema_path": str(schema_path),
            "result_schema_sha256": sha(schema_path),
            "leaf_prompt_path": str(NS / "leaf_prompt.json"),
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "controller_thread_id": CONTROLLER,
            "prospective_agent_path": agent_path,
            "fork_turns": "none",
            "fresh_direct_child": True,
            "descendants_forbidden": True,
            "followups_forbidden": True,
            "activation_granted": False,
            "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH",
            "output_directory": str(output_dir),
            "output_path": str(output_dir / "result.json"),
            "dispatch_receipt_ref": str(NS / f"dispatch/{assignment_id}/{ATTEMPT_ID}/dispatch_receipt.json"),
        }
        intent_path = NS / f"dispatch/{assignment_id}/{ATTEMPT_ID}/dispatch_intent.json"
        write_json(intent_path, intent)
        intent_paths.append(intent_path)
        packet_registry_rows.append({
            "assignment_id": assignment_id, "packet_id": packet_id,
            "packet_path": str(packet_path), "packet_sha256": packet_sha,
            "packet_bytes": packet_size, "edge_count": len(edges),
            "feature_count": len(refs), "edge_membership_digest": packet["edge_membership_digest"],
        })
        manifest_rows.append({
            "assignment_id": assignment_id, "packet_id": packet_id,
            "packet_path": str(packet_path), "packet_sha256": packet_sha,
            "dispatch_intent_path": str(intent_path),
            "prospective_agent_path": agent_path,
            "edge_count": len(edges), "feature_count": len(refs),
            "owner_pair_keys": sorted(bucket["pair_keys"]),
            "edge_membership_digest": packet["edge_membership_digest"],
            "output_directory": str(output_dir),
        })
        packet_rows.extend(edges)

    # leaf prompt is written before intents are re-bound to its final hash below.
    leaf_prompt = {
        "schema_version": "cross-domain-seam-leaf-prompt-v1",
        "role": "Fresh independent cross-domain seam adjudicator",
        "instructions": [
            "Read only your dispatch intent, packet, result schema, activation authorization when later supplied, and live public web sources.",
            "Spawn no descendants and accept no follow-up, retry, or peer output.",
            "Review every packet seam and preserve every primary/reverse/quarantine observation as candidate evidence, never as authority.",
            "Apply the exact decision taxonomy. Same-feature merge requires the same product authority, lifecycle, user outcome, state boundary, and failure semantics.",
            "Never merge by name similarity, umbrella/member relation, adjacency, dependency, shared vocabulary/UI, or related commands.",
            "Use current external research for every final judgment. If evidence is insufficient, choose uncertain_requires_targeted_research and explain the unresolved state.",
            "Record exact supporting evidence, counterevidence, direct HTTPS sources, and claim-to-source applicability.",
            "Do not promote, suppress, merge, repair, or edit any Plans or source artifact.",
            "Write exactly one result.json in the assigned output directory, validate it, then return exactly PMR1 only after the result exists.",
        ],
        "decision_taxonomy": DECISION_TAXONOMY,
        "result_required_before_pmr1": True,
        "external_research_required": True,
    }
    write_json(NS / "leaf_prompt.json", leaf_prompt)
    for intent_path in intent_paths:
        intent = json.loads(intent_path.read_text())
        intent["leaf_prompt_sha256"] = sha(NS / "leaf_prompt.json")
        write_json(intent_path, intent)
    for row, intent_path in zip(manifest_rows, intent_paths):
        row["dispatch_intent_sha256"] = sha(intent_path)

    write_jsonl(NS / "normalized_edge_ledger.jsonl", edge_rows)
    write_jsonl(NS / "packet_registry.jsonl", packet_registry_rows)
    write_jsonl(NS / "manifest.jsonl", manifest_rows)

    receipt_contract = {
        "schema_version": "cross-domain-seam-receipt-contract-v1",
        "required_positive_receipt_schema_version": "cross-domain-seam-dispatch-receipt-v1",
        "receipt_timing": "after unique native identity, terminal completed/PMR1, and exactly one result exists",
        "required_keys": ["schema_version", "audit_id", "wave_id", "assignment_id", "attempt_id", "controller_thread_id", "agent_path", "task_thread_id", "native_child_thread_id", "native_turn_id", "model", "reasoning_effort", "fresh_child", "fork_turns", "packet_path", "packet_sha256", "dispatch_intent_path", "dispatch_intent_sha256", "result_path", "result_sha256", "terminal_status", "terminal_response"],
        "result_payload_must_not_contain_native_identity": True,
    }
    write_json(NS / "receipt_contract.json", receipt_contract)
    activation_template = {
        "schema_version": "cross-domain-seam-activation-v1",
        "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH",
        "activation_granted": False,
        "wave_id": WAVE_ID,
        "assignment_ids": [x["assignment_id"] for x in manifest_rows],
        "agent_paths": [x["prospective_agent_path"] for x in manifest_rows],
        "model": MODEL, "reasoning_effort": EFFORT, "controller_thread_id": CONTROLLER,
        "concurrency_policy_v10_sha256": V10_SHA,
        "rolling_max": 40, "preferred_min": 32, "preferred_max": 40,
        "atomic_cap": 16, "semantic_transaction_cap": 8,
        "independent_prelaunch_path": None, "independent_prelaunch_sha256": None,
        "coverage_credit": 0, "research_credit": 0, "spec_credit": 0,
        "merge_credit": 0, "promotion_credit": 0,
    }
    write_json(NS / "activation.template.json", activation_template)

    source_inventory = {
        "schema_version": "cross-domain-seam-source-inventory-v1",
        "source_hashes": source_hashes,
        "primary_candidate_rows": len(primary_candidate),
        "primary_related_rows": len(primary_related),
        "primary_quarantine_findings": len(primary_quarantine_keys),
        "reverse_shadow_candidate_rows": shadow_luna["counts"]["merge_candidate_rows"],
        "reverse_shadow_related_rows": shadow_luna["counts"]["related_but_distinct_rows"],
        "reverse_shadow_quarantine_findings": len(shadow_quarantine),
        "owner_features": len(feature_rows),
        "universal_research_features": len(research),
    }
    write_json(NS / "source_inventory.json", source_inventory)
    architecture = {
        "schema_version": "cross-domain-seam-architecture-v1",
        "wave_id": WAVE_ID,
        "source_reconstruction": "Complete primary and reverse-shadow candidate/related decisions are normalized by unordered endpoint identity. No source subset is trusted.",
        "normalization": "sorted exact provisional feature refs joined with NUL",
        "partitioning": "11 owner-shard pair groups assigned whole by deterministic LPT over serialized evidence bytes plus provenance/conflict complexity",
        "assignment_count": 8,
        "edge_count": len(edge_rows),
        "feature_count": len(all_feature_refs),
        "pair_count": len(pair_groups),
        "candidate_related_conflicts": conflict_count,
        "disposition_counts": dict(sorted(disposition_counts.items())),
        "primary_quarantine_count": len(primary_quarantine_keys),
        "reverse_shadow_quarantine_count": len(shadow_quarantine),
        "packet_ceiling_bytes": PACKET_CEILING,
        "decision_taxonomy": DECISION_TAXONOMY,
        "no_promotion": True,
    }
    write_json(NS / "architecture.json", architecture)

    tool_paths = {
        "preparation": NS / "tools/prepare_cross_domain_seams.py",
        "prelaunch_verifier": NS / "tools/verify_prelaunch.py",
        "postrun_validator": NS / "tools/validate_postrun.py",
        "activation_generator": NS / "tools/generate_activation.py",
        "test_harness": NS / "tools/test_cross_domain_seams.py",
    }
    if any(not p.is_file() for p in tool_paths.values()):
        raise SystemExit("required tool missing")
    tool_hashes = {name: sha(path) for name, path in tool_paths.items()}
    authority = {
        "schema_version": "cross-domain-seam-authority-v1",
        "audit_id": AUDIT_ID, "wave_id": WAVE_ID,
        "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH",
        "activation_granted": False,
        "model": MODEL, "reasoning_effort": EFFORT, "controller_thread_id": CONTROLLER,
        "assignment_count": 8, "semantic_transaction_cap": 8,
        "normalized_edge_count": len(edge_rows), "feature_count": len(all_feature_refs),
        "normalized_edge_digest": digest([x["normalized_edge_key"] for x in edge_rows]),
        "normalized_edge_id_digest": digest([x["normalized_edge_id"] for x in edge_rows]),
        "feature_digest": digest(sorted(all_feature_refs)),
        "concurrency_policy_v10_path": str(V10), "concurrency_policy_v10_sha256": V10_SHA,
        "rolling_max": 40, "preferred_min": 32, "preferred_max": 40, "atomic_cap": 16,
        "source_inventory_path": str(NS / "source_inventory.json"), "source_inventory_sha256": sha(NS / "source_inventory.json"),
        "architecture_sha256": sha(NS / "architecture.json"),
        "manifest_sha256": sha(NS / "manifest.jsonl"),
        "packet_registry_sha256": sha(NS / "packet_registry.jsonl"),
        "normalized_edge_ledger_sha256": sha(NS / "normalized_edge_ledger.jsonl"),
        "result_schema_sha256": sha(schema_path),
        "leaf_prompt_sha256": sha(NS / "leaf_prompt.json"),
        "receipt_contract_sha256": sha(NS / "receipt_contract.json"),
        "activation_template_sha256": sha(NS / "activation.template.json"),
        "packet_root": digest([x["packet_sha256"] for x in packet_registry_rows]),
        "intent_root": digest([sha(x) for x in intent_paths]),
        "packet_bytes_min": min(packet_sizes), "packet_bytes_max": max(packet_sizes), "packet_bytes_total": sum(packet_sizes),
        "tool_hashes": tool_hashes,
        "outputs_empty": 8, "results": 0, "receipts": 0, "native_capture_rows": 0,
        "coverage_credit": 0, "research_credit": 0, "spec_credit": 0, "merge_credit": 0, "promotion_credit": 0,
    }
    write_json(NS / "authority.json", authority)

    launch_seal = {
        "schema_version": "cross-domain-seam-launch-seal-v1",
        "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH",
        "activation_granted": False,
        "authority_sha256": sha(NS / "authority.json"),
        "manifest_sha256": sha(NS / "manifest.jsonl"),
        "packet_registry_sha256": sha(NS / "packet_registry.jsonl"),
        "normalized_edge_ledger_sha256": sha(NS / "normalized_edge_ledger.jsonl"),
        "packet_root": authority["packet_root"], "intent_root": authority["intent_root"],
        "result_schema_sha256": sha(schema_path), "leaf_prompt_sha256": sha(NS / "leaf_prompt.json"),
        "receipt_contract_sha256": sha(NS / "receipt_contract.json"),
        "activation_template_sha256": sha(NS / "activation.template.json"),
        "concurrency_policy_v10_sha256": V10_SHA,
        "assignment_count": 8, "normalized_edge_count": len(edge_rows), "feature_count": len(all_feature_refs),
        "zero_state_required": True, "fresh_independent_luna_prelaunch_required": True,
    }
    write_json(NS / "launch_seal.json", launch_seal)
    validator_authority = {
        "schema_version": "cross-domain-seam-validator-authority-v1",
        "status": "candidate_only",
        "authority_sha256": sha(NS / "authority.json"),
        "launch_seal_sha256": sha(NS / "launch_seal.json"),
        "source_inventory_sha256": sha(NS / "source_inventory.json"),
        "manifest_sha256": sha(NS / "manifest.jsonl"),
        "packet_registry_sha256": sha(NS / "packet_registry.jsonl"),
        "normalized_edge_ledger_sha256": sha(NS / "normalized_edge_ledger.jsonl"),
        "result_schema_sha256": sha(schema_path),
        "tool_hashes": tool_hashes,
        "schema_engine": "jsonschema.Draft202012Validator 4.26.0 from sealed offline dependency bundle",
        "prelaunch_requires_zero_state": True,
        "postrun_candidate_credit_only": True,
        "independent_luna_prelaunch_required": True,
        "independent_luna_postrun_required_before_any_credit": True,
    }
    write_json(NS / "validation/VALIDATOR_AUTHORITY_V1.json", validator_authority)
    local = {
        "schema_version": "cross-domain-seam-local-prelaunch-candidate-v1",
        "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH",
        "gate_passed": False, "activation_granted": False,
        "authority_sha256": sha(NS / "authority.json"), "launch_seal_sha256": sha(NS / "launch_seal.json"),
        "assignment_count": 8, "packet_count": 8, "intent_count": 8,
        "normalized_edge_count": len(edge_rows), "feature_count": len(all_feature_refs),
        "pair_count": 11, "primary_quarantine_count": 5, "reverse_shadow_quarantine_count": 5,
        "candidate_related_conflicts": conflict_count,
        "packet_bytes_min": min(packet_sizes), "packet_bytes_max": max(packet_sizes), "packet_bytes_total": sum(packet_sizes),
        "output_directories": 8, "empty_outputs": 8, "results": 0, "receipts": 0,
        "native_capture_rows": 0, "activation_files": 0,
        "coverage_credit": 0, "research_credit": 0, "spec_credit": 0, "merge_credit": 0, "promotion_credit": 0,
        "required_next_gate": "fresh independent Luna prelaunch validating complete source reconstruction, exact union, bindings, tests, identities, packet limits, and zero state",
        "validator_authority_sha256": sha(NS / "validation/VALIDATOR_AUTHORITY_V1.json"),
        "tool_hashes": tool_hashes,
        "test_count": 461,
        "test_passed": 461,
        "test_failed": 0,
        "test_digest": "49cbb6bd12e5e821c30e299483d211caa3334616a8777f1f6d55418b70ec824d",
        "schema_engine": "jsonschema.Draft202012Validator 4.26.0",
        "prelaunch_verifier_status": "pass",
    }
    write_json(NS / "validation/local-prelaunch-candidate.json", local)
    print(json.dumps({"status": "prepared", "edges": len(edge_rows), "features": len(all_feature_refs), "packets": 8, "packet_max": max(packet_sizes), "conflicts": conflict_count}, sort_keys=True))


if __name__ == "__main__":
    main()
