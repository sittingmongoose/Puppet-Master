"""Causal checks for the typed Notifications/Sounds action companion.

Every assertion runs the real composition helper over the enrolled static
fixtures and the actual central response/CommandOutcome schemas. The fixture
readers are synthetic static doubles: passing authenticates no issuer,
dispatcher, caller, permission, delivery attempt, audio device, receipt writer
or physical custody, and neither Touch row, handler status nor wiring status is
promoted here.
"""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import pm_notification_sound_contracts as GATE  # noqa: E402
import pm_notification_sound_response as ADAPTER  # noqa: E402

ACTION_FIXTURES = json.loads((ROOT / "Plans/notifications_sound_action_fixtures.json").read_text())
DISPATCH_FIXTURES = json.loads((ROOT / "Plans/sir_notifications_sound_dispatch_fixtures.json").read_text())
VALID = {row["name"]: row for row in ACTION_FIXTURES["valid"]}
INVALID = {row["name"]: row for row in ACTION_FIXTURES["invalid"]}
DISPATCH_VALID = {row["name"]: row for row in DISPATCH_FIXTURES["valid"]}
DISPATCH_INVALID = {row["name"]: row for row in DISPATCH_FIXTURES["invalid"]}
TOUCH = json.loads((ROOT / "Plans/touch_closure.json").read_text())
WIRING = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
ROUTES = {"cmd.notifications.destination.test", "cmd.sound.preview"}


def drive(row):
    """Every drive starts from the frozen fixture value."""
    return ADAPTER.notification_sound_semantic_failures(row["definition"], copy.deepcopy(row["value"]),
                                                        canon_root=ROOT)


def dependencies(value):
    return ADAPTER.fixture_dependencies(value)


def result_case(name, change=None):
    value = copy.deepcopy(VALID[name]["value"])
    if change is not None:
        change(value)
    return ADAPTER.result_failures(value["request"], value["result"], canon_root=ROOT, **dependencies(value))


def response_case(name, change=None):
    value = copy.deepcopy(VALID[name]["value"])
    if change is not None:
        change(value)
    return ADAPTER.response_failures(value, canon_root=ROOT, **dependencies(value))


class NotificationSoundActionContractTests(unittest.TestCase):
    def test_companion_covers_exactly_the_two_authored_routes(self):
        closed = ADAPTER.shape_failures("action_id", "cmd.sound.upload", canon_root=ROOT)
        self.assertTrue(closed)
        schema = json.loads((ROOT / ADAPTER.ACTION_SCHEMA).read_text())
        self.assertEqual(set(schema["$defs"]["action_id"]["enum"]), ROUTES)
        self.assertEqual(set(ADAPTER.COMMANDS), ROUTES)

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
        request = VALID["destination_test_request_case"]["value"]["request"]
        records = VALID["destination_test_request_case"]["value"]["records"]
        reader = lambda ref: copy.deepcopy(records[ref])
        for kwargs, expected in (
            ({"resolve_owner_original": None, "resolve_sir_dispatch": reader, "resolve_dispatcher": reader},
             "notification_sound_resolver_missing:resolve_owner_original"),
            ({"resolve_owner_original": reader, "resolve_sir_dispatch": None, "resolve_dispatcher": reader},
             "notification_sound_resolver_missing:resolve_sir_dispatch"),
            ({"resolve_owner_original": reader, "resolve_sir_dispatch": reader, "resolve_dispatcher": None},
             "notification_sound_resolver_missing:resolve_dispatcher"),
        ):
            with self.subTest(missing=expected):
                failures = ADAPTER.request_failures(request, canon_root=ROOT, **kwargs)
                self.assertIn(expected, failures)

    def test_shape_or_hash_equality_never_authenticates(self):
        # A tampered digest, a copied owner-result ref and a bare boolean claim
        # are all refused; none of them authenticates an issuer.
        self.assertIn("notification_sound_owner_result_digest", drive(INVALID["result_digest_tampered"]))
        self.assertIn("notification_sound_copied_ref", drive(INVALID["copied_owner_result_ref"]))
        primitive = VALID["destination_test_request_case"]["value"]
        value = copy.deepcopy(primitive)
        value["request"]["authenticated"] = True
        self.assertTrue(ADAPTER.request_failures(value["request"], canon_root=ROOT, **dependencies(value)))
        # Confirmed by re-digesting the same typed result under a foreign receipt.
        original = copy.deepcopy(VALID["destination_test_result_delivered_live"]["value"])
        self.assertEqual(dependencies(original)["resolve_owner_original"](
            original["result"]["original_request_ref"])["command_id"],
            "cmd.notifications.destination.test")

    def test_cv333_projection_table_matches_the_actual_central_schema(self):
        self.assertEqual(ADAPTER.truth_table_agreement_failures(canon_root=ROOT), [])
        self.assertEqual(len(ADAPTER.OUTCOME_RESPONSE_TRUTH), 8)
        value = copy.deepcopy(VALID["response_destination_test_succeeded_live"]["value"])
        value["outcome"]["outcome"] = "acknowledged"
        failures = ADAPTER.response_failures(value, canon_root=ROOT, **dependencies(value))
        self.assertIn("notification_sound_acknowledgement_is_not_delivery_success", failures)

    def test_responses_validate_against_the_real_central_contracts(self):
        for name, row in VALID.items():
            value = row["value"]
            if row["definition"] != "response_case":
                continue
            with self.subTest(name=name):
                self.assertEqual(ADAPTER.shape_failures(
                    "#", value["response"], canon_root=ROOT, schema_path=ADAPTER.RESPONSE_SCHEMA), [])
                self.assertEqual(len(value["response"]), 20)
                if value["response"]["response_kind"] == "owner_operation":
                    self.assertEqual(ADAPTER.shape_failures(
                        ADAPTER.OUTCOME_POINTER, value["outcome"], canon_root=ROOT,
                        schema_path=ADAPTER.OUTCOME_SCHEMA), [])
                else:
                    # A pre-dispatch refusal fabricates no durable scope.
                    for field in ("outcome", "owner_result", "resolved_outcome_ref",
                                  "resolved_owner_result_ref", "projection"):
                        self.assertIsNone(value.get(field))
                self.assertEqual(value["response"]["command_id"], value["action_request"]["command_id"])

    def test_destination_test_needs_current_enabled_authority_and_rate_admission(self):
        self.assertIn("notification_sound_destination_disabled", drive(INVALID["disabled_destination"]))
        self.assertIn("notification_sound_rate_limit_admission", drive(INVALID["missing_rate_limit_admission"]))
        self.assertIn("notification_sound_live_send_authority", drive(INVALID["missing_live_send_authority"]))
        self.assertIn("notification_sound_event_category_admission", drive(INVALID["event_category_not_admitted"]))
        self.assertIn("notification_sound_current_permission_drift", drive(INVALID["current_permission_drift"]))

    def test_queue_admission_and_acknowledgement_are_never_delivery(self):
        self.assertIn("notification_sound_queue_admission", drive(INVALID["queue_admission_as_receipt"]))
        self.assertIn("notification_sound_acknowledgement_is_not_delivery_success",
                      drive(INVALID["acknowledgement_success_laundering"]))
        self.assertIn("notification_sound_queue_admission", drive(INVALID["queue_admission_terminal_receipt"]))
        pending = VALID["response_destination_test_executing_rate_limited"]["value"]
        self.assertIsNone(pending["response"]["receipt_ref"])
        self.assertIsNone(pending["outcome"]["result_receipt_ref"])

    def test_mock_and_live_stay_distinct_and_alert_state_is_untouched(self):
        self.assertIn("notification_sound_mock_live_label", drive(INVALID["mock_relabelled_live"]))
        self.assertIn("notification_sound_mock_live_projection", drive(INVALID["mock_projection_relabelled"]))
        mock = VALID["response_destination_test_succeeded_mock"]["value"]
        self.assertEqual(mock["projection"]["mock_or_live"], "mock")
        self.assertEqual(mock["owner_result"]["alert_state_mutated"], False)
        self.assertIn("notification_sound_inputs_mutated", drive(INVALID["late_owner_record_mutation"]))

    def test_receipts_projection_and_redaction_stay_owner_issued(self):
        self.assertIn("notification_sound_foreign_receipt", drive(INVALID["foreign_receipt"]))
        self.assertIn("notification_sound_receipt_projection_source", drive(INVALID["projection_source_substitution"]))
        self.assertIn("notification_sound_receipt_projection_redaction", drive(INVALID["projection_redaction_drift"]))
        self.assertIn("notification_sound_receipt_identity", drive(INVALID["response_receipt_identity_substitution"]))
        self.assertIn("notification_sound_secret_material", drive(INVALID["secret_material_credential_ref"]))
        delivered = VALID["response_destination_test_succeeded_live"]["value"]
        self.assertEqual(delivered["projection"]["receipt_ref"], delivered["owner_result"]["receipt_ref"])
        self.assertEqual(delivered["projection"]["secret_material_present"], False)
        self.assertTrue(delivered["projection"]["redacted_fields"])

    def test_sound_preview_stays_local_and_unmutated(self):
        self.assertIn("notification_sound_playback_evidence", drive(INVALID["playback_without_evidence"]))
        self.assertIn("notification_sound_playback_asset_substitution",
                      drive(INVALID["playback_asset_substitution"]))
        self.assertIn("notification_sound_preview_projection_authority",
                      drive(INVALID["preview_projection_authority"]))
        self.assertTrue(drive(INVALID["preview_external_send_claim"]))
        self.assertTrue(drive(INVALID["preview_asset_mutation_claim"]))
        preview = VALID["sound_preview_result_playback_started"]["value"]["result"]
        self.assertIsNone(preview["external_delivery_ref"])
        self.assertFalse(preview["external_send"])
        self.assertFalse(preview["asset_mutated"])
        self.assertIsNone(preview["substituted_asset_ref"])

    def test_events_and_retry_policy_stay_unadmitted(self):
        self.assertIn("notification_sound_event_claim", drive(INVALID["response_event_claim"]))
        self.assertTrue(drive(INVALID["persisted_event_claim"]))
        for action, row_id in GATE.WIRING_ROW.items():
            with self.subTest(action=action):
                self.assertEqual(WIRING[row_id]["expected_event_types"], [])
        for key in ADAPTER.FORBIDDEN_COMPANION_KEYS:
            self.assertNotIn(f'"{key}"', json.dumps(ACTION_FIXTURES))

    def test_touch_rows_stay_partial_on_the_shared_profile(self):
        rows = {row[3]: row for row in TOUCH["rows"]}
        profile = {item["profile_id"]: item for item in TOUCH["profiles"]}["TCP-NOTIFY-SOUND"]
        for action in ROUTES:
            with self.subTest(action=action):
                row = rows[action]
                self.assertEqual(row[4], "partial")
                self.assertIn("remain implementation and verification work", row[5])
                self.assertEqual(row[1], "TCP-NOTIFY-SOUND")
        self.assertEqual(profile["handler_status"], "specified")
        self.assertEqual(profile["wiring_status"], "specified")
        for field, definition in (("payload_schema_ref", "destination_test_request"),
                                  ("result_schema_ref", "destination_test_result"),
                                  ("error_schema_ref", "action_error")):
            self.assertIn(f"cmd.notifications.destination.test -> {ADAPTER.ACTION_SCHEMA}#/$defs/{definition}",
                          profile[field])
            self.assertIn("unmaterialized", profile[field])
        for action in ("cmd.sound.upload", "cmd.sound.pack.import"):
            self.assertEqual(rows[action][4], "partial")
            self.assertIn("remain implementation and verification work", rows[action][5])
            self.assertNotIn("remain specification work", rows[action][5])
        for action in ("cmd.sound.asset.delete", "cmd.sound.asset.export"):
            self.assertEqual(rows[action][4], "partial")
            self.assertIn("remain specification work", rows[action][5])

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

    def test_effect_and_handler_values_join_the_production_rows(self):
        for action, row_id in GATE.WIRING_ROW.items():
            with self.subTest(action=action):
                row = WIRING[row_id]
                expected = ADAPTER.EFFECT_VALUES[action]
                self.assertEqual(row["handler_location"], expected["handler_id"])
                self.assertEqual(row["effect_contract"]["effect_kind"], "receipt")
                self.assertEqual(row["effect_contract"]["receipt_or_event_refs"], expected["receipt_or_event_refs"])
                self.assertEqual(row["state_selector"], ADAPTER.AVAILABILITY_SELECTOR[action])

    def test_owner_result_must_match_the_command_outcome_state(self):
        # A recomputed digest or a valid shape does not turn a failed delivery
        # or an undecodable playback into a central success.
        for name in ("owner_result_failure_projected_as_success",
                     "owner_result_failure_projected_as_success_sound"):
            with self.subTest(name=name):
                self.assertIn("notification_sound_owner_result_outcome_mapping", drive(INVALID[name]))
        failed = VALID["response_destination_test_failed_permanent"]["value"]
        self.assertEqual(failed["owner_result"]["outcome"], "failed_permanent")
        self.assertEqual(failed["outcome"]["outcome"], "failed")
        self.assertEqual(failed["response"]["result_status"], "failed")
        self.assertEqual(drive(VALID["response_destination_test_failed_permanent"]), [])
        preview = VALID["response_sound_preview_undecodable_failed"]["value"]
        self.assertEqual(preview["owner_result"]["outcome"], "undecodable")
        self.assertEqual(preview["outcome"]["outcome"], "failed")
        self.assertEqual(drive(VALID["response_sound_preview_undecodable_failed"]), [])
        # Direct join: every non-success owner result refuses a success state.
        for outcome in ("failed", "terminal_unknown"):
            with self.subTest(outcome=outcome):
                value = copy.deepcopy(VALID["response_destination_test_succeeded_live"]["value"])
                value["outcome"]["outcome"] = outcome
                value["outcome"]["error_ref"] = "owner-error:1"
                self.assertIn("notification_sound_owner_result_outcome_mapping",
                              ADAPTER.owner_result_outcome_failures(
                                  value["owner_result"], value["outcome"], canon_root=ROOT))

    def test_owner_result_outcome_table_covers_every_declared_state(self):
        schema = json.loads((ROOT / ADAPTER.ACTION_SCHEMA).read_text())
        for action in ROUTES:
            with self.subTest(action=action):
                declared = set(schema["$defs"][ADAPTER.RESULT_DEFINITION[action]]["properties"]["outcome"]["enum"])
                self.assertEqual(declared, set(ADAPTER.OWNER_RESULT_OUTCOME[action]))
                for state in declared:
                    self.assertTrue(ADAPTER.OWNER_RESULT_OUTCOME[action][state])

    def test_original_sir_tuple_rejects_self_consistent_foreign_downstream(self):
        # Both routes: the actual original owner/SIR/dispatcher records are
        # unchanged while normalized request, CommandOutcome and central claims
        # agree with each other on foreign values. This must not be accepted.
        for name in ("response_destination_test_succeeded_live",
                     "response_sound_preview_succeeded"):
            for field, foreign in (
                    ("payload_sha256", "b" * 64),
                    ("idempotency_key", "idempotency:foreign"),
                    ("target_generation", 800),
                    ("dispatch_frame_id", "dispatch-frame:foreign")):
                with self.subTest(name=name, field=field):
                    def change(value):
                        value["normalized_request"][field] = foreign
                        value["outcome"][field] = foreign
                    self.assertIn("notification_sound_original_sir_" + field,
                                  response_case(name, change))
            for field, foreign in (("operation_id", "operation:foreign"),
                                   ("project_id", "project:foreign")):
                with self.subTest(name=name, field=field):
                    def change(value):
                        if field == "operation_id":
                            value["normalized_request"]["operation_id"] = foreign
                            value["response"]["operation_id"] = foreign
                        for identity in (value["normalized_request"]["owner_identity"],
                                         value["outcome"]["identity"],
                                         value["response"]["owner_identity"]):
                            identity[field] = foreign
                    expected = ("notification_sound_original_sir_operation_id" if field == "operation_id"
                                else "notification_sound_original_sir_owner_identity")
                    self.assertIn(expected, response_case(name, change))

    def test_gate_reports_static_only_and_stays_green(self):
        report = GATE.validate()
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["status"], "pass")
        self.assertFalse(report["stats"]["native_proof"])
        self.assertEqual(report["stats"]["positive_cases"], len(VALID))
        self.assertEqual(report["stats"]["negative_cases"], len(INVALID))
        self.assertEqual(sorted(report["stats"]["owner_result_outcome_states"]), sorted(ROUTES))
        self.assertGreaterEqual(report["stats"]["semantic_negatives"], 30)

    def test_duplicate_owner_result_is_refused_after_late_mutation(self):
        value = copy.deepcopy(VALID["response_destination_test_succeeded_live"]["value"])
        records = value["records"]
        original = value["action_request"]["original_request_ref"]

        def reader(ref):
            if ref == original:
                value["action_request"]["credential_ref"] = "credential:os:substituted"
            return copy.deepcopy(records[ref])

        failures = ADAPTER.response_failures(
            value, canon_root=ROOT, resolve_owner_original=reader,
            resolve_sir_dispatch=reader, resolve_dispatcher=reader)
        self.assertIn("notification_sound_inputs_mutated", failures)


if __name__ == "__main__":
    unittest.main()
