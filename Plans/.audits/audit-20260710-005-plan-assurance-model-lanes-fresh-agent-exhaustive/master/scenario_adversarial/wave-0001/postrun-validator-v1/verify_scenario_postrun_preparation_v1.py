#!/usr/bin/env python3
"""Read-only verifier for zero-launch scenario postrun tooling."""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
from pathlib import Path
from typing import Any

BASE = Path(__file__).resolve().parent
WAVE = BASE.parent
AUDIT = BASE.parents[3]
AUTHORITY = BASE / "VALIDATOR_AUTHORITY_V1.json"
VALIDATOR = BASE / "validate_scenario_postrun_v1.py"
SCHEMA = WAVE / "schemas/scenario_adversarial_result.schema.json"
READINESS = WAVE / "launch-readiness-v16/terminal-readiness-report.json"
PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = AUDIT / "master/dependencies/jsonschema-draft202012-v1/site-packages"

EXPECTED = {
    WAVE / "batch_authority.json": "1ef11e1e312cc0ba7d863f81d518ce3c9cd284f0f88d417ccd44aace4fed825f",
    WAVE / "architecture.json": "8ccb832593c070f9df507513f4b7c4e95a702d617aa2c7978c66fc9a7b0e0373",
    WAVE / "launch_seal.json": "4742b254ab3b8f4e95d11c2584204985aef541bca5a8876c429f90778f3a2261",
    WAVE / "leaf_prompt.json": "104e1f1126e76a3d6f0e01e041e67ac7666ccbfebe7bb84ceccd17fafb5304bf",
    WAVE / "packet_registry.jsonl": "558533da8cb7244e706f3033e320ae324671ce1ade3a7941ddf3edb54fe4f485",
    WAVE / "receipt_contract.json": "9d5059d83f31780ad14958d6526ed54e1fb6402210d6060856afb0b9799c65cf",
    SCHEMA: "190a5e612bdbe7b2de4f3659fdbe7b9f2621ee2f194a25051f2bf39df4ac3db8",
    READINESS: "131d91ee8679132f8b806cab517350393105b43f86cc87342ac6987c75f12c02",
    WAVE / "cohorts/cohort-0001/cohort_manifest.jsonl": "7cef85ea13b20c39ce9071fc75a70a786248e4d7eecd27b250560c5017721860",
    WAVE / "cohorts/cohort-0002/cohort_manifest.jsonl": "641d1af2ad7a5238f2c15f787fb046e299eb3480d6cfd18301b472e14e006592",
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def rows(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def required_unique(value: Any, path: str = "$") -> list[str]:
    errors: list[str] = []
    if isinstance(value, dict):
        if isinstance(value.get("required"), list) and len(value["required"]) != len(set(value["required"])):
            errors.append("duplicate-required:" + path)
        for key, child in value.items():
            errors.extend(required_unique(child, path + "." + key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            errors.extend(required_unique(child, f"{path}[{index}]"))
    return errors


def run_pinned(args: list[str]) -> subprocess.CompletedProcess[str]:
    env = {
        "PYTHONPATH": str(SITE), "PYTHONNOUSERSITE": "1", "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0", "PATH": os.environ.get("PATH", ""),
    }
    return subprocess.run([str(PYTHON), "-S", "-B", *args], env=env, text=True, capture_output=True)


def verify() -> dict[str, Any]:
    errors: list[str] = []
    for path, expected in EXPECTED.items():
        if not path.is_file() or sha(path) != expected:
            errors.append("frozen-hash:" + str(path))
    authority = load(AUTHORITY)
    if authority.get("status") != "BLOCKED_AWAITING_FUTURE_SCENARIO_EXECUTION" or authority.get("validation_authorized") is not False:
        errors.append("authority-status")
    if any(authority.get("credit", {}).values()):
        errors.append("authority-credit")
    readiness = load(READINESS)
    if readiness.get("assignments") != 16 or readiness.get("features") != 1640 or readiness.get("atomic_size") != 8 or readiness.get("tests_passed") != 288:
        errors.append("readiness-scope")
    manifests = [rows(WAVE / f"cohorts/cohort-000{index}/cohort_manifest.jsonl") for index in (1, 2)]
    expected_ids = [f"A005SA-{index:04d}" for index in range(1, 17)]
    actual_ids = [row["assignment_id"] for cohort in manifests for row in cohort]
    feature_refs = [feature for cohort in manifests for row in cohort for feature in row["feature_refs"]]
    if actual_ids != expected_ids or len(feature_refs) != 1640 or len(set(feature_refs)) != 1640:
        errors.append("manifest-coverage")
    for cohort_index, cohort in enumerate(manifests, 1):
        if len(cohort) != 8 or any(row["cohort_id"] != f"cohort-000{cohort_index}" for row in cohort):
            errors.append(f"cohort-scope:{cohort_index}")
        for row in cohort:
            output = Path(row["output_directory"])
            receipt = WAVE / f"dispatch/{row['assignment_id']}/attempt-0001/dispatch_receipt.json"
            if not output.is_dir() or any(output.iterdir()):
                errors.append("output-not-empty:" + row["assignment_id"])
            if receipt.exists():
                errors.append("receipt-present:" + row["assignment_id"])
            intent = WAVE / f"dispatch/{row['assignment_id']}/attempt-0001/dispatch_intent.json"
            packet = Path(row["packet_ref"])
            if not packet.is_absolute():
                packet = WAVE / packet
            if not intent.is_file() or not packet.is_file() or sha(packet) != row["packet_sha256"]:
                errors.append("intent-packet:" + row["assignment_id"])
    for cohort_id, cohort in authority["cohorts"].items():
        capture = AUDIT / cohort["future_native_capture_path"]
        if capture.exists():
            errors.append("capture-present:" + cohort_id)
    errors.extend(required_unique(load(SCHEMA)))

    engine = run_pinned(["-c", (
        "import importlib.metadata,json,sys;from pathlib import Path;"
        "from jsonschema import Draft202012Validator;"
        f"s=json.loads(Path({str(SCHEMA)!r}).read_text());Draft202012Validator.check_schema(s);"
        "print(importlib.metadata.version('jsonschema'),sys.version_info[:3],Draft202012Validator.__name__)"
    )])
    if engine.returncode or "4.26.0 (3, 12, 13) Draft202012Validator" not in engine.stdout:
        errors.append("schema-engine")
    prelaunch = run_pinned([str(VALIDATOR), "--prelaunch"])
    if prelaunch.returncode:
        errors.append("validator-prelaunch:" + prelaunch.stderr[:200])
    else:
        report = json.loads(prelaunch.stdout)
        if report.get("status") != "pass_blocked" or report.get("assignment_count") != 16 or report.get("feature_count") != 1640 or report.get("outputs_empty") != 16:
            errors.append("validator-prelaunch-state")
    return {
        "status": "pass" if not errors else "fail",
        "errors": errors,
        "assignment_count": 16,
        "feature_count": 1640,
        "cohort_count": 2,
        "atomic_size": 8,
        "outputs_empty": 16,
        "results": 0,
        "receipts": 0,
        "native_capture_rows": 0,
        "credit": 0,
        "validation_authorized": False,
        "schema_engine": "jsonschema 4.26.0 Draft202012Validator CPython 3.12.13 -S -B",
    }


if __name__ == "__main__":
    print(json.dumps(verify(), indent=2, sort_keys=True))
