"""Remote landing witness tests using real Git repositories and worktrees."""

import argparse
import importlib.util
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
        self.folder = self.evidence / "run"
        self.folder.mkdir(parents=True)
        self.ignore_file = "Plans/.audits/ignored.txt"
        self.ignore_directory = "Plans/.audits/whole"
        self.audit_child = f"{self.ignore_directory}/included.json"
        self.raw_capture = f"{land.RAW_LINK}/capture.jsonl"
        patches = patch.multiple(
            land, EVIDENCE=self.evidence, SHARED=self.shared,
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

    def git(self, repository, *args):
        repository.mkdir(parents=True, exist_ok=True)
        return land.git(repository, *args)

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
        lock = Mock()

        def stop_shards(*_):
            self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
            raise land.Refusal("a blocking shard failure")

        with (patch.object(land, "verify_over_ssh") as verify,
              patch.object(land, "shared_shards", side_effect=stop_shards),
              self.assertRaisesRegex(land.Refusal, "blocking shard failure")):
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
              patch.object(land, "LandingLock"),
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
        self.assertEqual(lock.owed, "")
        publish.assert_called_once()


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


if __name__ == "__main__":
    unittest.main()
