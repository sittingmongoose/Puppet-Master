#!/usr/bin/env python3
"""Fail-closed future activation transaction generator. Do not run during preparation."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from universal_shadow_certification_common import (
    ASSIGNMENT_COUNT, ATTEMPT_ID, AUDIT_ID, AUDIT_ROOT, CONTROLLER_THREAD_ID,
    EFFORT, FEATURE_COUNT, FEATURES_PER_ASSIGNMENT, MODEL, NAMESPACE, V9_SHA256,
    WAVE_ID, canonical_json, digest_values, load_jsonl, load_object, root_hash,
    sha_bytes, sha_file,
)


def fail(message: str) -> None:
    raise RuntimeError(message)


def atomic_write(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_bytes(canonical_json(value))
    os.replace(temporary, path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--luna-report", required=True)
    parser.add_argument("--luna-sha256", required=True)
    parser.add_argument("--transaction-id", required=True)
    args = parser.parse_args()
    luna_path = Path(args.luna_report).resolve()
    if not luna_path.is_file() or sha_file(luna_path) != args.luna_sha256:
        fail("independent Luna report path/hash mismatch")
    if NAMESPACE / "activation" in []:  # keep static analyzers from treating path existence as grant
        fail("unreachable")
    activation_dir = NAMESPACE / "activation"
    if activation_dir.exists():
        fail("activation namespace already exists")
    manifest = load_jsonl(NAMESPACE / "batch_manifest.jsonl")
    authority = load_object(NAMESPACE / "batch_authority.json")
    seal = load_object(NAMESPACE / "launch_seal.json")
    report = load_object(luna_path)
    ids = [row["assignment_id"] for row in manifest]
    expected_report = {
        "audit_id": AUDIT_ID,
        "wave_id": WAVE_ID,
        "status": "pass",
        "independent": True,
        "assignment_count": ASSIGNMENT_COUNT,
        "feature_count": FEATURE_COUNT,
        "features_per_assignment": FEATURES_PER_ASSIGNMENT,
        "coverage_digest": authority["coverage_digest"],
        "assignment_ids": ids,
        "v9_sha256": V9_SHA256,
        "unresolved_errors": [],
        "activation_authorized": True,
    }
    for key, expected in expected_report.items():
        if report.get(key) != expected:
            fail("Luna gate mismatch:%s" % key)
    expected_bindings = {
        "batch_authority_sha256": sha_file(NAMESPACE / "batch_authority.json"),
        "launch_seal_sha256": sha_file(NAMESPACE / "launch_seal.json"),
        "manifest_sha256": sha_file(NAMESPACE / "batch_manifest.jsonl"),
        "packet_registry_sha256": sha_file(NAMESPACE / "packet_registry.jsonl"),
        "architecture_sha256": sha_file(NAMESPACE / "architecture.json"),
        "leaf_prompt_sha256": sha_file(NAMESPACE / "leaf_prompt.json"),
        "result_schema_sha256": sha_file(NAMESPACE / "schemas/result.schema.json"),
        "receipt_contract_sha256": sha_file(NAMESPACE / "receipt_contract.json"),
        "native_capture_contract_sha256": sha_file(NAMESPACE / "native_capture_contract.json"),
        "packet_root_sha256": root_hash(sorted(NAMESPACE.glob("packets/*.json")), NAMESPACE),
        "intent_root_sha256": root_hash(sorted(NAMESPACE.glob("dispatch/*/attempt-0001/dispatch_intent.json")), NAMESPACE),
        "v9_sha256": V9_SHA256,
    }
    if report.get("bindings") != expected_bindings:
        fail("Luna immutable binding set mismatch")
    if authority.get("status") != "BLOCKED_AWAITING_INDEPENDENT_PRELAUNCH" or seal.get("activation_authorized") is not False:
        fail("candidate authority/seal state mismatch")
    if len(manifest) != ASSIGNMENT_COUNT or ids != ["A005ERSC-%04d" % i for i in range(1, 17)]:
        fail("manifest scope mismatch")
    for row in manifest:
        output = Path(row["output_directory"])
        if not output.is_dir() or any(output.iterdir()):
            fail("output not empty:%s" % row["assignment_id"])
        intent_path = NAMESPACE / row["intent_ref"]
        receipt_path = intent_path.with_name("dispatch_receipt.json")
        if receipt_path.exists():
            fail("receipt exists:%s" % row["assignment_id"])
    if list(NAMESPACE.glob("**/native_capture*.json")) or list(NAMESPACE.glob("**/result.json")):
        fail("capture/result exists preactivation")

    core = {
        "audit_id": AUDIT_ID,
        "schema_version": "external-research-universal-shadow-certification-activation-core-v1",
        "wave_id": WAVE_ID,
        "transaction_id": args.transaction_id,
        "activation_granted": True,
        "scope": "exactly_16_fresh_sol_xhigh_shadow_certification_leaves",
        "assignment_ids": ids,
        "assignment_ids_digest": digest_values(ids),
        "feature_count": FEATURE_COUNT,
        "coverage_digest": authority["coverage_digest"],
        "controller_thread_id": CONTROLLER_THREAD_ID,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "fork_turns": "none",
        "fresh_children": True,
        "descendants_forbidden": True,
        "transaction_cap": 16,
        "rolling_total_cap": 32,
        "atomic_32_activation_forbidden": True,
        "v9_sha256": V9_SHA256,
        "independent_luna_report_ref": str(luna_path),
        "independent_luna_report_sha256": args.luna_sha256,
        "immutable_bindings": expected_bindings,
        "prevalidation_certification_credit": 0,
    }
    core_bytes = canonical_json(core)
    core_sha = sha_bytes(core_bytes)
    authorizations = []
    for row in manifest:
        intent_path = NAMESPACE / row["intent_ref"]
        authorization = {
            "audit_id": AUDIT_ID,
            "schema_version": "external-research-universal-shadow-certification-dispatch-authorization-v1",
            "wave_id": WAVE_ID,
            "transaction_id": args.transaction_id,
            "assignment_id": row["assignment_id"],
            "attempt_id": ATTEMPT_ID,
            "activation_granted": True,
            "activation_core_ref": str(activation_dir / "activation_core.json"),
            "activation_core_sha256": core_sha,
            "dispatch_intent_ref": str(intent_path),
            "dispatch_intent_sha256": sha_file(intent_path),
            "packet_ref": str(NAMESPACE / row["packet_ref"]),
            "packet_sha256": row["packet_sha256"],
            "output_directory": row["output_directory"],
            "prospective_agent_path": row["prospective_agent_path"],
            "controller_thread_id": CONTROLLER_THREAD_ID,
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "fresh_child": True,
            "fork_turns": "none",
        }
        authorization_bytes = canonical_json(authorization)
        authorizations.append((row["assignment_id"], authorization, sha_bytes(authorization_bytes)))
    envelope = {
        "audit_id": AUDIT_ID,
        "schema_version": "external-research-universal-shadow-certification-activation-envelope-v1",
        "wave_id": WAVE_ID,
        "transaction_id": args.transaction_id,
        "activation_granted": True,
        "activation_core_ref": str(activation_dir / "activation_core.json"),
        "activation_core_sha256": core_sha,
        "authorization_count": ASSIGNMENT_COUNT,
        "authorization_sha256_by_assignment": {aid: digest for aid, _value, digest in authorizations},
        "assignment_ids": ids,
        "independent_luna_report_sha256": args.luna_sha256,
        "atomic_32_activation_forbidden": True,
    }
    atomic_write(activation_dir / "activation_core.json", core)
    for aid, authorization, _digest in authorizations:
        atomic_write(activation_dir / "authorizations" / (aid + ".json"), authorization)
    atomic_write(activation_dir / "activation_envelope.json", envelope)
    print(json.dumps({"status": "activated_exactly_16", "transaction_id": args.transaction_id, "activation_core_sha256": core_sha, "activation_envelope_sha256": sha_file(activation_dir / "activation_envelope.json")}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()

