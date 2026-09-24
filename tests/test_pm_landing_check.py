"""Synthetic fixtures for the landing check: key normalization, the baseline diff, the branch match.

Every fixture here fails for the reason its test names. None of them run the real repository-wide
checks; the report shapes are copied from what `run-gates`, `audit-governance` and
`pm-plan-migration.py validate` actually print.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import textwrap
import time
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


INDEX_FAILURE = {
    "path": "Plans/.plan_index/plan_units.jsonl",
    "error": "implementation_surface_missing_or_untyped",
    "plan_unit_id": "ATS-020",
    "implementation_surface": "scratchpad/gone/runner.py",
    "line": 727,
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


class KeyIntegrity(unittest.TestCase):
    """The diff leans on these; a quiet regression in any one of them hides a real failure."""

    def test_the_fingerprint_is_wide_enough_to_tell_failures_apart(self):
        seen = {}
        for n in range(500):
            item = M.normalize("c", "s", dict(SPAN_META, span_id=f"doc-S{n:04d}"), CHECKOUT)
            print_fp = item["key"].rsplit("|", 1)[1]
            self.assertEqual(len(print_fp), 12, print_fp)
            self.assertNotIn(print_fp, seen, f"collision between doc-S{n:04d} and {seen.get(print_fp)}")
            seen[print_fp] = f"doc-S{n:04d}"

    def test_canonical_sorts_keys_so_the_baseline_is_stable(self):
        self.assertEqual(M.canonical({"b": 1, "a": 2}), M.canonical({"a": 2, "b": 1}))
        self.assertEqual(M.canonical({"b": 1, "a": 2}), '{"a":2,"b":1}')

    def test_scrub_reaches_into_nested_values(self):
        nested = {"error": "e", "rows": [{"sha": "a" * 64, "when": "2026-09-17T21:12:03Z"}]}
        scrubbed = M.scrub(nested, CHECKOUT)
        self.assertEqual(scrubbed["rows"][0]["sha"], "<hash>")
        self.assertEqual(scrubbed["rows"][0]["when"], "<time>")

    def test_a_short_hex_run_is_not_mistaken_for_a_hash(self):
        """Masking too wide would merge distinct paths into one bucket."""
        self.assertEqual(M.scrub({"path": "Plans/abcdef1.md"}, CHECKOUT)["path"], "Plans/abcdef1.md")
        self.assertEqual(M.scrub({"path": "x/" + "a" * 31 + ".md"}, CHECKOUT)["path"], "x/" + "a" * 31 + ".md")
        self.assertEqual(M.scrub({"v": "a" * 32}, CHECKOUT)["v"], "<hash>")


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

    def test_growth_is_reported_for_a_count_only_bucket_too(self):
        """These three buckets are the ones with no fingerprints, so the count is the only signal."""
        many = [dict(SPAN_META, span_id=f"00-plans-index-S{n:04d}") for n in range(5)]
        _, baseline = baseline_from(
            {"plan-migration-validate": dict(MIGRATION_REPORT, failures=many)}, max_fingerprints=2)
        _, counts = M.baseline_index(baseline)
        bucket = next(name for name in counts if SPAN_META["error"] in name)
        self.assertIsNone(M.baseline_index(baseline)[0][bucket])
        self.assertEqual(M.grown_buckets({bucket: 6}, counts)[0]["count"], 6)
        self.assertEqual(M.grown_buckets({bucket: 5}, counts), [])

    def test_the_cap_is_inclusive(self):
        """A bucket of exactly max_fingerprints keeps them; one more and it is counted instead."""
        for size, enumerated in ((3, True), (4, False)):
            failures = [dict(SPAN_META, span_id=f"d-S{n:04d}") for n in range(size)]
            _, baseline = baseline_from(
                {"plan-migration-validate": dict(MIGRATION_REPORT, failures=failures)}, max_fingerprints=3)
            row = next(r for r in baseline["buckets"] if r["error"] == SPAN_META["error"])
            self.assertEqual(row["fingerprints"] is not None, enumerated, size)
            self.assertEqual(row["count"], size)

    def test_the_baseline_lists_its_buckets_and_fingerprints_in_order(self):
        _, baseline = baseline_from(ALL_REPORTS)
        names = [f"{r['check']}|{r['subcheck']}|{r['error']}|{r['path']}" for r in baseline["buckets"]]
        self.assertEqual(names, sorted(names))
        for row in baseline["buckets"]:
            if row["fingerprints"]:
                self.assertEqual(row["fingerprints"], sorted(row["fingerprints"]))

    def test_a_count_only_bucket_keeps_its_count_for_the_growth_check(self):
        """It has no fingerprints, so the count is the only thing standing between it and silence."""
        many = [dict(SPAN_META, span_id=f"d-S{n:04d}") for n in range(5)]
        _, baseline = baseline_from(
            {"plan-migration-validate": dict(MIGRATION_REPORT, failures=many)}, max_fingerprints=2)
        known, counts = M.baseline_index(baseline)
        bucket = next(name for name in counts if SPAN_META["error"] in name)
        self.assertIsNone(known[bucket])
        self.assertEqual(counts[bucket], 5)
        self.assertEqual(M.grown_buckets({bucket: 6}, counts), [
            {"bucket": bucket, "baseline_count": 5, "count": 6, "stale": True}])

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


class TheDecision(unittest.TestCase):
    """What stops a landing. This is the one line that decides it, so it gets its own fixtures."""

    def item(self, *, stale, on_branch_path=None):
        failure = STALE_HASH if stale else PATH_REF
        item = M.normalize("run-gates", "s", failure, CHECKOUT)
        return {**M.public(item), "branch_paths": [on_branch_path]} if on_branch_path else M.public(item)

    def test_a_new_off_branch_failure_that_is_not_staleness_does_not_stop_the_landing(self):
        """It names none of the branch's files, so the rule says push and report it."""
        new = [self.item(stale=False)]
        blocking = M.blocking_items([], [], [])
        self.assertEqual(blocking, [])
        self.assertEqual(M.exit_code(new, [], [], blocking), 1)

    def test_a_non_staleness_failure_on_the_branch_stops_the_landing(self):
        on_branch = [self.item(stale=False, on_branch_path="Plans/.plan_index/plan_units.jsonl")]
        blocking = M.blocking_items(on_branch, [], [])
        self.assertEqual(len(blocking), 1)
        self.assertEqual(M.exit_code(on_branch, [], [], blocking), 2)

    def test_staleness_on_the_branch_does_not_stop_the_landing(self):
        on_branch = [self.item(stale=True, on_branch_path="Plans/00-plans-index.md")]
        blocking = M.blocking_items(on_branch, [], [])
        self.assertEqual(blocking, [])
        self.assertEqual(M.exit_code(on_branch, [], [], blocking), 1)

    def test_nothing_reported_is_exit_zero(self):
        self.assertEqual(M.exit_code([], [], [], []), 0)

    def test_a_grown_bucket_that_is_not_staleness_stops_the_landing(self):
        grown = [{"bucket": "c|s|some_error|p", "baseline_count": 1, "count": 2, "stale": False}]
        blocking = M.blocking_items([], grown, [])
        self.assertEqual(len(blocking), 1)
        self.assertEqual(M.exit_code([], grown, [], blocking), 2)

    def test_a_grown_staleness_bucket_does_not_stop_the_landing(self):
        grown = [{"bucket": "c|s|stale_hash|p", "baseline_count": 1, "count": 2, "stale": True}]
        self.assertEqual(M.blocking_items([], grown, []), [])
        self.assertEqual(M.exit_code([], grown, [], []), 1)

    def test_a_rise_in_a_truncated_subcheck_stops_the_landing(self):
        """Above the print cap nothing is keyed, so the branch match cannot see what was added."""
        rows = [{"check": "run-gates", "subcheck": "validate_evidence", "baseline_reported": 1552,
                 "reported": 1553, "sampled": 50, "truncated": True}]
        blocking = M.blocking_items([], [], rows)
        self.assertEqual(len(blocking), 1)
        self.assertEqual(M.exit_code([], [], rows, blocking), 2)

    def test_a_rise_in_a_subcheck_that_prints_everything_does_not(self):
        """Its failures are all keyed, so the ordinary new and on-branch rules already judged them."""
        rows = [{"check": "run-gates", "subcheck": "verify_spec_lock", "baseline_reported": 35,
                 "reported": 36, "sampled": 36, "truncated": False}]
        self.assertEqual(M.blocking_items([], [], rows), [])
        self.assertEqual(M.exit_code([], [], rows, []), 1)


class SubcheckTotals(unittest.TestCase):
    BASELINE = {
        "run-gates": {"failure_total": 1587, "subchecks": {
            "verify_spec_lock": {"reported": 35, "sampled": 35},
            "validate_evidence": {"reported": 1552, "sampled": 50},
        }},
    }

    def counts(self, **subchecks):
        return {"run-gates": subchecks}

    def test_a_rise_above_the_print_cap_is_reported_as_truncated(self):
        rows = M.grown_subchecks(
            self.counts(validate_evidence={"reported": 1600, "sampled": 50}), self.BASELINE)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["baseline_reported"], 1552)
        self.assertEqual(rows[0]["reported"], 1600)
        self.assertTrue(rows[0]["truncated"])

    def test_an_unchanged_total_is_not_reported(self):
        self.assertEqual(
            M.grown_subchecks(self.counts(validate_evidence={"reported": 1552, "sampled": 50}), self.BASELINE), [])

    def test_a_fallen_total_is_not_reported(self):
        self.assertEqual(
            M.grown_subchecks(self.counts(validate_evidence={"reported": 10, "sampled": 10}), self.BASELINE), [])

    def test_a_subcheck_the_baseline_never_saw_counts_from_zero(self):
        rows = M.grown_subchecks(self.counts(json_syntax={"reported": 2, "sampled": 2}), self.BASELINE)
        self.assertEqual(len(rows), 1)
        self.assertEqual((rows[0]["subcheck"], rows[0]["baseline_reported"], rows[0]["truncated"]), ("json_syntax", 0, False))

    def test_a_rise_in_a_fully_printed_subcheck_is_reported_but_not_truncated(self):
        rows = M.grown_subchecks(self.counts(verify_spec_lock={"reported": 36, "sampled": 36}), self.BASELINE)
        self.assertEqual([(r["subcheck"], r["truncated"]) for r in rows], [("verify_spec_lock", False)])

    def test_the_rows_are_ordered(self):
        rows = M.grown_subchecks(
            self.counts(validate_evidence={"reported": 1600, "sampled": 50},
                        aaa={"reported": 1, "sampled": 1},
                        verify_spec_lock={"reported": 40, "sampled": 40}),
            self.BASELINE)
        self.assertEqual([r["subcheck"] for r in rows], ["aaa", "validate_evidence", "verify_spec_lock"])


class BranchPathMatch(unittest.TestCase):
    def match(self, failure, paths, check="run-gates", subcheck="s"):
        item = M.normalize(check, subcheck, failure, CHECKOUT)
        return M.names_branch_path(item, M.path_tokens(paths), CHECKOUT)

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

    def test_a_stem_that_is_the_tail_of_another_stem_does_not_match(self):
        """The opening quote: without it `chat-design` matches `assistant-chat-design-S0001`."""
        self.assertEqual(self.match(COVERAGE, ["Plans/chat-design.md"]), [])

    def test_a_span_id_with_more_after_its_number_does_not_match(self):
        """The closing quote: without it `...-S0001` matches `...-S0001-draft`."""
        failure = dict(COVERAGE, span_id="assistant-chat-design-S0001-draft")
        self.assertEqual(self.match(failure, ["Plans/assistant-chat-design.md"]), [])

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

    def test_a_document_named_only_inside_a_measured_value_still_matches(self):
        """The key drops actual/expected, but the branch match reads the failure as it came:
        current_snapshot_batch_doc_set_not_exactly_once names its documents only in those lists."""
        failure = {
            "path": "Plans/.plan_migration/run-017/batch_report.jsonl",
            "error": "current_snapshot_batch_doc_set_not_exactly_once",
            "expected": ["Plans/00-plans-index.md", "Plans/Decision_Log.md"],
            "actual": ["Plans/00-plans-index.md"],
        }
        item = M.normalize("plan-migration-validate", "", failure, CHECKOUT)
        self.assertEqual(item["fields"]["expected"], "<list>")
        self.assertEqual(self.match(failure, ["Plans/Decision_Log.md"]), ["Plans/Decision_Log.md"])

    def test_the_printed_item_carries_no_private_fields(self):
        item = M.normalize("run-gates", "s", STALE_HASH, CHECKOUT)
        self.assertIn("_raw", item)
        self.assertNotIn("_raw", M.public(item))
        self.assertEqual(set(M.public(item)), {"key", "check", "subcheck", "error", "path", "fields", "stale"})

    def test_a_touched_script_is_matched_by_its_own_path(self):
        failure = {"path": "Plans/.plan_index/plan_units.jsonl", "error": "implementation_surface_missing_or_untyped",
                   "implementation_surface": "scripts/pm-landing-check.py"}
        self.assertEqual(self.match(failure, ["scripts/pm-landing-check.py"]), ["scripts/pm-landing-check.py"])

    def test_branch_paths_reports_a_bad_revision_instead_of_returning_nothing(self):
        with self.assertRaises(RuntimeError):
            M.branch_paths(ROOT, "no-such-revision-cafebabe")


class EndToEnd(unittest.TestCase):
    """Drive main() itself, with the three checks stubbed and a real git repository underneath.

    Everything above tests a helper. Mutation testing showed that a helper suite cannot see a
    regression in main's own wiring: dropping the count-only guard, never returning 2, counting
    off-branch items as blocking and reversing the resolved set all left the suite green. These
    exercise the wiring.
    """

    SPAN = dict(SPAN_META)
    OFF_BRANCH_NEW = {"path": "Plans/Glossary.md", "error": "brand_new_kind"}
    ON_BRANCH_NEW = {"path": "Plans/Touched.md", "error": "brand_new_kind"}

    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory()
        self.addCleanup(self.scratch.cleanup)
        self.repo = Path(self.scratch.name)
        self.module = load_module()
        self.git("init", "-q", "-b", "main")
        self.git("config", "user.email", "t@example.invalid")
        self.git("config", "user.name", "t")
        (self.repo / "Plans").mkdir()
        (self.repo / "Plans" / "Base.md").write_text("base\n", encoding="utf-8")
        self.git("add", "Plans/Base.md")
        self.git("commit", "-qm", "base")
        self.base = self.git("rev-parse", "HEAD").strip()
        self.reports = {}

    def git(self, *args):
        return subprocess.run(["git", *args], cwd=self.repo, capture_output=True, text=True, check=True).stdout

    def touch(self, name):
        self.touch_path(f"Plans/{name}")

    def touch_path(self, rel):
        path = self.repo / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(path.read_text(encoding="utf-8") + "x\n" if path.exists() else "x\n", encoding="utf-8")
        self.git("add", rel)
        self.git("commit", "-qm", rel)

    def write_index(self, owners):
        index = self.repo / M.PLAN_UNITS_INDEX
        index.parent.mkdir(parents=True, exist_ok=True)
        index.write_text("".join(
            json.dumps({"plan_unit_id": unit, "owner_doc": owner}) + "\n" for unit, owner in owners.items()
        ), encoding="utf-8")
        self.git("add", M.PLAN_UNITS_INDEX)
        self.git("commit", "-qm", "index")

    def stub_checks(self, gates_failures, migration_failures, gates_reported=None, root_in_failure=False):
        """Stand in for the three subprocess runs, so a test costs milliseconds, not ten minutes.

        `root_in_failure` reproduces what a crashing validator really emits: a traceback quoting the
        absolute path of the checkout it ran in.
        """
        sampled = len(gates_failures) + (1 if root_in_failure else 0)
        reported = sampled if gates_reported is None else gates_reported
        def build(root):
            rows = list(gates_failures)
            if root_in_failure:
                rows.append({"error": "invalid_validator_output",
                             "output": f"FileNotFoundError: '{root}/tests/fixtures/pm7_shared/x.json'"})
            return rows
        reports = {
            "run-gates": {
                "check": "run-gates", "status": "fail" if gates_failures or root_in_failure else "pass",
                "failures": [{"check": "verify_spec_lock", "failures": gates_failures}] if gates_failures or root_in_failure else [],
                "checks": {"verify_spec_lock": {"status": "fail", "failures": reported}},
            },
            "audit-governance": {"check": "audit-governance", "status": "pass", "failures": []},
            "plan-migration-validate": {
                "status": "fail" if migration_failures else "pass", "failures": list(migration_failures)},
        }
        def run_check(name, root, run_dir, timeout):
            report = json.loads(json.dumps(reports[name]))
            if name == "run-gates" and report["failures"]:
                report["failures"][0]["failures"] = build(root)
            return report
        self.module.run_check = run_check
        self.module.current_run_dir = lambda root: "Plans/.plan_migration/run-017"

    def run_main(self, *argv):
        import io, contextlib
        out, err = io.StringIO(), io.StringIO()
        sys.argv = ["pm-landing-check.py", "--root", str(self.repo), *argv]
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = self.module.main()
        self.stderr = err.getvalue()
        return code, out.getvalue()

    def record(self, *argv):
        code, out = self.run_main("--record-baseline", "--baseline", "baseline.json", *argv)
        self.assertEqual(code, 0, out)
        return json.loads((self.repo / "baseline.json").read_text(encoding="utf-8"))

    def compare(self, *argv):
        return self.run_main("--base", self.base, "--baseline", "baseline.json", *argv)

    def test_a_tree_that_matches_its_baseline_exits_zero(self):
        self.stub_checks([STALE_HASH], [self.SPAN])
        self.record()
        self.touch("Touched.md")
        code, out = self.compare()
        self.assertEqual(code, 0, out)
        self.assertIn("Nothing to report", out)

    def test_a_new_failure_that_names_no_branch_file_exits_one(self):
        self.stub_checks([STALE_HASH], [self.SPAN])
        self.record()
        self.touch("Touched.md")
        self.stub_checks([STALE_HASH, self.OFF_BRANCH_NEW], [self.SPAN])
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("New since the baseline: 1", out)
        self.assertIn("Naming a path this branch touches: 0", out)
        self.assertIn("Nothing reported stops the landing", out)

    def test_a_non_staleness_failure_on_a_branch_file_exits_two(self):
        self.stub_checks([STALE_HASH], [self.SPAN])
        self.record()
        self.touch("Touched.md")
        self.stub_checks([STALE_HASH, self.ON_BRANCH_NEW], [self.SPAN])
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("Naming a path this branch touches: 1", out)
        self.assertIn("the baseline does not excuse", out)

    def test_staleness_on_a_branch_file_exits_one_and_is_counted_by_kind(self):
        self.stub_checks([dict(STALE_HASH, path="Plans/Touched.md")], [self.SPAN])
        self.record()
        self.touch("Touched.md")
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("Naming a path this branch touches: 1", out)
        self.assertIn("stale_hash", out)
        self.assertIn("excused as governance staleness, by kind", out)

    def test_growth_inside_a_count_only_bucket_is_caught(self):
        many = [dict(self.SPAN, span_id=f"d-S{n:04d}") for n in range(5)]
        self.stub_checks([STALE_HASH], many)
        baseline = self.record("--max-fingerprints", "2")
        row = next(r for r in baseline["buckets"] if r["error"] == self.SPAN["error"])
        self.assertIsNone(row["fingerprints"])
        self.touch("Touched.md")
        self.stub_checks([STALE_HASH], many + [dict(self.SPAN, span_id="d-S9999")])
        code, out = self.compare()
        self.assertIn("New since the baseline: 0", out)  # the bucket is matched by count, not by key
        self.assertIn("Checks whose failure count rose: 1", out)
        self.assertIn("5 -> 6", out)
        self.assertEqual(code, 1, out)  # current_snapshot_ is staleness, so it does not block

    def test_a_count_only_bucket_does_not_flood_the_new_list(self):
        """Every span inside it is unknown by key; only the count may speak."""
        many = [dict(self.SPAN, span_id=f"d-S{n:04d}") for n in range(5)]
        self.stub_checks([STALE_HASH], many)
        self.record("--max-fingerprints", "2")
        self.touch("Touched.md")
        swapped = many[:-1] + [dict(self.SPAN, span_id="d-S8888")]
        self.stub_checks([STALE_HASH], swapped)
        code, out = self.compare()
        self.assertIn("New since the baseline: 0", out)
        self.assertIn("Checks whose failure count rose: 0", out)
        self.assertEqual(code, 0, out)

    def test_a_rise_above_a_print_cap_is_caught_and_blocks(self):
        self.stub_checks([STALE_HASH], [self.SPAN], gates_reported=1552)
        self.record()
        self.touch("Touched.md")
        self.stub_checks([STALE_HASH], [self.SPAN], gates_reported=1553)
        code, out = self.compare()
        self.assertIn("Subchecks reporting more failures than the baseline: 1", out)
        self.assertIn("1552 -> 1553", out)
        self.assertIn("cannot be matched", out)
        self.assertEqual(code, 2, out)

    def test_a_failure_that_went_away_is_resolved_not_new(self):
        self.stub_checks([STALE_HASH, self.OFF_BRANCH_NEW], [self.SPAN])
        self.record()
        self.touch("Touched.md")
        self.stub_checks([STALE_HASH], [self.SPAN])
        code, out = self.compare()
        self.assertIn("New since the baseline: 0", out)
        self.assertIn("Gone since the baseline (nothing to do): 1", out)
        self.assertEqual(code, 0, out)

    def test_the_json_mode_carries_the_totals_a_wrapper_needs(self):
        self.stub_checks([STALE_HASH], [self.SPAN], gates_reported=1552)
        self.record()
        self.touch("Touched.md")
        code, out = self.compare("--json")
        report = json.loads(out)
        self.assertEqual(report["checks"]["run-gates"]["failure_total"], 1552)
        self.assertEqual(report["checks"]["run-gates"]["baseline_failure_total"], 1552)
        self.assertEqual(report["checks"]["run-gates"]["subchecks"]["verify_spec_lock"],
                         {"reported": 1552, "sampled": 1})
        for key in ("new", "on_branch", "grown_buckets", "grown_subchecks", "excused_by_kind", "resolved_buckets"):
            self.assertIn(key, report)
        self.assertNotIn("_raw", out)
        self.assertEqual(code, 0, out)

    def test_two_checkouts_produce_the_same_keys(self):
        """A validator traceback names the tree it ran in. Record in one checkout, compare in
        another: the failure is the same failure, so it must not read as new."""
        self.stub_checks([STALE_HASH], [self.SPAN], root_in_failure=True)
        self.record()
        self.touch("Touched.md")
        other = Path(self.scratch.name).parent / (Path(self.scratch.name).name + "-second")
        shutil.copytree(self.repo, other)
        self.addCleanup(shutil.rmtree, other, True)
        code, out = self.run_main("--base", self.base, "--baseline", "baseline.json", "--root", str(other))
        self.assertIn("New since the baseline: 0", out)
        self.assertEqual(code, 0, out)
        self.assertNotIn(str(self.repo), out)

    def test_sample_churn_in_a_truncated_subcheck_is_not_new(self):
        """The rows printed changed; nothing was added or removed. The control is the total, which
        did not move, so the run has nothing to say."""
        self.stub_checks([STALE_HASH], [self.SPAN], gates_reported=1552)
        self.record()
        self.touch("Touched.md")
        churned = dict(STALE_HASH, path="Plans/SomeOther.md")
        self.stub_checks([churned], [self.SPAN], gates_reported=1552)
        code, out = self.compare()
        self.assertIn("New since the baseline: 0", out)
        self.assertIn("Gone since the baseline (nothing to do): 0", out)
        self.assertIn("compared by their total only", out)
        self.assertEqual(code, 0, out)

    def test_the_same_churn_in_a_fully_printed_subcheck_is_new(self):
        """The control for the control: where every failure is printed, a row that was not there
        before really is a new failure."""
        self.stub_checks([STALE_HASH], [self.SPAN])
        self.record()
        self.touch("Touched.md")
        self.stub_checks([dict(STALE_HASH, path="Plans/SomeOther.md")], [self.SPAN])
        code, out = self.compare()
        self.assertIn("New since the baseline: 1", out)
        self.assertEqual(code, 1, out)

    def test_a_churned_row_that_names_a_branch_file_is_still_reported(self):
        """Being compared by total does not take the sample out of the branch match."""
        self.stub_checks([STALE_HASH], [self.SPAN], gates_reported=1552)
        self.record()
        self.touch("Touched.md")
        self.stub_checks([dict(self.ON_BRANCH_NEW, path="Plans/Touched.md")], [self.SPAN], gates_reported=1552)
        code, out = self.compare()
        self.assertIn("New since the baseline: 0", out)
        self.assertIn("Naming a path this branch touches: 1", out)
        self.assertEqual(code, 2, out)

    def test_a_regenerated_index_row_for_an_untouched_unit_does_not_stop_the_landing(self):
        self.write_index({"ATS-020": "Plans/Untouched.md"})
        self.stub_checks([STALE_HASH], [self.SPAN])
        self.record()
        self.touch("Touched.md")
        self.touch_path("Plans/.plan_index/plan_units.jsonl")
        self.stub_checks([STALE_HASH, INDEX_FAILURE], [self.SPAN])
        code, out = self.compare()
        self.assertIn("Naming a path this branch touches: 0", out)
        self.assertIn("regenerated files are matched on the units they name", out)
        self.assertEqual(code, 1, out)  # new, but on none of the branch's files

    def test_a_regenerated_index_row_for_a_touched_unit_does(self):
        self.write_index({"ATS-020": "Plans/Touched.md"})
        self.stub_checks([STALE_HASH], [self.SPAN])
        self.record()
        self.touch("Touched.md")
        self.touch_path("Plans/.plan_index/plan_units.jsonl")
        self.stub_checks([STALE_HASH, INDEX_FAILURE], [self.SPAN])
        code, out = self.compare()
        self.assertIn("Naming a path this branch touches: 1", out)
        self.assertEqual(code, 2, out)

    def test_a_sparse_worktree_is_refused_before_anything_runs(self):
        """A dry run on a worktree without Concepts and tests produced three blocking items and 76
        new failures that were all the absent cone. None of them was about the branch."""
        ran = []
        self.stub_checks([STALE_HASH], [self.SPAN])
        inner = self.module.run_check
        self.module.run_check = lambda *a, **k: (ran.append(1), inner(*a, **k))[1]
        self.module.sparse_paths = lambda root: ["Plans", "scripts"]
        code, out = self.compare()
        self.assertEqual(code, 3)
        self.assertEqual(ran, [])
        self.assertEqual(out, "")
        self.assertIn("this worktree is sparse, limited to: Plans, scripts", self.stderr)
        self.assertIn("git sparse-checkout disable", self.stderr)
        self.assertIn("--allow-sparse", self.stderr)

    def test_recording_a_baseline_on_a_sparse_worktree_is_refused_too(self):
        """A baseline taken on a partial tree would bake the absent cone into every later landing."""
        self.stub_checks([STALE_HASH], [self.SPAN])
        self.module.sparse_paths = lambda root: ["Plans"]
        code, _ = self.run_main("--record-baseline", "--baseline", "baseline.json")
        self.assertEqual(code, 3)
        self.assertFalse((self.repo / "baseline.json").exists())

    def test_allow_sparse_runs_it_anyway(self):
        self.stub_checks([STALE_HASH], [self.SPAN])
        self.module.sparse_paths = lambda root: ["Plans"]
        code, out = self.run_main("--record-baseline", "--baseline", "baseline.json", "--allow-sparse")
        self.assertEqual(code, 0, self.stderr)
        self.touch("Touched.md")
        code, out = self.compare("--allow-sparse")
        self.assertEqual(code, 0, out)
        self.assertIn("Nothing to report", out)

    def test_a_whole_worktree_is_not_refused(self):
        self.stub_checks([STALE_HASH], [self.SPAN])
        self.assertEqual(self.module.sparse_paths(self.repo), [])
        code, _ = self.run_main("--record-baseline", "--baseline", "baseline.json")
        self.assertEqual(code, 0)

    def test_a_missing_baseline_stops_before_running_anything(self):
        ran = []
        self.stub_checks([], [])
        inner = self.module.run_check
        self.module.run_check = lambda *a, **k: (ran.append(1), inner(*a, **k))[1]
        code, _ = self.compare()
        self.assertEqual(code, 3)
        self.assertEqual(ran, [])


class DerivedFilesAreMatchedOnUnits(unittest.TestCase):
    """A branch that edits one owner document regenerates every shard and index row in the
    repository. Matching on those paths made a failure about a unit the branch never opened stop its
    landing: the author's own second trial matched 14 of them on plan_units.jsonl."""

    TOUCHED = [
        "Plans/Bootstrap_Planning_Migration.md",
        "Plans/_shards/decision_log/003-entries.md",
        "Plans/.plan_index/plan_units.jsonl",
        "scripts/pm-landing-check.py",
    ]

    def test_the_derived_paths_are_taken_out_of_the_touched_set(self):
        direct, derived = M.split_touched(self.TOUCHED)
        self.assertEqual(direct, ["Plans/Bootstrap_Planning_Migration.md", "scripts/pm-landing-check.py"])
        self.assertEqual(derived, ["Plans/_shards/decision_log/003-entries.md",
                                   "Plans/.plan_index/plan_units.jsonl"])

    def test_an_index_row_for_a_unit_the_branch_never_edited_does_not_match(self):
        """The control: with plan_units.jsonl still in the touched set this failure matched."""
        item = M.normalize("run-gates", "lint_path_refs", INDEX_FAILURE, CHECKOUT)
        direct, _ = M.split_touched(self.TOUCHED)
        self.assertEqual(M.names_branch_path(item, M.path_tokens(direct), CHECKOUT, {"OTH-001": "Plans/Other.md"}), [])
        # the regression this fixes, shown rather than described:
        self.assertEqual(
            M.names_branch_path(item, M.path_tokens(self.TOUCHED), CHECKOUT),
            ["Plans/.plan_index/plan_units.jsonl"],
        )

    def test_an_index_row_for_a_unit_of_a_touched_document_does_match(self):
        item = M.normalize("run-gates", "lint_path_refs", INDEX_FAILURE, CHECKOUT)
        direct, _ = M.split_touched(self.TOUCHED)
        self.assertEqual(
            M.names_branch_path(item, M.path_tokens(direct), CHECKOUT,
                                {"ATS-020": "Plans/Bootstrap_Planning_Migration.md"}),
            ["Plans/Bootstrap_Planning_Migration.md"],
        )

    def test_a_shard_failure_is_narrowed_the_same_way_as_an_index_failure(self):
        """Both derived prefixes, not just the index: shards are regenerated whole too."""
        failure = {"path": "Plans/_shards/decision_log/003-entries.md", "error": "shard_body_mismatch",
                   "plan_unit_id": "ATS-020"}
        item = M.normalize("run-gates", "check_shards", failure, CHECKOUT)
        direct, _ = M.split_touched(self.TOUCHED)
        self.assertEqual(
            M.names_branch_path(item, M.path_tokens(direct), CHECKOUT, {"OTH-001": "Plans/Other.md"}), [])
        self.assertEqual(
            M.names_branch_path(item, M.path_tokens(direct), CHECKOUT,
                                {"ATS-020": "Plans/Bootstrap_Planning_Migration.md"}),
            ["Plans/Bootstrap_Planning_Migration.md"])
        # the regression: with the shard path in the touched set it matched on the path alone
        self.assertEqual(
            M.names_branch_path(item, M.path_tokens(self.TOUCHED), CHECKOUT),
            ["Plans/_shards/decision_log/003-entries.md"])

    def test_a_derived_failure_that_names_no_unit_at_all_does_not_match(self):
        failure = {"path": "Plans/.plan_index/plan_units.jsonl", "error": "index_row_unreadable", "line": 12}
        item = M.normalize("run-gates", "s", failure, CHECKOUT)
        direct, _ = M.split_touched(self.TOUCHED)
        self.assertEqual(
            M.names_branch_path(item, M.path_tokens(direct), CHECKOUT,
                                {"ATS-020": "Plans/Bootstrap_Planning_Migration.md"}), [])

    def test_a_non_derived_failure_is_not_matched_on_units(self):
        """Unit identity is the rule for generated indexes only, not a second way in everywhere."""
        failure = {"path": "Plans/Other.md", "error": "e", "plan_unit_id": "ATS-020"}
        item = M.normalize("run-gates", "s", failure, CHECKOUT)
        self.assertEqual(M.names_branch_path(item, M.path_tokens(["Plans/Touched.md"]), CHECKOUT,
                                             {"ATS-020": "Plans/Touched.md"}), [])

    def test_a_derived_failure_naming_a_touched_path_in_its_text_still_matches(self):
        failure = {"path": "Plans/.plan_index/plan_units.jsonl", "error": "e",
                   "implementation_surface": "scripts/pm-landing-check.py"}
        item = M.normalize("run-gates", "s", failure, CHECKOUT)
        direct, _ = M.split_touched(self.TOUCHED)
        self.assertEqual(M.names_branch_path(item, M.path_tokens(direct), CHECKOUT, {}),
                         ["scripts/pm-landing-check.py"])

    def test_the_owning_units_are_read_from_the_index(self):
        with tempfile.TemporaryDirectory() as scratch:
            root = Path(scratch)
            (root / "Plans" / ".plan_index").mkdir(parents=True)
            (root / M.PLAN_UNITS_INDEX).write_text(
                json.dumps({"plan_unit_id": "ATS-020", "owner_doc": "Plans/Touched.md"}) + "\n"
                + json.dumps({"plan_unit_id": "OTH-001", "owner_doc": "Plans/Other.md"}) + "\n"
                + "\n" + "{not json}\n", encoding="utf-8")
            self.assertEqual(M.units_of_touched_docs(root, ["Plans/Touched.md"]),
                             {"ATS-020": "Plans/Touched.md"})
            self.assertEqual(M.units_of_touched_docs(root, ["scripts/x.py"]), {})
            self.assertEqual(M.units_of_touched_docs(Path(scratch) / "nowhere", ["Plans/Touched.md"]), {})


class SampledSubchecksAreComparedByTotal(unittest.TestCase):
    """Which rows land inside a 50- or 100-row sample can change with nothing added or removed, so a
    fingerprint first seen there means nothing. A peer build reported exactly this churn as new
    failures."""

    COUNTS = {"run-gates": {"validate_evidence": {"reported": 1552, "sampled": 50},
                            "verify_spec_lock": {"reported": 35, "sampled": 35}}}
    BASELINE = {"run-gates": {"subchecks": {"validate_evidence": {"reported": 1552, "sampled": 50},
                                            "verify_spec_lock": {"reported": 35, "sampled": 35}}}}

    def test_a_truncated_subcheck_is_named_from_either_side(self):
        self.assertEqual(M.partial_subchecks(self.COUNTS, self.BASELINE),
                         {("run-gates", "validate_evidence")})
        full = {"run-gates": {"validate_evidence": {"reported": 50, "sampled": 50}}}
        self.assertEqual(M.partial_subchecks(full, self.BASELINE), {("run-gates", "validate_evidence")})
        self.assertEqual(M.partial_subchecks(self.COUNTS, {}), {("run-gates", "validate_evidence")})
        self.assertEqual(M.partial_subchecks(full, {}), set())

    def test_a_bucket_name_gives_back_its_check_and_subcheck(self):
        self.assertEqual(M.bucket_subcheck("run-gates|validate_evidence|stale_hash|Plans/a|b"),
                         ("run-gates", "validate_evidence"))
        self.assertEqual(M.bucket_subcheck("plan-migration-validate||err|p|f"),
                         ("plan-migration-validate", ""))


class SparseDetection(unittest.TestCase):
    """Against a real sparse worktree, not a stub, because the refusal is only as good as this."""

    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory()
        self.addCleanup(self.scratch.cleanup)
        self.repo = Path(self.scratch.name)
        def git(*args):
            return subprocess.run(["git", *args], cwd=self.repo, capture_output=True, text=True, check=True)
        self.g = git
        git("init", "-q", "-b", "main")
        git("config", "user.email", "t@example.invalid")
        git("config", "user.name", "t")
        for folder in ("Plans", "Concepts"):
            (self.repo / folder).mkdir()
            (self.repo / folder / "f.md").write_text("x\n", encoding="utf-8")
        (self.repo / "root.md").write_text("x\n", encoding="utf-8")
        git("add", "-A")
        git("commit", "-qm", "base")

    def test_a_whole_worktree_reports_no_cone(self):
        self.assertEqual(M.sparse_paths(self.repo), [])
        self.assertTrue((self.repo / "Concepts" / "f.md").exists())

    def test_a_sparse_worktree_reports_its_cone_and_is_really_missing_files(self):
        self.g("sparse-checkout", "set", "--cone", "Plans")
        self.assertEqual(M.sparse_paths(self.repo), ["Plans"])
        self.assertFalse((self.repo / "Concepts" / "f.md").exists())
        self.assertTrue((self.repo / "Plans" / "f.md").exists())

    def test_disabling_it_puts_the_tree_back(self):
        self.g("sparse-checkout", "set", "--cone", "Plans")
        self.g("sparse-checkout", "disable")
        self.assertEqual(M.sparse_paths(self.repo), [])
        self.assertTrue((self.repo / "Concepts" / "f.md").exists())

    def test_a_directory_that_is_not_a_repository_is_not_called_sparse(self):
        with tempfile.TemporaryDirectory() as plain:
            self.assertEqual(M.sparse_paths(Path(plain)), [])


class LandingRun(unittest.TestCase):
    """main() on a real git repository, with each aggregate stubbed subcheck by subcheck.

    The stub prints at most 50 rows of a run-gates subcheck and 100 of an audit-governance one, and
    reports the true total beside them, as the real checks do. The rule tests below use it.
    """

    RG_READINESS = "validate_implementation_readiness"
    AG_READINESS = "implementation_readiness"

    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory()
        self.addCleanup(self.scratch.cleanup)
        self.repo = Path(self.scratch.name)
        self.module = load_module()
        self.git("init", "-q", "-b", "main")
        self.git("config", "user.email", "t@example.invalid")
        self.git("config", "user.name", "t")
        (self.repo / "Plans").mkdir()
        (self.repo / "Plans" / "Base.md").write_text("base\n", encoding="utf-8")
        self.git("add", "Plans/Base.md")
        self.git("commit", "-qm", "base")
        self.base = self.git("rev-parse", "HEAD").strip()
        self.timeouts = []

    def git(self, *args):
        return subprocess.run(["git", *args], cwd=self.repo, capture_output=True, text=True, check=True).stdout

    def touch(self, rel):
        path = self.repo / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("edited\n", encoding="utf-8")
        self.git("add", rel)
        self.git("commit", "-qm", rel)

    def stub(self, gates=None, audit=None, migration=()):
        """`gates` and `audit` map a subcheck to its rows, or to (rows, true total)."""
        def aggregate(name, spec, cap):
            blocks, totals = [], {}
            for subcheck, value in (spec or {}).items():
                rows, reported = value if isinstance(value, tuple) else (value, len(value))
                if reported:
                    blocks.append({"check": subcheck, "failures": list(rows)[:cap]})
                totals[subcheck] = {"status": "fail" if reported else "pass", "failures": reported}
            report = {"check": name, "status": "fail" if blocks else "pass", "failures": blocks}
            if name == "run-gates":
                report["checks"] = totals
            else:
                report.update(totals)
            return report
        reports = {
            "run-gates": aggregate("run-gates", gates, 50),
            "audit-governance": aggregate("audit-governance", audit, 100),
            "plan-migration-validate": {"status": "fail" if migration else "pass", "failures": list(migration)},
        }
        def run_check(name, root, run_dir, timeout):
            self.timeouts.append(timeout)
            return json.loads(json.dumps(reports[name]))
        self.module.run_check = run_check
        self.module.current_run_dir = lambda root: "Plans/.plan_migration/run-017"

    def run_main(self, *argv):
        import io, contextlib
        out, err = io.StringIO(), io.StringIO()
        sys.argv = ["pm-landing-check.py", "--root", str(self.repo), *argv]
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = self.module.main()
        self.stderr = err.getvalue()
        return code, out.getvalue()

    def record(self):
        code, out = self.run_main("--record-baseline", "--baseline", "baseline.json")
        self.assertEqual(code, 0, out + self.stderr)

    def compare(self, *argv):
        return self.run_main("--base", self.base, "--baseline", "baseline.json", *argv)


def drift(source_path):
    """The Event Authority currentness row for one inventoried source whose stored hash no longer
    matches. It names the source only in `source_path`; its `path` is empty."""
    return {"error": "event_authority_currentness_source_drift", "source_path": source_path}


def pnc_stale(source_path):
    return {"path": "Plans/.implementation_readiness/pnc019_certification_receipt.json",
            "error": "pnc019_source_hash_stale", "source_path": source_path,
            "expected": "a" * 64, "actual": "b" * 64}


def registry_row(family):
    """A readiness failure that is not staleness, one bucket per family, as the validator reports."""
    return {"path": f"Plans/storage_value_registry.json:families[{family}]",
            "error": "storage_value_secret_material_key", "key": "api_token"}


class RuleOneStalenessKinds(unittest.TestCase):
    """Rule 1: governance staleness covers every kind the AGENTS.md rule names."""

    NAMED = (
        "stale_hash",                                      # Spec Lock
        "artifact_hash_stale",                             # artifact evidence hashes
        "event_authority_currentness_source_drift",        # owner evidence hash of an edited source
        "event_authority_currentness_validator_drift",     # the receipt's hash of an edited validator
        "pnc019_source_hash_stale",                        # stale readiness rows
        "buildability_gate_report_stale_or_not_canonical",
        "buildability_passed_with_stale_source_hashes",
        "event_record_spec_lock_hash_stale",
        "execution_unit_context_spec_lock_hash_stale",
        "non_executable_closure_spec_lock_hash_stale",
        "storage_value_registry_spec_lock_hash_stale",
        "current_snapshot_live_span_metadata_mismatch",    # the plan-migration snapshot
        "stale_batch_report_sha256_after",
    )
    NOT_NAMED = (
        "event_authority_currentness_audit_unavailable",   # the audit inputs are absent, not stale
        "event_authority_currentness_artifact_drift",       # gitignored artifacts: no branch moves them
        "event_authority_checkpoint_changed_requires_fresh_approval",
        "pnc019_source_hash_path_missing",
        "implementation_readiness_self_tests_failed",
        "storage_value_secret_material_key",
        "shard_hash_stale",                                # regeneration forgotten: the branch's to fix
        "stale_generated_index_artifact",
        "subprocess_timeout",
    )

    def test_every_kind_the_rule_names_is_staleness_as_a_row_and_as_a_grown_bucket(self):
        for error in self.NAMED:
            item = M.normalize("run-gates", "s", {"path": "Plans/x.md", "error": error}, CHECKOUT)
            self.assertTrue(item["stale"], error)
            bucket = f"run-gates|s|{error}|Plans/x.md"
            self.assertTrue(M.grown_buckets({bucket: 10}, {bucket: 4})[0]["stale"], error)

    def test_kinds_the_rule_does_not_name_stay_failures(self):
        for error in self.NOT_NAMED:
            item = M.normalize("run-gates", "s", {"path": "Plans/x.md", "error": error}, CHECKOUT)
            self.assertFalse(item["stale"], error)
            bucket = f"run-gates|s|{error}|Plans/x.md"
            self.assertFalse(M.grown_buckets({bucket: 2}, {bucket: 1})[0]["stale"], error)


class RuleOneOnABranch(LandingRun):
    def test_source_drift_on_an_edited_document_is_staleness_and_exits_one(self):
        """The row the two 2026-09-21 shared-checkout landings stopped on: an edited document's
        currentness hash, named only in source_path."""
        self.stub(gates={self.RG_READINESS: [pnc_stale("Plans/Base.md")]},
                  audit={self.AG_READINESS: [pnc_stale("Plans/Base.md")]})
        self.record()
        self.touch("Plans/Touched.md")
        self.stub(gates={self.RG_READINESS: [pnc_stale("Plans/Base.md"), drift("Plans/Touched.md")]},
                  audit={self.AG_READINESS: [pnc_stale("Plans/Base.md"), drift("Plans/Touched.md")]})
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("Naming a path this branch touches: 2", out)
        self.assertIn("excused as governance staleness, by kind (2 in total)", out)
        self.assertIn("event_authority_currentness_source_drift", out)

    def test_an_edited_currentness_validator_is_staleness_with_a_reseal_request(self):
        """Review L-12, as decided: editing the validator the currentness receipt hashes makes its
        stored hash stale; only a currentness edition clears it, so it is reported, not blocked."""
        self.stub(gates={self.RG_READINESS: [pnc_stale("Plans/Base.md")]})
        self.record()
        self.touch("scripts/pm-event-authority-currentness.py")
        drifted = {"error": "event_authority_currentness_validator_drift",
                   "validator_path": "scripts/pm-event-authority-currentness.py"}
        self.stub(gates={self.RG_READINESS: [pnc_stale("Plans/Base.md"), drifted]})
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("Naming a path this branch touches: 1", out)
        self.assertIn("event_authority_currentness_validator_drift", out)
        self.assertIn("ask the Plans agent for a reseal", out)

    def test_a_readiness_failure_that_is_not_staleness_on_an_edited_document_exits_two(self):
        self.stub(gates={self.RG_READINESS: [pnc_stale("Plans/Base.md")]})
        self.record()
        self.touch("Plans/Touched.md")
        missing = {"error": "event_authority_currentness_source_missing", "source_path": "Plans/Touched.md"}
        self.stub(gates={self.RG_READINESS: [pnc_stale("Plans/Base.md"), missing]})
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("the baseline does not excuse", out)


class RuleOneReadinessGrowthCounter(LandingRun):
    """The readiness total is the growth counter of the stale readiness rows. Both 2026-09-21
    shared-checkout landings stopped on it: 124 to 218 in each aggregate, 50 and 100 rows printed."""

    def baseline_rows(self):
        return [pnc_stale("Plans/A.md"), pnc_stale("Plans/B.md"), registry_row(96), registry_row(99)]

    def record_readiness(self):
        self.stub(gates={self.RG_READINESS: (self.baseline_rows(), 124)},
                  audit={self.AG_READINESS: (self.baseline_rows(), 124)})
        self.record()
        self.touch("Plans/Touched.md")

    def test_a_rise_past_the_print_cap_made_of_stale_rows_exits_one(self):
        self.record_readiness()
        grown = [drift("Plans/Touched.md"), drift("Plans/Other.md")] + self.baseline_rows()
        self.stub(gates={self.RG_READINESS: (grown, 218)}, audit={self.AG_READINESS: (grown, 218)})
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("[staleness] run-gates/validate_implementation_readiness  124 -> 218", out)
        self.assertIn("[staleness] audit-governance/implementation_readiness  124 -> 218", out)
        self.assertIn("readiness growth counter", out)
        report = json.loads(self.compare("--json")[1])
        self.assertEqual(report["blocking"], 0)
        self.assertTrue(all(row["stale"] for row in report["grown_subchecks"]))

    def test_a_rise_whose_sample_shows_a_new_failure_that_is_not_staleness_blocks(self):
        self.record_readiness()
        grown = [drift("Plans/Touched.md"), registry_row(147)] + self.baseline_rows()
        self.stub(gates={self.RG_READINESS: (grown, 218)}, audit={self.AG_READINESS: (grown, 218)})
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("[blocking ] run-gates/validate_implementation_readiness  124 -> 218", out)

    def test_a_rise_whose_sample_shows_no_stale_growth_blocks(self):
        """Nothing printed says the rise is staleness, so it is judged like any truncated rise."""
        self.record_readiness()
        self.stub(gates={self.RG_READINESS: (self.baseline_rows(), 218)},
                  audit={self.AG_READINESS: (self.baseline_rows(), 218)})
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("cannot be matched", out)

    def test_a_truncated_rise_outside_readiness_still_blocks_even_when_its_rows_are_stale(self):
        """Growth counters are the readiness rule only; evidence and plan-graph rises keep exit 2."""
        stale_rows = [{"path": f"Plans/_shards/d{n}/manifest.json", "error": "artifact_hash_stale"} for n in range(3)]
        self.stub(gates={"validate_evidence": (stale_rows[:2], 665)})
        self.record()
        self.touch("Plans/Touched.md")
        self.stub(gates={"validate_evidence": (stale_rows, 876)})
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("[blocking ] run-gates/validate_evidence  665 -> 876", out)


def self_test_row(*failing, scenario="case_l_verification_integration"):
    """implementation_readiness_self_tests_failed as the readiness validator prints it: it names the
    validator and lists the scenario's checks that came out false."""
    return {"path": "scripts/pm-implementation-readiness.py",
            "error": "implementation_readiness_self_tests_failed",
            "failures": [{"scenario": scenario, "checks": {name: False for name in failing}}]}


class RuleTwoPreExisting(LandingRun):
    """Rule 2: a failure in a baseline bucket whose count has not risen is pre-existing, content
    changed or not. It never blocks and is reported as pre-existing or improved with both counts."""

    VALIDATOR = "scripts/pm-implementation-readiness.py"

    def test_seven_rows_dropping_to_three_on_a_touched_file_are_improved_and_exit_one(self):
        seven = [self_test_row(f"check_{n}") for n in range(7)]
        self.stub(audit={self.AG_READINESS: seven})
        self.record()
        self.touch(self.VALIDATOR)
        three = [self_test_row(f"check_{n}", "residual") for n in range(3)]  # the content moved too
        self.stub(audit={self.AG_READINESS: three})
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("New since the baseline: 0", out)
        self.assertIn("Pre-existing, in a baseline bucket whose count has not risen (never blocks): 3", out)
        self.assertIn("[improved    ] audit-governance/implementation_readiness  "
                      "implementation_readiness_self_tests_failed  scripts/pm-implementation-readiness.py  7 -> 3", out)
        self.assertIn("3 of them with changed content on files this branch touched", out)
        report = json.loads(self.compare("--json")[1])
        self.assertEqual(report["blocking"], 0)
        self.assertEqual({(i["standing"], i["baseline_count"], i["count"]) for i in report["on_branch"]},
                         {("improved", 7, 3)})

    def test_the_recorded_shape_one_row_whose_list_shrank_is_pre_existing(self):
        """What the storage registry repairs landing saw: one row listing seven false checks on main
        and three on the branch. One bucket of one row both times; only the fingerprint moved."""
        self.stub(audit={self.AG_READINESS: [self_test_row(*[f"check_{n}" for n in range(7)])]})
        self.record()
        self.touch(self.VALIDATOR)
        self.stub(audit={self.AG_READINESS: [self_test_row("check_0", "check_1", "check_2")]})
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("[pre-existing] audit-governance/implementation_readiness  "
                      "implementation_readiness_self_tests_failed  scripts/pm-implementation-readiness.py  1 -> 1", out)

    def test_a_count_that_rose_on_a_touched_file_still_blocks(self):
        three = [self_test_row(f"check_{n}") for n in range(3)]
        self.stub(audit={self.AG_READINESS: three})
        self.record()
        self.touch(self.VALIDATOR)
        self.stub(audit={self.AG_READINESS: three + [self_test_row("check_new")]})
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("Pre-existing, in a baseline bucket whose count has not risen (never blocks): 0", out)
        self.assertIn("Checks whose failure count rose: 1", out)
        self.assertIn("3 -> 4", out)

    def test_changed_content_off_the_branch_is_pre_existing_not_new(self):
        """Before rule 2 this row read as new; it is the same failure with a different surface."""
        self.stub(gates={"lint_path_refs": [PATH_REF]})
        self.record()
        self.touch("Plans/Touched.md")
        self.stub(gates={"lint_path_refs": [dict(PATH_REF, implementation_surface="tests/fixtures/other")]})
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("New since the baseline: 0", out)
        self.assertIn("1 -> 1", out)
        self.assertIn("(content changed)", out)
        recorded = json.loads((self.repo / "baseline.json").read_text(encoding="utf-8"))["commit"]
        self.assertIn(f"counted against the baseline recorded at {recorded[:12]}, not against main", out)

    def test_a_sampled_subcheck_compares_the_counts_inside_its_sample(self):
        """In a truncated subcheck both counts are the rows printed; the row is in both samples."""
        filler = [registry_row(n) for n in range(49)]
        row = self_test_row("check_0")
        self.stub(gates={self.RG_READINESS: ([row] + filler, 79)})
        self.record()
        self.touch(self.VALIDATOR)
        self.stub(gates={self.RG_READINESS: ([self_test_row("check_1")] + filler, 79)})
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("[pre-existing] run-gates/validate_implementation_readiness", out)

    def test_a_row_the_baseline_sample_never_printed_is_not_in_the_baseline_and_blocks(self):
        """Rule 2 reads baseline.json. A row that sat above the baseline's print cap is not in it, so
        when it falls inside the sample on a touched file it is judged as before. The storage registry
        repairs landing's run-gates copy of the self-test row was such a row; with no audit-governance
        copy to judge it instead (review L-07, PairedValidatorCopies below), it still blocks."""
        filler = [registry_row(n) for n in range(50)]
        row = self_test_row("check_0")
        self.stub(gates={self.RG_READINESS: (filler + [row], 51)})
        self.record()
        self.touch(self.VALIDATOR)
        self.stub(gates={self.RG_READINESS: ([row] + filler, 51)})
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("the baseline does not excuse", out)


class RuleTwoNeedsACurrentBaseline(LandingRun):
    """Review L-05, as the brief owner answered it: rule 2 applies only while the baseline is current,
    its commit an ancestor of the base and no more than seven days older than it by commit time.
    Against a stale baseline such a failure on a touched file stops the landing, as before rule 2,
    and the report's first lines say the baseline must be re-recorded before the next landing."""

    VALIDATOR = "scripts/pm-implementation-readiness.py"

    def record_seven(self):
        """The recorded shape of rule 2: one self-test row listing seven false checks at the baseline."""
        self.stub(audit={self.AG_READINESS: [self_test_row(*[f"check_{n}" for n in range(7)])]})
        self.record()

    def main_moves_on(self, seconds):
        """A commit on main `seconds` after the baseline's commit by commit time: the rebase target."""
        then = int(self.git("show", "-s", "--format=%ct", "HEAD").strip()) + seconds
        env = dict(os.environ, GIT_COMMITTER_DATE=f"@{then} +0000", GIT_AUTHOR_DATE=f"@{then} +0000")
        (self.repo / "Plans" / "Later.md").write_text("main moved on\n", encoding="utf-8")
        self.git("add", "Plans/Later.md")
        subprocess.run(["git", "commit", "-qm", "later"], cwd=self.repo, env=env, check=True, capture_output=True)
        return self.git("rev-parse", "HEAD").strip()

    def land(self, base):
        """The branch edits the validator and its self-test row now lists three false checks: same
        bucket, same count, changed content. Returns the text run and the --json run."""
        self.touch(self.VALIDATOR)
        self.stub(audit={self.AG_READINESS: [self_test_row("check_0", "check_1", "check_2")]})
        text = self.run_main("--base", base, "--baseline", "baseline.json")
        code, out = self.run_main("--base", base, "--baseline", "baseline.json", "--json")
        return text, (code, json.loads(out), self.stderr)

    def test_a_baseline_seven_days_older_than_the_base_is_current_and_rule_two_applies(self):
        """The bound is inclusive: exactly seven days older still counts as current."""
        self.record_seven()
        base = self.main_moves_on(7 * 86400)
        (code, out), (json_code, report, _) = self.land(base)
        self.assertEqual((code, json_code), (1, 1), out)
        self.assertTrue(out.startswith("pm-landing-check: baseline "), out)
        self.assertIn("the baseline is current, so rule 2 applies: its commit", out)
        self.assertIn("and 7.00 days older than it, within 7", out)
        self.assertIn("[pre-existing] audit-governance/implementation_readiness", out)
        currency = report["baseline_currency"]
        self.assertEqual((currency["rule_two_applies"], currency["ancestor"], currency["age_days"]), (True, True, 7.0))
        self.assertEqual((len(report["pre_existing"]), report["blocking"]), (1, 0))

    def test_a_baseline_more_than_seven_days_older_turns_rule_two_off_and_says_so_first(self):
        self.record_seven()
        base = self.main_moves_on(8 * 86400)
        (code, out), (json_code, report, stderr) = self.land(base)
        self.assertEqual((code, json_code), (2, 2), out)
        first = out.splitlines()[:3]
        self.assertTrue(first[0].startswith("pm-landing-check: the baseline is stale, so rule 2 (pre-existing "
                                            "failures never block) is off for this landing: its commit"), first)
        self.assertIn("is 8.00 days older than the base", first[0])
        self.assertIn("more than the 7 rule 2 allows", first[0])
        self.assertIn("on a file this branch touched it stops the landing", first[1])
        self.assertIn("Re-record the baseline before the next landing", first[2])
        self.assertIn("never to make this landing pass", first[2])
        self.assertIn("(never blocks): 0 (rule 2 is off: the baseline is stale", out)
        self.assertIn("[blocking    ] audit-governance/implementation_readiness", out)
        self.assertIn("the baseline does not excuse", out)
        currency = report["baseline_currency"]
        self.assertEqual((currency["rule_two_applies"], currency["ancestor"], currency["age_days"]), (False, True, 8.0))
        self.assertEqual((report["pre_existing"], report["blocking"]), ([], 1))
        self.assertTrue(stderr.startswith("pm-landing-check: the baseline is stale"), stderr)

    def test_a_baseline_whose_commit_is_not_on_the_base_turns_rule_two_off(self):
        """The first baseline named its branch's own first commit, which the rebase at landing left off
        main: a baseline must be recorded at a commit of main."""
        self.git("checkout", "-q", "-b", "side")
        (self.repo / "Plans" / "Side.md").write_text("side\n", encoding="utf-8")
        self.git("add", "Plans/Side.md")
        self.git("commit", "-qm", "side")
        self.record_seven()
        self.git("checkout", "-q", "main")
        (code, out), (_, report, _) = self.land(self.base)
        self.assertEqual(code, 2, out)
        self.assertIn("is off for this landing: its commit", out.splitlines()[0])
        self.assertIn("is not an ancestor of the base", out.splitlines()[0])
        self.assertEqual((report["baseline_currency"]["ancestor"], report["blocking"]), (False, 1))

    def test_one_second_past_seven_days_is_stale_and_an_unknown_commit_is_never_current(self):
        self.stub()
        base = self.main_moves_on(7 * 86400 + 1)
        past = self.module.baseline_currency(self.repo, self.base, base)
        self.assertFalse(past["rule_two_applies"], past)
        self.assertTrue(self.module.baseline_currency(self.repo, self.base, self.base)["rule_two_applies"])
        self.assertEqual(self.module.baseline_currency(self.repo, None, base)["reason"],
                         "the baseline names no commit")
        unknown = self.module.baseline_currency(self.repo, "c0ffee" * 6 + "c0ff", base)
        self.assertFalse(unknown["rule_two_applies"])
        self.assertIn("is not a commit this repository has", unknown["reason"])


def timeout_row(command_id="lint-contractrefs", seconds=180):
    """What pm-plans-verify.py reports for a subcheck it killed at its bound: the row both aggregates
    printed for lint-contractrefs at the terminal.workgroup_moved landing of 2026-09-24."""
    return {"error": "subprocess_timeout", "timeout_seconds": seconds, "process_group_killed": True,
            "kill_mechanism": "os.killpg(1533414, SIGKILL)", "stdout_excerpt": "", "stderr_excerpt": "",
            "command_id": command_id}


MISSING_REF = {"path": "Plans/00-plans-index.md", "error": "missing_ref",
               "bad_ref": "Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json"}


class RuleThreeTimeouts(LandingRun):
    """Rule 3: a subcheck that times out is an infrastructure result, never a new failure, growth or
    a blocker. Measured case: lint-contractrefs takes about 199 s in the shared checkout on the
    network mount and finds nothing when run alone; the old 180 s bound killed it."""

    def test_the_default_bound_is_600_seconds_above_the_measured_199(self):
        self.stub(gates={"verify_spec_lock": [STALE_HASH]})
        self.record()
        self.assertEqual(self.timeouts, [600, 600, 600])
        self.assertLess(199, self.module.DEFAULT_SUBCHECK_TIMEOUT_SECONDS)

    def test_lint_contractrefs_killed_at_its_bound_is_reported_on_its_own_line(self):
        self.stub(gates={"verify_spec_lock": [STALE_HASH]})
        self.record()
        self.touch("Plans/Touched.md")
        self.stub(gates={"verify_spec_lock": [STALE_HASH], "lint_contractrefs": [timeout_row()]},
                  audit={"support_refs": [timeout_row()]})
        code, out = self.compare("--subcheck-timeout-seconds", "180")
        self.assertEqual(code, 1, out)  # review L-08: not fully verified, so never 0
        self.assertIn("Infrastructure results, not failures of this tree (never new, growth or blocking): 2", out)
        self.assertIn("[infrastructure] run-gates/lint_contractrefs  subprocess_timeout (lint-contractrefs)  "
                      "killed after 180 s, at its limit of 180 s; what it would report is unknown", out)
        self.assertIn("[infrastructure] audit-governance/support_refs  subprocess_timeout (lint-contractrefs)  "
                      "killed after 180 s", out)
        self.assertIn("New since the baseline: 0", out)
        self.assertIn("Subchecks reporting more failures than the baseline: 0", out)
        self.assertIn("1 infrastructure result among them", out)
        self.assertIn("2 subchecks did not finish within 180 s", out)
        report = json.loads(self.compare("--json", "--subcheck-timeout-seconds", "180")[1])
        self.assertEqual([(r["check"], r["subcheck"], r["elapsed_seconds"], r["limit_seconds"])
                          for r in report["infrastructure"]],
                         [("run-gates", "lint_contractrefs", 180, 180), ("audit-governance", "support_refs", 180, 180)])
        self.assertEqual((report["new"], report["grown_subchecks"], report["blocking"]), ([], [], 0))

    def test_a_timeout_lifts_exit_zero_to_one_and_leaves_one_and_two_alone(self):
        """Review L-08: a timeout is never growth or a blocker, so it cannot make a 2; it only says the
        run was not fully verified, which lifts a 0 to 1."""
        self.stub(gates={"verify_spec_lock": [STALE_HASH]})
        self.record()
        self.touch("Plans/Touched.md")
        cases = (
            ([], 0, 1),
            ([{"path": "Plans/Glossary.md", "error": "brand_new_kind"}], 1, 1),
            ([{"path": "Plans/Touched.md", "error": "brand_new_kind"}], 2, 2),
        )
        for extra, expected_without, expected_with in cases:
            with self.subTest(expected=expected_without):
                self.stub(gates={"verify_spec_lock": [STALE_HASH] + extra})
                without, _ = self.compare()
                self.stub(gates={"verify_spec_lock": [STALE_HASH] + extra, "lint_contractrefs": [timeout_row()]},
                          audit={"support_refs": [timeout_row()]})
                code, out = self.compare()
                self.assertEqual((without, code), (expected_without, expected_with), out)

    def test_what_a_timed_out_subcheck_found_before_is_not_reported_gone(self):
        """Its result is unknown, so the baseline's rows for it are neither gone nor compared."""
        self.stub(gates={"lint_contractrefs": [MISSING_REF]})
        self.record()
        self.touch("Plans/Touched.md")
        self.stub(gates={"lint_contractrefs": [timeout_row()]})
        code, out = self.compare()
        self.assertEqual(code, 1, out)  # review L-08: the timeout alone lifts 0 to 1
        self.assertIn("Gone since the baseline (nothing to do): 0", out)

    def test_a_baseline_is_not_recorded_from_a_run_with_a_timeout(self):
        self.stub(gates={"lint_contractrefs": [timeout_row()]})
        code, _ = self.run_main("--record-baseline", "--baseline", "baseline.json")
        self.assertEqual(code, 3)
        self.assertFalse((self.repo / "baseline.json").exists())
        self.assertIn("not recording a baseline", self.stderr)

    def test_the_in_process_timeout_is_infrastructure_too(self):
        row = {"check": "verify_spec_lock", "error": "subcheck_timeout", "timeout_seconds": 600,
               "message": "verify_spec_lock exceeded 600s"}
        infra, rest = M.split_infrastructure([M.normalize("run-gates", "verify_spec_lock", row, CHECKOUT)])
        self.assertEqual((len(infra), rest), (1, []))
        self.assertEqual(infra[0]["elapsed_seconds"], 600)

    def test_a_real_lint_contractrefs_failure_is_still_a_failure(self):
        """Only the timeout row is infrastructure: what the subcheck reports when it finishes counts,
        and so does a crash."""
        self.stub(gates={"verify_spec_lock": [STALE_HASH]})
        self.record()
        self.touch("Plans/Touched.md")
        self.stub(gates={"verify_spec_lock": [STALE_HASH], "lint_contractrefs": [MISSING_REF]})
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("New since the baseline: 1", out)
        self.assertIn("[off-branch] run-gates/lint_contractrefs  0 -> 1", out)
        self.assertIn("Infrastructure results, not failures of this tree (never new, growth or blocking): 0", out)
        crash = M.normalize("run-gates", "lint_contractrefs", {"error": "subcheck_exception", "message": "boom"}, CHECKOUT)
        self.assertEqual(M.split_infrastructure([crash]), ([], [crash]))


class ReviewLimits(LandingRun):
    """Review findings L-02, L-04 and L-08 of the 2026-09-24 blind review."""

    def test_a_readiness_rise_whose_stale_growth_names_no_branch_file_blocks(self):
        """L-02: main's own drift rows are visible, the branch's edited files show no staleness, and
        a real failure sits above the cap. The rise is not the branch's staleness, so it blocks."""
        rows = [pnc_stale(f"Plans/P{n}.md") for n in range(60)] + [registry_row(n) for n in range(64)]
        self.stub(gates={self.RG_READINESS: (rows, 124)}, audit={self.AG_READINESS: (rows, 124)})
        self.record()
        self.touch("Plans/Touched.md")
        grown = [drift(f"Plans/D{n}.md") for n in range(94)] + rows
        self.stub(gates={self.RG_READINESS: (grown, 218)}, audit={self.AG_READINESS: (grown, 218)})
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("[blocking ] run-gates/validate_implementation_readiness  124 -> 218", out)

    def test_a_same_bucket_swap_on_a_touched_file_is_pre_existing_and_flagged(self):
        """L-04, a documented limit of rule 2: one missing ref fixed and another added on the same
        edited document keeps the bucket count, so it does not block, but it is not called clean."""
        self.stub(gates={"lint_path_refs": [dict(MISSING_REF, path="Plans/Touched.md")]})
        self.record()
        self.touch("Plans/Touched.md")
        self.stub(gates={"lint_path_refs": [dict(MISSING_REF, path="Plans/Touched.md", bad_ref="Plans/Other.md")]})
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("1 of them with changed content on files this branch touched", out)
        self.assertNotIn("nothing for this branch to fix", out)

    def test_a_timeout_alone_is_not_reported_as_nothing(self):
        """L-08: the summary must not call the run clean; since the follow-up it exits 1, not 0."""
        self.stub(gates={"verify_spec_lock": [STALE_HASH]})
        self.record()
        self.touch("Plans/Touched.md")
        self.stub(gates={"verify_spec_lock": [STALE_HASH], "lint_path_refs": [timeout_row("lint-path-refs")]})
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertNotIn("Nothing to report.", out)
        self.assertIn("This is not a clean result", out)
        self.assertIn("before pushing main", out)


def same_validator_commands(root, names, timeout_seconds):
    """Stands in for pm-plans-verify.py's own map: `validate_<x>` in run-gates and `<x>` in
    audit-governance run one command, as they do in the real script."""
    def command(name):
        return "validate-" + (name[len("validate_"):] if name.startswith("validate_") else name).replace("_", "-")
    return {(check, name): command(name) for check in names for name in names[check]}


class PairedValidatorCopies(LandingRun):
    """Review L-07, as the brief owner answered it: the run-gates copy of a validator is judged by its
    audit-governance copy when both ran the same validator at the same version on the same inputs in
    the same run and their totals agree, and the audit-governance copy printed every failure; then
    the run-gates sample is not used. Otherwise the run-gates copy keeps the truncated rule, and the
    summary says why. Either way it prints the pairing, so a replay shows which copy was judged."""

    VALIDATOR = "scripts/pm-implementation-readiness.py"

    def setUp(self):
        super().setUp()
        self.module.aggregate_subcheck_commands = same_validator_commands

    def storage_shape(self, gates=None, audit=None):
        """The storage registry repairs landing of 2026-09-24. At the baseline the readiness validator
        reported 79: run-gates printed 50 of them, without the self-test row, and audit-governance all
        79, with it. On the branch, which edits the validator, both print all 33, and the self-test row
        lists three false checks instead of seven."""
        at_baseline = [registry_row(n) for n in range(78)] + [self_test_row(*[f"check_{n}" for n in range(7)])]
        self.stub(gates={self.RG_READINESS: at_baseline}, audit={self.AG_READINESS: at_baseline})
        self.record()
        self.touch(self.VALIDATOR)
        on_branch = [registry_row(n) for n in range(32)] + [self_test_row("check_0", "check_1", "check_2")]
        self.stub(gates={self.RG_READINESS: on_branch if gates is None else gates},
                  audit={self.AG_READINESS: on_branch if audit is None else audit})
        return on_branch

    def test_the_storage_registry_shape_is_judged_by_the_complete_audit_governance_copy(self):
        """The motivating case: exit 2 on the run-gates copy's row before, exit 1 now."""
        self.storage_shape()
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("1 run-gates subcheck prints only a sample of its failures, now or in the baseline; 1 of "
                      "them is judged by the audit-governance copy", out)
        self.assertIn("[paired    ] run-gates/validate_implementation_readiness (33 of 33 printed, 50 of 79 in "
                      "the baseline) is judged by audit-governance/implementation_readiness: the same command "
                      "(validate-implementation-readiness) at the same version, totals 33 = 33", out)
        self.assertIn("[pre-existing] audit-governance/implementation_readiness  "
                      "implementation_readiness_self_tests_failed  scripts/pm-implementation-readiness.py  1 -> 1", out)
        self.assertNotIn("[blocking", out)
        report = json.loads(self.compare("--json")[1])
        self.assertEqual(report["blocking"], 0)
        [pair] = report["validator_pairs"]
        self.assertEqual((pair["paired"], pair["judged"], pair["audit_governance"]),
                         (True, "audit-governance/implementation_readiness", "implementation_readiness"))
        self.assertEqual({row["check"] for row in report["on_branch"]}, {"audit-governance"})
        self.assertNotIn("run-gates/validate_implementation_readiness", report["subchecks_compared_by_total_only"])

    def test_totals_that_disagree_fall_back_to_the_truncated_rule_and_say_why(self):
        on_branch = self.storage_shape(audit=[registry_row(n) for n in range(1, 32)]
                                       + [self_test_row("check_0", "check_1", "check_2")])
        self.assertEqual(len(on_branch), 33)
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("[not paired] run-gates/validate_implementation_readiness and "
                      "audit-governance/implementation_readiness (33 of 33 printed, 50 of 79 in the baseline): "
                      "the totals disagree: run-gates 33, audit-governance 32; the run-gates copy is judged on "
                      "its own, by the truncated rule", out)
        self.assertIn("[blocking    ] run-gates/validate_implementation_readiness", out)

    def test_a_timeout_in_the_audit_governance_copy_falls_back(self):
        self.storage_shape(audit=[timeout_row("validate-implementation-readiness", 600)])
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("(33 of 33 printed, 50 of 79 in the baseline): the audit-governance copy timed out;", out)
        self.assertIn("[blocking    ] run-gates/validate_implementation_readiness", out)

    def test_a_run_gates_row_the_audit_governance_copy_lacks_falls_back(self):
        """Equal totals are not enough: the rows must be the same failures."""
        self.storage_shape(gates=[registry_row(n) for n in range(32)] + [self_test_row("check_9")])
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn(": 1 of the rows the run-gates copy printed is not among the audit-governance copy's rows;", out)

    def test_validator_code_that_changes_between_the_two_aggregates_falls_back(self):
        self.storage_shape()
        inner = self.module.run_check

        def run_check(name, root, run_dir, timeout):
            if name == "audit-governance":
                (self.repo / "scripts" / "pm-plans-verify-helper.py").write_text("edited mid-run\n", encoding="utf-8")
            return inner(name, root, run_dir, timeout)
        self.module.run_check = run_check
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn(": a file under scripts/ changed between the two aggregate runs;", out)

    def test_an_audit_governance_copy_that_prints_only_a_sample_does_not_judge(self):
        """The evidence and plan-graph shape: both copies are truncated, so both rises still block."""
        stale_rows = [{"path": f"Plans/_shards/d{n}/manifest.json", "error": "artifact_hash_stale"} for n in range(3)]
        self.stub(gates={"validate_evidence": (stale_rows[:2], 665)}, audit={"evidence": (stale_rows[:2], 665)})
        self.record()
        self.touch("Plans/Touched.md")
        self.stub(gates={"validate_evidence": (stale_rows, 876)}, audit={"evidence": (stale_rows, 876)})
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("[not paired] run-gates/validate_evidence and audit-governance/evidence (3 of 876 printed, "
                      "2 of 665 in the baseline): the audit-governance copy prints 3 of 876, so its rows do not "
                      "key every failure", out)
        self.assertIn("[blocking ] run-gates/validate_evidence  665 -> 876", out)
        self.assertIn("[blocking ] audit-governance/evidence  665 -> 876", out)

    def test_without_the_subcheck_map_nothing_is_paired(self):
        """A tree whose scripts/pm-plans-verify.py cannot be read pairs nothing and says so."""
        self.module.aggregate_subcheck_commands = M.aggregate_subcheck_commands
        self.storage_shape()
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("what each subcheck runs could not be read from scripts/pm-plans-verify.py "
                      "(RuntimeError: scripts/pm-plans-verify.py is missing)", out)

    def test_the_real_pm_plans_verify_map_pairs_what_both_aggregates_run(self):
        names = {"run-gates": {"validate_implementation_readiness", "verify_spec_lock", "lint_contractrefs",
                               "validate_evidence", "validate_new_contracts"},
                 "audit-governance": {"implementation_readiness", "spec_lock", "support_refs", "plan_graph"}}
        path_before = list(sys.path)
        commands = M.aggregate_subcheck_commands(ROOT, names, 600)
        self.assertEqual(sys.path, path_before)
        self.assertEqual(commands[("run-gates", "validate_implementation_readiness")],
                         "validate-implementation-readiness --subcheck-timeout-seconds 600")
        self.assertEqual(commands[("run-gates", "validate_implementation_readiness")],
                         commands[("audit-governance", "implementation_readiness")])
        self.assertEqual(commands[("run-gates", "verify_spec_lock")], commands[("audit-governance", "spec_lock")])
        self.assertEqual(commands[("run-gates", "lint_contractrefs")], commands[("audit-governance", "support_refs")])
        self.assertNotEqual(commands[("run-gates", "validate_evidence")], commands[("audit-governance", "plan_graph")])


class TimeoutsLiftExitZero(LandingRun):
    """Review L-08, as the brief owner answered it: a subcheck timeout lifts exit 0 to 1, because the
    run was not fully verified; exit 0 stays for a complete run with nothing to report."""

    def run_with(self, *extra_subchecks):
        self.stub(gates={"verify_spec_lock": [STALE_HASH]})
        self.record()
        self.touch("Plans/Touched.md")
        self.stub(gates={"verify_spec_lock": [STALE_HASH], **dict(extra_subchecks)})
        return self.compare()

    def test_a_timeout_alone_exits_one_because_the_run_was_not_fully_verified(self):
        code, out = self.run_with(("lint_path_refs", [timeout_row("lint-path-refs", 600)]))
        self.assertEqual(code, 1, out)
        self.assertIn("not fully verified and exits 1, not 0", out)
        # The timeout line names the subcheck, how long it ran and the limit.
        self.assertIn("[infrastructure] run-gates/lint_path_refs  subprocess_timeout (lint-path-refs)  "
                      "killed after 600 s, at its limit of 600 s", out)
        self.assertIn("1 subcheck did not finish within 600 s, the limit (run-gates/lint_path_refs killed after "
                      "600 s)", out)
        self.assertIn("it cannot exit 0", out)

    def test_a_complete_run_with_nothing_to_report_still_exits_zero(self):
        code, out = self.run_with()
        self.assertEqual(code, 0, out)
        self.assertIn("Nothing to report. The three checks found only what the baseline already knew.", out)
        self.assertNotIn("not fully verified", out)

    def test_the_exit_code_counts_a_timeout_only_where_it_would_otherwise_be_zero(self):
        infra = [{"check": "run-gates", "subcheck": "lint_path_refs", "error": "subprocess_timeout"}]
        blocking = [{"stale": False}]
        self.assertEqual(M.exit_code([], [], [], []), 0)
        self.assertEqual(M.exit_code([], [], [], [], infra), 1)
        self.assertEqual(M.exit_code([{"k": 1}], [], [], [], infra), 1)
        self.assertEqual(M.exit_code([{"k": 1}], [], [], blocking, infra), 2)


class KeptCheckReports(LandingRun):
    """Review L-03: the --json report keeps only the rows it reports, so a replay of a sampled
    subcheck from it cannot see the rest of the sample. --keep-check-reports keeps every printed row."""

    def test_each_check_s_full_report_is_kept_outside_the_repository(self):
        self.stub(gates={"verify_spec_lock": [STALE_HASH]}, migration=[SPAN_META])
        self.record()
        self.touch("Plans/Touched.md")
        with tempfile.TemporaryDirectory() as keep:
            code, out = self.compare("--keep-check-reports", keep)
            self.assertEqual(code, 0, out)
            self.assertIn(f"full check reports kept in {Path(keep).resolve()}", out)
            self.assertEqual(sorted(path.name for path in Path(keep).iterdir()),
                             ["audit-governance.json", "plan-migration-validate.json", "run-gates.json"])
            kept = json.loads((Path(keep) / "run-gates.json").read_text(encoding="utf-8"))
            self.assertEqual(kept["failures"][0]["failures"], [STALE_HASH])
            migration = json.loads((Path(keep) / "plan-migration-validate.json").read_text(encoding="utf-8"))
            self.assertEqual(migration["failures"], [SPAN_META])

    def test_a_directory_inside_the_repository_is_refused_before_anything_runs(self):
        ran = []
        self.stub(gates={"verify_spec_lock": [STALE_HASH]})
        inner = self.module.run_check
        self.module.run_check = lambda *a, **k: (ran.append(1), inner(*a, **k))[1]
        code, _ = self.compare("--keep-check-reports", str(self.repo / "kept"))
        self.assertEqual(code, 3)
        self.assertEqual(ran, [])
        self.assertFalse((self.repo / "kept").exists())
        self.assertIn("--keep-check-reports must name a directory outside the repository", self.stderr)


# ------------------------------------------------------------------ keyed from exports (2026-09-24)

# The reviewer's export of validate-plan-graph on plans/ea-certified-anchors-20260924 rebased on b3169c48d9
# (~/PM-Experiments/review-ea-anchors-20260924/chk-validate-plan-graph-export-rebased.json, SHA-256
# c6a0a6d105ae113d6ea58e538314df2deec448483e0a6b2b59cdeb7ba4934063): 133 rows in this order. First 132
# artifact_hash_stale rows of the live plan-sharding evidence bundle, for Plans/storage-plan.md, its 84
# shards, Plans/Goal_Runtime_System.md and its 46 shards; then main's one missing_ref. The artifacts and the
# missing_ref are copied as they are. The hash values are stand-ins: the key drops `expected` and `actual`
# (VALUE_KEYS), and nothing else reads them.
EA_EVIDENCE_BUNDLE = "Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json"
EA_STORAGE_PLAN_SHARDS = (
    "00-index.md", "manifest.json", "001-preamble.md", "002-canonical-owner-section-requirements.md",
    "003-summary.md", "004-table-of-contents.md", "005-1.-definitions-and-concepts.md",
    "006-2.-how-we-re-going-to-do-it.md", "007-3.-implementation-checklist.md",
    "008-4.-impact-on-chat-assistant-interview.md", "009-5.-gaps-and-how-we-address-them.md",
    "010-6.-potential-problems-and-solutions.md",
    "011-7.-backup-restore-compaction-and-optional-storage-enhancements.md",
    "012-8.-implementation-order-and-testing.md", "013-version-history.md",
    "014-scheduler-runtime-safe-point-and-remediation-storage-addendum-20.md",
    "015-runtime-attempt-safe-point-queue-analysis-storage-addendum-2026-.md",
    "016-runtime-attempt-safe-point-queue-analysis-canonical-alignment-20.md",
    "017-runtime-recovery-persistence-and-restart-canonical-alignment-202.md",
    "018-permission-snapshot-storage-and-safe-point-namespace-addendum.md",
    "019-assistant-worktree-binding-storage-addendum.md", "020-8.-web-content-caching-persistence.md",
    "021-owner-consumer-map.md", "022-planunits.md", "023-migration-coverage.md",
    "024-ledger-compile-addendum-pldg-20260614-001.md", "025-ledger-compile-addendum-pldg-20260616-001.md",
    "026-ledger-compile-addendum-pldg-20260616-002.md",
    "027-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md",
    "028-ledger-compile-addendum-pldg-20260622-001-fff.md",
    "029-ledger-compile-addendum-pldg-20260626-001-feature-name.md",
    "030-ledger-compile-addendum-pldg-20260627-001-feature-intake.md",
    "031-ledger-compile-addendum-pldg-20260629-001-feature-name.md",
    "032-ledger-compile-addendum-pldg-20260630-001-feature-intake.md",
    "033-ledger-compile-addendum-pldg-20260703-001-feature-intake.md",
    "034-fable-deferred-action-concrete-repair-addendum-2026-07-08.md",
    "035-fable-remaining-action-plan-audit-lineage-notes-2026-07-08.md",
    "036-usage-gui-propagation-addendum-2026-07-09.md", "037-case-l-durable-state-owner-canon-2026-07-17.md",
    "038-known-37-case-l-owner-materialization.md", "039-pmconcept7-home-workspace-layout-2026-08-04.md",
    "040-run-debug-revival-addendum-2026-07-27.md",
    "041-shared-integration-runtime-persistence-and-migration-addendum-20.md",
    "042-u11-prism-ii-usage-view-state-addendum-2026-08-18.md",
    "043-pmconcept7-recovery-settled-layout-addendum-2026-08-27.md",
    "044-packet-authoritative-storage-disposition-and-redaction-addendum-.md",
    "045-back-seat-driver-contract-family-persistence-disposition-addendu.md",
    "046-forge-backup-v2-and-go-tsnet-storage-redaction-transaction-2026-.md",
    "047-additive-correction-v4-records-replay-and-migration-matrix-2026-.md",
    "048-working-notebook-and-context-transition-storage-addendum-2026-09.md",
    "049-research-decision-disposition-persistence.md",
    "050-compaction-completion-persistence-contract-dl-039-and-dl-040.md",
    "051-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md",
    "052-scoped-browser-event-persistence-2026-09-10.md", "053-jujutsu-d5-owner-requirements-2026-09-11.md",
    "054-run-start-index-consumers-and-checkpoint-2026-09-11.md",
    "055-browser-workspace-created-index-and-checkpoint-2026-09-11.md",
    "056-restore-point-created-consumer-checkpoint-contract.md", "057-restore-point-retention-summary-contract.md",
    "058-run-start-and-restore-created-versioned-index-adoption.md",
    "059-browser-workspace-reset-filtered-checkpoint-2026-09-11.md", "060-first-append-receipt-custody.md",
    "061-goal-body-storage-custody.md", "062-restore-point-deletion-custody-and-checkpoint.md",
    "063-restore-point-delete-original-result-custody.md", "064-restore-point-expired-custody-and-checkpoint.md",
    "065-restore-point-original-admission-and-retained-custody-read-phase.md",
    "066-legal-hold-transition-custody-and-passive-history.md",
    "067-original-standard-certification-receipt-custody.md",
    "068-storage-integrity-finding-custody-and-read-contract.md", "069-platform-capability-decision-custody.md",
    "070-boot-recovery-aggregate-and-original-producer-custody.md",
    "071-boot-earliest-receipt-continuity-and-activation.md",
    "072-recovery-original-action-custody-and-publication.md",
    "073-goal-start-original-command-custody-and-publication.md",
    "074-sp-294-goal-start-original-command-custody-and-publication.md",
    "075-compaction-original-native-source-phase-custody-and-detail-retir.md",
    "076-goal-created-passive-current-reader-and-original-command-members.md",
    "077-original-goal-update-source-physical-custody-and-publication.md",
    "078-sp-314-original-standard-authority-families-and-fresh-whole-stor.md",
    "079-sp-315-certified-producer-current-and-retained-source-disclosure.md",
    "080-sp-316-seven-compact-authority-families-eleven-v7-profile-qualif.md",
    "081-sp-317-two-projection-checkpoint-families-and-exact-rp-projectio.md",
    "082-terminal-workgroup-moved-exact-passive-source-read.md",
)
EA_GOAL_RUNTIME_SHARDS = (
    "00-index.md", "manifest.json", "001-preamble.md", "002-0.-scope.md", "003-1.-ownership-and-consumers.md",
    "004-goal-v2-record-and-retired-fields.md", "005-durable-host-continuation.md", "006-goal-change-authority.md",
    "007-goal-activity-domain-surface.md", "008-internal-workflow-use-of-goal-v2.md",
    "009-retired-goal-structure-and-negative-ownership.md",
    "010-goal-v2-exact-commands-and-required-result-boundaries.md", "011-goal-v2-events.md",
    "012-goal-v1-to-v2-migration.md", "013-goal-v2-verification.md", "014-2.-canonical-planunits.md",
    "015-server-command-gap-owner-closure-goal-handoff-family-2026-09-01.md",
    "016-remaining-runtime-integration-addendum-2026-08-13.md",
    "017-ledger-compile-addendum-pldg-20260630-001-feature-intake.md",
    "018-3.-contracts-schemas-events-or-data-shapes.md", "019-4.-integration-surfaces.md",
    "020-5.-validation-and-acceptance.md", "021-6.-plan-to-node-readiness.md",
    "022-7.-deferred-retired-compatibility-and-non-goals.md", "023-8.-source-lineage-and-governance.md",
    "024-ledger-compile-addendum-pldg-20260616-002.md",
    "025-ledger-compile-addendum-pldg-20260617-001-plans-to-code-handoff.md",
    "026-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md",
    "027-ledger-compile-addendum-pldg-20260703-001-feature-intake.md",
    "028-case-l-durable-goal-recovery-consumer-addendum-2026-07-17.md",
    "029-additive-correction-v4-goal-replay-lineage-completion-guards-and.md",
    "030-working-notebook-authority-boundary-addendum-2026-09-05.md",
    "031-cumulative-v3-goal-activity-detail-and-plan-binding-specificatio.md",
    "032-goal-body-currentness-and-history.md", "033-current-creation-consumers-and-canonical-goal-state.md",
    "034-current-update-consumers-and-accepted-goal-state.md", "035-original-standard-certification-receipt.md",
    "036-original-goal-creation-command-settlement.md", "037-grs-066-original-goal-creation-command-settlement.md",
    "038-passive-original-goal-creation-observation.md",
    "039-original-goal-objective-update-acceptance-and-settlement.md",
    "040-current-workflow-activation-and-certification-child-scope.md",
    "041-grs-082-fresh-standard-workflow-certification-original-source-20.md",
    "042-grs-083-original-certified-producer-composition-and-source-only-.md",
    "043-grs-084-whole-certified-v3-event-identity-released-custody-nativ.md",
    "044-grs-085-mandatory-started-cancelled-certified-prefix-projection-.md",
)
PLAN_GRAPH_MISSING_REF = {"error": "missing_ref", "node_id": "pm.p6.personas-ledger-transfer", "output": ".gitignore",
                          "output_ref": ".gitignore", "path": "Plans/plan_graph.json"}


def ea_anchors_rows(kind="artifact_hash_stale"):
    """The reviewer's export, with every artifact row's error kind replaced by `kind` for the negative case."""
    artifacts = (["Plans/storage-plan.md"] + [f"Plans/_shards/storage-plan/{name}" for name in EA_STORAGE_PLAN_SHARDS]
                 + ["Plans/Goal_Runtime_System.md"]
                 + [f"Plans/_shards/goal_runtime_system/{name}" for name in EA_GOAL_RUNTIME_SHARDS])
    rows = [{"path": EA_EVIDENCE_BUNDLE, "artifact": artifact, "error": kind,
             "expected": hashlib.sha256(f"expected {artifact}".encode()).hexdigest(),
             "actual": hashlib.sha256(f"actual {artifact}".encode()).hexdigest()} for artifact in artifacts]
    return rows + [dict(PLAN_GRAPH_MISSING_REF)]


def contract_rows(count, touched_at=None, touched_ref="#/$defs/moved"):
    """validate-prd-planning-runtime-contracts rows: unresolved local refs in one schema, and optionally one
    in Plans/Touched.schema.json at position `touched_at`."""
    rows = [{"path": "Plans/home_layout_event_contracts.schema.json", "error": "unresolved_local_ref",
             "ref": f"#/$defs/row{n}"} for n in range(count)]
    if touched_at is not None:
        rows[touched_at] = {"path": "Plans/Touched.schema.json", "error": "unresolved_local_ref", "ref": touched_ref}
    return rows


def same_validator_argv(root, names, timeout_seconds):
    """same_validator_commands, as the argument lists run_export is handed."""
    return {key: [line] for key, line in same_validator_commands(root, names, timeout_seconds).items()}


def flat(text):
    """The summary with its wrapped lines joined, so a phrase can be found across a line break."""
    return " ".join(line.strip() for line in text.splitlines())


class ExportKeyedSubchecks(LandingRun):
    """The exports brief of 2026-09-24. A subcheck that prints only a sample is keyed from the complete
    export its command writes, when the export's total equals the printed total and the baseline holds its
    rows in full. It is then not truncated, and the kind rules judge every row. Otherwise the truncated rule
    applies as before, and the summary says which case and why.

    The motivating case is plans/ea-certified-anchors-20260924, rebased on b3169c48d9. It edits two canon
    documents, and validate_plan_graph rises from main's 1 to 133, past both print caps, so the check exited
    2 on staleness that the rule says never stops a landing."""

    TOUCHED = ("Plans/Goal_Runtime_System.md", "Plans/storage-plan.md",
               "Plans/_shards/storage-plan/00-index.md", "Plans/.plan_index/plan_units.jsonl")
    PRD_RG, PRD_AG, PRD = ("validate_prd_planning_runtime_contracts", "prd_planning_runtime_contracts",
                           "validate-prd-planning-runtime-contracts")

    def setUp(self):
        super().setUp()
        self.module.aggregate_subcheck_argv = same_validator_argv
        self.exports = {}
        self.export_calls = []

        def run_export(root, argv, timeout_seconds):
            self.export_calls.append(list(argv))
            rows = self.exports.get(argv[0], "unreadable")
            if rows == "timeout":
                return {"report": None, "timed_out": True, "error": None, "elapsed_seconds": timeout_seconds}
            if rows == "unreadable":
                return {"report": None, "timed_out": False, "error": "its report is not JSON (stand-in)",
                        "elapsed_seconds": 0.1}
            return {"report": {"check": argv[0], "status": "fail" if rows else "pass",
                               "failures": [dict(row) for row in rows]},
                    "timed_out": False, "error": None, "elapsed_seconds": 0.1}
        self.module.run_export = run_export

    def land_ea_anchors(self, rows, export=None, argv=()):
        """main's one missing_ref in both copies of the plan-graph validator at the baseline; on the branch,
        the two documents and their regenerated files, and `rows`, of which each copy prints 50 or 100."""
        self.stub(gates={"validate_plan_graph": [PLAN_GRAPH_MISSING_REF]}, audit={"plan_graph": [PLAN_GRAPH_MISSING_REF]})
        self.record()
        for rel in self.TOUCHED:
            self.touch(rel)
        self.stub(gates={"validate_plan_graph": (rows, len(rows))}, audit={"plan_graph": (rows, len(rows))})
        self.exports["validate-plan-graph"] = rows if export is None else export
        return self.compare(*argv)

    def record_contracts(self, rows):
        """A baseline in which both copies of the contracts validator print a sample of `rows` and are keyed
        from its export."""
        self.stub(gates={self.PRD_RG: rows}, audit={self.PRD_AG: rows})
        self.exports[self.PRD] = rows
        code, out = self.run_main("--record-baseline", "--baseline", "baseline.json")
        self.assertEqual(code, 0, out + self.stderr)
        return out, json.loads((self.repo / "baseline.json").read_text(encoding="utf-8"))

    def test_the_reviewers_export_is_keyed_and_exits_one(self):
        """132 artifact_hash_stale rows on the two edited documents and their shards, and main's one
        missing_ref: staleness and pre-existing, every row keyed from the export, so exit 1, not 2."""
        rows = ea_anchors_rows()
        self.assertEqual((len(rows), sum(row["error"] == "artifact_hash_stale" for row in rows)), (133, 132))
        code, out = self.land_ea_anchors(rows)
        self.assertEqual(code, 1, out)
        for check, subcheck, printed in (("run-gates", "validate_plan_graph", 50), ("audit-governance", "plan_graph", 100)):
            self.assertIn(f"[keyed    ] {check}/{subcheck} ({printed} of 133 printed): its export (validate-plan-graph) "
                          "holds all 133 rows, the printed total: 132 staleness, 1 pre-existing", out)
            self.assertIn(f"[keyed    ] {check}/{subcheck}  1 -> 133 (keyed from its export", out)
        self.assertIn("2 subchecks print only a sample of their failures in this run; 2 of them are keyed from the "
                      "export of their command", out)
        self.assertEqual(self.export_calls, [["validate-plan-graph"]])  # one run serves both copies
        self.assertNotIn("[blocking", out)
        self.assertIn("Naming a path this branch touches: 4", out)
        self.assertIn("      4  artifact_hash_stale", out)
        self.assertIn("with every failure keyed from its export", out)
        report = json.loads(self.compare("--json")[1])
        self.assertEqual(report["blocking"], 0)
        self.assertEqual((len(report["new"]), {row["error"] for row in report["new"]}, {row["stale"] for row in report["new"]}),
                         (264, {"artifact_hash_stale"}, {True}))
        self.assertEqual(sorted(path for row in report["on_branch"] for path in row["branch_paths"]),
                         ["Plans/Goal_Runtime_System.md"] * 2 + ["Plans/storage-plan.md"] * 2)
        self.assertTrue(all(row["stale"] for row in report["on_branch"]))
        # The missing_ref is unchanged and names no branch file: counted as pre-existing, not listed.
        self.assertEqual(report["pre_existing"], [])
        self.assertEqual([(row["check"], row["case"], row["exported"], row["classes"]) for row in report["exports"]["subchecks"]],
                         [("run-gates", "keyed", 133, {"staleness": 132, "pre-existing": 1}),
                          ("audit-governance", "keyed", 133, {"staleness": 132, "pre-existing": 1})])
        self.assertEqual(report["subchecks_compared_by_total_only"], [])
        self.assertEqual(report["checks"]["run-gates"]["subchecks"]["validate_plan_graph"],
                         {"reported": 133, "sampled": 50, "exported": 133})
        self.assertEqual([(row["subcheck"], row["truncated"], row.get("keyed_from_export")) for row in report["grown_subchecks"]],
                         [("plan_graph", False, True), ("validate_plan_graph", False, True)])

    def test_the_same_rows_with_a_kind_that_is_not_staleness_exit_two(self):
        code, out = self.land_ea_anchors(ea_anchors_rows(kind="missing_artifact"))
        self.assertEqual(code, 2, out)
        self.assertIn("[keyed    ] run-gates/validate_plan_graph (50 of 133 printed): its export (validate-plan-graph) holds "
                      "all 133 rows, the printed total: 130 new, 2 blocking, 1 pre-existing", out)
        self.assertIn(f"[blocking    ] run-gates/validate_plan_graph  missing_artifact  {EA_EVIDENCE_BUNDLE}", out)
        self.assertIn(f"[blocking    ] audit-governance/plan_graph  missing_artifact  {EA_EVIDENCE_BUNDLE}", out)
        self.assertIn("4 items the baseline does not excuse", out)
        report = json.loads(self.compare("--json")[1])
        self.assertEqual(report["blocking"], 4)
        self.assertEqual(sorted(path for row in report["on_branch"] for path in row["branch_paths"]),
                         ["Plans/Goal_Runtime_System.md"] * 2 + ["Plans/storage-plan.md"] * 2)
        self.assertFalse(any(row["stale"] for row in report["on_branch"]))

    def test_an_export_whose_total_disagrees_falls_back_to_the_truncated_rule_and_says_why(self):
        rows = ea_anchors_rows()
        code, out = self.land_ea_anchors(rows, export=rows[:-1])
        self.assertEqual(code, 2, out)
        self.assertIn("[not keyed] run-gates/validate_plan_graph (50 of 133 printed): its export (validate-plan-graph) holds "
                      "132 rows, but the printed total is 133; the truncated rule applies", out)
        self.assertIn("[not keyed] audit-governance/plan_graph (100 of 133 printed): its export (validate-plan-graph) holds "
                      "132 rows, but the printed total is 133; the truncated rule applies", out)
        self.assertIn("[blocking ] run-gates/validate_plan_graph  1 -> 133 (only 50 of 133 are printed, so what was added "
                      "cannot be matched)", out)
        self.assertIn("[blocking ] audit-governance/plan_graph  1 -> 133 (only 100 of 133 are printed", out)
        report = json.loads(self.compare("--json")[1])
        self.assertEqual([(row["case"], row["keyed"], row["exported"]) for row in report["exports"]["subchecks"]],
                         [("total_mismatch", False, 132)] * 2)
        self.assertEqual(report["checks"]["run-gates"]["subchecks"]["validate_plan_graph"], {"reported": 133, "sampled": 50})
        self.assertEqual(report["subchecks_compared_by_total_only"],
                         ["audit-governance/plan_graph", "run-gates/validate_plan_graph"])
        self.assertEqual(report["blocking"], 2)

    def test_an_export_that_times_out_or_cannot_be_read_falls_back_and_says_so(self):
        for export, reason in (("timeout", "did not finish within 600 s"),
                               ("unreadable", "could not be read: its report is not JSON (stand-in)")):
            with self.subTest(export=export):
                self.setUp()
                code, out = self.land_ea_anchors(ea_anchors_rows(), export=export)
                self.assertEqual(code, 2, out)
                self.assertIn(f"[not keyed] run-gates/validate_plan_graph (50 of 133 printed): its export "
                              f"(validate-plan-graph) {reason}; the truncated rule applies", out)
                self.assertIn("[blocking ] run-gates/validate_plan_graph  1 -> 133", out)
                # The subcheck itself finished: an export that did not is no infrastructure result.
                self.assertIn("Infrastructure results, not failures of this tree (never new, growth or blocking): 0", out)

    def test_a_command_without_a_complete_export_keeps_the_truncated_rule_and_is_never_run(self):
        closure = [{"path": "Plans/.audits/_semantic_closure_registry.jsonl", "error": "audit_closure_validator_error",
                    "detail": f"closure row {n} lacks its evidence"} for n in range(201)]
        self.stub(gates={"validate_audit_closure": (closure, 200)}, audit={"audit_closure": (closure, 200)})
        self.record()
        self.touch("Plans/Touched.md")
        self.stub(gates={"validate_audit_closure": (closure, 201)}, audit={"audit_closure": (closure, 201)})
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("[not keyed] run-gates/validate_audit_closure (50 of 201 printed): validate-audit-closure writes no "
                      "complete export: cmd_validate_audit_closure keeps only the first 200 of pm-audit-closure.py's "
                      "errors, so its own report is a sample whenever there are more; the truncated rule applies", out)
        self.assertIn("[blocking ] run-gates/validate_audit_closure  200 -> 201", out)
        self.assertEqual(self.export_calls, [])

    def test_a_baseline_that_holds_only_a_sample_is_not_compared_with_an_export(self):
        """Until a baseline is recorded from exports, a subcheck it holds only a sample of keeps the
        truncated rule: complete rows now against a sample then would read pre-existing failures as grown."""
        rows = contract_rows(120)
        self.stub(gates={self.PRD_RG: rows}, audit={self.PRD_AG: rows})
        self.exports[self.PRD] = "unreadable"
        code, out = self.run_main("--record-baseline", "--baseline", "baseline.json")
        self.assertEqual(code, 0, out)
        self.assertIn("[not keyed] run-gates/validate_prd_planning_runtime_contracts (50 of 120 printed): its export "
                      "(validate-prd-planning-runtime-contracts) could not be read: its report is not JSON (stand-in); "
                      "the baseline records only its printed sample, so landings keep the truncated rule for it", out)
        baseline = json.loads((self.repo / "baseline.json").read_text(encoding="utf-8"))
        self.assertEqual(baseline["checks"]["run-gates"]["subchecks"][self.PRD_RG], {"reported": 120, "sampled": 50})
        self.assertEqual(baseline["export_buckets"], [])
        calls = len(self.export_calls)
        self.touch("Plans/Touched.md")
        self.exports[self.PRD] = rows
        code, out = self.compare()
        self.assertEqual(code, 0, out)
        self.assertEqual(len(self.export_calls), calls)  # nothing to compare an export with, so none is run
        self.assertIn("[not keyed] run-gates/validate_prd_planning_runtime_contracts (50 of 120 printed): the baseline "
                      "printed 50 of its 120 and recorded no export, so it holds no complete rows to compare an export "
                      "with; the truncated rule applies", out)

    def test_a_baseline_recorded_from_exports_keys_rows_beyond_the_printed_sample(self):
        """The row on the touched schema sits at 110 of 120, past both print caps, where the truncated rule
        never saw it. Recorded from the export, the baseline holds it, and each landing judges it."""
        out, baseline = self.record_contracts(contract_rows(120, touched_at=110))
        self.assertIn("export buckets: 4, the complete rows of 2 subchecks keyed from their export", out)
        self.assertIn("complete exports, read in scripts/pm-plans-verify.py", out)  # the record run lists them too
        self.assertIn("[keyed    ] run-gates/validate_prd_planning_runtime_contracts (50 of 120 printed): its export "
                      "(validate-prd-planning-runtime-contracts) holds all 120 rows, the printed total", out)
        self.assertEqual(baseline["checks"]["run-gates"]["subchecks"][self.PRD_RG],
                         {"reported": 120, "sampled": 50, "exported": 120})
        self.assertEqual(baseline["checks"]["audit-governance"]["subchecks"][self.PRD_AG],
                         {"reported": 120, "sampled": 100, "exported": 120})
        self.assertEqual([(row["check"], row["count"]) for row in baseline["export_buckets"]
                          if row["path"] == "Plans/Touched.schema.json"], [("audit-governance", 1), ("run-gates", 1)])
        self.assertFalse(any(row["path"] == "Plans/Touched.schema.json" for row in baseline["buckets"]))

        # The branch edits the schema, and the row's content moves: pre-existing, listed with both counts.
        self.touch("Plans/Touched.schema.json")
        moved = contract_rows(120, touched_at=110, touched_ref="#/$defs/renamed")
        self.stub(gates={self.PRD_RG: moved}, audit={self.PRD_AG: moved})
        self.exports[self.PRD] = moved
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("[pre-existing] run-gates/validate_prd_planning_runtime_contracts  unresolved_local_ref  "
                      "Plans/Touched.schema.json  1 -> 1", out)
        self.assertIn("holds all 120 rows, the printed total: 120 pre-existing", out)
        # The control: with the export gone the same row is past the sample and unseen, as before.
        self.exports[self.PRD] = "timeout"
        code, out = self.compare()
        self.assertEqual(code, 0, out)
        self.assertIn("Naming a path this branch touches: 0", out)

        # A row added on the touched schema: its bucket grew, so it blocks, and it is named.
        added = moved + [{"path": "Plans/Touched.schema.json", "error": "unresolved_local_ref", "ref": "#/$defs/added"}]
        self.stub(gates={self.PRD_RG: added}, audit={self.PRD_AG: added})
        self.exports[self.PRD] = added
        code, out = self.compare()
        self.assertEqual(code, 2, out)
        self.assertIn("[blocking    ] run-gates/validate_prd_planning_runtime_contracts  unresolved_local_ref  "
                      "Plans/Touched.schema.json", out)
        self.assertIn("[keyed    ] run-gates/validate_prd_planning_runtime_contracts  120 -> 121 (keyed from its export", out)
        self.assertNotIn("cannot be matched", out)

    def test_an_export_that_falls_back_after_an_exported_baseline_compares_the_printed_samples(self):
        """The baseline keeps its printed rows beside the exported ones, so a fallback compares sample with
        sample, as before: 50 -> 50, not the export's 119 against a sample of 50."""
        self.record_contracts(contract_rows(120, touched_at=110))
        self.touch("Plans/home_layout_event_contracts.schema.json")
        self.exports[self.PRD] = "timeout"
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("did not finish within 600 s; the truncated rule applies", out)
        self.assertIn("[pre-existing] run-gates/validate_prd_planning_runtime_contracts  unresolved_local_ref  "
                      "Plans/home_layout_event_contracts.schema.json  50 -> 50", out)
        self.assertNotIn("[improved", out)
        self.assertIn("Checks whose failure count rose: 0", out)

    def test_a_readiness_copy_recorded_from_its_export_is_judged_on_its_own_rows(self):
        """Review L-07 judges a sampled run-gates copy by its complete audit-governance copy. The storage
        registry shape, recorded from its export, is complete at the baseline, so the run-gates copy needs
        no pairing: it is compared with the rows the baseline recorded from the export."""
        self.module.aggregate_subcheck_commands = same_validator_commands
        rg, ag = "validate_implementation_readiness", "implementation_readiness"
        at_baseline = [registry_row(n) for n in range(78)] + [self_test_row(*[f"check_{n}" for n in range(7)])]
        self.stub(gates={rg: at_baseline}, audit={ag: at_baseline})
        self.exports["validate-implementation-readiness"] = at_baseline
        self.record()
        self.touch("scripts/pm-implementation-readiness.py")
        on_branch = [registry_row(n) for n in range(32)] + [self_test_row("check_0", "check_1", "check_2")]
        self.stub(gates={rg: on_branch}, audit={ag: on_branch})
        code, out = self.compare()
        self.assertEqual(code, 1, out)
        self.assertIn("compared with the complete rows the baseline recorded from their export, since they print every "
                      "failure now: run-gates/validate_implementation_readiness", out)
        report = json.loads(self.compare("--json")[1])
        self.assertEqual((report["validator_pairs"], report["blocking"]), ([], 0))
        self.assertEqual(report["exports"]["compared_with_baseline_exports"], ["run-gates/validate_implementation_readiness"])
        self.assertEqual({(row["check"], row["standing"]) for row in report["on_branch"]},
                         {("run-gates", "pre-existing"), ("audit-governance", "pre-existing")})

    def test_the_run_header_lists_the_commands_that_write_a_complete_export(self):
        self.stub(gates={"verify_spec_lock": [STALE_HASH]})
        self.record()
        self.touch("Plans/Touched.md")
        code, out = self.compare()
        self.assertEqual(code, 0, out)
        header = flat(out.split("\n\n", 1)[0])
        self.assertIn("complete exports, read in scripts/pm-plans-verify.py: the report each of these 35 commands writes "
                      "with --report holds every row it counts, so a subcheck that runs one and prints only a sample is "
                      "keyed from it when its total equals the printed total:", header)
        for command in sorted(M.EXPORT_COMMANDS):
            self.assertIn(f" {command}", header)
        self.assertIn("no complete export: validate-audit-closure, because cmd_validate_audit_closure keeps only the "
                      "first 200 of pm-audit-closure.py's errors", header)
        self.assertEqual(self.export_calls, [])
        report = json.loads(self.compare("--json")[1])
        self.assertEqual((len(report["exports"]["complete_export_commands"]), report["exports"]["subchecks"]), (35, []))
        self.assertEqual(sorted(report["exports"]["no_complete_export"]), ["validate-audit-closure"])

    def test_kept_check_reports_keep_each_export(self):
        with tempfile.TemporaryDirectory() as keep:
            code, out = self.land_ea_anchors(ea_anchors_rows(), argv=("--keep-check-reports", keep))
            self.assertEqual(code, 1, out)
            kept = json.loads((Path(keep) / "exports" / "validate-plan-graph.json").read_text(encoding="utf-8"))
            self.assertEqual((kept["argv"], kept["timed_out"], len(kept["report"]["failures"])),
                             (["validate-plan-graph"], False, 133))

    def test_the_real_map_reads_every_aggregate_command_as_a_complete_export_but_audit_closure(self):
        """The enumeration against scripts/pm-plans-verify.py as it stands: every subcheck the two aggregates
        run maps to a command in EXPORT_COMMANDS, except the audit-closure pair, and both copies of a validator
        run one command line. A command added to the aggregates later fails here until someone reads it."""
        import ast
        tree = ast.parse((ROOT / "scripts" / "pm-plans-verify.py").read_text(encoding="utf-8"))
        names = {}
        for node in tree.body:
            if isinstance(node, ast.FunctionDef) and node.name in ("cmd_run_gates", "cmd_audit_governance"):
                for sub in ast.walk(node):
                    if isinstance(sub, ast.Assign) and any(getattr(t, "id", None) == "check_specs" for t in sub.targets):
                        names["run-gates" if node.name == "cmd_run_gates" else "audit-governance"] = {
                            element.elts[0].value for element in sub.value.elts}
        path_before = list(sys.path)
        argv = M.aggregate_subcheck_argv(ROOT, names, 600)
        self.assertEqual(sys.path, path_before)
        commands = {line[0] for line in argv.values()}
        self.assertEqual(commands - M.EXPORT_COMMANDS, set(M.NO_EXPORT_COMMANDS))
        self.assertEqual(M.EXPORT_COMMANDS - commands, set())
        self.assertEqual({key for key, line in argv.items() if line[0] in M.NO_EXPORT_COMMANDS},
                         {("run-gates", "validate_audit_closure"), ("audit-governance", "audit_closure")})
        for rg, ag in (("validate_plan_graph", "plan_graph"), ("validate_evidence", "evidence"),
                       ("validate_prd_planning_runtime_contracts", "prd_planning_runtime_contracts"),
                       ("validate_implementation_readiness", "implementation_readiness")):
            self.assertEqual(argv[("run-gates", rg)], argv[("audit-governance", ag)], rg)
        self.assertEqual(argv[("run-gates", "validate_plan_graph")], ["validate-plan-graph"])
        self.assertEqual(M.aggregate_subcheck_commands(ROOT, {"run-gates": {"validate_implementation_readiness"}}, 600),
                         {("run-gates", "validate_implementation_readiness"):
                          "validate-implementation-readiness --subcheck-timeout-seconds 600"})


class RunExport(unittest.TestCase):
    """run_export against a stand-in scripts/pm-plans-verify.py, not a stub: the report it writes with
    --report, output that is not a report, and a command killed with its whole process group at the bound."""

    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory()
        self.addCleanup(self.scratch.cleanup)
        self.root = Path(self.scratch.name)
        (self.root / "scripts").mkdir()

    def fake(self, body):
        (self.root / "scripts" / "pm-plans-verify.py").write_text(textwrap.dedent(body), encoding="utf-8")

    def test_the_report_written_with_report_is_read_and_the_file_is_outside_the_repository(self):
        self.fake("""
            import json, os, sys
            args = sys.argv[1:]
            path = args[args.index("--report") + 1]
            rows = [{"error": "e", "n": n, "argv": args, "child": os.environ.get("PM_PLANS_VERIFY_AGGREGATE_CHILD")}
                    for n in range(3)]
            open(path, "w").write(json.dumps({"check": args[0], "status": "fail", "failures": rows}))
            print("{}")
            sys.exit(1)
        """)
        result = M.run_export(self.root, ["validate-plan-graph", "--subcheck-timeout-seconds", "600"], 30)
        self.assertEqual((result["timed_out"], result["error"]), (False, None))
        rows = result["report"]["failures"]
        self.assertEqual(len(rows), 3)
        self.assertEqual((rows[0]["argv"][:2], rows[0]["argv"][3:]),
                         (["validate-plan-graph", "--report"], ["--subcheck-timeout-seconds", "600"]))
        self.assertEqual(rows[0]["child"], "1")  # run as an aggregate's child, so its validators share its group
        written = Path(rows[0]["argv"][2])
        self.assertNotIn(self.root, written.parents)
        self.assertFalse(written.exists())

    def test_stdout_is_read_when_no_report_file_is_written_and_garbage_is_an_error(self):
        self.fake("""
            import json
            print(json.dumps({"check": "x", "status": "fail", "failures": [{"error": "e"}]}))
        """)
        result = M.run_export(self.root, ["validate-evidence"], 30)
        self.assertEqual(len(result["report"]["failures"]), 1)
        self.fake("print('not a report')")
        result = M.run_export(self.root, ["validate-evidence"], 30)
        self.assertIsNone(result["report"])
        self.assertIn("its report is not JSON", result["error"])
        self.fake("import json; print(json.dumps({'failures': 3}))")
        self.assertEqual(M.run_export(self.root, ["validate-evidence"], 30)["error"], "its report holds no list of failures")

    def test_a_command_that_runs_past_the_bound_is_killed_with_its_whole_group(self):
        pid_file = self.root / "grandchild.pid"
        self.fake(f"""
            import subprocess, sys, time
            child = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(60)"])
            open({str(pid_file)!r}, "w").write(str(child.pid))
            time.sleep(60)
        """)
        started = time.monotonic()
        result = M.run_export(self.root, ["validate-evidence"], 2)
        self.assertLess(time.monotonic() - started, 30)
        self.assertEqual((result["timed_out"], result["report"]), (True, None))
        pid = int(pid_file.read_text(encoding="utf-8"))
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            state = Path(f"/proc/{pid}/status")
            if not state.exists() or "\nState:\tZ" in state.read_text(encoding="utf-8"):
                break
            time.sleep(0.1)
        else:
            self.fail(f"the command's own child {pid} outlived the bound")


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
