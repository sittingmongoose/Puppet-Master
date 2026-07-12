#!/usr/bin/env python3
"""Fail-closed attempt-0004 activation generator; never run during preparation."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import common


def fixed_snapshot_errors() -> list[str]:
    errors: list[str] = []
    template_path = common.NAMESPACE / "activation.template.json"
    if not template_path.is_file(): return ["template:missing"]
    try: template = common.load_obj(template_path)
    except Exception as exc: return [f"template:parse:{type(exc).__name__}"]
    fixed = template.get("fixed_hashes", {})
    if not isinstance(fixed, dict) or not fixed: errors.append("template:fixed_hashes")
    for ref, expected in fixed.items():
        path = common.ROOT / ref
        if not path.is_file(): errors.append(f"fixed:missing:{ref}")
        elif common.sha(path) != expected: errors.append(f"fixed:hash:{ref}")
    primary = common.ROOT / common.PRIMARY_POSTRUN_REF
    policy = common.ROOT / common.V6_REF
    prior_policy = common.ROOT / common.V5_REF
    if not primary.is_file() or common.sha(primary) != common.PRIMARY_POSTRUN_SHA256: errors.append("primary_postrun:hash")
    if not policy.is_file() or common.sha(policy) != common.V6_SHA256: errors.append("concurrency_policy_v6:hash")
    if not prior_policy.is_file() or common.sha(prior_policy) != common.V5_SHA256: errors.append("concurrency_policy_v5_lineage:hash")
    return sorted(set(errors))


def zero_state_snapshot_errors() -> list[str]:
    output_files: dict[str, list[str]] = {}
    receipt_ids: list[str] = []
    result_ids: list[str] = []
    for aid in common.RECOVERY_IDS:
        output = common.output_dir(aid)
        if not output.is_dir():
            output_files[aid] = ["<missing-directory>"]
        else:
            output_files[aid] = sorted(path.name for path in output.iterdir() if path.is_file())
        if (common.intent_path(aid).with_name("dispatch_receipt.json")).exists(): receipt_ids.append(aid)
        if (output / "result.json").exists(): result_ids.append(aid)
    capture = common.NAMESPACE / "runtime/native_capture.json"
    capture_rows = 0
    if capture.exists():
        try: capture_rows = len(common.load_obj(capture).get("leaves", [])) or 1
        except Exception: capture_rows = 1
    return common.zero_inventory_errors(
        output_files, receipt_ids, result_ids, capture_rows, (common.NAMESPACE / "activation.json").exists()
    )


def control_state_errors() -> list[str]:
    errors: list[str] = []
    for name in ("authority.json", "launch_seal.json"):
        path = common.NAMESPACE / name
        if not path.is_file(): errors.append(f"{name}:missing"); continue
        obj = common.load_obj(path)
        if obj.get("status") != common.BLOCKED_STATUS or obj.get("activation_granted") is not False:
            errors.append(f"{name}:state")
    local = common.NAMESPACE / "validation/local-prelaunch-candidate.json"
    if not local.is_file(): errors.append("local_report:missing")
    else:
        report = common.load_obj(local)
        if report.get("status") != common.BLOCKED_STATUS or report.get("activation_granted") is not False:
            errors.append("local_report:state")
    manifest_path = common.NAMESPACE / "manifest.json"
    if not manifest_path.is_file(): return errors + ["manifest:missing"]
    manifest = common.load_obj(manifest_path)
    if manifest.get("assignment_ids") != common.RECOVERY_IDS or manifest.get("assignment_count") != 2:
        errors.append("manifest:assignment_set")
    if manifest.get("model") != common.MODEL or manifest.get("reasoning_effort") != common.REASONING_EFFORT:
        errors.append("manifest:model_effort")
    if manifest.get("concurrency_policy_v6_sha256") != common.V6_SHA256 or manifest.get("prior_concurrency_policy_v5_sha256") != common.V5_SHA256:
        errors.append("manifest:pacing_policy")
    assignments = manifest.get("assignments", [])
    for index, aid in enumerate(common.RECOVERY_IDS):
        if index >= len(assignments): errors.append(f"{aid}:manifest_missing"); continue
        row = assignments[index]
        if row.get("assignment_id") != aid or row.get("canonical_agent_path") != common.expected_agent_path(aid):
            errors.append(f"{aid}:identity")
        packet = common.packet_path(aid); intent = common.intent_path(aid)
        if not packet.is_file() or row.get("packet_sha256") != common.sha(packet): errors.append(f"{aid}:packet")
        if not intent.is_file() or row.get("dispatch_intent_sha256") != common.sha(intent): errors.append(f"{aid}:intent")
    return sorted(set(errors))


def build_activation(
    luna_report: dict[str, Any], luna_report_path: Path, supplied_sha256: str, actual_sha256: str,
    snapshot_errors: list[str] | None = None,
) -> tuple[dict[str, Any], list[str]]:
    errors = list(snapshot_errors or [])
    if supplied_sha256 != actual_sha256: errors.append("luna:sha256")
    errors.extend(common.luna_report_errors(luna_report))
    activation = {
        "audit_id": common.AUDIT_ID,
        "schema_version": "external-research-recovery-activation-v4",
        "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE,
        "attempt_id": common.ATTEMPT_ID,
        "status": "ACTIVE_FOR_EXACTLY_2_FRESH_LUNA_MAX_LEAVES",
        "activation_granted": True,
        "assignment_count": 2,
        "assignment_ids": common.RECOVERY_IDS,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS,
        "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT,
        "fork_turns": "none",
        "fresh_direct_leaves": 2,
        "descendants_forbidden": True,
        "followups_forbidden": True,
        "retries_forbidden": True,
        "agent_paths": [common.expected_agent_path(aid) for aid in common.RECOVERY_IDS],
        "concurrency_policy_v6_sha256": common.V6_SHA256,
        "prior_concurrency_policy_v5_sha256": common.V5_SHA256,
        "active_semantic_cap": 2,
        "primary_attempt_0003_postrun_sha256": common.PRIMARY_POSTRUN_SHA256,
        "luna_attempt_0003_postrun_path": str(luna_report_path.resolve()),
        "luna_attempt_0003_postrun_sha256": supplied_sha256,
        "luna_rejected_assignment_ids": common.RECOVERY_IDS,
        "cumulative_research_credit_before_attempt_0004_postrun": 0,
        "coverage_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
    }
    errors.extend(activation_errors(activation))
    return activation, sorted(set(errors))


def activation_errors(activation: dict[str, Any]) -> list[str]:
    expected = {
        "audit_id": common.AUDIT_ID, "sprint_id": common.SPRINT_ID, "retry_namespace": common.RETRY_NAMESPACE,
        "attempt_id": common.ATTEMPT_ID, "status": "ACTIVE_FOR_EXACTLY_2_FRESH_LUNA_MAX_LEAVES",
        "activation_granted": True, "assignment_count": 2, "assignment_ids": common.RECOVERY_IDS,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS, "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "controller_thread_id": common.CONTROLLER_THREAD_ID, "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT, "fork_turns": "none", "fresh_direct_leaves": 2,
        "descendants_forbidden": True, "followups_forbidden": True, "retries_forbidden": True,
        "agent_paths": [common.expected_agent_path(aid) for aid in common.RECOVERY_IDS],
        "concurrency_policy_v6_sha256": common.V6_SHA256, "prior_concurrency_policy_v5_sha256": common.V5_SHA256,
        "active_semantic_cap": 2,
        "primary_attempt_0003_postrun_sha256": common.PRIMARY_POSTRUN_SHA256,
        "luna_rejected_assignment_ids": common.RECOVERY_IDS,
        "cumulative_research_credit_before_attempt_0004_postrun": 0,
        "coverage_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }
    return [f"activation:{key}" for key, value in expected.items() if activation.get(key) != value]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--luna-postrun", required=True, type=Path)
    parser.add_argument("--luna-postrun-sha", required=True)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    allowed_output = common.NAMESPACE / "activation.json"
    if args.output.resolve() != allowed_output.resolve(): raise SystemExit("output must be exact attempt-0004 activation.json")
    if args.output.exists(): raise SystemExit("refusing to overwrite activation.json")
    try: args.luna_postrun.resolve().relative_to(common.ROOT.resolve())
    except ValueError: raise SystemExit("Luna report must be under the Audit 005 root")
    if not args.luna_postrun.is_file(): raise SystemExit("Luna report is missing")
    actual_sha = common.sha(args.luna_postrun)
    report = common.load_obj(args.luna_postrun)
    snapshot = fixed_snapshot_errors() + control_state_errors() + zero_state_snapshot_errors()
    activation, errors = build_activation(report, args.luna_postrun, args.luna_postrun_sha, actual_sha, snapshot)
    if errors:
        print(json.dumps({"status": "fail", "errors": errors}, indent=2, sort_keys=True)); raise SystemExit(1)
    args.output.write_bytes(common.canonical(activation))
    print(json.dumps({"status": "activated", "activation_path": str(args.output),
                      "activation_sha256": common.sha(args.output)}, indent=2, sort_keys=True))


if __name__ == "__main__": main()
