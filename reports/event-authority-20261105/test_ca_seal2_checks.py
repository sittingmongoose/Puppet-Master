"""Focused regressions for the CA-SEAL2 report checker."""
import ast
import importlib.util
import json
import subprocess
from textwrap import indent
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


class ModuleAliasTests(unittest.TestCase):
    def scan(self, body, imports='import os\nimport subprocess'):
        source = imports + '\nFIELDS = []\n\ndef probe():\n' + indent(body, '    ')
        return CHECKER.module_scope_problems(ast.parse(source))

    def test_sys_module_resolves_by_import_origin(self):
        for imports, body in (
            ('import os', 'os.sys.modules[__name__].FIELDS.clear()'),
            ('import subprocess', 'subprocess.sys.modules[__name__].FIELDS.clear()'),
            ('import sys', 's = sys\ns.modules[__name__].FIELDS.clear()'),
            ('import sys as runtime', 'runtime.modules[__name__].FIELDS.clear()'),
            ('from os import sys as runtime', 'runtime.modules[__name__].FIELDS.clear()'),
            ('from sys import modules as registry', 'registry[__name__].FIELDS.clear()'),
            ('import os as platform', 's = platform.sys\ns.modules[__name__].FIELDS.clear()'),
        ):
            with self.subTest(imports=imports, body=body):
                self.assertTrue(self.scan(body, imports)['reflection'])
        self.assertFalse(self.scan('sys = object()\nreturn sys.modules', '')['reflection'])

    def test_nested_aliases_cannot_mutate_module_container(self):
        for body in (
            "{'k': FIELDS}.get('k').clear()",
            "[FIELDS].copy()[0].clear()",
            "for value in {'k': FIELDS}.values():\n    value.clear()",
            "y = {'k': FIELDS}\ny.get('k').clear()",
            "y, = {'k': FIELDS}.values()\ny.clear()",
            "[*{'k': FIELDS}.values()][0].clear()",
            "sum((), FIELDS).clear()",
            "y = FIELDS\nsum((), y).clear()",
            "([FIELDS] * 2)[0].clear()",
            "([FIELDS] + [])[0].clear()",
            "f = lambda: FIELDS\nk = f\nk().clear()",
            "fs = [lambda: FIELDS]\nfs[0]().clear()",
            "d = {}\nd['k']: list = FIELDS\nd['k'].clear()",
            "d = {}\nfor d['k'] in (FIELDS,):\n    pass\nd['k'].clear()",
            "d = {}\nd['k'], z = FIELDS, 1\nd['k'].clear()",
        ):
            with self.subTest(body=body):
                self.assertTrue(self.scan(body)['mutates_a_module_container'])

    def test_read_only_controls(self):
        for body in ('return str([FIELDS])', 'return tuple(FIELDS or ())', 'return len(FIELDS)'):
            with self.subTest(body=body):
                self.assertFalse(any(self.scan(body).values()))
