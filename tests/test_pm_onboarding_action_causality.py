"""Onboarding dismissal/choice joins, not native persistence or owner authority."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("onboarding_causality_gate", ROOT / "scripts/pm-new-contracts-verify.py")
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)
from pm_onboarding_semantics import (
    _PRESERVED_CONTINUATION_FIELDS, onboarding_action_join_failures, onboarding_semantic_failures,
)
from pm_ui_command_response import owner_result_digest

SCHEMA = json.loads((ROOT / "Plans/product_onboarding_contracts.schema.json").read_text())
PACK = json.loads((ROOT / "Plans/product_onboarding_contract_fixtures.json").read_text())
CASES = {row["name"]: row["value"] for row in PACK["valid"]}
REGISTRY = GATE.offline_schema_registry()


def valid(definition, value):
    return GATE.validator_for(SCHEMA, {"$ref": "#/$defs/" + definition}, REGISTRY).is_valid(value)


def dismissal(action="close", source="valid.result.applied.close"):
    current = copy.deepcopy(CASES[source]["continuation_snapshot"])
    request = copy.deepcopy(CASES["valid.request." + action])
    request.update(onboarding_session_id=current["onboarding_session_id"], stage=current["stage"],
                   expected_revision=current["revision"], continuation_generation=current["continuation_generation"],
                   return_focus_id=current["return_focus_id"])
    result = copy.deepcopy(CASES["valid.result.applied." + action])
    result.update(onboarding_session_id=current["onboarding_session_id"], stage_before=current["stage"],
                  stage_after=current["stage"], revision=current["revision"] + 1,
                  continuation_generation=current["continuation_generation"], return_focus_id=current["return_focus_id"],
                  continuation_snapshot=copy.deepcopy(current))
    result["continuation_snapshot"]["revision"] = result["revision"]
    return current, request, result


def selected_path(choice="start_on_this_computer"):
    suffix = ".connect_existing_server" if choice == "connect_existing_server" else ""
    request = copy.deepcopy(CASES["valid.request.choose_simple_path" + suffix])
    result = copy.deepcopy(CASES["valid.result.applied.choose_simple_path" + suffix])
    request["choice"] = choice
    request["local_context"]["selection_ref"] = choice
    result["continuation_snapshot"]["simple_path_selection"] = choice
    current = copy.deepcopy(result["continuation_snapshot"])
    current.update(stage="simple_path", simple_path_selection=None, path_kind=None,
                   queued_setup_plan_ref=None, queued_setup_plan_revision=None,
                   history=["welcome", "simple_path"], revision=request["expected_revision"])
    return current, request, result


class OnboardingActionCausalityTests(unittest.TestCase):
    def assert_valid_values(self, current, request, result):
        for definition, value in (("onboarding_continuation_snapshot", current),
                                  ("onboarding_action_request", request), ("onboarding_action_result", result)):
            with self.subTest(definition=definition):
                self.assertTrue(valid(definition, value))
                self.assertEqual(onboarding_semantic_failures(definition, value), [])

    def test_dismissals_preserve_draft_committed_phases_and_active_owner_branch(self):
        for action in ("close", "defer"):
            for source in ("valid.result.applied.close", "valid.result.applied.defer",
                           "valid.result.actual_commit_enters_provider", "valid.result.skip_provider",
                           "valid.result.applied.open_owner_flow"):
                with self.subTest(action=action, source=source):
                    values = dismissal(action, source)
                    self.assert_valid_values(*values)
                    self.assertEqual(onboarding_action_join_failures(*values), [])

    def test_dismissals_reject_schema_valid_draft_plan_client_and_focus_substitution(self):
        replacements = {"project_draft_ref": "draft:substituted", "project_draft_revision": 999,
                        "queued_setup_plan_ref": "setup-plan:substituted", "initiating_client_id": "client:other",
                        "return_focus_id": "focus:other", "scm_backend_selection": "jujutsu",
                        "forge_provider_selection": "gitlab"}
        for action in ("close", "defer"):
            for field, replacement in replacements.items():
                with self.subTest(action=action, field=field):
                    current, request, result = dismissal(action)
                    result["continuation_snapshot"][field] = replacement
                    if field == "return_focus_id":
                        result[field] = replacement
                    self.assert_valid_values(current, request, result)
                    self.assertIn("onboarding_dismissal_changes_" + field,
                                  onboarding_action_join_failures(current, request, result))

    def test_dismissals_preserve_actual_owner_branch_and_review_hash(self):
        for action in ("close", "defer"):
            current, request, result = dismissal(action, "valid.result.applied.open_owner_flow")
            result["continuation_snapshot"]["active_branch"] = None
            self.assert_valid_values(current, request, result)
            self.assertIn("onboarding_dismissal_changes_active_branch", onboarding_action_join_failures(current, request, result))
            current, request, result = dismissal(action)
            result["continuation_snapshot"]["approved_setup_plan_sha256"] = "d" * 64
            self.assert_valid_values(current, request, result)
            self.assertIn("onboarding_dismissal_changes_approved_setup_plan_sha256", onboarding_action_join_failures(current, request, result))

    def test_dismissals_require_complete_prior_continuation(self):
        for action in ("close", "defer"):
            current, request, result = dismissal(action)
            for field in current:
                if field in {"revision", "onboarding_session_id", "continuation_generation", "stage", "project_disposition"}:
                    continue  # Common admission fields are schema-validated by the caller.
                missing = copy.deepcopy(current)
                del missing[field]
                with self.subTest(action=action, field=field):
                    self.assertIn("onboarding_dismissal_missing_current_" + field,
                                  onboarding_action_join_failures(missing, request, result))

    def test_close_does_not_add_an_owner_route_or_operation(self):
        for field in ("owner_route_ref", "owner_operation_ref"):
            current, request, result = dismissal()
            result[field] = "unrequested:owner"
            self.assert_valid_values(current, request, result)
            self.assertIn("onboarding_dismissal_dispatches_owner_work", onboarding_action_join_failures(current, request, result))
        current, request, result = dismissal()
        request["owner_route_ref"] = "unrequested:owner"
        self.assert_valid_values(current, request, result)
        self.assertIn("onboarding_dismissal_dispatches_owner_work", onboarding_action_join_failures(current, request, result))

    def test_dismissal_request_cannot_redirect_focus(self):
        for action in ("close", "defer"):
            current, request, result = dismissal(action)
            request["return_focus_id"] = "focus:other"
            self.assert_valid_values(current, request, result)
            self.assertIn("onboarding_dismissal_request_focus_mismatch", onboarding_action_join_failures(current, request, result))

    def test_disabled_dismissal_remains_nonwriting_and_does_not_restore(self):
        current, request, result = dismissal()
        result.update(status="disabled", local_effect="none", onboarding_session_written=False,
                      continuation_snapshot=None, revision=current["revision"],
                      error_code="stale_projection", disabled_reason="Refresh the current session")
        self.assert_valid_values(current, request, result)
        self.assertEqual(onboarding_action_join_failures(current, request, result), [])

    def test_all_four_exact_path_choices_remain_admitted(self):
        for choice in ("start_on_this_computer", "connect_existing_server", "setup_server", "restore_backup"):
            with self.subTest(choice=choice):
                values = selected_path(choice)
                self.assert_valid_values(*values)
                self.assertEqual(onboarding_action_join_failures(*values), [])

    def test_schema_valid_path_result_cannot_replace_actual_requested_choice(self):
        choices = ("start_on_this_computer", "connect_existing_server", "setup_server", "restore_backup")
        for requested in choices:
            for returned in choices:
                if requested == returned:
                    continue
                with self.subTest(requested=requested, returned=returned):
                    current, request, _ = selected_path(requested)
                    _, _, result = selected_path(returned)
                    result.update(onboarding_session_id=request["onboarding_session_id"],
                                  action_instance_id=request["action_instance_id"],
                                  revision=current["revision"] + 1, continuation_generation=current["continuation_generation"])
                    result["continuation_snapshot"].update(onboarding_session_id=result["onboarding_session_id"],
                        revision=result["revision"], continuation_generation=result["continuation_generation"])
                    self.assert_valid_values(current, request, result)
                    self.assertIn("onboarding_selected_path_result_mismatch", onboarding_action_join_failures(current, request, result))


class OnboardingHomeEntryTests(unittest.TestCase):
    def home_request(self):
        request = copy.deepcopy(CASES["valid.request.start"])
        request["source_surface"] = "home_menu"
        return request

    def test_home_menu_uses_existing_fresh_start_at_welcome(self):
        request = self.home_request()
        self.assertEqual(request["action_id"], "ui.onboarding.start")
        self.assertEqual(request["local_context"]["intent"], "start")
        self.assertEqual(request["stage"], "welcome")
        self.assertTrue(valid("onboarding_action_request", request))
        self.assertEqual(onboarding_semantic_failures("onboarding_action_request", request), [])
        self.assertIsNone(request["owner_route_ref"])

    def test_unknown_home_source_spellings_are_not_aliases(self):
        for source in ("home", "home_dropdown", "Home_menu", "home_menu_unknown"):
            request = self.home_request()
            request["source_surface"] = source
            with self.subTest(source=source):
                self.assertFalse(valid("onboarding_action_request", request))

    def test_home_rerun_cannot_be_normalized_to_resume(self):
        request = self.home_request()
        request["local_context"]["intent"] = "resume"
        self.assertFalse(valid("onboarding_action_request", request))
        request["source_surface"] = "resume"
        self.assertTrue(valid("onboarding_action_request", request))

    def test_home_fresh_start_cannot_skip_welcome(self):
        for stage in ("simple_path", "first_project", "provider_setup", "ready"):
            request = self.home_request()
            request["stage"] = stage
            with self.subTest(stage=stage):
                self.assertFalse(valid("onboarding_action_request", request))


def ready_back(path="committed"):
    source = "valid.result.skip_free_models" if path == "committed" else "valid.result.applied.finish"
    current = copy.deepcopy(CASES[source]["continuation_snapshot"])
    if path == "connect_existing":
        current.update(simple_path_selection="connect_existing_server", path_kind="connect_existing",
                       project_disposition="not_applicable",
                       provider_phase_status="not_applicable", free_models_phase_status="not_applicable",
                       history=copy.deepcopy(SCHEMA["$defs"]["connect_existing_stage_order"]["const"]))
    request = copy.deepcopy(CASES["valid.request.back"])
    request.update(stage="ready", onboarding_session_id=current["onboarding_session_id"],
                   expected_revision=current["revision"], continuation_generation=current["continuation_generation"],
                   return_focus_id=current["return_focus_id"])
    after = copy.deepcopy(current)
    after.update(stage=current["history"][-2], history=current["history"][:-1], revision=current["revision"] + 1)
    result = copy.deepcopy(CASES["valid.result.applied.back"])
    result.update(onboarding_session_id=current["onboarding_session_id"], action_instance_id=request["action_instance_id"],
                  stage_before="ready", stage_after=after["stage"], continuation_snapshot=after,
                  return_focus_id=current["return_focus_id"], revision=after["revision"],
                  continuation_generation=current["continuation_generation"])
    session_source = "valid.session.postcommit_provider" if path == "committed" else "valid.session.active_without_branch"
    session = copy.deepcopy(CASES[session_source])
    session.update({key: copy.deepcopy(value) for key, value in current.items() if key in session})
    session.update(status="active", return_context=None)
    if path != "committed":
        draft = session["setup_draft"]
        draft.update(project_draft_ref=current["project_draft_ref"], project_draft_revision=current["project_draft_revision"])
        if path == "connect_existing":
            draft.update(journey="connect_existing", project_mode="later", local_history=False,
                         server_mode="existing_server", remote_mode="local_or_vpn")
        for value in (current, after, session):
            value["approved_setup_plan_sha256"] = owner_result_digest(draft)
    return current, request, result, session


class OnboardingReadyBackTests(unittest.TestCase):
    paths = ("committed", "deferred", "connect_existing")

    def assert_valid_values(self, current, request, result, session):
        for definition, value in (("onboarding_continuation_snapshot", current),
                                  ("onboarding_action_request", request), ("onboarding_action_result", result),
                                  ("onboarding_session", session)):
            with self.subTest(definition=definition):
                self.assertTrue(valid(definition, value))
                self.assertEqual(onboarding_semantic_failures(definition, value), [])

    def join(self, current, request, result, session):
        return onboarding_action_join_failures(current, request, result, ready_back_session=session)

    def test_all_three_paths_pop_exact_history_without_changing_setup_state(self):
        for path in self.paths:
            with self.subTest(path=path):
                current, request, result, session = values = ready_back(path)
                self.assert_valid_values(*values)
                self.assertEqual(self.join(*values), [])
                after = result["continuation_snapshot"]
                self.assertEqual(after["stage"], "free_models_setup" if path == "committed" else "automatic_preparation")
                self.assertEqual(after["history"], current["history"][:-1])
                self.assertEqual({k: v for k, v in current.items() if k not in {"stage", "history", "revision"}},
                                 {k: v for k, v in after.items() if k not in {"stage", "history", "revision"}})

    def test_schema_valid_client_focus_scm_and_forge_substitution_is_causal(self):
        for path in self.paths:
            for field, replacement in {"initiating_client_id": "client:other", "return_focus_id": "focus:other",
                                       "scm_backend_selection": "jujutsu", "forge_provider_selection": "gitlab"}.items():
                with self.subTest(path=path, field=field):
                    current, request, result, session = values = ready_back(path)
                    self.assertNotEqual(current[field], replacement)
                    result["continuation_snapshot"][field] = replacement
                    if field == "return_focus_id":
                        result[field] = replacement
                    self.assert_valid_values(*values)
                    self.assertEqual(self.join(*values), ["onboarding_ready_back_changes_" + field])

    def test_schema_valid_deferred_and_connect_plan_substitution_is_causal(self):
        for path in ("deferred", "connect_existing"):
            current, request, result, session = values = ready_back(path)
            result["continuation_snapshot"]["queued_setup_plan_ref"] = "setup-plan:other"
            self.assert_valid_values(*values)
            self.assertEqual(self.join(*values), ["onboarding_ready_back_changes_queued_setup_plan_ref"])

    def test_ready_cannot_inject_an_owner_branch(self):
        branch = copy.deepcopy(CASES["valid.result.applied.open_owner_flow"]["continuation_snapshot"]["active_branch"])
        for path in self.paths:
            current, request, result, session = values = ready_back(path)
            self.assert_valid_values(*values)
            self.assertIsNone(current["active_branch"])
            self.assertEqual(self.join(*values), [])
            result["continuation_snapshot"]["active_branch"] = copy.deepcopy(branch)
            self.assertIn("onboarding_branch_return_stage_mismatch",
                          onboarding_semantic_failures("onboarding_action_result", result))
            self.assertEqual(self.join(*values), ["onboarding_ready_back_changes_active_branch"])

    def test_prior_session_is_required_and_resume_witness_is_not_a_substitute(self):
        for path in self.paths:
            current, request, result, session = ready_back(path)
            self.assertEqual(onboarding_action_join_failures(current, request, result),
                             ["onboarding_ready_back_missing_prior_session"])
            self.assertEqual(onboarding_action_join_failures(current, request, result, resume_session=session),
                             ["onboarding_ready_back_missing_prior_session"])

    def test_schema_valid_nonactive_sessions_cannot_be_reactivated(self):
        for path in self.paths:
            for status in ("interrupted", "skipped", "completed", "cancelled"):
                current, request, result, session = values = ready_back(path)
                session["status"] = status
                with self.subTest(path=path, status=status):
                    self.assert_valid_values(*values)
                    self.assertEqual(self.join(*values), ["onboarding_ready_back_session_not_active"])

    def test_deferred_session_must_resume_before_ready_back(self):
        for path in self.paths:
            current, request, result, session = values = ready_back(path)
            returned = copy.deepcopy(CASES["valid.session.deferred_with_active_branch"]["return_context"])
            returned.update({key: copy.deepcopy(value) for key, value in current.items() if key in returned})
            returned.update(expected_revision=current["revision"], project_id=session["project_id"])
            session.update(status="deferred", return_context=returned)
            self.assert_valid_values(*values)
            self.assertEqual(self.join(*values), ["onboarding_ready_back_session_not_active"])

    def test_all_continuation_fields_have_explicit_preservation_guards(self):
        # Defensive value-join checks, not a claim these corrupt values pass schemas.
        for field in _PRESERVED_CONTINUATION_FIELDS:
            if field in {"stage", "history"}:
                continue
            current, request, result, session = values = ready_back()
            result["continuation_snapshot"][field] = {"invalid_substitution": True}
            with self.subTest(field=field):
                self.assertIn("onboarding_ready_back_changes_" + field, self.join(*values))

    def test_request_and_result_correlation_stays_current(self):
        for side, field, replacement, rule in (
            ("request", "onboarding_session_id", "session:other", "onboarding_action_onboarding_session_id_mismatch"),
            ("result", "onboarding_session_id", "session:other", "onboarding_action_onboarding_session_id_mismatch"),
            ("request", "continuation_generation", 999, "onboarding_action_continuation_generation_mismatch"),
            ("result", "continuation_generation", 999, "onboarding_action_continuation_generation_mismatch"),
            ("request", "expected_revision", 999, "onboarding_action_current_state_mismatch"),
            ("result", "revision", 999, "onboarding_action_result_revision_mismatch"),
            ("result", "action_instance_id", "action:other", "onboarding_action_result_action_instance_id_mismatch"),
        ):
            current, request, result, session = values = ready_back()
            (request if side == "request" else result)[field] = replacement
            if side == "result" and field in result["continuation_snapshot"]:
                result["continuation_snapshot"][field] = replacement
            self.assert_valid_values(*values)
            self.assertEqual(self.join(*values), [rule])

    def test_null_draft_projection_cannot_match_a_durable_ready_session(self):
        # This permissive projection is independently valid, but PWIZ-021's
        # queued durable draft has an identity. Do not normalize it silently.
        current, request, result, session = values = ready_back("connect_existing")
        for value in (current, result["continuation_snapshot"]):
            value.update(project_draft_ref=None, project_draft_revision=None)
        self.assert_valid_values(*values)
        self.assertEqual(self.join(*values), ["onboarding_ready_back_session_project_draft_ref_mismatch",
                                             "onboarding_ready_back_session_project_draft_revision_mismatch"])

    def test_schema_valid_session_identity_revision_generation_and_state_mismatch(self):
        for path in self.paths:
            for field, replacement in {"onboarding_session_id": "onboarding:other", "revision": 999,
                                       "continuation_generation": 999, "scm_backend_selection": "jujutsu"}.items():
                current, request, result, session = values = ready_back(path)
                session[field] = replacement
                with self.subTest(path=path, field=field):
                    self.assert_valid_values(*values)
                    self.assertEqual(self.join(*values), ["onboarding_ready_back_session_" + field + "_mismatch"])

    def test_request_focus_and_owner_work_are_not_new_navigation_authority(self):
        for path in self.paths:
            current, request, result, session = values = ready_back(path)
            request["return_focus_id"] = "focus:other"
            self.assert_valid_values(*values)
            self.assertEqual(self.join(*values), ["onboarding_ready_back_request_focus_mismatch"])
            for side, field in (("request", "owner_route_ref"), ("result", "owner_route_ref"),
                                ("result", "owner_operation_ref")):
                current, request, result, session = values = ready_back(path)
                (request if side == "request" else result)[field] = "owner:unrequested"
                self.assert_valid_values(*values)
                self.assertEqual(self.join(*values), ["onboarding_ready_back_dispatches_owner_work"])

    def test_exact_history_not_an_arbitrary_earlier_valid_stage(self):
        current, request, result, session = values = ready_back("committed")
        after = result["continuation_snapshot"]
        after.update(stage="provider_setup", history=after["history"][:-1])
        result["stage_after"] = "provider_setup"
        self.assertTrue(valid("onboarding_continuation_snapshot", after))
        self.assertFalse(valid("onboarding_action_result", result))
        self.assertIn("onboarding_ready_back_not_exact_previous_history", self.join(*values))

    def test_ready_refusals_are_nonwriting_and_do_not_need_active_witness(self):
        for path in self.paths:
            for status in ("disabled", "rejected"):
                current, request, result, session = values = ready_back(path)
                result.update(status=status, stage_after="ready", local_effect="none", onboarding_session_written=False,
                              continuation_snapshot=None, revision=current["revision"],
                              error_code="stale_projection", disabled_reason="Refresh the current session")
                self.assert_valid_values(*values)
                self.assertEqual(onboarding_action_join_failures(current, request, result), [])
                result["onboarding_session_written"] = True
                self.assertFalse(valid("onboarding_action_result", result))

    def test_other_back_stages_are_not_widened(self):
        for stage in ("welcome", "provider_setup"):
            _, request, _, _ = ready_back()
            request["stage"] = stage
            self.assertFalse(valid("onboarding_action_request", request))
        request = CASES["valid.request.back"]
        result = CASES["valid.result.applied.back"]
        self.assertTrue(valid("onboarding_action_request", request))
        self.assertTrue(valid("onboarding_action_result", result))


if __name__ == "__main__":
    unittest.main()
