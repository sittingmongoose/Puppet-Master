"""Regressions for scripts/pm-ea-usage-retention-check.py (SP-594 Usage retention companion).

The companion must pass on the live registry, where usage.event is admitted, without appending a
second family, and it must keep refusing a registry that lacks the family or states a wrong
retention setting. Each case is one full companion run against a registry document.
"""
import copy
import importlib.util
import json
import sys
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "scripts"))
REGISTRY = REPO / "Plans/event_family_registry.json"


def _checker():
    spec = importlib.util.spec_from_file_location(
        "pm_ea_usage_retention_check", REPO / "scripts/pm-ea-usage-retention-check.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class UsageRetentionCompanionTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.checker = _checker()
        cls.registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
        cls.live = cls.checker.check()

    def test_live_registry_passes_without_appending(self):
        report = self.live
        failed = [name for name, passed in report["checks"].items() if not passed]
        self.assertEqual("pass", report["status"], failed)
        self.assertEqual(518, report["existing_registry_rows"])
        self.assertEqual(1, report["registered_usage_rows"])
        self.assertEqual([], report["appended_diagnostics"])
        self.assertTrue(report["checks"]["registered_usage_row_matches_derived"])

    def test_live_registry_keeps_one_usage_row(self):
        live = json.loads(REGISTRY.read_text(encoding="utf-8"))
        event_types = [family["event_type"] for family in live["families"]]
        self.assertEqual(518, len(event_types))
        self.assertEqual(1, event_types.count("usage.event"))

    def test_missing_usage_event_refused(self):
        registry = copy.deepcopy(self.registry)
        registry["families"] = [f for f in registry["families"] if f["event_type"] != "usage.event"]
        report = self.checker.check(registry)
        self.assertEqual("fail", report["status"])
        self.assertEqual(0, report["registered_usage_rows"])
        self.assertFalse(report["checks"]["existing_registry_diagnostics_zero"])
        codes = {failure["error"] for failure in report["registry_diagnostics"]}
        self.assertIn("event_family_registry_kernel_row_count_mismatch", codes)

    def test_wrong_retention_setting_refused(self):
        registry = copy.deepcopy(self.registry)
        row = next(f for f in registry["families"] if f["event_type"] == "usage.event")
        row["retention_policy_ref"] = dict(row["retention_policy_ref"], setting_key="ai.usage.wrong")
        report = self.checker.check(registry)
        self.assertEqual("fail", report["status"])
        self.assertEqual(1, report["registered_usage_rows"])
        self.assertFalse(report["checks"]["registered_usage_row_matches_derived"])
        codes = {failure["error"] for failure in report["registry_diagnostics"]}
        self.assertIn("event_family_registry_setting_retention_setting_key_mismatch", codes)


if __name__ == "__main__":
    unittest.main()
