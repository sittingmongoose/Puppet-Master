#!/usr/bin/env python3
"""DG-CF2 complete original-path oracles: goal_run.certified CF-06, CF-07, CF-08, CF-09, P7.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Every case runs the coordinator world (pm_goal_dg_cf2_world) and consumer
readers (pm_goal_dg_cf2_consumer) on the shared TEST_ONLY owner adapters.
Positives are complete original paths with whole-root validation, ordered
method-call records and before/after observations. Each negative starts from
the valid path, changes exactly one thing at one boundary with every
dependent copy coherent, and must refuse with exactly its own guard code;
the post-check records which earlier genuine effects were preserved and how
passive recovery classifies the operation.

The fault matrix kills a real child process (os._exit) at each Storage cut
inside the certified append and at each lane cut around the compact
transactions, reopens the directories in a fresh process, classifies with
recover_original (reads only surviving authority), and re-enters in another
fresh process, which must refuse to complete and leave Storage unchanged.

Usage:
  python3 scripts/pm_goal_dg_cf2_oracles.py --output <json> [--only CF-06,...] [--no-matrix]
  python3 scripts/pm_goal_dg_cf2_oracles.py --child run|classify|reenter --work <dir> [--cut <cut>]
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
import traceback

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as GS
import pm_goal_dg_cf2_world as W
import pm_goal_dg_cf2_consumer as C
import pm_goal_dg_cf2_native as N

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
HERE = Path(__file__).resolve().parent
ROOT = W.ROOT
REFUSALS = (A.AdapterRefusal, S.StorageRefusal, NR.NumruleRefusal)
STORAGE_CUTS = ('before_reservation', 'after_reservation', 'before_append', 'torn_member_frame', 'torn_commit_frame',
                'after_append_frames', 'after_append', 'before_first_receipt', 'after_first_receipt')
CASES = []


def code_of(error):
    return getattr(error, 'code', None) or getattr(error, 'reason', None) or type(error).__name__


def case(cid, group, kind, guard=None, desc=''):
    def register(fn):
        CASES.append(dict(id=cid, group=group, kind=kind, guard=guard, desc=desc, fn=fn))
        return fn
    return register


require = A.require


# ------------------------------------------------------------------ phase runner

class Run:
    """Step-by-step original path so a negative can act at one boundary."""
    ORDER = ('prepare', 'arm', 'append', 'commit', 'readback', 'release', 'current')

    def __init__(self, work, *, hooks=None, mutate=None, unrelated=True, separate_d01=False, ctx_edit=None):
        self.w = W.World(work, separate_d01=separate_d01)
        self.w.hooks.update(hooks or {})
        self.ctx = W.build_context(self.w, mutate=mutate, unrelated=unrelated)
        if ctx_edit:
            ctx_edit(self)
        self.obs = {}
        self.done = []

    def step(self, name):
        w, ctx, obs = self.w, self.ctx, self.obs
        co = w.coordinator
        if name == 'prepare':
            obs['prepared'] = co.prepare(ctx)
        elif name == 'arm':
            obs['intent'], obs['control_armed'] = co.arm(ctx, obs['prepared'])
        elif name == 'append':
            obs['appended'] = co.append_held(ctx, obs.get('intent') or self.stored('intent'),
                                             obs.get('control_armed') or self.stored('control'))
        elif name == 'commit':
            obs['committed'] = co.commit_native(ctx, obs['appended'])
        elif name == 'readback':
            obs['readback'] = co.readback(ctx, obs['committed'])
        elif name == 'release':
            obs['released'] = co.release(ctx, obs.get('committed'), obs.get('readback'))
        elif name == 'current':
            obs['current'] = co.read_current(ctx)
        self.done.append(name)
        return obs

    def stored(self, family):
        cell = self.w.coordinator.compact(family, self.ctx['scope'], self.ctx['op'])[1]
        return None if cell is None else cell['value']

    def until(self, last):
        for name in self.ORDER[:self.ORDER.index(last) + 1]:
            self.step(name)
        return self

    def classification(self):
        intent = self.stored('intent')
        req = W.recovery_request(self.w, self.ctx, intent['record'] if intent else self.obs['prepared']['intent'])
        res = self.w.coordinator.recover_original(req)
        return dict(outcome=res['outcome'], reason=res.get('reason'), known_phase=res.get('known_phase'))

    def consumer(self):
        if not hasattr(self, '_consumer'):
            self._consumer = C.Consumer(self.w.registry, self.w)
        return self._consumer


def observe(w):
    return dict(storage=w.storage.observe(), goal=w.goal_store.observe())


def neg(run, phase, *, post=None):
    """Negative wrapper: the refused call is `phase`; post-check records preservation."""
    before = observe(run.w)

    def call():
        if callable(phase):
            return phase()
        return run.step(phase)

    def check():
        after = observe(run.w)
        out = dict(storage_changed=not A.same(before['storage'], after['storage']),
                   goal_changed=not A.same(before['goal'], after['goal']),
                   events_before=before['storage']['events'], events_after=after['storage']['events'],
                   custody_after=after['storage']['custody'])
        try:
            out['classification'] = run.classification()
        except REFUSALS as error:
            out['classification'] = dict(refused=code_of(error))
        except KeyError:
            out['classification'] = dict(not_prepared=True)
        if post:
            out.update(post(run, before, after))
        return out
    return dict(call=call, post=check)


def only_nonstorage_changes(run, before, after):
    require('post/no_append', after['storage']['events'] == before['storage']['events'])
    require('post/no_custody', after['storage']['custody'] == before['storage']['custody'])
    return dict(no_append=True)


def native_unchanged(run, before, after):
    body = run.w.native.body(run.ctx['scope'])['value']
    require('post/native_unchanged', body['status'] in ('verifying', 'provisional_success'))
    return dict(native_status=body['status'])


# ------------------------------------------------------------------ CF-06

@case('CF06-P01', 'CF-06', 'positive', desc='complete F5a->F5b->F5c->F5d held append with an unrelated-scope group member')
def cf06_p01(work):
    r = Run(work).until('append')
    w, ctx, obs = r.w, r.ctx, r.obs
    app = obs['appended']
    calls = [c for c in w.recorder.calls if c['parent'] is None]
    top = [c['method'] for c in calls]
    require('positive/order', top.index('owner.workflow.certified_event.prepare.v1') <
            top.index('owner.storage.certified_event.arm.v1') < top.index('owner.storage.certified_event.append_held.v1'))
    append_call = next(c for c in calls if c['method'] == 'owner.storage.certified_event.append_held.v1')
    sid = 'storage:' + w.storage.storage_instance_id
    b, a = append_call['before'][sid]['value'], append_call['after'][sid]['value']
    require('positive/two_member_group', a['events'] - b['events'] == 2 and a['custody'] - b['custody'] == 2)
    group = app['evidence']['active_durable_group']
    require('positive/group_members', [m['event_id'] for m in group['members']] ==
            [ctx['identity']['event_id'], 'TEST_ONLY:goal_test.unrelated:cf2'])
    partitions = {m['event']['project_id'] for m in app['evidence']['members']}
    require('positive/unrelated_scope', len(partitions) == 2)
    for m in group['members']:
        raw = w.storage.read_frame(m['event_id'])
        frame = S.decode_frame(raw, 0, generation=group['segment_generation'], prior_sequence=None, prior_control=False)
        require('positive/frame_crc', frame.value['event_id'] == m['event_id'] and W.sha(raw) == m['frame_sha256'])
        custody = w.storage.first_custody(m['event_id'])
        require('positive/receipt_barrier', custody['first_append_receipt']['durability_class'] == 'barrier')
        require('positive/group_digest', custody['group_digest'] == group['group_digest'])
    ep = app['event_phase']
    target = app['evidence']['members'][0]
    require('positive/event_phase_custody', ep['first_custody']['sha256'] == W.sha(W.mp(target['custody'])) and
            ep['active_group_sha256'] == W.sha(W.mp(group)) and
            ep['all_member_custody_sha256'] == W.sha(W.mp([m['custody'] for m in app['evidence']['members']])))
    require('positive/stored_producer25', A.same(S.producer25(target['event']), ctx['producer25']))
    require('positive/storage_assigned', all(k in target['event'] for k in S.STORAGE_FIELDS))
    require('positive/held_not_visible', app['certification_visible'] is False and app['control']['phase'] == 'event_durable')
    eptx = w.coordinator.compact('eventphase', ctx['scope'], ctx['op'])[1]['tx']
    ctltx = w.coordinator.compact('control', ctx['scope'])[1]['tx']
    require('positive/event_phase_transaction', eptx == ctltx == ep['transaction_id'])
    guard_children = [c for c in w.recorder.calls if c['method'] == 'read_guard' and c['parent'] == append_call['index']]
    require('positive/own_guard_acquisition', len(guard_children) >= 1)
    return dict(group_members=len(group['members']), group_digest=group['group_digest'],
                target_sequence=target['event']['sequence_id'], event_phase_tx=eptx,
                method_order=[m for m in top if m.startswith('owner.')])


@case('CF06-P02', 'CF-06', 'positive', desc='lost acknowledgement: same operation re-entry reads original results only')
def cf06_p02(work):
    r = Run(work).until('append')
    first = r.obs['appended']
    before = r.w.storage.observe()
    again = r.w.coordinator.append_held(r.ctx, r.stored('intent'), r.stored('control'))
    require('positive/no_second_append', A.same(before, r.w.storage.observe()))
    require('positive/same_result', A.same(again['event_phase'], first['event_phase']) and
            A.same(again['evidence'], first['evidence']))
    return dict(storage_unchanged=True)


@case('CF06-P03', 'CF-06', 'positive', desc='equal semantic retry through Storage dedupes to the same first receipt')
def cf06_p03(work):
    r = Run(work).until('append')
    w, ctx = r.w, r.ctx
    receipt = w.storage.first_custody(ctx['identity']['event_id'])
    events = w.storage.observe()['events']
    handle = w.storage.reserve('TEST_ONLY:operation:equal-retry', dict(kind='retry'))
    out = w.storage.append(handle, [copy.deepcopy(ctx['producer25'])], durability_class='barrier')
    require('positive/dedupe', out['status'] == 'dedupe' and out['event_ids'] == [ctx['identity']['event_id']])
    require('positive/no_new_event', w.storage.observe()['events'] == events)
    require('positive/same_receipt', A.same(w.storage.first_custody(ctx['identity']['event_id']), receipt))
    return dict(status=out['status'])


def _cf06_neg(cid, guard, desc, *, hooks=None, mutate=None, ctx_edit=None, until='arm', phase='append', post=None,
              unrelated=True):
    @case(cid, 'CF-06', 'negative', guard, desc)
    def fn(work):
        r = Run(work, hooks=hooks, mutate=mutate, ctx_edit=ctx_edit, unrelated=unrelated)
        if until:
            r.until(until)
        return neg(r, phase(r) if callable(phase) and phase.__code__.co_argcount == 1 else phase, post=post)
    return fn


def _edit_p25(field, value):
    def edit(run):
        run.ctx['producer25'][field] = value
    return edit


_cf06_neg('CF06-N01', 'f5a/future_inputs', 'a first-custody value presented as an F5a input',
          ctx_edit=lambda r: r.ctx['presented'].__setitem__('first_custody', dict(event_id='future')),
          post=only_nonstorage_changes)
_cf06_neg('CF06-N02', 'f5a/preappend_source', 'stale pre-append source: another group appended after acquisition',
          hooks={'preappend': lambda w, ctx: w.appender.append_original(
              'TEST_ONLY:operation:interloper', dict(k='i'), [w.unrelated.resolve(w.unrelated.queue('interloper'))[1]])})
_cf06_neg('CF06-N03', 'append/guard_outcome', 'unheld append: control never armed (empty guard)', until='prepare',
          post=only_nonstorage_changes)
_cf06_neg('CF06-N04', 'f5a/replay_policy', 'replay-only admission: producer25 replay_policy projector_replay_only',
          ctx_edit=_edit_p25('replay_policy', 'projector_replay_only'), post=only_nonstorage_changes)
_cf06_neg('CF06-N05', 'f5a/storage_assigned_supplied', 'caller-supplied Storage sequence_id in producer25',
          ctx_edit=_edit_p25('sequence_id', 0), post=only_nonstorage_changes)


@case('CF06-N06', 'CF-06', 'negative', 'f5a/producer25', 'altered source after arm: producer25 actor differs from armed')
def cf06_n06(work):
    r = Run(work).until('arm')
    r.ctx['producer25']['actor_ref'] = 'TEST_ONLY:actor:other'
    return neg(r, 'append', post=only_nonstorage_changes)


_cf06_neg('CF06-N07', 'f5a/goal_current', 'Goal body changed between arm and append',
          hooks={'preappend': lambda w, ctx: w.goal.edit(ctx['values']['goal']['goal_id'], goal_revision=4)},
          post=only_nonstorage_changes)
_cf06_neg('CF06-N08', 'f5a/effective_stop', 'Goal Stop became effective before append',
          hooks={'preappend': lambda w, ctx: w.goal.stop(ctx['values']['goal']['goal_id'])}, post=only_nonstorage_changes)
_cf06_neg('CF06-N09', 'f5a/permission', 'permission revoked before append',
          hooks={'preappend': lambda w, ctx: w.permission.revoke(ctx['scope']['goal_run_id'])}, post=only_nonstorage_changes)
_cf06_neg('CF06-N10', 'f5a/native_current', 'native Workflow advanced by another writer before append',
          hooks={'preappend': lambda w, ctx: w.native.advance(w, ctx['scope'], 'provisional_success', kind='progress')},
          post=only_nonstorage_changes)


@case('CF06-N11', 'CF-06', 'negative', 'f5a/intent_bytes', 'presented Intent differs from the stored original')
def cf06_n11(work):
    r = Run(work).until('arm')
    bad = copy.deepcopy(r.stored('intent'))
    bad['record']['transaction_id'] = 'TEST_ONLY:tx:substituted'
    return neg(r, lambda: r.w.coordinator.append_held(r.ctx, bad, r.stored('control')), post=only_nonstorage_changes)


@case('CF06-N12', 'CF-06', 'negative', 'f5a/control_bytes', 'presented Control is the birth-time empty Control')
def cf06_n12(work):
    r = Run(work)
    empty = copy.deepcopy(r.stored('control'))
    r.until('arm')
    return neg(r, lambda: r.w.coordinator.append_held(r.ctx, r.stored('intent'), empty), post=only_nonstorage_changes)


_cf06_neg('CF06-N13', 'f5d/barrier_durability', 'append issued with ordinary durability: no barrier receipt',
          hooks={'durability': lambda w, ctx: 'ordinary'})
_cf06_neg('CF06-N14', 'f5d/member_set', 'partial member group: AppendEvidence omits the unrelated member',
          hooks={'evidence': lambda w, ctx, ev: ev['members'].pop()})
_cf06_neg('CF06-N15', 'f5d/group', 'filtered group: active_durable_group lists only the target member',
          hooks={'evidence': lambda w, ctx, ev: ev['active_durable_group']['members'].pop()})
_cf06_neg('CF06-N16', 'f5d/member_custody', 'manufactured append receipt in the target member custody',
          hooks={'evidence': lambda w, ctx, ev: ev['members'][0]['custody']['first_append_receipt'].__setitem__(
              'byte_offset', ev['members'][0]['custody']['first_append_receipt']['byte_offset'] + 1)})
_cf06_neg('CF06-N17', 'f5d/member_full_value', 'substituted full_value_result for the target member',
          hooks={'evidence': lambda w, ctx, ev: ev['members'][0]['full_value_result'].__setitem__(
              'original_segment_ref', 'TEST_ONLY:segment-ref:substituted')})
_cf06_neg('CF06-N18', 'f5d/member_event', 'substituted Event persisted_at_utc in the evidence member',
          hooks={'evidence': lambda w, ctx, ev: ev['members'][0]['event'].__setitem__(
              'persisted_at_utc', '2026-01-01T00:00:00.000Z')})
_cf06_neg('CF06-N19', 'f5c/all_members', 'custody readback presents only the target member receipt',
          hooks={'receipts': lambda w, ctx, rec: rec[:1]})


@case('CF06-N20', 'CF-06', 'negative', 'retry/producer25_conflict', 'same-operation retry with altered producer25')
def cf06_n20(work):
    r = Run(work).until('append')
    r.ctx['producer25'] = dict(r.ctx['producer25'], actor_ref='TEST_ONLY:actor:other')
    return neg(r, lambda: r.w.coordinator.append_held(r.ctx, r.stored('intent'), r.stored('control')))


@case('CF06-N21', 'CF-06', 'negative', 'append/conflict/producer25', 'Storage retry with the same identity and altered producer25')
def cf06_n21(work):
    r = Run(work).until('append')
    altered = dict(r.ctx['producer25'], actor_ref='TEST_ONLY:actor:other')

    def call():
        h = r.w.storage.reserve('TEST_ONLY:operation:altered-retry', dict(kind='altered'))
        return r.w.storage.append(h, [altered], durability_class='barrier')
    return neg(r, call)


def _crash_then_reenter(work, cut):
    r = Run(work).until('arm')
    r.w.storage.faults = S.FaultPlan(cut=cut, mode='raise')
    try:
        r.step('append')
    except S.Crash:
        pass
    r.w.storage.faults = S.FaultPlan()
    return neg(r, lambda: r.w.coordinator.append_held(r.ctx, r.stored('intent'), r.stored('control')))


@case('CF06-N27', 'CF-06', 'negative', 'f5a/future_receipt', 'in-process re-entry after a crash at after_append: the Event exists, never appended again')
def cf06_n27(work):
    return _crash_then_reenter(work, 'after_append')


@case('CF06-N22', 'CF-06', 'negative', 'f5a/append_attempted', 'in-process re-entry after a crash at after_reservation: an append attempt is never repeated')
def cf06_n22(work):
    r = Run(work).until('arm')
    r.w.storage.faults = S.FaultPlan(cut='after_reservation', mode='raise')
    try:
        r.step('append')
    except S.Crash:
        pass
    r.w.storage.faults = S.FaultPlan()
    return neg(r, lambda: r.w.coordinator.append_held(r.ctx, r.stored('intent'), r.stored('control')))


@case('CF06-N23', 'CF-06', 'negative', 'f5a/request_scope', 'append request scope differs from the armed operation')
def cf06_n23(work):
    r = Run(work).until('arm')
    r.ctx['request'] = copy.deepcopy(r.ctx['request'])
    r.ctx['request']['scope']['goal_id'] = 'TEST_ONLY:goal:other'
    return neg(r, 'append', post=only_nonstorage_changes)


@case('CF06-N24', 'CF-06', 'negative', 'f5a/expected_control_epoch', 'append request carries a stale control epoch')
def cf06_n24(work):
    r = Run(work).until('arm')
    r.ctx['request'] = dict(r.ctx['request'], expected_control_epoch=1)
    return neg(r, 'append', post=only_nonstorage_changes)


@case('CF06-N25', 'CF-06', 'negative', 'f5a/source_commitments', 'identity result substituted after arm')
def cf06_n25(work):
    r = Run(work).until('arm')
    r.ctx['identity'] = dict(r.ctx['identity'], recipe_sha256='0' * 64)
    return neg(r, 'append', post=only_nonstorage_changes)


@case('CF06-N26', 'CF-06', 'negative', 'f5d_final/effective_stop', 'Stop after the custody readback, before EventPhase')
def cf06_n26(work):
    r = Run(work, hooks={'after_helper:f5d': lambda w, ctx: w.goal.stop(ctx['values']['goal']['goal_id'])}).until('arm')

    def post(run, before, after):
        require('post/event_preserved', after['storage']['events'] == before['storage']['events'] + 2)
        require('post/no_event_phase', run.stored('eventphase') is None)
        return dict(event_and_custody_preserved=True)
    return neg(r, 'append', post=post)


def _tamper_cause_frame(w, ctx):
    """Corrupt the earlier (off-run cause) frame at rest: the global prefix is no longer valid."""
    eid = next(e for e in w.storage.events if e.startswith('TEST_ONLY:goal_test.cause'))
    info = w.storage.events[eid]
    path = w.storage._segment_path(info['segment_generation'])
    raw = bytearray(path.read_bytes())
    raw[info['offset'] + info['length'] - 5] ^= 0x01
    path.write_bytes(bytes(raw))


@case('CF06-N28', 'CF-06', 'negative', 'f5a/generic_prefix', 'malformed earlier off-run frame in the global prefix before append')
def cf06_n28(work):
    r = Run(work).until('arm')
    _tamper_cause_frame(r.w, r.ctx)
    return neg(r, 'append', post=only_nonstorage_changes)
_cf06_neg('CF06-N29', 'f5c/generic_prefix', 'global prefix invalid at custody readback (earlier frame substituted at rest)',
          hooks={'before_custody': _tamper_cause_frame})


# ------------------------------------------------------------------ CF-07

@case('CF07-P01', 'CF-07', 'positive', desc='joint native/D01/compact commit, readback and release; current only after Release')
def cf07_p01(work):
    r = Run(work).until('append')
    w, ctx = r.w, r.ctx
    nk = W.native_key(ctx['scope'])
    before_body = w.native.body(ctx['scope'])
    before_goal = w.goal_store.observe()
    try:
        w.coordinator.read_current(ctx)
        raise AssertionError('pending visible')
    except A.AdapterRefusal as error:
        require('positive/pending_fenced', error.code == 'current/guard_outcome')
    r.step('commit')
    committed = r.obs['committed']
    tx = committed['published_native_held']['transaction_id']
    keys = committed['published_native_held']['keys']
    require('positive/one_transaction', all(w.storage.cell(*keys[n])['tx'] == tx for n in keys) and
            all(w.coordinator.compact(f, ctx['scope'], ctx['op'])[1]['tx'] == tx for f in ('commit', 'origin', 'control')))
    for name, root in (('native_result', N.V4 + 'StorageWorkflowResult'), ('native_origin', N.V4 + 'StorageWorkflowOrigin'),
                       ('d01_update', N.S6 + 'StorageWorkflowUpdate'), ('d01_head', N.S6 + 'StorageWorkflowHead'),
                       ('d01_origin', N.S6 + 'StorageWorkflowMutationOrigin'), ('d01_pointer', N.S6 + 'StorageCurrentPointer')):
        W.realm_bank().validate('native', root, w.storage.cell(*keys[name])['value'], 'positive/whole/' + name)
    after_body = w.native.body(ctx['scope'])['value']
    b = before_body['value']
    require('positive/native_once', after_body['body_revision'] == b['body_revision'] + 1 and after_body['status'] == 'certified')
    require('positive/protected_fields', all(A.same(after_body[k], b[k]) for k in b
                                              if k not in ('body_revision', 'status', 'certification_receipt')))
    require('positive/goal_unchanged', A.same(before_goal, w.goal_store.observe()))
    try:
        w.coordinator.read_current(ctx)
        raise AssertionError('committed-unreleased visible')
    except A.AdapterRefusal as error:
        require('positive/committed_fenced', error.code == 'current/guard_outcome')
    r.step('readback')
    r.step('release')
    r.step('current')
    rel = r.obs['released']
    require('positive/release_after_commit', rel['retained']['release']['issued_at_utc'] >=
            rel['retained']['commit']['issued_at_utc'] and rel['control']['record']['phase'] == 'released')
    require('positive/current_complete', r.obs['current']['outcome'] == 'current_complete')
    top = [c['method'] for c in w.recorder.calls if c['parent'] is None and c['method'].startswith('owner.')]
    return dict(commit_tx=tx, method_order=top, native_revision=[b['body_revision'], after_body['body_revision']])


@case('CF07-P02', 'CF-07', 'positive', desc='passive recovery classifies committed-unreleased and released without effects')
def cf07_p02(work):
    r = Run(work).until('commit')
    before = r.w.storage.observe()
    mid = r.classification()
    require('positive/committed_unknown', mid == dict(outcome='pending_unknown', reason='release_unknown',
                                                      known_phase='native_committed'))
    require('positive/no_repair', A.same(before, r.w.storage.observe()))
    r.step('readback')
    r.step('release')
    done = r.classification()
    require('positive/original_complete', done['outcome'] == 'original_complete')
    return dict(committed=mid, released=done)


def _cf07_neg(cid, guard, desc, *, until, phase, hooks=None, separate_d01=False, before_call=None, post=None):
    @case(cid, 'CF-07', 'negative', guard, desc)
    def fn(work):
        r = Run(work, hooks=hooks, separate_d01=separate_d01).until(until)
        if before_call:
            before_call(r)
        return neg(r, phase if not callable(phase) else (lambda: phase(r)), post=post)
    return fn


_cf07_neg('CF07-N01', 'current/guard_outcome', 'visible certified pending: read_current after commit, before Release',
          until='commit', phase='current')
_cf07_neg('CF07-N02', 'current/guard_outcome', 'read_current after arm only', until='arm', phase='current')
_cf07_neg('CF07-N03', 'release/guard_phase', 'release before native commit', until='append',
          phase=lambda r: r.w.coordinator.release(r.ctx, None, None))
_cf07_neg('CF07-N04', 'commit/write_set', 'partial native/D01 commit: the D01 head write is missing', until='append',
          phase='commit', hooks={'drop_write': lambda w, ctx: N.T_HEAD}, post=native_unchanged)
_cf07_neg('CF07-N05', 'commit/write_value', 'native afterimage altered in the write set', until='append', phase='commit',
          hooks={'commit_writes': lambda w, ctx, u: dict(u, native_after_body=dict(u['native_after_body'], activation_revision=9))},
          post=native_unchanged)
_cf07_neg('CF07-N06', 'commit/missing_participant', 'D01 writer in a distinct store: no single transaction',
          until='append', phase='commit', separate_d01=True, post=native_unchanged)
_cf07_neg('CF07-N07', 'commit/native_changed', 'another native writer after the last helper (stale CAS)', until='append',
          phase='commit', hooks={'after_helper:commit': lambda w, ctx: w.native.advance(w, ctx['scope'], 'provisional_success', kind='progress')})
_cf07_neg('CF07-N08', 'commit_final/effective_stop', 'Stop between the last helper and the joint commit', until='append',
          phase='commit', hooks={'after_helper:commit': lambda w, ctx: w.goal.stop(ctx['values']['goal']['goal_id'])},
          post=native_unchanged)


@case('CF07-N09', 'CF-07', 'negative', 'commit/guard_phase', 'commit before EventPhase: control still armed')
def cf07_n09(work):
    r = Run(work).until('arm')
    fake = dict(event_phase={}, evidence={})
    return neg(r, lambda: r.w.coordinator.commit_native(r.ctx, fake), post=native_unchanged)


@case('CF07-N10', 'CF-07', 'negative', 'commit/event_phase_bytes', 'presented EventPhase differs from the stored original')
def cf07_n10(work):
    r = Run(work).until('append')
    r.obs['appended'] = copy.deepcopy(r.obs['appended'])
    r.obs['appended']['event_phase']['issued_at_utc'] = '2026-01-01T00:00:00.000Z'
    return neg(r, 'commit', post=native_unchanged)


@case('CF07-N11', 'CF-07', 'negative', 'commit/guard_phase', 'duplicate commit: second native CAS refused')
def cf07_n11(work):
    r = Run(work).until('commit')
    return neg(r, lambda: r.w.coordinator.commit_native(r.ctx, r.obs['appended']))


@case('CF07-N12', 'CF-07', 'negative', 'readback/member/native_after_body', 'readback against a substituted expected union')
def cf07_n12(work):
    r = Run(work).until('commit')
    r.obs['committed'] = copy.deepcopy(r.obs['committed'])
    r.obs['committed']['published_native_held']['union']['native_after_body']['activation_revision'] = 9
    return neg(r, 'readback')


@case('CF07-N13', 'CF-07', 'negative', 'readback/transaction/native_after_body', 'readback with a substituted transaction id')
def cf07_n13(work):
    r = Run(work).until('commit')
    r.obs['committed'] = copy.deepcopy(r.obs['committed'])
    r.obs['committed']['published_native_held']['transaction_id'] = 'TEST_ONLY:tx:substituted'
    return neg(r, 'readback')


_cf07_neg('CF07-N14', 'readback/goal_unchanged', 'Goal argument changed before readback', until='commit',
          phase='readback', before_call=lambda r: r.w.goal.edit(r.ctx['values']['goal']['goal_id'], goal_revision=4))
_cf07_neg('CF07-N15', 'release/readback', 'release without a readback', until='commit',
          phase=lambda r: r.w.coordinator.release(r.ctx, r.obs['committed'], None))
_cf07_neg('CF07-N16', 'release_final/effective_stop', 'Stop after the readback helper, before Release', until='readback',
          phase='release', hooks={'after_helper:release': lambda w, ctx: w.goal.stop(ctx['values']['goal']['goal_id'])})
_cf07_neg('CF07-N17', 'reenter/live_invocation_lost', 'recover-and-complete refused after commit', until='commit',
          phase=lambda r: r.w.coordinator.reenter(W.recovery_request(r.w, r.ctx, r.stored('intent')['record'])))


# ------------------------------------------------------------------ CF-08

def _guard_at(run):
    return run.w.guard.read_guard(W.guard_request(run.w, run.ctx['scope'], run.ctx['op'], 'original_certification',
                                                  'TEST_ONLY:guard-request:probe'))


@case('CF08-P01', 'CF-08', 'positive', desc='guard outcome at every phase; each participant acquires its own guard')
def cf08_p01(work):
    r = Run(work)
    w, ctx = r.w, r.ctx
    other = dict(ctx['scope'], goal_run_id='TEST_ONLY:goal_run:never-born')
    unborn = w.guard.read_guard(W.guard_request(w, other, None, 'fresh_birth_absence', 'TEST_ONLY:guard-request:unborn'))
    seen = dict(unborn=unborn['outcome'], empty=_guard_at(r)['outcome'])
    for step, label in (('prepare', None), ('arm', 'armed'), ('append', 'event_durable'), ('commit', 'native_committed'),
                        ('readback', None), ('release', 'released'), ('current', None)):
        r.step(step)
        if label:
            g = _guard_at(r)
            seen[label] = g['outcome'] + ':' + g['control']['record']['phase']
    require('positive/outcomes', seen == dict(unborn='authentic_unborn_absence', empty='authentic_no_coordinator_operation',
                                              armed='authentic_pending:armed', event_durable='authentic_pending:event_durable',
                                              native_committed='authentic_pending:native_committed',
                                              released='authentic_released:released'))
    participants = ('owner.workflow.certified_event.prepare.v1', 'owner.storage.certified_event.arm.v1',
                    'owner.storage.certified_event.append_held.v1', 'owner.workflow.certified_event.commit_native.v1',
                    'owner.workflow.certified_event.release.v1', 'owner.workflow.certified_event.read_current.v1')
    own = {}
    for p in participants:
        call = next(c for c in w.recorder.calls if c['method'] == p)
        own[p] = len([c for c in w.recorder.calls if c['method'] == 'read_guard' and c['parent'] == call['index']])
        require('positive/own_guard/' + p, own[p] >= 1)
    return dict(outcomes=seen, guard_reads_per_participant=own)


def occurrence_class(method):
    if 'enroll' in method and 'birth' in method:
        return 'birth'
    if 'read_current' in method or method.endswith('.current.v1'):
        return 'current'
    if 'retained' in method or 'recover' in method:
        return 'retained'
    return 'writer'


DECISIONS = {
    'birth': dict(authentic_unborn_absence='admit_prebirth', authentic_no_coordinator_operation='refuse_born',
                  authentic_pending='refuse_born', authentic_released='refuse_born', unavailable='refuse'),
    'current': dict(authentic_unborn_absence='refuse_unborn', authentic_no_coordinator_operation='original_behavior',
                    authentic_pending='pending_physical_facts_only', authentic_released='current_certified_allowed',
                    unavailable='refuse'),
    'retained': dict(authentic_unborn_absence='refuse_unborn', authentic_no_coordinator_operation='no_operation',
                     authentic_pending='pending_unknown', authentic_released='original_complete', unavailable='refuse'),
    'writer': dict(authentic_unborn_absence='refuse_unborn', authentic_no_coordinator_operation='original_behavior',
                   authentic_pending='original_behavior_no_certification_action',
                   authentic_released='original_behavior_released_metadata', unavailable='refuse'),
}
PURPOSE = dict(birth='fresh_birth_absence', current='current_source', retained='retained_disclosure',
               writer='original_certification')


def load_declarations():
    data = json.loads((ROOT / 'Plans/goal_certified_event_coordinator_contracts/participant-method-tuples.json').read_bytes())
    return data['declarations']


def occurrence_guard(w, decl, scope, op, *, presented_guard=None, helper=None):
    """Q3/Q4 guard supplement at one declared participant occurrence."""
    require('occurrence/unknown_method', type(decl.get('method')) is str and decl['method'] != '')
    src = json.loads((ROOT / decl['complete_declaration_file']).read_bytes())
    node = src
    for part in decl['complete_declaration_pointer'].split('/')[1:]:
        node = node[int(part)] if isinstance(node, list) else node[part]
    raw = json.dumps(node, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    require('occurrence/declaration_sha256', W.sha(raw) == decl['declaration_sha256'])
    require('occurrence/declared_method', decl['method'] in json.dumps(node))
    require('occurrence/caller_guard', presented_guard is None)
    klass = occurrence_class(decl['method'])
    guard = w.guard.read_guard(W.guard_request(w, scope, op, PURPOSE[klass], 'TEST_ONLY:occurrence:' + decl['declaration_sha256'][:16]))
    if helper:
        helper(w)
    final = w.guard.read_guard(W.guard_request(w, scope, op, PURPOSE[klass], 'TEST_ONLY:occurrence-final'))
    require('occurrence/final_changed', guard['outcome'] == final['outcome'] and
            (guard['outcome'] == 'unavailable' or A.same(guard['source']['rows'], final['source']['rows'])))
    decision = DECISIONS[klass][guard['outcome']]
    return dict(klass=klass, outcome=guard['outcome'], decision=decision)


@case('CF08-P02', 'CF-08', 'positive', desc='guard supplement at all 161 declared participant occurrences in every phase state')
def cf08_p02(work):
    decls = load_declarations()
    require('positive/declaration_count', len(decls) == 161)
    r = Run(work)
    w, ctx = r.w, r.ctx
    unborn_scope = dict(ctx['scope'], goal_run_id='TEST_ONLY:goal_run:never-born')
    table = {}
    states = [('unborn', unborn_scope, None)]
    states.append(('empty', ctx['scope'], ctx['op']))
    results = {}
    for label, scope, op in states:
        results[label] = [occurrence_guard(w, d, scope, op) for d in decls]
    for step, label in (('prepare', None), ('arm', 'armed'), ('append', 'event_durable'), ('commit', 'native_committed'),
                        ('readback', None), ('release', 'released')):
        r.step(step)
        if label:
            results[label] = [occurrence_guard(w, d, ctx['scope'], ctx['op']) for d in decls]
    for label, rows in results.items():
        table[label] = {}
        for d, res in zip(decls, rows):
            expected = DECISIONS[res['klass']][res['outcome']]
            require('positive/decision', res['decision'] == expected)
            table[label][res['klass']] = table[label].get(res['klass'], 0) + 1
    # Unavailable in a tampered store refuses at every occurrence.
    w.storage.transact([dict(table=W.TX_ISSUANCE, key=w.coordinator.compact('birth', ctx['scope'])[1]['tx'],
                             expected=1, delete=True)])
    unavailable = [occurrence_guard(w, d, ctx['scope'], ctx['op']) for d in decls]
    require('positive/unavailable_refuses', all(u['outcome'] == 'unavailable' and u['decision'] == 'refuse'
                                                for u in unavailable))
    classes = {}
    for d in decls:
        k = occurrence_class(d['method'])
        classes[k] = classes.get(k, 0) + 1
    return dict(occurrences=len(decls), states=sorted(results) + ['unavailable'], classes=classes,
                evaluations=sum(len(v) for v in results.values()) + len(unavailable))


@case('CF08-N01', 'CF-08', 'negative', 'occurrence/declaration_sha256', 'declared occurrence with a substituted declaration hash')
def cf08_n01(work):
    r = Run(work)
    d = dict(load_declarations()[5], declaration_sha256='0' * 64)
    return neg(r, lambda: occurrence_guard(r.w, d, r.ctx['scope'], r.ctx['op']))


@case('CF08-N02', 'CF-08', 'negative', 'occurrence/caller_guard', 'caller-supplied guard object instead of acquisition')
def cf08_n02(work):
    r = Run(work)
    g = _guard_at(r)
    d = load_declarations()[7]
    return neg(r, lambda: occurrence_guard(r.w, d, r.ctx['scope'], r.ctx['op'], presented_guard=g))


@case('CF08-N03', 'CF-08', 'negative', 'occurrence/unknown_method', 'unknown participant method')
def cf08_n03(work):
    r = Run(work)
    return neg(r, lambda: occurrence_guard(r.w, dict(load_declarations()[0], method=''), r.ctx['scope'], r.ctx['op']))


@case('CF08-N04', 'CF-08', 'negative', 'occurrence/final_changed', 'source changed between occurrence entry and final guard')
def cf08_n04(work):
    r = Run(work).until('prepare')
    d = load_declarations()[9]

    def helper(w):
        r.step('arm')
    return neg(r, lambda: occurrence_guard(r.w, d, r.ctx['scope'], r.ctx['op'], helper=helper))


def _guard_override(stage, value_fn):
    return {'guard:' + stage: lambda w, ctx: value_fn(w, ctx)}


for _stage, _until, _phase in (('prepare', None, 'prepare'), ('arm', 'prepare', 'arm'), ('append', 'arm', 'append'),
                               ('commit', 'append', 'commit'), ('release', 'readback', 'release'),
                               ('current', 'release', 'current')):
    def _mk(stage=_stage, until=_until, phase=_phase):
        @case('CF08-N-omit-' + stage, 'CF-08', 'negative', stage + '/guard_type',
              'participant %s proceeds with its guard omitted by a helper' % stage)
        def fn(work):
            r = Run(work, hooks=_guard_override(stage, lambda w, ctx: 'omitted'))
            if until:
                r.until(until)
            return neg(r, phase)
        return fn
    _mk()


@case('CF08-N05', 'CF-08', 'negative', 'commit/guard_reader', 'borrowed reader authority: guard from another registered reader')
def cf08_n05(work):
    holder = {}

    def borrowed(w, ctx):
        rogue = holder.setdefault('rogue', W.GuardReader(w.registry, w))
        return rogue.read_guard(W.guard_request(w, ctx['scope'], ctx['op'], 'original_certification', 'TEST_ONLY:rogue'))
    r = Run(work, hooks=_guard_override('commit', borrowed)).until('append')
    return neg(r, 'commit', post=native_unchanged)


@case('CF08-N06', 'CF-08', 'negative', 'commit/guard_stale', 'stale guard epoch: the append-phase guard reused at commit')
def cf08_n06(work):
    r = Run(work).until('append')
    stale = r.ctx['guards']['append']
    r.w.hooks['guard:commit'] = lambda w, ctx: stale
    return neg(r, 'commit', post=native_unchanged)


@case('CF08-N07', 'CF-08', 'negative', 'append/guard_scope', 'cross-Goal guard: another run scope presented at append')
def cf08_n07(work):
    def other(w, ctx):
        scope = dict(ctx['scope'], goal_id='TEST_ONLY:goal:other', goal_run_id='TEST_ONLY:goal_run:other')
        return w.guard.read_guard(W.guard_request(w, scope, ctx['op'], 'original_certification', 'TEST_ONLY:other'))
    r = Run(work, hooks=_guard_override('append', other)).until('arm')
    return neg(r, 'append', post=only_nonstorage_changes)


@case('CF08-N08', 'CF-08', 'negative', 'prepare/guard_outcome', 'authentic_unborn_absence presented for a born run')
def cf08_n08(work):
    def unborn(w, ctx):
        scope = dict(ctx['scope'], goal_run_id='TEST_ONLY:goal_run:never-born')
        g = w.guard.read_guard(W.guard_request(w, scope, None, 'fresh_birth_absence', 'TEST_ONLY:unborn'))
        g['source']['scope'] = copy.deepcopy(ctx['scope'])
        return g
    r = Run(work, hooks=_guard_override('prepare', unborn))
    return neg(r, 'prepare')


@case('CF08-N09', 'CF-08', 'negative', 'append/guard_unavailable', 'guard unavailable: Intent row has no Storage issuance')
def cf08_n09(work):
    r = Run(work).until('arm')
    tx = r.w.coordinator.compact('intent', r.ctx['scope'], r.ctx['op'])[1]['tx']
    r.w.storage.transact([dict(table=W.TX_ISSUANCE, key=tx, expected=1, delete=True)])
    return neg(r, 'append', post=only_nonstorage_changes)


@case('CF08-N10', 'CF-08', 'negative', 'arm_final/permission', 'mutable source drift after the arm helper')
def cf08_n10(work):
    r = Run(work, hooks={'after_helper:arm': lambda w, ctx: w.permission.revoke(ctx['scope']['goal_run_id'])}).until('prepare')
    return neg(r, 'arm')


@case('CF08-N11', 'CF-08', 'negative', 'current_final/guard_stale', 'drift after the read_current helper (Release-time source)')
def cf08_n11(work):
    def drift(w, ctx):
        w.storage.transact([dict(table=W.TX_ISSUANCE, key='TEST_ONLY:drift', expected=None,
                                 value=dict(qualification=QUALIFICATION))])
        cell = w.coordinator.compact('birth', ctx['scope'])[1]
        w.storage.transact([dict(table=W.TX_ISSUANCE, key=cell['tx'], expected=1, delete=True)])
    r = Run(work, hooks={'after_helper:current': drift}).until('release')
    return neg(r, 'current')


def _guard_source_neg(cid, reason, desc, edit):
    @case(cid, 'CF-08', 'negative', 'guard_result/unavailable/' + reason, desc)
    def fn(work):
        r = Run(work).until('arm')

        def call():
            g = r.w.guard.read_guard(W.guard_request(r.w, r.ctx['scope'], r.ctx['op'], 'original_certification',
                                                     'TEST_ONLY:guard-neg'), source_edit=edit(r))
            require('guard_result/unavailable/' + g.get('reason', 'none'), g['outcome'] != 'unavailable')
            return g
        return neg(r, call)
    return fn


_guard_source_neg('CF08-N12', 'source_changed', 'serialized GuardStoreSource replaces the native acquisition (row dropped)',
                  lambda r: (lambda s: dict(s, rows=s['rows'][:-1])))
_guard_source_neg('CF08-N13', 'source_changed', 'inventory omission in the presented source',
                  lambda r: (lambda s: dict(s, complete_key_inventory=s['complete_key_inventory'][:-1])))


@case('CF08-N14', 'CF-08', 'negative', 'guard_result/unavailable/partial_authority', 'armed Control with its Intent row deleted')
def cf08_n14(work):
    r = Run(work).until('arm')
    key, cell = r.w.coordinator.compact('intent', r.ctx['scope'], r.ctx['op'])
    r.w.storage.transact([dict(table=W.family_table('intent'), key=key, expected=cell['version'], delete=True)])

    def call():
        g = _guard_at(r)
        require('guard_result/unavailable/' + g.get('reason', 'none'), g['outcome'] != 'unavailable')
    return neg(r, call)


@case('CF08-N15', 'CF-08', 'negative', 'guard_result/unavailable/schema_unavailable', 'compact row fails its whole root')
def cf08_n15(work):
    r = Run(work).until('arm')
    key, cell = r.w.coordinator.compact('intent', r.ctx['scope'], r.ctx['op'])
    bad = copy.deepcopy(cell['value'])
    bad['record']['extension'] = 'x'
    r.w.storage.transact([dict(table=W.family_table('intent'), key=key, expected=cell['version'], value=bad)])

    def call():
        g = _guard_at(r)
        require('guard_result/unavailable/' + g.get('reason', 'none'), g['outcome'] != 'unavailable')
    return neg(r, call)


# ------------------------------------------------------------------ CF-09 and P7

def released_run(work, **kw):
    r = Run(work, **kw).until('release')
    return r


@case('CF09-P01', 'CF-09', 'positive', desc='separate retained, inspect, historical and current reads; all passive')
def cf09_p01(work):
    r = released_run(work)
    c = r.consumer()
    pub = c.publish_projection(r.ctx['scope'], r.ctx['op'])
    before = observe(r.w)
    ret = c.read_retained_native(r.ctx['scope'], r.ctx['op'])
    ins = c.inspect_original(r.ctx['scope'], r.ctx['op'])
    his = c.read_historical(r.ctx['scope'], r.ctx['op'])
    cur = c.read_current(r.ctx)
    after = observe(r.w)
    require('positive/passive', A.same(before, after))
    require('positive/separate_results', ret['complete_event_availability_asserted'] is False and
            ins['current_state_asserted'] is False and his['current_state_asserted'] is False and
            cur['interpretation'] == 'native_verified_certified_as_of_same_snapshot')
    require('positive/inspect_frame', ins['original_event']['event']['event_id'] == r.ctx['identity']['event_id'])
    return dict(row_kind=pub['row']['content']['kind'], row_key=pub['row']['physical_key'],
                generation=pub['logical']['current_generation_id'])


@case('CF09-P02', 'CF-09', 'positive', desc='lawful history after live change: Goal edited, Stopped, body removed; new unrelated Event')
def cf09_p02(work):
    r = released_run(work)
    c = r.consumer()
    c.publish_projection(r.ctx['scope'], r.ctx['op'])
    w, ctx = r.w, r.ctx
    gid = ctx['values']['goal']['goal_id']
    w.goal.edit(gid, goal_revision=9)
    w.goal.stop(gid)
    w.appender.append_original('TEST_ONLY:operation:later', dict(k='later'), [w.unrelated.resolve(w.unrelated.queue('later'))[1]])
    cell = w.goal_store.cell(W.GOAL_BODY, w.goal.key(gid))
    w.goal_store.transact([dict(table=W.GOAL_BODY, key=w.goal.key(gid), expected=cell['version'], delete=True)])
    c.read_retained_native(ctx['scope'], ctx['op'])
    c.inspect_original(ctx['scope'], ctx['op'])
    c.read_historical(ctx['scope'], ctx['op'])
    try:
        c.read_current(ctx)
        raise AssertionError('current passed after live change')
    except C.Unavailable as error:
        current = (error.code, error.reason)
    return dict(historical='pass', current_refused=current)


def _cf09_neg(cid, guard, desc, *, group='CF-09', until='release', publish=False, prepare=None, call):
    @case(cid, group, 'negative', guard, desc)
    def fn(work):
        r = Run(work).until(until)
        c = r.consumer()
        if publish:
            c.publish_projection(r.ctx['scope'], r.ctx['op'])
        if prepare:
            prepare(r)
        return neg(r, lambda: call(r, c))
    return fn


def _delete(r, table, key):
    cell = r.w.storage.cell(table, key)
    r.w.storage.transact([dict(table=table, key=key, expected=cell['version'], delete=True)])


_cf09_neg('CF09-N01', 'retained/missing/eventphase', 'retained read of an armed-only operation', until='arm',
          call=lambda r, c: c.read_retained_native(r.ctx['scope'], r.ctx['op']))
_cf09_neg('CF09-N02', 'retained/missing/commit', 'retained read of an Event-only operation', until='append',
          call=lambda r, c: c.read_retained_native(r.ctx['scope'], r.ctx['op']))
_cf09_neg('CF09-N03', 'retained/missing/release', 'retained read of a committed-unreleased operation', until='commit',
          call=lambda r, c: c.read_retained_native(r.ctx['scope'], r.ctx['op']))
_cf09_neg('CF09-N04', 'retained/unissued/control', 'phantom Release: its transaction (Release + released Control) has no Storage issuance',
          prepare=lambda r: _delete(r, W.TX_ISSUANCE, r.w.coordinator.compact('release', r.ctx['scope'], r.ctx['op'])[1]['tx']),
          call=lambda r, c: c.read_retained_native(r.ctx['scope'], r.ctx['op']))
_cf09_neg('CF09-N05', 'retained/standard_expired', 'expired original Standard receipt',
          prepare=lambda r: _delete(r, N.T_RECEIPT, N.receipt_key(r.ctx['scope'])),
          call=lambda r, c: c.read_retained_native(r.ctx['scope'], r.ctx['op']))


def _substitute(r, table, key, field, value):
    cell = r.w.storage.cell(table, key)
    r.w.storage.transact([dict(table=table, key=key, expected=cell['version'], value=dict(cell['value'], **{field: value}))])


def _substitute_record(r, table, name, field, value):
    key = r.w.coordinator.compact('commit', r.ctx['scope'], r.ctx['op'])[1]['value']['record'][name]['key']
    cell = r.w.storage.cell(table, key)
    new = copy.deepcopy(cell['value'])
    new['record'][field] = value
    r.w.storage.transact([dict(table=table, key=key, expected=cell['version'], value=new)])


_cf09_neg('CF09-N06', 'retained/commit_selects/native_result', 'substituted native Standard result (issued_at)',
          prepare=lambda r: _substitute_record(r, N.T_RESULT, 'native_result', 'issued_at_utc', '2026-01-01T00:00:00.000Z'),
          call=lambda r, c: c.read_retained_native(r.ctx['scope'], r.ctx['op']))
_cf09_neg('CF09-N07', 'retained/commit_selects/d01_update', 'substituted original D01 update (operation id)',
          prepare=lambda r: _substitute_record(r, N.T_UPDATE, 'd01_update', 'operation_id', 'TEST_ONLY:operation:other'),
          call=lambda r, c: c.read_retained_native(r.ctx['scope'], r.ctx['op']))
_cf09_neg('CF09-N14', 'retained/commit_selects/d01_head', 'substituted original D01 head (pending operation)',
          prepare=lambda r: _substitute_record(r, N.T_HEAD, 'd01_head', 'pending_operation_id', 'TEST_ONLY:operation:x'),
          call=lambda r, c: c.read_retained_native(r.ctx['scope'], r.ctx['op']))
_cf09_neg('CF09-N08', 'inspect/presented_not_original', 'payload-only inspection: a presented payload, not the frame',
          call=lambda r, c: c.inspect_original(r.ctx['scope'], r.ctx['op'], presented=r.ctx['producer25']['payload']))


def _tamper_frame(r):
    eid = r.ctx['identity']['event_id']
    info = r.w.storage.events[eid]
    path = r.w.storage._segment_path(info['segment_generation'])
    raw = bytearray(path.read_bytes())
    raw[info['offset'] + info['length'] - 3] ^= 0x01
    path.write_bytes(bytes(raw))


_cf09_neg('CF09-N09', 'inspect/frame/read/frame_hash', 'original frame bytes substituted at rest', prepare=_tamper_frame,
          call=lambda r, c: c.inspect_original(r.ctx['scope'], r.ctx['op']))
_cf09_neg('CF09-N10', 'historical/row_binding', 'historical row substituted after publication', publish=True,
          prepare=lambda r: _substitute(r, r.consumer().published['dataset'], r.consumer().published['row']['physical_key'],
                                        'dataset_name', 'TEST_ONLY:substituted-dataset'),
          call=lambda r, c: c.read_historical(r.ctx['scope'], r.ctx['op']))
_cf09_neg('CF09-N11', 'historical/checkpoint_missing', 'historical read with no published checkpoint',
          call=lambda r, c: c.read_historical(r.ctx['scope'], r.ctx['op']))


def _rewrite_row_separately(r):
    pub = r.consumer().published
    cell = r.w.storage.cell(pub['dataset'], pub['row']['physical_key'])
    r.w.storage.transact([dict(table=pub['dataset'], key=pub['row']['physical_key'], expected=cell['version'],
                               value=cell['value'])])


_cf09_neg('CF09-N12', 'historical/atomic_publication', 'row rewritten outside its checkpoint transaction', publish=True,
          prepare=_rewrite_row_separately, call=lambda r, c: c.read_historical(r.ctx['scope'], r.ctx['op']))
_cf09_neg('CF09-N13', 'retained/disclosure_denied', 'current disclosure permission revoked for a retained read',
          prepare=lambda r: r.w.permission.revoke(r.ctx['scope']['goal_run_id']),
          call=lambda r, c: c.read_retained_native(r.ctx['scope'], r.ctx['op']))


@case('P7-P01', 'P7', 'positive', desc='current disclosure: fresh coordinator tuple, released guard, exhaustive prefix, final fence')
def p7_p01(work):
    r = released_run(work)
    c = r.consumer()
    c.publish_projection(r.ctx['scope'], r.ctx['op'])
    cur = c.read_current(r.ctx)
    calls = [x for x in r.w.recorder.calls if x['method'] == 'owner.goal_run.certified.read_current.reference.v1']
    child = [x['method'] for x in r.w.recorder.calls if x['parent'] == calls[-1]['index']]
    require('positive/fresh_coordinator_tuple', 'owner.workflow.certified_event.read_current.v1' in child)
    require('positive/guard_released', cur['original']['native']['coordinator']['control']['record']['phase'] == 'released')
    source = GS.GenericSource(r.w.storage).acquire()
    return dict(children=child, prefix_rows=len(source.rows))


def _p7(cid, guard, desc, *, prepare=None, hooks=None):
    @case(cid, 'P7', 'negative', guard, desc)
    def fn(work):
        r = released_run(work, hooks=hooks)
        c = r.consumer()
        c.publish_projection(r.ctx['scope'], r.ctx['op'])
        if prepare:
            prepare(r)
        return neg(r, lambda: c.read_current(r.ctx))
    return fn


_p7('P7-N01', 'current/guard_outcome', 'a prior returned pending guard presented as current acquisition',
    prepare=lambda r: r.w.hooks.__setitem__('guard:current', lambda w, ctx: ctx['guards']['commit']))
_p7('P7-N02', 'current/effective_stop', 'Goal Stop effective after Release',
    prepare=lambda r: r.w.goal.stop(r.ctx['values']['goal']['goal_id']))
_p7('P7-N03', 'consumer_current/disclosure_denied', 'disclosure permission revoked',
    prepare=lambda r: r.w.permission.revoke(r.ctx['scope']['goal_run_id']))
_p7('P7-N04', 'consumer_current/stale_generic_token', 'uncovered suffix: a later unrelated Event after the checkpoint',
    prepare=lambda r: r.w.appender.append_original('TEST_ONLY:operation:later', dict(k='l'),
                                                   [r.w.unrelated.resolve(r.w.unrelated.queue('later'))[1]]))
_p7('P7-N05', 'current/goal_current', 'Goal context changed after Release',
    prepare=lambda r: r.w.goal.edit(r.ctx['values']['goal']['goal_id'], goal_revision=4))
_p7('P7-N06', 'historical/standard_expired', 'withdrawn original Standard receipt',
    prepare=lambda r: _delete(r, N.T_RECEIPT, N.receipt_key(r.ctx['scope'])))


def _later_native_update(r):
    """Another native writer publishes a later D01 update after Release (body revision advances)."""
    w, scope = r.w, r.ctx['scope']
    lin = N.current_lineage(w.storage, scope)
    after_body = dict(lin['body']['value'], body_revision=lin['body']['value']['body_revision'] + 1)
    after_control = dict(lin['control']['value'], control_revision=lin['control']['value']['control_revision'] + 1)
    issued_at = w.storage.now()

    def build(tx):
        return N.publication(w, scope, kind='progress', op='TEST_ONLY:operation:later-native', tx=tx, issued_at=issued_at,
                             lineage=lin, after_body=after_body, after_control=after_control,
                             source_sha='0' * 64, goal_sha='0' * 64)['writes']
    w.storage.transact_stamped(build, writer=dict(owner_id='TEST_ONLY:other-native-writer', owner_epoch=1,
                                                  operation_id='TEST_ONLY:operation:later-native'))


_p7('P7-N07', 'current/native_current', 'later native D01 update after Release', prepare=_later_native_update)


@case('CF09-P03', 'CF-09', 'positive', desc='retained, inspect and historical stay lawful after a later native D01 update')
def cf09_p03(work):
    r = released_run(work)
    c = r.consumer()
    c.publish_projection(r.ctx['scope'], r.ctx['op'])
    _later_native_update(r)
    ret = c.read_retained_native(r.ctx['scope'], r.ctx['op'])
    c.inspect_original(r.ctx['scope'], r.ctx['op'])
    c.read_historical(r.ctx['scope'], r.ctx['op'])
    head_now = N.current_lineage(r.w.storage, r.ctx['scope'])['head']['value']['record']['revision']
    require('positive/original_head_retained', ret['d01']['original_head']['record']['revision'] == head_now - 1)
    try:
        c.read_current(r.ctx)
        raise AssertionError('current passed after a later native update')
    except C.Unavailable as error:
        current = (error.code, error.reason)
    return dict(original_head_revision=ret['d01']['original_head']['record']['revision'], current_head_revision=head_now,
                current_refused=current)


@case('P7-N08', 'P7', 'negative', 'consumer_current_final/permission', 'permission revoked after the last helper')
def p7_n08(work):
    r = released_run(work)
    c = r.consumer()
    c.publish_projection(r.ctx['scope'], r.ctx['op'])
    r.w.hooks['after_helper:consumer_current'] = lambda w, ctx: w.permission.revoke(ctx['scope']['goal_run_id'])
    return neg(r, lambda: c.read_current(r.ctx))


@case('P7-N09', 'P7', 'negative', 'consumer_current/root_changed', 'root changed between acquisition and disclosure')
def p7_n09(work):
    r = released_run(work)
    c = r.consumer()
    c.publish_projection(r.ctx['scope'], r.ctx['op'])
    r.w.hooks['after_helper:consumer_current'] = lambda w, ctx: w.storage.transact(
        [dict(table='TEST_ONLY:unrelated_cell', key='x', expected=None, value=dict(q=1))])
    return neg(r, lambda: c.read_current(r.ctx))


# ------------------------------------------------------------------ fault matrix (real processes)

EXPECTED = {
    None: dict(outcome='original_complete'),
    'before_arm': dict(outcome='no_append', reason='current_source_unavailable'),
    'after_arm': dict(outcome='no_append', reason='current_source_unavailable'),
    'before_reservation': dict(outcome='no_append', reason='current_source_unavailable'),
    'after_reservation': dict(outcome='pending_unknown', reason='append_unknown', known_phase='append_attempted'),
    'before_append': dict(outcome='pending_unknown', reason='append_unknown', known_phase='append_attempted'),
    'torn_member_frame': dict(outcome='pending_unknown', reason='append_unknown', known_phase='append_attempted'),
    'torn_commit_frame': dict(outcome='pending_unknown', reason='append_unknown', known_phase='append_attempted'),
    'after_append_frames': dict(outcome='pending_unknown', reason='custody_unknown', known_phase='append_attempted'),
    'after_append': dict(outcome='pending_unknown', reason='custody_unknown', known_phase='append_attempted'),
    'before_first_receipt': dict(outcome='pending_unknown', reason='custody_unknown', known_phase='append_attempted'),
    'after_first_receipt': dict(outcome='pending_unknown', reason='barrier_unknown', known_phase='append_attempted'),
    'before_event_phase': dict(outcome='pending_unknown', reason='barrier_unknown', known_phase='append_attempted'),
    'after_event_phase': dict(outcome='pending_unknown', reason='native_unknown', known_phase='event_durable'),
    'before_native_commit': dict(outcome='pending_unknown', reason='native_unknown', known_phase='event_durable'),
    'after_native_commit': dict(outcome='pending_unknown', reason='release_unknown', known_phase='native_committed'),
    'before_release': dict(outcome='pending_unknown', reason='release_unknown', known_phase='native_committed'),
    'after_release': dict(outcome='original_complete'),
}
MATRIX_ORDER = [None, 'before_arm', 'after_arm'] + list(STORAGE_CUTS) + ['before_event_phase', 'after_event_phase',
                                                                       'before_native_commit', 'after_native_commit',
                                                                       'before_release', 'after_release']
GROUP_OF_CUT = {c: 'CF-06' for c in ('before_arm', 'after_arm') + STORAGE_CUTS + ('before_event_phase', 'after_event_phase')}
GROUP_OF_CUT.update({c: 'CF-07' for c in ('before_native_commit', 'after_native_commit', 'before_release', 'after_release')})
GROUP_OF_CUT[None] = 'CF-07'


def child_run(work, cut):
    work = Path(work)
    hooks = {}

    def write_request(w, ctx):
        record = ctx['stored_intent']['record']
        (work / 'request.json').write_text(json.dumps(W.recovery_request(w, ctx, record)))
    hooks['arm_built'] = write_request
    lane_cut = cut if cut in W.LANE_CUTS else None
    if cut in STORAGE_CUTS:
        hooks['preappend'] = lambda w, ctx: setattr(w.storage, 'faults', S.FaultPlan(cut=cut, mode='exit'))
    w = W.World(work, lane_cut=lane_cut, lane_mode='exit')
    w.hooks.update(hooks)
    ctx = W.build_context(w)
    prepared = w.coordinator.prepare(ctx)
    (work / 'request.json').write_text(json.dumps(W.recovery_request(w, ctx, prepared['intent'])))
    intent, control = w.coordinator.arm(ctx, prepared)
    appended = w.coordinator.append_held(ctx, intent, control)
    committed = w.coordinator.commit_native(ctx, appended)
    readback = w.coordinator.readback(ctx, committed)
    w.coordinator.release(ctx, committed, readback)
    print(json.dumps(dict(status='completed')))


def child_classify(work, mode):
    work = Path(work)
    w = W.World(work, reopen=True)
    req = json.loads((work / 'request.json').read_text())
    before = w.storage.observe()
    if mode == 'classify':
        res = w.coordinator.recover_original(req)
        out = dict(outcome=res['outcome'], reason=res.get('reason'), known_phase=res.get('known_phase'))
    else:
        try:
            res = w.coordinator.reenter(req)
            out = dict(outcome=res['outcome'], reenter='nothing_to_complete')
        except REFUSALS as error:
            out = dict(refusal=code_of(error))
    after = w.storage.observe()
    out.update(storage=after, storage_unchanged=A.same(before, after),
               events=after['events'], custody=after['custody'],
               reservation=w.storage.reservation_state(req['operation_id']))
    print(json.dumps(out, default=str))


def spawn(args):
    proc = subprocess.run([sys.executable, str(HERE / 'pm_goal_dg_cf2_oracles.py')] + args, capture_output=True,
                          text=True, cwd=str(HERE), timeout=600)
    return proc


def matrix_row(root, cut):
    work = Path(tempfile.mkdtemp(prefix='row-', dir=root))
    run = spawn(['--child', 'run', '--work', str(work)] + (['--cut', cut] if cut else []))
    expected_exit = 0 if cut is None else W.CRASH_EXIT
    row = dict(cut=cut, group=GROUP_OF_CUT[cut], exit=run.returncode)
    if run.returncode != expected_exit:
        row.update(status='fail', why='exit', stderr=run.stderr[-2000:])
        return row
    cls = spawn(['--child', 'classify', '--work', str(work)])
    if cls.returncode != 0:
        row.update(status='fail', why='classify', stderr=cls.stderr[-2000:])
        return row
    c = json.loads(cls.stdout.strip().splitlines()[-1])
    row['classification'] = {k: c[k] for k in ('outcome', 'reason', 'known_phase') if c.get(k) is not None}
    row['readback'] = dict(events=c['events'], custody=c['custody'],
                           reservation=None if c['reservation'] is None else c['reservation']['state'])
    reenter = [json.loads(spawn(['--child', 'reenter', '--work', str(work)]).stdout.strip().splitlines()[-1])
               for _ in range(2)]
    row['reentry'] = [dict(refusal=x.get('refusal'), outcome=x.get('outcome'), unchanged=x['storage_unchanged'])
                      for x in reenter]
    exp = EXPECTED[cut]
    ok = all(row['classification'].get(k) == v for k, v in exp.items())
    ok = ok and all(x['storage_unchanged'] for x in reenter) and c['storage_unchanged']
    if exp['outcome'] == 'original_complete':
        ok = ok and all(x.get('outcome') == 'original_complete' for x in reenter)
    else:
        ok = ok and all(x.get('refusal') == 'reenter/live_invocation_lost' for x in reenter)
    # An append without all first custody is never no_append.
    if row['readback']['events'] > 1 and row['readback']['custody'] < row['readback']['events']:
        ok = ok and row['classification']['outcome'] != 'no_append'
    row['status'] = 'pass' if ok else 'fail'
    row['expected'] = exp
    shutil.rmtree(work, ignore_errors=True)
    return row


# ------------------------------------------------------------------ runner

def run_case(c, root):
    work = tempfile.mkdtemp(prefix=c['id'] + '-', dir=root)
    started = time.time()
    rec = dict(id=c['id'], group=c['group'], kind=c['kind'], guard=c['guard'], desc=c['desc'])
    try:
        out = c['fn'](work)
        if c['kind'] == 'positive':
            rec.update(status='pass', observations=out)
        else:
            try:
                out['call']()
            except S.Crash as error:
                rec.update(status='fail', refusal='crash:' + error.point)
            except REFUSALS as error:
                got = code_of(error)
                rec['refusal'] = got
                if isinstance(error, C.Unavailable):
                    rec['unavailable_reason'] = error.reason
                rec['status'] = 'pass' if got == c['guard'] else 'fail'
                try:
                    rec['post'] = out['post']()
                except Exception as error2:  # noqa: BLE001
                    rec['status'] = 'fail'
                    rec['post_error'] = '%s: %s' % (type(error2).__name__, error2)
            else:
                rec.update(status='fail', refusal=None, why='unexpected acceptance')
    except Exception as error:  # noqa: BLE001
        rec.update(status='fail', error='%s: %s' % (type(error).__name__, code_of(error)),
                   trace=traceback.format_exc()[-3000:])
    rec['seconds'] = round(time.time() - started, 2)
    shutil.rmtree(work, ignore_errors=True)
    return rec


def guard_inventory(results):
    guards = {}
    for r in results:
        if r['kind'] == 'negative':
            guards.setdefault(r['guard'], []).append(r['id'])
    return dict(sorted(guards.items()))


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--output')
    p.add_argument('--only')
    p.add_argument('--no-matrix', action='store_true')
    p.add_argument('--matrix-only', action='store_true')
    p.add_argument('--child')
    p.add_argument('--work')
    p.add_argument('--cut')
    p.add_argument('--case')
    a = p.parse_args()
    if a.child == 'run':
        child_run(a.work, a.cut)
        return 0
    if a.child in ('classify', 'reenter'):
        child_classify(a.work, a.child)
        return 0
    scratch = Path(os.environ.get('PM_DG_CF2_SCRATCH', '/home/sittingmongoose/pm-scratch/dg-cf2/tmp'))
    scratch.mkdir(parents=True, exist_ok=True)
    root = tempfile.mkdtemp(prefix='oracles-', dir=scratch)
    groups = set(a.only.split(',')) if a.only else None
    results = []
    if not a.matrix_only:
        for c in CASES:
            if groups and c['group'] not in groups:
                continue
            if a.case and c['id'] != a.case:
                continue
            rec = run_case(c, root)
            results.append(rec)
            print('%-22s %-6s %-9s %s %s' % (c['id'], c['group'], c['kind'], rec['status'],
                                            rec.get('refusal') or rec.get('error') or ''), flush=True)
    matrix = []
    if not a.no_matrix and not a.case:
        for cut in MATRIX_ORDER:
            if groups and GROUP_OF_CUT[cut] not in groups:
                continue
            row = matrix_row(root, cut)
            matrix.append(row)
            print('matrix %-22s %s %s' % (cut, row['status'], row.get('classification')), flush=True)
    shutil.rmtree(root, ignore_errors=True)
    summary = {}
    for r in results:
        g = summary.setdefault(r['group'], dict(positives=0, negatives=0, failures=0))
        g['positives' if r['kind'] == 'positive' else 'negatives'] += 1
        g['failures'] += r['status'] != 'pass'
    for row in matrix:
        g = summary.setdefault(row['group'], dict(positives=0, negatives=0, failures=0))
        g.setdefault('matrix_rows', 0)
        g['matrix_rows'] += 1
        g['failures'] += row['status'] != 'pass'
    failures = [r['id'] for r in results if r['status'] != 'pass'] + ['matrix:%s' % r['cut'] for r in matrix
                                                                       if r['status'] != 'pass']
    report = dict(qualification=QUALIFICATION, native=NATIVE_LINE, lane='DG-CF2',
                  family='goal_run.certified', groups=['CF-06', 'CF-07', 'CF-08', 'CF-09', 'P7'],
                  status='pass' if not failures else 'fail', summary=summary, failures=failures,
                  guards=guard_inventory(results), cases=results, matrix=matrix)
    if a.output:
        Path(a.output).write_text(json.dumps(report, indent=1, sort_keys=True, default=str) + '\n')
    print(json.dumps(dict(status=report['status'], summary=summary, failures=failures), indent=1))
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
