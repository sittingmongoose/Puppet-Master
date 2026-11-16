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
import functools
import inspect
import json
import os
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
