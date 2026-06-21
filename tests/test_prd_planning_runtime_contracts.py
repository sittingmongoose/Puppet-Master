import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class PRDPlanningRuntimeContractsTest(unittest.TestCase):
    def test_runtime_contract_validator_passes(self) -> None:
        proc = subprocess.run(
            [sys.executable, "scripts/pm-prd-planning-runtime-validate.py"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        try:
            report = json.loads(proc.stdout)
        except json.JSONDecodeError as exc:  # pragma: no cover - failure path prints diagnostics.
            self.fail(f"validator did not emit JSON: {exc}\nstdout={proc.stdout}\nstderr={proc.stderr}")
        self.assertEqual(report["status"], "pass", report)
        self.assertEqual(proc.returncode, 0, report)


if __name__ == "__main__":
    unittest.main()
