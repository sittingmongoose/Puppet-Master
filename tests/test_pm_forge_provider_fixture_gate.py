"""Static provider-fixture enrollment; no provider, auth, or native execution."""

from __future__ import annotations

from collections import Counter
from contextlib import redirect_stdout
import copy
import importlib.util
import io
import json
from pathlib import Path
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "forge_provider_gate", ROOT / "scripts/pm-new-contracts-verify.py"
)
assert SPEC is not None and SPEC.loader is not None
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)

FORGE_SCHEMA = "Plans/forge_integration_contracts.schema.json"
PROVIDER_PACKS = {
    "Plans/cursor_origin_integration_fixtures.json": (4, 4),
    "Plans/gitlab_integration_fixtures.json": (3, 1),
    "Plans/azure_devops_integration_fixtures.json": (2, 1),
    "Plans/bitbucket_integration_fixtures.json": (2, 1),
}


def run_isolated_gate(pairs, *, expected_count=None, inputs=None):
    """Run the real main loop; omit only unrelated storage/expansion checks.

    Synthetic-input tests exercise bookkeeping with a small schema. The real
    provider-pack test uses unchanged on-disk inputs and real schema validators.
    """
    original_load = GATE.load_json

    def load(path):
        relative = path.relative_to(ROOT).as_posix()
        if inputs is not None and relative in inputs:
            value = inputs[relative]
            if isinstance(value, Exception):
                raise value
            return copy.deepcopy(value)
        return original_load(path)

    stream = io.StringIO()
    with (
        mock.patch.object(GATE, "CONTRACT_PAIRS", tuple(pairs)),
        mock.patch.object(GATE, "EXPECTED_CONTRACT_PAIR_COUNT", len(pairs) if expected_count is None else expected_count),
        mock.patch.object(GATE, "load_json", side_effect=load),
        mock.patch.object(GATE, "validate_onboarding_storage_contract", return_value=([], Counter())),
        mock.patch.object(GATE, "validate_expansion_fixture_pack", return_value=([], Counter())),
        redirect_stdout(stream),
    ):
        exit_code = GATE.main()
    return exit_code, json.loads(stream.getvalue())


def synthetic_inputs():
    schema_path = "Plans/synthetic_provider.schema.json"
    fixture_paths = ("Plans/synthetic_first_fixtures.json", "Plans/synthetic_second_fixtures.json")
    schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "https://puppetmaster.local/schemas/synthetic-provider/1.0.0",
        "$defs": {
            "binding": {
                "type": "object",
                "required": ["schema_id", "binding_id"],
                "properties": {
                    "schema_id": {"const": "pm.synthetic.binding.v1"},
                    "binding_id": {"type": "string", "minLength": 1},
                },
                "additionalProperties": False,
            }
        },
        "$ref": "#/$defs/binding",
    }
    inputs = {schema_path: schema}
    for index, fixture_path in enumerate(fixture_paths):
        inputs[fixture_path] = {
            "schema_id": f"pm.synthetic.fixture_{index}.v1",
            "owner_schema": schema_path,
            "valid": [{"name": f"binding_{index}", "definition": "binding",
                       "value": {"schema_id": "pm.synthetic.binding.v1", "binding_id": f"binding:{index}"}}],
            "invalid": [],
        }
    return [(schema_path, path) for path in fixture_paths], inputs


class ForgeProviderFixtureGateTests(unittest.TestCase):
    def assert_failed_with(self, pairs, inputs, code, **kwargs):
        exit_code, report = run_isolated_gate(pairs, inputs=inputs, **kwargs)
        self.assertEqual(exit_code, 1)
        self.assertEqual(report["status"], "fail")
        self.assertIn(code, {finding["code"] for finding in report["findings"]})
        return report

    def test_closed_manifest_enrolls_all_four_provider_packs_once(self):
        for fixture in PROVIDER_PACKS:
            with self.subTest(fixture=fixture):
                self.assertEqual(GATE.CONTRACT_PAIRS.count((FORGE_SCHEMA, fixture)), 1)
        self.assertEqual(len(GATE.CONTRACT_PAIRS), 30)
        self.assertEqual(len(set(GATE.CONTRACT_PAIRS)), 30)
        self.assertEqual(GATE.EXPECTED_CONTRACT_PAIR_COUNT, 30)
        self.assertEqual(len({schema for schema, _ in GATE.CONTRACT_PAIRS}), 26)
        self.assertEqual(
            {fixture for schema, fixture in GATE.CONTRACT_PAIRS if schema == FORGE_SCHEMA},
            set(PROVIDER_PACKS) | {"Plans/forge_integration_contract_fixtures.json"},
        )

    def test_existing_provider_cases_run_through_shared_main_loop(self):
        pairs = [(FORGE_SCHEMA, fixture) for fixture in PROVIDER_PACKS]
        for fixture, (positive_count, negative_count) in PROVIDER_PACKS.items():
            with self.subTest(fixture=fixture):
                pack = GATE.load_json(ROOT / fixture)
                self.assertEqual(pack["owner_schema"], FORGE_SCHEMA)
                self.assertEqual(len(pack["valid"]), positive_count)
                self.assertEqual(len(pack["invalid"]), negative_count)
        exit_code, report = run_isolated_gate(pairs)
        self.assertEqual(exit_code, 0, report["findings"])
        self.assertEqual(report["findings"], [])
        self.assertEqual(report["claim_boundary"], "static_schema_and_fixture_consistency_only")
        for count, expected in {"contract_pairs": 4, "positive_cases": 11, "positive_cases_valid": 11,
                                "negative_cases": 7, "negative_cases_rejected": 7}.items():
            self.assertEqual(report["counts"][count], expected, count)
        self.assertEqual(report["inputs"], [{"schema": schema, "fixtures": fixture} for schema, fixture in pairs])

    def test_multiple_packs_do_not_duplicate_one_schema_source(self):
        pairs, inputs = synthetic_inputs()
        exit_code, report = run_isolated_gate(pairs, inputs=inputs)
        self.assertEqual(exit_code, 0, report["findings"])
        self.assertEqual(report["counts"]["positive_cases_valid"], 2)

    def test_distinct_schema_sources_cannot_share_full_schema_id(self):
        pairs, inputs = synthetic_inputs()
        alias = "Plans/synthetic_collision.schema.json"
        inputs[alias] = copy.deepcopy(inputs[pairs[0][0]])
        inputs[pairs[1][1]]["owner_schema"] = alias
        pairs[1] = (alias, pairs[1][1])
        report = self.assert_failed_with(pairs, inputs, "duplicate_full_schema_id")
        finding = next(row for row in report["findings"] if row["code"] == "duplicate_full_schema_id")
        self.assertEqual(set(finding["schemas"]), {pairs[0][0], alias})

    def test_repeated_pair_is_still_a_manifest_error(self):
        pairs, inputs = synthetic_inputs()
        self.assert_failed_with([pairs[0], pairs[0]], inputs, "authored_manifest_cardinality_or_uniqueness_failure")

    def test_missing_pair_is_still_a_manifest_error(self):
        pairs, inputs = synthetic_inputs()
        self.assert_failed_with(pairs[:1], inputs, "authored_manifest_cardinality_or_uniqueness_failure", expected_count=2)

    def test_missing_fixture_fails_instead_of_silently_skipping(self):
        pairs, inputs = synthetic_inputs()
        inputs[pairs[1][1]] = FileNotFoundError(2, "synthetic missing fixture", str(ROOT / pairs[1][1]))
        self.assert_failed_with(pairs, inputs, "contract_input_unreadable")

    def test_stale_fixture_owner_remains_rejected(self):
        pairs, inputs = synthetic_inputs()
        inputs[pairs[1][1]]["owner_schema"] = "Plans/wrong_owner.schema.json"
        self.assert_failed_with(pairs, inputs, "stale_owner_schema_path")

    def test_duplicate_runtime_ids_across_packs_remain_rejected(self):
        pairs, inputs = synthetic_inputs()
        inputs[pairs[1][1]]["valid"][0]["value"]["binding_id"] = "binding:0"
        report = self.assert_failed_with(pairs, inputs, "duplicate_runtime_record_id")
        finding = next(row for row in report["findings"] if row["code"] == "duplicate_runtime_record_id")
        self.assertEqual(finding["locations"], [f"{fixture}:binding_{index}" for index, (_, fixture) in enumerate(pairs)])


if __name__ == "__main__":
    unittest.main()
