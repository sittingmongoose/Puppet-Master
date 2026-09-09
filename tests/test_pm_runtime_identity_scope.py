import json
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


class RuntimeIdentityScopeTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.schema = load_json(PLANS / "full_thread_runtime_contracts.schema.json")
        cls.fixtures = load_json(PLANS / "full_thread_runtime_contract_fixtures.json")
        cls.cases = cls.fixtures["identity_scope_cases"]
        identity_schema = {
            "$schema": cls.schema["$schema"],
            "$defs": cls.schema["$defs"],
            "$ref": "#/$defs/IdentityEnvelope",
        }
        cls.identity_validator = Draft202012Validator(identity_schema)
        cls.root_validator = Draft202012Validator(cls.schema)

    def binding_failure(self, identity: dict) -> str | None:
        scope = identity.get("scope_kind")
        if scope is None:
            return "scope_kind_required"
        if scope not in {"application", "project"}:
            return "unknown_scope_kind"

        if scope == "application":
            if identity.get("project_id") is not None or identity.get("project_home_server_id") is not None:
                return "application_scope_project_forbidden"
            if identity.get("named_plan_id") is not None:
                return "application_scope_named_plan_forbidden"
        elif not identity.get("project_home_server_id"):
            return "project_home_server_required"

        bindings = self.cases["known_bindings"]
        environment_id = identity.get("execution_environment_id")
        expected_host = bindings["execution_host_by_environment"].get(environment_id)
        if expected_host is None:
            return "execution_environment_unbound"
        if identity.get("execution_host_id") != expected_host:
            return "execution_host_environment_mismatch"
        if identity.get("server_id") != bindings["controlling_server_by_environment"].get(environment_id):
            return "controlling_server_environment_mismatch"
        if identity.get("topology_generation") != bindings["topology_generation_by_environment"].get(environment_id):
            return "topology_generation_mismatch"

        if scope == "project":
            project_id = identity.get("project_id")
            if identity.get("project_home_server_id") != bindings["project_home_server_by_project"].get(project_id):
                return "project_home_server_mismatch"
            named_plan_id = identity.get("named_plan_id")
            if named_plan_id is not None:
                named_plan_project = bindings["named_plan_project_by_id"].get(named_plan_id)
                if named_plan_project is None:
                    return "named_plan_unbound"
                if named_plan_project != project_id:
                    return "named_plan_project_mismatch"
        return None

    def test_identity_envelope_is_explicit_and_owner_named(self) -> None:
        Draft202012Validator.check_schema(self.schema)
        identity = self.schema["$defs"]["IdentityEnvelope"]
        required = set(identity["required"])
        self.assertTrue(
            {
                "scope_kind",
                "server_id",
                "project_id",
                "project_home_server_id",
                "named_plan_id",
                "execution_host_id",
                "execution_environment_id",
                "topology_generation",
            }.issubset(required)
        )
        self.assertEqual(identity["properties"]["scope_kind"]["enum"], ["application", "project"])
        self.assertIn("named_plan_id", identity["properties"])
        self.assertNotIn("plan_id", identity["properties"])

        policy = self.schema["x-identity-scope-policy"]
        self.assertEqual(policy["legacy_import_boundary"], "owner_import_once")
        self.assertEqual(policy["ambiguity_or_cross_scope_policy"], "fail_closed")
        self.assertFalse(policy["runtime_proof_claimed"])

    def test_positive_scope_and_binding_fixtures_validate(self) -> None:
        positives = self.cases["positive"]
        self.assertEqual(
            {case["name"] for case in positives},
            {
                "application_scope_has_no_project_or_named_plan",
                "project_scope_without_named_plan",
                "project_scope_with_same_project_named_plan",
            },
        )
        for case in positives:
            with self.subTest(case=case["name"]):
                identity = case["identity"]
                self.assertEqual(list(self.identity_validator.iter_errors(identity)), [])
                self.assertIsNone(self.binding_failure(identity))

    def test_ambiguous_and_cross_scope_fixtures_fail_closed(self) -> None:
        negatives = self.cases["negative"]
        self.assertEqual(len(negatives), len({case["name"] for case in negatives}))
        for case in negatives:
            with self.subTest(case=case["name"]):
                identity = case["identity"]
                structural_errors = list(self.identity_validator.iter_errors(identity))
                actual_failure = self.binding_failure(identity)
                self.assertEqual(actual_failure, case["expected_failure"])
                if case["expected_failure"] in {
                    "scope_kind_required",
                    "unknown_scope_kind",
                    "application_scope_project_forbidden",
                    "application_scope_named_plan_forbidden",
                    "project_home_server_required",
                }:
                    self.assertTrue(structural_errors)
                else:
                    self.assertEqual(structural_errors, [])

    def test_full_record_fixtures_use_the_repaired_identity(self) -> None:
        for case in self.fixtures["positive"]:
            with self.subTest(case=case["name"]):
                self.assertEqual(list(self.root_validator.iter_errors(case["instance"])), [])

        identity_records = [
            case["instance"]["identity"]
            for case in self.fixtures["positive"]
            if "identity" in case["instance"]
        ]
        self.assertTrue(identity_records)
        for identity in identity_records:
            self.assertIn(identity["scope_kind"], {"application", "project"})
            self.assertNotIn("plan_id", identity)
            self.assertIsNone(self.binding_failure(identity))

    def test_owner_prose_keeps_named_plan_and_runtime_boundaries(self) -> None:
        named_plan_owner = (PLANS / "Named_Plan_System.md").read_text(encoding="utf-8")
        runtime_owner = (PLANS / "Shared_Integration_Runtime.md").read_text(encoding="utf-8")
        self.assertIn("sole canonical owner of the user-facing `NamedPlan`", named_plan_owner)
        self.assertIn("canonical immutable identity field is `named_plan_id`", named_plan_owner)
        self.assertIn("Application scope requires `project_id`, `project_home_server_id`, and `named_plan_id` to be present as null", runtime_owner)
        self.assertIn("other owner-specific Plan identities retain their owner-defined fields and are not broadly renamed", runtime_owner)
        self.assertIn("runtime owner lookup, adapter behavior, and migration execution remain unproved", runtime_owner)


if __name__ == "__main__":
    unittest.main()
