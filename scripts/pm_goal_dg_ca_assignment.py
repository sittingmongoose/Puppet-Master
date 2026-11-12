#!/usr/bin/env python3
"""DG-CA SP-305/SP-310 cancellation assignment tuple on the shared adapters (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Execution-binding methods ``reserve_append_assignment``, ``issue_assignment_audit``,
``admit_codec_domain`` and ``append_reserved`` (``Plans/goal_cancel_contracts/
execution-methods.json``; SP-305 "Concrete codec and possible-assignment custody";
GRS-076 stages 3-7). The goal.cancelled C2 bound route and the C3/C4 Workflow late
assignment build on this file.

* ``LeasedStorage`` is a lane subclass of the shared test-owner Storage (the adapter
  files are not edited; listed for the merge). It adds the original 4096-ID sequence
  lease (a stored ``sequence_lease_control`` record), one nonserializable exclusive
  append/rotation/selection fence held by the reserving operation, a reservation that
  fixes the never-reused next sequence, selected segment and byte offset, and
  abandonment: a released or lost fence invalidates the unconsumed reservation and
  its sequence becomes an ``allocator_lease_abandoned`` gap that no later append
  reuses. The seglog selection generation advances only on seglog changes (segment,
  reservation, custody, gap), so redb-cell transactions between reservation and
  append do not move the selected manifest generation.
* ``SeglogControlOwner`` reads the actual CURRENT/manifest/segment bytes and returns
  them as the unchanged native ``current``/``manifest``/``sequence_lease_control``
  roots (``Plans/storage_compaction_native_contracts.schema.json``). Every field is
  derived from Storage's own files and state.
* ``CodecOwner`` registers the four original codec resources by the SHA-256 of the
  actual implementation files used.
* ``AssignmentOwner`` performs the four methods. Commitments use SP-305's exact
  domain prefixes, LF and the retained local Goal JSON.
"""
from __future__ import annotations

import copy
import hashlib
import json
import uuid
import weakref

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_oracle_common import canonical as jcs
from pm_goal_dg_ca_owners import (WorldOwner, require, Refusal, uid, row_sha, same, sha, scoped_key, CANCEL, BINDING,
                                  QUALIFICATION, ROOT, exact_numbers)
import pm_goal_dg_ca_c1 as C1

LEASE_SIZE = 4096
FULL_PAYLOAD_CAP = 16777216
NATIVE = 'https://puppetmaster.local/schemas/storage_compaction_native_contracts/1.0.0/schema.json#/$defs/'
LEASE_TABLE = 'seglog_sequence_allocator'
RESERVATION_TABLE = 'goal_cancel_append_reservation'
AUDIT_TABLE = 'goal_cancel_assignment_audit_reference'
AUDIT_MEDIA = 'application/vnd.pm.goal-cancel-assignment-audit+msgpack'
SUCCESSOR = 'https://puppetmaster.local/schemas/goal_cancel_assignment_audit_reference/1.0.0/schema.json#/$defs/'
SUCCESSOR_BANK = A.RootBank([dict(path='Plans/goal_own_c_contracts/dg-ca-assignment-successor-v1/assignment-audit-reference.v1.schema.json')])
SEGLOG_FIELDS = ('segments', 'reservations', 'custody', 'gaps', 'excluded', 'index_frontier_revision')
TARGETS = dict(ProducerInput='producer_semantic_digest', SucceededResult='goal_cancel_result', NoEffectResult='goal_cancel_result',
               RecoveryRequiredResult='goal_cancel_result', TerminalSuccessOutcome='command_outcome',
               TerminalUnknownOutcome='command_outcome', TerminalNoEffectOutcome='command_outcome',
               SuccessResponse='command_response', UnknownResponse='command_response', NoEffectResponse='command_response')


class Fence:
    """Nonserializable exclusive append/rotation/selection fence (one boot session)."""
    __slots__ = ('__weakref__', 'identity', 'operation_id', 'boot_session')

    def __init__(self, operation_id, boot_session):
        self.identity = uid('TEST_ONLY:native-append-fence')
        self.operation_id = operation_id
        self.boot_session = boot_session

    def __reduce__(self):
        raise Refusal('fence/not_serializable')

    def __copy__(self):
        raise Refusal('fence/not_copyable')

    def __deepcopy__(self, memo):
        raise Refusal('fence/not_copyable')


class LeasedStorage(S.TestOwnerStorage):
    """Shared test-owner Storage plus the original sequence lease and reserved assignment."""

    def __init__(self, root, **kwargs):
        kwargs.setdefault('segment_target_bytes', 1 << 26)
        self.boot_session = uid('TEST_ONLY:native-boot-session')
        self.fence = None
        self._seglog_digest = None
        super().__init__(root, **kwargs)

    # seglog generation advances only on seglog changes --------------------
    def _seglog_view(self):
        return A.observation_digest({k: getattr(self, k, None) for k in SEGLOG_FIELDS})

    def _commit_state(self):
        view = self._seglog_view()
        if self._seglog_digest is not None and view == self._seglog_digest:
            # A redb-cell-only transaction: rewrite the same selection generation atomically.
            self.manifest_generation = self.manifest_generation - 1
        self._seglog_digest = view
        super()._commit_state()

    # lease -------------------------------------------------------------------
    def lease_key(self):
        return 'seglog_sequence_allocator.v1:' + self.storage_instance_id

    def lease(self):
        cell = self.cell(LEASE_TABLE, self.lease_key())
        return None if cell is None else cell['value']

    def next_sequence(self):
        floor = -1 if self.last_sequence is None else self.last_sequence
        for gap in (self.lease() or {}).get('abandoned', []):
            floor = max(floor, gap['last_sequence_id'])
        return NR.uint64(floor + 1, 'lease/next')

    def ensure_lease(self, sequence):
        """Grant a fresh 4096-ID lease when ``sequence`` falls outside the current one."""
        current = self.lease()
        lease = None if current is None else current['record']['current_lease']
        if lease is not None and lease['first_sequence_id'] <= sequence <= lease['last_sequence_id']:
            return current
        revision = 0 if current is None else NR.uint64(current['record']['lease_revision'] + 1, 'lease/revision')
        record = dict(schema_id='pm.storage.seglog_sequence_lease.v1', schema_version='1.0.0',
                      storage_instance_id=self.storage_instance_id, lease_revision=revision,
                      leased_through_sequence_id=NR.uint64(sequence + LEASE_SIZE - 1, 'lease/through'),
                      current_lease=dict(lease_id=uid('TEST_ONLY:sequence-lease'), first_sequence_id=sequence,
                                         last_sequence_id=NR.uint64(sequence + LEASE_SIZE - 1, 'lease/last'),
                                         original_lease_transaction_id=uid('TEST_ONLY:lease-tx'),
                                         native_boot_session_ref=self.boot_session))
        value = dict(record=record, abandoned=[] if current is None else current['abandoned'])
        self.transact([dict(table=LEASE_TABLE, key=self.lease_key(), expected=None if current is None else
                            self.cell(LEASE_TABLE, self.lease_key())['version'], value=value)])
        return value

    # reservation --------------------------------------------------------------
    def reserve_assignment(self, operation_id, request):
        """Fence, then reserve the never-reused next sequence and the selected sink position."""
        require('assignment/fence_held', self.fence is None)
        handle = self.reserve(operation_id, request)
        sequence = self.next_sequence()
        self.ensure_lease(sequence)
        segment = self.segments[-1]
        require('assignment/active_segment', not segment['sealed'] and not segment['retired'])
        fence = Fence(operation_id, self.boot_session)
        record = dict(operation_id=operation_id, state='reserved', reserved_sequence_id=sequence,
                      segment_generation=segment['generation'], segment_name=segment['name'],
                      byte_offset=segment['watermark'], manifest_generation=self.manifest_generation,
                      fence_identity=fence.identity, boot_session=self.boot_session,
                      reservation_transaction_id=uid('TEST_ONLY:reservation-tx'))
        self.transact([dict(table=RESERVATION_TABLE, key=operation_id, expected=None, value=record)])
        self.fence = fence
        return handle, fence, copy.deepcopy(record)

    def reservation_record(self, operation_id):
        cell = self.cell(RESERVATION_TABLE, operation_id)
        return None if cell is None else copy.deepcopy(cell['value'])

    def abandon(self, operation_id):
        """Release/loss of the fence: the unconsumed reservation's sequence becomes a gap."""
        cell = self.cell(RESERVATION_TABLE, operation_id)
        require('assignment/reservation_absent', cell is not None)
        if cell['value']['state'] != 'reserved':
            return cell['value']['state']
        lease_cell = self.cell(LEASE_TABLE, self.lease_key())
        value = copy.deepcopy(lease_cell['value'])
        seq = cell['value']['reserved_sequence_id']
        value['abandoned'].append(dict(first_sequence_id=seq, last_sequence_id=seq, operation_id=operation_id))
        self.transact([dict(table=RESERVATION_TABLE, key=operation_id, expected=cell['version'],
                            value=dict(cell['value'], state='abandoned')),
                       dict(table=LEASE_TABLE, key=self.lease_key(), expected=lease_cell['version'], value=value)])
        if self.fence is not None and self.fence.operation_id == operation_id:
            self.fence = None
        return 'abandoned'

    def append(self, handle, candidates, *, durability_class='ordinary'):
        op = self._resolve_handle(handle, 'reservation')
        record = self.reservation_record(op)
        if record is not None and record['state'] == 'consumed':
            return super().append(handle, candidates, durability_class=durability_class)
        if record is None:
            # Any other writer honors the held fence and never reuses an abandoned sequence.
            require('assignment/fence_held', self.fence is None)
            if self.reservations.get(op, {}).get('state') == 'reserved':
                sequence = self.next_sequence()
                self.ensure_lease(sequence)
                if sequence > 0:
                    self.last_sequence = sequence - 1
            return super().append(handle, candidates, durability_class=durability_class)
        require('assignment/reservation_abandoned', record['state'] == 'reserved')
        require('assignment/fence_lost', self.fence is not None and self.fence.operation_id == op
                and self.fence.identity == record['fence_identity'] and self.fence.boot_session == record['boot_session'])
        segment = self.segments[-1]
        require('assignment/selected_segment', segment['generation'] == record['segment_generation'] and not segment['sealed'])
        require('assignment/selected_offset', segment['watermark'] == record['byte_offset'])
        require('assignment/selected_manifest', self.manifest_generation == record['manifest_generation'])
        require('assignment/sequence_reused', self.next_sequence() <= record['reserved_sequence_id'])
        self.last_sequence = record['reserved_sequence_id'] - 1 if record['reserved_sequence_id'] > 0 else None
        out = super().append(handle, candidates, durability_class=durability_class)
        event = self.read_event(out['event_ids'][0])
        info = self.events[event['event_id']]
        require('assignment/assigned_sequence', event['sequence_id'] == record['reserved_sequence_id'])
        require('assignment/assigned_offset', info['offset'] == record['byte_offset'] and info['segment_generation'] == record['segment_generation'])
        cell = self.cell(RESERVATION_TABLE, op)
        self.transact([dict(table=RESERVATION_TABLE, key=op, expected=cell['version'], value=dict(cell['value'], state='consumed'))])
        self.fence = None
        return out


# ------------------------------------------------------------------ owners

def segment_name(segment, first, last):
    if not segment['sealed']:
        return 'seg-%06d-%020d.active' % (segment['generation'], first or 0)
    return 'seg-%06d-%020d-%020d.seglog' % (segment['generation'], first or 0, last or 0)


class SeglogControlOwner(WorldOwner):
    """The native resource owner's typed view of Storage's actual CURRENT/manifest/lease."""
    role = 'seglog_control'

    def native_name(self, segment):
        seqs = [e['sequence_id'] for e in self.storage.events.values() if e['segment_generation'] == segment['generation']]
        return segment_name(segment, min(seqs) if seqs else None, max(seqs) if seqs else None)

    def physical_id(self, segment):
        return 'pm.storage.segment_object.v1:' + sha(S.canonical([self.storage.storage_instance_id, segment['generation'], segment['name']]))

    def segment_bytes(self, segment):
        return (self.storage.root / ('segment-%d.seglog' % segment['generation'])).read_bytes()[:segment['watermark']]

    def records(self):
        st = self.storage
        with self.recorder.call(self.owner_id, 'read_seglog_control') as slot:
            current_raw = (st.root / 'CURRENT').read_bytes()
            current_file = S.decode_canonical(current_raw)
            manifest_raw = (st.root / current_file['manifest_ref']).read_bytes()
            require('seglog/current_manifest_join', sha(manifest_raw) == current_file['manifest_sha256'])
            lease_cell = st.cell(LEASE_TABLE, st.lease_key())
            require('seglog/lease_unavailable', lease_cell is not None)
            lease = lease_cell['value']['record']
            inventory, watermarks, prefix = [], [], hashlib.sha256()
            for segment in st.segments:
                if segment['retired']:
                    continue
                seqs = [e['sequence_id'] for e in st.events.values() if e['segment_generation'] == segment['generation']]
                first, last = (min(seqs), max(seqs)) if seqs else (None, None)
                raw = self.segment_bytes(segment)
                prefix.update(raw)
                inventory.append(dict(physical_segment_id=self.physical_id(segment), segment_ref='TEST_ONLY:segment-ref:' + segment['name'],
                                      segment_generation=segment['generation'], segment_name=self.native_name(segment),
                                      namespace_revision=0, state='closed' if segment['sealed'] else 'active',
                                      selection_role='original_selected', origin_operation_ref='TEST_ONLY:storage-birth:' + st.storage_instance_id,
                                      frame_profile='pm.seglog_frame_v2.first_profile.v1', source_durable_end_offset=segment['watermark'],
                                      source_durable_bytes_sha256=sha(raw), retained_event_count=len(seqs),
                                      first_sequence_id=first, last_sequence_id=last))
                watermarks.append(dict(physical_segment_id=self.physical_id(segment), durable_end_offset=segment['watermark']))
            active = st.segments[-1]
            issued = [e['sequence_id'] for e in st.events.values()]
            excluded = [dict(first_sequence_id=g['first_sequence_id'], last_sequence_id=g['last_sequence_id'], reason='allocator_lease_abandoned',
                             manifest_evidence_ref=st.lease_key(), manifest_evidence_sha256=row_sha(lease_cell['value']))
                        for g in lease_cell['value']['abandoned']]
            last_event = max(st.events.items(), key=lambda kv: kv[1]['sequence_id'])[0] if st.events else None
            group = None if last_event is None else st.active_durable_group(last_event)
            selection_id = 'pm.storage.selection.v1:' + sha(current_raw)
            allocator_selection = self.selection('seglog_sequence_allocator', st.lease_key(), lease, NATIVE + 'sequence_lease_control')
            entry = dict(selection_id=selection_id, selected_segment_generation=active['generation'],
                         source_generation_ref=current_file['manifest_ref'], birth_operation_ref='TEST_ONLY:storage-birth:' + st.storage_instance_id,
                         entry_kind='live', active_segment_ref=self.physical_id(active), retained_inventory=inventory,
                         namespace_bindings=[], durable_watermarks=watermarks, excluded_ranges=excluded, retired_inputs=[],
                         survivor_prefix_sha256=prefix.hexdigest(), active_durable_group=group,
                         sequence_authority=dict(lease_id=lease['current_lease']['lease_id'],
                                                 lease_first_sequence_id=lease['current_lease']['first_sequence_id'],
                                                 lease_last_sequence_id=lease['current_lease']['last_sequence_id'],
                                                 highest_allocated_sequence_id=max(issued + [g['last_sequence_id'] for g in excluded]),
                                                 last_issued_sequence_id=max(issued) if issued else None,
                                                 allocator_control_ref=st.lease_key(),
                                                 allocator_control_sha256=allocator_selection['complete_value_sha256']))
            current = dict(schema_id='pm.storage.seglog_current.v1', schema_version='1.0.0', storage_instance_id=st.storage_instance_id,
                           selection_id=selection_id, selected_segment_generation=active['generation'],
                           birth_operation_ref='TEST_ONLY:storage-birth:' + st.storage_instance_id)
            manifest = dict(schema_id='pm.storage.seglog_manifest.v1', schema_version='1.0.0', storage_instance_id=st.storage_instance_id,
                            manifest_generation=st.manifest_generation, recovery_epoch=st.recovery_epoch, selection_entries=[entry])
            for name, value in (('current', current), ('manifest', manifest), ('sequence_lease_control', lease)):
                self.check('producer', NATIVE + name, value)
            out = dict(current=current, manifest=manifest, sequence_allocator=copy.deepcopy(lease),
                       current_selection=self.selection('storage/seglog', 'storage/seglog/CURRENT', current, NATIVE + 'current'),
                       manifest_selection=self.selection('storage/seglog', 'storage/seglog/manifest.v1.msgpack', manifest, NATIVE + 'manifest'),
                       sequence_selection=allocator_selection)
            slot.set(dict(selection_id=selection_id))
            return out

    def selection(self, family, key, value, schema):
        return dict(family_id=family, physical_key=key, schema_id=value['schema_id'], schema_version=value['schema_version'],
                    codec_id='pm.storage.canonical_msgpack.v1', complete_value_sha256=row_sha(value))


class CodecOwner(WorldOwner):
    """Original codec registrations, pinned by the SHA-256 of the files actually executed."""
    role = 'codec_registry'
    FAMILY = 'TEST_ONLY:codec_registration'

    def register(self):
        w = self.world
        with self.recorder.call(self.owner_id, 'register_codecs') as slot:
            files = dict(goal_json=w.shared.inputs['original_codec'],
                         producer_jcs=NR.N.__file__,
                         event_msgpack=w.shared.inputs['original_storage_codec'],
                         sir_result_jcs=str(ROOT / 'scripts/pm_goal_oracle_common.py'))
            spec = dict(goal_json=('pm.goal.cancel_command_json.v1', 'pm.goal.cancel.source_audit.v1', '1.0.0'),
                        producer_jcs=('pm.contracts.rfc8785_producer_semantic.v1', 'pm.event.v0', '2.0.0'),
                        event_msgpack=('pm.seglog_frame_v2.event_value.canonical_msgpack.v1', 'pm.event.v0', '2.0.0'),
                        sir_result_jcs=('pm.cv333.rfc8785_owner_result.v1', 'pm.goal.cancel.result.v2', '2.0.0'))
            self.resources = []
            writes = []
            for purpose in ('goal_json', 'producer_jcs', 'event_msgpack', 'sir_result_jcs'):
                path = files[purpose]
                require('codec/resource_file/' + purpose, path is not None)
                digest = sha(open(path, 'rb').read())
                codec_id, schema_id, version = spec[purpose]
                ref = uid('TEST_ONLY:codec-registration:' + purpose)
                resource = dict(purpose=purpose, codec_id=codec_id, codec_version='1.0.0', actual_schema_id=schema_id,
                                actual_schema_version=version, original_resource_sha256=digest, original_registration_ref=ref,
                                original_owner_ref=self.owner_id, original_owner_epoch=self.owner_epoch)
                writes.append(w.put(self.FAMILY, ref, dict(schema_id='pm.test_only.codec_registration.v1', schema_version='1.0.0',
                                                           resource=resource, resource_path=str(path))))
                self._issue(None, resource, kind='codec_registration', ref=ref)
                self.resources.append(resource)
            w.write(writes)
            slot.set(dict(count=4))
            return copy.deepcopy(self.resources)

    def current(self):
        out = []
        for resource in self.resources:
            stored = self.world.value(self.FAMILY, resource['original_registration_ref'])
            require('codec/registration_unavailable', stored is not None)
            require('codec/resource_drift/' + resource['purpose'],
                    sha(open(stored['resource_path'], 'rb').read()) == stored['resource']['original_resource_sha256'])
            out.append(copy.deepcopy(stored['resource']))
        return out


# ------------------------------------------------------------------ encoding template

def term(value):
    """A closed EncodingTerm literal tree for a fixed original value (keys in UTF-8 order)."""
    if value is None:
        return dict(term='null')
    if type(value) is bool:
        return dict(term='boolean', value=value)
    if type(value) is int:
        require('template/negative_integer', value >= 0)
        return dict(term='integer', value=value)
    if type(value) is str:
        return dict(term='string', value=value)
    if type(value) is list:
        return dict(term='array', items=[term(v) for v in value])
    if type(value) is dict:
        return dict(term='map', members=[dict(key=k, value=term(value[k])) for k in sorted(value, key=lambda s: s.encode('utf-8'))])
    raise Refusal('template/type')


def evaluate(template, slots):
    kind = template['term']
    if kind == 'null':
        return None
    if kind in ('boolean', 'integer', 'string'):
        return template['value']
    if kind == 'array':
        return [evaluate(t, slots) for t in template['items']]
    if kind == 'map':
        return {m['key']: evaluate(m['value'], slots) for m in template['members']}
    if kind in ('original_sha256', 'original_timestamp'):
        require('template/slot_unbound/' + template['source_slot'], template['source_slot'] in slots)
        return slots[template['source_slot']]
    raise Refusal('template/term')


def slot_paths(template, path=''):
    kind = template['term']
    if kind in ('original_sha256', 'original_timestamp'):
        return [(path, template['source_slot'])]
    out = []
    if kind == 'array':
        for i, t in enumerate(template['items']):
            out += slot_paths(t, '%s/%d' % (path, i))
    if kind == 'map':
        for m in template['members']:
            out += slot_paths(m['value'], path + '/' + m['key'])
    return out


# ------------------------------------------------------------------ assignment owner

class AssignmentOwner(WorldOwner):
    """owner.storage.goal_cancel.reserve_assignment.v1 plus audit, codec admission and reserved append."""
    role = 'append_assignment'

    def h_domain(self, domain, value):
        return sha(domain.encode('ascii') + b'\n' + self.world.codec.raw(value))

    def read_sources(self):
        return self.world.seglog.records()

    def audit_key(self, scope, operation_id, attempt=0):
        return 'goal_cancel_assignment_audit_reference.v1:%s:%s:attempt:%d' % (scoped_key(scope), operation_id.encode('utf-8').hex(), attempt)

    def publish_audit(self, scope, operation_id, audit_wrapper, key):
        """SP-337: the whole audit pack is durable and verified before its reference is written."""
        st = self.storage
        raw = S.canonical(audit_wrapper, 'assignment/audit_pack')
        reference = st.put_pack(raw, AUDIT_MEDIA)
        require('assignment/pack_readback', st.read_pack(reference, expected_media_type=AUDIT_MEDIA) == raw)
        record = dict(scope=copy.deepcopy(scope), operation_id=operation_id, assignment_attempt=audit_wrapper['record']['assignment_attempt'],
                      complete_original_input_commitment=audit_wrapper['record']['complete_original_input_commitment'],
                      audit_schema_ref=BINDING + '#/$defs/StorageAssignmentAudit', audit_value_codec='pm.storage.canonical_msgpack.v1',
                      audit_value_sha256=sha(raw), audit_payload=reference,
                      original_issuer_transaction_id=audit_wrapper['record']['original_issuer']['original_transaction_id'])
        wrapper = dict(schema_id='pm.storage_value.goal_cancel_assignment_audit_reference.v1', schema_version='1.0.0',
                       storage_instance_id=st.storage_instance_id, physical_key=key, record=record)
        SUCCESSOR_BANK.validate(SUCCESSOR + 'StorageAssignmentAuditReference', wrapper, 'assignment/reference')
        exact_numbers(wrapper, 'assignment/reference')
        return wrapper

    def resolve_audit(self, key, *, where='assignment'):
        """Resolve the reference, verify the pack and return the whole validated predecessor audit wrapper."""
        st = self.storage
        cell = st.cell(AUDIT_TABLE, key)
        require(where + '/audit_reference_unavailable', cell is not None)
        reference = cell['value']
        SUCCESSOR_BANK.validate(SUCCESSOR + 'StorageAssignmentAuditReference', reference, where + '/reference')
        raw = st.read_pack(reference['record']['audit_payload'], expected_media_type=AUDIT_MEDIA)
        require(where + '/audit_value_sha256', sha(raw) == reference['record']['audit_value_sha256'])
        audit = S.decode_canonical(raw, where + '/audit_decode')
        self.world.roots.check('producer', BINDING + '#/$defs/StorageAssignmentAudit', audit)
        exact_numbers(audit, where + '/audit')
        record = audit['record']
        require(where + '/audit_reference_join', record['scope'] == reference['record']['scope']
                and record['operation_id'] == reference['record']['operation_id']
                and record['assignment_attempt'] == reference['record']['assignment_attempt']
                and record['complete_original_input_commitment'] == reference['record']['complete_original_input_commitment']
                and record['original_issuer']['original_transaction_id'] == reference['record']['original_issuer_transaction_id']
                and audit['physical_key'] == reference['physical_key'] and audit['storage_instance_id'] == st.storage_instance_id)
        return reference, audit

    def reservation_source(self, operation_id, reservation, sources, header_len):
        st = self.storage
        segment = next(s for s in st.segments if s['generation'] == reservation['segment_generation'])
        b = reservation['byte_offset']
        sink = (st.root / ('segment-%d.seglog' % segment['generation'])).read_bytes()[:b]
        value = dict(storage_instance_id=st.storage_instance_id, original_operation_id=operation_id,
                     original_native_boot_session_ref=reservation['boot_session'], original_append_owner_ref=self.owner_id,
                     original_append_owner_epoch=self.owner_epoch, original_exclusive_fence_id=reservation['fence_identity'],
                     current=sources['current_selection'], manifest=sources['manifest_selection'], sequence_allocator=sources['sequence_selection'],
                     original_lease_id=sources['sequence_allocator']['current_lease']['lease_id'],
                     reserved_sequence_id=reservation['reserved_sequence_id'], selected_segment_generation=reservation['segment_generation'],
                     selected_manifest_generation=reservation['manifest_generation'],
                     selected_segment_name=segment['name'],
                     selected_segment_physical_id=self.world.seglog.physical_id(segment), byte_offset=b,
                     exact_header_byte_length=header_len,
                     event_value_byte_length_domain=dict(minimum=1, maximum=FULL_PAYLOAD_CAP, step=1),
                     frame_byte_length_domain=dict(minimum=48 + header_len + 1, maximum=48 + header_len + FULL_PAYLOAD_CAP, step=1),
                     durable_end_offset_domain=dict(minimum=b + 48 + header_len + 1, maximum=b + 48 + header_len + FULL_PAYLOAD_CAP, step=1),
                     complete_original_active_sink_sha256=sha(sink),
                     original_reservation_transaction_id=reservation['reservation_transaction_id'])
        return self.check('producer', BINDING + '#/$defs/AppendReservationSource', value)


class AssignedCancel(C1.NoAssociationCancel):
    """C1 route under the execution-binding edition: append only through the reserved assignment.

    Order (GRS-076 stages 2-7, SP-305): C-source, SIR acknowledgement durably read back,
    reserve_append_assignment, issue_assignment_audit, admit_codec_domain, C-stop, receipt,
    settlement, freeze, append_reserved, control, terminal.
    """
    code = 'C4A'

    def __init__(self, world, **kw):
        super().__init__(world, **kw)
        self.fence = None
        self.assignment = None

    # assignment inputs -------------------------------------------------------
    def expected_producer(self):
        """The complete EventRecord producer fixed at C-source (only the receipt hash is a slot)."""
        md = self.source['producer_metadata']
        payload = dict(schema_id=C1.PAYLOAD_SCHEMA, schema_version='3.0.0', **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')},
                       operation_id=self.operation_id, command_instance_id=self.request['command_instance_id'],
                       cancellation_id=self.source['normalized_identity']['operation_id'], revision=self.source['original_body']['revision'],
                       currentness_hash=self.source['original_body']['currentness_hash'], cancel_reason='user_cancelled',
                       user_stop_epoch=NR.uint64(self.source['captured_user_stop_epoch'] + 1, 'C4A/user_stop_epoch'),
                       cancellation_receipt_ref=self.key('goal_cancel_receipt'), cancellation_receipt_sha256=None,
                       source_audit_sha256=self.progress['source_audit_sha256'], cancelled_at_utc=md['occurred_at_utc'])
        return dict(md, payload=payload)

    def encoding_template(self, reservation):
        producer = self.expected_producer()
        tree = term(dict(producer, sequence_id=reservation['reserved_sequence_id'], observed_at_utc='', persisted_at_utc=''))
        for member in tree['members']:
            if member['key'] in ('observed_at_utc', 'persisted_at_utc'):
                member['value'] = dict(term='original_timestamp', source_slot='event.' + member['key'])
            if member['key'] == 'payload':
                for inner in member['value']['members']:
                    if inner['key'] == 'cancellation_receipt_sha256':
                        inner['value'] = dict(term='original_sha256', source_slot='cancellation_receipt_sha256', encoded_utf8_bytes=64)
        return tree

    def numeric_domains(self, reservation_source, control_epoch, pending_count):
        """Plans/goal_cancel_contracts/numeric-paths.json, every derivation from actual sources."""
        inventory = json.loads((ROOT / 'Plans/goal_cancel_contracts/numeric-paths.json').read_text())
        src = self.source
        ack = self.acknowledged
        single = lambda v: [dict(minimum=v, maximum=v, step=1)]
        values = {
            'source_audit.original_body.revision': ('original_integer_plus_offsets', 'source_audit', '/original_body/revision', [0], single(src['original_body']['revision'])),
            'captured+1': ('original_integer_plus_offsets', 'source_audit', '/captured_user_stop_epoch', [1], single(src['captured_user_stop_epoch'] + 1)),
            'after_control': ('original_integer_plus_offsets', 'original_goal_control', '/control_epoch', [2 + pending_count], single(control_epoch + 2 + pending_count)),
            'before_control': ('original_integer_plus_offsets', 'original_goal_control', '/control_epoch', [1 + pending_count], single(control_epoch + 1 + pending_count)),
            'byte_offset': ('original_reserved_domain', 'append_reservation', '/byte_offset', [0], single(reservation_source['byte_offset'])),
            'durable_end': ('original_reserved_domain', 'append_reservation', '/durable_end_offset_domain', [0], [reservation_source['durable_end_offset_domain']]),
            'manifest': ('original_reserved_domain', 'append_reservation', '/selected_manifest_generation', [0], single(reservation_source['selected_manifest_generation'])),
            'segment': ('original_reserved_domain', 'append_reservation', '/selected_segment_generation', [0], single(reservation_source['selected_segment_generation'])),
            'sequence': ('original_reserved_domain', 'append_reservation', '/reserved_sequence_id', [0], single(reservation_source['reserved_sequence_id'])),
            'progress': ('original_finite_progress_set', 'assignment_input', '/original_fixed_progress_epochs', [0], [dict(minimum=0, maximum=7, step=1)]),
            'ack_offset': ('original_integer_plus_offsets', 'original_sir_outcome', '/acknowledgement_frame_offset', [0], single(ack['acknowledgement_frame_offset'])),
            'op_gen': ('original_integer_plus_offsets', 'original_sir_outcome', '/identity/operation_generation', [0], single(ack['identity']['operation_generation'])),
            'topo_gen': ('original_integer_plus_offsets', 'original_sir_outcome', '/identity/topology_generation', [0], single(ack['identity']['topology_generation'])),
            'target_gen': ('original_integer_plus_offsets', 'original_sir_outcome', '/target_generation', [0], single(ack['target_generation'])),
        }

        def pick(row):
            d = row.get('source_derivation') or ''
            path = row['path']
            if path.endswith('plan_version') or path == '/producer_sequence_id':
                return None  # null-only for no_bound_plan / preserved null producer sequence: never 0
            if 'original_body.revision' in d:
                return values['source_audit.original_body.revision']
            if 'captured_user_stop_epoch + 1' in d:
                return values['captured+1']
            if 'control_epoch + 2' in d:
                return values['after_control']
            if 'control_epoch + 1' in d:
                return values['before_control']
            for key, marker in (('byte_offset', 'byte_offset singleton'), ('durable_end', 'durable_end_offset_domain'),
                                ('manifest', 'selected_manifest_generation'), ('segment', 'selected_segment_generation'),
                                ('sequence', 'reserved_sequence_id'), ('progress', 'original_fixed_progress_epochs'),
                                ('ack_offset', 'acknowledgement_frame_offset'), ('op_gen', 'operation_generation'),
                                ('topo_gen', 'topology_generation'), ('target_gen', 'target_generation')):
                if marker in d:
                    return values[key]
            raise Refusal('assignment/numeric_derivation_unmapped/' + path)

        out = []
        for row in inventory['derivation_inventory']:
            chosen = pick(row)
            if chosen is None:
                continue
            kind, role, pointer, offsets, domains = chosen
            out.append(dict(target=TARGETS[row['root']], schema_branch=row['root'], json_pointer=row['path'], values=domains,
                            original_derivation=dict(kind=kind, source_role=role, source_json_pointer=pointer, additive_offsets=offsets)))
        sequence = values['sequence']
        out.append(dict(target='event_value', schema_branch='EventRecord', json_pointer='/sequence_id', values=sequence[4],
                        original_derivation=dict(kind=sequence[0], source_role=sequence[1], source_json_pointer=sequence[2], additive_offsets=sequence[3])))
        out.sort(key=lambda r: (r['target'], r['schema_branch'], r['json_pointer'].encode('utf-8')))
        return out

    def stored_selection(self, family, key):
        cell = self.world.cell(family, key)
        require('C4A/selection_unavailable/' + family, cell is not None)
        value = cell['value']
        return dict(family_id=family, physical_key=key, schema_id=value['schema_id'], schema_version=value['schema_version'],
                    codec_id='pm.storage.canonical_msgpack.v1', complete_value_sha256=row_sha(value))

    # reserve_append_assignment ------------------------------------------------
    def reserve_append_assignment(self):
        w = self.world
        with self.call('reserve_append_assignment') as slot:
            entry = self.observe_sources()
            self._require_progress('reserve_append_assignment', ('source_admitted',))
            require('C4A/reserve_append_assignment/writer_cutoff', w.binding.domain_withdrawn is False)
            outcome = w.value(w.sir.OUTCOME, self.request['command_instance_id'])
            require('C4A/reserve_append_assignment/acknowledgement_readback', outcome is not None
                    and outcome['record']['outcome'] in ('acknowledged', 'executing')
                    and outcome['record']['acknowledgement_receipt_ref'] is not None)
            require('C4A/reserve_append_assignment/acknowledged_identity',
                    outcome['record']['identity']['operation_id'] == self.source['normalized_identity']['operation_id']
                    and outcome['record']['dispatch_frame_id'] == self.source['normalized_identity']['dispatch_frame_id'])
            self.acknowledged = copy.deepcopy(outcome['record'])
            sources = w.assigner.read_sources()
            self.at('reserve_append_assignment', 'after_seglog_read')
            self.recheck('reserve_append_assignment', 'after_seglog_read', entry)
            self.check('AppendSourceRead', sources, BINDING)
            self.append_source_read = copy.deepcopy(sources)
            producer = self.expected_producer()
            header = S.event_header(dict(producer, sequence_id=0, observed_at_utc='x', persisted_at_utc='x'))
            header_len = len(S.canonical(header))
            require('C4A/reserve_append_assignment/header_cap', header_len <= 4096)
            self.at('reserve_append_assignment', 'final')
            self.recheck('reserve_append_assignment', 'final', entry)
            self.append_request = dict(kind='TEST_ONLY:goal.cancelled.reserved_append', operation_id=self.operation_id,
                                       source_audit_sha256=self.progress['source_audit_sha256'])
            handle, fence, reservation = w.storage.reserve_assignment(self.operation_id, self.append_request)
            self.reservation_handle, self.fence, self.reservation_record = handle, fence, reservation
            self.reservation_source = w.assigner.reservation_source(self.operation_id, reservation, sources, header_len)
            slot.set(dict(sequence=reservation['reserved_sequence_id'], offset=reservation['byte_offset']))
            return copy.deepcopy(self.reservation_source)

    # issue_assignment_audit ---------------------------------------------------
    def issue_assignment_audit(self):
        w = self.world
        with self.call('issue_assignment_audit') as slot:
            entry = self.observe_sources()
            self._require_progress('issue_assignment_audit', ('source_admitted',))
            require('C4A/issue_assignment_audit/reservation', self.fence is not None and w.storage.fence is self.fence)
            stored = w.storage.reservation_record(self.operation_id)
            require('C4A/issue_assignment_audit/reservation_custody', stored is not None and stored['state'] == 'reserved'
                    and stored['reserved_sequence_id'] == self.reservation_source['reserved_sequence_id']
                    and stored['byte_offset'] == self.reservation_source['byte_offset'])
            control = w.goal.control(self.scope)['value']['record']
            pending_count = 1 if control['pending'] is not None else 0
            codecs = w.codecs.current()
            self.at('issue_assignment_audit', 'after_codec_read')
            self.recheck('issue_assignment_audit', 'after_codec_read', entry)
            template = self.encoding_template(self.reservation_record)
            domains = self.numeric_domains(self.reservation_source, control['control_epoch'], pending_count)
            outcome_key = self.request['command_instance_id']
            assignment_input = self.check('AssignmentInput', dict(scope=copy.deepcopy(self.scope), operation_id=self.operation_id,
                assignment_attempt=0, source_audit=self.stored_selection('goal_cancel_source_audit', self.key('goal_cancel_source_audit')),
                binding_selection=self.stored_selection('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection')),
                original_acknowledged_outcome_source=self.stored_selection(w.sir.OUTCOME, outcome_key),
                original_acknowledged_outcome=copy.deepcopy(self.acknowledged), original_append_reservation=copy.deepcopy(self.reservation_source),
                exact_event_encoding_template=template, numeric_path_domains=domains, codec_resources=codecs,
                original_initial_control_epoch=control['control_epoch'], original_pending_resolution_count=pending_count,
                original_fixed_progress_epochs=[0, 1, 2, 3, 4, 5, 6, 7]), BINDING)
            commitment = w.assigner.h_domain('pm.goal.cancel.assignment_input.v1', assignment_input)
            issuer = C1.transaction_record(w.assigner, 'owner.storage.goal_cancel.issue_assignment_audit.v1', self.operation_id,
                                           w.permissions.selection(self.cancel_decision), uid('TEST_ONLY:assignment-audit-tx'),
                                           self.reservation_source['original_reservation_transaction_id'])
            audit = self.check('AssignmentAudit', dict(assignment_input, complete_original_input_commitment=commitment, original_issuer=issuer), BINDING)
            key = w.assigner.audit_key(self.scope, self.operation_id, 0)
            audit_wrapper = C1.wrapper(w, BINDING, 'StorageAssignmentAudit', audit, key)
            self.inline_audit_bytes = len(S.canonical(audit_wrapper))
            self.at('issue_assignment_audit', 'final')
            self.recheck('issue_assignment_audit', 'final', entry)
            require('C4A/issue_assignment_audit/fence_final', w.storage.fence is self.fence)
            require('C4A/issue_assignment_audit/audit_absent', w.cell(AUDIT_TABLE, key) is None)
            reference = w.assigner.publish_audit(self.scope, self.operation_id, audit_wrapper, key)
            tx = w.write([w.put(AUDIT_TABLE, key, reference)])
            self.assignment_input, self.assignment_audit, self.audit_key = assignment_input, audit, key
            slot.set(dict(tx=tx['tx_id'], commitment=commitment))
            return copy.deepcopy(audit)

    # admit_codec_domain ---------------------------------------------------------
    def admit_codec_domain(self):
        w = self.world
        with self.call('admit_codec_domain') as slot:
            entry = self.observe_sources()
            self._require_progress('admit_codec_domain', ('source_admitted',))
            require('C4A/admit_codec_domain/fence', self.fence is not None and w.storage.fence is self.fence)
            _, stored = w.assigner.resolve_audit(self.audit_key, where='C4A/admit_codec_domain')
            require('C4A/admit_codec_domain/audit_custody', same(stored['record'], self.assignment_audit))
            recomputed = w.assigner.h_domain('pm.goal.cancel.assignment_input.v1',
                                             {k: v for k, v in stored['record'].items() if k not in ('complete_original_input_commitment', 'original_issuer')})
            require('C4A/admit_codec_domain/input_commitment', recomputed == stored['record']['complete_original_input_commitment'])
            require('C4A/admit_codec_domain/codec_resources', same(stored['record']['codec_resources'], w.codecs.current()))
            route = 'exact_existing_codec_route'
            for domain in stored['record']['numeric_path_domains']:
                if domain['target'] in ('producer_semantic_digest', 'goal_cancel_result'):
                    for interval in domain['values']:
                        if interval['maximum'] > (1 << 53):
                            route = 'unsupported_existing_codec_route'
            for interval in (d for row in stored['record']['numeric_path_domains'] for d in row['values']):
                require('C4A/admit_codec_domain/interval', interval['minimum'] <= interval['maximum']
                        and (interval['maximum'] - interval['minimum']) % interval['step'] == 0)
            self.at('admit_codec_domain', 'final')
            self.recheck('admit_codec_domain', 'final', entry)
            selection = self.stored_selection(AUDIT_TABLE, self.audit_key)
            domain_input = self.check('DomainCommitmentInput', dict(assignment=selection, numeric_path_domains=stored['record']['numeric_path_domains'],
                codec_resources=stored['record']['codec_resources'], exact_event_encoding_template=stored['record']['exact_event_encoding_template']), BINDING)
            admission = self.check('AssignmentAdmission', dict(assignment=selection,
                full_domain_sha256=w.assigner.h_domain('pm.goal.cancel.assignment_domain.v1', domain_input),
                native_fence_identity=self.fence.identity, original_operation_id=self.operation_id, codec_route=route), BINDING)
            require('C4A/admit_codec_domain/codec_route', route == 'exact_existing_codec_route')
            self.domain_input, self.assignment = domain_input, admission
            slot.set(dict(route=route))
            return copy.deepcopy(admission)

    # append_reserved ------------------------------------------------------------
    def append_original(self, *, lose_ack=False, candidate_edit=None):
        """append_reserved: the frozen producer under the held, unused reservation only."""
        w = self.world
        with self.call('append_reserved') as slot:
            entry = self.observe_sources()
            self._require_progress('append_reserved', ('event_ready',))
            require('C4A/append_reserved/writer_cutoff', w.binding.domain_withdrawn is False)
            require('C4A/append_reserved/admission', self.assignment is not None)
            _, stored = w.assigner.resolve_audit(self.audit_key, where='C4A/append_reserved')
            require('C4A/append_reserved/audit_custody', same(stored['record'], self.assignment_audit))
            selection = self.stored_selection(AUDIT_TABLE, self.audit_key)
            domain_input = dict(self.domain_input, assignment=selection)
            require('C4A/append_reserved/full_domain', w.assigner.h_domain('pm.goal.cancel.assignment_domain.v1', domain_input)
                    == self.assignment['full_domain_sha256'])
            producer = copy.deepcopy(self.progress['producer_input'])
            if candidate_edit is not None:
                producer = candidate_edit(producer)
            require('C4A/append_reserved/frozen_producer', same(producer, self.progress['producer_input']))
            receipt_cell = w.value('goal_cancel_receipt', self.key('goal_cancel_receipt'))
            slots_pre = dict(cancellation_receipt_sha256=row_sha(receipt_cell))
            template = stored['record']['exact_event_encoding_template']
            predicted = evaluate(template, dict(slots_pre, **{'event.observed_at_utc': None, 'event.persisted_at_utc': None}))
            expected_template = {k: v for k, v in predicted.items() if k not in ('sequence_id', 'observed_at_utc', 'persisted_at_utc')}
            require('C4A/append_reserved/template_keyset', set(expected_template) == set(producer))
            require('C4A/append_reserved/template_producer', same(expected_template, producer))
            self.at('append_reserved', 'final')
            self.recheck('append_reserved', 'final', entry)
            require('C4A/append_reserved/fence_final', self.fence is not None and w.storage.fence is self.fence)
            events, reservation, outcome = w.appender.append_original(self.operation_id, self.append_request, [producer],
                                                                     durability_class='barrier')
            self.reservation = reservation
            if lose_ack:
                progress = self._progress('event_unknown', publication=None)
                w.write(self._progress_writes(progress))
                self.progress = progress
                slot.set(dict(lost_ack=True))
                return None
            stored_event = w.appender.event(events[0])
            # Only the Storage sequence (and the two Storage times) may differ from the fixed template.
            actual = evaluate(template, dict(slots_pre, **{'event.observed_at_utc': stored_event['observed_at_utc'],
                                                           'event.persisted_at_utc': stored_event['persisted_at_utc']}))
            require('C4A/append_reserved/template_event', same(actual, stored_event))
            publication, _ = self.publication_from_custody(stored_event['event_id'])
            self.check_domain_membership(publication, stored['record']['numeric_path_domains'])
            progress = self._progress('event_issued', publication=publication)
            tx = w.write(self._progress_writes(progress))
            self.progress = progress
            self.fence = None
            slot.set(dict(tx=tx['tx_id'], event_id=stored_event['event_id'], sequence_id=stored_event['sequence_id']))
            return copy.deepcopy(publication)

    def check_domain_membership(self, publication, domains):
        receipt = publication['first_append_receipt']
        require('C4A/append_reserved/selected_segment_name', receipt['segment_name'] == self.reservation_source['selected_segment_name'])
        index = {(d['schema_branch'], d['json_pointer']): d['values'] for d in domains}
        for field in ('sequence_id', 'byte_offset', 'durable_end_offset', 'manifest_generation', 'segment_generation'):
            value = receipt[field]
            intervals = index[('SucceededResult', '/publication/first_append_receipt/' + field)]
            require('C4A/append_reserved/domain/' + field, any(i['minimum'] <= value <= i['maximum']
                                                                and (value - i['minimum']) % i['step'] == 0 for i in intervals))

    def run(self, until='terminal'):
        steps = [('capture_source', self.capture_source), ('reserve_append_assignment', self.reserve_append_assignment),
                 ('issue_assignment_audit', self.issue_assignment_audit), ('admit_codec_domain', self.admit_codec_domain),
                 ('latch_and_reserve', self.latch_and_reserve), ('commit_receipt', self.commit_receipt),
                 ('settle_owner', self.settle_owner), ('freeze_event', self.freeze_event), ('append_reserved', self.append_original),
                 ('publish_control', self.publish_control), ('terminal', self.terminal)]
        if getattr(self, 'request', None) is None:
            self.dispatch(self.user_request())
        for name, step in steps:
            step()
            if name == until:
                break
        return self


def prior_history(world):
    """A genuine unrelated earlier Event in the same Storage (another owner's scope)."""
    candidate = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
                     event_id=uid('TEST_ONLY:goal_test.prior'), event_type='goal_test.prior_history',
                     project_id=uid('TEST_ONLY-project-prior'), thread_id=None, run_id=None, node_id=None, attempt_id=None,
                     actor_ref=uid('TEST_ONLY:actor'), requested_account_ref=None, effective_account_ref=None,
                     occurred_at_utc=world.sir.clock.now(), producer_sequence_id=None, correlation_id=uid('TEST_ONLY:correlation'),
                     causation_event_id=None, parent_event_id=None, idempotency_key=uid('TEST_ONLY:prior-key'),
                     payload_schema_id='TEST_ONLY:goal_test.prior_history.v1', payload=dict(qualification=QUALIFICATION),
                     payload_ref=None, redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
                     migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                                    compatibility_event_type=None))
    world.appender.append_original(uid('TEST_ONLY:prior-operation'), dict(kind='prior'), [candidate])
    return candidate['event_id']


def assigned_world(work, **kw):
    """A World whose Storage is the lease-aware subclass, with codecs registered and prior history."""
    import pm_goal_dg_ca_owners as O
    world = O.World(work, storage_cls=LeasedStorage, **kw)
    world.seglog = SeglogControlOwner(world)
    world.codecs = CodecOwner(world)
    world.assigner = AssignmentOwner(world)
    world.codecs.register()
    prior_history(world)
    return world
