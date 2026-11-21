"""Remote landing witness tests using real Git repositories and worktrees."""

import argparse
import ast
import importlib.util
import os
import subprocess
from pathlib import Path
import re
import socket
import sys
import tempfile
import threading
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
            land, EVIDENCE=self.evidence, SHARED=self.shared, LOCK=self.lock_path)
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
        with self.assertRaisesRegex(land.Refusal, "ignored input mismatch:.*ignored.txt"):
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


    def test_shared_failure_after_fast_forward_preserves_unrelated_edit(self):
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        def stop_shards(*_):
            self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
            path = self.shared / ".gitignore"
            path.write_text(path.read_text() + "/local-only\n")
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

        with (land.LandingLock("fixture", "fix/topic") as lock,
              patch.object(land, "git", side_effect=fetch),
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
              self.assertRaisesRegex(land.Refusal, rf"{land.job_name(self.folder, 'check')}.*--checks-on nas1")):
            land.live_run(args, self.shared, land.check_ref(args.branch))
        self.assertEqual(ssh.call_count, 3)
        self.assertFalse(self.lock_path.exists())
        data = land.read_json(self.folder / "transport-failure.json")
        self.assertEqual(data["job"], land.job_name(self.folder, "check"))
        self.assertEqual(data["host"], "1070ti")

    def test_remote_transport_failure_keeps_followup_owed(self):
        ssh_failure = subprocess.CompletedProcess([], 255)
        with (patch.object(land, "new_run", return_value=self.folder),
              patch.object(land, "ssh", side_effect=[ssh_failure] * 3),
              patch.object(land.time, "sleep"),
              self.assertRaisesRegex(land.Refusal, rf"{land.job_name(self.folder, 'snapshot')}.*--checks-on 1070ti")):
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
        self.assertIn('"phase": "fast-forward-pending"', marker)
        with patch.object(land.time, "time", return_value=land.time.time() + 91 * 60):
            with land.LandingLock("next", "fix/next") as lock:
                self.assertFalse(land.reconcile_publication(lock))
                self.assertEqual(land.revision(self.shared, "HEAD"), self.base)
                self.assertEqual(lock.owed, "")
        self.assertFalse(self.lock_path.exists())

    def test_interrupted_push_recovers_the_owed_plans_followup(self):
        marker = self.interrupt_publication("push")
        self.assertIn('"plans_followup": true', marker)
        self.assertIn('"phase": "push-pending"', marker)
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
        recovery = land.read_json(self.folder / "publication-recovery.json")
        self.assertEqual(recovery["candidate"], self.head)
        self.assertIn("changed owners", recovery["reason"])


    def test_extra_ignored_contract_input_on_either_side_is_refused(self):
        path = "Plans/.audits/usage-successor/governance/auto-decision-receipt.json"
        for root, label in ((self.shared, "shared checkout"), (self.remote, "remote checkout")):
            with self.subTest(label=label):
                added = self.put(root, path, '{"ref": "ContractName:Plans/Fixture.md"}')
                self.assertTrue(self.git(root, "check-ignore", path).stdout)
                with self.assertRaisesRegex(land.Refusal, rf"{label}.*auto-decision-receipt"):
                    self.verify()
                added.unlink()

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

    def tracked_decision_input(self):
        name = "Plans/.evidence/q5/evidence.json"
        self.git(self.shared, "reset", "--keep", self.base)
        target = self.put(self.shared, name, '{"version": "base"}')
        self.git(self.shared, "add", "--", name)
        self.git(self.shared, "commit", "-m", "tracked referring evidence")
        base = land.revision(self.shared, "HEAD")
        self.put(self.shared, "tracked.txt", "candidate")
        self.git(self.shared, "commit", "-am", "topic")
        head = land.revision(self.shared, "HEAD")
        tree = land.revision(self.shared, "HEAD^{tree}")
        self.git(self.shared, "reset", "--keep", base)
        return name, target, base, head, tree

    def test_shared_q5_working_state_stops_before_ff(self):
        name, target, base, head, tree = self.tracked_decision_input()
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, base)
        for mode in ("unstaged", "staged", "assume-unchanged", "skip-worktree"):
            with self.subTest(mode=mode):
                if mode in ("unstaged", "staged"):
                    target.write_text('{"version": "local"}')
                    if mode == "staged":
                        self.git(self.shared, "add", "--", name)
                else:
                    self.git(self.shared, "update-index", f"--{mode}", "--", name)
                with (patch.object(land, "verify_over_ssh") as verify,
                      patch.object(land, "shared_shards", side_effect=land.Refusal("unexpected fast-forward")),
                      land.LandingLock("first", "fix/topic") as lock,
                      self.assertRaisesRegex(land.Refusal, "Plans/.evidence/q5/evidence.json")):
                    land.push_checked_main(self.folder, "1070ti", head, tree, base, {"tracked.txt"}, lock, False)
                self.assertEqual(land.revision(self.shared, "HEAD"), base)
                verify.assert_not_called()
                if mode in ("unstaged", "staged"):
                    self.git(self.shared, "restore", "--source=HEAD", "--staged", "--worktree", "--", name)
                else:
                    self.git(self.shared, "update-index", f"--no-{mode}", "--", name)

    def test_all_job_ids_match_installed_long_job_rule(self):
        rule = re.compile(r"^[a-z0-9][a-z0-9_.-]{0,63}$")
        installed = Path("/mnt/Cursor/Tools/long-job/long-job")
        if installed.is_file():
            declaration = next(row for row in ast.parse(installed.read_text()).body
                               if isinstance(row, ast.Assign) and any(
                                   isinstance(name, ast.Name) and name.id == "NAME_OK" for name in row.targets))
            self.assertEqual(rule.pattern, ast.literal_eval(declaration.value.args[0]))
        branches = ("fix/landing-check-closure-stale-20261121-rebased",
                    "fix/Landing-Snapshot-Capitalized-Topic", "fix/" + "X" * 150)
        with patch.object(land, "RUNS", self.evidence):
            for branch in branches:
                folder = land.new_run(branch, self.head)
                for mode in ("check", "snapshot", "recheck", "followup"):
                    with self.subTest(branch=branch, mode=mode):
                        self.assertRegex(land.job_name(folder, mode), rule)

    def test_cleanup_only_queries_started_job_and_recognizes_installed_absence(self):
        worktree = self.remote
        land.write_json(self.folder / "check-job.json", {"job": land.job_name(self.folder, "check")})
        name = land.job_name(self.folder, "check")
        status = subprocess.CompletedProcess([], 2, "", f"long-job: no job named {name} on this machine")
        with (patch.object(land, "worktree_path", return_value=worktree),
              patch.object(land, "command", return_value=status) as command,
              patch.object(land, "git") as git):
            land.remote_cleanup(self.folder)
        command.assert_called_once_with(["long-job", "status", land.job_name(self.folder, "check"), "--json"],
                                        check=False)
        git.assert_called_once_with(land.CLONE, "worktree", "remove", "--force", str(worktree))

    def test_cleanup_after_completed_check_skips_unstarted_snapshot(self):
        check_name = land.job_name(self.folder, "check")
        land.write_json(self.folder / "check-job.json", {"job": check_name})

        def status(argv, **_):
            name = argv[2]
            if name == check_name:
                return subprocess.CompletedProcess(argv, 0, land.json.dumps([{"name": name, "state": "done"}]), "")
            return subprocess.CompletedProcess(argv, 2, "", f"long-job: no job named {name} on this machine")

        with (patch.object(land, "worktree_path", return_value=self.remote),
              patch.object(land, "command", side_effect=status) as command,
              patch.object(land, "git") as git):
            land.remote_cleanup(self.folder)
        command.assert_called_once_with(["long-job", "status", check_name, "--json"], check=False)
        git.assert_called_once_with(land.CLONE, "worktree", "remove", "--force", str(self.remote))

    def test_nas1_is_the_cli_default_and_1070ti_remains_available(self):
        for flags, host in (((), "nas1"), (("--checks-on", "1070ti"), "1070ti")):
            with (self.subTest(host=host),
                  patch.object(sys, "argv", ["pm-land.py", "run", "main", "--dry-run", *flags]),
                  patch.object(land, "dry_run", return_value=0) as dry_run):
                self.assertEqual(land.main(), 0)
            self.assertEqual(dry_run.call_args.args[0].checks_on, host)

    def test_cleanup_defers_while_job_is_starting_running_or_partial(self):
        land.write_json(self.folder / "snapshot-job.json", {"job": land.job_name(self.folder, "snapshot")})
        for state in ("starting", "running", "partial"):
            with self.subTest(state=state):
                name = land.job_name(self.folder, "snapshot")
                status = subprocess.CompletedProcess([], 0, land.json.dumps([{"name": name, "state": state}]), "")
                with (patch.object(land, "worktree_path", return_value=self.remote),
                      patch.object(land, "command", return_value=status),
                      patch.object(land, "git") as git,
                      self.assertRaisesRegex(land.Refusal, "still in use")):
                    land.remote_cleanup(self.folder)
                git.assert_not_called()

    def test_cleanup_failure_cannot_mask_dry_run_exit_two_or_success(self):
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.head)
        args = argparse.Namespace(branch="main", checks_on="1070ti")
        real_git = land.git

        def fixture_git(root, *argv, **kwargs):
            if argv[:2] == ("fetch", "origin"):
                return None
            return real_git(root, *argv, **kwargs)

        for code in (0, 2):
            with (self.subTest(code=code), patch.object(land, "git", side_effect=fixture_git),
                  patch.object(land, "new_run", return_value=self.folder),
                  patch.object(land, "checked_remote", return_value=self.make_record(code)),
                  patch.object(land, "verify_over_ssh"),
                  patch.object(land, "cleanup_over_ssh", side_effect=land.Refusal("worktree in use"))):
                self.assertEqual(land.dry_run(args, self.shared, land.MAIN_REF), code)
                self.assertIn("worktree in use",
                              (self.folder / "cleanup-failure.json").read_text())

    def test_cleanup_failure_does_not_report_failure_after_live_publication(self):
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        args = argparse.Namespace(branch="fix/fixture", checks_on="1070ti", agent="fixture", wait_for_review=False)
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
              patch.object(land, "checked_remote", return_value=self.make_record(1)),
              patch.object(land, "check_judgments", return_value=1),
              patch.object(land, "push_checked_main", return_value=True) as publish,
              patch.object(land, "remove_topic") as remove_topic,
              patch.object(land, "cleanup_over_ssh", side_effect=land.Refusal("remote cleanup disconnected"))):
            self.assertEqual(land.live_run(args, self.shared, land.check_ref(args.branch)), 1)
        publish.assert_called_once()
        remove_topic.assert_called_once()
        self.assertIn("remote cleanup disconnected", (self.folder / "cleanup-failure.json").read_text())

    def test_rollback_keeps_edits_staged_during_verification(self):
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        path = self.shared / ".gitignore"
        original = path.read_text()
        staged = original + "/staged-only\n"
        unstaged = original + "/worktree-only\n"

        def edits_during_verification(*_):
            self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
            path.write_text(staged)
            self.git(self.shared, "add", "--", ".gitignore")
            path.write_text(unstaged)
            raise land.Refusal("shards refused")

        with (patch.object(land, "verify_over_ssh"),
              patch.object(land, "shared_shards", side_effect=edits_during_verification),
              self.assertRaisesRegex(land.Refusal, "shards refused")):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "1070ti", self.head, self.tree, self.base,
                                       {"tracked.txt"}, lock, False)
        self.assertEqual(land.revision(self.shared, "HEAD"), self.base)
        self.assertEqual(self.git(self.shared, "show", ":.gitignore").stdout, staged)
        self.assertEqual(path.read_text(), unstaged)
        self.assertIn("MM .gitignore", self.git(self.shared, "status", "--porcelain").stdout)

    def test_recovery_replays_two_tree_checkout_if_ref_update_was_interrupted(self):
        self.interrupt_publication("ff")
        gitignore = self.shared / ".gitignore"
        original = gitignore.read_text()
        staged, unstaged = original + "/staged\n", original + "/unstaged\n"
        gitignore.write_text(staged)
        self.git(self.shared, "add", "--", ".gitignore")
        gitignore.write_text(unstaged)
        real_git = land.git

        def before_ref_update(root, *argv, **kwargs):
            if argv[:3] == ("update-ref", "-m", "recover unpublished landing"):
                raise land.Refusal("interruption before updating the main ref")
            return real_git(root, *argv, **kwargs)

        with (patch.object(land.time, "time", return_value=land.time.time() + 91 * 60),
              self.assertRaisesRegex(land.Refusal, "interruption before updating")):
            with land.LandingLock("second", "fix/next") as lock:
                with patch.object(land, "git", side_effect=before_ref_update):
                    land.reconcile_publication(lock)

        self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
        self.assertEqual((self.shared / "tracked.txt").read_text(), "first")
        self.assertIn('"phase": "rollback-pending"', (self.lock_path / "holder.txt").read_text())
        with patch.object(land.time, "time", return_value=land.time.time() + 91 * 60):
            with land.LandingLock("third", "fix/next") as lock:
                self.assertFalse(land.reconcile_publication(lock))
        self.assertEqual(land.revision(self.shared, "HEAD"), self.base)
        self.assertEqual(self.git(self.shared, "show", ":.gitignore").stdout, staged)
        self.assertEqual(gitignore.read_text(), unstaged)

    def test_wrong_unpublished_head_keeps_recovery_record(self):
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        alternate = None

        def lose_expected_head(*_):
            nonlocal alternate
            self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
            self.put(self.shared, "unrelated.txt", "new shared commit")
            self.git(self.shared, "add", "--", "unrelated.txt")
            self.git(self.shared, "commit", "-m", "somebody else moved shared HEAD")
            alternate = land.revision(self.shared, "HEAD")
            raise land.Refusal("checker stopped")

        with (patch.object(land, "verify_over_ssh"), patch.object(land, "shared_shards", side_effect=lose_expected_head),
              self.assertRaisesRegex(land.Refusal, "shared main")):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "1070ti", self.head, self.tree, self.base,
                                       {"tracked.txt"}, lock, False)
        self.assertEqual(land.revision(self.shared, "HEAD"), alternate)
        recovery = land.read_json(self.folder / "publication-recovery.json")
        self.assertEqual(recovery["candidate"], self.head)
        self.assertIn(alternate, recovery["reason"])

    def test_already_moved_head_is_handed_to_the_current_owner(self):
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)

        def concurrent_head_move(*_):
            self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
            self.git(self.shared, "reset", "--keep", self.base)
            raise land.Refusal("the shard check was interrupted")

        with (patch.object(land, "verify_over_ssh"),
              patch.object(land, "shared_shards", side_effect=concurrent_head_move),
              self.assertRaisesRegex(land.Refusal, "shared main changed")):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "1070ti", self.head, self.tree, self.base,
                                       {"tracked.txt"}, lock, False)
        self.assertEqual(land.revision(self.shared, "HEAD"), self.base)
        self.assertIn(self.base, land.read_json(self.folder / "publication-recovery.json")["reason"])
        self.assertIn(self.head, (self.lock_path / "holder.txt").read_text())

    def test_hand_receipt_recipe_preserves_exit_and_verifies_identity(self):
        readme = (Path(__file__).resolve().parents[1] / "reports/landing-checks/README.md").read_text()

        def recipe(title):
            fence = chr(96) * 3
            match = re.search(rf"^#### {title}\n.*?^{fence}sh\n(.*?)^{fence}$", readme, re.MULTILINE | re.DOTALL)
            self.assertIsNotNone(match, title)
            return match[1]

        capture = recipe("Save the checker receipt")
        verify = recipe("Verify the hand receipt")
        self.put(self.remote, "scripts/pm-landing-check.py", """
import json, os
code = int(os.environ["PM_LAND_TEST_EXIT"])
if code != 3:
    print(json.dumps({"schema_id": "pm.landing_check.report.v1",
                      "commit": os.environ.get("PM_LAND_TEST_BAD_COMMIT", os.environ["PM_LAND_COMMIT"]),
                      "base": os.environ.get("PM_LAND_TEST_BAD_BASE", os.environ["PM_LAND_BASE"]),
                      "subcheck_timeout_seconds": 1800}))
raise SystemExit(code)
""")
        environ = {**os.environ, "PM_LAND_COMMIT": self.head, "PM_LAND_BASE": self.base,
                   "PM_LAND_RECEIPT_DIR": str(self.folder)}

        def shell(snippet, **extra):
            return subprocess.run(["bash", "-c", snippet], cwd=self.remote,
                                  env={**environ, **extra}, capture_output=True, text=True, check=False)

        for code in range(4):
            with self.subTest(code=code):
                generated = shell(capture, PM_LAND_TEST_EXIT=str(code))
                self.assertEqual(generated.returncode, code, generated.stderr)
                self.assertEqual((self.folder / "checker.exit").read_text().strip(), str(code))
                checked = shell(verify)
                self.assertEqual(checked.returncode, code if code in (2, 3) else 0, checked.stderr)
                self.assertIn(f"Original checker exit {code}", checked.stdout)
        for field in ("COMMIT", "BASE"):
            with self.subTest(field=field):
                self.assertEqual(shell(capture, **{"PM_LAND_TEST_EXIT": "0",
                                                    f"PM_LAND_TEST_BAD_{field}": "0" * 40}).returncode, 0)
                checked = shell(verify)
                self.assertEqual(checked.returncode, 3)
                self.assertIn("report commit or base", checked.stderr)
        self.assertEqual(shell(capture, PM_LAND_TEST_EXIT="0").returncode, 0)
        self.report.write_text(self.report.read_text() + " ")
        self.assertIn("report SHA-256", shell(verify).stderr)
        self.assertEqual(shell(capture, PM_LAND_TEST_EXIT="0").returncode, 0)
        (self.folder / "checker.exit").write_text("1\n")
        self.assertIn("original exit and receipt disagree", shell(verify).stderr)
        self.assertEqual(shell(capture, PM_LAND_TEST_EXIT="0").returncode, 0)
        receipt = self.folder / "hand-receipt.json"
        receipt.write_text(receipt.read_text() + " ")
        self.assertIn("hand receipt SHA-256 changed", shell(verify).stderr)

    def rejected_fast_forward_fixture(self):
        self.git(self.shared, "reset", "--keep", self.base)
        owner = "Plans/owner.md"
        self.put(self.shared, owner, "base edition\n")
        self.put(self.shared, "outside.txt", "base outside\n")
        self.git(self.shared, "add", "--", owner, "outside.txt")
        self.git(self.shared, "commit", "-m", "base with owner")
        base = land.revision(self.shared, "HEAD")
        self.put(self.shared, owner, "candidate edition\n")
        self.put(self.shared, "Plans/new.md", "candidate addition\n")
        self.git(self.shared, "add", "--", owner, "Plans/new.md")
        self.git(self.shared, "commit", "-m", "candidate with Plans changes")
        candidate = land.revision(self.shared, "HEAD")
        tree = land.revision(self.shared, "HEAD^{tree}")
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, base)
        self.git(self.shared, "reset", "--keep", base)
        self.put(self.shared, "outside.txt", "outside staged\n")
        self.git(self.shared, "add", "--", "outside.txt")
        self.put(self.shared, "outside.txt", "outside working\n")

        hook = self.put(self.root, "reject-hooks/reference-transaction", """#!/bin/sh
if [ "$1" = prepared ]; then
    while read -r old new ref; do
        if [ "$ref" = refs/heads/main ]; then
            echo 'fixture rejected the main ref transaction' >&2
            exit 1
        fi
    done
fi
""")
        hook.chmod(0o700)
        self.git(self.shared, "config", "core.hooksPath", str(hook.parent))
        return owner, base, candidate, tree

    def test_failed_git_ref_transaction_repairs_candidate_checkout(self):
        owner, base, candidate, tree = self.rejected_fast_forward_fixture()
        with (patch.object(land, "verify_over_ssh"),
              self.assertRaisesRegex(land.Refusal, "fixture rejected the main ref transaction")):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "1070ti", candidate, tree, base,
                                       {owner, "Plans/new.md"}, lock, True)
        self.assertEqual(land.revision(self.shared, "HEAD"), base)
        self.assertEqual(self.git(self.shared, "show", f":{owner}").stdout, "base edition\n")
        self.assertEqual((self.shared / owner).read_text(), "base edition\n")
        self.assertFalse((self.shared / "Plans/new.md").exists())
        self.assertEqual(self.git(self.shared, "show", ":outside.txt").stdout, "outside staged\n")
        self.assertEqual((self.shared / "outside.txt").read_text(), "outside working\n")
        self.assertFalse(self.lock_path.exists())

    def test_failed_fast_forward_repairs_mount_mode_when_git_ignores_it(self):
        owner, base, candidate, tree = self.rejected_fast_forward_fixture()
        addition = "Plans/new.md"
        self.git(self.shared, "config", "core.filemode", "false")
        (self.shared / owner).chmod(0o777)
        real_git = land.git

        def mount_modes(root, *argv, **kwargs):
            if argv[0] == "merge":
                result = real_git(root, *argv, **{**kwargs, "check": False})
                self.assertNotEqual(result.returncode, 0)
                for name in (owner, addition):
                    self.assertTrue(real_git(root, "ls-files", "--stage", "--", name).stdout.startswith("100644 "))
                    (root / name).chmod(0o777)
                raise land.Refusal(result.stderr)
            result = real_git(root, *argv, **kwargs)
            if argv[:2] == ("--literal-pathspecs", "restore"):
                (root / owner).chmod(0o777)
            return result

        with (patch.object(land, "git", side_effect=mount_modes),
              patch.object(land, "verify_over_ssh"),
              self.assertRaisesRegex(land.Refusal, "fixture rejected the main ref transaction")):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "1070ti", candidate, tree, base, {owner, addition}, lock, True)
        self.assertEqual(land.revision(self.shared, "HEAD"), base)
        self.assertEqual(self.git(self.shared, "status", "--porcelain").stdout, "MM outside.txt\n")
        self.assertEqual(self.git(self.shared, "show", f":{owner}").stdout, "base edition\n")
        self.assertEqual((self.shared / owner).read_text(), "base edition\n")
        self.assertEqual((self.shared / owner).stat().st_mode & 0o777, 0o777)
        self.assertFalse((self.shared / addition).exists())
        self.assertEqual(self.git(self.shared, "show", ":outside.txt").stdout, "outside staged\n")
        self.assertEqual((self.shared / "outside.txt").read_text(), "outside working\n")
        self.assertFalse(self.lock_path.exists())

    def test_failed_fast_forward_retains_journal_for_ambiguous_bytes(self):
        owner, base, candidate, tree = self.rejected_fast_forward_fixture()
        self.git(self.shared, "config", "core.filemode", "false")
        real_git = land.git

        def concurrent_edit(root, *argv, **kwargs):
            if argv[0] != "merge":
                return real_git(root, *argv, **kwargs)
            result = real_git(root, *argv, **{**kwargs, "check": False})
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(real_git(root, "show", f":{owner}").stdout, "candidate edition\n")
            self.put(root, owner, "someone else's edit\n")
            (root / owner).chmod(0o777)
            if kwargs.get("check", True):
                raise land.Refusal("fixture rejected the main ref transaction")
            return result

        with (patch.object(land, "git", side_effect=concurrent_edit),
              patch.object(land, "verify_over_ssh"), self.assertRaisesRegex(land.Refusal, "fixture|ambiguous")):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "1070ti", candidate, tree, base,
                                       {owner, "Plans/new.md"}, lock, True)
        self.assertEqual(land.revision(self.shared, "HEAD"), base)
        self.assertEqual((self.shared / owner).read_text(), "someone else's edit\n")
        self.assertEqual(self.git(self.shared, "show", f":{owner}").stdout, "candidate edition\n")
        self.assertFalse((self.shared / "Plans/new.md").exists())
        marker = (self.lock_path / "holder.txt").read_text()
        self.assertIn(f'"pre_merge_head": "{base}"', marker)
        self.assertIn(owner, (self.folder / "publication-recovery.json").read_text())

    def test_recovery_repairs_interrupted_failed_fast_forward_even_if_candidate_reached_origin(self):
        owner, base, candidate, tree = self.rejected_fast_forward_fixture()
        self.git(self.shared, "config", "core.filemode", "false")
        origin = self.root / "origin.git"
        self.git(self.shared, "clone", "--bare", str(self.shared), str(origin))
        self.git(self.shared, "remote", "add", "origin", str(origin))
        # The local clone copied the candidate object without advancing its main.
        self.git(origin, "cat-file", "-e", f"{candidate}^{{commit}}")
        real_git = land.git

        def interrupt_after_merge(root, *argv, **kwargs):
            if argv[0] != "merge":
                return real_git(root, *argv, **kwargs)
            result = real_git(root, *argv, **{**kwargs, "check": False})
            os._exit(76 if result.returncode else 77)

        pid = os.fork()
        if pid == 0:
            try:
                with (patch.object(land, "git", side_effect=interrupt_after_merge),
                      patch.object(land, "verify_over_ssh"), land.LandingLock("first", "fix/interrupted") as lock):
                    land.push_checked_main(self.folder, "1070ti", candidate, tree, base,
                                           {owner, "Plans/new.md"}, lock, True)
            except BaseException:
                os._exit(78)
            os._exit(79)
        _, status = os.waitpid(pid, 0)
        self.assertEqual(os.waitstatus_to_exitcode(status), 76)
        marker = (self.lock_path / "holder.txt").read_text()
        self.assertIn(f'"pre_merge_head": "{base}"', marker)
        self.assertEqual(self.git(self.shared, "show", f":{owner}").stdout, "candidate edition\n")
        for name in (owner, "Plans/new.md"):
            (self.shared / name).chmod(0o777)

        self.git(origin, "update-ref", land.MAIN_REF, candidate, base)
        with patch.object(land.time, "time", return_value=land.time.time() + 91 * 60):
            with land.LandingLock("next", "fix/next") as lock:
                self.assertTrue(land.reconcile_publication(lock))
                self.assertEqual(lock.owed, candidate)
                self.assertIsNone(lock.publication)
        self.assertEqual(land.revision(self.shared, "HEAD"), base)
        self.assertEqual(self.git(self.shared, "show", f":{owner}").stdout, "base edition\n")
        self.assertEqual((self.shared / owner).read_text(), "base edition\n")
        self.assertEqual(self.git(self.shared, "show", ":outside.txt").stdout, "outside staged\n")
        self.assertEqual((self.shared / "outside.txt").read_text(), "outside working\n")
        self.assertFalse((self.shared / "Plans/new.md").exists())

    def test_hand_fast_forward_protects_historical_ignored_fixture(self):
        repo = Path(__file__).resolve().parents[1]
        fixture_path = "tests/fixtures/governance/raw_evidence_capture_modes.schema.json"
        history = "289983decc7bbecb595d5de767647eb8c8bc4c8c"
        historic = self.git(repo, "show", f"{history}:{fixture_path}", check=False)
        if historic.returncode:
            self.skipTest("fixture-promotion history is unavailable")
        folder = self.root / "historic"
        self.git(folder, "init", "-b", "main")
        self.git(folder, "config", "user.name", "Landing fixture")
        self.git(folder, "config", "user.email", "fixture@example.invalid")
        self.git(folder, "config", "core.hooksPath", str(self.root / "no-hooks"))
        self.put(folder, ".gitignore", self.git(repo, "show", f"{history}^:.gitignore").stdout)
        self.git(folder, "add", "--", ".gitignore")
        self.git(folder, "commit", "-m", "historic base")
        base = land.revision(folder, "HEAD")
        self.git(folder, "update-ref", land.ORIGIN_MAIN, base)
        self.put(folder, ".gitignore", self.git(repo, "show", f"{history}:.gitignore").stdout)
        self.put(folder, fixture_path, historic.stdout)
        self.git(folder, "add", "--", ".gitignore", fixture_path)
        self.git(folder, "commit", "-m", "promote fixture")
        candidate = land.revision(folder, "HEAD")
        self.git(folder, "reset", "--keep", base)
        local_copy = self.put(folder, fixture_path, "local ignored schema bytes\n")
        self.assertEqual(self.git(folder, "check-ignore", fixture_path).stdout.strip(), fixture_path)
        self.assertFalse(self.git(folder, "status", "--porcelain").stdout)

        rules = (repo / "AGENTS.md").read_text()
        command = re.search(r"(git merge --ff-only [^" + chr(96) + "]+)", rules)[1]
        command = command.replace("<checked commit>", '"$PM_LAND_COMMIT"')
        result = subprocess.run(["bash", "-c", command], cwd=folder,
                                env={**os.environ, "PM_LAND_COMMIT": candidate},
                                capture_output=True, text=True, check=False)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(local_copy.read_text(), "local ignored schema bytes\n")
        self.assertEqual(land.revision(folder, "HEAD"), base)
        for path in ("AGENTS.md", ".claude/CLAUDE.md", "reports/landing-checks/README.md"):
            self.assertIn('git merge --ff-only --no-overwrite-ignore "$PM_LAND_COMMIT"',
                          (repo / path).read_text())

        readme = (repo / "reports/landing-checks/README.md").read_text()
        fence = chr(96) * 3
        recipe = re.search(rf"^#### Guard and fast-forward the checked commit\n.*?^{fence}sh\n(.*?)^{fence}$",
                           readme, re.MULTILINE | re.DOTALL)[1]
        with land.LandingLock("hand", "fix/historical") as lock:
            env = {**os.environ, "PM_LAND_LOCK": str(self.lock_path), "PM_LAND_TOKEN": lock.token,
                   "PM_LAND_BASE": base, "PM_LAND_COMMIT": candidate,
                   "PM_LAND_PLANS_FOLLOWUP": "false", "PM_LAND_COMPLETES_FOLLOWUP": "false",
                   "PM_LAND_SCRIPT": str(repo / "scripts/pm-land.py")}
            result = subprocess.run(["bash", "-c", recipe], cwd=folder, env=env, capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn(fixture_path, result.stderr)
            body = (self.lock_path / "holder.txt").read_text()
            marker = land.json.loads(land.holder_field(body, "publication"))
            self.assertEqual((marker["pre_merge_head"], marker["phase"]), (base, "fast-forward-pending"))
        self.assertEqual(local_copy.read_text(), "local ignored schema bytes\n")
        self.assertEqual(land.revision(folder, "HEAD"), base)

    def test_hand_publication_rechecks_historical_q5_input_before_each_mutation(self):
        repo = Path(__file__).resolve().parents[1]
        evidence = "Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json"
        sealed = self.git(repo, "show", f"35f344d843:{evidence}", check=False)
        prior = self.git(repo, "show", f"9fa4018fb0:{evidence}", check=False)
        if sealed.returncode or prior.returncode:
            self.skipTest("historical Q5 evidence is unavailable")
        self.assertNotEqual(sealed.stdout, prior.stdout)
        replacement = self.put(self.root, "prior-q5.json", prior.stdout)
        readme = (repo / "reports/landing-checks/README.md").read_text()
        fence = chr(96) * 3

        def recipe(title):
            return re.search(rf"^#### {title}\n.*?^{fence}sh\n(.*?)^{fence}$", readme, re.M | re.S)[1]

        fast_forward = recipe("Guard and fast-forward the checked commit")
        push = recipe("Push the checked commit")
        observe_git = """
git() {
    if [ "$1" = push ]; then
        echo 'reached Git push'
        return 0
    fi
    command git "$@" || return "$?"
    if [ "$1" = fetch ] && [ "$PM_LAND_TEST_PHASE" = push ]; then
        cp -- "$PM_LAND_TEST_PRIOR" "$PM_LAND_TEST_EVIDENCE"
    fi
}
"""
        for phase in ("ff", "push"):
            for followup in (False, True):
                with self.subTest(phase=phase, followup=followup):
                    folder = self.root / f"hand-{phase}-{followup}"
                    origin = self.root / f"hand-origin-{phase}-{followup}.git"
                    self.git(folder, "init", "-b", "main")
                    self.git(folder, "config", "user.name", "Landing fixture")
                    self.git(folder, "config", "user.email", "fixture@example.invalid")
                    self.git(folder, "config", "core.hooksPath", str(self.root / "no-hooks"))
                    target = self.put(folder, evidence, sealed.stdout)
                    self.git(folder, "add", "--", evidence)
                    self.git(folder, "commit", "-m", "sealed Q5 base")
                    base = land.revision(folder, "HEAD")
                    self.git(folder, "clone", "--bare", str(folder), str(origin))
                    self.git(folder, "remote", "add", "origin", str(origin))
                    self.git(folder, "fetch", "origin")
                    topic = "reports/landing-checks/baseline.json" if followup else "topic.txt"
                    self.put(folder, topic, "candidate edit\n")
                    self.git(folder, "add", "--", topic)
                    self.git(folder, "commit", "-m", "candidate")
                    candidate = land.revision(folder, "HEAD")
                    self.git(folder, "reset", "--keep", base)
                    self.assertFalse(self.git(folder, "status", "--porcelain").stdout)
                    self.assertNotIn(evidence, land.changed_paths(folder, base, candidate))

                    held = self.root / f"hand-lock-{phase}-{followup}" / "held"
                    held.parent.mkdir()
                    with patch.object(land, "LOCK", held), land.LandingLock("hand", "fix/q5") as lock:
                        if followup:
                            lock.owed = base
                            lock.heartbeat()
                        env = {**os.environ, "PM_LAND_LOCK": str(held), "PM_LAND_TOKEN": lock.token,
                               "PM_LAND_BASE": base, "PM_LAND_COMMIT": candidate,
                               "PM_LAND_PLANS_FOLLOWUP": "false",
                               "PM_LAND_COMPLETES_FOLLOWUP": str(followup).lower(),
                               "PM_LAND_SCRIPT": str(repo / "scripts/pm-land.py"),
                               "PM_LAND_TEST_PHASE": phase, "PM_LAND_TEST_PRIOR": str(replacement),
                               "PM_LAND_TEST_EVIDENCE": evidence}
                        if phase == "ff":
                            target.write_text(prior.stdout)
                        command = observe_git + fast_forward + (push if phase == "push" else "")
                        result = subprocess.run(["bash", "-c", command], cwd=folder, env=env,
                                                capture_output=True, text=True, check=False)
                        self.assertNotIn("reached Git push", result.stdout)
                        self.assertEqual(result.returncode, 3, result.stderr)
                        self.assertIn(evidence, result.stderr)
                        body = (held / "holder.txt").read_text()
                        marker = land.holder_field(body, "publication")
                        if phase == "push":
                            self.assertEqual(land.json.loads(marker)["phase"], "fast-forward-pending")
                        else:
                            self.assertFalse(marker)
                        self.assertEqual(land.holder_field(body, "follow-up-owed"), base if followup else "")
                        self.assertEqual(land.revision(folder, "HEAD"), candidate if phase == "push" else base)
                    self.assertEqual(land.revision(origin, "HEAD"), base)
                    self.assertEqual(target.read_text(), prior.stdout)

    def test_takeover_between_push_marker_and_git_is_blocked(self):
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        actual_transition = land.LandingLock.mark_push_pending
        real_git = land.git
        outcomes = []
        push_tokens = []

        def attempt_takeover():
            with (self.lock_path.parent / "pm-land-reap.guard").open("a") as probe:
                try:
                    land.fcntl.flock(probe, land.fcntl.LOCK_EX | land.fcntl.LOCK_NB)
                except BlockingIOError:
                    outcomes.append("guard held")
                    return
            with patch.object(land.time, "time", return_value=land.time.time() + 91 * 60):
                replacement = land.LandingLock("next", "fix/next")
                replacement.__enter__()
                outcomes.append(replacement.token)

        def after_transition(first):
            actual_transition(first)
            contender = threading.Thread(target=attempt_takeover, daemon=True)
            contender.start()
            contender.join(timeout=3)
            self.assertFalse(contender.is_alive())

        def fixture_git(root, *argv, **kwargs):
            if argv[0] == "push":
                push_tokens.append(land.holder_field((self.lock_path / "holder.txt").read_text(), "token"))
                return subprocess.CompletedProcess([], 0)
            return real_git(root, *argv, **kwargs)

        with (patch.object(land.LandingLock, "mark_push_pending", new=after_transition),
              patch.object(land, "git", side_effect=fixture_git),
              patch.object(land, "verify_over_ssh"), patch.object(land, "shared_shards")):
            first = land.LandingLock("first", "fix/topic")
            try:
                with first:
                    self.assertTrue(land.push_checked_main(self.folder, "1070ti", self.head, self.tree,
                                                          self.base, {"tracked.txt"}, first, False))
            except land.Refusal:
                # Preserve the observed token for the failing pre-fix reproduction.
                pass
        self.assertEqual(push_tokens, [first.token])
        self.assertEqual(outcomes, ["guard held"])



if __name__ == "__main__":
    unittest.main()
