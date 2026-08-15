import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/pm-shared-runtime-command-contracts.py"


class SharedRuntimeCommandContractsTest(unittest.TestCase):
    def test_full_bounded_command_matrix(self) -> None:
        spec = importlib.util.spec_from_file_location("pm_shared_runtime_commands", SCRIPT)
        if spec is None or spec.loader is None:
            self.fail(f"cannot load {SCRIPT}")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        report = module.validate()
        self.assertTrue(report["passed"], report["failures"])
        self.assertEqual(report["canonical_binding_count"], 26)
        self.assertEqual(report["compatibility_count"], 7)
        self.assertEqual(report["rejected_count"], 1)
        self.assertEqual(report["wrapper_count"], 1)


if __name__ == "__main__":
    unittest.main()
