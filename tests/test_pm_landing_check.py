"""Synthetic fixtures for the landing check: key normalization, the baseline diff, the branch match.

Every fixture here fails for the reason its test names. None of them run the real repository-wide
checks; the report shapes are copied from what `run-gates`, `audit-governance` and
`pm-plan-migration.py validate` actually print.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
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
        out = io.StringIO()
        sys.argv = ["pm-landing-check.py", "--root", str(self.repo), *argv]
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(io.StringIO()):
            code = self.module.main()
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
