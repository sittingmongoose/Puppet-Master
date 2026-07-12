#!/usr/bin/env python3
"""Seal the prospective V29 ultra-only scenario cohort-0002 atomic8 transaction once."""
from __future__ import annotations

import copy
import hashlib
import json
import os
from pathlib import Path
from typing import Any

AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
WAVE = AUDIT / "master/scenario_adversarial/wave-0001"
COHORT = WAVE / "cohorts/cohort-0002"
HERE = Path(__file__).resolve().parent
AUTHORIZATIONS = HERE / "authorizations"
OVERLAYS = HERE / "intent_overlays"
IDS = [f"A005SA-{number:04d}" for number in range(9, 17)]
CONTROLLER_PATH = "/root/sol_controller_v29"
CONTROLLER_THREAD_ID = "019f551e-5c00-7a73-afa3-7b57d8f0f442"
MODEL = "gpt-5.6-sol"
EFFORT = "ultra"
TRANSACTION_ID = "SCENARIO-V29-COHORT-0002-ULTRA-ATOMIC8"

PINS = {
    "policy_v29": (
        AUDIT / "master/coordination/CONCURRENCY_POLICY_V29.json",
        "ebf5b20bc85a2bf41aee25b6d1c5a04934c7e936168fd04c8645f8a7c7c3bba8",
    ),
    "policy_v28": (
        AUDIT / "master/coordination/CONCURRENCY_POLICY_V28.json",
        "7831f2bdc2b64b581b160c22b6ba53ba1d4ba36f0e97681856b2324f141a5da2",
    ),
    "policy_v25": (
        AUDIT / "master/coordination/CONCURRENCY_POLICY_V25.json",
        "f2e0cd20f5612b8d6fa1d1946ee03f15b3f26138a38189a410926f4f69f0f63b",
    ),
    "research_checkpoint": (
        AUDIT / "master/external_research/sprint-wave-0001/checkpoints/research-checkpoint-0001.json",
        "94475c6e25c0559df5cb568b855678fa1c096b1f553ad682ae444b17e4732a4d",
    ),
    "seam_checkpoint": (
        AUDIT / "master/cross_domain_seams/wave-0001/window-sharding-v2/validation/postrun-v1/aggregate-seam-checkpoint-after-repair-v2.json",
        "f6d3fd1087c8dec7e35cfae26374605d31b342df3b945603986194598f9ee809",
    ),
    "scenario_cohort_0001_primary": (
        WAVE / "postrun-validator-v1/primary-execution-v1_2/cohort-0001-primary-postrun.json",
        "8c6b89cf0686ac50ecaa78053a2a472df375e24a22afae8efe99f094dfbfa6ff",
    ),
    "luna_scenario_gate": (
        WAVE / "launch-readiness-v16/validation/luna-independent-prelaunch-after-research-v22.json",
        "9c6a6b6be157c538061c508ed92569fd7dbfca67df41bbfe1e350467130464cb",
    ),
    "scenario_readiness": (
        WAVE / "launch-readiness-v16/terminal-readiness-report.json",
        "131d91ee8679132f8b806cab517350393105b43f86cc87342ac6987c75f12c02",
    ),
    "certification_v8_preparation": (
        AUDIT / "master/external_research/universal-shadow-certification-wave-0001/validation/activation-binding-v8-validator-runtime-supersession/terminal-preparation-report-v8.json",
        "215da1678af965ef7b8035037592621c9af42d4d8749b94b4a57d1eacc13101f",
    ),
    "old_xhigh_prep_authority": (
        COHORT / "activation-preparation-v1/CANDIDATE_AUTHORITY.json",
        "f9ac772b6fb7490848b69f280bde8a63d3ce1dca0f03e8a69923efccc519c1a6",
    ),
    "old_xhigh_prep_readiness": (
        COHORT / "activation-preparation-v1/readiness.json",
        "aa7b2aabac273445c64c9c9127168542c4dc17c565f6e507ba0da0c8a3ad5df9",
    ),
    "old_xhigh_prep_template": (
        COHORT / "activation-preparation-v1/activation.template.json",
        "965ecdab2e6cb079fb7a920fbef40a13c7de18b2f6ab0afd6cb44f5cd639ec5a",
    ),
    "old_xhigh_prep_generator": (
        COHORT / "activation-preparation-v1/generate_cohort_0002_activation.py",
        "7df31f951bad6761950848ff8f7bf8b0a8e273e054d14852dbf0df72d76383ab",
    ),
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def rows(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_once(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        os.write(descriptor, canonical(value))
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def child_path(assignment_id: str) -> str:
    number = int(assignment_id[-4:])
    return f"{CONTROLLER_PATH}/a005_scenario_adversarial_{number:04d}_attempt_0001_ultra_v29"


def main() -> None:
    errors: list[str] = []
    for name, (path, expected) in PINS.items():
        if not path.is_file() or sha(path) != expected:
            errors.append(f"pin:{name}")

    primary = load(PINS["scenario_cohort_0001_primary"][0])
    if primary.get("eligible_count") != 8 or primary.get("rejected_count") != 0:
        errors.append("cohort0001:not_exact8_0")
    if primary.get("eligible_ids") != [f"A005SA-{number:04d}" for number in range(1, 9)]:
        errors.append("cohort0001:identity_set")

    gate = load(PINS["luna_scenario_gate"][0])
    if gate.get("status") != "PASS" or gate.get("errors") != []:
        errors.append("luna_scenario_gate:not_unqualified_pass")

    manifest = rows(COHORT / "cohort_manifest.jsonl")
    if [row.get("assignment_id") for row in manifest] != IDS:
        errors.append("manifest:identity_set")
    if sum(row.get("feature_count", 0) for row in manifest) != 817:
        errors.append("manifest:feature_count")

    for generated in (
        HERE / "activation_core.json",
        HERE / "activation_envelope.json",
        HERE / "prelaunch_verification.json",
        HERE / "result_schema_ultra_v29.json",
        HERE / "receipt_contract_ultra_v29.json",
    ):
        if generated.exists():
            errors.append(f"transaction:already_exists:{generated.name}")
    if AUTHORIZATIONS.exists() or OVERLAYS.exists():
        errors.append("transaction:child_artifacts_already_exist")

    bindings: list[dict[str, Any]] = []
    for row in manifest:
        assignment_id = row["assignment_id"]
        original_intent_path = WAVE / f"dispatch/{assignment_id}/attempt-0001/dispatch_intent.json"
        original_intent = load(original_intent_path)
        packet_path = Path(original_intent["packet_ref"])
        output_directory = Path(original_intent["output_directory"])
        receipt_path = Path(original_intent["receipt_ref"])
        if not packet_path.is_file() or sha(packet_path) != original_intent.get("packet_sha256"):
            errors.append(f"{assignment_id}:packet")
        if not output_directory.is_dir() or any(output_directory.iterdir()):
            errors.append(f"{assignment_id}:output_not_empty")
        if receipt_path.exists():
            errors.append(f"{assignment_id}:receipt_exists")
        if original_intent.get("reasoning_effort") != "xhigh":
            errors.append(f"{assignment_id}:old_intent_not_xhigh")
        bindings.append({
            "assignment_id": assignment_id,
            "agent_path": child_path(assignment_id),
            "original_intent_path": str(original_intent_path),
            "original_intent_sha256": sha(original_intent_path),
            "packet_path": str(packet_path),
            "packet_sha256": sha(packet_path),
            "output_directory": str(output_directory),
            "receipt_path": str(receipt_path),
            "feature_count": row["feature_count"],
            "feature_refs_digest_sha256": row["feature_refs_digest"],
        })

    if errors:
        print(json.dumps({"status": "fail_closed", "errors": sorted(set(errors))}, indent=2))
        raise SystemExit(1)

    base_schema_path = WAVE / "schemas/scenario_adversarial_result.schema.json"
    result_schema = copy.deepcopy(load(base_schema_path))
    result_schema["properties"]["reasoning_effort"]["const"] = EFFORT
    result_schema["x-v29-prospective-effort-supersession"] = {
        "policy_path": str(PINS["policy_v29"][0]),
        "policy_sha256": PINS["policy_v29"][1],
        "prior_effort": "xhigh",
        "prospective_effort": EFFORT,
        "base_schema_path": str(base_schema_path),
        "base_schema_sha256": sha(base_schema_path),
        "semantic_checks_removed": 0,
    }
    result_schema_path = HERE / "result_schema_ultra_v29.json"
    write_once(result_schema_path, result_schema)

    receipt_contract = {
        "schema_version": "scenario-adversarial-receipt-contract-v29-ultra-v1",
        "supersedes_prospectively_only": str(WAVE / "receipt_contract.json"),
        "prior_contract_sha256": sha(WAVE / "receipt_contract.json"),
        "policy_v29_sha256": PINS["policy_v29"][1],
        "constants": {
            "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
            "wave_id": "wave-0001",
            "cohort_id": "cohort-0002",
            "controller_thread_id": CONTROLLER_THREAD_ID,
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "fresh_child": True,
            "fork_turns": "none",
            "transaction_id": TRANSACTION_ID,
        },
        "required_keys": [
            "audit_id", "schema_version", "wave_id", "cohort_id", "assignment_id", "attempt_id",
            "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort",
            "fresh_child", "fork_turns", "original_dispatch_intent_sha256", "intent_overlay_sha256",
            "packet_sha256", "output_directory", "result_path", "result_sha256", "terminal_status",
            "terminal_response", "native_child_thread_id", "native_turn_id", "activation_path",
            "activation_sha256", "transaction_id",
        ],
        "candidate_credit": 0,
    }
    receipt_contract_path = HERE / "receipt_contract_ultra_v29.json"
    write_once(receipt_contract_path, receipt_contract)

    core = {
        "schema_version": "scenario-adversarial-activation-core-v29-ultra-atomic8",
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "wave_id": "wave-0001",
        "cohort_id": "cohort-0002",
        "transaction_id": TRANSACTION_ID,
        "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_ULTRA_LEAVES",
        "activation_granted": True,
        "assignment_ids": IDS,
        "assignment_count": 8,
        "feature_count": 817,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "controller_agent_path": CONTROLLER_PATH,
        "controller_thread_id": CONTROLLER_THREAD_ID,
        "fork_turns": "none",
        "fresh_direct_leaves": True,
        "descendants_forbidden": True,
        "followups_forbidden": True,
        "retries_forbidden": True,
        "atomic16_forbidden": True,
        "whole_transaction_effort_uniformity_required": True,
        "prior_xhigh_preparation_mutated": False,
        "prior_xhigh_results_restarted": False,
        "candidate_credit_before_fresh_luna_postrun": 0,
        "result_schema_path": str(result_schema_path),
        "result_schema_sha256": sha(result_schema_path),
        "receipt_contract_path": str(receipt_contract_path),
        "receipt_contract_sha256": sha(receipt_contract_path),
        "pins": {name: {"path": str(path), "sha256": expected} for name, (path, expected) in PINS.items()},
        "effort_change": {
            "prior_completed_cohort_0001_effort": "xhigh",
            "prospective_cohort_0002_effort": EFFORT,
            "authority": "CONCURRENCY_POLICY_V29",
            "mixed_effort_inside_transaction": False,
        },
    }
    core_path = HERE / "activation_core.json"
    write_once(core_path, core)
    core_sha = sha(core_path)

    authorization_hashes: dict[str, str] = {}
    overlay_hashes: dict[str, str] = {}
    for binding in bindings:
        assignment_id = binding["assignment_id"]
        overlay = {
            "schema_version": "scenario-adversarial-dispatch-intent-overlay-v29-ultra-v1",
            "transaction_id": TRANSACTION_ID,
            "activation_core_path": str(core_path),
            "activation_core_sha256": core_sha,
            "assignment_id": assignment_id,
            "attempt_id": "attempt-0001",
            "cohort_id": "cohort-0002",
            "original_intent_path": binding["original_intent_path"],
            "original_intent_sha256": binding["original_intent_sha256"],
            "original_xhigh_intent_mutated": False,
            "prospective_agent_path": binding["agent_path"],
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "fork_turns": "none",
            "fresh_child_required": True,
            "descendants_forbidden": True,
            "followup_messages_forbidden": True,
            "retries_forbidden": True,
            "packet_ref": binding["packet_path"],
            "packet_sha256": binding["packet_sha256"],
            "result_schema_ref": str(result_schema_path),
            "result_schema_sha256": sha(result_schema_path),
            "output_directory": binding["output_directory"],
            "receipt_ref": binding["receipt_path"],
            "result_contract": "write exactly one strict result.json in output_directory",
            "terminal_contract": "return exactly PMR1 after result.json; write no other file",
            "candidate_credit_before_fresh_luna_postrun": 0,
        }
        overlay_path = OVERLAYS / f"{assignment_id}.json"
        write_once(overlay_path, overlay)
        overlay_hashes[assignment_id] = sha(overlay_path)

        authorization = {
            "schema_version": "scenario-adversarial-leaf-dispatch-authorization-v29-ultra-v1",
            "transaction_id": TRANSACTION_ID,
            "cohort_id": "cohort-0002",
            "assignment_id": assignment_id,
            "activation_granted": True,
            "activation_core_path": str(core_path),
            "activation_core_sha256": core_sha,
            "intent_overlay_path": str(overlay_path),
            "intent_overlay_sha256": overlay_hashes[assignment_id],
            "original_intent_path": binding["original_intent_path"],
            "original_intent_sha256": binding["original_intent_sha256"],
            "agent_path": binding["agent_path"],
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "fork_turns": "none",
            "fresh_child": True,
            "descendants_forbidden": True,
            "followups_forbidden": True,
            "retries_forbidden": True,
            "packet_path": binding["packet_path"],
            "packet_sha256": binding["packet_sha256"],
            "result_schema_path": str(result_schema_path),
            "result_schema_sha256": sha(result_schema_path),
            "receipt_contract_path": str(receipt_contract_path),
            "receipt_contract_sha256": sha(receipt_contract_path),
            "output_directory": binding["output_directory"],
            "receipt_path": binding["receipt_path"],
            "feature_count": binding["feature_count"],
            "feature_refs_digest_sha256": binding["feature_refs_digest_sha256"],
        }
        authorization_path = AUTHORIZATIONS / f"{assignment_id}.json"
        write_once(authorization_path, authorization)
        authorization_hashes[assignment_id] = sha(authorization_path)

    envelope = {
        "schema_version": "scenario-adversarial-activation-envelope-v29-ultra-atomic8",
        "transaction_id": TRANSACTION_ID,
        "status": "SEALED_ACTIVE",
        "cohort_id": "cohort-0002",
        "assignment_ids": IDS,
        "activation_core_path": str(core_path),
        "activation_core_sha256": core_sha,
        "authorization_sha256_by_assignment": authorization_hashes,
        "intent_overlay_sha256_by_assignment": overlay_hashes,
        "atomic_size": 8,
        "atomic16_forbidden": True,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "candidate_credit": 0,
    }
    envelope_path = HERE / "activation_envelope.json"
    write_once(envelope_path, envelope)

    verification = {
        "schema_version": "scenario-adversarial-prelaunch-verification-v29-ultra-v1",
        "status": "PASS",
        "errors": [],
        "transaction_id": TRANSACTION_ID,
        "assignment_count": 8,
        "assignment_ids": IDS,
        "feature_count": 817,
        "results_present": 0,
        "receipts_present": 0,
        "native_capture_rows": 0,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "controller_thread_id": CONTROLLER_THREAD_ID,
        "activation_core_sha256": core_sha,
        "activation_envelope_sha256": sha(envelope_path),
        "result_schema_sha256": sha(result_schema_path),
        "receipt_contract_sha256": sha(receipt_contract_path),
        "cohort0001_primary_exact8_0": True,
        "old_xhigh_preparation_preserved": True,
        "candidate_credit": 0,
    }
    verification_path = HERE / "prelaunch_verification.json"
    write_once(verification_path, verification)

    print(json.dumps({
        "status": "activated_ultra_atomic8",
        "transaction_id": TRANSACTION_ID,
        "activation_core_sha256": core_sha,
        "activation_envelope_sha256": sha(envelope_path),
        "prelaunch_verification_sha256": sha(verification_path),
        "result_schema_sha256": sha(result_schema_path),
        "receipt_contract_sha256": sha(receipt_contract_path),
        "authorization_sha256_by_assignment": authorization_hashes,
        "intent_overlay_sha256_by_assignment": overlay_hashes,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
