"""Synthetic fixtures for the ledger compile witnesses; static text checks only."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


def load_witness():
    spec = importlib.util.spec_from_file_location("pm_ledger_compile_witness", ROOT / "scripts" / "pm-ledger-compile-witness.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


DOC = """# Demo owner document

## 2. PlanUnits

### DEM-001 - First Unit

```yaml
plan_unit_id: DEM-001
canonical_text: >-
  Every capture records `alpha_field` and never restores `beta_state` as active state.
acceptance_criteria:
  - The record names `alpha_field`.
preserved_exact_tokens: [alpha_field, "beta_state"]
```

### DEM-002 - Second Unit

```yaml
plan_unit_id: DEM-002
canonical_text: >-
  Unchanged unit with no tokens from this wave.
preserved_exact_tokens: [gamma]
```

## Addendum

```yaml
plan_unit_id: DEM-003
canonical_text: >-
  A unit appended without a heading of its own; it names `epsilon_field`.
preserved_exact_tokens: [epsilon_field]
```
"""


def write_ledger(root: Path, *, targets_for_atom: list[str], tokens: list[str], repairs_sentence: str) -> Path:
    plans = root / "Plans"
    (plans).mkdir(parents=True, exist_ok=True)
    (plans / "Demo.md").write_text(DOC, encoding="utf-8")
    ledger = plans / "ledgers" / "v2" / "pldg-demo"
    (ledger / "state").mkdir(parents=True)
    (ledger / "records").mkdir()
    (ledger / "source_shards").mkdir()
    (ledger / "state" / "compile_queue.json").write_text(json.dumps({
        "ledger_id": "pldg-demo", "canonical_plan_targets": ["Plans/Demo.md"], "compiled_owner_docs": ["Plans/Demo.md"],
        "compiled_plan_outputs": ["Plans/Demo.md"],
        "items": [{"queue_id": "queue-001", "source_atom_ids": ["atom-1"], "target_plan_unit_ids": targets_for_atom}]}), encoding="utf-8")
    (ledger / "records" / "design_atoms.jsonl").write_text(json.dumps({"atom_id": "atom-1", "exact_tokens": tokens}) + "\n", encoding="utf-8")
    (ledger / "records" / "corrections.jsonl").write_text(json.dumps({"correction_id": "cor-001", "finding_id": "XX1-01 + XX2-02", "source_atom_ids": ["atom-1"]}) + "\n", encoding="utf-8")
    (ledger / "source_shards" / "findings.md").write_text(f"# Findings\n\n## Record 1 — demo (XX1-01, a; XX2-02, b)\n\n{repairs_sentence}\n\n## Evidence\n\nnone\n", encoding="utf-8")
    return ledger


class WitnessTests(unittest.TestCase):
    def setUp(self):
        self.mod = load_witness()

    def test_clean_fixture_passes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            ledger = write_ledger(root, targets_for_atom=["DEM-001"], tokens=["alpha_field", "beta_state"],
                                  repairs_sentence="Repairs DEM-001 (`Plans/Demo.md`), which already required the record. Change: names the field.")
            report = self.mod.run(root, ledger, None)
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["summary"]["records"], 1)
        self.assertEqual(report["summary"]["named_but_not_targeted"], 0)
        self.assertEqual(report["summary"]["tokens_missing_from_prose"], 0)
        self.assertEqual(report["summary"]["tokens_missing_from_registry"], 0)

    def test_named_unit_not_targeted_fires(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            ledger = write_ledger(root, targets_for_atom=["DEM-001"], tokens=["alpha_field"],
                                  repairs_sentence="Repairs DEM-001 and DEM-002. Change: only DEM-001 was edited.")
            report = self.mod.run(root, ledger, None)
        self.assertEqual(report["status"], "findings")
        rec = report["witness_repairs_vs_targets"][0]
        self.assertEqual(rec["named_units"], ["DEM-001", "DEM-002"])
        self.assertEqual(rec["queue_targets"], ["DEM-001"])
        self.assertEqual(rec["named_but_not_targeted"], ["DEM-002"])

    def test_token_missing_from_prose_and_registry_fires(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            ledger = write_ledger(root, targets_for_atom=["DEM-001"], tokens=["alpha_field", "delta_missing"],
                                  repairs_sentence="Repairs DEM-001. Change: adds delta.")
            report = self.mod.run(root, ledger, None)
        self.assertEqual(report["status"], "findings")
        by_token = {r["token"]: r for r in report["witness_exact_tokens"]}
        self.assertEqual(by_token["alpha_field"]["units_with_token_in_prose"], ["DEM-001"])
        self.assertEqual(by_token["alpha_field"]["units_with_token_in_registry"], ["DEM-001"])
        self.assertEqual(by_token["delta_missing"]["units_with_token_in_prose"], [])
        self.assertEqual(by_token["delta_missing"]["units_with_token_in_registry"], [])
        self.assertEqual(report["summary"]["tokens_missing_from_prose"], 1)

    def test_token_in_one_of_several_owner_units_passes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            ledger = write_ledger(root, targets_for_atom=["DEM-001", "DEM-002"], tokens=["alpha_field", "gamma"],
                                  repairs_sentence="Repairs DEM-001 and DEM-002. Change: splits the obligation across both.")
            report = self.mod.run(root, ledger, None)
        self.assertEqual(report["status"], "pass")
        by_token = {r["token"]: r for r in report["witness_exact_tokens"]}
        self.assertEqual(by_token["alpha_field"]["units_with_token_in_prose"], ["DEM-001"])
        self.assertEqual(by_token["gamma"]["units_with_token_in_prose"], ["DEM-002"])

    def test_heading_less_unit_is_found_by_plan_unit_id(self):
        found = self.mod.units_in(DOC)
        self.assertIn("DEM-003", found)
        self.assertIn("epsilon_field", found["DEM-003"]["text"])
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            ledger = write_ledger(root, targets_for_atom=["DEM-003"], tokens=["epsilon_field"],
                                  repairs_sentence="Repairs DEM-003. Change: none needed.")
            report = self.mod.run(root, ledger, None)
        self.assertEqual(report["status"], "pass")

    def test_registry_parsing_handles_quoted_inline_list(self):
        self.assertEqual(self.mod.registry('preserved_exact_tokens: [a, "b c", \'d\']\n'), ["a", "b c", "d"])
        self.assertEqual(self.mod.registry("preserved_exact_tokens:\n  - x\n  - \"y z\"\n"), ["x", "y z"])
        self.assertEqual(self.mod.registry("no registry here"), [])


if __name__ == "__main__":
    unittest.main()
