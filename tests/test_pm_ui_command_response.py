"""Static cross-owner response joins; no dispatcher, UI or effects execute."""

import argparse
import copy
import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]


def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    loaded = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(loaded)
    return loaded


GATE = module("ui_response_gate", "pm-ui-command-response.py")
OWNER = GATE.owner
STANDARD = module("ui_response_standard_gate", "pm-plans-verify.py")
FIXTURES = json.loads((ROOT / "Plans/ui_command_response_fixtures.json").read_text())
CASES = {row["case_id"]: row for row in FIXTURES["valid"]}


class UICommandResponseTests(unittest.TestCase):
    def test_all_exact_fixture_cases(self):
        report = GATE.validate()
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["positive_cases"], 24)
        self.assertEqual(report["negative_cases"], 56)
        self.assertEqual(report["outcome_states"], 8)
        self.assertEqual(report["native_owner_adapters_proven"], 0)

    def test_every_shared_result_schema_inherits_outcome_reference(self):
        wiring = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())
        commands = OWNER.schema(OWNER.SHARED_SCHEMA)["$defs"]["canonical_command_id"]["enum"]
        refs = {row["ui_command_id"]: row["result_schema_ref"] for row in wiring["entries"].values()
                if row["ui_command_id"] in commands}
        self.assertEqual(len(refs), 26)
        for command, ref in refs.items():
            with self.subTest(command=command):
                path, pointer = ref.split("#", 1)
                errors = OWNER.structural_failures(path, {}, "#" + pointer)
                self.assertIn("'command_outcome_ref' is a required property", errors)

    def test_acceptance_acknowledgement_execution_are_pending(self):
        for state in ("accepted", "acknowledged", "executing"):
            with self.subTest(state=state):
                value = copy.deepcopy(CASES["shared_" + state])
                self.assertEqual(value["response"]["result_status"], "pending")
                value["response"]["result_status"] = "succeeded"
                self.assertTrue(OWNER.response_bundle_failures(value))

    def test_application_scope_does_not_invent_project(self):
        value = CASES["server_application_scope"]
        self.assertIsNone(value["response"]["owner_identity"]["project_id"])
        self.assertEqual(OWNER.response_bundle_failures(value), [])

    def test_local_action_replay_requires_original_receipt(self):
        value = copy.deepcopy(CASES["local_projection_success"])
        original = copy.deepcopy(value["response"])
        value["response"].update(replayed=True, original_dispatch_id=original["dispatch_id"], dispatch_id="dispatch-local-replay")
        self.assertIn("replay_original_response_missing", OWNER.response_bundle_failures(value))
        value["original_response"] = original
        self.assertEqual(OWNER.response_bundle_failures(value), [])
        value["response"]["receipt_ref"] = "receipt:different-local-action"
        self.assertIn("replay_changed_original_result_identity", OWNER.response_bundle_failures(value))

    def test_predispatch_replay_preserves_rejection(self):
        value = copy.deepcopy(CASES["predispatch_handler_unavailable"])
        original = copy.deepcopy(value["response"])
        value["original_response"] = original
        value["response"].update(replayed=True, original_dispatch_id=original["dispatch_id"])
        self.assertEqual(OWNER.response_bundle_failures(value), [])
        value["response"]["error"]["reason"] = "Different refusal"
        self.assertIn("replay_changed_original_result_identity", OWNER.response_bundle_failures(value))

    def test_owner_replay_cannot_remint_operation(self):
        value = copy.deepcopy(CASES["replay_returns_original_owner_result"])
        value["response"]["operation_id"] = "operation-replay-minted"
        self.assertIn("replay_changed_original_result_identity", OWNER.response_bundle_failures(value))

    def test_local_route_is_not_durable_command_escape(self):
        value = copy.deepcopy(CASES["local_projection_success"])
        for row in (value["response"], value["normalized_request"]):
            row["command_id"] = "cmd.environment.connect"
        self.assertIn("durable_command_disguised_as_local_projection", OWNER.response_bundle_failures(value))

    def test_unknown_effects_require_recovery_not_success(self):
        value = copy.deepcopy(CASES["browser_effect_unknown"])
        self.assertEqual(value["response"]["result_status"], "recovery_required")
        value["response"]["result_status"] = "succeeded"
        self.assertTrue(OWNER.response_bundle_failures(value))

    def test_fixture_only_run_does_not_claim_production_consumers(self):
        report = GATE.validate(fixtures_only=True)
        self.assertEqual(report["wiring_rows_consuming_response_contract"], 0)
        self.assertEqual(report["status"], "fixtures_valid_consumption_not_claimed")

    def test_declared_global_contract_does_not_claim_missing_typed_adapters(self):
        report = GATE.validate()
        # The response bridge must cover the actual production matrix, not its
        # historical admission snapshot. WM-056 owns the reviewed peer removals.
        entries = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
        typed = sum(bool(row.get("result_schema_ref")) for row in entries.values())
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["wiring_rows_consuming_response_contract"], len(entries))
        self.assertEqual(report["wiring_rows_with_explicit_typed_result_ref"], typed)
        self.assertEqual(report["wiring_rows_without_explicit_typed_result_ref"], len(entries) - typed)
        self.assertGreater(len(entries) - typed, 0)
        self.assertEqual(report["native_owner_adapters_proven"], 0)

    def test_both_standard_aggregate_paths_include_both_new_checks(self):
        args = argparse.Namespace(progress=False, subcheck_timeout_seconds=0)
        for function, response_name, browser_name in (
            (STANDARD.cmd_run_gates, "validate_ui_command_response", "validate_browser_event_admission"),
            (STANDARD.cmd_audit_governance, "ui_command_response", "browser_event_admission"),
        ):
            seen = []
            def fake(name, callback, namespace, **kwargs):
                seen.append((name, callback))
                return name, {"status": "pass", "failures": []}
            with patch.object(STANDARD, "run_named_check", side_effect=fake):
                self.assertEqual(function(args)["status"], "pass")
            self.assertEqual(sum(name == response_name for name, _ in seen), 1)
            self.assertIn((response_name, STANDARD.cmd_validate_ui_command_response), seen)
            self.assertIn((browser_name, STANDARD.cmd_validate_browser_event_admission), seen)
            self.assertEqual(STANDARD._aggregate_subcheck_command_id(response_name), "validate-ui-command-response")
            self.assertIn(response_name, STANDARD._AGGREGATE_NAMES_WITH_TIMEOUT_ARG)


if __name__ == "__main__":
    unittest.main()
