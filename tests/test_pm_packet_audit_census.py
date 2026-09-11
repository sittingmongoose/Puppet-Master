"""Synthetic source-census and merge tests; never implementation judgments."""

from __future__ import annotations

import copy
import hashlib
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
# dataclasses require their defining module to be registered under importlib.
_custody_spec = importlib.util.spec_from_file_location("census_custody", ROOT / "scripts/pm-source-slice-coverage.py")
CUSTODY = importlib.util.module_from_spec(_custody_spec)
sys.modules[_custody_spec.name] = CUSTODY
_custody_spec.loader.exec_module(CUSTODY)


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


class MultiCustodyTests(unittest.TestCase):
    """Synthetic custody fixtures, never packet review judgments."""

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="pm-multi-custody-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def source(self, name="source", content="- Synthetic custody obligation.\n"):
        source = self.root / name
        source.mkdir()
        data = content.encode()
        (source / "README.md").write_bytes(data)
        write(source / "manifest.json", {"files": [{
            "path": "README.md", "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
        }]})
        return source, hashlib.sha256((source / "manifest.json").read_bytes()).hexdigest()

    def corpus(self, name="source", content="- Synthetic custody obligation.\n"):
        source, digest = self.source(name, content)
        output = self.root / (name + "-custody")
        CUSTODY.Materializer(output).run_manifest_directory(source, digest)
        self.assertEqual(CUSTODY.verify(output), [])
        return output

    def test_manifested_directory_freezes_only_exact_declared_inputs_and_provenance(self):
        source, digest = self.source()
        (source / "unlisted-scratch.md").write_text("Not part of this synthetic packet.")
        output = self.root / "custody"
        CUSTODY.Materializer(output).run_manifest_directory(source, digest)
        inventory = json.loads((output / "inventory.json").read_text())
        self.assertEqual(len(inventory["entries"]), 2)
        self.assertFalse(any("unlisted" in entry["logical_path"] for entry in inventory["entries"]))
        self.assertEqual(inventory["top_level_archive_count"], 0)
        provenance = json.loads((output / "directory_source.json").read_text())
        self.assertEqual(provenance["source_kind"], "manifested_directory_not_original_archive")
        self.assertEqual(provenance["manifest_sha256"], digest)
        self.assertTrue(AUDIT.SliceCorpus(output).verify_all()["valid"])

    def test_changed_manifest_or_member_fails_before_creating_output(self):
        for mutation in ("manifest", "member"):
            source, digest = self.source(mutation)
            if mutation == "manifest":
                digest = "0" * 64
            else:
                (source / "README.md").write_text("Different source bytes.\n")
            output = self.root / (mutation + "-out")
            with self.assertRaises(CUSTODY.CustodyError):
                CUSTODY.Materializer(output).run_manifest_directory(source, digest)
            self.assertFalse(output.exists())

    def test_duplicate_or_escaping_directory_members_are_rejected(self):
        for mutation in ("duplicate", "escape"):
            source, _ = self.source(mutation)
            manifest = json.loads((source / "manifest.json").read_text())
            if mutation == "duplicate":
                manifest["files"].append(copy.deepcopy(manifest["files"][0]))
            else:
                manifest["files"][0]["path"] = "../outside.md"
            write(source / "manifest.json", manifest)
            digest = hashlib.sha256((source / "manifest.json").read_bytes()).hexdigest()
            output = self.root / (mutation + "-out")
            with self.assertRaises(CUSTODY.CustodyError):
                CUSTODY.Materializer(output).run_manifest_directory(source, digest)
            self.assertFalse(output.exists())

    def test_retained_output_cannot_be_overwritten(self):
        source, digest = self.source()
        output = self.root / "retained"
        output.mkdir()
        sentinel = output / "sentinel.txt"
        sentinel.write_text("Keep exact synthetic evidence")
        with self.assertRaisesRegex(CUSTODY.CustodyError, "already exists"):
            CUSTODY.Materializer(output).run_manifest_directory(source, digest)
        self.assertEqual(sentinel.read_text(), "Keep exact synthetic evidence")

    def test_duplicate_document_ids_and_invalid_slice_ceiling_fail_closed(self):
        for mutation in ("duplicate", "ceiling", "count"):
            output = self.corpus(mutation)
            path = output / "slice_coverage.json"
            coverage = json.loads(path.read_text())
            if mutation == "duplicate":
                coverage["documents"].append(copy.deepcopy(coverage["documents"][0]))
                coverage["document_count"] += 1
            elif mutation == "ceiling":
                coverage["max_lines_per_slice"] = 221
            else:
                coverage["document_count"] += 1
            write(path, coverage)
            with self.assertRaises(AUDIT.AuditError):
                AUDIT.SliceCorpus(output)

    def test_raw_and_slice_bytes_are_joined_not_just_self_repinned(self):
        output = self.corpus()
        coverage_path = output / "slice_coverage.json"
        coverage = json.loads(coverage_path.read_text())
        document = coverage["documents"][0]
        item = document["slices"][0]
        changed = b"- Substituted synthetic requirement.\n"
        (output / item["slice_relative_path"]).write_bytes(changed)
        item["sha256"] = hashlib.sha256(changed).hexdigest()
        write(coverage_path, coverage)
        check = AUDIT.SliceCorpus(output).verify_all()
        self.assertFalse(check["valid"])
        self.assertTrue(any("raw source bounds" in failure for failure in check["failures"]))

    def test_empty_and_overlapping_long_documents_are_verified(self):
        for name, content in (("empty", ""), ("long", "line\n" * 451)):
            corpus = AUDIT.SliceCorpus(self.corpus(name, content))
            self.assertTrue(corpus.verify_all()["valid"])
            self.assertEqual(len(list(corpus.lines("DOC-0001"))), len(content.splitlines()))

    def test_custody_paths_cannot_escape_root(self):
        corpus = AUDIT.SliceCorpus(self.corpus())
        for path in ("../outside", "/absolute/outside"):
            with self.assertRaises(AUDIT.AuditError):
                corpus.file(path)
        (corpus.root / "linked-source").symlink_to(self.root, target_is_directory=True)
        with self.assertRaisesRegex(AUDIT.AuditError, "symlink"):
            corpus.file("linked-source/hidden.txt")

    def test_two_corpora_preserve_independent_duplicate_document_ids(self):
        first, second = self.corpus("first"), self.corpus("second", "- Another synthetic obligation.\n")
        spec = {
            "custody_roots": {"first": str(first), "second": str(second)},
            "default_custody_id": "first",
            "source_groups": [
                {"group_id": "first_group", "suite": "settings", "document_id": "DOC-0001",
                 "extractor": "markdown_obligation", "expected_count": 1},
                {"group_id": "second_group", "suite": "settings", "document_id": "DOC-0001",
                 "custody_id": "second", "extractor": "markdown_obligation", "expected_count": 1},
            ],
            "touch_closure_dimensions": ["owner"],
            "required_suite_verdicts": ["settings", "touch_closure", "overall"],
        }
        spec_path, touch_path = self.root / "spec.json", self.root / "touch.json"
        write(spec_path, spec)
        write(touch_path, {"row_columns": ["touch_id"], "rows": [["SYNTHETIC-TOUCH"]]})
        with mock.patch.object(AUDIT, "SPEC_PATH", spec_path), mock.patch.object(AUDIT, "TOUCH_PATH", touch_path):
            manifest = AUDIT.build_manifest()
            self.assertTrue(manifest["source_census_valid"], manifest["source_census_failures"])
            self.assertEqual(manifest["case_count"], 3)
            self.assertEqual(manifest["source_coverage"]["document_count"], 4)
            self.assertNotEqual(manifest["groups"][0]["source"], manifest["groups"][1]["source"])
            self.assertEqual(manifest["implementation_verdict"], "not_run")
            spec["source_groups"][1]["custody_id"] = "unknown"
            write(spec_path, spec)
            with self.assertRaisesRegex(AUDIT.AuditError, "unknown custody_id"):
                AUDIT.build_manifest()

    def test_raw_and_slice_identity_are_revalidated_on_actual_consumption(self):
        for mutation in ("raw", "slice"):
            output = self.corpus("reread-" + mutation)
            corpus = AUDIT.SliceCorpus(output)
            self.assertTrue(corpus.verify_all()["valid"])
            document = corpus.documents["DOC-0001"]
            relative = document["raw_relative_path"] if mutation == "raw" else document["slices"][0]["slice_relative_path"]
            (output / relative).write_bytes(b"- Changed after verification.\n")
            with self.subTest(mutation=mutation), self.assertRaises(AUDIT.AuditError):
                list(corpus.lines("DOC-0001"))

    def test_checked_path_cannot_later_escape_by_symlink_swap(self):
        output = self.corpus()
        corpus = AUDIT.SliceCorpus(output)
        document = corpus.documents["DOC-0001"]
        relative = document["slices"][0]["slice_relative_path"]
        path = corpus.file(relative)
        outside = self.root / "outside-same-bytes.md"
        outside.write_bytes(path.read_bytes())
        path.unlink()
        path.symlink_to(outside)
        with self.assertRaisesRegex(AUDIT.AuditError, "symlink"):
            list(corpus.lines("DOC-0001"))

    def test_empty_source_cannot_hide_nonempty_slice_or_byte_count(self):
        for mutation in ("slice", "size"):
            output = self.corpus("empty-negative-" + mutation, "")
            path = output / "slice_coverage.json"
            coverage = json.loads(path.read_text())
            doc = coverage["documents"][0]
            if mutation == "slice":
                (output / doc["slices"][0]["slice_relative_path"]).write_bytes(b"not empty")
            else:
                doc["source_bytes"] = 1
                write(path, coverage)
            self.assertFalse(AUDIT.SliceCorpus(output).verify_all()["valid"])

    def test_invalid_custody_fails_before_case_extraction(self):
        output = self.corpus()
        corpus = AUDIT.SliceCorpus(output)
        document = corpus.documents["DOC-0001"]
        (output / document["raw_relative_path"]).write_bytes(b"changed raw source")
        with mock.patch.object(AUDIT, "load_json", return_value={}), \
                mock.patch.object(AUDIT, "load_corpora", return_value=({"synthetic": corpus}, "synthetic")), \
                mock.patch.object(AUDIT, "extract_cases") as extract, \
                self.assertRaisesRegex(AUDIT.AuditError, "custody is invalid"):
            AUDIT.build_manifest()
        extract.assert_not_called()

    def test_prepare_supports_external_output_without_review_promotion(self):
        manifest = synthetic_manifest()
        output = self.root / "external-workbook"
        with mock.patch.object(AUDIT, "build_manifest", return_value=manifest), \
                mock.patch.object(AUDIT, "build_reference_review", return_value={}):
            result = AUDIT.prepare(output)
        self.assertEqual(result["manifest"], str(output / "audit_manifest.json"))
        self.assertEqual(result["implementation_verdict"], "not_run")
        self.assertFalse((output / AUDIT.COMPLETED_REPORT_NAME).exists())

    def test_combined_source_scopes_preserve_shared_and_exact_prefix_areas(self):
        group = {"group_id": "synthetic_combined", "case_metadata": {"area": "shared"},
                 "area_by_id_prefix": {"FLOW-": "onboarding", "TOUR-": "tour",
                                       "DOC-": "doctor"}}
        for identifier, expected in (("FLOW-001", "onboarding"), ("TOUR-001", "tour"),
                                     ("DOC-001", "doctor"), ("SHARED-001", "shared")):
            case = {"case_id": identifier, "metadata": {}}
            AUDIT.apply_case_metadata(group, case)
            self.assertEqual(case["metadata"], {"area": expected})

    def test_combined_scope_cannot_overwrite_source_or_ambiguous_prefix(self):
        for group, metadata in (
            ({"case_metadata": {"area": "shared"}}, {"area": "doctor"}),
            ({"area_by_id_prefix": {"FLOW-": "onboarding"}}, {"area": "doctor"}),
            ({"area_by_id_prefix": {"FLOW": "onboarding", "FLOW-": "doctor"}}, {}),
        ):
            with self.assertRaises(AUDIT.AuditError):
                AUDIT.apply_case_metadata({"group_id": "synthetic_combined", **group},
                                          {"case_id": "FLOW-001", "metadata": metadata})


if __name__ == "__main__":
    unittest.main()
