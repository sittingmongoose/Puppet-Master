"""Retained search semantics in owner prose, not native navigation evidence."""
from pathlib import Path
import re
import unittest

import yaml

ROOT = Path(__file__).resolve().parents[1]


def unit(unit_id):
    text = (ROOT / "Plans/Settings_System.md").read_text()
    for block in re.findall(r"```yaml\n(.*?)\n```", text, re.S):
        value = yaml.safe_load(block)
        if isinstance(value, dict) and value.get("plan_unit_id") == unit_id:
            return value
    raise AssertionError(unit_id)


class SettingsSearchProseTests(unittest.TestCase):
    def test_result_identity_metadata_and_conditional_help(self):
        prose = unit("SSYS-005")["canonical_text"]
        for phrase in ("immutable result identity", "human label", "result type",
                       "complete human-readable Settings path", "canonical destination",
                       "owner-derived availability", "Help/documentation only where already supported",
                       "Non-setting results do not enter the ordinary-setting census",
                       "visual array position", "grouped-list position", "not routing authority"):
            self.assertIn(phrase, prose)

    def test_seven_source_cases_and_source_lineage_retained(self):
        row = unit("SSYS-005")
        criteria = " ".join(row["acceptance_criteria"])
        for phrase in ("grouped results", "duplicate labels", "typo/fuzzy matches",
                       "unavailable results", "manager objects", "deep setting rows",
                       "return to the query and same selected immutable result"):
            self.assertIn(phrase, criteria)
        for name in ("SSYS-005", "SSYS-019"):
            lineage = " ".join(str(x) for x in unit(name)["source_lineage"])
            self.assertIn("03_HOME_SEARCH_AND_NAVIGATION.md", lineage)
            self.assertIn("machine_readable/search_contract.json", lineage)

    def test_return_selection_is_not_native_focus_or_nearest_result(self):
        prose = unit("SSYS-019")["canonical_text"]
        for phrase in ("same selected immutable result separately from focus and scroll",
                       "origin_focus_id remains focus restoration, not search-result identity",
                       "recycled native row", "reject the stale return", "preserve the current surface",
                       "rather than selecting a nearby result"):
            self.assertIn(phrase, prose)

    def test_current_placement_geometry_and_route_only_boundary_preserved(self):
        prose = unit("SSYS-019")["canonical_text"]
        for phrase in ("non-active manager tab", "SSYS-035", "brief calm non-flashing locator",
                       "navigation, not execution of a displayed domain action", "retain K3 geometry",
                       "optional visible Back/Close controls", "current Escape order",
                       "close_transient, close_details, clear_query, return_to_opener"):
            self.assertIn(phrase, prose)
        self.assertIn("no manager hydration merely because a search row is visible", unit("SSYS-005")["canonical_text"])


if __name__ == "__main__":
    unittest.main()
