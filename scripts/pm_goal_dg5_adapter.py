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
    scratch = Path(os.environ['PM_DG5_SCRATCH'])
    scratch.mkdir(parents=True, exist_ok=True)
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
