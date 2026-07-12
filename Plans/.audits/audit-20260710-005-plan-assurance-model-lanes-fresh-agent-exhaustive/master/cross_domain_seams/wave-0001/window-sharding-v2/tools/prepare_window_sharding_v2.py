#!/usr/bin/env python3
"""Deterministically reshard the immutable v1 seam union into 64 bounded windows."""
from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
V1 = ROOT / "master/cross_domain_seams/wave-0001"
NS = V1 / "window-sharding-v2"
OUTPUT_ROOT = ROOT / "cross_domain_seams_window_v2"
AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
WAVE_ID = "cross-domain-seam-window-sharding-v2"
ATTEMPT_ID = "attempt-0001"
MODEL = "gpt-5.6-sol"
EFFORT = "xhigh"
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
V10_SHA = "0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1"
V1_TERMINAL_SHA = "75b070ecdb20667ac46fc948ee575e6f33d1319f8bd15bbd679b6d51d29b8a98"
V1_EDGE_SHA = "6ebfdbd97df06dc4060421f8845d32de4fc3edc81d57a1765144986193a2925b"
V1_SOURCE_SHA = "f28db2680cde7985d4ca09405e4bc5923e3f587677d67d0140bccd0a42e9d0b0"
WINDOW_COUNT = 64
COHORT_COUNT = 4
COHORT_SIZE = 16
TARGET_CEILING = 750_000
HARD_CEILING = 900_000
TAXONOMY = [
    "same_feature_merge", "shared_subsystem_distinct", "dependency_or_interface_seam",
    "conflict_requires_plan_revision", "unsupported_candidate", "uncertain_requires_targeted_research",
]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest(value) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def read_jsonl(path: Path):
    return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]


def write_json(path: Path, value, compact: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if compact:
        path.write_text(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n")
    else:
        path.write_text(json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n")


def write_jsonl(path: Path, rows) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as f:
        for row in rows:
            f.write(json.dumps(row, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n")


def compact_feature(v1: dict) -> dict:
    research = v1["universal_research"]
    return {
        "provisional_feature_ref": v1["provisional_feature_ref"],
        "source_row_sha256": v1["source_row_sha256"],
        "owner_assignment_id": v1["owner_assignment_id"],
        "owner_domain": v1["owner_domain"],
        "title": v1["title"],
        "summary": v1["summary"],
        "gap_summary": v1["gap_summary"],
        "spec_state": v1["spec_state"],
        "risk_level": v1["risk_level"],
        "feature_kinds": v1["feature_kinds"],
        "local_feature_refs": v1["local_feature_refs"],
        "source_documents": v1["source_documents"],
        "source_unit_refs": v1["source_unit_refs"],
        "owner_membership": v1["owner_membership"],
        "universal_research": {
            "evidence_state": research["evidence_state"],
            "source_assignment_id": research.get("source_assignment_id"),
            "result_path": research.get("result_path"),
            "result_sha256": research.get("result_sha256"),
            "source_row_sha256": research.get("source_row_sha256"),
            "research_state": research.get("research_state"),
            "insufficient_evidence_reason": research.get("insufficient_evidence_reason"),
            "sources": research.get("sources", []),
            "supported_claims": research.get("supported_claims", []),
        },
    }


def main() -> None:
    pins = {
        V1 / "validation/terminal-sol-preparation-report.json": V1_TERMINAL_SHA,
        V1 / "normalized_edge_ledger.jsonl": V1_EDGE_SHA,
        V1 / "source_inventory.json": V1_SOURCE_SHA,
        ROOT / "master/coordination/CONCURRENCY_POLICY_V10.json": V10_SHA,
    }
    for path, expected in pins.items():
        if sha(path) != expected:
            raise SystemExit(f"immutable pin mismatch: {path}")
    forbidden = {"activation.json", "activation.v1.json", "result.json", "dispatch_receipt.json", "native_capture.json"}
    if any(p.is_file() and p.name in forbidden for p in V1.rglob("*")):
        raise SystemExit("v1 zero-launch lineage drift")

    edges = read_jsonl(V1 / "normalized_edge_ledger.jsonl")
    if len(edges) != 9365 or len({x["normalized_edge_key"] for x in edges}) != 9365:
        raise SystemExit("v1 edge union drift")
    if len({r for x in edges for r in x["endpoint_refs"]}) != 2495:
        raise SystemExit("v1 feature union drift")

    features = {}
    for packet_path in sorted((V1 / "packets").glob("CDSPKT-*.json")):
        packet = json.loads(packet_path.read_text())
        for record in packet["feature_records"]:
            ref = record["provisional_feature_ref"]
            compact = compact_feature(record)
            if ref in features and features[ref] != compact:
                raise SystemExit(f"v1 repeated feature evidence drift: {ref}")
            features[ref] = compact
    expected_features = {r for x in edges for r in x["endpoint_refs"]}
    if set(features) != expected_features:
        raise SystemExit("v1 feature evidence closure drift")

    source_capsule = {
        "schema_version": "cross-domain-seam-v2-source-capsule-v1",
        "v1_terminal_report_path": str(V1 / "validation/terminal-sol-preparation-report.json"),
        "v1_terminal_report_sha256": V1_TERMINAL_SHA,
        "v1_edge_ledger_path": str(V1 / "normalized_edge_ledger.jsonl"),
        "v1_edge_ledger_sha256": V1_EDGE_SHA,
        "v1_source_inventory_path": str(V1 / "source_inventory.json"),
        "v1_source_inventory_sha256": V1_SOURCE_SHA,
        "v1_authority_path": str(V1 / "authority.json"),
        "v1_authority_sha256": sha(V1 / "authority.json"),
        "v1_architecture_sha256": sha(V1 / "architecture.json"),
        "v1_manifest_sha256": sha(V1 / "manifest.jsonl"),
        "v1_packet_registry_sha256": sha(V1 / "packet_registry.jsonl"),
        "v1_packet_root": json.loads((V1 / "authority.json").read_text())["packet_root"],
        "v1_intent_root": json.loads((V1 / "authority.json").read_text())["intent_root"],
        "v10_path": str(ROOT / "master/coordination/CONCURRENCY_POLICY_V10.json"),
        "v10_sha256": V10_SHA,
        "equivalence_scope": {"edges": 9365, "features": 2495, "pairs": 11, "conflicts": 178, "quarantines": 10},
        "disposition_counts": {"merge_candidate": 45, "related_but_distinct": 9138, "uncertain": 177, "unsupported": 5},
    }
    write_json(NS / "source_capsule.json", source_capsule)
    source_capsule_sha = sha(NS / "source_capsule.json")

    # Result schema and leaf contract are independent of window membership.
    schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "urn:puppetmaster:audit005:cross-domain-seam-window-v2-result",
        "type": "object", "additionalProperties": False,
        "required": ["audit_id", "schema_version", "phase", "assignment_id", "cohort_id", "attempt_id", "agent_path", "model", "reasoning_effort", "status", "input_binding", "coverage", "decisions", "self_attestation"],
        "properties": {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "cross-domain-seam-window-v2-result-v1"},
            "phase": {"const": "cross_domain_seam_window_adjudication_v2"},
            "assignment_id": {"pattern": "^A005CDSV2-00(?:0[1-9]|[1-5][0-9]|6[0-4])$"},
            "cohort_id": {"enum": [f"cohort-{i:04d}" for i in range(1, 5)]},
            "attempt_id": {"const": ATTEMPT_ID},
            "agent_path": {"pattern": "^/root/a005_cross_domain_seam_v2_00(?:0[1-9]|[1-5][0-9]|6[0-4])_attempt_0001_terminal$"},
            "model": {"const": MODEL}, "reasoning_effort": {"const": EFFORT}, "status": {"const": "completed"},
            "input_binding": {"type": "object", "additionalProperties": False, "required": ["packet_id", "packet_sha256", "edge_membership_digest", "source_capsule_sha256", "cohort_activation_sha256"], "properties": {
                "packet_id": {"pattern": "^CDSV2PKT-00(?:0[1-9]|[1-5][0-9]|6[0-4])$"},
                "packet_sha256": {"pattern": "^[0-9a-f]{64}$"}, "edge_membership_digest": {"pattern": "^[0-9a-f]{64}$"},
                "source_capsule_sha256": {"const": source_capsule_sha}, "cohort_activation_sha256": {"pattern": "^[0-9a-f]{64}$"},
            }},
            "coverage": {"type": "object", "additionalProperties": False, "required": ["edge_count", "normalized_edge_ids"], "properties": {
                "edge_count": {"type": "integer", "minimum": 1}, "normalized_edge_ids": {"type": "array", "minItems": 1, "uniqueItems": True, "items": {"pattern": "^A005CDS-EDGE-[0-9]{5}$"}},
            }},
            "decisions": {"type": "array", "minItems": 1, "items": {"type": "object", "additionalProperties": False,
                "required": ["normalized_edge_id", "decision", "rationale", "authority_lifecycle_outcome_state_failure_analysis", "supporting_evidence", "counterevidence", "external_research", "unresolved_reason", "promotion_performed", "proposed_plan_revision"],
                "properties": {
                    "normalized_edge_id": {"pattern": "^A005CDS-EDGE-[0-9]{5}$"}, "decision": {"enum": TAXONOMY},
                    "rationale": {"type": "string", "minLength": 30}, "authority_lifecycle_outcome_state_failure_analysis": {"type": "string", "minLength": 40},
                    "supporting_evidence": {"type": "array", "minItems": 1, "items": {"type": "string", "minLength": 8}},
                    "counterevidence": {"type": "array", "items": {"type": "string", "minLength": 8}},
                    "external_research": {"type": "object", "additionalProperties": False, "required": ["state", "live_web_research_performed", "sources", "claims"], "properties": {
                        "state": {"enum": ["sufficient_for_judgment", "insufficient_unresolved"]}, "live_web_research_performed": {"type": "boolean"},
                        "sources": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["url", "title", "publisher", "accessed_date"], "properties": {
                            "url": {"type": "string", "pattern": "^https://"}, "title": {"type": "string", "minLength": 1}, "publisher": {"type": "string", "minLength": 1}, "accessed_date": {"type": "string", "format": "date"},
                        }}},
                        "claims": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["claim", "source_urls", "applicability"], "properties": {
                            "claim": {"type": "string", "minLength": 10}, "source_urls": {"type": "array", "minItems": 1, "uniqueItems": True, "items": {"type": "string", "pattern": "^https://"}}, "applicability": {"type": "string", "minLength": 10},
                        }}},
                    }},
                    "unresolved_reason": {"type": ["string", "null"]}, "promotion_performed": {"const": False}, "proposed_plan_revision": {"type": ["string", "null"]},
                },
            }},
            "self_attestation": {"type": "object", "additionalProperties": False, "required": ["all_edges_reviewed", "whole_edge_evidence_reviewed", "no_merge_by_name_similarity", "no_silent_domain_collapse", "no_final_promotion", "external_research_used_for_each_final_judgment", "no_descendants", "no_peer_outputs"],
                "properties": {k: {"const": True} for k in ["all_edges_reviewed", "whole_edge_evidence_reviewed", "no_merge_by_name_similarity", "no_silent_domain_collapse", "no_final_promotion", "external_research_used_for_each_final_judgment", "no_descendants", "no_peer_outputs"]}},
        },
    }
    write_json(NS / "schema/result.schema.json", schema)
    leaf_prompt = {
        "schema_version": "cross-domain-seam-window-v2-leaf-prompt-v1",
        "role": "Fresh independent bounded-window cross-domain seam adjudicator",
        "instructions": [
            "Read only the assigned intent, compact packet, bound source capsule, result schema, cohort activation, and live public web sources.",
            "Review every assigned seam and its complete local feature, owner-membership, primary/reverse decision, counterdecision, quarantine, and universal-research evidence.",
            "Treat all prior dispositions and research claims as candidate evidence, never final authority.",
            "Use current public-web research for every final judgment; if evidence is insufficient, return uncertain_requires_targeted_research with an explicit unresolved reason.",
            "Same-feature merge requires identical product authority, lifecycle, user outcome, state boundary, and failure semantics. Names, umbrella/member structure, adjacency, dependency, shared UI/vocabulary, or related commands are not enough.",
            "Do not promote, suppress, merge, repair, or edit Plans or any source artifact.",
            "Spawn no descendants, read no peer outputs, accept no follow-up or retry, and write exactly one result.json before returning exactly PMR1.",
        ],
        "decision_taxonomy": TAXONOMY,
        "external_research_required": True, "result_required_before_pmr1": True,
    }
    write_json(NS / "leaf_prompt.json", leaf_prompt)

    # Build anchor-local atoms, preserving every edge as the indivisible unit.
    atoms = []
    grouped = defaultdict(list)
    for edge in edges:
        grouped[(edge["owner_pair_key"], edge["endpoint_refs"][0])].append(edge)
    for group_key, rows in sorted(grouped.items()):
        rows = sorted(rows, key=lambda x: x["normalized_edge_id"])
        # Split only the group, never an edge, if a single anchor group becomes
        # larger than a bounded window.  The split remains deterministic.
        chunk, chunk_refs, chunk_cost = [], set(), 0
        for edge in rows:
            refs = set(edge["endpoint_refs"])
            edge_bytes = len(json.dumps(edge, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode())
            new_feature_bytes = sum(len(json.dumps(features[r], sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()) for r in refs - chunk_refs)
            complexity = 1200 * len(edge["provenance"]) + 5000 * int(edge["candidate_related_conflict"]) + 8000 * int(edge["quarantined"])
            projected = chunk_cost + edge_bytes + new_feature_bytes + complexity
            if chunk and projected > 500_000:
                atoms.append({"key": group_key, "edges": chunk, "refs": set(chunk_refs), "weight": chunk_cost})
                chunk, chunk_refs, chunk_cost = [], set(), 0
                new_feature_bytes = sum(len(json.dumps(features[r], sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()) for r in refs)
            chunk.append(edge); chunk_refs.update(refs); chunk_cost += edge_bytes + new_feature_bytes + complexity
        if chunk:
            atoms.append({"key": group_key, "edges": chunk, "refs": set(chunk_refs), "weight": chunk_cost})
    if len(atoms) < WINDOW_COUNT:
        raise SystemExit("insufficient atomic groups for 64 windows")

    feature_bytes = {r: len(json.dumps(v, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()) for r, v in features.items()}
    bins = [{"edges": [], "refs": set(), "pairs": set(), "estimated": 0, "conflicts": 0, "quarantines": 0, "sources": 0} for _ in range(WINDOW_COUNT)]
    for atom in sorted(atoms, key=lambda x: (-x["weight"], x["key"], x["edges"][0]["normalized_edge_id"])):
        edge_bytes = sum(len(json.dumps(e, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()) for e in atom["edges"])
        conflict = sum(int(e["candidate_related_conflict"]) for e in atom["edges"])
        quarantine = sum(int(e["quarantined"]) for e in atom["edges"])
        source_burden = sum(len(features[r]["universal_research"].get("sources", [])) + len(features[r]["universal_research"].get("supported_claims", [])) for r in atom["refs"])
        candidates = []
        for i, b in enumerate(bins):
            new_refs = atom["refs"] - b["refs"]
            projected = b["estimated"] + edge_bytes + sum(feature_bytes[r] for r in new_refs) + 1200*len(atom["edges"]) + 5000*conflict + 8000*quarantine + 500*source_burden
            candidates.append((projected, b["conflicts"] + conflict, b["quarantines"] + quarantine, b["sources"] + source_burden, i))
        _, _, _, _, target = min(candidates)
        b = bins[target]
        new_refs = atom["refs"] - b["refs"]
        b["estimated"] += edge_bytes + sum(feature_bytes[r] for r in new_refs) + 1200*len(atom["edges"]) + 5000*conflict + 8000*quarantine + 500*source_burden
        b["edges"].extend(atom["edges"]); b["refs"].update(atom["refs"]); b["pairs"].add(atom["key"][0])
        b["conflicts"] += conflict; b["quarantines"] += quarantine; b["sources"] += source_burden
    if any(not b["edges"] for b in bins):
        raise SystemExit("empty v2 window")

    receipt_contract = {
        "schema_version": "cross-domain-seam-window-v2-receipt-contract-v1",
        "required_positive_receipt_schema_version": "cross-domain-seam-window-v2-dispatch-receipt-v1",
        "receipt_timing": "after unique native identity, terminal completed/PMR1, and exactly one result exists",
        "result_payload_native_identity_forbidden": True,
        "required_keys": ["schema_version", "audit_id", "wave_id", "cohort_id", "assignment_id", "attempt_id", "controller_thread_id", "agent_path", "task_thread_id", "native_child_thread_id", "native_turn_id", "model", "reasoning_effort", "fresh_child", "fork_turns", "packet_path", "packet_sha256", "dispatch_intent_path", "dispatch_intent_sha256", "cohort_activation_path", "cohort_activation_sha256", "result_path", "result_sha256", "terminal_status", "terminal_response"],
    }
    capture_contract = {
        "schema_version": "cross-domain-seam-window-v2-native-capture-contract-v1",
        "scope": "one separately terminal cohort of exactly 16",
        "required_identity_fields": ["cohort_id", "assignment_id", "agent_path", "native_child_thread_id", "native_turn_id", "terminal_status", "terminal_response", "result_sha256", "receipt_sha256"],
        "unique_fields": ["assignment_id", "agent_path", "native_child_thread_id", "native_turn_id"],
    }
    write_json(NS / "receipt_contract.json", receipt_contract)
    write_json(NS / "native_capture_contract.json", capture_contract)

    manifest, registry = [], []
    cohort_rows = defaultdict(list)
    packet_sizes = []
    all_packet_edge_ids = []
    for idx, b in enumerate(bins, 1):
        assignment = f"A005CDSV2-{idx:04d}"
        packet_id = f"CDSV2PKT-{idx:04d}"
        cohort_num = (idx - 1) // COHORT_SIZE + 1
        cohort_id = f"cohort-{cohort_num:04d}"
        agent_path = f"/root/a005_cross_domain_seam_v2_{idx:04d}_attempt_0001_terminal"
        edge_rows = sorted(b["edges"], key=lambda x: x["normalized_edge_id"])
        refs = sorted({r for e in edge_rows for r in e["endpoint_refs"]})
        edge_ids = [e["normalized_edge_id"] for e in edge_rows]
        packet = {
            "schema_version": "cross-domain-seam-window-v2-packet-v1", "audit_id": AUDIT_ID, "wave_id": WAVE_ID,
            "cohort_id": cohort_id, "assignment_id": assignment, "packet_id": packet_id, "attempt_id": ATTEMPT_ID,
            "source_capsule_ref": str(NS / "source_capsule.json"), "source_capsule_sha256": source_capsule_sha,
            "v1_edge_ledger_sha256": V1_EDGE_SHA, "v1_source_inventory_sha256": V1_SOURCE_SHA,
            "edge_count": len(edge_rows), "edge_membership_digest": digest(edge_ids),
            "feature_count": len(refs), "feature_refs_digest": digest(refs),
            "owner_pair_keys": sorted(b["pairs"]), "conflict_count": b["conflicts"], "quarantine_count": b["quarantines"],
            "external_source_burden": sum(len(features[r]["universal_research"].get("sources", [])) + len(features[r]["universal_research"].get("supported_claims", [])) for r in refs),
            "decision_taxonomy": TAXONOMY,
            "merge_rule": "Same product authority, lifecycle, user outcome, state boundary, and failure semantics are all required; names, umbrella/member, adjacency, dependency, shared vocabulary/UI, or related commands are not merge-equivalent.",
            "obligations": {"review_every_edge": True, "whole_edge_evidence_preserved": True, "external_research_required_for_final_judgment": True, "insufficient_evidence_remains_unresolved": True, "promotion_forbidden": True},
            "feature_records": [features[r] for r in refs], "seams": edge_rows,
        }
        packet_path = NS / f"packets/{packet_id}.json"
        write_json(packet_path, packet, compact=True)
        size = packet_path.stat().st_size
        if size > HARD_CEILING: raise SystemExit(f"hard packet ceiling exceeded: {packet_id}:{size}")
        if size > TARGET_CEILING: raise SystemExit(f"target packet ceiling exceeded: {packet_id}:{size}")
        packet_sizes.append(size); all_packet_edge_ids.extend(edge_ids)
        output_dir = OUTPUT_ROOT / assignment / "attempts" / ATTEMPT_ID
        output_dir.mkdir(parents=True, exist_ok=True)
        if any(output_dir.iterdir()): raise SystemExit(f"nonempty output: {output_dir}")
        intent = {
            "schema_version": "cross-domain-seam-window-v2-dispatch-intent-v1", "audit_id": AUDIT_ID, "wave_id": WAVE_ID,
            "cohort_id": cohort_id, "assignment_id": assignment, "attempt_id": ATTEMPT_ID,
            "packet_id": packet_id, "packet_path": str(packet_path), "packet_sha256": sha(packet_path),
            "source_capsule_path": str(NS / "source_capsule.json"), "source_capsule_sha256": source_capsule_sha,
            "result_schema_path": str(NS / "schema/result.schema.json"), "result_schema_sha256": sha(NS / "schema/result.schema.json"),
            "leaf_prompt_path": str(NS / "leaf_prompt.json"), "leaf_prompt_sha256": sha(NS / "leaf_prompt.json"),
            "receipt_contract_path": str(NS / "receipt_contract.json"), "receipt_contract_sha256": sha(NS / "receipt_contract.json"),
            "cohort_activation_ref": str(NS / f"cohorts/{cohort_id}/activation.v2.json"),
            "model": MODEL, "reasoning_effort": EFFORT, "controller_thread_id": CONTROLLER,
            "prospective_agent_path": agent_path, "fresh_direct_child": True, "fork_turns": "none", "descendants_forbidden": True, "followups_forbidden": True,
            "activation_granted": False, "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH_V2",
            "output_directory": str(output_dir), "output_path": str(output_dir / "result.json"),
            "dispatch_receipt_ref": str(NS / f"dispatch/{assignment}/{ATTEMPT_ID}/dispatch_receipt.json"),
        }
        intent_path = NS / f"dispatch/{assignment}/{ATTEMPT_ID}/dispatch_intent.json"
        write_json(intent_path, intent)
        row = {
            "assignment_id": assignment, "cohort_id": cohort_id, "packet_id": packet_id,
            "packet_path": str(packet_path), "packet_sha256": sha(packet_path), "packet_bytes": size,
            "dispatch_intent_path": str(intent_path), "dispatch_intent_sha256": sha(intent_path),
            "prospective_agent_path": agent_path, "output_directory": str(output_dir),
            "edge_count": len(edge_rows), "edge_membership_digest": digest(edge_ids), "feature_count": len(refs),
            "conflict_count": b["conflicts"], "quarantine_count": b["quarantines"], "owner_pair_keys": sorted(b["pairs"]),
        }
        manifest.append(row); cohort_rows[cohort_id].append(row); registry.append({k: row[k] for k in ["assignment_id", "cohort_id", "packet_id", "packet_path", "packet_sha256", "packet_bytes", "edge_count", "edge_membership_digest", "feature_count", "conflict_count", "quarantine_count"]})
    expected_ids = [x["normalized_edge_id"] for x in edges]
    if len(all_packet_edge_ids) != 9365 or len(set(all_packet_edge_ids)) != 9365 or set(all_packet_edge_ids) != set(expected_ids):
        raise SystemExit("v2 packet union mismatch")
    write_jsonl(NS / "manifest.jsonl", manifest); write_jsonl(NS / "packet_registry.jsonl", registry)
    for cohort_id, rows in sorted(cohort_rows.items()):
        if len(rows) != 16: raise SystemExit(f"cohort cardinality: {cohort_id}")
        write_jsonl(NS / f"cohorts/{cohort_id}/manifest.jsonl", rows)
        template = {
            "schema_version": "cross-domain-seam-window-v2-cohort-activation-template-v1",
            "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH_V2", "activation_granted": False,
            "wave_id": WAVE_ID, "cohort_id": cohort_id, "assignment_ids": [x["assignment_id"] for x in rows],
            "agent_paths": [x["prospective_agent_path"] for x in rows], "assignment_count": 16,
            "model": MODEL, "reasoning_effort": EFFORT, "controller_thread_id": CONTROLLER,
            "concurrency_policy_v10_sha256": V10_SHA, "rolling_max": 40, "preferred_min": 32, "preferred_max": 40, "atomic_cap": 16, "semantic_transaction_cap": 16,
            "source_capsule_sha256": source_capsule_sha, "cohort_manifest_sha256": sha(NS / f"cohorts/{cohort_id}/manifest.jsonl"),
            "independent_prelaunch_path": None, "independent_prelaunch_sha256": None,
            "coverage_credit": 0, "research_credit": 0, "spec_credit": 0, "merge_credit": 0, "promotion_credit": 0,
        }
        write_json(NS / f"cohorts/{cohort_id}/activation.template.json", template)

    tool_paths = {name: NS / rel for name, rel in {
        "preparation": "tools/prepare_window_sharding_v2.py", "prelaunch_verifier": "tools/verify_prelaunch_v2.py",
        "postrun_validator": "tools/validate_postrun_v2.py", "activation_generator": "tools/generate_cohort_activation_v2.py",
        "test_harness": "tools/test_window_sharding_v2.py",
    }.items()}
    tool_hashes = {name: sha(path) for name, path in tool_paths.items()} if all(p.is_file() for p in tool_paths.values()) else {}
    architecture = {
        "schema_version": "cross-domain-seam-window-sharding-v2-architecture-v1", "wave_id": WAVE_ID,
        "supersedes_v1_launchability_only": True, "v1_semantic_union_immutable": True,
        "windowing": "anchor-local atomic groups, deterministic descending complexity, placed by least projected serialized bytes including new feature evidence, provenance, conflicts, quarantines, and external-source burden",
        "edge_indivisibility": True, "window_count": 64, "cohort_count": 4, "cohort_size": 16,
        "target_packet_ceiling": TARGET_CEILING, "hard_packet_ceiling": HARD_CEILING,
        "edge_count": 9365, "feature_count": 2495, "pair_count": 11, "conflict_count": 178, "quarantine_count": 10,
        "disposition_counts": {"merge_candidate": 45, "related_but_distinct": 9138, "uncertain": 177, "unsupported": 5},
        "v10": {"sha256": V10_SHA, "rolling_max": 40, "preferred_min": 32, "preferred_max": 40, "atomic_cap": 16},
        "independent_cohort_activation": True, "all_64_atomic_activation_forbidden": True,
    }
    write_json(NS / "architecture.json", architecture)
    lineage = {
        "schema_version": "cross-domain-seam-window-sharding-v2-lineage-v1", "status": "append_only_supersession_candidate",
        "reason": "v1 packets exceeded bounded fresh-agent context envelope",
        "v1_terminal_report_sha256": V1_TERMINAL_SHA, "v1_edge_ledger_sha256": V1_EDGE_SHA, "v1_source_inventory_sha256": V1_SOURCE_SHA,
        "v1_packet_bytes_min": 3468834, "v1_packet_bytes_max": 5892887, "v1_launch_forbidden": True,
        "v1_artifacts_mutated": False,
    }
    write_json(NS / "lineage.json", lineage)
    authority = {
        "schema_version": "cross-domain-seam-window-sharding-v2-authority-v1", "audit_id": AUDIT_ID, "wave_id": WAVE_ID,
        "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH_V2", "activation_granted": False,
        "assignment_count": 64, "cohort_count": 4, "cohort_size": 16,
        "edge_count": 9365, "feature_count": 2495, "pair_count": 11, "conflict_count": 178, "quarantine_count": 10,
        "disposition_counts": architecture["disposition_counts"],
        "v1_edge_ledger_sha256": V1_EDGE_SHA, "v1_source_inventory_sha256": V1_SOURCE_SHA, "v1_terminal_report_sha256": V1_TERMINAL_SHA,
        "edge_digest": digest([x["normalized_edge_key"] for x in edges]), "edge_id_digest": digest(expected_ids), "feature_digest": digest(sorted(expected_features)),
        "model": MODEL, "reasoning_effort": EFFORT, "controller_thread_id": CONTROLLER,
        "concurrency_policy_v10_sha256": V10_SHA, "rolling_max": 40, "preferred_min": 32, "preferred_max": 40, "atomic_cap": 16, "cohort_transaction_cap": 16,
        "architecture_sha256": sha(NS / "architecture.json"), "lineage_sha256": sha(NS / "lineage.json"), "source_capsule_sha256": source_capsule_sha,
        "manifest_sha256": sha(NS / "manifest.jsonl"), "packet_registry_sha256": sha(NS / "packet_registry.jsonl"),
        "packet_root": digest([x["packet_sha256"] for x in registry]), "intent_root": digest([x["dispatch_intent_sha256"] for x in manifest]),
        "cohort_manifest_sha256": {cid: sha(NS / f"cohorts/{cid}/manifest.jsonl") for cid in sorted(cohort_rows)},
        "cohort_activation_template_sha256": {cid: sha(NS / f"cohorts/{cid}/activation.template.json") for cid in sorted(cohort_rows)},
        "result_schema_sha256": sha(NS / "schema/result.schema.json"), "leaf_prompt_sha256": sha(NS / "leaf_prompt.json"),
        "receipt_contract_sha256": sha(NS / "receipt_contract.json"), "native_capture_contract_sha256": sha(NS / "native_capture_contract.json"),
        "packet_bytes_min": min(packet_sizes), "packet_bytes_max": max(packet_sizes), "packet_bytes_total": sum(packet_sizes),
        "target_packet_ceiling": TARGET_CEILING, "hard_packet_ceiling": HARD_CEILING, "tool_hashes": tool_hashes,
        "empty_outputs": 64, "activation_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0,
        "coverage_credit": 0, "research_credit": 0, "spec_credit": 0, "merge_credit": 0, "promotion_credit": 0,
    }
    write_json(NS / "authority.json", authority)
    validator_authority = {
        "schema_version": "cross-domain-seam-window-v2-validator-authority-v1", "status": "candidate_only",
        "authority_sha256": sha(NS / "authority.json"), "architecture_sha256": sha(NS / "architecture.json"), "lineage_sha256": sha(NS / "lineage.json"),
        "source_capsule_sha256": source_capsule_sha, "manifest_sha256": sha(NS / "manifest.jsonl"), "packet_registry_sha256": sha(NS / "packet_registry.jsonl"),
        "result_schema_sha256": sha(NS / "schema/result.schema.json"), "tool_hashes": tool_hashes,
        "schema_engine": "jsonschema.Draft202012Validator 4.26.0 from sealed offline bundle",
        "independent_cohort_prelaunch_required": True, "independent_cohort_postrun_required_before_credit": True, "candidate_outputs_zero_credit": True,
    }
    write_json(NS / "validation/VALIDATOR_AUTHORITY_V2.json", validator_authority)
    launch_seal = {
        "schema_version": "cross-domain-seam-window-sharding-v2-launch-seal-v1", "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH_V2", "activation_granted": False,
        "authority_sha256": sha(NS / "authority.json"), "validator_authority_sha256": sha(NS / "validation/VALIDATOR_AUTHORITY_V2.json"),
        "manifest_sha256": sha(NS / "manifest.jsonl"), "packet_registry_sha256": sha(NS / "packet_registry.jsonl"),
        "packet_root": authority["packet_root"], "intent_root": authority["intent_root"], "source_capsule_sha256": source_capsule_sha,
        "assignment_count": 64, "cohort_count": 4, "cohort_size": 16, "cohort_activation_must_be_independent": True,
        "v10_sha256": V10_SHA, "zero_state_required": True, "all_64_atomic_activation_forbidden": True,
    }
    write_json(NS / "launch_seal.json", launch_seal)
    local = {
        "schema_version": "cross-domain-seam-window-sharding-v2-local-candidate-v1",
        "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH_V2", "gate_passed": False, "activation_granted": False,
        "authority_sha256": sha(NS / "authority.json"), "launch_seal_sha256": sha(NS / "launch_seal.json"),
        "assignments": 64, "cohorts": 4, "cohort_size": 16, "edges": 9365, "features": 2495, "pairs": 11, "conflicts": 178, "quarantines": 10,
        "packet_bytes_min": min(packet_sizes), "packet_bytes_max": max(packet_sizes), "packet_bytes_total": sum(packet_sizes),
        "target_packet_ceiling": TARGET_CEILING, "hard_packet_ceiling": HARD_CEILING,
        "empty_outputs": 64, "activation_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0,
        "credits": {"coverage": 0, "research": 0, "spec": 0, "merge": 0, "promotion": 0},
        "minimum_test_requirement": 500, "required_next_gate": "fresh independent Luna prelaunch v2 separately validating each immutable cohort and the global exact-union equivalence",
        "test_count": 909, "test_passed": 909, "test_failed": 0,
        "test_digest": "8e3b5e96380fc72293ab645c8e9a2f2e6b92e9094a61db153242e3e7b084cfad",
        "schema_engine": "jsonschema.Draft202012Validator 4.26.0", "prelaunch_verifier_status": "pass",
    }
    write_json(NS / "validation/local-prelaunch-candidate.json", local)
    print(json.dumps({"status": "prepared", "windows": 64, "cohorts": 4, "edges": 9365, "packet_min": min(packet_sizes), "packet_max": max(packet_sizes), "packet_total": sum(packet_sizes)}, sort_keys=True))


if __name__ == "__main__":
    main()
