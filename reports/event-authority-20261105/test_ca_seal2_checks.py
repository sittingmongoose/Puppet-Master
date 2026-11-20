"""Focused regressions for the CA-SEAL2 report checker."""
import importlib.util
import json
import subprocess
from pathlib import Path
import unittest


BUNDLE = Path(__file__).resolve().parent
REPO = BUNDLE.parents[1]
SPEC = importlib.util.spec_from_file_location('ca_seal2_checks', BUNDLE / 'CA-SEAL2-checks.py')
CHECKER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CHECKER)


def git_blob(revision, path):
    return subprocess.check_output(['git', '-C', str(REPO), 'show', f'{revision}:{path}'])


class CoverageTests(unittest.TestCase):
    def test_current_validator_matches_reviewed_coverage(self):
        archived = json.loads((BUNDLE / 'CA-SEAL2-tb5-results.json').read_bytes())
        e9 = json.loads((REPO / CHECKER.E9_CHECKS).with_name('seal-check-dl-pattern-results.json').read_bytes())
        names = {row['name'] for row in archived['results']}
        names.update('e9_' + name for name in e9['checks'])
        CHECKER.check_coverage(REPO, names)

    def test_pinned_original_validator_matches_archived_coverage(self):
        archived = json.loads((BUNDLE / 'CA-SEAL2-tb5-results.json').read_bytes())
        raw = git_blob(CHECKER.FROZEN_COMMIT, CHECKER.REL)
        before = git_blob(CHECKER.SEAL_BASE, CHECKER.REL).decode()
        table = json.loads(git_blob('932f4d9da7', CHECKER.COVERAGE))
        self.assertEqual(CHECKER.sha(raw), CHECKER.FROZEN_SHA)
        CHECKER.validate_coverage(raw, before, table, {row['name'] for row in archived['results']}, frozen=raw.decode())
