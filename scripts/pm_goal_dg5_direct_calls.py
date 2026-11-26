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
S1CancelWorld methods because its FIXTURE_CLASS regex missed a digit; final-a16b drops them and final-a19 keeps them
out, so the guard skips nothing on the pinned list). A name in both lists is refused at install. Round 2 C7: a
whole-root schema bank's ``validate`` (bridge.SCHEMA_BANKS) is likewise never wrapped (``schema_by_rule``): its
decision is the bridge's schema-row decide outside any recorded direct trial, so recording it would credit a
decision the recorded run does not contain.

A call through the wrapper is recorded (run as a DG5 complete call through bridge.entry_call, exactly as a census
entry is) only when it is a direct call in the census probe's sense (outside-probe-v5.py):
  - a case is current (bridge.CASE) and no entry is under way (bridge.ACTIVE, bridge.PARENT_CALL);
  - no owner function is on the stack under it: no calling frame belongs to an owner module
    (``owner_module``: pm_goal_dg_* or pm_goal_test_*, less *_oracles, *_cases, *_selftest, *_selftest_b2, *_crash,
    *_inspection_cases, pm_goal_test_numrule, pm_goal_test_adapters_selftest, pm_goal_test_selftest_b2).
  - addendum 10 fix 1 (review REAL 1): no frame between the case body and the call is construction (a constructor
    or factory by name, or a function of a fixture class), whatever its module (``direct``); such calls are counted
    under ``construction_calls``.
Any other call runs the original method unchanged and unrecorded (a nested call stays nested).

Round 2 (lead ruling 1124101552-8f55, items C1-C7; regression pm_goal_dg5_direct_calls_r2_selftest.py): case
wrappers come from the explicit CASE_WRAPPERS list (C1); a runner's own verdict reads are harness and never
record (C2, ``harness_calls``), including a registered runner frame with no case wrapper on the stack
(RUNNER_FRAMES: CF1 run()'s post-case refusal read); construction matches a frame's own function, so an action
returned by a factory-named generator records (C4); and a recorded direct call's parent run is the corpus
execution, so registered entries nested in it still record as entries (C5, bridge DIRECT_PARENT) — wrapping a
composite listed method must not swallow the entries (and corpus slots) inside it.

Round C8 (lead ruling 1126000814-88f1; regression pm_goal_dg5_direct_calls_c8_selftest.py): recording a direct
call never writes through to the bridge's descriptor memos (FROZEN/MEMBERS/CASE_BANKS — the state the
load_once_singleton_changed and schema_bank_changed_within_case gates verify). entry_call's descriptor walks
memoize whatever mutable per-case objects they reach: an instance held as a class attribute (a per-case world,
RW.World.CURRENT = self) freezes as a load-once singleton and then drifts with the case's own continued
execution, and a schema bank bound before that freeze digests differently at the settle recompute once MEMBERS
holds the bank's internals — under ON both gates failed R5/positive/off_run_rows_validated_then_noop for a
reason that cannot occur with the collector off, where no walk ever reaches those graphs. Every recorded call
now runs entry_call under a snapshot of the memos, restored at the start of the parent run (the corpus's own
execution and the registered entries nested in it bind against the same clean memos as OFF) and after
entry_call when no parent run was reached; the descriptor itself is still computed and sealed in full.

The complete call needs a store to seal: the receiver's world or Storage, found as a census entry finds it, or
(for a module function or a receiver without one) the first argument that is a TestOwnerStorage or holds one. The
bridge runs every recorded call twice (a sealed child, then the parent) and restores only that root between them, so:
  - addendum 10 fix 2 (review REAL 2): a call that can reach a store outside that root (as CF06-P03's
    build_context reaches the case's goal-db beside its storage), or whose reach walk is too large to finish, is not
    recorded; it is counted under ``unsealable_calls``;
  - round 2 C3 (lead ruling 1124101552-8f55): the same holds for a reachable filesystem path into a tree disjoint
    from that root (as BackupOwner.take's destination beside the sealed storage); such a call is refused, never
    sealed-and-restored (the bridge restores exactly one root). Paths inside the root or containing it are fine;
  - a call with no store to seal (the lead's addendum 19 point 4: no declared purity list) is recorded only when it
    is mechanically shown to leave nothing behind: the owner-state digest (pm_goal_dg5_owner_state, the family's
    hook) and the visible store digests are equal before and after, in both the child and the parent run, and both
    runs give the same result or the same refusal (``_no_store``). Otherwise it runs unrecorded and is counted under
    ``unsealed_calls``, with its reason under ``no_store_reasons``; recorded ones are listed under
    ``no_store_recorded``. A family with no owner-state hook (goal.updated) records none, and a call that reaches a
    filesystem path is not probed. A wrapped method whose module is
not imported when install() runs is not wrapped (listed under ``not_loaded``); install() is idempotent and a family
source calls it after each of its entry installs.
"""
import functools
import types
import hashlib
import importlib
import inspect
import json
import os
from pathlib import Path
import pickle
import sys
import tempfile
import time

import pm_goal_dg5_boundaries as bridge

HERE = Path(__file__).resolve().parent
METHODS = HERE / 'dg5_direct_calls' / 'methods.json'
# census-questions/followup-1/final-a19/methods.json: supersedes final-a16b 4603e2c8 (a18 rebuilt the classification on
# the a18 census edition and a19 fixes the probe's stale-case attribution, which packet 3 caught: CF1's demo wrapper
# clears CASE[0] under a functools.wraps hook, so test_demo_cf01:run was credited to CF1/altered_retry). The recheck
# CENSUS-PACKET-4-neon passes A and C with 0 REAL findings.
# C4I census correction, 2026-11-23 (METHOD-RULING addendum 12 point 3; dg5 C4I-census, widened by lead
# 1123220854): final-a19 omitted WorkflowCancel.issue_assignment_audit from goal.cancelled.owner_methods. The owner
# corpus calls it directly — C4I (pm_goal_dg_ca3_inspection_cases.py:158/194/204/213/222/231) and C3
# (pm_goal_dg_ca3_cases.py:44/92/244/522/528) — but the probe classified the call as an override of the registered
# entry AssignedCancel.issue_assignment_audit (outside-probe-v7.py:419-421) and a18.py:234-236 reads only per-case
# direct maps, so the row and its sites never reached owner_methods. The row is added by hand in the file's own
# format (both groups' sites, counts from the ca-C3-* and ca-C4I probe runs; decided_rows is the census field, the
# 125 guard rows the probe decided inside those calls, derived with a18.py's own load() — see
# dg5_direct_calls/README.md and c4i-census/DERIVATION-decided_rows.txt); nothing else changes. The regression is
# pm_goal_dg5_direct_calls_c4i_selftest.py.
METHODS_SHA256 = 'f184ebb2f8aa2df8c118246f2a2d66485bebc83299900786ffb78da4aadf1806'
PENDING = frozenset()
EXCLUDE_SUFFIX = ('_oracles', '_cases', '_selftest', '_selftest_b2', '_crash', '_inspection_cases')
EXCLUDE_MODULES = ('pm_goal_test_numrule', 'pm_goal_test_adapters_selftest', 'pm_goal_test_selftest_b2')
CONSTRUCTORS = frozenset({'__init__', '__post_init__', '__new__', '__init_subclass__'})
FACTORIES = frozenset({'create', 'new', 'build', 'build_owners', 'make', 'make_world', 'seed'})
FIXTURE_CLASSES = ('World', 'Suite', 'Corpus', 'FaultPlan')
REPORTS = {}   # family -> install report
REACH_LIMIT = 5_000_000   # objects; a walk that reaches it is truncated, and a truncated walk refuses (fail closed)
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


def construction_frame(code):
    """A frame of construction, whatever its module (addendum 10, review REAL 1): the frame's OWN function is a
    constructor or factory by name (C1/C2), or a direct method of a fixture class (C3: World, *World, Suite,
    Corpus, FaultPlan).

    Round 2 C4 (lead ruling 1124101552-8f55; deep review NEW-1): match the frame's own function, not every name
    in its qualified name. An action lambda DEFINED inside a factory-named generator (cb_case's make, DG-U's
    _req_neg.make) and run by the case after the generator returned has only the lambda frame on the stack, so
    it is the case's action, not construction; a call made while the generator itself runs still has the
    generator's own frame on the stack and is refused by that frame."""
    if code.co_name in CONSTRUCTORS or code.co_name in FACTORIES:
        return True
    parts = code.co_qualname.split('.')
    if len(parts) >= 2 and parts[-1] == code.co_name:
        owner = parts[-2]
        return owner in FIXTURE_CLASSES or (owner.endswith('World') and owner[:1].isupper())
    return False


# Round 2 C1 (lead ruling 1124101552-8f55; both deep readers): the case wrappers that set bridge.CASE around a
# case runner, as an explicit (module, qualified name) list — never a module prefix. At the base any
# pm_goal_dg5_* frame became the boundary, so step_case.<locals>.make inside pm_goal_dg5_adapter (which holds
# supplement case BODIES as well as the wrapper install) was itself the boundary and its LifecycleReducer.initial
# calls recorded unchecked. The list is every bridge.CASE setter in the six family bridges and the entries
# plumbing (grep CASE[0] = over scripts/pm_goal_dg5_*.py; each pair verified live by __globals__/co_qualname):
CASE_WRAPPERS = {
    ('pm_goal_dg5_adapter', 'install.<locals>.bind.<locals>.call'),   # adapter Suite positive/negative
    ('pm_goal_dg5_ca', 'cases.<locals>.bind.<locals>.call'),          # CA Suite positive/negative
    ('pm_goal_dg5_cf', 'install_cf1.<locals>.run_path'),              # CF1 run_path (case = run_path + aftercalls)
    ('pm_goal_dg5_cf', 'install_cf2.<locals>.run_case'),              # CF2 run_case
    ('pm_goal_dg5_cf', 'install_cf3.<locals>.bind.<locals>.call'),    # CF3 Corpus positive/negative
    ('pm_goal_dg5_entries', 'suite_cases.<locals>.run'),              # shared plumbing Suite._run wrapper
    ('pm_goal_dg5_r', 'install.<locals>.run_case'),                   # DG-R run_case
    ('pm_goal_dg5_s', 'suite_cases.<locals>.run'),                    # DG-S Suite._run wrapper
    ('pm_goal_dg5_u', 'main'),                                        # DG-U main loop sets CASE per case
}
# A wrapper missing from this list fails closed: with no boundary on the stack every frame is checked, so its
# cases' direct calls are missed and counted, never falsely recorded. New family sources add their wrapper here
# (the selftest registers its generated wrappers the same way).


def case_wrapper(frame):
    """This frame is a DG5 case wrapper from the explicit list above (it set bridge.CASE and calls the runner)."""
    return (frame.f_globals.get('__name__'), frame.f_code.co_qualname) in CASE_WRAPPERS


# Round 2 C2: a runner's verdict-read helpers (the exception classifiers every oracle Suite/run_case calls
# after the case body, e.g. code_of -> a listed refusal_code/code_of). A segment made only of these, between
# the listed call and the runner, is the runner reading its verdict, never a case body calling an owner.
VERDICT_HELPERS = frozenset({'code_of'})
# The bridge's and this collector's own frames are harness, never corpus case code (e.g. boundaries.invoke
# calling recorder.snapshot() while a case is current).
HARNESS_MODULES = frozenset({'pm_goal_dg5_boundaries', __name__})
# CF1's original run_path IS the authored case body (the census counts its own calls as direct; recheck
# NOTE 2), so for that one wrapper the "runner" frame belongs to the checked segment like any body frame.
BODY_RUNNERS = frozenset({('pm_goal_dg_cf1_oracles', 'run_path')})
# Round 2 C2 follow-up (DG5 decision on the CF1 stopper, 2026-11-24): a case runner can still be on the stack
# after its case wrapper returned. pm_goal_dg_cf1_oracles.run()'s exception handler reads A.refusal_code(error)
# once install_cf1.run_path is done — CASE still current, no case wrapper on the stack — so the collector filed
# the runner's own verdict read (42 records on the fixed CF-03 run; the census's own call site for the method is
# pm_goal_dg_cf1_oracles.py:811(run)). A listed call whose immediate caller is one of these runner frames and
# that has no case wrapper on the stack is harness, never a record. A missing entry records a runner read, so the
# real-case trial c2_cf1_runner_refusal_code pins it; case semantics are untouched (no CASE save/restore), so
# every legitimate post-run_path body call still records.
RUNNER_FRAMES = {('pm_goal_dg_cf1_oracles', 'run')}


def direct(frame):
    """The call is direct (frame: the wrapper's caller). Returns (direct, reason).

    (a) No owner function is under way anywhere on the stack (the census probe's rule, unchanged).
    (b) Addendum 10 fix 1 (review REAL 1): no frame between the case body and this call is construction (a
        constructor or factory by name, or a fixture-class function; construction_frame), whatever its module, so a
        listed helper that a fixture or an oracle constructor calls is never recorded, whatever methods.json lists.
        "Between" is every frame from the caller up to, not including, the case runner: the frame the DG5 case
        wrapper called (the first case_wrapper frame up the stack sets bridge.CASE and calls the runner, e.g.
        Suite.negative, run_case, Suite._run). With no case wrapper on the stack every frame is checked.
    (c) Round 2 C2 (lead ruling 1124101552-8f55; recheck NOTE 2 is REAL): the runner position is checked as
        harness. The runner's job is to call the case body (or its returned action), so a call with no frame
        below the runner — or only verdict-read helpers below it — originates in the runner itself (Suite._run
        -> dg_s_world:code_of, Suite.negative -> code_of -> refusal_code, run_case -> dg_r_world:code_of) and
        is never recorded; counted under harness_calls. Only when a real body frame sits below the runner is
        the runner itself exempt from the construction check, exactly as before (fixture-class runners such as
        Suite.negative still pass their cases' own calls). Bridge/collector frames in the segment are harness
        for the same reason. CF1's run_path is the one body-runner (BODY_RUNNERS). A registered runner frame
        with no case wrapper on the stack (CF1's run() reading its refusal code once the case is over) is
        harness too (RUNNER_FRAMES)."""
    frames = []
    while frame is not None:
        frames.append(frame)
        frame = frame.f_back
    for f in frames:
        if owner_module(f.f_globals.get('__name__')):
            return False, 'owner frame'
    boundary = next((i for i, f in enumerate(frames) if case_wrapper(f)), None)
    if boundary is None and (frames[0].f_globals.get('__name__'), frames[0].f_code.co_qualname) in RUNNER_FRAMES:
        return False, 'harness runner frame ' + frames[0].f_code.co_qualname
    if boundary is None:
        segment = frames
    elif boundary == 0:
        return False, 'harness frame ' + frames[0].f_code.co_qualname   # the case wrapper itself is the caller
    else:
        runner = frames[boundary - 1]
        if (runner.f_globals.get('__name__'), runner.f_code.co_qualname) in BODY_RUNNERS:
            segment = frames[:boundary]
        else:
            below = frames[:boundary - 1]
            if not below or all(f.f_code.co_name in VERDICT_HELPERS for f in below):
                return False, 'harness runner verdict read via ' + frames[0].f_code.co_qualname
            segment = below
    for f in segment:
        if f.f_globals.get('__name__') in HARNESS_MODULES:
            return False, 'harness frame ' + f.f_code.co_qualname
        if construction_frame(f.f_code):
            return False, 'construction frame ' + f.f_code.co_qualname
    return True, None


def _stores(roots, limit=None):
    """(stores, paths, truncated): every TestOwnerStorage and every filesystem path reachable from `roots`
    (``_reach``): the durable places a call through these objects can reach."""
    return _reach(roots, limit)


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


def _reach(roots, limit=None):
    """(stores, paths, truncated): every TestOwnerStorage and every filesystem path reachable from
    `roots`, through instance attributes (``__dict__`` and ``__slots__``), dict keys and values, lists, tuples, sets,
    function closures and defaults, bound methods (their ``__self__``) and functools.partial objects. Classes and
    modules are not followed (module state is the owner-state digest's part). Bounded: at `limit` objects the walk
    stops and reports itself truncated, which the callers treat as a refusal.

    Addendum 10: the first edition stopped at 20 000 objects, so every direct call of the CA3 d06 case (a world graph
    of a few hundred thousand objects) was refused as truncated; the full walk takes about 0.5 s there."""
    import pm_goal_test_storage as storage
    from pathlib import PurePath
    limit = REACH_LIMIT if limit is None else limit
    seen, found, paths, todo = set(), [], [], list(roots)
    atoms = (str, bytes, bytearray, int, float, complex, bool, type, types.ModuleType, types.BuiltinFunctionType,
             types.CodeType)
    while todo:
        value = todo.pop()
        if isinstance(value, PurePath):
            paths.append(value)
            continue
        if value is None or isinstance(value, atoms) or id(value) in seen:
            continue
        if len(seen) >= limit:
            return found, paths, True
        seen.add(id(value))
        if isinstance(value, storage.TestOwnerStorage):
            found.append(value)
        if isinstance(value, dict):
            todo.extend(value.keys())
            todo.extend(value.values())
            continue
        if isinstance(value, (list, tuple, set, frozenset)):
            todo.extend(value)
            continue
        if isinstance(value, types.FunctionType):
            todo.extend(cell.cell_contents for cell in (value.__closure__ or ()) if _filled(cell))
            todo.extend(value.__defaults__ or ())
            todo.extend((value.__kwdefaults__ or {}).values())
            continue
        if isinstance(value, types.MethodType):
            todo.extend((value.__self__, value.__func__))
            continue
        if isinstance(value, functools.partial):
            todo.extend((value.func, *value.args, *value.keywords.values()))
        try:
            todo.extend(vars(value).values())
        except TypeError:
            pass
        for klass in type(value).__mro__:
            slots = vars(klass).get('__slots__', ())
            for name in (slots,) if isinstance(slots, str) else slots:
                try:
                    todo.append(getattr(value, name))
                except AttributeError:
                    pass
    return found, paths, False


def _filled(cell):
    try:
        cell.cell_contents
        return True
    except ValueError:
        return False


# Round C8 (lead ruling 1126000814-88f1): the descriptor-memo isolation for recorded direct calls (module
# docstring). The memos are the bridge's FROZEN/FROZEN_PARTS/MEMBERS/CASE_BANKS plus the bank memo's case;
# FAILURES is snapshotted by length because entry_call's opening settle_case_banks writes its drift records
# there between the snapshot and the parent run (rolling the memos back re-defers that verification to the
# next settle, exactly as with the collector off, so its record must roll back with them).
DESCRIPTOR_MEMOS = ('FROZEN', 'FROZEN_PARTS', 'MEMBERS', 'CASE_BANKS')


def _memo_state():
    return tuple(dict(getattr(bridge, name)) for name in DESCRIPTOR_MEMOS) + \
        (bridge.CASE_BANK_STATE[0], len(bridge.FAILURES))


def _memo_restore(state):
    for name, saved in zip(DESCRIPTOR_MEMOS, state[:4]):
        table = getattr(bridge, name)
        table.clear()
        table.update(saved)
    bridge.CASE_BANK_STATE[0] = state[4]
    del bridge.FAILURES[state[5]:]


def _entry_call(case, label, family, action, work, **kwargs):
    """bridge.entry_call under the C8 no-write-through rule.

    entry_call's descriptor walks (invoke's descriptor_sha256 over the live argument/world graph) memoize
    whatever mutable per-case objects they reach — an instance held as a class attribute (the case's world)
    freezes as a load-once singleton, a schema bank binds as a case bank — and those memos outlive the
    recording: the case's own continued execution drifts the frozen singleton, and the MEMBERS a freeze
    fills change the digest of every bank bound before it, so the two state gates report mutations the
    recording only observed. The snapshot is restored at the start of the parent run — inside the
    collector's own action, so the corpus execution and every registered entry nested in it bind against
    the same memos they would see with the collector off — and in the finally when no parent run was
    reached (a refused or failed sealed child). The sealed child's and the probe fork's own memo writes
    already die with the child."""
    outer = _memo_state()
    done = []

    def scrub():
        if not done:
            done.append(True)
            _memo_restore(outer)

    def run():
        scrub()
        return action()

    try:
        return bridge.entry_call(case, label, family, run, work, **kwargs)
    finally:
        scrub()


class NotShown(Exception):
    """The call is not shown to leave nothing behind; it runs unrecorded and is counted."""


def _state(hook, arguments, stores):
    """(owner-state digest, visible-store digest): the family hook's digest of the owners' in-memory state (the
    call's receiver and arguments and every owner-module global and class attribute; pm_goal_dg5_owner_state), and
    the manifest of every store reachable from the call."""
    owner = hook.digest(None, arguments)
    if not owner.get('sha256'):
        raise NotShown('owner-state digest unavailable: ' + str(owner.get('reason'))[:120])
    files = [(str(st.root), bridge.manifest(bridge.file_state(Path(st.root)))) for st in stores]
    return owner['sha256'], hashlib.sha256(pickle.dumps(files, protocol=5)).hexdigest()


def _outcome(hook, returned=None, error=None):
    """The run's result (its digest) or its refusal (the bridge's refusal code); anything else is not shown."""
    import pm_goal_dg5_owner_state as owner_state
    if error is not None:
        if type(error).__name__ == 'Crash':
            return ('crash', getattr(error, 'point', None) or str(error))
        if isinstance(error, Exception) and type(error).__name__ in bridge.REFUSAL_CLASSES:
            return ('refusal', bridge.refusal_code(error))
        raise NotShown('raised ' + type(error).__name__)
    stores, paths, truncated = _reach([returned])
    if stores or paths or truncated:
        raise NotShown('result holds a store or a path')
    try:
        return ('result', owner_state.Walk(hook).run([('result', returned)]))
    except (owner_state.Unclassified, RecursionError) as caught:
        raise NotShown('result digest unavailable: ' + type(caught).__name__)


def _run(hook, arguments, stores, action):
    """One run of the call (always exactly one) with its before- and after-state; returns (record, returned, error).
    The record is dict(before, after, outcome), or dict(not_shown=reason) when a digest is unavailable."""
    try:
        before, unavailable = _state(hook, arguments, stores), None
    except NotShown as why:
        before, unavailable = None, str(why)
    returned = error = None
    try:
        returned = action()
    except BaseException as caught:  # Storage's injected Crash is a BaseException
        error = caught
    try:
        if unavailable is not None:
            raise NotShown(unavailable)
        record = dict(before=before, after=_state(hook, arguments, stores), outcome=_outcome(hook, returned, error))
    except NotShown as why:
        record = dict(not_shown=str(why))
    return record, returned, error


def _left_nothing(name, record):
    if record['before'][0] != record['after'][0]:
        raise NotShown('owner state changed in the %s run' % name)
    if record['before'][1] != record['after'][1]:
        raise NotShown('a visible store changed in the %s run' % name)


def _probe(hook, arguments, stores, action):
    """The child-like run, in a fork: nothing it does reaches this process except its record. A visible store it
    changed is restored."""
    saved = [(Path(st.root), bridge.file_state(Path(st.root))) for st in stores]
    fd, out = tempfile.mkstemp(prefix='dg5-direct-probe-', suffix='.pkl')
    os.close(fd)
    pid = os.fork()
    if pid == 0:
        try:
            bridge.PARENT_CALL[0] = True     # nothing nested records inside the probe (as in the parent's own run)
            run = _run(hook, arguments, stores, action)[0]
            record = run if 'not_shown' in run else dict(record=run)
            Path(out).write_bytes(pickle.dumps(record, protocol=5))
        except BaseException as caught:  # noqa: BLE001
            Path(out).write_bytes(pickle.dumps(dict(not_shown='probe failed: ' + type(caught).__name__), protocol=5))
        os._exit(0)
    try:
        _, status = os.waitpid(pid, 0)
        raw = Path(out).read_bytes()
        result = pickle.loads(raw) if os.waitstatus_to_exitcode(status) == 0 and raw else dict(not_shown='probe died')
    finally:
        Path(out).unlink(missing_ok=True)
        for root, files in saved:
            if bridge.file_state(root) != files:
                bridge.restore_files(root, files)
    if 'not_shown' in result:
        raise NotShown(result['not_shown'])
    return result['record']


def _empty_work():
    """A per-process empty store directory for a recorded no-store call (it has nothing to seal)."""
    folder = _EMPTY.get(os.getpid())
    if folder is None:
        folder = Path(tempfile.mkdtemp(prefix='dg5-direct-nostore-')) / 'store'
        folder.mkdir()
        _EMPTY[os.getpid()] = folder
    return folder


_EMPTY = {}


def _count(family, field, key):
    table = REPORTS[family].setdefault(field, {})
    table[key] = table.get(key, 0) + 1


def _no_store(family, key, original, receiver, rest, args, kwargs):
    """A direct call with no store to seal (addendum 10, the lead's addendum 19 point 4: no declared purity list).

    It is recorded only when it is mechanically shown to leave nothing behind: the owner-state digest and the visible
    store digests are equal before and after, in both the child and the parent run, and both runs give the same
    result or the same refusal. Otherwise it is only counted (``unsealed_calls``, with the reason under
    ``no_store_reasons``).

    Order, so that nothing is recorded before both runs are shown:
      1. the child run: a probe in a fork, from the current state (as the bridge's sealed child is);
      2. the parent run: the case's own call, in this process, from the same state (the probe left none);
      3. both equal before and after, and the same outcome: the call is recorded through bridge.entry_call over an
         empty store (its sealed child and its parent run again, from the same state), and the case gets that
         run's result. Each of those two runs is checked again; a run that breaks the rule there is a sweep failure
         (``direct_no_store_left_state``), never a credit.
    A call that reaches a filesystem path is not probed (a probe could write files outside every visible store)."""
    import pm_goal_dg5_owner_state as owner_state
    hook = owner_state.HOOKS.get(family)
    arguments = dict(receiver=receiver, args=rest, kwargs=kwargs)
    action = lambda: original(*args, **kwargs)
    stores, paths, truncated = _reach([receiver, *rest, *kwargs.values()])
    reason = 'no owner-state hook for the family' if hook is None else 'reaches a filesystem path' if paths else \
        'walk truncated' if truncated else None
    if reason is not None:
        return _counted(family, key, reason, action)
    try:
        child = _probe(hook, arguments, stores, action)
        _left_nothing('child', child)
    except NotShown as why:
        return _counted(family, key, str(why), action)
    saved = bridge.PARENT_CALL[0]
    bridge.PARENT_CALL[0] = True        # the case's own run: nothing nested records
    try:
        parent, returned, error = _run(hook, arguments, stores, action)
    finally:
        bridge.PARENT_CALL[0] = saved
    try:
        if 'not_shown' in parent:
            raise NotShown('parent run: ' + parent['not_shown'])
        _left_nothing('parent', parent)
        if parent['outcome'] != child['outcome']:
            raise NotShown('the child and parent runs give different outcomes')
    except NotShown as why:
        reason = str(why)
    if reason is not None:
        _count(family, 'unsealed_calls', key)
        _count(family, 'no_store_reasons', reason)
        if error is not None:
            raise error
        return returned
    return _record_pure(family, key, original, hook, arguments, stores, action, child['outcome'])


def _counted(family, key, reason, action):
    _count(family, 'unsealed_calls', key)
    _count(family, 'no_store_reasons', reason)
    return action()


def _record_pure(family, key, original, hook, arguments, stores, action, outcome):
    case = bridge.CASE[0]
    from pm_goal_dg5_declarations import target
    label = case['id'] + '/direct/' + key
    side = Path(tempfile.mkdtemp(prefix='dg5-direct-runs-'))
    here = os.getpid()
    runs = []

    def checked():
        record, returned, error = _run(hook, arguments, stores, action)
        record['ns'] = time.monotonic_ns()
        if os.getpid() == here:
            runs.append(record)
        else:   # the sealed child (or a judge replay, later): its record reaches the parent through a file
            (side / ('%d-%d.pkl' % (record['ns'], os.getpid()))).write_bytes(pickle.dumps(record, protocol=5))
        if error is not None:
            raise error
        return returned

    REPORTS[family]['recorded_calls'] = REPORTS[family].get('recorded_calls', 0) + 1
    _count(family, 'no_store_recorded', key)
    try:
        return _entry_call(case, label, family, checked, _empty_work(), world=None, arguments=arguments,
                           original=original, target=target(case, bridge.target_rows(case.get('expected')), label),
                           direct=True)   # C5: nested registered entries still record in the parent run
    finally:
        files = sorted(side.iterdir(), key=lambda f: int(f.name.split('-')[0]))
        child = pickle.loads(files[0].read_bytes()) if files else None
        for f in files:
            f.unlink()
        side.rmdir()
        problems = []
        for name, record in (('child', child), ('parent', runs[0] if runs else None)):
            if record is None:
                problems.append('no %s run record' % name)
            elif 'not_shown' in record:
                problems.append('%s run: %s' % (name, record['not_shown']))
            else:
                try:
                    _left_nothing(name, record)
                except NotShown as why:
                    problems.append(str(why))
                if record['outcome'] != outcome:
                    problems.append('%s run outcome differs from the probe' % name)
        if problems:
            bridge.FAILURES.append(dict(kind='direct_no_store_left_state', label=label, problems=problems))


def _wrap(family, key, owner, name, raw):
    original = raw.__func__ if isinstance(raw, (staticmethod, classmethod)) else raw
    bound_kind = 'static' if isinstance(raw, staticmethod) else 'class' if isinstance(raw, classmethod) else \
        ('function' if not inspect.isclass(owner) else 'method')

    @functools.wraps(original)
    def call(*args, **kwargs):
        if bridge.ACTIVE[0] or bridge.PARENT_CALL[0] or bridge.CASE[0] is None:
            return original(*args, **kwargs)
        ok, why = direct(sys._getframe(1))
        if not ok:
            if why.startswith('construction'):
                built = REPORTS[family].setdefault('construction_calls', {})
                built[key] = built.get(key, 0) + 1
            elif why.startswith('harness'):
                harness = REPORTS[family].setdefault('harness_calls', {})
                harness[key] = harness.get(key, 0) + 1
            return original(*args, **kwargs)
        receiver = args[0] if bound_kind in ('method', 'class') and args else None
        rest = args[1:] if receiver is not None else args
        world, root = _world(receiver if bound_kind == 'method' else None, rest, kwargs)
        if root is None:   # nothing to seal: recorded only when shown to leave nothing behind (addendum 10 / 19.4)
            return _no_store(family, key, original, receiver, rest, args, kwargs)
        # Addendum 10 fix 2 (review REAL 2): only the found root is restored between the sealed child and the parent,
        # so the call is recorded only when every store it can reach lies under that root; otherwise (a sibling store,
        # as CF06-P03's goal-db, or a walk too large to finish) it runs unrecorded and is counted.
        # Round 2 C3 (lead ruling 1124101552-8f55; recheck NOTE 1 is REAL): the same holds for reachable filesystem
        # paths, which _stores used to drop. BackupOwner.take(st, d/'unit') writes <case>/unit/ beside the sealed
        # <case>/storage root; the sealed child's writes there are never restored and break the parent
        # (backup/dest_empty, child_parent_disagree in 9/20 CF3 cf12 cases). The collector REFUSES such a call
        # instead of sealing arbitrary paths: the bridge restores exactly one root, and snapshotting/restoring
        # paths anywhere a walk can reach (including repository files) would let the observer rewrite them.
        # A path inside the root, or an ancestor container of it (the world's work directory), stays admissible;
        # a path into a disjoint tree is unsealable. String paths remain invisible to _reach (deep note F5).
        stores, paths, truncated = _stores([world, *args, *kwargs.values()])
        base = Path(root).resolve()
        outside = sorted({str(Path(st.root).resolve()) for st in stores if not Path(st.root).resolve().is_relative_to(base)})
        disjoint = sorted({str(p) for p in {Path(p).resolve() for p in paths}
                           if not p.is_relative_to(base) and not base.is_relative_to(p)})
        if outside or disjoint or truncated:
            unsealable = REPORTS[family].setdefault('unsealable_calls', {})
            unsealable[key] = unsealable.get(key, 0) + 1
            return original(*args, **kwargs)
        case = bridge.CASE[0]
        from pm_goal_dg5_declarations import target
        label = case['id'] + '/direct/' + key
        REPORTS[family]['recorded_calls'] = REPORTS[family].get('recorded_calls', 0) + 1
        return _entry_call(case, label, family, lambda: original(*args, **kwargs), root, world=world,
                           arguments=dict(receiver=receiver, args=rest, kwargs=kwargs), original=original,
                           target=target(case, bridge.target_rows(case.get('expected')), label),
                           direct=True)   # C5: nested registered entries still record in the parent run
    call._dg5_direct = True
    call._dg5_direct_key = key
    call._dg5_direct_family = family
    wrapped = staticmethod(call) if bound_kind == 'static' else classmethod(call) if bound_kind == 'class' else call
    setattr(owner, name, wrapped)


def schema_validator(key, entry):
    """A listed whole-root schema bank validate (bridge.SCHEMA_BANKS): its guard decision is the bridge's
    schema-row decide, made in install_schema_rows' wrapper only while a complete call is under way."""
    return any(entry.get('module') == module and key == cls + '.validate'
               for module, cls, *_ in bridge.SCHEMA_BANKS)


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
    # Round 2 C7 (lead ruling 1124101552-8f55): a schema bank's validate is never wrapped. Examined on
    # S2/cast_* (Bank.validate, pm_goal_dg_s_oracles.py:584): the recorded trial runs the collector's captured
    # original, bypassing the bridge schema wrapper, so the schema row is never decided inside the recorded
    # run (empty refusing_sites, CANNOT_DECIDE; the row is only named, via SCHEMA_ROW in the parent). A
    # recorded call must contain the decision it is credited with, so these stay unwrapped and run exactly as
    # with the collector off, where a direct validate likewise makes no row decision. Reported, never wrapped.
    report['schema_by_rule'] = sorted(key for key, entry in section['owner_methods'].items()
                                      if schema_validator(key, entry))
    done = set(report['wrapped']) | set(report['entries'])
    report['not_loaded'] = []
    for key, entry in sorted(section['owner_methods'].items()):
        if key in done or key in report['construction_by_rule'] or key in report['schema_by_rule']:
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
