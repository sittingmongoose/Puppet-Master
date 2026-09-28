"""Offline dispatch regression; all process/native boundaries are mocked."""
from dataclasses import replace
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import evaluator_dispatch as glue
from evaluator_launch import Assignment, LiveAuthorization, LaunchRefused

TASK = glue.LAB / "delivery-v2/prompts/evaluator-task.txt"


def completed():
    return {"review_status": "COMPLETED", "returncode": 0, "error": None,
            "stop": None, "native_terminal_failure": False,
            "result": {"subtype": "success", "is_error": False},
            "host_validation": {"grades.json": {"exists": True, "json_valid": True},
                                "review.md": {"exists": True}}}


class DispatchTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.task = self.root / "task.txt"
        self.task.write_bytes(TASK.read_bytes())
        self.sha = hashlib.sha256(self.task.read_bytes()).hexdigest()
        self.assignments = tuple(Assignment(f"EVAL-{i:03d}", str(self.root / f"EVAL-{i:03d}")) for i in (1, 2))
        for assignment in self.assignments:
            Path(assignment.workspace).mkdir()
        import prep_plan
        self.metadata = {}
        for assignment in self.assignments:
            arms = []
            for label, slot in zip(("X1", "X2"), prep_plan.PAIRS[assignment.assignment_id]):
                path = Path(assignment.workspace) / f"first_view/results/{label}/current.md"
                path.parent.mkdir(parents=True)
                path.write_text(f"Offline synthetic {label} report; no actual research result.\n")
                arms.append({"slot": slot, "native_outcome": "goal_complete",
                             "structural_complete": True, "lineage_pass": True,
                             "report_kind": "host_current" if slot.endswith("-maintained") else "authored_current", "current_path": str(path),
                             "current_sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
            self.metadata[assignment.assignment_id] = {"assignment_id": assignment.assignment_id, "arms": arms}
        self.auth = LiveAuthorization(True, self.sha, self.assignments)
        self.phase = self.root / "phase-state.json"
        self.phase_data = {"phase_started_epoch": 1000, "freeze_sha256": "a" * 64,
                           "phase_wall_seconds": 14400, "state": "running"}
        self.write_phase()
        self.calls = []
        self.real_eligible = glue._eligible
        self.eligible = patch.object(glue, "_eligible", return_value=True)
        self.eligible.start()
        self.addCleanup(self.eligible.stop)
        self.kw = dict(task_path=self.task, expected_task_sha256=self.sha,
                       permitted_assignments=self.assignments, assignment_id="EVAL-001",
                       authorization=self.auth, runs=self.root / "runs",
                       phase_state_path=self.phase, expected_freeze_sha256="a" * 64,
                       pair_metadata=self.metadata["EVAL-001"], native=self.native,
                       clock=lambda: 1100)

    def write_phase(self):
        self.phase.write_text(json.dumps(self.phase_data))

    def native(self, ws, prompt_file, **limits):
        arm = prompt_file.parent
        self.assertEqual(json.loads((arm / "status.json").read_text())["state"], "dispatched")
        self.assertTrue((arm / "composed-input.json").is_file())
        self.calls.append((ws, prompt_file.read_text(), limits))
        self.write_outputs(ws)
        return completed()

    def write_outputs(self, ws):
        for rel in glue.OUTPUTS:
            path = ws / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("{}" if path.suffix == ".json" else "Offline synthetic output.\n")

    def dispatch(self, **changes):
        if "assignment_id" in changes and "pair_metadata" not in changes:
            changes["pair_metadata"] = self.metadata.get(changes["assignment_id"], self.kw["pair_metadata"])
        return glue.dispatch(**{**self.kw, **changes})

    def refuse(self, **changes):
        with self.assertRaises(LaunchRefused):
            self.dispatch(**changes)
        self.assertEqual(self.calls, [])

    def test_entire_composed_input_and_identity_are_saved_before_callback(self):
        result = self.dispatch()
        ws, text, limits = self.calls[0]
        self.assertEqual(ws, Path(self.assignments[0].workspace))
        self.assertEqual(limits, {"deadline": 2700, "cap": 160})
        self.assertIn("This evaluation is authorized now", text)
        self.assertIn("TRUSTED LIVE LAUNCH ENVELOPE", text)
        self.assertTrue(text.endswith(self.task.read_text()))
        self.assertGreater(len(text), len(self.task.read_text()))
        arm = self.root / "runs/EVAL-001"
        digest = hashlib.sha256(text.encode()).hexdigest()
        self.assertEqual(result["composed_input_sha256"], digest)
        self.assertEqual(json.loads((arm / "composed-input.json").read_text())["composed_input_sha256"], digest)
        receipt = json.loads((arm / "arm-receipt.json").read_text())
        self.assertEqual(receipt["outcome"], "goal_complete")
        self.assertEqual(receipt["native_receipt"], completed())
        self.assertEqual(json.loads((arm / "native-receipt.json").read_text()), completed())
        self.assertFalse(receipt["provider_received_payload_proof"])

    def test_default_driver_actual_argv_contains_entire_composed_saved_prompt(self):
        """Real build_cmd/run path; Popen itself is synthetic and cannot execute."""
        ws = Path(self.assignments[0].workspace)
        self.write_outputs(ws)
        events = [{"type": "system", "subtype": "init", "model": "claude-opus-5-5",
                   "effort": "synthetic_observed", "tools": ["Read"]},
                  {"type": "result", "subtype": "success", "is_error": False}]
        class Process:
            stdout = io.StringIO("".join(json.dumps(event) + "\n" for event in events))
            def wait(self, timeout):
                return 0
        def popen(argv, **kw):
            self.calls.append((argv, kw))
            return Process()
        original = glue.reviewer.run
        def mock_process_run(*args, **kwargs):
            return original(*args, popen=popen, poll=0.001, **kwargs)
        with patch.object(glue.reviewer, "run", side_effect=mock_process_run):
            self.dispatch(native=None)
        argv, kw = self.calls[0]
        saved = (self.root / "runs/EVAL-001/composed-prompt.txt").read_text()
        self.assertEqual(argv[2], saved)
        self.assertIn("This evaluation is authorized now", argv[2])
        self.assertTrue(argv[2].endswith(self.task.read_text()))
        self.assertEqual(argv[argv.index("--model") + 1], "claude-opus-5-5")
        self.assertEqual(argv[argv.index("--effort") + 1], "xhigh")
        self.assertEqual(argv[argv.index("--tools") + 1], "Read,Grep,Glob,Write,Edit")
        self.assertEqual(kw["cwd"], ws)
        rec = json.loads((self.root / "runs/EVAL-001/native-receipt.json").read_text())
        self.assertEqual(rec["effective_effort_observed"], "synthetic_observed")
        self.assertEqual(rec["effort_requested"], "xhigh")

    def test_missing_false_truthy_and_task_schedule_mismatched_auth_zero_calls(self):
        for auth in (None, {}, replace(self.auth, user_approved=False),
                     replace(self.auth, user_approved=1), replace(self.auth, task_sha256="0" * 64),
                     replace(self.auth, assignments=self.assignments[::-1]),
                     replace(self.auth, assignments=(self.assignments[0],))):
            with self.subTest(auth=auth):
                self.refuse(authorization=auth)
        self.assertFalse((self.root / "runs").exists())

    def test_changed_task_never_reaches_callback(self):
        self.task.write_text(self.task.read_text() + "\nchanged")
        self.refuse()

    def test_unknown_assignment_and_three_slot_schedule_refused(self):
        self.refuse(assignment_id="EVAL-003")
        self.refuse(permitted_assignments=self.assignments + (self.assignments[0],))

    def test_changed_caps_refused(self):
        for changed in (replace(self.assignments[0], seconds=2701),
                        replace(self.assignments[0], responses=161)):
            with self.subTest(changed=changed):
                self.refuse(authorization=replace(self.auth, assignments=(changed, self.assignments[1])))

    def test_ineligible_pair_does_not_claim_slot(self):
        with patch.object(glue, "_eligible", return_value=False):
            self.refuse()
        self.assertFalse((self.root / "runs").exists())

    def test_actual_parent_policy_rejects_wrong_pair_failed_arm_and_changed_report(self):
        metadata = self.metadata["EVAL-001"]
        arms = metadata["arms"]
        original = Path(arms[0]["current_path"]).read_bytes()
        with patch.object(glue, "_eligible", side_effect=self.real_eligible):
            self.refuse(assignment_id="EVAL-002", pair_metadata=metadata)
            failed = {**metadata, "arms": [{**arms[0], "native_outcome": "cap_stop"}, arms[1]]}
            self.refuse(pair_metadata=failed)
            Path(arms[0]["current_path"]).write_text("changed report")
            self.refuse(pair_metadata=metadata)
            Path(arms[0]["current_path"]).write_bytes(original)
            self.dispatch(pair_metadata=metadata)
        self.assertEqual(len(self.calls), 1)

    def test_corrupted_saved_composed_input_never_dispatches_and_consumes_slot(self):
        original = Path.write_bytes
        def corrupt(path, raw):
            return original(path, raw + b"\ncorruption" if path.name == "composed-prompt.txt" else raw)
        with patch.object(Path, "write_bytes", new=corrupt):
            self.refuse()
        self.refuse()
        rec = json.loads((self.root / "runs/EVAL-001/arm-receipt.json").read_text())
        self.assertEqual(rec["outcome"], "harness_failure")

    def test_phase_missing_wrong_freeze_closed_invalid_start_or_expired_zero_calls(self):
        self.phase.unlink()
        self.refuse()
        variants = ({"freeze_sha256": "b" * 64}, {"state": "closed_published"},
                    {"phase_started_epoch": 1200}, {"phase_started_epoch": True},
                    {"phase_started_epoch": float("nan")}, {"phase_wall_seconds": 14401},
                    {"phase_started_epoch": -12201})
        original = dict(self.phase_data)
        for changes in variants:
            with self.subTest(changes=changes):
                self.phase_data = {**original, **changes}
                self.write_phase()
                self.refuse()

    def test_phase_budget_is_rechecked_after_consumption_before_native(self):
        ticks = iter((1100, 1100, 13001, 13001))
        self.refuse(clock=lambda: next(ticks))
        arm = self.root / "runs/EVAL-001"
        self.assertEqual(json.loads((arm / "status.json").read_text())["state"], "terminal")
        self.assertTrue(json.loads((arm / "arm-receipt.json").read_text())["authorization_consumed"])
        self.refuse()  # Fresh gate cannot revive this consumed slot.

    def test_recreated_gate_refuses_successful_terminal_slot(self):
        self.dispatch()
        self.calls.clear()
        self.refuse()

    def test_existing_dangling_not_terminal_failed_and_malformed_slots_refused(self):
        arm = self.root / "runs/EVAL-001"
        arm.mkdir(parents=True)
        for status in (None, {"state": "dispatched"},
                       {"state": "terminal", "outcome": "harness_failure"}, "malformed"):
            with self.subTest(status=status):
                if status is not None:
                    (arm / "status.json").write_text(status if isinstance(status, str) else json.dumps(status))
                self.refuse()

    def test_callback_exception_terminalizes_consumption_and_cannot_restart(self):
        def failing(*args, **kw):
            self.calls.append("mocked callback")
            raise RuntimeError("offline failure")
        with self.assertRaisesRegex(RuntimeError, "offline failure"):
            self.dispatch(native=failing)
        arm = self.root / "runs/EVAL-001"
        rec = json.loads((arm / "arm-receipt.json").read_text())
        self.assertEqual(rec["outcome"], "harness_failure")
        self.assertEqual(rec["dispatcher_exception_type"], "RuntimeError")
        self.assertEqual(json.loads((arm / "status.json").read_text())["state"], "terminal")
        self.calls.clear()
        self.refuse()
        self.refuse(assignment_id="EVAL-002")

    def test_prior_dangling_dispatched_stopped_and_stop_schedule_block_second(self):
        statuses = (None, {"state": "dispatched"},
                    {"state": "terminal", "outcome": "harness_failure"},
                    {"state": "terminal", "outcome": "goal_complete", "stop_schedule": True})
        for i, status in enumerate(statuses):
            runs = self.root / f"synthetic-stopped-runs-{i}"
            arm = runs / "EVAL-001"
            arm.mkdir(parents=True)
            if status is not None:
                (arm / "status.json").write_text(json.dumps(status))
            with self.subTest(status=status):
                self.refuse(assignment_id="EVAL-002", runs=runs)
                self.assertFalse((runs / "EVAL-002").exists())

    def test_original_continue_outcomes_allow_other_assignment(self):
        for i, outcome in enumerate(("goal_complete", "cap_stop", "incomplete_semantic")):
            runs = self.root / f"synthetic-continue-runs-{i}"
            arm = runs / "EVAL-001"
            arm.mkdir(parents=True)
            (arm / "status.json").write_text(json.dumps({"state": "terminal", "outcome": outcome, "stop_schedule": False}))
            self.dispatch(assignment_id="EVAL-002", runs=runs)
        self.assertEqual(len(self.calls), 3)

    def test_wrong_staged_paths_or_duplicate_reports_refuse_without_consumption(self):
        arms = self.metadata["EVAL-001"]["arms"]
        elsewhere = self.root / "synthetic-other-report.md"
        elsewhere.write_bytes(Path(arms[0]["current_path"]).read_bytes())
        for changed in ({**arms[0], "current_path": str(elsewhere)}, arms[1]):
            with self.subTest(changed=changed):
                self.refuse(pair_metadata={"assignment_id": "EVAL-001", "arms": [changed, arms[1]]})
                self.assertFalse((self.root / "runs").exists())

    def test_staged_hash_and_eligibility_rechecked_immediately_before_callback(self):
        original = glue._phase_check
        checks = []
        def mutate_after_claim(*args):
            result = original(*args)
            checks.append(1)
            if len(checks) == 2:
                Path(self.metadata["EVAL-001"]["arms"][0]["current_path"]).write_text("changed staged report")
            return result
        with patch.object(glue, "_phase_check", side_effect=mutate_after_claim):
            self.refuse()
        self.assertEqual(len(checks), 2)
        self.assertGreaterEqual(glue._eligible.call_count, 3)
        self.assertEqual(json.loads((self.root / "runs/EVAL-001/status.json").read_text())["outcome"], "harness_failure")

    def test_pair_becomes_ineligible_after_claim_never_calls_native(self):
        with patch.object(glue, "_eligible", side_effect=(True, True, False)):
            self.refuse()
        rec = json.loads((self.root / "runs/EVAL-001/arm-receipt.json").read_text())
        self.assertTrue(rec["authorization_consumed"])
        self.assertEqual(rec["outcome"], "harness_failure")

    def test_completed_driver_missing_assessment_acquisition_empty_or_bad_json_is_incomplete(self):
        variants = (("out/final-assessment.json", None), ("out/final-assessment.md", None),
                    ("out/acquisition-and-preservation.json", None), ("out/review.md", " \n"),
                    ("out/acquisition-and-preservation.json", "not json"))
        for i, (rel, text) in enumerate(variants):
            def missing(ws, prompt, **kw):
                self.write_outputs(ws)
                path = ws / rel
                if text is None:
                    path.unlink()
                else:
                    path.write_text(text)
                return completed()
            with self.subTest(rel=rel, text=text):
                result = self.dispatch(runs=self.root / f"synthetic-output-runs-{i}", native=missing)
                rec = result["dispatcher_result"]
                self.assertEqual(rec["outcome"], "incomplete_semantic")
                self.assertEqual(rec["native_receipt"], completed())
                self.assertFalse(rec["wrapper_output_validation"][rel]["valid"])

    def test_nonzero_error_missing_and_incomplete_receipts_never_success(self):
        variants = [None, {}, {**completed(), "returncode": 7},
                    {**completed(), "error": "offline driver failure"},
                    {**completed(), "result": {"subtype": "success", "is_error": True}},
                    {**completed(), "host_validation": {}},
                    {**completed(), "review_status": "FAILED_INCOMPLETE", "host_validation": {}},
                    {**completed(), "stop": "cap_seconds", "returncode": -15}]
        for i, native_receipt in enumerate(variants):
            with self.subTest(receipt=native_receipt):
                result = self.dispatch(runs=self.root / f"synthetic-runs-{i}",
                                       native=lambda *args, **kw: native_receipt)
                self.assertNotEqual(result["dispatcher_result"]["outcome"], "goal_complete")
        self.assertEqual(glue._outcome(variants[-2])[0], "incomplete_semantic")
        self.assertEqual(glue._outcome(variants[-1])[0], "cap_stop")

    def test_second_assignment_uses_distinct_slot_and_third_is_refused(self):
        self.dispatch()
        self.dispatch(assignment_id="EVAL-002")
        self.assertEqual(len(self.calls), 2)
        self.calls.clear()
        self.refuse(assignment_id="EVAL-003")


if __name__ == "__main__":
    unittest.main()
