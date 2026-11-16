"""DG5 shared-site source: the unchanged TEST_ONLY adapter self-test under the GH1 collector.

The adapter self-test (scripts/pm_goal_test_adapters_selftest.py, with its batch-2 module) authors
positive and negative cases against the shared Storage, append owner and source modules that every DG
Goal family's complete calls reach. Each captured storage/owner/source entry runs sealed like any DG5
entry; each authored negative's expected code is its declared target (lead decision 1116061157-ad82,
condition 3: a shared site closes by a DG5 killed witness at the same site and the same source bytes,
cited by every family whose calls reach it). Expectations written as a code prefix ('*') name no
single site and are recorded undeclared. The adapter's own child-process fault matrix runs under the
original self-test only (--skip-matrix here).
"""
import copy
import functools
import inspect
import json
import os
import pickle
import tempfile
from binascii import crc32
from pathlib import Path
import sys

import pm_goal_dg5_boundaries as bridge
import pm_goal_dg5_entries as plumbing
import pm_goal_test_adapters_selftest as selftest
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as source
import pm_goal_test_storage as storage

DG5_EVIDENCE = {}
FAMILY = 'shared-adapter'
STORAGE_ENTRIES = ('reserve', 'resume', 'release', 'reserve_assignment', 'abandon', 'append', 'issue_first_receipt',
                   'authenticate_receipt', 'read_frame', 'read_event', 'event_by_identity', 'transact',
                   'publish_terminal', 'put_pack', 'read_pack', 'withdraw_pack', 'retire_segment', 'canonical_images',
                   'index_checkpoint', 'index_rows', 'read_token', 'snapshot', 'acquire_source', 'lease',
                   'ensure_lease', 'first_custody', 'full_value_result', 'receipt_of', 'cell', 'next_sequence')


def public_methods(cls):
    return tuple(name for name, value in vars(cls).items()
                 if inspect.isfunction(value) and not name.startswith('_'))


def install():
    for name in ('positive', 'negative'):
        original = getattr(selftest.Suite, name)
        if getattr(original, '_dg5_case', False):
            continue

        def bind(original=original, name=name):
            @functools.wraps(original)
            def call(self, component, case_id, run, *args, **kwargs):
                saved = bridge.CASE[0]
                expected = (args[0] if args else kwargs.get('expected')) if name == 'negative' else None
                declared = None if expected is None or str(expected).endswith('*') else expected
                bridge.CASE[0] = dict(id='adapter/' + component + '/' + case_id, expected=declared,
                                      authored_expected=expected)
                try:
                    return original(self, component, case_id, run, *args, **kwargs)
                finally:
                    bridge.CASE[0] = saved
            call._dg5_case = True
            return call
        setattr(selftest.Suite, name, bind())
    plumbing.entries(storage.TestOwnerStorage, tuple(n for n in STORAGE_ENTRIES if n in vars(storage.TestOwnerStorage)),
                     FAMILY)
    plumbing.entries(A.AppendOwner, ('append_original', 'event', 'first_receipt'), FAMILY)
    # LifecycleReducer is a pure state function with no original world or durable store to
    # seal, so it is not itself a DG5 complete-call entry; its shared sites are observed
    # nested under GenericSource.project entries (and its direct probe calls stay unwrapped).
    for cls in (source.GenericSource, source.EventRecordIndexSource):
        plumbing.entries(cls, public_methods(cls), FAMILY)


def supplements(suite, work):
    """DG5 negatives for routed frame-decode sites, surfaced through Storage.read_event.

    The original self-test calls decode_frame directly, outside any DG5 complete call, so
    those cases can never target the sites. Each case below appends one genuine event,
    replaces its segment with the wire-fixture frame (frame hash rewired in the in-memory
    index, exactly one defect left), and reads it back through the original owner entry.
    """
    data = json.loads((bridge.ROOT / 'Plans/seglog_frame_v2_wire_fixtures.json').read_text())
    base = bytes.fromhex(data['base_frame_hex'])
    generation = data['segment_generation']
    for fixture in data['cases']:
        def run(fixture=fixture):
            store = storage.TestOwnerStorage.create(work / fixture['id'])
            _handle, _out, rows = selftest.append_one(store, 'dg5-' + fixture['id'])
            event_id = rows[0]['event_id']
            info = store.events[event_id]
            raw = bytearray(base[:fixture['length']])
            for offset, byte in fixture['replace_bytes']:
                raw[offset] = byte
            raw = bytes(raw)
            store._segment_path(generation).write_bytes(raw)
            info.update(offset=0, length=len(raw), frame_sha256=storage.sha256(raw),
                        segment_generation=generation)
            return store.read_event(event_id)

        suite.negative('dg5-shared', 'frame_fixture:' + fixture['id'], run,
                       fixture['expected_class'] + ':' + fixture['expected_code'])
    _read_event_supplements(suite, work, base, generation)
    _decode_supplements(suite, work, data, base, generation)
    _pure_supplements(suite, work)
    _handle_supplements(suite, work)
    _index_supplements(suite, work)
    _fence_supplements(suite, work)
    _index_read_supplements(suite, work)
    _schema_assert_supplements(suite, work)
    _guard_supplements(suite, work)


class _HandleSubclass(A.OriginalHandle):
    """A handle whose exact type is not OriginalHandle (the :624/:630 defect)."""


def _handle_supplements(suite, work):
    """DG5 negatives isolating the AppendOwner handle-type rows (:624/:630).

    The authored dict-handle cases also fail the issuer check on the next line, so neither
    row can be killed by them. A subclass handle registered in the owner's own event map
    (the sealed world state, exactly as a stored-cell rewrite) passes the issuer check and
    the genuine read, leaving the exact-type require as the only refusal.
    """
    def setup(tag):
        registry = A.OwnerRegistry()
        store = storage.TestOwnerStorage.create(work / ('handle-' + tag))
        appender = A.AppendOwner(registry, store)
        events, _reservation, _outcome = appender.append_original(
            'TEST_ONLY:op:' + tag, dict(tag=tag), [selftest.candidate(tag)])
        genuine = events[0]
        sub = _HandleSubclass(genuine.kind)
        appender._events[sub] = appender._events[genuine]
        return appender, sub

    def event_case():
        appender, sub = setup('dg5-event-handle')
        return appender.event(sub)

    def receipt_case():
        appender, sub = setup('dg5-receipt-handle')
        return appender.first_receipt(sub)

    suite.negative('dg5-shared', 'event_subclass_handle:624', event_case, 'event/handle_type')
    suite.negative('dg5-shared', 'first_receipt_subclass_handle:630', receipt_case, 'event/handle_type')

    def append_case():
        store = storage.TestOwnerStorage.create(work / 'handle-storage-append')
        genuine = store.reserve('TEST_ONLY:op:dg5-append-handle', dict(tag='dg5-append-handle'))
        sub = _StorageHandleSubclass(genuine.kind)
        store._handles[sub] = store._handles[genuine]
        return store.append(sub, [selftest.candidate('dg5-append-handle')])

    def receipt_of_case():
        store = storage.TestOwnerStorage.create(work / 'handle-storage-receipt')
        genuine, _out, _rows = selftest.append_one(store, 'dg5-receipt-handle')
        issued = store.issue_first_receipt(genuine)
        sub = _StorageHandleSubclass(issued[0].kind)
        store._receipt_handles[sub] = store._receipt_handles[issued[0]]
        return store.receipt_of(sub)

    suite.negative('dg5-shared', 'append_subclass_handle:1259', append_case, 'handle/type')
    suite.negative('dg5-shared', 'receipt_of_subclass_handle:1589', receipt_of_case, 'receipt_handle/type')


def _index_supplements(suite, work):
    """DG5 negatives isolating the index duplicate rows (:1056/:1057).

    A second segment is crafted with one re-encoded frame (duplicate event_id with a
    fresh idempotency key, or fresh event_id with the same scoped identity), a third
    genuine segment is appended and sealed, and retiring it rebuilds the index over
    both remaining segments inside the judged retire_segment entry. The authored
    append-path cases can never reach these rows (append dedupe and :1477 refuse first).
    """
    def setup(tag, dup_edit):
        store = storage.TestOwnerStorage.create(work / ('index-' + tag))
        _handle, out, _rows = selftest.append_one(store, tag)
        event_id = out['event_ids'][0]
        event = store.read_event(event_id)
        gen1 = store.segments[-1]['generation']
        seq1 = event['sequence_id']
        gen2 = gen1 + 1
        dup = dup_edit(dict(event, sequence_id=seq1 + 1))
        raw_event = storage.encode_event_frame(dup, gen2)
        commit = dict(commit_group_id='TEST_ONLY:group:' + tag, segment_name='segment-%d' % gen2,
                      segment_generation=gen2, manifest_generation=store.manifest_generation,
                      durability_class='ordinary', acknowledged_at_utc=event['persisted_at_utc'],
                      first_sequence=seq1 + 1, last_sequence=seq1 + 1,
                      members=[[dup['event_id'], seq1 + 1, 0]], restore_admission=None)
        raw_commit = storage.encode_commit_frame(commit, gen2, seq1 + 1)
        seg2 = dict(store.segments[-1], generation=gen2, name='segment-%d' % gen2,
                    watermark=len(raw_event) + len(raw_commit), sealed=True, retired=False)
        store._segment_path(gen2).write_bytes(raw_event + raw_commit)
        store.segments.append(seg2)
        gen3 = gen2 + 1
        store.segments.append(store._new_segment(
            gen3, seq1 + 2, 'TEST_ONLY:segment-rotation:%s:%d' % (store.storage_instance_id, gen3)))
        store._segment_path(gen3).touch()
        store.last_sequence = seq1 + 1
        h = store.reserve('TEST_ONLY:op:' + tag + '-third', dict(tag=tag + '-third'))
        store.append(h, [selftest.candidate(tag + '-third')])
        store.segments[-1]['sealed'] = True
        return store, gen3

    def duplicate_event_id():
        store, gen3 = setup('dg5-dup-event', lambda e: dict(e, idempotency_key='TEST_ONLY:key:dup2'))
        return store.retire_segment(gen3, storage.RetentionOwner(store))

    def duplicate_scoped_identity():
        store, gen3 = setup('dg5-dup-scoped', lambda e: dict(e, event_id='TEST_ONLY:goal_test.adapter_probe:dup-scoped'))
        return store.retire_segment(gen3, storage.RetentionOwner(store))

    suite.negative('dg5-shared', 'index_duplicate_event_id:1056', duplicate_event_id,
                   'index/duplicate_event_id')
    suite.negative('dg5-shared', 'index_duplicate_scoped_identity:1057', duplicate_scoped_identity,
                   'index/duplicate_scoped_identity')


def _fence_supplements(suite, work):
    """DG5 single-defect negatives for the append fence/dedupe rows.

    The authored fence cases move several selected-sink facts at once (abandon also
    drops the fence; rotation moves segment, offset, manifest and sequence together),
    so each row is only COVERED_LATER there. Each case below flips exactly one
    recorded fact in the sealed reservation record, leaving every sibling check
    holding, so the named row refuses alone.
    """
    def fenced(tag, edit):
        store = storage.TestOwnerStorage.create(work / ('fence-' + tag))
        handle, _fence, _record = store.reserve_assignment('TEST_ONLY:op:' + tag, dict(tag=tag))
        edit(store.append_reservations['TEST_ONLY:op:' + tag])
        return store.append(handle, [selftest.candidate(tag)])

    suite.negative('dg5-shared', 'assignment_abandoned_state_only:1441',
                   lambda: fenced('dg5-fence-abandoned', lambda r: r.update(state='abandoned')),
                   'assignment/reservation_abandoned')
    suite.negative('dg5-shared', 'assignment_selected_segment_only:1445',
                   lambda: fenced('dg5-fence-segment',
                                  lambda r: r.update(segment_generation=r['segment_generation'] + 99)),
                   'assignment/selected_segment')
    suite.negative('dg5-shared', 'assignment_selected_offset_only:1447',
                   lambda: fenced('dg5-fence-offset', lambda r: r.update(byte_offset=r['byte_offset'] + 1)),
                   'assignment/selected_offset')

    def append_once_retry():
        store = storage.TestOwnerStorage.create(work / 'fence-append-once')
        selftest.append_one(store, 'dg5-once', selftest.candidate('dg5-once', replay_policy='append_once'),
                            op='TEST_ONLY:op:dg5-once-1')
        return selftest.append_one(store, 'dg5-once',
                                   selftest.candidate('dg5-once', replay_policy='append_once'),
                                   op='TEST_ONLY:op:dg5-once-2')

    suite.negative('dg5-shared', 'append_once_identical_retry:1460', append_once_retry,
                   'append/append_once_exists')

    def retire_while_fenced_sealed():
        store = storage.TestOwnerStorage.create(work / 'fence-retire', segment_target_bytes=2000)
        selftest.append_one(store, 'dg5-retire-1')
        selftest.append_one(store, 'dg5-retire-2')
        sealed = next(x['generation'] for x in store.segments if x['sealed'] and not x['retired'])
        store.reserve_assignment('TEST_ONLY:op:dg5-retire-fence', dict(tag='dg5-retire-fence'))
        return store.retire_segment(sealed, storage.RetentionOwner(store))

    suite.negative('dg5-shared', 'retire_while_fenced_sealed:1748', retire_while_fenced_sealed,
                   'assignment/fence_held')


def _index_read_supplements(suite, work):
    """DG5 single-defect negatives for the index frontier rows (:451/:452).

    The authored cases drop or edit an index row, which a later row-frame join also
    refuses. Each case below instead flips exactly one frontier fact in the checkpoint
    (token digests repointed coherently, the authored _token_patch pattern), leaving
    every row and join genuine, so the named frontier check refuses alone.
    """
    def snapshot_with(tag, frontier_edit):
        store = storage.TestOwnerStorage.create(work / ('indexread-' + tag), segment_target_bytes=3000)
        for i in range(3):
            selftest.append_one(store, '%s-%d' % (tag, i))
        raw = copy.deepcopy(store.acquire_source())
        ck = storage.decode_canonical(raw['canonical']['checkpoint_raw'])
        node = ck['generations'][ck['current_generation_id']]
        frontier_edit(node['frontier'])
        raw['canonical']['checkpoint_raw'] = storage.canonical(ck)
        node = ck['generations'].get(ck['current_generation_id'], node)
        raw['token']['frontier_sha256'] = storage.index_digest(node['frontier'])
        raw['token']['generation_anchor_sha256'] = storage.index_digest(node['anchor'])
        return source.EventRecordIndexSource(store).read(raw)

    suite.negative('dg5-shared', 'index_row_count_only:451',
                   lambda: snapshot_with('dg5-ix-count',
                                         lambda f: f.update(index_row_count=f['index_row_count'] + 1)),
                   'index/row_count')
    suite.negative('dg5-shared', 'index_row_set_only:452',
                   lambda: snapshot_with('dg5-ix-rowset',
                                         lambda f: f.update(index_row_set_sha256='0' * 64)),
                   'index/row_set')


def _schema_assert_supplements(suite, work):
    """DG5 single-defect negatives for Storage internal schema asserts.

    Each case corrupts exactly one in-memory state field (the sealed world state,
    exactly as a stored-cell rewrite) that only the named whole-schema assert reads,
    leaving every earlier and later check holding.
    """
    def full_value():
        store = storage.TestOwnerStorage.create(work / 'assert-full-value')
        _handle, out, _rows = selftest.append_one(store, 'dg5-full-value')
        store.custody[out['event_ids'][0]]['original_segment_ref'] = 1
        return store.full_value_result(out['event_ids'][0])

    def lease_schema():
        store = storage.TestOwnerStorage.create(work / 'assert-lease')
        selftest.append_one(store, 'dg5-lease-1')
        store.sequence_lease['lease_revision'] = 'x'
        return selftest.append_one(store, 'dg5-lease-2')

    def checkpoint_schema():
        store = storage.TestOwnerStorage.create(work / 'assert-checkpoint')
        selftest.append_one(store, 'dg5-ck-1')
        checkpoint = store.canonical['checkpoint']
        node = checkpoint['generations'][checkpoint['current_generation_id']]
        node['anchor'] = dict(node['anchor'], generation_seed_sha256='not-hex')
        return selftest.append_one(store, 'dg5-ck-2')

    suite.negative('dg5-shared', 'custody_full_value_schema:1611', full_value, 'custody/full_value_schema')
    suite.negative('dg5-shared', 'images_lease_schema:909', lease_schema, 'images/lease_schema')
    suite.negative('dg5-shared', 'index_checkpoint_schema:1210', checkpoint_schema, 'index/checkpoint_schema')

    def candidate_type():
        store = storage.TestOwnerStorage.create(work / 'assert-candidate-type')
        handle = store.reserve('TEST_ONLY:op:dg5-cand-type', dict(tag='dg5-cand-type'))
        return store.append(handle, ['x'])

    def row_schema():
        store = storage.TestOwnerStorage.create(work / 'assert-row-schema')
        _handle, out, _rows = selftest.append_one(store, 'dg5-row-schema')
        info = store.events[out['event_ids'][0]]
        info['row_base'] = dict(info['row_base'], sequence_id='x')
        rows = store.index_datasets[store.canonical['checkpoint']['current_generation_id']]
        del rows[[k for k, r in rows.items() if r['event_id'] == out['event_ids'][0]][0]]
        return selftest.append_one(store, 'dg5-row-schema-2')

    def current_schema():
        store = storage.TestOwnerStorage.create(work / 'assert-current-schema')
        selftest.append_one(store, 'dg5-current-1')
        store.birth_operation_ref = ''
        return selftest.append_one(store, 'dg5-current-2')

    def manifest_schema():
        store = storage.TestOwnerStorage.create(work / 'assert-manifest-schema')
        selftest.append_one(store, 'dg5-manifest-1')
        store.segments[-1]['canonical_name'] = ''
        return selftest.append_one(store, 'dg5-manifest-2')

    suite.negative('dg5-shared', 'append_candidate_type:1422', candidate_type, 'append/candidate/type')
    suite.negative('dg5-shared', 'index_row_schema:1200', row_schema, 'index/row_schema')
    suite.negative('dg5-shared', 'images_current_schema:907', current_schema, 'images/current_schema')
    suite.negative('dg5-shared', 'images_manifest_schema:908', manifest_schema, 'images/manifest_schema')
    # custody/schema (:1564) has no judged negative: _custody_row builds only from a
    # frame-validated event plus computed digests (see its entailed proof).


def _guard_supplements(suite, work):
    """DG5 negatives for guard rows whose authored cases land on a sibling site or
    whose cut raises at the guarded read (presence at the matrix)."""
    def foreign_first_receipt():
        store = storage.TestOwnerStorage.create(work / 'guard-foreign-receipt')
        registry = A.OwnerRegistry()
        appender = A.AppendOwner(registry, store)
        events, _reservation, _outcome = appender.append_original(
            'TEST_ONLY:op:dg5-foreign-receipt', dict(tag='dg5-foreign-receipt'),
            [selftest.candidate('dg5-foreign-receipt')])
        return A.AppendOwner(registry, store).first_receipt(events[0])

    def full_value_absent():
        store = storage.TestOwnerStorage.create(work / 'guard-full-value-absent')
        return store.full_value_result('TEST_ONLY:absent')

    def withdraw_absent():
        store = storage.TestOwnerStorage.create(work / 'guard-withdraw-absent')
        return store.withdraw_pack('0' * 64)

    def read_frame_absent():
        store = storage.TestOwnerStorage.create(work / 'guard-read-frame')
        return store.read_frame('TEST_ONLY:absent')

    def read_event_absent():
        store = storage.TestOwnerStorage.create(work / 'guard-read-event')
        return store.read_event('TEST_ONLY:absent')

    def retire_empty():
        store = storage.TestOwnerStorage.create(work / 'guard-retire-empty')
        seg = store._new_segment(2, 0, 'TEST_ONLY:segment-rotation:%s:2' % store.storage_instance_id)
        seg['sealed'] = True
        store.segments.append(seg)
        store._segment_path(2).touch()
        return store.retire_segment(2, storage.RetentionOwner(store))

    suite.negative('dg5-shared', 'first_receipt_foreign_handle:631', foreign_first_receipt, 'event/issuer')
    suite.negative('dg5-shared', 'full_value_absent:1607', full_value_absent, 'custody/unavailable')
    suite.negative('dg5-shared', 'withdraw_pack_absent:1736', withdraw_absent, 'pack/unavailable')
    suite.negative('dg5-shared', 'read_frame_absent:1624', read_frame_absent, 'read/event_unavailable')
    suite.negative('dg5-shared', 'read_event_absent:1633', read_event_absent, 'read/event_unavailable')
    suite.negative('dg5-shared', 'retire_empty_segment:1754', retire_empty, 'retire/nonempty')


def _rootbank_of(entries):
    return A.RootBank(entries)


def _generic_source_of(storage_value):
    return source.GenericSource(storage_value)


class _StorageHandleSubclass(storage._Handle):
    """A storage handle whose exact type is not _Handle (the :1259/:1589 defect)."""


def _read_event_supplements(suite, work, base, generation):
    """Two read_event cases the wire fixtures cannot express as byte replacements."""
    def short_prefix():
        store = storage.TestOwnerStorage.create(work / 'prefix-short')
        _handle, _out, rows = selftest.append_one(store, 'dg5-prefix-short')
        event_id = rows[0]['event_id']
        raw = base[:2]
        store._segment_path(generation).write_bytes(raw)
        store.events[event_id].update(offset=0, length=len(raw), frame_sha256=storage.sha256(raw),
                                      segment_generation=generation)
        return store.read_event(event_id)

    suite.negative('dg5-shared', 'frame_prefix_two_bytes', short_prefix, 'Corrupt:prefix_truncated')

    def declared_plus_one():
        store = storage.TestOwnerStorage.create(work / 'declared-plus-one')
        _handle, _out, rows = selftest.append_one(store, 'dg5-declared-plus-one')
        event_id = rows[0]['event_id']
        raw = bytearray(base)
        declared = int.from_bytes(raw[11:15], 'little') + 1
        raw[11:15] = declared.to_bytes(4, 'little')
        raw[40:44] = b'\0\0\0\0'
        raw[40:44] = crc32(bytes(raw[:48])).to_bytes(4, 'little')
        raw = bytes(raw)
        store._segment_path(generation).write_bytes(raw)
        store.events[event_id].update(offset=0, length=len(raw), frame_sha256=storage.sha256(raw),
                                      segment_generation=generation)
        return store.read_event(event_id)

    suite.negative('dg5-shared', 'frame_declared_payload_plus_one', declared_plus_one,
                   'Corrupt:frame_truncated')

    def magic_resealed():
        store = storage.TestOwnerStorage.create(work / 'magic-resealed')
        _handle, _out, rows = selftest.append_one(store, 'dg5-magic-resealed')
        event_id = rows[0]['event_id']
        raw = bytearray(base)
        raw[0] = ord('Q')
        raw[40:44] = b'\0\0\0\0'
        raw[40:44] = crc32(bytes(raw[:48])).to_bytes(4, 'little')
        raw = bytes(raw)
        store._segment_path(generation).write_bytes(raw)
        store.events[event_id].update(offset=0, length=len(raw), frame_sha256=storage.sha256(raw),
                                      segment_generation=generation)
        return store.read_event(event_id)

    suite.negative('dg5-shared', 'frame_magic_resealed', magic_resealed, 'Corrupt:magic')


def _rebuild_frame(frame, header_raw=None, payload_raw=None):
    prefix = bytearray(frame[:48])
    header_len = int.from_bytes(prefix[9:11], 'little')
    payload_len = int.from_bytes(prefix[11:15], 'little')
    header = bytes(frame[48:48 + header_len]) if header_raw is None else header_raw
    payload = bytes(frame[48 + header_len:48 + header_len + payload_len]) if payload_raw is None else payload_raw
    prefix[9:11] = len(header).to_bytes(2, 'little')
    prefix[11:15] = len(payload).to_bytes(4, 'little')
    prefix[32:36] = crc32(header).to_bytes(4, 'little')
    prefix[36:40] = crc32(payload).to_bytes(4, 'little')
    prefix[40:44] = b'\0\0\0\0'
    prefix[40:44] = crc32(bytes(prefix)).to_bytes(4, 'little')
    return bytes(prefix) + header + payload


def _decode_supplements(suite, work, data, base, generation):
    """Whole-frame decoder negatives for sites no Storage entry surfaces.

    decode_frame is the original whole-frame checker (the same complete-call
    status DG5 gives whole-root schema and NUMRULE calls): each case runs it
    through bridge.entry_call over a real Storage root, with exactly one defect.
    """
    header_len = int.from_bytes(base[9:11], 'little')
    header = storage.decode_canonical(base[48:48 + header_len], 'dg5/header')
    sequence = int.from_bytes(base[24:32], 'little')
    group = data['group_cases'][0]
    commit_payload = group['commit_payload']
    last = commit_payload['last_sequence']

    def decode_case(case_id, buf, offset, prior, expected, prior_control=False, target=None):
        def run():
            store = storage.TestOwnerStorage.create(work / ('decode-' + case_id.replace(':', '-')))
            kwargs = dict(generation=generation, prior_sequence=prior, prior_control=prior_control)
            if bridge.tables.COLLECTOR is None:
                return storage.decode_frame(buf, offset, **kwargs)
            case = bridge.CASE[0]
            return bridge.entry_call(case, case['id'] + '/decode_frame', FAMILY,
                                     lambda: storage.decode_frame(buf, offset, **kwargs),
                                     store.root, world=store,
                                     arguments=dict(args=(buf, offset), kwargs=kwargs),
                                     original=storage.decode_frame,
                                     target=target if target is not None else bridge.target_rows(expected))

        suite.negative('dg5-shared', case_id, run, expected)

    decode_case('decode_sequence_progression', base, 0, sequence, 'Corrupt:sequence_progression')
    decode_case('decode_header_codec', _rebuild_frame(base, header_raw=b'\xc1'), 0, None,
                'Corrupt:header_codec')
    decode_case('decode_payload_codec', _rebuild_frame(base, payload_raw=b'\xc1'), 0, None,
                'Corrupt:payload_codec')
    decode_case('decode_payload_shape', _rebuild_frame(base, payload_raw=storage.canonical([1, 2])), 0, None,
                'Corrupt:payload_shape')
    event = copy.deepcopy(data['base_event'])
    del event['scope_kind']
    decode_case('decode_event_record', _rebuild_frame(base, payload_raw=storage.canonical(event)), 0, None,
                'Corrupt:event_record:frame/event/schema/')
    identity = 'dg5/site/pm_goal_test_storage.py:583'
    decode_case('decode_header_version', _rebuild_frame(base, header_raw=storage.canonical(
        [2] + list(header[1:]))), 0, None, 'Unsupported:header_version',
        target=('dg5/site/pm_goal_test_storage.py:555', identity))
    decode_case('decode_header_shape', _rebuild_frame(base, header_raw=storage.canonical(
        list(header[:7]))), 0, None, 'Corrupt:header_shape',
        target=('dg5/site/pm_goal_test_storage.py:558', identity))
    control = storage.encode_commit_frame(copy.deepcopy(commit_payload), generation, last)
    decode_case('decode_control_header', base + _rebuild_frame(
        control, header_raw=storage.canonical(list(header))), len(base), last,
        'Corrupt:control_header_mismatch')
    typed = copy.deepcopy(data['base_event'])
    typed['event_type'] = storage.CONTROL_TYPE
    decode_case('decode_control_type_data', _rebuild_frame(
        base, header_raw=storage.canonical([header[0], header[1], storage.CONTROL_TYPE] + list(header[3:])),
        payload_raw=storage.canonical(typed)), 0, None, 'Corrupt:control_header_mismatch')
    decode_case('decode_control_sequence', storage.encode_commit_frame(
        copy.deepcopy(commit_payload), generation, last), 0, None, 'Corrupt:control_sequence')

    def commit_case(case_id, mutate, expected):
        payload = copy.deepcopy(commit_payload)
        mutate(payload)
        frame = storage.encode_commit_frame(payload, generation, last)
        decode_case(case_id, base + frame, len(base), last, expected)

    commit_case('commit_keys', lambda p: p.update(extra=1), 'Corrupt:commit_payload_shape')
    commit_case('commit_u64', lambda p: p.update(manifest_generation=-1), 'Corrupt:commit_payload_shape')
    commit_case('commit_durability', lambda p: p.update(durability_class='weird'),
                'Corrupt:commit_payload_shape')
    commit_case('commit_name_empty', lambda p: p.update(segment_name=''), 'Corrupt:commit_payload_shape')
    commit_case('commit_time', lambda p: p.update(acknowledged_at_utc='2026-01-01T00:00:00+00:00'),
                'Corrupt:commit_payload_shape')
    commit_case('commit_restore', lambda p: p.update(restore_admission={}),
                'Unsupported:restore_admission_unadmitted')
    commit_case('commit_members_empty', lambda p: p.update(members=[]), 'Corrupt:commit_payload_shape')
    commit_case('commit_member_shape', lambda p: p.update(members=[[1, 2]]), 'Corrupt:commit_payload_shape')
    commit_case('commit_identity', lambda p: p.update(last_sequence=last - 1),
                'Corrupt:commit_payload_identity')


def _pickle_original_handle():
    """Whole-call entry for the :302 handle case.

    pickle.dumps is a builtin without __code__, so the bridge cannot bind it
    as the original callable; this Python-level entry performs the identical
    call (the bridge builtin gap is recorded as a DG5 tool issue).
    """
    return pickle.dumps(A.OriginalHandle())


def _pure_supplements(suite, work):
    """DG5 negatives for routed sites in pure shared checkers (reducer/codecs/handles).

    Each action is the original whole shared call itself, run through
    bridge.entry_call over a real Storage root with the routed site declared.
    """
    def pure(case_id, make_action, expected, target):
        def run():
            store = storage.TestOwnerStorage.create(work / ('pure-' + case_id.replace(':', '-')))
            action, original, arguments = make_action()
            try:
                if bridge.tables.COLLECTOR is None:
                    return action()
                case = bridge.CASE[0]
                return bridge.entry_call(case, case['id'] + '/pure', FAMILY, action, store.root,
                                         world=store, arguments=arguments, original=original, target=target)
            except source.Halt as error:
                # The original suite names halts by their plain reducer code (as _halt does).
                raise source.SourceRefusal(error.code) from error

        suite.negative('dg5-shared', case_id, run, expected)

    def step_case(case_id, first, second, expected):
        def make():
            reducer = source.LifecycleReducer('run')
            state = reducer.initial()
            if first is not None:
                state = reducer.step(state, first, dict(group_digest='g'))
            return (lambda: reducer.step(state, second, dict(group_digest='g'))), \
                source.LifecycleReducer.step, dict(args=(state, second, dict(group_digest='g')), kwargs={})

        pure(case_id, make, expected, 'dg5/site/pm_goal_test_source.py:' + case_id.rsplit(':', 1)[-1])

    step_case('source_step_unsupported:598', None,
              dict(event_type='goal_run.replanned', event_id='e1', sequence_id=1),
              'reducer/unsupported_same_run:goal_run.replanned')
    step_case('source_step_terminal_without_start:605', None,
              dict(event_type='goal_run.cancelled', event_id='e1', sequence_id=1),
              'reducer/terminal_without_start')
    step_case('source_step_unsupported_after_start:598',
              dict(event_type='goal_run.started', event_id='e1', sequence_id=1),
              dict(event_type='goal_run.replanned', event_id='e2', sequence_id=2),
              'reducer/unsupported_same_run:goal_run.replanned')
    step_case('source_step_duplicate_start:601',
              dict(event_type='goal_run.started', event_id='e1', sequence_id=1),
              dict(event_type='goal_run.started', event_id='e2', sequence_id=2),
              'reducer/duplicate_start')
    pure(' canonical_nonfinite:75'.strip(),
         lambda: ((lambda: A.canonical(float('inf'))), A.canonical, dict(args=(float('inf'),), kwargs={})),
         'adapter/canonical/numrule/physical_nonfinite', 'dg5/site/pm_goal_test_owner_adapters.py:75')
    pure('exact_json_float:415',
         lambda: ((lambda: A.exact_json(1.5)), A.exact_json, dict(args=(1.5,), kwargs={})),
         'custody/exact_json/float', 'dg5/site/pm_goal_test_owner_adapters.py:415')
    pure('exact_json_bytes:428',
         lambda: ((lambda: A.exact_json(b'x')), A.exact_json, dict(args=(b'x',), kwargs={})),
         'custody/exact_json/type', 'dg5/site/pm_goal_test_owner_adapters.py:428')
    def event_record_make():
        store = storage.TestOwnerStorage.create(work / 'pure-event-schema')
        _handle, out, _rows = selftest.append_one(store, 'dg5-event-schema')
        event = store.read_event(out['event_ids'][0])
        bad = {k: v for k, v in event.items() if k != 'correlation_id'}
        return (lambda: storage.validate_event_record(bad, 'append/event')), \
            storage.validate_event_record, dict(args=(bad, 'append/event'), kwargs={})

    pure('event_record_schema:473', event_record_make,
         'append/event/schema/', 'dg5/site/pm_goal_test_storage.py:473')

    def bank_no_uri_make():
        entries = [dict(path='Plans/seglog_frame_v2_wire_fixtures.json')]
        return (lambda: _rootbank_of(entries)), _rootbank_of, dict(args=(entries,), kwargs={})

    _bank_path = 'Plans/goal_certified_event_coordinator_contracts/schemas/coordinator.v1.schema.json'
    _bank_uri = json.loads((bridge.ROOT / _bank_path).read_text())['$id']

    def bank_rebound_make():
        entries = [dict(path=_bank_path), dict(path='Plans/event_record.schema.json', retrieval_uri=_bank_uri)]
        return (lambda: _rootbank_of(entries)), _rootbank_of, dict(args=(entries,), kwargs={})

    pure('bank_no_uri:267', bank_no_uri_make,
         'bank/uri/Plans/seglog_frame_v2_wire_fixtures.json', 'dg5/site/pm_goal_test_owner_adapters.py:267')
    pure('bank_uri_rebound:268', bank_rebound_make,
         'bank/no_rebinding/' + _bank_uri, 'dg5/site/pm_goal_test_owner_adapters.py:268')
    pure('generic_source_storage_type:239',
         lambda: ((lambda: _generic_source_of(dict())), _generic_source_of, dict(args=(dict(),), kwargs={})),
         'source/storage_type', 'dg5/site/pm_goal_test_source.py:239')
    pure('storage_u64_negative:197',
         lambda: ((lambda: storage.u64(-1, 'dg5/shared')), storage.u64, dict(args=(-1, 'dg5/shared'), kwargs={})),
         'dg5/shared/numrule/integer_range', 'dg5/site/pm_goal_test_storage.py:197')
    pure('handle_not_serializable:302',
         lambda: (_pickle_original_handle, _pickle_original_handle, dict(args=(), kwargs={})),
         'handle/not_serializable', 'dg5/site/pm_goal_test_owner_adapters.py:302')
    pure('handle_not_copyable_copy:305',
         lambda: ((lambda: copy.copy(A.OriginalHandle())), copy.copy, dict(args=(), kwargs={})),
         'handle/not_copyable', 'dg5/site/pm_goal_test_owner_adapters.py:305')
    pure('handle_not_copyable_deepcopy:308',
         lambda: ((lambda: copy.deepcopy(A.OriginalHandle())), copy.deepcopy, dict(args=(), kwargs={})),
         'handle/not_copyable', 'dg5/site/pm_goal_test_owner_adapters.py:308')


def main():
    install()
    base = Path(os.environ['PM_DG5_SCRATCH'])
    base.mkdir(parents=True, exist_ok=True)
    # One fresh work root per main() call: generate+prove runs this source twice in
    # one process, and fixed store dirs refuse the second pass (storage/create_empty).
    scratch = Path(tempfile.mkdtemp(prefix='adapter-', dir=base))
    saved = sys.argv
    sys.argv = [selftest.__file__, '--output', str(scratch / 'adapter-selftest-source.json'), '--skip-matrix']
    try:
        code = selftest.main()
    finally:
        sys.argv = saved
    supplement_suite = selftest.Suite()
    supplements(supplement_suite, scratch / 'adapter-supplements')
    rows = [dict(case, ok=case['status'] == 'pass', qualification='TEST_ONLY')
            for case in supplement_suite.cases]
    DG5_EVIDENCE.update(family=FAMILY, original_suite=str(scratch / 'adapter-selftest-source.json'),
                        supplement_rows=rows)
    return code or (1 if any(not row['ok'] for row in rows) else 0)
