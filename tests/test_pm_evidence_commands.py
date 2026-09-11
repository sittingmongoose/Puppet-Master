"""ATS-048/RAP-056 static joins only; no owner, viewer or capture executes."""

import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_ui_command_response as response
from pm_evidence_command_semantics import evidence_binding_failures, request_digest

GATE = response.contracts()
PAIRS = (("testing_session", "TestingSession", "TCP-TESTING-EVIDENCE", 5),
         ("artifact_recording", "ArtifactRecording", "TCP-ARTIFACT-RECORDING", 2))
FIXTURES = {}
for family, prefix, profile, count in PAIRS:
    path = "Plans/" + family + "_command_contracts.schema.json"
    pack = json.loads((ROOT / ("Plans/" + family + "_command_contract_fixtures.json")).read_text())
    cases = GATE.authored_positive_cases(pack, request_mode="template_patch")
    FIXTURES[family] = (path, pack, {c["name"]: c for c in cases})


def command_pairs():
    for family, prefix, _, _ in PAIRS:
        path, _, cases = FIXTURES[family]
        for name, case in cases.items():
            if case["definition"] == prefix + "CommandRequest":
                yield path, name, copy.deepcopy(case["instance"]), copy.deepcopy(cases[name + "_result"]["instance"])


def owner_snapshot(request, result):
    snap = {key: copy.deepcopy(request[key]) for key in ("context", "subject", "args")}
    snap.update({key: copy.deepcopy(result[key]) for key in ("subject_ref", "operation_id", "status", "receipt_ref", "projection_ref", "currentness_ref", "currentness_sha256", "artifact_refs")})
    snap.update({key: True for key in ("native_handler_available", "permission_allowed", "subject_current", "redaction_allowed", "capability_available")})
    snap["original_result_ref"] = "result:original"
    return snap


class EvidenceCommandTests(unittest.TestCase):
    def test_exact_positive_inventory_and_root_closure(self):
        for family, prefix, _, count in PAIRS:
            path, pack, cases = FIXTURES[family]
            with self.subTest(family=family):
                self.assertEqual(len(pack["coverage"]["exact_command_ids"]), count)
                self.assertEqual(GATE.validate_authored_command_coverage(path, "Plans/" + family + "_command_contract_fixtures.json", response.schema(path), pack, list(cases.values()), GATE.authored_invalid_cases(pack)), [])
            for name, case in cases.items():
                with self.subTest(case=name):
                    self.assertEqual(response.structural_failures(path, case["instance"]), [])
                    self.assertEqual(GATE.contract_semantic_failures(path, case["definition"], case["instance"]), [])
                    extra = copy.deepcopy(case["instance"])
                    extra["unowned_authority"] = True
                    self.assertTrue(response.structural_failures(path, extra))

    def test_all_authored_negatives_fail_for_declared_reason(self):
        for family, _, _, _ in PAIRS:
            path, pack, cases = FIXTURES[family]
            bases = {name: case["instance"] for name, case in cases.items()}
            for case in GATE.authored_invalid_cases(pack):
                with self.subTest(family=family, case=case["name"]):
                    value = GATE.materialize_invalid(case, bases)
                    structural = response.structural_failures(path, value, "#/$defs/" + case["definition"])
                    if case.get("semantic_rule"):
                        self.assertEqual(structural, [])
                        self.assertIn(case["semantic_rule"], GATE.contract_semantic_failures(path, case["definition"], value))
                    else:
                        self.assertTrue(structural)

    def test_seven_exact_owner_snapshot_joins(self):
        for _, name, req, result in command_pairs():
            with self.subTest(command=name):
                self.assertEqual(evidence_binding_failures(req, result, owner_snapshot(req, result)), [])

    def test_every_context_field_is_bound(self):
        for _, name, req, result in command_pairs():
            for field, old in req["context"].items():
                with self.subTest(command=name, field=field):
                    snap = owner_snapshot(req, result)
                    snap["context"][field] = old + 1 if isinstance(old, int) else "different:binding"
                    self.assertIn("evidence_owner_context_mismatch", evidence_binding_failures(req, result, snap))

    def test_owner_gates_and_frozen_receipt_artifact_bindings(self):
        for _, name, req, result in command_pairs():
            for gate in ("native_handler_available", "permission_allowed", "subject_current", "redaction_allowed", "capability_available"):
                with self.subTest(command=name, gate=gate):
                    snap = owner_snapshot(req, result)
                    snap[gate] = False
                    self.assertIn("evidence_owner_gate_" + gate, evidence_binding_failures(req, result, snap))
            for field in ("subject", "args", "subject_ref", "operation_id", "status", "receipt_ref", "projection_ref", "currentness_ref", "currentness_sha256", "artifact_refs"):
                with self.subTest(command=name, field=field):
                    snap = owner_snapshot(req, result)
                    snap[field] = None
                    self.assertIn("evidence_owner_" + field + "_mismatch", evidence_binding_failures(req, result, snap))

    def test_replay_requires_original_and_cannot_remint_output(self):
        for _, name, req, result in command_pairs():
            snap = owner_snapshot(req, result)
            original = copy.deepcopy(result)
            result.update(replayed=True, original_result_ref="result:original")
            with self.subTest(command=name):
                self.assertIn("evidence_original_result_missing", evidence_binding_failures(req, result, snap))
                self.assertEqual(evidence_binding_failures(req, result, snap, original), [])
            for field, replacement in (("operation_id", "operation:replacement"), ("receipt_ref", "receipt:replacement"), ("artifact_refs", ["artifact:replacement"]), ("projection_ref", "projection:replacement")):
                changed = copy.deepcopy(result)
                changed[field] = replacement
                with self.subTest(command=name, field=field):
                    self.assertIn("evidence_replay_changed_original_result", evidence_binding_failures(req, changed, snap, original))

    def test_binding_excludes_invocation_identity_but_not_owner_inputs(self):
        for _, name, req, _ in command_pairs():
            original = request_digest(req)
            req["command_instance_id"] = "command:retry"
            req["idempotency"]["original_result_ref"] = "result:original"
            with self.subTest(command=name):
                self.assertEqual(request_digest(req), original)
                req["context"]["client_session_generation"] += 1
                self.assertNotEqual(request_digest(req), original)

    def test_all_existing_placements_use_actual_owner_schemas(self):
        wiring = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
        touch = json.loads((ROOT / "Plans/touch_closure.json").read_text())
        rows = {row[3]: row for row in touch["rows"]}
        profiles = {p["profile_id"]: p for p in touch["profiles"]}
        count = 0
        for family, prefix, profile, _ in PAIRS:
            path, pack, _ = FIXTURES[family]
            for command in pack["coverage"]["exact_command_ids"]:
                placements = [row for row in wiring.values() if row["ui_command_id"] == command]
                with self.subTest(command=command):
                    self.assertEqual(len(placements), 2 if command.startswith("cmd.testing.session.") else 1)
                    self.assertEqual(rows[command][1], profile)
                    self.assertEqual(rows[command][4], "partial")
                    self.assertEqual(profiles[profile]["payload_schema_ref"], path + "#/$defs/" + prefix + "CommandRequest")
                    self.assertEqual(len({row["handler_location"] for row in placements}), 1)
                    for row in placements:
                        self.assertEqual(row["request_schema_ref"], path + "#/$defs/" + prefix + "CommandRequest")
                        self.assertEqual(row["result_schema_ref"], path + "#/$defs/" + prefix + "CommandResult")
                        count += 1
        self.assertEqual(count, 11)
        shared = response.schema(response.SHARED_SCHEMA)["$defs"]["canonical_command_id"]["enum"]
        self.assertEqual(len(shared), 26)
        self.assertTrue(set(shared).isdisjoint(rows[3] for rows in touch["rows"] if rows[1] in {pair[2] for pair in PAIRS}))
        capture = response.schema("Plans/test_capture_motion_evidence_contracts.schema.json")["$defs"]["capture_command_id"]["enum"]
        self.assertEqual(len(capture), 10)
        self.assertTrue(set(capture).isdisjoint(row[3] for row in touch["rows"] if row[1] in {pair[2] for pair in PAIRS}))

    def test_central_response_owner_bridges_all_statuses(self):
        fixtures = json.loads((ROOT / "Plans/ui_command_response_fixtures.json").read_text())["valid"]
        bases = [row for row in fixtures if row["case_id"].startswith("evidence_")]
        self.assertEqual(len(bases), 7)
        for base in bases:
            for status, outcome, result_status in (("accepted", "accepted", "pending"), ("completed", "succeeded", "succeeded"), ("no_change", "succeeded", "no_op"), ("blocked", "rejected", None), ("failed", "failed", "failed"), ("cancelled", "cancelled", "cancelled"), ("effect_unknown", "terminal_unknown", "recovery_required")):
                value = copy.deepcopy(base)
                result = value["owner_result"]
                result["status"] = status
                result["error"] = None
                if status in {"blocked", "failed", "effect_unknown"}:
                    result["error"] = {"reason": "effect_reconciliation_required" if status == "effect_unknown" else "policy_denied", "safe_message_code": "blocked", "detail_ref": None, "retry_policy": "same_operation_after_reconciliation" if status == "effect_unknown" else "never", "effect_state": "unknown" if status == "effect_unknown" else "no_effect"}
                if status in {"accepted", "blocked", "effect_unknown"}:
                    result["receipt_ref"] = None
                    result["artifact_refs"] = []
                if status == "accepted":
                    result["observable_work_ref"] = "work:pending"
                value["outcome"].update(outcome=outcome, result_receipt_ref=result["receipt_ref"], payload_sha256=result["request_binding_sha256"])
                value["response"].update(result_status=result_status)
                # Test the owner bridge independently of central refusal copy;
                # the full central response fixtures separately validate shapes.
                with self.subTest(command=base["case_id"], status=status):
                    self.assertEqual(response.structural_failures(value["response"]["owner_result_schema_ref"]["path"], result), [])
                    self.assertEqual(response.evidence_owner_failures(value["response"], value["outcome"], result, value["owner_request"]), [])
                    if status != "completed":
                        value["outcome"]["outcome"] = "succeeded"
                        value["response"]["result_status"] = "succeeded"
                        self.assertTrue(response.evidence_owner_failures(value["response"], value["outcome"], result, value["owner_request"]))


if __name__ == "__main__":
    unittest.main()
