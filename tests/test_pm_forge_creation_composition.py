"""Actual Forge creation contract fixtures; no native/authentication proof."""
from __future__ import annotations
import copy
import json
import importlib.util
import subprocess
import unittest
from pathlib import Path
import sys
from functools import lru_cache
from datetime import datetime
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_forge_creation_semantics import validate_repository_creation, forge_creation_semantic_failures
from pm_forge_creation_options import CreationOptionContext, validate_creation_options
from pm_ui_command_response import owner_result_digest


@lru_cache(maxsize=1)
def gate_module():
    spec = importlib.util.spec_from_file_location("forge_composition_fixture_gate", ROOT / "scripts/pm-new-contracts-verify.py")
    gate = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(gate)
    return gate


def build_schema():
    return json.loads((ROOT / "Plans/forge_integration_contracts.schema.json").read_text())


def schema_errors(definition, value, schema=None):
    schema = build_schema() if schema is None else schema
    validator = Draft202012Validator({"$schema": schema["$schema"], "$defs": schema["$defs"],
                                     "$ref": "#/$defs/" + definition},
                                    format_checker=Draft202012Validator.FORMAT_CHECKER)
    return [error.message for error in validator.iter_errors(value)]


def enrollment_cases():
    pack = json.loads((ROOT / "Plans/forge_integration_contract_fixtures.json").read_text())
    positives = [case for case in pack["valid"] if case["name"].startswith("creation_v2_actual_")]
    by_name = {case["name"]: case["value"] for case in pack["valid"]}
    negatives = [dict(case, value=gate_module().materialize_invalid(case, by_name))
                 for case in pack["invalid"] if case["name"].startswith("creation_v2_")]
    return positives, negatives


def composition_fixture():
    positives, _ = enrollment_cases()
    return copy.deepcopy(next(case["value"] for case in positives if case["name"] == "creation_v2_actual_composition"))


def semantic_negative_cases():
    _, negatives = enrollment_cases()
    return [dict(name=case["name"], value=case["value"], expected=case["semantic_rule"])
            for case in negatives if "semantic_rule" in case]


def canonical_semantic_failures(value):
    return forge_creation_semantic_failures("repository_creation_validation_input", value)


def semantic_failures(value):
    # Independently inject fixture dependencies into the real owner-facing
    # function, not merely test a wrapper that could omit request admission.
    def resolve(kind, ref):
        record, key = {"repository_creation_preview": (value["resolved_preview"], "preview_id"),
                       "creation_field_catalog": (value["resolved_catalog"], "catalog_id")}[kind]
        if record[key] != ref:
            raise KeyError(ref)
        return record

    def options(selections, *, resolve_record, context, digest_record):
        facts = copy.deepcopy(context)
        facts["now_utc"] = datetime.fromisoformat(facts["now_utc"].replace("Z", "+00:00"))
        for key in ("admitted_capability_refs", "admitted_permission_refs"):
            facts[key] = frozenset(facts[key])
        for key in ("allowed_effects", "admitted_resource_refs"):
            facts[key] = frozenset(tuple(pair) for pair in facts[key])
        return validate_creation_options(selections,
            resolve_catalog=lambda ref: resolve_record("creation_field_catalog", ref),
            context=CreationOptionContext(**facts), digest_record=digest_record)

    return validate_repository_creation(value["request"], resolve_record=resolve,
        context=value["execution_snapshot"], validate_record=schema_errors,
        digest_record=owner_result_digest, validate_options=options)


class CreationCompositionTests(unittest.TestCase):
    def test_provider_derived_path_is_real_and_requires_derivation(self):
        value = composition_fixture()
        request = value['request']
        intent = request['repository_creation_intent']
        intent['choices']['provider_slug_or_path'] = None
        intent['slug_derivation_ref'] = 'slug-derivation:fixture'
        value['resolved_preview']['intent_sha256'] = owner_result_digest(intent)
        value['execution_snapshot']['approved_intent_sha256'] = owner_result_digest(intent)
        value['execution_snapshot']['approved_choices_sha256'] = owner_result_digest(intent['choices'])
        request['creation_preview_sha256'] = owner_result_digest(value['resolved_preview'])
        self.assertEqual([], schema_errors('repository_creation_validation_input', value))
        self.assertEqual([], semantic_failures(value))
        self.assertEqual([], canonical_semantic_failures(value))
        intent['slug_derivation_ref'] = None
        self.assertIn('forge_creation_derived_path_missing_proof', semantic_failures(value))
        intent['resolved_slug_or_path'] = None
        value['resolved_preview']['resolved_slug_or_path'] = None
        value['execution_snapshot']['resolved_slug_or_path'] = None
        self.assertTrue(schema_errors('repository_creation_validation_input', value))

    def test_actual_runtime_records_and_composition_are_valid(self):
        value = composition_fixture()
        for definition, record in (("repository_create_command_request_v2", value["request"]),
                                   ("repository_creation_preview", value["resolved_preview"]),
                                   ("creation_field_catalog", value["resolved_catalog"]),
                                   ("repository_creation_execution_snapshot", value["execution_snapshot"]),
                                   ("repository_creation_validation_input", value)):
            with self.subTest(definition=definition):
                self.assertEqual([], schema_errors(definition, record))
        self.assertEqual([], semantic_failures(value))
        self.assertEqual([], canonical_semantic_failures(value))

    def test_all_semantic_mutations_remain_schema_valid_and_fail_causally(self):
        self.assertEqual([], semantic_failures(composition_fixture()))
        for case in semantic_negative_cases():
            with self.subTest(name=case["name"]):
                self.assertEqual([], schema_errors("repository_creation_validation_input", case["value"]))
                self.assertIn(case["expected"], semantic_failures(case["value"]))
                self.assertIn(case["expected"], canonical_semantic_failures(case["value"]))

    def test_enrollment_uses_actual_gate_selection_semantics_and_identity(self):
        spec = importlib.util.spec_from_file_location("forge_composition_gate", ROOT / "scripts/pm-new-contracts-verify.py")
        gate = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(gate)
        schema = build_schema()
        positives, negatives = enrollment_cases()
        self.assertEqual((6, 83), (len(positives), len(negatives)))
        names = [c["name"] for c in positives + negatives]
        self.assertEqual(len(names), len(set(names)))
        identities = {}
        proposed = {case["name"]: case for case in positives}
        for schema_rel, fixture_rel in gate.CONTRACT_PAIRS:
            if schema_rel != "Plans/forge_integration_contracts.schema.json":
                continue
            pack = json.loads((ROOT / fixture_rel).read_text())
            for case in gate.legacy_positive_cases(pack):
                if case.get("name") in proposed:
                    self.assertEqual(proposed[case["name"]], case)
                    continue  # Already enrolled identical case is checked once below.
                value = case.get("value", case.get("record", case.get("instance")))
                name, _ = gate.select_definition(schema, case, value, require_valid=True)
                identity = gate.primary_identity(name, schema["$defs"][name], value)
                if identity:
                    identities[(name, identity)] = fixture_rel + ":" + str(case.get("name"))
        for case in positives:
            value = case["value"]
            name, _ = gate.select_definition(schema, case, value, require_valid=True)
            self.assertEqual([], schema_errors(name, value, schema))
            self.assertEqual([], gate.contract_semantic_failures("Plans/forge_integration_contracts.schema.json", name, value))
            identity = gate.primary_identity(name, schema["$defs"][name], value)
            if identity:
                self.assertNotIn((name, identity), identities)
                identities[(name, identity)] = case["name"]
        for case in negatives:
            name, _ = gate.select_definition(schema, case, case["value"], require_valid=False)
            if "semantic_rule" in case:
                self.assertEqual([], schema_errors(name, case["value"], schema))
                self.assertIn(case["semantic_rule"], gate.contract_semantic_failures("Plans/forge_integration_contracts.schema.json", name, case["value"]))
            else:
                self.assertTrue(schema_errors(name, case["value"], schema))

    def test_v1_historical_reader_unchanged_and_active_admission_closed(self):
        schema = build_schema()
        original = json.loads(subprocess.check_output(["git", "show", "47d055c035c14b2bd3442ea5f96515ef990c32dc:Plans/forge_integration_contracts.schema.json"], cwd=ROOT, text=True))
        self.assertEqual(original["$defs"]["command_request"], schema["$defs"]["command_request"])
        fixtures = json.loads((ROOT / "Plans/forge_integration_contract_fixtures.json").read_text())
        seen = 0
        for case in fixtures["valid"]:
            if case.get("definition") != "command_request":
                continue
            record = case["value"]
            self.assertEqual([], schema_errors("command_request", record, schema))
            errors = schema_errors("command_request_admission", record, schema)
            if record["command_id"] == "cmd.forge.repository.create":
                self.assertTrue(errors)
            else:
                seen += 1
                self.assertEqual([], errors)
        self.assertGreater(seen, 40)
        current = composition_fixture()["request"]
        self.assertEqual([], schema_errors("command_request_admission", current, schema))
        self.assertTrue(schema_errors("command_request", current, schema))
        bad = copy.deepcopy(current)
        del bad["repository_creation_intent"]
        self.assertTrue(schema_errors("command_request_admission", bad, schema))

    def test_active_consumers_storage_and_no_event_or_availability_upgrade(self):
        prefix = "Plans/forge_integration_contracts.schema.json#/$defs/"
        commands = (ROOT / "Plans/Commands_System.md").read_text()
        row = next(line for line in commands.splitlines() if line.startswith("| `cmd.forge.repository.create` |"))
        self.assertIn(prefix + "repository_create_command_request_v2", row)
        self.assertNotIn(prefix + "command_request`", row)
        wiring = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())
        entry = wiring["entries"]["catalog.forge_repository_create"]
        self.assertEqual(prefix + "repository_create_command_request_v2", entry["request_schema_ref"])
        self.assertEqual([], entry["expected_event_types"])
        self.assertTrue(any("handler_unavailable" in text for text in entry["acceptance_checks"]))
        touch = json.loads((ROOT / "Plans/touch_closure.json").read_text())
        profile = next(p for p in touch["profiles"] if p["profile_id"] == "TCP-FORGE")
        self.assertEqual(prefix + "command_request_admission", profile["payload_schema_ref"])
        storage = json.loads((ROOT / "Plans/storage_value_registry.json").read_text())
        previous = json.loads(subprocess.check_output(["git", "show", "47d055c035c14b2bd3442ea5f96515ef990c32dc:Plans/storage_value_registry.json"], cwd=ROOT, text=True))
        # Onboarding now consumes these Forge choices through its versioned
        # existing family. Account for that exact owner-defined transformation,
        # while still rejecting any new Forge family or unrelated family drift.
        from pm_onboarding_creation_schema import build_onboarding_v3_storage_bundle, materialized_v3_registry
        bundle = build_onboarding_v3_storage_bundle(*[
            json.loads((ROOT / "Plans" / name).read_text())
            for name in ("product_onboarding_contracts.schema.json", "project_system_contracts.schema.json",
                         "settings_system_contracts.schema.json", "forge_integration_contracts.schema.json")
        ])
        expected_families = materialized_v3_registry(previous, bundle)["families"]
        self.assertEqual(expected_families, storage["families"])
        self.assertEqual([r["family_id"] for r in previous["families"]],
                         [r["family_id"] for r in storage["families"]])
        self.assertEqual(previous["retention_policies"], storage["retention_policies"])
        key = "scd.forge.command_transport.v1"
        before = next(r for r in previous["contract_family_dispositions"] if r["disposition_id"] == key)
        after = next(r for r in storage["contract_family_dispositions"] if r["disposition_id"] == key)
        expected = {"pm.forge.repository_create_command_request.v2", "pm.forge.repository_creation_choices.v1",
                    "pm.forge.repository_creation_intent.v1", "pm.forge.repository_creation_preview.v1",
                    "pm.forge.creation_option_selections.v1", "pm.forge.creation_field_catalog.v1"}
        self.assertEqual(expected, set(after["record_kinds"]) - set(before["record_kinds"]))
        self.assertFalse(set(before["record_kinds"]) - set(after["record_kinds"]))
        self.assertEqual(len(after["record_kinds"]), len(set(after["record_kinds"])))
        for field in ("persistence_disposition", "physical_family_status", "existing_family_refs", "event_effect_policy", "runtime_evidence"):
            self.assertEqual(before[field], after[field])

    def test_no_option_request_or_preview_unknown_field_escape(self):
        value = composition_fixture()
        for definition, key in (("repository_create_command_request_v2", "request"), ("repository_creation_preview", "resolved_preview"),
                                ("creation_field_catalog", "resolved_catalog")):
            bad = copy.deepcopy(value[key])
            bad["caller_verified"] = True
            self.assertTrue(schema_errors(definition, bad))


if __name__ == "__main__":
    unittest.main(verbosity=2)
