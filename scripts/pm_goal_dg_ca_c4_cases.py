#!/usr/bin/env python3
"""DG-CA C4 corpus: SP-305/SP-310 assignment admission tuple (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof. Cases run on ``pm_goal_dg_ca_assignment`` through the
shared ``Suite`` of ``pm_goal_dg_ca_oracles``.
"""
from __future__ import annotations

import copy
import hashlib

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_dg_ca_owners as O
import pm_goal_dg_ca_assignment as AS

STEPS = ('capture_source', 'reserve_append_assignment', 'issue_assignment_audit', 'admit_codec_domain', 'latch_and_reserve',
         'commit_receipt', 'settle_owner', 'freeze_event', 'append_original', 'publish_control', 'terminal')


def route(suite, state='active'):
    suite.n += 1
    w = AS.assigned_world(suite.work / ('a%05d' % suite.n))
    r = AS.AssignedCancel(w, state=state)
    r.dispatch(r.user_request())
    return w, r


def until(suite, before, state='active'):
    w, r = route(suite, state)
    for step in STEPS:
        if step == before:
            break
        getattr(r, step)()
    return w, r


def coherent_progress(w, r):
    head = r.key('goal_cancel_progress') + ':head'
    w.storage.cells['goal_cancel_progress'][r.progress_key(r.progress['progress_epoch'])]['value'] = r.wrap('StorageProgress', r.progress)
    w.storage.cells['goal_cancel_progress'][head]['value'] = r.wrap('StorageProgress', r._head(r.progress['progress_epoch'], r.progress))


def substitute_audit(w, r, edit, *, recommit=True):
    """Replace the stored audit by a coherent substituted one (new pack, new reference)."""
    _, audit = w.assigner.resolve_audit(r.audit_key)
    audit = copy.deepcopy(audit)
    edit(audit['record'])
    if recommit:
        body = {k: v for k, v in audit['record'].items() if k not in ('complete_original_input_commitment', 'original_issuer')}
        audit['record']['complete_original_input_commitment'] = w.assigner.h_domain('pm.goal.cancel.assignment_input.v1', body)
    reference = w.assigner.publish_audit(r.scope, r.operation_id, audit, r.audit_key)
    w.storage.cells[AS.AUDIT_TABLE][r.audit_key]['value'] = reference
    r.assignment_audit = audit['record']


def positive(suite, state):
    w, r = route(suite, state)
    generations = []
    for step in STEPS:
        getattr(r, step)()
        generations.append((step, w.storage.manifest_generation))
    st = w.storage
    pub = r.progress['publication']
    event = st.read_event(pub['event_id'])
    reservation = r.reservation_source
    A.require('C4A/positive/reserved_sequence', event['sequence_id'] == reservation['reserved_sequence_id'] == pub['first_append_receipt']['sequence_id'])
    A.require('C4A/positive/prior_history', reservation['reserved_sequence_id'] >= 1 and reservation['byte_offset'] > 0)
    A.require('C4A/positive/selected_offset', pub['first_append_receipt']['byte_offset'] == reservation['byte_offset'])
    A.require('C4A/positive/selected_manifest', pub['first_append_receipt']['manifest_generation'] == reservation['selected_manifest_generation'])
    A.require('C4A/positive/manifest_held', len({g for s, g in generations[1:8]}) == 1)
    sink = (st.root / ('segment-%d.seglog' % reservation['selected_segment_generation'])).read_bytes()[:reservation['byte_offset']]
    A.require('C4A/positive/active_sink', hashlib.sha256(sink).hexdigest() == reservation['complete_original_active_sink_sha256'])
    reference, audit = w.assigner.resolve_audit(r.audit_key)
    A.require('C4A/positive/reference_cap', len(S.canonical(reference)) <= S.STORED_PART_CAP)
    A.require('C4A/positive/predecessor_inline_over_cap', r.inline_audit_bytes > S.STORED_PART_CAP)
    body = {k: v for k, v in audit['record'].items() if k not in ('complete_original_input_commitment', 'original_issuer')}
    A.require('C4A/positive/input_commitment', w.assigner.h_domain('pm.goal.cancel.assignment_input.v1', body)
              == audit['record']['complete_original_input_commitment'])
    domain_input = dict(assignment=r.stored_selection(AS.AUDIT_TABLE, r.audit_key), numeric_path_domains=audit['record']['numeric_path_domains'],
                        codec_resources=audit['record']['codec_resources'], exact_event_encoding_template=audit['record']['exact_event_encoding_template'])
    A.require('C4A/positive/full_domain', w.assigner.h_domain('pm.goal.cancel.assignment_domain.v1', domain_input) == r.assignment['full_domain_sha256'])
    template = audit['record']['exact_event_encoding_template']
    slots = AS.slot_paths(template)
    A.require('C4A/positive/template_slots', sorted(slots) == sorted([('/observed_at_utc', 'event.observed_at_utc'),
              ('/persisted_at_utc', 'event.persisted_at_utc'), ('/payload/cancellation_receipt_sha256', 'cancellation_receipt_sha256')]))
    lease = st.lease()['record']['current_lease']
    A.require('C4A/positive/lease', lease['first_sequence_id'] <= event['sequence_id'] <= lease['last_sequence_id']
              and lease['last_sequence_id'] - lease['first_sequence_id'] + 1 == AS.LEASE_SIZE)
    A.require('C4A/positive/reservation_consumed', st.reservation_record(r.operation_id)['state'] == 'consumed' and st.fence is None)
    group = st.active_durable_group(event['event_id'])
    A.require('C4A/positive/single_member_barrier', [m['event_id'] for m in group['members']] == [event['event_id']]
              and group['durability_class'] == 'barrier')
    A.require('C4A/positive/full_value', A.same(st.full_value_result(event['event_id'])['original_event_value_commitment'],
                                                pub['original_event_value_commitment']))
    A.require('C4A/positive/terminal', w.value('goal_cancel_terminal_audit', r.key('goal_cancel_terminal_audit'))['record']['kind'] == 'succeeded')
    count = len(st.events)
    _, _, outcome = w.appender.append_original(r.operation_id + ':retry', dict(kind='retry'), [copy.deepcopy(r.progress['producer_input'])])
    A.require('C4A/positive/equal_retry_dedupe', outcome['status'] == 'dedupe' and len(st.events) == count)
    return dict(state=state, sequence=event['sequence_id'], byte_offset=reservation['byte_offset'],
                manifest_generation=reservation['selected_manifest_generation'], inline_audit_bytes=r.inline_audit_bytes,
                reference_bytes=len(S.canonical(reference)), numeric_paths=len(audit['record']['numeric_path_domains']),
                generations=generations)


def abandoned_gap(suite):
    w, r = until(suite, 'issue_assignment_audit')
    abandoned = r.reservation_source['reserved_sequence_id']
    w.storage.abandon(r.operation_id)
    second = AS.AssignedCancel(w, birth=False)
    other = AS.AssignedCancel(w, state='active')
    other.dispatch(other.user_request())
    other.capture_source()
    source = other.reserve_append_assignment()
    A.require('C4A/abandoned/never_reused', source['reserved_sequence_id'] == abandoned + 1)
    records = w.seglog.records()
    gaps = records['manifest']['selection_entries'][0]['excluded_ranges']
    A.require('C4A/abandoned/gap_recorded', [(g['first_sequence_id'], g['reason']) for g in gaps] == [(abandoned, 'allocator_lease_abandoned')])
    for step in STEPS[2:]:
        getattr(other, step)()
    event = w.storage.read_event(other.progress['publication']['event_id'])
    A.require('C4A/abandoned/next_event', event['sequence_id'] == abandoned + 1)
    return dict(abandoned=abandoned, next=event['sequence_id'])


def cases(suite):
    G = 'C4'
    for state in ('active', 'paused', 'blocked'):
        suite.positive(G, 'C4A/positive/%s' % state, lambda s=state: positive(suite, s))
    suite.positive(G, 'C4A/positive/abandoned_reservation_gap_never_reused', lambda: abandoned_gap(suite))

    def neg(name, fn, expected, boundary):
        suite.negative(G, 'C4A/' + name, fn, expected, boundary=boundary)

    def not_acknowledged():
        w, r = until(suite, 'reserve_append_assignment')
        cell = w.storage.cells[w.sir.OUTCOME][r.request['command_instance_id']]
        cell['value'] = dict(cell['value'], record=dict(cell['value']['record'], outcome='accepted', acknowledgement_receipt_ref=None))
        return w, r.reserve_append_assignment
    neg('entry/reservation_before_acknowledgement', not_acknowledged, 'C4A/reserve_append_assignment/acknowledgement_readback', 'reserve/entry')

    def foreign_acknowledgement():
        w, r = until(suite, 'reserve_append_assignment')
        cell = w.storage.cells[w.sir.OUTCOME][r.request['command_instance_id']]
        rec = copy.deepcopy(cell['value']['record'])
        rec['dispatch_frame_id'] = O.uid('TEST_ONLY:dispatch-frame')
        rec['acknowledgement_frame_id'] = rec['dispatch_frame_id']
        cell['value'] = dict(cell['value'], record=rec)
        return w, r.reserve_append_assignment
    neg('entry/acknowledgement_for_other_dispatch', foreign_acknowledgement, 'C4A/reserve_append_assignment/acknowledged_identity', 'reserve/entry')

    def writer_cutoff():
        w, r = until(suite, 'reserve_append_assignment')
        w.binding.withdraw()
        return w, r.reserve_append_assignment
    neg('entry/writer_domain_withdrawn', writer_cutoff, 'C4A/reserve_append_assignment/writer_cutoff', 'reserve/entry')

    def competing_reservation():
        w, r = until(suite, 'issue_assignment_audit')
        other = AS.AssignedCancel(w, state='active')
        other.dispatch(other.user_request())
        other.capture_source()
        return w, other.reserve_append_assignment
    neg('fence/competing_reservation', competing_reservation, 'assignment/fence_held', 'reserve/fence')

    def competing_append():
        w, r = until(suite, 'issue_assignment_audit')
        return w, lambda: AS.prior_history(w)
    neg('fence/competing_unrelated_append', competing_append, 'assignment/fence_held', 'storage/append')

    def audit_without_reservation():
        w, r = until(suite, 'issue_assignment_audit')
        w.storage.abandon(r.operation_id)
        return w, r.issue_assignment_audit
    neg('lower/audit_after_fence_release', audit_without_reservation, 'C4A/issue_assignment_audit/reservation', 'issue/entry')

    def reservation_substituted():
        w, r = until(suite, 'issue_assignment_audit')
        cell = w.storage.cells[AS.RESERVATION_TABLE][r.operation_id]
        cell['value'] = dict(cell['value'], reserved_sequence_id=cell['value']['reserved_sequence_id'] + 7)
        return w, r.issue_assignment_audit
    neg('custody/substituted_reservation_record', reservation_substituted, 'C4A/issue_assignment_audit/reservation_custody', 'issue/entry')

    def codec_drift():
        w, r = until(suite, 'issue_assignment_audit')
        res = w.codecs.resources[1]
        cell = w.storage.cells[w.codecs.FAMILY][res['original_registration_ref']]
        cell['value'] = dict(cell['value'], resource_path=str(O.ROOT / 'scripts/pm_goal_test_storage.py'))
        return w, r.issue_assignment_audit
    neg('custody/codec_resource_drift', codec_drift, 'codec/resource_drift/producer_jcs', 'issue/after_codec_read')

    def pack_withdrawn():
        w, r = until(suite, 'admit_codec_domain')
        ref = w.value(AS.AUDIT_TABLE, r.audit_key)['record']['audit_payload']
        w.storage.withdraw_pack(ref['blake3'])
        return w, r.admit_codec_domain
    neg('pack/withdrawn', pack_withdrawn, 'pack/unavailable', 'admit/entry')

    def pack_corrupt():
        w, r = until(suite, 'admit_codec_domain')
        ref = w.value(AS.AUDIT_TABLE, r.audit_key)['record']['audit_payload']
        path = w.storage.root / 'packs' / ref['blake3']
        raw = bytearray(path.read_bytes())
        raw[-1] ^= 1
        path.write_bytes(bytes(raw))
        return w, r.admit_codec_domain
    neg('pack/corrupt_bytes', pack_corrupt, 'payload/numrule/payload_digest', 'admit/entry')

    def pack_media():
        w, r = until(suite, 'admit_codec_domain')
        cell = w.storage.cells[AS.AUDIT_TABLE][r.audit_key]
        rec = copy.deepcopy(cell['value']['record'])
        rec['audit_payload']['media_type'] = 'application/msgpack'
        cell['value'] = dict(cell['value'], record=rec)
        return w, r.admit_codec_domain
    neg('pack/wrong_media_type', pack_media, 'C4A/admit_codec_domain/reference/schema/record/audit_payload/media_type', 'admit/entry')

    def pack_foreign():
        w, r = until(suite, 'admit_codec_domain')
        other_w, other = until(suite, 'admit_codec_domain')
        _, foreign = other_w.assigner.resolve_audit(other.audit_key)
        raw = S.canonical(foreign)
        ref = w.storage.put_pack(raw, AS.AUDIT_MEDIA)
        cell = w.storage.cells[AS.AUDIT_TABLE][r.audit_key]
        rec = copy.deepcopy(cell['value']['record'])
        rec.update(audit_payload=ref, audit_value_sha256=hashlib.sha256(raw).hexdigest())
        cell['value'] = dict(cell['value'], record=rec)
        return w, r.admit_codec_domain
    neg('pack/foreign_audit_pack', pack_foreign, 'C4A/admit_codec_domain/audit_reference_join', 'admit/entry')

    def value_sha_substituted():
        w, r = until(suite, 'admit_codec_domain')
        cell = w.storage.cells[AS.AUDIT_TABLE][r.audit_key]
        rec = dict(cell['value']['record'], audit_value_sha256='0' * 64)
        cell['value'] = dict(cell['value'], record=rec)
        return w, r.admit_codec_domain
    neg('pack/substituted_value_sha256', value_sha_substituted, 'C4A/admit_codec_domain/audit_value_sha256', 'admit/entry')

    def stale_commitment():
        w, r = until(suite, 'admit_codec_domain')
        substitute_audit(w, r, lambda rec: rec.update(original_initial_control_epoch=rec['original_initial_control_epoch'] + 1), recommit=False)
        return w, r.admit_codec_domain
    neg('commitment/input_commitment_stale', stale_commitment, 'C4A/admit_codec_domain/input_commitment', 'admit/entry')

    def unsupported_route():
        w, r = until(suite, 'admit_codec_domain')
        def edit(rec):
            for d in rec['numeric_path_domains']:
                if d['schema_branch'] == 'ProducerInput' and d['json_pointer'] == '/payload/revision':
                    d['values'] = [dict(minimum=(1 << 53) + 1, maximum=(1 << 53) + 1, step=1)]
        substitute_audit(w, r, edit)
        return w, r.admit_codec_domain
    neg('codec/unsupported_existing_codec_route', unsupported_route, 'C4A/admit_codec_domain/codec_route', 'admit/final')

    def bad_interval():
        w, r = until(suite, 'admit_codec_domain')
        def edit(rec):
            rec['numeric_path_domains'][0]['values'] = [dict(minimum=5, maximum=8, step=2)]
        substitute_audit(w, r, edit)
        return w, r.admit_codec_domain
    neg('codec/interval_not_progression', bad_interval, 'C4A/admit_codec_domain/interval', 'admit/entry')

    def changed_candidate():
        w, r = until(suite, 'append_original')
        def edit(p):
            p = copy.deepcopy(p)
            p['correlation_id'] = O.uid('TEST_ONLY:correlation')
            return p
        return w, lambda: r.append_original(candidate_edit=edit)
    neg('append/changed_candidate', changed_candidate, 'C4A/append_reserved/frozen_producer', 'append/entry')

    def producer_off_template():
        w, r = until(suite, 'append_original')
        r.progress = dict(r.progress, producer_input=dict(r.progress['producer_input'], correlation_id=O.uid('TEST_ONLY:correlation')))
        coherent_progress(w, r)
        return w, r.append_original
    neg('append/frozen_producer_off_template', producer_off_template, 'C4A/append_reserved/template_producer', 'append/entry')

    def full_domain_substituted():
        w, r = until(suite, 'append_original')
        r.assignment = dict(r.assignment, full_domain_sha256='0' * 64)
        return w, r.append_original
    neg('append/substituted_full_domain', full_domain_substituted, 'C4A/append_reserved/full_domain', 'append/entry')

    def abandoned_then_append():
        w, r = until(suite, 'append_original')
        w.storage.abandon(r.operation_id)
        return w, lambda: w.appender.append_original(r.operation_id, r.append_request, [copy.deepcopy(r.progress['producer_input'])])
    neg('append/after_abandonment', abandoned_then_append, 'assignment/reservation_abandoned', 'storage/append')

    def fence_lost_on_reopen():
        w, r = until(suite, 'append_original')
        w.storage.fence = None
        w.storage.boot_session = O.uid('TEST_ONLY:native-boot-session')
        return w, r.append_original
    neg('append/fence_lost_after_restart', fence_lost_on_reopen, 'C4A/append_reserved/fence_final', 'append/final')

    def storage_fence_lost():
        w, r = until(suite, 'append_original')
        held = w.storage.fence
        w.storage.fence = AS.Fence(r.operation_id, O.uid('TEST_ONLY:native-boot-session'))
        r.fence = w.storage.fence
        return w, r.append_original
    neg('append/new_boot_session_fence', storage_fence_lost, 'assignment/fence_lost', 'storage/append')

    def caller_sequence():
        w, r = until(suite, 'append_original')
        p = dict(r.progress['producer_input'], sequence_id=r.reservation_source['reserved_sequence_id'])
        return w, lambda: w.appender.append_original(r.operation_id, r.append_request, [p])
    neg('append/caller_supplied_sequence', caller_sequence, 'append/candidate/storage_metadata_supplied/sequence_id', 'storage/append')

    def replay_only():
        w, r = until(suite, 'append_original')
        p = dict(r.progress['producer_input'], replay_policy='projector_replay_only')
        return w, lambda: w.appender.append_original(r.operation_id, r.append_request, [p])
    neg('append/replay_only_under_reservation', replay_only, 'append/candidate/replay_policy/numrule/replay_only_not_appendable', 'storage/append')

    def fence_serialized():
        w, r = until(suite, 'issue_assignment_audit')
        return w, lambda: copy.deepcopy(r.fence)
    neg('fence/not_copyable', fence_serialized, 'fence/not_copyable', 'fence')

    # every returning helper and final boundary of the three new methods
    import pm_goal_dg_ca_oracles as ORC
    hooks = dict(ORC.INJECTIONS)
    for method, points in (('reserve_append_assignment', ('after_seglog_read', 'final')),
                           ('issue_assignment_audit', ('after_codec_read', 'final')),
                           ('admit_codec_domain', ('final',))):
        for point in points:
            for source in ('accepted', 'permission', 'body', 'stop', 'binding', 'domain', 'inventory'):
                if source == 'body' and method != 'reserve_append_assignment':
                    pass
                def drift(m=method, p=point, h=hooks[source]):
                    w, r = until(suite, m)
                    r.inject[(m, p)] = h
                    return w, getattr(r, m)
                suite.negative(G, 'C4A/boundary/%s/%s/%s' % (method, point, source), drift, 'C4A/%s/%s/%s' % (method, point, source),
                               boundary='%s/%s' % (method, point))
