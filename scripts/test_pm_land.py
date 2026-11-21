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
        # Direct publication fixtures can use their pinned tracking ref without a server.
        # Workflows with a disposable origin use the real primary fetch.
        primary_fetch = land.fetch_primary

        def fixture_primary_fetch(root, guard_fd):
            if land.git(root, "config", "--get", "remote.origin.url", check=False).returncode == 0:
                primary_fetch(root, guard_fd)

        patcher = patch.object(land, "fetch_primary", side_effect=fixture_primary_fetch)
        patcher.start()
        self.addCleanup(patcher.stop)

    def git(self, repository, *args, **kwargs):
        repository.mkdir(parents=True, exist_ok=True)
        return land.git(repository, *args, **kwargs)

    def put(self, root, name, content):
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def hand_script(self):
        return self.put(self.root, "hand-pm-land.py", f"""
import importlib.util
from pathlib import Path
spec = importlib.util.spec_from_file_location("pm_land", {str(Path(__file__).with_name('pm-land.py').resolve())!r})
land = importlib.util.module_from_spec(spec)
spec.loader.exec_module(land)
land.EVIDENCE = Path({str(self.evidence)!r})
raise SystemExit(land.main())
""")

    def hand_require_raw_inputs(self, root):
        self.put(root, land.RAW_MANIFEST, (self.shared / land.RAW_MANIFEST).read_text())
        with (root / ".git/info/exclude").open("a") as exclude:
            exclude.write("\n/tests/agent_packet_restrictions\n")
        (root / land.RAW_LINK).symlink_to(self.evidence / "raw", target_is_directory=True)

    def hand_receipt_environment(self, root, base, candidate, expected=None):
        if expected is None:
            expected = land.input_manifest(root, root, land.tracklist(root, candidate), candidate)
        receipt = self.folder / "hand-receipt.json"
        land.write_json(receipt, {"base": base, "commit": candidate, "exit_code": 1, "ignored_inputs": expected})
        return {"PM_LAND_RECEIPT_DIR": str(self.folder), "PM_LAND_RECEIPT_SHA256": land.file_hash(receipt),
                "PM_LAND_SCRIPT": str(self.hand_script()), "PM_LAND_TOPIC_WORKTREE": str(self.remote),
                "PM_LAND_TOPIC_BRANCH": "fix/hand"}

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

    def test_guarded_fast_forward_refuses_readiness_receipt_reissued_during_verification(self):
        name = f"{land.READINESS}/VALIDATOR_RECEIPT.json"
        old = '{"generated_at_utc":"2026-11-15T17:42:50+00:00"}\n'
        refreshed = '{"generated_at_utc":"2026-11-21T19:23:14+00:00"}\n'
        shared = self.put(self.shared, name, old)
        self.put(self.remote, name, old)
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        record = {**self.make_record(0), "ignored_inputs": land.input_manifest(
            self.remote, self.remote, land.tracklist(self.remote))}
        original_inventory = land.input_manifest

        def verify_then_return(*_):
            def reissue_after_hash(root, worktree, tracked, commit=None):
                inventory = original_inventory(root, worktree, tracked, commit)
                if root == self.shared:
                    shared.write_text(refreshed, encoding="utf-8")
                return inventory

            with patch.object(land, "input_manifest", side_effect=reissue_after_hash):
                self.assertEqual(self.verify(record=record)["exit_code"], 0)
            return record

        with (patch.object(land, "verify_over_ssh", side_effect=verify_then_return),
              self.assertRaisesRegex(land.Refusal, f"shared publication ignored input mismatch: {name}")):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "nas1", self.head, self.tree, self.base,
                                       {"tracked.txt"}, lock, False)
        self.assertEqual(land.revision(self.shared, "HEAD"), self.base)
        self.assertEqual(shared.read_text(), refreshed)
        self.assertFalse(self.lock_path.exists())

    def test_guarded_push_leaves_checkout_and_journal_when_ignored_input_appears(self):
        name = f"{land.READINESS}/approved-input.json"
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)

        def install_after_check(_folder, _host, head, _tree, _base):
            if land.revision(self.shared, "HEAD") == head:
                self.put(self.shared, name, '{"edition":"approved"}\n')
            return self.record

        with (patch.object(land, "verify_over_ssh", side_effect=install_after_check),
              patch.object(land, "shared_shards"), patch.object(land, "push_main") as push,
              self.assertRaisesRegex(land.Refusal, f"shared publication ignored input mismatch: {name}")):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "nas1", self.head, self.tree, self.base,
                                       {"tracked.txt"}, lock, False)
        push.assert_not_called()
        self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
        self.assertEqual((self.shared / name).read_text(), '{"edition":"approved"}\n')
        marker = land.json.loads(land.holder_field((self.lock_path / "holder.txt").read_text(), "publication"))
        self.assertEqual(marker["phase"], "fast-forward-pending")

    def test_guarded_push_rescans_when_an_already_hashed_receipt_is_replaced(self):
        name = f"{land.READINESS}/VALIDATOR_RECEIPT.json"
        later_name = f"{land.READINESS}/ZZ_LAST.json"
        approved = Path("/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261114/currentness-final")
        receipt = approved / "VALIDATOR_RECEIPT.json"
        original = receipt.read_text() if receipt.is_file() else '{"generated_at_utc":"previous"}\n'
        reissued = land.json.loads(original)
        reissued["generated_at_utc"] = "2026-11-21T20:49:00+00:00"
        target = self.put(self.shared, name, original)
        self.put(self.shared, later_name, "{}\n")
        replacement = self.put(self.root, "reissued.json", land.json.dumps(reissued))
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        inputs = land.input_manifest(self.shared, self.shared, land.tracklist(self.shared, self.head), self.head)
        record = {**self.record, "ignored_inputs": inputs}
        real_hash = land.regular_hash
        push_receipt_hashes = []

        def replace_during_scan(root, path, **kwargs):
            digest = real_hash(root, path, **kwargs)
            if land.revision(self.shared, "HEAD") == self.head:
                if path == name:
                    push_receipt_hashes.append(digest)
                elif path == later_name and replacement.exists():
                    self.assertEqual(push_receipt_hashes, [inputs[name]])
                    replacement.replace(target)
            return digest

        with (patch.object(land, "verify_over_ssh", return_value=record),
              patch.object(land, "shared_shards"),
              patch.object(land, "regular_hash", side_effect=replace_during_scan),
              patch.object(land, "push_main", return_value=subprocess.CompletedProcess([], 0, "", "")) as push,
              self.assertRaisesRegex(land.Refusal, f"shared publication ignored input mismatch: {name}")):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "nas1", self.head, self.tree, self.base,
                                       {"tracked.txt"}, lock, False)
        push.assert_not_called()
        self.assertEqual(push_receipt_hashes, [inputs[name], land.file_hash(target)])
        self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
        marker = land.json.loads(land.holder_field((self.lock_path / "holder.txt").read_text(), "publication"))
        self.assertEqual(marker["phase"], "fast-forward-pending")

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
              patch.object(land, "verify_over_ssh", return_value=self.record) as verify,
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

        with (patch.object(land, "verify_over_ssh", return_value=self.record) as verify,
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
        with (patch.object(land, "verify_over_ssh", return_value=self.record) as verify,
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
              patch.object(land, "require_topic", return_value=self.head),
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
        self.assertEqual(publish.call_args.kwargs["baseline_inputs"], self.manifest)

    def test_followup_refuses_receipt_from_a_different_baseline_input_edition(self):
        input_name = f"{land.READINESS}/VALIDATOR_RECEIPT.json"
        self.git(self.shared, "reset", "--keep", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        record = {**self.record, "ignored_inputs": {**self.manifest, input_name: "new edition"}}
        baseline_inputs = {**self.manifest, input_name: "edition used for the baseline"}
        with (patch.object(land, "verify_over_ssh", return_value=record),
              self.assertRaisesRegex(land.Refusal, f"snapshot baseline ignored input mismatch: {input_name}")):
            with land.LandingLock("first", "fix/followup") as lock:
                lock.owed = self.base
                lock.heartbeat()
                land.push_checked_main(self.folder, "nas1", self.head, self.tree, self.base, {"tracked.txt"},
                                       lock, False, completes_followup=True, baseline_inputs=baseline_inputs)
        self.assertEqual(land.revision(self.shared, "HEAD"), self.base)
        held = (self.lock_path / "holder.txt").read_text()
        self.assertEqual(land.holder_field(held, "follow-up-owed"), self.base)
        self.assertFalse(land.holder_field(held, "publication"))

    def test_snapshot_rejects_baseline_recorded_against_a_different_readiness_hash(self):
        name = f"{land.READINESS}/VALIDATOR_RECEIPT.json"
        self.put(self.remote, name, '{"generated_at_utc":"before"}')
        self.put(self.shared, name, '{"generated_at_utc":"before"}')
        self.put(self.remote, f"{land.MIGRATION}/current_run.json", '{"run_id":"prior"}')
        inputs = land.input_manifest(self.remote, self.remote, land.tracklist(self.remote))
        self.assertIn(name, inputs)

        def generate(argv, *_):
            if "--record-baseline" in argv:
                baseline = self.remote / land.BASELINE
                baseline.parent.mkdir(parents=True)
                land.write_json(baseline, {"commit": self.head, "readiness_audit_inputs": {
                    "files": {name: "edition used during baseline generation"}}})
            return 0, 1

        with (patch.object(land, "prepare_remote", return_value=(self.remote, inputs)),
              patch.object(land, "capture", side_effect=generate),
              self.assertRaisesRegex(land.Refusal, f"snapshot baseline used different readiness bytes: {name}")):
            land.remote_snapshot(self.folder, "nas1", self.head, self.tree, "fix/landing-snapshot-fixture")
        self.assertFalse((self.folder / "snapshot-record.json").exists())


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
            self.assertEqual(land.rebase_and_push(self.shared, ref, self.base, rebased), rebased)
        self.assertEqual(pushes, [("push", f"--force-with-lease={ref}:{self.head}", "origin", f"{rebased}:{ref}")])


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
              patch.object(land, "verify_over_ssh", return_value=self.record) as verify,
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
              patch.object(land, "require_topic", return_value=self.head),
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

    def interrupt_publication(self, boundary, *, primary_plans=True, owed="", topic=None):
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
                      patch.object(land, "verify_over_ssh", return_value=self.record), patch.object(land, "shared_shards"),
                      land.LandingLock("first", "fix/interrupted") as lock):
                    if owed:
                        lock.owed = owed
                        lock.heartbeat()
                    kwargs = {"completes_followup": True} if owed else {}
                    land.push_checked_main(self.folder, "1070ti", self.head, self.tree, self.base,
                                           {"tracked.txt"}, lock, primary_plans, topic=topic, **kwargs)
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

    def test_interrupted_push_finishes_original_topic_cleanup(self):
        branch = "fix/interrupted"
        self.git(self.remote, "switch", "-c", branch)
        topic = land.Topic(str(self.remote), branch, self.head, str(land.common_git_dir(self.remote)))
        marker = self.interrupt_publication("push", primary_plans=False, topic=topic)
        self.assertEqual(land.json.loads(land.holder_field(marker, "publication"))["topic"], topic._asdict())
        with patch.object(land.time, "time", return_value=land.time.time() + 91 * 60):
            with land.LandingLock("next", "fix/other-topic") as lock:
                self.assertEqual(land.recover_pending_landing("nas1", lock, False), 0)
        self.assertFalse(self.remote.exists())
        self.assertNotEqual(self.git(self.shared, "show-ref", "--verify", land.check_ref(branch),
                                    check=False).returncode, 0)
        self.assertFalse(self.lock_path.exists())

    def parked_topic_cleanup(self):
        branch = "fix/interrupted"
        self.git(self.remote, "switch", "-c", branch)
        topic = land.Topic(str(self.remote), branch, self.head)
        self.interrupt_publication("push", primary_plans=False, topic=topic)
        with patch.object(land.time, "time", return_value=land.time.time() + 91 * 60):
            with land.LandingLock("first-recovery", "fix/other-topic") as lock:
                self.assertTrue(land.reconcile_publication(lock))
                self.assertIsNotNone(lock.cleanup)
        return land.check_ref(branch)

    def test_cleanup_finishes_after_interruption_between_worktree_removal_and_ref_deletion(self):
        ref = self.parked_topic_cleanup()
        self.git(self.shared, "worktree", "remove", str(self.remote))
        self.assertFalse(self.remote.exists())
        self.assertEqual(land.revision(self.shared, ref), self.head)
        self.assertNotIn(str(self.remote), self.git(self.shared, "worktree", "list", "--porcelain").stdout)

        with patch.object(land.time, "time", return_value=land.time.time() + 91 * 60):
            with land.LandingLock("next", "fix/next") as lock:
                self.assertEqual(land.recover_pending_landing("nas1", lock, False), 0)
                self.assertIsNone(lock.cleanup)
        self.assertNotEqual(self.git(self.shared, "show-ref", "--verify", ref, check=False).returncode, 0)
        self.assertFalse(self.lock_path.exists())

    def test_absent_worktree_cleanup_keeps_a_still_registered_checkout(self):
        ref = self.parked_topic_cleanup()
        self.remote.rename(self.root / "moved-topic")
        self.assertIn(str(self.remote), self.git(self.shared, "worktree", "list", "--porcelain").stdout)
        self.assert_absent_cleanup_refused(ref, self.head, "still registered")

    def test_absent_worktree_cleanup_keeps_a_changed_branch(self):
        ref = self.parked_topic_cleanup()
        self.git(self.shared, "worktree", "remove", str(self.remote))
        self.git(self.shared, "update-ref", ref, self.base, self.head)
        self.assert_absent_cleanup_refused(ref, self.base, "topic branch changed")

    def test_absent_worktree_cleanup_does_not_delete_an_intervening_ref_update(self):
        ref = self.parked_topic_cleanup()
        self.git(self.shared, "worktree", "remove", str(self.remote))
        real_git = land.git

        def update_before_deletion(root, *args, **kwargs):
            if args[:4] == ("update-ref", "--no-deref", "-d", ref):
                self.assertEqual(args[4:], (self.head,))
                real_git(root, "update-ref", ref, self.base, self.head)
            return real_git(root, *args, **kwargs)

        with patch.object(land, "git", side_effect=update_before_deletion):
            self.assert_absent_cleanup_refused(ref, self.base, "but expected")

    def test_absent_worktree_cleanup_keeps_tip_missing_from_fresh_primary_main(self):
        ref = self.parked_topic_cleanup()
        self.git(self.shared, "worktree", "remove", str(self.remote))
        self.assertEqual(land.full_main(self.shared), self.head)
        self.git(self.root / "origin.git", "update-ref", land.MAIN_REF, self.base, self.head)
        self.assert_absent_cleanup_refused(ref, self.head, "not in fetched primary main")

    def assert_absent_cleanup_refused(self, ref, tip, reason):
        with (patch.object(land.time, "time", return_value=land.time.time() + 91 * 60),
              self.assertRaisesRegex(land.Refusal, reason)):
            with land.LandingLock("next", "fix/next") as lock:
                land.recover_pending_landing("nas1", lock, False)
        self.assertEqual(land.revision(self.shared, ref), tip)
        self.assertTrue(land.holder_field((self.lock_path / "holder.txt").read_text(), "cleanup-owed"))

    def test_resume_of_same_published_topic_finishes_after_cleanup(self):
        branch = "fix/interrupted"
        self.git(self.remote, "switch", "-c", branch)
        topic = land.Topic(str(self.remote), branch, self.head)
        self.interrupt_publication("push", primary_plans=False, topic=topic)
        args = argparse.Namespace(branch=branch, checks_on="nas1", agent="next", wait_for_review=False)
        with (patch.object(land.time, "time", return_value=land.time.time() + 91 * 60),
              patch.object(land, "rebase_and_push") as rebase):
            self.assertEqual(land.live_run(args, self.shared, land.check_ref(branch)), 0)
        rebase.assert_not_called()
        self.assertFalse(self.remote.exists())
        self.assertFalse(self.lock_path.exists())

    def test_interrupted_push_hands_off_a_changed_original_worktree(self):
        branch = "fix/interrupted"
        self.git(self.remote, "switch", "-c", branch)
        topic = land.Topic(str(self.remote), branch, self.head, str(land.common_git_dir(self.remote)))
        self.interrupt_publication("push", primary_plans=False, topic=topic)
        changed = self.put(self.remote, "tracked.txt", "another thread's work")
        with (patch.object(land.time, "time", return_value=land.time.time() + 91 * 60),
              self.assertRaisesRegex(land.Refusal, "cleanup owed for fix/interrupted")):
            with land.LandingLock("next", "fix/other-topic") as lock:
                land.recover_pending_landing("nas1", lock, False)
        self.assertEqual(changed.read_text(), "another thread's work")
        self.assertEqual(land.revision(self.shared, land.check_ref(branch)), self.head)
        holder = (self.lock_path / "holder.txt").read_text()
        self.assertEqual(land.json.loads(land.holder_field(holder, "cleanup-owed")), topic._asdict())

    def test_queued_lander_refuses_switched_worktree_before_rebase(self):
        branch = "fix/requested"
        self.git(self.remote, "switch", "-c", branch)
        self.git(self.shared, "branch", "fix/other", self.base)
        enter = land.LandingLock.__enter__

        def switch_while_queued(lock):
            self.git(self.remote, "switch", "fix/other")
            return enter(lock)

        args = argparse.Namespace(branch=branch, checks_on="nas1", agent="fixture", wait_for_review=False)
        with (patch.object(land.LandingLock, "__enter__", new=switch_while_queued),
              patch.object(land, "rebase_and_push") as rebase,
              self.assertRaisesRegex(land.Refusal, "switched from refs/heads/fix/requested")):
            land.live_run(args, self.shared, land.check_ref(branch))
        rebase.assert_not_called()
        self.assertEqual(land.revision(self.shared, land.check_ref(branch)), self.head)
        self.assertFalse(self.lock_path.exists())

    def test_topic_switch_during_rebase_stops_the_topic_push(self):
        branch = "fix/requested"
        ref = land.check_ref(branch)
        self.git(self.remote, "switch", "-c", branch)
        self.git(self.shared, "branch", "fix/other", self.base)
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, self.base)
        real_git = land.git

        def switch_after_rebase(root, *argv, **kwargs):
            if argv[0] == "fetch":
                return
            self.assertNotEqual(argv[0], "push")
            result = real_git(root, *argv, **kwargs)
            if argv[0] == "rebase":
                real_git(root, "switch", "fix/other")
            return result

        with (patch.object(land, "git", side_effect=switch_after_rebase),
              patch.object(land, "ref_at", return_value=self.head),
              self.assertRaisesRegex(land.Refusal, "switched from refs/heads/fix/requested")):
            land.rebase_and_push(self.remote, ref, self.base, self.head)
        self.assertEqual(land.revision(self.shared, ref), self.head)

    def test_main_push_requires_primary_before_mirror_and_records_both(self):
        primary = self.root / "primary.git"
        mirror = self.root / "mirror.git"
        for remote in (primary, mirror):
            self.git(self.shared, "clone", "--bare", str(self.shared), str(remote))
            self.git(remote, "update-ref", land.MAIN_REF, self.base, self.head)
        advanced = self.git(self.shared, "commit-tree", self.tree, "-p", self.base,
                            "-m", "competing publication").stdout.strip()
        for remote in (primary, mirror):
            self.git(remote, "fetch", str(self.shared), advanced)
        self.git(self.shared, "remote", "add", "origin", str(primary))
        for remote in (primary, mirror):
            self.git(self.shared, "config", "--add", "remote.origin.pushurl", str(remote))
        results = self.folder / "publication-push.json"

        self.git(primary, "update-ref", land.MAIN_REF, advanced, self.base)
        with land.landing_guard() as guard_fd:
            refused = land.push_main(self.shared, self.base, self.head, results, guard_fd)
        record = land.read_json(results)
        self.assertNotEqual(refused.returncode, 0)
        self.assertIn("stale info", record["primary"]["stderr"])
        self.assertEqual(record["mirrors"], [])
        self.assertEqual(land.revision(mirror, "HEAD"), self.base)

        self.git(primary, "update-ref", land.MAIN_REF, self.base, advanced)
        self.git(mirror, "update-ref", land.MAIN_REF, advanced, self.base)
        with land.landing_guard() as guard_fd:
            accepted = land.push_main(self.shared, self.base, self.head, results, guard_fd)
        record = land.read_json(results)
        self.assertEqual(accepted.returncode, 0)
        self.assertEqual(record["primary"]["exit_code"], 0)
        self.assertNotEqual(record["mirrors"][0]["exit_code"], 0)
        self.assertEqual(land.revision(primary, "HEAD"), self.head)
        self.assertEqual(land.revision(mirror, "HEAD"), advanced)

    def test_reseal_publication_retains_handoff_for_assigned_agent(self):
        paths = ("Plans/Spec_Lock.json", "Plans/.evidence/topic/evidence.json", "Plans/auto_decisions.jsonl",
                 f"{land.READINESS}/VALIDATOR_RECEIPT.json",
                 "reports/governance-reseal-20261114/currentness-final/receipt.json")
        for path in paths:
            with self.subTest(path=path):
                self.assertTrue(land.requires_reseal({path}))
        self.assertFalse(land.requires_reseal({land.BASELINE, f"{land.MIGRATION}/current_run.json"}))

        self.git(self.shared, "reset", "--keep", self.base)
        origin = self.root / "origin.git"
        self.git(self.shared, "clone", "--bare", str(self.shared), str(origin))
        self.git(self.shared, "remote", "add", "origin", str(origin))
        self.git(self.shared, "fetch", "origin")
        self.put(self.shared, paths[0], "{}")
        self.git(self.shared, "add", "--", paths[0])
        self.git(self.shared, "commit", "-m", "assigned reseal")
        candidate, tree = (land.revision(self.shared, ref) for ref in ("HEAD", "HEAD^{tree}"))
        self.git(self.shared, "reset", "--keep", self.base)
        with (patch.object(land, "verify_over_ssh", return_value=self.record),
              patch.object(land, "shared_shards"), patch.object(land, "snapshot_followup") as automatic):
            with land.LandingLock("first", "fix/reseal") as lock:
                self.assertTrue(land.push_checked_main(self.folder, "nas1", candidate, tree, self.base,
                                                      {paths[0]}, lock, True))
                with self.assertRaisesRegex(land.Refusal, "reseal: follow the reseal-record hand procedure"):
                    land.recover_pending_landing("nas1", lock, False)
            with patch.object(land.time, "time", return_value=land.time.time() + 91 * 60):
                with land.LandingLock("next", "fix/other") as lock:
                    with self.assertRaisesRegex(land.Refusal, "reseal: follow the reseal-record hand procedure"):
                        land.recover_pending_landing("nas1", lock, False)
        automatic.assert_not_called()
        self.assertEqual(land.revision(origin, "HEAD"), candidate)
        holder = (self.lock_path / "holder.txt").read_text()
        self.assertEqual(land.holder_field(holder, "follow-up-owed"), candidate)
        self.assertEqual(land.holder_field(holder, "follow-up-kind"), "reseal")

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
              patch.object(land, "require_topic", return_value=self.head),
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

        with (patch.object(land, "verify_over_ssh", return_value=self.record), patch.object(land, "shared_shards", side_effect=lose_owner),
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
            return self.record

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
                with (patch.object(land, "verify_over_ssh", return_value=self.record) as verify,
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
        for state in ("starting", "running", "partial", "lost"):
            with self.subTest(state=state):
                name = land.job_name(self.folder, "snapshot")
                status = subprocess.CompletedProcess([], 0, land.json.dumps([{"name": name, "state": state}]), "")
                with (patch.object(land, "worktree_path", return_value=self.remote),
                      patch.object(land, "command", return_value=status),
                      patch.object(land, "git") as git,
                      self.assertRaisesRegex(land.Refusal, "may still have worker")):
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
                  patch.object(land, "verify_over_ssh", return_value=self.record),
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

        def publish_topic(*args, topic, **_):
            args[6].cleanup = topic
            return True

        with (patch.object(land, "git", side_effect=fixture_git),
              patch.object(land, "branch_worktree", return_value=self.remote),
              patch.object(land, "require_topic", return_value=self.head),
              patch.object(land, "rebase_and_push", return_value=self.head),
              patch.object(land, "ref_at", return_value=self.head),
              patch.object(land, "new_run", return_value=self.folder),
              patch.object(land, "checked_remote", return_value=self.make_record(1)),
              patch.object(land, "check_judgments", return_value=1),
              patch.object(land, "push_checked_main", side_effect=publish_topic) as publish,
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

        with (patch.object(land, "verify_over_ssh", return_value=self.record),
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

        with (patch.object(land, "verify_over_ssh", return_value=self.record), patch.object(land, "shared_shards", side_effect=lose_expected_head),
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

        with (patch.object(land, "verify_over_ssh", return_value=self.record),
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
                   "PM_LAND_RECEIPT_DIR": str(self.folder), "PM_LAND_SCRIPT": str(self.hand_script())}

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

    def test_failed_ref_transaction_keeps_partial_checkout_and_concurrent_edit(self):
        owner, base, candidate, tree = self.rejected_fast_forward_fixture()
        addition = "Plans/new.md"
        real_hash = land.file_hash
        generated = self.shared / addition
        editor_save = "someone else's later edition\n"
        inspected = []

        def read_during_editor_save(path):
            inspected.append(path)
            if path == self.shared / owner:
                self.assertIn(generated, inspected)
                generated.write_text(editor_save, encoding="utf-8")
            return real_hash(path)

        with (patch.object(land, "verify_over_ssh", return_value=self.record),
              patch.object(land, "file_hash", side_effect=read_during_editor_save),
              self.assertRaisesRegex(land.ManualRecovery, "Manual reconciliation required")):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "1070ti", candidate, tree, base,
                                       {owner, addition}, lock, True)
        self.assertEqual(land.revision(self.shared, "HEAD"), base)
        self.assertEqual(self.git(self.shared, "show", f":{owner}").stdout, "candidate edition\n")
        self.assertEqual(self.git(self.shared, "show", f":{addition}").stdout, "candidate addition\n")
        self.assertEqual((self.shared / owner).read_text(), "candidate edition\n")
        self.assertEqual(generated.read_text(), editor_save)
        self.assertEqual(self.git(self.shared, "show", ":outside.txt").stdout, "outside staged\n")
        self.assertEqual((self.shared / "outside.txt").read_text(), "outside working\n")
        notice = land.read_json(self.folder / "publication-recovery.json")
        self.assertEqual(notice["state"]["head"], base)
        self.assertIn(f"AM {addition}", notice["state"]["status"])
        self.assertEqual(set(notice["state"]["paths"]), {owner, addition})
        self.assertEqual(notice["phase"], "fast-forward-failed")

        status = self.git(self.shared, "status", "--porcelain").stdout
        with (patch.object(land.time, "time", return_value=land.time.time() + 91 * 60),
              self.assertRaises(land.ManualRecovery)):
            with land.LandingLock("next", "fix/next") as lock:
                land.reconcile_publication(lock)
        self.assertEqual(self.git(self.shared, "status", "--porcelain").stdout, status)
        self.assertEqual(generated.read_text(), editor_save)
        self.assertIn('"phase": "fast-forward-failed"', (self.lock_path / "holder.txt").read_text())

    def test_failed_fast_forward_preserves_unstaged_save_of_candidate_bytes(self):
        repo = Path(__file__).resolve().parents[1]
        evidence = "Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json"
        prior = self.git(repo, "show", f"9fa4018fb0:{evidence}", check=False)
        sealed = self.git(repo, "show", f"35f344d843:{evidence}", check=False)
        if prior.returncode or sealed.returncode:
            self.skipTest("historical Q5 evidence is unavailable")
        self.assertNotEqual(prior.stdout, sealed.stdout)
        self.git(self.shared, "reset", "--keep", self.base)
        target = self.put(self.shared, evidence, prior.stdout)
        self.git(self.shared, "add", "--", evidence)
        self.git(self.shared, "commit", "-m", "prior Q5 evidence")
        base = land.revision(self.shared, "HEAD")
        target.write_text(sealed.stdout, encoding="utf-8")
        self.git(self.shared, "commit", "-am", "seal Q5 evidence")
        candidate = land.revision(self.shared, "HEAD")
        tree = land.revision(self.shared, "HEAD^{tree}")
        self.git(self.shared, "update-ref", land.ORIGIN_MAIN, base)
        self.git(self.shared, "reset", "--keep", base)
        self.git(self.shared, "config", "core.filemode", "false")
        target.chmod(0o777)
        real_git = land.git
        unstaged = f" M {evidence}\n"

        def save_at_merge(root, *argv, **kwargs):
            self.assertNotEqual(argv[0], "push")
            if argv[0] != "merge":
                return real_git(root, *argv, **kwargs)
            self.assertIn(f'"candidate": "{candidate}"', (self.lock_path / "holder.txt").read_text())
            self.assertEqual(real_git(root, "status", "--porcelain").stdout, "")
            target.write_text(sealed.stdout, encoding="utf-8")
            self.assertEqual(real_git(root, "status", "--porcelain").stdout, unstaged)
            result = real_git(root, *argv, **{**kwargs, "check": False})
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("would be overwritten by merge", result.stderr)
            self.assertEqual(real_git(root, "status", "--porcelain").stdout, unstaged)
            return result

        with (patch.object(land, "git", side_effect=save_at_merge),
              patch.object(land, "verify_over_ssh", return_value=self.record), self.assertRaises(land.Refusal) as refusal):
            with land.LandingLock("first", "fix/topic") as lock:
                land.push_checked_main(self.folder, "1070ti", candidate, tree, base, {evidence}, lock, True)
        self.assertEqual(land.revision(self.shared, "HEAD"), base)
        self.assertEqual(self.git(self.shared, "show", f":{evidence}").stdout, prior.stdout)
        self.assertEqual(self.git(self.shared, "status", "--porcelain").stdout, unstaged)
        self.assertEqual(target.read_text(encoding="utf-8"), sealed.stdout)
        self.assertIn("Manual reconciliation", str(refusal.exception))
        holder = (self.lock_path / "holder.txt").read_text()
        marker = land.json.loads(land.holder_field(holder, "publication"))
        self.assertEqual((marker["candidate"], marker["phase"]), (candidate, "fast-forward-failed"))
        notice = land.read_json(self.folder / "publication-recovery.json")
        self.assertIn(evidence, notice["state"]["paths"])
        self.assertEqual(notice["state"]["status"], unstaged)

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
        origin = self.root / "historical-origin.git"
        self.git(folder, "clone", "--bare", str(folder), str(origin))
        self.git(folder, "remote", "add", "origin", str(origin))
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
                   **self.hand_receipt_environment(folder, base, candidate, expected={})}
            result = subprocess.run(["bash", "-c", recipe], cwd=folder, env=env, capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn(fixture_path, result.stderr)
            body = (self.lock_path / "holder.txt").read_text()
            self.assertFalse(land.holder_field(body, "publication"))
        self.assertEqual(local_copy.read_text(), "local ignored schema bytes\n")
        self.assertEqual(land.revision(folder, "HEAD"), base)
        self.assertFalse(self.lock_path.exists())

        tree = land.revision(folder, f"{candidate}^{{tree}}")
        with (patch.object(land, "SHARED", folder), patch.object(land, "verify_over_ssh", return_value=self.record),
              self.assertRaisesRegex(land.Refusal, f"candidate would overwrite ignored files: {fixture_path}")):
            with land.LandingLock("tool", "fix/historical") as lock:
                land.push_checked_main(self.folder, "nas1", candidate, tree, base, {".gitignore", fixture_path},
                                       lock, False)
        self.assertEqual(local_copy.read_text(), "local ignored schema bytes\n")
        self.assertEqual(land.revision(folder, "HEAD"), base)
        self.assertFalse(self.lock_path.exists())

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
python3() {
    if [ "${3-}" = push-main ]; then
        echo 'reached Git push'
        return 0
    fi
    command python3 "$@" || return "$?"
    if [ "${3-}" = fetch-main ]; then
        fetch_count=$(cat "$PM_LAND_TEST_FETCH_COUNT")
        fetch_count=$((fetch_count + 1))
        printf '%s\n' "$fetch_count" >"$PM_LAND_TEST_FETCH_COUNT"
        if [ "$fetch_count" = 2 ] && [ "$PM_LAND_TEST_PHASE" = push ]; then
            cp -- "$PM_LAND_TEST_PRIOR" "$PM_LAND_TEST_EVIDENCE"
        fi
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
                    self.hand_require_raw_inputs(folder)
                    self.git(folder, "add", "--", evidence, land.RAW_MANIFEST)
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
                        fetch_count = self.put(self.root, f"fetch-count-{phase}-{followup}", "0\n")
                        env = {**os.environ, "PM_LAND_LOCK": str(held), "PM_LAND_TOKEN": lock.token,
                               "PM_LAND_BASE": base, "PM_LAND_COMMIT": candidate,
                               "PM_LAND_PLANS_FOLLOWUP": "false",
                               "PM_LAND_COMPLETES_FOLLOWUP": str(followup).lower(),
                               **self.hand_receipt_environment(folder, base, candidate),
                               "PM_LAND_TEST_FETCH_COUNT": str(fetch_count),
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

    def test_hand_push_refuses_approved_ignored_edition_installed_after_verification(self):
        edition_name = "CURRENT_EVENT_SOURCE_INVENTORY.json"
        path = f"{land.READINESS}/{edition_name}"
        archive = Path("/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261114")
        prior = archive / "backup/shared-edition-before-install-20261115T1623Z" / edition_name
        approved = archive / "currentness-final" / edition_name
        old_bytes = prior.read_bytes() if prior.is_file() else b'{"edition":"previous"}\n'
        approved_bytes = approved.read_bytes() if approved.is_file() else b'{"edition":"approved"}\n'
        target = self.put(self.shared, path, "")
        target.write_bytes(old_bytes)
        edition = self.put(self.root, edition_name, "")
        edition.write_bytes(approved_bytes)
        self.assertNotEqual(old_bytes, approved_bytes)
        self.git(self.shared, "reset", "--keep", self.base)
        origin = self.root / "origin.git"
        self.git(self.shared, "clone", "--bare", str(self.shared), str(origin))
        self.git(self.shared, "remote", "add", "origin", str(origin))

        readme = (Path(__file__).resolve().parents[1] / "reports/landing-checks/README.md").read_text()
        fence = chr(96) * 3

        def recipe(title):
            return re.search(rf"^#### {title}\n.*?^{fence}sh\n(.*?)^{fence}$", readme, re.M | re.S)[1]

        fast_forward = recipe("Guard and fast-forward the checked commit")
        push = recipe("Push the checked commit")
        with land.LandingLock("hand", "fix/edition") as lock:
            env = {**os.environ, "PM_LAND_LOCK": str(self.lock_path), "PM_LAND_TOKEN": lock.token,
                   "PM_LAND_BASE": self.base, "PM_LAND_COMMIT": self.head,
                   "PM_LAND_PLANS_FOLLOWUP": "false", "PM_LAND_COMPLETES_FOLLOWUP": "false",
                   "PM_LAND_TEST_EDITION": str(edition), "PM_LAND_TEST_INPUT": path,
                   **self.hand_receipt_environment(self.shared, self.base, self.head)}
            command = fast_forward + 'cp -- "$PM_LAND_TEST_EDITION" "$PM_LAND_TEST_INPUT"\n' + push
            result = subprocess.run(["bash", "-c", command], cwd=self.shared, env=env, capture_output=True, text=True)
            self.assertEqual(result.returncode, 3, result.stderr)
            self.assertIn(path, result.stderr)
            self.assertEqual(self.git(self.shared, "status", "--porcelain").stdout, "")
            self.assertEqual(land.revision(self.shared, "HEAD"), self.head)
            holder = (self.lock_path / "holder.txt").read_text()
            self.assertEqual(land.json.loads(land.holder_field(holder, "publication"))["phase"],
                             "fast-forward-pending")
        self.assertEqual(land.revision(origin, "HEAD"), self.base)
        self.assertEqual(target.read_bytes(), approved_bytes)
        self.assertFalse((self.folder / "publication-push.json").exists())

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

        with (patch.object(land, "main_push_urls", return_value=["origin"]),
              patch.object(land.LandingLock, "mark_push_pending", new=after_transition),
              patch.object(land, "git", side_effect=fixture_git),
              patch.object(land, "verify_over_ssh", return_value=self.record), patch.object(land, "shared_shards")):
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
