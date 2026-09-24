"""Accepted NamedPlan shell creation shapes, not execution or identity-join proof."""

import copy
import importlib.util
import json
import unittest
from pathlib import Path

from referencing import Registry

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_REL = "Plans/named_plan_system_contracts.schema.json"
SCHEMA = json.loads((ROOT / SCHEMA_REL).read_text())
FIXTURES = json.loads((ROOT / "Plans/named_plan_system_contract_fixtures.json").read_text())
_spec = importlib.util.spec_from_file_location("named_plan_gate", ROOT / "scripts/pm-new-contracts-verify.py")
GATE = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(GATE)


class NamedPlanCreateResultTests(unittest.TestCase):
    def setUp(self):
        self.positives = {case["name"]: case["value"] for case in FIXTURES["valid"]}
        self.create = copy.deepcopy(self.positives["accepted_create_has_group_route_and_initial_revision"])
        self.validator = GATE.validator_for(
            SCHEMA, {"$ref": "#/$defs/named_plan_action_result"}, Registry()
        )

    def test_accepted_create_requires_nonnull_group_and_route(self):
        for field in ("thread_group_ref", "route_ref"):
            for replacement in (None, "", "/absolute/path", "not a reference"):
                with self.subTest(field=field, replacement=replacement):
                    value = copy.deepcopy(self.create)
                    value[field] = replacement
                    self.assertFalse(self.validator.is_valid(value))
        self.assertTrue(self.validator.is_valid(self.create))

    def test_accepted_create_and_replay_require_revision_one(self):
        for replayed in (False, True):
            for revision in (None, 0, 1, 2, 7):
                with self.subTest(replayed=replayed, revision=revision):
                    value = copy.deepcopy(self.create)
                    value.update(replayed=replayed, named_plan_revision=revision)
                    self.assertEqual(revision == 1, self.validator.is_valid(value))

    def test_original_result_replay_does_not_need_later_projection(self):
        replay = copy.deepcopy(self.positives["accepted_create_replay_retains_original_initial_revision"])
        original = copy.deepcopy(replay)
        original["replayed"] = False
        self.assertTrue(self.validator.is_valid(original))
        self.assertTrue(self.validator.is_valid(replay))
        self.assertEqual(1, replay["named_plan_revision"])
        self.assertEqual({**original, "replayed": True}, replay)

    def test_other_five_commands_keep_existing_result_shape(self):
        commands = set(SCHEMA["$defs"]["named_plan_command_id"]["enum"]) - {"cmd.named_plan.create"}
        self.assertEqual(5, len(commands))
        for command in commands:
            with self.subTest(command=command):
                value = copy.deepcopy(self.create)
                value.update(command_id=command, named_plan_revision=4, thread_group_ref=None, route_ref=None)
                self.assertTrue(self.validator.is_valid(value))

    def test_nonaccepted_outcomes_do_not_require_creation_success_fields(self):
        rejected = copy.deepcopy(self.positives["disabled_named_plan_result_names_registration_gap"])
        self.assertTrue(self.validator.is_valid(rejected))
        cancelled = copy.deepcopy(rejected)
        cancelled.update(outcome="cancelled", disabled_reason=None, error_code="cancelled")
        self.assertTrue(self.validator.is_valid(cancelled))
        no_change = copy.deepcopy(self.create)
        no_change.update(outcome="no_change", named_plan_revision=4,
                         thread_group_ref=None, route_ref=None, receipt_refs=[])
        self.assertTrue(self.validator.is_valid(no_change))

    def test_receipt_and_no_child_mutation_fences_remain(self):
        for patch in ({"receipt_refs": []}, {"child_work_mutated": True}):
            with self.subTest(patch=patch):
                value = {**self.create, **patch}
                self.assertFalse(self.validator.is_valid(value))

    def test_registered_fixtures_through_aggregate_entrypoints(self):
        self.assertIn((SCHEMA_REL, "Plans/named_plan_system_contract_fixtures.json"), GATE.CONTRACT_PAIRS)
        for case in FIXTURES["valid"]:
            with self.subTest(positive=case["name"]):
                definition, selected = GATE.select_definition(SCHEMA, case, case["value"], require_valid=True)
                self.assertTrue(GATE.validator_for(SCHEMA, selected, Registry()).is_valid(case["value"]))
                self.assertEqual([], GATE.contract_semantic_failures(SCHEMA_REL, definition, case["value"]))
        for case in FIXTURES["invalid"]:
            with self.subTest(negative=case["name"]):
                value = GATE.materialize_invalid(case, self.positives)
                definition, selected = GATE.select_definition(SCHEMA, case, value, require_valid=False)
                structurally_valid = GATE.validator_for(SCHEMA, selected, Registry()).is_valid(value)
                if "semantic_rule" in case:
                    self.assertTrue(structurally_valid)
                    self.assertIn(case["semantic_rule"], GATE.contract_semantic_failures(SCHEMA_REL, definition, value))
                else:
                    self.assertFalse(structurally_valid)


if __name__ == "__main__":
    unittest.main()
