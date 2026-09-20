from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock


REPO_ROOT = Path(__file__).resolve().parents[1]


def load_script(module_name: str, relative_path: str):
    spec = importlib.util.spec_from_file_location(module_name, REPO_ROOT / relative_path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


pm_plans_verify = load_script("pm_plans_verify_evidence_binding_tests", "scripts/pm-plans-verify.py")
pm_governance_seal = load_script("pm_governance_seal_evidence_binding_tests", "scripts/pm-governance-seal.py")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class EvidenceArtifactBindingModeTests(unittest.TestCase):
    def setUp(self) -> None:
        self._temp = tempfile.TemporaryDirectory(dir=REPO_ROOT)
        self.root = Path(self._temp.name)
        self.plans = self.root / "Plans"
        self.evidence_root = self.plans / ".evidence"
        self.evidence_root.mkdir(parents=True)
        self.manifest_path = self.plans / "evidence_artifact_binding_modes.json"
        self.schema_path = self.plans / "evidence_artifact_binding_modes.schema.json"
        # These tests exercise the verifier's semantic checks rather than JSON Schema.
        self.schema_path.write_text("{}\n", encoding="utf-8")

        self.verify_patches = [
            mock.patch.object(pm_plans_verify, "ROOT", self.root),
            mock.patch.object(pm_plans_verify, "PLANS", self.plans),
            mock.patch.object(
                pm_plans_verify,
                "EVIDENCE_ARTIFACT_BINDING_MANIFEST",
                self.manifest_path,
            ),
            mock.patch.object(
                pm_plans_verify,
                "EVIDENCE_ARTIFACT_BINDING_MANIFEST_SCHEMA",
                self.schema_path,
            ),
        ]
        self.seal_patches = [
            mock.patch.object(pm_governance_seal, "ROOT", self.root),
            mock.patch.object(pm_governance_seal, "PLANS", self.plans),
            mock.patch.object(
                pm_governance_seal,
                "EVIDENCE_ARTIFACT_BINDING_MANIFEST",
                self.manifest_path,
            ),
        ]
        for patcher in self.verify_patches + self.seal_patches:
            patcher.start()

    def tearDown(self) -> None:
        for patcher in reversed(self.verify_patches + self.seal_patches):
            patcher.stop()
        self._temp.cleanup()

    def write_evidence(self, name: str, data: dict | None = None) -> Path:
        path = self.evidence_root / name / "evidence.json"
        path.parent.mkdir(parents=True)
        payload = data if data is not None else {"node": {"node_id": f"node.{name}"}, "artifacts": []}
        path.write_text(json.dumps(payload, sort_keys=True) + "\n", encoding="utf-8")
        return path

    def entry(self, path: Path, mode: str, *, bundle_sha256: str | None = None) -> dict:
        row = {
            "path": path.relative_to(self.root).as_posix(),
            "mode": mode,
            "node_id": json.loads(path.read_text(encoding="utf-8")).get("node", {}).get("node_id", "node.missing"),
            "rationale": "Focused regression fixture.",
        }
        if bundle_sha256 is not None:
            row["bundle_sha256"] = bundle_sha256
        return row

    def write_manifest(self, entries: list[dict], *, historical: int, live: int) -> None:
        self.manifest_path.write_text(
            json.dumps(
                {
                    "schema_id": "pm.evidence_artifact_binding_modes.v1",
                    "captured_at_utc": "2026-08-30T00:00:00Z",
                    "expected_historical_snapshot_count": historical,
                    "expected_live_current_count": live,
                    "forbidden_live_current_tokens": list(
                        pm_plans_verify.FORBIDDEN_LIVE_CURRENT_EVIDENCE_TOKENS
                    ),
                    "entries": entries,
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

    def test_historical_bundle_hash_tamper_is_rejected(self) -> None:
        evidence = self.write_evidence("historical")
        pinned_hash = sha256(evidence)
        self.write_manifest(
            [self.entry(evidence, "historical_snapshot", bundle_sha256=pinned_hash)],
            historical=1,
            live=0,
        )
        evidence.write_text('{"tampered":true}\n', encoding="utf-8")

        _, failures, _ = pm_plans_verify.load_evidence_artifact_binding_modes()

        mismatch = [f for f in failures if f.get("error") == "historical_evidence_bundle_hash_mismatch"]
        self.assertEqual(len(mismatch), 1)
        self.assertEqual(mismatch[0]["expected"], pinned_hash)
        self.assertEqual(mismatch[0]["actual"], sha256(evidence))

    def test_live_current_missing_and_stale_artifacts_are_rejected(self) -> None:
        live_artifact = self.plans / "live.txt"
        live_artifact.write_text("current\n", encoding="utf-8")
        evidence = self.write_evidence(
            "live",
            {
                "node": {"node_id": "node.live"},
                "artifacts": [
                    {"path": "Plans/missing.txt", "sha256": "0" * 64},
                    {"path": "Plans/live.txt", "sha256": "1" * 64},
                ],
            },
        )

        failures = pm_plans_verify.validate_evidence_file(
            evidence,
            {},
            artifact_binding_mode="live_current",
        )

        by_error = {failure["error"]: failure for failure in failures}
        self.assertEqual(by_error["missing_ref"]["artifact"], "Plans/missing.txt")
        self.assertEqual(by_error["missing_ref"]["artifact_ref"], "Plans/missing.txt")
        self.assertEqual(by_error["artifact_hash_stale"]["artifact"], "Plans/live.txt")
        self.assertEqual(by_error["artifact_hash_stale"]["actual"], sha256(live_artifact))

    def test_historical_refresh_is_refused_before_mutation(self) -> None:
        evidence = self.write_evidence("historical")
        self.write_manifest(
            [self.entry(evidence, "historical_snapshot", bundle_sha256=sha256(evidence))],
            historical=1,
            live=0,
        )
        before = evidence.read_bytes()

        with self.assertRaisesRegex(SystemExit, "refusing to refresh immutable 'historical_snapshot'"):
            pm_governance_seal.require_live_current_evidence(evidence)

        self.assertEqual(evidence.read_bytes(), before)

    def test_live_sharding_sync_requires_and_hashes_check_report(self) -> None:
        evidence = self.write_evidence("live-sharding")
        self.write_manifest([self.entry(evidence, "live_current")], historical=0, live=1)
        config = self.plans / "sharding_config.json"
        config.write_text('{"docs":[]}\n', encoding="utf-8")
        report = evidence.with_name("shard_report.json")
        report.write_text(
            json.dumps({"config_path": "Plans/sharding_config.json", "docs": []}) + "\n",
            encoding="utf-8",
        )

        with self.assertRaisesRegex(SystemExit, "requires the adjacent shard-check-report.json"):
            pm_governance_seal.sync_plan_sharding_evidence(evidence, report)

        check_report = evidence.with_name("shard-check-report.json")
        check_report.write_text('{"status":"pass"}\n', encoding="utf-8")
        result = pm_governance_seal.sync_plan_sharding_evidence(evidence, report)
        artifacts = json.loads(evidence.read_text(encoding="utf-8"))["artifacts"]
        by_path = {row["path"]: row for row in artifacts}

        self.assertTrue(result["changed"])
        self.assertEqual(by_path[report.relative_to(self.root).as_posix()]["sha256"], sha256(report))
        self.assertEqual(by_path[check_report.relative_to(self.root).as_posix()]["sha256"], sha256(check_report))

    def test_binding_manifest_missing_coverage_is_rejected(self) -> None:
        declared = self.write_evidence("declared")
        omitted = self.write_evidence("omitted")
        self.write_manifest(
            [self.entry(declared, "live_current")],
            historical=0,
            live=1,
        )

        _, failures, _ = pm_plans_verify.load_evidence_artifact_binding_modes()

        missing = [f for f in failures if f.get("error") == "evidence_binding_mode_missing"]
        self.assertEqual(missing, [{"path": omitted.relative_to(self.root).as_posix(), "error": "evidence_binding_mode_missing"}])

    def test_binding_manifest_duplicate_coverage_is_rejected(self) -> None:
        evidence = self.write_evidence("duplicate")
        entry = self.entry(evidence, "live_current")
        self.write_manifest([entry, dict(entry)], historical=0, live=1)

        _, failures, _ = pm_plans_verify.load_evidence_artifact_binding_modes()

        duplicates = [f for f in failures if f.get("error") == "duplicate_evidence_binding_path"]
        self.assertEqual(len(duplicates), 1)
        self.assertEqual(duplicates[0]["evidence"], evidence.relative_to(self.root).as_posix())

    def test_binding_manifest_node_identity_mismatch_is_rejected(self) -> None:
        evidence = self.write_evidence("node-mismatch")
        entry = self.entry(evidence, "live_current")
        entry["node_id"] = "node.wrong"
        self.write_manifest([entry], historical=0, live=1)

        _, failures, _ = pm_plans_verify.load_evidence_artifact_binding_modes()

        mismatches = [f for f in failures if f.get("error") == "evidence_binding_node_id_mismatch"]
        self.assertEqual(len(mismatches), 1)
        self.assertEqual(mismatches[0]["expected_node_id"], "node.wrong")
        self.assertEqual(mismatches[0]["actual_node_id"], "node.node-mismatch")

    def test_binding_manifest_forbidden_token_drift_is_rejected(self) -> None:
        evidence = self.write_evidence("token-drift")
        self.write_manifest([self.entry(evidence, "live_current")], historical=0, live=1)
        manifest = json.loads(self.manifest_path.read_text(encoding="utf-8"))
        manifest["forbidden_live_current_tokens"][0] = "different-token"
        self.manifest_path.write_text(json.dumps(manifest) + "\n", encoding="utf-8")

        _, failures, _ = pm_plans_verify.load_evidence_artifact_binding_modes()

        self.assertIn("forbidden_live_current_tokens_mismatch", {f.get("error") for f in failures})

    @unittest.skipUnless(
        hasattr(pm_plans_verify, "FORBIDDEN_LIVE_CURRENT_EVIDENCE_TOKENS"),
        "verifier has not yet added the live-current readiness-language guard",
    )
    def test_live_current_forbidden_readiness_language_is_rejected(self) -> None:
        tokens = pm_plans_verify.FORBIDDEN_LIVE_CURRENT_EVIDENCE_TOKENS
        self.assertTrue(tokens)
        for index, token in enumerate(tokens):
            with self.subTest(token=token):
                evidence = self.write_evidence(
                    f"overclaim-{index}",
                    {
                        "node": {"node_id": f"node.overclaim-{index}"},
                        "artifacts": [],
                        "checks": [{"name": "readiness", "details": token.swapcase()}],
                    },
                )

                failures = pm_plans_verify.validate_evidence_file(
                    evidence,
                    {},
                    artifact_binding_mode="live_current",
                )

                self.assertIn("forbidden_live_current_evidence_claim", {f.get("error") for f in failures})

    def test_historical_snapshot_may_retain_old_readiness_language(self) -> None:
        evidence = self.write_evidence(
            "historical-language",
            {
                "node": {"node_id": "node.historical-language"},
                "artifacts": [],
                "checks": [
                    {
                        "name": "point-in-time-readiness",
                        "details": pm_plans_verify.FORBIDDEN_LIVE_CURRENT_EVIDENCE_TOKENS[0],
                    }
                ],
            },
        )

        failures = pm_plans_verify.validate_evidence_file(
            evidence,
            {},
            artifact_binding_mode="historical_snapshot",
        )

        self.assertNotIn("forbidden_live_current_evidence_claim", {f.get("error") for f in failures})


class RawCaptureSymlinkTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        base = Path(self.temp.name)
        self.root = base / "repo"
        self.root.mkdir()
        subprocess.run(["git", "init", "-q", str(self.root)], check=True)
        self.allowed = base / "PuppetMaster-Evidence"
        self.captures = self.allowed / "tests/agent_packet_restrictions"
        self.captures.mkdir(parents=True)
        self.link = self.root / "tests/agent_packet_restrictions"
        self.link.parent.mkdir()
        self.link.symlink_to(self.captures, target_is_directory=True)
        (self.root / ".gitignore").write_text("/tests/agent_packet_restrictions\n")
        manifest_ref = "tests/fixtures/governance/raw_evidence_capture_modes.json"
        schema_ref = "tests/fixtures/governance/raw_evidence_capture_modes.schema.json"
        manifest_path = self.root / manifest_ref
        manifest_path.parent.mkdir(parents=True)
        schema_path = self.root / schema_ref
        schema_path.write_bytes((REPO_ROOT / schema_ref).read_bytes())
        manifest = json.loads((REPO_ROOT / manifest_ref).read_text())
        manifest["entries"] = []
        self.expected = set()
        for index in range(16):
            relative = f"case-{index}/capture.json"
            capture = self.captures / relative
            capture.parent.mkdir()
            historical = index < 14
            capture.write_bytes(b"\n" if historical else b"{}\n")
            path_ref = f"tests/agent_packet_restrictions/{relative}"
            entry = {
                "path": path_ref,
                "mode": "historical_snapshot" if historical else "live_current",
                "sha256": sha256(capture),
                "reason": "Read-only linked-capture regression fixture.",
            }
            if historical:
                entry["parse_error_class"] = "json_decode_error"
            manifest["entries"].append(entry)
            self.expected.add(self.root / path_ref)
        manifest_path.write_text(json.dumps(manifest))
        for name, value in {
            "ROOT": self.root,
            "PLANS": self.root / "Plans",
            "RAW_EVIDENCE_DIRECTORY": self.allowed,
            "RAW_EVIDENCE_CAPTURE_MANIFEST": manifest_path,
            "RAW_EVIDENCE_CAPTURE_MANIFEST_SCHEMA": schema_path,
        }.items():
            patcher = mock.patch.object(pm_plans_verify, name, value)
            patcher.start()
            self.addCleanup(patcher.stop)

    def assert_capture_census(self) -> None:
        before = {path: path.read_bytes() for path in self.expected}
        files = pm_plans_verify.iter_repo_files()
        self.assertTrue(self.expected.issubset(files))
        self.assertEqual(len(files), len(set(files)))
        report = pm_plans_verify.cmd_json_syntax(argparse.Namespace())
        self.assertEqual(report["status"], "pass", report["failures"])
        self.assertEqual(report["raw_capture_manifest_entry_count"], 16)
        self.assertEqual(report["historical_snapshot_count"], 14)
        self.assertEqual(report["live_current_count"], 2)
        self.assertEqual(before, {path: path.read_bytes() for path in self.expected})

    def test_manifest_referents_seen_through_ignored_evidence_link(self) -> None:
        self.assert_capture_census()

    def test_manifest_referents_seen_without_git(self) -> None:
        with mock.patch.object(
            pm_plans_verify.subprocess, "run",
            return_value=subprocess.CompletedProcess([], 1, stdout=b""),
        ):
            self.assert_capture_census()

    def test_other_and_nested_symlinks_are_not_followed(self) -> None:
        outside = self.allowed.parent / "outside"
        outside.mkdir()
        bad_json = outside / "bad.json"
        bad_json.write_text("not JSON")
        (self.root / "elsewhere").symlink_to(outside, target_is_directory=True)
        (self.root / "alias").symlink_to(self.captures, target_is_directory=True)
        (self.root / "file.json").symlink_to(bad_json)
        (self.captures / "escape").symlink_to(outside, target_is_directory=True)
        (self.captures / "loop").symlink_to(self.captures, target_is_directory=True)
        (self.captures / "file.json").symlink_to(bad_json)
        files = pm_plans_verify.iter_repo_files()
        self.assertNotIn(self.root / "elsewhere/bad.json", files)
        self.assertNotIn(self.root / "alias/case-0/capture.json", files)
        self.assertNotIn(self.root / "file.json", files)
        self.assertNotIn(self.link / "escape/bad.json", files)
        self.assertNotIn(self.link / "file.json", files)
        self.assert_capture_census()

    def test_named_capture_link_outside_evidence_directory_is_not_followed(self) -> None:
        outside = self.allowed.with_name("PuppetMaster-Evidence-elsewhere")
        outside.mkdir()
        (outside / "capture.json").write_text("not JSON")
        self.link.unlink()
        self.link.symlink_to(outside, target_is_directory=True)
        self.assertNotIn(self.link / "capture.json", pm_plans_verify.iter_repo_files())

    def test_ignored_archive_files_outside_manifest_stay_outside_census(self) -> None:
        (self.captures / "unlisted.json").write_text("unrelated experimental output")
        self.assertNotIn(self.link / "unlisted.json", pm_plans_verify.iter_repo_files())
        self.assert_capture_census()

    def test_manifest_referent_cannot_follow_nested_symlink(self) -> None:
        capture = self.captures / "case-0/capture.json"
        outside = self.allowed.parent / "outside"
        outside.mkdir()
        (outside / "capture.json").write_bytes(capture.read_bytes())
        capture.unlink()
        capture.parent.rmdir()
        capture.parent.symlink_to(outside, target_is_directory=True)
        self.assertNotIn(self.link / "case-0/capture.json", pm_plans_verify.iter_repo_files())
        report = pm_plans_verify.cmd_json_syntax(argparse.Namespace())
        self.assertIn(
            "raw_capture_manifest_entry_not_in_verifier_file_set",
            {failure["error"] for failure in report["failures"]},
        )


if __name__ == "__main__":
    unittest.main()
