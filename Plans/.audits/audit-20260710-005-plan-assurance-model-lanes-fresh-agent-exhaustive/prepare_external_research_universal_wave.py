#!/usr/bin/env python3
"""Deterministically prepare Audit 005 universal external-research wave 0001."""

from __future__ import annotations

import json
import os
import subprocess
from collections import defaultdict
from pathlib import Path
from typing import Any

from macro_v2_common import AUDIT_ID, ROOT, root_hash, sha


WAVE_ID = "universal-wave-0001"
ATTEMPT_ID = "attempt-0001"
ASSIGNMENT_COUNT = 24
NAMESPACE = ROOT / "master/external_research" / WAVE_ID
OUTPUT_ROOT = ROOT / "external_research_universal_v1"
POLICY_REF = "master/coordination/CONCURRENCY_POLICY_V3.json"
POLICY_SHA256 = "5d08356b2877734aa4a6e964675fc32abae6f57d83ede5dc11f38e9cea4a7bb3"
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
TARGET_PACKET_MIN = 180_000
TARGET_PACKET_MAX = 300_000
MAX_PACKET_BYTES = 450_000
FIELDS = [
    "provisional_feature_ref", "owner_domain", "title", "summary", "gap_summary", "spec_state",
    "risk_level", "research_questions", "source_documents", "source_unit_refs", "cross_domain_terms",
    "feature_kinds", "aliases", "local_feature_refs", "research_obligation_count", "scenario_obligation_count",
]


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def write_obj(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(canonical_json(value))


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"".join(canonical_json(row) for row in rows))


def load_obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError(f"not object:{path}")
    return value


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def digest_strings(values: list[str]) -> str:
    return sha(json.dumps(sorted(values), separators=(",", ":"), ensure_ascii=False).encode())


def ledger_rows_with_hashes(path: Path) -> list[tuple[dict[str, Any], str]]:
    rows: list[tuple[dict[str, Any], str]] = []
    for number, raw in enumerate(path.read_bytes().splitlines(keepends=True), 1):
        if not raw.strip():
            raise RuntimeError(f"blank ledger line:{number}")
        row = json.loads(raw)
        if not isinstance(row, dict):
            raise RuntimeError(f"non-object ledger line:{number}")
        rows.append((row, sha(raw)))
    return rows


def project(row: dict[str, Any], row_hash: str) -> dict[str, Any]:
    if any(field not in row for field in FIELDS):
        raise RuntimeError(f"ledger row missing research field:{row.get('provisional_feature_ref')}")
    value = {field: row[field] for field in FIELDS}
    value["source_row_sha256"] = row_hash
    return value


def allocate_domain_splits(domain_bytes: dict[str, int]) -> dict[str, int]:
    counts = {domain: 1 for domain in domain_bytes}
    while sum(counts.values()) < ASSIGNMENT_COUNT:
        domain = sorted(domain_bytes, key=lambda key: (-(domain_bytes[key] / counts[key]), key))[0]
        counts[domain] += 1
    return counts


def partition_by_bytes(rows: list[dict[str, Any]], count: int) -> list[list[dict[str, Any]]]:
    if count < 1 or len(rows) < count:
        raise RuntimeError("invalid packet partition count")
    sizes = [len(canonical_json(row)) for row in rows]
    parts: list[list[dict[str, Any]]] = []
    offset = 0
    remaining_bytes = sum(sizes)
    for part_index in range(count):
        remaining_parts = count - part_index
        if remaining_parts == 1:
            parts.append(rows[offset:])
            break
        target = remaining_bytes / remaining_parts
        start = offset
        used = 0
        max_take = len(rows) - offset - (remaining_parts - 1)
        while offset - start < max_take:
            next_size = sizes[offset]
            if offset > start and abs(used - target) <= abs((used + next_size) - target):
                break
            used += next_size
            offset += 1
        if offset == start:
            used += sizes[offset]
            offset += 1
        parts.append(rows[start:offset])
        remaining_bytes -= used
    if len(parts) != count or sum(len(part) for part in parts) != len(rows):
        raise RuntimeError("byte partition closure failure")
    return parts


def result_schema() -> dict[str, Any]:
    strings = {"type": "array", "items": {"type": "string", "minLength": 1}, "uniqueItems": True}
    source = {
        "type": "object", "additionalProperties": False,
        "required": ["source_id", "url", "title", "publisher", "source_type", "accessed_date", "section_anchor", "evidence_snippet", "applicability"],
        "properties": {
            "source_id": {"type": "string", "minLength": 1},
            "url": {"type": "string", "pattern": "^https://[^\\s]+$"},
            "title": {"type": "string", "minLength": 1}, "publisher": {"type": "string", "minLength": 1},
            "source_type": {"enum": ["official_standard", "official_product_documentation", "peer_reviewed_paper", "mature_open_source_documentation", "other_authoritative"]},
            "accessed_date": {"type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"},
            "section_anchor": {"type": "string", "minLength": 1},
            "evidence_snippet": {"type": "string", "minLength": 1, "maxLength": 500},
            "applicability": {"type": "string", "minLength": 1},
        },
    }
    claim = {
        "type": "object", "additionalProperties": False,
        "required": ["claim_id", "claim", "source_ids", "applicability"],
        "properties": {"claim_id": {"type": "string", "minLength": 1}, "claim": {"type": "string", "minLength": 1}, "source_ids": {**strings, "minItems": 1}, "applicability": {"type": "string", "minLength": 1}},
    }
    feature = {
        "type": "object", "additionalProperties": False,
        "required": ["provisional_feature_ref", "source_row_sha256", "research_group_id", "research_state", "search_attempts", "insufficient_evidence_reason", "sources", "supported_claims", "external_baseline_summary", "confirmed_gaps", "underspecifications", "contradictions", "missed_failure_modes", "conclusion_changed", "conclusion_change_summary", "proposed_spec_deltas", "scenario_implications", "adversarial_implications"],
        "properties": {
            "provisional_feature_ref": {"type": "string", "minLength": 1},
            "source_row_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
            "research_group_id": {"type": "string", "minLength": 1},
            "research_state": {"enum": ["researched", "blocked_insufficient_evidence"]},
            "search_attempts": {**strings, "minItems": 1},
            "insufficient_evidence_reason": {"type": ["string", "null"]},
            "sources": {"type": "array", "items": source},
            "supported_claims": {"type": "array", "items": claim},
            "external_baseline_summary": {"type": "string", "minLength": 1},
            "confirmed_gaps": strings, "underspecifications": strings, "contradictions": strings,
            "missed_failure_modes": strings, "conclusion_changed": {"type": "boolean"},
            "conclusion_change_summary": {"type": "string", "minLength": 1},
            "proposed_spec_deltas": strings, "scenario_implications": strings, "adversarial_implications": strings,
        },
        "allOf": [
            {"if": {"properties": {"research_state": {"const": "researched"}}}, "then": {"properties": {"sources": {"minItems": 2}, "supported_claims": {"minItems": 1}, "insufficient_evidence_reason": {"type": "null"}}}},
            {"if": {"properties": {"research_state": {"const": "blocked_insufficient_evidence"}}}, "then": {"properties": {"insufficient_evidence_reason": {"type": "string", "minLength": 1}}}},
        ],
    }
    attestations = ["live_public_web_browsed", "every_feature_researched_or_blocked", "authoritative_sources_prioritized", "per_feature_source_mapping_complete", "plans_not_edited", "no_peer_or_prior_research_used"]
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "additionalProperties": False,
        "required": ["audit_id", "schema_version", "phase", "assignment_id", "attempt_id", "task_thread_id", "model", "reasoning_effort", "status", "input_binding", "coverage", "feature_results", "self_attestation"],
        "properties": {
            "audit_id": {"const": AUDIT_ID}, "schema_version": {"const": "external-research-universal-result-v1"},
            "phase": {"const": "universal_external_research"}, "assignment_id": {"type": "string", "pattern": "^A005ERU-[0-9]{4}$"},
            "attempt_id": {"const": ATTEMPT_ID}, "task_thread_id": {"type": "string", "minLength": 1},
            "model": {"const": "gpt-5.6-sol"}, "reasoning_effort": {"const": "xhigh"}, "status": {"const": "completed"},
            "input_binding": {"type": "object", "additionalProperties": False, "required": ["packet_id", "packet_sha256", "feature_refs_digest", "source_rows_digest"], "properties": {"packet_id": {"type": "string", "pattern": "^ERUPKT-[0-9]{4}$"}, "packet_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"}, "feature_refs_digest": {"type": "string", "pattern": "^[0-9a-f]{64}$"}, "source_rows_digest": {"type": "string", "pattern": "^[0-9a-f]{64}$"}}},
            "coverage": {"type": "object", "additionalProperties": False, "required": ["feature_count", "feature_refs"], "properties": {"feature_count": {"type": "integer", "minimum": 1}, "feature_refs": strings}},
            "feature_results": {"type": "array", "minItems": 1, "items": feature},
            "self_attestation": {"type": "object", "additionalProperties": False, "required": attestations, "properties": {key: {"const": True} for key in attestations}},
        },
    }


def leaf_prompt() -> dict[str, Any]:
    return {
        "schema_version": "external-research-universal-leaf-prompt-v1",
        "prompt": (
            "Execute only the assigned Audit 005 universal external-research intent. Read only the absolute dispatch intent, "
            "its one immutable research packet, and the strict result schema. Verify hashes and your fresh canonical identity. "
            "Browse the live public web and independently research every assigned provisional feature. Prioritize official standards, "
            "official product documentation, peer-reviewed papers, and mature open-source implementation documentation. Never use "
            "blogs or SEO summaries as sole support. Obtain at least two authoritative sources per feature when available. If that is "
            "not possible after genuine searching, emit blocked_insufficient_evidence with the searches attempted and a specific reason. "
            "Every source must include a direct HTTPS URL, title, publisher, source type, accessed date, supported-claim mapping, and a "
            "short non-infringing evidence snippet or exact section anchor. Shared research groups are allowed only when every feature has "
            "an explicit applicability statement, its own result record, and its own source/claim mapping. Do not merely summarize links. "
            "For each feature compare the Plans-derived record with external baselines; identify confirmed gaps, underspecification, "
            "contradictions, and missed failure modes; state whether the conclusion changes; propose concrete spec deltas without editing "
            "Plans; and record scenario and adversarial implications. Cover every packet feature exactly once. Read no prior research, peer "
            "outputs, or unrelated audit artifacts. Spawn no descendants and accept no follow-up. Write exactly one result.json in the "
            "assigned output directory, use your canonical agent path as task_thread_id, and return exactly PMR1."
        ),
    }


def main() -> None:
    if NAMESPACE.exists() or OUTPUT_ROOT.exists():
        raise RuntimeError("refusing to overwrite universal research namespace")
    policy_path = ROOT / POLICY_REF
    if not policy_path.is_file() or sha(policy_path.read_bytes()) != POLICY_SHA256:
        raise RuntimeError("CONCURRENCY_POLICY_V3 binding mismatch")
    active_path = ROOT / "master/owner_merge/live/ACTIVE.json"
    active = load_obj(active_path)
    if active.get("status") != "ACTIVE_OWNER_SHARDS_COMPLETE":
        raise RuntimeError("owner ACTIVE is not complete")
    commit_path = ROOT / active["commit_ref"]
    coverage_path = ROOT / active["coverage_ref"]
    ledger_path = ROOT / active["provisional_feature_ledger_ref"]
    if sha(commit_path.read_bytes()) != active["commit_sha256"] or load_obj(commit_path).get("status") != "pass":
        raise RuntimeError("owner commit binding mismatch")
    if sha(coverage_path.read_bytes()) != active["coverage_sha256"] or load_obj(coverage_path).get("complete") is not True:
        raise RuntimeError("owner coverage binding mismatch")
    if sha(ledger_path.read_bytes()) != active["provisional_feature_ledger_sha256"]:
        raise RuntimeError("owner provisional ledger binding mismatch")
    ledger = ledger_rows_with_hashes(ledger_path)
    if len(ledger) != 3888:
        raise RuntimeError("owner ledger count is not 3888")
    projected = [project(row, row_hash) for row, row_hash in ledger]
    refs = [row["provisional_feature_ref"] for row in projected]
    if len(refs) != len(set(refs)):
        raise RuntimeError("owner ledger provisional refs are not unique")
    by_domain: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in projected:
        by_domain[row["owner_domain"]].append(row)
    if len(by_domain) != 16:
        raise RuntimeError("owner domain count is not 16")
    for rows in by_domain.values():
        rows.sort(key=lambda row: row["provisional_feature_ref"])
    domain_bytes = {domain: sum(len(canonical_json(row)) for row in rows) for domain, rows in by_domain.items()}
    split_counts = allocate_domain_splits(domain_bytes)
    if sum(split_counts.values()) != ASSIGNMENT_COUNT:
        raise RuntimeError("domain split allocation does not total 24")

    packets: list[dict[str, Any]] = []
    assignments: list[dict[str, Any]] = []
    registry: list[dict[str, Any]] = []
    sequence = 0
    for domain in sorted(by_domain):
        parts = partition_by_bytes(by_domain[domain], split_counts[domain])
        for slice_index, features in enumerate(parts, 1):
            sequence += 1
            assignment_id = f"A005ERU-{sequence:04d}"
            packet_id = f"ERUPKT-{sequence:04d}"
            feature_refs = [row["provisional_feature_ref"] for row in features]
            row_hashes = [row["source_row_sha256"] for row in features]
            packet = {
                "audit_id": AUDIT_ID, "schema_version": "external-research-universal-packet-v1",
                "wave_id": WAVE_ID, "packet_id": packet_id, "assignment_id": assignment_id,
                "attempt_id": ATTEMPT_ID, "owner_domain": domain, "domain_slice_index": slice_index,
                "domain_slice_count": len(parts), "feature_count": len(features), "feature_refs": feature_refs,
                "feature_refs_digest": digest_strings(feature_refs), "source_rows_digest": digest_strings(row_hashes),
                "features": features, "result_schema_ref": "schemas/external_research_universal_result.schema.json",
                "research_contract": {
                    "universal_requirement": "Every feature requires live public-web external research and an explicit result/source mapping.",
                    "source_priority": "Official standards, official product documentation, peer-reviewed papers, and mature open-source implementation documentation.",
                    "minimum_sources": "At least two authoritative sources when available; otherwise blocked_insufficient_evidence with searches attempted.",
                    "analysis_requirement": "Compare external baselines, identify gaps/underspecification/contradictions/failure modes, conclusion changes, spec deltas, and scenario/adversarial implications.",
                    "scope": "Do not edit Plans or read peer/prior research; write exactly one result.json and return PMR1.",
                },
            }
            packet_bytes = len(canonical_json(packet))
            if packet_bytes > MAX_PACKET_BYTES:
                raise RuntimeError(f"packet over 450KB ceiling:{assignment_id}:{packet_bytes}")
            output = OUTPUT_ROOT / assignment_id / "attempts" / ATTEMPT_ID
            assignment = {
                "audit_id": AUDIT_ID, "schema_version": "external-research-universal-assignment-v1",
                "wave_id": WAVE_ID, "assignment_id": assignment_id, "attempt_id": ATTEMPT_ID,
                "packet_id": packet_id, "packet_ref": f"packets/{packet_id}.json", "packet_bytes": packet_bytes,
                "owner_domain": domain, "domain_slice_index": slice_index, "domain_slice_count": len(parts),
                "feature_count": len(features), "feature_refs": feature_refs,
                "feature_refs_digest": packet["feature_refs_digest"], "source_rows_digest": packet["source_rows_digest"],
                "source_row_sha256_by_feature": {row["provisional_feature_ref"]: row["source_row_sha256"] for row in features},
                "result_schema_ref": "schemas/external_research_universal_result.schema.json",
                "output_directory": output.relative_to(ROOT).as_posix(), "model": "gpt-5.6-sol",
                "reasoning_effort": "xhigh", "fresh_child_required": True, "fork_turns": "none",
                "descendants_forbidden": True, "followup_messages_forbidden": True,
                "prospective_agent_path": f"/root/a005_external_research_universal_{sequence:04d}_attempt_0001_terminal",
                "coverage_credit_before_validation": 0, "research_credit_before_validation": 0,
            }
            packets.append(packet)
            assignments.append(assignment)
    if sequence != ASSIGNMENT_COUNT:
        raise RuntimeError("assignment count is not exact 24")
    covered = [ref for assignment in assignments for ref in assignment["feature_refs"]]
    if len(covered) != 3888 or len(set(covered)) != 3888 or set(covered) != set(refs):
        raise RuntimeError("universal feature partition mismatch")

    test = subprocess.run(["python3", "-B", "test_external_research_universal_validator.py"], cwd=ROOT, capture_output=True, text=True, check=False)
    if test.returncode != 0 or json.loads(test.stdout).get("status") != "pass":
        raise RuntimeError("external research validator negative tests failed")
    NAMESPACE.mkdir(parents=True)
    OUTPUT_ROOT.mkdir(parents=True)
    for packet, assignment in zip(packets, assignments):
        packet_path = NAMESPACE / assignment["packet_ref"]
        write_obj(packet_path, packet)
        assignment["packet_sha256"] = sha(packet_path.read_bytes())
        registry.append({"assignment_id": assignment["assignment_id"], "packet_id": assignment["packet_id"], "packet_ref": assignment["packet_ref"], "packet_sha256": assignment["packet_sha256"], "packet_bytes": assignment["packet_bytes"], "owner_domain": assignment["owner_domain"], "feature_count": assignment["feature_count"], "feature_refs_digest": assignment["feature_refs_digest"], "source_rows_digest": assignment["source_rows_digest"]})
        output = ROOT / assignment["output_directory"]
        output.mkdir(parents=True)
        intent = {
            "audit_id": AUDIT_ID, "schema_version": "external-research-universal-dispatch-intent-v1",
            "wave_id": WAVE_ID, "assignment_id": assignment["assignment_id"], "attempt_id": ATTEMPT_ID,
            "assignment_record_sha256": sha(canonical_json(assignment)), "packet_ref": str(packet_path),
            "packet_sha256": assignment["packet_sha256"], "result_schema_ref": str(NAMESPACE / assignment["result_schema_ref"]),
            "output_directory": str(output), "prospective_agent_path": assignment["prospective_agent_path"],
            "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "fresh_child_required": True,
            "fork_turns": "none", "descendants_forbidden": True, "followup_messages_forbidden": True,
            "result_contract": "write exactly one strict result.json in output_directory",
            "terminal_contract": "return exactly PMR1 after result.json; write no other file",
            "receipt_ref": str(NAMESPACE / "dispatch" / assignment["assignment_id"] / ATTEMPT_ID / "dispatch_receipt.json"),
            "coverage_credit_before_validation": 0, "research_credit_before_validation": 0,
        }
        write_obj(NAMESPACE / "dispatch" / assignment["assignment_id"] / ATTEMPT_ID / "dispatch_intent.json", intent)
    write_jsonl(NAMESPACE / "batch_manifest.jsonl", assignments)
    write_jsonl(NAMESPACE / "packet_registry.jsonl", registry)
    write_obj(NAMESPACE / "schemas/external_research_universal_result.schema.json", result_schema())
    write_obj(NAMESPACE / "leaf_prompt.json", leaf_prompt())
    receipt_contract = {
        "schema_version": "external-research-universal-receipt-contract-v1",
        "required_keys": ["audit_id", "schema_version", "wave_id", "assignment_id", "attempt_id", "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort", "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory"],
        "constants": {"audit_id": AUDIT_ID, "schema_version": "external-research-universal-dispatch-receipt-v1", "wave_id": WAVE_ID, "controller_thread_id": CONTROLLER, "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "fresh_child": True, "fork_turns": "none"},
        "identity_rule": "agent_path and task_thread_id must equal the assignment prospective_agent_path",
    }
    write_obj(NAMESPACE / "receipt_contract.json", receipt_contract)
    write_obj(NAMESPACE / "lineage.json", {
        "audit_id": AUDIT_ID, "schema_version": "external-research-universal-lineage-v1",
        "owner_active_ref": active_path.relative_to(ROOT).as_posix(), "owner_active_sha256": sha(active_path.read_bytes()),
        "owner_commit_ref": active["commit_ref"], "owner_commit_sha256": active["commit_sha256"],
        "owner_coverage_ref": active["coverage_ref"], "owner_coverage_sha256": active["coverage_sha256"],
        "owner_provisional_ledger_ref": active["provisional_feature_ledger_ref"], "owner_provisional_ledger_sha256": active["provisional_feature_ledger_sha256"],
        "provisional_feature_count": 3888, "owner_domain_count": 16,
    })
    write_obj(NAMESPACE / "architecture.json", {
        "audit_id": AUDIT_ID, "schema_version": "external-research-universal-architecture-v1",
        "assignment_count": 24, "owner_domain_count": 16, "feature_count": 3888,
        "packet_target_bytes": [TARGET_PACKET_MIN, TARGET_PACKET_MAX], "packet_hard_ceiling_bytes": MAX_PACKET_BYTES,
        "domain_split_counts": split_counts, "allocation_rule": "one packet per domain, then greedily split the largest current domain-byte share; contiguous feature-ref-ordered byte-balanced partitions",
        "concurrency_policy_ref": POLICY_REF, "concurrency_policy_sha256": POLICY_SHA256,
        "sol_leaf_count": 24, "separately_authorized_luna_research_leaf_count": 8, "exact_coexistence_cap": 32,
        "coexistence_requires_independent_gating": True, "coverage_credit_before_validation": 0,
        "research_credit_before_validation": 0, "canonical_plan_writes_authorized": False,
    })
    payload_files = sorted(path for path in NAMESPACE.rglob("*") if path.is_file())
    authority = {
        "audit_id": AUDIT_ID, "schema_version": "external-research-universal-batch-authority-v1",
        "wave_id": WAVE_ID, "status": "PREPARED_UNBOUND_ZERO_CREDIT_ZERO_RESEARCH_CREDIT",
        "assignment_count": 24, "feature_count": 3888, "owner_domain_count": 16,
        "assignment_ids": [row["assignment_id"] for row in assignments],
        "coverage_digest": digest_strings(refs), "batch_manifest_sha256": sha((NAMESPACE / "batch_manifest.jsonl").read_bytes()),
        "packet_registry_sha256": sha((NAMESPACE / "packet_registry.jsonl").read_bytes()),
        "leaf_prompt_sha256": sha((NAMESPACE / "leaf_prompt.json").read_bytes()),
        "receipt_contract_sha256": sha((NAMESPACE / "receipt_contract.json").read_bytes()),
        "result_schema_sha256": sha((NAMESPACE / "schemas/external_research_universal_result.schema.json").read_bytes()),
        "lineage_sha256": sha((NAMESPACE / "lineage.json").read_bytes()), "architecture_sha256": sha((NAMESPACE / "architecture.json").read_bytes()),
        "payload_root_sha256": root_hash(payload_files, NAMESPACE),
        "preparation_script_sha256": sha((ROOT / "prepare_external_research_universal_wave.py").read_bytes()),
        "verifier_script_sha256": sha((ROOT / "verify_external_research_universal_wave.py").read_bytes()),
        "validator_script_sha256": sha((ROOT / "validate_external_research_universal_batch.py").read_bytes()),
        "test_script_sha256": sha((ROOT / "test_external_research_universal_validator.py").read_bytes()),
        "concurrency_policy_sha256": POLICY_SHA256, "controller_thread_id": CONTROLLER,
        "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "fork_turns": "none",
        "coverage_credit_before_validation": 0, "research_credit_before_validation": 0,
        "activation_authorized": False, "canonical_plan_writes_authorized": False,
    }
    write_obj(NAMESPACE / "batch_authority.json", authority)
    seal_files = sorted(path for path in NAMESPACE.rglob("*") if path.is_file())
    write_obj(NAMESPACE / "launch_seal.json", {
        "audit_id": AUDIT_ID, "schema_version": "external-research-universal-launch-seal-v1",
        "wave_id": WAVE_ID, "status": "CANDIDATE_AWAITING_INDEPENDENT_GATING",
        "batch_authority_sha256": sha((NAMESPACE / "batch_authority.json").read_bytes()),
        "sealed_payload_root_sha256": root_hash(seal_files, NAMESPACE),
        "coverage_credit": 0, "research_credit": 0, "activation_authorized": False,
    })
    process = subprocess.run(["python3", "-B", "verify_external_research_universal_wave.py"], cwd=ROOT, capture_output=True, text=True, check=False)
    if process.returncode != 0 or not process.stdout.strip():
        raise RuntimeError(f"universal research verifier failed:{process.stdout}:{process.stderr}")
    report = json.loads(process.stdout)
    if report.get("status") != "pass" or report.get("errors") != []:
        raise RuntimeError(f"universal research verification failed:{report}")
    write_obj(NAMESPACE / "validation/local-prelaunch-candidate.json", report)
    print(json.dumps({
        "status": "prepared_unbound_zero_credit_zero_research_credit", "wave_id": WAVE_ID,
        "assignments": len(assignments), "features": len(covered), "domains": len(by_domain),
        "packet_bytes_min": min(row["packet_bytes"] for row in assignments),
        "packet_bytes_max": max(row["packet_bytes"] for row in assignments),
        "packet_bytes_total": sum(row["packet_bytes"] for row in assignments),
        "coverage_digest": digest_strings(refs), "domain_split_counts": split_counts,
        "batch_authority_sha256": sha((NAMESPACE / "batch_authority.json").read_bytes()),
        "launch_seal_sha256": sha((NAMESPACE / "launch_seal.json").read_bytes()),
        "local_prelaunch_candidate_sha256": sha((NAMESPACE / "validation/local-prelaunch-candidate.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
