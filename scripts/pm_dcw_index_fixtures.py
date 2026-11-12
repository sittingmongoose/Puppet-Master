#!/usr/bin/env python3
"""Synthetic SP-278 snapshots containing the actual DCW originals.

Builders issue test captures only. Production readers never call these builders
or repair an index from a requested event. Native source/redb adapters NOT_RUN.
"""
import base64
import copy
import hashlib

import pm_dcw_event_oracles as m


def capture(events, storage_instance_id, recovery_epoch=0):
    frames = []; blob = b''
    events = sorted(events, key=lambda e: e['sequence_id'])
    name = 'seg-000001-' + str(events[0]['sequence_id'] if events else 0).zfill(20) + '.active'
    for event in events:
        raw = m.canonical_msgpack(event)
        frames.append(dict(event=copy.deepcopy(event), source_value_bytes_base64=base64.b64encode(raw).decode(),
            segment_generation=1, segment_name=name, byte_offset=len(blob), frame_end_offset=len(blob) + len(raw),
            source_schema_id=event['schema_id'], source_schema_version=event['schema_version'],
            native_frame_validation='ASSUMED_TRUSTED_SOURCE_ADAPTER_NOT_EXECUTED'))
        blob += raw
    segment = dict(segment_generation=1, segment_name=name, state='active', scan_start_offset=0,
        scanned_through_offset=len(blob), source_durable_end_offset=len(blob),
        source_durable_bytes_sha256=hashlib.sha256(blob).hexdigest(), retained_event_count=len(frames),
        first_sequence_id=events[0]['sequence_id'] if events else None,
        last_sequence_id=events[-1]['sequence_id'] if events else None)
    source = dict(source_adapter_kind='SYNTHETIC_VERIFIED_SOURCE_INPUT_NATIVE_CODEC_NOT_RUN',
        current=dict(fixture_kind='synthetic_owner_decoded_current', selected_segment_generation=1),
        manifest=dict(fixture_kind='synthetic_owner_decoded_manifest', manifest_generation=11, recovery_epoch=recovery_epoch,
            selected_segment_generation=1, retained_inventory=[segment], durable_watermarks=[dict(
                segment_name=name, durable_end_offset=len(blob))], excluded_ranges=[], retired_inputs=[],
            survivor_prefix_sha256=m.index_prefix(frames)),
        frames=frames, segments=[segment], sequence_gaps=[], source_bytes_base64=base64.b64encode(blob).decode())
    gaps = []
    for left, right in zip(events, events[1:]):
        if right['sequence_id'] > left['sequence_id'] + 1:
            first, last = left['sequence_id'] + 1, right['sequence_id'] - 1
            evidence = 'synthetic-lease-gap:' + str(first) + ':' + str(last)
            gaps.append(dict(reason='allocator_lease_abandoned', first_sequence_id=first,
                last_sequence_id=last, manifest_evidence_ref=evidence,
                manifest_evidence_sha256=hashlib.sha256(evidence.encode()).hexdigest()))
    source['sequence_gaps'] = gaps
    source['manifest']['excluded_ranges'] = copy.deepcopy(gaps)
    source['gap_evidence'] = {g['manifest_evidence_ref']: copy.deepcopy(g) for g in gaps}
    source['source_selection'] = m.index_selection(source, storage_instance_id)
    return source


def snapshot(events, storage_instance_id, recovery_epoch=0):
    return snapshot_source(capture(events, storage_instance_id, recovery_epoch), storage_instance_id)


def snapshot_source(source, storage_instance_id):
    """Issue only derived copies; leave the input source fact untouched."""
    coverage = m.index_coverage(source)
    # Preserve the generic owner's exact wire shape, replacing every binding.
    example = m.load('Plans/event_index_consumer_adoption_fixtures.json')['positive']['both_full_owner_joins']
    index = copy.deepcopy(example['generic']); cp = index['checkpoint']
    generation = copy.deepcopy(next(iter(cp['generations'].values())))
    anchor = dict(source_selection=copy.deepcopy(source['source_selection']),
        **{k: coverage[k] for k in ('first_retained_sequence_id', 'through_sequence_id', 'retained_event_count',
                                  'retained_event_prefix_sha256')},
        sequence_gaps_sha256=m.index_binding(source['sequence_gaps']), generation_seed_sha256=m.index_binding(dict(
            fixture_only_seed='DCW-round8', source=source['source_selection'])))
    gid = m.index_generation(storage_instance_id, anchor)
    key = 'event_record_index_checkpoint.v1:' + storage_instance_id
    generation.update(generation_id=gid, index_dataset_name='event_record_index.v2@' + gid, anchor=anchor)
    rows = {m.index_key(f['event']): m.index_row(f, generation, key) for f in source['frames']}
    generation['frontier'].update(source_selection=copy.deepcopy(source['source_selection']), coverage=coverage,
        index_row_count=len(rows), index_row_set_sha256=m.index_rows_digest(rows))
    cp.update(storage_instance_id=storage_instance_id, current_generation_id=gid, generations={gid: generation})
    index.update(checkpoint_key=key, captured_redb_snapshot_id='synthetic-same-redb-snapshot:txn:initial-A', datasets={generation['index_dataset_name']: rows}, current_source=source,
        source_by_generation={gid: copy.deepcopy(source)}, committed_transactions=[dict(transaction_id='txn:initial-A',
            generation_id=gid, frontier_sha256=m.index_binding(generation['frontier']),
            index_row_set_sha256=generation['frontier']['index_row_set_sha256'])])
    token = dict(storage_instance_id=storage_instance_id, checkpoint_key=key, checkpoint_ref=key + '#/generations/' + gid,
        generation_id=gid, generation_anchor_sha256=m.index_binding(anchor), frontier_revision=0,
        frontier_sha256=m.index_binding(generation['frontier']), index_dataset_name=generation['index_dataset_name'],
        source_selection=copy.deepcopy(source['source_selection']))
    reader = dict(durable_token=copy.deepcopy(token), live_token=dict(token,
        redb_snapshot_id='synthetic-same-redb-snapshot:txn:initial-A'), expected_predecessor=None)
    return index, reader


def issue(scenario):
    """Freeze the independent Storage-original view before a test mutation."""
    originals = list(scenario['authority']['events'].values())
    scenario['index'], scenario['reader'] = snapshot(originals, scenario['authority']['storage_instance_id'],
                                                  scenario['authority']['recovery_epoch'])
    m.install_fixture_originals(scenario)


def rehash(index, reader):
    """Reissue only derived hash observations for a deliberately changed dataset.

    Used to isolate the row/source join from its independent integrity digest.
    It never changes source bytes or repairs any row field.
    """
    g = index['checkpoint']['generations'][index['checkpoint']['current_generation_id']]
    f = g['frontier']; rows = index['datasets'][g['index_dataset_name']]
    f['index_row_set_sha256'] = m.index_rows_digest(rows)
    for tx in index['committed_transactions']:
        if tx['transaction_id'] == f['redb_transaction_id']:
            tx.update(frontier_sha256=m.index_binding(f), index_row_set_sha256=f['index_row_set_sha256'])
    for token in (reader['live_token'], reader['durable_token']):
        token['frontier_sha256'] = m.index_binding(f)
