"""Static phase/consent regression evidence; no backup or restore is executed."""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("pm_restore_contract_gate", ROOT / "scripts/pm-new-contracts-verify.py")
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)
SCHEMA_REL = "Plans/backup_restore_system_contracts.schema.json"
SCHEMA = json.loads((ROOT / SCHEMA_REL).read_text())
FIXTURES = json.loads((ROOT / "Plans/backup_restore_system_contract_fixtures.json").read_text())
POSITIVE = {case["name"]: case for case in FIXTURES["valid"]}


def example(name):
    return copy.deepcopy(POSITIVE[name]["value"])


def validator(definition):
    return Draft202012Validator({**SCHEMA["$defs"][definition], "$defs": SCHEMA["$defs"]},
                                format_checker=FormatChecker())


class RestorePhaseContractsTest(unittest.TestCase):
    def assert_valid(self, value, definition="restore_run"):
        self.assertEqual([], [error.message for error in validator(definition).iter_errors(value)])
        self.assertEqual([], GATE.contract_semantic_failures(SCHEMA_REL, definition, value))

    def assert_invalid(self, value, definition="restore_run"):
        self.assertTrue(list(validator(definition).iter_errors(value)) or
                        GATE.contract_semantic_failures(SCHEMA_REL, definition, value))

    def test_every_authored_positive_is_structurally_and_semantically_valid(self):
        Draft202012Validator.check_schema(SCHEMA)
        for case in FIXTURES["valid"]:
            with self.subTest(case=case["name"]):
                self.assert_valid(case["value"], case["definition"])

    def test_every_authored_negative_has_its_intended_failure(self):
        values = {name: case["value"] for name, case in POSITIVE.items()}
        for case in FIXTURES["invalid"]:
            with self.subTest(case=case["name"]):
                value = GATE.materialize_invalid(case, values)
                definition = case.get("definition", POSITIVE[case["base_valid"]]["definition"])
                structural = list(validator(definition).iter_errors(value))
                semantics = GATE.contract_semantic_failures(SCHEMA_REL, definition, value)
                if "semantic_rule" in case:
                    self.assertEqual([], [error.message for error in structural])
                    self.assertIn(case["semantic_rule"], semantics)
                else:
                    self.assertTrue(structural)

    def test_all_nineteen_phases_have_direct_positive_fixtures_in_all_four_modes(self):
        states = SCHEMA["$defs"]["restore_state"]["enum"]
        self.assertEqual(19, len(states))
        for state in states:
            for mode in SCHEMA["$defs"]["restore_mode"]["enum"]:
                with self.subTest(state=state, mode=mode):
                    value = example("restore_run_phase_" + state)
                    value["mode"] = mode
                    value["identity_policy"] = "same_project_new_recovery_epoch" if mode == "in_place" else "new_identity"
                    value["recovery_safe_mode"] = mode == "server_full"
                    self.assert_valid(value)

    def test_early_phases_do_not_invent_future_evidence(self):
        for state in ("selecting_backup", "reading_manifest", "compatibility_check", "previewing",
                      "waiting_for_approval", "pre_restore_backup"):
            value = example("restore_run_phase_" + state)
            self.assertIsNone(value["recovery_point_receipt_ref"])
            self.assertIsNone(value["staged_verification_receipt_ref"])
            self.assertIsNone(value["post_restore_verification_ref"])
            self.assertFalse(value["mutation_applied"])
            self.assert_valid(value)
        selection = example("restore_run_phase_selecting_backup")
        self.assertIsNone(selection["backup_id"])
        self.assertIsNone(selection["manifest_id"])

    def test_phase_specific_prerequisites_cannot_be_removed(self):
        required_at = {
            "waiting_for_approval": ["preview_receipt_ref"],
            "pre_restore_backup": ["approval_receipt_ref"],
            "staging": ["recovery_point_receipt_ref"],
            "resolving_identity": ["staged_verification_receipt_ref"],
            "resolving_credentials": ["identity_resolution_ref"],
            "resolving_source_locations": ["credential_resolution_ref"],
            "quiescing": ["source_location_resolution_ref"],
            "complete": ["derived_rebuild_ref", "post_restore_verification_ref", "client_cache_invalidation_ref"],
        }
        for state, fields in required_at.items():
            for field in fields:
                with self.subTest(state=state, field=field):
                    value = example("restore_run_phase_" + state)
                    value[field] = None
                    self.assert_invalid(value)

    def test_all_four_commands_keep_exact_modes_with_either_recovery_basis(self):
        for name, mode in (("command_restore_project_in_place", "in_place"),
                           ("command_restore_project_as_new", "as_new"),
                           ("command_restore_selective", "selective"),
                           ("command_restore_full_server", "server_full")):
            for suffix in ("", "_emergency"):
                value = example(name + suffix)
                self.assert_valid(value, "backup_restore_command_request")
                for other in SCHEMA["$defs"]["restore_mode"]["enum"]:
                    if other == mode:
                        continue
                    with self.subTest(command=name, suffix=suffix, wrong_mode=other):
                        changed = copy.deepcopy(value)
                        changed["restore_mode"] = other
                        self.assert_invalid(changed, "backup_restore_command_request")

    def test_emergency_binding_cannot_change_any_authorized_target_or_proof(self):
        original = example("restore_run_emergency_staging_with_bound_human_consent")
        self.assert_valid(original)
        for field in ("restore_run_id", "target_server_id", "idempotency_key",
                      "preview_receipt_ref", "approval_receipt_ref"):
            value = copy.deepcopy(original)
            value["emergency_recovery_consent"][field] = "different:value"
            with self.subTest(field=field):
                self.assert_invalid(value)
        for field in ("consent_receipt_ref", "unavailability_evidence_ref", "authorization_ref",
                      "validation_receipt_ref", "actor_kind", "issued_at_utc", "validated_at_utc", "expires_at_utc"):
            value = copy.deepcopy(original)
            del value["emergency_recovery_consent"][field]
            with self.subTest(missing=field):
                self.assert_invalid(value)

    def test_emergency_command_cannot_substitute_another_actor(self):
        value = example("command_restore_project_in_place_emergency")
        value["actor_ref"] = "actor:other-human"
        self.assert_invalid(value, "backup_restore_command_request")

    def test_exception_does_not_create_a_sixth_backup_receipt_family_or_bypass_rollback(self):
        self.assertNotIn({"$ref": "#/$defs/emergency_recovery_consent"}, SCHEMA["oneOf"])
        value = example("completed_emergency_restore_does_not_claim_rollback")
        self.assertFalse(value["rollback_available"])
        self.assertIsNone(value["rollback_ref"])
        self.assert_valid(value, "restore_receipt")
        value["rollback_available"] = True
        value["rollback_ref"] = "rollback:not-real"
        self.assert_invalid(value, "restore_receipt")

    def test_restore_command_and_ui_consumers_use_one_owner_contract(self):
        command_ids = {"cmd.restore.project_in_place", "cmd.restore.project_as_new",
                       "cmd.restore.selective", "cmd.restore.server_full"}
        wiring = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())
        rows = [row for row in wiring["entries"].values() if row["ui_command_id"] in command_ids]
        self.assertEqual(command_ids, {row["ui_command_id"] for row in rows})
        for row in rows:
            self.assertEqual(SCHEMA_REL + "#/$defs/backup_restore_command_request", row["request_schema_ref"])
            self.assertEqual(SCHEMA_REL + "#/$defs/backup_restore_command_result", row["result_schema_ref"])
        for consumer in ("Commands_System.md", "UI_Command_Catalog.md"):
            prose = (ROOT / "Plans" / consumer).read_text()
            for command in command_ids:
                self.assertIn("`" + command + "`", prose)
            self.assertIn("Plans/Backup_Restore_System.md", prose)
        for consumer in ("Project_System.md", "FinalGUISpec.md"):
            self.assertIn("BRS-023", (ROOT / "Plans" / consumer).read_text())


if __name__ == "__main__":
    unittest.main()
