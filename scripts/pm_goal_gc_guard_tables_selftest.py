"""Regression checks for the canonical Goal guard table CLI."""

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class GoalGuardTableCheckTests(unittest.TestCase):
    def check_tables(self, *sources):
        with tempfile.TemporaryDirectory(prefix='pm-goal-gc-check-') as directory:
            out = Path(directory)
            args = [arg for source in sources for arg in ('--source', source)]
            result = subprocess.run(
                [sys.executable, '-B', 'scripts/pm-goal-gc-guard-tables.py', '--out', str(out), '--check', *args],
                cwd=ROOT, capture_output=True, text=True,
            )
            problems = json.loads((out / 'check.json').read_text())['problems']
            self.assertEqual((result.returncode, len(problems)), (0, 0),
                             f'{result.stderr}{result.stdout}First problems: {problems[:4]}')

    def test_selected_source_has_its_own_module_and_row_scope(self):
        self.check_tables('own_a')

    def test_whole_tree_checks_the_combined_inventory(self):
        self.check_tables()


if __name__ == '__main__':
    unittest.main()
