#!/usr/bin/env python3
"""1024 substantive positive and fail-closed cases for attempt-0003 V32."""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.metadata
import json
import os
import sys
from pathlib import Path
from typing import Any, Callable

sys.dont_write_bytecode = True
from jsonschema import Draft202012Validator

import attempt3_common as common
import preflight_attempt3_v32 as preflight

CaseFn = Callable[[], bool]
CASES: list[tuple[str, str, str, CaseFn, set[str]]] = []
FIXTURES: dict[str, dict[str, Any]] = {}


def add(category: str, polarity: str, name: str, function: CaseFn, families: set[str] | None = None) -> None:
    case_id = f"{category}:{polarity}:{name}"
    CASES.append((category, polarity, case_id, function, families or set()))


def has(errors: list[str], fragment: str) -> bool:
    return any(fragment in error for error in errors)


def certified(candidate: dict[str, Any]) -> dict[str, Any]:
    return candidate["feature_certifications"][0]


def blocked(candidate: dict[str, Any]) -> dict[str, Any]:
    return candidate["feature_certifications"][1]


def register_positive_cases() -> None:
    for assignment_id in common.ASSIGNMENTS:
        add(
            "validator_clean_packet_shapes", "positive", assignment_id,
            lambda assignment_id=assignment_id: preflight.result_errors(copy.deepcopy(FIXTURES[assignment_id]), assignment_id) == [],
        )


def register_per_feature_dimension_cases() -> None:
    global_index = 0
    for assignment_id in common.ASSIGNMENTS:
        fixture = FIXTURES[assignment_id]
        for feature_index, certification in enumerate(fixture["feature_certifications"]):
            dimension = common.DIMENSIONS[global_index % len(common.DIMENSIONS)]
            feature_ref = certification["provisional_feature_ref"]
            semantic_family = f"base:feature:<feature>:missing-dimension:{dimension}"
            schema_family = f"base:schema:feature:<feature>:dimensions:missing:{dimension}"

            def run(assignment_id=assignment_id, feature_index=feature_index, dimension=dimension, feature_ref=feature_ref) -> bool:
                candidate = copy.deepcopy(FIXTURES[assignment_id])
                del candidate["feature_certifications"][feature_index]["dimensions"][dimension]
                projected = preflight.compatibility_projection(candidate, assignment_id)
                errors = ["frozen:" + error for error in preflight.frozen_module().result_errors(projected, assignment_id)]
                return has(errors, f"frozen:base:feature:{feature_ref}:missing-dimension:{dimension}") and has(errors, f"dimensions:'{dimension}' is a required property")

            add("per_feature_required_dimension_fail_closed", "negative", f"{assignment_id}:{feature_index}:{dimension}", run, {semantic_family, schema_family})
            global_index += 1
    assert global_index == 687


def register_question_coverage_cases() -> None:
    pools = {assignment_id: list(enumerate(FIXTURES[assignment_id]["feature_certifications"])) for assignment_id in common.ASSIGNMENTS}
    selected: list[tuple[str, int, dict[str, Any]]] = []
    offset = 0
    while len(selected) < 200:
        assignment_id = common.ASSIGNMENTS[offset % len(common.ASSIGNMENTS)]
        feature_index, certification = pools[assignment_id].pop(0)
        selected.append((assignment_id, feature_index, certification))
        offset += 1
    for assignment_id, feature_index, certification in selected:
        feature_ref = certification["provisional_feature_ref"]
        question = common.question_obligations(assignment_id)[feature_ref][0]

        def run(assignment_id=assignment_id, feature_index=feature_index, feature_ref=feature_ref, question=question) -> bool:
            candidate = copy.deepcopy(FIXTURES[assignment_id])
            scenarios = candidate["feature_certifications"][feature_index]["dimensions"][question["required_dimension"]]["scenarios"]
            index = next(position for position, scenario in enumerate(scenarios) if scenario.startswith(question["required_scenario_prefix"]))
            scenarios[index] = f"A replacement scenario preserves aggregate count but omits the mapped question for {feature_ref}."
            errors = preflight.result_errors(candidate, assignment_id)
            return has(errors, f"attempt3-question-mapping:{feature_ref}:{question['question_id']}")

        add("question_scenario_coverage_fail_closed", "negative", f"{assignment_id}:{feature_index}:{question['question_id']}", run)
    assert len(selected) == 200 and {row[0] for row in selected} == set(common.ASSIGNMENTS)


def target_variants() -> list[str]:
    variants = [
        "coverage_missing_feature_count", "coverage_missing_feature_refs", "coverage_extra",
        "input_missing_candidate_evidence_label", "input_missing_packet_sha256", "input_extra",
        "dimensions_extra", "duplicate_registrable_domain", "canonical_url",
        "input_missing_feature_refs_digest", "input_missing_packet_id", "base_claim_projection",
        "certified_below_threshold", "duplicate_authority_id", "insufficient_must_block",
        "missing_concrete_blocked_dimension", "source_registrable_domain",
        "true_schema_version", "true_attempt_id", "true_task_thread_id",
        "question_mapping_removed", "question_mapping_text_changed", "projection_nonmask_oracle",
        "frozen_insufficient_scenario_count",
        "oracle_equal", "source_non_https", "source_private_ip", "duplicate_canonical_url",
        "duplicate_source_id", "no_evidence_one_attempt", "no_evidence_with_reference",
        "retrieval_status", "retrieval_http_status", "retrieval_content_hash", "claim_unregistered_source",
    ]
    variants.extend("self_missing:" + key for key in common.SELF_ATTESTATION_KEYS)
    variants.append("self_extra")
    return variants


def mutate_target(candidate: dict[str, Any], variant: str) -> tuple[list[str], set[str]]:
    families: set[str] = set()
    if variant == "coverage_missing_feature_count":
        del candidate["coverage"]["feature_count"]
        families = {"base:coverage", "base:schema:coverage:missing:feature_count"}
        fragments = ["frozen:base:coverage", "coverage:'feature_count' is a required property"]
    elif variant == "coverage_missing_feature_refs":
        del candidate["coverage"]["feature_refs"]
        families = {"base:coverage", "base:schema:coverage:missing:feature_refs"}
        fragments = ["frozen:base:coverage", "coverage:'feature_refs' is a required property"]
    elif variant == "coverage_extra":
        candidate["coverage"]["unexpected_contract_key"] = True
        families = {"base:schema:coverage:additional-properties"}
        fragments = ["coverage:Additional properties are not allowed"]
    elif variant == "input_missing_candidate_evidence_label":
        del candidate["input_binding"]["candidate_evidence_label"]
        families = {"base:input-binding:candidate_evidence_label", "base:schema:input_binding:missing:candidate_evidence_label"}
        fragments = ["frozen:base:input-binding:candidate_evidence_label", "input_binding:'candidate_evidence_label' is a required property"]
    elif variant == "input_missing_packet_sha256":
        del candidate["input_binding"]["packet_sha256"]
        families = {"base:input-binding:packet_sha256", "base:schema:input_binding:missing:packet_sha256"}
        fragments = ["frozen:base:input-binding:packet_sha256", "input_binding:'packet_sha256' is a required property"]
    elif variant == "input_extra":
        candidate["input_binding"]["unexpected_contract_key"] = True
        families = {"base:schema:input_binding:additional-properties"}
        fragments = ["input_binding:Additional properties are not allowed"]
    elif variant.startswith("self_missing:"):
        key = variant.split(":", 1)[1]
        del candidate["self_attestation"][key]
        families = {f"base:schema:self_attestation:missing:{key}"}
        fragments = [f"self_attestation:'{key}' is a required property"]
    elif variant == "self_extra":
        candidate["self_attestation"]["unexpected_contract_key"] = True
        families = {"base:schema:self_attestation:additional-properties"}
        fragments = ["self_attestation:Additional properties are not allowed"]
    elif variant == "dimensions_extra":
        blocked(candidate)["dimensions"]["unexpected_dimension"] = copy.deepcopy(blocked(candidate)["dimensions"][common.DIMENSIONS[0]])
        families = {"base:schema:feature:<feature>:dimensions:additional-properties"}
        fragments = ["dimensions:Additional properties are not allowed"]
    elif variant == "duplicate_registrable_domain":
        cert = certified(candidate)
        source = cert["source_registry"][1]
        source["url"] = source["canonical_url"] = source["retrieval"]["final_url"] = "https://standards.w3.org/independent-authority"
        source["registrable_domain"] = "w3.org"
        cert["research_applicability"]["claims_used"][1]["source_urls"] = [source["url"]]
        families = {"feature:<feature>:duplicate-registrable-domain"}
        fragments = ["duplicate-registrable-domain"]
    elif variant == "canonical_url":
        certified(candidate)["source_registry"][0]["canonical_url"] = "https://www.w3.org/wrong-canonical"
        families = {"feature:<feature>:source:<source>:canonical-url"}
        fragments = [":source:0:canonical-url"]
    elif variant == "input_missing_feature_refs_digest":
        del candidate["input_binding"]["feature_refs_digest"]
        families = {"base:input-binding:feature_refs_digest", "base:schema:input_binding:missing:feature_refs_digest"}
        fragments = ["frozen:base:input-binding:feature_refs_digest", "input_binding:'feature_refs_digest' is a required property"]
    elif variant == "input_missing_packet_id":
        del candidate["input_binding"]["packet_id"]
        families = {"base:input-binding:packet_id", "base:schema:input_binding:missing:packet_id"}
        fragments = ["frozen:base:input-binding:packet_id", "input_binding:'packet_id' is a required property"]
    elif variant == "base_claim_projection":
        certified(candidate)["research_applicability"]["claims_used"][0]["claim"] = "A deliberately divergent projected claim for fail-closed validation."
        families = {"feature:<feature>:base-claim-projection"}
        fragments = ["base-claim-projection"]
    elif variant == "certified_below_threshold":
        cert = certified(candidate)
        cert["source_registry"] = cert["source_registry"][:1]
        cert["claim_support"] = cert["claim_support"][:1]
        cert["research_applicability"]["claims_used"] = cert["research_applicability"]["claims_used"][:1]
        families = {"feature:<feature>:certified-below-live-independent-authority-threshold"}
        fragments = ["certified-below-live-independent-authority-threshold"]
    elif variant == "duplicate_authority_id":
        cert = certified(candidate)
        cert["source_registry"][1]["authority_id"] = cert["source_registry"][0]["authority_id"]
        families = {"feature:<feature>:duplicate-authority-id"}
        fragments = ["duplicate-authority-id"]
    elif variant == "insufficient_must_block":
        blocked(candidate)["certification_disposition"] = "certified"
        families = {"feature:<feature>:insufficient-evidence-must-block"}
        fragments = ["insufficient-evidence-must-block"]
    elif variant == "missing_concrete_blocked_dimension":
        for dimension in blocked(candidate)["dimensions"].values():
            dimension["scenarios"] = []
            dimension["acceptance_criteria"] = []
            dimension["spec_deltas"] = []
        families = {"feature:<feature>:missing-concrete-blocked-dimension"}
        fragments = ["missing-concrete-blocked-dimension"]
    elif variant == "source_registrable_domain":
        certified(candidate)["source_registry"][0]["registrable_domain"] = "invalid.example"
        families = {"feature:<feature>:source:<source>:registrable-domain"}
        fragments = [":source:0:registrable-domain"]
    elif variant == "true_schema_version":
        candidate["schema_version"] = "scenario-adversarial-semantic-repair-result-v31-v1"
        fragments = ["attempt3-binding:schema_version"]
    elif variant == "true_attempt_id":
        candidate["attempt_id"] = "attempt-0002"
        fragments = ["attempt3-binding:attempt_id"]
    elif variant == "true_task_thread_id":
        candidate["task_thread_id"] = "/root/sol_controller_v29/wrong-attempt3-thread"
        fragments = ["attempt3-binding:task_thread_id"]
    elif variant in {"question_mapping_removed", "question_mapping_text_changed"}:
        assignment_id = candidate["assignment_id"]
        mapping = common.question_obligations(assignment_id)
        feature_ref = candidate["feature_certifications"][0]["provisional_feature_ref"]
        question = mapping[feature_ref][0]
        scenarios = candidate["feature_certifications"][0]["dimensions"][question["required_dimension"]]["scenarios"]
        offset = next(index for index, scenario in enumerate(scenarios) if scenario.startswith(question["required_scenario_prefix"]))
        if variant == "question_mapping_removed":
            scenarios.pop(offset)
        else:
            scenarios[offset] = scenarios[offset].replace(question["question"], "A different question text that preserves only aggregate scenario count.", 1)
        fragments = [f"attempt3-question-mapping:{feature_ref}:{question['question_id']}"]
    elif variant == "projection_nonmask_oracle":
        oracle = blocked(candidate)["dimensions"][common.DIMENSIONS[0]]["acceptance_criteria"][0]["oracle"]
        oracle["fail"] = oracle["pass"]
        fragments = ["frozen:base:feature:", "nonfalsifiable-oracle"]
    elif variant == "frozen_insufficient_scenario_count":
        for dimension in blocked(candidate)["dimensions"].values():
            dimension["scenarios"] = []
        families = {"base:feature:<feature>:insufficient-question-scenario-coverage"}
        fragments = ["insufficient-question-scenario-coverage"]
    elif variant == "oracle_equal":
        oracle = blocked(candidate)["dimensions"][common.DIMENSIONS[0]]["acceptance_criteria"][0]["oracle"]
        oracle["fail"] = oracle["pass"]
        fragments = ["nonfalsifiable-oracle"]
    elif variant == "source_non_https":
        certified(candidate)["source_registry"][0]["url"] = "http://www.w3.org/TR/WCAG22/"
        fragments = [":url:non-https"]
    elif variant == "source_private_ip":
        certified(candidate)["source_registry"][0]["retrieval"]["resolved_ips"] = ["10.0.0.1"]
        fragments = [":resolved-ips[0]:non-public"]
    elif variant == "duplicate_canonical_url":
        cert = certified(candidate)
        source = cert["source_registry"][1]
        source["url"] = source["canonical_url"] = source["retrieval"]["final_url"] = cert["source_registry"][0]["url"]
        source["registrable_domain"] = cert["source_registry"][0]["registrable_domain"]
        cert["research_applicability"]["claims_used"][1]["source_urls"] = [source["url"]]
        fragments = ["duplicate-canonical-url"]
    elif variant == "duplicate_source_id":
        certified(candidate)["source_registry"][1]["source_id"] = certified(candidate)["source_registry"][0]["source_id"]
        fragments = [":source:1:duplicate-id"]
    elif variant == "no_evidence_one_attempt":
        blocked(candidate)["live_research"]["attempts"] = blocked(candidate)["live_research"]["attempts"][:1]
        fragments = ["no-evidence-needs-two-distinct-attempts"]
    elif variant == "no_evidence_with_reference":
        cert = blocked(candidate)
        cert["source_registry"] = copy.deepcopy(certified(candidate)["source_registry"])
        fragments = ["no-evidence-with-references"]
    elif variant == "retrieval_status":
        certified(candidate)["source_registry"][0]["retrieval"]["status"] = "unread"
        fragments = [":retrieval-status"]
    elif variant == "retrieval_http_status":
        certified(candidate)["source_registry"][0]["retrieval"]["http_status"] = 503
        fragments = [":http-status"]
    elif variant == "retrieval_content_hash":
        certified(candidate)["source_registry"][0]["retrieval"]["content_sha256"] = "bad"
        fragments = [":content_sha256"]
    elif variant == "claim_unregistered_source":
        certified(candidate)["claim_support"][0]["source_ids"] = ["SRC-MISSING"]
        fragments = [":unregistered-source:SRC-MISSING"]
    else:
        raise AssertionError("unknown-target-variant:" + variant)
    return fragments, families


def register_targeted_cases() -> None:
    variants = target_variants()
    for index in range(131):
        assignment_id = common.ASSIGNMENTS[index % len(common.ASSIGNMENTS)]
        variant = variants[index % len(variants)]
        probe = copy.deepcopy(FIXTURES[assignment_id])
        fragments, families = mutate_target(probe, variant)

        def run(assignment_id=assignment_id, variant=variant, fragments=tuple(fragments)) -> bool:
            candidate = copy.deepcopy(FIXTURES[assignment_id])
            expected, _ = mutate_target(candidate, variant)
            if tuple(expected) != fragments:
                return False
            if variant.startswith("true_") or variant.startswith("question_mapping_") or variant == "projection_nonmask_oracle":
                errors = preflight.result_errors(candidate, assignment_id)
            else:
                projected = preflight.compatibility_projection(candidate, assignment_id)
                errors = ["frozen:" + error for error in preflight.frozen_module().result_errors(projected, assignment_id)]
            return bool(errors) and all(has(errors, fragment) for fragment in fragments)

        add("observed_and_contract_family_mutations", "negative", f"{index:04d}:{assignment_id}:{variant}", run, families)


def write_report(report: dict[str, Any]) -> None:
    common.write_json(common.TEST_REPORT, report)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-report", action="store_true")
    args = parser.parse_args()
    global FIXTURES
    FIXTURES = {assignment_id: common.load(common.fixture_path(assignment_id)) for assignment_id in common.ASSIGNMENTS}
    register_positive_cases()
    register_per_feature_dimension_cases()
    register_question_coverage_cases()
    register_targeted_cases()
    matrix = common.load(common.TEST_MATRIX)
    results: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []
    covered_families: set[str] = set()
    for category, polarity, case_id, function, families in CASES:
        try:
            passed = function() is True
            detail = ""
        except Exception as exc:
            passed = False
            detail = type(exc).__name__ + ":" + str(exc)
        results.append({"case_id": case_id, "category": category, "polarity": polarity, "passed": passed})
        if passed:
            covered_families.update(families)
        else:
            failures.append({"case_id": case_id, "detail": detail})
    ids = [row["case_id"] for row in results]
    category_counts: dict[str, dict[str, int]] = {}
    for row in results:
        counts = category_counts.setdefault(row["category"], {"positive": 0, "negative": 0, "total": 0})
        counts[row["polarity"]] += 1
        counts["total"] += 1
    expected_counts = {row["category"]: {"positive": row["positive"], "negative": row["negative"], "total": row["total"]} for row in matrix["categories"]}
    observed_document = common.load(common.ERROR_FAMILIES)
    required_families = {row["family"] for row in observed_document["shared"] + observed_document["assignment_specific"]}
    contract_failures = []
    if len(ids) != len(set(ids)) or len(ids) != matrix["expected_total"] or category_counts != expected_counts:
        contract_failures.append("matrix-count-or-identity")
    missing_families = sorted(required_families - covered_families)
    if missing_families:
        contract_failures.append("observed-family-coverage:" + ",".join(missing_families))
    runtime = {
        "python_version": ".".join(str(value) for value in sys.version_info[:3]),
        "python_executable": sys.executable,
        "jsonschema_version": importlib.metadata.version("jsonschema"),
        "validator_class": f"{Draft202012Validator.__module__}.{Draft202012Validator.__name__}",
        "pythonpath": os.environ.get("PYTHONPATH"),
        "no_site": bool(sys.flags.no_site), "no_user_site": bool(sys.flags.no_user_site), "dont_write_bytecode": bool(sys.flags.dont_write_bytecode),
    }
    if runtime["python_version"] != "3.12.13" or runtime["jsonschema_version"] != "4.26.0" or runtime["validator_class"] != "jsonschema.validators.Draft202012Validator" or runtime["pythonpath"] != str(common.JSONSCHEMA_SITE) or not runtime["no_site"] or not runtime["no_user_site"] or not runtime["dont_write_bytecode"]:
        contract_failures.append("runtime-not-audit-pinned")
    failures.extend({"case_id": "contract", "detail": item} for item in contract_failures)
    case_digest = hashlib.sha256(("\n".join(sorted(ids)) + "\n").encode("utf-8")).hexdigest()
    passed_count = sum(1 for row in results if row["passed"])
    report = {
        "schema_version": "scenario-adversarial-attempt3-tests-v32-v1",
        "status": "pass" if not failures else "fail",
        "passed": passed_count, "total": len(results), "failed": len(results) - passed_count,
        "minimum_required": matrix["minimum_required"],
        "positive": sum(1 for row in results if row["polarity"] == "positive"),
        "negative": sum(1 for row in results if row["polarity"] == "negative"),
        "case_id_digest": case_digest,
        "category_counts": category_counts,
        "observed_family_coverage": {"required": len(required_families), "covered": len(required_families & covered_families), "missing": missing_families},
        "runtime": runtime,
        "bindings": {
            "test_source_sha256": common.file_binding(Path(__file__))["raw_sha256"],
            "preflight_source_sha256": common.file_binding(common.HERE / "preflight_attempt3_v32.py")["raw_sha256"],
            "frozen_validator_sha256": common.file_binding(common.FROZEN_VALIDATOR)["raw_sha256"],
            "fixtures": {assignment_id: common.file_binding(common.fixture_path(assignment_id))["raw_sha256"] for assignment_id in common.ASSIGNMENTS},
        },
        "failures": failures,
        "cases": results,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    if args.write_report and report["status"] == "pass":
        write_report(report)
    raise SystemExit(0 if report["status"] == "pass" and len(results) >= 900 else 1)


if __name__ == "__main__":
    main()
