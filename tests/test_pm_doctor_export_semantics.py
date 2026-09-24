"""Static Doctor export joins; not export execution or custody proof."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest
from unittest import mock

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("doctor_export_gate", ROOT / "scripts/pm-new-contracts-verify.py")
gate = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(gate)
SCHEMA = "Plans/doctor_contracts.schema.json"
DEFINITION = "DoctorReportExportCommandRoundTrip"


class DoctorExportSemanticTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT / SCHEMA).read_text())
        cls.fixtures = json.loads((ROOT / "Plans/doctor_contract_fixtures.json").read_text())
        positives = {case["name"]: case["value"] for case in cls.fixtures["valid"]}
        cls.exchange = {
            "request": positives["server_gap_b.positive.export_report.request"],
            "result": positives["server_gap_b.positive.export_report.result"],
        }
        cls.validator = Draft202012Validator({"$ref": "#/$defs/" + DEFINITION, "$defs": cls.schema["$defs"]})

    def test_matching_existing_records_are_a_valid_positive_control(self):
        self.assertFalse(list(self.validator.iter_errors(self.exchange)))
        self.assertEqual(gate.contract_semantic_failures(SCHEMA, DEFINITION, self.exchange), [])

    def counterexamples(self):
        for field, replacement, rule in (
            ("command_instance_id", "command:doctor_report_export:other", "doctor_export.request_result_identity"),
            ("doctor_report_id", "doctor-report:other", "doctor_export.request_result_identity"),
            ("project_id", "project:other", "doctor_export.request_result_identity"),
            ("expected_registry_generation", 2, "doctor_export.request_generation_echo"),
            ("expected_projection_generation", 3, "doctor_export.request_generation_echo"),
            ("return_context.surface_id", "settings.other", "doctor_export.exact_return_context"),
            ("return_context.route_id", "settings/other", "doctor_export.exact_return_context"),
            ("return_context.focus_target", "other-control", "doctor_export.exact_return_context"),
            ("return_context.invocation_token", "return:other", "doctor_export.exact_return_context"),
            ("return_context.return_generation", 2, "doctor_export.exact_return_context"),
        ):
            value = copy.deepcopy(self.exchange)
            cursor = value["result"]
            parts = field.split(".")
            for part in parts[:-1]:
                cursor = cursor[part]
            cursor[parts[-1]] = replacement
            yield field, value, rule

    def test_each_structurally_valid_mismatch_is_rejected_by_its_join(self):
        for field, value, rule in self.counterexamples():
            with self.subTest(field=field):
                self.assertFalse(list(self.validator.iter_errors(value)))
                self.assertEqual(gate.contract_semantic_failures(SCHEMA, DEFINITION, value), [rule])

    def test_cross_record_rejection_is_causal_not_a_scalar_schema_failure(self):
        for field, value, rule in self.counterexamples():
            with self.subTest(field=field):
                self.assertFalse(list(self.validator.iter_errors(value)))
                self.assertIn(rule, gate.contract_semantic_failures(SCHEMA, DEFINITION, value))
                with mock.patch.object(gate, "doctor_export_semantic_failures", return_value=[]) as check:
                    self.assertEqual(gate.contract_semantic_failures(SCHEMA, DEFINITION, value), [])
                    check.assert_called_once_with(DEFINITION, value)

    def test_exact_return_fixture_no_longer_hides_behind_negative_generation(self):
        case = next(c for c in self.fixtures["invalid"] if c["name"] == "server_gap_b.negative.exact_return_mismatch")
        self.assertEqual(case["semantic_rule"], "doctor_export.exact_return_context")
        self.assertFalse(list(self.validator.iter_errors(case["value"])))
        self.assertEqual(gate.contract_semantic_failures(SCHEMA, DEFINITION, case["value"]), [case["semantic_rule"]])

    def test_helper_does_not_compare_unadjudicated_output_generation_domains(self):
        for generation in (0, 1, 100):
            value = copy.deepcopy(self.exchange)
            value["result"]["output"]["resulting_generation"] = generation
            self.assertFalse(list(self.validator.iter_errors(value)))
            self.assertEqual(gate.contract_semantic_failures(SCHEMA, DEFINITION, value), [])

    def test_unrelated_definition_and_standalone_records_keep_existing_validation(self):
        for definition, value in (("DoctorReportExportRequest", self.exchange["request"]),
                                  ("DoctorReportExportResult", self.exchange["result"]),
                                  ("doctor_action_result", {})):
            self.assertEqual(gate.contract_semantic_failures(SCHEMA, definition, value), [])
        self.assertEqual(gate.contract_semantic_failures(SCHEMA, DEFINITION, {}), ["doctor_export.invalid_round_trip"])


if __name__ == "__main__":
    unittest.main()
