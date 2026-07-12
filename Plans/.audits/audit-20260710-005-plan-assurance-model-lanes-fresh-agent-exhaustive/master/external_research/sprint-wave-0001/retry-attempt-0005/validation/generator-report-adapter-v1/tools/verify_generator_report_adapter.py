#!/usr/bin/env python3
"""Independent read-only validator for the attempt-0005 generator adapter."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import project_generator_report as projection

sys.path.insert(0, str(projection.RETRY_ROOT / "tools"))
import generate_activation_transaction as frozen_generator  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidate", type=Path)
    args = parser.parse_args()
    errors: list[str] = []
    try:
        raw = projection.SOURCE_REPORT.read_bytes()
        bundle = projection.project_from_captured(raw, projection.SOURCE_REPORT_SHA256, projection.SOURCE_REPORT)
        payload = projection.exact_payload(bundle)
    except Exception as exc:
        print(json.dumps({"status": "fail_closed", "errors": [str(exc)]}, sort_keys=True))
        raise SystemExit(1)
    errors.extend(projection.schema_errors(payload))
    errors.extend(f"frozen_generator:{item}" for item in frozen_generator.independent_report_errors(payload))
    if bundle.get("source_report_path") != str(projection.SOURCE_REPORT): errors.append("manifest:source_path")
    if bundle.get("source_report_sha256") != projection.SOURCE_REPORT_SHA256: errors.append("manifest:source_sha")
    if bundle.get("state", {}).get("generator_invocation_performed") is not False: errors.append("state:generator_invoked")
    if bundle.get("state", {}).get("activation_granted") is not False: errors.append("state:activation")
    if bundle.get("state", {}).get("launch_authorized") is not False: errors.append("state:launch")
    if args.candidate is not None:
        candidate = args.candidate.resolve()
        if not candidate.is_file():
            errors.append("candidate:missing")
        else:
            try:
                value = json.loads(candidate.read_text(encoding="utf-8"))
                if value != payload: errors.append("candidate:payload_mismatch")
                if projection.sha_bytes(projection.canonical(value)) != bundle["projection_payload_sha256"]: errors.append("candidate:sha")
            except Exception as exc:
                errors.append(f"candidate:parse:{exc}")
    errors.extend(projection.zero_state_errors())
    result = {
        "checker": "external_research_generator_report_adapter_validator_v1",
        "schema_version": "external-research-generator-report-adapter-validation-v1",
        "status": "pass" if not errors else "fail_closed",
        "errors": sorted(set(errors)),
        "source_report_path": str(projection.SOURCE_REPORT),
        "source_report_sha256": projection.SOURCE_REPORT_SHA256,
        "projection_payload_sha256": bundle["projection_payload_sha256"],
        "generator_compatibility_errors": [item for item in errors if item.startswith("frozen_generator:")],
        "assignment_ids": projection.ASSIGNMENT_IDS,
        "activation_transaction_files": 0,
        "results": 0,
        "receipts": 0,
        "native_capture_rows": 0,
        "generator_invocation_performed": False,
        "activation_granted": False,
        "launch_authorized": False,
        "coverage_credit": 0,
        "research_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
    }
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))
    raise SystemExit(0 if result["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
