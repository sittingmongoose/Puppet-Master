import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/pm-goal-runtime-lineage.py"


class GoalRuntimeLineageTest(unittest.TestCase):
    def test_self_test_matrix(self) -> None:
        spec = importlib.util.spec_from_file_location("pm_goal_runtime_lineage", SCRIPT)
        if spec is None or spec.loader is None:
            self.fail(f"cannot load {SCRIPT}")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        report = module.self_test()
        self.assertEqual(report["status"], "pass", report["failures"])
        self.assertGreaterEqual(len(report["checks"]), 6)


if __name__ == "__main__":
    unittest.main()
