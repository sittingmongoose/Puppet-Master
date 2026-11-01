"""Static retirement and shared routing regressions; no provider or CLI executes."""

from __future__ import annotations

import copy
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]


def load(name: str) -> dict:
    return json.loads((ROOT / "Plans" / name).read_text(encoding="utf-8"))


def definition_validator(schema: dict, definition: str) -> Draft202012Validator:
    return Draft202012Validator(
        {
            "$schema": schema["$schema"],
            "$defs": schema["$defs"],
            "$ref": f"#/$defs/{definition}",
        }
    )


class RetiredProviderAndSharedRouteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.retained_schema = load("egolite_retained_requirement_contracts.schema.json")
        retained = load("egolite_retained_requirement_contract_fixtures.json")
        cls.aggregate = next(
            case["instance"]
            for case in retained["valid"]
            if case["name"] == "aggregate_all_13"
        )
        cls.retained_validator = Draft202012Validator(cls.retained_schema)
        forge = load("forge_integration_contracts.schema.json")
        forge_fixtures = load("forge_integration_contract_fixtures.json")
        matrix = next(
            case["value"]
            for case in forge_fixtures["valid"]
            if case.get("definition") == "provider_capability_matrix"
        )
        cls.generic = next(
            profile for profile in matrix["profiles"]
            if profile["profile_id"] == "generic_git"
        )
        cls.generic_validator = definition_validator(forge, "provider_matrix_profile")
        routing_schema = load("source_control_contracts.schema.json")
        routing_fixtures = load("source_control_contract_fixtures.json")
        cls.route = next(
            case["value"]
            for case in routing_fixtures["valid"]
            if case["name"] == "truenas_home_wsl_checkout_and_remote_forge_route_by_owner"
        )
        cls.route_validator = definition_validator(
            routing_schema, "source_operation_routing_and_agent_boundary"
        )
        presentation = load("final_gui_interaction_contract_fixtures.json")
        cls.presentation = next(
            contract
            for contract in presentation["positive_instance"]["contracts"]
            if contract["contract_kind"] == "source_control_forge_depth_presentation"
        )
        cls.presentation_validator = definition_validator(
            load("final_gui_interaction_contracts.schema.json"),
            "source_control_forge_depth_presentation",
        )

    def test_current_retained_bundle_validates_without_retired_requirements(self) -> None:
        Draft202012Validator.check_schema(self.retained_schema)
        self.assertTrue(self.retained_validator.is_valid(self.aggregate))
        self.assertEqual(len(self.aggregate["contracts"]), 13)
        self.assertNotIn("ori_002", self.retained_schema["$defs"])
        self.assertNotIn("ori_020", self.retained_schema["$defs"])

    def test_retired_requirement_cannot_reenter_current_bundle(self) -> None:
        for requirement in ("ORI-002", "ORI-020"):
            with self.subTest(requirement=requirement):
                candidate = copy.deepcopy(self.aggregate)
                candidate["contracts"][0]["requirement_id"] = requirement
                self.assertFalse(self.retained_validator.is_valid(candidate))

    def test_generic_git_remains_transport_only(self) -> None:
        self.assertTrue(self.generic_validator.is_valid(self.generic))
        for field, value in (
            ("review_vocabulary", "Pull request"),
            ("automation_service", "invented_hosted_ci"),
        ):
            with self.subTest(field=field):
                candidate = copy.deepcopy(self.generic)
                candidate[field] = value
                self.assertFalse(self.generic_validator.is_valid(candidate))

    def test_retired_provider_profiles_cannot_alias_generic_git(self) -> None:
        for profile in ("cursor_origin_native", "cursor_origin_github_mirror"):
            with self.subTest(profile=profile):
                candidate = copy.deepcopy(self.generic)
                candidate["profile_id"] = profile
                self.assertFalse(self.generic_validator.is_valid(candidate))

    def test_admitted_api_and_cli_route_retains_host_and_target_boundaries(self) -> None:
        self.assertTrue(self.route_validator.is_valid(self.route))
        for section, field in (
            ("local_filesystem_route", "source_location_execution_environment_ref"),
            ("local_filesystem_route", "selected_installation_ref"),
            ("hosting_api_route", "egress_host_ref"),
            ("hosting_api_route", "credential_ref"),
            ("cli_hosting_route", "installation_profile_ref"),
            ("cli_hosting_route", "explicit_repository_target"),
        ):
            with self.subTest(section=section, field=field):
                candidate = copy.deepcopy(self.route)
                candidate[section].pop(field)
                self.assertFalse(self.route_validator.is_valid(candidate))

    def test_shared_route_cannot_borrow_checkout_credentials_or_branch_defaults(self) -> None:
        for section, field in (
            ("hosting_api_route", "assumes_checkout_present"),
            ("hosting_api_route", "git_credential_interchangeable"),
            ("cli_hosting_route", "current_working_branch_default_used"),
            ("agent_summary", "alternate_account_fallback"),
            ("automated_mutation", "protected_branch_bypass"),
            ("automated_mutation", "runner_is_execution_host_without_configuration"),
        ):
            with self.subTest(section=section, field=field):
                candidate = copy.deepcopy(self.route)
                candidate[section][field] = True
                self.assertFalse(self.route_validator.is_valid(candidate))
        candidate = copy.deepcopy(self.route)
        candidate["worker_becomes_project_authority"] = True
        self.assertFalse(self.route_validator.is_valid(candidate))

    def test_mirror_presentation_accepts_admitted_truth_and_refuses_retired_field(self) -> None:
        self.assertTrue(self.presentation_validator.is_valid(self.presentation))
        candidate = copy.deepcopy(self.presentation)
        candidate["review_and_publication"]["publish_preview_fields"][2] = (
            "origin_mirror_write_through"
        )
        self.assertFalse(self.presentation_validator.is_valid(candidate))

    def test_provider_capability_cannot_be_replaced_by_blanket_service_badge(self) -> None:
        for retired_field in (False, True):
            with self.subTest(retired_value=retired_field):
                candidate = copy.deepcopy(self.presentation)
                review = candidate["review_and_publication"]
                review.pop("blanket_provider_read_only_badge")
                review["blanket_origin_read_only_badge"] = retired_field
                self.assertFalse(self.presentation_validator.is_valid(candidate))
        candidate = copy.deepcopy(self.presentation)
        candidate["review_and_publication"]["blanket_provider_read_only_badge"] = True
        self.assertFalse(self.presentation_validator.is_valid(candidate))

    def test_publication_and_currentness_guards_survive_retirement(self) -> None:
        for field in ("expected_head_guard", "publish_and_review_separate_by_default"):
            with self.subTest(field=field):
                candidate = copy.deepcopy(self.presentation)
                candidate["review_and_publication"][field] = False
                self.assertFalse(self.presentation_validator.is_valid(candidate))
        candidate = copy.deepcopy(self.presentation)
        candidate["review_and_publication"]["fields"][8] = "invented_currentness"
        self.assertFalse(self.presentation_validator.is_valid(candidate))


if __name__ == "__main__":
    unittest.main()
