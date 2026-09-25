"""Git-three central integration shape/static composition; no native proof."""
import importlib.util
import json
import os
from pathlib import Path
import sys
import unittest

ROOT = Path(os.environ.get("PM_CANON_ROOT", Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(ROOT / "scripts"))
spec = importlib.util.spec_from_file_location("git3_integrated_gate", ROOT / "scripts/pm-new-contracts-verify.py")
gate = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = gate
spec.loader.exec_module(gate)
SCHEMA = "Plans/git_selected_three.schema.json"
FIXTURE = "Plans/git_selected_three_fixtures.json"

class GitSelectedIntegration(unittest.TestCase):
    def test_exact_pair_and_actual_record_dispatch(self):
        self.assertEqual(gate.CONTRACT_PAIRS.count((SCHEMA, FIXTURE)), 1)
        fixtures = json.loads((ROOT / FIXTURE).read_text())
        for case in fixtures["valid"]:
            # UI response calls the actual record definition, not fixture_case.
            # Empty local semantic failures is only structural pass-through:
            # it does NOT authenticate original/result/receipt/effect composition.
            self.assertEqual(gate.contract_semantic_failures(SCHEMA, "result", case["value"]["result"]), [])
            self.assertEqual(gate.contract_semantic_failures(SCHEMA, "fixture_case", case["value"]), [])
        for case in fixtures["invalid"]:
            self.assertIn(case["semantic_rule"], gate.contract_semantic_failures(SCHEMA, "fixture_case", case["value"]))

    def test_three_existing_public_bindings(self):
        rows = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())["entries"]
        for row_id in ("catalog.git_commit", "catalog.source_control_stash_create", "catalog.source_control_branch_create"):
            self.assertEqual(rows[row_id]["request_schema_ref"], SCHEMA + "#/$defs/request")
            self.assertEqual(rows[row_id]["result_schema_ref"], SCHEMA + "#/$defs/result")
            self.assertEqual(rows[row_id]["expected_event_types"], [])

if __name__ == "__main__":
    unittest.main()
