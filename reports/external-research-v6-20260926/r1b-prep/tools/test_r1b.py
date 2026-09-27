#!/usr/bin/env python3
"""Provider-free regression tests for the R1b repairs (python3 -m unittest tools/r1b/test_r1b.py)."""
import json
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
LAB = HERE.parent.parent
sys.path.insert(0, str(HERE))
from quote_locator import locate, locate_field  # noqa: E402
import build_evidence_bundle_v3 as bundle  # noqa: E402
import assemble_delivery as asm  # noqa: E402

SLOTS = ["M-control", "M-candidate", "Z-candidate", "Z-control"]


class QuoteLocator(unittest.TestCase):
    def test_underscore_is_contractual(self):  # review probe 1
        r = locate("authorizationrequired", ["the authorization_required flag"], [(1, 1)])
        self.assertFalse(r["exact"])
        self.assertEqual(r["class"], "not_located")

    def test_short_ellipsis_fragment_must_match(self):  # review probe 2
        r = locate("DO NOT ... run the recovery command", ["You may run the recovery command now."], [(1, 1)])
        self.assertEqual(r["class"], "not_located")

    def test_fragment_order_enforced(self):  # review probe 3
        src = ["second part here", "and first part there"]
        self.assertEqual(locate("second part ... first part", src, [(1, 2)])["class"], "ordered_fragments_at_cited_lines")
        self.assertEqual(locate("first part ... second part", src, [(1, 2)])["class"], "not_located")

    def test_fragments_never_exact(self):
        r = locate("alpha ... gamma", ["alpha beta gamma"], [(1, 1)])
        self.assertFalse(r["exact"])

    def test_documented_carrier_decoding_only(self):
        src = ['MUST contain the field "name" that', "gives the name."]
        self.assertTrue(locate('MUST contain the field \\"name\\" that gives the name.', src, [(1, 2)])["exact"])
        self.assertEqual(locate("must contain the field", src, [(1, 1)])["class"], "case_variant_at_cited_lines")
        self.assertEqual(locate("the field “name” that", src, [(1, 1)])["class"], "typography_variant_at_cited_lines")

    def test_escaped_newlines_named_class(self):
        src = ["def f(x):", "    return x"]
        r = locate("def f(x):\\n    return x", src, [(1, 2)])
        self.assertEqual(r["class"], "exact_after_escape_decoding_at_cited_lines")
        self.assertTrue(r["exact"])
        r2 = locate("def f(x):\\n return y", src, [(1, 2)])
        self.assertEqual(r2["class"], "not_located")

    def test_elsewhere_reports_line(self):
        src = ["x"] * 50 + ["the needle sentence is here"]
        r = locate("needle sentence", src, [(1, 3)])
        self.assertEqual(r["class"], "exact_elsewhere_in_source")
        self.assertEqual(r["line"], 51)


class QuoteFields(unittest.TestCase):
    SRC = ['Each "multiscales" dictionary SHOULD contain the field "name".', 'Other text.', 'If only one multiscale is provided, use it.']

    def test_plain_inner_quotes_stay_exact(self):
        r = locate_field('"Each "multiscales" dictionary SHOULD contain the field "name"."', self.SRC, [(1, 3)])
        self.assertTrue(r["exact"])
        self.assertEqual(r["class"], "exact_at_cited_lines")

    def test_composite_segments_are_locator_only(self):
        raw = '"Each \\"multiscales\\" dictionary SHOULD contain the field \\"name\\"." ... "If only one multiscale is provided, use it."'
        r = locate_field(raw, self.SRC, [(1, 3)])
        self.assertEqual(r["class"], "ordered_quoted_segments_at_cited_lines")
        self.assertFalse(r["exact"])

    def test_single_segment_with_annotation(self):
        r = locate_field('"If only one multiscale is provided, use it." (same for scale)', self.SRC, [(3, 3)])
        self.assertEqual(r["class"], "exact_quoted_segment_at_cited_lines")

    def test_segments_out_of_order_not_located(self):
        raw = '"If only one multiscale is provided" ... "Other text."'
        self.assertEqual(locate_field(raw, self.SRC, [(1, 3)])["class"], "not_located")


class BundleV3(unittest.TestCase):
    def fixture(self, n_lines=200, long_line=None):
        d = Path(tempfile.mkdtemp())
        (d / "sources").mkdir()
        lines = [f"line {i} text" for i in range(1, n_lines + 1)]
        lines[99] = "# Section heading 5"
        if long_line:
            lines[long_line - 1] = "A" * 5000 + " NEEDLE phrase " + "B" * 5000
        (d / "sources/S001.txt").write_text("\n".join(lines))
        (d / "catalog.json").write_text(json.dumps({"sources": [{"handle": "S001", "file": "sources/S001.txt",
                                                                 "aliases": [{"uri": "u"}]}]}))
        return d

    def test_every_cited_line_delivered(self):  # review fixture: 1-155 and 165-175
        d = self.fixture()
        (d / "obs.md").write_text("### O-001\n- source: S001 lines 1-155\n- quote: \"line 3 text\"\n"
                                  "### O-002\n- source: S001 lines 165-175\n- quote: \"line 170 text\"\n")
        s = bundle.build(d, d / "obs.md", d / "out")
        text = (d / "out/evidence-bundle.md").read_text()
        for n in list(range(1, 156)) + list(range(165, 176)):
            self.assertIn(f"{n:>6}| ", text)
        self.assertGreaterEqual(s["delivered_lines"], 175)

    def test_long_line_has_omitted_locator(self):
        d = self.fixture(long_line=120)
        (d / "obs.md").write_text("### O-001\n- source: S001 line 120\n- quote: \"NEEDLE phrase\"\n")
        bundle.build(d, d / "obs.md", d / "out")
        text = (d / "out/evidence-bundle.md").read_text()
        self.assertIn("OMITTED chars", text)
        self.assertIn("NEEDLE phrase", text)

    def test_single_read_per_source(self):  # review minor: setdefault re-read
        d = self.fixture()
        (d / "obs.md").write_text("### O-001\n- source: S001 lines 1-2\n- quote: \"line 1 text\"\n- quote: \"line 2 text\"\n"
                                  "- quote: \"line 3 text\"\n")
        s = bundle.build(d, d / "obs.md", d / "out")
        self.assertEqual(s["source_file_reads"], 1)

    def test_governing_heading_supplied(self):
        d = self.fixture()
        (d / "obs.md").write_text("### O-001\n- source: S001 lines 140-141\n- quote: \"line 140 text\"\n")
        bundle.build(d, d / "obs.md", d / "out")
        self.assertIn("Governing context: line 100: # Section heading 5", (d / "out/evidence-bundle.md").read_text())

    def test_real_frozen_observations(self):
        for slot in SLOTS:
            obs = LAB / "runs" / slot / "frozen/stage1/observations.md"
            with self.subTest(slot=slot):
                s = bundle.build(LAB / "case_bundle", obs, Path(tempfile.mkdtemp()))
                self.assertGreater(s["observations"], 0)


class Delivery(unittest.TestCase):
    def test_real_drafts_segment_exactly(self):
        for slot in SLOTS:
            text = (LAB / "runs" / slot / "frozen/stage1/draft.md").read_text(errors="replace")
            with self.subTest(slot=slot):
                blocks = asm.segment(text)  # raises if any line is unassigned or double-assigned
                self.assertGreater(len(blocks), 10)

    def test_assembly_rules(self):
        text = (LAB / "runs/Z-control/frozen/stage1/draft.md").read_text(errors="replace")
        blocks = asm.segment(text)
        ids = [b["id"] for b in blocks]
        dec = (f"### {ids[0]}\ndecision: confirm\nevidence: S003 lines 1-2\n"
               f"### {ids[1]}\ndecision: reject\nbasis: absence\nreason: not found\n"
               f"### {ids[2]}\ndecision: qualify\nbasis: counterevidence\nreplacement: Full replacement sentence.\n"
               f"### {ids[3]}..{ids[5]}\ndecision: not_a_claim\n"
               f"### B-999\ndecision: confirm\n")
        out, rep = asm.assemble(text, blocks, dec, "## New findings\n- N1", "t")
        self.assertIn("UNVERIFIED", out)
        self.assertEqual(len(rep["unverified"]), len(blocks) - 6)
        self.assertEqual(rep["absence_without_search"], [ids[1]])
        self.assertEqual(rep["unknown_ids"], ["B-999"])
        self.assertIn("Full replacement sentence.", out)
        self.assertEqual(rep["by_decision"]["not_a_claim"], 3)
        for b in blocks:  # every draft line is reproduced verbatim
            for n in b["line_numbers"]:
                self.assertIn(text.split("\n")[n - 1], out)

    def test_no_decisions_means_nothing_confirmed(self):
        text = (LAB / "runs/M-control/frozen/stage1/draft.md").read_text(errors="replace")
        out, rep = asm.assemble(text, asm.segment(text), "", "", "t")
        self.assertEqual(rep["decided"], 0)
        self.assertNotIn("Verifier: CONFIRMED", out)


if __name__ == "__main__":
    unittest.main()
