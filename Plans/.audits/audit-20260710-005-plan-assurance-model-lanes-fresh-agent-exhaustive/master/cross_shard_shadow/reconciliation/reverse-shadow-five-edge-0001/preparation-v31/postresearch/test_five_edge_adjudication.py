#!/usr/bin/env python3
"""Positive and mutation tests for targeted research and five-edge adjudication."""
from __future__ import annotations

import copy
import importlib.util
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("reverse_shadow_adjudication_v31", HERE / "verify_five_edge_adjudication.py")
verify = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(verify)


def zero_credits() -> dict:
    return {"coverage": 0, "research": 0, "adjudication": 0, "promotion": 0, "spec": 0, "merge": 0}


def research_document(assignment: str, blocked: bool = False) -> dict:
    packet = verify.packets()[assignment]
    edge = packet["target_edge"]
    questions = packet["research_questions"]
    missing_axes = edge["missing_axes"]
    if blocked:
        sources: list[dict] = []
        claims: list[dict] = []
        coverage = [
            {"question_id": row["question_id"], "status": "no_authoritative_evidence", "claim_ids": [], "covered_axis_ids": [], "unresolved_facts": ["No authoritative source establishes the PuppetMaster-specific product outcome."], "search_trace": [{"query": "authoritative product outcome evidence search", "domains_checked": ["example.org"]}]}
            for row in questions
        ]
        assessments = [
            {"axis_id": axis, "evidence_state": "insufficient", "claim_ids": [], "internal_product_fact_refs": edge["endpoint_refs"], "rationale": "External evidence does not close the PuppetMaster-specific product identity axis and the result remains fail-closed."}
            for axis in missing_axes
        ]
    else:
        sources = [
            {"source_id":"RSRSRC-0001","url":"https://standards.example.org/spec/state","canonical_url":"https://standards.example.org/spec/state","title":"State and outcome standard","publisher":"Standards Body","publisher_organization":"Standards Body","source_tier":"official_standard","published_or_updated_date":"2026-01-01","accessed_date":"2026-07-12","section_locator":"Section 4","material_relevance":"Defines observable outcomes and explicit failure transitions for the target comparison.","target_edge_ids":[edge["edge_id"]],"axis_ids":missing_axes},
            {"source_id":"RSRSRC-0002","url":"https://implementation.example.net/docs/recovery","canonical_url":"https://implementation.example.net/docs/recovery","title":"Production recovery contract","publisher":"Implementation Project","publisher_organization":"Implementation Project","source_tier":"mature_open_source","published_or_updated_date":"2026-02-01","accessed_date":"2026-07-12","section_locator":"Recovery lifecycle","material_relevance":"Documents independent production behavior for outcomes, state boundaries, and recovery failures.","target_edge_ids":[edge["edge_id"]],"axis_ids":missing_axes}
        ]
        question_ids = [row["question_id"] for row in questions]
        claims = [
            {"claim_id":"RSRCLM-0001","statement":"The standard treats the compared obligations as one observable outcome and one explicit failure lifecycle.","evidence_class":"direct_support","source_ids":["RSRSRC-0001"],"question_ids":question_ids,"edge_ids":[edge["edge_id"]],"axis_ids":missing_axes,"applicability":"Supplies a direct comparison baseline while leaving PuppetMaster product authority with the frozen packet.","confidence":0.91},
            {"claim_id":"RSRCLM-0002","statement":"The independent implementation exposes the same completion and recovery boundary for the compared obligations.","evidence_class":"direct_support","source_ids":["RSRSRC-0002"],"question_ids":question_ids,"edge_ids":[edge["edge_id"]],"axis_ids":missing_axes,"applicability":"Provides an independent mature implementation comparison without overriding the internal product facts.","confidence":0.88}
        ]
        coverage = [
            {"question_id": row["question_id"], "status": "answered", "claim_ids": ["RSRCLM-0001", "RSRCLM-0002"], "covered_axis_ids": missing_axes, "unresolved_facts": [], "search_trace": [{"query": "observable outcome and recovery state contract", "domains_checked": ["standards.example.org", "implementation.example.net"]}]}
            for row in questions
        ]
        assessments = [
            {"axis_id": axis, "evidence_state": "supports_same", "claim_ids": ["RSRCLM-0001", "RSRCLM-0002"], "internal_product_fact_refs": edge["endpoint_refs"], "rationale": "Two independent strong sources support the same boundary while the frozen PuppetMaster facts remain the controlling product evidence."}
            for axis in missing_axes
        ]
    return {
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "schema_version": "reverse-shadow-targeted-research-result-v31-v1",
        "phase": "reverse_shadow_targeted_external_research",
        "reconciliation_id": "reverse-shadow-five-edge-0001",
        "assignment_id": assignment,
        "packet_id": packet["packet_id"],
        "attempt_id": "attempt-0001",
        "agent_path": packet["runtime"]["fresh_identity_path"],
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
        "status": "blocked_no_authoritative_evidence" if blocked else "completed_candidate_only",
        "input_binding": verify.expected_research_input_binding(packet),
        "edge_scope": {"edge_id":edge["edge_id"],"normalized_edge_id":edge["normalized_edge_id"],"normalized_edge_key":edge["normalized_edge_key"],"endpoint_refs":edge["endpoint_refs"],"missing_axes":edge["missing_axes"]},
        "research_questions": questions,
        "source_registry": sources,
        "claim_registry": claims,
        "question_coverage": coverage,
        "axis_assessments": assessments,
        "research_limit": {"external_evidence_is_supplemental":True,"canonical_product_authority_not_overridden":True,"final_edge_disposition_forbidden":True},
        "credits": zero_credits(),
        "self_attestation": {"fresh_public_web_research_performed":True,"source_registry_completed_before_claim_emission":True,"all_sources_and_claims_closed":True,"no_prior_targeted_peer_result_read":True,"no_descendants_followups_or_retries":True,"no_native_identity_fields_in_result":True,"no_promotion_spec_merge_or_canonical_write":True}
    }


def axis(assessment: str, claims: list[str] | None = None) -> dict:
    return {"assessment":assessment,"internal_evidence_refs":["EDGE_REGISTRY","FROZEN_FEATURE_REGISTRY"],"external_claim_ids":claims or [],"rationale":"The frozen evidence and any cited targeted claims explicitly support this axis-level assessment without granting promotion."}


def adjudication_document(research: dict[str, dict]) -> dict:
    edges = verify.edge_registry()
    dispositions = {
        "RSQ-0001": "same_feature_merge_recommended",
        "RSQ-0002": "dependency_or_interface_seam",
        "RSQ-0003": "same_feature_merge_recommended",
        "RSQ-0004": "same_feature_merge_recommended",
        "RSQ-0005": "same_feature_merge_recommended",
    }
    rows = []
    for index, edge_id in enumerate(verify.EXPECTED_EDGE_IDS, start=1):
        source = edges[edge_id]
        research_assignment = source["targeted_research"]["assignment_id"]
        claim_ids = list({claim["claim_id"] for claim in research.get(research_assignment, {}).get("claim_registry", [])}) if research_assignment else []
        findings = {name: axis("same", claim_ids if name in source["reverse_shadow"]["missing_axes"] else []) for name in ("authority_owner","lifecycle_transition","user_outcome","state_boundary","failure_semantics")}
        if edge_id == "RSQ-0002":
            findings["user_outcome"] = axis("different")
        rows.append({
            "sequence":index,"edge_id":edge_id,"normalized_edge_id":source["normalized_edge_id"],"normalized_edge_key":source["normalized_edge_key"],"candidate_seam_decision":source["seam"]["candidate_decision"],"targeted_research_assignment_id":research_assignment,
            "axis_findings":findings,"disposition":dispositions[edge_id],"rationale":"The exact frozen endpoint, forward, reverse-shadow, seam, and targeted-research evidence closes the five axes at recommendation-only status.","supporting_internal_refs":[source["forward"]["decision_ref"],source["reverse_shadow"]["decision_ref"]],"external_claim_ids":claim_ids,
            "deviation_from_seam_candidate":{"deviates":False,"rationale":None},"recommendation_only":True,"promotion_eligible":False,"promotion_performed":False,"spec_write_authorized":False,"spec_edit_performed":False,"merge_performed":False
        })
    return {
        "audit_id":"audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive","schema_version":"reverse-shadow-five-edge-adjudication-v31-v1","phase":"reverse_shadow_postresearch_five_edge_adjudication","reconciliation_id":"reverse-shadow-five-edge-0001","adjudicator_path":"/root/sol_controller_v29/a005_reverse_shadow_five_edge_adjudication_ultra_v31","model":"gpt-5.6-sol","reasoning_effort":"ultra","status":"candidate_complete_pending_independent_luna",
        "input_binding":{"protected_inputs_sha256":verify.sha(verify.PROTECTED_INPUTS_PATH),"edge_registry_sha256":verify.sha(verify.EDGE_REGISTRY_PATH),"feature_registry_sha256":verify.sha(verify.FEATURE_REGISTRY_PATH),"research_manifest_sha256":verify.sha(verify.RESEARCH_MANIFEST_PATH),"reverse_shadow_primary_sha256":"c3370ecaeacfdfb2437633f95e343a322e5e6249a057d2a14743b04c2ffc863d","reverse_shadow_luna_sha256":"8956c7a16b39d3c5fe4878dd64aff7b416ef3350c7f75e4fdb2c2fd85ab82c68","seam_ledger_sha256":"6ebfdbd97df06dc4060421f8845d32de4fc3edc81d57a1765144986193a2925b","seam_exact64_checkpoint_sha256":"f6d3fd1087c8dec7e35cfae26374605d31b342df3b945603986194598f9ee809","five_edge_digest_sha256":"4073116b8855d02324e0d471130e36284779d6fa500853372fc3bbe055813796"},
        "research_result_bindings":[{"assignment_id":assignment,"packet_id":verify.PACKET_BY_ASSIGNMENT[assignment],"edge_id":verify.TARGET_BY_ASSIGNMENT[assignment],"result_sha256":verify.digest_json(research[assignment]),"verification_sha256":"0"*64,"status":"verified_blocked_no_authoritative_evidence" if research[assignment]["status"]=="blocked_no_authoritative_evidence" else "verified_candidate_only"} for assignment in verify.EXPECTED_RESEARCH_ASSIGNMENTS],
        "adjudications":rows,
        "counts":{"edges":5,"targeted_research_results":2,"shadow_source_assignments":3,"target_seam_assignments":5,"rerun_shadow_assignments":0,"promotions":0,"spec_edits":0,"merges":0},
        "independent_luna_gate":{"state":"required_absent","report_ref":None,"report_sha256":None,"fresh_direct_luna_max_required":True,"independent_reconstruction_before_primary_comparison":True,"sol_substitution_forbidden":True,"gate_pass_grants_promotion":False},
        "credits":zero_credits(),
        "self_attestation":{"exact_five_edges_adjudicated_once":True,"exact_two_targeted_results_consumed":True,"external_evidence_treated_as_supplemental":True,"canonical_product_authority_not_overridden":True,"source_results_and_lineage_not_mutated":True,"no_rerun40":True,"no_promotion_spec_merge_or_canonical_write":True}
    }


class PostresearchContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.research = {assignment: research_document(assignment) for assignment in verify.EXPECTED_RESEARCH_ASSIGNMENTS}

    def test_positive_both_research_results(self) -> None:
        for assignment, document in self.research.items():
            self.assertEqual(verify.validate_research_result(document, verify.packets()[assignment]), [])

    def test_negative_wrong_nested_identity(self) -> None:
        value = copy.deepcopy(self.research["A005RSR-0001"]); value["agent_path"] = "/root/a005_wrong"
        self.assertTrue(verify.validate_research_result(value, verify.packets()["A005RSR-0001"]))

    def test_negative_duplicate_canonical_url(self) -> None:
        value = copy.deepcopy(self.research["A005RSR-0001"]); value["source_registry"][1]["url"] = value["source_registry"][0]["url"]; value["source_registry"][1]["canonical_url"] = value["source_registry"][0]["canonical_url"]
        self.assertTrue(any("duplicate-canonical-url" in error for error in verify.validate_research_result(value, verify.packets()["A005RSR-0001"])))

    def test_negative_orphan_source(self) -> None:
        value = copy.deepcopy(self.research["A005RSR-0001"]); value["claim_registry"][1]["source_ids"] = ["RSRSRC-0001"]
        self.assertTrue(any("orphan-source" in error for error in verify.validate_research_result(value, verify.packets()["A005RSR-0001"])))

    def test_negative_orphan_claim_from_questions(self) -> None:
        value = copy.deepcopy(self.research["A005RSR-0001"])
        for row in value["question_coverage"]: row["claim_ids"] = ["RSRCLM-0001"]
        self.assertTrue(any("orphan-claim-question" in error for error in verify.validate_research_result(value, verify.packets()["A005RSR-0001"])))

    def test_negative_decisive_axis_one_publisher(self) -> None:
        value = copy.deepcopy(self.research["A005RSR-0001"]); value["source_registry"][1]["publisher_organization"] = "Standards Body"
        self.assertTrue(any("below-two-independent-publishers" in error for error in verify.validate_research_result(value, verify.packets()["A005RSR-0001"])))

    def test_negative_no_evidence_question_has_claims(self) -> None:
        value = copy.deepcopy(self.research["A005RSR-0001"]); value["question_coverage"][0]["status"] = "no_authoritative_evidence"
        self.assertTrue(any("no-evidence-has-claims" in error for error in verify.validate_research_result(value, verify.packets()["A005RSR-0001"])))

    def test_positive_adjudication_candidate_pending_luna(self) -> None:
        document = adjudication_document(self.research)
        self.assertEqual(verify.validate_adjudication(document, self.research), [])

    def test_negative_adjudication_missing_edge(self) -> None:
        document = adjudication_document(self.research); document["adjudications"].pop()
        self.assertTrue(verify.validate_adjudication(document, self.research))

    def test_negative_same_feature_has_different_axis(self) -> None:
        document = adjudication_document(self.research); document["adjudications"][0]["axis_findings"]["failure_semantics"]["assessment"] = "different"
        self.assertTrue(any("same-feature-with-non-same-axis" in error for error in verify.validate_adjudication(document, self.research)))

    def test_negative_distinct_has_no_different_axis(self) -> None:
        document = adjudication_document(self.research); document["adjudications"][1]["axis_findings"]["user_outcome"]["assessment"] = "same"
        self.assertTrue(any("distinct-without-different-axis" in error for error in verify.validate_adjudication(document, self.research)))

    def test_negative_quarantine_has_no_insufficient_axis(self) -> None:
        document = adjudication_document(self.research); document["adjudications"][2]["disposition"] = "remain_quarantined_insufficient_evidence"
        self.assertTrue(any("quarantine-without-insufficient-axis" in error for error in verify.validate_adjudication(document, self.research)))

    def test_negative_nonzero_credit(self) -> None:
        document = adjudication_document(self.research); document["credits"]["merge"] = 1
        self.assertTrue(verify.validate_adjudication(document, self.research))

    def test_negative_blocked_research_cannot_drive_decisive_edge(self) -> None:
        research = copy.deepcopy(self.research); research["A005RSR-0001"] = research_document("A005RSR-0001", blocked=True)
        document = adjudication_document(research)
        self.assertTrue(any("blocked-research-used-for-decisive-disposition" in error for error in verify.validate_adjudication(document, research)))

    def test_negative_foreign_targeted_claim_on_nonresearch_edge(self) -> None:
        document = adjudication_document(self.research); document["adjudications"][0]["external_claim_ids"] = ["RSRCLM-0001"]
        self.assertTrue(any("foreign-targeted-claims" in error for error in verify.validate_adjudication(document, self.research)))

    def test_negative_rerun40_count(self) -> None:
        document = adjudication_document(self.research); document["counts"]["rerun_shadow_assignments"] = 40
        self.assertTrue(verify.validate_adjudication(document, self.research))

    def test_negative_luna_report_cannot_exist_in_candidate(self) -> None:
        document = adjudication_document(self.research); document["independent_luna_gate"]["state"] = "pass"
        self.assertTrue(verify.validate_adjudication(document, self.research))


if __name__ == "__main__":
    unittest.main(verbosity=2)
