"""Readiness input custody regressions; run with unittest discovery on this file under scripts/.

Use the existing landing suite's real-Git fixture and aggregate report stubs. No production audit
inputs are read, no repository baseline is recorded, and all fixture files are temporary.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]


def load_file(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


F = load_file("landing_readiness_test_fixtures", ROOT / "tests/test_pm_landing_check.py")
C = load_file("landing_readiness_currentness", ROOT / "scripts/pm_pnc019_currentness.py")


class ReadinessInputs(F.LandingRun):
    def setUp(self):
        super().setUp()
        self.audit_scratch = tempfile.TemporaryDirectory()
        self.addCleanup(self.audit_scratch.cleanup)
        self.source = Path(self.audit_scratch.name) / "audit"
        self.make_audit(self.source)
        self.module.SHARED_READINESS_AUDIT_ROOT = self.source
        self.stub(gates={self.RG_READINESS: []}, audit={self.AG_READINESS: []})

    def make_audit(self, source):
        source.mkdir(parents=True)
        for name in self.module.READINESS_AUDIT_DIRECT_INPUTS:
            path = source / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("{}\n")
        self.artifact = "EVENT_OCCURRENCES.jsonl"
        (source / self.artifact).write_text("original audit bytes\n")
        (source / "VALIDATOR_RECEIPT.json").write_text(json.dumps({
            "artifact_hashes": {f"{self.module.READINESS_AUDIT_REL}/{self.artifact}": "a" * 64},
        }))

    @property
    def local(self):
        return self.repo / self.module.READINESS_AUDIT_REL

    def baseline(self):
        return json.loads((self.repo / "baseline.json").read_text())

    def assert_refused_before_checks(self, message):
        self.timeouts.clear()
        before = (self.repo / "baseline.json").read_bytes()
        code, out = self.compare()
        self.assertEqual(code, 3, out + self.stderr)
        self.assertIn(message, self.stderr)
        self.assertEqual(self.timeouts, [])
        self.assertEqual((self.repo / "baseline.json").read_bytes(), before)
        self.assertFalse(self.local.is_symlink())

    def test_direct_dependency_list_matches_the_readiness_validator(self):
        self.assertEqual(self.module.READINESS_AUDIT_REL, C.EVENT_AUTHORITY_AUDIT_ROOT)
        expected = {C.EVENT_AUTHORITY_RECEIPT_REL_PATH, C.EVENT_AUTHORITY_STATUS_REL_PATH,
                    C.EVENT_AUTHORITY_GROUP_MANIFEST_REL_PATH, C.EVENT_AUTHORITY_QUARANTINE_LEDGER_REL_PATH,
                    C.EVENT_AUTHORITY_SOURCE_INVENTORY_REL_PATH}
        self.assertEqual({f"{self.module.READINESS_AUDIT_REL}/{p}"
                          for p in self.module.READINESS_AUDIT_DIRECT_INPUTS}, expected)

    def test_recorder_binds_direct_and_receipt_linked_actual_bytes_and_cleans_up(self):
        before = {p.relative_to(self.source): p.read_bytes() for p in self.source.rglob("*") if p.is_file()}
        self.record()
        binding = self.baseline()["readiness_audit_inputs"]
        self.assertEqual(binding["schema_id"], self.module.READINESS_AUDIT_INPUTS_SCHEMA_ID)
        self.assertEqual(binding["files"], {
            f"{self.module.READINESS_AUDIT_REL}/{p.as_posix()}": hashlib.sha256(data).hexdigest()
            for p, data in before.items()})
        self.assertFalse(self.local.exists())
        self.assertFalse(self.local.is_symlink())
        self.assertEqual({p.relative_to(self.source): p.read_bytes()
                          for p in self.source.rglob("*") if p.is_file()}, before)
        code, out = self.compare("--json")
        self.assertEqual(code, 0, out + self.stderr)
        self.assertEqual(json.loads(out)["readiness_audit_inputs"], binding)

    def test_equal_bytes_at_a_different_source_location_compare_normally(self):
        self.record()
        other = Path(self.audit_scratch.name) / "elsewhere"
        shutil.copytree(self.source, other)
        code, out = self.compare("--readiness-audit-root", str(other))
        self.assertEqual(code, 0, out + self.stderr)
        self.assertIn(str(other), out)
        self.assertFalse(self.local.exists())

    def test_same_size_same_mtime_artifact_edit_is_not_excused_by_equal_failure_counts(self):
        self.record()
        path = self.source / self.artifact
        stamp = path.stat()
        old = path.read_bytes()
        path.write_bytes(b"x" * len(old))
        os.utime(path, ns=(stamp.st_atime_ns, stamp.st_mtime_ns))
        self.assert_refused_before_checks(self.artifact)

    def test_missing_input_is_different_from_present_input(self):
        self.record()
        (self.source / "CURRENT_EVENT_SOURCE_INVENTORY.json").unlink()
        self.assert_refused_before_checks("CURRENT_EVENT_SOURCE_INVENTORY.json")

    def test_receipt_dependency_set_change_is_not_excused(self):
        self.record()
        path = self.source / "VALIDATOR_RECEIPT.json"
        receipt = json.loads(path.read_text())
        receipt["artifact_hashes"][f"{self.module.READINESS_AUDIT_REL}/new-artifact.json"] = "b" * 64
        path.write_text(json.dumps(receipt))
        self.assert_refused_before_checks("new-artifact.json")

    def test_malformed_receipt_bytes_are_still_bound(self):
        (self.source / "VALIDATOR_RECEIPT.json").write_text("invalid json\n")
        self.record()
        binding = self.baseline()["readiness_audit_inputs"]
        self.assertEqual(len(binding["files"]), 5)
        (self.source / "VALIDATOR_RECEIPT.json").write_text("other invalid json\n")
        self.assert_refused_before_checks("VALIDATOR_RECEIPT.json")

    def test_unrelated_ignored_audit_files_do_not_change_the_binding(self):
        self.record()
        (self.source / "unconsumed.log").write_text("unrelated audit output\n")
        code, out = self.compare()
        self.assertEqual(code, 0, out + self.stderr)

    def test_canonical_source_edits_remain_validator_findings(self):
        self.record()
        self.touch("Plans/Base.md")
        self.stub(gates={self.RG_READINESS: [F.drift("Plans/Base.md")]},
                  audit={self.AG_READINESS: [F.drift("Plans/Base.md")]})
        code, out = self.compare()
        self.assertEqual(code, 1, out + self.stderr)
        self.assertIn("event_authority_currentness_source_drift", out)

    def test_a_real_new_failure_with_identical_inputs_still_blocks(self):
        self.record()
        self.touch("Plans/Touched.md")
        failure = {"path": "Plans/Touched.md", "error": "event_authority_currentness_source_missing"}
        self.stub(gates={self.RG_READINESS: [failure]}, audit={self.AG_READINESS: [failure]})
        code, out = self.compare()
        self.assertEqual(code, 2, out + self.stderr)
        self.assertIn("the baseline does not excuse", out)

    def test_old_or_invalid_binding_refuses_comparison_without_rewriting_baseline(self):
        self.record()
        baseline = self.baseline()
        for value in [None, {"schema_id": "other", "files": {}},
                      {"schema_id": self.module.READINESS_AUDIT_INPUTS_SCHEMA_ID, "files": {}}]:
            with self.subTest(value=value):
                candidate = dict(baseline)
                if value is None:
                    candidate.pop("readiness_audit_inputs")
                else:
                    candidate["readiness_audit_inputs"] = value
                (self.repo / "baseline.json").write_text(json.dumps(candidate))
                self.assert_refused_before_checks("readiness audit inputs")

    def test_changes_during_each_aggregate_stop_and_leave_the_baseline_untouched(self):
        self.record()
        baseline = (self.repo / "baseline.json").read_bytes()
        path = self.source / self.artifact
        original = path.read_bytes()
        inner = self.module.run_check
        for check in self.module.CHECKS:
            with self.subTest(check=check):
                path.write_bytes(original)
                def changing(name, *args):
                    result = inner(name, *args)
                    if name == check:
                        path.write_text("changed during validation\n")
                    return result
                self.module.run_check = changing
                code, out = self.compare()
                self.assertEqual(code, 3, out + self.stderr)
                self.assertIn(f"changed during {check}", self.stderr)
                self.assertEqual((self.repo / "baseline.json").read_bytes(), baseline)
                self.assertFalse(self.local.is_symlink())

    def test_changed_inputs_refuse_recording_and_preserve_an_existing_baseline(self):
        self.record()
        baseline = (self.repo / "baseline.json").read_bytes()
        inner = self.module.run_check
        def changing(*args):
            result = inner(*args)
            (self.source / self.artifact).write_text("changed while recording\n")
            return result
        self.module.run_check = changing
        code, out = self.run_main("--record-baseline", "--baseline", "baseline.json")
        self.assertEqual(code, 3, out + self.stderr)
        self.assertEqual((self.repo / "baseline.json").read_bytes(), baseline)
        self.assertFalse(self.local.is_symlink())

    def test_changes_during_exports_stop_before_classifying_failures(self):
        self.record()
        def changing(*args):
            (self.source / self.artifact).write_text("changed during export\n")
            return {}, []
        self.module.key_from_exports = changing
        code, out = self.compare()
        self.assertEqual(code, 3, out + self.stderr)
        self.assertIn("changed during the exports", self.stderr)
        self.assertFalse(self.local.is_symlink())

    def test_existing_local_inputs_are_never_replaced_and_can_be_explicitly_selected(self):
        self.record()
        self.local.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(self.source, self.local)
        self.assert_refused_before_checks("already exists")
        code, out = self.compare("--readiness-audit-root", str(self.local))
        self.assertEqual(code, 0, out + self.stderr)
        self.assertTrue(self.local.is_dir())
        self.assertFalse(self.local.is_symlink())

    def test_a_failed_check_removes_only_its_temporary_link(self):
        self.record()
        self.module.run_check = mock.Mock(side_effect=RuntimeError("validator failed"))
        code, out = self.compare()
        self.assertEqual(code, 3, out + self.stderr)
        self.assertIn("validator failed", self.stderr)
        self.assertFalse(self.local.is_symlink())
        self.assertTrue(self.source.is_dir())

    def test_failed_link_creation_removes_its_empty_temporary_parent(self):
        with mock.patch.object(Path, "symlink_to", side_effect=PermissionError("link denied")):
            code, out = self.run_main("--record-baseline", "--baseline", "baseline.json")
        self.assertEqual(code, 3, out + self.stderr)
        self.assertIn("link denied", self.stderr)
        self.assertFalse(self.local.parent.exists())
        self.assertFalse((self.repo / "baseline.json").exists())
        self.assertTrue(self.source.is_dir())

    def test_an_explicit_missing_source_is_refused(self):
        code, out = self.run_main("--record-baseline", "--baseline", "baseline.json",
                                  "--readiness-audit-root", str(self.source / "absent"))
        self.assertEqual(code, 3, out + self.stderr)
        self.assertIn("readiness audit source is not a directory", self.stderr)
        self.assertFalse((self.repo / "baseline.json").exists())
        self.assertFalse(self.local.is_symlink())

    def test_an_unreadable_input_is_not_recorded_as_missing(self):
        path = self.source / "VALIDATOR_RECEIPT.json"
        path.unlink()
        path.mkdir()
        code, out = self.run_main("--record-baseline", "--baseline", "baseline.json")
        self.assertEqual(code, 3, out + self.stderr)
        self.assertIn("cannot identify readiness audit input", self.stderr)
        self.assertFalse((self.repo / "baseline.json").exists())
        self.assertFalse(self.local.is_symlink())

    def test_missing_audit_state_is_explicit_and_later_presence_is_rejected(self):
        self.module.SHARED_READINESS_AUDIT_ROOT = Path(self.audit_scratch.name) / "absent"
        self.record()
        self.assertEqual(set(self.baseline()["readiness_audit_inputs"]["files"].values()), {None})
        self.module.SHARED_READINESS_AUDIT_ROOT = self.source
        self.assert_refused_before_checks("differ from the baseline")


if __name__ == "__main__":
    unittest.main()
