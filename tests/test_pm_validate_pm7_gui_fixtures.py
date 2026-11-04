"""The PM7 GUI fixture validator has to fail closed when its fixture directories are not there.

The fixtures are gitignored, so a checkout that has not been handed them has none of them. The
validator used to read one anyway and die with a FileNotFoundError, and its caller recorded the
traceback, absolute checkout path and all, as `invalid_validator_output`. These fixtures put the
directories out of reach and assert a named failure and a nonzero exit instead.
"""

from __future__ import annotations

import importlib.util
import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

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


class CompactionOwnerBoundary(unittest.TestCase):
    def setUp(self):
        self.module = load_validator()
        self.registry = self.module.load(self.module.EVENT_REGISTRY)
        self.fixtures = self.module.load(self.module.COMMAND_FIXTURES)

    def report(self, registry=None, fixtures=None):
        original_load = self.module.load

        def load(path):
            if path == self.module.EVENT_REGISTRY:
                return self.registry if registry is None else registry
            if path == self.module.COMMAND_FIXTURES:
                return self.fixtures if fixtures is None else fixtures
            return original_load(path)

        # This class tests the GUI census only. Run the real shared-contract
        # validator separately; mocks cannot establish fixture value validity.
        with patch.object(self.module, "load", side_effect=load), patch.object(
            self.module.subprocess, "run", return_value=subprocess.CompletedProcess([], 0, "")
        ):
            return self.module.validate()

    def test_current_committed_completion_contract_is_not_forbidden(self):
        report = self.report()
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["context_compaction_event_family_count"], 1)

    def test_completion_membership_is_required_exactly_once(self):
        for count in (0, 2):
            registry = copy.deepcopy(self.registry)
            family = next(f for f in registry["families"] if f["event_type"] == "context.compaction.completed")
            registry["families"] = [f for f in registry["families"] if f["event_type"] != "context.compaction.completed"]
            registry["families"].extend(copy.deepcopy(family) for _ in range(count))
            with self.subTest(count=count):
                self.assertIn("context_compaction_completion_family_count", {f["error"] for f in self.report(registry)["failures"]})

    def test_unregistered_sibling_types_remain_forbidden(self):
        for event_type in ("context.compaction.started", "context.compaction.failed", "context.compaction.future"):
            registry = copy.deepcopy(self.registry)
            registry["families"].append({"event_type": event_type})
            with self.subTest(event_type=event_type):
                failures = self.report(registry)["failures"]
                self.assertIn({"error": "forbidden_context_compaction_event_family", "events": [event_type]}, failures)

    def test_completion_cannot_borrow_another_payload_or_scope(self):
        mutations = {
            "family_id": "foreign-family", "family_revision": "2.0.0",
            "scope_policy": "application_only", "payload_schema_id": "foreign.schema.v1",
            "payload_schema_ref": {"path": "Plans/foreign.schema.json", "json_pointer": "#"},
        }
        for key, value in mutations.items():
            registry = copy.deepcopy(self.registry)
            family = next(f for f in registry["families"] if f["event_type"] == "context.compaction.completed")
            family[key] = value
            with self.subTest(field=key):
                self.assertIn("context_compaction_completion_registry_mismatch", {f["error"] for f in self.report(registry)["failures"]})

    def test_committed_completion_positive_is_required(self):
        fixtures = copy.deepcopy(self.fixtures)
        fixtures["valid"] = [f for f in fixtures["valid"] if f["name"] != "pm7_context_compaction_committed_completion_event"]
        failures = self.report(fixtures=fixtures)["failures"]
        self.assertIn({"error": "missing_pm7_valid_command_fixtures", "missing": ["pm7_context_compaction_committed_completion_event"]}, failures)

    def test_each_current_completion_boundary_negative_is_required(self):
        names = (
            "pm7_context_compaction_completed_requires_event",
            "pm7_context_compaction_completed_cannot_duplicate_event",
            "pm7_context_compaction_failed_cannot_emit_completion",
            "pm7_context_compaction_started_cannot_emit_completion",
            "pm7_context_compaction_completed_cannot_emit_started",
            "pm7_context_compaction_completed_cannot_emit_failed",
        )
        for name in names:
            fixtures = copy.deepcopy(self.fixtures)
            fixtures["invalid"] = [f for f in fixtures["invalid"] if f["name"] != name]
            with self.subTest(name=name):
                self.assertIn({"error": "missing_pm7_invalid_command_fixtures", "missing": [name]}, self.report(fixtures=fixtures)["failures"])


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
