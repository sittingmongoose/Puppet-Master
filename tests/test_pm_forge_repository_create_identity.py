"""Uncreated Forge identity contracts, not remote execution or ref authenticity."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = "Plans/forge_integration_contracts.schema.json"
FIXTURES = "Plans/forge_integration_contract_fixtures.json"
CREATE = "cmd.forge.repository.create"
OUTCOMES = ("accepted", "blocked", "failed", "cancelled", "recovery_required", "effect_unknown")


def uncreated_cases(fixtures):
    values = {x["name"]: x["value"] for x in fixtures["valid"]}
    def original(name):
        return copy.deepcopy(values[name])
    cases = []
    def add(name, definition, value):
        cases.append(dict(name="uncreated_repository_" + name, definition=definition, value=value))
    request = original("command_request_forge_repository_create")
    request.update(repo_id=None, repository_binding_ref=None, expected_binding_generation=0,
                   command_instance_id="command:forge:uncreated:request",
                   idempotency_key="idempotency:forge:uncreated:request")
    request["currentness"]["binding_generation"] = 0
    add("request", "command_request", request)
    for outcome in OUTCOMES:
        result = original("command_result_succeeded")
        result.update(command_id=CREATE, command_instance_id="command:create:" + outcome,
                      operation_id="operation:create:" + outcome, repository_binding_ref=None,
                      expected_binding_generation=0, outcome=outcome,
                      target_ref="repository-intent:create:example", terminal_provider_result_ref=None,
                      receipt_ref="receipt:create:" + outcome, event_refs=[], recovery_action_ids=[],
                      observable_work_id="work:create:" + outcome, error=None)
        if outcome != "accepted":
            result["error"] = dict(code="permission_denied", message="Creation did not complete.",
                                   retry_disposition="after_user_action", effect_state="known_not_applied",
                                   provider_error_ref=None, recovery_action_ids=[])
        if outcome == "effect_unknown":
            result["error"].update(code="effect_unknown_reconciliation_required",
                                    message="Creation outcome is unknown; reconcile first.",
                                    retry_disposition="after_reconciliation", effect_state="unknown")
        add("result_" + outcome, "command_result", result)
        receipt = original("async_forge_command_receipt_points_to_observable_work")
        receipt.update(command_id=CREATE, receipt_id="receipt:create:" + outcome,
                       command_instance_id=result["command_instance_id"], operation_id=result["operation_id"],
                       repository_binding_ref=None, expected_binding_generation=0,
                       review_revision_ref=None, outcome=outcome, event_refs=[], recovery_actions=[],
                       observable_work_id=result["observable_work_id"])
        add("receipt_" + outcome, "command_receipt", receipt)
    error = original("command_error_effect_unknown")
    error.update(command_id=CREATE, repository_binding_ref=None,
                 command_instance_id="command:forge:uncreated:error")
    add("error", "command_error_record", error)
    availability = original("command_availability_blocked")
    availability.update(command_id=CREATE, repository_binding_ref=None,
                        expected_binding_generation=0, requested_capability="repository")
    availability["currentness"]["binding_generation"] = 0
    add("availability", "command_availability", availability)
    return cases


def negative_cases(cases):
    negatives = []
    def add(base, suffix, patch):
        negatives.append(dict(name=base["name"] + "_rejects_" + suffix, definition=base["definition"],
                              base_valid=base["name"], patch=patch,
                              expected_error="Uncreated identity must retain exact create lifecycle and owner gates."))
    request = cases[0]
    for suffix, field, value in (
        ("expected_generation", "expected_binding_generation", 1),
        ("observed_generation", "currentness.binding_generation", 1),
        ("provider_identity", "target.provider_repository_id", "invented:repo"),
        ("identity_source", "target.identity_source", "validated_repository_binding"),
        ("null_account", "account_id", None),
        ("null_locator", "target.repository_locator_ref", None),
        ("denied_permission", "permission.decision", "deny"),
        ("stale_currentness", "currentness.state", "stale"),
        ("mixed_repo", "repo_id", "repo:existing"),
        ("mixed_binding", "repository_binding_ref", "binding:existing"),
        ("unknown_field", "unexpected_identity_override", True),
    ):
        add(request, suffix, {field: value})
    for case in cases[1:]:
        add(case, "other_command", {"command_id": "cmd.forge.review.merge"})
        if "expected_binding_generation" in case["value"]:
            add(case, "expected_generation", {"expected_binding_generation": 1})
        if case["definition"] == "command_availability":
            add(case, "observed_generation", {"currentness.binding_generation": 1})
        if case["value"].get("outcome") == "accepted":
            add(case, "missing_work", {"observable_work_id": None})
        if case["name"].endswith("result_accepted"):
            for outcome in ("succeeded", "degraded"):
                # A bound control with exactly these other fields must validate.
                add(case, "unbound_" + outcome, {"outcome": outcome,
                    "terminal_provider_result_ref": "provider-result:create:done", "receipt_ref": "receipt:create:done"})
        if case["name"].endswith("receipt_accepted"):
            for outcome in ("succeeded", "degraded"):
                add(case, "unbound_" + outcome, {"outcome": outcome})
        if case["name"].endswith("result_effect_unknown"):
            add(case, "blind_retry", {"error.retry_disposition": "after_user_action"})
            add(case, "terminal_result", {"terminal_provider_result_ref": "provider-result:claimed"})
    return negatives


class ForgeRepositoryCreateIdentityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location("forge_create_gate", ROOT / "scripts/pm-new-contracts-verify.py")
        cls.gate = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.gate)
        cls.schema = json.loads((ROOT / SCHEMA).read_text())
        cls.fixtures = json.loads((ROOT / FIXTURES).read_text())
        cls.registry = cls.gate.offline_schema_registry()
        cls.cases = uncreated_cases(cls.fixtures)

    def errors(self, definition, value):
        validator = self.gate.validator_for(self.schema, {"$ref": "#/$defs/" + definition}, self.registry)
        return list(validator.iter_errors(value))

    def test_uncreated_family_cases_are_valid_and_enrolled(self):
        authored = {c["name"]: c for c in self.fixtures["valid"]}
        for case in self.cases:
            with self.subTest(case=case["name"]):
                self.assertEqual([], self.errors(case["definition"], case["value"]))
                self.assertEqual([], self.gate.contract_semantic_failures(SCHEMA, case["definition"], case["value"]))
                self.assertEqual(case, authored.get(case["name"]))

    def test_new_causal_negatives_are_enrolled_and_rejected(self):
        values = {c["name"]: c["value"] for c in self.cases}
        authored = {c["name"]: c for c in self.fixtures["invalid"]}
        for case in negative_cases(self.cases):
            with self.subTest(case=case["name"]):
                self.assertEqual([], self.errors(case["definition"], values[case["base_valid"]]))
                bad = self.gate.materialize_invalid(case, values)
                self.assertTrue(self.errors(case["definition"], bad))
                self.assertEqual(case, authored.get(case["name"]))

    def test_success_and_degraded_exclusion_is_causally_the_absent_binding(self):
        for definition in ("command_result", "command_receipt"):
            base = next(c["value"] for c in self.cases if c["definition"] == definition and c["value"]["outcome"] == "accepted")
            for outcome in ("succeeded", "degraded"):
                value = copy.deepcopy(base)
                value["outcome"] = outcome
                if definition == "command_result":
                    value.update(terminal_provider_result_ref="provider-result:create:done", receipt_ref="receipt:create:done")
                with self.subTest(definition=definition, outcome=outcome):
                    self.assertTrue(self.errors(definition, value))
                    value["repository_binding_ref"] = "binding:create:actual"
                    self.assertEqual([], self.errors(definition, value))

    def test_every_other_request_retains_its_nonnull_rule(self):
        count = 0
        for case in self.fixtures["valid"]:
            value = case["value"]
            if case["definition"] != "command_request" or value["command_id"] == CREATE or "repository_list_scope" in value:
                continue
            count += 1
            with self.subTest(case=case["name"]):
                self.assertEqual([], self.errors("command_request", value))
                bad = copy.deepcopy(value)
                bad.update(repo_id=None, repository_binding_ref=None, expected_binding_generation=0)
                bad["currentness"]["binding_generation"] = 0
                self.assertTrue(self.errors("command_request", bad))
        self.assertGreaterEqual(count, 46)

    def test_precommit_list_scope_is_not_a_create_authorization(self):
        for case in self.fixtures["valid"]:
            if "repository_list_scope" not in case["value"]:
                continue
            with self.subTest(case=case["name"]):
                self.assertEqual([], self.errors(case["definition"], case["value"]))
                bad = copy.deepcopy(case["value"])
                bad["command_id"] = CREATE
                self.assertTrue(self.errors(case["definition"], bad))

    def test_all_authored_forge_fixtures_keep_their_outcomes(self):
        positives = {c["name"]: c["value"] for c in self.fixtures["valid"]}
        for case in self.fixtures["valid"]:
            with self.subTest(positive=case["name"]):
                self.assertEqual([], self.errors(case["definition"], case["value"]))
        for case in self.fixtures["invalid"]:
            with self.subTest(negative=case["name"]):
                value = self.gate.materialize_invalid(case, positives)
                definition, selected = self.gate.select_definition(self.schema, case, value, require_valid=False)
                structural = self.errors(definition, value)
                if case.get("semantic_rule"):
                    self.assertEqual([], structural)
                    self.assertIn(case["semantic_rule"], self.gate.contract_semantic_failures(SCHEMA, definition, value))
                else:
                    self.assertTrue(structural)

    def test_positive_runtime_identities_are_unique_within_each_family(self):
        locations = {}
        for case in self.fixtures["valid"]:
            definition = case["definition"]
            identity = self.gate.primary_identity(
                definition, self.schema["$defs"][definition], case["value"])
            if identity is not None:
                field, value = identity
                locations.setdefault((SCHEMA, definition, field + "=" + value), []).append(case["name"])
        self.assertEqual([], self.gate.duplicate_runtime_id_findings(locations))


if __name__ == "__main__":
    unittest.main()
