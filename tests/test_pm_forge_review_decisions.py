"""Static review decisions; no provider, auth or protected-effect execution."""
from copy import deepcopy
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import pm_forge_review_decisions as m


class ReviewDecisions(unittest.TestCase):
    def setUp(self):
        self.fixtures = json.loads((ROOT / "Plans/forge_review_decision_fixtures.json").read_text())
        self.cases = {x["name"]: x["value"] for x in self.fixtures["valid"]}

    def check(self, x):
        return m.result_failures(x["request"], x["result"], **m.fixture_dependencies(x))

    def test_two_complete_static_joins(self):
        for x in self.cases.values():
            self.assertEqual(self.check(x), [])

    def test_real_central_metadata_pipeline(self):
        canon = Path(os.environ.get("PM_CANON_ROOT", ROOT))
        sys.path.insert(0, str(canon / "scripts"))
        spec = importlib.util.spec_from_file_location("forge_decision_gate", canon / "scripts/pm-new-contracts-verify.py")
        gate = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = gate
        spec.loader.exec_module(gate)
        schema = json.loads((ROOT / "Plans/forge_review_decisions.schema.json").read_text())
        registry = gate.offline_schema_registry().with_resource(schema["$id"], m.Resource.from_contents(schema))
        self.assertEqual(self.fixtures["schema_version"], "1.0.0")
        for positive, cases in ((True, self.fixtures["valid"]), (False, self.fixtures["invalid"])):
            for case in cases:
                definition, selected = gate.select_definition(schema, case, case["value"], require_valid=positive)
                accepted = gate.validator_for(schema, selected, registry).is_valid(case["value"])
                errors = m.review_decision_semantic_failures(definition, case["value"])
                self.assertTrue(accepted)
                if positive:
                    self.assertEqual(errors, [])
                else:
                    self.assertIn(case["semantic_rule"], errors)

    def test_request_changes_requires_body(self):
        x = deepcopy(self.cases["request_changes"])
        x["request"]["selection"]["body"] = None
        self.assertTrue(self.check(x))

    def test_null_approval_body_not_empty_text(self):
        x = deepcopy(self.cases["approve"])
        x["records"]["observation:approve"]["selection"]["body"] = ""
        self.assertIn("observation_selection", self.check(x))

    def test_foreign_review_head(self):
        x = deepcopy(self.cases["approve"])
        x["request"]["selection"]["head_revision"] = "other"
        self.assertIn("revision_head_revision", self.check(x))

    def test_foreign_account_binding(self):
        x = deepcopy(self.cases["approve"])
        x["records"][x["request"]["authority"]["repository_binding_ref"]]["account_id"] = "foreign"
        self.assertIn("binding_account_id", self.check(x))

    def test_foreign_revision_repository(self):
        x = deepcopy(self.cases["approve"])
        x["records"][x["request"]["authority"]["target"]["review_revision_ref"]]["repository_binding_ref"] = "foreign"
        self.assertIn("revision_repository_binding_ref", self.check(x))

    def test_independent_catalog_generation_not_binding_generation(self):
        x = deepcopy(self.cases["approve"])
        self.assertNotEqual(x["request"]["authority"]["currentness"]["catalog_generation"],
                            x["request"]["authority"]["expected_binding_generation"])
        self.assertEqual(self.check(x), [])

    def test_foreign_receipt_original_idempotency(self):
        x = deepcopy(self.cases["approve"])
        x["records"]["receipt:approve"]["idempotency_key"] = "foreign"
        self.assertIn("receipt_idempotency_key", self.check(x))

    def test_receipt_event_and_recovery_continuity(self):
        for key, value, error in (("event_refs", ["invented:event"], "receipt_event_refs"),
                                  ("recovery_actions", ["cmd.forge.review.approve"], "receipt_recovery_actions")):
            x = deepcopy(self.cases["approve"])
            x["records"]["receipt:approve"][key] = value
            self.assertEqual(m.shape_failures("command_receipt", x["records"]["receipt:approve"], owner=True), [])
            self.assertIn(error, self.check(x))

    def test_automation_original_result_receipt_continuity(self):
        for where in ("result", "receipt"):
            for key, value in (("automation_binding_ref", "automation:foreign"),
                               ("expected_automation_binding_generation", 77)):
                x = deepcopy(self.cases["approve"])
                target = x["result"]["owner_result"] if where == "result" else x["records"]["receipt:approve"]
                target[key] = value
                self.assertIn(where + "_" + key, self.check(x))

    def test_unknown_provider_observation_cannot_succeed(self):
        x = deepcopy(self.cases["approve"])
        x["records"]["observation:approve"]["outcome"] = "unknown"
        self.assertIn("success_without_applied_decision", self.check(x))

    def test_no_missing_provider_observation_success(self):
        x = deepcopy(self.cases["approve"])
        del x["records"]["observation:approve"]
        self.assertIn("success_without_provider_observation", self.check(x))

    def test_accepted_work_is_not_terminal_success(self):
        x = deepcopy(self.cases["approve"])
        r = x["result"]["owner_result"]
        r["outcome"] = "accepted"
        r["observable_work_id"] = "work:accepted"
        r["terminal_provider_result_ref"] = None
        receipt = x["records"]["receipt:approve"]
        receipt["outcome"] = "accepted"
        receipt["observable_work_id"] = r["observable_work_id"]
        self.assertEqual(self.check(x), [])

    def test_original_and_result_entry_mutation_rejected(self):
        for mutate in ("request", "result"):
            x = deepcopy(self.cases["approve"])
            def reader(ref):
                if ref == "receipt:approve":
                    if mutate == "request":
                        x["request"]["selection"]["body"] = "late"
                    else:
                        x["result"]["original_request_ref"] = "late"
                return deepcopy(x["records"][ref])
            self.assertIn("input_mutated_during_resolution",
                          m.result_failures(x["request"], x["result"], resolve_record=reader))

    def test_other_ten_commands_not_admitted(self):
        x = deepcopy(self.cases["approve"])
        x["request"]["authority"]["command_id"] = "cmd.forge.review.comment"
        self.assertTrue(self.check(x))

    def test_target_reference_not_assumed_raw_provider_id(self):
        x = deepcopy(self.cases["approve"])
        self.assertNotEqual(x["result"]["owner_result"]["target_ref"], x["request"]["selection"]["provider_review_id"])
        self.assertEqual(self.check(x), [])
        x["records"]["observation:approve"]["target_ref"] = "other"
        self.assertIn("observation_target", self.check(x))


if __name__ == "__main__":
    unittest.main()
