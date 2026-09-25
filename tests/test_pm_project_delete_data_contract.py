"""Static destructive-intent admission; no deletion, event or runtime proof."""
from copy import deepcopy
import json
from pathlib import Path
import unittest
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = "Plans/project_system_contracts.schema.json"


class ProjectDeleteDataContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        schema = json.loads((ROOT / SCHEMA).read_text())
        cls.validator = Draft202012Validator({"$defs": schema["$defs"], "$ref": "#/$defs/project_action_request"})
        cls.pack = json.loads((ROOT / "Plans/project_system_contract_fixtures.json").read_text())
        cls.value = deepcopy(next(r["value"] for r in cls.pack["valid"]
            if r["name"] == "command_project_delete_data_routes_storage_owned_intent"))

    def test_valid_current_delete_binds_data_hash_and_strong_confirmation(self):
        self.assertIn("expected_project_data_sha256", self.value)
        self.assertEqual("strong", self.value.get("confirmation_strength"))
        self.assertTrue(self.validator.is_valid(self.value))

    def test_omitted_or_invalid_destructive_fields_refuse(self):
        for field, invalid in (("expected_project_data_sha256", [None, "", "not-a-hash"]),
                               ("confirmation_strength", [None, "weak", True])):
            missing = deepcopy(self.value)
            missing.pop(field, None)
            with self.subTest(field=field, case="missing"):
                self.assertFalse(self.validator.is_valid(missing))
            for item in invalid:
                bad = deepcopy(self.value)
                bad[field] = item
                with self.subTest(field=field, value=item):
                    self.assertFalse(self.validator.is_valid(bad))

    def test_delete_reason_is_optional_and_never_widens_other_actions(self):
        value = deepcopy(self.value)
        value["reason"] = "User requested removal of this Project's enumerated data"
        self.assertTrue(self.validator.is_valid(value))
        for row in self.pack["valid"]:
            if row.get("definition") != "project_action_request" or row["value"]["action_id"] == "cmd.project.delete_data":
                continue
            self.assertTrue(self.validator.is_valid(row["value"]), row["name"])
            for field, item in (("expected_project_data_sha256", "a" * 64),
                                ("confirmation_strength", "strong"), ("reason", "purge")):
                bad = deepcopy(row["value"])
                bad[field] = item
                self.assertFalse(self.validator.is_valid(bad), (row["name"], field))

    def test_wiring_keeps_storage_effect_and_exact_request_result(self):
        row = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]["project.settings.delete_data"]
        self.assertEqual(SCHEMA + "#/$defs/project_action_request", row.get("request_schema_ref"))
        self.assertEqual(SCHEMA + "#/$defs/project_action_result", row.get("result_schema_ref"))
        self.assertEqual("handlers::project::delete_data", row["handler_location"])
        self.assertEqual(["storage.deletion_lifecycle_changed"], row["expected_event_types"])
        self.assertIn("owner compaction", row["effect_contract"]["description"])


if __name__ == "__main__":
    unittest.main()
