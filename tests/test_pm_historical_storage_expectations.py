"""The historical correction must not hide any other storage difference."""
from copy import deepcopy
import unittest
from pm_historical_storage_expectations import with_recorded_usage_id_correction


class HistoricalUsageIdCorrection(unittest.TestCase):
    def setUp(self):
        self.old = "scd.usage.command_transport.v2"
        self.new = "scd.usage.quota_command_transport.v1"
        self.rows = [{"disposition_id": self.old, "other": {"kept": True}},
                     {"disposition_id": "unrelated", "other": [1, 2]}]

    def test_only_exact_id_changes_without_mutating_input(self):
        before = deepcopy(self.rows)
        expected = deepcopy(self.rows)
        expected[0]["disposition_id"] = self.new
        self.assertEqual(expected, with_recorded_usage_id_correction(self.rows))
        self.assertEqual(before, self.rows)

    def test_missing_old_id_rejected(self):
        with self.assertRaises(AssertionError):
            with_recorded_usage_id_correction(self.rows[1:])

    def test_duplicate_old_id_rejected(self):
        with self.assertRaises(AssertionError):
            with_recorded_usage_id_correction(self.rows + [deepcopy(self.rows[0])])

    def test_already_present_new_id_rejected(self):
        with self.assertRaises(AssertionError):
            with_recorded_usage_id_correction(self.rows + [{"disposition_id": self.new}])


if __name__ == "__main__":
    unittest.main()
