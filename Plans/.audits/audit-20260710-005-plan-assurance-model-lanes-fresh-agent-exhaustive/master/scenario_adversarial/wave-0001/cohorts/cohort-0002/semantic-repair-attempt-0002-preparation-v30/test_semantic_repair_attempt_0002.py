#!/usr/bin/env python3
"""Executable positive/negative tests for semantic-repair attempt-0002 preparation."""
from __future__ import annotations

import copy
import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("repair_v30", HERE / "verify_semantic_repair_attempt_0002.py")
repair = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(repair)


def dimension() -> dict:
    return {
        "disposition": "blocked_insufficient_evidence",
        "rationale": "The evidence threshold is not met, so execution must fail closed.",
        "scenarios": ["No direct evidence exists for the adversarial boundary."],
        "acceptance_criteria": [{"criterion": "Refuse certification until direct evidence is captured.", "observables": ["Disposition remains blocked."], "evidence_artifacts": ["A source-mapped research record."], "oracle": {"pass": "Two direct sources are bound.", "fail": "Fewer than two direct sources are bound."}}],
        "spec_deltas": ["Specify the missing evidence oracle and fail-closed transition."]
    }


def certification(state: str, disposition: str, urls: list[str]) -> dict:
    claims = [] if not urls else [{"claim_id": "C1", "claim": "A directly verifiable claim.", "source_urls": urls, "evidence_label": "direct_primary_evidence"}]
    return {
        "provisional_feature_ref": "PF-TEST",
        "certification_disposition": disposition,
        "disposition_rationale": "This rationale is concrete and longer than the minimum length.",
        "research_applicability": {"state": state, "rationale": "Evidence was assessed directly.", "browsing_performed": bool(urls), "claims_used": claims},
        "dimensions": {"normal_happy_path": dimension()},
        "overall_spec_deltas": ["Specify the evidence threshold and observable blocked outcome."],
    }


class RepairPreparationTests(unittest.TestCase):
    def test_positive_preparation_is_pass_blocked(self) -> None:
        report = repair.verify_preparation()
        self.assertEqual(report["status"], "pass_blocked", report["errors"])
        self.assertFalse(report["activation"])
        self.assertEqual(report["counts"]["results"], 0)

    def test_positive_strong_evidence_can_certify(self) -> None:
        value = certification("applicable", "certified", ["https://one.example/spec", "https://two.example/spec"])
        self.assertEqual(repair.hardened_feature_errors(value), [])

    def test_negative_weak_evidence_can_never_certify(self) -> None:
        value = certification("weak", "certified", ["https://one.example/spec", "https://two.example/spec"])
        errors = repair.hardened_feature_errors(value)
        self.assertTrue(any("certified-forbidden-for-weak" in error for error in errors))

    def test_negative_misapplied_and_insufficient_can_never_certify(self) -> None:
        for state in ("misapplied", "insufficient"):
            with self.subTest(state=state):
                errors = repair.hardened_feature_errors(certification(state, "certified", ["https://one.example/spec", "https://two.example/spec"]))
                self.assertTrue(any(f"certified-forbidden-for-{state}" in error for error in errors))

    def test_negative_one_source_is_below_threshold(self) -> None:
        errors = repair.hardened_feature_errors(certification("applicable", "certified", ["https://one.example/spec"]))
        self.assertTrue(any("below-evidence-strength-threshold" in error for error in errors))

    def test_positive_no_evidence_blocks_with_concrete_deltas(self) -> None:
        self.assertEqual(repair.hardened_feature_errors(certification("insufficient", "blocked_insufficient_evidence", [])), [])

    def test_negative_no_evidence_without_concrete_deltas(self) -> None:
        value = certification("insufficient", "blocked_insufficient_evidence", [])
        value["overall_spec_deltas"] = ["TBD"]
        value["dimensions"] = {}
        errors = repair.hardened_feature_errors(value)
        self.assertTrue(any("missing-concrete-overall-delta" in error for error in errors))
        self.assertTrue(any("missing-concrete-blocked-dimension" in error for error in errors))

    def test_negative_schema_rejects_weak_certified(self) -> None:
        result = {
            "audit_id": repair.AUDIT.name,
            "schema_version": "scenario-adversarial-semantic-repair-result-v30-v1",
            "phase": "scenario_adversarial_certification",
            "cohort_id": "cohort-0002",
            "assignment_id": "A005SA-0009",
            "attempt_id": "attempt-0002",
            "task_thread_id": "/root/sol_controller_v29/a005_scenario_adversarial_0009_semantic_repair_attempt_0002_ultra_v30",
            "model": "gpt-5.6-sol",
            "reasoning_effort": "ultra",
            "status": "completed",
            "input_binding": {}, "coverage": {}, "feature_certifications": [certification("weak", "certified", ["https://one.example/spec", "https://two.example/spec"])], "self_attestation": {}
        }
        self.assertTrue(repair.overlay_schema_errors(result))

    def test_negative_output_contamination_fails_closed(self) -> None:
        output = HERE / "outputs/A005SA-0009/attempt-0002"
        marker = output / "unexpected.tmp"
        marker.write_text("negative fixture", encoding="utf-8")
        try:
            report = repair.verify_preparation()
            self.assertEqual(report["status"], "fail_closed")
            self.assertTrue(any("foreign-files" in error or "not-separate-empty" in error for error in report["errors"]))
        finally:
            marker.unlink(missing_ok=True)

    def test_negative_primary_rejected_set_is_exact(self) -> None:
        snapshot = copy.deepcopy(repair.load(repair.SNAPSHOT))
        snapshot["rejected_ids"] = snapshot["rejected_ids"][:-1]
        self.assertTrue(any("rejected-set" in error for error in repair.snapshot_errors(snapshot)))


if __name__ == "__main__":
    unittest.main(verbosity=2)
