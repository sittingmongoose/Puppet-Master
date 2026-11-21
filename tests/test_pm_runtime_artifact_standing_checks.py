"""Regression checks for the real DR S6 mutation and its control."""

import importlib.util
import json
import sys
import unittest
from pathlib import Path
from unittest import mock


SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
SPEC = importlib.util.spec_from_file_location("dr_standing", SCRIPTS / "pm-runtime-artifact-standing-checks.py")
assert SPEC is not None and SPEC.loader is not None
standing = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(standing)

FAMILY = "runtime_artifact.cost_usage"


class RuntimeArtifactStandingChecksTests(unittest.TestCase):
    def test_s6_reports_real_oversized_integer_exception(self):
        original_limit = sys.get_int_max_str_digits()
        sys.set_int_max_str_digits(4300)
        self.addCleanup(sys.set_int_max_str_digits, original_limit)
        load_module = standing.module

        def focused_module(source=None):
            checker = load_module(source)

            def check_family(families):
                self.assertEqual(families, {FAMILY})
                row, fixtures, positive = self.family_inputs(checker)
                append = self.appender(checker, row, fixtures)
                result = append(dict(positive, sequence_id=10**4399), True)
                self.assertEqual(result, "invalid")
                print(json.dumps({"status": "pass", "failures": [], "per_family": {FAMILY: 1, "shared": 0}}))
                return 0

            checker.main = check_family
            return checker

        with mock.patch.object(standing, "ONLY_FAMILIES", {FAMILY}), mock.patch.object(
            standing, "memory_check", return_value=10
        ), mock.patch.object(standing, "module", side_effect=focused_module), mock.patch.object(
            standing, "CANONICAL_CASES", []
        ):
            code, baseline = standing.family_checkers(focused_module())
            self.assertEqual(code, 0, baseline["failures"])
            self.assertEqual(baseline["per_family"][FAMILY], 1)
            result = standing.run("S6_compare_Storage_metadata", 6, standing.storage_in_semantic)
        self.assertEqual(result["exit_code"], 1)
        self.assertTrue(result["caught"])
        self.assertEqual(result["family_run_exceptions"], {FAMILY: "ValueError"})
        self.assertEqual(result["per_family_failures"][FAMILY], [])

    @staticmethod
    def family_inputs(checker):
        contracts = checker.load("Plans/runtime_artifact_event_drafts.json")
        fixtures = checker.load("Plans/runtime_artifact_event_drafts.fixtures.json")
        row = next(row for row in contracts["rows"] if row["event_type"] == FAMILY)
        return row, fixtures, fixtures["positive_events"][FAMILY]

    @staticmethod
    def appender(checker, row, fixtures):
        return checker.AppendModel(
            row, {}, fixtures["first_append_receipts"][FAMILY], fixtures["custody_template"]
        ).append

    def test_s6_distinguishes_original_and_mutated_valid_storage_retry(self):
        original = standing.module()
        mutated = standing.module()
        standing.storage_in_semantic(mutated)
        row, fixtures, positive = self.family_inputs(original)
        retry = dict(positive, sequence_id=fixtures["storage_mutations"]["sequence_id"])
        for checker, expected in [(original, "original"), (mutated, "idempotency_conflict")]:
            with self.subTest(expected=expected):
                append = self.appender(checker, row, fixtures)
                first = append(positive, True)
                self.assertIsInstance(first, dict)
                self.assertEqual(append(retry, True), first if expected == "original" else expected)


if __name__ == "__main__":
    unittest.main()
