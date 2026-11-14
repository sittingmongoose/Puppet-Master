from __future__ import annotations

import argparse
import contextlib
import importlib.util
import io
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


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
        # Tracked evidence is available in fresh worktrees; local AGENTS.md is not.
        "closure_evidence": ["tests/test_pm_audit_closure.py"],
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


class PmAuditClosureSelfAnchorTests(unittest.TestCase):
    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory(prefix="pm-self-anchor-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        root_patch = patch.object(pm_audit_closure, "ROOT", self.root)
        root_patch.start()
        self.addCleanup(root_patch.stop)
        self.audit_dir = self.root / "Plans/.audits/reaudit-fixture"
        self.audit_dir.mkdir(parents=True)
        self.registry = self.audit_dir.parent / "_semantic_closure_registry.jsonl"
        self.registry_ref = pm_audit_closure.rel(self.registry)
        self.anchor = self.registry_ref + "#jsonlset=audit_ids=audit-fixture"
        self.records = self.audit_dir / "records.jsonl"
        evidence = self.audit_dir / "fixture.txt"
        evidence.write_text("The fixture evidence stays current.\n")
        self.target = pm_audit_closure._self_test_registry_row(
            owner_docs=[self.registry_ref], closure_evidence=[self.registry_ref],
            hashes={"closure_evidence_hashes": {pm_audit_closure.rel(evidence): pm_audit_closure.sha256_file(evidence)}},
        )
        write_jsonl(self.registry, [self.target])
        self.git("init", "-q")

    def git(self, *args: str) -> str:
        return subprocess.run(
            ["git", "-C", str(self.root), "-c", "user.name=fixture",
             "-c", "user.email=fixture@invalid", "-c", "commit.gpgsign=false", *args],
            check=True, capture_output=True, text=True,
        ).stdout.strip()

    def commit(self, message: str) -> str:
        self.git("add", "Plans")
        self.git("commit", "-qm", message)
        return self.git("rev-parse", "HEAD")

    def prepare_record(self) -> None:
        commit = self.commit("recheck state")
        resolver = pm_audit_closure.AnchorResolver(self.root)
        record = {
            "schema_id": pm_audit_closure.REAUDIT_RECORD_SCHEMA,
            "reaudit_id": "reaudit-fixture", "closure_id": self.target["closure_id"],
            "line": 1, "row_sha256": pm_audit_closure.sha256_text(pm_audit_closure.raw_registry_lines(self.registry)[1]),
            "recheck_commit": commit, "verdict": "supported",
            "claim": "The registry fixture repair is present.",
            "rationale": "The registry row states the fixture repair.",
            "dependencies": [self.anchor],
            "dependency_hashes_at_recheck": {self.anchor: resolver.sha256(self.anchor)},
            "evidence": [{"ref": self.anchor, "quote": self.target["closure_reason"]}],
            "stale_hashes_at_recheck": [], "stale_ref_dispositions": [], "fix": None,
        }
        packet = {
            "line": 1, "closure_id": record["closure_id"], "row_sha256": record["row_sha256"],
            "recheck_commit": commit, "claim": {k: v for k, v in self.target.items() if k != "hashes"},
            "dependency_anchors": [{"ref": self.anchor, "sha256": resolver.sha256(self.anchor),
                                    "text": resolver.content(self.anchor)[1], "truncated": False}],
        }
        packet["packet_row_digest"] = pm_audit_closure.packet_row_digest(packet)
        packet_path = self.audit_dir / "packet.jsonl"
        write_jsonl(packet_path, [packet])
        reviews = {}
        for who in pm_audit_closure.REAUDIT_REVIEWERS:
            judged = {"line": 1, "closure_id": record["closure_id"], "verdict": "supported"}
            if who == "worker":
                judged.update({k: record.get(k) for k in pm_audit_closure.REAUDIT_WORKER_FIELDS})
                judged.update({k: record[k] for k in (
                    "row_sha256", "dependencies", "recheck_commit", "dependency_hashes_at_recheck",
                )})
            else:
                judged["packet_row_digest"] = packet["packet_row_digest"]
            output = self.audit_dir / f"{who}.jsonl"
            write_jsonl(output, [judged])
            review = {"model": f"fixture-{who}", "verdict": "supported",
                      "evidence_path": pm_audit_closure.rel(output),
                      "evidence_sha256": pm_audit_closure.sha256_file(output)}
            if who != "worker":
                review.update(packet_path=pm_audit_closure.rel(packet_path),
                              packet_sha256=pm_audit_closure.sha256_file(packet_path))
            reviews[who] = review
        record["reviews"] = reviews
        write_jsonl(self.records, [record])
        self.commit("reviewed receipts")

    def append(self, *, dry_run: bool = False) -> tuple[int, dict]:
        args = argparse.Namespace(registry=str(self.registry), records=str(self.records), only="", dry_run=dry_run)
        with contextlib.redirect_stdout(io.StringIO()) as output:
            code = pm_audit_closure.cmd_reaudit_append(args)
        return code, json.loads(output.getvalue())

    def test_self_anchor_is_current_after_append(self) -> None:
        self.prepare_record()
        before = self.registry.read_bytes()
        code, dry = self.append(dry_run=True)
        self.assertEqual((code, dry["would_append"], dry["errors"]), (0, 1, []))
        self.assertEqual(self.registry.read_bytes(), before)
        code, appended = self.append()
        self.assertEqual((code, appended["appended"], appended["errors"]), (0, 1, []))
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["unsuperseded_stale_hash_count"], 0)
        code, repeated = self.append()
        self.assertEqual((code, repeated["already_appended"], repeated["errors"]), (0, 1, []))

    def test_stale_self_anchor_is_held_back(self) -> None:
        self.prepare_record()
        other = pm_audit_closure._self_test_registry_row(
            closure_id="closure-fixture-other", owner_docs=[self.registry_ref],
            closure_evidence=[self.registry_ref], detail_keys=["another finding"],
            hashes=self.target["hashes"],
        )
        with self.registry.open("a") as output:
            output.write(json.dumps(other) + "\n")
        before = self.registry.read_bytes()
        code, report = self.append()
        self.assertEqual((code, report["appended"], report["would_append"]), (0, 0, 0))
        self.assertEqual(len(report["moved_since_recheck"]), 1)
        self.assertIn(self.anchor, report["moved_since_recheck"][0]["changed_anchors"])
        self.assertEqual(self.registry.read_bytes(), before)

    def test_candidate_checks_other_rows_against_appended_content(self) -> None:
        watched = self.registry_ref + "#jsonlset=audit_ids=reaudit-fixture"
        watcher = pm_audit_closure._self_test_registry_row(
            closure_id="closure-watcher", audit_ids=["audit-watcher"], closed_by_audit_id="audit-watcher",
            owner_docs=[self.registry_ref], closure_evidence=[self.registry_ref], detail_keys=["watcher"],
            hashes={"hash_scope": pm_audit_closure.ANCHOR_SCOPE,
                    "owner_evidence_hashes": {watched: pm_audit_closure.sha256_text("[]")}},
        )
        write_jsonl(self.registry, [self.target, watcher])
        self.prepare_record()
        self.assertEqual(pm_audit_closure.validate_registry(self.registry)["errors"], [])
        before = self.registry.read_bytes()
        code, report = self.append()
        self.assertEqual((code, report["appended"]), (1, 0))
        self.assertTrue(any(watched in error and "is stale" in error for error in report["errors"]), report)
        self.assertEqual(self.registry.read_bytes(), before)

    def test_later_matching_row_stales_self_anchor(self) -> None:
        self.prepare_record()
        self.assertEqual(self.append()[0], 0)
        other = pm_audit_closure._self_test_registry_row(
            closure_id="closure-later", owner_docs=[self.registry_ref], closure_evidence=[self.registry_ref],
            detail_keys=["later finding"], hashes=self.target["hashes"],
        )
        with self.registry.open("a") as output:
            output.write(json.dumps(other) + "\n")
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(report["unsuperseded_stale_hash_count"], 1)
        self.assertTrue(any(self.anchor in error and "is stale" in error for error in report["errors"]), report)

    def test_stale_set_at_later_recheck_uses_self_exclusion(self) -> None:
        self.prepare_record()
        self.assertEqual(self.append()[0], 0)
        commit = self.commit("appended registry")
        rows = pm_audit_closure.read_jsonl(self.registry, [])
        stale = pm_audit_closure._target_stale_refs(rows[-1], pm_audit_closure.CommitResolver(self.root, commit))
        self.assertEqual(stale, set())

    def test_self_exclusion_cannot_name_another_file(self) -> None:
        self.prepare_record()
        self.assertEqual(self.append()[0], 0)
        rows = pm_audit_closure.read_jsonl(self.registry, [])
        rows[-1]["hashes"]["registry_self_anchor"]["path"] = pm_audit_closure.rel(self.records)
        pm_audit_closure.write_jsonl(self.registry, rows)
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertTrue(any("registry_self_anchor must name this registry" in error for error in report["errors"]), report)

    def test_hash_report_agrees_with_self_anchor_validation(self) -> None:
        self.prepare_record()
        self.assertEqual(self.append()[0], 0)
        with contextlib.redirect_stdout(io.StringIO()) as output:
            code = pm_audit_closure.cmd_refresh_hashes(argparse.Namespace(registry=str(self.registry), dry_run=True))
        report = json.loads(output.getvalue())
        self.assertEqual((code, report["touched_rows"]), (0, 0))


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
