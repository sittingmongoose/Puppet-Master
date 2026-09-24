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
from pm_onboarding_semantics import onboarding_action_join_failures, onboarding_semantic_failures

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


if __name__ == "__main__":
    unittest.main()
