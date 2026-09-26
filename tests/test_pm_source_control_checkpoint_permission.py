"""Checkpoint command-to-permission-class join; static contract shape only.

Covers TOUCH-SGAPCMD-150/151/152 payload/test dimensions: checkpoint create
and restore require ``source_control.checkpoint.mutate`` while inspect
requires ``source_control.checkpoint.inspect``. No native authorization,
dispatch, storage, or runtime behavior is claimed here.
"""

import copy
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]

EXPECTED_PAIRS = {
    "cmd.source_control.checkpoint.create": "source_control.checkpoint.mutate",
    "cmd.source_control.checkpoint.inspect": "source_control.checkpoint.inspect",
    "cmd.source_control.checkpoint.restore": "source_control.checkpoint.mutate",
}

SWAPPED_FIXTURES = {
    "cmd.source_control.checkpoint.create": "server_gap_b.create_with_inspect_class_is_rejected",
    "cmd.source_control.checkpoint.inspect": "server_gap_b.inspect_with_mutate_class_is_rejected",
    "cmd.source_control.checkpoint.restore": "server_gap_b.restore_with_inspect_class_is_rejected",
}


class CheckpointPermissionClassJoinTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT / "Plans/source_control_contracts.schema.json").read_text())
        cls.fixtures = json.loads((ROOT / "Plans/source_control_contract_fixtures.json").read_text())
        cls.valid = {case["name"]: case for case in cls.fixtures["valid"]}
        cls.invalid = {case["name"]: case for case in cls.fixtures["invalid"]}
        cls.decision_validator = Draft202012Validator(
            {
                "$schema": cls.schema["$schema"],
                "$id": cls.schema["$id"],
                "$defs": cls.schema["$defs"],
                "$ref": "#/$defs/source_control_permission_decision",
            },
            format_checker=FormatChecker(),
        )

    def permission_fixture(self, command):
        return self.valid[f"server_gap_b.{command}.permission"]["value"]

    def test_all_three_valid_command_class_pairs_are_accepted(self):
        self.assertEqual(set(EXPECTED_PAIRS), {f"cmd.source_control.checkpoint.{s}" for s in ("create", "inspect", "restore")})
        for command, expected_class in EXPECTED_PAIRS.items():
            with self.subTest(command=command):
                value = self.permission_fixture(command)
                self.assertEqual(value["scope"]["command_id"], command)
                self.assertEqual(value["permission_class"], expected_class)
                self.decision_validator.validate(value)

    def test_all_three_swapped_classes_are_rejected(self):
        for command, expected_class in EXPECTED_PAIRS.items():
            with self.subTest(command=command):
                swapped = copy.deepcopy(self.permission_fixture(command))
                swapped["permission_class"] = (
                    "source_control.checkpoint.inspect"
                    if expected_class == "source_control.checkpoint.mutate"
                    else "source_control.checkpoint.mutate"
                )
                self.assertFalse(self.decision_validator.is_valid(swapped))

    def test_swapped_class_negative_fixtures_match_valid_shape_except_class(self):
        for command, expected_class in EXPECTED_PAIRS.items():
            with self.subTest(command=command):
                negative = copy.deepcopy(self.invalid[SWAPPED_FIXTURES[command]]["value"])
                self.assertEqual(negative["scope"]["command_id"], command)
                self.assertNotEqual(negative["permission_class"], expected_class)
                # The join is the only rejection cause: restoring the valid
                # class must validate, proving no other shape drift.
                negative["permission_class"] = expected_class
                self.assertEqual(negative, self.permission_fixture(command))
                self.decision_validator.validate(negative)
                rejected = self.invalid[SWAPPED_FIXTURES[command]]["value"]
                self.assertFalse(self.decision_validator.is_valid(rejected))

    def test_permission_class_enum_is_unchanged(self):
        decision = self.schema["$defs"]["source_control_permission_decision"]
        self.assertEqual(
            set(decision["properties"]["permission_class"]["enum"]),
            {"source_control.checkpoint.inspect", "source_control.checkpoint.mutate"},
        )

    def test_ordinary_request_permission_pointers_are_unchanged(self):
        # The eight ordinary central routes reference these two required
        # request fields; the join must not move or retype them.
        request = self.schema["$defs"]["source_control_command_request"]
        for field in ("permission_snapshot_ref", "file_safe_decision_ref"):
            with self.subTest(field=field):
                self.assertIn(field, request["required"])
                self.assertEqual(request["properties"][field], {"$ref": "#/$defs/non_secret_ref"})

    def test_three_checkpoint_route_bindings_are_unchanged(self):
        bindings = self.schema["x-server-gap-command-contracts"]
        self.assertEqual(set(bindings), set(EXPECTED_PAIRS))
        for command, binding in bindings.items():
            with self.subTest(command=command):
                self.assertEqual(
                    (binding["request_ref"], binding["result_ref"], binding["availability_ref"]),
                    (
                        "#/$defs/source_control_command_request",
                        "#/$defs/source_control_command_result",
                        "#/$defs/source_control_command_availability",
                    ),
                )
                self.assertEqual(binding["permission_ref"], "#/$defs/source_control_permission_decision")


if __name__ == "__main__":
    unittest.main()
