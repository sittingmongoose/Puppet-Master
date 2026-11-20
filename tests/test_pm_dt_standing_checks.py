"""Regression checks for the DT checkpoint pattern mutation."""

import copy
import importlib.util
import json
import sys
import unittest
from pathlib import Path
from unittest import mock


SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
SPEC = importlib.util.spec_from_file_location("dt_standing", SCRIPTS / "pm-dt-standing-checks.py")
assert SPEC is not None and SPEC.loader is not None
standing = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(standing)

FAMILY = "approval.requested"
SCHEMA_PATH = "Plans/dt_event_contracts.schema.json"
DEFINITION = "approval_requested_checkpoint"


def anchor_schema(schema):
    return schema["properties"]["index_read_token"]["properties"]["generation_anchor_sha256"]


class DateTimeStandingChecksTests(unittest.TestCase):
    def test_standing_five_cuts_real_checkpoint_pattern(self):
        dt = standing.dt
        contract = next(row for row in dt.load("Plans/dt_event_contracts.json")["families"]
                        if row["event_type"] == FAMILY)
        fixture = next(row for row in dt.load("Plans/dt_event_contract_fixtures.json")["families"]
                       if row["event_type"] == FAMILY)
        positive = fixture["checkpoint_cases"][0]
        negative = copy.deepcopy(positive)
        token = negative["proposed"]["index_read_token"]
        token["generation_anchor_sha256"] += "\n"
        negative["context"]["current_token"] = copy.deepcopy(token)
        negative["context"]["verified_prefix"]["index_read_token"] = copy.deepcopy(token)

        def evaluate(case, schema):
            return dt.checkpoint_result(contract, case["previous"], case["proposed"], case["context"], schema)

        schema = dt.load(SCHEMA_PATH)["$defs"][DEFINITION]
        self.assertEqual(evaluate(positive, schema), "published")
        self.assertEqual(evaluate(negative, schema), "schema_refused")

        def checkpoint_probe():
            changed = dt.load(SCHEMA_PATH)["$defs"][DEFINITION]
            ref = SCHEMA_PATH + "#/$defs/" + DEFINITION
            mirror = next(row["value_schema"] for row in dt.load("Plans/storage_value_registry.json")["families"]
                          if row["value_schema_ref"] == ref)
            expected = copy.deepcopy(schema)
            del anchor_schema(expected)["pattern"]
            self.assertEqual(changed, expected)
            self.assertEqual(mirror, expected)
            self.assertEqual(evaluate(positive, changed), "published")
            print(json.dumps({"coherent_trailing_lf": evaluate(negative, changed)}))
            return 0

        with mock.patch.object(dt, "main", side_effect=checkpoint_probe):
            code, result = standing.run_fault(FAMILY, "5")
        self.assertEqual(code, 0)
        self.assertEqual(result["coherent_trailing_lf"], "published")
        self.assertEqual(dt.load(SCHEMA_PATH)["$defs"][DEFINITION], schema)

    def test_missing_pattern_reports_setup_error_without_checker_run(self):
        dt = standing.dt
        load = dt.load
        schema = load(SCHEMA_PATH)
        del anchor_schema(schema["$defs"][DEFINITION])["pattern"]
        with mock.patch.object(dt, "load", side_effect=lambda path: schema if path == SCHEMA_PATH else load(path)), mock.patch.object(
            dt, "main"
        ) as checker:
            code, result = standing.run_fault(FAMILY, "5")
            checker.assert_not_called()
        self.assertEqual(code, 1)
        self.assertEqual(result["status"], "not_run")
        self.assertIn("generation_anchor_sha256.pattern", result["mutation_setup_error"])


if __name__ == "__main__":
    unittest.main()
