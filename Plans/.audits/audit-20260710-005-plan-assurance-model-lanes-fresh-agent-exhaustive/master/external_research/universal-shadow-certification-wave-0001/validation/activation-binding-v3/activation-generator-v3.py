#!/usr/bin/env python3
"""Fail-closed future generator; intentionally not invoked during preparation."""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import importlib.util

BASE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("binding_v3_verify", BASE / "verify_activation_binding_v3.py")
verify = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify)

def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

def canonical(value):
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()

def fail(message):
    raise SystemExit("FAIL_CLOSED:" + message)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--independent-report", required=True, type=Path)
    parser.add_argument("--independent-report-sha256", required=True)
    args = parser.parse_args()
    authority = load(verify.AUTHORITY_PATH)
    contract = load(verify.CONTRACT_PATH)
    if sha(verify.AUTHORITY_PATH) != contract.get("authority_sha256"):
        fail("authority-contract-binding")
    if args.independent_report.resolve() != verify.AUDIT_ROOT / contract["future_independent_prelaunch_v3_path"]:
        fail("future-report-path")
    if sha(args.independent_report) != args.independent_report_sha256:
        fail("future-report-sha")
    report = load(args.independent_report)
    prep = verify.verify_preparation()
    if prep["status"] != "pass":
        fail("preparation:" + ";".join(prep["errors"]))
    if report.get("status") != "pass" or report.get("independent") is not True:
        fail("future-report-state")
    if report.get("assignment_count") != 16 or report.get("feature_count") != 3888:
        fail("future-report-count")
    if report.get("candidate_snapshot_sha256") != sha(verify.SNAPSHOT_PATH):
        fail("future-report-snapshot")
    if report.get("v3_byte_sorted_root_sha256") != load(verify.RECONCILIATION_PATH)["v3_stable_40_file_byte_sorted_root_sha256"]:
        fail("future-report-root")
    if report.get("dependency_binding_terminal_report_sha256") != authority["dependency_binding_v1"]["terminal_report_sha256"]:
        fail("future-report-dependency")
    if report.get("zero_state", {}).get("activation_files") != 0 or report.get("zero_state", {}).get("results") != 0 or report.get("zero_state", {}).get("receipts") != 0:
        fail("future-report-zero-state")
    transaction = BASE / "activation-transaction-v3"
    if transaction.exists():
        fail("activation-already-exists")
    transaction.mkdir()
    core = {
        "schema_version": "universal-shadow-certification-activation-core-v3",
        "audit_id": authority["audit_id"],
        "wave_id": authority["wave_id"],
        "activation_granted": True,
        "activation_transaction_id": "A005-ERSC-V3-" + args.independent_report_sha256[:24],
        "candidate_snapshot_sha256": sha(verify.SNAPSHOT_PATH),
        "dependency_binding_terminal_report_sha256": authority["dependency_binding_v1"]["terminal_report_sha256"],
        "assignment_count": 16,
        "feature_count": 3888,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "fork_turns": "none",
        "certification_credit": 0,
        "independent_prelaunch_v3_path": str(args.independent_report.resolve()),
        "independent_prelaunch_v3_sha256": args.independent_report_sha256
    }
    core_path = transaction / "activation-core-v3.json"
    core_path.write_bytes(canonical(core))
    auth_dir = transaction / "leaf-authorizations"
    auth_dir.mkdir()
    assignment_ids = ["A005ERSC-%04d" % i for i in range(1, 17)]
    auth_hashes = {}
    snapshot = load(verify.SNAPSHOT_PATH)
    for row in snapshot["assignments"]:
        auth = {
            "schema_version": "universal-shadow-certification-dispatch-authorization-v3",
            "assignment_id": row["assignment_id"],
            "activation_granted": True,
            "activation_core_sha256": sha(core_path),
            "packet_path": row["packet_path"],
            "packet_sha256": row["packet_sha256"],
            "intent_path": row["intent_path"],
            "intent_sha256": row["intent_sha256"],
            "output_directory": row["output_directory"],
            "agent_path": row["prospective_agent_path"],
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "fork_turns": "none",
            "certification_credit": 0
        }
        path = auth_dir / (row["assignment_id"] + ".json")
        path.write_bytes(canonical(auth))
        auth_hashes[row["assignment_id"]] = sha(path)
    envelope = {
        "schema_version": "universal-shadow-certification-activation-envelope-v3",
        "activation_granted": True,
        "activation_core_sha256": sha(core_path),
        "authorization_count": 16,
        "authorization_sha256_by_assignment": auth_hashes,
        "independent_prelaunch_v3_sha256": args.independent_report_sha256,
        "certification_credit": 0
    }
    (transaction / "activation-envelope-v3.json").write_bytes(canonical(envelope))
    print(json.dumps({"status": "ACTIVE_FOR_EXACTLY_16_FRESH_SOL_XHIGH_LEAVES", "transaction": str(transaction), "authorization_count": 16}, sort_keys=True))

if __name__ == "__main__":
    main()
