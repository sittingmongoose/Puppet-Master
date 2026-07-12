#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

import common


NS = common.NAMESPACE
VALIDATION = NS / "validation"
TERMINAL = VALIDATION / "terminal-sol-preparation-report.json"


def jbytes(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False, allow_nan=False) + "\n").encode()


def write_new(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = jbytes(value)
    if path.exists():
        if path.read_bytes() != data:
            raise SystemExit("terminalization drift:" + str(path))
    else:
        path.write_bytes(data)


def run(path: Path) -> dict[str, Any]:
    env = {"PYTHONNOUSERSITE": "1", "PYTHONDONTWRITEBYTECODE": "1"}
    proc = subprocess.run([sys.executable, "-S", "-B", str(path)], text=True, capture_output=True, env=env)
    if proc.returncode:
        raise SystemExit(proc.stdout + proc.stderr)
    return json.loads(proc.stdout)


def inventory(excluded: set[Path]) -> list[dict[str, Any]]:
    rows = []
    for path in sorted(NS.rglob("*")):
        if path.is_file() and path not in excluded:
            rows.append({"relative_path": path.relative_to(NS).as_posix(), "byte_count": path.stat().st_size, "sha256": common.sha(path)})
    return rows


def main() -> None:
    if TERMINAL.exists():
        raise SystemExit("terminal report already exists; candidate is sealed")
    verify = run(NS / "tools/verify_prelaunch.py")
    tests = run(NS / "tools/test_attempt_0007.py")
    if verify.get("status") != "pass_structural_blocked" or verify.get("errors") != []:
        raise SystemExit("prelaunch verifier not clean")
    if tests.get("status") != "pass" or tests.get("counts", {}).get("failed") != 0 or tests.get("counts", {}).get("total", 0) < 600:
        raise SystemExit("strict tests not clean")

    validator_authority = {
        "schema_version": "external-research-validator-authority-v7",
        "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH_V7",
        "audit_id": common.AUDIT_ID, "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE, "attempt_id": common.ATTEMPT_ID,
        "assignment_ids": common.RECOVERY_IDS, "assignment_count": 2,
        "model": common.MODEL, "reasoning_effort": common.REASONING_EFFORT,
        "concurrency_policy_v10_lineage_sha256": common.V10_SHA256,
        "active_prospective_concurrency_policy_v11_sha256": common.V11_SHA256,
        "model_lane_routing_policy_v2_sha256": common.ROUTING_V2_SHA256,
        "attempt_0006_native_capture_sha256": common.ATTEMPT6_CAPTURE_SHA256,
        "attempt_0006_primary_cumulative_report_sha256": common.ATTEMPT6_PRIMARY_SHA256,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS,
        "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
        "canonicalizer_sha256": common.sha(NS / "tools/canonical_json.py"),
        "independent_canonical_oracle_sha256": common.sha(NS / "tools/canonical_oracle.py"),
        "prelaunch_verifier_sha256": common.sha(NS / "tools/verify_prelaunch.py"),
        "postrun_validator_sha256": common.sha(NS / "tools/validate_postrun.py"),
        "test_harness_sha256": common.sha(NS / "tools/test_attempt_0007.py"),
        "sealed_receipt_writer_sha256": common.sha(NS / "tools/write_positive_receipt.py"),
        "sealed_capture_writer_sha256": common.sha(NS / "tools/write_native_capture.py"),
        "activation_generator_sha256": common.sha(NS / "tools/generate_activation_transaction.py"),
        "result_schema_sha256": common.sha(NS / "schema/external_research_result_v7.schema.json"),
        "receipt_schema_sha256": common.sha(NS / "schema/external_research_dispatch_receipt_v7.schema.json"),
        "capture_schema_sha256": common.sha(NS / "schema/external_research_native_capture_v7.schema.json"),
        "receipt_contract_sha256": common.sha(NS / "receipt_contract_v7.json"),
        "capture_contract_sha256": common.sha(NS / "native_capture_contract_v7.json"),
        "draft202012_engine": verify["schema_engine"],
        "strict_tests": {"status": tests["status"], "total": tests["counts"]["total"], "passed": tests["counts"]["passed"], "failed": tests["counts"]["failed"], "digest": tests["test_digest"]},
        "required_checks": [
            "raw result file digest distinct from canonical result object digest",
            "deterministic output tree digest",
            "raw and canonical receipt digests distinct in native capture",
            "sealed exclusive receipt and capture writers",
            "single immutable result buffer and TOCTOU closure",
            "complete Draft202012 result receipt and capture schema validation",
            "no_evidence source and claim closure",
            "fresh parent Luna/max spawn capture",
            "attempt-level veto and cumulative six-floor preservation",
        ],
        "launch_authorized": False,
        "coverage_credit": 0, "research_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }
    write_new(VALIDATION / "VALIDATOR_AUTHORITY_V7.json", validator_authority)

    local = dict(verify)
    local.update({
        "schema_version": "external-research-recovery-local-prelaunch-v7",
        "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH_V7",
        "validator_authority_path": str(VALIDATION / "VALIDATOR_AUTHORITY_V7.json"),
        "validator_authority_sha256": common.sha(VALIDATION / "VALIDATOR_AUTHORITY_V7.json"),
        "strict_tests": validator_authority["strict_tests"],
        "v10_is_lineage_only": True, "v11_is_active_prospective_scheduling_policy": True,
        "active_semantic_transaction_cap": 2,
    })
    write_new(VALIDATION / "local-prelaunch-candidate.json", local)

    excluded = {TERMINAL}
    rows = inventory(excluded)
    inventory_root = common.canonical_sha(rows)
    terminal = {
        "schema_version": "external-research-recovery-terminal-sol-preparation-report-v7",
        "status": "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH_V7",
        "handoff_status": "READY_FOR_FRESH_INDEPENDENT_LUNA_PRELAUNCH_V7",
        "audit_id": common.AUDIT_ID, "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE, "attempt_id": common.ATTEMPT_ID,
        "assignment_ids": common.RECOVERY_IDS, "assignment_count": 2,
        "path_mapping": {aid: common.expected_agent_path(aid) for aid in common.RECOVERY_IDS},
        "authority_path": str(NS / "authority.json"), "authority_sha256": common.sha(NS / "authority.json"),
        "manifest_path": str(NS / "manifest.json"), "manifest_sha256": common.sha(NS / "manifest.json"),
        "launch_seal_path": str(NS / "launch_seal.json"), "launch_seal_sha256": common.sha(NS / "launch_seal.json"),
        "validator_authority_path": str(VALIDATION / "VALIDATOR_AUTHORITY_V7.json"),
        "validator_authority_sha256": common.sha(VALIDATION / "VALIDATOR_AUTHORITY_V7.json"),
        "local_prelaunch_path": str(VALIDATION / "local-prelaunch-candidate.json"),
        "local_prelaunch_sha256": common.sha(VALIDATION / "local-prelaunch-candidate.json"),
        "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
        "canonicalizer_sha256": validator_authority["canonicalizer_sha256"],
        "independent_canonical_oracle_sha256": validator_authority["independent_canonical_oracle_sha256"],
        "result_schema_sha256": validator_authority["result_schema_sha256"],
        "receipt_schema_sha256": validator_authority["receipt_schema_sha256"],
        "capture_schema_sha256": validator_authority["capture_schema_sha256"],
        "receipt_contract_sha256": validator_authority["receipt_contract_sha256"],
        "capture_contract_sha256": validator_authority["capture_contract_sha256"],
        "activation_generator_sha256": validator_authority["activation_generator_sha256"],
        "sealed_receipt_writer_sha256": validator_authority["sealed_receipt_writer_sha256"],
        "sealed_capture_writer_sha256": validator_authority["sealed_capture_writer_sha256"],
        "prelaunch_verifier_sha256": validator_authority["prelaunch_verifier_sha256"],
        "postrun_validator_sha256": validator_authority["postrun_validator_sha256"],
        "test_harness_sha256": validator_authority["test_harness_sha256"],
        "strict_tests": validator_authority["strict_tests"],
        "draft202012_engine": validator_authority["draft202012_engine"],
        "attempt_0006_native_capture_sha256": common.ATTEMPT6_CAPTURE_SHA256,
        "attempt_0006_primary_cumulative_report_sha256": common.ATTEMPT6_PRIMARY_SHA256,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS,
        "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "concurrency_policy_v10_lineage_sha256": common.V10_SHA256,
        "active_prospective_concurrency_policy_v11_sha256": common.V11_SHA256,
        "model_lane_routing_policy_v2_sha256": common.ROUTING_V2_SHA256,
        "preseal_inventory_file_count": len(rows),
        "preseal_inventory_root_sha256": inventory_root,
        "counts": {"assignments": 2, "packets": 2, "intents": 2, "empty_outputs": 2, "activation_transaction_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0},
        "activation_granted": False, "launch_authorized": False,
        "coverage_credit": 0, "research_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
        "sole_next_gate": "fresh independent Luna/max prelaunch report matching exact v7 hashes, scope, zero state, routing policy V2, V10 lineage and active V11",
    }
    write_new(TERMINAL, terminal)

    # Re-run after emission. Validators ignore validation reports and must remain clean.
    verify_after = run(NS / "tools/verify_prelaunch.py")
    tests_after = run(NS / "tools/test_attempt_0007.py")
    if verify_after != verify or tests_after.get("test_digest") != tests.get("test_digest") or tests_after.get("status") != "pass":
        raise SystemExit("post-emission verification drift")
    print(json.dumps({
        "status": terminal["status"], "handoff_status": terminal["handoff_status"],
        "terminal_report_sha256": common.sha(TERMINAL),
        "validator_authority_sha256": common.sha(VALIDATION / "VALIDATOR_AUTHORITY_V7.json"),
        "local_prelaunch_sha256": common.sha(VALIDATION / "local-prelaunch-candidate.json"),
        "strict_tests": terminal["strict_tests"], "counts": terminal["counts"],
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
