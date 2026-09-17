"""Synthetic fixtures for the landing check: key normalization, the baseline diff, the branch match.

Every fixture here fails for the reason its test names. None of them run the real repository-wide
checks; the report shapes are copied from what `run-gates`, `audit-governance` and
`pm-plan-migration.py validate` actually print.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
CHECKOUT = Path("/home/someone/pm-worktrees/example-20260917")


def load_module():
    spec = importlib.util.spec_from_file_location("pm_landing_check", ROOT / "scripts" / "pm-landing-check.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


M = load_module()


def key_of(failure, check="run-gates", subcheck="verify_spec_lock", root=CHECKOUT):
    return M.normalize(check, subcheck, failure, root)["key"]


# The shapes below are the ones the three checks emit.
STALE_HASH = {
    "path": "Plans/00-plans-index.md",
    "error": "stale_hash",
    "expected": "24a7ca33ea3d19d9b98478c575ae914f2177763dc5b80f6bcf3363b012201929",
    "actual": "f64fadcc2548f34619f1bbbf06c476b9a21967fa29110062077e316591172d36",
}
SPAN_META = {
    "path": "Plans/.plan_migration/run-017/span_map.jsonl",
    "error": "current_snapshot_live_span_metadata_mismatch",
    "span_id": "00-plans-index-S0002",
    "field": "line_end",
    "expected": 89,
    "actual": 65,
}
COVERAGE = {
    "path": "Plans/.plan_migration/run-017/coverage_map.jsonl",
    "error": "current_snapshot_coverage_not_exact_same_document_planunit_set",
    "span_id": "assistant-chat-design-S0001",
    "expected": ["ACD-001", "ACD-002"],
    "actual": ["ACD-001"],
}
PATH_REF = {
    "path": "Plans/.plan_index/plan_units.jsonl",
    "error": "implementation_surface_missing_or_untyped",
    "implementation_surface": "tests/fixtures/pm7_shared",
    "plan_unit_id": "ATS-037",
    "line": 744,
}


class KeyNormalization(unittest.TestCase):
    def test_hash_values_do_not_change_the_key(self):
        """A stale hash keeps one key however often the document is edited."""
        later = dict(STALE_HASH, actual="0" * 64)
        self.assertEqual(key_of(STALE_HASH), key_of(later))
        self.assertIn("stale_hash", key_of(STALE_HASH))
        self.assertIn("Plans/00-plans-index.md", key_of(STALE_HASH))

    def test_hashes_inside_a_detail_string_do_not_change_the_key(self):
        """The audit-closure validator reports both hashes inside one prose detail."""
        first = {
            "path": "Plans/.audits/_semantic_closure_registry.jsonl",
            "error": "audit_closure_validator_error",
            "detail": "owner_evidence_hashes for Plans/Planning_Ledger_System.md is stale "
            "(stored 871bbad705af93bdc708a0e52a6c9e778082a4e2ff3a554a838ee6c7dc6ebe0b, "
            "current 489240b5746d19d2778fe8f8f2282483710638965e24c7608aaaaaaaaaaaaaaaa)",
        }
        second = dict(first, detail=first["detail"].replace("871bbad705af93bdc708a0e52a6c9e778082a4e2ff3a554a838ee6c7dc6ebe0b", "b" * 64))
        self.assertEqual(key_of(first), key_of(second))

    def test_measured_values_do_not_change_the_key_but_the_field_does(self):
        """A line that moved is the same finding; a different field is a different finding."""
        moved = dict(SPAN_META, expected=104, actual=80)
        self.assertEqual(key_of(SPAN_META), key_of(moved))
        other_field = dict(SPAN_META, field="line_start")
        self.assertNotEqual(key_of(SPAN_META), key_of(other_field))

    def test_identity_fields_keep_failures_distinct(self):
        other_span = dict(SPAN_META, span_id="00-plans-index-S0003")
        self.assertNotEqual(key_of(SPAN_META), key_of(other_span))

    def test_timestamps_do_not_change_the_key(self):
        first = {"path": "Plans/x.json", "error": "e", "detail": "seen at 2026-09-17T21:12:03Z"}
        second = {"path": "Plans/x.json", "error": "e", "detail": "seen at 2026-09-18T04:00:00Z"}
        self.assertEqual(key_of(first), key_of(second))

    def test_generated_at_utc_is_dropped_entirely(self):
        with_stamp = {"path": "Plans/x.json", "error": "e", "generated_at_utc": "2026-09-17T21:12:03Z"}
        without = {"path": "Plans/x.json", "error": "e"}
        self.assertEqual(key_of(with_stamp), key_of(without))

    def test_the_checkout_it_ran_in_does_not_change_the_key(self):
        """A traceback quotes the absolute path of the tree it ran in; two trees must agree."""
        other = Path("/mnt/Cursor/PuppetMaster")
        crash = {
            "error": "invalid_validator_output",
            "output": "FileNotFoundError: '{root}/tests/fixtures/pm7_shared/motion_frame_matrix.json'",
        }
        here = {"error": crash["error"], "output": crash["output"].format(root=CHECKOUT)}
        there = {"error": crash["error"], "output": crash["output"].format(root=other)}
        self.assertEqual(
            key_of(here, root=CHECKOUT),
            key_of(there, subcheck="verify_spec_lock", root=other),
        )
        self.assertNotIn(str(CHECKOUT), M.normalize("run-gates", "s", here, CHECKOUT)["fields"]["output"])

    def test_a_bare_string_failure_is_accepted(self):
        """validate-testing-session-event-admission reports a bare string, not an object."""
        item = M.normalize("run-gates", "validate_testing_session_event_admission",
                           "preexisting_registry_rows_changed", CHECKOUT)
        self.assertEqual(item["error"], "preexisting_registry_rows_changed")
        self.assertEqual(item["path"], "")
        self.assertEqual(item["key"].rsplit("|", 1)[1], "-")

    def test_the_key_names_the_check_and_the_subcheck(self):
        self.assertTrue(key_of(STALE_HASH).startswith("run-gates|verify_spec_lock|stale_hash|"))
        self.assertTrue(
            key_of(STALE_HASH, check="audit-governance", subcheck="spec_lock").startswith(
                "audit-governance|spec_lock|stale_hash|"
            )
        )


class StalenessClassification(unittest.TestCase):
    def test_governance_staleness_is_recognised(self):
        for failure in (STALE_HASH, SPAN_META, COVERAGE):
            self.assertTrue(M.normalize("c", "s", failure, CHECKOUT)["stale"], failure["error"])

    def test_a_missing_reference_is_not_staleness(self):
        self.assertFalse(M.normalize("c", "s", PATH_REF, CHECKOUT)["stale"])

    def test_a_stale_detail_string_is_recognised(self):
        failure = {"path": "p", "error": "audit_closure_validator_error", "detail": "owner hashes is stale (a, b)"}
        self.assertTrue(M.normalize("c", "s", failure, CHECKOUT)["stale"])


RUN_GATES_REPORT = {
    "check": "run-gates",
    "status": "fail",
    "failures": [
        {"check": "verify_spec_lock", "status": "fail", "failures": [STALE_HASH]},
        {"check": "lint_path_refs", "status": "fail", "failures": [PATH_REF]},
    ],
    # run-gates keeps the true per-subcheck totals here; the block above is a sample.
    "checks": {
        "verify_spec_lock": {"status": "fail", "failures": 35, "failure_samples": [STALE_HASH]},
        "lint_path_refs": {"status": "fail", "failures": 10, "failure_samples": [PATH_REF]},
        "json_syntax": {"status": "pass", "failures": 0, "failure_samples": []},
    },
}

AUDIT_GOVERNANCE_REPORT = {
    "check": "audit-governance",
    "status": "fail",
    "failures": [{"check": "spec_lock", "failures": [STALE_HASH]}],
    # audit-governance keeps the totals at the top level instead of under "checks".
    "spec_lock": {"status": "fail", "failures": 35, "failure_samples": [STALE_HASH]},
}

MIGRATION_REPORT = {
    "schema_id": "pm.plan_migration.validation_report.v1",
    "status": "fail",
    "failures": [SPAN_META, COVERAGE],
}


class Extraction(unittest.TestCase):
    def test_run_gates_totals_come_from_the_checks_map_not_the_sample(self):
        items, counts = M.extract("run-gates", RUN_GATES_REPORT, CHECKOUT)
        self.assertEqual(len(items), 2)
        self.assertEqual(counts["verify_spec_lock"], {"reported": 35, "sampled": 1})
        self.assertEqual(counts["lint_path_refs"], {"reported": 10, "sampled": 1})
        self.assertNotIn("json_syntax", counts)

    def test_audit_governance_totals_come_from_the_top_level(self):
        items, counts = M.extract("audit-governance", AUDIT_GOVERNANCE_REPORT, CHECKOUT)
        self.assertEqual(counts["spec_lock"], {"reported": 35, "sampled": 1})
        self.assertEqual(items[0]["subcheck"], "spec_lock")

    def test_the_migration_report_is_one_unnamed_subcheck(self):
        items, counts = M.extract("plan-migration-validate", MIGRATION_REPORT, CHECKOUT)
        self.assertEqual(counts, {"": {"reported": 2, "sampled": 2}})
        self.assertEqual([item["subcheck"] for item in items], ["", ""])


def baseline_from(reports, max_fingerprints=200):
    items, counts, statuses = [], {}, {}
    for check, report in reports.items():
        got, count = M.extract(check, report, CHECKOUT)
        items += got
        counts[check] = count
        statuses[check] = report.get("status", "fail")
    return items, M.build_baseline("c0ffee", "Plans/.plan_migration/run-017", items, counts,
                                   statuses, max_fingerprints, [])


ALL_REPORTS = {
    "run-gates": RUN_GATES_REPORT,
    "audit-governance": AUDIT_GOVERNANCE_REPORT,
    "plan-migration-validate": MIGRATION_REPORT,
}


class BaselineDiff(unittest.TestCase):
    def setUp(self):
        self.items, self.baseline = baseline_from(ALL_REPORTS)
        self.known, self.counts = M.baseline_index(self.baseline)

    def new_keys(self, items):
        out = []
        for item in items:
            fingerprints = self.known.get(M.bucket_of(item), set())
            if fingerprints is not None and item["key"].rsplit("|", 1)[1] not in fingerprints:
                out.append(item["key"])
        return out

    def test_the_baseline_is_a_schema_document_with_its_commit(self):
        self.assertEqual(self.baseline["schema_id"], "pm.landing_check.baseline.v1")
        self.assertEqual(self.baseline["commit"], "c0ffee")
        self.assertEqual(self.baseline["checks"]["run-gates"]["failure_total"], 45)

    def test_a_failure_already_in_the_baseline_is_not_new(self):
        self.assertEqual(self.new_keys(self.items), [])

    def test_a_failure_absent_from_the_baseline_is_new(self):
        arrival = dict(STALE_HASH, path="Plans/Decision_Log.md")
        items, _ = M.extract(
            "run-gates",
            {"failures": [{"check": "verify_spec_lock", "failures": [STALE_HASH, arrival]}], "checks": {}},
            CHECKOUT,
        )
        new = self.new_keys(items)
        self.assertEqual(len(new), 1)
        self.assertIn("Plans/Decision_Log.md", new[0])

    def test_the_same_failure_with_a_changed_hash_is_not_new(self):
        moved = dict(STALE_HASH, actual="e" * 64)
        items, _ = M.extract(
            "run-gates",
            {"failures": [{"check": "verify_spec_lock", "failures": [moved]}], "checks": {}},
            CHECKOUT,
        )
        self.assertEqual(self.new_keys(items), [])

    def test_a_bucket_over_the_cap_is_matched_by_count_only(self):
        many = [dict(SPAN_META, span_id=f"00-plans-index-S{n:04d}") for n in range(5)]
        items, baseline = baseline_from(
            {"plan-migration-validate": dict(MIGRATION_REPORT, failures=many)}, max_fingerprints=2
        )
        row = [r for r in baseline["buckets"] if r["error"] == SPAN_META["error"]][0]
        self.assertIsNone(row["fingerprints"])
        self.assertEqual(row["count"], 5)
        known, counts = M.baseline_index(baseline)
        # An unseen span inside a count-only bucket is not reported as a new key ...
        unseen, _ = M.extract(
            "plan-migration-validate",
            dict(MIGRATION_REPORT, failures=[dict(SPAN_META, span_id="00-plans-index-S9999")]),
            CHECKOUT,
        )
        self.assertIsNone(known[M.bucket_of(unseen[0])])
        # ... so growth in that bucket is what has to be caught, by the count.
        grown, _ = M.extract(
            "plan-migration-validate",
            dict(MIGRATION_REPORT, failures=many + [dict(SPAN_META, span_id="00-plans-index-S9999")]),
            CHECKOUT,
        )
        seen = {}
        for item in grown:
            seen[M.bucket_of(item)] = seen.get(M.bucket_of(item), 0) + 1
        risen = [name for name, count in seen.items() if count > counts.get(name, 0)]
        self.assertEqual(len(risen), 1)
        self.assertIn(SPAN_META["error"], risen[0])

    def test_a_bucket_the_baseline_never_saw_is_new_not_growth(self):
        """Its failures are already named one by one; counting the bucket too says it twice."""
        arrival = {"path": "Plans/Decision_Log.md", "error": "brand_new_error_kind"}
        items, _ = M.extract(
            "run-gates",
            {"failures": [{"check": "verify_spec_lock", "failures": [arrival]}], "checks": {}},
            CHECKOUT,
        )
        seen = {M.bucket_of(item): 1 for item in items}
        self.assertEqual(M.grown_buckets(seen, self.counts), [])
        self.assertEqual(len(self.new_keys(items)), 1)

    def test_a_bucket_that_grew_is_reported_with_both_counts(self):
        seen = {name: count + 2 for name, count in self.counts.items()}
        rows = M.grown_buckets(seen, self.counts)
        self.assertEqual(len(rows), len(self.counts))
        for row in rows:
            self.assertEqual(row["count"], row["baseline_count"] + 2)

    def test_a_bucket_that_shrank_is_not_growth(self):
        seen = {name: max(count - 1, 0) for name, count in self.counts.items()}
        self.assertEqual(M.grown_buckets(seen, self.counts), [])

    def test_a_bucket_under_the_cap_keeps_its_fingerprints(self):
        row = [r for r in self.baseline["buckets"] if r["error"] == "stale_hash"][0]
        self.assertIsInstance(row["fingerprints"], list)
        self.assertEqual(len(row["fingerprints"]), 1)

    def test_a_failure_that_went_away_is_reported_as_gone_not_as_new(self):
        fewer, _ = M.extract("plan-migration-validate", dict(MIGRATION_REPORT, failures=[SPAN_META]), CHECKOUT)
        seen = {M.bucket_of(item) for item in fewer}
        gone = sorted(set(self.counts) - seen)
        self.assertTrue(any(COVERAGE["error"] in name for name in gone))
        self.assertEqual(self.new_keys(fewer), [])

    def test_the_baseline_stays_small_and_deterministic(self):
        again = M.build_baseline(
            "c0ffee", "Plans/.plan_migration/run-017", list(reversed(self.items)),
            {c: M.extract(c, r, CHECKOUT)[1] for c, r in ALL_REPORTS.items()},
            {c: "fail" for c in ALL_REPORTS}, 200, [],
        )
        left = json.dumps({k: v for k, v in self.baseline.items() if k != "recorded_at_utc"}, sort_keys=True)
        right = json.dumps({k: v for k, v in again.items() if k != "recorded_at_utc"}, sort_keys=True)
        self.assertEqual(left, right)


class BranchPathMatch(unittest.TestCase):
    def match(self, failure, paths, check="run-gates", subcheck="s"):
        item = M.normalize(check, subcheck, failure, CHECKOUT)
        return M.names_branch_path(item, M.path_tokens(paths))

    def test_the_path_field_matches(self):
        self.assertEqual(self.match(STALE_HASH, ["Plans/00-plans-index.md"]), ["Plans/00-plans-index.md"])

    def test_a_nested_field_matches(self):
        """The migration snapshot names the live document in doc_path, not in path."""
        failure = {
            "path": "Plans/.plan_migration/run-017/inventory.json",
            "error": "current_snapshot_live_sha256_mismatch",
            "doc_path": "Plans/External_Research.md",
        }
        self.assertEqual(self.match(failure, ["Plans/External_Research.md"]), ["Plans/External_Research.md"])

    def test_a_span_id_matches_the_document_it_belongs_to(self):
        """Coverage failures name the document only through its span ids."""
        self.assertEqual(
            self.match(COVERAGE, ["Plans/assistant-chat-design.md"]),
            ["Plans/assistant-chat-design.md"],
        )

    def test_a_span_id_does_not_match_a_different_document(self):
        self.assertEqual(self.match(COVERAGE, ["Plans/assistant-chat.md"]), [])

    def test_a_longer_name_that_begins_with_a_touched_path_does_not_match(self):
        """A file whose name only starts with a touched path is a different file."""
        for other in ("Plans/.plan_index/plan_units.jsonl_backup",
                      "Plans/.plan_index/plan_units.jsonl2",
                      "Plans/.plan_index/plan_units.jsonl/part-1"):
            failure = {"path": other, "error": "stale_hash"}
            self.assertEqual(self.match(failure, ["Plans/.plan_index/plan_units.jsonl"]), [], other)

    def test_a_location_inside_a_touched_file_does_match(self):
        """implementation-readiness failures point into a file: Plans/x.json:families[107]."""
        failure = {"path": "Plans/storage_value_registry.json:families[107]",
                   "error": "storage_value_secret_material_key"}
        self.assertEqual(
            self.match(failure, ["Plans/storage_value_registry.json"]),
            ["Plans/storage_value_registry.json"],
        )

    def test_a_failure_that_names_nothing_on_the_branch_does_not_match(self):
        self.assertEqual(self.match(SPAN_META, ["scripts/pm-landing-check.py"]), [])

    def test_a_touched_script_is_matched_by_its_own_path(self):
        failure = {"path": "Plans/.plan_index/plan_units.jsonl", "error": "implementation_surface_missing_or_untyped",
                   "implementation_surface": "scripts/pm-landing-check.py"}
        self.assertEqual(self.match(failure, ["scripts/pm-landing-check.py"]), ["scripts/pm-landing-check.py"])

    def test_branch_paths_reports_a_bad_revision_instead_of_returning_nothing(self):
        with self.assertRaises(RuntimeError):
            M.branch_paths(ROOT, "no-such-revision-cafebabe")


class BaselineReading(unittest.TestCase):
    def test_a_foreign_document_is_refused(self):
        import tempfile

        with tempfile.TemporaryDirectory() as scratch:
            path = Path(scratch) / "baseline.json"
            path.write_text(json.dumps({"schema_id": "something.else"}), encoding="utf-8")
            with self.assertRaises(ValueError):
                M.load_baseline(path)


if __name__ == "__main__":
    unittest.main()
