"""Remote check and read-only receipt verification with private Git fixtures."""

from contextlib import redirect_stderr, redirect_stdout
from datetime import datetime, timedelta, timezone
import importlib.util
import io
import json
import os
from pathlib import Path
import re
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("pm_land", Path(__file__).with_name("pm-land.py"))
land = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(land)

# The setsid cleanup tests scan the real /proc. Scope the test worker's process inventory
# to the fixture: descendants of the test process or the long-job runner, plus members of
# the job's process group/session. Unrelated host processes (an unreadable
# /proc/<pid>/environ among them) must not decide the fixture's cleanup. Production keeps
# the full scan and its conservative unreadable-means-unverified behaviour.
_FIXTURE_PROC_SCOPE = '''
_fixture_real_listdir = os.listdir
def _fixture_proc_pids(entries):
    stats = {}
    for entry in entries:
        if entry.isdigit():
            try:
                fields = Path(f"/proc/{entry}/stat").read_text(encoding="utf-8", errors="replace").rsplit(")", 1)[1].split()
                stats[int(entry)] = (int(fields[1]), int(fields[2]), int(fields[3]))
            except (OSError, IndexError, ValueError):
                continue
    roots = {FIXTURE_TEST_PID}
    groups, sessions = set(), set()
    try:
        meta = read_json(proc_file(worktree_path(None)))
        job_dir = Path(meta["long_job_dir"])
        run = read_json(job_dir / "run.json")
        job = read_json(job_dir / "job.json")
        runner = run.get("runner_pid") or job.get("runner_pid")
        if type(runner) is int and runner > 0:
            roots.add(runner)
        for value in (run.get("pgid") or runner, meta.get("pgid")):
            if type(value) is int and value > 0:
                groups.add(value)
        for value in (runner, meta.get("sid")):
            if type(value) is int and value > 0:
                sessions.add(value)
    except (OSError, ValueError, KeyError, TypeError):
        pass
    keep = set()
    for pid, (ppid, pgid, sid) in stats.items():
        if pgid in groups or sid in sessions:
            keep.add(pid)
            continue
        ancestor = pid
        for _ in range(64):
            if ancestor in roots:
                keep.add(pid)
                break
            parent = stats.get(ancestor)
            if parent is None or parent[0] <= 1 or parent[0] == ancestor:
                break
            ancestor = parent[0]
    return keep
def _fixture_listdir(path):
    entries = _fixture_real_listdir(path)
    if path == "/proc":
        keep = _fixture_proc_pids(entries)
        return [entry for entry in entries if not entry.isdigit() or int(entry) in keep]
    return entries
os.listdir = _fixture_listdir
'''


class LandingFixture(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix="test-pm-land-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.shared = self.root / "shared"
        self.clone = self.root / "clone"
        self.origin = self.root / "origin.git"
        self.remote = self.root / "worker-tree"
        self.evidence = self.root / "evidence"
        self.runs = self.evidence / "scratch/landing-remote"
        self.folder = self.runs / "fixture-run"
        self.folder.mkdir(parents=True)
        self.path = self.folder / "record.json"
        self.branch = "fix/topic"
        self.ref = "refs/heads/" + self.branch
        self.ignore_file = "Plans/.audits/ignored.txt"
        self.raw_capture = f"{land.RAW_LINK}/capture.jsonl"
        patches = patch.multiple(
            land, EVIDENCE=self.evidence, RUNS=self.runs, SHARED=self.shared, CLONE=self.clone,
            MACHINES={host: socket.gethostname() for host in land.HOSTS},
        )
        patches.start()
        self.addCleanup(patches.stop)
        path_patcher = patch.object(land, "worktree_path", return_value=self.remote)
        path_patcher.start()
        self.addCleanup(path_patcher.stop)

        self.git(self.shared, "init", "-b", "main")
        self.git(self.shared, "config", "user.email", "fixture@example.invalid")
        self.git(self.shared, "config", "user.name", "Landing fixture")
        self.git(self.shared, "config", "core.hooksPath", str(self.root / "no-hooks"))
        self.put(self.shared, ".gitignore", "/Plans/.audits/\n/tests/agent_packet_restrictions\n")
        self.put(self.shared, "tracked.txt", "first\n")
        self.put(self.shared, "Plans/evidence.md", "tracked input\n")
        self.put(self.shared, land.RAW_MANIFEST, json.dumps({"entries": [{"path": self.raw_capture}]}))
        self.git(self.shared, "add", "--", ".gitignore", "tracked.txt", "Plans/evidence.md", land.RAW_MANIFEST)
        self.git(self.shared, "commit", "-m", "base")
        self.base = land.revision(self.shared, "HEAD")
        self.put(self.shared, "tracked.txt", "topic\n")
        self.git(self.shared, "commit", "-am", "candidate")
        self.head = land.revision(self.shared, "HEAD")
        self.tree = land.revision(self.shared, "HEAD^{tree}")
        self.git(self.shared, "branch", self.branch)
        self.git(self.shared, "clone", "--bare", str(self.shared), str(self.origin))
        self.git(self.origin, "update-ref", land.MAIN_REF, self.base, self.head)
        self.git(self.shared, "remote", "add", "origin", str(self.origin))
        self.git(self.shared, "fetch", "origin")
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "clone", str(self.origin), str(self.clone))
        self.git(self.clone, "config", "core.hooksPath", str(self.root / "no-hooks"))

        self.put(self.shared, self.ignore_file, "audit notes\n")
        self.put(self.shared, "Plans/.audits/whole/included.json", "{}\n")
        self.put(self.evidence / "raw", "capture.jsonl", "{}\n")
        (self.shared / land.RAW_LINK).symlink_to(self.evidence / "raw", target_is_directory=True)
        self.remote, self.manifest = land.prepare_remote(self.folder, self.ref, self.head, self.tree, self.base)
        self.record = self.make_record(1)

    def git(self, repository, *args, **kwargs):
        repository.mkdir(parents=True, exist_ok=True)
        return land.git(repository, *args, **kwargs)

    def put(self, root, name, content):
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def make_record(self, code, **changes):
        report = self.folder / "landing-check.json"
        land.write_json(report, {"schema_id": "pm.landing_check.report.v1", "commit": self.head,
                                 "base": self.base, "blocking": int(code == 2),
                                 "subcheck_timeout_seconds": land.TIMEOUT})
        record = {"schema": 2, "host": "nas1", "machine": socket.gethostname(), "topic": self.ref,
                  "worktree": str(self.remote), "full": True, "clean": True, "job": land.job_name(self.folder),
                  "head": self.head, "tree": self.tree, "base": self.base, "exit_code": code,
                  "report": str(report), "report_sha256": land.file_hash(report),
                  "row_report": None,
                  "row_report_sha256": None,
                  "started_utc": "2026-11-21T15:00:00+00:00", "ended_utc": "2026-11-21T15:20:00+00:00",
                  "ignored_inputs": self.manifest, "shard_exit_code": 0}
        record.update(changes)
        land.write_json(self.path, record)
        witness = land.receipt_witness(self.folder)
        witness.parent.mkdir(exist_ok=True)
        witness.write_text(land.file_hash(self.path) + "\n", encoding="ascii")
        return record

    def local_verify(self, host, *args, **kwargs):
        self.assertEqual(host, "nas1")
        self.assertEqual(args[:3], ("python3", "-B", "-"))
        self.assertIn("def verify_worker(", kwargs["input_text"])
        self.assertEqual(args[3:5], (str(self.folder), "nas1"))
        land.remote_verify(self.folder, args[5])
        return subprocess.CompletedProcess(args, 0, "", "")

    def verify(self, commit=None, base=None):
        with patch.object(land, "ssh", side_effect=self.local_verify):
            return land.verify_receipt(self.path, commit, base)

    def cleanup(self, state="done", status_exit=0, **status):
        name = land.job_name(self.folder)
        unit = f"long-job-{name}-000000"
        real_command = land.command

        def local_status(args, **kwargs):
            if args[0] == "long-job":
                self.assertEqual(args, ["long-job", "status", name, "--json"])
                return subprocess.CompletedProcess(
                    args, status_exit, json.dumps([{"name": name, "attempt": 1, "via": "systemd",
                                                   "unit": unit, "state": state, "code": 0,
                                                   "ended": "2026-11-21T15:20:00+00:00", **status}]),
                    "no job named " + name
                    if status_exit else "")
            if args[0] == "systemctl":
                return subprocess.CompletedProcess(
                    args, 0, "LoadState=not-found\nActiveState=inactive\nSubState=dead\nControlGroup=\n", "")
            return real_command(args, **kwargs)

        with patch.object(land, "command", side_effect=local_status):
            land.remote_cleanup(self.folder, "nas1")

    def test_public_cli_only_accepts_check_verify_and_the_two_batch_readers(self):
        script = Path(__file__).with_name("pm-land.py")
        result = subprocess.run(["python3", "-B", str(script), "--help"], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0)
        self.assertIn("{check,verify,batch-status,batch-check}", result.stdout)
        for removed in ("run", "inventory", "preflight", "fetch-main", "push-main", "_remote"):
            with self.subTest(command=removed):
                result = subprocess.run(["python3", "-B", str(script), removed], capture_output=True, text=True)
                self.assertEqual(result.returncode, 2)
                self.assertIn("invalid choice", result.stderr)

    def test_check_defaults_to_nas1_and_supports_1070ti(self):
        for flags, host in (([], "nas1"), (["--on", "1070ti"], "1070ti")):
            with self.subTest(host=host), patch.object(land, "check_topic", return_value=0) as check:
                self.assertEqual(land.main(["check", self.branch, *flags]), 0)
                self.assertEqual(check.call_args.args[1:], (self.branch, host))

    def test_check_reports_every_recorded_checker_exit_as_a_successful_run(self):
        git = land.git
        operations = []

        def read_only_git(root, *args, **kwargs):
            operations.append(args[0])
            return git(root, *args, **kwargs)

        for code in (0, 1, 2, 3):
            with self.subTest(code=code):
                self.make_record(code)
                output = io.StringIO()
                with (patch.object(land, "git", side_effect=read_only_git),
                      patch.object(land, "new_run", return_value=self.folder),
                      patch.object(land, "start_remote_job") as start,
                      patch.object(land, "cleanup_after_check") as clean, redirect_stdout(output)):
                    self.assertEqual(land.check_topic(self.shared, self.branch, "nas1"), 0)
                start.assert_called_once_with(self.folder, "nas1", self.ref, self.head, self.tree, self.base, self.base,
                                              False)
                clean.assert_called_once_with(self.folder, "nas1")
                self.assertIn(str(self.path), output.getvalue())
                self.assertIn(f"Landing checker exit {code}", output.getvalue())
        self.assertEqual(set(operations), {"rev-parse", "ls-remote", "merge-base"})
        self.assertEqual(land.revision(self.shared, "HEAD"), self.base)

    def test_check_refuses_unpushed_or_moved_topic(self):
        self.git(self.origin, "update-ref", self.ref, self.base, self.head)
        with (patch.object(land, "new_run") as new_run,
              self.assertRaisesRegex(land.Refusal, "local topic .* origin is")):
            land.check_topic(self.shared, self.branch, "nas1")
        new_run.assert_not_called()

    def test_remote_checkout_rejects_a_branch_that_moved_after_pin(self):
        self.git(self.origin, "update-ref", self.ref, self.base, self.head)
        with self.assertRaisesRegex(land.Refusal, "published topic .* moved before remote checkout"):
            land.prepare_remote(self.folder, self.ref, self.head, self.tree, self.base)

    def test_remote_check_runs_shard_and_checker_and_seals_receipt(self):
        self.cleanup()
        fresh_run = self.runs / "fresh"
        fresh_run.mkdir()
        calls = []

        def fake_capture(args, cwd, stdout, stderr):
            self.assertEqual(cwd, self.remote)
            calls.append(args)
            if args == land.SHARD:
                stdout.write_text("{}")
                return 0, 1
            land.write_json(stdout, {"schema_id": "pm.landing_check.report.v1", "commit": self.head,
                                     "base": self.base, "blocking": 1, "subcheck_timeout_seconds": 1800})
            return 2, 2

        with patch.object(land, "capture", side_effect=fake_capture):
            land.remote_check(fresh_run, "nas1", self.ref, self.head, self.tree, self.base)
        self.assertEqual(calls[0], land.SHARD)
        self.assertEqual(calls[1][:8], [*land.CHECK, "--base", self.base, "--subcheck-timeout-seconds", "1800", "--json"])
        path = fresh_run / "record.json"
        record = land.read_json(path)
        self.assertEqual((record["exit_code"], record["head"], record["tree"]), (2, self.head, self.tree))
        self.assertEqual(record["ignored_inputs"], self.manifest)
        self.assertEqual(record["cleanup_receipt"], str(fresh_run / "cleanup-receipt.json"))
        self.assertEqual(land.receipt_witness(fresh_run).read_text().strip(), land.file_hash(path))

    def test_a_batch_members_remote_check_asks_for_the_row_report_and_binds_it(self):
        self.cleanup()
        fresh_run = self.runs / "fresh-batch"
        fresh_run.mkdir()
        calls = []

        def fake_capture(args, cwd, stdout, stderr):
            calls.append(args)
            if args == land.SHARD:
                stdout.write_text("{}")
                return 0, 1
            if "--row-report" in args:
                rows = Path(args[args.index("--row-report") + 1])
                rows.write_text(json.dumps({"schema_id": land.ROW_REPORT_SCHEMA, "base": self.base, "subchecks": {}}))
            land.write_json(stdout, {"schema_id": "pm.landing_check.report.v1", "commit": self.head,
                                     "base": self.base, "blocking": 0, "subcheck_timeout_seconds": 1800})
            return 0, 2

        # This runs in the test process: a child subreaper set here would reparent the setsid test's orphan.
        with patch.object(land, "capture", side_effect=fake_capture), \
                patch.object(land, "enable_child_subreaper", return_value=False):
            land.remote_check(fresh_run, "nas1", self.ref, self.head, self.tree, self.base, self.base, True)
        self.assertIn("--row-report", calls[1])
        path = fresh_run / "record.json"
        record = land.read_json(path)
        self.assertEqual(record["row_report"], str(fresh_run / "rows.json"))
        self.assertEqual(record["row_report_sha256"], land.file_hash(fresh_run / "rows.json"))
        land.verify_record(fresh_run, record, "nas1", self.ref, self.head, self.tree, self.base)
        (fresh_run / "rows.json").write_text("{}", encoding="utf-8")
        with self.assertRaisesRegex(land.Refusal, "row report path or SHA-256 changed"):
            land.verify_record(fresh_run, record, "nas1", self.ref, self.head, self.tree, self.base)

    def test_transport_failure_preserves_evidence_and_avoids_cleanup(self):
        output = io.StringIO()
        with (redirect_stdout(output),patch.object(land, "new_run", return_value=self.folder),
              patch.object(land, "ssh", side_effect=[subprocess.CompletedProcess([], 255)] * 3) as ssh,
              patch.object(land.time, "sleep"), patch.object(land, "cleanup_after_check") as cleanup,
              self.assertRaisesRegex(land.TransportFailure, "--on 1070ti")):
            land.check_topic(self.shared, self.branch, "nas1")
        self.assertEqual(ssh.call_count, 3)
        cleanup.assert_not_called()
        self.assertEqual(land.read_json(self.folder / "transport-failure.json")["job"], land.job_name(self.folder))
        self.expect_preservation(output.getvalue(), "unknown")

    def test_wait_retry_resets_consecutive_transport_failures(self):
        statuses = (0, 255, 255, 124, 255, 255, 0)
        with (patch.object(land, "ssh", side_effect=[subprocess.CompletedProcess([], n) for n in statuses]) as ssh,
              patch.object(land.time, "sleep")):
            land.start_remote_job(self.folder, "nas1", self.ref, self.head, self.tree, self.base)
        self.assertEqual(ssh.call_count, len(statuses))
        self.assertEqual(ssh.call_args_list[0].args[1:4], ("long-job", "start", land.job_name(self.folder)))

    def test_sshed_cleanup_failure_preserves_success_and_reports_worktree(self):
        result = subprocess.CompletedProcess([], 3, "", f"preserving {self.remote}")
        output = io.StringIO()
        with (patch.object(land, "new_run", return_value=self.folder), patch.object(land, "start_remote_job"),
              patch.object(land, "ssh", return_value=result), redirect_stdout(output)):
            self.assertEqual(land.check_topic(self.shared, self.branch, "nas1"), 0)
        self.expect_preservation(output.getvalue(), "unknown")
        self.assertIn(str(self.path), output.getvalue())

    def expect_preservation(self, output, state):
        receipt_path = self.folder / "cleanup-receipt.json"
        notice = (f"preserved remote copy: nas1:{self.remote} "
                  f"(job {land.job_name(self.folder)}, state {state})")
        removal = f"ssh nas1-agent 'git -C {self.clone} worktree remove --force {self.remote}'"
        self.assertIn(notice, output)
        self.assertIn(removal, output)
        self.assertIn(str(receipt_path), output)
        receipt = land.read_json(receipt_path)
        self.assertEqual(receipt["preserved_remote_copy"], notice)
        self.assertEqual(receipt["remove_by_hand"], removal)
        self.assertTrue(self.remote.is_dir())

    def test_cleanup_preserves_failed_signalled_lost_and_unknown_jobs(self):
        original_receipt = self.path.read_bytes()
        cases = (("failed", 0, {"code": 3}, "failed"),
                 ("failed", 0, {"code": None, "signal": 15}, "failed"),
                 ("starting", 0, {}, "starting"),
                 ("running", 0, {}, "running"),
                 ("partial", 0, {}, "partial"),
                 ("lost", 0, {}, "lost"),
                 ("stopped", 0, {}, "stopped"),
                 ("done", 0, {"ended": None}, "done"),
                 ("", 2, {}, "unknown"))
        for state, status_exit, fields, expected in cases:
            with self.subTest(state=state, fields=fields):
                with redirect_stdout(io.StringIO()) as output:
                    self.cleanup(state, status_exit, **fields)
                self.expect_preservation(output.getvalue(), expected)
                self.assertEqual(self.path.read_bytes(), original_receipt)
        self.assertEqual(self.verify(), 0)

    def test_cleanup_records_failed_job_without_a_checker_receipt(self):
        self.path.rename(self.root / "saved-record.json")
        with redirect_stdout(io.StringIO()) as output:
            self.cleanup("failed", code=3)
        self.expect_preservation(output.getvalue(), "failed")
        self.assertFalse(self.path.exists())

    def test_cleanup_removes_only_a_confirmed_successful_owned_worktree(self):
        with redirect_stdout(io.StringIO()) as output:
            self.cleanup()
        self.assertIn(f"Removed temporary remote worktree {self.remote}", output.getvalue())
        self.assertFalse(self.remote.exists())
        self.assertFalse((self.folder / "cleanup-receipt.json").exists())
        self.assertTrue(self.clone.is_dir())

    def test_cleanup_does_not_remove_a_tree_without_the_run_owner(self):
        land.owner_file(self.remote).write_text("another-run\n")
        with self.assertRaisesRegex(land.Refusal, "ownership"):
            self.cleanup()
        self.assertTrue(self.remote.is_dir())

    def test_cleanup_preserves_remote_copy_on_checker_exit_three_even_when_job_is_done(self):
        self.make_record(3)
        original_receipt = self.path.read_bytes()
        with redirect_stdout(io.StringIO()) as output:
            self.cleanup()
        self.expect_preservation(output.getvalue(), "checker-exit-3")
        self.assertEqual(self.path.read_bytes(), original_receipt)

        # Missing receipt even with long-job state=done must also preserve the copy.
        self.path.rename(self.root / "removed-record.json")
        (self.folder / "cleanup-receipt.json").unlink()
        with redirect_stdout(io.StringIO()) as output:
            self.cleanup()
        self.expect_preservation(output.getvalue(), "missing-receipt")

    def test_cleanup_checks_systemd_unit_and_cgroup_before_removal(self):
        name = land.job_name(self.folder)
        unit = f"long-job-{name}-abc123"
        fake_cgroup_root = self.root / "cgroup"
        unit_cg = f"/user.slice/user-1000.slice/{unit}.service"
        (fake_cgroup_root / unit_cg.lstrip("/")).mkdir(parents=True)
        real_command = land.command

        def run_with(status_payload, show_stdout="", show_exit=0):
            def fake_command(args, **kwargs):
                if args[0] == "long-job":
                    return subprocess.CompletedProcess(args, 0, json.dumps([status_payload]), "")
                if args[0] == "systemctl":
                    return subprocess.CompletedProcess(args, show_exit, show_stdout, "systemctl error" if show_exit else "")
                return real_command(args, **kwargs)

            output = io.StringIO()
            with (patch.object(land, "command", side_effect=fake_command),
                  patch.object(land, "CGROUP_FS_ROOT", fake_cgroup_root, create=True),
                  patch.object(land, "CLEANUP_DRAIN_SECONDS", 0.0, create=True),
                  redirect_stdout(output)):
                land.remote_cleanup(self.folder, "nas1")
            return output.getvalue()

        base_status = {"name": name, "attempt": 1, "state": "done", "code": 0,
                       "ended": "2026-11-21T15:20:00+00:00", "signal": None}
        # Missing or unknown via must preserve.
        for bad_via in ({}, {"via": "other"}, {"via": "systemd", "unit": ""}):
            with self.subTest(bad_via=bad_via):
                out = run_with({**base_status, **bad_via})
                self.expect_preservation(out, "unverified-processes")

        # systemctl failure, active/deactivating/failed states, and non-empty cgroup.procs must preserve.
        systemd_status = {**base_status, "via": "systemd", "unit": unit}
        out = run_with(systemd_status, show_stdout="", show_exit=1)
        self.expect_preservation(out, "unverified-processes")

        for active, sub, expected_state in (
            ("active", "running", "active-processes"),
            ("deactivating", "stop-sigterm", "active-processes"),
            ("failed", "failed", "unverified-processes"),
        ):
            with self.subTest(active=active, sub=sub):
                show = f"LoadState=loaded\nActiveState={active}\nSubState={sub}\nControlGroup={unit_cg}\n"
                out = run_with(systemd_status, show_stdout=show)
                self.expect_preservation(out, expected_state)

        procs_file = fake_cgroup_root / unit_cg.lstrip("/") / "cgroup.procs"
        procs_file.write_text("424242\n", encoding="ascii")
        show_inactive = f"LoadState=loaded\nActiveState=inactive\nSubState=dead\nControlGroup={unit_cg}\n"
        out = run_with(systemd_status, show_stdout=show_inactive)
        self.expect_preservation(out, "active-processes")

        # Once cgroup.procs is empty and unit is inactive/dead, cleanup removes the worktree.
        procs_file.write_text("", encoding="ascii")
        (self.folder / "cleanup-receipt.json").unlink()
        out = run_with(systemd_status, show_stdout=show_inactive)
        self.assertIn(f"Removed temporary remote worktree {self.remote}", out)
        self.assertFalse(self.remote.exists())
        self.assertFalse((self.folder / "cleanup-receipt.json").exists())

    def prepare_setsid_worker(self, folder, worktree, check_script):
        shard_script = self.put(self.root, f"fake-shard-{folder.name}.py", "print('{}')\n")
        source = Path(__file__).with_name("pm-land.py").read_text(encoding="utf-8")
        marker = 'if __name__ == "__main__":'
        overrides = (
            f"EVIDENCE = Path({str(self.evidence)!r})\n"
            f"RUNS = Path({str(self.runs)!r})\n"
            f"SHARED = Path({str(self.shared)!r})\n"
            f"CLONE = Path({str(self.clone)!r})\n"
            f"MACHINES['nas1'] = {socket.gethostname()!r}\n"
            f"SHARD = ({sys.executable!r}, '-B', {str(shard_script)!r})\n"
            f"CHECK = ({sys.executable!r}, '-B', {str(check_script)!r})\n"
            f"CLEANUP_DRAIN_SECONDS = 2.0\n"
            f"def worktree_path(_folder):\n    return Path({str(worktree)!r})\n"
            f"FIXTURE_TEST_PID = {os.getpid()}\n"
        ) + _FIXTURE_PROC_SCOPE
        worker = folder / "worker.py"
        worker.write_text(source.replace(marker, overrides + marker), encoding="utf-8")
        return worker

    def kill_pid_if_matches(self, pid, start):
        try:
            stat_text = Path(f"/proc/{pid}/stat").read_text(encoding="utf-8")
            cur_start = stat_text.rsplit(")", 1)[1].split()[19]
        except (OSError, IndexError):
            return
        if cur_start == start:
            try:
                os.kill(pid, signal.SIGKILL)
            except OSError:
                pass

    def test_cleanup_preserves_setsid_job_while_detached_validator_descendant_is_alive(self):
        long_job = shutil.which("long-job")
        if not long_job or sys.platform != "linux":
            self.skipTest("installed long-job on Linux is required")
        lj_home = self.root / "long-job-home"
        lj_home.mkdir()
        env = {**os.environ, "LONG_JOB_HOME": str(lj_home)}

        # Case 1 (Astra finding 2): aggregate killed by SIGKILL while detached validator survives;
        # checker exits 3, worker records exit 3 and exits 0, long-job reports state=done code=0.
        folder1 = self.runs / "setsid-astra-f2"
        folder1.mkdir(parents=True)
        worktree1 = self.root / "setsid-tree-1"
        pidfile1 = self.root / "validator1.json"
        validator1 = self.put(self.root, "validator1.py", f"""import json, os, sys, time
from pathlib import Path
fh = open("tracked.txt", "rb")
start = Path(f"/proc/{{os.getpid()}}/stat").read_text().rsplit(")", 1)[1].split()[19]
Path({str(pidfile1)!r}).write_text(json.dumps({{"pid": os.getpid(), "start": start}}))
time.sleep(30)
fh.close()
""")
        aggregate1 = self.put(self.root, "aggregate1.py", f"""import subprocess, sys, time
subprocess.Popen([sys.executable, "-B", {str(validator1)!r}], start_new_session=True,
                 stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(30)
""")
        check1 = self.put(self.root, "check1.py", f"""import os, signal, subprocess, sys, time
from pathlib import Path
agg = subprocess.Popen([sys.executable, "-B", {str(aggregate1)!r}],
                       stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
deadline = time.monotonic() + 10
while not Path({str(pidfile1)!r}).is_file() and time.monotonic() < deadline:
    time.sleep(0.05)
os.kill(agg.pid, signal.SIGKILL)
agg.wait()
sys.exit(3)
""")
        worker1 = self.prepare_setsid_worker(folder1, worktree1, check1)
        job1 = land.job_name(folder1)
        try:
            start_res = subprocess.run(
                [long_job, "start", job1, "--via", "setsid", "--log", str(folder1 / "check.log"), "--",
                 sys.executable, "-B", str(worker1), "check", "nas1", self.ref, self.head, self.tree, self.base],
                env=env, capture_output=True, text=True, check=False,
            )
            self.assertEqual(start_res.returncode, 0, start_res.stdout + start_res.stderr)
            wait_res = subprocess.run([long_job, "wait", job1, "--timeout", "60"], env=env,
                                      capture_output=True, text=True, check=False)
            self.assertEqual(wait_res.returncode, 0, wait_res.stdout + wait_res.stderr)
            info1 = json.loads(subprocess.run([long_job, "status", job1, "--json"], env=env,
                                              capture_output=True, text=True, check=True).stdout)[0]
            self.assertEqual((info1["via"], info1["state"], info1["code"], info1["signal"]), ("setsid", "done", 0, None))
            self.assertEqual(land.read_json(folder1 / "record.json")["exit_code"], 3)

            v1 = land.read_json(pidfile1)
            self.addCleanup(self.kill_pid_if_matches, v1["pid"], v1["start"])
            clean1 = subprocess.run([sys.executable, "-B", str(worker1), "cleanup", "nas1"],
                                    env=env, capture_output=True, text=True, check=False)
            self.assertEqual(clean1.returncode, 0, clean1.stdout + clean1.stderr)
            self.assertTrue(worktree1.is_dir(), "worktree was removed while validator was alive")
            self.assertEqual(os.readlink(f"/proc/{v1['pid']}/cwd"), os.path.realpath(worktree1))
            self.assertIn(f"preserved remote copy: nas1:{worktree1}", clean1.stdout)
            self.assertTrue((folder1 / "cleanup-receipt.json").is_file())
        finally:
            if pidfile1.is_file():
                v1 = land.read_json(pidfile1)
                self.kill_pid_if_matches(v1["pid"], v1["start"])

        # Case 2: checker exits 0 with valid report, yet a detached descendant that cleared env and chdir("/") survives.
        folder2 = self.runs / "setsid-stealth-exit0"
        folder2.mkdir(parents=True)
        worktree2 = self.root / "setsid-tree-2"
        pidfile2 = self.root / "validator2.json"
        validator2 = self.put(self.root, "validator2.py", f"""import json, os, time
from pathlib import Path
os.chdir("/")
start = Path(f"/proc/{{os.getpid()}}/stat").read_text().rsplit(")", 1)[1].split()[19]
Path({str(pidfile2)!r}).write_text(json.dumps({{"pid": os.getpid(), "start": start}}))
time.sleep(30)
""")
        check2 = self.put(self.root, "check2.py", f"""import json, subprocess, sys, time
from pathlib import Path
subprocess.Popen([sys.executable, "-B", {str(validator2)!r}], cwd="/", env={{}}, start_new_session=True,
                 stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, close_fds=True)
deadline = time.monotonic() + 10
while not Path({str(pidfile2)!r}).is_file() and time.monotonic() < deadline:
    time.sleep(0.05)
print(json.dumps({{"schema_id": "pm.landing_check.report.v1", "commit": {self.head!r},
                   "base": {self.base!r}, "blocking": 0, "subcheck_timeout_seconds": {land.TIMEOUT}}}))
""")
        worker2 = self.prepare_setsid_worker(folder2, worktree2, check2)
        job2 = land.job_name(folder2)
        try:
            start_res = subprocess.run(
                [long_job, "start", job2, "--via", "setsid", "--log", str(folder2 / "check.log"), "--",
                 sys.executable, "-B", str(worker2), "check", "nas1", self.ref, self.head, self.tree, self.base],
                env=env, capture_output=True, text=True, check=False,
            )
            self.assertEqual(start_res.returncode, 0, start_res.stdout + start_res.stderr)
            wait_res = subprocess.run([long_job, "wait", job2, "--timeout", "60"], env=env,
                                      capture_output=True, text=True, check=False)
            self.assertEqual(wait_res.returncode, 0, wait_res.stdout + wait_res.stderr)
            self.assertEqual(land.read_json(folder2 / "record.json")["exit_code"], 0)
            v2 = land.read_json(pidfile2)
            self.addCleanup(self.kill_pid_if_matches, v2["pid"], v2["start"])
            clean2 = subprocess.run([sys.executable, "-B", str(worker2), "cleanup", "nas1"],
                                    env=env, capture_output=True, text=True, check=False)
            self.assertEqual(clean2.returncode, 0, clean2.stdout + clean2.stderr)
            self.assertTrue(worktree2.is_dir(), "worktree was removed while stealth descendant was alive")
            self.assertIn(f"preserved remote copy: nas1:{worktree2}", clean2.stdout)
            self.assertTrue((folder2 / "cleanup-receipt.json").is_file())
        finally:
            if pidfile2.is_file():
                v2 = land.read_json(pidfile2)
                self.kill_pid_if_matches(v2["pid"], v2["start"])

    def test_cleanup_removes_setsid_job_once_all_descendants_proven_ended(self):
        long_job = shutil.which("long-job")
        if not long_job or sys.platform != "linux":
            self.skipTest("installed long-job on Linux is required")
        lj_home = self.root / "long-job-home-clean"
        lj_home.mkdir()
        env = {**os.environ, "LONG_JOB_HOME": str(lj_home)}
        folder = self.runs / "setsid-clean-exit0"
        folder.mkdir(parents=True)
        worktree = self.root / "setsid-tree-clean"
        check_ok = self.put(self.root, "check_ok.py", f"""import json, subprocess, sys
child = subprocess.Popen([sys.executable, "-c", "pass"], start_new_session=True)
child.wait()
print(json.dumps({{"schema_id": "pm.landing_check.report.v1", "commit": {self.head!r},
                   "base": {self.base!r}, "blocking": 0, "subcheck_timeout_seconds": {land.TIMEOUT}}}))
""")
        worker = self.prepare_setsid_worker(folder, worktree, check_ok)
        job = land.job_name(folder)
        start_res = subprocess.run(
            [long_job, "start", job, "--via", "setsid", "--log", str(folder / "check.log"), "--",
             sys.executable, "-B", str(worker), "check", "nas1", self.ref, self.head, self.tree, self.base],
            env=env, capture_output=True, text=True, check=False,
        )
        self.assertEqual(start_res.returncode, 0, start_res.stdout + start_res.stderr)
        wait_res = subprocess.run([long_job, "wait", job, "--timeout", "60"], env=env,
                                  capture_output=True, text=True, check=False)
        self.assertEqual(wait_res.returncode, 0, wait_res.stdout + wait_res.stderr)
        self.assertTrue(worktree.is_dir())
        # First confirm that missing worker process metadata on a setsid job preserves the copy.
        meta_path = land.proc_file(worktree)
        saved_meta = meta_path.read_bytes()
        meta_path.unlink()
        clean_missing = subprocess.run([sys.executable, "-B", str(worker), "cleanup", "nas1"],
                                       env=env, capture_output=True, text=True, check=False)
        self.assertEqual(clean_missing.returncode, 0, clean_missing.stdout + clean_missing.stderr)
        self.assertTrue(worktree.is_dir())
        self.assertIn("state unverified-processes", clean_missing.stdout)
        meta_path.write_bytes(saved_meta)
        (folder / "cleanup-receipt.json").unlink()

        # Confirm that a live post-start process holding an open fd in the worktree also preserves the copy.
        holder = subprocess.Popen(
            [sys.executable, "-c", f"import time; fh = open({str(worktree / 'tracked.txt')!r}, 'rb'); time.sleep(30)"],
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        self.addCleanup(lambda: (holder.kill(), holder.wait()) if holder.poll() is None else None)
        deadline = time.monotonic() + 5
        while time.monotonic() < deadline:
            try:
                if any(os.readlink(f"/proc/{holder.pid}/fd/{fd}") == os.path.realpath(worktree / "tracked.txt")
                       for fd in os.listdir(f"/proc/{holder.pid}/fd")):
                    break
            except OSError:
                pass
            time.sleep(0.05)
        clean_fd = subprocess.run([sys.executable, "-B", str(worker), "cleanup", "nas1"],
                                  env=env, capture_output=True, text=True, check=False)
        self.assertEqual(clean_fd.returncode, 0, clean_fd.stdout + clean_fd.stderr)
        self.assertTrue(worktree.is_dir())
        self.assertIn("state active-processes", clean_fd.stdout)
        holder.kill()
        holder.wait()
        (folder / "cleanup-receipt.json").unlink()

        # A fixture descendant whose environ is unreadable must still preserve the copy:
        # production treats unreadable as unverified, whatever the process inventory.
        unreadable_pidfile = self.root / "unreadable-child.json"
        unreadable = subprocess.Popen(
            [sys.executable, "-c",
             "import ctypes, json, os, time\n"
             "from pathlib import Path\n"
             "ctypes.CDLL('libc.so.6', use_errno=True).prctl(4, 0, 0, 0, 0)\n"
             f"Path({str(unreadable_pidfile)!r}).write_text(json.dumps({{'pid': os.getpid()}}))\n"
             "time.sleep(30)\n"],
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        self.addCleanup(lambda: (unreadable.kill(), unreadable.wait()) if unreadable.poll() is None else None)
        deadline = time.monotonic() + 5
        while not unreadable_pidfile.is_file() and time.monotonic() < deadline:
            time.sleep(0.05)
        self.assertTrue(unreadable_pidfile.is_file())
        clean_unreadable = subprocess.run([sys.executable, "-B", str(worker), "cleanup", "nas1"],
                                          env=env, capture_output=True, text=True, check=False)
        self.assertEqual(clean_unreadable.returncode, 0, clean_unreadable.stdout + clean_unreadable.stderr)
        self.assertTrue(worktree.is_dir())
        self.assertIn("state unverified-processes", clean_unreadable.stdout)
        unreadable.kill()
        unreadable.wait()
        (folder / "cleanup-receipt.json").unlink()

        # An unrelated host process — orphaned to init, own session, unreadable environ —
        # must not decide this fixture's cleanup. This is the observed flake: the expected
        # process inventory ignores processes outside the fixture.
        orphan_pidfile = self.root / "orphan.json"
        orphan_launcher = subprocess.Popen(
            [sys.executable, "-c",
             "import ctypes, json, os, time\n"
             "from pathlib import Path\n"
             "if os.fork() != 0:\n"
             "    os._exit(0)\n"
             "os.setsid()\n"
             "os.chdir('/')\n"
             "ctypes.CDLL('libc.so.6', use_errno=True).prctl(4, 0, 0, 0, 0)\n"
             "start = Path(f'/proc/{os.getpid()}/stat').read_text().rsplit(')', 1)[1].split()[19]\n"
             f"Path({str(orphan_pidfile)!r}).write_text(json.dumps({{'pid': os.getpid(), 'start': start}}))\n"
             "time.sleep(30)\n"],
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        orphan_launcher.wait()
        deadline = time.monotonic() + 5
        while not orphan_pidfile.is_file() and time.monotonic() < deadline:
            time.sleep(0.05)
        self.assertTrue(orphan_pidfile.is_file())
        orphan = land.read_json(orphan_pidfile)
        self.addCleanup(self.kill_pid_if_matches, orphan["pid"], orphan["start"])
        orphan_ppid = int(Path(f"/proc/{orphan['pid']}/stat").read_text().rsplit(")", 1)[1].split()[1])
        self.assertNotEqual(orphan_ppid, os.getpid())
        with self.assertRaises(PermissionError):
            Path(f"/proc/{orphan['pid']}/environ").read_bytes()

        clean = subprocess.run([sys.executable, "-B", str(worker), "cleanup", "nas1"],
                               env=env, capture_output=True, text=True, check=False)
        self.assertEqual(clean.returncode, 0, clean.stdout + clean.stderr)
        self.assertIn(f"Removed temporary remote worktree {worktree}", clean.stdout)
        self.assertFalse(worktree.exists())
        self.assertFalse((folder / "cleanup-receipt.json").exists())

    def test_job_name_is_valid_with_long_mixed_case_branch(self):
        folder = land.new_run("fix/" + "Case" * 50, self.head)
        self.assertRegex(land.job_name(folder), r"^[a-z0-9][a-z0-9_.-]{0,63}$")

    def test_verify_after_cleanup_is_read_only_and_returns_zero_even_for_checker_exit_two(self):
        self.make_record(2)
        self.cleanup()
        self.assertFalse(self.remote.exists())
        self.assertTrue(land.receipt_witness(self.folder).is_file())
        files = [*self.folder.iterdir(), land.receipt_witness(self.folder), self.shared / ".git/index",
                 self.shared / ".git/FETCH_HEAD", self.clone / ".git/index"]
        before = {path: (path.read_bytes(), path.stat().st_mtime_ns) for path in files}
        with patch.object(land, "ssh", side_effect=self.local_verify):
            self.assertEqual(land.main(["verify", "--receipt", str(self.path)]), 0)
        self.assertEqual(before, {path: (path.read_bytes(), path.stat().st_mtime_ns) for path in files})
        self.assertEqual(set(self.folder.iterdir()), set(files[:-4]))
        self.assertFalse(self.remote.exists())

    def test_verify_validates_both_shared_checkout_publication_states(self):
        self.assertEqual(self.verify(self.head, self.base), 0)
        self.git(self.shared, "merge", "--ff-only", self.head)
        self.assertEqual(self.verify(self.head, self.base), 0)

    def test_verify_uses_a_read_only_worker_stream_after_remote_cleanup(self):
        self.cleanup()
        source = Path(__file__).with_name("pm-land.py").read_text()
        start = 'if __name__ == "__main__":'
        setup = f"RUNS = Path({str(self.runs)!r})\nCLONE = Path({str(self.clone)!r})\n"
        setup += f"MACHINES['nas1'] = {socket.gethostname()!r}\n"
        setup += f"def worktree_path(_folder):\n    return Path({str(self.remote)!r})\n"
        source = source.replace(start, setup + start)
        result = subprocess.run(["python3", "-B", "-", str(self.folder), "nas1", land.file_hash(self.path)],
                                input=source, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(set(self.folder.iterdir()), {self.path, self.folder / "landing-check.json"})

    def test_verify_transport_failure_is_bounded_and_preserves_the_receipt(self):
        raw = self.path.read_bytes()
        with (patch.object(land, "ssh", return_value=subprocess.CompletedProcess([], 255, "", "disconnected")) as ssh,
              patch.object(land.time, "sleep"),
              self.assertRaisesRegex(land.Refusal, "could not verify.*disconnected")):
            land.verify_receipt(self.path)
        self.assertEqual(ssh.call_count, 3)
        self.assertEqual(self.path.read_bytes(), raw)
        self.assertEqual(set(self.folder.iterdir()), {self.path, self.folder / "landing-check.json"})

    def test_verify_refuses_wrong_commit_tree_base_and_unattested_states(self):
        with self.assertRaisesRegex(land.Refusal, "receipt head"):
            self.verify(commit=self.base)
        with self.assertRaisesRegex(land.Refusal, "full 40-character"):
            self.verify(base=self.base[:12])
        with self.assertRaisesRegex(land.Refusal, "receipt base"):
            self.verify(base=self.head)
        for field, value, message in (("tree", self.head, "receipt tree"), ("full", False, "clean full"),
                                      ("clean", False, "clean full"), ("exit_code", 5, "exited unexpectedly")):
            with self.subTest(field=field):
                self.make_record(1, **{field: value})
                with self.assertRaisesRegex(land.Refusal, message):
                    self.verify()

    def test_verify_refuses_stale_tracking_base_and_moved_origin_even_if_tracking_still_matches(self):
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.head, self.base)
        with self.assertRaisesRegex(land.Refusal, "shared origin/main differs"):
            self.verify()
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base, self.head)
        self.git(self.origin, "update-ref", land.MAIN_REF, self.head, self.base)
        with self.assertRaisesRegex(land.Refusal, "origin/main moved"):
            self.verify()

    def test_verify_detects_moved_topic_at_origin(self):
        self.git(self.origin, "update-ref", self.ref, self.base, self.head)
        with self.assertRaisesRegex(land.Refusal, "published topic .* changed"):
            self.verify()

    def test_verify_refuses_a_tampered_report_or_receipt(self):
        report = self.folder / "landing-check.json"
        report.write_bytes(report.read_bytes() + b" ")
        with self.assertRaisesRegex(land.Refusal, "report path or SHA-256 changed"):
            self.verify()
        self.make_record(1)
        self.path.write_bytes(self.path.read_bytes() + b" ")
        with self.assertRaisesRegex(land.Refusal, "receipt SHA-256 changed"):
            self.verify()

    def test_verify_rechecks_the_retained_remote_checkout(self):
        self.git(self.remote, "checkout", "--detach", self.base)
        with self.assertRaisesRegex(land.Refusal, "remote HEAD"):
            self.verify()
        self.git(self.remote, "checkout", "--detach", self.head)
        self.git(self.remote, "config", "core.sparseCheckout", "true")
        with self.assertRaisesRegex(land.Refusal, "sparse"):
            self.verify()
        self.git(self.remote, "config", "core.sparseCheckout", "false")
        self.put(self.remote, "tracked.txt", "dirty")
        with self.assertRaisesRegex(land.Refusal, "remote worktree is dirty"):
            self.verify()
        self.git(self.remote, "update-index", "--assume-unchanged", "--", "tracked.txt")
        with self.assertRaisesRegex(land.Refusal, "hidden entries.*tracked.txt"):
            self.verify()

    def test_shared_preflight_rejects_tracked_dirt_and_hidden_flags(self):
        name = "Plans/evidence.md"
        for state in ("unstaged", "staged", "skip-worktree", "assume-unchanged"):
            with self.subTest(state=state):
                if state in ("unstaged", "staged"):
                    self.put(self.shared, name, "another edition")
                    if state == "staged":
                        self.git(self.shared, "add", "--", name)
                else:
                    self.git(self.shared, "update-index", "--" + state, "--", name)
                reason = "has staged changes" if state == "staged" else "uncommitted changes or hidden index flags"
                with self.assertRaisesRegex(land.Refusal, f"{reason}.*{name}"):
                    self.verify()
                if state in ("unstaged", "staged"):
                    self.git(self.shared, "restore", "--source=HEAD", "--staged", "--worktree", "--", name)
                else:
                    self.git(self.shared, "update-index", "--no-" + state, "--", name)
                self.assertEqual(land.revision(self.shared, "HEAD"), self.base)

    def test_verify_preserves_unrelated_staged_and_working_edits_from_the_review(self):
        repo = Path(__file__).resolve().parents[1]
        readme = "README.md"
        rules = ".claude/CLAUDE.md"
        readme_base = self.git(repo, "show", f"b19f171724:{readme}").stdout
        readme_staged = self.git(repo, "show", f"83de797cb7:{readme}").stdout
        rules_base = self.git(repo, "show", f"b19f171724:{rules}").stdout
        rules_topic = self.git(repo, "show", f"22a1e3b754:{rules}").stdout
        self.assertNotEqual(readme_base, readme_staged)
        self.assertNotEqual(rules_base, rules_topic)

        previous_base, previous_tip = self.base, self.head
        target = self.put(self.shared, readme, readme_base)
        self.put(self.shared, rules, rules_base)
        self.git(self.shared, "add", "--", readme, rules)
        self.git(self.shared, "commit", "-m", "review base")
        self.base = land.revision(self.shared, "HEAD")
        self.put(self.shared, rules, rules_topic)
        self.git(self.shared, "commit", "-am", "topic changes only Claude rules")
        self.head = land.revision(self.shared, "HEAD")
        self.tree = land.revision(self.shared, "HEAD^{tree}")
        self.git(self.origin, "fetch", str(self.shared), land.MAIN_REF)
        self.git(self.origin, "update-ref", land.MAIN_REF, self.base, previous_base)
        self.git(self.origin, "update-ref", self.ref, self.head, previous_tip)
        self.git(self.shared, "fetch", "origin")
        self.git(self.shared, "reset", "--keep", self.base)
        self.cleanup()
        self.remote, self.manifest = land.prepare_remote(self.folder, self.ref, self.head, self.tree, self.base)
        self.make_record(0)
        self.assertEqual(land.changed_paths(self.shared, self.base, self.head), {rules})
        target.write_text(readme_staged, encoding="utf-8")
        self.git(self.shared, "add", "--", readme)
        target.write_text(readme_base, encoding="utf-8")

        for shared_head in (self.base, self.head):
            with self.subTest(shared_head=shared_head):
                if shared_head == self.head:
                    self.git(self.shared, "merge", "--ff-only", "--no-overwrite-ignore", self.head)
                index = self.shared / ".git/index"
                before = (index.read_bytes(), index.stat().st_mtime_ns, target.read_bytes())
                self.assertEqual(self.git(self.shared, "status", "--porcelain").stdout, "MM README.md\n")
                with self.assertRaisesRegex(land.Refusal, "shared checkout has staged changes: README.md"):
                    self.verify()
                self.assertEqual((index.read_bytes(), index.stat().st_mtime_ns, target.read_bytes()), before)
                self.assertEqual(self.git(self.shared, "show", ":README.md").stdout, readme_staged)
                self.assertEqual(land.revision(self.shared, "HEAD"), shared_head)

    def test_verify_names_all_staged_paths_including_intent_to_add(self):
        self.put(self.shared, "extra-a.txt", "staged")
        self.put(self.shared, "extra-b.txt", "intent to add")
        self.git(self.shared, "add", "--", "extra-a.txt")
        self.git(self.shared, "add", "-N", "--", "extra-b.txt")
        with self.assertRaisesRegex(land.Refusal, r"shared checkout has staged changes: extra-a\.txt, extra-b\.txt"):
            self.verify()

    def test_verify_refuses_deleted_claude_rules_on_the_historical_decision_log_topic(self):
        repo = Path(__file__).resolve().parents[1]
        rules = ".claude/CLAUDE.md"
        owner = "Plans/Decision_Log.md"
        self.put(self.shared, rules, self.git(repo, "show", f"516a7c96a2:{rules}").stdout)
        self.put(self.shared, owner, self.git(repo, "show", f"516a7c96a2:{owner}").stdout)
        self.git(self.shared, "add", "--", rules, owner)
        self.git(self.shared, "commit", "-m", "historical path-reference base")
        previous_base, previous_tip = self.base, self.head
        self.base = land.revision(self.shared, "HEAD")
        self.put(self.shared, owner, self.git(repo, "show", f"bf939041db:{owner}").stdout)
        self.git(self.shared, "commit", "-am", "historical decision log update")
        self.head = land.revision(self.shared, "HEAD")
        self.tree = land.revision(self.shared, "HEAD^{tree}")
        self.git(self.origin, "fetch", str(self.shared), land.MAIN_REF)
        self.git(self.origin, "update-ref", land.MAIN_REF, self.base, previous_base)
        self.git(self.origin, "update-ref", self.ref, self.head, previous_tip)
        self.git(self.shared, "fetch", "origin")
        self.git(self.shared, "reset", "--keep", self.base)
        self.cleanup()
        self.remote, self.manifest = land.prepare_remote(self.folder, self.ref, self.head, self.tree, self.base)
        self.make_record(1)
        self.assertEqual(land.changed_paths(self.shared, self.base, self.head), {owner})
        self.assertEqual(self.verify(), 0)

        target = self.shared / rules
        saved = target.rename(self.root / "saved-claude.md")
        index = self.shared / ".git/index"
        before = (index.read_bytes(), index.stat().st_mtime_ns, saved.read_bytes())
        self.assertEqual(self.git(self.shared, "status", "--porcelain").stdout, f" D {rules}\n")
        with self.assertRaisesRegex(land.Refusal, r"\.claude/CLAUDE\.md"):
            self.verify()
        self.assertFalse(target.exists())
        self.assertEqual((index.read_bytes(), index.stat().st_mtime_ns, saved.read_bytes()), before)
        self.assertEqual(land.revision(self.shared, "HEAD"), self.base)
        saved.rename(target)
        for flag in ("assume-unchanged", "skip-worktree"):
            with self.subTest(flag=flag):
                self.git(self.shared, "update-index", "--" + flag, "--", rules)
                with self.assertRaisesRegex(land.Refusal, r"hidden index flags: \.claude/CLAUDE\.md"):
                    self.verify()
                self.git(self.shared, "update-index", "--no-" + flag, "--", rules)

    def rollback_check(self, candidate, target):
        errors = io.StringIO()
        with redirect_stderr(errors):
            result = land.main(["verify", "--rollback-check", "--from", candidate, "--to", target])
        return result, errors.getvalue()

    def test_rollback_refuses_the_ignored_file_preserved_by_the_historical_fast_forward(self):
        repo = Path(__file__).resolve().parents[1]
        name = "Concepts/chat-assistant-concepts/5.6 Pro/tests/stop-chip-beat-verify.mjs"
        ignored = self.git(repo, "show", f"919945cd08:{name}").stdout
        restored = self.git(repo, "show", f"4c47382d36f9:{name}").stdout
        with (self.shared / ".gitignore").open("a", encoding="utf-8") as gitignore:
            gitignore.write(f"/{name}\n")
        self.git(self.shared, "commit", "-am", "older shared checkout ignores the local verifier")
        older = land.revision(self.shared, "HEAD")
        path = self.put(self.shared, name, restored)
        self.git(self.shared, "add", "-f", "--", name)
        self.git(self.shared, "commit", "-m", "primary tracks the verifier")
        target = land.revision(self.shared, "HEAD")
        self.assertEqual(land.revision(self.shared, f"{target}:{name}"), "9e07d1e784e6c4dc8880651692c7a24e54d1075d")
        self.git(self.shared, "rm", "--cached", "--", name)
        self.git(self.shared, "commit", "-m", "unpublished candidate drops the verifier")
        candidate = land.revision(self.shared, "HEAD")
        path.rename(self.root / "restored-verifier.mjs")
        self.git(self.shared, "reset", "--keep", older)
        self.put(self.shared, name, ignored)
        self.git(self.shared, "check-ignore", "--quiet", "--", name)
        self.git(self.shared, "merge", "--ff-only", "--no-overwrite-ignore", candidate)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, target)
        self.assertEqual(self.git(self.shared, "status", "--porcelain").stdout, "")
        self.assertEqual(self.git(self.shared, "hash-object", "--", name).stdout.strip(),
                         "9618db6812213836b215250c17065d891cef504d")
        index = self.shared / ".git/index"
        before = (index.read_bytes(), index.stat().st_mtime_ns, path.read_bytes())

        result, errors = self.rollback_check(candidate, target)
        self.assertEqual(result, 3, errors)
        self.assertIn(name, errors)
        self.assertEqual((index.read_bytes(), index.stat().st_mtime_ns, path.read_bytes()), before)
        self.assertEqual(land.revision(self.shared, "HEAD"), candidate)
        path.rename(self.root / "preserved-verifier.mjs")
        self.assertEqual(self.rollback_check(candidate, target), (0, ""))

        path.mkdir()
        self.put(path, "local-notes.txt", "untracked directory contents\n")
        result, errors = self.rollback_check(candidate, target)
        self.assertEqual(result, 3, errors)
        self.assertIn(name, errors)
        path.rename(self.root / "preserved-dir")
        path.parent.rename(self.root / "preserved-parent-dir")
        path.parent.write_text("untracked parent file\n", encoding="utf-8")
        result, errors = self.rollback_check(candidate, target)
        self.assertEqual(result, 3, errors)
        self.assertIn(str(path.parent.relative_to(self.shared)), errors)
        self.assertEqual(path.parent.read_text(), "untracked parent file\n")
        path.parent.rename(self.root / "preserved-parent-file")

        self.put(self.shared, "tracked.txt", "staged before rollback\n")
        self.git(self.shared, "add", "--", "tracked.txt")
        result, errors = self.rollback_check(candidate, target)
        self.assertEqual(result, 3, errors)
        self.assertIn("shared checkout has staged changes: tracked.txt", errors)
        self.assertEqual(self.git(self.shared, "show", ":tracked.txt").stdout, "staged before rollback\n")

    def test_rollback_refuses_unstaged_tracked_deletion_modification_and_hidden_flags(self):
        repo = Path(__file__).resolve().parents[1]
        name = ".github/workflows/assistant-v3-matrix-publication.yml"
        target_blob = self.git(repo, "show", f"8e27ca6832:{name}").stdout
        candidate_blob = self.git(repo, "show", f"8eacd40516:{name}").stdout
        self.assertNotEqual(target_blob, candidate_blob)

        self.put(self.shared, name, target_blob)
        self.git(self.shared, "add", "--", name)
        self.git(self.shared, "commit", "-m", "historical workflow target")
        target = land.revision(self.shared, "HEAD")
        self.put(self.shared, name, candidate_blob)
        self.git(self.shared, "commit", "-am", "historical workflow candidate")
        candidate = land.revision(self.shared, "HEAD")
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, target)
        self.assertEqual(self.rollback_check(candidate, target), (0, ""))

        workflow = self.shared / name
        saved = workflow.rename(self.root / "saved-workflow.yml")
        index = self.shared / ".git/index"
        before = (index.read_bytes(), index.stat().st_mtime_ns)
        self.assertEqual(self.git(self.shared, "status", "--porcelain").stdout, f" D {name}\n")
        result, errors = self.rollback_check(candidate, target)
        self.assertEqual(result, 3, errors)
        self.assertIn(name, errors)
        self.assertFalse(workflow.exists())
        self.assertEqual((index.read_bytes(), index.stat().st_mtime_ns), before)
        self.assertEqual(land.revision(self.shared, "HEAD"), candidate)

        saved.rename(workflow)
        workflow.write_text(candidate_blob + "\n# local edit\n", encoding="utf-8")
        self.assertEqual(self.git(self.shared, "status", "--porcelain").stdout, f" M {name}\n")
        result, errors = self.rollback_check(candidate, target)
        self.assertEqual(result, 3, errors)
        self.assertIn(name, errors)
        self.assertTrue(workflow.read_text(encoding="utf-8").endswith("# local edit\n"))
        self.assertEqual(land.revision(self.shared, "HEAD"), candidate)

        workflow.write_text(candidate_blob, encoding="utf-8")
        for flag in ("assume-unchanged", "skip-worktree"):
            with self.subTest(flag=flag):
                self.git(self.shared, "update-index", "--" + flag, "--", name)
                result, errors = self.rollback_check(candidate, target)
                self.assertEqual(result, 3, errors)
                self.assertIn(name, errors)
                self.git(self.shared, "update-index", "--no-" + flag, "--", name)
        self.assertEqual(self.rollback_check(candidate, target), (0, ""))

    def test_verify_refuses_dirty_shared_checkout_modified_deleted_staged_and_mid_scan(self):
        note = "notes.txt"
        self.put(self.shared, note, "base note\n")
        self.git(self.shared, "add", "--", note)
        self.git(self.shared, "commit", "-m", "add unrelated tracked file")
        previous_base, previous_tip = self.base, self.head
        self.base = land.revision(self.shared, "HEAD")
        self.put(self.shared, "tracked.txt", "topic edit\n")
        self.git(self.shared, "commit", "-am", "topic changes only tracked.txt")
        self.head = land.revision(self.shared, "HEAD")
        self.tree = land.revision(self.shared, "HEAD^{tree}")
        self.git(self.origin, "fetch", str(self.shared), land.MAIN_REF)
        self.git(self.origin, "update-ref", land.MAIN_REF, self.base, previous_base)
        self.git(self.origin, "update-ref", self.ref, self.head, previous_tip)
        self.git(self.shared, "fetch", "origin")
        self.git(self.shared, "reset", "--keep", self.base)
        self.cleanup()
        self.remote, self.manifest = land.prepare_remote(self.folder, self.ref, self.head, self.tree, self.base)
        self.make_record(0)

        def run_verify():
            errors = io.StringIO()
            with patch.object(land, "ssh", side_effect=self.local_verify), redirect_stderr(errors):
                return land.main(["verify", "--receipt", str(self.path)]), errors.getvalue()

        note_path = self.shared / note
        note_path.write_text("modified note\n", encoding="utf-8")
        code, errors = run_verify()
        self.assertEqual(code, 3, errors)
        self.assertIn(note, errors)
        self.assertEqual(note_path.read_text(encoding="utf-8"), "modified note\n")

        saved_note = note_path.rename(self.root / "saved-note.txt")
        code, errors = run_verify()
        self.assertEqual(code, 3, errors)
        self.assertIn(note, errors)
        self.assertFalse(note_path.exists())
        saved_note.rename(note_path)

        # Simultaneous staged addition, unstaged modification, and unstaged deletion: all paths named.
        self.put(self.shared, "staged-extra.txt", "staged\n")
        self.git(self.shared, "add", "--", "staged-extra.txt")
        note_path.write_text("modified while staged\n", encoding="utf-8")
        saved_tracked = (self.shared / "tracked.txt").rename(self.root / "saved-tracked.txt")
        code, errors = run_verify()
        self.assertEqual(code, 3, errors)
        for path in ("staged-extra.txt", note, "tracked.txt"):
            self.assertIn(path, errors)
        saved_tracked.rename(self.shared / "tracked.txt")
        self.git(self.shared, "rm", "-f", "--", "staged-extra.txt")
        note_path.write_text("base note\n", encoding="utf-8")
        self.assertEqual(run_verify(), (0, ""))

        # Mid-scan tracked modification and deletion during guarded_input_manifest.
        real_guarded = land.guarded_input_manifest
        for mode in ("modify", "delete"):
            with self.subTest(mid_scan=mode):
                def mutate_mid_scan(root, candidate, _mode=mode):
                    manifest = real_guarded(root, candidate)
                    if root == self.shared:
                        if _mode == "modify":
                            note_path.write_text("edited mid-scan\n", encoding="utf-8")
                        else:
                            note_path.rename(self.root / "mid-scan-deleted-note.txt")
                    return manifest

                with patch.object(land, "guarded_input_manifest", side_effect=mutate_mid_scan):
                    code, errors = run_verify()
                self.assertEqual(code, 3, errors)
                self.assertIn(note, errors)
                if mode == "delete":
                    (self.root / "mid-scan-deleted-note.txt").rename(note_path)
                else:
                    note_path.write_text("base note\n", encoding="utf-8")

    def test_landing_rules_describe_the_remote_route_and_the_batch(self):
        repo = Path(__file__).resolve().parents[1]
        sections = [path.read_text().split("### How to land on main\n")[1].split("### Never\n")[0]
                    for path in (repo / "AGENTS.md", repo / ".claude/CLAUDE.md")]
        self.assertEqual(sections[0], sections[1])
        for phrase in ("check <branch> --on <host>", "PM_LAND_SCRIPT", "verify --receipt", "--no-overwrite-ignore",
                       "default `nas1`", "verify` exiting 0 confirms only", "every 25 minutes",
                       "commit", "tree", "base", "ignored-input inventory", "report SHA-256", "exit",
                       "Land in batches", "check <branch> --on nas1 --base <batch-start>",
                       "verify --receipt <path> --commit <full SHA> --batch-start <batch-start>",
                       "batch-start: <full SHA of origin/main before the batch's first landing>",
                       "batch-landing: <branch> <main SHA it pushed> <the record.json its check printed>",
                       "batch-check", "batch-status", "PUBLISH_LEASE",
                       "four landings and two hours", "never refresh the snapshot or baseline in the middle of a batch"):
            self.assertIn(phrase, sections[0])
        # The local-copy route and the scripted Plans follow-up move to the batching task (pm7-build, option B).
        self.assertNotIn("Checks on a local copy", sections[0])

    def test_ignored_input_membership_and_bytes_must_match_on_either_side(self):
        path = "Plans/.audits/usage-successor/governance/auto-decision-receipt.json"
        for root in (self.shared, self.remote):
            with self.subTest(root=root):
                added = self.put(root, path, '{"ref":"ContractName:Plans/Fixture.md"}')
                with self.assertRaisesRegex(land.Refusal, "ignored input mismatch:.*auto-decision-receipt"):
                    self.verify()
                added.unlink()
                edited = self.put(root, self.ignore_file, "new edition")
                with self.assertRaisesRegex(land.Refusal, "ignored input mismatch:.*ignored.txt"):
                    self.verify()
                edited.write_text("audit notes\n")
                edited.unlink()
                with self.assertRaisesRegex(land.Refusal, "ignored input mismatch:.*ignored.txt"):
                    self.verify()
                edited.write_text("audit notes\n")

    def test_changed_raw_capture_rehashed_even_though_both_links_share_the_target(self):
        self.put(self.evidence / "raw", "capture.jsonl", '{"new": true}\n')
        with self.assertRaisesRegex(land.Refusal, "ignored input mismatch:.*capture.jsonl"):
            self.verify()

    def test_guarded_verify_rescans_a_receipt_replaced_after_its_hash(self):
        name = f"{land.READINESS}/VALIDATOR_RECEIPT.json"
        later_name = f"{land.READINESS}/ZZ_LAST.json"
        archive = Path("/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261114/currentness-final")
        approved = archive / "VALIDATOR_RECEIPT.json"
        original = approved.read_text() if approved.is_file() else '{"generated_at_utc":"previous"}\n'
        replacement = json.loads(original)
        replacement["generated_at_utc"] = "2026-11-21T20:49:00+00:00"
        for root in (self.shared, self.remote):
            self.put(root, name, original)
            self.put(root, later_name, "{}\n")
        self.manifest = land.guarded_input_manifest(self.remote, self.head)
        self.make_record(0)
        edited = self.put(self.root, "reissued.json", json.dumps(replacement))
        real_hash = land.regular_hash
        hashes = []

        def change_during_scan(root, current, **kwargs):
            digest = real_hash(root, current, **kwargs)
            if root == self.shared:
                if current == name:
                    hashes.append(digest)
                elif current == later_name and edited.exists():
                    self.assertEqual(hashes, [self.manifest[name]])
                    edited.replace(root / name)
            return digest

        with (patch.object(land, "regular_hash", side_effect=change_during_scan),
              self.assertRaisesRegex(land.Refusal, f"shared publication ignored input mismatch: {name}")):
            self.verify()
        self.assertEqual(hashes, [self.manifest[name], land.file_hash(self.shared / name)])

    def test_preflight_refuses_historical_ignored_schema_promotion(self):
        repo = Path(__file__).resolve().parents[1]
        path = "tests/fixtures/governance/raw_evidence_capture_modes.schema.json"
        commit = "289983decc7bbecb595d5de767647eb8c8bc4c8c"
        schema = self.git(repo, "show", f"{commit}:{path}", check=False)
        if schema.returncode:
            self.skipTest("fixture promotion history is unavailable")
        self.put(self.shared, ".gitignore", self.git(repo, "show", f"{commit}^:.gitignore").stdout)
        self.git(self.shared, "add", "--", ".gitignore")
        self.git(self.shared, "commit", "-m", "prior ignore policy")
        base = land.revision(self.shared, "HEAD")
        self.put(self.shared, ".gitignore", self.git(repo, "show", f"{commit}:.gitignore").stdout)
        self.put(self.shared, path, schema.stdout)
        self.git(self.shared, "add", "--", ".gitignore", path)
        self.git(self.shared, "commit", "-m", "promote schema")
        candidate = land.revision(self.shared, "HEAD")
        self.git(self.shared, "reset", "--keep", base)
        local = self.put(self.shared, path, "ignored local schema bytes\n")
        self.assertEqual(self.git(self.shared, "check-ignore", path).stdout.strip(), path)
        with self.assertRaisesRegex(land.Refusal, "candidate would overwrite ignored files:.*raw_evidence_capture"):
            land.publication_preflight(self.shared, base, candidate, {})
        self.assertEqual(local.read_text(), "ignored local schema bytes\n")

    def test_copy_discovers_nested_ignored_contract_inputs(self):
        self.put(self.shared, "Plans/.audits/later/new-notes.MD", "ContractName:Plans/Fixture.md")
        self.put(self.shared, "Plans/.audits/later/unused.mp4", "unread artifact")
        fresh = self.root / "fresh"
        self.git(self.shared, "worktree", "add", "--detach", str(fresh), self.head)
        manifest = land.copy_inputs(self.shared, fresh)
        self.assertIn("Plans/.audits/later/new-notes.MD", manifest)
        self.assertEqual((fresh / "Plans/.audits/later/new-notes.MD").read_text(),
                         "ContractName:Plans/Fixture.md")
        self.assertNotIn("Plans/.audits/later/unused.mp4", manifest)

    def test_inventory_uses_gui_validator_selection_outside_test_fixtures(self):
        repo = Path(__file__).resolve().parents[1]
        name = "tests/test_v3_residuals.js"
        historical = self.git(repo, "show", f"956ce278dc:{name}", check=False)
        if historical.returncode:
            self.skipTest("historical GUI source is unavailable")
        self.put(self.shared, land.GUI_POLICY, (repo / land.GUI_POLICY).read_text())
        ignore = self.shared / ".gitignore"
        ignore.write_text(ignore.read_text() + f"/{name}\n/tests/node_modules/\n/tests/unchecked.txt\n")
        self.git(self.shared, "add", "--", land.GUI_POLICY, ".gitignore")
        self.git(self.shared, "commit", "-m", "GUI validator and ignore rules")
        self.put(self.shared, name, historical.stdout)
        self.put(self.shared, "tests/node_modules/generated.js", "excluded source")
        self.put(self.shared, "tests/unchecked.txt", "unselected file type")
        candidate = land.revision(self.shared, "HEAD")
        fresh = self.root / "gui-copy"
        self.git(self.shared, "worktree", "add", "--detach", str(fresh), candidate)
        manifest = land.copy_inputs(self.shared, fresh)
        self.assertEqual((fresh / name).read_text(), historical.stdout)
        self.assertIn(name, manifest)
        self.assertNotIn("tests/node_modules/generated.js", manifest)
        self.assertNotIn("tests/unchecked.txt", manifest)
        self.assertEqual(land.input_manifest(self.shared, self.shared, land.tracklist(self.shared, candidate),
                                            candidate), manifest)

    def test_gui_sources_outside_tests_are_bound_when_ignored_and_refused_when_visible(self):
        repo = Path(__file__).resolve().parents[1]
        name = "src/gui/public/favicon.svg"
        historical = self.git(repo, "show", f"75362beb00:{name}", check=False)
        svg = historical.stdout if not historical.returncode else '<svg xmlns="http://www.w3.org/2000/svg"></svg>\n'
        self.put(self.shared, land.GUI_POLICY, (repo / land.GUI_POLICY).read_text())
        self.git(self.shared, "add", "--", land.GUI_POLICY)
        self.git(self.shared, "commit", "-m", "track the GUI validator")
        candidate = land.revision(self.shared, "HEAD")
        tree = land.revision(self.shared, "HEAD^{tree}")
        self.git(self.origin, "fetch", str(self.shared), land.MAIN_REF)
        self.git(self.origin, "update-ref", land.MAIN_REF, candidate, self.base)
        self.git(self.origin, "update-ref", self.ref, candidate, self.head)
        self.git(self.shared, "fetch", "origin")
        self.git(self.shared, "reset", "--keep", candidate)
        self.cleanup()
        self.base, self.head, self.tree = candidate, candidate, tree
        self.remote, self.manifest = land.prepare_remote(self.folder, self.ref, candidate, tree, candidate)
        self.make_record(0)

        # Visible untracked GUI source outside tests/: verify must refuse it by path.
        self.put(self.shared, name, svg)
        with self.assertRaisesRegex(land.Refusal, r"uncommitted changes or hidden index flags:.*favicon\.svg"):
            self.verify()
        (self.shared / name).unlink()

        # Ignored through .git/info/exclude on both clones: the inventory must carry it, and a
        # receipt whose inventory predates it must be refused.
        rules = f"/{name}\n/src/node_modules/\n/src/gui/public/photo.png\n"
        for clone in (self.shared, self.clone):
            exclude = clone / ".git/info/exclude"
            exclude.write_text(exclude.read_text() + rules)
        self.put(self.shared, name, svg)
        self.put(self.shared, "src/node_modules/generated.js", "excluded source")
        self.put(self.shared, "src/gui/public/photo.png", "not a source extension")
        with self.assertRaisesRegex(land.Refusal, r"ignored input mismatch:.*favicon\.svg"):
            self.verify()
        self.manifest = land.guarded_input_manifest(self.shared, candidate)
        self.assertIn(name, self.manifest)
        self.assertNotIn("src/node_modules/generated.js", self.manifest)
        self.assertNotIn("src/gui/public/photo.png", self.manifest)
        self.cleanup()
        self.remote, self.manifest = land.prepare_remote(self.folder, self.ref, candidate, tree, candidate)
        self.make_record(0)
        self.assertEqual((self.remote / name).read_text(), svg)
        self.assertIn(name, self.manifest)
        self.assertNotIn("src/node_modules/generated.js", self.manifest)
        self.assertNotIn("src/gui/public/photo.png", self.manifest)
        self.assertEqual(self.verify(), 0)

    def test_inventory_includes_exact_artifacts_declared_by_validators(self):
        custody = "Plans/.audits/older/frozen.bin"
        lock_input = "Plans/.audits/lock-files/generated.bin"
        closure_input = "Plans/.audits/closure/generated.bin"
        evidence_input = "Plans/.audits/evidence/generated.bin"
        paths = (custody, lock_input, closure_input, evidence_input)
        for name in paths:
            self.put(self.shared, name, "ignored artifact with a non-text extension")
        declarations = {
            "Plans/.audits/_legacy_format_inventory.json": {"directories": {
                "older": {"files": {"frozen.bin": {"sha256": "x"}}}}},
            "Plans/.audits/_semantic_closure_registry.jsonl": {"hashes": {
                "owner_evidence_hashes": {closure_input + ":12": "x"}}},
            "Plans/Spec_Lock.json": {"canonical_ssot_hashes": {"files": [{"path": lock_input}]}},
            "Plans/.evidence/topic/evidence.json": {"artifacts": [{"path": evidence_input, "sha256": "x"}]},
        }
        for name, document in declarations.items():
            self.put(self.shared, name, land.json.dumps(document) + "\n")
        self.git(self.shared, "add", "--", "Plans/Spec_Lock.json", "Plans/.evidence/topic/evidence.json")
        self.git(self.shared, "commit", "-m", "declare exact artifacts")
        fresh = self.root / "fresh"
        self.git(self.shared, "worktree", "add", "--detach", str(fresh), "HEAD")
        manifest = land.copy_inputs(self.shared, fresh)
        for name in paths:
            self.assertEqual(manifest[name], land.file_hash(fresh / name))

    def test_counted_gui_fixture_membership_covers_other_extensions(self):
        self.put(self.shared, ".git/info/exclude", "/tests/fixtures/usage_gui/\n/tests/fixtures/pm7_shared/\n")
        names = ("tests/fixtures/usage_gui/cases/extra.bin", "tests/fixtures/pm7_shared/extra.bin")
        for name in names:
            self.put(self.shared, name, "fixture membership counts this file")
        fresh = self.root / "fresh"
        self.git(self.shared, "worktree", "add", "--detach", str(fresh), self.head)
        manifest = land.copy_inputs(self.shared, fresh)
        for name in names:
            self.assertEqual(manifest[name], land.file_hash(fresh / name))


READINESS = "run-gates/validate_implementation_readiness"
BUCKET = "run-gates/lint-x  missing_ref  src/x.txt"


def pre_row(bucket: str, baseline: int, count: int, fields: str = '{"n":1}', where: str = "(names src/x.txt)",
            tag: str = "pre-existing") -> str:
    return f"  [{tag:<12}] {bucket}  {baseline} -> {count}  {fields}  {where}"


def landing_report(pre=(), more: int = 0, counter=(), compare: int = 0, timeouts: int = 0, tail: str = "", gone: int = 0,
                   gone_ids=None, totals=None, counts=None, older: bool = False) -> str:
    """A landing check's text report, line for line as main() in scripts/pm-landing-check.py prints it. `older`: from
    before the lines for comparing one run with the next."""
    lines = ["pm-landing-check: baseline reports/landing-checks/baseline.json recorded at aaaaaaaaaaaa; this checkout is at bbbbbbbbbbbb",
             "  the baseline is current, so rule 2 applies: its commit aaaaaaaaaaaa is an ancestor of the base", "",
             "New since the baseline: 0",
             f"Pre-existing, in a baseline bucket whose count has not risen (never blocks): {len(pre) + more}"]
    if pre:
        lines.append("  counted against the baseline recorded at aaaaaaaaaaaa, not against main: a failure main fixed "
                     "after that commit and this branch brings back reads as pre-existing")
    lines += list(pre)
    if more:
        lines.append(f"  ... {more} more")
    lines += ["Checks whose failure count rose: 0", f"Subchecks reporting more failures than the baseline: {len(counter)}"]
    for name, was, now in counter:
        lines.append(f"  [staleness] {name}  {was} -> {now} (the readiness growth counter: its printed rows show stale "
                     "readiness rows growing on this branch's files and nothing else new)")
    lines += ["Naming a path this branch touches: 0",
              f"Infrastructure results, not failures of this tree (never new, growth or blocking): {timeouts}"]
    lines += [f"  [infrastructure] run-gates/x{index}  subprocess_timeout (lint-x)  killed after 600 s" for index in range(timeouts)]
    lines += [f"Gone since the baseline (nothing to do): {gone}"]
    lines += [f"  [gone] {name}" for name in gone_ids or []]
    if not older:
        lines.append(f"Subcheck totals this run: {len(totals or {})}")
        lines += [f"  [total] {name}  {'timed out' if total is None else total}" for name, total in (totals or {}).items()]
        lines.append(f"Bucket counts this run: {len(counts or {})}")
        lines += [f"  [count] {name}  {count}" for name, count in (counts or {}).items()]
    lines.append("")
    advice = []
    if pre and compare:
        advice.append(f"pre-existing failures whose count has not risen, {compare} of them with changed content on files this "
                      "branch touched, so compare those with the baseline's rows: the same count can hide one failure fixed "
                      "and another added")
    elif pre:
        advice.append("pre-existing failures whose count has not risen, so nothing for this branch to fix")
    if counter:
        advice.append("the readiness growth counter of stale readiness rows, so include it in the reseal request to Jared")
    if advice:
        lines.append("Nothing reported stops the landing: it is " + "; and ".join(advice) + ".")
    if tail:
        lines.append(tail)
    return "\n".join(lines)


CRASH = 'Traceback (most recent call last):\n  File "scripts/pm-landing-check.py", line 9, in main\nKeyError: \'x\''


class ReportFormatTests(unittest.TestCase):
    """Hold what the tool reads to what the real landing check prints: a detector that silently stopped matching
    would wave through exactly what it exists to stop."""

    @classmethod
    def setUpClass(cls):
        path = Path(__file__).with_name("pm-landing-check.py")
        spec = importlib.util.spec_from_file_location("pm_landing_check_for_format", path)
        cls.real = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = cls.real
        spec.loader.exec_module(cls.real)
        # The source with adjacent string literals joined, so a phrase split over two lines reads whole.
        cls.source = re.sub(r"\"\s*\n\s*f?\"", "", path.read_text(encoding="utf-8"))

    def item(self, **fields):
        return dict({"path": "src/x.txt", "check": "run-gates", "subcheck": "lint-x", "error": "missing_ref", "fields": {"n": 1},
                     "stale": False, "standing": "pre-existing", "baseline_count": 5, "count": 5}, **fields)

    def test_a_text_report_is_not_a_batch_report(self):
        """Batch comparisons are JSON only: text names a row by clipped display fields, JSON by its key."""
        self.assertIsNone(land.batch_report(landing_report(totals={"run-gates/lint-x": 2})))
        self.assertIsNone(land.batch_report("no such line"))

    def test_every_phrase_the_real_script_still_prints_for_people(self):
        for phrase in ("Infrastructure results, not failures of this tree (never new, growth or blocking): ",
                       "Pre-existing, in a baseline bucket whose count has not risen (never blocks): ",
                       "Checks whose failure count rose: ",
                       "Gone since the baseline (nothing to do): ",
                       'print(f"  [gone] {escape_newlines(name)}")',
                       'print(f"Subcheck totals this run: {len(totals)}")',
                       """print(f"  [total] {name}  {'timed out' if total is None else total}")""",
                       'print(f"Bucket counts this run: {len(seen_buckets)}")',
                       'print(f"  [count] {escape_newlines(name)}  {count}")',
                       "Nothing reported stops the landing: it is ",
                       "of them with changed content on files this branch touched, so compare those with the baseline's rows",
                       "{row['baseline_reported']} -> {row['reported']}{note}",
                       'tag = "staleness"',
                       "more\")"):
            self.assertIn(phrase, self.source, phrase)

    def test_the_json_report_is_read_as_the_lines_it_stands_for(self):
        """`check` writes `landing-check.json` (`--json`); a batch reads that, not its text rounding."""
        pre = [json_pre('k1'), json_pre('k2', standing="improved", baseline=5, count=4),
               json_pre('k3', paths=(), path=None)]
        report = land.batch_report(json_report(pre=pre, compare=2, timeouts=3,
                                               gone_ids=["run-gates|lint-x|gone|src/g.txt"],
                                               totals={"run-gates/lint-x": 3, "run-gates/y-": None},
                                               counts={"run-gates|lint-x|missing_ref|src/x.txt": 2}))
        self.assertEqual(report["infrastructure"], 3)
        self.assertEqual(report["compare"], 2)
        self.assertEqual(report["crashed"], False)
        entry = report["pre"][BUCKET]
        self.assertEqual((entry["baseline"], entry["count"], entry["improved"]), (5, 5, False))
        self.assertEqual(entry["rows"], ["k1", "k2"])
        self.assertEqual(entry["content_rows"], [])
        # A row naming no path of this branch is a `(content changed)` row.
        self.assertEqual(report["pre"]["run-gates/lint-x  missing_ref  (no path)"]["content_rows"], ["k3"])
        self.assertEqual(report["gone"], 1)
        self.assertEqual(report["gone_ids"], ["run-gates|lint-x|gone|src/g.txt"])
        self.assertEqual(report["totals"], {"run-gates/lint-x": 3, "run-gates/y-": None})
        self.assertEqual(report["bucket_counts"], {"run-gates|lint-x|missing_ref|src/x.txt": 2})
        self.assertFalse(report["ids_unread"])
        self.assertFalse(report["pre_unread"])

    def test_a_paired_copy_and_a_sample_are_kept_apart_from_an_observed_zero(self):
        """F7: the report says which subchecks it left out, so a bucket it never printed is not a 0."""
        report = land.batch_report(json_report(
            totals={"run-gates/validate_audit_closure": 53}, counts={},
            pairs=[("validate_audit_closure", "validate_audit_closure")],
            partial=["lint-x"]))
        self.assertEqual(report["pairs"][("run-gates", "validate_audit_closure")],
                         ("audit-governance", "validate_audit_closure"))
        self.assertIn(("run-gates", "lint-x"), report["partial"])

    def test_the_three_states_of_an_unprinted_bucket_are_kept_apart(self):
        """R3-B1: observed zero, not observed (a sample), and not printed (a paired copy) are three states, not one."""
        bucket = "run-gates|validate_evidence|missing_ref|Plans/.evidence/x/evidence.json"
        complete = land.batch_report(json_report(totals={"run-gates/validate_evidence": 0}, counts={}))
        self.assertEqual(land.prior_bucket_count(complete, bucket), 0)
        sample = land.batch_report(json_report(totals={"run-gates/validate_evidence": 2861}, counts={},
                                               partial=["validate_evidence"]))
        self.assertIsNone(land.prior_bucket_count(sample, bucket))
        paired = land.batch_report(json_report(
            totals={"run-gates/validate_evidence": 0}, counts={},
            pairs=[("validate_evidence", "validate_evidence")]))
        self.assertEqual(land.prior_bucket_count(paired, bucket), 0)
        unpaired_twin = land.batch_report(json_report(
            totals={"run-gates/validate_evidence": 0}, counts={},
            pairs=[("validate_evidence", "validate_evidence")],
            partial=["audit-governance/validate_evidence"]))
        self.assertIsNone(land.prior_bucket_count(unpaired_twin, bucket))

    def test_a_complete_subcheck_that_did_not_print_a_bucket_has_an_observed_zero(self):
        """R3-B1: a rise from a complete subcheck's absent bucket is a real rise, not an unprinted one."""
        bucket = "run-gates|lint-x|missing_ref|Plans/B.md"
        earlier = land.batch_report(json_report(totals={"run-gates/lint-x": 1}, counts={}))
        current = land.batch_report(json_report(totals={"run-gates/lint-x": 1}, counts={bucket: 1}))
        gap = land.batch_gap(current, [earlier])
        self.assertEqual(gap[0], "batch_total_rise", gap)
        self.assertIn("rose from 0 to 1", gap[1])

    def test_a_bucket_from_a_sampled_subcheck_is_unknown_not_a_zero(self):
        """R3-B1: a sample printed no buckets, so a bucket counted here cannot be told from a rise there."""
        bucket = "run-gates|lint-x|missing_ref|Plans/B.md"
        earlier = land.batch_report(json_report(totals={"run-gates/lint-x": 1}, counts={}, partial=["lint-x"]))
        current = land.batch_report(json_report(totals={"run-gates/lint-x": 1}, counts={bucket: 1}))
        gap = land.batch_gap(current, [earlier])
        self.assertEqual(gap[0], "batch_counts_unknown", gap)
        self.assertIn("run-gates/lint-x", gap[1])

    def test_the_real_remote_receipts_json_report_is_read_not_refused(self):
        """The report `check` wrote for fix-land-fast-r11 at 0a3c65cab2, copied into the fixtures verbatim.

        It is the one real remote-route report in this repository: a reader that only knows the text
        report reads every field of it as absent, so a batch false-stops on every member.
        """
        path = Path(__file__).resolve().parents[1] / "tests/fixtures/landing_remote_receipt/landing-check.json"
        text = path.read_text(encoding="utf-8")
        report = land.batch_report(text)
        self.assertEqual(json.loads(text)["schema_id"], land.REPORT_SCHEMA)
        self.assertEqual((report["infrastructure"], report["compare"], report["crashed"]), (0, 0, False))
        self.assertEqual(report["pre"], {})
        self.assertEqual(report["gone_ids"], [])
        self.assertFalse(report["ids_unread"])
        self.assertFalse(report["pre_unread"])
        # Written before the comparison lines existed: no totals, so no batch compares with it, and the reader
        # says so rather than reading the JSON text as a report with nothing in it.
        self.assertIsNone(report["totals"])
        self.assertFalse(land.shows_what_changed(report, []))

    def test_a_bucket_id_keeps_a_carriage_return_from_moving_the_cursor(self):
        self.assertEqual(self.real.escape_newlines("a\rb\nc\\d"), "a\\rb\\nc\\\\d")


def json_report(pre=(), compare: int = 0, timeouts: int = 0, gone_ids=(), totals=None, counts=None,
                pairs=(), partial=(), commit: str = "b" * 40, base: str = "a" * 40) -> str:
    """A `pm-landing-check.py --json` report: the keys a batch reads, in the shape `main()` writes them."""
    return json.dumps({
        "schema_id": land.REPORT_SCHEMA,
        "commit": commit,
        "base": base,
        "changed_on_branch": compare,
        "infrastructure": [{"check": "run-gates", "subcheck": f"x{index}", "error": "subprocess_timeout"}
                           for index in range(timeouts)],
        "pre_existing": list(pre),
        "resolved_buckets": None if gone_ids is None else list(gone_ids),
        "subcheck_totals": totals,
        "bucket_counts": counts,
        "validator_pairs": [{"run_gates": run, "audit_governance": audit, "paired": True}
                            for run, audit in pairs],
        "subchecks_compared_by_total_only": [name if "/" in name else f"run-gates/{name}" for name in partial],
    })


def json_pre(key: str, *, standing: str = "pre-existing", baseline: int = 5, count: int = 5,
             paths=("src/x.txt",), check: str = "run-gates", subcheck: str = "lint-x",
             error: str = "missing_ref", path: str = "src/x.txt") -> dict:
    """One `pre_existing` row of the JSON report, as `{**public(item), **counted, "branch_paths": hits}`."""
    return {"key": key, "check": check, "subcheck": subcheck, "error": error, "path": path, "fields": {},
            "stale": False, "standing": standing, "baseline_count": baseline, "count": count,
            "branch_paths": list(paths)}


class BatchFixture(unittest.TestCase):
    """A small repository, the rule's lock directory, and reports written by hand: no remote, no lock, no push."""

    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix="test-pm-batch-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.shared = self.root / "shared"
        self.lock = self.root / "lock"
        self.shared.mkdir()
        self.git(self.shared, "init", "-q", "-b", "main")
        self.git(self.shared, "config", "user.email", "fixture@example.invalid")
        self.git(self.shared, "config", "user.name", "Batch fixture")
        self.git(self.shared, "config", "core.hooksPath", str(self.root / "no-hooks"))
        self.put("src/x.txt", "one\n")
        self.put("Plans/A.md", "a\n")
        self.commit("base")
        self.base = self.rev("HEAD")
        self.set_main(self.base)
        self.reports = self.root / "reports"
        self.reports.mkdir()

    def git(self, repository, *args, env=None):
        return subprocess.run(["git", "-C", str(repository), *args], capture_output=True, text=True, check=True,
                              env={**os.environ, **(env or {})}).stdout

    def rev(self, ref):
        return self.git(self.shared, "rev-parse", ref).strip()

    def put(self, rel, text):
        path = self.shared / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        return path

    def commit(self, message, env=None):
        self.git(self.shared, "add", "-A")
        self.git(self.shared, "commit", "-q", "--allow-empty", "-m", message, env=env)
        return self.rev("HEAD")

    def set_main(self, sha):
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, sha)

    def holder(self, start=None, rows=(), first_push=None, agent="fixture", time=None):
        held = self.lock / "held"
        held.mkdir(parents=True, exist_ok=True)
        lines = [f"agent: {agent}", "branch: fix/topic", f"time: {time or land.iso()}"]
        if start:
            lines.append(f"batch-start: {start}")
        if first_push:
            lines.append(f"batch-first-push: {first_push}")
        lines += [f"batch-landing: {row}" for row in rows]
        (held / "holder.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
        return held

    def age_holder(self, minutes):
        when = time.time() - minutes * 60
        for path in ((self.lock / "held" / "holder.txt"), (self.lock / "held")):
            os.utime(path, (when, when))

    def report_file(self, name, text):
        path = self.reports / name
        path.write_text(text, encoding="utf-8")
        return path

    def rows_file(self, name, subchecks, base=None):
        path = self.reports / name
        path.write_text(json.dumps({"schema_id": land.ROW_REPORT_SCHEMA, "base": base or self.base,
                                    "subchecks": subchecks}), encoding="utf-8")
        return path

    def source_file(self, marked=True, name="check.py"):
        marks = "--row-report grown_stale Subcheck totals this run Bucket counts this run" if marked else "an older check"
        path = self.reports / name
        path.write_text(marks + "\n", encoding="utf-8")
        return path

    def receipt(self, name, report, rows, head, base, code=0):
        """The record.json `check` prints: commit, base, report, row report, their digests and the checker exit."""
        path = self.reports / name
        record = {"schema": 2, "host": "nas1", "head": head, "base": base, "exit_code": code,
                  "report": str(report), "report_sha256": land.file_hash(report),
                  "row_report": str(rows), "row_report_sha256": land.file_hash(rows),
                  "argv": ["python3", "-B", "scripts/pm-landing-check.py", "--base", base, "--json",
                           "--row-report", str(rows)]}
        land.write_json(path, record)
        return path

    def empty_rows(self, name="empty.rows.json"):
        return self.rows_file(name, {"run-gates/other": {"reported": 0, "complete": True, "rows": []}})

    def receipt_without_rows(self, name, report, head, base, code=0):
        path = self.reports / name
        land.write_json(path, {"schema": 2, "host": "nas1", "head": head, "base": base, "exit_code": code,
                               "report": str(report), "report_sha256": land.file_hash(report),
                               "row_report": None, "row_report_sha256": None})
        return path

    def member(self, name, *, head, base=None, code=0, totals=None, counts=None, subchecks=None, **report):
        """One member's receipt, its bound JSON report and row report, as `check --base <batch-start>` writes them."""
        base = base or self.base
        report_path = self.report_file(f"{name}.json", json_report(
            totals=totals, counts=counts, commit=head, base=base, **report))
        rows_path = self.rows_file(f"{name}.rows.json",
                                   subchecks if subchecks is not None else
                                   {"run-gates/other": {"reported": 0, "complete": True, "rows": []}}, base=base)
        return self.receipt(f"{name}.record.json", report_path, rows_path, head, base, code)

    def row_line(self, branch, sha, name=None):
        """A `batch-landing` row with a receipt path, for tests that only read the holder."""
        path = self.reports / (name or f"{sha[:8]}.record.json")
        if not path.exists():
            path.write_text("{}\n", encoding="utf-8")
        return f"{branch} {sha} {path}"

    @staticmethod
    def row(key, stale=False, grown_stale=False, names=()):
        return {"key": key, "stale": stale, "grown_stale": grown_stale, "names": list(names)}

    def batch_check(self, *argv):
        out, err = io.StringIO(), io.StringIO()
        with redirect_stdout(out), redirect_stderr(err):
            code = land.main(["batch-check", *map(str, argv)])
        self.stderr = err.getvalue()
        return code, out.getvalue()

    def status(self):
        out = io.StringIO()
        with redirect_stdout(out), redirect_stderr(io.StringIO()):
            code = land.batch_status(self.shared, self.lock)
        return code, out.getvalue()


class BatchStatusTests(BatchFixture):
    def test_no_lock_is_no_batch(self):
        code, out = self.status()
        self.assertEqual(code, 0)
        self.assertIn("no batch is open", out)

    def test_a_held_batch_shows_its_landings_the_limits_and_the_follow_up(self):
        self.holder(start=self.base, rows=[self.row_line("fix/a", self.base)], first_push=land.iso())
        code, out = self.status()
        self.assertEqual(code, 0, out)
        self.assertIn(f"batch: open at batch-start {self.base}", out)
        self.assertIn("landings: 1 of 4", out)
        self.assertIn(f"[landing] fix/a {self.base}", out)
        self.assertIn("Plans/: no path changed since batch-start", out)

    def test_malformed_rows_are_named_not_dropped(self):
        self.holder(start=self.base, rows=[self.row_line("fix/a", self.base), "fix/b not-a-sha"])
        code, out = self.status()
        self.assertEqual(code, 0, out)
        self.assertIn("[unreadable]", out)
        self.assertIn("fix/b not-a-sha", out)
        self.assertIn("landings: 1 of 4", out)

    def test_main_past_the_start_with_no_rows_is_said_to_need_rows(self):
        member = self.commit("member 1")
        self.set_main(member)
        self.holder(start=self.base)
        code, out = self.status()
        self.assertEqual(code, 0, out)
        self.assertIn("[missing] 1 commit(s) on main since batch-start have no `batch-landing` row", out)
        self.assertIn(member[:12], out)

    def test_a_full_batch_and_a_past_two_hours_batch_say_the_next_is_judged_alone(self):
        rows = [self.row_line(f"fix/{index}", self.base) for index in range(4)]
        old = land.iso(datetime.now(timezone.utc) - timedelta(hours=3))
        self.holder(start=self.base, rows=rows, first_push=old)
        code, out = self.status()
        self.assertEqual(code, 0, out)
        self.assertIn("landings: 4 of 4 (full: the next landing is judged alone)", out)
        self.assertIn("past the two hours: the next landing is judged alone", out)

    def test_the_first_pushes_time_stands_in_from_the_first_rows_commit_time(self):
        member = self.commit("member 1")
        self.set_main(member)
        self.holder(start=self.base, rows=[self.row_line("fix/a", member)])
        code, out = self.status()
        self.assertEqual(code, 0, out)
        self.assertIn("from the first row's commit time: no batch-first-push line", out)

    def test_a_three_commit_landing_is_covered_by_its_one_row(self):
        for index in range(3):
            self.put("src/x.txt", f"version {index}\n")
            self.commit(f"member 1, commit {index}")
        member1 = self.rev("HEAD")
        self.set_main(member1)
        self.holder(start=self.base, rows=[self.row_line("fix/a", member1)])
        code, out = self.status()
        self.assertEqual(code, 0, out)
        self.assertIn("landings: 1 of 4", out)
        self.assertNotIn("[missing]", out)

    def test_two_batch_start_lines_are_named_not_taken(self):
        other = self.commit("another main")
        held = self.lock / "held"
        held.mkdir(parents=True, exist_ok=True)
        (held / "holder.txt").write_text(
            f"agent: fixture\ntime: {land.iso()}\nbatch-start: {self.base}\nbatch-start: {other}\n", encoding="utf-8")
        code, out = self.status()
        self.assertEqual(code, 0, out)
        self.assertIn("holder.txt names two batch-starts", out)

    def test_a_dead_holder_whose_batch_landed_is_closed_not_cleared(self):
        member = self.commit("member 1")
        self.set_main(member)
        self.holder(start=self.base, rows=[f"fix/a {member}"], time=land.iso(
            datetime.now(timezone.utc) - timedelta(minutes=100)))
        self.age_holder(100)
        code, out = self.status()
        self.assertEqual(code, 0, out)
        self.assertIn("PROVEN DEAD", out)
        self.assertIn("it landed something, so it is closed, not cleared:", out)

    def test_a_baseline_near_the_seven_days_limit_at_the_batch_start_is_a_stop(self):
        """The check measures rule 2 from batch-start, so a batch opened within 2 h of the edge judges every member alone."""
        old = land.iso(datetime.now(timezone.utc) - timedelta(days=6, hours=23))
        self.put("src/x.txt", "the baseline's commit\n")
        recorded = self.commit("the baseline's commit", env={"GIT_COMMITTER_DATE": old, "GIT_AUTHOR_DATE": old})
        self.put("reports/landing-checks/baseline.json", json.dumps({"commit": recorded}))
        start = self.commit("batch-start")
        self.set_main(start)
        self.holder(start=start, rows=[])
        code, out = self.status()
        self.assertEqual(code, 0, out)
        self.assertIn("[stop] baseline: 6.96 days old at batch-start of the 7 rule 2 allows", out)
        self.assertIn("within 2 h of its seven-day edge: this landing is judged alone", out)

    def test_a_baseline_past_the_limit_at_the_batch_start_is_a_stop(self):
        old = land.iso(datetime.now(timezone.utc) - timedelta(days=8))
        self.put("src/x.txt", "the baseline's commit\n")
        recorded = self.commit("the baseline's commit", env={"GIT_COMMITTER_DATE": old, "GIT_AUTHOR_DATE": old})
        self.put("reports/landing-checks/baseline.json", json.dumps({"commit": recorded}))
        start = self.commit("batch-start")
        self.set_main(start)
        self.holder(start=start, rows=[])
        code, out = self.status()
        self.assertEqual(code, 0, out)
        self.assertIn("[stop] baseline: 8.00 days old at batch-start of the 7 rule 2 allows", out)
        self.assertIn("past its seven-day edge: this landing is judged alone", out)
        self.assertNotIn("within 2 h", out)


class BatchCheckTests(BatchFixture):
    """One member's receipt against the earlier members' receipts: the triggers of README "Batch triggers"."""

    def setUp(self):
        super().setUp()
        self.put("scripts/pm-landing-check.py", " ".join(land.BATCH_CHECK_MARKS) + "\n")
        self.commit("landing check with the comparison lines")
        self.base = self.rev("HEAD")
        self.set_main(self.base)
        self.member1 = self.commit("member 1")
        self.set_main(self.member1)
        self.put("src/own.txt", "own\n")
        self.head = self.commit("member 2")
        self.totals = {"run-gates/lint-x": 1}
        self.counts = {"run-gates|lint-x|missing_ref|src/x.txt": 1}
        self.m1 = self.member("m1", head=self.member1, totals=self.totals, counts=self.counts)
        self.holder(start=self.base, rows=[f"fix/a {self.member1} {self.m1}"])

    def report(self, name, **kw):
        return self.report_file(name, json_report(**kw))

    def current(self, report, rows=None, code=0, base=None, head=None):
        return self.receipt("record.json", report,
                            rows if rows is not None else self.empty_rows("record.rows.json"),
                            head or self.head, base or self.base, code)

    def check(self, report, rows=None, code=0, source=True, base=None, lock=None, head=None, receipt=None):
        argv = ["--receipt", receipt or self.current(report, rows, code, base, head), "--repo", self.shared,
                "--lock-dir", lock or self.lock]
        if source is not None:
            argv += ["--check-source", self.source_file(marked=bool(source))]
        return self.batch_check(*argv)

    def test_the_first_member_may_stay_and_says_why(self):
        self.set_main(self.base)
        self.holder(start=self.base)
        code, out = self.check(self.report("m1.json", totals=self.totals, counts=self.counts))
        self.assertEqual(code, 0, out)
        self.assertIn("first member of the batch", out)
        self.assertIn("[total] run-gates/lint-x  1", out)

    def test_a_receipt_report_that_shows_no_rise_keeps_the_landing(self):
        """What `check` actually writes: the receipt's JSON report, bound by SHA-256."""
        code, out = self.check(self.report("m2.json", totals=self.totals, counts=self.counts))
        self.assertEqual(code, 0, out)
        self.assertIn("no trigger", out)
        self.assertIn("[total] run-gates/lint-x  1", out)
        self.assertIn("[count] run-gates|lint-x|missing_ref|src/x.txt  1", out)

    def test_a_rise_in_the_json_report_closes_the_batch(self):
        current = self.report("m2.json", totals={"run-gates/lint-x": 2},
                              counts={"run-gates|lint-x|missing_ref|src/x.txt": 2})
        code, out = self.check(current)
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_total_rise", out)
        self.assertIn("run-gates/lint-x's total rose from 1 to 2", out)

    def test_a_member_three_deep_compares_with_every_earlier_receipt(self):
        """Member 3 is compared with member 2's receipt and with member 1's, read from the holder in order."""
        member2 = self.head
        self.set_main(member2)
        self.put("src/third.txt", "third\n")
        head3 = self.commit("member 3")
        m2 = self.member("m2", head=member2, totals=self.totals, counts=self.counts)
        self.holder(start=self.base, rows=[f"fix/a {self.member1} {self.m1}", f"fix/b {member2} {m2}"])
        code, out = self.check(self.report("m3.json", totals=self.totals, counts=self.counts), head=head3)
        self.assertEqual(code, 0, out)
        self.assertIn("no trigger", out)

    def test_a_timeout_in_an_earlier_members_report_judges_this_landing_alone(self):
        """D5: a timed-out subcheck has no count there, so a number here is not a measured rise from zero."""
        member2 = self.head
        self.set_main(member2)
        head3 = self.commit("member 3")
        m2 = self.member("m2-timeout", head=member2, totals={"run-gates/lint-x": None}, counts={},
                         subchecks={"run-gates/lint-x": {"reported": None, "complete": False, "rows": []}})
        self.holder(start=self.base, rows=[f"fix/a {self.member1} {self.m1}", f"fix/b {member2} {m2}"])
        code, out = self.check(self.report("m3.json", totals={"run-gates/lint-x": 5}, counts={}), head=head3)
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_counts_unknown", out)
        self.assertIn("timed out in an earlier member's report", out)

    def test_a_receipt_whose_commit_is_the_previous_main_is_refused(self):
        code, _out = self.check(self.report("m2.json", totals=self.totals, counts=self.counts), head=self.member1)
        self.assertEqual(code, 3)
        self.assertIn("already on the fetched origin/main", self.stderr)

    def test_a_corrupt_row_report_this_member_needs_closes_the_batch(self):
        bad = self.reports / "bad.rows.json"
        bad.write_text("{corrupt json", encoding="utf-8")
        code, out = self.check(self.report("m2.json", totals=self.totals, counts=self.counts), rows=bad)
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_row_report_unreadable", out)
        self.assertIn("this member's", out)

    def test_a_first_members_corrupt_row_report_is_not_a_success(self):
        """F6: a required row report is judged before the first-member success, not after it."""
        self.set_main(self.base)
        self.holder(start=self.base)
        bad = self.reports / "bad.rows.json"
        bad.write_text("{corrupt json", encoding="utf-8")
        code, out = self.check(self.report("m1.json", totals=self.totals, counts=self.counts), rows=bad)
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_row_report_unreadable", out)

    def test_a_row_report_missing_from_disk_closes_the_batch(self):
        rows = self.rows_file("m2.rows.json", {})
        receipt = self.current(self.report("m2.json", totals=self.totals, counts=self.counts), rows=rows)
        rows.unlink()
        code, out = self.batch_check("--receipt", receipt, "--repo", self.shared,
                                     "--check-source", self.source_file(), "--lock-dir", self.lock)
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_row_report_unreadable", out)

    def test_a_row_report_that_no_longer_matches_its_receipt_closes_the_batch(self):
        rows = self.rows_file("m2.rows.json", {})
        receipt = self.current(self.report("m2.json", totals=self.totals, counts=self.counts), rows=rows)
        rows.write_text(json.dumps({"schema_id": land.ROW_REPORT_SCHEMA, "base": self.base,
                                    "subchecks": {"run-gates/x": {"reported": 0, "complete": True, "rows": []}}}),
                        encoding="utf-8")
        code, out = self.batch_check("--receipt", receipt, "--repo", self.shared,
                                     "--check-source", self.source_file(), "--lock-dir", self.lock)
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_row_report_unreadable", out)

    def test_a_row_report_written_against_another_base_closes_the_batch(self):
        rows = self.rows_file("m2.rows.json", {}, base=self.member1)
        code, out = self.check(self.report("m2.json", totals=self.totals, counts=self.counts), rows=rows)
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_row_report_unreadable", out)
        self.assertIn("written against", out)

    def test_an_earlier_receipt_whose_report_is_for_another_commit_is_not_compared(self):
        """D2/F4: a report is compared only for the member its row and receipt name."""
        other = self.report("other.json", totals=self.totals, counts=self.counts, commit=self.base)
        record = json.loads(Path(self.m1).read_text(encoding="utf-8"))
        record["report"], record["report_sha256"] = str(other), land.file_hash(other)
        land.write_json(Path(self.m1), record)
        code, out = self.check(self.report("m2.json", totals=self.totals, counts=self.counts))
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_earlier_receipt_unreadable", out)
        self.assertIn("was written for commit", out)

    def test_an_earlier_receipt_that_cannot_be_read_judges_this_landing_alone(self):
        Path(self.m1).write_text("{not json", encoding="utf-8")
        code, out = self.check(self.report("m2.json", totals=self.totals, counts=self.counts))
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_earlier_receipt_unreadable", out)

    def test_a_receipt_without_a_report_digest_binds_nothing(self):
        """R3-N1: stripping report_sha256 to null used to skip the check and clear the batch."""
        record = json.loads(Path(self.m1).read_text(encoding="utf-8"))
        record["report_sha256"] = None
        land.write_json(Path(self.m1), record)
        code, out = self.check(self.report("m2.json", totals=self.totals, counts=self.counts))
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_earlier_receipt_unreadable", out)
        self.assertIn("records no SHA-256", out)

    def test_a_receipt_without_a_row_report_digest_cannot_be_compared(self):
        """R3-N1: a null row_report_sha256 bound nothing, so the row report was read unverified."""
        record = json.loads(Path(self.m1).read_text(encoding="utf-8"))
        record["row_report_sha256"] = None
        land.write_json(Path(self.m1), record)
        code, out = self.check(self.report("m2.json", totals=self.totals, counts=self.counts))
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_earlier_receipt_unreadable", out)
        self.assertIn("row report that cannot be read", out)

    def test_this_members_own_receipt_without_a_digest_is_refused(self):
        """R3-N1: the candidate's receipt is held to the same binding as an earlier member's."""
        receipt = self.current(self.report("m2.json", totals=self.totals, counts=self.counts))
        record = json.loads(Path(receipt).read_text(encoding="utf-8"))
        record["report_sha256"] = None
        land.write_json(Path(receipt), record)
        code, _out = self.batch_check("--receipt", receipt, "--repo", self.shared,
                                      "--check-source", self.source_file(), "--lock-dir", self.lock)
        self.assertEqual(code, 3)
        self.assertIn("records no SHA-256", self.stderr)

    def test_a_pushed_member_missing_from_the_holder_refuses_and_asks_for_repair(self):
        """F3: member 1 is on main but absent from holder.txt; the next landing is not the first member."""
        self.holder(start=self.base)
        code, _out = self.check(self.report("m2.json", totals=self.totals, counts=self.counts))
        self.assertEqual(code, 3)
        self.assertIn("have no `batch-landing` row", self.stderr)
        self.assertIn("repair the holder, then rerun", self.stderr)
        self.holder(start=self.base, rows=[f"fix/a {self.member1} {self.m1}"])
        code, out = self.check(self.report("m2.json", totals=self.totals, counts=self.counts))
        self.assertEqual(code, 0, out)

    def test_a_row_without_a_receipt_path_is_refused_to_repair(self):
        self.holder(start=self.base, rows=[f"fix/a {self.member1}"])
        code, _out = self.check(self.report("m2.json", totals=self.totals, counts=self.counts))
        self.assertEqual(code, 3)
        self.assertIn("cannot read", self.stderr)
        self.assertIn("repair", self.stderr.lower())

    def test_the_previous_override_flags_are_gone(self):
        """D3/F5: the member's own range is the holder's last landing, never a caller's substitute."""
        receipt = self.current(self.report("m2.json", totals=self.totals, counts=self.counts))
        with self.assertRaises(SystemExit), redirect_stderr(io.StringIO()):
            land.main(["batch-check", "--receipt", str(receipt), "--own-base", self.base])

    def test_a_first_member_whose_report_has_no_comparison_lines_lands_alone(self):
        self.set_main(self.base)
        self.holder(start=self.base)
        code, out = self.check(self.report("m1.json"))
        self.assertEqual(code, 1, out)
        self.assertIn("no batch", out)
        self.assertIn("bucket counts", out)

    def test_a_member_whose_report_is_not_the_json_check_writes_lands_alone(self):
        current = self.report_file("m2.txt", landing_report(totals={"run-gates/lint-x": 2}))
        code, out = self.check(current)
        self.assertEqual(code, 1, out)
        self.assertIn("no batch", out)
        self.assertIn("not the JSON", out)

    def test_a_total_rise_closes_the_batch(self):
        current = self.report("m2.json", totals={"run-gates/lint-x": 2}, counts=self.counts)
        code, out = self.check(current)
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_total_rise", out)
        self.assertIn("run-gates/lint-x's total rose from 1 to 2", out)
        self.assertIn("judged alone", out)

    def test_a_rise_that_is_only_this_members_own_staleness_keeps_the_landing(self):
        key1, key2 = "run-gates|lint-x|stale_hash|src/a.md|1", "run-gates|lint-x|stale_hash|src/own.txt|2"
        bucket = "run-gates|lint-x|stale_hash|src/a.md"
        m1 = self.member("m1-stale", head=self.member1, totals={"run-gates/lint-x": 1}, counts={bucket: 1},
                         subchecks={"run-gates/lint-x": {
                             "reported": 1, "complete": True,
                             "rows": [self.row(key1, stale=True, grown_stale=True, names=["src/a.md"])]}})
        self.holder(start=self.base, rows=[f"fix/a {self.member1} {m1}"])
        rows = self.rows_file("m2.rows.json", {"run-gates/lint-x": {
            "reported": 2, "complete": True,
            "rows": [self.row(key1, stale=True, grown_stale=True, names=["src/a.md"]),
                     self.row(key2, stale=True, grown_stale=True, names=["src/own.txt"])]}})
        current = self.report("m2.json", totals={"run-gates/lint-x": 2}, counts={bucket: 2})
        code, out = self.check(current, rows=rows)
        self.assertEqual(code, 0, out)
        self.assertIn("no trigger", out)
        self.assertIn("may stay", out)

    def test_an_added_row_on_another_members_file_closes_the_batch(self):
        key1, key2 = "run-gates|lint-x|stale_hash|src/a.md|1", "run-gates|lint-x|stale_hash|src/other.txt|2"
        bucket = "run-gates|lint-x|stale_hash|src/a.md"
        m1 = self.member("m1-other", head=self.member1, totals={"run-gates/lint-x": 1}, counts={bucket: 1},
                         subchecks={"run-gates/lint-x": {
                             "reported": 1, "complete": True,
                             "rows": [self.row(key1, stale=True, grown_stale=True, names=["src/a.md"])]}})
        self.holder(start=self.base, rows=[f"fix/a {self.member1} {m1}"])
        rows = self.rows_file("m2.rows.json", {"run-gates/lint-x": {
            "reported": 2, "complete": True,
            "rows": [self.row(key1, stale=True, grown_stale=True, names=["src/a.md"]),
                     self.row(key2, stale=True, grown_stale=True, names=["src/other.txt"])]}})
        current = self.report("m2.json", totals={"run-gates/lint-x": 2}, counts={bucket: 2})
        code, out = self.check(current, rows=rows)
        self.assertEqual(code, 1, out)
        self.assertIn("names another member's file", out)

    def test_staleness_by_detail_text_alone_does_not_excuse_the_rise(self):
        key1, key2 = "run-gates|lint-x|stale_hash|src/a.md|1", "run-gates|lint-x|registry_entry_mismatch|src/own.txt|2"
        bucket = "run-gates|lint-x|stale_hash|src/a.md"
        m1 = self.member("m1-detail", head=self.member1, totals={"run-gates/lint-x": 1}, counts={bucket: 1},
                         subchecks={"run-gates/lint-x": {
                             "reported": 1, "complete": True,
                             "rows": [self.row(key1, stale=True, grown_stale=True, names=["src/a.md"])]}})
        self.holder(start=self.base, rows=[f"fix/a {self.member1} {m1}"])
        rows = self.rows_file("m2.rows.json", {"run-gates/lint-x": {
            "reported": 2, "complete": True,
            "rows": [self.row(key1, stale=True, grown_stale=True, names=["src/a.md"]),
                     self.row(key2, stale=True, grown_stale=False, names=["src/own.txt"])]}})
        current = self.report("m2.json", totals={"run-gates/lint-x": 2}, counts={bucket: 2})
        code, out = self.check(current, rows=rows)
        self.assertEqual(code, 1, out)
        self.assertIn("staleness only by its detail text", out)

    def test_a_member_whose_receipt_records_no_row_report_cannot_batch(self):
        current = self.report("m2.json", totals={"run-gates/lint-x": 2}, counts=self.counts)
        receipt = self.receipt_without_rows("no-rows.record.json", current, self.head, self.base)
        code, out = self.check(current, receipt=receipt)
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_row_report_unreadable", out)
        self.assertIn("does not record", out)

    def test_a_report_without_the_comparison_lines_closes_the_batch(self):
        current = self.report("m2.json")
        code, out = self.check(current)
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_check_too_old", out)

    def test_a_bucket_that_was_gone_and_is_back_closes_the_batch(self):
        bucket = "run-gates|lint-x|missing_ref|src/x.txt"
        m1 = self.member("m1-gone", head=self.member1, totals={"run-gates/lint-x": 0}, counts={},
                         gone_ids=[bucket])
        self.holder(start=self.base, rows=[f"fix/a {self.member1} {m1}"])
        current = self.report("m2.json", totals={"run-gates/lint-x": 1}, counts={bucket: 1})
        code, out = self.check(current)
        self.assertEqual(code, 1, out)
        self.assertIn("listed as gone is back", out)

    def test_gone_ids_that_do_not_add_up_close_the_batch(self):
        current = self.report("m2.json", totals={"run-gates/lint-x": 2}, counts=self.counts, gone_ids=None)
        code, out = self.check(current)
        self.assertEqual(code, 1, out)
        self.assertIn("do not add up", out)

    def test_a_paired_copy_printed_in_full_is_not_growth_from_zero(self):
        """F7: the earlier report left the run-gates copy out because its audit twin judged it; that is not a 0."""
        bucket = "run-gates|validate_audit_closure|audit_closure_validator_error|Plans/x.json"
        twin = "audit-governance|validate_audit_closure|audit_closure_validator_error|Plans/x.json"
        totals = {"run-gates/validate_audit_closure": 53, "audit-governance/validate_audit_closure": 53}
        m1 = self.member("m1-paired", head=self.member1, totals=totals, counts={twin: 1},
                         pairs=[("validate_audit_closure", "validate_audit_closure")])
        self.holder(start=self.base, rows=[f"fix/a {self.member1} {m1}"])
        current = self.report("m2.json", totals=totals, counts={bucket: 1})
        code, out = self.check(current)
        self.assertEqual(code, 0, out)
        self.assertIn("no trigger", out)

    def test_a_sample_in_the_previous_report_makes_this_reports_buckets_unknown(self):
        """R3-B1: member 1's validate-evidence export timed out (compared by total only), so member 2's buckets are
        unknown against it even though its total fell: the real 0a3c65cab2 -> 87cd6daac0 replay exits 2 alone."""
        bucket = "run-gates|validate_evidence|missing_ref|Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json"
        audit = "audit-governance|evidence|missing_ref|Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json"
        later = {"run-gates/validate_evidence": 2859, "audit-governance/evidence": 2859}
        m1 = self.member("m1-sample", head=self.member1, totals={"run-gates/validate_evidence": 2861,
                                                                 "audit-governance/evidence": 2861},
                         counts={}, partial=["validate_evidence", "audit-governance/evidence"])
        self.holder(start=self.base, rows=[f"fix/a {self.member1} {m1}"])
        code, out = self.check(self.report("m2.json", totals=later, counts={bucket: 180, audit: 180}))
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_counts_unknown", out)
        self.assertIn("compared by its total only in the previous member's report", out)

    def test_a_gone_bucket_is_not_skipped_when_this_report_is_a_sample(self):
        """R3-B1: member 1 said the bucket was gone; member 2's export fell back to a sample, so whether it returned
        cannot be told, and the batch stops. `partial` is never the paired twin's "not printed"."""
        bucket = "run-gates|validate_evidence|missing_ref|Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json"
        m1 = self.member("m1-gone", head=self.member1, totals={"run-gates/validate_evidence": 2683}, counts={},
                         gone_ids=[bucket])
        self.holder(start=self.base, rows=[f"fix/a {self.member1} {m1}"])
        code, out = self.check(self.report("m2.json", totals={"run-gates/validate_evidence": 2663}, counts={},
                                           partial=["validate_evidence"]))
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_rows_overlap", out)
        self.assertIn("listed as gone is back", out)

    def test_a_landing_check_that_cannot_batch_lands_alone_or_closes(self):
        current = self.report("m2.json", totals={"run-gates/lint-x": 2}, counts=self.counts)
        code, out = self.check(current, source=False)
        self.assertEqual(code, 1, out)
        self.assertIn("judged alone", out)
        self.set_main(self.base)
        self.holder(start=self.base)
        code, out = self.check(current, source=False)
        self.assertEqual(code, 1, out)
        self.assertIn("land it alone", out)

    def test_the_landing_checks_own_exit_decides_when_it_is_not_zero_or_one(self):
        current = self.report("m2.json", totals={"run-gates/lint-x": 2}, counts=self.counts)
        for exit_code in (2, 3):
            with self.subTest(exit_code=exit_code):
                code, out = self.check(current, code=exit_code)
                self.assertEqual(code, 1, out)
                self.assertIn(f"the landing check exited {exit_code}", out)

    def test_the_base_must_be_a_full_sha(self):
        current = self.report("m2.json", totals={"run-gates/lint-x": 2}, counts=self.counts)
        code, _out = self.check(current, base="origin/main")
        self.assertEqual(code, 3)

    def test_no_open_batch_is_refused(self):
        current = self.report("m2.json", totals={"run-gates/lint-x": 2}, counts=self.counts)
        code, _out = self.check(current, lock=self.root / "free-lock")
        self.assertEqual(code, 3)
        self.assertIn("no batch is open", self.stderr)

    def test_the_base_must_be_the_open_batch(self):
        self.holder(start=self.member1, rows=[])
        current = self.report("m2.json", totals={"run-gates/lint-x": 2}, counts=self.counts)
        code, _out = self.check(current)
        self.assertEqual(code, 3)

    def test_the_check_source_defaults_to_the_script_at_the_members_commit(self):
        current = self.report("m2.json", totals=self.totals, counts=self.counts)
        code, out = self.check(current, source=None)
        self.assertEqual(code, 0, out)
        self.assertIn("no trigger", out)


class PutBackTests(BatchFixture):
    def test_a_path_in_the_members_own_range_that_the_batch_diff_lacks_closes_it(self):
        self.put("scripts/pm-landing-check.py", " ".join(land.BATCH_CHECK_MARKS) + "\n")
        self.put("src/a.txt", "one\n")
        self.commit("landing check and the file")
        self.base = self.rev("HEAD")
        self.set_main(self.base)
        self.put("src/a.txt", "two\n")
        self.member1 = self.commit("member 1 changes it")
        self.set_main(self.member1)
        self.put("src/a.txt", "one\n")
        self.head = self.commit("member 2 puts it back")
        m1 = self.member("m1", head=self.member1, totals={"run-gates/lint-x": 1},
                         counts={"run-gates|lint-x|missing_ref|src/x.txt": 1})
        self.holder(start=self.base, rows=[f"fix/a {self.member1} {m1}"])
        current = self.report_file("m2.json", json_report(
            totals={"run-gates/lint-x": 1}, counts={"run-gates|lint-x|missing_ref|src/x.txt": 1}))
        # The shared checkout is still at member 1: only the receipt names member 2's commit.
        receipt = self.receipt("record.json", current, self.empty_rows("m2.rows.json"), self.head, self.base)
        code, out = self.batch_check("--receipt", receipt, "--repo", self.shared, "--lock-dir", self.lock)
        self.assertEqual(code, 1, out)
        self.assertIn("TRIGGER batch_reverted_path", out)
        self.assertIn("src/a.txt", out)


class BatchLimitTests(BatchFixture):
    """The rule's four limits: batch-check refuses what batch-status shows as a [stop], one test for each."""

    def setUp(self):
        super().setUp()
        self.put("src/own.txt", "own\n")
        self.head = self.commit("member 2")
        self.holder(start=self.base, rows=[])
        self.report = self.report_file("m2.json", json_report(
            totals={"run-gates/lint-x": 1}, counts={"run-gates|lint-x|missing_ref|src/x.txt": 1}))
        self.rows = self.empty_rows("m2.rows.json")

    def current(self, base=None):
        return self.receipt("record.json", self.report, self.rows, self.head, base or self.base)

    def judge(self, receipt=None):
        return self.batch_check("--receipt", receipt or self.current(), "--repo", self.shared,
                                "--check-source", self.source_file(), "--lock-dir", self.lock)

    def assert_stopped(self, phrase):
        code, _out = self.judge()
        self.assertEqual(code, 3)
        self.assertIn("the batch cannot take this landing", self.stderr)
        self.assertIn(phrase, self.stderr)
        code, out = self.status()
        self.assertEqual(code, 0, out)
        self.assertIn("[stop]", out)
        self.assertIn(phrase.split(":")[0], out)

    def test_a_full_batch_refuses_the_next_landing(self):
        self.holder(start=self.base, rows=[self.row_line(f"fix/{index}", self.base) for index in range(4)])
        self.assert_stopped("full: the next landing is judged alone")

    def test_past_the_two_hours_the_next_landing_is_refused(self):
        old = land.iso(datetime.now(timezone.utc) - timedelta(hours=3))
        self.holder(start=self.base, rows=[self.row_line("fix/a", self.base)], first_push=old)
        self.assert_stopped("past the two hours")

    def test_a_dead_holder_refuses_the_next_landing(self):
        self.holder(start=self.base, rows=[self.row_line("fix/a", self.base)],
                    time=land.iso(datetime.now(timezone.utc) - timedelta(minutes=100)))
        self.age_holder(100)
        self.assert_stopped("the holder is dead")

    def test_a_batch_started_inside_the_baselines_last_two_hours_is_refused(self):
        old = land.iso(datetime.now(timezone.utc) - timedelta(days=6, hours=23))
        self.put("src/x.txt", "the baseline's commit\n")
        recorded = self.commit("the baseline's commit", env={"GIT_COMMITTER_DATE": old, "GIT_AUTHOR_DATE": old})
        self.put("reports/landing-checks/baseline.json", json.dumps({"commit": recorded}))
        start = self.commit("batch-start")
        self.set_main(start)
        self.put("src/own.txt", "own\n")
        self.head = self.commit("member 2")
        self.holder(start=start, rows=[])
        code, _out = self.judge(self.current(base=start))
        self.assertEqual(code, 3)
        self.assertIn("within 2 h of its seven-day edge", self.stderr)
        code, out = self.status()
        self.assertEqual(code, 0, out)
        self.assertIn("[stop] baseline: 6.96 days old at batch-start", out)


class BatchVerifyTests(unittest.TestCase):
    """Batch mode: a member's receipt base is its batch-start, accepted only while the rule's record names it and
    lists every commit main has landed since. The fixture's setUp and helpers, not its tests."""

    setUp = LandingFixture.setUp
    git = LandingFixture.git
    put = LandingFixture.put
    make_record = LandingFixture.make_record

    def setUp(self):
        LandingFixture.setUp(self)
        self.lock = self.root / "lock"

    def history(self, commits: int = 1):
        """Member 1 lands `commits` commits on main as one landing; the candidate is a commit on top of it; the
        shared checkout stays at base."""
        for index in range(commits):
            self.put(self.shared, "tracked.txt", f"member one, commit {index}\n")
            self.git(self.shared, "commit", "-am", f"member 1, commit {index}")
        member1 = land.revision(self.shared, "HEAD")
        self.git(self.shared, "push", "origin", f"{member1}:{land.MAIN_REF}")
        self.put(self.shared, "tracked.txt", "member two\n")
        self.git(self.shared, "commit", "-am", "member 2")
        head = land.revision(self.shared, "HEAD")
        self.git(self.shared, "branch", "-f", self.branch, head)
        self.git(self.shared, "push", "-f", "origin", f"{head}:{self.ref}")
        self.git(self.shared, "reset", "--keep", self.base)
        return member1, head

    def holder(self, start=None, rows=(), text=None):
        held = self.lock / "held"
        held.mkdir(parents=True, exist_ok=True)
        if text is not None:
            (held / "holder.txt").write_text(text, encoding="utf-8")
            return
        lines = ["agent: fixture", "branch: fix/topic", f"time: {land.iso()}"]
        if start:
            lines.append(f"batch-start: {start}")
        lines += [f"batch-landing: {row}" for row in rows]
        (held / "holder.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

    def row(self, branch, sha):
        """A `batch-landing` row: verify reads the chain, not the earlier receipt's bytes."""
        return f"{branch} {sha} {self.folder / 'earlier.record.json'}"

    def receipt(self, head, base=None, rows=True, code=0):
        base = base or self.base
        report = self.folder / "landing-check.json"
        land.write_json(report, {"schema_id": "pm.landing_check.report.v1", "commit": head, "base": base,
                                 "blocking": 0, "subcheck_timeout_seconds": land.TIMEOUT})
        row_report = self.folder / "rows.json"
        if rows:
            land.write_json(row_report, {"schema_id": land.ROW_REPORT_SCHEMA, "base": base, "subchecks": {}})
        tree = land.revision(self.shared, head + "^{tree}")
        record = {"schema": 2, "host": "nas1", "machine": socket.gethostname(), "topic": self.ref,
                  "worktree": str(self.remote), "full": True, "clean": True, "job": land.job_name(self.folder),
                  "head": head, "tree": tree, "base": base, "exit_code": code,
                  "report": str(report), "report_sha256": land.file_hash(report),
                  "row_report": str(row_report) if rows else None,
                  "row_report_sha256": land.file_hash(row_report) if rows else None,
                  "started_utc": "2026-11-21T15:00:00+00:00", "ended_utc": "2026-11-21T15:20:00+00:00",
                  "ignored_inputs": self.manifest, "shard_exit_code": 0}
        land.write_json(self.path, record)
        witness = land.receipt_witness(self.folder)
        witness.parent.mkdir(exist_ok=True)
        witness.write_text(land.file_hash(self.path) + "\n", encoding="ascii")
        return record

    def verify(self, batch_start=None):
        with (patch.object(land, "LOCK_DIR", self.lock),
              patch.object(land, "ssh", return_value=subprocess.CompletedProcess([], 0, "", ""))):
            return land.verify_receipt(self.path, None, None, batch_start or self.base)

    def test_a_member_whose_base_is_the_batch_start_and_whose_landings_are_listed_is_verified(self):
        member1, head = self.history()
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head)
        output = io.StringIO()
        with redirect_stdout(output):
            self.assertEqual(self.verify(), 0)
        self.assertIn(f"Verified {head} against batch-start {self.base}", output.getvalue())

    def test_a_member_after_a_three_commit_landing_is_accepted(self):
        """One `batch-landing` row names one landing, whatever the fast-forward carried: member 1 pushed 3 commits."""
        member1, head = self.history(commits=3)
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head)
        with redirect_stdout(io.StringIO()):
            self.assertEqual(self.verify(), 0)

    def test_verify_refuses_a_landing_the_batch_limits_do_not_allow(self):
        member1, head = self.history()
        self.holder(self.base, [self.row(f"fix/{index}", member1) for index in range(4)])
        self.receipt(head)
        with self.assertRaisesRegex(land.Refusal, "the batch cannot take this landing"):
            self.verify()

    def test_an_unlisted_commit_on_top_of_the_last_listed_landing_is_refused(self):
        member1, head = self.history()
        self.git(self.shared, "reset", "--keep", member1)
        self.put(self.shared, "tracked.txt", "a landing nobody wrote down\n")
        self.git(self.shared, "commit", "-am", "unlisted landing")
        unlisted = land.revision(self.shared, "HEAD")
        self.git(self.shared, "push", "origin", f"{unlisted}:{land.MAIN_REF}")
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head)
        with self.assertRaisesRegex(land.Refusal, "not listed as a `batch-landing"):
            self.verify()

    def test_a_listed_sha_that_is_not_on_main_is_refused(self):
        member1, head = self.history()
        self.git(self.shared, "checkout", "-q", "-B", "side", self.base)
        self.put(self.shared, "side.txt", "side\n")
        self.git(self.shared, "add", "-A")
        self.git(self.shared, "commit", "-qm", "side landing, never pushed to main")
        side = land.revision(self.shared, "HEAD")
        self.git(self.shared, "checkout", "-q", "main")
        self.holder(self.base, [self.row("fix/side", side)])
        self.receipt(head)
        with self.assertRaisesRegex(land.Refusal, "is not on the fetched origin/main"):
            self.verify()

    def test_a_commit_on_main_that_no_batch_landing_row_names_is_refused(self):
        member1, head = self.history()
        self.holder(self.base, [])
        self.receipt(head)
        with self.assertRaisesRegex(land.Refusal, "not listed as a `batch-landing"):
            self.verify()

    def test_a_receipt_whose_check_exited_two_is_not_a_batch_member(self):
        member1, head = self.history()
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head, code=2)
        with self.assertRaisesRegex(land.Refusal, "may only stay on exit 0 or 1"):
            self.verify()

    def test_a_shared_head_on_an_unpublished_intermediate_commit_is_refused(self):
        """Batch mode compares the shared HEAD with main, not with the candidate: an intermediate commit is not main."""
        member1, first = self.history()
        self.git(self.shared, "reset", "--keep", first)
        self.put(self.shared, "tracked.txt", "member 2, commit 2\n")
        self.git(self.shared, "commit", "-am", "member 2, commit 2")
        head = land.revision(self.shared, "HEAD")
        self.git(self.shared, "branch", "-f", self.branch, head)
        self.git(self.shared, "push", "-f", "origin", f"{head}:{self.ref}")
        self.git(self.shared, "reset", "--keep", first)
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head)
        with self.assertRaisesRegex(land.Refusal, "is inconsistent with base"):
            self.verify()

    def test_a_batch_start_that_is_not_the_open_batch_is_refused(self):
        member1, head = self.history()
        self.holder(member1, [self.row("fix/a", member1)])
        self.receipt(head)
        with self.assertRaisesRegex(land.Refusal, "is not the open batch's batch-start"):
            self.verify()

    def test_a_closed_or_missing_batch_is_refused(self):
        member1, head = self.history()
        self.receipt(head)
        with self.assertRaisesRegex(land.Refusal, "no open batch"):
            self.verify()

    def test_a_moving_name_instead_of_a_full_sha_is_refused(self):
        member1, head = self.history()
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head)
        with self.assertRaisesRegex(land.Refusal, "must be a full 40-character commit or tree SHA"):
            self.verify("origin/main")

    def test_a_receipt_whose_base_is_not_the_batch_start_is_refused(self):
        member1, head = self.history()
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head, base=member1)
        with self.assertRaisesRegex(land.Refusal, "receipt base is .*--batch-start is"):
            self.verify()

    def test_a_candidate_that_does_not_contain_main_is_refused(self):
        member1, _head = self.history()
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(self.head)  # the fixture's original candidate, a child of base only
        with self.assertRaisesRegex(land.Refusal, "is not an ancestor of the checked commit"):
            self.verify()

    def test_a_receipt_with_no_row_report_cannot_be_a_batch_member(self):
        member1, head = self.history()
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head, rows=False)
        with self.assertRaisesRegex(land.Refusal, "records no row report"):
            self.verify()

    def test_a_malformed_batch_landing_row_is_refused_not_dropped(self):
        member1, head = self.history()
        self.holder(self.base, [self.row("fix/a", member1), "fix/b nope"])
        self.receipt(head)
        with self.assertRaisesRegex(land.Refusal, "cannot read"):
            self.verify()

    def test_verify_prints_the_pinned_publication_lease(self):
        """The hand push leases on this exact value, never on a reread of origin/main (D1/F2)."""
        member1, head = self.history()
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head)
        output = io.StringIO()
        with redirect_stdout(output):
            self.assertEqual(self.verify(), 0)
        self.assertIn(f"PUBLISH_LEASE={member1}", output.getvalue())

    def test_main_moving_during_the_witness_is_refused(self):
        member1, head = self.history()
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head)

        def moved(*_args, **_kwargs):
            self.git(self.shared, "push", "-f", "origin", f"{head}:{land.MAIN_REF}")
            return subprocess.CompletedProcess([], 0, "", "")

        try:
            with (patch.object(land, "LOCK_DIR", self.lock), patch.object(land, "ssh", side_effect=moved)):
                with self.assertRaisesRegex(land.Refusal, "origin/main moved from .* during verification"):
                    land.verify_receipt(self.path, None, None, self.base)
        finally:
            self.git(self.shared, "push", "-f", "origin", f"{member1}:{land.MAIN_REF}")
            self.git(self.shared, "fetch", "origin")

    def test_main_moving_during_the_preflight_is_refused(self):
        member1, head = self.history()
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head)
        real = land.publication_preflight

        def move(*args, **kwargs):
            self.git(self.shared, "push", "-f", "origin", f"{head}:{land.MAIN_REF}")
            self.git(self.shared, "fetch", "origin")
            return real(*args, **kwargs)

        try:
            with (patch.object(land, "LOCK_DIR", self.lock),
                  patch.object(land, "ssh", return_value=subprocess.CompletedProcess([], 0, "", "")),
                  patch.object(land, "publication_preflight", side_effect=move)):
                with self.assertRaisesRegex(land.Refusal, "origin/main moved from .* during verification"):
                    land.verify_receipt(self.path, None, None, self.base)
        finally:
            self.git(self.shared, "push", "-f", "origin", f"{member1}:{land.MAIN_REF}")
            self.git(self.shared, "fetch", "origin")

    def test_a_row_report_changed_during_the_preflight_is_refused(self):
        """F6: the final pass re-hashes the report and row bytes, not only the receipt."""
        member1, head = self.history()
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head)
        rows = self.folder / "rows.json"
        real = land.publication_preflight

        def damage(*args, **kwargs):
            rows.write_text(rows.read_text(encoding="utf-8") + "\n", encoding="utf-8")
            return real(*args, **kwargs)

        with (patch.object(land, "LOCK_DIR", self.lock),
              patch.object(land, "ssh", return_value=subprocess.CompletedProcess([], 0, "", "")),
              patch.object(land, "publication_preflight", side_effect=damage)):
            with self.assertRaisesRegex(land.Refusal, "row report .* no longer matches"):
                land.verify_receipt(self.path, None, None, self.base)

    def test_a_report_changed_during_the_preflight_is_refused(self):
        member1, head = self.history()
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head)
        report = self.folder / "landing-check.json"
        real = land.publication_preflight

        def damage(*args, **kwargs):
            report.write_text(report.read_text(encoding="utf-8") + "\n", encoding="utf-8")
            return real(*args, **kwargs)

        with (patch.object(land, "LOCK_DIR", self.lock),
              patch.object(land, "ssh", return_value=subprocess.CompletedProcess([], 0, "", "")),
              patch.object(land, "publication_preflight", side_effect=damage)):
            with self.assertRaisesRegex(land.Refusal, "report .* no longer matches"):
                land.verify_receipt(self.path, None, None, self.base)

    def test_after_verify_a_moved_main_fails_the_printed_lease(self):
        member1, head = self.history()
        self.holder(self.base, [self.row("fix/a", member1)])
        self.receipt(head)
        output = io.StringIO()
        with redirect_stdout(output):
            self.assertEqual(self.verify(), 0)
        lease = next(line.split("=", 1)[1] for line in output.getvalue().splitlines()
                     if line.startswith("PUBLISH_LEASE="))
        self.assertEqual(lease, member1)
        self.git(self.shared, "reset", "--keep", member1)
        self.put(self.shared, "tracked.txt", "someone else's landing\n")
        self.git(self.shared, "commit", "-am", "someone else")
        other = land.revision(self.shared, "HEAD")
        self.git(self.shared, "push", "-f", "origin", f"{other}:{land.MAIN_REF}")
        push = land.git(self.shared, "push", f"--force-with-lease=refs/heads/main:{lease}", "origin",
                        f"{head}:refs/heads/main", check=False)
        self.assertNotEqual(push.returncode, 0)


class CheckBatchBaseTests(unittest.TestCase):
    setUp = LandingFixture.setUp
    git = LandingFixture.git
    put = LandingFixture.put
    make_record = LandingFixture.make_record

    def test_check_measures_a_member_against_its_batch_start_on_main(self):
        self.put(self.shared, "tracked.txt", "member one\n")
        self.git(self.shared, "commit", "-am", "member 1")
        member1 = land.revision(self.shared, "HEAD")
        self.git(self.shared, "push", "origin", f"{member1}:{land.MAIN_REF}")
        self.git(self.shared, "reset", "--keep", self.base)
        with (patch.object(land, "start_remote_job") as start, patch.object(land, "new_run", return_value=self.folder),
              patch.object(land, "cleanup_after_check")):
            self.assertEqual(land.check_topic(self.shared, self.branch, "nas1", self.base), 0)
        start.assert_called_once_with(self.folder, "nas1", self.ref, self.head, self.tree, self.base, member1, False)

    def test_a_batch_capable_check_is_asked_for_its_row_report(self):
        self.put(self.shared, "tracked.txt", "member one\n")
        self.git(self.shared, "commit", "-am", "member 1")
        member1 = land.revision(self.shared, "HEAD")
        self.git(self.shared, "push", "origin", f"{member1}:{land.MAIN_REF}")
        self.put(self.shared, "scripts/pm-landing-check.py", " ".join(land.BATCH_CHECK_MARKS) + "\n")
        self.git(self.shared, "add", "scripts/pm-landing-check.py")
        self.git(self.shared, "commit", "-qm", "the comparison lines")
        head = land.revision(self.shared, "HEAD")
        tree = land.revision(self.shared, "HEAD^{tree}")
        self.git(self.shared, "branch", "-f", self.branch, head)
        self.git(self.shared, "push", "-f", "origin", f"{head}:{self.ref}")
        self.git(self.shared, "reset", "--keep", self.base)
        self.head, self.tree = head, tree
        self.make_record(1)
        with (patch.object(land, "start_remote_job") as start, patch.object(land, "new_run", return_value=self.folder),
              patch.object(land, "cleanup_after_check")):
            self.assertEqual(land.check_topic(self.shared, self.branch, "nas1", self.base), 0)
        start.assert_called_once_with(self.folder, "nas1", self.ref, head, tree, self.base, member1, True)

    def test_a_moving_base_name_is_refused_not_pinned(self):
        with self.assertRaisesRegex(land.Refusal, "never a moving name"):
            land.commit_or_refuse(self.shared, "origin/main", "checked base")

    def test_a_base_that_is_not_on_main_is_refused(self):
        with self.assertRaisesRegex(land.Refusal, "is not on the fetched origin/main"):
            land.check_topic(self.shared, self.branch, "nas1", self.head)


if __name__ == "__main__":
    unittest.main()
