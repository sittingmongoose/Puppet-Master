"""Actual Touch result selection, not merely an unbound companion fixture."""
import copy
import unittest

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

from tests.test_pm_application_update_local_result import (
    FIXTURE_REL, LOCAL_ACTION_IDS, OWNER_SCHEMA_REL, SCHEMA_REL, load,
)


class ApplicationUpdateLocalBindingTests(unittest.TestCase):
    def setUp(self):
        self.profile = next(p for p in load("Plans/touch_closure.json")["profiles"]
                            if p["profile_id"] == "TCP-APP-UPDATE-LOCAL")

    def test_exact_owner_and_settlement_references(self):
        self.assertEqual(self.profile["dry_contract_ref"], SCHEMA_REL)
        self.assertEqual(self.profile["payload_schema_ref"],
                         OWNER_SCHEMA_REL + "#/$defs/ApplicationUpdateLocalActionRequest")
        self.assertEqual(self.profile["result_schema_ref"],
                         SCHEMA_REL + "#/$defs/ApplicationUpdateLocalSettlement")
        self.assertEqual(self.profile["error_schema_ref"],
                         SCHEMA_REL + "#/$defs/ApplicationUpdateLocalRefusal")

    def test_actual_selected_result_accepts_all_outcomes_without_losing_local_identity(self):
        path, pointer = self.profile["result_schema_ref"].split("#", 1)
        schema = load(path)
        owner = load(OWNER_SCHEMA_REL)
        registry = Registry().with_resources([
            (schema["$id"], Resource.from_contents(schema)),
            (owner["$id"], Resource.from_contents(owner)),
        ])
        selected = dict(schema)
        selected.pop("oneOf", None)
        selected["$ref"] = "#" + pointer
        validator = Draft202012Validator(selected, registry=registry,
                                         format_checker=FormatChecker())
        outcomes, actions = set(), set()
        for case in load(FIXTURE_REL)["valid"]:
            value = case["value"]
            with self.subTest(case=case["name"]):
                self.assertEqual(list(validator.iter_errors(value)), [])
                actions.add(value["request"]["local_action_id"])
                outcomes.add(value["outcome"])
                wrong = copy.deepcopy(value)
                wrong["request"]["local_action_id"] = "cmd.update.app.open_details"
                self.assertTrue(list(validator.iter_errors(wrong)))
        self.assertEqual(actions, set(LOCAL_ACTION_IDS))
        self.assertIn("presented", outcomes)
        self.assertIn("stale_projection", outcomes)
        self.assertIn("caller_unavailable", outcomes)


if __name__ == "__main__":
    unittest.main()
