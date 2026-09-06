"""Static Working Notebook contract regressions; these do not execute runtime behavior."""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import unittest


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/pm-working-notebook-contracts.py"
SPEC = importlib.util.spec_from_file_location("working_notebook_contracts", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
validator = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(validator)


class WorkingNotebookContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.fixtures = validator.load_json(validator.FIXTURES_PATH)
        cls.schema = validator.load_json(validator.SCHEMA_PATH)
        cls.registry = validator.load_json(validator.REGISTRY_PATH)

    def _assert_fail(self, report: dict, why: str) -> None:
        self.assertEqual(report["status"], "fail", why)

    def test_validator_passes_on_canonical_state(self) -> None:
        report = validator.run_validation()
        self.assertEqual(report["status"], "pass", json.dumps(report["checks"], indent=2)[:4000])

    def test_all_negative_fixtures_rejected(self) -> None:
        for negative in self.fixtures["negative"]:
            mutated = validator.apply_mutation(self.fixtures, negative["mutation"])
            errors = validator.validate_with_jsonschema(self.schema, mutated)
            self.assertTrue(errors, f"{negative['negative_id']} was not rejected")

    def test_no_verified_epistemic_kind_in_positive_fixtures(self) -> None:
        for entry in self.fixtures["positive"]["entry_envelopes"]:
            self.assertNotEqual(entry["epistemic_kind"], "verified")

    def test_committed_checkpoint_carries_receipt(self) -> None:
        for checkpoint in self.fixtures["positive"]["notebook_checkpoints"]:
            if checkpoint["state"] == "committed":
                self.assertTrue(checkpoint.get("commit_receipt_ref"))

    def test_success_transition_has_admission_boundary(self) -> None:
        for transition in self.fixtures["positive"]["context_transitions"]:
            if transition["state"] in {"activated", "recovered_resumed"}:
                self.assertTrue(transition.get("admission_receipt_ref"))
                self.assertTrue(transition.get("checkpoint_ref"))
                self.assertTrue(transition.get("new_context_window_id"))
                self.assertIn(transition.get("effective_controller"), {"pm_managed", "provider_native"})

    def test_registry_contains_notebook_families(self) -> None:
        families = {family["family_id"]: family for family in self.registry["families"]}
        for family_id, expected_schema in validator.EXPECTED_REGISTRY_FAMILIES.items():
            self.assertIn(family_id, families)
            self.assertEqual(families[family_id]["value_schema_id"], expected_schema)

    def test_script_exit_code_zero(self) -> None:
        proc = subprocess.run(
            [sys.executable, str(SCRIPT)],
            capture_output=True,
            text=True,
            timeout=120,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout[-2000:] + proc.stderr[-2000:])

    # ---- WNC-R05: every documented invocation form must actually work ----

    def test_documented_command_forms_execute(self) -> None:
        for argv in ([], ["validate"], ["--json"], ["validate", "--json"]):
            proc = subprocess.run(
                [sys.executable, str(SCRIPT), *argv],
                capture_output=True,
                text=True,
                timeout=120,
            )
            self.assertEqual(
                proc.returncode, 0,
                f"documented form {argv!r} failed: {proc.stderr[-500:]}",
            )

    def test_wrapper_subcheck_registered(self) -> None:
        proc = subprocess.run(
            [sys.executable, str(ROOT / "scripts/pm-plans-verify.py"),
             "validate-working-notebook-contracts"],
            capture_output=True,
            text=True,
            timeout=300,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout[-2000:] + proc.stderr[-2000:])

    # ---- WNC-R04: coverage loss and inventory drift must fail the validator ----

    def test_removing_all_negatives_fails(self) -> None:
        broken = copy.deepcopy(self.fixtures)
        broken["negative"] = []
        self._assert_fail(validator.run_validation(fixtures=broken), "empty negative set must fail")

    def test_emptying_a_positive_family_fails(self) -> None:
        broken = copy.deepcopy(self.fixtures)
        broken["positive"]["entry_envelopes"] = []
        self._assert_fail(validator.run_validation(fixtures=broken), "emptied family must fail")

    def test_removing_an_anchor_record_fails(self) -> None:
        broken = copy.deepcopy(self.fixtures)
        broken["positive"]["context_transitions"] = [
            t for t in broken["positive"]["context_transitions"]
            if t["transition_id"] != "cwt_01JEXAMPLECRASH02"
        ]
        self._assert_fail(validator.run_validation(fixtures=broken), "lost crash-cut-point anchor must fail")

    def test_unknown_negative_id_fails(self) -> None:
        broken = copy.deepcopy(self.fixtures)
        decoy = copy.deepcopy(broken["negative"][0])
        decoy["negative_id"] = "neg_decoy_replacement"
        broken["negative"].append(decoy)
        self._assert_fail(validator.run_validation(fixtures=broken), "unknown negative id must fail")

    def test_missing_scenario_map_fails(self) -> None:
        broken = copy.deepcopy(self.fixtures)
        broken["acceptance_scenario_map"]["scenarios"].pop("WNC-A26")
        self._assert_fail(validator.run_validation(fixtures=broken), "scenario-map gap must fail")

    # ---- WNC-R02/R03: schema-level rejection of the reviewed counterexamples ----

    def test_chatread_with_empty_args_rejected(self) -> None:
        request = {"tool": "chatread", "args": {}}
        self.assertTrue(validator.validate_with_jsonschema(self.schema, request),
                        "empty chatread argument bag must be rejected")

    def test_notebook_write_with_empty_args_rejected(self) -> None:
        request = {"tool": "notebook_write", "args": {}}
        self.assertTrue(validator.validate_with_jsonschema(self.schema, request),
                        "empty notebook_write argument bag must be rejected")

    def test_read_with_negative_offset_rejected(self) -> None:
        request = {"tool": "chatread", "args": {"thread_id": "thr_01JEXAMPLETHREAD",
                                                "message_id": "msg_01J",
                                                "range": {"convention": "unicode_char_offsets",
                                                          "start": -4, "end": 10}}}
        self.assertTrue(validator.validate_with_jsonschema(self.schema, request),
                        "negative range start must be rejected")

    def test_unknown_argument_name_rejected(self) -> None:
        request = {"tool": "notebook_read", "args": {"notebook_id": "nb_01JX", "entry_id": "wne_01JX",
                                                     "wildcard_dump": True}}
        self.assertTrue(validator.validate_with_jsonschema(self.schema, request),
                        "unknown argument names must be rejected")

    def test_success_without_admission_property_rejected(self) -> None:
        transition = copy.deepcopy(self.fixtures["positive"]["context_transitions"][0])
        transition.pop("admission_receipt_ref")
        self.assertTrue(validator.validate_with_jsonschema(self.schema, transition),
                        "success state without an admission receipt property must be rejected")

    def test_success_with_null_new_window_rejected(self) -> None:
        transition = copy.deepcopy(self.fixtures["positive"]["context_transitions"][0])
        transition["new_context_window_id"] = None
        self.assertTrue(validator.validate_with_jsonschema(self.schema, transition),
                        "activated success with no next-window identity must be rejected")

    def test_success_with_unavailable_controller_rejected(self) -> None:
        transition = copy.deepcopy(self.fixtures["positive"]["context_transitions"][0])
        transition["effective_controller"] = "unavailable"
        self.assertTrue(validator.validate_with_jsonschema(self.schema, transition),
                        "activation recorded under an unavailable controller must be rejected")


if __name__ == "__main__":
    unittest.main()
