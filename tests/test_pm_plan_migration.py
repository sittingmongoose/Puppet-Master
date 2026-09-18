from __future__ import annotations

import argparse
import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


REPO_ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = REPO_ROOT / "scripts" / "pm-plan-migration.py"
SPEC = importlib.util.spec_from_file_location("pm_plan_migration", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
pm_plan_migration = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = pm_plan_migration
try:
    SPEC.loader.exec_module(pm_plan_migration)
except ModuleNotFoundError as exc:
    if exc.name != "yaml":
        raise
    pm_plan_migration = None


HISTORICAL_RUN_ID = "pds-20260611-001-standardize-plans"
MIDDLE_RUN_ID = "pds-20260611-002-atomize-planunits"
TERMINAL_RUN_ID = "pds-20260828-900-current-planunit-snapshot"
INTERMEDIATE_SNAPSHOT_RUN_ID = "pds-20260828-903-current-planunit-snapshot"
CURRENT_004_RUN_ID = "pds-20260828-904-current-planunit-snapshot"
ROGUE_SNAPSHOT_RUN_ID = "pds-20260828-905-rogue-snapshot"
FAILED_PUBLICATION_RUN_ID = "pds-20260828-906-forced-publication-failure"


def plan_doc(*, node_compile_mode: str = "design_only") -> str:
    return f"""# Test Plan

## PlanUnits

```yaml
plan_unit_id: TEST-001
unit_type: feature
status: active
owner_doc: Plans/Test.md
canonical_text: Synthetic migration test unit.
risk_class: low
reasoning_tier: low
context_scope: test
validation_surfaces: [test]
implementation_surfaces: [test]
gui_related: false
source_lineage: []
depends_on: []
unblocks: []
acceptance_criteria: [test]
node_compile_hint:
  mode: {node_compile_mode}
  create_worknodes: false
```
"""


@unittest.skipIf(pm_plan_migration is None, "PyYAML is unavailable to this Python interpreter")
class PmPlanMigrationLineageTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory(dir=REPO_ROOT)
        self.root = Path(self.temp_dir.name)
        self.plans = self.root / "Plans"
        self.migrations = self.plans / ".plan_migration"
        self.migrations.mkdir(parents=True)
        self.plan_path = self.plans / "Test.md"
        self.plan_path.write_text(plan_doc(), encoding="utf-8")

        self.original_root = pm_plan_migration.ROOT
        self.original_plans = pm_plan_migration.PLANS
        self.original_migrations = pm_plan_migration.MIGRATIONS
        self.original_current_pointer = pm_plan_migration.CURRENT_RUN_POINTER
        pm_plan_migration.ROOT = self.root
        pm_plan_migration.PLANS = self.plans
        pm_plan_migration.MIGRATIONS = self.migrations
        pm_plan_migration.CURRENT_RUN_POINTER = self.migrations / "current_run.json"

    def tearDown(self) -> None:
        pm_plan_migration.ROOT = self.original_root
        pm_plan_migration.PLANS = self.original_plans
        pm_plan_migration.MIGRATIONS = self.original_migrations
        pm_plan_migration.CURRENT_RUN_POINTER = self.original_current_pointer
        self.temp_dir.cleanup()

    def write_lineage_summaries(self) -> Path:
        historical_dir = self.migrations / HISTORICAL_RUN_ID
        pm_plan_migration.write_json(
            historical_dir / "final_validation_summary.json",
            {
                "run_id": HISTORICAL_RUN_ID,
                "status": "HISTORICAL_SUPERSEDED",
                "historical_scope_status": "superseded_by_current_complete_run",
                "superseded_by_run_id": MIDDLE_RUN_ID,
                "missing_current_docs_intentionally_not_inventoried": ["Plans/Test.md"],
            },
        )
        pm_plan_migration.write_json(
            self.migrations / MIDDLE_RUN_ID / "final_validation_summary.json",
            {"run_id": MIDDLE_RUN_ID, "status": "COMPLETE"},
        )
        return historical_dir

    def write_terminal_snapshot(
        self,
        *,
        run_id: str = TERMINAL_RUN_ID,
        supersedes_run_ids: list[str] | None = None,
    ) -> tuple[Path, Path]:
        supersedes_run_ids = supersedes_run_ids or [MIDDLE_RUN_ID]
        terminal_dir = self.migrations / run_id
        bundle, failures = pm_plan_migration.build_current_snapshot_bundle(
            run_id,
            1,
            supersedes_run_ids,
            "Plans/Test.md",
            1,
        )
        self.assertEqual(failures, [])
        pm_plan_migration.write_current_snapshot_bundle(terminal_dir, bundle)
        pm_plan_migration.write_json(
            pm_plan_migration.CURRENT_RUN_POINTER,
            pm_plan_migration.current_run_pointer(bundle, terminal_dir),
        )
        return terminal_dir, self.migrations / HISTORICAL_RUN_ID

    def assert_failed_publication_rolled_back(
        self,
        report: dict[str, object],
        previous_run_dir: Path,
        pointer_before: bytes,
    ) -> Path:
        self.assertEqual(report["status"], "fail")
        self.assertEqual(pm_plan_migration.CURRENT_RUN_POINTER.read_bytes(), pointer_before)
        self.assertFalse((self.migrations / FAILED_PUBLICATION_RUN_ID).exists())
        self.assertFalse((self.migrations / f".{FAILED_PUBLICATION_RUN_ID}.current-run.tmp").exists())
        rollback = report["publication_rollback"]
        self.assertTrue(rollback["current_pointer_restored"])
        self.assertFalse(rollback["candidate_discoverable_as_complete_successor"])
        quarantine_dir = self.root / rollback["quarantine_path"]
        self.assertTrue((quarantine_dir / "PUBLICATION_FAILURE.json").is_file())
        self.assertTrue((quarantine_dir / "final_validation_summary.json").is_file())
        self.assertNotIn(
            FAILED_PUBLICATION_RUN_ID,
            pm_plan_migration.historical_successor_index().get(previous_run_dir.name, set()),
        )
        return quarantine_dir

    def write_004_topology(self) -> Path:
        historical_dir = self.write_lineage_summaries()
        pm_plan_migration.write_json(
            self.migrations / INTERMEDIATE_SNAPSHOT_RUN_ID / "final_validation_summary.json",
            {
                "run_id": INTERMEDIATE_SNAPSHOT_RUN_ID,
                "status": "COMPLETE",
                "supersedes_run_ids": [MIDDLE_RUN_ID],
            },
        )
        self.write_terminal_snapshot(
            run_id=CURRENT_004_RUN_ID,
            supersedes_run_ids=[INTERMEDIATE_SNAPSHOT_RUN_ID, MIDDLE_RUN_ID],
        )
        return historical_dir

    def test_transitive_lineage_reaches_live_verified_terminal_snapshot(self) -> None:
        historical_dir = self.write_lineage_summaries()
        self.write_terminal_snapshot()
        historical_bytes_before = {
            path.relative_to(historical_dir): path.read_bytes()
            for path in historical_dir.rglob("*")
            if path.is_file()
        }

        exemption, failures = pm_plan_migration.historical_scope_exemption(
            historical_dir,
            set(),
            {"Plans/Test.md"},
        )

        self.assertEqual(failures, [])
        self.assertIsNotNone(exemption)
        assert exemption is not None
        self.assertEqual(exemption["successor_lineage_run_ids"], [MIDDLE_RUN_ID, TERMINAL_RUN_ID])
        self.assertEqual(exemption["terminal_current_snapshot_run_id"], TERMINAL_RUN_ID)
        self.assertEqual(exemption["terminal_live_doc_count"], 1)
        self.assertGreater(exemption["terminal_live_span_count"], 0)
        self.assertEqual(
            {
                path.relative_to(historical_dir): path.read_bytes()
                for path in historical_dir.rglob("*")
                if path.is_file()
            },
            historical_bytes_before,
        )

    def test_current_004_shortcut_topology_validates_001_and_002(self) -> None:
        historical_dir = self.write_004_topology()

        for run_dir, expected_lineage, expected_pruned in (
            (
                historical_dir,
                [MIDDLE_RUN_ID, INTERMEDIATE_SNAPSHOT_RUN_ID, CURRENT_004_RUN_ID],
                [MIDDLE_RUN_ID, CURRENT_004_RUN_ID],
            ),
            (
                self.migrations / MIDDLE_RUN_ID,
                [INTERMEDIATE_SNAPSHOT_RUN_ID, CURRENT_004_RUN_ID],
                [CURRENT_004_RUN_ID],
            ),
        ):
            with self.subTest(run_id=run_dir.name):
                exemption, failures = pm_plan_migration.historical_scope_exemption(
                    run_dir,
                    set(),
                    {"Plans/Test.md"},
                )
                self.assertEqual(failures, [])
                self.assertIsNotNone(exemption)
                assert exemption is not None
                self.assertEqual(exemption["successor_lineage_run_ids"], expected_lineage)
                self.assertEqual(exemption["terminal_current_snapshot_run_id"], CURRENT_004_RUN_ID)
                self.assertIn(
                    expected_pruned,
                    exemption["pruned_convergent_successor_paths"],
                )

    def test_current_004_topology_rejects_divergent_dead_end_branch(self) -> None:
        self.write_004_topology()
        pm_plan_migration.write_json(
            self.migrations / ROGUE_SNAPSHOT_RUN_ID / "final_validation_summary.json",
            {
                "run_id": ROGUE_SNAPSHOT_RUN_ID,
                "status": "COMPLETE",
                "supersedes_run_ids": [MIDDLE_RUN_ID],
            },
        )

        exemption, failures = pm_plan_migration.historical_scope_exemption(
            self.migrations / MIDDLE_RUN_ID,
            set(),
            {"Plans/Test.md"},
        )

        self.assertIsNone(exemption)
        self.assertEqual([failure["error"] for failure in failures], ["historical_successor_lineage_divergent"])
        self.assertEqual(
            [branch["terminal_run_id"] for branch in failures[0]["invalid_branches"]],
            [ROGUE_SNAPSHOT_RUN_ID],
        )

    def test_live_plan_byte_change_invalidates_historical_exemption(self) -> None:
        historical_dir = self.write_lineage_summaries()
        self.write_terminal_snapshot()
        self.plan_path.write_text(plan_doc() + "\nChanged after snapshot.\n", encoding="utf-8")

        exemption, failures = pm_plan_migration.historical_scope_exemption(
            historical_dir,
            set(),
            {"Plans/Test.md"},
        )

        self.assertIsNone(exemption)
        self.assertEqual([failure["error"] for failure in failures], ["historical_successor_terminal_current_snapshot_invalid"])
        self.assertIn("current_snapshot_live_sha256_mismatch", failures[0]["terminal_failure_errors"])
        self.assertIn("current_snapshot_span_sha256_mismatch", failures[0]["terminal_failure_errors"])

    def test_terminal_span_tamper_invalidates_historical_exemption(self) -> None:
        historical_dir = self.write_lineage_summaries()
        terminal_dir, _ = self.write_terminal_snapshot()
        spans = pm_plan_migration.read_jsonl(terminal_dir / "span_map.jsonl")
        spans[0]["sha256"] = "0" * 64
        pm_plan_migration.write_jsonl(terminal_dir / "span_map.jsonl", spans)

        exemption, failures = pm_plan_migration.historical_scope_exemption(
            historical_dir,
            set(),
            {"Plans/Test.md"},
        )

        self.assertIsNone(exemption)
        self.assertEqual([failure["error"] for failure in failures], ["historical_successor_terminal_current_snapshot_invalid"])
        self.assertIn("current_snapshot_span_sha256_mismatch", failures[0]["terminal_failure_errors"])

    def test_current_snapshot_exact_reconstruction_rejects_nested_artifact_tampering(self) -> None:
        self.write_lineage_summaries()
        terminal_dir, _ = self.write_terminal_snapshot()
        artifact_paths = {
            name: terminal_dir / name
            for name in (
                "inventory.json",
                "original_hashes.json",
                "span_map.jsonl",
                "coverage_map.jsonl",
                "anchor_aliases.json",
                "pilot_report.json",
                "batch_report.jsonl",
                "final_validation_summary.json",
                "COMPLETE.md",
            )
        }
        pristine = {name: path.read_bytes() for name, path in artifact_paths.items()}

        def tamper_inventory() -> None:
            value = pm_plan_migration.read_json(artifact_paths["inventory.json"])
            value["docs"][0]["recommended_batch"] = "tampered"
            pm_plan_migration.write_json(artifact_paths["inventory.json"], value)

        def tamper_hash_inventory() -> None:
            value = pm_plan_migration.read_json(artifact_paths["original_hashes.json"])
            value["scope"] = "tampered"
            pm_plan_migration.write_json(artifact_paths["original_hashes.json"], value)

        def tamper_spans() -> None:
            value = pm_plan_migration.read_jsonl(artifact_paths["span_map.jsonl"])
            value[0]["contractrefs"] = [*value[0].get("contractrefs", []), "tampered"]
            pm_plan_migration.write_jsonl(artifact_paths["span_map.jsonl"], value)

        def tamper_coverage() -> None:
            value = pm_plan_migration.read_jsonl(artifact_paths["coverage_map.jsonl"])
            value[0]["notes"] = ["tampered"]
            pm_plan_migration.write_jsonl(artifact_paths["coverage_map.jsonl"], value)

        def tamper_aliases() -> None:
            value = pm_plan_migration.read_json(artifact_paths["anchor_aliases.json"])
            value["aliases"][0]["preservation_status"] = "tampered"
            pm_plan_migration.write_json(artifact_paths["anchor_aliases.json"], value)

        def tamper_pilot() -> None:
            value = pm_plan_migration.read_json(artifact_paths["pilot_report.json"])
            value["why_representative"][0] = "tampered"
            pm_plan_migration.write_json(artifact_paths["pilot_report.json"], value)

        def tamper_batches() -> None:
            value = pm_plan_migration.read_jsonl(artifact_paths["batch_report.jsonl"])
            value[0]["notes"] = ["tampered"]
            pm_plan_migration.write_jsonl(artifact_paths["batch_report.jsonl"], value)

        def tamper_final_snapshot_status() -> None:
            value = pm_plan_migration.read_json(artifact_paths["final_validation_summary.json"])
            value["snapshot_status"] = "tampered"
            pm_plan_migration.write_json(artifact_paths["final_validation_summary.json"], value)

        def tamper_final_notes() -> None:
            value = pm_plan_migration.read_json(artifact_paths["final_validation_summary.json"])
            value["notes"] = ["tampered"]
            pm_plan_migration.write_json(artifact_paths["final_validation_summary.json"], value)

        def tamper_complete_note() -> None:
            artifact_paths["COMPLETE.md"].write_text(
                artifact_paths["COMPLETE.md"].read_text(encoding="utf-8") + "\nTampered.\n",
                encoding="utf-8",
            )

        cases = (
            ("inventory.json", tamper_inventory, "current_snapshot_inventory_json_exact_mismatch"),
            ("original_hashes.json", tamper_hash_inventory, "current_snapshot_original_hashes_json_exact_mismatch"),
            ("span_map.jsonl", tamper_spans, "current_snapshot_span_map_jsonl_exact_mismatch"),
            ("coverage_map.jsonl", tamper_coverage, "current_snapshot_coverage_map_jsonl_exact_mismatch"),
            ("anchor_aliases.json", tamper_aliases, "current_snapshot_anchor_aliases_json_exact_mismatch"),
            ("pilot_report.json", tamper_pilot, "current_snapshot_pilot_report_json_exact_mismatch"),
            ("batch_report.jsonl", tamper_batches, "current_snapshot_batch_report_jsonl_exact_mismatch"),
            (
                "final_validation_summary.json snapshot_status",
                tamper_final_snapshot_status,
                "current_snapshot_final_validation_summary_json_exact_mismatch",
            ),
            (
                "final_validation_summary.json notes",
                tamper_final_notes,
                "current_snapshot_final_validation_summary_json_exact_mismatch",
            ),
            ("COMPLETE.md", tamper_complete_note, "current_snapshot_complete_md_exact_mismatch"),
        )
        for artifact_name, tamper, expected_error in cases:
            with self.subTest(artifact=artifact_name):
                for name, path in artifact_paths.items():
                    path.write_bytes(pristine[name])
                tamper()
                report = pm_plan_migration.validate_run_dir(terminal_dir, require_current_pointer=False)
                self.assertEqual(report["status"], "fail")
                self.assertIn(expected_error, [failure.get("error") for failure in report["failures"]])

    def test_failed_post_pointer_validation_restores_pointer_and_quarantines_candidate(self) -> None:
        self.write_lineage_summaries()
        previous_run_dir, _ = self.write_terminal_snapshot()
        pointer_before = pm_plan_migration.CURRENT_RUN_POINTER.read_bytes()
        real_validate = pm_plan_migration.validate_run_dir

        def force_final_failure(run_dir: Path, *, require_current_pointer: bool = True) -> dict[str, object]:
            if require_current_pointer and run_dir.name == FAILED_PUBLICATION_RUN_ID:
                return {
                    "schema_id": "pm.plan_migration.validation_report.v1",
                    "run_id": FAILED_PUBLICATION_RUN_ID,
                    "status": "fail",
                    "failures": [{"error": "forced_post_publication_failure"}],
                    "warnings": [],
                    "checks": {},
                }
            return real_validate(run_dir, require_current_pointer=require_current_pointer)

        with mock.patch.object(pm_plan_migration, "validate_run_dir", side_effect=force_final_failure):
            report = pm_plan_migration.cmd_snapshot_current(
                argparse.Namespace(
                    run_id=FAILED_PUBLICATION_RUN_ID,
                    expected_doc_count=1,
                    supersedes_run_id=[previous_run_dir.name],
                    pilot_doc="Plans/Test.md",
                    batch_size=1,
                    dry_run=False,
                )
            )

        self.assert_failed_publication_rolled_back(report, previous_run_dir, pointer_before)

    def test_pointer_temp_write_exception_rolls_back_and_quarantines_candidate(self) -> None:
        self.write_lineage_summaries()
        previous_run_dir, _ = self.write_terminal_snapshot()
        pointer_before = pm_plan_migration.CURRENT_RUN_POINTER.read_bytes()
        real_write_json = pm_plan_migration.write_json
        pointer_temp = self.migrations / f".{FAILED_PUBLICATION_RUN_ID}.current-run.tmp"

        def fail_pointer_temp_write(path: Path, value: object) -> None:
            if path == pointer_temp:
                raise OSError("forced pointer temp write failure")
            real_write_json(path, value)

        with mock.patch.object(pm_plan_migration, "write_json", side_effect=fail_pointer_temp_write):
            report = pm_plan_migration.cmd_snapshot_current(
                argparse.Namespace(
                    run_id=FAILED_PUBLICATION_RUN_ID,
                    expected_doc_count=1,
                    supersedes_run_id=[previous_run_dir.name],
                    pilot_doc="Plans/Test.md",
                    batch_size=1,
                    dry_run=False,
                )
            )

        self.assertEqual(report["failures"][0]["publication_stage"], "write_current_pointer_temp")
        self.assert_failed_publication_rolled_back(report, previous_run_dir, pointer_before)

    def test_pointer_replace_exception_rolls_back_and_quarantines_candidate(self) -> None:
        self.write_lineage_summaries()
        previous_run_dir, _ = self.write_terminal_snapshot()
        pointer_before = pm_plan_migration.CURRENT_RUN_POINTER.read_bytes()
        real_replace = Path.replace
        pointer_temp_name = f".{FAILED_PUBLICATION_RUN_ID}.current-run.tmp"

        def fail_pointer_replace(source: Path, target: Path) -> Path:
            if source.name == pointer_temp_name:
                raise OSError("forced pointer replace failure")
            return real_replace(source, target)

        with mock.patch.object(Path, "replace", new=fail_pointer_replace):
            report = pm_plan_migration.cmd_snapshot_current(
                argparse.Namespace(
                    run_id=FAILED_PUBLICATION_RUN_ID,
                    expected_doc_count=1,
                    supersedes_run_id=[previous_run_dir.name],
                    pilot_doc="Plans/Test.md",
                    batch_size=1,
                    dry_run=False,
                )
            )

        self.assertEqual(report["failures"][0]["publication_stage"], "replace_current_pointer")
        self.assert_failed_publication_rolled_back(report, previous_run_dir, pointer_before)

    def test_dry_run_and_write_reject_same_source_preserving_invariant(self) -> None:
        self.plan_path.write_text(plan_doc(node_compile_mode="source_preserving_planunit"), encoding="utf-8")
        pm_plan_migration.write_json(
            self.migrations / MIDDLE_RUN_ID / "final_validation_summary.json",
            {"run_id": MIDDLE_RUN_ID, "status": "COMPLETE"},
        )

        reports = []
        for dry_run, suffix in ((True, "dry"), (False, "write")):
            run_id = f"pds-20260828-90{len(reports) + 1}-{suffix}"
            report = pm_plan_migration.cmd_snapshot_current(
                argparse.Namespace(
                    run_id=run_id,
                    expected_doc_count=1,
                    supersedes_run_id=[MIDDLE_RUN_ID],
                    pilot_doc="Plans/Test.md",
                    batch_size=1,
                    dry_run=dry_run,
                )
            )
            reports.append(report)
            self.assertFalse((self.migrations / run_id).exists())

        expected_failure = {
            "error": "current_snapshot_source_preserving_planunits_remain",
            "plan_unit_ids": ["TEST-001"],
        }
        self.assertEqual(reports[0]["status"], "fail")
        self.assertEqual(reports[1]["status"], "fail")
        self.assertIn(expected_failure, reports[0]["failures"])
        self.assertIn(expected_failure, reports[1]["failures"])


if __name__ == "__main__":
    unittest.main()
