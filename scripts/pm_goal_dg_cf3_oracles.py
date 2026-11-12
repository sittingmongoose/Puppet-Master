#!/usr/bin/env python3
"""DG-CF3 original-path oracles: goal_run.certified F0, CF-10, CF-11, CF-12,
P4, P5, P6 and P8 on the shared TEST_ONLY adapters.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Every positive runs the complete original path: registered TEST_ONLY owners
issue the native/D01/Standard/coordinator/Start/D05/D06 records and the v3
Events from their own execution (the certified Event through the adapter's
CF-01 identity owner and producer), Storage assigns sequences, times, seeds,
transaction ids and first custody, and the consumer reduces the actual global
prefix through the lower Storage publisher.  Each negative starts from a valid
case and changes exactly one thing at one boundary, with every dependent copy,
digest and key kept coherent; it must refuse with exactly its expected code,
and unexpected acceptance fails the run.  The fault matrix kills a real child
process (``os._exit``) at each lane cut and reopens in fresh processes.

Guard-isolation proof is the shared tool's job: this file exports each guard
with the negatives that refuse with exactly its code; it runs no removal engine.
"""
from __future__ import annotations

import argparse
import base64
import copy
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
import traceback

import blake3

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_test_source import SourceRefusal
import pm_goal_dg_cf3_world as W
import pm_goal_dg_cf3_projector as P
import pm_goal_dg_cf3_restore as R

HERE = Path(__file__).resolve().parent
QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = W.NATIVE_LINE
PA, PB = 'TEST_ONLY-project-α', 'TEST_ONLY-project-β'
GOAL = 'TEST_ONLY:goal:1'
LONG_RUN = 'TEST_ONLY:run:' + ('ŕ' * 250) + ('r' * 450)


def code_of(error):
    return getattr(error, 'code', None) or str(error)


class Failure(AssertionError):
    pass


def check(condition, message):
    if not condition:
        raise Failure(message)


def b64(text):
    return base64.urlsafe_b64encode(text.encode('utf-8')).rstrip(b'=').decode('ascii')


# ------------------------------------------------------------------ templates

def build_main(work):
    w = W.World(work, segment_target_bytes=65536)
    sc = dict(r1=w.scope(PA, GOAL, 'TEST_ONLY:run:1-é🦊'), r2=w.scope(PA, GOAL, 'TEST_ONLY:run:2'),
              r3=w.scope(PA, GOAL, 'TEST_ONLY:run:3'), r4=w.scope(PA, GOAL, 'TEST_ONLY:run:4'),
              r5=w.scope(PB, GOAL, 'TEST_ONLY:run:1-é🦊'), r6=w.scope(PA, GOAL, 'TEST_ONLY:run:6'))
    w.certified_run(sc['r1'])
    w.birth(sc['r2']); w.start(sc['r2']); w.cancel(sc['r2'])
    w.birth(sc['r3']); w.cancel(sc['r3'])
    w.birth(sc['r4']); w.start(sc['r4'])
    w.certified_run(sc['r5'])
    w.birth(sc['r6'])
    w.notes.note(w, PB, tag='main-note')
    return w, sc


def build_expiring(work):
    w = W.World(work, segment_target_bytes=9000)
    sc = dict(e1=w.scope(PA, GOAL, 'TEST_ONLY:run:e1'), e2=w.scope(PA, GOAL, 'TEST_ONLY:run:e2'))
    w.birth(sc['e1']); w.start(sc['e1'])
    w.birth(sc['e2']); w.start(sc['e2'])
    i = 0
    while len(w.storage.segments) < 2:
        w.notes.note(w, PB, tag='fill-%d' % i)
        i += 1
    w.native.advance(sc['e1'], 'provisional_success')
    w.native.advance(sc['e1'], 'verifying')
    w.certify(sc['e1'])
    w.notes.note(w, PB, tag='tail')
    return w, sc


def build_large(work):
    w = W.World(work)
    sc = dict(l1=w.scope(PA, GOAL, 'TEST_ONLY:run:large'))
    w.certified_run(sc['l1'], validators=90)
    return w, sc


def build_long(work):
    w = W.World(work)
    sc = dict(g1=w.scope(PA, GOAL, LONG_RUN))
    w.certified_run(sc['g1'])
    return w, sc


class Corpus:
    def __init__(self, work):
        self.work = Path(work)
        self.cases, self.templates, self.n = [], {}, 0
        self.matrix = []

    def tmp(self, tag):
        self.n += 1
        return self.work / 'cases' / ('%03d-%s' % (self.n, tag))

    def template(self, name, builder):
        d = self.work / 'templates' / name
        w, sc = builder(d)
        self.templates[name] = (d / 'storage', sc)
        return w, sc

    def clone(self, name, tag):
        src, scopes = self.templates[name]
        d = self.tmp(tag)
        shutil.copytree(src, d / 'storage')
        storage = W.LaneStorage.open(d / 'storage')
        return d, storage, P.Consumer(storage), copy.deepcopy(scopes)

    def fresh(self, tag, **kw):
        d = self.tmp(tag)
        return d, W.World(d, **kw)

    def record(self, cid, group, kind, expected, actual, ok, obs=None, error=None):
        self.cases.append(dict(id=cid, group=group, kind=kind, expected=expected, actual=actual, pass_=ok,
                               observations=obs or {}, error=error))
        print('%-5s %-10s %-24s %s' % ('PASS' if ok else 'FAIL', group, cid, actual), flush=True)

    def positive(self, cid, group, fn):
        try:
            obs = fn() or {}
            self.record(cid, group, 'positive', 'accept', 'accept', True, obs)
        except Exception as error:  # noqa: BLE001 - a positive must not refuse
            self.record(cid, group, 'positive', 'accept', code_of(error), False,
                        error=traceback.format_exc(limit=6))

    def negative(self, cid, group, expected, fn, boundary=''):
        try:
            fn()
        except Failure as error:
            self.record(cid, group, 'negative', expected, 'oracle_failure:' + str(error), False,
                        dict(boundary=boundary))
            return
        except Exception as error:  # noqa: BLE001 - classify the refusal code
            actual = code_of(error)
            self.record(cid, group, 'negative', expected, actual, actual == expected, dict(boundary=boundary),
                        error=None if actual == expected else traceback.format_exc(limit=8))
            return
        self.record(cid, group, 'negative', expected, 'unexpected_acceptance', False, dict(boundary=boundary))


# ------------------------------------------------------------------ helpers

def stage(c, scope):
    out = c.projector.project_prefix(scope, 'stage')
    return [g for g, v in out['logical']['generations'].items() if v['last_transaction_id'] == out['tx_id']][0]


def advance(c, scope, gid, batch, **kw):
    return c.projector.project_prefix(scope, 'advance', generation_id=gid, batch_limit=batch, **kw)


def cutover(c, scope, gid, **kw):
    return c.projector.project_prefix(scope, 'cutover', generation_id=gid, **kw)


def full_advance(c, scope, gid, batch=1000):
    rows = len(c.lower.read_sources(scope).generic.rows)
    while c.checkpoint(scope)['generations'][gid]['processed']['verified_row_count'] < rows:
        advance(c, scope, gid, batch)


def independent_profile_digest():
    sel = json.loads((W.ROOT / (P.D + 'certified.selection.json')).read_bytes())
    raw = (W.ROOT / sel['installed_profile']['path']).read_bytes()
    check(W.sha256(raw) == sel['installed_profile']['sha256'], 'profile file hash')
    return W.sha256(json.dumps(json.loads(raw), sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode())


def independent_coverage(storage, through=None):
    """Coverage recomputed from Storage's own index and custody, not the consumer."""
    pairs = []
    for eid, info in sorted(storage.events.items(), key=lambda x: x[1]['sequence_id']):
        if through is not None and info['sequence_id'] > through:
            continue
        ev = storage.read_event(eid)
        pairs.append([[eid, info['sequence_id'], info['segment_generation'], info['offset'], info['length'],
                       info['frame_sha256'], info['identity'][0], info['identity'][1], info['identity'][2],
                       info['receipt'], info['group_digest']],
                      storage.custody[eid]['original_event_value_commitment']['sha256']])
    return W.sha256(S.canonical(['pm.goal_test.dg_cf3.coverage.v1', pairs])), len(pairs)


def check_generation(storage, cp, gid, scope, *, frontier_history=None):
    gen = cp['generations'][gid]
    sid = storage.storage_instance_id
    check(gen['seed_hex'] in storage.seeds, 'seed issued by Storage')
    check(gen['profile_digest'] == independent_profile_digest(), 'profile digest independently acquired')
    anchor = W.sha256(S.canonical([P.ANCHOR_DOMAIN, sid, scope, P.PROFILE_NAME, gen['profile_digest'],
                                   gen['seed_hex'], gen['source_token_at_birth']]))
    check(gen['anchor_sha256'] == anchor and gid == 'grsccg_' + anchor, 'anchor/generation id recomputed')
    check(gen['dataset_name'] == P.ROW_PREFIX + '@' + gid, 'dataset bound to generation')
    for token in (gen['source_token_at_birth'], gen['processed']['generic_token']):
        check(set(token) == {'storage_instance_id', 'checkpoint_key', 'checkpoint_ref', 'generation_id',
                             'generation_anchor_sha256', 'frontier_revision', 'frontier_sha256',
                             'index_dataset_name', 'source_selection'}, 'nine durable token fields')
    check('snapshot_id' not in json.dumps(cp), 'live snapshot id never persisted')
    f = W.sha256(S.canonical([P.FRONTIER_DOMAIN, gen['anchor_sha256'], gen['frontier_revision'],
                              gen['prior_frontier_sha256'], gen['processed'], gen['last_transaction_id']]))
    check(f == gen['frontier_sha256'], 'frontier recomputed')
    if frontier_history:
        prev = frontier_history[-1]
        check(gen['frontier_revision'] == prev[0] + 1 and gen['prior_frontier_sha256'] == prev[1],
              'frontier chain: one revision per committed advance, prior chained')
    return gen


def keys_check(scope):
    rk = 'goal_run_projection.started_cancelled_certified.reference.v1:%s:%s' % (b64(scope['project_id']),
                                                                                b64(scope['goal_run_id']))
    ck = 'goal_run_started_cancelled_certified_checkpoint.reference.v1:' + ':'.join(
        b64(scope[k]) for k in ('storage_instance_id', 'project_id', 'goal_id', 'goal_run_id'))
    check(P.row_key(scope) == rk and P.checkpoint_key(scope) == ck, 'K(s) base64url keys recomputed')
    check(scope['goal_run_id'].encode().hex() not in rk, 'no lower-hex component')
    return rk, ck


def edit_logical(c, fn, refrontier=True):
    """Coherent candidate edit: change the logical checkpoint, recompute the
    touched generation's frontier hash, re-encode the StorageCheckpoint."""
    def edit(candidate):
        logical = c.lower.rep.decode_checkpoint(candidate['after']['checkpoint'])
        gid = fn(logical)
        if refrontier and gid:
            g = logical['generations'][gid]
            g['frontier_sha256'] = P.frontier_of(g['anchor_sha256'], g['frontier_revision'], g['prior_frontier_sha256'],
                                                 g['processed'], g['last_transaction_id'])
        # Build the caller's StorageCheckpoint directly (no oracle-side validation):
        # the lower publisher is the boundary under test.
        candidate['after']['checkpoint'] = dict(
            schema_id='pm.goal_run_started_cancelled_certified_checkpoint.reference.v1.storage', schema_version='1.0.0',
            storage_instance_id=c.storage.storage_instance_id, physical_key=logical['physical_key'],
            content=dict(kind='inline', checkpoint=logical))
        return candidate
    return edit


def staged_gen(cp):
    return [g for g, v in cp['generations'].items() if v['state'] == 'staged'][0]


def write_cell(storage, table, key, value):
    cell = storage.cell(table, key)
    return storage.transact([dict(table=table, key=key, expected=None if cell is None else cell['version'],
                                  value=value)])


def rebind_row(c, scope, new_row):
    """Coherently substitute the current row: rewrite the row cell and the
    checkpoint's row_sha256 binding (and frontier) through Storage."""
    st = c.storage
    cp = c.checkpoint(scope)
    gid = cp['current_generation_id']
    g = cp['generations'][gid]
    write_cell(st, g['dataset_name'], P.row_key(scope), new_row)
    g['processed']['row_sha256'] = W.value_sha(new_row)
    g['frontier_sha256'] = P.frontier_of(g['anchor_sha256'], g['frontier_revision'], g['prior_frontier_sha256'],
                                         g['processed'], g['last_transaction_id'])
    write_cell(st, P.CHECKPOINT_TABLE, P.checkpoint_key(scope), c.lower.rep.encode_checkpoint(cp, publish=True))


def current_row(c, scope):
    cp = c.checkpoint(scope)
    g = cp['generations'][cp['current_generation_id']]
    return copy.deepcopy(c.storage.cell(g['dataset_name'], P.row_key(scope))['value'])


def sizes_ok(c, row, checkpoint=False):
    w5 = c.lower.rep.w5
    return len(w5.pack(row)) <= 16384 and len(w5.pack(w5.operation(row, checkpoint))) <= 16384 and \
        len(S.canonical(row)) <= 16384


# ------------------------------------------------------------------ groups

def group_cf10_p4(cp):
    cpu = cp
    # positives on the main template
    def complete(run, status):
        def fn():
            d, st, c, sc = cpu.clone('main', 'cf10-' + run)
            scope = sc[run]
            gid = c.rebuild(scope, batch=4)
            out = c.reader.read(scope)
            cpv = c.checkpoint(scope)
            g = cpv['generations'][gid]
            cov, n = independent_coverage(st)
            check(g['processed']['coverage_sha256'] == cov, 'coverage equals Storage-index recomputation')
            check(g['processed']['verified_row_count'] == n == len(st.events), 'whole global prefix counted')
            check(g['processed']['through_sequence_id'] == st.last_sequence, 'through sequence is global maximum')
            rec = out['record']
            if status is None:
                check(rec is None and g['processed']['row_key'] is None, 'no-supported-event is null source quality')
                return dict(rows=n, record=None)
            check(rec['status_at_original_event'] == status, 'branch status')
            check(rec['scope'] == scope, 'exact RunScope')
            eid = rec['original_event']['event_id']
            check(rec['first_append_receipt'] == st.custody[eid]['first_append_receipt'], 'first receipt from custody')
            check(rec['original_event'] == st.read_event(eid), 'whole stored Event')
            check(rec['original_event_value_commitment'] == st.custody[eid]['original_event_value_commitment'],
                  'whole-value commitment from custody')
            others = [e for e, i in st.events.items() if st.read_event(e)['run_id'] != scope['goal_run_id'] or
                      st.read_event(e)['project_id'] != scope['project_id']]
            check(len(others) >= 3, 'off-run rows validated and counted')
            return dict(rows=n, kind=out['row']['content']['kind'], status=status, off_run=len(others))
        return fn
    cpu.positive('CF10-P01', 'CF-10', complete('r1', 'certified'))
    cpu.positive('CF10-P02', 'CF-10', complete('r2', 'cancelled'))
    cpu.positive('CF10-P03', 'CF-10', complete('r3', 'cancelled'))
    cpu.positive('CF10-P04', 'CF-10', complete('r4', 'running'))
    cpu.positive('CF10-P05', 'CF-10', complete('r5', 'certified'))
    cpu.positive('CF10-P06', 'P4', complete('r6', None))

    def determinism():
        d, st, c, sc = cpu.clone('main', 'cf10-determinism')
        scope = sc['r1']
        g1 = c.rebuild(scope)
        r1 = current_row(c, scope)
        g2 = c.rebuild(scope)
        r2 = current_row(c, scope)
        check(g1 != g2, 'independent fresh generations')
        a, b = copy.deepcopy(r1), copy.deepcopy(r2)
        check(a.pop('dataset_name') != b.pop('dataset_name') and a == b, 'equal genuine sources give equal rows')
        return dict(generations=[g1, g2])
    cpu.positive('CF10-P07', 'CF-10', determinism)

    def survivor():
        d, st, c, sc = cpu.clone('expiring', 'p4-survivor')
        gap = st.retire_segment(1, S.RetentionOwner(st))
        scope = sc['e1']
        gid = c.rebuild(scope, batch=3)
        out = c.reader.read(scope)
        g = c.checkpoint(scope)['generations'][gid]
        check(out['record']['status_at_original_event'] == 'certified', 'certified after lawful Start expiry')
        check(g['processed']['retention_gap_sha256'] ==
              W.sha256(S.canonical(['pm.goal_test.dg_cf3.retention_gaps.v1', [gap]])), 'authenticated gap digest')
        start_seq = st.cell(W.F['start_commit'], W.run_key(scope, 'start_commit'))['value']['sequence_id']
        check(gap['first_sequence'] <= start_seq <= gap['last_sequence'], 'Start sequence inside the gap')
        e2 = c.rebuild(sc['e2'])
        check(c.checkpoint(sc['e2'])['generations'][e2]['processed']['row_key'] is None,
              'expired-only Start is no supported event, not never-started')
        return dict(gap=[gap['first_sequence'], gap['last_sequence']], survivors=g['processed']['verified_row_count'])
    cpu.positive('P4-P08', 'P4', survivor)

    # negatives -----------------------------------------------------------
    def halted(build, expected_code):
        def fn():
            d, w = build()
            st = w.storage
            c = P.Consumer(st)
            scope = w._case_scope
            gid = stage(c, scope)
            before = None
            try:
                while True:
                    before = c.checkpoint(scope)['generations'][gid]['processed']
                    advance(c, scope, gid, 1)
            finally:
                after = c.checkpoint(scope)['generations'][gid]['processed']
                if before is not None:
                    check(after == before, 'refused batch left the committed prefix unchanged')
                bad = getattr(w, '_bad_seq', None)
                if bad is not None:
                    check(after['through_sequence_id'] is None or after['through_sequence_id'] < bad,
                          'frontier never crosses the halting row')
        return fn

    def world_with(tag, fn, **kw):
        def build():
            d, w = cpu.fresh(tag, **kw)
            fn(w)
            return d, w
        return build

    def unsupported(kind):
        def f(w):
            s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:u')
            w.birth(s); w.start(s)
            ev = w.notes.note(w, PA, run_id=s['goal_run_id'], event_type=kind, payload_schema_id=W.OTHER_GOAL_RUN[kind],
                              tag=kind)
            w._bad_seq = ev['sequence_id']
        return f
    for i, kind in enumerate(('goal_run.blocked', 'goal_run.stopped', 'goal_run.replanned')):
        cpu.negative('CF10-N%02d' % (i + 1), 'CF-10', 'advance/halt/reducer/unsupported_same_run',
                     halted(world_with('unsup', unsupported(kind)), None), 'reducer same-run family')

    def off_unregistered(event_type, payload_schema_id):
        def f(w):
            s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:o')
            w.birth(s); w.start(s)
            ev = w.notes.note(w, PB, event_type=event_type, payload_schema_id=payload_schema_id, tag='unreg')
            w._bad_seq = ev['sequence_id']
        return f
    cpu.negative('CF10-N04', 'P4', 'advance/halt/reducer/unregistered_record',
                 halted(world_with('unreg', off_unregistered('goal_test.unknown', W.NOTE_PAYLOAD)), None),
                 'off-run unknown family before filtering')
    cpu.negative('CF10-N05', 'P4', 'advance/halt/reducer/unregistered_record',
                 halted(world_with('unreg2', off_unregistered('goal_test.note', 'TEST_ONLY:goal_test.note.v9')), None),
                 'off-run registered family with mismatched payload schema')

    def corrupt_frame(w):
        s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:c')
        w.birth(s); w.start(s)
        ev = w.notes.note(w, PB, tag='corrupt')
        info = w.storage.events[ev['event_id']]
        path = w.storage._segment_path(info['segment_generation'])
        raw = bytearray(path.read_bytes())
        raw[info['offset'] + info['length'] - 3] ^= 0x41
        path.write_bytes(bytes(raw))
        w._bad_seq = ev['sequence_id']
    def corrupt_expect():
        d, w = world_with('corrupt', corrupt_frame)()
        c = P.Consumer(w.storage)
        scope = w._case_scope
        gid = stage(c, scope)
        try:
            advance(c, scope, gid, 100)
        finally:
            check(c.checkpoint(scope)['generations'][gid]['processed']['verified_row_count'] == 0,
                  'nothing committed past the malformed off-run frame')
    cpu.negative('CF10-N06', 'P4', 'advance/halt/source/frame/payload_crc', corrupt_expect,
                 'malformed off-run frame at rest')

    def pending(w):
        s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:p')
        w.birth(s); w.start(s)
        st = w.storage
        ev = W.envelope(event_id='TEST_ONLY:pending', event_type='goal_test.note', project_id=PB, thread_id=None,
                        run_id=None, actor_ref='TEST_ONLY:actor:note', occurred=st.now(), correlation='TEST_ONLY:c',
                        cause=None, key='TEST_ONLY:key:pending', payload_schema_id=W.NOTE_PAYLOAD,
                        payload=dict(qualification=QUALIFICATION, tag='pending'))
        h = st.reserve('TEST_ONLY:operation:pending', dict(kind='pending'))
        st.append(h, [ev])
        w._bad_seq = st.last_sequence
    cpu.negative('CF10-N07', 'P4', 'advance/halt/reducer/pending_custody', halted(world_with('pending', pending), None),
                 'appended without first custody')

    def second_terminal(w):
        s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:t')
        w.birth(s); w.start(s); w.cancel(s)
        w._bad_seq = w.cancel(s, publish=False, tag='second', check_state=False)['sequence_id']
    cpu.negative('CF10-N08', 'CF-10', 'advance/halt/reducer/second_terminal',
                 halted(world_with('second', second_terminal), None), 'second distinct terminal')

    def certified_after_cancel(w):
        s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:cc')
        w.birth(s); w.start(s); w.cancel(s)
        w._bad_seq = w.certify(s, check_state=False)['sequence_id']
    cpu.negative('CF10-N09', 'CF-10', 'advance/halt/reducer/second_terminal',
                 halted(world_with('certcancel', certified_after_cancel), None), 'certification after cancellation')

    def start_after_terminal(w):
        s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:sat')
        w.certified_run(s)
        st = w.storage
        ev = st.read_event(st.cell(W.F['start_commit'], W.run_key(s, 'start_commit'))['value']['event_id'])
        late = {k: v for k, v in ev.items() if k not in S.STORAGE_FIELDS}
        late['event_id'] = ev['event_id'] + ':late'
        late['idempotency_key'] = ev['idempotency_key'] + ':late'
        late['payload'] = dict(late['payload'], idempotency_key=late['idempotency_key'])
        hs, _, _ = w.appender.append_original('TEST_ONLY:operation:late-start', dict(kind='late'), [late],
                                              durability_class='barrier')
        w._bad_seq = w.appender.event(hs[0])['sequence_id']
    cpu.negative('CF10-N10', 'CF-10', 'advance/halt/reducer/start_after_terminal',
                 halted(world_with('late', start_after_terminal), None), 'Start after terminal')

    def duplicate_start(w):
        s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:ds')
        w.birth(s); w.start(s)
        st = w.storage
        ev = st.read_event(st.cell(W.F['start_commit'], W.run_key(s, 'start_commit'))['value']['event_id'])
        dup = {k: v for k, v in ev.items() if k not in S.STORAGE_FIELDS}
        dup['event_id'] = ev['event_id'] + ':dup'
        dup['idempotency_key'] = ev['idempotency_key'] + ':dup'
        dup['payload'] = dict(dup['payload'], idempotency_key=dup['idempotency_key'])
        hs, _, _ = w.appender.append_original('TEST_ONLY:operation:dup-start', dict(kind='dup'), [dup],
                                              durability_class='barrier')
        w._bad_seq = w.appender.event(hs[0])['sequence_id']
    cpu.negative('CF10-N11', 'CF-10', 'advance/halt/reducer/duplicate_start',
                 halted(world_with('dupstart', duplicate_start), None), 'second Start before terminal')

    def run_with(tag, **kw):
        def f(w):
            s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:' + tag)
            w._bad_seq = w.certified_run(s, **kw)['certified']['sequence_id']
        return f
    cases = [
        ('CF10-N12', 'certified/start_lineage_missing', dict(start=False), 'certified without any Start lineage'),
        ('CF10-N15', 'certified/release_missing', dict(release=False), 'committed-unreleased coordinator'),
        ('CF10-N16', 'reducer/first_receipt_barrier', dict(durability='ordinary'), 'ordinary first receipt'),
        ('CF10-N17', 'certified/native_transition', dict(progress=False), 'running to certified native edge'),
        ('CF10-N18', 'certified/d01_join', dict(defects=('d01_head_after',)), 'D01 head after mismatched'),
        ('CF10-N19', 'certified/d01_same_transaction', dict(defects=('d01_other_transaction',)),
         'D01 update outside the joint transaction'),
        ('CF10-N20', 'certified/standard_semantics', dict(defects=('standard_exception',)),
         'Standard receipt with approved exception'),
        ('CF10-N21', 'certified/commit_first_receipt', dict(defects=('commit_first_receipt',)),
         'coordinator Commit selects a substituted first receipt'),
        ('CF10-N22', 'certified/native_result_event', dict(defects=('result_event',)),
         'native result for a substituted Event'),
        ('CF10-N23', 'certified/release_readback', dict(defects=('release_commit_transaction',)),
         'Release names another commit transaction'),
        ('CF10-N24', 'certified/causal_order', dict(start_defects=('start_revision_offset',)),
         'Start native revision after certification before-state'),
    ]
    for cid, code, kw, boundary in cases:
        cpu.negative(cid, 'CF-10', 'advance/halt/' + code, halted(world_with(cid.lower(), run_with(cid.lower(), **kw)),
                                                                   None), boundary)

    def gap_substituted():
        d, st, c, sc = cpu.clone('expiring', 'gap-substituted')
        st.retire_segment(1, S.RetentionOwner(st))
        st.gaps[0]['retention_owner_id'] = 'TEST_ONLY:retention-owner:foreign'
        st._commit_state()
        c.rebuild(sc['e1'])
    cpu.negative('CF10-N13', 'P4', 'source/gap_proof', gap_substituted, 'retention gap substituted')

    def gap_not_covering():
        d, st, c, sc = cpu.clone('expiring', 'gap-uncovered')
        st.retire_segment(1, S.RetentionOwner(st))
        scope = sc['e1']
        key = W.run_key(scope, 'start_commit')
        commit = st.cell(W.F['start_commit'], key)['value']
        commit['sequence_id'] = st.last_sequence + 7
        okey = W.run_key(scope, 'start_origin')
        origin = st.cell(W.F['start_origin'], okey)['value']
        origin['commit'] = W.selector_for(st.storage_instance_id, W.F['start_commit'], key, commit)
        st.transact([dict(table=W.F['start_commit'], key=key, expected=st.cell(W.F['start_commit'], key)['version'],
                          value=commit),
                     dict(table=W.F['start_origin'], key=okey, expected=st.cell(W.F['start_origin'], okey)['version'],
                          value=origin)])
        gid = stage(c, scope)
        advance(c, scope, gid, 1000)
    cpu.negative('CF10-N14', 'P4', 'advance/halt/certified/without_start_proof', gap_not_covering,
                 'retained Start lineage not covered by an authenticated gap')

    def cancel_after_offset(w):
        s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:co')
        w.birth(s); w.start(s, defects=('start_revision_offset',))
        w._bad_seq = w.cancel(s)['sequence_id']
    cpu.negative('CF10-N25', 'CF-10', 'advance/halt/cancel/causal_order',
                 halted(world_with('cancelorder', cancel_after_offset), None), 'cancellation before Start revision')

    def start_unpublished(w):
        s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:su')
        w.birth(s)
        w._bad_seq = w.start(s, publish=False)['sequence_id']
    cpu.negative('CF10-N26', 'CF-10', 'advance/halt/start/commit_unavailable',
                 halted(world_with('startpub', start_unpublished), None), 'Start Event without native publication')

    def start_goal(w):
        s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:sg')
        w.birth(s)
        w._bad_seq = w.start(s, defects=('start_goal_revision',))['sequence_id']
    cpu.negative('CF10-N27', 'CF-10', 'advance/halt/start/goal_revision', halted(world_with('startgoal', start_goal), None),
                 'Start commit captures another Goal revision')

    def cancel_unpublished(w):
        s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:cu')
        w.birth(s); w.start(s)
        w._bad_seq = w.cancel(s, publish=False)['sequence_id']
    cpu.negative('CF10-N28', 'CF-10', 'advance/halt/cancel/d06_unavailable',
                 halted(world_with('cancelpub', cancel_unpublished), None), 'cancelled Event without D06 publication')

    def d05_failed(w):
        s = w._case_scope = w.scope(PA, GOAL, 'TEST_ONLY:run:d5')
        w.birth(s); w.start(s)
        w._bad_seq = w.cancel(s, defects=('d05_failed',))['sequence_id']
    cpu.negative('CF10-N29', 'CF-10', 'advance/halt/cancel/d05_outcome', halted(world_with('d05', d05_failed), None),
                 'D05 failed settlement')

    def replay_only():
        d, st, c, sc = cpu.clone('main', 'replay-only')
        eid = st.cell(W.F['coordinator_commit'], W.run_key(sc['r1'], 'coordinator_commit'))['value']['event_id']
        ev = {k: v for k, v in st.read_event(eid).items() if k not in S.STORAGE_FIELDS}
        ev.update(event_id=eid + ':replay', idempotency_key=ev['idempotency_key'] + ':replay',
                  replay_policy='projector_replay_only')
        h = st.reserve('TEST_ONLY:operation:replay-only', dict(kind='replay'))
        st.append(h, [ev], durability_class='barrier')
    cpu.negative('CF10-N30', 'CF-10', 'append/candidate/replay_policy/numrule/replay_only_not_appendable', replay_only,
                 'current writer selects projector_replay_only (standing check 1)')


def group_cf11_p5_p6(cpu):
    def lifecycle():
        d, st, c, sc = cpu.clone('main', 'cf11-lifecycle')
        scope = sc['r1']
        rk, ck = keys_check(scope)
        gid = stage(c, scope)
        cp = c.checkpoint(scope)
        check(cp['root_revision'] == 0 and cp['current_generation_id'] is None, 'first root publication at zero')
        g = check_generation(st, cp, gid, scope)
        check(g['frontier_revision'] == 0 and g['prior_frontier_sha256'] is None and g['state'] == 'staged', 'birth')
        hist = [(0, g['frontier_sha256'])]
        try:
            c.reader.read(scope)
            check(False, 'staged progress must stay hidden')
        except W.LaneRefusal as error:
            check(error.code == 'read/no_current', 'staged hidden from current read')
        root = 0
        while g['processed']['verified_row_count'] < len(st.events):
            out = advance(c, scope, gid, 3)
            cp = c.checkpoint(scope)
            root += 1
            check(cp['root_revision'] == root, 'one root revision per transaction')
            g = check_generation(st, cp, gid, scope, frontier_history=hist)
            hist.append((g['frontier_revision'], g['frontier_sha256']))
            cell = st.cell(P.CHECKPOINT_TABLE, ck)
            check(cell['tx'] == out['tx_id'] == cp['last_transaction_id'] == g['last_transaction_id'],
                  'genuine publishing transaction')
            if g['processed']['row_key'] is not None:
                rc = st.cell(g['dataset_name'], rk)
                check(rc is not None and W.value_sha(rc['value']) == g['processed']['row_sha256'], 'row binding')
        out = cutover(c, scope, gid)
        cp = c.checkpoint(scope)
        check(cp['current_generation_id'] == gid and cp['generations'][gid]['state'] == 'current', 'cutover')
        check(cp['generations'][gid]['activated_at_utc'] is not None, 'activation once')
        read = c.reader.read(scope)
        check(read['record']['status_at_original_event'] == 'certified', 'current read after cutover')
        return dict(frontier_revisions=len(hist), root_revision=cp['root_revision'], generation=gid)
    cpu.positive('CF11-P01', 'CF-11', lifecycle)

    def second_generation():
        d, st, c, sc = cpu.clone('main', 'cf11-second')
        scope = sc['r1']
        g1 = c.rebuild(scope)
        first = copy.deepcopy(c.checkpoint(scope)['generations'][g1])
        g2 = stage(c, scope)
        check(c.checkpoint(scope)['current_generation_id'] == g1, 'old current stays selected while staging')
        full_advance(c, scope, g2)
        check(c.reader.read(scope)['generation_id'] == g1, 'reads stay on old current until cutover')
        cutover(c, scope, g2)
        cp = c.checkpoint(scope)
        old, new = cp['generations'][g1], cp['generations'][g2]
        check(old['state'] == 'retired' and old['successor_generation_id'] == g2 and old['retired_at_utc'] ==
              new['activated_at_utc'], 'old retired once with successor in the cutover transaction')
        check(old['first_prepared_at_utc'] == first['first_prepared_at_utc'] and
              old['activated_at_utc'] == first['activated_at_utc'], 'immutable lifecycle facts')
        check(old['seed_hex'] != new['seed_hex'] and old['anchor_sha256'] != new['anchor_sha256'], 'fresh seed/anchor')
        check_generation(st, cp, g2, scope)
        return dict(old=g1, new=g2)
    cpu.positive('CF11-P02', 'P5', second_generation)

    def lost_ack():
        d, st, c, sc = cpu.clone('main', 'cf11-lostack')
        scope = sc['r1']
        gid = stage(c, scope)
        src = c.lower.read_sources(scope)
        request = c.projector.request_for(scope, 'advance', generation_id=gid, batch_limit=4, src=src)
        out = c.projector.project_prefix(scope, 'advance', request=copy.deepcopy(request))
        gen_before = st.cell_generation
        again = c.projector.project_prefix(scope, 'advance', request=copy.deepcopy(request))
        check(again['replay'] and again['tx_id'] == out['tx_id'], 'lost acknowledgement resolves the same transaction')
        check(st.cell_generation == gen_before, 'no second effect')
        full_advance(c, scope, gid)
        src = c.lower.read_sources(scope)
        creq = c.projector.request_for(scope, 'cutover', generation_id=gid, src=src)
        cout = c.projector.project_prefix(scope, 'cutover', request=copy.deepcopy(creq))
        gen_before = st.cell_generation
        crep = c.projector.project_prefix(scope, 'cutover', request=copy.deepcopy(creq))
        check(crep['replay'] and crep['tx_id'] == cout['tx_id'] and st.cell_generation == gen_before, 'cutover replay')
        return dict(tx=out['tx_id'])
    cpu.positive('P6-P03', 'P6', lost_ack)

    def keeps_up():
        d, st, c, sc = cpu.clone('main', 'cf11-keepsup')
        scope = sc['r1']
        gid = c.rebuild(scope)
        w = W.World(d / 'w', storage=st)
        w.notes.note(w, PB, tag='after-cutover')
        advance(c, scope, gid, 10)
        g = c.checkpoint(scope)['generations'][gid]
        cov, n = independent_coverage(st)
        check(g['state'] == 'current' and g['processed']['verified_row_count'] == n and
              g['processed']['coverage_sha256'] == cov, 'current generation extends over the new suffix')
        return dict(rows=n)
    cpu.positive('P6-P04', 'P6', keeps_up)

    def batch_rollback():
        d, st, c, sc = cpu.clone('main', 'cf11-rollback')
        scope = sc['r4']
        gid = stage(c, scope)
        advance(c, scope, gid, 1000)
        w = W.World(d / 'w', storage=st)
        w.notes.note(w, PB, tag='ok-1')
        bad = w.notes.note(w, PA, run_id=scope['goal_run_id'], event_type='goal_run.blocked',
                           payload_schema_id=W.OTHER_GOAL_RUN['goal_run.blocked'], tag='bad')
        advance(c, scope, gid, 1)
        good = copy.deepcopy(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope)))
        try:
            advance(c, scope, gid, 5)
            check(False, 'batch with an unsupported same-run row must refuse')
        except W.LaneRefusal as error:
            check(error.code == 'advance/halt/reducer/unsupported_same_run', 'whole batch refused')
        check(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope)) == good, 'earlier committed prefix intact')
        g = c.checkpoint(scope)['generations'][gid]
        check(g['processed']['through_sequence_id'] < bad['sequence_id'], 'no advance over the failing row')
        return dict(through=g['processed']['through_sequence_id'], halted_at=bad['sequence_id'])
    cpu.positive('P6-P05', 'P6', batch_rollback)

    # negatives on candidates ---------------------------------------------
    def staged_case(tag, rows=4):
        d, st, c, sc = cpu.clone('main', tag)
        scope = sc['r1']
        gid = stage(c, scope)
        advance(c, scope, gid, rows)
        return d, st, c, scope, gid

    def cand_neg(tag, fn, op='advance', refrontier=True):
        def run():
            d, st, c, scope, gid = staged_case(tag)
            before = copy.deepcopy(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope)))
            try:
                if op == 'advance':
                    advance(c, scope, gid, 3, edit=edit_logical(c, lambda cp: fn(cp, gid, st) or gid, refrontier))
                else:
                    full_advance(c, scope, gid)
                    before = copy.deepcopy(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope)))
                    cutover(c, scope, gid, edit=edit_logical(c, lambda cp: fn(cp, gid, st) or gid, refrontier))
            finally:
                check(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope)) == before, 'refused candidate wrote nothing')
        return run

    def tx_synthetic(cp, gid, st):
        g = cp['generations'][gid]
        g['last_transaction_id'] = cp['last_transaction_id'] = 'TEST_ONLY:tx:%s:999999' % st.storage_instance_id
    def anchor_profile(cp, gid, st):
        g = cp['generations'][gid]
        g['profile_digest'] = W.sha256(b'TEST_ONLY:other-profile')
        g['anchor_sha256'] = P.anchor_of(st.storage_instance_id, g['scope'], g['profile_digest'], g['seed_hex'],
                                         g['source_token_at_birth'])
    def rev_skip(cp, gid, st):
        cp['generations'][gid]['frontier_revision'] += 1
    def prior_unchained(cp, gid, st):
        cp['generations'][gid]['prior_frontier_sha256'] = None
    def coverage(cp, gid, st):
        cp['generations'][gid]['processed']['coverage_sha256'] = W.sha256(b'TEST_ONLY:coverage')
    def count(cp, gid, st):
        cp['generations'][gid]['processed']['verified_row_count'] += 1
    def through(cp, gid, st):
        cp['generations'][gid]['processed']['through_sequence_id'] += 1
    def gaps(cp, gid, st):
        cp['generations'][gid]['processed']['retention_gap_sha256'] = W.sha256(b'TEST_ONLY:gaps')
    def row_key_arbitrary(cp, gid, st):
        cp['generations'][gid]['processed']['row_key'] = 'TEST_ONLY:arbitrary-row-key'
    def dangling(cp, gid, st):
        cp['generations'][gid]['processed']['row_sha256'] = W.sha256(b'TEST_ONLY:dangling-row')
    def root_skip(cp, gid, st):
        cp['root_revision'] += 1
    def fake_hold(cp, gid, st):
        cp['generations'][gid]['hold_refs'] = ['TEST_ONLY:hold:string-only']
    def snapshot_persisted(cp, gid, st):
        cp['generations'][gid]['processed']['generic_token']['snapshot_id'] = 'TEST_ONLY:snapshot:persisted'
    def token_stale(cp, gid, st):
        cp['generations'][gid]['processed']['generic_token']['frontier_revision'] -= 1
    def map_key(cp, gid, st):
        cp['generations']['grsccg_' + 'e' * 64] = cp['generations'].pop(gid)
        return 'grsccg_' + 'e' * 64
    def wrong_storage(cp, gid, st):
        cp['storage_instance_id'] = '22222222-2222-4222-8222-222222222222'
    def seed_altered(cp, gid, st):
        g = cp['generations'][gid]
        g['seed_hex'] = st.new_seed()
        g['anchor_sha256'] = P.anchor_of(st.storage_instance_id, g['scope'], g['profile_digest'], g['seed_hex'],
                                         g['source_token_at_birth'])
    for cid, group, fn, code in [
            ('P5-N01', 'P5', tx_synthetic, 'publish/candidate_mismatch'),
            ('P5-N02', 'P5', anchor_profile, 'publish/candidate_mismatch'),
            ('P5-N03', 'P5', rev_skip, 'publish/candidate_mismatch'),
            ('P5-N04', 'P5', prior_unchained, 'publish/candidate_mismatch'),
            ('P5-N05', 'P5', coverage, 'publish/candidate_mismatch'),
            ('P5-N06', 'P5', count, 'publish/candidate_mismatch'),
            ('P5-N07', 'P5', through, 'publish/candidate_mismatch'),
            ('P5-N08', 'P5', gaps, 'publish/candidate_mismatch'),
            ('P5-N09', 'P5', row_key_arbitrary, 'publish/candidate_mismatch'),
            ('P5-N10', 'P5', dangling, 'publish/candidate_mismatch'),
            ('P5-N11', 'P5', root_skip, 'publish/candidate_mismatch'),
            ('P8-N01', 'P8', fake_hold, 'publish/candidate_mismatch'),
            ('P5-N12', 'P5', snapshot_persisted, 'schema/ProjectionCandidate'),
            ('P5-N13', 'P5', token_stale, 'publish/candidate_mismatch'),
            ('P5-N16', 'P5', map_key, 'publish/candidate_mismatch'),
            ('P5-N17', 'P5', wrong_storage, 'publish/candidate_mismatch'),
            ('P5-N18', 'P5', seed_altered, 'publish/candidate_mismatch')]:
        cpu.negative(cid, group, code, cand_neg(cid.lower(), fn), 'lower publish rederives the afterimage')

    def refreshed_retirement():
        d, st, c, sc = cpu.clone('main', 'p8-retire-refresh')
        scope = sc['r1']
        g1 = c.rebuild(scope)
        g2 = stage(c, scope)
        full_advance(c, scope, g2)
        before = copy.deepcopy(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope)))
        try:
            def fn(cp):
                cp['generations'][g1]['first_prepared_at_utc'] = cp['generations'][g2]['first_prepared_at_utc']
                return None
            cutover(c, scope, g2, edit=edit_logical(c, fn, refrontier=False))
        finally:
            check(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope)) == before, 'nothing written')
    cpu.negative('P8-N02', 'P8', 'publish/candidate_mismatch', refreshed_retirement,
                 'refreshed immutable first-preparation time')

    def lifecycle_edit(tag, fn):
        def run():
            d, st, c, sc = cpu.clone('main', tag)
            scope = sc['r1']
            g1 = c.rebuild(scope)
            g2 = c.rebuild(scope)
            g3 = stage(c, scope)
            full_advance(c, scope, g3)
            before = copy.deepcopy(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope)))
            try:
                cutover(c, scope, g3, edit=edit_logical(c, lambda cp: fn(cp, g1, g2, g3), refrontier=False))
            finally:
                check(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope)) == before, 'nothing written')
        return run

    def refresh_retired(cp, g1, g2, g3):
        cp['generations'][g1]['retired_at_utc'] = cp['generations'][g3]['activated_at_utc']
    def duplicate_current(cp, g1, g2, g3):
        cp['generations'][g2].update(state='current', retired_at_utc=None, successor_generation_id=None)
    cpu.negative('P8-N12', 'P8', 'publish/candidate_mismatch', lifecycle_edit('p8-refresh-retired', refresh_retired),
                 'refreshed retirement time')
    cpu.negative('P5-N19', 'P5', 'publish/candidate_mismatch', lifecycle_edit('p5-dupcurrent', duplicate_current),
                 'duplicate current generation')

    def row_altered():
        d, st, c, scope, gid = staged_case('p6-rowaltered', rows=1)
        def edit(candidate):
            row = candidate['after']['row']
            row['content']['record']['action_authority'] = False
            row['dataset_name'] = row['dataset_name'] + '-other'
            logical = c.lower.rep.decode_checkpoint(candidate['after']['checkpoint'])
            g = logical['generations'][gid]
            g['processed']['row_sha256'] = W.value_sha(row)
            g['frontier_sha256'] = P.frontier_of(g['anchor_sha256'], g['frontier_revision'], g['prior_frontier_sha256'],
                                                 g['processed'], g['last_transaction_id'])
            candidate['after']['checkpoint'] = c.lower.rep.encode_checkpoint(logical, publish=False)
            return candidate
        advance(c, scope, gid, 1000, edit=edit)
    cpu.negative('P6-N01', 'P6', 'publish/candidate_mismatch', row_altered,
                 'caller-computed row afterimage with matching hash')

    def seed_caller():
        d, st, c, sc = cpu.clone('main', 'p5-seed')
        c.projector.project_prefix(sc['r1'], 'stage', request_edit=lambda r: dict(r, seed_hex='ab' * 32))
    cpu.negative('P5-N14', 'P5', 'stage/seed_unissued', seed_caller, 'caller-supplied seed')

    def seed_reused():
        d, st, c, sc = cpu.clone('main', 'p5-seedreuse')
        scope = sc['r1']
        g1 = stage(c, scope)
        seed = c.checkpoint(scope)['generations'][g1]['seed_hex']
        c.projector.project_prefix(scope, 'stage', request_edit=lambda r: dict(r, seed_hex=seed))
    cpu.negative('P5-N15', 'P5', 'stage/seed_reused', seed_reused, 'seed reused from an existing generation')

    def fourth():
        d, st, c, sc = cpu.clone('main', 'p8-fourth')
        scope = sc['r1']
        for _ in range(3):
            stage(c, scope)
        stage(c, scope)
    cpu.negative('P8-N03', 'P8', 'stage/fourth_generation', fourth, 'fourth generation')

    def stale_before():
        d, st, c, scope, gid = staged_case('p6-stalebefore')
        old = copy.deepcopy(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope))['value'])
        advance(c, scope, gid, 2)
        advance(c, scope, gid, 2, edit=lambda cand: dict(cand, before=dict(cand['before'], checkpoint=old)))
    cpu.negative('P6-N02', 'P6', 'publish/stale_before', stale_before, 'stale root preimage')

    def hook_case(tag, hook, code_boundary):
        def run():
            d, st, c, scope, gid = staged_case(tag)
            before = copy.deepcopy(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope))['value'])
            rows_before = {t: copy.deepcopy(v) for t, v in st.cells.items() if t.startswith(P.ROW_PREFIX + '@grsccg_') and
                           not t.endswith('0' * 64)}
            w = W.World(d / 'w', storage=st)
            try:
                advance(c, scope, gid, 3, hooks=dict(after_helpers=lambda lower: hook(w, c, scope)))
            finally:
                check(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope))['value'] == before and
                      {t: v for t, v in st.cells.items() if t in rows_before} == rows_before, 'no half publication')
        return run
    cpu.negative('P6-N03', 'P6', 'publish/final/seglog',
                 hook_case('p6-seglog', lambda w, c, s: w.notes.note(w, PB, tag='drift'), ''),
                 'same-generation generic frontier advance after the last helper')
    cpu.negative('P6-N04', 'P6', 'publish/final/authority',
                 hook_case('p6-authority', lambda w, c, s: w.native.advance(
                     dict(s, goal_run_id='TEST_ONLY:run:6'), 'running', 'active'), ''),
                 'original source change after the last helper')
    cpu.negative('P6-N05', 'P6', 'publish/final/controls',
                 hook_case('p6-controls', lambda w, c, s: c.controls.set(reader_withdrawn=True), ''),
                 'disclosure control change after the last helper')
    cpu.negative('P6-N06', 'P6', 'publish/final/checkpoint_version',
                 hook_case('p6-root', lambda w, c, s: write_cell(
                     c.storage, P.CHECKPOINT_TABLE, P.checkpoint_key(s),
                     c.storage.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(s))['value']), ''),
                 'own root changed after the last helper')
    cpu.negative('P6-N07', 'P6', 'tx/reservation_stale',
                 hook_case('p6-txstale', lambda w, c, s: c.storage.transact([dict(
                     table=P.ROW_PREFIX + '@grsccg_' + '0' * 64, key='TEST_ONLY:other', expected=None,
                     value=dict(qualification=QUALIFICATION))]), ''),
                 'another transaction committed between open and commit')

    def premature():
        d, st, c, scope, gid = staged_case('p6-premature')
        cutover(c, scope, gid)
    cpu.negative('P6-N08', 'P6', 'cutover/incomplete_coverage', premature, 'premature cutover')

    def unsupported_suffix():
        d, st, c, sc = cpu.clone('main', 'p6-unsupported')
        scope = sc['r4']
        gid = stage(c, scope)
        full_advance(c, scope, gid)
        w = W.World(d / 'w', storage=st)
        w.notes.note(w, PA, run_id=scope['goal_run_id'], event_type='goal_run.stopped',
                     payload_schema_id=W.OTHER_GOAL_RUN['goal_run.stopped'], tag='stop')
        cutover(c, scope, gid)
    cpu.negative('P6-N09', 'P6', 'cutover/unsupported_or_malformed_row', unsupported_suffix,
                 'cutover over an unsupported same-run row')

    def source_changed():
        d, st, c, sc = cpu.clone('expiring', 'p6-selection')
        scope = sc['e1']
        gid = stage(c, scope)
        advance(c, scope, gid, 6)
        st.retire_segment(1, S.RetentionOwner(st))
        advance(c, scope, gid, 3)
    cpu.negative('P6-N10', 'P6', 'advance/prior_prefix_mismatch', source_changed,
                 'retained source selection changed under a staged generation')

    def withdrawn():
        d, st, c, scope, gid = staged_case('p6-withdrawn')
        c.controls.set(projector_withdrawn=True)
        advance(c, scope, gid, 3)
    cpu.negative('P6-N11', 'P6', 'publish/withdrawn', withdrawn, 'projector withdrawn (writer cutoff)')

    def replay_conflict():
        d, st, c, scope, gid = staged_case('p6-replayconflict', rows=1)
        src = c.lower.read_sources(scope)
        req = c.projector.request_for(scope, 'advance', generation_id=gid, batch_limit=1, src=src)
        advance(c, scope, gid, 1)
        advance(c, scope, gid, 1)
        c.projector.project_prefix(scope, 'advance', request=req)
    cpu.negative('P6-N12', 'P6', 'publish/replay_conflict', replay_conflict, 'stale request after two later commits')

    def half_row():
        d, st, c, sc = cpu.clone('main', 'p6-halfrow')
        scope = sc['r1']
        c.rebuild(scope)
        row = current_row(c, scope)
        row['content']['record']['first_append_receipt']['durability_state'] = 'pending'
        cp = c.checkpoint(scope)
        write_cell(st, cp['generations'][cp['current_generation_id']]['dataset_name'], P.row_key(scope), row)
        c.reader.read(scope)
    cpu.negative('P6-N13', 'P6', 'read/row_binding', half_row, 'row written without its checkpoint')

    def extra_row():
        d, st, c, sc = cpu.clone('main', 'p6-extrarow')
        scope = sc['r1']
        c.rebuild(scope)
        cp = c.checkpoint(scope)
        write_cell(st, cp['generations'][cp['current_generation_id']]['dataset_name'], 'TEST_ONLY:unbound',
                   current_row(c, scope))
        c.reader.read(scope)
    cpu.negative('P6-N14', 'P6', 'read/unbound_row', extra_row, 'direct consumer write escape (unbound row)')


def group_f0(cpu):
    def forms(template, run, kind, generations=1):
        def fn():
            d, st, c, sc = cpu.clone(template, 'f0-' + kind)
            scope = sc[run]
            for _ in range(generations):
                c.rebuild(scope)
            out = c.reader.read(scope)
            row = out['row']
            check(row['content']['kind'] == kind, 'first fitting form %s' % kind)
            check(sizes_ok(c, row), 'complete row and operation within 16384')
            cprow = st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope))['value']
            check(sizes_ok(c, cprow, True), 'complete checkpoint and operation within 16384')
            rec = out['record']
            eid = rec['original_event']['event_id']
            check(row['event_identity']['sequence_id'] == st.events[eid]['sequence_id'], 'identity from Storage index')
            check(row['original_event_value_commitment'] == st.custody[eid]['original_event_value_commitment'],
                  'wrapper commitment from custody')
            refs = c.lower.rep.refs(row)
            for ref in refs:
                raw = (st.root / 'packs' / ref['blake3']).read_bytes()
                check(blake3.blake3(raw).hexdigest() == ref['blake3'] and len(raw) == ref['byte_size'] and
                      st.packs[ref['blake3']]['durable'], 'pack bytes/BLAKE3/size durable')
            if kind != 'inline':
                ev_raw = (st.root / 'packs' / row['content']['event_ref']['blake3']).read_bytes()
                check(ev_raw == c.lower.rep.w5.pack(st.read_event(eid)), 'Event pack is the exact stored Event')
                check(len(c.lower.rep.w5.pack(rec)) > 16384 or not sizes_ok(c, dict(row, content=dict(
                    kind='inline', record=rec))), 'inline did not fit')
            if kind == 'record_reference':
                meta = c.lower.rep.w5.unpack((st.root / 'packs' / row['content']['metadata_ref']['blake3']).read_bytes())
                check('original_event' not in meta, 'metadata contains no second Event')
            return dict(kind=kind, row_bytes=len(c.lower.rep.w5.pack(row)), checkpoint=cprow['content']['kind'],
                        refs=len(refs))
        return fn
    cpu.positive('F0-P01', 'F0', forms('main', 'r1', 'inline'))
    cpu.positive('F0-P02', 'F0', forms('large', 'l1', 'event_reference'))
    cpu.positive('F0-P03', 'F0', forms('long', 'g1', 'record_reference'))

    def spill():
        d, st, c, sc = cpu.clone('long', 'f0-spill')
        scope = sc['g1']
        kinds = []
        for _ in range(3):
            c.rebuild(scope)
            kinds.append(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope))['value']['content']['kind'])
        check('payload_reference' in kinds, 'checkpoint spills to a payload reference')
        cprow = st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope))['value']
        check(sizes_ok(c, cprow, True), 'compact checkpoint operation fits')
        check(c.reader.read(scope)['record']['status_at_original_event'] == 'certified', 'read through spilled root')
        return dict(checkpoint_forms=kinds)
    cpu.positive('F0-P04', 'F0', spill)

    def ref_case(tag, mutate, template='large', run='l1'):
        def fn():
            d, st, c, sc = cpu.clone(template, tag)
            scope = sc[run]
            c.rebuild(scope)
            mutate(st, c, scope)
            c.reader.read(scope)
        return fn

    def corrupt(st, c, scope):
        ref = current_row(c, scope)['content']['event_ref']
        path = st.root / 'packs' / ref['blake3']
        raw = bytearray(path.read_bytes()); raw[len(raw) // 2] ^= 0x20
        path.write_bytes(bytes(raw))
    cpu.negative('F0-N01', 'F0', 'payload/numrule/payload_digest', ref_case('f0-corrupt', corrupt), 'pack corrupted at rest')
    cpu.negative('F0-N02', 'F0', 'pack/unavailable', ref_case('f0-missing', lambda st, c, s: st.withdraw_pack(
        current_row(c, s)['content']['event_ref']['blake3'])), 'pack missing')
    cpu.negative('F0-N03', 'F0', 'pack/access', ref_case('f0-access', lambda st, c, s: c.controls.set(
        pack_access_revoked=True)), 'pack inaccessible')

    def foreign(st, c, scope):
        other = S.TestOwnerStorage.create(st.root.parent / 'foreign')
        ref = other.put_pack(c.lower.rep.w5.pack({'TEST_ONLY': 'foreign'}), 'application/msgpack')
        row = current_row(c, scope)
        row['content']['event_ref'] = ref
        rebind_row(c, scope, row)
    cpu.negative('F0-N04', 'F0', 'pack/unavailable', ref_case('f0-foreign', foreign), 'foreign Storage pack reference')

    def not_first(st, c, scope):
        row = current_row(c, scope)
        rec = row['content']['record']
        ref = st.put_pack(c.lower.rep.w5.pack(rec['original_event']), 'application/msgpack')
        row['content'] = dict(kind='event_reference', metadata={k: v for k, v in rec.items() if k != 'original_event'},
                              event_ref=ref)
        rebind_row(c, scope, row)
    cpu.negative('F0-N05', 'F0', 'representation/first_fitting_form', ref_case('f0-firstfit', not_first, 'main', 'r1'),
                 'reference chosen when inline fits')

    def size_mismatch(st, c, scope):
        row = current_row(c, scope)
        row['content']['event_ref']['byte_size'] += 1
        rebind_row(c, scope, row)
    cpu.negative('F0-N06', 'F0', 'payload/numrule/payload_size', ref_case('f0-size', size_mismatch), 'false byte size')

    def media(st, c, scope):
        row = current_row(c, scope)
        row['content']['event_ref']['media_type'] = 'application/json'
        rebind_row(c, scope, row)
    cpu.negative('F0-N07', 'F0', 'schema/StorageProjection', ref_case('f0-media', media), 'false media type')

    def trailing(st, c, scope):
        row = current_row(c, scope)
        raw = (st.root / 'packs' / row['content']['event_ref']['blake3']).read_bytes() + b'\xc0'
        row['content']['event_ref'] = st.put_pack(raw, 'application/msgpack')
        rebind_row(c, scope, row)
    cpu.negative('F0-N08', 'F0', 'pack/canonical_decode', ref_case('f0-trailing', trailing), 'trailing bytes in pack')

    def metadata_substituted(st, c, scope):
        row = current_row(c, scope)
        meta = c.lower.rep.w5.unpack((st.root / 'packs' / row['content']['metadata_ref']['blake3']).read_bytes())
        meta['native_after_commitment']['workflow_owner_epoch'] += 1
        row['content']['metadata_ref'] = st.put_pack(c.lower.rep.w5.pack(meta), 'application/msgpack')
        rebind_row(c, scope, row)
    cpu.negative('F0-N09', 'F0', 'join/complete_original_record', ref_case('f0-meta', metadata_substituted, 'long', 'g1'),
                 'metadata pack substituted')

    def withdrawn_before_commit():
        d, st, c, sc = cpu.clone('large', 'f0-predurable')
        scope = sc['l1']
        gid = stage(c, scope)
        before = copy.deepcopy(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope)))

        def hook(lower):
            for digest in list(st.packs):
                if st.packs[digest]['durable'] and st.packs[digest]['byte_size'] > 9000:
                    st.withdraw_pack(digest)
        try:
            advance(c, scope, gid, 1000, hooks=dict(after_helpers=hook))
        finally:
            check(st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope)) == before, 'no reference published')
    cpu.negative('F0-N10', 'F0', 'pack/unavailable', withdrawn_before_commit,
                 'pack not durable at reference publication')

    def no_current():
        d, st, c, sc = cpu.clone('main', 'f0-nocurrent')
        scope = sc['r1']
        gid = stage(c, scope)
        full_advance(c, scope, gid)
        c.reader.read(scope)
    cpu.negative('F0-N11', 'F0', 'read/no_current', no_current, 'staged generation read as current')

    def wrong_selection():
        d, st, c, sc = cpu.clone('main', 'f0-selection')
        scope = sc['r1']
        c.rebuild(scope)
        g2 = stage(c, scope)
        c.reader.read(scope, generation=g2)
    cpu.negative('F0-N12', 'F0', 'read/selection', wrong_selection, 'staged generation selected for current read')

    def unknown_generation():
        d, st, c, sc = cpu.clone('main', 'f0-unknown')
        scope = sc['r1']
        c.rebuild(scope)
        c.reader.read(scope, generation='grsccg_' + 'f' * 64, current=False)
    cpu.negative('F0-N13', 'F0', 'read/unknown_generation', unknown_generation, 'historical read of an unbound generation')


def group_cf12_p8(cpu):
    def restore_ok():
        d, st, c, sc = cpu.clone('main', 'cf12-restore')
        scopes = [sc['r1'], sc['r2'], sc['r3']]
        before = {}
        for s in scopes:
            c.rebuild(s)
            before[s['goal_run_id']] = c.reader.read(s)['record']
        reg = A.OwnerRegistry()
        backup, tombs, driver = R.BackupOwner(reg), R.TombstoneOwner(reg), R.RestoreDriver(reg)
        handle, unit = backup.take(st, d / 'unit')
        check(unit['derived_excluded'], 'derived tables named as excluded authority')
        events, custody = len(st.events), len(st.custody)
        out = driver.restore(backup_owner=backup, handle=handle, unit_dir=d / 'unit', target=d / 'restored',
                             tombstones=tombs, scopes=scopes)
        rst, rc = out['storage'], out['consumer']
        check(len(rst.events) == events and len(rst.custody) == custody, 'no Event or custody issued by restore')
        check(out['dropped'] > 0, 'derived rows/checkpoints dropped, not restore-verified')
        for s in scopes:
            rec = rc.reader.read(s)['record']
            check(rec == before[s['goal_run_id']], 'rebuilt row equals the pre-backup original derivation')
            check(rc.checkpoint(s)['current_generation_id'] != c.checkpoint(s)['current_generation_id'],
                  'fresh generation after restore')
        check(rst.reservations == st.reservations, 'pending original work not completed by restore')
        return dict(members=len(unit['members']), dropped=out['dropped'])
    cpu.positive('CF12-P01', 'CF-12', restore_ok)

    def tombstone():
        d, st, c, sc = cpu.clone('expiring', 'cf12-tombstone')
        reg = A.OwnerRegistry()
        backup, tombs, driver = R.BackupOwner(reg), R.TombstoneOwner(reg), R.RestoreDriver(reg)
        handle, unit = backup.take(st, d / 'unit')
        gap = st.retire_segment(1, S.RetentionOwner(st))
        tombs.tombstone('segment', st.storage_instance_id, 1, st.now())
        out = driver.restore(backup_owner=backup, handle=handle, unit_dir=d / 'unit', target=d / 'restored',
                             tombstones=tombs, scopes=[sc['e1'], sc['e2']])
        rst, rc = out['storage'], out['consumer']
        check(out['applied'] == [['segment', 1]], 'current tombstone enforced at restore')
        check(rst.segments[0]['retired'] and not (rst.root / 'segment-1.seglog').exists(), 'no resurrection')
        check(rc.reader.read(sc['e1'])['record']['status_at_original_event'] == 'certified',
              'certified rebuilt through survivor proof')
        check(rc.checkpoint(sc['e2'])['generations'][rc.checkpoint(sc['e2'])['current_generation_id']]
              ['processed']['row_key'] is None, 'expired Start content not resurrected into the derived row')
        return dict(gap=[gap['first_sequence'], gap['last_sequence']])
    cpu.positive('CF12-P02', 'CF-12', tombstone)

    def hold_no_extend():
        d, st, c, sc = cpu.clone('expiring', 'p8-hold')
        scope = sc['e2']
        gid = c.rebuild(scope)
        check(c.reader.read(scope)['record']['status_at_original_event'] == 'running', 'started row before expiry')
        c.holds.hold(gid)
        st.retire_segment(1, S.RetentionOwner(st))
        try:
            c.reader.read(scope)
            check(False, 'held projection must not extend Start lifetime')
        except W.LaneRefusal as error:
            check(error.code == 'read/source_unavailable', 'full disclosure unavailable after Start expiry')
        check(P.HoldOwner.held(st.cells, gid, c.registry), 'hold still present; it holds the projection only')
        e1 = c.rebuild(sc['e1'])
        check(c.reader.read(sc['e1'])['record']['status_at_original_event'] == 'certified', 'certified survives')
        return dict(held=gid)
    cpu.positive('P8-P01', 'P8', hold_no_extend)

    def lifecycle():
        d, st, c, sc = cpu.clone('main', 'p8-lifecycle')
        scope = sc['r1']
        g1 = c.rebuild(scope)
        g2 = c.rebuild(scope)
        cp = c.checkpoint(scope)
        check(cp['generations'][g1]['state'] == 'retired', 'retired')
        try:
            c.lower.collect(scope, g1)
            check(False, 'collection inside the window must refuse')
        except W.LaneRefusal as error:
            check(error.code == 'collect/retention_window', 'window enforced')
        st.advance_clock(P.RETIREMENT_SECONDS)
        c.holds.hold(g1)
        try:
            c.lower.collect(scope, g1)
            check(False, 'held generation must not be collected')
        except W.LaneRefusal as error:
            check(error.code == 'collect/held', 'actual hold blocks deletion')
        c.holds.release(g1)
        rogue = P.HoldOwner(A.OwnerRegistry(), st)
        rogue.hold(g1, reason='TEST_ONLY:unregistered-hold')
        old_row_key = (cp['generations'][g1]['dataset_name'], P.row_key(scope))
        out = c.lower.collect(scope, g1)
        cp2 = c.checkpoint(scope)
        check(g1 not in cp2['generations'] and st.cell(*old_row_key) is None, 'eligible retired generation deleted')
        check(cp2['generations'][g2] == cp['generations'][g2], 'current untouched; no TTL')
        g3 = stage(c, scope)
        c.lower.collect(scope, g3, abandon=True)
        check(g3 not in c.checkpoint(scope)['generations'], 'never-activated stage abandoned by maintenance')
        return dict(collected=g1, abandoned=g3)
    cpu.positive('P8-P02', 'P8', lifecycle)

    def passive():
        d, st, c, sc = cpu.clone('main', 'p8-passive')
        scope = sc['r1']
        c.rebuild(scope)
        state = (st.manifest_generation, copy.deepcopy(st.cells), len(st.events), len(st.custody))
        for _ in range(2):
            c.reader.read(scope)
            c.lower.read_sources(scope)
        check((st.manifest_generation, st.cells, len(st.events), len(st.custody)) == state,
              'passive reads append, release, repair and advance nothing')
        return {}
    cpu.positive('P8-P03', 'P8', passive)

    def history_after_change():
        d, st, c, sc = cpu.clone('main', 'p8-history')
        scope = sc['r1']
        gid = c.rebuild(scope)
        rec = c.reader.read(scope)['record']
        w = W.World(d / 'w', storage=st)
        w.notes.note(w, PB, tag='later')
        w.native.advance(sc['r6'], 'running', 'active')
        check(c.reader.read(scope, generation=gid, current=False)['record'] == rec,
              'lawful later change does not invalidate retained history')
        return {}
    cpu.positive('P8-P04', 'P8', history_after_change)

    # negatives -----------------------------------------------------------
    def restore_neg(tag, mutate, *, template='main', include_derived=False, scopes=('r1',)):
        def fn():
            d, st, c, sc = cpu.clone(template, tag)
            c.rebuild(sc[scopes[0]])
            reg = A.OwnerRegistry()
            backup, tombs, driver = R.BackupOwner(reg), R.TombstoneOwner(reg), R.RestoreDriver(reg)
            handle, unit = backup.take(st, d / 'unit') if not include_derived else take_with_derived(backup, st, d / 'unit')
            extra = mutate(d, st, c, sc, backup, tombs) or ()
            driver.restore(backup_owner=backup, handle=handle, unit_dir=d / 'unit', target=d / 'restored',
                           tombstones=tombs, scopes=[sc[s] for s in scopes], extra_entries=extra)
        return fn

    def take_with_derived(backup, st, dest):
        handle, unit = backup.take(st, dest)
        cp = st.cells[P.CHECKPOINT_TABLE]
        raw = S.canonical(cp)
        (dest / 'derived').mkdir()
        (dest / 'derived' / 'checkpoints.msgpack').write_bytes(raw)
        unit['members'].append(dict(path='derived/checkpoints.msgpack', sha256=W.sha256(raw), bytes=len(raw),
                                    kind='authority'))
        (dest / R.UNIT_FILE).write_bytes(json.dumps(unit, sort_keys=True, separators=(',', ':')).encode())
        handle2 = backup._issue(None, unit, kind='backup_unit')
        return handle2, unit

    def drop_segment(d, st, c, sc, backup, tombs):
        os.unlink(d / 'unit' / 'segment-1.seglog')
    cpu.negative('CF12-N01', 'CF-12', 'restore/unit_incomplete', restore_neg('cf12-incomplete', drop_segment),
                 'incomplete original authority unit')

    def mix(d, st, c, sc, backup, tombs):
        w = W.World(d / 'w', storage=st)
        w.notes.note(w, PB, tag='later-backup')
        backup.take(st, d / 'unit2')
        shutil.copyfile(d / 'unit2' / 'segment-1.seglog', d / 'unit' / 'segment-1.seglog')
    cpu.negative('CF12-N02', 'CF-12', 'restore/member_digest', restore_neg('cf12-mix', mix), 'backup-generation mixing')

    def archive(d, st, c, sc, backup, tombs):
        (d / 'unit' / 'archive').mkdir()
        (d / 'unit' / 'archive' / 'goal-body.json').write_text('{"TEST_ONLY":"full mutable body archive"}')
    cpu.negative('CF12-N03', 'CF-12', 'restore/unexpected_member', restore_neg('cf12-archive', archive),
                 'new full-body archive in the unit')
    cpu.negative('CF12-N04', 'CF-12', 'restore/derived_as_authority',
                 restore_neg('cf12-derived', lambda *a: None, include_derived=True),
                 'derived checkpoint presented as restore-verified authority')

    def reseal(d, st, c, sc, backup, tombs):
        unit = json.loads((d / 'unit' / R.UNIT_FILE).read_bytes())
        path = d / 'unit' / 'segment-1.seglog'
        raw = path.read_bytes() + b'\x00'
        path.write_bytes(raw)
        m = next(x for x in unit['members'] if x['path'] == 'segment-1.seglog')
        m.update(sha256=W.sha256(raw), bytes=len(raw))
        (d / 'unit' / R.UNIT_FILE).write_bytes(json.dumps(unit, sort_keys=True, separators=(',', ':')).encode())
    cpu.negative('CF12-N05', 'CF-12', 'restore/seal', restore_neg('cf12-reseal', reseal),
                 'manufactured issuance in a re-sealed unit')

    def forged_tomb(d, st, c, sc, backup, tombs):
        entry = dict(qualification=QUALIFICATION, kind='segment', storage_instance_id=st.storage_instance_id, target=1,
                     deleted_at_utc=st.now(), owner_id=tombs.owner_id)
        return [('TEST_ONLY:original:forged-tombstone', entry)]
    cpu.negative('CF12-N06', 'CF-12', 'restore/tombstone_authority', restore_neg('cf12-forgedtomb', forged_tomb),
                 'tombstone entry not issued by the tombstone owner')

    def held():
        d, st, c, sc = cpu.clone('main', 'p8-heldneg')
        scope = sc['r1']
        g1 = c.rebuild(scope)
        c.rebuild(scope)
        st.advance_clock(P.RETIREMENT_SECONDS)
        c.holds.hold(g1)
        c.lower.collect(scope, g1)
    cpu.negative('P8-N04', 'P8', 'collect/held', held, 'holds bypass')

    def early():
        d, st, c, sc = cpu.clone('main', 'p8-early')
        scope = sc['r1']
        g1 = c.rebuild(scope)
        c.rebuild(scope)
        st.advance_clock(P.RETIREMENT_SECONDS - 5)
        c.lower.collect(scope, g1)
    cpu.negative('P8-N05', 'P8', 'collect/retention_window', early, 'deletion before retirement + 604800 s')

    def abandon_current():
        d, st, c, sc = cpu.clone('main', 'p8-abandon')
        scope = sc['r1']
        g1 = c.rebuild(scope)
        c.lower.collect(scope, g1, abandon=True)
    cpu.negative('P8-N06', 'P8', 'collect/not_retired_or_abandoned', abandon_current, 'current generation abandoned')

    def frozen():
        d, st, c, sc = cpu.clone('main', 'p8-frozen')
        scope = sc['r1']
        c.rebuild(scope)
        reg = A.OwnerRegistry()
        backup, tombs, driver = R.BackupOwner(reg), R.TombstoneOwner(reg), R.RestoreDriver(reg)
        handle, unit = backup.take(st, d / 'unit')
        out = driver.restore(backup_owner=backup, handle=handle, unit_dir=d / 'unit', target=d / 'restored',
                             tombstones=tombs, scopes=[])
        out['consumer'].reader.read(dict(scope, storage_instance_id=out['storage'].storage_instance_id))
    cpu.negative('P8-N07', 'P8', 'read/checkpoint_unavailable', frozen, 'frozen checkpoint resumed as current after restore')

    def reader_neg(tag, mutate, template='main', run='r1'):
        def fn():
            d, st, c, sc = cpu.clone(template, tag)
            c.rebuild(sc[run])
            mutate(d, st, c, sc)
            c.reader.read(sc[run])
        return fn
    cpu.negative('P8-N08', 'P8', 'read/disclosure_revoked',
                 reader_neg('p8-disclosure', lambda d, st, c, sc: c.controls.set(source_disclosure_revoked=True)),
                 'source disclosure revoked/deleted')
    cpu.negative('P8-N09', 'P8', 'read/reader_withdrawn',
                 reader_neg('p8-readerwd', lambda d, st, c, sc: c.controls.set(reader_withdrawn=True)),
                 'reader withdrawn')
    cpu.negative('P8-N10', 'P8', 'read/source_unavailable',
                 reader_neg('p8-expired', lambda d, st, c, sc: st.retire_segment(1, S.RetentionOwner(st)), 'expiring',
                            'e2'), 'required Start source expired')

    def drift(d, st, c, sc):
        c.reader.hooks = dict(after_helpers=lambda reader: c.controls.set(pack_access_revoked=False))
    cpu.negative('P8-N11', 'P8', 'read/final/controls', reader_neg('p8-readdrift', drift),
                 'control change after the reader helper')


def group_guard_negatives(cpu):
    """One-defect negatives for every reachable product guard not exercised above."""
    def halted_world(tag, build, expected, group, cid, boundary):
        def fn():
            d, w = cpu.fresh(tag)
            scope = build(w)
            c = P.Consumer(w.storage)
            gid = stage(c, scope)
            before = c.checkpoint(scope)['generations'][gid]['processed']
            try:
                advance(c, scope, gid, 1000)
            finally:
                check(c.checkpoint(scope)['generations'][gid]['processed'] == before, 'refused batch wrote nothing')
        cpu.negative(cid, group, 'advance/halt/' + expected, fn, boundary)

    def certified(defects=(), **kw):
        def build(w):
            s = w.scope(PA, GOAL, 'TEST_ONLY:run:g')
            w.certified_run(s, defects=defects, **kw)
            return s
        return build
    for cid, defect, code, boundary in [
            ('CF10-N32', 'commit_event', 'certified/commit_event', 'Commit names another Event'),
            ('CF10-N33', 'commit_value_commitment', 'certified/commit_value_commitment', 'Commit value commitment'),
            ('CF10-N34', 'commit_producer_digest', 'certified/commit_producer_digest', 'Commit producer digest'),
            ('CF10-N35', 'release_selector', 'certified/release_selects_commit', 'Release selects another Commit'),
            ('CF10-N36', 'release_same_transaction', 'certified/release_after_commit', 'Release coissued with Commit'),
            ('CF10-N37', 'origin_selector', 'certified/coordinator_origin', 'coordinator Origin selects another Commit'),
            ('CF10-N38', 'native_origin_selector', 'certified/native_origin_join', 'native origin selects another result'),
            ('CF10-N39', 'after_owner_epoch', 'certified/native_protected', 'protected native field changed'),
            ('CF10-N40', 'event_revision_offset', 'certified/revisions', 'Event revisions differ from native'),
            ('CF10-N41', 'capture_origin_substituted', 'certified/standard_capture_join', 'capture origin substituted'),
            ('CF10-N42', 'standard_receipt_ref', 'certified/standard_receipt_ref', 'Event names another Standard receipt')]:
        halted_world(cid.lower(), certified((defect,)), code, 'CF-10', cid, boundary)

    def uncommitted(w):
        s = w.scope(PA, GOAL, 'TEST_ONLY:run:uc')
        w.birth(s); w.start(s)
        w.native.advance(s, 'provisional_success'); w.native.advance(s, 'verifying')
        w.certify(s, commit=False)
        return s
    halted_world('uncommitted', uncommitted, 'certified/commit_unavailable', 'CF-10', 'CF10-N31',
                 'Event-only certification (no joint commit)')

    def started(defects=(), pre=None):
        def build(w):
            s = w.scope(PA, GOAL, 'TEST_ONLY:run:s')
            w.birth(s)
            if pre:
                pre(w, s)
            w.start(s, defects=defects, check_state=pre is None)
            return s
        return build
    for cid, defect, code, boundary in [
            ('CF10-N43', 'start_commit_sequence', 'start/commit_event', 'Start commit names another sequence'),
            ('CF10-N44', 'start_first_receipt', 'start/first_receipt', 'Start commit substituted first receipt'),
            ('CF10-N45', 'start_candidate_digest', 'start/candidate_event', 'Start candidate producer digest'),
            ('CF10-N46', 'start_head_status', 'start/d01_join', 'Start D01 head mismatched'),
            ('CF10-N48', 'start_event_revision_offset', 'start/revisions', 'Start Event revisions differ'),
            ('CF10-N49', 'start_no_origin', 'start/origin_unavailable', 'Start origin missing'),
            ('CF10-N50', 'start_origin_selector', 'start/origin_join', 'Start origin selects another commit')]:
        halted_world(cid.lower(), started((defect,)), code, 'CF-10', cid, boundary)
    halted_world('startrunning', started((), pre=lambda w, s: w.native.advance(s, 'running')),
                 'start/native_transition', 'CF-10', 'CF10-N47', 'Start from a non-ready native state')

    def cancelled(defects=(), start=True):
        def build(w):
            s = w.scope(PA, GOAL, 'TEST_ONLY:run:x')
            w.birth(s)
            if start:
                w.start(s)
            w.cancel(s, defects=defects)
            return s
        return build
    for cid, defect, code, boundary in [
            ('CF10-N51', 'd06_result_event', 'cancel/d06_event', 'D06 result names another Event'),
            ('CF10-N52', 'd06_candidate_event', 'cancel/d06_candidate_join', 'D06 candidate names another Event'),
            ('CF10-N62', 'd06_intent_event', 'cancel/d06_intent_join', 'D06 intent names another Event'),
            ('CF10-N63', 'd06_prepare_origin_selector', 'cancel/d06_prepare_origin_join',
             'D06 prepare origin selects another result'),
            ('CF10-N64', 'd06_publish_origin_selector', 'cancel/d06_publish_origin_join',
             'D06 publish origin selects another result'),
            ('CF10-N53', 'd05_origin_selector', 'cancel/d05_origin', 'D05 origin selects another result'),
            ('CF10-N54', 'cancel_update_edit', 'cancel/d01_join', 'D01 update differs from D06 after-state'),
            ('CF10-N55', 'cancel_status_stopped', 'cancel/native_transition', 'native edge to stopped, not cancelled'),
            ('CF10-N56', 'cancel_event_revision_offset', 'cancel/revisions', 'cancelled Event revisions differ')]:
        halted_world(cid.lower(), cancelled((defect,)), code, 'CF-10', cid, boundary)

    def phantom_start(w):
        s = w.scope(PA, GOAL, 'TEST_ONLY:run:ph')
        y = w.scope(PA, GOAL, 'TEST_ONLY:run:phy')
        w.birth(y); w.start(y)
        w.birth(s)
        value = w.storage.cell(W.F['start_commit'], W.run_key(y, 'start_commit'))['value']
        w.storage.transact([dict(table=W.F['start_commit'], key=W.run_key(s, 'start_commit'), expected=None,
                                 value=value)])
        w.cancel(s)
        return s
    halted_world('phantomstart', phantom_start, 'cancel/initialized_no_start', 'CF-10', 'CF10-N57',
                 'initialized-no-start cancellation while a Start lineage record exists')

    # lifecycle and publication boundaries ----------------------------------
    def lower_case(tag, fn, code, group, cid, boundary, template='main', run='r1'):
        def run_():
            d, st, c, sc = cpu.clone(template, tag)
            fn(d, st, c, sc[run])
        cpu.negative(cid, group, code, run_, boundary)

    lower_case('p6-retired-adv', lambda d, st, c, s: (c.rebuild(s), advance_retired(c, s, c.rebuild(s))),
               'advance/generation_state', 'P6', 'P6-N15', 'advance on a retired generation')
    lower_case('p6-unknown-adv', lambda d, st, c, s: c.projector.project_prefix(s, 'advance', request=dict(
        operation='advance', generation_id='grsccg_' + 'f' * 64, expected_frontier_revision=0, batch_limit=1)),
        'advance/unknown_generation', 'P6', 'P6-N16', 'advance on an unbound generation')
    lower_case('p6-noprogress', lambda d, st, c, s: (lambda g: (full_advance(c, s, g), advance(c, s, g, 1)))(stage(c, s)),
               'advance/no_progress', 'P6', 'P6-N17', 'empty advance')

    def profile_changed(d, st, c, s):
        g = stage(c, s)
        saved = copy.deepcopy(P._BANK['profile'])
        P._BANK['profile']['profile_digest'] = W.sha256(b'TEST_ONLY:reinstalled-profile')
        try:
            advance(c, s, g, 1)
        finally:
            P._BANK['profile'] = saved
    lower_case('p5-profile', profile_changed, 'advance/profile', 'P5', 'P5-N20',
               'installed derived profile changed under a generation')
    lower_case('p6-cut-retired', lambda d, st, c, s: (lambda g1: (c.rebuild(s), c.projector.project_prefix(
        s, 'cutover', request=dict(operation='cutover', generation_id=g1,
                                   expected_frontier_revision=c.checkpoint(s)['generations'][g1]['frontier_revision']))))(
        c.rebuild(s)), 'cutover/not_staged', 'P6', 'P6-N18', 'cutover of a retired generation')
    lower_case('p6-cut-unknown', lambda d, st, c, s: c.projector.project_prefix(s, 'cutover', request=dict(
        operation='cutover', generation_id='grsccg_' + 'f' * 64, expected_frontier_revision=0)),
        'cutover/unknown_generation', 'P6', 'P6-N19', 'cutover of an unbound generation')

    def row_binding(d, st, c, s):
        g = stage(c, s)
        full_advance(c, s, g)
        cp = c.checkpoint(s)
        gen = cp['generations'][g]
        gen['processed']['row_sha256'] = W.sha256(b'TEST_ONLY:other-row')
        gen['frontier_sha256'] = P.frontier_of(gen['anchor_sha256'], gen['frontier_revision'],
                                               gen['prior_frontier_sha256'], gen['processed'],
                                               gen['last_transaction_id'])
        write_cell(st, P.CHECKPOINT_TABLE, P.checkpoint_key(s), c.lower.rep.encode_checkpoint(cp, publish=True))
        cutover(c, s, g)
    lower_case('p6-rowbinding', row_binding, 'cutover/row_binding', 'P6', 'P6-N20',
               'staged root binds a row the originals do not derive')

    def recovered(d, st, c, s):
        g = stage(c, s)
        full_advance(c, s, g)
        active = st.segments[-1]
        with open(st._segment_path(active['generation']), 'ab') as handle:
            handle.write(b'TEST_ONLY torn tail')
        st2 = W.LaneStorage.open(st.root)
        cutover(P.Consumer(st2), s, g)
    lower_case('p6-recovered', recovered, 'cutover/seglog_frontier', 'P6', 'P6-N21',
               'generic frontier changed by recovery after the last advance (inadequate frontier)')
    lower_case('p8-collect-unknown', lambda d, st, c, s: (c.rebuild(s), c.lower.collect(s, 'grsccg_' + 'f' * 64)),
               'collect/unknown_generation', 'P8', 'P8-N13', 'collect an unbound generation')
    lower_case('p8-collect-nocp', lambda d, st, c, s: c.lower.collect(s, 'grsccg_' + 'f' * 64),
               'collect/checkpoint', 'P8', 'P8-N14', 'collect without a checkpoint')

    def collect_hook(kind):
        def fn(d, st, c, s):
            g1 = c.rebuild(s)
            c.rebuild(s)
            st.advance_clock(P.RETIREMENT_SECONDS)
            if kind == 'held':
                hook = lambda lower: c.holds.hold(g1)
            else:
                hook = lambda lower: write_cell(st, P.CHECKPOINT_TABLE, P.checkpoint_key(s),
                                                st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(s))['value'])
            c.lower.collect(s, g1, hooks=dict(after_helpers=hook))
        return fn
    lower_case('p8-collect-held', collect_hook('held'), 'collect/final/held', 'P8', 'P8-N15',
               'hold issued after the collection helper')
    lower_case('p8-collect-root', collect_hook('root'), 'collect/final/checkpoint', 'P8', 'P8-N16',
               'root changed after the collection helper')
    lower_case('p6-candtype', lambda d, st, c, s: advance(c, s, stage(c, s), 1, edit=lambda cand: [cand]),
               'publish/candidate_type', 'P6', 'P6-N22', 'candidate is not a whole object')
    lower_case('p6-candop', lambda d, st, c, s: advance(c, s, stage(c, s), 1,
                                                       edit=lambda cand: dict(cand, operation='cutover')),
               'publish/operation', 'P6', 'P6-N23', 'candidate operation differs from the request')
    lower_case('p5-seedtype', lambda d, st, c, s: c.projector.project_prefix(
        s, 'stage', request_edit=lambda r: dict(r, seed_hex='zz')), 'stage/seed_type', 'P5', 'P5-N21',
        'seed of the wrong type')

    def other_checkpoint(d, st, c, s):
        sc = cpu.templates['main'][1]
        c.rebuild(s)
        c.rebuild(sc['r2'])
        write_cell(st, P.CHECKPOINT_TABLE, P.checkpoint_key(s),
                   st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(sc['r2']))['value'])
        c.reader.read(s)
    lower_case('f0-cpkey', other_checkpoint, 'read/checkpoint_key', 'F0', 'F0-N14',
               'root of another run substituted at this key')

    def current_not_current(d, st, c, s):
        g1 = c.rebuild(s)
        c.rebuild(s)
        cp = c.checkpoint(s)
        cp['current_generation_id'] = g1
        write_cell(st, P.CHECKPOINT_TABLE, P.checkpoint_key(s), c.lower.rep.encode_checkpoint(cp, publish=True))
        c.reader.read(s)
    lower_case('f0-curstate', current_not_current, 'read/current_state', 'F0', 'F0-N15',
               'current selection names a retired generation')

    def read_hook(kind):
        def fn(d, st, c, s):
            c.rebuild(s)
            if kind == 'root':
                c.reader.hooks = dict(after_helpers=lambda r: write_cell(
                    st, P.CHECKPOINT_TABLE, P.checkpoint_key(s), st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(s))['value']))
            else:
                w = W.World(d / 'w', storage=st)
                c.reader.hooks = dict(after_helpers=lambda r: w.notes.note(w, PB, tag='read-drift'))
            c.reader.read(s)
        return fn
    lower_case('p8-readroot', read_hook('root'), 'read/final/checkpoint', 'P8', 'P8-N17',
               'root changed after the reader helper')
    lower_case('p8-readseglog', read_hook('seglog'), 'read/final/seglog', 'P8', 'P8-N18',
               'generic frontier advanced after the reader helper')

    def no_unit_file(d, st, c, s):
        reg = A.OwnerRegistry()
        backup, tombs, driver = R.BackupOwner(reg), R.TombstoneOwner(reg), R.RestoreDriver(reg)
        handle, unit = backup.take(st, d / 'unit')
        os.unlink(d / 'unit' / R.UNIT_FILE)
        driver.restore(backup_owner=backup, handle=handle, unit_dir=d / 'unit', target=d / 'restored',
                       tombstones=tombs, scopes=[s])
    lower_case('cf12-nounit', no_unit_file, 'restore/unit_present', 'CF-12', 'CF12-N07', 'unit seal file missing')

    # Storage transaction issuance and owner preconditions -------------------
    def foreign_handle(d, st, c, s):
        other = W.LaneStorage.create(d / 'other')
        handle, _ = other.begin()
        st.commit(handle, [dict(table='TEST_ONLY:t', key='k', expected=None, value=dict(q=QUALIFICATION))])
    lower_case('p6-foreignhandle', foreign_handle, 'tx/handle_issuer', 'P6', 'P6-N24',
               'transaction handle issued by another Storage')
    lower_case('p6-dicthandle', lambda d, st, c, s: st.commit(dict(tx_id='TEST_ONLY:tx:x:1'), []),
               'tx/handle_type', 'P6', 'P6-N25', 'transport-shaped transaction handle')

    def owner_pre(kind):
        def fn(d, st, c, s):
            w = W.World(d / 'w', storage=st)
            sc = cpu.templates['main'][1]
            if kind == 'unborn':
                w.start(w.scope(PA, GOAL, 'TEST_ONLY:run:unborn'))
            elif kind == 'start_twice':
                w.start(sc['r4'])
            elif kind == 'cancel_twice':
                w.cancel(sc['r2'])
            else:
                w.certify(sc['r4'])
        return fn
    lower_case('w-unborn', owner_pre('unborn'), 'native/unborn', 'CF-10', 'CF10-N58', 'Start on an unborn run')
    lower_case('w-starttwice', owner_pre('start_twice'), 'start/state', 'CF-10', 'CF10-N59', 'second Start issuance')
    lower_case('w-canceltwice', owner_pre('cancel_twice'), 'cancel/state', 'CF-10', 'CF10-N60',
               'cancellation of a cancelled run')
    lower_case('w-certrunning', owner_pre('certify'), 'certify/native_state', 'CF-10', 'CF10-N61',
               'certification from running')


def advance_retired(c, scope, current_gid):
    cp = c.checkpoint(scope)
    retired = [g for g, v in cp['generations'].items() if v['state'] == 'retired'][0]
    return advance(c, scope, retired, 1)


# ------------------------------------------------------------------ matrix

MATRIX = [
    dict(op='stage', cut='publish_before_commit', template='main', expect='none'),
    dict(op='stage', cut='publish_after_commit', template='main', expect='both'),
    dict(op='advance', cut='publish_after_pack', template='large', expect='pack_only'),
    dict(op='advance', cut='publish_before_commit', template='main', expect='none'),
    dict(op='advance', cut='publish_after_commit', template='main', expect='both'),
    dict(op='cutover', cut='publish_before_commit', template='main', expect='none'),
    dict(op='cutover', cut='publish_after_commit', template='main', expect='both'),
    dict(op='advance', cut=None, template='main', expect='both'),
]


def child(spec):
    """One fresh process: open Storage, run the op (maybe die at the cut) or read back."""
    st = W.LaneStorage.open(spec['storage'])
    c = P.Consumer(st)
    scope = spec['scope']
    if spec['mode'] == 'read':
        cell = st.cell(P.CHECKPOINT_TABLE, P.checkpoint_key(scope))
        cp = None if cell is None else c.lower.rep.decode_checkpoint(cell['value'])
        out = dict(checkpoint=None if cp is None else dict(root_revision=cp['root_revision'],
                                                            current=cp['current_generation_id'],
                                                            generations={g: dict(state=v['state'],
                                                                                 frontier=v['frontier_revision'],
                                                                                 rows=v['processed']['verified_row_count'],
                                                                                 row_key=v['processed']['row_key'])
                                                                         for g, v in cp['generations'].items()}),
                   rows={t: sorted(k) for t, k in st.cells.items() if t.startswith(P.ROW_PREFIX)},
                   packs=sorted(d for d, v in st.packs.items() if v['durable']),
                   manifest_generation=st.manifest_generation, events=len(st.events), custody=len(st.custody))
        print(json.dumps(out))
        return 0
    request = spec.get('request')
    out = c.projector.project_prefix(scope, spec['op'], request=request)
    print(json.dumps(dict(tx=out['tx_id'], replay=out['replay'])))
    return 0


def run_child(spec, cut=None):
    env = dict(os.environ)
    env.pop(W.CUT_ENV, None)
    if cut:
        env[W.CUT_ENV] = cut
    p = subprocess.run([sys.executable, str(Path(__file__)), '--child', json.dumps(spec)], capture_output=True,
                       text=True, env=env, cwd=str(HERE), timeout=600)
    out = None
    if p.returncode == 0 and p.stdout.strip():
        out = json.loads(p.stdout.strip().splitlines()[-1])
    return p.returncode, out, p.stderr[-2000:]


def matrix(cpu):
    for row in MATRIX:
        tag = 'matrix-%s-%s' % (row['op'], row['cut'] or 'none')
        try:
            d, st, c, sc = cpu.clone(row['template'], tag)
            scope = sc['r1'] if row['template'] == 'main' else sc['l1']
            if row['op'] in ('advance', 'cutover'):
                gid = stage(c, scope)
                if row['op'] == 'cutover':
                    full_advance(c, scope, gid)
                src = c.lower.read_sources(scope)
                request = c.projector.request_for(scope, row['op'], generation_id=gid, batch_limit=1000, src=src)
            else:
                request = None
            packs_before = sorted(x for x, v in st.packs.items() if v['durable'])
            del st, c
            spec = dict(storage=str(d / 'storage'), scope=scope, op=row['op'], request=request, mode='run')
            code, out, err = run_child(spec, row['cut'])
            rcode, back, rerr = run_child(dict(spec, mode='read'))
            expected_exit = 0 if row['cut'] is None else S.CRASH_EXIT
            ok = code == expected_exit and rcode == 0
            cpk = back['checkpoint'] if back else None
            if row['op'] == 'stage':
                visible = cpk is not None and len(cpk['generations']) == 1
                ok = ok and (visible if row['expect'] == 'both' else cpk is None)
            elif row['op'] == 'advance':
                g = cpk['generations'][request['generation_id']]
                committed = g['frontier'] == request['expected_frontier_revision'] + 1
                row_present = any(back['rows'].values())
                if row['expect'] == 'both':
                    ok = ok and committed and row_present
                elif row['expect'] == 'none':
                    ok = ok and not committed and not row_present
                else:  # pack_only: pack durable, neither row nor checkpoint advanced
                    ok = ok and not committed and not row_present and len(back['packs']) > len(packs_before)
            else:
                g = cpk['generations'][request['generation_id']]
                ok = ok and ((g['state'] == 'current') if row['expect'] == 'both' else (g['state'] == 'staged'))
            re1 = run_child(dict(spec, mode='run', request=request if row['op'] != 'stage' else None))
            back1 = run_child(dict(spec, mode='read'))[1]
            re2 = run_child(dict(spec, mode='run', request=request if row['op'] != 'stage' else None))
            back2 = run_child(dict(spec, mode='read'))[1]
            if row['op'] != 'stage':
                ok = ok and re1[0] == 0 and re2[0] == 0 and re2[1]['replay'] is True
                if row['expect'] == 'both':
                    ok = ok and re1[1]['replay'] is True and back1['checkpoint'] == back['checkpoint']
                ok = ok and back2['checkpoint'] == back1['checkpoint'] and back2['rows'] == back1['rows']
                ok = ok and back2['events'] == back['events'] and back2['custody'] == back['custody']
            else:
                ok = ok and re1[0] == 0
            cpu.matrix.append(dict(op=row['op'], cut=row['cut'], expect=row['expect'], exit=code, readback=back,
                                   reentry=[re1[0], re1[1], re2[0], re2[1]], pass_=bool(ok),
                                   stderr=None if ok else (err + rerr + re1[2] + re2[2])[-3000:]))
            print('%-5s matrix %-8s %-22s exit=%s' % ('PASS' if ok else 'FAIL', row['op'], row['cut'], code), flush=True)
        except Exception:  # noqa: BLE001
            cpu.matrix.append(dict(op=row['op'], cut=row['cut'], pass_=False, stderr=traceback.format_exc(limit=6)))
            print('FAIL  matrix %s %s %s' % (row['op'], row['cut'], traceback.format_exc(limit=3)), flush=True)


# ------------------------------------------------------------------ main

def guards(cases):
    out = {}
    for case in cases:
        if case['kind'] == 'negative' and case['pass_']:
            out.setdefault(case['expected'], []).append(case['id'])
    return dict(sorted(out.items()))


def run(work, output=None, only=None):
    t0 = time.time()
    cpu = Corpus(work)
    P.representation()
    cpu.template('main', build_main)
    cpu.template('expiring', build_expiring)
    cpu.template('large', build_large)
    cpu.template('long', build_long)
    groups = dict(cf10=group_cf10_p4, cf11=group_cf11_p5_p6, f0=group_f0, cf12=group_cf12_p8,
                  guards=group_guard_negatives, matrix=matrix)
    for name, fn in groups.items():
        if only and name not in only:
            continue
        fn(cpu)
    pos = [c for c in cpu.cases if c['kind'] == 'positive']
    neg = [c for c in cpu.cases if c['kind'] == 'negative']
    failures = [c for c in cpu.cases if not c['pass_']] + [m for m in cpu.matrix if not m['pass_']]
    per_group = {}
    for c in cpu.cases:
        g = per_group.setdefault(c['group'], dict(positives=0, negatives=0, failures=0))
        g['positives' if c['kind'] == 'positive' else 'negatives'] += 1
        g['failures'] += 0 if c['pass_'] else 1
    result = dict(status='pass' if not failures else 'fail', qualification=QUALIFICATION, native=NATIVE_LINE,
                  positives=len(pos), negatives=len(neg), matrix_rows=len(cpu.matrix),
                  matrix_pass=sum(1 for m in cpu.matrix if m['pass_']), per_group=per_group,
                  failures=[dict(id=f.get('id') or ('matrix:%s:%s' % (f.get('op'), f.get('cut'))),
                                 expected=f.get('expected'), actual=f.get('actual'),
                                 error=f.get('error') or f.get('stderr')) for f in failures],
                  guards=guards(cpu.cases), cases=cpu.cases, matrix=cpu.matrix,
                  seconds=round(time.time() - t0, 1))
    if output:
        Path(output).write_text(json.dumps(result, indent=1, ensure_ascii=False, default=str))
    print(json.dumps({k: result[k] for k in ('status', 'positives', 'negatives', 'matrix_rows', 'matrix_pass',
                                             'per_group', 'seconds')}, indent=1))
    return 0 if not failures else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--output')
    ap.add_argument('--work')
    ap.add_argument('--only', nargs='*')
    ap.add_argument('--keep', action='store_true')
    ap.add_argument('--child')
    args = ap.parse_args(argv)
    if args.child:
        return child(json.loads(args.child))
    work = Path(args.work) if args.work else Path(tempfile.mkdtemp(prefix='dg-cf3-'))
    try:
        return run(work, args.output, args.only)
    finally:
        if not args.keep and not args.work:
            shutil.rmtree(str(work), ignore_errors=True)


if __name__ == '__main__':
    sys.exit(main())
