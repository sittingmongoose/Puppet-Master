"""DG5 complete-call bridge to GH1's collector and mutation judge.

Opaque original handles cannot be copied or serialized. A fork inherits their
actual issuers, exactly as the original W12 corpus does. Each replay starts
from the same parent memory and complete durable bytes; it never reconstructs
an original from a transport value. Only the explicit GH1 CUT set can bypass
a predicate. Later refusals and exceptions keep GH1's no-credit classes.

This module supplies observation/dispatch plumbing, not another kill judge.
"""
from __future__ import annotations

import copy
import functools
import hashlib
import inspect
import os
from pathlib import Path
import pickle
import re
import shutil
import sys
import tempfile
import time
import traceback
from types import SimpleNamespace
import types
import weakref

import pm_goal_dg5_judge_replay as judge_replay
import pm_goal_guard_tables as tables
import pm_goal_guard_sweep as sweep

ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'dg5/'
ACTIVE = [False]
PATCHED = {}
CASE = [None]
PARENT_CALL = [False]
# Round 2 C5 (lead ruling 1124101552-8f55): True only during the parent run of a direct-call recording
# (entry_call(direct=True) from pm_goal_dg5_direct_calls). A registered entry nested in that run records as
# an entry exactly as it does with the collector off; nested in a registered entry's own parent run it stays
# nested, as before. Without this, wrapping composite listed methods (GoalUpdateCommand.run,
# NoAssociationCancel.dispatch) swallows their nested entries (SirOwner.admit, UpdateSourceOwner.capture,
# SIROwner.accept) and the number/date-time corpus slots they carry silently vanish.
DIRECT_PARENT = [False]
REFUSAL_CLASSES = ('Refusal', 'DGRefusal', 'LaneRefusal', 'AdapterRefusal', 'StorageRefusal', 'NumruleRefusal',
                   'SourceRefusal', 'Unavailable', 'Refused', 'FrameError', 'Halt')
# Load-once singletons (a class whose `_instance` is the object) are bound by
# the digest of their complete descriptor, computed once; verify_frozen()
# recomputes every one without the memo at the end of the run.
FROZEN = {}
MEMBERS = {}   # id of an object reachable from a memoized singleton -> that singleton's digest
FAILURES = []
_CONTEXT_SENTINELS = {}


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
        if not name.startswith(('pm_goal_dg_', 'pm_goal_own_')):
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
        if type(value) is object and value in _CONTEXT_SENTINELS:
            return (_rebuild, _token(*_CONTEXT_SENTINELS[value]))
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


def bind_context_sentinel(module, name):
    """Name an identity-only test sentinel from an authored source file."""
    value = vars(module)[name]
    if type(value) is not object:
        raise TypeError(f'{module.__name__}.{name} is not an identity-only sentinel')
    digest = hashlib.sha256(Path(module.__file__).read_bytes()).hexdigest()
    _CONTEXT_SENTINELS[value] = ('source_sentinel', module.__name__, name, digest)


def context_value(value, world, seen=None, frozen=True):
    """Bind complete caller data without serializing an original capability.

    Handle identities refer only to the actual inherited object in this
    process. Nothing can restore a handle from this observational descriptor.
    Immutable schema banks are bound by their complete source pins.
    """
    seen = {} if seen is None else seen
    if value is None or type(value) in (bool, int, float, str, bytes):
        return (type(value).__name__, value)
    if type(value) is object and value in _CONTEXT_SENTINELS:
        return _CONTEXT_SENTINELS[value]
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


# ---------------------------------------------------------------- site rows (lead option A)

ROUTING = [False]
LAST_REFUSAL = [None]   # (row name, code) of the routed predicate that just refused in this child
SITE_MODULE_PREFIXES = ('pm_goal_dg_', 'pm_goal_own_', 'pm_goal_test_')
_SITE_INDEX = {}


def site_name(path, line):
    return PREFIX + 'site/' + Path(path).name + ':' + str(line)


def _template(node, source):
    """Regex for a code expression: string literals exact, every computed part '.+'."""
    import ast
    import re
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return re.escape(node.value), len(node.value)
    if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
        left, a = _template(node.left, source)
        right, b = _template(node.right, source)
        return left + right, a + b
    if isinstance(node, ast.JoinedStr):
        parts, size = [], 0
        for value in node.values:
            if isinstance(value, ast.Constant):
                parts.append(re.escape(str(value.value)))
                size += len(str(value.value))
            else:
                parts.append('.+')
        return ''.join(parts), size
    return '.+', 0


def _shared_template(node, source):
    """Regex for a SHARED-ROUTE call: the code inside its exception constructor.

    shared_require(shared_refuse)(FrameError(klass, code), ...) names klass + ':' + code
    (FrameError's own string); every other routed exception names its first argument.
    A non-constructor exception expression names no static code (wildcard)."""
    import ast
    import re
    exc = node.args[0]
    if not isinstance(exc, ast.Call) or not exc.args:
        return '.+', 0
    fname = exc.func.id if isinstance(exc.func, ast.Name) else \
        exc.func.attr if isinstance(exc.func, ast.Attribute) else None
    if fname == 'FrameError' and len(exc.args) >= 2:
        klass, a = _template(exc.args[0], source)
        code, b = _template(exc.args[1], source)
        return klass + re.escape(':') + code, a + 1 + b
    return _template(exc.args[0], source)


def site_index():
    """Every require/guard/refuse site of the DG, DG-OWN and adapter modules (static, by AST)."""
    import ast
    import re
    if _SITE_INDEX:
        return _SITE_INDEX
    for path in sorted((ROOT / 'scripts').glob('pm_goal_*.py')):
        if not path.name.startswith(SITE_MODULE_PREFIXES) or path.name == 'pm_goal_test_numrule.py':
            continue
        source = path.read_text()
        try:
            tree = ast.parse(source)
        except SyntaxError:
            continue
        definitions = {n.lineno for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)
                       and n.name in ('require', 'guard', 'refuse', 'halt', 'shared_require', 'shared_refuse')}
        halt_module = any(isinstance(n, ast.FunctionDef) and n.name == 'halt' and
                          [a.arg for a in n.args.args] == ['code', 'condition'] for n in tree.body)
        for node in ast.walk(tree):
            if not isinstance(node, ast.Call) or not node.args:
                continue
            func = node.func
            name = func.id if isinstance(func, ast.Name) else func.attr if isinstance(func, ast.Attribute) else None
            if name not in ('require', 'guard', 'refuse', 'halt', 'shared_require', 'shared_refuse') \
                    or node.lineno in definitions:
                continue
            if name == 'halt' and not halt_module:
                continue
            pattern, literal = _shared_template(node, source) if name.startswith('shared_') \
                else _template(node.args[0], source)
            relative = str(path.relative_to(ROOT))
            _SITE_INDEX[site_name(relative, node.lineno)] = dict(
                path=relative, line=node.lineno, module=path.stem,
                expression=ast.get_source_segment(source, node.args[0]),
                regex=re.compile(pattern + r'\Z', re.S), literal=literal)
    return _SITE_INDEX


class Alternatives(tuple):
    """Equally specific static templates for one authored code: the code identifies one of these
    sites, not all of them (not a duplicate set). The target becomes the listed site that raised the
    authored code in the sealed run; a refusal at any other row keeps the whole tuple (no credit)."""


def target_rows(code):
    """The declared target of an authored expected code, fixed before the call: a schema or
    NUMRULE row by its boundary name; otherwise the site(s) whose static code template is the
    most specific match. Several equally specific sites form a declared duplicate set."""
    if code is None:
        return None
    if code.endswith('*'):
        # An authored wildcard under a whole-root schema code still names one row: that schema row.
        prefix = code[:-1]
        return row(prefix + 'any') if '/schema/' in prefix else None
    if ('/schema/' in code or '/numrule/' in code) and not code.startswith(('Corrupt:', 'Unsupported:')):
        # A FrameError code is a site template (klass:code), even when its dynamic
        # suffix happens to contain /schema/ (event_record:<schema error path>).
        return row(code)
    # Only code this checker process has loaded can raise the refusal. A refusal re-raised under a wrapper
    # prefix (DG-CF3: 'advance/halt/' + inner code) is matched through its suffixes too; the most specific
    # literal template over the code and all its suffixes wins.
    parts = code.split('/')
    suffixes = ['/'.join(parts[i:]) for i in range(len(parts))]
    matches = [(info['literal'], name) for name, info in site_index().items()
               if info['module'] in sys.modules and any(info['regex'].match(c) for c in suffixes)]
    best = max((literal for literal, _ in matches), default=0)
    if best < 4:
        # Only wildcard templates match (no literal text in common): the code names no site.
        return PREFIX + 'unmatched/' + code
    names = sorted(name for literal, name in matches if literal == best)
    return names[0] if len(names) == 1 else Alternatives(names)


def refusal_row(error):
    """The row of the refusal a child run raised (the routed site that just refused)."""
    code = refusal_code(error)
    if LAST_REFUSAL[0] is not None and (LAST_REFUSAL[0][1] == code or code.endswith('/' + LAST_REFUSAL[0][1])):
        return LAST_REFUSAL[0][0]  # the routed site that refused (also when re-raised under a wrapper prefix)
    if ('/schema/' in code or '/numrule/' in code) and not code.startswith(('Corrupt:', 'Unsupported:')):
        return row(code)
    return PREFIX + 'unrouted/' + code


def guard_wrapper(original):
    @functools.wraps(original)
    def guarded(code, condition):
        if not ACTIVE[0] or ROUTING[0]:
            return original(code, condition)
        frame = inspect.currentframe().f_back
        site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
        name = site_name(*site)
        refused = tables.decide(name, condition, site=site)
        if refused is not None:
            LAST_REFUSAL[0] = (name, code)
        ROUTING[0] = True
        try:
            return original(code, refused is None)
        finally:
            ROUTING[0] = False
    return guarded


def refuse_wrapper(original):
    @functools.wraps(original)
    def refused(code):
        if not ACTIVE[0] or ROUTING[0]:
            return original(code)
        frame = inspect.currentframe().f_back
        site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
        name = site_name(*site)
        if tables.decide(name, False, site=site) is not None:
            LAST_REFUSAL[0] = (name, code)
            ROUTING[0] = True
            try:
                return original(code)
            finally:
                ROUTING[0] = False
    return refused


def shared_require_wrapper(original):
    """SHARED-ROUTE (contract 1116082058-d7a6): decide on the caller site and condition.

    The same exception instance is passed through; kwargs (the cause contract) are untouched,
    so cause and implicit context are exactly the original's. With no cut the original raises
    or not by its own condition, unchanged."""
    @functools.wraps(original)
    def guarded(exc, condition, **kwargs):
        if not ACTIVE[0] or ROUTING[0]:
            return original(exc, condition, **kwargs)
        frame = inspect.currentframe().f_back
        site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
        name = site_name(*site)
        refused = tables.decide(name, condition, site=site)
        if refused is not None:
            LAST_REFUSAL[0] = (name, refusal_code(exc))
        ROUTING[0] = True
        try:
            return original(exc, refused is None, **kwargs)
        finally:
            ROUTING[0] = False
    return guarded


def shared_refuse_wrapper(original):
    @functools.wraps(original)
    def refused(exc, **kwargs):
        if not ACTIVE[0] or ROUTING[0]:
            return original(exc, **kwargs)
        frame = inspect.currentframe().f_back
        site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
        name = site_name(*site)
        if tables.decide(name, False, site=site) is not None:
            LAST_REFUSAL[0] = (name, refusal_code(exc))
            ROUTING[0] = True
            try:
                return original(exc, **kwargs)
            finally:
                ROUTING[0] = False
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


SCHEMA_ROW = [None]


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
                    # Parent run: name the row for the closure's root attribution only.
                    saved = SCHEMA_ROW[0]
                    SCHEMA_ROW[0] = PREFIX + code_of(args, kwargs) + '/schema'
                    try:
                        return original(self, *args, **kwargs)
                    finally:
                        SCHEMA_ROW[0] = saved
                errors = self.errors(*args[:value_index + 1])
                frame = inspect.currentframe().f_back
                site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
                if tables.decide(PREFIX + code_of(args, kwargs) + '/schema', not errors, site=site) is not None:
                    # The schema row is the refusing row; the bank's own routed refusal
                    # inside validate (SHARED-ROUTE) is its mechanism and must not replace it.
                    saved = ROUTING[0]
                    ROUTING[0] = True
                    try:
                        return original(self, *args, **kwargs)
                    finally:
                        ROUTING[0] = saved
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
        wrappers = {'require': guard_wrapper, 'guard': guard_wrapper, 'refuse': refuse_wrapper,
                    'halt': guard_wrapper, 'shared_require': shared_require_wrapper,
                    'shared_refuse': shared_refuse_wrapper}
        for key, wrap in wrappers.items():
            fn = getattr(module, key, None)
            if not inspect.isfunction(fn) or fn in PATCHED.values():
                continue
            if fn.__name__ != key:
                continue
            if key == 'halt' and list(inspect.signature(fn).parameters) != ['code', 'condition']:
                continue  # only a halt(code, condition) predicate (DG-CF3 reducer) is a row
            if key.startswith('shared_') and list(inspect.signature(fn).parameters)[:1] != ['exc']:
                continue  # only the SHARED-ROUTE contract shape (exc, ...) is routed
            originals[fn] = PATCHED.setdefault(fn, wrap(fn))
    for module in tuple(sys.modules.values()):
        name = getattr(module, '__name__', '')
        if not name.startswith('pm_goal') or name == 'pm_goal_test_numrule':
            continue
        for key, value in list(vars(module).items()):
            if inspect.isfunction(value) and value in originals:
                setattr(module, key, originals[value])


# Passive refusal rule (lead decision 1121000124-5847). The original C4I inspection owner's passive reads
# (scripts/pm_goal_dg_ca3_inspection.py:78, Inspector.passive) return a typed UnavailableRead instead of raising
# when one of their invariants refuses. Only for the four entries below is such a return recorded as that call's
# refusal. The code is the receiver's last_code, which counts only when this very call set it: a sentinel is put on
# the receiver before every recorded call, and passive() itself resets last_code at its start, so a code left by an
# earlier call never counts. Any other entry that returns instead of raising stays an accepted call.
PASSIVE_ENTRIES = frozenset({
    ('pm_goal_dg_ca3_inspection', 'Inspector.read_original_inspection_custody'),
    ('pm_goal_dg_ca3_inspection', 'Inspector.inspect_current_event_v2'),
    ('pm_goal_dg_ca3_inspection', 'Inspector.inspect_current_event_v1'),
    ('pm_goal_dg_ca3_inspection', 'Inspector.inspect_current'),
})
PASSIVE_OWNER = 'scripts/pm_goal_dg_ca3_inspection.py:78 (Inspector.passive)'
_PASSIVE_UNSET = object()


def passive_entry(original):
    return original is not None and (getattr(original, '__module__', None),
                                     getattr(original, '__qualname__', None)) in PASSIVE_ENTRIES


def passive_call(original, receiver, run):
    """Run one call; return (returned, code) where code is this call's own passive refusal code or None."""
    if not passive_entry(original):
        return run(), None
    receiver.last_code = _PASSIVE_UNSET
    returned = run()
    code = getattr(receiver, 'last_code', _PASSIVE_UNSET)
    if isinstance(returned, dict) and returned.get('kind') == 'unavailable' and isinstance(code, str) and code:
        return returned, code
    return returned, None


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
    recorder = getattr(world, 'recorder', None) if world is not None else None
    owners = recorder.snapshot() if recorder is not None else {}
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
        judging = parent_collector.replaying and judge_replay.JUDGING.get()
        started = time.monotonic() if judging else None
        pid = os.fork()
        if pid == 0:
            entries = []
            LAST_REFUSAL[0] = None
            tables.COLLECTOR = SimpleNamespace(observe=lambda n, h, s: entries.append((n, h, s)),
                replaying=parent_collector.replaying, replay_unknown_rows=set())
            ACTIVE[0] = True
            try:
                try:
                    receiver = (arguments or {}).get('receiver')
                    _returned, passive_code = passive_call(original, receiver, action)
                    if passive_code is None:
                        result = dict(errors=[], original_refusal=None)
                    else:
                        result = dict(errors=[refusal_row(SimpleNamespace(code=passive_code))],
                                      original_refusal=passive_code)
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
                        result = dict(errors=[refusal_row(error)], original_refusal=code,
                                      refusal_origin=refusal_origin(error, code))
                # The trial's after-state, taken in this child before it exits: the
                # whole store manifest and the family hook's digest of the owners'
                # in-memory state (pm_goal_dg5_owner_state). The judge compares both
                # with the intact trial's before it grants COVERED_LATER.
                # The owner walk runs only for the judged trials that ask for it.
                ACTIVE[0] = False
                import pm_goal_dg5_owner_state as owner_state
                if not getattr(tables, 'AFTER_STATE', False):
                    owner = dict(schema=owner_state.SCHEMA, hook=family, sha256=None, reason='not requested')
                else:
                    try:
                        owner = owner_state.owner_state_digest(family, world, arguments)
                    except Exception as error:  # noqa: BLE001 - no digest, never a guess
                        owner = dict(schema=owner_state.SCHEMA, hook=family, sha256=None,
                                     reason='owner-state hook raised %s: %s' % (type(error).__name__,
                                                                                str(error)[:160]))
                result.update(observations=entries, after=manifest(file_state(work)), owner_state=owner,
                              refusing_sites=[(name, list(site)) for name, holds, site in entries if not holds],
                              replay_unknown_rows=sorted(tables.COLLECTOR.replay_unknown_rows))
            except BaseException as error:
                result = dict(exception=type(error).__name__, detail=str(error),
                              trace=traceback.format_exc(), observations=entries)
            Path(output).write_bytes(pickle.dumps(result, protocol=5))
            os._exit(0)
        try:
            if judging:
                status = judge_replay.wait(pid, tables.CUT, started)
            else:
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
            import re as _re
            frames = _re.findall(r'File "[^"]*/scripts/(pm_goal[^"]+\.py)", line (\d+), in (\w+)', result.get('trace', ''))
            where = ' @ ' + ' <- '.join('%s:%s(%s)' % f for f in reversed(frames[-2:])) if frames else ''
            raise RuntimeError(result['exception'] + where + ': ' + result['detail'][:200])
        actual.append(result['original_refusal'])
        owner = result.get('owner_state') or {}
        return dict(errors=result['errors'], store_snapshot_sha256=store_sha,
                    refusal_code=result['original_refusal'],
                    refusal_origin=result.get('refusal_origin'), refusing_sites=result.get('refusing_sites', []),
                    store_after_sha256=sweep.digest(result['after']),
                    owner_state_sha256=owner.get('sha256'),
                    owner_state={k: v for k, v in owner.items() if k in ('schema', 'hook', 'reason', 'objects')})

    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('run through pm_goal_dg5_sweep')
    if pending:
        result = collector.invoke(label, evaluate, value, None, target=None, family=family)
    else:
        result = collector.invoke(label, evaluate, value, valid, target=target, family=family)
    return result, (actual[0] if actual else None)


# ---------------------------------------------------------------- number / date-time corpus

SLOTS = []      # declared by a family source: dict(entry, path, kind, where, minimum, maximum, profile)
CORPUS = []     # one row per (slot, corpus value): expectation fixed before the call, then the outcome
SLOT_CAP = 1    # accepted positive calls per slot that carry the whole corpus
_SLOT_RUNS = {}
HUGE = 10 ** 4400 - 1   # 4,400 digits, built without a decimal-string conversion


def corpus_values(spec):
    import json
    import pm_event_numbers_corpus as codec
    data = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    if spec['kind'] in ('integer', 'uint64'):
        out = [(c['op'] + '/' + c['id'], codec._value(c['value'])) for c in data['cases']
               if c['op'] in ('integer', 'uint64') and 'value' in c]
        out += [('probe/4400_digits', HUGE), ('probe/integral_float_one', 1.0), ('probe/negative_zero_float', -0.0),
                ('probe/two_pow_53', 1 << 53), ('probe/two_pow_53_plus_one', (1 << 53) + 1), ('probe/boolean_true', True)]
        return out
    return [(c['op'] + '/' + c['id'], codec._value(c['value'])) for c in data['cases']
            if c['op'] == 'datetime' and 'value' in c]


def corpus_expectation(spec, value):
    """Fixed before the call, from the shared NUMRULE grammar and the owner bounds."""
    import pm_goal_test_numrule as numrule
    try:
        if spec['kind'] == 'integer':
            numrule.N.current_integer(value, minimum=spec.get('minimum'), maximum=spec.get('maximum'))
        elif spec['kind'] == 'uint64':
            numrule.N.storage_uint64(value)
        else:
            numrule.DT.date_time(value, profile=getattr(numrule.DT, spec['profile']))
        if spec.get('jcs'):
            # CV-1100: a JCS-digested integer slot also needs the shared RFC 8785 route to
            # preserve the exact integer (2^53 yes; 2^53+1 and 2^60 no); no safe-integer cap.
            numrule.N.qualified_jcs({'v': value}, type_sensitive_paths=frozenset({('v',)}))
        return 'accept'
    except numrule.NumRefusal as error:
        return 'refuse:' + error.reason


def _with_slot(container, path, value):
    """Shallow copies along `path` only (originals and handles elsewhere stay the same objects)."""
    if not path:
        return value
    head, rest = path[0], path[1:]
    if isinstance(container, (list, tuple)):
        items = list(container)
        items[head] = _with_slot(items[head], rest, value)
        return type(container)(items) if isinstance(container, tuple) else items
    out = type(container)(container) if isinstance(container, dict) else copy.copy(container)
    out[head] = _with_slot(container[head], rest, value)
    return out


def run_slots(label, original, arguments, work):
    entry = label.rsplit('/', 1)[-1]
    for spec in SLOTS:
        if spec['entry'] != entry or _SLOT_RUNS.get(spec['name'], 0) >= SLOT_CAP:
            continue
        try:
            current = arguments
            for part in spec['path']:
                current = current[part]
        except (KeyError, IndexError, TypeError):
            continue
        _SLOT_RUNS[spec['name']] = _SLOT_RUNS.get(spec['name'], 0) + 1
        files = file_state(work)
        original_value = current
        for case_id, value in corpus_values(spec):
            expected = corpus_expectation(spec, value)
            if spec.get('join_code') and expected == 'accept' and not (type(value) is type(original_value)
                                                                       and value == original_value):
                # A lookup/join slot: a grammatical value other than the original names nothing the
                # owner holds, so the owner's own join must refuse it (fixed before the call).
                expected = 'refuse:join'
            if expected == 'refuse:join':
                outcome = _sealed(lambda c=_with_slot(dict(arguments), spec['path'], value):
                                  original(c['receiver'], *c['args'], **c['kwargs']), work, files)
                verdict = 'agree' if outcome[0] == 'refused' and outcome[1] == spec['join_code'] else (
                    'crash' if outcome[0] in ('exception', 'crash') else 'disagree')
                CORPUS.append(dict(slot=spec['name'], family=spec['family'], call=label, case=case_id,
                                   value=repr(value)[:60] if not (type(value) is int and value > 10 ** 30) else '<4400 digits>',
                                   expected=expected, outcome=outcome[0], code=outcome[1],
                                   row=outcome[2] if outcome[0] == 'refused' else None, verdict=verdict))
                continue
            changed = _with_slot(dict(arguments), spec['path'], value)
            outcome = _sealed(lambda c=changed: original(c['receiver'], *c['args'], **c['kwargs']), work, files)
            row_name = None if outcome[0] != 'refused' else outcome[2]
            slot_row = PREFIX + spec['where'] + '/' + ('date-time' if spec['kind'] == 'date-time' else 'number')
            if outcome[0] in ('exception', 'crash'):
                verdict = 'crash'
            elif expected == 'accept':
                verdict = 'agree' if outcome[0] == 'accepted' else 'disagree'
            elif outcome[0] == 'accepted':
                verdict = 'disagree'
            else:
                # Agree when the refusal is at the slot's own row, a declared companion row, or carries
                # exactly the shared-call reason fixed before the call (e.g. .../jcs_binary64).
                reason = expected.split(':', 1)[1]
                carried = isinstance(outcome[1], str) and outcome[1].endswith('/' + reason)
                verdict = 'agree' if row_name in (slot_row, *spec.get('also_rows', ())) or carried \
                    else 'disagree_other_row'
            CORPUS.append(dict(slot=spec['name'], family=spec['family'], call=label, case=case_id,
                               value=repr(value)[:60] if not (type(value) is int and value > 10 ** 30) else '<4400 digits>',
                               expected=expected, outcome=outcome[0], code=outcome[1], row=row_name, verdict=verdict))


def _sealed(action, work, files):
    """One complete call in a forked child from the same parent state; the store is restored."""
    fd, output = tempfile.mkstemp(prefix='slot-', suffix='.pkl', dir=work.parent)
    os.close(fd)
    parent_collector = tables.COLLECTOR
    pid = os.fork()
    if pid == 0:
        tables.COLLECTOR = SimpleNamespace(observe=lambda n, h, s: None, replaying=True, replay_unknown_rows=set())
        ACTIVE[0] = True
        LAST_REFUSAL[0] = None
        try:
            try:
                action()
                result = ('accepted', None)
            except BaseException as error:
                if type(error).__name__ == 'Crash':
                    result = ('crash', str(error))
                elif isinstance(error, Exception) and type(error).__name__ in REFUSAL_CLASSES:
                    result = ('refused', refusal_code(error), refusal_row(error))
                else:
                    frames = traceback.extract_tb(error.__traceback__)[-4:]
                    result = ('exception', type(error).__name__ + ': ' + str(error)[:160] + ' @ ' + ' <- '.join(
                        '%s:%d' % (Path(f.filename).name, f.lineno) for f in reversed(frames)))
        except BaseException as error:  # noqa: BLE001
            result = ('exception', type(error).__name__)
        Path(output).write_bytes(pickle.dumps(result, protocol=5))
        os._exit(0)
    try:
        os.waitpid(pid, 0)
        result = pickle.loads(Path(output).read_bytes())
    finally:
        Path(output).unlink(missing_ok=True)
        restore_files(work, files)
        tables.COLLECTOR = parent_collector
    return result


GUARD_CODE = re.compile(r"\b(?:require|guard|halt|refuse)\(\s*'([^']+)'")
# A guard literal with %- or {}-placeholders is a template (addendum 5, pm-ea-lead 1121190253-6a08, option A):
# each placeholder matches exactly one non-empty code segment (no '/' inside it), anchored at both ends
# (a wrapper prefix ending in '/' is allowed as for a plain literal). The template match only lets the
# check go on: the recorded origin frame still decides own-guard (addendum 11), and with no origin a
# templated literal never credits.
PERCENT_PLACEHOLDER = re.compile(r"%%|%(?:\([^)]*\))?[-#0 +]*(?:\*|\d+)?(?:\.(?:\*|\d+))?[sdirfFxXeEgGcaou]")
FORMAT_PLACEHOLDER = re.compile(r"\{\{|\}\}|\{[^{}]*\}")
_TEMPLATE_SITES = {}


def guard_template(literal):
    """The anchored regex of a templated guard literal, or None when it has no placeholder.

    %-style when the literal has a %-placeholder (then braces are literal), else {}-style
    (then '%' is literal). '%%', '{{' and '}}' are the literal characters."""
    if not isinstance(literal, str):
        return None
    for pattern, escapes in ((PERCENT_PLACEHOLDER, {'%%': '%'}), (FORMAT_PLACEHOLDER, {'{{': '{', '}}': '}'})):
        parts, last, holes = [], 0, 0
        for found in pattern.finditer(literal):
            parts.append(re.escape(literal[last:found.start()]))
            token = found.group(0)
            if token in escapes:
                parts.append(re.escape(escapes[token]))
            else:
                parts.append('[^/]+')
                holes += 1
            last = found.end()
        if holes:
            parts.append(re.escape(literal[last:]))
            return re.compile('(?:.*/)?' + ''.join(parts))
    return None


def template_sites(code, also=()):
    """Every guard line of the owner modules (and of `also`) whose templated literal matches `code`."""
    names = sorted(p.name for p in (ROOT / 'scripts').glob('*.py') if p.name.startswith(SITE_MODULE_PREFIXES))
    names += [n for n in also if n not in names]
    found = []
    for name in names:
        if name not in _TEMPLATE_SITES:
            rows = []
            try:
                lines = (ROOT / 'scripts' / name).read_text().splitlines()
            except OSError:
                lines = []
            for number, text in enumerate(lines, 1):
                literal = GUARD_CODE.search(text)
                template = guard_template(literal.group(1)) if literal else None
                if template is not None:
                    rows.append((number, template))
            _TEMPLATE_SITES[name] = rows
        found += ['scripts/%s:%d' % (name, n) for n, t in _TEMPLATE_SITES[name] if t.fullmatch(code)]
    return found
# Guard helper functions: a refusal raised inside one of these originates at its caller.
GUARD_HELPERS = frozenset(('require', 'guard', 'refuse', 'halt', 'shared_require', 'shared_refuse'))
# A non-site row (schema, number, date-time, boolean) refuses inside a shared checker called at
# its site: these frames may lie between that site and the raise (NUMRULE, a bank's validate path).
CHECKER_FILES = ('pm_goal_test_numrule.py',)
CHECKER_FUNCTIONS = frozenset(('validate', '_checked', 'errors', 'check')) | GUARD_HELPERS
# Static single-raise-site check (addendum 11 (2)), only the fallback when no origin was recorded.
# Review (c): it loads only the pinned copy of the admission gate's module in this branch
# (scripts/dg5_gate_e2/: code_sites.py and the proof_sources.py it loads from its own folder),
# and only when both files match GATE_E2_PIN; any other bytes fail closed. A new gate edition
# is a new pin (dg5_gate_e2/README.md).
GATE_E2 = ROOT / 'scripts' / 'dg5_gate_e2'
GATE_E2_PIN = {
    'code_sites.py': '917c77b7e884d0e33f6d12f9d37385880f3e7ebb8be6ad36e6a59286225cc609',
    'proof_sources.py': '335bbb989dafa21df7510bda9182693a9231cf559d39b646a7752c7b40fd837e',
}
_GATE_SITES = []


def refusal_origin(error, code):
    """Where the refusal that ended the call originated (addendum 11 (1)).

    Follows the exception chain (`__cause__`, else `__context__`, also under `from None`)
    while each earlier exception carries the same refusal code unchanged; the deepest one
    is the origin. Its innermost traceback frame outside this bridge and outside the guard
    helpers (`GUARD_HELPERS`) is the origin site. A refusal rebuilt fresh at another site,
    with no chained original carrying its code, originates at that site.
    """
    chain, seen, current = [], set(), error
    while current is not None and id(current) not in seen:
        seen.add(id(current))
        chain.append(current)
        current = current.__cause__ or current.__context__
    origin, depth = error, 0
    for number, earlier in enumerate(chain[1:], 1):
        try:
            same = isinstance(earlier, Exception) and refusal_code(earlier) == code
        except Exception:  # noqa: BLE001
            same = False
        if not same:
            break
        origin, depth = earlier, number
    here = str(Path(__file__).resolve())
    frames = []
    for frame in traceback.extract_tb(origin.__traceback__):
        path = Path(frame.filename)
        try:
            where = str(path.resolve().relative_to(ROOT))
        except ValueError:
            where = str(path)
        # Round 2 C6 (lead ruling 1124101552-8f55): the direct-call collector's pass-through frame is plumbing
        # like this bridge's own frames. Left as a plain frame it breaks the own-guard checker chain of
        # non-site rows (S2/v7_producer_wrong_payload_header StartOwner.commit_start lost KILLED_CODE to
        # CANNOT_DECIDE with the collector on, solely from that frame sitting inside Bank.validate's path).
        bridge_or_guard = str(path.resolve()) == here or path.name == 'pm_goal_dg5_direct_calls.py' \
            or frame.name in GUARD_HELPERS
        checker = bridge_or_guard or path.name in CHECKER_FILES or frame.name in CHECKER_FUNCTIONS
        frames.append([where, frame.lineno, frame.name, bridge_or_guard, checker])
    site = next(([f[0], f[1]] for f in reversed(frames) if not f[3]), None)
    return dict(site=site, chain_depth=depth, chain_length=len(chain), origin_type=type(origin).__name__,
                frames=frames[-8:])


def static_single_raise_site(code):
    """Addendum 11 (2) through the pinned gate module; None when it is absent, ok False when it is not the pin."""
    import importlib.util
    folder = Path(GATE_E2)
    module_path = folder / 'code_sites.py'
    if not module_path.is_file():
        return None
    actual = {name: hashlib.sha256((folder / name).read_bytes()).hexdigest() if (folder / name).is_file() else None
              for name in GATE_E2_PIN}
    if actual != GATE_E2_PIN:
        return dict(ok=False, reason='gate-e2 module is not the pinned file (sha256 %s, pinned %s)' % (actual, GATE_E2_PIN))
    try:
        if not _GATE_SITES or _GATE_SITES[0][1] != actual['code_sites.py']:
            # T323 N1 residual (Qwen lane B): compile the pin-checked bytes themselves; a SourceFileLoader could
            # execute a matching .pyc (same mtime/size) instead of the pinned .py on a manual run without a fresh
            # PYTHONPYCACHEPREFIX (JUDGE-FIX-R2 probe_c). The sha check above already bound these exact bytes.
            import types
            data = module_path.read_bytes()
            gate = types.ModuleType('dg5_gate_e2_code_sites')
            gate.__file__ = str(module_path)
            exec(compile(data, str(module_path), 'exec'), gate.__dict__)
            files = {str(p.relative_to(ROOT)): p.read_text() for p in sorted((ROOT / 'scripts').glob('*.py'))
                     if p.name.startswith(SITE_MODULE_PREFIXES)}
            _GATE_SITES[:] = [(gate.OwnerSites(files), actual['code_sites.py'])]
        sites, sha = _GATE_SITES[0]
        ok, evidence = sites.unique(code)
        return dict(ok=bool(ok), reason=(evidence or {}).get('why'), evidence=evidence, gate_sha256=sha,
                    gate_pin=dict(GATE_E2_PIN))
    except Exception as error:  # noqa: BLE001 - an unusable gate is no proof
        return dict(ok=False, reason='gate-e2 unusable: %s: %s' % (type(error).__name__, str(error)[:200]))


def row_code_check(target, code, origin=None, refusing_sites=()):
    """Is the intact refusal the declared row's own guard with its own code? (KILLED_CODE condition 1.)

    Addendum 1 with addendum 11 (pm-ea-lead 1121131008-95db): the harness's code-matched
    errors list is not trusted. Method 1 decides whenever the trial recorded an origin;
    method 2 is the fallback only when it did not (review (a), lead answer 3):
      (1) the recorded origin (`refusal_origin`) is the row's guard: for a site row
          `dg5/site/<file>:<line>`, the origin site (innermost frame outside this bridge and
          the guard helpers) is that line; for any other row (schema, number, date-time,
          boolean), the site where that row refused in this trial (`refusing_sites`) is in
          the origin traceback with only checker frames inside it (`CHECKER_FILES`,
          `CHECKER_FUNCTIONS`: NUMRULE, a bank's validate path, guard helpers). A refusal
          raised at the row's guard carries that guard's code whatever builds it (a
          FrameError, a template, a computed name), so a line with no literal code is
          judged by its origin. A literal guard code that differs from the refusal code
          (less a wrapper prefix '/' + code) is not the row's own code.
          A templated literal (%- or {}-placeholders, `guard_template`) must match the
          refusal code as an anchored template, one code segment per placeholder; the
          origin still decides, and a templated literal with no origin fails closed
          (addendum 5).
      (2) no origin recorded: the code has exactly one raise site in the owner source and
          that site is the row's (the pinned gate module, `static_single_raise_site`); a
          code built at run time fails.
    Neither holds: unverifiable, fails closed (own False). Any non-site row owns a code
    only when `row(code)` names it. A crash or a missing code owns nothing.
    """
    out = dict(row=target, code=code, guard_code=None, own=False, code_matches=False, origin=origin, why=None)
    if not isinstance(code, str) or not code or code.startswith('crash:'):
        return dict(out, why='no owner refusal code')
    prefix = PREFIX + 'site/'
    site = None
    if target.startswith(prefix):
        name, _, line = target[len(prefix):].rpartition(':')
        try:
            text = (ROOT / 'scripts' / name).read_text().splitlines()[int(line) - 1]
        except (OSError, ValueError, IndexError):
            return dict(out, why='row site line not in this source')
        found = GUARD_CODE.search(text)
        guard = found.group(1) if found else None
        out['guard_code'] = guard
        template = guard_template(guard)
        if template is not None:
            out['guard_template'] = template.pattern
            if not template.fullmatch(code):
                return dict(out, why='refusal code does not match the row guard template')
        elif guard is not None and not (code == guard or code.endswith('/' + guard)):
            return dict(out, why='refusal code is not the row guard code')
        site = ['scripts/' + name, int(line)]
        if template is not None and not origin:
            # Addendum 5: a template match alone never credits; without the origin frame the
            # templated literal is unverifiable, however many raise sites the template matches.
            out['template_sites'] = template_sites(code, also=(name,))
            return dict(out, code_matches=True, why='templated guard literal and no recorded origin '
                        '(%d template site(s) match the code); a template match alone never credits'
                        % len(out['template_sites']))
    else:
        out['guard_code'] = target
        if row(code) != target:
            return dict(out, why='refusal code maps to another row')
    out['code_matches'] = True
    if origin:
        origin_site = origin.get('site')
        if site is not None:
            if origin_site == site:
                return dict(out, own=True, verified_by='origin frame at the row guard',
                            template_matched=template is not None)
            return dict(out, why='origin not at the row guard (origin %s)' % (origin_site,))
        sites = {tuple(s) for n, s in refusing_sites if n == target}
        for where, line, _, _, checker in reversed(origin.get('frames') or []):
            if (where, line) in sites:
                return dict(out, own=True, verified_by='origin at the row refusing site (only checker frames inside)')
            if not checker:
                break
        return dict(out, why='origin not at the row refusing site (origin %s)' % (origin_site,))
    static = static_single_raise_site(code)
    out['static_check'] = static
    if static and static.get('ok'):
        const = (static.get('evidence') or {}).get('const_sites') or []
        allowed = ['%s:%s' % (site[0], site[1])] if site is not None else \
            ['%s:%s' % (s[0], s[1]) for n, s in refusing_sites if n == target]
        if len(const) == 1 and const[0] in allowed:
            return dict(out, own=True, verified_by='single raise site (gate-e2), the row guard')
        return dict(out, why='no recorded origin; the single raise site %s is not the row guard' % (const,))
    return dict(out, why='no recorded origin' + ('; gate-e2 not installed' if static is None
                                                 else '; gate-e2: %s' % static.get('reason')))


def refusal_code(error):
    if type(error).__name__ == 'FrameError':
        return str(error)  # klass + ':' + code, the frame decoder's own code string
    return getattr(error, 'code', None) or getattr(error, 'reason', None) or str(error)


def entry_call(case, label, family, action, work, *, world, arguments, original, target, direct=False):
    """One captured entry of an authored case, then the parent's own call.

    Every entry is registered undeclared first. The sealed child run then
    decides, before the parent advances the store: in a positive case an
    accepting entry is declared a control; in a negative case the entry that
    refuses is declared with the case's authored target (fixed before
    execution), and the kill judge replays it now, against the same store.
    Entries that do neither stay undeclared (no credit either way). The
    parent's own run must agree with the sealed child run.

    With `direct` (round 2 C5; only the direct-call collector passes it), this
    capture observes a corpus call that is not itself a registered entry, so
    its parent run IS the corpus execution: registered entries nested in it
    record as entries (DIRECT_PARENT), exactly as with the collector off.
    Their own parent runs clear DIRECT_PARENT again, so entries nested inside
    those entries stay nested. The sealed child is unchanged either way
    (ACTIVE keeps everything nested inside the one trial).
    """
    expected = case.get('expected')
    collector = tables.COLLECTOR
    settle_case_banks(case)
    result, child = invoke(label, family, action, work, world=world, arguments=arguments,
                           original=original, pending=True)
    if child is None and expected is None:
        collector.declare(result, True, None)
        if SLOTS:
            run_slots(label, original, arguments, Path(work))
    elif child is not None and not child.startswith('crash:') and expected is not None:
        if isinstance(target, Alternatives):
            raised = (result.get('errors') or [None])[0] if isinstance(result, dict) else None
            target = raised if raised in target and child == expected else tuple(target)
        collector.declare(result, None, target)
    saved_parent, saved_direct = PARENT_CALL[0], DIRECT_PARENT[0]
    PARENT_CALL[0] = True
    DIRECT_PARENT[0] = bool(direct)
    try:
        try:
            returned, passive_code = passive_call(original, arguments.get('receiver'), action)
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
        if child != passive_code:
            FAILURES.append(dict(kind='child_parent_disagree', label=label, child=child, parent=passive_code))
        return returned
    finally:
        # Restore, not clear: a nested entry's parent run inside a direct parent run (C5) must hand the
        # outer run its flags back, or the rest of that outer run would execute unflagged.
        PARENT_CALL[0] = saved_parent
        DIRECT_PARENT[0] = saved_direct


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
                saved = SCHEMA_ROW[0]
                SCHEMA_ROW[0] = PREFIX + code + '/schema'
                try:
                    return original_validate(self, root, value, code)
                finally:
                    SCHEMA_ROW[0] = saved
            errors = self.errors(root, value)
            frame = inspect.currentframe().f_back
            site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
            if tables.decide(PREFIX + code + '/schema', not errors, site=site) is not None:
                # As in install_schema_rows: the schema row is the refusing row; the
                # bank's own routed refusal inside validate must not replace it.
                saved = ROUTING[0]
                ROUTING[0] = True
                try:
                    return original_validate(self, root, value, code)
                finally:
                    ROUTING[0] = saved
            return value
        validate._dg5_schema = True
        adapters.RootBank.validate = validate

    # exact_int/storage_time call NR.integer/NR.storage_time, routed at those call sites.
    entries = {
        'SirOwner': ('admit', 'terminalize', 'replay'),
        'ApprovalOwner': ('capture', 'decide', 'revoke', 'read_resolution'),
        'GoalBodyOwner': ('start', 'reserve', 'commit', 'release', 'metadata_update',
                          'read_body', 'read_history', 'read_receipt', 'read_private', 'read_receipt_private'),
        # The other DG-U owners whose methods authored cases call directly (U5/G/api_*): their
        # refusals are complete calls of the same checker. Calls nested in another entry stay nested.
        'InstallationOwner': ('install', 'withdraw', 'reinstall', 'current', 'require_installed'),
        'PermissionOwner': ('grant', 'revoke', 'check'),
        'ThreadOwner': ('birth', 'delete', 'require_content'),
        'HostStopOwner': ('birth', 'stop', 'resume', 'current'),
        'PlanBindingOwner': ('bind', 'advance_epoch', 'conflict', 'current'),
        'ChatOwner': ('post', 'read'),
        'LifecycleOwner': ('change',),
        'UpdateSourceOwner': ('capture', 'read_audit', 'read_input_content', 'advance'),
        'UpdateProducer': ('freeze', 'publish'),
        'EventInspector': ('inspect', 'request_for'),
        # The command composition's own guard sites (:2087/:2089 and the cancel twin) sit in
        # GoalUpdateCommand.commit/cancel_before_body, which authored negatives call directly
        # (U5/G/command_reservation_missing, U5/G/reserved_control_commitment,
        # U5/G/cancel_reservation_missing); without entries those complete calls were never judged.
        # Nested calls from command.run stay inside these entries exactly as body.commit did.
        'GoalUpdateCommand': ('commit', 'cancel_before_body'),
    }
    for class_name, methods in entries.items():
        cls = getattr(module, class_name)
        for method in methods:
            original = getattr(cls, method)

            def bind(original=original, entry=class_name + '.' + method):
                @functools.wraps(original)
                def call(self, *args, **kwargs):
                    # Round 2 C5: inside a direct call's parent run this entry records as an entry.
                    if ACTIVE[0] or CASE[0] is None or (PARENT_CALL[0] and not DIRECT_PARENT[0]):
                        return original(self, *args, **kwargs)
                    case = CASE[0]
                    world = getattr(self, 'world', None) or self.w  # GoalUpdateCommand holds .w
                    expected = case.get('expected')
                    from pm_goal_dg5_declarations import target
                    return entry_call(case, case['id'] + '/' + entry, 'goal.updated',
                                      lambda: original(self, *args, **kwargs), world.root, world=world,
                                      arguments=dict(receiver=self, args=args, kwargs=kwargs), original=original,
                                      target=target(case, target_rows(expected), case['id'] + '/' + entry))
                return call
            setattr(cls, method, bind())
