#!/usr/bin/env python3
"""Batch-2 self-test cases for the shared TEST_ONLY owner adapters (DG, 2026-11-12).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Run from ``pm_goal_test_adapters_selftest.py`` (same Suite, same rules: every
negative starts from a valid case, changes one thing and must refuse with its
own code). Components:

* ``images``  canonical SP-295 CURRENT/manifest, SP-278 checkpoint and GenericIndexRows;
* ``stable``  the seglog manifest generation and token under redb transactions;
* ``fence``   the 4096-ID sequence lease and the exclusive append fence;
* ``index``   the SP-278 Event Record Index read source and NativeCurrentEventSource;
* ``recorder`` observation_digest on hostile text;
* ``guards``  exact-code negatives for the 62 batch-1 guard sites that were reachable.
"""
from __future__ import annotations

import copy
import json
import pickle
from pathlib import Path
import shutil

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_reopen as R
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as G

ROOT = NR.ROOT


def _candidate(tag, **edits):
    c = R.probe_spec(tag)['candidates'][0]
    c.update(edits)
    return c


def _append(storage, tag, cand=None, receipt=True):
    h = storage.reserve('TEST_ONLY:op:' + tag, dict(tag=tag))
    out = storage.append(h, [cand or _candidate(tag)])
    if receipt:
        storage.issue_first_receipt(h)
    return h, out


def _rewrite_commit(root, mutate, *, current_mutate=None):
    """Coherently rewrite the TEST_ONLY commit record and CURRENT (hash join kept)."""
    current = S.decode_canonical((root / 'CURRENT').read_bytes())
    state = S.decode_canonical((root / current['manifest_ref']).read_bytes())
    mutate(state)
    raw = S.canonical(state)
    (root / current['manifest_ref']).write_bytes(raw)
    current['manifest_sha256'] = S.sha256(raw)
    if current_mutate:
        current_mutate(current)
    (root / 'CURRENT').write_bytes(S.canonical(current))


# --------------------------------------------------------------- images

def test_images(s, work):
    st = S.TestOwnerStorage.create(work / 'b2-images', segment_target_bytes=3000)
    for i in range(6):
        _append(st, 'img%d' % i)
    images = st.canonical_images()
    manifest = S.decode_canonical(images['manifest_raw'])
    current = S.decode_canonical(images['current_raw'])
    checkpoint = S.decode_canonical(images['checkpoint_raw'])
    lease = S.decode_canonical(images['sequence_lease_raw'])
    s.positive('images', 'canonical_schemas', lambda: not (
        list(S._NATIVE_CURRENT.iter_errors(current)) or list(S._NATIVE_MANIFEST.iter_errors(manifest)) or
        list(S._NATIVE_LEASE.iter_errors(lease)) or list(S._INDEX_CHECKPOINT.iter_errors(checkpoint))) or 1/0)
    s.positive('images', 'rows_generic_index_row_schema', lambda: all(
        not list(S._INDEX_ROW.iter_errors(r)) and k == S.index_row_key(r) for k, r in images['index_rows']) and
        len(images['index_rows']) == 6 or 1/0)
    s.positive('images', 'token_from_canonical_bytes', lambda: st.read_token()['source_selection'] ==
               S.source_selection_of(images['current_raw'], images['manifest_raw']) or 1/0)
    s.positive('images', 'token_names_checkpoint_node', lambda: st.read_token()['checkpoint_ref'] ==
               images['checkpoint_key'] + '#/generations/' + checkpoint['current_generation_id'] and
               st.read_token()['frontier_sha256'] == S.index_digest(
                   checkpoint['generations'][checkpoint['current_generation_id']]['frontier']) or 1/0)

    def exported():
        root = st.root / 'storage'
        assert (root / 'seglog' / 'CURRENT').read_bytes() == images['current_raw']
        assert (root / 'seglog' / 'manifest.v1.msgpack').read_bytes() == images['manifest_raw']
        assert (root / 'redb' / 'checkpoints' / images['checkpoint_key']).read_bytes() == images['checkpoint_raw']
        rows = S.decode_canonical((root / 'redb' / images['index_dataset_name']).read_bytes())
        assert rows == dict(images['index_rows'])
        return True
    s.positive('images', 'exported_files_equal_committed', exported)

    def renamed():
        entry = manifest['selection_entries'][0]
        sealed = [x for x in entry['retained_inventory'] if x['state'] == 'closed']
        assert sealed and all(x['segment_name'].endswith('.seglog') and x['namespace_revision'] == 1 for x in sealed)
        bound = {b['physical_segment_id']: b for b in entry['namespace_bindings']}
        assert all(bound[x['physical_segment_id']]['original_segment_name'].endswith('.active') for x in sealed)
        # Rows keep their original locator; the binding resolves it to the current name.
        names = {b['original_segment_name'] for b in bound.values()}
        assert any(r['source_locator']['segment_name'] in names for _, r in images['index_rows'])
        return True
    s.positive('images', 'sealed_rename_namespace_binding', renamed)

    vectors = json.loads((ROOT / 'Plans/event_record_index_binding_hash_vectors.json').read_text())
    s.positive('images', 'binding_digest_canon_vectors', lambda: all(
        S.index_digest(v['value']) == v['binding_sha256'] for v in vectors['vectors']) or 1/0)
    fixtures = json.loads((ROOT / 'Plans/event_record_index_checkpoint_contract_fixtures.json').read_text())

    def fixture_recipes():
        for name, p in fixtures['positive'].items():
            ck = p['checkpoint']
            for gid, node in ck['generations'].items():
                anchor = node['anchor']
                assert S.generation_id_of(ck['storage_instance_id'], anchor['source_selection'],
                                          anchor['generation_seed_sha256']) == gid, name
                rows = p['datasets'].get(node['index_dataset_name'])
                if rows is not None and gid == ck['current_generation_id']:
                    assert S.row_set_digest(rows) == node['frontier']['index_row_set_sha256'], name
        cs = fixtures['positive']['allocator_gap']['current_source']
        m, sel = cs['manifest'], cs['source_selection']
        assert S.index_digest(m['retained_inventory']) == sel['retained_inventory_sha256']
        assert S.index_digest(m['excluded_ranges']) == sel['excluded_ranges_sha256']
        import base64
        entries = [dict(sequence_id=f['event']['sequence_id'], event_id=f['event']['event_id'],
                        scope_partition=S.scope_partition(f['event']),
                        source_value_bytes_sha256=S.sha256(base64.b64decode(f['source_value_bytes_base64'])))
                   for f in cs['frames']]
        assert S.retained_prefix_digest(entries) == m['survivor_prefix_sha256']
        return True
    s.positive('images', 'sp278_recipes_reproduce_canon_fixtures', fixture_recipes)

    def reopen_case(name, mutate=None, current_mutate=None):
        root = work / ('b2-img-' + name)
        shutil.copytree(st.root, root)
        _rewrite_commit(root, mutate or (lambda x: None), current_mutate=current_mutate)
        S.TestOwnerStorage.open(root)

    def m_manifest(state):
        state['canonical']['manifest']['selection_entries'][0]['retained_inventory'][0]['origin_operation_ref'] += 'x'
    s.negative('images', 'reopen_canonical_manifest_substituted', lambda: reopen_case('man', m_manifest),
               'open/canonical_manifest')
    s.negative('images', 'reopen_canonical_current_substituted', lambda: reopen_case(
        'cur', lambda x: x['canonical']['current'].update(birth_operation_ref='TEST_ONLY:other-birth')),
        'open/canonical_current')
    s.negative('images', 'reopen_canonical_generation_mismatch', lambda: reopen_case(
        'gen', lambda x: x['canonical']['manifest'].update(manifest_generation=x['manifest_generation'] + 1)),
        'open/canonical_generation')
    s.negative('images', 'reopen_commit_generation_mismatch', lambda: reopen_case(
        'cg', current_mutate=lambda c: c.update(commit_generation=c['commit_generation'] + 1)),
        'open/commit_generation')

    def m_rowset(state):
        ck = state['canonical']['checkpoint']
        ck['generations'][ck['current_generation_id']]['frontier']['index_row_set_sha256'] = '0' * 64
    s.negative('images', 'reopen_index_row_set_substituted', lambda: reopen_case('rows', m_rowset), 'open/index_row_set')
    s.negative('images', 'reopen_index_checkpoint_extension', lambda: reopen_case(
        'ckx', lambda x: x['canonical']['checkpoint'].update(extension=1)), 'open/index_checkpoint')

    def restored_without_exports():
        root = work / 'b2-img-noexport'
        shutil.copytree(st.root, root)
        shutil.rmtree(root / 'storage')
        again = S.TestOwnerStorage.open(root)
        assert (root / 'storage' / 'seglog' / 'manifest.v1.msgpack').read_bytes() == images['manifest_raw']
        assert again.read_token() == st.read_token()
        return True
    s.positive('images', 'reopen_rewrites_missing_exports', restored_without_exports)


# --------------------------------------------------------------- stable manifest

def test_stable(s, work):
    st = S.TestOwnerStorage.create(work / 'b2-stable')
    _append(st, 'base')
    token = st.read_token()
    images = st.canonical_images()
    generation, commit = st.manifest_generation, st.commit_generation

    def redb_only():
        st.transact([dict(table='TEST_ONLY:t', key='a', expected=None, value=dict(v=1))])
        st.new_seed()
        st.put_pack(b'TEST_ONLY stable', 'application/msgpack')
        h = st.reserve('TEST_ONLY:op:stable-reserve', dict(tag='r'))
        st.release(h)
        assert st.commit_generation > commit
        assert st.manifest_generation == generation and st.read_token() == token
        now = st.canonical_images()
        assert now['current_raw'] == images['current_raw'] and now['manifest_raw'] == images['manifest_raw']
        assert now['checkpoint_raw'] == images['checkpoint_raw']
        return True
    s.positive('stable', 'redb_transactions_leave_seglog_token', redb_only)

    def custody_only():
        h = st.reserve('TEST_ONLY:op:stable-custody', dict(tag='c'))
        st.append(h, [_candidate('stable-custody')])
        before = (st.manifest_generation, st.read_token())
        st.issue_first_receipt(h)
        assert (st.manifest_generation, st.read_token()) == before
        return True
    s.positive('stable', 'first_custody_leaves_seglog_token', custody_only)

    def append_moves():
        before = st.read_token()
        g = st.manifest_generation
        _append(st, 'moves')
        after = st.read_token()
        assert st.manifest_generation == g + 1 and after['frontier_revision'] == before['frontier_revision'] + 1
        assert after['source_selection']['manifest_bytes_sha256'] != before['source_selection']['manifest_bytes_sha256']
        assert after['checkpoint_ref'] == before['checkpoint_ref'] and after['generation_id'] == before['generation_id']
        return True
    s.positive('stable', 'append_moves_generation_and_frontier_once', append_moves)

    class Decrementing(S.TestOwnerStorage):
        """DG-CA LeasedStorage pattern: lowers manifest_generation before a redb-only commit."""
        def _commit_state(self):
            if getattr(self, '_armed', False):
                self.manifest_generation -= 1
            super()._commit_state()

    def subclass_cannot_move():
        sub = Decrementing.create(work / 'b2-stable-sub')
        _append(sub, 'sub')
        g = sub.manifest_generation
        sub._armed = True
        sub.transact([dict(table='TEST_ONLY:t', key='a', expected=None, value=1)])
        sub._armed = False
        assert sub.manifest_generation == g and Decrementing.open(sub.root).manifest_generation == g
        return True
    s.positive('stable', 'subclass_adjustment_neutralized', subclass_cannot_move)
    s.positive('stable', 'observe_reports_commit_generation', lambda: st.observe()['commit_generation'] ==
               st.commit_generation or 1/0)


# --------------------------------------------------------------- fence and lease

def test_fence(s, work):
    st = S.TestOwnerStorage.create(work / 'b2-fence', segment_target_bytes=1 << 20)
    _append(st, 'f0')
    s.positive('fence', 'birth_lease_4096', lambda: st.lease()['record']['current_lease']['first_sequence_id'] == 0 and
               st.lease()['record']['current_lease']['last_sequence_id'] == 4095 and
               st.lease_key() == 'seglog_sequence_allocator.v1:' + st.storage_instance_id or 1/0)

    def fenced_append():
        h, fence, rec = st.reserve_assignment('TEST_ONLY:op:f1', dict(tag='f1'))
        assert st.fence is fence and rec['reserved_sequence_id'] == st.next_sequence()
        assert rec['manifest_generation'] == st.manifest_generation
        st.transact([dict(table='TEST_ONLY:t', key='between', expected=None, value=1)])
        assert st.manifest_generation == rec['manifest_generation']
        out = st.append(h, [_candidate('f1')])
        info = st.events[out['event_ids'][0]]
        assert info['sequence_id'] == rec['reserved_sequence_id'] and info['offset'] == rec['byte_offset']
        assert st.reservation_record('TEST_ONLY:op:f1')['state'] == 'consumed' and st.fence is None
        return True
    s.positive('fence', 'reserved_sequence_and_sink_assigned', fenced_append)

    def abandoned_gap():
        h, fence, rec = st.reserve_assignment('TEST_ONLY:op:f2', dict(tag='f2'))
        assert st.abandon('TEST_ONLY:op:f2') == 'abandoned' and st.fence is None
        assert st.next_sequence() == rec['reserved_sequence_id'] + 1
        entry = st.canonical['manifest']['selection_entries'][0]
        gap = [g for g in entry['excluded_ranges'] if g['reason'] == 'allocator_lease_abandoned']
        assert gap and gap[-1]['first_sequence_id'] == rec['reserved_sequence_id']
        assert entry['sequence_authority']['highest_allocated_sequence_id'] >= rec['reserved_sequence_id']
        _, out = _append(st, 'after-gap')
        assert st.events[out['event_ids'][0]]['sequence_id'] == rec['reserved_sequence_id'] + 1
        return True
    s.positive('fence', 'abandoned_sequence_never_reused', abandoned_gap)

    def lease_rollover():
        st.ensure_lease(5000)
        lease = st.lease()['record']
        assert lease['lease_revision'] == 1 and lease['current_lease']['first_sequence_id'] == 5000
        assert not list(S._NATIVE_LEASE.iter_errors(lease))
        return True
    s.positive('fence', 'lease_rollover_revision', lease_rollover)

    def dedupe_under_fence():
        h, fence, rec = st.reserve_assignment('TEST_ONLY:op:f3', dict(tag='f3'))
        out = st.append(h, [_candidate('f0')])
        assert out['status'] == 'dedupe' and st.reservation_record('TEST_ONLY:op:f3')['state'] == 'abandoned'
        return True
    s.positive('fence', 'dedupe_abandons_reserved_sequence', dedupe_under_fence)

    def lost_on_reopen():
        h, fence, rec = st.reserve_assignment('TEST_ONLY:op:f4', dict(tag='f4'))
        reopened = S.TestOwnerStorage.open(st.root)
        assert reopened.reservation_record('TEST_ONLY:op:f4')['state'] == 'abandoned'
        assert 'fence_lost_abandoned' in [n['kind'] for n in reopened.recovered]
        return reopened
    holder = {}
    s.positive('fence', 'fence_lost_on_reopen_abandons', lambda: holder.update(st=lost_on_reopen()) or True)
    st = holder.get('st') or S.TestOwnerStorage.open(st.root)

    def reserved(tag):
        return st.reserve_assignment('TEST_ONLY:op:' + tag, dict(tag=tag))

    def competing_reservation():
        reserved('c1')
        try:
            reserved('c2')
        finally:
            st.abandon('TEST_ONLY:op:c1')
    s.negative('fence', 'competing_reservation', competing_reservation, 'assignment/fence_held')

    def competing_append():
        reserved('c3')
        try:
            _append(st, 'c3-other')
        finally:
            st.abandon('TEST_ONLY:op:c3')
    s.negative('fence', 'competing_unrelated_append', competing_append, 'assignment/fence_held')

    def retire_while_fenced():
        reserved('c4')
        try:
            st.retire_segment(1, S.RetentionOwner(st))
        finally:
            st.abandon('TEST_ONLY:op:c4')
    s.negative('fence', 'retire_while_fenced', retire_while_fenced, 'assignment/fence_held')

    def after_abandon():
        h, fence, rec = reserved('c5')
        st.abandon('TEST_ONLY:op:c5')
        st.append(h, [_candidate('c5')])
    s.negative('fence', 'append_after_abandonment', after_abandon, 'assignment/reservation_abandoned')

    def new_boot_fence():
        h, fence, rec = reserved('c6')
        st.fence = S.Fence('TEST_ONLY:op:c6', 'TEST_ONLY:native-boot-session:other')
        try:
            st.append(h, [_candidate('c6')])
        finally:
            st.fence = fence
            st.abandon('TEST_ONLY:op:c6')
    s.negative('fence', 'fence_from_other_boot_session', new_boot_fence, 'assignment/fence_lost')

    def bypassing_writer(tag, write):
        """A writer that ignored the fence (white-box: the fence is lifted around it)."""
        h, fence, rec = reserved(tag)
        st.fence = None
        try:
            write()
        finally:
            st.fence = fence
        try:
            st.append(h, [_candidate(tag)])
        finally:
            st.abandon('TEST_ONLY:op:' + tag)
    s.negative('fence', 'sink_offset_moved', lambda: bypassing_writer('c7', lambda: _append(st, 'c7-bypass')),
               'assignment/selected_offset')

    def rotate():
        st.segment_target_bytes = 1
        try:
            _append(st, 'c8-rotate')
        finally:
            st.segment_target_bytes = 1 << 20
    s.negative('fence', 'sink_segment_rotated', lambda: bypassing_writer('c8', rotate), 'assignment/selected_segment')
    s.negative('fence', 'selected_manifest_moved', lambda: bypassing_writer(
        'c9', lambda: st.ensure_lease(st.lease()['record']['current_lease']['last_sequence_id'] + 10)),
        'assignment/selected_manifest')

    def sequence_moved():
        h, fence, rec = reserved('c10')
        # white-box: the reserved ID recorded as used outside this reservation
        st.abandoned.append(dict(first_sequence_id=rec['reserved_sequence_id'],
                                 last_sequence_id=rec['reserved_sequence_id'], operation_id='TEST_ONLY:op:elsewhere',
                                 evidence_sha256='0' * 64))
        try:
            st.append(h, [_candidate('c10')])
        finally:
            st.abandoned.pop()
            st.abandon('TEST_ONLY:op:c10')
    s.negative('fence', 'reserved_sequence_reused', sequence_moved, 'assignment/sequence_reused')
    s.negative('fence', 'abandon_unknown_reservation', lambda: st.abandon('TEST_ONLY:op:none'),
               'assignment/reservation_absent')

    def sealed_sink():
        st.segments[-1]['sealed'] = True
        try:
            reserved('c11')
        finally:
            st.segments[-1]['sealed'] = False
    s.negative('fence', 'reserve_on_sealed_sink', sealed_sink, 'assignment/active_segment')
    s.negative('fence', 'reserve_appended_operation', lambda: st.reserve_assignment(
        'TEST_ONLY:op:f0', dict(tag='f0')), 'assignment/operation_state')

    def fence_copy(kind):
        h, fence, rec = reserved('c12-' + kind)
        try:
            copy.deepcopy(fence) if kind == 'copy' else pickle.dumps(fence)
        finally:
            st.abandon('TEST_ONLY:op:c12-' + kind)
    s.negative('fence', 'fence_not_copyable', lambda: fence_copy('copy'), 'fence/not_copyable')
    s.negative('fence', 'fence_not_serializable', lambda: fence_copy('pickle'), 'fence/not_serializable')


# --------------------------------------------------------------- index read source

def _token_patch(src, node_mutate=None):
    """Re-encode the checkpoint after a coherent node change and repoint the token at it."""
    ck = S.decode_canonical(src['canonical']['checkpoint_raw'])
    node = ck['generations'][ck['current_generation_id']]
    if node_mutate:
        node_mutate(ck, node)
    src['canonical']['checkpoint_raw'] = S.canonical(ck)
    node = ck['generations'].get(ck['current_generation_id'], node)
    src['token']['frontier_sha256'] = S.index_digest(node['frontier'])
    src['token']['generation_anchor_sha256'] = S.index_digest(node['anchor'])
    return src


def test_index(s, work):
    st = S.TestOwnerStorage.create(work / 'b2-index', segment_target_bytes=3000)
    for i in range(5):
        _append(st, 'ix%d' % i, _candidate('ix%d' % i, project_id=None, scope_kind='application') if i == 2 else None)
    src = G.EventRecordIndexSource(st)
    read = src.read()
    s.positive('index', 'read_joins_every_row', lambda: len(read.rows) == 5 and
               read.read_token['redb_snapshot_id'].startswith('TEST_ONLY:snapshot:') or 1/0)
    g = read.snapshot.rows[3]
    s.positive('index', 'lookup_row_frame_custody', lambda: src.lookup(
        read, scope_partition=g.scope_partition, sequence_id=g.sequence_id, event_id=g.event_id)['exact_custody'] ==
        st.first_custody(g.event_id) or 1/0)
    s.positive('index', 'native_current_event_source_v4', lambda: src.native_current_event_source(
        'TEST_ONLY:native-read:1', read)['generic']['token'] == read.read_token or 1/0)
    s.negative('index', 'native_current_source_read_id_type', lambda: src.native_current_event_source(None, read),
               'index/native_source_schema')

    def retire_removes_rows():
        sealed = next(x['generation'] for x in st.segments if x['sealed'])
        removed = [e for e, i in st.events.items() if i['segment_generation'] == sealed]
        st.retire_segment(sealed, S.RetentionOwner(st))
        after = G.EventRecordIndexSource(st).read()
        assert not any(r['event_id'] in removed for r in after.rows.values())
        assert after.generation['generation_id'] == read.generation['generation_id']
        return True
    s.positive('index', 'retired_source_has_no_row', retire_removes_rows)
    read = src.read()

    def recovery_generations():
        rec = S.TestOwnerStorage.create(work / 'b2-index-rec')
        _append(rec, 'r0')
        gids = [rec.read_token()['generation_id']]
        for i in range(3):
            crash = S.TestOwnerStorage.open(rec.root, faults=S.FaultPlan(cut='torn_commit_frame'))
            try:
                _append(crash, 'torn%d' % i)
            except S.Crash:
                pass
            rec = S.TestOwnerStorage.open(rec.root)
            gids.append(rec.read_token()['generation_id'])
        ck = rec.index_checkpoint()
        assert len(set(gids[:3])) == 3 and gids[3] == gids[2], gids
        assert len(ck['generations']) == 3
        assert ck['generations'][gids[1]]['origin'] == 'recovery_rebuild'
        assert ck['generations'][gids[0]]['state'] == 'retired' and ck['generations'][gids[0]]['successor_generation_id'] == gids[1]
        assert [d['kind'] for d in rec.index_disclosures] == ['rebuild_required']
        G.EventRecordIndexSource(rec).read()
        return True
    s.positive('index', 'recovery_mints_generation_slots_disclose', recovery_generations)

    def refuse(mutate):
        raw = st.acquire_source()
        mutate(raw)
        src.read(raw)

    def row_edit(field_, value):
        def mutate(raw):
            rows = raw['canonical']['index_rows']
            rows[1][1][field_] = value
            _token_patch(raw, lambda ck, node: node['frontier'].update(
                index_row_set_sha256=S.row_set_digest(dict(rows))))
        return mutate
    s.negative('index', 'row_payload_digest_substituted', lambda: refuse(row_edit('payload_sha256', '0' * 64)),
               'index/row_source/payload_sha256')
    s.negative('index', 'row_producer_digest_substituted', lambda: refuse(row_edit('producer_semantic_digest', '1' * 64)),
               'index/row_source/producer_semantic_digest')
    s.negative('index', 'row_locator_offset_substituted', lambda: refuse(row_edit('source_locator', dict(
        read.rows[sorted(read.rows)[1]]['source_locator'], byte_offset=1))), 'index/row_source/source_locator')
    s.negative('index', 'row_publication_locator_substituted', lambda: refuse(row_edit('publication_locator', dict(
        read.rows[sorted(read.rows)[1]]['publication_locator'], recovery_epoch=9))), 'index/row_source/publication_locator')
    s.negative('index', 'row_extension_member', lambda: refuse(row_edit('extension', 1)), 'index/row_schema')
    s.negative('index', 'row_set_digest_stale', lambda: refuse(lambda raw: raw['canonical']['index_rows'][0][1].update(
        persisted_at_utc='2026-01-01T00:00:00.000Z')), 'index/row_set')

    def drop_row(count):
        def mutate(raw):
            rows = raw['canonical']['index_rows']
            del rows[0]
            _token_patch(raw, lambda ck, node: node['frontier'].update(
                index_row_set_sha256=S.row_set_digest(dict(rows)), **(dict(index_row_count=len(rows)) if count else {})))
        return mutate
    s.negative('index', 'row_dropped_count_stale', lambda: refuse(drop_row(False)), 'index/row_count')
    s.negative('index', 'row_dropped_coherently', lambda: refuse(drop_row(True)), 'index/row_coverage')

    def rename_key(raw):
        rows = raw['canonical']['index_rows']
        rows[0][0] = rows[0][0] + 'x'
        _token_patch(raw, lambda ck, node: node['frontier'].update(index_row_set_sha256=S.row_set_digest(dict(rows))))
    s.negative('index', 'row_key_substituted', lambda: refuse(rename_key), 'index/row_key')
    s.negative('index', 'row_duplicate_entry', lambda: refuse(lambda raw: raw['canonical']['index_rows'].append(
        list(raw['canonical']['index_rows'][0]))), 'index/row_duplicate')

    def frontier_edit(edit):
        return lambda raw: _token_patch(raw, lambda ck, node: edit(node))
    s.negative('index', 'frontier_selection_stale', lambda: refuse(frontier_edit(lambda n: n['frontier'][
        'source_selection'].update(manifest_generation=1))), 'index/frontier_current')
    s.negative('index', 'coverage_count_substituted', lambda: refuse(frontier_edit(lambda n: n['frontier'][
        'coverage'].update(retained_event_count=9))), 'index/coverage_count')
    s.negative('index', 'coverage_range_substituted', lambda: refuse(frontier_edit(lambda n: n['frontier'][
        'coverage'].update(through_sequence_id=99))), 'index/coverage_range')
    s.negative('index', 'coverage_prefix_substituted', lambda: refuse(frontier_edit(lambda n: n['frontier'][
        'coverage'].update(retained_event_prefix_sha256='0' * 64))), 'index/coverage_prefix')
    s.negative('index', 'coverage_last_frame_substituted', lambda: refuse(frontier_edit(lambda n: n['frontier'][
        'coverage']['last_frame'].update(byte_offset=n['frontier']['coverage']['last_frame']['byte_offset'] + 1))),
        'index/coverage_last_frame')
    s.negative('index', 'coverage_gap_dropped', lambda: refuse(frontier_edit(lambda n: n['frontier'][
        'coverage'].update(sequence_gaps=[]))), 'index/coverage_gaps')
    s.negative('index', 'anchor_prefix_substituted', lambda: refuse(frontier_edit(lambda n: n['anchor'].update(
        retained_event_prefix_sha256='0' * 64))), 'index/anchor_prefix')
    s.negative('index', 'generation_seed_substituted', lambda: refuse(frontier_edit(lambda n: n['anchor'].update(
        generation_seed_sha256='0' * 64))), 'index/generation_id')
    def second_current(ck, node):
        twin = copy.deepcopy(node)
        gid = 'eig_' + 'a' * 64
        twin.update(generation_id=gid, index_dataset_name='event_record_index.v2@' + gid)
        ck['generations'][gid] = twin
    s.negative('index', 'second_current_node', lambda: refuse(lambda raw: _token_patch(raw, second_current)),
               'index/current_generation')
    s.negative('index', 'checkpoint_extension_member', lambda: refuse(lambda raw: _token_patch(
        raw, lambda ck, node: ck.update(extension=1))), 'index/checkpoint_schema')
    s.negative('index', 'checkpoint_foreign_storage', lambda: refuse(lambda raw: _token_patch(
        raw, lambda ck, node: ck.update(storage_instance_id='11111111-1111-4111-8111-111111111111'))),
        'index/checkpoint_storage')
    s.negative('index', 'dataset_name_substituted', lambda: refuse(lambda raw: raw['canonical'].update(
        index_dataset_name='event_record_index.v2@eig_' + '0' * 64)), 'index/dataset_name')
    s.negative('index', 'read_token_extension_member', lambda: refuse(lambda raw: raw['token'].update(extension=1)),
               'index/read_token_schema')

    def at_rest():
        rest = S.TestOwnerStorage.create(work / 'b2-index-rest')
        _append(rest, 'a0')
        _, out = _append(rest, 'a1')
        info = rest.events[out['event_ids'][0]]
        path = rest._segment_path(info['segment_generation'])
        raw = bytearray(path.read_bytes())
        raw[info['offset'] + info['length'] - 1] ^= 1
        path.write_bytes(bytes(raw))
        G.EventRecordIndexSource(rest).read()
    s.negative('index', 'source_corrupt_at_rest', at_rest, 'index/source_complete')
    s.negative('index', 'lookup_absent_row', lambda: src.lookup(read, scope_partition=g.scope_partition,
                                                                sequence_id=g.sequence_id + 100, event_id=g.event_id),
               'index/row_absent')
    s.negative('index', 'lookup_read_not_issued', lambda: src.lookup(dict(rows={}), scope_partition='app',
                                                                     sequence_id=0, event_id='x'), 'index/read_type')

    def frame_substituted():
        r2 = src.read()
        row = r2.snapshot.rows[-1]
        seg = next(x for x in r2.source['segments'] if x['generation'] == row.segment_generation)
        raw = bytearray(seg['raw'])
        raw[row.offset + 50] ^= 1
        seg['raw'] = bytes(raw)
        src.lookup(r2, scope_partition=row.scope_partition, sequence_id=row.sequence_id, event_id=row.event_id)
    s.negative('index', 'lookup_frame_substituted', frame_substituted, 'index/frame_hash')

    def pending():
        pend = S.TestOwnerStorage.create(work / 'b2-index-pending')
        _append(pend, 'p0', receipt=False)
        pr = G.EventRecordIndexSource(pend)
        r3 = pr.read()
        row = r3.snapshot.rows[0]
        pr.lookup(r3, scope_partition=row.scope_partition, sequence_id=row.sequence_id, event_id=row.event_id)
    s.negative('index', 'lookup_pending_custody', pending, 'index/custody_unavailable')
    s.negative('index', 'index_source_wrong_type', lambda: G.EventRecordIndexSource(dict()), 'index_source/storage_type')
    s.negative('index', 'storage_dataset_absent', lambda: st.index_rows('eig_' + '0' * 64),
               'index/dataset_unavailable')

    # generic source: the token fields batch 2 adds
    gs = G.GenericSource(st)

    def malformed_canonical(which):
        raw = st.acquire_source()
        raw['canonical'][which + '_raw'] = b''
        if which == 'manifest':
            # Keep the observed byte digest coherent with the malformed image.
            raw['token']['source_selection']['manifest_bytes_sha256'] = S.sha256(b'')
        gs.acquire(raw)
    s.negative('index', 'source_canonical_manifest_malformed', lambda: malformed_canonical('manifest'),
               'source/canonical_manifest_codec/numrule/physical_decode')
    s.negative('index', 'source_checkpoint_malformed', lambda: malformed_canonical('checkpoint'),
               'source/checkpoint_codec/numrule/physical_decode')

    def token_edit(edit):
        raw = st.acquire_source()
        edit(raw['token'])
        gs.acquire(raw)
    sel_edit = lambda f, v: (lambda t: t['source_selection'].update({f: v}))  # noqa: E731
    s.negative('index', 'source_token_manifest_hash', lambda: token_edit(sel_edit('manifest_bytes_sha256', '0' * 64)),
               'source/manifest_hash')
    s.negative('index', 'source_token_excluded_ranges', lambda: token_edit(sel_edit('excluded_ranges_sha256', '0' * 64)),
               'source/excluded_ranges')
    s.negative('index', 'source_token_retired_inputs', lambda: token_edit(sel_edit('retired_inputs_sha256', '0' * 64)),
               'source/retired_inputs')
    s.negative('index', 'source_token_survivor_prefix', lambda: token_edit(sel_edit(
        'manifest_survivor_prefix_sha256', '0' * 64)), 'source/survivor_prefix')
    for field_ in ('checkpoint_key', 'generation_id', 'checkpoint_ref', 'generation_anchor_sha256', 'frontier_sha256',
                   'index_dataset_name'):
        bad = 'eig_' + '0' * 64 if field_ == 'generation_id' else ('0' * 64 if field_.endswith('sha256') else 'x')
        s.negative('index', 'source_token_' + field_, lambda f=field_, b=bad: token_edit(lambda t: t.update({f: b})),
                   'source/token/' + field_)

    def canonical_substituted(which):
        raw = st.acquire_source()
        canon = raw['canonical']
        if which == 'manifest':
            m = S.decode_canonical(canon['manifest_raw'])
            m['selection_entries'][0]['retained_inventory'][0]['origin_operation_ref'] += 'x'
            canon['manifest_raw'] = S.canonical(m)
        else:
            c = S.decode_canonical(canon['current_raw'])
            c['birth_operation_ref'] += 'x'
            canon['current_raw'] = S.canonical(c)
        raw['token']['source_selection'] = S.source_selection_of(canon['current_raw'], canon['manifest_raw'])
        gs.acquire(raw)
    s.negative('index', 'source_canonical_manifest_substituted', lambda: canonical_substituted('manifest'),
               'source/canonical_manifest')
    s.negative('index', 'source_canonical_current_substituted', lambda: canonical_substituted('current'),
               'source/canonical_current')


# --------------------------------------------------------------- recorder

def test_recorder(s, work):
    registry = A.OwnerRegistry()
    owner = A.SourceOwner(registry)
    rec = registry.recorder
    hostile = 'TEST_ONLY hostile ' + chr(0xD800)

    def records():
        with rec.call(owner.owner_id, 'hostile_text', dict(text=hostile)) as slot:
            slot.set(dict(echo=hostile))
        call = rec.calls[-1]
        assert call['method'] == 'hostile_text' and call['refusal'] is None
        assert call['args_sha256'] == A.observation_digest(dict(text=hostile))
        assert call['result_sha256'] == A.observation_digest(dict(echo=hostile))
        return True
    s.positive('recorder', 'lone_surrogate_recorded', records)
    s.positive('recorder', 'lone_surrogate_deterministic_distinct', lambda: (
        A.observation_digest(dict(t=chr(0xD800))) == A.observation_digest(dict(t=chr(0xD800))) and
        A.observation_digest(dict(t=chr(0xD800))) != A.observation_digest(dict(t=chr(0xDC00))) and
        A.observation_digest(dict(t=chr(0xD83D) + chr(0xDE00))) != A.observation_digest(dict(t=chr(0x1F600)))) or 1/0)
    s.positive('recorder', 'valid_text_digest_unchanged', lambda: A.observation_digest(dict(t='é', n=1)) ==
               A.sha256(A.canonical(dict(t='é', n=1))) and A.observation_digest(dict(n=1 << 70)) ==
               A.sha256(b'json\0' + json.dumps(dict(n=1 << 70), sort_keys=True, ensure_ascii=False).encode()) or 1/0)

    def cyclic():
        x = []
        x.append(x)
        return A.observation_digest(x) == A.observation_digest(x) and A.observation_digest({1: 'a'}) != \
            A.observation_digest({'1': 'a'}) or 1/0
    s.positive('recorder', 'cycle_and_non_string_keys', cyclic)

    def observer_surrogate():
        rec.observe('TEST_ONLY:hostile-observer', lambda: dict(text=hostile))
        with rec.call(owner.owner_id, 'observe_hostile'):
            pass
        return 'TEST_ONLY:hostile-observer' in rec.calls[-1]['before']
    s.positive('recorder', 'observer_lone_surrogate_snapshot', observer_surrogate)


# --------------------------------------------------------------- batch-1 guard sites

def test_guards(s, work):
    """Exact-code negatives for the batch-1 guard sites that are reachable (FIX-ROUND check 11)."""
    st = S.TestOwnerStorage.create(work / 'b2-guards')
    h, out = _append(st, 'g0')
    s.negative('guards', 'fault_unknown_cut', lambda: S.FaultPlan(cut='nowhere'), 'fault/cut')
    s.negative('guards', 'fault_unknown_mode', lambda: S.FaultPlan(mode='signal'), 'fault/mode')
    event = st.read_event(out['event_ids'][0])
    s.negative('guards', 'frame_header_over_4096', lambda: S.encode_event_frame(dict(event, event_id='e' * 4100), 1),
               'frame/header_cap')
    s.negative('guards', 'frame_payload_over_16mib', lambda: S.encode_event_frame(
        dict(event, payload=dict(blob='x' * (S.PAYLOAD_CAP + 1))), 1), 'frame/payload_cap')
    s.negative('guards', 'append_dict_handle', lambda: st.append(dict(operation_id='x'), [_candidate('gx')]),
               'handle/type')

    def tail_group(tag, edit):
        root = work / ('b2-guard-' + tag)
        shutil.copytree(st.root, root)
        base = S.TestOwnerStorage.open(root)
        seg = base.segments[-1]
        cand = dict(_candidate('g0'), **edit)
        ev = dict(cand, observed_at_utc=event['observed_at_utc'], persisted_at_utc=event['persisted_at_utc'],
                  sequence_id=base.last_sequence + 1)
        frame = S.encode_event_frame(ev, seg['generation'])
        commit = dict(commit_group_id='TEST_ONLY:group:forged', segment_name=seg['name'],
                      segment_generation=seg['generation'], manifest_generation=base.manifest_generation,
                      durability_class='ordinary', acknowledged_at_utc=event['persisted_at_utc'],
                      first_sequence=ev['sequence_id'], last_sequence=ev['sequence_id'],
                      members=[[ev['event_id'], ev['sequence_id'], seg['watermark']]], restore_admission=None)
        with open(base._segment_path(seg['generation']), 'ab') as handle:
            handle.write(frame + S.encode_commit_frame(commit, seg['generation'], ev['sequence_id']))
        S.TestOwnerStorage.open(root)
    s.negative('guards', 'recovered_duplicate_event_id', lambda: tail_group('dupid', dict(
        idempotency_key='TEST_ONLY:key:other')), 'index/duplicate_event_id')
    s.negative('guards', 'recovered_duplicate_scoped_identity', lambda: tail_group('dupkey', dict(
        event_id='TEST_ONLY:other-event')), 'index/duplicate_scoped_identity')

    def durable_prefix_at_rest():
        rest = S.TestOwnerStorage.create(work / 'b2-guard-prefix', segment_target_bytes=2000)
        for i in range(4):
            _append(rest, 'p%d' % i)
        live = rest.segments[-1]
        info = next(i for i in rest.events.values() if i['segment_generation'] == live['generation'])
        path = rest._segment_path(live['generation'])
        raw = bytearray(path.read_bytes())
        raw[info['offset'] + 60] ^= 1
        path.write_bytes(bytes(raw))
        rest.retire_segment(next(x['generation'] for x in rest.segments if x['sealed']), S.RetentionOwner(rest))
    s.negative('guards', 'durable_prefix_changed_at_rest', durable_prefix_at_rest, 'index/durable_prefix')

    def reopen_current(tag, current_mutate):
        root = work / ('b2-guard-' + tag)
        shutil.copytree(st.root, root)
        _rewrite_commit(root, lambda x: None, current_mutate=current_mutate)
        S.TestOwnerStorage.open(root)
    s.negative('guards', 'current_instance_substituted', lambda: reopen_current('inst', lambda c: c.update(
        storage_instance_id='11111111-1111-4111-8111-111111111111')), 'open/instance')
    s.negative('guards', 'current_generation_substituted', lambda: reopen_current('gen', lambda c: c.update(
        manifest_generation=c['manifest_generation'] + 1)), 'open/manifest_generation')
    s.negative('guards', 'current_qualification_missing', lambda: reopen_current('qual', lambda c: c.update(
        qualification='NATIVE')), 'open/qualification')
    s.negative('guards', 'pack_bytes_type', lambda: st.put_pack('text', 'application/msgpack'), 'pack/bytes')
    s.negative('guards', 'pack_media_type_empty', lambda: st.put_pack(b'x', ''), 'pack/media_type')

    def pack_missing():
        ref = st.put_pack(b'TEST_ONLY gone', 'application/msgpack')
        (st.root / 'packs' / ref['blake3']).unlink()
        st.read_pack(ref, expected_media_type='application/msgpack')
    s.negative('guards', 'pack_file_missing_at_rest', pack_missing, 'pack/present')
    s.negative('guards', 'receipt_before_append', lambda: st.issue_first_receipt(
        st.reserve('TEST_ONLY:op:g-early', dict(tag='e'))), 'receipt/state')
    s.negative('guards', 'release_after_append', lambda: st.release(h), 'release/state')
    s.negative('guards', 'reserve_empty_operation', lambda: st.reserve('', {}), 'reserve/operation_type')
    s.negative('guards', 'create_over_existing', lambda: S.TestOwnerStorage.create(st.root), 'storage/create_empty')

    def replay_other_key():
        pub = S.TestOwnerStorage.create(work / 'b2-guard-term')
        hp, _ = _append(pub, 't0')
        pub.publish_terminal(hp, 'TEST_ONLY:terminal', 'k', dict(v=1))
        pub.publish_terminal(hp, 'TEST_ONLY:terminal', 'other', dict(v=1))
    s.negative('guards', 'terminal_replay_other_key', replay_other_key, 'terminal/replay_target')
    s.negative('guards', 'tx_delete_absent', lambda: st.transact([dict(table='t', key='none', expected=None,
                                                                       delete=True)]), 'tx/delete_present')
    s.negative('guards', 'tx_empty_key', lambda: st.transact([dict(table='t', key='', expected=None, value=1)]), 'tx/key')
    s.negative('guards', 'tx_empty_table', lambda: st.transact([dict(table='', key='k', expected=None, value=1)]),
               'tx/table')
    s.negative('guards', 'tx_write_extra_member', lambda: st.transact([dict(table='t', key='k', expected=None, value=1,
                                                                            extra=1)]), 'tx/write_shape')
    s.negative('guards', 'tx_no_writes', lambda: st.transact([]), 'tx/writes')

    # owner adapters
    registry = A.OwnerRegistry()
    act = A.ActivationOwner(registry)
    act.birth('TEST_ONLY:subject:g', 'pending')
    s.negative('guards', 'activation_cause_empty', lambda: act.transition('TEST_ONLY:subject:g', 'pending', 0, 'active',
                                                                         cause_ref=''), 'activation/cause_type')
    s.negative('guards', 'activation_subject_empty', lambda: act.birth('', 'pending'), 'activation/subject_type')
    s.negative('guards', 'activation_unborn_subject', lambda: act.transition('TEST_ONLY:subject:none', 'pending', 0,
                                                                            'active', cause_ref='c'),
               'activation/unborn_subject')
    s.negative('guards', 'append_owner_not_storage', lambda: A.AppendOwner(registry, dict()), 'append_owner/storage')
    bank_path = 'Plans/goal_certified_event_coordinator_contracts/schemas/coordinator.v1.schema.json'
    s.negative('guards', 'bank_whole_hash_mismatch', lambda: A.RootBank([dict(path=bank_path, sha256='0' * 64)]),
               'bank/whole_hash/' + bank_path)
    anon = work / 'b2-anon.schema.json'
    anon.write_text(json.dumps({'type': 'object'}))
    s.negative('guards', 'bank_document_without_uri', lambda: A.RootBank([dict(path=str(anon))]), 'bank/uri/*')
    other = 'Plans/event_record.schema.json'
    uri = json.loads((ROOT / bank_path).read_text())['$id']
    s.negative('guards', 'bank_uri_rebound', lambda: A.RootBank([dict(path=bank_path), dict(path=other, retrieval_uri=uri)]),
               'bank/no_rebinding/' + uri)
    src_owner = A.SourceOwner(registry)
    s.negative('guards', 'custody_not_dict', lambda: src_owner.verify_custody('custody'), 'custody/type')
    s.negative('guards', 'custody_unissued_ref', lambda: src_owner.verify_custody(dict(original_ref='TEST_ONLY:none')),
               'custody/unissued')
    appender = A.AppendOwner(registry, st)
    s.negative('guards', 'event_dict_handle', lambda: appender.event(dict()), 'event/handle_type')
    s.negative('guards', 'first_receipt_dict_handle', lambda: appender.first_receipt(dict()), 'event/handle_type')
    s.negative('guards', 'authenticate_ref_not_string', lambda: src_owner.authenticate(1, {}), 'original/ref_type')
    s.negative('guards', 'registry_duplicate_owner_id', lambda: A.SourceOwner(registry, owner_id=src_owner.owner_id),
               'registry/duplicate_id')
    s.negative('guards', 'registry_owner_not_test_owner', lambda: registry.authenticate_owner(object(), 'source'),
               'registry/owner_type')

    class Roleless(A.TestOwner):
        role = ''
    s.negative('guards', 'registry_role_empty', lambda: Roleless(registry), 'registry/role_type')

    # generic source
    gs = G.GenericSource(st)
    s.negative('guards', 'project_snapshot_not_issued', lambda: gs.project(dict(), None, select=lambda e: True),
               'project/snapshot_type')
    s.negative('guards', 'source_storage_not_storage', lambda: G.GenericSource(dict()), 'source/storage_type')

    def gap_order():
        gst = S.TestOwnerStorage.create(work / 'b2-guard-gaps', segment_target_bytes=1500)
        for i in range(6):
            _append(gst, 'q%d' % i)
        sealed = [x['generation'] for x in gst.segments if x['sealed']]
        gst.retire_segment(sealed[1], S.RetentionOwner(gst))
        raw = gst.acquire_source()
        state = S.decode_canonical(raw['manifest_raw'])
        prior_last = max(i['sequence_id'] for i in gst.events.values() if i['segment_generation'] == sealed[0])
        gap = state['gaps'][0]
        gap['first_sequence'] = prior_last
        gap['proof_sha256'] = S.RetentionOwner(gst).sign(gap)
        raw['manifest_raw'] = S.canonical(state)
        current = S.decode_canonical(raw['current_raw'])
        current['manifest_sha256'] = S.sha256(raw['manifest_raw'])
        raw['current_raw'] = S.canonical(current)
        cur_raw, man_raw, sel = G.canonical_from_source(raw, state)
        raw['canonical'] = dict(raw['canonical'], current_raw=cur_raw, manifest_raw=man_raw)
        raw['token']['source_selection'] = sel
        raw['gaps'] = state['gaps']
        G.GenericSource(gst).acquire(raw)
    s.negative('guards', 'retention_gap_out_of_order', gap_order, 'source/gap_order')


def run(s, work):
    test_images(s, work)
    test_stable(s, work)
    test_fence(s, work)
    test_index(s, work)
    test_recorder(s, work)
    test_guards(s, work)
