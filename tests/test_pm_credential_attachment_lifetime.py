"""Focused static IRT-011 lifetime regressions; no credential runtime is executed."""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "Plans/egolite_retained_requirement_contracts.schema.json"
FIXTURES_PATH = ROOT / "Plans/egolite_retained_requirement_contract_fixtures.json"
GATE_PATH = ROOT / "scripts/pm-new-contracts-verify.py"


def load_gate_module():
    spec = importlib.util.spec_from_file_location("pm_new_contracts_verify", GATE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"unable to load {GATE_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def credential_records(value):
    if isinstance(value, dict):
        if value.get("requirement_id") == "IRT-011":
            yield value
        for nested in value.values():
            yield from credential_records(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from credential_records(nested)


class CredentialAttachmentLifetimeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.gate = load_gate_module()
        cls.schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
        cls.fixtures = json.loads(FIXTURES_PATH.read_text(encoding="utf-8"))
        cls.positives = {
            case["name"]: case["instance"]
            for case in cls.fixtures["valid"]
        }
        cls.aggregate = cls.positives["aggregate_all_15"]
        cls.credential = next(
            contract
            for contract in cls.aggregate["contracts"]
            if contract["requirement_id"] == "IRT-011"
        )
        cls.credential_validator = Draft202012Validator(
            {
                "$schema": cls.schema["$schema"],
                "$defs": cls.schema["$defs"],
                "$ref": "#/$defs/irt_011",
            }
        )

    def semantic_failures(self, value: dict, definition: str = "irt_011") -> list[str]:
        return self.gate.contract_semantic_failures(
            self.gate.EGOLITE_SCHEMA_REL,
            definition,
            value,
        )

    def test_current_fixture_has_positive_lifetime_and_keeps_static_boundary(self) -> None:
        Draft202012Validator.check_schema(self.schema)
        authored_credentials = list(credential_records(self.fixtures))
        self.assertEqual(len(authored_credentials), 3)
        for credential in authored_credentials:
            self.assertTrue(self.credential_validator.is_valid(credential))
            self.assertEqual(self.semantic_failures(credential), [])
        self.assertEqual(self.semantic_failures(self.aggregate, "<root>"), [])
        self.assertLess(
            self.gate.parse_aware_datetime(self.credential["issued_at"]),
            self.gate.parse_aware_datetime(self.credential["expires_at"]),
        )

        self.assertTrue(self.credential["credential_ref_is_broker_ref"])
        self.assertTrue(self.credential["broker_enforced"])
        for field in (
            "attachment_current",
            "profile_current",
            "revocation_current",
            "broker_lease_current",
        ):
            self.assertTrue(self.credential[field])
        for field in (
            "browser_execution_proven",
            "native_execution_proven",
            "runtime_execution_proven",
            "security_attack_proven",
            "benchmark_execution_proven",
        ):
            self.assertFalse(self.credential["proof_boundary"][field])
        self.assertFalse(self.credential["authentication_proven"])
        self.assertFalse(self.credential["readiness_proven"])

    def test_positive_lifetime_compares_normalized_offsets(self) -> None:
        candidate = copy.deepcopy(self.credential)
        candidate["issued_at"] = "2026-01-01T00:00:00-05:00"
        candidate["expires_at"] = "2026-01-01T05:00:01Z"
        self.assertEqual(self.semantic_failures(candidate), [])

    def test_zero_lifetime_across_offsets_is_rejected(self) -> None:
        candidate = copy.deepcopy(self.credential)
        candidate["issued_at"] = "2026-01-01T00:00:00-05:00"
        candidate["expires_at"] = "2026-01-01T05:00:00Z"
        self.assertEqual(
            self.semantic_failures(candidate),
            ["credential_attachment_lifetime_not_positive"],
        )

    def test_reversed_lifetime_across_offsets_is_rejected(self) -> None:
        candidate = copy.deepcopy(self.credential)
        candidate["issued_at"] = "2026-01-01T08:00:00+02:00"
        candidate["expires_at"] = "2026-01-01T05:59:59Z"
        self.assertEqual(
            self.semantic_failures(candidate),
            ["credential_attachment_lifetime_not_positive"],
        )

    def test_authored_lifetime_negatives_are_structural_positives(self) -> None:
        cases = {
            case["name"]: case
            for case in self.fixtures["invalid"]
            if case["name"] in {
                "irt_011_zero_lifetime_across_offsets",
                "irt_011_reversed_lifetime_across_offsets",
            }
        }
        self.assertEqual(len(cases), 2)
        for name, case in cases.items():
            with self.subTest(case=name):
                candidate = self.gate.materialize_invalid(case, self.positives)
                credential = next(
                    contract
                    for contract in candidate["contracts"]
                    if contract["requirement_id"] == "IRT-011"
                )
                self.assertTrue(self.credential_validator.is_valid(credential))
                self.assertIn(
                    case["semantic_rule"],
                    self.semantic_failures(candidate, "<root>"),
                )


if __name__ == "__main__":
    unittest.main()
