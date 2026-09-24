"""Read-only canonical composition regression. Set PM_CANON_ROOT explicitly."""
import copy
import json
import os
from dataclasses import replace
from pathlib import Path
import sys
import unittest

ROOT = Path(os.environ.get("PM_CANON_ROOT", str(Path(__file__).resolve().parents[1])))
sys.path.insert(0, str(ROOT / "scripts"))
from onboarding_creation_fixtures import creation_fixture, migration_fixture, FixtureHarness
from pm_onboarding_creation_schema import build_onboarding_v3_storage_bundle, materialized_v3_registry, materialized_v3_redaction
from pm_onboarding_creation import unresolved_creation_selection
from pm_ui_command_response import owner_result_digest
from pm_onboarding_semantics import onboarding_semantic_failures
from pm_forge_creation_semantics import forge_creation_semantic_failures, validate_repository_creation
from pm_forge_creation_options import structural_errors, validate_creation_options, CreationOptionContext
from jsonschema import Draft202012Validator


class CreationCompanionTests(unittest.TestCase):
    def assert_valid_records(self, h):
        for (owner, definition, ref), value in h.records.items():
            self.assertEqual([], h.validate(owner, definition, value), (definition, ref))

    def test_actual_approved_source_maps_all_normal_and_advanced_choices(self):
        h = creation_fixture(ROOT)
        self.assert_valid_records(h)
        before = copy.deepcopy(h.records)
        got = h.produce()
        self.assertEqual("ready", got["status"], got)
        self.assertEqual(before, h.records, "producer is read-only")
        choice, draft = got["choices"], h.session["setup_draft"]
        for key, source in (("repository_name", "repository_name"), ("repository_description", "repository_description"),
                            ("visibility", "repository_visibility"), ("default_branch", "repository_default_branch")):
            self.assertEqual(draft[source], choice[key])
        for key, source in (("initialize_readme", "repository_initialize_readme"), ("gitignore_selection", "repository_gitignore"),
                            ("license_selection", "repository_license")):
            self.assertEqual(draft[source], choice["initialization_policy"][key])
        self.assertTrue(choice["initialization_policy"]["preserve_existing_source_history"])
        self.assertEqual("create", choice["existing_or_create"])
        self.assertEqual("https", choice["requested_git_transport"])
        self.assertEqual("fixture-repository", choice["provider_slug_or_path"])
        self.assertIsNone(choice["source_template_ref"])
        selected = draft["repository_creation_selection"]["provider_options_selection"]["choices"]
        self.assertEqual(selected, [{k: x[k] for k in ("field_id", "category", "value")} for x in choice["provider_options"]["fields"]])
        self.assertEqual(owner_result_digest(draft), got["approval_binding"]["source_sha256"])
        self.assertEqual(h.owner.project_request_ref + "#/onboarding_setup_binding", got["approval_binding"]["project_setup_binding_ref"])
        self.assertIsNone(h.session["project_commit_binding"], "terminal Project result must not be required")
        self.assertNotEqual(h.owner.server_id, h.owner.project_home_server_ref)

    def test_actual_choices_flow_through_full_forge_v2_request_and_semantics(self):
        h = creation_fixture(ROOT)
        output = h.produce()
        self.assertEqual("ready", output["status"])
        composition = copy.deepcopy(h.composition)
        request = composition["request"]
        intent, preview, context = request["repository_creation_intent"], composition["resolved_preview"], composition["execution_snapshot"]
        intent.update(choices=output["choices"], subject=output["subject"], approval_binding=output["approval_binding"])
        preview.update(intent_sha256=owner_result_digest(intent), approval_binding=copy.deepcopy(output["approval_binding"]))
        request["creation_preview_sha256"] = owner_result_digest(preview)
        context.update(approved_intent_sha256=owner_result_digest(intent), approved_choices_sha256=owner_result_digest(output["choices"]),
                       approval_binding=copy.deepcopy(output["approval_binding"]))
        self.assertEqual([], structural_errors("repository_create_command_request_v2", request))
        def resolve(kind, ref):
            row, identity = {"repository_creation_preview": (preview, "preview_id"),
                             "creation_field_catalog": (h.catalog, "catalog_id")}[kind]
            if row[identity] != ref:
                raise KeyError(ref)
            return row
        def options(value, *, resolve_record, context, digest_record):
            return validate_creation_options(value, resolve_catalog=lambda ref: resolve_record("creation_field_catalog", ref),
                                             context=h.owner.option_context, digest_record=digest_record)
        self.assertEqual([], validate_repository_creation(request, resolve_record=resolve, context=context,
            validate_record=structural_errors, digest_record=owner_result_digest, validate_options=options))
        self.assertEqual([], forge_creation_semantic_failures("repository_creation_validation_input", composition))
        request["repository_creation_intent"]["choices"]["repository_name"] = "substituted"
        self.assertIn("forge_creation_approved_choices_digest", forge_creation_semantic_failures("repository_creation_validation_input", composition))

    def test_shape_valid_independent_owner_mismatches(self):
        changes = {
            "session_ref": ("onboarding:different", "producer_session_reference"),
            "session_revision": (99, "producer_session_revision"),
            "continuation_generation": (99, "producer_continuation_generation"),
            "project_request_sha256": ("a" * 64, "producer_project_request_hash"),
            "expected_project_action_id": ("cmd.project.add_existing", "producer_project_action"),
            "approved_draft_sha256": ("a" * 64, "producer_owner_approved_draft_hash"),
            "commit_authorization_ref": ("authorization:different", "producer_commit_authorization"),
            "actor_ref": ("actor:different", "producer_actor"),
            "project_permission_ref": ("permission:different", "producer_project_permission"),
            "owner_operation_ref": ("operation:different", "producer_return_owner_operation_id"),
            "initiating_client_id": ("client:different", "producer_return_initiating_client_id"),
            "server_id": ("server:different", "producer_return_server_id"),
            "execution_host_id": ("host:different", "producer_return_execution_host_id"),
            "execution_environment_id": ("environment:different", "producer_return_execution_environment_id"),
            "project_home_server_ref": ("home-server:different", "producer_project_home_server_ref"),
            "project_source_ref": ("source:different", "producer_project_source_ref"),
            "project_source_location_ref": ("source-location:different", "producer_project_source_location_ref"),
            "project_repository_ref": ("repository:different", "producer_project_repository_ref"),
            "return_focus_id": ("focus:different", "producer_project_return_focus"),
            "invocation_token": ("return:different", "producer_invocation_token"),
            "approval_expires_at_utc": ("2026-09-24T11:00:00Z", "producer_approval_expired"),
        }
        for field, (value, expected) in changes.items():
            with self.subTest(field=field):
                h = creation_fixture(ROOT)
                h.owner = replace(h.owner, **{field: value})
                self.assert_valid_records(h)
                got = h.produce()
                self.assertEqual("blocked", got["status"], got)
                self.assertIn(expected, got["errors"])
                self.assertIsNone(got["choices"])

    def test_shape_valid_actual_source_mutations_have_causal_failures(self):
        cases = [
            ("draft-name", lambda h: h.session["setup_draft"].update(repository_name="changed"), "onboarding_persisted_draft_approved_bytes_mismatch"),
            ("reviewed-revision", lambda h: h.session.update(reviewed_setup_plan_revision=9), "onboarding_reviewed_revision_not_current_draft"),
            ("project-binding", lambda h: h.request["onboarding_setup_binding"].update(project_draft_revision=9), "producer_project_setup_project_draft_revision"),
            ("authorization", lambda h: h.request["onboarding_setup_binding"].update(commit_authorization_ref="authorization:changed"), "producer_commit_authorization"),
            ("project-name", lambda h: h.request.update(display_name="Other Project"), "producer_project_display_name"),
            ("preflight", lambda h: h.request["onboarding_setup_binding"].update(preflight_validation_ref="preflight:other"), "producer_preflight_not_in_approved_draft"),
        ]
        for name, mutate, expected in cases:
            with self.subTest(name=name):
                h = creation_fixture(ROOT)
                mutate(h)
                self.assert_valid_records(h)
                got = h.produce()
                self.assertIn(expected, got["errors"], got)
        for field, value, expected in [
            ("forge_account_ref", "account:other", "producer_subject_account"),
            ("repository_container", "container:other", "producer_subject_container"),
        ]:
            h = creation_fixture(ROOT)
            h.session["setup_draft"][field] = value
            h.owner = replace(h.owner, destination_selection={**h.owner.destination_selection, field: value})
            h.refresh_review()
            self.assert_valid_records(h)
            self.assertIn(expected, h.produce()["errors"])

    def test_catalog_currentness_and_option_tampering(self):
        for name, mutate, expected in [
            ("catalog-digest", lambda h: h.catalog["fields"][0].update(required_selection=True), "producer_selected_catalog_sha256"),
            ("unknown-field", lambda h: h.session["setup_draft"]["repository_creation_selection"]["provider_options_selection"]["choices"][0].update(field_id="unknown-field"), "producer_unknown_option_field:unknown-field"),
            ("wrong-category", lambda h: h.session["setup_draft"]["repository_creation_selection"]["provider_options_selection"]["choices"][0].update(category="template"), "producer_option_category:fixture-field-path"),
            ("duplicate", lambda h: h.session["setup_draft"]["repository_creation_selection"]["provider_options_selection"]["choices"].append(copy.deepcopy(h.session["setup_draft"]["repository_creation_selection"]["provider_options_selection"]["choices"][0])), "producer_duplicate_option_field"),
        ]:
            with self.subTest(name=name):
                h = creation_fixture(ROOT)
                mutate(h)
                h.refresh_review()
                self.assert_valid_records(h)
                self.assertIn(expected, h.produce()["errors"])
        for field, value in [("admitted_permission_refs", frozenset()), ("allowed_effects", frozenset()),
                             ("admitted_capability_refs", frozenset()), ("catalog_revision", 99),
                             ("provider_variant", "self_managed"), ("normalized_host", "elsewhere.test"),
                             ("instance_id", "instance:other")]:
            with self.subTest(field=field):
                h = creation_fixture(ROOT)
                h.owner = replace(h.owner, option_context=replace(h.owner.option_context, **{field: value}))
                self.assert_valid_records(h)
                self.assertEqual("blocked", h.produce()["status"])

    def test_unresolved_none_automatic_and_template_are_distinct(self):
        for key in ("path_selection", "source_template_selection", "git_transport_selection", "provider_options_selection"):
            h = creation_fixture(ROOT)
            h.session["setup_draft"]["repository_creation_selection"][key] = unresolved_creation_selection()[key]
            h.refresh_review()
            self.assert_valid_records(h)
            self.assertEqual(["producer_unresolved:" + key], h.produce()["errors"])
        h = creation_fixture(ROOT)
        s = h.session["setup_draft"]["repository_creation_selection"]
        s.update(path_selection={"state": "owner_derived", "value": None},
                 source_template_selection={"state": "selected", "ref": "template:chosen"},
                 git_transport_selection={"state": "selected", "value": "automatic"},
                 provider_options_selection={"state": "none", "catalog_binding": None, "choices": []})
        h.refresh_review()
        self.assert_valid_records(h)
        got = h.produce()
        self.assertEqual("ready", got["status"], got)
        self.assertEqual("automatic", got["choices"]["requested_git_transport"])
        self.assertEqual("template:chosen", got["choices"]["source_template_ref"])
        self.assertIsNone(got["choices"]["provider_slug_or_path"])
        self.assertEqual([], got["choices"]["provider_options"]["fields"])

    def test_github_parent_does_not_admit_other_provider_and_mode_mismatch(self):
        for action, registration, mode, expected in [
            ("cmd.project.new_github_repo", "forge_created", "new", "producer_github_parent_other_provider"),
            ("cmd.project.add_existing", "existing_local", "new", "producer_project_mode_action")]:
            h = creation_fixture(ROOT)
            h.request.update(action_id=action, registration_kind=registration, repository_ref="repository:pending",
                             owner_receipt_refs=["receipt:verified-source"])
            h.session["active_branch"].update(owner_command_id=action, pending_owner_action_id=action)
            h.returned["active_branch"] = copy.deepcopy(h.session["active_branch"])
            h.owner = replace(h.owner, expected_project_action_id=action, project_repository_ref="repository:pending",
                              project_request_sha256=owner_result_digest(h.request))
            self.assert_valid_records(h)
            self.assertIn(expected, h.produce()["errors"])

    def test_historical_definitions_and_normal_constraints_unchanged(self):
        h = creation_fixture(ROOT)
        current = h.schemas["onboarding"]
        baseline = h.baseline("product_onboarding_contracts.schema.json")
        for name, definition in baseline["$defs"].items():
            self.assertEqual(definition, current["$defs"][name], name)
        self.assertEqual(baseline["oneOf"], current["oneOf"][:len(baseline["oneOf"])])
        for key in baseline:
            if key not in {"$defs", "oneOf"}:
                self.assertEqual(baseline[key], current[key])
        old = baseline["$defs"]["onboarding_setup_plan"]
        new = current["$defs"]["onboarding_setup_plan_v3"]
        for key, value in old["properties"].items():
            if key != "schema_id":
                self.assertEqual(value, new["properties"][key], key)
        self.assertEqual(old["required"], new["required"][:-1])
        copied_rules = copy.deepcopy(new["allOf"][:-2])
        azure_index = next(i for i, rule in enumerate(old["allOf"])
            if rule.get("if", {}).get("properties", {}).get("forge") == {"const": "azure_devops"})
        # Only the explicit-new-Azure branch changes its normal project absence;
        # the separate pinned correction test proves the complete exact delta.
        corrected = copied_rules[azure_index]
        self.assertEqual({"const": ""}, corrected["then"]["allOf"][0]["then"]["properties"]["repository_project"])
        copied_rules[azure_index] = copy.deepcopy(old["allOf"][azure_index])
        self.assertEqual(old["allOf"], copied_rules)
        legacy = h.fixture("product_onboarding_contract_fixtures.json", "valid.session.active_without_branch")
        self.assertEqual([], h.validate("onboarding", "onboarding_session", legacy))
        self.assertTrue(h.validate("onboarding", "onboarding_session_current_write", legacy))
        self.assertTrue(h.validate("onboarding", "onboarding_setup_plan_current_write", legacy["setup_draft"]))
        self.assertEqual([], h.validate("onboarding", "onboarding_session_current_write", h.session))
        # Compare actual old rows against pinned committed bytes-as-JSON, not
        # against the current integrated fixture object itself.
        original_fixtures = h.baseline("product_onboarding_contract_fixtures.json")
        current_fixtures = h.load("product_onboarding_contract_fixtures.json")
        for key in ("valid", "invalid"):
            self.assertEqual(original_fixtures[key], current_fixtures[key][:len(original_fixtures[key])])
        for key in original_fixtures:
            if key not in {"valid", "invalid", "coverage"}:
                self.assertEqual(original_fixtures[key], current_fixtures[key])
        for case in current_fixtures["valid"]:
            self.assertEqual([], h.validate("onboarding", case["definition"], case["value"]), case["name"])

    def test_local_only_and_noncreate_do_not_invent_approval(self):
        h = migration_fixture(ROOT)
        result = h.migrate()
        self.assertEqual("migrated", result["status"], result)
        target = result["target"]
        self.assertIsNone(target["setup_draft"]["repository_creation_selection"])
        p = creation_fixture(ROOT)
        p.records[("onboarding", "onboarding_session_v3", p.session_ref)] = target
        p.owner = None
        self.assertEqual("not_applicable", p.produce()["status"])
        self.assertIsNone(p.produce()["approval_binding"])

    def test_migration_uncommitted_preserves_normal_choices_no_effect_defaults(self):
        h = migration_fixture(ROOT)
        # Genuine v2 hosted draft copied from prior approved fixture but not approved here.
        hosted = h.fixture("product_onboarding_contract_fixtures.json", "valid.session.postcommit_provider")["setup_draft"]
        h.source["setup_draft"] = hosted
        h.migration_owner = replace(h.migration_owner, source_session_sha256=owner_result_digest(h.source))
        before = copy.deepcopy(h.source)
        result = h.migrate()
        self.assertEqual("migrated", result["status"], result)
        new = result["target"]
        for key, value in before["setup_draft"].items():
            if key not in {"schema_id", "project_draft_revision", "review_confirmed"}:
                self.assertEqual(value, new["setup_draft"][key], key)
        self.assertEqual(unresolved_creation_selection(), new["setup_draft"]["repository_creation_selection"])
        self.assertEqual(before["revision"] + 1, new["revision"])
        self.assertEqual(before["continuation_generation"] + 1, new["continuation_generation"])
        self.assertIsNone(new["approved_setup_plan_sha256"])
        self.assertEqual("unconfirmed", new["review_confirmation"])
        self.assertEqual(before, h.source)
        self.assertFalse(result["disposition"]["owner_work_replayed"])

    def test_migration_all_committed_phases_preserve_exact_old_authority(self):
        for name in ("valid.session.deferred_with_active_branch", "valid.session.postcommit_provider",
                     "valid.session.free_models_after_paid_skip", "valid.session.ready_after_optional_provider_skips"):
            with self.subTest(name=name):
                h = migration_fixture(ROOT, name, "committed")
                self.assert_valid_records(h)
                before = copy.deepcopy(h.source)
                result = h.migrate()
                self.assertEqual("migrated", result["status"], result)
                target = result["target"]
                for key, value in before.items():
                    if key not in {"schema_id", "schema_version"}:
                        self.assertEqual(value, target[key], key)
                self.assertEqual("retained_owner_chain_v2", target["draft_format_disposition"])
                self.assertEqual("retained_committed", result["disposition"]["disposition"])
                p = creation_fixture(ROOT)
                p.records[("onboarding", "onboarding_session_v3", p.session_ref)] = target
                self.assertIn("producer_historical_draft_not_admitted", p.produce()["errors"])
                self.assertEqual(before, h.source)

    def test_pending_and_unknown_migration_no_replay_or_relabelled_client(self):
        for classification in ("pending", "effect_unknown"):
            p = creation_fixture(ROOT)
            old = copy.deepcopy(p.session)
            old.update(schema_id="pm.product_onboarding.session.v2", schema_version="2.0.0")
            old.pop("draft_format_disposition"); old.pop("historical_owner_chain_ref")
            old["setup_draft"].pop("repository_creation_selection")
            old["setup_draft"]["schema_id"] = "pm.product_onboarding.setup_plan.v2"
            old["approved_setup_plan_sha256"] = owner_result_digest(old["setup_draft"])
            old["return_context"]["approved_setup_plan_sha256"] = old["approved_setup_plan_sha256"]
            request = copy.deepcopy(p.request)
            request["onboarding_setup_binding"]["approved_setup_plan_sha256"] = old["approved_setup_plan_sha256"]
            h = migration_fixture(ROOT)
            h.source = old
            h.records[("onboarding", "onboarding_session", h.source_ref)] = old
            request_ref = "request:migration-producer:pending"
            h.records[("project", "project_action_request", request_ref)] = request
            h.migration_owner = replace(h.migration_owner, source_session_sha256=owner_result_digest(old),
                source_revision=old["revision"], source_continuation_generation=old["continuation_generation"],
                owner_chain_state=classification, historical_owner_chain_ref="lineage:pending-project",
                project_request_ref=request_ref, project_request_sha256=owner_result_digest(request),
                owner_operation_ref=old["active_branch"]["owner_operation_id"])
            self.assert_valid_records(h)
            result = h.migrate()
            self.assertEqual("migrated", result["status"], result)
            for field in ("setup_draft", "approved_setup_plan_sha256", "active_branch", "return_context", "revision", "continuation_generation"):
                self.assertEqual(old[field], result["target"][field])
            self.assertEqual("retained_reconciling", result["disposition"]["disposition"])
            h.migration_owner = replace(h.migration_owner, owner_chain_state="no_commit")
            self.assertIn("migration_pending_owner_work_would_be_dropped", h.migrate()["errors"])

    def test_migration_missing_committed_owner_proof_and_disposition_forgery(self):
        h = migration_fixture(ROOT, "valid.session.postcommit_provider", "committed")
        record = h.migrate()["disposition"]
        for field in ("historical_owner_chain_ref", "retained_draft_sha256"):
            bad = copy.deepcopy(record); bad[field] = None
            self.assertTrue(h.validate("onboarding", "onboarding_draft_format_migration", bad))
        bad = copy.deepcopy(record); bad["disposition"] = "new_review_required"
        self.assertTrue(h.validate("onboarding", "onboarding_draft_format_migration", bad))
        h.records.pop(("project", "project_action_result", h.migration_owner.project_result_ref))
        self.assertIn("migration_project_result_unresolved", h.migrate()["errors"])

    def test_bounded_storage_has_four_offline_owners_exact_family_membership(self):
        h = creation_fixture(ROOT)
        s = h.schemas
        bundle = build_onboarding_v3_storage_bundle(s["onboarding"], s["project"], s["settings"], s["forge"])
        Draft202012Validator.check_schema(bundle)
        self.assertFalse(list(Draft202012Validator(bundle).iter_errors(h.session)))
        self.assertTrue(any(k.startswith("forge__") for k in bundle["$defs"]))
        def refs(value):
            if isinstance(value, dict):
                for key, item in value.items():
                    if key == "$ref":
                        yield item
                    else:
                        yield from refs(item)
            elif isinstance(value, list):
                for item in value:
                    yield from refs(item)
        self.assertTrue(all(r.startswith("#/$defs/") for r in refs(bundle)))
        original = h.baseline("storage_value_registry.json")
        updated = materialized_v3_registry(original, bundle)
        actual_registry = h.load("storage_value_registry.json")
        actual_row = next(r for r in actual_registry["families"] if r["family_id"] == "onboarding_state")
        if actual_row["key_shape"] == "onboarding_state.v4:{onboarding_session_id}":
            self.assertEqual(updated, actual_registry, "actual current writer must equal owner-materialized v3 bundle")
        else:
            self.assertEqual(original, actual_registry, "external pre-integration baseline only")
        self.assertEqual([r["family_id"] for r in original["families"]], [r["family_id"] for r in updated["families"]])
        for before, after in zip(original["families"], updated["families"]):
            if before["family_id"] != "onboarding_state":
                self.assertEqual(before, after)
        for key in original:
            if key not in {"families", "contract_family_dispositions"}:
                self.assertEqual(original[key], updated[key])
        scoped = {"scd.product_onboarding.session.v1", "scd.product_onboarding.migration.v1", "scd.product_onboarding.actions.v1"}
        self.assertEqual([r["disposition_id"] for r in original["contract_family_dispositions"]],
                         [r["disposition_id"] for r in updated["contract_family_dispositions"]])
        for before, after in zip(original["contract_family_dispositions"], updated["contract_family_dispositions"]):
            if before["disposition_id"] not in scoped:
                self.assertEqual(before, after)
            else:
                self.assertEqual(before["record_kinds"], after["record_kinds"][:-1])
                for key in before:
                    if key not in {"record_kinds", "schema_ref", "migration_rule", "rationale"}:
                        self.assertEqual(before[key], after[key])
        old_redaction = h.baseline("redaction_transform_registry.json")
        redaction = materialized_v3_redaction(old_redaction)
        self.assertEqual([r["transform_id"] for r in old_redaction["transforms"]], [r["transform_id"] for r in redaction["transforms"]])
        for before, after in zip(old_redaction["transforms"], redaction["transforms"]):
            for key in before:
                if before["transform_id"] != "rt.onboarding_state.v1" or key not in {"applies_to", "output_rule"}:
                    self.assertEqual(before[key], after[key])
        if actual_row["key_shape"] == "onboarding_state.v4:{onboarding_session_id}":
            self.assertEqual(redaction, h.load("redaction_transform_registry.json"))
        altered = copy.deepcopy(s["onboarding"])
        altered["$defs"]["onboarding_creation_option_choice"]["properties"]["value"] = {"$ref": "https://untrusted.test/arbitrary.json#/$defs/anything"}
        with self.assertRaisesRegex(ValueError, "unbound_owner_ref"):
            build_onboarding_v3_storage_bundle(altered, s["project"], s["settings"], s["forge"])

    def test_no_draft_skipped_cancelled_and_deferred_migration(self):
        for status in ("active", "skipped", "cancelled"):
            h = migration_fixture(ROOT)
            h.source.update(stage="welcome", status=status, simple_path_selection=None, path_kind=None,
                queued_setup_plan_ref=None, queued_setup_plan_revision=None, project_draft_ref=None,
                project_draft_revision=None, project_disposition="not_selected", setup_draft=None)
            h.migration_owner = replace(h.migration_owner, source_session_sha256=owner_result_digest(h.source))
            self.assert_valid_records(h)
            got = h.migrate()
            self.assertEqual("migrated", got["status"], got)
            self.assertEqual("no_draft", got["disposition"]["disposition"])
            self.assertEqual(status, got["target"]["status"])
            self.assertIsNone(got["target"]["setup_draft"])
        for status in ("skipped", "cancelled", "deferred"):
            h = migration_fixture(ROOT)
            h.source["status"] = status
            if status == "deferred":
                returned = h.fixture("product_onboarding_contract_fixtures.json", "valid.session.deferred_with_active_branch")["return_context"]
                for key in h.original["$defs"]["onboarding_durable_setup_state_fields"]["properties"]:
                    returned[key] = copy.deepcopy(h.source[key])
                returned.update(onboarding_session_id=h.source["onboarding_session_id"], stage=h.source["stage"],
                    project_id=None, owner_operation_id=None, expected_revision=h.source["revision"],
                    continuation_generation=h.source["continuation_generation"])
                h.source["return_context"] = returned
            h.migration_owner = replace(h.migration_owner, source_session_sha256=owner_result_digest(h.source))
            self.assert_valid_records(h)
            got = h.migrate()
            self.assertEqual("migrated", got["status"], got)
            self.assertEqual("interrupted" if status == "deferred" else status, got["target"]["status"])
            self.assertIsNone(got["target"]["return_context"])

    def test_unrelated_selected_source_branch_does_not_become_project_authority(self):
        h = migration_fixture(ROOT)
        branch = creation_fixture(ROOT).session["active_branch"]
        branch.update(branch_kind="source-control", owner_phase="selected_source_auth",
            return_stage=h.source["stage"], expected_revision=h.source["revision"],
            continuation_generation=h.source["continuation_generation"],
            precommit_authorization_ref="authorization:selected-source:1",
            pending_owner_action_id="cmd.auth_profile.sign_in", owner_command_id="cmd.auth_profile.sign_in")
        h.source["active_branch"] = branch
        h.migration_owner = replace(h.migration_owner, source_session_sha256=owner_result_digest(h.source))
        self.assert_valid_records(h)
        before = copy.deepcopy(h.source)
        got = h.migrate()
        self.assertEqual("blocked", got["status"], got)
        self.assertIn("migration_nonproject_owner_work_requires_settlement", got["errors"])
        self.assertIsNone(got["target"])
        self.assertIsNone(got["disposition"])
        self.assertEqual(before, h.source)
        for phase, kind, command in (
            ("selected_source_auth", "source-control", "cmd.auth_profile.sign_in"),
            ("read_only_preflight", "source-control", "cmd.forge.repository.list"),
            ("read_only_preflight", "project", "cmd.settings.transaction.preview"),
            ("read_only_preflight", "server-connect", "cmd.server.capabilities.refresh"),
        ):
            # Only the existing typed branch relation is claimed by this probe;
            # it deliberately does not fabricate owner completion/cancellation.
            h.source["active_branch"].update(owner_phase=phase, branch_kind=kind,
                pending_owner_action_id=command, owner_command_id=command)
            h.migration_owner = replace(h.migration_owner, source_session_sha256=owner_result_digest(h.source))
            self.assert_valid_records(h)
            snapshot = copy.deepcopy(h.source)
            result = h.migrate()
            self.assertEqual("blocked", result["status"], result)
            self.assertIn("migration_nonproject_owner_work_requires_settlement", result["errors"])
            self.assertIsNone(result["target"])
            self.assertIsNone(result["disposition"])
            self.assertEqual(snapshot, h.source)
        h.migration_owner = replace(h.migration_owner, owner_chain_state="pending", historical_owner_chain_ref="lineage:wrong")
        self.assertIn("migration_pending_owner_reference_missing", h.migrate()["errors"])

    def test_connect_existing_and_existing_repository_do_not_create(self):
        h = migration_fixture(ROOT)
        draft = h.fixture("product_onboarding_contract_fixtures.json", "valid.setup_plan.connect_existing.local_discovery")
        h.source.update(setup_draft=draft, simple_path_selection="connect_existing_server", path_kind="connect_existing",
                        stage="remote_access_setup", project_disposition="not_applicable", provider_phase_status="not_applicable",
                        free_models_phase_status="not_applicable", project_draft_ref=draft["project_draft_ref"],
                        project_draft_revision=draft["project_draft_revision"])
        h.migration_owner = replace(h.migration_owner, source_session_sha256=owner_result_digest(h.source))
        self.assert_valid_records(h)
        got = h.migrate()
        self.assertEqual("migrated", got["status"], got)
        p = creation_fixture(ROOT)
        p.records[("onboarding", "onboarding_session_v3", p.session_ref)] = got["target"]
        p.owner = None
        self.assertEqual("not_applicable", p.produce()["status"])
        p = creation_fixture(ROOT)
        p.session["setup_draft"].update(online_mode="existing", repository_ref="repository:already-existing", repository_creation_selection=None)
        p.refresh_review()
        self.assert_valid_records(p)
        p.owner = None
        self.assertEqual("not_applicable", p.produce()["status"])

    def test_azure_team_project_new_operation_is_explicitly_pending(self):
        h = creation_fixture(ROOT)
        draft = h.session["setup_draft"]
        draft.update(forge="azure_devops", forge_provider_variant="cloud", forge_instance_url="https://dev.azure.com",
                     repository_project="project:azure-selected", repository_visibility=None)
        selection = draft["repository_creation_selection"]
        selection["provider_options_selection"] = {"state": "none", "catalog_binding": None, "choices": []}
        h.refresh_review()
        self.assert_valid_records(h)
        self.assertEqual(["producer_unresolved:azure_team_project_selection"], h.produce()["errors"])
        selection["azure_team_project_selection"] = {"mode": "create", "existing_project_ref": None,
            "project_name": "New Azure Project", "visibility": "private", "process_template_ref": "process-template:resolved",
            "version_control": "git"}
        draft["repository_project"] = ""  # Explicit draft edit before reapproval, not history rewrite.
        h.refresh_review()
        self.assert_valid_records(h)
        got = h.produce()
        self.assertEqual("pending", got["status"])
        self.assertEqual(["producer_azure_team_project_owner_operation_required"], got["errors"])
        self.assertIsNone(got["choices"])

    def test_project_selection_branch_and_inactive_session_authority_mismatches(self):
        for field in ("project_source_ref", "server_ref", "local_location", "client_mode"):
            h = creation_fixture(ROOT)
            h.owner = replace(h.owner, project_selection={**h.owner.project_selection, field: "selected:other"})
            self.assertIn("producer_selected_" + field, h.produce()["errors"])
        for field, value in (("expected_revision", 99), ("target_ref", "draft:other"), ("branch_kind", "source-control")):
            h = creation_fixture(ROOT)
            h.session["active_branch"][field] = value
            h.returned["active_branch"][field] = value
            self.assert_valid_records(h)
            self.assertIn("producer_branch_" + field, h.produce()["errors"])
        for status in ("skipped", "cancelled", "deferred", "interrupted"):
            h = creation_fixture(ROOT)
            h.session["status"] = status
            self.assert_valid_records(h)
            self.assertIn("producer_session_not_active", h.produce()["errors"])

    def test_touch_profile_uses_current_writers_and_explicit_legacy_readers(self):
        h = FixtureHarness(ROOT)
        touch = h.load("touch_closure.json")
        self.assertEqual([], list(Draft202012Validator(h.load("touch_closure.schema.json")).iter_errors(touch)))
        profile = next(row for row in touch["profiles"] if row["profile_id"] == "TCP-ONBOARD")
        prefix = "Plans/product_onboarding_contracts.schema.json#/$defs/"
        fixtures = h.load("product_onboarding_contract_fixtures.json")["valid"]
        for current, historical in (("onboarding_session_v3", "onboarding_session"),
                                    ("onboarding_setup_plan_v3", "onboarding_setup_plan")):
            self.assertIn(prefix + current, profile["persistence_refs"])
            self.assertNotIn(prefix + historical, profile["persistence_refs"])
            self.assertIn(prefix + historical, profile["migration_refs"])
            old = next(row["value"] for row in fixtures if row["definition"] == historical)
            actual = next(row["value"] for row in fixtures if row["definition"] == current)
            self.assertTrue(h.validate("onboarding", current, old))
            self.assertEqual([], h.validate("onboarding", current, actual))
        for definition in ("onboarding_draft_format_migration", "onboarding_legacy_migration_receipt"):
            self.assertIn(prefix + definition, profile["migration_refs"])
        self.assertEqual(prefix + "onboarding_action_request", profile["payload_schema_ref"])
        self.assertEqual(prefix + "onboarding_action_result", profile["result_schema_ref"])
        self.assertIn(prefix + "onboarding_continuation_snapshot", profile["persistence_refs"])

    def test_actual_v3_and_current_write_alias_apply_persisted_hash_semantics(self):
        h = creation_fixture(ROOT)
        changed = copy.deepcopy(h.session)
        changed["setup_draft"]["repository_name"] = "schema-valid-unapproved-change"
        for definition in ("onboarding_session_v3", "onboarding_session_current_write"):
            self.assertEqual([], h.validate("onboarding", definition, changed))
            # This branch is exercised by the exact canonical-path integration
            # probe after the helper dispatch patch, not by old prepatch helper.
            if "onboarding_session_v3" in h.original["$defs"]:
                self.assertIn("onboarding_persisted_draft_approved_bytes_mismatch", onboarding_semantic_failures(definition, changed))


if __name__ == "__main__":
    unittest.main(verbosity=2)
