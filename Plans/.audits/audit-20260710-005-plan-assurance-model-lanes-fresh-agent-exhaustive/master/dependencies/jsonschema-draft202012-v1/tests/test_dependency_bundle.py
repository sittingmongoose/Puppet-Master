#!/usr/bin/env python3
"""Strict isolated Draft 2020-12 dependency tests (no network)."""

from __future__ import annotations

import copy
import hashlib
import json
import sys
from pathlib import Path
from typing import Any, Callable

from jsonschema import Draft202012Validator, FormatChecker


BUNDLE = Path(__file__).resolve().parents[1]
SCHEMA_PATH = BUNDLE.parents[2] / "master/external_research/universal-shadow-certification-wave-0001/schemas/result.schema.json"
FIXTURE_PATH = BUNDLE / "fixtures/known-good-result.json"


def digest(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def rejected(document: Any, validator: Draft202012Validator) -> bool:
    return any(True for _ in validator.iter_errors(document))


def main() -> None:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    fixture = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    tests: dict[str, bool] = {}

    Draft202012Validator.check_schema(schema)
    tests["draft202012_check_schema_passes"] = True
    tests["known_good_full_fixture_valid"] = not rejected(fixture, validator)
    tests["known_good_assignment_id"] = fixture.get("assignment_id") == "A005ERSC-0001"
    tests["known_good_feature_count"] = len(fixture.get("feature_certifications", [])) == 243
    tests["known_good_schema_version"] = fixture.get("schema_version") == "external-research-universal-shadow-certification-result-v1"
    tests["known_good_additional_properties_closed"] = not rejected(fixture, validator)

    bypasses: list[tuple[str, Callable[[dict[str, Any]], None]]] = [
        ("malformed_accessed_date", lambda x: x["feature_certifications"][0]["citations"][0].update(accessed_date="July 11")),
        ("overlong_evidence_label", lambda x: x["feature_certifications"][0]["citations"][0].update(evidence_label="x" * 501)),
        ("duplicate_supported_certification_claims", lambda x: x["feature_certifications"][0]["citations"][0].update(supported_certification_claims=["x", "x"])),
        ("empty_supported_certification_claim_string", lambda x: x["feature_certifications"][0]["citations"][0].update(supported_certification_claims=[""])),
        ("nonstring_supported_certification_claim", lambda x: x["feature_certifications"][0]["citations"][0].update(supported_certification_claims=[7])),
        ("nonstring_citation_id", lambda x: x["feature_certifications"][0]["citations"][0].update(citation_id=7)),
        ("nonboolean_live_web_research_performed", lambda x: x["feature_certifications"][0].update(live_web_research_performed="yes")),
        ("nonboolean_under_specified", lambda x: x["feature_certifications"][0].update(under_specified=0)),
        ("extra_coverage_key", lambda x: x["coverage"].update(extra=True)),
        ("nonstring_finding_id", lambda x: x["feature_certifications"][0].update(decision="fail", findings=[{"finding_id": 7, "category": "authority", "statement": "gap", "severity": "high", "citation_ids": ["CERT-1"], "source_claim_ids": [], "normalized_spec_implication": "Add the missing authority contract."}])),
        ("duplicate_finding_citation_ids", lambda x: x["feature_certifications"][0].update(decision="fail", findings=[{"finding_id": "F-1", "category": "authority", "statement": "gap", "severity": "high", "citation_ids": ["CERT-1", "CERT-1"], "source_claim_ids": [], "normalized_spec_implication": "Add the missing authority contract."}])),
        ("duplicate_finding_source_claim_ids", lambda x: x["feature_certifications"][0].update(decision="fail", findings=[{"finding_id": "F-1", "category": "authority", "statement": "gap", "severity": "high", "citation_ids": ["CERT-1"], "source_claim_ids": ["CLAIM-1", "CLAIM-1"], "normalized_spec_implication": "Add the missing authority contract."}])),
    ]
    bypass_results: dict[str, bool] = {}
    for name, mutate in bypasses:
        candidate = copy.deepcopy(fixture)
        mutate(candidate)
        value = rejected(candidate, validator)
        bypass_results[name] = value
        tests[f"bypass_rejected:{name}"] = value

    basic_mutations: list[tuple[str, Callable[[dict[str, Any]], None]]] = [
        ("required_missing_audit_id", lambda x: x.pop("audit_id")),
        ("required_missing_schema_version", lambda x: x.pop("schema_version")),
        ("required_missing_status", lambda x: x.pop("status")),
        ("required_missing_input_binding", lambda x: x.pop("input_binding")),
        ("required_missing_coverage", lambda x: x.pop("coverage")),
        ("required_missing_feature_certifications", lambda x: x.pop("feature_certifications")),
        ("required_missing_self_attestation", lambda x: x.pop("self_attestation")),
        ("additional_top_property", lambda x: x.update(extra=True)),
        ("additional_coverage_property", lambda x: x["coverage"].update(extra=True)),
        ("additional_feature_property", lambda x: x["feature_certifications"][0].update(extra=True)),
        ("additional_citation_property", lambda x: x["feature_certifications"][0]["citations"][0].update(extra=True)),
        ("additional_attestation_property", lambda x: x["self_attestation"].update(extra=True)),
        ("wrong_audit_const", lambda x: x.update(audit_id="wrong")),
        ("wrong_schema_const", lambda x: x.update(schema_version="wrong")),
        ("wrong_phase_const", lambda x: x.update(phase="wrong")),
        ("wrong_wave_const", lambda x: x.update(wave_id="wrong")),
        ("wrong_attempt_const", lambda x: x.update(attempt_id="attempt-0002")),
        ("wrong_model_const", lambda x: x.update(model="gpt-5.6-luna")),
        ("wrong_effort_const", lambda x: x.update(reasoning_effort="max")),
        ("wrong_status_const", lambda x: x.update(status="failed")),
        ("wrong_assignment_type", lambda x: x.update(assignment_id=7)),
        ("agent_path_pattern", lambda x: x.update(agent_path="relative/path")),
        ("coverage_feature_count_const", lambda x: x["coverage"].update(feature_count=242)),
        ("coverage_feature_count_type", lambda x: x["coverage"].update(feature_count="243")),
        ("coverage_feature_refs_type", lambda x: x["coverage"].update(feature_refs="not-array")),
        ("coverage_feature_refs_min_items", lambda x: x["coverage"].update(feature_refs=[])),
        ("coverage_feature_refs_max_items", lambda x: x["coverage"].update(feature_refs=x["coverage"]["feature_refs"] + ["extra"])),
        ("coverage_feature_refs_unique_items", lambda x: x["coverage"].update(feature_refs=[x["coverage"]["feature_refs"][0]] * 243)),
        ("input_binding_packet_type", lambda x: x["input_binding"].update(packet_id=7)),
        ("input_binding_packet_pattern", lambda x: x["input_binding"].update(packet_id="wrong")),
        ("input_binding_hash_pattern", lambda x: x["input_binding"].update(packet_sha256="not-a-hash")),
        ("input_binding_extra", lambda x: x["input_binding"].update(extra=True)),
        ("feature_missing_ref", lambda x: x["feature_certifications"][0].pop("provisional_feature_ref")),
        ("feature_ref_min_length", lambda x: x["feature_certifications"][0].update(provisional_feature_ref="")),
        ("feature_source_row_pattern", lambda x: x["feature_certifications"][0].update(source_row_sha256="bad")),
        ("feature_source_result_pattern", lambda x: x["feature_certifications"][0].update(source_result_sha256="bad")),
        ("feature_decision_enum", lambda x: x["feature_certifications"][0].update(decision="maybe")),
        ("feature_decision_reason_min_length", lambda x: x["feature_certifications"][0].update(decision_reason="")),
        ("feature_plan_atom_min_length", lambda x: x["feature_certifications"][0].update(plan_atom_review="")),
        ("feature_source_registry_min_length", lambda x: x["feature_certifications"][0].update(source_registry_review="")),
        ("feature_claim_mapping_min_length", lambda x: x["feature_certifications"][0].update(claim_mapping_review="")),
        ("feature_live_web_type", lambda x: x["feature_certifications"][0].update(live_web_research_performed=1)),
        ("feature_under_specified_type", lambda x: x["feature_certifications"][0].update(under_specified="false")),
        ("citation_url_pattern", lambda x: x["feature_certifications"][0]["citations"][0].update(url="http://bad")),
        ("citation_url_type", lambda x: x["feature_certifications"][0]["citations"][0].update(url=7)),
        ("citation_title_min_length", lambda x: x["feature_certifications"][0]["citations"][0].update(title="")),
        ("citation_publisher_min_length", lambda x: x["feature_certifications"][0]["citations"][0].update(publisher="")),
        ("citation_source_type_enum", lambda x: x["feature_certifications"][0]["citations"][0].update(source_type="blog")),
        ("citation_accessed_date_pattern", lambda x: x["feature_certifications"][0]["citations"][0].update(accessed_date="bad")),
        ("citation_section_min_length", lambda x: x["feature_certifications"][0]["citations"][0].update(section_anchor="")),
        ("citation_claims_min_items", lambda x: x["feature_certifications"][0]["citations"][0].update(supported_certification_claims=[])),
        ("citation_claims_unique_items", lambda x: x["feature_certifications"][0]["citations"][0].update(supported_certification_claims=["x", "x"])),
        ("citation_evidence_min_length", lambda x: x["feature_certifications"][0]["citations"][0].update(evidence_label="")),
        ("citation_evidence_max_length", lambda x: x["feature_certifications"][0]["citations"][0].update(evidence_label="x" * 501)),
        ("citation_missing_required", lambda x: x["feature_certifications"][0]["citations"][0].pop("citation_id")),
        ("citations_type", lambda x: x["feature_certifications"][0].update(citations="bad")),
        ("pass_citations_min_items", lambda x: x["feature_certifications"][0].update(citations=[])),
        ("findings_type", lambda x: x["feature_certifications"][0].update(findings="bad")),
        ("self_attestation_missing_required", lambda x: x["self_attestation"].pop("every_feature_certified_once")),
        ("self_attestation_const_false", lambda x: x["self_attestation"].update(every_feature_certified_once=False)),
        ("self_attestation_type", lambda x: x["self_attestation"].update(no_descendants_or_peer_outputs="true")),
    ]
    for name, mutate in basic_mutations:
        candidate = copy.deepcopy(fixture)
        mutate(candidate)
        tests[f"schema_rejected:{name}"] = rejected(candidate, validator)

    # Repeat representative boundary mutations over independent feature rows.
    repeated_mutations: list[tuple[str, Callable[[dict[str, Any], int], None]]] = [
        ("feature_extra_property", lambda x, i: x["feature_certifications"][i].update(extra=True)),
        ("feature_decision_enum", lambda x, i: x["feature_certifications"][i].update(decision="maybe")),
        ("feature_decision_reason_min", lambda x, i: x["feature_certifications"][i].update(decision_reason="")),
        ("feature_source_row_pattern", lambda x, i: x["feature_certifications"][i].update(source_row_sha256="bad")),
        ("citation_date_pattern", lambda x, i: x["feature_certifications"][i]["citations"][0].update(accessed_date="bad")),
        ("citation_url_pattern", lambda x, i: x["feature_certifications"][i]["citations"][0].update(url="http://bad")),
        ("citation_evidence_max", lambda x, i: x["feature_certifications"][i]["citations"][0].update(evidence_label="x" * 501)),
        ("citation_claims_unique", lambda x, i: x["feature_certifications"][i]["citations"][0].update(supported_certification_claims=["x", "x"])),
        ("citation_claims_min", lambda x, i: x["feature_certifications"][i]["citations"][0].update(supported_certification_claims=[])),
        ("feature_live_web_type", lambda x, i: x["feature_certifications"][i].update(live_web_research_performed="yes")),
        ("feature_under_specified_type", lambda x, i: x["feature_certifications"][i].update(under_specified=0)),
        ("feature_missing_review", lambda x, i: x["feature_certifications"][i].pop("claim_mapping_review")),
        ("feature_citation_min", lambda x, i: x["feature_certifications"][i].update(citations=[])),
        ("feature_findings_type", lambda x, i: x["feature_certifications"][i].update(findings="bad")),
        ("feature_plan_atom_type", lambda x, i: x["feature_certifications"][i].update(plan_atom_review=7)),
        ("feature_registry_type", lambda x, i: x["feature_certifications"][i].update(source_registry_review=7)),
        ("feature_claim_map_type", lambda x, i: x["feature_certifications"][i].update(claim_mapping_review=7)),
        ("feature_decision_reason_type", lambda x, i: x["feature_certifications"][i].update(decision_reason=7)),
        ("feature_ref_type", lambda x, i: x["feature_certifications"][i].update(provisional_feature_ref=7)),
        ("feature_source_hash_type", lambda x, i: x["feature_certifications"][i].update(source_row_sha256=7)),
        ("citation_id_type", lambda x, i: x["feature_certifications"][i]["citations"][0].update(citation_id=7)),
        ("citation_title_type", lambda x, i: x["feature_certifications"][i]["citations"][0].update(title=7)),
        ("citation_publisher_type", lambda x, i: x["feature_certifications"][i]["citations"][0].update(publisher=7)),
    ]
    for round_index in range(3):
        for name, mutate in repeated_mutations:
            candidate = copy.deepcopy(fixture)
            mutate(candidate, round_index)
            tests[f"repeated_schema_boundary:{round_index + 1:02d}:{name}"] = rejected(candidate, validator)

    format_validator = Draft202012Validator({"type": "string", "format": "date"}, format_checker=FormatChecker())
    tests["format_valid_date_passes"] = not rejected("2026-07-11", format_validator)
    tests["format_invalid_date_rejected"] = rejected("July 11", format_validator)
    tests["format_wrong_type_rejected"] = rejected(7, format_validator)
    tests["format_empty_date_rejected"] = rejected("", format_validator)

    failures = sorted(name for name, value in tests.items() if value is not True)
    report = {
        "checker": "jsonschema-draft202012-isolated-strict-tests",
        "status": "pass" if not failures and len(tests) >= 100 else "fail",
        "counts": {"passed": len(tests) - len(failures), "total": len(tests), "failed": len(failures)},
        "errors": failures,
        "bypass_reproductions": {"rejected": sum(bypass_results.values()), "total": len(bypass_results), "results": bypass_results},
        "test_digest": digest(tests),
        "tests": tests,
        "validator": "jsonschema.Draft202012Validator",
        "format_checker": "jsonschema.FormatChecker",
        "schema_sha256": hashlib.sha256(SCHEMA_PATH.read_bytes()).hexdigest(),
        "fixture_sha256": hashlib.sha256(FIXTURE_PATH.read_bytes()).hexdigest(),
    }
    print(json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
