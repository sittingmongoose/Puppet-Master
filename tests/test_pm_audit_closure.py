from __future__ import annotations

import argparse
import contextlib
import copy
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
        self.assertEqual(report.get("already_stale_current_hash_moved", []), [])
        self.assertEqual(self.registry.read_bytes(), before)

    def test_already_stale_shared_anchor_does_not_block_append(self) -> None:
        watcher = pm_audit_closure._self_test_registry_row(
            closure_id="closure-watcher", audit_ids=["audit-watcher"], closed_by_audit_id="audit-watcher",
            owner_docs=[self.registry_ref], closure_evidence=[self.registry_ref], detail_keys=["watcher"],
            hashes={"hash_scope": pm_audit_closure.ANCHOR_SCOPE,
                    "owner_evidence_hashes": {self.anchor: "0" * 64}},
        )
        write_jsonl(self.registry, [self.target, watcher])
        self.prepare_record()
        baseline = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(len(baseline["errors"]), 1, baseline)
        before_hash = pm_audit_closure.AnchorResolver().sha256(self.anchor)
        before = self.registry.read_bytes()
        code, report = self.append(dry_run=True)
        self.assertEqual((code, report["would_append"], report["errors"]), (0, 1, []), report)
        self.assertEqual(self.registry.read_bytes(), before)
        moved = report["already_stale_current_hash_moved"]
        self.assertEqual(len(moved), 1, report)
        self.assertEqual(moved[0], {
            "status": "already stale, current hash moved", "line": 2,
            "closure_id": watcher["closure_id"], "group": "owner_evidence_hashes",
            "ref": self.anchor, "stored": "0" * 64,
            "before_append_current": before_hash, "candidate_current": moved[0]["candidate_current"],
        })
        self.assertNotEqual(moved[0]["candidate_current"], before_hash)
        code, appended = self.append()
        self.assertEqual((code, appended["appended"], appended["errors"]), (0, 1, []), appended)
        self.assertEqual(pm_audit_closure.AnchorResolver().sha256(self.anchor),
                         appended["already_stale_current_hash_moved"][0]["candidate_current"])
        after = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(after["unsuperseded_stale_hash_count"], 1, after)
        self.assertEqual(len(after["errors"]), 1, after)

    def test_stale_on_one_anchor_does_not_excuse_new_staleness_on_another(self) -> None:
        stale_anchor = self.registry_ref + "#jsonlset=audit_ids=audit-absent"
        watched = self.registry_ref + "#jsonlset=audit_ids=reaudit-fixture"
        watcher = pm_audit_closure._self_test_registry_row(
            closure_id="closure-watcher", audit_ids=["audit-watcher"], closed_by_audit_id="audit-watcher",
            owner_docs=[self.registry_ref], closure_evidence=[self.registry_ref], detail_keys=["watcher"],
            hashes={"hash_scope": pm_audit_closure.ANCHOR_SCOPE,
                    "owner_evidence_hashes": {stale_anchor: "0" * 64, watched: pm_audit_closure.sha256_text("[]")}},
        )
        write_jsonl(self.registry, [self.target, watcher])
        self.prepare_record()
        baseline = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(len(baseline["errors"]), 1, baseline)
        self.assertIn(stale_anchor, baseline["errors"][0])
        before = self.registry.read_bytes()
        code, report = self.append(dry_run=True)
        self.assertEqual((code, report["appended"], report["would_append"]), (1, 0, 0), report)
        self.assertTrue(any(watched in error and "is stale" in error for error in report["errors"]), report)
        self.assertEqual(report.get("already_stale_current_hash_moved", []), [])
        self.assertEqual(self.registry.read_bytes(), before)

    def test_later_matching_row_stales_self_anchor(self) -> None:
        self.prepare_record()
        self.assertEqual(self.append()[0], 0)
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["unsuperseded_stale_hash_count"], 0)
        other = pm_audit_closure._self_test_registry_row(
            closure_id="closure-later", owner_docs=[self.registry_ref], closure_evidence=[self.registry_ref],
            detail_keys=["later finding"], hashes=self.target["hashes"],
        )
        with self.registry.open("a") as output:
            output.write(json.dumps(other) + "\n")
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(report["unsuperseded_stale_hash_count"], 1)
        self.assertTrue(any(self.anchor in error and "is stale" in error for error in report["errors"]), report)

    def test_self_excluding_generated_fields_cannot_be_tampered(self) -> None:
        self.prepare_record()
        code, appended = self.append()
        self.assertEqual((code, appended["appended"], appended["errors"]), (0, 1, []))
        report = pm_audit_closure.validate_registry(self.registry)
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["unsuperseded_stale_hash_count"], 0)
        original = pm_audit_closure.read_jsonl(self.registry, [])
        for field, value in original[-1].items():
            if field == "_line_no":
                continue
            with self.subTest(field=field):
                rows = copy.deepcopy(original)
                if field in ("created_at", "updated_at"):
                    changed = "2000-01-01T00:00:00Z" if value != "2000-01-01T00:00:00Z" else "2001-01-01T00:00:00Z"
                elif isinstance(value, list):
                    changed = value + ["tampered"]
                elif isinstance(value, dict):
                    changed = {**value, "tampered": True}
                else:
                    changed = value + " tampered"
                rows[-1][field] = changed
                pm_audit_closure.write_jsonl(self.registry, rows)
                report = pm_audit_closure.validate_registry(self.registry)
                self.assertTrue(report["errors"], report)
                self.assertEqual(report["superseded_row_count"], 0, report)

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



def replacement_identity(finding: dict, **changes) -> dict:
    """The finding's identity fields with `changes` applied, keyed deterministically."""
    row = {field: copy.deepcopy(finding[field]) for field in (
        "finding_family", "ledger_id", "source_atom_ids", "plan_unit_ids", "owner_docs", "detail_keys", "exact_tokens",
    )}
    row.setdefault("consumer_docs", [])
    row.update(changes)
    row["finding_key"] = pm_audit_closure.compute_finding_key(row)
    return row


class PmAuditClosureMatrixReplacementTests(unittest.TestCase):
    """PLS-026 (DL-511): an appended matrix row may replace one frozen row whose registry link does not hold."""

    PASS_ID = "audit-replace-supplemental-20261114"
    RECORD = "supplemental_closure_pass-20261114.json"

    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory(prefix="pm-matrix-replace-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        self.audit_dir = self.root / "audit-replace"
        self.audit_dir.mkdir()
        self.registry = self.root / "_semantic_closure_registry.jsonl"
        self.audit_refs = refs("audit-replace")
        write_audit_report(self.audit_dir, self.audit_refs, status="BLOCKED", repair_required_count=1)
        self.finding = finding_row(self.audit_refs, repair_required=True, level="blocker")
        write_jsonl(self.audit_dir / "semantic_risks.jsonl", [self.finding])
        write_complete_scope(self.audit_dir, self.audit_refs, finding_keys=[self.finding["finding_key"]])
        write_jsonl(self.audit_dir / "repair_impact_matrix.jsonl", [impact_row(self.audit_refs, self.finding)])
        # The live registry closure has the corrected owner; the frozen matrix row still carries the old one.
        self.corrected = replacement_identity(self.finding, owner_docs=["Plans/Corrected.md"])
        self.registry_rows = [
            {**registry_row(self.audit_refs, self.corrected, "closure-old"), **self.corrected},
            {**registry_row(self.audit_refs, self.corrected, "closure-new"), **self.corrected},
        ]
        self.frozen = closure_matrix_row(self.audit_refs, self.finding)
        self.frozen["registry_closure_id"] = "closure-old"

    # -- fixture builders -------------------------------------------------------------------
    def replacing_row(self, target: int = 1, *, record: str | None = None, pass_id: str | None = None, **changes) -> dict:
        row = closure_matrix_row(self.audit_refs, self.finding)
        row.update({field: copy.deepcopy(value) for field, value in self.corrected.items()})
        row.update({
            "registry_closure_id": "closure-new",
            "closure_reason": "corrected owner routing (test)",
            "replaces_matrix_line": target,
            "replaces_row_sha256": "0" * 64,  # filled in by write()
            "replacement_reason": "the frozen row links a registry closure whose finding identity it does not share",
            "supplemental_pass": {"pass_id": pass_id or self.PASS_ID, "record": record or self.RECORD},
        })
        row.update(changes)
        return row

    @staticmethod
    def line(row: dict) -> str:
        return json.dumps(row, sort_keys=True)

    def write(self, rows: list[dict], *, frozen_rows: int = 1, records: dict[str, dict] | None = None,
              bind: bool = True, list_in_record: bool = True) -> None:
        """Write the matrix and pass record(s). With `bind`, each replacing row gets the SHA-256 of the
        line it names. Each record pins the first `frozen_rows` lines (or its own `frozen_rows`)."""
        lines: list[str] = []
        for row in rows:
            if bind and "replaces_matrix_line" in row and isinstance(row["replaces_matrix_line"], int) \
                    and 0 < row["replaces_matrix_line"] <= len(lines):
                row["replaces_row_sha256"] = pm_audit_closure.sha256_text(lines[row["replaces_matrix_line"] - 1])
            lines.append(self.line(row))
        (self.audit_dir / "repair_closure_matrix.jsonl").write_text("".join(text + "\n" for text in lines), encoding="utf-8")
        write_jsonl(self.registry, self.registry_rows)
        records = records if records is not None else {self.RECORD: {"pass_id": self.PASS_ID, "frozen_rows": frozen_rows}}
        for name, spec in records.items():
            pinned = spec["frozen_rows"]
            closures = []
            for index, row in enumerate(rows, 1):
                if list_in_record and row.get("supplemental_pass", {}).get("record") == name and "replaces_matrix_line" in row:
                    closures.append({
                        "appended_line": index,
                        "appended_row_sha256": pm_audit_closure.sha256_text(lines[index - 1]),
                        "replaces_matrix_line": row["replaces_matrix_line"],
                    })
            (self.audit_dir / name).write_text(json.dumps({
                "schema_id": "pm.audit_supplemental_closure_pass.v1",
                "pass_id": spec["pass_id"],
                "audit_id": "audit-replace",
                "matrix": {
                    "path": "repair_closure_matrix.jsonl",
                    "original_rows": pinned,
                    "original_sha256": pm_audit_closure.sha256_text("".join(text + "\n" for text in lines[:pinned])),
                },
                "closures": closures,
            }, sort_keys=True), encoding="utf-8")

    def validate(self) -> dict:
        return pm_audit_closure.validate_audit_dir(
            self.audit_dir, require_matrix=True, require_effective_status=False,
            source_artifacts=None, registry_path=self.registry,
        )

    def frozen_link_error(self, report: dict) -> bool:
        return any(":1: registry row finding_key does not match matrix finding_key" in error for error in report["errors"])

    def refusals(self, report: dict) -> list[str]:
        return [error for error in report["errors"] if "does not replace" in error or "more than one replacing row" in error]

    # -- the rules --------------------------------------------------------------------------
    def test_unreplaced_bad_frozen_link_still_fails(self) -> None:
        self.write([self.frozen])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report), report["errors"])
        self.assertNotIn("matrix_replacements", report)

    def test_valid_replacement_is_judged_instead_of_the_frozen_link(self) -> None:
        frozen_line = self.line(self.frozen)
        self.write([self.frozen, self.replacing_row()])
        report = self.validate()
        self.assertEqual(report["errors"], [])
        self.assertEqual(report["matrix_replacements"], [{"replaced_line": 1, "replacing_line": 2}])
        # The frozen row stays as history, and the replacement adds no second closure.
        self.assertEqual((self.audit_dir / "repair_closure_matrix.jsonl").read_text(encoding="utf-8").split("\n")[0], frozen_line)
        self.assertEqual(report["status_counts"], {"repaired": 1})
        self.assertEqual(report["repair_required_count"], 0)
        self.assertEqual(report["terminal_repair_state"], "repair_validated")

    def test_replacement_of_an_unknown_line_is_refused(self) -> None:
        self.write([self.frozen, self.replacing_row(target=7)])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("line 7 is not a matrix row" in error for error in self.refusals(report)), report["errors"])

    def test_replacing_row_inside_the_pinned_prefix_is_refused(self) -> None:
        # A record that pins line 2 as frozen makes line 2 history, not an appended correction.
        self.write([self.frozen, self.replacing_row(target=1)], frozen_rows=2)
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("must be appended after the 2 frozen rows" in error for error in self.refusals(report)))

    def test_replacement_of_a_line_after_the_pinned_prefix_is_refused(self) -> None:
        appended = closure_matrix_row(self.audit_refs, self.finding)
        appended["registry_closure_id"] = "closure-old"
        self.write([self.frozen, appended, self.replacing_row(target=2)])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("line 2 is not one of the 1 frozen rows" in error for error in self.refusals(report)), report["errors"])
        self.assertNotIn("matrix_replacements", report)

    def test_replacement_of_a_non_frozen_row_is_refused(self) -> None:
        appended = closure_matrix_row(self.audit_refs, self.finding)
        appended.update({"registry_closure_id": "closure-old",
                         "supplemental_pass": {"pass_id": "earlier-pass", "record": "supplemental_closure_pass-20261105.json"}})
        self.write([appended, self.replacing_row(target=1)])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("is an appended or replacing row" in error for error in self.refusals(report)), report["errors"])

    def test_duplicate_replacements_are_refused(self) -> None:
        self.write([self.frozen, self.replacing_row(), self.replacing_row(closure_reason="second correction (test)")])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("is named by more than one replacing row (lines 2, 3)" in error for error in self.refusals(report)))
        self.assertNotIn("matrix_replacements", report)

    def test_a_replacement_is_never_itself_replaced(self) -> None:
        # A later pass that pins the first replacement as part of its own prefix still cannot replace it.
        later = "supplemental_closure_pass-20261115.json"
        rows = [self.frozen, self.replacing_row(), self.replacing_row(target=2, record=later, pass_id="later-pass")]
        self.write(rows, records={self.RECORD: {"pass_id": self.PASS_ID, "frozen_rows": 1},
                                  later: {"pass_id": "later-pass", "frozen_rows": 2}})
        report = self.validate()
        self.assertTrue(any(":3: does not replace" in error and "never itself replaced" in error for error in report["errors"]))
        # The first replacement still holds; the chain adds nothing.
        self.assertFalse(self.frozen_link_error(report))
        self.assertEqual(report["matrix_replacements"], [{"replaced_line": 1, "replacing_line": 2}])

    def test_replacing_row_whose_own_link_does_not_hold_is_not_honored(self) -> None:
        self.registry_rows[1]["closed_by_audit_id"] = "another-audit"
        self.registry_rows[1]["audit_ids"] = ["another-audit"]
        self.write([self.frozen, self.replacing_row()])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any(":2: does not replace line 1" in error and "own registry link does not hold" in error
                            for error in report["errors"]), report["errors"])
        self.assertTrue(any(":2: registry row closed_by_audit_id does not match" in error for error in report["errors"]))
        self.assertNotIn("matrix_replacements", report)

    def test_replacing_row_whose_identity_differs_from_its_registry_closure_is_not_honored(self) -> None:
        # Same finding_key string on both rows, but one side's identity gives another deterministic key.
        for side in ("matrix", "registry"):
            with self.subTest(side=side):
                self.registry_rows[1] = {**registry_row(self.audit_refs, self.corrected, "closure-new"), **self.corrected}
                if side == "registry":
                    self.registry_rows[1]["owner_docs"] = ["Plans/Other.md"]
                    replacing = self.replacing_row()
                else:
                    replacing = self.replacing_row(owner_docs=["Plans/Other.md"])
                self.write([self.frozen, replacing])
                report = self.validate()
                self.assertTrue(self.frozen_link_error(report))
                self.assertTrue(any("own registry link does not hold" in error for error in report["errors"]), report["errors"])
                self.assertNotIn("matrix_replacements", report)

    def test_replacement_must_bind_the_frozen_bytes(self) -> None:
        self.write([self.frozen, self.replacing_row()], bind=False)
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("does not match the exact bytes of line 1" in error for error in self.refusals(report)))

    def test_replacement_must_be_listed_in_its_pass_record(self) -> None:
        self.write([self.frozen, self.replacing_row()], list_in_record=False)
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("must list this replacement once" in error for error in self.refusals(report)))

    def test_replacement_needs_its_pass_record(self) -> None:
        self.write([self.frozen, self.replacing_row()], records={})
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("is missing or reached through a symbolic link" in error for error in self.refusals(report)))

    def test_pass_record_must_pin_the_frozen_prefix(self) -> None:
        self.write([self.frozen, self.replacing_row()])
        record_path = self.audit_dir / self.RECORD
        record = json.loads(record_path.read_text(encoding="utf-8"))
        record["matrix"]["original_sha256"] = "f" * 64
        record_path.write_text(json.dumps(record), encoding="utf-8")
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("are not the bytes its supplemental pass record pinned" in error for error in self.refusals(report)))

    def test_replacement_keeps_the_source_row_and_closure_status(self) -> None:
        for changes, expected in (({"source_row": 2}, "must close the same source row as line 1"),
                                  ({"closure_status": "false_positive"}, "must keep the closure_status of line 1")):
            with self.subTest(changes=changes):
                if "closure_status" in changes:
                    self.registry_rows[1]["closure_status"] = "false_positive"
                self.write([self.frozen, self.replacing_row(**changes)])
                report = self.validate()
                self.assertTrue(self.frozen_link_error(report))
                self.assertTrue(any(expected in error for error in self.refusals(report)), report["errors"])
                self.registry_rows[1]["closure_status"] = "repaired"

    def test_replacement_fields_need_a_reason(self) -> None:
        self.write([self.frozen, self.replacing_row(replacement_reason=" ")])
        report = self.validate()
        self.assertTrue(self.frozen_link_error(report))
        self.assertTrue(any("replacement_reason must be non-empty" in error for error in self.refusals(report)))


class PmAuditClosureLegacyReplacementCoverageTests(unittest.TestCase):
    """A replacing row stands in for its frozen row: it adds no over-coverage of a non-actionable source row."""

    NAME = "audit-20260617-099-replacement-coverage"

    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory(prefix="pm-matrix-replace-legacy-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name).resolve()
        patcher = patch.object(pm_audit_closure, "ROOT", self.root)
        patcher.start()
        self.addCleanup(patcher.stop)
        frozen_files = ["audit_report.json", "repair_closure_matrix.jsonl", "semantic_risks.jsonl"]
        patcher = patch.object(pm_audit_closure, "legacy_audit_state",
                               lambda audit_dir: {"historical_matrix_lines": 1, "frozen_files": list(frozen_files)})
        patcher.start()
        self.addCleanup(patcher.stop)
        self.audit_dir = self.root / "Plans" / ".audits" / self.NAME
        self.audit_dir.mkdir(parents=True)
        self.registry = self.root / "Plans" / ".audits" / "_semantic_closure_registry.jsonl"
        self.audit_refs = refs(self.NAME)
        write_audit_report(self.audit_dir, self.audit_refs, status="PASS_WITH_WARNINGS", repair_required_count=0)
        # A June-style row: neither repair_required nor finding_level, so the inference judges it (non-actionable).
        source = {**self.audit_refs, "classification": "source_lineage_only", "finding_family": "test_family",
                  "source_atom_ids": ["atom-0001"], "plan_unit_ids": ["PU-001"], "owner_docs": ["Plans/Test.md"],
                  "detail_keys": ["detail"], "exact_tokens": ["token"]}
        source["finding_key"] = pm_audit_closure.compute_finding_key(source)
        write_jsonl(self.audit_dir / "semantic_risks.jsonl", [source])
        write_complete_scope(self.audit_dir, self.audit_refs, finding_keys=[source["finding_key"]])
        self.source = source
        self.corrected = replacement_identity(source, owner_docs=["Plans/Corrected.md"])

    def run_case(self, appended: dict | None) -> dict:
        frozen = closure_matrix_row(self.audit_refs, self.source)
        frozen["registry_closure_id"] = "closure-old"
        frozen_line = json.dumps(frozen, sort_keys=True)
        lines = [frozen_line]
        if appended is not None:
            if "replaces_matrix_line" in appended:
                appended["replaces_row_sha256"] = pm_audit_closure.sha256_text(frozen_line)
            lines.append(json.dumps(appended, sort_keys=True))
        (self.audit_dir / "repair_closure_matrix.jsonl").write_text("".join(text + "\n" for text in lines), encoding="utf-8")
        (self.audit_dir / "supplemental_closure_pass-20261114.json").write_text(json.dumps({
            "schema_id": "pm.audit_supplemental_closure_pass.v1",
            "pass_id": "legacy-replace-pass",
            "audit_id": self.NAME,
            "matrix": {"path": "repair_closure_matrix.jsonl", "original_rows": 1,
                       "original_sha256": pm_audit_closure.sha256_text(frozen_line + "\n")},
            "closures": [{"appended_line": 2, "appended_row_sha256": pm_audit_closure.sha256_text(lines[-1]),
                          "replaces_matrix_line": 1}] if len(lines) == 2 else [],
        }), encoding="utf-8")
        write_jsonl(self.registry, [
            {**registry_row(self.audit_refs, self.corrected, closure_id), **self.corrected}
            for closure_id in ("closure-old", "closure-new")
        ])
        return pm_audit_closure.validate_audit_dir(
            self.audit_dir, require_matrix=True, require_effective_status=False,
            source_artifacts=["semantic_risks.jsonl"], registry_path=self.registry,
        )

    def corrected_row(self, **extra) -> dict:
        row = closure_matrix_row(self.audit_refs, self.source)
        row.update({field: copy.deepcopy(value) for field, value in self.corrected.items()})
        row.update({"registry_closure_id": "closure-new", "closure_reason": "corrected (test)",
                    "supplemental_pass": {"pass_id": "legacy-replace-pass", "record": "supplemental_closure_pass-20261114.json"}})
        row.update(extra)
        return row

    def over_coverage_kept(self, report: dict) -> bool:
        return any("non-actionable source rows" in error for error in report["errors"])

    def test_replacing_row_adds_no_over_coverage(self) -> None:
        before = self.run_case(None)
        self.assertFalse(self.over_coverage_kept(before), before["errors"])
        self.assertEqual(before["legacy_format_rule"]["demoted_by_kind"].get("inferred_actionability_over_coverage"), 1)
        self.assertTrue(any(":1: registry row finding_key does not match" in error for error in before["errors"]))

        replaced = self.run_case(self.corrected_row(replaces_matrix_line=1, replacement_reason="corrected owner (test)"))
        self.assertEqual(replaced["errors"], [])
        self.assertEqual(replaced["matrix_replacements"], [{"replaced_line": 1, "replacing_line": 2}])
        self.assertEqual(replaced["legacy_format_rule"]["demoted_by_kind"].get("inferred_actionability_over_coverage"), 1)

        # The same row appended without naming the frozen row is a second, newer closure: over-coverage is kept.
        appended = self.run_case(self.corrected_row())
        self.assertTrue(self.over_coverage_kept(appended), appended["errors"])


if __name__ == "__main__":
    unittest.main()
