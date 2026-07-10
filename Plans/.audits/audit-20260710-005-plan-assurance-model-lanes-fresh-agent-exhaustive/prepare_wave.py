#!/usr/bin/env python3
"""Deterministically prepare one Audit 005 Sol review wave without dispatching it."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
AUDIT_ID = ROOT.name
MASTER_THREAD_ID = "019f4956-c3a3-7403-b51f-9881e12d1753"
SOL_LANE_THREAD_ID = "019f4d26-0708-7c12-aa17-a4b124fab923"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path}: object required")
    return value


def write_obj(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epoch", required=True)
    parser.add_argument("--wave-id", required=True)
    parser.add_argument("--document")
    parser.add_argument("--count", type=int, default=8)
    parser.add_argument("--assignment-id", action="append", default=[])
    parser.add_argument("--supersedes-wave")
    args = parser.parse_args()

    epoch = ROOT / "master/frozen" / args.epoch
    final_wave = ROOT / "master/waves" / args.wave_id
    final_dispatch = ROOT / "master/dispatch" / args.wave_id
    staging = ROOT / "master/wave_staging" / args.wave_id
    if not epoch.is_dir():
        raise RuntimeError(f"missing frozen epoch: {epoch}")
    for path in (final_wave, final_dispatch, staging):
        if path.exists():
            raise RuntimeError(f"refusing existing wave path: {path}")

    seal_path = epoch / "launch_seal.json"
    seal = load_obj(seal_path)
    architecture = load_obj(epoch / "architecture.json")
    wave_policy = load_obj(epoch / "protocols/wave_policy.json")
    primary_path = epoch / "validation/primary_prelaunch.json"
    cross_path = epoch / "validation/independent_prelaunch.json"
    primary = load_obj(primary_path)
    cross = load_obj(cross_path)
    if seal.get("status") != "PRELAUNCH_FROZEN_NO_COVERAGE":
        raise RuntimeError("frozen launch seal is not valid")
    if architecture.get("status") != "PRELAUNCH_FROZEN_NO_COVERAGE":
        raise RuntimeError("architecture is not frozen")
    if primary.get("status") != "pass" or cross.get("status") != "pass":
        raise RuntimeError("prelaunch validation is not passing")
    global_concurrency = wave_policy.get("global_semantic_concurrency_max")
    normal_wave_min = wave_policy.get("normal_wave_min")
    normal_wave_max = wave_policy.get("normal_wave_max")
    if global_concurrency not in {8, 24, 48}:
        raise RuntimeError("unexpected concurrency policy")
    if normal_wave_min != 8 or normal_wave_max != 8:
        raise RuntimeError("unexpected cohort wave-size policy")

    coverage_paths = sorted((ROOT / "master/live").glob("coverage_state.snapshot-*.json"))
    registry_paths = sorted((ROOT / "master/live").glob("credited_assignments.snapshot-*.json"))
    if not coverage_paths or not registry_paths:
        raise RuntimeError("live coverage or credited registry missing")
    coverage = load_obj(coverage_paths[-1])
    registry = load_obj(registry_paths[-1])
    credited_ids = sorted(registry.get("credited_assignment_ids", []))
    coverage_floor = coverage.get("substantive_coverage_credit")
    if coverage_floor != len(credited_ids) or registry.get("credited_assignment_count") != len(credited_ids):
        raise RuntimeError("live coverage and credited registry disagree")
    credited_digest = sha(json.dumps(credited_ids, separators=(",", ":")).encode())
    if registry.get("credited_assignment_ids_digest") != credited_digest:
        raise RuntimeError("credited registry digest mismatch")

    manifest_path = epoch / "manifests/assignment_manifest.jsonl"
    raw_rows = [raw for raw in manifest_path.read_bytes().splitlines() if raw.strip()]
    parsed = [(raw, json.loads(raw)) for raw in raw_rows]
    credited_set = set(credited_ids)
    if args.assignment_id:
        requested = args.assignment_id
        by_id = {row["assignment_id"]: (raw, row) for raw, row in parsed}
        missing = [assignment_id for assignment_id in requested if assignment_id not in by_id]
        if missing:
            raise RuntimeError(f"unknown assignments: {missing}")
        selected = [by_id[assignment_id] for assignment_id in requested]
    else:
        selected = [
            (raw, row)
            for raw, row in parsed
            if row["assignment_id"] not in credited_set
            and (args.document is None or row["document_path"] == args.document)
        ][: args.count]
    if len(selected) != args.count:
        raise RuntimeError(f"expected {args.count} assignments, selected {len(selected)}")
    if len(selected) != normal_wave_min or len(selected) != normal_wave_max:
        raise RuntimeError("regular waves must contain exactly eight assignments")
    if any(row["assignment_id"] in credited_set for _, row in selected):
        raise RuntimeError("selected assignment is already credited")

    attempt_id = f"attempt-{int(args.epoch.rsplit('-', 1)[1]):04d}"
    if any(row.get("attempt_id") != attempt_id for _, row in selected):
        raise RuntimeError("assignment attempt does not match epoch")
    if len({row["assignment_id"] for _, row in selected}) != len(selected):
        raise RuntimeError("duplicate selected assignment")
    if len({row["output_directory"] for _, row in selected}) != len(selected):
        raise RuntimeError("duplicate selected output directory")

    stage_wave = staging / "wave"
    stage_dispatch = staging / "dispatch"
    stage_wave.mkdir(parents=True)
    stage_dispatch.mkdir(parents=True)
    wave_manifest = stage_wave / "wave_assignment_manifest.jsonl"
    wave_manifest.write_bytes(b"\n".join(raw for raw, _ in selected) + b"\n")
    assignment_hashes = {row["assignment_id"]: sha(raw) for raw, row in selected}

    plan = {
        "audit_id": AUDIT_ID,
        "wave_id": args.wave_id,
        "epoch_id": args.epoch,
        "supersedes_wave": args.supersedes_wave,
        "assignment_ids": [row["assignment_id"] for _, row in selected],
        "planned_assignment_count": len(selected),
        "retry_wave_exception": False,
        "document_focus": args.document,
        "controller_lane_thread_id": SOL_LANE_THREAD_ID,
        "authority_ref": f"master/waves/{args.wave_id}/wave_authority.json",
        "spawn_policy": {
            "fresh_subagent": True,
            "fork_turns": "none",
            "substantive_assignments_per_subagent": 1,
            "followup_reuse": False,
        },
        "state": "authorized_for_sol_lane",
        "coverage_floor": coverage_floor,
    }
    write_obj(stage_wave / "wave_plan.json", plan)
    authority = {
        "audit_id": AUDIT_ID,
        "schema_version": "wave-authority-v1",
        "wave_id": args.wave_id,
        "epoch_id": args.epoch,
        "attempt_id": attempt_id,
        "status": "DISPATCH_AUTHORIZED_FOR_THIS_WAVE_ONLY",
        "master_thread_id": MASTER_THREAD_ID,
        "controller_lane_thread_id": SOL_LANE_THREAD_ID,
        "launch_seal_ref": f"master/frozen/{args.epoch}/launch_seal.json",
        "launch_seal_sha256": sha(seal_path.read_bytes()),
        "primary_prelaunch_ref": f"master/frozen/{args.epoch}/validation/primary_prelaunch.json",
        "primary_prelaunch_sha256": sha(primary_path.read_bytes()),
        "independent_prelaunch_ref": f"master/frozen/{args.epoch}/validation/independent_prelaunch.json",
        "independent_prelaunch_sha256": sha(cross_path.read_bytes()),
        "wave_assignment_manifest_ref": f"master/waves/{args.wave_id}/wave_assignment_manifest.jsonl",
        "wave_assignment_manifest_sha256": sha(wave_manifest.read_bytes()),
        "assignment_record_sha256s": assignment_hashes,
        "assignment_count": len(selected),
        "retry_wave_exception": False,
        "global_semantic_concurrency_max": global_concurrency,
        "coverage_floor": coverage_floor,
        "credited_assignment_ids_digest": credited_digest,
        "prior_attempts_immutable": True,
        "canonical_plan_writes_authorized": False,
        "coverage_credit_before_validation": 0,
    }
    authority_path = stage_wave / "wave_authority.json"
    write_obj(authority_path, authority)
    authority_hash = sha(authority_path.read_bytes())

    for raw, row in selected:
        assignment_id = row["assignment_id"]
        output = ROOT / row["output_directory"]
        if output.exists() and any(output.iterdir()):
            raise RuntimeError(f"nonempty output directory: {output}")
        capsule = epoch / row["capsule_ref"]
        intent_dir = stage_dispatch / assignment_id / attempt_id
        intent_path = intent_dir / "dispatch_intent.json"
        final_intent = final_dispatch / assignment_id / attempt_id / "dispatch_intent.json"
        intent = {
            "audit_id": AUDIT_ID,
            "schema_version": "dispatch-intent-v7",
            "wave_id": args.wave_id,
            "assignment_id": assignment_id,
            "attempt_id": attempt_id,
            "assignment_record_sha256": sha(raw),
            "capsule_ref": str(capsule),
            "capsule_sha256": row["capsule_sha256"],
            "result_schema_ref": str(epoch / "schemas/assignment_result.schema.json"),
            "terminal_schema_ref": str(epoch / "schemas/terminal_seal.schema.json"),
            "leaf_execution_policy_ref": str(epoch / "protocols/leaf_execution_policy.json"),
            "protocol_root_sha256": seal["protocol_root_sha256"],
            "wave_authority_ref": str(final_wave / "wave_authority.json"),
            "wave_authority_sha256": authority_hash,
            "dispatch_receipt_ref": str(final_intent.with_name("dispatch_receipt.json")),
            "output_directory": str(output),
            "lane_thread_id": SOL_LANE_THREAD_ID,
            "required_parent_lane_model": "gpt-5.6-sol",
            "required_parent_lane_thinking": "xhigh",
            "fresh_lane_subagent_required": True,
            "state": "prepared_unbound",
            "coverage_credit": 0,
        }
        write_obj(intent_path, intent)

    final_wave.parent.mkdir(parents=True, exist_ok=True)
    final_dispatch.parent.mkdir(parents=True, exist_ok=True)
    os.replace(stage_wave, final_wave)
    os.replace(stage_dispatch, final_dispatch)
    staging.rmdir()
    for _, row in selected:
        (ROOT / row["output_directory"]).mkdir(parents=True, exist_ok=True)

    report = {
        "audit_id": AUDIT_ID,
        "generator": "prepare_wave_v1",
        "status": "prepared_unbound_zero_credit",
        "wave_id": args.wave_id,
        "epoch_id": args.epoch,
        "attempt_id": attempt_id,
        "assignment_count": len(selected),
        "assignment_ids": [row["assignment_id"] for _, row in selected],
        "document_focus": args.document,
        "coverage_floor": coverage_floor,
        "wave_manifest_sha256": authority["wave_assignment_manifest_sha256"],
        "wave_authority_sha256": authority_hash,
    }
    print(json.dumps(report, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
