#!/usr/bin/env python3
"""Unit trials of the direct-call collector (pm_goal_dg5_direct_calls; addendum 12 point 3, addendum 10 fixes).

A temporary listing (pinned for the trial) over generated modules:
- an owner module, pm_goal_dg_dcself_owner;
- an oracle module, pm_goal_dg_dcself_oracles (an excluded *_oracles module, as the CF2 oracles are), holding a case
  runner class Suite, case bodies, a fixture constructor, a *World fixture method and a plain helper;
- a DG5-style case wrapper module, pm_goal_dg5_dcself_wrapper, which sets bridge.CASE and calls the runner, as the
  family sources do.
bridge.entry_call is replaced by a recorder, so each trial shows whether the wrapper hands the call to the collector
(recorded) or runs it unchanged (not recorded). Every trial runs on its own: a missing collector module or a setup
error makes each trial FAIL separately (per-trial red on a base without the collector; review tool note).

  listed_direct            a listed method called from case code with a case current: recorded over its store
  listed_no_case           the same with no case current: not recorded
  listed_nested_owner      the same method called from inside another owner-module function: not recorded
  listed_inside_entry      the same with an entry under way (bridge.PARENT_CALL): not recorded
  not_listed               a method that is not on the list: not wrapped, not recorded
  constructor_not_listed   the class's constructor: not wrapped, not recorded
  module_function_unsealed a listed module function with no store to seal, in a family with no owner-state hook:
                           not recorded, counted
  store_argument           a listed module function called with a TestOwnerStorage argument: recorded over that store
  install_report           exactly the listed methods are wrapped
  constructor_listed       a name in both owner_methods and excluded_construction: install refuses
  fixture_class_by_rule    a listed method of a *World class (C3) the list calls owner: not wrapped, reported
  pin                      a listing that is not the pinned bytes: load refuses
 addendum 10, fix 1 (review REAL 1: CF06-P03, Run.__init__ -> build_context):
  runner_not_construction  wrapper -> Suite runner -> case body -> listed call: recorded (the runner is not "between")
  oracle_constructor       wrapper -> runner -> case body -> an oracle-module constructor -> listed call: NOT recorded,
                           counted under construction_calls, although the method is listed
  oracle_world_method      ... -> a *World fixture method in the oracle module -> listed call: NOT recorded
  oracle_factory_name      ... -> an oracle function named build -> listed call: NOT recorded
  oracle_plain_helper      ... -> a plain oracle helper -> listed call: recorded (the rule is not "any oracle frame")
 addendum 10, fix 2 (review REAL 2: CF06-P03's goal-db outside the sealed storage root):
  sibling_store_unsealable a listed module function given a world whose second store is a sibling of the sealed root:
                           NOT recorded, counted under unsealable_calls
  stores_under_root        the same world with its second store under the sealed root: recorded
  closure_sibling          a world whose sibling store is held only in a closure (a callback): NOT recorded, counted
  large_world_recorded     a world graph of 60 000 objects, every store under the root: recorded (the first edition's
                           20 000-object walk refused it as truncated, as it refused every CA3 d06 direct call)
  truncated_walk_refused   the same world call with the walk limit set to 3 objects: NOT recorded, counted
 addendum 10 / the lead's addendum 19 point 4 (no declared purity list; a no-store call is recorded only when shown
 mechanically to leave nothing behind, in both the child and the parent run, with the same result or refusal):
  pure_read_recorded       a pure read (an encode_event_frame-like codec over its argument): recorded, no failure
  pure_refusal_recorded    a no-store call that refuses the same way in both runs: recorded, the refusal reaches
                           the case
  owner_state_change       a no-store call that changes owner state (a module global): NOT recorded, counted, and
                           its effect happens exactly once in this process
  child_parent_differ      a no-store call whose child and parent runs give different results: NOT recorded,
                           counted, and the case gets the parent's result
  path_argument            a no-store call given a filesystem path: not probed, NOT recorded, counted
 collector round 2 (lead ruling 1124101552-8f55, items C1-C7; each trial mirrors the named real case, and
 pm_goal_dg5_direct_calls_r2_selftest.py drives the real cases themselves):
  dg5_module_factory       C1: case body and its make() factory inside a pm_goal_dg5_* module (the adapter
                           supplement step_case.<locals>.make -> LifecycleReducer.initial shape): NOT recorded
  runner_direct_verdict    C2: the case runner itself calls the listed method (Suite._run/run_case verdict
                           read shape): NOT recorded, counted under harness_calls
  runner_code_of_verdict   C2: runner -> code_of helper -> listed method (Suite.negative shape): NOT recorded
  sealed_dest_outside      C3: a sealed call given a destination Path in a disjoint tree (BackupOwner.take
                           shape): NOT recorded, counted under unsealable_calls
  sealed_dest_inside       C3: the same call with its destination under the sealed root: recorded
  returned_lambda_action   C4: an action lambda returned by make() and run by the case (cb_case/U5 shape):
                           recorded (make has returned; only the lambda frame is on the stack)
  inside_make_call         C4: a listed call made by make() itself while it runs: NOT recorded (control)
  collector_frame_checker  C6: in refusal_origin the collector pass-through frame is a bridge/checker frame
                           (the S2 StartOwner.commit_start own-guard chain shape)

Usage: python3 -B scripts/pm_goal_dg5_direct_calls_selftest.py --out RESULT.json
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import textwrap
import traceback

import pm_goal_dg5_boundaries as bridge

try:
    import pm_goal_dg5_direct_calls as dc
    IMPORT_ERROR = None
except ImportError as error:   # a base without the collector: every trial fails on its own
    dc, IMPORT_ERROR = None, '%s: %s' % (type(error).__name__, error)

OWNER = textwrap.dedent('''
    class Thing:
        def __init__(self):
            self.n = 0
        def listed(self, x):
            return ('listed', x)
        def unlisted(self, x):
            return ('unlisted', x)
        def calls_listed(self, x):
            return self.listed(x)          # nested: an owner function is under way

    def pure(x):
        return ('pure', x)

    def with_store(store, x):
        return ('store', x)

    def with_world(w, x):
        return ('world', x)

    import os as _os
    START = _os.getpid()
    COUNTER = [0]

    class Refusal(Exception):
        def __init__(self, code):
            super().__init__(code)
            self.code = code

    def encode(frame):
        return repr(sorted(frame.items())).encode()      # a pure codec read of its argument

    def refuse(x):
        raise Refusal('dcself/refused')

    def bump(x):
        COUNTER[0] += x                                 # owner state: a module global
        return COUNTER[0]

    def forked(x):
        return ('forked', _os.getpid() == START)        # differs between a forked child run and the parent run

    def at_path(path):
        return ('path', str(path))

    def with_dest(store, dest, x):
        return ('dest', x)

    def boom(x):
        raise Refusal('dcself/boom')
    ''')
ORACLES = textwrap.dedent('''
    import pm_goal_dg_dcself_owner as owner

    def code_of(thing):
        return thing.listed(12)            # a verdict-read helper (the runners' code_of shape)

    class Suite:
        def negative(self, fn):
            return fn()                    # the case runner: it calls the case body
        def verdict(self, thing):
            return code_of(thing)          # the runner's own verdict read, after the case body
        def verdict_direct(self, thing):
            return thing.listed(13)        # the runner itself calls the listed method

    class Run:
        def __init__(self, thing):
            self.value = thing.listed(5)   # a fixture constructor calling a listed method (CF06-P03's shape)

    class CaseWorld:
        def prepare(self, thing):
            return thing.listed(6)         # a *World fixture method

    def build(thing):
        return thing.listed(7)             # a factory-named fixture function

    def helper(thing):
        return thing.listed(8)             # a plain helper of the case

    def body_constructor(thing):
        return Run(thing).value

    def body_world(thing):
        return CaseWorld().prepare(thing)

    def body_factory(thing):
        return build(thing)

    def body_helper(thing):
        return helper(thing)

    def body_direct(thing):
        return thing.listed(9)

    def make_action(thing):
        def make():
            return lambda: thing.listed(14)
        return make()

    def body_returned_lambda(thing):
        return make_action(thing)()

    def make_calls(thing):
        def make():
            return thing.listed(15)
        return make()

    def body_inside_make(thing):
        return make_calls(thing)
    ''')
DG5BODY = textwrap.dedent('''
    def make(thing):
        return thing.listed(11)            # a factory inside a pm_goal_dg5_* module (adapter step_case shape)

    def body_via_make(thing):
        return make(thing)
    ''')
WRAPPER = textwrap.dedent('''
    import pm_goal_dg5_boundaries as bridge
    import pm_goal_dg_dcself_oracles as oracles

    def case(case_id, body, thing):
        saved = bridge.CASE[0]
        bridge.CASE[0] = dict(id=case_id, expected=None)
        try:
            return oracles.Suite().negative(lambda: body(thing))
        finally:
            bridge.CASE[0] = saved

    def case_verdict(case_id, thing, direct=False):
        saved = bridge.CASE[0]
        bridge.CASE[0] = dict(id=case_id, expected=None)
        try:
            suite = oracles.Suite()
            return suite.verdict_direct(thing) if direct else suite.verdict(thing)
        finally:
            bridge.CASE[0] = saved
    ''')
METHODS = ['Thing.listed', 'Thing.calls_listed', 'pm_goal_dg_dcself_owner:pure', 'pm_goal_dg_dcself_owner:with_store',
           'pm_goal_dg_dcself_owner:with_world'] + ['pm_goal_dg_dcself_owner:' + f for f in
                                                    ('encode', 'refuse', 'bump', 'forked', 'at_path', 'with_dest', 'boom')]
TRIALS = ['listed_direct', 'listed_no_case', 'listed_nested_owner', 'listed_inside_entry', 'not_listed',
          'constructor_not_listed', 'module_function_unsealed', 'store_argument', 'install_report', 'constructor_listed',
          'fixture_class_by_rule', 'pin', 'runner_not_construction', 'oracle_constructor', 'oracle_world_method',
          'oracle_factory_name', 'oracle_plain_helper', 'sibling_store_unsealable', 'stores_under_root',
          'closure_sibling', 'large_world_recorded', 'truncated_walk_refused',
          'pure_read_recorded', 'pure_refusal_recorded', 'owner_state_change', 'child_parent_differ', 'path_argument',
          'dg5_module_factory', 'runner_direct_verdict', 'runner_code_of_verdict', 'sealed_dest_outside',
          'sealed_dest_inside', 'returned_lambda_action', 'inside_make_call', 'collector_frame_checker']


def load_module(folder, name, text):
    path = folder / (name + '.py')
    path.write_text(text)
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def listing(folder, methods):
    data = {'selftest.family': dict(owner_methods={k: dict(module='pm_goal_dg_dcself_owner', kind='owner') for k in methods},
                                    excluded_construction={'Thing.__init__': {}}, runs={})}
    path = folder / 'methods.json'
    path.write_bytes(json.dumps(data).encode())
    return path


def fresh(folder, methods, pin=True):
    path = listing(folder, methods)
    dc.METHODS, dc._LIST[:], dc.REPORTS = path, [], {}
    dc.METHODS_SHA256 = hashlib.sha256(path.read_bytes()).hexdigest() if pin else '0' * 64


class Env:
    """One shared setup; built lazily so a failure in it fails each trial, not the suite."""

    def __init__(self, folder):
        self.folder, self.calls, self.ready, self.error = folder, [], False, None

    def setup(self):
        if self.ready or self.error:
            if self.error:
                raise RuntimeError('setup failed: ' + self.error)
            return self
        try:
            if dc is None:
                raise RuntimeError('pm_goal_dg5_direct_calls is not importable: ' + IMPORT_ERROR)
            import pm_goal_test_storage as storage

            import os

            def recorder(case, label, family, action, work, **kwargs):
                # bridge.entry_call's two runs: a sealed child in a fork, then the parent's own run
                self.calls.append(dict(label=label, family=family, work=str(work)))
                pid = os.fork()
                if pid == 0:
                    try:
                        action()
                    except BaseException:  # noqa: BLE001
                        pass
                    os._exit(0)
                os.waitpid(pid, 0)
                return action()
            import pm_goal_dg5_owner_state as owner_state
            self.owner_state = owner_state
            owner_state.HOOKS['selftest.family'] = owner_state.Hook('selftest.family', ())

            self.saved = (dc.METHODS, dc.METHODS_SHA256, list(dc._LIST), dict(dc.REPORTS), bridge.entry_call)
            bridge.entry_call = recorder
            self.owner = load_module(self.folder, 'pm_goal_dg_dcself_owner', OWNER)
            self.oracles = load_module(self.folder, 'pm_goal_dg_dcself_oracles', ORACLES)
            self.wrapper = load_module(self.folder, 'pm_goal_dg5_dcself_wrapper', WRAPPER)
            self.dg5body = load_module(self.folder, 'pm_goal_dg5_dcself_body', DG5BODY)
            wrappers = getattr(dc, 'CASE_WRAPPERS', None)   # round 2 C1: explicit wrappers (absent at the base)
            if wrappers is not None:
                wrappers.update({('pm_goal_dg5_dcself_wrapper', 'case'),
                                 ('pm_goal_dg5_dcself_wrapper', 'case_verdict')})
            fresh(self.folder, METHODS)
            self.report = dc.install('selftest.family')
            self.store = storage.TestOwnerStorage.create(self.folder / 'store')
            self.thing = self.owner.Thing()
            self.thing.storage = self.store          # an owner over one Storage: the store a recorded call seals
            case_root = self.folder / 'case'
            self.world_sibling = type('W', (), {})()
            self.world_sibling.storage = storage.TestOwnerStorage.create(case_root / 'storage')
            self.world_sibling.goal_store = storage.TestOwnerStorage.create(case_root / 'goal-db')   # a sibling
            self.world_inner = type('W', (), {})()
            self.world_inner.storage = storage.TestOwnerStorage.create(case_root / 'inner')
            self.world_inner.goal_store = storage.TestOwnerStorage.create(case_root / 'inner' / 'goal-db')
            hidden = storage.TestOwnerStorage.create(case_root / 'hidden-goal-db')
            self.world_closure = type('W', (), {})()
            self.world_closure.storage = storage.TestOwnerStorage.create(case_root / 'closure')
            self.world_closure.on_commit = lambda: hidden.root      # the sibling store only in a closure cell
            self.world_large = type('W', (), {})()
            self.world_large.storage = storage.TestOwnerStorage.create(case_root / 'large')
            self.world_large.rows = [dict(n=[i]) for i in range(30000)]   # 60 000 containers
            self.ready = True
        except Exception as error:  # noqa: BLE001
            self.error = '%s: %s' % (type(error).__name__, error)
            raise
        return self

    def run(self, run, case=True, parent=False):
        self.calls.clear()
        bridge.CASE[0] = dict(id='selftest/trial', expected=None) if case else None
        bridge.PARENT_CALL[0] = parent
        try:
            run()
        finally:
            bridge.CASE[0], bridge.PARENT_CALL[0] = None, False
        return [c['label'] for c in self.calls]

    def arg(self, fn):
        return dict(encode=({'a': 1},), refuse=(1,), bump=(1,), forked=(1,), at_path=(self.folder / 'x',))[fn]

    def through(self, body):
        """wrapper (sets the case) -> Suite.negative (runner) -> body -> ..."""
        self.calls.clear()
        self.wrapper.case('selftest/' + body, getattr(self.oracles, body), self.thing)
        return [c['label'] for c in self.calls]

    def restore(self):
        if getattr(self, 'owner_state', None):
            self.owner_state.HOOKS.pop('selftest.family', None)
        if getattr(self, 'saved', None):
            dc.METHODS, dc.METHODS_SHA256, dc._LIST[:], dc.REPORTS, bridge.entry_call = self.saved
        for name in ('pm_goal_dg_dcself_owner', 'pm_goal_dg_dcself_oracles', 'pm_goal_dg5_dcself_wrapper',
                     'pm_goal_dg5_dcself_body'):
            sys.modules.pop(name, None)


def checks(env):
    """name -> function returning (passed, detail)."""
    e = env
    report = lambda: dc.REPORTS['selftest.family']

    def listed_direct():
        rec = e.run(lambda: e.thing.listed(1))
        return bool(rec) and e.calls[-1]['work'] == str(e.store.root), rec

    def nested():
        inner = getattr(e.owner.Thing.calls_listed, '__wrapped__', e.owner.Thing.calls_listed)
        rec = e.run(lambda: inner(e.thing, 1))
        return not rec, rec

    def unsealed():
        hook = e.owner_state.HOOKS.pop('selftest.family')
        try:
            rec = e.run(lambda: e.owner.pure(2))
        finally:
            e.owner_state.HOOKS['selftest.family'] = hook
        return not rec and report().get('unsealed_calls', {}).get('pm_goal_dg_dcself_owner:pure') == 1, rec

    def no_store(fn, expect, reason=None, check=None):
        def run():
            key = 'pm_goal_dg_dcself_owner:' + fn
            failures = len(bridge.FAILURES)
            before = dict(report().get('no_store_reasons', {}))
            got = []
            def call():
                try:
                    got.append(('result', getattr(e.owner, fn)(*e.arg(fn))))
                except Exception as error:  # noqa: BLE001
                    got.append(('raised', type(error).__name__, getattr(error, 'code', None)))
            rec = e.run(call)
            reasons = {k: v - before.get(k, 0) for k, v in report().get('no_store_reasons', {}).items()
                       if v != before.get(k, 0)}
            new_failures = bridge.FAILURES[failures:]
            ok = bool(rec) == expect and not new_failures
            ok = ok and (expect or (reason is not None and any(reason in k for k in reasons)))
            ok = ok and (check is None or check(got))
            return ok, dict(recorded=rec, reasons=reasons, failures=new_failures, got=got)
        return run

    def store_argument():
        rec = e.run(lambda: e.owner.with_store(e.store, 3))
        return bool(rec) and e.calls[-1]['work'] == str(e.store.root), rec

    def install_report():
        return sorted(e.report['wrapped']) == sorted(METHODS) and not getattr(e.owner.Thing.unlisted, '_dg5_direct', False) \
            and not getattr(e.owner.Thing.__init__, '_dg5_direct', False), e.report['wrapped']

    def refused(methods, pin, needle):
        def check():
            fresh(e.folder, methods, pin=pin)
            try:
                dc.install('selftest.family')
                return False, 'install accepted it'
            except ValueError as error:
                return needle in str(error), str(error)
            finally:
                fresh(e.folder, METHODS)
                dc.REPORTS['selftest.family'] = e.report
        return check

    def fixture_class_by_rule():
        extra = load_module(e.folder, 'pm_goal_dg_dcself_extra', 'class S1Thing' + 'World:\n    def close(self):\n        return 1\n')
        data = {'selftest.family3': dict(owner_methods={'S1ThingWorld.close': dict(module='pm_goal_dg_dcself_extra', kind='owner')},
                                         excluded_construction={}, runs={})}
        path = e.folder / 'methods3.json'
        path.write_bytes(json.dumps(data).encode())
        saved = dc.METHODS, dc.METHODS_SHA256, list(dc._LIST)
        dc.METHODS, dc._LIST[:] = path, []
        dc.METHODS_SHA256 = hashlib.sha256(path.read_bytes()).hexdigest()
        try:
            r = dc.install('selftest.family3')
        finally:
            dc.METHODS, dc.METHODS_SHA256, dc._LIST[:] = saved
            sys.modules.pop('pm_goal_dg_dcself_extra', None)
        return r['construction_by_rule'] == ['S1ThingWorld.close'] and not getattr(extra.S1ThingWorld.close, '_dg5_direct', False), r

    def through(body, expect):
        def check():
            before = dict(report().get('construction_calls', {}))
            rec = e.through(body)
            after = report().get('construction_calls', {})
            counted = after.get('Thing.listed', 0) - before.get('Thing.listed', 0)
            return (bool(rec) == expect) and (expect or counted == 1), dict(recorded=rec, construction_counted=counted)
        return check

    def sibling():
        rec = e.run(lambda: e.owner.with_world(e.world_sibling, 4))
        return not rec and report().get('unsealable_calls', {}).get('pm_goal_dg_dcself_owner:with_world') == 1, rec

    def inner():
        rec = e.run(lambda: e.owner.with_world(e.world_inner, 4))
        return bool(rec) and e.calls[-1]['work'] == str(e.world_inner.storage.root), rec

    def closure_sibling():
        rec = e.run(lambda: e.owner.with_world(e.world_closure, 4))
        return not rec and report().get('unsealable_calls', {}).get('pm_goal_dg_dcself_owner:with_world', 0) >= 2, rec

    def large():
        rec = e.run(lambda: e.owner.with_world(e.world_large, 4))
        return bool(rec) and e.calls[-1]['work'] == str(e.world_large.storage.root), rec

    def truncated():
        before = report().get('unsealable_calls', {}).get('pm_goal_dg_dcself_owner:with_world', 0)
        saved, dc.REACH_LIMIT = dc.REACH_LIMIT, 3
        try:
            rec = e.run(lambda: e.owner.with_world(e.world_inner, 4))
        finally:
            dc.REACH_LIMIT = saved
        after = report().get('unsealable_calls', {}).get('pm_goal_dg_dcself_owner:with_world', 0)
        return not rec and after == before + 1, rec

    def dg5_module_factory():
        # C1 (adapter/dg5-shared/source_step_* -> LifecycleReducer.initial in step_case.<locals>.make)
        before = dict(report().get('construction_calls', {}))
        e.calls.clear()
        e.wrapper.case('selftest/dg5body', e.dg5body.body_via_make, e.thing)
        rec = [c['label'] for c in e.calls]
        counted = report().get('construction_calls', {}).get('Thing.listed', 0) - before.get('Thing.listed', 0)
        return not rec and counted == 1, dict(recorded=rec, construction_counted=counted)

    def runner_verdict(direct):
        # C2 (Suite._run -> dg_s_world:code_of; Suite.negative -> code_of -> refusal_code; run_case -> code_of)
        def check():
            before = dict(report().get('harness_calls', {}))
            e.calls.clear()
            e.wrapper.case_verdict('selftest/verdict', e.thing, direct=direct)
            rec = [c['label'] for c in e.calls]
            counted = report().get('harness_calls', {}).get('Thing.listed', 0) - before.get('Thing.listed', 0)
            return not rec and counted == 1, dict(recorded=rec, harness_counted=counted)
        return check

    def sealed_dest_outside():
        # C3 (CF3 cf12 BackupOwner.take(st, d/'unit') outside the sealed <case>/storage root)
        before = report().get('unsealable_calls', {}).get('pm_goal_dg_dcself_owner:with_dest', 0)
        rec = e.run(lambda: e.owner.with_dest(e.store, e.folder / 'unit', 4))
        after = report().get('unsealable_calls', {}).get('pm_goal_dg_dcself_owner:with_dest', 0)
        return not rec and after == before + 1, rec

    def sealed_dest_inside():
        rec = e.run(lambda: e.owner.with_dest(e.store, Path(e.store.root) / 'unit', 4))
        return bool(rec) and e.calls[-1]['work'] == str(e.store.root), rec

    def collector_frame_checker():
        # C6 (S2/v7_producer_wrong_payload_header StartOwner.commit_start own-guard chain)
        caught = []
        def call():
            try:
                e.owner.boom(1)
            except Exception as error:  # noqa: BLE001
                caught.append(error)
        e.run(call, parent=True)   # pass-through: the collector's own call frame is on the stack
        origin = bridge.refusal_origin(caught[0], 'dcself/boom') if caught else {}
        frames = [f for f in origin.get('frames', []) if f[0].endswith('pm_goal_dg5_direct_calls.py')]
        return bool(frames) and all(f[3] and f[4] for f in frames), dict(frames=frames, origin_site=origin.get('site'))

    return {
        'closure_sibling': closure_sibling,
        'large_world_recorded': large,
        'truncated_walk_refused': truncated,
        'listed_direct': listed_direct,
        'listed_no_case': lambda: (not e.run(lambda: e.thing.listed(1), case=False), None),
        'listed_nested_owner': nested,
        'listed_inside_entry': lambda: (not e.run(lambda: e.thing.listed(1), parent=True), None),
        'not_listed': lambda: (not e.run(lambda: e.thing.unlisted(1)), None),
        'constructor_not_listed': lambda: (not e.run(lambda: e.owner.Thing()), None),
        'module_function_unsealed': unsealed,
        'store_argument': store_argument,
        'install_report': install_report,
        'constructor_listed': refused(['Thing.__init__', 'Thing.listed'], True, 'construction'),
        'fixture_class_by_rule': fixture_class_by_rule,
        'pin': refused(['Thing.listed'], False, 'not the pinned list'),
        'runner_not_construction': through('body_direct', True),
        'oracle_constructor': through('body_constructor', False),
        'oracle_world_method': through('body_world', False),
        'oracle_factory_name': through('body_factory', False),
        'oracle_plain_helper': through('body_helper', True),
        'sibling_store_unsealable': sibling,
        'stores_under_root': inner,
        'pure_read_recorded': no_store('encode', True, check=lambda got: got == [('result', repr([('a', 1)]).encode())]),
        'pure_refusal_recorded': no_store('refuse', True, check=lambda got: got == [('raised', 'Refusal', 'dcself/refused')]),
        'owner_state_change': no_store('bump', False, 'owner state changed', check=lambda got: got == [('result', 1)]
                                       and e.owner.COUNTER[0] == 1),
        'child_parent_differ': no_store('forked', False, 'different outcomes',
                                        check=lambda got: got == [('result', ('forked', True))]),
        'path_argument': no_store('at_path', False, 'filesystem path'),
        'dg5_module_factory': dg5_module_factory,
        'runner_direct_verdict': runner_verdict(True),
        'runner_code_of_verdict': runner_verdict(False),
        'sealed_dest_outside': sealed_dest_outside,
        'sealed_dest_inside': sealed_dest_inside,
        'returned_lambda_action': through('body_returned_lambda', True),
        'inside_make_call': through('body_inside_make', False),
        'collector_frame_checker': collector_frame_checker,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    env = Env(Path(tempfile.mkdtemp(prefix='dg5-direct-selftest-')))
    rows = []
    try:
        for name in TRIALS:
            try:
                env.setup()
                passed, detail = checks(env)[name]()
                rows.append(dict(case=name, passed=bool(passed), detail=detail))
            except Exception as error:  # noqa: BLE001 - each trial fails on its own
                rows.append(dict(case=name, passed=False, detail='%s: %s' % (type(error).__name__, str(error)[:300]),
                                 trace=traceback.format_exc()[-600:]))
    finally:
        env.restore()
    status = 'pass' if all(r['passed'] for r in rows) else 'fail'
    args.out.write_text(json.dumps(dict(status=status, cases=rows), indent=1, default=str) + '\n')
    for r in rows:
        print('PASS' if r['passed'] else 'FAIL', r['case'], str(r.get('detail'))[:160])
    print(status, '%d/%d' % (sum(r['passed'] for r in rows), len(rows)))
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
