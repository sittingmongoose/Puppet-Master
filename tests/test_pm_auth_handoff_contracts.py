"""Static RAS-015/shared-auth contract regression checks, not broker/runtime proof."""

import copy
import json
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "Plans/shared_runtime_command_contracts.schema.json"
FIXTURES = ROOT / "Plans/shared_runtime_command_contract_fixtures.json"


class AuthHandoffContractsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
        cls.cases = {
            case["name"]: case
            for case in json.loads(FIXTURES.read_text(encoding="utf-8"))["valid"]
        }

    def errors(self, name, value=None):
        case = self.cases[name]
        selected = {
            "$schema": self.schema["$schema"],
            "$defs": self.schema["$defs"],
            "$ref": "#/$defs/" + case["definition"],
        }
        return list(Draft202012Validator(selected, format_checker=FormatChecker()).iter_errors(
            case["value"] if value is None else value
        ))

    def test_schema_and_auth_positives(self):
        Draft202012Validator.check_schema(self.schema)
        for name, case in self.cases.items():
            if case["definition"] in {"authentication_command_request", "authentication_command_result"}:
                with self.subTest(name=name):
                    self.assertEqual([], self.errors(name))

    def test_fixture_preserves_operation_and_changes_only_authorized_client_handoff(self):
        start = self.cases["tailscale_auth_start_current_authorized_handoff"]["value"]
        resumed = self.cases["tailscale_auth_resume_replacement_client_fresh_handoff"]["value"]
        result = self.cases["tailscale_auth_verified_current_authorized_handoff"]["value"]
        for key in ("authentication_operation_id", "initiating_client_id",
                    "expected_initiating_client_session_generation", "provider_id", "route_id"):
            self.assertEqual(start[key], resumed[key], key)
        old, new = start["server_owned_handoff"], resumed["server_owned_handoff"]
        for key in ("server_id", "connector_id", "authorization_session_ref", "operation_generation"):
            self.assertEqual(old[key], new[key], key)
        self.assertGreater(new["handoff_generation"], old["handoff_generation"])
        self.assertNotEqual(new["authorized_client_id"], old["authorized_client_id"])
        self.assertNotEqual(new["protected_action_ref"], old["protected_action_ref"])
        for key in ("protected_auth_session_ref", "continuation_ref", "return_target_ref"):
            self.assertNotEqual(start[key], resumed[key], key)
        self.assertEqual(resumed["authentication_operation_id"], result["authentication_operation_id"])
        self.assertEqual(resumed["return_target_ref"], result["return_target_ref"])
        self.assertEqual(new, result["server_owned_handoff"])

    def test_every_handoff_binding_field_is_required(self):
        name = "tailscale_auth_resume_replacement_client_fresh_handoff"
        for field in self.schema["$defs"]["server_owned_auth_handoff"]["required"]:
            with self.subTest(field=field):
                value = copy.deepcopy(self.cases[name]["value"])
                del value["server_owned_handoff"][field]
                self.assertTrue(self.errors(name, value))

    def test_handoff_rejects_unapproved_shape_and_secret_channels(self):
        name = "tailscale_auth_resume_replacement_client_fresh_handoff"
        invalid = {
            "owner_contract_ref": "Plans/Other_Provider.md",
            "control_server_kind": "headscale",
            "operation_generation": 0,
            "handoff_generation": 0,
            "authorized_client_id": "",
            "authorized_client_session_generation": None,
            "protected_action_ref": "https://invalid.example/authorize",
            "authorization_session_ref": "HTTPS://invalid.example/authorize",
            "client_loss_policy": "cancel_operation",
            "inherited_protected_content": True,
            "authorization_url": "https://invalid.example/authorize",
            "cookies": "fixture-value",
            "authentication_operation_id": "auth-operation:shadow",
        }
        for field, replacement in invalid.items():
            with self.subTest(field=field):
                value = copy.deepcopy(self.cases[name]["value"])
                value["server_owned_handoff"][field] = replacement
                self.assertTrue(self.errors(name, value))

    def test_other_providers_do_not_gain_an_unbound_replacement_policy(self):
        name = "protected_auth_start_bound_to_initiating_active_client"
        value = copy.deepcopy(self.cases[name]["value"])
        self.assertEqual(value["client_handoff_policy"], "initiating_active_client_only")
        self.assertNotEqual(value["provider_id"], "provider:tailscale")
        value["client_handoff_policy"] = "server_owned_authorized_client_handoff"
        self.assertTrue(self.errors(name, value))

    def test_handoff_reuses_the_remote_access_owner_action_reference(self):
        remote = json.loads((ROOT / "Plans/remote_access_system_contracts.schema.json").read_text(encoding="utf-8"))
        owner_fields = remote["$defs"]["tailscale_authorization_session"]["properties"]
        binding_fields = self.schema["$defs"]["server_owned_auth_handoff"]["properties"]
        for field in ("authorization_session_ref", "protected_action_ref", "operation_generation",
                      "handoff_generation", "authorized_client_id", "authorized_client_session_generation"):
            self.assertIn(field, owner_fields)
            self.assertIn(field, binding_fields)
        self.assertNotIn("handoff_authorization_ref", binding_fields)
        self.assertNotIn("approval_state", binding_fields)

    def test_handoff_cannot_be_relabelled_as_old_policy_or_non_browser_auth(self):
        name = "tailscale_auth_resume_replacement_client_fresh_handoff"
        for field, replacement in (("client_handoff_policy", "initiating_active_client_only"),
                                   ("client_handoff_policy", "not_applicable"),
                                   ("auth_surface", "device_code"),
                                   ("expected_auth_revision", None)):
            with self.subTest(field=field, replacement=replacement):
                value = copy.deepcopy(self.cases[name]["value"])
                value[field] = replacement
                self.assertTrue(self.errors(name, value))

    def test_non_browser_auth_retains_its_existing_policy_choices(self):
        name = "protected_auth_start_bound_to_initiating_active_client"
        for surface in ("device_code", "terminal_user_flow", "provider_owned_external"):
            for policy in ("not_applicable", "initiating_active_client_only"):
                with self.subTest(surface=surface, policy=policy):
                    value = copy.deepcopy(self.cases[name]["value"])
                    value["auth_surface"] = surface
                    value["client_handoff_policy"] = policy
                    self.assertEqual([], self.errors(name, value))

    def test_verified_result_requires_current_handoff_and_never_returns_content(self):
        name = "tailscale_auth_verified_current_authorized_handoff"
        for field, replacement in (("return_fence_state", "exact_operation_and_initiating_active_client"),
                                   ("return_fence_state", "rejected_authorized_client_handoff"),
                                   ("content_exposed_to_caller", True),
                                   ("content_capture_allowed", True),
                                   ("content_persistence_allowed", True)):
            with self.subTest(field=field):
                value = copy.deepcopy(self.cases[name]["value"])
                value[field] = replacement
                self.assertTrue(self.errors(name, value))


if __name__ == "__main__":
    unittest.main()
