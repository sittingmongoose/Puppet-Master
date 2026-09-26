#!/usr/bin/env python3
"""Independent linked-record regressions for Commands semantic admission.

Exercises actual linked owner records and schema-valid adversarial mutations.
"""

import copy
import json
import sys
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_packet_integration_semantics as semantics  # noqa: E402

SCHEMA = json.loads((ROOT / "Plans/commands_shortcuts_contracts.schema.json").read_text())
FIXTURES = json.loads((ROOT / "Plans/commands_shortcuts_contract_fixtures.json").read_text())
VALID = {case["case_id"]: case["record"] for case in FIXTURES["valid"]}
CASES = {case["case_id"]: case for case in FIXTURES["semantic_cases"]}
VALIDATOR = Draft202012Validator(SCHEMA)


def evaluate(case):
    records = [VALID[ref] for ref in case.get("record_refs", [])]
    records += case.get("records", [])
    for record in records:
        VALIDATOR.validate(record)
    return semantics.evaluate_commands_semantic_case(
        case, schema=SCHEMA, fixtures=FIXTURES, all_by_name=VALID
    )


def plan_case_without_applied_result():
    # The preview-to-commit binding should be independently testable without
    # the applied-result ref accidentally catching a Project retarget.
    records = [
        copy.deepcopy(VALID["import_preview_request"]),
        copy.deepcopy(VALID["import_plan_result"]),
        copy.deepcopy(VALID["import_commit_request"]),
    ]
    return {"check": "cmdsc_confirmed_plan_matches", "record_refs": [], "records": records}


class CommandsSemanticJoins(unittest.TestCase):
    def assert_rejected(self, case):
        failures, unevaluable = evaluate(case)
        self.assertIsNone(unevaluable, unevaluable)
        self.assertTrue(failures, "schema-valid invalid linked records were accepted")

    def test_plan_baseline_accepts(self):
        case = plan_case_without_applied_result()
        failures, unevaluable = evaluate(case)
        self.assertIsNone(unevaluable, unevaluable)
        self.assertEqual([], failures)

    def test_missing_immutable_plan_rejects(self):
        self.assert_rejected({"check": "cmdsc_confirmed_plan_matches", "record_refs": ["import_commit_request"], "records": []})

    def test_duplicate_plan_identity_rejects(self):
        case = plan_case_without_applied_result()
        case["records"].append(copy.deepcopy(case["records"][1]))
        self.assert_rejected(case)

    def test_changed_commit_content_and_assertion_rejected(self):
        case = plan_case_without_applied_result()
        commit = case["records"][2]
        commit["entries"][1]["draft_content"]["template_body"] = "Altered after review."
        commit["entries"][1]["expected_file_sha256"] = "f" * 64
        self.assert_rejected(case)

    def test_commit_project_retarget_rejected(self):
        case = plan_case_without_applied_result()
        case["records"][2]["project_id"] = "proj-demo-002"
        self.assert_rejected(case)

    def test_preview_request_project_retarget_rejected(self):
        case = plan_case_without_applied_result()
        case["records"][0]["project_id"] = "proj-demo-002"
        self.assert_rejected(case)

    def test_reviewed_witness_content_changed_under_same_hash_rejected(self):
        case = plan_case_without_applied_result()
        preview_result = case["records"][1]
        self.assertIn("reviewed_plan", preview_result, "companion must carry full reviewed plan")
        preview_result["reviewed_plan"]["entries"][0]["draft_content"]["template_body"] = "Altered witness."
        self.assert_rejected(case)

    def test_commit_without_exact_preview_plan_fails_closed(self):
        case = {
            "check": "cmdsc_confirmed_plan_matches",
            "record_refs": [],
            "records": [copy.deepcopy(VALID["import_commit_request"])],
        }
        failures, unevaluable = evaluate(case)
        self.assertTrue(failures or unevaluable, "commit without an F5 plan was accepted")

    def test_stale_mutation_rejected_even_with_higher_result_generation(self):
        case = copy.deepcopy(CASES["sem_stale_generation_mutated_reject"])
        mutated = next(
            record for record in case["records"]
            if record.get("record_kind") == "commands_shortcuts_action_result"
            and record.get("outcome") == "mutated"
        )
        mutated["list_generation"] = 13  # expected=11, witnessed current=12
        self.assert_rejected(case)


if __name__ == "__main__":
    unittest.main()
