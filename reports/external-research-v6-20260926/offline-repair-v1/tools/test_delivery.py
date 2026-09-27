"""Synthetic development tests for changed offline carrier boundaries only."""

import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from delivery import SCHEMA_DRAFT, SCHEMA_REVIEW, assemble, render


EV = [{"kind": "source_text", "source": "SYN-001", "locator": "lines 1-3", "quote": "Synthetic checked passage."}]
ABSENCE = {
    "scope": "SYN-001 sections A-B",
    "context": EV,
    "searches": [{"pattern": "sample|example", "scope": "SYN-001 sections A-B", "result": "Matches read in section A."}],
    "source_evidence": EV,
    "assessment": "source_supported",
}


def draft():
    return {
        "schema": SCHEMA_DRAFT,
        "findings": [{
            "id": "F-001", "title": "Synthetic development entry",
            "parts": [
                {"id": "P-001", "type": "assertion", "text": "A sample index lists entries."},
                {"id": "P-002", "type": "condition", "text": "When the sample index is selected."},
                {"id": "P-003", "type": "implication", "text": "The interface would show entry names."},
                {"id": "P-004", "type": "validation_proposal", "text": "Compare a synthetic fixture with the list."},
            ],
        }],
    }


def review():
    return {
        "schema": SCHEMA_REVIEW,
        "findings": [{"id": "F-001", "decisions": [
            {"part_id": p["id"], "action": "keep", "basis": "supported",
             "reason": "The checked synthetic context supports this wording.", "evidence": EV}
            for p in draft()["findings"][0]["parts"]
        ]}],
    }


class DeliveryBoundaryTests(unittest.TestCase):
    def test_draft_only_is_nonempty_and_unverified(self):
        result = assemble(draft())
        text = render(result)
        self.assertEqual(result["mechanical_coverage"]["original_parts"], 4)
        self.assertEqual(result["findings"][0]["status"], "UNVERIFIED")
        self.assertIn("sample index lists entries", text)
        self.assertIn("UNEXECUTED PROPOSAL", text)
        self.assertNotIn("REVIEWED_VERIFIER_ASSERTION", text)

    def test_review_is_explicit_per_part_and_preserves_whole_finding(self):
        rev = review()
        rev["findings"][0]["decisions"][2].update({
            "action": "replace", "replacement": {"type": "implication", "text": "The interface would show selected names."},
        })
        rev["findings"][0]["decisions"][3].update({
            "action": "remove", "basis": "counterevidence",
            "reason": "The synthetic source gives a different proposed check.",
        })
        result = assemble(draft(), rev)
        self.assertEqual(result["findings"][0]["status"], "REVIEWED_VERIFIER_ASSERTION")
        self.assertEqual([p["action"] for p in result["findings"][0]["parts"]],
                         ["keep", "keep", "replace", "remove"])
        text = render(result)
        self.assertIn("The interface would show selected names", text)
        self.assertIn("UNEXECUTED PROPOSAL", text)
        self.assertIn("Compare a synthetic fixture with the list", text)  # retained in history
        self.assertEqual(result["truth_validation"], "not_established_by_assembler")

    def test_missing_or_duplicate_part_decision_blocks_whole_finding(self):
        for mode in ("missing", "duplicate"):
            with self.subTest(mode=mode):
                rev = review()
                if mode == "missing":
                    rev["findings"][0]["decisions"].pop()
                else:
                    rev["findings"][0]["decisions"].append(copy.deepcopy(rev["findings"][0]["decisions"][0]))
                result = assemble(draft(), rev)
                self.assertEqual(result["findings"][0]["status"], "UNRESOLVED")
                self.assertTrue(all(p["current"] is None for p in result["findings"][0]["parts"]))
                self.assertIn("sample index lists entries", render(result))

    def test_incomplete_absence_rejection_retains_original_and_challenge(self):
        rev = review()
        rev["findings"][0]["decisions"][0].update({
            "action": "remove", "basis": "absence",
            "reason": "The sample entry is missing from the source.",
            "evidence": EV,
        })
        result = assemble(draft(), rev)
        self.assertEqual(result["findings"][0]["status"], "UNRESOLVED")
        text = render(result)
        self.assertIn("A sample index lists entries", text)
        self.assertIn("The sample entry is missing", text)
        self.assertIn("structured absence packet required", text)

    def test_absence_packet_is_structural_and_inconclusive_rejection_is_unresolved(self):
        rev = review()
        decision = rev["findings"][0]["decisions"][0]
        decision.update({"action": "remove", "basis": "absence", "reason": "No entry is listed in the bounded synthetic source.",
                         "absence": copy.deepcopy(ABSENCE)})
        supported = assemble(draft(), rev)
        self.assertEqual(supported["findings"][0]["status"], "REVIEWED_VERIFIER_ASSERTION")
        decision["absence"]["assessment"] = "inconclusive"
        inconclusive = assemble(draft(), rev)
        self.assertEqual(inconclusive["findings"][0]["status"], "UNRESOLVED")

    def test_negative_reason_and_new_non_finding_cannot_bypass_absence_packet(self):
        rev = review()
        rev["findings"][0]["decisions"][0]["reason"] = "No evidence appeared in the synthetic context."
        rev["new_findings"] = [{
            "id": "F-002", "title": "Synthetic development non-finding",
            "parts": [{"id": "P-005", "type": "non_finding", "text": "The optional marker is not present."}],
            "decisions": [{"part_id": "P-005", "action": "keep", "basis": "supported",
                           "reason": "A bounded synthetic negative conclusion.", "evidence": EV}],
        }]
        result = assemble(draft(), rev)
        self.assertEqual([f["status"] for f in result["findings"]], ["UNRESOLVED", "UNRESOLVED"])
        rev["findings"][0]["decisions"][0]["absence"] = copy.deepcopy(ABSENCE)
        rev["new_findings"][0]["decisions"][0]["absence"] = copy.deepcopy(ABSENCE)
        result = assemble(draft(), rev)
        self.assertEqual([f["status"] for f in result["findings"]],
                         ["REVIEWED_VERIFIER_ASSERTION", "REVIEWED_VERIFIER_ASSERTION"])

    def test_replacement_cannot_retype_validation_proposal_as_bookkeeping(self):
        rev = review()
        rev["findings"][0]["decisions"][3].update({
            "action": "replace", "replacement": {"type": "non_finding", "text": "Bookkeeping."},
        })
        result = assemble(draft(), rev)
        self.assertEqual(result["findings"][0]["status"], "UNRESOLVED")
        self.assertIn("replacement must preserve original type", render(result))

    def test_issue_title_only_is_lead_not_factual_support(self):
        rev = review()
        rev["findings"][0]["decisions"][0]["evidence"] = [
            {"kind": "issue_title", "source": "SYN-ISSUE", "locator": "title", "quote": "Illustrative allegation"}
        ]
        result = assemble(draft(), rev)
        self.assertEqual(result["findings"][0]["status"], "UNRESOLVED")
        self.assertIn("lead only", render(result))
        self.assertIn("SYN-ISSUE [issue_title]", render(result))

    def test_absence_variants_in_reason_replacement_and_non_finding(self):
        samples = (
            "No in-corpus source states the proposed behavior.",
            "The proposal is not in evidence.",
            "The condition is not stated anywhere in the corpus.",
            "The corpus never states this condition.",
        )
        for phrase in samples:
            with self.subTest(phrase=phrase):
                rev = review()
                rev["findings"][0]["decisions"][0]["reason"] = phrase
                result = assemble(draft(), rev)
                self.assertEqual(result["findings"][0]["status"], "UNRESOLVED")
                self.assertIn("structured absence packet required", render(result))
        rev = review()
        rev["findings"][0]["decisions"][2].update({
            "action": "replace", "replacement": {"type": "implication", "text": "No source states the wider outcome."},
        })
        self.assertEqual(assemble(draft(), rev)["findings"][0]["status"], "UNRESOLVED")

    def test_inconclusive_absence_blocks_keep_and_replace(self):
        for action in ("keep", "replace"):
            with self.subTest(action=action):
                rev = review()
                decision = rev["findings"][0]["decisions"][0]
                decision["reason"] = "No source states this outside the bounded context."
                decision["absence"] = copy.deepcopy(ABSENCE)
                decision["absence"]["assessment"] = "inconclusive"
                if action == "replace":
                    decision.update({"action": "replace", "replacement": {"type": "assertion", "text": "A narrower sample assertion."}})
                result = assemble(draft(), rev)
                self.assertEqual(result["findings"][0]["status"], "UNRESOLVED")

    def test_status_negation_does_not_require_corpus_absence_packet(self):
        rev = review()
        rev["findings"][0]["decisions"][3]["reason"] = "This is not an executed test; it is a proposal."
        self.assertEqual(assemble(draft(), rev)["findings"][0]["status"], "REVIEWED_VERIFIER_ASSERTION")

    def test_negative_new_finding_title_needs_absence_packet(self):
        rev = review()
        rev["new_findings"] = [{
            "id": "F-002", "title": "No source states the synthetic variant",
            "parts": [{"id": "P-005", "type": "non_finding", "text": "A bounded synthetic conclusion."}],
            "decisions": [{"part_id": "P-005", "action": "keep", "basis": "supported",
                           "reason": "The checked local context supports this conclusion.", "evidence": EV}],
        }]
        self.assertEqual(assemble(draft(), rev)["findings"][1]["status"], "UNRESOLVED")
        rev["new_findings"][0]["decisions"][0]["absence"] = copy.deepcopy(ABSENCE)
        self.assertEqual(assemble(draft(), rev)["findings"][1]["status"], "REVIEWED_VERIFIER_ASSERTION")

    def test_invalid_enum_containers_fail_visible(self):
        bad = draft()
        bad["findings"][0]["parts"][0]["type"] = []
        with self.assertRaisesRegex(ValueError, "type"):
            assemble(bad)
        rev = review()
        rev["findings"][0]["decisions"][0]["action"] = []
        result = assemble(draft(), rev)
        self.assertEqual(result["findings"][0]["status"], "UNRESOLVED")
        self.assertIn("action invalid", render(result))

    def test_malformed_json_is_fail_visible_with_raw_carrier(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source = root / "draft.json"
            source.write_text('{"schema": "offline-finding-draft/v1", "findings": [', encoding="utf-8")
            md, out = root / "report.md", root / "report.json"
            process = subprocess.run([sys.executable, str(Path(__file__).with_name("delivery.py")),
                                      "render", "--draft", str(source), "--out-md", str(md), "--out-json", str(out)],
                                     capture_output=True, text=True)
            self.assertEqual(process.returncode, 2)
            self.assertIn("CARRIER INVALID", md.read_text(encoding="utf-8"))
            self.assertIn("Raw draft retained", md.read_text(encoding="utf-8"))
            self.assertEqual(json.loads(out.read_text(encoding="utf-8"))["asserted_claims"], 0)


if __name__ == "__main__":
    unittest.main()
