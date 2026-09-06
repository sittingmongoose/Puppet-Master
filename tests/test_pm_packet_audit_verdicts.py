"""Synthetic audit metadata tests, never product review results."""

from __future__ import annotations

import copy
import importlib.util
from pathlib import Path
import sys
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_packet_audit_verdicts import suite_case_scopes, validate_suite_case_verdicts


def load_module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


AUDIT = load_module("packet_audit", "pm-integration-packet-audit.py")
WORK = load_module("packet_audit_work", "pm-integration-packet-audit-work.py")


class SuiteVerdictScopeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.manifest = {
            "required_suite_verdicts": ["onboarding", "guided_tour", "doctor", "onboarding_doctor_overall", "settings", "overall"],
            "groups": [
                {"group_id": "combined", "suite": "onboarding_doctor", "cases": [
                    {"case_id": "ONB-001", "metadata": {"area": "onboarding"}},
                    {"case_id": "TOUR-001", "metadata": {"area": "tour"}},
                    {"case_id": "DOC-001", "metadata": {"area": "doctor"}},
                    {"case_id": "SH-001", "metadata": {"area": "shared"}},
                ]},
                {"group_id": "settings", "suite": "settings", "cases": [{"case_id": "SET-001"}]},
            ],
        }
        self.rows = [
            {"case_ref": f"{group['group_id']}/{case['case_id']}", "suite": group["suite"], "status": "pass"}
            for group in self.manifest["groups"] for case in group["cases"]
        ]
        self.verdicts = {key: {"verdict": "pass"} for key in self.manifest["required_suite_verdicts"]}

    def failures(self):
        return validate_suite_case_verdicts(self.manifest, self.rows, self.verdicts)

    def test_combined_source_and_synthetic_verdicts_have_exact_scopes(self) -> None:
        scopes, failures = suite_case_scopes(self.manifest)
        self.assertEqual(failures, [])
        self.assertEqual(scopes["onboarding"], {"combined/ONB-001", "combined/SH-001"})
        self.assertEqual(scopes["guided_tour"], {"combined/TOUR-001", "combined/SH-001"})
        self.assertEqual(scopes["doctor"], {"combined/DOC-001", "combined/SH-001"})
        self.assertEqual(len(scopes["onboarding_doctor_overall"]), 4)
        self.assertEqual(len(scopes["overall"]), 5)
        self.assertEqual(self.failures(), [])

    def test_product_failure_reaches_its_verdict_and_both_rollups(self) -> None:
        self.rows[1]["status"] = "fail"
        failures = self.failures()
        for suite in ("guided_tour", "onboarding_doctor_overall", "overall"):
            self.assertTrue(any(row.startswith(f"suite {suite}:") for row in failures), failures)
        self.assertFalse(any(row.startswith("suite onboarding:") or row.startswith("suite doctor:") for row in failures))

    def test_every_cross_cutting_area_constrains_all_product_verdicts(self) -> None:
        for area in ("shared", "impact", "testing", "performance", "remote_access", "server_discovery"):
            with self.subTest(area=area):
                self.manifest["groups"][0]["cases"][-1]["metadata"]["area"] = area
                self.rows[3]["status"] = "partial"
                failures = self.failures()
                for suite in ("onboarding", "guided_tour", "doctor", "onboarding_doctor_overall", "overall"):
                    self.assertTrue(any(row.startswith(f"suite {suite}:") for row in failures), failures)

    def test_overall_pass_cannot_ignore_another_suite(self) -> None:
        self.rows[-1]["status"] = "blocked"
        self.assertTrue(any(row.startswith("suite overall:") for row in self.failures()))

    def test_missing_duplicate_and_relabelled_results_do_not_narrow_scope(self) -> None:
        original = copy.deepcopy(self.rows)
        for mutation, message in (
            (lambda: self.rows.pop(1), "missing source case"),
            (lambda: self.rows.append(copy.deepcopy(self.rows[1])), "duplicate source case"),
            (lambda: self.rows[1].update(suite="settings"), "source suite identity drift"),
        ):
            with self.subTest(message=message):
                self.rows = copy.deepcopy(original)
                mutation()
                self.assertTrue(any(message in row and row.startswith("suite guided_tour:") for row in self.failures()))

    def test_unknown_area_or_uncovered_verdict_is_not_an_empty_pass(self) -> None:
        self.manifest["groups"][0]["cases"][0]["metadata"]["area"] = "new_unknown_area"
        self.assertTrue(any("unknown Onboarding/Doctor area" in row for row in self.failures()))
        self.manifest["required_suite_verdicts"].append("uncovered")
        self.verdicts["uncovered"] = {"verdict": "pass"}
        self.assertTrue(any("uncovered: pass requires nonempty" in row for row in self.failures()))

    def test_missing_verdict_cannot_drop_a_whole_source_suite(self) -> None:
        self.manifest["required_suite_verdicts"].remove("settings")
        self.verdicts.pop("settings")
        self.assertTrue(any("no required verdict 'settings'" in row for row in self.failures()))

    def test_honest_blocked_results_are_not_promoted_or_rejected(self) -> None:
        for row in self.rows:
            row["status"] = "blocked"
        for item in self.verdicts.values():
            item["verdict"] = "blocked"
        self.assertEqual(self.failures(), [])
        self.assertTrue(all(item["verdict"] == "blocked" for item in self.verdicts.values()))

    def test_both_final_and_metadata_validators_use_same_contract(self) -> None:
        sentinel = "synthetic scope sentinel"
        report = {
            "case_results": [], "suite_verdicts": self.verdicts,
            "aggregate_verdict": "blocked", "blockers": ["synthetic harness"],
            "unresolved_findings": [], "reviewers": [],
        }
        with mock.patch.object(AUDIT, "validate_suite_case_verdicts", return_value=[sentinel]) as check:
            failures = AUDIT.validate_report(self.manifest, report)
            self.assertIn(sentinel, failures)
            check.assert_called_once()
        with (
            mock.patch.object(WORK, "read_json", return_value=report),
            mock.patch.object(WORK, "validate_suite_case_verdicts", return_value=[sentinel]) as check,
        ):
            _, failures = WORK.validate_metadata(Path("unused"), self.manifest, "synthetic", [])
            self.assertIn(sentinel, failures)
            check.assert_called_once()


if __name__ == "__main__":
    unittest.main()
