#!/usr/bin/env python3
"""TEST_ONLY generic source acquisition, custody, index and reducer adapter.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

It extends the pinned SeglogFrameV2 / canonical MessagePack codec component
(pm_goal_test_storage frame codec over the shared pm_event_numbers calls) into
the whole-source path S3, R5, CF-10 and P4 need:

1. ``acquire`` takes one Storage source snapshot (CURRENT, manifest, every
   retained segment's durable bytes, retention gap dispositions, private first
   custody, the nine-field durable token and a transient snapshot id) and
   recomputes every token field from those bytes instead of trusting it.
2. Every frame of every scope and family is validated in global order before
   any off-run filtering: magic/CRC/caps/canonical MessagePack/whole
   EventRecord/header-envelope identity, SP-347 commit membership and tiling,
   strictly increasing sequences across segments, and gaps covered only by
   retention-owner dispositions recorded in Storage's own state.
3. The index rows (event id, sequence, segment, offset, length, frame SHA-256,
   scope partition, type, key, receipt, group digest) are rebuilt
   independently and compared with first custody field by field.
4. ``project`` runs a family reducer over the validated prefix. Off-run rows
   are no-ops only after validation; coverage is the global prefix, never a
   filtered maximum; a defect halts before itself and the frontier never
   advances over it.

Native retention authentication and physical log custody remain NOT_RUN.
"""
from __future__ import annotations

import copy
from dataclasses import dataclass, field
import hashlib

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE


class SourceRefusal(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


class Halt(Exception):
    """Reducer refusal for one row; the projection stops before it."""

    def __init__(self, code):
        super().__init__(code)
        self.code = code


def require(code, condition):
    if not condition:
        raise SourceRefusal(code)


@dataclass
class Row:
    position: int
    event_id: str
    sequence_id: int
    segment_generation: int
    offset: int
    length: int
    frame_sha256: str
    scope_partition: str
    event_type: str
    idempotency_key: str
    receipt: dict
    group_digest: str
    event: dict
    custody: dict | None


@dataclass
class SourceSnapshot:
    qualification: str
    storage_instance_id: str
    snapshot_id: str
    token: dict
    rows: list = field(default_factory=list)
    gaps: list = field(default_factory=list)
    defect: tuple | None = None
    coverage_sha256: str = ''

    @property
    def complete(self):
        return self.defect is None


def _recompute_token(storage_token, src, state):
    """Recompute byte-derived token fields from the acquired snapshot."""
    sel = storage_token['source_selection']
    current = S.decode_canonical(src['current_raw'], 'source/current')
    require('source/current_hash', S.sha256(src['current_raw']) == sel['current_bytes_sha256'])
    require('source/manifest_hash', S.sha256(src['manifest_raw']) == sel['manifest_bytes_sha256'])
    require('source/current_manifest_join', S.sha256(src['manifest_raw']) == current['manifest_sha256'])
    require('source/manifest_generation', state['manifest_generation'] == sel['manifest_generation']
            == current['manifest_generation'])
    live = [s for s in state['segments'] if not s['retired']]
    require('source/segment_inventory', [[s['generation'], s['name'], s['watermark']] for s in live] ==
            [[s['generation'], s['name'], s['watermark']] for s in src['segments']])
    inventory = [[s['generation'], s['name'], s['watermark'], S.sha256(s['raw'])] for s in src['segments']]
    require('source/retained_inventory', S.sha256(S.binding(inventory)) == sel['retained_inventory_sha256'])
    require('source/watermarks', S.sha256(S.binding([[s['generation'], s['name'], s['watermark']]
                                                     for s in live])) == sel['durable_watermarks_sha256'])
    require('source/retired_inputs', S.sha256(S.binding(
        [[g['segment_generation'], g['first_sequence'], g['last_sequence'], g['proof_sha256']]
         for g in state['gaps']])) == sel['retired_inputs_sha256'])
    require('source/recovery_epoch', state['recovery_epoch'] == sel['recovery_epoch'])
    for field_ in ('frontier_revision',):
        require('source/token/' + field_, state['index_frontier_revision'] == storage_token[field_])


class GenericSource:
    """Generic source adapter bound to one registered TEST_ONLY Storage."""

    qualification = QUALIFICATION

    def __init__(self, storage):
        require('source/storage_type', isinstance(storage, S.TestOwnerStorage))
        self.storage = storage

    def acquire(self, snapshot=None):
        src = snapshot if snapshot is not None else self.storage.acquire_source()
        require('source/qualification', src.get('qualification') == QUALIFICATION)
        require('source/storage_instance', src['storage_instance_id'] == self.storage.storage_instance_id)
        state = S.decode_canonical(src['manifest_raw'], 'source/manifest')
        require('source/manifest_instance', state['storage_instance_id'] == src['storage_instance_id'])
        token = src['token']
        _recompute_token(token, src, state)
        gaps = state['gaps']
        for gap in gaps:
            require('source/gap_proof', S.RetentionOwner.verify(gap))
            require('source/gap_owner', gap['retention_owner_id'] ==
                    'TEST_ONLY:retention-owner:' + src['storage_instance_id'])
        require('source/gap_inventory', src['gaps'] == gaps)
        retired = {g['segment_generation']: g for g in gaps}
        require('source/retired_segments_proved', all(s['generation'] in retired
                                                      for s in state['segments'] if s['retired']))
        out = SourceSnapshot(QUALIFICATION, src['storage_instance_id'], src['snapshot_id'], copy.deepcopy(token),
                             gaps=copy.deepcopy(gaps))
        prior = None
        position = 0
        coverage = hashlib.sha256(b'pm.goal_test.generic_coverage.v1\0')
        ordered = sorted([('segment', s['generation'], s) for s in src['segments']] +
                         [('gap', g['segment_generation'], g) for g in gaps], key=lambda x: x[1])
        for kind, generation, item in ordered:
            if kind == 'gap':
                require('source/gap_order', prior is None or item['first_sequence'] > prior)
                prior = item['last_sequence']
                coverage.update(S.binding(['gap', generation, item['first_sequence'], item['last_sequence'],
                                           item['proof_sha256']]))
                continue
            scan = S.scan_segment(item['raw'], generation=generation, name=item['name'],
                                  storage_instance_id=src['storage_instance_id'], prior_sequence=prior)
            for group in scan['groups']:
                for frame, receipt in zip(group['frames'], group['receipts']):
                    event = frame.value
                    custody = src['custody'].get(event['event_id'])
                    row = Row(position, event['event_id'], frame.sequence_id, generation, frame.offset,
                              frame.length, S.sha256(frame.raw), S.scope_partition(event), event['event_type'],
                              event['idempotency_key'], receipt, group['digest'], event,
                              copy.deepcopy(custody))
                    defect = self._custody_defect(row)
                    if defect:
                        out.defect = (defect, position, event['event_id'])
                        out.coverage_sha256 = coverage.hexdigest()
                        return out
                    out.rows.append(row)
                    coverage.update(S.binding([row.event_id, row.sequence_id, generation, row.offset,
                                               row.frame_sha256]))
                    position += 1
                if group['frames']:
                    prior = group['frames'][-1].sequence_id
            if scan['tail'] is not None or scan['watermark'] != len(item['raw']):
                code = scan['tail'][1] if scan['tail'] else 'watermark'
                out.defect = ('source/frame/' + code, position, None)
                out.coverage_sha256 = coverage.hexdigest()
                return out
        seen = set()
        for row in out.rows:
            key = (row.scope_partition, row.event_type, row.idempotency_key)
            if row.event_id in seen or key in seen:
                out.defect = ('source/duplicate_identity', row.position, row.event_id)
                out.rows = out.rows[:row.position]
                break
            seen.add(row.event_id)
            seen.add(key)
        out.coverage_sha256 = coverage.hexdigest()
        return out

    def _custody_defect(self, row):
        """First custody must equal the frame-derived receipt, digest and commitment."""
        c = row.custody
        if c is None:
            return None  # pending custody: present in the log, not yet first-receipted
        try:
            if c['event_id'] != row.event_id or c['first_append_receipt'] != row.receipt:
                return 'source/custody_receipt'
            if c['group_digest'] != row.group_digest:
                return 'source/custody_group_digest'
            if c['scope_partition'] != row.scope_partition or c['event_type'] != row.event_type or \
                    c['idempotency_key'] != row.idempotency_key:
                return 'source/custody_identity'
            if c['original_event_value_commitment']['sha256'] != NR.full_value_commitment(row.event, 'source'):
                return 'source/custody_commitment'
            if c['producer_semantic_digest'] != NR.producer_digest(row.event, 'source'):
                return 'source/custody_producer_digest'
            if c['storage_instance_id'] != self.storage.storage_instance_id:
                return 'source/custody_storage'
        except (KeyError, TypeError, NR.NumruleRefusal):
            return 'source/custody_shape'
        return None

    def project(self, snapshot, reducer, *, select, require_custody=True):
        """Run a bounded reducer over the validated global prefix."""
        require('project/snapshot_type', isinstance(snapshot, SourceSnapshot))
        require('project/storage', snapshot.storage_instance_id == self.storage.storage_instance_id)
        state = reducer.initial()
        frontier = None
        processed = 0
        halt = None
        for row in snapshot.rows:
            if require_custody and row.custody is None:
                halt = ('project/pending_custody', row.position, row.event_id)
                break
            if select(row.event):
                try:
                    state = reducer.step(copy.deepcopy(state), copy.deepcopy(row.event), copy.deepcopy(row.custody))
                except Halt as error:
                    halt = (error.code, row.position, row.event_id)
                    break
            frontier = row.sequence_id
            processed += 1
        if halt is None and snapshot.defect is not None:
            halt = snapshot.defect
        return dict(qualification=QUALIFICATION, state=state, frontier_sequence=frontier, processed=processed,
                    complete=halt is None, halt=halt, coverage_sha256=snapshot.coverage_sha256,
                    token=copy.deepcopy(snapshot.token), gap_count=len(snapshot.gaps))


class LifecycleReducer:
    """TEST_ONLY sample reducer: started then one terminal per run, others halt.

    Families supply their own owner reducer; this one exists to test the
    adapter's halting, no-op and frontier behaviour.
    """

    def __init__(self, run_id, supported=('goal_test.started', 'goal_test.cancelled', 'goal_test.certified')):
        self.run_id = run_id
        self.supported = supported

    def initial(self):
        return dict(qualification=QUALIFICATION, run_id=self.run_id, status=None, events=[])

    def step(self, state, event, custody):
        kind = event['event_type']
        if kind not in self.supported:
            raise Halt('reducer/unsupported_same_run:' + kind)
        if kind == 'goal_test.started':
            if state['status'] is not None:
                raise Halt('reducer/duplicate_start')
            state['status'] = 'started'
        else:
            if state['status'] != 'started':
                raise Halt('reducer/terminal_without_start')
            state['status'] = kind.split('.')[-1]
        state['events'].append([event['event_id'], event['sequence_id'], custody['group_digest']])
        return state
