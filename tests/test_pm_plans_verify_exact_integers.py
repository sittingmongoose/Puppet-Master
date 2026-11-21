from __future__ import annotations

import argparse
import importlib.util
import io
import json
import sys
import unittest
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("pm_plans_verify", ROOT / "scripts/pm-plans-verify.py")
assert SPEC is not None and SPEC.loader is not None
verify = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(verify)

CARD2 = ROOT / "Plans/card2_event_p2a_cases.json"


class ExactIntegerLoadingTests(unittest.TestCase):
    def setUp(self) -> None:
        original_limit = sys.get_int_max_str_digits()
        sys.set_int_max_str_digits(4300)
        self.addCleanup(sys.set_int_max_str_digits, original_limit)

    def test_json_syntax_reads_real_card2_fixture(self) -> None:
        with mock.patch.object(verify, "iter_repo_files", return_value=[CARD2]), mock.patch.object(
            verify, "load_raw_evidence_capture_modes", return_value=({}, [])
        ):
            report = verify.cmd_json_syntax(argparse.Namespace())
        # The narrowed file set deliberately has no historical capture rows.
        failures = [f for f in report["failures"] if f["error"] != "raw_capture_mode_census_mismatch"]
        self.assertEqual(failures, [])
        self.assertEqual(report["files_checked"], 1)
        with self.assertRaises(ValueError):
            int("9" * 4400)

    def test_usage_contract_scan_preserves_real_card2_integer(self) -> None:
        documents = []
        scan = verify.source_confidence_scan_json_value

        def capture(**kwargs):
            if kwargs["location"] == "$":
                documents.append(kwargs["value"])
            return scan(**kwargs)

        with mock.patch.object(
            verify, "active_usage_source_confidence_paths", return_value=[CARD2]
        ), mock.patch.object(verify, "source_confidence_scan_json_value", side_effect=capture):
            self.assertEqual(verify.source_confidence_scan_active_examples(), ([], 0, 0))
        case = next(case for case in documents[0]["cases"] if case["id"] == "p2a/sequence-4400-digit")
        number = case["changes"][0][1]
        self.assertIs(type(number), int)
        self.assertTrue(number == 10**4400 - 1)

    def test_json_parser_still_rejects_invalid_number_syntax(self) -> None:
        path = mock.Mock(suffix=".json")
        path.read_text.return_value = '{"number": 01}'
        with self.assertRaises(json.JSONDecodeError):
            verify.parse_json_or_jsonl(path)

    def test_jsonl_parser_accepts_long_negative_integer(self) -> None:
        path = mock.Mock(suffix=".jsonl")
        path.open.return_value = io.StringIO('{"number": -' + "9" * 4400 + '}\n')
        self.assertEqual(verify.parse_json_or_jsonl(path), 1)


if __name__ == "__main__":
    unittest.main()
