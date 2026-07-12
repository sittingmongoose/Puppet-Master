#!/usr/bin/env python3
"""Exclusive append-only builder for the V31 semantic-repair prelaunch gate."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
WAVE = HERE.parents[2]
AUDIT = WAVE.parents[2]
V30 = HERE.parent / "semantic-repair-attempt-0002-preparation-v30"
PRIMARY = WAVE / "postrun-validator-v29-ultra/primary-execution/cohort-0002-primary-postrun.json"
LUNA = WAVE / "postrun-validator-v29-ultra/independent-execution/cohort-0002-luna-postrun.json"
POLICY_V32 = AUDIT / "master/coordination/CONCURRENCY_POLICY_V32.json"
AUTHORITY = HERE / "IMMUTABLE_AUTHORITY.json"
READINESS = HERE / "readiness.json"
TEST_REPORT = HERE / "validation/test-report.json"
CAPTURE = HERE / "validation/controller-parent-native-identity-capture.json"

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
GATE_ID = "SCENARIO-COHORT-0002-SEMANTIC-REPAIR-ATTEMPT-0002-GATE-V31"
PRIMARY_SHA = "a3d998309ba2b5be3127329dcbf7168c04fad8dd860246cbe5e11a2f064c87f8"
LUNA_SHA = "bd0a749e597fcb74c5347c85865c552c3f4a99a88543d754cf94ef7624fdd932"
POLICY_V32_SHA = "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed"
REJECTED = ["A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016"]
ELIGIBLE = ["A005SA-0011", "A005SA-0015"]
ZERO_STATE = {"results": 0, "receipts": 0, "sol_native_capture_rows": 0, "credit": 0, "spawned_children": 0, "activation": False}
EMPTY_TREE_SHA = hashlib.sha256(b"[]").hexdigest()


def json_bytes(value: Any, pretty: bool = True) -> bytes:
    if pretty:
        return (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8")
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def file_binding(path: Path) -> dict[str, Any]:
    raw = path.read_bytes()
    binding = {"path": str(path), "byte_count": len(raw), "raw_sha256": sha(raw)}
    if path.suffix == ".json":
        binding["canonical_sha256"] = sha(json_bytes(json.loads(raw), pretty=False))
    return binding


def write_exclusive(path: Path, raw: bytes, mode: int = 0o444) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, mode)
    try:
        view = memoryview(raw)
        while view:
            written = os.write(descriptor, view)
            view = view[written:]
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def write_json(path: Path, value: Any, mode: int = 0o444) -> None:
    write_exclusive(path, json_bytes(value), mode)


def domain_policy() -> dict[str, Any]:
    return {
        "schema_version": "scenario-adversarial-registrable-domain-policy-v31-v1",
        "algorithm": "idna-lowercase-plus-pinned-multilabel-public-suffix-policy-v1",
        "common_cc_second_level_labels": ["ac", "co", "com", "edu", "gov", "mil", "net", "org"],
        "multi_label_public_suffixes": sorted({
            "ac.jp", "ac.nz", "ac.uk", "asn.au", "co.in", "co.jp", "co.kr", "co.nz", "co.uk",
            "com.ar", "com.au", "com.br", "com.cn", "com.hk", "com.mx", "com.my", "com.pl", "com.sg", "com.tr", "com.tw",
            "edu.au", "edu.cn", "edu.hk", "edu.sg", "go.jp", "go.kr", "gov.au", "gov.br", "gov.cn", "gov.hk", "gov.in", "gov.sg", "gov.uk",
            "id.au", "ltd.uk", "me.uk", "ne.jp", "net.au", "net.br", "net.cn", "net.in", "net.nz", "net.sg", "net.uk",
            "or.jp", "org.au", "org.br", "org.cn", "org.in", "org.nz", "org.sg", "org.uk", "plc.uk", "sch.uk"
        }),
        "exact_forbidden_hosts": [
            "localhost", "ip6-localhost", "example.com", "example.net", "example.org", "example.edu",
            "www.example.com", "www.example.net", "www.example.org", "metadata.google.internal"
        ],
        "forbidden_host_labels": ["example", "placeholder", "invalid", "localhost", "local", "internal", "test"],
        "forbidden_suffixes": ["example", "invalid", "test", "localhost", "local", "internal", "home", "lan", "onion"],
        "qualifying_authority_classes": [
            "official_standard", "official_product_documentation", "primary_research", "official_government", "maintainer_documentation"
        ],
        "certified_minimum_distinct_registrable_domains": 2,
        "certified_minimum_distinct_authority_ids": 2,
        "duplicate_domains_in_one_feature_registry_forbidden": True,
        "ip_literal_sources_forbidden": True,
        "resolved_non_public_ip_forbidden": True,
        "https_only": True,
    }


def result_schema() -> dict[str, Any]:
    hash_schema = {"type": "string", "pattern": "^[0-9a-f]{64}$"}
    attempt_schema = {
        "type": "object", "additionalProperties": False,
        "required": ["query", "method", "outcome"],
        "properties": {
            "query": {"type": "string", "minLength": 12},
            "method": {"const": "public_web"},
            "outcome": {"type": "string", "minLength": 12},
        },
    }
    source_schema = {
        "type": "object", "additionalProperties": False,
        "required": ["source_id", "url", "canonical_url", "registrable_domain", "title", "publisher", "authority_id", "authority_class", "accessed_at", "retrieval"],
        "properties": {
            "source_id": {"type": "string", "minLength": 1},
            "url": {"type": "string", "pattern": "^https://[^\\s]+$"},
            "canonical_url": {"type": "string", "pattern": "^https://[^\\s]+$"},
            "registrable_domain": {"type": "string", "minLength": 3},
            "title": {"type": "string", "minLength": 1},
            "publisher": {"type": "string", "minLength": 1},
            "authority_id": {"type": "string", "minLength": 1},
            "authority_class": {"enum": ["official_standard", "official_product_documentation", "primary_research", "official_government", "maintainer_documentation", "secondary"]},
            "accessed_at": {"type": "string", "format": "date-time"},
            "retrieval": {
                "type": "object", "additionalProperties": False,
                "required": ["status", "final_url", "http_status", "content_sha256", "receipt_sha256", "resolved_ips", "redirect_chain"],
                "properties": {
                    "status": {"const": "read"}, "final_url": {"type": "string", "pattern": "^https://[^\\s]+$"},
                    "http_status": {"type": "integer", "minimum": 200, "maximum": 299},
                    "content_sha256": hash_schema, "receipt_sha256": hash_schema,
                    "resolved_ips": {"type": "array", "minItems": 1, "uniqueItems": True, "items": {"type": "string", "minLength": 2}},
                    "redirect_chain": {"type": "array", "uniqueItems": True, "items": {"type": "string", "pattern": "^https://[^\\s]+$"}},
                },
            },
        },
    }
    claim_schema = {
        "type": "object", "additionalProperties": False,
        "required": ["claim_id", "claim", "evidence_class", "source_ids", "evidence_label"],
        "properties": {
            "claim_id": {"type": "string", "minLength": 1}, "claim": {"type": "string", "minLength": 12},
            "evidence_class": {"enum": ["supported_claim", "inference"]},
            "source_ids": {"type": "array", "minItems": 1, "uniqueItems": True, "items": {"type": "string", "minLength": 1}},
            "evidence_label": {"type": "string", "minLength": 3},
        },
    }
    feature = {
        "type": "object", "additionalProperties": False,
        "required": [
            "provisional_feature_ref", "source_row_sha256", "research_result_file_sha256", "research_record_sha256",
            "certification_disposition", "disposition_rationale", "research_applicability", "live_research", "source_registry", "claim_support",
            "dimensions", "overall_spec_deltas", "newly_discovered_candidates"
        ],
        "properties": {
            "provisional_feature_ref": {"type": "string", "minLength": 1},
            "source_row_sha256": hash_schema, "research_result_file_sha256": hash_schema, "research_record_sha256": hash_schema,
            "certification_disposition": {"enum": ["certified", "gap_confirmed", "contradiction", "blocked_insufficient_evidence", "not_applicable_dimension"]},
            "disposition_rationale": {"type": "string", "minLength": 24},
            "research_applicability": {
                "type": "object", "additionalProperties": False,
                "required": ["state", "rationale", "browsing_performed", "claims_used"],
                "properties": {
                    "state": {"enum": ["applicable", "weak", "misapplied", "insufficient", "not_applicable"]},
                    "rationale": {"type": "string", "minLength": 12}, "browsing_performed": {"type": "boolean"},
                    "claims_used": {"type": "array", "items": {
                        "type": "object", "additionalProperties": False,
                        "required": ["claim_id", "claim", "source_urls", "evidence_label"],
                        "properties": {
                            "claim_id": {"type": "string", "minLength": 1}, "claim": {"type": "string", "minLength": 12},
                            "source_urls": {"type": "array", "minItems": 1, "uniqueItems": True, "items": {"type": "string", "pattern": "^https://[^\\s]+$"}},
                            "evidence_label": {"type": "string", "minLength": 3},
                        },
                    }},
                },
            },
            "live_research": {
                "type": "object", "additionalProperties": False,
                "required": ["performed", "evidence_state", "session_id", "started_at", "completed_at", "attempts"],
                "properties": {
                    "performed": {"const": True}, "evidence_state": {"enum": ["applicable", "weak", "misapplied", "insufficient", "no_evidence", "not_applicable"]},
                    "session_id": {"type": "string", "minLength": 1}, "started_at": {"type": "string", "format": "date-time"},
                    "completed_at": {"type": "string", "format": "date-time"},
                    "attempts": {"type": "array", "minItems": 1, "items": attempt_schema},
                },
            },
            "source_registry": {"type": "array", "uniqueItems": True, "items": source_schema},
            "claim_support": {"type": "array", "uniqueItems": True, "items": claim_schema},
            "dimensions": {"type": "object"},
            "overall_spec_deltas": {"type": "array", "uniqueItems": True, "items": {"type": "string", "minLength": 12}},
            "newly_discovered_candidates": {"type": "array"},
        },
        "allOf": [
            {
                "if": {"properties": {"certification_disposition": {"const": "certified"}}, "required": ["certification_disposition"]},
                "then": {"properties": {
                    "research_applicability": {"properties": {"state": {"const": "applicable"}, "browsing_performed": {"const": True}, "claims_used": {"minItems": 1}}},
                    "live_research": {"properties": {"performed": {"const": True}, "evidence_state": {"const": "applicable"}}},
                    "source_registry": {"minItems": 2}, "claim_support": {"minItems": 1},
                }},
            },
            {
                "if": {"properties": {"live_research": {"properties": {"evidence_state": {"const": "no_evidence"}}, "required": ["evidence_state"]}}, "required": ["live_research"]},
                "then": {"properties": {
                    "certification_disposition": {"const": "blocked_insufficient_evidence"},
                    "research_applicability": {"properties": {"state": {"const": "insufficient"}, "browsing_performed": {"const": True}, "claims_used": {"maxItems": 0}}},
                    "live_research": {"properties": {"attempts": {"minItems": 2}}}, "source_registry": {"maxItems": 0}, "claim_support": {"maxItems": 0},
                    "overall_spec_deltas": {"minItems": 1},
                }},
            },
            {
                "if": {"properties": {"research_applicability": {"properties": {"state": {"enum": ["weak", "misapplied", "insufficient", "not_applicable"]}}, "required": ["state"]}}, "required": ["research_applicability"]},
                "then": {"properties": {"certification_disposition": {"const": "blocked_insufficient_evidence"}, "overall_spec_deltas": {"minItems": 1}}},
            },
        ],
    }
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "https://puppetmaster.local/audit005/scenario/cohort-0002/semantic-repair-attempt-0002-v31.schema.json",
        "title": "Audit005 cohort-0002 semantic repair attempt-0002 V31 live-research overlay",
        "type": "object", "additionalProperties": False,
        "required": ["audit_id", "schema_version", "phase", "cohort_id", "assignment_id", "attempt_id", "task_thread_id", "model", "reasoning_effort", "status", "input_binding", "coverage", "feature_certifications", "self_attestation"],
        "properties": {
            "audit_id": {"const": AUDIT_ID}, "schema_version": {"const": "scenario-adversarial-semantic-repair-result-v31-v1"},
            "phase": {"const": "scenario_adversarial_certification"}, "cohort_id": {"const": "cohort-0002"},
            "assignment_id": {"enum": REJECTED}, "attempt_id": {"const": "attempt-0002"},
            "task_thread_id": {"type": "string", "pattern": "^/root/sol_controller_v29/a005_scenario_adversarial_(0009|0010|0012|0013|0014|0016)_semantic_repair_attempt_0002_ultra_v31$"},
            "model": {"const": "gpt-5.6-sol"}, "reasoning_effort": {"const": "ultra"}, "status": {"const": "completed"},
            "input_binding": {"type": "object"}, "coverage": {"type": "object"},
            "feature_certifications": {"type": "array", "minItems": 1, "items": feature}, "self_attestation": {"type": "object"},
        },
        "x-v31-live-research": {
            "live_public_web_required": True, "source_registry_required": True, "claim_support_mapping_required": True,
            "https_nonplaceholder_public_sources_only": True, "minimum_distinct_registrable_domains_for_certified": 2,
            "minimum_distinct_authority_ids_for_certified": 2, "no_evidence_two_concrete_attempts_and_deltas": True,
            "semantic_cross_field_verifier": "../verify_gate_v31.py",
        },
    }


def capture_schema() -> dict[str, Any]:
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "additionalProperties": False,
        "required": ["schema_version", "gate_id", "audit_id", "wave_id", "cohort_id", "capture_kind", "append_only", "authored_by_role", "controller_agent_path", "parent_controller_thread_id", "gate_authority_sha256", "embedded_report_identity_authority", "reviewer", "terminal_report", "scope"],
        "properties": {
            "schema_version": {"const": "scenario-adversarial-controller-parent-native-capture-v31-v1"}, "gate_id": {"const": GATE_ID},
            "audit_id": {"const": AUDIT_ID}, "wave_id": {"const": "wave-0001"}, "cohort_id": {"const": "cohort-0002"},
            "capture_kind": {"const": "parent_native_identity_only"}, "append_only": {"const": True}, "authored_by_role": {"const": "controller"},
            "controller_agent_path": {"const": "/root/sol_controller_v29"},
            "parent_controller_thread_id": {"type": "string", "pattern": "^[0-9a-f-]{36}$"}, "gate_authority_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
            "embedded_report_identity_authority": {"const": "non_authoritative"},
            "reviewer": {
                "type": "object", "additionalProperties": False,
                "required": ["native_reviewer_thread_id", "model", "reasoning_effort", "fork_turns", "descendants", "followups", "retries"],
                "properties": {
                    "native_reviewer_thread_id": {"type": "string", "pattern": "^[0-9a-f-]{36}$"}, "model": {"const": "gpt-5.6-luna"},
                    "reasoning_effort": {"const": "max"}, "fork_turns": {"const": "none"}, "descendants": {"const": 0}, "followups": {"const": 0}, "retries": {"const": 0},
                },
            },
            "terminal_report": {
                "type": "object", "additionalProperties": False,
                "required": ["path", "raw_sha256", "observed_status"],
                "properties": {"path": {"const": str(LUNA)}, "raw_sha256": {"const": LUNA_SHA}, "observed_status": {"const": "fail_closed"}},
            },
            "scope": {
                "type": "object", "additionalProperties": False,
                "required": ["identity_only", "semantic_reinterpretation", "activation", "credit", "result_writes", "receipt_writes", "sol_capture_rows"],
                "properties": {"identity_only": {"const": True}, "semantic_reinterpretation": {"const": False}, "activation": {"const": False}, "credit": {"const": 0}, "result_writes": {"const": 0}, "receipt_writes": {"const": 0}, "sol_capture_rows": {"const": 0}},
            },
        },
    }


def luna_schema() -> dict[str, Any]:
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "additionalProperties": True,
        "$comment": "Embedded controller/reviewer identity fields are comparison metadata only and are never native-identity authority.",
        "required": ["schema_version", "audit_id", "wave_id", "cohort_id", "status", "assignment_sets", "assignment_statuses", "primary_comparison", "model", "reasoning_effort", "read_only_verification", "fresh_direct_reviewer", "independently_reconstructed"],
        "properties": {
            "schema_version": {"const": "audit005-scenario-adversarial-luna-independent-postrun-v29-ultra-v1"}, "audit_id": {"const": AUDIT_ID},
            "wave_id": {"const": "wave-0001"}, "cohort_id": {"const": "cohort-0002"}, "status": {"const": "fail_closed"},
            "model": {"const": "gpt-5.6-luna"}, "reasoning_effort": {"const": "max"}, "read_only_verification": {"const": True},
            "fresh_direct_reviewer": {"const": True}, "independently_reconstructed": {"const": True},
            "assignment_sets": {
                "type": "object", "required": ["eligible", "rejected", "unresolved"],
                "properties": {"eligible": {"const": ELIGIBLE}, "rejected": {"const": REJECTED}, "unresolved": {"const": []}},
            },
        },
    }


def prompt() -> dict[str, Any]:
    return {
        "schema_version": "scenario-adversarial-semantic-repair-leaf-prompt-v31-v1",
        "activation": False,
        "prompt": (
            "Execute only after a separate future activation binds CONCURRENCY_POLICY_V32, a valid controller-authored parent-native capture, and a newly allocated attempt-0002 identity. Verify every packet, V31 intent, schema, prompt, and output-tree binding before work. Read no canonical Plans prose, attempt-0001 result body, peer result, or unrelated audit artifact. Independently perform live public-web research for every assigned feature. Register only direct public HTTPS read-backed sources, rejecting placeholder/reserved/private/IP targets and private redirect or resolution chains. Map every claim to registered source IDs. Certification requires at least two independent qualifying sources with distinct registrable domains and distinct authority IDs. Candidate packet evidence is not proof unless re-read live. A no_evidence outcome must record at least two concrete distinct research attempts, use no evidence references, remain blocked_insufficient_evidence, and supply concrete overall and blocked-dimension deltas with executable unequal pass/fail oracles. Preserve all base schema and semantic checks and all ten scenario dimensions. Spawn no descendants, accept no follow-up, edit no Plans, and write exactly one result.json inside the authorized output directory. Return exactly PMR2."
        ),
    }


def test_matrix() -> dict[str, Any]:
    categories = [
        {"category": "luna_capture_gate", "positive": 8, "negative": 40, "total": 48},
        {"category": "six_assignment_packet_intent_output_rehash", "positive": 18, "negative": 78, "total": 96},
        {"category": "https_private_placeholder_registrable_authority", "positive": 12, "negative": 60, "total": 72},
        {"category": "live_source_registry_claim_support", "positive": 10, "negative": 50, "total": 60},
        {"category": "disposition_no_evidence_concrete_delta", "positive": 8, "negative": 40, "total": 48},
        {"category": "draft202012_namespace_zero_state_toctou", "positive": 4, "negative": 20, "total": 24},
    ]
    return {"schema_version": "scenario-adversarial-semantic-repair-tests-v31-matrix-v1", "minimum_required": 300, "expected_total": 348, "expected_positive": 60, "expected_negative": 288, "categories": categories}


def intent(assignment_id: str, v30_intent: dict[str, Any], schema_binding: dict[str, Any], prompt_binding: dict[str, Any]) -> dict[str, Any]:
    suffix = assignment_id[-4:]
    output = HERE / f"outputs/{assignment_id}/attempt-0002"
    return {
        "schema_version": "scenario-adversarial-semantic-repair-intent-v31-v1", "audit_id": AUDIT_ID, "wave_id": "wave-0001", "cohort_id": "cohort-0002",
        "assignment_id": assignment_id, "source_attempt_id": "attempt-0001", "attempt_id": "attempt-0002", "activation": {"enabled": False, "authorized": False, "future_policy_required": "CONCURRENCY_POLICY_V32.json", "parent_native_capture_required": True},
        "source_preparation": {"path": str(V30), "authority_sha256": file_binding(V30 / "IMMUTABLE_AUTHORITY.json")["raw_sha256"], "mutation_authorized": False},
        "source_primary_report": {"path": str(PRIMARY), "sha256": PRIMARY_SHA, "read_by_leaf": False},
        "luna_confirmation": {"path": str(LUNA), "sha256": LUNA_SHA, "identity_fields_authoritative": False, "read_by_leaf": False},
        "future_activation_policy": {"path": str(POLICY_V32), "sha256": POLICY_V32_SHA, "activation_granted": False},
        "packet": v30_intent["packet"],
        "runtime": {"model": "gpt-5.6-sol", "reasoning_effort": "ultra", "fresh_identity_path": f"/root/sol_controller_v29/a005_scenario_adversarial_{suffix}_semantic_repair_attempt_0002_ultra_v31", "fresh_identity_state": "reserved_unallocated", "native_child_thread_id": None, "fork_turns": "none", "descendants_forbidden": True, "followups_forbidden": True},
        "contracts": {"schema": schema_binding, "prompt": prompt_binding, "base_schema_sha256": file_binding(WAVE / "schemas/scenario_adversarial_result.schema.json")["raw_sha256"], "base_semantic_validator_sha256": file_binding(WAVE / "postrun-validator-v1/validate_scenario_postrun_v1.py")["raw_sha256"], "schema_checks_removed": 0, "semantic_checks_removed": 0},
        "output": {"directory": str(output), "future_result_name": "result.json", "must_be_empty_prelaunch": True, "prelaunch_inventory_sha256": EMPTY_TREE_SHA},
        "live_research_contract": {"live_public_web_required": True, "source_registry_required": True, "claim_support_mapping_required": True, "https_only": True, "placeholder_private_ip_sources_forbidden": True, "minimum_distinct_registrable_domains_for_certified": 2, "minimum_distinct_authority_ids_for_certified": 2, "no_evidence_minimum_distinct_attempts": 2, "concrete_overall_and_blocked_dimension_deltas_required": True},
        "read_policy": {"canonical_plans_prose_forbidden": True, "attempt1_result_body_forbidden": True, "peer_results_forbidden": True, "live_public_web_allowed": True},
        "credit": 0,
    }


def build_contract() -> None:
    if AUTHORITY.exists():
        raise SystemExit("authority-already-exists")
    for directory in (HERE / "schema", HERE / "support", HERE / "intents", HERE / "outputs", HERE / "validation"):
        directory.mkdir(parents=True, exist_ok=True)
    if sha(PRIMARY.read_bytes()) != PRIMARY_SHA or sha(LUNA.read_bytes()) != LUNA_SHA or sha(POLICY_V32.read_bytes()) != POLICY_V32_SHA:
        raise SystemExit("pinned-source-hash-drift")
    generated = {
        HERE / "schema/result.schema.json": result_schema(), HERE / "schema/controller_parent_native_capture.schema.json": capture_schema(),
        HERE / "schema/luna_confirmation.schema.json": luna_schema(), HERE / "support/registrable_domain_policy.json": domain_policy(),
        HERE / "leaf_prompt.json": prompt(), HERE / "test_matrix.json": test_matrix(),
    }
    for path, value in generated.items():
        write_json(path, value)
    schema_binding = file_binding(HERE / "schema/result.schema.json")
    prompt_binding = file_binding(HERE / "leaf_prompt.json")
    v30_rows = {json.loads(line)["assignment_id"]: json.loads(line) for line in (V30 / "repair_manifest.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()}
    manifest: list[dict[str, Any]] = []
    for sequence, assignment_id in enumerate(REJECTED, 1):
        v30_intent_path = V30 / f"intents/{assignment_id}.json"
        v30_intent = load(v30_intent_path)
        output = HERE / f"outputs/{assignment_id}/attempt-0002"
        output.mkdir(parents=True, exist_ok=False)
        intent_path = HERE / f"intents/{assignment_id}.json"
        write_json(intent_path, intent(assignment_id, v30_intent, schema_binding, prompt_binding))
        manifest.append({
            "schema_version": "scenario-adversarial-semantic-repair-gate-manifest-row-v31-v1", "sequence": sequence,
            "audit_id": AUDIT_ID, "gate_id": GATE_ID, "wave_id": "wave-0001", "cohort_id": "cohort-0002", "assignment_id": assignment_id,
            "feature_count": v30_rows[assignment_id]["feature_count"], "feature_refs_digest": v30_rows[assignment_id]["feature_refs_digest"],
            "packet": file_binding(Path(v30_intent["packet"]["path"])), "v30_intent": file_binding(v30_intent_path), "v31_intent": file_binding(intent_path),
            "output_tree": {"path": str(output), "expected_file_count": 0, "inventory_sha256": EMPTY_TREE_SHA},
            "fresh_identity_path": f"/root/sol_controller_v29/a005_scenario_adversarial_{assignment_id[-4:]}_semantic_repair_attempt_0002_ultra_v31",
            "fresh_identity_state": "reserved_unallocated", "result_count": 0, "receipt_count": 0, "sol_native_capture_rows": 0, "credit": 0,
        })
    manifest_raw = b"".join(json_bytes(row, pretty=False) + b"\n" for row in manifest)
    write_exclusive(HERE / "gate_manifest.jsonl", manifest_raw)
    v30_bindings: dict[str, Any] = {}
    v30_manifest_rows: list[dict[str, Any]] = []
    for path in sorted(item for item in V30.rglob("*") if item.is_file()):
        label = path.relative_to(V30).as_posix().replace("/", "__")
        binding = file_binding(path)
        v30_bindings[label] = binding
        v30_manifest_rows.append({"relative_path": path.relative_to(V30).as_posix(), "byte_count": binding["byte_count"], "raw_sha256": binding["raw_sha256"]})
    artifacts = {
        "gate_manifest": file_binding(HERE / "gate_manifest.jsonl"), "result_schema": file_binding(HERE / "schema/result.schema.json"),
        "capture_schema": file_binding(HERE / "schema/controller_parent_native_capture.schema.json"), "luna_schema": file_binding(HERE / "schema/luna_confirmation.schema.json"),
        "leaf_prompt": file_binding(HERE / "leaf_prompt.json"), "domain_policy": file_binding(HERE / "support/registrable_domain_policy.json"),
        "test_matrix": file_binding(HERE / "test_matrix.json"), "verifier": file_binding(HERE / "verify_gate_v31.py"),
        "tests": file_binding(HERE / "test_gate_v31.py"), "preparer": file_binding(HERE / "prepare_gate_v31.py"),
    }
    authority = {
        "schema_version": "scenario-adversarial-semantic-repair-gate-authority-v31-v1", "gate_id": GATE_ID, "audit_id": AUDIT_ID,
        "wave_id": "wave-0001", "cohort_id": "cohort-0002", "status": "prepared_blocked_pending_parent_native_capture",
        "namespace_policy": "new_sibling_append_only_exclusive_writes", "canonical_plans_prose_read_or_write_authorized": False,
        "activation": False, "activation_authorized": False, "attempt_id": "attempt-0002", "assignment_count": 6, "feature_count": 687,
        "rejected_ids": REJECTED, "eligible_ids": ELIGIBLE,
        "source_preparation": {"path": str(V30), "authority_sha256": v30_bindings["IMMUTABLE_AUTHORITY.json"]["raw_sha256"], "file_count": len(v30_bindings), "file_manifest_canonical_sha256": sha(json_bytes(v30_manifest_rows, pretty=False)), "mutation_authorized": False},
        "v30_file_bindings": v30_bindings, "primary_report": file_binding(PRIMARY), "luna_report": file_binding(LUNA),
        "luna_confirmation_mode": "independent_postrun_exact_rejected_set_confirmation_prelaunch",
        "luna_embedded_identity_fields_authoritative": False,
        "parent_native_capture_gate": {"required": True, "fixed_path": str(CAPTURE), "state": "required_absent", "must_be_controller_authored": True},
        "future_activation_policy": file_binding(POLICY_V32), "future_activation_policy_required": True,
        "future_activation_must_be_separate_transaction": True,
        "artifact_bindings": artifacts,
        "semantic_hardening": {"live_public_web_required": True, "source_registry_required": True, "claim_support_mapping_required": True, "https_nonplaceholder_public_sources_only": True, "minimum_distinct_registrable_domains_for_certified": 2, "minimum_distinct_authority_ids_for_certified": 2, "duplicate_domains_and_authority_ids_forbidden": True, "no_evidence_minimum_distinct_concrete_attempts": 2, "no_evidence_zero_reference_semantics": True, "concrete_overall_and_blocked_dimension_deltas_required": True, "base_schema_checks_removed": 0, "base_semantic_checks_removed": 0},
        "test_contract": {"minimum_executable_cases": 300, "exact_expected_cases": 348, "terminal_test_report_path": str(TEST_REPORT)},
        "zero_state": ZERO_STATE,
    }
    write_json(AUTHORITY, authority)


def build_readiness() -> None:
    if READINESS.exists():
        raise SystemExit("readiness-already-exists")
    if not AUTHORITY.is_file() or not TEST_REPORT.is_file():
        raise SystemExit("authority-or-test-report-missing")
    report = load(TEST_REPORT)
    if report.get("status") != "pass" or report.get("passed") != 348 or report.get("total") != 348 or report.get("failed") != 0:
        raise SystemExit("test-report-not-exact-348-pass")
    readiness = {
        "schema_version": "scenario-adversarial-semantic-repair-gate-readiness-v31-v1", "gate_id": GATE_ID,
        "status": "pass_blocked", "activation": False, "activation_authorized": False,
        "authority_path": str(AUTHORITY), "authority_sha256": file_binding(AUTHORITY)["raw_sha256"],
        "test_report_path": str(TEST_REPORT), "test_report_sha256": file_binding(TEST_REPORT)["raw_sha256"],
        "tests": {"passed": 348, "total": 348, "failed": 0, "case_id_digest": report["case_id_digest"]},
        "luna_confirmation": {"state": "accepted_exact_rejected_set_confirmation_prelaunch", "path": str(LUNA), "raw_sha256": LUNA_SHA, "embedded_identity_authority": "non_authoritative"},
        "parent_native_capture": {"state": "required_absent" if not CAPTURE.exists() else "present_requires_verification", "fixed_path": str(CAPTURE)},
        "future_activation_policy": {"path": str(POLICY_V32), "raw_sha256": POLICY_V32_SHA, "required_for_future_activation": True},
        "blocking_reasons": ["controller_parent_native_identity_capture_absent", "activation_false", "separate_future_activation_transaction_required"],
        "prepared_counts": {"assignments": 6, "features": 687, "fresh_identities_reserved": 6, "empty_output_directories": 6},
        "zero_state": ZERO_STATE,
    }
    write_json(READINESS, readiness)


def main() -> None:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--write-contract", action="store_true")
    group.add_argument("--write-readiness", action="store_true")
    args = parser.parse_args()
    if args.write_contract:
        build_contract()
        print(json.dumps({"status": "prepared_contract", "authority_path": str(AUTHORITY)}, sort_keys=True))
    else:
        build_readiness()
        print(json.dumps({"status": "readiness_written", "readiness_path": str(READINESS)}, sort_keys=True))


if __name__ == "__main__":
    main()
