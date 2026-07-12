#!/usr/bin/env python3
"""Strict cohort-aware postrun validator for scenario/adversarial V1 results.

Prepared zero-launch. It reads result bodies only in explicit postrun mode.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

from jsonschema import Draft202012Validator

BASE = Path(__file__).resolve().parent
WAVE = BASE.parent
AUDIT = BASE.parents[3]
AUTHORITY_PATH = BASE / "VALIDATOR_AUTHORITY_V1.json"
SCHEMA_PATH = WAVE / "schemas/scenario_adversarial_result.schema.json"
RECEIPT_CONTRACT_PATH = WAVE / "receipt_contract.json"

COHORT_MANIFESTS = {
    "cohort-0001": WAVE / "cohorts/cohort-0001/cohort_manifest.jsonl",
    "cohort-0002": WAVE / "cohorts/cohort-0002/cohort_manifest.jsonl",
}
DIMENSIONS = (
    "normal_happy_path", "boundary_invalid_input", "failure_partial_failure",
    "cancellation_retry_idempotency_stale_recovery", "concurrency_race_ordering",
    "permission_security_privacy_credentials", "persistence_restart_offline_upgrade_migration",
    "scale_quota_backpressure_observability", "accessibility_i18n_user_comprehension",
    "cross_component_authority_ownership_integration",
)
NON_CERTIFIED = {"gap_confirmed", "contradiction", "blocked_insufficient_evidence"}


def canonical(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def digest(value: Any) -> str:
    return hashlib.sha256(canonical(value)).hexdigest()


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def direct_https(url: Any) -> bool:
    if not isinstance(url, str) or not url or any(character.isspace() for character in url):
        return False
    parsed = urlsplit(url)
    return parsed.scheme == "https" and bool(parsed.netloc) and parsed.path not in ("", "/search") and "search" not in parsed.netloc.lower()


def packet_question_counts(row: dict[str, Any]) -> dict[str, int]:
    packet_path = Path(row["packet_ref"])
    if not packet_path.is_absolute():
        packet_path = WAVE / packet_path
    packet = load(packet_path)
    table = packet["string_table"]
    counts: dict[str, int] = {}
    for feature in packet["features"]:
        feature_ref = table[feature[0]]
        questions = [table[index] for index in feature[9]]
        counts[feature_ref] = len(questions)
    return counts


def schema_errors(result: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema)
    return [
        "schema:" + "/".join(str(part) for part in error.absolute_path) + ":" + error.message
        for error in sorted(validator.iter_errors(result), key=lambda item: (list(item.absolute_path), item.message))
    ]


def feature_semantic_errors(certification: dict[str, Any], question_count: int) -> list[str]:
    errors: list[str] = []
    feature_ref = certification.get("provisional_feature_ref", "<missing>")
    disposition = certification.get("certification_disposition")
    if disposition in NON_CERTIFIED and not certification.get("overall_spec_deltas"):
        errors.append(f"feature:{feature_ref}:missing-overall-spec-delta")
    research = certification.get("research_applicability", {})
    if question_count > 0 and not research.get("rationale"):
        errors.append(f"feature:{feature_ref}:question-coverage-rationale")
    claim_ids: list[str] = []
    for claim in research.get("claims_used", []):
        claim_id = claim.get("claim_id")
        if not isinstance(claim_id, str) or not claim_id:
            errors.append(f"feature:{feature_ref}:claim-id")
        else:
            claim_ids.append(claim_id)
        urls = claim.get("source_urls", [])
        if not urls or any(not direct_https(url) for url in urls):
            errors.append(f"feature:{feature_ref}:claim-url")
        if not claim.get("claim") or not claim.get("evidence_label"):
            errors.append(f"feature:{feature_ref}:claim-evidence")
    if len(claim_ids) != len(set(claim_ids)):
        errors.append(f"feature:{feature_ref}:duplicate-claim-id")
    if research.get("state") in {"weak", "misapplied", "insufficient"} and disposition == "certified":
        errors.append(f"feature:{feature_ref}:certified-with-weak-research")

    dimensions = certification.get("dimensions", {})
    total_scenarios = 0
    for dimension_name in DIMENSIONS:
        dimension = dimensions.get(dimension_name)
        if not isinstance(dimension, dict):
            errors.append(f"feature:{feature_ref}:missing-dimension:{dimension_name}")
            continue
        dim_disposition = dimension.get("disposition")
        scenarios = dimension.get("scenarios", [])
        criteria = dimension.get("acceptance_criteria", [])
        total_scenarios += len(scenarios) if isinstance(scenarios, list) else 0
        if dim_disposition != "not_applicable_dimension":
            if not scenarios:
                errors.append(f"feature:{feature_ref}:missing-scenario:{dimension_name}")
            if not criteria:
                errors.append(f"feature:{feature_ref}:missing-acceptance:{dimension_name}")
        if dim_disposition in NON_CERTIFIED and not dimension.get("spec_deltas"):
            errors.append(f"feature:{feature_ref}:missing-dimension-spec-delta:{dimension_name}")
        for criterion in criteria:
            if not criterion.get("observables") or not criterion.get("evidence_artifacts"):
                errors.append(f"feature:{feature_ref}:nonexecutable-criterion:{dimension_name}")
            oracle = criterion.get("oracle", {})
            if not oracle.get("pass") or not oracle.get("fail") or oracle.get("pass") == oracle.get("fail"):
                errors.append(f"feature:{feature_ref}:nonfalsifiable-oracle:{dimension_name}")
    if question_count > 0 and total_scenarios < question_count:
        errors.append(f"feature:{feature_ref}:insufficient-question-scenario-coverage")
    return errors


def result_errors(result: dict[str, Any], row: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    errors = schema_errors(result, schema)
    assignment_id = row["assignment_id"]
    expected = {
        "assignment_id": assignment_id,
        "attempt_id": "attempt-0001",
        "cohort_id": row["cohort_id"],
        "task_thread_id": row["prospective_agent_path"],
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
    }
    for key, value in expected.items():
        if result.get(key) != value:
            errors.append(f"binding:{key}")
    input_binding = result.get("input_binding", {})
    for key, value in {
        "packet_id": row["packet_id"], "packet_sha256": row["packet_sha256"],
        "feature_refs_digest": row["feature_refs_digest"],
        "candidate_evidence_label": row["candidate_evidence_label"],
    }.items():
        if input_binding.get(key) != value:
            errors.append(f"input-binding:{key}")
    coverage = result.get("coverage", {})
    if coverage.get("feature_count") != row["feature_count"] or coverage.get("feature_refs") != row["feature_refs"]:
        errors.append("coverage")
    certifications = result.get("feature_certifications", [])
    ids = [item.get("provisional_feature_ref") for item in certifications if isinstance(item, dict)]
    if ids != row["feature_refs"] or len(ids) != len(set(ids)):
        errors.append("certification-membership-order")
    question_counts = packet_question_counts(row)
    by_id = {item.get("provisional_feature_ref"): item for item in certifications if isinstance(item, dict)}
    for feature_ref in row["feature_refs"]:
        certification = by_id.get(feature_ref)
        if not certification:
            continue
        if certification.get("source_row_sha256") != row["source_row_sha256_by_feature"].get(feature_ref):
            errors.append(f"feature:{feature_ref}:source-row-sha")
        research = row["research_binding_by_feature"].get(feature_ref, {})
        if certification.get("research_result_file_sha256") != research.get("result_file_sha256"):
            errors.append(f"feature:{feature_ref}:research-result-sha")
        if certification.get("research_record_sha256") != research.get("research_record_sha256"):
            errors.append(f"feature:{feature_ref}:research-record-sha")
        errors.extend(feature_semantic_errors(certification, question_counts.get(feature_ref, 0)))
    return errors


def receipt_errors(receipt: dict[str, Any], row: dict[str, Any], result_path: Path) -> list[str]:
    errors: list[str] = []
    contract = load(RECEIPT_CONTRACT_PATH)
    required = set(contract["required_keys"]) | set(load(AUTHORITY_PATH)["future_receipt_extensions_required"])
    if not required.issubset(receipt):
        errors.append("receipt-required-keys")
    expected = {
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "wave_id": "wave-0001", "cohort_id": row["cohort_id"], "assignment_id": row["assignment_id"],
        "attempt_id": "attempt-0001", "controller_thread_id": "019f4f5e-96c6-7893-8c94-ce2c1b760d6c",
        "agent_path": row["prospective_agent_path"], "task_thread_id": row["prospective_agent_path"],
        "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "fresh_child": True, "fork_turns": "none",
        "packet_sha256": row["packet_sha256"], "output_directory": row["output_directory"],
        "result_path": str(result_path), "result_sha256": sha(result_path),
        "terminal_status": "completed", "terminal_response": "PMR1",
    }
    for key, value in expected.items():
        if receipt.get(key) != value:
            errors.append(f"receipt:{key}")
    for key in ("native_child_thread_id", "native_turn_id", "activation_path", "activation_sha256"):
        if not isinstance(receipt.get(key), str) or not receipt[key]:
            errors.append(f"receipt:{key}")
    intent_path = WAVE / f"dispatch/{row['assignment_id']}/attempt-0001/dispatch_intent.json"
    if receipt.get("dispatch_intent_sha256") != sha(intent_path):
        errors.append("receipt:dispatch-intent-sha256")
    return errors


def validate_cohort(cohort_id: str) -> dict[str, Any]:
    schema = load(SCHEMA_PATH)
    rows = jsonl(COHORT_MANIFESTS[cohort_id])
    statuses: dict[str, Any] = {}
    receipts: dict[str, dict[str, Any]] = {}
    for row in rows:
        assignment_id = row["assignment_id"]
        output = Path(row["output_directory"])
        result_path = output / "result.json"
        receipt_path = WAVE / f"dispatch/{assignment_id}/attempt-0001/dispatch_receipt.json"
        errors: list[str] = []
        files = list(output.iterdir()) if output.is_dir() else []
        if files != [result_path]:
            errors.append("output-confinement")
        if result_path.is_file():
            errors.extend(result_errors(load(result_path), row, schema))
        else:
            errors.append("result-missing")
        if receipt_path.is_file() and result_path.is_file():
            receipt = load(receipt_path)
            receipts[assignment_id] = receipt
            errors.extend(receipt_errors(receipt, row, result_path))
        else:
            errors.append("receipt-missing")
        statuses[assignment_id] = {"status": "eligible" if not errors else "rejected", "errors": errors}

    capture_path = AUDIT / load(AUTHORITY_PATH)["cohorts"][cohort_id]["future_native_capture_path"]
    capture_errors: list[str] = []
    if not capture_path.is_file():
        capture_errors.append("native-capture-missing")
    else:
        capture = load(capture_path)
        capture_rows = capture.get("rows", [])
        if len(capture_rows) != 8:
            capture_errors.append("native-capture-cardinality")
        identity_sets = {key: [row.get(key) for row in capture_rows] for key in ("assignment_id", "agent_path", "native_child_thread_id", "native_turn_id")}
        for key, values in identity_sets.items():
            if len(values) != len(set(values)) or any(not value for value in values):
                capture_errors.append(f"native-capture-unique:{key}")
        by_assignment = {row.get("assignment_id"): row for row in capture_rows}
        for assignment_id, receipt in receipts.items():
            row = by_assignment.get(assignment_id, {})
            for key in ("agent_path", "native_child_thread_id", "native_turn_id", "result_sha256", "terminal_status", "terminal_response"):
                if row.get(key) != receipt.get(key):
                    capture_errors.append(f"native-capture-join:{assignment_id}:{key}")
    if capture_errors:
        for value in statuses.values():
            value["errors"].extend(capture_errors)
            value["status"] = "rejected"
    eligible = [assignment_id for assignment_id, value in statuses.items() if value["status"] == "eligible"]
    rejected = [assignment_id for assignment_id, value in statuses.items() if value["status"] != "eligible"]
    return {
        "status": "candidate_pass" if len(eligible) == 8 else "fail_closed",
        "cohort_id": cohort_id,
        "eligible_ids": eligible,
        "rejected_ids": rejected,
        "assignment_statuses": statuses,
        "eligible_count": len(eligible),
        "rejected_count": len(rejected),
        "credit": 0,
        "independent_checkpoint_required": True,
    }


def prelaunch_state() -> dict[str, Any]:
    errors: list[str] = []
    assignment_count = 0
    feature_count = 0
    for cohort_id, path in COHORT_MANIFESTS.items():
        rows = jsonl(path)
        assignment_count += len(rows)
        feature_count += sum(row["feature_count"] for row in rows)
        for row in rows:
            output = Path(row["output_directory"])
            receipt = WAVE / f"dispatch/{row['assignment_id']}/attempt-0001/dispatch_receipt.json"
            if not output.is_dir() or any(output.iterdir()):
                errors.append(f"output-not-empty:{row['assignment_id']}")
            if receipt.exists():
                errors.append(f"receipt-present:{row['assignment_id']}")
        capture = AUDIT / load(AUTHORITY_PATH)["cohorts"][cohort_id]["future_native_capture_path"]
        if capture.exists():
            errors.append(f"capture-present:{cohort_id}")
    return {
        "status": "pass_blocked" if not errors else "fail",
        "errors": errors,
        "assignment_count": assignment_count,
        "feature_count": feature_count,
        "outputs_empty": 16 if not errors else None,
        "results": 0,
        "receipts": 0,
        "native_capture_rows": 0,
        "credit": 0,
        "postrun_validation_authorized": False,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--prelaunch", action="store_true")
    parser.add_argument("--cohort", choices=("cohort-0001", "cohort-0002"))
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if importlib.metadata.version("jsonschema") != "4.26.0":
        raise SystemExit("jsonschema-version")
    if args.prelaunch:
        report = prelaunch_state()
    elif args.cohort:
        report = validate_cohort(args.cohort)
    else:
        raise SystemExit("choose --prelaunch or --cohort")
    raw = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        descriptor = os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
        with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
            stream.write(raw)
    else:
        print(raw, end="")
    raise SystemExit(0 if report["status"] in {"pass_blocked", "candidate_pass"} else 1)


if __name__ == "__main__":
    main()
