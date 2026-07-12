#!/usr/bin/env python3
"""Deterministic prelaunch verifier for validator/activation supersession v2."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any

import validate_universal_shadow_certification_postrun_v2 as validator_v2

HERE = Path(__file__).resolve().parent
WAVE_ROOT = HERE.parents[1]
AUDIT_ROOT = HERE.parents[4]
STATUS = "BLOCKED_AWAITING_FRESH_INDEPENDENT_PRELAUNCH_V2"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")


def digest(value: Any) -> str:
    return hashlib.sha256(canonical(value)).hexdigest()


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError("not-object:%s" % path)
    return value


def main() -> None:
    errors: list[str] = []
    required = {
        "authority": HERE / "VALIDATOR_AUTHORITY_V2.json",
        "validator": HERE / "validate_universal_shadow_certification_postrun_v2.py",
        "tests": HERE / "test_universal_shadow_certification_postrun_v2.py",
        "generator": HERE / "activation-generator-v2.py",
        "contract": HERE / "activation-contract-supersession-v2.json",
        "local_report": HERE / "local-v2-candidate-report.json",
        "fail_report": WAVE_ROOT / "validation/sol-fresh-independent-prelaunch.json",
        "result_schema": WAVE_ROOT / "schemas/result.schema.json",
        "manifest": WAVE_ROOT / "batch_manifest.jsonl",
        "registry": WAVE_ROOT / "packet_registry.jsonl",
        "v9": AUDIT_ROOT / "master/coordination/CONCURRENCY_POLICY_V9.json",
    }
    if any(not path.is_file() for path in required.values()):
        missing = [name for name, path in required.items() if not path.is_file()]
        print(json.dumps({"status": "fail", "errors": ["missing:%s" % name for name in missing]}, indent=2))
        raise SystemExit(1)
    authority = load(required["authority"])
    contract = load(required["contract"])
    local = load(required["local_report"])
    if authority.get("status") != STATUS or contract.get("status") != STATUS or local.get("status") != STATUS:
        errors.append("blocked-status")
    if authority.get("activation_authorized") is not False or contract.get("activation_authorized") is not False or local.get("activation_authorized") is not False:
        errors.append("activation-state")
    expected_hashes = {
        "independent_fail_report_sha256": sha(required["fail_report"]),
        "result_schema_sha256": sha(required["result_schema"]),
        "manifest_sha256": sha(required["manifest"]),
        "packet_registry_sha256": sha(required["registry"]),
        "validator_v2_sha256": sha(required["validator"]),
        "tests_v2_sha256": sha(required["tests"]),
        "activation_generator_v2_sha256": sha(required["generator"]),
        "verifier_v2_sha256": sha(Path(__file__)),
    }
    for key, value in expected_hashes.items():
        if authority.get(key) != value:
            errors.append("authority-hash:%s" % key)
    if contract.get("validator_authority_v2_sha256") != sha(required["authority"]):
        errors.append("contract-authority-hash")
    for key in ("independent_fail_report_sha256", "result_schema_sha256", "manifest_sha256", "packet_registry_sha256", "validator_v2_sha256", "tests_v2_sha256", "activation_generator_v2_sha256"):
        if contract.get(key) != authority.get(key):
            errors.append("contract-binding:%s" % key)
    if local.get("validator_authority_v2_sha256") != sha(required["authority"]) or local.get("activation_contract_v2_sha256") != sha(required["contract"]):
        errors.append("local-control-hash")
    engine = validator_v2.engine_status()
    public_engine = {key: value for key, value in engine.items() if key not in {"validator", "format_checker_class"}}
    if local.get("schema_engine") != public_engine:
        errors.append("local-schema-engine-state")

    test = subprocess.run(["python3", "-B", str(required["tests"])], cwd=HERE, capture_output=True, text=True, check=False)
    try:
        test_report = json.loads(test.stdout)
    except Exception:
        test_report = {"status": "fail", "counts": {"passed": 0, "total": 0, "failed": 1}, "bypass_reproductions": {"rejected": 0, "total": 12}}
    counts = test_report.get("counts", {})
    if test.returncode != 0 or test_report.get("status") != "pass_fail_closed" or counts.get("total", 0) < 400 or counts.get("passed") != counts.get("total") or counts.get("failed") != 0:
        errors.append("v2-test-suite")
    if test_report.get("bypass_reproductions", {}).get("rejected") != test_report.get("bypass_reproductions", {}).get("total") or test_report.get("bypass_reproductions", {}).get("total") != 12:
        errors.append("bypass-reproduction-closure")
    if local.get("tests") != {"passed": counts.get("passed"), "total": counts.get("total"), "failed": counts.get("failed"), "bypasses_rejected": 12, "generic_schema_fuzz_rejected": test_report.get("generic_schema_fuzz", {}).get("rejected")}:
        errors.append("local-test-summary")

    manifest = [json.loads(line) for line in required["manifest"].read_text(encoding="utf-8").splitlines() if line.strip()]
    registry = [json.loads(line) for line in required["registry"].read_text(encoding="utf-8").splitlines() if line.strip()]
    refs = [ref for row in manifest for ref in row.get("feature_refs", [])]
    if len(manifest) != 16 or len(registry) != 16 or len(refs) != len(set(refs)) or len(refs) != 3888 or any(row.get("feature_count") != 243 for row in manifest):
        errors.append("coverage-cardinality")
    if authority.get("coverage_digest") != "91f8e13d91dc3615781c9592abade65072b45514a4b515471e96750409586ca3":
        errors.append("coverage-digest")
    packet_hashes = {row["assignment_id"]: sha(WAVE_ROOT / row["packet_ref"]) for row in manifest}
    intent_hashes = {row["assignment_id"]: sha(WAVE_ROOT / row["intent_ref"]) for row in manifest}
    if authority.get("packet_sha256_by_assignment") != packet_hashes:
        errors.append("packet-hash-map")
    if authority.get("intent_sha256_by_assignment") != intent_hashes:
        errors.append("intent-hash-map")
    output_files = 0
    receipts = 0
    for row in manifest:
        output = Path(row["output_directory"])
        if not output.is_dir():
            errors.append("output-missing:%s" % row["assignment_id"])
        else:
            output_files += sum(1 for path in output.iterdir() if path.is_file() or path.is_dir())
        intent = WAVE_ROOT / row["intent_ref"]
        receipts += int(intent.with_name("dispatch_receipt.json").is_file())
    activation_files = [path for path in [WAVE_ROOT / "activation-v2.json", WAVE_ROOT / "activation-core-v2.json"] if path.exists()]
    if (WAVE_ROOT / "activation-v2-authorizations").exists():
        activation_files.extend(path for path in (WAVE_ROOT / "activation-v2-authorizations").rglob("*") if path.is_file())
    if output_files or receipts or activation_files or (WAVE_ROOT / "runtime/native_capture-v2.json").exists():
        errors.append("live-zero-state")
    report = {
        "audit_id": authority.get("audit_id"),
        "checker": "universal-shadow-certification-validator-v2-prelaunch-verifier",
        "status": "pass" if not errors else "fail",
        "activation_status": STATUS,
        "errors": sorted(set(errors)),
        "schema_engine": public_engine,
        "counts": {"assignments": len(manifest), "packets": len(registry), "features": len(refs), "unique_features": len(set(refs)), "output_files": output_files, "receipts": receipts, "activation_files": len(activation_files), "native_capture": int((WAVE_ROOT / "runtime/native_capture-v2.json").exists())},
        "coverage_digest": authority.get("coverage_digest"),
        "tests": {"passed": counts.get("passed"), "total": counts.get("total"), "failed": counts.get("failed"), "bypasses_rejected": 12},
        "candidate_controls_digest": digest({"authority": sha(required["authority"]), "contract": sha(required["contract"]), "local": sha(required["local_report"])}),
        "remaining_gate": "install/pin jsonschema Draft202012Validator, then obtain one fresh independent v2 prelaunch report with exact zero-state and v2 hashes",
    }
    print(json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
