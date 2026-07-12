#!/usr/bin/env python3
"""Checkpoint the independently validated owner-domain shard merge."""

from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

from macro_v2_common import ROOT, sha
from owner_merge_common import OWNER_ATTEMPT, OWNER_EPOCH, OWNER_ROOT, digest_strings, load_jsonl, load_obj, write_jsonl, write_obj
from prepare_owner_merge_batch import BATCH_ID


AUTHORITY_REF = "master/owner_merge/authorities/VALIDATOR_AUTHORITY_V2.json"


def bound(path_ref: str, expected_sha: str) -> Path:
    path = ROOT / path_ref
    if not path.is_file() or sha(path.read_bytes()) != expected_sha:
        raise RuntimeError(f"bound artifact mismatch:{path_ref}")
    return path


def main() -> None:
    transaction = OWNER_ROOT / "transactions" / BATCH_ID
    staging = OWNER_ROOT / "staging_transactions" / BATCH_ID
    active_path = OWNER_ROOT / "live/ACTIVE.json"
    if transaction.exists() or staging.exists() or active_path.exists():
        raise RuntimeError("refusing to overwrite owner-merge transaction or active pointer")
    authority_path = ROOT / AUTHORITY_REF
    authority = load_obj(authority_path)
    if authority.get("status") != "ACTIVE_FOR_OWNER_SHARD_CREDIT":
        raise RuntimeError("owner-merge validator v2 authority is not active")
    for ref_key, sha_key in (
        ("batch_authority_ref", "batch_authority_sha256"),
        ("batch_activation_ref", "batch_activation_sha256"),
        ("primary_validator_v1_ref", "primary_validator_v1_sha256"),
        ("primary_report_v1_ref", "primary_report_v1_sha256"),
        ("validator_v2_ref", "validator_v2_sha256"),
        ("primary_report_v2_ref", "primary_report_v2_sha256"),
        ("validator_test_v2_ref", "validator_test_v2_sha256"),
        ("luna_postrun_ref", "luna_postrun_sha256"),
        ("native_capture_ref", "native_capture_sha256"),
    ):
        bound(authority[ref_key], authority[sha_key])

    v2_process = subprocess.run(
        ["python3", authority["validator_v2_ref"]], cwd=ROOT,
        capture_output=True, text=True, check=False,
    )
    if v2_process.returncode != 0 or not v2_process.stdout.strip():
        raise RuntimeError(f"validator v2 execution failed:{v2_process.stdout}:{v2_process.stderr}")
    live_v2 = json.loads(v2_process.stdout)
    frozen_v2 = load_obj(ROOT / authority["primary_report_v2_ref"])
    if live_v2 != frozen_v2 or live_v2.get("status") != "pass":
        raise RuntimeError("live/frozen owner-merge v2 result mismatch")
    test_process = subprocess.run(
        ["python3", authority["validator_test_v2_ref"]], cwd=ROOT,
        capture_output=True, text=True, check=False,
    )
    if test_process.returncode != 0 or json.loads(test_process.stdout).get("status") != "pass":
        raise RuntimeError("owner-merge validator v2 tests failed")
    luna = load_obj(ROOT / authority["luna_postrun_ref"])
    if luna.get("status") != "pass" or luna.get("errors") != [] or luna.get("unsupported_merge_findings") != []:
        raise RuntimeError("owner-merge Luna postrun failed")
    eligible_v2 = set(live_v2.get("eligible_assignment_ids", []))
    eligible_luna = set(luna.get("eligible_assignment_ids", []))
    credit_policy = authority["credit_policy"]
    if eligible_v2 != eligible_luna or len(eligible_v2) != credit_policy["expected_assignment_count"]:
        raise RuntimeError("owner-merge v2/Luna eligible-set mismatch")

    epoch = OWNER_ROOT / "frozen" / OWNER_EPOCH
    assignments = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
    assignment_by_id = {row["assignment_id"]: row for row in assignments}
    capture = load_obj(ROOT / authority["native_capture_ref"])
    native_by_id = {row["assignment_id"]: row for row in capture["leaves"]}
    primary_by_id = {row["assignment_id"]: row for row in live_v2["results"]}
    catalog_active = load_obj(ROOT / "master/feature_catalog/live/ACTIVE.json")
    local_feature_path = ROOT / catalog_active["local_feature_ledger_ref"]
    if sha(local_feature_path.read_bytes()) != catalog_active["local_feature_ledger_sha256"]:
        raise RuntimeError("feature-catalog active ledger binding mismatch")
    local_features = load_jsonl(local_feature_path)
    local_by_ref = {row["local_feature_ref"]: row for row in local_features}
    if len(local_by_ref) != credit_policy["expected_local_feature_count"]:
        raise RuntimeError("local feature ledger cardinality mismatch")

    staging.mkdir(parents=True)
    outcomes: list[dict] = []
    provisional_ledger: list[dict] = []
    membership_ledger: list[dict] = []
    relationship_ledger: list[dict] = []
    covered_local_refs: list[str] = []
    provisional_refs: list[str] = []
    multi_member_merges = 0

    for assignment_id in sorted(eligible_v2):
        assignment = assignment_by_id[assignment_id]
        primary = primary_by_id[assignment_id]
        result_path = ROOT / primary["result_path"]
        result_bytes = result_path.read_bytes()
        if sha(result_bytes) != primary["result_sha256"] or len(result_bytes) != primary["result_bytes"]:
            raise RuntimeError(f"result byte mismatch:{assignment_id}")
        result = json.loads(result_bytes)
        receipt_path = OWNER_ROOT / "dispatch" / BATCH_ID / assignment_id / OWNER_ATTEMPT / "dispatch_receipt.json"
        receipt = load_obj(receipt_path)
        native = native_by_id[assignment_id]
        if receipt.get("agent_path") != native.get("agent_path") or native.get("native_child_turn_status") != "completed" or native.get("terminal_response_prefix") != "PMR1":
            raise RuntimeError(f"native/receipt identity mismatch:{assignment_id}")
        pf_ref_by_id: dict[str, str] = {}
        assignment_pf_refs: list[str] = []
        for feature in result["provisional_features"]:
            pf_ref = f"OPF::{assignment_id}::{feature['provisional_feature_id']}"
            if pf_ref in provisional_refs:
                raise RuntimeError(f"duplicate owner provisional feature ref:{pf_ref}")
            pf_ref_by_id[feature["provisional_feature_id"]] = pf_ref
            provisional_refs.append(pf_ref)
            assignment_pf_refs.append(pf_ref)
            members = [local_by_ref[ref] for ref in feature["local_feature_refs"]]
            research_questions = sorted({question for member in members for question in member["research_questions"]})
            scenario_requirements = sorted({scenario for member in members for scenario in member["scenario_requirements"]})
            if not research_questions or not scenario_requirements:
                raise RuntimeError(f"research/scenario obligation lost:{pf_ref}")
            if len(members) > 1:
                multi_member_merges += 1
            provisional_ledger.append({
                "audit_id": assignment["audit_id"],
                "schema_version": "owner-provisional-feature-ledger-v1",
                "provisional_feature_ref": pf_ref,
                "assignment_id": assignment_id,
                "provisional_feature_id": feature["provisional_feature_id"],
                "owner_domain": feature["owner_domain"],
                "title": feature["title"],
                "summary": feature["summary"],
                "feature_kinds": feature["feature_kinds"],
                "aliases": feature["aliases"],
                "local_feature_refs": feature["local_feature_refs"],
                "source_documents": feature["source_documents"],
                "source_unit_refs": feature["source_unit_refs"],
                "risk_level": feature["risk_level"],
                "spec_state": feature["spec_state"],
                "gap_summary": feature["gap_summary"],
                "cross_domain_terms": feature["cross_domain_terms"],
                "confidence": feature["confidence"],
                "research_questions": research_questions,
                "scenario_requirements": scenario_requirements,
                "research_obligation_count": len(research_questions),
                "scenario_obligation_count": len(scenario_requirements),
                "result_ref": result_path.relative_to(ROOT).as_posix(),
                "result_sha256": sha(result_bytes),
            })
            covered_local_refs.extend(feature["local_feature_refs"])
        for membership in result["local_feature_memberships"]:
            membership_ledger.append({
                "audit_id": assignment["audit_id"],
                "schema_version": "owner-feature-membership-v1",
                "assignment_id": assignment_id,
                "local_feature_ref": membership["local_feature_ref"],
                "provisional_feature_ref": pf_ref_by_id[membership["provisional_feature_id"]],
                "merge_disposition": membership["merge_disposition"],
                "rationale": membership["rationale"],
            })
        for index, relationship in enumerate(result["relationships"], 1):
            relationship_ledger.append({
                "audit_id": assignment["audit_id"],
                "schema_version": "owner-shard-relationship-v1",
                "relationship_ref": f"OREL::{assignment_id}::{index:04d}",
                "assignment_id": assignment_id,
                "source_provisional_feature_ref": pf_ref_by_id[relationship["source_provisional_feature_id"]],
                "target_provisional_feature_ref": pf_ref_by_id[relationship["target_provisional_feature_id"]],
                "relationship_type": relationship["relationship_type"],
                "supporting_local_feature_refs": relationship["supporting_local_feature_refs"],
                "rationale": relationship["rationale"],
            })
        outcome = {
            "audit_id": assignment["audit_id"],
            "schema_version": "owner-merge-outcome-v1",
            "batch_id": BATCH_ID,
            "epoch_id": OWNER_EPOCH,
            "assignment_id": assignment_id,
            "attempt_id": OWNER_ATTEMPT,
            "status": "credited",
            "coverage_credit_local_features": assignment["local_feature_count"],
            "credited_local_feature_refs": assignment["local_feature_refs"],
            "provisional_feature_count": len(assignment_pf_refs),
            "provisional_feature_refs": assignment_pf_refs,
            "result_ref": result_path.relative_to(ROOT).as_posix(),
            "result_sha256": sha(result_bytes),
            "result_bytes": len(result_bytes),
            "receipt_ref": receipt_path.relative_to(ROOT).as_posix(),
            "receipt_sha256": sha(receipt_path.read_bytes()),
            "packet_ref": f"master/owner_merge/frozen/{OWNER_EPOCH}/{assignment['packet_ref']}",
            "packet_sha256": assignment["packet_sha256"],
            "agent_path": receipt["agent_path"],
            "native_child_thread_id": native["native_child_thread_id"],
            "native_child_turn_id": native["native_child_turn_id"],
            "validator_v2_sha256": authority["validator_v2_sha256"],
            "luna_postrun_sha256": authority["luna_postrun_sha256"],
        }
        outcomes.append(outcome)
        write_obj(staging / "outcomes" / f"{assignment_id}.json", outcome)

    local_refs_expected = set(local_by_ref)
    if len(covered_local_refs) != len(set(covered_local_refs)) or set(covered_local_refs) != local_refs_expected:
        raise RuntimeError("credited owner-merge local-feature set does not close ledger")
    if len(provisional_refs) != len(set(provisional_refs)) or len(provisional_refs) != credit_policy["expected_provisional_feature_count"]:
        raise RuntimeError("owner provisional identity/cardinality mismatch")
    if len(membership_ledger) != len(local_by_ref) or len({row["local_feature_ref"] for row in membership_ledger}) != len(local_by_ref):
        raise RuntimeError("owner membership ledger does not map each local feature once")
    if multi_member_merges != credit_policy["expected_multi_member_merge_count"]:
        raise RuntimeError("owner multi-member merge count mismatch")

    provisional_ledger.sort(key=lambda row: row["provisional_feature_ref"])
    membership_ledger.sort(key=lambda row: row["local_feature_ref"])
    relationship_ledger.sort(key=lambda row: row["relationship_ref"])
    write_jsonl(staging / "provisional_feature_ledger.jsonl", provisional_ledger)
    write_jsonl(staging / "membership_ledger.jsonl", membership_ledger)
    write_jsonl(staging / "relationship_ledger.jsonl", relationship_ledger)
    coverage = {
        "audit_id": assignments[0]["audit_id"],
        "schema_version": "owner-merge-coverage-v1",
        "epoch_id": OWNER_EPOCH,
        "snapshot_serial": "0001",
        "transaction_batch_id": BATCH_ID,
        "local_feature_total": len(local_by_ref),
        "covered_local_features": len(covered_local_refs),
        "pending_local_features": 0,
        "covered_local_feature_refs_digest": digest_strings(covered_local_refs),
        "credited_assignments": len(eligible_v2),
        "credited_assignment_ids": sorted(eligible_v2),
        "credited_assignment_ids_digest": digest_strings(list(eligible_v2)),
        "provisional_feature_count": len(provisional_refs),
        "provisional_feature_refs_digest": digest_strings(provisional_refs),
        "multi_member_merge_count": multi_member_merges,
        "relationship_count": len(relationship_ledger),
        "research_obligation_features": sum(1 for row in provisional_ledger if row["research_questions"]),
        "scenario_obligation_features": sum(1 for row in provisional_ledger if row["scenario_requirements"]),
        "complete": True,
        "current_phase": "cross_shard_same_owner_reconciliation_ready",
    }
    write_obj(staging / "coverage.snapshot-0001.json", coverage)
    outcome_files = sorted((staging / "outcomes").glob("*.json"))
    commit = {
        "audit_id": assignments[0]["audit_id"],
        "schema_version": "owner-merge-transaction-v1",
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
        "credited_assignment_ids": sorted(eligible_v2),
        "provisional_feature_ledger_ref": f"master/owner_merge/transactions/{BATCH_ID}/provisional_feature_ledger.jsonl",
        "provisional_feature_ledger_sha256": sha((staging / "provisional_feature_ledger.jsonl").read_bytes()),
        "membership_ledger_ref": f"master/owner_merge/transactions/{BATCH_ID}/membership_ledger.jsonl",
        "membership_ledger_sha256": sha((staging / "membership_ledger.jsonl").read_bytes()),
        "relationship_ledger_ref": f"master/owner_merge/transactions/{BATCH_ID}/relationship_ledger.jsonl",
        "relationship_ledger_sha256": sha((staging / "relationship_ledger.jsonl").read_bytes()),
        "outcome_root_sha256": sha(b"".join(path.read_bytes() for path in outcome_files)),
        "coverage_ref": f"master/owner_merge/transactions/{BATCH_ID}/coverage.snapshot-0001.json",
        "coverage_sha256": sha((staging / "coverage.snapshot-0001.json").read_bytes()),
        "canonical_plan_writes_authorized": False,
    }
    write_obj(staging / "commit.json", commit)
    transaction.parent.mkdir(parents=True, exist_ok=True)
    os.replace(staging, transaction)
    pointer = {
        "audit_id": assignments[0]["audit_id"],
        "schema_version": "owner-merge-active-pointer-v1",
        "status": "ACTIVE_OWNER_SHARDS_COMPLETE",
        "coverage_ref": commit["coverage_ref"],
        "coverage_sha256": commit["coverage_sha256"],
        "commit_ref": f"master/owner_merge/transactions/{BATCH_ID}/commit.json",
        "commit_sha256": sha((transaction / "commit.json").read_bytes()),
        "provisional_feature_ledger_ref": commit["provisional_feature_ledger_ref"],
        "provisional_feature_ledger_sha256": commit["provisional_feature_ledger_sha256"],
        "membership_ledger_ref": commit["membership_ledger_ref"],
        "membership_ledger_sha256": commit["membership_ledger_sha256"],
        "relationship_ledger_ref": commit["relationship_ledger_ref"],
        "relationship_ledger_sha256": commit["relationship_ledger_sha256"],
    }
    write_obj(active_path, pointer)
    for assignment_id in sorted(eligible_v2):
        output_dir = ROOT / assignment_by_id[assignment_id]["output_directory"]
        for path in output_dir.iterdir():
            if path.is_file():
                path.chmod(0o444)
        output_dir.chmod(0o555)
    for path in (
        authority_path,
        ROOT / authority["validator_v2_ref"],
        ROOT / authority["validator_test_v2_ref"],
        ROOT / authority["primary_report_v2_ref"],
        ROOT / authority["luna_postrun_ref"],
        ROOT / authority["native_capture_ref"],
    ):
        path.chmod(0o444)
    print(json.dumps({
        "status": "pass",
        "credited_assignments": len(eligible_v2),
        "covered_local_features": len(covered_local_refs),
        "provisional_features": len(provisional_refs),
        "multi_member_merges": multi_member_merges,
        "relationships": len(relationship_ledger),
        "coverage_sha256": commit["coverage_sha256"],
        "commit_sha256": pointer["commit_sha256"],
        "active_pointer_sha256": sha(active_path.read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
