"""Static Forge review consumer joins; no native/provider execution proof."""

import copy
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = "Plans/forge_integration_contracts.schema.json"
REQUEST = SCHEMA + "#/$defs/command_request"
RESULT = SCHEMA + "#/$defs/command_result"
RECEIPT = SCHEMA + "#/$defs/command_receipt"
ACTIONS = ("create", "merge")


class ForgeReviewWiringContractsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.entries = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
        cls.schema = json.loads((ROOT / SCHEMA).read_text())
        cls.fixtures = json.loads((ROOT / "Plans/forge_integration_contract_fixtures.json").read_text())

    def row(self, action):
        return self.entries["catalog.forge_review_" + action]

    def request(self, action):
        cases = [item["value"] for item in self.fixtures["valid"]
                 if item.get("definition") == "command_request"
                 and item["value"].get("command_id") == "cmd.forge.review." + action]
        self.assertEqual(1, len(cases))
        return copy.deepcopy(cases[0])

    def test_exact_existing_owner_pair_and_future_routes(self):
        for action in ACTIONS:
            with self.subTest(action=action):
                row = self.row(action)
                self.assertEqual(REQUEST, row.get("request_schema_ref"))
                self.assertEqual(RESULT, row.get("result_schema_ref"))
                self.assertEqual("cmd.forge.review." + action, row["ui_command_id"])
                self.assertEqual("handlers::forge::review_" + action, row["handler_location"])
                self.assertIn("handler_unavailable", " ".join(row["acceptance_checks"]))

    def test_navigation_is_not_a_result_or_success_receipt(self):
        for action in ACTIONS:
            with self.subTest(action=action):
                row = self.row(action)
                effect = row["effect_contract"]
                self.assertEqual("receipt", effect["effect_kind"])
                self.assertEqual([RESULT, RECEIPT], effect["receipt_or_event_refs"])
                self.assertIn("terminal provider result", effect["description"])
                self.assertIn("accepted", effect["description"])
                self.assertNotIn("or explicit route/open", json.dumps(row))
                self.assertNotIn("or route/open disposition", json.dumps(row))
                effects = [x for x in row["test_evidence"] if x["evidence_kind"] == "receipt_or_event_assertion"]
                self.assertEqual(1, len(effects))
                self.assertEqual(effect["description"], effects[0]["requirement"])
                self.assertIn("zero unregistered EventRecord", " ".join(row["event_test_requirements"]))

    def test_request_fixtures_keep_action_specific_identity(self):
        validator = Draft202012Validator({"$defs": self.schema["$defs"], "$ref": "#/$defs/command_request"})
        for action in ACTIONS:
            request = self.request(action)
            with self.subTest(action=action):
                self.assertTrue(validator.is_valid(request))
            changes = ({"provider_review_id": "invented-review", "review_revision_ref": "invented:revision"}
                       if action == "create" else {"provider_review_id": None, "review_revision_ref": None})
            for field, value in changes.items():
                with self.subTest(action=action, field=field):
                    bad = copy.deepcopy(request)
                    bad["target"][field] = value
                    self.assertFalse(validator.is_valid(bad))
            if action == "create":
                for field in ("source_revision", "target_revision"):
                    with self.subTest(field=field):
                        bad = copy.deepcopy(request)
                        bad["target"][field] = None
                        self.assertFalse(validator.is_valid(bad))
            else:
                request["confirmation"] = None
                self.assertFalse(validator.is_valid(request))

    def test_bound_result_requires_terminal_evidence_or_pending_work(self):
        validator = Draft202012Validator({"$defs": self.schema["$defs"], "$ref": "#/$defs/command_result"})
        original = next(x["value"] for x in self.fixtures["valid"] if x["name"] == "command_result_succeeded")
        self.assertIn("command_receipt", self.schema["$defs"])
        for action in ACTIONS:
            result = copy.deepcopy(original)
            result["command_id"] = "cmd.forge.review." + action
            with self.subTest(action=action, outcome="succeeded"):
                self.assertTrue(validator.is_valid(result))
            for field in ("terminal_provider_result_ref", "receipt_ref"):
                with self.subTest(action=action, missing=field):
                    bad = copy.deepcopy(result)
                    bad[field] = None
                    self.assertFalse(validator.is_valid(bad))
            result.update(outcome="accepted", terminal_provider_result_ref=None, receipt_ref=None,
                          observable_work_id="work:forge:review:pending")
            with self.subTest(action=action, outcome="accepted"):
                self.assertTrue(validator.is_valid(result))
                result["observable_work_id"] = None
                self.assertFalse(validator.is_valid(result))
            result["outcome"] = "route_open"
            self.assertFalse(validator.is_valid(result))

    def test_no_event_admission_or_provider_specific_label_substitution(self):
        for action in ACTIONS:
            with self.subTest(action=action):
                row = self.row(action)
                self.assertEqual([], row["expected_event_types"])
                self.assertEqual({"noun_source": "selected_repository_adapter", "noun_field": "review_noun",
                                  "label_template": action.title() + " {noun}"}, row["vocabulary"])
                self.assertEqual("state.commands.forge_review_" + action + ".availability", row["state_selector"])
                self.assertEqual("state.commands.forge_review_" + action + ".disabled_reason", row["disabled_reason_projection"])
                self.assertIn("is null", " ".join(row["acceptance_checks"]))

    def test_remote_merge_and_thread_worktree_actions_remain_distinct(self):
        self.assertIn("cmd.chat.worktree.pr", " ".join(self.row("create")["acceptance_checks"]))
        merge_checks = " ".join(self.row("merge")["acceptance_checks"])
        self.assertIn("cmd.chat.worktree.merge", merge_checks)
        self.assertIn("domain.git_destructive_remote", merge_checks)


if __name__ == "__main__":
    unittest.main()
