"""Static Search owner-edge consistency; no native rebuild proof."""
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class SearchRebuildIdentityTests(unittest.TestCase):
    def test_owner_edge_matches_registered_command(self):
        wiring = (ROOT / "Plans/Wiring_Matrix.md").read_text()
        catalog = (ROOT / "Plans/UI_Command_Catalog.md").read_text()
        entries = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
        command = entries["catalog.search_rebuild_index"]["ui_command_id"]
        self.assertEqual(command, "cmd.search.rebuild_index")
        self.assertIn(f"| `{command}` | IndexBuilder `build_full` |", wiring)
        self.assertIn(f"| `{command}` |", catalog)
        self.assertNotIn("| `cmd.search.rebuild_regex_index` |", wiring)

    def test_predecessor_is_lineage_not_an_alternate_registration(self):
        wiring = (ROOT / "Plans/Wiring_Matrix.md").read_text()
        entries = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
        self.assertIn("historical cmd.search.rebuild_regex_index spelling is source lineage only, not a registered command or alias", wiring)
        self.assertNotIn("cmd.search.rebuild_regex_index", {row.get("ui_command_id") for row in entries.values()})


if __name__ == "__main__":
    unittest.main()
