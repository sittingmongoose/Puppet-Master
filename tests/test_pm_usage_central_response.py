"""Actual central composition for cmd.usage.refresh/export; no surrogate marker.

Exercises candidate/scripts/pm_ui_command_response.py against isolated
ordinary copies of the direct contract JSON and Python inputs (actual
ui_command_response, shared_runtime_command_contracts, full_thread, and
v1/v2 usage owner grammar), not a stand-in registry or nested evidence.
"""
from copy import deepcopy
import importlib.util
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

STAGE = Path(__file__).resolve().parents[1]
DETACHED_INPUTS = STAGE.parent / "inputs"
INPUTS = Path(os.environ.get("PM_DETACHED_INPUTS", str(DETACHED_INPUTS if DETACHED_INPUTS.is_dir() else STAGE)))
sys.path.insert(0, str(INPUTS / "scripts"))

def load_candidate_central():
    spec = importlib.util.spec_from_file_location(
        "candidate_ui_command_response", STAGE / "scripts/pm_ui_command_response.py")
    mod = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = mod
    spec.loader.exec_module(mod)
    mod.ROOT = INPUTS
    mod.schema.cache_clear()
    mod.registry.cache_clear()
    mod.module.cache_clear()
    return mod

U = load_candidate_central()
V1 = json.loads((INPUTS / "Plans/usage_command_contract_fixtures.json").read_text())
V2 = json.loads((INPUTS / "Plans/usage_quota_command_fixtures.json").read_text())


def bundle_from_usage_fixture(value):
    req, out, resp, res = (value["request"], value["outcome"], value["response"], value["result"])
    normalized = {
        "request_ref": req["request_ref"],
        "command_id": req["command_id"],
        "command_instance_id": req["command_instance_id"],
        "operation_id": req["identity"]["operation_id"],
        "owner_identity": deepcopy(req["identity"]),
        "payload_sha256": out["payload_sha256"],
        "idempotency_key": req["idempotency_key"],
        "target_generation": req["identity"]["operation_generation"],
        "dispatch_frame_id": out["dispatch_frame_id"],
    }
    return {
        "response": deepcopy(resp),
        "normalized_request": normalized,
        "outcome": deepcopy(out),
        "owner_result": deepcopy(res),
        "owner_request": deepcopy(req),
        "resolved_outcome_ref": resp["command_outcome_ref"],
        "resolved_owner_result_ref": resp["owner_result_ref"],
    }


def repin(bundle):
    bundle["outcome"]["owner_result_sha256"] = U.owner_result_digest(bundle["owner_result"])


LEDGER_BINDING = {"path": "Plans/usage_ledger_query_contracts.schema.json",
                  "json_pointer": "#/$defs/ledger_result",
                  "schema_id": "pm.usage.ledger_query.result.v1"}


def build_overlay():
    """Copy only direct contract JSON and Python inputs, never nested evidence."""
    overlay = Path(tempfile.mkdtemp(prefix="ledger-central-overlay-"))
    root = overlay / "inputs-copy"
    try:
        for source_tree in (INPUTS, STAGE):
            for rel, pattern in (("Plans", "*.json"), ("scripts", "*.py")):
                target_dir = root / rel
                target_dir.mkdir(parents=True, exist_ok=True)
                for source in (source_tree / rel).glob(pattern):
                    if source.is_symlink():
                        raise ValueError(f"overlay input must be an ordinary file: {source}")
                    if source.is_file():
                        shutil.copy2(source, target_dir / source.name)
        return root
    except BaseException:
        shutil.rmtree(overlay)
        raise


def teardown_overlay(root):
    shutil.rmtree(root.parent)


def load_overlay_central(root):
    spec = importlib.util.spec_from_file_location(
        "candidate_ui_command_response_overlay", root / "scripts/pm_ui_command_response.py")
    mod = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = mod
    spec.loader.exec_module(mod)
    mod.ROOT = root
    base_module = mod.module
    inputs_module = U.module

    def module_with_inputs_readiness(name, filename):
        # The canonical-JSON oracle is path-guarded to one loaded copy;
        # reuse the inputs copy (byte-identical file) instead of re-exec.
        if filename == "pm-implementation-readiness.py":
            return inputs_module(name, filename)
        return base_module(name, filename)

    mod.module = module_with_inputs_readiness
    mod.schema.cache_clear()
    mod.registry.cache_clear()
    base_module.cache_clear()
    return mod


def repin_ledger(mod, bundle):
    bundle["outcome"]["payload_sha256"] = mod.owner_result_digest(bundle["owner_request"])
    bundle["outcome"]["owner_result_sha256"] = mod.owner_result_digest(bundle["owner_result"])


def bundle_from_ledger_fixture(mod, value):
    """Response/outcome envelope around an original ledger request/result.

    The envelope reuses the actual v1 response/outcome record shapes; only the
    usage-typed identities and digests are re-pinned to the ledger selection.
    """
    request, result = deepcopy(value["request"]), deepcopy(value["result"])
    query = request["query"]
    template = deepcopy(V1["valid"][0 if request["command_id"] == "cmd.usage.export" else 1]["value"])
    operation_id = "operation:" + request["command_instance_id"].split(":", 1)[1]
    identity = deepcopy(template["response"]["owner_identity"])
    identity.update({"scope_kind": query["scope_kind"], "operation_id": operation_id,
                     "operation_generation": 1,
                     "command_instance_id": request["command_instance_id"],
                     "server_id": query["server_id"], "project_id": query["project_id"]})
    # The response schema requires a receipt ref for terminal cancelled
    # envelopes; the owner result itself carries no receipt when cancelled.
    receipt = (result["result_receipt_ref"] if result["status"] == "succeeded"
               else template["response"]["receipt_ref"] if result["status"] == "cancelled" else None)
    response = deepcopy(template["response"])
    response.update({"request_ref": request["request_ref"], "command_id": request["command_id"],
                     "command_instance_id": request["command_instance_id"],
                     "operation_id": operation_id, "owner_identity": deepcopy(identity),
                     "owner_result_schema_ref": deepcopy(LEDGER_BINDING),
                     "ack_status": "accepted",
                     "result_status": result["status"], "error": None,
                     "receipt_ref": receipt})
    outcome = deepcopy(template["outcome"])
    outcome.update({"identity": deepcopy(identity), "command_id": request["command_id"],
                    "idempotency_key": request["idempotency_key"], "target_generation": 1,
                    "outcome": result["status"], "error_ref": result["error_ref"],
                    "result_receipt_ref": receipt,
                    "owner_result_schema_ref": deepcopy(LEDGER_BINDING)})
    bundle = {"response": response,
              "normalized_request": {
                  "request_ref": request["request_ref"], "command_id": request["command_id"],
                  "command_instance_id": request["command_instance_id"],
                  "operation_id": operation_id, "owner_identity": deepcopy(identity),
                  "payload_sha256": None, "idempotency_key": request["idempotency_key"],
                  "target_generation": 1, "dispatch_frame_id": outcome["dispatch_frame_id"]},
              "outcome": outcome, "owner_result": result, "owner_request": request,
              "resolved_outcome_ref": response["command_outcome_ref"],
              "resolved_owner_result_ref": response["owner_result_ref"]}
    repin_ledger(mod, bundle)
    bundle["normalized_request"]["payload_sha256"] = bundle["outcome"]["payload_sha256"]
    return bundle


class UsageCentralPositiveTests(unittest.TestCase):
    def test_v1_export_and_refresh_pass(self):
        for row in V1["valid"]:
            with self.subTest(fixture=row["name"]):
                self.assertEqual(U.response_bundle_failures(bundle_from_usage_fixture(row["value"])), [])

    def test_v2_quota_export_and_refresh_pass(self):
        for row in V2["valid"]:
            with self.subTest(fixture=row["name"]):
                self.assertEqual(U.response_bundle_failures(bundle_from_usage_fixture(row["value"])), [])

    def test_cancelled_keeps_nullable_ui_error(self):
        base = deepcopy(V1["valid"][1]["value"])
        base["result"]["status"] = "cancelled"
        base["result"]["projection"] = deepcopy(base["before"])
        base["result"]["route_outcomes"][0]["status"] = "cancelled"
        base["outcome"]["outcome"] = "cancelled"
        base["response"]["result_status"] = "cancelled"
        base["outcome"]["payload_sha256"] = U.owner_result_digest(base["request"])
        base["outcome"]["owner_result_sha256"] = U.owner_result_digest(base["result"])
        bundle = bundle_from_usage_fixture(base)
        self.assertIsNone(bundle["response"]["error"])
        self.assertEqual(U.response_bundle_failures(bundle), [])

    def test_replay_preserves_original_result_identity(self):
        base = deepcopy(V1["valid"][0]["value"])
        original = deepcopy(base["response"])
        base["response"].update(replayed=True, original_dispatch_id=original["dispatch_id"],
                                dispatch_id="dispatch:replay:1")
        bundle = bundle_from_usage_fixture(base)
        bundle["original_response"] = original
        self.assertEqual(U.response_bundle_failures(bundle), [])


class UsageCentralNegativeTests(unittest.TestCase):
    def fresh_export(self):
        return bundle_from_usage_fixture(deepcopy(V1["valid"][0]["value"]))

    def fresh_refresh(self):
        return bundle_from_usage_fixture(deepcopy(V1["valid"][1]["value"]))

    def test_missing_owner_request_refuses(self):
        bundle = self.fresh_export()
        del bundle["owner_request"]
        self.assertIn("usage_owner_request_missing", U.response_bundle_failures(bundle))

    def test_original_typed_selection_preserved(self):
        bundle = self.fresh_export()
        bundle["owner_result"]["request"]["query"]["time_range"] = "24h"
        repin(bundle)
        self.assertIn("usage_original_request_mismatch", U.response_bundle_failures(bundle))

    def test_caller_context_independent(self):
        bundle = self.fresh_export()
        bundle["owner_result"]["caller"]["caller_revision"] = "rev:rogue"
        repin(bundle)
        self.assertIn("usage_caller_substitution", U.response_bundle_failures(bundle))

    def test_current_panel_substitution_refused(self):
        bundle = self.fresh_export()
        bundle["current_panel_context_ref"] = bundle["owner_request"]["caller"]["caller_context_ref"]
        self.assertIn("usage_current_panel_substitution", U.response_bundle_failures(bundle))

    def test_actual_owner_error_ref_preserved(self):
        bundle = self.fresh_export()
        bundle["outcome"]["error_ref"] = "error:rogue"
        self.assertIn("usage_owner_error_ref_mismatch", U.response_bundle_failures(bundle))

    def test_failed_without_owner_error_refused(self):
        base = deepcopy(V1["valid"][1]["value"])
        base["result"]["status"] = "failed"
        base["result"]["projection"] = deepcopy(base["before"])
        base["result"]["route_outcomes"][0]["status"] = "failed"
        base["result"]["error_ref"] = None
        base["outcome"]["outcome"] = "failed"
        base["outcome"]["error_ref"] = "error:owner:failed"
        base["response"]["result_status"] = "failed"
        base["response"]["error"] = {"code": "internal_error", "reason": "Owner read failed", "offending_field": None}
        base["response"]["receipt_ref"] = None
        base["outcome"]["result_receipt_ref"] = None
        base["outcome"]["payload_sha256"] = U.owner_result_digest(base["request"])
        base["outcome"]["owner_result_sha256"] = U.owner_result_digest(base["result"])
        bundle = bundle_from_usage_fixture(base)
        # Owner result lacks the error ref while outcome/UI claim failure.
        failures = U.response_bundle_failures(bundle)
        self.assertIn("usage_failed_error_ref_missing", failures)
        self.assertIn("usage_owner_error_ref_mismatch", failures)

    def test_export_selection_and_scope_preserved(self):
        bundle = self.fresh_export()
        bundle["owner_result"]["output"]["view"]["query"]["time_range"] = "24h"
        repin(bundle)
        self.assertIn("usage_export_selection_mismatch", U.response_bundle_failures(bundle))
        bundle = self.fresh_export()
        bundle["owner_result"]["output"]["view"]["export_scope"] = "snapshot"
        repin(bundle)
        self.assertIn("usage_export_scope_mismatch", U.response_bundle_failures(bundle))

    def test_export_rejects_route_effects(self):
        bundle = self.fresh_export()
        bundle["owner_result"]["route_outcomes"] = [{"route_ref": "route:rogue", "status": "completed"}]
        repin(bundle)
        # Export result shape already forbids route outcomes (maxItems 0);
        # central refuses at the schema gate before the semantic check.
        self.assertIn("owner_result_schema", U.response_bundle_failures(bundle))

    def test_refresh_route_selection_preserved(self):
        bundle = self.fresh_refresh()
        bundle["owner_result"]["route_outcomes"] = []
        repin(bundle)
        self.assertIn("usage_refresh_route_selection", U.response_bundle_failures(bundle))

    def test_refresh_rejects_export_output(self):
        bundle = self.fresh_refresh()
        bundle["owner_result"]["output"] = deepcopy(self.fresh_export()["owner_result"]["output"])
        repin(bundle)
        # Refresh result shape already requires output null; central refuses
        # at the schema gate before the semantic check.
        failures = U.response_bundle_failures(bundle)
        self.assertIn("owner_result_schema", failures)

    def test_wrong_result_pointer_refused(self):
        bundle = self.fresh_export()
        bundle["response"]["owner_result_schema_ref"]["json_pointer"] = "#/$defs/usage_refresh_result"
        bundle["outcome"]["owner_result_schema_ref"]["json_pointer"] = "#/$defs/usage_refresh_result"
        failures = U.response_bundle_failures(bundle)
        self.assertIn("usage_owner_binding", failures)

    def test_replay_without_original_refuses(self):
        bundle = self.fresh_export()
        bundle["response"].update(replayed=True, original_dispatch_id="dispatch:original",
                                  dispatch_id="dispatch:replay:2")
        self.assertIn("replay_original_response_missing", U.response_bundle_failures(bundle))

    def test_replay_changing_identity_refuses(self):
        base = deepcopy(V1["valid"][0]["value"])
        original = deepcopy(base["response"])
        base["response"].update(replayed=True, original_dispatch_id=original["dispatch_id"],
                                dispatch_id="dispatch:replay:3")
        base["response"]["owner_result_ref"] = "fixture:rogue"
        bundle = bundle_from_usage_fixture(base)
        bundle["original_response"] = original
        self.assertIn("replay_changed_original_result_identity", U.response_bundle_failures(bundle))

    def test_usage_cannot_hide_as_local_projection(self):
        bundle = self.fresh_export()
        bundle["response"]["response_kind"] = "local_projection"
        bundle["response"]["operation_id"] = None
        bundle["response"]["owner_identity"] = None
        bundle["response"]["command_outcome_ref"] = None
        bundle["response"]["owner_result_ref"] = None
        bundle["response"]["owner_result_schema_ref"] = None
        bundle["response"]["event_refs"] = []
        bundle["response"]["result_status"] = "succeeded"
        bundle["response"]["receipt_ref"] = "receipt:local"
        bundle["outcome"] = None
        bundle["owner_result"] = None
        bundle["normalized_request"]["operation_id"] = None
        bundle["normalized_request"]["owner_identity"] = None
        self.assertIn("durable_command_disguised_as_local_projection", U.response_bundle_failures(bundle))

    def test_central_helper_does_not_mutate_bundle(self):
        bundle = self.fresh_export()
        frozen = deepcopy(bundle)
        U.response_bundle_failures(bundle)
        self.assertEqual(bundle, frozen)


class LedgerOverlayTests(unittest.TestCase):
    """Ledger-profile branch through the real central join (overlay ROOT)."""

    @classmethod
    def setUpClass(cls):
        cls.overlay = build_overlay()
        try:
            cls.ul = load_overlay_central(cls.overlay)
            ledger = json.loads((STAGE / "Plans/usage_ledger_query_contract_fixtures.json").read_text())
            cls.cases = {case["name"]: case["value"] for case in ledger["valid"]}
        except BaseException:
            teardown_overlay(cls.overlay)
            raise

    @classmethod
    def tearDownClass(cls):
        teardown_overlay(cls.overlay)

    def bundle(self, name):
        return bundle_from_ledger_fixture(self.ul, self.cases[name])

    def repin(self, bundle):
        repin_ledger(self.ul, bundle)


class LedgerCentralPositiveTests(LedgerOverlayTests):
    def test_filtered_export_passes(self):
        self.assertEqual(self.ul.response_bundle_failures(
            self.bundle("ledger_filtered_time_newest_first")), [])

    def test_selected_export_passes(self):
        self.assertEqual(self.ul.response_bundle_failures(
            self.bundle("ledger_selected_tokens_search")), [])

    def test_refresh_passes(self):
        self.assertEqual(self.ul.response_bundle_failures(
            self.bundle("ledger_refresh_cost_unknowns_last")), [])

    def test_reverse_refresh_passes(self):
        self.assertEqual(self.ul.response_bundle_failures(
            self.bundle("ledger_refresh_cost_oldest_first")), [])

    def test_cancelled_keeps_nullable_ui_error(self):
        bundle = self.bundle("ledger_cancelled_nullable_ui_error")
        self.assertIsNone(bundle["response"]["error"])
        self.assertEqual(self.ul.response_bundle_failures(bundle), [])

    def test_replay_preserves_original_result_identity(self):
        bundle = self.bundle("ledger_replay_preserves_original_export")
        original = deepcopy(bundle["response"])
        bundle["response"].update(replayed=True, original_dispatch_id=original["dispatch_id"],
                                  dispatch_id="dispatch:ledger:replay:1")
        bundle["original_response"] = original
        self.assertEqual(self.ul.response_bundle_failures(bundle), [])


class LedgerCentralNegativeTests(LedgerOverlayTests):
    def test_missing_owner_request_refuses(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        del bundle["owner_request"]
        self.assertIn("usage_owner_request_missing", self.ul.response_bundle_failures(bundle))

    def test_mutated_selected_query_refuses(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["owner_result"]["applied_query"]["filters"] = {"provider_ids": ["provider:foreign"]}
        self.repin(bundle)
        failures = self.ul.response_bundle_failures(bundle)
        self.assertIn("usage_ledger_applied_query_mismatch", failures)

    def test_mutated_sort_and_search_refuse(self):
        bundle = self.bundle("ledger_selected_tokens_search")
        bundle["owner_result"]["applied_query"]["sort"] = {
            "key": "cost", "order": "oldest_or_smallest_first",
            "unknown_values": "last", "tie_break": "stable_record_identity"}
        self.repin(bundle)
        self.assertIn("usage_ledger_applied_query_mismatch", self.ul.response_bundle_failures(bundle))
        bundle = self.bundle("ledger_selected_tokens_search")
        bundle["owner_result"]["applied_query"]["search"] = {
            "text": "rogue", "scope": "displayed_labels_and_identifiers",
            "pattern_kind": "literal_substring"}
        self.repin(bundle)
        self.assertIn("usage_ledger_applied_query_mismatch", self.ul.response_bundle_failures(bundle))

    def test_original_typed_request_preserved(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["owner_result"]["request"]["query"]["time_range"] = "24h"
        self.repin(bundle)
        self.assertIn("usage_original_request_mismatch", self.ul.response_bundle_failures(bundle))

    def test_export_mode_mismatch_refuses(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["owner_result"]["export"]["mode"] = "selected"
        self.repin(bundle)
        self.assertIn("usage_export_mode_mismatch", self.ul.response_bundle_failures(bundle))

    def test_stale_revision_refuses(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["owner_result"]["applied_query"]["owner_revision"] = "rev:stale"
        self.repin(bundle)
        failures = self.ul.response_bundle_failures(bundle)
        self.assertIn("usage_ledger_stale_revision", failures)
        self.assertIn("usage_ledger_stale_currentness", failures)

    def test_result_caller_rewrite_refuses(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["owner_result"]["caller"]["caller_revision"] = "rev:rogue"
        self.repin(bundle)
        self.assertIn("usage_caller_substitution", self.ul.response_bundle_failures(bundle))

    def test_current_panel_substitution_refused(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["current_panel_context_ref"] = bundle["owner_request"]["caller"]["caller_context_ref"]
        self.assertIn("usage_current_panel_substitution", self.ul.response_bundle_failures(bundle))

    def test_viewport_limited_filtered_export_refuses(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        export = bundle["owner_result"]["export"]
        export["rows"] = export["rows"][:export["drawn_viewport_row_count"]]
        self.repin(bundle)
        failures = self.ul.response_bundle_failures(bundle)
        self.assertIn("usage_export_filtered_truncated", failures)
        self.assertIn("usage_export_viewport_dump", failures)

    def test_selected_missing_and_extra_ids_refuse(self):
        bundle = self.bundle("ledger_selected_tokens_search")
        bundle["owner_result"]["export"]["rows"] = bundle["owner_result"]["export"]["rows"][:1]
        self.repin(bundle)
        self.assertIn("usage_export_selected_identity", self.ul.response_bundle_failures(bundle))
        bundle = self.bundle("ledger_selected_tokens_search")
        bundle["owner_result"]["export"]["rows"].append(
            deepcopy(bundle["owner_result"]["export"]["rows"][0]))
        self.repin(bundle)
        self.assertIn("usage_export_selected_identity", self.ul.response_bundle_failures(bundle))

    def test_quota_row_cannot_masquerade_as_ledger(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["owner_result"]["export"]["rows"][0]["row_kind"] = "quota_only"
        self.repin(bundle)
        self.assertIn("owner_result_schema", self.ul.response_bundle_failures(bundle))

    def test_refresh_with_export_output_refuses(self):
        bundle = self.bundle("ledger_refresh_cost_unknowns_last")
        donor = self.bundle("ledger_filtered_time_newest_first")
        bundle["owner_result"]["export"] = deepcopy(donor["owner_result"]["export"])
        self.repin(bundle)
        failures = self.ul.response_bundle_failures(bundle)
        self.assertIn("usage_refresh_export_effect", failures)
        self.assertIn("usage_export_mode_mismatch", failures)

    def test_export_success_without_output_refuses(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["owner_result"]["export"] = None
        self.repin(bundle)
        self.assertIn("usage_export_no_output", self.ul.response_bundle_failures(bundle))

    def test_failed_without_owner_error_refuses(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["owner_result"]["status"] = "failed"
        bundle["owner_result"]["error_ref"] = None
        bundle["owner_result"]["result_receipt_ref"] = None
        bundle["owner_result"]["export"] = None
        bundle["outcome"]["outcome"] = "failed"
        bundle["outcome"]["error_ref"] = "error:owner:failed"
        bundle["outcome"]["result_receipt_ref"] = None
        bundle["response"]["result_status"] = "failed"
        bundle["response"]["receipt_ref"] = None
        bundle["response"]["error"] = {"code": "internal_error", "reason": "Owner read failed",
                                       "offending_field": None}
        self.repin(bundle)
        failures = self.ul.response_bundle_failures(bundle)
        self.assertIn("usage_failed_error_ref_missing", failures)
        self.assertIn("usage_owner_error_ref_mismatch", failures)

    def test_cancelled_with_ui_error_refused_at_schema_gate(self):
        bundle = self.bundle("ledger_cancelled_nullable_ui_error")
        bundle["response"]["error"] = {"code": "internal_error", "reason": "spurious",
                                       "offending_field": None}
        # The response schema already requires a null UI error for
        # cancelled envelopes; central refuses before the semantic check.
        self.assertIn("response_schema", self.ul.response_bundle_failures(bundle))

    def test_scope_and_instance_bound_to_operation(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        for identity in (bundle["response"]["owner_identity"], bundle["outcome"]["identity"],
                         bundle["normalized_request"]["owner_identity"]):
            identity["server_id"] = "server:foreign"
        self.assertIn("usage_owner_scope_mismatch", self.ul.response_bundle_failures(bundle))
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["outcome"]["idempotency_key"] = "idem:rogue"
        failures = self.ul.response_bundle_failures(bundle)
        self.assertIn("usage_owner_idempotency_mismatch", failures)
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["outcome"]["payload_sha256"] = "0" * 64
        failures = self.ul.response_bundle_failures(bundle)
        self.assertIn("usage_owner_payload_mismatch", failures)

    def test_silent_fallback_to_v1_refuses(self):
        bundle = bundle_from_usage_fixture(deepcopy(V1["valid"][0]["value"]))
        bundle["owner_request"] = deepcopy(self.cases["ledger_filtered_time_newest_first"]["request"])
        self.assertIn("usage_owner_request_schema", self.ul.response_bundle_failures(bundle))

    def test_v1_request_cannot_carry_ledger_result(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["owner_request"] = deepcopy(V1["valid"][0]["value"]["request"])
        self.assertIn("usage_owner_request_schema", self.ul.response_bundle_failures(bundle))

    def test_v1_query_cannot_silently_drop_ledger_filters(self):
        request = deepcopy(V1["valid"][0]["value"]["request"])
        request["query"]["additional_ledger_filters"] = [{"axis": "model_ids", "values": ["model:beta"]}]
        self.assertTrue(self.ul.structural_failures(
            "Plans/usage_command_contracts.schema.json", request, "#/$defs/usage_export_request"))

    def test_wrong_result_pointer_refused(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["response"]["owner_result_schema_ref"]["json_pointer"] = "#/$defs/ledger_request"
        bundle["outcome"]["owner_result_schema_ref"]["json_pointer"] = "#/$defs/ledger_request"
        self.assertIn("usage_owner_binding", self.ul.response_bundle_failures(bundle))

    def test_exact_ledger_binding_branch(self):
        binding = {"path": "Plans/usage_ledger_query_contracts.schema.json",
                   "json_pointer": "#/$defs/ledger_result",
                   "schema_id": "pm.usage.ledger_query.result.v1"}
        self.assertTrue(self.ul.usage_binding_allowed("cmd.usage.refresh", binding))
        self.assertTrue(self.ul.usage_binding_allowed("cmd.usage.export", binding))
        self.assertIn("pm.usage.ledger_query.result.v1", self.ul.USAGE_SCHEMA_IDS)
        self.assertIn("pm.usage.ledger_query.request.v1", self.ul.USAGE_REQUEST_SCHEMA_IDS)
        self.assertFalse(self.ul.usage_binding_allowed(
            "cmd.usage.export", {**binding, "json_pointer": "#/$defs/ledger_request"}))

    def test_replay_without_original_refuses(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["response"].update(replayed=True, original_dispatch_id="dispatch:original",
                                  dispatch_id="dispatch:ledger:replay:2")
        self.assertIn("replay_original_response_missing", self.ul.response_bundle_failures(bundle))

    def test_replay_changing_identity_refuses(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        original = deepcopy(bundle["response"])
        bundle["response"].update(replayed=True, original_dispatch_id=original["dispatch_id"],
                                  dispatch_id="dispatch:ledger:replay:3")
        bundle["response"]["owner_result_ref"] = "fixture:rogue"
        bundle["original_response"] = original
        self.assertIn("replay_changed_original_result_identity",
                      self.ul.response_bundle_failures(bundle))

    def test_ledger_cannot_hide_as_local_projection(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        bundle["response"]["response_kind"] = "local_projection"
        bundle["response"]["operation_id"] = None
        bundle["response"]["owner_identity"] = None
        bundle["response"]["command_outcome_ref"] = None
        bundle["response"]["owner_result_ref"] = None
        bundle["response"]["owner_result_schema_ref"] = None
        bundle["response"]["event_refs"] = []
        bundle["response"]["result_status"] = "succeeded"
        bundle["response"]["receipt_ref"] = "receipt:local"
        bundle["outcome"] = None
        bundle["owner_result"] = None
        bundle["normalized_request"]["operation_id"] = None
        bundle["normalized_request"]["owner_identity"] = None
        self.assertIn("durable_command_disguised_as_local_projection",
                      self.ul.response_bundle_failures(bundle))

    def test_central_helper_does_not_mutate_bundle(self):
        bundle = self.bundle("ledger_filtered_time_newest_first")
        frozen = deepcopy(bundle)
        self.ul.response_bundle_failures(bundle)
        self.assertEqual(bundle, frozen)


if __name__ == "__main__":
    unittest.main()
