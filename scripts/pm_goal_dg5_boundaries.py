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
REFUSAL_CLASSES = ('Refusal', 'DGRefusal', 'LaneRefusal', 'AdapterRefusal', 'StorageRefusal', 'NumruleRefusal',
                   'SourceRefusal', 'Unavailable', 'Refused')
# Load-once singletons (a class whose `_instance` is the object) are bound by
# the digest of their complete descriptor, computed once; verify_frozen()
# recomputes every one without the memo at the end of the run.
FROZEN = {}
MEMBERS = {}   # id of an object reachable from a memoized singleton -> that singleton's digest
FAILURES = []


NUMRULE_ROUTES = {'integer': 'number', 'uint64': 'number', 'boolean': 'boolean',
                  'storage_time': 'date-time', 'event_time': 'date-time'}
_NR_PROXIES = {}


def numrule_proxy(real):
    """A call-site view of the NUMRULE module for the DG family modules.

    Every attribute is the real NUMRULE object, except the shared number,
    boolean and date-time calls, each wrapped as one whole-call row
    (`<where>/number`, `/boolean`, `/date-time`). The NUMRULE module and its
    functions are never modified; modules keep their own `NR` name.
    """
    if id(real) in _NR_PROXIES:
        return _NR_PROXIES[id(real)]
    class CallSites(types.ModuleType):
        def __getattr__(self, name):  # every other attribute is read live from NUMRULE
            return getattr(real, name)
    proxy = CallSites(real.__name__ + '__dg5_call_sites')
    for name, suffix in NUMRULE_ROUTES.items():
        original = getattr(real, name)
        signature = inspect.signature(original)

        def bind(original=original, suffix=suffix, signature=signature):
            @functools.wraps(original)
            def checked(*args, **kwargs):
                if not ACTIVE[0]:
                    return original(*args, **kwargs)
                bound = signature.bind(*args, **kwargs)
                bound.apply_defaults()
                where = bound.arguments['where']
                error = None
                try:
                    result = original(*args, **kwargs)
                except Exception as caught:
                    if type(caught).__name__ != 'NumruleRefusal':
                        raise
                    error, result = caught, bound.arguments['value']
                frame = inspect.currentframe().f_back
                site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
                if tables.decide(PREFIX + where + '/' + suffix, error is None, site=site) is not None:
                    raise error
                return result
            checked._dg5_numrule = True
            return checked
        setattr(proxy, name, bind())
    proxy._dg5_real = real
    _NR_PROXIES[id(real)] = proxy
    return proxy


def install_numrule_call_sites():
    real = sys.modules.get('pm_goal_test_numrule')
    if real is None:
        return
    for module in tuple(sys.modules.values()):
        name = getattr(module, '__name__', '')
        # DG-U routes the same calls through its own exact_int/storage_time helpers.
        if not name.startswith(('pm_goal_dg_', 'pm_goal_own_')) or name.startswith('pm_goal_dg_u_'):
            continue
        for key, value in list(vars(module).items()):
            if value is real:
                setattr(module, key, numrule_proxy(real))


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
        if reason.startswith('boolean_'):
            return PREFIX + where + '/boolean'
    return PREFIX + code.split('/schema/', 1)[0] + ('/schema' if '/schema/' in code else '')


DIRECTORY = None  # marker value for a directory entry (empty directories are store state too)


def file_state(root):
    """Every file's bytes and every directory (including empty ones) under the store root."""
    state = {}
    for p in sorted(root.rglob('*')):
        if p.is_dir():
            state[str(p.relative_to(root)) + '/'] = DIRECTORY
        elif p.is_file():
            state[str(p.relative_to(root))] = p.read_bytes()
    return state


def manifest(files):
    """Complete store binding: every directory, and every durable file's path and SHA-256."""
    return tuple((name, None, None) if raw is DIRECTORY else (name, hashlib.sha256(raw).hexdigest(), len(raw))
                 for name, raw in sorted(files.items()))


def descriptor_sha256(value, world):
    """Digest of the complete descriptor of `value` (see `context_value`), streamed by a pickler.

    Plain data (exact dict/list/tuple/str/int/...) is serialized at C speed; every
    other object goes through `_DescriptorPickler.reducer_override`, which applies
    exactly the rules of `context_value` (world, handles, schema-library objects,
    callables, classes, modules, load-once singletons, per-case schema banks) and
    otherwise serializes the object's type and complete attribute state.
    """
    import io
    sink = io.BytesIO()
    _deep(lambda: _DescriptorPickler(sink, world).dump(value))
    return hashlib.sha256(sink.getvalue()).hexdigest()


def _deep(work):
    """Run `work` on a thread with a 512 MiB stack: owner graphs nest deeper than the
    main thread's 8 MiB C stack allows a pickler (it recurses in C). The thread is
    joined before returning, so no thread is alive at the bridge's fork."""
    import threading
    outcome = []

    def run():
        try:
            outcome.append((True, work()))
        except BaseException as error:  # noqa: BLE001 - re-raised in the caller
            outcome.append((False, error))
    previous = threading.stack_size(512 * 1024 * 1024)
    try:
        thread = threading.Thread(target=run, name='dg5-descriptor')
        thread.start()
    finally:
        threading.stack_size(previous)
    thread.join()
    ok, value = outcome[0]
    if not ok:
        raise value
    return value


def _token(*parts):
    return ('dg5-descriptor',) + parts


def _rebuild(*_):  # never called: descriptors are digested, not loaded
    raise RuntimeError('descriptor streams are not loadable')


class _DescriptorPickler(pickle.Pickler):
    def __init__(self, sink, world):
        super().__init__(sink, protocol=5)
        self.world = world

    def reducer_override(self, value):  # noqa: C901 - one rule per descriptor kind, as in context_value
        if value is _rebuild:
            return NotImplemented  # the stream's own reconstructor, saved by reference
        world = self.world
        ident = id(value)
        if value is world and world is not None:
            return (_rebuild, _token('original_world', ident))
        if isinstance(value, Path):
            return (_rebuild, _token('path', str(value)))
        if ident in MEMBERS:
            return (_rebuild, _token('load_once_member', type(value).__module__, type(value).__qualname__, MEMBERS[ident]))
        module = type(value).__module__ or ''
        if inspect.isfunction(value):
            path = Path(value.__code__.co_filename)
            return (_rebuild, _token('function', str(path), value.__code__.co_firstlineno,
                                     _file_sha(path)), dict(defaults=value.__defaults__, kwdefaults=value.__kwdefaults__,
                                                            closure=tuple(c.cell_contents for c in value.__closure__ or ())))
        if inspect.isclass(value):
            owner = sys.modules.get(value.__module__)
            path = Path(owner.__file__) if getattr(owner, '__file__', None) else None
            return (_rebuild, _token('class', value.__module__, value.__qualname__, _file_sha(path) if path else None))
        if inspect.ismethod(value):
            return (_rebuild, _token('bound_method'), dict(function=value.__func__, receiver=value.__self__))
        if inspect.isbuiltin(value) or type(value).__name__ in ('method-wrapper', 'wrapper_descriptor',
                                                                 'method_descriptor', 'builtin_function_or_method'):
            return (_rebuild, _token('builtin', getattr(value, '__module__', None),
                                     getattr(value, '__qualname__', repr(value))))
        if isinstance(value, functools.partial):
            return (_rebuild, _token('partial'), dict(function=value.func, args=value.args, keywords=value.keywords))
        if isinstance(value, types.ModuleType):
            path = Path(value.__file__) if getattr(value, '__file__', None) else None
            return (_rebuild, _token('module', value.__name__, _file_sha(path) if path else None))
        if type(value).__name__ in ('OriginalHandle', '_Handle', 'Fence'):
            return (_rebuild, _token('original_capability_identity', module, type(value).__qualname__, ident,
                                     getattr(value, 'kind', None)))
        if module.startswith(('jsonschema', 'referencing', 'rpds')):
            return (_rebuild, _token('immutable_schema_context', module, type(value).__qualname__, ident))
        if isinstance(value, weakref.ref):
            return (_rebuild, _token('weak_reference', id(value())))
        if isinstance(value, weakref.WeakKeyDictionary):
            return (_rebuild, _token('weak_map'), dict(items=[(id(k), v) for k, v in list(value.items())]))
        if hasattr(value, 'pins') and hasattr(value, 'registry'):
            return (_rebuild, _token('whole_pinned_bank', module, type(value).__qualname__), dict(pins=value.pins))
        if any(attribute is value for klass in type(value).__mro__ for attribute in vars(klass).values()):
            if ident not in FROZEN:
                inner = {}
                sha = hashlib.sha256(pickle.dumps(context_value(value, None, inner, False), protocol=5)).hexdigest()
                FROZEN[ident] = (value, sha)
                FROZEN_PARTS[ident] = _parts(value)
                for member in inner:
                    MEMBERS.setdefault(member, sha)
            return (_rebuild, _token('load_once_singleton', module, type(value).__qualname__, FROZEN[ident][1]))
        if ident in CASE_BANKS:
            return (_rebuild, _token('case_bank', module, type(value).__qualname__, CASE_BANKS[ident][1]))
        if CASE_BANK_STATE[0] is not None and _is_bank(value):
            sha = _bank_sha(value)
            CASE_BANKS[ident] = (value, sha, (CASE_BANK_STATE[0] or {}).get('id'))
            return (_rebuild, _token('case_bank', module, type(value).__qualname__, sha))
        if isinstance(value, dict):  # a dict subclass (exact dicts never reach here)
            if value and all(type(v).__module__.startswith('jsonschema') and hasattr(v, 'iter_errors') for v in value.values()):
                return (_rebuild, _token('map', ()))
            return (_rebuild, _token('mapping', module, type(value).__qualname__), dict(items=list(value.items())))
        if isinstance(value, (list, tuple, set, frozenset)):
            return (_rebuild, _token('sequence', module, type(value).__qualname__), dict(items=list(value)))
        if isinstance(value, types.MappingProxyType):
            return (_rebuild, _token('mapping_proxy'), dict(items=list(value.items())))
        if hasattr(value, '__dict__'):
            return (_rebuild, _token('object', module, type(value).__qualname__, ident), dict(vars(value)))
        slots = [name for klass in type(value).__mro__ for name in getattr(klass, '__slots__', ())
                 if name not in ('__weakref__', '__dict__')]
        if slots:
            return (_rebuild, _token('slotted', module, type(value).__qualname__, ident),
                    dict(slots=[(name, getattr(value, name, None)) for name in slots]))
        if isinstance(value, (bool, int, float, str, bytes, bytearray, complex, type(None))):
            return NotImplemented
        raise TypeError('unbound complete-call context type: ' + type(value).__qualname__)


_FILE_SHA = {}


def _file_sha(path):
    if path is None or not path.is_file():
        return None
    key = str(path)
    if key not in _FILE_SHA:
        _FILE_SHA[key] = hashlib.sha256(path.read_bytes()).hexdigest()
    return _FILE_SHA[key]


def _bank_sha(value):
    import io
    sink = io.BytesIO()
    saved = CASE_BANK_STATE[0]
    CASE_BANK_STATE[0] = None  # the bank itself is serialized in full, not as its own token
    try:
        _deep(lambda: _DescriptorPickler(sink, None).dump(dict(vars(value))))
    finally:
        CASE_BANK_STATE[0] = saved
    return hashlib.sha256(sink.getvalue()).hexdigest()


FROZEN_PARTS = {}
# Schema-bank objects (holding a referencing Registry) built per world: bound by
# their complete descriptor once per authored case (strong reference held, so
# no identity reuse), then recomputed in full when the case ends.
CASE_BANKS = {}
CASE_BANK_STATE = [None]


def _is_bank(value):
    try:
        attributes = vars(value)
    except TypeError:
        return False
    for item in attributes.values():
        if type(item).__module__ == 'referencing._core' and type(item).__name__ == 'Registry':
            return True
        if isinstance(item, dict) and any(type(x).__module__ == 'referencing._core' and type(x).__name__ == 'Registry'
                                          for x in list(item.values())[:4]):
            return True
    return False


def settle_case_banks(next_case):
    """Verify every bank memoized for the finishing case, then start the next case's memo."""
    if CASE_BANK_STATE[0] is next_case:
        return
    for ident, (obj, sha, label) in list(CASE_BANKS.items()):
        again = _bank_sha(obj)
        if again != sha:
            FAILURES.append(dict(kind='schema_bank_changed_within_case', case=label, type=type(obj).__qualname__,
                                 before=sha, after=again))
    CASE_BANKS.clear()
    CASE_BANK_STATE[0] = next_case


def _parts(obj):
    attributes = vars(obj) if hasattr(obj, '__dict__') else {}
    return {name: hashlib.sha256(pickle.dumps(context_value(item, None, {}, False), protocol=5)).hexdigest()
            for name, item in attributes.items()}


def verify_frozen():
    """Recompute every memoized singleton descriptor in full (no memo)."""
    drift = []
    for ident, (obj, sha) in list(FROZEN.items()):
        saved = FROZEN.pop(ident)
        try:
            again = hashlib.sha256(pickle.dumps(context_value(obj, None, frozen=False), protocol=5)).hexdigest()
        finally:
            FROZEN[ident] = saved
        if again != sha:
            now, then = _parts(obj), FROZEN_PARTS.get(ident, {})
            drift.append(dict(type=type(obj).__qualname__, module=type(obj).__module__, before=sha, after=again,
                              attributes=sorted(k for k in set(now) | set(then) if now.get(k) != then.get(k))))
    return dict(singletons=len(FROZEN), drift=drift)


def restore_files(root, files):
    if root.exists():
        shutil.rmtree(root)
    root.mkdir(parents=True)
    for name, raw in sorted(files.items()):
        path = root / name
        if raw is DIRECTORY:
            path.mkdir(parents=True, exist_ok=True)
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(raw)


def context_value(value, world, seen=None, frozen=True):
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
    if frozen and ident in MEMBERS:
        return ('load_once_member', type(value).__module__, type(value).__qualname__, MEMBERS[ident])
    if isinstance(value, dict) and value and all(type(v).__module__.startswith('jsonschema') and hasattr(v, 'iter_errors')
                                                 for v in value.values()):
        # A validator memo: each value is a pure function of its key and the
        # pinned registry (bound separately); growth of the memo is not state,
        # so a memo is described exactly as an empty map.
        return ('map', ())
    if isinstance(value, (dict, weakref.WeakKeyDictionary, types.MappingProxyType)):
        return ('map', tuple((context_value(k, world, seen, frozen), context_value(v, world, seen, frozen))
                             for k, v in value.items()))
    if isinstance(value, (tuple, list, set, frozenset)):
        return (type(value).__name__, tuple(context_value(v, world, seen, frozen) for v in value))
    if inspect.isfunction(value):
        path = Path(value.__code__.co_filename)
        return ('function', str(path), value.__code__.co_firstlineno,
                hashlib.sha256(path.read_bytes()).hexdigest(),
                context_value(value.__defaults__, world, seen, frozen),
                context_value(value.__kwdefaults__, world, seen, frozen),
                tuple(context_value(cell.cell_contents, world, seen, frozen) for cell in value.__closure__ or ()))
    if inspect.isclass(value):
        module = sys.modules.get(value.__module__)
        path = Path(module.__file__) if getattr(module, '__file__', None) else None
        return ('class', value.__module__, value.__qualname__,
                hashlib.sha256(path.read_bytes()).hexdigest() if path and path.is_file() else None)
    if inspect.ismethod(value):
        return ('bound_method', context_value(value.__func__, world, seen, frozen),
                context_value(value.__self__, world, seen, frozen))
    if inspect.isbuiltin(value) or type(value).__name__ in ('method-wrapper', 'wrapper_descriptor',
                                                             'method_descriptor', 'builtin_function_or_method'):
        return ('builtin', getattr(value, '__module__', None), getattr(value, '__qualname__', repr(value)))
    if isinstance(value, functools.partial):
        return ('partial', context_value(value.func, world, seen, frozen), context_value(value.args, world, seen, frozen),
                context_value(value.keywords, world, seen, frozen))
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
                context_value(value.pins, world, seen, frozen))
    if frozen and any(attribute is value for klass in type(value).__mro__ for attribute in vars(klass).values()):
        if ident not in FROZEN:
            inner = {}
            sha = hashlib.sha256(pickle.dumps(context_value(value, None, inner, False), protocol=5)).hexdigest()
            FROZEN[ident] = (value, sha)
            FROZEN_PARTS[ident] = _parts(value)
            for member in inner:
                MEMBERS.setdefault(member, sha)
        return ('load_once_singleton', type(value).__module__, type(value).__qualname__, FROZEN[ident][1])
    if frozen and ident in CASE_BANKS:
        return ('case_bank', type(value).__module__, type(value).__qualname__, CASE_BANKS[ident][1])
    if frozen and CASE_BANK_STATE[0] is not None and _is_bank(value):
        sha = hashlib.sha256(pickle.dumps(context_value(value, None, {}, False), protocol=5)).hexdigest()
        CASE_BANKS[ident] = (value, sha, (CASE_BANK_STATE[0] or {}).get('id'))
        return ('case_bank', type(value).__module__, type(value).__qualname__, sha)
    if hasattr(value, '__dict__'):
        return ('object', type(value).__module__, type(value).__qualname__, ident,
                context_value(vars(value), world, seen, frozen))
    slots = [name for klass in type(value).__mro__ for name in getattr(klass, '__slots__', ())
             if name not in ('__weakref__', '__dict__')]
    if slots:
        return ('slotted', type(value).__module__, type(value).__qualname__, ident,
                tuple((name, context_value(getattr(value, name, None), world, seen, frozen)) for name in slots))
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


# Whole-root schema rows: (module, class, row name from the call's arguments).
# Each name equals row() of the code that bank's own validate raises.
SCHEMA_BANKS = (
    ('pm_goal_test_owner_adapters', 'RootBank', 1, lambda a, k: (a[2] if len(a) > 2 else k.get('code', 'root'))),
    ('pm_goal_dg_s_world', 'Bank', 1, lambda a, k: (a[2] if len(a) > 2 else k.get('code', 'root'))),
    ('pm_goal_own_c_roots', 'OriginalBank', 1, lambda a, k: 'roots'),
    ('pm_goal_dg_r_world', 'Roots', 2, lambda a, k: a[3] if len(a) > 3 else k['code']),
    ('pm_goal_dg_cf2_world', 'RealmBank', 2, lambda a, k: a[3] if len(a) > 3 else k['code']),
)


def install_schema_rows():
    """Observe each whole-root owner schema check as one row; the validator and its
    keywords are unchanged (the bank's own errors() decides, the row only routes it)."""
    for module_name, class_name, value_index, code_of in SCHEMA_BANKS:
        module = sys.modules.get(module_name)
        cls = getattr(module, class_name, None) if module else None
        if cls is None or getattr(cls.validate, '_dg5_schema', False):
            continue

        def bind(original=cls.validate, code_of=code_of, value_index=value_index):
            @functools.wraps(original)
            def validate(self, *args, **kwargs):
                if not ACTIVE[0]:
                    return original(self, *args, **kwargs)
                errors = self.errors(*args[:value_index + 1])
                frame = inspect.currentframe().f_back
                site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
                if tables.decide(PREFIX + code_of(args, kwargs) + '/schema', not errors, site=site) is not None:
                    return original(self, *args, **kwargs)
                return args[value_index]
            validate._dg5_schema = True
            return validate
        cls.validate = bind()


def install():
    """Route the original require/guard sites without changing their inputs.

    All imported aliases of the same guard share its original exception type.
    NUMRULE, the frozen validator and the gated tool are never patched.
    """
    install_schema_rows()
    install_numrule_call_sites()
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


def invoke(label, family, action, work, *, world=None, arguments=None, original=None, valid=True, target=None,
           pending=False):
    """One actual complete action, including its immutable issuer context.

    The supplied value binds all durable bytes (per-file SHA-256 manifest),
    owner observations, every caller argument and the nondurable world
    context (descriptor digests). Replays may cut predicates but cannot alter
    that sealed original or copy handles. With `pending`, the call is
    registered without a target; `declare()` attaches the case's authored
    target only if the case's own call then refuses (see `entry_call`).
    """
    install()
    work = Path(work)
    files = file_state(work)
    owners = world.recorder.snapshot() if world is not None else {}
    original = original or action
    source = Path(original.__code__.co_filename)
    if arguments is None:
        raise ValueError('complete-call arguments were not bound')
    value = dict(store=manifest(files), owners=owners, family=family, label=label,
                 arguments_sha256=descriptor_sha256(arguments, world),
                 world_context_sha256=descriptor_sha256(vars(world), world) if world is not None else None,
                 action=dict(path=str(source), line=original.__code__.co_firstlineno,
                             source_sha256=hashlib.sha256(source.read_bytes()).hexdigest()))
    sealed = sweep.digest(value)
    store_sha = sweep.digest(value['store'])
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
                except BaseException as error:  # Storage's injected Crash is a BaseException
                    # Only owner refusal classes qualify. AssertionError,
                    # import/setup errors and arbitrary exceptions never do.
                    # A case's injected crash point is an interrupted call:
                    # recorded under its own non-row name, never a refusal.
                    if type(error).__name__ == 'Crash':
                        point = getattr(error, 'point', None) or str(error)
                        result = dict(errors=['dg5/injected_crash/' + point], original_refusal='crash:' + point)
                    elif not isinstance(error, Exception) or type(error).__name__ not in REFUSAL_CLASSES:
                        raise
                    else:
                        code = refusal_code(error)
                        result = dict(errors=[row(code)], original_refusal=code)
                result.update(observations=entries, after=manifest(file_state(work)),
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
        return dict(errors=result['errors'], store_snapshot_sha256=store_sha,
                    store_after_sha256=sweep.digest(result['after']))

    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('run through pm_goal_dg5_sweep')
    if pending:
        result = collector.invoke(label, evaluate, value, None, target=None, family=family)
    else:
        result = collector.invoke(label, evaluate, value, valid, target=target, family=family)
    return result, (actual[0] if actual else None)


def refusal_code(error):
    return getattr(error, 'code', None) or getattr(error, 'reason', None) or str(error)


def entry_call(case, label, family, action, work, *, world, arguments, original, target):
    """One captured entry of an authored case, then the parent's own call.

    Every entry is registered undeclared first. The sealed child run then
    decides, before the parent advances the store: in a positive case an
    accepting entry is declared a control; in a negative case the entry that
    refuses is declared with the case's authored target (fixed before
    execution), and the kill judge replays it now, against the same store.
    Entries that do neither stay undeclared (no credit either way). The
    parent's own run must agree with the sealed child run.
    """
    expected = case.get('expected')
    collector = tables.COLLECTOR
    settle_case_banks(case)
    result, child = invoke(label, family, action, work, world=world, arguments=arguments,
                           original=original, pending=True)
    if child is None and expected is None:
        collector.declare(result, True, None)
    elif child is not None and not child.startswith('crash:') and expected is not None:
        collector.declare(result, None, target)
    PARENT_CALL[0] = True
    try:
        try:
            returned = action()
        except BaseException as error:  # Storage's injected Crash is a BaseException
            if type(error).__name__ == 'Crash':
                code = 'crash:' + (getattr(error, 'point', None) or str(error))
            elif isinstance(error, Exception) and type(error).__name__ in REFUSAL_CLASSES:
                code = refusal_code(error)
            else:
                raise
            if code != child:
                FAILURES.append(dict(kind='child_parent_disagree', label=label, child=child, parent=code))
            raise
        if child is not None:
            FAILURES.append(dict(kind='child_parent_disagree', label=label, child=child, parent=None))
        return returned
    finally:
        PARENT_CALL[0] = False


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
                    return entry_call(case, case['id'] + '/' + entry, 'goal.updated',
                                      lambda: original(self, *args, **kwargs), world.root, world=world,
                                      arguments=dict(receiver=self, args=args, kwargs=kwargs), original=original,
                                      target=target(case, None if expected is None else row(expected)))
                return call
            setattr(cls, method, bind())
