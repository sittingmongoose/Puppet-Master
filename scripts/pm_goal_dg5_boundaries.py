"""DG5 complete-call bridge to GH1's collector and mutation judge.

Opaque original handles cannot be copied or serialized. A fork inherits their
actual issuers, exactly as the original W12 corpus does. Each replay starts
from the same parent memory and complete durable bytes; it never reconstructs
an original from a transport value. Only the explicit GH1 CUT set can bypass
a predicate. Later refusals and exceptions keep GH1's no-credit classes.

This module supplies observation/dispatch plumbing, not another kill judge.
"""
from __future__ import annotations

import functools
import hashlib
import inspect
import os
from pathlib import Path
import pickle
import shutil
import sys
import tempfile
import traceback
from types import SimpleNamespace
import types
import weakref

import pm_goal_guard_tables as tables
import pm_goal_guard_sweep as sweep

ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'dg5/'
ACTIVE = [False]
PATCHED = {}
CASE = [None]
PARENT_CALL = [False]


def row(code):
    # Schema errors name the failing instance in their original error code;
    # the gated predicate is the same whole-root check on both controls and
    # negatives. The original refusal is retained separately by invoke().
    if '/numrule/' in code:
        where, reason = code.split('/numrule/', 1)
        if reason.startswith(('integer_', 'uint64_')):
            return PREFIX + where + '/number'
        if reason.startswith('date_time_'):
            return PREFIX + where + '/date-time'
    return PREFIX + code.split('/schema/', 1)[0] + ('/schema' if '/schema/' in code else '')


def file_state(root):
    return {str(p.relative_to(root)): p.read_bytes()
            for p in sorted(root.rglob('*')) if p.is_file()}


def restore_files(root, files):
    if root.exists():
        shutil.rmtree(root)
    root.mkdir(parents=True)
    for name, raw in files.items():
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(raw)


def context_value(value, world, seen=None):
    """Bind complete caller data without serializing an original capability.

    Handle identities refer only to the actual inherited object in this
    process. Nothing can restore a handle from this observational descriptor.
    Immutable schema banks are bound by their complete source pins.
    """
    seen = {} if seen is None else seen
    if value is None or type(value) in (bool, int, float, str, bytes):
        return (type(value).__name__, value)
    if isinstance(value, Path):
        return ('path', str(value))
    if value is world:
        return ('original_world', id(world))
    ident = id(value)
    if ident in seen:
        return ('reference', seen[ident])
    seen[ident] = len(seen)
    if isinstance(value, (dict, weakref.WeakKeyDictionary)):
        return ('map', tuple((context_value(k, world, seen), context_value(v, world, seen))
                             for k, v in value.items()))
    if isinstance(value, (tuple, list, set, frozenset)):
        return (type(value).__name__, tuple(context_value(v, world, seen) for v in value))
    if inspect.isfunction(value):
        path = Path(value.__code__.co_filename)
        return ('function', str(path), value.__code__.co_firstlineno,
                hashlib.sha256(path.read_bytes()).hexdigest(),
                context_value(value.__defaults__, world, seen),
                context_value(value.__kwdefaults__, world, seen),
                tuple(context_value(cell.cell_contents, world, seen) for cell in value.__closure__ or ()))
    if isinstance(value, types.ModuleType):
        path = Path(value.__file__) if getattr(value, '__file__', None) else None
        return ('module', value.__name__, hashlib.sha256(path.read_bytes()).hexdigest() if path else None)
    if type(value).__name__ in ('OriginalHandle', '_Handle', 'Fence'):
        return ('original_capability_identity', type(value).__module__, type(value).__qualname__, ident,
                getattr(value, 'kind', None))
    if type(value).__module__.startswith(('jsonschema', 'referencing', 'rpds')):
        return ('immutable_schema_context', type(value).__module__, type(value).__qualname__, ident)
    if hasattr(value, 'pins') and hasattr(value, 'registry'):
        return ('whole_pinned_bank', type(value).__module__, type(value).__qualname__,
                context_value(value.pins, world, seen))
    if hasattr(value, '__dict__'):
        return ('object', type(value).__module__, type(value).__qualname__, ident,
                context_value(vars(value), world, seen))
    raise TypeError('unbound complete-call context type: ' + type(value).__qualname__)


def guard_wrapper(original):
    @functools.wraps(original)
    def guarded(code, condition):
        if not ACTIVE[0]:
            return original(code, condition)
        frame = inspect.currentframe().f_back
        site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
        refused = tables.decide(row(code), condition, site=site)
        return original(code, refused is None)
    return guarded


def refuse_wrapper(original):
    @functools.wraps(original)
    def refused(code):
        if not ACTIVE[0]:
            return original(code)
        frame = inspect.currentframe().f_back
        site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
        if tables.decide(row(code), False, site=site) is not None:
            return original(code)
    return refused


def install():
    """Route the original require/guard sites without changing their inputs.

    All imported aliases of the same guard share its original exception type.
    NUMRULE, the frozen validator and the gated tool are never patched.
    """
    originals = {}
    for module in tuple(sys.modules.values()):
        name = getattr(module, '__name__', '')
        if not name.startswith(('pm_goal_dg_', 'pm_goal_test_')) or name == 'pm_goal_test_numrule':
            continue
        for key in ('require', 'guard', 'refuse'):
            fn = getattr(module, key, None)
            if not inspect.isfunction(fn) or fn in PATCHED.values():
                continue
            if fn.__name__ not in ('require', 'guard', 'refuse'):
                continue
            originals[fn] = PATCHED.setdefault(fn, refuse_wrapper(fn) if key == 'refuse' else guard_wrapper(fn))
    for module in tuple(sys.modules.values()):
        name = getattr(module, '__name__', '')
        if not name.startswith('pm_goal') or name == 'pm_goal_test_numrule':
            continue
        for key, value in list(vars(module).items()):
            if inspect.isfunction(value) and value in originals:
                setattr(module, key, originals[value])


def invoke(label, family, action, work, *, world=None, arguments=None, original=None, valid=True, expected=None,
           declared_target=None):
    """One actual complete action, including its immutable issuer context.

    The supplied value binds all durable bytes and owner observations. Replays
    may cut predicates but cannot alter that sealed original or copy handles.
    Defects are declared by the original authored case before this call.
    """
    install()
    work = Path(work)
    files = file_state(work)
    owners = world.recorder.snapshot() if world is not None else {}
    original = original or action
    source = Path(original.__code__.co_filename)
    if arguments is None:
        raise ValueError('complete-call arguments were not bound')
    # Store bytes alone do not bind a caller's substituted request or callback.
    # Include every actual argument and all nondurable owner/world context.
    context = context_value(arguments, world)
    world_context = context_value(vars(world), world) if world is not None else None
    value = dict(store=files, owners=owners, family=family, label=label,
                 arguments=context, world_context=world_context,
                 action=dict(path=str(source), line=original.__code__.co_firstlineno,
                             source_sha256=hashlib.sha256(source.read_bytes()).hexdigest()))
    sealed = sweep.digest(value)
    actual = []

    def evaluate(presented):
        if sweep.digest(presented) != sealed:
            raise ValueError('changed sealed complete-call input')
        if file_state(work) != files:
            raise ValueError('complete-call backing store drift')
        fd, output = tempfile.mkstemp(prefix='fork-', suffix='.pkl', dir=work.parent)
        os.close(fd)
        parent_collector = tables.COLLECTOR
        pid = os.fork()
        if pid == 0:
            entries = []
            tables.COLLECTOR = SimpleNamespace(observe=lambda n, h, s: entries.append((n, h, s)),
                replaying=parent_collector.replaying, replay_unknown_rows=set())
            ACTIVE[0] = True
            try:
                try:
                    action()
                    result = dict(errors=[], original_refusal=None)
                except Exception as error:
                    # Only owner refusal classes qualify. AssertionError,
                    # import/setup errors and arbitrary exceptions never do.
                    if type(error).__name__ not in ('Refusal', 'DGRefusal', 'LaneRefusal',
                            'AdapterRefusal', 'StorageRefusal', 'NumruleRefusal',
                            'SourceRefusal', 'Unavailable', 'Refused'):
                        raise
                    code = getattr(error, 'code', None) or getattr(error, 'reason', None) or str(error)
                    result = dict(errors=[row(code)], original_refusal=code)
                result.update(observations=entries, after=file_state(work),
                              replay_unknown_rows=sorted(tables.COLLECTOR.replay_unknown_rows))
            except BaseException as error:
                result = dict(exception=type(error).__name__, detail=str(error),
                              trace=traceback.format_exc(), observations=entries)
            Path(output).write_bytes(pickle.dumps(result, protocol=5))
            os._exit(0)
        try:
            _, status = os.waitpid(pid, 0)
            if os.waitstatus_to_exitcode(status) != 0 or not Path(output).stat().st_size:
                raise RuntimeError('complete-call child did not return a result')
            result = pickle.loads(Path(output).read_bytes())
        finally:
            Path(output).unlink(missing_ok=True)
            restore_files(work, files)
        for name, holds, site in result['observations']:
            parent_collector.observe(name, holds, site)
        parent_collector.replay_unknown_rows.update(result.get('replay_unknown_rows', []))
        if 'exception' in result:
            raise RuntimeError(result['exception'] + ': ' + result['detail'])
        actual.append(result['original_refusal'])
        return dict(errors=result['errors'], store_snapshot_sha256=sweep.digest(files),
                    store_after_sha256=sweep.digest(result['after']))

    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('run through pm_goal_dg5_sweep')
    outcome = collector.invoke(label, evaluate, value, valid,
                               target=declared_target if declared_target is not None else
                               None if expected is None else row(expected), family=family)
    return dict(outcome=outcome, original_refusal=actual[0] if actual else None)


def helper(original, suffix):
    """One exact shared-call boundary; the shared implementation is unchanged."""
    @functools.wraps(original)
    def checked(value, where, *args, **kwargs):
        if not ACTIVE[0]:
            return original(value, where, *args, **kwargs)
        error = None
        try:
            result = original(value, where, *args, **kwargs)
        except Exception as caught:
            if type(caught).__name__ != 'NumruleRefusal':
                raise
            error, result = caught, value
        frame = inspect.currentframe().f_back
        site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
        if tables.decide(PREFIX + where + '/' + suffix, error is None, site=site) is not None:
            raise error
        return result
    return checked


def install_u_entries(module):
    """Collect the original independently callable entries, then advance the
    parent by its original call. Nested entries inside a captured entry stay
    inside that complete checker; no nested synthetic check is substituted.
    """
    import pm_goal_test_owner_adapters as adapters
    if not getattr(adapters.RootBank.validate, '_dg5_schema', False):
        original_validate = adapters.RootBank.validate

        @functools.wraps(original_validate)
        def validate(self, root, value, code='root'):
            if not ACTIVE[0]:
                return original_validate(self, root, value, code)
            errors = self.errors(root, value)
            frame = inspect.currentframe().f_back
            site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
            if tables.decide(PREFIX + code + '/schema', not errors, site=site) is not None:
                return original_validate(self, root, value, code)
            return value
        validate._dg5_schema = True
        adapters.RootBank.validate = validate

    for name, suffix in (('exact_int', 'number'), ('storage_time', 'date-time')):
        original = getattr(module, name)
        setattr(module, name, helper(original, suffix))
    entries = {
        'SirOwner': ('admit', 'terminalize', 'replay'),
        'ApprovalOwner': ('capture', 'decide', 'read_resolution'),
        'GoalBodyOwner': ('reserve', 'commit', 'release', 'metadata_update',
                          'read_body', 'read_history', 'read_receipt'),
        'UpdateSourceOwner': ('capture', 'read_audit', 'read_input_content'),
        'UpdateProducer': ('freeze', 'publish'),
        'EventInspector': ('inspect',),
    }
    for class_name, methods in entries.items():
        cls = getattr(module, class_name)
        for method in methods:
            original = getattr(cls, method)

            def bind(original=original, entry=class_name + '.' + method):
                @functools.wraps(original)
                def call(self, *args, **kwargs):
                    if ACTIVE[0] or PARENT_CALL[0] or CASE[0] is None:
                        return original(self, *args, **kwargs)
                    case = CASE[0]
                    world = self.world
                    expected = case.get('expected')
                    from pm_goal_dg5_declarations import target
                    invoke(case['id'] + '/' + entry, 'goal.updated',
                           lambda: original(self, *args, **kwargs), world.root,
                           world=world, arguments=dict(receiver=self, args=args, kwargs=kwargs),
                           original=original, valid=True if expected is None else None,
                           expected=expected, declared_target=target(case, None if expected is None else row(expected)))
                    PARENT_CALL[0] = True
                    try:
                        return original(self, *args, **kwargs)
                    finally:
                        PARENT_CALL[0] = False
                return call
            setattr(cls, method, bind())
