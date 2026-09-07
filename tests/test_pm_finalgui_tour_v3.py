"""Static consumer/registry checks; never a tour execution or visual verdict."""
from __future__ import annotations

import contextlib
import copy
import importlib.util
import io
import json
from pathlib import Path
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("new_contracts_tour_test", ROOT / "scripts/pm-new-contracts-verify.py")
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class FinalGuiTourV3Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = gate.load_json(ROOT / "Plans/final_gui_interaction_contracts.schema.json")
        cls.fixtures = gate.load_json(ROOT / "Plans/final_gui_interaction_contract_fixtures.json")
        cls.registry = gate.offline_schema_registry()
        cls.tour = cls.fixtures["positive_instance"]["contracts"][2]
        cls.validator = gate.validator_for(cls.schema, {"$ref": "#/$defs/guided_tour"}, cls.registry)

    def test_current_contract_and_dry_owner_references(self):
        self.assertEqual(list(self.validator.iter_errors(self.tour)), [])
        for field, definition in (("scenes", "story_order"), ("actions", "ui_actions")):
            self.assertEqual(self.schema["$defs"]["guided_tour"]["properties"][field], {
                "$ref": "https://puppetmaster.local/schemas/guided_tour/3.0.0/guided_tour_contracts.schema.json#/$defs/" + definition
            })
        self.assertEqual(self.tour["scenes"], ["chat_teacher", "workspace", "planning_wizard"])
        self.assertEqual(len(self.tour["actions"]), 11)

    def test_each_tour_negative_fails_at_its_changed_field(self):
        cases = [case for case in self.fixtures["negative_mutations"] if case["json_pointer"].startswith("/contracts/2/")]
        self.assertEqual(len(cases), 49)
        self.assertEqual(len({case["case_id"] for case in cases}), len(cases))
        for case in cases:
            with self.subTest(case=case["case_id"]):
                pointer = case["json_pointer"].removeprefix("/contracts/2")
                # Prove the existing target is changed, not a no-op that fails
                # only because an unrelated new requirement is already absent.
                before = copy.deepcopy(self.tour)
                changed = gate.pointer_set(before, pointer, case["replacement"])
                self.assertNotEqual(changed, self.tour)
                errors = list(self.validator.iter_errors(changed))
                self.assertTrue(errors)
                expected_path = pointer.strip("/").split("/")
                self.assertTrue(any(
                    [str(part) for part in error.absolute_path][:len(expected_path)] == expected_path
                    for error in errors
                ), [(list(error.absolute_path), error.message) for error in errors])

    def test_real_mutation_gate_resolves_shared_owner_offline(self):
        # Exercise the actual negative_mutations loop, not just a helper. The
        # old loop bypassed the registered schemas and attempted retrieval.
        output = io.StringIO()
        with mock.patch("urllib.request.urlopen", side_effect=AssertionError("network schema lookup forbidden")), contextlib.redirect_stdout(output):
            gate.main()
        report = json.loads(output.getvalue())
        relevant = [row for row in report["findings"] if row.get("fixture") == "Plans/final_gui_interaction_contract_fixtures.json"]
        self.assertEqual(relevant, [])

    def test_checkpoint_storage_is_pending_not_runtime_admission(self):
        schema = gate.load_json(ROOT / "Plans/storage_value_registry.schema.json")
        registry = gate.load_json(ROOT / "Plans/storage_value_registry.json")
        rows = {row["disposition_id"]: row for row in registry["contract_family_dispositions"]}
        checkpoint = rows["scd.guided_tour.checkpoint.v1"]
        transient = rows["scd.guided_tour.ephemeral.v1"]
        row_validator = gate.validator_for(schema, {"$ref": "#/$defs/contract_family_disposition"}, self.registry)
        for row in (checkpoint, transient):
            self.assertEqual(list(row_validator.iter_errors(row)), [])
            self.assertFalse(row["runtime_evidence"])
            self.assertEqual(row["existing_family_refs"], [])
        self.assertEqual(checkpoint["record_kinds"], ["pm.guided_tour.checkpoint.v3"])
        self.assertEqual(checkpoint["physical_family_status"], "physical_family_registration_pending")
        self.assertEqual(checkpoint["retention_disposition"]["mode"], "physical_registration_pending")
        self.assertEqual(checkpoint["schema_ref"], "Plans/guided_tour_contracts.schema.json#/$defs/guided_tour_checkpoint")
        self.assertNotIn("pm.guided_tour.checkpoint.v3", transient["record_kinds"])
        self.assertEqual(transient["persistence_disposition"], "ephemeral_nonpersisted")
        # No checkpoint physical family is admitted by this disposition-only work.
        self.assertFalse(any(
            family.get("value_schema_id") == "pm.guided_tour.checkpoint.v3"
            or "guided_tour" in family["family_id"]
            for family in registry["families"]
        ))


if __name__ == "__main__":
    unittest.main()
