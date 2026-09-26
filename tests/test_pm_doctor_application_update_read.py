"""Focused static checks for the Doctor application-update typed owner read.

Everything here is static. The owner-original authority and the controller records
injected into the join callbacks are labeled fixture doubles; they cannot certify a
native issuer, an issued permission decision, physical owner custody, a dispatched
command or an empirical update/Server result. Query completion is never health.
"""
import copy
import importlib.util
import json
import os
import sys
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(os.environ.get("PM_CANON_ROOT", str(Path(__file__).resolve().parents[1])))
ARTIFACT_ROOT = Path(os.environ.get("PM_DOCTOR_APP_UPDATE_ROOT", str(Path(__file__).resolve().parents[1])))
sys.path.insert(0, str(ARTIFACT_ROOT / "scripts"))
import pm_doctor_application_update_read as owner_read
import pm_doctor_source_coverage as coverage


def fixture_double_authority():
    return "fixture_only_static_double"


class DoctorApplicationUpdateOwnerRead(unittest.TestCase):
    maxDiff = None

    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ARTIFACT_ROOT / "Plans/doctor_application_update_owner_read_contracts.schema.json").read_text())
        cls.fixtures = json.loads((ARTIFACT_ROOT / "Plans/doctor_application_update_owner_read_contract_fixtures.json").read_text())
        cls.values = {case["name"]: case["value"] for case in cls.fixtures["valid"]}
        cls.definitions = {case["name"]: case["definition"] for case in cls.fixtures["valid"]}
        cls.originals = cls.fixtures["owner_original_fixture_authority"]
        cls.records = {
            (record["kind"], record["ref"]): record["value"]
            for record in cls.fixtures["controller_projection_double"]["records"]
        }
        cls.registry = Registry()
        for name in owner_read.OWNER_SCHEMA_FILES:
            document = json.loads((ARTIFACT_ROOT / "Plans" / name).read_text())
            cls.registry = cls.registry.with_resource(document["$id"], Resource.from_contents(document))

    # ----- helpers ---------------------------------------------------------
    def validator(self, definition):
        subset = {
            key: value
            for key, value in self.schema.items()
            if key not in {"oneOf", "anyOf", "allOf", "type", "properties", "required", "additionalProperties"}
        }
        subset.update({"$ref": "#/$defs/" + definition})
        return Draft202012Validator(subset, registry=self.registry, format_checker=FormatChecker())

    def errors(self, definition, value):
        return [error.message for error in self.validator(definition).iter_errors(value)]

    def semantic(self, definition, value):
        return owner_read.application_update_owner_read_semantic_failures(definition, value)

    def positive(self, name):
        return copy.deepcopy(self.values[name])

    def test_distinct_positive_owner_reads_have_unique_result_ids(self):
        records = [self.positive(name) for name in (
            "one_owner_read_result_union_dimensions",
            "distinct_generation_domains_owner_read",
            "older_still_current_owner_facts",
        )]
        self.assertEqual(len(records), len({record["result_id"] for record in records}))

    def resolve(self, kind, ref):
        try:
            return copy.deepcopy(self.records[(kind, ref)])
        except KeyError as exc:
            raise KeyError(f"no such fixture double: {kind}:{ref}") from exc

    def selected_current(self, originals=None):
        """Labeled fixture double of the service's own selected-current authority read."""

        block = (self.originals if originals is None else originals)["lifecycle"]["selected_current"]

        def resolver(_scope):
            return copy.deepcopy(block)

        return resolver

    def join(self, request=None, result=None, originals=None, authority_class=None, resolve_selected_current="default"):
        return owner_read.validate_owner_read_join(
            request if request is not None else self.positive("one_owner_read_request_for_two_occurrences"),
            result if result is not None else self.positive("one_owner_read_result_union_dimensions"),
            originals=self.originals if originals is None else originals,
            authority_class=fixture_double_authority() if authority_class is None else authority_class,
            resolve_selected_current=(self.selected_current(originals)
                                      if resolve_selected_current == "default" else resolve_selected_current),
        )

    def projection(self, pair=None, resolve_record=None, originals=None, authority_class=None, resolve_selected_current="default"):
        return owner_read.validate_occurrence_projection(
            pair if pair is not None else self.positive("two_occurrence_projection_of_one_read"),
            resolve_record=resolve_record if resolve_record is not None else self.resolve,
            originals=self.originals if originals is None else originals,
            authority_class=fixture_double_authority() if authority_class is None else authority_class,
            resolve_selected_current=(self.selected_current(originals)
                                      if resolve_selected_current == "default" else resolve_selected_current),
        )

    def reseal(self, result):
        """Recompute the downstream payload digest so a mutation stays self-consistent."""
        result["payload_digest"] = owner_read.payload_digest(result["fields"])
        return result

    # ----- shape and ownership --------------------------------------------
    def test_schema_metaschema_and_owner_schemas(self):
        for name in owner_read.OWNER_SCHEMA_FILES:
            document = json.loads((ARTIFACT_ROOT / "Plans" / name).read_text())
            Draft202012Validator.check_schema(document)
        self.assertEqual("pm.doctor.application_update_owner_read.contracts.v1", self.schema["x-schema-id"])
        self.assertEqual("pm.doctor.application_update_owner_read.contracts.v1", self.fixtures["contract_schema_id"])
        self.assertEqual("schema_fixture_only", self.fixtures["evidence_level"])

    def test_positive_cases_validate_and_hold_their_laws(self):
        for case in self.fixtures["valid"]:
            with self.subTest(case=case["name"]):
                self.assertEqual([], self.errors(case["definition"], case["value"]))
                self.assertEqual([], self.semantic(case["definition"], case["value"]))

    def test_descriptor_binds_the_anchored_request_and_result_definitions(self):
        descriptor = self.positive("application_update_owner_read_descriptor")
        self.assertEqual("doctor.application_update.owner_read", descriptor["check_id"])
        self.assertEqual(["application"], descriptor["target_kinds"])
        self.assertEqual("read_only", descriptor["side_effect_policy"])
        self.assertEqual("Plans/Release_Supply_Chain.md#RSC-014", descriptor["owner_doc_ref"])
        for key, anchor in (("request_schema_ref", "application_update_owner_read_request"),
                            ("result_schema_ref", "application_update_owner_read_result")):
            self.assertEqual(self.schema["$id"] + "#" + anchor, descriptor[key])
            self.assertEqual("object", self.schema["$defs"][anchor]["type"])
            self.assertEqual(anchor, self.schema["$defs"][anchor]["$anchor"])

    def test_negative_cases_are_rejected_or_proven(self):
        positives = {case["name"]: case for case in self.fixtures["valid"]}
        for case in self.fixtures["invalid"]:
            base = positives[case["base_valid"]]
            value = copy.deepcopy(base["value"])
            for dotted, replacement in (case.get("patch") or {}).items():
                parts = dotted.split(".")
                node = value
                for part in parts[:-1]:
                    node = node[int(part)] if isinstance(node, list) else node[part]
                leaf = parts[-1]
                if isinstance(node, list):
                    node[int(leaf)] = copy.deepcopy(replacement)
                else:
                    node[leaf] = copy.deepcopy(replacement)
            for dotted in case.get("remove") or []:
                parts = dotted.split(".")
                node = value
                for part in parts[:-1]:
                    node = node[int(part)] if isinstance(node, list) else node[part]
                leaf = parts[-1]
                if isinstance(node, list):
                    node.pop(int(leaf))
                else:
                    node.pop(leaf, None)
            with self.subTest(case=case["name"]):
                errors = self.errors(base["definition"], value)
                rule = case.get("semantic_rule")
                if rule is None:
                    self.assertTrue(errors, "structural negative was accepted")
                else:
                    self.assertEqual([], errors, "semantic negative must stay structurally valid")
                    self.assertIn(rule, self.semantic(base["definition"], value))

    def test_join_accepts_the_authored_positive_and_never_certifies(self):
        verdict = self.join()
        self.assertEqual([], verdict["failures"])
        self.assertEqual(fixture_double_authority(), verdict["evidence_level"])
        self.assertFalse(verdict["certifies_native_issuer"])
        self.assertFalse(self.projection()["certifies_native_issuer"])
        self.assertEqual([], self.projection()["failures"])

    def test_unlabeled_or_foreign_authority_is_refused(self):
        for authority_class in ("owner", "native", "", "static_fixture"):
            with self.subTest(authority_class=authority_class):
                verdict = self.join(authority_class=authority_class)
                self.assertIn("owner_read_authority_unlabeled", verdict["failures"])
                self.assertFalse(verdict["certifies_native_issuer"])
        native = self.join(authority_class="native_owner_resolver")
        self.assertEqual([], native["failures"])
        self.assertFalse(native["certifies_native_issuer"])

    # ----- scope and currentness causality ---------------------------------
    def test_wrong_scope_never_answers_from_another_scope(self):
        cases = (
            ("server", ("scope", "server_id"), "server:other"),
            ("installation", ("scope", "installation_id"), "installation:other"),
            ("installation_generation", ("scope", "installation_generation"), 9),
            ("source", ("scope", "source_id"), "update-source:nightly"),
            ("source_generation", ("scope", "source_generation"), 12),
            ("channel", ("scope", "channel_id"), "canary"),
        )
        for label, path, value in cases:
            request = self.positive("one_owner_read_request_for_two_occurrences")
            node = request
            for part in path[:-1]:
                node = node[part]
            node[path[-1]] = value
            with self.subTest(field=label):
                verdict = self.join(request=request)
                self.assertTrue(verdict["failures"], f"{label} scope change was accepted")
                self.assertFalse(verdict["certifies_native_issuer"])

    def test_target_identity_is_the_installation_and_server_stays_separate(self):
        request = self.positive("one_owner_read_request_for_two_occurrences")
        self.assertEqual("application", request["target"]["target_kind"])
        self.assertEqual(request["scope"]["installation_id"], request["target"]["identity_ref"])
        self.assertEqual(request["scope"]["server_id"], request["target"]["server_id"])
        relabeled = self.positive("one_owner_read_request_for_two_occurrences")
        relabeled["target"]["target_kind"] = "server"
        self.assertIn("owner_read_request_target_kind",
                      self.semantic("application_update_owner_read_request", relabeled))
        misapplied = self.positive("one_owner_read_result_union_dimensions")
        misapplied["target"]["target_kind"] = "server"
        self.assertIn("owner_read_result_target_kind",
                      self.semantic("application_update_owner_read_result", misapplied))

    def test_generation_policy_and_revision_currentness(self):
        for field in ("expected_owner_generation", "expected_cache_generation", "expected_state_revision"):
            request = self.positive("one_owner_read_request_for_two_occurrences")
            request[field] = request[field] + 1
            with self.subTest(field=field):
                failures = self.join(request=request)["failures"]
                self.assertTrue(failures, f"{field} stale value was accepted")
        request = self.positive("one_owner_read_request_for_two_occurrences")
        request["expected_policy_version"] = "policy:application-check:v0"
        self.assertIn("owner_read_policy_revision_not_current", self.join(request=request)["failures"])
        request = self.positive("one_owner_read_request_for_two_occurrences")
        request["expected_descriptor_revision"] = 2
        self.assertIn("owner_read_descriptor_revision", self.join(request=request)["failures"])

    def test_original_owner_value_change_with_resealed_digest_still_fails(self):
        originals = copy.deepcopy(self.originals)
        originals["installed_version"]["version"] = "1.4.3"
        result = self.reseal(self.positive("one_owner_read_result_union_dimensions"))
        self.assertEqual(owner_read.payload_digest(result["fields"]), result["payload_digest"])
        verdict = self.join(result=result, originals=originals)
        self.assertIn("owner_read_installed_version_mismatch", verdict["failures"])
        self.assertFalse(verdict["certifies_native_issuer"])

    def test_original_protocol_and_source_original_change_fails(self):
        originals = copy.deepcopy(self.originals)
        originals["server_protocol"]["value"]["connection_state"] = "protocol_mismatch"
        originals["server_protocol"]["value"]["disabled_reason"] = "server protocol range excludes this Client"
        originals["server_protocol"]["connection_state"] = "protocol_mismatch"
        verdict = self.join(originals=originals)
        self.assertIn("owner_read_protocol_original", verdict["failures"])
        originals = copy.deepcopy(self.originals)
        originals["source_result"]["record"]["outcome"] = "cache_only"
        originals["source_result"]["record"]["publication"] = None
        originals["source_result"]["record"]["source_evidence_ref"] = None
        self.assertIn("owner_read_source_result_original", self.join(originals=originals)["failures"])

    # ----- owner sourcing --------------------------------------------------
    def test_installed_version_is_not_derived_from_publication_or_display(self):
        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["version"]["installed_version"] = "1.5.0"
        self.reseal(result)
        failures = self.join(result=result)["failures"]
        self.assertIn("owner_read_installed_version_mismatch", failures)
        self.assertIn("owner_read_installed_version_copied_from_candidate", failures)

        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["version"]["installed_provenance"]["owner_ref"] = "handler_default:package_filename"
        self.reseal(result)
        self.assertIn("installed_version_source_client_display_source", self.join(result=result)["failures"])

        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["version"]["installed_provenance"]["owner_ref"] = "command_output:cmd.update.app.check"
        self.reseal(result)
        self.assertIn("installed_version_source_command_result_source", self.join(result=result)["failures"])

        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["version"]["installed_provenance"]["owner_ref"] = "installation-authority:pm-app-01"
        self.reseal(result)
        self.assertIn("owner_read_installed_version_owner", self.join(result=result)["failures"])

    def test_protocol_value_is_not_endpoint_text_or_client_default(self):
        for owner in ("endpoint_text:server:home-01", "client_banner:pm-app", "handler_default:protocol"):
            result = self.positive("one_owner_read_result_union_dimensions")
            result["fields"]["protocol"]["provenance"]["owner_ref"] = owner
            self.reseal(result)
            with self.subTest(owner=owner):
                self.assertIn("owner_read_protocol_owner", self.join(result=result)["failures"])
        result = self.positive("one_owner_read_result_union_dimensions")
        value = result["fields"]["protocol"]["server_value"]
        value["server_id"] = "server:other"
        value["connection_state"] = "protocol_mismatch"
        value["disabled_reason"] = "protocol mismatch"
        result["fields"]["protocol"]["connection_state"] = "protocol_mismatch"
        self.reseal(result)
        failures = self.join(result=result)["failures"]
        self.assertIn("owner_read_protocol_server_join", failures)
        self.assertIn("owner_read_protocol_original", failures)

    def test_available_update_projection_is_the_owner_source_result(self):
        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["available_update"]["metadata"][0]["version"] = "9.9.9"
        self.reseal(result)
        failures = self.join(result=result)["failures"]
        self.assertIn("owner_read_source_result_metadata", failures)
        source_tampered = self.positive("one_owner_read_result_union_dimensions")
        source_tampered["fields"]["available_update"]["source_result"]["outcome"] = "cache_only"
        self.reseal(source_tampered)
        self.assertIn("owner_read_source_result_original", self.join(result=source_tampered)["failures"])
        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["available_update"]["outcome"] = "cache_only"
        self.reseal(result)
        self.assertIn("owner_read_source_result_outcome", self.join(result=result)["failures"])

    def test_channel_and_install_source_join_the_exact_scope(self):
        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["channel"]["publication_channel"] = "canary"
        self.reseal(result)
        self.assertIn("owner_read_publication_channel_mismatch", self.join(result=result)["failures"])
        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["install_source"]["installation_authority_generation"] = 5
        self.reseal(result)
        self.assertIn("owner_read_installation_authority_generation", self.join(result=result)["failures"])
        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["install_source"]["source_generation"] = 12
        self.reseal(result)
        self.assertIn("owner_read_install_source_scope", self.join(result=result)["failures"])

    def test_restart_requirement_is_the_owner_lifecycle_phase(self):
        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["restart_requirement"]["phase"] = "available"
        self.reseal(result)
        failures = self.join(result=result)["failures"]
        self.assertIn("owner_read_lifecycle_phase_value", failures)
        self.assertIn("owner_read_restart_requirement_derivation", failures)
        phase_shift = self.positive("one_owner_read_result_union_dimensions")
        phase_shift["fields"]["restart_requirement"]["restart_required"] = False
        self.reseal(phase_shift)
        self.assertIn("owner_read_restart_requirement_value", self.join(result=phase_shift)["failures"])
        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["restart_requirement"]["lifecycle_disclosure"]["installation_generation"] = 5
        self.reseal(result)
        self.assertIn("owner_read_lifecycle_original", self.join(result=result)["failures"])
        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["restart_requirement"]["provenance"]["owner_ref"] = "cache:update-panel"
        self.reseal(result)
        self.assertIn("owner_read_restart_owner", self.join(result=result)["failures"])
        self.assertIn("restart_source_cached_projection_source",
                      self.semantic("application_update_owner_read_result", result))

    def test_admission_and_shared_work_are_required_for_the_one_read(self):
        request = self.positive("one_owner_read_request_for_two_occurrences")
        request["read_admission_ref"] = "permissions:doctor-read-admission:other"
        self.assertIn("owner_read_admission_ref", self.join(request=request)["failures"])
        originals = copy.deepcopy(self.originals)
        originals["admission"]["decision"] = "deny"
        self.assertIn("owner_read_admission_refused", self.join(originals=originals)["failures"])
        originals = copy.deepcopy(self.originals)
        originals["admission"]["expires_at_utc"] = "2026-09-24T12:00:04Z"
        self.assertIn("owner_read_admission_expired", self.join(originals=originals)["failures"])
        originals = copy.deepcopy(self.originals)
        originals["admission"]["authority_generation"] = 6
        self.assertIn("owner_read_admission_stale_authority", self.join(originals=originals)["failures"])
        originals = copy.deepcopy(self.originals)
        originals["governor"]["observable_work_ref"] = "observable-work:other"
        self.assertIn("owner_read_shared_work_mismatch", self.join(originals=originals)["failures"])

    def test_conditional_validator_must_bind_the_prior_admitted_publication(self):
        request = self.positive("one_owner_read_request_for_two_occurrences")
        request["submitted_conditional_validator"] = "validator:unbound:2026-09-24"
        failures = self.join(request=request)["failures"]
        self.assertIn("owner_read_unbound_validator", failures)
        self.assertIn("owner_read_submitted_validator_mismatch", failures)

    def test_caller_copied_values_and_mutation_are_refused(self):
        result = self.positive("one_owner_read_result_union_dimensions")
        result["owner_original_join"]["caller_copied_values_authority"] = True
        self.assertTrue(self.errors("application_update_owner_read_result", result))
        request = self.positive("one_owner_read_request_for_two_occurrences")
        request["command_id"] = "cmd.update.app.check"
        self.assertTrue(self.errors("application_update_owner_read_request", request))
        request = self.positive("one_owner_read_request_for_two_occurrences")
        request["owner_read_ref"] = "cmd.update.app.check"
        self.assertIn("owner_read_mutating_command_requested",
                      self.semantic("application_update_owner_read_request", request))

    def test_no_field_can_claim_health_or_owner_reported_unsupported(self):
        result = self.positive("one_owner_read_result_union_dimensions")
        for value in ("healthy", "unsupported", "owner_reported_unsupported", "ok"):
            mutated = copy.deepcopy(result)
            mutated["status"] = value
            with self.subTest(status=value):
                self.assertTrue(self.errors("application_update_owner_read_result", mutated))
        for field in ("health", "outcome_reason", "unsupported_reason", "remediation_state"):
            mutated = copy.deepcopy(result)
            mutated[field] = "healthy"
            with self.subTest(field=field):
                self.assertTrue(self.errors("application_update_owner_read_result", mutated))
        controller = json.loads((ARTIFACT_ROOT / "Plans/doctor_query_controller_contracts.schema.json").read_text())
        self.assertEqual(
            controller["$defs"]["doctor_owner_query_result"]["properties"]["status"]["enum"],
            self.schema["$defs"]["application_update_owner_read_result"]["properties"]["status"]["enum"],
        )

    def test_noncompleted_read_discloses_no_field_values(self):
        result = self.positive("one_owner_read_result_union_dimensions")
        result["status"] = "failed"
        self.reseal(result)
        failures = self.semantic("application_update_owner_read_result", result)
        self.assertTrue(any(failure.startswith("owner_read_noncompleted_fields_present") for failure in failures))
        verdict = self.join(result=result)
        self.assertIn("owner_read_noncompleted_discloses_fields", verdict["failures"])
        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["protocol"] = None
        self.reseal(result)
        self.assertIn("owner_read_completed_fields_missing:protocol",
                      self.semantic("application_update_owner_read_result", result))
        self.assertIn("owner_read_requested_field_subset", self.join(result=result)["failures"])

    # ----- one read projected to the two occurrences -----------------------
    def test_pair_projects_one_read_to_two_distinct_occurrences(self):
        pair = self.positive("two_occurrence_projection_of_one_read")
        self.assertEqual(["sep03-doctor-008", "sep03-doctor-043"],
                         [member["occurrence_id"] for member in pair["occurrence_members"]])
        self.assertEqual(["/groups/0/checks/7", "/groups/5/checks/0"],
                         [member["source_pointer"] for member in pair["occurrence_members"]])
        self.assertEqual(["version", "channel", "install source", "available update", "restart requirement"],
                         pair["occurrence_members"][0]["required_dimensions"])
        self.assertEqual(["version", "channel", "install source", "restart", "protocol"],
                         pair["occurrence_members"][1]["required_dimensions"])
        self.assertFalse(any(pair[key] for key in ("second_owner_read", "second_check_dispatched",
                                                  "second_descriptor_created", "mutation_dispatched")))
        self.assertEqual("none", pair["native_claim"])

    def test_dropped_occurrence_duplicate_query_and_second_read_fail(self):
        pair = self.positive("two_occurrence_projection_of_one_read")
        pair["occurrence_members"] = pair["occurrence_members"][:1]
        self.assertTrue(self.errors("application_update_owner_read_pair", pair))

        pair = self.positive("two_occurrence_projection_of_one_read")
        pair["occurrence_members"][1]["query_ref"] = pair["occurrence_members"][0]["query_ref"]
        self.assertIn("owner_read_pair_duplicate_query", self.semantic("application_update_owner_read_pair", pair))

        pair = self.positive("two_occurrence_projection_of_one_read")
        pair["second_check_dispatched"] = True
        self.assertTrue(self.errors("application_update_owner_read_pair", pair))

        pair = self.positive("two_occurrence_projection_of_one_read")
        pair["occurrence_members"][0]["occurrence_id"] = "sep03-doctor-043"
        self.assertIn("owner_read_pair_occurrence_identity", self.semantic("application_update_owner_read_pair", pair))

        pair = self.positive("two_occurrence_projection_of_one_read")
        pair["fact_key"] = "content_update"
        self.assertTrue(self.errors("application_update_owner_read_pair", pair))

    def test_projection_refuses_a_second_owner_result_or_second_work(self):
        def second_result(kind, ref):
            value = self.resolve(kind, ref)
            if kind == "doctor_owner_query_result" and ref.endswith("app-update-updates"):
                value["owner_result_ref"] = "owner-read-result:other"
            return value

        verdict = self.projection(resolve_record=second_result)
        self.assertIn("owner_read_pair_second_owner_result:sep03-doctor-043", verdict["failures"])

        def second_work(kind, ref):
            value = self.resolve(kind, ref)
            if kind == "doctor_owner_query_request" and ref.endswith("app-update-updates"):
                value["observable_work_ref"] = "observable-work:second-check"
            return value

        self.assertIn("owner_read_pair_second_work:sep03-doctor-043",
                      self.projection(resolve_record=second_work)["failures"])

        def second_read(kind, ref):
            value = self.resolve(kind, ref)
            if kind == "doctor_owner_query_request" and ref.endswith("app-update-updates"):
                value["owner_request_ref"] = "owner-read:application-update:second"
            return value

        self.assertIn("owner_read_pair_second_read:sep03-doctor-043",
                      self.projection(resolve_record=second_read)["failures"])

    def test_projection_refuses_reused_query_missing_dimension_and_unfinished_query(self):
        def reused(kind, ref):
            if kind.startswith("doctor_owner_query"):
                return self.resolve(kind, "doctor-query:app-update-server" if kind.endswith("request")
                                    else "doctor-query-result:app-update-server")
            return self.resolve(kind, ref)

        failures = self.projection(resolve_record=reused)["failures"]
        self.assertIn("owner_read_pair_query_reused:sep03-doctor-043", failures)

        def missing_dimension(kind, ref):
            value = self.resolve(kind, ref)
            if kind == "owner_result":
                value["fields"]["available_update"] = None
            return value

        self.assertIn("owner_read_pair_dimension_missing:sep03-doctor-008:available update",
                      self.projection(resolve_record=missing_dimension)["failures"])

        def unfinished(kind, ref):
            value = self.resolve(kind, ref)
            if kind == "doctor_owner_query_result" and ref.endswith("app-update-updates"):
                value["status"] = "failed"
            return value

        self.assertIn("owner_read_pair_query_not_completed:sep03-doctor-043",
                      self.projection(resolve_record=unfinished)["failures"])

    def test_projection_refuses_unresolved_records_and_wrong_cache_generation(self):
        def missing(kind, ref):
            raise FileNotFoundError(ref)

        verdict = self.projection(resolve_record=missing)
        self.assertTrue(any(failure.startswith("owner_read_pair_unresolved_query") for failure in verdict["failures"]))
        originals = copy.deepcopy(self.originals)
        originals["state"]["cache_generation"] = 4
        self.assertIn("owner_read_pair_cache_generation",
                      self.projection(originals=originals)["failures"])

    def test_companion_carries_no_secret_or_content_payload(self):
        forbidden = ("password", "passwd", "secret", "api_key", "apikey", "access_token",
                     "refresh_token", "bearer", "cookie", "authorization", "private_key",
                     "-----begin", "release-note-body", "package-bytes")

        def walk(value, path="$"):
            if isinstance(value, str):
                yield path, value
            elif isinstance(value, dict):
                for key, child in value.items():
                    yield path + "." + str(key), key
                    yield from walk(child, path + "." + str(key))
            elif isinstance(value, list):
                for index, child in enumerate(value):
                    yield from walk(child, path + "[" + str(index) + "]")

        for case in self.fixtures["valid"]:
            for path, text in walk(case["value"]):
                with self.subTest(case=case["name"], path=path):
                    self.assertFalse(any(token in text.lower() for token in forbidden), text)
        for field in ("owner_field_provenance",):
            provenance = self.schema["$defs"][field]["properties"]["evidence_refs"]
            self.assertEqual(16, provenance["maxItems"])
            self.assertEqual(1, provenance["minItems"])
        request_failures = self.semantic("application_update_owner_read_request",
                                         self.positive("one_owner_read_request_for_two_occurrences"))
        self.assertEqual([], request_failures)

    def test_safe_ref_rejects_secret_bearing_evidence_refs(self):
        for reference in ("authorization:bearer:abc", "owner-record:api_key:update",
                          "owner-record:refresh_token:update"):
            value = self.positive("one_owner_read_result_union_dimensions")
            value["owner_original_join"]["installed_version_original_ref"] = reference
            with self.subTest(reference=reference):
                self.assertTrue(self.errors("application_update_owner_read_result", value))
        credential = self.positive("one_owner_read_result_union_dimensions")
        credential["owner_original_join"]["installed_version_original_ref"] = "owner-record:update-credential:pm-app-01"
        self.assertIn("owner_read_result_sensitive_material_ref",
                      self.semantic("application_update_owner_read_result", credential))
        request = self.positive("one_owner_read_request_for_two_occurrences")
        request["redaction_profile_ref"] = "redaction:release-note-body"
        self.assertIn("owner_read_request_sensitive_material_ref",
                      self.semantic("application_update_owner_read_request", request))

    def test_independent_original_keys_cannot_be_co_mutated(self):
        result = self.positive("one_owner_read_result_union_dimensions")
        result["owner_original_join"]["installed_version_original_ref"] = "foreign:installed-version"
        result["fields"]["version"]["installed_provenance"]["owner_record_ref"] = "foreign:installed-version"
        self.reseal(result)
        failures = self.join(result=result)["failures"]
        self.assertIn("owner_read_installed_version_original_key", failures)
        self.assertIn("owner_read_installed_version_original_ref", failures)
        self.assertIn("installed_version_record_key",
                      self.semantic("application_update_owner_read_result", result))

        result = self.positive("one_owner_read_result_union_dimensions")
        result["owner_original_join"]["server_protocol_original_ref"] = "foreign:server-protocol"
        result["fields"]["protocol"]["provenance"]["owner_record_ref"] = "foreign:server-protocol"
        self.reseal(result)
        failures = self.join(result=result)["failures"]
        self.assertIn("owner_read_protocol_original_key", failures)
        self.assertIn("owner_read_protocol_original_ref", failures)
        self.assertIn("protocol_record_key", self.semantic("application_update_owner_read_result", result))

        result = self.positive("one_owner_read_result_union_dimensions")
        result["owner_original_join"]["installation_authority_original_ref"] = "foreign:installation-authority"
        result["owner_original_join"]["source_result_original_ref"] = "foreign:source-result"
        result["owner_original_join"]["lifecycle_journal_original_ref"] = "foreign:update-journal"
        self.reseal(result)
        failures = self.join(result=result)["failures"]
        self.assertIn("owner_read_installation_authority_original_key", failures)
        self.assertIn("owner_read_source_result_original_key", failures)
        self.assertIn("owner_read_lifecycle_original_key", failures)

    def test_stale_independent_original_records_fail_currentness(self):
        originals = copy.deepcopy(self.originals)
        originals["installed_version"]["record"]["installation_generation"] = 999
        failures = self.join(originals=originals)["failures"]
        self.assertIn("owner_read_installed_version_record_generation", failures)
        self.assertIn("owner_read_installed_version_record_original", failures)

        originals = copy.deepcopy(self.originals)
        originals["installed_version"]["record"]["source_generation"] = 99
        self.assertIn("owner_read_installed_version_record_source_generation", self.join(originals=originals)["failures"])

        originals = copy.deepcopy(self.originals)
        originals["installed_version"]["record"]["source_id"] = "update-source:nightly"
        self.assertIn("owner_read_installed_version_record_scope:source_id", self.join(originals=originals)["failures"])

        originals = copy.deepcopy(self.originals)
        originals["installed_version"]["record"]["installation_authority_ref"] = "foreign:installation-authority"
        self.assertIn("owner_read_installed_version_record_authority", self.join(originals=originals)["failures"])

        originals = copy.deepcopy(self.originals)
        originals["server_protocol"]["value"]["installation_generation"] = 999
        self.assertIn("owner_read_protocol_record_generation", self.join(originals=originals)["failures"])

        originals = copy.deepcopy(self.originals)
        originals["server_protocol"]["projection_ref"] = "foreign:server-connection"
        self.assertIn("owner_read_protocol_projection_ref", self.join(originals=originals)["failures"])

        originals = copy.deepcopy(self.originals)
        originals["installed_version"]["record_ref"] = "foreign:installed-version"
        failures = self.join(originals=originals)["failures"]
        self.assertIn("owner_read_installed_version_original_key", failures)
        self.assertIn("owner_read_installed_version_record_key", failures)

    def test_embedded_owner_value_record_must_match_the_independent_record(self):
        originals = copy.deepcopy(self.originals)
        originals["installed_version"]["record"]["installed_version"] = "1.4.3"
        originals["installed_version"]["version"] = "1.4.3"
        result = self.reseal(self.positive("one_owner_read_result_union_dimensions"))
        failures = self.join(result=result, originals=originals)["failures"]
        self.assertIn("owner_read_installed_version_record_original", failures)
        self.assertIn("owner_read_installed_version_record_value", failures)

    def test_projection_consumes_the_validated_owner_read(self):
        def substituted_owner_result(kind, ref):
            value = self.resolve(kind, ref)
            if kind == "owner_result":
                value["fields"]["version"]["installed_version"] = "999.0.0"
                value["fields"]["version"]["installed_version_record"]["installed_version"] = "999.0.0"
                value["payload_digest"] = owner_read.payload_digest(value["fields"])
            return value

        verdict = self.projection(resolve_record=substituted_owner_result)
        self.assertIn("owner_read_projection_owner_read_installed_version_mismatch", verdict["failures"])
        self.assertFalse(verdict["certifies_native_issuer"])

        def substituted_owner_request(kind, ref):
            value = self.resolve(kind, ref)
            if kind == "owner_request":
                value["scope"]["server_id"] = "server:other"
            return value

        failures = self.projection(resolve_record=substituted_owner_request)["failures"]
        self.assertIn("owner_read_projection_owner_read_request_server_scope", failures)
        self.assertIn("owner_read_projection_owner_read_request_result_scope", failures)

        def second_owner_request(kind, ref):
            value = self.resolve(kind, ref)
            if kind == "owner_request" and ref == "owner-read:application-update:home-01:pm-app-01":
                return value
            return value

        def missing_owner_request(kind, ref):
            if kind == "owner_request":
                raise KeyError(ref)
            return self.resolve(kind, ref)

        failures = self.projection(resolve_record=missing_owner_request)["failures"]
        self.assertTrue(any(failure.startswith("owner_read_pair_owner_request_unavailable") for failure in failures))
        self.assertIn("owner_read_projection_owner_read_unresolved", failures)

    def test_projection_requires_one_owner_request_for_both_members(self):
        counter = {"calls": 0}

        def alternating_owner_request(kind, ref):
            value = self.resolve(kind, ref)
            if kind == "owner_request":
                counter["calls"] += 1
                value = copy.deepcopy(value)
                value["owner_read_ref"] = ref if counter["calls"] == 1 else "owner-read:application-update:second"
            return value

        self.assertIn("owner_read_pair_second_owner_request:sep03-doctor-043",
                      self.projection(resolve_record=alternating_owner_request)["failures"])

    # ----- v3: authority epoch, temporal fence, selected journal/operation ----
    def test_stale_installation_authority_epoch_fails(self):
        originals = copy.deepcopy(self.originals)
        result = self.positive("one_owner_read_result_union_dimensions")
        originals["installed_version"]["record"]["authority_generation"] = 999
        result["fields"]["version"]["installed_version_record"]["authority_generation"] = 999
        self.reseal(result)
        self.assertEqual([], self.errors("application_update_owner_read_result", result))
        failures = self.join(result=result, originals=originals)["failures"]
        self.assertIn("owner_read_installed_version_record_authority_epoch", failures)
        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["version"]["installed_version_record"]["authority_generation"] = 999
        self.reseal(result)
        self.assertIn("installed_version_record_authority_epoch",
                      self.semantic("application_update_owner_read_result", result))

    def test_distinct_generation_domains_are_not_equated(self):
        distinct = self.positive("distinct_generation_domains_owner_read")
        self.assertEqual([], self.errors("application_update_owner_read_result", distinct))
        self.assertEqual([], self.semantic("application_update_owner_read_result", distinct))
        self.assertEqual(11, distinct["scope"]["source_generation"])
        self.assertEqual(4, distinct["scope"]["installation_generation"])
        self.assertEqual(7, distinct["fields"]["version"]["installed_version_record"]["authority_generation"])
        originals = copy.deepcopy(self.originals)
        originals["installed_version"]["record"] = copy.deepcopy(
            distinct["fields"]["version"]["installed_version_record"])
        originals["installed_version"]["version"] = distinct["fields"]["version"]["installed_version"]
        originals["installed_version"]["value_ref"] = distinct["fields"]["version"]["installed_version_ref"]
        originals["installed_version"]["record_ref"] = distinct["fields"]["version"]["installed_version_record"]["currentness_ref"]
        originals["installation_authority"]["authority_generation"] = 7
        self.assertEqual([], self.join(result=distinct, originals=originals)["failures"])

    def test_owner_original_observations_may_not_follow_the_read_finish(self):
        after = "2026-09-24T12:30:00Z"
        cases = (
            ("installed", ("installed_version", "record", "observed_at_utc"),
             ("fields", "version", "installed_version_record", "observed_at_utc"),
             "owner_read_installed_version_original_after_finish", "installed_version_record_after_finish"),
            ("source_result", ("source_result", "record", "completed_at_utc"),
             ("fields", "available_update", "source_result", "completed_at_utc"),
             "owner_read_source_result_original_after_finish", "source_result_record_after_finish"),
            ("lifecycle", ("lifecycle", "disclosure", "observed_at_utc"),
             ("fields", "restart_requirement", "lifecycle_disclosure", "observed_at_utc"),
             "owner_read_lifecycle_original_after_finish", "lifecycle_record_after_finish"),
            ("protocol", ("server_protocol", "value", "observed_at_utc"),
             ("fields", "protocol", "server_value", "observed_at_utc"),
             "owner_read_protocol_original_after_finish", "protocol_record_after_finish"),
        )
        for label, original_path, result_path, join_label, semantic_label in cases:
            originals = copy.deepcopy(self.originals)
            result = self.positive("one_owner_read_result_union_dimensions")
            node = originals
            for part in original_path[:-1]:
                node = node[part]
            node[original_path[-1]] = after
            node = result
            for part in result_path[:-1]:
                node = node[part]
            node[result_path[-1]] = after
            self.reseal(result)
            with self.subTest(original=label):
                self.assertEqual([], self.errors("application_update_owner_read_result", result))
                self.assertIn(join_label, self.join(result=result, originals=originals)["failures"])
                self.assertIn(semantic_label, self.semantic("application_update_owner_read_result", result))

    def test_older_still_current_owner_facts_remain_admissible(self):
        older = self.positive("older_still_current_owner_facts")
        self.assertEqual([], self.errors("application_update_owner_read_result", older))
        self.assertEqual([], self.semantic("application_update_owner_read_result", older))
        originals = copy.deepcopy(self.originals)
        originals["installed_version"]["record"] = copy.deepcopy(older["fields"]["version"]["installed_version_record"])
        originals["installed_version"]["version"] = older["fields"]["version"]["installed_version"]
        originals["installed_version"]["record_ref"] = originals["installed_version"]["record"]["currentness_ref"]
        originals["installed_version"]["value_ref"] = older["fields"]["version"]["installed_version_ref"]
        originals["source_result"]["record"] = copy.deepcopy(older["fields"]["available_update"]["source_result"])
        originals["lifecycle"]["disclosure"] = copy.deepcopy(older["fields"]["restart_requirement"]["lifecycle_disclosure"])
        selected = copy.deepcopy(older["fields"]["restart_requirement"]["selected_current_original"])
        selected["observed_at_utc"] = originals["lifecycle"]["disclosure"]["observed_at_utc"]
        originals["lifecycle"]["selected_current"]["candidates"] = [selected]
        originals["lifecycle"]["selected_current"]["resolved_at_utc"] = selected["resolved_at_utc"]
        originals["server_protocol"]["value"] = copy.deepcopy(older["fields"]["protocol"]["server_value"])
        self.assertEqual([], self.join(result=older, originals=originals)["failures"])
        self.assertTrue(originals["installed_version"]["record"]["observed_at_utc"] < older["started_at_utc"])

    def test_selected_current_original_is_typed_and_independently_resolved(self):
        result = self.positive("one_owner_read_result_union_dimensions")
        embedded = result["fields"]["restart_requirement"]["selected_current_original"]
        self.assertEqual("pm.release_update.selected_current_journal_original.v1", embedded["schema_id"])
        self.assertEqual("Plans/Release_Supply_Chain.md#RSC-014", embedded["owner_ref"])
        self.assertEqual([], self.join()["failures"])
        self.assertEqual([], self.projection()["failures"])

        originals = copy.deepcopy(self.originals)
        originals["lifecycle"]["selected_current"]["resolution_ref"] = "update-service-resolution:other"
        self.assertIn("owner_read_selected_current_resolution_resolution_ref", self.join(originals=originals)["failures"])

        originals = copy.deepcopy(self.originals)
        originals["lifecycle"]["selected_current"]["journal_authority_generation"] = 13
        self.assertIn("owner_read_selected_current_resolution_journal_authority_generation",
                      self.join(originals=originals)["failures"])

        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["restart_requirement"]["selected_current_original"]["resolved_at_utc"] = "2026-09-24T12:30:00Z"
        self.reseal(result)
        originals = copy.deepcopy(self.originals)
        originals["lifecycle"]["selected_current"]["resolved_at_utc"] = "2026-09-24T12:30:00Z"
        failures = self.join(result=result, originals=originals)["failures"]
        self.assertIn("owner_read_selected_current_resolution_after_finish", failures)
        self.assertIn("selected_current_resolution_after_finish", failures)

    def test_caller_changed_disclosure_or_original_with_fixed_resolved_original_fails(self):
        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["restart_requirement"]["lifecycle_disclosure"]["operation_id"] = "operation:unrelated"
        self.reseal(result)
        self.assertEqual([], self.errors("application_update_owner_read_result", result))
        failures = self.join(result=result)["failures"]
        self.assertIn("lifecycle_disclosure_selected_operation_id", failures)
        self.assertIn("owner_read_lifecycle_original", failures)

        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["restart_requirement"]["lifecycle_disclosure"]["phase_revision"] = 99
        self.reseal(result)
        self.assertIn("lifecycle_disclosure_selected_phase_revision", self.join(result=result)["failures"])

        result = self.positive("one_owner_read_result_union_dimensions")
        selected = result["fields"]["restart_requirement"]["selected_current_original"]
        selected["operation_id"] = "operation:unrelated"
        selected["journal_generation"] = 99
        self.reseal(result)
        self.assertEqual([], self.errors("application_update_owner_read_result", result))
        failures = self.join(result=result)["failures"]
        self.assertIn("owner_read_selected_current_original", failures)
        self.assertIn("lifecycle_disclosure_selected_operation_id", failures)
        self.assertIn("lifecycle_disclosure_selected_journal_generation", failures)

    def test_foreign_absent_ambiguous_or_unresolved_selection_fails(self):
        foreign = copy.deepcopy(self.originals)
        candidate = foreign["lifecycle"]["selected_current"]["candidates"][0]
        candidate["original_ref"] = "update-service-original:foreign"
        candidate["server_id"] = "server:other"
        failures = self.join(originals=foreign)["failures"]
        self.assertIn("owner_read_selected_current_original", failures)
        self.assertIn("owner_read_selected_current_scope:server_id", failures)

        absent = copy.deepcopy(self.originals)
        absent["lifecycle"]["selected_current"]["candidates"] = []
        self.assertIn("owner_read_selected_current_absent", self.join(originals=absent)["failures"])

        ambiguous = copy.deepcopy(self.originals)
        second = copy.deepcopy(ambiguous["lifecycle"]["selected_current"]["candidates"][0])
        second["original_ref"] = "update-service-original:selected-current:second"
        ambiguous["lifecycle"]["selected_current"]["candidates"].append(second)
        self.assertIn("owner_read_selected_current_ambiguous", self.join(originals=ambiguous)["failures"])

        def raising(_scope):
            raise FileNotFoundError("no service authority read")

        self.assertIn("owner_read_selected_current_unresolved",
                      self.join(resolve_selected_current=raising)["failures"])
        self.assertIn("owner_read_selected_current_unresolved",
                      self.join(resolve_selected_current=None)["failures"])
        self.assertIn("owner_read_selected_current_unresolved",
                      self.join(resolve_selected_current=lambda _scope: "fixture-label")["failures"])
        self.assertIn("owner_read_projection_owner_read_selected_current_unresolved",
                      self.projection(resolve_selected_current=None)["failures"])

    def test_fixture_or_resolver_label_is_not_the_original(self):
        originals = copy.deepcopy(self.originals)
        originals["lifecycle"]["selected_current"]["candidates"][0]["owner_ref"] = "fixture:selected-current"
        failures = self.join(originals=originals)["failures"]
        self.assertIn("owner_read_selected_current_label", failures)
        self.assertIn("owner_read_selected_current_owner_ref", failures)

        result = self.positive("one_owner_read_result_union_dimensions")
        result["fields"]["restart_requirement"]["selected_current_original"]["owner_ref"] = "resolver-label:selected-current"
        self.reseal(result)
        self.assertEqual([], self.errors("application_update_owner_read_result", result))
        failures = self.join(result=result)["failures"]
        self.assertIn("selected_current_label", failures)
        self.assertIn("selected_current_owner_ref", failures)

    def test_selected_current_domains_and_operations_are_not_equated(self):
        result = self.positive("one_owner_read_result_union_dimensions")
        selected = result["fields"]["restart_requirement"]["selected_current_original"]
        selected["journal_generation"] = 21
        selected["journal_authority_generation"] = 34
        result["fields"]["restart_requirement"]["lifecycle_disclosure"]["journal_generation"] = 21
        self.reseal(result)
        self.assertEqual(4, selected["installation_generation"])
        self.assertEqual(11, selected["source_generation"])
        self.assertEqual(4, self.originals["installation_authority"]["authority_generation"])
        self.assertEqual(21, selected["journal_generation"])
        self.assertEqual(34, selected["journal_authority_generation"])
        self.assertNotEqual(selected["journal_generation"], selected["installation_generation"])
        self.assertNotEqual(selected["journal_generation"], selected["source_generation"])
        self.assertNotEqual(selected["journal_authority_generation"], self.originals["installation_authority"]["authority_generation"])
        self.assertNotEqual(
            selected["operation_id"],
            result["fields"]["available_update"]["source_result"]["operation_id"],
        )
        originals = copy.deepcopy(self.originals)
        originals["lifecycle"]["disclosure"]["journal_generation"] = 21
        originals["lifecycle"]["selected_current"]["candidates"] = [copy.deepcopy(selected)]
        originals["lifecycle"]["selected_current"]["journal_authority_generation"] = selected["journal_authority_generation"]
        self.assertEqual([], self.join(result=result, originals=originals)["failures"])

    def test_older_selected_original_still_current_is_admissible(self):
        result = self.positive("one_owner_read_result_union_dimensions")
        selected = result["fields"]["restart_requirement"]["selected_current_original"]
        selected["observed_at_utc"] = "2026-09-24T11:20:00Z"
        selected["resolved_at_utc"] = "2026-09-24T11:30:00Z"
        disclosure = result["fields"]["restart_requirement"]["lifecycle_disclosure"]
        disclosure["observed_at_utc"] = "2026-09-24T11:20:00Z"
        originals = copy.deepcopy(self.originals)
        originals["lifecycle"]["disclosure"]["observed_at_utc"] = "2026-09-24T11:20:00Z"
        originals["lifecycle"]["selected_current"]["candidates"] = [copy.deepcopy(selected)]
        originals["lifecycle"]["selected_current"]["resolved_at_utc"] = "2026-09-24T11:30:00Z"
        originals["lifecycle"]["selected_current"]["journal_authority_generation"] = selected["journal_authority_generation"]
        self.reseal(result)
        self.assertTrue(selected["observed_at_utc"] < result["started_at_utc"])
        self.assertEqual([], self.join(result=result, originals=originals)["failures"])

    def test_no_owner_result_deadline_policy_here_and_controller_rejects_late_completion(self):
        late = self.positive("one_owner_read_result_union_dimensions")
        late["finished_at_utc"] = "2026-09-24T12:30:00Z"
        self.reseal(late)
        originals = copy.deepcopy(self.originals)
        originals["lifecycle"]["selected_current"]["candidates"][0]["observed_at_utc"] = "2026-09-24T12:29:00Z"
        originals["lifecycle"]["selected_current"]["resolved_at_utc"] = "2026-09-24T12:29:30Z"
        originals["lifecycle"]["disclosure"]["observed_at_utc"] = "2026-09-24T12:29:00Z"
        late["fields"]["restart_requirement"]["lifecycle_disclosure"]["observed_at_utc"] = "2026-09-24T12:29:00Z"
        late["fields"]["restart_requirement"]["selected_current_original"]["observed_at_utc"] = "2026-09-24T12:29:00Z"
        late["fields"]["restart_requirement"]["selected_current_original"]["resolved_at_utc"] = "2026-09-24T12:29:30Z"
        self.reseal(late)
        failures = self.join(result=late, originals=originals)["failures"]
        self.assertEqual([], [failure for failure in failures if "deadline" in failure])
        self.assertNotIn("deadline", json.dumps(failures))
        self.assertTrue(late["finished_at_utc"] > self.positive("one_owner_read_request_for_two_occurrences")["deadline_utc"])

        module = self._controller_semantics()
        batch, result, records, descriptor = self._controller_doubles()

        def run(finished):
            query_result = copy.deepcopy(records[("doctor_owner_query_result", "doctor-query-result:app-update-server")])
            query_result["finished_at_utc"] = finished
            store = dict(records)
            store[("doctor_owner_query_result", "doctor-query-result:app-update-server")] = query_result
            return module.validate_doctor_batch(
                batch["batch_id"],
                result["result_id"],
                resolve_record=lambda kind, ref: copy.deepcopy({**store, ("doctor_batch_request", batch["batch_id"]): batch,
                                                               ("doctor_batch_result", result["result_id"]): result}[(kind, ref)]),
                resolve_descriptor=lambda check_id, revision: copy.deepcopy(descriptor),
                verify_frozen_selection=lambda *args: [],
                validate_owner_value=lambda schema_ref, value: (owner_read.structural_errors("application_update_owner_read_result", value)
                                                               if schema_ref.endswith("#application_update_owner_read_result") else []),
                verify_read_admission=lambda *args: [],
                verify_owner_read=lambda *args: [],
                verify_member_disposition=lambda *args: [],
                verify_batch_controls=lambda *args: [],
                check_current_disclosure=lambda *args: [],
            )

        self.assertEqual([], run("2026-09-24T12:00:28Z"))
        after_deadline = run("2026-09-24T12:00:40Z")
        self.assertIn("completed_member_after_deadline", after_deadline)

    def _controller_semantics(self):
        spec = importlib.util.spec_from_file_location("v3_controller_semantics", ARTIFACT_ROOT / "scripts/pm_doctor_query_semantics.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        controller = json.loads((ARTIFACT_ROOT / "Plans/doctor_query_controller_contracts.schema.json").read_text())
        doctor = json.loads((ARTIFACT_ROOT / "Plans/doctor_contracts.schema.json").read_text())
        registry = (Registry()
                    .with_resource(controller["$id"], Resource.from_contents(controller))
                    .with_resource(doctor["$id"], Resource.from_contents(doctor)))
        # Loader double only: this selected-file copy lacks
        # Plans/backup_restore_system_contracts.schema.json, so the controller module's own
        # schema loader cannot run. The deadline rule under test is the module's own code.
        module._schemas = lambda: (controller, registry)
        return module

    def _controller_doubles(self):
        descriptor = self.positive("application_update_owner_read_descriptor")
        member = {
            "member_id": "doctor-member:app-update-server",
            "descriptor": copy.deepcopy(descriptor),
            "target": {"kind": "application", "identity_ref": "installation:pm-app-01", "server_id": "server:home-01",
                       "project_id": None, "host_id": None, "environment_id": None, "route_ref": None},
            "expected_owner_generation": 7,
            "expected_cache_generation": 3,
            "applicability_ref": "applicability:installed-application-installations",
        }
        batch = {
            "schema_id": "pm.doctor.batch_request.v1", "schema_version": "1.0.0",
            "batch_id": "doctor-batch:application-update", "actor_ref": "actor:human",
            "scope": {"kind": "application", "server_id": None, "project_id": None},
            "selection_mode": "selected_checks",
            "selection_evidence_ref": "selection:doctor-application-update",
            "members": [member],
            "requested_at_utc": "2026-09-24T12:00:05Z", "deadline_utc": "2026-09-24T12:01:00Z",
            "idempotency_key": "idempotency:doctor-application-update", "parent_batch_ref": None,
        }
        result = {
            "schema_id": "pm.doctor.batch_result.v1", "schema_version": "1.0.0",
            "batch_id": batch["batch_id"], "result_id": "doctor-batch-result:application-update",
            "status": "completed",
            "outcomes": [{
                "member_id": member["member_id"], "status": "completed",
                "query_ref": "doctor-query:app-update-server",
                "result_ref": "doctor-query-result:app-update-server",
                "finding_ref": "doctor-finding:application-update",
                "disposition_evidence_ref": "evidence:disposition:application-update",
            }],
            "controls": [],
            "started_at_utc": "2026-09-24T12:00:10Z", "finished_at_utc": "2026-09-24T12:00:45Z",
        }
        records = {}
        for (kind, ref), value in self.records.items():
            records[(kind, ref)] = copy.deepcopy(value)
        records[("doctor_read_admission", "permissions:doctor-read-admission:application-update")] = {
            "schema_id": "pm.permissions.doctor_read_admission.v1", "schema_version": "1.0.0",
            "decision_id": "permissions-decision:doctor-read:application-update",
            "batch_id": batch["batch_id"], "member_id": member["member_id"],
            "query_id": "doctor-query:app-update-server", "actor_ref": batch["actor_ref"],
            "scope": batch["scope"], "target": member["target"],
            "descriptor_revision": descriptor["descriptor_revision"],
            "permission_class": descriptor["permission_class"],
            "policy_ref": "permissions-policy:doctor-read",
            "policy_generation": 11, "authority_generation": 7,
            "audit_admission_ref": "permissions-audit:doctor-read:application-update",
            "redaction_profile_ref": descriptor["redaction_profile_ref"],
            "decision": "allow", "reason_ref": None,
            "evaluated_at_utc": "2026-09-24T12:00:00Z", "expires_at_utc": "2026-09-24T12:05:00Z",
            "expected_owner_generation": member["expected_owner_generation"],
            "expected_cache_generation": member["expected_cache_generation"],
        }
        records[("doctor_finding_projection", "doctor-finding:application-update")] = {
            "schema_id": "pm.doctor.finding_projection.v1", "schema_version": "1.0.0",
            "finding_id": "doctor-finding:application-update",
            "check_id": descriptor["check_id"],
            "descriptor_revision": descriptor["descriptor_revision"],
            "owner_doc_ref": descriptor["owner_doc_ref"],
            "project_id": None, "target_kind": "application", "target_id": "installation:pm-app-01",
            "status": "healthy", "severity": "info", "task_impact": "none", "applicability": "required",
            "reason": "owner read completed for the exact installation scope",
            "observed_at_utc": "2026-09-24T12:00:28Z", "freshness_state": "fresh", "age_ms": 0,
            "confidence": "high", "owner_generation": member["expected_owner_generation"],
            "cache_generation": member["expected_cache_generation"],
            "last_known_result_ref": self.positive("one_owner_read_result_union_dimensions")["result_id"],
            "details_ref": None, "logs_ref": None, "receipt_refs": [],
            "evidence_refs": ["evidence:application-update:owner-read"],
            "remediation": None, "check_cost_class": descriptor["cost_class"],
            "redaction_state": "redacted",
        }
        return batch, result, records, descriptor

    def test_owner_value_definitions_are_owned_by_release_and_server(self):
        release = json.loads((ARTIFACT_ROOT / "Plans/release_update_contracts.schema.json").read_text())
        server = json.loads((ARTIFACT_ROOT / "Plans/server_system_contracts.schema.json").read_text())
        self.assertIn("ApplicationUpdateInstalledVersionValue", release["$defs"])
        self.assertIn("ApplicationUpdateLifecycleDisclosure", release["$defs"])
        self.assertIn("server_protocol_compatibility_value", server["$defs"])
        self.assertIn("restart-required",
                      release["$defs"]["ApplicationUpdateLifecycleDisclosure"]["properties"]["phase"]["enum"])
        self.assertEqual(
            ["Plans/Server_System.md#SRV-007", "Plans/Server_System.md#SRV-008"],
            [entry["const"] for entry in
             server["$defs"]["server_protocol_compatibility_value"]["properties"]["plan_unit_refs"]["prefixItems"]],
        )
        self.assertFalse(server["$defs"]["server_protocol_compatibility_value"]["properties"]["runtime_claim"]["const"])
        self.assertEqual("pm.server_protocol_compatibility_value.v1",
                         server["$defs"]["server_protocol_compatibility_value"]["properties"]["schema_id"]["const"])
        self.assertEqual("pm.release_update.installed_version_value.v1",
                         release["$defs"]["ApplicationUpdateInstalledVersionValue"]["properties"]["schema_id"]["const"])
        self.assertEqual("pm.release_update.lifecycle_disclosure.v1",
                         release["$defs"]["ApplicationUpdateLifecycleDisclosure"]["properties"]["schema_id"]["const"])
        descriptor = json.loads((ARTIFACT_ROOT / "Plans/doctor_application_update_owner_read_contract_fixtures.json").read_text())["valid"][0]["value"]
        self.assertEqual("Plans/Release_Supply_Chain.md#RSC-014", descriptor["owner_doc_ref"])


class DoctorApplicationUpdateCatalogBinding(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = json.loads((ARTIFACT_ROOT / "Plans/doctor_source_coverage.json").read_text())
        cls.schema = json.loads((ARTIFACT_ROOT / "Plans/doctor_source_coverage.schema.json").read_text())

    def check(self, value, root=None):
        return coverage.validate_coverage(value, repo_root=str(root or ROOT), schema=self.schema)

    def binding_failures(self, value, root=None):
        return [failure for failure in self.check(value, root=root)
                if failure.startswith(("full_dimension_binding", "binding_"))]

    def test_binding_is_scoped_to_the_two_app_update_occurrences(self):
        rows = self.catalog["occurrences"]
        bound = [row for row in rows if row["full_dimension_query_binding"] != "unbound"]
        unbound = [row for row in rows if row["full_dimension_query_binding"] == "unbound"]
        self.assertEqual(["sep03-doctor-008", "sep03-doctor-043"], [row["occurrence_id"] for row in bound])
        self.assertEqual(50, len(unbound))
        self.assertEqual(1, len({json.dumps(row["full_dimension_query_binding"], sort_keys=True) for row in bound}))
        self.assertEqual("incomplete", self.catalog["leaf_binding_status"])
        self.assertEqual([35, 37, 41],
                         [index + 1 for index, row in enumerate(rows) if row["bounded_leaf"]])
        self.assertEqual(51, len({row["source_label"] for row in rows}))
        for row in bound:
            binding = row["full_dimension_query_binding"]
            self.assertEqual("bound_to_typed_owner_read", binding["state"])
            self.assertEqual("application_update", binding["fact_key"])
            self.assertEqual(row["shared_fact_key"], binding["fact_key"])
            self.assertEqual("none", binding["native_claim"])
            self.assertEqual("static_typed_contract_join_only", binding["evidence_level"])
            self.assertNotIn("doctor", row["source_label"])

    def test_binding_is_supported_by_the_authored_typed_join(self):
        self.assertEqual([], self.binding_failures(self.catalog, root=ARTIFACT_ROOT))
        binding = self.catalog["occurrences"][7]["full_dimension_query_binding"]
        for reference in (binding["owner_read_schema_ref"], binding["request_schema_ref"],
                          binding["result_schema_ref"], binding["server_protocol_join_ref"],
                          *binding["owner_value_refs"], binding["descriptor_ref"]):
            with self.subTest(reference=reference):
                self.assertIsInstance(coverage.resolve_local_ref(ARTIFACT_ROOT, reference), dict)

    def test_binding_requires_the_actual_descriptor_and_typed_artifacts(self):
        descriptor_ref = "Plans/doctor_application_update_owner_read_contract_fixtures.json#/valid/0/value"
        original = coverage.resolve_local_ref

        def mutate(field, value):
            def patched(root, ref):
                resolved = original(root, ref)
                if ref == descriptor_ref:
                    resolved = copy.deepcopy(resolved)
                    resolved[field] = value
                return resolved

            from unittest.mock import patch as patch_function
            with patch_function.object(coverage, "resolve_local_ref", patched):
                return self.binding_failures(self.catalog, root=ARTIFACT_ROOT)

        self.assertIn("full_dimension_binding_descriptor_route:request_schema_ref",
                      mutate("request_schema_ref", "schema:opaque:v1"))
        self.assertIn("full_dimension_binding_descriptor_route:result_schema_ref",
                      mutate("result_schema_ref", "schema:opaque:v1"))
        self.assertIn("full_dimension_binding_descriptor_mismatch", mutate("check_id", "doctor.other"))
        self.assertIn("full_dimension_binding_descriptor_mismatch", mutate("descriptor_revision", 2))
        self.assertIn("full_dimension_binding_descriptor_mismatch", mutate("owner_doc_ref", "Plans/newtools.md"))
        self.assertIn("full_dimension_binding_descriptor_mismatch", mutate("target_kinds", ["server"]))
        self.assertIn("full_dimension_binding_descriptor_mismatch", mutate("side_effect_policy", "mutating"))

    def test_binding_cannot_be_flipped_or_extended(self):
        cases = {}
        row = copy.deepcopy(self.catalog)
        row["occurrences"][7]["full_dimension_query_binding"] = "unbound"
        cases["one_occurrence_unbound"] = row
        row = copy.deepcopy(self.catalog)
        row["occurrences"][42]["full_dimension_query_binding"] = "unbound"
        cases["second_occurrence_unbound"] = row
        row = copy.deepcopy(self.catalog)
        row["occurrences"][6]["full_dimension_query_binding"] = copy.deepcopy(
            self.catalog["occurrences"][7]["full_dimension_query_binding"])
        cases["third_row_bound"] = row
        row = copy.deepcopy(self.catalog)
        row["occurrences"][7]["full_dimension_query_binding"]["native_claim"] = "native_issuer"
        cases["native_issuer_claim"] = row
        row = copy.deepcopy(self.catalog)
        row["occurrences"][42]["full_dimension_query_binding"]["descriptor_revision"] = 2
        cases["second_binding_differs"] = row
        row = copy.deepcopy(self.catalog)
        row["occurrences"][7]["full_dimension_query_binding"]["state"] = "unsupported"
        cases["fabricated_unsupported"] = row
        for label, catalog in cases.items():
            with self.subTest(case=label):
                self.assertTrue(self.check(catalog, root=ARTIFACT_ROOT), f"{label} was accepted")

    def test_binding_without_the_typed_artifact_fails_closed(self):
        from unittest.mock import patch as patch_function
        original = coverage.resolve_local_ref

        def hidden(root, ref):
            if ref.startswith("Plans/doctor_application_update_owner_read_contracts.schema.json"):
                raise FileNotFoundError(ref)
            return original(root, ref)

        with patch_function.object(coverage, "resolve_local_ref", hidden):
            self.assertIn("binding_owner_read_unresolved:Plans/doctor_application_update_owner_read_contracts.schema.json",
                          self.binding_failures(self.catalog, root=ARTIFACT_ROOT))


class DoctorApplicationUpdateGateEnrollment(unittest.TestCase):
    def test_pair_processing_matches_the_closed_gate_or_reports_missing_inputs(self):
        gate_path = ARTIFACT_ROOT / "scripts/pm-new-contracts-verify.py"
        source = gate_path.read_text()
        self.assertIn("Plans/doctor_application_update_owner_read_contracts.schema.json", source)
        self.assertIn("Plans/doctor_application_update_owner_read_contract_fixtures.json", source)
        spec = importlib.util.spec_from_file_location("doctor_app_update_gate", gate_path)
        gate = importlib.util.module_from_spec(spec)
        sys.path.insert(0, str(ARTIFACT_ROOT / "scripts"))
        try:
            spec.loader.exec_module(gate)
        except ModuleNotFoundError as exc:
            # Selected-file job copy: sibling gate modules are not present here, so
            # replay the gate's closed legacy recipe locally instead of pretending
            # the central gate ran.
            self.assertTrue(str(exc).startswith("No module named 'pm_"), str(exc))
            self._replay_closed_recipe()
            return
        self.assertIn(
            ("Plans/doctor_application_update_owner_read_contracts.schema.json",
             "Plans/doctor_application_update_owner_read_contract_fixtures.json"),
            gate.CONTRACT_PAIRS,
        )
        self._replay_closed_recipe(gate)

    def _replay_closed_recipe(self, gate=None):
        schema = json.loads((ARTIFACT_ROOT / "Plans/doctor_application_update_owner_read_contracts.schema.json").read_text())
        fixtures = json.loads((ARTIFACT_ROOT / "Plans/doctor_application_update_owner_read_contract_fixtures.json").read_text())
        registry = Registry()
        for name in owner_read.OWNER_SCHEMA_FILES:
            document = json.loads((ARTIFACT_ROOT / "Plans" / name).read_text())
            registry = registry.with_resource(document["$id"], Resource.from_contents(document))
        positives = fixtures["valid"]
        by_name = {case["name"]: case for case in positives}
        for case in positives:
            subset = {key: value for key, value in schema.items()
                      if key not in {"oneOf", "anyOf", "allOf", "type", "properties", "required", "additionalProperties"}}
            subset.update({"$ref": "#/$defs/" + case["definition"]})
            errors = list(Draft202012Validator(subset, registry=registry, format_checker=FormatChecker()).iter_errors(case["value"]))
            self.assertEqual([], errors, case["name"])
            self.assertEqual([], owner_read.application_update_owner_read_semantic_failures(case["definition"], case["value"]))
        for case in fixtures["invalid"]:
            base = by_name[case["base_valid"]]
            value = copy.deepcopy(base["value"])
            for dotted, replacement in (case.get("patch") or {}).items():
                parts = dotted.split(".")
                node = value
                for part in parts[:-1]:
                    node = node[int(part)] if isinstance(node, list) else node[part]
                leaf = parts[-1]
                if isinstance(node, list):
                    node[int(leaf)] = copy.deepcopy(replacement)
                else:
                    node[leaf] = copy.deepcopy(replacement)
            for dotted in case.get("remove") or []:
                parts = dotted.split(".")
                node = value
                for part in parts[:-1]:
                    node = node[int(part)] if isinstance(node, list) else node[part]
                leaf = parts[-1]
                if isinstance(node, list):
                    node.pop(int(leaf))
                else:
                    node.pop(leaf, None)
            subset = {key: value for key, value in schema.items()
                      if key not in {"oneOf", "anyOf", "allOf", "type", "properties", "required", "additionalProperties"}}
            subset.update({"$ref": "#/$defs/" + base["definition"]})
            accepted = Draft202012Validator(subset, registry=registry, format_checker=FormatChecker()).is_valid(value)
            rule = case.get("semantic_rule")
            if rule is None:
                self.assertFalse(accepted, case["name"])
            else:
                self.assertTrue(accepted, case["name"])
                self.assertIn(rule, owner_read.application_update_owner_read_semantic_failures(base["definition"], value))


if __name__ == "__main__":
    unittest.main()
