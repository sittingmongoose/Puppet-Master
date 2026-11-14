"""Regression witnesses for exact-refusal-only mutation credit on real tables."""
import copy
import importlib.util
import itertools
import runpy
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_guard_isolation as g
import pm_pnc019_s4o2_oracles as cells
import pm_runtime_artifact_table_append_policy as policy
import pm_dg6a_table_history_custody as custody_table


class ExactMutationCredit(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        path = "scripts/pm_runtime_artifact_table_append_policy.py"
        cls.negative = g.Negative("wrong-policy", {"replay_policy": "append_once"},
                                  "A03b_policy", "invalid", "valid-policy", "one writer policy change")
        suite = g.Suite("S4o2 actual DR writer policy", policy.policy_case,
                        [g.Control("valid-policy", {"replay_policy": "dedupe_by_idempotency_key"}, "append")],
                        [cls.negative], (path,), ROOT,
                        non_guards=[g.NonGuard(path, "policy_case", "return", "return g.Case(table, check, context)",
                                              "Return the fresh execution object, with no acceptance decision.")])
        cls.report = g.run(suite)
        cls.record = dict(id=cls.negative.id, target=cls.negative.target, code=cls.negative.code)

    def test_actual_gated_proof_earns_credit(self):
        self.assertEqual(self.report["status"], "PASS", self.report["failures"])
        self.assertTrue(cells.mutation_credit(self.report, self.record))

    def test_other_guard_same_code_earns_no_credit(self):
        report = copy.deepcopy(self.report)
        report["negatives"][0]["outcome"]["guard"] = "another-row"
        self.assertFalse(cells.mutation_credit(report, self.record))

    def test_expected_guard_wrong_code_earns_no_credit(self):
        report = copy.deepcopy(self.report)
        report["negatives"][0]["outcome"]["code"] = "another-code"
        self.assertFalse(cells.mutation_credit(report, self.record))

    def test_cut_crash_earns_no_credit(self):
        report = copy.deepcopy(self.report)
        report["rows"][0]["results"][1]["outcome"] = {"accepted": False, "error": "KeyError"}
        self.assertFalse(cells.mutation_credit(report, self.record))

    def test_restoration_wrong_refusal_earns_no_credit(self):
        report = copy.deepcopy(self.report)
        report["rows"][0]["restoration"][1]["outcome"]["code"] = "unrelated"
        self.assertFalse(cells.mutation_credit(report, self.record))

    def test_missing_trace_earns_no_credit(self):
        report = copy.deepcopy(self.report)
        report["rows"][0]["trace_checks"] = []
        self.assertFalse(cells.mutation_credit(report, self.record))

    def test_oversized_table_earns_no_credit(self):
        report = copy.deepcopy(self.report)
        report["inventory"] = report["inventory"] * 9
        self.assertFalse(cells.mutation_credit(report, self.record))

    def test_tool_failure_earns_no_credit_even_with_proved_row(self):
        report = copy.deepcopy(self.report)
        report["status"] = "FAIL"
        self.assertFalse(cells.mutation_credit(report, self.record))

    def test_missing_restoration_earns_no_credit(self):
        report = copy.deepcopy(self.report)
        report["rows"][0]["restoration"] = []
        self.assertFalse(cells.mutation_credit(report, self.record))

    def test_crash_is_not_expected_refusal(self):
        self.assertFalse(cells.expected_refusal(
            {"accepted": False, "guard": "A03b_policy", "code": "invalid", "error": "ValueError"},
            "A03b_policy", "invalid"))


class Assignment(unittest.TestCase):
    def test_bounded_panel_phases_preserve_refusals_and_order(self):
        import pm_dg6a_tables as tables
        from pm_dg6a_phase_groups import ALIASES
        spec = runpy.run_path(str(ROOT / "scripts/pm-dg6a-table-generate.py"))
        self.assertEqual(set(ALIASES), spec["PANEL_PHASES"])
        for phase, originals in spec["PANEL_ROWS"].items():
            parts = ALIASES[phase]
            actual = [row for part in parts for row in spec["MODULES"][part][1]]
            self.assertEqual(actual, originals)
            self.assertTrue(all(1 <= len(tables.rows(part)) <= 8 for part in parts))
            names = tables.fields(phase)
            for bits in itertools.product((False, True), repeat=len(names)):
                value = dict(zip(names, bits))
                expected = [code for _, _, _, code, cond in originals
                            if eval(cond, {"__builtins__": {}}, {"value": value})]
                self.assertEqual(tables.every(phase, **value), expected, (phase, value))
                self.assertEqual(tables.first(phase, **value), next(iter(expected), None))
            tables.RECORDER = []
            try:
                tables.every(phase, **dict.fromkeys(names, True))
                self.assertEqual([p for p, _, _ in tables.RECORDER], list(parts))
                self.assertTrue(all(len(tables.rows(p)) <= 8 for p, _, _ in tables.RECORDER))
            finally:
                tables.RECORDER = None

    def test_exact_split(self):
        document = cells.manifest()
        self.assertEqual(len(document["rows"]), 93)
        self.assertEqual([r["event_type"] for r in document["rows"]
                          if r["baseline_oracle_status"] == "NOT_APPLICABLE"],
                         ["settings.theme.updated", "settings.updated"])

    def test_all_twelve_lanes_have_executable_jobs(self):
        document = cells.manifest()
        for lane in cells.LANES:
            names = [r["event_type"] for r in document["rows"] if r["lane"] == lane]
            jobs = list(cells.proof_jobs(lane, names, Path("/oracle-evidence")))
            self.assertTrue(jobs, lane)
            self.assertTrue(all((ROOT / command[0]).is_file() for _, command in jobs), lane)

    def test_other_unproved_rows_remove_engine_credit(self):
        path = "scripts/pm_dg6a_table_history_custody.py"
        control = {field: True for field in custody_table.FIELDS}
        negative = {field: False for field in custody_table.FIELDS}
        suite = g.Suite("S4o2 partial actual custody table", custody_table.case,
                        [g.Control("control", control, "retained_history")],
                        [g.Negative("missing", negative, "HC01_original_located", "original_unavailable",
                                    "control", "Missing independently sealed original")], (path,), ROOT,
                        non_guards=[g.NonGuard(path, "case", "return", "return g.Case(table, check, context)",
                                              "Return the fresh execution object.")])
        report = g.run(suite)
        self.assertEqual(report["status"], "FAIL")
        own = next(r for r in report["rows"] if r["id"] == "HC01_original_located")
        self.assertIn("missing", own["flips"])
        self.assertFalse(own["proved"])
        self.assertFalse(cells.mutation_credit(report, report["negatives"][0]))


if __name__ == "__main__":
    unittest.main()
