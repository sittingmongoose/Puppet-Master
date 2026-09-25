"""RSC-014 static transition regressions. No native updater or storage executes."""
import copy
import json
from pathlib import Path
import sys
import unittest

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_application_update_semantics import application_update_semantic_failures, check_due


class ApplicationCheckTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads((ROOT / "Plans/application_update_check_contracts.schema.json").read_text())
        cls.fixtures = json.loads((ROOT / "Plans/application_update_check_contract_fixtures.json").read_text())

    def errors(self, value, definition="ApplicationCheckTransition"):
        schema = {"$defs": self.schema["$defs"], "$ref": "#/$defs/" + definition}
        errors = list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(value))
        return errors or application_update_semantic_failures(definition, value)

    def transition(self, name="validated_publication"):
        return copy.deepcopy(next(row["value"] for row in self.fixtures["valid"] if row["name"] == name))

    def state(self):
        return self.transition()["after"]

    def due(self, state, **kwargs):
        args = dict(current_scope=state["scope"], current_policy_version=state["policy_version"],
                    now_utc="2026-09-25T00:06:00Z", trigger="launch")
        args.update(kwargs)
        return check_due(state, **args)

    def test_schema_and_authored_fixtures(self):
        Draft202012Validator.check_schema(self.schema)
        for expectation, rows in ((False, self.fixtures["valid"]), (True, self.fixtures["invalid"])):
            for row in rows:
                with self.subTest(case=row["name"]):
                    errors = self.errors(row["value"], row["definition"])
                    self.assertEqual(bool(errors), expectation, str(errors))
                    if "semantic_rule" in row:
                        self.assertIn(row["semantic_rule"], errors)

    def test_persisted_jitter_survives_restart_without_resampling(self):
        state = self.state()
        original = copy.deepcopy(state)
        restored = json.loads(json.dumps(state))
        for checked in (state, restored):
            self.assertEqual(self.due(checked, now_utc="2026-09-25T00:05:59Z"), "not_due")
            self.assertEqual(self.due(checked), "due")
        self.assertEqual(state, original)
        restored["due"]["jitter_seconds"] += 1
        self.assertEqual(self.due(restored), "invalid_state")

    def test_automatic_off_does_not_disable_manual(self):
        state = self.state()
        state["automatic_enabled"] = False
        self.assertEqual(self.due(state), "automatic_disabled")
        self.assertEqual(self.due(state, trigger="manual"), "due")

    def test_server_scope_coalescing_precedes_due(self):
        state = self.state()
        state["in_flight_operation_id"] = "operation:already-running"
        for trigger in ("launch", "manual"):
            self.assertEqual(self.due(state, trigger=trigger), "coalesce")
        other = dict(state["scope"], installation_generation=999)
        self.assertEqual(self.due(state, current_scope=other), "scope_changed")

    def test_scope_policy_and_clock_cannot_reuse_due_state(self):
        state = self.state()
        for key in ("server_id", "installation_id", "source_id", "channel_id"):
            other = dict(state["scope"], **{key: "other"})
            self.assertEqual(self.due(state, current_scope=other), "scope_changed")
        self.assertEqual(self.due(state, current_policy_version="policy:new"), "policy_changed")
        self.assertEqual(self.due(state, now_utc="2026-09-20T00:00:00Z"), "clock_discontinuity")

    def test_cold_start_and_stable_launch_policy(self):
        state = self.state()
        for key in ("last_success", "cache", "due", "last_attempt_at_utc"):
            state[key] = None
        self.assertEqual(self.due(state), "due")
        self.assertEqual(self.due(state, trigger="background"), "launch_only")
        state["scope"]["channel_id"] = "canary"
        self.assertEqual(self.due(state, trigger="background"), "due")

    def test_failure_keeps_anchor_and_applies_backoff_to_all_checks(self):
        value = self.transition("offline_preserves_success")
        self.assertEqual(value["before"]["last_success"], value["after"]["last_success"])
        for trigger in ("launch", "manual"):
            self.assertEqual(self.due(value["after"], trigger=trigger,
                                      now_utc="2026-09-24T00:13:59Z"), "backoff")
            self.assertEqual(self.due(value["after"], trigger=trigger,
                                      now_utc="2026-09-24T00:14:00Z"), "due")

    def test_cross_record_tampering_is_rejected(self):
        mutations = (
            lambda v: v["after"].update(automatic_enabled=False),
            lambda v: v["after"].update(in_flight_operation_id="operation:check"),
            lambda v: v["attempt"].update(expected_revision=6),
            lambda v: v["result"].update(completed_at_utc="2026-09-23T00:00:00Z"),
            lambda v: v["after"]["due"].update(anchor_result_id="result:other"),
            lambda v: v["before"].update(retry_not_before_utc="2026-09-24T01:00:00Z"),
        )
        for index, mutate in enumerate(mutations):
            with self.subTest(index=index):
                value = self.transition()
                mutate(value)
                self.assertTrue(self.errors(value))

    def test_original_source_admission_is_not_claimed(self):
        # Deliberately synthetic refs pass relational checks. This demonstrates
        # the explicit proof limit: the oracle does not authenticate source facts.
        value = self.transition()
        value["result"]["source_evidence_ref"] = "fixture:not-native-proof"
        value["after"]["last_success"]["source_evidence_ref"] = "fixture:not-native-proof"
        self.assertFalse(self.errors(value))
        self.assertIn("not original source authority", self.fixtures["claim_boundary"])

    def test_immutable_publication_and_success_identity(self):
        value = self.transition()
        value["result"]["publication"]["publication_revision"] = value["before"]["cache"]["publication_revision"]
        value["result"]["publication"]["metadata"][0]["version"] = "9.9.9"
        self.assertIn("update_check_immutable_publication_changed", self.errors(value))
        value = self.transition()
        value["result"]["result_id"] = value["before"]["last_success"]["result_id"]
        self.assertIn("update_check_replayed_success_is_not_new_validation", self.errors(value))


if __name__ == "__main__":
    unittest.main()
