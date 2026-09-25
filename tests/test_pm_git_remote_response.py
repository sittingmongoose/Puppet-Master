"""Focused SIR original/delivery/central-response joins for the two public Git
remote adapter commands.

Every assertion runs the actual central response path or the actual successor
composition. Fixture readers and the static digest double are synthetic test
inputs; passing here authenticates no native issuer, permission, lease,
publication target generation, effect or physical custody.
"""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import pm_ui_command_response as GATE
import pm_git_remote_response as RESPONSE
import pm_git_remote_selected as REMOTE

FIXTURES = json.loads((ROOT / "Plans/sir_git_remote_dispatch_fixtures.json").read_text())
CASES = {row["name"]: row["value"] for row in FIXTURES["valid"]}
INVALID = {row["name"]: row for row in FIXTURES["invalid"]}
ROUTES = {"cmd.git.fetch", "cmd.git.push"}


def reader(value):
    records = value["records"]
    return lambda ref: copy.deepcopy(records[ref])


def run(value, resolve=None):
    """Actual central response path over the fixture bundle."""
    return GATE.response_bundle_failures(value["bundle"], resolve_owner_record=resolve or reader(value),
                                         canonical_request_digest=GATE.owner_result_digest)


def direct(value, resolve=None):
    """Actual successor composition without the central structural pre-checks."""
    bundle = value["bundle"]
    return RESPONSE.response_failures(
        bundle["response"], bundle["outcome"], bundle["owner_result"], bundle["owner_request"],
        bundle["normalized_request"], bundle["original_binding_ref"], bundle["delivery_return_context"],
        resolve_record=resolve or reader(value), canonical_request_digest=GATE.owner_result_digest,
        canon_root=ROOT, registry=GATE.registry())


def mutated(name, change):
    """Mutate a positive and re-bind the outcome digest to the (unchanged) result."""
    value = copy.deepcopy(CASES[name])
    change(value)
    bundle = value["bundle"]
    bundle["outcome"]["owner_result_sha256"] = GATE.owner_result_digest(bundle["owner_result"])
    return value


def negative(name):
    return copy.deepcopy(INVALID[name]["value"])


class GitRemoteResponseTests(unittest.TestCase):
    def test_exactly_the_two_public_git_routes_are_the_successor_set(self):
        self.assertEqual(RESPONSE.COMMANDS, frozenset(ROUTES))
        self.assertEqual(RESPONSE.BINDING["schema_id"], "pm.source_control.git_remote.result.v1")
        self.assertEqual({CASES[name]["bundle"]["response"]["command_id"] for name in CASES}, ROUTES)

    def test_every_successor_state_passes_the_actual_central_path(self):
        self.assertEqual(len(CASES), 7)
        for name, value in CASES.items():
            with self.subTest(name=name):
                self.assertEqual(run(value), [])

    def test_declared_negative_rules_are_proven(self):
        for name, row in INVALID.items():
            with self.subTest(name=name):
                self.assertIn(row["semantic_rule"], run(negative(name)))

    def test_caller_return_context_is_echoed_without_substitution(self):
        value = CASES["fetch_caller_return_context"]
        self.assertIsNotNone(value["bundle"]["delivery_return_context"])
        self.assertEqual(direct(value), [])
        self.assertIn("git_remote_response_delivery_original",
                      run(mutated("fetch_caller_return_context", lambda v: v["bundle"][
                          "delivery_return_context"].update(invocation_token="invocation:foreign"))))
        self.assertIn("git_remote_response_delivery_original",
                      run(mutated("fetch_caller_return_context", lambda v: v["records"][
                          "binding:git-remote"]["return_context"].update(focus_id="focus:foreign"))))
        self.assertIn("git_remote_response_retained_owner_result",
                      run(mutated("fetch_caller_return_context", lambda v: v["records"].__setitem__(
                          "owner-result:git-remote",
                          dict(v["bundle"]["owner_result"], outcome="cancelled")))))

    def test_wrong_command_and_instance_are_refused(self):
        self.assertIn("git_remote_response_command",
                      run(mutated("fetch_succeeded", lambda v: v["bundle"]["response"].update(
                          command_id="cmd.git.push"))))
        self.assertIn("git_remote_response_instance",
                      run(mutated("push_succeeded", lambda v: v["bundle"]["response"].update(
                          command_instance_id="foreign:instance"))))

    def test_foreign_identity_and_lineage_are_refused(self):
        self.assertIn("git_remote_response_identity",
                      run(mutated("push_succeeded", lambda v: v["bundle"]["outcome"]["identity"].update(
                          execution_host_id="host:foreign"))))
        self.assertIn("git_remote_response_context_lineage",
                      run(mutated("push_succeeded", lambda v: v["records"]["binding:git-remote"][
                          "identity"].update(named_plan_id="plan:foreign"))))
        self.assertIn("git_remote_response_identity",
                      run(mutated("push_succeeded", lambda v: v["bundle"]["normalized_request"][
                          "owner_identity"].update(project_id="project:foreign"))))

    def test_dispatch_and_digest_substitution_are_refused(self):
        self.assertIn("git_remote_response_original_payload",
                      run(mutated("push_succeeded", lambda v: v["records"]["binding:git-remote"].update(
                          payload_sha256="7" * 64))))
        self.assertIn("git_remote_response_original_target_generation",
                      run(mutated("push_succeeded", lambda v: v["records"]["binding:git-remote"].update(
                          target_generation=70))))
        self.assertIn("git_remote_response_original_dispatch_frame_id",
                      run(mutated("push_succeeded", lambda v: v["records"]["binding:git-remote"].update(
                          dispatch_frame_id="frame:foreign"))))
        self.assertIn("git_remote_response_original_ref",
                      run(mutated("push_succeeded", lambda v: v["records"]["binding:git-remote"].update(
                          request_ref="request:foreign"))))
        self.assertTrue(run(mutated("push_succeeded", lambda v: v["records"]["binding:git-remote"].update(
            arguments={"command_id": "cmd.git.push"}))))

    def test_late_request_mutation_is_rejected(self):
        def resolve(value):
            records = copy.deepcopy(value["records"])

            def resolve_ref(ref):
                if ref == "receipt:git-remote:1":
                    value["bundle"]["owner_request"]["writer_lease_ref"] = "writer-lease:foreign"
                return copy.deepcopy(records[ref])
            return resolve_ref

        value = copy.deepcopy(CASES["push_succeeded"])
        failures = run(value, resolve(value))
        self.assertTrue("git_remote_bundle_mutated_during_resolution" in failures
                        or "git_remote_inputs_mutated" in failures, failures)

    def test_owner_record_mutation_is_fenced_centrally(self):
        """A later callback that mutates an already returned owner record is refused."""
        value = copy.deepcopy(CASES["fetch_succeeded"])
        records = value["records"]
        context_ref = value["bundle"]["owner_request"]["repository_context_ref"]

        def resolve(ref):
            if ref == "owner-result:git-remote":
                records[context_ref]["repo_id"] = "foreign-repo"
            return records[ref]

        self.assertEqual(run(value), [])
        self.assertIn("git_remote_response_owner_record_mutated", run(value, resolve))

    def test_repaired_joins_are_proven_through_the_central_path(self):
        for name, rule in (("unknown_fetch_effect_as_success", "git_remote_unknown_effect"),
                           ("push_preview_force_guard_half_dropped", "git_remote_force_guard"),
                           ("push_success_without_observed_heads", "git_remote_observed_head_set")):
            with self.subTest(name=name):
                self.assertIn(rule, run(negative(name)))
                self.assertIn(rule, direct(negative(name)))

    def test_partial_and_unknown_outcomes_cannot_be_relabelled(self):
        unknown = CASES["push_effect_unknown"]
        self.assertEqual(run(unknown), [])
        self.assertIn("git_remote_response_outcome",
                      run(mutated("push_effect_unknown", lambda v: v["bundle"]["outcome"].update(
                          outcome="failed"))))
        self.assertIn("git_remote_response_outcome",
                      run(mutated("push_effect_unknown", lambda v: v["bundle"]["outcome"].update(
                          outcome="failed"))))
        # A truthful cancelled disclosure whose effect is still unknown and whose
        # owner result carries no owner error is refused by the declared negative.
        self.assertIn("git_remote_response_unknown_effect_without_owner_error",
                      run(negative("missing_owner_error")))
        self.assertIn("git_remote_unknown_effect_without_owner_error",
                      direct(negative("missing_owner_error")))

    def test_error_projection_truthfulness(self):
        self.assertIn("git_remote_response_error_projection_payload",
                      run(mutated("push_effect_unknown", lambda v: v["records"][
                          "projection:git-remote:push"]["owner_error"].update(
                          error_code="stale_revision"))))
        self.assertIn("git_remote_response_error_projection_value",
                      run(mutated("push_effect_unknown", lambda v: v["records"][
                          "projection:git-remote:push"].update(
                          ui_error={"code": "internal_error", "reason": "Substituted disclosure.",
                                    "offending_field": None}))))
        cancelled = CASES["fetch_cancelled_null_ui_error"]
        self.assertEqual(direct(cancelled), [])
        value = copy.deepcopy(cancelled)
        value["records"]["projection:git-remote:fetch"]["ui_error"] = {
            "code": "internal_error", "reason": "Injected non-null cancelled disclosure.",
            "offending_field": None}
        self.assertIn("git_remote_response_error_projection_nullability", direct(value))
        value = copy.deepcopy(cancelled)
        value["records"]["projection:git-remote:fetch"]["ui_error"] = None
        value["bundle"]["response"]["error"] = {"code": "internal_error", "reason": "Non-null cancelled.",
                                                "offending_field": None}
        self.assertIn("git_remote_response_error_projection_value", direct(value))

    def test_replay_preserves_the_original_dispatch_and_result(self):
        value = CASES["push_replayed_original"]
        self.assertEqual(run(value), [])
        self.assertIn("git_remote_response_dispatch",
                      run(copy.deepcopy(value) if False else mutated("push_replayed_original",
                                                                     lambda v: v["bundle"]["response"].update(
                                                                         original_dispatch_id="dispatch:foreign"))))
        value = copy.deepcopy(CASES["push_replayed_original"])
        del value["bundle"]["original_response"]
        self.assertIn("replay_original_response_missing", run(value))

    def test_accepted_work_is_not_terminal(self):
        value = CASES["push_accepted_nonterminal"]
        self.assertEqual(run(value), [])
        self.assertTrue(REMOTE.shape_failures(
            "result", dict(CASES["push_accepted_nonterminal"]["bundle"]["owner_result"],
                           observable_work_id=None), canon_root=ROOT))
        self.assertIn("git_remote_response_accepted_terminal",
                      run(mutated("push_accepted_nonterminal", lambda v: v["bundle"][
                          "response"].update(receipt_ref="receipt:git-remote:1"))))

    def test_bare_records_and_missing_dependencies_are_not_proof(self):
        self.assertEqual(RESPONSE.git_remote_dispatch_semantic_failures(
            "dispatch_binding", CASES["push_succeeded"]["records"]["binding:git-remote"]), [])
        self.assertEqual(RESPONSE.git_remote_dispatch_semantic_failures(
            "result", CASES["push_succeeded"]["bundle"]["owner_result"]), [])
        bundle = CASES["push_succeeded"]["bundle"]
        self.assertEqual(RESPONSE.response_failures(
            bundle["response"], bundle["outcome"], bundle["owner_result"], bundle["owner_request"],
            bundle["normalized_request"], bundle["original_binding_ref"], bundle["delivery_return_context"],
            resolve_record=None, canonical_request_digest=None, canon_root=ROOT, registry=GATE.registry()),
            ["git_remote_response_dependencies_missing"])

    def test_owner_result_binding_travels_through_the_central_path(self):
        for name, value in CASES.items():
            with self.subTest(name=name):
                binding = value["bundle"]["response"]["owner_result_schema_ref"]
                self.assertEqual(binding, RESPONSE.BINDING | {"json_pointer": "#/$defs/result"}
                                 if False else binding)
                self.assertEqual(binding["schema_id"], RESPONSE.BINDING["schema_id"])
                self.assertEqual(binding["path"], RESPONSE.BINDING["path"])
                self.assertEqual(binding["json_pointer"], RESPONSE.BINDING["json_pointer"])


if __name__ == "__main__":
    unittest.main()
