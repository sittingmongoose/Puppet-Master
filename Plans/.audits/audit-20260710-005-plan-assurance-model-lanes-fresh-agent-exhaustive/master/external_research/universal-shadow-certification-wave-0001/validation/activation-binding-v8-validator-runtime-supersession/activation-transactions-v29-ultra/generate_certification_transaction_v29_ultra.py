#!/usr/bin/env python3
"""Emit one separately gated V29 ultra certification atomic8 transaction."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
from typing import Any

AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
WAVE = AUDIT / "master/external_research/universal-shadow-certification-wave-0001"
V8 = WAVE / "validation/activation-binding-v8-validator-runtime-supersession"
HERE = Path(__file__).resolve().parent
MODEL = "gpt-5.6-sol"
EFFORT = "ultra"
CONTROLLER_PATH = "/root/sol_controller_v29"
CONTROLLER_THREAD_ID = "019f551e-5c00-7a73-afa3-7b57d8f0f442"
POLICY_V29_SHA = "ebf5b20bc85a2bf41aee25b6d1c5a04934c7e936168fd04c8645f8a7c7c3bba8"
V8_PREP_SHA = "215da1678af965ef7b8035037592621c9af42d4d8749b94b4a57d1eacc13101f"
V8_AUTHORITY_SHA = "f36db3670c6d33f4c3bac0832ac9f788ea6193d5dacf5b4f9f608bbb1d51258c"
V7_TOPOLOGY_SHA = "6a31474c4e6943e812776739cf87a7efeeba6cda1937bc0a94d645cf145839e1"
GATES = {
    "cohort-0001": "7aa8032d9c292b26303b59af858913bfb759c31be9df07a4c3102e7e21d95bd5",
    "cohort-0002": "d72906bcac8ad5547dd8c2e2ceeb70df434bf2e828ebfd739e8c243d011f72f1",
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def rows() -> list[dict[str, Any]]:
    return [json.loads(line) for line in (WAVE / "batch_manifest.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]


def write_once(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        os.write(descriptor, canonical(value))
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def expected_ids(cohort_id: str) -> list[str]:
    start = 1 if cohort_id == "cohort-0001" else 9
    return [f"A005ERSC-{number:04d}" for number in range(start, start + 8)]


def child_path(assignment_id: str) -> str:
    return f"{CONTROLLER_PATH}/a005_ersc_{int(assignment_id[-4:]):04d}_attempt_0001_ultra_v29"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cohort-id", required=True, choices=("cohort-0001", "cohort-0002"))
    parser.add_argument("--expected-prelaunch-live", required=True, type=int, choices=(8, 16))
    args = parser.parse_args()
    cohort_id = args.cohort_id
    ids = expected_ids(cohort_id)
    final = HERE / cohort_id
    errors: list[str] = []

    fixed = {
        "policy_v29": (AUDIT / "master/coordination/CONCURRENCY_POLICY_V29.json", POLICY_V29_SHA),
        "v8_preparation": (V8 / "terminal-preparation-report-v8.json", V8_PREP_SHA),
        "v8_authority": (V8 / "AUTHORITY_V8.json", V8_AUTHORITY_SHA),
        "v7_atomic8_topology": (WAVE / "validation/activation-binding-v7-atomic8/terminal-preparation-report-v7-atomic8.json", V7_TOPOLOGY_SHA),
        "luna_cohort_gate": (V8 / f"luna-independent-prelaunch-v8-{cohort_id}.json", GATES[cohort_id]),
    }
    for name, (path, expected) in fixed.items():
        if not path.is_file() or sha(path) != expected:
            errors.append(f"pin:{name}")
    gate = load(fixed["luna_cohort_gate"][0])
    if gate.get("status") != "PASS" or gate.get("errors") != []:
        errors.append("gate:not_unqualified_pass")
    scope = gate.get("scope", {})
    scope_id = scope.get("cohort_id")
    if scope_id != cohort_id or scope.get("assignments", 8) != 8:
        errors.append("gate:scope")
    if final.exists():
        errors.append("transaction:already_exists")

    all_rows = {row["assignment_id"]: row for row in rows()}
    selected = [all_rows[assignment_id] for assignment_id in ids]
    bindings: list[dict[str, Any]] = []
    for row in selected:
        assignment_id = row["assignment_id"]
        intent_path = WAVE / row["intent_ref"]
        intent = load(intent_path)
        packet_path = WAVE / row["packet_ref"]
        output_directory = Path(row["output_directory"])
        receipt_path = Path(intent["receipt_ref"])
        if sha(packet_path) != row["packet_sha256"]:
            errors.append(f"{assignment_id}:packet")
        if not output_directory.is_dir() or any(output_directory.iterdir()):
            errors.append(f"{assignment_id}:output_not_empty")
        if receipt_path.exists():
            errors.append(f"{assignment_id}:receipt_exists")
        if intent.get("reasoning_effort") != "xhigh":
            errors.append(f"{assignment_id}:old_intent_not_xhigh")
        bindings.append({
            "assignment_id": assignment_id,
            "agent_path": child_path(assignment_id),
            "original_intent_path": str(intent_path.resolve()),
            "original_intent_sha256": sha(intent_path),
            "packet_path": str(packet_path.resolve()),
            "packet_sha256": sha(packet_path),
            "output_directory": str(output_directory),
            "receipt_path": str(receipt_path),
            "feature_count": row["feature_count"],
            "feature_refs_digest": row["feature_refs_digest"],
        })
    if sum(binding["feature_count"] for binding in bindings) != 1944:
        errors.append("cohort:feature_count")
    if errors:
        print(json.dumps({"status": "fail_closed", "errors": sorted(set(errors))}, indent=2))
        raise SystemExit(1)

    final.mkdir(parents=True)
    schema = copy.deepcopy(load(WAVE / "schemas/result.schema.json"))
    schema["properties"]["reasoning_effort"]["const"] = EFFORT
    schema["x-v29-prospective-effort-supersession"] = {
        "policy_sha256": POLICY_V29_SHA,
        "prior_effort": "xhigh",
        "prospective_effort": EFFORT,
        "base_schema_sha256": sha(WAVE / "schemas/result.schema.json"),
        "semantic_checks_removed": 0,
    }
    schema_path = final / "result_schema_ultra_v29.json"
    write_once(schema_path, schema)

    transaction_id = f"A005-ERSC-V29-ULTRA-ATOMIC8-{cohort_id}"
    receipt_contract = {
        "schema_version": "universal-shadow-certification-receipt-contract-v29-ultra-v1",
        "transaction_id": transaction_id,
        "cohort_id": cohort_id,
        "controller_thread_id": CONTROLLER_THREAD_ID,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "fork_turns": "none",
        "fresh_child": True,
        "prior_contract_path": str((WAVE / "receipt_contract.json").resolve()),
        "prior_contract_sha256": sha(WAVE / "receipt_contract.json"),
        "candidate_credit": 0,
    }
    receipt_contract_path = final / "receipt_contract_ultra_v29.json"
    write_once(receipt_contract_path, receipt_contract)

    core = {
        "schema_version": "universal-shadow-certification-activation-core-v29-ultra-atomic8",
        "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_ULTRA_CERTIFICATION_LEAVES",
        "activation_granted": True,
        "activation_transaction_id": transaction_id,
        "cohort_id": cohort_id,
        "assignment_count": 8,
        "assignment_ids": ids,
        "feature_count": 1944,
        "controller_agent_path": CONTROLLER_PATH,
        "controller_thread_id": CONTROLLER_THREAD_ID,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "fork_turns": "none",
        "fresh_direct_leaves": True,
        "descendants_forbidden": True,
        "followups_forbidden": True,
        "retries_forbidden": True,
        "atomic16_forbidden": True,
        "whole_transaction_effort_uniformity_required": True,
        "prelaunch_live_semantic_count": args.expected_prelaunch_live,
        "postlaunch_live_semantic_count": args.expected_prelaunch_live + 8,
        "pre_reset_semantic_cap": 24,
        "candidate_credit_before_fresh_luna_postrun": 0,
        "prior_xhigh_intents_mutated": False,
        "pins": {name: {"path": str(path.resolve()), "sha256": expected} for name, (path, expected) in fixed.items()},
        "result_schema_path": str(schema_path.resolve()),
        "result_schema_sha256": sha(schema_path),
        "receipt_contract_path": str(receipt_contract_path.resolve()),
        "receipt_contract_sha256": sha(receipt_contract_path),
    }
    core_path = final / "activation_core.json"
    write_once(core_path, core)
    core_sha = sha(core_path)

    auth_hashes: dict[str, str] = {}
    overlay_hashes: dict[str, str] = {}
    for binding in bindings:
        assignment_id = binding["assignment_id"]
        overlay = {
            "schema_version": "universal-shadow-certification-dispatch-intent-overlay-v29-ultra-v1",
            "activation_transaction_id": transaction_id,
            "cohort_id": cohort_id,
            "assignment_id": assignment_id,
            "attempt_id": "attempt-0001",
            "original_intent_path": binding["original_intent_path"],
            "original_intent_sha256": binding["original_intent_sha256"],
            "original_xhigh_intent_mutated": False,
            "prospective_agent_path": binding["agent_path"],
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "fork_turns": "none",
            "fresh_child_required": True,
            "descendants_forbidden": True,
            "followups_forbidden": True,
            "retries_forbidden": True,
            "packet_ref": binding["packet_path"],
            "packet_sha256": binding["packet_sha256"],
            "result_schema_ref": str(schema_path.resolve()),
            "result_schema_sha256": sha(schema_path),
            "output_directory": binding["output_directory"],
            "receipt_ref": binding["receipt_path"],
            "return_exactly": "PMR1",
            "candidate_credit": 0,
        }
        overlay_path = final / "intent_overlays" / f"{assignment_id}.json"
        write_once(overlay_path, overlay)
        overlay_hashes[assignment_id] = sha(overlay_path)
        authorization = {
            "schema_version": "universal-shadow-certification-leaf-authorization-v29-ultra-v1",
            "activation_granted": True,
            "activation_transaction_id": transaction_id,
            "activation_core_ref": str(core_path.resolve()),
            "activation_core_sha256": core_sha,
            "intent_overlay_ref": str(overlay_path.resolve()),
            "intent_overlay_sha256": overlay_hashes[assignment_id],
            "receipt_contract_ref": str(receipt_contract_path.resolve()),
            "receipt_contract_sha256": sha(receipt_contract_path),
            "cohort_id": cohort_id,
            "assignment_id": assignment_id,
            "agent_path": binding["agent_path"],
            "packet_ref": binding["packet_path"],
            "packet_sha256": binding["packet_sha256"],
            "result_schema_ref": str(schema_path.resolve()),
            "result_schema_sha256": sha(schema_path),
            "output_directory": binding["output_directory"],
            "receipt_ref": binding["receipt_path"],
            "feature_count": binding["feature_count"],
            "feature_refs_digest": binding["feature_refs_digest"],
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "fork_turns": "none",
            "fresh_child": True,
            "descendants_forbidden": True,
            "followups_forbidden": True,
            "retries_forbidden": True,
            "candidate_credit": 0,
        }
        auth_path = final / "authorizations" / f"{assignment_id}.json"
        write_once(auth_path, authorization)
        auth_hashes[assignment_id] = sha(auth_path)

    envelope = {
        "schema_version": "universal-shadow-certification-activation-envelope-v29-ultra-atomic8",
        "status": "SEALED_ACTIVE",
        "activation_granted": True,
        "activation_transaction_id": transaction_id,
        "cohort_id": cohort_id,
        "assignment_count": 8,
        "assignment_ids": ids,
        "activation_core_ref": str(core_path.resolve()),
        "activation_core_sha256": core_sha,
        "authorization_sha256_by_assignment": auth_hashes,
        "intent_overlay_sha256_by_assignment": overlay_hashes,
        "atomic_size": 8,
        "atomic16_forbidden": True,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "candidate_credit": 0,
    }
    envelope_path = final / "activation_envelope.json"
    write_once(envelope_path, envelope)
    print(json.dumps({
        "status": "activated_ultra_atomic8",
        "cohort_id": cohort_id,
        "assignment_count": 8,
        "activation_core_sha256": core_sha,
        "activation_envelope_sha256": sha(envelope_path),
        "luna_gate_sha256": GATES[cohort_id],
        "postlaunch_live_semantic_count": args.expected_prelaunch_live + 8,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
