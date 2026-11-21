"""CLI regressions for the NUMRULE date-time self-test and frozen module."""

from contextlib import redirect_stdout
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
CLI = ROOT / "scripts/pm_event_datetime_selftest.py"
CORPUS = ROOT / "Plans/event_number_recipe_corpus.json"


class DateTimeCliTest(unittest.TestCase):
    def run_cli(self, *args):
        return subprocess.run(
            [sys.executable, "-B", str(CLI), *args],
            cwd=ROOT.parent,
            capture_output=True,
            text=True,
        )

    def test_old_command_is_silent(self):
        result = subprocess.run(
            [sys.executable, "-B", "scripts/pm_event_datetime.py", "--self-test"],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        self.assertEqual((result.returncode, result.stdout, result.stderr), (0, "", ""))

    def test_self_test_checks_committed_corpus_and_inventory(self):
        result = self.run_cli("--self-test")
        self.assertEqual(result.stderr, "")
        report = json.loads(result.stdout)
        self.assertEqual(report["self_test_scope"], "all")
        self.assertEqual(report["corpus_cases"], len(json.loads(CORPUS.read_text())["cases"]))
        inventory = report["datetime_inventory"]
        if inventory["status"] == "pass":
            self.assertIs(report["owner_integration_checks"]["datetime_inventory_complete_and_classified"], True)
            self.assertIn("datetime-leap-offset", report["outcomes"])
            self.assertIn(report["status"], ("pass", "fail"))
            self.assertEqual(result.returncode, int(report["status"] != "pass"))
        else:
            self.assertEqual(inventory["status"], "fail")
            self.assertTrue(inventory["failures"])
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
                with (
                    patch.object(pm_event_numbers, "self_test", return_value=report) as suite,
                    patch.object(sys, "argv", [str(CLI), "--self-test"]),
                    redirect_stdout(stdout),
                    self.assertRaises(SystemExit) as exit_,
                ):
                    runpy.run_path(str(CLI), run_name="__main__")
                suite.assert_called_once_with(CORPUS, scope="all")
                self.assertEqual(exit_.exception.code, exit_code)
                self.assertEqual(json.loads(stdout.getvalue()), report)


if __name__ == "__main__":
    unittest.main()
