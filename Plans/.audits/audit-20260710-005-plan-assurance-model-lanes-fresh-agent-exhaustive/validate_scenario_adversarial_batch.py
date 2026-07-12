#!/usr/bin/env python3
"""Strict cohort-capable postrun validator for scenario/adversarial certification."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

from macro_v2_common import ROOT, sha
from prepare_scenario_adversarial_wave import (
    ATTEMPT_ID, CONTROLLER, DIMENSIONS, DISPOSITIONS, EFFORT, FEATURE_FIELD_ORDER, MAX_PACKET_BYTES, MODEL, NAMESPACE,
    WAVE_ID, decode_packet_features,
)

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
TOP_KEYS = {"audit_id", "schema_version", "phase", "cohort_id", "assignment_id", "attempt_id", "task_thread_id", "model", "reasoning_effort", "status", "input_binding", "coverage", "feature_certifications", "self_attestation"}
INPUT_KEYS = {"packet_id", "packet_sha256", "feature_refs_digest", "candidate_evidence_label"}
COVERAGE_KEYS = {"feature_count", "feature_refs"}
FEATURE_KEYS = {"provisional_feature_ref", "source_row_sha256", "research_result_file_sha256", "research_record_sha256", "certification_disposition", "disposition_rationale", "research_applicability", "dimensions", "overall_spec_deltas", "newly_discovered_candidates"}
RESEARCH_KEYS = {"state", "rationale", "browsing_performed", "claims_used"}
CLAIM_KEYS = {"claim_id", "claim", "source_urls", "evidence_label"}
DIMENSION_KEYS = {"disposition", "rationale", "scenarios", "acceptance_criteria", "spec_deltas"}
CRITERION_KEYS = {"criterion", "observables", "evidence_artifacts", "oracle"}
ORACLE_KEYS = {"pass", "fail"}
CANDIDATE_KEYS = {"candidate_type", "title", "rationale", "owner_domain_hint"}
ATTESTATION_KEYS = {"independent_reasoning_completed", "candidate_research_not_treated_as_proof", "every_feature_certified_once", "every_dimension_completed", "all_claims_source_mapped", "plans_not_edited", "no_descendants_or_followups"}
RECEIPT_KEYS = {"audit_id", "schema_version", "wave_id", "cohort_id", "assignment_id", "attempt_id", "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort", "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory"}
URL_RE = re.compile(r"^https://[^\s]+$")


def load_obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError(f"not object:{path}")
    return value


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def exact_keys(value: Any, expected: set[str], label: str, errors: list[str]) -> bool:
    if not isinstance(value, dict):
        errors.append(f"{label}:not_object")
        return False
    if set(value) != expected:
        errors.append(f"{label}:keys")
        return False
    return True


def strings(value: Any, *, nonempty: bool = False, unique: bool = False) -> bool:
    return isinstance(value, list) and (not nonempty or bool(value)) and all(isinstance(item, str) and item.strip() for item in value) and (not unique or len(value) == len(set(value)))


def packet_size_errors(packet_bytes: int) -> list[str]:
    return [] if isinstance(packet_bytes, int) and 0 < packet_bytes <= MAX_PACKET_BYTES else ["packet:over_ceiling_or_invalid"]


def packet_domain_errors(packet: dict[str, Any], records: list[dict[str, Any]]) -> list[str]:
    domain = packet.get("owner_domain")
    return [] if isinstance(domain, str) and records and all(row.get("owner_domain") == domain for row in records) else ["packet:cross_domain_or_empty"]


def packet_record_errors(records: list[dict[str, Any]]) -> list[str]:
    expected = set(FEATURE_FIELD_ORDER)
    return [] if records and all(set(record) == expected for record in records) else ["packet:lost_or_extra_compact_field"]


def output_file_errors(file_names: list[str]) -> list[str]:
    return [] if file_names == ["result.json"] else ["output:must_be_exactly_result_json"]


def receipt_set_errors(expected_ids: list[str], receipts: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    ids = [row.get("assignment_id") for row in receipts]
    paths = [row.get("agent_path") for row in receipts]
    if len(receipts) != len(expected_ids) or set(ids) != set(expected_ids):
        errors.append("receipts:missing_or_foreign")
    if len(ids) != len(set(ids)):
        errors.append("receipts:duplicate_assignment")
    if len(paths) != len(set(paths)):
        errors.append("receipts:duplicate_agent_path")
    return errors


def receipt_errors(receipt: Any, assignment: dict[str, Any], intent_path: Path, intent: dict[str, Any]) -> list[str]:
    if not isinstance(receipt, dict) or set(receipt) != RECEIPT_KEYS:
        return ["receipt:keys"]
    expected = {
        "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-dispatch-receipt-v1", "wave_id": WAVE_ID,
        "cohort_id": assignment["cohort_id"], "assignment_id": assignment["assignment_id"], "attempt_id": ATTEMPT_ID,
        "controller_thread_id": CONTROLLER, "model": MODEL, "reasoning_effort": EFFORT, "fresh_child": True,
        "fork_turns": "none", "dispatch_intent_sha256": sha(intent_path.read_bytes()),
        "packet_sha256": assignment["packet_sha256"], "output_directory": intent["output_directory"],
    }
    errors = [f"receipt:{key}" for key, value in expected.items() if receipt.get(key) != value]
    if receipt.get("agent_path") != assignment["prospective_agent_path"] or receipt.get("task_thread_id") != assignment["prospective_agent_path"]:
        errors.append("receipt:identity")
    return errors


def packet_evidence(records: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {record["provisional_feature_ref"]: record for record in records}


def result_errors(result: Any, assignment: dict[str, Any], receipt: dict[str, Any], records: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    if not exact_keys(result, TOP_KEYS, "result", errors):
        return errors
    constants = {
        "audit_id": AUDIT_ID, "schema_version": "scenario-adversarial-result-v1", "phase": "scenario_adversarial_certification",
        "cohort_id": assignment["cohort_id"], "assignment_id": assignment["assignment_id"], "attempt_id": ATTEMPT_ID,
        "task_thread_id": receipt["agent_path"], "model": MODEL, "reasoning_effort": EFFORT, "status": "completed",
    }
    for key, value in constants.items():
        if result.get(key) != value:
            errors.append(f"result:{key}")
    binding = result.get("input_binding")
    if exact_keys(binding, INPUT_KEYS, "input_binding", errors):
        expected = {"packet_id": assignment["packet_id"], "packet_sha256": assignment["packet_sha256"],
                    "feature_refs_digest": assignment["feature_refs_digest"],
                    "candidate_evidence_label": assignment["candidate_evidence_label"]}
        if binding != expected:
            errors.append("input_binding:values")
    coverage = result.get("coverage")
    if exact_keys(coverage, COVERAGE_KEYS, "coverage", errors):
        if coverage != {"feature_count": assignment["feature_count"], "feature_refs": assignment["feature_refs"]}:
            errors.append("coverage:values")
    evidence = packet_evidence(records)
    certifications = result.get("feature_certifications")
    if not isinstance(certifications, list):
        errors.append("feature_certifications:not_array")
        certifications = []
    refs: list[str] = []
    for index, feature in enumerate(certifications):
        label = f"feature:{index}"
        if not exact_keys(feature, FEATURE_KEYS, label, errors):
            continue
        ref = feature.get("provisional_feature_ref")
        refs.append(ref)
        expected = evidence.get(ref)
        if expected is None:
            errors.append(f"{label}:foreign_feature")
            continue
        if feature.get("source_row_sha256") != expected["source_row_sha256"]:
            errors.append(f"{label}:source_row_sha256")
        binding_values = expected["research_binding"]
        if feature.get("research_result_file_sha256") != binding_values[0]:
            errors.append(f"{label}:research_result_file_sha256")
        if feature.get("research_record_sha256") != binding_values[1]:
            errors.append(f"{label}:research_record_sha256")
        disposition = feature.get("certification_disposition")
        if disposition not in DISPOSITIONS or not isinstance(feature.get("disposition_rationale"), str) or not feature["disposition_rationale"].strip():
            errors.append(f"{label}:disposition")
        overall_deltas = feature.get("overall_spec_deltas")
        if not strings(overall_deltas, unique=True):
            errors.append(f"{label}:overall_spec_deltas")
        if disposition in {"gap_confirmed", "contradiction", "blocked_insufficient_evidence"} and not overall_deltas:
            errors.append(f"{label}:missing_failure_spec_delta")
        research = feature.get("research_applicability")
        if exact_keys(research, RESEARCH_KEYS, f"{label}:research", errors):
            if research.get("state") not in {"applicable", "weak", "misapplied", "insufficient", "not_applicable"} or not isinstance(research.get("rationale"), str) or not research["rationale"].strip() or not isinstance(research.get("browsing_performed"), bool):
                errors.append(f"{label}:research_applicability")
            source_urls = {source_id: url for source_id, url in expected["direct_sources"]}
            claim_by_id = {claim_id: (claim, source_ids) for claim_id, claim, source_ids, _ in expected["supported_claims"]}
            claims = research.get("claims_used")
            if not isinstance(claims, list):
                errors.append(f"{label}:claims_not_array")
                claims = []
            for c_index, claim in enumerate(claims):
                c_label = f"{label}:claim:{c_index}"
                if not exact_keys(claim, CLAIM_KEYS, c_label, errors):
                    continue
                claim_id = claim.get("claim_id")
                prior = claim_by_id.get(claim_id)
                urls = claim.get("source_urls")
                if prior is None or claim.get("claim") != prior[0] or not strings(urls, nonempty=True, unique=True):
                    errors.append(f"{c_label}:unsupported_research_claim")
                elif set(urls) != {source_urls[source_id] for source_id in prior[1]} or any(not URL_RE.match(url) for url in urls):
                    errors.append(f"{c_label}:source_mapping")
                if not isinstance(claim.get("evidence_label"), str) or not claim["evidence_label"].strip():
                    errors.append(f"{c_label}:evidence_label")
        dimensions = feature.get("dimensions")
        if not isinstance(dimensions, dict) or set(dimensions) != set(DIMENSIONS):
            errors.append(f"{label}:dimensions")
            dimensions = {}
        for dimension_name in DIMENSIONS:
            dimension = dimensions.get(dimension_name)
            d_label = f"{label}:dimension:{dimension_name}"
            if not exact_keys(dimension, DIMENSION_KEYS, d_label, errors):
                continue
            state = dimension.get("disposition")
            rationale = dimension.get("rationale")
            scenarios = dimension.get("scenarios")
            criteria = dimension.get("acceptance_criteria")
            deltas = dimension.get("spec_deltas")
            if state not in DISPOSITIONS or not isinstance(rationale, str) or not rationale.strip():
                errors.append(f"{d_label}:disposition_or_rationale")
            if not strings(scenarios, unique=True) or not isinstance(criteria, list) or not strings(deltas, unique=True):
                errors.append(f"{d_label}:collections")
            if state != "not_applicable_dimension" and (not scenarios or not criteria):
                errors.append(f"{d_label}:missing_scenario_or_executable_criteria")
            if state in {"gap_confirmed", "contradiction", "blocked_insufficient_evidence"} and not deltas:
                errors.append(f"{d_label}:missing_failure_spec_delta")
            for a_index, criterion in enumerate(criteria or []):
                a_label = f"{d_label}:criterion:{a_index}"
                if not exact_keys(criterion, CRITERION_KEYS, a_label, errors):
                    continue
                if not isinstance(criterion.get("criterion"), str) or not criterion["criterion"].strip() or not strings(criterion.get("observables"), nonempty=True) or not strings(criterion.get("evidence_artifacts"), nonempty=True):
                    errors.append(f"{a_label}:criterion_observable_evidence")
                oracle = criterion.get("oracle")
                if not exact_keys(oracle, ORACLE_KEYS, f"{a_label}:oracle", errors) or any(not isinstance(oracle.get(key), str) or not oracle[key].strip() for key in ORACLE_KEYS):
                    errors.append(f"{a_label}:oracle")
        candidates = feature.get("newly_discovered_candidates")
        if not isinstance(candidates, list):
            errors.append(f"{label}:candidates")
        else:
            for c_index, candidate in enumerate(candidates):
                c_label = f"{label}:candidate:{c_index}"
                if not exact_keys(candidate, CANDIDATE_KEYS, c_label, errors):
                    continue
                if candidate.get("candidate_type") not in {"missing_feature", "missing_tool", "missing_system"} or any(not isinstance(candidate.get(key), str) or not candidate[key].strip() for key in ("title", "rationale")) or (candidate.get("owner_domain_hint") is not None and not isinstance(candidate.get("owner_domain_hint"), str)):
                    errors.append(f"{c_label}:values")
    if len(refs) != len(set(refs)):
        errors.append("feature_certifications:duplicate_feature")
    if refs != assignment["feature_refs"]:
        errors.append("feature_certifications:coverage_mismatch")
    attestation = result.get("self_attestation")
    if exact_keys(attestation, ATTESTATION_KEYS, "self_attestation", errors) and any(attestation.get(key) is not True for key in ATTESTATION_KEYS):
        errors.append("self_attestation:not_all_true")
    return sorted(set(errors))


def validate(cohort_id: str | None) -> dict[str, Any]:
    manifest = load_jsonl(NAMESPACE / "batch_manifest.jsonl")
    if cohort_id is not None:
        manifest = [row for row in manifest if row.get("cohort_id") == cohort_id]
        if len(manifest) != 8:
            return {"status": "fail", "cohort_id": cohort_id, "errors": ["cohort:not_exactly_eight_assignments"]}
    receipts: list[dict[str, Any]] = []
    rows: list[dict[str, Any]] = []
    for assignment in manifest:
        aid = assignment["assignment_id"]
        intent_path = NAMESPACE / "dispatch" / aid / ATTEMPT_ID / "dispatch_intent.json"
        receipt_path = intent_path.with_name("dispatch_receipt.json")
        errors: list[str] = []
        if not intent_path.is_file() or not receipt_path.is_file():
            rows.append({"assignment_id": aid, "state": "rejected", "errors": ["intent_or_receipt_missing"]})
            continue
        intent, receipt = load_obj(intent_path), load_obj(receipt_path)
        receipts.append(receipt)
        errors.extend(receipt_errors(receipt, assignment, intent_path, intent))
        packet_path = Path(intent["packet_ref"])
        packet = load_obj(packet_path)
        records = decode_packet_features(packet)
        errors.extend(packet_size_errors(len(packet_path.read_bytes())))
        errors.extend(packet_domain_errors(packet, records))
        errors.extend(packet_record_errors(records))
        output = Path(intent["output_directory"])
        files = sorted(path for path in output.iterdir() if path.is_file()) if output.is_dir() else []
        errors.extend(output_file_errors([path.name for path in files]))
        if len(files) == 1 and files[0].name == "result.json":
            try:
                errors.extend(result_errors(json.loads(files[0].read_text(encoding="utf-8")), assignment, receipt, records))
            except Exception as exc:
                errors.append(f"result:parse:{type(exc).__name__}")
        rows.append({"assignment_id": aid, "state": "eligible" if not errors else "rejected", "errors": sorted(set(errors))})
    set_errors = receipt_set_errors([row["assignment_id"] for row in manifest], receipts)
    counts = Counter(row["state"] for row in rows)
    expected = 8 if cohort_id else 32
    return {"audit_id": AUDIT_ID, "validator": "scenario_adversarial_postrun_v1", "wave_id": WAVE_ID,
            "cohort_id": cohort_id or "all-cohorts", "status": "pass" if counts["eligible"] == expected and not set_errors else "fail",
            "receipt_set_errors": set_errors, "counts": {"assignments": len(manifest), "eligible": counts["eligible"], "rejected": counts["rejected"]}, "results": rows}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cohort-id", choices=[f"cohort-{index:04d}" for index in range(1, 5)])
    args = parser.parse_args()
    report = validate(args.cohort_id)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
