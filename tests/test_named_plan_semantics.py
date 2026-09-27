"""Focused regression proof for the single NamedPlan owner-join resolver.

PERF-001: immutable child-to-NamedPlan joins close through ONE owner resolver
contract (request/proposed-view/actual-record/aggregate/verdict/case) plus
substantive semantic comparison, not through duplicated child state machines.
The caller supplies only the request and an untrusted proposed view; the actual
owner record and aggregate are trusted adapter reads at one consistent
snapshot. These tests validate every authored fixture with jsonschema and
recompute every join verdict from the four inputs. Static conformance only:
cases that copy a record prove the comparison logic, never native authenticity.
No runtime, handler, storage, or event behavior is executed or implied.
"""

from __future__ import annotations

import copy
import importlib.util
import json
import unittest
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = json.loads((ROOT / "Plans/named_plan_system_contracts.schema.json").read_text())
FIXTURES = json.loads((ROOT / "Plans/named_plan_system_contract_fixtures.json").read_text())

SPEC = importlib.util.spec_from_file_location(
    "pm_named_plan_semantics", ROOT / "scripts/pm_named_plan_semantics.py"
)
SEMANTICS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SEMANTICS)

# Independent predictions from the documented rejection precedence: each join
# case below mutates exactly one input from an accepted shape, so the expected
# (decision, code, edge) follows from that single mutation alone.
PREDICTED_JOIN_VERDICTS = {
    "owner_join_accepts_current_prd": ("accepted", None, "current"),
    "owner_join_accepts_historical_prd": ("accepted", None, "historical"),
    "owner_join_rejects_wrong_plan_same_project": ("rejected", "wrong_plan_same_project", None),
    "owner_join_rejects_stale_child_revision": ("rejected", "stale_child_revision", None),
    "owner_join_rejects_stale_child_hash": ("rejected", "stale_child_hash", None),
    "owner_join_rejects_stale_aggregate_revision": ("rejected", "stale_aggregate_revision", None),
    "owner_join_rejects_stale_aggregate_hash": ("rejected", "stale_aggregate_hash", None),
    "owner_join_rejects_orphan_no_aggregate_edge": ("rejected", "orphan_no_aggregate_edge", None),
    "owner_join_rejects_kind_mismatch": ("rejected", "kind_mismatch", None),
    "owner_join_rejects_wrong_project": ("rejected", "wrong_project", None),
    "owner_join_rejects_edge_claim_mismatch": ("rejected", "edge_claim_mismatch", None),
    "owner_join_rejects_historical_mutation": ("rejected", "historical_edge_mutation_forbidden", None),
    "owner_join_rejects_forged_owner_view": ("rejected", "proposed_owner_view_mismatch", None),
    "owner_join_rejects_snapshot_mismatch": ("rejected", "snapshot_mismatch", None),
    "owner_join_accepts_current_plan_compile_run": ("accepted", None, "current"),
}

FORBIDDEN_JOIN_FIELDS = {
    "matches",
    "matched",
    "verified",
    "is_match",
    "summary",
    "match_summary",
    "lifecycle",
    "status",
    "lifecycle_state",
    "phase",
}


def definition_validator(definition: str) -> Draft202012Validator:
    wrapper = {"$defs": SCHEMA["$defs"], "$ref": f"#/$defs/{definition}"}
    return Draft202012Validator(wrapper)


def structure_errors(definition: str, value: Any) -> list[str]:
    return [error.message for error in definition_validator(definition).iter_errors(value)]


def semantic_failures(definition: str, value: Any) -> list[str]:
    return SEMANTICS.named_plan_owner_join_failures(definition, value)


def dotted_patch(document: Any, patch: dict[str, Any]) -> Any:
    result = copy.deepcopy(document)
    for dotted, replacement in patch.items():
        parts = dotted.split(".")
        current = result
        for part in parts[:-1]:
            current = current[part]
        current[parts[-1]] = copy.deepcopy(replacement)
    return result


def materialize(case: dict[str, Any], positives: dict[str, Any]) -> Any:
    if "value" in case:
        return copy.deepcopy(case["value"])
    base = copy.deepcopy(positives[case["base_valid"]])
    return dotted_patch(base, case.get("patch", {}))


def positives_by_name() -> dict[str, Any]:
    return {case["name"]: case["value"] for case in FIXTURES["valid"]}


def valid_case(name: str) -> dict[str, Any]:
    return copy.deepcopy(positives_by_name()[name])


def resolve(case: dict[str, Any]) -> dict[str, Any]:
    return SEMANTICS.resolve_named_plan_owner_join(
        case["join_request"], case["owner_view"], case["actual_owner_record"], case["aggregate"]
    )


class NamedPlanJoinContractTests(unittest.TestCase):
    def test_all_valid_fixtures_are_structurally_valid_and_semantically_clean(self):
        Draft202012Validator.check_schema(SCHEMA)
        for case in FIXTURES["valid"]:
            with self.subTest(case=case["name"]):
                self.assertEqual([], structure_errors(case["definition"], case["value"]))
                self.assertEqual([], semantic_failures(case["definition"], case["value"]))

    def test_structural_negatives_are_rejected_by_schema(self):
        positives = positives_by_name()
        structural = [case for case in FIXTURES["invalid"] if "semantic_rule" not in case]
        self.assertGreaterEqual(len(structural), 8)
        for case in structural:
            with self.subTest(case=case["name"]):
                value = materialize(case, positives)
                self.assertTrue(
                    structure_errors(case["definition"], value),
                    f"negative fixture accepted: {case['name']}",
                )

    def test_semantic_negatives_are_structurally_valid_but_semantically_proven(self):
        positives = positives_by_name()
        semantic = [case for case in FIXTURES["invalid"] if "semantic_rule" in case]
        self.assertGreaterEqual(len(semantic), 4)
        for case in semantic:
            with self.subTest(case=case["name"]):
                value = materialize(case, positives)
                self.assertEqual([], structure_errors(case["definition"], value))
                self.assertIn(case["semantic_rule"], semantic_failures(case["definition"], value))

    def test_each_join_case_matches_its_single_mutation_prediction(self):
        for name, (decision, code, edge) in PREDICTED_JOIN_VERDICTS.items():
            with self.subTest(case=name):
                verdict = resolve(valid_case(name))
                self.assertEqual(decision, verdict["decision"])
                self.assertEqual(code, verdict["rejection_code"])
                self.assertEqual(edge, verdict["edge_found"])
                self.assertEqual([], structure_errors("named_plan_owner_join_verdict", verdict))

    def test_resolver_rejects_focus_only_and_malformed_inputs_directly(self):
        base = valid_case("owner_join_accepts_current_prd")
        request, proposed, actual, aggregate = (
            base["join_request"],
            base["owner_view"],
            base["actual_owner_record"],
            base["aggregate"],
        )

        for missing in ("project_id", "named_plan_id"):
            mutated = {key: value for key, value in request.items() if key != missing}
            verdict = SEMANTICS.resolve_named_plan_owner_join(mutated, proposed, actual, aggregate)
            self.assertEqual("focus_only_no_explicit_identity", verdict["rejection_code"])

        mutated = dict(request, named_plan_id="")
        verdict = SEMANTICS.resolve_named_plan_owner_join(mutated, proposed, actual, aggregate)
        self.assertEqual("focus_only_no_explicit_identity", verdict["rejection_code"])

        for missing in (
            "child_ref",
            "child_kind",
            "child_revision",
            "child_currentness_sha256",
            "expected_aggregate_revision",
            "expected_aggregate_currentness_sha256",
            "intent",
        ):
            mutated = {key: value for key, value in request.items() if key != missing}
            verdict = SEMANTICS.resolve_named_plan_owner_join(mutated, proposed, actual, aggregate)
            self.assertEqual("incomplete_join_request", verdict["rejection_code"])

        mutated = dict(request, intent="approve")
        verdict = SEMANTICS.resolve_named_plan_owner_join(mutated, proposed, actual, aggregate)
        self.assertEqual("incomplete_join_request", verdict["rejection_code"])

        self.assertEqual(
            "incomplete_join_request",
            SEMANTICS.resolve_named_plan_owner_join(None, proposed, actual, aggregate)["rejection_code"],
        )
        self.assertEqual(
            "proposed_owner_view_mismatch",
            SEMANTICS.resolve_named_plan_owner_join(request, None, actual, aggregate)["rejection_code"],
        )
        self.assertEqual(
            "owner_record_mismatch",
            SEMANTICS.resolve_named_plan_owner_join(request, proposed, None, aggregate)["rejection_code"],
        )

    def test_first_rejection_wins_in_documented_precedence_order(self):
        base = valid_case("owner_join_accepts_current_prd")
        # Forgery outranks Plan isolation: a forged proposal is caught before
        # the request-vs-actual Plan comparison runs.
        forged = valid_case("owner_join_rejects_forged_owner_view")
        verdict = resolve(forged)
        self.assertEqual("proposed_owner_view_mismatch", verdict["rejection_code"])
        # Wrong Plan plus stale revision: Plan isolation outranks staleness.
        actual = dict(base["actual_owner_record"], named_plan_id="named_plan:02", child_revision=99)
        proposed = dict(actual)
        verdict = SEMANTICS.resolve_named_plan_owner_join(
            base["join_request"], proposed, actual, base["aggregate"]
        )
        self.assertEqual("wrong_plan_same_project", verdict["rejection_code"])
        # Wrong project outranks wrong Plan.
        actual = dict(actual, project_id="project:02")
        proposed = dict(actual)
        verdict = SEMANTICS.resolve_named_plan_owner_join(
            base["join_request"], proposed, actual, base["aggregate"]
        )
        self.assertEqual("wrong_project", verdict["rejection_code"])
        # Stale child revision outranks stale aggregate generation.
        stale = valid_case("owner_join_rejects_stale_child_revision")
        stale["join_request"]["expected_aggregate_revision"] = 1
        verdict = resolve(stale)
        self.assertEqual("stale_child_revision", verdict["rejection_code"])

    def test_authoritative_actual_decides_never_the_proposal(self):
        # Proposal and request fixed; only the trusted actuals change. When the
        # actuals agree the child belongs to the requested Plan, the join
        # accepts; with the original actuals it rejects. Ownership is never
        # manufactured from the requested Plan.
        forged = valid_case("owner_join_rejects_forged_owner_view")
        redeemed = copy.deepcopy(forged)
        redeemed["actual_owner_record"]["named_plan_id"] = "named_plan:02"
        redeemed["actual_owner_record"]["snapshot_ref"] = "snapshot:01"
        redeemed["aggregate"]["snapshot_ref"] = "snapshot:01"
        verdict = resolve(redeemed)
        self.assertEqual("accepted", verdict["decision"])
        self.assertEqual("current", verdict["edge_found"])
        self.assertEqual("rejected", resolve(forged)["decision"])
        # The verdict itself carries no project/Plan identity to launder.
        self.assertNotIn("project_id", verdict)
        self.assertNotIn("named_plan_id", verdict)

    def test_actual_record_keys_exact_ref_and_verifies_kind(self):
        base = valid_case("owner_join_accepts_current_prd")
        actual = dict(base["actual_owner_record"], child_ref="prd:other")
        verdict = SEMANTICS.resolve_named_plan_owner_join(
            base["join_request"], base["owner_view"], actual, base["aggregate"]
        )
        self.assertEqual("owner_record_mismatch", verdict["rejection_code"])
        actual = dict(base["actual_owner_record"], child_kind="goal_run")
        verdict = SEMANTICS.resolve_named_plan_owner_join(
            base["join_request"], base["owner_view"], actual, base["aggregate"]
        )
        self.assertEqual("kind_mismatch", verdict["rejection_code"])

    def test_aggregate_side_mismatch_rejects_like_owner_side_mismatch(self):
        base = valid_case("owner_join_accepts_current_prd")
        aggregate = dict(base["aggregate"], named_plan_id="named_plan:02")
        verdict = SEMANTICS.resolve_named_plan_owner_join(
            base["join_request"], base["owner_view"], base["actual_owner_record"], aggregate
        )
        self.assertEqual("wrong_plan_same_project", verdict["rejection_code"])
        aggregate = dict(base["aggregate"], project_id="project:02")
        verdict = SEMANTICS.resolve_named_plan_owner_join(
            base["join_request"], base["owner_view"], base["actual_owner_record"], aggregate
        )
        self.assertEqual("wrong_project", verdict["rejection_code"])

    def test_historical_edge_allows_read_but_never_mutation(self):
        historical = valid_case("owner_join_accepts_historical_prd")
        self.assertEqual("accepted", resolve(historical)["decision"])
        mutated = copy.deepcopy(historical)
        mutated["join_request"]["intent"] = "mutate"
        verdict = resolve(mutated)
        self.assertEqual("historical_edge_mutation_forbidden", verdict["rejection_code"])
        current = valid_case("owner_join_accepts_current_prd")
        current["join_request"]["intent"] = "read"
        self.assertEqual("accepted", resolve(current)["decision"])

    def test_opaque_aggregate_ref_never_proves_join_without_actual_agreement(self):
        base = valid_case("owner_join_accepts_current_prd")
        # The ref sits on the aggregate current edge, but the actual owner
        # record disagrees on revision: the opaque ref alone must not accept.
        actual = dict(
            base["actual_owner_record"],
            child_revision=base["actual_owner_record"]["child_revision"] + 1,
        )
        verdict = SEMANTICS.resolve_named_plan_owner_join(
            base["join_request"], dict(actual), actual, base["aggregate"]
        )
        self.assertEqual("stale_child_revision", verdict["rejection_code"])

    def test_goal_run_list_edge_and_historical_only_link_kind(self):
        base = valid_case("owner_join_accepts_current_prd")
        aggregate = dict(base["aggregate"], current_goal_run_refs=["goal_run:11"])
        request = dict(
            base["join_request"],
            child_ref="goal_run:11",
            child_kind="goal_run",
            child_revision=1,
            child_currentness_sha256="e" * 64,
            claimed_edge=None,
        )
        owner = dict(
            base["actual_owner_record"],
            child_ref="goal_run:11",
            child_kind="goal_run",
            child_revision=1,
            child_currentness_sha256="e" * 64,
        )
        verdict = SEMANTICS.resolve_named_plan_owner_join(request, dict(owner), owner, aggregate)
        self.assertEqual(
            ("accepted", None, "current"),
            (verdict["decision"], verdict["rejection_code"], verdict["edge_found"]),
        )

        historical = dict(base["aggregate"], historical_child_refs=["assist:77"])
        request = dict(request, child_ref="assist:77", child_kind="assistant_plan_link", intent="read")
        owner = dict(owner, child_ref="assist:77", child_kind="assistant_plan_link")
        verdict = SEMANTICS.resolve_named_plan_owner_join(request, dict(owner), owner, historical)
        self.assertEqual("historical", verdict["edge_found"])

    def test_join_shapes_carry_no_self_attested_or_lifecycle_fields(self):
        for definition in (
            "named_plan_owner_join_request",
            "named_plan_child_owner_view",
            "named_plan_owner_join_verdict",
        ):
            properties = set(SCHEMA["$defs"][definition]["properties"])
            with self.subTest(definition=definition):
                self.assertEqual(set(), properties & FORBIDDEN_JOIN_FIELDS)
                self.assertFalse(SCHEMA["$defs"][definition].get("additionalProperties", True))
        verdict_properties = set(SCHEMA["$defs"]["named_plan_owner_join_verdict"]["properties"])
        self.assertEqual(set(), verdict_properties & {"project_id", "named_plan_id"})

    def test_non_case_definitions_have_no_semantic_failures(self):
        for case in FIXTURES["valid"]:
            if case["definition"] == "named_plan_owner_join_case":
                continue
            with self.subTest(case=case["name"]):
                self.assertEqual([], semantic_failures(case["definition"], case["value"]))
        self.assertEqual([], semantic_failures("named_plan_record", {"not": "a record"}))


if __name__ == "__main__":
    unittest.main()
