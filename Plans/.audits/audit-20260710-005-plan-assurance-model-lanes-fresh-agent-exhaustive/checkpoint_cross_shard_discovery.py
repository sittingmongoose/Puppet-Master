#!/usr/bin/env python3
"""Checkpoint primary cross-shard discovery without promoting candidate merges."""

from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

from cross_shard_common import (
    CROSS_ATTEMPT,
    CROSS_BATCH,
    CROSS_EPOCH,
    CROSS_ROOT,
    digest_strings,
    load_jsonl,
    write_jsonl,
    write_obj,
)
from macro_v2_common import AUDIT_ID, ROOT, sha


PRIMARY_REF = "master/cross_shard/validation/cross-shard-batch-0001/primary-postrun.json"
PRIMARY_SHA = "e6202b24fd37377478173e5c684b4bee5929537387d969d32182c6af7aeafc88"
LUNA_REF = "master/cross_shard/validation/cross-shard-batch-0001/luna-postrun.json"
LUNA_SHA = "f7f99bc3a2cd325990d3c87ab15c281c656a580643549dcb6125e0075eec3eb7"
NATIVE_REF = "master/cross_shard/runtime/cross-shard-batch-0001/native_capture.json"
NATIVE_SHA = "75c7110c5c775902590822380b3310a240977d7f89094221cb7fba1847418f4b"
BATCH_AUTHORITY_REF = "master/cross_shard/batches/cross-shard-batch-0001/batch_authority.json"
BATCH_AUTHORITY_SHA = "35dd92ab0b6f56da2371a9393e3f47bccc37896b25d2961a1b78d261135ab6c4"
BATCH_MANIFEST_REF = "master/cross_shard/batches/cross-shard-batch-0001/batch_manifest.jsonl"
BATCH_MANIFEST_SHA = "105256f96adaf0993251b555119bc868aca99918f9c745f7e16d599dd5005fc4"
EPOCH_AUTHORITY_REF = "master/cross_shard/frozen/cross-shard-epoch-0001/authority.json"
EPOCH_AUTHORITY_SHA = "e5a8a03b652d9a17670be5becd319ee21f471f15a4e04721e1e89a1c4ca8e6a5"
EPOCH_SEAL_REF = "master/cross_shard/frozen/cross-shard-epoch-0001/launch_seal.json"
EPOCH_SEAL_SHA = "7262ddd0ccca3150f027c06f8a3f9e548cc638d90072649e4e1480cad9394523"
VALIDATOR_REF = "validate_cross_shard_batch.py"
VALIDATOR_SHA = "98f6d77010c6d64b74baed7f5a901b241ea04da0107feab5b9ca85e3a6766a45"


def load_obj(path: Path) -> dict:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError(f"expected object:{path}")
    return value


def bound(ref: str, expected_sha: str) -> Path:
    path = ROOT / ref
    if not path.is_file() or sha(path.read_bytes()) != expected_sha:
        raise RuntimeError(f"bound artifact mismatch:{ref}")
    return path


def canonical_edge(left: str, right: str) -> tuple[str, str]:
    if left == right:
        raise RuntimeError(f"self edge:{left}")
    return tuple(sorted((left, right)))


def edge_digest(edges: set[tuple[str, str]]) -> str:
    payload = "\n".join("|".join(edge) for edge in sorted(edges)) + "\n"
    return sha(payload.encode("utf-8"))


def main() -> None:
    transaction = CROSS_ROOT / "transactions" / CROSS_BATCH
    staging = CROSS_ROOT / "staging_transactions" / CROSS_BATCH
    active_path = CROSS_ROOT / "live/ACTIVE.json"
    if transaction.exists() or staging.exists() or active_path.exists():
        raise RuntimeError("refusing to overwrite cross-shard discovery checkpoint")

    primary_path = bound(PRIMARY_REF, PRIMARY_SHA)
    luna_path = bound(LUNA_REF, LUNA_SHA)
    native_path = bound(NATIVE_REF, NATIVE_SHA)
    bound(BATCH_AUTHORITY_REF, BATCH_AUTHORITY_SHA)
    bound(BATCH_MANIFEST_REF, BATCH_MANIFEST_SHA)
    bound(EPOCH_AUTHORITY_REF, EPOCH_AUTHORITY_SHA)
    bound(EPOCH_SEAL_REF, EPOCH_SEAL_SHA)
    validator_path = bound(VALIDATOR_REF, VALIDATOR_SHA)

    process = subprocess.run(
        ["python3", VALIDATOR_REF], cwd=ROOT,
        capture_output=True, text=True, check=False,
    )
    if process.returncode != 0 or not process.stdout.strip():
        raise RuntimeError(f"live cross-shard validator failed:{process.stdout}:{process.stderr}")
    live_primary = json.loads(process.stdout)
    frozen_primary = load_obj(primary_path)
    if live_primary != frozen_primary or live_primary.get("status") != "pass":
        raise RuntimeError("live/frozen primary cross-shard report mismatch")
    if live_primary.get("counts") != {"assignments": 32, "eligible": 32, "pending": 0, "rejected": 0}:
        raise RuntimeError("primary cross-shard counts are not exact")

    luna = load_obj(luna_path)
    if luna.get("status") != "fail" or luna.get("errors") != [
        "unsupported_or_uncertain_merge_edges_present",
        "fail_closed_due_to_semantic_findings",
    ]:
        raise RuntimeError("unexpected Luna semantic disposition")
    if set(luna.get("eligible_assignment_ids", [])) != set(live_primary.get("eligible_assignment_ids", [])):
        raise RuntimeError("primary/Luna eligible-set mismatch")
    luna_counts = luna.get("counts", {})
    required_luna_counts = {
        "assignments": 32,
        "eligible": 32,
        "pending": 0,
        "rejected": 0,
        "decisions": 2190,
        "pairwise_comparisons": 432546,
        "merge_candidate_edges": 217,
        "related_edges": 5323,
        "unsupported_or_uncertain_merge_findings": 5,
    }
    for key, expected in required_luna_counts.items():
        if luna_counts.get(key) != expected:
            raise RuntimeError(f"Luna count mismatch:{key}")
    if luna.get("canonical_plan_changes") != 0:
        raise RuntimeError("Luna reported canonical Plan changes")

    epoch = CROSS_ROOT / "frozen" / CROSS_EPOCH
    assignments = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
    assignment_by_id = {row["assignment_id"]: row for row in assignments}
    if len(assignment_by_id) != 32:
        raise RuntimeError("assignment manifest does not contain exact 32 unique rows")
    capture = load_obj(native_path)
    native_by_id = {row["assignment_id"]: row for row in capture["leaves"]}
    if len(native_by_id) != 32:
        raise RuntimeError("native capture does not contain exact 32 unique leaves")
    primary_by_id = {row["assignment_id"]: row for row in live_primary["results"]}

    finding_by_edge: dict[tuple[str, str], dict] = {}
    for finding in luna.get("unsupported_merge_findings", []):
        edge = canonical_edge(*finding["edge"])
        if edge in finding_by_edge:
            raise RuntimeError(f"duplicate Luna finding:{edge}")
        finding_by_edge[edge] = finding
    if len(finding_by_edge) != 5:
        raise RuntimeError("expected exactly five unique Luna findings")

    staging.mkdir(parents=True)
    outcomes: list[dict] = []
    decisions: list[dict] = []
    candidates: list[dict] = []
    related: list[dict] = []
    candidate_edges: set[tuple[str, str]] = set()
    related_edges: set[tuple[str, str]] = set()
    decision_count = 0
    comparison_count = 0

    for assignment_id in sorted(primary_by_id):
        assignment = assignment_by_id[assignment_id]
        primary = primary_by_id[assignment_id]
        result_path = ROOT / primary["result_path"]
        result_bytes = result_path.read_bytes()
        if sha(result_bytes) != primary["result_sha256"] or len(result_bytes) != primary["result_bytes"]:
            raise RuntimeError(f"result byte mismatch:{assignment_id}")
        result = json.loads(result_bytes)
        receipt_path = CROSS_ROOT / "dispatch" / CROSS_BATCH / assignment_id / CROSS_ATTEMPT / "dispatch_receipt.json"
        receipt = load_obj(receipt_path)
        native = native_by_id[assignment_id]
        if (
            receipt.get("agent_path") != native.get("agent_path")
            or native.get("native_child_turn_status") != "completed"
            or native.get("terminal_response_prefix") != "PMR1"
        ):
            raise RuntimeError(f"receipt/native identity mismatch:{assignment_id}")

        assignment_candidate_count = 0
        assignment_related_count = 0
        for local_index, decision in enumerate(result["decisions"], 1):
            decision_count += 1
            comparison_count += decision["compared_against_count"]
            decision_ref = f"CSDEC::{assignment_id}::{local_index:04d}"
            anchor = decision["anchor_provisional_feature_ref"]
            decision_row = {
                "audit_id": AUDIT_ID,
                "schema_version": "cross-shard-decision-ledger-v1",
                "decision_ref": decision_ref,
                "batch_id": CROSS_BATCH,
                "epoch_id": CROSS_EPOCH,
                "assignment_id": assignment_id,
                "attempt_id": CROSS_ATTEMPT,
                "pair_id": assignment["pair_id"],
                "owner_domain": assignment["owner_domain"],
                "anchor_provisional_feature_ref": anchor,
                "compared_against_count": decision["compared_against_count"],
                "merge_candidate_refs": decision["merge_candidate_refs"],
                "related_but_distinct_refs": decision["related_but_distinct_refs"],
                "rationale": decision["rationale"],
                "confidence": decision["confidence"],
                "result_ref": result_path.relative_to(ROOT).as_posix(),
                "result_sha256": sha(result_bytes),
            }
            decisions.append(decision_row)
            for comparator in decision["merge_candidate_refs"]:
                edge = canonical_edge(anchor, comparator)
                if edge in candidate_edges:
                    raise RuntimeError(f"duplicate candidate edge:{edge}")
                candidate_edges.add(edge)
                assignment_candidate_count += 1
                finding = finding_by_edge.get(edge)
                candidates.append({
                    "audit_id": AUDIT_ID,
                    "schema_version": "cross-shard-candidate-edge-v1",
                    "edge_ref": f"CSEDGE::{len(candidates) + 1:06d}",
                    "endpoint_refs": list(edge),
                    "assignment_id": assignment_id,
                    "pair_id": assignment["pair_id"],
                    "owner_domain": assignment["owner_domain"],
                    "source_decision_ref": decision_ref,
                    "source_anchor_ref": anchor,
                    "source_comparator_ref": comparator,
                    "source_rationale": decision["rationale"],
                    "source_confidence": decision["confidence"],
                    "luna_disposition": finding["classification"] if finding else "no_objection_recorded",
                    "luna_finding": finding["finding"] if finding else None,
                    "quarantined": finding is not None,
                    "promotion_eligible": False,
                    "promotion_blocker": "reverse_orientation_shadow_and_final_adjudication_required",
                    "result_ref": result_path.relative_to(ROOT).as_posix(),
                    "result_sha256": sha(result_bytes),
                })
            for comparator in decision["related_but_distinct_refs"]:
                edge = canonical_edge(anchor, comparator)
                if edge in related_edges:
                    raise RuntimeError(f"duplicate related edge:{edge}")
                related_edges.add(edge)
                assignment_related_count += 1
                related.append({
                    "audit_id": AUDIT_ID,
                    "schema_version": "cross-shard-related-edge-v1",
                    "edge_ref": f"CSREL::{len(related) + 1:06d}",
                    "endpoint_refs": list(edge),
                    "assignment_id": assignment_id,
                    "pair_id": assignment["pair_id"],
                    "owner_domain": assignment["owner_domain"],
                    "source_decision_ref": decision_ref,
                    "rationale": decision["rationale"],
                    "confidence": decision["confidence"],
                    "preservation_status": "pending_reverse_shadow_confirmation",
                    "result_ref": result_path.relative_to(ROOT).as_posix(),
                    "result_sha256": sha(result_bytes),
                })

        outcome = {
            "audit_id": AUDIT_ID,
            "schema_version": "cross-shard-discovery-outcome-v1",
            "batch_id": CROSS_BATCH,
            "epoch_id": CROSS_EPOCH,
            "assignment_id": assignment_id,
            "attempt_id": CROSS_ATTEMPT,
            "status": "mechanically_valid_candidate_only",
            "coverage_credit": 0,
            "anchor_decisions": len(result["decisions"]),
            "pairwise_comparisons": sum(row["compared_against_count"] for row in result["decisions"]),
            "candidate_edges": assignment_candidate_count,
            "related_edges": assignment_related_count,
            "result_ref": result_path.relative_to(ROOT).as_posix(),
            "result_sha256": sha(result_bytes),
            "result_bytes": len(result_bytes),
            "receipt_ref": receipt_path.relative_to(ROOT).as_posix(),
            "receipt_sha256": sha(receipt_path.read_bytes()),
            "agent_path": receipt["agent_path"],
            "native_child_thread_id": native["native_child_thread_id"],
            "native_child_turn_id": native["native_child_turn_id"],
            "primary_report_sha256": PRIMARY_SHA,
            "luna_postrun_sha256": LUNA_SHA,
        }
        outcomes.append(outcome)
        write_obj(staging / "outcomes" / f"{assignment_id}.json", outcome)

    if decision_count != 2190 or comparison_count != 432546:
        raise RuntimeError("decision/comparison closure mismatch")
    if len(candidate_edges) != 217 or len(related_edges) != 5323:
        raise RuntimeError("edge cardinality mismatch")
    if candidate_edges & related_edges:
        raise RuntimeError("candidate/related edge overlap")
    if edge_digest(candidate_edges) != luna["merge_candidate_edge_digest"]:
        raise RuntimeError("candidate edge digest mismatch")
    if edge_digest(related_edges) != luna["related_edge_digest"]:
        raise RuntimeError("related edge digest mismatch")
    if not set(finding_by_edge).issubset(candidate_edges):
        raise RuntimeError("Luna finding not present in candidate set")

    decisions.sort(key=lambda row: row["decision_ref"])
    candidates.sort(key=lambda row: tuple(row["endpoint_refs"]))
    related.sort(key=lambda row: tuple(row["endpoint_refs"]))
    quarantined = [row for row in candidates if row["quarantined"]]
    write_jsonl(staging / "decision_ledger.jsonl", decisions)
    write_jsonl(staging / "candidate_edge_ledger.jsonl", candidates)
    write_jsonl(staging / "related_edge_ledger.jsonl", related)
    write_jsonl(staging / "quarantined_edge_ledger.jsonl", quarantined)

    coverage = {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-discovery-coverage-v1",
        "epoch_id": CROSS_EPOCH,
        "batch_id": CROSS_BATCH,
        "snapshot_serial": "0001",
        "assignments_total": 32,
        "mechanically_valid_assignments": 32,
        "pending_assignments": 0,
        "rejected_assignments": 0,
        "decision_count": decision_count,
        "pairwise_comparison_count": comparison_count,
        "candidate_edge_count": len(candidates),
        "candidate_edge_digest": edge_digest(candidate_edges),
        "quarantined_candidate_edge_count": len(quarantined),
        "unquarantined_candidate_edge_count": len(candidates) - len(quarantined),
        "promoted_candidate_edge_count": 0,
        "related_edge_count": len(related),
        "related_edge_digest": edge_digest(related_edges),
        "raw_discovery_complete": True,
        "same_owner_merge_complete": False,
        "reverse_orientation_shadow_required": True,
        "final_adjudication_required": True,
        "current_phase": "reverse_orientation_shadow_preparation",
    }
    write_obj(staging / "coverage.snapshot-0001.json", coverage)
    authority = {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-discovery-checkpoint-authority-v1",
        "status": "ACTIVE_FOR_CANDIDATE_ONLY_CHECKPOINT",
        "mechanical_credit_assignments": 32,
        "merge_promotion_credit": 0,
        "primary_report_ref": PRIMARY_REF,
        "primary_report_sha256": PRIMARY_SHA,
        "luna_postrun_ref": LUNA_REF,
        "luna_postrun_sha256": LUNA_SHA,
        "native_capture_ref": NATIVE_REF,
        "native_capture_sha256": NATIVE_SHA,
        "policy": "preserve every mechanically valid discovery; quarantine all Luna findings; promote no merge before reverse shadow and final adjudication",
        "quarantined_candidate_edge_count": 5,
        "canonical_plan_writes_authorized": False,
    }
    write_obj(staging / "authority.json", authority)
    outcome_files = sorted((staging / "outcomes").glob("*.json"))
    commit = {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-discovery-transaction-v1",
        "batch_id": CROSS_BATCH,
        "status": "candidate_only_fail_closed",
        "authority_ref": f"master/cross_shard/transactions/{CROSS_BATCH}/authority.json",
        "authority_sha256": sha((staging / "authority.json").read_bytes()),
        "primary_report_ref": PRIMARY_REF,
        "primary_report_sha256": PRIMARY_SHA,
        "luna_postrun_ref": LUNA_REF,
        "luna_postrun_sha256": LUNA_SHA,
        "native_capture_ref": NATIVE_REF,
        "native_capture_sha256": NATIVE_SHA,
        "decision_ledger_ref": f"master/cross_shard/transactions/{CROSS_BATCH}/decision_ledger.jsonl",
        "decision_ledger_sha256": sha((staging / "decision_ledger.jsonl").read_bytes()),
        "candidate_edge_ledger_ref": f"master/cross_shard/transactions/{CROSS_BATCH}/candidate_edge_ledger.jsonl",
        "candidate_edge_ledger_sha256": sha((staging / "candidate_edge_ledger.jsonl").read_bytes()),
        "related_edge_ledger_ref": f"master/cross_shard/transactions/{CROSS_BATCH}/related_edge_ledger.jsonl",
        "related_edge_ledger_sha256": sha((staging / "related_edge_ledger.jsonl").read_bytes()),
        "quarantined_edge_ledger_ref": f"master/cross_shard/transactions/{CROSS_BATCH}/quarantined_edge_ledger.jsonl",
        "quarantined_edge_ledger_sha256": sha((staging / "quarantined_edge_ledger.jsonl").read_bytes()),
        "outcome_root_sha256": sha(b"".join(path.read_bytes() for path in outcome_files)),
        "coverage_ref": f"master/cross_shard/transactions/{CROSS_BATCH}/coverage.snapshot-0001.json",
        "coverage_sha256": sha((staging / "coverage.snapshot-0001.json").read_bytes()),
        "merge_promotion_credit": 0,
        "canonical_plan_writes_authorized": False,
    }
    write_obj(staging / "commit.json", commit)

    transaction.parent.mkdir(parents=True, exist_ok=True)
    os.replace(staging, transaction)
    pointer = {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-active-pointer-v1",
        "status": "ACTIVE_PRIMARY_DISCOVERY_CHECKPOINTED_SHADOW_REQUIRED",
        "coverage_ref": commit["coverage_ref"],
        "coverage_sha256": commit["coverage_sha256"],
        "commit_ref": f"master/cross_shard/transactions/{CROSS_BATCH}/commit.json",
        "commit_sha256": sha((transaction / "commit.json").read_bytes()),
        "candidate_edge_ledger_ref": commit["candidate_edge_ledger_ref"],
        "candidate_edge_ledger_sha256": commit["candidate_edge_ledger_sha256"],
        "related_edge_ledger_ref": commit["related_edge_ledger_ref"],
        "related_edge_ledger_sha256": commit["related_edge_ledger_sha256"],
        "quarantined_edge_ledger_ref": commit["quarantined_edge_ledger_ref"],
        "quarantined_edge_ledger_sha256": commit["quarantined_edge_ledger_sha256"],
        "merge_promotion_credit": 0,
    }
    write_obj(active_path, pointer)

    for primary in primary_by_id.values():
        result_path = ROOT / primary["result_path"]
        result_path.chmod(0o444)
        result_path.parent.chmod(0o555)
    for path in (primary_path, luna_path, native_path):
        path.chmod(0o444)

    print(json.dumps({
        "status": "candidate_only_fail_closed",
        "mechanically_valid_assignments": 32,
        "decisions": decision_count,
        "pairwise_comparisons": comparison_count,
        "candidate_edges": len(candidates),
        "quarantined_candidate_edges": len(quarantined),
        "promoted_candidate_edges": 0,
        "related_edges": len(related),
        "coverage_sha256": commit["coverage_sha256"],
        "commit_sha256": pointer["commit_sha256"],
        "active_pointer_sha256": sha(active_path.read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
