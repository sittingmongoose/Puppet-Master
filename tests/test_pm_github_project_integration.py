"""Static GitHub/Project candidates and owner joins; DL-039 denies admission."""

import argparse
import copy
import importlib.util
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))


def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    loaded = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(loaded)
    return loaded


GATE = module("github_project_gate", "pm-github-project-integration.py")
FORGE = GATE.forge
RESPONSE = GATE.response
STANDARD = module("github_project_standard", "pm-plans-verify.py")


def response_case():
    source = next(row for row in GATE.load("Plans/ui_command_response_fixtures.json")["valid"] if row["case_id"] == "server_application_scope")
    value = copy.deepcopy(source)
    fixture = GATE.fixture_bundle()
    request, result, snapshot = (fixture[key] for key in ("request", "result", "snapshot"))
    value.update(owner_request=request, owner_result=result, owner_snapshot=snapshot)
    binding = {"path": FORGE.SCHEMA, "json_pointer": "#/$defs/project_action_result", "schema_id": result["schema_id"]}
    identity = value["outcome"]["identity"]
    identity.update(scope_kind="application", project_id=None, project_home_server_id=None, named_plan_id=None, server_id=snapshot["server_id"], operation_id=snapshot["operation_id"], command_instance_id=request["command_instance_id"])
    for record in (value["response"], value["normalized_request"]):
        record.update(command_id=FORGE.COMMAND, command_instance_id=request["command_instance_id"], operation_id=snapshot["operation_id"], owner_identity=copy.deepcopy(identity))
    value["response"].update(owner_result_schema_ref=binding, receipt_ref=snapshot["registration_receipt_ref"], ack_status="accepted", result_status="succeeded")
    value["outcome"].update(command_id=FORGE.COMMAND, outcome="succeeded", owner_result_schema_ref=binding, result_receipt_ref=snapshot["registration_receipt_ref"], owner_result_sha256=RESPONSE.owner_result_digest(result), payload_sha256=RESPONSE.owner_result_digest(request), idempotency_key=request["idempotency_key"])
    value["normalized_request"].update(payload_sha256=RESPONSE.owner_result_digest(request), idempotency_key=request["idempotency_key"])
    return value


class GitHubProjectIntegrationTests(unittest.TestCase):
    def assert_quarantined_unchanged(self, replay, case):
        before = copy.deepcopy(vars(replay))
        self.assertEqual(replay.consume(case), "quarantined_without_checkpoint_advance")
        self.assertEqual(vars(replay), before)

    def test_two_candidates_and_all_negative_fixtures_without_admission(self):
        report = GATE.validate()
        self.assertEqual(report["failures"], [])
        self.assertEqual((report["positive_events"], report["negative_cases"]), (2, 74))
        self.assertEqual(report["registry_families"], 92)
        self.assertEqual(report["admitted_events"], 0)
        self.assertEqual(report["event_disposition"], "quarantined_not_admitted")
        self.assertFalse(report["event_persistence_authorized"])
        self.assertFalse(report["native_handler_proven"])
        self.assertEqual(report["global_event_denominator"], "UNKNOWN_OPEN")

    def test_standard_gate_is_registered_and_passes(self):
        self.assertIn("validate-github-project-integration", STANDARD.COMMANDS)
        self.assertEqual(STANDARD.cmd_validate_github_project_integration(argparse.Namespace(subcheck_timeout_seconds=20))["status"], "pass")
        self.assertEqual(STANDARD.cmd_validate_wiring_matrix(argparse.Namespace())["status"], "pass")

    def test_request_before_project_and_bound_after_commit(self):
        requested, bound = list(GATE.fixture_cases())
        for case in (requested, bound):
            self.assertEqual(GATE.candidate_failures(case), [])
            self.assertEqual(GATE.event_failures(case), ["event_not_admitted_dl039"])
        self.assertIsNone(requested["event"]["project_id"])
        self.assertEqual(requested["event"]["scope_kind"], "application")
        self.assertEqual(bound["event"]["project_id"], bound["result"]["project_id"])
        self.assertEqual(bound["event"]["scope_kind"], "project")
        for field in ("operation_id", "request_sha256", "admission_receipt_ref"):
            self.assertEqual(requested["event"]["payload"][field], bound["event"]["payload"][field])
        # The intake candidate does not assert a later Project commit.
        requested["result"] = None
        requested["snapshot"]["project"] = None
        self.assertEqual(GATE.candidate_failures(requested), [])
        self.assertEqual(GATE.event_failures(requested), ["event_not_admitted_dl039"])

    def test_actual_central_response_join_preserves_application_operation(self):
        case = response_case()
        self.assertEqual(RESPONSE.response_bundle_failures(case), [])
        self.assertIsNone(case["response"]["owner_identity"]["project_id"])
        self.assertIsNotNone(case["owner_result"]["project_id"])
        case["owner_request"] = None
        self.assertIn("forge_request_schema", RESPONSE.response_bundle_failures(case))

    def test_validly_rehashed_but_foreign_result_and_scope_are_rejected(self):
        for field, wrong in (("command_instance_id", "command:other"), ("return_context", {**GATE.fixture_bundle()["request"]["return_context"], "focus_id": "other.focus"}), ("project_id", "project:other")):
            with self.subTest(field=field):
                case = response_case()
                case["owner_result"][field] = wrong
                case["owner_snapshot"]["settled_result"] = copy.deepcopy(case["owner_result"])
                case["outcome"]["owner_result_sha256"] = RESPONSE.owner_result_digest(case["owner_result"])
                self.assertTrue(RESPONSE.response_bundle_failures(case))
        case = response_case()
        for identity in (case["response"]["owner_identity"], case["normalized_request"]["owner_identity"], case["outcome"]["identity"]):
            identity.update(scope_kind="project", project_id=case["owner_result"]["project_id"], project_home_server_id=identity["server_id"])
        self.assertIn("forge_creation_operation_scope", RESPONSE.response_bundle_failures(case))

    def test_request_digest_receipt_and_noop_escape_rejected(self):
        case = response_case()
        case["normalized_request"]["payload_sha256"] = case["outcome"]["payload_sha256"] = "f" * 64
        self.assertIn("forge_outcome_request_binding", RESPONSE.response_bundle_failures(case))
        case = response_case()
        case["response"]["receipt_ref"] = case["outcome"]["result_receipt_ref"] = "receipt:unrelated"
        self.assertIn("forge_response_receipt", RESPONSE.response_bundle_failures(case))
        case = response_case()
        case["response"]["result_status"] = "no_op"
        self.assertIn("forge_response_outcome", RESPONSE.response_bundle_failures(case))

    def test_half_registration_and_unresolved_external_effects_are_not_settled(self):
        fixture = GATE.fixture_bundle()
        request, result, snapshot = (fixture[key] for key in ("request", "result", "snapshot"))
        result.update(outcome="cancelled", project_id=None, project_revision=None, project_currentness_sha256=None, lifecycle=None, persistence_disposition="not_attempted", error_code="cancelled", resulting_registry_revision=request["expected_registry_revision"], resulting_registry_currentness_sha256=request["expected_registry_currentness_sha256"])
        snapshot.update(settled_result=copy.deepcopy(result), project=None, registry_unchanged=True, external_effects_settled=True, after_registry=copy.deepcopy(snapshot["before_registry"]))
        self.assertEqual(FORGE.result_failures(request, result, snapshot), [])
        snapshot["external_effects_settled"] = False
        self.assertIn("forge_unresolved_effects_require_recovery", FORGE.result_failures(request, result, snapshot))
        snapshot["external_effects_settled"] = True
        snapshot["project"] = GATE.fixture_bundle()["snapshot"]["project"]
        self.assertIn("forge_half_listed_project", FORGE.result_failures(request, result, snapshot))

    def test_creation_replay_returns_original_not_new_effects_or_events(self):
        case = list(GATE.fixture_cases())[1]
        request, result, snapshot = (case[key] for key in ("request", "result", "snapshot"))
        snapshot.update(original_request=copy.deepcopy(request), original_result=copy.deepcopy(result), additional_effects=0)
        result["replayed"] = True
        snapshot["settled_result"] = copy.deepcopy(result)
        self.assertEqual(FORGE.result_failures(request, result, snapshot), [])
        case["event"]["payload"] = GATE.payload_for(case["event"]["event_type"], request, result, snapshot)
        self.assertIn("not_new_owner_transition", GATE.event_failures(case))
        snapshot["additional_effects"] = 1
        self.assertIn("forge_replay_changed_binding_or_effects", FORGE.result_failures(request, result, snapshot))

    def test_candidate_duplicates_and_transport_alias_conflicts_leave_no_replay_state(self):
        requested, bound = list(GATE.fixture_cases())
        replay = GATE.ReplayOracle()
        self.assert_quarantined_unchanged(replay, requested)
        duplicate = copy.deepcopy(requested)
        duplicate["event"].update(event_id="event:alias", sequence_id=3)
        self.assert_quarantined_unchanged(replay, duplicate)
        self.assertEqual(replay.checkpoint, -1)
        self.assert_quarantined_unchanged(replay, bound)
        conflict = copy.deepcopy(bound)
        conflict["event"].update(event_id="event:alias", sequence_id=4)
        self.assert_quarantined_unchanged(replay, conflict)
        self.assertEqual((replay.checkpoint, replay.projected_count, replay.executed_effects), (-1, 0, 0))

    def test_unknown_events_and_restart_cannot_enable_candidate_projection(self):
        cases = list(GATE.fixture_cases())
        replay = GATE.ReplayOracle()
        unknown = copy.deepcopy(cases[0])
        unknown["event"]["event_type"] = "github.repo.unknown"
        self.assert_quarantined_unchanged(replay, unknown)
        self.assertEqual(replay.identities, {})
        for _ in range(2):
            restarted = GATE.ReplayOracle()
            for case in cases:
                self.assert_quarantined_unchanged(restarted, case)
            self.assertEqual((restarted.projected_count, restarted.executed_effects), (0, 0))

    def test_cross_project_and_changed_intake_candidates_remain_unadmitted(self):
        requested, bound = list(GATE.fixture_cases())
        replay = GATE.ReplayOracle()
        self.assert_quarantined_unchanged(replay, requested)
        self.assert_quarantined_unchanged(replay, bound)
        other = copy.deepcopy(bound)
        other["result"]["project_id"] = other["snapshot"]["project"]["project_id"] = "project:second"
        other["snapshot"]["settled_result"] = copy.deepcopy(other["result"])
        other["event"].update(event_id="event:new-transport", sequence_id=3, project_id="project:second")
        other["event"]["payload"] = GATE.payload_for(other["event"]["event_type"], other["request"], other["result"], other["snapshot"])
        self.assertEqual(GATE.candidate_failures(other), [])
        self.assertEqual(GATE.event_failures(other), ["event_not_admitted_dl039"])
        self.assert_quarantined_unchanged(replay, other)
        changed = copy.deepcopy(bound)
        changed["request"]["idempotency_key"] = "idempotency:changed-intake"
        changed["snapshot"].update(request=copy.deepcopy(changed["request"]), request_sha256=RESPONSE.owner_result_digest(changed["request"]))
        changed["event"]["payload"] = GATE.payload_for(changed["event"]["event_type"], changed["request"], changed["result"], changed["snapshot"])
        changed["event"].update(event_id="event:changed-intake", sequence_id=3, idempotency_key=GATE.transition_key(changed["event"]["event_type"], changed["request"], changed["snapshot"]))
        self.assertEqual(GATE.candidate_failures(changed), [])
        self.assertEqual(GATE.event_failures(changed), ["event_not_admitted_dl039"])
        self.assert_quarantined_unchanged(replay, changed)
        self.assertEqual((replay.checkpoint, replay.projected_count, replay.executed_effects), (-1, 0, 0))

    def test_denial_preserves_preexisting_replay_state(self):
        replay = GATE.ReplayOracle()
        replay.identities["event:retained"] = "retained-digest"
        replay.transitions[("project:retained", "event:retained", "key:retained")] = "retained-digest"
        replay.operation_bindings[("server:retained", "operation:retained")] = ("request:retained", "receipt:retained")
        replay.owner_transitions[("server:retained", "operation:retained", "event:retained")] = "retained-digest"
        replay.checkpoint = 7
        replay.projected_count = 1
        for case in GATE.fixture_cases():
            self.assert_quarantined_unchanged(replay, case)

    def test_protected_payload_and_onboarding_bypass_rejected(self):
        case = list(GATE.fixture_cases())[0]
        case["event"]["payload"]["repository_ref"] = "https://user:password@example.test/repo"
        self.assertIn("payload_schema", GATE.event_failures(case))
        request = GATE.fixture_bundle()["request"]
        request["source_surface"] = "onboarding"
        self.assertIn("forge_request_schema", FORGE.request_failures(request))

    def test_owner_issued_uuid_ids_are_not_forced_into_reference_syntax(self):
        for case in GATE.fixture_cases():
            request, result, snapshot = (case[key] for key in ("request", "result", "snapshot"))
            snapshot.update(operation_id="12345678-1234-1234-1234-123456789012", server_id="23456789-1234-1234-1234-123456789012")
            result["project_id"] = snapshot["project"]["project_id"] = "34567890-1234-1234-1234-123456789012"
            snapshot["settled_result"] = copy.deepcopy(result)
            event = case["event"]
            event["payload"] = GATE.payload_for(event["event_type"], request, result, snapshot)
            event.update(project_id=event["payload"]["project_id"], correlation_id=snapshot["operation_id"], idempotency_key=GATE.transition_key(event["event_type"], request, snapshot))
            self.assertEqual(GATE.candidate_failures(case), [])
            self.assertEqual(GATE.event_failures(case), ["event_not_admitted_dl039"])

    def test_current_payloads_resolve_without_unsealing_historical_kernel(self):
        readiness = RESPONSE.module("github_project_readiness", "pm-implementation-readiness.py")
        self.assertEqual(len(GATE.load("Plans/event_family_registry.json")["families"]), 92)
        for row in GATE.load("Plans/event_family_registry.json")["families"]:
            payload, schema_id = readiness.event_family_payload_schema(row)
            self.assertIsInstance(payload, dict, row["event_type"])
            self.assertEqual(schema_id, row["payload_schema_id"])
        failures = readiness.event_family_registry_data_failures(
            GATE.load("Plans/event_family_registry.json"), GATE.load("Plans/event_family_registry.schema.json"),
            path_label="test:github-project-events", include_residuals=False)
        self.assertEqual([row["error"] for row in failures], ["event_family_registry_kernel_row_count_mismatch"])
        self.assertEqual(readiness.EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT, 39)


if __name__ == "__main__":
    unittest.main()
