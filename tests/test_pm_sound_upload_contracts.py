"""Causal checks for the typed sound upload action companion.

Every assertion runs the real composition helper over the enrolled static
fixtures and the actual central response/CommandOutcome schemas. The fixture
readers are synthetic static doubles: passing authenticates no issuer,
dispatcher, caller, FileSafe decision, permission, decoder, writer, managed
asset or physical custody, and neither Touch row, handler status nor wiring
status is promoted here.
"""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import pm_sound_upload_import_contracts as GATE  # noqa: E402
import pm_sound_upload_import_response as ADAPTER  # noqa: E402

ACTION_FIXTURES = json.loads(
    (ROOT / "Plans/sound_upload_import_action_fixtures.json").read_text())
DISPATCH_FIXTURES = json.loads(
    (ROOT / "Plans/sir_sound_upload_import_dispatch_fixtures.json").read_text())
VALID = {row["name"]: row for row in ACTION_FIXTURES["valid"]}
INVALID = {row["name"]: row for row in ACTION_FIXTURES["invalid"]}
DISPATCH_VALID = {row["name"]: row for row in DISPATCH_FIXTURES["valid"]}
DISPATCH_INVALID = {row["name"]: row for row in DISPATCH_FIXTURES["invalid"]}
UPLOAD = "cmd.sound.upload"
FOREIGN_ROUTES = {
    "cmd.notifications.destination.test",
    "cmd.sound.preview",
    "cmd.sound.asset.delete",
    "cmd.sound.asset.export",
    "cmd.settings.open_notifications",
}


def drive(row):
    """Every drive starts from the frozen fixture value."""
    return ADAPTER.sound_upload_import_semantic_failures(row["definition"], copy.deepcopy(row["value"]),
                                                        canon_root=ROOT)


def dependencies(value):
    return ADAPTER.fixture_dependencies(value)


def result_case(name, change=None):
    value = copy.deepcopy(VALID[name]["value"])
    if change is not None:
        change(value)
    return ADAPTER.result_failures(value["request"], value["result"], canon_root=ROOT,
                                   **dependencies(value))


def response_case(name, change=None):
    value = copy.deepcopy(VALID[name]["value"])
    if change is not None:
        change(value)
    return ADAPTER.response_failures(value, canon_root=ROOT, **dependencies(value))


def upload_rows(document):
    return {name: row for name, row in document.items() if row.get("route") == UPLOAD}


class SoundUploadActionContractTests(unittest.TestCase):
    def test_companion_binds_exactly_the_two_sound_intake_routes(self):
        schema = json.loads((ROOT / ADAPTER.ACTION_SCHEMA).read_text())
        self.assertEqual(set(schema["$defs"]["action_id"]["enum"]), set(ADAPTER.COMMANDS))
        for foreign in FOREIGN_ROUTES:
            with self.subTest(route=foreign):
                self.assertTrue(ADAPTER.shape_failures("action_id", foreign, canon_root=ROOT))

    def test_every_declared_upload_fixture_drives_as_declared(self):
        for document in (upload_rows(VALID), upload_rows(DISPATCH_VALID)):
            for name, row in document.items():
                with self.subTest(name=name):
                    self.assertEqual(drive(row), [])
        for document in (upload_rows(INVALID), upload_rows(DISPATCH_INVALID)):
            for name, row in document.items():
                with self.subTest(name=name):
                    observed = drive(row)
                    self.assertTrue(observed, "declared invalid fixture was accepted")
                    if row.get("shape_failure"):
                        self.assertTrue(any(item.startswith("shape:") for item in observed))
                    else:
                        self.assertNotIn(True, [item.startswith("shape:") for item in observed])
                        self.assertIn(row["semantic_rule"], observed)

    def test_every_upload_row_declares_the_upload_route(self):
        rows = list(upload_rows(VALID).items()) + list(upload_rows(INVALID).items()) + list(
            upload_rows(DISPATCH_VALID).items()) + list(upload_rows(DISPATCH_INVALID).items())
        self.assertTrue(rows)
        for name, row in rows:
            with self.subTest(name=name):
                self.assertEqual(row["route"], UPLOAD)
                self.assertTrue(row["name"])

    def test_declared_owner_limits_are_the_existing_sp222_values(self):
        self.assertEqual(ADAPTER.owner_limits(canon_root=ROOT), GATE.OWNER_LIMITS)
        schema = json.loads((ROOT / ADAPTER.ACTION_SCHEMA).read_text())
        definition = schema["$defs"]["owner_limits"]["properties"]
        for key, value in GATE.OWNER_LIMITS.items():
            with self.subTest(key=key):
                self.assertEqual(definition[key]["const"], value)
        self.assertIn("sound_upload_import_source_size_limit", drive(INVALID["declared_source_too_large"]))
        self.assertIn("sound_upload_import_decoded_duration_limit",
                      drive(INVALID["upload_result_duration_limit_contradiction"]))

    def test_duration_warning_tracks_the_owner_three_second_rule(self):
        self.assertIn("sound_upload_import_duration_warning",
                      drive(INVALID["upload_result_duration_warning_drift"]))

        def lower_to_exact_threshold(value):
            value["result"]["duration_ms"] = GATE.OWNER_LIMITS["duration_warning_ms"]
            value["result"]["manifest"]["duration_ms"] = GATE.OWNER_LIMITS["duration_warning_ms"]
            value["records"][value["request"]["original_request_ref"]]["decoded_duration_ms"] = (
                GATE.OWNER_LIMITS["duration_warning_ms"])
            value["result"]["duration_warning"] = False

        self.assertEqual(result_case("sound_upload_result_stored", lower_to_exact_threshold), [])

        def warn_above_threshold(value):
            lower_to_exact_threshold(value)
            value["result"]["duration_warning"] = True

        self.assertIn("sound_upload_import_duration_warning",
                      result_case("sound_upload_result_stored", warn_above_threshold))

    def test_admission_facts_are_required_before_dispatch(self):
        for name in ("file_safe_refused", "missing_write_admission", "source_missing_at_admission",
                     "path_not_admitted_at_admission"):
            with self.subTest(name=name):
                self.assertIn(INVALID[name]["semantic_rule"], drive(INVALID[name]))

    def test_upload_outcomes_agree_with_the_admitted_source_facts(self):
        for name in ("upload_result_size_limit_contradiction", "upload_result_decode_agreement",
                     "upload_result_format_agreement", "upload_result_unknown_effect_success_claim"):
            with self.subTest(name=name):
                self.assertIn(INVALID[name]["semantic_rule"], drive(INVALID[name]))
        for name in ("sound_upload_result_stored", "sound_upload_result_duplicate_linked",
                     "sound_upload_result_rejected_unsupported_format",
                     "sound_upload_result_rejected_decode_failure",
                     "sound_upload_result_rejected_source_too_large",
                     "sound_upload_result_rejected_duration_too_long"):
            with self.subTest(name=name):
                result = VALID[name]["value"]["result"]
                if str(result["outcome"]).startswith("rejected_"):
                    self.assertIsNone(result["asset_ref"])
                    self.assertIsNone(result["manifest"])
                    self.assertIsNone(result["content_sha256"])
                    self.assertTrue(result["rejection_reason"])
        self.assertEqual(VALID["sound_upload_result_stored"]["value"]["result"]["normalization_applied"], True)
        self.assertIn("sound_upload_import_manifest_normalization",
                      drive(INVALID["upload_result_missing_normalization"]))
        self.assertIn("sound_upload_import_silence_trim", drive(INVALID["upload_result_missing_silence_trim"]))

    def test_mixed_independent_upload_faults_settle_on_one_applicable_reason(self):
        """SP-222 names no first-error precedence among its independent limits."""
        cases = (
            ("sound_upload_result_rejected_source_too_large_and_duration_too_long",
             "rejected_source_too_large", True, False),
            ("sound_upload_result_rejected_duration_too_long_with_source_too_large",
             "rejected_duration_too_long", True, False),
            ("sound_upload_result_rejected_source_too_large_and_decode_failure",
             "rejected_source_too_large", False, True),
            ("sound_upload_result_rejected_decode_failure_with_source_too_large",
             "rejected_decode_failure", False, True),
        )
        for name, outcome, duration_over, decode_over in cases:
            with self.subTest(name=name):
                value = VALID[name]["value"]
                original = value["records"][value["request"]["original_request_ref"]]
                self.assertGreater(original["measured_source_bytes"],
                                   GATE.OWNER_LIMITS["source_size_limit_bytes"])
                self.assertEqual(original["decoded_duration_ms"]
                                 > GATE.OWNER_LIMITS["decoded_duration_limit_ms"], duration_over)
                self.assertEqual(original["header_format"] != original["decoded_format"], decode_over)
                self.assertEqual(value["result"]["outcome"], outcome)
                self.assertEqual(drive(VALID[name]), [])
        # Single-fault rows keep their exact behavior.
        self.assertEqual(drive(VALID["sound_upload_result_rejected_source_too_large"]), [])
        self.assertIn("sound_upload_import_source_size_limit",
                      drive(INVALID["upload_result_size_limit_contradiction"]))
        # The same mixed facts cannot produce success or a false rejection reason.
        success_claim = drive(INVALID["upload_mixed_limits_success_claim"])
        self.assertIn("sound_upload_import_source_size_limit", success_claim)
        self.assertIn("sound_upload_import_decoded_duration_limit", success_claim)
        self.assertIn("sound_upload_import_decoded_duration_limit",
                      drive(INVALID["upload_mixed_faults_false_reason_claim"]))
        # ... and the mixed-fault owner result still settles through the central
        # response / CommandOutcome join on the one truthful reason it selected.
        def over_the_decoded_cap(value):
            original = value["records"][value["action_request"]["original_request_ref"]]
            original["decoded_duration_ms"] = GATE.OWNER_LIMITS["decoded_duration_limit_ms"] + 1

        self.assertEqual(response_case("response_sound_upload_rejected_source_too_large",
                                       over_the_decoded_cap), [])
        # A result whose independent decode and format evidence both disagree may
        # settle on either existing reason; the reason whose own fact is absent
        # stays refused.
        for outcome in ("rejected_decode_failure", "rejected_unsupported_format"):
            with self.subTest(outcome=outcome):
                def claim_outcome(value, outcome=outcome):
                    value["result"]["outcome"] = outcome

                self.assertEqual(result_case("sound_upload_result_rejected_decode_failure",
                                             claim_outcome), [])

        def claim_decode_failure(value):
            value["result"]["outcome"] = "rejected_decode_failure"

        self.assertIn("sound_upload_import_header_decode_agreement",
                      result_case("sound_upload_result_rejected_unsupported_format", claim_decode_failure))

    def test_rejections_and_unknown_effects_never_mint_an_asset(self):
        self.assertTrue(drive(INVALID["upload_result_asset_claim_on_rejection"]))
        unknown = VALID["sound_upload_result_effect_unknown"]["value"]["result"]
        self.assertIsNone(unknown["manifest"])
        self.assertIsNone(unknown["duplicate_of_asset_ref"])
        self.assertEqual(unknown["persisted_event_refs"], [])

    def test_duplicate_content_links_a_retained_managed_asset(self):
        result = VALID["sound_upload_result_duplicate_linked"]["value"]["result"]
        self.assertEqual(result["outcome"], "duplicate_linked")
        self.assertEqual(result["asset_ref"], result["duplicate_of_asset_ref"])
        self.assertEqual(result["duplicate_of_content_sha256"], result["content_sha256"])
        self.assertEqual(result["manifest"]["sha256"], result["content_sha256"])
        self.assertIn("sound_upload_import_duplicate_asset_link",
                      drive(INVALID["upload_result_duplicate_as_new_asset"]))
        self.assertEqual(VALID["sound_upload_result_duplicate_linked"]["value"]["result"][
            "raw_audio_body_embedded"], False)

    def test_receipts_carry_no_secret_material_and_no_private_path(self):
        for name in ("secret_material_in_source_ref", "hidden_private_path_in_receipt",
                     "raw_audio_body_field", "private_path_field", "upload_result_raw_body_claim",
                     "upload_result_private_path_claim"):
            with self.subTest(name=name):
                self.assertTrue(drive(INVALID[name]), "a secret or private path was accepted")
        for name in ("sound_upload_request_case", "sound_upload_result_stored",
                     "response_sound_upload_succeeded"):
            with self.subTest(name=name):
                self.assertEqual(ADAPTER._secret_material_failures(VALID[name]["value"]), [])  # noqa: SLF001

    def test_events_alert_state_and_mapping_replacements_stay_unadmitted(self):
        for name in ("upload_result_events_claim", "upload_result_alert_state_claim"):
            with self.subTest(name=name):
                self.assertTrue(drive(INVALID[name]))
        self.assertEqual(VALID["sound_upload_result_stored"]["value"]["result"]["persisted_event_refs"], [])
        self.assertEqual(ADAPTER.EFFECT_VALUES[UPLOAD]["expected_event_types"], [])
        binding = VALID["sound_upload_effect_binding"]["value"]
        self.assertEqual(binding["effect_kind"], "receipt")
        self.assertEqual(binding["receipt_or_event_refs"], ["cmd.sound.upload.dispatch_receipt"])
        self.assertIsNone(binding["projection_owner_ref"])
        self.assertEqual(binding["alert_state_mutation_authorized"], False)

    def test_production_intent_row_joins_the_companion_values(self):
        wiring = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
        row = wiring[GATE.WIRING_ROW[UPLOAD]]
        expected = ADAPTER.EFFECT_VALUES[UPLOAD]
        self.assertEqual(row["handler_location"], expected["handler_id"])
        self.assertEqual(row["handler_location"], "handlers::sound::upload")
        self.assertEqual(row["state_selector"], ADAPTER.AVAILABILITY_SELECTOR[UPLOAD])
        self.assertEqual(row["disabled_reason_projection"], ADAPTER.DISABLED_REASON_SELECTOR[UPLOAD])
        self.assertEqual(row["expected_event_types"], [])
        self.assertEqual(row["effect_contract"]["receipt_or_event_refs"], expected["receipt_or_event_refs"])

    def test_owner_sir_and_dispatcher_resolvers_are_required(self):
        request = VALID["sound_upload_request_case"]["value"]["request"]
        records = VALID["sound_upload_request_case"]["value"]["records"]
        reader = lambda ref: copy.deepcopy(records[ref])
        for kwargs, expected in (
            ({"resolve_owner_original": None, "resolve_sir_dispatch": reader, "resolve_dispatcher": reader},
             "sound_upload_import_resolver_missing:resolve_owner_original"),
            ({"resolve_owner_original": reader, "resolve_sir_dispatch": None, "resolve_dispatcher": reader},
             "sound_upload_import_resolver_missing:resolve_sir_dispatch"),
            ({"resolve_owner_original": reader, "resolve_sir_dispatch": reader, "resolve_dispatcher": None},
             "sound_upload_import_resolver_missing:resolve_dispatcher"),
        ):
            with self.subTest(missing=expected):
                self.assertIn(expected, ADAPTER.request_failures(request, canon_root=ROOT, **kwargs))

    def test_shape_valid_booleans_and_copied_refs_never_authenticate(self):
        self.assertTrue(drive(INVALID["boolean_authentication_claim"]))
        self.assertIn("sound_upload_import_copied_ref", drive(INVALID["copied_owner_result_ref"]))
        self.assertIn("sound_upload_import_owner_result_digest",
                      drive(INVALID["owner_result_digest_tampered"]))
        # A boolean claim and a copied digest are not FileSafe authentication: the
        # refusal follows the substituted decision reference, not the boolean.
        value = copy.deepcopy(VALID["sound_upload_request_case"]["value"])
        original = value["records"][value["request"]["original_request_ref"]]
        original["path_admitted"] = True
        original["permission_basis"]["file_safe_decision"] = "admitted"
        original["file_safe_admission_ref"] = "file-safe-decision:sound-upload:substituted"
        self.assertIn("sound_upload_import_file_safe_decision_ref",
                      ADAPTER.request_failures(value["request"], canon_root=ROOT, **dependencies(value)))

    def test_owner_result_to_command_outcome_truth(self):
        self.assertEqual(ADAPTER.truth_table_agreement_failures(canon_root=ROOT), [])
        succeeded = VALID["response_sound_upload_succeeded"]["value"]
        self.assertEqual(succeeded["response"]["result_status"], "succeeded")
        self.assertEqual(succeeded["outcome"]["outcome"], "succeeded")
        rejected = VALID["response_sound_upload_rejected_source_too_large"]["value"]
        self.assertEqual(rejected["owner_result"]["outcome"], "rejected_source_too_large")
        self.assertEqual(rejected["outcome"]["outcome"], "failed")
        self.assertEqual(rejected["response"]["result_status"], "failed")
        self.assertEqual(drive(VALID["response_sound_upload_rejected_source_too_large"]), [])
        recovery = VALID["response_sound_upload_effect_unknown_recovery"]["value"]
        self.assertEqual(recovery["outcome"]["outcome"], "terminal_unknown")
        self.assertEqual(recovery["response"]["result_status"], "recovery_required")
        self.assertEqual(drive(VALID["response_sound_upload_effect_unknown_recovery"]), [])
        self.assertIn("sound_upload_import_owner_result_outcome_mapping",
                      drive(INVALID["owner_result_failure_projected_as_success_upload"]))
        self.assertIn("sound_upload_import_acknowledgement_is_not_intake_success",
                      drive(INVALID["acknowledgement_success_laundering"]))
        for state, allowed in ADAPTER.OWNER_RESULT_OUTCOME[UPLOAD].items():
            with self.subTest(state=state):
                self.assertTrue(allowed)

    def test_owner_result_outcome_table_covers_every_declared_state(self):
        schema = json.loads((ROOT / ADAPTER.ACTION_SCHEMA).read_text())
        declared = set(schema["$defs"][ADAPTER.RESULT_DEFINITION[UPLOAD]]["properties"]["outcome"]["enum"])
        self.assertEqual(declared, set(ADAPTER.OWNER_RESULT_OUTCOME[UPLOAD]))

    def test_responses_validate_against_the_real_central_contracts(self):
        for name, row in VALID.items():
            if row["definition"] != "response_case" or row.get("route") != UPLOAD:
                continue
            value = row["value"]
            with self.subTest(name=name):
                self.assertEqual(ADAPTER.shape_failures("#", value["response"], canon_root=ROOT,
                                                       schema_path=ADAPTER.RESPONSE_SCHEMA), [])
                self.assertEqual(len(value["response"]), 20)
                if value["response"]["response_kind"] == "owner_operation":
                    self.assertEqual(ADAPTER.shape_failures(ADAPTER.OUTCOME_POINTER, value["outcome"],
                                                           canon_root=ROOT,
                                                           schema_path=ADAPTER.OUTCOME_SCHEMA), [])
                else:
                    for field in ("outcome", "owner_result", "resolved_outcome_ref",
                                  "resolved_owner_result_ref", "projection"):
                        self.assertIsNone(value.get(field))
                    self.assertEqual(value["response"]["error"]["code"], value["action_error"]["code"])
                self.assertEqual(value["response"]["command_id"], value["action_request"]["command_id"])

    def test_local_projection_and_foreign_receipts_are_refused(self):
        self.assertIn("sound_upload_import_local_projection_substitute",
                      drive(INVALID["local_projection_substitute"]))
        self.assertIn("sound_upload_import_receipt_identity",
                      drive(INVALID["response_receipt_identity_substitution"]))
        self.assertIn("sound_upload_import_replay_receipt_changed", drive(INVALID["replay_receipt_changed"]))
        self.assertIn("sound_upload_import_error_phase", drive(INVALID["error_phase_drift"]))
        self.assertIn("sound_upload_import_projection_authority",
                      drive(INVALID["upload_projection_authority"]))

    def test_original_sir_tuple_rejects_self_consistent_foreign_downstream(self):
        name = "response_sound_upload_succeeded"
        for field, foreign in (("payload_sha256", "b" * 64),
                               ("idempotency_key", "idempotency:foreign"),
                               ("target_generation", 800),
                               ("dispatch_frame_id", "dispatch-frame:foreign")):
            with self.subTest(field=field):
                def change(value, field=field, foreign=foreign):
                    value["normalized_request"][field] = foreign
                    value["outcome"][field] = foreign

                self.assertIn("sound_upload_import_original_sir_" + field, response_case(name, change))
        for fixture in ("foreign_original_sir_payload_sha256_upload",
                        "foreign_original_sir_target_generation_upload",
                        "foreign_original_sir_operation_id_upload"):
            with self.subTest(fixture=fixture):
                self.assertIn(INVALID[fixture]["semantic_rule"], drive(INVALID[fixture]))

    def test_original_records_are_pinned_against_late_resolver_mutation(self):
        self.assertIn("sound_upload_import_inputs_mutated", drive(INVALID["late_owner_record_mutation"]))
        value = copy.deepcopy(VALID["response_sound_upload_succeeded"]["value"])
        original = value["action_request"]["original_request_ref"]

        def reader(ref):
            if ref == original:
                value["action_request"]["display_name"] = "Mutated after resolution"
            return copy.deepcopy(value["records"][ref])

        failures = ADAPTER.response_failures(value, canon_root=ROOT, resolve_owner_original=reader,
                                             resolve_sir_dispatch=reader, resolve_dispatcher=reader)
        self.assertIn("sound_upload_import_inputs_mutated", failures)

    def test_availability_and_error_projections_use_the_production_selectors(self):
        for name in ("availability_sound_upload_available", "availability_sound_upload_disabled_handler_unavailable"):
            with self.subTest(name=name):
                availability = VALID[name]["value"]["availability"]
                self.assertEqual(availability["availability_selector"], ADAPTER.AVAILABILITY_SELECTOR[UPLOAD])
                self.assertEqual(availability["disabled_reason_selector"],
                                 ADAPTER.DISABLED_REASON_SELECTOR[UPLOAD])
                self.assertEqual(drive(VALID[name]), [])
        stale = copy.deepcopy(VALID["availability_sound_upload_available"]["value"]["availability"])
        stale["currentness"]["observed_generation"] = stale["currentness"]["target_generation"] - 1
        stale["currentness"]["stale"] = True
        error = copy.deepcopy(VALID["sound_upload_error_unsupported_format"]["value"]["error"])
        error["availability_reason"] = None
        response_error = {"code": error["code"], "reason": error["reason"],
                          "offending_field": error["offending_field"]}
        self.assertIn("sound_upload_import_currentness_error",
                      ADAPTER.error_failures(error, availability=stale, response_error=response_error,
                                             canon_root=ROOT))
        error["code"] = "stale_projection"
        response_error["code"] = "stale_projection"
        self.assertNotIn("sound_upload_import_currentness_error",
                         ADAPTER.error_failures(error, availability=stale, response_error=response_error,
                                                canon_root=ROOT))

    def test_dispatch_binding_covers_the_selected_source_and_handler(self):
        binding = DISPATCH_VALID["dispatch_binding_sound_upload"]["value"]
        self.assertEqual(binding["action_id"], UPLOAD)
        self.assertEqual(binding["target"]["kind"], "sound_upload_source")
        self.assertEqual(binding["target"]["source_file_ref"],
                         DISPATCH_VALID["sound_upload_request_record"]["value"]["source_file_ref"])
        self.assertEqual(ADAPTER.dispatch_binding_failures(binding, resolution="dispatch", canon_root=ROOT), [])
        dispatcher = DISPATCH_VALID["dispatcher_binding_sound_upload"]["value"]
        self.assertEqual(dispatcher["handler_id"], "handlers::sound::upload")
        self.assertEqual(dispatcher["handler_status"], "specified")
        self.assertEqual(dispatcher["wiring_status"], "specified")
        self.assertEqual(drive(DISPATCH_INVALID["copied_payload_as_arguments_digest"]),
                         ["sound_upload_import_arguments_digest"])
        self.assertIn("sound_upload_import_source_identity",
                      drive(DISPATCH_INVALID["upload_source_with_pack_target"]))
        self.assertIn("sound_upload_import_handler_status",
                      drive(DISPATCH_INVALID["dispatcher_implemented_claim"]))

    def test_gate_reports_static_only_and_stays_green(self):
        report = GATE.validate()
        self.assertEqual(report["failures"], [])
        self.assertEqual(report["status"], "pass")
        self.assertFalse(report["stats"]["native_proof"])
        self.assertEqual(report["stats"]["positive_cases"], len(VALID))
        self.assertEqual(report["stats"]["negative_cases"], len(INVALID))
        self.assertEqual(sorted(report["stats"]["owner_result_outcome_states"]), sorted(ADAPTER.COMMANDS))
        self.assertGreaterEqual(report["stats"]["semantic_negatives"], 40)


if __name__ == "__main__":
    unittest.main()
