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


def refs(audit_id: str = "audit-terminal", ledger_id: str = "pldg-test") -> dict[str, str]:
    return {
        "audit_id": audit_id,
        "ledger_id": ledger_id,
        "baseline_ref": "base-ref",
        "subject_ref": "subject-ref",
        "observation_ref": "observation-ref",
    }


def write_audit_report(audit_dir: Path, audit_refs: dict[str, str], *, status: str, repair_required_count: int) -> None:
    payload = {
        "schema_id": "pm.semantic_audit.report.v1",
        **audit_refs,
        "status": status,
        "repair_required_count": repair_required_count,
    }
    (audit_dir / "audit_report.json").write_text(json.dumps(payload, sort_keys=True), encoding="utf-8")


def scope_row(audit_refs: dict[str, str], family: str, *, finding_keys: list[str] | None = None, classification: str = "covered") -> dict:
    row = {
        **audit_refs,
        "check_family": family,
        "source_atom_ids": [f"atom-{family}"],
        "plan_unit_ids": [f"PU-{family}"],
        "owner_docs": ["Plans/Test.md"],
        "detail_keys": [family],
        "exact_tokens": [family],
        "covered_artifacts": ["semantic_risks.jsonl"],
        "classification": classification,
        "repair_required": False,
        "finding_level": "observation",
        "finding_keys": finding_keys or [],
    }
    row["check_id"] = pm_audit_closure.compute_check_id(row)
    return row


def write_complete_scope(audit_dir: Path, audit_refs: dict[str, str], *, finding_keys: list[str] | None = None) -> None:
    rows = [
        scope_row(audit_refs, family, finding_keys=finding_keys if family == "compiled_atom_detail" else None)
        for family in sorted(pm_audit_closure.SCOPE_REQUIRED_FAMILIES)
    ]
    write_jsonl(audit_dir / "audit_scope_manifest.jsonl", rows)


def finding_row(audit_refs: dict[str, str], *, repair_required: bool, level: str = "warning") -> dict:
    row = {
        **audit_refs,
        "schema_id": "pm.semantic_audit.finding.v1",
        "classification": "missing_or_drift" if repair_required else "source_lineage_only",
        "finding_family": "test_family",
        "source_atom_ids": ["atom-0001"],
        "plan_unit_ids": ["PU-001"],
        "owner_docs": ["Plans/Test.md"],
        "detail_keys": ["detail"],
        "exact_tokens": ["token"],
        "repair_required": repair_required,
        "finding_level": level,
        "summary": "test finding",
    }
    row["finding_key"] = pm_audit_closure.compute_finding_key(row)
    return row


def registry_row(audit_refs: dict[str, str], finding: dict, closure_id: str = "closure-test-001") -> dict:
    return {
        "closure_id": closure_id,
        "finding_key": finding["finding_key"],
        "closure_status": "repaired",
        "audit_ids": [audit_refs["audit_id"]],
        "closed_by_audit_id": audit_refs["audit_id"],
    }


def closure_matrix_row(audit_refs: dict[str, str], finding: dict, *, source_row: int = 1) -> dict:
    row = {
        **audit_refs,
        "source_artifact": "semantic_risks.jsonl",
        "source_row": source_row,
        "finding_family": finding["finding_family"],
        "source_atom_ids": finding["source_atom_ids"],
        "plan_unit_ids": finding["plan_unit_ids"],
        "owner_docs": finding["owner_docs"],
        "detail_keys": finding["detail_keys"],
        "exact_tokens": finding["exact_tokens"],
        "finding_key": finding["finding_key"],
        "closure_status": "repaired",
        "closure_evidence": ["AGENTS.md"],
        "closure_reason": "closed in test",
        "registry_closure_id": "closure-test-001",
    }
    return row


def impact_row(audit_refs: dict[str, str], finding: dict, *, drift_field: str | None = None) -> dict:
    drift = {field: False for field in pm_audit_closure.POST_REPAIR_DRIFT_FIELDS}
    if drift_field:
        drift[drift_field] = True
    row = {
        **audit_refs,
        "source_artifact": "semantic_risks.jsonl",
        "source_row": 1,
        "finding_key": finding["finding_key"],
        "files": ["Plans/Test.md"],
        "plan_unit_ids": finding["plan_unit_ids"],
        "schemas": [],
        "dependency_edges": [],
        "owner_refs": ["Plans/Test.md"],
        "ledger_projection_fields": ["state.current"],
        "index_artifacts": ["Plans/.plan_index/plan_units.jsonl"],
        "governance_artifacts": [],
        "scope_check_ids": [],
        "post_repair_semantic_audit": {
            "status": "PASS",
            "repair_required_count": 0,
            "covered_original_scope": True,
            "covered_impact_rows": True,
            "drift": drift,
        },
    }
    row["impact_id"] = pm_audit_closure.compute_impact_id(row)
    return row


class PmAuditClosureTerminalStateTests(unittest.TestCase):
    def validate(self, audit_dir: Path, registry: Path) -> dict:
        return pm_audit_closure.validate_audit_dir(
            audit_dir,
            require_matrix=True,
            require_effective_status=False,
            source_artifacts=None,
            registry_path=registry,
        )

    def setup_audit(self, root: Path, name: str, *, status: str = "PASS", repair_required_count: int = 0) -> tuple[Path, Path, dict[str, str]]:
        audit_dir = root / name
        audit_dir.mkdir()
        registry = root / "_semantic_closure_registry.jsonl"
        registry.write_text("", encoding="utf-8")
        audit_refs = refs(name)
        write_audit_report(audit_dir, audit_refs, status=status, repair_required_count=repair_required_count)
        write_complete_scope(audit_dir, audit_refs)
        return audit_dir, registry, audit_refs

    def test_previously_closed_needs_no_repair_matrix(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-terminal")
            write_jsonl(audit_dir / "atom_fidelity_matrix.jsonl", [{
                **audit_refs,
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
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-warning-only", status="PASS_WITH_WARNINGS")
            warning = finding_row(audit_refs, repair_required=False, level="warning")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [warning])
            write_complete_scope(audit_dir, audit_refs, finding_keys=[warning["finding_key"]])

            report = self.validate(audit_dir, registry)

            self.assertEqual(report["errors"], [])
            self.assertEqual(report["repair_required_count"], 0)
            self.assertEqual(report["terminal_repair_state"], "no_repair_required")

    def test_ordinary_validator_warning_is_not_actionable(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-validator-warning")
            (audit_dir / "validator_results.json").write_text(json.dumps({
                **audit_refs,
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

    def test_repair_required_true_requires_matrix_and_impact_matrix(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-actionable", status="BLOCKED", repair_required_count=1)
            actionable = finding_row(audit_refs, repair_required=True, level="blocker")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [actionable])
            write_complete_scope(audit_dir, audit_refs, finding_keys=[actionable["finding_key"]])

            report = self.validate(audit_dir, registry)

            self.assertEqual(report["repair_required_count"], 1)
            self.assertTrue(report["matrix_required"])
            self.assertTrue(any("repair_closure_matrix.jsonl" in error for error in report["errors"]))
            self.assertTrue(any("repair_impact_matrix.jsonl" in error for error in report["errors"]))

    def test_unstable_audit_specific_finding_key_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-unstable-key", status="BLOCKED", repair_required_count=1)
            actionable = finding_row(audit_refs, repair_required=True, level="blocker")
            actionable["finding_key"] = f"{audit_refs['audit_id']}::row-1"
            write_jsonl(audit_dir / "semantic_risks.jsonl", [actionable])

            report = self.validate(audit_dir, registry)

            self.assertTrue(any("audit-specific identity" in error for error in report["errors"]))
            self.assertTrue(any("deterministic" in error for error in report["errors"]))

    def test_incomplete_scope_manifest_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-incomplete-scope")
            rows = [
                scope_row(audit_refs, family)
                for family in sorted(pm_audit_closure.SCOPE_REQUIRED_FAMILIES)
                if family != "forbidden_artifact_check"
            ]
            rows[0]["classification"] = "pending"
            write_jsonl(audit_dir / "audit_scope_manifest.jsonl", rows)

            report = self.validate(audit_dir, registry)

            self.assertTrue(any("classification must be final" in error for error in report["errors"]))
            self.assertTrue(any("missing required check_family coverage" in error for error in report["errors"]))

    def test_cross_artifact_ref_mismatch_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-ref-mismatch", status="PASS_WITH_WARNINGS")
            warning = finding_row(audit_refs, repair_required=False, level="warning")
            warning["subject_ref"] = "different-subject"
            write_jsonl(audit_dir / "semantic_risks.jsonl", [warning])

            report = self.validate(audit_dir, registry)

            self.assertTrue(any("does not match audit_report" in error for error in report["errors"]))

    def test_repair_induced_lineage_dependency_projection_drift_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-repair-drift", status="BLOCKED", repair_required_count=1)
            actionable = finding_row(audit_refs, repair_required=True, level="blocker")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [actionable])
            write_complete_scope(audit_dir, audit_refs, finding_keys=[actionable["finding_key"]])
            write_jsonl(registry, [registry_row(audit_refs, actionable)])
            write_jsonl(audit_dir / "repair_closure_matrix.jsonl", [closure_matrix_row(audit_refs, actionable)])
            write_jsonl(audit_dir / "repair_impact_matrix.jsonl", [impact_row(audit_refs, actionable, drift_field="dependencies")])

            report = self.validate(audit_dir, registry)

            self.assertTrue(any("drift.dependencies must be false" in error for error in report["errors"]))

    def test_repaired_matrix_supersedes_historical_blocked_report(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-repaired", status="BLOCKED", repair_required_count=1)
            actionable = finding_row(audit_refs, repair_required=True, level="blocker")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [actionable])
            write_complete_scope(audit_dir, audit_refs, finding_keys=[actionable["finding_key"]])
            write_jsonl(registry, [registry_row(audit_refs, actionable)])
            write_jsonl(audit_dir / "repair_closure_matrix.jsonl", [closure_matrix_row(audit_refs, actionable)])
            write_jsonl(audit_dir / "repair_impact_matrix.jsonl", [impact_row(audit_refs, actionable)])

            report = self.validate(audit_dir, registry)

            self.assertEqual(report["errors"], [])
            self.assertEqual(report["original_repair_required_count"], 1)
            self.assertEqual(report["repair_required_count"], 0)
            self.assertEqual(report["terminal_repair_state"], "repair_validated")

    def test_effective_status_supersedes_blocked_final_report_when_no_repair_remains(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-effective", status="PASS_WITH_WARNINGS")
            (audit_dir / "FINAL_REPORT.md").write_text(
                "# Audit\n\nStatus: BLOCKED\n\n## Actionable Findings\n\nNone. `repair_required_count=0`.\n\n## Next Action\n\nNo repair.\n",
                encoding="utf-8",
            )

            report = self.validate(audit_dir, registry)
            projection = pm_audit_closure.build_effective_status_projection(audit_dir, report)

            self.assertEqual(projection["effective_status"], "PASS_WITH_WARNINGS")
            self.assertEqual(projection["repair_required_count"], 0)
            self.assertIn("FINAL_REPORT.md", projection["superseded_historical_reports"])

    def test_effective_status_supersedes_blocked_audit_report_when_closed_by_matrix(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-effective-matrix", status="BLOCKED", repair_required_count=1)
            actionable = finding_row(audit_refs, repair_required=True, level="blocker")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [actionable])
            write_complete_scope(audit_dir, audit_refs, finding_keys=[actionable["finding_key"]])
            write_jsonl(registry, [registry_row(audit_refs, actionable)])
            write_jsonl(audit_dir / "repair_closure_matrix.jsonl", [closure_matrix_row(audit_refs, actionable)])
            write_jsonl(audit_dir / "repair_impact_matrix.jsonl", [impact_row(audit_refs, actionable)])

            report = self.validate(audit_dir, registry)
            projection = pm_audit_closure.build_effective_status_projection(audit_dir, report)

            self.assertEqual(projection["effective_status"], "PASS_WITH_WARNINGS")
            self.assertEqual(projection["repair_required_count"], 0)
            self.assertIn("audit_report.json", projection["superseded_historical_reports"])

    def test_audit_report_status_must_match_repair_required_count(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-status-mismatch", status="PASS", repair_required_count=1)
            actionable = finding_row(audit_refs, repair_required=True, level="blocker")
            write_jsonl(audit_dir / "semantic_risks.jsonl", [actionable])

            report = self.validate(audit_dir, registry)

            self.assertTrue(any("status must be BLOCKED" in error for error in report["errors"]))

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
            audit_dir, registry, audit_refs = self.setup_audit(Path(tmp), "audit-noop", status="PASS_WITH_WARNINGS")
            risk_path = audit_dir / "semantic_risks.jsonl"
            warning = finding_row(audit_refs, repair_required=False, level="observation")
            write_jsonl(risk_path, [warning])
            write_complete_scope(audit_dir, audit_refs, finding_keys=[warning["finding_key"]])
            before = {path: path.read_text(encoding="utf-8") for path in (registry, risk_path)}

            report = self.validate(audit_dir, registry)

            after = {path: path.read_text(encoding="utf-8") for path in (registry, risk_path)}
            self.assertEqual(report["errors"], [])
            self.assertEqual(report["repair_required_count"], 0)
            self.assertEqual(before, after)


if __name__ == "__main__":
    unittest.main()
