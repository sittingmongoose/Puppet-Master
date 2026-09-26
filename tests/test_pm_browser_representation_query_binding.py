"""Static Section 15 command-to-typed-representation-query binding regressions.

Covers exactly the three representation commands' binding repair in the
candidate schema/fixtures plus the cross-record joins the single-record schema
cannot express. Causal core (V3): every join is supplied by the record decoded
from the held original query record bytes — a co-mutated separate query object
and command scope cannot bypass held bytes/digest, and missing or unparseable
originals fail closed. Purely static: no runtime, native dispatch, capture, or
execution is exercised or proved.
"""

import copy
import hashlib
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
import sys

sys.path.insert(0, str(ROOT / "scripts"))

from jsonschema import Draft202012Validator, FormatChecker

import pm_browser_representation_query_binding as binding

SCHEMA = binding._schema()
FIXTURES = json.loads((ROOT / "Plans/section15_browser_program_contract_fixtures.json").read_text())
INPUT_FIXTURES = json.loads((ROOT / "tests/fixtures/browser_representation_query_prior.json").read_text())
VALUES = {case["name"]: case["value"] for case in FIXTURES["valid"]}
INPUT_VALUES = {case["name"]: case["value"] for case in INPUT_FIXTURES["valid"]}

REPRESENTATION_COMMANDS = (
    "browser_command_request_08_representation_capture",
    "browser_command_request_09_representation_delta",
    "browser_command_request_10_representation_query",
)
PAIRED_QUERY = {
    "browser_command_request_08_representation_capture": "representation_query_capture_for_command_08",
    "browser_command_request_09_representation_delta": "representation_query_delta_for_command_09",
    "browser_command_request_10_representation_query": "representation_query_scoped_for_command_10",
}
CONTINUED_COMMAND = "browser_command_request_10_representation_query_continued"
CONTINUED_QUERY = "representation_query_scoped_continued_for_command_10"
CONTINUED_RESULT = "representation_query_result_continued_for_command_10"


def validator(definition):
    body = SCHEMA["$defs"].get(definition, SCHEMA)
    return Draft202012Validator({**body, "$defs": SCHEMA["$defs"]}, format_checker=FormatChecker())


def resolve_parent(value, parts):
    node = value
    for part in parts[:-1]:
        node = node[int(part)] if isinstance(node, list) else node[part]
    return node, parts[-1]


def materialize_invalid(case):
    value = copy.deepcopy(VALUES[case["base_valid"]] if "base_valid" in case else case["value"])
    for dotted in case.get("remove", []):
        parent, key = resolve_parent(value, dotted.split("."))
        if isinstance(parent, list):
            parent.pop(int(key))
        else:
            parent.pop(key)
    for dotted, replacement in case.get("patch", {}).items():
        parent, key = resolve_parent(value, dotted.split("."))
        if isinstance(parent, list):
            parent[int(key)] = replacement
        else:
            parent[key] = replacement
    return value


class FixtureIntegrityTests(unittest.TestCase):
    def test_candidate_schema_is_valid_draft_2020_12(self):
        Draft202012Validator.check_schema(SCHEMA)

    def test_every_valid_fixture_validates_against_its_record_kind(self):
        for name, value in VALUES.items():
            with self.subTest(case=name):
                self.assertEqual([], [e.message for e in validator(value["record_kind"]).iter_errors(value)])

    def test_every_structural_negative_preserves_its_intended_failure(self):
        for case in FIXTURES["invalid"]:
            if "semantic_rule" in case:
                continue  # checked by the central gate's semantic pass, not here
            with self.subTest(case=case["name"]):
                value = materialize_invalid(case)
                definition = case.get("definition", value.get("record_kind", "<root>"))
                self.assertTrue(list(validator(definition).iter_errors(value)))

    def test_all_prior_valid_entries_are_untouched_or_strict_supersets(self):
        for name, original in INPUT_VALUES.items():
            candidate = VALUES[name]
            if name in REPRESENTATION_COMMANDS:
                scope = candidate["scope"]
                for key, val in original["scope"].items():
                    self.assertEqual(val, scope[key], name)
                self.assertEqual(
                    {k: v for k, v in original.items() if k != "scope"},
                    {k: v for k, v in candidate.items() if k != "scope"}, name)
            else:
                self.assertEqual(original, candidate, name)

    def test_all_prior_negative_entries_are_untouched(self):
        prior = {case["name"]: case for case in INPUT_FIXTURES["invalid"]}
        current = {case["name"]: case for case in FIXTURES["invalid"]}
        for name, case in prior.items():
            self.assertEqual(case, current[name], name)

    def test_the_twelve_other_command_shapes_need_none_of_the_new_fields(self):
        for name in INPUT_VALUES:
            if not name.startswith("browser_command_request_") or name in REPRESENTATION_COMMANDS:
                continue
            value = VALUES[name]
            with self.subTest(case=name):
                self.assertNotIn("scope_roots", value["scope"])
                self.assertNotIn("selected_representation_query", value["scope"])
                self.assertNotIn("continuation", value["scope"])
                self.assertEqual([], list(validator("browser_command_request").iter_errors(value)))

    def test_binding_commands_keep_null_run_attempt_tolerance(self):
        for name, value in VALUES.items():
            if not name.startswith("browser_command_request_"):
                continue
            if value["scope"]["command_id"].startswith("cmd.browser.program."):
                continue
            with self.subTest(case=name):
                manual = copy.deepcopy(value)
                manual["scope"]["lineage"].update(run_id=None, attempt_id=None)
                self.assertEqual([], list(validator("browser_command_request").iter_errors(manual)))

    def test_fifteen_command_identities_are_unchanged(self):
        expected = sorted(case["value"]["scope"]["command_id"]
                          for case in INPUT_FIXTURES["valid"]
                          if case["name"].startswith("browser_command_request_"))
        self.assertEqual(15, len(expected))
        self.assertEqual(set(expected), set(SCHEMA["$defs"]["browser_command_id"]["enum"]))


class SelectedQueryBindingTests(unittest.TestCase):
    def original_bytes(self, query_name):
        return binding.canonical_record_bytes(VALUES[query_name])

    def test_each_representation_command_binds_its_authentic_query_original(self):
        for command_name, query_name in PAIRED_QUERY.items():
            with self.subTest(command=command_name):
                self.assertEqual([], binding.binding_failures(
                    VALUES[command_name]["scope"], self.original_bytes(query_name)))
                pinned = VALUES[command_name]["scope"]["selected_representation_query"]["query_record_sha256"]
                self.assertEqual(pinned, binding.record_sha256(VALUES[query_name]))

    def test_genuine_scoped_continued_query_binds_and_result_joins(self):
        scope = VALUES[CONTINUED_COMMAND]["scope"]
        query_bytes = self.original_bytes(CONTINUED_QUERY)
        self.assertEqual([], binding.binding_failures(scope, query_bytes))
        self.assertEqual([], binding.result_binding_failures(
            scope, VALUES[CONTINUED_RESULT], query_record_bytes=query_bytes))

    def test_missing_selected_query_and_scope_roots_are_rejected(self):
        for dotted in ("scope.selected_representation_query", "scope.scope_roots"):
            with self.subTest(removed=dotted):
                value = copy.deepcopy(VALUES[CONTINUED_COMMAND])
                parent = value["scope"]
                parent.pop(dotted.rsplit(".", 1)[1])
                self.assertTrue(list(validator("browser_command_request").iter_errors(value)))

    def test_opaque_ref_without_binding_is_structurally_insufficient(self):
        value = copy.deepcopy(VALUES[CONTINUED_COMMAND])
        value["scope"]["selected_representation_query"] = {"query_record_ref": "artifact:query:external"}
        self.assertTrue(list(validator("browser_command_request").iter_errors(value)))

    def test_site_reader_record_kind_cannot_satisfy_the_browser_binding(self):
        value = copy.deepcopy(VALUES[CONTINUED_COMMAND])
        value["scope"]["selected_representation_query"]["query_schema_id"] = \
            "pm.site_reader.representation_query.v1"
        self.assertTrue(list(validator("browser_command_request").iter_errors(value)))

    def mutated_bytes(self, command_name, query_name, mutation):
        """Return (scope, bytes) whose digest is re-pinned, so the sole
        relation under test is the mutated typed field, not bytes."""
        query = copy.deepcopy(VALUES[query_name])
        mutation(query)
        record_bytes = binding.canonical_record_bytes(query)
        scope = copy.deepcopy(VALUES[command_name]["scope"])
        scope["selected_representation_query"] = {
            "query_schema_id": "pm.browser_program.representation_query.v1",
            "query_id": query["query_id"],
            "query_record_sha256": hashlib.sha256(record_bytes).hexdigest(),
        }
        return scope, record_bytes

    def mutate(self, record, dotted, value):
        parts = dotted.split(".")
        parent = record
        for part in parts[:-1]:
            parent = parent[part]
        parent[parts[-1]] = value

    def test_mutated_candidate_is_rejected_while_the_pinned_original_is_fixed(self):
        original = VALUES["representation_query_scoped_for_command_10"]
        pinned_scope = VALUES["browser_command_request_10_representation_query"]["scope"]
        mutated = copy.deepcopy(original)
        self.mutate(mutated, "subject.page_generation", 13)
        failures = binding.binding_failures(pinned_scope,
            binding.canonical_record_bytes(mutated))
        self.assertIn("representation_selected_query_digest_mismatch", failures)
        self.assertIn("representation_selected_query_subject_mismatch", failures)
        self.assertEqual([], binding.binding_failures(pinned_scope,
            binding.canonical_record_bytes(original)))

    def test_command_query_page_generation_mismatch_is_rejected(self):
        scope, record_bytes = self.mutated_bytes(
            "browser_command_request_10_representation_query",
            "representation_query_scoped_for_command_10",
            lambda q: self.mutate(q, "subject.page_generation", 13))
        self.assertEqual(["representation_selected_query_subject_mismatch"],
                         binding.binding_failures(scope, record_bytes))

    def test_command_query_mode_and_base_mismatch_are_rejected(self):
        delta_scope = VALUES["browser_command_request_09_representation_delta"]["scope"]
        delta_query = "representation_query_delta_for_command_09"
        mode_bytes = binding.canonical_record_bytes(
            dict(VALUES[delta_query], representation_mode="full"))
        repinned = copy.deepcopy(delta_scope)
        repinned["selected_representation_query"] = {
            "query_schema_id": "pm.browser_program.representation_query.v1",
            "query_id": VALUES[delta_query]["query_id"],
            "query_record_sha256": hashlib.sha256(mode_bytes).hexdigest(),
        }
        self.assertEqual(["representation_selected_query_mode_mismatch"],
                         binding.binding_failures(repinned, mode_bytes))

        def drop_base(q):
            q.update(representation_mode="full")
            q.pop("base_representation_id")

        scope, record_bytes = self.mutated_bytes(
            "browser_command_request_09_representation_delta",
            "representation_query_delta_for_command_09", drop_base)
        self.assertEqual(
            ["representation_selected_query_base_mismatch",
             "representation_selected_query_mode_mismatch"],
            binding.binding_failures(scope, record_bytes))

    def test_command_query_base_identity_mismatch_is_rejected(self):
        scope, record_bytes = self.mutated_bytes(
            "browser_command_request_09_representation_delta",
            "representation_query_delta_for_command_09",
            lambda q: self.mutate(q, "base_representation_id", "representation-999"))
        self.assertEqual(["representation_selected_query_base_mismatch"],
                         binding.binding_failures(scope, record_bytes))

    def test_command_query_budget_mismatch_is_rejected(self):
        scope, record_bytes = self.mutated_bytes(
            "browser_command_request_10_representation_query",
            "representation_query_scoped_for_command_10",
            lambda q: self.mutate(q, "budget.max_nodes", 999))
        self.assertEqual(["representation_selected_query_budget_mismatch"],
                         binding.binding_failures(scope, record_bytes))

    def test_command_query_scope_roots_mismatch_is_rejected(self):
        scope, record_bytes = self.mutated_bytes(
            "browser_command_request_10_representation_query",
            "representation_query_scoped_for_command_10",
            lambda q: q.update(scope_roots=["root-elsewhere"]))
        self.assertEqual(["representation_selected_query_scope_roots_mismatch"],
                         binding.binding_failures(scope, record_bytes))

    def test_command_query_detail_classes_mismatch_is_rejected(self):
        capture_scope = VALUES["browser_command_request_08_representation_capture"]["scope"]
        capture_query = VALUES["representation_query_capture_for_command_08"]
        record_bytes = binding.canonical_record_bytes(
            dict(capture_query, detail_classes=["accessibility"]))
        scope = copy.deepcopy(capture_scope)
        scope["selected_representation_query"] = {
            "query_schema_id": "pm.browser_program.representation_query.v1",
            "query_id": capture_query["query_id"],
            "query_record_sha256": hashlib.sha256(record_bytes).hexdigest(),
        }
        self.assertEqual(["representation_selected_query_detail_mismatch"],
                         binding.binding_failures(scope, record_bytes))

    def test_command_query_operators_mismatch_is_rejected(self):
        scope, record_bytes = self.mutated_bytes(
            "browser_command_request_10_representation_query",
            "representation_query_scoped_for_command_10",
            lambda q: q.update(operators=["count"]))
        self.assertEqual(["representation_selected_query_operators_mismatch"],
                         binding.binding_failures(scope, record_bytes))

    def test_command_query_continuation_mismatch_is_rejected(self):
        scope, record_bytes = self.mutated_bytes(
            CONTINUED_COMMAND, CONTINUED_QUERY, lambda q: q.pop("continuation"))
        self.assertEqual(["representation_selected_query_continuation_mismatch"],
                         binding.binding_failures(scope, record_bytes))

    def test_foreign_query_identity_under_a_live_digest_is_rejected(self):
        query = VALUES[CONTINUED_QUERY]
        record_bytes = self.original_bytes(CONTINUED_QUERY)
        scope = copy.deepcopy(VALUES[CONTINUED_COMMAND]["scope"])
        scope["selected_representation_query"] = {
            "query_schema_id": "pm.browser_program.representation_query.v1",
            "query_id": "representation-query-foreign",
            "query_record_sha256": binding.record_sha256(query),
        }
        self.assertEqual(["representation_selected_query_identity_mismatch"],
                         binding.binding_failures(scope, record_bytes))

    def test_non_representation_command_scope_is_out_of_binding_scope(self):
        self.assertEqual([], binding.binding_failures(
            VALUES["browser_command_request_01_workspace_create"]["scope"],
            self.original_bytes(CONTINUED_QUERY)))


class HeldOriginalCausalTests(unittest.TestCase):
    """The V2 false accept and its V3 causal closure.

    V2 accepted `(scope, query, query_record_bytes=held_original_bytes)` with
    the bytes/digest held fixed while the separate `query` object and the
    command scope co-mutated (`scope_roots` to `["root-attacker"]`): the
    helper hashed the bytes but joined against the different mutable object.
    V3's helper accepts no query object at all — the record decoded from the
    held bytes is the sole query authority — so the same attack has no lever
    and every co-mutated shape fails closed.
    """

    def held(self):
        scope = copy.deepcopy(VALUES[CONTINUED_COMMAND]["scope"])
        original = copy.deepcopy(VALUES[CONTINUED_QUERY])
        original_bytes = binding.canonical_record_bytes(original)
        pinned = scope["selected_representation_query"]["query_record_sha256"]
        return scope, original, original_bytes, pinned

    def test_held_original_bytes_reject_a_co_mutated_scope_and_query_copy(self):
        scope, original, original_bytes, pinned = self.held()
        self.assertEqual(pinned, hashlib.sha256(original_bytes).hexdigest())
        self.assertEqual([], binding.binding_failures(scope, original_bytes))
        attacker_scope = copy.deepcopy(scope)
        attacker_scope["scope_roots"] = ["root-attacker"]
        self.assertEqual(["representation_selected_query_scope_roots_mismatch"],
                         binding.binding_failures(attacker_scope, original_bytes))
        attacker_query = copy.deepcopy(original)
        attacker_query["scope_roots"] = ["root-attacker"]
        # Authentic scope + attacker bytes: the digest no longer matches the
        # pinned original and the decoded attacker record's scope_roots miss
        # the authentic scope — both joins fire against the decoded bytes.
        self.assertEqual(
            sorted(["representation_selected_query_digest_mismatch",
                    "representation_selected_query_scope_roots_mismatch"]),
            binding.binding_failures(
                scope, binding.canonical_record_bytes(attacker_query)))
        # Fully co-mutated scope+query agree with each other; the held
        # bytes/digest pair is the one witness the co-mutation cannot
        # satisfy — the exact V2 false accept now fails closed.
        self.assertEqual(["representation_selected_query_digest_mismatch"],
                         binding.binding_failures(
                             attacker_scope, binding.canonical_record_bytes(attacker_query)))

    def test_the_helper_accepts_no_separate_query_object(self):
        import inspect
        parameters = inspect.signature(binding.binding_failures).parameters
        self.assertEqual(["scope", "query_record_bytes"], list(parameters))
        result_parameters = inspect.signature(
            binding.result_binding_failures).parameters
        self.assertEqual(["scope", "result", "query_record_bytes"],
                         list(result_parameters))

    def test_missing_original_bytes_fail_closed(self):
        scope, _, _, _ = self.held()
        for missing in (None, b"", "", 12345, object()):
            with self.subTest(missing=type(missing).__name__):
                self.assertEqual(["representation_selected_query_original_missing"],
                                 binding.binding_failures(scope, missing))

    def test_unparseable_original_bytes_fail_closed(self):
        scope, _, _, _ = self.held()
        for broken in (b"{not json", b"[]", b'"a string"', b"null",
                       b"\xff\xfe\x00bad-utf8"):
            with self.subTest(broken=broken):
                self.assertEqual(["representation_selected_query_original_unparseable"],
                                 binding.binding_failures(scope, broken))

    def test_structurally_invalid_decoded_original_is_rejected(self):
        scope, original, original_bytes, _ = self.held()
        broken = copy.deepcopy(original)
        broken.pop("query_id")
        self.assertEqual(["representation_selected_query_record_invalid"],
                         binding.binding_failures(
                             scope, binding.canonical_record_bytes(broken)))

    def test_decoded_owner_original_supplies_every_join(self):
        """Each joined field is read from the decoded original bytes: mutating
        only the bytes (digest honestly re-pinned) flips exactly that join,
        with no caller query object in the helper's signature to consult. The
        continued command's scope carries identity, subject, scope-roots,
        operator, budget and continuation joins; the mode/base and detail
        joins are covered by their dedicated command-paired tests above."""
        joins = [
            (lambda q: self._set(q, "query_id", "representation-query-foreign"),
             "representation_selected_query_identity_mismatch"),
            (lambda q: self._set(q, "subject.page_generation", 13),
             "representation_selected_query_subject_mismatch"),
            (lambda q: self._set(q, "scope_roots", ["root-elsewhere"]),
             "representation_selected_query_scope_roots_mismatch"),
            (lambda q: self._set(q, "operators", ["count"]),
             "representation_selected_query_operators_mismatch"),
            (lambda q: self._set(q, "budget.max_nodes", 999),
             "representation_selected_query_budget_mismatch"),
            (lambda q: self._set(q, "continuation", "continuation:other"),
             "representation_selected_query_continuation_mismatch"),
        ]
        for mutation, expected in joins:
            with self.subTest(error=expected):
                scope, record_bytes = self._repinned(mutation)
                self.assertEqual([expected], binding.binding_failures(scope, record_bytes))

    def _set(self, record, dotted, value):
        parts = dotted.split(".")
        parent = record
        for part in parts[:-1]:
            parent = parent[part]
        parent[parts[-1]] = value

    def _repinned(self, mutation):
        query = copy.deepcopy(VALUES[CONTINUED_QUERY])
        mutation(query)
        record_bytes = binding.canonical_record_bytes(query)
        scope = copy.deepcopy(VALUES[CONTINUED_COMMAND]["scope"])
        scope["selected_representation_query"] = {
            "query_schema_id": "pm.browser_program.representation_query.v1",
            "query_id": VALUES[CONTINUED_QUERY]["query_id"],
            "query_record_sha256": hashlib.sha256(record_bytes).hexdigest(),
        }
        return scope, record_bytes


class RepresentationResultBindingTests(unittest.TestCase):
    def base(self):
        return (VALUES[CONTINUED_COMMAND]["scope"],
                binding.canonical_record_bytes(VALUES[CONTINUED_QUERY]),
                VALUES[CONTINUED_RESULT])

    def test_schema_forbids_continuation_on_invalidated_results(self):
        scope, query_bytes, result = self.base()
        stale = copy.deepcopy(result)
        stale["invalidated"] = True
        stale["invalidation_reason"] = "navigation"
        self.assertTrue(list(validator("representation_query_result").iter_errors(stale)))
        stale.pop("continuation")
        self.assertEqual([], [e.message for e in validator("representation_query_result").iter_errors(stale)])
        self.assertEqual([], binding.result_binding_failures(scope, stale, query_record_bytes=query_bytes))

    def test_helper_rejects_continuation_behind_a_stale_coverage_lie(self):
        scope, query_bytes, result = self.base()
        liar = copy.deepcopy(result)
        liar["coverage"]["status"] = "stale_rejected"
        self.assertEqual([], list(validator("representation_query_result").iter_errors(liar)))
        self.assertEqual(["representation_stale_result_has_continuation"],
                         binding.result_binding_failures(scope, liar, query_record_bytes=query_bytes))

    def test_result_bound_to_another_query_is_rejected(self):
        scope, query_bytes, result = self.base()
        result = copy.deepcopy(result)
        result["query_id"] = "representation-query-cmd-10"
        self.assertEqual(["representation_result_query_mismatch"],
                         binding.result_binding_failures(scope, result, query_record_bytes=query_bytes))

    def test_result_on_another_generation_is_rejected(self):
        scope, query_bytes, result = self.base()
        result = copy.deepcopy(result)
        result["subject"] = dict(result["subject"], page_generation=13)
        self.assertEqual(
            ["representation_result_base_generation_mismatch",
             "representation_result_subject_mismatch"],
            binding.result_binding_failures(scope, result, query_record_bytes=query_bytes))

    def test_result_of_another_representation_is_rejected(self):
        scope, query_bytes, result = self.base()
        result = copy.deepcopy(result)
        result["representation_id"] = "representation-999"
        self.assertEqual(["representation_result_representation_mismatch"],
                         binding.result_binding_failures(scope, result, query_record_bytes=query_bytes))

    def test_result_join_reads_the_decoded_original_not_a_caller_copy(self):
        """With the held bytes fixed, a co-mutated scope breaks the result
        join chain through the decoded original's scope_roots."""
        scope, query_bytes, result = self.base()
        attacker_scope = copy.deepcopy(scope)
        attacker_scope["scope_roots"] = ["root-attacker"]
        self.assertEqual(["representation_selected_query_scope_roots_mismatch"],
                         binding.result_binding_failures(
                             attacker_scope, result, query_record_bytes=query_bytes))

    def test_command_result_echo_keeps_the_selected_binding(self):
        echo = VALUES["browser_command_result_binds_selected_representation_query"]["scope"]
        self.assertEqual([], binding.binding_failures(
            echo, binding.canonical_record_bytes(VALUES[CONTINUED_QUERY])))


if __name__ == "__main__":
    unittest.main()
