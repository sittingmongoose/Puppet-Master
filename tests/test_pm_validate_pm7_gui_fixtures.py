"""The PM7 GUI fixture validator has to fail closed when its fixture directories are not there.

The fixtures are gitignored, so a checkout that has not been handed them has none of them. The
validator used to read one anyway and die with a FileNotFoundError, and its caller recorded the
traceback, absolute checkout path and all, as `invalid_validator_output`. These fixtures put the
directories out of reach and assert a named failure and a nonzero exit instead.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "pm-validate-pm7-gui-fixtures.py"


def load_validator():
    spec = importlib.util.spec_from_file_location("pm_validate_pm7_gui_fixtures", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class MissingFixtureRoots(unittest.TestCase):
    def setUp(self):
        self.module = load_validator()
        self.scratch = tempfile.TemporaryDirectory()
        self.addCleanup(self.scratch.cleanup)
        base = Path(self.scratch.name)
        self.module.ROOT = base
        self.module.USAGE_ROOT = base / "tests/fixtures/usage_gui"
        self.module.SHARED_ROOT = base / "tests/fixtures/pm7_shared"
        self.module.USAGE_MATRIX = self.module.USAGE_ROOT / "golden/usage_gui_acceptance_fixtures.json"

    def test_both_missing_roots_are_named(self):
        failures = self.module.missing_inputs()
        self.assertEqual(
            sorted((f["error"], f["path"]) for f in failures),
            [
                ("fixture_root_missing", "tests/fixtures/pm7_shared"),
                ("fixture_root_missing", "tests/fixtures/usage_gui"),
            ],
        )

    def test_validate_reports_instead_of_raising(self):
        report = self.module.validate()
        self.assertEqual(report["status"], "fail")
        self.assertEqual(report["schema_id"], "pm.pm7_gui_fixture_validation.v1")
        self.assertEqual({f["error"] for f in report["failures"]}, {"fixture_root_missing"})
        # The caller reads these counts; they have to be present and honest, not absent.
        for key in ("usage_fixture_file_count", "usage_fixture_count", "shared_fixture_file_count",
                    "workspace_event_valid_count", "context_compaction_event_family_count"):
            self.assertEqual(report[key], 0, key)

    def test_the_report_carries_no_absolute_path(self):
        """The old traceback named the checkout it ran in, which made one failure look like two."""
        text = json.dumps(self.module.validate())
        self.assertNotIn(self.scratch.name, text)
        self.assertNotIn(str(ROOT), text)

    def test_a_missing_shared_file_is_named_on_its_own(self):
        shared = self.module.SHARED_ROOT
        shared.mkdir(parents=True)
        (self.module.USAGE_ROOT / "golden").mkdir(parents=True)
        self.module.USAGE_MATRIX.write_text("{}", encoding="utf-8")
        for name in sorted(self.module.EXPECTED_SHARED_FILES):
            if name != "motion_frame_matrix.json":
                (shared / name).write_text("{}", encoding="utf-8")
        failures = self.module.missing_inputs()
        self.assertEqual(
            [(f["error"], f["path"]) for f in failures],
            [("shared_fixture_file_missing", "tests/fixtures/pm7_shared/motion_frame_matrix.json")],
        )

    def test_a_missing_usage_matrix_is_named_on_its_own(self):
        self.module.SHARED_ROOT.mkdir(parents=True)
        self.module.USAGE_ROOT.mkdir(parents=True)
        for name in self.module.EXPECTED_SHARED_FILES:
            (self.module.SHARED_ROOT / name).write_text("{}", encoding="utf-8")
        failures = self.module.missing_inputs()
        self.assertEqual(
            [(f["error"], f["path"]) for f in failures],
            [("usage_fixture_matrix_missing", "tests/fixtures/usage_gui/golden/usage_gui_acceptance_fixtures.json")],
        )

    def test_nothing_is_missing_in_this_checkout(self):
        """A guard on the guard: in a checkout that has the fixtures, this must find nothing, or
        every run would report a missing input that is right there."""
        self.assertEqual(load_validator().missing_inputs(), [])


class ExitCode(unittest.TestCase):
    def test_a_checkout_without_the_fixtures_exits_nonzero_with_json(self):
        with tempfile.TemporaryDirectory() as scratch:
            shim = Path(scratch) / "scripts"
            shim.mkdir(parents=True)
            (shim / SCRIPT.name).write_text(SCRIPT.read_text(encoding="utf-8"), encoding="utf-8")
            proc = subprocess.run(
                [sys.executable, str(shim / SCRIPT.name)],
                capture_output=True, text=True, cwd=scratch,
            )
        self.assertNotEqual(proc.returncode, 0)
        self.assertNotIn("Traceback", proc.stderr)
        report = json.loads(proc.stdout)
        self.assertEqual(report["status"], "fail")
        self.assertEqual({f["error"] for f in report["failures"]}, {"fixture_root_missing"})


if __name__ == "__main__":
    unittest.main()
