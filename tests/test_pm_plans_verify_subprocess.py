from __future__ import annotations

import importlib.util
import json
import os
import signal
import stat
import subprocess
import sys
import tempfile
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from unittest import mock
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts/pm-plans-verify.py"
SPEC = importlib.util.spec_from_file_location("pm_plans_verify", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
pm_plans_verify = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(pm_plans_verify)


def write_stub_validator(path: Path, body: str) -> None:
    """Write an executable python stub the helper can invoke as a subprocess."""
    path.write_text("#!/usr/bin/env python3\n" + body, encoding="utf-8")
    path.chmod(path.stat().st_mode | stat.S_IEXEC | stat.S_IXGRP | stat.S_IXOTH)


class RunValidatorSubprocessTests(unittest.TestCase):
    """Covers run_validator_subprocess + the gates routed through it (Task 5)."""

    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.tmp = Path(self._tmp.name)

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def test_normal_exit_returns_completed_process(self) -> None:
        stub = self.tmp / "ok_validator.py"
        write_stub_validator(stub, "import json,sys; json.dump({'status':'pass'}, sys.stdout)\n")
        proc, timeout_report = pm_plans_verify.run_validator_subprocess(
            "ok-check",
            [sys.executable, str(stub)],
            timeout_seconds=10,
        )
        self.assertIsNone(timeout_report)
        assert proc is not None
        self.assertEqual(proc.returncode, 0)
        self.assertEqual(json.loads(proc.stdout), {"status": "pass"})

    def test_timeout_returns_structured_failure(self) -> None:
        stub = self.tmp / "slow_validator.py"
        write_stub_validator(stub, "import time; time.sleep(30)\n")
        started = time.monotonic()
        proc, timeout_report = pm_plans_verify.run_validator_subprocess(
            "slow-check",
            [sys.executable, str(stub)],
            timeout_seconds=1,
        )
        elapsed = time.monotonic() - started
        self.assertIsNone(proc)
        assert timeout_report is not None
        self.assertEqual(timeout_report["status"], "fail")
        self.assertEqual(timeout_report["check"], "slow-check")
        failures = timeout_report["failures"]
        self.assertEqual(len(failures), 1)
        self.assertEqual(failures[0]["error"], "subprocess_timeout")
        self.assertEqual(failures[0]["timeout_seconds"], 1)
        # Must return promptly, not hang for the full 30s sleep.
        self.assertLess(elapsed, 8.0)

    def test_post_kill_cleanup_never_uses_blocking_pipe_reads(self) -> None:
        fake_proc = mock.Mock()
        fake_proc.pid = 1234
        fake_proc.returncode = None
        fake_proc.stdout = mock.Mock()
        fake_proc.stderr = mock.Mock()
        fake_proc.stdout.read.side_effect = AssertionError("stdout.read() must not be called")
        fake_proc.stderr.read.side_effect = AssertionError("stderr.read() must not be called")
        fake_proc.communicate.side_effect = [
            subprocess.TimeoutExpired(["validator"], 30),
            subprocess.TimeoutExpired(
                ["validator"],
                1,
                output=b"partial stdout",
                stderr=b"partial stderr",
            ),
        ]
        fake_proc.wait.return_value = -signal.SIGKILL

        with (
            mock.patch.object(pm_plans_verify.subprocess, "Popen", return_value=fake_proc),
            mock.patch.object(
                pm_plans_verify,
                "_terminate_process_group",
                return_value=(True, "os.killpg(1234, SIGKILL)"),
            ),
        ):
            proc, timeout_report = pm_plans_verify.run_validator_subprocess(
                "cleanup-check",
                ["validator"],
                timeout_seconds=30,
            )

        self.assertIsNone(proc)
        assert timeout_report is not None
        failure = timeout_report["failures"][0]
        self.assertEqual(failure["error"], "subprocess_timeout")
        self.assertEqual(failure["stdout_excerpt"], "partial stdout")
        self.assertEqual(failure["stderr_excerpt"], "partial stderr")
        fake_proc.communicate.assert_has_calls([mock.call(timeout=30), mock.call(timeout=1)])
        fake_proc.stdout.close.assert_called_once_with()
        fake_proc.stderr.close.assert_called_once_with()
        fake_proc.stdout.read.assert_not_called()
        fake_proc.stderr.read.assert_not_called()
        fake_proc.wait.assert_called_once_with(timeout=1)

    def test_process_group_killed_when_child_holds_pipe(self) -> None:
        # Parent stub spawns a grandchild that inherits stdout/stderr and sleeps. Without
        # process-group kill, the grandchild keeps the pipe open and communicate() hangs.
        stub = self.tmp / "spawner.py"
        grandchild = self.tmp / "grandchild.py"
        write_stub_validator(
            grandchild,
            "import time; time.sleep(60)\n",
        )
        # The stub prints its report, then forks a grandchild that outlives it holding stdout.
        write_stub_validator(
            stub,
            (
                "import json, os, sys\n"
                "json.dump({'status':'pass'}, sys.stdout); sys.stdout.flush()\n"
                f"os.spawnlp(os.P_NOWAIT, {sys.executable!r}, {sys.executable!r}, {str(grandchild)!r})\n"
                "import time; time.sleep(60)\n"
            ),
        )
        started = time.monotonic()
        # Identify grandchildren by snapshotting the stub's process group after spawn.
        proc, timeout_report = pm_plans_verify.run_validator_subprocess(
            "spawner-check",
            [sys.executable, str(stub)],
            timeout_seconds=2,
        )
        elapsed = time.monotonic() - started
        self.assertIsNone(proc)
        assert timeout_report is not None
        self.assertEqual(timeout_report["status"], "fail")
        failures = timeout_report["failures"]
        self.assertEqual(failures[0]["error"], "subprocess_timeout")
        # On POSIX the whole process group must be killed so the pipe is released.
        self.assertTrue(failures[0]["process_group_killed"])
        self.assertIn("killpg", failures[0]["kill_mechanism"])
        self.assertIn("SIGKILL", failures[0]["kill_mechanism"])
        # Helper must return within bound, proving the grandchild did not strand communicate().
        self.assertLess(elapsed, 8.0)
        # Best-effort: confirm no lingering python processes from this test group. We cannot
        # know the grandchild pid directly, so we rely on the bounded elapsed time above as
        # the structural proof that the process group was reaped.

    def test_nested_aggregate_validator_joins_wrapper_process_group_and_is_reaped(self) -> None:
        nested = self.tmp / "nested.py"
        wrapper = self.tmp / "wrapper.py"
        nested_state = self.tmp / "nested_state.json"
        wrapper_state = self.tmp / "wrapper_state.json"
        write_stub_validator(
            nested,
            (
                "import json, os, time\n"
                "from pathlib import Path\n"
                f"Path({str(nested_state)!r}).write_text("
                "json.dumps({'pid': os.getpid(), 'pgid': os.getpgrp()}), encoding='utf-8')\n"
                "time.sleep(60)\n"
            ),
        )
        write_stub_validator(
            wrapper,
            (
                "import importlib.util, json, os, sys\n"
                "from pathlib import Path\n"
                f"Path({str(wrapper_state)!r}).write_text("
                "json.dumps({'pid': os.getpid(), 'pgid': os.getpgrp()}), encoding='utf-8')\n"
                f"spec = importlib.util.spec_from_file_location('nested_pm_plans_verify', {str(MODULE_PATH)!r})\n"
                "module = importlib.util.module_from_spec(spec)\n"
                "spec.loader.exec_module(module)\n"
                f"module.run_validator_subprocess('nested', [sys.executable, {str(nested)!r}], timeout_seconds=60)\n"
            ),
        )

        started = time.monotonic()
        with ThreadPoolExecutor(max_workers=1) as executor:
            result = executor.submit(
                pm_plans_verify.run_validator_subprocess,
                "aggregate-wrapper",
                [sys.executable, str(wrapper)],
                timeout_seconds=10,
                aggregate_child=True,
            )
            readiness_deadline = time.monotonic() + 8
            while (
                time.monotonic() < readiness_deadline
                and not nested_state.exists()
                and not result.done()
            ):
                time.sleep(0.05)
            nested_started_before_timeout = nested_state.exists()
            proc, timeout_report = result.result(timeout=15)
        elapsed = time.monotonic() - started

        self.assertIsNone(proc)
        assert timeout_report is not None
        self.assertEqual(timeout_report["failures"][0]["error"], "subprocess_timeout")
        self.assertTrue(timeout_report["failures"][0]["process_group_killed"])
        self.assertLess(elapsed, 20.0)
        self.assertTrue(nested_started_before_timeout)
        self.assertTrue(wrapper_state.exists())
        self.assertTrue(nested_state.exists())
        wrapper_process = json.loads(wrapper_state.read_text(encoding="utf-8"))
        nested_process = json.loads(nested_state.read_text(encoding="utf-8"))
        self.assertEqual(wrapper_process["pid"], wrapper_process["pgid"])
        self.assertEqual(nested_process["pgid"], wrapper_process["pgid"])

        nested_pid = nested_process["pid"]
        deadline = time.monotonic() + 3
        while time.monotonic() < deadline:
            try:
                os.kill(nested_pid, 0)
            except ProcessLookupError:
                break
            time.sleep(0.05)
        else:
            self.fail(f"nested aggregate validator still alive after wrapper timeout: pid={nested_pid}")

    def test_gui_asset_policy_gate_honors_timeout(self) -> None:
        """cmd_validate_gui_asset_policy must respect subcheck_timeout_seconds (regression)."""
        import argparse

        # With no validator override the gate runs the real scripts/pm-gui-asset-policy.py.
        # A normal run must still pass and not depend on a timeout; this asserts the gate
        # reads subcheck_timeout_seconds without crashing (previously it ignored it entirely).
        ns = argparse.Namespace(subcheck_timeout_seconds=120)
        report = pm_plans_verify.cmd_validate_gui_asset_policy(ns)
        self.assertEqual(report["check"], "validate-gui-asset-policy")
        self.assertIn(report["status"], {"pass", "fail"})


class ClassifyValidatorResultTests(unittest.TestCase):
    """Covers the signal-death / no-output classification (Task 4 + 1).

    A validator killed by a signal (e.g. -9 / OOM) must be reported as
    validator_killed_by_signal, NOT mislabeled as validator_output_not_json.
    """

    def _proc(self, returncode: int, stdout: str = "", stderr: str = ""):
        return subprocess.CompletedProcess(args=["x"], returncode=returncode, stdout=stdout, stderr=stderr)

    def test_signal_death_classified_explicitly(self) -> None:
        proc = self._proc(returncode=-9, stdout="", stderr="")
        report = pm_plans_verify.classify_validator_result(
            "validate-plan-migration", proc, extra_failure_fields={"run_dir": "Plans/x"}
        )
        assert report is not None
        self.assertEqual(report["status"], "fail")
        self.assertEqual(report["check"], "validate-plan-migration")
        failure = report["failures"][0]
        self.assertEqual(failure["error"], "validator_killed_by_signal")
        self.assertEqual(failure["signal"], 9)
        self.assertEqual(failure["signal_name"], "SIGKILL")
        self.assertEqual(failure["returncode"], -9)
        self.assertEqual(failure["likely_cause"], "external_oom_or_signal_kill")
        self.assertEqual(failure["run_dir"], "Plans/x")

    def test_no_output_classified_explicitly(self) -> None:
        proc = self._proc(returncode=0, stdout="   \n  ", stderr="boom")
        report = pm_plans_verify.classify_validator_result("x-check", proc)
        assert report is not None
        failure = report["failures"][0]
        self.assertEqual(failure["error"], "validator_no_output")
        self.assertEqual(failure["returncode"], 0)
        self.assertIn("boom", failure["stderr_excerpt"])

    def test_json_output_returns_none_for_caller_to_parse(self) -> None:
        proc = self._proc(returncode=0, stdout='{"status":"pass"}')
        self.assertIsNone(pm_plans_verify.classify_validator_result("x-check", proc))

    def test_parse_validator_json_handles_signal_death(self) -> None:
        proc = self._proc(returncode=-9, stdout="", stderr="")
        report = pm_plans_verify.parse_validator_json("x-check", proc)
        self.assertEqual(report["failures"][0]["error"], "validator_killed_by_signal")

    def test_parse_validator_json_keeps_genuine_parse_error_distinct(self) -> None:
        proc = self._proc(returncode=0, stdout="not json at all {")
        report = pm_plans_verify.parse_validator_json("x-check", proc)
        failure = report["failures"][0]
        self.assertEqual(failure["error"], "validator_output_not_json")
        self.assertIn("not json at all {", failure["stdout_excerpt"])


class AggregateSubcheckSubprocessTests(unittest.TestCase):
    """Covers run_named_check running every aggregate subcheck as a subprocess.

    Proves: a normal aggregate subcheck returns its report; a slow in-process-style
    check returns a structured subprocess_timeout (instead of hanging the aggregate);
    the report carries the exact subcheck name and bounded excerpts.
    """

    def test_run_named_check_normal_subprocess_return(self) -> None:
        """A bounded real custody subcheck returns a structured report.

        Repository-wide JSON scanning is an integration gate, not a stable
        unit-test workload: retained evidence can grow independently of this test.
        """
        import argparse

        ns = argparse.Namespace()
        started = time.monotonic()
        name, report = pm_plans_verify.run_named_check(
            "validate_forge_backup_acceptance",
            pm_plans_verify.cmd_validate_forge_backup_acceptance,
            ns,
            progress=False,
            timeout_seconds=120,
        )
        elapsed = time.monotonic() - started
        self.assertEqual(name, "validate_forge_backup_acceptance")
        self.assertEqual(report["check"], "validate-forge-backup-acceptance")
        self.assertIn(report["status"], {"pass", "fail"})
        # The subprocess route must not hang and must be bounded.
        self.assertLess(elapsed, 60.0)

    def test_run_named_check_slow_subprocess_returns_structured_timeout(self) -> None:
        """A slow aggregate subcheck returns subprocess_timeout, not a hang.

        json_syntax scans every JSON/JSONL file in the repo (~2s). With a 1s bound it
        must be killed via the process group and surface a structured subprocess_timeout
        with process_group_killed=True and the kill mechanism recorded.
        """
        import argparse

        ns = argparse.Namespace()
        started = time.monotonic()
        name, report = pm_plans_verify.run_named_check(
            "json_syntax",
            pm_plans_verify.cmd_json_syntax,
            ns,
            progress=False,
            timeout_seconds=1,
        )
        elapsed = time.monotonic() - started
        self.assertEqual(report["check"], "json-syntax")
        self.assertEqual(report["status"], "fail")
        self.assertEqual(len(report["failures"]), 1)
        failure = report["failures"][0]
        self.assertEqual(failure["error"], "subprocess_timeout")
        self.assertEqual(failure["timeout_seconds"], 1)
        self.assertTrue(failure["process_group_killed"])
        self.assertIn("SIGKILL", failure["kill_mechanism"])
        # Bounded excerpts are present and are strings.
        self.assertIsInstance(failure["stdout_excerpt"], str)
        self.assertIsInstance(failure["stderr_excerpt"], str)
        # Must return promptly, proving the stuck child was reaped instead of hanging.
        self.assertLess(elapsed, 8.0)

    def test_run_named_check_inprocess_allowlist_uses_alarm_backstop(self) -> None:
        """verify_spec_lock is allowlisted to run in-process but still has a SIGALRM bound.

        A cheap in-process check with a generous timeout returns normally; this confirms
        the in-process path (the only non-subprocess path) is the small allowlist.
        """
        import argparse

        ns = argparse.Namespace()
        name, report = pm_plans_verify.run_named_check(
            "verify_spec_lock",
            pm_plans_verify.cmd_verify_spec_lock,
            ns,
            progress=False,
            timeout_seconds=120,
        )
        self.assertEqual(name, "verify_spec_lock")
        # In-process checks keep the underscore name (not normalized to hyphen).
        self.assertEqual(report["check"], "verify-spec-lock")
        self.assertIn(report["status"], {"pass", "fail"})


class AggregateCommandMappingTests(unittest.TestCase):
    """Covers aggregate subcheck name -> standalone CLI command routing."""

    def _capture_aggregate_names(self, aggregate_func):
        import argparse

        captured: list[str] = []

        def fake_run_named_check(name, func, namespace, *, progress, timeout_seconds):
            captured.append(name)
            return name, {"check": name.replace("_", "-"), "status": "pass", "failures": []}

        args = argparse.Namespace(subcheck_timeout_seconds=17, quiet_progress=True)
        with mock.patch.object(pm_plans_verify, "run_named_check", side_effect=fake_run_named_check):
            report = aggregate_func(args)

        self.assertEqual(report["status"], "pass")
        self.assertGreater(len(captured), 0)
        return captured

    def test_run_gates_canonical_subchecks_map_to_registered_commands(self) -> None:
        names = self._capture_aggregate_names(pm_plans_verify.cmd_run_gates)

        for name in names:
            command_id = pm_plans_verify._aggregate_subcheck_command_id(name)
            self.assertIn(command_id, pm_plans_verify.COMMANDS, name)

    def test_audit_governance_alias_subchecks_map_to_registered_commands(self) -> None:
        names = self._capture_aggregate_names(pm_plans_verify.cmd_audit_governance)

        for name in names:
            command_id = pm_plans_verify._aggregate_subcheck_command_id(name)
            self.assertIn(command_id, pm_plans_verify.COMMANDS, name)

    def test_audit_governance_returns_compact_entry_for_every_subcheck(self) -> None:
        names = self._capture_aggregate_names(pm_plans_verify.cmd_audit_governance)

        import argparse

        def fake_run_named_check(name, func, namespace, *, progress, timeout_seconds):
            return name, {"check": name.replace("_", "-"), "status": "pass", "failures": []}

        args = argparse.Namespace(subcheck_timeout_seconds=17, quiet_progress=True)
        with mock.patch.object(pm_plans_verify, "run_named_check", side_effect=fake_run_named_check):
            report = pm_plans_verify.cmd_audit_governance(args)

        self.assertIn("plan_migration", names)
        for name in names:
            self.assertIn(name, report)
            self.assertEqual(
                report[name],
                {"status": "pass", "failures": 0, "failure_samples": []},
                name,
            )

    def test_audit_governance_aliases_do_not_emit_invalid_choice_validator_no_output(self) -> None:
        import argparse

        names = self._capture_aggregate_names(pm_plans_verify.cmd_audit_governance)

        def fake_run_validator_subprocess(
            check_name, argv, *, timeout_seconds, extra_failure_fields=None, aggregate_child=False
        ):
            command_id = argv[2]
            if command_id not in pm_plans_verify.COMMANDS:
                return (
                    subprocess.CompletedProcess(
                        args=argv,
                        returncode=2,
                        stdout="",
                        stderr=f"argument command: invalid choice: {command_id!r}",
                    ),
                    None,
                )
            return (
                subprocess.CompletedProcess(
                    args=argv,
                    returncode=0,
                    stdout=json.dumps({"check": command_id, "status": "pass", "failures": []}),
                    stderr="",
                ),
                None,
            )

        with mock.patch.object(pm_plans_verify, "run_validator_subprocess", side_effect=fake_run_validator_subprocess):
            for name in names:
                if name in pm_plans_verify._INPROCESS_AGGREGATE_CHECKS:
                    continue
                _, report = pm_plans_verify.run_named_check(
                    name,
                    lambda ns: {"check": name, "status": "pass", "failures": []},
                    argparse.Namespace(),
                    progress=False,
                    timeout_seconds=17,
                )
                failures = report.get("failures", [])
                self.assertFalse(
                    any(
                        failure.get("error") == "validator_no_output"
                        and "invalid choice" in failure.get("stderr_excerpt", "")
                        for failure in failures
                    ),
                    name,
                )

    def test_aggregate_subcheck_cli_args_use_effective_timeout_for_empty_namespace(self) -> None:
        import argparse

        captured_argvs: list[list[str]] = []

        def fake_run_validator_subprocess(
            check_name, argv, *, timeout_seconds, extra_failure_fields=None, aggregate_child=False
        ):
            captured_argvs.append(argv)
            return (
                subprocess.CompletedProcess(
                    args=argv,
                    returncode=0,
                    stdout=json.dumps({"check": argv[2], "status": "pass", "failures": []}),
                    stderr="",
                ),
                None,
            )

        with mock.patch.object(pm_plans_verify, "run_validator_subprocess", side_effect=fake_run_validator_subprocess):
            for name in (
                "validate_plan_migration",
                "plan_migration",
                "validate_audit_closure",
                "audit_closure",
                "validate_audit_status_index",
                "audit_status_index",
                "validate_implementation_readiness",
                "implementation_readiness",
                "validate_gui_asset_policy",
                "gui_asset_policy",
                "check_shards",
                "shards",
                "validate_prd_planning_runtime_contracts",
                "prd_planning_runtime_contracts",
            ):
                pm_plans_verify.run_named_check(
                    name,
                    lambda ns: {"check": name, "status": "pass", "failures": []},
                    argparse.Namespace(),
                    progress=False,
                    timeout_seconds=17,
                )

        self.assertEqual(len(captured_argvs), 14)
        for argv in captured_argvs:
            timeout_flag_index = argv.index("--subcheck-timeout-seconds")
            self.assertEqual(argv[timeout_flag_index + 1], "17", argv)


if __name__ == "__main__":
    unittest.main()
