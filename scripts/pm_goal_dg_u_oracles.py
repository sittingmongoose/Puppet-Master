#!/usr/bin/env python3
"""DG-U complete-case oracles for goal.updated U1-U5 (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Runs the newly authored, explicitly selected successor composition
``pm.goal.updated.dg_u.composition.v4`` (``scripts/pm_goal_dg_u_owners.py``,
selection ``Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json``) on
the shared TEST_ONLY adapters. Every case starts from a fresh TEST_ONLY
Storage directory; the test owners actually perform their modeled issuance.

* A positive executes the complete original path (actual SIR admission,
  U0 source capture, U1 reservation, U2 sole body commit, U3 frozen producer
  and Storage append with first custody, U4 immutable SIR terminal) and
  checks the exact entire candidates/results/receipts it names.
* A negative starts from a valid complete case and changes exactly one fact
  at one boundary, with every dependent copy/digest coherent. It must refuse
  with exactly the expected code, and the refused call must add or release no
  durable effect (a footprint over every Goal/update family, SIR admission,
  Storage events, first custody and append reservations is compared with the
  state immediately after the injected change). Unexpected acceptance fails.
* U3's fault matrix kills real child processes (``os._exit(73)``) at each cut,
  reads the bytes back in a fresh process and re-enters twice.

Exit codes: 0 all cases pass; 1 any case fails (including an accepted
negative). Guard inventory: every refusal code observed is listed with the
negatives that refused with exactly that code, for the shared guard-isolation
sweep; no local guard-removal engine is run here.
"""
from __future__ import annotations

import argparse
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

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as GSRC
import pm_goal_dg_u_owners as O

HERE = Path(__file__).resolve().parent
QUALIFICATION = 'TEST_ONLY'
CASES = []
REFUSALS = (A.AdapterRefusal, S.StorageRefusal, NR.NumruleRefusal, GSRC.SourceRefusal)
FOOT_TABLES = (O.T_BODY, O.T_REV, O.T_ORIGIN, O.T_CONTROL, O.T_RECEIPT, O.T_SOURCE, O.T_INPUT, O.T_PROGRESS,
               O.T_TERMINAL, 'dgu_sir', 'dgu_update_source')


def case(group, cid, kind, expected=None):
    def deco(fn):
        CASES.append(dict(group=group, id=cid, kind=kind, expected=expected, fn=fn))
        return fn
    return deco


class Fail(Exception):
    pass


def check(code, cond):
    if not cond:
        raise Fail(code)


# ------------------------------------------------------------------ helpers

def world(d, **kw):
    return O.World(Path(d) / 'w', **kw)


def op_of(adm):
    return adm['normalized_identity']['operation_id']


def scope(w, g):
    return g['scope']


def progress(w, g, op, epoch=None):
    return w.source.read_progress(g['scope'], op, 'oracle', epoch=epoch)[1]['record']


def footprint(w):
    st = w.storage
    return dict(tables={t: {k: v['version'] for k, v in sorted(st.cells.get(t, {}).items())} for t in FOOT_TABLES},
                events=sorted(st.events), custody=sorted(st.custody),
                reservations={k: v['state'] for k, v in sorted(st.reservations.items())})


def inject(w, method, point, mutation, holder):
    def hook(world_, ctx):
        mutation(world_, ctx)
        holder['after'] = footprint(world_)
    w.inject(method, point, hook)


def admitted(w, req):
    """SIR admits first (its own earlier genuine effect); the refused call is the source capture."""
    w.sir.admit(req)
    return lambda: w.command.run(req)


def run_direct(w, g, text='  Updated objective 🌿\n'):
    req = O.direct_request(w, g, text)
    adm = w.command.run(req)
    return req, adm


def run_agent(w, g, text='Agent replacement 🌿'):
    req, ag = O.agent_request(w, g, text)
    adm = w.command.run(req)
    return req, adm, ag


def event_of(w, g, adm):
    return progress(w, g, op_of(adm))['publication']['event_id']


def rewrite(w, owner, family, key, mutate, *, logical_root):
    """Coherent in-place rewrite of one physical row: unwrap, mutate the logical
    wrapper, re-wrap with the same owner identity and recomputed value_sha256."""
    cell = w.storage.cell(family, key)
    wrapper = owner.unwrap_row(family, key, cell['value'], logical_root)
    new = mutate(copy.deepcopy(wrapper))
    row = owner.physical(family, key, new, cell['value']['source_lifetime'])
    w.storage.transact([dict(table=family, key=key, expected=cell['version'], value=row)])
    return new


def rewrite_raw(w, family, key, mutate):
    cell = w.storage.cell(family, key)
    w.storage.transact([dict(table=family, key=key, expected=cell['version'], value=mutate(copy.deepcopy(cell['value'])))])


def rewrite_progress_all(w, g, op, mutate_record):
    """Coherently rewrite every progress snapshot of an operation and its head."""
    sc = g['scope']
    head_key = O.head_key(sc, op)
    hcell = w.storage.cell(O.T_PROGRESS, head_key)
    head = w.source.unwrap_row(O.T_PROGRESS, head_key, hcell['value'], O.UpdateSourceOwner.ROOTS[O.T_PROGRESS])
    last = head['record']['progress_epoch']
    snap_sha = None
    for e in range(last + 1):
        k = O.epoch_key(sc, op, e)
        new = rewrite(w, w.source, O.T_PROGRESS, k, lambda wr: dict(wr, record=mutate_record(wr['record'])),
                      logical_root=O.UpdateSourceOwner.ROOTS[O.T_PROGRESS])
        if e == last:
            snap_sha = O.wrapper_sha(new)
    rewrite(w, w.source, O.T_PROGRESS, head_key,
            lambda wr: dict(wr, record=dict(wr['record'], snapshot_sha256=snap_sha)),
            logical_root=O.UpdateSourceOwner.ROOTS[O.T_PROGRESS])


def row_sizes(w, tables):
    out = []
    for t in tables:
        for k, v in w.storage.cells.get(t, {}).items():
            out.append(dict(table=t, key_sha256=O.sha(k.encode()), stored_bytes=len(O.msgpack(v['value'])),
                            referenced=v['value'].get('payload_ref') is not None))
    return out


def common_success_checks(w, g, req, adm, *, n_before):
    """Exact entire candidates of a successful complete route."""
    sc = g['scope']
    op = op_of(adm)
    cur = w.body.read_private(sc, 'oracle')
    body = cur['body']
    check('success/revision', body['revision'] == n_before + 1)
    check('success/text_exact', body['objective_text'] == req['objective_text'])
    p = progress(w, g, op)
    check('success/progress_phase', p['phase'] == 'event_issued')
    receipt = w.body.read_receipt_private(p['body_commit']['receipt_request'], 'oracle')['record']
    check('success/receipt_revision', receipt['before_revision'] == n_before and receipt['after_revision'] == n_before + 1
          and receipt['after_currentness_hash'] == body['currentness_hash'])
    ev = w.storage.read_event(p['publication']['event_id'])
    check('success/frozen_producer', A.same(S.producer25(ev), p['producer_input']))
    custody = w.storage.first_custody(ev['event_id'])
    check('success/first_receipt', A.same(custody['first_append_receipt'], p['publication']['first_append_receipt']))
    check('success/full_value', custody['original_event_value_commitment']['sha256'] == NR.full_value_commitment(ev))
    check('success/storage_assigned', ev['sequence_id'] == custody['first_append_receipt']['sequence_id'])
    eid, key = O.event_identity(sc['storage_instance_id'], sc['project_id'], sc['thread_id'],
                                req['command_instance_id'], op, sc['goal_id'])
    check('success/sp421_identity', ev['event_id'] == eid and ev['idempotency_key'] == key)
    rep = w.sir.replay(req['command_instance_id'])
    check('success/terminal', rep['terminal']['kind'] == 'succeeded' and rep['response']['replayed'] is True and
          rep['terminal']['response']['event_refs'] == [ev['event_id']])
    check('success/created_at', body['created_at'] == cur['revisions'][0]['created_at'])
    check('success/payload_join', ev['payload']['revision'] == n_before + 1 and
          ev['payload']['body_receipt_sha256'] == p['body_commit']['receipt_sha256'])
    order = [m for _, m in w.recorder.sequence(True)]
    want = ['sir.admit', 'source.capture', 'body.reserve', 'body.commit', 'producer.freeze', 'producer.publish',
            'sir.terminalize']
    pos = [order.index(m) for m in want if m in order]
    check('success/method_order', len(pos) == len(want) and pos == sorted(pos))
    return dict(event_id=ev['event_id'], sequence_id=ev['sequence_id'], revision=body['revision'], op=op)


# ================================================================== U1 physical successor

@case('U1', 'U1/P/direct_inline_route', 'positive')
def u1_direct_inline(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g)
    out = common_success_checks(w, g, req, adm, n_before=1)
    sizes = row_sizes(w, (O.T_BODY, O.T_REV, O.T_ORIGIN, O.T_CONTROL, O.T_RECEIPT, O.T_SOURCE, O.T_INPUT,
                          O.T_PROGRESS, O.T_TERMINAL))
    check('u1/all_inline', all(not s['referenced'] for s in sizes))
    check('u1/every_row_bounded', all(s['stored_bytes'] <= O.CAP for s in sizes))
    gen = w.storage.manifest_generation
    w.command.run(req)  # equal retry after terminal: replay, no write
    check('u1/equal_retry_no_write', w.storage.manifest_generation == gen)
    again = w.producer.publish(g['scope'], out['op'])  # lost acknowledgement: original publication
    check('u1/lost_ack_replay', again['replay'] is True and w.storage.manifest_generation == gen)
    return dict(out, rows=len(sizes), max_row=max(s['stored_bytes'] for s in sizes))


BIG = '\U0001F33F' * 4000


@case('U1', 'U1/P/agent_large_reference_route', 'positive')
def u1_agent_large(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm, ag = run_agent(w, g, BIG)
    out = common_success_checks(w, g, req, adm, n_before=1)
    sizes = row_sizes(w, (O.T_BODY, O.T_REV, O.T_CONTROL, O.T_INPUT, O.T_SOURCE, O.T_PROGRESS, O.T_TERMINAL,
                          O.T_RECEIPT, O.T_ORIGIN))
    referenced = [s for s in sizes if s['referenced']]
    check('u1/referenced_rows', len(referenced) >= 3)
    check('u1/every_row_bounded', all(s['stored_bytes'] <= O.CAP for s in sizes))
    # Pack durability before the referencing row's transaction.
    tx_gen = {t['tx_id']: t['generation'] for t in w.tx_log}
    pack_gen = {}
    for p in w.pack_log:
        pack_gen.setdefault(p['blake3'], p['generation'])
    for t in (O.T_BODY, O.T_REV, O.T_CONTROL, O.T_INPUT):
        for k, v in w.storage.cells.get(t, {}).items():
            ref = v['value']['payload_ref']
            if ref is not None:
                check('u1/pack_before_reference', ref['id'] in pack_gen and v['tx'] in tx_gen and
                      pack_gen[ref['id']] < tx_gen[v['tx']])
    # Independent resolution of each referenced row's pack bytes.
    import blake3
    for t in (O.T_BODY, O.T_REV, O.T_INPUT):
        for k, v in w.storage.cells.get(t, {}).items():
            ref = v['value']['payload_ref']
            if ref is None:
                continue
            raw = (w.storage.root / 'packs' / ref['id']).read_bytes()
            check('u1/pack_blake3', blake3.blake3(raw).hexdigest() == ref['id'] and len(raw) == ref['size'])
            check('u1/pack_value_sha', O.sha(raw) == v['value']['value_sha256'])
            wrapper = NR.decode_event_value(raw)
            check('u1/pack_canonical', O.msgpack(wrapper) == raw)
    inp = w.source.read_input_content(dict(reader_binding='reader.goal.update_input@1.0.0', operation_id=out['op'],
                                           **g['scope']), g['user'], g['user_permission'])
    check('u1/input_exact', inp['input']['record']['request']['objective_text'] == BIG)
    body = w.body.read_body(g['scope'], g['user'], g['user_permission'])['body']
    check('u1/body_exact', body['objective_text'] == BIG)
    logical = {t: max((len(O.msgpack(w.source.unwrap_row(t, k, v['value'], w.source.ROOTS[t]) if t == O.T_INPUT else
                                     w.body.unwrap_row(t, k, v['value'], w.body.ROOTS[t])))
                       for k, v in w.storage.cells.get(t, {}).items()), default=0) for t in (O.T_INPUT, O.T_BODY, O.T_REV)}
    return dict(out, referenced=len(referenced), max_row=max(s['stored_bytes'] for s in sizes), logical_bytes=logical)


@case('U1', 'U1/P/audit_survives_content_lifetime', 'positive')
def u1_audit_survives(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g)
    op = op_of(adm)
    w.threads.delete(g['scope']['project_id'], g['scope']['thread_id'])
    a = w.source.read_audit(dict(reader_binding='reader.goal.update_command_audit@1.0.0', operation_id=op,
                                 selection=dict(kind='terminal_members'), **g['scope']), g['user'], g['user_permission'])
    p = progress(w, g, op)
    r = w.body.read_receipt(p['body_commit']['receipt_request'], g['user'], g['user_permission'])
    ins = w.inspector.inspect(w.inspector.request_for(g['scope'], event_of(w, g, adm)), g['user'], g['user_permission'])
    check('u1/audit_terminal', a['terminal']['record']['kind'] == 'succeeded')
    check('u1/receipt', r['record']['after_revision'] == 2)
    check('u1/inspection', ins['observation']['payload']['revision'] == 2)
    return dict(audit=True, receipt=True, inspection=True)


def _large(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm, ag = run_agent(w, g, BIG)
    op = op_of(adm)
    ikey = O.upd_key(O.T_INPUT, g['scope'], op)
    return w, g, op, ikey


def _input_call(w, g, op):
    return lambda: w.source.read_input_content(dict(reader_binding='reader.goal.update_input@1.0.0', operation_id=op,
                                                    **g['scope']), g['user'], g['user_permission'])


@case('U1', 'U1/N/pack_corrupt_at_rest', 'negative', 'payload/numrule/payload_digest')
def u1n_corrupt(d):
    w, g, op, ikey = _large(d)
    ref = w.storage.cell(O.T_INPUT, ikey)['value']['payload_ref']
    path = w.storage.root / 'packs' / ref['id']
    raw = bytearray(path.read_bytes())
    raw[len(raw) // 2] ^= 0x01
    path.write_bytes(bytes(raw))
    return w, _input_call(w, g, op)


@case('U1', 'U1/N/pack_absent', 'negative', 'pack/present')
def u1n_absent(d):
    w, g, op, ikey = _large(d)
    ref = w.storage.cell(O.T_INPUT, ikey)['value']['payload_ref']
    (w.storage.root / 'packs' / ref['id']).unlink()
    return w, _input_call(w, g, op)


@case('U1', 'U1/N/pack_withdrawn', 'negative', 'pack/unavailable')
def u1n_withdrawn(d):
    w, g, op, ikey = _large(d)
    w.storage.withdraw_pack(w.storage.cell(O.T_INPUT, ikey)['value']['payload_ref']['id'])
    return w, _input_call(w, g, op)


@case('U1', 'U1/N/pack_foreign_substituted', 'negative', 'dgu/physical/value_sha256')
def u1n_foreign(d):
    w, g, op, ikey = _large(d)
    bkey = O.body_key(g['scope']['project_id'], g['scope']['goal_id'])
    other = w.storage.cell(O.T_BODY, bkey)['value']['payload_ref']
    rewrite_raw(w, O.T_INPUT, ikey, lambda row: dict(row, payload_ref=dict(other)))
    return w, _input_call(w, g, op)


@case('U1', 'U1/N/pack_size_substituted', 'negative', 'payload/numrule/payload_size')
def u1n_size(d):
    w, g, op, ikey = _large(d)
    rewrite_raw(w, O.T_INPUT, ikey, lambda row: dict(row, payload_ref=dict(row['payload_ref'],
                                                                         size=row['payload_ref']['size'] + 1)))
    return w, _input_call(w, g, op)


@case('U1', 'U1/N/pack_media_substituted', 'negative', 'dgu/physical/read/schema/payload_ref')
def u1n_media(d):
    w, g, op, ikey = _large(d)
    rewrite_raw(w, O.T_INPUT, ikey, lambda row: dict(row, payload_ref=dict(row['payload_ref'],
                                                                         media_type='application/json')))
    return w, _input_call(w, g, op)


@case('U1', 'U1/N/reference_before_pack', 'negative', 'pack/unavailable')
def u1n_premature(d):
    w, g, op, ikey = _large(d)
    rewrite_raw(w, O.T_INPUT, ikey, lambda row: dict(row, payload_ref=dict(row['payload_ref'], id='ab' * 32)))
    return w, _input_call(w, g, op)


@case('U1', 'U1/N/inline_tamper_incoherent', 'negative', 'dgu/physical/value_sha256')
def u1n_inline_incoherent(d):
    w = world(d)
    g = O.birth_goal(w)
    run_direct(w, g)
    bkey = O.body_key(g['scope']['project_id'], g['scope']['goal_id'])
    rewrite_raw(w, O.T_BODY, bkey, lambda row: dict(row, record=dict(row['record'], record=dict(
        row['record']['record'], objective_text='substituted'))))
    return w, lambda: w.body.read_body(g['scope'], g['user'], g['user_permission'])


@case('U1', 'U1/N/inline_tamper_coherent_semantic', 'negative', 'dgu/reader/body/body_currentness')
def u1n_inline_coherent(d):
    w = world(d)
    g = O.birth_goal(w)
    run_direct(w, g)
    bkey = O.body_key(g['scope']['project_id'], g['scope']['goal_id'])
    rewrite(w, w.body, O.T_BODY, bkey, lambda wr: dict(wr, record=dict(wr['record'], objective_text='substituted')),
            logical_root=w.body.ROOTS[O.T_BODY])
    return w, lambda: w.body.read_body(g['scope'], g['user'], g['user_permission'])


@case('U1', 'U1/N/row_copied_to_other_key', 'negative', 'dgu/physical/owner_identity')
def u1n_copied(d):
    w = world(d)
    g = O.birth_goal(w)
    run_direct(w, g)
    p, gg = g['scope']['project_id'], g['scope']['goal_id']
    r1 = w.storage.cell(O.T_REV, O.rev_key(p, gg, 1))['value']
    rewrite_raw(w, O.T_REV, O.rev_key(p, gg, 2), lambda row: copy.deepcopy(r1))
    return w, lambda: w.body.read_history(g['scope'], g['user'], g['user_permission'])


@case('U1', 'U1/N/logical_edition_substituted', 'negative', 'dgu/physical/logical_schema')
def u1n_edition(d):
    w = world(d)
    g = O.birth_goal(w)
    run_direct(w, g)
    bkey = O.body_key(g['scope']['project_id'], g['scope']['goal_id'])
    rewrite_raw(w, O.T_BODY, bkey, lambda row: dict(row, logical_schema_version='2.0.0'))
    return w, lambda: w.body.read_body(g['scope'], g['user'], g['user_permission'])


@case('U1', 'U1/N/predecessor_json_wrapper_as_current', 'negative', 'dgu/physical/read/schema/')
def u1n_predecessor(d):
    w = world(d)
    g = O.birth_goal(w)
    run_direct(w, g)
    bkey = O.body_key(g['scope']['project_id'], g['scope']['goal_id'])
    rewrite_raw(w, O.T_BODY, bkey, lambda row: row['record'])
    return w, lambda: w.body.read_body(g['scope'], g['user'], g['user_permission'])


@case('U1', 'U1/N/unrepresentable_integer', 'negative', 'dgu/jcs/jcs_binary64')
def u1n_integer(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    req['expected_revision'] = 2 ** 64
    return w, lambda: w.command.run(req)


@case('U1', 'U1/N/objective_4001_scalars', 'negative', 'dgu/sir/request/schema/objective_text')
def u1n_4001(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x' * 4001)
    return w, lambda: w.command.run(req)


@case('U1', 'U1/N/input_after_tombstone', 'negative', 'dgu/reader/input/content_unavailable')
def u1n_input_tomb(d):
    w, g, op, ikey = _large(d)
    w.threads.delete(g['scope']['project_id'], g['scope']['thread_id'])
    return w, _input_call(w, g, op)


@case('U1', 'U1/N/body_after_tombstone', 'negative', 'dgu/reader/body/content_unavailable')
def u1n_body_tomb(d):
    w, g, op, ikey = _large(d)
    w.threads.delete(g['scope']['project_id'], g['scope']['thread_id'])
    return w, lambda: w.body.read_body(g['scope'], g['user'], g['user_permission'])


# ================================================================== U2 metadata, states, Plan

@case('U2', 'U2/P/metadata_gap_then_agent_update', 'positive')
def u2_gap(d):
    w = world(d)
    g = O.birth_goal(w)
    sc = g['scope']
    req1, adm1 = run_direct(w, g, 'second objective')
    rev2 = w.body.read_private(sc, 'o')['revisions'][-1]
    rev2_row = O.msgpack(w.storage.cell(O.T_REV, O.rev_key(sc['project_id'], sc['goal_id'], 2))['value'])
    m1 = w.lifecycle.change(sc, 'paused')
    m2 = w.lifecycle.change(sc, 'active')
    check('u2/metadata_receipts', m1['receipt']['accepted_objective_revision'] is None and
          m2['receipt']['accepted_objective_revision'] is None and m2['body']['revision'] == 4)
    req2, adm2, ag = run_agent(w, g, 'fifth via approved agent')
    out = common_success_checks(w, g, req2, adm2, n_before=4)
    cur = w.body.read_private(sc, 'o')
    check('u2/history', [r['revision'] for r in cur['revisions']] == [1, 2, 5])
    check('u2/prior_across_gap', cur['revisions'][-1]['prior_revision_hash'] == rev2['revision_hash'])
    src = w.source.read_source(sc, op_of(adm2), 'o')['record']
    check('u2/source_prior', src['prior_objective_revision'] == 2 and src['expected_revision'] == 4 and
          src['prior_revision_hash'] == rev2['revision_hash'])
    ev = w.storage.read_event(out['event_id'])
    check('u2/event_gap', ev['payload']['before_revision'] == 4 and ev['payload']['revision'] == 5 and
          ev['payload']['prior_revision_hash'] == rev2['revision_hash'])
    check('u2/old_history_bytes', O.msgpack(w.storage.cell(O.T_REV, O.rev_key(sc['project_id'], sc['goal_id'],
                                                                              2))['value']) == rev2_row)
    check('u2/origins', [o['goal_revision'] for o in cur['origins']] == [1, 2, 5])
    check('u2/no_association_invented', w.plans.current(sc['goal_id']) is None and cur['body']['active_run_ref'] is None)
    return dict(out, history=[1, 2, 5])


def _state_edit(d, state, reason=None, agent=False):
    w = world(d)
    g = O.birth_goal(w)
    sc = g['scope']
    w.lifecycle.change(sc, state, reason)
    stop_before = w.stops.current(sc['goal_id'])
    if agent:
        req, adm, ag = run_agent(w, g, 'edited while ' + state)
    else:
        req, adm = run_direct(w, g, 'edited while ' + state)
    out = common_success_checks(w, g, req, adm, n_before=2)
    body = w.body.read_private(sc, 'o')['body']
    check('u2/state_preserved', body['state'] == state and body['blocked_reason_ref'] == reason)
    check('u2/no_implicit_resume', A.same(w.stops.current(sc['goal_id']), stop_before))
    return dict(out, state=state)


@case('U2', 'U2/P/paused_direct_edit', 'positive')
def u2_paused(d):
    return _state_edit(d, 'paused')


@case('U2', 'U2/P/blocked_agent_edit', 'positive')
def u2_blocked(d):
    return _state_edit(d, 'blocked', 'TEST_ONLY:blocked-reason', agent=True)


@case('U2', 'U2/P/active_agent_edit', 'positive')
def u2_active(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm, ag = run_agent(w, g, 'active edit')
    return common_success_checks(w, g, req, adm, n_before=1)


@case('U2', 'U2/P/bound_plan_nonconflicting', 'positive')
def u2_plan(d):
    w = world(d)
    g = O.birth_goal(w, bind_plan=True)
    before = w.plans.current(g['scope']['goal_id'])
    req, adm = run_direct(w, g)
    out = common_success_checks(w, g, req, adm, n_before=1)
    check('u2/plan_untouched', A.same(w.plans.current(g['scope']['goal_id']), before))
    cap = w.source.state('capture:' + O.hexk(out['op']))
    check('u2/plan_epoch_captured', cap['plan_binding_epoch'] == before['binding_epoch'])
    return out


@case('U2', 'U2/P/second_update_retains_first', 'positive')
def u2_second(d):
    w = world(d)
    g = O.birth_goal(w)
    req1, adm1 = run_direct(w, g, 'first edit')
    ev1 = event_of(w, g, adm1)
    obs1 = w.inspector.inspect(w.inspector.request_for(g['scope'], ev1), g['user'], g['user_permission'])['observation']
    rep1 = w.sir.replay(req1['command_instance_id'])['response']
    req2, adm2 = run_direct(w, g, 'second edit')
    common_success_checks(w, g, req2, adm2, n_before=2)
    obs1b = w.inspector.inspect(w.inspector.request_for(g['scope'], ev1), g['user'], g['user_permission'])['observation']
    check('u2/first_observation_unchanged', A.same(obs1, obs1b))
    check('u2/first_replay_unchanged', A.same(rep1, w.sir.replay(req1['command_instance_id'])['response']))
    return dict(first=ev1, second=event_of(w, g, adm2))


@case('U2', 'U2/N/completed_refusal', 'negative', 'dgu/source/capture/completed_refusal')
def u2n_completed(d):
    w = world(d)
    g = O.birth_goal(w)
    w.lifecycle.change(g['scope'], 'completed')
    req = O.direct_request(w, g, 'x')
    return w, admitted(w, req)


@case('U2', 'U2/N/stale_revision_coherent', 'negative', 'dgu/source/capture/stale_goal_revision')
def u2n_stale_rev(d):
    w = world(d)
    g = O.birth_goal(w)
    old = w.body.read_private(g['scope'], 'o')['body']
    run_direct(w, g, 'moved on')
    req = O.direct_request(w, g, 'late', expected=(old['revision'], old['currentness_hash']))
    return w, admitted(w, req)


@case('U2', 'U2/N/stale_currentness', 'negative', 'dgu/source/capture/stale_currentness')
def u2n_stale_cur(d):
    w = world(d)
    g = O.birth_goal(w)
    old = w.body.read_private(g['scope'], 'o')['body']
    run_direct(w, g, 'moved on')
    cur = w.body.read_private(g['scope'], 'o')['body']
    req = O.direct_request(w, g, 'late', expected=(cur['revision'], old['currentness_hash']))
    return w, admitted(w, req)


@case('U2', 'U2/N/metadata_between_capture_and_reserve', 'negative', 'dgu/body/reserve/stale_goal_revision')
def u2n_meta_between(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    w.lifecycle.change(g['scope'], 'paused')
    return w, lambda: w.command.reserve(adm)


@case('U2', 'U2/N/metadata_while_reserved', 'negative', 'dgu/body/metadata/pending_reservation')
def u2n_meta_reserved(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    w.command.run(req, stop_after='reserve')
    return w, lambda: w.lifecycle.change(g['scope'], 'paused')


@case('U2', 'U2/N/plan_conflict_at_capture', 'negative', 'dgu/source/capture/plan_material_conflict')
def u2n_plan_capture(d):
    w = world(d)
    g = O.birth_goal(w, bind_plan=True)
    w.plans.conflict(g['scope']['goal_id'])
    req = O.direct_request(w, g, 'x')
    return w, admitted(w, req)


@case('U2', 'U2/N/plan_epoch_changed_before_commit', 'negative', 'dgu/body/commit/plan_epoch')
def u2n_plan_epoch(d):
    w = world(d)
    g = O.birth_goal(w, bind_plan=True)
    req = O.direct_request(w, g, 'x')
    adm = w.command.run(req, stop_after='reserve')
    w.plans.advance_epoch(g['scope']['goal_id'])
    return w, lambda: w.command.commit(adm)


@case('U2', 'U2/N/plan_conflict_before_commit', 'negative', 'dgu/body/commit/plan_material_conflict')
def u2n_plan_commit(d):
    w = world(d)
    g = O.birth_goal(w, bind_plan=True)
    req = O.direct_request(w, g, 'x')
    adm = w.command.run(req, stop_after='reserve')
    w.plans.conflict(g['scope']['goal_id'])
    return w, lambda: w.command.commit(adm)


@case('U2', 'U2/N/foreign_plan_binding', 'negative', 'dgu/source/capture/plan_binding_scope')
def u2n_plan_foreign(d):
    w = world(d)
    g = O.birth_goal(w)
    w.plans.bind(dict(g['scope'], project_id='TEST_ONLY-project-foreign'))
    req = O.direct_request(w, g, 'x')
    return w, admitted(w, req)


@case('U2', 'U2/N/stop_at_capture', 'negative', 'dgu/source/capture/manual_stop_latched')
def u2n_stop_capture(d):
    w = world(d)
    g = O.birth_goal(w)
    w.stops.stop(g['scope']['goal_id'])
    req = O.direct_request(w, g, 'x')
    return w, admitted(w, req)


@case('U2', 'U2/N/stop_before_commit', 'negative', 'dgu/body/commit/manual_stop_latched')
def u2n_stop_commit(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    adm = w.command.run(req, stop_after='reserve')
    w.stops.stop(g['scope']['goal_id'])
    return w, lambda: w.command.commit(adm)


@case('U2', 'U2/N/approval_for_prior_revision', 'negative', 'dgu/source/capture/acceptance/approval_target_revision')
def u2n_approval_prior(d):
    w = world(d)
    g = O.birth_goal(w)
    req, ag = O.agent_request(w, g, 'approved at revision one')
    run_direct(w, g, 'someone saved first')
    cur = w.body.read_private(g['scope'], 'o')['body']
    req = dict(req, command_instance_id=req['command_instance_id'] + ':rebased', expected_revision=cur['revision'],
               expected_currentness_hash=cur['currentness_hash'])
    return w, admitted(w, req)


@case('U2', 'U2/N/expected_revision_bool', 'negative', 'dgu/sir/request/expected_revision/numrule/integer_type')
def u2n_bool(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    req['expected_revision'] = True
    return w, lambda: w.command.run(req)


# ================================================================== U3 in-process refusals

@case('U3', 'U3/N/no_effect_after_commit', 'negative', 'dgu/command/cancel/body_effect_exists')
def u3n_noeffect(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    w.command.run(req, stop_after='commit')
    return w, lambda: w.command.cancel_before_body(req['command_instance_id'])


@case('U3', 'U3/N/release_after_commit', 'negative', 'dgu/body/release/body_committed')
def u3n_release(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    adm = w.command.run(req, stop_after='reserve')
    reserved = w.body.read_private(g['scope'], 'o')['control']
    w.command.commit(adm)
    return w, lambda: w.body.release(g['scope'], reserved, lambda c: [])


@case('U3', 'U3/N/unknown_from_committed', 'negative', 'dgu/command/unknown/no_unknown_edge')
def u3n_unknown_committed(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    w.command.run(req, stop_after='commit')
    return w, lambda: w.command.mark_unknown(req['command_instance_id'])


@case('U3', 'U3/N/later_success_cannot_rewrite_unknown', 'negative', 'dgu/sir/terminal_immutable')
def u3n_rewrite(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    w.command.run(req, stop_after='freeze')
    w.command.mark_unknown(req['command_instance_id'])
    w.command.recover(req['command_instance_id'])
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'succeeded')


@case('U3', 'U3/N/no_effect_terminal_with_event', 'negative', 'dgu/sir/terminal/no_effect_phase')
def u3n_noeffect_event(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    w.command.run(req, stop_after='publish')
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'no_effect')


@case('U3', 'U3/N/success_terminal_without_event', 'negative', 'dgu/sir/terminal/success_phase')
def u3n_success_noevent(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    w.command.run(req, stop_after='commit')
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'succeeded')


@case('U3', 'U3/N/unknown_terminal_from_reserved', 'negative', 'dgu/sir/terminal/unknown_phase')
def u3n_unknown_reserved(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    w.command.run(req, stop_after='reserve')
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'unknown')


@case('U3', 'U3/P/pre_reservation_no_effect_in_process', 'positive')
def u3_pre_res(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    w.stops.stop(g['scope']['goal_id'])
    t = w.command.cancel_before_body(req['command_instance_id'], error_code='manual_stop_latched', status='rejected')
    check('u3/no_effect_terminal', t['terminal']['kind'] == 'no_effect' and
          t['terminal']['result']['error']['code'] == 'manual_stop_latched')
    check('u3/no_body', w.body.read_private(g['scope'], 'o')['body']['revision'] == 1)
    check('u3/no_event', not w.storage.events)
    p = progress(w, g, op_of(adm))
    check('u3/phase', p['phase'] == 'no_effect' and p['pending_intent_sha256'] is None)
    return dict(phase=p['phase'])


# ================================================================== U4 consumers

@case('U4', 'U4/P/event_inspection_whole_tuple', 'positive')
def u4_inspect(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm, ag = run_agent(w, g)
    ev = event_of(w, g, adm)
    gen = w.storage.manifest_generation
    out = w.inspector.inspect(w.inspector.request_for(g['scope'], ev), g['user'], g['user_permission'])
    check('u4/no_checkpoint_or_write', w.storage.manifest_generation == gen)
    obs, wit = out['observation'], out['witness']
    stored = w.storage.read_event(ev)
    check('u4/observation_payload', A.same(obs['payload'], stored['payload']) and obs['sequence_id'] == stored['sequence_id'])
    check('u4/witness_publication', A.same(wit['original_publication'], progress(w, g, op_of(adm))['publication']))
    check('u4/witness_token', wit['source_read_token']['storage_instance_id'] == w.storage.storage_instance_id)
    check('u4/action_authority', obs['action_authority'] == 'none' and obs['checkpoint_effect'] == 'none_required')
    return dict(event_id=ev, sequence_id=obs['sequence_id'])


@case('U4', 'U4/P/inspection_independent_of_terminal', 'positive')
def u4_before_terminal(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    adm = w.command.run(req, stop_after='publish')
    out = w.inspector.inspect(w.inspector.request_for(g['scope'], event_of(w, g, adm)), g['user'], g['user_permission'])
    check('u4/no_terminal', not w.command._terminal_exists(adm))
    return dict(sequence_id=out['observation']['sequence_id'])


@case('U4', 'U4/P/current_body_history_without_approval_rerun', 'positive')
def u4_current(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm, ag = run_agent(w, g, 'agent text')
    w.approvals.revoke(ag['approval_id'])
    body = w.body.read_body(g['scope'], g['user'], g['user_permission'])
    hist = w.body.read_history(g['scope'], g['user'], g['user_permission'])
    check('u4/body', body['body']['objective_text'] == 'agent text' and body['pending_visible'] is False)
    check('u4/history', [r['change_source'] for r in hist['revisions']] == ['user_direct', 'agent_proposed_user_approved'])
    return dict(revision=body['body']['revision'])


@case('U4', 'U4/P/pending_not_current_text', 'positive')
def u4_pending(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'pending text')
    w.command.run(req, stop_after='reserve')
    body = w.body.read_body(g['scope'], g['user'], g['user_permission'])
    check('u4/old_text_while_pending', body['body']['objective_text'] != 'pending text' and body['has_pending'])
    return dict(revision=body['body']['revision'])


@case('U4', 'U4/P/audit_immutable_epoch_and_terminal_members', 'positive')
def u4_audit(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g)
    op = op_of(adm)
    sc = g['scope']
    sel = dict(storage_instance_id=sc['storage_instance_id'], project_id=sc['project_id'], thread_id=sc['thread_id'],
               goal_id=sc['goal_id'], operation_id=op, progress_epoch=2, snapshot_key=O.epoch_key(sc, op, 2))
    a = w.source.read_audit(dict(reader_binding='reader.goal.update_command_audit@1.0.0', operation_id=op,
                                 selection=dict(kind='immutable_progress', selector=sel), **sc), g['user'],
                            g['user_permission'])
    check('u4/epoch2', a['progress']['record']['phase'] == 'body_committed')
    t = w.source.read_audit(dict(reader_binding='reader.goal.update_command_audit@1.0.0', operation_id=op,
                                 selection=dict(kind='terminal_members'), **sc), g['user'], g['user_permission'])
    check('u4/terminal_members', t['terminal']['record']['terminal_progress_selector']['progress_epoch'] == 4)
    return dict(epochs=5)


@case('U4', 'U4/P/historical_event_after_later_edit', 'positive')
def u4_historical(d):
    return u2_second(d)


def _inspect_setup(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g)
    ev = event_of(w, g, adm)
    return w, g, adm, w.inspector.request_for(g['scope'], ev)


@case('U4', 'U4/N/foreign_storage', 'negative', 'dgu/inspect/foreign_storage')
def u4n_foreign(d):
    w, g, adm, r = _inspect_setup(d)
    r['storage_instance_id'] = '00000000-0000-4000-8000-000000000000'
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U4', 'U4/N/false_selector', 'negative', 'dgu/inspect/selected_index_key')
def u4n_selector(d):
    w, g, adm, r = _inspect_setup(d)
    r['selected_index_key'] = r['selected_index_key'] + 'x'
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U4', 'U4/N/wrong_sequence', 'negative', 'dgu/inspect/sequence')
def u4n_sequence(d):
    w, g, adm, r = _inspect_setup(d)
    r['sequence_id'] = r['sequence_id'] + 7
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U4', 'U4/N/unknown_event', 'negative', 'dgu/inspect/event_unavailable')
def u4n_unknown(d):
    w, g, adm, r = _inspect_setup(d)
    r['event_id'] = 'goal.updated.v1:' + '0' * 64
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U4', 'U4/N/pending_first_custody', 'negative', 'dgu/inspect/original_custody_unavailable')
def u4n_pending_custody(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    adm = w.command.run(req, stop_after='freeze')
    w.storage.faults = S.FaultPlan(cut='after_append')
    try:
        w.producer.publish(g['scope'], op_of(adm))
    except S.Crash:
        pass
    w.storage.faults = S.FaultPlan()
    ev = progress(w, g, op_of(adm))['producer_input']['event_id']
    r = w.inspector.request_for(g['scope'], ev)
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U4', 'U4/N/other_family_event', 'negative', 'dgu/inspect/unsupported_payload')
def u4n_family(d):
    import pm_goal_test_reopen as RO
    w, g, adm, r = _inspect_setup(d)
    spec = RO.probe_spec('dgu-other')
    spec['candidates'][0]['project_id'] = g['scope']['project_id']
    RO.run_protocol(w.storage, spec)
    ev = spec['candidates'][0]['event_id']
    info = w.storage.events[ev]
    r2 = dict(r, event_id=ev, sequence_id=info['sequence_id'],
              selected_index_key=O.EventInspector.index_key(w.storage.read_event(ev)))
    return w, lambda: w.inspector.inspect(r2, g['user'], g['user_permission'])


@case('U4', 'U4/N/stale_checkpoint_at_release', 'negative', 'dgu/inspect/final_checkpoint')
def u4n_checkpoint(d):
    w, g, adm, r = _inspect_setup(d)
    holder = {}
    inject(w, 'inspect', 'before_release', lambda w_, ctx: w_.storage.new_seed(), holder)
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission']), holder


@case('U4', 'U4/N/substituted_segment_bytes', 'negative', 'source/retained_inventory')
def u4n_malformed(d):
    w, g, adm, r = _inspect_setup(d)
    snap = w.storage.acquire_source()
    seg = snap['segments'][-1]
    raw = bytearray(seg['raw'])
    raw[-10] ^= 0xFF
    seg['raw'] = bytes(raw)
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'], snapshot=snap)


@case('U4', 'U4/N/audit_selector_key_substituted', 'negative', 'dgu/reader/audit/selector_key')
def u4n_audit_key(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g)
    op = op_of(adm)
    sc = g['scope']
    sel = dict(storage_instance_id=sc['storage_instance_id'], project_id=sc['project_id'], thread_id=sc['thread_id'],
               goal_id=sc['goal_id'], operation_id=op, progress_epoch=2, snapshot_key=O.epoch_key(sc, op, 3))
    r = dict(reader_binding='reader.goal.update_command_audit@1.0.0', operation_id=op,
             selection=dict(kind='immutable_progress', selector=sel), **sc)
    return w, lambda: w.source.read_audit(r, g['user'], g['user_permission'])


@case('U4', 'U4/N/audit_terminal_pending', 'negative', 'dgu/reader/audit/terminal_pending')
def u4n_audit_pending(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    adm = w.command.run(req, stop_after='publish')
    r = dict(reader_binding='reader.goal.update_command_audit@1.0.0', operation_id=op_of(adm),
             selection=dict(kind='terminal_members'), **g['scope'])
    return w, lambda: w.source.read_audit(r, g['user'], g['user_permission'])


@case('U4', 'U4/N/receipt_intent_substituted', 'negative', 'dgu/reader/receipt/receipt_intent')
def u4n_receipt(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g)
    rr = dict(progress(w, g, op_of(adm))['body_commit']['receipt_request'], intent_sha256='0' * 64)
    return w, lambda: w.body.read_receipt(rr, g['user'], g['user_permission'])


@case('U4', 'U4/N/input_permission_revoked', 'negative', 'dgu/reader/input/permission_revoked')
def u4n_input_perm(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g)
    w.permissions.revoke(g['user_permission'])
    return w, _input_call(w, g, op_of(adm))


@case('U4', 'U4/N/replay_before_terminal', 'negative', 'dgu/sir/replay/terminal_pending')
def u4n_replay(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    w.command.run(req, stop_after='publish')
    return w, lambda: w.sir.replay(req['command_instance_id'])


# ================================================================== U5 retained history, retries, exact forms

@case('U5', 'U5/P/retained_after_later_edit_and_revocation', 'positive')
def u5_retained(d):
    w = world(d)
    g = O.birth_goal(w)
    req1, adm1, ag = run_agent(w, g, 'agent edit one')
    w.approvals.revoke(ag['approval_id'])
    req2, adm2 = run_direct(w, g, 'later direct edit')
    op1 = op_of(adm1)
    ev1 = event_of(w, g, adm1)
    w.inspector.inspect(w.inspector.request_for(g['scope'], ev1), g['user'], g['user_permission'])
    w.source.read_audit(dict(reader_binding='reader.goal.update_command_audit@1.0.0', operation_id=op1,
                             selection=dict(kind='terminal_members'), **g['scope']), g['user'], g['user_permission'])
    inp = _input_call(w, g, op1)()
    check('u5/retained_input', inp['input']['record']['request']['objective_text'] == 'agent edit one')
    check('u5/retained_replay', w.sir.replay(req1['command_instance_id'])['response']['result_status'] == 'succeeded')
    hist = w.body.read_history(g['scope'], g['user'], g['user_permission'])
    check('u5/history_text', [r['objective_text'] for r in hist['revisions']][1:] == ['agent edit one', 'later direct edit'])
    return dict(events=2)


@case('U5', 'U5/P/factual_completion_after_deletion_and_stop', 'positive')
def u5_factual(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'committed then deleted')
    adm = w.command.run(req, stop_after='commit')
    w.threads.delete(g['scope']['project_id'], g['scope']['thread_id'])
    w.stops.stop(g['scope']['goal_id'])
    w.command.run(req)
    rep = w.sir.replay(req['command_instance_id'])
    check('u5/factual_success', rep['terminal']['kind'] == 'succeeded')
    try:
        _input_call(w, g, op_of(adm))()
        raise Fail('u5/input_after_delete_accepted')
    except REFUSALS as e:
        check('u5/input_refused', A.refusal_code(e) == 'dgu/reader/input/content_unavailable')
    return dict(kind='succeeded')


@case('U5', 'U5/P/equal_retry_and_new_instance', 'positive')
def u5_retry(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g, 'same text')
    gen = w.storage.manifest_generation
    adm_b = w.command.run(copy.deepcopy(req))
    check('u5/equal_retry_same_op', op_of(adm_b) == op_of(adm) and w.storage.manifest_generation == gen)
    req2 = O.direct_request(w, g, 'same text')
    adm2 = w.command.run(req2)
    check('u5/new_identity', event_of(w, g, adm2) != event_of(w, g, adm) and op_of(adm2) != op_of(adm))
    check('u5/new_revision', w.body.read_private(g['scope'], 'o')['body']['revision'] == 3)
    return dict(ops=2)


@case('U5', 'U5/P/empty_and_unchanged_replacements', 'positive')
def u5_empty(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g, '')
    common_success_checks(w, g, req, adm, n_before=1)
    cur = w.body.read_private(g['scope'], 'o')['body']
    req2, adm2 = run_direct(w, g, cur['objective_text'])
    common_success_checks(w, g, req2, adm2, n_before=2)
    return dict(revisions=3)


@case('U5', 'U5/P/whole_root_banks_pinned', 'positive')
def u5_banks(d):
    ub, cb = O.banks()
    manifest = json.loads((NR.ROOT / 'Plans/goal_update_schema_resources.json').read_text())
    check('u5/bank_pins', all(ub.pins.get(r['retrieval_uri']) == r['sha256'] for r in manifest['resources']))
    return dict(update_resources=len(ub.pins), consumer_resources=len(cb.pins), graph=O.graph_sha256())


@case('U5', 'U5/N/retained_bank_hash_substituted', 'negative', 'bank/whole_hash/Plans/goal_update_command_custody.schema.json')
def u5n_bank(d):
    w = world(d)
    entries = O._manifest_entries('Plans/goal_update_schema_resources.json')
    for e in entries:
        if e['path'] == 'Plans/goal_update_command_custody.schema.json':
            e['sha256'] = '0' * 64
    return w, lambda: A.RootBank(entries)


@case('U5', 'U5/N/disposed_proposal_not_new_authority', 'negative', 'dgu/source/capture/acceptance/approval_target_revision')
def u5n_disposed(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm, ag = run_agent(w, g, 'used once')
    cur = w.body.read_private(g['scope'], 'o')['body']
    req2 = dict(req, command_instance_id=req['command_instance_id'] + ':again', expected_revision=cur['revision'],
                expected_currentness_hash=cur['currentness_hash'], idempotency_key=req['idempotency_key'] + ':again')
    return w, admitted(w, req2)


@case('U5', 'U5/N/altered_retry_same_instance', 'negative', 'dgu/sir/request_conflict')
def u5n_altered(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g, 'original')
    return w, lambda: w.command.run(dict(req, objective_text='altered'))


def _req_neg(field, value, *, agent=False):
    def make(d):
        w = world(d)
        g = O.birth_goal(w)
        if agent:
            req, ag = O.agent_request(w, g, 'x')
        else:
            req = O.direct_request(w, g, 'x')
        if value is DELETE:
            del req[field]
        else:
            req[field] = value
        return w, lambda: w.command.run(req)
    return make


DELETE = object()
for _cid, _field, _value, _code in (
        ('expected_revision_float', 'expected_revision', 1.0, 'dgu/sir/request/expected_revision/numrule/integer_type'),
        ('expected_revision_string', 'expected_revision', '1', 'dgu/sir/request/expected_revision/numrule/integer_type'),
        ('expected_revision_null', 'expected_revision', None, 'dgu/sir/request/expected_revision/numrule/integer_type'),
        ('command_instance_trailing_lf', 'command_instance_id', 'command:TEST_ONLY:x\n',
         'dgu/sir/request/command_instance_id/control_character'),
        ('goal_id_empty', 'goal_id', '', 'dgu/sir/request/goal_id/empty'),
        ('goal_id_array', 'goal_id', ['g'], 'dgu/sir/request/goal_id/type'),
        ('actor_object', 'actor_ref', {'a': 1}, 'dgu/sir/request/actor_ref/type'),
        ('objective_lone_surrogate', 'objective_text', 'a\ud800b', 'dgu/sir/request/schema/objective_text'),
        ('extra_member', 'extension', 1, 'dgu/sir/request/schema/'),
        ('direct_with_approval', 'approval_id', 'approval:TEST_ONLY:x', 'dgu/sir/request/schema/approval_id'),
        ('currentness_uppercase', 'expected_currentness_hash', 'A' * 64,
         'dgu/sir/request/schema/expected_currentness_hash'),
        ('missing_source_message_member', 'source_message_id', DELETE, 'dgu/sir/request/schema/')):
    case('U5', 'U5/N/' + _cid, 'negative', _code)(_req_neg(_field, _value))


@case('U5', 'U5/N/agent_on_direct_surface', 'negative', 'dgu/source/capture/acceptance/agent_surface')
def u5n_agent_surface(d):
    w = world(d)
    g = O.birth_goal(w)
    req, ag = O.agent_request(w, g, 'x')
    req['source_surface'] = 'chat_goal_direct_save'
    return w, admitted(w, req)


@case('U5', 'U5/N/direct_on_agent_surface', 'negative', 'dgu/source/capture/acceptance/direct_surface')
def u5n_direct_surface(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    req['source_surface'] = 'chat_goal_approved_agent'
    return w, admitted(w, req)


def _agent_decided(decide):
    def make(d):
        w = world(d)
        g = O.birth_goal(w)
        req, ag = O.agent_request(w, g, 'x', decide=decide)
        return w, admitted(w, req)
    return make


case('U5', 'U5/N/approval_denied', 'negative', 'dgu/source/capture/acceptance/approval_denied')(_agent_decided('denied'))
case('U5', 'U5/N/approval_expired', 'negative', 'dgu/source/capture/acceptance/approval_expired')(_agent_decided('expired'))
case('U5', 'U5/N/approval_unresolved', 'negative', 'dgu/source/capture/acceptance/approval_not_resolved')(
    _agent_decided(None))


@case('U5', 'U5/N/approval_text_substituted', 'negative', 'dgu/source/capture/acceptance/approval_target_text')
def u5n_text(d):
    w = world(d)
    g = O.birth_goal(w)
    req, ag = O.agent_request(w, g, 'approved text')
    req['objective_text'] = 'different text'
    return w, admitted(w, req)


@case('U5', 'U5/N/approval_source_message_substituted', 'negative',
      'dgu/source/capture/acceptance/approval_source_message')
def u5n_msg(d):
    w = world(d)
    g = O.birth_goal(w)
    req, ag = O.agent_request(w, g, 'x')
    req['source_message_id'] = ag['instruction']
    return w, admitted(w, req)


@case('U5', 'U5/N/approval_request_commitment_substituted', 'negative',
      'dgu/source/capture/acceptance/approval_request_commitment')
def u5n_commit(d):
    w = world(d)
    g = O.birth_goal(w)
    req, ag = O.agent_request(w, g, 'x')
    cur = w.approvals.state(ag['approval_id'])
    raw = O.msgpack(dict(cur['request'], expires_at_utc=None))
    w.approvals.put(ag['approval_id'], dict(cur, resolution=dict(cur['resolution'], request_sha256='1' * 64)))
    return w, admitted(w, req)


def _proposal(d, *, instruction_author='user', instruction_text=None, agent_author='agent', target_storage=None,
              tomb=False):
    """target_storage: optional function of the actual Storage UUID giving the proposal's spelling."""
    w = world(d)
    g = O.birth_goal(w)
    sc = g['scope']
    body = w.body.read_private(sc, 'o')['body']
    agent = 'actor:TEST_ONLY:agent'
    ap = w.permissions.grant(agent, sc, ['propose_goal_update'], person=False)
    text = 'proposed'
    ins = w.chat.post(sc, instruction_author, g['user'] if instruction_author == 'user' else agent,
                      dict(kind='goal_update_instruction', goal_id=sc['goal_id'],
                           replacement_text=instruction_text or text))
    am = w.chat.post(sc, agent_author, agent, dict(kind='goal_update_proposal_message', goal_id=sc['goal_id'],
                                                   replacement_text=text))
    tsc = dict(sc, storage_instance_id=target_storage(sc['storage_instance_id']) if target_storage else sc['storage_instance_id'])
    prop = dict(schema_id='pm.goal.update.proposal_request.v1', schema_version='1.0.0',
                command_id='cmd.chat.goal.propose_update', command_instance_id='proposal:TEST_ONLY:' + os.urandom(4).hex(),
                target=dict(scope=tsc, expected_revision=body['revision'], expected_currentness_hash=body['currentness_hash'],
                            objective_text=text), actor_ref=agent, permission_snapshot_ref=ap, source_message_id=am,
                instruction_message_id=ins, return_route_ref='route:TEST_ONLY:p')
    w.sir.admit_proposal(prop)
    if tomb:
        w.threads.delete(sc['project_id'], sc['thread_id'])
    return w, g, prop, ap


@case('U5', 'U5/N/instruction_not_from_user', 'negative', 'dgu/hitl/capture/instruction_author')
def u5n_ins_author(d):
    w, g, prop, ap = _proposal(d, instruction_author='agent')
    return w, lambda: w.approvals.capture(prop['command_instance_id'])


@case('U5', 'U5/N/instruction_other_text', 'negative', 'dgu/hitl/capture/instruction_attests')
def u5n_ins_text(d):
    w, g, prop, ap = _proposal(d, instruction_text='something else')
    return w, lambda: w.approvals.capture(prop['command_instance_id'])


@case('U5', 'U5/N/agent_message_from_user', 'negative', 'dgu/hitl/capture/agent_author')
def u5n_agent_author(d):
    w, g, prop, ap = _proposal(d, agent_author='user')
    return w, lambda: w.approvals.capture(prop['command_instance_id'])


@case('U5', 'U5/N/target_uuid_malformed', 'negative', 'dgu/hitl/capture/storage_uuid')
def u5n_uuid(d):
    w, g, prop, ap = _proposal(d, target_storage=lambda sid: sid.replace('-', ''))
    return w, lambda: w.approvals.capture(prop['command_instance_id'])


@case('U5', 'U5/N/target_uuid_case_folded', 'negative', 'dgu/hitl/capture/foreign_storage')
def u5n_uuid_case(d):
    w, g, prop, ap = _proposal(d, target_storage=lambda sid: sid.upper())
    return w, lambda: w.approvals.capture(prop['command_instance_id'])


@case('U5', 'U5/N/agent_capture_content_access', 'negative', 'dgu/hitl/capture/content_unavailable')
def u5n_content(d):
    w, g, prop, ap = _proposal(d, tomb=True)
    return w, lambda: w.approvals.capture(prop['command_instance_id'])


@case('U5', 'U5/N/approval_self_decision', 'negative', 'dgu/hitl/decide/self_approval')
def u5n_self(d):
    w, g, prop, ap = _proposal(d)
    cap = w.approvals.capture(prop['command_instance_id'])
    agent_person = w.permissions.grant(prop['actor_ref'], g['scope'], ['approve_goal_update'])
    return w, lambda: w.approvals.decide(cap['approval_id'], 'approved', agent_person, prop['actor_ref'])


@case('U5', 'U5/N/approval_by_non_person', 'negative', 'dgu/hitl/decide/not_person')
def u5n_nonperson(d):
    w, g, prop, ap = _proposal(d)
    cap = w.approvals.capture(prop['command_instance_id'])
    tool = 'actor:TEST_ONLY:tool'
    tp = w.permissions.grant(tool, g['scope'], ['approve_goal_update'], person=False)
    return w, lambda: w.approvals.decide(cap['approval_id'], 'approved', tp, tool)


@case('U5', 'U5/N/proposal_dispatch_conflict', 'negative', 'dgu/sir/proposal_conflict')
def u5n_prop_conflict(d):
    w, g, prop, ap = _proposal(d)
    return w, lambda: w.sir.admit_proposal(dict(prop, return_route_ref='route:TEST_ONLY:other'))


@case('U5', 'U5/N/event_identity_substituted', 'negative', 'dgu/producer/freeze/event_identity')
def u5n_identity(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    adm = w.command.run(req, stop_after='commit')
    op = op_of(adm)
    rewrite_progress_all(w, g, op, lambda r: dict(r, producer_metadata=dict(
        r['producer_metadata'], event_id='goal.updated.v1:' + '1' * 64)))
    return w, lambda: w.producer.freeze(g['scope'], op)


@case('U5', 'U5/N/text_commitment_substituted', 'negative', 'dgu/reader/input/text_commitment')
def u5n_text_commit(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'committed text')
    adm = w.command.run(req, stop_after='publish')
    sc, op = g['scope'], op_of(adm)
    skey = O.upd_key(O.T_SOURCE, sc, op)
    new = rewrite(w, w.source, O.T_SOURCE, skey, lambda wr: dict(wr, record=dict(wr['record'], accepted_text_sha256='2' * 64)),
                  logical_root=w.source.ROOTS[O.T_SOURCE])
    new_sha = O.wrapper_sha(new)
    rewrite(w, w.source, O.T_INPUT, O.upd_key(O.T_INPUT, sc, op),
            lambda wr: dict(wr, record=dict(wr['record'], source_audit_sha256=new_sha)), logical_root=w.source.ROOTS[O.T_INPUT])
    rewrite_progress_all(w, g, op, lambda r: dict(r, source_audit_sha256=new_sha))
    return w, _input_call(w, g, op)


@case('U5', 'U5/N/replay_only_policy_substituted', 'negative', 'dgu/physical/logical/schema/record')
def u5n_replay_only(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    adm = w.command.run(req, stop_after='freeze')
    op = op_of(adm)
    rewrite_progress_all(w, g, op, lambda r: r if r['producer_input'] is None else dict(
        r, producer_input=dict(r['producer_input'], replay_policy='projector_replay_only')))
    return w, lambda: w.producer.publish(g['scope'], op)


@case('U5', 'U5/N/receipt_substituted', 'negative', 'dgu/producer/freeze/receipt_join')
def u5n_receipt(d):
    w = world(d)
    g = O.birth_goal(w)
    req = O.direct_request(w, g, 'x')
    adm = w.command.run(req, stop_after='commit')
    sc, op = g['scope'], op_of(adm)
    rkey = O.receipt_key(sc['project_id'], sc['goal_id'], op)
    rewrite(w, w.body, O.T_RECEIPT, rkey, lambda wr: dict(wr, record=dict(wr['record'], committed_at=w.now())),
            logical_root=w.body.ROOTS[O.T_RECEIPT])
    return w, lambda: w.producer.freeze(sc, op)


@case('U5', 'U5/N/source_scope_substituted_reader', 'negative', 'dgu/reader/audit/foreign_storage')
def u5n_audit_foreign(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g)
    r = dict(reader_binding='reader.goal.update_command_audit@1.0.0', operation_id=op_of(adm),
             selection=dict(kind='current_progress'), **dict(g['scope'], storage_instance_id='11111111-1111-4111-8111-111111111111'))
    return w, lambda: w.source.read_audit(r, g['user'], g['user_permission'])


@case('U1', 'U1/N/event_unrepresentable_before_body', 'negative', 'dgu/source/capture/event_unrepresentable')
def u1n_unrepresentable(d):
    w = world(d)
    g = O.birth_goal(w, goal='goal:TEST_ONLY:' + 'γ' * 2300)
    req = O.direct_request(w, g, 'x')
    return w, admitted(w, req)


def _raw_goal_event(w, g, adm, payload_edit):
    """Append a goal.updated-shaped EventRecord straight through Storage with a
    fresh identity, bypassing the SP-299 producer (no source custody of its own)."""
    import pm_goal_test_reopen as RO
    genuine = w.storage.read_event(event_of(w, g, adm))
    cand = {k: v for k, v in genuine.items() if k not in S.STORAGE_FIELDS}
    cand['payload'] = payload_edit(copy.deepcopy(cand['payload']))
    tag = os.urandom(6).hex()
    cand['event_id'] = 'goal.updated.v1:' + O.sha(tag.encode())
    cand['idempotency_key'] = 'goal.updated.command.v1:' + O.sha(tag.encode())
    spec = dict(operation_id='TEST_ONLY:raw:' + tag, request=dict(kind='TEST_ONLY:raw', tag=tag), candidates=[cand],
                terminal=dict(table='TEST_ONLY:raw_terminal', key='TEST_ONLY:raw:' + tag,
                              value=dict(qualification=QUALIFICATION, tag=tag)))
    RO.run_protocol(w.storage, spec)
    return w.inspector.request_for(g['scope'], cand['event_id'])


@case('U4', 'U4/N/missing_source_raw_event', 'negative', 'dgu/inspect/source_unavailable')
def u4n_missing_source(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g)
    r = _raw_goal_event(w, g, adm, lambda p: dict(p, body_receipt_request=dict(
        p['body_receipt_request'], operation_id='goal-operation:TEST_ONLY:never-admitted')))
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U4', 'U4/N/substituted_event_receipt_commitment', 'negative', 'dgu/inspect/frozen_producer')
def u4n_receipt_commitment(d):
    w = world(d)
    g = O.birth_goal(w)
    req, adm = run_direct(w, g)
    r = _raw_goal_event(w, g, adm, lambda p: dict(p, body_receipt_sha256='3' * 64))
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


def _sir_time_neg(transform):
    def make(d):
        w = world(d)
        g = O.birth_goal(w)
        req = O.direct_request(w, g, 'x')
        w.sir.admit(req)
        key = O.hexk(req['command_instance_id'])
        cur = w.sir.state(key)
        w.sir.put(key, dict(cur, accepted_at=transform(cur['accepted_at'])))
        return w, lambda: w.command.run(req)
    return make


case('U5', 'U5/N/occurred_time_trailing_lf', 'negative', 'dgu/source/capture/occurred_at_utc/numrule/date_time_syntax')(
    _sir_time_neg(lambda t: t + '\n'))
case('U5', 'U5/N/occurred_time_impossible_day', 'negative', 'dgu/source/capture/occurred_at_utc/numrule/date_time_day')(
    _sir_time_neg(lambda t: '2026-02-30' + t[10:]))


# ------------------------------------------------------------------ one-defect negatives per owner guard site

def _goal(d, **kw):
    w = world(d)
    return w, O.birth_goal(w, **kw)


def _upto(d, upto, *, agent=False, **kw):
    w, g = _goal(d, **kw)
    if agent:
        req, ag = O.agent_request(w, g, 'guard edit')
    else:
        req, ag = O.direct_request(w, g, 'guard edit'), {}
    adm = w.command.run(req, stop_after=upto) if upto else None
    return w, g, req, adm, ag


def ctl_key(g):
    return O.control_key(g['scope']['project_id'], g['scope']['goal_id'])


def bkey(g):
    return O.body_key(g['scope']['project_id'], g['scope']['goal_id'])


def rbody(w, family, key, edit):
    return rewrite(w, w.body, family, key, lambda wr: dict(wr, record=edit(wr['record'])), logical_root=w.body.ROOTS[family])


def rsrc(w, family, key, edit):
    return rewrite(w, w.source, family, key, lambda wr: dict(wr, record=edit(wr['record'])),
                   logical_root=w.source.ROOTS[family])


def delete_cell(w, table, key):
    cell = w.storage.cell(table, key)
    w.storage.transact([dict(table=table, key=key, expected=cell['version'], delete=True)])


def body_read(w, g):
    return lambda: w.body.read_body(g['scope'], g['user'], g['user_permission'])


def _after(f, recompute=True):
    def edit(p):
        a = f(dict(p['after_record']))
        if recompute:
            a['currentness_hash'] = O.currentness(a)
        p['after_record'] = a
        return p
    return edit


def _accepted(f, recompute=True):
    def edit(p):
        r = f(dict(p['accepted_revision']))
        if recompute:
            r['revision_hash'] = O.revision_hash(r)
        p['accepted_revision'] = r
        return p
    return edit


def tamper_pending(w, g, adm, edit, recompute_intent=True):
    """Coherently substitute the stored reservation: control row, intent and the
    reserved progress commitments all recomputed; only the named field is wrong."""
    def ce(c):
        p = edit(copy.deepcopy(c['pending']))
        if recompute_intent:
            p['intent_sha256'] = O.intent_sha(p)
        return dict(c, pending=p)
    new = rewrite(w, w.body, O.T_CONTROL, ctl_key(g), lambda wr: dict(wr, record=ce(wr['record'])),
                  logical_root=w.body.ROOTS[O.T_CONTROL])
    rc, pi = O.wrapper_sha(new), new['record']['pending']['intent_sha256']
    rewrite_progress_all(w, g, op_of(adm), lambda r: dict(r, reserved_control_sha256=rc, pending_intent_sha256=pi)
                         if r['phase'] == 'body_reserved' else r)


for _cid, _edit, _code, _ri in (
        ('after_revision', _after(lambda a: dict(a, revision=a['revision'] + 1)), 'after_revision', True),
        ('after_identity', _after(lambda a: dict(a, created_at='2000-01-01T00:00:00.000Z')), 'after_identity', True),
        ('after_updated_at', _after(lambda a: dict(a, updated_at='2000-01-01T00:00:00.000Z')), 'after_updated_at', True),
        ('after_currentness', _after(lambda a: dict(a, objective_text='substituted'), recompute=False),
         'after_currentness', True),
        ('accepted_text', _accepted(lambda r: dict(r, objective_text='substituted')), 'accepted_text', True),
        ('accepted_prior', _accepted(lambda r: dict(r, prior_revision_hash='4' * 64)), 'accepted_prior', True),
        ('accepted_hash', _accepted(lambda r: dict(r, revision_hash='5' * 64), recompute=False), 'accepted_hash', True),
        ('origin_revision', lambda p: dict(p, origin=dict(p['origin'], goal_revision=p['origin']['goal_revision'] + 3)),
         'origin_revision', True),
        ('intent_not_recomputed', lambda p: dict(p, external_authority_ref='TEST_ONLY:substituted'), 'intent', False)):
    def _make(edit=_edit, ri=_ri):
        def make(d):
            w, g, req, adm, ag = _upto(d, 'reserve')
            tamper_pending(w, g, adm, edit, recompute_intent=ri)
            return w, lambda: w.command.commit(adm)
        return make
    case('U5', 'U5/G/commit_pending_' + _cid, 'negative', 'dgu/body/commit/' + _code)(_make())


@case('U5', 'U5/G/commit_reserved_control_substituted', 'negative', 'dgu/body/commit/reserved_control_preimage')
def g_commit_preimage(d):
    w, g, req, adm, ag = _upto(d, 'reserve')
    ctl = w.body.read_private(g['scope'], 'o')['control']
    bad = copy.deepcopy(ctl)
    bad['control_epoch'] += 1
    return w, lambda: w.body.commit(g['scope'], bad, w.command.final_checks(adm, w.source.read_source(
        g['scope'], op_of(adm), 'o')), lambda r: [])


@case('U5', 'U5/G/commit_replay_receipt_intent', 'negative', 'dgu/body/commit/receipt_intent')
def g_commit_replay(d):
    w, g, req, adm, ag = _upto(d, 'reserve')
    ctl = w.body.read_private(g['scope'], 'o')['control']
    w.command.commit(adm)
    bad = copy.deepcopy(ctl)
    bad['pending']['intent_sha256'] = '6' * 64
    return w, lambda: w.body.commit(g['scope'], bad, [], lambda r: [])


@case('U5', 'U5/G/release_reserved_control_substituted', 'negative', 'dgu/body/release/reserved_control_preimage')
def g_release_preimage(d):
    w, g, req, adm, ag = _upto(d, 'reserve')
    bad = copy.deepcopy(w.body.read_private(g['scope'], 'o')['control'])
    bad['control_epoch'] += 1
    return w, lambda: w.body.release(g['scope'], bad, lambda c: [])


@case('U5', 'U5/G/command_reservation_missing', 'negative', 'dgu/command/commit/reservation_missing')
def g_res_missing(d):
    w, g, req, adm, ag = _upto(d, 'reserve')
    w.body.release(g['scope'], w.body.read_private(g['scope'], 'o')['control'], lambda c: [])
    return w, lambda: w.command.commit(adm)


@case('U5', 'U5/G/cancel_reservation_missing', 'negative', 'dgu/command/cancel/reservation_missing')
def g_cancel_missing(d):
    w, g, req, adm, ag = _upto(d, 'reserve')
    w.body.release(g['scope'], w.body.read_private(g['scope'], 'o')['control'], lambda c: [])
    return w, lambda: w.command.cancel_before_body(req['command_instance_id'])


@case('U5', 'U5/G/reserved_control_commitment', 'negative', 'dgu/command/commit/reserved_control_commitment')
def g_rc_commit(d):
    w, g, req, adm, ag = _upto(d, 'reserve')
    rewrite_progress_all(w, g, op_of(adm), lambda r: dict(r, reserved_control_sha256='7' * 64)
                         if r['phase'] == 'body_reserved' else r)
    return w, lambda: w.command.commit(adm)


@case('U5', 'U5/G/reserve_conflicting_reservation', 'negative', 'dgu/body/reserve/conflicting_reservation')
def g_conflict(d):
    w, g = _goal(d)
    ra = O.direct_request(w, g, 'a')
    rb = O.direct_request(w, g, 'b')
    adm_a, _ = w.command.admit_and_capture(ra)
    adm_b, _ = w.command.admit_and_capture(rb)
    w.command.reserve(adm_a)
    return w, lambda: w.command.reserve(adm_b)


def _cancel_ref(c):
    return dict(c, cancellation_receipt_ref='TEST_ONLY:cancellation-receipt')


@case('U5', 'U5/G/capture_cancellation_associated', 'negative', 'dgu/source/capture/cancellation_associated')
def g_cap_cancel(d):
    w, g = _goal(d)
    rbody(w, O.T_CONTROL, ctl_key(g), _cancel_ref)
    req = O.direct_request(w, g, 'x')
    return w, admitted(w, req)


@case('U5', 'U5/G/reserve_cancellation_associated', 'negative', 'dgu/body/reserve/cancellation_associated')
def g_res_cancel(d):
    w, g = _goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    rbody(w, O.T_CONTROL, ctl_key(g), _cancel_ref)
    return w, lambda: w.command.reserve(adm)


def _direct_pending(w, g, adm, edit):
    src = w.source.read_source(g['scope'], op_of(adm), 'o')
    cur = w.body.read_private(g['scope'], 'o')
    p = w.command._pending(adm, src, cur, 'o')
    p = edit(p)
    return p


@case('U5', 'U5/G/reserve_intent_substituted', 'negative', 'dgu/body/reserve/intent')
def g_res_intent(d):
    w, g = _goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    p = _direct_pending(w, g, adm, lambda p: dict(p, intent_sha256='8' * 64))
    return w, lambda: w.body.reserve(g['scope'], p, lambda c: [])


@case('U5', 'U5/G/reserve_stale_currentness', 'negative', 'dgu/body/reserve/stale_currentness')
def g_res_cur(d):
    w, g = _goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)

    def edit(p):
        p = dict(p, expected_currentness_hash='9' * 64)
        p['intent_sha256'] = O.intent_sha(p)
        return p
    p = _direct_pending(w, g, adm, edit)
    return w, lambda: w.body.reserve(g['scope'], p, lambda c: [])


@case('U5', 'U5/G/command_reserve_stop_latched', 'negative', 'dgu/command/reserve/manual_stop_latched')
def g_cmd_stop(d):
    w, g = _goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    w.stops.stop(g['scope']['goal_id'])
    return w, lambda: w.command.reserve(adm)


@case('U5', 'U5/G/command_reserve_stop_epoch', 'negative', 'dgu/command/reserve/stop_epoch')
def g_cmd_stop_epoch(d):
    w, g = _goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    w.stops.stop(g['scope']['goal_id'])
    w.stops.resume(g['scope']['goal_id'])
    return w, lambda: w.command.reserve(adm)


@case('U5', 'U5/G/commit_stop_epoch_after_resume', 'negative', 'dgu/body/commit/stop_epoch')
def g_commit_stop_epoch(d):
    w, g, req, adm, ag = _upto(d, 'reserve')
    w.stops.stop(g['scope']['goal_id'])
    w.stops.resume(g['scope']['goal_id'])
    return w, lambda: w.command.commit(adm)


@case('U5', 'U5/G/commit_approval_authority_substituted', 'negative', 'dgu/body/commit/approval_authority')
def g_appr_auth(d):
    w, g, req, adm, ag = _upto(d, 'reserve', agent=True)
    cur = w.approvals.state(ag['approval_id'])
    w.approvals.put(ag['approval_id'], dict(cur, resolution=dict(
        cur['resolution'], protected_person_decision_ref='protected-person:TEST_ONLY:other')))
    return w, lambda: w.command.commit(adm)


@case('U5', 'U5/G/commit_owner_epoch_changed', 'negative', 'dgu/body/commit/owner_epoch')
def g_owner_epoch(d):
    w, g, req, adm, ag = _upto(d, 'reserve')
    w.body.advance_owner_epoch()
    return w, lambda: w.command.commit(adm)


@case('U5', 'U5/G/capture_request_conflict', 'negative', 'dgu/source/capture/request_conflict')
def g_cap_conflict(d):
    w, g = _goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    bad = copy.deepcopy(adm)
    bad['request']['objective_text'] = 'substituted'
    return w, lambda: w.source.capture(bad, lambda cur, where: w.command.acceptance_evidence(bad, cur, where=where))


@case('U5', 'U5/G/capture_pending_reservation', 'negative', 'dgu/source/capture/pending_reservation')
def g_cap_pending(d):
    w, g = _goal(d)
    w.command.run(O.direct_request(w, g, 'a'), stop_after='reserve')
    cur = w.body.read_private(g['scope'], 'o')['body']
    req = O.direct_request(w, g, 'b', expected=(cur['revision'], cur['currentness_hash']))
    return w, admitted(w, req)


@case('U5', 'U5/G/freeze_wrong_phase', 'negative', 'dgu/producer/freeze/phase')
def g_freeze_phase(d):
    w, g = _goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    return w, lambda: w.producer.freeze(g['scope'], op_of(adm))


@case('U5', 'U5/G/publish_wrong_phase', 'negative', 'dgu/producer/publish/phase')
def g_publish_phase(d):
    w, g, req, adm, ag = _upto(d, 'commit')
    return w, lambda: w.producer.publish(g['scope'], op_of(adm))


@case('U5', 'U5/G/freeze_accepted_source_substituted', 'negative', 'dgu/producer/freeze/accepted_source')
def g_freeze_acc(d):
    w, g, req, adm, ag = _upto(d, 'commit')
    sc = g['scope']
    rbody(w, O.T_REV, O.rev_key(sc['project_id'], sc['goal_id'], 2), lambda r: dict(
        r, source_message_id='TEST_ONLY:message:substituted', change_source='agent_proposed_user_approved',
        approval_id='approval:TEST_ONLY:substituted'))
    return w, lambda: w.producer.freeze(sc, op_of(adm))


@case('U5', 'U5/G/publish_frozen_identity_substituted', 'negative', 'dgu/producer/publish/frozen_identity')
def g_frozen_id(d):
    w, g, req, adm, ag = _upto(d, 'freeze')
    rewrite_progress_all(w, g, op_of(adm), lambda r: r if r['producer_input'] is None else dict(
        r, producer_input=dict(r['producer_input'], event_id='goal.updated.v1:' + 'a' * 64)))
    return w, lambda: w.producer.publish(g['scope'], op_of(adm))


@case('U5', 'U5/G/progress_epoch_edge', 'negative', 'dgu/oracle/epoch_edge')
def g_epoch_edge(d):
    w, g = _goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    p = progress(w, g, op_of(adm))
    return w, lambda: w.source.advance(g['scope'], op_of(adm), dict(p, progress_epoch=5, phase='no_effect'),
                                       expected_phase=('source_admitted',), where='dgu/oracle')


@case('U5', 'U5/G/progress_phase_edge', 'negative', 'dgu/oracle/phase_edge')
def g_phase_edge(d):
    w, g, req, adm, ag = _upto(d, 'commit')
    p = progress(w, g, op_of(adm))
    return w, lambda: w.source.advance(g['scope'], op_of(adm), dict(p, progress_epoch=p['progress_epoch'] + 1,
                                                                    phase='no_effect', body_commit=None),
                                       expected_phase=('source_admitted', 'body_reserved'), where='dgu/oracle')


# body reader integrity (coherent at-rest substitutions)
for _cid, _edit, _code in (
        ('control_body_bytes', lambda c: dict(c, body_sha256='b' * 64), 'control_body_bytes'),
        ('control_scope', lambda c: dict(c, thread_id='thr_TEST_ONLY_other'), 'control_scope'),
        ('control_head', lambda c: dict(c, current_revision=c['current_revision'] + 4), 'control_head'),
        ('control_body_key', lambda c: dict(c, body_key='goal_record.v2:00:00'), 'control_body_key'),
        ('accepted_head', lambda c: dict(c, latest_objective_revision=1), 'accepted_head')):
    def _mk(edit=_edit):
        def make(d):
            w, g = _goal(d)
            run_direct(w, g)
            rbody(w, O.T_CONTROL, ctl_key(g), edit)
            return w, body_read(w, g)
        return make
    case('U5', 'U5/G/reader_' + _cid, 'negative', 'dgu/reader/body/' + _code)(_mk())


@case('U5', 'U5/G/reader_history_chain', 'negative', 'dgu/reader/body/history_chain')
def g_hist_chain(d):
    w, g = _goal(d)
    run_direct(w, g)
    sc = g['scope']
    rbody(w, O.T_REV, O.rev_key(sc['project_id'], sc['goal_id'], 2), lambda r: (lambda x: dict(
        x, revision_hash=O.revision_hash(x)))(dict(r, prior_revision_hash='c' * 64)))
    return w, body_read(w, g)


@case('U5', 'U5/G/reader_origin_join', 'negative', 'dgu/reader/body/origin_join')
def g_origin_join(d):
    w, g = _goal(d)
    run_direct(w, g)
    sc = g['scope']
    rbody(w, O.T_ORIGIN, O.origin_key(sc['project_id'], sc['goal_id'], 2), lambda o: dict(o, goal_revision=3))
    return w, body_read(w, g)


@case('U5', 'U5/G/reader_missing_history', 'negative', 'dgu/reader/body/missing_history')
def g_missing_hist(d):
    w, g = _goal(d)
    sc = g['scope']
    delete_cell(w, O.T_REV, O.rev_key(sc['project_id'], sc['goal_id'], 1))
    return w, body_read(w, g)


@case('U5', 'U5/G/reader_current_objective', 'negative', 'dgu/reader/body/current_objective')
def g_cur_obj(d):
    w, g = _goal(d)
    nb = rbody(w, O.T_BODY, bkey(g), lambda b: (lambda x: dict(x, currentness_hash=O.currentness(x)))(
        dict(b, objective_text='coherently substituted')))['record']
    rbody(w, O.T_CONTROL, ctl_key(g), lambda c: dict(c, body_sha256=O.body_bytes_sha(nb),
                                                    currentness_hash=nb['currentness_hash']))
    return w, body_read(w, g)


@case('U5', 'U5/G/reader_body_row_unavailable', 'negative', 'dgu/reader/body/goal_body_record_unavailable')
def g_row_unavail(d):
    w, g = _goal(d)
    delete_cell(w, O.T_BODY, bkey(g))
    return w, body_read(w, g)


@case('U5', 'U5/G/reader_receipt_scope', 'negative', 'dgu/reader/receipt/receipt_scope')
def g_receipt_scope(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    rr = progress(w, g, op_of(adm))['body_commit']['receipt_request']
    rbody(w, O.T_RECEIPT, O.receipt_key(rr['project_id'], rr['goal_id'], rr['operation_id']),
          lambda r: dict(r, storage_instance_id='22222222-2222-4222-8222-222222222222'))
    return w, lambda: w.body.read_receipt(rr, g['user'], g['user_permission'])


def _audit_call(w, g, adm, kind='current_progress'):
    return lambda: w.source.read_audit(_audit_req(g, op_of(adm), kind), g['user'], g['user_permission'])


@case('U4', 'U4/G/audit_source_scope', 'negative', 'dgu/reader/audit/source_scope')
def g_src_scope(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    rsrc(w, O.T_SOURCE, O.upd_key(O.T_SOURCE, g['scope'], op_of(adm)), lambda s: dict(s, thread_id='thr_other'))
    return w, _audit_call(w, g, adm)


@case('U4', 'U4/G/audit_source_join', 'negative', 'dgu/reader/audit/source_join')
def g_audit_join(d):
    w, g, req, adm, ag = _upto(d, 'publish')
    rewrite_progress_all(w, g, op_of(adm), lambda r: dict(r, source_audit_sha256='d' * 64))
    return w, _audit_call(w, g, adm)


@case('U4', 'U4/G/audit_terminal_progress_join', 'negative', 'dgu/reader/audit/terminal_progress_join')
def g_term_join(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    tkey = O.upd_key(O.T_TERMINAL, g['scope'], op_of(adm))
    rewrite(w, w.sir, O.T_TERMINAL, tkey, lambda wr: dict(wr, record=dict(wr['record'], terminal_progress_sha256='e' * 64)),
            logical_root=O.UPDATE_URI + '#/$defs/StorageTerminal')
    return w, _audit_call(w, g, adm, 'terminal_members')


@case('U4', 'U4/G/audit_progress_unavailable', 'negative', 'dgu/reader/audit/progress_unavailable')
def g_prog_unavail(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    delete_cell(w, O.T_PROGRESS, O.head_key(g['scope'], op_of(adm)))
    return w, _audit_call(w, g, adm)


@case('U4', 'U4/G/audit_head_record_substituted', 'negative', 'dgu/reader/audit/head_record')
def g_head_record(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    sc, op = g['scope'], op_of(adm)
    snap = w.source.unwrap_row(O.T_PROGRESS, O.epoch_key(sc, op, 4), w.storage.cell(O.T_PROGRESS, O.epoch_key(sc, op, 4))
                               ['value'], w.source.ROOTS[O.T_PROGRESS])
    hk = O.head_key(sc, op)
    cell = w.storage.cell(O.T_PROGRESS, hk)
    w.storage.transact([dict(table=O.T_PROGRESS, key=hk, expected=cell['version'],
                             value=w.source.physical(O.T_PROGRESS, hk, snap, 'authority_indefinite'))])
    return w, _audit_call(w, g, adm)


@case('U4', 'U4/G/audit_snapshot_unavailable', 'negative', 'dgu/reader/audit/snapshot_unavailable')
def g_snap_unavail(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    delete_cell(w, O.T_PROGRESS, O.epoch_key(g['scope'], op_of(adm), 4))
    return w, _audit_call(w, g, adm)


@case('U4', 'U4/G/audit_snapshot_record_substituted', 'negative', 'dgu/reader/audit/snapshot_record')
def g_snap_record(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    sc, op = g['scope'], op_of(adm)
    s3 = w.source.unwrap_row(O.T_PROGRESS, O.epoch_key(sc, op, 3), w.storage.cell(O.T_PROGRESS, O.epoch_key(sc, op, 3))
                             ['value'], w.source.ROOTS[O.T_PROGRESS])
    k4 = O.epoch_key(sc, op, 4)
    cell = w.storage.cell(O.T_PROGRESS, k4)
    w.storage.transact([dict(table=O.T_PROGRESS, key=k4, expected=cell['version'],
                             value=w.source.physical(O.T_PROGRESS, k4, s3, 'authority_indefinite'))])
    return w, _audit_call(w, g, adm)


@case('U4', 'U4/G/audit_head_snapshot_commitment', 'negative', 'dgu/reader/audit/head_snapshot')
def g_head_snap(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    rsrc(w, O.T_PROGRESS, O.head_key(g['scope'], op_of(adm)), lambda h: dict(h, snapshot_sha256='f' * 64))
    return w, _audit_call(w, g, adm)


@case('U4', 'U4/G/input_unavailable_disposed', 'negative', 'dgu/reader/input/input_unavailable')
def g_input_unavail(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    delete_cell(w, O.T_INPUT, O.upd_key(O.T_INPUT, g['scope'], op_of(adm)))
    return w, _input_call(w, g, op_of(adm))


@case('U4', 'U4/G/input_source_join', 'negative', 'dgu/reader/input/source_join')
def g_input_join(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    rsrc(w, O.T_INPUT, O.upd_key(O.T_INPUT, g['scope'], op_of(adm)), lambda r: dict(r, source_audit_sha256='0' * 64))
    return w, _input_call(w, g, op_of(adm))


@case('U4', 'U4/G/input_foreign_storage', 'negative', 'dgu/reader/input/foreign_storage')
def g_input_foreign(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    r = dict(reader_binding='reader.goal.update_input@1.0.0', operation_id=op_of(adm),
             **dict(g['scope'], storage_instance_id='33333333-3333-4333-8333-333333333333'))
    return w, lambda: w.source.read_input_content(r, g['user'], g['user_permission'])


# inspector joins
@case('U4', 'U4/G/inspect_request_unknown_event', 'negative', 'dgu/inspect/event_unavailable')
def g_req_unknown(d):
    w, g = _goal(d)
    return w, lambda: w.inspector.request_for(g['scope'], 'goal.updated.v1:' + '1' * 64)


@case('U4', 'U4/G/inspect_event_scope', 'negative', 'dgu/inspect/event_scope')
def g_ev_scope(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    r = _raw_goal_event(w, g, adm, lambda p: dict(p, thread_id='thr_TEST_ONLY_other'))
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U4', 'U4/G/inspect_source_action', 'negative', 'dgu/inspect/source_action')
def g_ev_action(d):
    w, g = _goal(d)
    req, adm = run_direct(w, g)
    r = _raw_goal_event(w, g, adm, lambda p: dict(p, original_action_ref='request:TEST_ONLY:substituted'))
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


@case('U4', 'U4/G/inspect_progress_not_issued', 'negative', 'dgu/inspect/original_custody_unavailable')
def g_ev_not_issued(d):
    import pm_goal_test_reopen as RO
    w, g, req, adm, ag = _upto(d, 'freeze')
    cand = copy.deepcopy(progress(w, g, op_of(adm))['producer_input'])
    tag = os.urandom(6).hex()
    cand['event_id'] = 'goal.updated.v1:' + O.sha(tag.encode())
    cand['idempotency_key'] = 'goal.updated.command.v1:' + O.sha(tag.encode())
    RO.run_protocol(w.storage, dict(operation_id='TEST_ONLY:raw:' + tag, request=dict(tag=tag), candidates=[cand],
                                    terminal=dict(table='TEST_ONLY:raw', key=tag, value=dict(tag=tag))))
    r = w.inspector.request_for(g['scope'], cand['event_id'])
    return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])


for _cid, _edit, _code in (
        ('first_receipt', lambda r: dict(r, publication=dict(r['publication'], first_append_receipt=dict(
            r['publication']['first_append_receipt'], byte_offset=r['publication']['first_append_receipt']['byte_offset'] + 1)))
         if r['publication'] else r, 'first_receipt'),
        ('full_value', lambda r: dict(r, publication=dict(r['publication'], original_event_value_commitment=dict(
            r['publication']['original_event_value_commitment'], sha256='1' * 64))) if r['publication'] else r, 'full_value'),
        ('source_join', lambda r: dict(r, source_audit_sha256='2' * 64), 'source_join'),
        ('body_receipt', lambda r: dict(r, body_commit=dict(r['body_commit'], receipt_sha256='3' * 64))
         if r['body_commit'] else r, 'body_receipt')):
    def _mk(edit=_edit):
        def make(d):
            w, g, req, adm, ag = _upto(d, 'publish')
            ev = event_of(w, g, adm)
            rewrite_progress_all(w, g, op_of(adm), edit)
            r = w.inspector.request_for(g['scope'], ev)
            return w, lambda: w.inspector.inspect(r, g['user'], g['user_permission'])
        return make
    case('U4', 'U4/G/inspect_' + _cid, 'negative', 'dgu/inspect/' + _code)(_mk())


# SIR terminal joins (U3: the immutable terminal only from genuine original effects)
@case('U3', 'U3/G/terminal_source_join', 'negative', 'dgu/sir/terminal/source_join')
def g_t_source(d):
    w, g, req, adm, ag = _upto(d, 'publish')
    rsrc(w, O.T_SOURCE, O.upd_key(O.T_SOURCE, g['scope'], op_of(adm)), lambda s: dict(s, captured_at=w.now()))
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'succeeded')


@case('U3', 'U3/G/terminal_receipt_join', 'negative', 'dgu/sir/terminal/receipt_join')
def g_t_receipt(d):
    w, g, req, adm, ag = _upto(d, 'publish')
    rr = progress(w, g, op_of(adm))['body_commit']['receipt_request']
    rbody(w, O.T_RECEIPT, O.receipt_key(rr['project_id'], rr['goal_id'], rr['operation_id']),
          lambda r: dict(r, committed_at=w.now()))
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'succeeded')


@case('U3', 'U3/G/terminal_first_custody', 'negative', 'dgu/sir/terminal/first_custody')
def g_t_custody(d):
    w, g, req, adm, ag = _upto(d, 'publish')
    rewrite_progress_all(w, g, op_of(adm), lambda r: dict(r, publication=dict(r['publication'], first_append_receipt=dict(
        r['publication']['first_append_receipt'], durable_end_offset=r['publication']['first_append_receipt']['durable_end_offset'] + 1)))
        if r['publication'] else r)
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'succeeded')


@case('U3', 'U3/G/terminal_no_effect_with_receipt', 'negative', 'dgu/sir/terminal/no_effect_receipt')
def g_t_ne_receipt(d):
    w, g, req, adm, ag = _upto(d, 'commit')
    p = progress(w, g, op_of(adm))
    w.source.advance(g['scope'], op_of(adm), dict(p, progress_epoch=p['progress_epoch'] + 1, phase='no_effect',
                                                  body_commit=None), expected_phase=('body_committed',), where='o')
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'no_effect')


@case('U3', 'U3/G/terminal_no_effect_with_event', 'negative', 'dgu/sir/terminal/no_effect_event')
def g_t_ne_event(d):
    import pm_goal_test_reopen as RO
    w, g = _goal(d)
    req = O.direct_request(w, g, 'x')
    adm, _ = w.command.admit_and_capture(req)
    p = progress(w, g, op_of(adm))
    cand = dict(p['producer_metadata'], payload=dict(qualification=QUALIFICATION))
    RO.run_protocol(w.storage, dict(operation_id='TEST_ONLY:raw-ne', request=dict(k=1), candidates=[cand],
                                    terminal=dict(table='TEST_ONLY:raw', key='ne', value=dict(k=1))))
    w.source.advance(g['scope'], op_of(adm), dict(p, progress_epoch=1, phase='no_effect'),
                     expected_phase=('source_admitted',), where='o')
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'no_effect')


@case('U3', 'U3/G/terminal_unknown_kind', 'negative', 'dgu/sir/terminal/unknown_kind')
def g_t_kind(d):
    w, g, req, adm, ag = _upto(d, 'publish')
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'partially_succeeded')


@case('U3', 'U3/G/terminal_unknown_command', 'negative', 'dgu/sir/terminal/admission_unavailable')
def g_t_unknown_cid(d):
    w, g = _goal(d)
    return w, lambda: w.sir.terminalize('command:TEST_ONLY:never', 'succeeded')


@case('U3', 'U3/G/terminal_unknown_head_moved_at_release', 'negative', 'dgu/sir/terminal/final_head_epoch')
def g_t_head(d):
    w, g, req, adm, ag = _upto(d, 'freeze')
    p = progress(w, g, op_of(adm))
    w.source.advance(g['scope'], op_of(adm), dict(p, progress_epoch=p['progress_epoch'] + 1, phase='event_unknown'),
                     expected_phase=('event_ready',), where='o')
    holder = {}
    inject(w, 'sir.terminalize', 'before_release', lambda w_, ctx: w_.producer.publish(g['scope'], op_of(adm)), holder)
    return w, lambda: w.sir.terminalize(req['command_instance_id'], 'unknown'), holder


# command acceptance rechecks against substituted originals
@case('U5', 'U5/G/acceptance_direct_authority_missing', 'negative', 'dgu/source/capture/acceptance/direct_authority')
def g_direct_auth(d):
    w, g = _goal(d)
    req = O.direct_request(w, g, 'x')
    w.sir.admit(req)
    key = O.hexk(req['command_instance_id'])
    w.sir.put(key, dict(w.sir.state(key), direct_save_authority_ref=None))
    return w, lambda: w.command.run(req)


@case('U5', 'U5/G/acceptance_approval_other_goal', 'negative', 'dgu/source/capture/acceptance/approval_target_scope')
def g_appr_scope(d):
    w = world(d)
    g1 = O.birth_goal(w)
    g2 = O.birth_goal(w, project=g1['scope']['project_id'], thread=g1['scope']['thread_id'] + '-b')
    req, ag = O.agent_request(w, g1, 'x')
    cur = w.body.read_private(g2['scope'], 'o')['body']
    req2 = dict(req, command_instance_id=req['command_instance_id'] + ':g2', goal_id=g2['scope']['goal_id'],
                thread_id=g2['scope']['thread_id'], expected_revision=cur['revision'],
                expected_currentness_hash=cur['currentness_hash'], permission_snapshot_ref=g2['user_permission'],
                actor_ref=g2['user'])
    return w, admitted(w, req2)


def _chat_tamper(field_edit, which):
    def make(d):
        w, g = _goal(d)
        req, ag = O.agent_request(w, g, 'x')
        w.sir.admit(req)
        mid = ag['agent_message'] if which == 'agent' else ag['instruction']
        cur = w.chat.state(mid)
        w.chat.put(mid, field_edit(cur))
        return w, lambda: w.command.run(req)
    return make


case('U5', 'U5/G/acceptance_agent_message_author_substituted', 'negative',
     'dgu/source/capture/acceptance/agent_message_author')(_chat_tamper(lambda m: dict(m, author_kind='user'), 'agent'))
case('U5', 'U5/G/acceptance_instruction_substituted', 'negative', 'dgu/source/capture/acceptance/instruction_attests')(
    _chat_tamper(lambda m: dict(m, body=dict(m['body'], replacement_text='other')), 'instruction'))


@case('U5', 'U5/G/acceptance_approval_unavailable', 'negative', 'dgu/source/capture/acceptance/approval_unavailable')
def g_appr_unavail(d):
    w, g = _goal(d)
    req, ag = O.agent_request(w, g, 'x')
    req['approval_id'] = 'approval:TEST_ONLY:never-issued'
    return w, admitted(w, req)


@case('U5', 'U5/G/acceptance_approval_request_bytes', 'negative', 'dgu/source/capture/acceptance/approval_request_bytes')
def g_appr_bytes(d):
    w, g = _goal(d)
    req, ag = O.agent_request(w, g, 'x')
    cur = w.approvals.state(ag['approval_id'])
    w.approvals.put(ag['approval_id'], dict(cur, request=dict(cur['request'], instruction_message_id='TEST_ONLY:m')))
    return w, admitted(w, req)


@case('U1', 'U1/G/owner_cell_pack_commitment', 'negative', 'dgu/owner_cell/value_sha256')
def g_cell_pack(d):
    w, g = _goal(d)
    req = O.direct_request(w, g, BIG)
    w.sir.admit(req)
    key = O.hexk(req['command_instance_id'])
    cell = w.storage.cell('dgu_sir', key)
    w.storage.transact([dict(table='dgu_sir', key=key, expected=cell['version'],
                             value=dict(cell['value'], value_sha256='4' * 64))])
    return w, lambda: w.command.run(req)


@case('U1', 'U1/G/noncanonical_pack_bytes', 'negative', 'dgu/physical/decode/numrule/physical_noncanonical')
def g_noncanon(d):
    import blake3
    w, g, op, ikey = _large(d)
    cell = w.storage.cell(O.T_INPUT, ikey)
    raw = (w.storage.root / 'packs' / cell['value']['payload_ref']['id']).read_bytes()
    check('g/fixmap', 0x80 <= raw[0] <= 0x8f)
    alt = b'\xde' + (raw[0] & 0x0f).to_bytes(2, 'big') + raw[1:]  # same map, longer (noncanonical) header
    ref = w.storage.put_pack(alt, O.MEDIA)
    rewrite_raw(w, O.T_INPUT, ikey, lambda row: dict(row, value_sha256=O.sha(alt), payload_ref=dict(
        id=ref['blake3'], size=ref['byte_size'], media_type=O.MEDIA)))
    return w, _input_call(w, g, op)


# owner API guards (TEST_ONLY owner surfaces)
def _api(fn):
    def make(d):
        w, g = _goal(d)
        return w, lambda: fn(w, g)
    return make


for _cid, _fn, _code in (
        ('inject_duplicate', lambda w, g: [w.inject('m', 'p', lambda *a: None), w.inject('m', 'p', lambda *a: None)],
         'dgu/inject/duplicate'),
        ('installation_withdraw_twice', lambda w, g: [w.installation.withdraw(), w.installation.withdraw()],
         'dgu/installation/not_installed'),
        ('installation_reinstall_installed', lambda w, g: w.installation.reinstall(), 'dgu/installation/not_withdrawn'),
        ('permission_revoke_unissued', lambda w, g: w.permissions.revoke('TEST_ONLY:permission:never'),
         'dgu/permission/unissued'),
        ('thread_delete_unborn', lambda w, g: w.threads.delete(g['scope']['project_id'], 'thr_never'), 'dgu/thread/unborn'),
        ('thread_content_unborn', lambda w, g: w.threads.require_content(dict(g['scope'], thread_id='thr_never'), 'o'),
         'o/thread_unavailable'),
        ('stop_unborn', lambda w, g: w.stops.stop('goal:never'), 'dgu/stop/unborn'),
        ('stop_current_unborn', lambda w, g: w.stops.current('goal:never'), 'dgu/stop/unborn'),
        ('stop_resume_unborn', lambda w, g: w.stops.resume('goal:never'), 'dgu/stop/resume_unborn'),
        ('plan_advance_unbound', lambda w, g: w.plans.advance_epoch(g['scope']['goal_id']), 'dgu/plan/unbound'),
        ('plan_conflict_unbound', lambda w, g: w.plans.conflict(g['scope']['goal_id']), 'dgu/plan/unbound'),
        ('chat_author_kind', lambda w, g: w.chat.post(g['scope'], 'tool', 'actor:x', {}), 'dgu/chat/author_kind'),
        ('body_start_existing_goal', lambda w, g: w.body.start(g['scope'], 'x', 'm', 'a', 'c'), 'dgu/body/start/goal_exists'),
        ('metadata_state_unknown', lambda w, g: w.lifecycle.change(g['scope'], 'archived'), 'dgu/body/metadata/state'),
        ('metadata_blocked_without_reason', lambda w, g: w.lifecycle.change(g['scope'], 'blocked'),
         'dgu/body/metadata/blocked_reason'),
        ('sir_request_not_object', lambda w, g: w.sir.admit(['not', 'an', 'object']), 'dgu/sir/request_type'),
        ('hitl_capture_unknown_proposal', lambda w, g: w.approvals.capture('proposal:never'),
         'dgu/hitl/capture/proposal_dispatch_unavailable'),
        ('hitl_decide_unissued', lambda w, g: w.approvals.decide('approval:never', 'approved', g['user_permission'], g['user']),
         'dgu/hitl/decide/unissued'),
        ('hitl_revoke_unissued', lambda w, g: w.approvals.revoke('approval:never'), 'dgu/hitl/revoke/unissued'),
        ('key_lone_surrogate', lambda w, g: w.threads.birth(g['scope']['project_id'], 'thr_\ud800'), 'dgu/key/utf8')):
    case('U5', 'U5/G/api_' + _cid, 'negative', _code)(_api(_fn))


@case('U5', 'U5/G/api_metadata_after_completed', 'negative', 'dgu/body/metadata/completed_terminal')
def g_meta_completed(d):
    w, g = _goal(d)
    w.lifecycle.change(g['scope'], 'completed')
    return w, lambda: w.lifecycle.change(g['scope'], 'active')


def _permission_neg(edit_grant, code):
    def make(d):
        w, g = _goal(d)
        ref = edit_grant(w, g)
        req = dict(O.direct_request(w, g, 'x'), permission_snapshot_ref=ref)
        return w, admitted(w, req)
    return make


case('U5', 'U5/G/permission_unissued', 'negative', 'dgu/source/capture/permission_unissued')(
    _permission_neg(lambda w, g: 'TEST_ONLY:permission:never', None))
case('U5', 'U5/G/permission_other_actor', 'negative', 'dgu/source/capture/permission_actor')(
    _permission_neg(lambda w, g: w.permissions.grant('actor:TEST_ONLY:someone-else', g['scope'], ['update_goal']), None))
case('U5', 'U5/G/permission_other_thread', 'negative', 'dgu/source/capture/permission_scope')(
    _permission_neg(lambda w, g: w.permissions.grant(g['user'], dict(g['scope'], thread_id='thr_other'), ['update_goal']),
                    None))
case('U5', 'U5/G/permission_missing_right', 'negative', 'dgu/source/capture/permission_right')(
    _permission_neg(lambda w, g: w.permissions.grant(g['user'], g['scope'], ['read_goal']), None))


def _hitl(d, decide_first=False):
    w, g, prop, ap = _proposal(d)
    return w, g, prop, ap


@case('U5', 'U5/G/hitl_decide_already_resolved', 'negative', 'dgu/hitl/decide/already_resolved')
def g_decided(d):
    w, g, prop, ap = _proposal(d)
    cap = w.approvals.capture(prop['command_instance_id'])
    person = 'actor:TEST_ONLY:person'
    pp = w.permissions.grant(person, g['scope'], ['approve_goal_update'])
    w.approvals.decide(cap['approval_id'], 'denied', pp, person)
    return w, lambda: w.approvals.decide(cap['approval_id'], 'approved', pp, person)


@case('U5', 'U5/G/hitl_decide_revoked_is_not_a_decision', 'negative', 'dgu/hitl/decide/decision')
def g_decision(d):
    w, g, prop, ap = _proposal(d)
    cap = w.approvals.capture(prop['command_instance_id'])
    person = 'actor:TEST_ONLY:person'
    pp = w.permissions.grant(person, g['scope'], ['approve_goal_update'])
    return w, lambda: w.approvals.decide(cap['approval_id'], 'revoked', pp, person)


def _prop_variant(d, edit):
    w, g, prop, ap = _proposal(d)
    p2 = edit(w, g, copy.deepcopy(prop))
    p2['command_instance_id'] = prop['command_instance_id'] + ':v'
    w.sir.admit_proposal(p2)
    return w, lambda: w.approvals.capture(p2['command_instance_id'])


@case('U5', 'U5/G/hitl_agent_actor_mismatch', 'negative', 'dgu/hitl/capture/agent_actor')
def g_agent_actor(d):
    return _prop_variant(d, lambda w, g, p: dict(p, actor_ref='actor:TEST_ONLY:other-agent'))


@case('U5', 'U5/G/hitl_agent_text_mismatch', 'negative', 'dgu/hitl/capture/agent_text')
def g_agent_text(d):
    def edit(w, g, p):
        p['target'] = dict(p['target'], objective_text='different proposed text')
        p['instruction_message_id'] = w.chat.post(g['scope'], 'user', g['user'], dict(
            kind='goal_update_instruction', goal_id=g['scope']['goal_id'], replacement_text='different proposed text'))
        return p
    return _prop_variant(d, edit)


@case('U5', 'U5/G/hitl_instruction_other_thread', 'negative', 'dgu/hitl/capture/scope')
def g_hitl_scope(d):
    def edit(w, g, p):
        p['instruction_message_id'] = w.chat.post(dict(g['scope'], thread_id='thr_TEST_ONLY_other'), 'user', g['user'],
                                                  dict(kind='goal_update_instruction', goal_id=g['scope']['goal_id'],
                                                       replacement_text=p['target']['objective_text']))
        return p
    return _prop_variant(d, edit)


@case('U5', 'U5/G/hitl_message_unavailable', 'negative', 'dgu/hitl/capture/agent/message_unavailable')
def g_msg_unavail(d):
    return _prop_variant(d, lambda w, g, p: dict(p, source_message_id='TEST_ONLY:message:never'))


@case('U5', 'U5/G/proposal_revision_float', 'negative', 'dgu/jcs/float')
def g_jcs_float(d):
    w, g, prop, ap = _proposal(d)
    p2 = copy.deepcopy(prop)
    p2['command_instance_id'] += ':f'
    p2['target']['expected_revision'] = 1.0
    return w, lambda: w.sir.admit_proposal(p2)


# ------------------------------------------------------------------ U5 fence matrix (generated)

def _m_permission(w, g, ag, ctx):
    w.permissions.revoke(g['user_permission'])


def _m_agent_permission(w, g, ag, ctx):
    w.permissions.revoke(ag['agent_permission'])


def _m_tombstone(w, g, ag, ctx):
    w.threads.delete(g['scope']['project_id'], g['scope']['thread_id'])


def _m_body(w, g, ag, ctx):
    w.lifecycle.change(g['scope'], 'paused')


def _m_stop(w, g, ag, ctx):
    w.stops.stop(g['scope']['goal_id'])


def _m_plan(w, g, ag, ctx):
    w.plans.conflict(g['scope']['goal_id'])


def _m_plan_epoch(w, g, ag, ctx):
    w.plans.advance_epoch(g['scope']['goal_id'])


def _m_approval(w, g, ag, ctx):
    w.approvals.revoke(ag['approval_id'])


def _m_install(w, g, ag, ctx):
    w.installation.withdraw()


def _m_stop_resume(w, g, ag, ctx):
    w.stops.stop(g['scope']['goal_id'])
    w.stops.resume(g['scope']['goal_id'])


def _m_release(w, g, ag, ctx):
    w.body.release(g['scope'], w.body.read_private(g['scope'], 'o')['control'], lambda c: [])


def _m_commit(w, g, ag, ctx):
    adm = w.sir.admission(ag['_cid'])
    w.command.commit(adm)


def _m_nested_freeze(w, g, ag, ctx):
    adm = w.sir.admission(ag['_cid'])
    w.producer.freeze(g['scope'], op_of(adm))


def _m_source_row(w, g, ag, ctx):
    adm = w.sir.admission(ag['_cid'])
    rewrite(w, w.source, O.T_SOURCE, O.upd_key(O.T_SOURCE, g['scope'], op_of(adm)),
            lambda wr: dict(wr, record=dict(wr['record'], captured_at=w.now())), logical_root=w.source.ROOTS[O.T_SOURCE])


def _m_checkpoint(w, g, ag, ctx):
    w.storage.new_seed()


def _m_candidate(path):
    def run(w, g, ag, ctx):
        target = ctx
        for p in path[:-1]:
            target = target[p]
        target[path[-1]] = 'TEST_ONLY:substituted-candidate'
    return run


def _prep_route(d, upto, *, agent=True, bind_plan=True):
    w = world(d)
    g = O.birth_goal(w, bind_plan=bind_plan)
    if agent:
        req, ag = O.agent_request(w, g, 'fenced edit')
        ag['agent_permission'] = ag['proposal']['permission_snapshot_ref']
    else:
        req, ag = O.direct_request(w, g, 'fenced edit'), {}
    ag['_cid'] = req['command_instance_id']
    adm = None
    if upto != 'none':
        adm = w.command.run(req, stop_after=upto) if upto != 'all' else w.command.run(req)
    return w, g, ag, req, adm


def _prep_hitl(d):
    w, g, prop, ap = _proposal(d)
    return w, g, dict(agent_permission=ap), prop, None


def _audit_req(g, op, kind='terminal_members'):
    return dict(reader_binding='reader.goal.update_command_audit@1.0.0', operation_id=op, selection=dict(kind=kind),
                **g['scope'])


FENCES = [
    # method, prepare(d) -> (w, g, ag, req, adm), invoke(w, g, ag, req, adm), helpers,
    # mutations: name -> (mutation, helper index that checks it or None, helper code, final code)
    dict(method='source.capture', prep=lambda d: _prep_route(d, 'none'),
         call=lambda w, g, ag, req, adm: w.command.admit_and_capture(req),
         helpers=['installation', 'permission', 'content', 'current_goal', 'stop', 'plan_binding', 'acceptance',
                  'producer_preparedness'],
         muts={'installation': (_m_install, 0, 'dgu/source/capture/installation_unavailable',
                                'dgu/source/capture/final/installation_unavailable'),
               'permission': (_m_permission, 1, 'dgu/source/capture/permission_revoked',
                              'dgu/source/capture/final/permission_revoked'),
               'tombstone': (_m_tombstone, 2, 'dgu/source/capture/content_unavailable',
                             'dgu/source/capture/final/content_unavailable'),
               'body': (_m_body, 3, 'dgu/source/capture/stale_goal_revision', 'dgu/source/capture/final_goal'),
               'stop': (_m_stop, 4, 'dgu/source/capture/manual_stop_latched', 'dgu/source/capture/final_stop'),
               'stop_epoch': (_m_stop_resume, 'from:4', None, 'dgu/source/capture/final_stop_epoch'),
               'plan': (_m_plan, 5, 'dgu/source/capture/plan_material_conflict', 'dgu/source/capture/final_plan'),
               'approval': (_m_approval, 6, 'dgu/source/capture/acceptance/approval_revoked',
                            'dgu/source/capture/final/acceptance/approval_revoked'),
               'candidate': (_m_candidate(['source', 'return_route_ref']), None, None,
                             'dgu/source/capture/final_candidate')}),
    dict(method='body.reserve', prep=lambda d: _prep_route(d, 'none'),
         pre=lambda w, g, ag, req: w.command.admit_and_capture(req)[0],
         call=lambda w, g, ag, req, adm: w.command.reserve(adm), helpers=['read_private'],
         muts={'body': (_m_body, None, None, 'dgu/body/reserve/final_control_preimage'),
               'stop': (_m_stop, None, None, 'dgu/body/reserve/final_stop'),
               'stop_epoch': (_m_stop_resume, None, None, 'dgu/body/reserve/final_stop_epoch'),
               'installation': (_m_install, 0.5, 'dgu/body/reserve/installation_unavailable',
                                'dgu/body/reserve/final/installation_unavailable'),
               'candidate': (_m_candidate(['control', 'pending', 'external_authority_ref']), None, None,
                             'dgu/body/reserve/final_candidate')}),
    dict(method='body.commit', prep=lambda d: _prep_route(d, 'reserve'),
         call=lambda w, g, ag, req, adm: w.command.commit(adm),
         helpers=['read_private', 'approval', 'permission', 'stop', 'content', 'plan', 'installation', 'owner_epoch'],
         muts={'approval': (_m_approval, 1, 'dgu/body/commit/approval/approval_revoked',
                            'dgu/body/commit/final/approval/approval_revoked'),
               'permission': (_m_permission, 2, 'dgu/body/commit/permission_revoked',
                              'dgu/body/commit/final/permission_revoked'),
               'stop': (_m_stop, 3, 'dgu/body/commit/manual_stop_latched', 'dgu/body/commit/final/manual_stop_latched'),
               'stop_epoch': (_m_stop_resume, 3, 'dgu/body/commit/stop_epoch', 'dgu/body/commit/final/stop_epoch'),
               'control': (_m_release, None, None, 'dgu/body/commit/final_control_preimage'),
               'tombstone': (_m_tombstone, 4, 'dgu/body/commit/content_unavailable',
                             'dgu/body/commit/final/content_unavailable'),
               'plan': (_m_plan, 5, 'dgu/body/commit/plan_material_conflict',
                        'dgu/body/commit/final/plan_material_conflict'),
               'plan_epoch': (_m_plan_epoch, 5, 'dgu/body/commit/plan_epoch', 'dgu/body/commit/final/plan_epoch'),
               'installation': (_m_install, 6, 'dgu/body/commit/installation_unavailable',
                                'dgu/body/commit/final/installation_unavailable'),
               'candidate': (_m_candidate(['after', 'objective_text']), None, None, 'dgu/body/commit/final_candidate')}),
    dict(method='body.release', prep=lambda d: _prep_route(d, 'reserve'),
         call=lambda w, g, ag, req, adm: w.command.cancel_before_body(req['command_instance_id']),
         helpers=['read_private'],
         muts={'candidate': (_m_candidate(['control', 'goal_id']), None, None, 'dgu/body/release/final_candidate'),
               'control': (_m_commit, None, None, 'dgu/body/release/final_control_preimage')}),
    dict(method='producer.freeze', prep=lambda d: _prep_route(d, 'commit'),
         call=lambda w, g, ag, req, adm: w.producer.freeze(g['scope'], op_of(adm)),
         helpers=['progress', 'source', 'receipt', 'accepted_revision'],
         muts={'candidate': (_m_candidate(['producer_input', 'correlation_id']), None, None,
                             'dgu/producer/freeze/final_candidate'),
               'progress': (_m_nested_freeze, None, None, 'dgu/producer/freeze/final_head')}),
    dict(method='producer.publish', prep=lambda d: _prep_route(d, 'freeze'),
         call=lambda w, g, ag, req, adm: w.producer.publish(g['scope'], op_of(adm)), helpers=['progress', 'installation'],
         muts={'installation': (_m_install, 1, 'dgu/producer/publish/installation_unavailable',
                                'dgu/producer/publish/final/installation_unavailable'),
               'candidate': (_m_candidate(['candidate', 'correlation_id']), None, None,
                             'dgu/producer/publish/final_candidate')}),
    dict(method='sir.terminalize', prep=lambda d: _prep_route(d, 'publish'),
         call=lambda w, g, ag, req, adm: w.sir.terminalize(req['command_instance_id'], 'succeeded'),
         helpers=['read_source', 'read_progress', 'read_receipt'],
         muts={'installation': (_m_install, None, None, 'dgu/sir/terminal/final/installation_unavailable'),
               'candidate': (_m_candidate(['terminal', 'terminal_authority_ref']), None, None,
                             'dgu/sir/terminal/final_candidate')}),
    dict(method='reader.body', prep=lambda d: _prep_route(d, 'all'),
         call=lambda w, g, ag, req, adm: w.body.read_body(g['scope'], g['user'], g['user_permission']),
         helpers=['permission', 'content', 'read_private'],
         muts={'permission': (_m_permission, 0, 'dgu/reader/body/permission_revoked',
                              'dgu/reader/body/final/permission_revoked'),
               'tombstone': (_m_tombstone, 1, 'dgu/reader/body/content_unavailable',
                             'dgu/reader/body/final/content_unavailable'),
               'body': (_m_body, 'from:2', None, 'dgu/reader/body/final_currentness'),
               'installation': (_m_install, None, None, 'dgu/reader/body/final/installation_unavailable'),
               'candidate': (_m_candidate(['body', 'objective_text']), None, None, 'dgu/reader/body/final_currentness')}),
    dict(method='reader.history', prep=lambda d: _prep_route(d, 'all'),
         call=lambda w, g, ag, req, adm: w.body.read_history(g['scope'], g['user'], g['user_permission']),
         helpers=['permission', 'content', 'read_private'],
         muts={'permission': (_m_permission, 0, 'dgu/reader/history/permission_revoked',
                              'dgu/reader/history/final/permission_revoked'),
               'tombstone': (_m_tombstone, 1, 'dgu/reader/history/content_unavailable',
                             'dgu/reader/history/final/content_unavailable'),
               'candidate': (_m_candidate(['revisions']), None, None, 'dgu/reader/history/final_history')}),
    dict(method='reader.receipt', prep=lambda d: _prep_route(d, 'all'),
         call=lambda w, g, ag, req, adm: w.body.read_receipt(progress(w, g, op_of(adm))['body_commit']['receipt_request'],
                                                             g['user'], g['user_permission']),
         helpers=['read_receipt', 'audit_permission'],
         muts={'permission': (_m_permission, 1, 'dgu/reader/receipt/permission_revoked',
                              'dgu/reader/receipt/final/permission_revoked'),
               'installation': (_m_install, None, None, 'dgu/reader/receipt/final/installation_unavailable'),
               'candidate': (_m_candidate(['wrapper', 'schema_version']), None, None, 'dgu/reader/receipt/final_receipt')}),
    dict(method='reader.audit', prep=lambda d: _prep_route(d, 'all'),
         call=lambda w, g, ag, req, adm: w.source.read_audit(_audit_req(g, op_of(adm)), g['user'], g['user_permission']),
         helpers=['audit_permission', 'source', 'progress'],
         muts={'permission': (_m_permission, 0, 'dgu/reader/audit/permission_revoked',
                              'dgu/reader/audit/final/permission_revoked'),
               'installation': (_m_install, None, None, 'dgu/reader/audit/final/installation_unavailable'),
               'candidate': (_m_candidate(['out', 'action_authority']), None, None, 'dgu/reader/audit/final_candidate'),
               'source': (_m_source_row, 'from:1', None, 'dgu/reader/audit/final_source')}),
    dict(method='reader.input', prep=lambda d: _prep_route(d, 'all'),
         call=lambda w, g, ag, req, adm: _input_call(w, g, op_of(adm))(),
         helpers=['content_permission', 'content', 'source', 'input'],
         muts={'permission': (_m_permission, 0, 'dgu/reader/input/permission_revoked',
                              'dgu/reader/input/final/permission_revoked'),
               'tombstone': (_m_tombstone, 1, 'dgu/reader/input/content_unavailable',
                             'dgu/reader/input/final/content_unavailable'),
               'installation': (_m_install, None, None, 'dgu/reader/input/final/installation_unavailable'),
               'candidate': (_m_candidate(['out', 'action_authority']), None, None, 'dgu/reader/input/final_candidate')}),
    dict(method='inspect', prep=lambda d: _prep_route(d, 'all'),
         call=lambda w, g, ag, req, adm: w.inspector.inspect(w.inspector.request_for(g['scope'], event_of(w, g, adm)),
                                                             g['user'], g['user_permission']),
         helpers=['audit_permission', 'installation', 'generic_source', 'source_audit', 'progress', 'body_receipt'],
         muts={'permission': (_m_permission, 0, 'dgu/inspect/permission_revoked', 'dgu/inspect/final/permission_revoked'),
               'installation': (_m_install, 1, 'dgu/inspect/installation_unavailable',
                                'dgu/inspect/final/installation_unavailable'),
               'checkpoint': (_m_checkpoint, 'from:2', None, 'dgu/inspect/final_checkpoint'),
               'candidate': (_m_candidate(['observation', 'event_id']), None, None, 'dgu/inspect/final_candidate')}),
    dict(method='hitl.capture', prep=_prep_hitl,
         call=lambda w, g, ag, req, adm: w.approvals.capture(req['command_instance_id']),
         helpers=['proposal_dispatch', 'agent_message', 'instruction_message', 'current_goal'],
         muts={'body': (_m_body, 3, 'dgu/hitl/capture/stale_target', 'dgu/hitl/capture/final_target'),
               'permission': (_m_agent_permission, 3.5, 'dgu/hitl/capture/permission_revoked',
                              'dgu/hitl/capture/final/permission_revoked'),
               'tombstone': (_m_tombstone, 3.6, 'dgu/hitl/capture/content_unavailable',
                             'dgu/hitl/capture/final/content_unavailable'),
               'installation': (_m_install, None, None, 'dgu/hitl/capture/final/installation_unavailable'),
               'candidate': (_m_candidate(['request', 'proposal_request_ref']), None, None,
                             'dgu/hitl/capture/final_candidate')}),
]


def _fence_case(spec, point_index, point, mname):
    mutation, idx, helper_code, final_code = spec['muts'][mname]

    def make(d):
        w, g, ag, req, adm = spec['prep'](d)
        if 'pre' in spec:
            adm = spec['pre'](w, g, ag, req)
        holder = {}
        inject(w, spec['method'], point, lambda w_, ctx: mutation(w_, g, ag, ctx), holder)
        return w, lambda: spec['call'](w, g, ag, req, adm), holder
    if point == 'before_release':
        expected = final_code
    elif type(idx) in (int, float) and idx > point_index:
        expected = helper_code
    else:
        expected = final_code
    return make, expected


def _generate_fences():
    for spec in FENCES:
        points = [(i, 'after:' + h) for i, h in enumerate(spec['helpers'])] + [(len(spec['helpers']), 'before_release')]
        for mname, (mutation, idx, helper_code, final_code) in spec['muts'].items():
            for i, point in points:
                if mname == 'candidate' and point != 'before_release':
                    continue
                if type(idx) is str and idx.startswith('from:') and point != 'before_release' and \
                        i < int(idx.split(':')[1]):
                    continue
                make, expected = _fence_case(spec, i, point, mname)
                case('U5', 'U5/F/%s/%s/%s' % (spec['method'], point, mname), 'negative', expected)(make)


_generate_fences()


# ================================================================== U3 child-process fault matrix

def summary(w, spec):
    sc, req = spec['scope'], spec['request']
    out = dict(qualification=QUALIFICATION, storage_instance_id=w.storage.storage_instance_id,
               recovered=[n['kind'] for n in getattr(w.storage, 'recovered', [])],
               manifest_generation=w.storage.manifest_generation)
    cur = w.body.read_private(sc, 'summary')
    out['body_revision'] = cur['body']['revision']
    out['history'] = [r['revision'] for r in cur['revisions']]
    out['pending_op'] = None if cur['control']['pending'] is None else cur['control']['pending']['operation_id']
    adm = w.sir.state(O.hexk(req['command_instance_id']))
    out['admitted'] = adm is not None
    if adm is None:
        out.update(classification='no_admission', receipts=0, events={}, custody={}, terminal=None)
        return out
    adm = w.sir.admission(req['command_instance_id'])
    op = op_of(adm)
    out['operation_id'] = op
    out['classification'] = w.command.classify(adm)
    out['receipts'] = int(w.storage.cell(O.T_RECEIPT, O.receipt_key(sc['project_id'], sc['goal_id'], op)) is not None)
    events = {e: O.sha(w.storage.read_frame(e)) for e in w.storage.events}
    out['events'] = events
    out['custody'] = {e: w.storage.first_custody(e)['first_append_receipt'] for e in events if w.storage.first_custody(e)}
    tcell = w.storage.cell(O.T_TERMINAL, O.upd_key(O.T_TERMINAL, sc, op))
    out['terminal'] = None if tcell is None else w.sir.unwrap_row(
        O.T_TERMINAL, O.upd_key(O.T_TERMINAL, sc, op), tcell['value'], O.UPDATE_URI + '#/$defs/StorageTerminal')['record']
    rcell = w.storage.cell(O.T_RECEIPT, O.receipt_key(sc['project_id'], sc['goal_id'], op))
    out['receipt_row_sha256'] = None if rcell is None else O.sha(O.msgpack(rcell['value']))
    return out


def child(argv):
    p = argparse.ArgumentParser()
    p.add_argument('action')
    p.add_argument('--root', required=True)
    p.add_argument('--spec', required=True)
    p.add_argument('--cut')
    p.add_argument('--storage-cut')
    a = p.parse_args(argv)
    spec_path = Path(a.spec)
    if a.action == 'create':
        w = O.World(a.root)
        route = json.loads(spec_path.read_text())['route']
        g = O.birth_goal(w)
        if route == 'agent':
            req, ag = O.agent_request(w, g, 'crash-matrix agent edit 🌿')
        else:
            req, ag = O.direct_request(w, g, 'crash-matrix direct edit 🌿'), None
        spec = dict(route=route, scope=g['scope'], user=g['user'], user_permission=g['user_permission'], request=req,
                    approval_id=None if ag is None else ag['approval_id'])
        spec_path.write_text(json.dumps(spec))
        print(json.dumps(summary(w, spec), sort_keys=True))
        return 0
    spec = json.loads(spec_path.read_text())
    faults = S.FaultPlan(cut=a.storage_cut, mode='exit') if a.storage_cut else None
    w = O.World(a.root, create=False, faults=faults, cut=a.cut, cut_mode='exit')
    req = spec['request']
    cid = req['command_instance_id']
    extra = {}
    try:
        if a.action in ('run', 'reenter'):
            w.command.run(req)
        elif a.action == 'read':
            pass
        elif a.action == 'cancel':
            w.command.cancel_before_body(cid)
        elif a.action == 'stop_cancel':
            w.stops.stop(spec['scope']['goal_id'])
            w.command.cancel_before_body(cid, error_code='manual_stop_latched', status='rejected')
        elif a.action == 'unknown':
            w.command.mark_unknown(cid)
        elif a.action == 'recover':
            extra['recovered_to'] = w.command.recover(cid)
        elif a.action == 'withdraw':
            w.installation.withdraw()
        elif a.action == 'reinstall':
            w.installation.reinstall()
        elif a.action == 'revoke_approval':
            w.approvals.revoke(spec['approval_id'])
        elif a.action == 'altered':
            w.command.run(dict(req, objective_text='altered after crash'))
        elif a.action == 'replay':
            extra['replay'] = w.sir.replay(cid)['response']
        elif a.action == 'inspect':
            adm = w.sir.admission(cid)
            ev = progress(w, dict(scope=spec['scope']), op_of(adm))['publication']['event_id']
            extra['inspected'] = w.inspector.inspect(w.inspector.request_for(spec['scope'], ev), spec['user'],
                                                     spec['user_permission'])['observation']['sequence_id']
        else:
            raise SystemExit('unknown action ' + a.action)
    except REFUSALS as error:
        extra['refusal'] = A.refusal_code(error)
    out = summary(w, spec)
    out.update(extra)
    print(json.dumps(out, sort_keys=True, ensure_ascii=False))
    return 0


def _spawn(args):
    r = subprocess.run([sys.executable, str(HERE / 'pm_goal_dg_u_oracles.py'), '--child', *args], capture_output=True,
                       text=True, cwd=str(HERE))
    out = json.loads(r.stdout.strip().splitlines()[-1]) if r.stdout.strip() else None
    return r.returncode, out, r.stderr[-1500:]


# expected read-back after the crash, per cut
CUT_ROWS = [
    dict(name='control', cut=None, storage_cut=None, exit=0, cls='terminal_succeeded', rev=2, receipts=1, events=1, custody=1),
    dict(name='after_source_capture', cut='after_source_capture', cls='source_admitted', rev=1, receipts=0, events=0, custody=0),
    dict(name='after_reserve', cut='after_reserve', cls='body_reserved', rev=1, receipts=0, events=0, custody=0, pending=True),
    dict(name='in_commit_before_tx', cut='in_commit_before_tx', cls='body_reserved', rev=1, receipts=0, events=0, custody=0,
         pending=True),
    dict(name='in_commit_after_tx', cut='in_commit_after_tx', cls='body_committed', rev=2, receipts=1, events=0, custody=0),
    dict(name='after_freeze', cut='after_freeze', cls='event_ready', rev=2, receipts=1, events=0, custody=0),
    dict(name='append_before_reservation', storage_cut='before_reservation', cls='event_ready', rev=2, receipts=1, events=0,
         custody=0),
    dict(name='append_after_reservation', storage_cut='after_reservation', cls='event_ready', rev=2, receipts=1, events=0,
         custody=0),
    dict(name='before_append', storage_cut='before_append', cls='event_ready', rev=2, receipts=1, events=0, custody=0),
    dict(name='torn_member_frame', storage_cut='torn_member_frame', cls='event_ready', rev=2, receipts=1, events=0,
         custody=0, notes=['tail_truncated']),
    dict(name='torn_commit_frame', storage_cut='torn_commit_frame', cls='event_ready', rev=2, receipts=1, events=0,
         custody=0, notes=['tail_truncated']),
    dict(name='after_append_frames', storage_cut='after_append_frames', cls='event_ready+appended_without_first_custody',
         rev=2, receipts=1, events=1, custody=0, notes=['tail_group_issued']),
    dict(name='after_append', storage_cut='after_append', cls='event_ready+appended_without_first_custody', rev=2,
         receipts=1, events=1, custody=0),
    dict(name='before_first_receipt', storage_cut='before_first_receipt', cls='event_ready+appended_without_first_custody',
         rev=2, receipts=1, events=1, custody=0),
    dict(name='after_first_receipt', storage_cut='after_first_receipt', cls='event_ready+receipted', rev=2, receipts=1,
         events=1, custody=1),
    dict(name='after_publication_progress', cut='after_publication_progress', cls='event_issued', rev=2, receipts=1,
         events=1, custody=1),
    dict(name='before_terminal', storage_cut='before_terminal', cls='event_issued', rev=2, receipts=1, events=1, custody=1),
    dict(name='after_terminal', storage_cut='after_terminal', cls='terminal_succeeded', rev=2, receipts=1, events=1,
         custody=1),
]


def _setup_row(workdir, name, route):
    root = Path(workdir) / name
    spec_path = Path(workdir) / (name + '.spec.json')
    spec_path.write_text(json.dumps(dict(route=route)))
    code, out, err = _spawn(['create', '--root', str(root), '--spec', str(spec_path)])
    if code != 0:
        raise Fail('%s: create failed %s' % (name, err))
    return root, spec_path, out


def _crash(root, spec_path, row):
    args = ['run', '--root', str(root), '--spec', str(spec_path)]
    if row.get('cut'):
        args += ['--cut', row['cut']]
    if row.get('storage_cut'):
        args += ['--storage-cut', row['storage_cut']]
    return _spawn(args)


def _converged(name, before, after, again, *, kind='terminal_succeeded', rev=2):
    check(name + ': re-entry classification ' + str(after.get('classification')), after['classification'] == kind)
    check(name + ': exactly n+1', after['body_revision'] == rev and after['receipts'] == (1 if rev == 2 else 0))
    check(name + ': one event', len(after['events']) == (1 if kind == 'terminal_succeeded' else len(before['events'])))
    for e, rcpt in before['custody'].items():
        check(name + ': first receipt unchanged', after['custody'].get(e) == rcpt)
    for e, frame in before['events'].items():
        check(name + ': frame unchanged', after['events'].get(e) == frame)
    if before.get('receipt_row_sha256'):
        check(name + ': body receipt unchanged', after['receipt_row_sha256'] == before['receipt_row_sha256'])
    if before.get('terminal'):
        check(name + ': terminal unchanged', after['terminal'] == before['terminal'])
    check(name + ': second re-entry no change', again['manifest_generation'] == after['manifest_generation'] and
          again['terminal'] == after['terminal'] and again['custody'] == after['custody'])


def matrix_row(workdir, row, route='direct'):
    name = row['name'] + ('' if route == 'direct' else '-agent')
    root, spec_path, created = _setup_row(workdir, name, route)
    code, out, err = _crash(root, spec_path, row)
    check('%s: exit %s expected %s %s' % (name, code, row.get('exit', S.CRASH_EXIT), err[-300:]),
          code == row.get('exit', S.CRASH_EXIT))
    code, before, err = _spawn(['read', '--root', str(root), '--spec', str(spec_path)])
    check(name + ': read failed ' + err[-300:], code == 0)
    check(name + ': instance', before['storage_instance_id'] == created['storage_instance_id'])
    check('%s: classification %s' % (name, before['classification']), before['classification'] == row['cls'])
    check('%s: revision %s' % (name, before['body_revision']), before['body_revision'] == row['rev'])
    check(name + ': receipts', before['receipts'] == row['receipts'])
    check('%s: events %d' % (name, len(before['events'])), len(before['events']) == row['events'])
    check(name + ': custody', len(before['custody']) == row['custody'])
    check(name + ': pending', (before['pending_op'] is not None) == bool(row.get('pending')))
    check(name + ': recovery notes %s' % before['recovered'], all(n in before['recovered'] for n in row.get('notes', [])))
    code, after, err = _spawn(['reenter', '--root', str(root), '--spec', str(spec_path)])
    check(name + ': reenter failed ' + err[-300:], code == 0 and 'refusal' not in after)
    code, again, err = _spawn(['reenter', '--root', str(root), '--spec', str(spec_path)])
    check(name + ': second reenter failed', code == 0)
    _converged(name, before, after, again)
    return dict(row=name, cut=row.get('cut') or row.get('storage_cut'), exit=row.get('exit', S.CRASH_EXIT),
                before=dict(classification=before['classification'], revision=before['body_revision'],
                            events=len(before['events']), custody=len(before['custody']), recovered=before['recovered']),
                after=dict(classification=after['classification'], revision=after['body_revision'],
                           events=len(after['events'])), second_reentry_manifest_unchanged=True, status='pass')


def _act(root, spec_path, action):
    code, out, err = _spawn([action, '--root', str(root), '--spec', str(spec_path)])
    if code != 0:
        raise Fail('%s failed: %s' % (action, err[-400:]))
    return out


def extra_rows(workdir):
    rows = []

    def row(name, route, cut, storage_cut, steps):
        try:
            root, spec_path, created = _setup_row(workdir, name, route)
            code, _, err = _crash(root, spec_path, dict(cut=cut, storage_cut=storage_cut))
            check(name + ': crash exit %s %s' % (code, err[-200:]), code == S.CRASH_EXIT)
            trail = []
            for action, expect in steps:
                out = _act(root, spec_path, action)
                trail.append(dict(action=action, classification=out.get('classification'), refusal=out.get('refusal'),
                                  revision=out.get('body_revision'), events=len(out.get('events') or {})))
                expect(out, trail)
            rows.append(dict(row=name, status='pass', trail=trail))
        except Fail as e:
            rows.append(dict(row=name, status='fail', error=str(e)))

    def is_(cls, rev=None, events=None, refusal=None):
        def f(out, trail):
            check('%s classification %s != %s' % (trail[-1]['action'], out.get('classification'), cls),
                  out.get('classification') == cls)
            if rev is not None:
                check(trail[-1]['action'] + ' revision', out['body_revision'] == rev)
            if events is not None:
                check(trail[-1]['action'] + ' events', len(out['events']) == events)
            check(trail[-1]['action'] + ' refusal %s' % out.get('refusal'), out.get('refusal') == refusal)
        return f

    row('pre_reservation_no_effect', 'direct', 'after_source_capture', None,
        [('stop_cancel', is_('terminal_no_effect', 1, 0)), ('reenter', is_('terminal_no_effect', 1, 0))])
    row('reserved_release', 'direct', 'after_reserve', None,
        [('cancel', is_('terminal_no_effect', 1, 0)), ('reenter', is_('terminal_no_effect', 1, 0))])
    row('body_unknown_resolves_no_effect', 'direct', 'in_commit_before_tx', None,
        [('unknown', is_('terminal_unknown', 1, 0)), ('recover', is_('terminal_unknown', 1, 0)),
         ('replay', lambda out, t: check('replay unknown', out['replay']['result_status'] == 'recovery_required' and
                                         out['terminal']['result']['body_effect'] == 'unknown')),
         ('reenter', is_('terminal_unknown', 1, 0))])
    row('event_unknown_lost_ack_then_factual_success', 'direct', None, 'after_append',
        [('unknown', is_('terminal_unknown', 2, 1)), ('recover', is_('terminal_unknown', 2, 1)),
         ('replay', lambda out, t: check('replay keeps unknown', out['replay']['result_status'] == 'recovery_required' and
                                         out['terminal']['result']['body_effect'] == 'committed' and
                                         out['terminal']['result']['event_effect'] == 'unknown')),
         ('inspect', lambda out, t: check('factual event inspectable', out.get('inspected') is not None and
                                          len(out['custody']) == 1)),
         ('reenter', is_('terminal_unknown', 2, 1))])
    row('altered_reentry_conflict', 'direct', 'after_reserve', None,
        [('altered', is_('body_reserved', 1, 0, 'dgu/sir/request_conflict'))])
    row('withdrawal_preserves_pending_then_settles', 'direct', 'after_reserve', None,
        [('withdraw', is_('body_reserved', 1, 0)),
         ('reenter', is_('body_reserved', 1, 0, 'dgu/body/commit/installation_unavailable')),
         ('cancel', is_('no_effect', 1, 0, 'dgu/sir/terminal/final/installation_unavailable')),
         ('reinstall', is_('no_effect', 1, 0)), ('cancel', is_('terminal_no_effect', 1, 0))])
    row('withdrawal_after_commit_then_reinstall', 'direct', 'in_commit_after_tx', None,
        [('withdraw', is_('body_committed', 2, 0)),
         ('reenter', is_('event_ready', 2, 0, 'dgu/producer/publish/installation_unavailable')),
         ('reinstall', is_('event_ready', 2, 0)), ('reenter', is_('terminal_succeeded', 2, 1))])
    row('agent_reentry_rechecks_approval', 'agent', 'in_commit_before_tx', None,
        [('revoke_approval', is_('body_reserved', 1, 0)),
         ('reenter', is_('body_reserved', 1, 0, 'dgu/body/commit/approval/approval_revoked')),
         ('cancel', is_('terminal_no_effect', 1, 0))])
    return rows


def run_matrix(workdir):
    rows = []
    for row in CUT_ROWS:
        for route in (('direct', 'agent') if row['name'] in ('control', 'in_commit_before_tx', 'after_append') else ('direct',)):
            try:
                rows.append(matrix_row(workdir, row, route))
            except Fail as e:
                rows.append(dict(row=row['name'] + ('' if route == 'direct' else '-agent'), status='fail', error=str(e)))
    rows += extra_rows(workdir)
    return rows


# ================================================================== runner

def run_case(c, work):
    d = Path(work) / c['id'].replace('/', '__')
    t0 = time.time()
    O.HITS.clear()
    try:
        if c['kind'] == 'positive':
            detail = c['fn'](d)
            return dict(id=c['id'], group=c['group'], kind='positive', status='pass', detail=detail,
                        seconds=round(time.time() - t0, 2))
        res = c['fn'](d)
        w, call = res[0], res[1]
        holder = res[2] if len(res) > 2 else None
        before = footprint(w)
        try:
            call()
            got = 'ACCEPTED'
        except REFUSALS as error:
            got = A.refusal_code(error)
        baseline = holder['after'] if holder and 'after' in holder else before
        if holder is not None and 'after' not in holder:
            return dict(id=c['id'], group=c['group'], kind='negative', expected=c['expected'], got=got,
                        status='fail', error='injected boundary never reached', seconds=round(time.time() - t0, 2))
        preserved = footprint(w) == baseline
        exp = c['expected']
        ok = got == exp and preserved
        return dict(id=c['id'], group=c['group'], kind='negative', expected=exp, got=got, preserved=preserved,
                    sites=sorted(O.HITS.get(got, [])), status='pass' if ok else 'fail',
                    seconds=round(time.time() - t0, 2))
    except Exception as error:  # noqa: BLE001
        return dict(id=c['id'], group=c['group'], kind=c['kind'], expected=c.get('expected'), status='fail',
                    error='%s: %s' % (type(error).__name__, error), trace=traceback.format_exc()[-1500:],
                    seconds=round(time.time() - t0, 2))
    finally:
        shutil.rmtree(d, ignore_errors=True)


def guard_sites():
    """Every require/refuse site in the DG-U owner module, by line, with its code expression."""
    import ast
    src = (HERE / 'pm_goal_dg_u_owners.py').read_text()
    tree = ast.parse(src)
    out = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in ('require', 'refuse') \
                and node.args:
            out[node.lineno] = ast.get_source_segment(src, node.args[0])
    for skip in [n.lineno for n in ast.walk(tree) if isinstance(n, ast.FunctionDef) and n.name in ('require', 'refuse')]:
        out.pop(skip, None)
    return dict(sorted(out.items()))


def guard_inventory(results):
    codes = {}
    by_line = {}
    for r in results:
        if r['kind'] == 'negative' and r['status'] == 'pass':
            codes.setdefault(r['got'], []).append(r['id'])
            for line in r.get('sites', []):
                by_line.setdefault(line, set()).add(r['got'])
    sites = guard_sites()
    rows = []
    for line, expr in sites.items():
        hit = sorted(by_line.get(line, []))
        rows.append(dict(line=line, code_expression=expr, refusal_codes=hit,
                         negatives=sorted({n for c in hit for n in codes[c]})))
    return dict(codes=dict(sorted(codes.items())), sites=rows,
                sites_without_negative=[dict(line=r['line'], code_expression=r['code_expression'])
                                        for r in rows if not r['negatives']],
                adapter_codes={c: v for c, v in sorted(codes.items()) if not c.startswith('dgu/')})


SELECTION = NR.ROOT / 'Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json'


def verify_selection():
    """The explicit successor selection pins every member and support file; any drift refuses."""
    import hashlib
    sel = json.loads(SELECTION.read_text())
    bad = []
    for row in sel['members'] + sel['repository_support']:
        got = hashlib.sha256((NR.ROOT / row['path']).read_bytes()).hexdigest()
        if got != row['sha256']:
            bad.append(row['path'])
    if sel.get('edition') != O.EDITION:
        bad.append('edition')
    return sel, bad


def main():
    if len(sys.argv) > 1 and sys.argv[1] == '--child':
        return child(sys.argv[2:])
    p = argparse.ArgumentParser()
    p.add_argument('--output')
    p.add_argument('--guards')
    p.add_argument('--group', action='append')
    p.add_argument('--match')
    p.add_argument('--no-matrix', action='store_true')
    p.add_argument('--work')
    a = p.parse_args()
    sel, bad = verify_selection()
    if bad:
        print(json.dumps(dict(status='fail', selection_pin_mismatch=bad)))
        return 1
    work = Path(tempfile.mkdtemp(prefix='dgu-oracles-', dir=a.work or os.environ.get('DGU_WORK')))
    t0 = time.time()
    selected = [c for c in CASES if (not a.group or c['group'] in a.group) and (not a.match or a.match in c['id'])]
    results = [run_case(c, work) for c in selected]
    matrix = []
    if not a.no_matrix and (not a.group or 'U3' in a.group) and not a.match:
        mwork = work / 'matrix'
        mwork.mkdir(parents=True, exist_ok=True)
        matrix = run_matrix(mwork)
    shutil.rmtree(work, ignore_errors=True)
    failures = [r for r in results if r['status'] != 'pass'] + [m for m in matrix if m['status'] != 'pass']
    groups = {}
    for r in results:
        gsum = groups.setdefault(r['group'], dict(positives=0, negatives=0, failures=0))
        gsum['positives' if r['kind'] == 'positive' else 'negatives'] += 1
        gsum['failures'] += r['status'] != 'pass'
    if matrix:
        gsum = groups.setdefault('U3', dict(positives=0, negatives=0, failures=0))
        gsum['matrix_rows'] = len(matrix)
        gsum['failures'] += sum(m['status'] != 'pass' for m in matrix)
    out = dict(qualification=QUALIFICATION, native=NR.NATIVE_LINE, edition=O.EDITION, family='goal.updated',
               selection='Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json',
               selection_members={r['path']: r['sha256'] for r in sel['members']},
               groups=groups, positives=sum(r['kind'] == 'positive' for r in results),
               negatives=sum(r['kind'] == 'negative' for r in results), matrix_rows=len(matrix),
               seconds=round(time.time() - t0, 1), status='pass' if not failures else 'fail',
               failures=[dict(id=f.get('id') or f.get('row'), expected=f.get('expected'), got=f.get('got'),
                              error=f.get('error'), preserved=f.get('preserved')) for f in failures],
               cases=results, matrix=matrix)
    if a.output:
        Path(a.output).write_text(json.dumps(out, indent=1, sort_keys=True, ensure_ascii=False) + '\n')
    if a.guards:
        inv = guard_inventory(results)
        Path(a.guards).write_text(json.dumps(dict(qualification=QUALIFICATION, native=NR.NATIVE_LINE,
                                                  owner_module='scripts/pm_goal_dg_u_owners.py',
                                                  site_count=len(inv['sites']),
                                                  sites_with_negative=sum(1 for x in inv['sites'] if x['negatives']),
                                                  **inv), indent=1, sort_keys=True, ensure_ascii=False) + '\n')
    print(json.dumps(dict(status=out['status'], groups=groups, positives=out['positives'], negatives=out['negatives'],
                          matrix_rows=out['matrix_rows'], seconds=out['seconds'],
                          failures=out['failures'][:60]), indent=1, ensure_ascii=False))
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
