"""Explicit requested capture policy; static shapes, not capture execution proof."""

import copy
import json
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]


class CaptureTargetPolicyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT / "Plans/test_capture_motion_evidence_contracts.schema.json").read_text())
        cls.fixtures = json.loads((ROOT / "Plans/test_capture_motion_evidence_contract_fixtures.json").read_text())
        cls.positives = {case["name"]: case["value"] for case in cls.fixtures["valid"]}
        cls.validator = Draft202012Validator({
            "$schema": cls.schema["$schema"], "$defs": cls.schema["$defs"],
            "$ref": "#/$defs/capture_command_request",
        })

    def test_start_and_target_update_require_explicit_requested_policy(self):
        for name in ("command_capture_start", "command_capture_target_update"):
            with self.subTest(case=name):
                original = self.positives[name]
                self.assertTrue(self.validator.is_valid(original))
                self.assertIn("target_policy", original)
                value = copy.deepcopy(original)
                del value["target_policy"]
                errors = list(self.validator.iter_errors(value))
                self.assertTrue(errors)
                self.assertTrue(all(error.validator == "required" and "target_policy" in error.message for error in errors))

    def test_existing_policy_vocabulary_is_preserved_and_closed(self):
        policies = {"fixed_page", "follow_controller_page", "all_pages_parallel",
                    "workspace_composite", "application_window", "explicit_region"}
        self.assertEqual(policies, set(self.schema["$defs"]["capture_target_policy"]["enum"]))
        for name in ("command_capture_start", "command_capture_target_update"):
            for policy in (*sorted(policies), None, "", "current_focus"):
                with self.subTest(case=name, policy=policy):
                    value = copy.deepcopy(self.positives[name])
                    value["target_policy"] = policy
                    self.assertEqual(policy in policies, self.validator.is_valid(value))

    def test_authored_missing_policy_negatives_have_valid_bases(self):
        negatives = {case["name"]: case for case in self.fixtures["invalid"]}
        for action in ("start", "target_update"):
            with self.subTest(action=action):
                case = negatives[f"capture_{action}_requires_requested_target_policy"]
                self.assertEqual("capture_command_request", case["definition"])
                self.assertEqual(["target_policy"], case["remove"])
                value = copy.deepcopy(self.positives[case["base_valid"]])
                self.assertTrue(self.validator.is_valid(value))
                del value["target_policy"]
                self.assertFalse(self.validator.is_valid(value))


if __name__ == "__main__":
    unittest.main()
