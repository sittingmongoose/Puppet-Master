"""Existing Project wiring joins; static declarations, not native execution proof."""

import copy
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = "Plans/project_system_contracts.schema.json"
REQUEST = SCHEMA + "#/$defs/project_action_request"
RESULT = SCHEMA + "#/$defs/project_action_result"
BINDINGS = ("archive", "remove", "refresh", "open_settings")
MUTATIONS = ("add_existing", "new_local", "archive", "remove")


class ProjectWiringContractsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.entries = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
        cls.schema = json.loads((ROOT / SCHEMA).read_text())
        cls.fixtures = json.loads((ROOT / "Plans/project_system_contract_fixtures.json").read_text())

    def row(self, name):
        return self.entries["catalog.project_" + name]

    def test_existing_owner_pair_is_bound_to_each_legacy_command(self):
        for name in BINDINGS:
            with self.subTest(command=name):
                row = self.row(name)
                self.assertEqual(REQUEST, row.get("request_schema_ref"))
                self.assertEqual(RESULT, row.get("result_schema_ref"))
                self.assertEqual("cmd.project." + name, row["ui_command_id"])
                self.assertEqual("handlers::project::" + name, row["handler_location"])

    def test_each_bound_command_keeps_its_valid_owner_request_fixture(self):
        validator = Draft202012Validator({"$defs": self.schema["$defs"], "$ref": "#/$defs/project_action_request"})
        for name in BINDINGS:
            with self.subTest(command=name):
                candidates = [case["value"] for case in self.fixtures["valid"]
                              if case.get("definition") == "project_action_request"
                              and case["value"].get("action_id") == "cmd.project." + name]
                self.assertTrue(candidates)
                for value in candidates:
                    self.assertTrue(validator.is_valid(value))
                    bad = copy.deepcopy(value)
                    del bad["return_context"]
                    self.assertFalse(validator.is_valid(bad))

    def test_registry_effects_require_owner_persistence_readback_not_navigation(self):
        for name in MUTATIONS:
            with self.subTest(command=name):
                row = self.row(name)
                effect = row["effect_contract"]
                self.assertEqual("receipt", effect["effect_kind"])
                self.assertEqual([RESULT], effect["receipt_or_event_refs"])
                self.assertIn("persistence/readback", effect["description"])
                self.assertNotIn("no-persist command receipt", json.dumps(row))
                self.assertNotIn("explicit no-persist route/open disposition", json.dumps(row))
                checks = " ".join(row["event_test_requirements"])
                self.assertIn("owner", checks)
                self.assertIn("zero unregistered EventRecord", checks)
                effects = [item for item in row["test_evidence"] if item["evidence_kind"] == "receipt_or_event_assertion"]
                self.assertEqual(1, len(effects))
                self.assertEqual(effect["description"], effects[0]["requirement"])

    def test_registration_archive_and_remove_keep_distinct_effects(self):
        for name in ("add_existing", "new_local"):
            self.assertIn("listed", self.row(name)["effect_contract"]["description"])
        self.assertIn("archived", self.row("archive")["effect_contract"]["description"])
        self.assertIn("removed_from_list", self.row("remove")["effect_contract"]["description"])
        self.assertIn("never a data deletion", self.row("remove")["effect_contract"]["description"])

    def test_nonmutating_siblings_and_event_boundary_stay_distinct(self):
        self.assertEqual("route_open", self.row("open_settings")["effect_contract"]["effect_kind"])
        self.assertIn("no-persist", self.row("refresh")["effect_contract"]["description"])
        for name in set(BINDINGS + MUTATIONS):
            row = self.row(name)
            self.assertEqual([], row["expected_event_types"])
            self.assertEqual("state.commands.project_" + name + ".availability", row["state_selector"])
            self.assertEqual("state.commands.project_" + name + ".disabled_reason", row["disabled_reason_projection"])
            self.assertIn("Production certification requires", row["evidence_required"])
        # These distinct owners/events are not generalized by the registry repair.
        self.assertEqual(["storage.deletion_lifecycle_changed"], self.entries["project.settings.delete_data"]["expected_event_types"])
        self.assertEqual(["github.repo.create_requested", "project.github_repo_bound"], self.row("new_github_repo")["expected_event_types"])


if __name__ == "__main__":
    unittest.main()
