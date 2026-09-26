"""Causal checks for the typed sound pack import action companion.

Every assertion runs the real composition helper over the enrolled static
fixtures and the actual central response/CommandOutcome schemas. The fixture
readers are synthetic static doubles: passing authenticates no issuer,
dispatcher, caller, FileSafe decision, permission, extractor, licensing
reviewer, writer, managed asset, pack member or physical custody.
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
IMPORT = "cmd.sound.pack.import"
SP222_CATEGORY_MAPPING = {
    "session.start": "routine_run_start",
    "task.complete": "routine_or_long_running_completion",
    "task.acknowledge": "acknowledgement_visual_or_optional_sound",
    "input.required": "input_or_approval_required",
    "task.error": "failure",
    "resource.limit": "rate_or_resource_limit",
    "user.spam": "repeated_prompt_user_spam",
}


def drive(row):
    """Every drive starts from the frozen fixture value."""
    return ADAPTER.sound_upload_import_semantic_failures(row["definition"], copy.deepcopy(row["value"]),
                                                        canon_root=ROOT)


def dependencies(value):
    return ADAPTER.fixture_dependencies(value)


def response_case(name, change=None):
    value = copy.deepcopy(VALID[name]["value"])
    if change is not None:
        change(value)
    return ADAPTER.response_failures(value, canon_root=ROOT, **dependencies(value))


def import_rows(document):
    return {name: row for name, row in document.items() if row.get("route") == IMPORT}


class SoundPackImportActionContractTests(unittest.TestCase):
    def test_every_declared_import_fixture_drives_as_declared(self):
        for document in (import_rows(VALID), import_rows(DISPATCH_VALID)):
            for name, row in document.items():
                with self.subTest(name=name):
                    self.assertEqual(drive(row), [])
        for document in (import_rows(INVALID), import_rows(DISPATCH_INVALID)):
            for name, row in document.items():
                with self.subTest(name=name):
                    observed = drive(row)
                    self.assertTrue(observed, "declared invalid fixture was accepted")
                    if row.get("shape_failure"):
                        self.assertTrue(any(item.startswith("shape:") for item in observed))
                    else:
                        self.assertNotIn(True, [item.startswith("shape:") for item in observed])
                        self.assertIn(row["semantic_rule"], observed)

    def test_per_member_validation_is_never_all_or_nothing(self):
        partial = VALID["sound_pack_import_result_imported_partial"]["value"]["result"]
        self.assertEqual(partial["outcome"], "imported_partial")
        self.assertGreater(partial["accepted_member_count"], 0)
        self.assertGreater(partial["rejected_member_count"], 0)
        rejected = [m for m in partial["members"] if str(m["disposition"]).startswith("rejected_")]
        self.assertTrue(rejected)
        for member in rejected:
            with self.subTest(member=member["member_name"]):
                self.assertIsNone(member["asset_ref"])
                self.assertIsNone(member["manifest_ref"])
                self.assertTrue(member["rejection_reason"])
                self.assertNotIn(member["asset_ref"], partial["imported_asset_refs"])
        self.assertEqual(drive(VALID["sound_pack_import_result_imported_partial"]), [])
        self.assertTrue(drive(INVALID["import_no_members_reported_as_success"]))
        self.assertIn("sound_pack_import_member_count", drive(INVALID["import_member_count_drift"]))

    def test_mixed_member_faults_settle_on_one_applicable_rejection_reason(self):
        """SP-222 rejects per member without naming a first-error precedence."""
        cases = (
            ("sound_pack_import_result_rejected_unsafe_path_and_oversize", "rejected_unsafe_path"),
            ("sound_pack_import_result_rejected_oversize_with_unsafe_path", "rejected_source_too_large"),
        )
        for name, disposition in cases:
            with self.subTest(name=name):
                value = VALID[name]["value"]
                member = [candidate for candidate in value["result"]["members"]
                          if not ADAPTER._path_contained(  # noqa: SLF001
                              candidate["declared_relative_path"])][0]
                self.assertGreater(member["source_bytes"], GATE.OWNER_LIMITS["source_size_limit_bytes"])
                self.assertEqual(member["disposition"], disposition)
                self.assertIsNone(member["asset_ref"])
                self.assertIsNone(member["manifest_ref"])
                self.assertEqual(drive(VALID[name]), [])
        # The same member facts cannot be presented as imported or as a reason
        # whose own owner facts do not hold.
        imported_claim = drive(INVALID["import_member_unsafe_path_and_oversize_imported"])
        self.assertIn("sound_pack_import_unsafe_path", imported_claim)
        self.assertIn("sound_pack_import_member_source_size_limit", imported_claim)
        self.assertIn("sound_pack_import_member_duration_limit",
                      drive(INVALID["import_member_unsafe_path_and_oversize_false_reason"]))
        # A member whose independent decode and MIME-family facts both disagree
        # may settle on either existing member reason.
        base = VALID["sound_pack_import_result_rejected_no_members"]["value"]
        for reason in ("rejected_decode_failure", "rejected_unsupported_format"):
            with self.subTest(reason=reason):
                value = copy.deepcopy(base)
                member = value["result"]["members"][0]
                member.update({"disposition": reason, "header_format": "mp3", "decoded_format": "ogg",
                               "format": "wav", "mime_type": "audio/flac",
                               "rejection_reason": "header/decode evidence and the MIME family disagree"})
                self.assertEqual(ADAPTER.result_failures(value["request"], value["result"], canon_root=ROOT,
                                                        **dependencies(value)), [])

    def test_rejected_members_are_never_counted_or_presented_as_imported(self):
        for name in ("import_member_count_drift", "import_member_evaluated_drift",
                     "import_imported_member_unretained"):
            with self.subTest(name=name):
                self.assertIn(INVALID[name]["semantic_rule"], drive(INVALID[name]))
        all_imported = VALID["sound_pack_import_result_imported_all"]["value"]["result"]
        self.assertEqual(all_imported["rejected_member_count"], 0)
        self.assertEqual(all_imported["unmapped_member_count"], 0)
        self.assertEqual(all_imported["duplicate_linked_member_count"], 0)
        self.assertEqual(len(all_imported["imported_asset_refs"]), all_imported["accepted_member_count"])
        self.assertEqual(set(all_imported["retained_manifest_refs"]),
                         {m["manifest_ref"] for m in all_imported["members"]})

    def test_unknown_manifest_versions_require_review_before_import(self):
        review = VALID["sound_pack_import_result_review_required"]["value"]
        result = review["result"]
        self.assertEqual(result["outcome"], "review_required")
        self.assertTrue(result["review_required"])
        self.assertEqual(result["manifest_version_reviewed"], False)
        self.assertEqual(result["evaluated_member_count"], 0)
        self.assertEqual(result["members"], [])
        self.assertEqual(result["imported_asset_refs"], [])
        self.assertTrue(result["rejection_reason"])
        self.assertEqual(drive(VALID["sound_pack_import_result_review_required"]), [])
        self.assertTrue(drive(INVALID["import_unknown_version_imported"]))
        self.assertIn("sound_upload_import_manifest_version_review",
                      drive(INVALID["import_manifest_version_review_drift"]))

    def test_imported_members_require_verified_licensing(self):
        for name in ("sound_pack_import_result_imported_all", "sound_pack_import_result_imported_partial"):
            for member in VALID[name]["value"]["result"]["members"]:
                if member["disposition"] != "imported":
                    continue
                with self.subTest(member=member["member_name"]):
                    self.assertEqual(member["license_verification"], "verified_by_owner")
                    self.assertTrue(member["declared_license_ref"])
        self.assertIn("sound_pack_import_member_license", drive(INVALID["import_member_license_missing"]))
        unlicensed = [m for m in VALID["sound_pack_import_result_imported_partial"]["value"]["result"]["members"]
                      if m["disposition"] == "rejected_unlicensed"]
        self.assertTrue(unlicensed)
        self.assertIsNone(unlicensed[0]["declared_license_ref"])

    def test_duplicate_content_links_existing_managed_content(self):
        linked = VALID["sound_pack_import_result_duplicate_content_linked"]["value"]["result"]
        duplicates = [m for m in linked["members"] if m["disposition"] == "duplicate_content_linked"]
        self.assertEqual(len(duplicates), 1)
        member = duplicates[0]
        self.assertEqual(member["asset_ref"], member["duplicate_of_asset_ref"])
        self.assertEqual(member["duplicate_of_content_sha256"], member["content_sha256"])
        earlier = {m["content_sha256"]: m["asset_ref"] for m in linked["members"]
                   if m["disposition"] == "imported"}
        self.assertEqual(earlier[member["content_sha256"]], member["duplicate_of_asset_ref"])
        for name in ("import_duplicate_as_new_asset", "import_duplicate_link_missing_target",
                     "import_silent_replacement"):
            with self.subTest(name=name):
                self.assertIn(INVALID[name]["semantic_rule"], drive(INVALID[name]))

    def test_filename_label_and_category_collisions_never_replace_silently(self):
        self.assertIn("sound_pack_import_name_collision",
                      drive(INVALID["import_name_collision_silent_replace"]))
        self.assertTrue(drive(INVALID["import_plan_mapping_replacement"]))
        self.assertTrue(drive(INVALID["import_routing_override_claim"]))
        for name in ("import_category_mapping_conflict", "import_member_category_mapping_drift",
                     "import_member_mapping_disposition_drift"):
            with self.subTest(name=name):
                self.assertIn(INVALID[name]["semantic_rule"], drive(INVALID[name]))
        for row in VALID.values():
            if row.get("route") != IMPORT or row["definition"] != "result_case":
                continue
            for member in row["value"]["result"]["members"]:
                with self.subTest(member=member["member_name"]):
                    self.assertIsNone(member["replaced_asset_ref"])
                    self.assertFalse(member["silent_replacement"])
                    self.assertFalse(member["routing_override_applied"])
        result = VALID["sound_pack_import_result_imported_partial"]["value"]["result"]
        self.assertEqual(result["mapping_replacement_refs"], [])
        self.assertEqual(result["routing_override_applied"], False)

    def test_category_mapping_table_is_the_exact_sp222_table(self):
        self.assertEqual(ADAPTER.CATEGORY_MAPPING, SP222_CATEGORY_MAPPING)
        for row in VALID.values():
            if row.get("route") != IMPORT or row["definition"] != "result_case":
                continue
            for member in row["value"]["result"]["members"]:
                if member["disposition"] != "imported":
                    continue
                with self.subTest(member=member["member_name"]):
                    self.assertEqual(SP222_CATEGORY_MAPPING[member["category"]],
                                     member["category_mapping_target"])
        unmapped = VALID["sound_pack_import_result_imported_partial"]["value"]["result"]
        for member in unmapped["members"]:
            if member["disposition"] == "unmapped_category_disabled_with_warning":
                self.assertIsNone(member["category"])
                self.assertIsNone(member["asset_ref"])
        self.assertTrue(drive(INVALID["import_unmapped_member_with_category"]))

    def test_unsafe_member_paths_are_rejected_and_never_imported(self):
        partial = VALID["sound_pack_import_result_imported_partial"]["value"]["result"]
        unsafe = [m for m in partial["members"] if m["disposition"] == "rejected_unsafe_path"]
        self.assertTrue(unsafe)
        self.assertIn("..", unsafe[0]["declared_relative_path"])
        self.assertIn("sound_pack_import_unsafe_path", drive(INVALID["import_member_unsafe_path_imported"]))
        rejected = VALID["sound_pack_import_result_rejected_no_members"]["value"]["result"]
        self.assertTrue(any(".." in m["declared_relative_path"] for m in rejected["members"]))
        member_record = DISPATCH_VALID["sound_pack_import_member_record"]["value"]
        for bad_path in ("/etc/sounds/x.ogg", "C:sounds\\x.ogg", "sounds\\x.ogg"):
            with self.subTest(path=bad_path):
                self.assertTrue(ADAPTER.shape_failures(
                    "sound_pack_import_member_record",
                    dict(member_record, declared_relative_path=bad_path), canon_root=ROOT))
        self.assertTrue(ADAPTER.shape_failures(
            "sound_pack_import_member_record",
            dict(member_record, declared_relative_path="sounds/../escape.ogg"), canon_root=ROOT) is not None)
        self.assertFalse(ADAPTER._path_contained("sounds/../escape.ogg"))  # noqa: SLF001
        self.assertTrue(ADAPTER._path_contained("sounds/session-start.ogg"))  # noqa: SLF001

    def test_pack_member_limits_are_the_existing_sp222_limits(self):
        for name in ("import_member_source_size_limit", "import_member_duration_limit",
                     "import_member_duration_warning_drift"):
            with self.subTest(name=name):
                self.assertIn(INVALID[name]["semantic_rule"], drive(INVALID[name]))
        oversized = dict(DISPATCH_VALID["sound_pack_import_member_record"]["value"],
                         source_bytes=GATE.OWNER_LIMITS["source_size_limit_bytes"] + 1)
        self.assertEqual(ADAPTER.shape_failures("sound_pack_import_member_record", oversized,
                                               canon_root=ROOT), [])

    def test_member_format_and_mime_evidence_must_agree(self):
        for name in ("import_member_format_agreement", "import_member_mime_agreement"):
            with self.subTest(name=name):
                self.assertIn(INVALID[name]["semantic_rule"], drive(INVALID[name]))

    def test_import_result_agrees_with_the_reviewed_manifest_and_admission(self):
        for name in ("import_source_missing_at_admission", "import_path_not_admitted_at_admission",
                     "import_compatibility_profile_substitution"):
            with self.subTest(name=name):
                self.assertIn(INVALID[name]["semantic_rule"], drive(INVALID[name]))

    def test_no_raw_audio_body_or_private_path_enters_the_record_set(self):
        self.assertTrue(drive(INVALID["import_raw_body_member_field"]))
        for name in ("sound_pack_import_request_case", "sound_pack_import_result_imported_all",
                     "response_sound_pack_import_partial"):
            with self.subTest(name=name):
                self.assertEqual(ADAPTER._secret_material_failures(VALID[name]["value"]), [])  # noqa: SLF001
        for row in VALID.values():
            if row.get("route") != IMPORT or row["definition"] != "result_case":
                continue
            result = row["value"]["result"]
            self.assertFalse(result["raw_audio_body_embedded"])
            self.assertFalse(result["private_path_embedded"])
            self.assertTrue(result["secret_refs_only"])

    def test_import_effect_is_receipt_only_with_no_projection_and_no_event(self):
        binding = VALID["sound_pack_import_effect_binding"]["value"]
        self.assertEqual(binding["effect_kind"], "receipt")
        self.assertEqual(binding["receipt_or_event_refs"], ["cmd.sound.pack.import.dispatch_receipt"])
        self.assertEqual(binding["partial_acceptance_rule"], "per_member_validation_never_all_or_nothing")
        self.assertIsNone(binding["projection_owner_ref"])
        self.assertEqual(binding["alert_state_mutation_authorized"], False)
        for row in VALID.values():
            if row.get("route") != IMPORT or row["definition"] != "result_case":
                continue
            self.assertEqual(row["value"]["result"]["persisted_event_refs"], [])
            self.assertFalse(row["value"]["result"]["alert_state_mutated"])
            self.assertFalse(row["value"]["result"]["built_in_asset_mutated"])

        def claim_event(value):
            value["result"]["persisted_event_refs"] = ["sound.asset.imported"]

        value = copy.deepcopy(VALID["sound_pack_import_result_imported_all"]["value"])
        claim_event(value)
        self.assertTrue(ADAPTER.result_failures(value["request"], value["result"], canon_root=ROOT,
                                               **dependencies(value)))

    def test_runtime_artifacts_projection_is_out_of_scope(self):
        def attach_projection(value):
            value["projection"] = {"schema_id": "pm.notifications_sound.receipt_projection.v1"}

        self.assertIn("sound_upload_import_projection_authority",
                      response_case("response_sound_pack_import_partial", attach_projection))
        wiring = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
        row = wiring[GATE.WIRING_ROW[IMPORT]]
        self.assertEqual(row["handler_location"], "handlers::sound::pack_import")
        self.assertEqual(row["state_selector"], ADAPTER.AVAILABILITY_SELECTOR[IMPORT])
        self.assertEqual(row["expected_event_types"], [])

    def test_import_owner_result_to_command_outcome_truth(self):
        partial = VALID["response_sound_pack_import_partial"]["value"]
        self.assertEqual(partial["owner_result"]["outcome"], "imported_partial")
        self.assertEqual(partial["outcome"]["outcome"], "succeeded")
        review = VALID["response_sound_pack_import_review_required"]["value"]
        self.assertEqual(review["owner_result"]["outcome"], "review_required")
        self.assertEqual(review["outcome"]["outcome"], "failed")
        self.assertEqual(review["response"]["result_status"], "failed")
        rejected = VALID["response_sound_pack_import_rejected_no_members"]["value"]
        self.assertEqual(rejected["owner_result"]["outcome"], "rejected_no_members")
        self.assertEqual(rejected["outcome"]["outcome"], "failed")
        for name in ("response_sound_pack_import_partial", "response_sound_pack_import_review_required",
                     "response_sound_pack_import_rejected_no_members", "response_sound_pack_import_replay",
                     "response_sound_pack_import_predispatch_policy_refused"):
            with self.subTest(name=name):
                self.assertEqual(drive(VALID[name]), [])
        for name in ("import_review_required_projected_as_success",
                     "import_rejected_no_members_projected_as_success"):
            with self.subTest(name=name):
                self.assertIn("sound_upload_import_owner_result_outcome_mapping", drive(INVALID[name]))

    def test_import_responses_use_the_real_central_contracts(self):
        for name, row in VALID.items():
            if row["definition"] != "response_case" or row.get("route") != IMPORT:
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
                    self.assertEqual(value["response"]["error"]["code"], value["action_error"]["code"])

    def test_import_sir_tuple_rejects_self_consistent_foreign_downstream(self):
        self.assertIn("sound_upload_import_original_sir_idempotency_key",
                      drive(INVALID["foreign_original_sir_idempotency_key_import"]))
        for field, foreign in (("payload_sha256", "b" * 64), ("target_generation", 900)):
            with self.subTest(field=field):
                def change(value, field=field, foreign=foreign):
                    value["normalized_request"][field] = foreign
                    value["outcome"][field] = foreign

                self.assertIn("sound_upload_import_original_sir_" + field,
                              response_case("response_sound_pack_import_partial", change))
        self.assertIn("sound_upload_import_source_identity",
                      drive(DISPATCH_INVALID["pack_import_with_upload_target"]))

    def test_import_dispatch_binds_the_selected_pack_and_planned_handler(self):
        binding = DISPATCH_VALID["dispatch_binding_sound_pack_import"]["value"]
        self.assertEqual(binding["action_id"], IMPORT)
        self.assertEqual(binding["target"]["kind"], "sound_pack_source")
        self.assertEqual(binding["target"]["pack_source_ref"],
                         DISPATCH_VALID["sound_pack_import_request_record"]["value"]["pack_source_ref"])
        self.assertEqual(ADAPTER.dispatch_binding_failures(binding, resolution="dispatch", canon_root=ROOT), [])
        dispatcher = DISPATCH_VALID["dispatcher_binding_sound_pack_import"]["value"]
        self.assertEqual(dispatcher["handler_id"], "handlers::sound::pack_import")
        self.assertEqual(dispatcher["handler_status"], "specified")
        self.assertIn("sound_upload_import_handler_status",
                      drive(INVALID["import_handler_implemented_claim"]))

    def test_import_status_and_availability_projections_follow_the_production_row(self):
        for name in ("availability_sound_pack_import_available",
                     "availability_sound_pack_import_disabled_policy_refused"):
            with self.subTest(name=name):
                availability = VALID[name]["value"]["availability"]
                self.assertEqual(availability["availability_selector"],
                                 ADAPTER.AVAILABILITY_SELECTOR[IMPORT])
                self.assertEqual(availability["disabled_reason_selector"],
                                 ADAPTER.DISABLED_REASON_SELECTOR[IMPORT])
                self.assertEqual(drive(VALID[name]), [])
        self.assertEqual(ADAPTER.error_failures(
            VALID["sound_pack_import_error_policy_refused"]["value"]["error"],
            availability=VALID["sound_pack_import_error_policy_refused"]["value"]["availability"],
            response_error=VALID["sound_pack_import_error_policy_refused"]["value"]["response_error"],
            expected_phase="pre_dispatch", canon_root=ROOT), [])

    def test_import_result_outcome_table_covers_every_declared_state(self):
        schema = json.loads((ROOT / ADAPTER.ACTION_SCHEMA).read_text())
        declared = set(schema["$defs"][ADAPTER.RESULT_DEFINITION[IMPORT]]["properties"]["outcome"]["enum"])
        self.assertEqual(declared, set(ADAPTER.OWNER_RESULT_OUTCOME[IMPORT]))
        for state, allowed in ADAPTER.OWNER_RESULT_OUTCOME[IMPORT].items():
            with self.subTest(state=state):
                self.assertTrue(allowed)


if __name__ == "__main__":
    unittest.main()
