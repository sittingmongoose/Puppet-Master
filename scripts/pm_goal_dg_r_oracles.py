#!/usr/bin/env python3
"""DG-R oracles for ``goal_run.cancelled`` groups R1-R6.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Every case builds a fresh TEST_ONLY world (``pm_goal_dg_r_world``) in which the
registered owners perform their modeled issuance, then calls the passive
consumer or projector (``pm_goal_dg_r_readers``, ``pm_goal_dg_r_projector``).
A positive must pass whole; a negative passes exactly one defect to an owner
knob (so every dependent copy, selector, digest and key is recomputed by the
owners) or substitutes one presented value, and must refuse with exactly its
expected code. Unexpected acceptance fails the run. Exit 0 only when every
case passes.
"""
from __future__ import annotations

import argparse
import copy
import json
import os
from pathlib import Path
import sys
import time
import traceback

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_dg_r_world as W
import pm_goal_dg_r_readers as R

QUALIFICATION = 'TEST_ONLY'
BASE = Path(os.environ.get('DGR_SCRATCH', '/tmp'))
CASE_FILTER = None
ROUTING = 'Plans/goal_run_cancelled_w4_contracts/routing.v1.json'


def request_of(w):
    return dict(scope={k: w.scope[k] for k in ('storage_instance_id', 'project_id', 'goal_id', 'goal_run_id')},
                storage_instance_id=w.sid)


# ------------------------------------------------------------------ R1

def r1_cases():
    """Adopt the adapter's R1 demonstration and bind it to the authored CV-1136 route."""
    import pm_goal_test_demo_r1 as D
    out = []
    demo = D.run()
    for case in demo['cases']:
        out.append(dict(id='R1/demo/' + case['id'], group='R1', kind=case['kind'], status=case['status'],
                        expected=case.get('expected'), got=case.get('got')))
    authored = json.loads((W.ROOT / ROUTING).read_text())

    def derived_route():
        registry, realms, route, selection, per_method, methods = D.build()
        return registry.owner(route[0], 'scoped_route').resolve(route[1])[1]

    def compare(route, authored):
        W.guard('r1/authored_source_hash', route['source_whole_sha256'] == authored['source_whole']['sha256'])
        W.guard('r1/authored_aliases', route['source_retrieval_aliases'] == sorted(authored['source_retrieval_aliases']))
        W.guard('r1/authored_sites', sorted((s['schema_location'], s['literal_reference']) for s in route['sites']) ==
                sorted((s['schema_location'], s['literal_reference']) for s in authored['sites']))
        W.guard('r1/authored_target', route['absolute_target_uri'] == authored['absolute_target_uri'] and
                route['target_whole_sha256'] == authored['target_whole']['sha256'])
        W.guard('r1/authored_nested_realm', route['nested_resolution'] == authored['target_realm'])
        W.guard('r1/authored_no_fallback', route['network_fallback'] is authored['network_fallback'] is False and
                route['whole_bank_merge'] is authored['whole_bank_merge'] is False)

    route = derived_route()
    run_case(out, 'R1/authored_route_equals_derived', 'R1', 'positive', lambda: compare(route, authored))
    roots = W.Roots.get()
    rows = {r['realm']: r for r in roots.w4.audit_rows}
    run_case(out, 'R1/w4_selection_eager_qualification', 'R1', 'positive', lambda: W.guard(
        'r1/eager', rows['native_consumer']['cross_realm_sites'] == 22 and all(r['unresolved'] == 0 for r in rows.values())))
    for name, edit, expected in [
            ('authored_site_dropped', lambda a: dict(a, sites=a['sites'][1:]), 'r1/authored_sites'),
            ('authored_literal_substituted', lambda a: dict(a, sites=[dict(a['sites'][0], literal_reference='inputs/Plans/other.schema.json#/$defs/x')] + a['sites'][1:]), 'r1/authored_sites'),
            ('authored_alias_dropped', lambda a: dict(a, source_retrieval_aliases=a['source_retrieval_aliases'][:1]), 'r1/authored_aliases'),
            ('authored_target_hash', lambda a: dict(a, target_whole=dict(a['target_whole'], sha256='0' * 64)), 'r1/authored_target'),
            ('authored_source_hash', lambda a: dict(a, source_whole=dict(a['source_whole'], sha256='0' * 64)), 'r1/authored_source_hash'),
            ('authored_nested_realm', lambda a: dict(a, target_realm='native_consumer'), 'r1/authored_nested_realm'),
            ('authored_network_fallback', lambda a: dict(a, network_fallback=True), 'r1/authored_no_fallback')]:
        run_case(out, 'R1/' + name, 'R1', 'negative', lambda e=edit: compare(route, e(copy.deepcopy(authored))), expected)
    # routed whole-root validation: the edge is usable only through the retained realm
    edge = roots.w4.edges[0]
    location = edge['source_retrieval_uri'] + '#' + edge['schema_location'].rsplit('/$ref', 1)[0]

    def routed():
        list(roots.validator('native_consumer', location).iter_errors({}))

    def unrouted():
        from pm_goal_own_c_oracles import Validator, FORMAT
        try:
            list(Validator({'$ref': location}, registry=roots.w4.registries['native_consumer'],
                           format_checker=FORMAT).iter_errors({}))
        except Exception as error:  # the predecessor bank cannot resolve the edge
            raise W.Refusal('r1/predecessor_unresolved') from error
    run_case(out, 'R1/routed_validation_resolves_edge', 'R1', 'positive', routed)
    run_case(out, 'R1/predecessor_validation_unresolved', 'R1', 'negative', unrouted, 'r1/predecessor_unresolved')
    return out


# ------------------------------------------------------------------ harness

def run_case(out, case_id, group, kind, fn, expected=None, detail=None):
    if CASE_FILTER and CASE_FILTER not in case_id:return
    started = time.time()
    try:
        value = fn()
        if kind == 'negative':
            out.append(dict(id=case_id, group=group, kind=kind, expected=expected, got='ACCEPTED', status='fail'))
        else:
            out.append(dict(id=case_id, group=group, kind=kind, status='pass', seconds=round(time.time() - started, 2),
                            detail=value if isinstance(value, (dict, list, str, int)) else None))
    except (W.Refusal, A.AdapterRefusal, S.StorageRefusal, NR.NumruleRefusal) as error:
        got = W.code_of(error)
        if kind == 'negative':
            out.append(dict(id=case_id, group=group, kind=kind, expected=expected, got=got,
                            status='pass' if got == expected else 'fail', seconds=round(time.time() - started, 2)))
        else:
            out.append(dict(id=case_id, group=group, kind=kind, status='fail', got=got,
                            detail=getattr(error, 'detail', None)))
    except Exception as error:  # noqa: BLE001
        out.append(dict(id=case_id, group=group, kind=kind, expected=expected, status='fail',
                        got='%s: %s' % (type(error).__name__, error), trace=traceback.format_exc(limit=4)))
    print(case_id,out[-1]['status'],out[-1].get('got',''),file=sys.stderr,flush=True)


def world_case(cfg, read='inspect', post=None, check=None):
    """Build a world from cfg, optionally act on it, then read through the consumer."""
    def run():
        w = W.CancelWorld(cfg, base=BASE)
        try:
            w.build()
            presentation = R.Presentation(w)
            request = request_of(w)
            if post is not None:
                outcome = post(w, presentation, request)
                if outcome is not None and read is None:
                    return outcome
            if read is None:
                return None
            consumer = R.Consumer(w)
            before = w.recorder.snapshot()
            result = consumer.inspect_original(request, presentation) if read == 'inspect' else \
                consumer.read_retained_native(request, presentation)
            after = w.recorder.snapshot()
            changed = [k for k in after if after[k]['sha256'] != before.get(k, {}).get('sha256')]
            W.guard('passive/no_effect', changed == [])
            if check is not None:
                return check(w, result)
            return dict(bytes=len(json.dumps(result)), cells=len(w.issued), calls=len(w.recorder.calls))
        finally:
            w.close()
    return run


# ------------------------------------------------------------------ knobs

def set_path(path, value):
    def edit(wrapper):
        W.put(wrapper, path, copy.deepcopy(value))
    return edit


def other_stop_receipt(w):
    """A second genuine Goal Stop receipt issued by the Goal owner."""
    op = 'TEST_ONLY:op:other-goal-stop:' + os.urandom(4).hex()
    stored = w.goal.issue_physical('goal_cancel_stop_receipt', 'goal_consumer', W.GC + 'StorageStopReceipt',
                                   w.goal.key('goal_cancel_stop_receipt', op),
                                   [('/record/operation_id', op), ('/record/latched', True),
                                    ('/record/before_user_stop_epoch', 0), ('/record/after_user_stop_epoch', 1)])
    return stored.selector()


def advance_current_goal_stop(w):
    if hasattr(w,'goal_bridge'):
        host,scope=w.goal_bridge.world.host_stop,w.goal_bridge.route.scope
        if host.record(scope)['latched']:host.manual(scope,'resume')
        return host.manual(scope,'stop')
    return other_stop_receipt(w)


def other_run_control(w):
    stored = w.scheduler.issue_physical('executor_run_execution_control', 'native_consumer',
                                        W.NA + 'StorageRunExecutionControl',
                                        w.scheduler.key('executor_run_execution_control', 'other'), [])
    return stored.selector()


def replace_pair(attr, key, fn):
    def post(w, p, r):
        getattr(p, attr)[key] = fn(w, p, getattr(p, attr)[key])
    return post


def r2_cases():
    S0 = {'start': 'started'}
    N0 = {'start': 'no_start'}
    knob = lambda base, **k: dict(base, knobs=k)  # noqa: E731
    out = []
    pos = [
        ('R2/positive/original_started', S0),
        ('R2/positive/initialized_no_start', N0),
    ]
    for cid, cfg in pos:
        run_case(out, cid, 'R2', 'positive', world_case(cfg))
    run_case(out, 'R2/positive/read_retained_native', 'R2', 'positive', world_case(S0, read='retained'))

    def order(w, r):
        seq = [m for _, m in w.recorder.sequence(True)]
        want = ['issue:workflow_cancel_event_candidate', 'issue:workflow_cancel_intent', 'issue:workflow_cancel_control',
                'issue:workflow_cancel_origin', 'issue:workflow_goal_run_body', 'issue:workflow_goal_run_control',
                'append_original', 'issue:workflow_cancel_result', 'issue:workflow_cancel_control',
                'issue:workflow_cancel_origin', 'issue:executor_workflow_workflow_update',
                'issue:executor_workflow_workflow_head', 'issue:executor_workflow_mutation_origin']
        start = max(i for i, m in enumerate(seq) if m == 'issue:workflow_cancel_event_candidate')
        tail = [m for m in seq[start:] if m in set(want)]
        W.guard('order/original_d06_chronology', tail[:len(want)] == want)
        return dict(chain=tail[:len(want)])
    run_case(out, 'R2/positive/original_order_recorded', 'R2', 'positive', world_case(S0, check=order))

    def equal_replay(w, p, r):
        first = R.Consumer(w).read_retained_native(r, p)
        events = w.storage.observe()['events']
        replay = w.replay_d06()
        W.guard('replay/no_second_event', w.storage.observe()['events'] == events)
        W.guard('replay/status', replay['outcome']['status'] == 'already_appended' and replay['tx']['replay'] is True)
        W.guard('replay/same_receipt', replay['custody'] == w.custody)
        again = R.Consumer(w).read_retained_native(r, R.Presentation(w))
        W.guard('replay/same_read', A.same(first, again))
        return dict(events=events)
    run_case(out, 'R2/positive/equal_replay_same_operation', 'R2', 'positive', world_case(S0, read=None, post=equal_replay))

    def semantic_retry(w, p, r):
        events = w.storage.observe()['events']
        replay = w.replay_d06(operation='TEST_ONLY:op:d06-retry:' + os.urandom(4).hex())
        W.guard('retry/dedupe', replay['outcome']['status'] == 'dedupe')
        W.guard('retry/no_second_event', w.storage.observe()['events'] == events)
        W.guard('retry/same_receipt', replay['custody'] == w.custody)
        return dict(status=replay['outcome']['status'])
    run_case(out, 'R2/positive/semantic_equal_retry_new_operation', 'R2', 'positive',
             world_case(S0, read=None, post=semantic_retry))

    def uncertain(w, p, r):
        # A crash after the append: the result is not yet published; nothing
        # is fabricated, and re-entry finishes from the same reservation.
        unavailable = R.Consumer(w).read_retained_native(r, p)
        W.guard('uncertain/unavailable', unavailable.get('reason') == 'MISSING_ORIGINAL_VALUE')
        events = w.storage.observe()['events']
        w.continue_d06()
        W.guard('uncertain/no_second_event', w.storage.observe()['events'] == events)
        R.Consumer(w).inspect_original(r, R.Presentation(w))
        return dict(events=events)
    run_case(out, 'R2/positive/unknown_after_append_then_reentry', 'R2', 'positive',
             world_case(dict(S0, stop_after='append'), read=None, post=uncertain))

    negatives = [
        ('intent_goal_stop_other_genuine', knob(S0, intent_goal_stop=other_stop_receipt), 'join/goal_stop/intent'),
        ('scheduler_goal_stop_other_genuine', knob(S0, scheduler_goal_stop=other_stop_receipt), 'join/goal_stop/scheduler'),
        ('d05_goal_stop_other_genuine', knob(S0, d05_goal_stop=other_stop_receipt), 'join/goal_stop/aggregate'),
        ('d05_aggregate_operation_equals_d06', knob(S0, d06_op='TEST_ONLY:op:shared', d05_aggregate_op='TEST_ONLY:op:shared'),
         'operations/distinct'),
        ('native_cancel_result_wrong_operation_kind', knob(S0, native_cancel_result=set_path('/record/operation', 'replan')),
         'scheduler/native_cancel_operation'),
        ('native_cancel_origin_substituted_operation', knob(S0, native_cancel_origin=set_path(
            '/record/original_operation_id', 'TEST_ONLY:op:substituted')), 'scheduler/native_origin_operation'),
        ('scheduler_run_control_other_genuine', knob(S0, scheduler_stop=lambda wr: None,
                                                     scheduler_run_control=other_run_control), 'scheduler/run_control_after'),
        ('pre_attempt_effect_admitted', knob(S0, pre_attempt_effect=True), 'd05/pre_attempt_effects'),
        ('sticky_earlier_flush_failure', dict(S0, flush=['original_required_flush_failed', 'original_required_flush_durable']),
         'd05/flush_sticky'),
        ('prepared_body_commitment_substituted', knob(S0, intent=set_path('/record/prepared_body_sha256', '1' * 64)),
         'native/prepared_body'),
        ('native_activation_changed', knob(S0, native_after_body=set_path('/record/activation_state/state', 'entrypoints_queued')),
         'native/activation_preserved'),
        ('native_unrelated_member_changed', knob(S0, native_after_body=set_path('/record/execution_owner_ref', 'TEST_ONLY:other-owner')),
         'native/unrelated_preserved'),
        ('native_revision_skips', knob(S0, native_after_body=lambda wr: W.put(wr, '/record/revision', wr['record']['revision'] + 1)),
         'native/revision_once'),
        ('native_status_not_cancelled', knob(S0, native_after_body=set_path('/record/status', 'stopped')), 'native/after_cancelled'),
        ('committed_control_revision_skips', knob(S0, control_revision=3), 'd06/control_once'),
        ('publish_origin_native_body_before', knob(S0, publish_origin=lambda wr: None, publish_native_before=True),
         'd06/publish_native_body'),
        ('d01_owner_origin_is_prepare', knob(S0, d01_owner_origin_prepare=True), 'd01/owner_origin'),
        ('d01_origin_causation_intent', knob(S0, d01_causation_intent=True), 'd01/origin_causation'),
        ('event_goal_run_revision_mismatched', knob(S0, event_payload=lambda p: p.update(goal_run_revision=p['goal_run_revision'] + 1)),
         'event/goal_run_revision'),
        ('event_expected_revision_mismatched', knob(S0, event_payload=lambda p: p.update(
            expected_goal_run_revision=p['expected_goal_run_revision'] + 1)), 'event/expected_revision'),
        ('first_append_not_barrier', knob(S0, durability_class='ordinary'), 'event/first_barrier'),
        ('result_receipt_substituted', knob(S0, result_receipt=lambda r: r.update(byte_offset=r['byte_offset'] + 1)),
         'custody/receipt_mismatch'),
        ('goal_stop_epoch_not_advanced', knob(S0, goal_stop_receipt=set_path('/record/after_user_stop_epoch', 0)),
         'goal/stop_latched'),
        ('goal_stop_intent_audit_substituted', knob(S0, goal_stop_intent=set_path('/source_audit_sha256', '2' * 64)),
         'goal/stop_intent_audit'),
        ('goal_publication_receipt_substituted', knob(S0, goal_control_publication=lambda wr: W.put(
            wr, '/record/original_publication/first_append_receipt/byte_offset',
            wr['record']['original_publication']['first_append_receipt']['byte_offset'] + 1)),
         'goal/publication_first_receipt'),
        ('goal_binding_origin_revision_substituted', knob(S0, goal_binding_origin=set_path('/record/issued_revision_sha256', '3' * 64)),
         'goal/binding_origin_revision'),
        ('start_update_after_body_is_birth', knob(S0, start_after_birth=True), 'start/before_cancel'),
        ('no_start_birth_origin_other_birth', knob(N0, no_start_birth_origin_other=True), 'start/birth_origin'),
        ('no_start_control_epoch_advanced', knob(N0, no_start_control=set_path('/record/epoch', 1)),
         'tuple/native/schema/original_start'),
    ]
    for name, cfg, expected in negatives:
        run_case(out, 'R2/' + name, 'R2', 'negative', world_case(cfg), expected)

    def transport_dict(w, p, r):
        p.cancellation['intent'] = (p.cancellation['intent'][0], copy.deepcopy(w.cancellation['intent'].wrapper))
    def foreign_handle(w, p, r):
        other = W.CancelWorld({'start': 'started'}, base=BASE)
        try:
            other.build()
            p.cancellation['intent'] = (p.cancellation['intent'][0], other.cancellation['intent'].handle)
        finally:
            other.close()
    def unregistered_owner(w, p, r):
        p.cancellation['intent'] = ('TEST_ONLY:owner:d06_cancel:unregistered', p.cancellation['intent'][1])
    def cell_substituted(w, p, r):
        stored = w.cancellation['intent']
        cell = w.storage.cell(stored.family, stored.key)
        value = copy.deepcopy(cell['value'])
        value['record']['prepared_at_utc'] = w.clock.now()
        w.storage.transact([dict(table=stored.family, key=stored.key, expected=cell['version'], value=value)])
    def withdrawn(w, p, r):
        w.d06.withdraw(w.cancellation['result'].handle)
    def wrong_scope(w, p, r):
        r['scope']['goal_run_id'] = 'TEST_ONLY-other-run'
    def altered_reentry(w, p, r):
        w.replay_d06(request_edit=lambda q: dict(q, candidate='4' * 64))
    def altered_retry(w, p, r):
        w.replay_d06(operation='TEST_ONLY:op:d06-altered:' + os.urandom(4).hex(),
                     event_edit=lambda e: e.update(actor_ref='TEST_ONLY:actor:substituted'))
    def second_cancel(w, p, r):
        w.continue_d06_again()
    for name, post, expected, read in [
            ('presented_transport_dict', transport_dict, 'original/handle_type', 'inspect'),
            ('presented_foreign_handle', foreign_handle, 'original/issuer', 'inspect'),
            ('presented_unregistered_owner', unregistered_owner, 'registry/unregistered_owner', 'inspect'),
            ('storage_cell_substituted_at_rest', cell_substituted, 'select/cell_substituted', 'inspect'),
            ('result_withdrawn_by_owner', withdrawn, 'original/withdrawn', 'inspect'),
            ('request_scope_other_run', wrong_scope, 'scope/event_candidate', 'inspect'),
            ('altered_request_reentry_conflict', altered_reentry, 'resume/conflict', None),
            ('altered_source_retry_conflict', altered_retry, 'append/conflict/producer25', None),
            ('second_cancellation_after_terminal', second_cancel, 'native/cas_body', None)]:
        run_case(out, 'R2/' + name, 'R2', 'negative', world_case(S0, read=read, post=post), expected)
    return out


def swap(path, pick):
    """Knob: set one member to another GENUINE original of the same world."""
    def edit(wrapper):
        W.put(wrapper, path, copy.deepcopy(pick(W.World.CURRENT)))
    return edit


def bump(path, delta=1):
    def edit(wrapper):
        W.put(wrapper, path, W.get(wrapper, path) + delta)
    return edit


def r2_join_cases():
    """Coherent one-defect negatives for the remaining R2 join predicates."""
    S0, N0 = {'start': 'started'}, {'start': 'no_start'}
    knob = lambda base, **k: dict(base, knobs=k)  # noqa: E731
    cov = lambda w: w.sched['coverage'].selector()  # noqa: E731
    inv = lambda w: w.sched['inventory'].selector()  # noqa: E731
    out = []
    rows = [
        ('intent_inventory_other_genuine', knob(S0, intent=swap('/record/inventory_cut', cov)), 'join/inventory/intent'),
        ('result_inventory_other_genuine', knob(S0, result=swap('/record/inventory_cut', cov)), 'join/inventory/result'),
        ('aggregate_inventory_other_genuine', knob(S0, d05_aggregate=swap('/value/inventory_cut', cov)), 'join/inventory/aggregate'),
        ('scheduler_inventory_other_genuine', knob(S0, scheduler_stop=swap('/record/inventory_cut', lambda w: next(
            st for (f, k, h), st in w.issued.items() if f == 'executor_workflow_coverage_birth').selector())),
         'join/inventory/scheduler'),
        ('inventory_coverage_other_genuine', knob(S0, inventory_head=swap('/record/coverage_birth', lambda w: w.head.selector())),
         'join/inventory/coverage'),
        ('intent_scheduler_other_genuine', knob(S0, intent=swap('/record/scheduler_stop', inv)), 'join/scheduler/intent'),
        ('result_scheduler_other_genuine', knob(S0, result=swap('/record/scheduler_stop', inv)), 'join/scheduler/result'),
        ('aggregate_scheduler_other_genuine', knob(S0, d05_aggregate=swap('/value/scheduler_stop', inv)), 'join/scheduler/aggregate'),
        ('intent_association_other_genuine', knob(S0, intent=swap('/record/association_selection',
                                                                  lambda w: w.goal_cause['original_binding_revision'].selector())),
         'join/association/intent'),
        ('result_association_other_genuine', knob(S0, result=swap('/record/association_selection',
                                                                  lambda w: w.goal_cause['original_binding_revision'].selector())),
         'join/association/result'),
        ('intent_safe_stop_other_genuine', knob(S0, intent=swap('/record/safe_stop_source', inv)), 'join/safe_stop/intent'),
        ('result_safe_stop_other_genuine', knob(S0, result=swap('/record/safe_stop_source', inv)), 'join/safe_stop/result'),
        ('domain_cut_stop_other_genuine', knob(S0, domain_cut=swap('/value/original_stop',
                                                                   lambda w: __import__('pm_goal_dg_r_oracles').other_stop_receipt(w))),
         'join/goal_stop/domain_cut'),
        ('control_intent_other_genuine', knob(S0, committed_control=swap('/record/intent',
                                                                         lambda w: w.d06_prepared['candidate'].selector())),
         'd06/control_intent'),
        ('control_result_other_genuine', knob(S0, committed_control=swap('/record/result',
                                                                         lambda w: w.d06_prepared['intent'].selector())),
         'd06/control_result'),
        ('prepare_origin_operation_substituted', knob(S0, prepare_origin=lambda wr: W.put(wr, '/record/operation_id', 'TEST_ONLY:op:other')),
         'd06/prepare_operation'),
        ('publish_origin_control_prepared_version', knob(S0, publish_origin=swap('/record/afterimages/control',
                                                                                 lambda w: w.d06_prepared['control'].selector())),
         'd06/publish_control'),
        ('d01_update_owner_result_intent', knob(S0, **{'d01_update:d06_cancel_nonterminal': swap(
            '/record/original_owner_result', lambda w: w.d06_prepared['intent'].selector())}), 'd01/owner_result'),
        ('d01_head_last_update_start', knob(S0, **{'d01_head:2': swap('/record/last_update',
                                                                       lambda w: w.start_cause['original_d01_update'].selector())}),
         'd01/head_update'),
        ('d01_head_current_before_body', knob(S0, **{'d01_head:2': swap('/record/current_body', lambda w: w.body1.selector())}),
         'd01/head_current'),
        ('event_goal_mismatched', knob(S0, event_payload=lambda p: p.update(goal_id=p['goal_id'] + '-other')), 'event/goal'),
        ('event_goal_run_mismatched', knob(S0, event_payload=lambda p: p['payload'].update(
            goal_run_id=p['payload']['goal_run_id'] + '-other')), 'event/goal_run'),
        ('goal_receipt_intent_substituted', knob(S0, goal_stop_receipt=lambda wr: W.put(wr, '/record/stop_intent_sha256', '6' * 64)),
         'goal/stop_receipt_intent'),
        ('goal_publication_audit_substituted', knob(S0, goal_control_publication=lambda wr: W.put(
            wr, '/record/source_audit_sha256', '7' * 64)), 'goal/publication_audit'),
        ('goal_publication_receipt_sha_substituted', knob(S0, goal_control_publication=lambda wr: W.put(
            wr, '/record/cancellation_receipt_sha256', '8' * 64)), 'goal/publication_receipt'),
        ('goal_binding_selection_revision_substituted', knob(S0, goal_binding_selection=lambda wr: W.put(
            wr, '/record/binding_revision/complete_value_sha256', '9' * 64)), 'goal/binding_revision_selection'),
        ('native_origin_record_substituted', knob(S0, native_cancel_origin=lambda wr: W.put(
            wr, '/record/issued_record_sha256', 'a' * 64)), 'scheduler/native_origin_record'),
        ('flush_aggregate_operation_substituted', knob(S0, final_flush=lambda wr: W.put(
            wr, '/value/aggregate_operation_id', 'TEST_ONLY:op:other-aggregate')), 'd05/flush_aggregate'),
        ('aggregate_final_flush_other_genuine', knob(S0, d05_aggregate=swap('/value/original_final_flush',
                                                                            lambda w: w.d05_cut_ref)), 'd05/final_flush'),
        ('prepared_control_commitment_substituted', knob(S0, intent=lambda wr: W.put(wr, '/record/prepared_control_sha256', 'b' * 64)),
         'native/prepared_control'),
        ('native_control_body_substituted', knob(S0, native_after_control=lambda wr: W.put(
            wr, '/record/body_record_sha256', 'c' * 64)), 'native/control_body'),
        ('native_control_revision_skips', knob(S0, native_after_control=bump('/record/revision')), 'native/control_once'),
        ('start_update_owner_result_candidate', knob(S0, **{'d01_update:original_workflow_start': swap(
            '/record/original_owner_result', lambda w: w.start_cause_candidate.selector())}), 'start/commit'),
        ('no_start_birth_body_other', knob(N0, no_start_birth=swap('/record/activation_body',
                                                                   lambda w: w.control0.selector())), 'start/birth_body'),
    ]
    for name, cfg, expected in rows:
        run_case(out, 'R2/' + name, 'R2', 'negative', world_case(cfg), expected)
    return out


def preserve_case(cfg, read='preserved', post=None, check=None):
    def run():
        w = W.CancelWorld(cfg, base=BASE)
        try:
            w.build()
            presentation, request = R.Presentation(w), request_of(w)
            if post is not None:
                post(w, presentation, request)
            consumer = R.Consumer(w)
            before = w.recorder.snapshot()
            out = consumer.read_preserved(request, presentation) if read == 'preserved' else \
                consumer.read_retained_native(request, presentation)
            after = w.recorder.snapshot()
            W.guard('passive/no_effect', [k for k in after if after[k]['sha256'] != before[k]['sha256']] == [])
            return check(w, out) if check else dict(kind=out['result']['kind'], status=out['result']['preserved_status'],
                                                     events=w.storage.observe()['events'])
        finally:
            w.close()
    return run


def r2_preserve_cases():
    """R2 already-terminal byte preservation: no new Event, genuine settlement still required."""
    T = {'start': 'started', 'terminal': 'failed'}
    knob = lambda base, **k: dict(base, knobs=k)  # noqa: E731
    out = []
    run_case(out, 'R2/positive/terminal_failed_preserved', 'R2', 'positive', preserve_case(T))
    run_case(out, 'R2/positive/terminal_certified_preserved', 'R2', 'positive', preserve_case(dict(T, terminal='certified')))
    run_case(out, 'R2/positive/terminal_preserved_with_effect_settlements', 'R2', 'positive', preserve_case(
        dict(T, effects='mutation', filesafe=['rollback'])))

    def terminal_original_projection():
        from pm_goal_dg_int_c3_oracles import terminal_preserved
        return terminal_preserved()
    run_case(out, 'R2/positive/terminal_preserved_projects_no_cancelled_row', 'R2', 'positive', terminal_original_projection)
    rows = [
        ('preserve_appends_event', knob(T, preserve_append=True), 'preserve/no_event'),
        ('preserve_writes_native', knob(T, preserve_native_write=True), 'preserve/native_bytes'),
        ('preserve_after_body_other_genuine', knob(T, preserve_after_body=lambda w: w.body0.selector()),
         'preserve/after_equals_before'),
        ('preserve_status_mismatched', knob(T, preserved_status='certified'), 'preserve/status'),
        ('preserve_prepared_commitment_substituted', knob(T, intent=lambda wr: W.put(wr, '/record/prepared_body_sha256', '4' * 64)),
         'preserve/prepared_unchanged'),
        ('preserve_d01_after_older_body', knob(T, preserve_d01_after_older=True), 'preserve/d01'),
        ('preserve_without_genuine_settlement', dict(T, flush=['original_required_flush_failed', 'original_required_flush_durable']),
         'd05/flush_sticky'),
        ('preserve_publish_native_older_body', knob(T, publish_origin=swap('/record/afterimages/native_body',
                                                                           lambda w: w.body0.selector())), 'preserve/publish_native'),
        ('preserve_scheduler_join_other_genuine', knob(T, result=swap('/record/scheduler_stop', lambda w: w.sched['inventory'].selector())),
         'join/scheduler/result'),
    ]
    for name, cfg, expected in rows:
        run_case(out, 'R2/' + name, 'R2', 'negative', preserve_case(cfg), expected)
    run_case(out, 'R2/preserved_tuple_presented_as_cancellation', 'R2', 'negative', preserve_case(T, read='retained'),
             'tuple/native/schema/event_candidate')
    run_case(out, 'R2/cancelled_tuple_presented_as_preservation', 'R2', 'negative',
             preserve_case({'start': 'started'}), 'preserve/intent_kind')
    return out


def r2_guard_cases():
    """One-defect negatives for the remaining R2/R3 consumer guards (session 2)."""
    S0, N0, M = {'start': 'started'}, {'start': 'no_start'}, {'start': 'started', 'effects': 'mutation', 'filesafe': ['rollback']}
    knob = lambda base, **k: dict(base, knobs=k)  # noqa: E731
    put = lambda path, value: (lambda wr: W.put(wr, path, copy.deepcopy(value)))  # noqa: E731
    U = 'd01_update:d06_cancel_nonterminal'
    out = []
    rows = [
        ('d01_rule_preserve_on_cancel', knob(S0, **{U: put('/record/transition/rule', 'd06_preserve_terminal')}), 'd01/rule'),
        ('d01_after_body_other_genuine', knob(S0, **{U: swap('/record/after_body', lambda w: w.body1.selector())}), 'd01/after_body'),
        ('d01_after_control_other_genuine', knob(S0, **{U: swap('/record/after_control', lambda w: w.control1.selector())}),
         'd01/after_control'),
        ('d01_before_body_other_genuine', knob(S0, **{U: swap('/record/before_body', lambda w: w.body0.selector())}), 'd01/before_body'),
        ('d01_origin_update_is_start', knob(S0, **{'d01_origin:owner.executor.workflow_source.update_workflow.v3': swap(
            '/record/afterimages/workflow_update', lambda w: w.start_cause['original_d01_update'].selector())}), 'd01/origin_update'),
        ('prepared_control_intent_other_genuine', knob(S0, prepared_control=swap('/record/intent', lambda w: next(
            st for (f, k, h), st in w.issued.items() if f == 'workflow_cancel_event_candidate').selector())),
         'd06/prepared_intent'),
        ('prepared_control_phase_committed', knob(S0, prepared_control=put('/record/phase', 'committed')), 'd06/prepared_phase'),
        ('publish_native_control_before', knob(S0, publish_origin=swap('/record/afterimages/native_control',
                                                                       lambda w: w.control1.selector())), 'd06/publish_native_control'),
        ('process_settlement_origin_is_birth', knob(M, settlements=lambda st: [st[0], dict(
            st[1], original_origin=W.World.CURRENT.process_effects['births'][0].d05())]), 'effects/process_settlement_origin'),
        ('settlement_refs_mismatched', knob(M, event_payload=lambda p: p['payload'].update(settlement_refs=['TEST_ONLY:other:ref'])),
         'effects/settlement_refs'),
        ('event_project_mismatched', knob(S0, event_payload=lambda p: p.update(project_id=p['project_id'] + '-other')), 'event/project'),
        ('event_outer_key_mismatched', knob(S0, event_envelope=lambda e: e.update(idempotency_key=e['idempotency_key'] + 'x')),
         'event/outer_key'),
        ('event_key_not_recipe', knob(S0, event_after_key=lambda p: p.update(idempotency_key='pm.goal-runtime-event.v3:' + '5' * 64)),
         'event/idempotency_key'),
        ('candidate_submission_not_stored_event', knob(S0, event_candidate=lambda wr: (
            W.put(wr, '/record/producer_submission/correlation_id', wr['record']['producer_submission']['correlation_id'] + ':x'),
            W.put(wr, '/record/producer_semantic_digest', NR.producer_digest(wr['record']['producer_submission'])))), 'event/producer25'),
        ('candidate_digest_substituted', knob(S0, event_candidate=put('/record/producer_semantic_digest', '6' * 64)),
         'event/producer_digest'),
        ('result_original_value_substituted', knob(S0, result=put('/record/original_event_value/sha256', '7' * 64)),
         'event/original_value'),
        ('goal_binding_origin_selection_substituted', knob(S0, goal_binding_selection=put(
            '/record/binding_origin/complete_value_sha256', '8' * 64)), 'goal/binding_origin_selection'),
        ('goal_receipt_audit_substituted', knob(S0, goal_stop_receipt=put('/record/source_audit_sha256', '9' * 64)),
         'goal/stop_receipt_audit'),
        ('goal_publication_commitment_substituted', knob(S0, goal_control_publication=put(
            '/record/original_publication/original_event_value_commitment/sha256', 'a' * 64)), 'goal/publication_commitment'),
        ('goal_publication_unknown_event', knob(S0, goal_control_publication=put('/record/original_publication/event_id',
                                                                                  'TEST_ONLY-unknown-event')), 'goal/publication_custody'),
        ('result_before_body_other_genuine', knob(S0, result=swap('/record/before_body', lambda w: w.body0.selector())),
         'native/before_selection'),
        ('result_before_control_other_genuine', knob(S0, result=swap('/record/before_control', lambda w: w.control0.selector())),
         'native/before_control_selection'),
        ('cancel_path_from_terminal_before', knob({'start': 'started', 'terminal': 'failed'}, force_cancel=True),
         'native/before_nonterminal'),
        ('scheduler_native_result_other_genuine', knob(S0, scheduler_stop=swap('/record/native_cancel_result', lambda w: next(
            st for (f, k, h), st in w.issued.items() if f == 'executor_run_execution_control').selector())),
         'scheduler/native_cancel_result'),
        ('scheduler_native_origin_other_genuine', knob(S0, scheduler_stop=swap('/record/native_cancel_origin', lambda w: next(
            st for (f, k, h), st in w.issued.items() if f == 'executor_run_execution_control').selector())),
         'scheduler/native_cancel_origin'),
        ('intent_selector_commitment_substituted', knob(S0, intent=put('/record/inventory_cut/physical_value_sha256', 'b' * 64)),
         'select/commitment'),
        ('intent_selector_schema_version_substituted', knob(S0, intent=lambda wr: W.put(
            wr, '/record/inventory_cut/schema_version', '9.9.9')), 'select/schema'),
        ('intent_selector_other_storage', knob(S0, intent=lambda wr: W.put(
            wr, '/record/inventory_cut/storage_instance_id', str(__import__('uuid').uuid4()))), 'select/storage_instance'),
        ('aggregate_origin_ref_absent', knob(S0, d05_aggregate=lambda wr: W.put(wr, '/value/origin/physical_key',
                                                                                wr['value']['origin']['physical_key'] + 'Z')),
         'select/origin_absent'),
        ('aggregate_origin_ref_operation', knob(S0, d05_aggregate=lambda wr: W.put(wr, '/value/origin/operation_id', 'TEST_ONLY:op:z')),
         'select/origin_operation'),
        ('start_update_rule_prepare_start', knob(S0, **{'d01_update:original_workflow_start': lambda wr: (
            W.put(wr, '/record/transition/rule', 'activation_prepare_start'),
            W.put(wr, '/record/transition/original_writer_method', 'owner.workflow.activation.prepare_start.v1'),
            W.put(wr, '/record/cause', 'prepare_start'))}), 'start/rule'),
        ('start_update_origin_candidate', knob(S0, **{'d01_update:original_workflow_start': swap(
            '/record/original_owner_origin', lambda w: w.start_cause_candidate.selector())}), 'start/origin'),
        ('cancel_update_previous_head_other', knob(S0, **{U: swap('/record/previous_head', lambda w: w.sched['coverage'].selector())}),
         'start/head_chain'),
    ]
    for scope_name, k in (('intent', 'intent'), ('result', 'result'), ('committed_control', 'committed_control'),
                          ('prepare_origin', 'prepare_origin'), ('publish_origin', 'publish_origin'),
                          ('original_d01_update', U)):
        rows.append(('scope_' + scope_name + '_other_run', knob(S0, **{k: lambda wr: W.put(
            wr, '/record/scope/goal_run_id', wr['record']['scope']['goal_run_id'] + '-other')}), 'scope/' + scope_name))
    rows.append(('event_envelope_project_partition', knob(S0, event_envelope=lambda e: e.update(
        project_id=e['project_id'] + '-other')), 'event/partition'))
    rows.append(('scope_original_d01_origin_other_run', knob(S0, **{
        'd01_origin:owner.executor.workflow_source.update_workflow.v3': lambda wr: W.put(
            wr, '/record/scope/goal_run_id', wr['record']['scope']['goal_run_id'] + '-other')}), 'scope/original_d01_origin'))
    for name, cfg, expected in rows:
        run_case(out, 'R2/' + name, 'R2', 'negative', world_case(cfg), expected)

    def reorder(w, p, r):
        p.safe_stop['complete_original_origin_chain'] = list(reversed(p.safe_stop['complete_original_origin_chain']))
    def bad_request_shape(w, p, r):
        r['extra'] = 1
    def bad_request_storage(w, p, r):
        r['storage_instance_id'] = str(__import__('uuid').uuid4())
    def bad_pair(w, p, r):
        p.cancellation['intent'] = [p.cancellation['intent'][0], p.cancellation['intent'][1]]
    for name, post, expected in [('origin_chain_reordered', reorder, 'd05/aggregate_origin_last'),
                                 ('request_extra_member', bad_request_shape, 'request/shape'),
                                 ('request_other_storage', bad_request_storage, 'request/storage'),
                                 ('presented_pair_as_list', bad_pair, 'acquire/pair')]:
        run_case(out, 'R2/' + name, 'R2', 'negative', world_case(S0, post=post), expected)
    return out


def r3_cases():
    M = {'start': 'started', 'effects': 'mutation', 'filesafe': ['rollback', 'commit']}
    knob = lambda base, **k: dict(base, knobs=k)  # noqa: E731
    out = []
    run_case(out, 'R3/positive/mutation_false_empty_settlements', 'R3', 'positive',
             world_case({'start': 'started'}, check=lambda w, r: dict(
                 settlements=len(r['native_cancellation']['original_safe_stop']['aggregate_result']['value']['settlements']),
                 mutation_started=r['original_value']['event']['payload']['payload']['mutation_started'])))
    run_case(out, 'R3/positive/mutation_true_complete_settlements_rollback', 'R3', 'positive',
             world_case(M, check=lambda w, r: dict(
                 settlements=len(r['native_cancellation']['original_safe_stop']['aggregate_result']['value']['settlements']),
                 rollback_refs=r['original_value']['event']['payload']['payload'].get('rollback_refs'),
                 mutation_started=r['original_value']['event']['payload']['payload']['mutation_started'])))
    run_case(out, 'R3/positive/mutation_true_no_start', 'R3', 'positive', world_case(dict(M, start='no_start')))

    def drop_process_birth(w, p, r):
        p.process['births'] = []
    def drop_filesafe(w, p, r):
        p.filesafe = p.filesafe[:1]
    def withdraw_journal(w, p, r):
        w.filesafe.withdraw(w.filesafe_invocations[0]['journal']['stored'].handle)
    negatives = [
        ('settlement_omitted', knob(M, settlements=lambda s: s[:-1]), 'effects/settlement_count'),
        ('settlement_result_shared', knob(M, settlements=lambda s: [s[0], dict(s[1], original_result=s[0]['original_result'],
                                                                                 original_origin=s[0]['original_origin']), s[2]]),
         'effects/settlement_once'),
        ('settlement_duplicated', knob(M, settlements=lambda s: [s[0], s[0], s[2]]), 'operations/distinct'),
        ('process_settlement_selects_termination', knob(M, settlement_process_termination=True),
         'effects/process_settlement_result'),
        ('mutation_flag_false_with_effects', knob(M, mutation_flag=False), 'effects/mutation_census'),
        ('rollback_ref_for_committed_journal', knob(M, extra_rollback=True), 'effects/rollback_refs'),
        ('capability_reopened', knob(M, capability_reopened=0), 'd05/capability_reopened'),
        ('capability_not_revoked', knob(M, capability_disposition=set_path('/value/disposition', 'reopened')),
         'issue/executor_safestop_capability_disposition/schema/value/disposition'),
        ('sticky_flush_failure_mutation', dict(M, flush=['original_required_flush_failed', 'original_required_flush_durable']),
         'd05/flush_sticky'),
        ('pre_attempt_effect_mutation', knob(M, pre_attempt_effect=True), 'd05/pre_attempt_effects'),
        ('unknown_flush_outcome', dict(M, flush=['unknown']), 'd05/flush_sticky'),
    ]
    for name, cfg, expected in negatives:
        run_case(out, 'R3/' + name, 'R3', 'negative', world_case(cfg), expected)
    for name, post, expected in [
            ('process_birth_omitted_from_tuple', drop_process_birth, 'effects/process_partition'),
            ('filesafe_invocation_omitted_from_tuple', drop_filesafe, 'effects/settlement_count'),
            ('filesafe_journal_withdrawn', withdraw_journal, 'original/withdrawn')]:
        run_case(out, 'R3/' + name, 'R3', 'negative', world_case(M, post=post), expected)
    return out



# ------------------------------------------------------------------ R4-R6

import pm_goal_dg_r_projector as P  # noqa: E402

LONG_ACTOR = lambda n: (lambda p: p.update(actor_ref='TEST_ONLY:actor:' + 'a' * n))  # noqa: E731


def off_run_event(w, kind='goal_run.started', same_run=False, pending=False, extra=None):
    """Append a genuine Storage event for another (or the same) run."""
    run = w.scope['goal_run_id'] if same_run else w.scope['goal_run_id'] + '-other'
    tag = os.urandom(6).hex()
    event = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project', event_id=str(__import__('uuid').uuid4()),
                 event_type=kind, project_id=w.scope['project_id'], thread_id=None, run_id=None, node_id=None,
                 attempt_id=None, actor_ref='TEST_ONLY:actor:other', requested_account_ref=None,
                 effective_account_ref=None, occurred_at_utc=w.clock.now(), producer_sequence_id=None,
                 correlation_id='TEST_ONLY:correlation:' + tag, causation_event_id=None, parent_event_id=None,
                 idempotency_key='TEST_ONLY:%s:%s' % (kind, tag),
                 payload_schema_id={
                     'goal_run.started': 'pm.goal_runtime_event.goal_run_started.schema.v3',
                     'goal_run.cancelled': 'pm.goal_runtime_event.goal_run_cancelled.schema.v3',
                     'goal_run.stopped': 'pm.goal_runtime_event.goal_run_stopped.schema.v2',
                     'goal_run.blocked': 'pm.goal_runtime_event.goal_run_blocked.schema.v2',
                     'goal_run.replanned': 'pm.goal_runtime_event.goal_run_replanned.schema.v2',
                 }[kind],
                 payload=dict(goal_id=w.scope['goal_id'], payload=dict(goal_run_id=run)), payload_ref=None,
                 redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
                 migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                                compatibility_event_type=None))
    if extra:
        extra(event)
    if pending:
        handle = w.storage.reserve('TEST_ONLY:pending:' + tag, dict(tag=tag))
        w.storage.append(handle, [event])
        return event
    w.append.append_original('TEST_ONLY:append:other:' + tag, dict(tag=tag), [event], durability_class='barrier')
    return event


def projector_case(cfg, steps, check=None):
    """Build a world, then run projector steps; each step is fn(world, projector)."""
    def run():
        options=dict(cfg)
        # Current-reader counterexamples mutate the acquired read argument,
        # after genuine C3 settlement has established a valid original.
        knobs=dict(options.get('knobs',{}))
        late={k:knobs.pop(k) for k in list(knobs) if k in
              ('readback_edit','safe_readback_edit','current_start_edit','current_read_edit','current_goal_edit')}
        options['knobs']=knobs
        legacy=options.pop('legacy_goal_v1',False)
        if legacy:
            w=W.CancelWorld(options,base=BASE)
        elif options.get('edition')=='native_v7' or options.get('start')=='no_start':
            from pm_goal_dg_int_cancel import CancelWorld
            w=CancelWorld(options,base=BASE)
        else:
            from pm_goal_dg_int_old import World
            w=World(options,base=BASE)
        try:
            w.build()
            w.knobs.update(late)
            p = getattr(w,'projector_class',P.Projector)(w)
            value = None
            for step in steps:
                value = step(w, p)
            if check is not None:
                return check(w, p, value)
            return value if isinstance(value, dict) and 'tx_id' not in value else dict(ok=True)
        finally:
            w.close()
    return run


def must_publish(w, p, **kw):
    out = p.project(**kw)
    W.guard('project/unavailable:' + str(out.get('reason')), 'reason' not in out)
    return out


def must_unavailable(reason):
    def step(w, p):
        out = p.project()
        W.guard('project/published', 'reason' in out)
        raise W.Refusal('unavailable/' + out['reason'] + '/' + p.last_halt[0])
    return step


def publish(w, p):
    return must_publish(w, p)


def cutover(w, p):
    return p.cutover()


def historical(w, p):
    before = w.recorder.snapshot()
    out = p.read_historical()
    after = w.recorder.snapshot()
    W.guard('passive/no_effect', [k for k in after if after[k]['sha256'] != before[k]['sha256']] == [])
    return out


def r5_cases():
    S0, N0 = {'start': 'started'}, {'start': 'no_start'}
    knob = lambda base, **k: dict(base, knobs=k)  # noqa: E731
    out = []

    def form(w, p, v):
        content=v['row'].get('content',dict(kind='inline',record=v['row'].get('record',{})))
        return dict(kind=content['kind'], record=content.get('record', {}).get(
            'status_at_original_event'), frontier=w.storage.last_sequence)
    # The retained v1 Goal event remains unregistered; explicitly prove quarantine.
    for name, cfg in (('started', S0), ('no_start', N0)):
        run_case(out, 'R5/unregistered_goal_cancelled_v1_' + name, 'R5', 'negative',
                 projector_case(dict(cfg,legacy_goal_v1=True), [must_unavailable(None)]),
                 'unavailable/UNSUPPORTED_RELEVANT_EVENT/reducer/unregistered_record')

    run_case(out, 'R5/positive/started_then_cancelled_combined', 'R5', 'positive', projector_case(S0, [publish], form))
    run_case(out, 'R5/positive/initialized_no_start_cancellation', 'R5', 'positive', projector_case(N0, [publish], form))

    def off_run_noop(w, p):
        off_run_event(w)
        off_run_event(w, 'goal_run.stopped')
        return must_publish(w, p)
    run_case(out, 'R5/positive/off_run_rows_validated_then_noop', 'R5', 'positive', projector_case(S0, [off_run_noop]))

    def coverage_counts_off_run(w, p):
        a = must_publish(w, p)
        return dict(processed=a['checkpoint']['content'].get('checkpoint', {}).get('generations', {}) and True)
    run_case(out, 'R5/positive/coverage_is_global_prefix', 'R5', 'positive', projector_case(dict(S0, knobs=dict(
        pre_cancel_events=lambda w: off_run_event(w))), [publish]))

    def deterministic(w, p):
        first = must_publish(w, p)
        again = getattr(w,'projector_class',P.Projector)(w).project()
        W.guard('determinism/replay', again.get('replay') is True and A.same(again['row'], first['row']))
        return dict(row_sha256=W.physical_sha256(first['row']))
    run_case(out, 'R5/positive/deterministic_reprocessing_same_row', 'R5', 'positive', projector_case(S0, [deterministic]))

    def gap(w, p):
        sealed = [s_ for s_ in w.storage.segments if s_['sealed'] and not s_['retired']]
        W.guard('gap/sealed_segment', bool(sealed))
        first = sealed[0]['generation']
        disposition = w.storage.retire_segment(first, S.RetentionOwner(w.storage))
        out_ = must_publish(w, p)
        return dict(retired_segment=first, gap_frames=disposition['frame_count'],
                    gap_sha=out_['checkpoint']['content'].get('checkpoint', {}).get('generations') is not None)
    run_case(out, 'R5/positive/authenticated_retention_gap_continues', 'R5', 'positive', projector_case(
        dict(S0, segment_target_bytes=6000, knobs=dict(pre_start_events=lambda w: [off_run_event(w) for _ in range(5)])), [gap]))

    negatives = [
        ('unsupported_same_run_row_before_cancel', knob(S0, pre_cancel_events=lambda w: off_run_event(w, 'goal_run.stopped', True)),
         'unavailable/UNSUPPORTED_RELEVANT_EVENT/reducer/unsupported_same_run'),
        ('unsupported_same_run_blocked', knob(S0, pre_cancel_events=lambda w: off_run_event(w, 'goal_run.blocked', True)),
         'unavailable/UNSUPPORTED_RELEVANT_EVENT/reducer/unsupported_same_run'),
        ('unsupported_same_run_replanned', knob(S0, pre_cancel_events=lambda w: off_run_event(w, 'goal_run.replanned', True)),
         'unavailable/UNSUPPORTED_RELEVANT_EVENT/reducer/unsupported_same_run'),
        ('cancel_event_without_native_cancellation', knob(S0, pre_cancel_events=lambda w: off_run_event(w, 'goal_run.cancelled', True)),
         'unavailable/UNSUPPORTED_RELEVANT_EVENT/reducer/cancel_without_native_cancellation'),
        ('second_start_event_same_run', knob(S0, pre_cancel_events=lambda w: off_run_event(w, 'goal_run.started', True)),
         'unavailable/UNSUPPORTED_RELEVANT_EVENT/reducer/duplicate_start'),
    ]
    for name, cfg, expected in negatives:
        run_case(out, 'R5/' + name, 'R5', 'negative', projector_case(cfg, [must_unavailable(None)]), expected)

    def pending_after_originals(w,p):
        # C3 itself requires full original index custody. Introduce the
        # incomplete global row only after its genuine originals are settled.
        off_run_event(w,pending=True)
        return must_unavailable(None)(w,p)
    run_case(out,'R5/pending_first_custody_off_run','R5','negative',
        projector_case(S0,[pending_after_originals]),
        'unavailable/INCOMPLETE_GLOBAL_COVERAGE/project/pending_custody')

    def second_terminal(w, p):
        off_run_event(w, 'goal_run.cancelled', True)
        return must_unavailable(None)(w, p)
    run_case(out, 'R5/second_cancelled_after_terminal', 'R5', 'negative', projector_case(S0, [second_terminal]),
             'unavailable/UNSUPPORTED_RELEVANT_EVENT/reducer/second_terminal')

    def corrupt_off_run(w, p):
        event = off_run_event(w)
        info = w.storage.events[event['event_id']]
        path = w.storage._segment_path(info['segment_generation'])
        raw = bytearray(path.read_bytes())
        raw[info['offset'] + info['length'] - 2] ^= 0xFF
        path.write_bytes(bytes(raw))
        return must_unavailable(None)(w, p)
    run_case(out, 'R5/malformed_off_run_frame_at_rest', 'R5', 'negative', projector_case(S0, [corrupt_off_run]),
             'unavailable/INCOMPLETE_GLOBAL_COVERAGE/source/frame/payload_crc')

    def start_commit_receipt(w, p):
        # The genuine S1 publisher cannot issue a mismatched receipt. Exercise
        # the reducer's independent argument boundary using its actual acquired
        # Start and Storage custody, with one substituted transport member.
        _,_,starts,_,_,_=p.acquire()
        W.guard('receipt/one_start',len(starts)==1)
        start=copy.deepcopy(starts[0]);receipt=start['commit']['record']['first_append_receipt']
        receipt['byte_offset']+=1
        event=w.storage.read_event(start['commit']['record']['event_id'])
        before=w.storage.observe()
        try:return p.check_start_event(start,event,w.storage.first_custody(event['event_id']))
        finally:W.guard('receipt/passive',w.storage.observe()==before)
    run_case(out, 'R5/start_commit_receipt_substituted', 'R5', 'negative', projector_case(S0,
        [start_commit_receipt]), 'reducer/start_receipt')
    return out


def r6_cases():
    S0 = {'start': 'started'}
    knob = lambda base, **k: dict(base, knobs=k)  # noqa: E731
    out = []

    def atomic(w, p):
        r = must_publish(w, p)
        row = w.storage.cell(P.dataset(r['generation_id']), P.row_key(w.scope))
        ck = w.storage.cell('checkpoints', P.checkpoint_key(w.scope))
        W.guard('atomic/same_transaction', row['tx'] == ck['tx'] == r['tx_id'])
        W.guard('key/k_recipe', P.row_key(w.scope).endswith(S.k_component(w.scope['project_id']) + ':' +
                                                          S.k_component(w.scope['goal_run_id'])))
        return dict(tx=r['tx_id'], form=r['row']['content']['kind'])
    run_case(out, 'R6/positive/atomic_row_and_checkpoint', 'R6', 'positive', projector_case(S0, [atomic]))

    def crash(cut, expect_present):
        def step(w, p):
            r = p.project(cut=cut)
            W.guard('crash/child_died', r['child_exit'] == S.CRASH_EXIT)
            present = w.storage.cell('checkpoints', P.checkpoint_key(w.scope)) is not None
            W.guard('crash/visibility', present is expect_present)
            retry = must_publish(w, p)
            if expect_present:
                W.guard('crash/lost_ack_same_first_tx', retry.get('replay') is True)
            return dict(child_exit=r['child_exit'], present=present, retry=retry.get('replay', False))
        return step
    run_case(out, 'R6/positive/crash_before_commit_neither_visible', 'R6', 'positive',
             projector_case(S0, [crash('before_terminal', False)]))
    run_case(out, 'R6/positive/crash_after_commit_both_visible_retry_same', 'R6', 'positive',
             projector_case(S0, [crash('after_terminal', True)]))
    run_case(out, 'R6/positive/staged_cutover_then_historical', 'R6', 'positive', projector_case(S0, [publish, cutover, historical]))
    run_case(out, 'R6/positive/event_reference_form', 'R6', 'positive', projector_case(
        knob(S0, event_payload=LONG_ACTOR(5000)), [publish, cutover, historical],
        lambda w, p, v: dict(form=v['projection']['content']['kind'])))
    run_case(out, 'R6/positive/record_reference_form_at_id_cap', 'R6', 'positive', projector_case(
        dict(S0, id_pad=222, knobs=dict(event_payload=LONG_ACTOR(3000))), [publish, cutover, historical],
        lambda w, p, v: dict(form=v['projection']['content']['kind'])))

    def rebuild(w, p):
        must_publish(w, p)
        p.cutover()
        must_publish(w, p, stage_only=True)
        c = p.cutover()
        W.guard('rebuild/retired_prior', c['retired'] is not None)
        cell, logical = p.current_checkpoint()
        return dict(states=sorted(g['state'] for g in logical['generations'].values()),
                    checkpoint_form=cell['value']['content']['kind'])
    run_case(out, 'R6/positive/fresh_rebuild_cutover_retires_prior', 'R6', 'positive', projector_case(S0, [rebuild, historical]))
    def rebuild_twice(w, p):
        rebuild(w, p)
        must_publish(w, p, stage_only=True)
        p.cutover()
        cell, logical = p.current_checkpoint()
        W.guard('spill/payload_reference', cell['value']['content']['kind'] == 'payload_reference')
        return dict(generations=len(logical['generations']), checkpoint_form=cell['value']['content']['kind'])
    run_case(out, 'R6/positive/checkpoint_spill_three_generations_at_id_cap', 'R6', 'positive',
             projector_case(dict(S0, id_pad=222), [rebuild_twice, historical]))

    def fourth_slot(w, p):
        must_publish(w, p)
        p.cutover()
        for _ in range(2):
            must_publish(w, p, stage_only=True)
            p.cutover()
        return must_publish(w, p, stage_only=True)
    def withdraw_projector(w, p):
        p.withdrawn = True
        return p.project()
    def withdraw_reader(w, p):
        p.reader_withdrawn = True
        return p.read_historical()
    def held_reader(w, p):
        p.hooks['after_original'] = lambda w_, p_: setattr(p_, 'reader_withdrawn', True)
        return p.read_historical()
    def source_lost(w, p):
        w.d06.withdraw(w.cancellation['result'].handle)
        return p.project()
    def pack_withdrawn(w, p):
        row = p.stored_projection()[3]
        w.storage.withdraw_pack(row['content']['event_ref']['blake3'])
        return p.read_historical()
    def pack_corrupt(w, p):
        row = p.stored_projection()[3]
        path = w.storage.root / 'packs' / row['content']['event_ref']['blake3']
        raw = bytearray(path.read_bytes())
        raw[-1] ^= 0xFF
        path.write_bytes(bytes(raw))
        return p.read_historical()
    def stale_cas(w, p):
        p.hooks['before_commit'] = lambda w_, p_: off_run_event(w_)
        return p.project()
    def row_preempted(w, p):
        def steal(w_, p_):
            w_.storage.transact([dict(table='checkpoints', key=P.checkpoint_key(w_.scope), expected=None,
                                      value=dict(schema_id='TEST_ONLY:concurrent', schema_version='1.0.0'))])
        p.hooks['before_commit'] = steal
        return p.project()
    def premature_cutover(w, p):
        must_publish(w, p)
        off_run_event(w)
        return p.cutover()
    def forced_reference(w, p):
        must_publish(w, p, force='event_reference')
        p.cutover()
        return p.read_historical()
    def hex_key(w, p):
        must_publish(w, p)
        p.cutover()
        ck, logical, gen, row = p.stored_projection()
        bad = dict(row, physical_key=P.ROW_PREFIX + ':' + w.scope['project_id'].encode().hex() + ':' +
                   w.scope['goal_run_id'].encode().hex())
        return p.decode(bad, w.scope, gen['generation_id'])
    def substituted_row(w, p):
        ck, logical, gen, row = p.stored_projection()
        table = P.dataset(gen['generation_id'])
        cell = w.storage.cell(table, P.row_key(w.scope))
        bad = copy.deepcopy(cell['value'])
        bad['content']['record']['producer_semantic_digest'] = '5' * 64
        w.storage.transact([dict(table=table, key=P.row_key(w.scope), expected=cell['version'], value=bad)])
        return p.read_historical()
    LA = knob(S0, event_payload=LONG_ACTOR(5000))
    negatives = [
        ('fourth_generation_slot', S0, [fourth_slot], 'generation/limit'),
        ('projector_withdrawn', S0, [withdraw_projector], 'projector/withdrawn'),
        ('reader_withdrawn', S0, [publish, cutover, withdraw_reader], 'reader/withdrawn'),
        ('held_reader_withdrawn_before_release', S0, [publish, cutover, held_reader], 'reader/withdrawn'),
        ('original_source_lost', S0, [source_lost], 'original/withdrawn'),
        ('pack_withdrawn', LA, [publish, cutover, pack_withdrawn], 'pack/unavailable'),
        ('pack_corrupt_at_rest', LA, [publish, cutover, pack_corrupt], 'payload/numrule/payload_digest'),
        ('stale_source_token_at_commit', S0, [stale_cas], 'cas/source_token'),
        ('checkpoint_cas_preempted', S0, [row_preempted], 'tx/cas_absent'),
        ('premature_cutover_incomplete_coverage', S0, [premature_cutover], 'cutover/complete_coverage'),
        ('reference_when_inline_fits', S0, [forced_reference], 'decode/representation_minimal'),
        ('lower_hex_row_key', S0, [hex_key], 'decode/key'),
        ('row_substituted_at_rest', S0, [publish, cutover, substituted_row], 'read/row_frontier'),
        ('permission_revoked_before_commit', S0, [lambda w, p: (p.hooks.__setitem__(
            'before_commit', lambda w_, p_: w_.permissions.__setitem__('project', False)), p.project())[1]], 'permission/project'),
        ('permission_revoked_before_release', S0, [publish, cutover, lambda w, p: (p.hooks.__setitem__(
            'after_original', lambda w_, p_: w_.permissions.__setitem__('read', False)), p.read_historical())[1]],
         'permission/read'),
    ]
    for name, cfg, steps, expected in negatives:
        run_case(out, 'R6/' + name, 'R6', 'negative', projector_case(cfg, steps), expected)
    return out


def r56_lower_cases():
    """Direct invocations of the projector's lower helpers with one substituted argument."""
    S0, N0 = {'start': 'started'}, {'start': 'no_start'}
    knob = lambda base, **k: dict(base, knobs=k)  # noqa: E731
    out = []

    def stored(w, p):
        must_publish(w, p)
        p.cutover()
        return p.stored_projection()

    def row_edit(edit):
        def step(w, p):
            ck, logical, gen, row = stored(w, p)
            bad = copy.deepcopy(row)
            edit(w, bad)
            return p.decode(bad, w.scope, gen['generation_id'])
        return step

    def both_commitments(w, row, sha):
        row['original_event_value_commitment']['sha256'] = sha
        row['content']['record']['original_event_value_commitment']['sha256'] = sha

    def coherent_event(w, row):
        event = row['content']['record']['original_event']
        event['correlation_id'] = event['correlation_id'] + ':substituted'
        both_commitments(w, row, NR.full_value_commitment(event))

    def ck_edit(edit):
        def step(w, p):
            ck, logical, gen, row = stored(w, p)
            bad = copy.deepcopy(ck)
            edit(w, bad)
            return p.read_checkpoint(bad)
        return step

    def unpack_edit(edit):
        def step(w, p):
            ck, logical, gen, row = stored(w, p)
            ref = copy.deepcopy(row['content']['event_ref'])
            edit(ref)
            return p.unpack(ref)
        return step

    def metadata_with_event(w, p):
        ck, logical, gen, row = stored(w, p)
        record = p.decode(row, w.scope, gen['generation_id'])
        bad = copy.deepcopy(row)
        bad['content']['metadata_ref'] = p.pack(record)
        return p.decode(bad, w.scope, gen['generation_id'])

    def reducer_edit(kind, edit):
        def step(w, p):
            source, snapshot, starts, cancellations, goal, effects = p.acquire()
            reducer = P.CombinedReducer(p, w.scope, starts, cancellations)
            rows = [r for r in snapshot.rows if P.same_run(r.event, w.scope)]
            state = reducer.initial()
            for r in rows:
                event, custody = copy.deepcopy(r.event), copy.deepcopy(r.custody)
                if event['event_type'] == kind:
                    edit(starts, cancellations, event, custody)
                state = reducer.step(state, event, custody)
            return state
        return step

    def cutover_row_changed(w, p):
        must_publish(w, p)
        cell, logical = p.current_checkpoint()
        gen = next(iter(logical['generations'].values()))
        table = P.dataset(gen['generation_id'])
        row = w.storage.cell(table, P.row_key(w.scope))
        bad = copy.deepcopy(row['value'])
        bad['content']['record']['producer_semantic_digest'] = 'd' * 64
        w.storage.transact([dict(table=table, key=P.row_key(w.scope), expected=row['version'], value=bad)])
        return p.cutover()

    LA = knob(S0, event_payload=LONG_ACTOR(5000))
    RR = dict(S0, id_pad=222, knobs=dict(event_payload=LONG_ACTOR(3000)))
    rows = [
        ('decode_storage_other', S0, [row_edit(lambda w, r: r.update(storage_instance_id=str(__import__('uuid').uuid4())))],
         'decode/storage'),
        ('decode_dataset_other_generation', S0, [row_edit(lambda w, r: r.update(dataset_name=P.dataset('grscg_' + 'e' * 64)))],
         'decode/dataset'),
        ('decode_identity_sequence', S0, [row_edit(lambda w, r: r['event_identity'].update(
            sequence_id=r['event_identity']['sequence_id'] + 1))], 'decode/identity'),
        ('decode_wrapper_commitment', S0, [row_edit(lambda w, r: r['original_event_value_commitment'].update(sha256='f' * 64))],
         'decode/commitment'),
        ('decode_full_value', S0, [row_edit(lambda w, r: both_commitments(w, r, '1' * 64))], 'decode/full_value'),
        ('decode_custody_commitment', S0, [row_edit(coherent_event)], 'decode/custody_commitment'),
        ('decode_metadata_carries_event', RR, [metadata_with_event], 'decode/metadata_has_no_event'),
        ('checkpoint_key_other', S0, [ck_edit(lambda w, c: c.update(physical_key=c['physical_key'] + 'A'))], 'checkpoint/key'),
        ('checkpoint_storage_other', S0, [ck_edit(lambda w, c: c.update(storage_instance_id=str(__import__('uuid').uuid4())))],
         'checkpoint/storage'),
        ('checkpoint_logical_key_other', S0, [ck_edit(lambda w, c: c['content']['checkpoint'].update(
            physical_key=c['content']['checkpoint']['physical_key'] + 'A'))], 'checkpoint/logical_key'),
        ('checkpoint_logical_scope_other', S0, [ck_edit(lambda w, c: c['content']['checkpoint']['scope'].update(
            goal_id=c['content']['checkpoint']['scope']['goal_id'] + '-other'))], 'checkpoint/scope'),
        ('pack_reference_extra_member', LA, [unpack_edit(lambda r: r.update(extra=1))], 'pack/reference_type'),
        ('pack_reference_media_type', LA, [unpack_edit(lambda r: r.update(media_type='application/json'))], 'pack/media_type'),
        ('reducer_cancel_receipt_substituted', S0, [reducer_edit('goal_run.cancelled', lambda st, ca, e, c: c[
            'first_append_receipt'].update(byte_offset=c['first_append_receipt']['byte_offset'] + 1))], 'reducer/cancel_receipt'),
        ('reducer_cancel_commitment_substituted', S0, [reducer_edit('goal_run.cancelled', lambda st, ca, e, c: c[
            'original_event_value_commitment'].update(sha256='2' * 64))], 'reducer/cancel_commitment'),
        ('reducer_cancel_producer_substituted', S0, [reducer_edit('goal_run.cancelled', lambda st, ca, e, c: e.update(
            correlation_id=e['correlation_id'] + ':x'))], 'reducer/cancel_producer'),
        ('reducer_start_commitment_substituted', S0, [reducer_edit('goal_run.started', lambda st, ca, e, c: c[
            'original_event_value_commitment'].update(sha256='3' * 64))], 'reducer/start_commitment'),
        ('reducer_start_not_barrier', S0, [reducer_edit('goal_run.started', lambda st, ca, e, c: (
            c['first_append_receipt'].update(durability_class='ordinary'),
            st[0]['commit']['record']['first_append_receipt'].update(durability_class='ordinary')))], 'reducer/start_barrier'),
        ('cutover_without_checkpoint', S0, [lambda w, p: p.cutover()], 'cutover/no_checkpoint'),
        ('cutover_without_staged', S0, [publish, cutover, lambda w, p: p.cutover()], 'cutover/no_staged'),
        ('cutover_staged_row_changed', S0, [cutover_row_changed], 'cutover/row'),
        ('read_before_publication', S0, [lambda w, p: p.read_historical()], 'read/no_checkpoint'),
        ('no_relevant_event_yet', dict(N0, stop_after='prepare'), [lambda w, p: p.project()], 'projector/no_relevant_event'),
    ]
    for name, cfg, steps, expected in rows:
        group = 'R5' if name.startswith(('reducer_', 'no_relevant')) else 'R6'
        run_case(out, group + '/' + name, group, 'negative', projector_case(cfg, steps), expected)
    return out


def r4_cases():
    S0 = {'start': 'started'}
    out = []
    run_case(out, 'R4/positive/historical_read', 'R4', 'positive', projector_case(S0, [publish, cutover, historical]))

    def advance(w, p):
        # a lawful later native advance (new body revision by the native owner)
        body = w.native.prepare_body(w.body2, 'cancelled')
        control = w.native.prepare_control(w.control2, body)
        w.body3, w.control3 = w.native.commit(body, control, w.body2, w.control2)
        return None
    run_case(out, 'R4/positive/historical_after_lawful_native_advance', 'R4', 'positive',
             projector_case(S0, [publish, cutover, advance, historical]))
    run_case(out, 'R4/positive/current_sources_fresh_at_entry_and_final', 'R4', 'positive',
             projector_case(S0, [publish, cutover, lambda w, p: (p.current_sources(), p.current_sources())[1] and None]))
    run_case(out, 'R4/positive/current_started_view_refuses_after_cancel', 'R4', 'positive',
             projector_case(S0, [lambda w, p: W.guard('started/stale', p.read_current_started()['reason'] == 'STALE_NATIVE')]))

    def after_decode_withdraw(w, p):
        p.hooks['after_decode'] = lambda w_, p_: w_.d06.withdraw(w_.cancellation['intent'].handle)
        return p.read_historical()
    def after_original_row(w, p):
        def swap(w_, p_):
            ck, logical, gen, row = p_.stored_projection()
            table = P.dataset(gen['generation_id'])
            cell = w_.storage.cell(table, P.row_key(w_.scope))
            bad = copy.deepcopy(cell['value'])
            bad['content']['record']['activation_at_original_event'] = 'cancelled_before_mutation'
            w_.storage.transact([dict(table=table, key=P.row_key(w_.scope), expected=cell['version'], value=bad)])
        p.hooks['after_original'] = swap
        return p.read_historical()
    def stale_native(w, p):
        advance(w, p)
        return p.current_sources()
    def newer_goal_stop(w, p):
        advance_current_goal_stop(w)
        return p.current_sources()
    def d06_control_changed(w, p):
        c = w.cancellation['committed_control']
        w.d06.issue_physical(c.family, 'native_consumer', W.D06 + 'StorageControl', c.key,
                             [('/record/operation_id', c.wrapper['record']['operation_id']), ('/record/revision', 3),
                              ('/record/intent', c.wrapper['record']['intent']), ('/record/phase', 'committed'),
                              ('/record/result', c.wrapper['record']['result']),
                              ('/record/last_origin_operation_id', c.wrapper['record']['operation_id'])], mutable=True)
        return p.current_sources()
    def d01_head_advanced(w, p):
        h = w.cancellation['original_d01_head']
        w.d01.issue_physical(h.family, 'native_consumer', W.WO + 'StorageWorkflowHead', h.key,
                             [('/record/revision', h.wrapper['record']['revision'] + 1),
                              ('/record/last_update', h.wrapper['record']['last_update']),
                              ('/record/current_body', h.wrapper['record']['current_body']),
                              ('/record/current_control', h.wrapper['record']['current_control']),
                              ('/record/previous_head', h.selector()),
                              ('/record/activation_body', h.wrapper['record']['activation_body']),
                              ('/record/activation_origin', h.wrapper['record']['activation_origin']),
                              ('/record/workflow_owner_ref', h.wrapper['record']['workflow_owner_ref']),
                              ('/record/workflow_owner_epoch', 1), ('/record/pending_operation_id', None)], mutable=True)
        return p.current_sources()
    def final_boundary_drift(w, p):
        first = p.current_sources()
        advance(w, p)
        W.guard('final/current', A.same(p.current_sources(), first))
    for name, steps, expected in [
            ('helper_return_original_withdrawn', [publish, cutover, after_decode_withdraw], 'original/withdrawn'),
            ('helper_return_row_substituted', [publish, cutover, after_original_row], 'read/row_frontier'),
            ('current_native_advanced', [publish, cutover, stale_native], 'current/native_body'),
            ('current_newer_goal_stop', [publish, cutover, newer_goal_stop], 'current/goal_stop'),
            ('current_d06_control_changed', [publish, cutover, d06_control_changed], 'current/d06_control'),
            ('current_d01_head_advanced', [publish, cutover, d01_head_advanced], 'current/d01_head'),
            ('final_boundary_native_drift', [publish, cutover, final_boundary_drift], 'current/native_body')]:
        run_case(out, 'R4/' + name, 'R4', 'negative', projector_case(S0, steps), expected)
    return out


def r3_effect_cases():
    """R3 modeled effects: owner-applied safe-point restore and process shutdown (session 2)."""
    M = {'start': 'started', 'effects': 'mutation', 'filesafe': ['rollback', 'commit']}
    knob = lambda base, **k: dict(base, knobs=k)  # noqa: E731
    out = []

    def effect_state(w, r):
        effects = r['native_cancellation']['original_process_effects']
        journals = [w.storage.cell('test_only_filesafe_workspace', inv['workspace_key'])['value']['record']['state_sha256']
                    for inv in w.filesafe_invocations]
        return dict(workspaces=journals, processes=len(effects['shutdown_results']))
    run_case(out, 'R3/positive/rollback_restores_and_commit_keeps', 'R3', 'positive', world_case(M, check=effect_state))
    run_case(out, 'R3/positive/terminal_preservation_with_modeled_effects', 'R3', 'positive', preserve_case(
        dict(M, terminal='failed')))
    rows = [
        ('rollback_post_state_not_safe_point', knob(M, filesafe_journal=lambda wr: W.put(
            wr, '/post_restore_state_sha256', wr['pre_restore_state_sha256']) if wr['restore_outcome'] == 'restored_clean' else None),
         'effects/rollback_restores_safe_point'),
        ('rollback_not_applied_by_owner', knob(M, filesafe_skip_apply=True), 'effects/workspace_restored'),
        ('restore_operation_target_mismatched', knob(M, filesafe_operations=lambda v: v['operations'][0].update(
            target_sha256='c' * 64)), 'effects/restore_operations'),
        ('unknown_restore_outcome', dict(M, filesafe=['unknown']), 'effects/unknown_outcome'),
        ('kept_mutation_claims_post_state', knob(M, filesafe_journal=lambda wr: W.put(
            wr, '/post_restore_state_sha256', wr['target_state_sha256']) if wr['restore_outcome'] == 'restore_skipped' else None),
         'effects/commit_keeps_mutation'),
        ('termination_probe_birth_other_genuine', knob(M, process_termination=lambda wr: W.put(
            wr, '/value/probe_birth', __import__('pm_goal_dg_r_world').ref_like(
                W.World.CURRENT, 'native_consumer', W.PS + 'TerminationResultPhysical', '/value/probe_birth',
                next(st for (f, k, h), st in W.World.CURRENT.issued.items() if f == 'executor_process_shutdown_admission')))),
         'effects/process_termination_join'),
        ('shutdown_termination_other_genuine', knob(M, process_shutdown=lambda wr: W.put(
            wr, '/value/termination', __import__('pm_goal_dg_r_world').ref_like(
                W.World.CURRENT, 'native_consumer', W.PS + 'ProcessShutdownResultPhysical', '/value/termination',
                next(st for (f, k, h), st in W.World.CURRENT.issued.items() if f == 'executor_process_birth')))),
         'effects/process_shutdown_join'),
        ('process_not_shut_down_by_owner', knob(M, process_not_shut_down=True), 'effects/process_state'),
        ('journal_manifest_ref_other_workspace', knob(M, filesafe_journal=lambda wr: W.put(
            wr, '/pre_restore_manifest_ref', wr['target_manifest_ref'] + ':other')), 'effects/workspace_present'),
        ('grace_signal_not_delivered', knob(M, process_signal_result='failed'), 'effects/process_unknown'),
    ]
    for name, cfg, expected in rows:
        run_case(out, 'R3/' + name, 'R3', 'negative', world_case(cfg), expected)

    def workspace_substituted(w, p, r):
        inv = w.filesafe_invocations[0]
        cell = w.storage.cell('test_only_filesafe_workspace', inv['workspace_key'])
        bad = copy.deepcopy(cell['value'])
        bad['record']['state_sha256'] = 'd' * 64
        w.storage.transact([dict(table='test_only_filesafe_workspace', key=inv['workspace_key'], expected=cell['version'],
                                 value=bad)])
    run_case(out, 'R3/workspace_state_substituted_at_rest', 'R3', 'negative', world_case(M, post=workspace_substituted),
             'effects/workspace_digest')
    return out


def r4_current_cases():
    """R4 current-cancelled reader at one held boundary (session 2)."""
    S0 = {'start': 'started'}
    knob = lambda base, **k: dict(base, knobs=k)  # noqa: E731
    out = []

    def current(w, p):
        before = w.recorder.snapshot()
        r = p.read_current_cancelled()
        after = w.recorder.snapshot()
        W.guard('passive/no_effect', [k for k in after if after[k]['sha256'] != before[k]['sha256']] == [])
        return dict(kind=r['kind'], bytes=len(json.dumps(r)))
    run_case(out, 'R4/positive/current_cancelled_whole_read', 'R4', 'positive', projector_case(S0, [publish, cutover, current]))
    run_case(out, 'R4/positive/current_cancelled_event_reference_row', 'R4', 'positive', projector_case(
        dict(S0, knobs=dict(event_payload=LONG_ACTOR(5000))), [publish, cutover, current]))
    cur = lambda w, p: p.read_current_cancelled()  # noqa: E731
    C = W.World
    rows = [
        ('readback_control_prepared_version', knob(S0, readback_edit=lambda v: v['d06_readback'].update(
            control=copy.deepcopy(C.CURRENT.d06_prepared['control'].wrapper['record']))), 'current/readback_d06'),
        ('readback_native_prior_body', knob(S0, readback_edit=lambda v: v['d06_readback']['native_after'].update(
            body=copy.deepcopy(C.CURRENT.body1.wrapper), body_selection=C.CURRENT.body1.selector())), 'current/readback_native'),
        ('readback_event_substituted', knob(S0, readback_edit=lambda v: v['d06_readback']['original_event']['event'].update(
            correlation_id='TEST_ONLY:substituted')), 'current/readback_event'),
        ('readback_lineage_prior_head', knob(S0, readback_edit=lambda v: v['d06_readback']['original_d01_lineage'].update(
            head=copy.deepcopy(C.CURRENT.start_cause['original_d01_head'].wrapper))), 'current/readback_lineage'),
        ('readback_safe_stop_other_genuine', knob(S0, readback_edit=lambda v: v['d06_readback']['safe_stop'].update(
            inventory_cut=C.CURRENT.sched['coverage'].selector())), 'current/readback_safe_stop'),
        ('current_start_commit_substituted', knob(S0, current_start_edit=lambda v: v['value']['commit']['record'].update(
            transaction_id='TEST_ONLY:substituted')), 'current/start'),
        ('current_read_second_boundary', knob(S0, current_read_edit=lambda v: v['current_start']['value']['commit']['record'].update(
            transaction_id='TEST_ONLY:other-boundary')), 'current/one_boundary'),
        ('current_goal_stop_receipt_substituted', knob(S0, current_goal_edit=lambda v: v['current_stop']['original_stop_receipt'][
            'record'].update(original_host_transaction_ref='TEST_ONLY:substituted')), 'current/goal_stop_argument'),
    ]
    for name, cfg, expected in rows:
        run_case(out, 'R4/' + name, 'R4', 'negative', projector_case(cfg, [publish, cutover, cur]), expected)

    def drift_after_current(w, p):
        p.hooks['after_current'] = lambda w_, p_: __import__('pm_goal_dg_r_oracles').advance_current_goal_stop(w_)
        return p.read_current_cancelled()
    def withdraw_after_historical(w, p):
        p.hooks['after_historical'] = lambda w_, p_: setattr(p_, 'reader_withdrawn', True)
        return p.read_current_cancelled()
    def stop_bytes_restored_after_current(w,p):
        host,scope=w.goal_bridge.world.host_stop,w.goal_bridge.route.scope
        original=copy.deepcopy(host.current(scope)['value'])
        def restore(world,projector):
            advance_current_goal_stop(world)
            cell=host.current(scope)
            world.storage.transact([dict(table=host.FAMILY,key=host.key(scope),expected=cell['version'],value=original)])
        p.hooks['after_current']=restore
        return p.read_current_cancelled()
    def native_advance_after_historical(w, p):
        def adv(w_, p_):
            body = w_.native.prepare_body(w_.body2, 'cancelled')
            control = w_.native.prepare_control(w_.control2, body)
            w_.native.commit(body, control, w_.body2, w_.control2)
        p.hooks['after_historical'] = adv
        return p.read_current_cancelled()
    for name, step, expected in [('goal_stop_after_current_helper', drift_after_current, 'current/goal_stop'),
                                 ('goal_stop_original_bytes_restored_after_advance',stop_bytes_restored_after_current,'current/goal_stop'),
                                 ('reader_withdrawn_before_current_release', withdraw_after_historical, 'reader/withdrawn'),
                                 ('native_advance_before_current_release', native_advance_after_historical, 'current/native_body')]:
        run_case(out, 'R4/' + name, 'R4', 'negative', projector_case(S0, [publish, cutover, step]), expected)
    return out


def r4_v7_cases():
    """R4 native-v7: retained, inspection and current methods under their own roots (session 3)."""
    V7, V7N = {'start': 'started', 'edition': 'native_v7'}, {'start': 'no_start', 'edition': 'native_v7'}
    knob = lambda base, **k: dict(base, knobs=k)  # noqa: E731
    out = []

    def qualified():
        r = W.RootsV7.get()
        counts, unresolved = r.qualify()
        W.guard('v7/qualified', unresolved == [] and counts['edge_sites'] == 22)
        return dict(counts, package_commit=W.W5_PACKAGE_COMMIT)
    run_case(out, 'R4/positive/v7_bank_eager_qualification', 'R4', 'positive', qualified)

    def v7_case(cfg, read):
        def run():
            from pm_goal_dg_int_cancel import CancelWorld,Consumer,Projector
            w = CancelWorld(cfg, base=BASE)
            try:
                w.build()
                if read in ('retained', 'inspect'):
                    c = Consumer(w)
                    out_ = c.inspect_original(request_of(w), R.Presentation(w)) if read == 'inspect' else \
                        c.read_retained_native(request_of(w), R.Presentation(w))
                    return dict(edition=w.edition, d01_version=(out_.get('native_cancellation') or out_)['original_d01_update']['schema_version'])
                p = Projector(w)
                must_publish(w, p)
                p.cutover()
                before = w.recorder.snapshot()
                r = p.read_historical() if read == 'historical' else p.read_current_cancelled()
                after = w.recorder.snapshot()
                W.guard('passive/no_effect', [k for k in after if after[k]['sha256'] != before[k]['sha256']] == [])
                return dict(kind=r['kind'], row=r['projection']['schema_id'])
            finally:
                w.close()
        return run
    for name, cfg, read in [('v7_retained_native', V7, 'retained'), ('v7_inspect_original', V7, 'inspect'),
                            ('v7_initialized_no_start_inspect', V7N, 'inspect'), ('v7_historical', V7, 'historical'),
                            ('v7_current_cancelled', V7, 'current')]:
        run_case(out, 'R4/positive/' + name, 'R4', 'positive', v7_case(cfg, read))

    def cast(world_edition, consumer_roots):
        def run():
            w = W.CancelWorld({'start': 'started', 'edition': world_edition}, base=BASE)
            try:
                w.build()
                c = R.Consumer(w)
                c.roots = consumer_roots()
                return c.read_retained_native(request_of(w), R.Presentation(w))
            finally:
                w.close()
        return run
    run_case(out, 'R4/v7_tuple_cast_to_original_profile', 'R4', 'negative', cast('native_v7', W.Roots.get),
             'tuple/native/schema/original_d01_head/schema_id')
    run_case(out, 'R4/original_tuple_cast_to_native_v7', 'R4', 'negative', cast('original_profile', W.RootsV7.get),
             'tuple/native/schema/original_d01_head/schema_id')
    run_case(out, 'R4/v7_projector_on_original_profile_world', 'R4', 'negative', projector_case(
        {'start': 'started'}, [lambda w, p: P.ProjectorV7(w)]), 'edition/native_v7_world')

    def without_edge():
        r = W.RootsV7.get()
        routes = {k: v for k, v in r.routes.items() if not (k[0] == 'cancelled_native_consumer' and v[0] == 'retained_original_d05')}
        counts, unresolved = r.qualify(routes=routes)
        W.guard('v7/qualified', unresolved == [])
    def wrong_realm():
        r = W.RootsV7.get()
        routes = {k: (('cancelled_native_consumer' if v[0] == 'retained_original_d05' else v[0]), v[1]) for k, v in r.routes.items()}
        counts, unresolved = r.qualify(routes=routes)
        W.guard('v7/qualified', unresolved == [])
    def wrong_location():
        r = W.RootsV7.get()
        routes = {(k[0], k[1], k[2] + 'x', k[3]) if v[0] == 'retained_original_d05' else k: v for k, v in r.routes.items()}
        counts, unresolved = r.qualify(routes=routes)
        W.guard('v7/qualified', unresolved == [])
    def substituted_blob():
        W.git_blob(W.W5_PACKAGE_COMMIT, 'Plans/goal_run_certified_consumer_contracts/source-package.v2/imports.json',
                   W.W5_PACKAGE['Plans/goal_run_certified_consumer_contracts/source-package.v2/selection.json'])
    for name, fn, expected in [('v7_without_w5_scoped_edge', without_edge, 'v7/qualified'),
                               ('v7_edge_routed_to_wrong_realm', wrong_realm, 'v7/qualified'),
                               ('v7_edge_at_unlisted_location', wrong_location, 'v7/qualified'),
                               ('v7_package_blob_substituted', substituted_blob,
                                'v7/blob_at_commit/Plans/goal_run_certified_consumer_contracts/source-package.v2/imports.json')]:
        run_case(out, 'R4/' + name, 'R4', 'negative', fn, expected)

    rows = [
        ('v7_inline_row_oversize', knob(V7, event_payload=LONG_ACTOR(5000)), [lambda w, p: p.project()],
         'representation/inline_oversize'),
        ('v7_current_readback_prior_body', knob(V7, readback_edit=lambda v: v['d06_readback']['native_after'].update(
            body=copy.deepcopy(W.World.CURRENT.body1.wrapper), body_selection=W.World.CURRENT.body1.selector())),
         [publish, cutover, lambda w,p:p.read_current_cancelled()],
         'current/readback_native'),
    ]
    for name, cfg, steps, expected in rows:
        run_case(out, 'R4/' + name, 'R4', 'negative', projector_case(cfg, steps), expected)
    return out


GROUPS = dict(R1=r1_cases, R2=lambda: r2_cases() + r2_join_cases() + r2_preserve_cases() + r2_guard_cases(), R3=lambda: r3_cases() + r3_effect_cases(), R4=lambda: r4_cases() + r4_current_cases() + r4_v7_cases(),
              R5=r5_cases, R6=lambda: r6_cases() + r56_lower_cases())


def main():
    global CASE_FILTER
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--groups', default=','.join(GROUPS))
    parser.add_argument('--output')
    parser.add_argument('--filter')
    args = parser.parse_args()
    CASE_FILTER=args.filter
    BASE.mkdir(parents=True, exist_ok=True)
    out = []
    for group in args.groups.split(','):
        out.extend(GROUPS[group]())
    failures = [c for c in out if c['status'] != 'pass']
    if not out:raise ValueError('No matching oracle cases')
    summary = {}
    for c in out:
        row = summary.setdefault(c['group'], dict(positives=0, negatives=0, failures=0))
        row['positives' if c['kind'] == 'positive' else 'negatives'] += 1
        row['failures'] += c['status'] != 'pass'
    guards = sorted(W.GUARDS)
    flips = {}
    for c in out:
        if c['kind'] == 'negative' and c['status'] == 'pass':
            flips.setdefault(c['got'], []).append(c['id'])
    result = dict(qualification=QUALIFICATION, native=NR.NATIVE_LINE, family='goal_run.cancelled', summary=summary,
                  status='pass' if not failures else 'fail', failures=failures, cases=out,
                  guards={g: flips.get(g, []) for g in guards},
                  refusal_codes_with_negatives={k: v for k, v in sorted(flips.items())})
    if args.output:
        Path(args.output).write_text(json.dumps(result, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps(dict(status=result['status'], summary=summary,
                          failures=[(f['id'], f.get('expected'), f.get('got')) for f in failures]), indent=1))
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
