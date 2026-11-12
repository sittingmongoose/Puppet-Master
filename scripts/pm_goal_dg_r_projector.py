#!/usr/bin/env python3
"""DG-R TEST_ONLY combined started+cancelled projector and readers (R4-R6).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

The projector is the CV-1136-selected ``project_prefix.reference.v1`` of the
cancelled projection-reference successor (cancelled.md). It acquires the whole
generic source through ``pm_goal_test_source.GenericSource`` (every frame of
every scope validated in global order before off-run filtering), acquires the
retained Start and cancellation originals through the passive consumer
(registry handles, Storage commitments, whole roots), runs the bounded
combined reducer, builds the complete CombinedProjection row and
LogicalCheckpoint, selects the inline / event_reference / record_reference row
form and the inline / payload-reference checkpoint form by the 16 KiB measure
of each complete stored row and complete operation, writes SP-337 packs before
any referencing record, and publishes row and checkpoint in ONE Storage
transaction under full-token, checkpoint and row CAS. Generations are staged,
rebuilt from the full prefix and cut over atomically (at most three). Keys use
K(s) = unpadded base64url of exact UTF-8 (SP-312). Readers decode the stored
forms back into the identical original record, recheck every original
predicate, acquire current sources freshly at entry and at the final boundary,
and never write.
"""
from __future__ import annotations

import base64
import copy
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_source as GS
import pm_goal_test_owner_adapters as A
import pm_goal_dg_r_world as W
import pm_goal_dg_r_readers as R
from pm_goal_dg_r_world import guard, same, physical_sha256

QUALIFICATION = 'TEST_ONLY'
CAP = S.STORED_PART_CAP
PHYSICAL = json.loads((W.ROOT / 'Plans/goal_run_projection_reference_contracts/cancelled.physical.json').read_text())
ROW_PREFIX = 'goal_run_projection.started_cancelled.reference.v1'
CHECKPOINT_PREFIX = 'goal_run_started_cancelled_checkpoint.reference.v1'
PROFILE = 'goal_run_started_cancelled_projector.reference.v1'
RETIRE_SECONDS = 604800
MAX_GENERATIONS = 3
SUPPORTED_SAME_RUN = ('goal_run.started', 'goal_run.cancelled')


def eq(code, a, b):
    guard(code, same(a, b))


def size(value):
    return len(NR.event_value_bytes(value, 'projector/size'))


LOG_SELECTION = ('storage_instance_id', 'current_ref', 'selected_segment_generation', 'manifest_ref', 'recovery_epoch',
                 'manifest_survivor_prefix_sha256', 'retained_inventory_sha256', 'durable_watermarks_sha256',
                 'excluded_ranges_sha256', 'retired_inputs_sha256')


def log_token(token):
    """Log-derived members of the nine-field durable token.

    TOOL ISSUE (recorded for the adapter batch): the shared test Storage keeps
    cells and the log behind ONE manifest, so every cell write (a seed, a pack,
    this projector's own row) changes current_bytes_sha256,
    manifest_bytes_sha256, manifest_generation and the adapter's
    manifest-numbered checkpoint_ref. Native redb cells do not
    change the seglog CURRENT/manifest. CAS and cutover therefore compare every
    other token member exactly, plus the frame-derived coverage.
    """
    out = {k: copy.deepcopy(v) for k, v in token.items() if k not in ('source_selection', 'checkpoint_ref')}
    out['source_selection'] = {k: token['source_selection'][k] for k in LOG_SELECTION}
    return out


def row_key(scope):
    return ROW_PREFIX + ':' + S.k_component(scope['project_id']) + ':' + S.k_component(scope['goal_run_id'])


def checkpoint_key(scope):
    return CHECKPOINT_PREFIX + ':' + ':'.join(S.k_component(scope[k]) for k in
                                              ('storage_instance_id', 'project_id', 'goal_id', 'goal_run_id'))


def dataset(generation_id):
    return ROW_PREFIX + '@' + generation_id


def same_run(event, scope):
    if not event['event_type'].startswith('goal_run.') or event.get('project_id') != scope['project_id']:
        return False
    payload = event.get('payload') or {}
    inner = payload.get('payload') if isinstance(payload.get('payload'), dict) else {}
    return scope['goal_run_id'] in (payload.get('goal_run_id'), inner.get('goal_run_id'))


class CombinedReducer:
    """Bounded started+cancelled reducer over one run (SP-312 v4)."""

    def __init__(self, projector, scope, starts, cancellations):
        self.p, self.scope, self.starts, self.cancellations = projector, scope, starts, cancellations

    def initial(self):
        return dict(qualification=QUALIFICATION, status=None, record=None, event_id=None, sequence_id=None)

    def step(self, state, event, custody):
        kind = event['event_type']
        if kind not in SUPPORTED_SAME_RUN:
            raise GS.Halt('reducer/unsupported_same_run')
        if kind == 'goal_run.started':
            if state['status'] is not None:
                raise GS.Halt('reducer/duplicate_start')
            start = next((s for s in self.starts if s['commit']['record']['event_id'] == event['event_id']), None)
            if start is None:
                raise GS.Halt('reducer/start_without_native_start')
            self.p.check_start_event(start, event, custody)
            state.update(status='started', record=self.p.started_record(start, event, custody))
        else:
            if state['status'] == 'cancelled':
                raise GS.Halt('reducer/second_terminal')
            native = next((c for c in self.cancellations
                           if c['result']['record']['append_receipt']['event_id'] == event['event_id']), None)
            if native is None:
                raise GS.Halt('reducer/cancel_without_native_cancellation')
            kind_ = native['original_start']['kind']
            if state['status'] is None and kind_ != 'original_initialized_no_start':
                raise GS.Halt('reducer/cancel_without_start')
            if state['status'] == 'started' and kind_ != 'original_started':
                raise GS.Halt('reducer/start_cause_mismatch')
            self.p.check_cancel_event(native, event, custody)
            state.update(status='cancelled', record=self.p.cancelled_record(native, event, custody))
        state.update(event_id=event['event_id'], sequence_id=event['sequence_id'])
        return state


class Projector:
    """TEST_ONLY projector participant for one run's combined projection."""

    ROOT_PREFIX = W.PR
    NAMES = {}
    PROFILE = PROFILE
    GENERATION_PREFIX = 'grscg_'
    CHECKPOINT_SCHEMA_ID = 'pm.goal_run_started_cancelled_checkpoint.reference.v1'

    def root(self, name):
        return self.ROOT_PREFIX + self.NAMES.get(name, name)

    def row_key(self, scope):
        return row_key(scope)

    def checkpoint_key(self, scope):
        return checkpoint_key(scope)

    def dataset(self, generation_id):
        return dataset(generation_id)

    def __init__(self, world):
        self.world = world
        self.roots = world.roots
        self.consumer = R.Consumer(world)
        self.owner_id = 'TEST_ONLY:projector:goal_run_started_cancelled:' + world.sid
        self.withdrawn = False
        self.reader_withdrawn = False
        self.hooks = {}

    def hook(self, name):
        fn = self.hooks.get(name)
        if fn is not None:
            fn(self.world, self)

    # -- sources ---------------------------------------------------------------------
    def acquire(self):
        """Whole generic source (global prefix) plus retained originals."""
        w = self.world
        source = GS.GenericSource(w.storage)
        snapshot = source.acquire()
        presentation = R.Presentation(w)
        starts = []
        if w.start_cause['kind'] == 'original_started':
            starts.append({k: copy.deepcopy(self.consumer.acquire(v)[1]) for k, v in presentation.start.items() if k != 'kind'})
        cancellations, goal, effects = [], [], []
        if presentation.cancellation is not None and not getattr(w, 'preserved', False):
            native, goal, effects = self.consumer.assemble(self.consumer.tuple(presentation))
            self.consumer.check(R.request_of(w) if hasattr(R, 'request_of') else self.request(), native, goal, effects)
            cancellations.append(native)
        return source, snapshot, starts, cancellations, goal, effects

    def request(self):
        w = self.world
        return dict(scope={k: w.scope[k] for k in ('storage_instance_id', 'project_id', 'goal_id', 'goal_run_id')},
                    storage_instance_id=w.sid)

    def generic_snapshot(self, snapshot, checkpoint_logical):
        """GenericSnapshot from the adapter's actual frames, custody and token."""
        w, sd = self.world, self.world.seeder
        frames = []
        for row in snapshot.rows:
            frame = sd.seed('native_consumer', W.C + 'GenericFrame')
            w.bind(frame)
            event, custody = row.event, row.custody
            frame['index_row'].update(
                scope_kind=event['scope_kind'], project_id=event['project_id'], scope_partition=row.scope_partition,
                sequence_id=row.sequence_id, event_id=row.event_id, event_type=row.event_type,
                source_locator=dict(segment_generation=row.segment_generation, segment_name='segment-%d' % row.segment_generation,
                                    byte_offset=row.offset, sequence_id=row.sequence_id),
                payload_sha256=NR.full_value_commitment(event, 'index/payload'),
                producer_semantic_digest=NR.producer_digest(event, 'index/producer'),
                idempotency_key=event['idempotency_key'], correlation_id=event['correlation_id'],
                causation_event_id=event['causation_event_id'], persisted_at_utc=event['persisted_at_utc'],
                redaction_profile=event['redaction_profile'], source_schema_id=event['schema_id'],
                source_schema_version=event['schema_version'], projector_replay_only=False)
            raw = w.storage.read_frame(row.event_id)
            frame['frame_bytes_base64'] = base64.b64encode(raw).decode('ascii')
            if custody is not None:
                frame['original_value'] = dict(event=copy.deepcopy(event),
                                               first_append_receipt=copy.deepcopy(custody['first_append_receipt']),
                                               full_value_result=w.storage.full_value_result(row.event_id),
                                               exact_custody=copy.deepcopy(custody))
            frames.append(frame)
        generic = sd.seed('native_consumer', W.C + 'GenericSnapshot', W._NonNull())
        w.bind(generic)
        generic['frames'] = frames
        # the Storage event-index checkpoint named by the actual token
        token = snapshot.token
        res = self.roots.lookup('native_consumer', W.C + 'GenericSnapshot')
        node_ = res.contents['properties']['checkpoint']
        ck = self.roots.follow(res.resolver, node_, node_['$ref'])
        node = ck.contents['properties']['generations']['patternProperties']['^eig_[0-9a-f]{64}$']
        sd.choices = W._NonNull()
        gen = sd._seed([(node, ck.resolver)], '/generic/checkpoint/generation')
        w.bind(gen)
        # TOOL ISSUE: the adapter token names its index dataset
        # 'TEST_ONLY:event_record_index@<generation>', which the original index
        # checkpoint pattern (event_record_index.v2@eig_<64 hex>) refuses; the
        # generation identity itself is the token's.
        gen.update(generation_id=token['generation_id'], state='current',
                   index_dataset_name='event_record_index.v2@' + token['generation_id'], retired_at_utc=None,
                   successor_generation_id=None)
        if isinstance(gen.get('frontier', {}).get('coverage'), dict) and 'retained_event_count' in gen['frontier']['coverage']:
            gen['frontier']['coverage']['retained_event_count'] = max(1, len(snapshot.rows))
        generic['checkpoint']['generations'] = {token['generation_id']: gen}
        generic['checkpoint']['current_generation_id'] = token['generation_id']
        generic['checkpoint']['storage_instance_id'] = w.sid
        return generic

    def actual_sources(self, snapshot):
        w, sd = self.world, self.world.seeder
        src = w.storage.acquire_source()
        value = sd.seed('native_consumer', W.C + 'ActualGenericSources')
        w.bind(value)
        value['current']['byte_length'] = len(src['current_raw'])
        value['current']['bytes_sha256'] = S.sha256(src['current_raw'])
        value['manifest']['byte_length'] = len(src['manifest_raw'])
        value['manifest']['bytes_sha256'] = S.sha256(src['manifest_raw'])
        return value

    # -- reducer checks and records ------------------------------------------------------
    def check_start_event(self, start, event, custody):
        commit = start['commit']['record']
        eq('reducer/start_receipt', commit['first_append_receipt'], custody['first_append_receipt'])
        eq('reducer/start_commitment', commit['event_value_commitment'], custody['original_event_value_commitment'])
        guard('reducer/start_barrier', custody['first_append_receipt']['durability_class'] == 'barrier')

    def check_cancel_event(self, native, event, custody):
        result = native['result']['record']
        eq('reducer/cancel_receipt', result['append_receipt'], custody['first_append_receipt'])
        eq('reducer/cancel_commitment', result['original_event_value'], custody['original_event_value_commitment'])
        eq('reducer/cancel_producer', S.producer25(event), native['event_candidate']['record']['producer_submission'])

    def _sel(self, value):
        return self.consumer._find_selector(value)

    def started_record(self, start, event, custody):
        w = self.world
        rec = w.seeder.seed('native_consumer', W.STC + 'Projection')
        w.bind(rec)
        upd = start['original_d01_update']['record']
        rec.update(scope=copy.deepcopy(self.request()['scope']), original_event=copy.deepcopy(event),
                   native_after_commitment=copy.deepcopy(upd['transition']['after']),
                   original_commit=self._sel(start['commit']), original_origin=self._sel(start['origin']),
                   original_d01_update=self._sel(start['original_d01_update']),
                   original_d01_origin=self._sel(start['original_d01_origin']),
                   original_event_value_commitment=copy.deepcopy(custody['original_event_value_commitment']),
                   producer_semantic_digest=custody['producer_semantic_digest'],
                   first_append_receipt=copy.deepcopy(custody['first_append_receipt']), action_authority=False)
        rec['activation_at_original_event'] = upd['transition']['after']['activation_state']
        rec['status_at_original_event'] = 'running'
        self.roots.validate('native_consumer', W.STC + 'Projection', rec, 'projection/started_record')
        return rec

    def cancelled_record(self, native, event, custody):
        w = self.world
        rec = w.seeder.seed('native_consumer', W.C + 'CancelledProjection')
        w.bind(rec)
        upd = native['original_d01_update']['record']
        start = native['original_start']
        sv = start['value']
        if start['kind'] == 'original_started':
            cause = dict(kind='original_started', **{k: self._sel(sv[k]) for k in (
                'control', 'initial_control_origin', 'candidate', 'commit', 'origin', 'original_d01_update',
                'original_d01_origin', 'original_d01_head')})
        else:
            cause = dict(kind='original_initialized_no_start', **{k: self._sel(sv[k]) for k in (
                'control', 'initial_control_origin', 'original_workflow_birth', 'original_workflow_birth_origin')})
        ss = native['original_safe_stop']
        rec.update(scope=copy.deepcopy(self.request()['scope']), status_at_original_event='cancelled',
                   activation_at_original_event=upd['transition']['after']['activation_state'],
                   original_event=copy.deepcopy(event),
                   native_before_commitment=copy.deepcopy(upd['transition']['before']),
                   native_after_commitment=copy.deepcopy(upd['transition']['after']),
                   original_candidate=self._sel(native['event_candidate']), original_intent=self._sel(native['intent']),
                   original_result=self._sel(native['result']), original_prepare_origin=self._sel(native['prepare_origin']),
                   original_publish_origin=self._sel(native['publish_origin']),
                   original_d01_update=self._sel(native['original_d01_update']),
                   original_d01_origin=self._sel(native['original_d01_origin']),
                   original_d01_head=self._sel(native['original_d01_head']),
                   original_d05_result=self.consumer._find_d05(ss['aggregate_result']),
                   original_d05_origin=self.consumer._find_d05(ss['aggregate_origin']), original_start_cause=cause,
                   original_event_value_commitment=copy.deepcopy(custody['original_event_value_commitment']),
                   producer_semantic_digest=custody['producer_semantic_digest'],
                   first_append_receipt=copy.deepcopy(custody['first_append_receipt']), action_authority=False)
        self.roots.validate('native_consumer', W.C + 'CancelledProjection', rec, 'projection/cancelled_record')
        return rec

    # -- representation -------------------------------------------------------------------
    def identity(self, record):
        event = record['original_event']
        return dict(storage_instance_id=self.world.sid, scope=copy.deepcopy(self.request()['scope']),
                    event_id=event['event_id'], event_type=event['event_type'], sequence_id=event['sequence_id'],
                    idempotency_key=event['idempotency_key'])

    def pack(self, value):
        raw = NR.event_value_bytes(value, 'pack/value')
        reference = self.world.storage.put_pack(raw, 'application/msgpack')
        # durability before reference: read back through the pack participant first
        self.world.storage.read_pack(reference, expected_media_type='application/msgpack')
        return reference

    def unpack(self, reference):
        guard('pack/reference_type', type(reference) is dict and set(reference) == {'blake3', 'byte_size', 'media_type'})
        guard('pack/media_type', reference['media_type'] == 'application/msgpack')
        raw = self.world.storage.read_pack(reference, expected_media_type='application/msgpack')
        value = NR.decode_event_value(raw, 'pack/decode')
        guard('pack/canonical', NR.event_value_bytes(value, 'pack/recode') == raw)
        return value

    def represent(self, record, generation_id, force=None):
        w = self.world
        scope = self.request()['scope']
        wrapper = dict(schema_id='pm.goal_run_projection.started_cancelled.reference.v1', schema_version='1.0.0',
                       storage_instance_id=w.sid, physical_key=self.row_key(scope), dataset_name=self.dataset(generation_id),
                       event_identity=self.identity(record),
                       original_event_value_commitment=copy.deepcopy(record['original_event_value_commitment']),
                       content=dict(kind='inline', record=copy.deepcopy(record)))
        table = self.dataset(generation_id)

        def fits(candidate):
            return size(candidate) <= CAP and size(dict(table=table, key=self.row_key(scope), value=candidate)) <= CAP
        if force != 'event_reference' and force != 'record_reference' and fits(wrapper):
            return wrapper
        metadata = {k: copy.deepcopy(v) for k, v in record.items() if k != 'original_event'}
        event_ref = self.pack(record['original_event'])
        wrapper['content'] = dict(kind='event_reference', metadata=metadata, event_ref=event_ref)
        if force != 'record_reference' and fits(wrapper):
            return wrapper
        wrapper['content'] = dict(kind='record_reference', metadata_ref=self.pack(metadata), event_ref=event_ref)
        guard('representation/compact_oversize', fits(wrapper))
        return wrapper

    def decode(self, wrapper, scope, generation_id):
        """Reconstruct the identical original record and recheck its predicates."""
        self.roots.validate('native_consumer', self.root('StorageProjection'), wrapper, 'decode/row')
        guard('decode/storage', wrapper['storage_instance_id'] == self.world.sid)
        guard('decode/key', wrapper['physical_key'] == self.row_key(scope))
        guard('decode/dataset', wrapper['dataset_name'] == self.dataset(generation_id))
        content = wrapper['content']
        if content['kind'] == 'inline':
            record = copy.deepcopy(content['record'])
        elif content['kind'] == 'event_reference':
            record = dict(copy.deepcopy(content['metadata']), original_event=self.unpack(content['event_ref']))
        else:
            metadata = self.unpack(content['metadata_ref'])
            guard('decode/metadata_has_no_event', 'original_event' not in metadata)
            record = dict(metadata, original_event=self.unpack(content['event_ref']))
        root = W.C + ('CancelledProjection' if record.get('status_at_original_event') == 'cancelled' else 'Projection')
        if root.endswith('/Projection'):
            root = W.STC + 'Projection'
        self.roots.validate('native_consumer', root, record, 'decode/record')
        event = record['original_event']
        eq('decode/identity', wrapper['event_identity'], self.identity(record))
        eq('decode/commitment', wrapper['original_event_value_commitment'], record['original_event_value_commitment'])
        eq('decode/full_value', record['original_event_value_commitment']['sha256'], NR.full_value_commitment(event))
        custody = self.world.storage.authenticate_receipt(event['event_id'], record['first_append_receipt'])
        eq('decode/custody_commitment', custody['original_event_value_commitment'], record['original_event_value_commitment'])
        eq('decode/stored_event', self.world.storage.read_event(event['event_id']), event)
        if content['kind'] != 'inline':
            inline = dict(wrapper, content=dict(kind='inline', record=record))
            guard('decode/representation_minimal', not (size(inline) <= CAP and size(dict(
                table=self.dataset(generation_id), key=self.row_key(scope), value=inline)) <= CAP))
        return record

    def checkpoint_wrapper(self, logical):
        scope = self.request()['scope']
        wrapper = dict(schema_id='pm.goal_run_started_cancelled_checkpoint.reference.v1.storage', schema_version='1.0.0',
                       storage_instance_id=self.world.sid, physical_key=self.checkpoint_key(scope),
                       content=dict(kind='inline', checkpoint=copy.deepcopy(logical)))
        op = dict(table='checkpoints', key=self.checkpoint_key(scope), value=wrapper)
        if size(wrapper) > CAP or size(op) > CAP:
            wrapper['content'] = dict(kind='payload_reference', reference=self.pack(logical))
        self.roots.validate('native_consumer', self.root('StorageCheckpoint'), wrapper, 'checkpoint/wrapper')
        return wrapper

    def read_checkpoint(self, wrapper):
        self.roots.validate('native_consumer', self.root('StorageCheckpoint'), wrapper, 'checkpoint/read')
        scope = self.request()['scope']
        guard('checkpoint/key', wrapper['physical_key'] == self.checkpoint_key(scope))
        guard('checkpoint/storage', wrapper['storage_instance_id'] == self.world.sid)
        content = wrapper['content']
        logical = copy.deepcopy(content['checkpoint']) if content['kind'] == 'inline' else self.unpack(content['reference'])
        self.roots.validate('native_consumer', self.root('LogicalCheckpoint'), logical, 'checkpoint/logical')
        guard('checkpoint/logical_key', logical['physical_key'] == self.checkpoint_key(scope))
        eq('checkpoint/scope', logical['scope'], scope)
        return logical

    # -- generations and publication ------------------------------------------------------
    def current_checkpoint(self):
        cell = self.world.storage.cell('checkpoints', self.checkpoint_key(self.request()['scope']))
        if cell is None:
            return None, None
        return cell, self.read_checkpoint(cell['value'])

    def new_generation(self, token, logical):
        w = self.world
        seed = w.storage.new_seed()
        anchor = S.sha256(NR.binding_value_bytes(['pm.goal_run_projection.generation_anchor.v1', w.sid, PROFILE, seed],
                                                 'generation/anchor'))
        generation_id = self.GENERATION_PREFIX + anchor
        gen = w.seeder.seed('native_consumer', self.root('Generation'), W._NonNull())
        w.bind(gen)
        gen.update(generation_id=generation_id, state='staged', anchor_sha256=anchor, seed_hex=seed, profile=self.PROFILE,
                   scope=copy.deepcopy(self.request()['scope']), source_token_at_birth=copy.deepcopy(token),
                   dataset_name=self.dataset(generation_id), frontier_revision=0, prior_frontier_sha256=None,
                   activated_at_utc=None, retired_at_utc=None, first_prepared_at_utc=w.clock.now(),
                   successor_generation_id=None, hold_refs=[])
        return gen

    def project(self, *, force=None, cut=None, stage_only=False):
        """One projector call: verify, reduce, publish row+checkpoint atomically."""
        w = self.world
        with w.recorder.call(self.owner_id, 'owner.goal_run.started_cancelled.project_prefix.reference.v1',
                             self.request()) as slot:
            guard('projector/withdrawn', not self.withdrawn)
            guard('permission/project', w.permissions['project'] is True)
            source, snapshot, starts, cancellations, goal, effects = self.acquire()
            self.hook('after_acquire')
            scope = self.request()['scope']
            reducer = CombinedReducer(self, scope, starts, cancellations)
            result = source.project(snapshot, reducer, select=lambda e: same_run(e, scope))
            if not result['complete']:
                return self.unavailable('UNSUPPORTED_RELEVANT_EVENT' if result['halt'][0].startswith('reducer/')
                                        else 'INCOMPLETE_GLOBAL_COVERAGE', result['halt'])
            record = result['state']['record']
            guard('projector/no_relevant_event', record is not None)
            cell, logical = self.current_checkpoint()
            existing_row = None
            if logical is not None and logical['current_generation_id'] is not None:
                current_row = w.storage.cell(self.dataset(logical['current_generation_id']), self.row_key(scope))
                existing_row = None if current_row is None else current_row['value']
            private = dict(generic=self.generic_snapshot(snapshot, logical), actual_generic_sources=self.actual_sources(snapshot),
                           native_starts=starts, native_cancellations=cancellations,
                           checkpoint=None if cell is None else copy.deepcopy(cell['value']), existing_row=existing_row)
            w.repair_filler('native_consumer', self.root('CombinedProjectPrivate'), private,
                            {'/native_starts', '/native_cancellations', '/checkpoint', '/existing_row', '/generic/frames'})
            self.roots.validate('native_consumer', self.root('CombinedProjectPrivate'), private, 'projector/private')
            self.last_private = private
            token = snapshot.token
            if logical is None:
                logical = dict(schema_id=self.CHECKPOINT_SCHEMA_ID, schema_version='1.0.0',
                               storage_instance_id=w.sid, scope=copy.deepcopy(scope), physical_key=self.checkpoint_key(scope),
                               current_generation_id=None, generations={})
            staged = [g for g in logical['generations'].values() if g['state'] == 'staged']
            if staged:
                gen = staged[0]
            elif logical['current_generation_id'] is None or stage_only:
                live = [g for g in logical['generations'].values() if g['state'] != 'retired' or not self.expired(g)]
                guard('generation/limit', len(live) < MAX_GENERATIONS)
                gen = self.new_generation(token, logical)
            else:
                gen = logical['generations'][logical['current_generation_id']]
            row = self.represent(record, gen['generation_id'], force=force)
            table = self.dataset(gen['generation_id'])
            existing = w.storage.cell(table, self.row_key(scope))
            if existing is not None and same(existing['value'], row) and gen['processed']['through_sequence_id'] == \
                    result['frontier_sequence']:
                # retry after a lost acknowledgement: the first transaction stands
                slot.set(dict(replay=True, tx_id=existing['tx']))
                return dict(replay=True, tx_id=existing['tx'], row=existing['value'], checkpoint=cell['value'])
            new_logical = copy.deepcopy(logical)
            gen = copy.deepcopy(gen)
            gen['frontier_revision'] = NR.uint64(gen['frontier_revision'] + 1, 'generation/frontier_revision')
            gen['prior_frontier_sha256'] = gen.get('frontier_sha256') if gen['frontier_revision'] > 1 else None
            gen['frontier_sha256'] = S.sha256(NR.binding_value_bytes(
                [gen['anchor_sha256'], gen['frontier_revision'], result['coverage_sha256'], result['frontier_sequence']],
                'generation/frontier'))
            gen['processed'] = dict(generic_token=copy.deepcopy(token), verified_row_count=result['processed'],
                                    through_sequence_id=result['frontier_sequence'], coverage_sha256=result['coverage_sha256'],
                                    retention_gap_sha256=S.sha256(NR.binding_value_bytes(
                                        [g['proof_sha256'] for g in snapshot.gaps], 'generation/gaps')),
                                    row_key=self.row_key(scope), row_sha256=physical_sha256(row))
            gen['last_transaction_id'] = 'TEST_ONLY:projector-tx:%d' % (w.storage.tx_counter + 1)
            new_logical['generations'][gen['generation_id']] = gen
            self.roots.validate('native_consumer', self.root('LogicalCheckpoint'), new_logical, 'checkpoint/afterimage')
            ck = self.checkpoint_wrapper(new_logical)
            writes = [dict(table=table, key=self.row_key(scope), expected=None if existing is None else existing['version'],
                           value=row),
                      dict(table='checkpoints', key=self.checkpoint_key(scope), expected=None if cell is None else cell['version'],
                           value=ck)]
            for op in writes:
                guard('operation/size', size({k: op[k] for k in ('table', 'key', 'value')}) <= CAP)
            self.hook('before_commit')
            guard('permission/project', w.permissions['project'] is True)
            # revalidate the whole source and token under the joint fence
            again = GS.GenericSource(w.storage).acquire()
            eq('cas/source_token', log_token(again.token), log_token(token))
            eq('cas/coverage', again.coverage_sha256, snapshot.coverage_sha256)
            if cut is not None:
                return self.commit_in_child(writes, cut)
            tx = w.storage.transact(writes)
            slot.set(dict(tx_id=tx['tx_id'], generation=gen['generation_id'], form=row.get('content', {}).get('kind', 'inline')))
            return dict(tx_id=tx['tx_id'], row=row, checkpoint=ck, generation_id=gen['generation_id'])

    def expired(self, gen):
        return gen['state'] == 'retired' and gen['retired_at_utc'] is not None and not gen['hold_refs'] and \
            self.world.clock.ms - self._ms(gen['retired_at_utc']) >= RETIRE_SECONDS * 1000

    @staticmethod
    def _ms(text):
        import datetime as dt
        value = dt.datetime.strptime(text, '%Y-%m-%dT%H:%M:%S.%fZ').replace(tzinfo=dt.timezone.utc)
        return int(value.timestamp() * 1000)

    def cutover(self):
        """Atomically make the fully covered staged generation current."""
        w = self.world
        cell, logical = self.current_checkpoint()
        guard('cutover/no_checkpoint', logical is not None)
        staged = [g for g in logical['generations'].values() if g['state'] == 'staged']
        guard('cutover/no_staged', len(staged) == 1)
        gen = copy.deepcopy(staged[0])
        snapshot = GS.GenericSource(w.storage).acquire()
        guard('cutover/complete_coverage', gen['processed']['coverage_sha256'] == snapshot.coverage_sha256 and
              same(log_token(gen['processed']['generic_token']), log_token(snapshot.token)))
        row = w.storage.cell(self.dataset(gen['generation_id']), self.row_key(self.request()['scope']))
        guard('cutover/row', row is not None and physical_sha256(row['value']) == gen['processed']['row_sha256'])
        self.decode(row['value'], self.request()['scope'], gen['generation_id'])
        new = copy.deepcopy(logical)
        now = w.clock.now()
        prior = new['current_generation_id']
        if prior is not None:
            new['generations'][prior].update(state='retired', retired_at_utc=now, successor_generation_id=gen['generation_id'])
        gen.update(state='current', activated_at_utc=now)
        new['generations'][gen['generation_id']] = gen
        new['current_generation_id'] = gen['generation_id']
        ck = self.checkpoint_wrapper(new)
        tx = w.storage.transact([dict(table='checkpoints', key=cell['key'] if 'key' in cell else self.checkpoint_key(
            self.request()['scope']), expected=cell['version'], value=ck)])
        return dict(tx_id=tx['tx_id'], current=gen['generation_id'], retired=prior)

    def commit_in_child(self, writes, cut):
        """Run the two-write transaction in a real child process that dies at the cut."""
        w = self.world
        payload = w.tmp / 'commit-writes.msgpack'
        payload.write_bytes(NR.event_value_bytes(writes, 'child/writes'))
        w.storage_close()
        proc = subprocess.run([sys.executable, __file__, '--child-commit', str(w.tmp / 'storage'), str(payload), cut],
                              cwd=str(Path(__file__).parent), capture_output=True, text=True)
        w.storage_reopen()
        return dict(child_exit=proc.returncode, stderr=proc.stderr[-400:])

    def unavailable(self, reason, halt=None):
        out = dict(scope=copy.deepcopy(self.request()['scope']), reason=reason, effects='none',
                   current_state_asserted=False)
        self.roots.validate('native_consumer', W.C + 'Unavailable', out, 'unavailable')
        if halt is not None:
            out = dict(out)
            self.last_halt = halt
        return out

    # -- readers ------------------------------------------------------------------------------
    def stored_projection(self):
        cell, logical = self.current_checkpoint()
        guard('read/no_checkpoint', logical is not None and logical['current_generation_id'] is not None)
        gen = logical['generations'][logical['current_generation_id']]
        row = self.world.storage.cell(self.dataset(gen['generation_id']), self.row_key(self.request()['scope']))
        guard('read/no_row', row is not None)
        guard('read/row_frontier', physical_sha256(row['value']) == gen['processed']['row_sha256'])
        return cell['value'], logical, gen, row['value']

    def read_historical(self):
        w = self.world
        with w.recorder.call(self.owner_id, 'owner.goal_run.started_cancelled.read_historical.reference.v1',
                             self.request()) as slot:
            guard('reader/withdrawn', not self.reader_withdrawn)
            guard('permission/read', w.permissions['read'] is True)
            ck, logical, gen, row = self.stored_projection()
            record = self.decode(row, self.request()['scope'], gen['generation_id'])
            self.hook('after_decode')
            if record['status_at_original_event'] == 'cancelled':
                original = self.consumer.inspect_original(self.request(), R.Presentation(w))
                self.hook('after_original')
                eq('read/original_event', original['original_value']['event'], record['original_event'])
                out = dict(kind='original_cancelled', original=original, projection=row, checkpoint=ck,
                           current_state_asserted=False)
            else:
                raise W.Refusal('read/started_historical_not_in_scope')
            # final boundary: re-acquire and repeat the complete predicate
            guard('reader/withdrawn', not self.reader_withdrawn)
            guard('permission/read', w.permissions['read'] is True)
            ck2, logical2, gen2, row2 = self.stored_projection()
            eq('final/projection', row2, row)
            again = self.consumer.inspect_original(self.request(), R.Presentation(w))
            eq('final/original', again, out['original'])
            self.roots.validate('native_consumer', self.root('CombinedHistoricalRead'), out, 'historical/success')
            slot.set(dict(sha256=physical_sha256(out)))
            return out

    def current_sources(self):
        """Fresh current native, D06 and Goal Stop sources at one held boundary."""
        w = self.world
        out = {}
        for name, stored in (('body', w.body2), ('control', w.control2)):
            cell = w.storage.cell(stored.family, stored.key)
            guard('current/native_' + name, cell is not None and physical_sha256(cell['value']) == stored.sha256)
            out[name] = copy.deepcopy(cell['value'])
        control = w.cancellation['committed_control']
        cell = w.storage.cell(control.family, control.key)
        guard('current/d06_control', cell is not None and physical_sha256(cell['value']) == control.sha256)
        head = w.cancellation['original_d01_head']
        cell = w.storage.cell(head.family, head.key)
        guard('current/d01_head', cell is not None and physical_sha256(cell['value']) == head.sha256)
        stop = w.goal_cause['original_stop_receipt']
        latest = [s for (f, k, h), s in w.issued.items() if f == stop.family]
        guard('current/goal_stop', latest == [stop] or all(s is stop or s.wrapper['record']['operation_id'] ==
                                                           stop.wrapper['record']['operation_id'] for s in latest))
        return out

    def combined_private(self):
        """Fresh whole CombinedProjectPrivate for a reader (same sources as the projector)."""
        w = self.world
        source, snapshot, starts, cancellations, goal, effects = self.acquire()
        cell, logical = self.current_checkpoint()
        existing = None
        if logical is not None and logical['current_generation_id'] is not None:
            row = w.storage.cell(self.dataset(logical['current_generation_id']), self.row_key(self.request()['scope']))
            existing = None if row is None else row['value']
        private = dict(generic=self.generic_snapshot(snapshot, logical), actual_generic_sources=self.actual_sources(snapshot),
                       native_starts=starts, native_cancellations=cancellations,
                       checkpoint=None if cell is None else copy.deepcopy(cell['value']), existing_row=existing)
        w.repair_filler('native_consumer', self.root('CombinedProjectPrivate'), private,
                        {'/native_starts', '/native_cancellations', '/checkpoint', '/existing_row', '/generic/frames'})
        self.roots.validate('native_consumer', self.root('CombinedProjectPrivate'), private, 'current/private_sources')
        return private

    def read_current_cancelled(self):
        """Current cancelled view: fresh native/D06/D01/Goal/Start sources at one held boundary."""
        w = self.world
        with w.recorder.call(self.owner_id, 'owner.goal_run.started_cancelled.read_current_cancelled.reference.v1',
                             self.request()) as slot:
            guard('reader/withdrawn', not self.reader_withdrawn)
            guard('permission/read', w.permissions['read'] is True)
            current = self.current_sources()
            readback, current_read, goal = w.current_boundary()
            self.hook('after_current')
            historical = self.read_historical()
            self.hook('after_historical')
            native = historical['original']['native_cancellation']
            rec = lambda v: v.get('record', v.get('value'))  # noqa: E731
            d = readback['d06_readback']
            eq('current/readback_d06', [d['result'], d['intent'], d['control'], d['origin']],
               [rec(native['result']), rec(native['intent']), rec(native['committed_control']), rec(native['publish_origin'])])
            eq('current/readback_native', [d['native_after']['body'], d['native_after']['control'],
                                           d['native_after']['body_selection'], d['native_after']['control_selection']],
               [current['body'], current['control'], rec(native['result'])['after_body'], rec(native['result'])['after_control']])
            eq('current/readback_event', d['original_event']['event'], historical['original']['original_value']['event'])
            head_cell = w.storage.cell(w.cancellation['original_d01_head'].family, w.cancellation['original_d01_head'].key)
            eq('current/readback_lineage', [d['original_d01_lineage']['update'], d['original_d01_lineage']['origin'],
                                            d['original_d01_lineage']['head']],
               [native['original_d01_update'], native['original_d01_origin'], head_cell['value']])
            ss = native['original_safe_stop']
            eq('current/readback_safe_stop', [d['safe_stop']['goal_stop'], d['safe_stop']['scheduler_stop'],
                                              d['safe_stop']['inventory_cut'], d['safe_stop']['operation_id']],
               [rec(native['intent'])['goal_stop'], rec(native['intent'])['scheduler_stop'],
                rec(native['intent'])['inventory_cut'], ss['aggregate_result']['value']['operation_id']])
            start = native['original_start']['value']
            ctl = w.start_cause['control']
            eq('current/start', [readback['current_start']['value'][k] for k in ('commit', 'origin', 'initial_control_origin',
                                                                              'control')],
               [start['commit'], start['origin'], start['initial_control_origin'],
                w.storage.cell(ctl.family, ctl.key)['value']])
            eq('current/one_boundary', current_read['current_start'], readback['current_start'])
            goals = historical['original']['native_cancellation']
            gc = R.Presentation(w).goal[0]
            acquired = {k: self.consumer.acquire(v)[1] for k, v in gc.items()}
            eq('current/goal_stop_argument', [goal['current_stop'][k] for k in ('original_stop_receipt', 'original_stop_intent',
                                                                               'original_source_audit')],
               [acquired['original_stop_receipt'], acquired['original_stop_intent'], acquired['original_source_audit']])
            private = dict(projection_sources=self.combined_private(), actual_current_read=current_read,
                           current_disposition=readback)
            self.roots.validate('native_consumer', self.root('CurrentCancelledPrivate'), private, 'current/private')
            self.roots.validate('goal_consumer', W.GA + 'CurrentCancelledGoal', goal, 'current/goal')
            out = dict(kind='native_verified_cancelled_as_of_same_snapshot', original=historical['original'],
                       projection=historical['projection'], checkpoint=historical['checkpoint'],
                       current_native=readback, action_authority='none')
            # final boundary: fresh current sources again, no gap to release
            guard('reader/withdrawn', not self.reader_withdrawn)
            guard('permission/read', w.permissions['read'] is True)
            eq('final/current', self.current_sources(), current)
            self.roots.validate('native_consumer', self.root('CombinedCurrentRead'), out, 'current/success')
            slot.set(dict(sha256=physical_sha256(out)))
            return out

    def read_current_started(self):
        """After cancellation a current running view must refuse."""
        w = self.world
        with w.recorder.call(self.owner_id, 'owner.goal_run.started_cancelled.read_current_started.reference.v1',
                             self.request()):
            guard('reader/withdrawn', not self.reader_withdrawn)
            body = w.storage.cell(w.body1.family, w.body1.key)
            if body is None or body['value']['record']['status'] != 'running':
                return self.unavailable('STALE_NATIVE')
            raise W.Refusal('current_started/not_in_scope')


V4_ROW_PREFIX = 'goal_run_projection.v4'
V1_CHECKPOINT_PREFIX = 'goal_run_started_cancelled_checkpoint.v1'


class ProjectorV7(Projector):
    """Native-v7 edition: the companion consumer's own original inline projection.

    The native-v7 originals keep their separate complete source-method
    composition (W4 selection ``native_v7_dispatch``); they are never adapted
    to the reference successor, which is selected for the original profile.
    This edition therefore publishes the companion ``CombinedStorageProjection``
    (``goal_run_projection.v4`` rows, inline record only) and the companion
    ``CombinedCheckpoint`` under ``physical-families.json``'s exact table and
    key recipes (K(s) = unpadded base64url). A row or operation above 16 KiB
    has no route here and refuses before publication.
    """

    ROOT_PREFIX = W.C
    NAMES = {'StorageProjection': 'CombinedStorageProjection', 'LogicalCheckpoint': 'CombinedCheckpoint',
             'StorageCheckpoint': 'CombinedCheckpoint', 'Generation': 'CombinedGeneration'}
    PROFILE = 'goal_run_started_cancelled_projector.v1'
    GENERATION_PREFIX = 'grscg_'
    CHECKPOINT_SCHEMA_ID = 'pm.goal_run_started_cancelled_checkpoint.v1'

    def __init__(self, world):
        guard('edition/native_v7_world', world.edition == 'native_v7')
        super().__init__(world)

    def row_key(self, scope):
        return V4_ROW_PREFIX + ':' + S.k_component(scope['project_id']) + ':' + S.k_component(scope['goal_run_id'])

    def checkpoint_key(self, scope):
        return V1_CHECKPOINT_PREFIX + ':' + ':'.join(S.k_component(scope[k]) for k in
                                                    ('storage_instance_id', 'project_id', 'goal_id', 'goal_run_id'))

    def dataset(self, generation_id):
        return V4_ROW_PREFIX + '@' + generation_id

    def represent(self, record, generation_id, force=None):
        scope = self.request()['scope']
        wrapper = dict(schema_id='pm.goal_run_projection.started_cancelled.v4', schema_version='4.0.0',
                       storage_instance_id=self.world.sid, physical_key=self.row_key(scope),
                       dataset_name=self.dataset(generation_id), record=copy.deepcopy(record))
        guard('representation/inline_oversize', size(wrapper) <= CAP and size(dict(
            table=self.dataset(generation_id), key=self.row_key(scope), value=wrapper)) <= CAP)
        self.roots.validate('native_consumer', self.root('StorageProjection'), wrapper, 'v7/row')
        return wrapper

    def decode(self, wrapper, scope, generation_id):
        self.roots.validate('native_consumer', self.root('StorageProjection'), wrapper, 'decode/row')
        guard('decode/storage', wrapper['storage_instance_id'] == self.world.sid)
        guard('decode/key', wrapper['physical_key'] == self.row_key(scope))
        guard('decode/dataset', wrapper['dataset_name'] == self.dataset(generation_id))
        record = copy.deepcopy(wrapper['record'])
        event = record['original_event']
        eq('decode/full_value', record['original_event_value_commitment']['sha256'], NR.full_value_commitment(event))
        custody = self.world.storage.authenticate_receipt(event['event_id'], record['first_append_receipt'])
        eq('decode/custody_commitment', custody['original_event_value_commitment'], record['original_event_value_commitment'])
        eq('decode/stored_event', self.world.storage.read_event(event['event_id']), event)
        return record

    def checkpoint_wrapper(self, logical):
        self.roots.validate('native_consumer', self.root('LogicalCheckpoint'), logical, 'checkpoint/wrapper')
        guard('checkpoint/inline_oversize', size(logical) <= CAP and size(dict(
            table='checkpoints', key=self.checkpoint_key(self.request()['scope']), value=logical)) <= CAP)
        return copy.deepcopy(logical)

    def read_checkpoint(self, wrapper):
        self.roots.validate('native_consumer', self.root('LogicalCheckpoint'), wrapper, 'checkpoint/read')
        scope = self.request()['scope']
        guard('checkpoint/key', wrapper['physical_key'] == self.checkpoint_key(scope))
        guard('checkpoint/storage', wrapper['storage_instance_id'] == self.world.sid)
        eq('checkpoint/scope', wrapper['scope'], scope)
        return copy.deepcopy(wrapper)


class _Prefer(W._NonNull):
    def __init__(self, by_path):
        super().__init__()
        self.by_path = by_path

    def get(self, path, default=None):
        return self.by_path.get(path) or super().get(path, default)


def _kind_index(roots, variants, kind):
    for i, v in enumerate(variants):
        node = v
        if '$ref' in v:
            for realm in ('native_consumer',):
                try:
                    node = roots.registries[realm].resolver().lookup(v['$ref']).contents
                except Exception:  # noqa: BLE001
                    node = v
        if node.get('properties', {}).get('kind', {}).get('const') == kind:
            return i
    return 0


def child_commit(storage_dir, payload, cut):
    storage = S.TestOwnerStorage.open(storage_dir, faults=S.FaultPlan(cut=cut, mode='exit'))
    writes = NR.decode_event_value(Path(payload).read_bytes(), 'child/writes')
    storage.transact(writes, cut_before='before_terminal', cut_after='after_terminal')
    return 0


if __name__ == '__main__':
    if len(sys.argv) == 5 and sys.argv[1] == '--child-commit':
        sys.exit(child_commit(sys.argv[2], sys.argv[3], sys.argv[4]))
