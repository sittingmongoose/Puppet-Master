import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/pm-storage-recovery-contracts.py"


class StorageRecoveryContractsTest(unittest.TestCase):
    def test_bounded_schema_and_negative_matrix(self) -> None:
        spec = importlib.util.spec_from_file_location("pm_storage_recovery", SCRIPT)
        if spec is None or spec.loader is None:
            self.fail(f"cannot load {SCRIPT}")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        report = module.self_test()
        self.assertEqual(report["status"], "pass", report["failures"])
        required_checks = {
            "blocked_receipt_after_ready_preflight",
            "receipt_rejects_blocked_insufficient_space_as_terminal_receipt",
            "registry_has_exact_transitive_migration_receipt_bundle",
            "registry_inline_accepts_valid_receipt",
            "registry_rejects_root_constraint_drift",
            "registry_rejects_transitive_definition_drift",
            "registry_rejects_unresolved_local_ref",
            "registry_rejects_external_ref",
        }
        self.assertTrue(required_checks.issubset(report["checks"]), report["checks"])
        self.assertTrue(all(report["checks"].values()), report["checks"])


if __name__ == "__main__":
    unittest.main()
