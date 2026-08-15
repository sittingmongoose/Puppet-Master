from __future__ import annotations

import copy
import importlib.util
import json
import sys
import tempfile
import unittest
from dataclasses import replace
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

import pm_pnc019_currentness as currentness  # noqa: E402


def load_script(module_name: str, relative_path: str):
    spec = importlib.util.spec_from_file_location(module_name, ROOT / relative_path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


try:
    pm_plan_index = load_script("pm_plan_index_currentness_test", "scripts/pm-plan-index.py")
except ModuleNotFoundError as exc:
    if exc.name != "yaml":
        raise
    pm_plan_index = None

pm_readiness = load_script(
    "pm_implementation_readiness_currentness_test",
    "scripts/pm-implementation-readiness.py",
)
pm_harness = load_script(
    "pm_pnc019_certification_harness_currentness_test",
    "scripts/pm-pnc019-certification-harness.py",
)
pm_event_authority = load_script(
    "pm_event_authority_currentness_test",
    "scripts/pm-event-authority-currentness.py",
)


PRIOR_CONSUMER_GAP_PATHS = (
    "Plans/event_family_registry.json",
    "Plans/storage_recovery_contracts.schema.json",
    "Plans/UI_Command_Catalog.md",
    "Plans/Wiring_Matrix.production.json",
    "Plans/UI_Wiring_Rules.md",
)
CURRENTNESS_HELPER_PATH = "scripts/pm_pnc019_currentness.py"


class Pnc019CurrentnessTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory(dir=ROOT)
        self.addCleanup(self.temp_dir.cleanup)
        self.receipt_path = Path(self.temp_dir.name) / "pnc019_certification_receipt.json"
        self.receipt = json.loads(
            pm_readiness.PNC019_CERTIFICATION_RECEIPT_PATH.read_text(encoding="utf-8")
        )
        self.current_hashes = {
            path: currentness.sha256_file(ROOT / path)
            for path in currentness.REQUIRED_PNC019_SOURCE_HASH_PATHS
        }

    def write_receipt(self, source_hashes: dict[str, str]) -> None:
        receipt = copy.deepcopy(self.receipt)
        receipt["source_hashes"] = source_hashes
        self.receipt_path.write_text(
            json.dumps(receipt, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )

    def readiness_failures(self) -> list[dict[str, object]]:
        with mock.patch.object(
            pm_readiness,
            "PNC019_CERTIFICATION_RECEIPT_PATH",
            self.receipt_path,
        ):
            return pm_readiness.pnc019_certification_receipt_failures()

    @unittest.skipIf(pm_plan_index is None, "PyYAML is unavailable to this Python interpreter")
    def plan_status(self) -> dict[str, object]:
        with mock.patch.object(
            pm_plan_index,
            "PNC019_CERTIFICATION_RECEIPT_PATH",
            self.receipt_path,
        ):
            return pm_plan_index.pnc019_certification_status()

    @unittest.skipIf(pm_plan_index is None, "PyYAML is unavailable to this Python interpreter")
    def test_receipt_writer_and_both_consumers_share_one_bound_contract(self) -> None:
        required = currentness.REQUIRED_PNC019_SOURCE_HASH_PATHS
        self.assertEqual(len(required), 19)
        self.assertEqual(len(set(required)), 19)
        self.assertIn(CURRENTNESS_HELPER_PATH, required)
        self.assertIs(pm_plan_index.REQUIRED_PNC019_SOURCE_HASH_PATHS, required)
        self.assertIs(pm_readiness.REQUIRED_PNC019_SOURCE_HASH_PATHS, required)
        self.assertIs(pm_harness.REQUIRED_PNC019_SOURCE_HASH_PATHS, required)

    @unittest.skipIf(pm_plan_index is None, "PyYAML is unavailable to this Python interpreter")
    def test_all_current_hashes_still_fail_closed_on_denominator_and_depth(self) -> None:
        self.write_receipt(self.current_hashes)

        plan_status = self.plan_status()
        plan_errors = {failure.get("error") for failure in plan_status["failures"]}
        self.assertFalse(plan_status["complete"])
        self.assertIn("event_denominator_unresolved", plan_errors)
        self.assertIn("event_family_contract_depth_unresolved", plan_errors)

        readiness_failures = self.readiness_failures()
        readiness_errors = {failure.get("error") for failure in readiness_failures}
        self.assertIn("event_denominator_unresolved", readiness_errors)
        self.assertIn("event_family_contract_depth_unresolved", readiness_errors)

        blockers = [
            pm_readiness.fixture_blocker(family, index, status="closed")
            for index, family in enumerate(pm_readiness.REQUIRED_FAMILIES, start=1)
        ]
        report = pm_readiness.build_report_from_inputs(
            blockers=blockers,
            matrix=pm_readiness.read_json(pm_readiness.MATRIX_PATH),
            node_snapshot=pm_readiness.fixture_node_snapshot(hard_disabled=False),
            pnc019_certification_current=not readiness_failures,
            hash_map={"self-test": "a" * 64},
            generated_at_utc="2026-08-10T00:00:00Z",
        )
        self.assertFalse(report["buildability_gate_passed"])
        self.assertFalse(report["approve_and_build_gate"]["enabled"])
        self.assertEqual(
            [row["blocker_id"] for row in report["remaining_open_blockers"]],
            ["IRB-005", "IRB-011"],
        )

    @unittest.skipIf(pm_plan_index is None, "PyYAML is unavailable to this Python interpreter")
    def test_prior_five_path_gap_is_enforced_by_both_consumers(self) -> None:
        for source_path in PRIOR_CONSUMER_GAP_PATHS:
            with self.subTest(source_path=source_path):
                hashes = dict(self.current_hashes)
                hashes.pop(source_path)
                self.write_receipt(hashes)

                plan_failures = self.plan_status()["failures"]
                readiness_failures = self.readiness_failures()
                for failures in (plan_failures, readiness_failures):
                    self.assertTrue(
                        any(
                            failure.get("error") == "pnc019_source_hash_stale"
                            and failure.get("source_path") == source_path
                            for failure in failures
                        )
                    )

    def test_currentness_helper_mutation_invalidates_its_own_binding(self) -> None:
        self.assertEqual(
            currentness.pnc019_source_hash_failures(ROOT, self.current_hashes),
            [],
        )
        with tempfile.TemporaryDirectory() as temp_dir:
            candidate_root = Path(temp_dir)
            for source_path in currentness.REQUIRED_PNC019_SOURCE_HASH_PATHS:
                candidate = candidate_root / source_path
                candidate.parent.mkdir(parents=True, exist_ok=True)
                if source_path == CURRENTNESS_HELPER_PATH:
                    candidate.write_bytes((ROOT / source_path).read_bytes() + b"\n# mutation\n")
                else:
                    candidate.symlink_to(ROOT / source_path)

            failures = currentness.pnc019_source_hash_failures(
                candidate_root,
                self.current_hashes,
            )
        self.assertEqual(
            [
                failure["source_path"]
                for failure in failures
                if failure.get("error") == "pnc019_source_hash_stale"
            ],
            [CURRENTNESS_HELPER_PATH],
        )

    def test_event_authority_clearance_requires_both_conditions(self) -> None:
        registry = json.loads(
            (ROOT / currentness.EVENT_FAMILY_REGISTRY_REL_PATH).read_text(encoding="utf-8")
        )
        checkpoint = currentness.CURRENT_EVENT_AUTHORITY_CHECKPOINT

        denominator_only = replace(
            checkpoint,
            complete_denominator_known=True,
            contract_depth_complete=False,
        )
        denominator_only_errors = {
            failure["error"]
            for failure in currentness.pnc019_event_authority_failures_for_registry(
                registry,
                checkpoint=denominator_only,
            )
        }
        self.assertNotIn("event_denominator_unresolved", denominator_only_errors)
        self.assertIn("event_family_contract_depth_unresolved", denominator_only_errors)

        depth_only = replace(
            checkpoint,
            complete_denominator_known=False,
            contract_depth_complete=True,
        )
        depth_only_errors = {
            failure["error"]
            for failure in currentness.pnc019_event_authority_failures_for_registry(
                registry,
                checkpoint=depth_only,
            )
        }
        self.assertIn("event_denominator_unresolved", depth_only_errors)
        self.assertNotIn("event_family_contract_depth_unresolved", depth_only_errors)

        cleared = replace(
            checkpoint,
            complete_denominator_known=True,
            contract_depth_complete=True,
        )
        self.assertEqual(
            currentness.pnc019_event_authority_failures_for_registry(
                registry,
                checkpoint=cleared,
            ),
            [],
        )

    def test_current_event_authority_audit_rehashes_cleanly_and_remains_open(self) -> None:
        self.assertEqual(currentness.event_authority_audit_failures(ROOT), [])
        failures = currentness.pnc019_event_authority_clearance_failures(ROOT)
        errors = {failure["error"] for failure in failures}
        self.assertIn("event_denominator_unresolved", errors)
        self.assertIn("event_family_contract_depth_unresolved", errors)

    def test_event_authority_inventory_excludes_derived_consumers(self) -> None:
        for path in (
            "Plans/.implementation_readiness/buildability_gate_report.json",
            "Plans/.plan_index/node_readiness_report.json",
        ):
            with self.subTest(path=path):
                self.assertIn(path, pm_event_authority.DERIVED_VALIDATION_OUTPUTS)
                self.assertNotIn(path, pm_event_authority.machine_paths())

    def test_current_event_authority_group_artifact_drift_fails(self) -> None:
        receipt = json.loads(
            (ROOT / currentness.EVENT_AUTHORITY_RECEIPT_REL_PATH).read_text(encoding="utf-8")
        )
        inventory = json.loads(
            (ROOT / currentness.EVENT_AUTHORITY_SOURCE_INVENTORY_REL_PATH).read_text(encoding="utf-8")
        )
        with tempfile.TemporaryDirectory() as temp_dir:
            candidate_root = Path(temp_dir)
            required_paths = set(receipt["artifact_hashes"])
            required_paths.update(
                {
                    currentness.EVENT_AUTHORITY_RECEIPT_REL_PATH,
                    currentness.EVENT_AUTHORITY_STATUS_REL_PATH,
                    currentness.EVENT_AUTHORITY_GROUP_MANIFEST_REL_PATH,
                    currentness.EVENT_FAMILY_REGISTRY_REL_PATH,
                    receipt["validator_path"],
                }
            )
            required_paths.update(row["path"] for row in inventory["sources"])
            drift_path = next(path for path in required_paths if path.endswith("source_groups/group_a.jsonl"))
            for relative_path in required_paths:
                target = candidate_root / relative_path
                target.parent.mkdir(parents=True, exist_ok=True)
                if relative_path == drift_path:
                    target.write_bytes((ROOT / relative_path).read_bytes() + b"\n")
                else:
                    target.symlink_to(ROOT / relative_path)

            failures = currentness.event_authority_audit_failures(candidate_root)
        self.assertTrue(
            any(
                failure.get("error") == "event_authority_currentness_artifact_drift"
                and failure.get("artifact_path") == drift_path
                for failure in failures
            )
        )

    def test_current_event_authority_live_source_drift_fails(self) -> None:
        receipt = json.loads(
            (ROOT / currentness.EVENT_AUTHORITY_RECEIPT_REL_PATH).read_text(encoding="utf-8")
        )
        inventory = json.loads(
            (ROOT / currentness.EVENT_AUTHORITY_SOURCE_INVENTORY_REL_PATH).read_text(encoding="utf-8")
        )
        drift_path = "Plans/Shared_Integration_Runtime.md"
        required_paths = set(receipt["artifact_hashes"])
        required_paths.update(row["path"] for row in inventory["sources"])
        required_paths.update(
            {
                currentness.EVENT_AUTHORITY_RECEIPT_REL_PATH,
                currentness.EVENT_AUTHORITY_STATUS_REL_PATH,
                currentness.EVENT_AUTHORITY_GROUP_MANIFEST_REL_PATH,
                currentness.EVENT_AUTHORITY_SOURCE_INVENTORY_REL_PATH,
                currentness.EVENT_FAMILY_REGISTRY_REL_PATH,
                receipt["validator_path"],
            }
        )
        with tempfile.TemporaryDirectory() as temp_dir:
            candidate_root = Path(temp_dir)
            for relative_path in required_paths:
                target = candidate_root / relative_path
                target.parent.mkdir(parents=True, exist_ok=True)
                if relative_path == drift_path:
                    target.write_bytes((ROOT / relative_path).read_bytes() + b"\n")
                else:
                    target.symlink_to(ROOT / relative_path)
            failures = currentness.event_authority_audit_failures(candidate_root)
        self.assertTrue(
            any(
                failure.get("error") == "event_authority_currentness_source_drift"
                and failure.get("source_path") == drift_path
                for failure in failures
            )
        )


if __name__ == "__main__":
    unittest.main()
