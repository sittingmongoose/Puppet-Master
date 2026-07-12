#!/usr/bin/env python3
"""Shared deterministic mechanics for Audit 005 universal shadow certification."""

from __future__ import annotations

import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


AUDIT_ROOT = Path(__file__).resolve().parent
AUDIT_ID = AUDIT_ROOT.name
SOURCE_WAVE_ID = "universal-wave-0001"
WAVE_ID = "universal-shadow-certification-wave-0001"
ATTEMPT_ID = "attempt-0001"
ASSIGNMENT_COUNT = 16
FEATURES_PER_ASSIGNMENT = 243
FEATURE_COUNT = 3888
PACKET_CEILING_BYTES = 900_000
MODEL = "gpt-5.6-sol"
EFFORT = "xhigh"
CONTROLLER_THREAD_ID = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
V9_REF = "master/coordination/CONCURRENCY_POLICY_V9.json"
V9_SHA256 = "0f9dae3c8406be8ab1159f610b6465120049d0057aa81031d6826fb9ba88b592"
NAMESPACE = AUDIT_ROOT / "master/external_research" / WAVE_ID
SOURCE_NAMESPACE = AUDIT_ROOT / "master/external_research" / SOURCE_WAVE_ID
OUTPUT_ROOT = AUDIT_ROOT / "external_research_universal_shadow_certification_v1"

SOURCE_HASHES = {
    "batch_authority.json": "ef58c6c758acf17f8bccfafae999233ad42fe2d907565d74f4319cab100db1b1",
    "batch_manifest.jsonl": "1df2601bc731f47ae991ec2bd5ba60f801ba7fd003473970675dccd746058e7a",
    "packet_registry.jsonl": "c50d489212d9f5ca14e20aa9c75cb15c55cecabea27140d29129547142c4012d",
    "launch_seal.json": "f38acb7b88c2282465bedd3c81a9968f1fc724b1f28305509fbeaf51b5e35135",
    "validation/activation.json": "c8c8d83e19a8ec82d869bc74528053d887a042b545afe4293f08ccf964758e3e",
    "validation/master-independent-prelaunch.json": "bcf0382157e8ff69fe98c8cd4743b8f23932e3834ec5d70568f5cb67979705af",
    "validation/primary-postrun.json": "1256add17ed50ffc38d2e6dfaf013fb11843e194edba0f9e0bc35b1d2593ee02",
    "runtime/native_capture.json": "70eeaf93092a05ffe36f4b5f17356bba751646b23d65eebcb567b38d051e45ee",
    "leaf_prompt.json": "954e7a3984a0b1700633b8109a4d71c2fc667d4c382d82b4ab1798075e60dad4",
    "receipt_contract.json": "edaa78bcf057c950dacc479efec42967ade3d7d6d2f070c3064ef8487d2b6ee7",
    "schemas/external_research_universal_result.schema.json": "5fff1a72d98a8ead0f042a438538d3662132ed35823bc49d6b1ac0d9a50a06e6",
}
SOURCE_COVERAGE_DIGEST = "91f8e13d91dc3615781c9592abade65072b45514a4b515471e96750409586ca3"


class ValidationError(RuntimeError):
    pass


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha_file(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def digest_values(values: list[str]) -> str:
    return sha_bytes(json.dumps(sorted(values), separators=(",", ":"), ensure_ascii=False).encode("utf-8"))


def object_digest(value: Any) -> str:
    return sha_bytes(canonical_json(value))


def load_object(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValidationError("not-object:%s" % path)
    return value


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    if any(not isinstance(row, dict) for row in rows):
        raise ValidationError("jsonl-non-object:%s" % path)
    return rows


def root_hash(paths: list[Path], root: Path) -> str:
    rows = [{"path": str(path.relative_to(root)), "sha256": sha_file(path)} for path in sorted(paths)]
    return object_digest(rows)


def assignment_id(index: int) -> str:
    return "A005ERSC-%04d" % index


def packet_id(index: int) -> str:
    return "ERSCPKT-%04d" % index


def agent_path(index: int) -> str:
    return "/root/a005_external_research_universal_shadow_certification_%04d_attempt_0001_terminal" % index


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise ValidationError(message)


def _resolve_source_output(value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else AUDIT_ROOT / path


def reconstruct_source_snapshot() -> dict[str, Any]:
    """Validate the immutable source transaction and reconstruct feature bindings."""
    for relative, expected in SOURCE_HASHES.items():
        path = SOURCE_NAMESPACE / relative
        _require(path.is_file(), "source-file-missing:%s" % relative)
        _require(sha_file(path) == expected, "source-hash-mismatch:%s" % relative)
    v9_path = AUDIT_ROOT / V9_REF
    _require(v9_path.is_file() and sha_file(v9_path) == V9_SHA256, "v9-policy-mismatch")

    authority = load_object(SOURCE_NAMESPACE / "batch_authority.json")
    activation = load_object(SOURCE_NAMESPACE / "validation/activation.json")
    postrun = load_object(SOURCE_NAMESPACE / "validation/primary-postrun.json")
    capture = load_object(SOURCE_NAMESPACE / "runtime/native_capture.json")
    manifest = load_jsonl(SOURCE_NAMESPACE / "batch_manifest.jsonl")
    registry = load_jsonl(SOURCE_NAMESPACE / "packet_registry.jsonl")
    _require(authority.get("assignment_count") == 24 and authority.get("feature_count") == FEATURE_COUNT, "source-authority-count")
    _require(activation.get("status") == "ACTIVE_FOR_EXACTLY_24_FRESH_SOL_XHIGH_LEAVES", "source-activation-status")
    _require(postrun.get("status") == "pass", "source-postrun-status")
    _require(len(manifest) == 24 and len(registry) == 24, "source-manifest-registry-count")
    expected_source_ids = ["A005ERU-%04d" % index for index in range(1, 25)]
    _require([row.get("assignment_id") for row in manifest] == expected_source_ids, "source-manifest-order")
    eligible = [row.get("assignment_id") for row in postrun.get("results", []) if row.get("state") == "eligible"]
    _require(eligible == expected_source_ids, "source-postrun-eligibility")
    capture_by_id = {row.get("assignment_id"): row for row in capture.get("leaves", [])}
    _require(set(capture_by_id) == set(expected_source_ids), "source-native-capture-set")
    _require(len({row.get("native_child_thread_id") for row in capture_by_id.values()}) == 24, "source-native-thread-uniqueness")
    _require(len({row.get("native_child_turn_id") for row in capture_by_id.values()}) == 24, "source-native-turn-uniqueness")

    records: list[dict[str, Any]] = []
    source_result_hashes: dict[str, str] = {}
    source_packet_hashes: dict[str, str] = {}
    for manifest_index, row in enumerate(manifest, 1):
        aid = row["assignment_id"]
        packet_path = SOURCE_NAMESPACE / row["packet_ref"]
        intent_path = SOURCE_NAMESPACE / "dispatch" / aid / ATTEMPT_ID / "dispatch_intent.json"
        receipt_path = intent_path.with_name("dispatch_receipt.json")
        output_dir = _resolve_source_output(row["output_directory"])
        result_path = output_dir / "result.json"
        for path, label in ((packet_path, "packet"), (intent_path, "intent"), (receipt_path, "receipt"), (result_path, "result")):
            _require(path.is_file(), "source-%s-missing:%s" % (label, aid))
        packet_raw = packet_path.read_bytes()
        result_raw = result_path.read_bytes()
        _require(sha_bytes(packet_raw) == row.get("packet_sha256"), "source-packet-hash:%s" % aid)
        packet = json.loads(packet_raw)
        intent = load_object(intent_path)
        receipt = load_object(receipt_path)
        result = json.loads(result_raw)
        _require(intent.get("packet_sha256") == row.get("packet_sha256"), "source-intent-packet:%s" % aid)
        _require(receipt.get("dispatch_intent_sha256") == sha_file(intent_path), "source-receipt-intent:%s" % aid)
        _require(receipt.get("packet_sha256") == row.get("packet_sha256"), "source-receipt-packet:%s" % aid)
        _require(receipt.get("agent_path") == receipt.get("task_thread_id") == result.get("task_thread_id"), "source-result-receipt-identity:%s" % aid)
        native = capture_by_id[aid]
        _require(native.get("agent_path") == receipt.get("agent_path"), "source-capture-path:%s" % aid)
        _require(native.get("native_child_turn_status") == "completed", "source-capture-terminal:%s" % aid)
        _require(str(native.get("terminal_response_prefix", "")).startswith("PMR1"), "source-capture-pmr1:%s" % aid)
        _require(result.get("status") == "completed" and result.get("assignment_id") == aid, "source-result-status:%s" % aid)
        packet_features = packet.get("features", [])
        result_features = result.get("feature_results", [])
        _require(len(packet_features) == len(result_features) == row.get("feature_count"), "source-feature-count:%s" % aid)
        packet_by_ref = {feature.get("provisional_feature_ref"): (index, feature) for index, feature in enumerate(packet_features)}
        result_by_ref = {feature.get("provisional_feature_ref"): (index, feature) for index, feature in enumerate(result_features)}
        _require(set(packet_by_ref) == set(result_by_ref) == set(row.get("feature_refs", [])), "source-feature-set:%s" % aid)
        result_sha = sha_bytes(result_raw)
        packet_sha = sha_bytes(packet_raw)
        source_result_hashes[aid] = result_sha
        source_packet_hashes[aid] = packet_sha
        for ref in sorted(packet_by_ref):
            packet_feature_index, plan = packet_by_ref[ref]
            result_feature_index, research = result_by_ref[ref]
            _require(plan.get("source_row_sha256") == research.get("source_row_sha256"), "source-row-binding:%s" % ref)
            sources = research.get("sources", [])
            claims = research.get("supported_claims", [])
            source_ids = [source.get("source_id") for source in sources]
            _require(len(source_ids) == len(set(source_ids)), "source-registry-duplicate:%s" % ref)
            _require(all(set(claim.get("source_ids", [])).issubset(set(source_ids)) for claim in claims), "source-claim-unbound:%s" % ref)
            compact_sources = [{
                "source_id": source["source_id"],
                "url": source["url"],
                "title": source["title"],
                "publisher": source["publisher"],
                "source_type": source["source_type"],
                "accessed_date": source["accessed_date"],
                "section_anchor": source["section_anchor"],
                "source_record_sha256": object_digest(source),
                "evidence_record_sha256": object_digest({"evidence_snippet": source["evidence_snippet"], "applicability": source["applicability"]}),
            } for source in sources]
            compact_claims = [{
                "claim_id": claim["claim_id"],
                "source_ids": claim["source_ids"],
                "claim_record_sha256": object_digest(claim),
            } for claim in claims]
            marker_fields = ["confirmed_gaps", "underspecifications", "contradictions", "missed_failure_modes", "proposed_spec_deltas", "insufficient_evidence_reason"]
            gap_markers = {field: {
                "count": len(research.get(field, [])) if isinstance(research.get(field), list) else (1 if research.get(field) else 0),
                "sha256": object_digest(research.get(field)),
            } for field in marker_fields}
            records.append({
                "provisional_feature_ref": ref,
                "owner_domain": plan["owner_domain"],
                "source_assignment_id": aid,
                "source_packet_ref": str(packet_path),
                "source_packet_sha256": packet_sha,
                "source_packet_feature_index": packet_feature_index,
                "source_result_ref": str(result_path),
                "source_result_sha256": result_sha,
                "source_result_feature_index": result_feature_index,
                "source_row_sha256": plan["source_row_sha256"],
                "plan_source_documents": plan.get("source_documents", []),
                "plan_source_unit_refs": plan.get("source_unit_refs", []),
                "research_state": research["research_state"],
                "research_group_id": research["research_group_id"],
                "source_registry_refs": compact_sources,
                "supported_claim_refs": compact_claims,
                "source_registry_digest": object_digest(sources),
                "supported_claims_digest": object_digest(claims),
                "research_gap_markers": gap_markers,
            })

    refs = [record["provisional_feature_ref"] for record in records]
    _require(len(refs) == len(set(refs)) == FEATURE_COUNT, "source-feature-global-coverage")
    _require(digest_values(refs) == SOURCE_COVERAGE_DIGEST, "source-coverage-digest")
    return {
        "records": records,
        "manifest": manifest,
        "source_result_hashes": source_result_hashes,
        "source_packet_hashes": source_packet_hashes,
        "source_domain_counts": dict(sorted(Counter(record["owner_domain"] for record in records).items())),
        "source_assignment_counts": dict(sorted(Counter(record["source_assignment_id"] for record in records).items())),
    }


def partition_records(records: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    """Cross-source/domain deterministic round-robin with exact fixed capacity."""
    queues: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        queues[(record["owner_domain"], record["source_assignment_id"])].append(record)
    for queue in queues.values():
        queue.sort(key=lambda record: record["provisional_feature_ref"])
    bins: list[list[dict[str, Any]]] = [[] for _ in range(ASSIGNMENT_COUNT)]
    domain_counts = [Counter() for _ in bins]
    source_counts = [Counter() for _ in bins]
    while any(queues.values()):
        for key in sorted(queues):
            queue = queues[key]
            if not queue:
                continue
            domain, source_assignment = key
            candidates = [index for index, bucket in enumerate(bins) if len(bucket) < FEATURES_PER_ASSIGNMENT]
            _require(bool(candidates), "partition-capacity-exhausted")
            index = min(candidates, key=lambda candidate: (
                domain_counts[candidate][domain],
                source_counts[candidate][source_assignment],
                len(bins[candidate]),
                candidate,
            ))
            record = queue.pop(0)
            bins[index].append(record)
            domain_counts[index][domain] += 1
            source_counts[index][source_assignment] += 1
    _require(all(len(bucket) == FEATURES_PER_ASSIGNMENT for bucket in bins), "partition-not-243-each")
    refs = [record["provisional_feature_ref"] for bucket in bins for record in bucket]
    _require(len(refs) == len(set(refs)) == FEATURE_COUNT, "partition-coverage")
    _require(all(len({record["owner_domain"] for record in bucket}) == 16 for bucket in bins), "partition-domain-balance")
    _require(all(len({record["source_assignment_id"] for record in bucket}) == 24 for bucket in bins), "partition-source-balance")
    return bins


def build_packets() -> list[dict[str, Any]]:
    snapshot = reconstruct_source_snapshot()
    buckets = partition_records(snapshot["records"])
    packets = []
    for index, records in enumerate(buckets, 1):
        aid = assignment_id(index)
        refs = [record["provisional_feature_ref"] for record in records]
        packet = {
            "audit_id": AUDIT_ID,
            "schema_version": "external-research-universal-shadow-certification-packet-v1",
            "wave_id": WAVE_ID,
            "assignment_id": aid,
            "attempt_id": ATTEMPT_ID,
            "packet_id": packet_id(index),
            "feature_count": FEATURES_PER_ASSIGNMENT,
            "feature_refs": refs,
            "feature_refs_digest": digest_values(refs),
            "owner_domain_counts": dict(sorted(Counter(record["owner_domain"] for record in records).items())),
            "source_assignment_counts": dict(sorted(Counter(record["source_assignment_id"] for record in records).items())),
            "features": records,
        }
        _require(len(canonical_json(packet)) <= PACKET_CEILING_BYTES, "packet-ceiling:%s" % aid)
        packets.append(packet)
    return packets


def result_schema() -> dict[str, Any]:
    strings = {"type": "array", "items": {"type": "string", "minLength": 1}, "uniqueItems": True}
    citation = {
        "type": "object", "additionalProperties": False,
        "required": ["citation_id", "url", "title", "publisher", "source_type", "accessed_date", "section_anchor", "supported_certification_claims", "evidence_label"],
        "properties": {
            "citation_id": {"type": "string", "minLength": 1},
            "url": {"type": "string", "pattern": "^https://[^\\s]+$"},
            "title": {"type": "string", "minLength": 1},
            "publisher": {"type": "string", "minLength": 1},
            "source_type": {"enum": ["official_standard", "official_product_documentation", "peer_reviewed_paper", "mature_open_source_documentation", "other_authoritative"]},
            "accessed_date": {"type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"},
            "section_anchor": {"type": "string", "minLength": 1},
            "supported_certification_claims": {**strings, "minItems": 1},
            "evidence_label": {"type": "string", "minLength": 1, "maxLength": 500},
        },
    }
    finding = {
        "type": "object", "additionalProperties": False,
        "required": ["finding_id", "category", "statement", "severity", "citation_ids", "source_claim_ids", "normalized_spec_implication"],
        "properties": {
            "finding_id": {"type": "string", "minLength": 1},
            "category": {"enum": ["source_existence", "authority", "recency", "relevance", "claim_support", "contradictory_practice", "competitor_gap", "standards_gap", "security_gap", "privacy_gap", "accessibility_gap", "operational_gap", "underspecification"]},
            "statement": {"type": "string", "minLength": 1},
            "severity": {"enum": ["info", "low", "medium", "high", "critical"]},
            "citation_ids": strings,
            "source_claim_ids": strings,
            "normalized_spec_implication": {"type": "string", "minLength": 1},
        },
    }
    feature = {
        "type": "object", "additionalProperties": False,
        "required": ["provisional_feature_ref", "source_row_sha256", "source_result_sha256", "decision", "decision_reason", "plan_atom_review", "source_registry_review", "claim_mapping_review", "coverage_dimensions", "citations", "findings", "live_web_research_performed", "under_specified"],
        "properties": {
            "provisional_feature_ref": {"type": "string", "minLength": 1},
            "source_row_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
            "source_result_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
            "decision": {"enum": ["pass", "uncertain", "fail"]},
            "decision_reason": {"type": "string", "minLength": 1},
            "plan_atom_review": {"type": "string", "minLength": 1},
            "source_registry_review": {"type": "string", "minLength": 1},
            "claim_mapping_review": {"type": "string", "minLength": 1},
            "coverage_dimensions": {"type": "object", "additionalProperties": False, "required": ["competitors", "standards", "security", "privacy", "accessibility", "operations"], "properties": {key: {"enum": ["verified", "gap", "not_applicable_with_rationale"]} for key in ["competitors", "standards", "security", "privacy", "accessibility", "operations"]}},
            "citations": {"type": "array", "items": citation},
            "findings": {"type": "array", "items": finding},
            "live_web_research_performed": {"type": "boolean"},
            "under_specified": {"type": "boolean"},
        },
        "allOf": [
            {"if": {"properties": {"decision": {"enum": ["uncertain", "fail"]}}}, "then": {"properties": {"citations": {"minItems": 1}, "findings": {"minItems": 1}}}},
            {"if": {"properties": {"decision": {"const": "pass"}}}, "then": {"properties": {"citations": {"minItems": 1}}}},
        ],
    }
    attestations = ["every_feature_certified_once", "source_files_and_hashes_verified", "claim_to_source_mapping_rechecked", "live_web_used_when_needed", "no_promotion_merge_repair_or_source_edit", "no_descendants_or_peer_outputs"]
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object", "additionalProperties": False,
        "required": ["audit_id", "schema_version", "phase", "wave_id", "assignment_id", "attempt_id", "agent_path", "model", "reasoning_effort", "status", "input_binding", "coverage", "feature_certifications", "self_attestation"],
        "properties": {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "external-research-universal-shadow-certification-result-v1"},
            "phase": {"const": "universal_external_research_shadow_certification"},
            "wave_id": {"const": WAVE_ID},
            "assignment_id": {"type": "string", "pattern": "^A005ERSC-[0-9]{4}$"},
            "attempt_id": {"const": ATTEMPT_ID},
            "agent_path": {"type": "string", "pattern": "^/root/a005_external_research_universal_shadow_certification_[0-9]{4}_attempt_0001_terminal$"},
            "model": {"const": MODEL}, "reasoning_effort": {"const": EFFORT}, "status": {"const": "completed"},
            "input_binding": {"type": "object", "additionalProperties": False, "required": ["packet_id", "packet_sha256", "feature_refs_digest", "source_transaction_digest"], "properties": {"packet_id": {"type": "string", "pattern": "^ERSCPKT-[0-9]{4}$"}, "packet_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"}, "feature_refs_digest": {"type": "string", "pattern": "^[0-9a-f]{64}$"}, "source_transaction_digest": {"type": "string", "pattern": "^[0-9a-f]{64}$"}}},
            "coverage": {"type": "object", "additionalProperties": False, "required": ["feature_count", "feature_refs"], "properties": {"feature_count": {"const": FEATURES_PER_ASSIGNMENT}, "feature_refs": {**strings, "minItems": FEATURES_PER_ASSIGNMENT, "maxItems": FEATURES_PER_ASSIGNMENT}}},
            "feature_certifications": {"type": "array", "minItems": FEATURES_PER_ASSIGNMENT, "maxItems": FEATURES_PER_ASSIGNMENT, "items": feature},
            "self_attestation": {"type": "object", "additionalProperties": False, "required": attestations, "properties": {key: {"const": True} for key in attestations}},
        },
    }


def leaf_prompt() -> dict[str, Any]:
    return {
        "schema_version": "external-research-universal-shadow-certification-leaf-prompt-v1",
        "prompt": (
            "Execute only the assigned Audit 005 universal external-research shadow-certification intent. Before semantic work, read and verify the intent-bound immutable activation core, assignment-specific dispatch authorization, and activation envelope; stop unless activation_granted is true and every hash, scope, model, effort, controller, packet, output, and canonical-agent-path binding matches. Then read only the intent, its one immutable certification packet, the strict result schema, the packet-bound original universal result records, their packet-bound original research packets, the exact plan atoms named by those packets, and public web sources. Independently certify all 243 assigned features. Treat prior universal semantic claims as untrusted candidate evidence, never authority. For each feature inspect its original plan atoms, universal research evidence, registered sources, and claim-to-source mapping. Verify source existence, authority, recency, relevance, and whether the cited material actually supports each proposed spec implication. Look for contradictory external practice and missing competitor, standards, security, privacy, accessibility, and operational evidence. Determine whether the feature remains under-specified. Use live current public-web research whenever existing evidence is insufficient or stale, and register direct HTTPS citations with explicit evidence labels. Emit exactly one per-feature decision of pass, uncertain, or fail; every decision requires source evidence, and every non-pass requires explicit reasons and normalized findings. Do not promote, merge, repair, edit Plans, or alter source research. Cover the exact packet feature set once with no omissions or duplicates. Spawn no descendants, read no peer output, accept no follow-up, and write exactly one result.json in the assigned output directory. Validate it locally against the strict schema, use the assigned canonical agent_path, then return exactly PMR1."
        ),
    }


def receipt_contract() -> dict[str, Any]:
    keys = ["audit_id", "schema_version", "wave_id", "assignment_id", "attempt_id", "controller_thread_id", "agent_path", "task_thread_id", "native_child_thread_id", "model", "reasoning_effort", "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "result_sha256", "output_directory"]
    return {
        "schema_version": "external-research-universal-shadow-certification-receipt-contract-v1",
        "required_keys": keys,
        "exact_key_set_required": True,
        "constants": {"audit_id": AUDIT_ID, "wave_id": WAVE_ID, "attempt_id": ATTEMPT_ID, "controller_thread_id": CONTROLLER_THREAD_ID, "model": MODEL, "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none"},
        "identity_rule": "agent_path equals task_thread_id and native_child_thread_id is controller/native-capture authority; result contains agent_path only",
        "creation_rule": "controller writes receipt only after fresh spawn and terminal result exist; result_sha256 is mandatory",
    }


def native_capture_contract() -> dict[str, Any]:
    return {
        "schema_version": "external-research-universal-shadow-certification-native-capture-contract-v1",
        "required_top_keys": ["audit_id", "schema_version", "wave_id", "attempt_id", "controller_thread_id", "controller_turn_id", "leaves"],
        "required_leaf_keys": ["assignment_id", "agent_path", "native_child_thread_id", "native_child_turn_id", "native_child_turn_status", "terminal_response_prefix"],
        "cardinality": ASSIGNMENT_COUNT,
        "unique_fields": ["assignment_id", "agent_path", "native_child_thread_id", "native_child_turn_id"],
        "terminal_requirements": {"native_child_turn_status": "completed", "terminal_response_prefix": "PMR1"},
    }


def source_transaction_digest() -> str:
    return object_digest(SOURCE_HASHES)


def validate_result_document(result: Any, assignment: dict[str, Any], packet: dict[str, Any]) -> list[str]:
    """Strict semantic/schema checks used by postrun validation and negative tests."""
    errors: list[str] = []
    if not isinstance(result, dict):
        return ["result-not-object"]
    schema = result_schema()
    required = set(schema["required"])
    allowed = set(schema["properties"])
    if set(result) != allowed:
        errors.append("result-exact-key-set")
    if not required.issubset(result):
        errors.append("result-required-keys")
    constants = {"audit_id": AUDIT_ID, "schema_version": "external-research-universal-shadow-certification-result-v1", "phase": "universal_external_research_shadow_certification", "wave_id": WAVE_ID, "assignment_id": assignment["assignment_id"], "attempt_id": ATTEMPT_ID, "agent_path": assignment["prospective_agent_path"], "model": MODEL, "reasoning_effort": EFFORT, "status": "completed"}
    for key, expected in constants.items():
        if result.get(key) != expected:
            errors.append("constant:%s" % key)
    binding = result.get("input_binding", {})
    if set(binding) != {"packet_id", "packet_sha256", "feature_refs_digest", "source_transaction_digest"}:
        errors.append("input-binding-keys")
    for key, expected in {"packet_id": assignment["packet_id"], "packet_sha256": assignment["packet_sha256"], "feature_refs_digest": assignment["feature_refs_digest"], "source_transaction_digest": source_transaction_digest()}.items():
        if binding.get(key) != expected:
            errors.append("input-binding:%s" % key)
    coverage = result.get("coverage", {})
    expected_refs = assignment["feature_refs"]
    if coverage.get("feature_count") != FEATURES_PER_ASSIGNMENT or coverage.get("feature_refs") != expected_refs:
        errors.append("coverage-mismatch")
    rows = result.get("feature_certifications", [])
    if not isinstance(rows, list) or len(rows) != FEATURES_PER_ASSIGNMENT:
        errors.append("certification-count")
        return sorted(set(errors))
    refs = [row.get("provisional_feature_ref") for row in rows if isinstance(row, dict)]
    if refs != expected_refs or len(refs) != len(set(refs)):
        errors.append("certification-feature-set-order")
    packet_by_ref = {row["provisional_feature_ref"]: row for row in packet["features"]}
    top_row_keys = {"provisional_feature_ref", "source_row_sha256", "source_result_sha256", "decision", "decision_reason", "plan_atom_review", "source_registry_review", "claim_mapping_review", "coverage_dimensions", "citations", "findings", "live_web_research_performed", "under_specified"}
    dimension_keys = {"competitors", "standards", "security", "privacy", "accessibility", "operations"}
    citation_keys = {"citation_id", "url", "title", "publisher", "source_type", "accessed_date", "section_anchor", "supported_certification_claims", "evidence_label"}
    finding_keys = {"finding_id", "category", "statement", "severity", "citation_ids", "source_claim_ids", "normalized_spec_implication"}
    source_types = {"official_standard", "official_product_documentation", "peer_reviewed_paper", "mature_open_source_documentation", "other_authoritative"}
    finding_categories = {"source_existence", "authority", "recency", "relevance", "claim_support", "contradictory_practice", "competitor_gap", "standards_gap", "security_gap", "privacy_gap", "accessibility_gap", "operational_gap", "underspecification"}
    for row in rows:
        if not isinstance(row, dict):
            errors.append("certification-not-object")
            continue
        ref = row.get("provisional_feature_ref")
        bound = packet_by_ref.get(ref)
        if set(row) != top_row_keys:
            errors.append("certification-exact-key-set:%s" % ref)
        if not bound:
            errors.append("foreign-feature:%s" % ref)
            continue
        if row.get("source_row_sha256") != bound["source_row_sha256"] or row.get("source_result_sha256") != bound["source_result_sha256"]:
            errors.append("feature-hash-binding:%s" % ref)
        if row.get("decision") not in {"pass", "uncertain", "fail"} or not str(row.get("decision_reason", "")).strip():
            errors.append("feature-decision:%s" % ref)
        if any(not str(row.get(key, "")).strip() for key in ("plan_atom_review", "source_registry_review", "claim_mapping_review")):
            errors.append("feature-review-text:%s" % ref)
        dimensions = row.get("coverage_dimensions", {})
        if set(dimensions) != dimension_keys or any(value not in {"verified", "gap", "not_applicable_with_rationale"} for value in dimensions.values()):
            errors.append("feature-dimensions:%s" % ref)
        citations = row.get("citations", [])
        findings = row.get("findings", [])
        if not isinstance(citations, list) or not isinstance(findings, list):
            errors.append("feature-citations-findings-type:%s" % ref)
            continue
        citation_ids = [citation.get("citation_id") for citation in citations if isinstance(citation, dict)]
        if len(citation_ids) != len(set(citation_ids)):
            errors.append("duplicate-citation:%s" % ref)
        source_claim_ids = {claim["claim_id"] for claim in bound["supported_claim_refs"]}
        for citation in citations:
            if not isinstance(citation, dict):
                errors.append("citation-not-object:%s" % ref)
                continue
            if set(citation) != citation_keys:
                errors.append("citation-exact-key-set:%s" % ref)
            if not str(citation.get("url", "")).startswith("https://") or any(ch.isspace() for ch in str(citation.get("url", ""))):
                errors.append("citation-url:%s" % ref)
            if not citation.get("supported_certification_claims") or not str(citation.get("evidence_label", "")).strip():
                errors.append("citation-evidence:%s" % ref)
            if citation.get("source_type") not in source_types or len(str(citation.get("accessed_date", ""))) != 10:
                errors.append("citation-metadata:%s" % ref)
            if any(not str(citation.get(key, "")).strip() for key in ("citation_id", "title", "publisher", "section_anchor")):
                errors.append("citation-required-text:%s" % ref)
        for finding in findings:
            if not isinstance(finding, dict):
                errors.append("finding-not-object:%s" % ref)
                continue
            if set(finding) != finding_keys:
                errors.append("finding-exact-key-set:%s" % ref)
            if not set(finding.get("citation_ids", [])).issubset(set(citation_ids)):
                errors.append("finding-citation-unbound:%s" % ref)
            if not set(finding.get("source_claim_ids", [])).issubset(source_claim_ids):
                errors.append("finding-source-claim-unbound:%s" % ref)
            if not str(finding.get("normalized_spec_implication", "")).strip():
                errors.append("finding-implication:%s" % ref)
            if finding.get("category") not in finding_categories or finding.get("severity") not in {"info", "low", "medium", "high", "critical"} or not str(finding.get("statement", "")).strip():
                errors.append("finding-metadata:%s" % ref)
        if row.get("decision") in {"uncertain", "fail"} and (not citations or not findings):
            errors.append("nonpass-evidence:%s" % ref)
        if row.get("decision") == "pass" and not citations:
            errors.append("all-pass-without-evidence:%s" % ref)
    attest = result.get("self_attestation", {})
    expected_attest = set(schema["properties"]["self_attestation"]["required"])
    if set(attest) != expected_attest or any(attest.get(key) is not True for key in expected_attest):
        errors.append("self-attestation")
    return sorted(set(errors))
