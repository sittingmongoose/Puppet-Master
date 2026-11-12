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

import base64
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


def scan_source(src, state):
    """Scan every retained segment in global order (gaps between them) once.

    Returns the ordered items and, per segment, the scan plus the facts the
    canonical images are built from (bytes SHA-256, count, first/last sequence).
    """
    gaps = state['gaps']
    ordered = sorted([('segment', s['generation'], s) for s in src['segments']] +
                     [('gap', g['segment_generation'], g) for g in gaps], key=lambda x: x[1])
    prior = None
    scans, stats, prefix, last_group = {}, {}, [], None
    for kind, generation, item in ordered:
        if kind == 'gap':
            prior = item['last_sequence']
            continue
        scan = S.scan_segment(item['raw'], generation=generation, name=item['name'],
                              storage_instance_id=src['storage_instance_id'], prior_sequence=prior)
        scans[generation] = scan
        seqs = []
        for group in scan['groups']:
            for frame in group['frames']:
                header_len = int.from_bytes(frame.raw[9:11], 'little')
                seqs.append(frame.sequence_id)
                prefix.append(dict(sequence_id=frame.sequence_id, event_id=frame.value['event_id'],
                                   scope_partition=S.scope_partition(frame.value),
                                   source_value_bytes_sha256=S.sha256(frame.raw[S.PREFIX + header_len:])))
            if group['frames']:
                prior = group['frames'][-1].sequence_id
        stats[generation] = dict(sha256=S.sha256(item['raw']), count=len(seqs), first=seqs[0] if seqs else None,
                                 last=seqs[-1] if seqs else None)
        last_group = scan['groups'][-1] if scan['groups'] else None
    return ordered, scans, stats, prefix, last_group


def canonical_from_source(src, state):
    """Canonical CURRENT/manifest bytes and source_selection that ``state`` and the
    snapshot's actual segment bytes determine (also used to build coherent test
    substitutions)."""
    _, _, stats, prefix, last_group = scan_source(src, state)
    current, body = S.build_seglog_images(state, stats, prefix, last_group)
    current_raw = S.canonical(current)
    manifest_raw = S.canonical(dict(body, manifest_generation=state['manifest_generation']))
    return current_raw, manifest_raw, S.source_selection_of(current_raw, manifest_raw)


def _recompute_token(storage_token, src, state, facts):
    """Recompute every token field from the snapshot's bytes instead of trusting it.

    ``source_selection`` must equal what the exact canonical CURRENT and manifest
    bytes give, and the canonical manifest must equal what the committed state
    and the actual segment bytes give. A segment whose bytes differ from the
    manifest record is refused as substituted unless Storage read those very
    bytes at acquisition and the frame scan itself finds the defect (corruption
    at rest): then the snapshot halts before the defect instead.
    """
    sel = storage_token['source_selection']
    canon = src['canonical']
    current = S.decode_canonical(src['current_raw'], 'source/current')
    manifest = S.decode_canonical(canon['manifest_raw'], 'source/canonical_manifest_codec')
    require('source/current_hash', S.sha256(canon['current_raw']) == sel['current_bytes_sha256'])
    require('source/manifest_hash', S.sha256(canon['manifest_raw']) == sel['manifest_bytes_sha256'])
    require('source/current_manifest_join', S.sha256(src['manifest_raw']) == current['manifest_sha256'])
    require('source/manifest_generation', state['manifest_generation'] == sel['manifest_generation']
            == current['manifest_generation'] == manifest['manifest_generation'])
    live = [s for s in state['segments'] if not s['retired']]
    require('source/segment_inventory', [[s['generation'], s['name'], s['watermark']] for s in live] ==
            [[s['generation'], s['name'], s['watermark']] for s in src['segments']])
    ordered, scans, stats, prefix, last_group = facts
    entry = manifest['selection_entries'][0]
    recorded = {item['segment_generation']: item for item in entry['retained_inventory']}
    at_rest = []
    for seg in src['segments']:
        item = recorded.get(seg['generation'])
        actual = stats[seg['generation']]['sha256']
        if item is not None and item['source_durable_bytes_sha256'] == actual:
            continue
        defect = scans[seg['generation']]['tail'] is not None
        require('source/retained_inventory', item is not None and defect and seg.get('raw_sha256') == actual)
        at_rest.append(seg['generation'])
    require('source/retained_inventory', S.index_digest(entry['retained_inventory']) == sel['retained_inventory_sha256'])
    require('source/watermarks', S.index_digest(entry['durable_watermarks']) == sel['durable_watermarks_sha256'] and
            [[w['physical_segment_id'], w['durable_end_offset']] for w in entry['durable_watermarks']] ==
            [[s['physical_segment_id'], s['watermark']] for s in live])
    require('source/retired_inputs', S.index_digest(entry['retired_inputs']) == sel['retired_inputs_sha256'])
    require('source/excluded_ranges', S.index_digest(entry['excluded_ranges']) == sel['excluded_ranges_sha256'])
    require('source/recovery_epoch', state['recovery_epoch'] == sel['recovery_epoch'] == manifest['recovery_epoch'])
    for field_ in ('frontier_revision',):
        require('source/token/' + field_, state['index_frontier_revision'] == storage_token[field_])
    if not at_rest:
        current_v, body = S.build_seglog_images(state, stats, prefix, last_group)
        require('source/canonical_current', S.canonical(current_v) == canon['current_raw'])
        require('source/canonical_manifest', S.canonical(dict(body, manifest_generation=state['manifest_generation']))
                == canon['manifest_raw'])
        require('source/survivor_prefix', S.retained_prefix_digest(prefix) == sel['manifest_survivor_prefix_sha256'])
    # Index fields of the token name the actual checkpoint root and its current node.
    checkpoint = S.decode_canonical(canon['checkpoint_raw'], 'source/checkpoint_codec')
    key = S.index_checkpoint_key(src['storage_instance_id'])
    gid = checkpoint['current_generation_id']
    node = checkpoint['generations'].get(gid) if gid is not None else None
    require('source/token/checkpoint_key', storage_token['checkpoint_key'] == key == canon['checkpoint_key'])
    require('source/token/generation_id', node is not None and storage_token['generation_id'] == gid)
    require('source/token/checkpoint_ref', storage_token['checkpoint_ref'] == key + '#/generations/' + gid)
    require('source/token/generation_anchor_sha256',
            storage_token['generation_anchor_sha256'] == S.index_digest(node['anchor']))
    require('source/token/frontier_sha256', storage_token['frontier_sha256'] == S.index_digest(node['frontier']) and
            storage_token['frontier_revision'] == node['frontier']['publication_revision'])
    require('source/token/index_dataset_name', storage_token['index_dataset_name'] == node['index_dataset_name'])
    return at_rest


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
        facts = scan_source(src, state)
        _recompute_token(token, src, state, facts)
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
        ordered, scans = facts[0], facts[1]
        for kind, generation, item in ordered:
            if kind == 'gap':
                require('source/gap_order', prior is None or item['first_sequence'] > prior)
                prior = item['last_sequence']
                coverage.update(S.binding(['gap', generation, item['first_sequence'], item['last_sequence'],
                                           item['proof_sha256']]))
                continue
            scan = scans[generation]
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


# ------------------------------------------------------------------ SP-278 Event Record Index read source

_NATIVE_SOURCE_BANK = None
NATIVE_SOURCE_ROOT = ('https://puppetmaster.local/proposals/workflow_standard_event_prerequisite.v4.schema.json'
                      '#/$defs/NativeCurrentEventSource')


def native_source_bank():
    """Pinned whole bank for the native-v7 ``NativeCurrentEventSource`` root (loaded once)."""
    global _NATIVE_SOURCE_BANK
    if _NATIVE_SOURCE_BANK is None:
        import pm_goal_test_owner_adapters as A
        _NATIVE_SOURCE_BANK = A.RootBank([dict(path=p) for p in (
            'Plans/workflow_standard_source_contracts/native-v7/schemas/workflow-standard-event-prerequisite.v4.schema.json',
            'Plans/storage_compaction_native_contracts.schema.json', 'Plans/event_record_index_checkpoint.schema.json',
            'Plans/goal_run_started_consumer_contracts/consumer.schema.json', 'Plans/event_record.schema.json',
            'Plans/event_append_receipt_contracts.schema.json')])
    return _NATIVE_SOURCE_BANK


@dataclass
class IndexRead:
    qualification: str
    storage_instance_id: str
    checkpoint_key: str
    checkpoint: dict
    checkpoint_raw: bytes
    generation: dict
    rows: dict
    read_token: dict
    snapshot: SourceSnapshot
    source: dict
    segment_names: dict


class EventRecordIndexSource:
    """TEST_ONLY ``reader.storage.event_record_index@1.0.0`` read source over Storage's own state.

    One acquisition pins the generic source (whole token recomputed from bytes,
    every frame validated), the canonical checkpoint root
    ``event_record_index_checkpoint.v1:{storage_instance_id}`` and the current
    generation's ``event_record_index.v2@{generation_id}`` dataset. It resolves the
    uniquely current node, requires the frontier to match the captured source
    selection, recomputes the row set, coverage and anchored prefix, and joins every
    GenericIndexRow to its actual source frame. The full ten-field read token adds
    the acquisition's transient snapshot id. Native redb, fsync and locks stay NOT_RUN.
    """

    qualification = QUALIFICATION

    def __init__(self, storage):
        require('index_source/storage_type', isinstance(storage, S.TestOwnerStorage))
        self.storage = storage

    def read(self, snapshot=None):
        src = snapshot if snapshot is not None else self.storage.acquire_source()
        generic = GenericSource(self.storage).acquire(src)
        require('index/source_complete', generic.complete)
        canon, token, sid = src['canonical'], src['token'], src['storage_instance_id']
        checkpoint = S.decode_canonical(canon['checkpoint_raw'], 'index/checkpoint_codec')
        require('index/checkpoint_schema', not list(S._INDEX_CHECKPOINT.iter_errors(checkpoint)))
        key = S.index_checkpoint_key(sid)
        require('index/checkpoint_storage', checkpoint['storage_instance_id'] == sid and canon['checkpoint_key'] == key)
        gid = checkpoint['current_generation_id']
        node = checkpoint['generations'].get(gid) if gid is not None else None
        require('index/current_generation', node is not None and node['state'] == 'current' and
                [g for g, n in checkpoint['generations'].items() if n['state'] == 'current'] == [gid])
        anchor = node['anchor']
        require('index/generation_id', S.generation_id_of(sid, anchor['source_selection'],
                                                          anchor['generation_seed_sha256']) == gid)
        require('index/dataset_name', node['index_dataset_name'] == 'event_record_index.v2@' + gid ==
                canon['index_dataset_name'])
        frontier = node['frontier']
        require('index/frontier_current', A_same(frontier['source_selection'], token['source_selection']))
        rows = {}
        for k, row in canon['index_rows']:
            require('index/row_duplicate', k not in rows)
            rows[k] = row
        require('index/row_count', len(rows) == frontier['index_row_count'])
        require('index/row_set', S.row_set_digest(rows) == frontier['index_row_set_sha256'])
        manifest = S.decode_canonical(canon['manifest_raw'], 'index/manifest_codec')
        entry = manifest['selection_entries'][0]
        names = {item['segment_generation']: item['segment_name'] for item in entry['retained_inventory']}
        names.update({b['current_segment_generation']: b['original_segment_name'] for b in entry['namespace_bindings']})
        prefix = []
        for r in generic.rows:
            header_len = int.from_bytes(self._frame_raw(src, r)[9:11], 'little')
            prefix.append(dict(sequence_id=r.sequence_id, event_id=r.event_id, scope_partition=r.scope_partition,
                               source_value_bytes_sha256=S.sha256(self._frame_raw(src, r)[S.PREFIX + header_len:])))
        coverage = frontier['coverage']
        require('index/coverage_count', coverage['retained_event_count'] == len(prefix) and
                coverage['empty_retained_source'] is (not prefix))
        require('index/coverage_range', coverage['first_retained_sequence_id'] == (prefix[0]['sequence_id'] if prefix else None)
                and coverage['through_sequence_id'] == (prefix[-1]['sequence_id'] if prefix else None))
        require('index/coverage_prefix', coverage['retained_event_prefix_sha256'] == S.retained_prefix_digest(prefix))
        last = generic.rows[-1] if generic.rows else None
        require('index/coverage_last_frame', (coverage['last_frame'] is None) == (last is None) and (
            last is None or (coverage['last_frame']['byte_offset'] == last.offset and
                             coverage['last_frame']['frame_end_offset'] == last.offset + last.length and
                             coverage['last_frame']['last_event_id'] == last.event_id and
                             coverage['last_frame']['segment_generation'] == last.segment_generation)))
        require('index/coverage_gaps', A_same(coverage['sequence_gaps'], entry['excluded_ranges']))
        through = anchor['through_sequence_id']
        anchored = [] if through is None else [e for e in prefix if e['sequence_id'] <= through]
        require('index/anchor_prefix', len(anchored) == anchor['retained_event_count'] and
                S.retained_prefix_digest(anchored) == anchor['retained_event_prefix_sha256'])
        by_event = {r.event_id: r for r in generic.rows}
        require('index/row_coverage', sorted(r['event_id'] for r in rows.values()) == sorted(by_event))
        for k, row in rows.items():
            require('index/row_schema', not list(S._INDEX_ROW.iter_errors(row)))
            require('index/row_key', k == S.index_row_key(row))
            g = by_event[row['event_id']]
            expected = S.index_row(S.index_row_base(g.event, segment_generation=g.segment_generation,
                                                    segment_name=names[g.segment_generation], byte_offset=g.offset),
                                   node)
            for field_ in expected:
                require('index/row_source/' + field_, A_same(row.get(field_), expected[field_]))
        read_token = dict(copy.deepcopy(token), redb_snapshot_id=src['snapshot_id'])
        require('index/read_token_schema', not list(S._INDEX_TOKEN.iter_errors(read_token)))
        return IndexRead(QUALIFICATION, sid, key, checkpoint, canon['checkpoint_raw'], copy.deepcopy(node),
                         copy.deepcopy(rows), read_token, generic, src, names)

    @staticmethod
    def _frame_raw(src, row):
        seg = next(s for s in src['segments'] if s['generation'] == row.segment_generation)
        return seg['raw'][row.offset:row.offset + row.length]

    def lookup(self, read, *, scope_partition, sequence_id, event_id):
        """One row by its logical key, joined to its exact frame, Event and first custody."""
        require('index/read_type', isinstance(read, IndexRead) and read.storage_instance_id ==
                self.storage.storage_instance_id)
        key = 'event_record_index.v2:%s:%020d:%s' % (scope_partition, sequence_id, event_id)
        row = read.rows.get(key)
        require('index/row_absent', row is not None)
        g = next(r for r in read.snapshot.rows if r.event_id == event_id)
        frame = self._frame_raw(read.source, g)
        require('index/frame_hash', S.sha256(frame) == g.frame_sha256)
        require('index/custody_unavailable', g.custody is not None)
        return dict(index_row=copy.deepcopy(row), frame_raw=frame, event=copy.deepcopy(g.event),
                    first_append_receipt=copy.deepcopy(g.custody['first_append_receipt']),
                    full_value_result=dict(first_append_receipt=copy.deepcopy(g.custody['first_append_receipt']),
                                           original_segment_ref=g.custody['original_segment_ref'],
                                           original_event_value_commitment=copy.deepcopy(
                                               g.custody['original_event_value_commitment'])),
                    exact_custody=copy.deepcopy(g.custody))

    def native_current_event_source(self, original_native_read_id, read=None):
        """The native-v7 ``NativeCurrentEventSource`` root, built only from Storage-held bytes.

        Validated against the whole pinned v4 bank (every ``$ref`` resolved). The
        caller supplies only its own native read id.
        """
        read = read or self.read()
        src, canon = read.source, read.source['canonical']
        manifest = S.decode_canonical(canon['manifest_raw'])
        current = S.decode_canonical(canon['current_raw'])
        entry = manifest['selection_entries'][0]
        ids = {item['segment_generation']: item['physical_segment_id'] for item in entry['retained_inventory']}
        current_names = {item['segment_generation']: item['segment_name'] for item in entry['retained_inventory']}
        segment_bytes, frames, generic_frames = [], [], []
        for seg in src['segments']:
            segment_bytes.append(dict(physical_segment_id=ids[seg['generation']],
                                      bytes_base64=base64.b64encode(seg['raw']).decode('ascii'),
                                      byte_length=len(seg['raw']), bytes_sha256=S.sha256(seg['raw'])))
        for g in read.snapshot.rows:
            raw = self._frame_raw(src, g)
            header_len = int.from_bytes(raw[9:11], 'little')
            frames.append(dict(physical_segment_id=ids[g.segment_generation], segment_generation=g.segment_generation,
                               segment_name=current_names[g.segment_generation], byte_offset=g.offset,
                               frame_end_offset=g.offset + g.length, frame_bytes_sha256=S.sha256(raw),
                               event=copy.deepcopy(g.event),
                               source_value_bytes_base64=base64.b64encode(raw[S.PREFIX + header_len:]).decode('ascii'),
                               source_schema_id=g.event['schema_id'], source_schema_version=g.event['schema_version']))
            found = self.lookup(read, scope_partition=g.scope_partition, sequence_id=g.sequence_id, event_id=g.event_id)
            generic_frames.append(dict(index_row=found['index_row'],
                                       frame_bytes_base64=base64.b64encode(raw).decode('ascii'),
                                       original_value=dict(event=found['event'],
                                                           first_append_receipt=found['first_append_receipt'],
                                                           full_value_result=found['full_value_result'],
                                                           exact_custody=found['exact_custody'])))
        value = dict(storage_instance_id=read.storage_instance_id, original_native_read_id=original_native_read_id,
                     current=dict(decoded=current, byte_length=len(canon['current_raw']),
                                  bytes_sha256=S.sha256(canon['current_raw'])),
                     current_bytes_base64=base64.b64encode(canon['current_raw']).decode('ascii'),
                     manifest=dict(decoded=manifest, byte_length=len(canon['manifest_raw']),
                                   bytes_sha256=S.sha256(canon['manifest_raw'])),
                     manifest_bytes_base64=base64.b64encode(canon['manifest_raw']).decode('ascii'),
                     source_selection=copy.deepcopy(read.read_token['source_selection']),
                     selected_entry=copy.deepcopy(entry), segment_bytes=segment_bytes, frames=frames,
                     sequence_gaps=copy.deepcopy(entry['excluded_ranges']),
                     generic=dict(checkpoint=copy.deepcopy(read.checkpoint), token=copy.deepcopy(read.read_token),
                                  frames=generic_frames))
        errors = native_source_bank().errors(NATIVE_SOURCE_ROOT, value)
        require('index/native_source_schema', not errors)
        return value


def A_same(a, b):
    """Type-exact equality (bool is not int); local to avoid importing the owner adapters here."""
    if type(a) is not type(b):
        return False
    if type(a) is dict:
        return a.keys() == b.keys() and all(A_same(a[k], b[k]) for k in a)
    if type(a) is list:
        return len(a) == len(b) and all(A_same(x, y) for x, y in zip(a, b))
    return a == b


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
