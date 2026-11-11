#!/usr/bin/env python3
"""DG-CA corpus runner: goal.cancelled C1-C4 original-path oracles (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Every positive is a complete original path executed by the registered
TEST_ONLY owners on the shared adapters; every negative starts from a valid
complete case and makes exactly one genuine change at one boundary (or
presents one substituted/transport-shaped input), keeps every dependent copy
coherent because the issuing owner recomputes it, and must be refused with
exactly its own code. A refused call must add no Storage effect beyond the
injected change and must leave every earlier genuine effect in place.
Unexpected acceptance, a different refusal code, or any other exception fails
the case and the run (nonzero exit).

Usage: python3 scripts/pm_goal_dg_ca_oracles.py [--group C1] [--output out.json]
"""
from __future__ import annotations

import argparse
import ast
import copy
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import time
import traceback

sys.dont_write_bytecode = True

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_own_c_oracles as OWNC
import pm_goal_dg_ca_owners as O
import pm_goal_dg_ca_c1 as C1

HERE = Path(__file__).resolve().parent
REFUSALS = (A.AdapterRefusal, S.StorageRefusal, NR.NumruleRefusal, OWNC.Refusal)
LANE_FILES = ('pm_goal_dg_ca_owners.py', 'pm_goal_dg_ca_c1.py', 'pm_goal_dg_ca_c2.py', 'pm_goal_dg_ca_c3.py', 'pm_goal_dg_ca_c4.py')


def code_of(error):
    if isinstance(error, OWNC.Refusal):
        return str(error)
    return A.refusal_code(error)


class Suite:
    def __init__(self, work):
        self.work = Path(work)
        self.cases = []
        self.n = 0

    def world(self, faults=None):
        self.n += 1
        return O.World(self.work / ('w%05d' % self.n), faults=faults)

    def positive(self, group, name, fn):
        started = time.time()
        try:
            detail = fn()
            self.cases.append(dict(group=group, id=name, kind='positive', status='pass', detail=detail,
                                   seconds=round(time.time() - started, 3)))
        except Exception as error:  # noqa: BLE001
            self.cases.append(dict(group=group, id=name, kind='positive', status='fail',
                                   error='%s: %s' % (type(error).__name__, error), trace=traceback.format_exc()[-1500:]))

    def negative(self, group, name, fn, expected, *, boundary=None, guard=None):
        """``fn`` returns (world, action); ``action`` must refuse with ``expected``.

        Storage cells and Events are snapshotted immediately before ``action``;
        any hook-injected change is recorded by ``world.injected`` and is the
        only Storage difference allowed after the refusal.
        """
        try:
            world, action = fn()
        except Exception as error:  # noqa: BLE001
            self.cases.append(dict(group=group, id=name, kind='negative', expected=expected, status='fail',
                                   got='setup %s: %s' % (type(error).__name__, error), trace=traceback.format_exc()[-1500:]))
            return
        before_cells = copy.deepcopy(world.storage.cells)
        before_events = len(world.storage.events)
        world.injected = []
        try:
            action()
            self.cases.append(dict(group=group, id=name, kind='negative', expected=expected, got='ACCEPTED', status='fail'))
            return
        except REFUSALS as error:
            got = code_of(error)
        except Exception as error:  # noqa: BLE001
            self.cases.append(dict(group=group, id=name, kind='negative', expected=expected, status='fail',
                                   got='%s: %s' % (type(error).__name__, error), trace=traceback.format_exc()[-1500:]))
            return
        ok = got == expected or (expected.endswith('*') and got.startswith(expected[:-1]))
        allowed = {(t, k) for t, k in getattr(world, 'injected', [])}
        changed = sorted({(t, k) for t in set(before_cells) | set(world.storage.cells)
                          for k in set(before_cells.get(t, {})) | set(world.storage.cells.get(t, {}))
                          if before_cells.get(t, {}).get(k) != world.storage.cells.get(t, {}).get(k)} - allowed)
        preserved = not changed and len(world.storage.events) == before_events
        self.cases.append(dict(group=group, id=name, kind='negative', expected=expected, got=got, boundary=boundary,
                               guard=guard or expected, effects_preserved=preserved, unexpected_changes=[list(c) for c in changed][:5],
                               status='pass' if ok and preserved else 'fail'))


# ------------------------------------------------------------------ helpers

def mark(world, table, key):
    world.injected.append((table, key))


def inject_stop(route):
    w = route.world
    record = w.host_stop.record(route.scope)
    w.host_stop.manual(route.scope, 'resume' if record['latched'] else 'stop')
    mark(w, w.host_stop.FAMILY, w.host_stop.key(route.scope))
    for key in w.storage.cells.get(w.host_stop.RECEIPTS, {}):
        mark(w, w.host_stop.RECEIPTS, key)


def inject_body(route):
    w = route.world
    w.goal.mutate_state(route.scope, 'paused' if w.goal.body_cell(route.scope)['value']['record']['state'] != 'paused' else 'active')
    mark(w, w.goal.BODY, w.goal.keys(route.scope)['body'])
    mark(w, w.goal.CONTROL, w.goal.keys(route.scope)['control'])


def inject_control(route):
    w = route.world
    w.goal.reserve_pending(route.scope, w.host_stop.record(route.scope)['user_stop_epoch'])
    mark(w, w.goal.CONTROL, w.goal.keys(route.scope)['control'])


def inject_binding(route):
    w = route.world
    w.binding.transfer_owner_epoch(route.scope)
    mark(w, w.binding.CONTROL, w.binding.keys(route.scope)['control'])


def inject_domain(route):
    route.world.binding.withdraw()


def inject_permission(route):
    w = route.world
    w.permissions.revoke(route.cancel_decision)
    mark(w, w.permissions.FAMILY, route.cancel_decision)


def inject_inventory(route):
    w = route.world
    member = w.scheduler_inventory.add(route.scope, 'pending_callback', dict(callback='TEST_ONLY:late-callback'))
    for key in w.storage.cells.get(w.scheduler_inventory.FAMILY, {}):
        mark(w, w.scheduler_inventory.FAMILY, key)


def inject_accepted(route):
    route.world.sir.restart()


INJECTIONS = (('accepted', inject_accepted), ('permission', inject_permission), ('body', inject_body), ('control', inject_control),
              ('stop', inject_stop), ('binding', inject_binding), ('domain', inject_domain), ('inventory', inject_inventory))

C1_STEPS = ('capture_source', 'latch_and_reserve', 'commit_receipt', 'settle_owner', 'freeze_event', 'append_original',
            'publish_control', 'terminal')


def c1_route(suite, state='active', **kw):
    w = suite.world()
    route = C1.NoAssociationCancel(w, state=state, **kw)
    route.dispatch(route.user_request())
    return w, route


def c1_until(suite, before_step, state='active'):
    """A valid route stopped immediately before ``before_step``."""
    w, route = c1_route(suite, state)
    for step in C1_STEPS:
        if step == before_step:
            break
        getattr(route, step)()
    return w, route


def stored_cells(world, tables):
    return {t: copy.deepcopy(world.storage.cells.get(t, {})) for t in tables}


# ------------------------------------------------------------------ C1

def c1_positive(suite, state):
    w, route = c1_route(suite, state)
    scope = route.scope
    body_before = copy.deepcopy([w.goal.body_cell(scope), w.goal.history_cells(scope)])
    snapshot_before = w.goal.snapshot(scope)
    stop_before = w.host_stop.record(scope)
    prior_receipts = copy.deepcopy(w.storage.cells.get(w.host_stop.RECEIPTS, {}))
    displays = []
    for step in C1_STEPS:
        getattr(route, step)()
        displays.append((step, route.display()))
    # Ordered original method calls.
    top = [m for _, m in w.recorder.sequence(True)]
    A.require('C1/positive/order', top[-len(C1_STEPS):] == list(C1_STEPS))
    # Four-state body, revision and objective history byte-unchanged.
    A.require('C1/positive/body_unchanged', A.same([w.goal.body_cell(scope), w.goal.history_cells(scope)], body_before))
    snapshot_after = w.goal.snapshot(scope)
    A.require('C1/positive/snapshot_body', A.same(snapshot_after['body'], snapshot_before['body']))
    A.require('C1/positive/history', A.same(snapshot_after['revisions'], snapshot_before['revisions']))
    # Prior Stop preserved; the cancellation latch is exactly +1/+1 and latched.
    stop_after = w.host_stop.record(scope)
    A.require('C1/positive/prior_stop_receipts', A.same(prior_receipts, {k: v for k, v in w.storage.cells.get(w.host_stop.RECEIPTS, {}).items()}))
    A.require('C1/positive/stop_epochs', stop_after['user_stop_epoch'] == stop_before['user_stop_epoch'] + 1
              and stop_after['continuation_epoch'] == stop_before['continuation_epoch'] + 1 and stop_after['latched'] is True)
    A.require('C1/positive/prior_stop_nonzero', stop_before['user_stop_epoch'] >= 1 and stop_before['last_original_stop_receipt_ref'] in prior_receipts)
    # Active display removal only after the real publication.
    A.require('C1/positive/display', [d for s, d in displays if s != 'publish_control' and s != 'terminal'] == [state] * 6
              and dict(displays)['publish_control'] == 'cancelled')
    # One Event, Storage-assigned metadata and first custody joined to the publication.
    events = [e for e in w.storage.events]
    A.require('C1/positive/one_event', len(events) == 1)
    stored = w.storage.read_event(events[0])
    progress = route.progress
    A.require('C1/positive/event_template', A.same(S.producer25(stored), progress['producer_input']))
    custody = w.storage.first_custody(stored['event_id'])
    pub = progress['publication']
    A.require('C1/positive/publication_custody', A.same(pub['first_append_receipt'], custody['first_append_receipt'])
              and pub['original_append_result']['sequence_id'] == stored['sequence_id'])
    A.require('C1/positive/storage_times', stored['observed_at_utc'] <= stored['persisted_at_utc'])
    # Terminal published once through the append reservation (Phase D).
    r = w.storage.reservation_state(route.operation_id)
    A.require('C1/positive/terminal_published', r['state'] == 'published')
    terminal = w.value('goal_cancel_terminal_audit', route.key('goal_cancel_terminal_audit'))['record']
    A.require('C1/positive/terminal_value', A.same(terminal, route.terminal_value) and terminal['kind'] == 'succeeded')
    # Immutable duplicate replay.
    replay = route.replay(copy.deepcopy(route.request))
    A.require('C1/positive/replay', A.same(replay, terminal))
    # Equal Event retry: lost-ack retry on the same operation and dedupe under a new one.
    count = len(w.storage.events)
    _, _, outcome = w.appender.append_original(route.operation_id, route.append_request, [copy.deepcopy(progress['producer_input'])])
    A.require('C1/positive/lost_ack_retry', outcome['status'] == 'already_appended' and len(w.storage.events) == count)
    _, _, outcome = w.appender.append_original(route.operation_id + ':retry', route.append_request, [copy.deepcopy(progress['producer_input'])])
    A.require('C1/positive/dedupe_retry', outcome['status'] == 'dedupe' and len(w.storage.events) == count)
    # Every stored part and operation measured in the actual Storage codec.
    sizes = {}
    for table, rows in w.storage.cells.items():
        for key, cell in rows.items():
            sizes['%s:%s' % (table, key[:40])] = len(S.canonical(cell['value']))
            A.require('C1/positive/stored_part', sizes['%s:%s' % (table, key[:40])] <= S.STORED_PART_CAP)
            A.require('C1/positive/operation_part', len(S.canonical(dict(physical_key=key, value=cell['value']))) <= S.STORED_PART_CAP)
    # Lawful retained audit after a later current change and SP-423 withdrawal.
    w.host_stop.manual(scope, 'resume')
    w.binding.withdraw()
    audits = {m: route.audit_read(m)['kind'] for m in ('source_audit', 'stop_receipt', 'cancellation_receipt', 'control_publication', 'terminal', 'progress_head')}
    A.require('C1/positive/retained_audit', set(audits.values()) == set(audits))
    return dict(state=state, recorder=top, event_id=stored['event_id'], sequence_id=stored['sequence_id'],
                stop_before=[stop_before['user_stop_epoch'], stop_before['continuation_epoch']],
                stop_after=[stop_after['user_stop_epoch'], stop_after['continuation_epoch']],
                displays=displays, max_stored_part=max(sizes.values()), stored_parts=len(sizes),
                recorder_calls=len(w.recorder.calls))


def c1_positive_lost_ack(suite):
    w, route = c1_until(suite, 'append_original')
    A.require('C1/lost_ack/none', route.append_original(lose_ack=True) is None)
    A.require('C1/lost_ack/unknown_phase', route.progress['phase'] == 'event_unknown')
    publication = route.resolve_original()
    custody = w.storage.first_custody(publication['event_id'])
    A.require('C1/lost_ack/same_receipt', A.same(publication['first_append_receipt'], custody['first_append_receipt']))
    route.publish_control()
    route.terminal()
    A.require('C1/lost_ack/one_event', len(w.storage.events) == 1)
    return dict(event_id=publication['event_id'], phases='event_ready>event_unknown>event_issued>control_published>terminal')


def c1_positive_terminal_lost_ack(suite):
    w, route = c1_until(suite, 'terminal')
    try:
        route.terminal(lose_ack=True)
        raise AssertionError('lost terminal ack not raised')
    except A.AdapterRefusal as error:
        A.require('C1/terminal_lost_ack/code', error.code == 'C1/terminal/ack_lost')
    replay = route.replay(copy.deepcopy(route.request))
    A.require('C1/terminal_lost_ack/replay', replay['kind'] == 'succeeded')
    return dict(replayed=True)


def c1_positive_unknown_terminal(suite):
    """Unknown stays unknown: truthful recovery_required, never later rewritten."""
    w, route = c1_until(suite, 'append_original')
    route.append_original(lose_ack=True)
    terminal = route.terminal('unknown')
    A.require('C1/unknown/kind', terminal['kind'] == 'unknown' and terminal['result']['event_effect'] == 'unknown')
    route.resolve_original()
    route.publish_control()
    try:
        route.terminal('succeeded')
        raise AssertionError('terminal rewritten')
    except A.AdapterRefusal as error:
        A.require('C1/unknown/immutable', error.code == 'C1/terminal/already_issued')
    stored = w.value('goal_cancel_terminal_audit', route.key('goal_cancel_terminal_audit'))['record']
    A.require('C1/unknown/stored', stored['kind'] == 'unknown')
    return dict(terminal='unknown', later_success_refused=True)


def c1_positive_no_effect(suite):
    """A genuine pre-latch permission revocation: truthful no_effect, Stop untouched."""
    w, route = c1_until(suite, 'latch_and_reserve')
    w.permissions.revoke(route.cancel_decision)
    stop = w.host_stop.record(route.scope)
    terminal = route.terminal('no_effect')
    A.require('C1/no_effect/kind', terminal['kind'] == 'no_effect')
    A.require('C1/no_effect/stop_unchanged', A.same(w.host_stop.record(route.scope), stop))
    A.require('C1/no_effect/no_event', len(w.storage.events) == 0)
    return dict(terminal='no_effect')


def c1_positive_capture_retry(suite):
    w, route = c1_until(suite, 'latch_and_reserve')
    generation = w.storage.cell_generation
    source = route.capture_source()
    A.require('C1/capture_retry/same', A.same(source, route.source) and w.storage.cell_generation == generation)
    return dict(equal_retry_no_effect=True)


def c1_positive_held_reader(suite):
    w, route = c1_until(suite, 'capture_source')
    held = route.hold_current_read()
    route.release_held(held)
    return dict(held_reader_released=True)


def c1_cases(suite):
    G = 'C1'
    for state in C1.LEGAL_STATES:
        suite.positive(G, 'C1/positive/%s' % state, lambda s=state: c1_positive(suite, s))
    suite.positive(G, 'C1/positive/append_lost_ack_resolution', lambda: c1_positive_lost_ack(suite))
    suite.positive(G, 'C1/positive/terminal_lost_ack_replay', lambda: c1_positive_terminal_lost_ack(suite))
    suite.positive(G, 'C1/positive/unknown_terminal_immutable', lambda: c1_positive_unknown_terminal(suite))
    suite.positive(G, 'C1/positive/pre_latch_no_effect', lambda: c1_positive_no_effect(suite))
    suite.positive(G, 'C1/positive/capture_equal_retry', lambda: c1_positive_capture_retry(suite))
    suite.positive(G, 'C1/positive/held_reader_release', lambda: c1_positive_held_reader(suite))

    # --- entry: state, request and sources ---------------------------------
    def completed():
        w = suite.world()
        route = C1.NoAssociationCancel(w, state='completed')
        route.dispatch(route.user_request())
        return w, route.capture_source
    suite.negative(G, 'C1/entry/completed_goal', completed, 'C1/capture_source/legal_state', boundary='capture_source/entry')

    def already_cancelled():
        w, route = c1_route(suite)
        route.run()
        route.dispatch(route.user_request(expected_revision=route.request['expected_revision']))
        return w, route.capture_source
    suite.negative(G, 'C1/entry/already_cancelled_new_operation', already_cancelled, 'C1/capture_source/not_cancelled', boundary='capture_source/entry')

    def stale_revision():
        w = suite.world()
        route = C1.NoAssociationCancel(w, state='active')
        old = copy.deepcopy(w.goal.body_cell(route.scope)['value']['record'])
        w.goal.mutate_state(route.scope, 'paused')
        route.dispatch(route.user_request(expected_revision=old['revision'], expected_currentness_hash=old['currentness_hash']))
        return w, route.capture_source
    suite.negative(G, 'C1/entry/stale_revision_coherent_hash', stale_revision, 'C1/capture_source/expected_revision', boundary='capture_source/entry')

    def foreign_currentness():
        w, route = c1_route(suite)
        other = suite.world()
        foreign = C1.NoAssociationCancel(other, state='active')
        body = other.goal.body_cell(foreign.scope)['value']['record']
        route.dispatch(route.user_request(expected_currentness_hash=body['currentness_hash']))
        return w, route.capture_source
    suite.negative(G, 'C1/entry/foreign_currentness_same_revision', foreign_currentness, 'C1/capture_source/expected_currentness', boundary='capture_source/entry')

    for label, value in (('string', '1'), ('float', 1.0), ('bool', True), ('null', None), ('array', [1]), ('object', {'r': 1})):
        def wrong_type(v=value):
            w, route = c1_route(suite)
            request = dict(route.request, expected_revision=v)
            return w, lambda: route.capture_source(request)
        suite.negative(G, 'C1/entry/expected_revision_%s' % label, wrong_type, 'check/float_number' if label == 'float' else 'roots/schema/*',
                       boundary='capture_source/entry', guard='GoalCancelRequestV2.expected_revision')

    def unaccepted():
        w, route = c1_route(suite)
        request = dict(route.request, return_route_ref=O.uid('TEST_ONLY:return-route'))
        return w, lambda: route.capture_source(request)
    suite.negative(G, 'C1/entry/request_not_the_accepted_dispatch', unaccepted, 'C1/capture_source/accepted_dispatch', boundary='capture_source/entry')

    def altered_dispatch():
        w, route = c1_route(suite)
        request = dict(route.request, return_route_ref=O.uid('TEST_ONLY:return-route'))
        return w, lambda: w.sir.accept(request)
    suite.negative(G, 'C1/entry/altered_dispatch_same_instance', altered_dispatch, 'sir/dispatch_conflict', boundary='sir/accept')

    def transport_handle():
        w, route = c1_route(suite)
        return w, lambda: route.capture_source(sir_handle=dict(original_ref='TEST_ONLY:transport'))
    suite.negative(G, 'C1/entry/transport_dict_for_dispatch', transport_handle, 'original/handle_type', boundary='capture_source/entry')

    def foreign_owner_handle():
        w, route = c1_route(suite)
        rogue = O.SIROwner.__new__(O.SIROwner)
        A.TestOwner.__init__(rogue, A.OwnerRegistry())
        handle = rogue._issue(None, dict(x=1), kind='accepted_dispatch')
        return w, lambda: route.capture_source(sir_handle=handle)
    suite.negative(G, 'C1/entry/dispatch_handle_from_unregistered_owner', foreign_owner_handle, 'original/issuer', boundary='capture_source/entry')

    def revoked():
        w, route = c1_route(suite)
        w.permissions.revoke(route.cancel_decision)
        return w, route.capture_source
    suite.negative(G, 'C1/entry/permission_revoked', revoked, 'C1/capture_source/permission', boundary='capture_source/entry')

    def wrong_action_permission():
        w, route = c1_route(suite)
        _, other = w.permissions.grant(route.actor_ref, copy.deepcopy(route.scope), 'goal.update')
        route.cancel_decision = other
        route.dispatch(route.user_request(permission_snapshot_ref=other))
        return w, route.capture_source
    suite.negative(G, 'C1/entry/permission_for_other_action', wrong_action_permission, 'C1/capture_source/permission', boundary='capture_source/entry')

    def pending_body():
        w, route = c1_route(suite)
        w.goal.reserve_pending(route.scope, w.host_stop.record(route.scope)['user_stop_epoch'])
        return w, route.capture_source
    suite.negative(G, 'C1/entry/unknown_pending_body_operation', pending_body, 'C1/capture_source/pending_unresolved', boundary='capture_source/entry')

    for owner_attr, role, kind in (('plan_inventory', 'plan_association', 'assistant_plan_run'),
                                   ('workflow_inventory', 'workflow_association', 'workflow_run'),
                                   ('scheduler_inventory', 'scheduler_association', 'pending_admission')):
        def nonempty(a=owner_attr, k=kind):
            w, route = c1_route(suite)
            getattr(w, a).add(route.scope, k, dict(detail='TEST_ONLY:genuine-member'))
            return w, route.capture_source
        suite.negative(G, 'C1/entry/false_empty_%s' % role, nonempty, 'C1/capture_source/inventory_nonempty/' + role, boundary='capture_source/after_binding_read')

        def missing(a=owner_attr):
            w, route = c1_route(suite)
            getattr(w, a).available = False
            return w, route.capture_source
        suite.negative(G, 'C1/entry/missing_database_%s' % role, missing, 'inventory/unavailable/' + role, boundary='capture_source/after_binding_read')

        def caller_empty(a=owner_attr):
            w, route = c1_route(suite)
            getattr(w, a).inventory = lambda scope: dict(members=[], complete=True)
            return w, route.capture_source
        suite.negative(G, 'C1/entry/caller_supplied_empty_%s' % role, caller_empty, 'original/handle_type', boundary='capture_source/after_binding_read')

    def withdrawn_before():
        w, route = c1_route(suite)
        w.binding.withdraw()
        return w, route.capture_source
    suite.negative(G, 'C1/entry/writer_domain_withdrawn', withdrawn_before, 'C1/capture_source/writer_cutoff', boundary='capture_source/entry')

    def goal_id_trailing_lf():
        w, route = c1_route(suite)
        route.dispatch(route.user_request(goal_id=route.scope['goal_id'] + '\n'))
        return w, route.capture_source
    suite.negative(G, 'C1/entry/goal_id_trailing_lf', goal_id_trailing_lf, 'C1/capture_source/scope', boundary='capture_source/entry')

    # --- every returning helper and final boundary --------------------------
    probe_w, probe = c1_route(suite)
    probe.run()
    points = list(dict.fromkeys(probe.visited))
    for method, point in points:
        if method == 'birth_none':
            continue
        for source, hook in INJECTIONS:
            def drift(m=method, p=point, h=hook):
                w, route = c1_until(suite, m)
                route.inject[(m, p)] = h
                return w, getattr(route, m)
            expected = 'C1/%s/%s/%s' % (method, point, source)
            if source in ('body', 'control') and method not in ('capture_source', 'latch_and_reserve'):
                # The pending cancellation reservation (then the published control) fences body/control writers.
                expected = 'goal/pending_cancel_fenced' if source == 'control' else (
                    'goal/mutation_cancelled' if method == 'terminal' else 'goal/mutation_cancel_pending')
            if source == 'inventory' and method in ('freeze_event', 'append_original', 'publish_control', 'terminal', 'commit_receipt',
                                                    'latch_and_reserve', 'settle_owner'):
                expected = 'C1/%s/%s/%s' % (method, point, source)
            suite.negative(G, 'C1/boundary/%s/%s/%s' % (method, point, source), drift, expected,
                           boundary='%s/%s' % (method, point), guard='C1/%s/%s/%s' % (method, point, source))

    # --- independently invoked lower methods out of order --------------------
    for step, before in (('latch_and_reserve', 'capture_source'), ('commit_receipt', 'latch_and_reserve'),
                         ('settle_owner', 'commit_receipt'), ('freeze_event', 'settle_owner'),
                         ('append_original', 'freeze_event'), ('publish_control', 'append_original'),
                         ('terminal', 'publish_control')):
        def early(s=step, b=before):
            w, route = c1_until(suite, b)
            return w, getattr(route, s)
        suite.negative(G, 'C1/lower/%s_before_%s' % (step, before), early, 'C1/%s/phase' % step, boundary=step + '/entry')

    for step in ('latch_and_reserve', 'commit_receipt', 'settle_owner', 'freeze_event', 'append_original', 'publish_control'):
        def substituted_progress(s=step):
            w, route = c1_until(suite, s)
            route.progress = dict(route.progress, resolution_owner_ref=O.uid('TEST_ONLY:other-resolution-owner'))
            return w, getattr(route, s)
        suite.negative(G, 'C1/lower/%s_caller_progress' % step, substituted_progress, 'C1/%s/progress_custody' % step, boundary=step + '/entry')

        def substituted_source(s=step):
            w, route = c1_until(suite, s)
            route.source = dict(route.source, captured_at='2000-01-01T00:00:00.000Z')
            return w, getattr(route, s)
        suite.negative(G, 'C1/lower/%s_caller_source' % step, substituted_source, 'C1/%s/source_custody' % step, boundary=step + '/entry')

    # --- append, custody and retry ------------------------------------------
    def changed_candidate():
        w, route = c1_until(suite, 'append_original')
        def edit(p):
            p = copy.deepcopy(p)
            p['actor_ref'] = O.uid('TEST_ONLY:person')
            return p
        return w, lambda: route.append_original(candidate_edit=edit)
    suite.negative(G, 'C1/append/changed_candidate', changed_candidate, 'C1/append_original/frozen_producer', boundary='append_original/entry')

    def replay_only_normal():
        w, route = c1_until(suite, 'append_original')
        p = dict(route.progress['producer_input'], replay_policy='projector_replay_only')
        return w, lambda: w.appender.append_original(route.operation_id, dict(kind='replay-only'), [p])
    suite.negative(G, 'C1/append/replay_only_normal', replay_only_normal, 'append/candidate/replay_policy/numrule/replay_only_not_appendable',
                   boundary='storage/append')

    def replay_only_equal_retry():
        w, route = c1_until(suite, 'publish_control')
        p = dict(route.progress['producer_input'], replay_policy='projector_replay_only')
        return w, lambda: w.appender.append_original(route.operation_id + ':retry', dict(kind='replay-only'), [p])
    suite.negative(G, 'C1/append/replay_only_equal_retry', replay_only_equal_retry, 'append/candidate/replay_policy/numrule/replay_only_not_appendable',
                   boundary='storage/append')

    def altered_producer_retry():
        w, route = c1_until(suite, 'publish_control')
        p = dict(route.progress['producer_input'], actor_ref=O.uid('TEST_ONLY:person'))
        return w, lambda: w.appender.append_original(route.operation_id + ':retry', dict(kind='altered'), [p])
    suite.negative(G, 'C1/append/altered_producer_retry', altered_producer_retry, 'append/conflict/producer25', boundary='storage/append')

    def storage_metadata_supplied():
        w, route = c1_until(suite, 'append_original')
        p = dict(route.progress['producer_input'], sequence_id=0)
        return w, lambda: w.appender.append_original(route.operation_id + ':meta', dict(kind='meta'), [p])
    suite.negative(G, 'C1/append/caller_sequence_id', storage_metadata_supplied, 'append/candidate/storage_metadata_supplied/sequence_id',
                   boundary='storage/append')

    for field, value in (('sequence_id', 'plus_one'), ('durable_end_offset', 'plus_one'), ('acknowledged_at_utc', '2000-01-01T00:00:00.000Z')):
        def substituted_receipt(f=field, v=value):
            w, route = c1_until(suite, 'publish_control')
            pub = copy.deepcopy(route.progress['publication'])
            pub['first_append_receipt'][f] = pub['first_append_receipt'][f] + 1 if v == 'plus_one' else v
            route.progress = dict(route.progress, publication=pub)
            stored = w.value('goal_cancel_progress', route.progress_key(route.progress['progress_epoch']))
            # Keep the custody join coherent with the substituted copy so the receipt is the only defect.
            head_key = route.key('goal_cancel_progress') + ':head'
            w.storage.cells['goal_cancel_progress'][route.progress_key(route.progress['progress_epoch'])]['value'] = route.wrap('StorageProgress', route.progress)
            w.storage.cells['goal_cancel_progress'][head_key]['value'] = route.wrap('StorageProgress', route._head(route.progress['progress_epoch'], route.progress))
            return w, route.publish_control
        suite.negative(G, 'C1/custody/substituted_receipt_%s' % field, substituted_receipt, 'custody/receipt_mismatch',
                       boundary='publish_control/entry')

    def resolve_without_event():
        w, route = c1_until(suite, 'append_original')
        progress = route._progress('event_unknown', publication=None)
        w.write(route._progress_writes(progress))
        route.progress = progress
        return w, route.resolve_original
    suite.negative(G, 'C1/custody/unknown_without_append_stays_unknown', resolve_without_event, 'C1/resolve_original/event_unknown',
                   boundary='resolve_original/entry')

    def no_effect_after_latch():
        w, route = c1_until(suite, 'commit_receipt')
        w.permissions.revoke(route.cancel_decision)
        return w, lambda: route.terminal('no_effect')
    suite.negative(G, 'C1/terminal/no_effect_after_latch', no_effect_after_latch, 'C1/terminal/phase', boundary='terminal/entry')

    def second_terminal():
        w, route = c1_route(suite)
        route.run()
        return w, route.terminal
    suite.negative(G, 'C1/terminal/second_terminal', second_terminal, 'C1/terminal/already_issued', boundary='terminal/entry')

    def held_after_withdrawal():
        w, route = c1_until(suite, 'capture_source')
        held = route.hold_current_read()
        w.binding.withdraw()
        return w, lambda: route.release_held(held)
    suite.negative(G, 'C1/withdrawal/held_reader_invalidated', held_after_withdrawal, 'C1/held_reader/withdrawn', boundary='held_reader/release')

    def new_after_withdrawal():
        w, route = c1_route(suite)
        route.run()
        w.binding.withdraw()
        other = C1.NoAssociationCancel(w, birth=False)
        other.scope, other.cancel_decision, other.actor_ref = route.scope, route.cancel_decision, route.actor_ref
        return w, lambda: route.world.binding.require_writer('goal_birth')
    suite.negative(G, 'C1/withdrawal/writer_cutoff_new_writer', new_after_withdrawal, 'domain/writer_withdrawn', boundary='domain/writer')

    def disabled_registration():
        w = suite.world()
        w.registration.register_all()
        _, decision = w.permissions.grant(w.binding.owner_id, {'storage_instance_id': w.storage_id}, 'install')
        w.binding.install_writer_domain(w.permissions.selection(decision))
        w.registration.disable('goal_birth')
        route = C1.NoAssociationCancel(w, birth=False)
        _, create = w.permissions.grant(route.actor_ref, {'storage_instance_id': w.storage_id}, 'goal.create')
        return w, lambda: route.birth_none('TEST_ONLY objective', create)
    suite.negative(G, 'C1/birth/disabled_goal_birth_writer', disabled_registration, 'domain/writer_registered/goal_birth', boundary='birth_none/entry')

    def oversize_birth():
        w = suite.world()
        w.registration.register_all()
        _, decision = w.permissions.grant(w.binding.owner_id, {'storage_instance_id': w.storage_id}, 'install')
        w.binding.install_writer_domain(w.permissions.selection(decision))
        route = C1.NoAssociationCancel(w, birth=False)
        _, create = w.permissions.grant(route.actor_ref, {'storage_instance_id': w.storage_id}, 'goal.create')
        return w, lambda: route.birth_none('🌱' * 4000, create)
    suite.negative(G, 'C1/size/oversize_body_refused_before_effect', oversize_birth, 'tx/stored_part_cap', boundary='birth_none/final')

    # --- schema seams on the actual captured records (wrong-type forms) ---
    for label, value in (('string', '2'), ('float', 2.0), ('bool', True), ('null', None), ('array', [2]), ('object', {'e': 2})):
        def seam(v=value):
            w, route = c1_until(suite, 'latch_and_reserve')
            source = dict(route.source, captured_user_stop_epoch=v)
            return w, lambda: route.check('SourceAudit', source)
        suite.negative(G, 'C1/seam/captured_user_stop_epoch_%s' % label, seam, 'check/float_number' if label == 'float' else 'roots/schema/*',
                       boundary='schema/SourceAudit',
                       guard='SourceAudit.captured_user_stop_epoch')


# ------------------------------------------------------------------ guards

def guard_sites():
    """Every literal ``require('<code>', ...)`` site in this lane's new files."""
    sites = []
    for name in LANE_FILES:
        path = HERE / name
        if not path.exists():
            continue
        tree = ast.parse(path.read_text())
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and getattr(node.func, 'id', getattr(node.func, 'attr', None)) == 'require' and node.args:
                arg = node.args[0]
                if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
                    code = arg.value
                elif isinstance(arg, ast.BinOp) or isinstance(arg, ast.JoinedStr) or isinstance(arg, ast.Call):
                    code = ast.unparse(arg)
                else:
                    code = ast.unparse(arg)
                sites.append(dict(file='scripts/' + name, line=node.lineno, code=code))
    return sites


def guard_inventory(cases):
    sites = guard_sites()
    observed = {}
    for case in cases:
        if case['kind'] == 'negative' and case['status'] == 'pass':
            observed.setdefault(case['got'], []).append(case['id'])
    rows = []
    for site in sites:
        code = site['code']
        if '%' in code or '+' in code or '{' in code or '(' in code:
            pattern = re.escape(code.split("'")[1]) if "'" in code else None
            hits = sorted({c for got, ids in observed.items() for c in ids if pattern and got.startswith(code.split("'")[1].split('%')[0])})
        else:
            hits = observed.get(code, [])
        rows.append(dict(site, negatives=hits[:50], negative_count=len(hits)))
    return dict(qualification='TEST_ONLY', native=O.NATIVE_LINE, sites=rows,
                observed_codes={k: v for k, v in sorted(observed.items())},
                without_negative=[r for r in rows if r['negative_count'] == 0])


# ------------------------------------------------------------------ main

GROUPS = {'C1': c1_cases}


def load_extra_groups():
    for group, module in (('C2', 'pm_goal_dg_ca_c2_cases'), ('C3', 'pm_goal_dg_ca_c3_cases'), ('C4', 'pm_goal_dg_ca_c4_cases')):
        if (HERE / (module + '.py')).exists():
            GROUPS[group] = __import__(module).cases


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--group', action='append')
    parser.add_argument('--output')
    parser.add_argument('--guards')
    parser.add_argument('--filter')
    args = parser.parse_args()
    load_extra_groups()
    work = Path(tempfile.mkdtemp(prefix='pm-dg-ca-'))
    suite = Suite(work)
    started = time.time()
    try:
        for group in args.group or sorted(GROUPS):
            GROUPS[group](suite)
    finally:
        shutil.rmtree(work, ignore_errors=True)
    cases = [c for c in suite.cases if not args.filter or args.filter in c['id']]
    failures = [c for c in cases if c['status'] != 'pass']
    summary = {}
    for c in cases:
        row = summary.setdefault(c['group'], dict(positives=0, negatives=0, failures=0))
        row['positives' if c['kind'] == 'positive' else 'negatives'] += 1
        row['failures'] += c['status'] != 'pass'
    result = dict(qualification='TEST_ONLY', native=O.NATIVE_LINE, lane='DG-CA', family='goal.cancelled',
                  summary=summary, positives=sum(r['positives'] for r in summary.values()),
                  negatives=sum(r['negatives'] for r in summary.values()), failures=len(failures),
                  status='pass' if not failures else 'fail', seconds=round(time.time() - started, 1), cases=cases)
    if args.output:
        Path(args.output).write_text(json.dumps(result, indent=1, sort_keys=True, ensure_ascii=False, default=str) + '\n')
    if args.guards:
        Path(args.guards).write_text(json.dumps(guard_inventory(cases), indent=1, sort_keys=True, ensure_ascii=False) + '\n')
    print(json.dumps(dict(status=result['status'], summary=summary, seconds=result['seconds'],
                          failures=[(f['id'], f.get('expected'), f.get('got') or f.get('error'), f.get('unexpected_changes'))
                                    for f in failures][:60]), indent=1, ensure_ascii=False, default=str))
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
