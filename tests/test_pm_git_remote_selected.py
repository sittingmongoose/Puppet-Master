"""Focused original/selection/target/effect/receipt joins for the two public Git
remote adapter commands.

Every assertion runs the actual composition helper over the enrolled companion
records. Fixture readers are synthetic static doubles; passing here authenticates
no dispatcher, issuer, permission, lease, publication target generation, native
effect or physical custody, and no handler availability changes.
"""
import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import pm_git_remote_selected as REMOTE

FIXTURES = json.loads((ROOT / "Plans/git_remote_selected_fixtures.json").read_text())
CASES = {row["name"]: row["value"] for row in FIXTURES["valid"]}
INVALID = {row["name"]: row for row in FIXTURES["invalid"]}
ROUTES = {"cmd.git.fetch", "cmd.git.push"}


def resolve(value):
    records = value["records"]
    return lambda ref: copy.deepcopy(records[ref])


def request_case(name, reader=None):
    value = CASES[name]
    return REMOTE.request_failures(value["request"], resolve_record=reader or resolve(value),
                                   canon_root=ROOT)


def result_case(name, reader=None):
    value = CASES[name]
    return REMOTE.result_failures(value["request"], value["result"],
                                  resolve_record=reader or resolve(value), canon_root=ROOT)


def negative(name):
    row = INVALID[name]
    value = row["value"]
    if row["definition"] == "request_case":
        return REMOTE.request_failures(value["request"], resolve_record=resolve(value), canon_root=ROOT)
    if row["definition"] == "result_case":
        return REMOTE.result_failures(value["request"], value["result"], resolve_record=resolve(value),
                                      canon_root=ROOT)
    return REMOTE.git_remote_semantic_failures(row["definition"], value, canon_root=ROOT)


def mutated(name, change, kind="result"):
    value = copy.deepcopy(CASES[name])
    change(value)
    if kind == "result":
        return REMOTE.result_failures(value["request"], value["result"], resolve_record=resolve(value),
                                      canon_root=ROOT)
    return REMOTE.request_failures(value["request"], resolve_record=resolve(value), canon_root=ROOT)


class GitRemoteSelectedTests(unittest.TestCase):
    def test_the_companion_covers_exactly_the_two_public_git_routes(self):
        self.assertEqual(set(REMOTE.COMMANDS), ROUTES)
        self.assertEqual(REMOTE.ROUTE, {"fetch": "cmd.git.fetch", "push": "cmd.git.push"})
        self.assertEqual({CASES[name]["request"]["command_id"] for name in ("fetch_request_case",
                                                                            "push_request_case")},
                         ROUTES)

    def test_positive_request_cases_pass_the_owner_joins(self):
        for name in ("fetch_request_case", "push_request_case", "push_force_lease_request_case"):
            with self.subTest(name=name):
                self.assertEqual(request_case(name), [])

    def test_positive_result_cases_pass_the_owner_joins(self):
        for name in ("fetch_result_succeeded", "fetch_result_already_current",
                     "fetch_result_effect_unknown", "push_result_succeeded",
                     "push_force_lease_succeeded", "push_result_effect_unknown",
                     "push_result_accepted"):
            with self.subTest(name=name):
                self.assertEqual(result_case(name), [])

    def test_bare_records_are_owner_values_not_fixture_proof(self):
        for definition in ("target_binding", "preview", "observation", "result", "error"):
            with self.subTest(definition=definition):
                self.assertEqual(REMOTE.git_remote_semantic_failures(
                    definition, CASES["push_target_binding_bare"]), [])
        self.assertEqual(REMOTE.git_remote_semantic_failures(
            "request", CASES["fetch_request_case"]["request"]), [])

    def test_declared_negative_rules_are_proven(self):
        structural = REMOTE.shape_failures("error", INVALID["effect_unknown_error_offers_retry"]["value"],
                                           canon_root=ROOT)
        self.assertTrue(structural)
        self.assertTrue(any("retry" in failure for failure in structural))
        for name, row in INVALID.items():
            if "semantic_rule" not in row or row["definition"] == "error":
                continue
            with self.subTest(name=name):
                self.assertIn(row["semantic_rule"], negative(name))

    def test_stale_selection_generation_and_revision_are_refused(self):
        self.assertIn("git_remote_target_generation", negative("stale_selection_generation"))
        self.assertIn("git_remote_context_revision", negative("stale_expected_revision"))
        self.assertIn("git_remote_target_operation", negative("foreign_target_operation"))

    def test_admission_leases_and_toolchain_are_not_inferred(self):
        self.assertIn("git_remote_capability_admission", negative("capability_not_ready"))
        self.assertIn("git_remote_lease_admission", negative("released_writer_lease"))
        self.assertIn("git_remote_credential_admission", negative("expired_credential_lease"))
        self.assertIn("git_remote_toolchain_scope", negative("foreign_toolchain_host"))

    def test_original_source_and_preview_substitution_are_refused(self):
        self.assertIn("git_remote_binding_command_instance_id", negative("binding_instance_substitution"))
        self.assertIn("git_remote_preview_original", negative("preview_original_substitution"))
        self.assertIn("git_remote_preview_refspecs", negative("preview_refspec_substitution"))
        self.assertIn("git_remote_duplicate_target", negative("duplicate_push_target"))


    def test_force_guard_and_lease_are_not_inferred(self):
        self.assertIn("git_remote_force_guard", negative("preview_force_guard_drift"))
        # A retained preview may not silently drop the selected force guard, either by
        # clearing the whole guard or by flipping the boolean while keeping its refs.
        self.assertIn("git_remote_force_guard", negative("preview_force_guard_downgrade"))
        self.assertIn("git_remote_force_guard", negative("preview_force_guard_partial_downgrade"))
        value = copy.deepcopy(CASES["push_force_lease_request_case"])
        value["request"]["selection"]["force_guard"]["lease_ref"] = None
        self.assertTrue(REMOTE.shape_failures("request", value["request"], canon_root=ROOT))
        value = copy.deepcopy(CASES["push_force_lease_request_case"])
        value["records"]["preview:remote-target:origin"]["force_guard"] = {
            "force_requested": True, "expected_head_ref": "remote-head:origin:main",
            "lease_ref": "force-lease:foreign", "dangerous_action_policy_ref": "dangerous-action:force-push"}
        self.assertIn("git_remote_force_guard", REMOTE.request_failures(
            value["request"], resolve_record=resolve(value), canon_root=ROOT))
        value = copy.deepcopy(CASES["push_result_succeeded"])
        value["records"]["reconciliation:git:push"]["force_guard"] = {
            "force_requested": True, "expected_head_ref": "remote-head:origin:main",
            "lease_ref": "force-lease:foreign", "dangerous_action_policy_ref": "dangerous-action:force-push"}
        self.assertIn("git_remote_force_guard", REMOTE.request_failures(
            value["request"], resolve_record=resolve(value), canon_root=ROOT))

    def test_selected_force_guard_stays_on_its_explicit_target(self):
        # The source request is force-on-origin/no-force-on-mirror. Moving only
        # the preview guard objects must not turn mirror into the force target.
        value = copy.deepcopy(CASES["push_force_lease_request_case"])
        request = value["request"]
        self.assertEqual(request["selection"]["selected_force_target_id"], "remote-target:origin")
        origin_ref, mirror_ref = value["records"][request["target_binding_ref"]]["preview_refs"]
        value["records"][origin_ref]["force_guard"], value["records"][mirror_ref]["force_guard"] = (
            value["records"][mirror_ref]["force_guard"], value["records"][origin_ref]["force_guard"]
        )
        self.assertFalse(REMOTE.shape_failures("git_preview", value["records"][origin_ref],
                                               canon_root=ROOT, owner=REMOTE.FORGE_REL))
        self.assertFalse(REMOTE.shape_failures("git_preview", value["records"][mirror_ref],
                                               canon_root=ROOT, owner=REMOTE.FORGE_REL))
        self.assertIn("git_remote_force_guard", REMOTE.request_failures(
            request, resolve_record=resolve(value), canon_root=ROOT))

        # The same mixed selection remains valid with the original per-target
        # guards; no aggregate-force rule is applied to the no-force mirror.
        self.assertEqual(request_case("push_force_lease_request_case"), [])

        value = copy.deepcopy(CASES["push_force_lease_request_case"])
        value["request"]["selection"]["selected_force_target_id"] = "remote-target:foreign"
        value["records"][value["request"]["target_binding_ref"]]["selection"]["selected_force_target_id"] = "remote-target:foreign"
        self.assertIn("git_remote_force_target", REMOTE.request_failures(
            value["request"], resolve_record=resolve(value), canon_root=ROOT))

        value = copy.deepcopy(CASES["push_force_lease_request_case"])
        value["request"]["selection"].pop("selected_force_target_id")
        self.assertTrue(REMOTE.shape_failures("request", value["request"], canon_root=ROOT))

    def test_partial_and_unknown_effects_cannot_be_relabelled(self):
        for name in ("missing_target_observation", "false_complete_success", "unknown_effect_relabelled",
                     "blind_retry_unknown_effect", "receipt_work_substitution", "claimed_receipt_event",
                     "foreign_reconciliation_state"):
            with self.subTest(name=name):
                self.assertTrue(negative(name))
        self.assertIn("git_remote_false_complete", negative("false_complete_success"))
        self.assertIn("git_remote_unknown_effect", negative("unknown_effect_relabelled"))
        self.assertIn("git_remote_blind_retry", negative("blind_retry_unknown_effect"))
        self.assertIn("git_remote_event_claim", negative("claimed_receipt_event"))
        self.assertIn("git_remote_reconciliation_success", negative("foreign_reconciliation_state"))

    def test_fetch_observations_stay_truthful(self):
        self.assertIn("git_remote_oid_object_format", negative("fetch_oid_object_format"))
        self.assertIn("git_remote_fetch_noop_claim", negative("fetch_already_local_claimed_receipt"))
        self.assertIn("git_remote_fetch_ref_updates", negative("fetch_missing_ref_update"))
        # Unknown or partial fetch truth cannot be reported as a reconciled success.
        self.assertIn("git_remote_unknown_effect", negative("fetch_observation_unknown_as_success"))
        self.assertIn("git_remote_unknown_effect", negative("fetch_ref_unknown_as_success"))
        self.assertIn("git_remote_unknown_effect", negative("fetch_partial_completion_as_success"))
        # The operation receipt cannot claim success while the retained observation is unknown.
        value = copy.deepcopy(CASES["fetch_result_effect_unknown"])
        value["records"]["receipt:git-remote:1"]["outcome"] = "succeeded"
        self.assertIn("git_remote_receipt_outcome", REMOTE.result_failures(
            value["request"], value["result"], resolve_record=resolve(value), canon_root=ROOT))

    def test_push_success_needs_the_complete_observed_head_set(self):
        self.assertIn("git_remote_observed_head_set", negative("push_success_without_observed_heads"))
        self.assertIn("git_remote_observed_head_set", negative("push_success_missing_destination_head"))
        value = copy.deepcopy(CASES["push_result_succeeded"])
        value["records"]["observation:remote-target:origin"]["observed_heads"].append(
            copy.deepcopy(value["records"]["observation:remote-target:origin"]["observed_heads"][0]))
        self.assertIn("git_remote_observed_head_set", REMOTE.result_failures(
            value["request"], value["result"], resolve_record=resolve(value), canon_root=ROOT))
        value = copy.deepcopy(CASES["push_result_succeeded"])
        value["records"]["observation:remote-target:origin"]["observed_heads"][0]["head"] = {
            "state": "known", "object_id": "9" * 40}
        self.assertIn("git_remote_observed_head", REMOTE.result_failures(
            value["request"], value["result"], resolve_record=resolve(value), canon_root=ROOT))
        self.assertEqual(result_case("push_result_succeeded"), [])
        self.assertEqual(result_case("push_force_lease_succeeded"), [])

    def test_late_owner_record_mutation_is_refused(self):
        """The fence compares the live returned record with its saved copy."""
        def reader(value, mutation):
            records = value["records"]

            def resolve_ref(ref):
                mutation(records, ref)
                return records[ref]
            return resolve_ref

        value = copy.deepcopy(CASES["fetch_request_case"])
        self.assertEqual(request_case("fetch_request_case"), [])
        preview_ref = value["records"][value["request"]["target_binding_ref"]]["preview_refs"][0]

        def mutate_context(records, ref):
            if ref == preview_ref:
                records[value["request"]["repository_context_ref"]]["repo_id"] = "foreign-repo"

        self.assertIn("git_remote_inputs_mutated", REMOTE.request_failures(
            value["request"], resolve_record=reader(value, mutate_context), canon_root=ROOT))
        value = copy.deepcopy(CASES["push_result_succeeded"])
        records = value["records"]
        observation_ref = value["result"]["observation_refs"][0]
        preview_ref = records[observation_ref]["preview_ref"]
        reads = {"count": 0}

        def resolve_ref(ref):
            if ref == preview_ref:
                # First read: request join. Second read: the observation join, i.e.
                # after the observation itself was already returned.
                reads["count"] += 1
                if reads["count"] == 2:
                    records[observation_ref]["observed_heads"] = []
            return records[ref]

        self.assertIn("git_remote_inputs_mutated", REMOTE.result_failures(
            value["request"], value["result"], resolve_record=resolve_ref, canon_root=ROOT))

    def test_wrong_original_and_foreign_result_are_refused(self):
        value = copy.deepcopy(CASES["push_result_succeeded"])
        value["result"]["original_request_ref"] = "request:git-remote:fetch"
        self.assertIn("git_remote_preview_original", REMOTE.result_failures(
            value["request"], value["result"], resolve_record=resolve(value), canon_root=ROOT))
        value = copy.deepcopy(CASES["push_result_succeeded"])
        value["records"]["request:git-remote:push"]["idempotency_key"] = "idempotency:substituted"
        self.assertIn("git_remote_result_original_request", REMOTE.result_failures(
            value["request"], value["result"], resolve_record=resolve(value), canon_root=ROOT))
        value = copy.deepcopy(CASES["push_result_succeeded"])
        value["result"]["preview_refs"] = ["preview:foreign"]
        self.assertIn("git_remote_result_preview_refs", REMOTE.result_failures(
            value["request"], value["result"], resolve_record=resolve(value), canon_root=ROOT))
        value = copy.deepcopy(CASES["push_result_succeeded"])
        value["result"]["error_ref"] = "error:git-remote:push"
        self.assertTrue(REMOTE.shape_failures("result", value["result"], canon_root=ROOT))
        value = copy.deepcopy(CASES["push_result_succeeded"])
        value["result"]["error_projection_ref"] = "projection:git-remote:push"
        self.assertTrue(REMOTE.shape_failures("result", value["result"], canon_root=ROOT))

    def test_late_original_mutation_is_rejected(self):
        def reader(value):
            records = copy.deepcopy(value["records"])

            def resolve_ref(ref):
                if ref == "receipt:git-remote:1":
                    value["request"]["expected_revision"]["commit_oid"] = "9" * 40
                return copy.deepcopy(records[ref])
            return resolve_ref

        value = copy.deepcopy(CASES["push_result_succeeded"])
        self.assertIn("git_remote_inputs_mutated", REMOTE.result_failures(
            value["request"], value["result"], resolve_record=reader(value), canon_root=ROOT))

    def test_replay_and_duplicate_publication_are_not_inferred(self):
        value = copy.deepcopy(CASES["push_result_succeeded"])
        value["result"]["observation_refs"] = ["observation:remote-target:origin",
                                               "observation:remote-target:origin"]
        self.assertTrue(REMOTE.shape_failures("result", value["result"], canon_root=ROOT))
        value = copy.deepcopy(CASES["push_result_succeeded"])
        value["records"]["remote-target:origin"]["push_targets"].append(
            copy.deepcopy(value["records"]["remote-target:origin"]["push_targets"][0]))
        self.assertIn("git_remote_duplicate_target", REMOTE.request_failures(
            value["request"], resolve_record=resolve(value), canon_root=ROOT))

    def test_observation_must_match_its_preview_target(self):
        self.assertIn("git_remote_observation_mapping", mutated(
            "push_result_succeeded",
            lambda v: v["records"]["preview:remote-target:origin"]["mappings"].__setitem__(
                0, {**v["records"]["preview:remote-target:origin"]["mappings"][0],
                    "destination_ref": "refs/heads/foreign"})))
        self.assertIn("git_remote_preview_refspecs", mutated(
            "push_result_succeeded",
            lambda v: v["records"]["preview:remote-target:origin"].__setitem__(
                "push_url", "https://forge.example.com/foreign.git")))


if __name__ == "__main__":
    unittest.main()
