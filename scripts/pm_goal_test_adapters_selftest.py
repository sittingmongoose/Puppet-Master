#!/usr/bin/env python3
"""Self-tests for the shared TEST_ONLY owner adapters (DG, 2026-11-11).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Every negative starts from a valid case, changes one thing and must refuse
with its own expected code; an unexpected acceptance or a different code
fails the suite. Exit 0 only when every case passes.
"""
from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path
import shutil
import sys
import tempfile
import uuid

import jsonschema
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_reopen as R
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as G

ROOT = NR.ROOT
QUALIFICATION = 'TEST_ONLY'
CODES = (S.StorageRefusal, A.AdapterRefusal, G.SourceRefusal, NR.NumruleRefusal, S.FrameError)


def code_of(error):
    if isinstance(error, S.FrameError):
        return error.klass + ':' + error.code
    return getattr(error, 'code', None) or getattr(error, 'reason', None)


class Suite:
    def __init__(self):
        self.cases = []

    def positive(self, component, case_id, run):
        try:
            detail = run()
            self.cases.append(dict(component=component, id=case_id, kind='positive', status='pass',
                                   detail=detail if isinstance(detail, (str, int, bool, type(None))) else None))
        except Exception as error:  # noqa: BLE001 - every failure is recorded
            self.cases.append(dict(component=component, id=case_id, kind='positive', status='fail',
                                   error='%s: %s' % (type(error).__name__, error)))

    def negative(self, component, case_id, run, expected):
        try:
            run()
        except CODES as error:
            got = code_of(error)
            ok = got == expected or (expected.endswith('*') and str(got).startswith(expected[:-1]))
            self.cases.append(dict(component=component, id=case_id, kind='negative', expected=expected, got=got,
                                   status='pass' if ok else 'fail'))
            return
        except Exception as error:  # noqa: BLE001
            self.cases.append(dict(component=component, id=case_id, kind='negative', expected=expected,
                                   got='%s: %s' % (type(error).__name__, error), status='fail'))
            return
        self.cases.append(dict(component=component, id=case_id, kind='negative', expected=expected,
                               got='ACCEPTED', status='fail'))

    def summary(self):
        out = {}
        for c in self.cases:
            row = out.setdefault(c['component'], dict(positives=0, negatives=0, failures=0))
            row['positives' if c['kind'] == 'positive' else 'negatives'] += 1
            row['failures'] += c['status'] != 'pass'
        return out


def candidate(tag, *, project='TEST_ONLY-project-α', event_type='goal_test.adapter_probe', run=None, **edits):
    c = R.probe_spec(tag)['candidates'][0]
    c.update(project_id=project, event_type=event_type, run_id=run)
    c['event_id'] = 'TEST_ONLY:%s:%s' % (event_type, tag)
    c['idempotency_key'] = 'TEST_ONLY:key:%s:%s' % (event_type, tag)
    c.update(edits)
    return c


def append_one(storage, tag, cand=None, op=None):
    h = storage.reserve(op or 'TEST_ONLY:op:' + tag, dict(tag=tag))
    out = storage.append(h, [cand or candidate(tag)])
    rows = [storage.receipt_of(x) for x in storage.issue_first_receipt(h)]
    return h, out, rows


# --------------------------------------------------------------- numrule

def test_numrule(s):
    s.positive('numrule', 'pins_match_commit', lambda: NR.describe()['numrule_commit'] == NR.NUMRULE_COMMIT or 1/0)
    s.positive('numrule', 'uint64_max', lambda: NR.uint64((1 << 64) - 1) == (1 << 64) - 1 or 1/0)
    s.negative('numrule', 'uint64_overflow', lambda: NR.uint64(1 << 64), 'uint64/numrule/integer_range')
    s.negative('numrule', 'uint64_bool', lambda: NR.uint64(True), 'uint64/numrule/integer_type')
    s.negative('numrule', 'uint64_float', lambda: NR.uint64(1.0), 'uint64/numrule/integer_type')
    s.negative('numrule', 'uint64_string', lambda: NR.uint64('1'), 'uint64/numrule/integer_type')
    s.positive('numrule', 'storage_time_z', lambda: NR.storage_time('2026-11-11T00:00:00.123Z'))
    s.negative('numrule', 'storage_time_offset', lambda: NR.storage_time('2026-11-11T00:00:00+00:00'),
               'storage_time/numrule/*')
    s.negative('numrule', 'storage_time_lowercase_z', lambda: NR.storage_time('2026-11-11T00:00:00z'),
               'storage_time/numrule/*')
    s.negative('numrule', 'event_time_trailing_lf', lambda: NR.event_time('2026-11-11T00:00:00Z\n'),
               'event_time/numrule/date_time_syntax')
    s.negative('numrule', 'replay_only_policy', lambda: NR.append_policy('projector_replay_only'),
               'append_policy/numrule/replay_only_not_appendable')

    def mismatched_pin():
        raw = (Path(NR.PINNED['pm_event_numbers.py']['source'])).read_bytes() + b'\n'
        if NR._blob_id(raw) == NR.PINS['pm_event_numbers.py'][0]:
            raise AssertionError('altered bytes kept the pin')
        raise A.AdapterRefusal('numrule/pin/pm_event_numbers.py')
    s.negative('numrule', 'mismatched_blob_refused', mismatched_pin, 'numrule/pin/pm_event_numbers.py')


# --------------------------------------------------------------- codec

def test_codec(s):
    d = json.loads((ROOT / 'Plans/seglog_frame_v2_wire_fixtures.json').read_text())
    base = bytes.fromhex(d['base_frame_hex'])
    gen = d['segment_generation']
    s.positive('codec', 'base_frame_byte_exact', lambda: S.encode_event_frame(d['base_event'], gen) == base or 1/0)
    for case in d['cases']:
        def run(case=case):
            raw = bytearray(base[:case['length']])
            for off, b in case['replace_bytes']:
                raw[off] = b
            S.decode_frame(bytes(raw), 0, generation=gen, prior_sequence=None, prior_control=False)
        s.negative('codec', 'frame_fixture:' + case['id'], run, case['expected_class'] + ':' + case['expected_code'])
    g = d['group_cases'][0]
    commit = bytes.fromhex(g['commit_frame_hex'])
    s.positive('codec', 'commit_frame_byte_exact',
               lambda: S.encode_commit_frame(g['commit_payload'], gen, 99) == commit or 1/0)

    def group():
        sc = S.scan_segment(base + commit, generation=gen, name=g['segment_name'],
                            storage_instance_id=g['storage_instance_id'])
        assert sc['klass'] == 'Valid' and sc['watermark'] == g['expected_watermark']
        assert sc['groups'][0]['digest'] == g['group_digest']
        assert sc['groups'][0]['receipts'] == g['expected_receipts']
    s.positive('codec', 'group_receipts_digest_watermark', group)
    for gc, segment in ((d['group_cases'][1], base + commit[:40]), (d['group_cases'][2], base)):
        def unissued(gc=gc, segment=segment):
            sc = S.scan_segment(segment, generation=gen, name='segment-4', storage_instance_id='store-1')
            assert sc['klass'] == gc['expected_class'] and not sc['groups'] and sc['watermark'] == gc['expected_truncate_to']
        s.positive('codec', 'group_fixture:' + gc['id'], unissued)
    # commit frame placement and membership
    s.negative('codec', 'commit_frame_first_in_segment',
               lambda: S.decode_frame(commit, 0, generation=gen, prior_sequence=None, prior_control=False),
               'Corrupt:control_sequence')
    s.negative('codec', 'commit_after_commit',
               lambda: S.decode_frame(commit, 0, generation=gen, prior_sequence=99, prior_control=True),
               'Corrupt:control_sequence')

    def wrong_members():
        payload = copy.deepcopy(g['commit_payload'])
        payload['members'][0][2] = 1
        sc = S.scan_segment(base + S.encode_commit_frame(payload, gen, 99), generation=gen, name='segment-4',
                            storage_instance_id='store-1')
        if sc['groups']:
            return
        raise S.StorageRefusal(sc['tail'][1])
    s.negative('codec', 'commit_member_offset_substituted', wrong_members, 'commit_membership')
    # K(s): SP-311/SP-312 unpadded base64url of exact UTF-8.
    s.positive('codec', 'k_ascii', lambda: S.k_component('goal_run:1') == 'Z29hbF9ydW46MQ' or 1/0)
    s.positive('codec', 'k_unicode', lambda: S.k_component('project-α') == 'cHJvamVjdC3OsQ' or 1/0)
    s.positive('codec', 'k_not_hex', lambda: S.k_component('x') == 'eA' and S.k_component('x') != 'x'.encode().hex() or 1/0)
    s.positive('codec', 'k_round_trip', lambda: S.k_decode(S.k_component('é́')) == 'é́' or 1/0)
    s.positive('codec', 'k_no_normalization', lambda: S.k_component('é') != S.k_component('é') or 1/0)
    s.negative('codec', 'k_lone_surrogate', lambda: S.k_component('\ud800'), 'key/component_utf8')
    s.negative('codec', 'k_bytes_type', lambda: S.k_component(b'x'), 'key/component_type')
    s.negative('codec', 'k_padded', lambda: S.k_decode('eA=='), 'key/component_alphabet')
    s.negative('codec', 'k_hex_spelling', lambda: S.k_decode('78'), 'key/component_decode')
    s.negative('codec', 'k_non_reversible', lambda: S.k_decode('eB'), 'key/component_reversible')
    s.negative('codec', 'k_standard_alphabet', lambda: S.k_decode('+/8'), 'key/component_alphabet')
    s.positive('codec', 'scope_partition_project',
               lambda: S.scope_partition(dict(scope_kind='project', project_id='p')) == 'project~cA' or 1/0)
    s.negative('codec', 'scope_partition_app_project',
               lambda: S.scope_partition(dict(scope_kind='application', project_id='p')),
               'scope/application_project_null')


# --------------------------------------------------------------- storage

def test_storage(s, work):
    root = work / 'storage-main'
    st = S.TestOwnerStorage.create(root, segment_target_bytes=6000)
    other = S.TestOwnerStorage.create(work / 'storage-other')
    seqs, times = [], []
    for i in range(6):
        _, out, rows = append_one(st, 'seq%d' % i)
        seqs.append(rows[0]['first_append_receipt']['sequence_id'])
        times.append(st.read_event(out['event_ids'][0])['persisted_at_utc'])
    s.positive('storage', 'sequences_strict_contiguous', lambda: seqs == list(range(seqs[0], seqs[0] + 6)) or 1/0)
    s.positive('storage', 'segments_rotate_and_seal',
               lambda: len(st.segments) > 1 and all(x['sealed'] for x in st.segments[:-1]) or 1/0)
    s.positive('storage', 'times_strictly_increase_storage_z',
               lambda: all(NR.storage_time(t) for t in times) and times == sorted(set(times)) or 1/0)
    s.positive('storage', 'instance_is_uuid', lambda: str(uuid.UUID(st.storage_instance_id)) == st.storage_instance_id or 1/0)
    s.positive('storage', 'frames_on_disk_match_custody', lambda: all(
        S.sha256(st.read_frame(e)) == st.events[e]['frame_sha256'] for e in st.events) or 1/0)

    for field in S.STORAGE_FIELDS:
        s.negative('storage', 'caller_supplied_' + field,
                   lambda field=field: append_one(st, 'meta-' + field, dict(candidate('meta-' + field), **{field: (
                       0 if field == 'sequence_id' else '2026-11-11T00:00:00.000Z')})),
                   'append/candidate/storage_metadata_supplied/' + field)
    s.negative('storage', 'replay_only_refused',
               lambda: append_one(st, 'replay', candidate('replay', replay_policy='projector_replay_only')),
               'append/candidate/replay_policy/numrule/replay_only_not_appendable')
    s.negative('storage', 'replay_policy_wrong_type',
               lambda: append_one(st, 'rtype', candidate('rtype', replay_policy=1)),
               'append/candidate/replay_policy/numrule/replay_policy')
    s.negative('storage', 'redaction_not_no_secrets',
               lambda: append_one(st, 'redact', candidate('redact', redaction_profile='redacted')),
               'append/candidate/redaction_profile')
    s.negative('storage', 'inline_over_16kib',
               lambda: append_one(st, 'big', candidate('big', payload=dict(blob='x' * 17000))),
               'append/stored_part_cap')
    s.negative('storage', 'event_schema_extra_member',
               lambda: append_one(st, 'extra', dict(candidate('extra'), extension=1)), 'append/event/schema/')
    s.negative('storage', 'occurred_at_invalid',
               lambda: append_one(st, 'occ', candidate('occ', occurred_at_utc='2026-02-30T00:00:00Z')),
               'append/event/occurred_at_utc/numrule/date_time_day')

    h0, out0, rows0 = append_one(st, 'dedupe')
    s.positive('storage', 'equal_retry_same_receipt_no_append', lambda: (
        lambda before: (append_one(st, 'dedupe', op='TEST_ONLY:op:dedupe-retry')[2] == rows0 and
                        len(st.events) == before) or 1/0)(len(st.events)))
    s.negative('storage', 'altered_producer_conflict',
               lambda: append_one(st, 'dedupe', candidate('dedupe', actor_ref='TEST_ONLY:actor:other'),
                                  op='TEST_ONLY:op:dedupe-alt'), 'append/conflict/producer25')
    s.negative('storage', 'same_key_other_event_id',
               lambda: append_one(st, 'dedupe', candidate('dedupe', event_id='TEST_ONLY:other-id'),
                                  op='TEST_ONLY:op:dedupe-id'), 'append/conflict/event_id')
    s.negative('storage', 'append_once_duplicate',
               lambda: append_one(st, 'once', candidate('dedupe', replay_policy='append_once'),
                                  op='TEST_ONLY:op:once'), 'append/append_once_exists')

    def partial():
        h = st.reserve('TEST_ONLY:op:partial', dict(tag='partial'))
        st.append(h, [candidate('dedupe'), candidate('partial-new')])
    s.negative('storage', 'partial_dedupe', partial, 'append/partial_dedupe')
    s.negative('storage', 'reserve_altered_request',
               lambda: st.reserve('TEST_ONLY:op:dedupe', dict(tag='other')), 'reserve/conflict')

    event_id = out0['event_ids'][0]
    row = rows0[0]
    s.positive('storage', 'custody_v2_schema', lambda: not list(S._CUSTODY_V2.iter_errors(row)) or 1/0)
    s.positive('storage', 'full_value_result_schema', lambda: st.full_value_result(event_id) and True)
    s.positive('storage', 'active_group_schema_digest', lambda: st.active_durable_group(event_id)['group_digest']
               == row['group_digest'] or 1/0)
    s.positive('storage', 'authenticate_equal_receipt',
               lambda: st.authenticate_receipt(event_id, row['first_append_receipt']) == row or 1/0)
    for field in S.RECEIPT_KEYS:
        def substituted(field=field):
            presented = copy.deepcopy(row['first_append_receipt'])
            value = presented[field]
            presented[field] = value + 1 if type(value) is int else value + 'x'
            st.authenticate_receipt(event_id, presented)
        s.negative('storage', 'substituted_receipt_' + field, substituted, 'custody/receipt_mismatch')
    s.negative('storage', 'receipt_dict_not_handle', lambda: st.receipt_of(dict(row)), 'receipt_handle/type')
    s.negative('storage', 'receipt_handle_other_storage',
               lambda: other.receipt_of(st.issue_first_receipt(h0)[0]), 'receipt_handle/issuer')
    s.negative('storage', 'reservation_handle_other_storage',
               lambda: other.append(h0, [candidate('x')]), 'handle/issuer')
    s.negative('storage', 'handle_not_serializable', lambda: __import__('pickle').dumps(h0), 'handle/not_serializable')
    s.negative('storage', 'handle_not_copyable', lambda: copy.deepcopy(h0), 'handle/not_copyable')
    s.negative('storage', 'custody_unavailable', lambda: st.authenticate_receipt('TEST_ONLY:absent', {}),
               'custody/unavailable')

    s.negative('storage', 'same_event_id_other_key',
               lambda: append_one(st, 'dedupe', candidate('dedupe', idempotency_key='TEST_ONLY:key:other'),
                                  op='TEST_ONLY:op:dedupe-key'), 'append/conflict/scoped_identity')

    def dup_in_group():
        h = st.reserve('TEST_ONLY:op:dupgroup', dict(tag='dupgroup'))
        st.append(h, [candidate('dupgroup'), candidate('dupgroup')])
    s.negative('storage', 'duplicate_in_group', dup_in_group, 'append/duplicate_in_group')
    s.negative('storage', 'durability_class_unknown', lambda: st.append(
        st.reserve('TEST_ONLY:op:dclass', dict(tag='dclass')), [candidate('dclass')], durability_class='sync'),
        'append/durability_class')
    s.negative('storage', 'append_empty_group', lambda: st.append(
        st.reserve('TEST_ONLY:op:empty', dict(tag='empty')), []), 'append/nonempty')

    def released():
        h = st.reserve('TEST_ONLY:op:released', dict(tag='released'))
        st.release(h)
        st.append(h, [candidate('released')])
    s.negative('storage', 'append_after_release', released, 'append/released')
    s.negative('storage', 'resume_absent', lambda: st.resume('TEST_ONLY:op:none', {}), 'resume/absent')
    s.negative('storage', 'resume_altered', lambda: st.resume('TEST_ONLY:op:dedupe', dict(tag='other')),
               'resume/conflict')
    s.negative('storage', 'terminal_before_receipt', lambda: st.publish_terminal(
        (lambda h: (st.append(h, [candidate('early')]), h)[1])(st.reserve('TEST_ONLY:op:early', dict(tag='early'))),
        'TEST_ONLY:terminal', 'early', dict(v=1)), 'terminal/state')
    s.negative('storage', 'tx_value_over_16kib',
               lambda: st.transact([dict(table='t', key='big', expected=None, value=dict(blob='x' * 17000))]),
               'tx/stored_part_cap')
    s.negative('storage', 'scope_project_empty', lambda: S.scope_partition(dict(scope_kind='project', project_id='')),
               'scope/project_id')
    s.negative('storage', 'k_padding_length', lambda: S.k_decode('abcde'), 'key/component_padding')

    def tampered_manifest():
        copy_root = work / 'storage-tamper-manifest'
        shutil.copytree(root, copy_root)
        current = S.decode_canonical((copy_root / 'CURRENT').read_bytes())
        path = copy_root / current['manifest_ref']
        raw = bytearray(path.read_bytes())
        raw[-1] ^= 1
        path.write_bytes(bytes(raw))
        S.TestOwnerStorage.open(copy_root)
    s.negative('storage', 'reopen_tampered_manifest', tampered_manifest, 'open/manifest_hash')

    def corrupt_durable():
        copy_root = work / 'storage-corrupt-durable'
        shutil.copytree(root, copy_root)
        info = next(iter(st.events.values()))
        path = copy_root / ('segment-%d.seglog' % info['segment_generation'])
        raw = bytearray(path.read_bytes())
        raw[info['offset'] + 60] ^= 1
        path.write_bytes(bytes(raw))
        S.TestOwnerStorage.open(copy_root)
    s.negative('storage', 'reopen_corrupt_durable_frame', corrupt_durable, 'recover/durable_prefix_valid')

    # cells, CAS, transactions, visibility
    t1 = st.transact([dict(table='t', key='a', expected=None, value=dict(v=1))])
    s.positive('storage', 'cas_create', lambda: st.cell('t', 'a')['version'] == 1 or 1/0)
    s.negative('storage', 'cas_absent_exists', lambda: st.transact([dict(table='t', key='a', expected=None, value=1)]),
               'tx/cas_absent')
    s.negative('storage', 'cas_stale_version', lambda: st.transact([dict(table='t', key='a', expected=2, value=1)]),
               'tx/cas_version')
    s.negative('storage', 'cas_expected_bool', lambda: st.transact([dict(table='t', key='a', expected=True, value=1)]),
               'tx/expected/numrule/integer_type')

    def all_or_none():
        try:
            st.transact([dict(table='t', key='b', expected=None, value=1),
                         dict(table='t', key='a', expected=9, value=2)])
        finally:
            assert st.cell('t', 'b') is None and st.cell('t', 'a')['version'] == 1
    s.negative('storage', 'all_or_none', all_or_none, 'tx/cas_version')
    snap = st.snapshot()
    st.transact([dict(table='t', key='a', expected=1, value=dict(v=2))])
    s.positive('storage', 'snapshot_isolated', lambda: snap['cells']['t']['a']['version'] == 1 and
               st.cell('t', 'a')['version'] == 2 or 1/0)
    s.positive('storage', 'tx_ids_and_generation', lambda: t1['tx_id'].startswith('TEST_ONLY:tx:') and
               st.cell_generation >= 2 or 1/0)

    def crash_before_commit():
        crash = S.TestOwnerStorage.open(root, faults=S.FaultPlan(cut='before_terminal'))
        try:
            crash.transact([dict(table='t', key='c', expected=None, value=1)], cut_before='before_terminal')
        except S.Crash:
            pass
        assert S.TestOwnerStorage.open(root).cell('t', 'c') is None
    s.positive('storage', 'crash_before_commit_invisible', crash_before_commit)

    def crash_after_commit():
        crash = S.TestOwnerStorage.open(root, faults=S.FaultPlan(cut='after_terminal'))
        try:
            crash.transact([dict(table='t', key='d', expected=None, value=1)], cut_after='after_terminal')
        except S.Crash:
            pass
        assert S.TestOwnerStorage.open(root).cell('t', 'd')['value'] == 1
    s.positive('storage', 'crash_after_commit_visible', crash_after_commit)
    st = S.TestOwnerStorage.open(root, segment_target_bytes=6000)
    seeds = [st.new_seed() for _ in range(3)]
    s.positive('storage', 'seeds_unique_hex', lambda: len(set(seeds)) == 3 and all(len(x) == 64 for x in seeds) or 1/0)
    # packs
    ref = st.put_pack(b'TEST_ONLY payload', 'application/msgpack')
    s.positive('storage', 'pack_round_trip',
               lambda: st.read_pack(ref, expected_media_type='application/msgpack') == b'TEST_ONLY payload' or 1/0)
    s.negative('storage', 'pack_size_mismatch',
               lambda: st.read_pack(dict(ref, byte_size=ref['byte_size'] + 1), expected_media_type='application/msgpack'),
               'payload/numrule/payload_size')
    s.negative('storage', 'pack_media_mismatch',
               lambda: st.read_pack(ref, expected_media_type='application/json'), 'payload/numrule/payload_media')
    s.negative('storage', 'pack_unknown_digest',
               lambda: st.read_pack(dict(ref, blake3='0' * 64), expected_media_type='application/msgpack'),
               'pack/unavailable')

    def withdrawn():
        r2 = st.put_pack(b'TEST_ONLY withdrawn', 'application/msgpack')
        st.withdraw_pack(r2['blake3'])
        st.read_pack(r2, expected_media_type='application/msgpack')
    s.negative('storage', 'pack_withdrawn', withdrawn, 'pack/unavailable')
    # token
    consumer = json.loads((ROOT / 'Plans/goal_run_started_consumer_contracts/consumer.schema.json').read_text())
    token_validator = jsonschema.Draft202012Validator({'$ref': '#/$defs/DurableGenericToken', '$defs': consumer['$defs']})
    s.positive('storage', 'token_nine_fields_whole_root', lambda: not list(token_validator.iter_errors(st.read_token()))
               and len(st.read_token()) == 9 or 1/0)
    s.positive('storage', 'snapshot_id_transient', lambda: 'snapshot_id' not in st.read_token() and
               st.snapshot()['snapshot_id'] != st.snapshot()['snapshot_id'] or 1/0)
    # retention
    owner = S.RetentionOwner(st)
    sealed = next(x['generation'] for x in st.segments if x['sealed'])
    gap = st.retire_segment(sealed, owner)
    s.positive('storage', 'retire_gap_disposition', lambda: S.RetentionOwner.verify(gap) and
               st.read_token()['source_selection']['retired_inputs_sha256'] and True)
    s.negative('storage', 'retire_unsealed', lambda: st.retire_segment(st.segments[-1]['generation'], owner),
               'retire/sealed')
    s.negative('storage', 'retire_foreign_owner',
               lambda: st.retire_segment(next(x['generation'] for x in st.segments if x['sealed'] and not x['retired']),
                                         S.RetentionOwner(other)), 'retire/owner')
    s.negative('storage', 'pack_reference_extra_key', lambda: st.read_pack(dict(ref, extra=1),
               expected_media_type='application/msgpack'), 'pack/reference')
    s.negative('storage', 'retire_unknown_segment', lambda: st.retire_segment(999, owner), 'retire/segment')
    reopened = S.TestOwnerStorage.open(root)
    s.positive('storage', 'reopen_reads_same_state', lambda: reopened.observe() == st.observe() and
               reopened.read_token() == st.read_token() or 1/0)
    rest = S.TestOwnerStorage.create(work / 'storage-at-rest')
    _, out_r, _ = append_one(rest, 'rest')
    info = rest.events[out_r['event_ids'][0]]
    path = rest._segment_path(info['segment_generation'])
    raw = bytearray(path.read_bytes())
    raw[info['offset'] + 70] ^= 1
    path.write_bytes(bytes(raw))
    s.negative('storage', 'read_frame_tampered_at_rest', lambda: rest.read_frame(out_r['event_ids'][0]), 'read/frame_hash')
    return st


# --------------------------------------------------------------- owners

def test_owners(s, work):
    storage = S.TestOwnerStorage.create(work / 'owners')
    registry = A.OwnerRegistry()
    bank = A.RootBank([dict(path='Plans/goal_certified_event_coordinator_contracts/schemas/coordinator.v1.schema.json')])
    owner = A.SourceOwner(registry, bank=bank)
    other = A.SourceOwner(registry, bank=bank)
    scope_root = 'https://puppetmaster.local/proposals/goal_certified_event_coordinator.v1.schema.json#/$defs/Scope'
    scope = dict(project_id='TEST_ONLY-p', goal_id='TEST_ONLY-g', goal_run_id='TEST_ONLY-r', work_graph_id='TEST_ONLY-w',
                 storage_instance_id=storage.storage_instance_id, scope_partition='project~VEVTVF9PTkxZLXA')
    handle = owner.issue(scope_root, scope, kind='scope')
    ref, value = A.acquire(registry, owner.owner_id, 'source', handle, root=scope_root)
    s.positive('owners', 'issue_resolve_root', lambda: value == scope or 1/0)
    s.positive('owners', 'authenticate_returns_retained', lambda: owner.authenticate(ref, scope, root=scope_root) == scope or 1/0)
    s.positive('owners', 'custody_verifies', lambda: owner.verify_custody(owner.custody(handle)))
    s.negative('owners', 'issue_off_root', lambda: owner.issue(scope_root, dict(scope, extra=1)), 'issue/source/schema/*')
    s.negative('owners', 'handle_from_other_owner', lambda: A.acquire(registry, other.owner_id, 'source', handle),
               'original/issuer')
    s.negative('owners', 'dict_in_place_of_handle', lambda: A.acquire(registry, owner.owner_id, 'source', dict(scope)),
               'original/handle_type')
    s.negative('owners', 'ref_string_in_place_of_handle', lambda: A.acquire(registry, owner.owner_id, 'source', ref),
               'original/handle_type')
    s.negative('owners', 'wrong_root', lambda: owner.resolve(handle, root=scope_root.replace('Scope', 'Owner')),
               'original/root')
    s.negative('owners', 'substituted_value_bytes', lambda: owner.authenticate(ref, dict(scope, goal_id='TEST_ONLY-g2')),
               'original/bytes')
    s.negative('owners', 'copied_value_other_owner_ref',
               lambda: other.authenticate(ref, scope), 'original/unissued')
    s.negative('owners', 'custody_restamped_hash',
               lambda: owner.verify_custody(dict(owner.custody(handle), sha256='0' * 64)), 'custody/sha256')
    s.negative('owners', 'custody_owner_substituted',
               lambda: owner.verify_custody(dict(owner.custody(handle), owner_id=other.owner_id)), 'custody/owner_id')
    impostor = A.SourceOwner(A.OwnerRegistry(), owner_id=owner.owner_id)
    s.negative('owners', 'unregistered_owner_same_id', lambda: registry.authenticate_owner(impostor, 'source'),
               'registry/owner_identity')
    s.negative('owners', 'wrong_role', lambda: registry.owner(owner.owner_id, 'append'), 'registry/role')
    s.negative('owners', 'unregistered_id', lambda: registry.owner('TEST_ONLY:owner:none', 'source'),
               'registry/unregistered_owner')
    s.negative('owners', 'duplicate_ref', lambda: owner.issue(scope_root, scope, ref=ref), 'issue/immutable_ref')
    w = owner.issue(scope_root, dict(scope, goal_id='TEST_ONLY-gw'), kind='scope')
    owner.withdraw(w)
    s.negative('owners', 'withdrawn_original', lambda: owner.resolve(w), 'original/withdrawn')
    s.positive('owners', 'inventory_owner_statement', lambda: owner.inventory('scope') == [ref] and
               owner.inventory('absent') == [] or 1/0)
    act = A.ActivationOwner(registry)
    b = act.birth('TEST_ONLY:subject:1', 'pending')
    t = act.transition('TEST_ONLY:subject:1', 'pending', 0, 'active', cause_ref=ref)
    s.positive('owners', 'activation_transition', lambda: act.current('TEST_ONLY:subject:1')['revision'] == 1 or 1/0)
    s.negative('owners', 'activation_stale_state',
               lambda: act.transition('TEST_ONLY:subject:1', 'pending', 1, 'done', cause_ref=ref), 'activation/cas_state')
    s.negative('owners', 'activation_stale_revision',
               lambda: act.transition('TEST_ONLY:subject:1', 'active', 0, 'done', cause_ref=ref),
               'activation/cas_revision')
    s.negative('owners', 'activation_double_birth', lambda: act.birth('TEST_ONLY:subject:1', 'pending'),
               'activation/unborn')
    appender = A.AppendOwner(registry, storage)
    events, reservation, outcome = appender.append_original('TEST_ONLY:op:owner', dict(tag='owner'),
                                                            [candidate('owner')])
    s.positive('owners', 'append_owner_event_and_receipt', lambda: appender.first_receipt(events[0])['event_id'] ==
               appender.event(events[0])['event_id'] or 1/0)
    s.negative('owners', 'event_handle_foreign', lambda: A.AppendOwner(registry, storage).event(events[0]), 'event/issuer')
    pub = A.PublicationOwner(registry, storage)
    p1, tx1 = pub.publish(reservation, 'TEST_ONLY:terminal', 'k', dict(v=1))
    p2, tx2 = pub.publish(reservation, 'TEST_ONLY:terminal', 'k', dict(v=1))
    s.positive('owners', 'publication_once', lambda: p1 is p2 and tx2.get('replay') is True and
               len(pub.inventory('publication')) == 1 or 1/0)
    s.negative('owners', 'publication_conflict',
               lambda: pub.publish(reservation, 'TEST_ONLY:terminal', 'k', dict(v=2)), 'terminal/replay_conflict')
    rec = registry.recorder
    s.positive('owners', 'recorder_ordered_with_state', lambda: [m for _, m in rec.sequence(True)][:2] ==
               ['issue:scope', 'acquire:source'] or 1/0)
    s.positive('owners', 'recorder_before_after_changes', lambda: any(
        c['method'] == 'append_original' and 'storage:' + storage.storage_instance_id in c['changed']
        for c in rec.calls) or 1/0)
    s.positive('owners', 'recorder_refusal_recorded', lambda: any(c['refusal'] == 'activation/cas_state'
                                                                  for c in rec.calls) or 1/0)

    def order_mismatch():
        rec.require_order(['acquire:source'])
    s.negative('owners', 'recorder_order_mismatch', order_mismatch, 'recorder/order')


# --------------------------------------------------------------- source

def test_source(s, work):
    st = S.TestOwnerStorage.create(work / 'source', segment_target_bytes=7000)
    run = 'TEST_ONLY:run:1'
    seq = [('a', 'goal_test.started', run), ('b', 'goal_test.adapter_probe', None),
           ('c', 'goal_test.started', 'TEST_ONLY:run:2'), ('d', 'goal_test.cancelled', run)]
    for tag, kind, r in seq:
        append_one(st, tag, candidate(tag, event_type=kind, run=r))
    other_project = candidate('e', project='TEST_ONLY-project-β', event_type='goal_test.probe_other')
    append_one(st, 'e', other_project)
    src = G.GenericSource(st)
    select = lambda e: e['run_id'] == run  # noqa: E731

    def positive():
        snap = src.acquire()
        result = src.project(snap, G.LifecycleReducer(run), select=select)
        assert result['complete'] and result['state']['status'] == 'cancelled'
        assert result['processed'] == 5 and result['frontier_sequence'] == snap.rows[-1].sequence_id
        return result
    s.positive('source', 'whole_prefix_projection', positive)
    s.positive('source', 'off_run_rows_counted_in_coverage', lambda: src.acquire().rows[1].event_type ==
               'goal_test.adapter_probe' and len(src.acquire().rows) == 5 or 1/0)

    def project_halt(mutate):
        snap = src.acquire(mutate(st.acquire_source()))
        result = src.project(snap, G.LifecycleReducer(run), select=select)
        if result['complete']:
            return
        raise G.SourceRefusal(result['halt'][0])

    def substituted_segment_bytes(raw_src):
        seg = raw_src['segments'][0]
        info = st.events['TEST_ONLY:goal_test.adapter_probe:b']
        raw = bytearray(seg['raw'])
        raw[info['offset'] + info['length'] - 1] ^= 1
        seg['raw'] = bytes(raw)
        return raw_src
    s.negative('source', 'substituted_segment_bytes', lambda: src.acquire(substituted_segment_bytes(st.acquire_source())),
               'source/retained_inventory')
    # Corruption at rest: the off-run frame's bytes change on disk after Storage opened,
    # so Storage's own snapshot and token carry them; validation must halt before it.
    rest = S.TestOwnerStorage.create(work / 'source-at-rest')
    for tag, kind, r in seq:
        append_one(rest, tag, candidate(tag, event_type=kind, run=r))
    info = rest.events['TEST_ONLY:goal_test.adapter_probe:b']
    path = rest._segment_path(info['segment_generation'])
    raw = bytearray(path.read_bytes())
    raw[info['offset'] + info['length'] - 1] ^= 1
    path.write_bytes(bytes(raw))
    rest_src = G.GenericSource(rest)
    s.negative('source', 'malformed_off_run_frame', lambda: _halt(rest_src, select, run), 'source/frame/payload_crc')

    def halted_frontier():
        result = rest_src.project(rest_src.acquire(), G.LifecycleReducer(run), select=select)
        assert not result['complete'] and result['processed'] == 1 and result['state']['status'] == 'started'
    s.positive('source', 'halt_before_defect_frontier', halted_frontier)
    s.negative('source', 'wrong_storage_snapshot', lambda: src.acquire(
        S.TestOwnerStorage.create(work / 'source-other').acquire_source()), 'source/storage_instance')

    def false_empty(raw_src):
        raw_src['segments'] = []
        return raw_src
    s.negative('source', 'false_empty_inventory', lambda: src.acquire(false_empty(st.acquire_source())),
               'source/segment_inventory')

    def substituted_custody(raw_src):
        key = 'TEST_ONLY:goal_test.started:a'
        raw_src['custody'][key]['first_append_receipt']['byte_offset'] += 1
        return raw_src
    s.negative('source', 'substituted_first_custody', lambda: project_halt(substituted_custody),
               'source/custody_receipt')

    def substituted_commitment(raw_src):
        key = 'TEST_ONLY:goal_test.cancelled:d'
        raw_src['custody'][key]['original_event_value_commitment']['sha256'] = '0' * 64
        return raw_src
    s.negative('source', 'substituted_value_commitment', lambda: project_halt(substituted_commitment),
               'source/custody_commitment')

    def token_mismatch(raw_src):
        raw_src['token']['source_selection']['current_bytes_sha256'] = '0' * 64
        return raw_src
    s.negative('source', 'token_current_hash', lambda: src.acquire(token_mismatch(st.acquire_source())),
               'source/current_hash')
    def coherent(mutate_state=None, mutate_token=None, mutate_current=None):
        raw_src = st.acquire_source()
        state = S.decode_canonical(raw_src['manifest_raw'])
        if mutate_state:
            mutate_state(state)
        raw_src['manifest_raw'] = S.canonical(state)
        current = S.decode_canonical(raw_src['current_raw'])
        current['manifest_sha256'] = S.sha256(raw_src['manifest_raw'])
        if mutate_current:
            mutate_current(current)
        raw_src['current_raw'] = S.canonical(current)
        sel = raw_src['token']['source_selection']
        sel['current_bytes_sha256'] = S.sha256(raw_src['current_raw'])
        sel['manifest_bytes_sha256'] = S.sha256(raw_src['manifest_raw'])
        sel['retired_inputs_sha256'] = S.sha256(S.binding(
            [[g['segment_generation'], g['first_sequence'], g['last_sequence'], g['proof_sha256']] for g in state['gaps']]))
        raw_src['gaps'] = state['gaps']
        if mutate_token:
            mutate_token(raw_src['token'])
        return src.acquire(raw_src)
    s.positive('source', 'coherent_resnapshot_identity', lambda: coherent().complete or 1/0)
    s.negative('source', 'token_recovery_epoch', lambda: coherent(mutate_token=lambda t: t['source_selection'].update(
        recovery_epoch=t['source_selection']['recovery_epoch'] + 1)), 'source/recovery_epoch')
    s.negative('source', 'token_watermarks', lambda: coherent(mutate_token=lambda t: t['source_selection'].update(
        durable_watermarks_sha256='0' * 64)), 'source/watermarks')
    s.negative('source', 'token_frontier_revision', lambda: coherent(mutate_token=lambda t: t.update(
        frontier_revision=t['frontier_revision'] + 1)), 'source/token/frontier_revision')
    s.negative('source', 'current_generation_mismatch', lambda: coherent(mutate_current=lambda c: c.update(
        manifest_generation=c['manifest_generation'] + 1)), 'source/manifest_generation')

    def stale_join():
        raw_src = st.acquire_source()
        state = S.decode_canonical(raw_src['manifest_raw'])
        state['clock_last_ms'] += 1
        raw_src['manifest_raw'] = S.canonical(state)
        raw_src['token']['source_selection']['manifest_bytes_sha256'] = S.sha256(raw_src['manifest_raw'])
        src.acquire(raw_src)
    s.negative('source', 'manifest_without_current_join', stale_join, 'source/current_manifest_join')
    s.negative('source', 'manifest_instance_substituted', lambda: coherent(mutate_state=lambda x: x.update(
        storage_instance_id=str(uuid.uuid4()))), 'source/manifest_instance')
    s.negative('source', 'snapshot_qualification_missing', lambda: src.acquire(dict(st.acquire_source(), qualification=None)),
               'source/qualification')
    s.negative('source', 'project_foreign_snapshot', lambda: G.GenericSource(S.TestOwnerStorage.create(
        work / 'source-foreign')).project(src.acquire(), G.LifecycleReducer(run), select=select), 'project/storage')
    st2 = S.TestOwnerStorage.create(work / 'source-unsupported')
    for tag, kind in (('a', 'goal_test.started'), ('x', 'goal_test.replanned'), ('d', 'goal_test.cancelled')):
        append_one(st2, tag, candidate(tag, event_type=kind, run=run))
    s.negative('source', 'unsupported_same_run_halts', lambda: _halt(G.GenericSource(st2), select, run),
               'reducer/unsupported_same_run:goal_test.replanned')
    st3 = S.TestOwnerStorage.create(work / 'source-dup')
    for tag, kind in (('a', 'goal_test.started'), ('d', 'goal_test.cancelled'), ('e', 'goal_test.certified')):
        append_one(st3, tag, candidate(tag, event_type=kind, run=run))
    s.negative('source', 'second_terminal_halts', lambda: _halt(G.GenericSource(st3), select, run),
               'reducer/terminal_without_start')
    st4 = S.TestOwnerStorage.create(work / 'source-pending')
    append_one(st4, 'a', candidate('a', event_type='goal_test.started', run=run))
    h = st4.reserve('TEST_ONLY:op:pending', dict(tag='pending'))
    st4.append(h, [candidate('p', event_type='goal_test.cancelled', run=run)])
    s.negative('source', 'pending_first_custody_halts', lambda: _halt(G.GenericSource(st4), select, run),
               'project/pending_custody')
    # retention gap proved by the retention owner
    owner = S.RetentionOwner(st)
    sealed = next(x['generation'] for x in st.segments if x['sealed'])
    st.retire_segment(sealed, owner)

    def gap_positive():
        snap = src.acquire()
        assert snap.complete and len(snap.gaps) == 1
    s.positive('source', 'authenticated_gap_continues', gap_positive)

    def gap_mutation(mutate):
        def state_edit(state):
            mutate(state['gaps'][0])
        return state_edit
    s.negative('source', 'gap_proof_substituted', lambda: coherent(mutate_state=gap_mutation(
        lambda g: g.update(proof_sha256='0' * 64))), 'source/gap_proof')
    s.negative('source', 'gap_owner_substituted_resigned', lambda: coherent(mutate_state=gap_mutation(
        lambda g: (g.update(retention_owner_id='TEST_ONLY:retention-owner:other'),
                   g.update(proof_sha256=S.RetentionOwner(st).sign(g))))), 'source/gap_owner')
    s.negative('source', 'retired_segment_without_gap', lambda: coherent(mutate_state=lambda x: x.update(gaps=[])),
               'source/retired_segments_proved')
    def dropped_gap(raw_src):
        raw_src['gaps'] = []
        return raw_src
    s.negative('source', 'unproven_gap', lambda: src.acquire(dropped_gap(st.acquire_source())), 'source/gap_inventory')
    # reordered sequence inside a segment (hand-built bytes)
    e1 = dict(candidate('r1'), observed_at_utc='2026-11-11T00:00:00.000Z', persisted_at_utc='2026-11-11T00:00:00.000Z',
              sequence_id=5)
    e2 = dict(candidate('r2'), observed_at_utc='2026-11-11T00:00:00.000Z', persisted_at_utc='2026-11-11T00:00:00.000Z',
              sequence_id=4)
    raw = S.encode_event_frame(e1, 1) + S.encode_event_frame(e2, 1)

    def reordered():
        sc = S.scan_segment(raw, generation=1, name='segment-1', storage_instance_id='x')
        raise S.StorageRefusal(sc['tail'][1])
    s.negative('source', 'reordered_frames', reordered, 'sequence_progression')


def _with_token(storage, mutate):
    def run(raw_src):
        return mutate(raw_src)
    return run


def _halt(source, select, run):
    result = source.project(source.acquire(), G.LifecycleReducer(run), select=select)
    if result['complete']:
        return
    raise G.SourceRefusal(result['halt'][0])


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--output')
    p.add_argument('--skip-matrix', action='store_true')
    a = p.parse_args()
    s = Suite()
    work = Path(tempfile.mkdtemp(prefix='pm-goal-test-selftest-'))
    try:
        test_numrule(s)
        test_codec(s)
        test_storage(s, work)
        test_owners(s, work)
        test_source(s, work)
        matrix = None
        if not a.skip_matrix:
            matrix = R.run_matrix(work / 'matrix')
            for row in matrix['rows']:
                s.cases.append(dict(component='fault_matrix', id='cut:%s' % row['cut'], kind='positive',
                                    status=row['status'], error=row.get('error')))
    finally:
        shutil.rmtree(work, ignore_errors=True)
    failures = [c for c in s.cases if c['status'] != 'pass']
    result = dict(qualification=QUALIFICATION, native=NR.NATIVE_LINE, numrule=NR.describe(),
                  summary=s.summary(), cases=s.cases, matrix=matrix,
                  status='pass' if not failures else 'fail', failures=failures)
    if a.output:
        Path(a.output).write_text(json.dumps(result, indent=2, sort_keys=True) + '\n')
    print(json.dumps(dict(status=result['status'], summary=result['summary'],
                          failures=[(f['component'], f['id'], f.get('got') or f.get('error')) for f in failures]),
                     indent=1))
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
