#!/usr/bin/env python3
"""DG-INT cross-family oracle runner (stream E DG integration, TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Groups:

* ``INT``: the cross-family world itself. DG-S's S1 owner issues the Start and
  DG-R's R2 owners the positive cancellation in one Storage
  (``pm_goal_dg_int_world``); DG-R's passive consumer and combined projector
  then run unchanged over the S1-issued Start. Negatives: a substituted S1
  cell at adoption, a substituted adopted cell at read time, an S1 Start cell
  withdrawn.
* ``P7L``: the certified consumer's legacy original-profile current branches
  (``pm_goal_dg_int_p7``): ``read_current_started`` and
  ``read_current_cancelled``, plus lawful retained history, with one-defect
  negatives at every boundary the methods name.

Every negative changes one fact through its genuine owner (or substitutes one
stored value) and must refuse with exactly its expected code; an accepted
negative fails the run. Exit 0 only when every case passes.
"""
from __future__ import annotations

import argparse
import copy
import json
import os
import sys
import time
import traceback
from pathlib import Path

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_dg_s_world as SW
import pm_goal_dg_r_world as RW
import pm_goal_dg_r_readers as RR
import pm_goal_dg_r_projector as RP
import pm_goal_dg_cf2_consumer as C2
import pm_goal_dg_int_world as IW
import pm_goal_dg_int_p7 as P7
import pm_goal_dg_int_reducer as IR
import pm_goal_dg_cf3_world as W3

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
BASE = Path(os.environ.get('PM_DG_INT_SCRATCH', '/home/sittingmongoose/pm-scratch/dg-int/tmp'))
from pm_goal_own_c3_w5_projection_oracles import Refused as W5Refused  # noqa: E402

REFUSALS = (RW.Refusal, A.AdapterRefusal, S.StorageRefusal, NR.NumruleRefusal, SW.DGRefusal, W5Refused, W3.LaneRefusal)


def code_of(error):
    if isinstance(error, C2.Unavailable):
        return 'unavailable:%s:%s' % (error.reason, error.code)
    if isinstance(error, W5Refused):
        return 'w5:' + str(error.args[0] if error.args else error)
    if isinstance(error, W3.LaneRefusal):
        return error.code
    return getattr(error, 'code', None) or RW.code_of(error)


class Run:
    def __init__(self):
        self.rows = []

    def case(self, group, case_id, kind, fn, expected=None):
        started = time.time()
        row = dict(group=group, id=case_id, kind=kind, expected=expected)
        try:
            detail = fn()
            if kind == 'negative':
                row.update(status='fail', got='ACCEPTED')
            else:
                row.update(status='pass', detail=detail if isinstance(detail, (str, int, list, dict)) else None)
        except REFUSALS as error:
            got = code_of(error)
            row.update(got=got, status='pass' if kind == 'negative' and got == expected else 'fail')
        except Exception as error:  # noqa: BLE001
            row.update(status='fail', got='%s: %s' % (type(error).__name__, error), trace=traceback.format_exc(limit=5))
        row['seconds'] = round(time.time() - started, 2)
        self.rows.append(row)
        print('%-4s %-9s %-58s %s %s' % (group, kind, case_id, row['status'], row.get('got', '')), flush=True)
        return row


def request_of(w):
    return dict(scope={k: w.scope[k] for k in ('storage_instance_id', 'project_id', 'goal_id', 'goal_run_id')},
                storage_instance_id=w.sid)


def passive(w, fn):
    before = w.storage.snapshot()['cell_generation']
    out = fn()
    RW.guard('passive/no_effect', w.storage.snapshot()['cell_generation'] == before)
    return out


def cancel_after(w):
    """Run the R2 cancellation on a started-only S1 world (same owners as S1CancelWorld.build)."""
    w.goal = RW.PhysOwner(w, 'goal_cancel')
    w.scheduler = RW.PhysOwner(w, 'scheduler')
    w.d05 = RW.PhysOwner(w, 'd05_safe_stop')
    w.filesafe = RW.PhysOwner(w, 'filesafe')
    w.process = RW.PhysOwner(w, 'process')
    w.d06 = RW.PhysOwner(w, 'd06_cancel')
    w._goal_cancel()
    w._scheduler_stop()
    w._effects()
    w._safe_stop()
    w._d06()
    return w


def with_world(build, body):
    def run():
        w = build()
        try:
            return body(w)
        finally:
            w.close()
    return run


def substitute_cell(w, family, key, edit):
    cell = w.storage.cell(family, key)
    value = copy.deepcopy(cell['value'])
    edit(value)
    w.storage.transact([dict(table=family, key=key, expected=cell['version'], value=value)])


# ------------------------------------------------------------------ INT

def int_cases(run):
    g = 'INT'
    started = lambda: P7.started_world({}, base=BASE)  # noqa: E731
    cancelled = lambda: P7.cancelled_world({}, base=BASE)  # noqa: E731

    def full_path(w):
        c = getattr(w,'consumer_class',RR.Consumer)(w)
        pres, req = RR.Presentation(w), request_of(w)
        passive(w, lambda: c.inspect_original(req, pres))
        passive(w, lambda: c.read_retained_native(req, pres))
        p = getattr(w,'projector_class',RP.Projector)(w)
        published = p.project()
        RW.guard('int/published', 'reason' not in published)
        p.cutover()
        passive(w, p.read_historical)
        passive(w, p.read_current_cancelled)
        start = w.start_cause
        return dict(start_owner=w.start_world.start.owner_id, adopted=len(w.issued),
                    start_event=w.started_event['event_id'], cancel_event=w.custody['event_id'],
                    start_custody_tx=start['commit'].tx_id)
    run.case(g, 'INT/s1_start_r2_cancel_one_storage_r2_consumer_and_projector', 'positive', with_world(cancelled, full_path))

    def s1_native_model(w):
        cur = w.start_world.owners['native'].current()
        RW.guard('int/native_pointer', cur['pointer']['value']['body_key'] == w.body2.key and
                 cur['body']['record']['status'] == 'cancelled')
        fam = IW.ST.d01_families(w.start_world.edition)
        pointer = w.storage.cell(fam['pointer'], w.d01.s1.pointer_key())
        RW.guard('int/d01_pointer', pointer['value']['record']['workflow_head']['physical_value_sha256'] ==
                 w.cancellation['original_d01_head'].sha256)
        RW.guard('int/started_body_immutable', w.storage.cell(w.body1.family, w.body1.key)['value'] == w.body1.wrapper)
        return dict(native_revision=cur['body']['record']['revision'], d01_revision=pointer['value']['record']['revision'])
    run.case(g, 'INT/r2_native_cas_and_d01_head_follow_s1_model', 'positive', with_world(cancelled, s1_native_model))

    def adopt_substituted():
        w = IW.S1CancelWorld({}, base=BASE)
        try:
            sw = w.start_world
            w.native = IW.S1NativeOwner(w, sw.owners['native'])
            w.d01 = IW.S1D01Owner(w, sw.owners['d01'], sw.edition)
            w.start = IW.AdoptedCustody(w, 'workflow_start', sw.start.owner_id)
            w._birth()
            orig = IW.SR.original_started

            def substituted(world, where='x'):
                out = orig(world, where=where)
                out['native_start']['origin']['record']['issued_at_utc'] = '2026-11-12T00:00:00.000Z'
                return out
            IW.SR.original_started = substituted
            try:
                w._start()
            finally:
                IW.SR.original_started = orig
        finally:
            w.close()
    run.case(g, 'INT/adoption_value_differs_from_storage_cell', 'negative', adopt_substituted, 'adopt/cell_mismatch')

    def cell_substituted_at_rest(w):
        commit = w.start_cause['commit']
        substitute_cell(w, commit.family, commit.key, lambda v: v['record'].update(dispatch_released=True))
        getattr(w,'consumer_class',RR.Consumer)(w).inspect_original(request_of(w), RR.Presentation(w))
    run.case(g, 'INT/s1_commit_substituted_at_rest_after_adoption', 'negative', with_world(cancelled, cell_substituted_at_rest),
             'select/cell_substituted')

    def start_withdrawn(w):
        origin = w.start_cause['origin']
        w.storage.transact([dict(table=origin.family, key=origin.key, expected=w.storage.cell(origin.family, origin.key)[
            'version'], delete=True)])
        getattr(w,'consumer_class',RR.Consumer)(w).read_retained_native(request_of(w), RR.Presentation(w))
    run.case(g, 'INT/s1_start_origin_withdrawn', 'negative', with_world(cancelled, start_withdrawn), 'select/cell_substituted')


# ------------------------------------------------------------------ P7L

def p7_cases(run):
    g = 'P7L'
    started = lambda: P7.started_world({}, base=BASE)  # noqa: E731
    cancelled = lambda: P7.cancelled_world({}, base=BASE)  # noqa: E731

    def positive(branch):
        def body(w):
            c = P7.LegacyConsumer(w, branch)
            pub = c.publish()
            out = c.read_current()
            hist = passive(w, c.read_historical)
            return dict(row=pub['row']['physical_key'], kind=out['kind'], historical=hist['kind'],
                        arguments=sorted(c.last_arguments))
        return body
    run.case(g, 'P7L/started_original_profile_current', 'positive', with_world(started, positive('started')))
    run.case(g, 'P7L/cancelled_original_profile_current', 'positive', with_world(cancelled, positive('cancelled')))

    def history_survives_native_advance(w):
        c = P7.LegacyConsumer(w, 'started')
        c.publish()
        w.start_world.owners['native'].advance('running')
        hist = passive(w, c.read_historical)
        try:
            c.read_current()
        except C2.Unavailable as error:
            RW.guard('p7/current_refused_stale', error.reason == 'STALE_NATIVE')
            return dict(historical=hist['kind'], current=error.reason)
        raise RW.Refusal('p7/current_accepted_after_native_advance')
    run.case(g, 'P7L/retained_history_survives_native_advance_current_refuses', 'positive',
             with_world(started, history_survives_native_advance))

    def neg(build, branch, act, before_publish=False, hooks=None):
        def body(w):
            c = P7.LegacyConsumer(w, branch)
            if before_publish:
                act(w, c)
            c.publish()
            if not before_publish and act is not None:
                act(w, c)
            return c.read_current(hooks=hooks)
        return with_world(build, body)

    # started branch
    run.case(g, 'P7L/started_after_cancellation', 'negative',
             neg(started, 'started', lambda w, c: cancel_after(w)),
             'unavailable:STALE_NATIVE:legacy_current_started/native_advanced')
    run.case(g, 'P7L/started_native_advanced_after_helpers', 'negative',
             neg(started, 'started', None, hooks=dict(after_helpers=lambda w: w.start_world.owners['native'].advance('running'))),
             'unavailable:STALE_NATIVE:legacy_current_started_final/native_advanced')
    run.case(g, 'P7L/started_goal_stop_after_helpers', 'negative',
             neg(started, 'started', None, hooks=dict(after_helpers=lambda w: w.start_world.owners['goal'].latch_stop())),
             'unavailable:PENDING_OR_STOPPED:legacy_current_started_final/goal_stopped')
    run.case(g, 'P7L/started_goal_stop_before_read', 'negative',
             neg(started, 'started', lambda w, c: w.start_world.owners['goal'].latch_stop()),
             'unavailable:PENDING_OR_STOPPED:legacy_current_started/goal_stopped')
    run.case(g, 'P7L/started_disclosure_revoked', 'negative',
             neg(started, 'started', lambda w, c: w.permissions.update(read=False)),
             'unavailable:DISCLOSURE_DENIED:legacy_current_started/disclosure_denied')
    run.case(g, 'P7L/started_disclosure_revoked_after_helpers', 'negative',
             neg(started, 'started', None, hooks=dict(after_helpers=lambda w: w.permissions.update(read=False))),
             'unavailable:DISCLOSURE_DENIED:legacy_current_started_final/disclosure_denied')

    def later_event(w, c=None):
        A.AppendOwner(w.registry, w.storage).append_original('TEST_ONLY:append:unrelated', dict(kind='unrelated'),
                                                             [unrelated_event(w)], durability_class='barrier')
    run.case(g, 'P7L/started_uncovered_later_event', 'negative', neg(started, 'started', later_event),
             'unavailable:STALE_GENERIC_TOKEN:legacy_current_started/stale_generic_token')
    run.case(g, 'P7L/started_later_event_after_helpers', 'negative',
             neg(started, 'started', None, hooks=dict(after_helpers=later_event)),
             'unavailable:STALE_GENERIC_TOKEN:legacy_current_started_final/stale_generic_token')

    def row_substituted(w, c):
        logical = c.published['logical']
        gen = logical['generations'][logical['current_generation_id']]
        substitute_cell(w, gen['dataset_name'], gen['processed']['row_key'],
                        lambda v: v['content']['record'].update(action_authority=False) or
                        v['event_identity'].update(idempotency_key=v['event_identity']['idempotency_key'] + 'x'))
    run.case(g, 'P7L/started_row_substituted_at_rest', 'negative', neg(started, 'started', row_substituted),
             'unavailable:INVALID_CHECKPOINT:historical/row_binding')

    def start_commit_withdrawn(w, c):
        cell = w.storage.cell('workflow_start_commit', w.start_cause['commit'].key)
        w.storage.transact([dict(table='workflow_start_commit', key=w.start_cause['commit'].key,
                                 expected=cell['version'], delete=True)])
    run.case(g, 'P7L/started_original_commit_withdrawn', 'negative', neg(started, 'started', start_commit_withdrawn),
             'unavailable:MISSING_ORIGINAL_VALUE:legacy_current_started/original/commit/selector_unresolved')

    # cancelled branch
    run.case(g, 'P7L/cancelled_disclosure_revoked', 'negative',
             neg(cancelled, 'cancelled', lambda w, c: w.permissions.update(read=False)),
             'unavailable:DISCLOSURE_DENIED:legacy_current_cancelled/disclosure_denied')
    run.case(g, 'P7L/cancelled_uncovered_later_event', 'negative', neg(cancelled, 'cancelled', later_event),
             'unavailable:STALE_GENERIC_TOKEN:legacy_current_cancelled/stale_generic_token')
    run.case(g, 'P7L/cancelled_later_event_after_helpers', 'negative',
             neg(cancelled, 'cancelled', None, hooks=dict(after_helpers=later_event)),
             'unavailable:STALE_GENERIC_TOKEN:legacy_current_cancelled_final/stale_generic_token')

    def d06_control_substituted(w, c):
        ctl = w.cancellation['committed_control']
        substitute_cell(w, ctl.family, ctl.key, lambda v: v['record'].update(revision=v['record']['revision'] + 1))
    run.case(g, 'P7L/cancelled_d06_control_substituted_at_rest', 'negative',
             neg(cancelled, 'cancelled', d06_control_substituted), 'unavailable:MISSING_ORIGINAL_VALUE:select/cell_substituted')

    def newer_goal_stop(w):
        w.goal_bridge.world.host_stop.manual(w.goal_bridge.route.scope,'stop')
    run.case(g, 'P7L/cancelled_newer_goal_stop_before_read', 'negative',
             neg(cancelled, 'cancelled', lambda w, c: newer_goal_stop(w)),
             'unavailable:SOURCE_CHANGED:legacy_current_cancelled/goal_stop')
    run.case(g, 'P7L/cancelled_newer_goal_stop_after_helpers', 'negative',
             neg(cancelled, 'cancelled', None, hooks=dict(after_helpers=newer_goal_stop)),
             'unavailable:SOURCE_CHANGED:legacy_current_cancelled_final/goal_stop')

    def native_moved(w, c=None):
        w.start_world.owners['native'].advance('cancelled')
    run.case(g, 'P7L/cancelled_native_truth_moved_before_read', 'negative',
             neg(cancelled, 'cancelled', lambda w, c: native_moved(w)),
             'unavailable:STALE_NATIVE:legacy_current_cancelled/native_current')
    run.case(g, 'P7L/cancelled_native_truth_moved_after_helpers', 'negative',
             neg(cancelled, 'cancelled', None, hooks=dict(after_helpers=native_moved)),
             'unavailable:STALE_NATIVE:legacy_current_cancelled_final/native_current')

    def cancel_result_withdrawn(w, c):
        res = w.cancellation['result']
        w.storage.transact([dict(table=res.family, key=res.key, expected=w.storage.cell(res.family, res.key)['version'],
                                 delete=True)])
    run.case(g, 'P7L/cancelled_original_result_withdrawn', 'negative', neg(cancelled, 'cancelled', cancel_result_withdrawn),
             'unavailable:MISSING_ORIGINAL_VALUE:select/cell_substituted')

    def cancelled_row_for_started_branch(w):
        c = P7.LegacyConsumer(w, 'cancelled')
        c.publish()
        return P7.LegacyConsumer(w, 'started').read_historical()
    run.case(g, 'P7L/cancelled_row_read_as_started_original', 'negative', with_world(cancelled, cancelled_row_for_started_branch),
             'w5:join/complete_original_record')


# ------------------------------------------------------------------ CF10P4

def p4_cases(run):
    g = 'P4'
    old = lambda: P7.started_world({}, base=BASE)  # noqa: E731
    v7 = lambda: P7.started_world({'edition': 'native_v7'}, base=BASE)  # noqa: E731

    def admitted(w):
        c = IR.IntConsumer(w)
        scope = IR.run_scope(w)
        gid = c.rebuild(scope)
        out = passive(w, lambda: c.reader.read(scope))
        RW.guard('p4/started_record', out['record']['status_at_original_event'] == 'running' and
                 out['record']['original_event']['event_id'] == w.started_event['event_id'])
        cp = c.checkpoint(scope)
        return dict(generation=gid[:20], rows=cp['generations'][gid]['processed']['verified_row_count'],
                    profile=IR.run_profile(w.storage.snapshot()['cells'], scope, w.sid))
    run.case(g, 'P4/old_profile_start_admitted_from_whole_original', 'positive', with_world(old, admitted))
    run.case(g, 'P4/native_v7_start_admitted_from_whole_original', 'positive', with_world(v7, admitted))

    def off_run_noop(w):
        A.AppendOwner(w.registry, w.storage).append_original('TEST_ONLY:append:note', dict(kind='note'),
                                                             [note_event(w)], durability_class='barrier')
        return admitted(w)
    run.case(g, 'P4/off_run_registered_row_validated_then_noop', 'positive', with_world(old, off_run_noop))

    def v7_r2(w):
        IW_ = IW
        c = getattr(w,'consumer_class',RR.Consumer)(w)
        pres, req = RR.Presentation(w), request_of(w)
        passive(w, lambda: c.inspect_original(req, pres))
        p = getattr(w,'projector_class',RP.ProjectorV7)(w)
        p.project()
        p.cutover()
        passive(w, p.read_historical)
        passive(w, p.read_current_cancelled)
        return dict(edition=w.edition, adopted=len(w.issued))
    run.case(g, 'P4/native_v7_s2_start_r2_cancel_one_storage_r2_v7_consumer', 'positive',
             with_world(lambda: P7.cancelled_world({'edition': 'native_v7'}, base=BASE), v7_r2))

    def edited(build, edit):
        def body(w):
            w.legacy_edits = edit
            c = IR.IntConsumer(w)
            return c.rebuild(IR.run_scope(w))
        return with_world(build, body)

    def retag(profile):
        def edit(v):
            v['originals'][0]['profile'] = profile
            if profile == IR.V7:
                v['native_v7_starts'] = [copy.deepcopy(s['native_start']) for s in v['originals'][0]['started']]
            else:
                v['native_v7_starts'] = []
            return v
        return edit
    run.case(g, 'P4/old_birth_presented_to_v7_branch', 'negative', edited(old, retag(IR.V7)),
             'w5:schema/LegacyProjectionEvidence')
    run.case(g, 'P4/v7_birth_presented_to_old_branch', 'negative', edited(v7, retag(IR.OLD)),
             'w5:schema/LegacyProjectionEvidence')

    def header_cast(v):
        commit = v['originals'][0]['started'][0]['native_start']['commit']
        commit['schema_id'] = commit['schema_id'].replace('.v1', '.v6')
        return v
    run.case(g, 'P4/started_commit_header_cast', 'negative', edited(old, header_cast), 'w5:schema/LegacyProjectionEvidence')

    def no_companion(v):
        v['native_v7_starts'] = []
        return v
    run.case(g, 'P4/native_v7_start_missing_companion', 'negative', edited(v7, no_companion),
             'advance/halt/legacy/v7_companion_missing')

    def no_start(v):
        v['originals'][0]['started'] = []
        return v
    run.case(g, 'P4/started_row_without_whole_original', 'negative', edited(old, no_start),
             'advance/halt/legacy/start_without_original')

    def twice(v):
        v['originals'][0]['started'] = v['originals'][0]['started'] * 2
        return v
    run.case(g, 'P4/duplicate_whole_original_for_one_row', 'negative', edited(old, twice),
             'advance/halt/legacy/start_without_original')

    def unstored(v):
        v['originals'][0]['started'][0]['native_start']['origin']['record']['issued_at_utc'] = '2026-11-12T00:00:00.000Z'
        return v
    run.case(g, 'P4/started_origin_not_the_stored_original', 'negative', edited(old, unstored),
             'advance/halt/legacy/start_unstored/origin')

    def event_changed(v):
        ev = v['originals'][0]['started'][0]['original_append']['event']
        ev['occurred_at_utc'] = '2026-11-12T00:00:00Z'
        return v
    run.case(g, 'P4/started_original_event_differs_from_frame', 'negative', edited(old, event_changed),
             'advance/halt/legacy/start_event')

    def v7_unstored(v):
        v['originals'][0]['started'][0]['native_start']['candidate']['record']['transaction_id'] += 'x'
        v['native_v7_starts'][0]['candidate']['record']['transaction_id'] += 'x'
        return v
    run.case(g, 'P4/native_v7_candidate_not_the_stored_original', 'negative', edited(v7, v7_unstored),
             'advance/halt/legacy/start_unstored/candidate')

    def unregistered_goal_event(w):
        c = IR.IntConsumer(w)
        return c.rebuild(IR.run_scope(w))
    run.case(g, 'P4/r2_goal_cancelled_v1_event_is_unregistered', 'negative',
             with_world(lambda: RW.CancelWorld({}, base=BASE).build(), unregistered_goal_event),
             'advance/halt/reducer/unregistered_record')


def note_event(w):
    ev = unrelated_event(w)
    ev.update(event_id='TEST_ONLY:note:' + w.sid[:8], event_type='run.started', payload_schema_id='https://puppetmaster.local/schemas/event_payloads/run_started/2.0.0',
              idempotency_key='TEST_ONLY:note:' + w.sid[:8], project_id=w.scope['project_id'])
    return ev


def unrelated_event(w):
    return dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
                event_id='TEST_ONLY:unrelated:' + w.sid[:8], event_type='run.started',
                project_id='TEST_ONLY-project-unrelated', thread_id=None, run_id=None, node_id=None, attempt_id=None,
                actor_ref='TEST_ONLY:actor:unrelated', requested_account_ref=None, effective_account_ref=None,
                occurred_at_utc=w.clock.now(), producer_sequence_id=None, correlation_id='TEST_ONLY:correlation:unrelated',
                causation_event_id=None, parent_event_id=None, idempotency_key='TEST_ONLY:unrelated:' + w.sid[:8],
                payload_schema_id='https://puppetmaster.local/schemas/event_payloads/run_started/2.0.0', payload=dict(qualification=QUALIFICATION), payload_ref=None,
                redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
                migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                               compatibility_event_type=None))


GROUPS = dict(INT=int_cases, P7L=p7_cases, P4=p4_cases)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--output')
    ap.add_argument('--groups', default=','.join(GROUPS))
    args = ap.parse_args()
    BASE.mkdir(parents=True, exist_ok=True)
    run = Run()
    started = time.time()
    for name in args.groups.split(','):
        GROUPS[name](run)
    rows = run.rows
    counts = {}
    for r in rows:
        c = counts.setdefault(r['group'], dict(positive=0, negative=0, failures=0))
        c[r['kind']] += 1
        c['failures'] += r['status'] != 'pass'
    failures = [r for r in rows if r['status'] != 'pass']
    out = dict(qualification=QUALIFICATION, native=NATIVE_LINE, status='pass' if not failures else 'fail',
               positives=sum(r['kind'] == 'positive' for r in rows), negatives=sum(r['kind'] == 'negative' for r in rows),
               failures=len(failures), counts=counts, seconds=round(time.time() - started, 1), rows=rows)
    if args.output:
        Path(args.output).write_text(json.dumps(out, indent=1, sort_keys=True, ensure_ascii=False) + '\n')
    print(json.dumps({k: v for k, v in out.items() if k != 'rows'}, sort_keys=True))
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
