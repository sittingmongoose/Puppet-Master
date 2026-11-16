#!/usr/bin/env python3
"""DG-CF1 complete original-path oracles: goal_run.certified CF-01..CF-05.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Lane DG-CF1 (stream E, 2026-11-11). One ordered original path runs on the
shared TEST_ONLY adapters with the owners of `pm_goal_dg_cf1_world`:

  CF-04 select installed profile (member bytes, subprofile digest, acyclic
        DAG, descriptor digest recipe, eager resolution of every realm)
  CF-05 enroll fresh birth (native birth, Birth, empty Control coissued in
        one Storage transaction)
  CF-03 native Start, each required WorkNode's attempt lifecycle, progress,
        provisional success (optionally verifying), G1-G8 final decision,
        durable Standard, whole OriginalCertificationSource
  CF-02 assignment, invocation, resolver, references, causal and Storage
        partition/route whole roots with owner-held structured originals
  CF-01 I0/I1 identity over the whole roots, producer prepare.v2 (whole
        producer source, producer25, submission), Storage append, first
        receipt, lost-acknowledgement and equal retries
  CF-03 prepare_certified (CertificationCandidateResult)

Each negative starts from this valid path and changes exactly one fact at one
boundary, keeping every copy coherent, and must refuse with exactly its code.
The adapter's CF-01 demonstration (`pm_goal_test_demo_cf01`) is adopted and
run unchanged as part of this corpus.
"""
from __future__ import annotations

import argparse
import base64
import copy
import json
from pathlib import Path
import shutil
import sys
import tempfile
import time
import unicodedata

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_demo_cf01 as DEMO
import pm_goal_dg_cf1_compose as C
import pm_goal_dg_cf1_world as W

QUALIFICATION = 'TEST_ONLY'
GROUPS = ('CF-01', 'CF-02', 'CF-03', 'CF-04', 'CF-05')


def hook(kw, name, *args):
    fn = kw.get('hooks', {}).get(name)
    if fn:
        return fn(*args)
    return None


def run_path(work, **kw):
    """The complete ordered original path; returns observations or raises the refusal."""
    values = kw.get('values') or W.default_values()
    w = W.World(work, values=values, profile_kw=kw.get('profile_kw'),
                identity_formula=kw.get('identity_formula', 'certified_v3'), realm_override=kw.get('realm_override'))
    scope = w.scope
    obs = dict(world=w, scope=scope, handles={})
    # CF-04: installed descriptor before any birth.
    profile = (w.profile.owner_id, w.profile.select())
    obs['profile'] = profile
    # Goal owner seeds its store; whole Goal-realm birth arguments.
    w.goal.seed(values)
    hook(kw, 'after_goal_seed', w)
    goal_handles = {name: (w.goal.owner_id, w.goal.argument(name, scope['goal_id']))
                    for name in ('BirthGoalArgument', 'BindingLowerArgument')}
    goal_handles = hook(kw, 'goal_handles', w, goal_handles) or goal_handles
    hook(kw, 'before_birth', w)
    obs['birth_generation_before'] = w.storage.cell_generation
    obs['birth_visible_before'] = [w.storage.cell(W.T_COORD_BIRTH, w.coord_key('birth', scope)),
                                   w.storage.cell(W.T_BIRTH, w.native.birth_key(scope))]
    obs['birth'] = w.birth.enroll(scope, profile=profile, goal_handles=goal_handles, edits=kw.get('birth_edits'))
    obs['birth_generation_after'] = w.storage.cell_generation
    goal_gen_before_chain = w.goal_store.cell_generation
    # CF-03: native successful chain.
    w.native.start(scope)
    for cid in values['criteria']:
        w.native.add_criterion(scope, cid, kw.get('criterion_outcome', 'satisfied'))
    if kw.get('source_state', 'clean') is not None:
        w.native.set_source_control(scope, kw.get('source_state', 'clean'))
    hook(kw, 'before_worknodes', w)
    for wn in values['worknodes']:
        w.native.run_worknode(scope, wn, **kw.get('worknode_kw', {}).get(wn, {}))
    hook(kw, 'before_provisional', w)
    if not kw.get('skip_provisional'):
        w.native.provisional_success(scope)
    if kw.get('verifying'):
        w.native.set_verifying(scope)
    hook(kw, 'before_final', w)
    goal_current = (w.goal.owner_id, w.goal.argument('CurrentGoalArgument', scope['goal_id']))
    obs['handles']['goal'] = goal_current
    if kw.get('_final_goal_edit'):
        w.goal.edit(scope['goal_id'], goal_revision=values['goal_revision'] + 1)
    decision = (w.final.owner_id, w.final.issue(scope, goal_current, receipt_edit=kw.get('receipt_edit')))
    obs['decision'] = decision
    hook(kw, 'before_standard', w)
    standard = (w.standard.owner_id, w.standard.capture(scope, decision, goal_current,
                                                        decision_override=kw.get('decision_override')))
    obs['handles']['standard'] = standard
    hook(kw, 'before_source', w)
    native = (w.native_source.owner_id, w.native_source.issue_source(scope, decision, edit=kw.get('source_edit')))
    obs['handles']['native'] = native
    obs['goal_generation_chain'] = (goal_gen_before_chain, w.goal_store.cell_generation)
    # CF-02: producer-side whole roots.
    W.cause_event(w)
    v = values
    asg_handle, _ = w.assignment.issue_for(scope, v, edits=kw.get('assignment_edit'))
    obs['handles']['assignment'] = (w.assignment.owner_id, asg_handle)
    _, asg = w.assignment.resolve(asg_handle)
    obs['handles']['invocation'] = (w.invocation.owner_id, w.invocation.issue_for(
        scope, v, kw.get('invocation_assignment', lambda a: a)(asg), edits=kw.get('invocation_edit')))
    obs['handles']['resolver'] = (w.resolver.owner_id, w.resolver.issue_for(scope, v, edits=kw.get('resolver_edit')))
    obs['handles']['references'] = (w.references.owner_id, w.references.issue_for(
        scope, v, edits=kw.get('references_edit')))
    obs['handles']['causal'] = (w.causality.owner_id, w.causality.issue_for(scope, v, edits=kw.get('causal_edit')))
    obs['handles']['partition'] = (w.partition.owner_id, w.partition.issue_for(
        scope, kw.get('partition_recipe', 'base64url'), storage=kw.get('partition_storage', lambda w_: None)(w)))
    obs['handles']['descriptor'] = profile
    handles = dict(obs['handles'])
    handles = hook(kw, 'identity_handles', w, handles) or handles
    hook(kw, 'before_identity', w)
    ident_handle, request = w.identity.derive(scope, handles, request_edit=kw.get('request_edit'),
                                              input_edit=kw.get('input_edit'), drift=kw.get('drift'),
                                              future=kw.get('future'))
    identity = (w.identity.owner_id, ident_handle)
    identity = hook(kw, 'identity_wrapper', w, identity) or identity
    obs['identity'] = w.identity.resolve(ident_handle)[1]
    obs['request'] = request
    hook(kw, 'before_producer', w)
    prepared, event = w.producer.prepare(scope, identity, handles, source_edit=kw.get('wps_edit'),
                                         candidate_edit=kw.get('candidate_edit'))
    obs['prepared'] = prepared
    obs['event'] = event
    # CF-03: certified candidate preparation (re-reads Standard, reruns U/G).
    hook(kw, 'before_prepare', w)
    _, std = w.standard.resolve(standard[1])
    _, dec = w.final.resolve(decision[1])
    cand = w.native.prepare_certified(scope, standard=std, decision_check=lambda st: W.check_decision(
        w, scope, dec, 'prepare'))
    obs['candidate'] = (w.native.owner_id, cand)
    obs['current_workflow_source'] = w.native.compose_current(scope, w.native.state(scope))
    # CF-01: Storage append, first receipt.
    append_request = dict(kind='TEST_ONLY:goal_run.certified.append', event_id=event['event_id'])
    events, _, outcome = w.appender.append_original('TEST_ONLY:operation:certified', append_request, [event])
    obs.update(append_request=append_request, stored=w.appender.event(events[0]),
               receipt=w.appender.first_receipt(events[0]), outcome=outcome)
    return obs


# ------------------------------------------------------------------ positive checks

def check_positive(obs, label):
    w, scope = obs['world'], obs['scope']
    out = dict(group_checks={})
    # CF-04
    _, descriptor = w.profile.resolve(obs['profile'][1])
    A.require('cf04/profile_digest', descriptor['profile_sha256'] == w.expected_profile_digest)
    A.require('cf04/members', descriptor['member_count'] == 42)
    A.require('cf04/references_resolved', descriptor['reference_occurrences'] > 0)
    A.require('cf04/birth_selects_profile', obs['birth']['native']['installed_contract_digest'] ==
              descriptor['profile_sha256'] == obs['birth']['birth']['profile_sha256'])
    out['group_checks']['CF-04'] = dict(profile_sha256=descriptor['profile_sha256'], members=descriptor['member_count'],
                                        reference_occurrences=descriptor['reference_occurrences'],
                                        explicit_cross_realm=descriptor['explicit_cross_realm_occurrences'])
    # CF-05
    b = obs['birth']
    A.require('cf05/nothing_before', obs['birth_visible_before'] == [None, None])
    A.require('cf05/one_transaction', obs['birth_generation_after'] == obs['birth_generation_before'] + 1)
    tx = b['tx']
    for table, key in ((W.T_BIRTH, w.native.birth_key(scope)), (W.T_BODY, w.native.k(scope)),
                       (W.T_CONTROL, w.native.k(scope)), (W.T_HEAD, w.native.k(scope)),
                       (W.T_COORD_BIRTH, w.coord_key('birth', scope)), (W.T_COORD_CONTROL, w.coord_key('control', scope))):
        cell = w.storage.cell(table, key)
        A.require('cf05/coissued/' + table, cell is not None and (cell['tx'] == tx or table in (W.T_BODY, W.T_CONTROL,
                                                                                            W.T_HEAD)))
    stored_birth = w.storage.cell(W.T_COORD_BIRTH, w.coord_key('birth', scope))
    A.require('cf05/birth_tx_field', stored_birth['value']['record']['transaction_id'] == tx == stored_birth['tx'])
    native_birth = w.storage.cell(W.T_BIRTH, w.native.birth_key(scope))
    A.require('cf05/birth_selects_native', b['birth']['original_native_birth']['sha256'] ==
              W.sha(A.canonical(native_birth['value'])))
    A.require('cf05/control_selects_birth', b['control']['birth']['sha256'] == W.sha(A.canonical(b['birth'])))
    for key in (w.coord_key('birth', scope), w.coord_key('control', scope)):
        _, proj, run = W.decode_family_key(key)
        A.require('cf05/family_key_hex_roundtrip', proj == scope['project_id'] and run == scope['goal_run_id'] and
                  key.split(':')[1] == scope['project_id'].encode('utf-8').hex())
    order = [m for _, m in w.recorder.sequence(True)]

    def idx(name):
        return next(i for i, m in enumerate(order) if m.startswith(name))
    A.require('cf05/chronology', idx('select_installed_profile') < idx(
        'owner.executor.certified_event.enroll_fresh_birth.v1') < idx('capture_standard') < idx(
        'owner.workflow.certified_event.derive_original_identity.v1') < idx('prepare_producer'))
    out['group_checks']['CF-05'] = dict(transaction_id=tx, generation=[obs['birth_generation_before'],
                                                                       obs['birth_generation_after']])
    # CF-03
    state = w.native.state(scope)
    _, cand = w.native.resolve(obs['candidate'][1])
    A.require('cf03/before_status', cand['before']['status'] in ('provisional_success', 'verifying'))
    A.require('cf03/after_certified', cand['after']['status'] == 'certified')
    A.require('cf03/revision_plus_one', cand['after_revision'] == cand['before_revision'] + 1)
    _, std = w.standard.resolve(obs['handles']['standard'][1])
    A.require('cf03/receipt_binding', cand['after']['certification_receipt'] == std['receipt_ref'])
    A.require('cf03/native_unchanged_by_prepare', state['body']['status'] == cand['before']['status'] and
              state['body']['body_revision'] == cand['before_revision'])
    A.require('cf03/goal_unchanged', obs['goal_generation_chain'][0] == obs['goal_generation_chain'][1])
    rules = [u['rule'] for _, u in sorted(state['updates'].items(), key=lambda kv: kv[1]['after_body_revision'])]
    A.require('cf03/lineage', rules[0] == 'original_start_activation' and 'original_provisional_success' in rules and
              rules.count('original_execution_progress') == len(w.values['worknodes']))
    for wn in w.values['worknodes']:
        A.require('cf03/worknode_done', state['worknodes'][wn]['lifecycle'] == 'done')
    lifecycle = [m for _, m in w.recorder.sequence(False) if m.startswith('native_worknode:')]
    A.require('cf03/worknode_order', lifecycle[:4] == ['native_worknode:queued->in_progress',
                                                       'native_worknode:in_progress->verify_pending',
                                                       'native_worknode:verify_pending->verified',
                                                       'native_worknode:verified->done'])
    out['group_checks']['CF-03'] = dict(before=cand['before']['status'], after='certified',
                                        before_revision=cand['before_revision'], after_revision=cand['after_revision'],
                                        lineage=rules)
    # CF-02
    counts = {}
    for name in ('assignment', 'invocation', 'resolver', 'references', 'causal'):
        owner_id, handle = obs['handles'][name]
        _, value = w.owner_by_id(owner_id).resolve(handle)
        counts[name] = W.authenticate_structured(w, value, 'positive/' + name, scope)
        A.require('cf02/structured_present/' + name, counts[name] > 0)
    _, prepared = w.producer.resolve(obs['prepared'])
    counts['whole_producer_source'] = W.authenticate_structured(w, prepared['whole_producer_source'],
                                                                'positive/wps', scope)
    helper_calls = [c for c in w.recorder.calls if c['method'].startswith('acquire:') and c['parent'] is not None]
    A.require('cf02/helper_acquisitions', len(helper_calls) >= 10)
    out['group_checks']['CF-02'] = dict(structured_originals=counts)
    # CF-01
    event, stored, receipt = obs['event'], obs['stored'], obs['receipt']
    A.require('cf01/stored_producer25', S.producer25(stored) == event)
    A.require('cf01/storage_assigned', all(k in stored for k in S.STORAGE_FIELDS))
    A.require('cf01/first_receipt_sequence', receipt['first_append_receipt']['sequence_id'] == stored['sequence_id'])
    A.require('cf01/custody_producer_digest', receipt['producer_semantic_digest'] == NR.producer_digest(event))
    A.require('cf01/custody_commitment', receipt['original_event_value_commitment']['sha256'] ==
              NR.full_value_commitment(stored))
    A.require('cf01/custody_partition', receipt['scope_partition'] == obs['identity']['input']['scope']['scope_partition'])
    A.require('cf01/key_bytes', stored['idempotency_key'].encode() == stored['payload']['idempotency_key'].encode())
    A.require('cf01/unicode_not_normalized', stored['run_id'] != unicodedata.normalize('NFC', stored['run_id']))
    generation = w.storage.commit_generation
    events_, _, outcome = w.appender.append_original('TEST_ONLY:operation:certified', obs['append_request'],
                                                     [copy.deepcopy(event)])
    A.require('cf01/lost_ack_status', outcome['status'] == 'already_appended')
    A.require('cf01/lost_ack_no_change', w.storage.commit_generation == generation)
    A.require('cf01/lost_ack_same_receipt', w.appender.first_receipt(events_[0]) == receipt)
    count = len(w.storage.events)
    events_, _, outcome = w.appender.append_original('TEST_ONLY:operation:certified-retry', obs['append_request'],
                                                     [copy.deepcopy(event)])
    A.require('cf01/dedupe_status', outcome['status'] == 'dedupe')
    A.require('cf01/no_second_event', len(w.storage.events) == count)
    A.require('cf01/same_first_receipt', w.appender.first_receipt(events_[0]) == receipt)
    out['group_checks']['CF-01'] = dict(event_id=stored['event_id'], sequence_id=stored['sequence_id'],
                                        idempotency_key=stored['idempotency_key'])
    # DG-CF2 integration inputs (whole roots by handle).
    inputs = w.cf2_inputs(obs)
    ocs = w.native_source.resolve(inputs['original_certification_source'][1])[1]['whole']
    W.rvalidate('OriginalCertificationSource', ocs, 'cf2_input/ocs')
    W.rvalidate('CertificationCandidateResult', w.native.resolve(inputs['certification_candidate_result'][1])[1]['whole'],
                'cf2_input/candidate')
    W.rvalidate('WholeProducerSource', prepared['whole_producer_source'], 'cf2_input/wps')
    W.rvalidate('CurrentWorkflowSource', inputs['current_workflow_source'], 'cf2_input/current')
    out['cf2_inputs'] = dict(original_certification_source_sha256=W.hsj(ocs),
                             whole_producer_source_sha256=W.hsj(prepared['whole_producer_source']),
                             current_workflow_source_sha256=W.hsj(inputs['current_workflow_source']))
    out['recorder_top_level'] = [m for _, m in w.recorder.sequence(True)]
    return out


# ------------------------------------------------------------------ negatives

V6_PROFILE = ('Plans/workflow_standard_source_contracts/preinstallation-originals/'
              '06310d70ceced923656d6c328f0556bdf1b5f4f6e96cb273bb97795718bf9444/installed-profile.json')


def first_structured(value, root_key=None):
    for path, node in W.nodes(value if root_key is None else value[root_key]):
        if isinstance(node, dict) and node.get('source_kind') == 'structured_original':
            return node
    raise AssertionError('no structured original')


def substitute_structured(value):
    """Coherent substitution: new bytes, matching byte_count/sha256/identity sha (never issued)."""
    node = first_structured(value)
    raw = W.sj(dict(qualification=QUALIFICATION, substituted=True))
    node['complete_value'] = dict(bytes_base64=W.b64(raw), byte_count=len(raw), sha256=W.sha(raw))
    node['identity']['source_sha256'] = W.sha(raw)
    return value


def edit_structured(field):
    def run(value):
        node = first_structured(value)
        if field == 'sha256':
            node['complete_value']['sha256'] = '0' * 64
        elif field == 'byte_count':
            node['complete_value']['byte_count'] += 1
        elif field == 'owner_ref':
            node['identity']['owner_ref'] = 'TEST_ONLY:owner:unregistered'
        elif field == 'transaction':
            node['identity']['original_transaction_id'] = 'TEST_ONLY:tx:substituted'
        elif field == 'scope':
            node['scope']['run_id'] = 'TEST_ONLY:goal_run:other'
        return value
    return run


def set_path(path, val):
    def run(value):
        W.put(value, path, val)
        return value
    return run


def both(*fns):
    def run(v):
        for f in fns:
            v = f(v)
        return v
    return run


def cand(path, val):
    def run(event):
        target = event
        parts = path.split('.')
        for part in parts[:-1]:
            target = target[part]
        if val is DELETE:
            del target[parts[-1]]
        else:
            target[parts[-1]] = val
        return event
    return run


DELETE = object()
WORLD = {}


def stamp_head_stale(w):
    k = w.native.k(w.scope)
    cell = w.storage.cell(W.T_HEAD, k)
    w.storage.transact([dict(table=W.T_HEAD, key=k, expected=cell['version'],
                             value=dict(cell['value'], body_sha256='0' * 64))])


def fail_worknode_later(w):
    k = w.native.k(w.scope) + ':' + S.k_component(w.values['worknodes'][1])
    cell = w.storage.cell(W.T_WORKNODE, k)
    w.storage.transact([dict(table=W.T_WORKNODE, key=k, expected=cell['version'],
                             value=dict(cell['value'], lifecycle='failed'))])


def native_edit_with(side):
    def run(native):
        side()
        return native
    return run


def negatives():
    out = []

    def add(group, name, kw, code):
        out.append((group, name, kw, code))
    # ---------------- CF-04 profile/resource closure
    add('CF-04', 'v6_descriptor_old_profile', dict(profile_kw=dict(descriptor_path=V6_PROFILE)), 'profile/writer_contract')
    add('CF-04', 'v6_header_cast_on_v7_descriptor',
        dict(profile_kw=dict(member_edit=lambda d: dict(d, profile='pm.executor.workflow_source.all_writers.v6'))),
        'profile/writer_contract')
    add('CF-04', 'predecessor_relabelled', dict(profile_kw=dict(member_edit=lambda d: dict(
        d, predecessor_native_profile='pm.executor.workflow_source.all_writers.v5'))), 'profile/predecessor')
    add('CF-04', 'member_missing_resource', dict(profile_kw=dict(member_edit=lambda d: (d['members'].append(dict(
        path='Plans/goal_certified_event_coordinator_contracts/absent.json', sha256='0' * 64, bytes=1)), d)[1])),
        'profile/member_missing')
    add('CF-04', 'member_changed_resource_hash', dict(profile_kw=dict(member_edit=lambda d: (d['members'][3].update(
        sha256='1' * 64), d)[1])), 'profile/member_hash')
    add('CF-04', 'member_byte_count', dict(profile_kw=dict(member_edit=lambda d: (d['members'][3].update(
        bytes=d['members'][3]['bytes'] + 1), d)[1])), 'profile/member_bytes')
    add('CF-04', 'member_duplicate', dict(profile_kw=dict(member_edit=lambda d: (d['members'].append(
        dict(d['members'][0])), d)[1])), 'profile/member_duplicate')

    def self_dependency(d):
        raw = (W.ROOT / W.COORD_PKG / 'installed-profile-digest.txt').read_bytes()
        d['members'].append(dict(path=W.COORD_PKG + 'installed-profile-digest.txt', sha256=W.sha(raw), bytes=len(raw)))
        return d
    add('CF-04', 'descriptor_self_dependency', dict(profile_kw=dict(member_edit=self_dependency)), 'profile/cycle')
    add('CF-04', 'subprofile_not_member', dict(profile_kw=dict(member_edit=lambda d: dict(d, members=[
        m for m in d['members'] if m['path'] != W.PRODUCER_PKG + 'native-v7/installed-profile.json']))),
        'profile/subprofile_member')
    add('CF-04', 'subprofile_digest_stale', dict(profile_kw=dict(member_edit=lambda d: dict(
        d, producer_source_profile_digest='2' * 64))), 'profile/subprofile_digest')
    add('CF-04', 'predecessor_whole_hash_substituted', dict(profile_kw=dict(member_edit=lambda d: dict(
        d, predecessor_native_profile_whole_sha256='3' * 64))), 'profile/predecessor_bytes')
    add('CF-04', 'descriptor_digest_pretty_print_recipe', dict(profile_kw=dict(digest_recipe='file')), 'profile/digest')
    add('CF-04', 'descriptor_digest_stale_after_change', dict(profile_kw=dict(member_edit=lambda d: dict(
        d, status='CANONICAL_COMPLETE_SOURCE_FAMILY_INSTALLED'))), 'profile/digest')
    add('CF-04', 'global_bank_merge', dict(profile_kw=dict(realm_edit=lambda r: (r['producer'].update(
        merge_with_other_realms=True), r)[1])), 'profile/realm_merge')
    add('CF-04', 'network_fallback', dict(profile_kw=dict(realm_edit=lambda r: (r['native'].update(
        network_fallback=True), r)[1])), 'profile/network_fallback')

    def wrong_scoped_target(pre):
        for edge in pre.inherited:
            edge['whole_target_sha256'] = '4' * 64
    add('CF-04', 'wrong_scoped_import_target_hash', dict(profile_kw=dict(precondition_edit=wrong_scoped_target)),
        'profile/resource_closure/explicit_import_target_bytes_mismatched')

    def drop_scoped(pre):
        pre.inherited.clear()
    add('CF-04', 'scoped_import_dropped', dict(profile_kw=dict(precondition_edit=drop_scoped)), 'profile/unresolved')
    add('CF-04', 'method_dispatch_realm_cast', dict(realm_override=dict(assignment='native')),
        'dispatch/assignment/unresolvable_in_realm')
    add('CF-04', 'method_dispatch_goal_in_standard_realm', dict(realm_override=dict(current_goal='standard')),
        'dispatch/current_goal/unresolvable_in_realm')
    add('CF-04', 'old_birth_native_writer_v6', dict(birth_edits=dict(native=lambda n: dict(
        n, writer_contract='pm.executor.workflow_source.all_writers.v6'))), 'birth/writer_contract')
    # ---------------- CF-05 birth chronology
    add('CF-05', 'sequential_partial_birth', dict(birth_edits=dict(split_transaction=True)), 'birth/one_transaction')
    add('CF-05', 'occupied_birth_key', dict(hooks=dict(before_birth=lambda w: w.storage.transact([dict(
        table=W.T_COORD_BIRTH, key=w.coord_key('birth', w.scope), expected=None, value=dict(prior=True))]))),
        'birth_final/occupied')
    add('CF-05', 'occupied_control_key', dict(hooks=dict(before_birth=lambda w: w.storage.transact([dict(
        table=W.T_COORD_CONTROL, key=w.coord_key('control', w.scope), expected=None, value=dict(prior=True))]))),
        'birth_final/occupied')
    add('CF-05', 'older_native_birth_present', dict(hooks=dict(before_birth=lambda w: w.storage.transact([dict(
        table=W.T_BODY, key=w.native.k(w.scope), expected=None, value=dict(prior=True))]))), 'native/unborn')
    add('CF-05', 'birth_selects_other_native', dict(birth_edits=dict(birth=lambda b: dict(
        b, original_native_birth=dict(b['original_native_birth'], sha256='5' * 64)))), 'birth/selects_native')
    add('CF-05', 'control_selects_other_birth', dict(birth_edits=dict(control=lambda c: dict(
        c, birth=dict(c['birth'], sha256='6' * 64)))), 'birth/control_selects_birth')
    add('CF-05', 'circular_birth_selects_own_key',
        dict(birth_edits=dict(birth=lambda b: dict(b, initial_control_key=b['original_native_birth']['key']))),
        'birth/initial_control_key')
    add('CF-05', 'control_key_base64url_codec', dict(birth_edits=dict(birth=lambda b: dict(
        b, initial_control_key='goal_certified_event_control.v1:%s:%s' % (S.k_component(W.default_values()['project_id']),
                                                                         S.k_component(W.default_values()['goal_run_id']))))),
        'birth/initial_control_key')
    add('CF-05', 'initial_control_epoch_nonzero', dict(birth_edits=dict(birth=lambda b: dict(
        b, initial_control_epoch=1))), 'birth/initial_epoch')
    add('CF-05', 'initial_phase_not_empty', dict(birth_edits=dict(birth=lambda b: dict(b, initial_phase='armed'))),
        'birth/initial_phase')
    add('CF-05', 'birth_request_profile_mismatch', dict(birth_edits=dict(request=lambda r: dict(
        r, installed_profile_sha256='7' * 64))), 'birth/request_profile')
    add('CF-05', 'birth_extra_member', dict(birth_edits=dict(birth=lambda b: dict(b, extension=1))),
        'birth/candidates/schema/birth')
    add('CF-05', 'unissued_goal_argument_dict', dict(hooks=dict(goal_handles=lambda w, h: dict(
        h, BirthGoalArgument=(w.goal.owner_id, dict(argument={}))))), 'original/handle_type')
    add('CF-05', 'future_standard_input_at_birth', dict(hooks=dict(goal_handles=lambda w, h: dict(
        h, DurableStandardRead=(w.goal.owner_id, w.goal.argument('CurrentGoalArgument', w.scope['goal_id']))))),
        'birth/future_input')

    def rebind_then_lower(w, h):
        w.goal.rebind(w.scope['goal_id'], 'TEST_ONLY:goal_run:other')
        return dict(h, BindingLowerArgument=(w.goal.owner_id, w.goal.argument('BindingLowerArgument',
                                                                              w.scope['goal_id'])))
    add('CF-05', 'binding_lower_foreign_run', dict(hooks=dict(goal_handles=rebind_then_lower)), 'birth/binding_run')
    add('CF-05', 'goal_bound_to_other_run', dict(hooks=dict(after_goal_seed=lambda w: w.goal.rebind(
        w.scope['goal_id'], 'TEST_ONLY:goal_run:other'))), 'birth/goal_run')
    add('CF-05', 'goal_stopped_before_birth', dict(hooks=dict(after_goal_seed=lambda w: w.goal.stop(
        w.scope['goal_id']))), 'birth/goal_stop')
    add('CF-05', 'stop_after_helpers_before_commit', dict(_native_side='stop'), 'birth_final/effective_stop')
    add('CF-05', 'rebind_after_helpers_before_commit', dict(_native_side='rebind'), 'birth_final/binding')
    add('CF-05', 'goal_edit_after_helpers_before_commit', dict(_native_side='edit'), 'birth_final/goal_revision')
    add('CF-05', 'native_birth_other_profile', dict(birth_edits=dict(native=lambda n: dict(
        n, installed_contract_digest='b' * 64))), 'birth/profile_selected')
    add('CF-05', 'goal_control_unavailable', dict(hooks=dict(after_goal_seed=lambda w: w.goal_store.transact([dict(
        table=W.T_GOAL_CONTROL, key=w.goal.key(w.scope['goal_id']), expected=1, delete=True)]))), 'goal/unavailable')
    add('CF-05', 'birth_argument_foreign_run', dict(birth_edits=dict(birth_argument=lambda a: (W.put_all(
        a, 'goal_run_id', 'TEST_ONLY:goal_run:other'), a)[1])), 'birth/argument_run')
    add('CF-05', 'birth_argument_extra_member', dict(birth_edits=dict(birth_argument=lambda a: dict(a, extension=1))),
        'birth/original_birth_argument/schema/')
    add('CF-05', 'identity_input_future_intent', dict(future='intent'), 'identity/future_input')
    # ---------------- CF-03 successful native chain
    wn_a, wn_b = W.default_values()['worknodes']
    add('CF-03', 'required_worknode_never_completed', dict(worknode_kw={wn_b: dict(fail_at='in_progress')}),
        'native/provisional/required_worknode')
    add('CF-03', 'required_worknode_validator_failed', dict(worknode_kw={wn_a: dict(validator_outcome='failed')}),
        'native/provisional/required_worknode')
    add('CF-03', 'required_worknode_failed_after_provisional', dict(hooks=dict(before_final=fail_worknode_later)),
        'final/g1/all_worknodes_terminal')
    def origin_issuer(w):
        k = sorted(w.storage.cells[W.T_ORIGIN])[-1]
        cell = w.storage.cell(W.T_ORIGIN, k)
        w.storage.transact([dict(table=W.T_ORIGIN, key=k, expected=cell['version'],
                                 value=dict(cell['value'], issuer='TEST_ONLY:owner:fabricated'))])

    def origin_missing(w):
        k = [key for key, c in w.storage.cells[W.T_ORIGIN].items() if c['value']['rule'] ==
             'original_provisional_success'][0]
        cell = w.storage.cell(W.T_ORIGIN, k)
        w.storage.transact([dict(table=W.T_ORIGIN, key=k, expected=cell['version'], delete=True)])
    add('CF-03', 'd01_origin_fabricated_issuer', dict(hooks=dict(before_final=origin_issuer)), 'final/gu2/d01_origin')
    add('CF-03', 'd01_origin_missing', dict(hooks=dict(before_final=origin_missing)), 'final/gu2/d01_origin')
    def validator_failed_later(w):
        k = sorted(w.storage.cells[W.T_VALIDATOR])[0]
        cell = w.storage.cell(W.T_VALIDATOR, k)
        w.storage.transact([dict(table=W.T_VALIDATOR, key=k, expected=cell['version'],
                                 value=dict(cell['value'], outcome='failed'))])
    add('CF-03', 'no_required_criteria', dict(values=W.default_values(criteria=[])), 'final/g2/criteria_present')
    add('CF-03', 'validator_failed_on_done_worknode', dict(hooks=dict(before_final=validator_failed_later)),
        'final/g2/validator_passed')
    add('CF-03', 'source_control_record_missing', dict(source_state=None), 'final/g3/source_control_present')
    add('CF-03', 'final_decision_while_running', dict(skip_provisional=True), 'final/status')
    add('CF-03', 'start_twice', dict(hooks=dict(before_worknodes=lambda w: w.native.start(w.scope))),
        'native/status/original_start_activation')
    add('CF-03', 'worknode_attempt_reentered', dict(hooks=dict(before_provisional=lambda w: w.native.run_worknode(
        w.scope, w.values['worknodes'][0]))), 'native/worknode_state/in_progress')
    add('CF-03', 'unregistered_worknode', dict(hooks=dict(before_provisional=lambda w: w.native.run_worknode(
        w.scope, 'TEST_ONLY:worknode:unregistered'))), 'native/worknode_unknown')
    add('CF-03', 'goal_stopped_before_standard', dict(hooks=dict(before_standard=lambda w: w.goal.stop(
        w.scope['goal_id']))), 'standard/goal_current')
    add('CF-03', 'goal_edited_before_final_after_argument', dict(_final_goal_edit=True), 'final/goal_current')
    add('CF-03', 'source_request_goal_mismatched', dict(source_edit=set_path('current/request/scope/goal_id',
                                                                           'TEST_ONLY:goal:other')),
        'i0/native_goal')
    add('CF-03', 'criterion_waived', dict(criterion_outcome='waived'), 'final/g2/criterion_satisfied')
    add('CF-03', 'criterion_waived_not_applicable', dict(criterion_outcome='not_applicable'),
        'final/g2/criterion_satisfied')
    add('CF-03', 'source_control_blocked', dict(source_state='blocked'), 'final/g3/final_source_state')
    add('CF-03', 'active_blocker', dict(hooks=dict(before_final=lambda w: w.native.add_blocker(
        w.scope, 'TEST_ONLY:blocker:1'))), 'final/g4/no_active_blockers')
    add('CF-03', 'rollback_required_unresolved', dict(hooks=dict(before_final=lambda w: w.native.set_source_control(
        w.scope, 'clean', rollback='required_pending'))), 'final/g5/rollback')
    add('CF-03', 'safe_point_required_unresolved', dict(hooks=dict(before_final=lambda w: w.native.set_source_control(
        w.scope, 'clean', safe_point='required_missing'))), 'final/g6/safe_point')
    add('CF-03', 'stale_d01_head', dict(hooks=dict(before_final=stamp_head_stale)), 'final/g7/currentness')
    add('CF-03', 'auditor_critical_block', dict(worknode_kw={wn_a: dict(auditor='critical_block')}),
        'final/g8/auditor_passed')
    add('CF-03', 'document_packaging_without_document_set', dict(hooks=dict(before_final=lambda w: w.native.add_artifact(
        w.scope, '.puppet-master/large.md', W.DOC_BYTES, W.DOC_BYTES))), 'final/gdoc/document_set')
    add('CF-03', 'document_set_missing_audit_c', dict(hooks=dict(before_final=lambda w: w.native.add_artifact(
        w.scope, '.puppet-master/large.md', W.DOC_BYTES, W.DOC_BYTES,
        docset=dict(audits=['A', 'B'], status='pass', source_byte_count=W.DOC_BYTES)))), 'final/gdoc/document_set')
    add('CF-03', 'goal_stopped_before_final', dict(hooks=dict(before_final=lambda w: w.goal.stop(
        w.scope['goal_id']))), 'final/goal_stop')
    add('CF-03', 'child_receipt_shortcut', dict(receipt_edit=lambda r: dict(
        r, child_receipt_refs=['TEST_ONLY:child-receipt:1'])), 'standard/no_exception')
    add('CF-03', 'unresolved_risk_exception', dict(receipt_edit=lambda r: dict(
        r, unresolved_risks=['TEST_ONLY:risk:1'])), 'standard/no_exception')
    add('CF-03', 'decision_blocked', dict(receipt_edit=lambda r: dict(r, final_certifier_decision='blocked')),
        'standard/decision_certified')
    add('CF-03', 'receipt_flag_false', dict(receipt_edit=lambda r: dict(r, auditor_passed=False)),
        'standard/flag/auditor_passed')
    add('CF-03', 'worknode_receipts_substituted', dict(receipt_edit=lambda r: dict(
        r, worknode_receipt_refs=list(reversed(r['worknode_receipt_refs'])))), 'standard/worknode_receipts')
    add('CF-03', 'fabricated_decision_origin', dict(decision_override=lambda d: dict(
        d, transaction_id='TEST_ONLY:tx:fabricated')), 'standard/decision_issued')
    add('CF-03', 'stale_decision_at_prepare', dict(hooks=dict(before_prepare=lambda w: w.native.advance_after(w.scope))),
        'prepare/decision_current')
    add('CF-03', 'source_status_mismatched', dict(source_edit=set_path(
        'current/original_start/d01_current/workflow/current_body/status', 'running')), 'u2/status')
    add('CF-03', 'source_body_revision_mismatched', dict(source_edit=set_path(
        'current/original_start/d01_current/workflow/current_body/revision', 1)), 'u2/body_revision')
    add('CF-03', 'source_head_revision_mismatched', dict(source_edit=set_path(
        'current/original_start/d01_current/workflow/head/revision', 1)), 'u2/head_revision')
    add('CF-03', 'source_required_set_omits_member', dict(source_edit=lambda v: (v['current']['requirements'][
        'required_set']['record']['members'].pop(), v)[1]), 'g1/required_set')
    add('CF-03', 'source_completion_omitted', dict(source_edit=lambda v: (v['gates']['all_required_worknodes'].pop(),
                                                                        v)[1]), 'g1/required_completions')
    add('CF-03', 'source_completion_not_done', dict(source_edit=set_path(
        'gates/all_required_worknodes/0/original_native_completion/current/worknode/lifecycle', 'verified')),
        'g1/completion_done')
    add('CF-03', 'source_final_receipt_substituted', dict(source_edit=set_path(
        'original_final_decision/complete_receipt/worknode_receipt_refs', ['TEST_ONLY:worknode-receipt:x'])),
        'g/final_receipt')
    add('CF-03', 'source_final_identity_substituted', dict(source_edit=set_path(
        'original_final_decision/original_identity/transaction_id', 'TEST_ONLY:tx:other')), 'g/final_identity')
    add('CF-03', 'source_argument_hash_substituted', dict(source_edit=set_path(
        'original_final_decision/original_source_argument_sha256', '8' * 64)), 'g/source_argument')
    # ---------------- CF-02 assignment/invocation/runtime sources
    add('CF-02', 'stale_assignment_superseded', dict(drift=dict(after='assignment', apply=lambda w: w.assignment.supersede(
        w.scope))), 'identity_helper/assignment_current/assignment')
    add('CF-02', 'assignment_superseded_at_last_helper', dict(drift=dict(after='partition', apply=lambda w:
                                                                         w.assignment.supersede(w.scope))),
        'identity_helper/assignment_current/partition')
    for stage in ('invocation', 'resolver', 'references', 'causal'):
        add('CF-02', 'assignment_superseded_after_%s_helper' % stage, dict(drift=dict(
            after=stage, apply=lambda w: w.assignment.supersede(w.scope))),
            'identity_helper/assignment_current/' + stage)
    add('CF-02', 'native_advanced_before_producer', dict(hooks=dict(before_producer=lambda w: w.native.advance_after(
        w.scope))), 'producer_helper/native_current/acquired')
    add('CF-02', 'goal_stopped_before_producer', dict(hooks=dict(before_producer=lambda w: w.goal.stop(
        w.scope['goal_id']))), 'producer_helper/goal_current/acquired')

    def supersede_inside_producer(event):
        WORLD['w'].assignment.supersede(WORLD['w'].scope)
        return event
    add('CF-02', 'assignment_superseded_before_producer_return', dict(candidate_edit=supersede_inside_producer,
                                                                      hooks=dict(before_producer=lambda w: WORLD.update(
                                                                          w=w))),
        'producer_final/assignment_current/return')
    add('CF-02', 'native_advanced_after_helper', dict(drift=dict(after='native', apply=lambda w: w.native.advance_after(
        w.scope))), 'identity_helper/native_current/native')
    add('CF-02', 'goal_edited_after_helper', dict(drift=dict(after='goal', apply=lambda w: w.goal.edit(
        w.scope['goal_id'], goal_revision=4))), 'identity_helper/goal_current/goal')
    add('CF-02', 'goal_stopped_after_helper', dict(drift=dict(after='standard', apply=lambda w: w.goal.stop(
        w.scope['goal_id']))), 'identity_helper/goal_current/standard')
    add('CF-02', 'standard_withdrawn_after_helper', dict(drift=dict(after='standard', apply=lambda w: w.storage.transact([
        dict(table=W.T_STANDARD, key=next(iter(w.storage.cells[W.T_STANDARD])),
             expected=next(iter(w.storage.cells[W.T_STANDARD].values()))['version'], delete=True)]))),
        'identity_helper/standard_durable/standard')
    add('CF-02', 'invocation_withdrawn_before_final', dict(drift=dict(after='partition', apply=lambda w: w.invocation.withdraw(
        next(iter(w.invocation._handles.keys()))))), 'original/withdrawn')
    add('CF-02', 'assignment_foreign_run', dict(assignment_edit=set_path('target/goal_run_id', 'TEST_ONLY:goal_run:other')),
        'i0/assignment_target')
    add('CF-02', 'assignment_owner_role_substituted', dict(assignment_edit=set_path(
        'owner/registered_owner_role', 'invocation')), 'i0/assignment_owner')
    add('CF-02', 'assignment_role_not_verifier', dict(assignment_edit=set_path('assigned_actor/execution_role', 'worker')),
        'i0/assignment_role')
    add('CF-02', 'invocation_embeds_foreign_assignment', dict(invocation_assignment=lambda a: dict(
        a, original_assignment_ref='TEST_ONLY:assignment:other')), 'i0/invocation_assignment')
    add('CF-02', 'invocation_result_other_assignment', dict(invocation_edit=set_path(
        'whole_invocation_result/assignment_id', 'TEST_ONLY:assignment:other')), 'i0/invocation_assignment_ref')
    add('CF-02', 'invocation_actor_mismatched', dict(invocation_edit=set_path('actual_actor/actor_ref',
                                                                            'TEST_ONLY:actor:other')),
        'i0/invocation_actor')
    add('CF-02', 'invocation_result_id_mismatched', dict(invocation_edit=set_path(
        'whole_invocation_result/invocation_id', 'TEST_ONLY:invocation:other')), 'i0/invocation_id')
    add('CF-02', 'resolver_other_invocation', dict(resolver_edit=set_path('original_invocation_id',
                                                                        'TEST_ONLY:invocation:other')),
        'i0/resolver_invocation')
    add('CF-02', 'references_other_invocation', dict(references_edit=set_path('original_invocation_id',
                                                                            'TEST_ONLY:invocation:other')),
        'i0/references_invocation')
    add('CF-02', 'effective_runtime_mismatched', dict(resolver_edit=set_path('resolved_identity/effective_model',
                                                                           'TEST_ONLY:model:b')),
        'i0/effective_runtime')

    def ref_role(role, val):
        def run(v):
            for b in v['bindings']:
                if b['reference_role'] == role:
                    b['reference'] = val
            return v
        return run
    add('CF-02', 'reference_effective_model_mismatched', dict(references_edit=ref_role('effective_model',
                                                                                     'TEST_ONLY:model:b')),
        'i0/reference/effective_model')
    add('CF-02', 'reference_account_mismatched', dict(references_edit=ref_role('effective_account',
                                                                             'TEST_ONLY:account:2')),
        'i0/reference/effective_account')

    def drop_binding(v):
        v['bindings'] = [b for b in v['bindings'] if b['reference_role'] != 'requested_account']
        return v
    add('CF-02', 'reference_member_set_substituted', dict(references_edit=drop_binding),
        'issue/ReferenceSource/schema/bindings')
    add('CF-02', 'causal_unbound_correlation', dict(causal_edit=set_path('correlation_id', 'TEST_ONLY:correlation:x')),
        'i0/causal_correlation')
    add('CF-02', 'causal_target_revision', dict(causal_edit=set_path('target/workgraph_revision', 2)), 'i0/causal_target')
    add('CF-02', 'cause_event_never_appended', dict(hooks=dict(before_producer=lambda w: w.values.update(
        cause_event_id='TEST_ONLY:event:never-appended'))), 'read/event_unavailable')
    add('CF-02', 'caller_census_dict', dict(hooks=dict(identity_handles=lambda w, h: dict(
        h, assignment=(w.assignment.owner_id, dict(census=True))))), 'original/handle_type')
    add('CF-02', 'borrowed_owner_role', dict(hooks=dict(identity_handles=lambda w, h: dict(
        h, assignment=h['invocation']))), 'registry/role')
    add('CF-02', 'structured_original_substituted', dict(assignment_edit=substitute_structured),
        'i0/assignment/structured/unissued')
    add('CF-02', 'structured_original_sha_mismatched', dict(assignment_edit=edit_structured('sha256')),
        'i0/assignment/structured/sha256')
    add('CF-02', 'structured_original_byte_count', dict(assignment_edit=edit_structured('byte_count')),
        'i0/assignment/structured/byte_count')
    add('CF-02', 'structured_original_owner_unregistered', dict(invocation_edit=edit_structured('owner_ref')),
        'i0/invocation/structured/owner_unregistered')
    add('CF-02', 'structured_original_transaction_substituted', dict(resolver_edit=edit_structured('transaction')),
        'i0/resolver/structured/transaction')
    add('CF-02', 'structured_original_foreign_scope', dict(causal_edit=edit_structured('scope')),
        'i0/causal/structured/scope')
    add('CF-02', 'producer_source_identity_admission_substituted', dict(wps_edit=set_path(
        'identity_admission/event_id', 'goal_run.certified.v3:' + '9' * 64)), 'p9/event_id')
    add('CF-02', 'producer_source_embedded_assignment_substituted', dict(wps_edit=set_path(
        'assignment/original_assignment_revision', 2)), 'producer/source/assignment')
    add('CF-02', 'producer_source_structured_substituted', dict(wps_edit=lambda v: (substitute_structured(
        v['complete_original_evidence_inventory'] if False else dict(x=v['complete_original_evidence_inventory'])), v)[1]),
        'producer/whole_source/structured/unissued')
    add('CF-02', 'producer_effective_model_field', dict(candidate_edit=cand('payload.effective_model_ref',
                                                                          'TEST_ONLY:model:b')),
        'producer/field/payload.effective_model_ref')
    # ---------------- CF-01 whole wire and identity
    add('CF-01', 'request_foreign_scope', dict(request_edit=lambda r: dict(r, scope=dict(
        r['scope'], goal_run_id='TEST_ONLY:goal_run:other'))), 'identity/request_scope')
    add('CF-01', 'request_profile_mismatched', dict(request_edit=lambda r: dict(
        r, installed_profile_sha256='a' * 64)), 'identity/request_profile')
    add('CF-01', 'partition_lower_hex_recipe', dict(partition_recipe='lower_hex'), 'identity/partition_recomputed')
    add('CF-01', 'partition_other_storage', dict(partition_storage=lambda w: W.CF1Storage.create(
        w.work / 'other-storage')), 'identity/partition_storage')
    add('CF-01', 'start_identity_formula', dict(identity_formula='start_formula'), 'identity/independent_event_id')
    add('CF-01', 'unprefixed_identity_key', dict(identity_formula='unprefixed_key'), 'identity/independent_key')
    add('CF-01', 'revision_step_not_plus_one', dict(input_edit=lambda i: dict(
        i, goal_run_revision=i['goal_run_revision'] + 1)), 'identity/revision_step')
    add('CF-01', 'revision_as_string', dict(input_edit=lambda i: dict(i, expected_goal_run_revision='5',
                                                                       goal_run_revision=6)),
        'identity/expected_goal_run_revision/numrule/integer_type')
    add('CF-01', 'revision_as_bool', dict(input_edit=lambda i: dict(i, expected_goal_run_revision=True,
                                                                     goal_run_revision=2)),
        'identity/expected_goal_run_revision/numrule/integer_type')
    add('CF-01', 'decision_with_exception', dict(input_edit=lambda i: dict(
        i, final_certifier_decision='certified_with_approved_exception')), 'identity/decision')
    add('CF-01', 'identity_input_extra_member', dict(input_edit=lambda i: dict(i, extension='x')),
        'identity/input/schema/')
    add('CF-01', 'identity_candidate_not_issued', dict(hooks=dict(identity_wrapper=lambda w, i: w.identity.resolve(
        i[1])[1])), 'producer/identity_handle')
    add('CF-01', 'identity_from_other_owner', dict(hooks=dict(identity_wrapper=lambda w, i: (
        W.WholeIdentityOwner(w.registry, w).owner_id, i[1]))), 'original/issuer')
    add('CF-01', 'replay_only_policy', dict(candidate_edit=cand('replay_policy', 'projector_replay_only')),
        'producer/field/replay_policy')
    add('CF-01', 'missing_nullable_payload_ref', dict(candidate_edit=cand('payload_ref', DELETE)),
        'producer/required_present/payload_ref')
    add('CF-01', 'missing_nullable_node_id', dict(candidate_edit=cand('node_id', DELETE)),
        'producer/required_present/node_id')
    add('CF-01', 'envelope_extra_member', dict(candidate_edit=cand('extension', 1)), 'producer/envelope_members')
    add('CF-01', 'payload_extra_member', dict(candidate_edit=cand('payload.extension', 1)), 'producer/payload/schema/')
    add('CF-01', 'normalized_goal_run_id', dict(candidate_edit=both(
        cand('run_id', unicodedata.normalize('NFC', W.default_values()['goal_run_id'])),
        cand('payload.payload.goal_run_id', unicodedata.normalize('NFC', W.default_values()['goal_run_id'])))),
        'producer/field/run_id')
    add('CF-01', 'changed_actor_coherent', dict(candidate_edit=both(cand('actor_ref', 'TEST_ONLY:actor:other'),
                                                                     cand('payload.actor_ref', 'TEST_ONLY:actor:other'))),
        'producer/field/actor_ref')
    add('CF-01', 'changed_time_coherent', dict(candidate_edit=both(cand('occurred_at_utc', '2026-11-11T11:00:00.250Z'),
                                                                    cand('payload.occurred_at_utc',
                                                                         '2026-11-11T11:00:00.250Z'))),
        'producer/field/occurred_at_utc')
    add('CF-01', 'changed_cause_coherent', dict(candidate_edit=both(cand('causation_event_id', 'TEST_ONLY:event:other'),
                                                                     cand('payload.causation_event_ref',
                                                                          'TEST_ONLY:event:other'))),
        'producer/field/causation_event_id')
    add('CF-01', 'changed_event_id', dict(candidate_edit=cand('event_id', 'goal_run.certified.v3:' + '0' * 64)),
        'producer/field/event_id')
    add('CF-01', 'inner_key_alternate', dict(candidate_edit=cand('payload.idempotency_key', 'goal_run.certified.v3:x')),
        'producer/field/payload.idempotency_key')
    add('CF-01', 'revision_float_in_payload', dict(candidate_edit=cand('payload.goal_run_revision', 6.0)),
        'producer/payload.goal_run_revision/numrule/integer_type')
    return out


def apply_side(kw):
    side = kw.pop('_native_side', None)
    if side is None:
        return kw
    holder = {}

    def before_birth(w):
        holder['w'] = w
    acts = dict(stop=lambda w: w.goal.stop(w.scope['goal_id']),
                rebind=lambda w: w.goal.rebind(w.scope['goal_id'], 'TEST_ONLY:goal_run:other'),
                edit=lambda w: w.goal.edit(w.scope['goal_id'], goal_revision=4))
    kw.setdefault('hooks', {})['before_birth'] = before_birth
    kw['birth_edits'] = dict(native=lambda n: (acts[side](holder['w']), n)[1])
    return kw


def run(output=None, only=None):
    work = Path(tempfile.mkdtemp(prefix='pm-goal-dg-cf1-'))
    cases = []
    started = time.time()
    try:
        positives = [('ALL', 'positive_provisional_success', {}),
                     ('CF-03', 'positive_verifying_source', dict(verifying=True)),
                     ('CF-03', 'positive_document_set_present', dict(hooks=dict(before_final=lambda w: w.native.add_artifact(
                         w.scope, '.puppet-master/large.md', W.DOC_BYTES, W.DOC_BYTES,
                         docset=dict(audits=['A', 'B', 'C'], status='pass', source_byte_count=W.DOC_BYTES))))),
                     ('CF-03', 'positive_three_required_worknodes', dict(values=W.default_values(
                         worknodes=['TEST_ONLY:worknode:a', 'TEST_ONLY:worknode:b', 'TEST_ONLY:worknode:c'])))]
        for group, name, kw in positives:
            if only and group not in only and group != 'ALL':
                continue
            t = time.time()
            try:
                obs = run_path(work / name, **kw)
                detail = check_positive(obs, name)
                cases.append(dict(id=name, group=group, kind='positive', status='pass', detail=detail,
                                  seconds=round(time.time() - t, 2),
                                  recorder=obs['world'].recorder.export() if name == 'positive_provisional_success'
                                  else None))
            except Exception as error:  # noqa: BLE001
                cases.append(dict(id=name, group=group, kind='positive', status='fail',
                                  error='%s: %s' % (type(error).__name__, error)))

        def altered_retry():
            obs = run_path(work / 'altered_retry')
            altered = dict(copy.deepcopy(obs['event']), actor_ref='TEST_ONLY:actor:other')
            obs['world'].appender.append_original('TEST_ONLY:operation:certified-altered', obs['append_request'],
                                                  [altered])
        corpus = negatives() + [('CF-01', 'retry_altered_producer', None, 'append/conflict/producer25')]
        for group, name, kw, expected in corpus:
            if only and group not in only:
                continue
            t = time.time()
            try:
                if kw is None:
                    altered_retry()
                else:
                    run_path(work / name, **apply_side(dict(kw)))
                cases.append(dict(id=name, group=group, kind='negative', expected=expected, got='ACCEPTED',
                                  status='fail'))
            except (A.AdapterRefusal, S.StorageRefusal, NR.NumruleRefusal) as error:
                got = A.refusal_code(error)
                ok = got == expected or (expected.endswith('/') and got.startswith(expected))
                cases.append(dict(id=name, group=group, kind='negative', expected=expected, got=got,
                                  status='pass' if ok else 'fail', seconds=round(time.time() - t, 2)))
            except Exception as error:  # noqa: BLE001
                cases.append(dict(id=name, group=group, kind='negative', expected=expected,
                                  got='%s: %s' % (type(error).__name__, error), status='fail'))
            shutil.rmtree(work / name, ignore_errors=True)
        # Adopt the adapter's CF-01 demonstration unchanged.
        if not only or 'CF-01' in only:
            demo = DEMO.run()
            for c in demo['cases']:
                cases.append(dict(c, id='adapter_demo/' + c['id'], group='CF-01',
                                  recorder=None, adopted_from='scripts/pm_goal_test_demo_cf01.py'))
    finally:
        shutil.rmtree(work, ignore_errors=True)
    failures = [c for c in cases if c['status'] != 'pass']
    guards = {}
    for c in cases:
        if c['kind'] == 'negative' and c['status'] == 'pass':
            guards.setdefault(c['got'], []).append(c['id'])
    per_group = {}
    for g in GROUPS:
        per_group[g] = dict(positives=sum(c['kind'] == 'positive' and c['group'] in (g, 'ALL') for c in cases),
                            negatives=sum(c['kind'] == 'negative' and c['group'] == g for c in cases))
    result = dict(qualification=QUALIFICATION, native=NR.NATIVE_LINE, lane='DG-CF1', family='goal_run.certified',
                  groups=list(GROUPS), per_group=per_group,
                  positives=sum(c['kind'] == 'positive' for c in cases),
                  negatives=sum(c['kind'] == 'negative' for c in cases), guards=guards, cases=cases,
                  seconds=round(time.time() - started, 1), status='pass' if not failures else 'fail',
                  failures=failures)
    if output:
        Path(output).write_text(json.dumps(result, indent=1, sort_keys=True, ensure_ascii=False, default=str) + '\n')
    return result


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--output')
    p.add_argument('--only', help='comma-separated groups, e.g. CF-04,CF-05')
    p.add_argument('--smoke', action='store_true')
    a = p.parse_args()
    if a.smoke:
        work = Path(tempfile.mkdtemp(prefix='pm-dg-cf1-smoke-'))
        try:
            obs = run_path(work / 'p')
            print(json.dumps(check_positive(obs, 'positive')['group_checks'], indent=1, ensure_ascii=False))
        finally:
            shutil.rmtree(work, ignore_errors=True)
        return 0
    result = run(a.output, a.only.split(',') if a.only else None)
    print(json.dumps(dict(status=result['status'], positives=result['positives'], negatives=result['negatives'],
                          per_group=result['per_group'], seconds=result['seconds'],
                          failures=[(f['id'], f.get('expected'), f.get('got') or f.get('error'))
                                    for f in result['failures']]), indent=1, ensure_ascii=False))
    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
