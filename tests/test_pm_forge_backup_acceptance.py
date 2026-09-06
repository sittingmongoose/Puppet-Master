"""Static custody regressions; these do not execute packet E2E scenarios."""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/pm-forge-backup-acceptance-verify.py"
SPEC = importlib.util.spec_from_file_location("forge_acceptance", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)


class ForgeAcceptanceCustodyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.data = validator.load_json(validator.DATA_PATH)
        cls.schema = validator.load_json(validator.SCHEMA_PATH)

    def validate(self, data=None):
        return validator.validate(self.data if data is None else data, self.schema, None)

    def assert_rejected(self, data, code: str) -> None:
        report = self.validate(data)
        self.assertEqual(report["status"], "fail")
        self.assertIn(code, {failure["code"] for failure in report["failures"]})

    def test_complete_self_contained_custody(self) -> None:
        with mock.patch.object(validator, "compare_optional_source", side_effect=AssertionError("scratchpad dependency")):
            report = self.validate()
        self.assertEqual(report["status"], "pass", report["failures"])
        for key, value in {
            "scenario_count": 67, "requirement_count": 132,
            "requirement_join_count": 132, "scenario_join_edge_count": 116,
            "empty_scenario_join_count": 46, "owner_plan_unit_ref_count": 61,
            "executed_scenario_count": 0, "scenario_evidence_count": 0,
            "static_custody_only": True, "all_scenarios_not_run": True,
        }.items():
            self.assertEqual(report["metrics"][key], value, key)

    def test_original_append_order_is_retained(self) -> None:
        ids = validator.expected_requirement_ids()
        self.assertEqual(len(ids), 132)
        self.assertEqual(ids[-5:], ["BKP-011", "SAUTH-005", "MAT-005", "BKP-012", "OWN-006"])
        self.assertEqual(ids, [row["id"] for row in self.data["requirements"]])
        self.assertEqual(ids, [row["requirement_id"] for row in self.data["requirement_joins"]])

    def test_scenario_content_cannot_be_summarized(self) -> None:
        for field in ("title", "setup", "steps", "expected", "requirement_refs", "evidence_required"):
            with self.subTest(field=field):
                data = copy.deepcopy(self.data)
                data["scenarios"][0][field] = ["shortened"] if isinstance(data["scenarios"][0][field], list) else "shortened"
                self.assert_rejected(data, "canonical_body_hash_mismatch")

    def test_requirement_or_additional_test_obligation_cannot_be_dropped(self) -> None:
        for section, field in (("requirements", "requirement"), ("requirement_joins", "additional_test_owner_requirement")):
            with self.subTest(section=section):
                data = copy.deepcopy(self.data)
                data[section][0][field] = "shortened"
                self.assert_rejected(data, "canonical_body_hash_mismatch")

    def test_missing_duplicate_and_reordered_scenarios_fail(self) -> None:
        for mutation, code in (
            (lambda rows: rows.pop(), "scenario_id_set_or_order_mismatch"),
            (lambda rows: rows.__setitem__(1, copy.deepcopy(rows[0])), "duplicate_scenario_id"),
            (lambda rows: rows.reverse(), "scenario_id_set_or_order_mismatch"),
        ):
            with self.subTest(code=code):
                data = copy.deepcopy(self.data)
                mutation(data["scenarios"])
                self.assert_rejected(data, code)

    def test_reverse_coverage_loss_fails(self) -> None:
        data = copy.deepcopy(self.data)
        next(row for row in data["requirement_joins"] if row["scenario_ids"])["scenario_ids"] = []
        self.assert_rejected(data, "bidirectional_join_mismatch")

    def test_false_execution_and_evidence_claims_fail(self) -> None:
        data = copy.deepcopy(self.data)
        data["scenarios"][0]["execution_status"] = "PASS"
        data["scenarios"][0]["evidence"] = ["fabricated-result.json"]
        self.assert_rejected(data, "false_execution_claim")
        data = copy.deepcopy(self.data)
        data["requirement_joins"][0]["runtime_status"] = "PASS"
        self.assert_rejected(data, "false_requirement_execution_claim")
        data = copy.deepcopy(self.data)
        data["execution_state"]["executed_scenario_count"] = 67
        self.assert_rejected(data, "instance_schema_invalid")

    def test_declared_hashes_cannot_repin_source(self) -> None:
        data = copy.deepcopy(self.data)
        data["source_files"]["acceptance_scenarios"]["sha256"] = "0" * 64
        self.assert_rejected(data, "declared_source_hash_mismatch")
        data = copy.deepcopy(self.data)
        data["scenarios"][0]["expected"] = "replaced"
        data["integrity"]["scenarios_body_sha256"] = validator.body_hash(data["scenarios"])
        self.assert_rejected(data, "canonical_body_hash_mismatch")

    def test_schema_rejects_unknown_fields_and_invalid_timestamp(self) -> None:
        for field, value in (("native_pass", True), ("created_at", "not-a-date")):
            with self.subTest(field=field):
                data = copy.deepcopy(self.data)
                data[field] = value
                self.assert_rejected(data, "instance_schema_invalid")

    def test_missing_requested_source_fails_instead_of_silently_skipping(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            report = validator.validate(self.data, self.schema, Path(directory))
        self.assertEqual(report["status"], "fail")
        self.assertEqual(sum(row["code"] == "optional_source_missing" for row in report["failures"]), 4)

    def test_owner_references_are_bounded_and_resolve_real_planunits(self) -> None:
        for ref, code in (
            ("Plans/../README.md#TEST-001", "owner_ref_outside_plans"),
            ("Plans/00-plans-index.md#MISSING-999", "owner_plan_unit_missing"),
            ("Plans/no-such-owner.md#TEST-001", "owner_doc_missing"),
            ("README.md#TEST-001", "owner_ref_invalid"),
        ):
            with self.subTest(ref=ref):
                failures = []
                validator.validate_owner_ref(ref, failures)
                self.assertEqual([row["code"] for row in failures], [code])

    def test_standalone_cli_and_registered_wrapper(self) -> None:
        for argv in ([sys.executable, str(SCRIPT)], [sys.executable, "scripts/pm-plans-verify.py", "validate-forge-backup-acceptance"]):
            with self.subTest(argv=argv):
                proc = subprocess.run(argv, cwd=ROOT, capture_output=True, text=True, timeout=15)
                self.assertEqual(proc.returncode, 0, proc.stderr + proc.stdout)
                report = json.loads(proc.stdout)
                self.assertEqual(report["status"], "pass")
                self.assertEqual(report["failures"], [])


if __name__ == "__main__":
    unittest.main()
