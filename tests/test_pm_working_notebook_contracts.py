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

    # ---- WNC-R02/R03 (FU-03): counterexamples validated against their actual
    # $defs subschema, each with a positive control and a leaf-relevant assertion,
    # so envelope-level noise can never satisfy the assertion. ----

    def _tool_request_rejected(self, why: str, request: dict) -> None:
        control = copy.deepcopy(self.fixtures["positive"]["tool_requests"][2])
        self.assertFalse(validator.subschema_errors(self.schema, "tool_request", control),
                         f"{why}: positive control must validate")
        errors = validator.subschema_errors(self.schema, "tool_request", request)
        self.assertTrue(errors, f"{why}: must be rejected by $defs/tool_request itself")
        self.assertTrue(
            any("args" in str(list(err.absolute_path)) or "required" in err.message
                for err in validator.iter_validation_errors(
                    {"$schema": self.schema.get("$schema"), "$defs": self.schema["$defs"],
                     "$ref": "#/$defs/tool_request"}, request)),
            f"{why}: rejection must come from the request contract",
        )

    def test_chatread_with_empty_args_rejected(self) -> None:
        self._tool_request_rejected("empty chatread argument bag", {"tool": "chatread", "args": {}})

    def test_notebook_write_with_empty_args_rejected(self) -> None:
        self._tool_request_rejected("empty notebook_write argument bag", {"tool": "notebook_write", "args": {}})

    def test_read_with_negative_offset_rejected(self) -> None:
        self._tool_request_rejected(
            "negative range start",
            {"tool": "chatread", "args": {"thread_id": "thr_01JEXAMPLETHREAD", "message_id": "msg_01J",
                                          "range": {"convention": "unicode_char_offsets",
                                                    "start": -4, "end": 10}}})

    def test_unknown_argument_name_rejected(self) -> None:
        self._tool_request_rejected(
            "unknown argument name",
            {"tool": "notebook_read", "args": {"notebook_id": "nb_01JEXAMPLENOTEBOOK",
                                               "entry_id": "wne_01JEXAMPLESTALE02",
                                               "wildcard_dump": True}})

    def _transition_rejected(self, why: str, mutate) -> None:
        control = copy.deepcopy(self.fixtures["positive"]["context_transitions"][0])
        self.assertFalse(validator.subschema_errors(self.schema, "context_transition_record", control),
                         f"{why}: positive control must validate")
        transition = copy.deepcopy(control)
        mutate(transition)
        self.assertTrue(validator.subschema_errors(self.schema, "context_transition_record", transition),
                        f"{why}: must be rejected by $defs/context_transition_record itself")

    def test_success_without_admission_property_rejected(self) -> None:
        self._transition_rejected(
            "success state without an admission receipt property",
            lambda t: t.pop("admission_receipt_ref"))

    def test_success_with_null_new_window_rejected(self) -> None:
        self._transition_rejected(
            "activated success with no next-window identity",
            lambda t: t.update(new_context_window_id=None))

    def test_success_with_unavailable_controller_rejected(self) -> None:
        self._transition_rejected(
            "activation recorded under an unavailable controller",
            lambda t: t.update(effective_controller="unavailable"))

    # ---- FU-03 ablations: removing the target constraint must make the
    # corresponding regression stop detecting it. ----

    def test_ablation_tool_branches_removed_stops_detecting_empty_args(self) -> None:
        weakened = copy.deepcopy(self.schema)
        weakened["$defs"]["tool_request"] = {}
        self.assertFalse(
            validator.subschema_errors(weakened, "tool_request", {"tool": "chatread", "args": {}}),
            "ablated tool_request must accept the empty-args case, proving the test tracks this constraint")

    def test_ablation_success_conditional_removed_stops_detecting_null_window(self) -> None:
        weakened = copy.deepcopy(self.schema)
        definition = copy.deepcopy(weakened["$defs"]["context_transition_record"])
        definition["allOf"] = [
            c for c in definition.get("allOf", [])
            if c.get("if", {}).get("properties", {}).get("state", {}).get("enum") != ["activated", "recovered_resumed"]
        ]
        weakened["$defs"]["context_transition_record"] = definition
        transition = copy.deepcopy(self.fixtures["positive"]["context_transitions"][0])
        transition["new_context_window_id"] = None
        self.assertFalse(
            validator.subschema_errors(weakened, "context_transition_record", transition),
            "ablating the success conditional must stop detecting the null-window case")

    # ---- FU-02: UTF-8 byte enforcement covers create, not just update ----

    def _write_body_bytes_report(self, body: str) -> dict:
        broken = copy.deepcopy(self.fixtures)
        for request in broken["positive"]["tool_requests"]:
            if request["tool"] == "notebook_write" and request["args"].get("operation") == "create":
                request["args"]["body"] = body
        return validator.run_validation(fixtures=broken)

    def test_create_body_one_byte_over_utf8_limit_fails(self) -> None:
        report = self._write_body_bytes_report("é" * 32769)  # 65,538 bytes, 32,769 chars
        self.assertEqual(report["status"], "fail",
                         "create body over the 64 KiB UTF-8 byte limit must fail the validator")

    def test_create_body_exactly_at_utf8_limit_passes(self) -> None:
        report = self._write_body_bytes_report("é" * 32768)  # exactly 65,536 bytes
        self.assertEqual(report["status"], "pass",
                         "create body at exactly 64 KiB UTF-8 bytes must pass; "
                         + json.dumps([c for c in report["checks"] if c["status"] != "pass"])[:800])

    # ---- FU-04: substitution/loss of negative semantics must fail ----

    def test_repointed_negative_mutation_fails(self) -> None:
        broken = copy.deepcopy(self.fixtures)
        for negative in broken["negative"]:
            negative["mutation"] = {"path": "tool_requests[0].tool", "value": "notebook_dump_all"}
        self._assert_fail(validator.run_validation(fixtures=broken),
                          "negatives repointed to one identical mutation must fail the target pins")

    def test_same_record_substitutions_fail(self) -> None:
        # RC3-01: swapping a case's mutation for a different constraint inside the
        # same record must fail, even though the replacement value is itself invalid.
        substitutions = [
            ("neg_body_over_limit",
             {"path": "entry_envelopes[0].epistemic_kind", "value": "verified"}),
            ("neg_read_negative_offset",
             {"path": "tool_requests[1].args.range.convention", "value": "mixed_byte_and_char"}),
            ("neg_supersede_null_expected_revision",
             {"path": "tool_requests[6].args.operation", "value": "deleted"}),
        ]
        for case_id, mutation in substitutions:
            broken = copy.deepcopy(self.fixtures)
            match = next(n for n in broken["negative"] if n["negative_id"] == case_id)
            match["mutation"] = mutation
            report = validator.run_validation(fixtures=broken)
            self.assertEqual(report["status"], "fail",
                             f"same-record substitution of {case_id} must fail the case pins")

    def test_unresolvable_owner_anchor_fails(self) -> None:
        broken = copy.deepcopy(self.fixtures)
        row = broken["acceptance_scenario_map"]["scenarios"]["WNC-A04"]
        row["refs"] = ["Plans/Working_Notebook.md#WNC-ANCHOR-DOES-NOT-EXIST"]
        self._assert_fail(validator.run_validation(fixtures=broken),
                          "an owner ref with an unresolvable anchor must fail")

    def test_invalid_declared_rejects_fails(self) -> None:
        broken = copy.deepcopy(self.fixtures)
        for negative in broken["negative"]:
            negative["rejects"] = "not_a_real_family[999]"
        self._assert_fail(validator.run_validation(fixtures=broken),
                          "invalid declared rejection targets must fail the target pins")

    def test_null_scenario_records_fail(self) -> None:
        broken = copy.deepcopy(self.fixtures)
        scenarios = broken["acceptance_scenario_map"]["scenarios"]
        broken["acceptance_scenario_map"]["scenarios"] = {k: None for k in scenarios}
        self._assert_fail(validator.run_validation(fixtures=broken),
                          "non-object scenario records must fail")

    def test_unresolvable_static_refs_fail(self) -> None:
        broken = copy.deepcopy(self.fixtures)
        for row in broken["acceptance_scenario_map"]["scenarios"].values():
            if isinstance(row, dict) and row.get("disposition") == "static_fixture":
                row["refs"] = ["not_a_real_fixture[999]"]
        self._assert_fail(validator.run_validation(fixtures=broken),
                          "unresolvable static refs must fail")

    def test_removed_static_refs_fail(self) -> None:
        broken = copy.deepcopy(self.fixtures)
        for row in broken["acceptance_scenario_map"]["scenarios"].values():
            if isinstance(row, dict) and row.get("disposition") == "static_fixture":
                row.pop("refs", None)
        self._assert_fail(validator.run_validation(fixtures=broken),
                          "missing static refs must fail")


if __name__ == "__main__":
    unittest.main()
