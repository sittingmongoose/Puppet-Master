from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


REPO_ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = REPO_ROOT / "scripts" / "pm-governance-seal.py"
SPEC = importlib.util.spec_from_file_location("pm_governance_seal", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
pm_governance_seal = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(pm_governance_seal)


TARGET_ASSIGNMENT = "storage_value_registry=pm.storage_value_registry.v2"
TARGET_REQUEST = [
    {
        "key": "storage_value_registry",
        "target": "pm.storage_value_registry.v2",
    }
]


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class GovernanceSealSpecLockRefreshTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory(dir=REPO_ROOT)
        self.root = Path(self.temp_dir.name)
        self.plans = self.root / "Plans"
        self.plans.mkdir()
        self.original_root = pm_governance_seal.ROOT
        self.original_plans = pm_governance_seal.PLANS
        pm_governance_seal.ROOT = self.root
        pm_governance_seal.PLANS = self.plans

    def tearDown(self) -> None:
        pm_governance_seal.ROOT = self.original_root
        pm_governance_seal.PLANS = self.original_plans
        self.temp_dir.cleanup()

    def make_spec_lock(
        self,
        *,
        current_schema: str = "pm.storage_value_registry.v1",
        stale_paths: set[str] | None = None,
    ) -> tuple[Path, dict]:
        stale_paths = stale_paths or set()
        files = []
        for rel, content in [("Plans/zeta.md", "zeta\n"), ("Plans/alpha.md", "alpha\n")]:
            target = self.root / rel
            target.write_text(content, encoding="utf-8")
            files.append(
                {
                    "path": rel,
                    "sha256": "0" * 64 if rel in stale_paths else digest(target),
                }
            )
        data = {
            "schema_id": "pm.spec_lock.v1",
            "schema_versions": {
                "event_record": "pm.event.v0",
                "storage_value_registry": current_schema,
            },
            "canonical_ssot_hashes": {
                "files": files,
                "hash_alg": "sha256",
            },
        }
        path = self.plans / "Spec_Lock.json"
        path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        return path, data

    def request(self) -> list[dict[str, str]]:
        return pm_governance_seal.parse_schema_version_assignments([TARGET_ASSIGNMENT])

    def assert_schema_refresh_refused_without_write(self, path: Path) -> str:
        before = path.read_bytes()
        with mock.patch.object(pm_governance_seal, "write_json_atomic") as writer:
            with self.assertRaises(SystemExit) as raised:
                pm_governance_seal.refresh_spec_lock(path, self.request())
        self.assertEqual(writer.call_count, 0)
        self.assertEqual(path.read_bytes(), before)
        return str(raised.exception)

    def test_allowed_v1_to_v2_and_hash_refresh_use_one_atomic_write(self) -> None:
        path, _ = self.make_spec_lock(stale_paths={"Plans/zeta.md", "Plans/alpha.md"})
        with mock.patch.object(
            pm_governance_seal,
            "write_json_atomic",
            wraps=pm_governance_seal.write_json_atomic,
        ) as writer:
            report = pm_governance_seal.refresh_spec_lock(path, self.request())

        self.assertEqual(writer.call_count, 1)
        self.assertEqual(
            report,
            {
                "path": "Plans/Spec_Lock.json",
                "changed": True,
                "schema_version_requests": TARGET_REQUEST,
                "schema_version_updates": [
                    {
                        "from": "pm.storage_value_registry.v1",
                        "key": "storage_value_registry",
                        "to": "pm.storage_value_registry.v2",
                    }
                ],
                "updated_hashes": ["Plans/alpha.md", "Plans/zeta.md"],
            },
        )
        updated = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual(
            updated["schema_versions"]["storage_value_registry"],
            "pm.storage_value_registry.v2",
        )
        for entry in updated["canonical_ssot_hashes"]["files"]:
            self.assertEqual(entry["sha256"], digest(self.root / entry["path"]))

    def test_idempotent_v2_with_current_hashes_does_not_write(self) -> None:
        path, _ = self.make_spec_lock(current_schema="pm.storage_value_registry.v2")
        before = path.read_bytes()
        with mock.patch.object(pm_governance_seal, "write_json_atomic") as writer:
            report = pm_governance_seal.refresh_spec_lock(path, self.request())
        self.assertEqual(writer.call_count, 0)
        self.assertEqual(path.read_bytes(), before)
        self.assertEqual(report["changed"], False)
        self.assertEqual(report["schema_version_requests"], TARGET_REQUEST)
        self.assertEqual(report["schema_version_updates"], [])
        self.assertEqual(report["updated_hashes"], [])

    def test_idempotent_v2_with_stale_hash_writes_once(self) -> None:
        path, _ = self.make_spec_lock(
            current_schema="pm.storage_value_registry.v2",
            stale_paths={"Plans/zeta.md"},
        )
        with mock.patch.object(
            pm_governance_seal,
            "write_json_atomic",
            wraps=pm_governance_seal.write_json_atomic,
        ) as writer:
            report = pm_governance_seal.refresh_spec_lock(path, self.request())
        self.assertEqual(writer.call_count, 1)
        self.assertEqual(report["schema_version_updates"], [])
        self.assertEqual(report["updated_hashes"], ["Plans/zeta.md"])

    def test_schema_version_requires_spec_lock(self) -> None:
        args = argparse.Namespace(
            schema_version=[TARGET_ASSIGNMENT],
            spec_lock=None,
            evidence=[],
        )
        with self.assertRaisesRegex(SystemExit, "^--schema-version requires --spec-lock$"):
            pm_governance_seal.cmd_refresh(args)

    def test_malformed_assignment_corpus_is_refused(self) -> None:
        malformed = [
            "storage_value_registry",
            "storage_value_registry=pm.storage_value_registry.v2=extra",
            "=pm.storage_value_registry.v2",
            "storage_value_registry=",
            " storage_value_registry=pm.storage_value_registry.v2",
            "storage_value_registry =pm.storage_value_registry.v2",
            "storage_value_registry=pm.storage_value_registry.v2 ",
            "StorageValueRegistry=pm.storage_value_registry.v2",
            "storage_value_registry=storage_value_registry.v2",
        ]
        for value in malformed:
            with self.subTest(value=value):
                with self.assertRaises(SystemExit):
                    pm_governance_seal.parse_schema_version_assignments([value])

    def test_duplicate_same_and_conflicting_assignments_are_refused(self) -> None:
        cases = [
            [TARGET_ASSIGNMENT, TARGET_ASSIGNMENT],
            [TARGET_ASSIGNMENT, "storage_value_registry=pm.storage_value_registry.v1"],
        ]
        for values in cases:
            with self.subTest(values=values):
                with self.assertRaisesRegex(SystemExit, "assigned more than once"):
                    pm_governance_seal.parse_schema_version_assignments(values)

    def test_existing_unallowlisted_and_unknown_keys_are_refused(self) -> None:
        for value in [
            "event_record=pm.event.v1",
            "not_registered=pm.not_registered.v1",
        ]:
            with self.subTest(value=value):
                with self.assertRaisesRegex(SystemExit, "key is not supported"):
                    pm_governance_seal.parse_schema_version_assignments([value])

    def test_wrong_targets_and_unexpected_current_sources_are_refused(self) -> None:
        for target in ["pm.storage_value_registry.v1", "pm.storage_value_registry.v3"]:
            with self.subTest(target=target):
                with self.assertRaisesRegex(SystemExit, "target is not supported"):
                    pm_governance_seal.parse_schema_version_assignments(
                        [f"storage_value_registry={target}"]
                    )

        for current in ["pm.storage_value_registry.v0", "pm.storage_value_registry.v3"]:
            with self.subTest(current=current):
                path, _ = self.make_spec_lock(current_schema=current)
                message = self.assert_schema_refresh_refused_without_write(path)
                self.assertIn("transition is not supported", message)

    def test_missing_or_malformed_schema_versions_are_refused_without_creation(self) -> None:
        cases = {
            "missing_object": lambda data: data.pop("schema_versions"),
            "non_object": lambda data: data.__setitem__("schema_versions", []),
            "missing_key": lambda data: data["schema_versions"].pop("storage_value_registry"),
            "non_string": lambda data: data["schema_versions"].__setitem__("storage_value_registry", 2),
        }
        for name, mutate in cases.items():
            with self.subTest(name=name):
                path, data = self.make_spec_lock()
                mutate(data)
                path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
                self.assert_schema_refresh_refused_without_write(path)

    def test_bad_root_and_schema_id_are_refused_without_write(self) -> None:
        path, data = self.make_spec_lock()
        for name, bad_data in [
            ("root", []),
            ("schema_id", {**data, "schema_id": "pm.spec_lock.v2"}),
        ]:
            with self.subTest(name=name):
                path.write_text(json.dumps(bad_data, indent=2) + "\n", encoding="utf-8")
                self.assert_schema_refresh_refused_without_write(path)

    def test_malformed_duplicate_and_missing_hash_inventory_is_byte_preserving(self) -> None:
        def duplicate(data: dict) -> None:
            data["canonical_ssot_hashes"]["files"].append(
                copy.deepcopy(data["canonical_ssot_hashes"]["files"][0])
            )

        cases = {
            "missing_registry": lambda data: data.pop("canonical_ssot_hashes"),
            "wrong_hash_alg": lambda data: data["canonical_ssot_hashes"].__setitem__("hash_alg", "sha512"),
            "files_not_array": lambda data: data["canonical_ssot_hashes"].__setitem__("files", {}),
            "files_empty": lambda data: data["canonical_ssot_hashes"].__setitem__("files", []),
            "entry_not_object": lambda data: data["canonical_ssot_hashes"]["files"].__setitem__(0, "bad"),
            "missing_path": lambda data: data["canonical_ssot_hashes"]["files"][0].pop("path"),
            "missing_digest": lambda data: data["canonical_ssot_hashes"]["files"][0].pop("sha256"),
            "invalid_digest": lambda data: data["canonical_ssot_hashes"]["files"][0].__setitem__("sha256", "bad"),
            "duplicate_path": duplicate,
            "missing_target": lambda data: data["canonical_ssot_hashes"]["files"][0].__setitem__("path", "Plans/missing.md"),
        }
        for name, mutate in cases.items():
            with self.subTest(name=name):
                path, data = self.make_spec_lock()
                mutate(data)
                path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
                self.assert_schema_refresh_refused_without_write(path)

        with self.subTest(name="target_is_directory"):
            path, data = self.make_spec_lock()
            directory = self.plans / "directory"
            directory.mkdir(exist_ok=True)
            data["canonical_ssot_hashes"]["files"][0]["path"] = "Plans/directory"
            path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
            self.assert_schema_refresh_refused_without_write(path)

    def test_allowlisted_target_aligns_with_readiness_schema_and_registry(self) -> None:
        readiness_path = REPO_ROOT / "scripts" / "pm-implementation-readiness.py"
        readiness_spec = importlib.util.spec_from_file_location(
            "pm_implementation_readiness_for_governance_seal_test",
            readiness_path,
        )
        assert readiness_spec is not None and readiness_spec.loader is not None
        readiness = importlib.util.module_from_spec(readiness_spec)
        readiness_spec.loader.exec_module(readiness)

        schema = json.loads(
            (REPO_ROOT / "Plans" / "storage_value_registry.schema.json").read_text(encoding="utf-8")
        )
        registry = json.loads(
            (REPO_ROOT / "Plans" / "storage_value_registry.json").read_text(encoding="utf-8")
        )
        target = pm_governance_seal.SPEC_LOCK_SCHEMA_VERSION_RULES[
            "storage_value_registry"
        ]["target"]
        self.assertEqual(target, readiness.STORAGE_VALUE_REGISTRY_SCHEMA_ID)
        self.assertEqual(target, schema["properties"]["schema_id"]["const"])
        self.assertEqual(target, registry["schema_id"])

    def test_exact_cli_success_json_and_deterministic_failure_stderr(self) -> None:
        with tempfile.TemporaryDirectory(dir=REPO_ROOT) as cli_tmp:
            cli_root = Path(cli_tmp)
            locked = cli_root / "locked.md"
            locked.write_text("locked\n", encoding="utf-8")
            locked_rel = locked.relative_to(REPO_ROOT).as_posix()
            lock_path = cli_root / "Spec_Lock.json"
            lock_rel = lock_path.relative_to(REPO_ROOT).as_posix()
            data = {
                "schema_id": "pm.spec_lock.v1",
                "schema_versions": {
                    "storage_value_registry": "pm.storage_value_registry.v1"
                },
                "canonical_ssot_hashes": {
                    "hash_alg": "sha256",
                    "files": [{"path": locked_rel, "sha256": digest(locked)}],
                },
            }
            lock_path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
            proc = subprocess.run(
                [
                    sys.executable,
                    str(MODULE_PATH),
                    "refresh",
                    "--spec-lock",
                    lock_rel,
                    "--schema-version",
                    TARGET_ASSIGNMENT,
                ],
                cwd=REPO_ROOT,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
            )
            expected = {
                "evidence": [],
                "spec_lock": {
                    "changed": True,
                    "path": lock_rel,
                    "schema_version_requests": TARGET_REQUEST,
                    "schema_version_updates": [
                        {
                            "from": "pm.storage_value_registry.v1",
                            "key": "storage_value_registry",
                            "to": "pm.storage_value_registry.v2",
                        }
                    ],
                    "updated_hashes": [],
                },
            }
            self.assertEqual(proc.returncode, 0, proc.stderr)
            self.assertEqual(proc.stderr, "")
            self.assertEqual(
                proc.stdout,
                json.dumps(expected, indent=2, ensure_ascii=False, sort_keys=True) + "\n",
            )

        failure = subprocess.run(
            [
                sys.executable,
                str(MODULE_PATH),
                "refresh",
                "--schema-version",
                TARGET_ASSIGNMENT,
            ],
            cwd=REPO_ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        self.assertNotEqual(failure.returncode, 0)
        self.assertEqual(failure.stdout, "")
        self.assertEqual(failure.stderr, "--schema-version requires --spec-lock\n")

    def test_hash_only_refresh_remains_supported(self) -> None:
        path, _ = self.make_spec_lock(stale_paths={"Plans/alpha.md"})
        report = pm_governance_seal.refresh_spec_lock(path)
        self.assertEqual(report["changed"], True)
        self.assertEqual(report["schema_version_requests"], [])
        self.assertEqual(report["schema_version_updates"], [])
        self.assertEqual(report["updated_hashes"], ["Plans/alpha.md"])
        updated = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual(
            updated["schema_versions"]["storage_value_registry"],
            "pm.storage_value_registry.v1",
        )


if __name__ == "__main__":
    unittest.main()
