from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts/pm-audit-closure.py"
SPEC = importlib.util.spec_from_file_location("pm_audit_closure", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
pm_audit_closure = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(pm_audit_closure)


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text("".join(json.dumps(row, sort_keys=True) + "\n" for row in rows), encoding="utf-8")


class PmAuditClosureTerminalStateTests(unittest.TestCase):
    def validate(self, audit_dir: Path, registry: Path) -> dict:
        return pm_audit_closure.validate_audit_dir(
            audit_dir,
            require_matrix=True,
            source_artifacts=None,
            registry_path=registry,
        )

    def test_previously_closed_needs_no_repair_matrix(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            audit_dir = root / "audit-terminal"
            audit_dir.mkdir()
            registry = root / "_semantic_closure_registry.jsonl"
            registry.write_text("", encoding="utf-8")
            write_jsonl(audit_dir / "atom_fidelity_matrix.jsonl", [{
                "atom_id": "atom-0001",
                "classification": "previously_closed",
                "finding_level": "observation",
                "repair_required": False,
            }])

            report = self.validate(audit_dir, registry)

            self.assertEqual(report["errors"], [])
            self.assertEqual(report["repair_required_count"], 0)
            self.assertFalse(report["matrix_required"])
            self.assertEqual(report["terminal_repair_state"], "no_repair_required")

    def test_warning_only_audit_is_terminal_without_matrix(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            audit_dir = root / "audit-warning-only"
            audit_dir.mkdir()
            registry = root / "_semantic_closure_registry.jsonl"
            registry.write_text("", encoding="utf-8")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [{
                "classification": "source_lineage_only",
                "finding_family": "audit_artifact_wording",
                "finding_key": "sfk-test-warning",
                "finding_level": "warning",
                "repair_required": False,
                "risk_key": "old_report_wording",
                "severity": "low",
            }])

            report = self.validate(audit_dir, registry)

            self.assertEqual(report["errors"], [])
            self.assertEqual(report["repair_required_count"], 0)
            self.assertEqual(report["terminal_repair_state"], "no_repair_required")

    def test_ordinary_validator_warning_is_not_actionable(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            audit_dir = root / "audit-validator-warning"
            audit_dir.mkdir()
            registry = root / "_semantic_closure_registry.jsonl"
            registry.write_text("", encoding="utf-8")
            (audit_dir / "validator_results.json").write_text(json.dumps({
                "results": [{
                    "name": "closure_validate",
                    "status": "pass",
                    "stdout": json.dumps({"warnings": ["informational"]}),
                    "side_effect_count": 0,
                }]
            }), encoding="utf-8")

            report = self.validate(audit_dir, registry)

            self.assertEqual(report["errors"], [])
            self.assertEqual(report["repair_required_count"], 0)

    def test_repair_required_true_requires_matrix(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            audit_dir = root / "audit-actionable"
            audit_dir.mkdir()
            registry = root / "_semantic_closure_registry.jsonl"
            registry.write_text("", encoding="utf-8")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [{
                "classification": "missing_or_drift",
                "finding_family": "real_drift",
                "finding_key": "sfk-test-actionable",
                "finding_level": "blocker",
                "repair_required": True,
                "risk_key": "real_drift",
                "severity": "high",
            }])

            report = self.validate(audit_dir, registry)

            self.assertEqual(report["repair_required_count"], 1)
            self.assertTrue(report["matrix_required"])
            self.assertTrue(any("missing required" in error for error in report["errors"]))

    def test_audit_only_paths_do_not_create_subject_staleness(self) -> None:
        self.assertFalse(pm_audit_closure.has_substantive_subject_paths([
            "Plans/.audits/audit-20260619-006/FINAL_REPORT.md",
            "Plans/.audits/_semantic_closure_registry.jsonl",
        ]))
        self.assertTrue(pm_audit_closure.has_substantive_subject_paths([
            "Plans/Planning_Ledger_System.md",
        ]))
        self.assertTrue(pm_audit_closure.has_substantive_subject_paths([
            "Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/state/current.json",
        ]))

    def test_zero_actionable_validation_makes_no_changes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            audit_dir = root / "audit-noop"
            audit_dir.mkdir()
            registry = root / "_semantic_closure_registry.jsonl"
            registry.write_text("", encoding="utf-8")
            risk_path = audit_dir / "semantic_risks.jsonl"
            write_jsonl(risk_path, [{
                "classification": "source_lineage_only",
                "finding_family": "audit_artifact_wording",
                "finding_key": "sfk-test-noop",
                "finding_level": "observation",
                "repair_required": False,
                "risk_key": "old_report_wording",
                "severity": "low",
            }])
            before = {path: path.read_text(encoding="utf-8") for path in (registry, risk_path)}

            report = self.validate(audit_dir, registry)

            after = {path: path.read_text(encoding="utf-8") for path in (registry, risk_path)}
            self.assertEqual(report["errors"], [])
            self.assertEqual(report["repair_required_count"], 0)
            self.assertEqual(before, after)


if __name__ == "__main__":
    unittest.main()
