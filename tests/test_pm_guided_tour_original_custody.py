"""Focused static regressions for PWIZ-023 owner-original admission.

These tests bind the typed owner-custody records to the *existing* Tour v3 action
exchange and to its existing consumer route (`pm-new-contracts-verify.py` ->
`pm_guided_tour_semantics`).  They never prove native issuance, capture, hold,
readback, restore or release: a ref string, a fixture, an equal current value, a
self-declared boolean, a released transaction-slot prior or a saved Tour
checkpoint authenticates nothing here, and the required injected resolver is
exercised only as a controlled test double.
"""
from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path
import sys
import types
import unittest
from unittest import mock

from jsonschema import Draft202012Validator
from referencing import Registry


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "Plans/guided_tour_contracts.schema.json"
FIXTURES_PATH = ROOT / "Plans/guided_tour_contract_fixtures.json"
sys.path.insert(0, str(ROOT / "scripts"))
import pm_guided_tour_semantics as semantics  # noqa: E402
import pm_guided_tour_custody_semantics as custody  # noqa: E402


def load_gate():
    """The real consumer module, plus whether import-only placeholders were needed.

    An isolated snapshot can lack sibling helper modules of unrelated contract
    pairs; only then are placeholders installed so the Tour route - which uses
    the real Tour helper and the real custody joins - can still be exercised.
    """
    def attempt():
        spec = importlib.util.spec_from_file_location("tour_custody_gate", ROOT / "scripts/pm-new-contracts-verify.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    stubbed: list[str] = []
    while True:
        try:
            gate = attempt()
        except ModuleNotFoundError as exc:
            name = exc.name or ""
            if not name.startswith("pm_") or name in stubbed or len(stubbed) > 120:
                raise
            stub = types.ModuleType(name)

            def unavailable(*args, __name=name, **kwargs):
                raise AssertionError(f"unrelated helper {__name} must not run in this test")

            stub.__getattr__ = lambda attribute: unavailable
            sys.modules[name] = stub
            stubbed.append(name)
            continue
        return gate, stubbed


class TourOriginalCustodyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
        cls.pack = json.loads(FIXTURES_PATH.read_text(encoding="utf-8"))
        cls.valid = {case["name"]: case for case in cls.pack["valid"]}
        cls.invalid = {case["name"]: case for case in cls.pack["invalid"]}
        cls.gate, cls.stubbed = load_gate()
        cls.exchanges = [case for case in cls.pack["valid"] if case["definition"] == "guided_tour_action_exchange"]

    # ------------------------------------------------------------------ helpers
    def validator(self, definition: str, schema: dict | None = None) -> Draft202012Validator:
        owner = schema or self.schema
        return Draft202012Validator({**owner, "$ref": f"#/$defs/{definition}"})

    def errors(self, definition: str, instance: dict, schema: dict | None = None) -> list:
        return list(self.validator(definition, schema).iter_errors(instance))

    def materialize(self, case: dict) -> dict:
        value = copy.deepcopy(self.valid[case["base_valid"]]["value"])
        for dotted, replacement in case.get("patch", {}).items():
            parts = dotted.split(".")
            current = value
            for part in parts[:-1]:
                current = current[int(part)] if isinstance(current, list) else current[part]
            leaf = parts[-1]
            if isinstance(current, list):
                current[int(leaf)] = copy.deepcopy(replacement)
            else:
                current[leaf] = copy.deepcopy(replacement)
        for dotted in case.get("remove", []):
            parts = dotted.split(".")
            current = value
            for part in parts[:-1]:
                current = current[int(part)] if isinstance(current, list) else current[part]
            leaf = parts[-1]
            if isinstance(current, list):
                del current[int(leaf)]
            else:
                current.pop(leaf, None)
        return value

    def binding(self, value: dict) -> dict:
        return value["context"]["original_custody"]

    def semantic_failures(self, definition: str, value: dict, case: dict | None = None) -> list[str]:
        resolver = self.gate.tour_fixture_coverage_resolver(self.pack, case or {"name": "default"})
        return semantics.guided_tour_semantic_failures(
            definition, value, owner_coverage_resolver=resolver
        )

    def case_failures(self, name: str) -> tuple[list, list]:
        case = self.invalid[name]
        value = self.materialize(case)
        errors = self.errors(case["definition"], value)
        return errors, self.semantic_failures(case["definition"], value, case)

    def rule_registry(self) -> dict[str, custody.CUSTODY_RULES]:
        return dict(custody.CUSTODY_RULES)

    # ------------------------------------------------- entry point and binding
    def test_typed_records_are_bound_to_the_existing_tour_exchange_entry_point(self) -> None:
        defs = self.schema["$defs"]
        context = defs["action_context"]
        self.assertIn("original_custody", context["required"])
        self.assertEqual(context["properties"]["original_custody"],
                         {"$ref": "#/$defs/guided_tour_original_custody"})
        capture = defs["captured_state"]["properties"]
        self.assertNotIn("original_custody", capture)
        self.assertNotIn("original_custody", defs["guided_tour_checkpoint"]["properties"])
        self.assertNotIn("original_custody", defs["guided_tour_session"]["properties"])
        self.assertEqual(defs["captured_state"]["properties"]["owner_refs_only"], {"const": True})
        self.assertEqual(len(self.exchanges), 37)
        for case in self.exchanges:
            with self.subTest(case=case["name"]):
                self.assertEqual([], self.errors(case["definition"], case["value"]))
                self.assertEqual([], self.semantic_failures(case["definition"], case["value"], case))
        canonical = self.valid["joined_skip"]["value"]
        binding = self.binding(canonical)
        retained = canonical["context"]["original_capture"]
        self.assertEqual(binding["captured_state_ref"], canonical["context"]["captured_state_ref"])
        self.assertEqual(binding["chat_original"]["chat_owner_snapshot_ref"], retained["chat_owner_snapshot_ref"])
        self.assertEqual(binding["layout_originals"]["layout_owner_snapshot_ref"], retained["layout_owner_snapshot_ref"])
        self.assertEqual(binding["chat_original"]["thread_ref"], retained["chat_thread_ref"])
        self.assertEqual(binding["chat_original"]["selection_ref"], retained["chat_selection_ref"])
        self.assertEqual(binding["chat_original"]["placeholder_ref"], retained["chat_placeholder_ref"])
        self.assertEqual(binding["chat_original"]["focus_ref"], retained["chat_focus_ref"])
        self.assertEqual(binding["chat_original"]["owner_ref"], retained["chat_state_owner_ref"])

    def test_chat_and_layout_originals_are_exact_typed_records(self) -> None:
        defs = self.schema["$defs"]
        chat = defs["chat_owner_original"]
        self.assertEqual(chat["properties"]["owner_ref"], {"const": "owner:assistant_chat"})
        self.assertEqual(chat["properties"]["owner_identity"], {"const": "Assistant Chat"})
        self.assertEqual(chat["properties"]["original_selection"], {"const": "owner_issued_original"})
        self.assertEqual(chat["properties"]["authority_source"], {"const": "issuing_owner_readback"})
        self.assertEqual(chat["properties"]["draft"]["properties"]["bytes_source"],
                         {"const": "owner_held_original_bytes"})
        self.assertEqual(chat["properties"]["draft"]["properties"]["coverage"]["enum"],
                         ["captured_previously_empty_draft", "captured_user_edited_draft", "captured_unsent_draft"])
        self.assertEqual(chat["properties"]["thread_coverage"]["enum"],
                         ["captured_thread", "capture_time_absence"])
        for key in ("owner_revision_at_capture", "capture_sequence", "first_chat_mutation_sequence"):
            self.assertIn(key, chat["required"])
        self.assertIn("owner_currentness_sha256_at_capture", chat["required"])
        self.assertIn("issuer_readback_ref", chat["required"])
        entry = defs["layout_owner_original_entry"]
        self.assertEqual(entry["properties"]["record_kind"]["enum"],
                         ["home_workspace_layout_record", "widget_or_panel_layout_lane_record"])
        for key in ("owner_ref", "owner_identity", "scope_ref", "original_ref", "owner_revision_at_capture",
                    "owner_currentness_sha256_at_capture", "capture_sequence", "first_owner_mutation_sequence",
                    "issuer_readback_ref"):
            self.assertIn(key, entry["required"])
        layout = defs["layout_owner_original_set"]
        self.assertEqual(layout["properties"]["entries"]["minItems"], 1)
        self.assertNotIn("maxItems", layout["properties"]["entries"])
        self.assertEqual(layout["properties"]["completeness"]["properties"]["basis"],
                         {"const": "owner_current_coverage_proof"})
        self.assertEqual(defs["owner_original_readback_entry"]["properties"]["original_state"]["enum"],
                         ["present_held", "missing", "released", "unavailable"])
        self.assertEqual(defs["owner_original_readback_entry"]["properties"]["current_lifecycle"]["enum"],
                         ["present", "deleted", "tombstoned", "permission_denied", "scope_denied", "unknown"])

    def test_a_ref_string_fixture_equal_value_or_boolean_authenticates_nothing(self) -> None:
        substitutions = [
            ("custody_missing_typed_binding_is_refused", "original_custody"),
            ("custody_equal_current_value_substituted", "original_selection"),
            ("custody_released_transaction_slot_substitution", "original_selection"),
            ("custody_restoration_boolean_substitution", "authority_source"),
            ("custody_resolver_native_proof_claim", "proof_class"),
            ("custody_resolver_production_claim_allowed", "production_claim_allowed"),
            ("custody_production_receipt_claim", "production_receipt_claim"),
            ("custody_hold_not_held_through_retry", "held_across"),
        ]
        for name, field in substitutions:
            with self.subTest(case=name):
                errors, _ = self.case_failures(name)
                self.assertTrue(errors, f"{name} must be structurally refused ({field})")

    # ------------------------------------------------------ rule causality
    def test_every_custody_rule_has_a_causal_counterexample(self) -> None:
        cases = {
            "tour.original_custody_entry_point_join": ["custody_entry_point_join_mismatch",
                                                       "custody_chat_capture_time_absence_keeps_thread"],
            "tour.original_custody_capture_precedes_first_mutation": [
                "custody_chat_capture_after_first_mutation",
                "custody_layout_entry_capture_after_first_mutation"],
            "tour.original_custody_admission_readback_authentication": [
                "custody_admission_readback_currentness_stale",
                "custody_admission_readback_owner_missing"],
            "tour.original_custody_layout_affected_set": ["custody_layout_owner_missing_from_affected_set",
                                                          "custody_layout_home_row_claimed_as_complete_affected_set",
                                                          "custody_layout_lane_entry_reported_as_home_record"],
            "tour.original_custody_resolver_required": ["custody_resolver_absent_but_restoration_applied",
                                                        "custody_resolver_failing_but_restoration_applied",
                                                        "custody_admitted_resolver_without_final_boundary_readback"],
            "tour.original_custody_original_resolvable": ["custody_chat_original_missing_before_restore",
                                                          "custody_chat_original_released_before_restore"],
            "tour.original_custody_current_authority_revalidation": ["custody_chat_deleted_but_restored_applied",
                                                                     "custody_chat_tombstoned_but_restored_applied",
                                                                     "custody_restore_readback_substituted"],
            "tour.original_custody_restoration_outcome_matches_owners": ["custody_partial_restoration_reported_applied",
                                                                         "custody_keep_skips_chat_restoration"],
            "tour.original_custody_retry_reuses_held_original": ["custody_retry_substitutes_recreated_original"],
            "tour.original_custody_release_after_settlement": ["custody_release_before_terminal_settlement",
                                                               "custody_release_after_failed_restoration_without_resolution"],
            "tour.original_custody_resume_never_restores": ["custody_resume_applies_original_boundary"],
        }
        self.assertEqual(set(cases), set(self.rule_registry()))
        for rule, names in cases.items():
            for name in names:
                with self.subTest(rule=rule, case=name):
                    errors, failures = self.case_failures(name)
                    self.assertEqual([], errors, "semantic counterexample must stay schema-valid")
                    self.assertEqual([rule], failures)
                    remaining = tuple(item for item in custody.CUSTODY_RULES if item[0] != rule)
                    with mock.patch.object(custody, "CUSTODY_RULES", remaining):
                        self.assertEqual([], self.semantic_failures(
                            self.invalid[name]["definition"], self.materialize(self.invalid[name])))

    def test_layout_affected_set_is_complete_across_owners_without_fixed_cardinality(self) -> None:
        canonical = self.binding(self.valid["joined_skip"]["value"])["layout_originals"]
        self.assertEqual([entry["owner_ref"] for entry in canonical["entries"]],
                         ["owner:workspace_layout", "owner:widget"])
        self.assertEqual(canonical["completeness"]["single_home_row_claim"], False)
        self.assertEqual(canonical["completeness"]["practice_mutates_widget_or_panel_lane"], True)
        self.assertEqual(canonical["completeness"]["declared_owner_count"], 2)
        wide = self.binding(self.valid["joined_original_custody_multi_owner_layout_enumeration"]["value"])
        layout = wide["layout_originals"]
        self.assertEqual(len(layout["entries"]), 3)
        self.assertEqual(sorted(layout["affected_owner_refs"]),
                         ["owner:assistant_chat", "owner:widget", "owner:workspace_layout"])
        self.assertEqual(layout["completeness"]["declared_owner_count"], 3)
        self.assertEqual(sorted(entry["original_ref"] for entry in layout["entries"]),
                         sorted(entry["original_ref"] for entry in layout["entries"]))
        for name in ("custody_layout_owner_missing_from_affected_set",
                     "custody_layout_home_row_claimed_as_complete_affected_set",
                     "custody_layout_lane_entry_reported_as_home_record"):
            errors, failures = self.case_failures(name)
            self.assertEqual([], errors)
            self.assertEqual(["tour.original_custody_layout_affected_set"], failures)

    def test_nonterminal_next_cannot_restore_or_release_originals(self) -> None:
        next_exchange = copy.deepcopy(self.valid["joined_next"]["value"])
        terminal = self.binding(self.valid["joined_skip"]["value"])
        carried = self.binding(next_exchange)
        for key in ("restore_boundary", "hold_lifecycle"):
            carried[key] = copy.deepcopy(terminal[key])
        carried["resolver_binding"]["final_boundary_readback"] = copy.deepcopy(
            terminal["resolver_binding"]["final_boundary_readback"])
        self.assertEqual([], self.errors("guided_tour_action_exchange", next_exchange))
        failures = self.semantic_failures("guided_tour_action_exchange", next_exchange)
        self.assertIn("tour.original_custody_restoration_outcome_matches_owners", failures)
        self.assertIn("tour.original_custody_release_after_settlement", failures)

    def test_coherent_layout_omission_needs_independent_owner_coverage(self) -> None:
        omitted = copy.deepcopy(self.valid["joined_skip"]["value"])
        carried = self.binding(omitted)
        layout = carried["layout_originals"]
        layout["entries"] = [row for row in layout["entries"] if row["owner_ref"] != "owner:widget"]
        layout["affected_owner_refs"] = ["owner:workspace_layout"]
        layout["completeness"].update(
            declared_owner_count=1, single_home_row_claim=True,
            practice_mutates_widget_or_panel_lane=False,
        )
        for boundary in ("admission_readback", "final_boundary_readback"):
            readback = carried["resolver_binding"][boundary]
            readback["owner_entries"] = [
                row for row in readback["owner_entries"] if row["owner_ref"] != "owner:widget"
            ]
        attempt = carried["restore_boundary"]
        attempt["entries"] = [row for row in attempt["entries"] if row["owner_ref"] != "owner:widget"]
        self.assertEqual([], self.errors("guided_tour_action_exchange", omitted))
        self.assertIn("tour.original_custody_layout_affected_set",
                      self.semantic_failures("guided_tour_action_exchange", omitted))
        self.assertIn("tour.original_custody_layout_affected_set",
                      semantics.guided_tour_semantic_failures("guided_tour_action_exchange", omitted))
        self.assertEqual([], self.semantic_failures(
            "guided_tour_action_exchange", self.valid["joined_skip"]["value"]))
        self.assertIn("tour.original_custody_layout_affected_set",
                      semantics.guided_tour_semantic_failures(
                          "guided_tour_action_exchange", self.valid["joined_skip"]["value"]))

    def test_capture_precedes_the_first_owner_mutation(self) -> None:
        for name in ("custody_chat_capture_after_first_mutation",
                     "custody_layout_entry_capture_after_first_mutation"):
            with self.subTest(case=name):
                errors, failures = self.case_failures(name)
                self.assertEqual([], errors)
                self.assertEqual(["tour.original_custody_capture_precedes_first_mutation"], failures)
        binding = self.binding(self.valid["joined_skip"]["value"])
        self.assertLess(binding["chat_original"]["capture_sequence"],
                        binding["chat_original"]["first_chat_mutation_sequence"])
        for entry in binding["layout_originals"]["entries"]:
            self.assertLess(entry["capture_sequence"], entry["first_owner_mutation_sequence"])

    def test_original_resolvability_and_current_authority_are_separate_refusals(self) -> None:
        for name, rule in (("custody_chat_original_missing_before_restore",
                            "tour.original_custody_original_resolvable"),
                           ("custody_chat_original_released_before_restore",
                            "tour.original_custody_original_resolvable"),
                           ("custody_chat_deleted_but_restored_applied",
                            "tour.original_custody_current_authority_revalidation"),
                           ("custody_chat_tombstoned_but_restored_applied",
                            "tour.original_custody_current_authority_revalidation"),
                           ("custody_restore_readback_substituted",
                            "tour.original_custody_current_authority_revalidation")):
            with self.subTest(case=name):
                errors, failures = self.case_failures(name)
                self.assertEqual([], errors)
                self.assertEqual([rule], failures)
        tombstoned = self.valid["joined_skip_tombstoned_chat_reports_recovery_required"]["value"]
        rows = {entry["original_kind"]: entry for entry in self.binding(tombstoned)["restore_boundary"]["entries"]}
        self.assertEqual(rows["chat_state"]["apply_status"], "not_applied_denied")
        self.assertFalse(rows["chat_state"]["applied"])
        self.assertFalse(rows["chat_state"]["recreation_attempted"])
        self.assertEqual(tombstoned["result"]["status"], "recovery_required")
        self.assertFalse(tombstoned["result"]["detail"]["restoration"]["chat_state_restored"])

    def test_resolver_interface_is_required_and_doubles_are_never_native_proof(self) -> None:
        resolver = self.schema["$defs"]["owner_original_resolver_binding"]["properties"]
        self.assertEqual(resolver["interface_ref"], {"const": "owner_original_resolver"})
        self.assertEqual(resolver["injection"], {"const": "required_injected"})
        self.assertEqual(resolver["authenticates_at"]["prefixItems"],
                         [{"const": "admission"}, {"const": "final_restore_release_boundary"}])
        self.assertEqual(resolver["authenticates_at"]["maxItems"], 2)
        self.assertEqual(resolver["authority_source"], {"const": "issuing_owner_readback"})
        self.assertEqual(resolver["absence_disposition"], {"const": "refuse_production_claim"})
        self.assertEqual(resolver["proof_class"], {"const": "controlled_test_double"})
        self.assertEqual(resolver["native_proof"], {"const": False})
        self.assertEqual(resolver["production_claim_allowed"], {"const": False})
        self.assertEqual(self.schema["$defs"]["owner_original_readback"]["properties"]["boundary"]["enum"],
                         ["admission", "final_restore_release_boundary"])
        for name, rule in (("custody_resolver_absent_but_restoration_applied",
                            "tour.original_custody_resolver_required"),
                           ("custody_resolver_failing_but_restoration_applied",
                            "tour.original_custody_resolver_required"),
                           ("custody_admitted_resolver_without_final_boundary_readback",
                            "tour.original_custody_resolver_required")):
            with self.subTest(case=name):
                errors, failures = self.case_failures(name)
                self.assertEqual([], errors)
                self.assertEqual([rule], failures)
        refused = self.valid["joined_original_custody_resolver_absent_refuses_restoration"]["value"]
        resolver_value = self.binding(refused)["resolver_binding"]
        self.assertEqual(resolver_value["availability"], "absent")
        self.assertIsNone(resolver_value["admission_readback"])
        self.assertIsNone(resolver_value["final_boundary_readback"])
        self.assertFalse(any(entry["applied"] for entry in self.binding(refused)["restore_boundary"]["entries"]))
        self.assertEqual(refused["result"]["status"], "recovery_required")
        self.assertEqual(refused["result"]["detail"]["restoration"]["status"], "failed")

    def test_hold_is_held_through_mutation_resume_and_retry_then_released(self) -> None:
        held = self.binding(self.valid["joined_pause"]["value"])["hold_lifecycle"]
        self.assertEqual(held["hold_state"], "held")
        self.assertEqual(held["held_across"], ["tour_mutation", "close_reload_resume", "failed_restoration_retry"])
        self.assertEqual(held["release_trigger"], "none_yet")
        settled = self.binding(self.valid["joined_skip"]["value"])["hold_lifecycle"]
        self.assertEqual(settled["hold_state"], "released")
        self.assertEqual(settled["release_trigger"], "terminal_settlement")
        self.assertGreater(settled["release_sequence"],
                           self.binding(self.valid["joined_skip"]["value"])["restore_boundary"]["attempt_sequence"])
        retrying = self.binding(self.valid["joined_skip_restore_recovery"]["value"])["hold_lifecycle"]
        self.assertEqual(retrying["hold_state"], "held")
        for name in ("custody_release_before_terminal_settlement",
                     "custody_release_after_failed_restoration_without_resolution"):
            with self.subTest(case=name):
                errors, failures = self.case_failures(name)
                self.assertEqual([], errors)
                self.assertEqual(["tour.original_custody_release_after_settlement"], failures)

    def test_failed_restoration_retries_with_the_same_held_original(self) -> None:
        retry = self.valid["joined_skip_restore_retry_reuses_held_original"]["value"]
        attempt = self.binding(retry)["restore_boundary"]
        originals = {entry["original_ref"] for entry in attempt["entries"]}
        self.assertEqual(attempt["retry"]["retry_source"], "held_same_original")
        self.assertEqual(set(attempt["retry"]["retry_original_refs"]), originals)
        self.assertLess(attempt["retry"]["retry_sequence"], attempt["attempt_sequence"])
        self.assertEqual(retry["result"]["detail"]["restoration"]["attempt_ref"], attempt["attempt_ref"])
        errors, failures = self.case_failures("custody_retry_substitutes_recreated_original")
        self.assertEqual([], errors)
        self.assertEqual(["tour.original_custody_retry_reuses_held_original"], failures)

    def test_layout_keep_skips_layout_restore_only_and_chat_still_restores(self) -> None:
        keep = self.valid["joined_finish_explicit_keep"]["value"]
        restoration = keep["result"]["detail"]["restoration"]
        self.assertEqual(restoration["status"], "not_required")
        self.assertFalse(restoration["layout_restored"])
        self.assertTrue(restoration["chat_state_restored"])
        rows = {entry["original_kind"]: entry for entry in self.binding(keep)["restore_boundary"]["entries"]}
        self.assertEqual(rows["chat_state"]["apply_status"], "applied")
        self.assertTrue(rows["chat_state"]["applied"])
        skipped = [entry for entry in self.binding(keep)["restore_boundary"]["entries"]
                   if entry["original_kind"] == "layout"]
        self.assertTrue(skipped)
        for entry in skipped:
            self.assertEqual(entry["apply_status"], "skipped_layout_keep")
            self.assertFalse(entry["applied"])
        errors, failures = self.case_failures("custody_keep_skips_chat_restoration")
        self.assertEqual([], errors)
        self.assertEqual(["tour.original_custody_restoration_outcome_matches_owners"], failures)

    def test_resume_revalidates_but_never_automatically_restores(self) -> None:
        for name in ("joined_checkpoint_reconstructs_without_live_controller",
                     "joined_checkpoint_resume_returns_to_earliest_invalidated_practice",
                     "joined_hypothetical_checkpoint_resume_not_storage_admission"):
            with self.subTest(case=name):
                value = self.valid[name]["value"]
                binding = self.binding(value)
                self.assertIsNone(binding["restore_boundary"])
                self.assertEqual(binding["hold_lifecycle"]["hold_state"], "held")
                self.assertIsNone(value["result"]["detail"].get("restoration"))
                self.assertEqual([], self.semantic_failures("guided_tour_action_exchange", value))
        errors, failures = self.case_failures("custody_resume_applies_original_boundary")
        self.assertEqual([], errors)
        self.assertEqual(["tour.original_custody_resume_never_restores"], failures)

    def test_partial_or_denied_original_never_reports_applied_restoration(self) -> None:
        errors, failures = self.case_failures("custody_partial_restoration_reported_applied")
        self.assertEqual([], errors)
        self.assertEqual(["tour.original_custody_restoration_outcome_matches_owners"], failures)
        for name in ("joined_original_custody_resolver_absent_refuses_restoration",
                     "joined_skip_tombstoned_chat_reports_recovery_required",
                     "joined_skip_restore_recovery",
                     "joined_finish_restore_recovery"):
            with self.subTest(case=name):
                value = self.valid[name]["value"]
                restoration = value["result"]["detail"]["restoration"]
                self.assertEqual(restoration["status"], "failed")
                self.assertTrue(restoration["retryable"])
                self.assertEqual(value["result"]["status"], "recovery_required")
                self.assertFalse(value["result"]["detail"]["completion_reported"])

    def test_gate_accepts_every_tour_positive_and_proves_every_negative(self) -> None:
        """Reproduce the existing consumer's own positive/negative loop for this pair."""
        positives = {case["name"]: case["value"] for case in self.pack["valid"]}
        for case in self.pack["valid"]:
            name = case["name"]
            with self.subTest(case=name):
                definition, selected = self.gate.select_definition(
                    self.schema, case, case["value"], require_valid=True)
                self.assertFalse(list(self.gate.validator_for(self.schema, selected, Registry())
                                      .iter_errors(case["value"])), name)
                self.assertEqual([], self.gate.contract_semantic_failures(
                    "Plans/guided_tour_contracts.schema.json", definition, case["value"],
                    owner_coverage_resolver=self.gate.tour_fixture_coverage_resolver(self.pack, case)), name)
        for case in self.pack["invalid"]:
            name = case["name"]
            with self.subTest(case=name):
                value = self.gate.materialize_invalid(case, positives)
                selector = dict(case)
                definition, selected = self.gate.select_definition(self.schema, selector, value, require_valid=False)
                accepted = self.gate.validator_for(self.schema, selected, Registry()).is_valid(value)
                semantic_rule = case.get("semantic_rule")
                if semantic_rule is not None:
                    self.assertTrue(accepted, f"{name} must stay schema-valid")
                    self.assertIn(semantic_rule, self.gate.contract_semantic_failures(
                        "Plans/guided_tour_contracts.schema.json", definition, value,
                        owner_coverage_resolver=self.gate.tour_fixture_coverage_resolver(self.pack, case)), name)
                else:
                    self.assertFalse(accepted, f"{name} must be rejected by the schema")

    def test_gate_routes_the_same_typed_records(self) -> None:
        case = self.invalid["custody_chat_deleted_but_restored_applied"]
        value = self.materialize(case)
        routed = self.gate.contract_semantic_failures(
            "Plans/guided_tour_contracts.schema.json", case["definition"], value,
            owner_coverage_resolver=self.gate.tour_fixture_coverage_resolver(self.pack, case),
        )
        self.assertEqual(["tour.original_custody_current_authority_revalidation"], routed)
        definition, selected = self.gate.select_definition(self.schema, case, value, require_valid=True)
        self.assertEqual("guided_tour_action_exchange", definition)
        self.assertFalse(list(self.gate.validator_for(self.schema, selected, Registry()).iter_errors(value)))
        self.assertEqual(["tour.unknown_definition"], self.semantic_failures("unrecognized", {}))


if __name__ == "__main__":
    unittest.main()
