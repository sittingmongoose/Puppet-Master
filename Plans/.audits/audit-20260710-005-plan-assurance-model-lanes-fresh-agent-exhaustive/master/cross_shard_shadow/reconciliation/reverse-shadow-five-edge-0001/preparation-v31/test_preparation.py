#!/usr/bin/env python3
"""Mutation tests for the fail-closed V31 preparation verifier."""
from __future__ import annotations

import copy
import unittest

from verify_preparation import (
    PREP,
    REVERSE_SOURCES,
    SEAM_REPAIRS,
    TARGET_SEAMS,
    jsonl,
    load,
    validate_exact_edges,
    validate_feature_rows,
    validate_identity_namespaces,
    validate_quarantine,
    validate_zero_mapping,
)


class PreparationVerifierTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.edges = jsonl(PREP / "edge_registry.jsonl")
        cls.features = jsonl(PREP / "feature_registry.jsonl")
        cls.protected = load(PREP / "protected_inputs.json")

    def valid_luna_projection(self) -> dict:
        findings = []
        reviews = []
        for edge in self.edges:
            finding = {
                "edge": edge["normalized_edge_key"],
                "left_ref": edge["endpoint_refs"][0],
                "right_ref": edge["endpoint_refs"][1],
                "missing_axes": edge["reverse_shadow"]["missing_axes"],
                "forbidden_signals": edge["reverse_shadow"]["forbidden_signals"],
                "reason": edge["reverse_shadow"]["quarantine_reason"],
            }
            findings.append(finding)
            required_axes = {
                "authority_owner": True,
                "lifecycle_state_transition": True,
                "user_outcome": "user_outcome" not in edge["reverse_shadow"]["missing_axes"],
                "state_boundary": True,
                "failure_semantics": "failure_semantics" not in edge["reverse_shadow"]["missing_axes"],
            }
            reviews.append(
                {
                    "edge": finding["edge"],
                    "left_ref": finding["left_ref"],
                    "right_ref": finding["right_ref"],
                    "assignment_ids": [edge["reverse_shadow"]["assignment_id"]],
                    "occurrence_count": 1,
                    "required_axes": required_axes,
                    "supportable": False,
                    "forbidden_signals": finding["forbidden_signals"],
                    "decision": "quarantined_uncertain",
                    "reason": finding["reason"],
                }
            )
        return {
            "status": "fail_closed_semantic_quarantine",
            "counts": {"quarantined_candidate_edges": 5},
            "semantic_review": {"unsupported_or_uncertain_edges_quarantined": 5},
            "semantic_quarantined_assignment_ids": REVERSE_SOURCES,
            "edge_promotion_performed": False,
            "promotion_credit": 0,
            "errors": [f"quarantined_candidate_edge:{finding['edge']}" for finding in findings],
            "candidate_semantic_reviews": reviews,
            "quarantined_uncertain_unsupported_edge_findings": findings,
        }

    def test_positive_exact_five_edges(self) -> None:
        self.assertEqual(validate_exact_edges(copy.deepcopy(self.edges)), [])

    def test_negative_missing_edge(self) -> None:
        errors = validate_exact_edges(copy.deepcopy(self.edges[:-1]))
        self.assertTrue(any("expected-5" in error or "missing:RSQ-0005" in error for error in errors))

    def test_negative_edge_digest_mutation(self) -> None:
        rows = copy.deepcopy(self.edges)
        rows[0]["normalized_edge_key"] = rows[0]["normalized_edge_key"].replace("PF-0109", "PF-9999")
        errors = validate_exact_edges(rows)
        self.assertTrue(any("five-edge-digest" in error for error in errors))

    def test_negative_edge_promotion(self) -> None:
        rows = copy.deepcopy(self.edges)
        rows[1]["promotion_performed"] = True
        self.assertTrue(any("promotion-performed" in error for error in validate_exact_edges(rows)))

    def test_negative_target_seam_marked_as_repair(self) -> None:
        rows = copy.deepcopy(self.edges)
        rows[2]["seam"]["repaired_assignment"] = True
        self.assertTrue(any("target-seam-marked-repaired" in error for error in validate_exact_edges(rows)))

    def test_positive_exact_ten_features(self) -> None:
        self.assertEqual(validate_feature_rows(copy.deepcopy(self.features), copy.deepcopy(self.edges)), [])

    def test_negative_feature_missing(self) -> None:
        errors = validate_feature_rows(copy.deepcopy(self.features[:-1]), copy.deepcopy(self.edges))
        self.assertTrue(any("exact-ordered-ten-set" in error or "unique-count-ten" in error for error in errors))

    def test_negative_feature_title_binding(self) -> None:
        rows = copy.deepcopy(self.features)
        rows[0]["title"] = "Wrong title"
        self.assertTrue(any("title-binding" in error for error in validate_feature_rows(rows, copy.deepcopy(self.edges))))

    def test_positive_luna_quarantine_projection(self) -> None:
        self.assertEqual(validate_quarantine(copy.deepcopy(self.edges), self.valid_luna_projection()), [])

    def test_negative_luna_missing_axis_mutation(self) -> None:
        luna = self.valid_luna_projection()
        luna["quarantined_uncertain_unsupported_edge_findings"][2]["missing_axes"] = ["user_outcome"]
        self.assertTrue(any("missing-axes" in error for error in validate_quarantine(copy.deepcopy(self.edges), luna)))

    def test_negative_luna_extra_edge(self) -> None:
        luna = self.valid_luna_projection()
        extra = copy.deepcopy(luna["quarantined_uncertain_unsupported_edge_findings"][0])
        extra["edge"] = "OPF::A005OM-9999::PF-0001\0OPF::A005OM-9999::PF-0002"
        luna["quarantined_uncertain_unsupported_edge_findings"].append(extra)
        self.assertTrue(any("exact-five-edge-set" in error for error in validate_quarantine(copy.deepcopy(self.edges), luna)))

    def test_positive_identity_namespaces(self) -> None:
        self.assertEqual(validate_identity_namespaces(copy.deepcopy(self.protected)), [])

    def test_negative_numeric_suffix_identity_confusion(self) -> None:
        protected = copy.deepcopy(self.protected)
        protected["identity_namespaces"]["target_seam_assignments"][0] = "A005CDSV2-0002"
        errors = validate_identity_namespaces(protected)
        self.assertTrue(any("target-seams" in error for error in errors))

    def test_positive_declared_zero_state(self) -> None:
        self.assertEqual(validate_zero_mapping({"activation": False, "credits": {"research": 0, "merge": 0}}), [])

    def test_negative_declared_zero_state(self) -> None:
        errors = validate_zero_mapping({"activation": True, "credits": {"research": 1}})
        self.assertEqual(len(errors), 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)
