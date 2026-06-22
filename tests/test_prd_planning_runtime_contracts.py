import json
import importlib.util
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class PRDPlanningRuntimeContractsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        validator_path = ROOT / "scripts" / "pm-prd-planning-runtime-validate.py"
        spec = importlib.util.spec_from_file_location("pm_prd_planning_runtime_validate_test", validator_path)
        if spec is None or spec.loader is None:
            raise RuntimeError(f"cannot load {validator_path}")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        cls.validator = module
        cls.handoff_schema = module.load_json(module.HANDOFF_SCHEMA_PATH)

    def test_runtime_contract_validator_passes(self) -> None:
        proc = subprocess.run(
            [sys.executable, "scripts/pm-prd-planning-runtime-validate.py"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        try:
            report = json.loads(proc.stdout)
        except json.JSONDecodeError as exc:  # pragma: no cover - failure path prints diagnostics.
            self.fail(f"validator did not emit JSON: {exc}\nstdout={proc.stdout}\nstderr={proc.stderr}")
        self.assertEqual(report["status"], "pass", report)
        self.assertEqual(proc.returncode, 0, report)

    def assertHandoffAccepts(self, artifact_kind: str, payload: dict) -> None:
        errors = self.validator.validate_handoff_fixture(self.handoff_schema, artifact_kind, payload)
        self.assertEqual(errors, [])

    def assertHandoffRejects(self, artifact_kind: str, payload: dict) -> None:
        errors = self.validator.validate_handoff_fixture(self.handoff_schema, artifact_kind, payload)
        self.assertNotEqual(errors, [])

    def test_plan_compile_run_mode_source_adapter_correlations_are_executable(self) -> None:
        valid = self.validator.sample_plan_compile_run()
        self.assertHandoffAccepts("plan_compile_run", valid)

        old_field = dict(valid)
        old_field["native_plan_wizard_launch_enabled"] = True
        self.assertHandoffRejects("plan_compile_run", old_field)

        old_launch_source = dict(valid)
        old_launch_source["launch_source"] = "native_plan_wizard"
        self.assertHandoffRejects("plan_compile_run", old_launch_source)

        native_with_codex_source = dict(valid)
        native_with_codex_source["launch_source"] = "codex_bootstrap"
        self.assertHandoffRejects("plan_compile_run", native_with_codex_source)

        design_only_with_native_source = dict(valid)
        design_only_with_native_source.update(
            {
                "contract_mode": "design_only",
                "launch_policy": "disabled",
                "launch_source": "native_planning_wizard",
                "runtime_enablement_ref": None,
                "runtime_policy_snapshot_ref": None,
                "status": "design_only_disabled",
                "automatic_launch_enabled": False,
                "planning_wizard_launch_enabled": False,
                "current_state": "initialized",
                "receipts": [],
                "compile_wave_contracts": [],
            }
        )
        self.assertHandoffRejects("plan_compile_run", design_only_with_native_source)

        native_missing_enablement = dict(valid)
        native_missing_enablement["runtime_enablement_ref"] = None
        self.assertHandoffRejects("plan_compile_run", native_missing_enablement)

    def test_runtime_stage_registry_and_terminal_state_fixtures_are_executable(self) -> None:
        valid = self.validator.sample_plan_compile_run()
        for stage_id in self.handoff_schema["$defs"]["stage_name"]["enum"]:
            payload = dict(valid)
            payload["status"] = "running"
            payload["current_state"] = "stage_running"
            payload["current_stage"] = stage_id
            payload["cursor"] = {**valid["cursor"], "stage": stage_id}
            payload["next_required_stage"] = "orchestrator_projection"
            self.assertHandoffAccepts("plan_compile_run", payload)

        stale_stage = dict(valid)
        stale_stage["current_stage"] = "dependency_cycle_analysis"
        stale_stage["cursor"] = {**valid["cursor"], "stage": "dependency_cycle_analysis"}
        self.assertHandoffRejects("plan_compile_run", stale_stage)

        terminal_success_inconsistent = dict(valid)
        terminal_success_inconsistent.update(
            {
                "current_state": "initialized",
                "current_stage": "preflight_currentness",
                "cursor": {**valid["cursor"], "stage": "preflight_currentness"},
                "next_required_stage": "scope_selection",
                "receipts": [],
                "compile_wave_contracts": [],
            }
        )
        self.assertHandoffRejects("plan_compile_run", terminal_success_inconsistent)

    def test_parallel_worklists_and_wave_receipts_are_executable(self) -> None:
        valid = self.validator.sample_compile_worklist()
        self.assertHandoffAccepts("compile_worklist", valid)

        empty_complete_worklist = dict(valid)
        empty_complete_worklist["items"] = []
        empty_complete_worklist["wave_assignments"] = []
        empty_complete_worklist["parallelism_policy"] = {
            **valid["parallelism_policy"],
            "assignment_receipt_refs": [],
            "completion_receipt_refs": [],
        }
        self.assertHandoffRejects("compile_worklist", empty_complete_worklist)

        too_few_parallel_assignments = dict(valid)
        too_few_parallel_assignments["parallelism_policy"] = {
            **valid["parallelism_policy"],
            "minimum_parallel_assignments": 1,
        }
        self.assertHandoffRejects("compile_worklist", too_few_parallel_assignments)

        one_wave_below_minimum = dict(valid)
        one_wave_below_minimum["wave_assignments"] = [self.validator.sample_wave()]
        self.assertHandoffRejects("compile_worklist", one_wave_below_minimum)

        parent_agent_fallback = dict(valid)
        parent_agent_fallback["wave_assignments"] = [
            {**self.validator.sample_wave(), "assigned_agent_role": "parent"},
            {**self.validator.sample_wave(), "wave_id": "wave-002", "assignment_id": "assign-002", "assigned_agent_role": "parent"},
        ]
        parent_agent_fallback["wave_assignments"][1]["assignment_receipt"] = {
            **parent_agent_fallback["wave_assignments"][1]["assignment_receipt"],
            "receipt_id": "assignment-receipt-002",
            "wave_id": "wave-002",
            "assignment_id": "assign-002",
        }
        parent_agent_fallback["wave_assignments"][1]["completion_receipt"] = {
            **parent_agent_fallback["wave_assignments"][1]["completion_receipt"],
            "receipt_id": "completion-receipt-002",
            "wave_id": "wave-002",
            "assignment_id": "assign-002",
        }
        self.assertHandoffRejects("compile_worklist", parent_agent_fallback)

        receipt_ref_mismatch = dict(valid)
        receipt_ref_mismatch["parallelism_policy"] = {
            **valid["parallelism_policy"],
            "assignment_receipt_refs": ["missing-assignment-receipt"],
        }
        self.assertHandoffRejects("compile_worklist", receipt_ref_mismatch)

        unreferenced_nested_receipt = dict(valid)
        unreferenced_nested_receipt["parallelism_policy"] = {
            **valid["parallelism_policy"],
            "assignment_receipt_refs": ["assignment-receipt-001"],
            "completion_receipt_refs": ["completion-receipt-001"],
        }
        self.assertHandoffRejects("compile_worklist", unreferenced_nested_receipt)

        missing_completion_receipt = dict(valid)
        missing_completion_receipt["wave_assignments"] = [{**self.validator.sample_wave(), "completion_receipt": None}]
        self.assertHandoffRejects("compile_worklist", missing_completion_receipt)


if __name__ == "__main__":
    unittest.main()
