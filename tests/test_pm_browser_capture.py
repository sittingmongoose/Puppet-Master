"""Static companion regressions for the eight Browser capture/DevTools routes.

Schema/fixture consistency only: no browser, dispatcher, handler, permission,
storage, or runtime authority runs here. Every route stays handler_unavailable.
"""
import copy
import ast
import hashlib
import json
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_browser_capture_semantics import (
    apply_patch,
    browser_capture_semantic_failures,
    live_central_checks,
    live_inventory_checks,
    owner_result_digest,
    rfc8785_canonical_bytes,
    structural_errors,
    validate_tree,
)

COMMANDS = (
    "cmd.browser.capture.full_to_chat",
    "cmd.browser.capture.region_to_chat",
    "cmd.browser.component.pick",
    "cmd.browser.component.send_now",
    "cmd.browser.component.add_to_composer",
    "cmd.browser.component.insert_at_cursor",
    "cmd.browser.component.mode.set_default",
    "cmd.browser.devtools.open",
)
HANDLERS = {
    "cmd.browser.capture.full_to_chat": "handlers::browser_runtime::capture_full_to_chat",
    "cmd.browser.capture.region_to_chat": "handlers::browser_runtime::capture_region_to_chat",
    "cmd.browser.component.pick": "handlers::browser_runtime::component_pick",
    "cmd.browser.component.send_now": "handlers::browser_runtime::component_send_now",
    "cmd.browser.component.add_to_composer": "handlers::browser_runtime::component_add_to_composer",
    "cmd.browser.component.insert_at_cursor": "handlers::browser_runtime::component_insert_at_cursor",
    "cmd.browser.component.mode.set_default": "handlers::browser_runtime::component_mode_set_default",
    "cmd.browser.devtools.open": "handlers::browser_runtime::devtools_open",
}
PAIRS = {
    "cmd.browser.capture.full_to_chat": ("BrowserCaptureFullRequest", "BrowserCaptureResult"),
    "cmd.browser.capture.region_to_chat": ("BrowserCaptureRegionRequest", "BrowserCaptureResult"),
    "cmd.browser.component.pick": ("BrowserComponentPickRequest", "BrowserComponentPickResult"),
    "cmd.browser.component.send_now": ("BrowserComponentSendRequest", "MessageAdmissionResult"),
    "cmd.browser.component.add_to_composer": ("BrowserComponentComposerRequest", "ComposerBufferResult"),
    "cmd.browser.component.insert_at_cursor": ("BrowserComponentComposerRequest", "ComposerBufferResult"),
    "cmd.browser.component.mode.set_default": ("BrowserComponentModeRequest", "SettingsTransactionResult"),
    "cmd.browser.devtools.open": ("BrowserDevToolsOpenRequest", "RouteResult"),
}


class BrowserCaptureCompanion(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures = json.loads((ROOT / "Plans/browser_capture_contract_fixtures.json").read_text())
        cls.cases = {row["name"]: row for row in cls.fixtures["valid"]}

    def case(self, name="send_now_fresh_admitted"):
        return copy.deepcopy(self.cases[name]["value"])

    def test_authored_pair(self):
        for row in self.fixtures["valid"]:
            with self.subTest(case=row["name"]):
                self.assertEqual([], structural_errors(row["definition"], row["value"]))
                self.assertEqual([], browser_capture_semantic_failures(row["definition"], row["value"]))
        self.assertGreaterEqual(len(self.fixtures["valid"]), 8)
        for row in self.fixtures["invalid"]:
            mutated = apply_patch(self.case(row["base_valid"]), row["patch"])
            definition = row.get("definition", self.cases[row["base_valid"]]["definition"])
            with self.subTest(case=row["name"]):
                errors = structural_errors(definition, mutated)
                if "semantic_rule" in row:
                    self.assertEqual([], errors)
                    self.assertIn(row["semantic_rule"],
                                  browser_capture_semantic_failures(definition, mutated))
                else:
                    self.assertTrue(errors)

    def test_all_eight_routes_have_positive_coverage(self):
        covered = {row["value"]["command_id"] for row in self.fixtures["valid"]
                   if not browser_capture_semantic_failures(row["definition"], row["value"])}
        for command in COMMANDS:
            with self.subTest(command=command):
                self.assertIn(command, covered)

    def test_timestamp_recency_never_declares_fresh(self):
        value = self.case()
        value["request"]["captured"]["captured_at"] = "2026-09-25T12:00:00Z"
        value["current"]["current_subject"]["page_generation"] = 8
        failures = browser_capture_semantic_failures("browser_capture_response_case", value)
        self.assertIn("J_REVALIDATE", failures)
        self.assertNotIn("admitted_isolated", [value["result"]["outcome"]] if "J_REVALIDATE" not in failures else [])

    def test_stale_matrix_zero_multi_destroyed_identity_source(self):
        for patch in ({"current.locator_match_count": 0},
                      {"current.locator_match_count": 2},
                      {"current.page_destroyed": True},
                      {"current.matched_component_id": "comp:other:999"},
                      {"current.matched_source.source_identity_hash": "f" * 64}):
            mutated = apply_patch(self.case(), patch)
            with self.subTest(patch=patch):
                self.assertEqual([], structural_errors("browser_capture_response_case", mutated))
                self.assertIn("J_REVALIDATE", browser_capture_semantic_failures(
                    "browser_capture_response_case", mutated))

    def test_source_only_mismatch_discloses_source_changed(self):
        mutated = apply_patch(self.case(), {
            "current.matched_source.source_identity_hash": "e" * 64,
            "result.outcome": "stale_capture",
            "result.revalidation.result": "stale_capture",
            "result.revalidation.source_match": False,
            "result.revalidation.recapture_action": {"command_id": "cmd.browser.component.pick"},
            "result.message_ref": None,
            "result.error": {"code": "source_changed", "reason": "source identity moved",
                             "offending_field": "source",
                             "recapture_action": {"command_id": "cmd.browser.component.pick"}},
            "central.result_status": "failed",
            "central.error": {"code": "stale_projection", "reason": "source identity moved",
                              "offending_field": "source"},
            "outcome.outcome": "failed",
            "outcome.error_ref": "err/browser/005",
            "outcome.acknowledgement_frame_id": None,
            "outcome.acknowledgement_frame_offset": None,
            "outcome.same_frame_acknowledged": False,
            "outcome.acknowledgement_receipt_ref": None,
        })
        mutated["outcome"]["owner_result_sha256"] = owner_result_digest(mutated["result"])
        self.assertEqual([], structural_errors("browser_capture_response_case", mutated))
        self.assertEqual([], browser_capture_semantic_failures("browser_capture_response_case", mutated))

    def test_no_recapture_command_anywhere(self):
        schema = json.loads((ROOT / "Plans/browser_capture_contracts.schema.json").read_text())
        identities: list[str] = []

        def walk(node):
            if isinstance(node, dict):
                for key, val in node.items():
                    if key in ("const", "enum") and key == "const" and isinstance(val, str):
                        identities.append(val)
                    if key == "enum" and isinstance(val, list):
                        identities.extend(v for v in val if isinstance(v, str))
                    walk(val)
            elif isinstance(node, list):
                for item in node:
                    walk(item)

        walk(schema)
        self.assertNotIn("cmd.browser.component.recapture", identities)
        self.assertIn("cmd.browser.component.pick", identities)
        fixtures = json.loads((ROOT / "Plans/browser_capture_contract_fixtures.json").read_text())
        for row in fixtures["valid"]:
            self.assertNotIn("cmd.browser.component.recapture", json.dumps(row["value"]))
        self.assertTrue(any("cmd.browser.component.recapture" in json.dumps(row.get("patch", {}))
                            for row in fixtures["invalid"]))

    def test_command_census_unchanged(self):
        commands = (ROOT / "Plans/Commands_System.md").read_text()
        catalog = (ROOT / "Plans/UI_Command_Catalog.md").read_text()
        for command, handler in HANDLERS.items():
            with self.subTest(command=command):
                self.assertIn(command, commands)
                self.assertIn(handler, commands)
                self.assertIn(command, catalog)
                self.assertIn(handler, catalog)
        for command, (request, result) in PAIRS.items():
            row = [line for line in commands.splitlines() if f"`{command}`" in line]
            self.assertEqual(1, len(row), command)
            self.assertIn(f"browser_capture_contracts.schema.json#/$defs/{request}", row[0])
            self.assertIn(f"browser_capture_contracts.schema.json#/$defs/{result}", row[0])
            self.assertIn("handler_unavailable", row[0])
            self.assertIn(HANDLERS[command], row[0])

    def test_event_census_unchanged(self):
        admission = json.loads((ROOT / "Plans/browser_event_admission.json").read_text())
        bindings = admission.get("command_event_bindings", [])
        bound = set()
        if isinstance(bindings, dict):
            bound = set(bindings)
        else:
            for row in bindings:
                bound.add(row.get("command_id"))
        for command in COMMANDS:
            self.assertNotIn(command, bound)
        schema = json.loads((ROOT / "Plans/browser_capture_contracts.schema.json").read_text())
        forbidden = {"expected_event_types", "event_types", "EventRecord"}
        owned_mirror = {"central_response", "central_error", "central_opaque_ref", "central_command_id"}
        seen: set[str] = set()

        def walk(node):
            if isinstance(node, dict):
                for key, val in node.items():
                    if key in ("properties", "required"):
                        if isinstance(val, dict):
                            seen.update(val.keys())
                        elif isinstance(val, list):
                            seen.update(v for v in val if isinstance(v, str))
                    walk(val)
            elif isinstance(node, list):
                for item in node:
                    walk(item)

        for name, definition in schema.get("$defs", {}).items():
            if name not in owned_mirror:
                walk(definition)
        self.assertTrue(forbidden.isdisjoint(seen))
        for row in self.fixtures["valid"]:
            self.assertEqual([], row["value"]["central"]["event_refs"], row["name"])

    def test_gate_enrollment(self):
        gate = (ROOT / "scripts/pm-new-contracts-verify.py").read_text()
        self.assertIn('("Plans/browser_capture_contracts.schema.json", '
                      '"Plans/browser_capture_contract_fixtures.json")', gate)
        tree = ast.parse(gate)
        assignments = {
            target.id: ast.literal_eval(node.value)
            for node in tree.body if isinstance(node, ast.Assign)
            for target in node.targets if isinstance(target, ast.Name)
            if target.id in {"CONTRACT_PAIRS", "EXPECTED_CONTRACT_PAIR_COUNT"}
        }
        self.assertEqual(assignments["EXPECTED_CONTRACT_PAIR_COUNT"], len(assignments["CONTRACT_PAIRS"]))
        self.assertIn(
            ("Plans/browser_capture_contracts.schema.json", "Plans/browser_capture_contract_fixtures.json"),
            assignments["CONTRACT_PAIRS"],
        )
        self.assertIn("browser_capture_semantic_failures(definition_name, value)", gate)

    def test_live_central_vocab(self):
        self.assertEqual([], live_central_checks())

    def test_live_inventory_key(self):
        self.assertEqual([], live_inventory_checks())

    def test_outcome_digest_flips_reject_causally(self):
        flips = [
            ({"outcome.owner_result_sha256": "0" * 64}, "J_RESULT_DIGEST"),
            ({"outcome.payload_sha256": "0" * 64}, "J_PAYLOAD_DIGEST"),
        ]
        for patch, rule in flips:
            mutated = apply_patch(self.case(), patch)
            with self.subTest(rule=rule):
                self.assertEqual([], structural_errors("browser_capture_response_case", mutated))
                self.assertIn(rule, browser_capture_semantic_failures(
                    "browser_capture_response_case", mutated))

    def test_payload_digest_ignores_request_copy(self):
        mutated = self.case()
        mutated["request"]["permission_snapshot_ref"] = "perm/snapshot/forged"
        failures = browser_capture_semantic_failures("browser_capture_response_case", mutated)
        self.assertIn("J_DISPATCH_BIND", failures)
        self.assertIn("J_CALLER_BIND", failures)
        self.assertNotIn("J_PAYLOAD_DIGEST", failures)

    def test_huge_generation_never_accepts_noncanonical_digest(self):
        mutated = self.case()
        mutated["result"]["details"]["original_generation"] = 10**21
        self.assertEqual([], structural_errors("browser_capture_response_case", mutated))
        noncanonical = hashlib.sha256(json.dumps(
            mutated["result"], sort_keys=True, separators=(",", ":"),
            ensure_ascii=False).encode("utf-8")).hexdigest()
        mutated["outcome"]["owner_result_sha256"] = noncanonical
        with self.assertRaises(ValueError):
            owner_result_digest(mutated["result"])
        self.assertEqual(["J_RESULT_DIGEST"], browser_capture_semantic_failures(
            "browser_capture_response_case", mutated))

    def test_oracle_integer_domain_boundary(self):
        self.assertEqual(b'{"generation":9007199254740991}',
                         rfc8785_canonical_bytes({"generation": 2**53 - 1}))
        with self.assertRaises(ValueError):
            rfc8785_canonical_bytes({"generation": 2**53})
        with self.assertRaises(ValueError):
            rfc8785_canonical_bytes({"generation": 10**21})

    def test_independent_repros_reject_causally(self):
        repros = [
            ("send_now_fresh_admitted",
             {"request.captured.original_session_id": "sess:foreign:999",
              "current.current_subject.browser_session_id": "sess:foreign:999"},
             "J_ORIGINAL_BIND"),
            ("send_now_fresh_admitted",
             {"result.message_ref": "msg:forged:999",
              "result.receipt_ref": "receipt:forged:999"},
             "J_OUTCOME_BIND"),
            ("mode_default_applied",
             {"request.setting_id_ref": "setting/foreign/unrelated",
              "result.changed_setting_ids": ["setting/foreign/unrelated"]},
             "J_SETTINGS_KEY"),
            ("add_to_composer_appended",
             {"result.list_entries.0.hidden_ref": "compref/foreign/other"},
             "J_BUFFER_BIND"),
        ]
        for base, patch, rule in repros:
            mutated = apply_patch(self.case(base), patch)
            with self.subTest(rule=rule):
                self.assertEqual([], structural_errors("browser_capture_response_case", mutated))
                self.assertIn(rule, browser_capture_semantic_failures(
                    "browser_capture_response_case", mutated))

    def test_validate_tree_passes(self):
        errors, log = validate_tree(ROOT)
        self.assertEqual([], [line for line in log if "0 errors" not in line and "checked" not in line])
        self.assertEqual(0, errors)


if __name__ == "__main__":
    unittest.main()
