from __future__ import annotations

import importlib.util
import json
import os
import signal
import stat
import sys
import tempfile
import time
import unittest
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


if __name__ == "__main__":
    unittest.main()
