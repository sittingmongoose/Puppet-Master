"""Owner in-memory state digests for DG5's COVERED_LATER judge.

Rulings (pm-ea-lead): 1121112536-0b66 (2) and (3), 1121115610-7650. A refused cut
trial is COVERED_LATER only when its after-state equals the intact trial's: the
store digest and a digest of the owners' in-memory state. This module is the
second half. A family with no hook here has no owner digest, and the judge then
gives CANNOT_DECIDE, never COVERED_LATER.

What a hook digests (every family, `digest`)
--------------------------------------------
After the complete call returns or refuses, inside the trial's own process, the
hook walks, in this order:

1. the world object the call was bound to (the bridge's `world`: a family
   world, a Storage, or the receiver's world) and everything reachable from it;
2. the bound call arguments (receiver, args, kwargs) and everything reachable
   from them, because a receiver can hold owner state the world does not;
3. the module globals of every loaded owner module (`OWNER_MODULE_PREFIXES`,
   less the harness modules in `HARNESS_MODULE_PATTERNS`), and the class
   attributes of every class those modules define (load-once `_instance`
   singletons, class-level registries and caches).

Everything reachable is digested: issued originals and receipts (`_originals`,
`_handles`, `_sequence`), reservations, custody, cells, indexes, caches and
their counters, withdrawn sets, fences, segment state, every counter and
generation. Object identity is replaced by first-visit order, so two runs that
build equal state digest equal even though `id()` differs; aliasing (two names
for one object) is part of the digest. Dict and list order is kept; set
elements are digested one by one and sorted; object attributes are sorted by
name. Weak maps are digested by their live items.

What a hook excludes, and why (the only exclusions)
---------------------------------------------------
* Clocks (ruling 1121112536-0b66 (2): a clock tick is harness-only, not an
  owner effect): `CLOCK_ATTRIBUTES` below, the clock field of each clock object
  and nothing else of that object.
* Harness-only state: `HARNESS_ATTRIBUTES` (the test method recorder's call
  log, which only test oracles read), harness modules (the DG5 bridge, the
  collector, the gated tables, test suites and oracles; `HARNESS_MODULE_PATTERNS`).
* Values that cannot hold owner state, digested by name only, never skipped
  silently: modules, classes (their attributes are walked under 3. when an
  owner module defines them), code and functions (closures and defaults are
  walked), schema-library objects (jsonschema/referencing/rpds: immutable
  validators and registries, already bound by the sealed call input),
  interpreter objects (frames, tracebacks, generators, locks, files). Every
  such value is counted by type in `opaque`, so an inventory shows each one.
* `functools.lru_cache` wrappers: memo of a pure function (counted in `opaque`
  as `memo`). Listed for the reviewer; no owner here keeps state in one.

A walk that meets a value it cannot classify does not guess: the digest is None
with the reason, and the judge gives CANNOT_DECIDE.
"""
from __future__ import annotations

import collections
import functools
import hashlib
import re
import sys
import types
import weakref
from pathlib import PurePath

SCHEMA = 'dg5-owner-state-v1'

OWNER_MODULE_PREFIXES = ('pm_goal_dg_', 'pm_goal_test_', 'pm_goal_own_')
# Test suites, case tables and oracles drive the owners; they are not owners.
HARNESS_MODULE_PATTERNS = (r'_oracles$', r'_cases$', r'_selftest$', r'^pm_goal_test_numrule$')
LIBRARY_PREFIXES = ('jsonschema', 'referencing', 'rpds')

# (module, class) -> {attribute: reason}; matched on every class of the value's MRO.
CLOCK_ATTRIBUTES = {
    ('pm_goal_test_storage', 'TestOwnerStorage'): {
        'clock_last_ms': 'Storage clock tick (ruling 1121112536-0b66 (2): harness-only, not an owner effect)'},
    ('pm_goal_dg_ca_owners', 'Clock'): {
        'last': "CA owner clock's last millisecond (each WorldOwner.clock)"},
    ('pm_goal_dg_r_world', 'Clock'): {
        'ms': "DG-R world clock's last millisecond (world.clock)"},
}
HARNESS_ATTRIBUTES = {
    ('pm_goal_test_owner_adapters', 'MethodRecorder'): {
        'calls': 'test recorder call log, read only by test oracles (assert_order/sequence)',
        '_stack': 'test recorder open-call stack (empty between calls)'},
}

_OPAQUE_TYPES = (types.FrameType, types.TracebackType, types.GeneratorType, types.CoroutineType,
                 types.AsyncGeneratorType, types.CodeType, types.CellType)
_BUILTIN_CALLABLES = ('method-wrapper', 'wrapper_descriptor', 'method_descriptor', 'builtin_function_or_method',
                      'classmethod_descriptor', 'getset_descriptor', 'member_descriptor')


class Unclassified(Exception):
    """A value the walk cannot digest; the hook reports no digest (CANNOT_DECIDE)."""


def _harness_module(name):
    return any(re.search(pattern, name) for pattern in HARNESS_MODULE_PATTERNS)


def owner_modules():
    out = []
    for name, module in sorted(sys.modules.items()):
        if module is None or not name.startswith(OWNER_MODULE_PREFIXES) or _harness_module(name):
            continue
        out.append((name, module))
    return out


class Walk:
    """One canonical digest of a value graph (identity by first-visit order)."""

    def __init__(self, hook, inventory=None):
        self.hook = hook
        self.sha = hashlib.sha256()
        self.memo = {}
        self.pinned = []
        self.objects = 0
        self.opaque = collections.Counter()
        self.excluded = collections.Counter()
        self.inventory = inventory  # None, or {class: {'digested': set, 'excluded': set}}

    def put(self, *parts):
        self.sha.update(repr(parts).encode())
        self.sha.update(b'\x00')

    def sub(self, value):
        """Digest of one set element, in a walk of its own (sets have no order)."""
        walk = Walk(self.hook, self.inventory)
        walk.run([('element', value)])
        self.opaque.update(walk.opaque)
        self.excluded.update(walk.excluded)
        self.objects += walk.objects
        return walk.sha.hexdigest()

    def run(self, roots):
        stack = []
        for label, value in reversed(roots):
            stack.append(('v', value))
            stack.append(('t', ('root', label)))
        while stack:
            kind, item = stack.pop()
            if kind == 't':
                self.put(*item)
            else:
                self.visit(item, stack)
        return self.sha.hexdigest()

    def _exclusions(self, value):
        out = {}
        for klass in type(value).__mro__:
            key = (klass.__module__, klass.__qualname__)
            out.update(self.hook.clock.get(key, {}))
            out.update(self.hook.harness.get(key, {}))
        return out

    def _push(self, stack, children):
        for child in reversed(children):
            stack.append(child)

    def visit(self, value, stack):  # noqa: C901 - one rule per kind
        kind = type(value)
        if value is None or kind is bool:
            self.put('c', value)
            return
        if kind is int:
            self.put('i', hex(value))
            return
        if kind is float:
            self.put('f', value.hex())
            return
        if kind is complex:
            self.put('z', value.real.hex(), value.imag.hex())
            return
        if kind is str:
            self.put('s', value)
            return
        if kind is bytes:
            self.put('b', len(value), hashlib.sha256(value).hexdigest())
            return
        if isinstance(value, PurePath):
            self.put('p', kind.__name__, str(value))
            return
        ident = id(value)
        if ident in self.memo:
            self.put('r', self.memo[ident])
            return
        self.memo[ident] = len(self.memo)
        self.pinned.append(value)
        self.objects += 1
        module = getattr(kind, '__module__', '') or ''
        name = kind.__qualname__
        if kind is object:
            self.put('sentinel')  # an identity-only marker: no state beyond which object it is
            return
        if isinstance(value, types.ModuleType):
            self.put('module', value.__name__)
            return
        if isinstance(value, type):
            self.put('class', value.__module__, value.__qualname__)
            return
        if isinstance(value, (types.FunctionType, types.LambdaType)):
            code = value.__code__
            self.put('fn', value.__module__, value.__qualname__, code.co_filename, code.co_firstlineno)
            cells = []
            for cell in value.__closure__ or ():
                try:
                    cells.append(cell.cell_contents)
                except ValueError:
                    cells.append(('empty-cell',))
            self._push(stack, [('t', ('closure', len(cells)))] + [('v', c) for c in cells]
                       + [('t', ('defaults',)), ('v', value.__defaults__), ('t', ('kwdefaults',)),
                          ('v', value.__kwdefaults__)])
            return
        if isinstance(value, types.MethodType):
            self.put('method')
            self._push(stack, [('v', value.__func__), ('v', value.__self__)])
            return
        if name in _BUILTIN_CALLABLES or isinstance(value, types.BuiltinFunctionType):
            self.put('builtin', getattr(value, '__module__', None), getattr(value, '__qualname__', name))
            return
        if isinstance(value, functools.partial):
            self.put('partial')
            self._push(stack, [('v', value.func), ('v', value.args), ('v', value.keywords)])
            return
        if name == '_lru_cache_wrapper':
            self.put('memo', getattr(value, '__module__', None), getattr(value, '__qualname__', None))
            self.opaque['memo:' + str(getattr(value, '__qualname__', name))] += 1
            return
        if isinstance(value, (staticmethod, classmethod, property)):
            self.put('descriptor', name)
            self._push(stack, [('v', getattr(value, '__func__', None) or getattr(value, 'fget', None))])
            return
        if module.startswith(LIBRARY_PREFIXES):
            self.put('lib', module, name)
            self.opaque['lib:' + module.split('.')[0]] += 1
            return
        if isinstance(value, _OPAQUE_TYPES) or module in ('_thread', 'threading', '_io', 'io', 'socket', 'mmap', 'select'):
            self.put('opaque', module, name)
            self.opaque['interp:' + module + '.' + name] += 1
            return
        if isinstance(value, weakref.ref):
            self.put('weakref')
            self._push(stack, [('v', value())])
            return
        if isinstance(value, (weakref.WeakKeyDictionary, weakref.WeakValueDictionary)):
            items = list(value.items())
            self.put('weakmap', name, len(items))
            self._push(stack, [('v', x) for pair in items for x in pair])
            return
        if isinstance(value, weakref.WeakSet):
            digests = sorted(self.sub(x) for x in list(value))
            self.put('weakset', digests)
            return
        if isinstance(value, dict):
            items = list(value.items())
            self.put('d', module, name, len(items))
            children = [('v', x) for pair in items for x in pair]
            if isinstance(value, collections.defaultdict):
                children.append(('v', value.default_factory))
            extra = getattr(value, '__dict__', None)
            if extra:
                children.append(('v', dict(extra)))
            self._push(stack, children)
            return
        if isinstance(value, types.MappingProxyType):
            items = list(value.items())
            self.put('proxy', len(items))
            self._push(stack, [('v', x) for pair in items for x in pair])
            return
        if isinstance(value, (list, tuple, collections.deque)):
            self.put('l', module, name, len(value))
            children = [('v', x) for x in value]
            extra = getattr(value, '__dict__', None)
            if extra:
                children.append(('v', dict(extra)))
            self._push(stack, children)
            return
        if isinstance(value, (set, frozenset)):
            self.put('set', module, name, sorted(self.sub(x) for x in value))
            return
        if isinstance(value, bytearray):
            self.put('ba', len(value), hashlib.sha256(bytes(value)).hexdigest())
            return
        if isinstance(value, memoryview):
            self.put('mv', hashlib.sha256(value.tobytes()).hexdigest())
            return
        if isinstance(value, BaseException):
            self.put('exc', module, name)
            self._push(stack, [('v', value.args), ('v', dict(getattr(value, '__dict__', {})))])
            return
        attributes = {}
        has_dict = hasattr(value, '__dict__')
        if has_dict:
            try:
                attributes.update(vars(value))
            except TypeError:
                has_dict = False
        slots = []
        for klass in kind.__mro__:
            declared = klass.__dict__.get('__slots__', ())
            slots.extend((declared,) if isinstance(declared, str) else declared)
        missing = object()
        for slot in slots:
            if slot in ('__weakref__', '__dict__'):
                continue
            item = getattr(value, slot, missing)
            if item is not missing:
                attributes.setdefault(slot, item)
        if not has_dict and not slots:
            if isinstance(value, (int, str, bytes, float)):  # a subclass of a primitive
                self.put('prim', module, name, repr(value))
                return
            raise Unclassified(f'{module}.{name}')
        skip = self._exclusions(value)
        self.put('o', module, name, len(attributes))
        record = None
        if self.inventory is not None:
            record = self.inventory.setdefault(module + '.' + name, dict(digested=set(), excluded=set()))
        children = []
        for key in sorted(attributes, key=str):
            if key in skip:
                children.append(('t', ('x', key)))
                self.excluded[module + '.' + name + '.' + key] += 1
                if record is not None:
                    record['excluded'].add(key)
                continue
            if record is not None:
                record['digested'].add(key)
            children.append(('t', ('a', key)))
            children.append(('v', attributes[key]))
        self._push(stack, children)


class Hook:
    """One family's owner digest: what it walks and what it leaves out, by name."""

    def __init__(self, family, worlds, *, clock=None, harness=None, note=''):
        self.family = family
        self.worlds = worlds  # the world classes this family's calls bind (documentation and inventory)
        self.clock = dict(CLOCK_ATTRIBUTES if clock is None else clock)
        self.harness = dict(HARNESS_ATTRIBUTES if harness is None else harness)
        self.note = note

    def roots(self, world, arguments):
        roots = [('world', world), ('arguments', arguments)]
        for name, module in owner_modules():
            for key, item in sorted(vars(module).items()):
                if key.startswith('__') or isinstance(item, types.ModuleType):
                    continue
                if isinstance(item, type):
                    if item.__module__ != name:
                        continue  # walked under the module that defines it
                    state = {k: v for k, v in sorted(vars(item).items())
                             if not k.startswith('__') and not isinstance(v, (types.FunctionType, staticmethod,
                                                                                classmethod, property))
                             and type(v).__name__ not in _BUILTIN_CALLABLES}
                    roots.append(('class:' + name + '.' + key, state))
                    continue
                if isinstance(item, (types.FunctionType, types.BuiltinFunctionType)) or callable(item) and \
                        type(item).__name__ in ('_lru_cache_wrapper',):
                    continue  # module code; a function's closure is walked where a world holds it
                roots.append(('global:' + name + '.' + key, item))
        return roots

    def digest(self, world, arguments, inventory=None):
        walk = Walk(self, inventory)
        try:
            sha = walk.run(self.roots(world, arguments))
        except Unclassified as error:
            return dict(schema=SCHEMA, hook=self.family, sha256=None, reason='unclassified value ' + str(error))
        except RecursionError:
            return dict(schema=SCHEMA, hook=self.family, sha256=None, reason='walk recursion limit')
        return dict(schema=SCHEMA, hook=self.family, sha256=sha, objects=walk.objects,
                    excluded=dict(sorted(walk.excluded.items())), opaque=dict(sorted(walk.opaque.items())))


HOOKS = {
    'goal.cancelled': Hook('goal.cancelled', (
        'pm_goal_dg_ca_owners.World', 'pm_goal_dg_cb_owners.MigrationWorld', 'pm_goal_test_storage.TestOwnerStorage'),
        note='CA, CA3 and CB worlds: Storage, owner registry, every WorldOwner (originals, handles, sequence, '
             'withdrawn), SIR, bindings, association inventories, codec/roots via Shared.'),
    'goal_run.started': Hook('goal_run.started', (
        'pm_goal_dg_s_start.StartWorld', 'pm_goal_test_storage.TestOwnerStorage'),
        note='DG-S: StartWorld context, issuance owners (ctx-bound), D01 custody, readers, projector, Storage.'),
    'shared-adapter': Hook('shared-adapter', ('pm_goal_test_storage.TestOwnerStorage',),
                           note='Shared adapter self-test: one TestOwnerStorage per case, its AppendOwner and registry.'),
    'goal_run.certified': Hook('goal_run.certified', (
        'pm_goal_dg_cf1_world.World', 'pm_goal_dg_cf2_world.World', 'pm_goal_dg_cf3_world.World',
        'pm_goal_test_storage.TestOwnerStorage'),
        note='CF1/CF2/CF3 worlds: Storage subclasses (TX_ISSUANCE rows, tx handles), coordinators, producers, '
             'consumers, projectors.'),
    'goal_run.cancelled': Hook('goal_run.cancelled', (
        'pm_goal_dg_r_world.CancelWorld', 'pm_goal_dg_int_old.World', 'pm_goal_dg_int_cancel.CancelWorld',
        'pm_goal_own_c3_w12b_migration.MigrationBoundary'),
        note='DG-R / DG-INT cancellation worlds and the W12B migration boundary (Method B harness), including '
             'the int schema cache (success entries, hits, misses).'),
}


def owner_state_digest(family, world, arguments=None, inventory=None):
    """The family hook's digest of the owners' in-memory state, or sha256 None with the reason."""
    hook = HOOKS.get(family)
    if hook is None:
        return dict(schema=SCHEMA, hook=None, sha256=None, reason='no owner-state hook for family ' + repr(family))
    if world is None:
        return dict(schema=SCHEMA, hook=family, sha256=None, reason='the call has no bound world')
    return hook.digest(world, arguments, inventory)
