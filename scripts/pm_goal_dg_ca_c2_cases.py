#!/usr/bin/env python3
"""DG-CA C2 corpus: bound-Plan goal.cancelled original path (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof. Runs through the shared ``Suite`` of
``pm_goal_dg_ca_oracles`` on ``pm_goal_dg_ca_c2``.
"""
from __future__ import annotations

import copy

import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_dg_ca_owners as O
import pm_goal_dg_ca_assignment as AS
import pm_goal_dg_ca_c1 as C1
import pm_goal_dg_ca_c2 as C2

STEPS = ('capture_source', 'reserve_append_assignment', 'issue_assignment_audit', 'admit_codec_domain', 'prepare', 'latch_and_reserve',
         'commit_receipt', 'plan_commit', 'scheduler_participate', 'settle_owner', 'freeze_event', 'append_original', 'publish_control', 'terminal')


def route(suite, state='active', **kw):
    suite.n += 1
    w = AS.assigned_world(suite.work / ('b%05d' % suite.n))
    r = C2.BoundPlanCancel(w, state=state, **kw)
    r.dispatch(r.user_request())
    return w, r


def until(suite, before, state='active', **kw):
    w, r = route(suite, state, **kw)
    for step in STEPS:
        if step == before:
            break
        getattr(r, step)()
    return w, r


def mark_all(w, cells):
    for table, key in cells:
        w.injected.append((table, key))


def snapshot(w, tables):
    return {t: copy.deepcopy(w.storage.cells.get(t, {})) for t in tables}


def positive(suite, state, schedules=1, consents=1):
    w, r = route(suite, state, schedules=schedules, consents=consents)
    scope = r.scope
    body_before = copy.deepcopy([w.goal.body_cell(scope), w.goal.history_cells(scope)])
    message_before = copy.deepcopy(w.cell('execution_schedule', r.message_schedule_key))
    k = r.plan_keys()
    plan_b, run_b = w.value('assistant_plan_record', k['plan']), w.value('assistant_plan_run', k['run'])
    callback_epoch = w.host_stop.record(scope)['user_stop_epoch']
    w.scheduler.callback(scope, w.plans, r.plan_id, r.run_id, run_epoch=run_b['record']['plan_run_epoch'], stop_epoch=callback_epoch)
    displays = []
    for step in STEPS:
        getattr(r, step)()
        displays.append((step, r.display()))
    A.require('C2/positive/order', [m for _, m in w.recorder.sequence(True)][-len(STEPS):] ==
              [s if s != 'append_original' else 'append_reserved' for s in STEPS])
    A.require('C2/positive/body_unchanged', A.same([w.goal.body_cell(scope), w.goal.history_cells(scope)], body_before))
    A.require('C2/positive/unrelated_message_unchanged', A.same(w.cell('execution_schedule', r.message_schedule_key), message_before))
    plan_a, run_a = w.value('assistant_plan_record', k['plan']), w.value('assistant_plan_run', k['run'])
    A.require('C2/positive/plan_control', plan_a['record']['control_state'] == 'canceled' and plan_a['source_revision'] == plan_b['source_revision'] + 1
              and {x: y for x, y in plan_a['record'].items() if x != 'control_state'} == {x: y for x, y in plan_b['record'].items() if x != 'control_state'})
    anchor = run_a['run_completion_anchor']
    effect = w.value('plan_cancel_effect', r.actual_targets['plan_effect'][1])
    A.require('C2/positive/run_cancelled', run_a['record']['state'] == 'cancelled' and run_a['record']['plan_run_epoch'] == run_b['record']['plan_run_epoch'] + 1
              and anchor['settled_at_utc'] == effect['record']['committed_at_utc'] and anchor['original_transaction_id'] == r.reserved['joint_transaction'])
    for sel in r.scheduler_statement['schedules']:
        sched = w.value('execution_schedule', sel['schedule'])
        A.require('C2/positive/schedule_invalidated', sched['record']['state'] == 'invalidated' and sched['record']['revision'] == 2
                  and sched['record']['invalidated_reason'] == 'assistant_plan_run_cancelled:' + r.operation_id)
    for sel in r.scheduler_statement['consents']:
        consent = w.value('quota_resume_consent', sel['consent'])
        A.require('C2/positive/consent_disabled', consent['record']['enabled'] is False and consent['record']['updated_at'] == effect['record']['committed_at_utc'])
    for tid, (family, key, value, disposition, before) in r.actual_targets.items():
        if family and family != 'plan_cancel_source_origin' and disposition != 'preserved_original':
            okey = 'plan_cancel_source_origin.v1:%s:%s:%s' % (C2.hx(w.storage_id), C2.hx(key), S.sha256(S.canonical(w.value(family, key))))
            origin = w.value('plan_cancel_source_origin', okey)
            A.require('C2/positive/origin/' + tid, origin is not None and origin['record']['prior_physical_sha256'] == (
                None if before is None else S.sha256(S.canonical(before))) and origin['record']['original_transaction_id'] == r.reserved['joint_transaction'])
    A.require('C2/positive/link_receipts', effect['record']['link']['stop_receipt_sha256'] == S.sha256(S.canonical(
        w.value('goal_cancel_stop_receipt', r.key('goal_cancel_stop_receipt')))))
    A.require('C2/positive/settlement', r.progress['owner_settlement']['kind'] == 'bound_plan_settled')
    A.require('C2/positive/display', dict(displays)['publish_control'] == 'cancelled' and dict(displays)['settle_owner'] == state)
    stop = w.host_stop.record(scope)
    try:
        w.scheduler.callback(scope, w.plans, r.plan_id, r.run_id, run_epoch=run_b['record']['plan_run_epoch'], stop_epoch=callback_epoch)
        raise AssertionError('late callback admitted')
    except A.AdapterRefusal as error:
        A.require('C2/positive/late_callback_fenced', error.code == 'scheduler/callback_run_state')
    replay = r.retained_replay()
    A.require('C2/positive/retained_replay', replay['original_retained_plan_effects']['read_kind'] == 'original_result_replay')
    current = r.read_current_plan_effects()
    A.require('C2/positive/current_read', current['owner_settlement']['kind'] == 'bound_plan_settled')
    generation = w.storage.cell_generation
    A.require('C2/positive/duplicate_replay', A.same(r.replay(copy.deepcopy(r.request)), r.terminal_value) and w.storage.cell_generation == generation)
    sizes = {t: len(S.canonical(c['value'])) for t, rows in w.storage.cells.items() for c in rows.values()}
    return dict(state=state, schedules=schedules, consents=consents, targets=len(r.prepared['targets']), slots=len(r.prepared['future_slots']),
                numeric_assignments=len(r.prepared['numeric_assignments']), max_stored_part=max(sizes.values()),
                plan_effect_bytes=len(S.canonical(effect)), event_sequence=r.progress['publication']['first_append_receipt']['sequence_id'])


def oversize_refused(suite):
    w, r = until(suite, 'prepare', schedules=3, consents=2)
    stop = copy.deepcopy(w.host_stop.record(r.scope))
    try:
        r.prepare()
        raise AssertionError('oversize preparation accepted')
    except A.AdapterRefusal as error:
        A.require('C2/oversize/code', error.code == 'C2/prepare/unrepresentable_required_value')
    A.require('C2/oversize/unavailable_root', r.preparation_unavailable['reason'] == 'unrepresentable_required_value')
    A.require('C2/oversize/no_stop', A.same(w.host_stop.record(r.scope), stop))
    A.require('C2/oversize/reservation_abandoned', w.storage.reservation_record(r.operation_id)['state'] == 'abandoned')
    return dict(target=r.preparation_unavailable['target'], measured_bytes=r.preparation_unavailable['measured_bytes'])


def unknown_terminal(suite):
    w, r = until(suite, 'plan_commit')
    terminal = r.terminal('unknown')
    A.require('C2/unknown/kind', terminal['kind'] == 'unknown' and terminal['result']['receipt_effect'] == 'committed')
    k = r.plan_keys()
    A.require('C2/unknown/no_plan_effect', w.value('assistant_plan_run', k['run'])['record']['state'] == 'running')
    return dict(terminal='unknown', plan_effects='not_issued')


def commit_lost_ack(suite):
    w, r = until(suite, 'plan_commit')
    try:
        r.plan_commit(lose_ack=True)
        raise AssertionError('lost ack not raised')
    except A.AdapterRefusal as error:
        A.require('C2/lost_ack/code', error.code == 'C2/plan_commit/ack_lost')
    run_epoch = w.value('assistant_plan_run', r.plan_keys()['run'])['record']['plan_run_epoch']
    r.resolve_commit()
    for step in STEPS[8:]:
        getattr(r, step)()
    A.require('C2/lost_ack/one_epoch_increment', w.value('assistant_plan_run', r.plan_keys()['run'])['record']['plan_run_epoch'] == run_epoch)
    A.require('C2/lost_ack/terminal', r.terminal_value['kind'] == 'succeeded')
    return dict(resolved_from_storage=True, plan_run_epoch=run_epoch)


def cases(suite):
    G = 'C2'
    suite.positive(G, 'C2/positive/joint_commit_lost_ack_resolved_from_storage', lambda: commit_lost_ack(suite))
    for state in ('active', 'paused', 'blocked'):
        suite.positive(G, 'C2/positive/%s' % state, lambda s=state: positive(suite, s))
    suite.positive(G, 'C2/positive/authenticated_empty_scheduler_set', lambda: positive(suite, 'active', schedules=0, consents=0))
    suite.positive(G, 'C2/positive/oversize_scheduler_set_refused_before_stop', lambda: oversize_refused(suite))
    suite.positive(G, 'C2/positive/unknown_terminal_without_plan_effects', lambda: unknown_terminal(suite))

    def neg(name, fn, expected, boundary):
        suite.negative(G, 'C2/' + name, fn, expected, boundary=boundary)

    # entry: bound association truth
    def no_association_route_on_bound_goal():
        suite.n += 1
        w = AS.assigned_world(suite.work / ('b%05d' % suite.n))
        bound = C2.BoundPlanCancel(w, state='active')
        plain = C1.NoAssociationCancel(w, birth=False)
        plain.scope, plain.cancel_decision, plain.actor_ref = bound.scope, bound.cancel_decision, bound.actor_ref
        plain.dispatch(plain.user_request())
        return w, plain.capture_source
    neg('entry/no_association_route_on_bound_goal', no_association_route_on_bound_goal, 'C1/capture_source/binding_associations', 'capture/after_binding_read')

    def workflow_association_too():
        w, r = route(suite)
        w.workflow_inventory.add(r.scope, 'workflow_run', dict(run='TO-run-other'))
        return w, r.capture_source
    neg('entry/also_workflow_associated', workflow_association_too, 'C2/capture_source/no_workflow_association', 'capture/after_plan_read')

    def new_plan_version():
        w, r = route(suite)
        w.plans.approve_new_version(r.scope, r.plan_id)
        return w, r.capture_source
    neg('entry/plan_version_drift_before_capture', new_plan_version, 'C2/capture_source/plan_join', 'capture/after_plan_read')

    def run_finished():
        w, r = route(suite)
        w.plans.transition_run(r.scope, r.plan_id, r.run_id, 'failed')
        return w, r.capture_source
    neg('entry/run_not_cancellable', run_finished, 'C2/capture_source/run_cancellable', 'capture/after_plan_read')

    def writer_cutoff():
        w, r = route(suite)
        w.binding.withdraw()
        return w, r.capture_source
    neg('entry/writer_domain_withdrawn', writer_cutoff, 'C2/capture_source/writer_cutoff', 'capture/entry')

    # prepare
    def plan_epoch_drift_before_prepare():
        w, r = until(suite, 'prepare')
        w.plans.transition_run(r.scope, r.plan_id, r.run_id, 'paused')
        return w, r.prepare
    neg('prepare/plan_run_drift', plan_epoch_drift_before_prepare, 'C2/prepare/run_source', 'prepare/entry')

    def plan_version_drift_before_prepare():
        w, r = until(suite, 'prepare')
        w.plans.approve_new_version(r.scope, r.plan_id)
        return w, r.prepare
    neg('prepare/plan_version_drift', plan_version_drift_before_prepare, 'C2/prepare/plan_source', 'prepare/entry')

    def scheduler_missing():
        w, r = until(suite, 'prepare')
        w.scheduler.available = False
        return w, r.prepare
    neg('prepare/scheduler_database_unavailable', scheduler_missing, 'scheduler/database_unavailable', 'prepare/entry')

    def prepare_without_admission():
        w, r = until(suite, 'prepare')
        r.assignment = None
        return w, r.prepare
    neg('prepare/without_assignment_admission', prepare_without_admission, 'C2/prepare/assignment_admission', 'prepare/entry')

    def latch_without_prepare():
        w, r = until(suite, 'prepare')
        return w, r.latch_and_reserve
    neg('latch/before_plan_preparation', latch_without_prepare, 'C2/latch_and_reserve/plan_prepared', 'latch/entry')

    def prepared_other_assignment():
        w, r = until(suite, 'latch_and_reserve')
        r.prepared = dict(r.prepared, current_cancel_assignment=dict(r.prepared['current_cancel_assignment'], full_domain_sha256='0' * 64))
        return w, r.latch_and_reserve
    neg('latch/prepared_against_other_assignment', prepared_other_assignment, 'C2/latch_and_reserve/prepared_assignment', 'latch/entry')

    # commit
    def commit_before_receipt():
        w, r = until(suite, 'commit_receipt')
        return w, r.plan_commit
    neg('commit/before_cancellation_receipt', commit_before_receipt, 'C1/plan_commit/phase', 'commit/entry')

    def run_drift_before_commit():
        w, r = until(suite, 'plan_commit')
        cells = w.plans.transition_run(r.scope, r.plan_id, r.run_id, 'paused')
        return w, r.plan_commit
    neg('commit/plan_epoch_drift_after_stop', run_drift_before_commit, 'C2/plan_commit/before_source/run', 'commit/entry')

    def membership_changed():
        w, r = until(suite, 'plan_commit')
        run = w.value('assistant_plan_run', r.plan_keys()['run'])['record']
        w.scheduler.schedule_run(r.scope, r.plan_id, run, 0, schedules=1, consents=0)
        return w, r.plan_commit
    neg('commit/scheduler_membership_changed', membership_changed, 'C2/plan_commit/scheduler_membership', 'commit/after_safe_stop')

    def template_substituted():
        w, r = until(suite, 'plan_commit')
        prepared = copy.deepcopy(r.prepared)
        target = next(t for t in prepared['targets'] if t['target_id'] == 'plan')
        for m in target['complete_value_template']['members']:
            if m['name'] == 'source_revision':
                m['value'] = dict(kind='literal', value=m['value']['value'] + 1)
        fields = {k: prepared[k] for k in ('reserved_identities', 'future_slots', 'targets', 'numeric_assignments', 'codec_resources',
                                           'carrier_policy_admissions', 'current_cancel_assignment')}
        prepared['complete_assignment_sha256'] = w.assigner.h_domain('pm.assistant_plan.cancel.prepared_assignment.v1', fields)
        r.prepared = prepared
        return w, r.plan_commit
    neg('commit/substituted_template_coherent', template_substituted, 'C2/plan_commit/template_value/plan', 'commit/final')

    def template_stale_commitment():
        w, r = until(suite, 'plan_commit')
        prepared = copy.deepcopy(r.prepared)
        prepared['targets'][0]['disposition'] = 'preserved_original' if prepared['targets'][0]['disposition'] != 'preserved_original' else 'changed_original'
        r.prepared = prepared
        return w, r.plan_commit
    neg('commit/prepared_assignment_commitment', template_stale_commitment, 'C2/plan_commit/prepared_assignment', 'commit/entry')

    def reserved_identity_substituted():
        w, r = until(suite, 'plan_commit')
        key = r.prepared['reserved_identities'][0]['original_reservation_ref']
        cell = w.storage.cells['TEST_ONLY:plan_identity_reservation'][key]
        cell['value'] = dict(cell['value'], value='TO-other-identity')
        return w, r.plan_commit
    neg('commit/substituted_reserved_identity', reserved_identity_substituted, 'C2/plan_commit/reserved_identity', 'commit/entry')

    def stop_unlatched():
        w, r = until(suite, 'plan_commit')
        w.host_stop.manual(r.scope, 'resume')
        return w, r.plan_commit
    neg('commit/stop_resumed_after_receipt', stop_unlatched, 'C2/plan_commit/stop_latched', 'commit/entry')

    def duplicate_commit():
        w, r = until(suite, 'scheduler_participate')
        return w, r.plan_commit
    neg('commit/duplicate_commit_no_second_increment', duplicate_commit, 'C2/plan_commit/before_source/plan', 'commit/entry')

    def resolve_without_commit():
        w, r = until(suite, 'plan_commit')
        return w, r.resolve_commit
    neg('commit/unknown_without_commit_stays_unknown', resolve_without_commit, 'C2/resolve_plan_commit/unknown/plan_effect', 'resolve/entry')

    def participate_without_commit():
        w, r = until(suite, 'plan_commit')
        return w, r.scheduler_participate
    neg('participate/without_joint_commit', participate_without_commit, 'C2/scheduler_participate/joint_commit', 'participate/entry')

    # settlement and readers
    def settle_without_effects():
        w, r = until(suite, 'plan_commit')
        return w, r.settle_owner
    neg('settle/no_bound_settlement_before_effects', settle_without_effects, 'C2/settle_owner/genuine_effects', 'settle/entry')

    def settle_permission_revoked():
        w, r = until(suite, 'settle_owner')
        w.permissions.revoke(r.cancel_decision)
        return w, r.settle_owner
    neg('settle/current_read_permission_revoked', settle_permission_revoked, 'C2/verify_current_custody/permission', 'settle/after_effect_read')

    def effect_substituted():
        w, r = until(suite, 'settle_owner')
        key = r.actual_targets['plan_effect'][1]
        cell = w.storage.cells['plan_cancel_effect'][key]
        cell['value'] = dict(cell['value'], record=dict(cell['value']['record'], safe_stop_source_ref='TO-other-owner'))
        return w, r.settle_owner
    neg('settle/substituted_plan_effect', effect_substituted, 'C2/effects/origin_unavailable/plan_effect', 'settle/entry')

    def retained_without_permission():
        w, r = route(suite)
        r.run()
        w.permissions.revoke(r.cancel_decision)
        return w, lambda: r.read_retained_plan_effects()
    neg('reader/retained_without_disclosure_permission', retained_without_permission, 'C2/read_retained_plan_effects/disclosure_permission', 'reader/entry')

    def callback_after_stop():
        w, r = until(suite, 'commit_receipt')
        run = w.value('assistant_plan_run', r.plan_keys()['run'])['record']
        stop = w.host_stop.record(r.scope)
        return w, lambda: w.scheduler.callback(r.scope, w.plans, r.plan_id, r.run_id, run_epoch=run['plan_run_epoch'], stop_epoch=stop['user_stop_epoch'])
    neg('callback/fenced_by_actual_stop', callback_after_stop, 'scheduler/callback_stop_epoch', 'scheduler/callback')

    def callback_stale_epoch():
        w, r = until(suite, 'capture_source')
        stop = w.host_stop.record(r.scope)
        return w, lambda: w.scheduler.callback(r.scope, w.plans, r.plan_id, r.run_id, run_epoch=7, stop_epoch=stop['user_stop_epoch'])
    neg('callback/stale_run_epoch', callback_stale_epoch, 'scheduler/callback_run_epoch', 'scheduler/callback')

    def altered_dispatch():
        w, r = route(suite)
        return w, lambda: w.sir.accept(dict(r.request, return_route_ref='TO-route-other'))
    neg('entry/altered_dispatch_same_instance', altered_dispatch, 'sir/dispatch_conflict', 'sir/accept')

    # every returning helper and final boundary of the bound methods
    import pm_goal_dg_ca_oracles as ORC
    hooks = dict(ORC.INJECTIONS)

    def inject_plan(r):
        w = r.world
        run = w.value('assistant_plan_run', r.plan_keys()['run'])['record']
        if run['state'] in C2.CANCELLABLE_RUN:
            mark_all(w, w.plans.transition_run(r.scope, r.plan_id, r.run_id, 'paused' if run['state'] != 'paused' else 'running'))
        else:
            mark_all(w, w.plans.approve_new_version(r.scope, r.plan_id))

    def inject_scheduler(r):
        w = r.world
        before = {t: set(w.storage.cells.get(t, {})) for t in ('execution_schedule', 'execution_schedule_run_binding', 'plan_cancel_source_origin')}
        run = w.value('assistant_plan_run', r.plan_keys()['run'])['record']
        w.scheduler.schedule_run(r.scope, r.plan_id, run, 0, schedules=1, consents=0)
        for t, keys in before.items():
            mark_all(w, [(t, k) for k in set(w.storage.cells.get(t, {})) - keys])
    hooks['plan'], hooks['scheduler'] = inject_plan, inject_scheduler
    points = (('capture_source', ('after_binding_read', 'after_plan_read', 'final')), ('prepare', ('after_scheduler_selection', 'final')),
              ('plan_commit', ('after_safe_stop', 'after_scheduler_selection', 'final')), ('settle_owner', ('after_effect_read', 'final')))
    for method, pts in points:
        for point in pts:
            for source in ('accepted', 'permission', 'stop', 'binding', 'domain', 'plan', 'scheduler'):
                expected = 'C2/%s/%s/%s' % (method, point, source)
                if method == 'plan_commit' and point == 'after_safe_stop' and source == 'plan':
                    pass

                def drift(m=method, p=point, h=hooks[source]):
                    w, r = until(suite, m)
                    r.inject[(m, p)] = h
                    return w, getattr(r, m)
                suite.negative(G, 'C2/boundary/%s/%s/%s' % (method, point, source), drift, expected, boundary='%s/%s' % (method, point))
