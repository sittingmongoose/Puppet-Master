"""Record guard decisions inside corpus direct calls to listed owner methods (METHOD-RULING addendum 12 point 3).

pm-ea-lead, addendum 12 point 1: "a direct call to an owner method is in a family's input space exactly when that
family's own authored corpus calls that same method directly ... Constructors and fixture builders are construction,
not input. The rule is per method, not per class." Point 3: "the collector must record guard decisions inside corpus
direct calls to the owner methods of point 1."

Before this module a guard decision was recorded only inside a registered census entry
(pm_goal_dg5_entries.entries -> pm_goal_dg5_boundaries.entry_call) while a case was current; a corpus case that
called an owner method directly decided its guards with nothing recording them.

Input: dg5_direct_calls/methods.json, the census follow-up's per-method list (census-questions/followup-1), pinned by
METHODS_SHA256. For a family that is listed and not PENDING, each method under ``owner_methods`` is wrapped, and only
those; every method under ``excluded_construction`` (constructors, factories, fixture classes) is left alone. A listed
name the written construction rules C1-C3 exclude (construction-and-owner-methods.md) is not wrapped either: it is
reported under ``construction_by_rule``, a guard kept after the census fix (final/methods.json listed three
S1CancelWorld methods because its FIXTURE_CLASS regex missed a digit; final-a16b drops them, so the guard skips
nothing on the pinned list). A name in both lists is refused at install.

A call through the wrapper is recorded (run as a DG5 complete call through bridge.entry_call, exactly as a census
entry is) only when it is a direct call in the census probe's sense (outside-probe-v5.py):
  - a case is current (bridge.CASE) and no entry is under way (bridge.ACTIVE, bridge.PARENT_CALL);
  - no owner function is on the stack under it: no calling frame belongs to an owner module
    (``owner_module``: pm_goal_dg_* or pm_goal_test_*, less *_oracles, *_cases, *_selftest, *_selftest_b2, *_crash,
    *_inspection_cases, pm_goal_test_numrule, pm_goal_test_adapters_selftest, pm_goal_test_selftest_b2).
Any other call runs the original method unchanged and unrecorded (a nested call stays nested).

The complete call needs a store to seal: the receiver's world or Storage, found as a census entry finds it, or
(for a module function or a receiver without one) the first argument that is a TestOwnerStorage or holds one. A
direct call with none of these is NOT recorded: the bridge runs every recorded call twice (a sealed child, then the
parent), and only the found store is restored between them, so a call that writes elsewhere (for example
ca3_route:workflow_world, which creates a store) would run its writes twice. Such calls run unchanged and are
counted per method under ``unsealed_calls`` (no credit either way). A wrapped method whose module is
not imported when install() runs is not wrapped (listed under ``not_loaded``); install() is idempotent and a family
source calls it after each of its entry installs.
"""
import functools
import hashlib
import importlib
import inspect
import json
from pathlib import Path
import sys

import pm_goal_dg5_boundaries as bridge

HERE = Path(__file__).resolve().parent
METHODS = HERE / 'dg5_direct_calls' / 'methods.json'
# census-questions/followup-1/final-a16b/methods.json: the census edition with FIXTURE_CLASS fixed (lead's choice after
# the S1CancelWorld finding; supersedes final/methods.json 54d88a4a, which listed three S1CancelWorld methods).
METHODS_SHA256 = '4603e2c80a54cf357bc1c361585a8364d1a324d4bbf6fe83e7a1e004f45e663a'
PENDING = frozenset()
EXCLUDE_SUFFIX = ('_oracles', '_cases', '_selftest', '_selftest_b2', '_crash', '_inspection_cases')
EXCLUDE_MODULES = ('pm_goal_test_numrule', 'pm_goal_test_adapters_selftest', 'pm_goal_test_selftest_b2')
CONSTRUCTORS = frozenset({'__init__', '__post_init__', '__new__', '__init_subclass__'})
FACTORIES = frozenset({'create', 'new', 'build', 'build_owners', 'make', 'make_world', 'seed'})
FIXTURE_CLASSES = ('World', 'Suite', 'Corpus', 'FaultPlan')
REPORTS = {}   # family -> install report
_LIST = []


def owner_module(name):
    """The census probe's owner-module rule (outside-probe-v5.owner_module)."""
    if not isinstance(name, str) or not name.startswith(('pm_goal_dg_', 'pm_goal_test_')):
        return False
    return name not in EXCLUDE_MODULES and not name.endswith(EXCLUDE_SUFFIX)


def construction(key):
    """Construction under the census rules C1-C3 (construction-and-owner-methods.md), from the name alone."""
    cls, _, name = key.rpartition('.') if '.' in key else ('', '', key.rpartition(':')[2])
    return name in CONSTRUCTORS or name in FACTORIES or \
        bool(cls) and (cls in FIXTURE_CLASSES or cls.endswith('World'))


def load():
    if not _LIST:
        raw = METHODS.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if digest != METHODS_SHA256:
            raise ValueError('dg5_direct_calls/methods.json is not the pinned list (%s, pinned %s)' % (digest, METHODS_SHA256))
        _LIST.append(json.loads(raw))
    return _LIST[0]


def _resolve(key, entry):
    """(owner, attribute name, raw attribute) for a listed key, or None when its module is not imported."""
    module = sys.modules.get(entry['module'])
    if module is None:
        return None
    if '.' in key:
        cls_name, name = key.split('.', 1)
        owner = getattr(module, cls_name, None)
        if not inspect.isclass(owner) or name not in vars(owner):
            raise ValueError('listed method %s is not defined on %s.%s' % (key, entry['module'], cls_name))
        return owner, name, vars(owner)[name]
    name = key.rpartition(':')[2]
    if not inspect.isfunction(vars(module).get(name)):
        raise ValueError('listed function %s is not a function of %s' % (key, entry['module']))
    return module, name, vars(module)[name]


def direct(frame):
    """No owner function under way between the corpus and this call (frame: the wrapper's caller)."""
    while frame is not None:
        if owner_module(frame.f_globals.get('__name__')):
            return False
        frame = frame.f_back
    return True


def _store(value):
    import pm_goal_test_storage as storage
    store_type = storage.TestOwnerStorage
    if isinstance(value, store_type):
        return value
    for attr in ('storage', 'store'):
        inner = getattr(value, attr, None)
        if isinstance(inner, store_type):
            return inner
    return None


def _world(receiver, args, kwargs):
    """(world, store root) as a census entry finds them; (None, None) when there is none."""
    import pm_goal_dg5_entries as plumbing
    if receiver is not None:
        world = getattr(receiver, 'world', None) or getattr(receiver, 'w', None)
        if world is None and hasattr(receiver, 'storage') and hasattr(receiver, 'recorder'):
            world = receiver
        if world is not None:
            try:
                return world, plumbing.world_root(world)
            except AttributeError:
                pass
        for candidate in (receiver, getattr(getattr(receiver, 'ctx', None), 'storage', None),
                          getattr(getattr(receiver, 'lower', None), 'storage', None)):
            store = _store(candidate) if candidate is not None else None
            if store is not None:
                return store, store.root
    for value in (*args, *kwargs.values()):
        store = _store(value)
        if store is not None:
            return store, store.root
    return None, None


def _wrap(family, key, owner, name, raw):
    original = raw.__func__ if isinstance(raw, (staticmethod, classmethod)) else raw
    bound_kind = 'static' if isinstance(raw, staticmethod) else 'class' if isinstance(raw, classmethod) else \
        ('function' if not inspect.isclass(owner) else 'method')

    @functools.wraps(original)
    def call(*args, **kwargs):
        if bridge.ACTIVE[0] or bridge.PARENT_CALL[0] or bridge.CASE[0] is None or not direct(sys._getframe(1)):
            return original(*args, **kwargs)
        receiver = args[0] if bound_kind in ('method', 'class') and args else None
        rest = args[1:] if receiver is not None else args
        world, root = _world(receiver if bound_kind == 'method' else None, rest, kwargs)
        if root is None:   # nothing to seal: not recorded, counted
            unsealed = REPORTS[family].setdefault('unsealed_calls', {})
            unsealed[key] = unsealed.get(key, 0) + 1
            return original(*args, **kwargs)
        case = bridge.CASE[0]
        from pm_goal_dg5_declarations import target
        label = case['id'] + '/direct/' + key
        REPORTS[family]['recorded_calls'] = REPORTS[family].get('recorded_calls', 0) + 1
        return bridge.entry_call(case, label, family, lambda: original(*args, **kwargs), root, world=world,
                                 arguments=dict(receiver=receiver, args=rest, kwargs=kwargs), original=original,
                                 target=target(case, bridge.target_rows(case.get('expected')), label))
    call._dg5_direct = True
    call._dg5_direct_key = key
    call._dg5_direct_family = family
    wrapped = staticmethod(call) if bound_kind == 'static' else classmethod(call) if bound_kind == 'class' else call
    setattr(owner, name, wrapped)


def install(family, evidence=None):
    """Wrap the family's listed direct-call owner methods whose modules are loaded; return the install report."""
    listing = load()
    report = REPORTS.setdefault(family, dict(methods_sha256=METHODS_SHA256, family=family, wrapped=[], entries=[],
                                             not_loaded=[], construction_by_rule=[], pending=family in PENDING,
                                             recorded_calls=0))
    if evidence is not None:
        evidence['direct_calls'] = report
    if family in PENDING or family not in listing:
        report['pending'] = True
        return report
    section = listing[family]
    excluded = set(section.get('excluded_construction') or ())
    overlap = sorted(excluded & set(section['owner_methods']))
    if overlap:
        raise ValueError('%s: listed owner methods that are construction: %s' % (family, overlap))
    report['construction_by_rule'] = sorted(key for key in section['owner_methods'] if construction(key))
    done = set(report['wrapped']) | set(report['entries'])
    report['not_loaded'] = []
    for key, entry in sorted(section['owner_methods'].items()):
        if key in done or key in report['construction_by_rule']:
            continue
        resolved = _resolve(key, entry)
        if resolved is None:
            report['not_loaded'].append(key)
            continue
        owner, name, raw = resolved
        function = raw.__func__ if isinstance(raw, (staticmethod, classmethod)) else raw
        if getattr(function, '_dg5_entry', False):
            report['entries'].append(key)        # already a census entry: recorded as one
            continue
        if getattr(function, '_dg5_direct', False):
            if function._dg5_direct_family != family:   # one family per process; never record under another's
                raise ValueError('%s is already wrapped for %s' % (key, function._dg5_direct_family))
            report['wrapped'].append(key)
            continue
        _wrap(family, key, owner, name, raw)
        report['wrapped'].append(key)
    return report
