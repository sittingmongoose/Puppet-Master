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

        This is also the regression test for review B1: with a cache inherited from the
        environment the child answered from it in 0.26 s instead of scanning, and the
        test failed. The child must run, so it must take longer than the bound.
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

    def test_a_sleeping_stub_subprocess_is_killed_at_its_bound(self) -> None:
        """The same process-group kill, with a child whose runtime cannot depend on the repo."""
        import argparse

        ns = argparse.Namespace()
        with tempfile.TemporaryDirectory() as scratch:
            stub = Path(scratch) / "slow_subcheck.py"
            write_stub_validator(stub, "import time; time.sleep(30)\n")
            started = time.monotonic()
            with mock.patch.object(pm_plans_verify.sys, "executable", str(stub)):
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
        self.assertEqual(report["failures"][0]["error"], "subprocess_timeout")
        self.assertTrue(report["failures"][0]["process_group_killed"])
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


class AggregateParallelismTests(unittest.TestCase):
    """--jobs: the same results in the same order, with the waiting overlapped."""

    def specs(self):
        import argparse

        return [
            ("first", None, argparse.Namespace()),
            ("second", None, argparse.Namespace()),
            ("third", None, argparse.Namespace()),
        ]

    def fake_runner(self, delays, active, peak):
        import threading

        lock = threading.Lock()

        def run(name, func, namespace, *, progress, timeout_seconds):
            with lock:
                active["now"] += 1
                peak["now"] = max(peak["now"], active["now"])
            try:
                time.sleep(delays[name])
                return name, {"check": name, "status": "pass", "failures": []}
            finally:
                with lock:
                    active["now"] -= 1

        return run

    def test_jobs_one_is_the_serial_loop(self):
        active, peak = {"now": 0}, {"now": 0}
        with mock.patch.object(
            pm_plans_verify,
            "run_named_check",
            side_effect=self.fake_runner({"first": 0.03, "second": 0.02, "third": 0.01}, active, peak),
        ):
            results = pm_plans_verify.run_aggregate_checks(
                self.specs(), progress=False, timeout_seconds=10, jobs=1)
        self.assertEqual([name for name, _ in results], ["first", "second", "third"])
        self.assertEqual(peak["now"], 1)

    def test_parallel_results_keep_the_spec_order(self):
        active, peak = {"now": 0}, {"now": 0}
        with mock.patch.object(
            pm_plans_verify,
            "run_named_check",
            side_effect=self.fake_runner({"first": 0.06, "second": 0.01, "third": 0.02}, active, peak),
        ):
            results = pm_plans_verify.run_aggregate_checks(
                self.specs(), progress=False, timeout_seconds=10, jobs=3)
        self.assertEqual([name for name, _ in results], ["first", "second", "third"])
        self.assertGreater(peak["now"], 1)

    def test_the_in_process_check_stays_on_the_main_thread(self):
        import threading

        seen = {}

        def run(name, func, namespace, *, progress, timeout_seconds):
            seen[name] = threading.current_thread().name
            return name, {"check": name, "status": "pass", "failures": []}

        specs = [("verify_spec_lock", None, None), ("other", None, None)]
        with mock.patch.object(pm_plans_verify, "run_named_check", side_effect=run):
            results = pm_plans_verify.run_aggregate_checks(
                specs, progress=False, timeout_seconds=10, jobs=2)
        self.assertEqual([name for name, _ in results], ["verify_spec_lock", "other"])
        self.assertEqual(seen["verify_spec_lock"], "MainThread")

    def test_a_timeout_report_passes_through_unchanged(self):
        timeout_report = {
            "check": "second",
            "status": "fail",
            "failures": [{"check": "second", "error": "subprocess_timeout", "timeout_seconds": 10}],
        }

        def run(name, func, namespace, *, progress, timeout_seconds):
            if name == "second":
                return name, timeout_report
            return name, {"check": name, "status": "pass", "failures": []}

        with mock.patch.object(pm_plans_verify, "run_named_check", side_effect=run):
            results = pm_plans_verify.run_aggregate_checks(
                self.specs(), progress=False, timeout_seconds=10, jobs=3)
        self.assertIs(results[1][1], timeout_report)

    def test_a_failure_is_not_hidden(self):
        def run(name, func, namespace, *, progress, timeout_seconds):
            if name == "second":
                raise RuntimeError("second could not be read")
            return name, {"check": name, "status": "pass", "failures": []}

        with mock.patch.object(pm_plans_verify, "run_named_check", side_effect=run):
            with self.assertRaises(RuntimeError) as raised:
                pm_plans_verify.run_aggregate_checks(
                    self.specs(), progress=False, timeout_seconds=10, jobs=3)
        self.assertEqual(str(raised.exception), "second could not be read")


LANDING_CHECK_PATH = ROOT / "scripts/pm-landing-check.py"

# Stands where scripts/pm-landing-check.py stands: its command line names that script, it writes the
# owner record with the real script's own function, and its children are the verifier processes.
# argv: cache-dir stamp report [report ...]
OWNER_HELPER = """
import importlib.util, os, subprocess, sys
from pathlib import Path
spec = importlib.util.spec_from_file_location("real_landing_check", {landing!r})
landing = importlib.util.module_from_spec(spec)
spec.loader.exec_module(landing)
cache, stamp = Path(sys.argv[1]), sys.argv[2]
nonce = landing.write_dedupe_owner(cache, stamp)
env = dict(os.environ)
env[landing.DEDUPE_DIR_ENV] = str(cache)
env[landing.DEDUPE_STAMP_ENV] = stamp
env[landing.DEDUPE_TOKEN_ENV] = nonce
for report in sys.argv[3:]:
    subprocess.run([sys.executable, {verifier!r}, "verify-spec-lock", "--report", report],
                   cwd={root!r}, env=env, check=False)
""".format(landing=str(LANDING_CHECK_PATH), verifier=str(MODULE_PATH), root=str(ROOT))


class DedupeOwnershipTests(unittest.TestCase):
    """Review B1: a cache is used only by the run that took it, never by an inherited environment pair."""

    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        self.scratch = Path(self._tmp.name)
        self.cache = self.scratch / "cache"
        self.cache.mkdir()
        self.helper = self.scratch / "pm-landing-check.py"
        self.helper.write_text(OWNER_HELPER, encoding="utf-8")

    def events(self):
        path = self.cache / pm_plans_verify.DEDUPE_EVENTS_FILE
        if not path.is_file():
            return []
        return [json.loads(line)["event"] for line in path.read_text(encoding="utf-8").splitlines()]

    def run_verifier(self, report, env):
        proc = subprocess.run(
            [sys.executable, str(MODULE_PATH), "verify-spec-lock", "--report", str(self.scratch / report)],
            cwd=ROOT, env=env, capture_output=True, text=True)
        self.assertIn(proc.returncode, (0, 1), proc.stderr)

    def owner_record(self, pid, start, nonce="nonce", stamp="stamp"):
        (self.cache / pm_plans_verify.DEDUPE_OWNER_FILE).write_text(json.dumps({
            "schema_id": "pm.landing_check.dedupe_owner.v1", "pid": pid, "process_start": start,
            "nonce": nonce, "stamp": stamp}) + "\n", encoding="utf-8")
        return {pm_plans_verify.DEDUPE_DIR_ENV: str(self.cache),
                pm_plans_verify.DEDUPE_STAMP_ENV: stamp,
                pm_plans_verify.DEDUPE_TOKEN_ENV: nonce}

    def test_a_pair_without_an_owner_record_is_refused(self):
        env = {**os.environ, pm_plans_verify.DEDUPE_DIR_ENV: str(self.cache),
               pm_plans_verify.DEDUPE_STAMP_ENV: "stamp"}
        self.run_verifier("one.json", env)
        self.assertEqual(self.events(), [])
        # ... and the pair is gone from the process, so its own children cannot inherit it either.
        probe = subprocess.run(
            [sys.executable, "-c",
             "import importlib.util, os, sys\n"
             "s = importlib.util.spec_from_file_location('v', %r)\n"
             "m = importlib.util.module_from_spec(s); s.loader.exec_module(m)\n"
             "sys.argv = ['v', 'verify-spec-lock', '--report', %r]\n"
             "m.main()\n"
             "print('DEDUPE_ENV=' + ','.join(sorted(k for k in os.environ "
             "if k.startswith('PM_PLANS_VERIFY_DEDUPE'))))\n"
             % (str(MODULE_PATH), str(self.scratch / "probe.json"))],
            cwd=ROOT, env=env, capture_output=True, text=True)
        self.assertIn("DEDUPE_ENV=\n", probe.stdout + "\n", probe.stdout + probe.stderr)

    def test_an_owner_that_is_not_a_live_landing_check_is_refused(self):
        # The test process is the verifier's parent but its command line is not the landing check.
        start = pm_plans_verify._process_start_token(os.getpid())
        env = {**os.environ, **self.owner_record(os.getpid(), start)}
        self.run_verifier("two.json", env)
        self.assertEqual(self.events(), [])

    def test_an_owner_record_with_a_reused_pid_is_refused(self):
        start = pm_plans_verify._process_start_token(os.getpid())
        env = {**os.environ, **self.owner_record(os.getpid(), str(int(start or 0) + 1))}
        self.run_verifier("three.json", env)
        self.assertEqual(self.events(), [])

    def test_an_owner_that_has_exited_is_refused(self):
        env = {**os.environ}
        subprocess.run([sys.executable, str(self.helper), str(self.cache), "stamp",
                        str(self.scratch / "owned.json")], cwd=ROOT, env=env, check=False)
        self.assertEqual(self.events(), ["run"])
        owner = json.loads((self.cache / pm_plans_verify.DEDUPE_OWNER_FILE).read_text(encoding="utf-8"))
        inherited = {**os.environ, pm_plans_verify.DEDUPE_DIR_ENV: str(self.cache),
                     pm_plans_verify.DEDUPE_STAMP_ENV: "stamp",
                     pm_plans_verify.DEDUPE_TOKEN_ENV: owner["nonce"]}
        self.run_verifier("after.json", inherited)
        # A refused cache records nothing, so the event list is the one run the helper made: the
        # inherited call neither added a run entry nor reused the entry as a hit.
        self.assertEqual(self.events(), ["run"])


class DedupeKeyTests(unittest.TestCase):
    def test_the_report_path_is_not_part_of_the_key(self):
        with tempfile.TemporaryDirectory() as scratch, mock.patch.dict(os.environ, {
            pm_plans_verify.DEDUPE_DIR_ENV: scratch,
            pm_plans_verify.DEDUPE_STAMP_ENV: "stamp",
        }), mock.patch.object(pm_plans_verify, "dedupe_owner", return_value={"pid": 1}):
            one = pm_plans_verify.dedupe_request(["cmd", "--report", "/tmp/a.json", "--flag", "1"])
            two = pm_plans_verify.dedupe_request(["cmd", "--report", "/tmp/b.json", "--flag", "1"])
            three = pm_plans_verify.dedupe_request(["cmd", "--report", "/tmp/a.json", "--flag", "2"])
        self.assertIsNotNone(one)
        self.assertIsNotNone(two)
        self.assertEqual(one[0], two[0])
        self.assertNotEqual(one[0], three[0])
        self.assertNotIn("--report", one[1]["argv"])
        self.assertNotIn("/tmp/a.json", one[1]["argv"])

    def test_no_landing_check_means_no_entry(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            self.assertIsNone(pm_plans_verify.dedupe_request(["cmd", "--report", "/tmp/a.json"]))


class DedupeRunsOnceTests(unittest.TestCase):
    """One landing check runs the same command line once and gives both aggregates that report."""

    def run_owned(self, cache, stamp, reports):
        helper = cache.parent / "pm-landing-check.py"
        helper.write_text(OWNER_HELPER, encoding="utf-8")
        proc = subprocess.run([sys.executable, str(helper), str(cache), stamp, *map(str, reports)],
                              cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)

    def events(self, cache):
        return [json.loads(line)["event"] for line in
                (cache / pm_plans_verify.DEDUPE_EVENTS_FILE).read_text(encoding="utf-8").splitlines()]

    def test_the_second_caller_gets_the_first_report_byte_for_byte(self):
        with tempfile.TemporaryDirectory() as scratch:
            cache = Path(scratch) / "cache"
            reports = [Path(scratch) / "one.json", Path(scratch) / "two.json"]
            self.run_owned(cache, "same-tree", reports)
            first = json.loads(reports[0].read_text(encoding="utf-8"))
            second = json.loads(reports[1].read_text(encoding="utf-8"))
            self.assertEqual(first, second)
            self.assertEqual(first["generated_at_utc"], second["generated_at_utc"])
            events = [json.loads(line) for line in
                      (cache / pm_plans_verify.DEDUPE_EVENTS_FILE).read_text(encoding="utf-8").splitlines()]
            self.assertEqual([event["event"] for event in events], ["run", "hit"])
            self.assertEqual(events[0]["argv"], events[1]["argv"])

    def test_a_changed_stamp_runs_the_command_again(self):
        with tempfile.TemporaryDirectory() as scratch:
            cache = Path(scratch) / "cache"
            for stamp in ("one-tree", "another-tree"):
                self.run_owned(cache, stamp, [Path(scratch) / f"{stamp}.json"])
            self.assertEqual(self.events(cache), ["run", "run"])


class SharedValidatorCommandLinesTests(unittest.TestCase):
    def test_the_shared_validators_map_to_one_command_line_each(self):
        import argparse

        timeout_seconds = 1800
        namespace = argparse.Namespace(subcheck_timeout_seconds=timeout_seconds)

        def command_line(name):
            return (
                pm_plans_verify._aggregate_subcheck_command_id(name),
                tuple(pm_plans_verify._aggregate_subcheck_cli_args(
                    name, namespace, timeout_seconds=timeout_seconds)),
            )

        run_names = [name for name, _, _ in pm_plans_verify.run_gates_check_specs(timeout_seconds)]
        audit_names = [name for name, _, _ in pm_plans_verify.audit_governance_check_specs(timeout_seconds)]
        audit_lines = {command_line(name) for name in audit_names}
        shared = [name for name in run_names if command_line(name) in audit_lines]
        # verify_spec_lock is the one exception: run-gates runs it in-process, not as a command.
        self.assertIn("verify_spec_lock", shared)
        deduped = [name for name in shared if name != "verify_spec_lock"]
        self.assertEqual(len(deduped), 34)
        for name in deduped:
            self.assertIn(command_line(name), audit_lines)


SLOT_PROBE = """
import importlib.util, os, sys, time
spec = importlib.util.spec_from_file_location("v", __MODULE__)
v = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v)
with v.validator_slot("probe"):
    with open(sys.argv[1], "a", encoding="utf-8") as handle:
        handle.write("start %.6f %d\\n" % (time.time(), os.getpid()))
    time.sleep(float(sys.argv[2]))
    with open(sys.argv[1], "a", encoding="utf-8") as handle:
        handle.write("end %.6f %d\\n" % (time.time(), os.getpid()))
"""


class ValidatorSlotsTests(unittest.TestCase):
    """Review N-F: --jobs is one budget for the whole check, and no validator starts below the floor."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        self.directory = Path(self._tmp.name) / "slots"
        self.directory.mkdir()

    def pool(self, count, floor_mb=0, available=None, sleep=None):
        import fcntl

        return pm_plans_verify.ValidatorSlots(
            self.directory, count, floor_mb, fcntl_module=fcntl,
            available=available or (lambda: 8192), sleep=sleep or (lambda seconds: None))

    def test_the_budget_is_shared_by_every_holder_in_one_process(self):
        import threading

        active = {"now": 0, "peak": 0}
        lock = threading.Lock()

        def work():
            with self.pool(2).hold("probe"):
                with lock:
                    active["now"] += 1
                    active["peak"] = max(active["peak"], active["now"])
                time.sleep(0.05)
                with lock:
                    active["now"] -= 1

        threads = [threading.Thread(target=work) for _ in range(6)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()
        self.assertGreater(active["peak"], 1)
        self.assertLessEqual(active["peak"], 2)

    def test_the_budget_is_shared_across_processes(self):
        script = self.directory.parent / "slot_probe.py"
        script.write_text(SLOT_PROBE.replace("__MODULE__", repr(str(MODULE_PATH))), encoding="utf-8")
        events = self.directory.parent / "events.log"
        env = dict(os.environ, **{pm_plans_verify.SLOTS_DIR_ENV: str(self.directory),
                                  pm_plans_verify.SLOTS_COUNT_ENV: "2",
                                  pm_plans_verify.MEMORY_FLOOR_MB_ENV: "0"})
        processes = [subprocess.Popen([sys.executable, str(script), str(events), "0.4"],
                                      cwd=ROOT, env=env) for _ in range(4)]
        self.assertEqual([process.wait(timeout=60) for process in processes], [0, 0, 0, 0])
        spans = []
        for line in events.read_text(encoding="utf-8").splitlines():
            kind, at, pid = line.split()
            spans.append((float(at), 1 if kind == "start" else -1))
        active = peak = 0
        for _at, change in sorted(spans):
            active += change
            peak = max(peak, active)
        self.assertEqual(peak, 2)

    def test_memory_below_the_floor_is_waited_out_and_said_so(self):
        import contextlib
        import io

        readings = iter([512, 512, 8192, 8192])
        slept = []
        pool = self.pool(1, 6144, available=lambda: next(readings), sleep=slept.append)
        errors = io.StringIO()
        with contextlib.redirect_stderr(errors):
            with pool.hold("validate-evidence"):
                self.assertEqual(slept, [pm_plans_verify.MEMORY_POLL_SECONDS] * 2)
        self.assertIn("waiting for memory", errors.getvalue())
        self.assertIn("memory is back", errors.getvalue())

    def test_a_slot_is_not_permission_to_start_below_the_floor(self):
        # Pre-wait high, post-slot low, then high: the first slot is released and the start waits.
        readings = [8192, 512, 8192, 8192]
        taken = []

        def available():
            taken.append(readings[len(taken)])
            return taken[-1]

        pool = self.pool(1, 6144, available=available, sleep=lambda seconds: None)
        starts = 0
        with pool.hold("validate-plan-graph"):
            starts += 1
        self.assertEqual(starts, 1)
        # Two pre-wait reads and two post-slot reads: the low post-slot read released the slot.
        self.assertEqual(taken, readings)

    def test_a_missing_slot_directory_never_hangs_the_validator(self):
        pool = pm_plans_verify.ValidatorSlots(
            self.directory / "absent", 2, 0, fcntl_module=__import__("fcntl"))
        with pool.hold("probe"):
            pass

    def test_a_standalone_run_has_no_budget(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            self.assertIsNone(pm_plans_verify.ValidatorSlots.from_environment())

    def test_the_standalone_aggregate_runs_one_subcheck_at_a_time(self):
        import argparse

        self.assertEqual(pm_plans_verify.default_jobs(), 1)
        self.assertEqual(pm_plans_verify.aggregate_jobs(argparse.Namespace()), 1)
        self.assertEqual(pm_plans_verify.aggregate_jobs(argparse.Namespace(jobs=4)), 4)
        self.assertEqual(pm_plans_verify.aggregate_jobs(argparse.Namespace(jobs=99)), pm_plans_verify.MAX_JOBS)
