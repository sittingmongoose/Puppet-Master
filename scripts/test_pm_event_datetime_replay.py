"""Focused regressions for the date-time mutation replay harness."""
import unittest
from unittest.mock import patch

import pm_event_datetime_admission_checks as admission
import pm_event_datetime_mutations as replay
import pm_event_datetime_selfcheck as checks
import pm_event_datetime as dt

class ReplayCoverage(unittest.TestCase):
    def test_history_replay_includes_profiled_cases(self):
        data = replay._corpus()
        profiled = {c["id"] for c in data["cases"]
                    if c["op"] == "history" and c.get("date_time_profile")}
        self.assertTrue(profiled)
        with patch.object(replay, "regression_names", return_value=[]), patch.object(
                replay, "integration_names", return_value=[]):
            listed = {w.removeprefix("case:") for w in replay.survivor_witnesses() if w.startswith("case:")}
        self.assertEqual(listed & {c["id"] for c in data["cases"] if c["op"] == "history"}, profiled)
        direct = [c for c in data["cases"] if c["id"] in profiled
                  and c.get("original") not in data["historical_envelope_resources"]]
        self.assertTrue(direct)
        self.assertTrue(all(replay.run_case(c["id"]) for c in direct))
        with self.assertRaisesRegex(ValueError, "not a date-time corpus case"):
            replay.run_case("history-current-original")
        self.assertEqual(replay._entry_problems("test", {"witness": "case:" + direct[0]["id"]}, checks), [])

    def test_integration_names_do_not_rerun_regressions(self):
        with patch.dict(replay._STATE, {}, clear=True), patch.object(
                admission, "regression_checks", return_value={"example_regression": True}) as run, patch.object(
                dt, "datetime_validator") as validator:
            validator.return_value.is_valid.return_value = True
            self.assertEqual(replay.regression_names(), ["example_regression"])
            self.assertIn("eventrecord_datetime_valid", replay.integration_names())
            self.assertNotIn("example_regression", replay.integration_names())
            self.assertEqual(run.call_count, 1)
