#!/usr/bin/env python3
"""DG-CA3 C3 corpus: goal.cancelled original Workflow route (GRS-078) on DG-CA's framework (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Every positive is the complete original path executed by the registered TEST_ONLY
owners; every negative starts from a valid complete case, makes one genuine owner
change (or presents one substituted/transport-shaped value) at one boundary, and
must refuse with exactly its own code while leaving Storage changed only by the
injected change (DG-CA's ``Suite.negative``).
"""
from __future__ import annotations

import copy

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_dg_ca_owners as O
import pm_goal_dg_ca_oracles as DGO
import pm_goal_dg_ca3_native as N
import pm_goal_dg_ca3_route as R
from pm_goal_dg_ca_owners import row_sha, same, uid

G = 'C3'
STEPS = R.WorkflowCancel.STEPS
PRE_STOP = ('capture_source', 'prepare', 'latch_and_reserve')


def wf(suite, **kw):
    suite.n += 1
    w = R.workflow_world(suite.work / ('c3-%05d' % suite.n))
    r = R.WorkflowCancel(w, **kw)
    r.dispatch(r.user_request())
    return w, r


def until(suite, before, **kw):
    w, r = wf(suite, **kw)
    for name in STEPS:
        if name == before:
            break
        (r.run_native if name == 'native' else getattr(r, name))()
    return w, r


def mark(w, table, key):
    """Record an injected change; setup-time changes precede the Suite's snapshot and need no mark."""
    w.__dict__.setdefault('injected', []).append((table, key))


def mark_all(w, table):
    for key in w.storage.cells.get(table, {}):
        mark(w, table, key)


# ------------------------------------------------------------------ native source injections

def inject_run(route):
    """A genuine later native run transition: the D01 pointer and body move."""
    w, n = route.world, route.world.native
    n.run.transition(route.wf_run, 'blocked', route.scope)
    mark_all(w, n.run.BODY)
    mark_all(w, n.run.CONTROL)
    mark_all(w, n.run.POINTER)


def inject_writers(route):
    """A genuine change in the exhaustive native writer inventory."""
    w, n = route.world, route.world.native
    n.writers.disable('scheduler')
    mark_all(w, 'TEST_ONLY:native_writer_inventory')


PRE = DGO.INJECTIONS + (('run', inject_run), ('writers', inject_writers))
POST = tuple((k, f) for k, f in PRE if k not in ('body', 'control'))


# ------------------------------------------------------------------ positives

def positive(suite, state='active', run_status='running', effects=None):
    w, r = wf(suite, state=state, run_status=run_status, effects=effects)
    scope, n = r.scope, w.native
    body_before = copy.deepcopy([w.goal.body_cell(scope), w.goal.history_cells(scope)])
    stop_before = w.host_stop.record(scope)
    prior_receipts = copy.deepcopy(w.storage.cells.get(w.host_stop.RECEIPTS, {}))
    run_before = n.run.current(r.wf_run)[1]
    started = r.wf_run['start']['event_id']
    displays = []
    for name in STEPS:
        (r.run_native if name == 'native' else getattr(r, name))()
        displays.append((name, r.display()))
    top = [m for o, m in w.recorder.sequence(True) if o == r.coordinator_id]
    route_calls = list(top)
    A.require('C3/positive/order', [m for m in top if m in STEPS] == [s for s in STEPS if s != 'native'])
    # Goal body/revision/history byte-unchanged; prior Stop preserved; latch +1/+1.
    A.require('C3/positive/body_unchanged', same([w.goal.body_cell(scope), w.goal.history_cells(scope)], body_before))
    stop_after = w.host_stop.record(scope)
    A.require('C3/positive/prior_stop_receipts', same(prior_receipts, w.storage.cells.get(w.host_stop.RECEIPTS, {})))
    A.require('C3/positive/stop_epochs', stop_after['user_stop_epoch'] == stop_before['user_stop_epoch'] + 1 and stop_after['latched'] is True)
    A.require('C3/positive/display', [d for s, d in displays if s not in ('publish_control', 'terminal_succeeded')] == [state] * (len(STEPS) - 2)
              and dict(displays)['publish_control'] == 'cancelled')
    # The native disposition: positive D06 over a resolved D05, distinct operations and genuine causal links.
    rb = n.d06.readback(r.wf_run, scope)['d06_readback']
    d05 = rb['safe_stop']['whole_original_safe_stop']
    ops = {r.operation_id, rb['result']['operation_id'], d05['operation_id'], r.wf_run['start']['operation_id']}
    A.require('C3/positive/distinct_operations', len(ops) == 4)
    A.require('C3/positive/d05_goal_stop', d05['source_readback']['goal_stop']['original_stop_receipt'] == r.progress['stop_receipt'])
    A.require('C3/positive/d06_causation', rb['origin']['causation'] == N.src_sel(w, n.d06.INTENT, r.wf_run['d06']['intent_key']))
    run_after = n.run.current(r.wf_run)[1]
    goal_events = [e for e, info in w.storage.events.items() if w.storage.read_event(e)['event_type'] == 'goal.cancelled']
    run_events = [e for e in w.storage.events if w.storage.read_event(e)['event_type'] == 'goal_run.cancelled']
    if run_status in N.TERMINAL:
        A.require('C3/positive/preserved', rb['kind'] == 'terminal_preserved' and same(run_after, run_before) and run_events == [])
    else:
        A.require('C3/positive/cancelled_run', rb['kind'] == 'cancelled_from_nonterminal' and run_after['record']['status'] == 'cancelled'
                  and run_after['record']['revision'] == run_before['record']['revision'] + 1 and len(run_events) == 1)
        ev = w.storage.read_event(run_events[0])
        A.require('C3/positive/run_event_cause', ev['causation_event_id'] == started and w.storage.first_custody(run_events[0]) is not None)
        settled = bool(d05['original_result']['settlements'])
        A.require('C3/positive/mutation_from_effects', ev['payload']['payload']['mutation_started'] is settled
                  and len(ev['payload']['payload']['settlement_refs']) == len(d05['original_result']['settlements']))
    # One Goal Event; only the Storage sequence/times differ from the fixed template; sequence == late reservation.
    A.require('C3/positive/one_goal_event', len(goal_events) == 1)
    stored = w.storage.read_event(goal_events[0])
    A.require('C3/positive/late_sequence', stored['sequence_id'] == r.late_reservation['reserved_sequence_id'])
    A.require('C3/positive/template', same(S.producer25(stored), r.progress['producer_input']))
    audit = w.value(R.LATE_AUDIT, r.late_audit_key)['record']
    A.require('C3/positive/audit_producer', audit['producer_semantic_digest'] == w.storage.first_custody(stored['event_id'])['producer_semantic_digest'])
    # Scope proof and the workflow_settled arm join the actual D06/D05 wrappers.
    proof = w.value(R.SCOPE_PROOF, r.scope_proof_key)['record']
    A.require('C3/positive/scope_proof', proof['d06_disposition'] == rb['kind'] and proof['goal_run_id'] == r.wf_run['run_scope']['goal_run_id']
              and r.progress['owner_settlement']['kind'] == 'workflow_settled')
    # Every stored part in the actual codec under the cap.
    biggest = max(len(S.canonical(c['value'])) for rows in w.storage.cells.values() for c in rows.values())
    A.require('C3/positive/stored_part', biggest <= S.STORED_PART_CAP)
    # Immutable duplicate replay; lawful retained audit after later current change and SP-423 withdrawal.
    terminal = w.value('goal_cancel_terminal_audit', r.key('goal_cancel_terminal_audit'))['record']
    A.require('C3/positive/replay', same(r.replay(copy.deepcopy(r.request)), terminal))
    w.host_stop.manual(scope, 'resume')
    n.run.transition(r.wf_run, 'stopped', scope)
    w.binding.withdraw()
    A.require('C3/positive/retained_success', r.read_retained_success()['value']['kind'] == 'succeeded')
    return dict(state=state, run_status=run_status, d06=rb['kind'], goal_event=stored['event_id'], sequence=stored['sequence_id'],
                run_events=len(run_events), settlements=len(d05['original_result']['settlements']), max_stored_part=biggest,
                ancillary_originals=n.ancillary_count, route_calls=route_calls)


def positive_unresolved(suite, outcome, expected):
    """D05 unresolved (genuine owner state): D06 positive refuses, settlement refuses, truthful unknown terminal."""
    w, r = until(suite, 'native', effects=dict(drain=outcome))
    d05 = r.run_native()
    A.require('C3/unresolved/d05', d05['resolved'] is False and d05['codes'][0] == expected and d05['d06_refusal'] == expected)
    stored = w.value(N.D05Owner.RESULT, r.wf_run['d05']['result_key'])['value']
    A.require('C3/unresolved/aggregate_issued', stored['disposition'] != 'bounded_original_safe_stop_resolved'
              and stored['original_terminal_requirement'] == 'not_ready')
    try:
        r.settle_owner()
        raise AssertionError('settled over an unresolved D05')
    except A.AdapterRefusal as error:
        A.require('C3/unresolved/settle_refused', error.code == 'd06/not_published')
    terminal = r.terminal_unsettled('unknown')
    A.require('C3/unresolved/terminal', terminal['kind'] == 'unknown' and terminal['result']['receipt_effect'] == 'committed')
    A.require('C3/unresolved/stop_preserved', w.host_stop.record(r.scope)['latched'] is True)
    A.require('C3/unresolved/retained', r.read_retained_unsettled()['value']['kind'] == 'unknown')
    A.require('C3/unresolved/replay', same(r.replay(copy.deepcopy(r.request)), terminal))
    return dict(outcome=sorted(map(str, outcome)), code=expected)


def positive_no_effect(suite):
    w, r = until(suite, 'prepare')
    w.permissions.revoke(r.cancel_decision)
    stop = w.host_stop.record(r.scope)
    terminal = r.terminal_unsettled('no_effect')
    A.require('C3/no_effect/kind', terminal['kind'] == 'no_effect' and same(w.host_stop.record(r.scope), stop))
    A.require('C3/no_effect/no_goal_event', not any(w.storage.read_event(e)['event_type'] == 'goal.cancelled' for e in w.storage.events))
    A.require('C3/no_effect/no_native', 'd05' not in r.wf_run and w.native.effects.members[r.wf_run['run_scope']['goal_run_id']].get('flush') is None)
    A.require('C3/no_effect/retained', r.read_retained_unsettled()['value']['kind'] == 'no_effect')
    return dict(terminal='no_effect')


def positive_lost_ack(suite):
    w, r = until(suite, 'append_original')
    A.require('C3/lost_ack/none', r.append_original(lose_ack=True) is None and r.progress['phase'] == 'event_unknown')
    readback = r.resolve_original()
    r.publish_control()
    r.terminal_succeeded()
    goal_events = [e for e in w.storage.events if w.storage.read_event(e)['event_type'] == 'goal.cancelled']
    A.require('C3/lost_ack/one_event', len(goal_events) == 1 and readback['event']['event_id'] == goal_events[0])
    return dict(phases='event_ready>event_unknown>event_issued>control_published>terminal')


def positive_unknown_immutable(suite):
    w, r = until(suite, 'append_original')
    r.append_original(lose_ack=True)
    terminal = r.terminal_unsettled('unknown')
    A.require('C3/unknown/kind', terminal['result']['event_effect'] == 'unknown')
    r.resolve_original()
    r.publish_control()
    try:
        r.terminal_succeeded()
        raise AssertionError('terminal rewritten')
    except A.AdapterRefusal as error:
        A.require('C3/unknown/immutable', error.code == 'C3/terminal_succeeded/already_issued')
    A.require('C3/unknown/replay', same(r.replay(copy.deepcopy(r.request)), terminal))
    return dict(terminal='unknown', later_success_refused=True)


def positive_capture_retry(suite):
    w, r = until(suite, 'prepare')
    generation = w.storage.cell_generation
    A.require('C3/capture_retry/same', same(r.capture_source(), r.source) and w.storage.cell_generation == generation)
    return dict(equal_retry_no_effect=True)


def positive_held_reader(suite):
    w, r = until(suite, 'capture_source')
    r.release_held(r.hold_current_read())
    return dict(held_reader_released=True)


def positive_equal_event_retry(suite):
    """Equal Event retries after the late append: lost-ack retry (same op) and dedupe (new op); no second Event."""
    w, r = until(suite, 'publish_control')
    count = len(w.storage.events)
    producer = copy.deepcopy(r.progress['producer_input'])
    _, _, outcome = w.appender.append_original(r.operation_id, r.append_request, [producer])
    A.require('C3/equal_retry/same_operation', outcome['status'] == 'already_appended' and len(w.storage.events) == count)
    _, _, outcome = w.appender.append_original(r.operation_id + ':retry', dict(r.append_request, retry=True), [producer])
    A.require('C3/equal_retry/dedupe', outcome['status'] == 'dedupe' and len(w.storage.events) == count)
    return dict(lost_ack_retry='already_appended', new_operation='dedupe')


# ------------------------------------------------------------------ negatives

def boundary_negatives(suite):
    for method in [s for s in STEPS if s != 'native']:
        sources = PRE if method in PRE_STOP else POST
        for name, hook in sources:
            def fn(method=method, hook=hook):
                w, r = until(suite, method)
                r.inject[(method, 'final')] = hook
                return w, getattr(r, method)
            suite.negative(G, 'boundary_%s_final_%s' % (method, name), fn, 'C3/%s/final/%s' % (method, name), boundary=method)
    for name, hook in POST:
        def fn(hook=hook):
            w, r = until(suite, 'settle_owner')
            r.inject[('settle_owner', 'after_native_read')] = hook
            return w, r.settle_owner
        suite.negative(G, 'boundary_settle_owner_after_native_read_%s' % name, fn, 'C3/settle_owner/after_native_read/%s' % name, boundary='settle_owner')


def substitute(w, table, key, edit):
    """A coherent at-rest substitution of one stored value (recorded as the injected change)."""
    cell = w.storage.cells[table][key]
    value = copy.deepcopy(cell['value'])
    edit(value)
    cell['value'] = value
    mark(w, table, key)


def specific_negatives(suite):
    neg = suite.negative

    # --- C-source
    def unassociated():
        w, r = wf(suite)
        import pm_goal_dg_ca_c1 as C1
        other = C1.NoAssociationCancel(w)
        r.scope, r.cancel_decision, r.actor_ref = other.scope, other.cancel_decision, other.actor_ref
        r.dispatch(r.user_request())
        return w, r.capture_source
    neg(G, 'capture_no_workflow_association', unassociated, 'C3/association/count', boundary='capture_source')

    def completed():
        w, r = wf(suite)
        w.goal.mutate_state(r.scope, 'completed')
        r.dispatch(r.user_request())
        return w, r.capture_source
    neg(G, 'capture_completed_goal', completed, 'C3/capture_source/legal_state', boundary='capture_source')

    def altered_dispatch():
        w, r = wf(suite)
        altered = dict(r.request, return_route_ref=uid('TEST_ONLY:other-route'))
        return w, lambda: w.sir.accept(altered)
    neg(G, 'capture_altered_dispatch_conflict', altered_dispatch, 'sir/dispatch_conflict', boundary='capture_source')

    def transport_handle():
        w, r = wf(suite)
        return w, lambda: r.capture_source(sir_handle=dict(ref='TEST_ONLY:handle'))
    neg(G, 'capture_transport_handle', transport_handle, 'original/handle_type', boundary='capture_source')

    def stale_revision():
        w, r = wf(suite)
        r.request = dict(r.request)
        bad = r.user_request(expected_revision=r.request['expected_revision'] + 1)
        r.dispatch(bad)
        return w, r.capture_source
    neg(G, 'capture_stale_revision', stale_revision, 'C3/capture_source/expected_revision', boundary='capture_source')

    def owner_epoch_moved():
        w, r = wf(suite)
        w.native.run.restart(r.wf_run, r.scope)
        mark_all(w, w.native.run.BODY)
        mark_all(w, w.native.run.CONTROL)
        mark_all(w, w.native.run.POINTER)
        return w, r.capture_source
    neg(G, 'capture_association_owner_epoch', owner_epoch_moved, 'C3/association/owner', boundary='capture_source')

    def retry_conflict():
        w, r = until(suite, 'prepare')
        altered = dict(r.request, return_route_ref=uid('TEST_ONLY:other-route'))
        return w, lambda: r.capture_source(request=altered)
    neg(G, 'capture_retry_altered_request', retry_conflict, 'C3/capture_source/accepted_dispatch', boundary='capture_source')

    def writer_withdrawn():
        w, r = wf(suite)
        w.binding.withdraw()
        return w, r.capture_source
    neg(G, 'capture_writer_withdrawn', writer_withdrawn, 'C3/capture_source/writer_cutoff', boundary='capture_source')

    def terminal_writer_unregistered():
        w, r = wf(suite)
        w.native.writers.disable('executor_cancel')
        mark_all(w, 'TEST_ONLY:native_writer_inventory')
        return w, r.capture_source
    neg(G, 'capture_workflow_terminal_writer_unregistered', terminal_writer_unregistered, 'C3/capture_source/native_writer_inventory',
        boundary='capture_source')

    # --- prepare / readiness
    def unacknowledged():
        w, r = until(suite, 'prepare')
        substitute(w, w.sir.OUTCOME, r.request['command_instance_id'], lambda v: v['record'].update(acknowledgement_receipt_ref=None))
        return w, r.prepare
    neg(G, 'prepare_without_acknowledgement', unacknowledged, 'C3/prepare/acknowledgement_readback', boundary='prepare')

    def fence_held():
        w, r = until(suite, 'prepare')
        other = uid('TEST_ONLY:other-append')
        w.storage.reserve_assignment(other, dict(kind='TEST_ONLY:other'))
        mark_all(w, 'goal_cancel_append_reservation')
        mark_all(w, 'seglog_sequence_allocator')
        return w, r.prepare
    neg(G, 'prepare_append_fence_held', fence_held, 'C3/prepare/no_fence', boundary='prepare')

    def readiness_twice():
        w, r = until(suite, 'latch_and_reserve')
        return w, r.prepare
    neg(G, 'prepare_readiness_twice', readiness_twice, 'C3/prepare/readiness_absent', boundary='prepare')

    # --- C-stop
    def readiness_substituted():
        w, r = until(suite, 'latch_and_reserve')
        substitute(w, R.READINESS, r.readiness_key, lambda v: v['record'].update(exact_encoding_template_sha256='0' * 64))
        return w, r.latch_and_reserve
    neg(G, 'latch_readiness_substituted', readiness_substituted, 'C3/latch_and_reserve/readiness_custody', boundary='latch_and_reserve')

    def latch_without_readiness():
        w, r = until(suite, 'prepare')
        return w, r.latch_and_reserve
    neg(G, 'latch_without_readiness', latch_without_readiness, 'C3/latch_and_reserve/readiness_custody', boundary='latch_and_reserve')

    # --- C-receipt
    def receipt_before_stop():
        w, r = until(suite, 'latch_and_reserve')
        return w, r.commit_receipt
    neg(G, 'receipt_before_stop', receipt_before_stop, 'C3/commit_receipt/phase', boundary='commit_receipt')

    def goal_terminal_writer_gone():
        w, r = until(suite, 'commit_receipt')
        w.native.writers.disable('goal_stop')
        mark_all(w, 'TEST_ONLY:native_writer_inventory')
        return w, r.commit_receipt
    neg(G, 'receipt_goal_terminal_writer_unregistered', goal_terminal_writer_gone, 'C3/commit_receipt/control_plane_writer', boundary='commit_receipt')

    # --- native D05/D06 owners (the positive D06 refuses every unresolved D05 with its own code)
    for label, outcome, code in (('flush_failed', {'flush_failed': True}, 'd05/flush_failed'),
                                 ('flush_unknown', {'flush_unknown': True}, 'd05/flush_unknown'),
                                 ('effect_unknown', {0: 'unknown'}, 'd05/effect_unknown'),
                                 ('effect_failed', {1: 'failed'}, 'd05/effect_failed'),
                                 ('capability_reopened', {'reopen': True}, 'd05/capability_reopened')):
        def fn(outcome=outcome):
            w, r = until(suite, 'native', effects=dict(drain=outcome))
            n = w.native
            n.scheduler.stop(r.wf_run, r.scope)
            n.effects.drain(r.wf_run, outcome=outcome)
            n.d05.aggregate(r.wf_run, r.scope)
            return w, lambda: n.d06.prepare(r.wf_run, r.scope, r.actor_ref)
        neg(G, 'd06_refuses_%s' % label, fn, code, boundary='native_d06')

    def foreign_effect():
        w, r = until(suite, 'native')
        n = w.native
        n.effects.add_foreign(r.wf_run, dict(r.wf_run['run_scope'], goal_run_id=uid('TEST_ONLY:other-run')))
        n.scheduler.stop(r.wf_run, r.scope)
        n.effects.drain(r.wf_run)
        n.d05.aggregate(r.wf_run, r.scope)
        return w, lambda: n.d06.prepare(r.wf_run, r.scope, r.actor_ref)
    neg(G, 'd06_refuses_foreign_effect', foreign_effect, 'd05/effect_foreign', boundary='native_d06')

    def missing_effect():
        w, r = until(suite, 'native')
        n = w.native
        n.scheduler.stop(r.wf_run, r.scope)
        n.effects.drain(r.wf_run)
        n.d05.aggregate(r.wf_run, r.scope)
        key = n.effects.members[r.wf_run['run_scope']['goal_run_id']]['invocations'][0]
        rkey = w.value(N.EffectOwner.INV, key)['resolution']
        del w.storage.cells[N.EffectOwner.INV + '_resolution'][rkey]
        mark(w, N.EffectOwner.INV + '_resolution', rkey)
        return w, lambda: n.d06.prepare(r.wf_run, r.scope, r.actor_ref)
    neg(G, 'd06_refuses_missing_effect_resolution', missing_effect, 'd05/effect_missing', boundary='native_d06')

    def d05_before_goal_stop():
        w, r = until(suite, 'latch_and_reserve')
        return w, lambda: w.native.d05.aggregate(r.wf_run, r.scope)
    neg(G, 'd05_before_goal_stop', d05_before_goal_stop, 'd05/goal_stop_not_latched', boundary='native_d05')

    def d05_without_scheduler_stop():
        w, r = until(suite, 'native')
        w.native.effects.drain(r.wf_run)
        return w, lambda: w.native.d05.aggregate(r.wf_run, r.scope)
    neg(G, 'd05_without_scheduler_stop', d05_without_scheduler_stop, 'd05/scheduler_stop', boundary='native_d05')

    def d06_body_moved():
        w, r = until(suite, 'native')
        n = w.native
        n.scheduler.stop(r.wf_run, r.scope)
        n.effects.drain(r.wf_run)
        n.d05.aggregate(r.wf_run, r.scope)
        n.d06.prepare(r.wf_run, r.scope, r.actor_ref)
        inject_run(r)
        return w, lambda: n.d06.publish(r.wf_run, r.scope)
    neg(G, 'd06_publish_after_body_moved', d06_body_moved, 'd06/before_changed', boundary='native_d06')

    def scheduler_stop_before_goal_stop():
        w, r = until(suite, 'latch_and_reserve')
        return w, lambda: w.native.scheduler.stop(r.wf_run, r.scope)
    neg(G, 'scheduler_stop_before_goal_stop', scheduler_stop_before_goal_stop, 'scheduler_stop/goal_not_latched', boundary='native_scheduler')

    # --- C-owners
    def settle_unpublished_d06():
        w, r = until(suite, 'native')
        r.run_native(outcome={'flush_failed': True})
        return w, r.settle_owner
    neg(G, 'settle_unpublished_d06', settle_unpublished_d06, 'd06/not_published', boundary='settle_owner')

    def settle_d06_result_substituted():
        w, r = until(suite, 'settle_owner')
        d6 = r.wf_run['d06']
        substitute(w, N.D06Owner.RESULT, d6['result_key'], lambda v: v['record'].update(committed_at_utc='2026-01-01T00:00:00Z'))
        return w, r.settle_owner
    neg(G, 'settle_d06_result_substituted', settle_d06_result_substituted, 'd06/control_result', boundary='settle_owner')

    def settle_d05_result_substituted():
        w, r = until(suite, 'settle_owner')
        substitute(w, N.D05Owner.RESULT, r.wf_run['d05']['result_key'], lambda v: v['value'].update(completed_at_utc='2026-01-01T00:00:00Z'))
        return w, r.settle_owner
    neg(G, 'settle_d05_result_substituted', settle_d05_result_substituted, 'd05/origin_join', boundary='settle_owner')

    def settle_ancillary_substituted():
        w, r = until(suite, 'settle_owner')
        readback = w.native.d06.readback(r.wf_run, r.scope)
        key = sorted(sel['physical_key'] for _, sel in N.walk_selectors(readback) if sel['family_id'] == N.ANCILLARY)[0]
        substitute(w, N.ANCILLARY, key, lambda v: v.update(schema_path='TEST_ONLY:substituted'))
        return w, r.settle_owner
    neg(G, 'settle_ancillary_original_substituted', settle_ancillary_substituted, 'C3/settle_owner/native_custody/selector_hash', boundary='settle_owner')

    def settle_owner_epoch_moved():
        w, r = until(suite, 'settle_owner')
        w.native.run.restart(r.wf_run, r.scope)
        mark_all(w, w.native.run.BODY)
        mark_all(w, w.native.run.CONTROL)
        mark_all(w, w.native.run.POINTER)
        return w, r.settle_owner
    neg(G, 'settle_workflow_owner_epoch_moved', settle_owner_epoch_moved, 'C3/association/owner', boundary='settle_owner')

    def settle_twice():
        w, r = until(suite, 'freeze_event')
        return w, r.settle_owner
    neg(G, 'settle_twice', settle_twice, 'C3/settle_owner/phase', boundary='settle_owner')

    def settle_start_custody_moved():
        w, r = until(suite, 'settle_owner')
        st = r.wf_run['start']
        substitute(w, 'workflow_start_commit', st['commit_key'], lambda v: v['record'].update(dispatch_released=True))
        return w, r.settle_owner
    neg(G, 'settle_start_commit_substituted', settle_start_custody_moved, 'start/origin_join', boundary='settle_owner')

    # --- C-event
    def freeze_proof_substituted():
        w, r = until(suite, 'freeze_event')
        substitute(w, R.SCOPE_PROOF, r.scope_proof_key, lambda v: v['record'].update(d06_operation_id=uid('TEST_ONLY:other-d06')))
        return w, r.freeze_event
    neg(G, 'freeze_scope_proof_substituted', freeze_proof_substituted, 'C3/freeze_event/scope_proof_settlement', boundary='freeze_event')

    # --- late assignment
    def reserve_fence_held():
        w, r = until(suite, 'reserve_assignment')
        w.storage.reserve_assignment(uid('TEST_ONLY:other-append'), dict(kind='TEST_ONLY:other'))
        mark_all(w, 'goal_cancel_append_reservation')
        mark_all(w, 'seglog_sequence_allocator')
        return w, r.reserve_assignment
    neg(G, 'reserve_fence_held_by_other', reserve_fence_held, 'C3/reserve_assignment/fence_free', boundary='reserve_assignment')

    def reserve_twice():
        w, r = until(suite, 'issue_assignment_audit')
        return w, r.reserve_assignment
    neg(G, 'reserve_second_assignment', reserve_twice, 'C3/reserve_assignment/no_prior_reservation', boundary='reserve_assignment')

    def reserve_before_event_ready():
        w, r = until(suite, 'freeze_event')
        return w, r.reserve_assignment
    neg(G, 'reserve_before_event_ready', reserve_before_event_ready, 'C3/reserve_assignment/phase', boundary='reserve_assignment')

    def audit_fence_lost():
        w, r = until(suite, 'issue_assignment_audit')
        w.storage.abandon(r.operation_id)
        mark_all(w, 'goal_cancel_append_reservation')
        mark_all(w, 'seglog_sequence_allocator')
        return w, r.issue_assignment_audit
    neg(G, 'audit_fence_lost', audit_fence_lost, 'C3/issue_assignment_audit/fence', boundary='issue_assignment_audit')

    def audit_template_drift():
        w, r = until(suite, 'issue_assignment_audit')
        r.source = dict(r.source, producer_metadata=dict(r.source['producer_metadata'], correlation_id=uid('TEST_ONLY:other-correlation')))
        return w, r.issue_assignment_audit
    neg(G, 'audit_template_differs_from_readiness', audit_template_drift, 'C3/issue_assignment_audit/source_custody', boundary='issue_assignment_audit')

    def append_frozen_producer():
        w, r = until(suite, 'append_original')
        return w, lambda: r.append_original(candidate_edit=lambda p: dict(p, actor_ref=uid('TEST_ONLY:other-actor')))
    neg(G, 'append_altered_producer', append_frozen_producer, 'C3/append_original/frozen_producer', boundary='append_original')

    def append_audit_substituted():
        w, r = until(suite, 'append_original')
        substitute(w, R.LATE_AUDIT, r.late_audit_key, lambda v: v['record'].update(producer_semantic_digest='0' * 64))
        return w, r.append_original
    neg(G, 'append_audit_substituted', append_audit_substituted, 'C3/append_original/audit_custody', boundary='append_original')

    def append_without_audit():
        w, r = until(suite, 'issue_assignment_audit')
        return w, r.append_original
    neg(G, 'append_without_audit', append_without_audit, 'C3/append_original/audit_unavailable', boundary='append_original')

    def replay_only_normal():
        w, r = until(suite, 'reserve_assignment')
        bad = dict(r.progress['producer_input'], replay_policy='projector_replay_only')
        return w, lambda: w.appender.append_original(uid('TEST_ONLY:replay-only'), dict(kind='x'), [bad])
    neg(G, 'storage_refuses_replay_only_append', replay_only_normal, 'append/candidate/replay_policy/numrule/replay_only_not_appendable', boundary='storage')

    def replay_only_retry():
        w, r = until(suite, 'publish_control')
        bad = dict(r.progress['producer_input'], replay_policy='projector_replay_only')
        return w, lambda: w.appender.append_original(r.operation_id + ':equal-retry', dict(kind='x'), [bad])
    neg(G, 'storage_refuses_replay_only_equal_retry', replay_only_retry, 'append/candidate/replay_policy/numrule/replay_only_not_appendable', boundary='storage')

    def altered_event_retry():
        w, r = until(suite, 'publish_control')
        bad = dict(r.progress['producer_input'], actor_ref=uid('TEST_ONLY:other-actor'))
        return w, lambda: w.appender.append_original(r.operation_id + ':altered', dict(kind='x'), [bad])
    neg(G, 'storage_refuses_altered_event_retry', altered_event_retry, 'append/conflict/producer25', boundary='storage')

    # --- C-publish / terminal / retained
    def control_stop_resumed():
        w, r = until(suite, 'publish_control')
        w.host_stop.manual(r.scope, 'resume')
        return w, r.publish_control
    neg(G, 'control_stop_resumed', control_stop_resumed, 'C3/publish_control/stop_latched', boundary='publish_control')

    def control_before_event():
        w, r = until(suite, 'append_original')
        return w, r.publish_control
    neg(G, 'control_before_goal_event', control_before_event, 'C3/publish_control/phase', boundary='publish_control')

    def terminal_twice():
        w, r = wf(suite)
        r.run()
        return w, r.terminal_succeeded
    neg(G, 'terminal_twice', terminal_twice, 'C3/terminal_succeeded/already_issued', boundary='terminal_succeeded')

    def terminal_before_control():
        w, r = until(suite, 'publish_control')
        return w, r.terminal_succeeded
    neg(G, 'terminal_before_control', terminal_before_control, 'C3/terminal_succeeded/phase', boundary='terminal_succeeded')

    def unsettled_no_effect_after_stop():
        w, r = until(suite, 'commit_receipt')
        w.permissions.revoke(r.cancel_decision)
        mark(w, w.permissions.FAMILY, r.cancel_decision)
        return w, lambda: r.terminal_unsettled('no_effect')
    neg(G, 'unsettled_no_effect_after_stop', unsettled_no_effect_after_stop, 'C3/terminal_unsettled/phase', boundary='terminal_unsettled')

    def no_effect_still_permitted():
        w, r = until(suite, 'prepare')
        return w, lambda: r.terminal_unsettled('no_effect')
    neg(G, 'unsettled_no_effect_still_permitted', no_effect_still_permitted, 'C3/terminal_unsettled/no_effect_unpermitted', boundary='terminal_unsettled')

    def retained_proof_substituted():
        w, r = wf(suite)
        r.run()
        substitute(w, R.SCOPE_PROOF, r.scope_proof_key, lambda v: v['record'].update(d06_operation_id=uid('TEST_ONLY:other-d06')))
        return w, r.read_retained_success
    neg(G, 'retained_scope_proof_substituted', retained_proof_substituted, 'C3/read_retained_success/proof_settlement', boundary='read_retained_success')

    def retained_d06_substituted():
        w, r = wf(suite)
        r.run()
        substitute(w, N.D06Owner.RESULT, r.wf_run['d06']['result_key'], lambda v: v['record'].update(committed_at_utc='2026-01-01T00:00:00Z'))
        return w, r.read_retained_success
    neg(G, 'retained_d06_result_substituted', retained_d06_substituted, 'C3/read_retained_success/d06_result', boundary='read_retained_success')

    def retained_unsettled_on_success():
        w, r = wf(suite)
        r.run()
        return w, r.read_retained_unsettled
    neg(G, 'retained_unsettled_reader_on_success', retained_unsettled_on_success, 'C3/read_retained_unsettled/kind', boundary='read_retained_unsettled')

    def replay_altered_after_terminal():
        w, r = wf(suite)
        r.run()
        return w, lambda: r.replay(dict(r.request, return_route_ref=uid('TEST_ONLY:other-route')))
    neg(G, 'replay_altered_request_after_terminal', replay_altered_after_terminal, 'sir/dispatch_conflict', boundary='replay')

    def held_reader_after_withdrawal():
        w, r = until(suite, 'capture_source')
        held = r.hold_current_read()
        w.binding.withdraw()
        return w, lambda: r.release_held(held)
    neg(G, 'held_reader_after_withdrawal', held_reader_after_withdrawal, 'C1/held_reader/withdrawn', boundary='held_reader')


def cases(suite):
    suite.positive(G, 'positive_active_nonterminal_run', lambda: positive(suite, 'active'))
    suite.positive(G, 'positive_paused', lambda: positive(suite, 'paused'))
    suite.positive(G, 'positive_blocked', lambda: positive(suite, 'blocked'))
    suite.positive(G, 'positive_terminal_preserved_certified', lambda: positive(suite, 'active', run_status='certified'))
    suite.positive(G, 'positive_terminal_preserved_failed', lambda: positive(suite, 'active', run_status='failed'))
    suite.positive(G, 'positive_no_mutation_empty_settlements', lambda: positive(suite, 'active', effects=dict(birth=dict(filesafe=0, processes=0))))
    suite.positive(G, 'positive_unresolved_flush_failed_unknown_terminal', lambda: positive_unresolved(suite, {'flush_failed': True}, 'd05/flush_failed'))
    suite.positive(G, 'positive_unresolved_effect_unknown_unknown_terminal', lambda: positive_unresolved(suite, {0: 'unknown'}, 'd05/effect_unknown'))
    suite.positive(G, 'positive_no_effect_before_stop', lambda: positive_no_effect(suite))
    suite.positive(G, 'positive_goal_append_lost_ack_resolved', lambda: positive_lost_ack(suite))
    suite.positive(G, 'positive_unknown_terminal_immutable', lambda: positive_unknown_immutable(suite))
    suite.positive(G, 'positive_capture_equal_retry', lambda: positive_capture_retry(suite))
    suite.positive(G, 'positive_held_reader', lambda: positive_held_reader(suite))
    suite.positive(G, 'positive_equal_event_retry', lambda: positive_equal_event_retry(suite))
    specific_negatives(suite)
    boundary_negatives(suite)
