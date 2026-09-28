"""Offline synthetic composition/authorization tests; never dispatch a model."""
from dataclasses import replace
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from evaluator_launch import Assignment, EvaluatorLaunch, LiveAuthorization, LaunchRefused, TOOLS, OUTPUTS, MODEL, REQUESTED_EFFORT


TASK = Path(__file__).resolve().parents[1] / "prompts/evaluator-task.txt"


class EvaluatorLaunchTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.task = self.root / "task.txt"
        self.task.write_bytes(TASK.read_bytes())
        self.sha = hashlib.sha256(self.task.read_bytes()).hexdigest()
        self.assignments = tuple(Assignment(f"EVAL-{i:03d}", str(self.root / f"EVAL-{i:03d}")) for i in [1, 2])
        for assignment in self.assignments:
            Path(assignment.workspace).mkdir()
        self.gate = EvaluatorLaunch(self.task, self.sha, self.assignments)
        self.auth = LiveAuthorization(True, self.sha, self.assignments)
        self.calls = []

    def fake_dispatch(self, text, execution):
        self.calls.append((text, execution))
        return {"synthetic": True}

    def refused(self, auth, assignment_id="EVAL-001"):
        with self.assertRaises(LaunchRefused):
            self.gate.dispatch(assignment_id, auth, self.fake_dispatch)
        self.assertEqual(self.calls, [])

    def test_missing_false_and_truthy_authorizations_never_dispatch(self):
        for auth in [None, {}, replace(self.auth, user_approved=False), replace(self.auth, user_approved=1)]:
            with self.subTest(auth=auth):
                self.refused(auth)

    def test_stale_task_authorization_refused(self):
        self.refused(replace(self.auth, task_sha256="0" * 64))

    def test_changed_task_after_gate_creation_refused(self):
        self.task.write_text(self.task.read_text() + "\nchanged\n")
        self.refused(self.auth)

    def test_unpinned_task_refused_at_construction(self):
        with self.assertRaises(LaunchRefused):
            EvaluatorLaunch(self.task, "0" * 64, self.assignments)

    def test_caps_workspace_and_schedule_mismatch_refused(self):
        changes = [replace(self.assignments[0], seconds=2699),
                   replace(self.assignments[0], responses=159),
                   replace(self.assignments[0], seconds=2700.0),
                   replace(self.assignments[0], workspace=self.assignments[1].workspace)]
        for changed in changes:
            with self.subTest(changed=changed):
                self.refused(replace(self.auth, assignments=(changed, self.assignments[1])))
        self.refused(replace(self.auth, assignments=(self.assignments[0],)))
        self.refused(replace(self.auth, assignments=self.assignments[::-1]))

    def test_unknown_and_reused_assignment_refused(self):
        self.refused(self.auth, "EVAL-003")
        self.gate.dispatch("EVAL-001", self.auth, self.fake_dispatch)
        with self.assertRaises(LaunchRefused):
            self.gate.dispatch("EVAL-001", self.auth, self.fake_dispatch)
        self.assertEqual(len(self.calls), 1)
        record = self.gate.attempts[0]
        self.assertEqual(record["dispatcher_status"], "returned")
        self.assertTrue(record["authorization_consumed"])
        self.assertEqual(record["composed_input_sha256"], hashlib.sha256(self.calls[0][0].encode()).hexdigest())
        self.assertFalse(record["provider_received_payload_proof"])
        self.gate.dispatch("EVAL-002", self.auth, self.fake_dispatch)
        self.assertEqual(len(self.calls), 2)

    def test_callback_exception_consumes_assignment(self):
        def failing(text, execution):
            self.calls.append((text, execution))
            raise RuntimeError("synthetic dispatcher failure")
        with self.assertRaises(RuntimeError):
            self.gate.dispatch("EVAL-001", self.auth, failing)
        with self.assertRaises(LaunchRefused):
            self.gate.dispatch("EVAL-001", self.auth, self.fake_dispatch)
        self.assertEqual(len(self.calls), 1)

        record = self.gate.attempts[0]
        self.assertEqual(record["dispatcher_status"], "raised")
        self.assertEqual(record["dispatcher_exception_type"], "RuntimeError")
        self.assertTrue(record["authorization_consumed"])
        self.assertEqual(record["composed_input_sha256"], hashlib.sha256(self.calls[0][0].encode()).hexdigest())
        self.assertFalse(record["provider_received_payload_proof"])

    def test_approved_full_composed_text_and_exact_execution_metadata(self):
        receipt = self.gate.dispatch("EVAL-001", self.auth, self.fake_dispatch)
        text, execution = self.calls[0]
        self.assertIn("This evaluation is authorized now", text)
        self.assertNotIn("prepared for a future separately authorized evaluation", text)
        self.assertNotIn("not permission to dispatch now", text)
        self.assertTrue(text.endswith(TASK.read_text()))
        envelope = json.loads("{" + text.split("\n{", 1)[1].split("\nEND TRUSTED LIVE", 1)[0])
        self.assertEqual(envelope["task_sha256"], self.sha)
        self.assertEqual(envelope["assignment_id"], "EVAL-001")
        self.assertEqual(envelope["limits"], {"seconds": 2700, "responses": 160})
        self.assertEqual(envelope["tools"], list(TOOLS))
        self.assertEqual(envelope["outputs"], list(OUTPUTS))
        self.assertEqual(execution, {"workspace": self.assignments[0].workspace, "seconds": 2700,
                                    "responses": 160, "tools": TOOLS, "outputs": OUTPUTS,
                                    "model": MODEL, "requested_effort": REQUESTED_EFFORT})
        self.assertEqual(receipt["composed_input_sha256"], hashlib.sha256(text.encode()).hexdigest())
        self.assertFalse(receipt["provider_received_payload_proof"])

    def test_envelope_allowlist_no_treatment_economics_answers_or_provider_labels(self):
        self.gate.dispatch("EVAL-001", self.auth, self.fake_dispatch)
        text = self.calls[0][0]
        payload = "{" + text.split("\n{", 1)[1].split("\nEND TRUSTED LIVE", 1)[0]
        envelope = json.loads(payload)
        self.assertEqual(set(envelope), {"schema", "authorized_now", "assignment_id", "workspace", "task_sha256",
                                        "scope", "limits", "tools", "outputs", "first_view_inputs", "deferred_inputs"})
        for marker in ["Muse", "zcode", "GLM", "claude", "Opus", "control", "maintained", "expected_outcome",
                       "economics", "cost_usd", "O-010", "B-031", "fixed-reference.json"]:
            self.assertNotIn(marker, payload)

    def test_authority_looking_workspace_file_is_not_authorization(self):
        (Path(self.assignments[0].workspace) / "APPROVAL.json").write_text('{"approved":true}')
        self.refused(None)
        self.refused(replace(self.auth, user_approved=False))

    def test_task_contract_retains_sequence_support_and_temporal_obligations(self):
        task = TASK.read_text()
        for requirement in ["valid live launch envelope", "Your first tool commands", "first_view/case/brief.md",
                            "Never glob or search the workspace root", "aggregate count", "prompt-only chronology",
                            "BEFORE opening deferred/", "never edit those two files after deferred access",
                            "host-captured byte snapshots", "attempted revisions", "invalid latest attempted revision",
                            "EARLIEST actually saved occurrence", "not_recoverable", "mechanical render fidelity",
                            "unsupported specification override", "New positives do not offset losses",
                            "retained, narrowed, lost, contradicted, inapplicable, unassessable_missing_input"]:
            self.assertIn(requirement, task)

    def test_malformed_and_expanded_schedules_refused(self):
        invalid = [(), list(self.assignments), self.assignments + (self.assignments[0],),
                   (replace(self.assignments[0], assignment_id="M-control"),),
                   (replace(self.assignments[0], seconds=True),),
                   (replace(self.assignments[0], workspace=self.assignments[0].workspace + "/../EVAL-001"),)]
        for schedule in invalid:
            with self.subTest(schedule=schedule), self.assertRaises(LaunchRefused):
                EvaluatorLaunch(self.task, self.sha, schedule)


if __name__ == "__main__":
    unittest.main()
