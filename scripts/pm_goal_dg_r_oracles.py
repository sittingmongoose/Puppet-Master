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
    ]
    for name, cfg, expected in negatives:
        run_case(out, 'R3/' + name, 'R3', 'negative', world_case(cfg), expected)
    for name, post, expected in [
            ('process_birth_omitted_from_tuple', drop_process_birth, 'effects/process_partition'),
            ('filesafe_invocation_omitted_from_tuple', drop_filesafe, 'effects/settlement_count'),
            ('filesafe_journal_withdrawn', withdraw_journal, 'original/withdrawn')]:
        run_case(out, 'R3/' + name, 'R3', 'negative', world_case(M, post=post), expected)
    return out


GROUPS = dict(R1=r1_cases, R2=r2_cases, R3=r3_cases)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--groups', default=','.join(GROUPS))
    parser.add_argument('--output')
    args = parser.parse_args()
    BASE.mkdir(parents=True, exist_ok=True)
    out = []
    for group in args.groups.split(','):
        out.extend(GROUPS[group]())
    failures = [c for c in out if c['status'] != 'pass']
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
