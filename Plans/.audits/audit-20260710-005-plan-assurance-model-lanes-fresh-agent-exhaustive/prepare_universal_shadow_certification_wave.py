#!/usr/bin/env python3
"""Emit deterministic apply_patch payloads for the universal shadow-certification candidate."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any

from universal_shadow_certification_common import (
    ASSIGNMENT_COUNT, ATTEMPT_ID, AUDIT_ID, AUDIT_ROOT, CONTROLLER_THREAD_ID,
    EFFORT, FEATURES_PER_ASSIGNMENT, FEATURE_COUNT, MODEL, NAMESPACE, OUTPUT_ROOT,
    PACKET_CEILING_BYTES, SOURCE_COVERAGE_DIGEST, SOURCE_HASHES, SOURCE_NAMESPACE,
    V9_REF, V9_SHA256, WAVE_ID, agent_path, assignment_id, build_packets,
    canonical_json, digest_values, leaf_prompt, native_capture_contract, packet_id,
    receipt_contract, result_schema, root_hash, sha_bytes, sha_file,
    source_transaction_digest,
)


STATUS = "BLOCKED_AWAITING_INDEPENDENT_PRELAUNCH"
SCRIPT_NAMES = [
    "universal_shadow_certification_common.py",
    "prepare_universal_shadow_certification_wave.py",
    "verify_universal_shadow_certification_wave.py",
    "validate_universal_shadow_certification_postrun.py",
    "test_universal_shadow_certification_validator.py",
    "generate_universal_shadow_certification_activation.py",
]


def jsonl(rows: list[dict[str, Any]]) -> bytes:
    return b"".join(canonical_json(row) for row in rows)


def patch_add(path: Path, data: bytes) -> str:
    text = data.decode("utf-8")
    return "*** Add File: %s\n%s" % (path, "".join("+" + line for line in text.splitlines(keepends=True)))


def packet_models() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    packets = build_packets()
    manifest: list[dict[str, Any]] = []
    registry: list[dict[str, Any]] = []
    for index, packet in enumerate(packets, 1):
        aid = assignment_id(index)
        raw = canonical_json(packet)
        packet_ref = "packets/%s.json" % packet_id(index)
        output = OUTPUT_ROOT / aid / "attempts" / ATTEMPT_ID
        intent_ref = "dispatch/%s/%s/dispatch_intent.json" % (aid, ATTEMPT_ID)
        row = {
            "audit_id": AUDIT_ID,
            "schema_version": "external-research-universal-shadow-certification-assignment-v1",
            "wave_id": WAVE_ID,
            "assignment_id": aid,
            "attempt_id": ATTEMPT_ID,
            "packet_id": packet_id(index),
            "packet_ref": packet_ref,
            "packet_sha256": sha_bytes(raw),
            "packet_bytes": len(raw),
            "packet_ceiling_bytes": PACKET_CEILING_BYTES,
            "feature_count": FEATURES_PER_ASSIGNMENT,
            "feature_refs": packet["feature_refs"],
            "feature_refs_digest": packet["feature_refs_digest"],
            "owner_domain_counts": packet["owner_domain_counts"],
            "source_assignment_counts": packet["source_assignment_counts"],
            "source_assignment_ids": sorted(packet["source_assignment_counts"]),
            "output_directory": str(output),
            "intent_ref": intent_ref,
            "prospective_agent_path": agent_path(index),
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "controller_thread_id": CONTROLLER_THREAD_ID,
            "fork_turns": "none",
            "fresh_child_required": True,
            "descendants_forbidden": True,
            "followup_messages_forbidden": True,
            "activation_status": STATUS,
            "certification_credit_before_postrun": 0,
        }
        manifest.append(row)
        registry.append({
            "assignment_id": aid,
            "packet_id": row["packet_id"],
            "packet_ref": packet_ref,
            "packet_sha256": row["packet_sha256"],
            "packet_bytes": row["packet_bytes"],
            "feature_count": FEATURES_PER_ASSIGNMENT,
            "feature_refs_digest": row["feature_refs_digest"],
            "owner_domain_count": len(row["owner_domain_counts"]),
            "source_assignment_count": len(row["source_assignment_counts"]),
        })
    return packets, manifest, registry


def architecture(manifest: list[dict[str, Any]]) -> dict[str, Any]:
    refs = [ref for row in manifest for ref in row["feature_refs"]]
    return {
        "audit_id": AUDIT_ID,
        "schema_version": "external-research-universal-shadow-certification-architecture-v1",
        "wave_id": WAVE_ID,
        "status": STATUS,
        "purpose": "independent reverse audit of completed universal external-research candidate claims",
        "source_semantic_authority": False,
        "source_claims_label": "untrusted_candidate_evidence_to_be_certified",
        "assignment_count": ASSIGNMENT_COUNT,
        "features_per_assignment": FEATURES_PER_ASSIGNMENT,
        "feature_count": FEATURE_COUNT,
        "coverage_digest": digest_values(refs),
        "source_coverage_digest": SOURCE_COVERAGE_DIGEST,
        "partition_rule": "deterministic owner-domain plus original-assignment cross-shard round-robin; fixed capacity 243",
        "balancing_requirements": {"owner_domains_per_packet": 16, "original_research_assignments_per_packet": 24},
        "packet_ceiling_bytes": PACKET_CEILING_BYTES,
        "source_transaction_digest": source_transaction_digest(),
        "source_hashes": SOURCE_HASHES,
        "result_identity_separation": "result reports canonical agent_path only; controller receipt and independent capture own native identities",
        "activation_transaction": "future independent Luna gate -> activation core -> sixteen assignment authorizations -> envelope; no circular hash",
        "rolling_concurrency": {
            "policy_ref": V9_REF,
            "policy_sha256": V9_SHA256,
            "transaction_cap": 16,
            "total_rolling_cap": 32,
            "permitted_overlap": "one separately gated sixteen-leaf scenario transaction",
            "atomic_32_activation_forbidden": True,
        },
        "prelaunch_state": {"activation": False, "results": 0, "receipts": 0, "native_capture": False, "certification_credit": 0},
    }


def activation_contract(manifest: list[dict[str, Any]]) -> dict[str, Any]:
    refs = [ref for row in manifest for ref in row["feature_refs"]]
    return {
        "schema_version": "external-research-universal-shadow-certification-activation-contract-v1",
        "wave_id": WAVE_ID,
        "status_before_gate": STATUS,
        "future_luna_report_required": True,
        "luna_report_exact_requirements": {
            "audit_id": AUDIT_ID,
            "wave_id": WAVE_ID,
            "status": "pass",
            "independent": True,
            "assignment_count": ASSIGNMENT_COUNT,
            "feature_count": FEATURE_COUNT,
            "features_per_assignment": FEATURES_PER_ASSIGNMENT,
            "coverage_digest": digest_values(refs),
            "assignment_ids": [row["assignment_id"] for row in manifest],
            "v9_sha256": V9_SHA256,
            "unresolved_errors": [],
            "activation_authorized": True,
        },
        "generator_outputs": ["activation/activation_core.json", "activation/authorizations/A005ERSC-NNNN.json", "activation/activation_envelope.json"],
        "generator_requires_zero_state": {"output_directories": ASSIGNMENT_COUNT, "output_files": 0, "receipts": 0, "results": 0, "native_capture": 0, "activation_files": 0},
        "scope_rule": "exactly this 16-leaf transaction; all-32 atomic activation forbidden",
    }


def intent(row: dict[str, Any]) -> dict[str, Any]:
    aid = row["assignment_id"]
    return {
        "audit_id": AUDIT_ID,
        "schema_version": "external-research-universal-shadow-certification-dispatch-intent-v1",
        "wave_id": WAVE_ID,
        "assignment_id": aid,
        "attempt_id": ATTEMPT_ID,
        "preparation_status": STATUS,
        "activation_required": True,
        "activation_granted_by_prelaunch_intent": False,
        "activation_authority_rule": "later immutable assignment authorization and activation core supersede only this prelaunch blocked state",
        "activation_core_ref": str(NAMESPACE / "activation/activation_core.json"),
        "dispatch_authorization_ref": str(NAMESPACE / "activation/authorizations" / (aid + ".json")),
        "activation_envelope_ref": str(NAMESPACE / "activation/activation_envelope.json"),
        "packet_id": row["packet_id"],
        "packet_ref": str(NAMESPACE / row["packet_ref"]),
        "packet_sha256": row["packet_sha256"],
        "feature_count": FEATURES_PER_ASSIGNMENT,
        "feature_refs_digest": row["feature_refs_digest"],
        "source_transaction_digest": source_transaction_digest(),
        "result_schema_ref": str(NAMESPACE / "schemas/result.schema.json"),
        "result_schema_sha256": sha_bytes(canonical_json(result_schema())),
        "leaf_prompt_ref": str(NAMESPACE / "leaf_prompt.json"),
        "leaf_prompt_sha256": sha_bytes(canonical_json(leaf_prompt())),
        "receipt_contract_ref": str(NAMESPACE / "receipt_contract.json"),
        "native_capture_contract_ref": str(NAMESPACE / "native_capture_contract.json"),
        "output_directory": row["output_directory"],
        "result_ref": str(Path(row["output_directory"]) / "result.json"),
        "receipt_ref": str(NAMESPACE / "dispatch" / aid / ATTEMPT_ID / "dispatch_receipt.json"),
        "prospective_agent_path": row["prospective_agent_path"],
        "controller_thread_id": CONTROLLER_THREAD_ID,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "fork_turns": "none",
        "fresh_child_required": True,
        "descendants_forbidden": True,
        "followups_forbidden": True,
        "write_exactly_one_result": True,
        "return_exactly": "PMR1",
    }


def static_files() -> dict[Path, bytes]:
    _packets, manifest, registry = packet_models()
    files: dict[Path, bytes] = {
        NAMESPACE / "architecture.json": canonical_json(architecture(manifest)),
        NAMESPACE / "batch_manifest.jsonl": jsonl(manifest),
        NAMESPACE / "packet_registry.jsonl": jsonl(registry),
        NAMESPACE / "leaf_prompt.json": canonical_json(leaf_prompt()),
        NAMESPACE / "schemas/result.schema.json": canonical_json(result_schema()),
        NAMESPACE / "receipt_contract.json": canonical_json(receipt_contract()),
        NAMESPACE / "native_capture_contract.json": canonical_json(native_capture_contract()),
        NAMESPACE / "activation_contract.json": canonical_json(activation_contract(manifest)),
    }
    for row in manifest:
        files[NAMESPACE / row["intent_ref"]] = canonical_json(intent(row))
    return files


def controls() -> dict[Path, bytes]:
    packets, manifest, registry = packet_models()
    payload_paths = [path for path in NAMESPACE.rglob("*") if path.is_file() and path.name not in {"batch_authority.json", "launch_seal.json", "local_candidate_report.json"} and "activation" not in path.parts]
    script_hashes = {name: sha_file(AUDIT_ROOT / name) for name in SCRIPT_NAMES}
    packet_bytes = [row["packet_bytes"] for row in manifest]
    refs = [ref for row in manifest for ref in row["feature_refs"]]
    packet_root = root_hash(sorted(NAMESPACE.glob("packets/*.json")), NAMESPACE)
    intent_root = root_hash(sorted(NAMESPACE.glob("dispatch/*/attempt-0001/dispatch_intent.json")), NAMESPACE)
    authority = {
        "audit_id": AUDIT_ID,
        "schema_version": "external-research-universal-shadow-certification-authority-v1",
        "wave_id": WAVE_ID,
        "status": STATUS,
        "activation_authorized": False,
        "certification_credit": 0,
        "assignment_count": ASSIGNMENT_COUNT,
        "features_per_assignment": FEATURES_PER_ASSIGNMENT,
        "feature_count": FEATURE_COUNT,
        "assignment_ids": [row["assignment_id"] for row in manifest],
        "assignment_ids_digest": digest_values([row["assignment_id"] for row in manifest]),
        "coverage_digest": digest_values(refs),
        "source_coverage_digest": SOURCE_COVERAGE_DIGEST,
        "source_transaction_digest": source_transaction_digest(),
        "source_hashes": SOURCE_HASHES,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "controller_thread_id": CONTROLLER_THREAD_ID,
        "v9_ref": V9_REF,
        "v9_sha256": V9_SHA256,
        "transaction_cap": 16,
        "rolling_total_cap": 32,
        "atomic_32_activation_forbidden": True,
        "packet_count": len(packets),
        "packet_bytes": {"min": min(packet_bytes), "max": max(packet_bytes), "total": sum(packet_bytes), "hard_ceiling": PACKET_CEILING_BYTES},
        "packet_root_sha256": packet_root,
        "intent_root_sha256": intent_root,
        "manifest_sha256": sha_file(NAMESPACE / "batch_manifest.jsonl"),
        "packet_registry_sha256": sha_file(NAMESPACE / "packet_registry.jsonl"),
        "architecture_sha256": sha_file(NAMESPACE / "architecture.json"),
        "leaf_prompt_sha256": sha_file(NAMESPACE / "leaf_prompt.json"),
        "result_schema_sha256": sha_file(NAMESPACE / "schemas/result.schema.json"),
        "receipt_contract_sha256": sha_file(NAMESPACE / "receipt_contract.json"),
        "native_capture_contract_sha256": sha_file(NAMESPACE / "native_capture_contract.json"),
        "activation_contract_sha256": sha_file(NAMESPACE / "activation_contract.json"),
        "candidate_payload_root_sha256": root_hash(payload_paths, AUDIT_ROOT),
        "script_sha256": script_hashes,
        "output_zero_state": {"directories": ASSIGNMENT_COUNT, "files": 0, "results": 0},
        "remaining_gate": "one independent Luna prelaunch report satisfying activation_contract.json",
    }
    authority_bytes = canonical_json(authority)
    launch_seal = {
        "audit_id": AUDIT_ID,
        "schema_version": "external-research-universal-shadow-certification-launch-seal-v1",
        "wave_id": WAVE_ID,
        "status": STATUS,
        "activation_authorized": False,
        "certification_credit": 0,
        "batch_authority_sha256": sha_bytes(authority_bytes),
        "manifest_sha256": authority["manifest_sha256"],
        "packet_root_sha256": packet_root,
        "intent_root_sha256": intent_root,
        "coverage_digest": authority["coverage_digest"],
        "assignment_ids_digest": authority["assignment_ids_digest"],
        "v9_sha256": V9_SHA256,
        "independent_prelaunch_ref": None,
        "independent_prelaunch_sha256": None,
        "live_activation_ref": None,
    }
    seal_bytes = canonical_json(launch_seal)
    report = {
        "audit_id": AUDIT_ID,
        "schema_version": "external-research-universal-shadow-certification-local-candidate-report-v1",
        "wave_id": WAVE_ID,
        "status": STATUS,
        "mechanical_status": "pass",
        "activation_authorized": False,
        "certification_credit": 0,
        "counts": {"assignments": ASSIGNMENT_COUNT, "packets": ASSIGNMENT_COUNT, "intents": ASSIGNMENT_COUNT, "features": FEATURE_COUNT, "features_per_assignment": FEATURES_PER_ASSIGNMENT, "owner_domains_per_packet": 16, "source_assignments_per_packet": 24, "empty_outputs": ASSIGNMENT_COUNT, "receipts": 0, "results": 0, "native_capture": 0, "activation_files": 0},
        "coverage_digest": authority["coverage_digest"],
        "packet_bytes": authority["packet_bytes"],
        "batch_authority_sha256": sha_bytes(authority_bytes),
        "launch_seal_sha256": sha_bytes(seal_bytes),
        "script_sha256": script_hashes,
        "minimal_luna_gate_inputs": ["absolute independent report path", "exact independent report SHA-256", "activation_contract.json", "batch_authority.json", "launch_seal.json", "batch_manifest.jsonl", "packet_registry.jsonl", "V9 policy"],
        "remaining_condition": "independent Luna prelaunch must satisfy every activation contract binding before generator may run",
    }
    return {
        NAMESPACE / "batch_authority.json": authority_bytes,
        NAMESPACE / "launch_seal.json": seal_bytes,
        NAMESPACE / "validation/local_candidate_report.json": canonical_json(report),
    }


def emit_patch(files: dict[Path, bytes]) -> None:
    print("*** Begin Patch")
    for path in sorted(files):
        print(patch_add(path, files[path]), end="")
    print("*** End Patch")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--summary", action="store_true")
    parser.add_argument("--emit-static-patch", action="store_true")
    parser.add_argument("--emit-packet-patch", type=int)
    parser.add_argument("--emit-controls-patch", action="store_true")
    args = parser.parse_args()
    packets, manifest, _registry = packet_models()
    if args.summary:
        sizes = [len(canonical_json(packet)) for packet in packets]
        print(json.dumps({
            "status": "pass",
            "assignments": len(packets),
            "features": sum(packet["feature_count"] for packet in packets),
            "features_per_assignment": sorted(set(packet["feature_count"] for packet in packets)),
            "coverage_digest": digest_values([ref for packet in packets for ref in packet["feature_refs"]]),
            "packet_bytes": {"min": min(sizes), "max": max(sizes), "total": sum(sizes), "hard_ceiling": PACKET_CEILING_BYTES},
            "owner_domains_per_packet": sorted(set(len(packet["owner_domain_counts"]) for packet in packets)),
            "source_assignments_per_packet": sorted(set(len(packet["source_assignment_counts"]) for packet in packets)),
        }, indent=2, sort_keys=True))
    elif args.emit_static_patch:
        emit_patch(static_files())
    elif args.emit_packet_patch:
        index = args.emit_packet_patch
        if index < 1 or index > ASSIGNMENT_COUNT:
            raise SystemExit("packet index out of range")
        emit_patch({NAMESPACE / "packets" / (packet_id(index) + ".json"): canonical_json(packets[index - 1])})
    elif args.emit_controls_patch:
        emit_patch(controls())
    else:
        parser.error("one action required")


if __name__ == "__main__":
    main()

