#!/usr/bin/env python3
"""DG-CA3 C4 corpus: late assignment against Storage custody and SP-313 v2 private inspection (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Inspection failures are typed ``UnavailableRead`` results; a negative raises the inspector's
exact recorded invariant (``Inspector.last_code``) so ``Suite.negative`` checks it.
"""
from __future__ import annotations

import copy

import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_dg_ca_oracles as DGO
import pm_goal_dg_ca_assignment as AS
import pm_goal_dg_ca3_route as R
import pm_goal_dg_ca3_index as IX
import pm_goal_dg_ca3_inspection as I
import pm_goal_dg_ca3_cases as C3
from pm_goal_dg_ca_owners import Refusal, row_sha, same, uid

G = 'C4I'


def inspected(suite, before=None, **kw):
    w, r = (C3.until(suite, before, **kw) if before else C3.wf(suite, **kw))
    if before is None:
        r.run()
    w.inspector = I.Inspector(w)
    w.inspector.grant(r.scope)
    return w, r


def strict(w, result):
    """A typed UnavailableRead is reported by its exact invariant for the corpus."""
    if result['kind'] == 'unavailable':
        raise Refusal(w.inspector.last_code)
    return result


def c1_world(suite):
    suite.n += 1
    w = AS.assigned_world(suite.work / ('c4i-%05d' % suite.n))
    w.index = IX.EventIndexOwner(w)
    w.index.publish()
    r = AS.AssignedCancel(w)
    r.dispatch(r.user_request())
    w.inspector = I.Inspector(w)
    w.inspector.grant(r.scope)
    return w, r


def unrelated_append(w):
    """A genuine later unrelated Event: the index owner publishes a newer frontier."""
    AS.prior_history(w)
    w.index.publish()


# ------------------------------------------------------------------ positives

def positive_workflow(suite):
    w, r = inspected(suite)
    ins = w.inspector
    gen, events, frontier = w.storage.cell_generation, len(w.storage.events), w.index.frontier['publication_revision']
    custody = ins.read_original_inspection_custody(I.custody_request(r))
    A.require('C4I/positive/custody', custody['kind'] == 'original_inspection_custody'
              and custody['custody']['current_progress']['current_selected_epoch']['record']['phase'] == 'control_published')
    obs = ins.inspect_current_event_v2(r, I.request_for(w, r))
    event = w.storage.read_event(r.progress['publication']['event_id'])
    A.require('C4I/positive/observation', obs['kind'] == 'original_cancellation_event' and obs['event_id'] == event['event_id']
              and obs['sequence_id'] == event['sequence_id'] == r.late_reservation['reserved_sequence_id'] and obs['payload_version'] == '3.0.0'
              and obs['revision'] == event['payload']['revision'] and obs['occurred_at_utc'] == event['occurred_at_utc'])
    A.require('C4I/positive/narrow', set(obs) == {'kind', 'event_id', 'sequence_id', 'payload_version', 'project_id', 'thread_id', 'goal_id',
                                                  'revision', 'occurred_at_utc', 'action_authority'})
    v1 = ins.inspect_current_event_v1(I.request_for(w, r))
    A.require('C4I/positive/v1_lineage', v1 == dict(kind='unavailable', reason='installation_unavailable', action_authority='none'))
    # every lower source route is independently callable
    sel = r._selector()
    scope = {k: sel[k] for k in ('storage_instance_id', 'project_id', 'thread_id', 'goal_id')}
    src = ins.read_source_audit(scope, sel['operation_id'])
    stop = ins.read_stop_receipt(scope, sel['operation_id'], src)
    ins.read_cancellation_receipt(scope, sel['operation_id'], src, stop)
    pair = ins.read_progress_pair(sel, src)
    ins.read_frozen_producer(pair, src)
    ins.current_event_source(r, event['event_id'])
    A.require('C4I/positive/passive', (w.storage.cell_generation, len(w.storage.events), w.index.frontier['publication_revision'])
              == (gen, events, frontier))
    return dict(observation=obs, custody_phase='control_published', v1='installation_unavailable')


def positive_member_pending(suite):
    w, r = inspected(suite, 'reserve_assignment')
    custody = w.inspector.read_original_inspection_custody(I.custody_request(r))
    A.require('C4I/pending/custody', custody['kind'] == 'original_inspection_custody')
    result = w.inspector.inspect_current_event_v2(r, I.request_for(w, r))
    A.require('C4I/pending/v2', result['reason'] == 'member_pending' and w.inspector.last_code == 'C4I/inspect_current_event/pending')
    return dict(phase='event_ready', result=result)


def positive_unsettled_pending(suite):
    w, r = inspected(suite, 'settle_owner')
    result = w.inspector.read_original_inspection_custody(dict(event_id=r.expected_producer()['event_id'], progress_selector=r._selector()))
    A.require('C4I/unsettled/pending', result['reason'] == 'member_pending')
    return dict(phase='receipt_committed', result=result)


def positive_drift_current_refused_retained_survives(suite):
    w, r = inspected(suite)
    old_token = w.index.read_token()
    unrelated_append(w)
    stale = w.inspector.inspect_current_event_v2(r, I.request_for(w, r, token=old_token))
    A.require('C4I/drift/current_refused', stale['reason'] == 'source_unavailable')
    A.require('C4I/drift/retained', r.read_retained_success()['value']['kind'] == 'succeeded')
    fresh = w.inspector.inspect_current_event_v2(r, I.request_for(w, r))
    A.require('C4I/drift/fresh_token', fresh['kind'] == 'original_cancellation_event')
    w.binding.withdraw()
    A.require('C4I/drift/retained_after_withdrawal', r.read_retained_success()['value']['kind'] == 'succeeded')
    return dict(stale='source_unavailable', retained='succeeded', fresh='observed')


def positive_source_disposed(suite):
    """Disposed original Event bytes are not reconstructed from receipts or the terminal copy."""
    w, r = inspected(suite)
    event_id = r.progress['publication']['event_id']
    info = w.storage.events[event_id]
    path = w.storage._segment_path(info['segment_generation'])
    raw = bytearray(path.read_bytes())
    raw[info['offset'] + 8] ^= 0xFF
    path.write_bytes(bytes(raw))
    result = w.inspector.inspect_current_event_v2(r, I.request_for(w, r))
    A.require('C4I/disposed/unavailable', result['reason'] == 'source_unavailable')
    A.require('C4I/disposed/retained', r.read_retained_success()['value']['kind'] == 'succeeded')
    return dict(result=result)


def positive_c1_inspect_current(suite):
    w, r = c1_world(suite)
    r.run(until='freeze_event')
    pending = w.inspector.inspect_current(r, I.request_for(w, r))
    A.require('C4I/row10/pending', pending['reason'] == 'member_pending')
    r.append_original()
    w.index.publish()
    obs = w.inspector.inspect_current(r, I.request_for(w, r))
    event = w.storage.read_event(r.progress['publication']['event_id'])
    A.require('C4I/row10/observation', obs['kind'] == 'original_cancellation_event' and obs['sequence_id'] == event['sequence_id']
              and obs['revision'] == event['payload']['revision'])
    w.permissions.revoke(w.inspector.decisions[I.scoped_key(r.scope)])
    denied = w.inspector.inspect_current(r, I.request_for(w, r))
    A.require('C4I/row10/permission', denied['reason'] == 'permission_denied')
    return dict(pending='member_pending', observed=obs['event_id'], revoked='permission_denied')


def positive_late_only_sequence(suite):
    """SP-310: against the fixed template only the Storage sequence (and Storage times) differ; all from Storage custody."""
    w, r = C3.until(suite, 'issue_assignment_audit')
    audit = r.issue_assignment_audit()
    stored = w.storage.reservation_record(r.operation_id)
    template = r.late_template()
    fixed = r.late_evaluate(template, {'cancellation_receipt_sha256': row_sha(w.value('goal_cancel_receipt', r.key('goal_cancel_receipt'))),
                                       'sequence_id': 0, 'event.observed_at_utc': '', 'event.persisted_at_utc': ''})
    r.append_original()
    event = w.storage.read_event(r.progress['publication']['event_id'])
    diff = sorted(k for k in event if event[k] != fixed.get(k))
    A.require('C4I/late/diff', diff == sorted(k for k in ('sequence_id', 'observed_at_utc', 'persisted_at_utc') if event[k] != fixed[k]))
    A.require('C4I/late/custody', event['sequence_id'] == stored['reserved_sequence_id'] and event['observed_at_utc'] == stored['assigned_observed_at_utc']
              and event['persisted_at_utc'] == stored['assigned_persisted_at_utc'])
    A.require('C4I/late/audit', audit['original_event_id'] == event['event_id'] and audit['actual_late_reservation']['reserved_sequence_id'] == event['sequence_id'])
    group = w.storage.active_durable_group(event['event_id'])
    A.require('C4I/late/first_group', [m['event_id'] for m in group['members']] == [event['event_id']]
              and w.storage.first_custody(event['event_id'])['group_digest'] == group['group_digest'])
    return dict(differing=diff, sequence=event['sequence_id'])


# ------------------------------------------------------------------ negatives

def negatives(suite):
    neg = suite.negative

    # --- late assignment: compared with Storage custody, not only with each other
    def coherent_sequence_shift():
        w, r = C3.until(suite, 'issue_assignment_audit')

        def edit(entry):
            entry['actual_storage_assigned_event']['sequence_id'] += 1
            entry['actual_late_reservation']['reserved_sequence_id'] += 1
            for row in entry['complete_numeric_domains']:
                if row['original_derivation']['source_json_pointer'] == '/reserved_sequence_id':
                    for iv in row['values']:
                        iv['minimum'] += 1
                        iv['maximum'] += 1
            return entry
        return w, lambda: r.issue_assignment_audit(entry_edit=edit)
    neg(G, 'late_coherent_sequence_shift', coherent_sequence_shift, 'C3/issue_assignment_audit/assigned_sequence_custody', boundary='issue_assignment_audit')

    def coherent_times_shift():
        w, r = C3.until(suite, 'issue_assignment_audit')

        def edit(entry):
            entry['actual_storage_assigned_event']['observed_at_utc'] = '2026-01-01T00:00:00.000Z'
            entry['actual_storage_assigned_event']['persisted_at_utc'] = '2026-01-01T00:00:00.001Z'
            return entry
        return w, lambda: r.issue_assignment_audit(entry_edit=edit)
    neg(G, 'late_coherent_times_shift', coherent_times_shift, 'C3/issue_assignment_audit/assigned_times_custody', boundary='issue_assignment_audit')

    def producer_field_change():
        w, r = C3.until(suite, 'issue_assignment_audit')

        def edit(entry):
            entry['actual_storage_assigned_event']['correlation_id'] = uid('TEST_ONLY:other-correlation')
            return entry
        return w, lambda: r.issue_assignment_audit(entry_edit=edit)
    neg(G, 'late_producer_field_change', producer_field_change, 'C3/issue_assignment_audit/template_event', boundary='issue_assignment_audit')

    def keyset_addition():
        w, r = C3.until(suite, 'issue_assignment_audit')

        def edit(entry):
            entry['actual_storage_assigned_event']['extra_member'] = 'TEST_ONLY'
            return entry
        return w, lambda: r.issue_assignment_audit(entry_edit=edit)
    neg(G, 'late_keyset_addition', keyset_addition, 'roots/schema//$defs/LateAssignmentEntry/actual_storage_assigned_event/*', boundary='issue_assignment_audit')

    def reservation_offset_substituted():
        w, r = C3.until(suite, 'issue_assignment_audit')

        def edit(entry):
            entry['actual_late_reservation']['byte_offset'] += 1
            return entry
        return w, lambda: r.issue_assignment_audit(entry_edit=edit)
    neg(G, 'late_reservation_offset_substituted', reservation_offset_substituted, 'C3/issue_assignment_audit/reservation_entry', boundary='issue_assignment_audit')

    def append_unverified_receipt():
        w, r = C3.until(suite, 'publish_control')
        bad = dict(r.progress['publication']['first_append_receipt'], acknowledged_at_utc='2026-01-01T00:00:00.000Z')
        return w, lambda: w.storage.authenticate_receipt(r.progress['publication']['event_id'], bad)
    neg(G, 'late_unverified_first_receipt', append_unverified_receipt, 'custody/receipt_mismatch', boundary='append_original')

    # --- custody reader: one source mutated at each lower route
    def custody_case(before=None, mutate=None, request_edit=None):
        def fn():
            w, r = inspected(suite, before)
            req = I.custody_request(r)
            if request_edit:
                req = request_edit(w, r, req)
            if mutate:
                mutate(w, r)
            return w, lambda: strict(w, w.inspector.read_original_inspection_custody(req))
        return fn

    def sub_source(w, r):
        C3.substitute(w, 'goal_cancel_source_audit', r.key('goal_cancel_source_audit'), lambda v: v['record'].update(captured_at='2026-01-01T00:00:00Z'))
    neg(G, 'custody_source_audit_substituted', custody_case(mutate=sub_source), 'C4I/read_stop_receipt/contradictory', boundary='read_source_audit')

    def sub_stop(w, r):
        C3.substitute(w, 'goal_cancel_stop_receipt', r.key('goal_cancel_stop_receipt'), lambda v: v['record'].update(committed_at='2026-01-01T00:00:00Z'))
    neg(G, 'custody_stop_receipt_substituted', custody_case(mutate=sub_stop), 'C4I/read_cancellation_receipt/contradictory', boundary='read_stop_receipt')

    def sub_receipt(w, r):
        C3.substitute(w, 'goal_cancel_receipt', r.key('goal_cancel_receipt'), lambda v: v['record'].update(accepted_at='2026-01-01T00:00:00Z'))
    neg(G, 'custody_cancellation_receipt_substituted', custody_case(mutate=sub_receipt), 'C4I/read_original_inspection_custody/contradictory_receipt_progress',
        boundary='read_cancellation_receipt')

    def sub_head(w, r):
        C3.substitute(w, 'goal_cancel_progress', r.key('goal_cancel_progress') + ':head', lambda v: v['record'].update(snapshot_sha256='0' * 64))
    neg(G, 'custody_progress_head_substituted', custody_case(mutate=sub_head), 'C4I/read_progress_pair/contradictory', boundary='read_progress_pair')

    def drop_epoch(w, r):
        key = r.progress_key(r.progress['progress_epoch'])
        del w.storage.cells['goal_cancel_progress'][key]
        C3.mark(w, 'goal_cancel_progress', key)
    neg(G, 'custody_progress_epoch_missing', custody_case(mutate=drop_epoch), 'C4I/read_progress_pair/missing_epoch', boundary='read_progress_pair')

    def sub_producer(w, r):
        key = r.progress_key(r.progress['progress_epoch'])
        C3.substitute(w, 'goal_cancel_progress', key, lambda v: v['record']['producer_input'].update(actor_ref=uid('TEST_ONLY:other-actor')))
        head_key = r.key('goal_cancel_progress') + ':head'
        new_sha = row_sha(w.storage.cells['goal_cancel_progress'][key]['value'])
        C3.substitute(w, 'goal_cancel_progress', head_key, lambda v: v['record'].update(snapshot_sha256=new_sha))
    neg(G, 'custody_frozen_producer_substituted', custody_case(mutate=sub_producer), 'C4I/read_frozen_producer/contradictory', boundary='read_frozen_producer')

    def stale_selector(w, r, req):
        req = copy.deepcopy(req)
        req['progress_selector']['progress_epoch'] -= 1
        req['progress_selector']['snapshot_key'] = r.progress_key(req['progress_selector']['progress_epoch'])
        return req
    neg(G, 'custody_selector_not_current', custody_case(request_edit=stale_selector), 'C4I/read_progress_pair/source', boundary='read_progress_pair')

    def wrong_event(w, r, req):
        return dict(req, event_id=uid('TEST_ONLY:other-event'))
    neg(G, 'custody_wrong_event_id', custody_case(request_edit=wrong_event), 'C4I/read_original_inspection_custody/contradictory_event',
        boundary='read_original_inspection_custody')

    def revoked(w, r):
        w.permissions.revoke(w.inspector.decisions[I.scoped_key(r.scope)])
        C3.mark(w, w.permissions.FAMILY, w.inspector.decisions[I.scoped_key(r.scope)])
    neg(G, 'custody_permission_revoked', custody_case(mutate=revoked), 'C4I/read_original_inspection_custody/permission', boundary='read_original_inspection_custody')

    def v2_operation():
        w, r = c1_world(suite)
        r.run(until='append_reserved')
        req = dict(event_id=r.progress['producer_input']['event_id'], progress_selector=r._selector())
        return w, lambda: strict(w, w.inspector.read_original_inspection_custody(req))
    neg(G, 'custody_v2_operation_refused', v2_operation, 'C4I/read_source_audit/version', boundary='read_source_audit')

    def missing_source():
        w, r = inspected(suite, 'capture_source')
        req = dict(event_id=r.expected_producer()['event_id'] if r.source else uid('TEST_ONLY:event'),
                   progress_selector=dict(r.scope, operation_id=r.operation_id, progress_epoch=0, snapshot_key=r.progress_key(0)))
        return w, lambda: strict(w, w.inspector.read_original_inspection_custody(req))
    neg(G, 'custody_missing_original', missing_source, 'C4I/read_source_audit/missing', boundary='read_source_audit')

    # --- inspect_current_event.v2: one change at each current-source boundary
    def inspect_case(before=None, mutate=None, request_edit=None):
        def fn():
            w, r = inspected(suite, before)
            req = I.request_for(w, r)
            if request_edit:
                req = request_edit(w, r, req)
            if mutate:
                mutate(w, r)
            return w, lambda: strict(w, w.inspector.inspect_current_event_v2(r, req))
        return fn

    def stale_token(w, r, req):
        token = w.index.read_token()
        unrelated_append(w)
        for t in ('event_record_index_checkpoint', 'event_record_index'):
            C3.mark_all(w, t)
        return dict(req, read_token=token)
    neg(G, 'inspect_stale_read_token', inspect_case(request_edit=stale_token), 'C4I/inspect_current_event/source:index/token_stale', boundary='index_token')

    def wrong_key(w, r, req):
        return dict(req, event_index_key=req['event_index_key'] + '0')
    neg(G, 'inspect_wrong_index_key', inspect_case(request_edit=wrong_key), 'C4I/inspect_current_event/source_index_key', boundary='index_row')

    def wrong_sequence(w, r, req):
        return dict(req, sequence_id=req['sequence_id'] + 1)
    neg(G, 'inspect_wrong_sequence', inspect_case(request_edit=wrong_sequence), 'C4I/inspect_current_event/contradictory_sequence', boundary='custody')

    def sub_row(w, r):
        gid = w.index.generation_id
        key = w.index.row_key(gid, w.storage.events[r.progress['publication']['event_id']]['sequence_id'])
        C3.substitute(w, IX.ROWS, key, lambda v: v.update(producer_semantic_digest='0' * 64))
    neg(G, 'inspect_index_row_substituted', inspect_case(mutate=sub_row), 'C4I/current_event_source/source:C3/inspect/index_row_event', boundary='index_row')

    def sub_audit(w, r):
        C3.substitute(w, R.LATE_AUDIT, r.late_audit_key, lambda v: v['record'].update(original_event_id=uid('TEST_ONLY:other-event')))
    neg(G, 'inspect_late_audit_substituted', inspect_case(mutate=sub_audit), 'C4I/inspect_current_event/contradictory_assignment', boundary='assignment')

    def sub_publication(w, r):
        key = r.progress_key(r.progress['progress_epoch'])
        C3.substitute(w, 'goal_cancel_progress', key, lambda v: v['record']['publication']['original_append_result'].update(segment_ref='TEST_ONLY:other'))
        new_sha = row_sha(w.storage.cells['goal_cancel_progress'][key]['value'])
        C3.substitute(w, 'goal_cancel_progress', r.key('goal_cancel_progress') + ':head', lambda v: v['record'].update(snapshot_sha256=new_sha))
    neg(G, 'inspect_publication_substituted', inspect_case(mutate=sub_publication), 'C4I/inspect_current_event/contradictory_publication',
        boundary='publication')

    def frame_corrupt(w, r):
        event_id = r.progress['publication']['event_id']
        info = w.storage.events[event_id]
        path = w.storage._segment_path(info['segment_generation'])
        raw = bytearray(path.read_bytes())
        raw[info['offset'] + 8] ^= 0xFF
        path.write_bytes(bytes(raw))
    neg(G, 'inspect_source_frame_corrupted', inspect_case(mutate=frame_corrupt), 'C4I/current_event_source/source:read/frame_hash', boundary='source_frame')

    neg(G, 'inspect_before_append', inspect_case(before='append_original'), 'C4I/inspect_current_event/pending', boundary='custody')
    neg(G, 'inspect_permission_revoked', inspect_case(mutate=revoked), 'C4I/inspect_current_event/permission', boundary='permission')

    # --- row 10 (C1/C2 inspect_current)
    def c1_case(request_edit=None, mutate=None, append=True):
        def fn():
            w, r = c1_world(suite)
            r.run(until='append_reserved' if append else 'freeze_event')
            if append:
                w.index.publish()
            req = I.request_for(w, r)
            if request_edit:
                req = request_edit(w, r, req)
            if mutate:
                mutate(w, r)
            return w, lambda: strict(w, w.inspector.inspect_current(r, req))
        return fn
    neg(G, 'row10_before_append', c1_case(append=False), 'C4I/inspect_current/pending', boundary='inspect_current')
    neg(G, 'row10_wrong_index_key', c1_case(request_edit=wrong_key), 'C4I/inspect_current/source_index_key', boundary='inspect_current')
    neg(G, 'row10_wrong_sequence', c1_case(request_edit=wrong_sequence), 'C4I/inspect_current/contradictory_sequence', boundary='inspect_current')
    neg(G, 'row10_stale_token', c1_case(request_edit=stale_token), 'C4I/inspect_current/source:index/token_stale', boundary='inspect_current')
    neg(G, 'row10_permission_revoked', c1_case(mutate=revoked), 'C4I/inspect_current/permission', boundary='inspect_current')


def cases(suite):
    suite.positive(G, 'positive_workflow_private_inspection', lambda: positive_workflow(suite))
    suite.positive(G, 'positive_member_pending_before_append', lambda: positive_member_pending(suite))
    suite.positive(G, 'positive_unsettled_custody_pending', lambda: positive_unsettled_pending(suite))
    suite.positive(G, 'positive_drift_current_refused_retained_survives', lambda: positive_drift_current_refused_retained_survives(suite))
    suite.positive(G, 'positive_disposed_source_unavailable', lambda: positive_source_disposed(suite))
    suite.positive(G, 'positive_row10_c1_inspect_current', lambda: positive_c1_inspect_current(suite))
    suite.positive(G, 'positive_late_only_sequence_and_times', lambda: positive_late_only_sequence(suite))
    negatives(suite)
