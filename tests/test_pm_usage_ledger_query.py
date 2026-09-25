"""DL-098 Usage Ledger selection companion. Static checks only; no native proof.

Runs detached from the candidate tree alone (candidate/Plans + candidate/scripts).
Two gate-path tests additionally read the copied inputs tree beside candidate/
for the gate's sibling imports and skip when it is absent.
"""
from copy import deepcopy
import importlib.util
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest

from jsonschema import Draft202012Validator

STAGE = Path(__file__).resolve().parents[1]
DETACHED_INPUTS = STAGE.parent / "inputs"
INPUTS = Path(os.environ.get("PM_DETACHED_INPUTS", str(DETACHED_INPUTS if DETACHED_INPUTS.is_dir() else STAGE)))
sys.path.insert(0, str(STAGE / "scripts"))
import pm_usage_ledger_query_semantics as m

SCHEMA = json.loads((STAGE / "Plans/usage_ledger_query_contracts.schema.json").read_text())
FIXTURES = json.loads((STAGE / "Plans/usage_ledger_query_contract_fixtures.json").read_text())
BY_NAME = {case["name"]: case["value"] for case in FIXTURES["valid"]}
SCHEMA_REL = "Plans/usage_ledger_query_contracts.schema.json"


def dotted_patch(document, patch):
    result = deepcopy(document)
    for dotted, replacement in patch.items():
        parts = dotted.split(".")
        current = result
        for part in parts[:-1]:
            current = current[int(part)] if isinstance(current, list) else current[part]
        leaf = parts[-1]
        if isinstance(current, list):
            current[int(leaf)] = deepcopy(replacement)
        else:
            current[leaf] = deepcopy(replacement)
    return result


def remove_paths(document, paths):
    result = deepcopy(document)
    for dotted in paths:
        parts = dotted.split(".")
        current = result
        for part in parts[:-1]:
            current = current[int(part)] if isinstance(current, list) else current[part]
        leaf = parts[-1]
        if isinstance(current, list):
            del current[int(leaf)]
        else:
            current.pop(leaf, None)
    return result


def materialize(case):
    if "value" in case:
        return deepcopy(case["value"])
    value = deepcopy(BY_NAME[case["base_valid"]])
    if "patch" in case:
        value = dotted_patch(value, case["patch"])
    if "remove" in case:
        value = remove_paths(value, case["remove"])
    return value


def load_candidate_gate():
    sys.path.insert(0, str(STAGE / "scripts"))
    if str(INPUTS / "scripts") not in sys.path:
        sys.path.insert(1, str(INPUTS / "scripts"))
    spec = importlib.util.spec_from_file_location(
        "candidate_contracts_gate", STAGE / "scripts/pm-new-contracts-verify.py")
    gate = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = gate
    spec.loader.exec_module(gate)
    return gate


def load_candidate_plans_verify():
    sys.path.insert(0, str(STAGE / "scripts"))
    if str(INPUTS / "scripts") not in sys.path:
        sys.path.insert(1, str(INPUTS / "scripts"))
    spec = importlib.util.spec_from_file_location(
        "candidate_plans_verify", STAGE / "scripts/pm-plans-verify.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


WIRING = json.loads((STAGE / "Plans/Wiring_Matrix.production.json").read_text())
WIRING_SCHEMA = json.loads((STAGE / "Plans/Wiring_Matrix.schema.json").read_text())
WIRING_ROW_IDS = ("catalog.usage_refresh", "catalog.usage_export")
LEDGER_PROFILE = "usage_ledger_selection.v1"
LEDGER_REQUEST_REF = "Plans/usage_ledger_query_contracts.schema.json#/$defs/ledger_request"
LEDGER_RESULT_REF = "Plans/usage_ledger_query_contracts.schema.json#/$defs/ledger_result"
V2_REFS = {
    "catalog.usage_refresh": ("Plans/usage_quota_command_contracts.schema.json#/$defs/usage_refresh_request",
                              "Plans/usage_quota_command_contracts.schema.json#/$defs/usage_refresh_result"),
    "catalog.usage_export": ("Plans/usage_quota_command_contracts.schema.json#/$defs/usage_export_request",
                             "Plans/usage_quota_command_contracts.schema.json#/$defs/usage_export_result"),
}


class LedgerSchemaTests(unittest.TestCase):
    def test_metaschema_valid(self):
        Draft202012Validator.check_schema(SCHEMA)

    def test_self_contained_no_external_refs(self):
        refs = []

        def walk(node):
            if isinstance(node, dict):
                for key, value in node.items():
                    if key == "$ref":
                        refs.append(value)
                    else:
                        walk(value)
            elif isinstance(node, list):
                for entry in node:
                    walk(entry)

        walk(SCHEMA)
        self.assertTrue(refs)
        for ref in refs:
            self.assertTrue(ref.startswith("#/"), ref)

    def test_root_oneof_and_discriminators(self):
        names = [branch["$ref"].removeprefix("#/$defs/")
                 for branch in SCHEMA["oneOf"]]
        self.assertEqual(names, ["ledger_request", "ledger_result", "ledger_query_fixture"])
        ids = [SCHEMA["$defs"][name]["properties"]["schema_id"]["const"] for name in names]
        self.assertEqual(len(set(ids)), 3)

    def test_no_central_outcome_or_response_defs(self):
        joined = json.dumps(SCHEMA)
        for token in ("CommandOutcomeRecord", "UICommandResponse", "ui_command_response",
                      "shared_runtime", "full_thread", "EventRecord"):
            self.assertNotIn(token, joined)

    def test_fixture_pack_id_never_runtime_value(self):
        pack_id = FIXTURES["schema_id"]
        self.assertIn("fixtures", pack_id)

        def walk(node, path="$"):
            if isinstance(node, dict):
                for key, value in node.items():
                    walk(value, path + "." + key)
            elif isinstance(node, list):
                for index, value in enumerate(node):
                    walk(value, f"{path}[{index}]")
            else:
                self.assertNotEqual(node, pack_id, path)

        for case in FIXTURES["valid"]:
            walk(case["value"])


@unittest.skipUnless((INPUTS / "scripts").is_dir(),
                     "copied inputs tree with gate sibling imports is absent")
class LedgerGatePathTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.gate = load_candidate_gate()
        from referencing import Registry, Resource
        registry = Registry(retrieve=lambda uri: (_ for _ in ()).throw(
            ValueError("unregistered schema URI: " + uri)))
        cls.registry = registry.with_resource(SCHEMA["$id"], Resource.from_contents(SCHEMA))

    def test_pair_enrolled_with_exact_count(self):
        gate = self.gate
        self.assertIn((SCHEMA_REL, "Plans/usage_ledger_query_contract_fixtures.json"),
                      gate.CONTRACT_PAIRS)
        self.assertEqual(len(gate.CONTRACT_PAIRS), gate.EXPECTED_CONTRACT_PAIR_COUNT)
        self.assertEqual(gate.EXPECTED_CONTRACT_PAIR_COUNT, 73 if INPUTS != STAGE else 78)

    def test_validator_dispatch(self):
        gate = self.gate
        value = deepcopy(BY_NAME["ledger_filtered_time_newest_first"])
        self.assertEqual(gate.contract_semantic_failures(SCHEMA_REL, "ledger_request", value), [])
        self.assertEqual(
            gate.contract_semantic_failures(SCHEMA_REL, "ledger_query_fixture", value), [])

    def test_gate_path_accepts_positives_rejects_negatives(self):
        gate = self.gate
        for case in FIXTURES["valid"]:
            with self.subTest(case=case["name"]):
                definition, selected = gate.select_definition(
                    SCHEMA, case, case["value"], require_valid=True)
                errors = list(gate.validator_for(SCHEMA, selected, self.registry)
                              .iter_errors(case["value"]))
                self.assertEqual(errors, [])
                self.assertEqual(
                    gate.contract_semantic_failures(SCHEMA_REL, definition, case["value"]), [])
        for case in FIXTURES["invalid"]:
            with self.subTest(case=case["name"]):
                value = gate.materialize_invalid(
                    case, {name: deepcopy(val) for name, val in BY_NAME.items()})
                selector = dict(case)
                if "definition" not in selector and "schema_ref" not in selector:
                    base = selector.get("base_valid", selector.get("left_valid"))
                    selector["definition"] = "ledger_query_fixture" if base in BY_NAME else None
                definition, selected = gate.select_definition(
                    SCHEMA, selector, value, require_valid=False)
                accepted = gate.validator_for(SCHEMA, selected, self.registry).is_valid(value)
                rule = case.get("semantic_rule")
                if rule is not None:
                    self.assertTrue(accepted)
                    failures = gate.contract_semantic_failures(SCHEMA_REL, definition, value)
                    self.assertIn(rule, failures)
                else:
                    self.assertFalse(accepted)


class LedgerFixtureTests(unittest.TestCase):
    def test_valid_fixtures_clean(self):
        for case in FIXTURES["valid"]:
            with self.subTest(case=case["name"]):
                self.assertEqual(m.shape(case["definition"], case["value"]), [])
                self.assertEqual(
                    m.usage_ledger_query_semantic_failures(case["definition"],
                                                           deepcopy(case["value"])), [])

    def test_invalid_fixtures_rejected(self):
        for case in FIXTURES["invalid"]:
            with self.subTest(case=case["name"]):
                value = materialize(case)
                shape_errors = m.shape(case["definition"], value)
                rule = case.get("semantic_rule")
                if rule is not None:
                    self.assertEqual(shape_errors, [])
                    self.assertIn(
                        rule, m.usage_ledger_query_semantic_failures(case["definition"], value))
                else:
                    self.assertTrue(shape_errors)

    def test_non_fixture_definitions_pass_through(self):
        value = deepcopy(BY_NAME["ledger_filtered_time_newest_first"])
        self.assertEqual(m.usage_ledger_query_semantic_failures("ledger_request", value), [])
        self.assertEqual(m.usage_ledger_query_semantic_failures("ledger_row", value), [])

    def test_malformed_fixture_fails_closed(self):
        value = deepcopy(BY_NAME["ledger_filtered_time_newest_first"])
        del value["result"]
        self.assertEqual(
            m.usage_ledger_query_semantic_failures("ledger_query_fixture", value),
            ["fixture_shape"])

    def test_p1_hand_computed_order_and_viewport_independence(self):
        value = BY_NAME["ledger_filtered_time_newest_first"]
        result = value["result"]
        self.assertEqual(result["ordered_record_ids"],
                         ["rec:ledger:003", "rec:ledger:002", "rec:ledger:001"])
        self.assertEqual(result["selection"]["effective_record_ids"],
                         ["rec:ledger:003", "rec:ledger:001"])
        export = result["export"]
        self.assertEqual(export["mode"], "filtered")
        self.assertEqual([row["usage_record_id"] for row in export["rows"]],
                         result["ordered_record_ids"])
        self.assertEqual(export["total_match_count"], 3)
        self.assertEqual(export["drawn_viewport_row_count"], 2)
        self.assertLess(len(export["rows"]), 4)

    def test_p2_search_tie_break_and_excluded_row(self):
        value = BY_NAME["ledger_selected_tokens_search"]
        result = value["result"]
        self.assertEqual(result["matched_record_ids"], ["rec:search:002", "rec:search:003"])
        self.assertNotIn("rec:search:001", result["matched_record_ids"])
        self.assertEqual(result["ordered_record_ids"], ["rec:search:002", "rec:search:003"])
        self.assertEqual([row["usage_record_id"] for row in result["export"]["rows"]],
                         result["selection"]["effective_record_ids"])

    def test_p3_refresh_has_no_export_unknowns_last(self):
        value = BY_NAME["ledger_refresh_cost_unknowns_last"]
        result = value["result"]
        self.assertEqual(value["request"]["command_id"], "cmd.usage.refresh")
        self.assertIsNone(result["export"])
        self.assertEqual(result["ordered_record_ids"],
                         ["rec:cost:001", "rec:cost:003", "rec:cost:002"])

    def test_p6_reverse_cost_oldest_first_unknowns_last(self):
        value = BY_NAME["ledger_refresh_cost_oldest_first"]
        self.assertEqual(value["request"]["query"]["sort"]["order"],
                         "oldest_or_smallest_first")
        result = value["result"]
        self.assertEqual(value["request"]["command_id"], "cmd.usage.refresh")
        self.assertIsNone(result["export"])
        self.assertEqual(result["ordered_record_ids"],
                         ["rec:cost:003", "rec:cost:001", "rec:cost:002"])

    def test_p4_cancelled_binds_error_not_receipt(self):
        value = BY_NAME["ledger_cancelled_nullable_ui_error"]
        result = value["result"]
        self.assertEqual(result["status"], "cancelled")
        self.assertEqual(result["error_ref"], "error:ledger:cancelled")
        self.assertIsNone(result["result_receipt_ref"])
        self.assertIsNone(result["export"])
        self.assertIsNotNone(value["central_input"]["ui_error"])
        self.assertEqual(value["central_input"]["error_ref"], result["error_ref"])

    def test_p5_replay_preserves_originals(self):
        value = BY_NAME["ledger_replay_preserves_original_export"]
        central = value["central_input"]
        self.assertTrue(central["replayed"])
        self.assertEqual(central["original_effective_record_ids"],
                         value["result"]["selection"]["effective_record_ids"])
        self.assertEqual(central["original_export_row_ids"],
                         [row["usage_record_id"] for row in value["result"]["export"]["rows"]])

    def test_central_dispatch_static_note_everywhere(self):
        for case in FIXTURES["valid"]:
            with self.subTest(case=case["name"]):
                dispatch = case["value"]["central_input"]["central_dispatch"]
                self.assertEqual(dispatch["status"], "static_note_only")
        # Demoted surrogate: ledger fixtures keep a static-note marker that
        # carries no central claim. Real central composition for the v1/v2
        # refresh/export route and the DL-098 ledger-profile branch lives in
        # candidate/scripts/pm_ui_command_response.py (usage_owner_failures)
        # and is covered by tests/test_pm_usage_central_response.py against
        # actual central grammar.
        self.assertTrue((STAGE / "scripts/pm_ui_command_response.py").exists())
        central_text = (STAGE / "scripts/pm_ui_command_response.py").read_text()
        self.assertIn("pm.usage.ledger_query.result.v1", central_text)
        self.assertIn("usage_ledger_failures", central_text)

    def test_supported_dispatch_claim_is_schema_rejected(self):
        value = deepcopy(BY_NAME["ledger_filtered_time_newest_first"])
        value["central_input"]["central_dispatch"]["status"] = "supported"
        self.assertTrue(m.shape("ledger_query_fixture", value))
        self.assertIn("static_note_dispatch_claimed", m.validate_fixture(value))


class LedgerMutationTests(unittest.TestCase):
    def fresh(self, name="ledger_filtered_time_newest_first"):
        return deepcopy(BY_NAME[name])

    def check(self, value):
        return m.usage_ledger_query_semantic_failures("ledger_query_fixture", value)

    def sync_query(self, value, dotted, replacement):
        for root in ("request.query", "result.request.query", "result.applied_query"):
            value = dotted_patch(value, {root + "." + dotted: replacement})
        return value

    def test_second_axis_narrows_conjunctively(self):
        value = self.fresh()
        value = self.sync_query(value, "filters", {"provider_ids": ["provider:acme"],
                                                   "model_ids": ["model:beta"]})
        value = self.sync_query(value, "requested_record_ids", ["rec:ledger:003"])
        value["result"]["matched_record_ids"] = ["rec:ledger:003"]
        value["result"]["ordered_record_ids"] = ["rec:ledger:003"]
        value["result"]["selection"]["requested_record_ids"] = ["rec:ledger:003"]
        value["result"]["selection"]["effective_record_ids"] = ["rec:ledger:003"]
        value["result"]["page"] = {"offset": 0, "limit": 10, "returned_count": 1,
                                   "total_match_count": 1}
        value["result"]["export"]["rows"] = [value["recorded_rows"][2]]
        value["result"]["export"]["drawn_viewport_row_count"] = 1
        value["result"]["export"]["total_match_count"] = 1
        self.assertEqual(self.check(value), [])

    def test_disjunctive_union_rejected(self):
        value = self.fresh()
        value = self.sync_query(value, "filters", {"model_ids": ["model:alpha", "model:beta"],
                                                   "event_types": ["embedding"]})
        self.assertIn("nonconjunctive_match", self.check(value))

    def test_null_thread_never_matches_selected_thread(self):
        value = self.fresh("ledger_selected_tokens_search")
        value = self.sync_query(value, "filters", {"event_types": ["inference"],
                                                   "thread_ids": ["thread:s3"]})
        value = self.sync_query(value, "requested_record_ids", ["rec:search:003"])
        self.assertIn("nonconjunctive_match", self.check(value))
        value["result"]["matched_record_ids"] = ["rec:search:003"]
        value["result"]["ordered_record_ids"] = ["rec:search:003"]
        value["result"]["selection"]["requested_record_ids"] = ["rec:search:003"]
        value["result"]["selection"]["effective_record_ids"] = ["rec:search:003"]
        value["result"]["page"] = {"offset": 0, "limit": 10, "returned_count": 1,
                                   "total_match_count": 1}
        value["result"]["export"]["rows"] = [value["recorded_rows"][2]]
        value["result"]["export"]["drawn_viewport_row_count"] = 1
        value["result"]["export"]["total_match_count"] = 1
        self.assertEqual(self.check(value), [])

    def test_empty_filters_match_all_admitted(self):
        value = self.fresh()
        self.assertEqual(self.check(self.sync_query(value, "filters", {})), [])

    def test_out_of_scope_row_not_matched(self):
        value = self.fresh()
        value["recorded_rows"][2]["project_id"] = "project:foreign"
        value["result"]["export"]["rows"][0]["project_id"] = "project:foreign"
        self.assertIn("nonconjunctive_match", self.check(value))

    def test_out_of_interval_row_not_matched(self):
        value = self.fresh()
        value["recorded_rows"][0]["observed_at_utc"] = "2026-09-25T06:00:00Z"
        value["result"]["export"]["rows"][2]["observed_at_utc"] = "2026-09-25T06:00:00Z"
        self.assertIn("nonconjunctive_match", self.check(value))

    def test_interval_duration_mismatch(self):
        value = self.fresh()
        value = self.sync_query(value, "interval_end", "2026-09-25T06:00:00Z")
        self.assertIn("query_interval", self.check(value))

    def test_search_is_literal_not_regex(self):
        value = self.fresh("ledger_selected_tokens_search")
        value = self.sync_query(value, "search.text", "model-.*")
        self.assertIn("nonconjunctive_match", self.check(value))

    def test_search_case_insensitive(self):
        value = self.fresh("ledger_selected_tokens_search")
        self.assertEqual(self.check(self.sync_query(value, "search.text", "model-BETA")), [])

    def test_note_match_plus_label_match_accepted(self):
        value = self.fresh("ledger_selected_tokens_search")
        value["recorded_rows"][1]["non_displayed_admin_note"] = "model-beta note"
        value["result"]["export"]["rows"][0]["non_displayed_admin_note"] = "model-beta note"
        self.assertEqual(self.check(value), [])

    def test_null_search_constrains_nothing(self):
        value = self.fresh("ledger_selected_tokens_search")
        value = self.sync_query(value, "search", None)
        self.assertEqual(self.check(value), [])

    def test_reversed_time_order_rejected(self):
        value = self.fresh()
        value["result"]["ordered_record_ids"] = ["rec:ledger:001", "rec:ledger:002",
                                                 "rec:ledger:003"]
        self.assertIn("sort_order_wrong", self.check(value))

    def test_reverse_time_order_accepted_when_selected(self):
        value = self.fresh()
        value = self.sync_query(value, "sort.order", "oldest_or_smallest_first")
        value["result"]["ordered_record_ids"] = ["rec:ledger:001", "rec:ledger:002",
                                                 "rec:ledger:003"]
        value["result"]["selection"]["effective_record_ids"] = ["rec:ledger:001",
                                                                "rec:ledger:003"]
        value["result"]["export"]["rows"] = [value["recorded_rows"][0],
                                             value["recorded_rows"][1],
                                             value["recorded_rows"][2]]
        self.assertEqual(self.check(value), [])
        value["result"]["ordered_record_ids"] = ["rec:ledger:003", "rec:ledger:002",
                                                 "rec:ledger:001"]
        self.assertIn("sort_order_wrong", self.check(value))

    def test_reverse_tokens_keeps_unknowns_last(self):
        value = self.fresh("ledger_refresh_cost_unknowns_last")
        value = self.sync_query(value, "sort.key", "tokens")
        value = self.sync_query(value, "sort.order", "oldest_or_smallest_first")
        value["result"]["ordered_record_ids"] = ["rec:cost:001", "rec:cost:002",
                                                 "rec:cost:003"]
        self.assertEqual(self.check(value), [])

    def test_tokens_key_orders_by_magnitude(self):
        value = self.fresh("ledger_refresh_cost_unknowns_last")
        value = self.sync_query(value, "sort.key", "tokens")
        value["result"]["ordered_record_ids"] = ["rec:cost:002", "rec:cost:001", "rec:cost:003"]
        self.assertEqual(self.check(value), [])

    def test_unknown_zero_not_unknown(self):
        value = self.fresh("ledger_refresh_cost_unknowns_last")
        value["recorded_rows"][2]["cost_microdollars"] = {"state": "reported", "value": 0,
                                                         "unit": "microdollars"}
        value["recorded_rows"][2]["currency"] = "USD"
        self.assertEqual(self.check(value), [])

    def test_fractional_money_rejected(self):
        value = self.fresh()
        value["recorded_rows"][0]["cost_microdollars"]["value"] = 0.5
        value["result"]["export"]["rows"][2]["cost_microdollars"]["value"] = 0.5
        self.assertIn("cost_unit_or_count", self.check(value))

    def test_wrong_money_unit_rejected(self):
        value = self.fresh()
        value["recorded_rows"][0]["cost_microdollars"]["unit"] = "tokens"
        value["result"]["export"]["rows"][2]["cost_microdollars"]["unit"] = "tokens"
        self.assertIn("cost_unit_or_count", self.check(value))

    def test_missing_currency_rejected(self):
        value = self.fresh()
        value["recorded_rows"][0]["currency"] = None
        value["result"]["export"]["rows"][2]["currency"] = None
        self.assertIn("cost_currency_missing", self.check(value))

    def test_fractional_tokens_rejected(self):
        value = self.fresh()
        value["recorded_rows"][0]["token_total"]["value"] = 1.5
        value["result"]["export"]["rows"][2]["token_total"]["value"] = 1.5
        self.assertIn("token_unit_or_count", self.check(value))

    def test_stale_requested_id_dropped_honestly(self):
        value = self.fresh()
        requested = ["rec:ledger:001", "rec:ledger:003", "rec:ledger:stale"]
        value = self.sync_query(value, "requested_record_ids", requested)
        value["result"]["selection"]["requested_record_ids"] = requested
        self.assertEqual(self.check(value), [])

    def test_requested_order_does_not_move_effective_order(self):
        value = self.fresh()
        value = self.sync_query(value, "requested_record_ids",
                                ["rec:ledger:003", "rec:ledger:001"])
        value["result"]["selection"]["requested_record_ids"] = ["rec:ledger:003",
                                                                "rec:ledger:001"]
        self.assertEqual(self.check(value), [])

    def test_empty_requested_selection_exports_nothing(self):
        value = self.fresh("ledger_selected_tokens_search")
        value = self.sync_query(value, "requested_record_ids", [])
        value["result"]["selection"]["requested_record_ids"] = []
        value["result"]["selection"]["effective_record_ids"] = []
        value["result"]["export"]["rows"] = []
        self.assertEqual(self.check(value), [])

    def test_refresh_with_export_rejected(self):
        value = self.fresh("ledger_refresh_cost_unknowns_last")
        value["result"]["export"] = {"mode": "filtered", "rows": [],
                                     "drawn_viewport_row_count": 0, "total_match_count": 3}
        self.assertIn("refresh_export_effect", self.check(value))

    def test_export_missing_on_success(self):
        value = self.fresh()
        value["result"]["export"] = None
        self.assertIn("export_no_output", self.check(value))

    def test_export_mode_mismatch(self):
        value = self.fresh()
        value["request"]["export_mode"] = "selected"
        value["result"]["request"]["export_mode"] = "selected"
        self.assertIn("export_mode_mismatch", self.check(value))

    def test_export_total_mismatch(self):
        value = self.fresh()
        value["result"]["export"]["total_match_count"] = 2
        self.assertIn("export_total_mismatch", self.check(value))

    def test_drawn_exceeding_total_rejected(self):
        value = self.fresh()
        value["result"]["export"]["drawn_viewport_row_count"] = 5
        self.assertIn("viewport_dishonest", self.check(value))

    def test_failed_with_output_rejected(self):
        value = self.fresh()
        value["result"]["status"] = "failed"
        value["result"]["error_ref"] = "error:ledger:failed"
        value["result"]["result_receipt_ref"] = None
        value["central_input"]["error_ref"] = "error:ledger:failed"
        self.assertIn("terminal_export_present", self.check(value))

    def test_rejected_must_be_empty(self):
        value = self.fresh()
        value["result"]["status"] = "rejected"
        value["result"]["error_ref"] = "error:ledger:rejected"
        value["result"]["result_receipt_ref"] = None
        value["central_input"]["error_ref"] = "error:ledger:rejected"
        self.assertIn("rejected_result_not_empty", self.check(value))

    def test_success_without_receipt_rejected(self):
        value = self.fresh()
        value["result"]["result_receipt_ref"] = None
        self.assertIn("receipt_error_binding", self.check(value))

    def test_failed_without_error_rejected(self):
        value = self.fresh()
        value["result"]["status"] = "failed"
        value["result"]["result_receipt_ref"] = None
        value["result"]["export"] = None
        value["result"]["page"] = None
        self.assertIn("receipt_error_binding", self.check(value))

    def test_duplicate_recorded_identity_rejected(self):
        value = self.fresh()
        value["recorded_rows"][1]["usage_record_id"] = "rec:ledger:001"
        self.assertIn("duplicate_recorded_identity", self.check(value))

    def test_page_missing_on_success(self):
        value = self.fresh()
        value["result"]["page"] = None
        self.assertIn("page_missing", self.check(value))

    def test_page_offset_at_total_boundary(self):
        value = self.fresh()
        value["result"]["page"] = {"offset": 3, "limit": 2, "returned_count": 0,
                                   "total_match_count": 3}
        self.assertEqual(self.check(value), [])

    def test_page_short_full_page_rejected(self):
        value = self.fresh()
        value["result"]["page"]["returned_count"] = 1
        self.assertIn("page_dishonest", self.check(value))

    def test_legacy_run_guess_rejected(self):
        value = self.fresh()
        value["recorded_rows"][0]["identity_provenance"]["run_identity"] = "legacy_guess"
        value["result"]["export"]["rows"][2]["identity_provenance"]["run_identity"] = "legacy_guess"
        self.assertIn("legacy_identity_guess", self.check(value))

    def test_invented_event_identity_rejected(self):
        value = self.fresh()
        value["recorded_rows"][1]["identity_provenance"]["event_identity"] = "invented"
        value["result"]["export"]["rows"][1]["identity_provenance"]["event_identity"] = "invented"
        self.assertIn("invented_run_or_event_identity", self.check(value))

    def test_applied_query_scope_differs(self):
        value = self.fresh()
        value["result"]["applied_query"]["scope_kind"] = "application"
        value["result"]["applied_query"]["project_id"] = None
        self.assertIn("stale_applied_query", self.check(value))

    def test_result_instance_echo_mismatch(self):
        value = self.fresh()
        value["result"]["command_instance_id"] = "instance:rogue"
        self.assertIn("result_request_mismatch", self.check(value))

    def test_result_command_echo_mismatch(self):
        value = self.fresh()
        value["result"]["command_id"] = "cmd.usage.refresh"
        self.assertIn("result_request_mismatch", self.check(value))

    def test_central_command_mismatch(self):
        value = self.fresh()
        value["central_input"]["command_id"] = "cmd.usage.refresh"
        self.assertIn("central_request_mismatch", self.check(value))

    def test_central_identity_scope_mismatch(self):
        value = self.fresh()
        value["central_input"]["owner_identity"]["server_id"] = "server:foreign"
        self.assertIn("central_request_mismatch", self.check(value))

    def test_current_panel_substitution_rejected(self):
        value = self.fresh()
        value["central_input"]["caller"]["caller_context_ref"] = value["current_panel_context_ref"]
        failures = self.check(value)
        self.assertIn("caller_substitution", failures)
        self.assertIn("current_panel_substitution", failures)

    def test_cancelled_null_ui_error_allowed(self):
        value = self.fresh("ledger_cancelled_nullable_ui_error")
        value["central_input"]["ui_error"] = None
        self.assertEqual(self.check(value), [])

    def test_failed_with_ui_error_rejected(self):
        value = self.fresh()
        value["result"]["status"] = "failed"
        value["result"]["error_ref"] = "error:ledger:failed"
        value["result"]["result_receipt_ref"] = None
        value["result"]["export"] = None
        value["result"]["page"] = None
        value["central_input"]["error_ref"] = "error:ledger:failed"
        value["central_input"]["ui_error"] = {"code": "internal_error", "reason": "Owner read failed"}
        self.assertIn("ui_error_without_cancellation", self.check(value))

    def test_replay_missing_originals(self):
        value = self.fresh("ledger_replay_preserves_original_export")
        value["central_input"]["original_effective_record_ids"] = None
        value["central_input"]["original_export_row_ids"] = None
        self.assertIn("replay_missing_original", self.check(value))

    def test_replay_missing_dispatch(self):
        value = self.fresh("ledger_replay_preserves_original_export")
        value["central_input"]["original_dispatch_id"] = None
        self.assertIn("replay_original_dispatch_missing", self.check(value))

    def test_replay_effective_changed(self):
        value = self.fresh("ledger_replay_preserves_original_export")
        value["central_input"]["original_effective_record_ids"] = ["rec:replay:002"]
        self.assertIn("replay_second_export", self.check(value))

    def test_application_scope_clean(self):
        value = self.fresh("ledger_refresh_cost_unknowns_last")
        value = self.sync_query(value, "scope_kind", "application")
        value = self.sync_query(value, "project_id", None)
        for row in value["recorded_rows"]:
            row["project_id"] = None
        value["central_input"]["owner_identity"]["scope_kind"] = "application"
        value["central_input"]["owner_identity"]["project_id"] = None
        self.assertEqual(self.check(value), [])

    def test_application_query_excludes_project_rows(self):
        value = self.fresh("ledger_refresh_cost_unknowns_last")
        value = self.sync_query(value, "scope_kind", "application")
        value = self.sync_query(value, "project_id", None)
        value["central_input"]["owner_identity"]["scope_kind"] = "application"
        value["central_input"]["owner_identity"]["project_id"] = None
        self.assertIn("nonconjunctive_match", self.check(value))

    def test_validator_does_not_mutate_input(self):
        value = self.fresh()
        frozen = deepcopy(value)
        m.usage_ledger_query_semantic_failures("ledger_query_fixture", value)
        self.assertEqual(value, frozen)


class LedgerBindingTests(unittest.TestCase):
    def test_registry_disposition_present_and_honest(self):
        registry = json.loads((STAGE / "Plans/storage_value_registry.json").read_text())
        rows = [row for row in registry["contract_family_dispositions"]
                if row["disposition_id"] == "scd.usage.ledger_query_transport.v1"]
        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row["persistence_disposition"], "request_or_preview_nonpersisted")
        self.assertEqual(row["physical_family_status"], "not_applicable_nonpersisted")
        self.assertEqual(row["existing_family_refs"], [])
        self.assertEqual(row["retention_disposition"]["mode"], "not_applicable_nonpersisted")
        self.assertEqual(row["retention_disposition"]["refs"], [])
        self.assertEqual(row["event_effect_policy"],
                         "receipt_only_no_eventrecord_pending_event_authority")
        self.assertFalse(row["runtime_evidence"])
        ids = [entry["disposition_id"] for entry in registry["contract_family_dispositions"]]
        self.assertEqual(len(ids), len(set(ids)))

    def test_catalog_notes_present_bindings_intact(self):
        commands = (STAGE / "Plans/Commands_System.md").read_text()
        catalog = (STAGE / "Plans/UI_Command_Catalog.md").read_text()
        wiring = json.loads((STAGE / "Plans/Wiring_Matrix.production.json").read_text())
        self.assertIn("usage_ledger_selection.v1", commands)
        self.assertIn("usage_ledger_selection.v1", catalog)
        self.assertIn("Plans/usage_command_contracts.schema.json#/$defs/usage_refresh_request",
                      commands)
        self.assertIn("Plans/usage_quota_command_contracts.schema.json#/$defs/usage_refresh_request",
                      catalog)
        self.assertNotIn("cmd.usage.ledger", commands + catalog)
        for text in (commands, catalog):
            self.assertIn("Plans/usage_ledger_query_contracts.schema.json#/$defs/ledger_request", text)
            self.assertIn("Plans/usage_ledger_query_contracts.schema.json#/$defs/ledger_result", text)
            self.assertIn("profile == usage_ledger_selection.v1", text)
        for key in ("catalog.usage_export", "catalog.usage_refresh"):
            row = wiring["entries"][key]
            joined = " ".join(row["acceptance_checks"]) + " " + " ".join(row["event_test_requirements"])
            self.assertIn("Plans/usage_ledger_query_contracts.schema.json#/$defs/ledger_request", joined)
            self.assertIn("Plans/usage_ledger_query_contracts.schema.json#/$defs/ledger_result", joined)
            self.assertIn("usage_ledger_selection.v1", joined)
            self.assertEqual(row["expected_event_types"], [])
            self.assertNotIn("remain unadmitted", joined)

    def test_candidate_file_set_is_exact(self):
        expected = {
            "Plans/usage_ledger_query_contracts.schema.json",
            "Plans/usage_ledger_query_contract_fixtures.json",
            "Plans/storage_value_registry.json",
            "Plans/Commands_System.md",
            "Plans/UI_Command_Catalog.md",
            "Plans/Wiring_Matrix.production.json",
            "Plans/Wiring_Matrix.schema.json",
            "scripts/pm_usage_ledger_query_semantics.py",
            "scripts/pm-new-contracts-verify.py",
            "scripts/pm-plans-verify.py",
            "scripts/pm_ui_command_response.py",
            "tests/test_pm_usage_ledger_query.py",
            "tests/test_pm_usage_central_response.py",
        }
        actual = {path.relative_to(STAGE).as_posix()
                  for path in STAGE.rglob("*") if path.is_file() and "__pycache__" not in path.parts}
        if INPUTS == STAGE:
            self.assertTrue(expected <= actual, expected - actual)
        else:
            self.assertEqual(actual, expected)


class LedgerWiringMachineBranchTests(unittest.TestCase):
    def test_branch_selected_by_profile_on_both_rows(self):
        for key in WIRING_ROW_IDS:
            with self.subTest(row=key):
                row = WIRING["entries"][key]
                branches = row.get("profile_schema_branches")
                self.assertIsInstance(branches, list)
                selected = [branch for branch in branches
                            if branch.get("profile") == LEDGER_PROFILE]
                self.assertEqual(len(selected), 1)
                self.assertEqual(selected[0]["request_schema_ref"], LEDGER_REQUEST_REF)
                self.assertEqual(selected[0]["result_schema_ref"], LEDGER_RESULT_REF)

    def test_branch_refs_resolve_to_ledger_defs_and_profile(self):
        for ref, name in ((LEDGER_REQUEST_REF, "ledger_request"),
                          (LEDGER_RESULT_REF, "ledger_result")):
            doc_rel, _, pointer = ref.partition("#")
            self.assertEqual(doc_rel, SCHEMA_REL)
            self.assertEqual(pointer, "/$defs/" + name)
            self.assertIn(name, SCHEMA["$defs"])
        query_ref = SCHEMA["$defs"]["ledger_request"]["properties"]["query"]["$ref"]
        query = SCHEMA["$defs"][query_ref.rsplit("/", 1)[-1]]
        self.assertEqual(query["properties"]["profile"]["const"], LEDGER_PROFILE)

    def test_v2_default_refs_and_row_identity_preserved(self):
        handlers = {"catalog.usage_refresh": "handlers::usage::refresh",
                    "catalog.usage_export": "handlers::usage::export"}
        selectors = {"catalog.usage_refresh": "state.commands.usage_refresh.availability",
                     "catalog.usage_export": "state.commands.usage_export.availability"}
        for key in WIRING_ROW_IDS:
            with self.subTest(row=key):
                row = WIRING["entries"][key]
                self.assertEqual(row["request_schema_ref"], V2_REFS[key][0])
                self.assertEqual(row["result_schema_ref"], V2_REFS[key][1])
                self.assertEqual(row["handler_location"], handlers[key])
                self.assertEqual(row["expected_event_types"], [])
                self.assertEqual(row["state_selector"], selectors[key])
        for key, row in WIRING["entries"].items():
            if key not in WIRING_ROW_IDS:
                self.assertNotIn("profile_schema_branches", row, key)

    def test_matrix_validates_against_extended_schema(self):
        Draft202012Validator.check_schema(WIRING_SCHEMA)
        self.assertEqual(list(Draft202012Validator(WIRING_SCHEMA).iter_errors(WIRING)), [])

    def test_schema_rejects_mutated_or_open_branch(self):
        mutated = deepcopy(WIRING)
        mutated["entries"]["catalog.usage_export"]["profile_schema_branches"][0]["result_schema_ref"] = \
            mutated["entries"]["catalog.usage_export"]["result_schema_ref"]
        self.assertTrue(list(Draft202012Validator(WIRING_SCHEMA).iter_errors(mutated)))
        recast = deepcopy(WIRING)
        recast["entries"]["catalog.usage_refresh"]["profile_schema_branches"][0]["request_schema_ref"] = \
            "Plans/usage_command_contracts.schema.json#/$defs/usage_refresh_request"
        self.assertTrue(list(Draft202012Validator(WIRING_SCHEMA).iter_errors(recast)))
        extra = deepcopy(WIRING)
        extra["entries"]["catalog.usage_refresh"]["profile_schema_branches"][0]["note"] = "free text"
        self.assertTrue(list(Draft202012Validator(WIRING_SCHEMA).iter_errors(extra)))
        second = deepcopy(WIRING)
        second["entries"]["catalog.usage_refresh"]["profile_schema_branches"].append(
            deepcopy(second["entries"]["catalog.usage_refresh"]["profile_schema_branches"][0]))
        self.assertTrue(list(Draft202012Validator(WIRING_SCHEMA).iter_errors(second)))


@unittest.skipUnless((INPUTS / "scripts").is_dir(),
                     "copied inputs tree with validator sibling imports is absent")
class LedgerWiringValidatorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pv = load_candidate_plans_verify()
        cls.entries = json.loads((STAGE / "Plans/Wiring_Matrix.production.json").read_text())["entries"]

    def test_validator_accepts_machine_branches(self):
        self.assertEqual(self.pv.validate_usage_ledger_wiring_branches(self.entries), [])
        self.assertEqual(self.pv.validate_usage_ledger_wiring_branches(self.entries, STAGE / "Plans"), [])

    def test_selector_dispatches_by_profile(self):
        row = self.entries["catalog.usage_export"]
        self.assertEqual(self.pv.select_usage_schema_branch(row, LEDGER_PROFILE),
                         (LEDGER_REQUEST_REF, LEDGER_RESULT_REF))
        self.assertEqual(self.pv.select_usage_schema_branch(row, "usage_quota_selection.v2"),
                         V2_REFS["catalog.usage_export"])
        self.assertIsNone(self.pv.select_usage_schema_branch(row, "usage_core_selection.v1"))
        self.assertIsNone(self.pv.select_usage_schema_branch(row, "usage_unknown_selection.v9"))
        bare = {key: value for key, value in row.items() if key != "profile_schema_branches"}
        self.assertIsNone(self.pv.select_usage_schema_branch(bare, LEDGER_PROFILE))
        self.assertEqual(self.pv.select_usage_schema_branch(bare, "usage_quota_selection.v2"),
                         V2_REFS["catalog.usage_export"])
        self.assertIsNone(self.pv.select_usage_schema_branch(bare, "usage_core_selection.v1"))
        self.assertIsNone(self.pv.select_usage_schema_branch(bare, "usage_unknown_selection.v9"))

    def test_validator_rejects_missing_branch(self):
        entries = deepcopy(self.entries)
        del entries["catalog.usage_refresh"]["profile_schema_branches"]
        failures = self.pv.validate_usage_ledger_wiring_branches(entries)
        self.assertEqual([(failure["entry_id"], failure["error"]) for failure in failures],
                         [("catalog.usage_refresh", "usage_ledger_wiring_branch_missing")])

    def test_validator_rejects_mutated_pair(self):
        mutated = deepcopy(self.entries)
        mutated["catalog.usage_export"]["profile_schema_branches"][0]["result_schema_ref"] = \
            V2_REFS["catalog.usage_export"][1]
        failures = self.pv.validate_usage_ledger_wiring_branches(mutated)
        self.assertEqual([(failure["entry_id"], failure["error"]) for failure in failures],
                         [("catalog.usage_export", "usage_ledger_wiring_branch_mismatch")])
        recast = deepcopy(self.entries)
        recast["catalog.usage_refresh"]["profile_schema_branches"][0]["request_schema_ref"] = \
            "Plans/usage_command_contracts.schema.json#/$defs/usage_refresh_request"
        failures = self.pv.validate_usage_ledger_wiring_branches(recast)
        self.assertEqual([(failure["entry_id"], failure["error"]) for failure in failures],
                         [("catalog.usage_refresh", "usage_ledger_wiring_branch_mismatch")])
        profile_swap = deepcopy(self.entries)
        profile_swap["catalog.usage_refresh"]["profile_schema_branches"][0]["profile"] = \
            "usage_quota_selection.v2"
        failures = self.pv.validate_usage_ledger_wiring_branches(profile_swap)
        self.assertEqual([(failure["entry_id"], failure["error"]) for failure in failures],
                         [("catalog.usage_refresh", "usage_ledger_wiring_branch_mismatch")])

    def test_validator_rejects_foreign_row_branch(self):
        entries = deepcopy(self.entries)
        entries["catalog.widget_add"]["profile_schema_branches"] = \
            deepcopy(entries["catalog.usage_export"]["profile_schema_branches"])
        failures = self.pv.validate_usage_ledger_wiring_branches(entries)
        self.assertEqual([(failure["entry_id"], failure["error"]) for failure in failures],
                         [("catalog.widget_add", "usage_ledger_wiring_branch_unexpected_row")])

    def test_validator_resolves_refs_and_profile_predicate(self):
        with tempfile.TemporaryDirectory(prefix="usage-ledger-missing-ref-") as absent_plans:
            failures = self.pv.validate_usage_ledger_wiring_branches(self.entries, Path(absent_plans))
        self.assertEqual([(failure["entry_id"], failure["error"]) for failure in failures],
                         [("catalog.usage_refresh", "usage_ledger_wiring_branch_unresolvable_ref")])
        if (INPUTS / SCHEMA_REL).is_file():
            self.assertEqual(self.pv.validate_usage_ledger_wiring_branches(self.entries, INPUTS / "Plans"), [])
        self.assertEqual(self.pv.ledger_branch_schema_failures(SCHEMA), [])
        profile_mutated = deepcopy(SCHEMA)
        profile_mutated["$defs"]["ledger_query"]["properties"]["profile"]["const"] = \
            "usage_quota_selection.v2"
        self.assertEqual(self.pv.ledger_branch_schema_failures(profile_mutated),
                         ["usage_ledger_wiring_branch_profile_mismatch"])
        dropped = deepcopy(SCHEMA)
        del dropped["$defs"]["ledger_result"]
        self.assertEqual(self.pv.ledger_branch_schema_failures(dropped),
                         ["usage_ledger_wiring_branch_unresolvable_ref"])


if __name__ == "__main__":
    unittest.main()
