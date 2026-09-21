from __future__ import annotations

import hashlib
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts/pm-plan-index.py"
SPEC = importlib.util.spec_from_file_location("pm_plan_index", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
pm_plan_index = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = pm_plan_index
try:
    SPEC.loader.exec_module(pm_plan_index)
except ModuleNotFoundError as exc:
    if exc.name != "yaml":
        raise
    pm_plan_index = None


PLAN_UNIT_BLOCK_1 = """```yaml
plan_unit_id: TEST-001
owner_doc: Plans/Test.md
gui_related: false
canonical_text: First test PlanUnit.
```
"""

PLAN_UNIT_BLOCK_2 = """```yaml
plan_unit_id: TEST-002
owner_doc: Plans/Test.md
gui_related: true
canonical_text: Second test PlanUnit.
```
"""


class PmPlanIndexCacheTests(unittest.TestCase):
    @unittest.skipIf(pm_plan_index is None, "PyYAML is unavailable to this Python interpreter")
    def test_derived_diagnostics_are_repository_relative(self) -> None:
        detail = f"[Errno 2] No such file or directory: '{ROOT}/Plans/missing.json'"
        self.assertEqual(
            "[Errno 2] No such file or directory: 'Plans/missing.json'",
            pm_plan_index.portable_index_diagnostic(detail),
        )
        sibling = f"{ROOT}-other/Plans/missing.json"
        self.assertEqual(sibling, pm_plan_index.portable_index_diagnostic(sibling))

    @unittest.skipIf(pm_plan_index is None, "PyYAML is unavailable to this Python interpreter")
    def test_portable_diagnostic_preserves_currentness_failure(self) -> None:
        with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
            receipt = Path(tmp) / "receipt.json"
            receipt.write_text("{}", encoding="utf-8")
            source_failure = {
                "error": "event_authority_currentness_audit_unavailable",
                "detail": f"[Errno 2] No such file or directory: '{ROOT}/Plans/missing.json'",
            }
            with patch.object(pm_plan_index, "PNC019_CERTIFICATION_RECEIPT_PATH", receipt), \
                 patch.object(pm_plan_index, "pnc019_source_hash_failures", return_value=[]), \
                 patch.object(pm_plan_index, "pnc019_event_authority_clearance_failures", return_value=[source_failure]):
                status = pm_plan_index.pnc019_certification_status()
            self.assertFalse(status["complete"])
            failure = next(row for row in status["failures"] if row["error"] == source_failure["error"])
            self.assertEqual("[Errno 2] No such file or directory: 'Plans/missing.json'", failure["detail"])
            self.assertIn(str(ROOT), source_failure["detail"])

    @unittest.skipIf(pm_plan_index is None, "PyYAML is unavailable to this Python interpreter")
    def test_extract_plan_units_uses_cached_document_metadata(self) -> None:
        with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
            plan_doc = Path(tmp) / "Test.md"
            plan_doc.write_text(
                "\n".join(
                    [
                        "# Test Doc",
                        "",
                        "## First Heading",
                        PLAN_UNIT_BLOCK_1.rstrip(),
                        "",
                        "## Second Heading",
                        PLAN_UNIT_BLOCK_2.rstrip(),
                        "",
                    ]
                ),
                encoding="utf-8",
            )
            expected_sha = hashlib.sha256(plan_doc.read_bytes()).hexdigest()

            original_top_level_plan_docs = pm_plan_index.top_level_plan_docs
            original_sha256_file = pm_plan_index.sha256_file
            pm_plan_index.top_level_plan_docs = lambda: [plan_doc]
            pm_plan_index.sha256_file = lambda path: self.fail(f"unexpected sha256_file call for {path}")
            try:
                units, errors, docs = pm_plan_index.extract_plan_units()
            finally:
                pm_plan_index.top_level_plan_docs = original_top_level_plan_docs
                pm_plan_index.sha256_file = original_sha256_file

            self.assertEqual(errors, [])
            self.assertEqual([unit["plan_unit_id"] for unit in units], ["TEST-001", "TEST-002"])
            self.assertEqual([unit["source_doc_sha256"] for unit in units], [expected_sha, expected_sha])
            self.assertEqual([unit["source_location"]["line"] for unit in units], [4, 12])
            self.assertEqual([unit["source_location"]["heading"] for unit in units], ["First Heading", "Second Heading"])
            self.assertEqual(docs[0]["sha256"], expected_sha)
            self.assertEqual(docs[0]["line_count"], len(plan_doc.read_text(encoding="utf-8").splitlines()))


@unittest.skipIf(pm_plan_index is None, "PyYAML is unavailable to this Python interpreter")
class PmPlanUnitRetentionTests(unittest.TestCase):
    """Exercise real generation and validation against an actual Git baseline."""

    LEDGER_ID = "pldg-20260921-001-retention-test"

    def setUp(self) -> None:
        temp = tempfile.TemporaryDirectory(prefix="pm-plan-index-retention-")
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.plans = self.root / "Plans"
        self.index = self.plans / ".plan_index"
        migration = self.plans / ".plan_migration/test-run"
        migration.mkdir(parents=True)
        patches = patch.multiple(
            pm_plan_index,
            ROOT=self.root,
            PLANS=self.plans,
            INDEX_DIR=self.index,
            MIGRATION_RUN=migration,
            PNC019_CERTIFICATION_RECEIPT_PATH=self.plans / ".implementation_readiness/receipt.json",
        )
        patches.start()
        self.addCleanup(patches.stop)
        self.git("init", "--quiet")
        self.git("config", "user.name", "Retention test")
        self.git("config", "user.email", "retention-test@example.invalid")
        self.git("config", "commit.gpgsign", "false")
        self.test_doc = self.plans / "Test.md"
        self.write_units([self.unit("TEST-001"), self.unit("TEST-002")])
        bootstrap = self.unit("PNC-022", owner_doc="Plans/Plan_To_Node_Compilation.md")
        bootstrap["node_compile_hint"] = {
            "mode": "pnc019_bootstrap_authority",
            "bootstrap_authorized": True,
            "bootstrap_scope": "pnc019_certification_harness_only",
            "certification_harness_specified": True,
            "runtime_enabled": False,
            "ordinary_product_worknodes_allowed": False,
            "create_worknodes": False,
            "create_nodeseeds": False,
        }
        (self.plans / "Plan_To_Node_Compilation.md").write_text(
            "# Bootstrap fixture\n\n" + self.block(bootstrap), encoding="utf-8"
        )
        generated = pm_plan_index.generate()
        self.assertEqual(generated["status"], "pass", generated)
        self.baseline_bytes = (self.index / "plan_units.jsonl").read_text(encoding="utf-8")
        self.git("add", "--", "Plans/Test.md", "Plans/Plan_To_Node_Compilation.md", "Plans/.plan_index/plan_units.jsonl")
        self.git("commit", "--quiet", "-m", "Seed baseline PlanUnits")
        self.git("update-ref", "refs/remotes/origin/main", "HEAD")

    def git(self, *args: str) -> str:
        return subprocess.run(
            ["git", *args], cwd=self.root, check=True, text=True, capture_output=True
        ).stdout

    def unit(self, identifier: str, **overrides: object) -> dict:
        result = {
            "plan_unit_id": identifier,
            "unit_type": "requirement",
            "status": "accepted",
            "owner_doc": "Plans/Test.md",
            "canonical_text": "Retain this requirement unless its removal is explicitly accepted.",
            "risk_class": "low",
            "reasoning_tier": "standard",
            "context_scope": "owner_doc",
            "validation_surfaces": [],
            "implementation_surfaces": [],
            "gui_related": False,
            "source_lineage": [],
            "depends_on": [],
            "unblocks": [],
            "acceptance_criteria": ["The documented requirement remains available."],
            "node_compile_hint": {},
        }
        result.update(overrides)
        return result

    def block(self, unit: dict) -> str:
        return "```yaml\n" + pm_plan_index.yaml.safe_dump(unit, sort_keys=False) + "```\n"

    def write_units(self, units: list[dict]) -> None:
        self.test_doc.write_text("# Retention fixture\n\n" + "\n".join(map(self.block, units)), encoding="utf-8")

    def regenerate_and_validate(self) -> dict:
        pm_plan_index.generate()
        return pm_plan_index.validate()

    def assert_removed(self, report: dict, identifier: str = "TEST-002") -> None:
        failures = [row for row in report["failures"] if row["error"] == "plan_unit_removed_without_ledger_decision"]
        self.assertEqual([row["plan_unit_id"] for row in failures], [identifier], report)
        self.assertEqual(failures[0]["baseline_ref"], "origin/main")
        self.assertEqual(failures[0]["owner_doc"], "Plans/Test.md")
        self.assertEqual(failures[0]["path"], "Plans/Test.md")
        self.assertEqual(report["status"], "fail")

    def decision(self, **overrides: object) -> dict:
        record = {
            "schema_id": "pm.bootstrap_ledger_record.v1",
            "ledger_id": self.LEDGER_ID,
            "record_id": "dec-001",
            "decision_id": "dec-001",
            "record_type": "decision",
            "status": "accepted",
            "source_refs": [f"Plans/ledgers/v2/{self.LEDGER_ID}/source_shards/authorization.md"],
            "created_at_utc": "2026-09-21T00:00:00Z",
            "updated_at_utc": "2026-09-21T00:00:00Z",
            "decision_type": "plan_unit_removal",
            "removed_plan_unit_ids": ["TEST-002"],
            "summary": "Accept removal of the obsolete second test requirement.",
        }
        record.update(overrides)
        return record

    def write_decisions(self, records: list[dict], stream: str = "decisions.jsonl") -> None:
        ledger = self.plans / "ledgers/v2" / self.LEDGER_ID
        (ledger / "records").mkdir(parents=True, exist_ok=True)
        (ledger / "source_shards").mkdir(exist_ok=True)
        (ledger / "source_shards/authorization.md").write_text("The user accepted the recorded removal.\n", encoding="utf-8")
        (ledger / "records" / stream).write_text("".join(json.dumps(row) + "\n" for row in records), encoding="utf-8")

    def replace_baseline(self, text: str) -> None:
        (self.index / "plan_units.jsonl").write_text(text, encoding="utf-8")
        self.git("add", "--", "Plans/.plan_index/plan_units.jsonl")
        self.git("commit", "--quiet", "--allow-empty", "-m", "Set retention baseline fixture")
        self.git("update-ref", "refs/remotes/origin/main", "HEAD")

    def test_unchanged_baseline_passes_full_validation(self) -> None:
        report = pm_plan_index.validate()
        self.assertEqual(report["failures"], [], report)
        self.assertEqual(report["status"], "pass")

    def test_unquoted_backtick_parse_loss_is_also_a_retention_failure(self) -> None:
        text = self.test_doc.read_text(encoding="utf-8")
        last_criterion = text.rfind("- The documented requirement remains available.")
        self.assertGreater(last_criterion, 0)
        text = text[:last_criterion] + text[last_criterion:].replace(
            "- The documented requirement remains available.", "- `restore` remains available.", 1
        )
        self.test_doc.write_text(text, encoding="utf-8")
        report = self.regenerate_and_validate()
        self.assert_removed(report)
        self.assertIn("live_planunit_parse_errors", {row["error"] for row in report["failures"]})
        indexed = [json.loads(line)["plan_unit_id"] for line in (self.index / "plan_units.jsonl").read_text().splitlines()]
        self.assertNotIn("TEST-002", indexed)

    def test_quoted_backtick_criterion_retains_the_unit(self) -> None:
        self.write_units([self.unit("TEST-001"), self.unit("TEST-002", acceptance_criteria=["`restore` remains available."])])
        self.assertIn("'`restore` remains available.'", self.test_doc.read_text())
        report = self.regenerate_and_validate()
        self.assertEqual(report["failures"], [], report)

    def test_deleted_block_and_matching_regeneration_still_fail_retention(self) -> None:
        self.write_units([self.unit("TEST-001")])
        report = self.regenerate_and_validate()
        self.assert_removed(report)
        self.assertEqual([row["error"] for row in report["failures"]], ["plan_unit_removed_without_ledger_decision"])

    def test_accepted_exact_ledger_removal_passes_full_validation(self) -> None:
        self.write_units([self.unit("TEST-001")])
        self.write_decisions([self.decision()])
        report = self.regenerate_and_validate()
        self.assertEqual(report["failures"], [], report)

    def test_draft_superseded_and_unrelated_decisions_do_not_allow_removal(self) -> None:
        self.write_units([self.unit("TEST-001")])
        for change in [{"status": "draft"}, {"superseded_by": ["dec-002"]}, {"decision_type": "product_choice"}, {"record_type": "design_atom"}]:
            with self.subTest(change=change):
                self.write_decisions([self.decision(**change)])
                self.assert_removed(self.regenerate_and_validate())

    def test_accepted_superseding_decision_revokes_removal(self) -> None:
        self.write_units([self.unit("TEST-001")])
        replacement = self.decision(record_id="dec-002", decision_id="dec-002", decision_type="retain_plan_unit", supersedes=["dec-001"])
        self.write_decisions([self.decision(), replacement])
        self.assert_removed(self.regenerate_and_validate())

    def test_draft_superseding_decision_does_not_revoke_accepted_removal(self) -> None:
        self.write_units([self.unit("TEST-001")])
        draft = self.decision(record_id="dec-002", decision_id="dec-002", status="draft", decision_type="retain_plan_unit", supersedes=["dec-001"])
        self.write_decisions([self.decision(), draft])
        report = self.regenerate_and_validate()
        self.assertEqual(report["failures"], [], report)

    def test_removal_ids_are_exact_not_patterns_or_prose(self) -> None:
        self.write_units([self.unit("TEST-001")])
        for ids in [["TEST-*"], ["TEST-02"], ["TEST-001"], "TEST-002", []]:
            with self.subTest(ids=ids):
                self.write_decisions([self.decision(removed_plan_unit_ids=ids, summary="Remove TEST-002")])
                self.assert_removed(self.regenerate_and_validate())

    def test_prose_or_nondecision_stream_cannot_authorize_removal(self) -> None:
        self.write_units([self.unit("TEST-001")])
        self.test_doc.write_text(self.test_doc.read_text() + "\nAccepted removal: TEST-002.\n")
        self.write_decisions([self.decision()], stream="design_atoms.jsonl")
        self.assert_removed(self.regenerate_and_validate())

    def test_incomplete_decision_cannot_authorize_removal(self) -> None:
        self.write_units([self.unit("TEST-001")])
        for field in ["schema_id", "source_refs", "created_at_utc", "ledger_id", "summary"]:
            with self.subTest(missing=field):
                decision = self.decision()
                del decision[field]
                self.write_decisions([decision])
                self.assert_removed(self.regenerate_and_validate())

    def test_retired_baseline_unit_is_still_retained(self) -> None:
        rows = [json.loads(line) for line in self.baseline_bytes.splitlines()]
        next(row for row in rows if row["plan_unit_id"] == "TEST-002")["status"] = "retired"
        self.replace_baseline("".join(json.dumps(row) + "\n" for row in rows))
        self.write_units([self.unit("TEST-001")])
        self.assert_removed(self.regenerate_and_validate())

    def test_missing_origin_main_fails_closed(self) -> None:
        self.git("update-ref", "-d", "refs/remotes/origin/main")
        report = self.regenerate_and_validate()
        self.assertIn("plan_unit_retention_baseline_unavailable", {row["error"] for row in report["failures"]})
        self.assertEqual(report["status"], "fail")

    def test_missing_baseline_index_fails_closed(self) -> None:
        self.git("rm", "--quiet", "--", "Plans/.plan_index/plan_units.jsonl")
        self.git("commit", "--quiet", "-m", "Baseline without index fixture")
        self.git("update-ref", "refs/remotes/origin/main", "HEAD")
        report = self.regenerate_and_validate()
        self.assertIn("plan_unit_retention_baseline_unavailable", {row["error"] for row in report["failures"]})

    def test_malformed_empty_or_duplicate_baseline_fails_closed(self) -> None:
        first_row = self.baseline_bytes.splitlines()[0] + "\n"
        for text in ["{not-json}\n", "", "[]\n", "{}\n", first_row + first_row]:
            with self.subTest(baseline=text[:40]):
                self.replace_baseline(text)
                report = self.regenerate_and_validate()
                self.assertIn("plan_unit_retention_baseline_invalid", {row["error"] for row in report["failures"]})
                self.assertEqual(report["status"], "fail")


if __name__ == "__main__":
    unittest.main()
