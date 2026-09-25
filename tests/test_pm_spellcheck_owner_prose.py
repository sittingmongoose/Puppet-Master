"""Source-preservation checks only; no spelling engine or native execution proof."""

from pathlib import Path
import re
import unittest

import yaml

ROOT = Path(__file__).resolve().parents[1]


class SpellcheckOwnerProseTests(unittest.TestCase):
    def section(self):
        text = (ROOT / "Plans/assistant-chat-design.md").read_text()
        marker = "## Passive Spelling And Dictionary Routing"
        self.assertTrue(marker in text, "Missing designated-owner passive spelling section")
        return text.split(marker, 1)[1].split("\n## ", 1)[0]

    def test_local_default_and_explicit_actions_are_retained(self):
        text = self.section()
        for token in ("one shared local spelling service", "enabled by default",
                      "subtle spelling underlines", "context-menu suggestions",
                      "replace once", "ignore once", "current composer buffer",
                      "add to the chosen dictionary", "No autocorrect"):
            with self.subTest(token=token):
                self.assertIn(token, text)

    def test_exact_token_exclusions_and_sources_are_retained(self):
        text = self.section()
        for token in ("code, URLs, paths, commands, hashes, identifiers, structured data",
                      "known Puppet Master/provider names", "Automatic",
                      "System dictionaries only", "PM local dictionaries only",
                      "Personal dictionary", "Project dictionary", "language packs",
                      "thread-level disable", "technical-prose", "unknown-name"):
            with self.subTest(token=token):
                self.assertIn(token, text)

    def test_provider_consent_and_unadmitted_companions_stay_explicit(self):
        text = self.section()
        for token in ("does not", "send composer text to a model/provider",
                      "create provider Usage", "permanent Chat toolbar control",
                      "separate, explicitly opt-in provider-backed work",
                      "privacy", "selected route", "cost", "Usage disclosure",
                      "silently substitutes a provider route", "no physical family",
                      "no new setting ID", "follow-on work", "No candidate `cmd.spelling.*`",
                      "user-facing Draft product"):
            with self.subTest(token=token):
                self.assertIn(token, text)

    def test_custom_dictionary_follows_project_not_personal_identity(self):
        text = self.section()
        for token in ("User-managed custom words belong to the Project dictionary",
                      "follows its Project across installations",
                      "another person using the same Project sees those words",
                      "former Personal dictionary label admits no independent custom-word store",
                      "Built-in/System language dictionaries and source selection are unchanged",
                      "Plans/Decision_Log.md#DL-099"):
            with self.subTest(token=token):
                self.assertIn(token, text)
        for retired_claim in ("Personal dictionary management",
                              "Personal and Project dictionaries remain distinct domain objects",
                              "personal/Project dictionary distinctions remain visible"):
            with self.subTest(retired_claim=retired_claim):
                self.assertNotIn(retired_claim, text)
        unit = yaml.safe_load(re.search(r"```yaml\n(.*?)\n```", text, re.S).group(1))
        self.assertIn("DL-099", unit["depends_on"])
        self.assertIn("User-managed custom words belong to the Project dictionary",
                      unit["canonical_text"])
        self.assertTrue(any("User-managed custom words are per Project" in criterion
                            for criterion in unit["acceptance_criteria"]))

    def test_plan_unit_is_unique_and_preserves_exact_source_tokens(self):
        text = (ROOT / "Plans/assistant-chat-design.md").read_text()
        units = [yaml.safe_load(block) for block in re.findall(r"```yaml\n(.*?)\n```", text, re.S)
                 if re.search(r"^plan_unit_id: ACD-468$", block, re.M)]
        self.assertEqual(1, len(units))
        unit = units[0]
        self.assertEqual("Plans/assistant-chat-design.md", unit["owner_doc"])
        self.assertEqual("accepted", unit["status"])
        self.assertTrue(unit["gui_related"])
        self.assertFalse(unit["node_compile_hint"]["create_worknodes"])
        self.assertFalse(unit["node_compile_hint"]["create_nodeseeds"])
        for token in unit["preserved_exact_tokens"]:
            self.assertIn(token, unit["canonical_text"])
        for case in ("CHAT-014", "CHAT-015", "MGR-030"):
            self.assertTrue(any(case in source for source in unit["source_lineage"]))


if __name__ == "__main__":
    unittest.main()
