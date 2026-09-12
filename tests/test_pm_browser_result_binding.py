"""Actual-byte static Browser result binding; no native custody/runtime claims."""

import copy
import hashlib
import importlib.util
import json
import unittest
from pathlib import Path
from unittest.mock import Mock

from referencing import Registry


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("browser_result_gate", ROOT / "scripts/pm-new-contracts-verify.py")
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)
from pm_browser_program_semantics import validate_browser_program_result_bytes


SCHEMA_REL = "Plans/section15_browser_program_contracts.schema.json"
SCHEMA = GATE.load_json(ROOT / SCHEMA_REL)
FIXTURES = GATE.load_json(ROOT / "Plans/section15_browser_program_contract_fixtures.json")
BOUND = next(case["value"] for case in FIXTURES["valid"]
             if case["name"] == "result_bytes_bind_program_budget_schema_and_terminal_context")


def encode(value):
    """Synthetic bytes for these tests, not a prescribed transport serializer."""
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False).encode("utf-8")


class BrowserResultBindingTests(unittest.TestCase):
    def setUp(self):
        self.bound = copy.deepcopy(BOUND)
        self.result = json.loads(self.bound["result_utf8"])

    def validate(self, raw=None, **overrides):
        arguments = {
            "program": self.bound["program"],
            "resolved_schema_ref": self.bound["resolved_schema_ref"],
            "result_schema_utf8": self.bound["result_schema_utf8"].encode("utf-8"),
            "result_schema_resources": {uri: raw.encode("utf-8") for uri, raw in self.bound["result_schema_resources"].items()},
            "terminal_subject": self.bound["terminal_subject"],
            "terminal_workspace_revision": self.bound["terminal_workspace_revision"],
            "owner_schema": SCHEMA,
        }
        arguments.update(overrides)
        return validate_browser_program_result_bytes(
            encode(self.result) if raw is None else raw, **arguments,
        )

    def pin_schema(self, schema_bytes):
        self.bound["program"]["result_schema_sha256"] = hashlib.sha256(schema_bytes).hexdigest()
        return {"result_schema_utf8": schema_bytes}

    def test_retained_bound_fixture_passes_real_gate(self):
        self.assertEqual([], self.validate(self.bound["result_utf8"].encode()))
        self.assertEqual([], GATE.contract_semantic_failures(
            SCHEMA_REL, "browser_program_result_validation", self.bound,
        ))

    def test_validation_never_mutates_supplied_owner_context(self):
        before = copy.deepcopy(self.bound)
        self.assertEqual([], self.validate())
        self.assertEqual(before, self.bound)

    def test_validation_input_is_not_an_admitted_runtime_record(self):
        registry = GATE.offline_schema_registry()
        self.assertFalse(GATE.validator_for(SCHEMA, SCHEMA, registry).is_valid(self.bound))
        self.assertNotIn({"$ref": "#/$defs/browser_program_result_validation"}, SCHEMA["oneOf"])

    def test_standalone_and_aggregate_result_cannot_skip_binding(self):
        for definition in ("browser_program_result", "<root>"):
            with self.subTest(definition=definition):
                self.assertIn("browser_result_binding_required", GATE.contract_semantic_failures(
                    SCHEMA_REL, definition, self.result,
                ))

    def test_existing_budget_exact_boundary_and_one_byte_over(self):
        raw = encode(self.result)
        self.bound["program"]["budgets"]["max_output_bytes"] = len(raw)
        self.assertEqual([], self.validate(raw))
        self.assertEqual(["browser_result_output_budget_exceeded"], self.validate(raw + b" "))

    def test_whitespace_and_newline_are_not_reserialized_away(self):
        raw = json.dumps(self.result, indent=2).encode() + b"\n"
        self.bound["program"]["budgets"]["max_output_bytes"] = len(raw)
        self.assertEqual([], self.validate(raw))
        self.bound["program"]["budgets"]["max_output_bytes"] -= 1
        self.assertIn("browser_result_output_budget_exceeded", self.validate(raw))

    def test_ascii_escape_bytes_are_counted_as_transmitted(self):
        self.result["compact_result"]["text"] = "🧭" * 100
        compact = encode(self.result)
        escaped = json.dumps(self.result, ensure_ascii=True, separators=(",", ":")).encode()
        self.assertGreater(len(escaped), len(compact))
        self.bound["program"]["budgets"]["max_output_bytes"] = len(compact)
        self.assertEqual([], self.validate(compact))
        self.assertIn("browser_result_output_budget_exceeded", self.validate(escaped))

    def test_multibyte_characters_do_not_use_character_counts(self):
        self.result["compact_result"]["text"] = "🧭" * 262145
        raw = encode(self.result)
        self.assertLess(len(raw.decode()), self.bound["program"]["budgets"]["max_output_bytes"])
        self.assertIn("browser_result_output_budget_exceeded", self.validate(raw))

    def test_one_property_eight_mib_cannot_bypass_existing_one_mib_limit(self):
        self.result["compact_result"]["text"] = "x" * (8 * 1048576)
        self.assertIn("browser_result_output_budget_exceeded", self.validate())

    def test_payload_at_limit_still_exceeds_full_record_limit(self):
        self.result["compact_result"]["text"] = "x" * self.bound["program"]["budgets"]["max_output_bytes"]
        self.assertIn("browser_result_output_budget_exceeded", self.validate())

    def test_nested_array_values_count_not_just_top_level_properties(self):
        self.result["compact_result"]["rows"] = ["x" * 1024] * 2048
        self.assertIn("browser_result_output_budget_exceeded", self.validate())

    def test_all_reference_lists_count_toward_complete_result(self):
        for field in ("segment_receipt_refs", "artifact_refs", "capture_refs"):
            with self.subTest(field=field):
                self.result = json.loads(BOUND["result_utf8"])
                self.result[field] = ["artifact:" + "x" * 400] * 100
                self.bound["program"]["budgets"]["max_output_bytes"] = 10000
                self.assertIn("browser_result_output_budget_exceeded", self.validate())

    def test_every_terminal_and_mode_has_identical_budget_and_schema_enforcement(self):
        states = SCHEMA["$defs"]["browser_program_result"]["properties"]["terminal_state"]["enum"]
        modes = SCHEMA["$defs"]["browser_program"]["properties"]["result_mode"]["enum"]
        self.assertEqual(7, len(states))
        self.assertEqual(3, len(modes))
        for state in states:
            for mode in modes:
                with self.subTest(state=state, mode=mode):
                    self.result["terminal_state"] = state
                    self.bound["program"]["result_mode"] = mode
                    self.result["compact_result"] = {"count": 3}
                    raw = encode(self.result)
                    self.bound["program"]["budgets"]["max_output_bytes"] = len(raw)
                    self.assertEqual([], self.validate(raw))
                    self.assertIn("browser_result_output_budget_exceeded", self.validate(raw + b"\n"))
                    self.bound["program"]["budgets"]["max_output_bytes"] = 1048576
                    self.result["compact_result"] = {"count": "not-an-integer"}
                    self.assertIn("browser_result_output_schema_mismatch", self.validate())

    def test_bounded_typed_artifact_summary_can_replace_large_inline_payload(self):
        self.bound["program"]["result_mode"] = "summary_with_artifact_refs"
        self.result["compact_result"] = {"count": 2048, "data_ref": "artifact:typed-table:1"}
        self.result["artifact_refs"] = ["artifact:typed-table:1"]
        self.assertEqual([], self.validate())  # No artifact authenticity/content claim.
        self.result["compact_result"]["rows"] = ["x" * 1024] * 2048
        self.assertIn("browser_result_output_budget_exceeded", self.validate())

    def test_result_cannot_supply_a_larger_budget(self):
        self.result["max_output_bytes"] = 1073741824
        self.assertIn("browser_result_record_invalid", self.validate())

    def test_producing_program_schema_binding_fields_are_required(self):
        for field in ("result_schema_ref", "result_schema_sha256", "result_schema_dependencies", "budgets"):
            with self.subTest(field=field):
                program = copy.deepcopy(self.bound["program"])
                program.pop(field)
                self.assertIn("browser_result_producing_program_invalid", self.validate(program=program))

    def test_malformed_or_missing_owner_context_fails_closed(self):
        cases = ({"program": None}, {"owner_schema": None}, {"terminal_subject": None},
                 {"terminal_workspace_revision": True}, {"terminal_workspace_revision": -1},
                 {"result_schema_resources": []})
        for overrides in cases:
            with self.subTest(fields=list(overrides)):
                self.assertTrue(self.validate(**overrides))

    def test_program_and_workspace_identity_are_exact(self):
        for field, expected in (("program_id", "browser_result_program_mismatch"),
                                ("program_workspace_id", "browser_result_workspace_mismatch")):
            with self.subTest(field=field):
                self.result = json.loads(BOUND["result_utf8"])
                self.result[field] = "foreign-identity"
                self.assertIn(expected, self.validate())

    def test_each_required_lineage_dimension_is_joined(self):
        for field in self.result["lineage"]:
            with self.subTest(field=field):
                self.result = json.loads(BOUND["result_utf8"])
                self.result["lineage"][field] = "foreign-identity"
                self.assertIn("browser_result_lineage_mismatch", self.validate())

    def test_optional_lineage_is_not_dropped_from_join(self):
        self.result["lineage"]["thread_id"] = "foreign-thread"
        self.assertIn("browser_result_lineage_mismatch", self.validate())

    def test_each_terminal_subject_identity_is_exact(self):
        for field in ("browser_session_id", "browser_workspace_id", "browser_page_id"):
            with self.subTest(field=field):
                self.result = json.loads(BOUND["result_utf8"])
                self.result["subject"][field] = "foreign-identity"
                self.assertIn("browser_result_subject_mismatch", self.validate())

    def test_resolved_terminal_subject_cannot_retarget_another_page(self):
        terminal = copy.deepcopy(self.bound["terminal_subject"])
        terminal["browser_page_id"] = "foreign-page"
        self.result["subject"] = copy.deepcopy(terminal)
        self.assertIn("browser_result_terminal_subject_mismatch", self.validate(terminal_subject=terminal))

    def test_protected_auth_context_and_result_are_both_rejected(self):
        terminal = copy.deepcopy(self.bound["terminal_subject"])
        terminal["session_security_class"] = "protected_auth"
        self.assertIn("browser_result_terminal_subject_invalid", self.validate(terminal_subject=terminal))
        self.result["subject"]["session_security_class"] = "protected_auth"
        self.assertIn("browser_result_record_invalid", self.validate())

    def test_navigation_and_workspace_changes_may_advance(self):
        self.assertGreater(self.result["subject"]["page_generation"], self.bound["program"]["subject"]["page_generation"])
        self.assertGreater(self.result["result_workspace_revision"], self.bound["program"]["expected_workspace_revision"])
        self.assertEqual([], self.validate())

    def test_unchanged_generation_and_revision_are_also_valid(self):
        subject = copy.deepcopy(self.bound["program"]["subject"])
        revision = self.bound["program"]["expected_workspace_revision"]
        self.result["subject"] = subject
        self.result["result_workspace_revision"] = revision
        self.assertEqual([], self.validate(terminal_subject=subject, terminal_workspace_revision=revision))

    def test_claimed_old_or_future_generations_are_not_current(self):
        for generation in (0, 4, 999):
            with self.subTest(generation=generation):
                self.result["subject"]["page_generation"] = generation
                self.assertTrue(self.validate())

    def test_even_supplied_terminal_generation_cannot_regress(self):
        terminal = copy.deepcopy(self.bound["terminal_subject"])
        terminal["page_generation"] = 3
        self.result["subject"] = terminal
        self.assertIn("browser_result_terminal_subject_mismatch", self.validate(terminal_subject=terminal))

    def test_result_revision_cannot_be_old_or_claim_unresolved_future(self):
        for revision in (0, 2, 999):
            with self.subTest(revision=revision):
                self.result["result_workspace_revision"] = revision
                self.assertIn("browser_result_revision_mismatch", self.validate())
        self.assertIn("browser_result_terminal_revision_invalid", self.validate(terminal_workspace_revision=1))

    def test_actual_bytes_are_required_not_a_mapping_or_claimed_size(self):
        self.assertIn("browser_result_actual_bytes_required", self.validate(self.result))
        self.assertIn("browser_result_actual_bytes_required", self.validate(BOUND["result_utf8"]))

    def test_invalid_utf8_duplicate_keys_and_nonfinite_values_fail_without_content_echo(self):
        cases = (b"\xff", b'{"secret-marker":1,"secret-marker":2}',
                 b'{"nested":{"secret-marker":1,"secret-marker":2}}',
                 b'{"secret-marker":NaN}', b'{"secret-marker":Infinity}',
                 b'{"secret-marker":-Infinity}', b'{"secret-marker":"\\ud800"}',
                 b'{"secret-marker":')
        for raw in cases:
            with self.subTest(raw=raw):
                failures = self.validate(raw)
                self.assertEqual(["browser_result_json_invalid"], failures)
                self.assertNotIn("secret-marker", str(failures))

    def test_oversize_rejects_before_parsing_malformed_bytes(self):
        self.bound["program"]["budgets"]["max_output_bytes"] = 1
        self.assertEqual(["browser_result_output_budget_exceeded"], self.validate(b"\xff\xff"))

    def test_record_structure_cannot_be_hidden_in_valid_json(self):
        for raw in (b"null", b"true", b"[]", b"{}", b'"text"'):
            with self.subTest(raw=raw):
                self.assertIn("browser_result_record_invalid", self.validate(raw))

    def test_schema_reference_and_exact_original_bytes_are_pinned(self):
        self.assertIn("browser_result_schema_ref_mismatch", self.validate(resolved_schema_ref="schema:foreign:v1"))
        self.assertIn("browser_result_schema_hash_mismatch", self.validate(result_schema_utf8=b"true"))
        self.assertIn("browser_result_schema_hash_mismatch", self.validate(
            result_schema_utf8=self.bound["result_schema_utf8"].encode() + b"\n"))
        self.assertIn("browser_result_schema_bytes_required", self.validate(result_schema_utf8=None))

    def test_matching_hash_does_not_make_invalid_schema_valid(self):
        for raw in (b"null", b"{", b'{"type":"nonsense"}', b'{"type":"object","type":"string"}', b"\xff"):
            with self.subTest(schema=raw):
                self.assertIn("browser_result_output_schema_invalid", self.validate(**self.pin_schema(raw)))

    def test_unsupported_schema_dialect_has_no_silent_fallback(self):
        raw = b'{"$schema":"https://json-schema.org/draft-04/schema#","type":"object"}'
        self.assertIn("browser_result_output_schema_invalid", self.validate(**self.pin_schema(raw)))

    def test_nested_schema_cannot_switch_to_an_unsupported_dialect(self):
        for dialect in ("http://json-schema.org/draft-07/schema#", "https://example.invalid/unknown-dialect"):
            with self.subTest(dialect=dialect):
                raw = encode({"type": "object", "properties": {"count": {"$schema": dialect, "type": "integer"}}})
                self.assertIn("browser_result_output_schema_invalid", self.validate(**self.pin_schema(raw)))

    def test_pinned_schema_validates_nested_types_and_rejects_unknown_fields(self):
        for compact in ({"count": "3"}, {"count": -1}, {"count": 1, "rows": [7]},
                        {"count": 1, "unknown": "not-admitted"}, {}):
            with self.subTest(compact=compact):
                self.result["compact_result"] = compact
                self.assertIn("browser_result_output_schema_mismatch", self.validate())

    def test_local_output_schema_refs_resolve_without_network(self):
        raw = b'{"$defs":{"summary":{"type":"object","required":["count"]}},"$ref":"#/$defs/summary"}'
        self.assertEqual([], self.validate(**self.pin_schema(raw)))

    def test_local_schema_anchor_resolves_in_the_pinned_resource(self):
        raw = b'{"$defs":{"counter":{"$anchor":"counter","type":"integer"}},"type":"object","properties":{"count":{"$ref":"#counter"}}}'
        self.assertEqual([], self.validate(**self.pin_schema(raw)))

    def test_duplicate_schema_anchor_cannot_shadow_another_definition(self):
        raw = b'{"$defs":{"one":{"$anchor":"counter","type":"integer"},"two":{"$anchor":"counter","type":"string"}},"type":"object","properties":{"count":{"$ref":"#counter"}}}'
        self.assertIn("browser_result_schema_resource_collision", self.validate(**self.pin_schema(raw)))

    def test_remote_reference_is_unresolved_without_explicit_resource(self):
        raw = b'{"$ref":"https://example.invalid/unavailable"}'
        self.assertIn("browser_result_output_schema_unresolved", self.validate(**self.pin_schema(raw)))
        retrieve = Mock(side_effect=AssertionError("must never retrieve"))
        self.assertIn("browser_result_schema_resources_invalid", self.validate(
            **self.pin_schema(raw), result_schema_resources=Registry(retrieve=retrieve)))
        retrieve.assert_not_called()

    def test_explicit_offline_resource_is_supported(self):
        uri = "https://example.invalid/retained-summary"
        resource = encode({"$schema": "https://json-schema.org/draft/2020-12/schema",
                           "$id": uri, "type": "object", "required": ["count"]})
        self.bound["program"]["result_schema_dependencies"] = {uri: hashlib.sha256(resource).hexdigest()}
        raw = encode({"$ref": uri})
        self.assertEqual([], self.validate(**self.pin_schema(raw), result_schema_resources={uri: resource}))

    def test_imported_dialect_keeps_exact_decimal_validation(self):
        uri = "https://example.invalid/decimal-summary"
        resource = encode({"$schema": "https://json-schema.org/draft/2020-12/schema", "$id": uri,
                           "type": "object", "properties": {"count": {"type": "integer"}}})
        self.bound["program"]["result_schema_dependencies"] = {uri: hashlib.sha256(resource).hexdigest()}
        options = self.pin_schema(encode({"$ref": uri}))
        raw = encode(self.result).replace(b'"count":3', b'"count":3.0')
        self.assertEqual([], self.validate(raw, **options, result_schema_resources={uri: resource}))

    def test_changed_dependency_cannot_widen_a_pinned_root_schema(self):
        uri = "https://example.invalid/retained-summary"
        resource = b'{"type":"object","properties":{"count":{"type":"integer"}}}'
        self.bound["program"]["result_schema_dependencies"] = {uri: hashlib.sha256(resource).hexdigest()}
        root = encode({"$ref": uri})
        options = self.pin_schema(root)
        self.assertEqual([], self.validate(**options, result_schema_resources={uri: resource}))
        self.assertIn("browser_result_schema_dependency_hash_mismatch", self.validate(
            **options, result_schema_resources={uri: b"true"}))

    def test_missing_and_undeclared_dependency_resources_fail_closed(self):
        uri = "https://example.invalid/retained-summary"
        root = encode({"$ref": uri})
        self.assertIn("browser_result_schema_dependency_set_mismatch", self.validate(
            **self.pin_schema(root), result_schema_resources={uri: b"true"}))
        self.bound["program"]["result_schema_dependencies"] = {uri: hashlib.sha256(b"true").hexdigest()}
        self.assertIn("browser_result_schema_dependency_set_mismatch", self.validate(**self.pin_schema(root)))

    def test_transitive_resource_closure_is_pinned(self):
        middle = "https://example.invalid/middle"
        leaf = "https://example.invalid/leaf"
        resources = {middle: encode({"$ref": leaf}), leaf: b'{"type":"object","required":["count"]}'}
        self.bound["program"]["result_schema_dependencies"] = {
            uri: hashlib.sha256(raw).hexdigest() for uri, raw in resources.items()
        }
        options = self.pin_schema(encode({"$ref": middle}))
        self.assertEqual([], self.validate(**options, result_schema_resources=resources))
        resources[leaf] = b"true"
        self.assertIn("browser_result_schema_dependency_hash_mismatch", self.validate(
            **options, result_schema_resources=resources))

    def test_unused_unresolved_schema_branch_is_not_silently_ignored(self):
        root = b'{"type":"object","properties":{"absent":{"$ref":"https://example.invalid/missing"}}}'
        self.assertIn("browser_result_output_schema_unresolved", self.validate(**self.pin_schema(root)))

    def test_resource_declared_identity_must_match_its_binding(self):
        root = b'{"$id":"https://example.invalid/foreign","type":"object"}'
        self.assertIn("browser_result_schema_identity_mismatch", self.validate(**self.pin_schema(root)))

    def test_nested_resource_identity_collision_is_rejected(self):
        uri = "https://example.invalid/dependency"
        resource = b'{"type":"object"}'
        self.bound["program"]["result_schema_dependencies"] = {uri: hashlib.sha256(resource).hexdigest()}
        root = encode({"$defs": {"shadow": {"$id": uri, "type": "string"}}, "$ref": uri})
        self.assertIn("browser_result_schema_resource_collision", self.validate(
            **self.pin_schema(root), result_schema_resources={uri: resource}))

    def test_annotation_data_does_not_become_schema_resource_identity(self):
        root = encode({"type": "object", "$comment": "static", "examples": [{"$id": self.bound["resolved_schema_ref"]}]})
        self.assertEqual([], self.validate(**self.pin_schema(root)))

    def test_output_schema_cycle_fails_closed(self):
        self.assertIn("browser_result_output_schema_invalid", self.validate(**self.pin_schema(b'{"$ref":"#"}')))

    def test_decimal_decode_does_not_underflow_into_an_allowed_integer(self):
        raw = encode(self.result).replace(b'"count":3', b'"count":1e-400')
        self.assertIn("browser_result_output_schema_mismatch", self.validate(raw))

    def test_integral_decimal_and_large_finite_json_numbers_keep_value(self):
        for token in (b"3.0", b"1e400"):
            with self.subTest(token=token):
                raw = encode(self.result).replace(b'"count":3', b'"count":' + token)
                self.assertEqual([], self.validate(raw))

    def test_decimal_multiple_of_is_checked_exactly(self):
        schema = b'{"type":"object","properties":{"count":{"type":"number","multipleOf":0.1}}}'
        raw = encode(self.result).replace(b'"count":3', b'"count":0.3')
        self.assertEqual([], self.validate(raw, **self.pin_schema(schema)))


if __name__ == "__main__":
    unittest.main()
