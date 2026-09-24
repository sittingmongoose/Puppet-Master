"""Static source-preservation tests, not Lens dispatch or summarization proof."""

from pathlib import Path
import re
import unittest

import yaml

ROOT = Path(__file__).resolve().parents[1]


class ContextLensCapProseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = (ROOT / "Plans/assistant-chat-design.md").read_text()
        cls.section = cls.text.split(
            "## Context Lens Source and Preview Reconciliation — 2026-09-10", 1
        )[1].split("\n## ", 1)[0]
        cls.units = [yaml.safe_load(block) for block in
                     re.findall(r"```yaml\n(.*?)\n```", cls.section, re.S)
                     if re.search(r"^plan_unit_id: ACD-460$", block, re.M)]

    def test_existing_owner_and_unit_are_retained(self):
        self.assertEqual(1, len(self.units))
        unit = self.units[0]
        self.assertEqual("Plans/assistant-chat-design.md", unit["owner_doc"])
        self.assertEqual("accepted", unit["status"])
        self.assertTrue(unit["gui_related"])
        self.assertFalse(unit["node_compile_hint"]["create_worknodes"])
        self.assertFalse(unit["node_compile_hint"]["create_nodeseeds"])

    def test_per_apply_limit_and_accumulation_are_in_owner_and_unit(self):
        prose = " ".join(self.section.split("```yaml", 1)[0].split())
        unit = self.units[0]
        for token in ("Subcompact Apply", "up to 25 messages",
                      "not a thread-wide total", "multiple operations may accumulate"):
            with self.subTest(token=token):
                self.assertIn(token, prose)
                self.assertIn(token, unit["canonical_text"])
                self.assertIn(token, unit["preserved_exact_tokens"])
        acceptance = " ".join(unit["acceptance_criteria"])
        self.assertIn("beyond 25 messages in the thread", acceptance)

    def test_limit_does_not_expand_to_other_modes_or_summary_policy(self):
        unit = self.units[0]
        text = " ".join(unit["canonical_text"].split())
        self.assertIn("does not impose a selection cap on Mute and Focus", text)
        self.assertIn("or specify a summary byte cap or extraction algorithm", text)
        self.assertIn("Do not promote a concept extraction algorithm or fixture byte cap "
                      "to production summarization policy.", unit["negative_constraints"])

    def test_original_scope_safety_and_exact_source_lineage_survive(self):
        for token in ("Mute and Focus continue to apply immediately",
                      "Cancel changes neither canonical source messages nor effective assembly",
                      "A duplicate Apply reuses its original result",
                      "releases the", "Canonical message history remains intact",
                      "does not inherit an in-flight preview capability"):
            self.assertIn(token, self.section)
        lineage = self.units[0]["source_lineage"]
        for suffix in ("02_FIXED_PRODUCT_BEHAVIOR.md:103-119",
                       "reference/original_handoff/01_FIXED_REQUIREMENTS.md:364-380",
                       "machine/original_requirements.json:contextLens.maximumMessagesPerApply"):
            self.assertTrue(any(source.endswith(suffix) for source in lineage), suffix)
        self.assertEqual([], re.findall(r"\bcmd\.[a-z_.]+", self.section))


if __name__ == "__main__":
    unittest.main()
