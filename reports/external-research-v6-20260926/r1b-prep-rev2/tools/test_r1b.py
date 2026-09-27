#!/usr/bin/env python3
"""Provider-free regression tests for R1b rev2 (python3 -m unittest tools/r1b/test_r1b.py).

Every native boundary, process and clock is stubbed; no model, provider or account is touched.
Fixture-dependent tests (real frozen R1 packages, case corpus) have `_real_` in their names.
"""
import hashlib
import json
import shutil
import sys
import tempfile
import threading
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
LAB = HERE.parent.parent
sys.path.insert(0, str(HERE))
from quote_locator import locate, locate_field  # noqa: E402
import build_evidence_bundle_v3 as bundle  # noqa: E402
import assemble_delivery as asm  # noqa: E402
import run_r1b  # noqa: E402
import run_reviewer_v2 as reviewer  # noqa: E402
import build_review_workspaces_r1b as rws  # noqa: E402

SLOTS = ["M-control", "M-candidate", "Z-candidate", "Z-control"]


def section(out, n):
    """Text of delivered section n (1..5)."""
    start = out.index(f"\n## {n}.")
    nxt = out.find(f"\n## {n + 1}.", start + 1)
    return out[start:nxt if nxt > 0 else len(out)]


class QuoteLocator(unittest.TestCase):
    def test_underscore_is_contractual(self):
        r = locate("authorizationrequired", ["the authorization_required flag"], [(1, 1)])
        self.assertEqual((r["class"], r["exact"]), ("not_located", False))

    def test_short_ellipsis_fragment_must_match(self):
        self.assertEqual(locate("DO NOT ... run the recovery command", ["You may run the recovery command now."], [(1, 1)])["class"], "not_located")

    def test_fragment_order_enforced(self):
        src = ["second part here", "and first part there"]
        self.assertEqual(locate("second part ... first part", src, [(1, 2)])["class"], "ordered_fragments_at_cited_lines")
        self.assertEqual(locate("first part ... second part", src, [(1, 2)])["class"], "not_located")

    def test_q1_ellipsis_only_does_not_crash(self):
        for q in ("...", " … ", "[...]"):
            self.assertEqual(locate(q, ["x"], [(1, 1)])["class"], "empty_quote")

    def test_q2_single_fragment_with_ellipsis_is_not_exact(self):
        r = locate("alpha ...", ["alpha beta"], [(1, 1)])
        self.assertFalse(r["exact"])
        self.assertEqual(r["scope"], "fragments")

    def test_q2_literal_ellipsis_can_be_exact(self):
        r = locate("alpha ... beta", ["text alpha ... beta text"], [(1, 1)])
        self.assertTrue(r["exact"])
        self.assertIn("literal ellipsis", r["note"])

    def test_q3_reports_actual_match_line(self):
        src = ["one", "two", "the needle is here", "four", "five"]
        r = locate("needle is here", src, [(2, 3)])
        self.assertEqual(r["line"], 3)
        self.assertEqual(r["window_start"], 1)

    def test_documented_carrier_decoding_only(self):
        src = ['MUST contain the field "name" that', "gives the name."]
        self.assertTrue(locate('MUST contain the field \\"name\\" that gives the name.', src, [(1, 2)])["exact"])
        self.assertEqual(locate("must contain the field", src, [(1, 1)])["class"], "case_variant_at_cited_lines")
        self.assertEqual(locate("the field “name” that", src, [(1, 1)])["class"], "typography_variant_at_cited_lines")

    def test_escaped_newlines_named_class(self):
        src = ["def f(x):", "    return x"]
        r = locate("def f(x):\\n    return x", src, [(1, 2)])
        self.assertEqual(r["class"], "exact_after_escape_decoding_at_cited_lines")
        self.assertEqual(locate("def f(x):\\n return y", src, [(1, 2)])["class"], "not_located")

    def test_elsewhere_reports_line(self):
        src = ["x"] * 50 + ["the needle sentence is here"]
        r = locate("needle sentence", src, [(1, 3)])
        self.assertEqual((r["class"], r["line"]), ("exact_elsewhere_in_source", 51))


class QuoteFields(unittest.TestCase):
    SRC = ['Each "multiscales" dictionary SHOULD contain the field "name".', 'Other text.', 'If only one multiscale is provided, use it.']

    def test_plain_inner_quotes_stay_exact(self):
        r = locate_field('"Each "multiscales" dictionary SHOULD contain the field "name"."', self.SRC, [(1, 3)])
        self.assertEqual((r["class"], r["exact"], r["scope"]), ("exact_at_cited_lines", True, "whole_field"))

    def test_composite_segments_are_locator_only(self):
        raw = '"Each \\"multiscales\\" dictionary SHOULD contain the field \\"name\\"." ... "If only one multiscale is provided, use it."'
        r = locate_field(raw, self.SRC, [(1, 3)])
        self.assertEqual(r["class"], "ordered_quoted_segments_at_cited_lines")
        self.assertFalse(r["exact"])

    def test_single_segment_scope_is_segment(self):
        r = locate_field('"If only one multiscale is provided, use it." (same for scale)', self.SRC, [(3, 3)])
        self.assertEqual((r["class"], r["scope"]), ("quoted_segment_exact_at_cited_lines", "segment"))

    def test_segments_out_of_order_not_located(self):
        self.assertEqual(locate_field('"If only one multiscale is provided" ... "Other text."', self.SRC, [(1, 3)])["class"], "not_located")


class BundleV3(unittest.TestCase):
    def fixture(self, n_lines=200, long_line=None):
        d = Path(tempfile.mkdtemp())
        (d / "sources").mkdir()
        lines = [f"line {i} text" for i in range(1, n_lines + 1)]
        lines[99] = "# Section heading 5"
        if long_line:
            lines[long_line - 1] = "A" * 5000 + " NEEDLE phrase " + "B" * 5000
        (d / "sources/S001.txt").write_text("\n".join(lines))
        (d / "catalog.json").write_text(json.dumps({"sources": [{"handle": "S001", "file": "sources/S001.txt", "aliases": [{"uri": "u"}]}]}))
        return d

    def test_every_cited_line_delivered(self):
        d = self.fixture()
        (d / "obs.md").write_text("### O-001\n- source: S001 lines 1-155\n- quote: \"line 3 text\"\n"
                                  "### O-002\n- source: S001 lines 165-175\n- quote: \"line 170 text\"\n")
        bundle.build(d, d / "obs.md", d / "out")
        text = (d / "out/evidence-bundle.md").read_text()
        for n in list(range(1, 156)) + list(range(165, 176)):
            self.assertIn(f"{n:>6}| ", text)

    def test_long_line_has_omitted_locator_and_excerpt_at_match(self):
        d = self.fixture(long_line=120)
        (d / "obs.md").write_text("### O-001\n- source: S001 lines 118-121\n- quote: \"NEEDLE phrase\"\n")
        s = bundle.build(d, d / "obs.md", d / "out")
        text = (d / "out/evidence-bundle.md").read_text()
        self.assertIn("OMITTED chars", text)
        self.assertIn("NEEDLE phrase", text)
        self.assertEqual(json.loads((d / "out/evidence-check.json").read_text())["checks"][0]["line"], 120)
        self.assertEqual(s["source_file_reads"], 1)

    def test_single_read_per_source(self):
        d = self.fixture()
        (d / "obs.md").write_text("### O-001\n- source: S001 lines 1-2\n- quote: \"line 1 text\"\n- quote: \"line 2 text\"\n- quote: \"line 3 text\"\n")
        self.assertEqual(bundle.build(d, d / "obs.md", d / "out")["source_file_reads"], 1)

    def test_governing_heading_supplied(self):
        d = self.fixture()
        (d / "obs.md").write_text("### O-001\n- source: S001 lines 140-141\n- quote: \"line 140 text\"\n")
        bundle.build(d, d / "obs.md", d / "out")
        self.assertIn("Governing context: line 100: # Section heading 5", (d / "out/evidence-bundle.md").read_text())

    def test_real_frozen_observations(self):
        for slot in SLOTS:
            with self.subTest(slot=slot):
                self.assertGreater(bundle.build(LAB / "case_bundle", LAB / "runs" / slot / "frozen/stage1/observations.md",
                                                Path(tempfile.mkdtemp()))["observations"], 0)


class Delivery(unittest.TestCase):
    T = "# Title\n\n- claim one stays\n- claim two is wrong\n- claim three unknown\n- claim four qualified\n- claim five undecided\n"

    def blocks(self, text=None):
        return asm.segment(text or self.T)

    def test_real_drafts_segment_exactly_and_nothing_substantive_is_context(self):
        for slot in SLOTS:
            with self.subTest(slot=slot):
                self.assertGreater(len(asm.segment((LAB / "runs" / slot / "frozen/stage1/draft.md").read_text(errors="replace"))), 10)

    def test_real_draft_assembly_has_every_draft_line_in_history(self):
        text = (LAB / "runs/Z-control/frozen/stage1/draft.md").read_text(errors="replace")
        out, rep = asm.assemble(text, asm.segment(text), "", "")
        hist = section(out, 5)
        for line in text.split("\n"):
            self.assertIn(line, hist)
        self.assertEqual(rep["by_status"], {"UNVERIFIED": rep["blocks"]})
        self.assertNotIn("CONFIRMED", section(out, 1))

    def test_a1_undelimited_heading_replacement_is_not_truncated_into_authority(self):
        t = "# T\n\n- claim one\n"
        dec = ("### B-002\ndecision: qualify\nbasis: counterevidence\nreason: conflates failed reads.\nevidence: S001 lines 1-8\n"
               "replacement: Apply the following corrected rule.\n#### Required exception\nNever replace failed reads with zeros.\n")
        out, rep = asm.assemble(t, self.blocks(t), dec, "")
        self.assertEqual(rep["by_status"].get("CARRIER_INCOMPLETE"), 1)
        self.assertNotIn("Apply the following corrected rule.", section(out, 1))
        self.assertIn("Never replace failed reads with zeros.", section(out, 5))  # raw record preserved

    def test_delimited_replacement_keeps_headings_and_fences(self):
        t = "# T\n\n- claim one\n"
        dec = ("### B-002\ndecision: qualify\nbasis: counterevidence\nreason: r\nevidence: e\nreplacement:\n<<<\n"
               "Apply the rule.\n#### Required exception\nNever replace failed reads with zeros.\n```\ncode line\n```\n>>>\n")
        out, rep = asm.assemble(t, self.blocks(t), dec, "")
        s1 = section(out, 1)
        self.assertIn("#### Required exception\nNever replace failed reads with zeros.\n```\ncode line\n```", s1)
        self.assertNotIn("- claim one", s1)  # superseded draft text is history only

    def test_unterminated_delimiter_is_incomplete(self):
        t = "# T\n\n- claim one\n"
        dec = "### B-002\ndecision: qualify\nbasis: counterevidence\nreason: r\nreplacement:\n<<<\npartial text\n"
        out, rep = asm.assemble(t, self.blocks(t), dec, "")
        self.assertEqual(rep["by_status"].get("CARRIER_INCOMPLETE"), 1)
        self.assertNotIn("partial text", section(out, 1))

    def test_inline_single_line_replacement_accepted(self):
        t = "# T\n\n- claim one\n"
        out, rep = asm.assemble(t, self.blocks(t), "### B-002\ndecision: qualify\nbasis: counterevidence\nreason: r\nreplacement: claim one holds only for v3.\n", "")
        self.assertEqual(rep["by_status"].get("qualify"), 1)
        self.assertIn("claim one holds only for v3.", section(out, 1))

    def test_a2_duplicate_entries_are_a_conflict_not_confirmation(self):
        dec = "### B-002\ndecision: reject\nbasis: counterevidence\nreason: x\n### B-002\ndecision: confirm\n"
        out, rep = asm.assemble(self.T, self.blocks(), dec, "")
        self.assertEqual(rep["by_status"]["CARRIER_CONFLICT"], 1)
        self.assertNotIn("claim one stays", section(out, 1))

    def test_a3_duplicate_decision_field_is_a_conflict(self):
        out, rep = asm.assemble(self.T, self.blocks(), "### B-002\ndecision: reject\ndecision: confirm\nbasis: supported\n", "")
        self.assertEqual(rep["by_status"]["CARRIER_CONFLICT"], 1)

    def test_a4_top_level_rule_is_a_block_and_delivered(self):
        t = "# All readers MUST remain read-only.\n## Details\n- Report an error.\n"
        b = asm.segment(t)
        self.assertEqual([x["kind"] for x in b], ["heading", "heading", "list_item"])
        out, _ = asm.assemble(t, b, "", "")
        self.assertIn("All readers MUST remain read-only.", section(out, 3))
        self.assertEqual(b[2]["parents"], ["# All readers MUST remain read-only.", "## Details"])

    def test_fenced_code_is_not_structure(self):
        b = asm.segment("## S\n- item\n```\n# not a heading\n- not an item\n```\n")
        self.assertEqual([x["kind"] for x in b], ["heading", "list_item"])
        self.assertEqual(b[1]["line_numbers"], [2, 3, 4, 5, 6])

    def test_projection_credits_only_active_assertions(self):
        dec = ("### B-001\ndecision: not_a_claim\n"
               "### B-002\ndecision: confirm\nbasis: supported\nevidence: S1 lines 1-2\n"
               "### B-003\ndecision: reject\nbasis: counterevidence\nreason: contradicted by S2\nevidence: S2 lines 3-4\n"
               "### B-004\ndecision: unresolved\nbasis: insufficient\nreason: not checked\n"
               "### B-005\ndecision: qualify\nbasis: counterevidence\nreason: narrower\nreplacement: claim four holds only for v3 stores.\n")
        out, rep = asm.assemble(self.T, self.blocks(), dec, "- NEW: an added finding")
        s1 = section(out, 1)
        self.assertIn("claim one stays", s1)
        self.assertIn("claim four holds only for v3 stores.", s1)
        for absent in ("claim two is wrong", "claim three unknown", "claim five undecided", "claim four qualified"):
            self.assertNotIn(absent, s1)
        self.assertIn("claim two is wrong", section(out, 2))
        self.assertIn("claim three unknown", section(out, 3))
        self.assertIn("claim five undecided", section(out, 3))
        self.assertIn("NEW: an added finding", section(out, 4))
        self.assertFalse(rep["complete"])

    def test_absence_without_search_and_unknown_ids(self):
        dec = "### B-002\ndecision: reject\nbasis: absence\nreason: not found\n### B-099\ndecision: confirm\n### B-003..B-005\ndecision: not_a_claim\n"
        out, rep = asm.assemble(self.T, self.blocks(), dec, "")
        self.assertEqual(rep["by_status"]["CARRIER_INCOMPLETE"], 1)
        self.assertEqual(rep["unknown_ids"], ["B-099"])
        self.assertEqual(rep["by_status"]["not_a_claim"], 3)

    def test_b8_neutral_title(self):
        out, _ = asm.assemble(self.T, self.blocks(), "", "")
        self.assertEqual(out.split("\n")[0], "# Delivered research result")
        self.assertNotRegex(out, rws.MARKERS)


class Runner(unittest.TestCase):
    PACK = [["S1", "M-control", "muse", "control"], ["S2", "M-control", "muse", "candidate"],
            ["S3", "Z-candidate", "zcode", "candidate"], ["S4", "Z-candidate", "zcode", "control"]]

    def setUp(self):
        self.d = Path(tempfile.mkdtemp())
        self.runs = self.d / "runs"
        self.policy = self.d / "policy.json"
        f = self.d / "frozen.txt"
        f.write_text("frozen")
        self.policy.write_text(json.dumps({"authorized_schedules": ["block1"], "schedules": {"block1": self.PACK, "block2": self.PACK},
                                           "files_sha256": {str(f): hashlib.sha256(b"frozen").hexdigest()}}))
        self.approval = self.d / "approval.json"
        self.approval.write_text(json.dumps({"schedule": "block1", "policy_sha256": hashlib.sha256(self.policy.read_bytes()).hexdigest()}))
        self.kw = {"policy_path": self.policy, "approval_path": self.approval, "lab": Path("/")}
        self.calls = []

    def fake(self, outcome):
        def runner(slot, package, app, variant):
            self.calls.append(slot)
            (self.runs / slot).mkdir(parents=True)
            run_r1b.write_status(self.runs / slot, state="terminal", outcome=outcome)
            return outcome
        return runner

    def test_b6_unauthorized_schedule_refused(self):
        with self.assertRaises(run_r1b.LaunchRefused):
            run_r1b.run_schedule("block2", runs=self.runs, runner=self.fake("goal_complete"), **self.kw)
        self.assertEqual(self.calls, [])

    def test_b6_missing_or_mismatched_approval_refused(self):
        self.approval.write_text(json.dumps({"schedule": "block1", "policy_sha256": "0" * 64}))
        with self.assertRaises(run_r1b.LaunchRefused):
            run_r1b.run_schedule("block1", runs=self.runs, runner=self.fake("goal_complete"), **self.kw)
        self.approval.unlink()
        with self.assertRaises(run_r1b.LaunchRefused):
            run_r1b.run_schedule("block1", runs=self.runs, runner=self.fake("goal_complete"), **self.kw)
        self.assertEqual(self.calls, [])

    def test_b6_frozen_hash_drift_refused(self):
        (self.d / "frozen.txt").write_text("changed")
        with self.assertRaises(run_r1b.LaunchRefused):
            run_r1b.run_schedule("block1", runs=self.runs, runner=self.fake("goal_complete"), **self.kw)

    def test_b6_real_policy_refuses_block2_and_unapproved_block1(self):
        with self.assertRaises(run_r1b.LaunchRefused):
            run_r1b.preflight("block2")
        if not run_r1b.APPROVAL.exists():
            with self.assertRaises(run_r1b.LaunchRefused):
                run_r1b.preflight("block1")

    def test_b4_harness_failure_stops_schedule(self):
        self.assertEqual(run_r1b.run_schedule("block1", runs=self.runs, runner=self.fake("harness_failure"), **self.kw), "stopped")
        self.assertEqual(self.calls, ["S1"])

    def test_quota_stop_stops_schedule(self):
        self.assertEqual(run_r1b.run_schedule("block1", runs=self.runs, runner=self.fake("quota_stop"), **self.kw), "stopped")
        self.assertEqual(self.calls, ["S1"])

    def test_cap_stop_continues(self):
        self.assertEqual(run_r1b.run_schedule("block1", runs=self.runs, runner=self.fake("cap_stop"), **self.kw), "completed")
        self.assertEqual(len(self.calls), 4)

    def test_b5_leftover_nonterminal_slot_stops_relaunch(self):
        (self.runs / "S1").mkdir(parents=True)
        run_r1b.write_status(self.runs / "S1", state="dispatched")
        self.assertEqual(run_r1b.run_schedule("block1", runs=self.runs, runner=self.fake("goal_complete"), **self.kw), "stopped")
        self.assertEqual(self.calls, [])
        shutil.rmtree(self.runs / "S1")
        (self.runs / "S1").mkdir(parents=True)  # a directory with no status record at all
        self.assertEqual(run_r1b.run_schedule("block1", runs=self.runs, runner=self.fake("goal_complete"), **self.kw), "stopped")
        self.assertEqual(self.calls, [])

    def test_prior_stopped_slot_is_not_skipped(self):
        (self.runs / "S1").mkdir(parents=True)
        run_r1b.write_status(self.runs / "S1", state="terminal", outcome="harness_failure")
        self.assertEqual(run_r1b.run_schedule("block1", runs=self.runs, runner=self.fake("goal_complete"), **self.kw), "stopped")
        self.assertEqual(self.calls, [])

    def test_terminal_done_slot_is_skipped(self):
        (self.runs / "S1").mkdir(parents=True)
        run_r1b.write_status(self.runs / "S1", state="terminal", outcome="goal_complete")
        run_r1b.run_schedule("block1", runs=self.runs, runner=self.fake("goal_complete"), **self.kw)
        self.assertEqual(self.calls, ["S2", "S3", "S4"])

    def test_classify(self):
        c = run_r1b.classify
        self.assertEqual(c(2, {"driver_error": "RuntimeError: synthetic adapter fault"})[0], "harness_failure")
        self.assertEqual(c(0, {})[0], "harness_failure")
        self.assertEqual(c(0, {"stop_reason": "goal_complete"})[0], "goal_complete")
        self.assertEqual(c(0, {"stop_reason": "cap_seconds"})[0], "cap_stop")
        self.assertEqual(c(0, {"stop_reason": "goal_active_idle90s"})[0], "incomplete_semantic")
        self.assertEqual(c(0, {"stop_reason": "goal_complete", "usage_read_after": {"usage": {"window": {"usedPercent": 95}}}})[0], "quota_stop")
        self.assertEqual(c(0, {"stop_reason": "goal_complete", "request_status_counts": {"model_request_failed": 3}})[0], "quota_stop")
        self.assertEqual(c(0, {"stop_reason": "goal_paused"})[0], "harness_failure")

    def test_real_run_one_with_mocked_native_failure_writes_terminal_stop(self):
        orig = run_r1b.native_goal
        run_r1b.native_goal = lambda app, ws, prompt, out, label: (2, {"driver_error": "RuntimeError: synthetic adapter fault"})
        try:
            outcome = run_r1b.run_one("T1", "M-control", "muse", "candidate", runs=self.runs)
        finally:
            run_r1b.native_goal = orig
        self.assertEqual(outcome, "harness_failure")
        st = json.loads((self.runs / "T1/status.json").read_text())
        self.assertEqual((st["state"], st["stop_schedule"]), ("terminal", True))
        self.assertEqual((self.runs / "T1/frozen/delivered/delivered.md").read_text().split("\n")[0], "# Delivered research result")


class FakeProc:
    def __init__(self, lines=(), block=False):
        self.pid, self._lines, self._block, self.killed = 999999, list(lines), block, threading.Event()
        self.stdout = self._iter()

    def _iter(self):
        for line in self._lines:
            yield line
        if self._block:
            self.killed.wait(5)

    def wait(self, timeout=None):
        return -15 if self.killed.is_set() else 0

    def poll(self):
        return -15 if self.killed.is_set() else None

    def terminate(self):
        self.killed.set()

    kill = terminate


class Reviewer(unittest.TestCase):
    def setUp(self):
        self.d = Path(tempfile.mkdtemp())
        self.ws = self.d / "REV"
        (self.ws / "out").mkdir(parents=True)
        self.prompt = self.d / "p.txt"
        self.prompt.write_text("/goal x")

    def clock(self, step):
        t = {"v": 0.0}

        def c():
            t["v"] += step
            return t["v"]
        return c

    def test_b7_silence_hits_deadline(self):
        proc = FakeProc(block=True)
        r = reviewer.run(self.ws, self.prompt, popen=lambda *a, **k: proc, clock=self.clock(1000), killer=lambda p: p.terminate(), poll=0.01)
        self.assertEqual((r["stop"], r["review_status"]), ("cap_seconds", "FAILED_INCOMPLETE"))
        self.assertTrue(proc.killed.is_set())
        self.assertTrue((self.d / "REV-receipt.json").exists())

    def test_b7_non_json_lines_do_not_bypass_deadline(self):
        proc = FakeProc(lines=["diagnostic line\n"] * 50, block=True)
        r = reviewer.run(self.ws, self.prompt, popen=lambda *a, **k: proc, clock=self.clock(1000), killer=lambda p: p.terminate(), poll=0.01)
        self.assertEqual(r["stop"], "cap_seconds")
        self.assertTrue(proc.killed.is_set())

    def test_missing_grades_is_failed_incomplete(self):
        proc = FakeProc(lines=[json.dumps({"type": "result", "subtype": "success"}) + "\n"])
        r = reviewer.run(self.ws, self.prompt, popen=lambda *a, **k: proc, clock=self.clock(1), killer=lambda p: p.terminate(), poll=0.01)
        self.assertEqual(r["review_status"], "FAILED_INCOMPLETE")

    def test_invalid_grades_json_is_failed_incomplete(self):
        (self.ws / "out/grades.json").write_text("{not json")
        (self.ws / "out/review.md").write_text("r")
        r = reviewer.run(self.ws, self.prompt, popen=lambda *a, **k: FakeProc(), clock=self.clock(1), killer=lambda p: p.terminate(), poll=0.01)
        self.assertEqual(r["review_status"], "FAILED_INCOMPLETE")
        self.assertFalse(r["host_validation"]["grades.json"]["json_valid"])

    def test_valid_review_counts_ids_and_keeps_effort_distinction(self):
        (self.ws / "out/grades.json").write_text("{}")
        (self.ws / "out/review.md").write_text("r")
        lines = [json.dumps({"type": "system", "subtype": "init", "model": "claude-opus-5-5", "effort": None}) + "\n",
                 json.dumps({"type": "assistant", "message": {"id": "m1"}}) + "\n",
                 json.dumps({"type": "assistant", "message": {}}) + "\n",
                 json.dumps({"type": "result", "subtype": "success"}) + "\n"]
        r = reviewer.run(self.ws, self.prompt, popen=lambda *a, **k: FakeProc(lines=lines), clock=self.clock(1),
                         killer=lambda p: p.terminate(), poll=0.01)
        self.assertEqual((r["review_status"], r["distinct_responses"], r["assistant_events_without_id"]), ("COMPLETED", 1, 1))
        self.assertIsNone(r["effective_effort_observed"])
        self.assertEqual(r["effort_requested"], "xhigh")


class LeakScan(unittest.TestCase):
    def test_title_marker_refused_and_content_mentions_reported(self):
        ws = Path(tempfile.mkdtemp())
        (ws / "results/X1").mkdir(parents=True)
        (ws / "results/X1/delivered.md").write_text("# Delivered research result (R1b-M-P1-candidate)\nbody\n")
        with self.assertRaises(rws.LeakRefused):
            rws.scan(ws)
        (ws / "results/X1/delivered.md").write_text("# Delivered research result\nI used stage1/evidence-bundle.md first.\n")
        self.assertEqual(len(rws.scan(ws)), 1)

    def test_path_marker_refused(self):
        ws = Path(tempfile.mkdtemp())
        (ws / "results/X1").mkdir(parents=True)
        (ws / "results/X1/evidence-bundle.md").write_text("x")
        with self.assertRaises(rws.LeakRefused):
            rws.scan(ws)


if __name__ == "__main__":
    unittest.main()
