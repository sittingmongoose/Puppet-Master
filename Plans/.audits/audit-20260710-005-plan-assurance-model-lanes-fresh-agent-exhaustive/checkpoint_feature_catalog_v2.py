#!/usr/bin/env python3
"""Checkpoint the independently reconciled complete feature catalog."""

from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

from feature_catalog_common import (
    CATALOG_ATTEMPT,
    CATALOG_EPOCH,
    CATALOG_ROOT,
    ROOT,
    digest_strings,
    load_jsonl,
    load_obj,
    sha,
    write_jsonl,
    write_obj,
)
from prepare_feature_catalog_batch import BATCH_ID


AUTHORITY_REF = "master/feature_catalog/authorities/VALIDATOR_AUTHORITY_V2.json"


def bound(path_ref: str, expected_sha: str) -> Path:
    path = ROOT / path_ref
    if not path.is_file() or sha(path.read_bytes()) != expected_sha:
        raise RuntimeError(f"bound artifact mismatch:{path_ref}")
    return path


def main() -> None:
    transaction = CATALOG_ROOT / "transactions" / BATCH_ID
    staging = CATALOG_ROOT / "staging_transactions" / BATCH_ID
    active_path = CATALOG_ROOT / "live/ACTIVE.json"
    if transaction.exists() or staging.exists() or active_path.exists():
        raise RuntimeError("refusing to overwrite feature-catalog transaction or active pointer")
    authority_path = ROOT / AUTHORITY_REF
    authority = load_obj(authority_path)
    if authority.get("status") != "ACTIVE_FOR_CATALOG_CREDIT":
        raise RuntimeError("validator v2 authority is not active")
    for ref_key, sha_key in (
        ("batch_authority_ref", "batch_authority_sha256"),
        ("primary_validator_v1_ref", "primary_validator_v1_sha256"),
        ("primary_report_v1_ref", "primary_report_v1_sha256"),
        ("validator_v2_ref", "validator_v2_sha256"),
        ("primary_report_v2_ref", "primary_report_v2_sha256"),
        ("luna_postrun_ref", "luna_postrun_sha256"),
        ("native_capture_ref", "native_capture_sha256"),
    ):
        bound(authority[ref_key], authority[sha_key])
    process = subprocess.run(
        ["python3", authority["validator_v2_ref"]], cwd=ROOT,
        capture_output=True, text=True, check=False,
    )
    if process.returncode != 0 or not process.stdout.strip():
        raise RuntimeError(f"validator v2 execution failed:{process.stdout}:{process.stderr}")
    live_v2 = json.loads(process.stdout)
    frozen_v2 = load_obj(ROOT / authority["primary_report_v2_ref"])
    if live_v2 != frozen_v2 or live_v2.get("status") != "pass" or live_v2.get("counts", {}).get("eligible") != 23:
        raise RuntimeError("live/frozen v2 result mismatch")
    luna = load_obj(ROOT / authority["luna_postrun_ref"])
    eligible_v2 = set(live_v2.get("eligible_assignment_ids", []))
    eligible_luna = set(luna.get("schema_prompt_eligible_assignment_ids", []))
    credited_ids = sorted(eligible_v2 & eligible_luna)
    if eligible_v2 != eligible_luna or len(credited_ids) != authority["credit_policy"]["expected_assignment_count"]:
        raise RuntimeError("v2/Luna eligible-set mismatch")

    epoch = CATALOG_ROOT / "frozen" / CATALOG_EPOCH
    assignments = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
    assignment_by_id = {row["assignment_id"]: row for row in assignments}
    atom_ledger = load_jsonl(epoch / "manifests/atom_ledger.jsonl")
    atom_ids_expected = {row["atom_id"] for row in atom_ledger}
    capture = load_obj(ROOT / authority["native_capture_ref"])
    native_by_id = {row["assignment_id"]: row for row in capture["leaves"]}
    primary_by_id = {row["assignment_id"]: row for row in live_v2["results"]}
    staging.mkdir(parents=True)
    outcomes: list[dict] = []
    feature_ledger: list[dict] = []
    covered_atoms: list[str] = []
    local_feature_refs: list[str] = []

    for assignment_id in credited_ids:
        assignment = assignment_by_id[assignment_id]
        primary = primary_by_id[assignment_id]
        result_path = ROOT / primary["result_path"]
        result_bytes = result_path.read_bytes()
        if sha(result_bytes) != primary["result_sha256"] or len(result_bytes) != primary["result_bytes"]:
            raise RuntimeError(f"result byte mismatch:{assignment_id}")
        result = json.loads(result_bytes)
        receipt_path = CATALOG_ROOT / "dispatch" / BATCH_ID / assignment_id / CATALOG_ATTEMPT / "dispatch_receipt.json"
        receipt = load_obj(receipt_path)
        native = native_by_id[assignment_id]
        if receipt.get("agent_path") != native.get("agent_path") or native.get("native_child_turn_status") != "completed":
            raise RuntimeError(f"native/receipt identity mismatch:{assignment_id}")
        feature_refs: list[str] = []
        for feature in result["features"]:
            local_ref = f"LF::{assignment_id}::{feature['feature_id']}"
            feature_refs.append(local_ref)
            local_feature_refs.append(local_ref)
            feature_ledger.append({
                "audit_id": assignment["audit_id"],
                "schema_version": "local-feature-ledger-v1",
                "local_feature_ref": local_ref,
                "assignment_id": assignment_id,
                "feature_id": feature["feature_id"],
                "owner_domain": feature["owner_domain"],
                "secondary_domains": feature["secondary_domains"],
                "title": feature["title"],
                "summary": feature["summary"],
                "feature_kind": feature["feature_kind"],
                "aliases": feature["aliases"],
                "atom_ids": feature["atom_ids"],
                "source_documents": feature["source_documents"],
                "source_unit_refs": feature["source_unit_refs"],
                "risk_level": feature["risk_level"],
                "spec_state": feature["spec_state"],
                "gap_summary": feature["gap_summary"],
                "research_questions": feature["research_questions"],
                "scenario_requirements": feature["scenario_requirements"],
                "cross_packet_terms": feature["cross_packet_terms"],
                "confidence": feature["confidence"],
                "result_ref": result_path.relative_to(ROOT).as_posix(),
                "result_sha256": sha(result_bytes),
            })
        covered_atoms.extend(assignment["atom_ids"])
        outcome = {
            "audit_id": assignment["audit_id"],
            "schema_version": "feature-catalog-outcome-v1",
            "batch_id": BATCH_ID,
            "epoch_id": CATALOG_EPOCH,
            "assignment_id": assignment_id,
            "attempt_id": CATALOG_ATTEMPT,
            "status": "credited",
            "coverage_credit_atoms": assignment["atom_count"],
            "credited_atom_ids": assignment["atom_ids"],
            "local_feature_count": len(feature_refs),
            "local_feature_refs": feature_refs,
            "result_ref": result_path.relative_to(ROOT).as_posix(),
            "result_sha256": sha(result_bytes),
            "result_bytes": len(result_bytes),
            "receipt_ref": receipt_path.relative_to(ROOT).as_posix(),
            "receipt_sha256": sha(receipt_path.read_bytes()),
            "packet_ref": f"master/feature_catalog/frozen/{CATALOG_EPOCH}/{assignment['packet_ref']}",
            "packet_sha256": assignment["packet_sha256"],
            "agent_path": receipt["agent_path"],
            "native_child_thread_id": native["native_child_thread_id"],
            "native_child_turn_id": native["native_child_turn_id"],
            "validator_v2_sha256": authority["validator_v2_sha256"],
            "luna_postrun_sha256": authority["luna_postrun_sha256"],
        }
        outcomes.append(outcome)
        write_obj(staging / "outcomes" / f"{assignment_id}.json", outcome)

    if len(covered_atoms) != len(set(covered_atoms)) or set(covered_atoms) != atom_ids_expected:
        raise RuntimeError("credited atom set does not close atom ledger")
    if len(local_feature_refs) != len(set(local_feature_refs)) or len(local_feature_refs) != authority["credit_policy"]["expected_feature_count"]:
        raise RuntimeError("local feature identity/cardinality mismatch")
    feature_ledger.sort(key=lambda row: row["local_feature_ref"])
    write_jsonl(staging / "local_feature_ledger.jsonl", feature_ledger)
    coverage = {
        "audit_id": assignments[0]["audit_id"],
        "schema_version": "feature-catalog-coverage-v1",
        "epoch_id": CATALOG_EPOCH,
        "snapshot_serial": "0001",
        "transaction_batch_id": BATCH_ID,
        "atom_total": len(atom_ids_expected),
        "covered_atoms": len(covered_atoms),
        "pending_atoms": 0,
        "covered_atom_ids": sorted(covered_atoms),
        "covered_atom_ids_digest": digest_strings(covered_atoms),
        "credited_assignments": len(credited_ids),
        "credited_assignment_ids": credited_ids,
        "credited_assignment_ids_digest": digest_strings(credited_ids),
        "local_feature_count": len(local_feature_refs),
        "local_feature_refs_digest": digest_strings(local_feature_refs),
        "raw_family_key_count": 1625,
        "complete": True,
        "current_phase": "owner_domain_merge_ready",
    }
    write_obj(staging / "coverage.snapshot-0001.json", coverage)
    outcome_files = sorted((staging / "outcomes").glob("*.json"))
    commit = {
        "audit_id": assignments[0]["audit_id"],
        "schema_version": "feature-catalog-transaction-v1",
        "batch_id": BATCH_ID,
        "status": "pass",
        "validator_authority_ref": AUTHORITY_REF,
        "validator_authority_sha256": sha(authority_path.read_bytes()),
        "primary_report_v2_ref": authority["primary_report_v2_ref"],
        "primary_report_v2_sha256": authority["primary_report_v2_sha256"],
        "luna_postrun_ref": authority["luna_postrun_ref"],
        "luna_postrun_sha256": authority["luna_postrun_sha256"],
        "native_capture_ref": authority["native_capture_ref"],
        "native_capture_sha256": authority["native_capture_sha256"],
        "credited_assignment_ids": credited_ids,
        "credited_atom_ids_digest": coverage["covered_atom_ids_digest"],
        "local_feature_ledger_ref": f"master/feature_catalog/transactions/{BATCH_ID}/local_feature_ledger.jsonl",
        "local_feature_ledger_sha256": sha((staging / "local_feature_ledger.jsonl").read_bytes()),
        "outcome_root_sha256": sha(b"".join(path.read_bytes() for path in outcome_files)),
        "coverage_ref": f"master/feature_catalog/transactions/{BATCH_ID}/coverage.snapshot-0001.json",
        "coverage_sha256": sha((staging / "coverage.snapshot-0001.json").read_bytes()),
        "canonical_plan_writes_authorized": False,
    }
    write_obj(staging / "commit.json", commit)
    transaction.parent.mkdir(parents=True, exist_ok=True)
    os.replace(staging, transaction)
    pointer = {
        "audit_id": assignments[0]["audit_id"],
        "schema_version": "feature-catalog-active-pointer-v1",
        "status": "ACTIVE_COMPLETE",
        "coverage_ref": commit["coverage_ref"],
        "coverage_sha256": commit["coverage_sha256"],
        "commit_ref": f"master/feature_catalog/transactions/{BATCH_ID}/commit.json",
        "commit_sha256": sha((transaction / "commit.json").read_bytes()),
        "local_feature_ledger_ref": commit["local_feature_ledger_ref"],
        "local_feature_ledger_sha256": commit["local_feature_ledger_sha256"],
    }
    write_obj(active_path, pointer)
    for assignment_id in credited_ids:
        output_dir = ROOT / assignment_by_id[assignment_id]["output_directory"]
        for path in output_dir.iterdir():
            if path.is_file():
                path.chmod(0o444)
        output_dir.chmod(0o555)
    (ROOT / authority["validator_v2_ref"]).chmod(0o444)
    authority_path.chmod(0o444)
    print(json.dumps({
        "status": "pass",
        "credited_assignments": len(credited_ids),
        "covered_atoms": len(covered_atoms),
        "local_features": len(local_feature_refs),
        "coverage_sha256": commit["coverage_sha256"],
        "commit_sha256": pointer["commit_sha256"],
        "active_pointer_sha256": sha(active_path.read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
