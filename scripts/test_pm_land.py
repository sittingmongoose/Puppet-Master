"""Remote landing witness tests using real Git repositories and worktrees."""

import argparse
import importlib.util
import os
import subprocess
from pathlib import Path
import socket
import tempfile
import unittest
from unittest.mock import Mock, patch

SPEC = importlib.util.spec_from_file_location("pm_land", Path(__file__).with_name("pm-land.py"))
land = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(land)


class LandingFixture(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix="test-pm-land-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.remote = self.root / "remote"
        self.shared = self.root / "shared"
        self.evidence = self.root / "evidence"
        self.lock_path = self.root / "landing-lock" / "held"
        self.lock_path.parent.mkdir()
        self.folder = self.evidence / "run"
        self.folder.mkdir(parents=True)
        self.ignore_file = "Plans/.audits/ignored.txt"
        self.ignore_directory = "Plans/.audits/whole"
        self.audit_child = f"{self.ignore_directory}/included.json"
        self.raw_capture = f"{land.RAW_LINK}/capture.jsonl"
        patches = patch.multiple(
            land, EVIDENCE=self.evidence, SHARED=self.shared, LOCK=self.lock_path,
            AUDIT_FILES=(self.ignore_file,), AUDIT_DIRS=(self.ignore_directory,))
        patches.start()
        self.addCleanup(patches.stop)

        self.git(self.shared, "init", "-b", "main")
        self.git(self.shared, "config", "user.email", "fixture@example.invalid")
        self.git(self.shared, "config", "user.name", "Landing fixture")
        self.git(self.shared, "config", "core.hooksPath", str(self.root / "no-hooks"))
        self.put(self.shared, ".gitignore", "/Plans/.audits/\n/tests/agent_packet_restrictions\n")
        self.put(self.shared, "tracked.txt", "first")
        self.put(self.shared, land.RAW_MANIFEST, land.json.dumps({"entries": [{"path": self.raw_capture}]}))
        self.git(self.shared, "add", "--", ".gitignore", "tracked.txt", land.RAW_MANIFEST)
        self.git(self.shared, "commit", "-m", "base")
        self.base = land.revision(self.shared, "HEAD")
        self.put(self.shared, "tracked.txt", "second")
        self.git(self.shared, "commit", "-am", "candidate")
        self.head = land.revision(self.shared, "HEAD")
        self.tree = land.revision(self.shared, "HEAD^{tree}")
        self.git(self.shared, "worktree", "add", "--detach", str(self.remote), self.head)

        self.put(self.shared, self.ignore_file, "audit notes")
        self.put(self.shared, self.audit_child, "{}")
        target = self.evidence / "raw"
        self.put(target, "capture.jsonl", "{}\n")
        (self.shared / land.RAW_LINK).symlink_to(target, target_is_directory=True)
        self.manifest = land.copy_inputs(self.shared, self.remote)
        self.report = self.folder / "landing-check.json"
        self.record_path = self.folder / "record.json"
        self.record = self.make_record(1)

    def git(self, repository, *args, **kwargs):
        repository.mkdir(parents=True, exist_ok=True)
        return land.git(repository, *args, **kwargs)

    def put(self, root, name, content):
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def make_record(self, code):
        land.write_json(self.report, {"schema_id": "pm.landing_check.report.v1",
                                     "commit": self.head, "base": self.base, "blocking": int(code == 2),
                                     "subcheck_timeout_seconds": land.TIMEOUT})
        return {"schema": 1, "host": "1070ti", "machine": socket.gethostname(), "worktree": str(self.remote),
                "head": self.head, "tree": self.tree, "base": self.base, "exit_code": code,
                "report": str(self.report), "report_sha256": land.file_hash(self.report),
                "started_utc": "2026-11-21T15:00:00+00:00", "ended_utc": "2026-11-21T15:20:00+00:00",
                "ignored_inputs": self.manifest, "shard_exit_code": 0}

    def verify(self, *, base=None, record=None):
        return land.verify_record(self.folder, self.remote, self.shared, "1070ti", self.head, self.tree,
                                  base or self.base, record or self.record)

    def test_matching_record_passes_with_unchanged_exit(self):
        result = self.verify()
        self.assertEqual(result["base"], self.base)
        self.assertEqual(result["tree"], self.tree)
        self.assertEqual(result["head"], self.head)
        self.assertTrue(result["full"])
        self.assertTrue(result["clean"])
        self.assertEqual(result["ignored_input_count"], 4)
        self.assertEqual(result["exit_code"], 1)

    def test_wrong_remote_head_refused(self):
        self.git(self.remote, "checkout", "--detach", self.base)
        with self.assertRaisesRegex(land.Refusal, "remote HEAD"):
            self.verify()

    def test_wrong_record_head_refused(self):
        with self.assertRaisesRegex(land.Refusal, "record head"):
            self.verify(record={**self.record, "head": self.base})

    def test_wrong_record_tree_refused(self):
        with self.assertRaisesRegex(land.Refusal, "record tree"):
            self.verify(record={**self.record, "tree": self.base})

    def test_sparse_remote_refused(self):
        self.git(self.remote, "sparse-checkout", "set", "--cone", "tests")
        with self.assertRaisesRegex(land.Refusal, "remote worktree is sparse"):
            self.verify()

    def test_dirty_remote_refused(self):
        self.put(self.remote, "tracked.txt", "changes")
        with self.assertRaisesRegex(land.Refusal, "remote worktree is dirty"):
            self.verify()

    def test_assume_unchanged_cannot_hide_remote_edits(self):
        self.git(self.remote, "update-index", "--assume-unchanged", "tracked.txt")
        self.put(self.remote, "tracked.txt", "hidden")
        self.assertFalse(self.git(self.remote, "status", "--porcelain").stdout)
        with self.assertRaisesRegex(land.Refusal, "hidden entries.*tracked.txt"):
            self.verify()

    def test_fetched_base_moved_refused(self):
        with self.assertRaisesRegex(land.Refusal, "record base"):
            self.verify(base=self.head)

    def test_abbreviated_base_refused_even_when_check_would_resolve_it(self):
        with self.assertRaisesRegex(land.Refusal, "recorded base must be a full"):
            self.verify(record={**self.record, "base": self.base[:12]})
        with self.assertRaisesRegex(land.Refusal, "fetched origin/main must be a full"):
            self.verify(base=self.base[:12])

    def test_missing_remote_ignored_input_refused(self):
        (self.remote / self.ignore_file).unlink()
        with self.assertRaisesRegex(land.Refusal, "ignored input:.*ignored.txt"):
            self.verify()

    def test_changed_remote_ignored_input_refused(self):
        self.put(self.remote, self.audit_child, '{"changed": true}')
        with self.assertRaisesRegex(land.Refusal, "remote checkout ignored input mismatch:.*included.json"):
            self.verify()

    def test_changed_shared_ignored_input_refused(self):
        self.put(self.shared, self.ignore_file, "a new edition")
        with self.assertRaisesRegex(land.Refusal, "shared checkout ignored input mismatch:.*ignored.txt"):
            self.verify()

    def test_shared_new_globbed_report_refused(self):
        self.put(self.shared, "Plans/.audits/audit-new/FINAL_REPORT.md", "new")
        with self.assertRaisesRegex(land.Refusal, "shared checkout ignored input mismatch:.*audit-new"):
            self.verify()

    def test_changed_raw_capture_rehashed_even_though_both_links_share_the_target(self):
        self.put(self.evidence / "raw", "capture.jsonl", '{"new": true}\n')
        with self.assertRaisesRegex(land.Refusal, "shared checkout ignored input mismatch:.*capture.jsonl"):
            self.verify()

    def test_report_change_refused(self):
        self.put(self.folder, self.report.name, "{}")
        with self.assertRaisesRegex(land.Refusal, "report path or SHA-256 changed"):
            self.verify()

    def test_checker_exit_two_stays_a_stop(self):
        record = self.make_record(2)
        self.assertEqual(self.verify(record=record)["exit_code"], 2)
        self.assertEqual(land.check_judgments(self.folder, "1070ti", record, None, False), 2)
        with self.assertRaisesRegex(land.Refusal, "disagrees with the reported blockers"):
            self.verify(record={**record, "exit_code": 0})

    def test_record_witness_refuses_edited_receipt(self):
        land.write_json(self.record_path, self.make_record(2))
        land.record_witness(self.remote).write_text(land.file_hash(self.record_path), encoding="ascii")
        land.write_json(self.record_path, {**land.read_json(self.record_path), "exit_code": 1})
        with patch.object(land, "worktree_path", return_value=self.remote):
            with self.assertRaisesRegex(land.Refusal, "record changed since the check"):
                land.remote_verify(self.folder, "1070ti", self.head, self.tree, self.base)

    def test_dry_run_surfaces_exit_two_and_never_pushes_or_locks(self):
        record = self.make_record(2)
        args = argparse.Namespace(branch="main", checks_on="1070ti")
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.head)
        real_git = land.git
        with (patch.object(land, "git", wraps=real_git) as git,
              patch.object(land, "LandingLock") as lock,
              patch.object(land, "new_run", return_value=self.folder),
              patch.object(land, "checked_remote", return_value=record),
              patch.object(land, "verify_over_ssh") as verify,
              patch.object(land, "cleanup_over_ssh") as cleanup):
            def local_fetch(root, *argv, **kwargs):
                if argv[:2] == ("fetch", "origin"):
                    return None
                return real_git(root, *argv, **kwargs)
            git.side_effect = local_fetch
            self.assertEqual(land.dry_run(args, self.shared, land.MAIN_REF), 2)
            self.assertFalse(any(call.args[1] == "push" for call in git.call_args_list))
            lock.assert_not_called()
        verify.assert_called_once()
        cleanup.assert_called_once()


    def test_shared_failure_after_fast_forward_resets_keep_and_preserves_unrelated_edit(self):
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        self.put(self.shared, ".gitignore", "/Plans/.audits/\n/tests/agent_packet_restrictions\n/local-only\n")
        def stop_shards(*_):
            self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
            raise land.Refusal("a blocking shard failure")

        with (patch.object(land, "verify_over_ssh") as verify,
              patch.object(land, "shared_shards", side_effect=stop_shards),
              self.assertRaisesRegex(land.Refusal, "blocking shard failure")):
            with land.LandingLock("fixture", "fix/topic") as lock:
                land.push_checked_main(self.folder, "1070ti", self.head, self.tree, self.base,
                                       {"tracked.txt"}, lock, False)
        self.assertEqual(land.revision(self.shared, "HEAD"), self.base)
        self.assertIn("/local-only", (self.shared / ".gitignore").read_text())
        verify.assert_called_once()

    def test_uncommitted_change_on_touched_path_stops_before_fast_forward(self):
        self.git(self.shared, "reset", "--keep", self.base)
        self.put(self.shared, "tracked.txt", "another thread's edit")
        with (patch.object(land, "verify_over_ssh") as verify,
              self.assertRaisesRegex(land.Refusal, "uncommitted changes.*tracked.txt")):
            land.push_checked_main(self.folder, "1070ti", self.head, self.tree, self.base,
                                   {"tracked.txt"}, Mock(), False)
        self.assertEqual(land.revision(self.shared, "HEAD"), self.base)
        self.assertEqual((self.shared / "tracked.txt").read_text(), "another thread's edit")
        verify.assert_not_called()

    def test_live_flow_keeps_exit_two_and_never_fast_forwards(self):
        record = self.make_record(2)
        args = argparse.Namespace(branch="fix/fixture", checks_on="1070ti", agent="fixture", wait_for_review=False)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        real_git = land.git

        def fixture_git(root, *argv, **kwargs):
            if argv[0] == "fetch":
                return None
            return real_git(root, *argv, **kwargs)

        with (patch.object(land, "git", side_effect=fixture_git),
              patch.object(land, "branch_worktree", return_value=self.remote),
              patch.object(land, "rebase_and_push", return_value=self.head),
              patch.object(land, "ref_at", return_value=self.head),
              patch.object(land, "new_run", return_value=self.folder),
              patch.object(land, "checked_remote", return_value=record),
              patch.object(land, "cleanup_over_ssh"),
              patch.object(land, "push_checked_main") as fast_forward):
            self.assertEqual(land.live_run(args, self.shared, land.check_ref(args.branch)), 2)
        fast_forward.assert_not_called()


    def test_followup_fetches_the_candidate_before_judging_its_baseline(self):
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        generation = self.folder / "generation"
        generation.mkdir()
        land.write_json(generation / "snapshot-record.json",
                        {"head": self.head, "tree": self.tree, "ignored_inputs": self.manifest})
        record = self.make_record(1)
        lock = Mock()
        real_git = land.git
        fetched = False

        def fetch(root, *argv, **kwargs):
            nonlocal fetched
            if argv[:2] == ("fetch", "origin"):
                if len(argv) == 3:
                    self.assertTrue(argv[2].startswith("refs/heads/fix/landing-snapshot-"))
                    fetched = True
                return None
            return real_git(root, *argv, **kwargs)

        def judge(*_):
            self.assertTrue(fetched)
            return 1

        with (patch.object(land, "git", side_effect=fetch),
              patch.object(land, "new_run", side_effect=[generation, self.folder]),
              patch.object(land, "start_remote_job"),
              patch.object(land, "checked_remote", return_value=record),
              patch.object(land, "ref_at", return_value=self.head),
              patch.object(land, "cleanup_over_ssh"),
              patch.object(land, "check_judgments", side_effect=judge),
              patch.object(land, "push_checked_main", return_value=True) as publish):
            self.assertEqual(land.snapshot_followup("1070ti", self.base, self.tree, lock, False), 1)
        publish.assert_called_once()
        self.assertTrue(publish.call_args.kwargs["completes_followup"])


    def test_topic_push_can_retry_after_local_rebase(self):
        branch = "fix/retry"
        ref = land.check_ref(branch)
        self.git(self.shared, "switch", "-c", branch)
        self.git(self.shared, "reset", "--keep", self.base)
        self.put(self.shared, "tracked.txt", "rebased change")
        self.git(self.shared, "commit", "-am", "rebased commit")
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        rebased = land.revision(self.shared, "HEAD")
        self.assertNotEqual(rebased, self.head)
        pushes = []
        real_git = land.git

        def fixture_git(root, *argv, **kwargs):
            if argv[0] == "fetch":
                return None
            if argv[0] == "push":
                pushes.append(argv)
                return None
            return real_git(root, *argv, **kwargs)

        with (patch.object(land, "git", side_effect=fixture_git),
              patch.object(land, "ref_at", return_value=self.head)):
            self.assertEqual(land.rebase_and_push(self.shared, ref, self.base), rebased)
        self.assertEqual(pushes, [("push", f"--force-with-lease={ref}:{self.head}", "origin", f"HEAD:{ref}")])


    def test_dry_run_retains_verification_but_refuses_a_moved_base(self):
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        args = argparse.Namespace(branch="main", checks_on="1070ti")
        record = self.make_record(1)
        real_git = land.git
        fetches = 0

        def moving_fetch(root, *argv, **kwargs):
            nonlocal fetches
            if argv[:2] == ("fetch", "origin"):
                fetches += 1
                if fetches == 2:
                    real_git(root, "update-ref", land.ORIGIN_MAIN, self.head)
                return None
            return real_git(root, *argv, **kwargs)

        with (patch.object(land, "git", side_effect=moving_fetch),
              patch.object(land, "new_run", return_value=self.folder),
              patch.object(land, "checked_remote", return_value=record),
              patch.object(land, "verify_over_ssh") as verify,
              patch.object(land, "cleanup_over_ssh") as cleanup,
              self.assertRaisesRegex(land.Refusal, "origin/main moved")):
            land.dry_run(args, self.shared, land.MAIN_REF)
        verify.assert_called_once_with(self.folder, "1070ti", self.head, self.tree, self.base)
        cleanup.assert_called_once()
        evidence = land.read_json(self.folder / "base-moved.json")
        self.assertEqual(evidence["checked_base"], self.base)
        self.assertEqual(evidence["fetched_base"], self.head)


    def test_job_names_fit_long_job_limit_on_all_modes(self):
        branches = ("tools-lead/landfast-timing-20261121", "fix/" + "shared-prefix-" * 10 + "one",
                    "fix/" + "shared-prefix-" * 10 + "two")
        names = []
        with patch.object(land, "RUNS", self.evidence):
            for branch in branches:
                folder = land.new_run(branch, self.head)
                for mode in ("check", "snapshot", "recheck"):
                    name = land.job_name(folder, mode)
                    self.assertLessEqual(len(name), 64, name)
                    names.append(name)
        self.assertEqual(len(set(names)), len(names))

    def test_remote_transport_failure_releases_unpublished_lock_and_keeps_job(self):
        args = argparse.Namespace(branch="fix/fixture", checks_on="1070ti", agent="fixture", wait_for_review=False)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        real_git = land.git

        def fixture_git(root, *argv, **kwargs):
            if argv[0] == "fetch":
                return None
            return real_git(root, *argv, **kwargs)

        ssh_failure = subprocess.CompletedProcess([], 255)
        with (patch.object(land, "git", side_effect=fixture_git),
              patch.object(land, "branch_worktree", return_value=self.remote),
              patch.object(land, "rebase_and_push", return_value=self.head),
              patch.object(land, "new_run", return_value=self.folder),
              patch.object(land, "ssh", side_effect=[ssh_failure] * 3) as ssh,
              patch.object(land.time, "sleep"),
              self.assertRaisesRegex(land.Refusal, r"pm-check-run.*--checks-on nas1")):
            land.live_run(args, self.shared, land.check_ref(args.branch))
        self.assertEqual(ssh.call_count, 3)
        self.assertFalse(self.lock_path.exists())
        data = land.read_json(self.folder / "transport-failure.json")
        self.assertEqual(data["job"], "pm-check-run")
        self.assertEqual(data["host"], "1070ti")

    def test_remote_transport_failure_keeps_followup_owed(self):
        ssh_failure = subprocess.CompletedProcess([], 255)
        with (patch.object(land, "new_run", return_value=self.folder),
              patch.object(land, "ssh", side_effect=[ssh_failure] * 3),
              patch.object(land.time, "sleep"),
              self.assertRaisesRegex(land.Refusal, r"pm-snapshot-run.*--checks-on 1070ti")):
            with land.LandingLock("fixture", "fix/fixture") as lock:
                lock.owed = self.head
                lock.heartbeat()
                land.snapshot_followup("nas1", self.head, self.tree, lock, False)
        self.assertIn(f"follow-up-owed: {self.head}", (self.lock_path / "holder.txt").read_text())

    def test_successful_wait_connection_resets_consecutive_ssh_failures(self):
        statuses = [0, 255, 255, 124, 255, 255, 0]
        heartbeat = Mock()
        with (patch.object(land, "ssh", side_effect=[subprocess.CompletedProcess([], code) for code in statuses])
              as ssh, patch.object(land.time, "sleep")):
            land.start_remote_job(self.folder, "1070ti", "check", heartbeat=heartbeat)
        self.assertEqual(ssh.call_count, len(statuses))
        self.assertEqual(heartbeat.call_count, len(statuses))
        self.assertFalse((self.folder / "transport-failure.json").exists())

    def test_remove_topic_without_upstream_uses_fetched_main(self):
        self.remove_topic_fixture()
        land.remove_topic(self.remote, "fix/remove-topic", self.head)
        self.assertFalse(self.remote.exists())
        self.assertNotEqual(self.git(self.shared, "show-ref", "--verify", "refs/heads/fix/remove-topic",
                                    check=False).returncode, 0)

    def test_remove_topic_ref_compare_and_swap_preserves_other_tip(self):
        self.remove_topic_fixture()
        real_git = land.git
        ref = "refs/heads/fix/remove-topic"

        def fixture_git(root, *argv, **kwargs):
            if argv[:3] == ("update-ref", "-d", ref) or argv[:2] == ("branch", "-D"):
                real_git(root, "update-ref", ref, self.base, self.head)
            return real_git(root, *argv, **kwargs)

        with patch.object(land, "git", side_effect=fixture_git), self.assertRaises(land.Refusal):
            land.remove_topic(self.remote, "fix/remove-topic", self.head)
        self.assertEqual(land.revision(self.shared, ref), self.base)

    def remove_topic_fixture(self):
        origin = self.root / "origin.git"
        self.git(self.shared, "clone", "--bare", str(self.shared), str(origin))
        self.git(self.shared, "remote", "add", "origin", str(origin))
        self.git(self.remote, "switch", "--no-track", "-c", "fix/remove-topic")
        self.git(self.shared, "reset", "--keep", self.base)

    def interrupt_publication(self, boundary, *, primary_plans=True, owed=""):
        """Crash without running Python cleanup at the selected real Git boundary."""
        origin = self.root / "origin.git"
        self.git(self.shared, "clone", "--bare", str(self.shared), str(origin))
        self.git(origin, "update-ref", land.MAIN_REF, self.base)
        self.git(self.shared, "remote", "add", "origin", str(origin))
        self.git(self.shared, "fetch", "origin")
        self.git(self.shared, "reset", "--keep", self.base)
        real_git = land.git
        pid = os.fork()
        if pid == 0:
            try:
                def interrupt_git(root, *argv, **kwargs):
                    if boundary == "push" and argv[0] == "push":
                        # The disposable server accepts the candidate before its client exits.
                        real_git(origin, "update-ref", land.MAIN_REF, self.head, self.base)
                        os._exit(76)
                    result = real_git(root, *argv, **kwargs)
                    if boundary == "ff" and argv[0] == "merge":
                        os._exit(76)
                    return result

                with (patch.object(land, "git", side_effect=interrupt_git),
                      patch.object(land, "verify_over_ssh"), patch.object(land, "shared_shards"),
                      land.LandingLock("first", "fix/interrupted") as lock):
                    if owed:
                        lock.owed = owed
                        lock.heartbeat()
                    kwargs = {"completes_followup": True} if owed else {}
                    land.push_checked_main(self.folder, "1070ti", self.head, self.tree, self.base,
                                           {"tracked.txt"}, lock, primary_plans, **kwargs)
            except BaseException:
                os._exit(77)
            os._exit(78)
        _, status = os.waitpid(pid, 0)
        self.assertEqual(os.waitstatus_to_exitcode(status), 76)
        self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
        marker = (self.lock_path / "holder.txt").read_text()
        self.assertIn(f'"base": "{self.base}"', marker)
        self.assertIn(f'"candidate": "{self.head}"', marker)
        return marker

    def test_interrupted_fast_forward_rolls_back_under_the_recovered_lock(self):
        marker = self.interrupt_publication("ff")
        self.assertIn('"plans_followup": true', marker)
        with patch.object(land.time, "time", return_value=land.time.time() + 91 * 60):
            with land.LandingLock("next", "fix/next") as lock:
                self.assertFalse(land.reconcile_publication(lock))
                self.assertEqual(land.revision(self.shared, "HEAD"), self.base)
                self.assertEqual(lock.owed, "")
        self.assertFalse(self.lock_path.exists())

    def test_interrupted_push_recovers_the_owed_plans_followup(self):
        marker = self.interrupt_publication("push")
        self.assertIn('"plans_followup": true', marker)
        with patch.object(land.time, "time", return_value=land.time.time() + 91 * 60):
            with land.LandingLock("next", "fix/next") as lock:
                self.assertTrue(land.reconcile_publication(lock))
                self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
                self.assertEqual(land.full_main(self.shared), self.head)
                self.assertEqual(lock.owed, self.head)
        self.assertIn(f"follow-up-owed: {self.head}", (self.lock_path / "holder.txt").read_text())

    def test_interrupted_followup_push_clears_the_completed_obligation(self):
        self.interrupt_publication("push", primary_plans=False, owed=self.base)
        with patch.object(land.time, "time", return_value=land.time.time() + 91 * 60):
            with land.LandingLock("next", "fix/next") as lock:
                self.assertTrue(land.reconcile_publication(lock))
                self.assertEqual(lock.owed, "")
        self.assertFalse(self.lock_path.exists())

    def test_live_recovery_finishes_owed_followup_before_rebasing_next_topic(self):
        self.interrupt_publication("push")
        args = argparse.Namespace(branch="fix/next", checks_on="nas1", agent="next", wait_for_review=False)
        actions = []

        def complete(host, base, tree, lock, review):
            self.assertEqual((host, base, tree, lock.owed, review),
                             ("nas1", self.head, self.tree, self.head, False))
            self.assertIsNone(lock.publication)
            actions.append("follow-up")
            lock.owed = ""
            lock.heartbeat()
            return 1

        def rebase(*_):
            actions.append("rebase")
            return self.head

        with (patch.object(land.time, "time", return_value=land.time.time() + 91 * 60),
              patch.object(land, "branch_worktree", return_value=self.remote),
              patch.object(land, "snapshot_followup", side_effect=complete),
              patch.object(land, "rebase_and_push", side_effect=rebase),
              patch.object(land, "remove_topic")):
            self.assertEqual(land.live_run(args, self.shared, land.check_ref(args.branch)), 1)
        self.assertEqual(actions, ["follow-up", "rebase"])
        self.assertFalse(self.lock_path.exists())

    def test_lost_lock_blocks_rollback_and_preserves_new_holder(self):
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        calls = []

        def lose_owner(*_):
            self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
            (self.lock_path / "holder.txt").write_text("token: other-holder\n", encoding="utf-8")
            calls.append("lost")
            raise land.Refusal("shard result disturbed")

        with (patch.object(land, "verify_over_ssh"), patch.object(land, "shared_shards", side_effect=lose_owner),
              self.assertRaisesRegex(land.Refusal, "changed owners")):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "1070ti", self.head, self.tree, self.base,
                                        {"tracked.txt"}, lock, False)
        self.assertEqual(calls, ["lost"])
        self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
        self.assertEqual((self.lock_path / "holder.txt").read_text(), "token: other-holder\n")

    def test_lost_lock_after_second_verification_blocks_the_push(self):
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        real_git = land.git
        verifications = []
        pushes = []

        def verify(*_):
            verifications.append(1)
            if len(verifications) == 2:
                (self.lock_path / "holder.txt").write_text("token: other-holder\n", encoding="utf-8")

        def fixture_git(root, *argv, **kwargs):
            if argv[0] == "push":
                pushes.append(argv)
                return subprocess.CompletedProcess([], 0)
            return real_git(root, *argv, **kwargs)

        with (patch.object(land, "git", side_effect=fixture_git),
              patch.object(land, "verify_over_ssh", side_effect=verify), patch.object(land, "shared_shards"),
              self.assertRaisesRegex(land.Refusal, "changed owners")):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "1070ti", self.head, self.tree, self.base,
                                        {"tracked.txt"}, lock, False)
        self.assertEqual(len(verifications), 2)
        self.assertEqual(pushes, [])


if __name__ == "__main__":
    unittest.main()
