"""Static schema, cross-record and single-route checks; not native execution proof."""

from __future__ import annotations

import copy
import argparse
import importlib.util
import json
from pathlib import Path
import sys
import unittest

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_project_unarchive_contract import validate_transition  # noqa: E402


def load(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


class ProjectUnarchiveTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = load("Plans/project_system_contracts.schema.json")
        cls.fixtures = {case["name"]: case["value"] for case in load("Plans/project_system_contract_fixtures.json")["valid"]}

    def setUp(self):
        self.request = copy.deepcopy(self.fixtures["command_project_unarchive_registry_mutation"])
        self.result = copy.deepcopy(self.fixtures["server_gap_b.positive.unarchive.persisted_result"])
        self.before = copy.deepcopy(self.fixtures["listed_git_project_is_identity_not_path"])
        self.before.update(project_id=self.request["project_id"], lifecycle="archived", revision=2, currentness_sha256="c" * 64)
        self.after = copy.deepcopy(self.before)
        self.after.update(lifecycle="listed", revision=3, currentness_sha256="d" * 64, updated_at_utc="2026-09-11T00:00:00Z")
        self.registry_before = {"revision": 5, "currentness_sha256": "2" * 64}
        self.registry_after = {"revision": 6, "currentness_sha256": "3" * 64}

    def check(self, **extra):
        return validate_transition(self.schema, self.request, self.result, self.before, self.after, self.registry_before, self.registry_after, **extra)

    def valid(self, definition, instance):
        return Draft202012Validator({"$defs": self.schema["$defs"], "$ref": f"#/$defs/{definition}"}).is_valid(instance)

    def test_registry_only_success_and_inputs_are_not_mutated(self):
        before_call = copy.deepcopy((self.request, self.result, self.before, self.after, self.registry_before, self.registry_after))
        self.assertEqual(self.check(), [])
        self.assertEqual(before_call, (self.request, self.result, self.before, self.after, self.registry_before, self.registry_after))

    def test_every_existing_project_field_outside_registry_metadata_is_preserved(self):
        values = {
            "project_id": "project:replacement", "display_name": "Renamed", "registration_kind": "existing_local",
            "stable_config_ref": "project_config:replacement", "project_home_server_ref": "server:other",
            "project_vault_ref": "vault:other", "source_location_refs": ["source_location:other"],
            "repository_refs": ["repository:other"], "last_opened_at_utc": "2026-09-11T00:00:00Z",
            "migration_alias_refs": ["migration:other"], "warning_codes": ["source_unavailable"],
            "created_at_utc": "2026-09-11T00:00:00Z",
        }
        original = copy.deepcopy(self.after)
        for field, value in values.items():
            with self.subTest(field=field):
                self.after = copy.deepcopy(original)
                self.after[field] = value
                self.assertTrue(self.check())

    def test_all_four_stale_fences_reject_schema_valid_success(self):
        original = copy.deepcopy(self.request)
        for field, value in {
            "expected_registry_revision": 4, "expected_registry_currentness_sha256": "1" * 64,
            "expected_project_revision": 1, "expected_project_currentness_sha256": "b" * 64,
        }.items():
            with self.subTest(field=field):
                self.request = copy.deepcopy(original)
                self.request[field] = value
                self.assertTrue(self.valid("project_action_request", self.request))
                self.assertTrue(any("stale_" in error for error in self.check()))

    def test_removed_and_deletion_states_cannot_be_restored(self):
        for state in ("removed_from_list", "data_deletion_pending", "data_deletion_blocked", "registration_failed", "listed"):
            with self.subTest(state=state):
                self.before["lifecycle"] = state
                self.assertIn("archive_state_required", self.check())

    def test_no_change_requires_listed_and_preserves_fences(self):
        self.before = copy.deepcopy(self.after)
        self.registry_before = copy.deepcopy(self.registry_after)
        self.request.update(expected_project_revision=3, expected_project_currentness_sha256="d" * 64, expected_registry_revision=6, expected_registry_currentness_sha256="3" * 64)
        self.result.update(outcome="no_change", persistence_disposition="no_change")
        self.assertEqual(self.check(), [])
        self.after["revision"] += 1
        self.assertIn("non_committing_result_mutated_state", self.check())

    def test_denied_cancelled_and_stale_rejections_cannot_write(self):
        for outcome, error in (("rejected", "permission_denied"), ("rejected", "stale_registry_revision"), ("cancelled", "cancelled")):
            with self.subTest(outcome=outcome, error=error):
                self.after = copy.deepcopy(self.before)
                self.registry_after = copy.deepcopy(self.registry_before)
                self.result.update(outcome=outcome, error_code=error, persistence_disposition="not_attempted", project_revision=2, project_currentness_sha256="c" * 64, lifecycle="archived", resulting_registry_revision=5, resulting_registry_currentness_sha256="2" * 64)
                self.assertEqual(self.check(), [])
                self.after["lifecycle"] = "listed"
                self.assertIn("non_committing_result_mutated_state", self.check())

    def test_replay_returns_original_result_without_second_write(self):
        original_request, original_result = copy.deepcopy(self.request), copy.deepcopy(self.result)
        self.before = copy.deepcopy(self.after)
        self.registry_before = copy.deepcopy(self.registry_after)
        self.result["replayed"] = True
        self.assertEqual(self.check(original_request=original_request, original_result=original_result), [])
        self.after["revision"] += 1
        self.assertIn("replay_mutated_state", self.check(original_request=original_request, original_result=original_result))

    def test_replay_requires_original_binding_and_unchanged_result(self):
        original_request, original_result = copy.deepcopy(self.request), copy.deepcopy(self.result)
        self.before = copy.deepcopy(self.after)
        self.registry_before = copy.deepcopy(self.registry_after)
        self.result["replayed"] = True
        self.assertIn("replay_missing_original_binding", self.check())
        self.request["permission_snapshot_ref"] = "permission:other"
        self.assertIn("replay_binding_changed", self.check(original_request=original_request, original_result=original_result))
        self.request = original_request
        self.result["receipt_refs"] = ["receipt:replacement"]
        self.assertIn("replay_original_result_changed", self.check(original_request=original_request, original_result=original_result))

    def test_result_requires_exact_correlation_and_readback(self):
        original = copy.deepcopy(self.result)
        for field, value in {"command_instance_id": "command:other", "project_id": "project:other", "project_revision": 4, "project_currentness_sha256": "e" * 64, "resulting_registry_revision": 7, "resulting_registry_currentness_sha256": "4" * 64}.items():
            with self.subTest(field=field):
                self.result = copy.deepcopy(original)
                self.result[field] = value
                self.assertTrue(self.valid("project_action_result", self.result))
                self.assertTrue(self.check())
        self.result = original
        self.result["return_context"]["focus_id"] = "different-focus"
        self.assertIn("wrong_return_context", self.check())

    def test_success_cannot_skip_or_double_commit(self):
        self.after["revision"] = 4
        self.registry_after["revision"] = 7
        self.result.update(project_revision=4, resulting_registry_revision=7)
        self.assertIn("project_revision_not_once", self.check())
        self.assertIn("registry_revision_not_once", self.check())

    def test_local_contract_remains_read_only_and_cannot_accept_restore(self):
        self.assertEqual(self.schema["$defs"]["ProjectCompositionLocalActionId"]["enum"], ["ui.project.open_details", "ui.project_template.open_details"])
        for suffix, definition in (("request", "project_local_action_request"), ("result", "project_local_action_result")):
            value = copy.deepcopy(self.fixtures[f"server_gap_b.positive.local.1.{suffix}"])
            self.assertTrue(self.valid(definition, value))
            value["local_action_id"] = "ui.project.restore_archived"
            self.assertFalse(self.valid(definition, value))

    def test_one_registered_owner_route_not_an_exclusion_or_alias(self):
        command = "cmd.project.unarchive"
        wire = load("Plans/Wiring_Matrix.production.json")["entries"]
        matches = [(key, row) for key, row in wire.items() if row["ui_command_id"] == command]
        self.assertEqual(len(matches), 1)
        key, row = matches[0]
        self.assertEqual(key, "catalog.project_unarchive")
        self.assertEqual(row["handler_location"], "handlers::project::unarchive")
        self.assertEqual(row["request_schema_ref"], "Plans/project_system_contracts.schema.json#/$defs/project_action_request")
        self.assertEqual(row["result_schema_ref"], "Plans/project_system_contracts.schema.json#/$defs/project_action_result")
        self.assertEqual(row["expected_event_types"], [])
        self.assertNotIn(command, load("Plans/Wiring_Matrix.production.exclusions.json")["excluded_tokens"])
        touch = load("Plans/touch_closure.json")
        self.assertEqual([value[0] for value in touch["rows"] if value[3] == command], ["TOUCH-PJCT-010"])
        self.assertFalse([value for value in touch["rows"] if value[3] == "ui.project.restore_archived"])
        adapter = self.schema["x-project-ui-entry-adapters"]["ui.project.restore_archived"]
        self.assertEqual(adapter["command_id"], command)
        self.assertTrue(adapter["normalize_before_all_gates"])
        for field in ("independent_handler_allowed", "independent_wiring_allowed", "local_registry_mutation_allowed", "legacy_request_replay_allowed"):
            self.assertIs(adapter[field], False)

    def test_re_adjudication_preserves_source_row_and_separate_composition_family(self):
        rows = load("Plans/server_command_gap_adjudication.json")["rows"]
        row = rows[127]
        self.assertEqual((row["row_index"], row["token"], row["case_ref"]), (128, "cmd.project.unarchive", "server_command_candidates/cmd.project.unarchive"))
        self.assertEqual(row["disposition"], "new_canonical_required")
        self.assertEqual(row["proposed_exact_target"], row["token"])
        self.assertEqual(row["packet_source_verification"]["source_sha256"], "f9be848f2cb80eaf5e05df338392279b454e5c23d4b7fc4be6ed32326c87064b")
        self.assertEqual(len(self.schema["$defs"]["ProjectCompositionCommandId"]["enum"]), 6)
        self.assertNotIn(row["token"], self.schema["$defs"]["ProjectCompositionCommandId"]["enum"])

    def test_standard_gate_consumes_the_approved_partition(self):
        spec = importlib.util.spec_from_file_location("project_unarchive_standard_gate", ROOT / "scripts/pm-plans-verify.py")
        gate = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(gate)
        result = gate.cmd_validate_server_command_gap(argparse.Namespace())
        self.assertEqual(result["status"], "pass", result)
        self.assertEqual(result["partition"], {"new_canonical_required": 87, "approved_alias_to_exact": 43,
                                                "typed_local_ui_action": 38, "rejected_with_reason": 3})


if __name__ == "__main__":
    unittest.main()
