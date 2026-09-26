"""Causal checks for the typed Sound asset delete companion.

Every assertion runs the real composition helper over the enrolled static
fixtures and the actual central response/CommandOutcome schemas. The fixture
readers are synthetic static doubles: passing authenticates no issuer,
dispatcher, caller, permission, handler, soft-delete write, receipt writer or
physical custody, and neither the Touch row, handler status nor wiring status
is promoted here.
"""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import pm_sound_asset_action_response as ADAPTER  # noqa: E402
import pm_sound_asset_delete_contracts as GATE  # noqa: E402

ACTION_FIXTURES = json.loads((ROOT / "Plans/sound_asset_delete_action_fixtures.json").read_text())
DISPATCH_FIXTURES = json.loads((ROOT / "Plans/sir_sound_asset_action_dispatch_fixtures.json").read_text())
VALID = {row["name"]: row for row in ACTION_FIXTURES["valid"]}
INVALID = {row["name"]: row for row in ACTION_FIXTURES["invalid"]}
DISPATCH_VALID = {row["name"]: row for row in DISPATCH_FIXTURES["valid"]}
DISPATCH_INVALID = {row["name"]: row for row in DISPATCH_FIXTURES["invalid"]}
TOUCH = json.loads((ROOT / "Plans/touch_closure.json").read_text())
WIRING = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
ROUTE = "cmd.sound.asset.delete"


def drive(row):
    """Every drive starts from the frozen fixture value."""
    return ADAPTER.sound_asset_semantic_failures(row["definition"], copy.deepcopy(row["value"]),
                                                 canon_root=ROOT)


def shape_refused(name):
    return any(item.startswith("shape:") for item in drive(INVALID[name]))


def dependencies(value):
    return ADAPTER.fixture_dependencies(value)


def response_case(name, change=None):
    value = copy.deepcopy(VALID[name]["value"])
    if change is not None:
        change(value)
    return ADAPTER.response_failures(value, canon_root=ROOT, **dependencies(value))


class SoundAssetDeleteContractTests(unittest.TestCase):
    def test_companion_covers_exactly_the_delete_route(self):
        closed = ADAPTER.shape_failures("action_id", "cmd.sound.asset.export", canon_root=ROOT)
        self.assertTrue(closed)
        schema = json.loads((ROOT / ADAPTER.ACTION_SCHEMA[ROUTE]).read_text())
        self.assertEqual(set(schema["$defs"]["action_id"]["enum"]), {ROUTE})

    def test_every_declared_valid_fixture_passes_the_owner_joins(self):
        for document in (VALID, DISPATCH_VALID):
            for name, row in document.items():
                with self.subTest(name=name):
                    self.assertEqual(drive(row), [])

    def test_every_declared_negative_fixture_is_causally_refused(self):
        for document in (INVALID, DISPATCH_INVALID):
            for name, row in document.items():
                with self.subTest(name=name):
                    observed = drive(row)
                    self.assertTrue(observed, "declared invalid fixture was accepted")
                    if row.get("shape_failure"):
                        self.assertTrue(any(item.startswith("shape:") for item in observed))
                    else:
                        self.assertNotIn(True, [item.startswith("shape:") for item in observed])
                        self.assertIn(row["semantic_rule"], observed)

    def test_owner_sir_and_dispatcher_resolvers_are_required(self):
        request = VALID["delete_request_case"]["value"]["request"]
        records = VALID["delete_request_case"]["value"]["records"]
        reader = lambda ref: copy.deepcopy(records[ref])
        for kwargs, expected in (
            ({"resolve_owner_original": None, "resolve_sir_dispatch": reader, "resolve_dispatcher": reader},
             "sound_asset_resolver_missing:resolve_owner_original"),
            ({"resolve_owner_original": reader, "resolve_sir_dispatch": None, "resolve_dispatcher": reader},
             "sound_asset_resolver_missing:resolve_sir_dispatch"),
            ({"resolve_owner_original": reader, "resolve_sir_dispatch": reader, "resolve_dispatcher": None},
             "sound_asset_resolver_missing:resolve_dispatcher"),
        ):
            with self.subTest(missing=expected):
                failures = ADAPTER.request_failures(request, canon_root=ROOT, **kwargs)
                self.assertIn(expected, failures)

    def test_shape_hash_or_boolean_never_authenticates(self):
        self.assertIn("sound_asset_owner_result_digest", drive(INVALID["result_digest_tampered"]))
        self.assertIn("sound_asset_copied_ref", drive(INVALID["copied_owner_result_ref"]))
        primitive = copy.deepcopy(VALID["delete_request_case"]["value"])
        primitive["request"]["authenticated"] = True
        self.assertTrue(ADAPTER.request_failures(primitive["request"], canon_root=ROOT,
                                                 **dependencies(primitive)))

    def test_builtin_delete_refuses_without_mutation_and_never_becomes_hide_or_disable(self):
        refused = VALID["delete_result_refused_builtin"]["value"]["result"]
        self.assertEqual(refused["outcome"], "refused_builtin")
        self.assertFalse(refused["asset_mutated"])
        self.assertFalse(refused["translated_to_hide_or_disable"])
        self.assertFalse(refused["restoration_available"])
        self.assertIsNone(refused["restoration_ref"])
        self.assertIn("sound_asset_delete_mutation_truth", drive(INVALID["refusal_with_mutation"]))
        self.assertIn("sound_asset_refusal_mutation", drive(INVALID["refusal_with_restoration_claim"]))
        self.assertIn("sound_asset_refusal_identity", drive(INVALID["refusal_on_user_asset"]))
        self.assertIn("sound_asset_builtin_protected", drive(INVALID["builtin_soft_delete_claim"]))
        # A hide/disable translation claim fails the closed result shape.
        self.assertTrue(shape_refused("hide_disable_translation_claim"))
        # The pre-dispatch refusal fabricates no durable owner scope.
        predispatch = VALID["response_delete_predispatch_builtin_refusal"]["value"]
        self.assertEqual(predispatch["response"]["response_kind"], "pre_dispatch_rejection")
        for field in ("outcome", "owner_result", "resolved_outcome_ref",
                      "resolved_owner_result_ref", "projection"):
            self.assertIsNone(predispatch.get(field))

    def test_soft_delete_keeps_restoration_reference_safety_and_content(self):
        soft = VALID["delete_result_soft_deleted"]["value"]["result"]
        self.assertEqual(soft["outcome"], "soft_deleted")
        self.assertTrue(soft["asset_mutated"])
        self.assertTrue(soft["managed_content_retained"])
        self.assertTrue(soft["reference_safe"])
        self.assertTrue(soft["restoration_available"])
        self.assertIsNotNone(soft["restoration_ref"])
        self.assertIsNone(soft["substituted_asset_ref"])
        self.assertIn("sound_asset_delete_restoration_required", drive(INVALID["restoration_missing"]))
        self.assertIn("sound_asset_delete_reference_unsafe", drive(INVALID["reference_unsafe"]))
        self.assertIn("sound_asset_delete_content_not_retained", drive(INVALID["content_not_retained"]))
        self.assertIn("sound_asset_delete_mutation_truth", drive(INVALID["delete_without_mutation"]))
        self.assertIn("sound_asset_delete_asset_substitution",
                      drive(INVALID["asset_substitution_in_result"]))

    def test_current_permission_and_snapshot_drift_is_refused(self):
        self.assertIn("sound_asset_target_generation", drive(INVALID["stale_target_generation"]))
        self.assertIn("sound_asset_permission_denied", drive(INVALID["missing_mutation_authority"]))
        self.assertIn("sound_asset_asset_unavailable", drive(INVALID["asset_absent"]))
        self.assertIn("sound_asset_permission_snapshot_drift",
                      drive(INVALID["permission_snapshot_drift"]))
        self.assertIn("sound_asset_caller", drive(INVALID["wrong_caller"]))
        self.assertIn("sound_asset_original_request", drive(INVALID["wrong_original_request_binding"]))

    def test_cv333_projection_table_matches_the_actual_central_schema(self):
        self.assertEqual(ADAPTER.truth_table_agreement_failures(canon_root=ROOT), [])
        self.assertEqual(len(ADAPTER.OUTCOME_RESPONSE_TRUTH), 8)
        self.assertIn("sound_asset_acknowledgement_is_not_outcome_success",
                      drive(INVALID["acknowledgement_success_laundering"]))

    def test_responses_validate_against_the_real_central_contracts(self):
        for name, row in VALID.items():
            value = row["value"]
            if row["definition"] != "response_case":
                continue
            with self.subTest(name=name):
                self.assertEqual(ADAPTER.shape_failures(
                    "#", value["response"], canon_root=ROOT, schema_path=ADAPTER.RESPONSE_SCHEMA), [])
                if "action_request" in value:
                    self.assertEqual(value["response"]["command_id"],
                                     value["action_request"]["command_id"])
                if value["response"]["response_kind"] == "owner_operation":
                    self.assertEqual(ADAPTER.shape_failures(
                        ADAPTER.OUTCOME_POINTER, value["outcome"], canon_root=ROOT,
                        schema_path=ADAPTER.OUTCOME_SCHEMA), [])

    def test_central_rejection_carries_no_result_receipt_or_projected_owner_result(self):
        rejected = VALID["response_delete_rejected_builtin"]["value"]
        self.assertEqual(rejected["response"]["ack_status"], "rejected")
        self.assertIsNone(rejected["response"]["result_status"])
        self.assertIsNone(rejected["response"]["receipt_ref"])
        self.assertIsNone(rejected["response"]["owner_result_ref"])
        self.assertIsNotNone(rejected["outcome"]["owner_result_ref"])
        self.assertEqual(rejected["outcome"]["outcome"], "rejected")
        self.assertIsNotNone(rejected["outcome"]["error_ref"])
        self.assertIn("sound_asset_receipt_identity",
                      drive(INVALID["rejected_central_receipt_projection"]))
        # A failed owner result can never project onto a terminal success.
        self.assertIn("sound_asset_owner_result_outcome_mapping",
                      drive(INVALID["owner_failure_projected_as_success"]))
        failed = VALID["response_delete_failed_unresolved_effect"]["value"]
        self.assertEqual(failed["owner_result"]["outcome"], "failed")
        self.assertEqual(failed["outcome"]["outcome"], "failed")
        self.assertEqual(drive(VALID["response_delete_failed_unresolved_effect"]), [])
        for field in ("asset_mutated", "managed_content_retained", "reference_safe",
                      "restoration_available"):
            self.assertIsNone(failed["owner_result"][field])

    def test_unresolved_delete_outcomes_stay_unknown_and_recover(self):
        """effect_unknown/failed/unavailable never assert a verified no-effect."""
        for name, owner_outcome, central_status in (
                ("response_delete_effect_unknown_recovery", "effect_unknown", "recovery_required"),
                ("response_delete_failed_unresolved_effect", "failed", "failed")):
            case = VALID[name]["value"]
            result = case["owner_result"]
            with self.subTest(case=name):
                self.assertEqual(result["outcome"], owner_outcome)
                for field in ("asset_mutated", "managed_content_retained", "reference_safe",
                              "restoration_available", "restoration_ref"):
                    self.assertIsNone(result[field], f"{field} must stay unknown")
                self.assertEqual(case["outcome"]["outcome"],
                                 "terminal_unknown" if owner_outcome == "effect_unknown" else "failed")
                self.assertEqual(case["response"]["result_status"], central_status)
                self.assertEqual(ADAPTER.OWNER_RESULT_OUTCOME[ROUTE][owner_outcome],
                                 frozenset({"terminal_unknown" if owner_outcome == "effect_unknown"
                                            else "failed"}))
                self.assertEqual(case["outcome"]["owner_result_sha256"],
                                 ADAPTER.canonical_sha256(result))
                self.assertEqual(drive(VALID[name]), [])
        for name in ("effect_unknown_no_mutation_claim", "failed_no_mutation_claim",
                     "unavailable_no_mutation_claim"):
            with self.subTest(negative=name):
                observed = drive(INVALID[name])
                self.assertTrue(observed and not any(i.startswith("shape:") for i in observed))
                self.assertIn("sound_asset_delete_mutation_truth", observed)
                self.assertEqual(INVALID[name]["value"]["result"]["asset_mutated"], False)
        observed = drive(INVALID["effect_unknown_restoration_absence_claim"])
        self.assertTrue(observed and not any(i.startswith("shape:") for i in observed))
        self.assertIn("sound_asset_refusal_mutation", observed)
        self.assertEqual(INVALID["effect_unknown_restoration_absence_claim"]["value"]["result"]
                         ["restoration_available"], False)

    def test_replay_returns_the_original_receipt_and_operation(self):
        replay = VALID["response_delete_replayed_original_receipt"]["value"]
        self.assertTrue(replay["response"]["replayed"])
        self.assertIn("sound_asset_replay_replacement_operation",
                      drive(INVALID["replay_replacement_operation"]))

    def test_events_and_alert_state_stay_unadmitted(self):
        self.assertIn("sound_asset_event_claim", drive(INVALID["event_claim_in_response"]))
        self.assertTrue(shape_refused("event_claim_in_result"))
        self.assertTrue(shape_refused("alert_state_mutation_claim"))
        row = WIRING[ADAPTER.WIRING_ROW[ROUTE]]
        self.assertEqual(row["expected_event_types"], [])
        for key in ADAPTER.FORBIDDEN_COMPANION_KEYS:
            self.assertNotIn(f'"{key}"', json.dumps(ACTION_FIXTURES))

    def test_secret_material_stays_out_of_the_companion(self):
        self.assertIn("sound_asset_secret_material", drive(INVALID["secret_material_in_gesture_ref"]))

    def test_touch_row_stays_partial_and_the_delete_refs_are_materialized(self):
        rows = {row[3]: row for row in TOUCH["rows"]}
        profile = {item["profile_id"]: item for item in TOUCH["profiles"]}["TCP-NOTIFY-SOUND"]
        row = rows[ROUTE]
        self.assertEqual(row[4], "partial")
        self.assertEqual(row[1], "TCP-NOTIFY-SOUND")
        self.assertIn("remain implementation and verification work", row[5])
        self.assertNotIn("remain specification work", row[5])
        self.assertEqual(profile["handler_status"], "specified")
        self.assertEqual(profile["wiring_status"], "specified")
        for field, definition in GATE.ACTION_REF_DEFINITION.items():
            self.assertIn(
                f"{ROUTE} -> {ADAPTER.ACTION_SCHEMA[ROUTE]}#/$defs/{definition}", profile[field])
        for field in ("payload_schema_ref", "result_schema_ref", "error_schema_ref"):
            for action in ("cmd.sound.upload", "cmd.sound.pack.import"):
                self.assertIn(f"{action} -> Plans/sound_upload_import_action_contracts.schema.json#/$defs/",
                              profile[field])
        for action in ("cmd.sound.upload", "cmd.sound.pack.import"):
            self.assertEqual(rows[action][4], "partial")
            self.assertIn("remain implementation and verification work", rows[action][5])
            self.assertNotIn("remain specification work", rows[action][5])

    def test_touch_accounting_and_retired_spelling_are_unchanged(self):
        self.assertEqual(
            {
                "profile_count": len(TOUCH["profiles"]),
                "row_count": len(TOUCH["rows"]),
                "excluded_token_count": len(TOUCH["excluded_tokens"]),
                "alias_binding_count": len(TOUCH["alias_bindings"]),
            },
            GATE.SEALED_ACCOUNTING,
        )
        self.assertNotIn("cmd.settings.open_notifications", {row[3] for row in TOUCH["rows"]})
        self.assertNotIn("cmd.settings.open_notifications", TOUCH["alias_bindings"])
        self.assertEqual(
            {token["token"]: token["classification"] for token in TOUCH["excluded_tokens"]}
            ["cmd.settings.open_notifications"],
            "forbidden",
        )

    def test_effect_and_handler_values_join_the_production_row(self):
        row = WIRING[ADAPTER.WIRING_ROW[ROUTE]]
        expected = ADAPTER.EFFECT_VALUES[ROUTE]
        self.assertEqual(row["handler_location"], expected["handler_id"])
        self.assertEqual(row["effect_contract"]["effect_kind"], "receipt")
        self.assertEqual(row["effect_contract"]["receipt_or_event_refs"], expected["receipt_or_event_refs"])
        self.assertEqual(row["state_selector"], ADAPTER.AVAILABILITY_SELECTOR[ROUTE])
        self.assertEqual(row["disabled_reason_projection"], ADAPTER.DISABLED_REASON_SELECTOR[ROUTE])
        description = row["effect_contract"]["description"]
        self.assertIn("soft-delete", description)
        self.assertIn("Built-ins cannot be hard-deleted", description)
        self.assertIn("hide/disable behavior remains distinct", description)

    def test_owner_result_outcome_table_covers_every_declared_state(self):
        schema = json.loads((ROOT / ADAPTER.ACTION_SCHEMA[ROUTE]).read_text())
        declared = set(schema["$defs"][ADAPTER.RESULT_DEFINITION[ROUTE]]["properties"]["outcome"]["enum"])
        self.assertEqual(declared, set(ADAPTER.OWNER_RESULT_OUTCOME[ROUTE]))
        for state in declared:
            self.assertTrue(ADAPTER.OWNER_RESULT_OUTCOME[ROUTE][state])
        self.assertEqual(ADAPTER.OWNER_RESULT_OUTCOME[ROUTE]["refused_builtin"], frozenset({"rejected"}))

    def test_complete_independent_sir_tuple_rejects_self_consistent_foreign_claims(self):
        for field, foreign in (("payload_sha256", "f" * 64),
                               ("idempotency_key", "idempotency:foreign"),
                               ("target_generation", 800),
                               ("dispatch_frame_id", "dispatch-frame:foreign")):
            with self.subTest(field=field):
                def change(value):
                    value["normalized_request"][field] = foreign
                    value["outcome"][field] = foreign
                self.assertIn("sound_asset_original_sir_" + field,
                              response_case("response_delete_succeeded_soft_deleted", change))
        for field, foreign in (("operation_id", "operation:foreign"), ("project_id", "project:foreign")):
            with self.subTest(field=field):
                def change(value):
                    if field == "operation_id":
                        value["normalized_request"]["operation_id"] = foreign
                        value["response"]["operation_id"] = foreign
                    for identity in (value["normalized_request"]["owner_identity"],
                                     value["outcome"]["identity"],
                                     value["response"]["owner_identity"]):
                        identity[field] = foreign
                expected = ("sound_asset_original_sir_operation_id" if field == "operation_id"
                            else "sound_asset_original_sir_owner_identity")
                self.assertIn(expected,
                              response_case("response_delete_succeeded_soft_deleted", change))

    def test_gate_reports_static_only_and_stays_green(self):
        report = GATE.validate()
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["status"], "pass")
        self.assertFalse(report["stats"]["native_proof"])
        self.assertEqual(report["stats"]["positive_cases"], len(VALID))
        self.assertEqual(report["stats"]["negative_cases"], len(INVALID))

    def test_late_owner_record_mutation_is_refused(self):
        self.assertIn("sound_asset_inputs_mutated", drive(INVALID["late_owner_record_mutation"]))


if __name__ == "__main__":
    unittest.main()
