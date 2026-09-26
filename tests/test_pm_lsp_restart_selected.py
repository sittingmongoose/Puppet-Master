"""Causal static tests for the cmd.lsp.restart_server typed companion (LSPS-113).

Positive fixtures must validate and join cleanly against the owner_witness
channel, the full central v2 response, and the full SIR CommandOutcomeRecord;
every negative fixture must fail with exactly its expected code. The checker
itself must be enrolled in the standard aggregate gates. Static joins only: no
native dispatch, handler, event, persistence, or runtime proof is claimed here.
"""
import argparse
import importlib.util
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/pm-lsp-restart-selected.py"


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise AssertionError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class LspRestartSelectedCompanionTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.module = load_module("pm_lsp_restart_selected", SCRIPT)
        cls.report = cls.module.validate()

    def test_companion_validates_cleanly(self) -> None:
        self.assertEqual(self.report["check"], "validate-lsp-restart-selected")
        self.assertEqual(self.report["status"], "pass", self.report["failures"])
        self.assertEqual(self.report["failures"], [])
        self.assertEqual(self.report["valid_count"], 6)
        self.assertEqual(self.report["invalid_count"], 44)
        self.assertTrue(self.report["limitations"])

    def test_live_central_enums_are_joined_not_copied(self) -> None:
        ui_schema = json.loads((ROOT / "Plans/ui_command_response.schema.json").read_text())
        live_status = {v for v in ui_schema["properties"]["result_status"]["enum"] if v is not None}
        live_codes = set(ui_schema["$defs"]["UICommandError"]["properties"]["code"]["enum"])
        module_status, module_codes = self.module.live_central_enums()
        self.assertEqual(module_status, live_status)
        self.assertEqual(module_codes, live_codes)
        for required in self.module.OW_TO_CENTRAL.values():
            self.assertIn(required, live_status)

    def test_touch_profile_and_wiring_row_bind_exact_refs(self) -> None:
        touch = json.loads((ROOT / "Plans/touch_closure.json").read_text())
        profile = next(p for p in touch["profiles"] if p["profile_id"] == "TCP-LSP")
        self.assertEqual(profile["payload_schema_ref"], self.module.REQUEST_REF)
        self.assertEqual(profile["result_schema_ref"], self.module.RESULT_REF)
        self.assertEqual(profile["error_schema_ref"], self.module.ERROR_REF)
        self.assertIn(self.module.RECEIPT_REF, profile["receipt_refs"])
        self.assertIn(self.module.FIXTURE_REF, profile["test_refs"])
        row = next(r for r in touch["rows"] if r[0] == "TOUCH-LSP-001")
        self.assertEqual(row[4], "partial")
        wiring = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())
        entry = wiring["entries"]["catalog.lsp_restart_server"]
        self.assertEqual(entry["request_schema_ref"], self.module.REQUEST_REF)
        self.assertEqual(entry["result_schema_ref"], self.module.RESULT_REF)
        self.assertEqual(entry["expected_event_types"], [])
        self.assertEqual(entry["handler_location"], "handlers::lsp::restart_server")

    def test_rejected_spelling_never_passes(self) -> None:
        fixtures = json.loads((ROOT / "Plans/lsp_restart_selected_contract_fixtures.json").read_text())
        for entry in fixtures["valid"]:
            self.assertNotIn(self.module.REJECTED_SPELLING, json.dumps(entry["value"]))
        shape_negatives = [e for e in fixtures["invalid"]
                           if self.module.REJECTED_SPELLING in json.dumps(e["value"])]
        self.assertEqual(len(shape_negatives), 1)
        self.assertEqual(shape_negatives[0]["expect_failure"], "SHAPE_INVALID")

    def test_false_accept_negatives_cover_each_reproduced_mutation(self) -> None:
        fixtures = json.loads((ROOT / "Plans/lsp_restart_selected_contract_fixtures.json").read_text())
        expected = {
            "n2_request_instance_foreign": "J_ORIGIN_REQUEST",
            "n2_receipt_topology_foreign": "J_WITNESS_TOPOLOGY",
            "n2_central_owner_result_foreign": "J_WITNESS_OUTCOME",
            "n2_restart_generation_ahead": "J_GENERATION_JOIN",
            "n2_terminal_preservation_dropped": "J_TERMINAL_RECONCILIATION",
        }
        by_name = {e["name"]: e["expect_failure"] for e in fixtures["invalid"]}
        for name, code in expected.items():
            self.assertEqual(by_name.get(name), code, name)

    def test_origin_negatives_cover_probe_mutations(self) -> None:
        fixtures = json.loads((ROOT / "Plans/lsp_restart_selected_contract_fixtures.json").read_text())
        expected = {
            "n3_origin_payload_foreign": "J_ORIGIN_DISPATCH",
            "n3_origin_frame_foreign": "J_ORIGIN_DISPATCH",
            "n3_origin_payload_foreign_replay": "J_ORIGIN_DISPATCH",
            "n3_origin_frame_foreign_replay": "J_ORIGIN_DISPATCH",
            "n3_target_generation_mismatch": "J_ORIGIN_DISPATCH",
            "n3_target_generation_mismatch_replay": "J_ORIGIN_DISPATCH",
            "n3_identity_member_foreign": "J_ORIGIN_IDENTITY",
            "n3_operation_foreign_terminal": "J_WITNESS_ORIGINAL",
            "n3_supplied_current_stale": "J_GENERATION_FENCE",
            "n3_supplied_current_stale_replay": "J_GENERATION_FENCE",
            "n4_request_reason_foreign": "J_ORIGIN_REQUEST",
            "n4_request_recovery_foreign": "J_ORIGIN_REQUEST",
            "n4_request_reason_foreign_replay": "J_ORIGIN_REQUEST",
            "n4_request_recovery_foreign_replay": "J_ORIGIN_REQUEST",
        }
        by_name = {e["name"]: e["expect_failure"] for e in fixtures["invalid"]}
        for name, code in expected.items():
            self.assertEqual(by_name.get(name), code, name)

    def test_full_central_and_outcome_records_are_real(self) -> None:
        fixtures = json.loads((ROOT / "Plans/lsp_restart_selected_contract_fixtures.json").read_text())
        case = next(e["value"] for e in fixtures["valid"] if e["name"] == "terminal_restarted_clean")
        self.assertEqual(case["central"]["schema_id"], "pm.ui_command_response.v2")
        self.assertEqual(case["central"]["response_kind"], "owner_operation")
        self.assertEqual(case["central"]["owner_identity"]["scope_kind"], "project")
        outcome = case["owner_witness"]["outcome_record"]
        self.assertEqual(outcome["schema_id"], "pm.full_thread_runtime.contracts.v1")
        self.assertEqual(outcome["record_kind"], "command_outcome")
        self.assertEqual(outcome["identity"], case["central"]["owner_identity"])
        dispatch = case["owner_witness"]["original_dispatch"]
        self.assertEqual(dispatch["identity"], outcome["identity"])
        self.assertEqual(dispatch["payload_sha256"], outcome["payload_sha256"])
        self.assertEqual(dispatch["dispatch_frame_id"], outcome["dispatch_frame_id"])
        self.assertEqual(dispatch["target_generation"], outcome["target_generation"])
        self.assertEqual(case["request"], dispatch["original_request"])
        for entry in fixtures["valid"]:
            witness = entry["value"]["owner_witness"]
            self.assertNotEqual(
                witness["outcome_record"]["target_generation"],
                entry["value"]["result"]["current_topology_generation"],
                entry["name"])

    def test_checker_is_enrolled_in_aggregate_gates(self) -> None:
        gate = load_module("pm_plans_verify_v2", ROOT / "scripts/pm-plans-verify.py")
        self.assertIn("validate-lsp-restart-selected", gate.COMMANDS)
        self.assertEqual(
            gate._aggregate_subcheck_command_id("validate_lsp_restart_selected"),
            "validate-lsp-restart-selected")
        self.assertEqual(
            gate._aggregate_subcheck_command_id("lsp_restart_selected"),
            "validate-lsp-restart-selected")
        report = gate.cmd_validate_lsp_restart_selected(
            argparse.Namespace(subcheck_timeout_seconds=120))
        self.assertEqual(report["check"], "validate-lsp-restart-selected")
        self.assertEqual(report["status"], "pass", report.get("failures"))


if __name__ == "__main__":
    unittest.main()
