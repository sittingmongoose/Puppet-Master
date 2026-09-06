"""Synthetic source-census and merge tests; never implementation judgments."""

from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_packet_audit_census import (
    CURRENT_SCHEMA, LEGACY_SCHEMA, TOUCH_GROUP, build_census_contract,
    validate_manifest_census, validate_source_freeze,
)


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


AUDIT = load("census_audit", "pm-integration-packet-audit.py")
WORK = load("census_work", "pm-integration-packet-audit-work.py")


def repin(manifest):
    """Model a self-consistent edit, which must still fail source comparison."""
    counts = {}
    for group in manifest["groups"]:
        cases = group["cases"]
        group["actual_count"] = len(cases)
        group["identifier_set_sha256"] = AUDIT.sha256_values(
            case["case_id" if group["group_id"] == TOUCH_GROUP else "source_identifier"] for case in cases)
        group["case_content_sha256"] = AUDIT.sha256_values(
            json.dumps(case, sort_keys=True, separators=(",", ":")) for case in cases)
        counts[group["suite"]] = counts.get(group["suite"], 0) + len(cases)
        if group["group_id"] == TOUCH_GROUP:
            source = group["source"]
            source.update(row_count=len(source["touch_ids"]), dimension_count=len(source["dimensions"]),
                          case_count=len(source["touch_ids"]) * len(source["dimensions"]))
    manifest.update(case_count=sum(counts.values()), group_count=len(manifest["groups"]),
                    suite_case_counts=counts, applicability_counts={"retained": sum(counts.values())})
    manifest["census_contract"] = build_census_contract(manifest["groups"], manifest["spec_sha256"])


def synthetic_manifest():
    packet = {"group_id": "packet", "suite": "settings", "extractor": "synthetic",
              "source": {"source_sha256": "a" * 64}, "cases": []}
    for name in ("P1", "P2"):
        packet["cases"].append({"case_id": name, "source_identifier": name,
                                "source_ref": f"synthetic://packet#{name}", "source_line": None,
                                "description": "Synthetic test case, not a product requirement.",
                                "metadata": {}, "applicability": "retained"})
    touch = {"group_id": TOUCH_GROUP, "suite": "touch_closure", "extractor": TOUCH_GROUP,
             "source": {"path": "Plans/touch_closure.json", "sha256": "b" * 64,
                        "touch_ids": ["T1", "T2"], "dimensions": ["owner", "test"]}, "cases": []}
    for name in touch["source"]["touch_ids"]:
        for dimension in touch["source"]["dimensions"]:
            touch["cases"].append({"case_id": f"{name}/{dimension}", "source_identifier": name,
                                   "source_ref": f"Plans/touch_closure.json#{name}", "source_line": None,
                                   "description": "Synthetic test case, not a product requirement.",
                                   "metadata": {"dimension": dimension}, "applicability": "retained"})
    manifest = {"schema_id": CURRENT_SCHEMA, "schema_version": "2.0.0", "spec_sha256": "c" * 64,
                "source_census_valid": True, "source_census_failures": [], "groups": [packet, touch],
                "required_suite_verdicts": ["settings", "touch_closure", "overall"]}
    repin(manifest)
    return manifest


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value), encoding="utf-8")


class CensusTests(unittest.TestCase):
    def setUp(self):
        self.manifest = synthetic_manifest()
        self.current = copy.deepcopy(self.manifest)

    def test_dynamic_product_and_packet_count_validate_without_legacy_total(self):
        self.assertEqual(self.manifest["case_count"], 6)
        self.assertEqual(validate_manifest_census(self.manifest), [])
        self.assertEqual(AUDIT.validate_manifest_snapshot(self.manifest), [])
        self.assertEqual(validate_source_freeze(self.manifest, self.current), [])

    def test_legacy_count_stays_fixed_and_unknown_version_is_rejected(self):
        old = {"schema_id": LEGACY_SCHEMA, "schema_version": "1.0.0", "case_count": 8252}
        self.assertEqual(validate_manifest_census(old), [])
        old["case_count"] -= 1
        self.assertIn("exactly 8252", validate_manifest_census(old)[0])
        for key, value in (("schema_id", "unknown"), ("schema_version", "3.0.0")):
            altered = copy.deepcopy(self.manifest)
            altered[key] = value
            self.assertTrue(validate_manifest_census(altered))

    def test_dropped_cell_fails_even_with_recomputed_totals_and_hashes(self):
        self.manifest["groups"][-1]["cases"].pop()
        repin(self.manifest)
        self.assertTrue(any("row-by-dimension product" in item for item in validate_manifest_census(self.manifest)))

    def test_dropped_whole_row_or_dimension_cannot_be_self_repinned(self):
        for field, removed in (("touch_ids", "T2"), ("dimensions", "test")):
            altered = copy.deepcopy(self.current)
            touch = altered["groups"][-1]
            touch["source"][field].remove(removed)
            touch["cases"] = [case for case in touch["cases"]
                              if (case["source_identifier"] if field == "touch_ids" else case["metadata"]["dimension"]) != removed]
            repin(altered)
            self.assertEqual(validate_manifest_census(altered), [])
            self.assertTrue(validate_source_freeze(altered, self.current))

    def test_packet_omission_or_same_count_content_rewrite_rejected_against_source(self):
        for mutation in (lambda group: group["cases"].pop(),
                         lambda group: group["cases"][0].update(description="Self-repinned omission")):
            altered = copy.deepcopy(self.current)
            mutation(altered["groups"][0])
            repin(altered)
            self.assertEqual(validate_manifest_census(altered), [])
            self.assertTrue(validate_source_freeze(altered, self.current))
        self.manifest["groups"].pop(0)
        repin(self.manifest)
        self.assertTrue(any("group set" in item for item in validate_source_freeze(self.manifest, self.current)))

    def test_duplicate_or_empty_rows_dimensions_and_cases_are_rejected(self):
        for field in ("touch_ids", "dimensions"):
            for replacement in ([], ["duplicate", "duplicate"], [""]):
                altered = copy.deepcopy(self.current)
                altered["groups"][-1]["source"][field] = replacement
                self.assertTrue(validate_manifest_census(altered))
        self.manifest["groups"][-1]["cases"].append(copy.deepcopy(self.manifest["groups"][-1]["cases"][0]))
        self.assertTrue(validate_manifest_census(self.manifest))

    def test_source_and_contract_hash_drift_is_rejected(self):
        for key in ("spec_sha256",):
            altered = copy.deepcopy(self.current)
            altered[key] = "d" * 64
            repin(altered)
            self.assertTrue(validate_source_freeze(altered, self.current))
        self.manifest["census_contract"]["total_case_count"] = 5
        self.assertTrue(validate_manifest_census(self.manifest))
        altered = copy.deepcopy(self.current)
        altered["groups"][-1]["source"]["sha256"] = "d" * 64
        repin(altered)
        self.assertTrue(validate_source_freeze(altered, self.current))

    def test_row_dimension_metadata_cannot_change_identity(self):
        self.manifest["groups"][-1]["cases"][0]["metadata"]["dimension"] = "other"
        repin(self.manifest)
        self.assertTrue(any("identity mismatch" in item for item in validate_manifest_census(self.manifest)))

    def test_counts_and_contract_shape_are_strict(self):
        for value in (True, "6", 6.0):
            altered = copy.deepcopy(self.current)
            altered["case_count"] = value
            self.assertTrue(validate_manifest_census(altered))
        self.manifest["census_contract"]["unknown"] = "not admitted"
        self.assertTrue(validate_manifest_census(self.manifest))

    def test_source_verdict_or_group_constraint_drift_is_rejected(self):
        self.manifest["required_suite_verdicts"].remove("settings")
        self.assertTrue(validate_source_freeze(self.manifest, self.current))
        altered = copy.deepcopy(self.current)
        altered["groups"][0]["minimum_count"] = 0
        self.assertTrue(validate_source_freeze(altered, self.current))

    def test_extractor_rejects_duplicate_ids_and_dimensions(self):
        for registry, dimensions in (({"touches": [{"touch_id": "T1"}, {"touch_id": "T1"}]}, ["a"]),
                                     ({"touches": [{"touch_id": "T1"}]}, ["a", "a"]),
                                     ({"touches": [{"touch_id": ""}]}, ["a"])):
            with mock.patch.object(AUDIT, "load_json", return_value=registry), self.assertRaises(AUDIT.AuditError):
                AUDIT.touch_cases({"touch_closure_dimensions": dimensions})

    def test_work_preparation_rejects_self_repinned_source_drift(self):
        self.manifest["groups"][0]["cases"].pop()
        repin(self.manifest)
        with tempfile.TemporaryDirectory(prefix="pm-census-test-") as temp:
            directory = Path(temp)
            write(directory / "audit_manifest.json", self.manifest)
            with mock.patch.object(WORK, "current_source_manifest", return_value=self.current):
                with self.assertRaisesRegex(WORK.WorkError, "drift"):
                    WORK.prepare(directory, 2)
            self.assertFalse((directory / WORK.WORK_DIR).exists())

    def test_dynamic_prepare_status_merge_and_report_preserve_synthetic_blocked(self):
        with tempfile.TemporaryDirectory(prefix="pm-census-merge-test-") as temp:
            directory = Path(temp)
            write(directory / "audit_manifest.json", self.manifest)
            manifest_sha = AUDIT.sha256_file(directory / "audit_manifest.json")
            template = AUDIT.build_report_template(self.manifest)
            template["manifest_sha256"] = manifest_sha
            write(directory / "audit_report.template.json", template)
            with mock.patch.object(WORK, "current_source_manifest", return_value=self.current):
                prepared = WORK.prepare(directory, 2)
                self.assertEqual(prepared["case_count"], 6)
                _, _, status = WORK.collect(directory)
                self.assertEqual(status["missing_case_count"], 6)
                self.assertFalse(status["complete"])
                with self.assertRaisesRegex(WORK.WorkError, "incomplete"):
                    WORK.merge(directory)
                timestamp = "2026-09-06T00:00:00+00:00"
                for path in (directory / WORK.WORK_DIR / WORK.CHUNKS_DIR).glob("*.json"):
                    chunk = json.loads(path.read_text())
                    results = [{"case_ref": case["case_ref"], "case_id": case["case_id"],
                                "source_identifier": case["source_identifier"], "source_ref": case["source_ref"],
                                "source_line": case["source_line"], "suite": chunk["suite"], "applicability": "retained",
                                "status": "blocked", "evidence_refs": [], "findings": ["Synthetic harness only"],
                                "residual_risk": "No implementation was reviewed.", "reviewer": "synthetic-census-test",
                                "checked_at": timestamp} for case in chunk["cases"]]
                    write(directory / chunk["result_relative_path"], {
                        "chunk_id": chunk["chunk_id"], "manifest_sha256": manifest_sha,
                        "reviewer": "synthetic-census-test", "checked_at": timestamp,
                        "review_method": WORK.REVIEW_METHOD, "review_receipt_ref": f"synthetic://{chunk['chunk_id']}",
                        "case_results": results})
                write(directory / WORK.WORK_DIR / WORK.RESULTS_DIR / WORK.METADATA_NAME, {
                    "manifest_sha256": manifest_sha, "implementation_freeze_ref": "synthetic://no-implementation",
                    "suite_verdicts": {suite: {"verdict": "blocked", "evidence_refs": [], "residual_risk": "Synthetic only"}
                                       for suite in self.manifest["required_suite_verdicts"]},
                    "aggregate_verdict": "blocked", "blockers": ["Synthetic harness only"],
                    "unresolved_findings": [], "reviewers": ["synthetic-census-test"]})
                self.assertTrue(WORK.collect(directory)[2]["complete"])
                self.assertEqual(WORK.merge(directory)["aggregate_verdict"], "blocked")
                report = json.loads((directory / WORK.COMPLETED_NAME).read_text())
                self.assertEqual(report["case_count"], 6)
                self.assertEqual(AUDIT.validate_report(self.manifest, report), [])
                self.assertEqual(json.loads((directory / "audit_report.template.json").read_text()), template)
                with self.assertRaisesRegex(WORK.WorkError, "overwrite"):
                    WORK.merge(directory)


if __name__ == "__main__":
    unittest.main()
