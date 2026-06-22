from __future__ import annotations

import hashlib
import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts/pm-plan-index.py"
SPEC = importlib.util.spec_from_file_location("pm_plan_index", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
pm_plan_index = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = pm_plan_index
try:
    SPEC.loader.exec_module(pm_plan_index)
except ModuleNotFoundError as exc:
    if exc.name != "yaml":
        raise
    pm_plan_index = None


PLAN_UNIT_BLOCK_1 = """```yaml
plan_unit_id: TEST-001
owner_doc: Plans/Test.md
gui_related: false
canonical_text: First test PlanUnit.
```
"""

PLAN_UNIT_BLOCK_2 = """```yaml
plan_unit_id: TEST-002
owner_doc: Plans/Test.md
gui_related: true
canonical_text: Second test PlanUnit.
```
"""


class PmPlanIndexCacheTests(unittest.TestCase):
    @unittest.skipIf(pm_plan_index is None, "PyYAML is unavailable to this Python interpreter")
    def test_extract_plan_units_uses_cached_document_metadata(self) -> None:
        with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
            plan_doc = Path(tmp) / "Test.md"
            plan_doc.write_text(
                "\n".join(
                    [
                        "# Test Doc",
                        "",
                        "## First Heading",
                        PLAN_UNIT_BLOCK_1.rstrip(),
                        "",
                        "## Second Heading",
                        PLAN_UNIT_BLOCK_2.rstrip(),
                        "",
                    ]
                ),
                encoding="utf-8",
            )
            expected_sha = hashlib.sha256(plan_doc.read_bytes()).hexdigest()

            original_top_level_plan_docs = pm_plan_index.top_level_plan_docs
            original_sha256_file = pm_plan_index.sha256_file
            pm_plan_index.top_level_plan_docs = lambda: [plan_doc]
            pm_plan_index.sha256_file = lambda path: self.fail(f"unexpected sha256_file call for {path}")
            try:
                units, errors, docs = pm_plan_index.extract_plan_units()
            finally:
                pm_plan_index.top_level_plan_docs = original_top_level_plan_docs
                pm_plan_index.sha256_file = original_sha256_file

            self.assertEqual(errors, [])
            self.assertEqual([unit["plan_unit_id"] for unit in units], ["TEST-001", "TEST-002"])
            self.assertEqual([unit["source_doc_sha256"] for unit in units], [expected_sha, expected_sha])
            self.assertEqual([unit["source_location"]["line"] for unit in units], [4, 12])
            self.assertEqual([unit["source_location"]["heading"] for unit in units], ["First Heading", "Second Heading"])
            self.assertEqual(docs[0]["sha256"], expected_sha)
            self.assertEqual(docs[0]["line_count"], len(plan_doc.read_text(encoding="utf-8").splitlines()))


if __name__ == "__main__":
    unittest.main()
