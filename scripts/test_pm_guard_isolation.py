"""Focused regressions for the guard engine, using the DDBG fixtures where applicable."""

from contextlib import chdir
import importlib.util
from pathlib import Path
import subprocess
import sys
import unittest

import pm_debug_investigation_guard_suites as ddbg
import pm_guard_isolation as guard


ROOT = Path(__file__).resolve().parent.parent


def reference_nodes(document):
    """The DDBG reference factory's original document-order walk."""
    nodes, pending = [], [document]
    while pending:
        node = pending.pop()
        if type(node) is dict:
            nodes.append(node)
            pending.extend(reversed(list(node.values())))
        elif type(node) is list:
            pending.extend(reversed(node))
    return nodes


def reference_keys(fragment):
    """The original DDBG fragment parser used constant slices."""
    return [part.replace('~1', '/').replace('~0', '~') for part in fragment[1:].split('/')] if fragment[:1] == '/' else []


class GuardEngineTests(unittest.TestCase):
    def test_run_case_verdict_and_restoration(self):
        suite = ddbg.retry_request_suite()
        negative = next(n for n in suite.negatives if n.target == 'retry.authorization')
        control = next(c for c in suite.controls if c.id == negative.control)
        case = suite.factory(control.value)
        self.assertEqual(guard.run_case(case, negative.value), (negative.target, negative.code))
        self.assertIsNone(guard.run_case(case, control.value))

        def forged_refusal(value):
            raise guard.GuardRefusal(negative.target, negative.code)

        invalid_case = guard.Case(case.table, forged_refusal, case.context)
        with self.assertRaisesRegex(guard.IsolationError, 'did not issue'):
            guard.run_case(invalid_case, control.value)
        self.assertIsNone(guard.run_case(case, control.value))
        with self.assertRaisesRegex(guard.IsolationError, 'return True'):
            guard.run_case(guard.Case(case.table, lambda value: False, case.context), control.value)
        self.assertIsNone(guard.run_case(case, control.value))

    def test_ddbg_retry_from_repository_root(self):
        with chdir(ROOT):
            report = guard.run(ddbg.retry_request_suite())
        self.assertFalse(report['runtime'], report['runtime'][:1])
        self.assertEqual(report['status'], 'PASS', report['failures'])

    def test_prescan_dotted_relative_and_reflective_reads(self):
        source = ROOT / 'scripts/guard-isolation/prescan_fixture.py'
        errors = guard.prescan_sources(source)
        observed = {(Path(e['path']).name, e['kind'], e['source']) for e in errors}
        self.assertEqual(observed, {
            ('prescan_fixture.py', 'dynamic_code_or_import', 'operator.attrgetter'),
            ('prescan_fixture.py', 'dynamic_code_or_import', 'operator.methodcaller'),
            ('prescan_fixture.py', 'external_binding_mutable_read', 'operator.attrgetter'),
            ('prescan_fixture.py', 'external_binding_mutable_read', 'operator.methodcaller'),
            ('prescan_fixture.py', 'dynamic_code_or_import', 'importlib.import_module'),
            ('prescan_fixture.py', 'table_private_state', 'engine._fixture_marker'),
            ('sibling.py', 'dynamic_code_or_import', 'globals'),
        })
        suite = ddbg.retry_request_suite()
        suite.checker_modules = (source,)
        scan = guard.static_scan(suite, guard.GuardTable([]))
        dynamic_reads = {e['source'] for e in scan['errors'] if e['kind'] == 'dynamic_code_or_import'}
        self.assertTrue({'operator.attrgetter', 'operator.methodcaller', 'importlib.import_module'} <= dynamic_reads)

    def test_ddbg_preparation_import_boundary(self):
        source = ROOT / 'scripts/guard-isolation/ddbg_setup_fixture.py'
        dependency = ROOT / 'scripts/pm_debug_investigation_views.py'
        errors = guard.prescan_sources(source, search=[str(ROOT / 'scripts')])
        self.assertTrue(any(Path(e['path']).name == 'pm_event_numbers.py' for e in errors))
        self.assertEqual(guard.prescan_sources(source, search=[str(ROOT / 'scripts')],
                                              trusted_setup_sources=[dependency]), [])

        # A declared checker reaching the same import still has a static
        # dependency census, regardless of the pre-import setup option.
        suite = ddbg.retry_request_suite()
        suite.checker_modules = (source,)
        scan = guard.static_scan(suite, guard.GuardTable([]))
        self.assertTrue(any(Path(f['path']).name == 'pm_event_numbers.py' for f in scan['files']))
        result = subprocess.run([sys.executable, '-B', str(ROOT / 'scripts/pm_guard_isolation.py'),
                                 '--adapter', f'{source}:run_setup', '--trusted-setup-source', str(dependency)],
                                capture_output=True, text=True, cwd=ROOT)
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout[:1000])

    def test_ddbg_short_circuit_digest(self):
        original = ddbg.payload_target_bound_suite()
        negative = next(n for n in original.negatives if n.target == 'payload.target_sha256_hex')
        control = next(c for c in original.controls if c.id == negative.control)
        source = ROOT / 'scripts/guard-isolation/target_digest_fixture.py'
        spec = importlib.util.spec_from_file_location('target_digest_fixture', source)
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        self.addCleanup(sys.modules.pop, spec.name)
        spec.loader.exec_module(module)
        suite = guard.Suite('DDBG digest generator', module.make_case, [control], [negative],
                            (source,), ROOT, non_guards=[
                                guard.NonGuard(str(source.relative_to(ROOT)), 'make_case', 'return',
                                    'return g.Case(table, check, context)', 'Return the fresh case.'),
                            ])
        report = guard.run(suite)
        self.assertFalse(report['static']['errors'], report['static']['errors'])
        self.assertFalse(report['runtime'], report['runtime'][:1])
        self.assertEqual(report['status'], 'PASS', report['failures'])

    @unittest.skipUnless(sys.version_info >= (3, 14), 'requires CPython constant slices')
    def test_ddbg_constant_slice_reference_parser(self):
        doc = next(n.value for n in ddbg.references_suite().negatives if n.id.endswith('missing definition'))
        fragment = next(node['$ref'] for node in reference_nodes(doc) if '#/' in node.get('$ref', '')).partition('#')[2]
        self.assertTrue(reference_keys(fragment))
        self.assertTrue(any(type(value) is slice for value in reference_keys.__code__.co_consts))
        guard._certified_snapshot([reference_keys.__code__], ROOT, identities=True)
        with self.assertRaisesRegex(guard.IsolationError, 'slice'):
            guard._certified_snapshot([slice([], 1)], ROOT, identities=True)

    def test_ddbg_reversed_reference_walk(self):
        suite = ddbg.references_suite()
        document = suite.controls[0].value
        self.assertTrue(reference_nodes(document))
        # Snapshot the walk without the test module's unrelated globals.
        walk = type(reference_nodes)(reference_nodes.__code__, {'__builtins__': __builtins__})
        guard._certified_snapshot([walk], ROOT, identities=True)
        # Certification is by identity, including an alias of the real builtin.
        guard._certified_snapshot([{'walk_backwards': reversed}], ROOT, identities=True)
        with self.assertRaisesRegex(guard.IsolationError, 'external class graph'):
            guard._certified_snapshot([type('reversed', (), {'__module__': 'builtins'})], ROOT, identities=True)


if __name__ == '__main__':
    unittest.main()
