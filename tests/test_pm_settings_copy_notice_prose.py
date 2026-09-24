"""Static preservation of accepted Settings clauses; not GUI/runtime evidence."""

import json
from pathlib import Path
import re
import unittest

import yaml


ROOT = Path(__file__).resolve().parents[1]
TEXT = (ROOT / "Plans/Settings_System.md").read_text()


def unit(unit_id):
    for block in re.findall(r"```yaml\n(.*?)\n```", TEXT, re.S):
        parsed = yaml.safe_load(block)
        if isinstance(parsed, dict) and parsed.get("plan_unit_id") == unit_id:
            return parsed
    raise AssertionError(f"Missing {unit_id}")


class SettingsCopyNoticeProseTests(unittest.TestCase):
    def test_copy_initial_default_preserves_explicit_subset_and_admission(self):
        row = unit("SSYS-007")
        prose = row["canonical_text"]
        for phrase in (
            "defaults to all ten broad selector categories",
            "explicitly deselect categories before preview",
            "does not authorize apply",
            "credential and owner exclusions",
            "preview, confirmation, or apply admission",
        ):
            self.assertIn(phrase, prose)
        self.assertIn("defaults to all", row["preserved_exact_tokens"])
        self.assertTrue(any("newly opened copy flow" in value for value in row["acceptance_criteria"]))

    def test_notices_preserve_all_source_kinds_and_compact_anatomy(self):
        row = unit("SSYS-006")
        prose = row["canonical_text"]
        for phrase in (
            "Needs attention", "Continue setup", "Recommended",
            "one stable status treatment", "one actionable headline", "one short reason",
            "at most one primary action plus one quiet secondary action",
            "not repeated as four text layers",
        ):
            self.assertIn(phrase, prose)
        for label in ("Needs attention", "Continue setup", "Recommended"):
            self.assertIn(label, row["preserved_exact_tokens"])

    def test_notice_retention_does_not_add_shell_or_notification_owner(self):
        row = unit("SSYS-006")
        prose = row["canonical_text"]
        self.assertIn("existing K3 geometry", prose)
        self.assertIn("current shared status-token and manager-kit presentation", prose)
        self.assertIn("no header-level action strip", prose)
        criteria = " ".join(row["acceptance_criteria"])
        self.assertIn("without adding a new shell layout", criteria)
        self.assertIn("separate notification inbox", criteria)
        self.assertTrue(any("01_CORE_ARCHITECTURE.md:33-50" in str(value) for value in row["source_lineage"]))

    def test_explicit_subset_request_remains_one_to_ten(self):
        schema = json.loads((ROOT / "Plans/settings_system_contracts.schema.json").read_text())
        selectors = schema["$defs"]["settings_transfer_draft_preview_request"]["properties"]["selector_ids"]
        self.assertEqual((selectors["minItems"], selectors["maxItems"]), (1, 10))
        self.assertTrue(selectors["uniqueItems"])
        self.assertEqual(len(schema["$defs"]["settings_transfer_selector_id"]["enum"]), 10)
        fixtures = json.loads((ROOT / "Plans/settings_system_contract_fixtures.json").read_text())
        request = next(row["record"] for row in fixtures["valid_cases"] if row["case_id"] == "valid-settings-transfer-draft-preview-request")
        self.assertEqual(request["selector_ids"], ["appearance_workspace"])


if __name__ == "__main__":
    unittest.main()
