"""Static Onboarding phase, draft, owner-route and Project commit tests.

These exercise resolved fixture values, not native owner authority or persistence.
"""

import copy
from datetime import datetime, timezone
import importlib.util
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("onboarding_gate", ROOT / "scripts/pm-new-contracts-verify.py")
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)
from pm_onboarding_semantics import (
    onboarding_action_join_failures,
    onboarding_precommit_join_failures,
    onboarding_semantic_failures,
    project_commit_binding_failures,
)
from pm_ui_command_response import owner_result_digest

SCHEMA = json.loads((ROOT / "Plans/product_onboarding_contracts.schema.json").read_text())
PACK = json.loads((ROOT / "Plans/product_onboarding_contract_fixtures.json").read_text())
CASES = {row["name"]: row["value"] for row in PACK["valid"]}
PROJECT_SCHEMA = json.loads((ROOT / "Plans/project_system_contracts.schema.json").read_text())
PROJECT_PACK = json.loads((ROOT / "Plans/project_system_contract_fixtures.json").read_text())
REGISTRY = GATE.offline_schema_registry()
COMMIT = CASES["valid.session.postcommit_provider"]["project_commit_binding"]
PROJECT_RESULT = next(row["value"] for row in PROJECT_PACK["valid"]
                      if row["definition"] == "project_action_result"
                      and row["value"]["command_instance_id"] == COMMIT["command_instance_id"])
AUTH = CASES["valid.authorization.selected_source_auth"]
AUTH_REQUEST = CASES["valid.request.selected_source_auth_before_review"]
OWNER_INPUT = PACK["resolved_owner_inputs"][AUTH["owner_request_ref"]]
OWNER_REQUEST = OWNER_INPUT["value"]


def valid(definition, value, schema=SCHEMA):
    return GATE.validator_for(schema, {"$ref": "#/$defs/" + definition}, REGISTRY).is_valid(value)


def source_state():
    state = copy.deepcopy(CASES["valid.session.active_without_branch"])
    state.update(onboarding_session_id=AUTH_REQUEST["onboarding_session_id"],
                 stage=AUTH_REQUEST["stage"], revision=AUTH_REQUEST["expected_revision"],
                 continuation_generation=AUTH_REQUEST["continuation_generation"])
    return state


def auth_join(request=AUTH_REQUEST, authorization=AUTH, owner=OWNER_REQUEST, current=None, **changes):
    args = dict(resolved_authorization_ref=AUTH["authorization_id"],
                resolved_owner_request_ref=AUTH["owner_request_ref"],
                selected_source=dict(source_ref=AUTH["selected_source_ref"],
                                     provider_id=AUTH["selected_provider_id"], route_id=AUTH["selected_route_id"]),
                now=datetime(2026, 9, 10, 12, tzinfo=timezone.utc))
    args.update(changes)
    return onboarding_precommit_join_failures(request, authorization, owner,
                                              source_state() if current is None else current, **args)


def project_join(binding=COMMIT, result=PROJECT_RESULT, **kwargs):
    return project_commit_binding_failures(binding, result,
                                          resolved_result_ref=COMMIT["project_action_result_ref"], **kwargs)


class OnboardingPhaseTests(unittest.TestCase):
    def test_every_current_positive_is_structurally_and_semantically_valid(self):
        for row in PACK["valid"]:
            with self.subTest(case=row["name"]):
                self.assertTrue(valid(row["definition"], row["value"]))
                self.assertEqual(onboarding_semantic_failures(row["definition"], row["value"]), [])

    def test_every_negative_is_rejected_for_its_authored_kind(self):
        for row in PACK["invalid"]:
            with self.subTest(case=row["name"]):
                value = GATE.materialize_invalid(row, CASES)
                if "semantic_rule" in row:
                    self.assertTrue(valid(row["definition"], value))
                    self.assertIn(row["semantic_rule"], onboarding_semantic_failures(row["definition"], value))
                else:
                    self.assertFalse(valid(row["definition"], value))

    def test_exact_thirteen_actions_and_phase_dependency_order(self):
        actions = SCHEMA["$defs"]["onboarding_action_request"]["properties"]["action_id"]["enum"]
        self.assertEqual(len(actions), 13)
        self.assertEqual(actions, PACK["exact_typed_local_actions"])
        self.assertEqual(SCHEMA["$defs"]["main_stage_order"]["const"], PACK["canonical_stage_order"])
        self.assertEqual(PACK["canonical_stage_order"][-4:],
                         ["automatic_preparation", "provider_setup", "free_models_setup", "ready"])
        self.assertEqual(len(SCHEMA["$defs"]["connect_existing_stage_order"]["const"]), 6)

    def test_no_peer_onboarding_or_generic_project_create_command(self):
        self.assertTrue(all(action.startswith("ui.onboarding.") for action in PACK["exact_typed_local_actions"]))
        ids = PROJECT_SCHEMA["$defs"]["project_setup_commit_binding"]["properties"]["command_id"]["enum"]
        self.assertNotIn("cmd.project.create", ids)
        self.assertNotIn("cmd.source_control.repository.init", ids)

    def test_source_auth_uses_actual_nullable_project_owner_contract(self):
        owner_schema = json.loads((ROOT / OWNER_INPUT["owner_schema"]).read_text())
        self.assertTrue(valid(OWNER_INPUT["definition"], OWNER_REQUEST, owner_schema))
        self.assertIsNone(OWNER_REQUEST["project_id"])
        self.assertIsNone(OWNER_REQUEST["connection_id"])
        self.assertEqual(auth_join(), [])

    def source_list_join(self, owner_change=None, source_change=None, auth_change=None):
        request = CASES["valid.request.precommit_source_repository_list"]
        authorization = copy.deepcopy(CASES["valid.authorization.precommit_source_repository_list"])
        owner = copy.deepcopy(PACK["resolved_owner_inputs"][authorization["owner_request_ref"]]["value"])
        scope = owner["repository_list_scope"]
        source = dict(source_ref=authorization["selected_source_ref"], provider_id=scope["source_provider_id"],
                      route_id=scope["source_route_id"], forge_provider=owner["provider"], account_id=owner["account_id"])
        source.update({key: scope[key] for key in ("account_generation", "account_verification_ref", "account_container_ref")})
        source.update(source_change or {})
        owner.update(owner_change or {})
        authorization.update(auth_change or {})
        current = source_state()
        current["onboarding_session_id"] = request["onboarding_session_id"]
        return onboarding_precommit_join_failures(request, authorization, owner, current,
            resolved_authorization_ref=authorization["authorization_id"], resolved_owner_request_ref=authorization["owner_request_ref"],
            selected_source=source, now=datetime(2026, 9, 10, 12, tzinfo=timezone.utc))

    def test_precommit_repository_listing_has_no_phantom_repository(self):
        authorization = CASES["valid.authorization.precommit_source_repository_list"]
        row = PACK["resolved_owner_inputs"][authorization["owner_request_ref"]]
        schema = json.loads((ROOT / row["owner_schema"]).read_text())
        self.assertTrue(valid(row["definition"], row["value"], schema))
        self.assertIsNone(row["value"]["repo_id"])
        self.assertIsNone(row["value"]["repository_binding_ref"])
        self.assertIsNone(row["value"]["repository_list_scope"]["project_id"])
        self.assertEqual(self.source_list_join(), [])

    def test_source_repository_listing_cannot_reuse_another_account_generation(self):
        self.assertIn("onboarding_precommit_forge_account_generation_mismatch", self.source_list_join(source_change={"account_generation": 999}))
        self.assertIn("onboarding_precommit_forge_account_mismatch", self.source_list_join(source_change={"account_id": "account:other"}))

    def test_source_repository_listing_cannot_switch_provider_or_container(self):
        self.assertIn("onboarding_precommit_forge_provider_mismatch", self.source_list_join(source_change={"forge_provider": "github"}))
        self.assertIn("onboarding_precommit_forge_account_container_ref_mismatch", self.source_list_join(source_change={"account_container_ref": "container:other"}))

    def test_source_list_capability_and_actual_owner_bytes_are_bound(self):
        errors = self.source_list_join(owner_change={"capability_snapshot_ref": "capability:other"})
        self.assertIn("onboarding_precommit_forge_capability_snapshot_mismatch", errors)
        self.assertIn("onboarding_precommit_owner_request_mismatch", errors)

    def test_changed_source_draft_invalidates_authorization(self):
        current = source_state()
        current["project_draft_revision"] += 1
        self.assertIn("onboarding_precommit_project_draft_revision_stale", auth_join(current=current))

    def test_changed_session_revision_invalidates_source_auth(self):
        current = source_state()
        current["revision"] += 1
        self.assertIn("onboarding_precommit_revision_stale", auth_join(current=current))

    def test_wrong_source_provider_is_not_broad_provider_setup_permission(self):
        selected = dict(source_ref=AUTH["selected_source_ref"], provider_id="provider:openai", route_id="route:openai:api")
        self.assertIn("onboarding_precommit_owner_provider_id_mismatch", auth_join(selected_source=selected))

    def test_source_auth_cannot_move_to_another_host_or_client(self):
        for field, code in [("execution_host_id", "execution_host_id"), ("initiating_client_id", "initiating_client_id")]:
            changed = copy.deepcopy(OWNER_REQUEST)
            changed[field] = "different:owner-context"
            with self.subTest(field=field):
                self.assertIn("onboarding_precommit_" + code + "_mismatch", auth_join(owner=changed))

    def test_owner_request_hash_prevents_payload_substitution(self):
        changed = copy.deepcopy(OWNER_REQUEST)
        changed["payload"]["official_route_ref"] = "official-route:different"
        self.assertIn("onboarding_precommit_owner_request_mismatch", auth_join(owner=changed))

    def test_source_auth_requires_current_permission_and_specific_consent(self):
        changed = copy.deepcopy(OWNER_REQUEST)
        changed["permission_snapshot_ref"] = "permission:different"
        changed["payload"]["human_confirmation_ref"] = "consent:different"
        errors = auth_join(owner=changed)
        self.assertIn("onboarding_precommit_permission_snapshot_mismatch", errors)
        self.assertIn("onboarding_precommit_source_consent_mismatch", errors)

    def test_expired_authorization_is_not_reused_on_resume(self):
        self.assertIn("onboarding_precommit_authorization_expired",
                      auth_join(now=datetime(2026, 9, 11, tzinfo=timezone.utc)))

    def test_precommit_allowed_commands_do_not_include_mutating_shortcuts(self):
        ids = SCHEMA["$defs"]["onboarding_precommit_authorization"]["properties"]["owner_command_id"]["enum"]
        self.assertEqual(set(ids), {"cmd.project.refresh", "cmd.settings.transaction.preview", "cmd.server.discovery.refresh",
                                    "cmd.forge.repository.list", "cmd.auth_profile.sign_in", "cmd.auth_profile.open_official_page"})
        self.assertNotIn("cmd.integration.connection.add", ids)  # Owner request currently requires an actual Project.
        self.assertNotIn("cmd.authentication.start", ids)  # Shared runtime command context requires an actual Project.

    def test_free_models_follows_explicit_paid_provider_skip(self):
        value = CASES["valid.session.free_models_after_paid_skip"]
        self.assertEqual(value["provider_phase_status"], "skipped")
        self.assertTrue(valid("onboarding_session", value))
        request = CASES["valid.request.free_models_underlying_owner"]
        self.assertEqual(request["local_context"]["owner_command_id"], "cmd.auth_profile.sign_in")
        self.assertIsNone(request["local_context"]["setup_commit_binding"])

    def test_ready_without_project_is_explicitly_deferred_not_fake_identity(self):
        value = CASES["valid.result.applied.finish"]["continuation_snapshot"]
        self.assertEqual(value["project_disposition"], "deferred")
        self.assertIsNone(value["project_commit_binding"])
        self.assertEqual(value["provider_phase_status"], "deferred")

    def test_committed_provider_resume_preserves_exact_owner_binding(self):
        value = CASES["valid.session.deferred_with_active_branch"]
        self.assertEqual(value["stage"], "provider_setup")
        self.assertEqual(value["project_commit_binding"], value["return_context"]["project_commit_binding"])
        self.assertEqual(value["project_id"], COMMIT["project_id"])

    def test_local_navigation_cannot_discard_a_committed_project(self):
        current = copy.deepcopy(CASES["valid.session.postcommit_provider"])
        request = copy.deepcopy(CASES["valid.request.close"])
        result = copy.deepcopy(CASES["valid.result.applied.close"])
        request.update(stage=current["stage"], onboarding_session_id=current["onboarding_session_id"],
                       expected_revision=current["revision"], continuation_generation=current["continuation_generation"])
        result.update(action_id=request["action_id"], action_instance_id=request["action_instance_id"],
                      onboarding_session_id=current["onboarding_session_id"], stage_before=current["stage"],
                      revision=current["revision"] + 1, continuation_generation=current["continuation_generation"])
        self.assertIn("onboarding_navigation_discards_committed_project", onboarding_action_join_failures(current, request, result))

    def test_migration_cannot_replay_owner_work_or_fabricate_review(self):
        for row in PACK["valid"]:
            if row["definition"] == "onboarding_legacy_migration_receipt":
                with self.subTest(case=row["name"]):
                    self.assertFalse(row["value"]["owner_work_replayed"])
                    self.assertEqual(row["value"]["review_confirmation"], "unconfirmed")
                    self.assertIsNone(row["value"]["approved_setup_plan_sha256"])


class ProjectCommitBindingTests(unittest.TestCase):
    def test_actual_listed_persisted_project_result_is_bound(self):
        self.assertTrue(valid("project_setup_commit_binding", COMMIT, PROJECT_SCHEMA))
        self.assertTrue(valid("project_action_result", PROJECT_RESULT, PROJECT_SCHEMA))
        self.assertEqual(project_join(), [])

    def test_acknowledgement_without_listing_or_persistence_is_not_commit(self):
        changed = copy.deepcopy(PROJECT_RESULT)
        changed.update(lifecycle="registering", persistence_disposition="not_persisted")
        errors = project_join(result=changed)
        self.assertIn("project_commit_lifecycle_mismatch", errors)
        self.assertIn("project_commit_persistence_disposition_mismatch", errors)

    def test_failed_result_does_not_become_success_by_having_a_receipt(self):
        changed = copy.deepcopy(PROJECT_RESULT)
        changed.update(outcome="rejected", error_code="permission_denied")
        self.assertIn("project_commit_owner_result_not_successful", project_join(result=changed))

    def test_terminal_receipts_are_actual_owner_result_members(self):
        changed = copy.deepcopy(COMMIT)
        changed["terminal_receipt_refs"] = ["receipt:unrelated"]
        self.assertIn("project_commit_terminal_receipt_mismatch", project_join(binding=changed))

    def test_owner_result_bytes_and_resolved_reference_are_exact(self):
        changed = copy.deepcopy(COMMIT)
        changed["project_action_result_sha256"] = "d" * 64
        changed["project_action_result_ref"] = "result:wrong"
        errors = project_join(binding=changed)
        self.assertIn("project_commit_result_digest_mismatch", errors)
        self.assertIn("project_commit_result_reference_mismatch", errors)

    def test_selected_settings_transfer_cannot_be_left_unsettled(self):
        request = dict(action_id=COMMIT["command_id"], command_instance_id=COMMIT["command_instance_id"],
                       idempotency_key=COMMIT["idempotency_key"], return_context=PROJECT_RESULT["return_context"],
                       onboarding_setup_binding=copy.deepcopy(CASES["valid.request.review_commit"]["local_context"]["setup_commit_binding"]))
        request["onboarding_setup_binding"]["settings_transfer_draft_preview_ref"] = "preview:settings:1"
        self.assertIn("project_commit_selected_settings_copy_unsettled", project_join(request=request))

    def test_settings_result_must_be_paired_and_in_required_owner_results(self):
        changed = copy.deepcopy(COMMIT)
        changed["settings_transfer_result_ref"] = "result:settings:1"
        errors = project_join(binding=changed)
        self.assertIn("project_commit_settings_result_pair_incomplete", errors)
        self.assertIn("project_commit_settings_result_not_in_required_owner_set", errors)

    def test_existing_digest_algorithm_is_reused(self):
        self.assertEqual(COMMIT["project_action_result_sha256"], owner_result_digest(PROJECT_RESULT))


class OnboardingStorageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location("onboarding_storage_tests", ROOT / "scripts/pm-onboarding-contracts.py")
        cls.storage = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.storage)
        cls.registry = json.loads((ROOT / "Plans/storage_value_registry.json").read_text())
        cls.bundle = cls.storage.expected_bundle()

    def test_existing_family_and_retention_census_is_unchanged(self):
        self.assertEqual(len(self.registry["families"]), 88)
        self.assertEqual(len(self.registry["retention_policies"]), 24)
        self.assertEqual(self.storage.validate(self.registry), [])
        failures, counts = GATE.validate_onboarding_storage_contract()
        self.assertEqual(failures, [])
        self.assertEqual(counts["onboarding_storage_contracts_valid"], 1)

    def test_bundle_is_deterministic_closed_and_entirely_offline(self):
        self.assertEqual(self.bundle, self.storage.expected_bundle())
        self.assertFalse(self.bundle["additionalProperties"])

        def walk(value):
            if isinstance(value, dict):
                if "$ref" in value:
                    self.assertTrue(value["$ref"].startswith("#/$defs/"))
                    self.assertIn(value["$ref"].removeprefix("#/$defs/"), self.bundle["$defs"])
                for child in value.values():
                    walk(child)
            elif isinstance(value, list):
                for child in value:
                    walk(child)
        walk(self.bundle)

    def test_every_session_round_trips_through_same_offline_bundle(self):
        validator = GATE.Draft202012Validator(self.bundle)
        for row in PACK["valid"]:
            if row["definition"] == "onboarding_session":
                with self.subTest(case=row["name"]):
                    restored = json.loads(json.dumps(row["value"]))
                    self.assertTrue(validator.is_valid(restored), list(validator.iter_errors(restored)))
                    self.assertEqual(onboarding_semantic_failures("onboarding_session", restored), [])

    def test_inline_schema_drift_is_a_standard_contract_gate_failure(self):
        changed = copy.deepcopy(self.registry)
        row = next(row for row in changed["families"] if row["family_id"] == "onboarding_state")
        row["value_schema"]["additionalProperties"] = True
        self.assertIn("onboarding_storage_value_schema_drift", self.storage.validate(changed))

    def test_missing_draft_body_is_not_a_durable_pointer_only_session(self):
        changed = copy.deepcopy(CASES["valid.session.postcommit_provider"])
        changed["setup_draft"] = None
        self.assertFalse(valid("onboarding_session", changed))
        self.assertFalse(GATE.Draft202012Validator(self.bundle).is_valid(changed))

    def test_approved_hash_binds_actual_persisted_choice_bytes(self):
        changed = copy.deepcopy(CASES["valid.session.postcommit_provider"])
        self.assertEqual(owner_result_digest(changed["setup_draft"]), changed["approved_setup_plan_sha256"])
        changed["setup_draft"]["project_draft_revision"] += 1
        self.assertTrue(valid("onboarding_session", changed))
        errors = onboarding_semantic_failures("onboarding_session", changed)
        self.assertIn("onboarding_persisted_draft_approved_bytes_mismatch", errors)
        self.assertIn("onboarding_persisted_draft_project_draft_revision_mismatch", errors)

    def test_unknown_owner_schema_cannot_trigger_network_fallback(self):
        from pm_onboarding_semantics import onboarding_storage_value_schema
        changed = copy.deepcopy(SCHEMA)
        changed["$defs"]["onboarding_session"]["properties"]["setup_draft"] = {"$ref": "https://unregistered.invalid/schema"}
        settings = json.loads((ROOT / "Plans/settings_system_contracts.schema.json").read_text())
        with self.assertRaisesRegex(ValueError, "onboarding_storage_unbound_owner_ref"):
            onboarding_storage_value_schema(changed, PROJECT_SCHEMA, settings)

    def test_explicit_history_choices_are_bound_not_replaced_by_consumer_defaults(self):
        for field, replacement in (("local_history", False), ("history_backend", "git")):
            changed = copy.deepcopy(CASES["valid.session.postcommit_provider"])
            self.assertNotEqual(changed["setup_draft"][field], replacement)
            changed["setup_draft"][field] = replacement
            self.assertTrue(valid("onboarding_session", changed))
            self.assertIn("onboarding_persisted_draft_approved_bytes_mismatch",
                          onboarding_semantic_failures("onboarding_session", changed))

    def test_touch_onboarding_residuals_do_not_restore_predecessor_contracts(self):
        touch = json.loads((ROOT / "Plans/touch_closure.json").read_text())
        rows = [dict(zip(touch["row_columns"], row)) for row in touch["rows"]]
        relevant = [row for row in rows if row["profile_id"] == "TCP-ONBOARD"]
        self.assertEqual(len(relevant), 13)
        for row in relevant:
            self.assertEqual(row["disposition"], "partial")
            for stale in ("exact nine-stage main path", "exact nine-/six-stage path",
                          "only from a person-confirmed current Review", "init_git:true"):
                self.assertNotIn(stale, row["residual_risk"])

    def test_gui_stage_graphs_reference_owner_instead_of_visual_alias_roster(self):
        gui = json.loads((ROOT / "Plans/final_gui_interaction_contracts.schema.json").read_text())
        props = gui["$defs"]["onboarding_motion"]["properties"]
        for consumer, owner in (("stages", "main_stage_order"),
                                ("connect_existing_stages", "connect_existing_stage_order"),
                                ("deferred_project_stages", "deferred_project_stage_order")):
            self.assertEqual(props[consumer], {"$ref": SCHEMA["$id"] + "#/$defs/" + owner})

    def test_settings_copy_is_not_available_without_a_new_project(self):
        draft = copy.deepcopy(CASES["valid.setup_plan.copy_settings_preview_only"])
        draft["project_mode"] = "later"
        self.assertFalse(valid("onboarding_setup_plan", draft))
        existing = copy.deepcopy(CASES["valid.setup_plan.connect_existing.local_discovery"])
        existing["settings_transfer"] = draft["settings_transfer"]
        self.assertFalse(valid("onboarding_setup_plan", existing))

    def test_settings_copy_never_mutates_a_simply_opened_existing_project(self):
        session = copy.deepcopy(CASES["valid.session.postcommit_provider"])
        session["setup_draft"]["settings_transfer"] = copy.deepcopy(CASES["valid.setup_plan.copy_settings_preview_only"]["settings_transfer"])
        session["project_commit_binding"]["command_id"] = "cmd.project.open"
        self.assertIn("onboarding_settings_copy_cannot_mutate_opened_existing_project",
                      onboarding_semantic_failures("onboarding_session", session))


if __name__ == "__main__":
    unittest.main()
