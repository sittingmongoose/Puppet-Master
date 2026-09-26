"""Causal checks for the typed Sound asset export companion.

Every assertion runs the real composition helper over the enrolled static
fixtures and the actual central response/CommandOutcome schemas. The fixture
readers are synthetic static doubles: passing authenticates no issuer,
dispatcher, caller, permission, handler, export write, redaction, receipt
writer or physical custody, and neither the Touch row, handler status nor
wiring status is promoted here. Runtime Artifacts consumes export evidence
through the RAP-039 projection without gaining export authority.
"""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import pm_sound_asset_action_response as ADAPTER  # noqa: E402
import pm_sound_asset_export_contracts as GATE  # noqa: E402

ACTION_FIXTURES = json.loads((ROOT / "Plans/sound_asset_export_action_fixtures.json").read_text())
DISPATCH_FIXTURES = json.loads((ROOT / "Plans/sir_sound_asset_action_dispatch_fixtures.json").read_text())
VALID = {row["name"]: row for row in ACTION_FIXTURES["valid"]}
INVALID = {row["name"]: row for row in ACTION_FIXTURES["invalid"]}
DISPATCH_VALID = {row["name"]: row for row in DISPATCH_FIXTURES["valid"]}
DISPATCH_INVALID = {row["name"]: row for row in DISPATCH_FIXTURES["invalid"]}
TOUCH = json.loads((ROOT / "Plans/touch_closure.json").read_text())
WIRING = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
ROUTE = "cmd.sound.asset.export"


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


class SoundAssetExportContractTests(unittest.TestCase):
    def test_companion_covers_exactly_the_export_route(self):
        closed = ADAPTER.shape_failures("action_id", "cmd.sound.asset.delete", canon_root=ROOT,
                                        schema_path=ADAPTER.ACTION_SCHEMA[ROUTE])
        self.assertTrue(closed)
        schema = json.loads((ROOT / ADAPTER.ACTION_SCHEMA[ROUTE]).read_text())
        self.assertEqual(set(schema["$defs"]["action_id"]["enum"]), {ROUTE})
        records = VALID["export_request_case"]["value"]["records"]
        foreign = ADAPTER.request_failures(
            dict(VALID["export_request_case"]["value"]["request"], command_id="cmd.sound.asset.delete"),
            resolve_owner_original=lambda ref: copy.deepcopy(records[ref]),
            resolve_sir_dispatch=lambda ref: copy.deepcopy(records[ref]),
            resolve_dispatcher=lambda ref: copy.deepcopy(records[ref]),
            canon_root=ROOT)
        # The closed delete request shape refuses the export operands outright.
        self.assertTrue(any(item.startswith("shape:") for item in foreign))

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
        request = VALID["export_request_case"]["value"]["request"]
        records = VALID["export_request_case"]["value"]["records"]
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
        primitive = copy.deepcopy(VALID["export_request_case"]["value"])
        primitive["request"]["authenticated"] = True
        self.assertTrue(ADAPTER.request_failures(primitive["request"], canon_root=ROOT,
                                                 **dependencies(primitive)))

    def test_export_never_mutates_or_sends_and_reports_actual_owner_output(self):
        completed = VALID["export_result_completed"]["value"]["result"]
        self.assertEqual(completed["outcome"], "export_completed")
        self.assertFalse(completed["asset_mutated"])
        self.assertFalse(completed["external_send"])
        self.assertIsNone(completed["substituted_asset_ref"])
        self.assertEqual(completed["output_path_disclosure"], "canonical_ref_only_no_private_path")
        self.assertTrue(shape_refused("export_mutates_asset"))
        self.assertTrue(shape_refused("external_send_claim"))
        self.assertTrue(shape_refused("private_path_disclosure"))

    def test_redacted_source_license_version_hash_metadata_is_owner_reported(self):
        completed = VALID["export_result_completed"]["value"]["result"]
        for field in ("source_metadata_included", "license_metadata_included",
                      "version_metadata_included", "hash_metadata_included"):
            self.assertTrue(completed[field])
        self.assertTrue(completed["redacted_fields"])
        self.assertIsNotNone(completed["bundle_digest"])
        self.assertIn("sound_asset_export_metadata_missing", drive(INVALID["completed_metadata_missing"]))
        self.assertIn("sound_asset_export_metadata_claim", drive(INVALID["failed_bundle_digest_claim"]))
        self.assertIn("sound_asset_export_bundle_digest", drive(INVALID["completed_bundle_digest_missing"]))

    def test_secret_material_and_private_paths_stay_out(self):
        self.assertIn("sound_asset_secret_material", drive(INVALID["secret_material_in_output_target"]))
        result = VALID["export_result_completed"]["value"]["result"]
        for _label, pattern in ADAPTER.SECRET_MATERIAL_PATTERNS:
            self.assertIsNone(pattern.search(result["output_target_ref"]))

    def test_output_target_stays_bound_across_request_original_and_result(self):
        self.assertIn("sound_asset_export_output_target_drift",
                      drive(INVALID["original_output_target_drift"]))
        self.assertIn("sound_asset_export_output_target_drift",
                      drive(INVALID["result_output_target_drift"]))
        self.assertIn("sound_asset_export_redaction_profile", drive(INVALID["redaction_profile_drift"]))
        self.assertIn("sound_asset_read_admission", drive(INVALID["read_admission_missing"]))
        self.assertIn("sound_asset_output_scope_unbound", drive(INVALID["output_scope_unbound"]))

    def test_rap039_projection_is_receipt_bound_and_authority_free(self):
        bundle = VALID["response_export_succeeded_with_projection"]["value"]
        projection = bundle["projection"]
        self.assertEqual(projection["receipt_ref"], bundle["owner_result"]["receipt_ref"])
        self.assertEqual(projection["bundle_digest"], bundle["owner_result"]["bundle_digest"])
        self.assertEqual(projection["authority"],
                         "projection_only_no_export_storage_permission_or_alert_state_authority")
        self.assertFalse(projection["secret_material_present"])
        self.assertIn("sound_asset_export_projection_receipt",
                      drive(INVALID["projection_receipt_substitution"]))
        self.assertIn("sound_asset_export_projection_source",
                      drive(INVALID["projection_source_substitution"]))
        self.assertIn("sound_asset_export_projection_output",
                      drive(INVALID["projection_output_substitution"]))
        self.assertIn("sound_asset_export_projection_digest",
                      drive(INVALID["projection_digest_substitution"]))
        self.assertIn("sound_asset_export_projection_redaction",
                      drive(INVALID["projection_redaction_drift"]))
        self.assertTrue(shape_refused("export_projection_gains_authority"))
        self.assertIn("sound_asset_export_projection_missing",
                      drive(INVALID["missing_projection_on_success"]))
        # The delete route gains no export projection authority.
        self.assertIn("sound_asset_delete_projection_authority",
                      drive(INVALID["projection_on_delete_route"]))

    def test_cv333_projection_table_matches_the_actual_central_schema(self):
        self.assertEqual(ADAPTER.truth_table_agreement_failures(canon_root=ROOT), [])
        self.assertEqual(len(ADAPTER.OUTCOME_RESPONSE_TRUTH), 8)

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

    def test_owner_failure_is_never_a_central_success(self):
        self.assertIn("sound_asset_owner_result_outcome_mapping",
                      drive(INVALID["owner_failure_projected_as_success"]))
        failed = VALID["response_export_failed_no_bundle"]["value"]
        self.assertEqual(failed["owner_result"]["outcome"], "failed")
        self.assertEqual(failed["outcome"]["outcome"], "failed")
        self.assertEqual(failed["response"]["result_status"], "failed")
        self.assertIsNone(failed["owner_result"]["bundle_digest"])
        self.assertEqual(drive(VALID["response_export_failed_no_bundle"]), [])

    def test_events_stay_unadmitted(self):
        self.assertIn("sound_asset_event_claim", drive(INVALID["event_claim_in_response"]))
        self.assertTrue(shape_refused("event_claim_in_result"))
        row = WIRING[ADAPTER.WIRING_ROW[ROUTE]]
        self.assertEqual(row["expected_event_types"], [])
        for key in ADAPTER.FORBIDDEN_COMPANION_KEYS:
            self.assertNotIn(f'"{key}"', json.dumps(ACTION_FIXTURES))

    def test_touch_row_stays_partial_and_the_export_refs_are_materialized(self):
        rows = {row[3]: row for row in TOUCH["rows"]}
        profile = {item["profile_id"]: item for item in TOUCH["profiles"]}["TCP-NOTIFY-SOUND"]
        row = rows[ROUTE]
        self.assertEqual(row[4], "partial")
        self.assertEqual(row[1], "TCP-NOTIFY-SOUND")
        self.assertIn("remain implementation and verification work", row[5])
        self.assertNotIn("remain specification work", row[5])
        self.assertIn("RAP-039 receipt/export projection composition", row[5])
        self.assertEqual(profile["handler_status"], "specified")
        self.assertEqual(profile["wiring_status"], "specified")
        for field, definition in GATE.ACTION_REF_DEFINITION.items():
            self.assertIn(
                f"{ROUTE} -> {ADAPTER.ACTION_SCHEMA[ROUTE]}#/$defs/{definition}", profile[field])
        for field in ("payload_schema_ref", "result_schema_ref", "error_schema_ref"):
            for action in ("cmd.sound.upload", "cmd.sound.pack.import"):
                self.assertIn(f"{action} -> Plans/sound_upload_import_action_contracts.schema.json#/$defs/",
                              profile[field])
        self.assertIn("RAP-039 applies to destination-test and asset-export evidence only; not local playback",
                      profile["production_or_simulation"])

    def test_effect_and_handler_values_join_the_production_row(self):
        row = WIRING[ADAPTER.WIRING_ROW[ROUTE]]
        expected = ADAPTER.EFFECT_VALUES[ROUTE]
        self.assertEqual(row["handler_location"], expected["handler_id"])
        self.assertEqual(row["effect_contract"]["effect_kind"], "receipt")
        self.assertEqual(row["effect_contract"]["receipt_or_event_refs"], expected["receipt_or_event_refs"])
        self.assertEqual(row["state_selector"], ADAPTER.AVAILABILITY_SELECTOR[ROUTE])
        self.assertEqual(row["disabled_reason_projection"], ADAPTER.DISABLED_REASON_SELECTOR[ROUTE])
        description = row["effect_contract"]["description"]
        self.assertIn("export output", description)
        self.assertIn("source/license/version/hash", description)
        self.assertIn("without secrets", description)
        self.assertIn("does not gain export or storage authority", description)

    def test_filesafe_output_rules_are_cited(self):
        filesafe = (ROOT / "Plans/FileSafe.md").read_text()
        self.assertIn("FileSafe: Write scope", filesafe)
        self.assertIn("atomic write pattern `temp -> fsync -> rename`", filesafe)

    def test_owner_result_outcome_table_covers_every_declared_state(self):
        schema = json.loads((ROOT / ADAPTER.ACTION_SCHEMA[ROUTE]).read_text())
        declared = set(schema["$defs"][ADAPTER.RESULT_DEFINITION[ROUTE]]["properties"]["outcome"]["enum"])
        self.assertEqual(declared, set(ADAPTER.OWNER_RESULT_OUTCOME[ROUTE]))
        for state in declared:
            self.assertTrue(ADAPTER.OWNER_RESULT_OUTCOME[ROUTE][state])

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
                              response_case("response_export_succeeded_with_projection", change))
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
                              response_case("response_export_succeeded_with_projection", change))

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
