"""Exact SCM owner/central joins; fixture resolution is not native authority."""

import copy
import json
from pathlib import Path
import sys
import unittest


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_ui_command_response as GATE

SCHEMA = "Plans/source_control_contracts.schema.json"
RESULT_BINDING = {
    "path": SCHEMA, "json_pointer": "#/$defs/source_control_command_result",
    "schema_id": "pm.source_control.command_result.v1",
}
SOURCE = json.loads((ROOT / "Plans/source_control_contract_fixtures.json").read_text())["valid"]
REQUESTS = {row["value"]["scope"]["command_id"]: row["value"] for row in SOURCE
            if row["definition"] == "source_control_command_request"}
RESULT = next(row["value"] for row in SOURCE if row["definition"] == "source_control_command_result")
CENTRAL = {row["case_id"]: row for row in json.loads(
    (ROOT / "Plans/ui_command_response_fixtures.json").read_text())["valid"]}
STATES = {"succeeded": "succeeded", "blocked": "rejected", "failed": "failed",
          "cancelled": "cancelled", "recovery_required": "terminal_unknown",
          "effect_unknown": "terminal_unknown"}


def bundle_for(command="cmd.source_control.remote.fetch", state="succeeded"):
    request = copy.deepcopy(REQUESTS[command])
    result = copy.deepcopy(RESULT)
    result.update(scope=copy.deepcopy(request["scope"]),
                  command_instance_id=request["command_instance_id"], outcome=state,
                  effect_state="effect_unknown" if state == "effect_unknown" else "effects_reconciled")
    if "return_context" in request:
        result["return_context"] = copy.deepcopy(request["return_context"])
    central_state = STATES[state]
    bundle = copy.deepcopy(CENTRAL["shared_" + central_state])
    bundle["owner_request"] = request
    for row in (bundle["response"], bundle["normalized_request"], bundle["outcome"]):
        row["command_id"] = command
    for row in (bundle["response"], bundle["normalized_request"]):
        row["command_instance_id"] = request["command_instance_id"]
    for identity in (bundle["response"]["owner_identity"],
                     bundle["normalized_request"]["owner_identity"], bundle["outcome"]["identity"]):
        identity["command_instance_id"] = request["command_instance_id"]
        identity.update(request["scope"]["lineage"])
        identity["server_id"] = identity["project_home_server_id"]
    for row in (bundle["response"], bundle["outcome"]):
        row["owner_result_schema_ref"] = copy.deepcopy(RESULT_BINDING)
    for row in (bundle["normalized_request"], bundle["outcome"]):
        # The normalized binding is a trusted fixture input, not a native
        # authenticated dispatcher or a newly prescribed request-digest DTO.
        row["payload_sha256"] = GATE.owner_result_digest(request)
        row["idempotency_key"] = request["idempotency_key"]
        row["target_generation"] = request["scope"]["lineage"]["topology_generation"]
    bundle["response"]["receipt_ref"] = result["operation_receipt_ref"]
    if state == "succeeded":
        bundle["response"]["result_status"] = "succeeded"
    bundle["outcome"]["result_receipt_ref"] = result["operation_receipt_ref"]
    bundle["owner_result"] = result
    rehash(bundle)
    return bundle


def rehash(bundle):
    bundle["outcome"]["owner_result_sha256"] = GATE.owner_result_digest(bundle["owner_result"])


class SourceControlResponseTests(unittest.TestCase):
    def test_all_nineteen_requests_and_six_terminal_states(self):
        self.assertEqual(len(REQUESTS), 19)
        for command in REQUESTS:
            for state in STATES:
                with self.subTest(command=command, state=state):
                    self.assertEqual(GATE.response_bundle_failures(bundle_for(command, state)), [])

    def test_schema_valid_foreign_scope_and_receipt_cannot_pass(self):
        for field in ("project_id", "project_home_server_id", "execution_host_id",
                      "execution_environment_id", "source_location_id", "topology_generation"):
            with self.subTest(field=field):
                bundle = bundle_for()
                lineage = bundle["owner_result"]["scope"]["lineage"]
                lineage[field] = 999 if field == "topology_generation" else "foreign:identity"
                rehash(bundle)
                self.assertEqual(GATE.structural_failures(SCHEMA, bundle["owner_result"], RESULT_BINDING["json_pointer"]), [])
                self.assertIn("scm_owner_scope_mismatch", GATE.response_bundle_failures(bundle))
        bundle = bundle_for()
        bundle["owner_result"]["operation_receipt_ref"] = "receipt:foreign"
        rehash(bundle)
        self.assertIn("scm_owner_receipt_mismatch", GATE.response_bundle_failures(bundle))

    def test_nested_command_cannot_evade_top_level_binding(self):
        bundle = bundle_for()
        bundle["owner_result"]["scope"]["command_id"] = "cmd.source_control.remote.sync"
        rehash(bundle)
        self.assertEqual(GATE.structural_failures(SCHEMA, bundle["owner_result"], RESULT_BINDING["json_pointer"]), [])
        self.assertIn("scm_owner_command_mismatch", GATE.response_bundle_failures(bundle))

    def test_optional_lineage_cannot_be_invented_or_substituted(self):
        for source, target in (("plan_id", "named_plan_id"), ("goal_id", "goal_id")):
            with self.subTest(field=source):
                bundle = bundle_for()
                identities = (bundle["response"]["owner_identity"],
                              bundle["normalized_request"]["owner_identity"], bundle["outcome"]["identity"])
                for identity in identities:
                    identity[target] = "foreign:lineage"
                self.assertIn("scm_owner_scope_mismatch", GATE.response_bundle_failures(bundle))
                for row in (bundle["owner_request"], bundle["owner_result"]):
                    row["scope"]["lineage"][source] = "owner:lineage"
                rehash(bundle)
                self.assertIn("scm_owner_scope_mismatch", GATE.response_bundle_failures(bundle))
                for identity in identities:
                    identity[target] = "owner:lineage"
                self.assertEqual(GATE.response_bundle_failures(bundle), [])

    def test_every_non_success_owner_state_rejects_central_success(self):
        for state in set(STATES) - {"succeeded"}:
            with self.subTest(state=state):
                bundle = bundle_for()
                bundle["owner_result"]["outcome"] = state
                if state == "effect_unknown":
                    bundle["owner_result"]["effect_state"] = "effect_unknown"
                rehash(bundle)
                self.assertIn("scm_owner_outcome_mismatch", GATE.response_bundle_failures(bundle))

    def test_unknown_effect_overrides_failed_terminal_projection(self):
        bundle = bundle_for(state="failed")
        bundle["owner_result"]["effect_state"] = "effect_unknown"
        rehash(bundle)
        self.assertIn("scm_owner_outcome_mismatch", GATE.response_bundle_failures(bundle))
        bundle["outcome"]["outcome"] = "terminal_unknown"
        bundle["response"]["result_status"] = "recovery_required"
        self.assertEqual(GATE.response_bundle_failures(bundle), [])

    def test_request_is_required_and_exactly_bound(self):
        bundle = bundle_for()
        bundle.pop("owner_request")
        self.assertIn("scm_owner_request_schema", GATE.response_bundle_failures(bundle))
        for field in ("command_instance_id", "idempotency_key"):
            with self.subTest(field=field):
                bundle = bundle_for()
                bundle["owner_request"][field] = "foreign:value"
                self.assertIn("scm_owner_request_binding_mismatch", GATE.response_bundle_failures(bundle))
        for field in ("repo_id", "workspace_id", "writer_lease_ref", "credential_lease_ref"):
            with self.subTest(field=field):
                bundle = bundle_for()
                bundle["owner_request"]["scope"][field] = "foreign:value"
                self.assertIn("scm_owner_request_binding_mismatch", GATE.response_bundle_failures(bundle))

    def test_return_context_is_echoed_without_invention(self):
        bundle = bundle_for("cmd.source_control.repository.clone")
        bundle["owner_result"]["return_context"]["focus_id"] = "foreign:focus"
        rehash(bundle)
        self.assertIn("scm_owner_return_context_mismatch", GATE.response_bundle_failures(bundle))

    def test_all_terminal_results_require_a_non_secret_receipt(self):
        for state in STATES:
            for invalid in (None, "", "https://user:password@example.test/"):
                with self.subTest(state=state, invalid=invalid):
                    bundle = bundle_for("cmd.source_control.backend.detect", state)
                    bundle["owner_result"]["operation_receipt_ref"] = invalid
                    self.assertTrue(GATE.structural_failures(SCHEMA, bundle["owner_result"], RESULT_BINDING["json_pointer"]))

    def test_local_projection_and_wrong_typed_family_are_not_escape_routes(self):
        bundle = copy.deepcopy(CENTRAL["local_projection_success"])
        for row in (bundle["response"], bundle["normalized_request"]):
            row["command_id"] = "cmd.source_control.remote.fetch"
        self.assertIn("durable_command_disguised_as_local_projection", GATE.response_bundle_failures(bundle))
        bundle = copy.deepcopy(CENTRAL["browser_succeeded"])
        for row in (bundle["response"], bundle["normalized_request"], bundle["outcome"]):
            row["command_id"] = "cmd.source_control.remote.fetch"
        self.assertIn("scm_owner_result_binding", GATE.response_bundle_failures(bundle))

    def test_no_effect_is_not_automatically_an_owner_verified_no_op(self):
        bundle = bundle_for()
        bundle["owner_result"]["effect_state"] = "no_effect"
        rehash(bundle)
        self.assertEqual(GATE.response_bundle_failures(bundle), [])
        bundle["response"]["result_status"] = "no_op"
        self.assertIn("scm_owner_outcome_mismatch", GATE.response_bundle_failures(bundle))

    def test_exact_replay_uses_original_result_and_receipt(self):
        bundle = bundle_for()
        bundle["original_response"] = copy.deepcopy(bundle["response"])
        bundle["response"].update(replayed=True, original_dispatch_id=bundle["response"]["dispatch_id"],
                                  dispatch_id="dispatch:scm:replay")
        self.assertEqual(GATE.response_bundle_failures(bundle), [])
        bundle["owner_result"]["operation_receipt_ref"] = "receipt:replacement"
        rehash(bundle)
        self.assertIn("scm_owner_receipt_mismatch", GATE.response_bundle_failures(bundle))


if __name__ == "__main__":
    unittest.main()
