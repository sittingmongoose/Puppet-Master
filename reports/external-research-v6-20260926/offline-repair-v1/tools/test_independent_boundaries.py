"""Independent synthetic boundary checks for the offline delivery carrier.

These fixtures contain no research-case answers. They test preservation and
fail-visible behavior, not whether a source citation proves its proposition.
"""

from __future__ import annotations

import copy
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


TOOL = Path(__file__).with_name("delivery.py")
SPEC = importlib.util.spec_from_file_location("offline_delivery_under_test", TOOL)
assert SPEC and SPEC.loader
delivery = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(delivery)


def source(kind="source_text"):
    return {"kind": kind, "source": "SYN-001", "locator": "lines 1-3", "quote": "A synthetic checked passage."}


def draft():
    return {
        "schema": "offline-finding-draft/v1",
        "findings": [{
            "id": "F-001", "title": "Synthetic index finding",
            "parts": [
                {"id": "P-001", "type": "assertion", "text": "The local index lists entries.", "evidence": [source()]},
                {"id": "P-002", "type": "condition", "text": "This applies in local mode."},
                {"id": "P-003", "type": "implication", "text": "The view shows the selected entry."},
                {"id": "P-004", "type": "validation_proposal", "text": "Compare a synthetic fixture with the displayed list."},
                {"id": "P-005", "type": "uncertainty", "text": "Ordering ties remain open."},
            ],
        }],
        "revision_history": [{"snapshot": "s1", "note": "Synthetic initial record"}],
    }


def decision(part_id, action="keep", basis="supported", **extra):
    row = {"part_id": part_id, "action": action, "basis": basis,
           "reason": "Direct synthetic passage supports this limited point.",
           "evidence": [source()]}
    row.update(extra)
    return row


def review(rows=None):
    if rows is None:
        rows = [decision(f"P-{i:03}") for i in range(1, 6)]
    return {"schema": "offline-finding-review/v1",
            "findings": [{"id": "F-001", "decisions": rows}], "new_findings": []}


def absence(assessment="source_supported"):
    return {"scope": "SYN-001 sections A-B only", "context": [source()],
            "searches": [{"pattern": "sample|entry", "scope": "SYN-001 A-B", "result": "Both sections inspected."}],
            "source_evidence": [source()], "assessment": assessment}


class IndependentBoundaries(unittest.TestCase):
    def assemble(self, d=None, r=None):
        return delivery.assemble(d if d is not None else draft(), r)

    def test_draft_render_keeps_complete_finding_and_unexecuted_proposal(self):
        result = self.assemble()
        finding = result["findings"][0]
        self.assertEqual(finding["status"], "UNVERIFIED")
        self.assertEqual([p["original"]["type"] for p in finding["parts"]],
                         ["assertion", "condition", "implication", "validation_proposal", "uncertainty"])
        text = delivery.render(result)
        for phrase in ("local mode", "selected entry", "Compare a synthetic fixture", "Ordering ties remain open"):
            self.assertIn(phrase, text)
        self.assertIn("P-004 · validation_proposal · UNEXECUTED PROPOSAL", text)
        self.assertEqual(result["truth_validation"], "not_established_by_assembler")

    def test_explicit_keep_and_replace_preserve_all_parts_and_history(self):
        r = review()
        r["findings"][0]["decisions"][2] = decision(
            "P-003", "replace", "supported",
            replacement={"type": "implication", "text": "The view shows the selected name."})
        r["findings"][0]["decisions"][3] = decision(
            "P-004", "replace", "supported",
            replacement={"type": "validation_proposal", "text": "Compare two synthetic fixture lists."})
        result = self.assemble(r=r)
        finding = result["findings"][0]
        self.assertEqual(finding["status"], "REVIEWED_VERIFIER_ASSERTION")
        self.assertEqual(len(finding["parts"]), 5)
        self.assertEqual(finding["parts"][2]["current"]["text"], "The view shows the selected name.")
        text = delivery.render(result)
        self.assertIn("P-004 · validation_proposal · UNEXECUTED PROPOSAL", text)
        self.assertIn("Compare two synthetic fixture lists.", text)
        self.assertIn("Compare a synthetic fixture with the displayed list.", text)
        self.assertIn("Ordering ties remain open.", text)

    def test_missing_duplicate_and_unknown_decisions_cannot_review_whole_finding(self):
        for mutate in (
            lambda rows: rows.pop(1),
            lambda rows: rows.append(copy.deepcopy(rows[0])),
            lambda rows: rows.append(decision("P-999")),
        ):
            with self.subTest(mutate=mutate):
                r = review()
                mutate(r["findings"][0]["decisions"])
                finding = self.assemble(r=r)["findings"][0]
                self.assertEqual(finding["status"], "UNRESOLVED")
                self.assertTrue(finding["defects"])
                self.assertTrue(all(p["current"] is None for p in finding["parts"]))
                self.assertIn("The local index lists entries.", delivery.render(self.assemble(r=r)))

    def test_duplicate_ids_and_bad_type_fail_draft_validation(self):
        for change in ("part", "finding", "type_list"):
            with self.subTest(change=change):
                d = draft()
                if change == "part":
                    d["findings"][0]["parts"][1]["id"] = "P-001"
                elif change == "finding":
                    d["findings"].append(copy.deepcopy(d["findings"][0]))
                else:
                    d["findings"][0]["parts"][0]["type"] = ["assertion"]
                with self.assertRaises(delivery.CarrierError):
                    self.assemble(d=d)

    def test_not_a_claim_cannot_drop_proposal(self):
        r = review()
        r["findings"][0]["decisions"][3]["action"] = "not_a_claim"
        result = self.assemble(r=r)
        self.assertEqual(result["findings"][0]["status"], "UNRESOLVED")
        text = delivery.render(result)
        self.assertIn("UNEXECUTED PROPOSAL", text)
        self.assertIn("Compare a synthetic fixture", text)
        self.assertIn("not_a_claim", text)

    def test_unsupported_removal_shows_original_and_challenge(self):
        r = review()
        r["findings"][0]["decisions"][0] = decision(
            "P-001", "remove", "insufficient", reason="The passage may be unrelated.")
        result = self.assemble(r=r)
        self.assertEqual(result["findings"][0]["status"], "UNRESOLVED")
        text = delivery.render(result)
        self.assertIn("The local index lists entries.", text)
        self.assertIn("The passage may be unrelated.", text)

    def test_absence_hidden_in_reason_replacement_and_nonfinding_requires_packet(self):
        for location in ("reason", "replacement", "addition"):
            with self.subTest(location=location):
                r = review()
                if location == "reason":
                    r["findings"][0]["decisions"][0]["reason"] = "No in-corpus source states this."
                elif location == "replacement":
                    r["findings"][0]["decisions"][0] = decision(
                        "P-001", "replace", "supported",
                        replacement={"type": "assertion", "text": "This is not stated anywhere."})
                else:
                    r["new_findings"] = [{
                        "id": "F-002", "title": "Negative synthetic addition",
                        "parts": [{"id": "P-006", "type": "non_finding", "text": "No matching local entry exists."}],
                        "decisions": [decision("P-006")],
                    }]
                result = self.assemble(r=r)
                affected = result["findings"][-1] if location == "addition" else result["findings"][0]
                self.assertEqual(affected["status"], "UNRESOLVED")
                self.assertIn("absence", " ".join(affected["defects"]))

    def test_search_only_and_inconclusive_absence_do_not_prove_negative(self):
        r = review()
        r["findings"][0]["decisions"][0] = decision(
            "P-001", "remove", "absence", reason="No in-corpus source states it.", absence=absence())
        r["findings"][0]["decisions"][0]["absence"]["source_evidence"] = [source("search_result")]
        self.assertEqual(self.assemble(r=r)["findings"][0]["status"], "UNRESOLVED")
        r["findings"][0]["decisions"][0]["absence"] = absence("inconclusive")
        self.assertEqual(self.assemble(r=r)["findings"][0]["status"], "UNRESOLVED")

    def test_issue_title_only_is_lead_not_spec_override(self):
        r = review()
        r["findings"][0]["decisions"][0] = decision(
            "P-001", "replace", "supported", evidence=[source("issue_title")],
            reason="Issue title alleges a different rule.",
            replacement={"type": "assertion", "text": "A different rule is adopted."})
        result = self.assemble(r=r)
        self.assertEqual(result["findings"][0]["status"], "UNRESOLVED")
        self.assertIn("lead only", " ".join(result["findings"][0]["defects"]))

    def test_negative_finding_title_cannot_bypass_absence_review(self):
        d = draft()
        d["findings"][0]["title"] = "No source in the fixed packet states an index rule"
        result = self.assemble(d=d, r=review())
        self.assertEqual(result["findings"][0]["status"], "UNRESOLVED")
        self.assertIn("No source in the fixed packet", delivery.render(result))

    def test_untyped_top_level_addition_must_not_disappear_silently(self):
        r = review()
        r["additions"] = "No source anywhere states the sample rule."
        result = self.assemble(r=r)
        self.assertTrue(result["diagnostics"] or result["unmatched_review_records"])
        self.assertIn("No source anywhere", delivery.render(result))

    def test_malformed_input_is_fail_visible_with_raw_record(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            draft_file = root / "draft.json"
            draft_file.write_text('{"schema": "offline-finding-draft/v1",', encoding="utf-8")
            md_file, json_file = root / "delivery.md", root / "delivery.json"
            proc = subprocess.run(
                [sys.executable, str(TOOL), "render", "--draft", str(draft_file),
                 "--out-md", str(md_file), "--out-json", str(json_file)],
                capture_output=True, text=True, check=False)
            self.assertEqual(proc.returncode, 2, proc.stderr)
            record = json.loads(json_file.read_text(encoding="utf-8"))
            self.assertEqual(record["status"], "CARRIER_INVALID")
            self.assertEqual(record["asserted_claims"], 0)
            self.assertIn("CARRIER INVALID", md_file.read_text(encoding="utf-8"))
            self.assertIn("offline-finding-draft/v1", record["raw_carriers"]["draft"])


if __name__ == "__main__":
    unittest.main()
