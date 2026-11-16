#!/usr/bin/env python3
"""DG-CA3 lane-local TEST_ONLY SP-278 Event Record Index read source (for C3's append readback and C4's inspection).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

The shared adapter Storage keeps an index anchor/frontier digest inside its durable
token but no SP-278 checkpoint, generation or row records. This owner adds them in
the lane's own file (the adapter files are untouched; listed for the adapter batch),
over the same ``LeasedStorage`` lineage DG-CA uses:

* ``publish`` is the index owner's own publication: it scans Storage's actual
  CURRENT/manifest/segments (DG-CA's ``SeglogControlOwner`` naming and the Storage
  token's byte-derived ``source_selection``), issues one current generation
  (``eig_<sha256 of the anchor>``) whose anchor is fixed at birth, a frontier with
  complete coverage of every retained frame in global sequence order, one
  ``existing_event_record_index`` row per retained Event, and the
  ``existing_index_root__checkpoint`` record, all in one Storage transaction. The
  frontier revision advances only through this owner's own publication.
* ``read_token`` returns ``existing_index_root__read_token`` with a transient
  ``redb_snapshot_id`` (never persisted); ``row`` reads a stored row back.
* Every value validates against ``Plans/storage_compaction_native_contracts.schema.json``.
"""
from __future__ import annotations

import base64
import copy
import hashlib
import secrets

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
from pm_goal_dg_ca_owners import WorldOwner, require, uid, row_sha, same, sha, exact_numbers, QUALIFICATION, NATIVE_LINE

NATIVE = 'https://puppetmaster.local/schemas/storage_compaction_native_contracts/1.0.0/schema.json#/$defs/'
CHECKPOINT, ROWS = 'event_record_index_checkpoint', 'event_record_index'


class EventIndexOwner(WorldOwner):
    """projector.storage.event_record_index@1.0.0 as a TEST_ONLY owner of this Storage."""
    role = 'event_record_index'

    def __init__(self, world, **kw):
        super().__init__(world, **kw)
        self.seed = secrets.token_bytes(32)
        self.generation_id = None
        self.anchor = None
        self.frontier = None
        self.born_at = None

    def checkpoint_key(self):
        return 'event_record_index_checkpoint.v1:' + S.k_component(self.world.storage_id)

    def row_key(self, generation_id, sequence_id):
        return '%s:%020d' % (generation_id, sequence_id)

    def validate(self, name, value):
        self.world.roots.check('goal', NATIVE + name, value)
        return exact_numbers(value, 'index/' + name)

    def retained(self):
        st = self.storage
        out = []
        for event_id, info in st.events.items():
            out.append((info['sequence_id'], event_id, info))
        return sorted(out)

    def gaps(self):
        st = self.storage
        lease = st.cell('seglog_sequence_allocator', st.lease_key()) if hasattr(st, 'lease_key') else None
        if lease is None:
            return []
        return [dict(reason='allocator_lease_abandoned', first_sequence_id=g['first_sequence_id'], last_sequence_id=g['last_sequence_id'],
                     manifest_evidence_ref=st.lease_key(), manifest_evidence_sha256=row_sha(lease['value']))
                for g in lease['value']['abandoned']]

    def segment_coverage(self):
        st, sg = self.storage, self.world.seglog
        out = []
        for segment in st.segments:
            if segment['retired']:
                continue
            seqs = [e['sequence_id'] for e in st.events.values() if e['segment_generation'] == segment['generation']]
            raw = sg.segment_bytes(segment)
            out.append(dict(segment_generation=segment['generation'], segment_name=sg.native_name(segment),
                            state='closed' if segment['sealed'] else 'active', scan_start_offset=0,
                            scanned_through_offset=segment['watermark'], source_durable_end_offset=segment['watermark'],
                            source_durable_bytes_sha256=sha(raw), retained_event_count=len(seqs),
                            first_sequence_id=min(seqs) if seqs else None, last_sequence_id=max(seqs) if seqs else None))
        return out

    def row_value(self, event_id, info, selection, checkpoint_ref):
        st, sg = self.storage, self.world.seglog
        event = st.read_event(event_id)
        segment = next(s for s in st.segments if s['generation'] == info['segment_generation'])
        return self.validate('existing_event_record_index', dict(
            schema_id='pm.storage_value.event_record_index.v2', schema_version='2.0.0', scope_kind=event['scope_kind'],
            project_id=event['project_id'], scope_partition=S.scope_partition(event), sequence_id=event['sequence_id'], event_id=event_id,
            event_type=event['event_type'],
            source_locator=dict(segment_generation=info['segment_generation'], segment_name=sg.native_name(segment),
                                byte_offset=info['offset'], sequence_id=event['sequence_id']),
            publication_locator=dict(manifest_generation=selection['manifest_generation'], recovery_epoch=selection['recovery_epoch'],
                                     survivor_prefix_sha256=selection['manifest_survivor_prefix_sha256'], checkpoint_ref=checkpoint_ref,
                                     compaction_translation_manifest_ref=None),
            payload_sha256=sha(S.canonical(event['payload'], 'index/payload')), producer_semantic_digest=NR.producer_digest(event),
            idempotency_key=event['idempotency_key'], correlation_id=event['correlation_id'], causation_event_id=event['causation_event_id'],
            persisted_at_utc=event['persisted_at_utc'], redaction_profile=event['redaction_profile'], source_schema_id=event['schema_id'],
            source_schema_version=event['schema_version'], projector_replay_only=event['replay_policy'] == 'projector_replay_only'))

    def publish(self):
        """The index owner's own publication over the whole retained global prefix (one transaction)."""
        st = self.storage
        with self.recorder.call(self.owner_id, 'publish_index') as slot:
            selection = st.read_token()['source_selection']
            retained = self.retained()
            prefix = hashlib.sha256()
            for seq, event_id, info in retained:
                prefix.update(S.canonical([seq, event_id, info['frame_sha256']], 'index/prefix'))
            gaps = self.gaps()
            first = retained[0][0] if retained else None
            through = retained[-1][0] if retained else None
            if self.anchor is None:
                self.born_at = self.clock.now()
                self.anchor = dict(source_selection=copy.deepcopy(selection), first_retained_sequence_id=first, through_sequence_id=through,
                                   retained_event_count=len(retained), retained_event_prefix_sha256=prefix.hexdigest(),
                                   sequence_gaps_sha256=sha(S.canonical(gaps, 'index/gaps')), generation_seed_sha256=sha(self.seed))
                self.generation_id = 'eig_' + sha(S.canonical(self.anchor, 'index/anchor'))
            gid = self.generation_id
            checkpoint_ref = 'TEST_ONLY:event_record_index_checkpoint@%s:%d' % (gid, (self.frontier or {}).get('publication_revision', -1) + 1)
            rows = [self.row_value(event_id, info, selection, checkpoint_ref) for seq, event_id, info in retained]
            last = retained[-1] if retained else None
            sg = self.world.seglog
            last_frame = None
            if last:
                seg = next(s for s in st.segments if s['generation'] == last[2]['segment_generation'])
                last_frame = dict(segment_generation=seg['generation'], segment_name=sg.native_name(seg), byte_offset=last[2]['offset'],
                                  frame_end_offset=last[2]['offset'] + last[2]['length'], last_sequence_id=last[0], last_event_id=last[1])
            prior = None if self.frontier is None else sha(S.canonical(self.frontier, 'index/frontier'))
            frontier = dict(publication_revision=NR.uint64(0 if self.frontier is None else self.frontier['publication_revision'] + 1, 'index/revision'),
                            source_selection=copy.deepcopy(selection), coverage=dict(
                                scope='all_application_and_project_partitions', complete_to_captured_boundary=True,
                                empty_retained_source=not retained, first_retained_sequence_id=first, through_sequence_id=through,
                                last_frame=last_frame, retained_event_count=len(retained), retained_event_prefix_sha256=prefix.hexdigest(),
                                segments=self.segment_coverage(), sequence_gaps=gaps, health='healthy'),
                            index_row_count=len(rows), index_row_set_sha256=sha(S.canonical(rows, 'index/rows')),
                            redb_transaction_id=uid('TEST_ONLY:index-tx'), indexed_at_utc=self.clock.now(),
                            predecessor_frontier_sha256=prior or sha(S.canonical(['pm.goal_test.empty_frontier.v1', gid], 'index/empty')))
            generation = self.validate('existing_index_root__generation', dict(
                generation_id=gid, projector_id='projector.storage.event_record_index', projector_version='1.0.0',
                index_value_schema_id='pm.storage_value.event_record_index.v2', index_value_schema_version='2.0.0',
                index_dataset_name='event_record_index.v2@' + gid, state='current', origin='initial_rebuild', anchor=copy.deepcopy(self.anchor),
                frontier=frontier, translation=None, first_prepared_at_utc=self.born_at, activated_at_utc=self.born_at, retired_at_utc=None,
                successor_generation_id=None, hold_refs=[]))
            checkpoint = self.validate('existing_index_root__checkpoint', dict(
                schema_id='pm.storage_value.event_record_index_checkpoint.v1', schema_version='1.0.0', storage_instance_id=st.storage_instance_id,
                current_generation_id=gid, generations={gid: generation}, redaction_profile='no_secrets'))
            ckey = self.checkpoint_key()
            cell = st.cell(CHECKPOINT, ckey)
            writes = [self.world.put(CHECKPOINT, ckey, checkpoint, expected=None if cell is None else cell['version'])]
            for row in rows:
                rkey = self.row_key(gid, row['sequence_id'])
                existing = st.cell(ROWS, rkey)
                if existing is None:
                    writes.append(self.world.put(ROWS, rkey, row))
                else:
                    require('index/row_rewritten', same({k: v for k, v in existing['value'].items() if k != 'publication_locator'},
                                                         {k: v for k, v in row.items() if k != 'publication_locator'}))
                    writes.append(self.world.put(ROWS, rkey, row, expected=existing['version']))
            tx = self.world.write(writes)
            self.frontier = frontier
            slot.set(dict(revision=frontier['publication_revision'], rows=len(rows), tx=tx['tx_id']))
            return copy.deepcopy(checkpoint)

    def current(self):
        """Checkpoint, current generation and frontier as stored (re-read)."""
        cell = self.storage.cell(CHECKPOINT, self.checkpoint_key())
        require('index/checkpoint_unavailable', cell is not None)
        checkpoint = cell['value']
        gid = checkpoint['current_generation_id']
        require('index/no_current_generation', gid is not None and gid in checkpoint['generations'])
        generation = checkpoint['generations'][gid]
        require('index/generation_anchor', 'eig_' + sha(S.canonical(generation['anchor'], 'index/anchor')) == gid)
        return checkpoint, generation, generation['frontier']

    def read_token(self):
        checkpoint, generation, frontier = self.current()
        cell = self.storage.cell(CHECKPOINT, self.checkpoint_key())
        return self.validate('existing_index_root__read_token', dict(
            storage_instance_id=self.storage.storage_instance_id, checkpoint_key=self.checkpoint_key(),
            checkpoint_ref='TEST_ONLY:event_record_index_checkpoint@%s:%d' % (generation['generation_id'], frontier['publication_revision']),
            generation_id=generation['generation_id'], generation_anchor_sha256=sha(S.canonical(generation['anchor'], 'index/anchor')),
            frontier_revision=frontier['publication_revision'], frontier_sha256=sha(S.canonical(frontier, 'index/frontier')),
            index_dataset_name=generation['index_dataset_name'], source_selection=copy.deepcopy(frontier['source_selection']),
            redb_snapshot_id='TEST_ONLY:redb-snapshot:' + secrets.token_hex(8)))

    def verify_token(self, token):
        """A presented token is compared with the stored checkpoint (the snapshot id is transient and not compared)."""
        current = self.read_token()
        require('index/token_stale', all(token.get(k) == current[k] for k in current if k != 'redb_snapshot_id'))
        return current

    def row(self, event_id):
        checkpoint, generation, frontier = self.current()
        info = self.storage.events.get(event_id)
        require('index/event_unavailable', info is not None)
        cell = self.storage.cell(ROWS, self.row_key(generation['generation_id'], info['sequence_id']))
        require('index/row_unavailable', cell is not None and cell['value']['event_id'] == event_id)
        return copy.deepcopy(cell['value'])

    def source_frame(self, event_id):
        """The actual source frame bytes and locator, from the segment file (hash-checked by Storage)."""
        st, sg = self.storage, self.world.seglog
        info = st.events.get(event_id)
        require('index/event_unavailable', info is not None)
        raw = st.read_frame(event_id)
        event = st.read_event(event_id)
        value_bytes = NR.event_value_bytes(event)
        require('index/frame_value_bytes', value_bytes in raw)
        segment = next(s for s in st.segments if s['generation'] == info['segment_generation'])
        frame = dict(physical_segment_id=sg.physical_id(segment), segment_generation=segment['generation'], segment_name=sg.native_name(segment),
                     byte_offset=info['offset'], frame_end_offset=info['offset'] + info['length'], frame_bytes_sha256=sha(raw),
                     event=event, source_value_bytes_base64=base64.b64encode(value_bytes).decode('ascii'),
                     source_schema_id=event['schema_id'], source_schema_version=event['schema_version'])
        return self.validate('frame', frame)
