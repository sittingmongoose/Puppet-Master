#!/usr/bin/env python3
"""Fail-closed pre-dispatch verification for one Audit 005 wave packet."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
AUDIT_ID = ROOT.name
SOL_LANE_THREAD_ID = "019f4d26-0708-7c12-aa17-a4b124fab923"
MASTER_THREAD_ID = "019f4956-c3a3-7403-b51f-9881e12d1753"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path}: object required")
    return value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epoch", required=True)
    parser.add_argument("--wave-id", required=True)
    args = parser.parse_args()

    errors: list[str] = []

    def check(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    epoch = ROOT / "master" / "frozen" / args.epoch
    wave = ROOT / "master" / "waves" / args.wave_id
    epoch_number = int(args.epoch.rsplit('-', 1)[1])
    attempt = f"attempt-{epoch_number:04d}"
    global_concurrency = 48 if epoch_number >= 13 else (24 if epoch_number >= 9 else 8)
    cohort_count = 6 if epoch_number >= 13 else (3 if epoch_number >= 9 else 1)

    try:
        plan = obj(wave / "wave_plan.json")
        authority_path = wave / "wave_authority.json"
        authority = obj(authority_path)
        manifest_path = wave / "wave_assignment_manifest.jsonl"
        raw_rows = [raw for raw in manifest_path.read_bytes().splitlines() if raw.strip()]
        rows = [json.loads(raw) for raw in raw_rows]
        seal_path = epoch / "launch_seal.json"
        seal = obj(seal_path)
        architecture = obj(epoch / "architecture.json")
        wave_policy = obj(epoch / "protocols" / "wave_policy.json")
    except Exception as exc:
        report = {
            "audit_id": AUDIT_ID,
            "checker": "wave_packet_pre_dispatch_v1",
            "wave_id": args.wave_id,
            "epoch_id": args.epoch,
            "status": "fail",
            "error_count": 1,
            "errors": [f"load failure: {type(exc).__name__}: {exc}"],
        }
        print(json.dumps(report, indent=2, sort_keys=True))
        raise SystemExit(1)

    check(plan.get("audit_id") == AUDIT_ID, "plan audit_id mismatch")
    check(plan.get("wave_id") == args.wave_id, "plan wave_id mismatch")
    check(plan.get("epoch_id") == args.epoch, "plan epoch mismatch")
    check(plan.get("controller_lane_thread_id") == SOL_LANE_THREAD_ID, "plan lane mismatch")
    check(plan.get("state") == "authorized_for_sol_lane", "plan state is not authorized")
    check(plan.get("planned_assignment_count") == len(rows), "plan assignment count mismatch")
    check(plan.get("assignment_ids") == [row.get("assignment_id") for row in rows], "plan assignment order mismatch")

    check(authority.get("audit_id") == AUDIT_ID, "authority audit_id mismatch")
    check(authority.get("wave_id") == args.wave_id, "authority wave_id mismatch")
    check(authority.get("epoch_id") == args.epoch, "authority epoch mismatch")
    check(authority.get("attempt_id") == attempt, "authority attempt mismatch")
    check(authority.get("status") == "DISPATCH_AUTHORIZED_FOR_THIS_WAVE_ONLY", "authority status mismatch")
    check(authority.get("master_thread_id") == MASTER_THREAD_ID, "authority master mismatch")
    check(authority.get("controller_lane_thread_id") == SOL_LANE_THREAD_ID, "authority lane mismatch")
    check(authority.get("assignment_count") == len(rows), "authority assignment count mismatch")
    check(authority.get("global_semantic_concurrency_max") == global_concurrency, "authority concurrency mismatch")
    check(len(rows) == wave_policy.get("normal_wave_max") == 8, "wave exceeds cohort wave-size maximum")
    check(authority.get("coverage_credit_before_validation") == 0, "authority grants prevalidation credit")
    check(authority.get("canonical_plan_writes_authorized") is False, "authority permits canonical writes")
    check(authority.get("prior_attempts_immutable") is True, "authority does not preserve attempts")

    bound_files = (
        ("launch_seal_ref", "launch_seal_sha256"),
        ("primary_prelaunch_ref", "primary_prelaunch_sha256"),
        ("independent_prelaunch_ref", "independent_prelaunch_sha256"),
        ("wave_assignment_manifest_ref", "wave_assignment_manifest_sha256"),
    )
    for ref_key, hash_key in bound_files:
        ref = authority.get(ref_key)
        path = ROOT / ref if isinstance(ref, str) else ROOT / "__invalid__"
        check(path.is_file(), f"authority missing bound file: {ref_key}")
        if path.is_file():
            check(sha(path.read_bytes()) == authority.get(hash_key), f"authority hash mismatch: {hash_key}")

    check(sha(seal_path.read_bytes()) == authority.get("launch_seal_sha256"), "launch seal hash mismatch")
    check(seal.get("status") == "PRELAUNCH_FROZEN_NO_COVERAGE", "launch seal status mismatch")
    check(seal.get("substantive_coverage_credit") == 0, "launch seal has coverage credit")
    check(seal.get("reviewer_dispatch_authorized") is False, "launch seal unexpectedly grants global dispatch")
    check(architecture.get("status") == "PRELAUNCH_FROZEN_NO_COVERAGE", "architecture status mismatch")
    check(architecture.get("global_semantic_concurrency_max") == global_concurrency, "architecture concurrency mismatch")
    check(wave_policy.get("global_semantic_concurrency_max") == global_concurrency, "wave policy concurrency mismatch")
    if epoch_number >= 9:
        check(architecture.get("concurrent_wave_cohort_max") == cohort_count, "architecture cohort cap mismatch")
        check(wave_policy.get("concurrent_wave_cohort_max") == cohort_count, "wave policy cohort cap mismatch")
        check(wave_policy.get("cohort_wave_size") == 8, "wave policy cohort size mismatch")
    check(wave_policy.get("retry_attempt_cap") == 8, "retry cap mismatch")

    snapshots = sorted((ROOT / "master" / "live").glob("coverage_state.snapshot-*.json"))
    check(bool(snapshots), "missing live coverage snapshot")
    if snapshots:
        coverage = obj(snapshots[-1])
        credit_snapshots = sorted((ROOT / "master" / "live").glob("credited_assignments.snapshot-*.json"))
        registry = obj(credit_snapshots[-1]) if credit_snapshots else coverage
        credited_ids = sorted(registry.get("credited_assignment_ids", []))
        credited_set = set(credited_ids)
        digest = sha(json.dumps(credited_ids, separators=(",", ":")).encode())
        authority_floor = authority.get("coverage_floor")
        authority_digest = authority.get("credited_assignment_ids_digest")
        check(
            isinstance(authority_floor, int)
            and coverage.get("substantive_coverage_credit", -1) >= authority_floor,
            "coverage regressed below authority floor",
        )
        check(registry.get("credited_assignment_count", len(credited_ids)) == len(credited_ids), "credited registry count mismatch")
        check(registry.get("credited_assignment_ids_digest", digest) == digest, "credited registry self-digest mismatch")
        check(coverage.get("substantive_coverage_credit") == len(credited_ids), "coverage and credited registry disagree")
        baseline = None
        for candidate_path in credit_snapshots:
            candidate = obj(candidate_path)
            if (
                candidate.get("credited_assignment_count") == authority_floor
                and candidate.get("credited_assignment_ids_digest") == authority_digest
            ):
                baseline = candidate
                break
        check(baseline is not None, "authority baseline credited registry unavailable")
        if baseline is not None:
            check(
                set(baseline.get("credited_assignment_ids", [])).issubset(credited_set),
                "authority baseline credits are not preserved",
            )
        check(
            not credited_set.intersection(plan.get("assignment_ids", [])),
            "wave assignment became credited after authority preparation",
        )

    seen_ids: set[str] = set()
    seen_outputs: set[str] = set()
    for raw, row in zip(raw_rows, rows):
        assignment_id = row.get("assignment_id")
        prefix = str(assignment_id)
        check(isinstance(assignment_id, str) and assignment_id not in seen_ids, f"{prefix}: duplicate assignment")
        if isinstance(assignment_id, str):
            seen_ids.add(assignment_id)
        check(row.get("audit_id") == AUDIT_ID, f"{prefix}: audit_id mismatch")
        check(row.get("attempt_id") == attempt, f"{prefix}: attempt mismatch")
        check(row.get("required_model") == "gpt-5.6-sol", f"{prefix}: model mismatch")
        check(row.get("required_thinking") == "xhigh", f"{prefix}: thinking mismatch")
        check(row.get("fresh_lane_subagent_required") is True, f"{prefix}: fresh child not required")
        check(row.get("followup_reuse_forbidden") is True, f"{prefix}: follow-up reuse not forbidden")
        check(row.get("forked_context_forbidden") is True, f"{prefix}: forked context not forbidden")
        check(row.get("terminal_after_submission") is True, f"{prefix}: terminal submission not required")
        output_rel = row.get("output_directory")
        check(isinstance(output_rel, str) and output_rel not in seen_outputs, f"{prefix}: duplicate or invalid output")
        if isinstance(output_rel, str):
            seen_outputs.add(output_rel)
        capsule_rel = row.get("capsule_ref")
        capsule_path = epoch / capsule_rel if isinstance(capsule_rel, str) else epoch / "__invalid__"
        check(capsule_path.is_file(), f"{prefix}: capsule missing")
        if capsule_path.is_file():
            capsule = obj(capsule_path)
            check(sha(capsule_path.read_bytes()) == row.get("capsule_sha256"), f"{prefix}: capsule hash mismatch")
            check(capsule.get("assignment_id") == assignment_id, f"{prefix}: capsule assignment mismatch")
            check(capsule.get("attempt_id") == attempt, f"{prefix}: capsule attempt mismatch")
            check(
                capsule.get("source_excerpt_line_format")
                == "L######## followed by a tab and source text; evidence uses the canonical number and exact_quote excludes the prefix",
                f"{prefix}: numbered evidence policy mismatch",
            )
            excerpt_rel = capsule.get("source_excerpt_ref")
            excerpt_path = epoch / excerpt_rel if isinstance(excerpt_rel, str) else epoch / "__invalid__"
            check(excerpt_path.is_file(), f"{prefix}: excerpt missing")
            if excerpt_path.is_file():
                check(sha(excerpt_path.read_bytes()) == capsule.get("source_excerpt_sha256"), f"{prefix}: excerpt hash mismatch")

        intent_path = ROOT / "master" / "dispatch" / args.wave_id / prefix / attempt / "dispatch_intent.json"
        check(intent_path.is_file(), f"{prefix}: dispatch intent missing")
        if not intent_path.is_file():
            continue
        intent = obj(intent_path)
        expected = {
            "audit_id": AUDIT_ID,
            "wave_id": args.wave_id,
            "assignment_id": assignment_id,
            "attempt_id": attempt,
            "assignment_record_sha256": sha(raw),
            "capsule_ref": str(capsule_path),
            "capsule_sha256": row.get("capsule_sha256"),
            "result_schema_ref": str(epoch / "schemas" / "assignment_result.schema.json"),
            "terminal_schema_ref": str(epoch / "schemas" / "terminal_seal.schema.json"),
            "leaf_execution_policy_ref": str(epoch / "protocols" / "leaf_execution_policy.json"),
            "protocol_root_sha256": seal.get("protocol_root_sha256"),
            "wave_authority_ref": str(authority_path),
            "wave_authority_sha256": sha(authority_path.read_bytes()),
            "dispatch_receipt_ref": str(intent_path.with_name("dispatch_receipt.json")),
            "output_directory": str(ROOT / row["output_directory"]),
            "lane_thread_id": SOL_LANE_THREAD_ID,
            "required_parent_lane_model": "gpt-5.6-sol",
            "required_parent_lane_thinking": "xhigh",
            "fresh_lane_subagent_required": True,
            "state": "prepared_unbound",
            "coverage_credit": 0,
        }
        for key, value in expected.items():
            check(intent.get(key) == value, f"{prefix}: intent mismatch: {key}")
        check(set(intent) == set(expected) | {"schema_version"}, f"{prefix}: intent field set mismatch")
        check(intent.get("schema_version") == "dispatch-intent-v7", f"{prefix}: intent schema mismatch")
        check(not intent_path.with_name("dispatch_receipt.json").exists(), f"{prefix}: receipt exists before dispatch")
        output = ROOT / row["output_directory"]
        check(not output.exists() or not any(output.iterdir()), f"{prefix}: output directory is not empty")

    report = {
        "audit_id": AUDIT_ID,
        "checker": "wave_packet_pre_dispatch_v1",
        "wave_id": args.wave_id,
        "epoch_id": args.epoch,
        "status": "pass" if not errors else "fail",
        "assignment_count": len(rows),
        "error_count": len(errors),
        "errors": errors,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
