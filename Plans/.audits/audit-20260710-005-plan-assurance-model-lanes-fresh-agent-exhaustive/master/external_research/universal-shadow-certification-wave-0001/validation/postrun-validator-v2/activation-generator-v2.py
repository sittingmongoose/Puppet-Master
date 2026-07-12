#!/usr/bin/env python3
"""Future-only fail-closed v2 activation generator.

The generator never reads or mutates v1 activation state.  It can write only
distinct v2-named transaction files after a fresh independent v2 prelaunch.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
from typing import Any

import validate_universal_shadow_certification_postrun_v2 as validator_v2

HERE = Path(__file__).resolve().parent
WAVE_ROOT = HERE.parents[1]
AUDIT_ROOT = HERE.parents[4]
AUTHORITY_PATH = HERE / "VALIDATOR_AUTHORITY_V2.json"
CONTRACT_PATH = HERE / "activation-contract-supersession-v2.json"
LOCAL_REPORT_PATH = HERE / "local-v2-candidate-report.json"
FINAL_ACTIVATION_PATH = WAVE_ROOT / "activation-v2.json"
CORE_PATH = WAVE_ROOT / "activation-core-v2.json"
AUTHORIZATION_ROOT = WAVE_ROOT / "activation-v2-authorizations"
V9_PATH = AUDIT_ROOT / "master/coordination/CONCURRENCY_POLICY_V9.json"
V9_SHA256 = "0f9dae3c8406be8ab1159f610b6465120049d0057aa81031d6826fb9ba88b592"
STATUS = "ACTIVE_FOR_EXACTLY_16_FRESH_SOL_XHIGH_SHADOW_CERTIFICATION_LEAVES_V2"


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def sha(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError("not-object:%s" % path)
    return value


def fail(message: str) -> None:
    raise RuntimeError(message)


def zero_state_errors(manifest: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    forbidden = [FINAL_ACTIVATION_PATH, CORE_PATH, WAVE_ROOT / "activation"]
    if any(path.exists() for path in forbidden) or AUTHORIZATION_ROOT.exists():
        errors.append("activation-state-already-exists")
    if (WAVE_ROOT / "runtime/native_capture-v2.json").exists() or (WAVE_ROOT / "runtime/native_capture.json").exists():
        errors.append("native-capture-exists")
    for row in manifest:
        output = Path(row["output_directory"])
        if not output.is_dir() or any(output.iterdir()):
            errors.append("nonempty-output:%s" % row["assignment_id"])
        intent = WAVE_ROOT / row["intent_ref"]
        if intent.with_name("dispatch_receipt.json").exists():
            errors.append("receipt-exists:%s" % row["assignment_id"])
    return sorted(set(errors))


def atomic_write(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_bytes(canonical(value))
    os.replace(temporary, path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--independent-report", required=True, type=Path)
    parser.add_argument("--independent-report-sha256", required=True)
    parser.add_argument("--expected-jsonschema-version", required=True)
    args = parser.parse_args()
    report_path = args.independent_report.resolve()
    if not report_path.is_file() or sha(report_path) != args.independent_report_sha256:
        fail("independent-report-path-or-hash")
    if not all(path.is_file() for path in (AUTHORITY_PATH, CONTRACT_PATH, LOCAL_REPORT_PATH, V9_PATH)):
        fail("v2-control-missing")
    if sha(V9_PATH) != V9_SHA256:
        fail("v9-hash")
    authority = load(AUTHORITY_PATH)
    contract = load(CONTRACT_PATH)
    local = load(LOCAL_REPORT_PATH)
    report = load(report_path)
    engine = validator_v2.engine_status(args.expected_jsonschema_version)
    if not engine.get("available"):
        fail("draft202012-engine-unavailable-or-drift:%s" % engine.get("error"))
    if local.get("status") != "BLOCKED_AWAITING_FRESH_INDEPENDENT_PRELAUNCH_V2" or local.get("activation_authorized") is not False:
        fail("local-v2-state")
    required = {
        "audit_id": authority["audit_id"],
        "wave_id": authority["wave_id"],
        "status": "pass",
        "errors": [],
        "independent": True,
        "assignment_count": 16,
        "feature_count": 3888,
        "features_per_assignment": 243,
        "assignment_ids": authority["assignment_ids"],
        "coverage_digest": authority["coverage_digest"],
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "controller_thread_id": "019f4f5e-96c6-7893-8c94-ce2c1b760d6c",
        "v9_sha256": V9_SHA256,
        "validator_authority_v2_sha256": sha(AUTHORITY_PATH),
        "activation_contract_v2_sha256": sha(CONTRACT_PATH),
        "validator_v2_sha256": authority["validator_v2_sha256"],
        "tests_v2_sha256": authority["tests_v2_sha256"],
        "independent_fail_report_sha256": authority["independent_fail_report_sha256"],
        "zero_state": {"output_directories": 16, "output_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_files": 0},
        "activation_authorized": True,
    }
    for key, expected in required.items():
        if report.get(key) != expected:
            fail("independent-report-binding:%s" % key)
    schema_engine = report.get("schema_engine", {})
    if schema_engine.get("available") is not True or schema_engine.get("distribution") != "jsonschema" or schema_engine.get("library_version") != args.expected_jsonschema_version or schema_engine.get("validator_class") != "jsonschema.Draft202012Validator" or schema_engine.get("meta_schema_id") != "https://json-schema.org/draft/2020-12/schema":
        fail("independent-report-schema-engine")
    test_results = report.get("validator_v2_tests", {})
    if test_results.get("failed") != 0 or test_results.get("passed") != test_results.get("total") or test_results.get("total", 0) < 400 or test_results.get("bypasses_rejected") != 12:
        fail("independent-report-tests")

    manifest = [json.loads(line) for line in (WAVE_ROOT / "batch_manifest.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
    errors = zero_state_errors(manifest)
    if errors:
        fail(";".join(errors))
    transaction_id = "A005-ERSC-V2-" + sha_bytes(canonical({"report": args.independent_report_sha256, "authority": sha(AUTHORITY_PATH), "contract": sha(CONTRACT_PATH)}))[:24]
    core = {
        "schema_version": "external-research-universal-shadow-certification-activation-core-v2",
        "audit_id": authority["audit_id"], "wave_id": authority["wave_id"],
        "status": STATUS, "activation_granted": True, "activation_transaction_id": transaction_id,
        "assignment_count": 16, "assignment_ids": authority["assignment_ids"],
        "controller_thread_id": "019f4f5e-96c6-7893-8c94-ce2c1b760d6c",
        "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "fork_turns": "none",
        "fresh_children": True, "descendants_forbidden": True, "followups_forbidden": True, "retries_forbidden": True,
        "v9_sha256": V9_SHA256, "transaction_cap": 16, "rolling_total_cap": 32,
        "independent_prelaunch_ref": str(report_path), "independent_prelaunch_sha256": args.independent_report_sha256,
        "schema_engine": {key: value for key, value in engine.items() if key not in {"validator", "format_checker_class"}},
        "validator_authority_v2_sha256": sha(AUTHORITY_PATH), "activation_contract_v2_sha256": sha(CONTRACT_PATH),
        "certification_credit": 0,
    }
    core_sha = sha_bytes(canonical(core))
    authorizations: dict[str, dict[str, Any]] = {}
    for row in manifest:
        aid = row["assignment_id"]
        intent = WAVE_ROOT / row["intent_ref"]
        authorizations[aid] = {
            "schema_version": "external-research-universal-shadow-certification-dispatch-authorization-v2",
            "audit_id": authority["audit_id"], "wave_id": authority["wave_id"], "assignment_id": aid,
            "attempt_id": "attempt-0001", "activation_granted": True, "activation_transaction_id": transaction_id,
            "activation_core_v2_ref": str(CORE_PATH), "activation_core_v2_sha256": core_sha,
            "dispatch_intent_ref": str(intent), "dispatch_intent_sha256": sha(intent),
            "packet_ref": str(WAVE_ROOT / row["packet_ref"]), "packet_sha256": row["packet_sha256"],
            "result_schema_ref": str(WAVE_ROOT / "schemas/result.schema.json"),
            "result_schema_sha256": authority["result_schema_sha256"],
            "output_directory": row["output_directory"], "agent_path": row["prospective_agent_path"],
            "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "fresh_child": True, "fork_turns": "none",
            "descendants_forbidden": True, "followups_forbidden": True, "retries_forbidden": True,
        }
    final = {
        "schema_version": "external-research-universal-shadow-certification-activation-v2",
        "audit_id": authority["audit_id"], "wave_id": authority["wave_id"],
        "status": STATUS, "activation_granted": True, "activation_transaction_id": transaction_id,
        "activation_core_v2_ref": str(CORE_PATH), "activation_core_v2_sha256": core_sha,
        "authorization_count": 16,
        "authorization_sha256_by_assignment": {aid: sha_bytes(canonical(value)) for aid, value in authorizations.items()},
        "assignment_ids": authority["assignment_ids"], "v9_sha256": V9_SHA256,
        "certification_credit": 0,
    }
    atomic_write(CORE_PATH, core)
    for aid, value in authorizations.items():
        atomic_write(AUTHORIZATION_ROOT / (aid + "-authorization-v2.json"), value)
    atomic_write(FINAL_ACTIVATION_PATH, final)
    print(json.dumps({"status": STATUS, "activation_v2_sha256": sha(FINAL_ACTIVATION_PATH), "activation_core_v2_sha256": core_sha, "authorization_count": 16}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()

