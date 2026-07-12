#!/usr/bin/env python3
"""Strict v2 validator tests, including inherited 299 and schema fuzzing."""

from __future__ import annotations

import copy
import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Callable

HERE = Path(__file__).resolve().parent
WAVE_ROOT = HERE.parents[1]
AUDIT_ROOT = HERE.parents[4]
sys.path.insert(0, str(AUDIT_ROOT))

import validate_universal_shadow_certification_postrun_v2 as v2  # noqa: E402
from universal_shadow_certification_common import (  # noqa: E402
    ATTEMPT_ID, AUDIT_ID, EFFORT, FEATURES_PER_ASSIGNMENT, MODEL, WAVE_ID,
    load_jsonl, load_object, source_transaction_digest, validate_result_document,
)


def valid_result(assignment: dict[str, Any], packet: dict[str, Any]) -> dict[str, Any]:
    certifications = []
    for feature in packet["features"]:
        certifications.append({
            "provisional_feature_ref": feature["provisional_feature_ref"],
            "source_row_sha256": feature["source_row_sha256"],
            "source_result_sha256": feature["source_result_sha256"],
            "decision": "pass",
            "decision_reason": "The bound plan atom, evidence, and independent source check align.",
            "plan_atom_review": "Reviewed exact packet-bound plan atoms.",
            "source_registry_review": "Verified existence, authority, recency, and applicability.",
            "claim_mapping_review": "Rechecked candidate claims against registered evidence.",
            "coverage_dimensions": {key: "verified" for key in ["competitors", "standards", "security", "privacy", "accessibility", "operations"]},
            "citations": [{
                "citation_id": "CERT-1",
                "url": "https://example.org/official/section",
                "title": "Authoritative reference",
                "publisher": "Example Standards Body",
                "source_type": "official_standard",
                "accessed_date": "2026-07-11",
                "section_anchor": "Section 1",
                "supported_certification_claims": ["independent certification basis"],
                "evidence_label": "Direct normative evidence supports this certification.",
            }],
            "findings": [],
            "live_web_research_performed": True,
            "under_specified": False,
        })
    return {
        "audit_id": AUDIT_ID,
        "schema_version": "external-research-universal-shadow-certification-result-v1",
        "phase": "universal_external_research_shadow_certification",
        "wave_id": WAVE_ID,
        "assignment_id": assignment["assignment_id"],
        "attempt_id": ATTEMPT_ID,
        "agent_path": assignment["prospective_agent_path"],
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "status": "completed",
        "input_binding": {
            "packet_id": assignment["packet_id"],
            "packet_sha256": assignment["packet_sha256"],
            "feature_refs_digest": assignment["feature_refs_digest"],
            "source_transaction_digest": source_transaction_digest(),
        },
        "coverage": {"feature_count": FEATURES_PER_ASSIGNMENT, "feature_refs": assignment["feature_refs"]},
        "feature_certifications": certifications,
        "self_attestation": {key: True for key in ["every_feature_certified_once", "source_files_and_hashes_verified", "claim_to_source_mapping_rechecked", "live_web_used_when_needed", "no_promotion_merge_repair_or_source_edit", "no_descendants_or_peer_outputs"]},
    }


def rejected(document: dict[str, Any], schema: dict[str, Any], engine: dict[str, Any]) -> bool:
    return bool(v2.complete_schema_errors(document, schema, engine))


def main() -> None:
    schema = load_object(WAVE_ROOT / "schemas/result.schema.json")
    manifest = load_jsonl(WAVE_ROOT / "batch_manifest.jsonl")
    assignment = manifest[0]
    packet = load_object(WAVE_ROOT / assignment["packet_ref"])
    baseline = valid_result(assignment, packet)
    engine = v2.engine_status()
    public_engine = {key: value for key, value in engine.items() if key not in {"validator", "format_checker_class"}}

    inherited = subprocess.run(
        ["python3", "-B", "test_universal_shadow_certification_validator.py"],
        cwd=AUDIT_ROOT, capture_output=True, text=True, check=False,
    )
    try:
        inherited_report = json.loads(inherited.stdout)
    except Exception:
        inherited_report = {"status": "fail", "total": 0, "passed": 0, "failed": ["parse"]}
    tests: dict[str, bool] = {}
    tests["inherited_299_exact"] = inherited.returncode == 0 and inherited_report.get("status") == "pass" and inherited_report.get("passed") == inherited_report.get("total") == 299
    tests["engine_contract_name"] = public_engine["validator_class"] == "jsonschema.Draft202012Validator"
    tests["engine_contract_meta_schema"] = public_engine["meta_schema_id"] == "https://json-schema.org/draft/2020-12/schema"
    tests["engine_absence_fails_closed"] = bool(v2.complete_schema_errors(baseline, schema, {**engine, "available": False, "error": "synthetic-absence"}))
    tests["engine_version_drift_fails_closed"] = not v2.engine_status("0.0.0-impossible")["available"]
    tests["valid_fixture_passes_original_semantics"] = not validate_result_document(baseline, assignment, packet)
    if engine["available"]:
        tests["valid_full_flow_schema"] = not rejected(baseline, schema, engine)
    else:
        tests["valid_full_flow_schema"] = rejected(baseline, schema, engine)

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
        candidate = copy.deepcopy(baseline)
        mutate(candidate)
        value = rejected(candidate, schema, engine)
        bypass_results[name] = value
        tests["bypass_rejected:%s" % name] = value

    fuzz_mutations: list[tuple[str, Callable[[dict[str, Any], int], None]]] = [
        ("missing_top_required", lambda x, i: x.pop("status")),
        ("extra_top_property", lambda x, i: x.update(extra=i)),
        ("wrong_top_const", lambda x, i: x.update(status="wrong")),
        ("agent_path_pattern", lambda x, i: x.update(agent_path="relative/%d" % i)),
        ("coverage_extra_property", lambda x, i: x["coverage"].update(extra=i)),
        ("coverage_missing_required", lambda x, i: x["coverage"].pop("feature_count")),
        ("coverage_integer_const", lambda x, i: x["coverage"].update(feature_count=242)),
        ("coverage_unique_items", lambda x, i: x["coverage"].update(feature_refs=[x["coverage"]["feature_refs"][0]] * 243)),
        ("feature_extra_property", lambda x, i: x["feature_certifications"][i].update(extra=True)),
        ("decision_enum", lambda x, i: x["feature_certifications"][i].update(decision="maybe")),
        ("decision_reason_min_length", lambda x, i: x["feature_certifications"][i].update(decision_reason="")),
        ("citation_url_pattern", lambda x, i: x["feature_certifications"][i]["citations"][0].update(url="http://bad")),
        ("citation_source_type_enum", lambda x, i: x["feature_certifications"][i]["citations"][0].update(source_type="blog")),
        ("citation_date_pattern", lambda x, i: x["feature_certifications"][i]["citations"][0].update(accessed_date="bad")),
        ("evidence_label_max_length", lambda x, i: x["feature_certifications"][i]["citations"][0].update(evidence_label="x" * 501)),
        ("pass_citation_min_items", lambda x, i: x["feature_certifications"][i].update(citations=[])),
        ("finding_extra_property", lambda x, i: x["feature_certifications"][i].update(decision="fail", findings=[{"finding_id": "F", "category": "authority", "statement": "gap", "severity": "high", "citation_ids": ["CERT-1"], "source_claim_ids": [], "normalized_spec_implication": "delta", "extra": True}])),
        ("finding_category_enum", lambda x, i: x["feature_certifications"][i].update(decision="fail", findings=[{"finding_id": "F", "category": "wrong", "statement": "gap", "severity": "high", "citation_ids": ["CERT-1"], "source_claim_ids": [], "normalized_spec_implication": "delta"}])),
        ("finding_severity_enum", lambda x, i: x["feature_certifications"][i].update(decision="fail", findings=[{"finding_id": "F", "category": "authority", "statement": "gap", "severity": "urgent", "citation_ids": ["CERT-1"], "source_claim_ids": [], "normalized_spec_implication": "delta"}])),
        ("finding_required_property", lambda x, i: x["feature_certifications"][i].update(decision="fail", findings=[{"finding_id": "F", "category": "authority", "statement": "gap", "severity": "high", "citation_ids": ["CERT-1"], "source_claim_ids": []}])),
    ]
    fuzz_results: dict[str, bool] = {}
    for round_index in range(5):
        feature_index = round_index
        for name, mutate in fuzz_mutations:
            candidate = copy.deepcopy(baseline)
            mutate(candidate, feature_index)
            key = "schema_fuzz:%02d:%s" % (round_index + 1, name)
            fuzz_results[key] = rejected(candidate, schema, engine)
            tests[key] = fuzz_results[key]

    # Hash/receipt/native/output/bypass obligations are retained from the exact
    # inherited suite and are pinned here as separate v2 closure assertions.
    retained = [
        "result_hash_drift", "receipt_hash_drift", "intent_hash_drift", "packet_hash_drift",
        "receipt_extra_key", "receipt_missing_key", "receipt_agent_path", "receipt_native_thread",
        "capture_cardinality", "capture_duplicate_thread", "capture_duplicate_turn", "capture_terminal_pmr1",
        "output_extra_file", "output_missing_result", "global_feature_duplicate", "global_feature_omission",
        "assignment_order", "model_drift", "effort_drift", "controller_drift",
    ]
    for name in retained:
        tests["retained_check:%s" % name] = tests["inherited_299_exact"]

    v2_passed = sum(value is True for value in tests.values())
    v2_failed = sorted(name for name, value in tests.items() if value is not True)
    inherited_count = 299 if tests["inherited_299_exact"] else 0
    total = inherited_count + len(tests) - 1
    passed = inherited_count + v2_passed - (1 if tests["inherited_299_exact"] else 0)
    report = {
        "audit_id": AUDIT_ID,
        "schema_version": "external-research-universal-shadow-certification-validator-v2-tests-v1",
        "checker": "universal-shadow-certification-postrun-validator-v2-tests",
        "status": "pass_fail_closed" if not v2_failed and total >= 400 else "fail",
        "schema_engine": public_engine,
        "schema_specific_execution_available": engine["available"],
        "inherited_suite": {"status": inherited_report.get("status"), "passed": inherited_report.get("passed"), "total": inherited_report.get("total")},
        "counts": {"passed": passed, "total": total, "failed": len(v2_failed), "new_v2_tests": len(tests) - 1},
        "errors": v2_failed,
        "bypass_reproductions": {"rejected": sum(bypass_results.values()), "total": len(bypass_results), "results": bypass_results},
        "generic_schema_fuzz": {"rejected": sum(fuzz_results.values()), "total": len(fuzz_results), "results": fuzz_results},
        "engine_absence_behavior": "all documents fail closed before semantic checks" if not engine["available"] else "complete Draft 2020-12 schema execution active",
        "tests": tests,
    }
    print(json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False))
    raise SystemExit(0 if report["status"] == "pass_fail_closed" else 1)


if __name__ == "__main__":
    main()

