"""Exact successor preservation; no native storage or migration claim."""
import copy
import importlib.util
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
SPEC = importlib.util.spec_from_file_location(
    "capability_storage_materializer_under_test",
    ROOT / "scripts/pm-shared-runtime-storage-materialize.py")
M = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = M
SPEC.loader.exec_module(M)
from pm_capability_custody_storage import registry_candidate

IDS = {"installation_lifecycle_record", "capability_provisioning_operation"}


class CapabilityMaterializerSuccessors(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.current = json.loads(M.REGISTRY_PATH.read_text())
        cls.old_rows = {s.family_id: M.family_row(s) for s in M.FAMILY_SPECS
                        if s.family_id in IDS}
        cls.new_rows = {r["family_id"]: r for r in registry_candidate({
            "families": list(cls.old_rows.values()),
            "contract_family_dispositions": [{
                "disposition_id": "scd.capability.continuation_custody.v1",
                "physical_family_status": "physical_family_registration_pending",
                "source_refs": [],
            }],
        })["families"]}

    def tree(self, rows):
        result = copy.deepcopy(self.current)
        result["families"] = [copy.deepcopy(rows.get(r["family_id"], r))
                              for r in result["families"]]
        return result

    def test_historical_v1_remains_exact(self):
        result = M.expected_registry(self.tree(self.old_rows))
        for row in result["families"]:
            if row["family_id"] in IDS:
                self.assertEqual(row, self.old_rows[row["family_id"]])

    def test_v2_preserved_without_changing_other_materialization(self):
        old = M.expected_registry(self.tree(self.old_rows))
        source = self.tree(self.new_rows)
        before = copy.deepcopy(source)
        new = M.expected_registry(source)
        self.assertEqual(source, before)
        old_by_id = {r["family_id"]: r for r in old["families"]}
        for row in new["families"]:
            self.assertEqual(row, self.new_rows.get(row["family_id"], old_by_id[row["family_id"]]))
        self.assertEqual(new["contract_family_dispositions"], source["contract_family_dispositions"])
        self.assertEqual(new["retention_policies"], source["retention_policies"])
        self.assertEqual(M.expected_registry(new), new)

    def test_unknown_or_corrupted_successor_refuses(self):
        for family in sorted(IDS):
            for field, value in (("schema_version", "3.0.0"),
                                 ("schema_version", "1.0.0"),
                                 ("key_shape", "foreign.v2:{operation_id}"),
                                 ("value_schema", {}),
                                 ("retention_policy_ref", "RP-AUTHORITY-INDEFINITE"),
                                 ("compatibility_key_shapes", []),
                                 ("producer", ["foreign producer"])):
                with self.subTest(family=family, field=field):
                    rows = copy.deepcopy(self.new_rows)
                    rows[family][field] = value
                    with self.assertRaisesRegex(ValueError, "requires readjudication"):
                        M.expected_registry(self.tree(rows))

    def test_historical_row_with_successor_key_refuses(self):
        for family in sorted(IDS):
            with self.subTest(family=family):
                rows = copy.deepcopy(self.old_rows)
                rows[family]["key_shape"] = self.new_rows[family]["key_shape"]
                with self.assertRaisesRegex(ValueError, "requires readjudication"):
                    M.expected_registry(self.tree(rows))


if __name__ == "__main__":
    unittest.main()
