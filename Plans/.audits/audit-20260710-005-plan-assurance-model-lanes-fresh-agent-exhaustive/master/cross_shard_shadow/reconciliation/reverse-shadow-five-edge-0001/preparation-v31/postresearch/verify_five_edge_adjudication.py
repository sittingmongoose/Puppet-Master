#!/usr/bin/env python3
"""Fail-closed cross-field verifier for targeted research and five-edge adjudication."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from jsonschema import Draft202012Validator

HERE = Path(__file__).resolve().parent
PREP = HERE.parent
AUDIT = PREP.parents[4]
RESEARCH_SCHEMA_PATH = PREP / "research/targeted_research_result.schema.json"
ADJUDICATION_SCHEMA_PATH = HERE / "five_edge_adjudication.schema.json"
EDGE_REGISTRY_PATH = PREP / "edge_registry.jsonl"
FEATURE_REGISTRY_PATH = PREP / "feature_registry.jsonl"
PROTECTED_INPUTS_PATH = PREP / "protected_inputs.json"
RESEARCH_MANIFEST_PATH = PREP / "research/manifest.jsonl"

EXPECTED_RESEARCH_ASSIGNMENTS = ["A005RSR-0001", "A005RSR-0002"]
EXPECTED_EDGE_IDS = [f"RSQ-{number:04d}" for number in range(1, 6)]
TARGET_BY_ASSIGNMENT = {"A005RSR-0001": "RSQ-0003", "A005RSR-0002": "RSQ-0005"}
PACKET_BY_ASSIGNMENT = {"A005RSR-0001": "RSRPKT-0001", "A005RSR-0002": "RSRPKT-0002"}
STRONG_SOURCE_TIERS = {"official_standard", "official_product_documentation", "peer_reviewed", "mature_open_source"}
DECISIVE_RESEARCH_STATES = {"supports_same", "supports_distinct"}
DISTINCT_DISPOSITIONS = {"dependency_or_interface_seam", "shared_subsystem_distinct", "unsupported_candidate"}
SEAM_TO_ADJUDICATION = {
    "same_feature_merge": "same_feature_merge_recommended",
    "dependency_or_interface_seam": "dependency_or_interface_seam",
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest_json(value: Any) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def schema_errors(document: dict[str, Any], schema_path: Path, prefix: str) -> list[str]:
    schema = load(schema_path)
    validator = Draft202012Validator(schema)
    return [
        f"{prefix}:schema:{'/'.join(str(part) for part in error.absolute_path)}:{error.message}"
        for error in sorted(validator.iter_errors(document), key=lambda item: (list(item.absolute_path), item.message))
    ]


def canonical_url(url: str) -> str | None:
    if not isinstance(url, str) or any(character.isspace() for character in url):
        return None
    parsed = urlsplit(url)
    if parsed.scheme != "https" or not parsed.netloc or parsed.path in ("", "/"):
        return None
    host = parsed.netloc.lower()
    path = parsed.path.lower()
    if "search" in host or path.startswith("/search") or path.startswith("/results"):
        return None
    filtered = [(key, value) for key, value in parse_qsl(parsed.query, keep_blank_values=True) if not key.lower().startswith("utm_")]
    return urlunsplit(("https", host, parsed.path, urlencode(filtered), ""))


def packets() -> dict[str, dict[str, Any]]:
    return {
        assignment: load(PREP / f"research/packets/{PACKET_BY_ASSIGNMENT[assignment]}.json")
        for assignment in EXPECTED_RESEARCH_ASSIGNMENTS
    }


def edge_registry() -> dict[str, dict[str, Any]]:
    return {row["edge_id"]: row for row in jsonl(EDGE_REGISTRY_PATH)}


def expected_research_input_binding(packet: dict[str, Any]) -> dict[str, str]:
    edge = edge_registry()[packet["target_edge"]["edge_id"]]
    return {
        "packet_sha256": sha(PREP / f"research/packets/{packet['packet_id']}.json"),
        "edge_registry_sha256": sha(EDGE_REGISTRY_PATH),
        "feature_registry_sha256": sha(FEATURE_REGISTRY_PATH),
        "protected_inputs_sha256": sha(PROTECTED_INPUTS_PATH),
        "seam_result_sha256": edge["seam"]["result_sha256"],
        "reverse_shadow_result_sha256": edge["reverse_shadow"]["result_sha256"],
        "five_edge_digest_sha256": "4073116b8855d02324e0d471130e36284779d6fa500853372fc3bbe055813796",
    }


def validate_research_result(document: dict[str, Any], packet: dict[str, Any]) -> list[str]:
    assignment = packet["assignment_id"]
    edge_id = packet["target_edge"]["edge_id"]
    errors = schema_errors(document, RESEARCH_SCHEMA_PATH, assignment)
    if document.get("assignment_id") != assignment or document.get("packet_id") != packet["packet_id"]:
        errors.append(f"{assignment}:identity-scope")
    if document.get("input_binding") != expected_research_input_binding(packet):
        errors.append(f"{assignment}:input-binding")
    if document.get("edge_scope") != {
        "edge_id": edge_id,
        "normalized_edge_id": packet["target_edge"]["normalized_edge_id"],
        "normalized_edge_key": packet["target_edge"]["normalized_edge_key"],
        "endpoint_refs": packet["target_edge"]["endpoint_refs"],
        "missing_axes": packet["target_edge"]["missing_axes"],
    }:
        errors.append(f"{assignment}:edge-scope")
    if document.get("research_questions") != packet["research_questions"]:
        errors.append(f"{assignment}:question-membership-or-order")

    questions = packet["research_questions"]
    question_ids = [row["question_id"] for row in questions]
    if len(set(question_ids)) != 3:
        errors.append(f"{assignment}:packet-question-uniqueness")

    sources = document.get("source_registry", [])
    claims = document.get("claim_registry", [])
    coverage = document.get("question_coverage", [])
    assessments = document.get("axis_assessments", [])
    source_by_id = {row.get("source_id"): row for row in sources if isinstance(row, dict)}
    claim_by_id = {row.get("claim_id"): row for row in claims if isinstance(row, dict)}
    if len(source_by_id) != len(sources):
        errors.append(f"{assignment}:duplicate-source-id")
    if len(claim_by_id) != len(claims):
        errors.append(f"{assignment}:duplicate-claim-id")

    canonical_urls: list[str] = []
    for source in sources:
        source_id = source.get("source_id", "<missing>")
        observed = canonical_url(source.get("url"))
        declared = source.get("canonical_url")
        if observed is None:
            errors.append(f"{assignment}:source:{source_id}:non-direct-https")
        elif declared != observed or source.get("url") != declared:
            errors.append(f"{assignment}:source:{source_id}:canonical-url")
        if source.get("target_edge_ids") != [edge_id]:
            errors.append(f"{assignment}:source:{source_id}:edge-scope")
        canonical_urls.append(declared)
    if len(set(canonical_urls)) != len(canonical_urls):
        errors.append(f"{assignment}:duplicate-canonical-url")

    source_consumers = {source_id: set() for source_id in source_by_id}
    claim_question_consumers = {claim_id: set() for claim_id in claim_by_id}
    claim_axis_consumers = {claim_id: set() for claim_id in claim_by_id}
    for claim in claims:
        claim_id = claim.get("claim_id", "<missing>")
        if claim.get("edge_ids") != [edge_id]:
            errors.append(f"{assignment}:claim:{claim_id}:edge-scope")
        for source_id in claim.get("source_ids", []):
            if source_id not in source_by_id:
                errors.append(f"{assignment}:claim:{claim_id}:unknown-source:{source_id}")
            else:
                source_consumers[source_id].add(claim_id)
        for question_id in claim.get("question_ids", []):
            if question_id not in question_ids:
                errors.append(f"{assignment}:claim:{claim_id}:unknown-question:{question_id}")

    coverage_ids = [row.get("question_id") for row in coverage if isinstance(row, dict)]
    if coverage_ids != question_ids or len(set(coverage_ids)) != 3:
        errors.append(f"{assignment}:question-coverage-membership-or-order")
    for row in coverage:
        question_id = row.get("question_id", "<missing>")
        claim_ids = row.get("claim_ids", [])
        if row.get("status") == "no_authoritative_evidence" and claim_ids:
            errors.append(f"{assignment}:question:{question_id}:no-evidence-has-claims")
        if row.get("status") in {"answered", "partially_answered"} and not claim_ids:
            errors.append(f"{assignment}:question:{question_id}:answered-without-claims")
        for claim_id in claim_ids:
            if claim_id not in claim_by_id:
                errors.append(f"{assignment}:question:{question_id}:unknown-claim:{claim_id}")
            else:
                claim_question_consumers[claim_id].add(question_id)

    expected_axes = packet["target_edge"]["missing_axes"]
    assessment_axes = [row.get("axis_id") for row in assessments if isinstance(row, dict)]
    if assessment_axes != expected_axes or len(set(assessment_axes)) != len(expected_axes):
        errors.append(f"{assignment}:axis-assessment-membership-or-order")
    for assessment in assessments:
        axis_id = assessment.get("axis_id", "<missing>")
        claim_ids = assessment.get("claim_ids", [])
        state = assessment.get("evidence_state")
        for claim_id in claim_ids:
            if claim_id not in claim_by_id:
                errors.append(f"{assignment}:axis:{axis_id}:unknown-claim:{claim_id}")
            else:
                claim_axis_consumers[claim_id].add(axis_id)
                if axis_id not in claim_by_id[claim_id].get("axis_ids", []):
                    errors.append(f"{assignment}:axis:{axis_id}:claim-axis-mismatch:{claim_id}")
        if state in DECISIVE_RESEARCH_STATES:
            organizations = {
                source_by_id[source_id]["publisher_organization"]
                for claim_id in claim_ids if claim_id in claim_by_id
                for source_id in claim_by_id[claim_id].get("source_ids", []) if source_id in source_by_id
            }
            tiers = {
                source_by_id[source_id]["source_tier"]
                for claim_id in claim_ids if claim_id in claim_by_id
                for source_id in claim_by_id[claim_id].get("source_ids", []) if source_id in source_by_id
            }
            if len(organizations) < 2:
                errors.append(f"{assignment}:axis:{axis_id}:decisive-below-two-independent-publishers")
            if not tiers.intersection(STRONG_SOURCE_TIERS):
                errors.append(f"{assignment}:axis:{axis_id}:decisive-without-strong-source")
        if state == "insufficient" and claim_ids:
            # Context may exist, but claims used to decide the missing axis may not masquerade as sufficient.
            for claim_id in claim_ids:
                if claim_by_id.get(claim_id, {}).get("evidence_class") == "direct_support":
                    errors.append(f"{assignment}:axis:{axis_id}:insufficient-with-direct-support-claim")

    for source_id, consumers in source_consumers.items():
        if not consumers:
            errors.append(f"{assignment}:orphan-source:{source_id}")
    for claim_id in claim_by_id:
        if not claim_question_consumers[claim_id]:
            errors.append(f"{assignment}:orphan-claim-question:{claim_id}")
        if not claim_axis_consumers[claim_id]:
            errors.append(f"{assignment}:orphan-claim-axis:{claim_id}")
    return sorted(set(errors))


def validate_adjudication(
    document: dict[str, Any],
    research_documents: dict[str, dict[str, Any]],
    research_result_hashes: dict[str, str] | None = None,
    verification_hashes: dict[str, str] | None = None,
) -> list[str]:
    errors = schema_errors(document, ADJUDICATION_SCHEMA_PATH, "adjudication")
    research_result_hashes = research_result_hashes or {assignment: digest_json(value) for assignment, value in research_documents.items()}
    verification_hashes = verification_hashes or {assignment: "0" * 64 for assignment in research_documents}
    if sorted(research_documents) != EXPECTED_RESEARCH_ASSIGNMENTS:
        errors.append("adjudication:research-result-exact-two-set")
    packet_map = packets()
    for assignment in EXPECTED_RESEARCH_ASSIGNMENTS:
        if assignment in research_documents:
            errors.extend(validate_research_result(research_documents[assignment], packet_map[assignment]))

    expected_input = {
        "protected_inputs_sha256": sha(PROTECTED_INPUTS_PATH),
        "edge_registry_sha256": sha(EDGE_REGISTRY_PATH),
        "feature_registry_sha256": sha(FEATURE_REGISTRY_PATH),
        "research_manifest_sha256": sha(RESEARCH_MANIFEST_PATH),
        "reverse_shadow_primary_sha256": "c3370ecaeacfdfb2437633f95e343a322e5e6249a057d2a14743b04c2ffc863d",
        "reverse_shadow_luna_sha256": "8956c7a16b39d3c5fe4878dd64aff7b416ef3350c7f75e4fdb2c2fd85ab82c68",
        "seam_ledger_sha256": "6ebfdbd97df06dc4060421f8845d32de4fc3edc81d57a1765144986193a2925b",
        "seam_exact64_checkpoint_sha256": "f6d3fd1087c8dec7e35cfae26374605d31b342df3b945603986194598f9ee809",
        "five_edge_digest_sha256": "4073116b8855d02324e0d471130e36284779d6fa500853372fc3bbe055813796",
    }
    if document.get("input_binding") != expected_input:
        errors.append("adjudication:input-binding")

    bindings = document.get("research_result_bindings", [])
    for index, assignment in enumerate(EXPECTED_RESEARCH_ASSIGNMENTS):
        if index >= len(bindings):
            continue
        expected_binding = {
            "assignment_id": assignment,
            "packet_id": PACKET_BY_ASSIGNMENT[assignment],
            "edge_id": TARGET_BY_ASSIGNMENT[assignment],
            "result_sha256": research_result_hashes.get(assignment),
            "verification_sha256": verification_hashes.get(assignment),
            "status": "verified_blocked_no_authoritative_evidence"
            if research_documents.get(assignment, {}).get("status") == "blocked_no_authoritative_evidence"
            else "verified_candidate_only",
        }
        if bindings[index] != expected_binding:
            errors.append(f"adjudication:research-binding:{assignment}")

    edges = edge_registry()
    rows = document.get("adjudications", [])
    row_ids = [row.get("edge_id") for row in rows if isinstance(row, dict)]
    if row_ids != EXPECTED_EDGE_IDS or len(set(row_ids)) != 5:
        errors.append("adjudication:edge-membership-or-order")

    claims_by_assignment = {
        assignment: {claim["claim_id"]: claim for claim in research_documents.get(assignment, {}).get("claim_registry", [])}
        for assignment in EXPECTED_RESEARCH_ASSIGNMENTS
    }
    assessment_by_assignment = {
        assignment: {assessment["axis_id"]: assessment for assessment in research_documents.get(assignment, {}).get("axis_assessments", [])}
        for assignment in EXPECTED_RESEARCH_ASSIGNMENTS
    }
    for row in rows:
        edge_id = row.get("edge_id", "<missing>")
        edge = edges.get(edge_id)
        if not edge:
            continue
        axis_findings = row.get("axis_findings", {})
        assessments = [value.get("assessment") for value in axis_findings.values() if isinstance(value, dict)]
        disposition = row.get("disposition")
        if disposition == "same_feature_merge_recommended" and any(value != "same" for value in assessments):
            errors.append(f"adjudication:{edge_id}:same-feature-with-non-same-axis")
        if disposition in DISTINCT_DISPOSITIONS and "different" not in assessments:
            errors.append(f"adjudication:{edge_id}:distinct-without-different-axis")
        if disposition == "remain_quarantined_insufficient_evidence" and "insufficient" not in assessments:
            errors.append(f"adjudication:{edge_id}:quarantine-without-insufficient-axis")
        if disposition == "conflict_requires_plan_revision" and not ({"different", "insufficient"} & set(assessments)):
            errors.append(f"adjudication:{edge_id}:conflict-without-difference-or-insufficiency")

        seam_candidate = edge["seam"]["candidate_decision"]
        mapped = SEAM_TO_ADJUDICATION.get(seam_candidate)
        deviation = row.get("deviation_from_seam_candidate", {})
        if mapped:
            differs = disposition != mapped
            if deviation.get("deviates") is not differs:
                errors.append(f"adjudication:{edge_id}:deviation-flag")
            if differs and not deviation.get("rationale"):
                errors.append(f"adjudication:{edge_id}:deviation-rationale")
            if not differs and deviation.get("rationale") is not None:
                errors.append(f"adjudication:{edge_id}:spurious-deviation-rationale")

        research_assignment = edge["targeted_research"]["assignment_id"]
        row_claim_ids = set(row.get("external_claim_ids", []))
        for axis in axis_findings.values():
            if isinstance(axis, dict):
                row_claim_ids.update(axis.get("external_claim_ids", []))
        if research_assignment is None:
            if row_claim_ids:
                errors.append(f"adjudication:{edge_id}:foreign-targeted-claims")
        else:
            known_claims = claims_by_assignment.get(research_assignment, {})
            unknown = row_claim_ids - set(known_claims)
            if unknown:
                errors.append(f"adjudication:{edge_id}:unknown-targeted-claims:{','.join(sorted(unknown))}")
            research_document = research_documents.get(research_assignment, {})
            if research_document.get("status") == "blocked_no_authoritative_evidence" and disposition != "remain_quarantined_insufficient_evidence":
                errors.append(f"adjudication:{edge_id}:blocked-research-used-for-decisive-disposition")
            for missing_axis in edge["reverse_shadow"]["missing_axes"]:
                research_axis = assessment_by_assignment.get(research_assignment, {}).get(missing_axis, {})
                if research_axis.get("evidence_state") not in DECISIVE_RESEARCH_STATES and disposition != "remain_quarantined_insufficient_evidence":
                    errors.append(f"adjudication:{edge_id}:missing-axis-not-closed:{missing_axis}")
                if axis_findings.get(missing_axis, {}).get("assessment") == "insufficient" and disposition != "remain_quarantined_insufficient_evidence":
                    errors.append(f"adjudication:{edge_id}:decisive-with-insufficient-axis:{missing_axis}")

    return sorted(set(errors))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--adjudication", type=Path, required=True)
    parser.add_argument("--research-result", action="append", default=[], help="ASSIGNMENT_ID=PATH")
    parser.add_argument("--research-verification", action="append", default=[], help="ASSIGNMENT_ID=PATH")
    args = parser.parse_args()

    result_paths = dict(item.split("=", 1) for item in args.research_result)
    verification_paths = dict(item.split("=", 1) for item in args.research_verification)
    research_documents = {assignment: load(Path(path)) for assignment, path in result_paths.items()}
    result_hashes = {assignment: sha(Path(path)) for assignment, path in result_paths.items()}
    verification_hashes = {assignment: sha(Path(path)) for assignment, path in verification_paths.items()}
    adjudication = load(args.adjudication)
    errors = validate_adjudication(adjudication, research_documents, result_hashes, verification_hashes)
    report = {
        "schema_version": "reverse-shadow-five-edge-adjudication-verification-v31-v1",
        "status": "pass_blocked_pending_fresh_independent_luna" if not errors else "fail_closed",
        "activation": False,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
        "errors": errors,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
