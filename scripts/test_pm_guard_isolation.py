"""Focused regressions for the guard engine, using the DDBG fixtures where applicable."""

from contextlib import chdir
from copy import deepcopy
import importlib.util
import json
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


def do_checkpoint_value():
    fixtures = ROOT / 'Plans/orchestrator_event_contract_fixtures.json'
    full = json.loads(fixtures.read_text())['event_cases'][0]
    read = full['read']['checkpoint']
    frontier = read['generations'][read['current_generation_id']]['frontier']
    return {'coverage': frontier['coverage'], 'full_checkpoint_case': full}


class GuardEngineTests(unittest.TestCase):
    def test_ddbg_large_integer_negative(self):
        from pm_debug_investigation_views import cleanup_retry_refusal

        suite = ddbg.retry_request_suite()
        negative = next(n for n in suite.negatives if n.target == 'retry.authorization')
        value = dict(negative.value, retries_used=10**4399 + 17)
        case = suite.factory(value)
        self.assertEqual(guard.run_case(case, value), (negative.target, negative.code))
        self.assertEqual(cleanup_retry_refusal(value['retries_used'], True), 'number_domain')
        text = '1' + '0' * 4397 + '17'
        self.assertEqual(guard.evidence_value(value['retries_used']), ['integer', text])
        self.assertEqual(guard.evidence_value(-value['retries_used']), ['integer', '-' + text])

    def test_ddbg_schema_view_reuse(self):
        builds = 0

        def profile(frame, event, arg):
            nonlocal builds
            if event != 'call':
                return
            if frame.f_code is guard.SchemaView.__init__.__code__:
                builds += 1

        suite = ddbg.retry_request_suite()
        previous = sys.getprofile()
        sys.setprofile(profile)
        try:
            report = guard.run(suite)
        finally:
            sys.setprofile(previous)
        self.assertEqual(report['status'], 'PASS', report['failures'])
        self.assertEqual((len(report['rows']), report['evaluations']), (7, 198))
        self.assertLess(builds, report['evaluations'] // 2)

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

    def test_checker_namespace_access_is_refused(self):
        source = ROOT / 'scripts/guard-isolation/namespace_census_fixture.py'
        # The function is never executed during the import-time scope check.
        self.assertEqual(guard.prescan_sources(source), [])
        suite = ddbg.retry_request_suite()
        suite.checker_modules = (source,)
        scan = guard.static_scan(suite, guard.GuardTable([]))
        errors = {e['source'] for e in scan['errors'] if e['kind'] == 'dynamic_code_or_import'}
        self.assertEqual(errors, {
            "'{0.label}'.format", "'{item[0]}'.format_map", "'{0:{1.width}}'.format", 'template.format',
            'frame.f_locals', 'function.__closure__', 'object.__getattribute__',
        })

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

    def test_ddbg_data_bindings_and_shared_predicates(self):
        original = ddbg.payload_target_bound_suite()
        negative = next(n for n in original.negatives if n.target == 'payload.target_sha256_hex')
        control = next(c for c in original.controls if c.id == negative.control)
        source = ROOT / 'scripts/guard-isolation/ddbg_data_bindings_fixture.py'
        spec = importlib.util.spec_from_file_location('ddbg_data_bindings_fixture', source)
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        self.addCleanup(sys.modules.pop, spec.name)
        spec.loader.exec_module(module)
        declarations = [
            guard.NonGuard(str(source.relative_to(ROOT)), factory, 'return',
                           'return g.Case(table, check, context)', 'Return the fresh case.')
            for factory in ('get_case', 'unpack_case')
        ]
        for factory, inactive in ((module.get_case, module.via_unpack_and_loop),
                                  (module.unpack_case, module.via_get)):
            with self.subTest(factory=factory.__name__):
                suite = guard.Suite('DDBG target digest', factory, [control], [negative],
                                    (source,), ROOT, non_guards=declarations)
                scan = guard.static_scan(suite, factory(control.value).table)
                self.assertTrue(any(not site['non_guard'] and site['function'] == inactive.__name__
                                    for site in scan['sites']))
                suite.other_suite_predicates = (inactive,)
                report = guard.run(suite)
                self.assertEqual(report['status'], 'PASS', report['failures'])
                self.assertEqual([row['id'] for row in report['rows'] if row['proved']], [negative.target])

    def test_do_checkpoint_purity_checkpoints(self):
        path = 'scripts/do-guards/do_checkpoint_coverage_1.py'
        source = ROOT / path
        spec = importlib.util.spec_from_file_location('do_full_checkpoint_coverage_fixture', source)
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        self.addCleanup(sys.modules.pop, spec.name)
        spec.loader.exec_module(module)
        value = do_checkpoint_value()
        incomplete = deepcopy(value)
        incomplete['coverage']['complete_to_captured_boundary'] = False
        suite = guard.Suite('DO full checkpoint', module.factory,
            [guard.Control('checkpoint', value, 'retained_history')],
            [guard.Negative('incomplete', incomplete, 'coverage_complete', 'index_complete_source_coverage',
                            'checkpoint', 'Incomplete coverage')],
            (path,), ROOT, non_guards=[
                guard.NonGuard(path, 'factory', 'return', 'return g.Case(table, check, context)', 'Return the fresh case.')
            ])
        checkpoints = full_snapshots = 0

        def profile(frame, event, arg):
            nonlocal checkpoints, full_snapshots
            if event != 'call':
                return
            if frame.f_code is guard.GuardTable._check_purity.__code__:
                checkpoints += 1
            if frame.f_code is guard._data_snapshot.__code__ and frame.f_back.f_code is guard.GuardTable._check_purity.__code__:
                full_snapshots += 1

        previous = sys.getprofile()
        sys.setprofile(profile)
        try:
            report = guard.run(suite)
        finally:
            sys.setprofile(previous)
        self.assertEqual(report['status'], 'PASS', report['failures'])
        self.assertGreaterEqual(checkpoints, report['evaluations'])
        self.assertEqual(full_snapshots, 0)

    def test_do_checkpoint_cross_code_duplicate_and_keyword_credit(self):
        do_scripts = str(ROOT / 'scripts/do-guards')
        sys.path.insert(0, do_scripts)
        self.addCleanup(sys.path.remove, do_scripts)
        source = ROOT / 'scripts/guard-isolation/do_checkpoint_keywords_fixture.py'
        spec = importlib.util.spec_from_file_location('do_checkpoint_keywords_fixture', source)
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        self.addCleanup(sys.modules.pop, spec.name)
        spec.loader.exec_module(module)
        checkpoint = ROOT / 'Plans/event_record_index_checkpoint.schema.json'
        coverage = json.loads(checkpoint.read_text())['$defs']['coverage']['properties']
        module.SCHEMA = {'properties': {key: coverage[key] for key in
                         ('complete_to_captured_boundary', 'empty_retained_source')}}
        schema = guard.SchemaCatalog({module.URI: module.SCHEMA})
        schema_ids = {row.keyword: row.id for row in schema.guards.values()}
        module.CONST, type_id = schema_ids['const'], schema_ids['type']
        value = do_checkpoint_value()
        incomplete = deepcopy(value)
        incomplete['coverage']['complete_to_captured_boundary'] = False
        wrong_type = deepcopy(value)
        wrong_type['coverage']['empty_retained_source'] = 'false'
        table = module.make_case(value).table
        runtime_id = 'coverage_complete'
        codes = {module.CONST: 'checkpoint_schema', runtime_id: 'index_complete_source_coverage'}
        dup = guard.Duplicate('coverage', (module.CONST, runtime_id),
                              table.guards[runtime_id].invariant, 'Both reject false coverage.', codes=codes)
        do_source = 'scripts/do-guards/do_checkpoint_coverage_1.py'
        path = str(source.relative_to(ROOT))
        declarations = [
            guard.NonGuard(path, 'coverage_value', 'return', "return value['coverage']", 'Return the schema subject.'),
            guard.NonGuard(path, 'coverage_value', 'data_operation', "value['coverage']", 'Select the fixture coverage.'),
            guard.NonGuard(path, 'make_case', 'return', 'return g.Case(table, check, context)', 'Return the fresh case.'),
            guard.NonGuard(path, 'make_case', 'call_review', 'g.SchemaCatalog({URI: SCHEMA})', 'Build the closed catalog.'),
            guard.NonGuard(path, 'make_case', 'data_operation', '{URI: SCHEMA}', 'Bind the real schema projection.'),
            guard.NonGuard(path, 'make_case', 'call_review',
                "catalog.bind(CONST, invariant, 'The generated DO guard and the coverage schema read the same field.', refusal_code='checkpoint_schema')",
                'Assign the code and invariant reviewed against the checkpoint schema and runtime row.'),
            guard.NonGuard(path, 'make_case', 'data_operation', 'catalog.bind', 'Resolve the catalog binding method.'),
            guard.NonGuard(path, 'make_case', 'call_review',
                "g.schema_table(catalog, {URI: coverage_value}, guards=[g.Guard('coverage_complete', invariant, 'index_complete_source_coverage', coverage_complete)])",
                'Build a table with both schema keywords and the unmodified DO runtime predicate.'),
            guard.NonGuard(path, 'make_case', 'data_operation', '{URI: coverage_value}', 'Bind the coverage selector.'),
            guard.NonGuard(path, 'make_case.check', 'call_review', 'table.validate(URI, value, context)',
                           'Validate the coverage schema through the engine.'),
            guard.NonGuard(do_source, 'factory', 'return', 'return g.Case(table, check, context)',
                           'The imported DO factory returns its fresh case.'),
        ]
        suite = guard.Suite('DO checkpoint coverage keywords', module.make_case,
            [guard.Control('checkpoint', value, 'retained_history')],
            [guard.Negative('incomplete', incomplete, dup.id, codes[module.CONST], 'checkpoint', 'Incomplete coverage'),
             guard.Negative('wrong-type', wrong_type, type_id, type_id, 'checkpoint', 'Wrong empty flag type')],
            (source, do_source), ROOT, duplicates=[dup], non_guards=declarations)
        report = guard.run(suite)
        self.assertEqual(report['status'], 'PASS', report['failures'])
        rows = {row['id']: row for row in report['rows']}
        self.assertEqual(rows[dup.id]['flips'], ['incomplete'])
        self.assertEqual(rows[type_id]['flips'], ['wrong-type'])
        self.assertEqual(rows[module.CONST]['flips'], [])
        self.assertEqual(rows[runtime_id]['flips'], [])
        retained = next(r for r in rows[module.CONST]['results'] if r['case'] == 'incomplete')
        self.assertEqual(retained['outcome'], {'accepted': False, 'guard': runtime_id,
                                             'code': 'index_complete_source_coverage'})
        self.assertEqual(report['unproved_guards'], [])
        self.assertEqual(report['duplicates'][0]['codes'], codes)
        wrong_map = dict(codes, coverage_complete='checkpoint_schema')
        suite.duplicates = [guard.Duplicate(dup.id, dup.sites, dup.invariant, dup.evidence, codes=wrong_map)]
        rejected = guard.run(suite)
        self.assertEqual(rejected['status'], 'FAIL')
        self.assertTrue(any('duplicate code mapping differs' in failure.get('error', '')
                            for failure in rejected['failures']))

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
