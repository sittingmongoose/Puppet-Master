"""Focused static Origin-route regressions; these do not execute the Origin CLI."""

from __future__ import annotations

import copy
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "Plans/egolite_retained_requirement_contracts.schema.json"
FIXTURES_PATH = ROOT / "Plans/egolite_retained_requirement_contract_fixtures.json"


class OriginRetainedRouteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
        fixtures = json.loads(FIXTURES_PATH.read_text(encoding="utf-8"))
        aggregate = next(case for case in fixtures["valid"] if case["name"] == "aggregate_all_15")
        cls.origin = next(
            contract
            for contract in aggregate["instance"]["contracts"]
            if contract["requirement_id"] == "ORI-020"
        )
        cls.validator = Draft202012Validator(
            {
                "$schema": cls.schema["$schema"],
                "$defs": cls.schema["$defs"],
                "$ref": "#/$defs/ori_020",
            }
        )

    def errors(self, instance: dict) -> list:
        return list(self.validator.iter_errors(instance))

    def assert_valid(self, instance: dict) -> None:
        self.assertFalse(self.errors(instance))

    def assert_rejected(self, instance: dict) -> None:
        self.assertTrue(self.errors(instance))

    def test_schema_and_current_origin_fixture_validate(self) -> None:
        Draft202012Validator.check_schema(self.schema)
        self.assert_valid(self.origin)
        self.assertEqual(self.origin["data_operations"], ["content", "compare", "push"])
        self.assertEqual(self.origin["hosting_action_operations"], ["thread", "reviewer"])

    def test_data_operations_retain_git_fallbacks(self) -> None:
        for operation in ("content", "compare", "push"):
            with self.subTest(operation=operation):
                candidate = copy.deepcopy(self.origin)
                candidate["fallback_cases"][operation]["route"] = "git_transport"
                self.assert_valid(candidate)

    def test_hosting_actions_reject_ordinary_git_routes(self) -> None:
        for operation in ("thread", "reviewer"):
            for route in ("git_data", "git_transport"):
                with self.subTest(operation=operation, route=route):
                    candidate = copy.deepcopy(self.origin)
                    candidate["fallback_cases"][operation]["route"] = route
                    self.assert_rejected(candidate)

    def test_supported_hosting_actions_require_typed_origin_route(self) -> None:
        for operation in ("thread", "reviewer"):
            with self.subTest(operation=operation):
                candidate = copy.deepcopy(self.origin)
                candidate["fallback_cases"][operation]["route"] = "none"
                candidate["fallback_cases"][operation]["outcome"] = "unavailable"
                self.assert_rejected(candidate)

    def test_unsupported_hosting_actions_remain_truthfully_unavailable(self) -> None:
        support_fields = {
            "thread": "thread_resolution_support_proven",
            "reviewer": "reviewer_mutation_support_proven",
        }
        for operation, support_field in support_fields.items():
            with self.subTest(operation=operation):
                candidate = copy.deepcopy(self.origin)
                action = candidate["fallback_cases"][operation]
                action["operation_capability_supported"] = False
                action[support_field] = False
                action["route"] = "none"
                action["outcome"] = "unavailable"
                self.assert_valid(candidate)

    def test_origin_provider_and_cli_contract_are_fail_closed(self) -> None:
        mutations = (
            ("thread", "route_provider", "github"),
            ("reviewer", "ordinary_git_route_allowed", True),
        )
        for operation, field, value in mutations:
            with self.subTest(operation=operation, field=field):
                candidate = copy.deepcopy(self.origin)
                candidate["fallback_cases"][operation][field] = value
                self.assert_rejected(candidate)

        for field, value in (
            ("route_provider", "github"),
            ("structured_json_only", False),
            ("explicit_repository_head_base_target_required", False),
            ("current_working_branch_defaults_allowed", True),
            ("cursor_agent_auth_reuse_allowed", True),
        ):
            with self.subTest(cli_field=field):
                candidate = copy.deepcopy(self.origin)
                candidate["typed_cli_contract"][field] = value
                self.assert_rejected(candidate)


if __name__ == "__main__":
    unittest.main()
