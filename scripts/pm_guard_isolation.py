#!/usr/bin/env python3
"""Serial, complete-path guard isolation (check 11).

Method B: original Python functions, fresh factories, table-entry swaps only.
See GUARDTOOL-ADOPTION.md. Schema occurrence cuts remain separately supported.
No Python source/bytecode rewriting, recompilation or function/state cloning.
"""
from __future__ import annotations

import argparse
import ast
import builtins
import copy
import dis
import enum
import inspect
import importlib.machinery
from dataclasses import asdict, dataclass, field, replace
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import resource
import re
import struct
import symtable
import sys
import sysconfig
import time
import types
import typing
import weakref
from typing import Any, Callable
import __future__
from urllib.parse import unquote, urldefrag, urljoin

from jsonschema import FormatChecker, validators
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012


class IsolationError(ValueError):
    """Invalid declaration, unresolved reference, or unsafe cut."""


# C8-U1: instructions that only move references between the frame's stack, locals, constants and cells. None
# calls anything, stores into an object or drops a reference (so no finalizer can run), so the input/context
# graph after one is the graph before it, which the previous checkpoint already compared. Every other
# instruction, including every store, delete, call, return and any instruction a later Python adds, is followed
# by a purity checkpoint. Names a Python lacks are simply absent.
PURITY_SAFE_OPCODES = frozenset({
    'NOP', 'RESUME', 'CACHE', 'EXTENDED_ARG', 'NOT_TAKEN',
    'LOAD_FAST', 'LOAD_FAST_BORROW', 'LOAD_FAST_CHECK', 'LOAD_FAST_LOAD_FAST', 'LOAD_FAST_BORROW_LOAD_FAST_BORROW',
    'LOAD_FAST_AND_CLEAR', 'LOAD_CONST', 'LOAD_SMALL_INT', 'LOAD_COMMON_CONSTANT', 'LOAD_DEREF', 'LOAD_CLOSURE',
    'COPY', 'SWAP', 'PUSH_NULL', 'MAKE_CELL', 'COPY_FREE_VARS',
    'JUMP_FORWARD', 'JUMP_BACKWARD', 'JUMP_BACKWARD_NO_INTERRUPT', 'BUILD_TUPLE', 'BUILD_LIST'})


# C8-U2: immutable external bindings the state snapshot certifies without walking them. Each is certified only
# by identity with the canonical object, and static_scan holds every scanned module to the usage discipline
# (bound once, never written through, a module never aliased or passed on), so certification can never be the
# only thing standing between a case and changed shared state.
#   Standard-library modules whose public functions keep no result-affecting module state (re's and struct's
#   caches change speed, never a result). random, time, os, sys, io, datetime, decimal (a mutable context),
#   copy (copyreg dispatch), collections (ABC registration) and every third-party module stay refused.
STDLIB_IMMUTABLE_MODULES = frozenset({'json', 're', 'math', 'cmath', 'string', 'operator', 'itertools', 'functools',
                                      'hashlib', 'base64', 'binascii', 'struct', 'unicodedata', 'keyword', 'textwrap'})
#   typing special forms and aliases (immutable, slotted, never called by a check) and __future__ feature records.
TYPING_FORMS = ('Any', 'Optional', 'Union', 'Callable', 'ClassVar', 'Final', 'Literal', 'Tuple', 'List', 'Dict', 'Set',
                'FrozenSet', 'Iterable', 'Iterator', 'Sequence', 'Mapping', 'MutableMapping', 'MutableSequence', 'Type',
                'NoReturn', 'Never', 'Self', 'Annotated', 'TypeAlias', 'Collection', 'Container', 'Hashable', 'Sized',
                'AnyStr', 'Text', 'LiteralString', 'Required', 'NotRequired', 'ReadOnly', 'TypeGuard', 'TypeIs', 'TYPE_CHECKING')
_TYPING_OBJECTS = {name: vars(typing)[name] for name in TYPING_FORMS if name in vars(typing) and type(vars(typing)[name]) is not bool}
_FUTURE_OBJECTS = {name: getattr(__future__, name) for name in __future__.all_feature_names}
#   Enum bases a literal Enum may use.
_LITERAL_ENUM_BASES = ((enum.Enum,), (str, enum.Enum), (int, enum.Enum), (enum.IntEnum,), (enum.StrEnum,))
_ENUM_INTERNAL_KEYS = frozenset({'__doc__', '__firstlineno__', '__module__', '__qualname__', '__new__', '__static_attributes__',
                                 '_generate_next_value_', '_hashable_values_', '_member_map_', '_member_names_', '_member_type_',
                                 '_new_member_', '_unhashable_values_', '_unhashable_values_map_', '_use_args_',
                                 '_value2member_map_', '_value_repr_', '__dict__', '__format__', '__repr__', '__str__', '__weakref__'})
_STDLIB_DIRS = tuple(Path(p).resolve() for p in {sysconfig.get_paths()['stdlib'], sysconfig.get_paths()['platstdlib']})
_SITE_DIRS = tuple(Path(p).resolve() for p in {sysconfig.get_paths()['purelib'], sysconfig.get_paths()['platlib']})


def _stdlib_immutable_module(obj):
    """An allowlisted standard-library module object, the one sys.modules holds, loaded from the standard library."""
    name = vars(obj).get('__name__') if type(obj) is types.ModuleType else None
    if name not in STDLIB_IMMUTABLE_MODULES or sys.modules.get(name) is not obj:
        return False
    origin = getattr(vars(obj).get('__spec__'), 'origin', None)
    if origin in ('built-in', 'frozen'):
        return True
    if not origin:
        return False
    location = Path(origin).resolve()
    return any(location.is_relative_to(d) for d in _STDLIB_DIRS) and not any(location.is_relative_to(d) for d in _SITE_DIRS)


def _immutable_literal(value):
    return type(value) in (type(None), bool, int, float, complex, str, bytes) or type(value) is tuple and all(_immutable_literal(v) for v in value)


def _stdlib_path(filename):
    if not filename:
        return False
    location = Path(filename).resolve()
    return any(location.is_relative_to(d) for d in _STDLIB_DIRS) and not any(location.is_relative_to(d) for d in _SITE_DIRS)


def _certified_module_value(value, root):
    """T48 (tool batch 3, TOOLBATCH2 pre-check finding 3): what a certified standard-library module may hand out
    through a `module.attr` read, so that certifying the module by identity, without walking it, stays sound. The
    module's own public data is shared by every case in the process: a case that can reach a mutable value through
    `module.attr` can write it, and a later case can read it, while the certified module looks unchanged
    (keyword.kwlist, hashlib.algorithms_available, json._default_encoder and _default_decoder, string.Template,
    textwrap.TextWrapper). Accepted, as (kind, label): an immutable literal or a frozenset of immutable literals; a
    builtin function of a module (its __self__ a module or None, never a bound method of an object); a Python function
    defined in the standard library with no attributes of its own and only immutable literal defaults; and any other
    certified external binding (a compiled pattern, a typing form, an allowlisted module). One widening past the
    pre-check's list, with its traps: a class CPython marks immutable (Py_TPFLAGS_IMMUTABLETYPE: itertools.chain,
    operator.itemgetter, functools.partial, struct.Struct), whose attributes cannot be set or deleted, so it holds no
    state a case could leave behind. Everything else is refused: lists, sets, dicts, instances (Enum members
    included: re.I accepts new attributes) and every other class (string.Template, textwrap.TextWrapper,
    json.JSONDecodeError)."""
    if _immutable_literal(value) or type(value) is frozenset and all(_immutable_literal(v) for v in value):
        return ('literal', type(value).__name__)
    if type(value) is types.BuiltinFunctionType and (value.__self__ is None or type(value.__self__) is types.ModuleType):
        return ('builtin-function', getattr(value, '__qualname__', '?'))
    if type(value) is types.FunctionType and _stdlib_path(value.__code__.co_filename) and not vars(value) and value.__closure__ is None and (
            value.__defaults__ is None or all(_immutable_literal(v) for v in value.__defaults__)) and (
            not value.__kwdefaults__ or all(_immutable_literal(v) for v in value.__kwdefaults__.values())):
        return ('stdlib-function', value.__qualname__)
    if type(value) is type and value.__flags__ & _IMMUTABLE_TYPE_FLAG:
        return ('immutable-type', value.__qualname__)
    return _certified_external(value, root)


_IMMUTABLE_TYPE_FLAG = 1 << 8      # Py_TPFLAGS_IMMUTABLETYPE (CPython 3.10 and later)

_MISSING_HOP = object()
_C_DESCRIPTORS = (types.MethodDescriptorType, types.ClassMethodDescriptorType, types.WrapperDescriptorType,
                  types.GetSetDescriptorType, types.MemberDescriptorType)


def _immutable_type(cls):
    return type(cls) is type and bool(cls.__flags__ & _IMMUTABLE_TYPE_FLAG)


def _chain_hop_value(value, root):
    """T61: what a hop of a certified module's attribute chain may reach (`module.a.b`, each hop read statically).
    The first hop's rule (_certified_module_value), less modules: a module handed out by a module or by any later hop
    is refused, so no chain passes its first hop to reach another module's state (textwrap.re, re.functools). Two
    additions for later hops, both immutable: a C method, class-method, slot, getset or member descriptor of a class
    CPython marks immutable (str.upper as `string.ascii_letters.upper`, itertools.chain.from_iterable), and a builtin
    method bound to an immutable literal or to such a class. Everything else is refused."""
    if type(value) is types.ModuleType:
        return None
    if type(value) in _C_DESCRIPTORS and _immutable_type(getattr(value, '__objclass__', None)):
        return ('immutable-type-descriptor', getattr(value, '__qualname__', '?'))
    if type(value) is types.BuiltinMethodType and value.__self__ is not None and type(value.__self__) is not types.ModuleType and (
            _immutable_literal(value.__self__) or _immutable_type(value.__self__)):
        return ('bound-immutable-method', getattr(value, '__qualname__', '?'))
    return _certified_module_value(value, root)


def _chain_problem(modules, attrs, root):
    """T61 (tool batch 4, REVIEW-etools-tb3-opus finding 1): judge every hop of an attribute chain rooted at a certified
    module, in every loaded instance of it. A dunder at any hop is refused (__globals__ hands out a module's namespace:
    json.dumps.__globals__ let a case write into the engine's own json); each hop is read statically (a module's own
    namespace, else inspect.getattr_static, so no property or __getattr__ runs) and must be what _chain_hop_value
    accepts. Returns (hop index, attribute, why) for the first refused hop, else None."""
    current = list(modules)
    for index, attr in enumerate(attrs):
        if attr.startswith('__') and attr.endswith('__'):
            return index, attr, 'a dunder attribute'
        reached = [vars(v).get(attr, _MISSING_HOP) if type(v) is types.ModuleType else inspect.getattr_static(v, attr, _MISSING_HOP) for v in current]
        for got in reached:
            if got is _MISSING_HOP:
                return index, attr, 'missing'
            if _chain_hop_value(got, root) is None:
                return index, attr, 'a module' if type(got) is types.ModuleType else type(got).__name__
        current = reached
    return None


class StaticStopBeforeImport(IsolationError):
    """T61: a checker's source closure holds a static stop error found from its text alone, so nothing of it was imported."""
    def __init__(self, report):
        super().__init__('static_error_stop before import: ' + ', '.join(sorted({e['kind'] for e in report['static']['errors']})))
        self.report = report


# (the names static_scan's dynamic-code rule reads, less compile, which it exempts for the standard library's own)
_PRESCAN_SENSITIVE = frozenset({'eval', 'exec', '__import__', 'getattr', 'globals', 'locals', 'vars', 'import_module',
                                'spec_from_file_location', 'settrace', 'setprofile', 'run_module', 'run_path', 'gettrace',
                                'getprofile', '__builtins__'})


def prescan_sources(start, *, search=None, reset_seams=()):
    """T61 (REVIEW-etools-tb3-opus finding 2): before a checker module is imported (the adapter command line, the trap
    loader), its text and the text of every repository module it imports (found from the import statements, resolved
    without executing anything outside the standard library) are scanned for the table-independent stop errors the text
    alone shows: a write through a name bound to an allowlisted standard-library module (an attribute or item store or
    delete rooted at it), such a name used other than as `module.attribute` (an escape), a refused hop of an attribute
    chain rooted at it (_chain_problem), a star import, and any read of a dynamic-code or reflection name (eval, exec,
    getattr, setattr, vars, globals, __import__, import_module and the rest). Module-level code then never runs before
    the static stop: before, `json.tb3_review_marker = 1` at a checker's top level ran at import, while the stop came
    after. The first hop of a chain is judged as static_scan judges it (external_binding_mutable_read), a later hop or a
    module at any hop as external_binding_chain_read. reset_seams, the declared sources of the start file's reset seams
    when they are known before the import (the trap loader knows them), are held to static_scan's rule: a seam naming a
    certified binding is reset_seam_certified_write. The full static scan still runs after the import; this one can only
    stop a run, never credit one. Returns the errors (empty when the closure is clean)."""
    start = Path(start).resolve()
    trusted = {Path(__file__).resolve()}
    search = [str(start.parent), *(search if search is not None else sys.path)]
    pending, seen, errors = [start], set(), []
    # the repository the checker lives in: the nearest directory above it holding .git, else its own directory; only
    # modules inside it are followed (third-party code, wherever it is installed, is the full scan's to resolve)
    home = next((d for d in [start.parent, *start.parents] if (d / '.git').exists()), start.parent)
    def local(spec):
        origin = getattr(spec, 'origin', None)
        if not origin or origin in ('built-in', 'frozen') or not origin.endswith('.py'):
            return None
        location = Path(origin).resolve()
        if location in trusted or not location.is_relative_to(home) or _stdlib_path(str(location)) or any(location.is_relative_to(d) for d in _SITE_DIRS):
            return None
        return location
    while pending:
        path = pending.pop()
        if path in seen:
            continue
        seen.add(path)
        try:
            tree = ast.parse(path.read_bytes(), filename=str(path))
        except (OSError, SyntaxError, ValueError) as exc:
            errors.append({'kind': 'unscannable_module', 'path': str(path), 'reason': type(exc).__name__ + ': ' + str(exc)})
            continue
        parents = {child: node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
        certified = {}
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    top = alias.name.split('.')[0]
                    bound = alias.asname or top
                    if (alias.asname and alias.name in STDLIB_IMMUTABLE_MODULES) or (not alias.asname and top in STDLIB_IMMUTABLE_MODULES):
                        certified[bound] = alias.name if alias.asname else top
                    for name in [alias.name] + ['.'.join(alias.name.split('.')[:i]) for i in range(1, alias.name.count('.') + 1)]:
                        try:
                            spec = importlib.machinery.PathFinder.find_spec(name, search)
                        except (ImportError, ValueError):
                            spec = None
                        found = local(spec)
                        if found:
                            pending.append(found)
            elif isinstance(node, ast.ImportFrom):
                if any(alias.name == '*' for alias in node.names):
                    errors.append({'kind': 'star_import', 'path': str(path), 'line': node.lineno, 'source': ast.unparse(node)})
                base = node.module or ''
                where = [str(path.parent)] if node.level else search
                for name in [base] + [base + '.' + alias.name for alias in node.names if base]:
                    if not name:
                        continue
                    try:
                        spec = importlib.machinery.PathFinder.find_spec(name, where)
                    except (ImportError, ValueError):
                        spec = None
                    found = local(spec)
                    if found:
                        pending.append(found)
                if not node.level and base in STDLIB_IMMUTABLE_MODULES:
                    for alias in node.names:
                        try:
                            value = getattr(importlib.import_module(base), alias.name)
                        except (ImportError, AttributeError):
                            continue
                        if type(value) is types.ModuleType and _stdlib_immutable_module(value):
                            certified[alias.asname or alias.name] = value.__name__
        modules = {}
        for name, module_name in certified.items():
            try:
                module = importlib.import_module(module_name)
            except ImportError:
                continue
            if _stdlib_immutable_module(module):
                modules[name] = module
        for node in ast.walk(tree):
            if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load) and node.id in _PRESCAN_SENSITIVE:
                errors.append({'kind': 'dynamic_code_or_import', 'path': str(path), 'line': node.lineno, 'source': node.id})
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in ('setattr', 'delattr') and node.args:
                first = node.args[0]
                while isinstance(first, (ast.Attribute, ast.Subscript)):
                    first = first.value
                if isinstance(first, ast.Name) and first.id in modules:
                    errors.append({'kind': 'external_binding_write', 'path': str(path), 'line': node.lineno, 'source': ast.unparse(node)})
            if not (isinstance(node, ast.Name) and node.id in modules):
                continue
            if isinstance(parents.get(node), ast.Call) and parents[node].func is not node and isinstance(parents[node].func, ast.Name) and parents[node].func.id in ('setattr', 'delattr'):
                continue
            parent = parents.get(node)
            if isinstance(node.ctx, ast.Store) or isinstance(node.ctx, ast.Del):
                if not isinstance(parent, (ast.Import, ast.ImportFrom)):
                    errors.append({'kind': 'external_binding_rebound', 'path': str(path), 'line': node.lineno, 'source': node.id})
                continue
            if not (isinstance(parent, ast.Attribute) and parent.value is node):
                errors.append({'kind': 'external_binding_escape', 'path': str(path), 'line': node.lineno, 'source': ast.unparse(parent) if parent is not None else node.id})
                continue
            chain, top = [], node
            while isinstance(parents.get(top), ast.Attribute) and parents[top].value is top:
                top = parents[top]
                chain.append(top)
            loads = [a for a in chain if isinstance(a.ctx, ast.Load)]
            if len(loads) != len(chain) or isinstance(parents.get(top), ast.Subscript) and parents[top].value is top and isinstance(parents[top].ctx, (ast.Store, ast.Del)):
                errors.append({'kind': 'external_binding_write', 'path': str(path), 'line': node.lineno, 'source': ast.unparse(parents.get(top) or top)})
                continue
            if isinstance(parents.get(top), ast.Call) and parents[top].func is top and isinstance(top, ast.Attribute) and top.attr in ('__setattr__', '__delattr__', '__setitem__', '__delitem__', 'update', 'pop', 'clear', 'setdefault', '__iadd__', '__ior__', 'append', 'extend', 'add', 'remove', 'insert'):
                errors.append({'kind': 'external_binding_write', 'path': str(path), 'line': node.lineno, 'source': ast.unparse(parents[top])})
            problem = _chain_problem([modules[node.id]], [a.attr for a in chain], start.parent)
            if problem:
                index, attr, why = problem
                first = index == 0 and why not in ('a module', 'a dunder attribute')
                errors.append({'kind': 'external_binding_mutable_read' if first else 'external_binding_chain_read', 'path': str(path), 'line': node.lineno,
                               'source': ast.unparse(chain[index]), 'hop': index, 'reason': why})
        if path == start:
            for source in reset_seams:
                try:
                    seam = ast.parse(source)
                except SyntaxError:
                    continue
                reached = sorted({part.id for part in ast.walk(seam) if isinstance(part, ast.Name) and part.id in modules})
                if reached:
                    errors.append({'kind': 'reset_seam_certified_write', 'path': str(path), 'source': source, 'certified': reached})
    return errors


def prescan_report(errors, stage='before import'):
    return {'version': 2, 'status': 'FAIL', 'evaluations': 0, 'factories': 0, 'rows': [], 'runtime': [],
            'static': {'status': 'FAIL', 'errors': errors, 'sites': [], 'stage': stage},
            'failures': [{'kind': 'hidden_static_sites', 'sites': [], 'errors': errors},
                         {'kind': 'static_error_stop', 'stage': stage, 'errors': sorted({e['kind'] for e in errors})}]}


def _literal_enum(cls, root):
    """A repository Enum whose members are immutable literals, with enum's own machinery only: the metaclass is
    EnumType itself, the bases are one of _LITERAL_ENUM_BASES, its namespace holds members and enum's internal
    names only, every function there is enum's or a builtin (no __new__, _missing_, _generate_next_value_, __init__
    or other method of the class's own), and each member carries only enum's own fields."""
    if type(cls) is not enum.EnumType or cls.__bases__ not in _LITERAL_ENUM_BASES:
        return False
    module = sys.modules.get(cls.__module__)
    source = vars(module).get('__file__') if type(module) is types.ModuleType else None
    if not source or not Path(source).resolve().is_relative_to(root):
        return False
    members = dict(cls.__members__)
    for key, value in vars(cls).items():
        if key in members:
            if value is not members[key] and not (type(value) is enum.property or key in _ENUM_INTERNAL_KEYS):
                return False
            continue
        if key not in _ENUM_INTERNAL_KEYS:
            return False
        function = getattr(value, '__func__', value)
        code = getattr(function, '__code__', None)
        if code is not None and Path(code.co_filename).resolve().is_relative_to(root):
            return False
    for member in members.values():
        if type(member) is not cls or set(vars(member)) != {'_value_', '_name_', '__objclass__', '_sort_order_'} or not _immutable_literal(member._value_):
            return False
    return True


def _postponed_annotations(fn):
    """C8-U2: a function compiled under `from __future__ import annotations` whose __annotate__ is the compiler's
    own: no names, no free variables and only string, integer and None constants, so it can only build the dict of
    annotation strings and evaluates nothing (PEP 563). Reading __annotations__ then runs no user code."""
    annotate = getattr(fn, '__annotate__', None)
    code = getattr(annotate, '__code__', None)
    return (bool(fn.__code__.co_flags & __future__.annotations.compiler_flag) and type(annotate) is types.FunctionType and
            code.co_name == '__annotate__' and code.co_filename == fn.__code__.co_filename and not code.co_names and
            not code.co_freevars and annotate.__closure__ is None and all(type(c) in (str, int, type(None)) for c in code.co_consts))


def _certified_external(obj, root):
    """('kind', label) for an immutable external binding certified by identity, else None."""
    if type(obj) is types.ModuleType and _stdlib_immutable_module(obj):
        return ('stdlib-module', obj.__name__)
    for name, form in _TYPING_OBJECTS.items():
        if obj is form:
            return ('typing-form', name)
    for name, feature in _FUTURE_OBJECTS.items():
        if obj is feature:
            return ('future-feature', name)
    for base in (enum.Enum, enum.IntEnum, enum.StrEnum):
        if obj is base:
            return ('enum-base', base.__name__)
    if type(obj) is re.Pattern:
        # C8-U4: a compiled pattern exposes no mutable state; its pattern and flags are all it is.
        return ('re-pattern', obj.pattern if type(obj.pattern) is str else obj.pattern.hex(), type(obj.pattern).__name__, obj.flags)
    return None


def encoded(value: Any) -> str:
    return json.dumps(value, sort_keys=True, ensure_ascii=True, separators=(",", ":"), allow_nan=False)


def digest(value: Any) -> str:
    return hashlib.sha256(encoded(evidence_value(value)).encode()).hexdigest()


def evidence_value(value):
    """Typed DIAGNOSTIC fingerprints, never an event/identity/storage serializer.

    Preserve physical float bits, byte strings and wrong-type fixture inputs.
    No producer payload, number domain or historical recipe is normalized.
    """
    kind = type(value)
    if value is None:
        return ["null"]
    if kind is bool:
        return ["boolean", value]
    if kind is int:
        return ["integer", str(value)]
    if kind is float:
        return ["float64-bits", struct.pack(">d", value).hex()]
    if kind is str:
        return ["string", value]
    if kind in (bytes, bytearray):
        return [kind.__name__, value.hex()]
    if kind in (list, tuple, set, frozenset):
        items = [evidence_value(v) for v in value]
        return [kind.__name__, sorted(items, key=encoded) if kind in (set, frozenset) else items]
    if kind is dict:
        items = [[evidence_value(k), evidence_value(v)] for k, v in value.items()]
        return ["mapping", sorted(items, key=lambda pair: encoded(pair[0]))]
    raise IsolationError("unsupported case fingerprint type: " + kind.__name__ + "; supply reifiable fixture data")


class _DataSnapshot:
    # Source-backed methods keep our own instrumentation inside the engine's
    # trace boundary even when cwd is the repository root. No synthetic-code
    # exemption is granted to lane code.
    __slots__ = ('signature', 'keepalive', 'input_signature')

    def __init__(self, signature, keepalive):
        self.signature, self.keepalive, self.input_signature = signature, keepalive, None

    def __eq__(self, other):
        if type(other) is not _DataSnapshot:
            return NotImplemented
        return self.signature == other.signature


def _data_snapshot(*roots, codes=None):
    """Purity witness for the supported, original data graph (never a serializer).

    Retain order, aliases, cycles, physical scalar bits AND object identities.
    No hooks, descriptors, equality overloads or user iterators are invoked.
    Context sets are observed in their original order; they are never copied.

    codes (C8-U1): a run's cache of immutable scalar encodings, keyed by identity
    and holding the scalar itself, so an id cannot be recycled while its entry
    lives. An immutable scalar's encoding cannot change, so a cached code is the
    code this walk would compute: the signature is identical with or without it.
    """
    seen, nodes, keepalive = {}, [], []
    def visit(value):
        kind = type(value)
        if kind in (type(None), bool, int, float, str, bytes):
            if codes is None:
                keepalive.append(value)  # no recycled IDs after a detached node dies
                return ('scalar', id(value), encoded(evidence_value(value)))
            # the run's cache holds the scalar itself, so its identity cannot be recycled while either lives
            entry = codes.get(id(value))
            if entry is None or entry[0] is not value:
                entry = codes[id(value)] = (value, encoded(evidence_value(value)))
            return ('scalar', id(value), entry[1])
        keepalive.append(value)  # no recycled IDs after a detached node dies
        if kind not in (dict, list, tuple, bytearray, set, frozenset):
            raise IsolationError('predicate purity cannot certify data type: ' + kind.__name__)
        if id(value) in seen:
            return ('ref', seen[id(value)])
        index = len(nodes)
        seen[id(value)] = index
        nodes.append(None)
        contents = (tuple((visit(k), visit(v)) for k, v in value.items()) if kind is dict else
                    bytes(value) if kind is bytearray else tuple(visit(v) for v in value))
        nodes[index] = (kind.__name__, id(value), contents)
        return ('ref', index)
    references = tuple(visit(value) for value in roots)
    return _DataSnapshot((references, tuple(nodes)), tuple(keepalive))


def pointer(parts: tuple) -> str:
    return "/" + "/".join(str(p).replace("~", "~0").replace("/", "~1") for p in parts) if parts else ""


def at(value: Any, parts: tuple) -> Any:
    for part in parts:
        value = value[part]
    return value


def joined(base, reference):
    # urllib treats non-hierarchical URNs differently from JSON Schema refs.
    if reference.startswith("#"):
        return urldefrag(base)[0] + reference
    return urljoin(base, reference)


def schema_copy(value):
    """Copy schema occurrences, including Python-built schemas with shared dicts.

    JSON documents have a tree of containers; a Python object's incidental alias
    must not turn two field predicates into one mutation site. Scalars retain
    their exact values/types; this never serializes producer or stored values.
    """
    if isinstance(value, dict):
        return {key: schema_copy(child) for key, child in value.items()}
    if isinstance(value, list):
        return [schema_copy(child) for child in value]
    return copy.deepcopy(value)


@dataclass(frozen=True)
class Invariant:
    """Same INPUT field and predicate, not a code, keyword, or enforcement site.

    Schema sites derive this by default. Cross-copy/code aliases require an
    explicit binding with evidence, visible in the report for human review.
    """
    subject: str
    predicate: str

    def __post_init__(self):
        if type(self.subject) is not str or type(self.predicate) is not str or not self.subject.strip() or not self.predicate.strip():
            raise IsolationError("invariant requires a nonempty field and predicate")


@dataclass(frozen=True)
class SchemaGuard:
    id: str
    kind: str
    location: str
    invariant: Invariant
    document: str = ""
    path: tuple = ()
    keyword: str = ""
    member: Any = None
    classification: str = "guard"
    evidence: str = ""
    polarity: int = 1
    refusal_code: str = ""          # normalized code returned by the complete-path callback
    entry_uri: str = ""
    reference_trail: tuple = ()
    input_path: tuple = ()
    dialect: str = ""
    predicate_count: int | None = None  # None = unknown, NEVER an atomic cut
    cut: str = ""                    # explicit allow-list strategy; empty = no cut
    activation_context: tuple = ()


@dataclass(frozen=True)
class Classification:
    guard: str
    kind: str                     # selector | unreachable | redundant | format_sweep
    evidence: str                 # exact source/logic/witness, never a blank waiver


@dataclass(frozen=True)
class Duplicate:
    id: str
    sites: tuple[str, ...]
    invariant: Invariant
    evidence: str


@dataclass(frozen=True)
class Control:
    id: str
    value: Any
    boundary: str                 # append | retry | retained_history; synthetic for self-test


@dataclass(frozen=True)
class Negative:
    id: str
    value: Any
    target: str                   # a Guard.id OR an explicitly declared Duplicate.id
    code: str
    control: str
    defect: str                   # source mutation; copied fields must already agree


@dataclass(frozen=True)
class Outcome:
    accepted: bool
    code: str = ""

    def __post_init__(self):
        if type(self.accepted) is not bool or type(self.code) is not str:
            raise IsolationError("Outcome requires an exact boolean and a string code")
        if self.accepted == bool(self.code):
            raise IsolationError("acceptance has no refusal code; refusal requires a code")

    @classmethod
    def accept(cls):
        return cls(True)

    @classmethod
    def refuse(cls, code):
        return cls(False, code)


# Only schema positions are traversed: an instance in const/enum/default is DATA.
MAPS = ("$defs", "definitions", "properties", "patternProperties", "dependentSchemas")
SINGLES = ("additionalProperties", "unevaluatedProperties", "additionalItems",
           "unevaluatedItems", "propertyNames", "contains", "if", "then", "else", "not", "contentSchema")
ARRAYS = ("allOf", "anyOf", "oneOf", "prefixItems")
SCALARS = ("type", "const", "enum", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum",
           "multipleOf", "minLength", "maxLength", "pattern", "format", "minItems", "maxItems",
           "uniqueItems", "minProperties", "maxProperties")
ANNOTATIONS = {"$schema", "$id", "$anchor", "$dynamicAnchor", "$recursiveAnchor", "$comment", "$vocabulary",
               "title", "description", "default", "examples", "deprecated", "readOnly", "writeOnly",
               "contentEncoding", "contentMediaType"}

# Proof credit is opt-in. A known keyword, AST node or physical enforcement
# site is NOT necessarily one predicate. This is the engine's cut allow-list;
# the guide's audit tables include unsupported, ignored and routing cases too.
SUPPORTED_DIALECTS = (validators.Draft6Validator, validators.Draft7Validator,
                      validators.Draft201909Validator, validators.Draft202012Validator)
ATOMIC_SCHEMA = frozenset(SCALARS) - {"pattern", "format"}
SCHEMA_CUTS = {**{k: "delete-one-assertion" for k in ATOMIC_SCHEMA},
    "type": "type-with-typed-membership", "required": "remove-one-required-member",
    "dependentRequired": "remove-one-dependency-member", "dependencies": "remove-one-dependency-member",
    "$boolean": "replace-one-boolean", "minContains": "weaken-only-lower-match-count",
    "maxContains": "remove-only-upper-match-count", "oneOf:maxMatches": "retain-nonzero-match-remove-exclusivity"}
UNSUPPORTED_SCHEMA = {"pattern", "format", "patternProperties", "unevaluatedItems", "unevaluatedProperties"}


def children(node: dict):
    for key in MAPS:
        for name, child in node.get(key, {}).items():
            yield (key, name), child
    for key in SINGLES:
        if key in node:
            yield (key,), node[key]
    for key in ARRAYS:
        for i, child in enumerate(node.get(key, [])):
            yield (key, i), child
    if "items" in node:
        if isinstance(node["items"], list):
            for i, child in enumerate(node["items"]):
                yield ("items", i), child
        else:
            yield ("items",), node["items"]
    for name, child in node.get("dependencies", {}).items():
        if isinstance(child, (dict, bool)):
            yield ("dependencies", name), child


class SchemaCatalog:
    """Closed, eagerly resolved schema graph; no network or implicit retrieval.

    documents maps absolute resource URIs to JSON schemas. roots declares the
    COMPLETE consumed entry points (URI with optional JSON pointer/anchor).
    Dormant definitions are inventoried and every reference in them is resolved.
    """
    def __init__(self, documents: dict[str, Any], roots: tuple[str, ...] | None = None,
                 *, format_checker: FormatChecker | None = None):
        self.documents = schema_copy(documents)
        self.roots = tuple(roots if roots is not None else documents)
        if not self.documents or not self.roots:
            raise IsolationError("schema catalog requires documents and complete consumed roots")
        self.formats = format_checker or FormatChecker()
        self.guards: dict[str, SchemaGuard] = {}
        self.nodes: dict[tuple, Any] = {}
        self.edges: dict[tuple, list[tuple]] = {}
        self.possible_edges: dict[tuple, list[tuple]] = {}
        self.references: list[dict] = []
        self.entry_targets = {}
        self.special_entries = set()
        self.mixed_entries = set()
        self.unsupported_entries = {}
        self.dialects = {}
        self.ineffective = {}
        self.bindings = []
        self._make_registry()
        self._inventory()

    def _make_registry(self):
        resources = []
        for uri, document in self.documents.items():
            if not urldefrag(uri)[0] or ":" not in uri or urldefrag(uri)[1]:
                raise IsolationError(f"absolute document URI required: {uri!r}")
            cls = validators.validator_for(document) if isinstance(document, dict) else validators.Draft202012Validator
            cls.check_schema(document)
            resources.append((uri, Resource.from_contents(document, default_specification=DRAFT202012)))
        self.registry = Registry().with_resources(resources).crawl()

    def _inventory(self):
        by_object, by_uri, dynamic_anchors = {}, {}, {}
        def collect(doc, path, node, base_resolver, scopes, dialect):
            key = (doc, path)
            self.nodes[key] = node
            dialect = validators.validator_for(node, default=dialect) if isinstance(node, dict) else dialect
            self.dialects[key] = dialect
            if isinstance(node, dict):
                by_object[id(node)] = key
            scopes = list(scopes)
            if isinstance(node, dict) and "$id" in node:
                scopes.append((joined(scopes[-1][0], node["$id"]), path))
            for base, root_path in scopes:
                location = base + "#" + pointer(path[len(root_path):])
                if location in by_uri and by_uri[location] != key:
                    raise IsolationError("ambiguous schema resource location " + location)
                by_uri[location] = key
            if isinstance(node, dict):
                for anchor in ("$anchor", "$dynamicAnchor"):
                    if anchor in node:
                        location = scopes[-1][0] + "#" + node[anchor]
                        if location in by_uri and by_uri[location] != key:
                            raise IsolationError("ambiguous schema anchor " + location)
                        by_uri[location] = key
                        if anchor == "$dynamicAnchor":
                            dynamic_anchors.setdefault(node[anchor], []).append(key)
            if not isinstance(node, dict):
                self.edges[key] = []
                self.possible_edges[key] = []
                return
            resolver = base_resolver.in_subresource(Resource.from_contents(node, default_specification=DRAFT202012))
            self.edges[key] = []
            self.possible_edges[key] = []
            for rel, child in children(node):
                collect(doc, path + rel, child, resolver, scopes, dialect)
                # $defs/definitions are declarations, not evaluation edges.
                if rel[0] not in ("$defs", "definitions", "contentSchema"):
                    edge = ((doc, path + rel), rel[0])
                    self.possible_edges[key].append(edge)
                    if self._effective(node, rel[0], dialect):
                        self.edges[key].append(edge)
            for ref_key in ("$ref", "$dynamicRef", "$recursiveRef"):
                if ref_key in node:
                    try:
                        resolved = resolver.lookup(node[ref_key])
                    except Exception as exc:
                        raise IsolationError(f"unresolved {ref_key} {doc}#{pointer(path)}: {node[ref_key]} ({exc})") from exc
                    self.references.append({"source": key, "keyword": ref_key,
                                            "ref": node[ref_key], "target_object": id(resolved.contents),
                                            "target_uri": joined(scopes[-1][0], node[ref_key])})
        for doc, schema in self.documents.items():
            # The root's $id is applied by collect exactly once.
            collect(doc, (), schema, self.registry.resolver(doc), [(doc, ())], validators.Draft202012Validator)
        for ref in self.references:
            uri = ref.pop("target_uri")
            base, fragment = urldefrag(uri)
            target = by_uri.get(base + "#" + unquote(fragment)) or by_object.get(ref.pop("target_object"))
            ref.pop("target_object", None)
            if target is None:
                raise IsolationError(f"reference escapes the declared schema graph: {ref}")
            ref["target"] = target
            self.possible_edges[ref["source"]].append((target, ref["keyword"]))
            active = self._effective(self.nodes[ref["source"]], ref["keyword"], self.dialects[ref["source"]])
            if active:
                self.edges[ref["source"]].append((target, ref["keyword"]))
            if ref["keyword"] == "$dynamicRef":
                # Conservative dynamic closure: every declared matching anchor
                # can be selected by a calling dynamic scope. Never call one
                # unreachable merely because static fallback chose a sibling.
                anchor = urldefrag(ref["ref"])[1]
                ref["dynamic_candidates"] = dynamic_anchors.get(anchor, [])
                for alternative in ref["dynamic_candidates"] if active else ():
                    self.edges[ref["source"]].append((alternative, ref["keyword"]))
                for alternative in ref["dynamic_candidates"]:
                    self.possible_edges[ref["source"]].append((alternative, ref["keyword"]))
        reachable, contexts = set(), {}
        def reach(key, mode="guard", polarity=1):
            context = (mode, polarity)
            if context in contexts.get(key, set()):
                return
            contexts.setdefault(key, set()).add(context)
            reachable.add(key)
            for child, via in self.edges[key]:
                child_mode, child_polarity = mode, polarity
                # A $ref edge is evaluation at the same input and logical polarity.
                parent = self.nodes[key]
                if via in ("if", "contains"):
                    child_mode = "selector"
                elif via == "not":
                    child_polarity *= -1
                elif via in ("then", "else") and "if" not in parent:
                    continue
                reach(child, child_mode, child_polarity)
        for entry in self.roots:
            try:
                result = self.registry.resolver().lookup(entry)
                base, fragment = urldefrag(entry)
                target = by_uri.get(base + "#" + unquote(fragment)) or by_object.get(id(result.contents))
                if target is None:
                    raise IsolationError("root not in declared resources")
            except Exception as exc:
                raise IsolationError(f"unresolved declared root {entry}: {exc}") from exc
            reach(target)
            self.entry_targets[entry] = target
        # URI aliases are approved by resolved schema location, never spelling.
        self.entry_locations = by_uri
        declared = {target: entry for entry, target in self.entry_targets.items()}
        self.approved_entries = {uri: declared[key] for uri, key in by_uri.items() if key in declared}
        for (doc, path), node in self.nodes.items():
            # Booleans are interned; their physical position, not object id, is their identity.
            context, evidence, polarity = self._context(doc, path, reachable)
            dynamic = contexts.get((doc, path), set())
            effective_polarities = {p for mode, p in dynamic if mode == "guard"}
            if len(effective_polarities) > 1:
                context, evidence = "unclassified", "same assertion evaluated in both logical polarities; separate occurrence binding required"
            elif effective_polarities:
                context, polarity = "guard", next(iter(effective_polarities))
                evidence = ""
            elif dynamic:
                context, evidence = "selector", "reachable only through if/contains match selection (including references)"
            def add(keyword, member=None, kind="schema", classification=None, why=""):
                suffix = pointer(path + (keyword,)) + ("/" + str(member).replace("~", "~0").replace("/", "~1") if member is not None else "")
                gid = "schema:" + doc + "#" + suffix
                # Conservative identity: never assume two schema occurrences
                # validate the same input field. A lane must bind that explicitly.
                subject = doc + "#" + pointer(path)
                val = node.get(keyword) if isinstance(node, dict) else node
                if keyword == "minContains" and (val is None or self.dialects[(doc, path)] in (validators.Draft6Validator, validators.Draft7Validator)):
                    val = 1
                predicate = encoded([keyword, member if member is not None else val])
                dialect = self.dialects[(doc, path)]
                effective_keyword = keyword.split(":", 1)[0]
                implicit_contains = keyword == "minContains" and "contains" in node and self._effective(node, "contains", dialect)
                if keyword != "$boolean" and kind != "extension" and not implicit_contains and not self._effective(node, effective_keyword, dialect):
                    classification = "unreachable"
                    why = (dialect.__name__ + ": $ref siblings are ignored" if "$ref" in node and effective_keyword != "$ref" and
                           dialect in (validators.Draft3Validator, validators.Draft4Validator, validators.Draft6Validator, validators.Draft7Validator)
                           else dialect.__name__ + ": keyword is not evaluated: " + effective_keyword)
                    self.ineffective[(doc, path, keyword)] = why
                self.guards[gid] = SchemaGuard(gid, kind, doc + "#" + suffix,
                    Invariant(subject, predicate), doc, path, keyword, member,
                    classification or context, why or evidence, polarity, dialect=dialect.__name__)
            if type(node) is bool:
                effective = node == (polarity < 0)
                classification = context if context != "guard" or effective else "redundant"
                add("$boolean", classification=classification,
                    why=evidence if classification != "redundant" else "boolean imposes no rejection in this logical polarity")
                continue
            for keyword in SCALARS:
                if keyword in node:
                    if keyword == "format" and node[keyword] not in self.formats.checkers:
                        add(keyword, classification="format_sweep", why="format checker unavailable: " + node[keyword] + "; validator fails closed")
                    elif keyword == "uniqueItems" and node[keyword] is False:
                        add(keyword, classification="redundant", why="uniqueItems=false imposes no restriction")
                    elif keyword in ("minLength", "minItems", "minProperties") and node[keyword] == 0:
                        add(keyword, classification="redundant", why="zero cardinality/length lower bound imposes no restriction")
                    else:
                        add(keyword)
            for name in node.get("required", []):
                add("required", name)
            for trigger, names in node.get("dependentRequired", {}).items():
                for name in names:
                    add("dependentRequired", encoded([trigger, name]))
            for trigger, names in node.get("dependencies", {}).items():
                if isinstance(names, list):
                    for name in names:
                        add("dependencies", encoded([trigger, name]))
            for keyword in ("properties", "patternProperties", "additionalProperties", "unevaluatedProperties", "items", "prefixItems",
                            "additionalItems", "unevaluatedItems", "propertyNames", "dependentSchemas",
                            "allOf", "anyOf", "oneOf", "not", "if", "then", "else", "contains"):
                if keyword not in node:
                    continue
                # Child schemas own their assertions, rather than an aggregate bypass.
                count = len(node[keyword]) if keyword in ("prefixItems", "allOf", "anyOf", "oneOf") else 0
                for member in range(count) if count else (None,):
                    add(keyword, member, kind="routing", classification="selector",
                        why="applicator/branch; child assertions are inventoried individually" if keyword != "if"
                        else "if selects then/else; its own validation result never rejects")
            if "contains" in node:
                zero_count = self.dialects[(doc, path)] in (validators.Draft201909Validator, validators.Draft202012Validator) and node.get("minContains") == 0
                add("minContains", kind="schema", classification="redundant" if zero_count else None,
                    why="minContains=0 imposes no count restriction" if zero_count else evidence or "contains requires at least one match unless an effective minContains overrides it")
                if "maxContains" in node:
                    add("maxContains")
            else:
                for keyword in ("minContains", "maxContains"):
                    if keyword in node:
                        add(keyword, classification="redundant", why="count keyword without contains has no effect")
            if "$vocabulary" in node:
                add("$vocabulary", kind="extension", classification="unclassified",
                    why="custom vocabulary declaration requires an explicit validator/atomic adapter")
            if "$schema" in node and validators.validator_for(node, default=None) not in SUPPORTED_DIALECTS:
                add("$schema", kind="extension", classification="unclassified", why="unsupported or unknown schema dialect")
            if "oneOf" in node:
                add("oneOf:maxMatches", kind="schema", why=evidence or "oneOf forbids more than one matching alternative; branch assertions retain the nonzero obligation")
            for keyword in ("$ref", "$dynamicRef", "$recursiveRef"):
                if keyword in node:
                    add(keyword, kind="reference", classification="selector", why="target resolved eagerly; target assertions inventoried without flattening")
            known = set(SCALARS + MAPS + SINGLES + ARRAYS) | ANNOTATIONS | {
                "items", "required", "dependentRequired", "dependencies", "minContains", "maxContains",
                "$ref", "$dynamicRef", "$recursiveRef"}
            for keyword in sorted(set(node) - known):
                add(keyword, kind="extension", classification="unclassified",
                    why="unknown vocabulary; adapter must supply its validator and predicate inventory")
        self._occurrences()
        self.fingerprint = digest(self.documents)

    @staticmethod
    def _effective(node, keyword, dialect):
        if "$ref" in node and dialect in (validators.Draft3Validator, validators.Draft4Validator, validators.Draft6Validator, validators.Draft7Validator):
            return keyword == "$ref"
        if keyword in ("minContains", "maxContains"):
            return dialect in (validators.Draft201909Validator, validators.Draft202012Validator)
        if keyword in ("then", "else"):
            return "if" in dialect.VALIDATORS and "if" in node
        return keyword in dialect.VALIDATORS

    def _occurrences(self):
        """One assertion per evaluation occurrence, never one per shared $ref site."""
        prototypes = self.guards
        by_node = {}
        for guard in prototypes.values():
            by_node.setdefault((guard.document, guard.path), []).append(guard)
        # jsonschema's descend may select keywords with the caller's dialect
        # while dispatching handlers with the evolved target dialect. A resource's
        # $schema alone cannot prove that its $ref siblings are ignored. Until an
        # adapter represents that context, retain the original graph and every
        # potentially evaluated assertion, with no isolated-cut/proof credit.
        for entry, root in self.entry_targets.items():
            pending, seen = [root], set()
            while pending:
                key = pending.pop()
                if key in seen:
                    continue
                seen.add(key)
                if self.dialects[key] is not self.dialects[root]:
                    self.mixed_entries.add(entry)
                    self.special_entries.add(entry)
                if isinstance(self.nodes[key], dict) and any(k in self.nodes[key] and self._effective(self.nodes[key], k, self.dialects[key]) for k in ("unevaluatedItems", "unevaluatedProperties")):
                    self.unsupported_entries[entry] = "unevaluated coverage depends on peer annotations; context-bound per-predicate adapter required"
                    self.special_entries.add(entry)
                pending.extend(child for child, _ in self.possible_edges[key])
        result, visited_nodes = {}, set()
        def assertion_count(key, stack=frozenset()):
            if key in stack:
                return 2                 # recursive negative contexts are unsupported
            count = sum(g.kind == "schema" and (g.document, g.path, g.keyword) not in self.ineffective
                        for g in by_node.get(key, []))
            for child, via in self.edges[key]:
                if via not in ("if", "contains"):
                    count += assertion_count(child, stack | {key})
                if count > 1:
                    break
            return count
        def simple_negative(key):
            # Applicability itself is an acceptance requirement under negation
            # (e.g. not/properties requires the property to exist). Count leaves
            # only in a same-input conjunction of scalar atoms and ordinary refs.
            node = self.nodes[key]
            if type(node) is bool:
                return True
            # Only total predicates can be inverted as one predicate. Negating
            # a typed assertion (minimum/length/required/etc.) also requires its
            # applicability domain; dropping it would cut BOTH requirements.
            allowed = {"type", "const", "enum", "$ref"} | ANNOTATIONS | {"$defs", "definitions"}
            if set(node) - allowed:
                return False
            return assertion_count(key) == 1 and all(simple_negative(child) for child, via in self.edges[key] if via == "$ref")
        def unsafe_negative(key):
            # The complete not subtree must be understood, including routing
            # that creates requirements without any explicit assertion leaf.
            return not simple_negative(key)
        def visit(entry, key, trail, input_path, mode, polarity, stack, negative_compound=False, activation=()):
            if key in stack:
                self.special_entries.add(entry)
                return
            visited_nodes.add(key)
            negative_compound = negative_compound or (polarity < 0 and unsafe_negative(key))
            for original in by_node.get(key, []):
                classification, evidence = original.classification, original.evidence
                if entry in self.mixed_entries and original.kind not in ("routing", "reference"):
                    classification, evidence = "unclassified", "mixed-dialect evaluation: caller keyword selection and target handlers require a context-bound adapter; resource dialect alone cannot prove reachability"
                elif (original.document, original.path, original.keyword) in self.ineffective:
                    classification = "unreachable"
                elif original.kind in ("routing", "reference"):
                    classification = "selector"
                elif original.kind == "extension":
                    classification = "unclassified"
                elif mode == "selector":
                    classification, evidence = "selector", "match-selection occurrence; not an independent rejection"
                elif original.keyword == "$boolean":
                    effective = self.nodes[key] == (polarity < 0)
                    classification = "guard" if effective else "redundant"
                    evidence = "" if effective else "boolean imposes no rejection in this logical polarity"
                elif original.classification != "format_sweep":
                    noop = original.classification == "redundant"
                    classification = "redundant" if noop and polarity > 0 else "guard"
                    evidence = original.evidence if classification == "redundant" else ""
                if negative_compound:
                    classification, evidence = "unclassified", "compound negative schema context has no peer-preserving atomic cut; expose a context-bound adapter seam"
                # Unsupported grammar is never waived just because it appears
                # inside a selector. Its hidden predicates may control rejection.
                if classification not in ("unreachable",) and original.keyword in UNSUPPORTED_SCHEMA:
                    classification, evidence = "unclassified", "keyword outside per-predicate cut allow-list: " + original.keyword + "; declare context-bound atomic clauses in an adapter"
                if self.dialects[key] not in SUPPORTED_DIALECTS:
                    classification, evidence = "unclassified", "dialect outside supported draft-06/07/2019-09/2020-12 allow-list"
                if mode == "unsupported":
                    classification, evidence = "unclassified", "unsupported applicator context (oneOf exclusivity, pattern routing or unevaluated coverage); atomic adapter required"
                if entry in self.unsupported_entries:
                    classification, evidence = "unclassified", self.unsupported_entries[entry]
                node = self.nodes[key]
                if isinstance(node, dict) and original.keyword == "not" and unsafe_negative((key[0], key[1] + ("not",))):
                    classification, evidence = "unclassified", "negated routing/applicability or compound expression needs a context-bound atomic adapter"
                if isinstance(node, dict) and original.keyword in ("anyOf", "oneOf") and not node[original.keyword]:
                    classification, evidence = "unclassified", "empty alternative set rejects without a child predicate; atomic adapter required"
                gid = original.id + "@" + digest([entry, trail, input_path])[:16]
                # An occurrence includes the input field and its branch/reference
                # route. Physical assertion addresses alone never merge fields.
                cut = SCHEMA_CUTS.get(original.keyword, "") if classification == "guard" else ""
                if classification == "guard" and not cut:
                    classification, evidence = "unclassified", "no allow-listed per-predicate cut for this construct"
                result[gid] = replace(original, id=gid, entry_uri=entry, reference_trail=trail,
                    input_path=input_path, polarity=polarity, classification=classification,
                    evidence=evidence, invariant=Invariant(entry + "#" + pointer(input_path), encoded([
                        original.invariant.predicate, polarity, activation,
                        [key[0], key[1]] if original.keyword in ("minContains", "maxContains", "oneOf:maxMatches") else None])),
                    activation_context=activation,
                    predicate_count=1 if cut else None if classification == "unclassified" else 0, cut=cut)
            edges = self.possible_edges[key] if entry in self.mixed_entries else self.edges[key]
            for child, via in edges:
                child_mode, child_polarity, child_input, child_trail, child_activation = mode, polarity, input_path, trail, activation
                if via in ("$dynamicRef", "$recursiveRef"):
                    self.special_entries.add(entry)
                if via in ("$ref", "$dynamicRef", "$recursiveRef"):
                    child_trail += ((key, child),)
                elif via in ("if", "contains"):
                    child_mode = "selector"
                elif via == "oneOf":
                    child_mode = "unsupported"
                elif via == "not":
                    child_polarity *= -1
                elif via in ("then", "else") and "if" not in self.nodes[key]:
                    continue
                if via in ("then", "else"):
                    child_activation += (("conditional", key, via),)
                elif via in ("dependentSchemas", "dependencies"):
                    child_activation += (("property-present", input_path, child[1][-1]),)
                elif via == "properties":
                    child_input += (child[1][-1],)
                elif via == "patternProperties":
                    child_input += ("@pattern:" + str(child[1][-1]),)
                elif via in ("items", "prefixItems", "additionalItems", "unevaluatedItems"):
                    child_input += (child[1][-1] if isinstance(child[1][-1], int) else "*",)
                elif via in ("additionalProperties", "unevaluatedProperties", "propertyNames"):
                    child_input += ("@" + via,)
                if mode == "unsupported" or via in UNSUPPORTED_SCHEMA:
                    child_mode = "unsupported"
                visit(entry, child, child_trail, child_input, child_mode, child_polarity, stack | {key}, negative_compound, child_activation)
        for entry, key in self.entry_targets.items():
            visit(entry, key, (), (), "guard", 1, set())
        for guard in prototypes.values():
            if (guard.document, guard.path) not in visited_nodes:
                unknown = guard.kind == "extension"
                result[guard.id] = replace(guard, classification="unclassified" if unknown else "unreachable",
                    evidence=("unknown vocabulary anywhere in the declared closure needs an adapter; reachability cannot certify its semantics" if unknown else
                              "no evaluation occurrence from declared roots " + encoded(self.roots)), predicate_count=None if unknown else 0, cut="")
        for gid, guard in list(result.items()):
            if guard.entry_uri in self.special_entries and guard.classification == "guard":
                result[gid] = replace(guard, classification="unclassified",
                    evidence="recursive/dynamic reference occurrences need an explicit context-bound adapter; broad physical cuts are forbidden", cut="", predicate_count=None)
        for entry in self.special_entries:
            gid = "schema-context:" + entry
            reason = (self.unsupported_entries.get(entry) or
                      ("mixed-dialect evaluation needs an explicit context-bound adapter; declared resource dialect is not the calling evaluation context"
                      if entry in self.mixed_entries else "recursive/dynamic occurrence inventory needs an explicit adapter seam"))
            result[gid] = SchemaGuard(gid, "unsupported_context", entry,
                Invariant(entry, "context-bound mixed-dialect evaluation" if entry in self.mixed_entries else "context-bound recursive/dynamic evaluation"),
                classification="unclassified", evidence=reason)
        self.guards = result

    def _reference_frames(self):
        """Private resources retain reference boundaries and isolate each field.

        References are resolved against the ORIGINAL graph, then made absolute.
        Private copies carry no borrowed $id/anchor; their assertions and owning
        dialect remain intact. This is not a merge/flatten of $ref siblings.
        Recursive/dynamic entries retain their original graph and fail closed
        for proof until an adapter supplies a sound occurrence representation.
        """
        docs, frames, aliases = copy.deepcopy(self.documents), {}, {}
        refs = {(r['source'], r['keyword']): r for r in self.references}
        def sanitize(node, key):
            if not isinstance(node, dict):
                return
            for keyword in ("$id", "$anchor", "$dynamicAnchor", "$recursiveAnchor"):
                node.pop(keyword, None)
            for keyword in ("$ref", "$dynamicRef", "$recursiveRef"):
                if keyword in node:
                    target = refs[(key, keyword)]["target"]
                    node[keyword] = target[0] + "#" + pointer(target[1])
            for relative, child in children(node):
                sanitize(child, (key[0], key[1] + relative))
        def frame(entry, target, trail, ancestors):
            alias = "https://pm.invalid/guard-isolation/" + digest([entry, trail]) + ".json"
            if alias in docs:
                raise IsolationError("private schema resource collision")
            value = copy.deepcopy(self.nodes[target])
            sanitize(value, target)
            if isinstance(value, dict):
                dialect = "https://json-schema.org/draft/2020-12/schema"
                for i in range(len(target[1]) + 1):
                    parent = at(self.documents[target[0]], target[1][:i])
                    if isinstance(parent, dict) and "$schema" in parent:
                        dialect = parent["$schema"]
                value["$schema"] = dialect
                value["$id"] = alias
            docs[alias] = value
            frames[(entry, trail)] = (alias, target)
            ancestors = {**ancestors, target: alias}
            def wire(key):
                for child, via in self.edges[key]:
                    if via == "$ref":
                        next_trail = trail + ((key, child),)
                        destination = ancestors.get(child)
                        if destination is None:
                            destination = frame(entry, child, next_trail, ancestors)
                        relative = key[1][len(target[1]):]
                        at(value, relative)["$ref"] = destination
                    elif via not in ("$dynamicRef", "$recursiveRef"):
                        wire(child)
            wire(target)
            return alias
        for entry, target in self.entry_targets.items():
            if entry not in self.special_entries:
                aliases[entry] = frame(entry, target, (), {})
        return docs, frames, aliases

    def _context(self, doc, path, reachable):
        if (doc, path) not in reachable:
            return "unreachable", "no evaluation path from declared roots " + encoded(self.roots), 1
        polarity = 1
        for i, part in enumerate(path):
            parent = at(self.documents[doc], path[:i])
            if part == "if" and isinstance(parent, dict):
                return "selector", "if condition selects a branch; cutting its clauses changes dispatch, not an acceptance guard", 1
            if part == "contains" and isinstance(parent, dict):
                return "selector", "contains child selects matching items; min/maxContains enforce count separately", 1
            if part in ("then", "else") and isinstance(parent, dict) and "if" not in parent:
                return "unreachable", "then/else without if has no effect in JSON Schema", 1
            if part == "contentSchema":
                return "unreachable", "contentSchema is an annotation in the supported standard validators", 1
            if part == "not" and isinstance(parent, dict):
                polarity *= -1
        return "guard", "", polarity

    def bind(self, guard_id: str, invariant: Invariant, evidence: str):
        """Declare an owner-proved alias (e.g. repeated copies of one input field)."""
        if not evidence.strip():
            raise IsolationError("invariant binding requires evidence")
        self.guards[guard_id] = replace(self.guards[guard_id], invariant=invariant, evidence=evidence)
        self.bindings.append({"guard": guard_id, "invariant": asdict(invariant), "evidence": evidence})

    def mutated(self, cuts: frozenset[str]):
        docs, frames, aliases = self._reference_frames()
        for gid in sorted(cuts):
            guard = self.guards.get(gid)
            if guard is None:
                continue                    # code guard, checked by Suite
            if guard.classification != "guard" or guard.predicate_count != 1 or guard.cut != SCHEMA_CUTS.get(guard.keyword):
                raise IsolationError(f"cannot cut {guard.classification} site {gid}")
            if (guard.entry_uri, guard.reference_trail) not in frames:
                raise IsolationError("assertion has no isolated evaluation occurrence " + gid)
            document, target = frames[(guard.entry_uri, guard.reference_trail)]
            relative_path = guard.path[len(target[1]):]
            node = at(docs[document], relative_path)
            keyword = guard.keyword
            if keyword == "$boolean":
                replacement = True if guard.polarity > 0 else False
                if relative_path:
                    at(docs[document], relative_path[:-1])[relative_path[-1]] = replacement
                else:
                    docs[document] = replacement
                continue
            if keyword == "required":
                node[keyword].remove(guard.member)
            elif keyword in ("dependentRequired", "dependencies"):
                trigger, name = json.loads(guard.member)
                node[keyword][trigger].remove(name)
            elif keyword == "minContains":
                if self.dialects[(guard.document, guard.path)] in (validators.Draft6Validator, validators.Draft7Validator):
                    # Legacy contains IS the implicit >=1 predicate; minContains
                    # is not a legacy keyword and cannot weaken it.
                    del node["contains"]
                else:
                    node[keyword] = 0
            elif keyword == "maxContains":
                del node[keyword]
            elif keyword == "oneOf:maxMatches":
                # Retain all alternatives and their assertions, remove ONLY exclusivity.
                branches = node.pop("oneOf")
                node.setdefault("allOf", []).append({"anyOf": branches})
            elif keyword == "type" and guard.polarity > 0:
                original_type = node.pop("type")
                membership = {key: node.pop(key) for key in ("const", "enum") if key in node}
                if membership:
                    # Wrong-type witnesses can pass; a well-typed foreign enum still refuses.
                    node.setdefault("allOf", []).append({"if": {"type": original_type}, "then": membership})
            else:
                del node[keyword]
            if guard.polarity < 0:
                # Only single-atom negative contexts reach this point. Compound
                # negative contexts are unclassified, never broad false cuts.
                node.setdefault("allOf", []).append(False)
        return SchemaView(docs, self.roots, self.formats, aliases, self.approved_entries)


class SchemaView:
    def __init__(self, documents, roots, formats, aliases=None, approved_entries=None):
        self.documents, self.roots, self.formats = documents, roots, formats
        self.aliases = aliases or {}
        self.approved_entries = approved_entries or {}
        self.undeclared_entries = set()
        self.registry = Registry().with_resources((uri, Resource.from_contents(doc, default_specification=DRAFT202012))
            for uri, doc in documents.items()).crawl()
        self._validators = {}
        self._missing_formats = set()
        self._dialects = {}
        self.consumed_entries = set()
        def formats(node, dialect, resolver):
            if isinstance(node, dict):
                resolver = resolver.in_subresource(Resource.from_contents(node, default_specification=DRAFT202012))
                dialect = validators.validator_for(node, default=dialect)
                self._dialects[id(node)] = dialect
                for keyword in ("$ref", "$dynamicRef", "$recursiveRef"):
                    if keyword in node:
                        try:
                            resolver.lookup(node[keyword])
                        except Exception as exc:
                            raise IsolationError("unresolved mutation-view reference: " + node[keyword]) from exc
                if "format" in node and node["format"] not in self.formats.checkers:
                    self._missing_formats.add(node["format"])
                for _, child in children(node):
                    formats(child, dialect, resolver)
        for uri, document in self.documents.items():
            formats(document, validators.Draft202012Validator, self.registry.resolver(uri))

    def validator(self, entry: str):
        base, fragment = urldefrag(entry)
        canonical = self.approved_entries.get(base + "#" + unquote(fragment))
        if canonical is None:
            self.undeclared_entries.add(entry)
            raise IsolationError("consumed schema entry lacks a declared occurrence mapping: " + entry + "; add it to SchemaCatalog.roots")
        self.consumed_entries.update(root for root in self.roots if self.approved_entries.get(
            urldefrag(root)[0] + "#" + unquote(urldefrag(root)[1])) == canonical)
        self.consumed_entries.add(canonical)
        if self._missing_formats:
            raise IsolationError("format checker unavailable: " + ", ".join(sorted(self._missing_formats)) + "; supply the lane's enforced format checker")
        if entry in self._validators:
            return self._validators[entry]
        requested = entry
        entry = self.aliases.get(canonical, canonical)
        base, fragment = urldefrag(entry)
        document = self.documents.get(base)
        if isinstance(document, dict) and "$id" in document:
            # Resolve an alias through its canonical root before following
            # relative references. Do not apply a nested relative $id twice.
            entry = joined(base, document["$id"]) + ("#" + fragment if fragment else "")
        resolved = self.registry.resolver().lookup(entry)
        schema = resolved.contents
        # Use the resolved base (including nested $id), not an invented flat wrapper.
        cls = self._dialects.get(id(schema), validators.Draft202012Validator)
        validator = cls(schema, registry=self.registry, format_checker=self.formats, _resolver=resolved.resolver)
        self._validators[requested] = validator
        return validator


class MemoryGate:
    """Sample between SERIAL callbacks; this is a guard, not an allocation sandbox.

    Peak RSS is checked before/after every callback. Large callbacks must be
    bounded by their lane. Low-memory pause samples free's GiB available value.
    """
    def __init__(self, max_rss=2048, pause_when_low=0, resume_at=None, poll=120, low_timeout=2700,
                 *, available=None, sleep=time.sleep, clock=time.monotonic):
        def finite(value):
            try:
                return type(value) in (int, float) and math.isfinite(value)
            except OverflowError:
                return False
        if not all(finite(x) for x in (max_rss, pause_when_low, poll, low_timeout)) or (resume_at is not None and not finite(resume_at)):
            raise IsolationError("memory limits must be finite numeric thresholds")
        self.max_rss, self.low = max_rss, pause_when_low
        self.resume = resume_at if resume_at is not None else pause_when_low + 1
        self.poll, self.timeout = poll, low_timeout
        self.available = available or self.available_gib
        self.sleep, self.clock = sleep, clock
        if max_rss < 0 or pause_when_low < 0 or self.resume < pause_when_low or poll <= 0 or low_timeout <= 0:
            raise IsolationError("invalid memory limits")

    @staticmethod
    def available_gib():
        for line in Path("/proc/meminfo").read_text().splitlines():
            if line.startswith("MemAvailable:"):
                return int(line.split()[1]) // (1024 * 1024)
        raise IsolationError("MemAvailable unavailable; supply a platform available-memory callback")

    def _check_rss(self):
        peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / (1024 * 1024 if sys.platform == "darwin" else 1024)
        if self.max_rss and peak > self.max_rss:
            raise IsolationError(f"max-rss exceeded: {peak:.1f} MiB > {self.max_rss}")

    def check(self):
        self._check_rss()
        if not self.low:
            return
        available = self.available()
        if available < self.low:
            low_since = self.clock()
            while available < self.resume:
                if available < self.low:
                    if low_since is None:
                        low_since = self.clock()
                    if self.clock() - low_since >= self.timeout:
                        raise IsolationError("available memory stayed below floor for low-timeout")
                else:
                    low_since = None
                print(f"guard-isolation paused: {available} GiB available; resume at {self.resume}", file=sys.stderr, flush=True)
                self.sleep(self.poll)
                available = self.available()
                self._check_rss()
            self._check_rss()       # resume cannot escape a peak accumulated in the pause


def typed_changes(left, right, path=()):
    """Provenance only: several synchronized copies may express ONE defect."""
    if type(left) is not type(right):
        return [pointer(path)]
    if isinstance(left, dict):
        def key_label(k):
            return k if type(k) is str else "@" + encoded(evidence_value(k))
        left_keys = {encoded(evidence_value(k)): k for k in left}
        right_keys = {encoded(evidence_value(k)): k for k in right}
        changes = []
        for token in sorted(left_keys.keys() | right_keys.keys()):
            key = left_keys[token] if token in left_keys else right_keys[token]
            if token in left_keys and token in right_keys:
                changes.extend(typed_changes(left[left_keys[token]], right[right_keys[token]], path + (key_label(key),)))
            else:
                changes.append(pointer(path + (key_label(key),)))
        return changes
    if isinstance(left, (list, tuple)) and len(left) == len(right):
        return sum((typed_changes(a, b, path + (i,)) for i, (a, b) in enumerate(zip(left, right))), [])
    return [] if digest(left) == digest(right) else [pointer(path)]


@dataclass(frozen=True)
class Guard:
    """One declared input invariant. None passes; the exact code refuses."""
    name: str
    invariant: Invariant
    refusal_code: str
    predicate: Callable[[Any, Any], str | None]

    def __post_init__(self):
        if not self.name.strip() or not self.refusal_code.strip() or not callable(self.predicate):
            raise IsolationError('guard needs a unique name, refusal code and predicate')

    @property
    def id(self):
        return self.name


class GuardRefusal(Exception):
    """A tag alone is insufficient: the runner verifies table-issued identity."""
    def __init__(self, guard, code):
        self.guard, self.code = guard, code
        super().__init__(code)


# C8-G1: the guard-call trace of each table lives here, in engine-owned storage, not on the table: checker code
# cannot reach it without g._GUARD_TRACES, which static_scan refuses like every other g._* name.
_GUARD_TRACES = weakref.WeakKeyDictionary()
# GuardTable's private members. The distinctive ones are refused on any receiver and as string constants; the
# generic ones (names lane classes also use for their own state) on any receiver but `self`.
_TABLE_PRIVATE_DISTINCT = frozenset({'_original', '_entries', '_issued', '_in_predicate', '_purity_before', '_purity_codes',
                                     '_matrix_frame', '_calls', '_refused_at', '_GUARD_TRACES'})
_TABLE_PRIVATE = _TABLE_PRIVATE_DISTINCT | frozenset({'_errors', '_root', '_context', '_bound', '_schema', '_bind', '_test',
                                                      '_check_purity', '_refuse', '_restore', '_trace'})
_TABLE_PUBLIC = frozenset({'require', 'validate', 'guards'})


def _always_pass(value, context):
    return None


class GuardTable:
    def __init__(self, guards):
        rows = tuple(guards)
        if any(type(g) is not Guard for g in rows) or len({g.name for g in rows}) != len(rows):
            raise IsolationError('duplicate guard name or invalid Guard row')
        self._original = {g.name: g for g in rows}
        self._entries = dict(self._original)
        self._issued = []
        self._errors = []
        # The guard-call trace of one run, in engine-owned storage (C8-G1): calls holds ('require', row) or
        # ('validate', root) in order; refused_at is the trace length at the issued refusal.
        _GUARD_TRACES[self] = {'calls': [], 'refused_at': None}
        self._root = self._context = None
        self._bound = False
        self._in_predicate = False
        self._purity_before = None
        self._purity_codes = None
        self._matrix_frame = None
        self._schema = None

    @property
    def guards(self):
        return types.MappingProxyType(self._original)

    def _bind(self, value, context, cuts):
        if self._bound or not set(cuts) <= self._original.keys():
            raise IsolationError('table reused or unknown guard cut')
        self._root, self._context, self._bound = value, context, True
        self._purity_codes = {}  # C8-U1: immutable scalar encodings, once per run
        # The sole Python cut operation. All function/code/state objects remain original.
        self._entries = {name: replace(row, predicate=_always_pass) if name in cuts else row
                         for name, row in self._original.items()}
        if self._schema:
            self._schema.bind(cuts)

    def _test(self, row, value, context):
        caller = sys._getframe(1)
        if (not self._bound or value is not self._root or context is not self._context or
                not (caller.f_code is GuardTable.require.__code__ and caller.f_locals.get('self') is self or
                     caller.f_code is _SchemaBinding.validate.__code__ and caller.f_locals.get('self') is self._schema and caller.f_locals.get('table') is self or
                     caller is self._matrix_frame)):
            self._errors.append('predicate evaluation outside authorized engine entry')
            raise IsolationError(self._errors[-1])
        if self._in_predicate:
            self._errors.append('nested guard evaluation')
            raise IsolationError('guard predicates cannot invoke guards')
        self._in_predicate = True
        try:
            self._purity_before = _data_snapshot(value, context, codes=self._purity_codes)
            result = row.predicate(value, context)
            if result is not None and (type(result) is not str or result != row.refusal_code):
                raise IsolationError('predicate must return None or its exact refusal code: ' + row.name)
            self._check_purity(value, context)
            return result
        except BaseException as exc:
            self._errors.append(type(exc).__name__ + ': ' + str(exc))
            raise
        finally:
            # Even a caught/translated predicate exception cannot hide a mutation.
            try:
                if self._purity_before is not None:
                    self._check_purity(value, context)
            finally:
                self._purity_before = None
                self._in_predicate = False

    def _check_purity(self, value, context):
        if _data_snapshot(value, context, codes=self._purity_codes) != self._purity_before:
            error = 'guard predicate mutated input/context'
            self._errors.append(error)
            raise IsolationError(error)

    def require(self, name, value, context=None):
        if not self._bound or value is not self._root or context is not self._context:
            self._errors.append('require must use the complete bound value and context')
            raise IsolationError(self._errors[-1])
        if name not in self._entries:
            self._errors.append('guard missing from table: ' + str(name))
            raise IsolationError(self._errors[-1])
        _GUARD_TRACES[self]['calls'].append(('require', name))
        row = self._entries[name]
        code = self._test(row, value, context)
        if code is not None:
            self._refuse(name, code)

    def _refuse(self, name, code):
        refusal = GuardRefusal(name, code)
        trace = _GUARD_TRACES[self]
        if trace['refused_at'] is None:
            trace['refused_at'] = len(trace['calls'])
        self._issued.append(refusal)
        raise refusal

    def validate(self, entry, value, context=None):
        """Invoke a complete original/cut schema; only the engine issues tags."""
        if not self._schema or not self._bound or value is not self._root or context is not self._context:
            self._errors.append('schema validation needs the bound complete input')
            raise IsolationError(self._errors[-1])
        _GUARD_TRACES[self]['calls'].append(('validate', entry))
        self._schema.validate(self, entry, value, context)

    def _restore(self):
        self._entries = dict(self._original)
        self._purity_codes = None
        self._bound = False
        self._root = self._context = None
        self._issued.clear()
        self._errors.clear()
        _GUARD_TRACES[self] = {'calls': [], 'refused_at': None}


@dataclass
class Case:
    table: GuardTable
    check: Callable[[Any], bool]
    context: Any = None


@dataclass(frozen=True)
class NonGuard:
    """Exact static sites, with a reviewer-checkable plumbing reason.

    count (C8-U3) is the exact number of identical sites (same file, function, kind and source text) the
    declaration covers, default 1. Any other number of matching sites fails, so a site added or removed later
    is never covered silently. The reason must hold for every one of them; nothing is certified automatically.
    """
    path: str
    function: str
    kind: str
    source: str
    reason: str
    count: int = 1


@dataclass
class Suite:
    name: str
    factory: Callable[..., Case]       # factory(value) or a fixed-family factory()
    controls: list[Control]
    negatives: list[Negative]
    checker_modules: tuple[str | Path, ...]
    repository_root: str | Path
    duplicates: list[Duplicate] = field(default_factory=list)
    non_guards: list[NonGuard] = field(default_factory=list)
    reset: Callable[[], None] | None = None
    reset_seams: list[NonGuard] = field(default_factory=list)
    # C8-G3: extra uncut baseline runs per case, each compared with the baseline outcome and trace.
    baseline_repeats: int = 0


# Every form the outside-predicate scan accepts without a declaration, with its
# written totality argument at the stated boundary. Resource exhaustion,
# interpreter interruption and warnings promoted to errors are outside every
# argument. A node that matches no entry is an obligation: a table predicate or
# an exact reviewed NonGuard.
TOTAL_FORMS = {
    'statement:control-transfer': 'pass, break and continue only move the program counter.',
    'statement:expression': 'An expression statement discards a value; the expression is classified on its own.',
    'statement:try': 'Entering try runs no code and each handler is classified on its own; except* is excluded.',
    'statement:except-builtin': 'A bare except or unshadowed canonical builtin exception classes: matching is a subclass check with no user hook. A named handler in a class body counts only in a plain class, where binding and deleting the target use a plain dict.',
    'statement:return-true': 'Returns the literal True, the engine success value.',
    'statement:executed-module-import': 'Module scope of a loaded module: the import already ran, its live binding is verified and no case runs it again.',
    'definition:function': 'def and lambda only build a function object; defaults, annotations and decorators are classified on their own in the enclosing scope. A def in a class body counts only in a plain class, where binding its name stores into a plain dict.',
    'binding:name': 'Binding a plain name in a function or module scope stores into fast locals, a cell or the module dict and runs no hook; class bodies, unpacking, attribute and subscript targets and any __builtins__ binding are excluded.',
    'annotation:postponed': 'An expression inside an annotation in a file whose leading statements include from __future__ import annotations: PEP 563 makes the compiler store the annotation as its source string and never evaluate it, so it cannot raise; only an explicit evaluation (typing.get_type_hints, a call obligation of its own, or eval, which is refused) would run it.',
    'definition:literal-enum': 'A top-level class statement whose bases are names bound to Enum (or str or int with Enum, IntEnum or StrEnum), with no keywords, decorators or type parameters, and whose body is an optional docstring and distinct public NAME = immutable literal bindings only: it ran once when the module loaded (so enum accepted every name), no case runs a top-level statement again, and the class it bound is certified as a literal Enum by the shared snapshot before and after every run.',
    'binding:literal-enum-member': 'A member binding in the body of such a literal Enum statement: covered by the same argument, since that body ran once at import and never runs again.',
    'binding:plain-class-name': 'Binding a plain name in the body of a class with no bases, keywords, decorators or type parameters, while __build_class__ is the unshadowed builtin: the metaclass is type, so the namespace is the plain dict type.__prepare__ returns and a str-key store runs no hook. Any other class body runs in its metaclass mapping, so every name operation there is an obligation.',
    'control:literal-test': 'if or a conditional expression on a builtin literal: literal truthiness has no failure path.',
    'expression:literal': 'Loading a compile-time constant cannot raise.',
    'expression:bound-name': 'The name resolves by the language scope rules to a function, lambda, comprehension or plain class scope (class namespaces do not enclose nested functions or comprehensions) and a binding of that scope dominates the read: parameter, earlier sibling statement, loop or comprehension target, or its own handler target. Deleted names, handler targets outside their own handler body, private names under a class, type-parameter scopes and reads in a class body with bases, keywords, decorators or type parameters are excluded, and the compiler symbol table must agree where it has a table for the scope.',
    'expression:module-name': 'The read resolves to the module namespace, and the syntax alone shows the module binds the name exactly once: one top-level unconditional assignment, annotated assignment with a value, def, class or plain import, with no del, global rebinding, handler target, loop or with target, walrus, augmented assignment or star import anywhere in the file. That statement precedes the top-level statement holding the read (or the read is inside the body of that undecorated def), so the binding exists before the read can run and nothing removes it. The live namespace at scan time certifies nothing.',
    'expression:builtin-name': 'The read resolves past the module namespace, which the file never binds (no binding of the name and no star import), to a name of the canonical builtins module, and every loaded instance of the module uses the canonical builtins and lacks the name. The live module is consulted only to refuse.',
    'expression:loader-name': '__name__, __doc__, __file__, __package__, __spec__ or __loader__, which the file never binds or deletes, read in a module whose every loaded instance came from a SourceFileLoader with a file location: the import system sets these attributes before the module body runs. The live module is consulted only to refuse.',
    'expression:identity-compare': 'is and is not compare identities with no user hook; every other comparison is an obligation.',
    'unary:not-literal': 'not on a builtin literal (None, bool, int, float, complex, str, bytes, Ellipsis): literal truthiness has no failure path.',
    'unary:sign-numeric-literal': 'Unary + or - on an exact int or float literal is defined for every value.',
    'unary:invert-int-literal': '~ on an exact int literal is defined for every value.',
    'display:sequence': 'A list or tuple display stores already computed values; star items are excluded.',
    'display:dict-literal-keys': 'A dict display whose keys are builtin literals, which always hash; ** and mixed str and bytes keys are excluded.',
    'display:set-literal-items': 'A set display whose items are builtin literals, which always hash; mixed str and bytes items are excluded.',
    'display:comprehension-shell': 'A list comprehension or generator shell only collects or wraps results; each for clause is its own obligation.',
    'display:covered-by-parent': 'An f-string field or a slice exists only under a JoinedStr or Subscript, which is itself an obligation.',
    'attribute:function-code': 'Reading __code__ on an unshadowed module-level Python function reads a fixed function slot.',
    'attribute:code-bytes': 'Reading co_code on that code object is defined for every code object.',
    'attribute:engine-callee': 'A callee read on the verified, unshadowed engine alias for a name present in the engine namespace.',
    'attribute:table-callee': 'require or validate read on the factory single fresh engine table; both are GuardTable methods.',
    'call:type-one-argument': 'Unshadowed canonical one-argument type(x) reads the object type with no user hook; star arguments are excluded.',
    'call:bool-literal': 'Unshadowed canonical bool on a builtin literal: literal truthiness has no failure path.',
    'call:table.require': 'Receiver is the factory single fresh table, the name is a literal inventory row, the value is the Case checker unrebound root parameter and the context is the Case context: the only remaining exits are the tagged refusal and errors inside the table row.',
    'constructor:Invariant': '__post_init__ raises only on a non-string or blank field; both arguments must be literal nonblank strings.',
    'constructor:Guard': '__post_init__ only strips name and code and tests callable; name and code must be literal nonblank strings and the predicate an unshadowed module-level callable.',
    'constructor:GuardTable': '__init__ raises only on a non-Guard row or a repeated name; the argument must be a literal sequence of total g.Guard calls with distinct literal names.',
    'constructor:Case': 'Dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary.',
    'constructor:Suite': 'Dataclass with no __post_init__, __new__ or validating descriptor; its only default factories are list: argument binding, which is checked, is its whole boundary.',
    'constructor:Control': 'Frozen dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary.',
    'constructor:Negative': 'Frozen dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary.',
    'constructor:NonGuard': 'Frozen dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary.',
    'constructor:Duplicate': 'Frozen dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary.',
}
_ENGINE_CONSTRUCTORS = {'Guard': Guard, 'GuardTable': GuardTable, 'Invariant': Invariant, 'Case': Case, 'Suite': Suite,
                        'Control': Control, 'Negative': Negative, 'NonGuard': NonGuard, 'Duplicate': Duplicate}
_BUILTIN_LITERALS = (type(None), bool, int, float, complex, str, bytes, type(Ellipsis))
# Module attributes the import system sets on a source module before its body runs.
LOADER_NAMES = frozenset({'__name__', '__doc__', '__file__', '__package__', '__spec__', '__loader__'})


def _names_bound_by(part):
    """Every name this one AST node binds, including forms with no ast.Name."""
    if isinstance(part, ast.Name):
        return set() if isinstance(part.ctx, ast.Load) else {part.id}
    if isinstance(part, ast.arg):
        return {part.arg}
    if isinstance(part, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.ExceptHandler)):
        return {part.name} if part.name else set()
    if isinstance(part, (ast.Global, ast.Nonlocal)):
        return set(part.names)
    if isinstance(part, (ast.Import, ast.ImportFrom)):
        return {alias.asname or alias.name.split('.')[0] for alias in part.names}
    if type(part).__name__ in ('MatchAs', 'MatchStar', 'TypeVar', 'ParamSpec', 'TypeVarTuple'):
        return {part.name} if part.name else set()
    if type(part).__name__ == 'MatchMapping':
        return {part.rest} if part.rest else set()
    return set()


def _function_key(fn):
    fn = fn.__func__ if inspect.ismethod(fn) else fn
    if not inspect.isfunction(fn) or fn.__code__.co_name == '<lambda>':
        raise IsolationError('checker and Python predicates must be source-backed Python functions')
    return (str(Path(fn.__code__.co_filename).resolve()), fn.__code__.co_firstlineno,
            fn.__qualname__.replace('.<locals>.', '.'))


def _predicate_functions(table):
    return [row.predicate for row in table.guards.values() if not isinstance(row.predicate, _SchemaPredicate)]


def _relative(path, root):
    return str(Path(path).resolve().relative_to(root))


def static_scan(suite, table):
    """Conservative census only. Nothing here authorizes a Python cut."""
    root = Path(suite.repository_root).resolve()
    trusted = Path(__file__).resolve()
    pending = [(root / p).resolve() for p in suite.checker_modules]
    if not pending:
        raise IsolationError('checker_modules must name the complete source closure')
    pending.append(Path(_function_key(suite.factory)[0]))
    if suite.reset:
        pending.append(Path(_function_key(suite.reset)[0]))
    predicate_functions = {_function_key(fn): fn.__func__ if inspect.ismethod(fn) else fn for fn in _predicate_functions(table)}
    predicate_keys = set(predicate_functions)
    located_predicates = set()
    files, sites, imports, errors = {}, [], [], []
    allowed, reset_allowed = {}, {}
    automatic = {}
    for declaration in [*suite.non_guards, *suite.reset_seams]:
        path = (root / declaration.path).resolve()
        key = (str(path), declaration.function, declaration.kind, declaration.source)
        if key in allowed or not declaration.reason.strip() or not path.is_relative_to(root) or type(declaration.count) is not int or declaration.count < 1:
            raise IsolationError('invalid or duplicate non-guard declaration')
        allowed[key] = [declaration, 0]
        if declaration in suite.reset_seams:
            if suite.reset is None or declaration.kind != 'shared_state_write':
                raise IsolationError('reset seams need a reset function and shared_state_write kind')
            reset_allowed[key] = allowed[key]

    contexts, source_modules = {}, {}
    for _, module in list(sys.modules.items()):
        if not isinstance(module, types.ModuleType):
            continue
        filename = vars(module).get('__file__')
        if filename:
            path = Path(filename).resolve()
            contexts.setdefault(path, set()).add(vars(module).get('__package__') or '')
            source_modules.setdefault(path, []).append(module)

    def resolve_module(name, source, level=0, optional=False):
        """Follow Python's binding/search context without executing imports.

        Loaded bindings and PathFinder must agree. Custom finders, missing
        origins, namespace ambiguity and native repository code need a seam.
        """
        if level:
            packages = contexts.get(source, set())
            if len(packages) != 1 or not next(iter(packages), ''):
                errors.append({'kind': 'uncertified_import_binding', 'path': str(source), 'module': name, 'reason': 'unknown package context'})
                return set()
            try:
                name = importlib.util.resolve_name('.' * level + name, next(iter(packages)))
            except (ImportError, ValueError) as exc:
                errors.append({'kind': 'uncertified_import_binding', 'path': str(source), 'module': name, 'reason': str(exc)})
                return set()
        found, search = set(), None
        parts = name.split('.')
        for index in range(len(parts)):
            full = '.'.join(parts[:index + 1])
            loaded = sys.modules.get(full)
            spec = importlib.machinery.BuiltinImporter.find_spec(full) if index == 0 else None
            spec = spec or (importlib.machinery.FrozenImporter.find_spec(full) if index == 0 else None)
            spec = spec or importlib.machinery.PathFinder.find_spec(full, search)
            origin = getattr(spec, 'origin', None)
            loaded_origin = vars(loaded).get('__file__') if isinstance(loaded, types.ModuleType) else None
            if loaded_origin and origin not in ('built-in', 'frozen'):
                if not origin or Path(loaded_origin).resolve() != Path(origin).resolve():
                    errors.append({'kind': 'uncertified_import_binding', 'path': str(source), 'module': full,
                                   'reason': 'loaded origin disagrees with search path', 'loaded_origin': loaded_origin, 'search_origin': origin})
                    return found
            if spec is None or origin is None:
                certified_attribute = False
                if optional and index == len(parts) - 1:
                    parent_name, _, attribute = full.rpartition('.')
                    parent = sys.modules.get(parent_name)
                    if isinstance(parent, types.ModuleType) and attribute in vars(parent):
                        binding = vars(parent)[attribute]
                        bound_path = (vars(binding).get('__file__') if isinstance(binding, types.ModuleType) else
                                      binding.__code__.co_filename if inspect.isfunction(binding) else
                                      vars(sys.modules[binding.__module__]).get('__file__') if type(binding) is type and binding.__module__ in sys.modules else None)
                        certified_attribute = True
                        if bound_path and Path(bound_path).resolve().is_relative_to(root):
                            target = Path(bound_path).resolve()
                            if target.suffix != '.py' or not target.is_file():
                                certified_attribute = False
                            else:
                                found.add(target)
                                if isinstance(binding, types.ModuleType):
                                    contexts.setdefault(target, set()).add(vars(binding).get('__package__') or '')
                    elif parent is None:
                        # Dormant from-imports have not executed. Only a direct
                        # source declaration certifies an attribute binding.
                        for candidate in found:
                            if candidate.stem == parts[-2] or candidate.name == '__init__.py':
                                declarations = ast.parse(candidate.read_text()).body
                                certified_attribute = any(isinstance(part, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and part.name == attribute for part in declarations)
                                if certified_attribute:
                                    break
                if not certified_attribute:
                    errors.append({'kind': 'uncertified_import_binding', 'path': str(source), 'module': full,
                                   'reason': 'missing or ambiguous module origin'})
                return found
            if origin not in ('built-in', 'frozen'):
                target = Path(origin).resolve()
                if target.is_relative_to(root):
                    if target.suffix != '.py' or not target.is_file() or not isinstance(spec.loader, importlib.machinery.SourceFileLoader):
                        errors.append({'kind': 'unscannable_module', 'path': str(target), 'module': full})
                    else:
                        found.add(target)
                        package = full if spec.submodule_search_locations is not None else full.rpartition('.')[0]
                        contexts.setdefault(target, set()).add(package)
            search = vars(loaded).get('__path__', spec.submodule_search_locations) if isinstance(loaded, types.ModuleType) else spec.submodule_search_locations
            if search is not None and (type(search) not in (list, tuple) or not all(type(p) is str for p in search) or not search):
                errors.append({'kind': 'uncertified_import_binding', 'path': str(source), 'module': full, 'reason': 'unscannable package search path'})
                return found
            if index < len(parts) - 1 and search is None:
                if not optional or index != len(parts) - 2:
                    errors.append({'kind': 'uncertified_import_binding', 'path': str(source), 'module': name, 'reason': 'parent is not a package'})
                    return found
                # The final from-import may be a function/class attribute of a
                # non-package module; resolve it through that loaded binding.
                search = []
        return found

    while pending:
        path = pending.pop()
        if path == trusted or path in files:
            continue
        if not path.is_relative_to(root) or not path.is_file():
            errors.append({'kind': 'unscannable_module', 'path': str(path)})
            continue
        source = path.read_text()
        tree = ast.parse(source, filename=str(path))
        files[path] = {'path': _relative(path, root), 'sha256': hashlib.sha256(source.encode()).hexdigest()}
        parents = {child: node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
        owners = {}
        def collect(node, owner=''):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                owner = owner + '.' + node.name if owner else node.name
            owners[node] = owner
            for child in ast.iter_child_nodes(node):
                collect(child, owner)
        collect(tree)
        # Conservative symbol closure: aliases retain loader provenance. A
        # conflicting assignment makes the name uncertain rather than safe.
        symbols = {name: {name} for name in ('eval', 'exec', 'compile', '__import__', 'getattr', 'globals', 'locals', 'vars')}
        for module in source_modules.get(path, []):
            for name, binding in vars(module).items():
                if isinstance(binding, types.ModuleType):
                    symbols.setdefault(name, set()).add(vars(binding).get('__name__', ''))
                elif inspect.isfunction(binding) or isinstance(binding, types.BuiltinFunctionType):
                    symbols.setdefault(name, set()).add((binding.__module__ or '') + '.' + binding.__name__)
        for part in ast.walk(tree):
            if isinstance(part, ast.Import):
                for alias in part.names:
                    symbols.setdefault(alias.asname or alias.name.split('.')[0], set()).add(alias.name if alias.asname else alias.name.split('.')[0])
            elif isinstance(part, ast.ImportFrom):
                for alias in part.names:
                    symbols.setdefault(alias.asname or alias.name, set()).add((part.module + '.' if part.module else '') + alias.name)
        def origins(node):
            if isinstance(node, ast.Name):
                return symbols.get(node.id, set())
            if isinstance(node, ast.Attribute):
                return {name + '.' + node.attr for name in origins(node.value)}
            return set()
        assignments = [part for part in ast.walk(tree) if isinstance(part, (ast.Assign, ast.AnnAssign, ast.NamedExpr))]
        for _ in range(len(assignments) + 1):
            changed = False
            for part in assignments:
                targets = part.targets if isinstance(part, ast.Assign) else [part.target]
                for target in targets:
                    if isinstance(target, ast.Name):
                        previous = symbols.setdefault(target.id, set())
                        new = origins(part.value) - previous
                        if new:
                            previous.update(new)
                            changed = True
            if not changed:
                break
        pure_builtins = {fn.__name__: fn for fn in (len, isinstance, type, str, int, bool, bytes, dict, list, tuple, set, frozenset, abs, all, any, min, max, sum)}
        pure_methods = {'get', 'keys', 'values', 'items', 'copy', 'count', 'index', 'startswith', 'endswith', 'isdigit', 'isdecimal', 'isnumeric', 'isascii', 'isalpha', 'isalnum', 'isspace', 'lower', 'upper', 'strip', 'lstrip', 'rstrip', 'split', 'rsplit', 'join', 'find', 'rfind', 'replace', 'hex'}
        shadowed = {part.name for part in ast.walk(tree) if isinstance(part, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef))}
        shadowed.update(part.id for part in ast.walk(tree) if isinstance(part, ast.Name) and isinstance(part.ctx, ast.Store))
        shadowed.update(part.arg for part in ast.walk(tree) if isinstance(part, ast.arg))
        # Bindings other than the module's own top-level definitions and imports.
        local_bindings = set()
        for part in ast.walk(tree):
            if isinstance(part, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Import, ast.ImportFrom)) and not owners[parents[part]]:
                continue
            local_bindings |= _names_bound_by(part)
        shadowed |= local_bindings
        deleted_names = {part.id for part in ast.walk(tree) if isinstance(part, ast.Name) and isinstance(part.ctx, ast.Del)}
        handler_names = {part.name for part in ast.walk(tree) if isinstance(part, ast.ExceptHandler) and part.name}
        def data_expression(part, names, calls):
            if isinstance(part, ast.Name):
                return part.id in names
            if isinstance(part, ast.Subscript):
                return data_expression(part.value, names, calls)
            if isinstance(part, ast.Constant):
                return True
            if isinstance(part, ast.Call):
                return isinstance(part.func, ast.Name) and part.func.id in calls - shadowed and not origins(part.func) and all(data_expression(a, names, calls) for a in part.args)
            return False
        def immutable_data_import(node):
            """C8-U2: `from m import A, B` at module scope, where m is one repository module (not a package) and each
            name is, in m's own source, bound exactly once by a top-level `NAME = literal` of immutable literals (no
            global, del, handler or other binding), and every loaded instance of this file holds exactly m's object
            for it. Then this file reaches no function, class or module object of m: only immutable values, made
            once when m loaded. m's code cannot run in a case through this import, so m is not added to the scanned
            closure (another import of m, or naming it in checker_modules, still scans it). A repository frame of
            an unscanned file that runs anyway fails the run as unscanned_repository_code."""
            if node not in tree.body or node.level or not node.module or any(alias.name == '*' for alias in node.names):
                return False
            files = resolve_module(node.module, path, 0, True)
            if len(files) != 1:
                return False
            source_file = next(iter(files))
            if source_file.name == '__init__.py' or source_file == path:
                return False
            module = sys.modules.get(node.module)
            loaded = source_modules.get(path, [])
            if type(module) is not types.ModuleType or Path(vars(module).get('__file__') or '').resolve() != source_file or not loaded:
                return False
            try:
                other = ast.parse(source_file.read_text(), filename=str(source_file))
            except (SyntaxError, ValueError, OSError):
                return False
            for alias in node.names:
                bound = [part for part in ast.walk(other) if alias.name in _names_bound_by(part)]
                if len(bound) != 1 or not isinstance(bound[0], ast.Name):
                    return False
                statement = next((st for st in other.body if isinstance(st, (ast.Assign, ast.AnnAssign)) and
                                  any(t is bound[0] for t in (st.targets if isinstance(st, ast.Assign) else [st.target]))), None)
                if statement is None or statement.value is None or (isinstance(statement, ast.Assign) and statement.targets != [bound[0]]):
                    return False
                if any(isinstance(part, (ast.Global, ast.Nonlocal)) and alias.name in part.names for part in ast.walk(other)):
                    return False
                try:
                    literal = ast.literal_eval(statement.value)
                except (ValueError, TypeError, SyntaxError, MemoryError, RecursionError):
                    return False
                value = vars(module).get(alias.name)
                if not _immutable_literal(literal) or not _immutable_literal(value) or encoded(evidence_value(literal)) != encoded(evidence_value(value)):
                    return False
                if not all(vars(instance).get(alias.asname or alias.name) is value for instance in loaded):
                    return False
            return True
        def literal_module_constant(node):
            """C8-U4: a single literal binding at module scope is not an error write, whatever its name says. It is a
            top-level unconditional `NAME = literal` (or annotated with a value) whose value is an immutable literal
            (str, bytes, numbers, bool, None, or tuples of them), and the file binds, deletes, declares global or
            handles that name nowhere else. It ran once at import, before any case, and nothing can append to it."""
            if not (node in tree.body and isinstance(node, (ast.Assign, ast.AnnAssign)) and node.value is not None):
                return False
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            if len(targets) != 1 or not isinstance(targets[0], ast.Name):
                return False
            name = targets[0].id
            try:
                value = ast.literal_eval(node.value)
            except (ValueError, TypeError, SyntaxError, MemoryError, RecursionError):
                return False
            def immutable(v):
                return type(v) in _BUILTIN_LITERALS or type(v) is tuple and all(immutable(x) for x in v)
            if not immutable(value) or name in deleted_names or name in handler_names:
                return False
            if any(isinstance(part, (ast.Global, ast.Nonlocal)) and name in part.names for part in ast.walk(tree)):
                return False
            return [part for part in ast.walk(tree) if name in _names_bound_by(part)] == [targets[0]]
        def stdlib_compile(node):
            """C8-U4: `re.compile(...)` is not the builtin compile. Only this exact form is resolved by its binding
            origin: the receiver is a plain name whose every binding in the file is `import re` (no alias, rebinding,
            handler, loop or other binding), every loaded instance binds it to sys.modules['re'], and that module's
            compile is its own Python function, not builtins.compile. Any other compile stays dynamic."""
            if not (isinstance(node.func, ast.Attribute) and node.func.attr == 'compile' and isinstance(node.func.value, ast.Name)):
                return False
            receiver = node.func.value.id
            if origins(node.func.value) != {'re'} or receiver in local_bindings or receiver in deleted_names or receiver in handler_names:
                return False
            binders_ = [part for part in ast.walk(tree) if receiver in _names_bound_by(part)]
            if not binders_ or any(not (isinstance(part, ast.Import) and part in tree.body and
                                        all((alias.asname or alias.name) != receiver or alias.name == 're' for alias in part.names)) for part in binders_):
                return False
            module = sys.modules.get('re')
            function = vars(module).get('compile') if isinstance(module, types.ModuleType) else None
            loaded = source_modules.get(path, [])
            return (bool(loaded) and all(vars(m).get(receiver) is module for m in loaded) and type(function) is types.FunctionType and
                    function is not builtins.compile and function.__module__ == 're')
        def builtin_is(name):
            modules = source_modules.get(path, [])
            if not modules or name not in vars(builtins):
                return False
            canonical = vars(builtins)[name]
            for module in modules:
                namespace = vars(module)
                environment = namespace.get('__builtins__')
                environment = vars(environment) if type(environment) is types.ModuleType else environment
                if type(environment) is not dict or namespace.get(name, environment.get(name)) is not canonical:
                    return False
            return True
        def engine_alias():
            modules = source_modules.get(path, [])
            return bool(modules) and 'g' not in shadowed and all(vars(module).get('g') is sys.modules[__name__] for module in modules)
        def literal_text(node):
            return isinstance(node, ast.Constant) and type(node.value) is str and bool(node.value.strip())
        def builtin_literal(node):
            return isinstance(node, ast.Constant) and type(node.value) in _BUILTIN_LITERALS
        def mixed_text(items):
            # Equal-hash str and bytes keys compare during construction; -bb turns that into an error.
            return {str, bytes} <= {type(item.value) for item in items}
        def bound_arguments(signature_of, node, *leading):
            if any(isinstance(arg, ast.Starred) for arg in node.args) or any(kw.arg is None for kw in node.keywords):
                return None
            try:
                return inspect.signature(signature_of).bind(*leading, *node.args, **{kw.arg: kw.value for kw in node.keywords}).arguments
            except TypeError:
                return None
        def engine_constructor_form(node):
            """Automatic only when the argument boundary proves its validation cannot fire."""
            if not (isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name) and node.func.value.id == 'g'):
                return None
            name = node.func.attr
            if name not in _ENGINE_CONSTRUCTORS or not engine_alias():
                return None
            arguments = bound_arguments(_ENGINE_CONSTRUCTORS[name], node)
            if arguments is None:
                return None
            if name == 'Invariant' and not (literal_text(arguments['subject']) and literal_text(arguments['predicate'])):
                return None
            if name == 'Guard':
                predicate = arguments['predicate']
                if not (literal_text(arguments['name']) and literal_text(arguments['refusal_code']) and isinstance(predicate, ast.Name) and
                        predicate.id not in local_bindings and all(callable(vars(module).get(predicate.id)) for module in source_modules[path])):
                    return None
            if name == 'GuardTable':
                rows = arguments['guards']
                if not isinstance(rows, (ast.List, ast.Tuple)) or any(not isinstance(row, ast.Call) or ast.unparse(row.func) != 'g.Guard' or not engine_constructor_form(row) for row in rows.elts):
                    return None
                names = [bound_arguments(Guard, row)['name'].value for row in rows.elts]
                if len(set(names)) != len(names):
                    return None
            return 'constructor:' + name
        def enclosing_function(node):
            node = parents.get(node)
            while node is not None and not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda, ast.ClassDef)):
                node = parents.get(node)
            return node
        def binders(scope, name):
            return [part for part in ast.walk(scope) if part is not scope and name in _names_bound_by(part)]
        def single_assignment(scope, name):
            """The one direct `name = value` statement, when nothing else in the scope binds it."""
            found = binders(scope, name)
            if len(found) != 1 or not isinstance(found[0], ast.Name):
                return None
            statement = parents[found[0]]
            return statement if isinstance(statement, ast.Assign) and statement.targets == found and statement in scope.body else None
        def table_factory(node):
            """The factory scope that binds `table` once to a fresh engine table, read from its direct checker."""
            checker = enclosing_function(node)
            scope = enclosing_function(checker) if isinstance(checker, ast.FunctionDef) else None
            if not isinstance(scope, ast.FunctionDef) or not engine_alias():
                return None
            statement = single_assignment(scope, 'table')
            maker = statement.value if statement else None
            return scope if isinstance(maker, ast.Call) and ast.unparse(maker.func) in ('g.GuardTable', 'g.schema_table') else None
        def proved_none(expression, scope):
            if expression is None or isinstance(expression, ast.Constant):
                return expression is None or expression.value is None
            statement = single_assignment(scope, expression.id) if isinstance(expression, ast.Name) else None
            return statement is not None and isinstance(statement.value, ast.Constant) and statement.value.value is None
        def table_require_total(node):
            if not (isinstance(node.func, ast.Attribute) and node.func.attr == 'require' and isinstance(node.func.value, ast.Name) and node.func.value.id == 'table'):
                return False
            scope = table_factory(node)
            arguments = bound_arguments(GuardTable.require, node, None)
            if scope is None or arguments is None:
                return False
            checker = enclosing_function(node)
            positional = [*checker.args.posonlyargs, *checker.args.args]
            if not positional or binders(checker, positional[0].arg) != [positional[0]]:
                return False
            guard, root, context = arguments['name'], arguments['value'], arguments.get('context')
            if not (isinstance(guard, ast.Constant) and type(guard.value) is str and guard.value in table.guards and
                    isinstance(root, ast.Name) and root.id == positional[0].arg):
                return False
            # This function is the Case checker, so the engine passes the bound root to it.
            cases = []
            for part in ast.walk(scope):
                if isinstance(part, ast.Call) and ast.unparse(part.func) == 'g.Case':
                    bound = bound_arguments(Case, part)
                    if bound and isinstance(bound['table'], ast.Name) and bound['table'].id == 'table' and isinstance(bound['check'], ast.Name) and bound['check'].id == checker.name:
                        cases.append(bound)
            if len(cases) != 1 or len(binders(scope, checker.name)) != 1:
                return False
            case_context = cases[0].get('context')
            if proved_none(context, scope) and proved_none(case_context, scope):
                return True
            return (isinstance(context, ast.Name) and isinstance(case_context, ast.Name) and context.id == case_context.id and
                    single_assignment(scope, context.id) is not None)
        def call_total_form(node):
            if (isinstance(node.func, ast.Name) and node.func.id in ('type', 'bool') and node.func.id not in shadowed and builtin_is(node.func.id) and
                    len(node.args) == 1 and not node.keywords and not isinstance(node.args[0], ast.Starred)):
                if node.func.id == 'type':
                    return 'call:type-one-argument'
                if builtin_literal(node.args[0]):
                    return 'call:bool-literal'
            return engine_constructor_form(node) or ('call:table.require' if table_require_total(node) else None)
        exempt = set()
        predicate_data = {}
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                first = min([node.lineno] + [d.lineno for d in node.decorator_list])
                key = (str(path), first, owners[node])
                if key in predicate_keys:
                    located_predicates.add(key)
                    function = predicate_functions[key]
                    certified_calls = {name for name, binding in pure_builtins.items()
                                       if function.__globals__.get(name, function.__builtins__.get(name)) is binding}
                    data_names = {a.arg for a in [*node.args.posonlyargs, *node.args.args, *node.args.kwonlyargs]}
                    for part in ast.walk(node):
                        if isinstance(part, ast.Assign) and data_expression(part.value, data_names, certified_calls):
                            data_names.update(t.id for t in part.targets if isinstance(t, ast.Name))
                    # Only the predicate body; defaults/decorators are not predicates.
                    def predicate_body(part):
                        if isinstance(part, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Lambda)):
                            errors.append({'kind': 'nested_predicate_code', 'path': _relative(path, root), 'line': part.lineno})
                            return
                        exempt.add(part)
                        predicate_data[part] = (data_names, certified_calls)
                        for child in ast.iter_child_nodes(part):
                            predicate_body(child)
                    for statement in node.body:
                        predicate_body(statement)
        for node in ast.walk(tree):
            if isinstance(node, ast.stmt) and type(node).__name__ not in {
                'AnnAssign', 'Assert', 'Assign', 'AsyncFor', 'AsyncFunctionDef', 'AsyncWith', 'AugAssign', 'Break',
                'ClassDef', 'Continue', 'Delete', 'Expr', 'For', 'FunctionDef', 'Global', 'If', 'Import', 'ImportFrom',
                'Match', 'Nonlocal', 'Pass', 'Raise', 'Return', 'Try', 'TryStar', 'TypeAlias', 'While', 'With'}:
                errors.append({'kind': 'unknown_statement', 'node': type(node).__name__, 'path': _relative(path, root), 'line': node.lineno})
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                names = [(alias.name, 0, False) for alias in node.names] if isinstance(node, ast.Import) else [(node.module or '', node.level, False)]
                if isinstance(node, ast.ImportFrom):
                    if any(a.name == '*' for a in node.names):
                        errors.append({'kind': 'star_import', 'path': _relative(path, root), 'line': node.lineno})
                    names += [(((node.module + '.') if node.module else '') + a.name, node.level, True) for a in node.names if a.name != '*']
                data_only = isinstance(node, ast.ImportFrom) and immutable_data_import(node)
                for name, level, optional in names:
                    resolved = resolve_module(name, path, level, optional)
                    if not data_only:
                        pending.extend(resolved)
                    imports.append({'from': _relative(path, root), 'module': name, 'repository_files': sorted(_relative(p, root) for p in resolved),
                                    'external': not bool(resolved), 'optional_attribute': optional,
                                    **({'immutable_data_import': True} if data_only else {})})
                if not owners[node]:
                    missing = object()
                    for module in source_modules.get(path, []):
                        for alias in node.names:
                            local = alias.asname or (alias.name.split('.')[0] if isinstance(node, ast.Import) else alias.name)
                            actual = vars(module).get(local, missing)
                            if isinstance(node, ast.Import):
                                expected = sys.modules.get(alias.name if alias.asname else alias.name.split('.')[0], missing)
                            else:
                                package = vars(module).get('__package__') or ''
                                absolute = importlib.util.resolve_name('.' * node.level + (node.module or ''), package) if node.level else node.module
                                parent = sys.modules.get(absolute)
                                expected = vars(parent).get(alias.name, missing) if isinstance(parent, types.ModuleType) else missing
                            if expected is missing or actual is not expected:
                                errors.append({'kind': 'uncertified_import_binding', 'path': _relative(path, root), 'line': node.lineno,
                                               'module': alias.name, 'reason': 'live import alias differs from the resolved binding'})
            kind = None
            # C8-G1: the table's private state and the engine's private names are out of reach of checker code. Any
            # attribute of `table` but require, validate and guards, any GuardTable private member on any receiver,
            # any g._* name, and a string naming a private member (object.__getattribute__(t, '_calls')) are
            # unwaivable errors, like dynamic code.
            if isinstance(node, ast.Attribute) and (
                    isinstance(node.value, ast.Name) and node.value.id == 'table' and node.attr not in _TABLE_PUBLIC or
                    node.attr in _TABLE_PRIVATE_DISTINCT or
                    node.attr in _TABLE_PRIVATE and not (isinstance(node.value, ast.Name) and node.value.id == 'self') or
                    isinstance(node.value, ast.Name) and node.value.id == 'g' and node.attr.startswith('_')):
                errors.append({'kind': 'table_private_state', 'path': _relative(path, root), 'line': node.lineno, 'source': ast.unparse(node)})
            if isinstance(node, ast.Constant) and type(node.value) is str and node.value in _TABLE_PRIVATE_DISTINCT:
                errors.append({'kind': 'table_private_state', 'path': _relative(path, root), 'line': node.lineno, 'source': repr(node.value)})
            # C8-G2: harness detection names join the dynamic set: gettrace and getprofile tell the tool's own run
            # (a trace hook is always set) from production (none is), so a gate on them is non-causal by construction.
            sensitive = {'eval', 'exec', 'compile', '__import__', 'getattr', 'globals', 'locals', 'vars', 'import_module', 'spec_from_file_location', 'settrace', 'setprofile', 'run_module', 'run_path',
                         'gettrace', 'getprofile'}
            # Any read of a sensitive name, or of __builtins__, can carry the function to a call the scan cannot see.
            if (isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load) and (node.id in sensitive or node.id == '__builtins__') and
                    not (isinstance(parents.get(node), ast.Call) and parents[node].func is node)):
                errors.append({'kind': 'dynamic_code_or_import', 'path': _relative(path, root), 'line': node.lineno, 'source': node.id})
            if isinstance(node, ast.Call):
                name = ast.unparse(node.func)
                bindings = origins(node.func)
                if not stdlib_compile(node) and (name.split('.')[-1] in sensitive or any(
                        origin.split('.')[0] in ('importlib', 'runpy') or any(token in sensitive for token in origin.split('.')) for origin in bindings)):
                    errors.append({'kind': 'dynamic_code_or_import', 'path': _relative(path, root), 'line': node.lineno, 'source': ast.unparse(node)})
                if node in exempt:
                    data_names, certified_calls = predicate_data[node]
                    safe = (isinstance(node.func, ast.Name) and node.func.id in certified_calls - shadowed and not bindings or
                            isinstance(node.func, ast.Attribute) and node.func.attr in pure_methods and data_expression(node.func.value, data_names, certified_calls))
                    if not safe:
                        errors.append({'kind': 'predicate_purity_uncertified', 'path': _relative(path, root), 'line': node.lineno, 'source': ast.unparse(node),
                                       'reason': 'call binding/effects require an explicit reviewed seam; inline supported pure data operations'})
                if node not in exempt:
                    leaf = name.split('.')[-1]
                    if leaf in ('append', 'extend', 'insert', 'update', 'add', 'setdefault', 'clear', 'pop', 'remove', 'discard', 'write', 'write_text', 'write_bytes'):
                        kind = 'mutation_or_error_write'
                    elif call_total_form(node) is None:
                        table_call = (isinstance(node.func, ast.Attribute) and node.func.attr in ('require', 'validate') and
                                      isinstance(node.func.value, ast.Name) and node.func.value.id == 'table')
                        helper = leaf in ('require', 'refuse', 'reject', 'deny', 'fail', 'abort', 'exit', '_exit', 'throw') and not table_call
                        kind = 'refusal_helper' if helper else 'call_review'
            if node in exempt:
                if isinstance(node, (ast.AugAssign, ast.Delete, ast.NamedExpr)) or isinstance(node, (ast.Assign, ast.AnnAssign)) and any(
                        isinstance(part, (ast.Attribute, ast.Subscript)) for target in (node.targets if isinstance(node, ast.Assign) else [node.target]) for part in ast.walk(target)):
                    errors.append({'kind': 'predicate_mutation', 'path': _relative(path, root), 'line': node.lineno, 'source': ast.unparse(node)})
                continue
            if isinstance(node, ast.Raise):
                kind = 'raise'
            elif isinstance(node, ast.Assert):
                kind = 'assert'
            elif isinstance(node, ast.Return) and not (isinstance(node.value, ast.Constant) and node.value.value is True):
                kind = 'return'
            elif isinstance(node, (ast.Yield, ast.YieldFrom)):
                kind = 'yield'
            elif isinstance(node, (ast.Assign, ast.AnnAssign, ast.AugAssign, ast.Delete, ast.NamedExpr)):
                targets = node.targets if isinstance(node, (ast.Assign, ast.Delete)) else [node.target]
                if isinstance(node, (ast.AugAssign, ast.Delete)) or any(isinstance(x, (ast.Attribute, ast.Subscript)) for target in targets for x in ast.walk(target)):
                    kind = 'mutation_or_error_write'
                elif any(isinstance(x, ast.Name) and re.search(r'error|refus|reject|fail', x.id, re.I) for target in targets for x in ast.walk(target)) and not literal_module_constant(node):
                    kind = 'mutation_or_error_write'
            if kind:
                text = ast.unparse(node)
                key = (str(path), owners[node], kind, text)
                declaration = allowed.get(key)
                if declaration:
                    declaration[1] += 1
                # Only the exception operation is authorized. Evaluation of an
                # assert test/raise payload and neighboring statements is not.
                operation = node.test if isinstance(node, ast.Assert) else node
                sites.append({'id': _relative(path, root) + ':' + str(node.lineno) + ':' + str(node.col_offset) + ':' + kind,
                              'path': _relative(path, root), 'function': owners[node], 'line': node.lineno,
                              'exception_span': [operation.lineno, operation.end_lineno, operation.col_offset, operation.end_col_offset],
                              'exception_operation': 'RAISE_VARARGS' if kind in ('raise', 'assert') else 'CALL' if kind == 'refusal_helper' else '',
                              'kind': kind, 'source': text, 'non_guard': bool(declaration),
                              'reason': declaration[0].reason if declaration else ''})
        # C8-U2: names bound to certified immutable external bindings keep the discipline their certification needs.
        certified = {}
        loaded_here = source_modules.get(path, [])
        if loaded_here:
            for name in {n for part in tree.body for n in _names_bound_by(part)}:
                values = [vars(m).get(name, certified) for m in loaded_here]
                value = values[0]
                if value is certified or any(v is not value for v in values):
                    continue
                external = _certified_external(value, root)
                if external is not None:
                    certified[name] = external[0]
                elif type(value) is enum.EnumType and _literal_enum(value, root):
                    certified[name] = 'literal-enum'
        for name, label in certified.items():
            bound = [part for part in ast.walk(tree) if name in _names_bound_by(part)]
            allowed_binder = (ast.Import, ast.ImportFrom) if label in ('stdlib-module', 'typing-form', 'future-feature') else (ast.ClassDef, ast.ImportFrom)
            if len(bound) != 1 or not isinstance(bound[0], allowed_binder) or bound[0] not in tree.body:
                errors.append({'kind': 'external_binding_rebound', 'path': _relative(path, root), 'name': name, 'certified_as': label,
                               'reason': 'a certified immutable binding must be bound exactly once, at the top level, by its import (or its class statement)'})
        def certified_root(target):
            while isinstance(target, (ast.Attribute, ast.Subscript, ast.Starred)):
                target = target.value
            return target.id if isinstance(target, ast.Name) and target.id in certified else None
        for node in ast.walk(tree):
            written = None
            if isinstance(node, (ast.Attribute, ast.Subscript)) and isinstance(node.ctx, (ast.Store, ast.Del)):
                written = certified_root(node)
            elif isinstance(node, ast.Call) and isinstance(node.func, (ast.Name, ast.Attribute)) and node.args and (
                    (isinstance(node.func, ast.Name) and node.func.id in ('setattr', 'delattr')) or
                    (isinstance(node.func, ast.Attribute) and node.func.attr in ('__setattr__', '__delattr__', '__setitem__', '__delitem__', 'update', 'pop', 'clear', 'setdefault'))):
                written = certified_root(node.args[0]) or (certified_root(node.func.value) if isinstance(node.func, ast.Attribute) else None)
            if written:
                errors.append({'kind': 'external_binding_write', 'path': _relative(path, root), 'line': node.lineno, 'source': ast.unparse(node),
                               'certified_as': certified[written], 'reason': 'a certified immutable binding is never written through'})
            if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load) and certified.get(node.id) in ('stdlib-module', 'literal-enum'):
                parent = parents.get(node)
                read = isinstance(parent, ast.Attribute) and parent.value is node and isinstance(parent.ctx, ast.Load) and not parent.attr.startswith('__')
                if certified[node.id] == 'literal-enum':
                    read = read or isinstance(parent, ast.Call) and parent.func is node or (
                        isinstance(parent, ast.Call) and isinstance(parent.func, ast.Name) and parent.func.id in ('isinstance', 'issubclass') and
                        len(parent.args) == 2 and parent.args[1] is node)
                if not read:
                    errors.append({'kind': 'external_binding_escape', 'path': _relative(path, root), 'line': node.lineno, 'source': ast.unparse(parent) if parent is not None else node.id,
                                   'certified_as': certified[node.id], 'reason': 'a certified module is only read as module.attribute (a literal Enum also as a call or isinstance target); aliased or passed on, it could be written through'})
                elif certified[node.id] == 'stdlib-module' and isinstance(parent, ast.Attribute) and parent.value is node:
                    # T48: what the read hands out must itself be immutable or certified, in every loaded instance
                    missing = object()
                    handed = [vars(vars(m)[node.id]).get(parent.attr, missing) for m in loaded_here]
                    kinds = [None if v is missing else _certified_module_value(v, root) for v in handed]
                    if any(k is None for k in kinds):
                        value = handed[kinds.index(None)]
                        errors.append({'kind': 'external_binding_mutable_read', 'path': _relative(path, root), 'line': node.lineno, 'source': ast.unparse(parent),
                                       'value_type': 'missing' if value is missing else type(value).__name__,
                                       'reason': 'a certified module is certified without walking it, so a value read from it must itself be immutable or certified (an immutable literal or frozenset, a builtin or standard-library function, a compiled pattern); a list, set, dict, instance or class read from it is shared mutable state across cases'})
                    else:
                        # T61: every hop of the chain, not the first only (textwrap.re._cache, re.functools.__all__,
                        # json.dumps.__globals__ each passed its first hop and reached shared state)
                        chain, top = [parent], parent
                        while isinstance(parents.get(top), ast.Attribute) and parents[top].value is top and isinstance(parents[top].ctx, ast.Load):
                            top = parents[top]
                            chain.append(top)
                        problem = _chain_problem([vars(m)[node.id] for m in loaded_here], [a.attr for a in chain], root)
                        if problem:
                            index, attr, why = problem
                            errors.append({'kind': 'external_binding_chain_read', 'path': _relative(path, root), 'line': node.lineno, 'source': ast.unparse(chain[index]),
                                           'hop': index, 'value_type': why,
                                           'reason': 'every hop of an attribute chain rooted at a certified module must itself be immutable or certified, never a module (a module handed out by a module is certified by no one here) and never a dunder (__globals__, __dict__, __closure__ and the like hand out namespaces and cells)'})
        # T48: a reset seam whose write reaches a certified binding is refused: the binding is certified without
        # walking it, so the snapshot cannot see what the reset left behind (R1b: a no-op reset over a keyword.kwlist write)
        for key, (declaration, _) in reset_allowed.items():
            if key[0] != str(path):
                continue
            try:
                seam = ast.parse(declaration.source)
            except SyntaxError:
                continue
            reached = sorted({part.id for part in ast.walk(seam) if isinstance(part, ast.Name) and part.id in certified})
            if reached:
                errors.append({'kind': 'reset_seam_certified_write', 'path': _relative(path, root), 'function': declaration.function, 'source': declaration.source,
                               'certified': {name: certified[name] for name in reached},
                               'reason': 'a reset seam may not write through a certified immutable binding: certification does not walk it, so state the reset failed to restore would be invisible'})
        # A function's implicit None return is also a possible rejecting return.
        for node in ast.walk(tree):
            if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            first = min([node.lineno] + [d.lineno for d in node.decorator_list])
            if (str(path), first, owners[node]) in predicate_keys:
                continue
            if not node.body or not isinstance(node.body[-1], (ast.Return, ast.Raise)):
                text, kind = '<implicit None return>', 'implicit_return'
                declaration = allowed.get((str(path), owners[node], kind, text))
                if declaration:
                    declaration[1] += 1
                sites.append({'id': _relative(path, root) + ':' + str(node.end_lineno) + ':implicit_return',
                              'path': _relative(path, root), 'function': owners[node], 'line': node.end_lineno,
                              'kind': kind, 'source': text, 'non_guard': bool(declaration),
                              'reason': declaration[0].reason if declaration else ''})
        # Outside predicates the default is an obligation, not "no explicit
        # raise found". No sampled fixture can waive a dormant operation.
        def obligation(node, kind, *, reset_only=False):
            text = ast.unparse(node)
            key = (str(path), owners[node], kind, text)
            declaration = (reset_allowed if reset_only else allowed).get(key)
            if declaration:
                declaration[1] += 1
            position = node if hasattr(node, 'lineno') else node.iter
            sites.append({'id': _relative(path, root) + ':' + str(position.lineno) + ':' + str(position.col_offset) + ':' + kind,
                          'path': _relative(path, root), 'function': owners[node], 'line': position.lineno,
                          'exception_span': [position.lineno, position.end_lineno, position.col_offset, position.end_col_offset],
                          'kind': kind, 'source': text, 'non_guard': bool(declaration),
                          'reason': declaration[0].reason if declaration else ''})
        def bound_function(name):
            bindings = [vars(module).get(name) for module in source_modules.get(path, [])]
            return bindings[0] if bindings and all(value is bindings[0] for value in bindings) else None
        def attribute_form(node):
            # General attribute access and descriptors are obligations.
            if isinstance(node.value, ast.Name) and node.attr == '__code__':
                if node.value.id not in local_bindings and type(bound_function(node.value.id)) is types.FunctionType:
                    return 'attribute:function-code'
                return None
            if isinstance(node.value, ast.Attribute) and node.attr == 'co_code':
                return 'attribute:code-bytes' if node.value.attr == '__code__' and attribute_form(node.value) else None
            parent = parents.get(node)
            if isinstance(parent, ast.Call) and parent.func is node and isinstance(node.value, ast.Name):
                if node.value.id == 'table' and node.attr in ('require', 'validate') and table_factory(node):
                    return 'attribute:table-callee'
                if node.value.id == 'g' and engine_alias() and node.attr in vars(sys.modules[__name__]):
                    return 'attribute:engine-callee'
            return None
        def target_names(target):
            return {part.id for part in ast.walk(target) if isinstance(part, ast.Name) and isinstance(part.ctx, ast.Store)}
        def statement_binds(statement, name):
            if isinstance(statement, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                return name == statement.name
            if isinstance(statement, (ast.Import, ast.ImportFrom)):
                return any(name == (alias.asname or (alias.name.split('.')[0] if isinstance(statement, ast.Import) else alias.name)) for alias in statement.names)
            if isinstance(statement, (ast.Assign, ast.AnnAssign)):
                return statement.value is not None and any(name in target_names(target) for target in (statement.targets if isinstance(statement, ast.Assign) else [statement.target]))
            return False
        comprehensions = (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)
        def execution_scope(node):
            """The scope whose names this node uses; None inside a lazily evaluated type-parameter or alias scope."""
            child, grandchild = node, None
            while child in parents:
                parent = parents[child]
                if isinstance(parent, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and child in parent.body:
                    return parent
                if isinstance(parent, ast.Lambda) and child is parent.body:
                    return parent
                # The first iterable alone runs in the enclosing scope.
                if isinstance(parent, comprehensions) and not (child is parent.generators[0] and grandchild is child.iter):
                    return parent
                if child in getattr(parent, 'type_params', ()) or (type(parent).__name__ == 'TypeAlias' and child is parent.value):
                    return None
                if isinstance(parent, ast.ClassDef) and getattr(parent, 'type_params', ()) and (child in parent.bases or child in parent.keywords):
                    return None
                grandchild, child = child, parent
            return tree
        scope_bindings, scope_globals, scope_nonlocals = {}, {}, {}
        for part in ast.walk(tree):
            if isinstance(part, ast.arg):
                scope_bindings.setdefault(parents[parents[part]], set()).add(part.arg)
            elif isinstance(part, ast.Global):
                scope_globals.setdefault(execution_scope(part), set()).update(part.names)
            elif isinstance(part, ast.Nonlocal):
                scope_nonlocals.setdefault(execution_scope(part), set()).update(part.names)
            elif type(part).__name__ not in ('TypeVar', 'ParamSpec', 'TypeVarTuple') and _names_bound_by(part):
                owner = execution_scope(part)
                # An assignment expression in a comprehension binds in the scope around the comprehensions.
                if isinstance(parents.get(part), ast.NamedExpr):
                    while isinstance(owner, comprehensions):
                        owner = execution_scope(owner)
                scope_bindings.setdefault(owner, set()).update(_names_bound_by(part))
        def binding_scope(scope, name):
            """Language reference 4.2.2. The scope holding this name's binding: `tree` for the global and builtin
            namespaces, None for a type-parameter scope. A class namespace is visible only to the class body itself."""
            current = scope
            while current is not tree:
                if current is None:
                    return None
                if current is scope or not isinstance(current, ast.ClassDef):
                    if name in scope_globals.get(current, ()):
                        return tree
                    if name in scope_bindings.get(current, ()) and name not in scope_nonlocals.get(current, ()):
                        return current
                if any(name in _names_bound_by(parameter) for parameter in getattr(current, 'type_params', ())):
                    return None
                current = execution_scope(current)
            return tree
        try:
            module_table = symtable.symtable(source, str(path), 'exec')
        except (SyntaxError, ValueError):
            module_table = None
        scope_tables = {tree: module_table}
        def scope_table(scope):
            """The compiler's table for a scope, or None if it has no unique table: an inlined comprehension,
            a generic definition or a same-line twin. The resolver above still decides those."""
            if scope not in scope_tables:
                outer = scope_table(execution_scope(scope))
                label = {ast.Lambda: 'lambda', ast.GeneratorExp: 'genexpr'}.get(type(scope), getattr(scope, 'name', None))
                matches = [] if outer is None or label is None or getattr(scope, 'type_params', ()) else [
                    table for table in outer.get_children() if table.get_name() == label and table.get_lineno() == scope.lineno and table.get_type() in ('function', 'class')]
                scope_tables[scope] = matches[0] if len(matches) == 1 else None
            return scope_tables[scope]
        def table_agrees(scope, name, binding):
            if module_table is None:
                return False
            table = scope_table(scope)
            if table is None:
                return True
            try:
                symbol = table.lookup(name)
            except KeyError:
                return False
            return symbol.is_global() if binding is tree else symbol.is_local() if binding is scope else symbol.is_free()
        handler_counts = {}
        for part in ast.walk(tree):
            if isinstance(part, ast.ExceptHandler) and part.name:
                handler_counts[part.name] = handler_counts.get(part.name, 0) + 1
        def dominated(node, scope):
            """A binding in `scope` runs before this read or, from a nested scope, before that scope is created."""
            name, position, nested = node.id, node, False
            while (owner := execution_scope(position)) is not scope:
                if owner is None or owner is tree:
                    return False
                position, nested = owner, True
            child = position
            while child is not scope:
                parent = parents[child]
                if parent is scope and isinstance(parent, comprehensions):
                    # Generator clauses run in order, so only the result expression is after every target.
                    return not isinstance(child, ast.comprehension) and any(name in target_names(gen.target) for gen in parent.generators)
                if isinstance(parent, (ast.For, ast.AsyncFor)) and child in parent.body and name in target_names(parent.target) and name not in handler_names:
                    return True
                # A handler target is deleted when its handler ends, so a closure may outlive it.
                if isinstance(parent, ast.ExceptHandler) and child in parent.body and parent.name == name and not nested and handler_counts[name] == 1:
                    return True
                for field in ('body', 'orelse', 'finalbody'):
                    siblings = getattr(parent, field, None)
                    if isinstance(siblings, list) and child in siblings:
                        if name not in handler_names and any(statement_binds(statement, name) for statement in siblings[:siblings.index(child)]):
                            return True
                child = parent
            if isinstance(scope, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)) and name not in handler_names:
                args = scope.args
                return name in {arg.arg for arg in [*args.posonlyargs, *args.args, *args.kwonlyargs, *([args.vararg] if args.vararg else []), *([args.kwarg] if args.kwarg else [])]}
            return False
        def annotation_read(node):
            child = node
            while child in parents and not isinstance(child, ast.stmt):
                parent = parents[child]
                if isinstance(parent, ast.arg) and child is parent.annotation:
                    return True
                if isinstance(parent, (ast.FunctionDef, ast.AsyncFunctionDef)) and child is parent.returns:
                    return True
                if isinstance(parent, ast.AnnAssign) and child is parent.annotation:
                    return True
                child = parent
            return False
        def class_private(node):
            # The compiler mangles __name under a class, so the plain spelling names a different variable.
            if not node.id.startswith('__') or node.id.endswith('__'):
                return False
            child = node
            while child in parents:
                child = parents[child]
                if isinstance(child, ast.ClassDef):
                    return True
            return False
        # Module namespace bindings, from the syntax alone. The live namespace at scan time never certifies
        # a read: a binding present now may be deleted by a dormant handler or del before a case runs.
        module_sites = {}
        for part in ast.walk(tree):
            if isinstance(part, (ast.Global, ast.Nonlocal, ast.arg)) or type(part).__name__ in ('TypeVar', 'ParamSpec', 'TypeVarTuple'):
                continue
            names = _names_bound_by(part)
            if not names:
                continue
            owner = execution_scope(part)
            if isinstance(parents.get(part), ast.NamedExpr):
                while isinstance(owner, comprehensions):
                    owner = execution_scope(owner)
            for name in names:
                if owner is not None and binding_scope(owner, name) is tree:
                    module_sites.setdefault(name, []).append(part)
        star_imported = any(isinstance(part, ast.ImportFrom) and any(alias.name == '*' for alias in part.names) for part in ast.walk(tree))
        def top_statement(node):
            while node in parents and parents[node] is not tree:
                node = parents[node]
            return node if node in parents and node in tree.body else None
        def unconditional_module_binding(part):
            """The one top-level statement that binds the name unconditionally: an assignment, an annotated assignment
            with a value, def, class or a plain import. Loops, with, handlers, match, walrus, del and augmented
            assignment are excluded."""
            if isinstance(part, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Import, ast.ImportFrom)):
                return part if part in tree.body else None
            if not isinstance(part, ast.Name) or not isinstance(part.ctx, ast.Store):
                return None
            child = part
            while isinstance(parents.get(child), (ast.Tuple, ast.List, ast.Starred)):
                child = parents[child]
            statement = parents.get(child)
            if isinstance(statement, ast.Assign) and child in statement.targets or isinstance(statement, ast.AnnAssign) and child is statement.target and statement.value is not None:
                return statement if statement in tree.body else None
            return None
        def loaded_instances():
            return source_modules.get(path, [])
        def canonical_builtins(module):
            environment = vars(module).get('__builtins__')
            return environment is builtins or environment is vars(builtins)
        def module_read_form(node):
            """A read that resolves to the module namespace (language reference 4.2.2), or None."""
            name = node.id
            if star_imported or name == '__builtins__':
                return None
            sites = module_sites.get(name, [])
            if not sites:
                modules = loaded_instances()
                # Live state only refuses here: it must agree with what the syntax says.
                if not modules or any(name in vars(module) and name not in LOADER_NAMES for module in modules):
                    return None
                if name in LOADER_NAMES:
                    loaded = all(isinstance(getattr(vars(module).get('__spec__'), 'loader', None), importlib.machinery.SourceFileLoader) and
                                 vars(module)['__spec__'].has_location for module in modules)
                    return 'expression:loader-name' if loaded else None
                certified = name in vars(builtins) and all(canonical_builtins(module) for module in modules)
                return 'expression:builtin-name' if certified else None
            if len(sites) != 1:
                return None
            statement = unconditional_module_binding(sites[0])
            container = top_statement(node)
            if statement is None or container is None:
                return None
            if tree.body.index(statement) < tree.body.index(container):
                return 'expression:module-name'
            # A recursive read in the body of an undecorated def runs only after the def has bound the name.
            if statement is container and isinstance(statement, (ast.FunctionDef, ast.AsyncFunctionDef)) and not statement.decorator_list:
                child = node
                while parents.get(child) is not statement:
                    child = parents[child]
                return 'expression:module-name' if child in statement.body else None
            return None
        def plain_class(scope):
            """Only a class with no bases, keywords, decorators or type parameters runs its body in the dict that
            type.__prepare__ returns; any other class body runs in whatever mapping its metaclass prepares."""
            return (isinstance(scope, ast.ClassDef) and not scope.bases and not scope.keywords and not scope.decorator_list and
                    not getattr(scope, 'type_params', ()) and '__build_class__' not in shadowed and builtin_is('__build_class__'))
        # PEP 563 is in force only when the future import is among the file's leading statements.
        leading = tree.body[1:] if tree.body and isinstance(tree.body[0], ast.Expr) and isinstance(tree.body[0].value, ast.Constant) and type(tree.body[0].value.value) is str else tree.body
        postponed = False
        for statement in leading:
            if not (isinstance(statement, ast.ImportFrom) and statement.module == '__future__'):
                break
            postponed = postponed or any(alias.name == 'annotations' for alias in statement.names)
        def literal_enum_statement(scope):
            """C8-U2: a top-level class statement that made a literal Enum: bases are names whose live bindings are
            one of _LITERAL_ENUM_BASES, no keywords, decorators or type parameters, a body of an optional docstring
            and distinct public `NAME = immutable literal` bindings only, and the class it bound passes _literal_enum."""
            if not (isinstance(scope, ast.ClassDef) and scope in tree.body and not scope.keywords and not scope.decorator_list and
                    not getattr(scope, 'type_params', ()) and scope.bases and all(isinstance(b, ast.Name) for b in scope.bases)):
                return False
            loaded = source_modules.get(path, [])
            if not loaded:
                return False
            body = scope.body[1:] if scope.body and isinstance(scope.body[0], ast.Expr) and isinstance(scope.body[0].value, ast.Constant) and type(scope.body[0].value.value) is str else scope.body
            names = []
            for statement in body:
                if not (isinstance(statement, ast.Assign) and len(statement.targets) == 1 and isinstance(statement.targets[0], ast.Name)):
                    return False
                name = statement.targets[0].id
                try:
                    literal = ast.literal_eval(statement.value)
                except (ValueError, TypeError, SyntaxError, MemoryError, RecursionError):
                    return False
                if name.startswith('_') or not _immutable_literal(literal):
                    return False
                names.append(name)
            if not names or len(set(names)) != len(names):
                return False
            for module in loaded:
                cls = vars(module).get(scope.name)
                bases = tuple(vars(module).get(b.id, vars(builtins).get(b.id)) for b in scope.bases)
                if not (type(cls) is enum.EnumType and bases == cls.__bases__ and bases in _LITERAL_ENUM_BASES and _literal_enum(cls, root)):
                    return False
            return True
        def hooked_class_body(node):
            scope = execution_scope(node)
            return isinstance(scope, ast.ClassDef) and not plain_class(scope) and not literal_enum_statement(scope)
        def name_read_form(node):
            name = node.id
            if name in deleted_names or class_private(node):
                return None
            # Evaluation may be deferred or absent, so only a binding that no scope can shadow certifies it.
            if annotation_read(node):
                return module_read_form(node) if name not in local_bindings else None
            scope = execution_scope(node)
            binding = None if scope is None else binding_scope(scope, name)
            if binding is None or not table_agrees(scope, name, binding):
                return None
            if binding is tree:
                return module_read_form(node)
            if dominated(node, binding):
                return 'expression:bound-name'
            # A class-body read that misses the class namespace goes to globals and builtins, never an enclosing function.
            return module_read_form(node) if binding is scope and isinstance(scope, ast.ClassDef) else None
        def name_form(node):
            # In a class body with bases, keywords, decorators or type parameters, every name operation calls the
            # prepared mapping's __getitem__, __setitem__ or __delitem__, so none is automatic.
            if hooked_class_body(node):
                return None
            if isinstance(node.ctx, ast.Load):
                return name_read_form(node)
            if isinstance(node.ctx, ast.Store):
                if literal_enum_statement(execution_scope(node)):
                    return 'binding:literal-enum-member'
                return 'binding:plain-class-name' if isinstance(execution_scope(node), ast.ClassDef) else 'binding:name'
            return ''
        def unary_form(node):
            # Certified per operator against the exact literal type; all else is an obligation.
            if not isinstance(node.operand, ast.Constant):
                return None
            literal = type(node.operand.value)
            if isinstance(node.op, ast.Not) and literal in _BUILTIN_LITERALS:
                return 'unary:not-literal'
            if isinstance(node.op, (ast.UAdd, ast.USub)) and literal in (int, float):
                return 'unary:sign-numeric-literal'
            if isinstance(node.op, ast.Invert) and literal is int:
                return 'unary:invert-int-literal'
            return None
        def total_form(node):
            """The written argument that this node cannot raise; None is an obligation.

            '' marks syntax with no operation of its own or a node another check
            already classifies as an explicit site.
            """
            if '__builtins__' in _names_bound_by(node):
                return None
            if postponed and isinstance(node, ast.expr) and annotation_read(node):
                return 'annotation:postponed'
            if isinstance(node, (ast.mod, ast.arguments, ast.arg, ast.keyword, ast.alias, ast.withitem, ast.match_case, ast.pattern,
                                 ast.expr_context, ast.boolop, ast.operator, ast.unaryop, ast.cmpop)):
                return ''
            if isinstance(node, (ast.Raise, ast.Assert, ast.Delete, ast.AugAssign, ast.Global, ast.Nonlocal, ast.Yield, ast.YieldFrom)):
                return ''
            if isinstance(node, ast.Return):
                return 'statement:return-true' if isinstance(node.value, ast.Constant) and node.value.value is True else ''
            if isinstance(node, (ast.Pass, ast.Break, ast.Continue)):
                return 'statement:control-transfer'
            if isinstance(node, ast.Expr):
                return 'statement:expression'
            if isinstance(node, ast.Try):
                return 'statement:try'
            if isinstance(node, ast.ExceptHandler):
                if node.name and hooked_class_body(node):
                    return None
                caught = [] if node.type is None else node.type.elts if isinstance(node.type, ast.Tuple) else [node.type]
                return 'statement:except-builtin' if all(isinstance(item, ast.Name) and item.id not in shadowed and builtin_is(item.id) and
                                                          isinstance(vars(builtins)[item.id], type) and issubclass(vars(builtins)[item.id], BaseException)
                                                          for item in caught) else None
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                return 'statement:executed-module-import' if not owners[node] and source_modules.get(path) else None
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and hooked_class_body(node):
                return None
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)):
                return 'definition:function'
            if isinstance(node, ast.ClassDef) and literal_enum_statement(node):
                return 'definition:literal-enum'
            if isinstance(node, (ast.Assign, ast.AnnAssign, ast.NamedExpr)):
                return ''  # the target node carries the binding or the obligation
            if isinstance(node, (ast.If, ast.IfExp)):
                return 'control:literal-test' if builtin_literal(node.test) else None
            if isinstance(node, ast.Constant):
                return 'expression:literal'
            if isinstance(node, ast.Name):
                return name_form(node)
            if isinstance(node, ast.Attribute):
                return attribute_form(node) if isinstance(node.ctx, ast.Load) else ''
            if isinstance(node, ast.Subscript):
                return None if isinstance(node.ctx, ast.Load) else ''
            if isinstance(node, ast.Compare):
                return 'expression:identity-compare' if all(isinstance(op, (ast.Is, ast.IsNot)) for op in node.ops) else None
            if isinstance(node, ast.UnaryOp):
                return unary_form(node)
            if isinstance(node, (ast.List, ast.Tuple)):
                return 'display:sequence' if isinstance(node.ctx, ast.Load) else None if isinstance(node.ctx, ast.Store) else ''
            if isinstance(node, ast.Dict):
                return 'display:dict-literal-keys' if all(key is not None and builtin_literal(key) for key in node.keys) and not mixed_text(node.keys) else None
            if isinstance(node, ast.Set):
                return 'display:set-literal-items' if all(builtin_literal(item) for item in node.elts) and not mixed_text(node.elts) else None
            if isinstance(node, (ast.ListComp, ast.GeneratorExp)):
                return 'display:comprehension-shell'
            if isinstance(node, ast.FormattedValue) and isinstance(parents.get(node), ast.JoinedStr) or isinstance(node, ast.Slice):
                return 'display:covered-by-parent'
            if isinstance(node, ast.Call):
                return None if any(keyword.arg is None for keyword in node.keywords) else call_total_form(node) or ''
            return None
        functions = [node for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))]
        function_bindings = {}
        for fn in functions:
            own = [part for part in ast.walk(fn) if owners[part] == owners[fn]]
            declared_shared = {name for part in own if isinstance(part, (ast.Global, ast.Nonlocal)) for name in part.names}
            locals_ = {a.arg for a in [*fn.args.posonlyargs, *fn.args.args, *fn.args.kwonlyargs]}
            locals_.update(part.id for part in own if isinstance(part, ast.Name) and isinstance(part.ctx, ast.Store))
            locals_.difference_update(declared_shared)
            # Unknown/free roots and aliases of them remain shared. A local
            # binding never certifies the object to which it was assigned.
            bindings_shared = declared_shared | {part.id for part in own if isinstance(part, ast.Name) and isinstance(part.ctx, ast.Load) and part.id not in locals_}
            shared = set(bindings_shared)
            for _ in range(len(own) + 1):
                prior = set(shared)
                for part in own:
                    if isinstance(part, (ast.Assign, ast.AnnAssign, ast.NamedExpr)) and part.value is not None:
                        if any(isinstance(x, ast.Name) and x.id in shared for x in ast.walk(part.value)):
                            targets = part.targets if isinstance(part, ast.Assign) else [part.target]
                            shared.update(x.id for target in targets for x in ast.walk(target) if isinstance(x, ast.Name))
                if prior == shared:
                    break
            function_bindings[owners[fn]] = (bindings_shared, shared)
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'require' and isinstance(node.func.value, ast.Name) and node.func.value.id == 'table':
                name = node.args[0] if node.args else next((kw.value for kw in node.keywords if kw.arg == 'name'), None)
                if not isinstance(name, ast.Constant) or type(name.value) is not str:
                    errors.append({'kind': 'dynamic_table_name', 'path': _relative(path, root), 'line': node.lineno})
                elif name.value not in table.guards:
                    errors.append({'kind': 'missing_table_entry', 'path': _relative(path, root), 'line': node.lineno, 'guard': name.value})
            bindings_shared, shared = function_bindings.get(owners[node], (set(), set()))
            write = isinstance(node, (ast.Global, ast.Nonlocal))
            if owners[node] and isinstance(node, (ast.Assign, ast.AnnAssign, ast.AugAssign, ast.Delete, ast.NamedExpr)):
                targets = node.targets if isinstance(node, (ast.Assign, ast.Delete)) else [node.target]
                write = any(isinstance(target, ast.Name) and target.id in bindings_shared or
                            any(isinstance(part, ast.Attribute) or isinstance(part, ast.Subscript) and
                                any(isinstance(x, ast.Name) and x.id in shared for x in ast.walk(part.value)) for part in ast.walk(target))
                            for target in targets)
            if owners[node] and isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in (
                    'append', 'extend', 'insert', 'update', 'add', 'setdefault', 'clear', 'pop', 'remove', 'discard', '__setitem__', '__setattr__'):
                write = any(isinstance(part, ast.Name) and part.id in shared for part in ast.walk(node.func.value))
            if write:
                obligation(node, 'shared_state_write', reset_only=True)
            if node in exempt:
                continue
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for decorator in node.decorator_list:
                    obligation(decorator, 'implicit_call')
            # Explicit allowlist: unknown syntax and any form without a written
            # argument cannot inherit a safe default.
            form = total_form(node)
            if form is None:
                obligation(node, 'data_operation')
            elif form:
                automatic[form] = automatic.get(form, 0) + 1
    for key, (declaration, matches) in allowed.items():
        if matches != declaration.count:
            errors.append({'kind': 'non_guard_not_exactly_one_site', 'declaration': asdict(declaration), 'matches': matches})
    for path, line, function in predicate_keys:
        if Path(path) not in files:
            errors.append({'kind': 'predicate_outside_scanned_closure', 'path': path, 'line': line})
        elif (path, line, function) not in located_predicates:
            errors.append({'kind': 'predicate_source_not_found', 'path': path, 'line': line, 'function': function})
    return {'status': 'FAIL' if errors or any(not s['non_guard'] for s in sites) else 'PASS',
            'files': sorted(files.values(), key=lambda f: f['path']), 'imports': imports,
            'sites': sites, 'errors': errors, 'predicate_functions': sorted([list(k) for k in predicate_keys]),
            'automatic_totals': {form: {'count': automatic[form], 'reason': TOTAL_FORMS[form]} for form in sorted(automatic)},
            'review': 'Every non-guard reason and each predicate body versus its declared field/predicate needs review.'}


def _state_objects(case, root):
    """Keep references, not copies. Reused mutable state fails before execution."""
    result, seen = [], set()
    def visit(obj):
        if id(obj) in seen:
            return
        seen.add(id(obj))
        if _certified_external(obj, root) is not None:
            return
        if type(obj) is enum.EnumType and _literal_enum(obj, root) or isinstance(obj, enum.Enum) and _literal_enum(type(obj), root):
            # A literal Enum is certified by value: the shared snapshot compares it before and after every run, and
            # anything beyond its literal members (an attribute written onto it) makes it uncertifiable there.
            return
        if isinstance(obj, types.ModuleType):
            source = vars(obj).get('__file__')
            if source and Path(source).resolve().is_relative_to(root) and Path(source).resolve() != Path(__file__).resolve():
                for name, value in vars(obj).items():
                    if not name.startswith('__'):
                        visit(value)
        elif type(obj) in (dict, list, set, bytearray):
            result.append(obj)
            values = list(obj.keys()) + list(obj.values()) if type(obj) is dict else list(obj)
            for value in values:
                visit(value)
        elif type(obj) in (tuple, frozenset):
            for value in obj:
                visit(value)
        elif inspect.ismethod(obj):
            visit(obj.__self__)
            visit(obj.__func__)
        elif inspect.isfunction(obj):
            source = Path(obj.__code__.co_filename).resolve()
            if source == Path(__file__).resolve():
                return
            if not source.is_relative_to(root):
                raise IsolationError('state_shared_across_cases: cannot certify external function graph: ' + obj.__qualname__)
            for cell in obj.__closure__ or ():
                try:
                    contents = cell.cell_contents
                except ValueError:
                    continue
                visit(contents)
            visit(obj.__defaults__)
            visit(obj.__kwdefaults__)
            visit(obj.__dict__)
            # Ignore empty function attribute dictionaries: source functions may
            # be shared, but stateful attributes may not be shared across cases.
            if not obj.__dict__ and result and result[-1] is obj.__dict__:
                result.pop()
            for name in obj.__code__.co_names:
                if name in obj.__globals__:
                    visit(obj.__globals__[name])
        elif isinstance(obj, type):
            if obj.__module__ == 'builtins':
                return
            if type(obj) is not type:
                raise IsolationError('state_shared_across_cases: cannot certify metaclass graph')
            module = sys.modules.get(obj.__module__)
            source = vars(module).get('__file__') if module else None
            if source and Path(source).resolve() == Path(__file__).resolve():
                return
            if not source or not Path(source).resolve().is_relative_to(root):
                raise IsolationError('state_shared_across_cases: cannot certify class graph: ' + obj.__name__)
            # Classes are themselves mutable. Their dictionaries, bases and
            # descriptors may also retain shared data independently of instances.
            result.append(obj)
            for base in obj.__bases__:
                visit(base)
            for name, value in vars(obj).items():
                if name not in ('__dict__', '__weakref__'):
                    visit(value)
        elif isinstance(obj, (types.BuiltinFunctionType, types.BuiltinMethodType)):
            receiver = obj.__self__
            if receiver is not None and not isinstance(receiver, types.ModuleType):
                visit(receiver)
        elif type(obj) in (staticmethod, classmethod):
            visit(obj.__func__)
        elif type(obj) is property:
            for fn in (obj.fget, obj.fset, obj.fdel):
                visit(fn)
        elif isinstance(obj, GuardTable):
            return
        elif isinstance(obj, _SchemaPredicate):
            return
        elif not isinstance(obj, (types.CodeType, types.MethodDescriptorType, re.Pattern)) and type(obj) not in (type(None), bool, int, float, complex, str, bytes):
            cls = type(obj)
            if type(cls) is not type or any('__getattr__' in vars(base) or base is not object and '__getattribute__' in vars(base) for base in cls.__mro__):
                raise IsolationError('state_shared_across_cases: cannot certify object access: ' + cls.__name__)
            try:
                state = object.__getattribute__(obj, '__dict__')
            except AttributeError:
                raise IsolationError('state_shared_across_cases: cannot certify reachable state: ' + cls.__name__) from None
            if type(state) is not dict or any(vars(base).get('__slots__') for base in cls.__mro__):
                raise IsolationError('state_shared_across_cases: cannot certify instance graph: ' + cls.__name__)
            result.append(obj)
            visit(state)
            visit(cls)
    result.extend([case, case.table])
    visit(case.context)
    visit(case.check)
    for predicate in _predicate_functions(case.table):
        visit(predicate)
    if case.table._schema:
        for selector in case.table._schema.selectors.values():
            visit(selector)
    return result


def _certified_snapshot(roots, root, *, identities, namespaces=True, input_roots=0):
    """Observe original objects without hooks; no copying, user equality or repr.

    Shared snapshots retain binding/alias/identity information. With identities
    off, numeric addresses go, but every alias edge stays: walking a function's
    global namespace in the same graph keeps whether a case value IS a shared
    binding. input_roots marks the leading roots that identify the input.
    namespaces=False walks one case alone; it cannot see that relation and is
    only a diagnostic. Unknown graphs are certification errors, never safe.
    """
    engine = Path(__file__).resolve()
    seen, nodes, keepalive = {}, [], []
    immutable_builtins = (len, type, isinstance, bool, str, int, float, bytes,
                          dict, list, tuple, set, frozenset, range, enumerate, zip,
                          abs, all, any, min, max, sum, id, object,
                          BaseException, Exception, ValueError, TypeError, KeyError,
                          AssertionError, RuntimeError, SystemExit)
    metadata_types = (Invariant, NonGuard, Control, Negative, Duplicate)
    def unsupported(obj, reason='reachable state'):
        raise IsolationError('state_shared_across_cases: cannot certify ' + reason + ': ' + type(obj).__name__)
    def namespace(mapping):
        # Interpreter-owned import bookkeeping is not adapter state. All other
        # bindings, including private names, are observed, even if unreferenced.
        # A namespace is one node, so a function's edge to it is an identity edge.
        if id(mapping) in seen:
            return ('ref', seen[id(mapping)])
        ignored = {'__builtins__', '__loader__', '__spec__', '__cached__'}
        index = len(nodes)
        seen[id(mapping)] = index
        nodes.append(None)
        keepalive.append(mapping)
        nodes[index] = ('namespace', id(mapping) if identities else None,
                        tuple((visit(name), visit(value)) for name, value in mapping.items() if name not in ignored))
        return ('ref', index)
    def visit(obj):
        kind = type(obj)
        if kind in (type(None), bool, int, float, complex, str, bytes):
            if id(obj) in seen:
                return ('ref', seen[id(obj)])
            index = len(nodes)
            seen[id(obj)] = index
            keepalive.append(obj)
            scalar = struct.pack('>dd', obj.real, obj.imag).hex() if kind is complex else encoded(evidence_value(obj))
            nodes.append((kind.__name__, id(obj) if identities else None, scalar))
            return ('ref', index)
        if obj is Ellipsis or obj is NotImplemented:
            return ('immutable-singleton', 'Ellipsis' if obj is Ellipsis else 'NotImplemented')
        if any(obj is value for value in immutable_builtins):
            return ('immutable-builtin', obj.__module__, obj.__name__)
        if obj is sys.modules[__name__]:
            return ('engine-module',)
        external = _certified_external(obj, root)
        if external is not None:
            return external
        if id(obj) in seen:
            return ('ref', seen[id(obj)])
        index = len(nodes)
        seen[id(obj)] = index
        nodes.append(None)
        keepalive.append(obj)
        if kind in (dict, list, tuple, set, frozenset, bytearray):
            content = (tuple((visit(k), visit(v)) for k, v in obj.items()) if kind is dict else
                       bytes(obj) if kind is bytearray else tuple(visit(v) for v in obj))
        elif kind is types.FunctionType:
            source = Path(obj.__code__.co_filename).resolve()
            if source == engine:
                content = ('engine-function', obj.__qualname__)
            else:
                if not source.is_relative_to(root):
                    unsupported(obj, 'external function graph')
                if getattr(obj, '__annotate__', None) is not None and not _postponed_annotations(obj):
                    unsupported(obj, 'lazy function annotation graph')
                content = (_function_key(obj), visit(obj.__code__), visit(obj.__defaults__),
                           visit(obj.__kwdefaults__), visit(obj.__dict__), tuple(visit(cell) for cell in obj.__closure__ or ()),
                           visit(obj.__annotations__), visit(getattr(obj, '__type_params__', ())),
                           visit(obj.__name__), visit(obj.__qualname__), visit(obj.__module__), visit(obj.__doc__),
                           namespace(obj.__globals__) if namespaces else (),
                           tuple((name, visit(obj.__builtins__[name])) for name in sorted(set(obj.__code__.co_names))
                                 if name not in obj.__globals__ and name in obj.__builtins__) if namespaces and identities else ())
        elif kind is types.MethodType:
            content = (visit(obj.__func__), visit(obj.__self__))
        elif kind is types.CellType:
            try:
                contents = obj.cell_contents
            except ValueError:
                content = ('empty-cell',)
            else:
                # Certification errors in the contents escape, including
                # IsolationError (a ValueError subclass).
                content = ('cell', visit(contents))
        elif kind is types.ModuleType:
            source = vars(obj).get('__file__')
            if not source or not Path(source).resolve().is_relative_to(root):
                unsupported(obj, 'external module graph')
            content = namespace(vars(obj))
        elif kind is types.CodeType:
            # Immutable Python code, including nested constants; never executed.
            content = (obj.co_code.hex(), visit(obj.co_consts), obj.co_names, obj.co_varnames,
                       obj.co_freevars, obj.co_cellvars, obj.co_flags, obj.co_argcount,
                       obj.co_posonlyargcount, obj.co_kwonlyargcount, obj.co_stacksize,
                       obj.co_exceptiontable.hex(), obj.co_linetable.hex(), obj.co_filename, obj.co_firstlineno,
                       obj.co_name, obj.co_qualname)
        elif kind is type:
            module = sys.modules.get(obj.__module__)
            source = vars(module).get('__file__') if type(module) is types.ModuleType else None
            if source and Path(source).resolve() == engine:
                content = ('engine-type', obj.__qualname__)
            else:
                if not source or not Path(source).resolve().is_relative_to(root):
                    unsupported(obj, 'external class graph')
                content = (obj.__qualname__, tuple(visit(base) for base in obj.__bases__),
                           tuple((name, visit(value)) for name, value in vars(obj).items()
                                 if name not in ('__dict__', '__weakref__')))
        elif kind in (staticmethod, classmethod):
            content = visit(obj.__func__)
        elif kind is property:
            content = tuple(visit(fn) for fn in (obj.fget, obj.fset, obj.fdel))
        elif kind is enum.EnumType and _literal_enum(obj, root):
            # C8-U2: a literal Enum is its name, bases and members; any other attribute makes it non-literal.
            content = ('literal-enum', obj.__module__, obj.__qualname__, tuple(base.__qualname__ for base in obj.__bases__),
                       tuple((name, visit(member)) for name, member in obj.__members__.items()))
        elif isinstance(obj, enum.Enum) and _literal_enum(kind, root):
            content = ('enum-member', visit(kind), obj._name_, visit(obj._value_))
        elif kind in metadata_types:
            content = tuple((name, visit(value)) for name, value in vars(obj).items())
        elif kind is GuardTable and not identities:
            content = (visit(_guard_metadata(obj)),
                       tuple(visit(fn) for fn in _predicate_functions(obj)),
                       tuple(visit(fn) for fn in obj._schema.selectors.values()) if obj._schema else ())
        else:
            cls = kind
            if (type(cls) is not type or any(vars(base).get('__slots__') or '__getattr__' in vars(base) or
                    base is not object and '__getattribute__' in vars(base) for base in cls.__mro__)):
                unsupported(obj, 'slotted/opaque object graph')
            module = sys.modules.get(cls.__module__)
            source = vars(module).get('__file__') if type(module) is types.ModuleType else None
            if not source or not Path(source).resolve().is_relative_to(root) or Path(source).resolve() == engine:
                unsupported(obj, 'external object graph')
            try:
                state = object.__getattribute__(obj, '__dict__')
            except AttributeError:
                unsupported(obj)
            if type(state) is not dict:
                unsupported(obj)
            content = (visit(cls), visit(state))
        nodes[index] = (kind.__name__, id(obj) if identities else None, content)
        return ('ref', index)
    references, input_nodes = [], 0
    for position, value in enumerate(roots):
        references.append(visit(value))
        if position + 1 == input_roots:
            input_nodes = len(nodes)
    snapshot = _DataSnapshot((tuple(references), tuple(nodes)), tuple(keepalive))
    snapshot.input_signature = (tuple(references[:input_roots]), tuple(nodes[:input_nodes]))
    return snapshot


# C8-U1: a module file's resolved path, once per process (resolving every loaded module's __file__ on each
# shared-state check was a quarter of an evaluation). The filesystem is assumed not to re-point a loaded module's
# file during a run, as everywhere else in the tool.
_RESOLVED_FILES = {}


def _resolved_file(filename):
    resolved = _RESOLVED_FILES.get(filename)
    if resolved is None:
        resolved = _RESOLVED_FILES[filename] = Path(filename).resolve()
    return resolved


def _adapter_roots(suite):
    root = Path(suite.repository_root).resolve()
    # Starting at the factory also includes factory-only closures and globals.
    roots = [suite.factory]
    if suite.reset:
        roots.append(suite.reset)
    paths = {(root / path).resolve() for path in suite.checker_modules}
    for module in list(sys.modules.values()):
        if type(module) is types.ModuleType:
            filename = vars(module).get('__file__')
            if filename and type(filename) is str and _resolved_file(filename) in paths:
                roots.append(module)
    return roots


def _adapter_snapshot(suite):
    return _certified_snapshot(_adapter_roots(suite), Path(suite.repository_root).resolve(), identities=True)


def _case_snapshot(suite, value, case):
    """One graph of the input, anchored shared state, context, checker and table.

    Addresses are erased, identity edges are not, so an equal value that is not
    the stable shared object fingerprints differently. Its input_signature is the
    input plus the shared state alone, which groups builds of the same input.
    """
    anchored = _adapter_roots(suite)
    return _certified_snapshot([value, *anchored, case.context, case.check, case.table], Path(suite.repository_root).resolve(),
                               identities=False, input_roots=1 + len(anchored))


def _guard_metadata(table):
    rows = []
    for guard in table.guards.values():
        predicate = guard.predicate
        source = {'engine_schema': predicate.guard.id,
                  'catalog_sha256': predicate.binding.catalog.fingerprint,
                  'selector': _function_key(predicate.binding.selectors[predicate.guard.entry_uri])} if isinstance(predicate, _SchemaPredicate) else {
            'file': _function_key(predicate)[0], 'line': _function_key(predicate)[1], 'function': predicate.__qualname__}
        rows.append({'id': guard.name, 'kind': 'schema' if isinstance(predicate, _SchemaPredicate) else 'code',
                     'invariant': asdict(guard.invariant), 'refusal_code': guard.refusal_code,
                     'predicate': source, 'predicate_count': 1, 'cut': 'schema-occurrence' if isinstance(predicate, _SchemaPredicate) else 'table-entry-always-pass'})
    return rows


class _SchemaPredicate:
    def __init__(self, binding, guard):
        self.binding, self.guard = binding, guard

    def __call__(self, value, context):
        # Preserve applicators and selectors; weaken only the OTHER supported
        # assertions. Unknown forms never reach PASS or grant any cut credit.
        view = self.binding.catalog.mutated(frozenset(self.binding.active - {self.guard.id}))
        selected = self.binding.selectors[self.guard.entry_uri](value, context)
        return None if view.validator(self.guard.entry_uri).is_valid(selected) else self.guard.refusal_code or self.guard.id


class _SchemaBinding:
    def __init__(self, catalog, selectors):
        self.catalog, self.selectors = catalog, selectors
        if set(selectors) != set(catalog.roots):
            raise IsolationError('schema selectors must bind every complete consumed root exactly once')
        self.active = {g.id for g in catalog.guards.values() if g.classification == 'guard'}
        self.view = None
        self.consumed = set()

    def bind(self, cuts):
        self.view = self.catalog.mutated(frozenset(set(cuts) & self.active))

    def validate(self, table, entry, value, context):
        if entry not in self.selectors:
            table._errors.append('undeclared schema input occurrence: ' + entry)
            raise IsolationError(table._errors[-1])
        self.consumed.add(entry)
        before = _data_snapshot(value, context)
        selected = self.selectors[entry](value, context)
        if _data_snapshot(value, context) != before:
            table._errors.append('schema selector mutated the frozen input/context')
            raise IsolationError(table._errors[-1])
        if self.view.validator(entry).is_valid(selected):
            return
        candidates = []
        for name, guard in table._entries.items():
            if isinstance(guard.predicate, _SchemaPredicate) and guard.predicate.guard.entry_uri == entry:
                if table._test(guard, value, context) is not None:
                    candidates.append(name)
        if not candidates:
            table._errors.append('schema refusal cannot be attributed to an enabled atomic guard')
            raise IsolationError(table._errors[-1])
        table._refuse(candidates[0], table.guards[candidates[0]].refusal_code)


def schema_table(catalog, selectors, guards=()):
    """Keep the reviewed SchemaCatalog inventory/cuts; expose tagged predicates.

    selectors maps each distinct schema consumer root to (complete_value,
    context) -> actual schema input. Use a fresh catalog in every Case factory.
    """
    binding = _SchemaBinding(catalog, selectors)
    rows = [Guard(g.id, g.invariant, g.refusal_code or g.id, _SchemaPredicate(binding, g))
            for g in catalog.guards.values() if g.classification == 'guard']
    table = GuardTable([*guards, *rows])
    table._schema = binding
    return table
def _fixture_copy(value, memo=None):
    """Rebuild typed fixture data without user hooks or order-changing set copies.

    Alias relationships in dict/list graphs are preserved. Code, functions,
    opaque objects and sets are not fixture data; build state in the factory.
    """
    memo = {} if memo is None else memo
    if type(value) in (type(None), bool, int, float, str, bytes):
        return value
    if id(value) in memo:
        return memo[id(value)]
    if type(value) is dict:
        result = {}
        memo[id(value)] = result
        result.update((_fixture_copy(k, memo), _fixture_copy(v, memo)) for k, v in value.items())
        return result
    if type(value) is list:
        result = []
        memo[id(value)] = result
        result.extend(_fixture_copy(v, memo) for v in value)
        return result
    if type(value) is tuple:
        result = tuple(_fixture_copy(v, memo) for v in value)
        memo[id(value)] = result
        return result
    if type(value) is bytearray:
        result = bytearray(value)
        memo[id(value)] = result
        return result
    raise IsolationError('unsupported fixture data (construct checker state in the factory): ' + type(value).__name__)


class _StaticStop(Exception):
    """T48: an unwaivable static error stops the run before any case executes."""


# Static errors that do not depend on the guard table, so a scan made before the factory first runs finds them as the
# full scan does: each marks code the engine will not execute in its own process (a write through a certified binding,
# dynamic code, the table's private state, a module it cannot resolve or scan).
STATIC_STOP_KINDS = frozenset({'dynamic_code_or_import', 'table_private_state', 'external_binding_write', 'external_binding_escape',
                               'external_binding_rebound', 'external_binding_mutable_read', 'external_binding_chain_read', 'reset_seam_certified_write', 'star_import',
                               'uncertified_import_binding', 'unscannable_module', 'unknown_statement'})


def run(suite: Suite, *, memory: MemoryGate | None = None, progress=None, demonstrate_runtime=False):
    """Serial, fresh factory for EVERY case, predicate, cut and restoration.

    An unwaivable static error stops the run before any case executes (T48). demonstrate_runtime=True is for the
    self-test's own traps only, which show the runtime defense (purity checks, untracked refusals) catching what
    the static scan also refuses: the run then goes on past static errors, still FAILs, and says so in the report.
    The adapter command line never sets it."""
    gate = memory or MemoryGate()
    report = {'version': 2, 'method': 'B: guard tables', 'suite': suite.name, 'status': 'FAIL',
              'tool_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'inventory': [], 'controls': [], 'negatives': [], 'rows': [], 'duplicates': [],
              'guard_negative_matrix': [], 'unproved_guards': [], 'masked_negatives': [],
              'failures': [], 'evaluations': 0, 'factories': 0, 'static': {}, 'runtime': [],
              'trust_decisions': ['Review predicate bodies against their one-field/one-predicate declarations.',
                                  'Review complete boundary coverage, factory reset and every non-guard reason.',
                                  'Finite matrices do not prove arbitrary predicate semantics or duplicate equivalence.']}
    def fail(kind, **facts):
        report['failures'].append({'kind': kind, **facts})
    retained = {}             # weak references where possible; strong for builtin mutable state
    signature = None
    checker_signature = None
    scanned_paths, exception_sites = set(), set()
    engine = Path(__file__).resolve()
    root = Path(suite.repository_root).resolve()
    shared_snapshot = None
    shared_certified = True
    case_snapshots, anchored_snapshots = {}, {}
    last_trace = {}             # guard-call trace of the latest full checker run
    def certify_shared(*, reset=False):
        nonlocal shared_snapshot, shared_certified
        if reset and suite.reset:
            suite.reset()
        try:
            snapshot = _adapter_snapshot(suite)
        except IsolationError as exc:
            # Still census/observe baselines for diagnostic specificity. Any
            # certification failure withholds ALL credit before matrix/cuts.
            shared_certified = False
            fail('state_shared_across_cases', error=str(exc))
            return
        report.setdefault('state_snapshots', []).append(hashlib.sha256(repr(snapshot.signature).encode()).hexdigest())
        if shared_snapshot is None:
            shared_snapshot = snapshot
        elif snapshot != shared_snapshot:
            shared_certified = False
            fail('state_shared_across_cases', error='adapter/factory bindings or reachable state changed from first run')
    def fresh(value):
        nonlocal signature, checker_signature, scanned_paths, exception_sites
        gate.check()
        certify_shared(reset=True)
        before = _data_snapshot(value)
        factory_signature = inspect.signature(suite.factory)
        try:
            factory_signature.bind(value)
            with_input = True
        except TypeError:
            factory_signature.bind()
            with_input = False
        case = suite.factory(value) if with_input else suite.factory()
        if _data_snapshot(value) != before:
            raise IsolationError('factory mutated the frozen fixture; derive state without repairing input')
        report['factories'] += 1
        if type(case) is not Case or type(case.table) is not GuardTable or not callable(case.check):
            raise IsolationError('factory must return a fresh Case(table, check, context)')
        check_key = _function_key(case.check)
        if checker_signature is None:
            checker_signature = check_key
        elif checker_signature != check_key:
            raise IsolationError('checker source changed between cases')
        meta = _guard_metadata(case.table)
        if signature is None:
            signature = meta
        elif meta != signature:
            raise IsolationError('guard table declaration changed between cases')
        if not report['static']:
            report['static'] = static_scan(suite, case.table)
            scanned_paths = {(root / f['path']).resolve() for f in report['static']['files']}
            if Path(checker_signature[0]) not in scanned_paths:
                fail('checker_outside_scanned_closure', source=list(checker_signature))
            # Every scanned module is watched: its state is anchored only when checker_modules names it.
            declared = {(root / module).resolve() for module in suite.checker_modules}
            undeclared = sorted(f['path'] for f in report['static']['files'] if (root / f['path']).resolve() not in declared)
            if undeclared:
                fail('scanned_module_not_declared', modules=undeclared,
                     error='the static scan covers repository modules that checker_modules does not name, so their state is unwatched')
            exception_sites = {(str((root / s['path']).resolve()), s['exception_operation'], tuple(s['exception_span']))
                               for s in report['static']['sites'] if s['non_guard'] and s.get('exception_operation')}
            if report['static']['status'] != 'PASS':
                fail('hidden_static_sites', sites=[s['id'] for s in report['static']['sites'] if not s['non_guard']], errors=report['static']['errors'])
            # T48 (the TOOLBATCH2 pre-check's observation): an unwaivable static error stops the run here, after the
            # factory built the table and before any case runs: a flagged write such as setattr(json, 'dumps', len)
            # never executes in the engine's process. (Before, baselines still ran to show both defenses.)
            if report['static']['errors'] and demonstrate_runtime:
                report['static_stop_waived'] = 'self-test demonstration of the runtime defense'
            elif report['static']['errors']:
                fail('static_error_stop', stage='after the factory, before any case', errors=sorted({e['kind'] for e in report['static']['errors']}))
                raise _StaticStop()
        objects = _state_objects(case, root)
        for obj in objects:
            prior = retained.get(id(obj))
            if prior is not None and (prior() is obj if isinstance(prior, weakref.ReferenceType) else prior is obj):
                raise IsolationError('state_shared_across_cases: ' + type(obj).__name__)
        for obj in objects:
            try:
                retained[id(obj)] = weakref.ref(obj)
            except TypeError:
                retained[id(obj)] = obj
        certify_shared(reset=True)
        key = repr(_certified_snapshot([value], root, identities=False, namespaces=False).signature)
        snapshot = _certified_snapshot([value, case.context, case.check, case.table], root, identities=False, namespaces=False)
        if key in case_snapshots and snapshot != case_snapshots[key]:
            fail('factory_nondeterministic', error='same input produced a different table/context/checker closure graph')
        else:
            case_snapshots.setdefault(key, snapshot)
            # Once shared state has failed, credit is already withheld and its relations cannot be certified.
            if shared_certified:
                joined = _case_snapshot(suite, value, case)
                anchored_key = repr(joined.input_signature)
                if anchored_key in anchored_snapshots and joined != anchored_snapshots[anchored_key]:
                    fail('factory_nondeterministic', error='same input changed a case value or function relation to stable shared state')
                else:
                    anchored_snapshots.setdefault(anchored_key, joined)
        gate.check()
        return case

    def observe(case, value, cuts=frozenset(), predicate=None):
        gate.check()
        certify_shared(reset=True)
        report['evaluations'] += 1
        table = case.table
        table._bind(value, case.context, cuts)
        events, exceptions = [], {}
        instructions, opnames = {}, {}
        predicates = [fn.__func__ if inspect.ismethod(fn) else fn for fn in _predicate_functions(table)]
        predicate_codes = {fn.__code__ for fn in predicates}
        path_cache = {}
        engine_name = str(engine)
        # C8-U1: a purity checkpoint is due after any instruction outside PURITY_SAFE_OPCODES, and at every
        # call, return and exception event. pending[0] carries "an instruction that may have changed the graph ran".
        pending = [True]
        def trace(frame, event, arg):
            if event == 'call' and frame.f_code in predicate_codes:
                parent = frame.f_back
                row = parent.f_locals.get('row') if parent else None
                called = row.predicate if type(row) is Guard else None
                function = called.__func__ if inspect.ismethod(called) else called
                authorized = (parent is not None and parent.f_code is GuardTable._test.__code__ and
                              parent.f_locals.get('self') is table and table._in_predicate and
                              any(function is fn for fn in predicates) and function.__code__ is frame.f_code and
                              function.__globals__ is frame.f_globals)
                if authorized and inspect.ismethod(called):
                    authorized = frame.f_locals.get(function.__code__.co_varnames[0]) is called.__self__
                if not authorized:
                    error = 'registered predicate entered outside its engine evaluation: ' + frame.f_code.co_name
                    table._errors.append(error)
                    raise IsolationError(error)
            if table._in_predicate and table._purity_before is not None:
                if event in ('opcode', 'line'):
                    if pending[0]:
                        table._check_purity(value, case.context)
                        pending[0] = False
                    if event == 'opcode':
                        names = opnames.get(frame.f_code)
                        if names is None:
                            names = opnames[frame.f_code] = {i.offset: i.opname for i in dis.get_instructions(frame.f_code)}
                        # The event comes before the instruction runs: the check after it is the next event's.
                        pending[0] = names.get(frame.f_lasti) not in PURITY_SAFE_OPCODES
                else:
                    # call, return and exception: always, and an untraced callee's work stays pending for its caller.
                    table._check_purity(value, case.context)
                frame.f_trace_opcodes = True
            filename = frame.f_code.co_filename
            if filename == engine_name:
                return None
            if filename not in path_cache:
                resolved = Path(filename).resolve()
                path_cache[filename] = resolved if resolved != engine and resolved.is_relative_to(root) else None
            path = path_cache[filename]
            if path is None:
                return None
            if event == 'call' and path not in scanned_paths:
                events.append({'kind': 'unscanned_repository_code', 'path': str(path), 'function': frame.f_code.co_name})
            if event == 'exception':
                _, exc, traceback = arg
                if not any(exc is issued for issued in table._issued):
                    if frame.f_code not in instructions:
                        instructions[frame.f_code] = list(dis.get_instructions(frame.f_code))
                    instruction = next((i for i in reversed(instructions[frame.f_code]) if i.offset <= frame.f_lasti), None)
                    position = instruction.positions if instruction else None
                    site = (str(path), instruction.opname if instruction else '',
                            (position.lineno, position.end_lineno, position.col_offset, position.end_col_offset) if position else ())
                    # The first observed origin decides. A later helper boundary
                    # cannot launder an already untracked exception. Propagation
                    # of the very same authorized object retains its disposition.
                    prior = exceptions.get(id(exc))
                    propagated = (prior is not None and prior[1] and instruction is not None and
                                  instruction.opname != 'RAISE_VARARGS' and traceback.tb_next is prior[2])
                    authorized = (site in exception_sites and (prior is None and traceback.tb_next is None or prior is not None and prior[1]))
                    exceptions[id(exc)] = (exc, propagated or authorized, traceback)
                    if not exceptions[id(exc)][1]:
                        events.append({'kind': 'untracked_exception', 'path': str(path), 'line': frame.f_lineno,
                                       'type': type(exc).__name__, 'message': str(exc)})
            return trace
        previous = sys.gettrace()
        try:
            if previous is not None:
                raise IsolationError('runtime requires an exclusive trace hook')
            sys.settrace(trace)
            if predicate is not None:
                row = table.guards[predicate]
                table._matrix_frame = sys._getframe()
                try:
                    result = table._test(row, value, case.context)
                finally:
                    table._matrix_frame = None
                got = {'passes': result is None, 'code': result or ''}
            else:
                result = case.check(value)
                if result is not True:
                    fail('untracked_rejecting_return', result_type=type(result).__name__, result=repr(result)[:200])
                    got = {'accepted': False, 'error': 'untracked rejecting return'}
                elif table._issued:
                    fail('swallowed_table_refusal', guards=[x.guard for x in table._issued])
                    got = {'accepted': False, 'error': 'swallowed table refusal'}
                else:
                    got = {'accepted': True}
        except BaseException as exc:
            if predicate is None and any(exc is issued for issued in table._issued) and len(table._issued) == 1:
                got = {'accepted': False, 'guard': exc.guard, 'code': exc.code}
            else:
                fail('untracked_refusal', type=type(exc).__name__, error=str(exc))
                got = {'accepted': False, 'error': type(exc).__name__ + ': ' + str(exc)}
        finally:
            sys.settrace(previous)
            if events:
                report['runtime'].extend(events)
                fail('runtime_untracked_site', events=events)
            if table._errors:
                fail('table_protocol_error', errors=table._errors[:])
            if table._schema and predicate is None:
                report.setdefault('schema_consumption', []).append({'evaluation': report['evaluations'],
                    'cuts': sorted(cuts), 'roots': sorted(table._schema.consumed)})
            if predicate is None:
                last_trace.clear()
                trace_store = _GUARD_TRACES[table]
                last_trace.update(calls=[[kind, name if type(name) is str else repr(name)] for kind, name in trace_store['calls']],
                                  refused_at=trace_store['refused_at'])
            table._restore()
            certify_shared(reset=True)
            gate.check()
        return got

    def evaluate(value, cuts=frozenset(), predicate=None):
        # Only fixture data is copied. Checker functions, defaults, globals,
        # closure cells, code objects and state are never cloned by this tool.
        data = _fixture_copy(value)
        # Two independently built original cases must agree before this run.
        # The per-input signature also compares each cut/restoration to baseline.
        fresh(_fixture_copy(value))
        return observe(fresh(data), data, frozenset(cuts), predicate)

    def traced(value, cuts=frozenset()):
        """One full checker run and its guard-call trace."""
        last_trace.clear()
        got = evaluate(value, cuts)
        return got, {'calls': list(last_trace.get('calls', [])), 'refused_at': last_trace.get('refused_at')}

    try:
        if type(suite) is not Suite:
            raise IsolationError('expected Method B Suite')
        if not suite.controls:
            raise IsolationError('at least one complete-path valid control is required')
        # T48: the table-independent static errors are found before the factory first runs, so checker code the
        # engine will not execute never runs in its process, the factory included.
        early = static_scan(suite, GuardTable([]))
        stops = [e for e in early['errors'] if e['kind'] in STATIC_STOP_KINDS]
        if stops and not demonstrate_runtime:
            # (the table-dependent errors an empty table produces are left out: only the stop kinds are reported)
            report['static'] = {**early, 'status': 'FAIL', 'errors': stops, 'stage': 'before the factory: table-independent errors only'}
            fail('hidden_static_sites', sites=[], errors=stops)
            fail('static_error_stop', stage='before the factory', errors=sorted({e['kind'] for e in stops}))
            raise _StaticStop()
        initial = fresh(_fixture_copy(suite.controls[0].value))
        guards = dict(initial.table.guards)
        report['inventory'] = signature
        if initial.table._schema:
            catalog = initial.table._schema.catalog
            report['schema_inventory'] = [asdict(g) for g in catalog.guards.values()]
            report['schema_bindings'] = catalog.bindings
            for guard in catalog.guards.values():
                if guard.classification in ('unclassified', 'format_sweep'):
                    fail('unclassified_schema_assertion', guard=guard.id, reason=guard.evidence)
                    report['unproved_guards'].append(guard.id)
        controls = {c.id: c for c in suite.controls}
        negatives = {n.id: n for n in suite.negatives}
        duplicates = {d.id: d for d in suite.duplicates}
        if not controls or len(controls) != len(suite.controls) or len(negatives) != len(suite.negatives) or len(duplicates) != len(suite.duplicates):
            raise IsolationError('controls, negatives and duplicates require unique IDs and a valid control')
        if set(controls) & set(negatives) or set(guards) & set(duplicates):
            raise IsolationError('case IDs and target IDs must be unambiguous')
        for control in controls.values():
            if control.boundary not in ('append', 'retry', 'retained_history', 'synthetic'):
                raise IsolationError('unknown boundary ' + control.boundary)
        membership = {}
        for duplicate in duplicates.values():
            if len(duplicate.sites) < 2 or len(set(duplicate.sites)) != len(duplicate.sites) or not duplicate.evidence.strip():
                raise IsolationError('duplicate declared without proof evidence: ' + duplicate.id)
            for name in duplicate.sites:
                if name not in guards or guards[name].invariant != duplicate.invariant or name in membership:
                    raise IsolationError('duplicate merges different fields/predicates or overlapping sets: ' + duplicate.id)
                membership[name] = duplicate.id
            if len({guards[name].refusal_code for name in duplicate.sites}) != 1:
                raise IsolationError('duplicate sites must refuse the same defect code')
        for negative in negatives.values():
            if negative.control not in controls or negative.target not in guards.keys() | duplicates.keys() or not negative.defect.strip():
                raise IsolationError('negative has a missing table guard/control/defect: ' + negative.id)
            targets = duplicates[negative.target].sites if negative.target in duplicates else (negative.target,)
            if any(guards[t].refusal_code != negative.code for t in targets):
                raise IsolationError('negative code differs from its table guard: ' + negative.id)
            if negative.target in membership:
                raise IsolationError('duplicate negatives must target their declared set')
        def expected(negative, got, cuts=frozenset()):
            names = set(duplicates[negative.target].sites) if negative.target in duplicates else {negative.target}
            return got.get('accepted') is False and got.get('guard') in names - set(cuts) and got.get('code') == negative.code and 'error' not in got
        baseline, baseline_trace = {}, {}
        for control in controls.values():
            got, baseline_trace[control.id] = traced(control.value)
            baseline[control.id] = got
            report['controls'].append({'id': control.id, 'boundary': control.boundary, 'outcome': got,
                                       'trace': baseline_trace[control.id], 'sha256': digest(control.value)})
            if got != {'accepted': True}:
                fail('control_refused', case=control.id, actual=got)
        for negative in negatives.values():
            got, baseline_trace[negative.id] = traced(negative.value)
            baseline[negative.id] = got
            report['negatives'].append({**{k: v for k, v in asdict(negative).items() if k != 'value'},
                'outcome': got, 'trace': baseline_trace[negative.id],
                'changed_paths': typed_changes(controls[negative.control].value, negative.value), 'sha256': digest(negative.value)})
            if not expected(negative, got):
                fail('wrong_baseline_guard', negative=negative.id, expected=negative.target, actual=got)
        # C8-G3: k extra uncut runs of every case. A gate that skips a guard with probability p survives the
        # observed runs with probability (1 - p) to the power of their count; the count is reported per case.
        repeats = suite.baseline_repeats
        if type(repeats) is not int or repeats < 0:
            raise IsolationError('baseline_repeats must be a non-negative int')
        observed = report['observed_runs'] = {case.id: {'uncut': 1, 'cut': 0} for case in [*controls.values(), *negatives.values()]}
        for _ in range(repeats):
            for case in [*controls.values(), *negatives.values()]:
                got, again = traced(case.value)
                observed[case.id]['uncut'] += 1
                if got != baseline[case.id] or again != baseline_trace[case.id]:
                    fail('baseline_nondeterministic', case=case.id, baseline=baseline[case.id], actual=got,
                         uncut=baseline_trace[case.id], uncut_again=again)
        if initial.table._schema:
            consumed = {entry for row in report.get('schema_consumption', []) for entry in row['roots']}
            missing = set(initial.table._schema.catalog.roots) - consumed
            if missing:
                fail('declared_schema_root_not_consumed', roots=sorted(missing))
        # Baselines still execute when the static scan fails, to demonstrate both
        # defenses. No guard receives credit after any safety/inventory failure.
        if report['failures']:
            report['unproved_guards'].extend(guards)
            return report
        for negative in negatives.values():
            own = set(duplicates[negative.target].sites) if negative.target in duplicates else {negative.target}
            for name in guards:
                got = evaluate(negative.value, predicate=name)
                cell = {'guard': name, 'negative': negative.id, **got, 'own': name in own}
                report['guard_negative_matrix'].append(cell)
                if got.get('passes') is not (name not in own):
                    fail('matrix_diagonal_pass' if name in own else 'matrix_off_diagonal_failure', guard=name, negative=negative.id, actual=got)
        # Guards must pass every control individually as well as the full path.
        for control in controls.values():
            for name in guards:
                got = evaluate(control.value, predicate=name)
                if got.get('passes') is not True:
                    fail('predicate_refuses_control', guard=name, control=control.id, actual=got)
        if report['failures']:
            report['unproved_guards'].extend(guards)
            return report

        def trace_check(label, case_id, cuts, own, cut_trace, again):
            """Causal attribution by guard-call trace (fails closed).

            The baseline and this row's restoration are two uncut runs of the case; their traces must be
            identical. If the baseline was refused by a cut guard, the cut run must repeat the baseline
            trace up to and including that refusing call: the same path reaches the cut guard and only its
            swapped result differs. Otherwise the cut changes no guard result, so the whole trace must match.
            """
            uncut = baseline_trace[case_id]
            outcome = baseline[case_id]
            reasons = []
            if again['calls'] != uncut['calls'] or again['refused_at'] != uncut['refused_at']:
                reasons.append('uncut_trace_nondeterministic')
            refused_by_cut = 'error' not in outcome and outcome.get('guard') in cuts and uncut['refused_at'] is not None
            if refused_by_cut:
                reach = uncut['refused_at']
                prefix, observed = uncut['calls'][:reach], cut_trace['calls'][:reach]
                if observed != prefix:
                    first = next((i for i, (a, b) in enumerate(zip(prefix, observed)) if a != b), len(observed))
                    reasons.append('cut_guard_not_reached' if first >= reach - 1 else 'diverged_before_cut_guard')
            elif case_id in own:
                reasons.append('baseline_not_refused_by_cut_guard')
            elif cut_trace['calls'] != uncut['calls']:
                reasons.append('unaffected_path_changed')
            # The traces themselves are in the baseline, results and restoration entries.
            check = {'case': case_id, 'own': case_id in own,
                     'compared': 'prefix_through_cut_guard' if refused_by_cut else 'whole_trace', 'reasons': reasons}
            if reasons:
                fail('noncausal_flip' if case_id in own else 'guard_trace_changed', row=label, case=case_id, reasons=reasons,
                     uncut=uncut, cut=cut_trace, uncut_again=again)
            return check

        def vector(label, cuts, own, retained_duplicate=None):
            row = {'id': label, 'cuts': sorted(cuts), 'own': sorted(own), 'flips': [], 'stays': [],
                   'masked': [], 'unrelated_changes': [], 'results': [], 'restoration': [], 'trace_checks': [], 'proved': False}
            report['rows'].append(row)
            before = len(report['failures'])
            good = bool(own) or retained_duplicate is not None
            cut_traces, restored_traces = {}, {}
            for control in controls.values():
                got, cut_traces[control.id] = traced(control.value, cuts)
                row['results'].append({'case': control.id, 'outcome': got, 'trace': cut_traces[control.id]})
                if got != baseline[control.id]:
                    good = False
                    fail('cut_breaks_control', row=label, control=control.id, actual=got)
            for negative in negatives.values():
                got, cut_traces[negative.id] = traced(negative.value, cuts)
                row['results'].append({'case': negative.id, 'outcome': got, 'trace': cut_traces[negative.id]})
                if got == {'accepted': True}:
                    row['flips'].append(negative.id)
                else:
                    row['stays'].append(negative.id)
                if negative.id in own:
                    okay = got == {'accepted': True}
                    if not okay:
                        item = {'negative': negative.id, 'actual': got}
                        row['masked'].append(item)
                        report['masked_negatives'].append(item)
                        fail('masked_negative', row=label, **item)
                else:
                    # A duplicate's tag can move to its remaining site, while
                    # preserving the exact defect code. All other tags are exact.
                    okay = (expected(negative, got, cuts) if negative.target in duplicates else got == baseline[negative.id])
                    if not okay:
                        row['unrelated_changes'].append({'negative': negative.id, 'before': baseline[negative.id], 'after': got})
                        fail('unrelated_result_changed', row=label, negative=negative.id, actual=got)
                good = good and okay
            for case in [*controls.values(), *negatives.values()]:
                report['observed_runs'][case.id]['cut'] += 1
                report['observed_runs'][case.id]['uncut'] += 1
                got, restored_traces[case.id] = traced(case.value)
                row['restoration'].append({'case': case.id, 'outcome': got, 'trace': restored_traces[case.id]})
                if got != baseline[case.id]:
                    good = False
                    fail('restoration_failed', row=label, case=case.id, actual=got)
            for case in [*controls.values(), *negatives.values()]:
                check = trace_check(label, case.id, cuts, own, cut_traces[case.id], restored_traces[case.id])
                row['trace_checks'].append(check)
                good = good and not check['reasons']
            row['complete'] = True
            row['proved'] = good and len(report['failures']) == before
            if progress:
                progress(report)
            return row
        proved = set()
        single_rows = {}
        for name in guards:
            own = {n.id for n in negatives.values() if n.target == name}
            row = vector(name, {name}, own, membership.get(name))
            single_rows[name] = row
            if row['proved'] and own:
                proved.add(name)
        for duplicate in duplicates.values():
            own = {n.id for n in negatives.values() if n.target == duplicate.id}
            proof = {**asdict(duplicate), 'per_site': [], 'proved': False}
            for name in duplicate.sites:
                # Prove each site really enforces the invariant, not just a
                # weaker third row hidden by stronger peers.
                others = set(duplicate.sites) - {name}
                remaining = vector(duplicate.id + ':only:' + name, others, set(), duplicate.id)
                proof['per_site'].append({'site': name, 'single_cut': single_rows[name]['id'], 'only_this_site': remaining['id'],
                                          'proved': single_rows[name]['proved'] and remaining['proved']})
            joint = vector(duplicate.id, set(duplicate.sites), own)
            proof['joint_cut'] = joint['id']
            proof['proved'] = bool(own) and joint['proved'] and all(s['proved'] for s in proof['per_site'])
            if proof['proved']:
                proved.update(duplicate.sites)
            else:
                fail('duplicate_unproved', duplicate=duplicate.id)
            report['duplicates'].append(proof)
        report['unproved_guards'].extend(sorted(set(guards) - proved))
        if report['unproved_guards']:
            fail('unproved_guards', guards=report['unproved_guards'])
        if not report['failures']:
            report['status'] = 'PASS'
    except _StaticStop:
        # (no case ran: every guard of the table, when the factory had built it, stays unproved)
        report['inventory'] = report['inventory'] or (signature or [])
    except BaseException as exc:
        fail('state_shared_across_cases' if 'state_shared_across_cases' in str(exc) else 'infrastructure_or_declaration', error=type(exc).__name__ + ': ' + str(exc))
    finally:
        # Per-guard credit cannot survive a failing safety check or bad matrix.
        if report['failures']:
            for row in report['rows']:
                row['proved'] = False
            for duplicate in report['duplicates']:
                duplicate['proved'] = False
        report['unproved_guards'] = sorted(set(report['unproved_guards']) | {g['id'] for g in report['inventory']
            if not any(r['id'] == g['id'] and r.get('proved') for r in report['rows']) and
               not any(g['id'] in d['sites'] and d['proved'] for d in report['duplicates'])})
    return report


def markdown(report):
    lines = ['# Guard isolation: ' + report['suite'], '', '**' + report['status'] + '** — Method B: guard tables.', '',
             f"{report['evaluations']} serial evaluations; {report['factories']} fresh factories; {len(report['unproved_guards'])} unproved guards.", '',
             'Static scan: **' + report.get('static', {}).get('status', 'NOT_RUN') + '**. Runtime untracked sites: ' + str(len(report['runtime'])) + '.', '',
             '| Guard / duplicate set | Flips | Stays refused | Proof |', '|---|---|---|---|']
    for row in report['rows']:
        lines.append('| `' + row['id'].replace('|', '&#124;') + '` | ' + ', '.join(row['flips']) + ' | ' + ', '.join(row['stays']) + ' | ' + ('proved' if row['proved'] else 'unproved') + ' |')
    checks = [c for row in report['rows'] for c in row.get('trace_checks', [])]
    lines += ['', f"Guard-call traces: {len(checks)} case comparisons across rows; {sum(bool(c['reasons']) for c in checks)} diverged "
              "(a credited flip must repeat its baseline trace through the cut guard)."]
    lines += ['', f"Guard-negative matrix: {len(report['guard_negative_matrix'])} individually executed cells.",
              'Full outcomes, exact guard tags, duplicate per-site proofs, static sites/reasons and source SHA-256 hashes are in JSON.']
    if report['failures']:
        lines += ['', 'Failures: ' + ', '.join(sorted({f['kind'] for f in report['failures']})) + '.']
    return '\n'.join(lines) + '\n'


def self_test(memory=None, *, scratch=None):
    from pm_guard_isolation_traps import exercise
    return exercise(sys.modules[__name__], memory or MemoryGate(), scratch=scratch)


def self_test_markdown(report):
    skipped = report.get('skipped', 0)
    lines = ['# Method B self-test', '', f"**{report['status']}**: {report['caught']}/{len(report['traps']) - skipped} expected observations caught"
             + (f"; {skipped} skipped because this Python cannot parse them." if skipped else '.'), '',
             '| Trap | Expected reason | Caught |', '|---|---|---|']
    for trap in report['traps']:
        lines.append(f"| {trap['id']} | {trap['expected']} | {'skipped' if trap.get('skipped') else trap['caught']} |")
    return '\n'.join(lines) + '\n'


def main(argv=None):
    sys.modules.setdefault('pm_guard_isolation', sys.modules[__name__])
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--adapter', help='Python file:factory returning Method B Suite')
    parser.add_argument('--self-test', action='store_true')
    parser.add_argument('--scratch', type=Path, help='self-test scratch parent (default: operating system temporary directory)')
    parser.add_argument('--json', type=Path)
    parser.add_argument('--markdown', type=Path)
    parser.add_argument('--max-rss', type=int, default=2048)
    parser.add_argument('--pause-when-low', type=int, default=0)
    parser.add_argument('--resume-at', type=int)
    parser.add_argument('--pause-poll', type=float, default=30)
    parser.add_argument('--low-timeout', type=float, default=2700)
    args = parser.parse_args(argv)
    if args.self_test == bool(args.adapter):
        parser.error('choose exactly one of --self-test or --adapter')
    try:
        memory = MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, args.pause_poll, args.low_timeout)
        memory.check()
        if args.self_test:
            report = self_test(memory, scratch=args.scratch)
        else:
            sys.modules.setdefault('pm_guard_isolation', sys.modules[__name__])
            path, sep, factory = args.adapter.rpartition(':')
            if not sep:
                raise IsolationError('--adapter requires file:factory')
            # T61: the adapter's source closure is scanned from its text before anything of it is imported
            stops = [e for e in prescan_sources(Path(path)) if e['kind'] in STATIC_STOP_KINDS]
            if stops:
                report = prescan_report(stops)
            else:
                spec = importlib.util.spec_from_file_location('_guard_isolation_adapter', path)
                module = importlib.util.module_from_spec(spec)
                sys.modules[spec.name] = module
                spec.loader.exec_module(module)
                report = run(getattr(module, factory)(), memory=memory)
    except BaseException as exc:
        report = {'version': 2, 'status': 'FAIL', 'failures': [{'kind': 'setup', 'error': type(exc).__name__ + ': ' + str(exc)}]}
    body = json.dumps(report, indent=2, sort_keys=True) + '\n'
    if args.json:
        args.json.write_text(body)
    else:
        print(body, end='')
    if args.markdown:
        args.markdown.write_text(markdown(report) if 'suite' in report else self_test_markdown(report) if 'traps' in report else '# FAIL\n' + body)
    return 0 if report['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(main())
