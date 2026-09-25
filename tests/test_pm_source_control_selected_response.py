"""Focused successor joins for the six neutral Source Control routes.

Every assertion runs the actual central response path or the actual successor
composition. Fixture readers and the static digest double are synthetic test
inputs; passing here authenticates no native issuer, permission or effect.
"""
import copy
import json
from pathlib import Path
import sys
import unittest


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_ui_command_response as GATE
import pm_source_control_selected_response as SCM

FIXTURES = json.loads((ROOT / "Plans/sir_source_control_selected_dispatch_fixtures.json").read_text())
CASES = {row["name"]: row["value"] for row in FIXTURES["valid"]}
SIX = {
    "cmd.source_control.backend.select",
    "cmd.source_control.diff.open",
    "cmd.source_control.history.open",
    "cmd.source_control.remote.fetch",
    "cmd.source_control.remote.publish",
    "cmd.source_control.workspace.remove",
}


def run(value, reader=None):
    """Actual central response path over the fixture bundle."""
    return GATE.response_bundle_failures(
        value["bundle"],
        resolve_owner_record=reader or (lambda ref: copy.deepcopy(value["records"][ref])),
        canonical_request_digest=GATE.owner_result_digest)


def direct(value, reader=None):
    """Actual successor composition without the central structural pre-checks."""
    bundle = value["bundle"]
    return SCM.response_failures(
        bundle["response"], bundle["outcome"], bundle["owner_result"], bundle["owner_request"],
        bundle["normalized_request"], bundle["original_binding_ref"],
        bundle["delivery_return_context"],
        resolve_record=reader or (lambda ref: copy.deepcopy(value["records"][ref])),
        canonical_request_digest=GATE.owner_result_digest, canon_root=ROOT, registry=GATE.registry())


def mutated(name, change):
    value = copy.deepcopy(CASES[name])
    change(value)
    value["bundle"]["outcome"]["owner_result_sha256"] = GATE.owner_result_digest(value["bundle"]["owner_result"])
    return value


class SourceControlSelectedResponseTests(unittest.TestCase):
    def test_six_commands_are_exactly_the_successor_set(self):
        self.assertEqual(SCM.COMMANDS, frozenset(SIX))
        self.assertEqual({CASES[name]["bundle"]["response"]["command_id"] for name in CASES
                          if CASES[name]["bundle"]["response"]["command_id"] in SIX}, SIX)

    def test_every_successor_state_passes_the_actual_central_path(self):
        self.assertEqual(len(CASES), 8)
        for name, value in CASES.items():
            with self.subTest(name=name):
                self.assertEqual(run(value), [])

    def test_late_request_mutation_is_rejected(self):
        def reader_for(value):
            def reader(ref):
                if ref == "receipt:history":
                    value["bundle"]["owner_request"]["authority"]["scope"]["expected_revision"]["commit_oid"] = "a" * 40
                return copy.deepcopy(value["records"][ref])
            return reader

        value = copy.deepcopy(CASES["history_cancelled_null_ui_error"])
        self.assertIn("source_control_selected_response_inputs_mutated", direct(value, reader_for(value)))
        value = copy.deepcopy(CASES["history_cancelled_null_ui_error"])
        failures = run(value, reader_for(value))
        self.assertTrue("scm_selected_bundle_mutated_during_resolution" in failures
                        or "source_control_selected_response_inputs_mutated" in failures)

    def test_late_live_owner_record_mutation_is_rejected(self):
        value = copy.deepcopy(CASES["fetch_succeeded"])
        records = copy.deepcopy(value["records"])

        def reader(ref):
            if ref == "retained:fetch":
                records["receipt:fetch"]["degradation"]["state"] = "unavailable"
            return records[ref]

        self.assertIn("source_control_selected_response_owner_record_mutated", run(value, reader))

    def test_caller_return_context_is_echoed_without_substitution(self):
        self.assertIsNotNone(CASES["diff_succeeded_caller_return_context"]["bundle"]["delivery_return_context"])
        self.assertEqual(run(CASES["diff_succeeded_caller_return_context"]), [])
        value = mutated("diff_succeeded_caller_return_context",
                        lambda v: v["bundle"]["delivery_return_context"].update(
                            invocation_token="invocation:foreign"))
        self.assertIn("source_control_selected_response_delivery_original", run(value))
        value = mutated("diff_succeeded_caller_return_context",
                        lambda v: v["records"]["binding:diff"]["return_context"].update(
                            focus_id="focus:foreign"))
        failures = run(value)
        self.assertIn("source_control_selected_response_delivery_original", failures)
        self.assertIn("source_control_selected_response_owner_return_context", failures)
        value = mutated("diff_succeeded_caller_return_context",
                        lambda v: v["bundle"]["owner_request"]["authority"]["return_context"].update(
                            focus_id="focus:foreign"))
        self.assertIn("original_request_mismatch", run(value))

    def test_wrong_command_and_instance_are_rejected(self):
        value = mutated("fetch_succeeded",
                        lambda v: v["bundle"]["response"].update(command_id="cmd.source_control.remote.publish"))
        self.assertIn("source_control_selected_response_command", run(value))
        value = mutated("fetch_succeeded",
                        lambda v: v["bundle"]["response"].update(command_instance_id="foreign:instance"))
        self.assertIn("source_control_selected_response_instance", run(value))

    def test_foreign_scope_is_not_echoed(self):
        value = mutated("fetch_succeeded",
                        lambda v: v["bundle"]["outcome"]["identity"].update(execution_host_id="host:foreign"))
        self.assertIn("source_control_selected_response_identity", run(value))
        value = mutated("fetch_succeeded",
                        lambda v: v["records"]["binding:fetch"]["identity"].update(source_location_id="source:foreign"))
        self.assertIn("source_control_selected_response_context_identity", run(value))
        value = mutated("fetch_succeeded",
                        lambda v: v["records"]["binding:fetch"]["identity"].update(named_plan_id="plan:foreign"))
        self.assertIn("source_control_selected_response_context_lineage", run(value))

    def test_foreign_selection_and_retained_result_are_rejected(self):
        value = mutated("diff_succeeded_read_only",
                        lambda v: v["bundle"]["owner_request"]["selection"].update(paths=["src/foreign.rs"]))
        self.assertTrue(run(value))
        value = mutated("fetch_succeeded",
                        lambda v: v["records"]["retained:fetch"].update(outcome="cancelled"))
        self.assertIn("source_control_selected_response_retained_owner_result", run(value))

    def test_preview_and_disclosure_source_substitution_is_rejected(self):
        value = mutated("backend_select_succeeded",
                        lambda v: v["records"]["preview:backend_select"]["scope"].update(currentness_generation=99))
        self.assertIn("preview_scope", run(value))
        value = mutated("workspace_remove_blocked",
                        lambda v: v["records"]["native-source:preview:workspace_remove"].update(source_id="foreign"))
        self.assertIn("native_disclosure_source_source_id", run(value))

    def test_qualification_and_blocker_rules_still_apply(self):
        def add_repair(value):
            preview = value["records"]["preview:backend_select"]
            disclosure = preview["native_disclosure"]
            disclosure["native_repairs"] = [{
                "repair_id": "repair:backend", "qualified_native_operation_ref": "native:qualified-backend-migration",
                "before_mapping": copy.deepcopy(disclosure["before_mapping"]),
                "after_mapping": copy.deepcopy(disclosure["proposed_mapping"]),
                "file_effects": [], "config_effects": []}]
            value["records"]["native:qualified-backend-migration"] = {
                "schema_id": "pm.source_control.selected_operands.native_repair_qualification.v1",
                "schema_version": "1.0.0", "qualification_id": "native:qualified-backend-migration",
                "command_instance_id": preview["command_instance_id"], "scope": copy.deepcopy(preview["scope"]),
                "repair": copy.deepcopy(disclosure["native_repairs"][0])}
            value["records"][preview["native_disclosure_source_ref"]]["disclosure"] = copy.deepcopy(disclosure)

        value = mutated("backend_select_succeeded", add_repair)
        self.assertEqual(run(value), [])
        value = mutated("backend_select_succeeded", add_repair)
        value["records"]["native:qualified-backend-migration"]["repair"]["after_mapping"]["backing_store_ref"] = "foreign:store"
        self.assertIn("adoption_native_qualification", run(value))

        def add_blocker(value):
            preview = value["records"]["preview:workspace_remove"]
            preview["native_disclosure"]["blocking_finding_refs"] = ["finding:blocked"]
            value["records"][preview["native_disclosure_source_ref"]]["disclosure"] = copy.deepcopy(
                preview["native_disclosure"])

        value = mutated("workspace_remove_blocked", add_blocker)
        self.assertIn("native_disclosure_blocked", run(value))

    def test_partial_and_unknown_effects_cannot_be_relabelled(self):
        value = mutated("publish_effect_unknown",
                        lambda v: v["bundle"]["outcome"].update(outcome="failed"))
        self.assertIn("source_control_selected_response_outcome", run(value))
        value = mutated("fetch_failed_known_effect",
                        lambda v: v["records"]["error:fetch"].update(effect_state="effect_unknown",
                                                                     retry_allowed=False,
                                                                     safe_next_actions=["reconcile_effects"]))
        self.assertIn("source_control_selected_response_error_effect", run(value))

    def test_replay_keeps_the_original_dispatch_and_result(self):
        def replayed(value):
            response = value["bundle"]["response"]
            value["bundle"]["original_response"] = copy.deepcopy(dict(response, replayed=False))
            response.update(replayed=True, original_dispatch_id=value["records"]["binding:fetch"]["dispatch_id"])

        value = mutated("fetch_succeeded", replayed)
        self.assertEqual(run(value), [])
        value = mutated("fetch_succeeded", replayed)
        value["bundle"]["response"]["original_dispatch_id"] = "dispatch:scm:foreign"
        self.assertIn("source_control_selected_response_dispatch", run(value))
        value = mutated("fetch_succeeded", replayed)
        value["bundle"]["owner_result"]["selected"]["owner_result"]["operation_receipt_ref"] = "receipt:replacement"
        self.assertTrue(run(value))

    def test_nullable_cancellation_error_is_exact(self):
        value = CASES["history_cancelled_null_ui_error"]
        self.assertEqual(direct(value), [])
        value = copy.deepcopy(CASES["history_cancelled_null_ui_error"])
        value["records"]["projection:history"]["ui_error"] = {
            "code": "internal_error", "reason": "Injected non-null cancelled disclosure.", "offending_field": None}
        self.assertIn("source_control_selected_response_error_projection_nullability", direct(value))
        value = copy.deepcopy(CASES["fetch_failed_known_effect"])
        value["records"]["projection:fetch"]["ui_error"] = None
        self.assertIn("source_control_selected_response_error_projection_nullability", direct(value))

    def test_unknown_effect_without_an_owner_error_is_refused(self):
        value = copy.deepcopy(CASES["fetch_failed_known_effect"])
        binding = value["bundle"]["owner_result"]
        binding["error_ref"] = None
        binding["error_projection_ref"] = None
        binding["selected"]["owner_result"]["effect_state"] = "effect_unknown"
        records = copy.deepcopy(value["records"])
        del records["error:fetch"], records["projection:fetch"]
        failures = direct(value, lambda ref: copy.deepcopy(records[ref]))
        self.assertIn("source_control_selected_response_unknown_effect_without_owner_error", failures)
        self.assertIn("source_control_selected_response_error_required_for_terminal_failure", failures)

    def test_bare_records_and_missing_dependencies_are_not_proof(self):
        for definition in ("result_binding", "error_projection", "dispatch_binding"):
            with self.subTest(definition=definition):
                value = CASES["fetch_succeeded"]["bundle"]["owner_result"] if definition == "result_binding" else (
                    CASES["history_cancelled_null_ui_error"]["records"]["projection:history"]
                    if definition == "error_projection" else CASES["fetch_succeeded"]["records"]["binding:fetch"])
                self.assertEqual(SCM.selected_dispatch_semantic_failures(definition, value), [])
        self.assertEqual(SCM.selected_dispatch_semantic_failures(
            "dispatch_binding", CASES["fetch_succeeded"]["records"]["binding:fetch"]), [])
        bundle = CASES["fetch_succeeded"]["bundle"]
        self.assertEqual(SCM.response_failures(
            bundle["response"], bundle["outcome"], bundle["owner_result"], bundle["owner_request"],
            bundle["normalized_request"], bundle["original_binding_ref"], bundle["delivery_return_context"],
            resolve_record=None, canonical_request_digest=None, canon_root=ROOT, registry=GATE.registry()),
            ["source_control_selected_response_dependencies_missing"])

    def test_declared_fixture_semantics(self):
        for row in FIXTURES["valid"]:
            with self.subTest(case=row["name"]):
                self.assertEqual(SCM.selected_dispatch_semantic_failures("fixture_case", row["value"]), [])
        for row in FIXTURES["invalid"]:
            with self.subTest(case=row["name"]):
                failures = SCM.selected_dispatch_semantic_failures("fixture_case", row["value"])
                self.assertIn(row["semantic_rule"], failures)


if __name__ == "__main__":
    unittest.main()
