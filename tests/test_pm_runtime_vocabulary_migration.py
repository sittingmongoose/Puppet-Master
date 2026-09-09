import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


class RuntimeVocabularyMigrationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.legacy_schema = load_json(PLANS / "shared_runtime_contracts.schema.json")
        cls.successor_schema = load_json(PLANS / "full_thread_runtime_contracts.schema.json")
        cls.fixtures = load_json(PLANS / "full_thread_runtime_contract_fixtures.json")
        cls.registry = load_json(PLANS / "storage_value_registry.json")
        cls.families = {row["family_id"]: row for row in cls.registry["families"]}
        cls.dispositions = {
            row["disposition_id"]: row
            for row in cls.registry["contract_family_dispositions"]
        }

    def test_legacy_definitions_are_reader_import_only(self) -> None:
        expected = {
            "runtime_resource_admission": (
                "Plans/full_thread_runtime_contracts.schema.json#/$defs/GovernorDecisionRecord",
                "Plans/full_thread_runtime_contracts.schema.json#/x-legacy-normalization/governor_outcome",
            ),
            "observable_work_projection": (
                "Plans/full_thread_runtime_contracts.schema.json#/$defs/ObservableWorkRecord",
                "Plans/full_thread_runtime_contracts.schema.json#/x-legacy-normalization/observable_work_state",
            ),
        }
        for definition_name, (schema_ref, normalization_ref) in expected.items():
            with self.subTest(definition_name=definition_name):
                definition = self.legacy_schema["$defs"][definition_name]
                self.assertEqual(definition["x-write-policy"], "legacy_reader_import_only")
                self.assertEqual(definition["x-successor-schema-ref"], schema_ref)
                self.assertEqual(definition["x-normalization-ref"], normalization_ref)

    def test_successor_schema_owns_exact_one_time_normalization(self) -> None:
        self.assertEqual(self.successor_schema["x-write-policy"], "canonical_new_writes_only")
        normalization = self.successor_schema["x-legacy-normalization"]
        self.assertEqual(normalization["source_owner_contract_id"], "pm.shared_runtime.contracts.v1")
        self.assertEqual(
            normalization["source_record_schema_ids"],
            {
                "runtime_resource_admission": self.legacy_schema["$defs"]["runtime_resource_admission"]["properties"]["schema_id"]["const"],
                "observable_work_projection": self.legacy_schema["$defs"]["observable_work_projection"]["properties"]["schema_id"]["const"],
            },
        )
        self.assertEqual(normalization["boundary"], "owner_import_once")
        self.assertEqual(normalization["ambiguity_policy"], "fail_closed")
        self.assertFalse(normalization["runtime_proof_claimed"])

        governor = {row["legacy"]: row for row in normalization["governor_outcome"]}
        self.assertEqual(set(governor), {"admitted", "admitted_reduced", "queued", "blocked", "rejected"})
        self.assertEqual(governor["admitted_reduced"]["successor"], "admitted_degraded")
        for legacy_value in ("blocked", "rejected"):
            self.assertEqual(
                governor[legacy_value]["successor_by_typed_reason"],
                ["permission_blocked", "resource_blocked"],
            )

        work = {row["legacy"]: row for row in normalization["observable_work_state"]}
        self.assertEqual(
            set(work),
            {
                "queued", "preflighting", "awaiting_permission", "awaiting_user",
                "awaiting_resource", "running", "retry_backoff", "reconciling",
                "cancelling", "succeeded", "failed", "cancelled", "recovery_required",
            },
        )
        self.assertEqual(work["succeeded"]["successor"], "completed")
        self.assertEqual(work["recovery_required"]["successor"], "recovery-required")
        self.assertEqual(
            work["reconciling"]["successor_by_context"],
            {"transport": "reconnecting", "non_transport": "starting"},
        )

    def test_normalization_fixtures_cover_every_legacy_value_and_ambiguity(self) -> None:
        cases = self.fixtures["legacy_normalization_cases"]
        self.assertIn("do not claim a physical family migration", cases["claim_boundary"])
        positive = cases["positive"]
        self.assertEqual(len(positive), 21)
        self.assertEqual(len({case["name"] for case in positive}), 21)

        normalization = self.successor_schema["x-legacy-normalization"]
        governor_rules = {row["legacy"]: row for row in normalization["governor_outcome"]}
        work_rules = {row["legacy"]: row for row in normalization["observable_work_state"]}
        for case in positive:
            with self.subTest(case=case["name"]):
                legacy_value = case["legacy_value"]
                if case["legacy_record_kind"] == "runtime_resource_admission":
                    rule = governor_rules[legacy_value]
                    self.assertEqual(case["successor_record_kind"], "governor_decision")
                    if "successor" in rule:
                        expected_successor = rule["successor"]
                        self.assertNotIn("legacy_reason_class", case)
                    else:
                        reason_class = case.get("legacy_reason_class")
                        self.assertIn(reason_class, {"permission", "resource"})
                        expected_successor = f"{reason_class}_blocked"
                        self.assertIn(expected_successor, rule["successor_by_typed_reason"])
                    self.assertEqual(case["successor_value"], expected_successor)
                    continue

                self.assertEqual(case["legacy_record_kind"], "observable_work_projection")
                self.assertEqual(case["successor_record_kind"], "observable_work")
                rule = work_rules[legacy_value]
                if "successor" in rule:
                    expected_successor = rule["successor"]
                else:
                    context = case.get("legacy_context")
                    self.assertIn(context, rule["successor_by_context"])
                    expected_successor = rule["successor_by_context"][context]
                self.assertEqual(case["successor_value"], expected_successor)
                for rule_key, fixture_key in (
                    ("wait_reason", "successor_wait_reason"),
                    ("phase", "successor_phase"),
                    ("cancel_available", "successor_cancel_available"),
                    ("preserve_reconcile_phase", "preserve_reconcile_phase"),
                ):
                    if rule_key in rule:
                        self.assertEqual(case.get(fixture_key), rule[rule_key])
                    else:
                        self.assertNotIn(fixture_key, case)

        self.assertEqual(
            {case["legacy_value"] for case in positive if case["legacy_record_kind"] == "runtime_resource_admission"},
            {"admitted", "admitted_reduced", "queued", "blocked", "rejected"},
        )
        self.assertEqual(
            {
                (case["legacy_value"], case["legacy_reason_class"], case["successor_value"])
                for case in positive
                if case["legacy_record_kind"] == "runtime_resource_admission"
                and "legacy_reason_class" in case
            },
            {
                ("blocked", "permission", "permission_blocked"),
                ("blocked", "resource", "resource_blocked"),
                ("rejected", "permission", "permission_blocked"),
                ("rejected", "resource", "resource_blocked"),
            },
        )
        self.assertEqual(
            {case["legacy_value"] for case in positive if case["legacy_record_kind"] == "observable_work_projection"},
            {
                "queued", "preflighting", "awaiting_permission", "awaiting_user",
                "awaiting_resource", "running", "retry_backoff", "reconciling",
                "cancelling", "succeeded", "failed", "cancelled", "recovery_required",
            },
        )
        negatives = {case["name"]: case for case in cases["negative"]}
        self.assertEqual(
            set(negatives),
            {
                "legacy_blocked_without_typed_reason_fails_closed",
                "legacy_rejected_without_typed_reason_fails_closed",
                "legacy_reconciling_without_context_fails_closed",
            },
        )
        for legacy_value in ("blocked", "rejected"):
            case = next(
                row for row in negatives.values()
                if row["legacy_record_kind"] == "runtime_resource_admission"
                and row["legacy_value"] == legacy_value
            )
            rule = governor_rules[legacy_value]
            self.assertIn("successor_by_typed_reason", rule)
            self.assertIsNone(case["legacy_reason_class"])
            self.assertNotIn("successor_value", case)
            self.assertEqual(case["expected_failure"], "ambiguous_legacy_governor_outcome")

        reconcile = negatives["legacy_reconciling_without_context_fails_closed"]
        self.assertIn("successor_by_context", work_rules["reconciling"])
        self.assertIsNone(reconcile["legacy_context"])
        self.assertNotIn("successor_value", reconcile)
        self.assertEqual(reconcile["expected_failure"], "ambiguous_legacy_work_context")

    def test_old_physical_families_are_migration_only_readers(self) -> None:
        for family_id in ("runtime_resource_admission", "observable_work_projection"):
            with self.subTest(family_id=family_id):
                row = self.families[family_id]
                self.assertEqual(row["status"], "materialized")
                self.assertEqual(row["tier"], "migration_only")
                self.assertEqual(
                    row["producer"],
                    ["No new writer; existing physical rows are retained for compatibility import only"],
                )
                self.assertEqual(
                    row["consumers"],
                    ["StorageMigrationCoordinator one-time owner-boundary normalizer"],
                )
                migration = row["migration_disposition"]
                self.assertEqual(migration["mode"], "compatibility_read_only")
                self.assertTrue(migration["compatibility_keys_read_only"])
                self.assertEqual(migration["ambiguity_policy"], "fail_closed")

        successor = self.dispositions["scd.full_thread_runtime.durable.v1"]
        self.assertEqual(successor["physical_family_status"], "physical_family_registration_pending")
        self.assertEqual(successor["persistence_disposition"], "durable_existing_family_migration_required")
        self.assertFalse(successor["runtime_evidence"])

    def test_consumers_use_successor_vocabulary_and_mark_legacy_input(self) -> None:
        lsp = (PLANS / "LSPSupport.md").read_text(encoding="utf-8")
        containers = (PLANS / "Containers_Registry_and_Unraid.md").read_text(encoding="utf-8")
        exact_governor_values = (
            "admitted, queued, admitted_degraded, permission_blocked, "
            "resource_blocked, or cancelled decision"
        )
        self.assertIn(exact_governor_values, lsp)
        self.assertIn(exact_governor_values, containers)
        self.assertIn("Legacy admitted_reduced, blocked, and rejected rows are read/import-only", lsp)
        self.assertIn("Legacy admitted_reduced, blocked, and rejected rows are read/import-only", containers)
        self.assertIn("truthful completed, failed, cancelled, or recovery-required terminal outcome", lsp)

    def test_release_verifies_selected_renderer_order_without_reopening_choice(self) -> None:
        gui = (PLANS / "FinalGUISpec.md").read_text(encoding="utf-8")
        release = (PLANS / "Release_Supply_Chain.md").read_text(encoding="utf-8")
        self.assertIn("Skia compiled in and selected by default", gui)
        self.assertIn("Winit + Skia is compiled and selected by default", release)
        self.assertIn("Winit + FemtoVG-wgpu is the fallback", release)
        self.assertIn("Winit software renderer is the emergency path", release)
        self.assertIn(
            "`SLINT_BACKEND` explicit override, persisted renderer preference, compiled Skia default, "
            "FemtoVG-wgpu fallback, then software emergency fallback",
            release,
        )
        self.assertIn("the compiled default never overrides either explicit operator choice", release)
        self.assertIn("source_ref:user_approval:2026-09-09:uphold_final_gui_renderer_order", release)
        self.assertNotIn("Renderer order remains bakeoff-evidence-gated", release)
        self.assertNotIn("renderer bakeoff, full-thread benchmark", release)


if __name__ == "__main__":
    unittest.main()
