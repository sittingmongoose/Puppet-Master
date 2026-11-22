"""Focused regressions for the CA-SEAL2 report checker."""
import ast
import importlib.util
import json
import subprocess
import sys
import tempfile
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


class ImportExitTests(unittest.TestCase):
    def run_checker(self, raw, pin_changed_bytes):
        git_dir = subprocess.check_output(
            ['git', '-C', str(REPO), 'rev-parse', '--absolute-git-dir'], text=True).strip()
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            (repo / '.git').write_text('gitdir: ' + git_dir + '\n')
            validator = repo / CHECKER.REL
            validator.parent.mkdir(parents=True)
            validator.write_bytes(raw)
            coverage = repo / CHECKER.COVERAGE
            coverage.parent.mkdir(parents=True)
            table = json.loads((REPO / CHECKER.COVERAGE).read_bytes())
            if pin_changed_bytes:
                table['validator_sha256'] = CHECKER.sha(raw)
            coverage.write_bytes(CHECKER.encoded(table))
            output = repo / 'result.json'
            result = subprocess.run([sys.executable, '-B', str(BUNDLE / 'CA-SEAL2-checks.py'),
                                     '--repo', str(repo), '--source-map', str(repo / 'unused.json'),
                                     '--out', str(output)], capture_output=True, text=True, check=False)
            self.assertEqual(result.returncode, 1, (result.stdout, result.stderr))
            report = json.loads(output.read_text())
            self.assertEqual((report['status'], report['checks'], report['passed'], report['failed']),
                             ('fail', 1, 0, 1))
            return report['results'][0]

    def test_unreviewed_source_fails_preflight(self):
        raw = (REPO / CHECKER.REL).read_bytes() + b'\r\nraise SystemExit(0)\r\n'
        result = self.run_checker(raw, pin_changed_bytes=False)
        self.assertEqual(result['name'], 'validator_source_preflight')
        self.assertIn('validator bytes do not match the coverage table', result['error'])

    def test_pinned_hash_does_not_waive_static_preflight(self):
        raw = (REPO / CHECKER.REL).read_bytes() + b'\r\nraise SystemExit(0)\r\n'
        result = self.run_checker(raw, pin_changed_bytes=True)
        self.assertEqual(result['name'], 'validator_source_preflight')
        self.assertIn('not_a_declaration', result['error'])

    def test_import_system_exit_writes_a_failure_result(self):
        raw = (REPO / CHECKER.REL).read_bytes().replace(
            b'if __name__ == "__main__":', b'import sys\r\nEARLY_EXIT = sys.exit(0)\r\n\r\nif __name__ == "__main__":')
        result = self.run_checker(raw, pin_changed_bytes=True)
        self.assertEqual(result['name'], 'validator_import')
        self.assertIn('SystemExit(0)', result['error'])
