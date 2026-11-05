"""Method B regressions. Actual source modules, original functions, serial runs.

Temporary modules live outside the repository and are deleted after each run.
Every negative test names its required failure kind; an unrelated FAIL is not a catch.
"""
from __future__ import annotations
import ast
import builtins
from dataclasses import replace
import importlib.util
import json
from pathlib import Path
import sys
import tempfile


def _load(path, name, private_builtins=False):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    if private_builtins:
        module.__dict__['__builtins__'] = dict(vars(builtins))
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def _allow(g, path, function, kind, source, reason):
    return g.NonGuard(path, function, kind, source, reason)


def _code_suite(g, trap, root):
    path = root / 'subject.py'
    path.write_text(trap['source'])
    for name, source in trap.get('imports', {}).items():
        destination = root / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(source)
    sys.path[:0] = [str(root / p) for p in trap.get('extra_paths', [])] + [str(root)]
    module = _load(path, '_method_b_subject', bool(trap.get('builtin_override')))
    if trap.get('builtin_override'):
        override = trap['builtin_override']
        module.__dict__['__builtins__'][override['name']] = vars(module)[override['function']]
    if trap.get('remove_extra_paths_after_import'):
        for extra in trap.get('extra_paths', []):
            sys.path.remove(str(root / extra))
    suite = g.Suite(trap['id'], module.factory,
        [g.Control(c['id'], c['value'], 'synthetic') for c in trap['controls']],
        [g.Negative(n['id'], n['value'], n['target'], n['code'], n.get('control', 'valid'), n.get('defect', n['id'])) for n in trap['negatives']],
        ('subject.py',), root)
    if trap.get('alias_fixture'):
        for fixture in [*suite.controls, *suite.negatives]:
            fixture.value['right'] = fixture.value['left']
    # checker_modules accepts absolute paths; relative convenience is rooted here.
    suite.checker_modules = (path,)
    suite.non_guards = [_allow(g, 'subject.py', trap.get('factory_function', 'factory'), 'return',
        'return g.Case(table, check, context)', 'Factory returns a newly constructed execution object; it does not decide acceptance.')]
    for declaration in trap.get('non_guards', []):
        suite.non_guards.append(g.NonGuard(**declaration))
    if trap.get('reset_function'):
        suite.reset = vars(module)[trap['reset_function']]
    suite.reset_seams = [g.NonGuard(**declaration) for declaration in trap.get('reset_seams', [])]
    for duplicate in trap.get('duplicates', []):
        suite.duplicates.append(g.Duplicate(duplicate['id'], tuple(duplicate['sites']), g.Invariant(*duplicate['invariant']), duplicate['evidence']))
    if trap.get('omit_factory_allowance'):
        suite.non_guards = [d for d in suite.non_guards if d.function != 'factory']
    return suite


def _schema_suite(g, trap, root):
    # No synthetic acceptance callback: this source calls the actual complete
    # JSON Schema validator via the table's runtime tagging boundary.
    source = '''import pm_guard_isolation as g

def selected(value, context):
    return value

def factory():
    catalog = g.SchemaCatalog(DOCUMENTS, roots=ROOTS)
    table = g.schema_table(catalog, {entry: selected for entry in ROOTS})
    context = None
    def check(value):
        for entry in ROOTS:
            table.validate(entry, value)
        return True
    return g.Case(table, check, context)
'''
    path = root / 'subject.py'
    path.write_text(source)
    module = _load(path, '_method_b_schema')
    uri = 'https://pm.invalid/method-b/schema.json'
    module.DOCUMENTS = trap.get('documents', {uri: trap['schema']})
    module.ROOTS = tuple(trap.get('roots', [uri]))
    # Construction is tested eagerly, before any fixture can visit a bad ref.
    preview = module.factory()
    active = preview.table.guards
    labels = {}
    for name, selector in trap.get('labels', {}).items():
        found = [row.id for row in preview.table._schema.catalog.guards.values()
                 if row.classification == 'guard' and all(getattr(row, key) == (tuple(value) if key in ('path', 'input_path') else value) for key, value in selector.items())]
        if len(found) != 1:
            raise RuntimeError('schema label must select exactly one assertion: ' + name + ': ' + repr(found))
        labels[name] = found[0]
    suite = g.Suite(trap['id'], module.factory,
        [g.Control(c['id'], c['value'], 'synthetic') for c in trap['controls']],
        [g.Negative(n['id'], n['value'], labels[n['target']], active[labels[n['target']]].refusal_code,
                    n.get('control', 'valid'), n['id']) for n in trap.get('negatives', [])], (path,), root)
    suite.non_guards = [
        _allow(g, 'subject.py', 'selected', 'return', 'return value', 'Pure schema input selector; it returns data and cannot decide acceptance.'),
        _allow(g, 'subject.py', 'factory', 'return', 'return g.Case(table, check, context)', 'Fresh execution object construction.'),
        _allow(g, 'subject.py', 'factory', 'call_review', 'g.SchemaCatalog(DOCUMENTS, roots=ROOTS)', 'Eager complete schema inventory, retaining the original validator semantics.'),
        _allow(g, 'subject.py', 'factory', 'call_review', 'g.schema_table(catalog, {entry: selected for entry in ROOTS})', 'Engine schema/table plumbing; no adapter-issued refusal.')]
    suite.non_guards += [
        _allow(g, 'subject.py', 'factory.check', 'data_operation', 'for entry in ROOTS:\n    table.validate(entry, value)', 'Iterate the declared immutable tuple of schema-root strings; each complete validation stays tagged.'),
        _allow(g, 'subject.py', 'factory', 'data_operation', ' for entry in ROOTS', 'Construct selector bindings over the declared immutable tuple of roots.')]
    suite.non_guards.append(_allow(g, 'subject.py', 'factory', 'data_operation', '{entry: selected for entry in ROOTS}', 'Build a dictionary keyed only by the declared immutable root strings.'))
    return suite


def _special(g, trap, memory):
    kind = trap['kind']
    if kind == 'os-temp-scratch':
        with tempfile.TemporaryDirectory(prefix='guardtool-portable-', dir=_scratch_parent(None)) as directory:
            return Path(directory).parent == Path(tempfile.gettempdir()), {'parent': str(Path(directory).parent)}
    if kind == 'finite-memory':
        rejected = []
        for parameter in ('max_rss', 'pause_when_low', 'resume_at', 'poll', 'low_timeout'):
            for value in (float('nan'), float('inf'), -float('inf')):
                try:
                    g.MemoryGate(**{parameter: value})
                except g.IsolationError:
                    rejected.append([parameter, repr(value)])
        return len(rejected) == 15, {'rejected': rejected}
    if kind == 'memory-resume':
        available = iter([7, 5, 7])
        sleeps, clock = [], [0]
        def sleep(n):
            sleeps.append(n)
            clock[0] += n
        gate = g.MemoryGate(max_rss=0, pause_when_low=6, resume_at=7, poll=1,
                            available=lambda: next(available), sleep=sleep, clock=lambda: clock[0])
        gate.check()
        gate.check()
        return sleeps == [1], {'sleeps': sleeps}
    if kind == 'removed-backend':
        return not hasattr(g, 'AstGuards') and not hasattr(g, 'CodeSite'), {'AstGuards_present': hasattr(g, 'AstGuards')}
    raise RuntimeError('unknown special trap: ' + kind)


def _scratch_parent(scratch):
    if scratch is not None:
        scratch = Path(scratch).resolve()
        scratch.mkdir(parents=True, exist_ok=True)
    return scratch


def exercise(g, memory, *, scratch=None):
    adjacent = Path(__file__).with_name('guard_isolation_traps.json')
    corpus = json.loads((adjacent if adjacent.is_file() else Path(__file__).resolve().parents[1] / 'Plans/guard_isolation_traps.json').read_text())
    if corpus['version'] != 2:
        raise RuntimeError('expected Method B trap corpus')
    report = {'version': 2, 'method': 'B: guard tables', 'status': 'FAIL', 'caught': 0, 'traps': []}
    scratch = _scratch_parent(scratch)
    for trap in corpus['traps']:
        memory.check()
        row = {'id': trap['id'], 'expected': trap['expected'], 'caught': False}
        old_modules = set(sys.modules)
        old_path = list(sys.path)
        try:
            with tempfile.TemporaryDirectory(prefix='guardtool-b-trap-', dir=scratch) as directory:
                root = Path(directory)
                if trap['kind'] in ('code', 'schema'):
                    try:
                        suite = _code_suite(g, trap, root) if trap['kind'] == 'code' else _schema_suite(g, trap, root)
                        result = g.run(suite, memory=memory)
                        if trap.get('repeat'):
                            row['repeat_report'] = g.run(suite, memory=memory)
                        if trap.get('state_observation'):
                            observations = []
                            for cut in (False, True):
                                value = g._fixture_copy(suite.controls[0].value)
                                if trap['state_observation'] == 'alias':
                                    value['right'] = value['left']
                                before = g._data_snapshot(value)
                                original = suite.factory().table.guards['x'].predicate
                                (g._always_pass if cut else original)(value, None)
                                observations.append({'cut': cut, 'order': list(value.get('order', {})),
                                    'aliased': value.get('left') is value.get('right') if 'left' in value else None,
                                    'snapshot_unchanged': before == g._data_snapshot(value)})
                            row['observation'] = observations
                    except g.IsolationError as exc:
                        result = {'status': 'FAIL', 'failures': [{'kind': 'construction_refused', 'error': str(exc)}], 'rows': []}
                    row['report'] = result
                    failures = {f['kind'] for f in result['failures']}
                    required = set(trap.get('failure_kinds', []))
                    row['caught'] = result['status'] == trap.get('status', 'FAIL') and required <= failures
                    if trap.get('error_contains'):
                        row['caught'] = row['caught'] and any(trap['error_contains'] in f.get('error', '') for f in result['failures'])
                    if trap.get('static_kind'):
                        row['caught'] = row['caught'] and any(s['kind'] == trap['static_kind'] and not s['non_guard'] for s in result.get('static', {}).get('sites', []))
                    if trap.get('static_error_kind'):
                        row['caught'] = row['caught'] and any(e['kind'] == trap['static_error_kind'] for e in result.get('static', {}).get('errors', []))
                    if trap.get('runtime_type'):
                        row['caught'] = row['caught'] and any(e.get('type') == trap['runtime_type'] for e in result.get('runtime', []))
                    if trap.get('protocol_contains'):
                        row['caught'] = row['caught'] and any(trap['protocol_contains'] in error for f in result['failures'] if f['kind'] == 'table_protocol_error' for error in f['errors'])
                    if trap.get('repeat'):
                        repeated = row['repeat_report']
                        row['caught'] = row['caught'] and repeated['status'] == 'FAIL' and required <= {f['kind'] for f in repeated['failures']} and not any(r.get('proved') for r in repeated['rows'])
                    if trap.get('state_observation'):
                        observations = row['observation']
                        row['caught'] = row['caught'] and not observations[0]['snapshot_unchanged'] and observations[1]['snapshot_unchanged']
                        if trap['state_observation'] == 'alias':
                            row['caught'] = row['caught'] and observations[0]['aliased'] is False and observations[1]['aliased'] is True
                        else:
                            row['caught'] = row['caught'] and observations[0]['order'] == ['b', 'a'] and observations[1]['order'] == ['a', 'b']
                    if trap.get('imported_file'):
                        row['caught'] = row['caught'] and any(f['path'] == trap['imported_file'] for f in result.get('static', {}).get('files', []))
                    if trap.get('matrix_guard'):
                        row['caught'] = row['caught'] and any(c['guard'] == trap['matrix_guard'] and c['negative'] == trap['matrix_negative'] and c.get('passes') is False for c in result.get('guard_negative_matrix', []))
                    if trap.get('no_credit', True) and result['status'] == 'FAIL':
                        row['caught'] = row['caught'] and not any(r.get('proved') for r in result['rows'])
                    if trap.get('proved_rows') is not None:
                        row['caught'] = row['caught'] and sum(bool(r.get('proved')) for r in result['rows']) == trap['proved_rows']
                    if trap.get('duplicate_proved'):
                        row['caught'] = row['caught'] and all(d['proved'] for d in result['duplicates']) and bool(result['duplicates'])
                else:
                    row['caught'], row['report'] = _special(g, trap, memory)
        except BaseException as exc:
            row['error'] = type(exc).__name__ + ': ' + str(exc)
        finally:
            sys.path[:] = old_path
            for name in set(sys.modules) - old_modules:
                module = sys.modules.get(name)
                path = getattr(module, '__file__', None)
                if name.startswith('_method_b_') or (path and 'root' in locals() and Path(path).is_relative_to(root)):
                    sys.modules.pop(name, None)
        report['traps'].append(row)
        report['caught'] += bool(row['caught'])
    report['status'] = 'PASS' if report['caught'] == len(report['traps']) else 'FAIL'
    return report
