"""Regression tests for the date-time command named in the NUMRULE sweep."""

import contextlib
import io
import json
from pathlib import Path
import runpy
import subprocess
import sys
import unittest
from unittest.mock import patch

import pm_event_numbers


ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / "scripts/pm_event_datetime.py"
CORPUS = ROOT / "Plans/event_number_recipe_corpus.json"


class DateTimeCliTest(unittest.TestCase):
    def run_cli(self, *args):
        return subprocess.run(
            [sys.executable, "-B", str(CLI), *args],
            cwd=ROOT.parent,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_self_test_checks_committed_corpus_and_inventory(self):
        result = self.run_cli("--self-test")
        self.assertTrue(result.stdout, f"no self-test report (exit {result.returncode}): {result.stderr}")
        report = json.loads(result.stdout)
        self.assertEqual(report["self_test_scope"], "all")
        self.assertEqual(report["corpus_cases"], len(json.loads(CORPUS.read_text())["cases"]))
        inventory_status = report["datetime_inventory"]["status"]
        if inventory_status == "pass":
            self.assertIn("datetime_inventory_complete_and_classified", report["owner_integration_checks"])
            self.assertTrue(report["owner_integration_checks"]["datetime_inventory_complete_and_classified"])
            self.assertTrue(report["outcomes"])
            self.assertIn(report["status"], ("pass", "fail"))
            self.assertEqual(result.returncode, int(report["status"] != "pass"))
        else:
            self.assertEqual(inventory_status, "fail")
            self.assertEqual(report["status"], "fail")
            self.assertEqual(report["case_execution"], "NOT_RUN_ADMISSION_REFUSED")
            self.assertEqual(report["outcomes"], {})
            self.assertEqual(result.returncode, 1)

    def test_usage_refuses_missing_and_unsupported_arguments(self):
        for args in ((), ("--unknown",), ("--self-test", "--scope", "numbers")):
            with self.subTest(args=args):
                result = self.run_cli(*args)
                self.assertEqual(result.returncode, 2)
                self.assertIn("usage:", result.stderr)
                self.assertEqual(result.stdout, "")

    def test_self_test_propagates_suite_status(self):
        for status, exit_code in (("pass", 0), ("fail", 1)):
            with self.subTest(status=status):
                report = {"status": status}
                stdout = io.StringIO()
                with patch.object(pm_event_numbers, "self_test", return_value=report) as suite, \
                     patch.object(sys, "argv", [str(CLI), "--self-test"]), \
                     contextlib.redirect_stdout(stdout), self.assertRaises(SystemExit) as exit_:
                    runpy.run_path(str(CLI), run_name="__main__")
                suite.assert_called_once_with(CORPUS, scope="all")
                self.assertEqual(exit_.exception.code, exit_code)
                self.assertEqual(json.loads(stdout.getvalue()), report)


if __name__ == "__main__":
    unittest.main()
