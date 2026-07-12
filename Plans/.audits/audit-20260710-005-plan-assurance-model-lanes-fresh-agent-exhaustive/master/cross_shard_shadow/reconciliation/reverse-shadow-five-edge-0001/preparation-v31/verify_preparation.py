#!/usr/bin/env python3
"""Fail-closed verifier for the V31 five-edge reverse-shadow preparation.

This verifier is intentionally read-only.  A successful run means that the
preparation is internally coherent and still blocked: it does not authorize a
launch, accept a research result, grant credit, or promote an edge.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator


PREP = Path(__file__).resolve().parent
AUDIT = PREP.parents[4]
AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
RECONCILIATION_ID = "reverse-shadow-five-edge-0001"
FIVE_EDGE_DIGEST = "4073116b8855d02324e0d471130e36284779d6fa500853372fc3bbe055813796"
V31_POLICY_SHA256 = "95de3fd798c857751cc6b031d62a4a7a40abe931f9fa1e49590cff0fec6257b5"
V32_POLICY_SHA256 = "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed"

EXPECTED_FILES = {
    "IMMUTABLE_AUTHORITY.json",
    "edge_registry.jsonl",
    "feature_registry.jsonl",
    "postresearch/contract.json",
    "postresearch/five_edge_adjudication.schema.json",
    "postresearch/test_five_edge_adjudication.py",
    "postresearch/verify_five_edge_adjudication.py",
    "protected_inputs.json",
    "readiness.json",
    "research/intents/A005RSR-0001.json",
    "research/intents/A005RSR-0002.json",
    "research/leaf_prompt.json",
    "research/manifest.jsonl",
    "research/packets/RSRPKT-0001.json",
    "research/packets/RSRPKT-0002.json",
    "research/targeted_research_result.schema.json",
    "terminal_preparation_report.json",
    "test_preparation.py",
    "verify_preparation.py",
}

EXPECTED_BINDING_LABELS = {
    "model_lane_routing_policy_v2",
    "concurrent_canonical_change_policy_v1",
    "owner_active",
    "owner_provisional_feature_ledger",
    "forward_active",
    "forward_candidate_edge_ledger",
    "forward_primary_postrun",
    "reverse_shadow_primary_postrun",
    "reverse_shadow_luna_postrun",
    "reverse_shadow_luna_lifecycle",
    "reverse_shadow_pair_registry",
    "css_0002_packet",
    "css_0002_result",
    "css_0019_packet",
    "css_0019_result",
    "css_0030_packet",
    "css_0030_result",
    "seam_normalized_edge_ledger",
    "seam_exact64_checkpoint",
    "seam_repair_primary_postrun",
    "seam_repair_luna_postrun",
    "seam_0064_packet",
    "seam_0064_result",
    "seam_0036_packet",
    "seam_0036_result",
    "seam_0054_packet",
    "seam_0054_result",
    "seam_0012_packet",
    "seam_0012_result",
    "seam_0042_packet",
    "seam_0042_result",
}

EXPECTED_EDGES: list[dict[str, Any]] = [
    {
        "sequence": 1,
        "edge_id": "RSQ-0001",
        "normalized_edge_id": "A005CDS-EDGE-02944",
        "normalized_edge_key": "OPF::A005OM-0012::PF-0109\0OPF::A005OM-0015::PF-0113",
        "endpoint_refs": ["OPF::A005OM-0012::PF-0109", "OPF::A005OM-0015::PF-0113"],
        "forward_assignment": "A005CS-0014",
        "forward_decision_ref": "CSDEC::A005CS-0014::0036",
        "reverse_assignment": "A005CSS-0019",
        "reverse_decision_ref": "SHADOWDEC::A005CSS-0019::0011",
        "missing_axes": ["failure_semantics"],
        "forbidden_signals": ["broader"],
        "seam_assignment": "A005CDSV2-0064",
        "seam_packet": "CDSV2PKT-0064",
        "seam_candidate": "same_feature_merge",
        "seam_research_state": "sufficient_for_judgment",
        "research_assignment": None,
        "research_packet": None,
    },
    {
        "sequence": 2,
        "edge_id": "RSQ-0002",
        "normalized_edge_id": "A005CDS-EDGE-02995",
        "normalized_edge_key": "OPF::A005OM-0012::PF-0115\0OPF::A005OM-0014::PF-0105",
        "endpoint_refs": ["OPF::A005OM-0012::PF-0115", "OPF::A005OM-0014::PF-0105"],
        "forward_assignment": "A005CS-0011",
        "forward_decision_ref": "CSDEC::A005CS-0011::0042",
        "reverse_assignment": "A005CSS-0002",
        "reverse_decision_ref": "SHADOWDEC::A005CSS-0002::0049",
        "missing_axes": ["user_outcome"],
        "forbidden_signals": [],
        "seam_assignment": "A005CDSV2-0036",
        "seam_packet": "CDSV2PKT-0036",
        "seam_candidate": "dependency_or_interface_seam",
        "seam_research_state": "sufficient_for_judgment",
        "research_assignment": None,
        "research_packet": None,
    },
    {
        "sequence": 3,
        "edge_id": "RSQ-0003",
        "normalized_edge_id": "A005CDS-EDGE-07514",
        "normalized_edge_key": "OPF::A005OM-0016::PF-0011\0OPF::A005OM-0017::PF-0090",
        "endpoint_refs": ["OPF::A005OM-0016::PF-0011", "OPF::A005OM-0017::PF-0090"],
        "forward_assignment": "A005CS-0025",
        "forward_decision_ref": "CSDEC::A005CS-0025::0011",
        "reverse_assignment": "A005CSS-0030",
        "reverse_decision_ref": "SHADOWDEC::A005CSS-0030::0025",
        "missing_axes": ["user_outcome", "failure_semantics"],
        "forbidden_signals": [],
        "seam_assignment": "A005CDSV2-0054",
        "seam_packet": "CDSV2PKT-0054",
        "seam_candidate": "uncertain_requires_targeted_research",
        "seam_research_state": "insufficient_unresolved",
        "research_assignment": "A005RSR-0001",
        "research_packet": "RSRPKT-0001",
    },
    {
        "sequence": 4,
        "edge_id": "RSQ-0004",
        "normalized_edge_id": "A005CDS-EDGE-08033",
        "normalized_edge_key": "OPF::A005OM-0016::PF-0195\0OPF::A005OM-0017::PF-0121",
        "endpoint_refs": ["OPF::A005OM-0016::PF-0195", "OPF::A005OM-0017::PF-0121"],
        "forward_assignment": "A005CS-0027",
        "forward_decision_ref": "CSDEC::A005CS-0027::0061",
        "reverse_assignment": "A005CSS-0030",
        "reverse_decision_ref": "SHADOWDEC::A005CSS-0030::0056",
        "missing_axes": ["user_outcome", "failure_semantics"],
        "forbidden_signals": [],
        "seam_assignment": "A005CDSV2-0012",
        "seam_packet": "CDSV2PKT-0012",
        "seam_candidate": "same_feature_merge",
        "seam_research_state": "sufficient_for_judgment",
        "research_assignment": None,
        "research_packet": None,
    },
    {
        "sequence": 5,
        "edge_id": "RSQ-0005",
        "normalized_edge_id": "A005CDS-EDGE-08044",
        "normalized_edge_key": "OPF::A005OM-0016::PF-0199\0OPF::A005OM-0017::PF-0117",
        "endpoint_refs": ["OPF::A005OM-0016::PF-0199", "OPF::A005OM-0017::PF-0117"],
        "forward_assignment": "A005CS-0027",
        "forward_decision_ref": "CSDEC::A005CS-0027::0065",
        "reverse_assignment": "A005CSS-0030",
        "reverse_decision_ref": "SHADOWDEC::A005CSS-0030::0052",
        "missing_axes": ["user_outcome"],
        "forbidden_signals": [],
        "seam_assignment": "A005CDSV2-0042",
        "seam_packet": "CDSV2PKT-0042",
        "seam_candidate": "uncertain_requires_targeted_research",
        "seam_research_state": "insufficient_unresolved",
        "research_assignment": "A005RSR-0002",
        "research_packet": "RSRPKT-0002",
    },
]

EXPECTED_RESEARCH = {
    "A005RSR-0001": {
        "sequence": 1,
        "edge_id": "RSQ-0003",
        "normalized_edge_id": "A005CDS-EDGE-07514",
        "packet_id": "RSRPKT-0001",
        "identity": "/root/sol_controller_v29/a005_reverse_shadow_targeted_research_07514_ultra_v31",
        "seam_assignment": "A005CDSV2-0054",
    },
    "A005RSR-0002": {
        "sequence": 2,
        "edge_id": "RSQ-0005",
        "normalized_edge_id": "A005CDS-EDGE-08044",
        "packet_id": "RSRPKT-0002",
        "identity": "/root/sol_controller_v29/a005_reverse_shadow_targeted_research_08044_ultra_v31",
        "seam_assignment": "A005CDSV2-0042",
    },
}

REVERSE_SOURCES = ["A005CSS-0002", "A005CSS-0019", "A005CSS-0030"]
TARGET_SEAMS = ["A005CDSV2-0012", "A005CDSV2-0036", "A005CDSV2-0042", "A005CDSV2-0054", "A005CDSV2-0064"]
SEAM_REPAIRS = ["A005CDSV2-0002", "A005CDSV2-0006", "A005CDSV2-0039"]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest_json(value: Any) -> str:
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def core_from_edge(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "sequence": row.get("sequence"),
        "edge_id": row.get("edge_id"),
        "normalized_edge_id": row.get("normalized_edge_id"),
        "normalized_edge_key": row.get("normalized_edge_key"),
        "endpoint_refs": row.get("endpoint_refs"),
        "forward_assignment": row.get("forward", {}).get("assignment_id"),
        "forward_decision_ref": row.get("forward", {}).get("decision_ref"),
        "reverse_assignment": row.get("reverse_shadow", {}).get("assignment_id"),
        "reverse_decision_ref": row.get("reverse_shadow", {}).get("decision_ref"),
        "missing_axes": row.get("reverse_shadow", {}).get("missing_axes"),
        "forbidden_signals": row.get("reverse_shadow", {}).get("forbidden_signals"),
        "seam_assignment": row.get("seam", {}).get("assignment_id"),
        "seam_packet": row.get("seam", {}).get("packet_id"),
        "seam_candidate": row.get("seam", {}).get("candidate_decision"),
        "seam_research_state": row.get("seam", {}).get("research_state"),
        "research_assignment": row.get("targeted_research", {}).get("assignment_id"),
        "research_packet": row.get("targeted_research", {}).get("packet_id"),
    }


def validate_exact_edges(rows: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    if len(rows) != 5:
        errors.append(f"edge-registry:expected-5:got-{len(rows)}")
    observed = [core_from_edge(row) for row in rows]
    if observed != EXPECTED_EDGES:
        for index, expected in enumerate(EXPECTED_EDGES):
            if index >= len(observed):
                errors.append(f"edge-registry:missing:{expected['edge_id']}")
            elif observed[index] != expected:
                errors.append(f"edge-registry:core-mismatch:{expected['edge_id']}")
        for extra in observed[len(EXPECTED_EDGES):]:
            errors.append(f"edge-registry:extra:{extra.get('edge_id')}")
    edge_ids = [row.get("edge_id") for row in rows]
    keys = [row.get("normalized_edge_key") for row in rows]
    if len(set(edge_ids)) != len(edge_ids):
        errors.append("edge-registry:duplicate-edge-id")
    if len(set(keys)) != len(keys):
        errors.append("edge-registry:duplicate-edge-key")
    if digest_json(sorted(keys)) != FIVE_EDGE_DIGEST:
        errors.append("edge-registry:five-edge-digest")
    for row in rows:
        edge_id = row.get("edge_id", "<missing>")
        if row.get("endpoint_refs") != sorted(row.get("endpoint_refs", [])):
            errors.append(f"edge-registry:{edge_id}:endpoint-order")
        if row.get("normalized_edge_key") != "\0".join(row.get("endpoint_refs", [])):
            errors.append(f"edge-registry:{edge_id}:normalized-key")
        required = row.get("targeted_research", {}).get("required")
        assignment = row.get("targeted_research", {}).get("assignment_id")
        if required is not (assignment is not None):
            errors.append(f"edge-registry:{edge_id}:research-required-flag")
        if row.get("seam", {}).get("repaired_assignment") is not False:
            errors.append(f"edge-registry:{edge_id}:target-seam-marked-repaired")
        if row.get("promotion_performed") is not False:
            errors.append(f"edge-registry:{edge_id}:promotion-performed")
        if any(value != 0 for value in row.get("credits", {}).values()):
            errors.append(f"edge-registry:{edge_id}:nonzero-credit")
    return sorted(set(errors))


def validate_feature_rows(features: list[dict[str, Any]], edges: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    expected_refs = sorted({ref for edge in EXPECTED_EDGES for ref in edge["endpoint_refs"]})
    observed_refs = [row.get("provisional_feature_ref") for row in features]
    if observed_refs != expected_refs:
        errors.append("feature-registry:exact-ordered-ten-set")
    if len(features) != 10 or len(set(observed_refs)) != len(observed_refs):
        errors.append("feature-registry:unique-count-ten")
    titles = {row.get("provisional_feature_ref"): row.get("title") for row in features}
    for edge in edges:
        expected_titles = [titles.get(ref) for ref in edge.get("endpoint_refs", [])]
        if edge.get("endpoint_titles") != expected_titles or None in expected_titles:
            errors.append(f"feature-registry:title-binding:{edge.get('edge_id')}")
    return sorted(set(errors))


def validate_quarantine(rows: list[dict[str, Any]], luna: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    findings = luna.get("quarantined_uncertain_unsupported_edge_findings", [])
    finding_by_key = {row.get("edge"): row for row in findings if isinstance(row, dict)}
    expected_keys = [row["normalized_edge_key"] for row in EXPECTED_EDGES]
    if len(findings) != 5 or set(finding_by_key) != set(expected_keys):
        errors.append("luna-quarantine:exact-five-edge-set")
    by_key = {row.get("normalized_edge_key"): row for row in rows}
    for key in expected_keys:
        finding = finding_by_key.get(key)
        edge = by_key.get(key)
        if not finding or not edge:
            continue
        reverse = edge.get("reverse_shadow", {})
        if finding.get("left_ref") != edge.get("endpoint_refs", [None, None])[0]:
            errors.append(f"luna-quarantine:{edge.get('edge_id')}:left-ref")
        if finding.get("right_ref") != edge.get("endpoint_refs", [None, None])[1]:
            errors.append(f"luna-quarantine:{edge.get('edge_id')}:right-ref")
        if finding.get("missing_axes") != reverse.get("missing_axes"):
            errors.append(f"luna-quarantine:{edge.get('edge_id')}:missing-axes")
        if finding.get("forbidden_signals") != reverse.get("forbidden_signals"):
            errors.append(f"luna-quarantine:{edge.get('edge_id')}:forbidden-signals")
    if luna.get("status") != "fail_closed_semantic_quarantine":
        errors.append("luna-quarantine:status")
    if luna.get("counts", {}).get("quarantined_candidate_edges") != 5:
        errors.append("luna-quarantine:count")
    if luna.get("semantic_review", {}).get("unsupported_or_uncertain_edges_quarantined") != 5:
        errors.append("luna-quarantine:semantic-count")
    if luna.get("semantic_quarantined_assignment_ids") != REVERSE_SOURCES:
        errors.append("luna-quarantine:assignment-set")
    if luna.get("edge_promotion_performed") is not False or luna.get("promotion_credit") != 0:
        errors.append("luna-quarantine:promotion-or-credit")
    expected_report_errors = [f"quarantined_candidate_edge:{key}" for key in expected_keys]
    if luna.get("errors") != expected_report_errors:
        errors.append("luna-quarantine:error-set")
    reviews = [row for row in luna.get("candidate_semantic_reviews", []) if row.get("supportable") is False]
    review_by_key = {row.get("edge"): row for row in reviews}
    if len(reviews) != 5 or set(review_by_key) != set(expected_keys):
        errors.append("luna-quarantine:unsupported-review-set")
    axis_name = {"lifecycle_state_transition": "lifecycle_transition"}
    for key in expected_keys:
        review = review_by_key.get(key)
        finding = finding_by_key.get(key)
        edge = by_key.get(key)
        if not review or not finding or not edge:
            continue
        derived_missing = [
            axis_name.get(axis, axis)
            for axis, passed in review.get("required_axes", {}).items()
            if passed is False
        ]
        if review.get("decision") != "quarantined_uncertain" or review.get("occurrence_count") != 1:
            errors.append(f"luna-quarantine:{edge.get('edge_id')}:review-state")
        if review.get("assignment_ids") != [edge.get("reverse_shadow", {}).get("assignment_id")]:
            errors.append(f"luna-quarantine:{edge.get('edge_id')}:review-assignment")
        if derived_missing != edge.get("reverse_shadow", {}).get("missing_axes"):
            errors.append(f"luna-quarantine:{edge.get('edge_id')}:review-missing-axes")
        for field in ("left_ref", "right_ref", "reason", "forbidden_signals"):
            if review.get(field) != finding.get(field):
                errors.append(f"luna-quarantine:{edge.get('edge_id')}:review-finding-{field}")
    return sorted(set(errors))


def validate_zero_mapping(value: Any, prefix: str = "zero-state") -> list[str]:
    """Validate a declared zero-state tree without interpreting ordinary prose."""
    errors: list[str] = []
    if not isinstance(value, dict):
        return [f"{prefix}:not-object"]
    for key, item in value.items():
        path = f"{prefix}.{key}"
        if isinstance(item, dict):
            errors.extend(validate_zero_mapping(item, path))
        elif isinstance(item, bool):
            if item:
                errors.append(f"{path}:true")
        elif isinstance(item, (int, float)) and not isinstance(item, bool):
            if item != 0:
                errors.append(f"{path}:nonzero")
        else:
            errors.append(f"{path}:non-numeric")
    return errors


def resolve_audit_path(relative: str) -> Path | None:
    candidate = (AUDIT / relative).resolve()
    try:
        candidate.relative_to(AUDIT.resolve())
    except ValueError:
        return None
    return candidate


def verify_external_bindings(protected: dict[str, Any]) -> tuple[list[str], dict[str, Path]]:
    errors: list[str] = []
    paths: dict[str, Path] = {}
    bindings = protected.get("bindings", [])
    labels = [row.get("label") for row in bindings if isinstance(row, dict)]
    if set(labels) != EXPECTED_BINDING_LABELS or len(labels) != len(EXPECTED_BINDING_LABELS):
        errors.append("protected-inputs:binding-label-set")
    if len({row.get("path") for row in bindings if isinstance(row, dict)}) != len(bindings):
        errors.append("protected-inputs:duplicate-path")
    for binding in bindings:
        label = binding.get("label", "<missing>")
        path = resolve_audit_path(binding.get("path", ""))
        if path is None:
            errors.append(f"protected-inputs:{label}:path-escapes-audit")
            continue
        paths[label] = path
        if not path.is_file():
            errors.append(f"protected-inputs:{label}:missing")
        elif sha(path) != binding.get("sha256"):
            errors.append(f"protected-inputs:{label}:hash")
    for field, expected_path, expected_sha in (
        ("preparation_policy", "master/coordination/CONCURRENCY_POLICY_V31.json", V31_POLICY_SHA256),
        ("future_targeted_research_activation_policy", "master/coordination/CONCURRENCY_POLICY_V32.json", V32_POLICY_SHA256),
    ):
        row = protected.get(field, {})
        path = resolve_audit_path(row.get("path", ""))
        if row.get("path") != expected_path or row.get("sha256") != expected_sha:
            errors.append(f"protected-inputs:{field}:binding")
        if path is None or not path.is_file() or sha(path) != expected_sha:
            errors.append(f"protected-inputs:{field}:live-hash")
    if protected.get("future_targeted_research_activation_policy", {}).get("activation_authorized_here") is not False:
        errors.append("protected-inputs:v32-activation-authorized-here")
    return sorted(set(errors)), paths


def validate_identity_namespaces(protected: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    namespaces = protected.get("identity_namespaces", {})
    if namespaces.get("reverse_shadow_sources") != REVERSE_SOURCES:
        errors.append("identities:reverse-shadow-sources")
    if namespaces.get("target_seam_assignments") != TARGET_SEAMS:
        errors.append("identities:target-seams")
    if namespaces.get("seam_repair_assignments") != SEAM_REPAIRS:
        errors.append("identities:seam-repairs")
    if set(TARGET_SEAMS) & set(SEAM_REPAIRS):
        errors.append("identities:target-repair-overlap")
    if namespaces.get("full_identifier_prefixes_are_authoritative") is not True:
        errors.append("identities:full-prefix-not-authoritative")
    if namespaces.get("numeric_suffix_equivalence_forbidden") is not True:
        errors.append("identities:numeric-suffix-equivalence-not-forbidden")
    return errors


def validate_live_feature_lineage(features: list[dict[str, Any]], owner_ledger: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    owners = {row.get("provisional_feature_ref"): row for row in owner_ledger}
    exact_fields = [
        "title",
        "owner_domain",
        "risk_level",
        "source_documents",
        "source_unit_refs",
        "local_feature_refs",
        "result_ref",
        "result_sha256",
    ]
    for feature in features:
        ref = feature.get("provisional_feature_ref", "<missing>")
        owner = owners.get(ref)
        if owner is None:
            errors.append(f"feature-lineage:{ref}:missing-owner-row")
            continue
        for field in exact_fields:
            if feature.get(field) != owner.get(field):
                errors.append(f"feature-lineage:{ref}:{field}")
    return errors


def validate_forward_lineage(
    edges: list[dict[str, Any]], ledger: list[dict[str, Any]], primary: dict[str, Any]
) -> list[str]:
    errors: list[str] = []
    by_key = {"\0".join(sorted(row.get("endpoint_refs", []))): row for row in ledger}
    results = {row.get("assignment_id"): row for row in primary.get("results", [])}
    for edge in edges:
        edge_id = edge.get("edge_id", "<missing>")
        source = by_key.get(edge.get("normalized_edge_key"))
        forward = edge.get("forward", {})
        disposition = forward.get("source_disposition")
        if disposition == "merge_candidate":
            if source is None:
                errors.append(f"forward-lineage:{edge_id}:candidate-ledger-missing")
            else:
                expected = {
                    "assignment_id": source.get("assignment_id"),
                    "decision_ref": source.get("source_decision_ref"),
                    "source_disposition": "merge_candidate",
                    "result_sha256": source.get("result_sha256"),
                }
                if forward != expected:
                    errors.append(f"forward-lineage:{edge_id}:candidate-binding")
                if source.get("promotion_eligible") is not False or source.get("quarantined") is not False:
                    errors.append(f"forward-lineage:{edge_id}:candidate-unexpected-state")
        elif disposition == "related_but_distinct":
            if source is not None:
                errors.append(f"forward-lineage:{edge_id}:related-in-candidate-ledger")
        else:
            errors.append(f"forward-lineage:{edge_id}:unknown-disposition")

        report_row = results.get(forward.get("assignment_id"))
        if report_row is None:
            errors.append(f"forward-lineage:{edge_id}:primary-result-unbound")
            continue
        if report_row.get("result_sha256") != forward.get("result_sha256") or report_row.get("state") != "eligible":
            errors.append(f"forward-lineage:{edge_id}:primary-result-binding")
        result_path = resolve_audit_path(report_row.get("result_path", ""))
        if result_path is None or not result_path.is_file() or sha(result_path) != forward.get("result_sha256"):
            errors.append(f"forward-lineage:{edge_id}:live-result-hash")
            continue
        result = load(result_path)
        try:
            decision_number = int(forward.get("decision_ref", "").rsplit("::", 1)[-1])
            decision = result.get("decisions", [])[decision_number - 1]
        except (ValueError, IndexError):
            errors.append(f"forward-lineage:{edge_id}:decision-ref")
            continue
        endpoints = edge.get("endpoint_refs", [])
        anchor = decision.get("anchor_provisional_feature_ref")
        other = set(endpoints).difference({anchor})
        target_field = "merge_candidate_refs" if disposition == "merge_candidate" else "related_but_distinct_refs"
        if anchor not in endpoints or not other.issubset(set(decision.get(target_field, []))):
            errors.append(f"forward-lineage:{edge_id}:decision-membership")
    return errors


def validate_reverse_results(edges: list[dict[str, Any]], bound_paths: dict[str, Path]) -> list[str]:
    errors: list[str] = []
    result_cache: dict[str, dict[str, Any]] = {}
    for edge in edges:
        edge_id = edge.get("edge_id", "<missing>")
        reverse = edge.get("reverse_shadow", {})
        assignment = reverse.get("assignment_id", "")
        suffix = assignment.rsplit("-", 1)[-1]
        label = f"css_{suffix}_result"
        path = bound_paths.get(label)
        if path is None:
            errors.append(f"reverse-result:{edge_id}:unbound")
            continue
        result = result_cache.setdefault(label, load(path))
        try:
            decision_number = int(reverse.get("decision_ref", "").rsplit("::", 1)[-1])
            decision = result.get("decisions", [])[decision_number - 1]
        except (ValueError, IndexError):
            errors.append(f"reverse-result:{edge_id}:decision-ref")
            continue
        endpoints = edge.get("endpoint_refs", [])
        anchor = decision.get("anchor_provisional_feature_ref")
        merge_refs = decision.get("merge_candidate_refs", [])
        if anchor not in endpoints or not set(endpoints).difference({anchor}).issubset(set(merge_refs)):
            errors.append(f"reverse-result:{edge_id}:endpoint-decision")
        if sha(path) != reverse.get("result_sha256"):
            errors.append(f"reverse-result:{edge_id}:hash")
    return errors


def validate_seam_lineage(
    edges: list[dict[str, Any]], seam_ledger: list[dict[str, Any]], bound_paths: dict[str, Path]
) -> list[str]:
    errors: list[str] = []
    ledger_by_key = {row.get("normalized_edge_key"): row for row in seam_ledger}
    for edge in edges:
        edge_id = edge.get("edge_id", "<missing>")
        seam = edge.get("seam", {})
        ledger_row = ledger_by_key.get(edge.get("normalized_edge_key"))
        if ledger_row is None:
            errors.append(f"seam-lineage:{edge_id}:missing-ledger-row")
            continue
        if ledger_row.get("normalized_edge_id") != edge.get("normalized_edge_id"):
            errors.append(f"seam-lineage:{edge_id}:normalized-edge-id")
        if ledger_row.get("endpoint_refs") != edge.get("endpoint_refs"):
            errors.append(f"seam-lineage:{edge_id}:endpoint-refs")
        reverse_provenance = [
            row for row in ledger_row.get("provenance", []) if row.get("orientation") == "reverse_shadow"
        ]
        if len(reverse_provenance) != 1:
            errors.append(f"seam-lineage:{edge_id}:reverse-provenance-count")
        else:
            source = reverse_provenance[0]
            if source.get("assignment_id") != edge.get("reverse_shadow", {}).get("assignment_id"):
                errors.append(f"seam-lineage:{edge_id}:reverse-assignment")
            if source.get("source_decision_ref") != edge.get("reverse_shadow", {}).get("decision_ref"):
                errors.append(f"seam-lineage:{edge_id}:reverse-decision-ref")
            if source.get("luna_disposition") != "quarantine" or source.get("source_quarantined") is not True:
                errors.append(f"seam-lineage:{edge_id}:reverse-not-quarantined")

        suffix = seam.get("assignment_id", "").rsplit("-", 1)[-1]
        packet_path = bound_paths.get(f"seam_{suffix}_packet")
        result_path = bound_paths.get(f"seam_{suffix}_result")
        if packet_path is None or result_path is None:
            errors.append(f"seam-lineage:{edge_id}:unbound-packet-or-result")
            continue
        packet = load(packet_path)
        result = load(result_path)
        packet_rows = [row for row in packet.get("seams", []) if row.get("normalized_edge_id") == edge.get("normalized_edge_id")]
        result_rows = [row for row in result.get("decisions", []) if row.get("normalized_edge_id") == edge.get("normalized_edge_id")]
        if len(packet_rows) != 1:
            errors.append(f"seam-lineage:{edge_id}:packet-membership")
        else:
            packet_row = packet_rows[0]
            if packet_row.get("normalized_edge_key") != edge.get("normalized_edge_key"):
                errors.append(f"seam-lineage:{edge_id}:packet-key")
            if packet_row.get("endpoint_refs") != edge.get("endpoint_refs"):
                errors.append(f"seam-lineage:{edge_id}:packet-endpoints")
            if packet_row.get("quarantined") is not True:
                errors.append(f"seam-lineage:{edge_id}:packet-not-quarantined")
            reverse_rows = [row for row in packet_row.get("provenance", []) if row.get("orientation") == "reverse_shadow"]
            if len(reverse_rows) != 1:
                errors.append(f"seam-lineage:{edge_id}:packet-reverse-provenance")
            else:
                reverse_source = reverse_rows[0]
                if reverse_source.get("assignment_id") != edge.get("reverse_shadow", {}).get("assignment_id"):
                    errors.append(f"seam-lineage:{edge_id}:packet-reverse-assignment")
                if reverse_source.get("source_decision_ref") != edge.get("reverse_shadow", {}).get("decision_ref"):
                    errors.append(f"seam-lineage:{edge_id}:packet-reverse-decision")
                if reverse_source.get("source_quarantined") is not True:
                    errors.append(f"seam-lineage:{edge_id}:packet-reverse-quarantine")
        if len(result_rows) != 1:
            errors.append(f"seam-lineage:{edge_id}:result-membership")
        else:
            decision = result_rows[0]
            if decision.get("decision") != seam.get("candidate_decision"):
                errors.append(f"seam-lineage:{edge_id}:decision")
            observed_state = decision.get("external_research", {}).get("state")
            if observed_state != seam.get("research_state"):
                errors.append(f"seam-lineage:{edge_id}:research-state")
            if decision.get("promotion_performed") is not False:
                errors.append(f"seam-lineage:{edge_id}:promotion")
            if seam.get("candidate_decision") == "uncertain_requires_targeted_research":
                if not decision.get("unresolved_reason"):
                    errors.append(f"seam-lineage:{edge_id}:missing-unresolved-reason")
            elif decision.get("unresolved_reason") is not None:
                errors.append(f"seam-lineage:{edge_id}:spurious-unresolved-reason")
            if decision.get("proposed_plan_revision") is not None:
                errors.append(f"seam-lineage:{edge_id}:proposed-plan-revision")
        if packet.get("assignment_id") != seam.get("assignment_id") or packet.get("packet_id") != seam.get("packet_id"):
            errors.append(f"seam-lineage:{edge_id}:packet-identity")
        if result.get("assignment_id") != seam.get("assignment_id") or result.get("status") != "completed":
            errors.append(f"seam-lineage:{edge_id}:result-identity-or-status")
        if result.get("input_binding", {}).get("packet_id") != seam.get("packet_id"):
            errors.append(f"seam-lineage:{edge_id}:result-packet-id")
        if result.get("input_binding", {}).get("packet_sha256") != sha(packet_path):
            errors.append(f"seam-lineage:{edge_id}:result-packet-hash")
        if edge.get("normalized_edge_id") not in result.get("coverage", {}).get("normalized_edge_ids", []):
            errors.append(f"seam-lineage:{edge_id}:result-coverage")
        if sha(packet_path) != seam.get("packet_sha256") or sha(result_path) != seam.get("result_sha256"):
            errors.append(f"seam-lineage:{edge_id}:hash")
    return errors


def validate_manifest_and_packets(
    manifest: list[dict[str, Any]], edges: list[dict[str, Any]], protected_sha: str
) -> list[str]:
    errors: list[str] = []
    if [row.get("assignment_id") for row in manifest] != list(EXPECTED_RESEARCH):
        errors.append("research-manifest:exact-two-ordered-set")
    edges_by_id = {row.get("edge_id"): row for row in edges}
    schema_path = PREP / "research/targeted_research_result.schema.json"
    prompt_path = PREP / "research/leaf_prompt.json"
    for assignment, expected in EXPECTED_RESEARCH.items():
        rows = [row for row in manifest if row.get("assignment_id") == assignment]
        if len(rows) != 1:
            errors.append(f"research-manifest:{assignment}:membership")
            continue
        row = rows[0]
        packet_path = PREP / f"research/packets/{expected['packet_id']}.json"
        intent_path = PREP / f"research/intents/{assignment}.json"
        packet = load(packet_path)
        intent = load(intent_path)
        edge = edges_by_id.get(expected["edge_id"], {})
        expected_manifest = {
            "sequence": expected["sequence"],
            "packet_id": expected["packet_id"],
            "target_edge_id": expected["edge_id"],
            "normalized_edge_id": expected["normalized_edge_id"],
            "source_shadow_assignment_id": edge.get("reverse_shadow", {}).get("assignment_id"),
            "source_seam_assignment_id": expected["seam_assignment"],
            "fresh_identity_path": expected["identity"],
            "fresh_identity_state": "reserved_unallocated",
            "model": "gpt-5.6-sol",
            "reasoning_effort": "ultra",
            "fork_turns": "none",
        }
        for field, value in expected_manifest.items():
            if row.get(field) != value:
                errors.append(f"research-manifest:{assignment}:{field}")
        if row.get("packet_ref") != f"research/packets/{expected['packet_id']}.json" or row.get("packet_sha256") != sha(packet_path):
            errors.append(f"research-manifest:{assignment}:packet-binding")
        if row.get("intent_ref") != f"research/intents/{assignment}.json" or row.get("intent_sha256") != sha(intent_path):
            errors.append(f"research-manifest:{assignment}:intent-binding")
        for counter in ("result_count", "receipt_count", "native_capture_rows", "promotion_count", "spec_edit_count", "merge_count", "credit"):
            if row.get(counter) != 0:
                errors.append(f"research-manifest:{assignment}:{counter}")
        if row.get("activation") is not False or row.get("seam_assignment_was_repaired") is not False:
            errors.append(f"research-manifest:{assignment}:activation-or-repair")
        if row.get("seam_repair_assignments") != SEAM_REPAIRS:
            errors.append(f"research-manifest:{assignment}:repair-namespace")

        if packet.get("assignment_id") != assignment or packet.get("packet_id") != expected["packet_id"]:
            errors.append(f"research-packet:{assignment}:identity")
        if packet.get("activation_granted") is not False or packet.get("status") != "PREPARED_BLOCKED_ZERO_LAUNCH":
            errors.append(f"research-packet:{assignment}:activation-status")
        runtime = packet.get("runtime", {})
        if runtime.get("fresh_identity_path") != expected["identity"] or runtime.get("fresh_identity_state") != "reserved_unallocated":
            errors.append(f"research-packet:{assignment}:fresh-identity")
        if (runtime.get("model"), runtime.get("reasoning_effort"), runtime.get("fork_turns")) != ("gpt-5.6-sol", "ultra", "none"):
            errors.append(f"research-packet:{assignment}:runtime")
        if any(runtime.get(key) is not True for key in ("descendants_forbidden", "followups_forbidden", "retries_forbidden")):
            errors.append(f"research-packet:{assignment}:single-leaf-controls")
        expected_binding = {
            "protected_inputs_sha256": protected_sha,
            "edge_registry_sha256": sha(PREP / "edge_registry.jsonl"),
            "feature_registry_sha256": sha(PREP / "feature_registry.jsonl"),
            "result_schema_sha256": sha(schema_path),
            "leaf_prompt_sha256": sha(prompt_path),
            "five_edge_digest_sha256": FIVE_EDGE_DIGEST,
        }
        if packet.get("input_binding") != expected_binding:
            errors.append(f"research-packet:{assignment}:input-binding")
        if packet.get("target_edge", {}).get("edge_id") != expected["edge_id"]:
            errors.append(f"research-packet:{assignment}:target-edge")
        expected_target = {
            "edge_id": edge.get("edge_id"),
            "normalized_edge_id": edge.get("normalized_edge_id"),
            "normalized_edge_key": edge.get("normalized_edge_key"),
            "endpoint_refs": edge.get("endpoint_refs"),
            "endpoint_titles": edge.get("endpoint_titles"),
            "missing_axes": edge.get("reverse_shadow", {}).get("missing_axes"),
        }
        if packet.get("target_edge") != expected_target:
            errors.append(f"research-packet:{assignment}:target-edge-binding")
        if packet.get("target_edge", {}).get("missing_axes") != edge.get("reverse_shadow", {}).get("missing_axes"):
            errors.append(f"research-packet:{assignment}:missing-axes")
        prior = packet.get("prior_candidate_evidence", {})
        if prior.get("forward", {}).get("assignment_id") != edge.get("forward", {}).get("assignment_id"):
            errors.append(f"research-packet:{assignment}:prior-forward-assignment")
        if prior.get("forward", {}).get("decision_ref") != edge.get("forward", {}).get("decision_ref"):
            errors.append(f"research-packet:{assignment}:prior-forward-decision")
        if prior.get("forward", {}).get("result_sha256") != edge.get("forward", {}).get("result_sha256"):
            errors.append(f"research-packet:{assignment}:prior-forward-hash")
        if prior.get("reverse_shadow", {}).get("assignment_id") != edge.get("reverse_shadow", {}).get("assignment_id"):
            errors.append(f"research-packet:{assignment}:prior-reverse-assignment")
        if prior.get("reverse_shadow", {}).get("decision_ref") != edge.get("reverse_shadow", {}).get("decision_ref"):
            errors.append(f"research-packet:{assignment}:prior-reverse-decision")
        if prior.get("reverse_shadow", {}).get("result_sha256") != edge.get("reverse_shadow", {}).get("result_sha256"):
            errors.append(f"research-packet:{assignment}:prior-reverse-hash")
        if prior.get("seam", {}).get("assignment_id") != edge.get("seam", {}).get("assignment_id"):
            errors.append(f"research-packet:{assignment}:prior-seam-assignment")
        if prior.get("seam", {}).get("result_sha256") != edge.get("seam", {}).get("result_sha256"):
            errors.append(f"research-packet:{assignment}:prior-seam-hash")
        if prior.get("seam", {}).get("decision") != edge.get("seam", {}).get("candidate_decision"):
            errors.append(f"research-packet:{assignment}:prior-seam-decision")
        if prior.get("seam", {}).get("research_state") != edge.get("seam", {}).get("research_state"):
            errors.append(f"research-packet:{assignment}:prior-seam-research-state")
        if len(packet.get("research_questions", [])) != 3:
            errors.append(f"research-packet:{assignment}:question-count")
        errors.extend(validate_zero_mapping(packet.get("zero_state", {}), f"research-packet:{assignment}:zero-state"))

        if intent.get("assignment_id") != assignment or intent.get("packet_id") != expected["packet_id"]:
            errors.append(f"research-intent:{assignment}:identity")
        if intent.get("packet_sha256") != sha(packet_path) or intent.get("result_schema_sha256") != sha(schema_path):
            errors.append(f"research-intent:{assignment}:hash-binding")
        if intent.get("future_output_path") != row.get("future_output_path"):
            errors.append(f"research-intent:{assignment}:future-output")
        if intent.get("runtime", {}).get("fresh_identity_path") != expected["identity"]:
            errors.append(f"research-intent:{assignment}:fresh-identity")
        if (
            intent.get("runtime", {}).get("model"),
            intent.get("runtime", {}).get("reasoning_effort"),
            intent.get("runtime", {}).get("fork_turns"),
        ) != ("gpt-5.6-sol", "ultra", "none"):
            errors.append(f"research-intent:{assignment}:runtime")
        if intent.get("runtime", {}).get("native_child_thread_id") is not None or intent.get("runtime", {}).get("native_turn_id") is not None:
            errors.append(f"research-intent:{assignment}:native-identity-present")
        activation = intent.get("activation", {})
        if activation.get("enabled") is not False or activation.get("authorized") is not False or activation.get("fresh_luna_prelaunch_present") is not False:
            errors.append(f"research-intent:{assignment}:activation")
        if activation.get("future_policy_sha256") != V32_POLICY_SHA256:
            errors.append(f"research-intent:{assignment}:v32-policy")
        errors.extend(validate_zero_mapping(intent.get("zero_state", {}), f"research-intent:{assignment}:zero-state"))
    identities = [row.get("fresh_identity_path") for row in manifest]
    if len(identities) != 2 or len(set(identities)) != 2:
        errors.append("research-manifest:fresh-identity-uniqueness")
    return sorted(set(errors))


def validate_postresearch_contract(contract: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if contract.get("status") != "PREPARED_BLOCKED_RESEARCH_AND_LUNA_ABSENT":
        errors.append("postresearch-contract:status")
    expected_bindings = {
        "protected_inputs_sha256": sha(PREP / "protected_inputs.json"),
        "edge_registry_sha256": sha(PREP / "edge_registry.jsonl"),
        "feature_registry_sha256": sha(PREP / "feature_registry.jsonl"),
        "research_manifest_sha256": sha(PREP / "research/manifest.jsonl"),
        "five_edge_digest_sha256": FIVE_EDGE_DIGEST,
    }
    if contract.get("protected_bindings") != expected_bindings:
        errors.append("postresearch-contract:protected-bindings")
    expected_candidates = [
        {
            "sequence": edge["sequence"],
            "edge_id": edge["edge_id"],
            "normalized_edge_id": edge["normalized_edge_id"],
            "candidate_decision": edge["seam_candidate"],
            "targeted_research_required": edge["research_assignment"] is not None,
        }
        for edge in EXPECTED_EDGES
    ]
    if contract.get("candidate_seam_dispositions") != expected_candidates:
        errors.append("postresearch-contract:candidate-seam-dispositions")
    if contract.get("fresh_independent_luna", {}).get("state") != "required_absent":
        errors.append("postresearch-contract:luna-state")
    if contract.get("fresh_independent_luna", {}).get("sol_substitution_forbidden") is not True:
        errors.append("postresearch-contract:luna-sol-substitution")
    if contract.get("future_adjudicator", {}).get("identity_state") != "reserved_unallocated":
        errors.append("postresearch-contract:adjudicator-state")
    if contract.get("future_activation_policy", {}).get("activation_authorized_here") is not False:
        errors.append("postresearch-contract:future-activation")
    no_rerun = contract.get("no_rerun40", {})
    if no_rerun.get("authorized") is not False or no_rerun.get("new_reverse_shadow_assignments") != 0:
        errors.append("postresearch-contract:rerun40")
    if no_rerun.get("source_shadow_assignments_consumed") != REVERSE_SOURCES:
        errors.append("postresearch-contract:source-shadow-identity")
    if no_rerun.get("target_seam_assignments_consumed") != TARGET_SEAMS:
        errors.append("postresearch-contract:target-seam-identity")
    if no_rerun.get("seam_repair_assignments_not_target_edges") != SEAM_REPAIRS:
        errors.append("postresearch-contract:seam-repair-identity")
    errors.extend(validate_zero_mapping(contract.get("zero_state", {}), "postresearch-contract:zero-state"))
    return sorted(set(errors))


def validate_schemas() -> list[str]:
    errors: list[str] = []
    for relative in ("research/targeted_research_result.schema.json", "postresearch/five_edge_adjudication.schema.json"):
        try:
            Draft202012Validator.check_schema(load(PREP / relative))
        except Exception as exc:  # jsonschema emits several precise exception subclasses.
            errors.append(f"schema:{relative}:{type(exc).__name__}")
    return errors


def validate_future_absence(contract: dict[str, Any], manifest: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    future_paths = [row.get("future_output_path") for row in manifest]
    future_paths.extend(row.get("path") for row in contract.get("future_research_results", []))
    future_paths.extend(
        [
            contract.get("future_adjudicator", {}).get("output_path"),
            contract.get("fresh_independent_luna", {}).get("future_report_path"),
        ]
    )
    for relative in sorted({path for path in future_paths if isinstance(path, str)}):
        candidate = (PREP / relative).resolve()
        try:
            candidate.relative_to(PREP.resolve())
        except ValueError:
            errors.append(f"future-absence:path-escape:{relative}")
            continue
        if candidate.exists():
            errors.append(f"future-absence:present:{relative}")
    for forbidden_dir in ("future_outputs", "future_adjudication", "future_validation", "receipts", "native_capture", "promotion"):
        if (PREP / forbidden_dir).exists():
            errors.append(f"future-absence:directory-present:{forbidden_dir}")
    return sorted(set(errors))


def validate_authority() -> list[str]:
    errors: list[str] = []
    authority_path = PREP / "IMMUTABLE_AUTHORITY.json"
    readiness_path = PREP / "readiness.json"
    terminal_path = PREP / "terminal_preparation_report.json"
    authority = load(authority_path)
    readiness = load(readiness_path)
    terminal = load(terminal_path)
    if authority.get("status") != "IMMUTABLE_PREPARATION_AUTHORITY_ZERO_ACTIVATION":
        errors.append("authority:status")
    bindings = authority.get("artifact_bindings", [])
    observed_paths = [row.get("path") for row in bindings]
    expected_paths = sorted(EXPECTED_FILES - {"IMMUTABLE_AUTHORITY.json", "readiness.json", "terminal_preparation_report.json"})
    if observed_paths != expected_paths or len(set(observed_paths)) != len(observed_paths):
        errors.append("authority:artifact-path-set")
    for binding in bindings:
        relative = binding.get("path", "")
        path = (PREP / relative).resolve()
        try:
            path.relative_to(PREP.resolve())
        except ValueError:
            errors.append(f"authority:path-escape:{relative}")
            continue
        if not path.is_file() or sha(path) != binding.get("sha256"):
            errors.append(f"authority:artifact-hash:{relative}")
    if authority.get("five_edge_digest_sha256") != FIVE_EDGE_DIGEST:
        errors.append("authority:five-edge-digest")
    errors.extend(validate_zero_mapping(authority.get("zero_state", {}), "authority:zero-state"))
    if authority.get("activation_authorized") is not False:
        errors.append("authority:activation")
    if readiness.get("authority_sha256") != sha(authority_path):
        errors.append("readiness:authority-hash")
    if readiness.get("status") != "PREPARED_BLOCKED_RESEARCH_AND_FRESH_LUNA_ABSENT":
        errors.append("readiness:status")
    if readiness.get("preparation_valid") is not True or readiness.get("future_activation_authorized_here") is not False:
        errors.append("readiness:preparation-or-activation")
    if readiness.get("fresh_luna", {}).get("state") != "required_absent":
        errors.append("readiness:luna-state")
    errors.extend(validate_zero_mapping(readiness.get("zero_state", {}), "readiness:zero-state"))
    if terminal.get("status") != "PASS_BLOCKED_ZERO_ACTIVATION":
        errors.append("terminal-report:status")
    if terminal.get("authority_sha256") != sha(authority_path) or terminal.get("readiness_sha256") != sha(readiness_path):
        errors.append("terminal-report:authority-or-readiness-hash")
    if terminal.get("edge_count") != 5 or terminal.get("targeted_research_packet_count") != 2:
        errors.append("terminal-report:counts")
    if terminal.get("fresh_luna_state") != "required_absent" or terminal.get("activation_authorized") is not False:
        errors.append("terminal-report:luna-or-activation")
    errors.extend(validate_zero_mapping(terminal.get("zero_state", {}), "terminal-report:zero-state"))
    for path in (authority_path, readiness_path, PREP / "protected_inputs.json", PREP / "edge_registry.jsonl", PREP / "feature_registry.jsonl"):
        if path.stat().st_mode & 0o222:
            errors.append(f"immutability:writable:{path.name}")
    return sorted(set(errors))


def validate_namespace_files() -> list[str]:
    observed = {
        path.relative_to(PREP).as_posix()
        for path in PREP.rglob("*")
        if path.is_file() or path.is_symlink()
    }
    errors: list[str] = []
    if observed != EXPECTED_FILES:
        for missing in sorted(EXPECTED_FILES - observed):
            errors.append(f"namespace:missing:{missing}")
        for extra in sorted(observed - EXPECTED_FILES):
            errors.append(f"namespace:extra:{extra}")
    for relative in observed:
        path = PREP / relative
        if path.is_symlink():
            errors.append(f"namespace:symlink:{relative}")
    return errors


def verify() -> list[str]:
    errors: list[str] = []
    errors.extend(validate_namespace_files())
    required = [
        "protected_inputs.json",
        "edge_registry.jsonl",
        "feature_registry.jsonl",
        "research/manifest.jsonl",
        "postresearch/contract.json",
    ]
    if any(not (PREP / relative).is_file() for relative in required):
        return sorted(set(errors + ["preparation:required-core-file-missing"]))

    protected = load(PREP / "protected_inputs.json")
    edges = jsonl(PREP / "edge_registry.jsonl")
    features = jsonl(PREP / "feature_registry.jsonl")
    manifest = jsonl(PREP / "research/manifest.jsonl")
    contract = load(PREP / "postresearch/contract.json")
    if protected.get("audit_id") != AUDIT_ID or protected.get("reconciliation_id") != RECONCILIATION_ID:
        errors.append("protected-inputs:scope")
    if protected.get("five_edge_digest_sha256") != FIVE_EDGE_DIGEST:
        errors.append("protected-inputs:five-edge-digest")
    binding_errors, bound_paths = verify_external_bindings(protected)
    errors.extend(binding_errors)
    errors.extend(validate_identity_namespaces(protected))
    errors.extend(validate_exact_edges(edges))
    errors.extend(validate_feature_rows(features, edges))
    errors.extend(validate_manifest_and_packets(manifest, edges, sha(PREP / "protected_inputs.json")))
    errors.extend(validate_postresearch_contract(contract))
    errors.extend(validate_schemas())
    errors.extend(validate_future_absence(contract, manifest))

    if not binding_errors:
        errors.extend(validate_quarantine(edges, load(bound_paths["reverse_shadow_luna_postrun"])))
        errors.extend(validate_live_feature_lineage(features, jsonl(bound_paths["owner_provisional_feature_ledger"])))
        errors.extend(
            validate_forward_lineage(
                edges,
                jsonl(bound_paths["forward_candidate_edge_ledger"]),
                load(bound_paths["forward_primary_postrun"]),
            )
        )
        errors.extend(validate_reverse_results(edges, bound_paths))
        errors.extend(validate_seam_lineage(edges, jsonl(bound_paths["seam_normalized_edge_ledger"]), bound_paths))
    errors.extend(validate_authority())
    return sorted(set(errors))


def main() -> int:
    errors = verify()
    payload = {
        "schema_version": "reverse-shadow-five-edge-preparation-verification-v31-v1",
        "audit_id": AUDIT_ID,
        "reconciliation_id": RECONCILIATION_ID,
        "status": "PASS_BLOCKED_ZERO_ACTIVATION" if not errors else "FAIL_CLOSED",
        "edge_count": 5,
        "targeted_research_packet_count": 2,
        "fresh_luna_state": "required_absent",
        "activation_authorized": False,
        "promotion_performed": False,
        "credit": 0,
        "errors": errors,
    }
    print(json.dumps(payload, sort_keys=True, separators=(",", ":")))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
