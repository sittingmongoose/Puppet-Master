"""Doctor action shape fences; no native check or remediation proof."""
import copy
import json
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
TARGET_FIELDS = ("check_id", "target_kind", "target_id", "expected_descriptor_revision",
                 "expected_owner_generation", "permission_snapshot_ref")


class DoctorActionBoundsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT / "Plans/doctor_contracts.schema.json").read_text())
        cls.fixtures = json.loads((ROOT / "Plans/doctor_contract_fixtures.json").read_text())
        cls.positives = {case["name"]: case["value"] for case in cls.fixtures["valid"]}

    def validator(self, definition):
        return Draft202012Validator({"$defs": self.schema["$defs"], "$ref": "#/$defs/" + definition})

    def test_exact_check_cannot_drop_target_currentness_or_permission(self):
        validator = self.validator("doctor_action_request")
        original = self.positives["server_gap_b.local.6.request"]
        self.assertTrue(validator.is_valid(original))
        for field in TARGET_FIELDS:
            with self.subTest(field=field):
                value = copy.deepcopy(original)
                value[field] = None
                self.assertFalse(validator.is_valid(value))

    def test_cached_entry_and_visible_refresh_keep_nullable_target_fields(self):
        validator = self.validator("doctor_action_request")
        for name in ("server_gap_b.local.1.request", "server_gap_b.local.2.request", "server_gap_b.local.5.request"):
            with self.subTest(case=name):
                value = copy.deepcopy(self.positives[name])
                for field in TARGET_FIELDS:
                    value[field] = None
                self.assertTrue(validator.is_valid(value))

    def test_applied_owner_result_requires_reference_on_every_action(self):
        validator = self.validator("doctor_action_result")
        original = self.positives["server_gap_b.local.6.result"]
        actions = self.schema["$defs"]["doctor_action_result"]["properties"]["action_id"]["enum"]
        for action in actions:
            for currentness in ("current", "stale_rejected", "refreshed", "owner_result_applied"):
                with self.subTest(action=action, currentness=currentness):
                    value = copy.deepcopy(original)
                    value.update(action_id=action, currentness=currentness, semantic_owner_result_ref=None)
                    self.assertEqual(currentness != "owner_result_applied", validator.is_valid(value))
                    value["semantic_owner_result_ref"] = "owner-result:doctor:1"
                    self.assertTrue(validator.is_valid(value))

    def test_existing_local_positives_and_new_negative_fixtures(self):
        for case in self.fixtures["valid"]:
            if case["definition"] in ("doctor_action_request", "doctor_action_result"):
                with self.subTest(positive=case["name"]):
                    self.assertTrue(self.validator(case["definition"]).is_valid(case["value"]))
        names = {f"run_check_requires_{field}" for field in TARGET_FIELDS} | {"applied_owner_result_requires_reference"}
        cases = [case for case in self.fixtures["invalid"] if case["name"] in names]
        self.assertEqual(names, {case["name"] for case in cases})
        for case in cases:
            with self.subTest(negative=case["name"]):
                value = copy.deepcopy(self.positives[case["base_valid"]])
                validator = self.validator(case["definition"])
                self.assertTrue(validator.is_valid(value))
                value.update(case["patch"])
                self.assertFalse(validator.is_valid(value))

    def test_every_doctor_local_touch_uses_action_result_contract(self):
        touch = json.loads((ROOT / "Plans/touch_closure.json").read_text())
        profiles = {p["profile_id"]: p for p in touch["profiles"]}
        actions = self.schema["$defs"]["doctor_action_request"]["properties"]["action_id"]["enum"]
        rows = [row for row in touch["rows"] if row[3] in actions]
        self.assertEqual(set(actions), {row[3] for row in rows})
        for row in rows:
            with self.subTest(action=row[3]):
                profile = profiles[row[1]]
                self.assertEqual("Plans/doctor_contracts.schema.json#/$defs/doctor_action_result", profile["result_schema_ref"])
                self.assertEqual(profile["result_schema_ref"], profile["error_schema_ref"])


if __name__ == "__main__":
    unittest.main()
