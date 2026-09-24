"""Backup input structure only, not authorization, owner joins or runtime proof."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("backup_input_gate", ROOT / "scripts/pm-new-contracts-verify.py")
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)


class BackupInputShapeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT / "Plans/backup_restore_system_contracts.schema.json").read_text())
        cls.fixtures = json.loads((ROOT / "Plans/backup_restore_system_contract_fixtures.json").read_text())
        cls.positive = {row["name"]: row["value"] for row in cls.fixtures["valid"]}
        cls.registry = GATE.offline_schema_registry()
        cls.validator = GATE.validator_for(cls.schema, {"$ref": "#/$defs/backup_action_request_v2"}, cls.registry)

    def test_positive_inputs_use_the_real_gate_validator(self):
        rows = [row for row in self.fixtures["valid"] if row["name"].startswith("backup_input_v2_")]
        self.assertEqual(9, len(rows))
        for row in rows:
            with self.subTest(row=row["name"]):
                self.assertEqual([], list(self.validator.iter_errors(row["value"])))
                self.assertEqual([], list(GATE.validator_for(self.schema, self.schema, self.registry).iter_errors(row["value"])))

    def test_negative_inputs_are_rejected_without_semantic_shortcuts(self):
        rows = [row for row in self.fixtures["invalid"] if row["name"].startswith("backup_input_v2_reject_")]
        self.assertEqual(59, len(rows))
        for row in rows:
            with self.subTest(row=row["name"]):
                value = GATE.materialize_invalid(row, self.positive)
                self.assertTrue(list(self.validator.iter_errors(value)))

    def test_legacy_readability_is_not_the_new_input_contract(self):
        commands = set(self.schema["$defs"]["backup_action_request_v2"]["properties"]["command_id"]["enum"])
        legacy = GATE.validator_for(self.schema, {"$ref": "#/$defs/backup_restore_command_request"}, self.registry)
        found = set()
        for row in self.fixtures["valid"]:
            value = row["value"]
            if row.get("definition") == "backup_restore_command_request" and value.get("command_id") in commands:
                with self.subTest(row=row["name"]):
                    found.add(value["command_id"])
                    self.assertEqual([], list(legacy.iter_errors(value)))
                    self.assertTrue(list(self.validator.iter_errors(value)))
        self.assertEqual(commands, found)

    def test_every_explicit_input_and_envelope_field_is_required(self):
        for name in ("destination_update", "verify", "test_restore", "compare"):
            source = self.positive["backup_input_v2_" + name]
            for field in source:
                with self.subTest(command=name, field=field):
                    value = copy.deepcopy(source)
                    del value[field]
                    self.assertTrue(list(self.validator.iter_errors(value)))
            for field in source["action_input"]:
                with self.subTest(command=name, input_field=field):
                    value = copy.deepcopy(source)
                    del value["action_input"][field]
                    self.assertTrue(list(self.validator.iter_errors(value)))

    def test_patch_reuses_exact_owner_field_types(self):
        patch = self.schema["$defs"]["backup_destination_patch"]
        fields = {"display_name", "location_ref", "auth_profile_ref", "credential_ref", "oauth_registration_ref"}
        self.assertEqual(fields, set(patch["properties"]))
        for field in fields:
            self.assertEqual({"$ref": "#/$defs/backup_destination/properties/" + field}, patch["properties"][field])


if __name__ == "__main__":
    unittest.main()
