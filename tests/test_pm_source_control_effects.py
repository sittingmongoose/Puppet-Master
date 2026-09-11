"""Owner-schema effect consistency, not native execution or recovery proof."""

import copy
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_COMMANDS = {
    "cmd.source_control.backend.detect",
    "cmd.source_control.backend.select",
    "cmd.source_control.repository.clone",
    "cmd.source_control.repository.bind",
    "cmd.source_control.repository.unbind",
    "cmd.source_control.status.refresh",
    "cmd.source_control.diff.open",
    "cmd.source_control.history.open",
    "cmd.source_control.workspace.list",
    "cmd.source_control.workspace.create",
    "cmd.source_control.workspace.open",
    "cmd.source_control.workspace.switch",
    "cmd.source_control.workspace.remove",
    "cmd.source_control.remote.fetch",
    "cmd.source_control.remote.sync",
    "cmd.source_control.remote.publish",
    "cmd.source_control.checkpoint.create",
    "cmd.source_control.checkpoint.inspect",
    "cmd.source_control.checkpoint.restore",
}


class SourceControlEffectContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT / "Plans/source_control_contracts.schema.json").read_text())
        cls.fixtures = json.loads((ROOT / "Plans/source_control_contract_fixtures.json").read_text())
        cls.valid = {case["name"]: case for case in cls.fixtures["valid"]}
        cls.requests = {
            case["value"]["scope"]["command_id"]: case["value"]
            for case in cls.fixtures["valid"]
            if case.get("definition") == "source_control_command_request"
        }
        cls.validators = {
            kind: Draft202012Validator(
                {
                    "$schema": cls.schema["$schema"],
                    "$id": cls.schema["$id"],
                    "$defs": cls.schema["$defs"],
                    "$ref": "#/$defs/source_control_command_" + kind,
                },
                format_checker=FormatChecker(),
            )
            for kind in ("request", "result", "error")
        }

    def result_for(self, command):
        result = copy.deepcopy(self.valid["source_control_command_result_is_generic_and_receipted"]["value"])
        request = self.requests[command]
        result["command_instance_id"] = request["command_instance_id"]
        result["scope"] = copy.deepcopy(request["scope"])
        if "return_context" in request:
            result["return_context"] = copy.deepcopy(request["return_context"])
        return result

    def error_for(self, command):
        error = copy.deepcopy(self.valid["source_control_command_error_blocks_effect_unknown_retry"]["value"])
        request = self.requests[command]
        error["command_instance_id"] = request["command_instance_id"]
        error["scope"] = copy.deepcopy(request["scope"])
        return error

    def test_exact_nineteen_owner_requests_are_valid(self):
        self.assertEqual(set(self.requests), EXPECTED_COMMANDS)
        self.assertEqual(set(self.schema["$defs"]["source_control_command_id"]["enum"]), EXPECTED_COMMANDS)
        for command, request in self.requests.items():
            with self.subTest(command=command):
                self.validators["request"].validate(request)

    def test_known_success_and_explicit_unknown_results_remain_representable(self):
        for command in self.requests:
            for outcome, effect_state in (("succeeded", "effects_reconciled"), ("effect_unknown", "effect_unknown")):
                with self.subTest(command=command, outcome=outcome):
                    result = self.result_for(command)
                    result.update(outcome=outcome, effect_state=effect_state)
                    self.validators["result"].validate(result)

    def test_pre_repository_and_read_scopes_do_not_require_mutation_leases(self):
        for command in (
            "cmd.source_control.backend.detect", "cmd.source_control.backend.select",
            "cmd.source_control.status.refresh", "cmd.source_control.diff.open",
            "cmd.source_control.history.open", "cmd.source_control.workspace.list",
            "cmd.source_control.workspace.open", "cmd.source_control.checkpoint.inspect",
        ):
            with self.subTest(command=command):
                request = copy.deepcopy(self.requests[command])
                request["scope"].pop("writer_lease_ref", None)
                request["scope"].pop("credential_lease_ref", None)
                if ".backend." in command:
                    for field in ("repository_context_ref", "repo_id", "workspace_id", "expected_revision"):
                        request["scope"].pop(field, None)
                self.validators["request"].validate(request)

    def test_unknown_effect_cannot_claim_success(self):
        for command in self.requests:
            with self.subTest(command=command):
                result = self.result_for(command)
                result["effect_state"] = "effect_unknown"
                self.assertFalse(self.validators["result"].is_valid(result))

    def test_unknown_error_cannot_disguise_itself_as_known_and_retryable(self):
        for command in self.requests:
            for effect_state in ("no_effect", "effects_reconciled"):
                with self.subTest(command=command, effect_state=effect_state):
                    error = self.error_for(command)
                    error.update(effect_state=effect_state, retry_allowed=True, safe_next_actions=["retry"])
                    self.assertFalse(self.validators["error"].is_valid(error))

    def test_unknown_effect_does_not_offer_retry_even_alongside_reconciliation(self):
        for command in self.requests:
            with self.subTest(command=command):
                error = self.error_for(command)
                error["safe_next_actions"] = ["inspect", "retry", "reconcile_effects"]
                self.assertFalse(self.validators["error"].is_valid(error))

    def test_reconciliation_and_known_effect_errors_remain_representable(self):
        for command in self.requests:
            with self.subTest(command=command):
                error = self.error_for(command)
                self.validators["error"].validate(error)
                error.update(error_code="stale_revision", effect_state="no_effect", retry_allowed=True,
                             safe_next_actions=["refresh", "retry"])
                self.validators["error"].validate(error)


if __name__ == "__main__":
    unittest.main()
