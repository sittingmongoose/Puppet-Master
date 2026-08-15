import json
import subprocess
import sys
import unittest
from collections import Counter
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"


class RuntimeIntegrationDispositionTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.schema = json.loads(
            (PLANS / "runtime_integration_disposition.schema.json").read_text(encoding="utf-8")
        )
        cls.register = json.loads(
            (PLANS / "runtime_integration_disposition.json").read_text(encoding="utf-8")
        )

    def test_schema_and_instance_validate(self) -> None:
        Draft202012Validator.check_schema(self.schema)
        Draft202012Validator(self.schema, format_checker=FormatChecker()).validate(self.register)

    def test_canon_and_implementation_axes_are_separate(self) -> None:
        rows = self.register["items"]
        self.assertEqual(len(rows), 163)
        self.assertEqual(len({row["item_id"] for row in rows}), 163)
        self.assertEqual(Counter(row["implementation_status"] for row in rows), Counter({"not_started": 163}))
        self.assertEqual(sum(row["canon_closure"]["canon_repair_required_at_baseline"] for row in rows), 41)
        self.assertEqual(sum(row["canon_closure"]["implementation_only"] for row in rows), 8)
        self.assertEqual(sum(row["canon_closure"]["product_decision_required"] for row in rows), 0)
        self.assertTrue(all(not row["unresolved_conflicts"] for row in rows))
        self.assertTrue(all(not row["evidence"]["implementation_evidence"] for row in rows))

    def test_every_row_has_primary_owner_source_and_hash_evidence(self) -> None:
        for row in self.register["items"]:
            with self.subTest(item_id=row["item_id"]):
                self.assertTrue(row["evidence"]["source_packet"])
                primary = row["canonical_owner"]["primary"].split("#", 1)[0]
                anchors = row["evidence"]["exact_live_plan_anchors"]
                self.assertTrue(any(anchor["path"] == primary for anchor in anchors))
                self.assertTrue((ROOT / primary).is_file())

    def test_bounded_validator_passes(self) -> None:
        proc = subprocess.run(
            [sys.executable, "scripts/pm-runtime-integration-canon-validate.py", "validate"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        self.assertEqual(json.loads(proc.stdout)["status"], "pass")


if __name__ == "__main__":
    unittest.main()
