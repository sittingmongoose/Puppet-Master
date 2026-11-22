"""Remote check and read-only receipt verification with private Git fixtures."""

from contextlib import redirect_stderr, redirect_stdout
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

    def test_public_cli_only_accepts_check_and_verify(self):
        script = Path(__file__).with_name("pm-land.py")
        result = subprocess.run(["python3", "-B", str(script), "--help"], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0)
        self.assertIn("{check,verify}", result.stdout)
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
                start.assert_called_once_with(self.folder, "nas1", self.ref, self.head, self.tree, self.base)
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

    def test_landing_rules_describe_the_remote_route_only(self):
        repo = Path(__file__).resolve().parents[1]
        sections = [path.read_text().split("### How to land on main\n")[1].split("### Never\n")[0]
                    for path in (repo / "AGENTS.md", repo / ".claude/CLAUDE.md")]
        self.assertEqual(sections[0], sections[1])
        for phrase in ("check <branch> --on <host>", "PM_LAND_SCRIPT", "verify --receipt", "--no-overwrite-ignore",
                       "default `nas1`", "verify` exiting 0 confirms only", "every 25 minutes",
                       "commit", "tree", "base", "ignored-input inventory", "report SHA-256", "exit"):
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


if __name__ == "__main__":
    unittest.main()
