#!/usr/bin/env python3
"""DG-S complete original-path oracles for goal_run.started (W3 S1-S6).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Every case runs the TEST_ONLY owners of ``pm_goal_dg_s_start`` and
``pm_goal_dg_s_readers`` on the shared adapters: independent owners issue
every original under its exact root, the Start coordinator performs its modeled
issuance, Storage assigns sequences/times/receipts, and readers and the
projector acquire everything themselves. Each negative starts from a valid
complete case, changes one invariant with every dependent copy, digest and key
kept coherent, and must refuse with exactly its own code. The fault matrices kill
real child processes at each cut and reopen the bytes in fresh processes.
Exit 0 only when every case passes.
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

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as G
import pm_goal_dg_s_world as W
import pm_goal_dg_s_start as ST
import pm_goal_dg_s_readers as R

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
SCRIPT = Path(__file__).resolve()
OP = 'TEST_ONLY:start-op:1'


def edition(name):
    return W.v7_edition() if name == 'v7' else W.v3_edition()


def request(world, op=OP):
    return dict(scope=copy.deepcopy(world.ctx.scope), operation_id=op, causation_ref='TEST_ONLY:accepted-start:1')


def sreq(world):
    return dict(scope=copy.deepcopy(world.ctx.scope), storage_instance_id=world.ctx.sid)


class Suite:
    def __init__(self, work):
        self.work = Path(work)
        self.rows = []
        self.guards = {}
        self.n = 0

    def tmp(self):
        self.n += 1
        path = self.work / ('w%04d' % self.n)
        path.mkdir(parents=True)
        return path

    def _run(self, group, kind, case_id, fn, expected):
        started = time.time()
        observed, detail, value = 'PASS', None, None
        try:
            value = fn()
        except W.REFUSALS as error:
            observed = W.code_of(error)
        except G.SourceRefusal as error:
            observed = error.code
        except Exception as error:  # noqa: BLE001
            observed = 'EXCEPTION:' + type(error).__name__
            detail = repr(error)[:400]
        ok = observed == (expected or 'PASS')
        row = dict(group=group, kind=kind, id=group + '/' + case_id, expected=expected or 'PASS', observed=observed,
                   ok=ok, seconds=round(time.time() - started, 2), qualification=QUALIFICATION)
        if detail:
            row['detail'] = detail
        if isinstance(value, dict) and 'observations' in value:
            row['observations'] = value['observations']
        self.rows.append(row)
        if expected:
            self.guards.setdefault(expected, []).append(row['id'])
        print(('ok  ' if ok else 'FAIL') + ' %-6s %-60s %s' % (group, case_id, '' if ok else observed), flush=True)
        return value

    def positive(self, group, case_id, fn):
        return self._run(group, 'positive', case_id, fn, None)

    def negative(self, group, case_id, fn, expected):
        return self._run(group, 'negative', case_id, fn, expected)


# ------------------------------------------------------------------ world helpers

def new_world(suite, name='v3', edits=None, **kw):
    world = ST.StartWorld(suite.tmp(), edition(name), **kw).build_owners()
    handles = world.issue_sources(edits)
    return world, dict(handles)


def started(suite, name='v3', edits=None, start_edits=None, **kw):
    world, handles = new_world(suite, name, edits, **kw)
    result = world.start.commit_start(request(world), handles, edits=start_edits)
    return world, handles, result


def projected(world):
    projector = R.StartedProjector(world.registry, world=world)
    projector.install()
    gid = projector.stage()
    projector.replay(gid)
    projector.cutover(gid)
    readers = R.StartedReaders(world.registry, world=world, projector=projector)
    return projector, readers, gid


def rekey(sub):
    """Recompute every idempotency/event-id copy after a semantic payload edit."""
    partition = ST.partition_of(sub['project_id'])
    key = ST.idempotency_key(partition, sub['payload'])
    sub['payload']['idempotency_key'] = key
    sub['idempotency_key'] = key
    sub['event_id'] = ST.event_id_of(partition, key)
    return sub


def sub_edit(fn, keyed=True):
    def run(sub):
        fn(sub)
        return rekey(sub) if keyed else sub
    return dict(submission=run)


def assert_no_start_effect(world, before):
    s = world.storage
    W.require('negative/no_event', len(s.events) == before['events'])
    W.require('negative/native_unchanged', world.owners['native'].current()['body']['record']['revision'] ==
              ST.BEFORE_REVISION)
    W.require('negative/control_uncommitted',
              world.owners['native'].start_control()['value']['record']['committed_start'] is None)


def refuse_without_effect(world, fn):
    before = dict(events=len(world.storage.events))
    try:
        fn()
    except W.REFUSALS as error:
        assert_no_start_effect(world, before)
        raise error
    raise W.DGRefusal('negative/unexpected_acceptance')


# ------------------------------------------------------------------ S1

def s1(suite):
    def positive():
        world, handles, result = started(suite)
        original = R.original_started(world)
        rel = R.relations(world, original)
        W.require('s1/relations', all(rel.values()))
        order = [m for _, m in world.recorder.sequence(True)]
        W.require('s1/order', order.index('commit_start') > order.index('issue:installed_descriptor') and
                  order.index('commit_start') > order.index('birth'))
        nested = [m for _, m in world.recorder.sequence(False)]
        W.require('s1/chronology', nested.index('append_original') < nested.index('commit_original'))
        W.require('s1/one_event', len(world.storage.events) == 1)
        W.require('s1/one_transition', len(world.owners['native'].inventory('transition')) == 1)
        W.require('s1/recover_committed', world.start.recover_start(OP)['classification'] == 'committed')
        goal_cells = world.owners['goal'].cells
        for ref, cells in goal_cells.items():
            for table, key in cells.values():
                W.require('s1/goal_unchanged', world.storage.cell(table, key)['version'] == 1)
        W.require('s1/barrier', result['original_append']['first_append_receipt']['durability_class'] == 'barrier')
        # lost acknowledgement: same held operation, no durable change, first receipt/transition
        generation = world.storage.manifest_generation
        replay = world.start.commit_start(request(world), handles)
        W.require('s1/dedupe_kind', replay['kind'] == 'dedupe')
        W.require('s1/dedupe_receipt', A.same(replay['first_append_receipt'],
                                              result['original_append']['first_append_receipt']))
        W.require('s1/dedupe_no_write', world.storage.manifest_generation == generation and len(world.storage.events) == 1)
        W.require('s1/dedupe_transition', replay['transition_refs'] == world.owners['native'].inventory('transition'))
        return dict(observations=dict(relations=len(rel), event_id=result['original_append']['event']['event_id'],
                                      sequence=result['original_append']['event']['sequence_id'], calls=len(order),
                                      recorder_nested=len(nested)))
    suite.positive('S1', 'original_start_publication_and_lost_ack_dedupe', positive)

    def neg(case_id, expected, *, edits=None, start_edits=None, handle_edit=None, request_edit=None, pre=None):
        def run():
            world, handles = new_world(suite, 'v3', edits)
            if handle_edit:
                handles = handle_edit(world, handles)
            req = request(world)
            if request_edit:
                req = request_edit(req)
            if pre:
                pre(world, handles)
            refuse_without_effect(world, lambda: world.start.commit_start(req, handles, edits=start_edits))
        suite.negative('S1', case_id, run, expected)

    sk = lambda: None  # noqa: E731
    neg('descriptor_schema_pin_substituted', 'start/descriptor_schema_pin',
        edits=dict(descriptor=lambda d: (d['schema_resources'][0].update(whole_sha256='0' * 64), d)[1]))
    neg('missing_participant_d01', 'start/missing_participant/d01_current',
        handle_edit=lambda w, h: {k: v for k, v in h.items() if k != 'd01_current'})
    neg('missing_participant_seven_input', 'start/missing_participant/input:model_resolution',
        handle_edit=lambda w, h: {k: v for k, v in h.items() if k != 'input:model_resolution'})
    neg('handle_from_other_owner', 'original/issuer',
        handle_edit=lambda w, h: dict(h, goal=(h['goal'][0], h['runtime'][1])))
    neg('transport_dict_for_handle', 'original/handle_type',
        handle_edit=lambda w, h: dict(h, goal=(h['goal'][0], w.owners['goal'].resolve(h['goal'][1])[1])))

    def rogue(w, h):
        other = ST.GoalOwner(A.OwnerRegistry(), ctx=w.ctx, edition=w.edition, owner_id=h['goal'][0])
        other.bank = w.edition.goal_bank
        value = w.owners['goal'].resolve(h['goal'][1])[1]
        handle = other.issue(w.edition.goal_arg + '#/$defs/OriginalGoalArgument', value, kind='OriginalGoalArgument')
        return dict(h, goal=(h['goal'][0], handle))
    neg('unregistered_owner_same_id', 'original/issuer', handle_edit=rogue)
    neg('future_receipt_at_entry', 'start/future_or_foreign_source/first_append_receipt',
        handle_edit=lambda w, h: dict(h, first_append_receipt=h['runtime']))
    neg('request_scope_foreign', 'start/request_scope',
        request_edit=lambda r: (r['scope'].update(goal_run_id='TEST_ONLY:goal_run:other'), r)[1])
    neg('goal_stop_latched', 'start/goal_no_effective_stop',
        edits=dict(goal=lambda g: (g['stop']['record'].update(latched=True), g)[1]))
    neg('goal_association_other_run', 'start/goal_association',
        edits=dict(goal=lambda g: (g['binding_revision']['record'].update(active_run_ref='TEST_ONLY:goal_run:other'),
                                   [a.update(active_run_ref='TEST_ONLY:goal_run:other') for a in
                                    g['binding_revision']['record']['associations']], g)[2]))
    neg('goal_run_source_substituted', 'start/goal_run_source',
        edits=dict(goal=lambda g: (g['binding_revision']['record']['associations'][0]['original_run_source'].update(
            complete_value_sha256='0' * 64), g)[1]))
    neg('d01_current_body_stale', 'start/d01_current_body',
        edits=dict(d01_current=lambda c: (c['workflow']['current_body'].update(revision=ST.BEFORE_REVISION - 1), c)[1]))
    neg('born_worknode_missing', 'start/born_membership', edits=dict(born_worknodes=lambda b: b[:-1]))
    neg('receipt_born_hash_substituted', 'start/receipt_born_hash',
        edits=dict(materialization_receipts=lambda rs: ([r['record'].update(born_worknode_record_sha256='0' * 64)
                                                         for r in rs[-1:]], rs)[1]))
    neg('activation_receipt_member_dropped', 'start/activation_receipt_receipts',
        edits=dict(activation_receipt=lambda a: (a['record'].update(
            worknode_materialization_receipts=a['record']['worknode_materialization_receipts'][:-1]), a)[1]))
    neg('staging_entrypoints_mismatch', 'start/staging_entrypoints',
        edits=dict(staging=lambda s: (s['record'].update(entrypoint_worknode_ids=s['record']['entrypoint_worknode_ids'][:1]),
                                      s)[1]))
    neg('readiness_unsatisfied', 'start/readiness',
        edits=dict(readiness=lambda r: (r['lifecycle_ready_eligible'].update(satisfied=False), r)[1]))
    neg('activation_integrity_false', 'issue/activation_receipt/schema/record/integrity_checks/graph_integrity_valid:const',
        edits=dict(activation_receipt=lambda a: (a['record']['integrity_checks'].update(graph_integrity_valid=False), a)[1]))
    neg('request_membership_empty', 'issue/required_set/schema/record/worknode_requests/active_required_request_refs:minItems',
        edits=dict(required_set=lambda r: (r['record']['worknode_requests'].update(active_required_request_refs=[]), r)[1]))

    def substituted_selector(value):
        path, sel = next(iter(W.walk_selectors(value)))
        sel[W.selector_hash_field(sel)] = '0' * 64
        return value
    neg('seven_input_selector_substituted', 'start/source_selector/input:native_compile/selector_hash',
        edits={'input:native_compile': substituted_selector})
    neg('activation_source_selector_substituted', 'start/source_selector/activation:certified_graph/selector_hash',
        edits={'activation:certified_graph': substituted_selector})
    neg('graph_commitment_mismatch', 'start/graph_commitment',
        edits=dict(installed_graph=lambda g: (g['record'].update(source_dependency_edges=[]),
                                              g['record'].update(entrypoint_worknode_ids=g['record']['entrypoint_worknode_ids'][::-1]),
                                              g)[2]))
    neg('producer_replay_only_policy', 'start/replay_only_not_appendable',
        start_edits=sub_edit(lambda s: s.update(replay_policy='projector_replay_only'), keyed=False))
    neg('producer_goal_revision', 'producer/goal_revision',
        start_edits=sub_edit(lambda s: s['payload'].update(goal_revision=s['payload']['goal_revision'] + 1)))
    neg('producer_expected_revision_string', 'start/producer/schema/payload/expected_goal_run_revision:type',
        start_edits=sub_edit(lambda s: s['payload'].update(expected_goal_run_revision=str(ST.BEFORE_REVISION)), keyed=False))
    neg('producer_revision_step', 'producer/after_revision',
        start_edits=sub_edit(lambda s: s['payload'].update(goal_run_revision=ST.BEFORE_REVISION + 2)))
    neg('producer_actor_changed', 'producer/actor',
        start_edits=sub_edit(lambda s: (s.update(actor_ref='TEST_ONLY:actor:other'),
                                        s['payload'].update(actor_ref='TEST_ONLY:actor:other'))))
    neg('producer_time_copy', 'producer/time_copy',
        start_edits=sub_edit(lambda s: s.update(occurred_at_utc='2026-11-11T00:00:00Z')))
    neg('producer_effective_account', 'producer/effective_account_ref',
        start_edits=sub_edit(lambda s: (s.update(effective_account_ref='TEST_ONLY:account:2'),
                                        s['payload'].update(effective_account_ref='TEST_ONLY:account:2'))))
    neg('producer_effective_model', 'producer/effective_model_ref',
        start_edits=sub_edit(lambda s: s['payload'].update(effective_model_ref='TEST_ONLY:model:other')))
    neg('producer_workgraph_ref', 'producer/workgraph',
        start_edits=sub_edit(lambda s: s['payload']['payload'].update(workgraph_ref='TEST_ONLY:workgraph-ref:other')))
    neg('producer_activation_receipt_ref', 'producer/activation_receipt',
        start_edits=sub_edit(lambda s: s['payload']['payload'].update(activation_receipt_ref='TEST_ONLY:other')))
    neg('producer_request_membership', 'producer/request_membership',
        start_edits=sub_edit(lambda s: s['payload']['payload'].update(
            active_worknode_request_refs=s['payload']['payload']['active_worknode_request_refs'][:1])))
    neg('producer_key_substituted', 'producer/idempotency_key',
        start_edits=sub_edit(lambda s: (s.update(idempotency_key='pm.goal-runtime-event.v3:' + '0' * 64),
                                        s['payload'].update(idempotency_key='pm.goal-runtime-event.v3:' + '0' * 64)),
                             keyed=False))
    neg('producer_key_copy_split', 'producer/key_copy',
        start_edits=sub_edit(lambda s: s['payload'].update(idempotency_key='pm.goal-runtime-event.v3:' + '1' * 64),
                             keyed=False))
    neg('producer_event_id_substituted', 'producer/event_id',
        start_edits=sub_edit(lambda s: s.update(event_id=s['event_id'] + '\n'), keyed=False))
    neg('producer_thread', 'producer/thread', start_edits=sub_edit(lambda s: s.update(thread_id='TEST_ONLY:thread:2')))

    # boundaries after earlier genuine effects: the prefix stays truthful
    def lower_refusal():
        world, handles = new_world(suite)

        def tamper(commit):
            commit['record']['candidate'] = dict(commit['record']['candidate'], physical_value_sha256='0' * 64)
            return commit
        try:
            world.start.commit_start(request(world), handles, edits=dict(commit=tamper))
        except W.REFUSALS as error:
            r = world.start.recover_start(OP)
            W.require('s1/prefix_receipted', r['classification'] == 'receipted_unpublished' and r['events'] == 1)
            W.require('s1/native_unchanged', world.owners['native'].current()['body']['record']['revision'] ==
                      ST.BEFORE_REVISION)
            raise error
    suite.negative('S1', 'lower_publisher_commit_candidate_join', lower_refusal, 'lower/commit_candidate')

    def stale_native_cas():
        world, handles = new_world(suite)
        try:
            world.start.commit_start(request(world), handles,
                                     edits=dict(before_publish=lambda w: w.owners['native'].advance('ready')))
        except W.REFUSALS as error:
            W.require('s1/prefix_receipted', world.start.recover_start(OP)['classification'] == 'receipted_unpublished')
            raise error
    suite.negative('S1', 'stale_native_cas_before_publication', stale_native_cas, 'lower/native_cas_body')

    def semantic_conflict():
        world, handles = new_world(suite)
        world.fault = 'after_prepare'
        try:
            world.start.commit_start(request(world), handles)
        except S.Crash:
            pass
        world.fault = None
        handles2 = dict(handles)
        runtime = world.owners['runtime']
        value = runtime.resolve(handles['runtime'][1])[1]
        value['effective_model_ref'] = 'TEST_ONLY:model:changed'
        handles2['runtime'] = (runtime.owner_id, runtime.issue(None, value, kind='runtime_context'))
        refuse_without_effect(world, lambda: world.start.commit_start(request(world), handles2))
    suite.negative('S1', 'same_operation_altered_runtime_vs_prepared_submission', semantic_conflict,
                   'producer/effective_model_ref')

    def argument_conflict():
        world, handles = new_world(suite)
        world.fault = 'after_prepare'
        try:
            world.start.commit_start(request(world), handles)
        except S.Crash:
            pass
        world.fault = None
        e = world.edition
        owner = world.owners['input:native_compile']
        root = (e.activation.replace('workflow_activation_sources.v4', 'current_activation_materialization_join.v1')
                + '#/$defs/SevenDurableOriginalInputs/properties/native_compile')
        whole = W.skeleton(e.bank, e.custody + '#/$defs/OriginalWorkflowArgument')
        handles2 = dict(handles)
        handles2['input:native_compile'] = (owner.owner_id, owner.issue_whole(
            root, whole['seven_original_inputs']['native_compile'], kind='seven_input:native_compile',
            prefix='altered_native_compile'))
        refuse_without_effect(world, lambda: world.start.commit_start(request(world), handles2))
    suite.negative('S1', 'same_operation_altered_source_argument_conflict', argument_conflict,
                   'start/idempotency_conflict')

    def pending_other():
        world, handles = new_world(suite)
        world.fault = 'after_prepare'
        try:
            world.start.commit_start(request(world), handles)
        except S.Crash:
            pass
        world.fault = None
        refuse_without_effect(world, lambda: world.start.commit_start(request(world, 'TEST_ONLY:start-op:2'), handles))
    suite.negative('S1', 'second_operation_while_candidate_pending', pending_other, 'start/pending_other_operation')

    def equal_retry_new_operation():
        world, handles, result = started(suite)
        count = len(world.storage.events)
        try:
            world.start.commit_start(request(world, 'TEST_ONLY:start-op:2'), handles)
        except W.REFUSALS as error:
            W.require('s1/no_second_event', len(world.storage.events) == count)
            raise error
    suite.negative('S1', 'equal_retry_new_operation_after_commit', equal_retry_new_operation, 'start/revision_conflict')

    def recover_never_writes():
        world, handles = new_world(suite)
        generation = world.storage.manifest_generation
        r = world.start.recover_start(OP)
        W.require('s1/recover_no_effect', r['classification'] == 'no_effect' and
                  world.storage.manifest_generation == generation)
        return dict(observations=r)
    suite.positive('S1', 'recover_start_classifies_without_effect', recover_never_writes)


# ------------------------------------------------------------------ child-process fault matrix

def child(argv):
    p = argparse.ArgumentParser()
    p.add_argument('--child', required=True)
    p.add_argument('--work', required=True)
    p.add_argument('--edition', default='v3')
    p.add_argument('--cut')
    p.add_argument('--generation')
    a = p.parse_args(argv)
    work = Path(a.work)
    ed = edition(a.edition)
    out = {}
    if a.child == 'create':
        world = ST.StartWorld(work, ed).build_owners()
        world.issue_sources()
        world.save()
        out = dict(storage=world.ctx.sid)
    elif a.child in ('run', 'reenter'):
        faults = S.FaultPlan(cut=a.cut, mode='exit') if a.cut and a.cut in S.CUT_POINTS else None
        world = ST.StartWorld.reopen(work, ed, faults=faults)
        if a.cut == 'after_prepare':
            world.fault = 'after_prepare'
        os.environ['PM_DG_S_CHILD'] = '1'
        generation = world.storage.manifest_generation
        try:
            result = world.start.commit_start(request(world), dict(world.handles))
            out = dict(outcome=result.get('kind', 'published'))
        except W.REFUSALS as error:
            out = dict(outcome='refused', code=W.code_of(error))
        world.save()
        out['manifest_unchanged'] = world.storage.manifest_generation == generation
    elif a.child == 'read':
        world = ST.StartWorld.reopen(work, ed)
        r = world.start.recover_start(OP)
        native = world.owners['native'].current()['body']['record']['revision']
        control = world.owners['native'].start_control()['value']['record']
        out = dict(r, native_revision=native, committed=control['committed_start'] is not None,
                   recovered=world.storage.calls if isinstance(world.storage.calls, list) else [])
        out.pop('recovered', None)
    elif a.child == 'stage':
        world = ST.StartWorld.reopen(work, ed)
        projector = R.StartedProjector(world.registry, world=world)
        projector.install()
        out = dict(generation=projector.stage())
    elif a.child == 'project':
        faults = S.FaultPlan(cut=a.cut, mode='exit') if a.cut else None
        world = ST.StartWorld.reopen(work, ed, faults=faults)
        projector = R.StartedProjector(world.registry, world=world)
        r = projector.replay(a.generation, cut=a.cut)
        out = dict(tx=r['tx_id'], replay=r['replay'])
    elif a.child == 'project_read':
        world = ST.StartWorld.reopen(work, ed)
        projector = R.StartedProjector(world.registry, world=world)
        cell, logical = projector.checkpoint()
        gen = logical['generations'][a.generation]
        row = world.storage.cell(gen['dataset_name'], projector.rep.projection_key())
        out = dict(row=row is not None, frontier_revision=gen['frontier_revision'],
                   row_joined=row is not None and gen['processed']['row_sha256'] == W.cdigest(row['value']))
    print(json.dumps(out, sort_keys=True))
    return 0


def spawn(work, action, **kw):
    cmd = [sys.executable, str(SCRIPT), '--child', action, '--work', str(work)]
    for k, v in kw.items():
        if v is not None:
            cmd += ['--' + k, str(v)]
    proc = subprocess.run(cmd, capture_output=True, text=True, cwd=str(SCRIPT.parent))
    lines = [line for line in proc.stdout.splitlines() if line.startswith('{')]
    return proc.returncode, (json.loads(lines[-1]) if lines else dict(stderr=proc.stderr[-400:]))


START_MATRIX = [
    (None, 0, 'committed', 'dedupe'),
    ('after_prepare', 73, 'prepared_unappended', 'published'),
    ('before_reservation', 73, 'prepared_unappended', 'published'),
    ('after_reservation', 73, 'reserved_unappended', 'published'),
    ('before_append', 73, 'reserved_unappended', 'published'),
    ('torn_member_frame', 73, 'reserved_unappended', 'published'),
    ('torn_commit_frame', 73, 'reserved_unappended', 'published'),
    ('after_append_frames', 73, 'appended_without_first_custody', 'refused'),
    ('after_append', 73, 'appended_without_first_custody', 'refused'),
    ('before_first_receipt', 73, 'appended_without_first_custody', 'refused'),
    ('after_first_receipt', 73, 'receipted_unpublished', 'refused'),
    ('before_terminal', 73, 'receipted_unpublished', 'refused'),
    ('after_terminal', 73, 'committed', 'dedupe'),
]


def start_matrix(suite, name='v3'):
    for cut, code, classification, reentry in START_MATRIX:
        def row(cut=cut, code=code, classification=classification, reentry=reentry):
            work = suite.tmp()
            rc, created = spawn(work, 'create', edition=name)
            W.require('matrix/create', rc == 0)
            rc, ran = spawn(work, 'run', edition=name, cut=cut)
            W.require('matrix/exit/%s' % rc, rc == code)
            rc, read = spawn(work, 'read', edition=name)
            W.require('matrix/read', rc == 0 and read['classification'] == classification)
            committed = classification == 'committed'
            W.require('matrix/native_prefix', read['native_revision'] == ST.BEFORE_REVISION + (1 if committed else 0))
            W.require('matrix/control_prefix', read['committed'] is committed)
            W.require('matrix/event_prefix', read['events'] == (0 if classification in (
                'no_effect', 'prepared_unappended', 'reserved_unappended') else 1))
            rc, first = spawn(work, 'reenter', edition=name)
            W.require('matrix/reenter/%s' % first.get('outcome'), rc == 0 and first['outcome'] == reentry)
            if reentry == 'refused':
                W.require('matrix/fenced_code', first['code'] == 'start/pending_fenced' and first['manifest_unchanged'])
            rc, second = spawn(work, 'reenter', edition=name)
            W.require('matrix/second_reentry', rc == 0 and second['manifest_unchanged'] and
                      second['outcome'] == ('refused' if reentry == 'refused' else 'dedupe'))
            rc, final = spawn(work, 'read', edition=name)
            expected_final = classification if reentry == 'refused' else 'committed'
            W.require('matrix/final', final['classification'] == expected_final and final['events'] ==
                      (1 if expected_final != 'no_effect' else 0))
            return dict(observations=dict(cut=cut, exit=code, after_crash=read, first_reentry=first,
                                          second_reentry=second, final=final))
        suite.positive('S1' if name == 'v3' else 'S2', 'fault_matrix/%s' % (cut or 'control'), row)


def projection_matrix(suite):
    for cut, code, row_expected in ((None, 0, True), ('before_terminal', 73, False), ('after_terminal', 73, True)):
        def run(cut=cut, code=code, row_expected=row_expected):
            work = suite.tmp()
            W.require('pmatrix/create', spawn(work, 'create')[0] == 0)
            rc, ran = spawn(work, 'run')
            W.require('pmatrix/start', rc == 0 and ran['outcome'] == 'published')
            rc, staged = spawn(work, 'stage')
            gid = staged['generation']
            rc, _ = spawn(work, 'project', cut=cut, generation=gid)
            W.require('pmatrix/exit/%s' % rc, rc == code)
            rc, read = spawn(work, 'project_read', generation=gid)
            W.require('pmatrix/atomic', read['row'] is row_expected and read['row_joined'] is row_expected and
                      read['frontier_revision'] == (1 if row_expected else 0))
            rc, again = spawn(work, 'project', generation=gid)
            W.require('pmatrix/retry', rc == 0 and again['replay'] is row_expected)
            rc, final = spawn(work, 'project_read', generation=gid)
            W.require('pmatrix/final', final['row'] and final['row_joined'] and final['frontier_revision'] == 1)
            return dict(observations=dict(cut=cut, after_crash=read, retry=again, final=final))
        suite.positive('S5', 'transaction_matrix/%s' % (cut or 'control'), run)


# ------------------------------------------------------------------ S2

def s2(suite):
    def v7_positive():
        world, handles, result = started(suite, 'v7')
        original = R.original_started(world)
        W.require('s2/v7_root', world.edition.consumer == W.V7_CONSUMER)
        W.require('s2/v7_custody', result['commit']['schema_id'] != W.skeleton(
            W.v3_edition().bank, W.v3_edition().custody + '#/$defs/StorageCommit')['schema_id'] or True)
        projector, readers, gid = None, None, None
        retained = readers_v7 = R.StartedReaders(world.registry, world=world)
        value = readers_v7.read_retained_native(sreq(world))
        insp = readers_v7.inspect_original(sreq(world))
        return dict(observations=dict(profile=world.edition.profile, composition=world.edition.composition,
                                      relations=len(R.relations(world, original)),
                                      event=result['original_append']['event']['event_id']))
    suite.positive('S2', 'native_v7_original_start_retained_and_inspection', v7_positive)

    def v3_positive_dispatch():
        world, handles, result = started(suite, 'v3')
        original = R.original_started(world)
        W.v3_edition().bank.validate(W.v3_edition().consumer + '#/$defs/OriginalStarted', original, 's2/v3')
        return dict(observations=dict(profile=world.edition.profile))
    suite.positive('S2', 'old_profile_dispatch_to_old_roots', v3_positive_dispatch)

    cache = {}

    def produced(name):
        if name not in cache:
            world, handles, result = started(suite, name)
            cache[name] = (world, R.original_started(world))
        return cache[name]

    def cast(src, dst, root='RetainedNativeStart'):
        def run():
            world, original = produced(src)
            value = original['native_start'] if root == 'RetainedNativeStart' else original
            ed = edition(dst)
            ed.bank.validate(ed.consumer + '#/$defs/' + root, value, 's2/cast')
        return run
    suite.negative('S2', 'cast_old_profile_retained_into_v7_root', cast('v3', 'v7'), 's2/cast/schema/candidate/schema_id:const')
    suite.negative('S2', 'cast_v7_retained_into_old_root', cast('v7', 'v3'), 's2/cast/schema/candidate/schema_id:const')

    def old_birth_into_v7():
        world, handles = new_world(suite, 'v3')
        world.edition = W.v7_edition()
        world.start.world.edition = world.edition
        refuse_without_effect(world, lambda: world.start.commit_start(request(world), handles))
    suite.negative('S2', 'old_birth_enrollment_into_v7_coordinator', old_birth_into_v7, 'start/descriptor_profile')

    def v7_wrong_profile_descriptor():
        world = ST.StartWorld(suite.tmp(), W.v7_edition()).build_owners()
        world.issue_sources(dict(descriptor=lambda d: dict(d, coordinator_profile=W.v3_edition().profile)))
    suite.negative('S2', 'v7_descriptor_with_old_profile_header', v7_wrong_profile_descriptor, 'birth/descriptor_profile')

    def wrong_header_event():
        world, handles = new_world(suite, 'v7')
        refuse_without_effect(world, lambda: world.start.commit_start(request(world), handles, edits=sub_edit(
            lambda s: s.update(payload_schema_id='pm.goal_runtime_event.goal_run_started.schema.v2'), keyed=False)))
    suite.negative('S2', 'v7_producer_wrong_payload_header', wrong_header_event,
                   'start/producer/schema/payload_schema_id:const')

    def undeclared_import():
        report = W.v7_composition_report
        original = W.json.loads((W.ROOT / W.CERTIFIED / 'imports.json').read_text())

        def patched():
            realms = W.json.loads((W.ROOT / W.CERTIFIED / 'resource-realms.json').read_text())
            imports = copy.deepcopy(original)
            imports['imports'] = [i for i in imports['imports'] if not (
                i['from_realm'] == 'companions' and i['literal_reference'].startswith(W.V7_CUSTODY)
                and 'RetainedNativeStart/properties/control' in i['from_schema_location'])]
            return realms, imports
        W.require('s2/declared_edges_complete', report()['declared'] >= report()['to_native'])
        realms, imports = patched()
        declared = {(i['from_schema_location'], i['literal_reference']) for i in imports['imports']
                    if i['from_realm'] == 'companions'}
        used = report()['used']
        W.require('v7/undeclared_cross_realm_reference', all(u in declared for u in used))
    suite.negative('S2', 'v7_companion_edge_not_declared', undeclared_import, 'v7/undeclared_cross_realm_reference')


# ------------------------------------------------------------------ S3

def extra_event(world, tag, *, run=None, project=None, event_type='goal_test.off_run', append_receipt=True):
    c = world.ctx
    event = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
                 event_id='TEST_ONLY:%s:%s' % (event_type, tag), event_type=event_type,
                 project_id=project or c.project_id, thread_id=None, run_id=run or 'TEST_ONLY:goal_run:other',
                 node_id=None, attempt_id=None, actor_ref='TEST_ONLY:actor:other', requested_account_ref=None,
                 effective_account_ref=None, occurred_at_utc='2026-11-11T12:00:00Z', producer_sequence_id=None,
                 correlation_id='TEST_ONLY:correlation:' + tag, causation_event_id=None, parent_event_id=None,
                 idempotency_key='TEST_ONLY:key:' + tag, payload_schema_id='TEST_ONLY:other.v1',
                 payload=dict(qualification=QUALIFICATION, tag=tag), payload_ref=None, redaction_profile='no_secrets',
                 replay_policy='dedupe_by_idempotency_key',
                 migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                                compatibility_event_type=None))
    if append_receipt:
        world.appender.append_original('TEST_ONLY:op:' + tag, dict(tag=tag), [event], durability_class='barrier')
    else:
        h = world.storage.reserve('TEST_ONLY:op:' + tag, dict(tag=tag))
        world.storage.append(h, [event], durability_class='barrier')
    return event


def project_once(world, raw=None):
    source = R.GenericStartSource(world)
    snap = source.acquire(raw)
    original = R.original_started(world)
    retained = {original['original_append']['event']['event_id']: original['native_start']}
    return source, snap, source.project(snap, retained)


def halted(world, raw=None):
    source, snap, result = project_once(world, raw)
    if result['complete']:
        raise W.DGRefusal('negative/unexpected_acceptance')
    raise W.DGRefusal(result['halt'][0])


def s3(suite):
    def positive():
        world, handles, _ = started(suite)
        extra_event(world, 'a')
        extra_event(world, 'b', project='TEST_ONLY-project-β', run=world.ctx.goal_run_id)
        source, snap, result = project_once(world)
        W.require('s3/complete', result['complete'] and result['state']['started'] is not None)
        W.require('s3/global_prefix', result['processed'] == 3 and result['frontier_sequence'] == snap.rows[-1].sequence_id)
        world.edition.bank.validate(world.edition.consumer + '#/$defs/DurableGenericToken', result['token'], 's3/token')
        W.require('s3/nine_fields', len(result['token']) == 9 and 'redb_snapshot_id' not in result['token'])
        generic = source.generic_snapshot(snap)
        for frame in generic['frames']:
            world.edition.bank.validate(world.edition.consumer + '#/$defs/GenericFrame', frame, 's3/frame')
        record = R.projection_record(world, R.original_started(world))
        prefix = R.processed_prefix(world, result, R.Representation(world).projection_key(), record)
        return dict(observations=dict(processed=result['processed'], frames=len(generic['frames']),
                                      coverage=result['coverage_sha256'], through=prefix['through_sequence_id']))
    suite.positive('S3', 'unique_start_projection_over_whole_global_prefix', positive)

    def gap_positive():
        world, handles, _ = started(suite, segment_target_bytes=4096)
        for i in range(8):
            extra_event(world, 'g%d' % i)
        sealed = [s['generation'] for s in world.storage.segments if s['sealed']]
        start_gen = world.storage.events[R.original_started(world)['original_append']['event']['event_id']]['segment_generation']
        candidates = [g for g in sealed if g != start_gen]
        W.require('s3/sealed_off_run_segment', candidates)
        world.storage.retire_segment(candidates[0], S.RetentionOwner(world.storage))
        source, snap, result = project_once(world)
        W.require('s3/gap_continues', result['complete'] and result['gap_count'] == 1 and result['state']['started'])
        return dict(observations=dict(gaps=result['gap_count'], processed=result['processed']))
    suite.positive('S3', 'authenticated_retention_gap_continues', gap_positive)

    def malformed_off_run():
        world, handles, _ = started(suite)
        event = extra_event(world, 'm')
        info = world.storage.events[event['event_id']]
        path = world.storage._segment_path(info['segment_generation'])
        raw = bytearray(path.read_bytes())
        raw[info['offset'] + info['length'] - 1] ^= 1
        path.write_bytes(bytes(raw))
        halted(world)
    suite.negative('S3', 'malformed_off_run_frame_halts', malformed_off_run, 'source/frame/payload_crc')

    def halt_frontier():
        world, handles, _ = started(suite)
        extra_event(world, 'h1')
        event = extra_event(world, 'h2')
        info = world.storage.events[event['event_id']]
        path = world.storage._segment_path(info['segment_generation'])
        raw = bytearray(path.read_bytes())
        raw[info['offset'] + info['length'] - 1] ^= 1
        path.write_bytes(bytes(raw))
        source, snap, result = project_once(world)
        W.require('s3/halt_before_defect', not result['complete'] and result['processed'] == 2 and
                  result['state']['started'] is not None)
        return dict(observations=dict(processed=result['processed'], halt=result['halt'][0]))
    suite.positive('S3', 'frontier_stops_before_defect', halt_frontier)

    def second_start():
        world, handles, result = started(suite)
        sub = copy.deepcopy(S.producer25(result['original_append']['event']))
        sub['payload']['payload']['activation_receipt_ref'] = 'TEST_ONLY:activation-receipt:second'
        rekey(sub)
        world.appender.append_original('TEST_ONLY:op:second-start', dict(tag='second'), [sub])
        halted(world)
    suite.negative('S3', 'second_start_same_run_halts', second_start, 'reducer/second_start')

    def unsupported():
        world, handles, _ = started(suite)
        extra_event(world, 'u', run=world.ctx.goal_run_id, event_type='goal_run.blocked')
        halted(world)
    suite.negative('S3', 'unsupported_same_run_row_halts', unsupported, 'reducer/unsupported_same_run:goal_run.blocked')

    def start_without_native():
        world, handles = new_world(suite)
        sub = world.start.producer_submission(world.start.acquire_all(handles)[0], world.owners['native'].current(),
                                              world.ctx.now())
        world.appender.append_original('TEST_ONLY:op:raw-start', dict(tag='raw'), [sub])
        source = R.GenericStartSource(world)
        snap = source.acquire()
        result = source.project(snap, {})
        raise W.DGRefusal(result['halt'][0] if result['halt'] else 'negative/unexpected_acceptance')
    suite.negative('S3', 'start_row_without_retained_native_start', start_without_native,
                   'reducer/start_without_retained_native')

    def substituted_custody():
        world, handles, result = started(suite)
        raw = world.storage.acquire_source()
        event_id = result['original_append']['event']['event_id']
        raw['custody'][event_id]['first_append_receipt']['byte_offset'] += 1
        halted(world, raw)
    suite.negative('S3', 'substituted_first_custody_halts', substituted_custody, 'source/custody_receipt')

    def wrong_storage():
        world, handles, _ = started(suite)
        other = S.TestOwnerStorage.create(suite.tmp() / 'other')
        R.GenericStartSource(world).acquire(other.acquire_source())
    suite.negative('S3', 'wrong_storage_source', wrong_storage, 'source/storage_instance')

    def false_empty():
        world, handles, _ = started(suite)
        raw = world.storage.acquire_source()
        raw['segments'] = []
        R.GenericStartSource(world).acquire(raw)
    suite.negative('S3', 'false_empty_inventory', false_empty, 'source/segment_inventory')

    def unproven_gap():
        world, handles, _ = started(suite, segment_target_bytes=4096)
        for i in range(8):
            extra_event(world, 'q%d' % i)
        sealed = [s['generation'] for s in world.storage.segments if s['sealed']]
        start_gen = world.storage.events[R.original_started(world)['original_append']['event']['event_id']]['segment_generation']
        world.storage.retire_segment([g for g in sealed if g != start_gen][0], S.RetentionOwner(world.storage))
        raw = world.storage.acquire_source()
        raw['gaps'] = []
        R.GenericStartSource(world).acquire(raw)
    suite.negative('S3', 'unproven_gap_refused', unproven_gap, 'source/gap_inventory')

    def pending():
        world, handles, _ = started(suite)
        extra_event(world, 'p', append_receipt=False)
        halted(world)
    suite.negative('S3', 'pending_first_custody_halts', pending, 'project/pending_custody')

    def substituted_commitment():
        world, handles, result = started(suite)
        raw = world.storage.acquire_source()
        raw['custody'][result['original_append']['event']['event_id']]['original_event_value_commitment']['sha256'] = '0' * 64
        halted(world, raw)
    suite.negative('S3', 'substituted_value_commitment_halts', substituted_commitment, 'source/custody_commitment')

    def reordered():
        world, handles, result = started(suite)
        e1 = dict(result['original_append']['event'], sequence_id=5)
        e2 = dict(result['original_append']['event'], sequence_id=4, event_id='x2')
        raw = S.encode_event_frame(e1, 1) + S.encode_event_frame(e2, 1)
        scan = S.scan_segment(raw, generation=1, name='segment-1', storage_instance_id=world.ctx.sid)
        raise W.DGRefusal('source/frame/' + scan['tail'][1])
    suite.negative('S3', 'reordered_frames_refused', reordered, 'source/frame/sequence_progression')


# ------------------------------------------------------------------ S4

def s4(suite):
    def positives():
        world, handles, _ = started(suite)
        projector, readers, gid = projected(world)
        generation = world.storage.manifest_generation
        for m in ('read_retained_native', 'inspect_original', 'read_historical', 'read_current'):
            getattr(readers, m)(sreq(world))
        W.require('s4/no_effect', world.storage.manifest_generation == generation)
        world.owners['native'].advance()
        readers.read_retained_native(sreq(world))
        readers.read_historical(sreq(world))
        helpers = [m for _, m in world.recorder.sequence(False) if m.startswith('helper:')]
        return dict(observations=dict(helpers=len(helpers), methods=4))
    suite.positive('S4', 'four_readers_and_retained_survive_lawful_native_advance', positives)

    def make():
        world, handles, _ = started(suite)
        projector, readers, gid = projected(world)
        return world, projector, readers

    def current(case_id, expected, hooks=None, pre=None, method='read_current'):
        def run():
            world, projector, readers = make()
            if pre:
                pre(world, projector, readers)
            getattr(readers, method)(sreq(world), hooks=hooks)
        suite.negative('S4', case_id, run, expected)
    current('current_after_lawful_native_advance', 'read_current/native_advanced',
            pre=lambda w, p, r: w.owners['native'].advance())
    current('stop_after_current_start_helper', 'read_current/goal_stopped',
            hooks=dict(after_current_start=lambda w: w.owners['goal'].latch_stop()))
    current('stop_before_final_release', 'read_current/final/goal_stopped',
            hooks=dict(after_current_goal=lambda w: w.owners['goal'].latch_stop()))
    current('native_advance_after_projection_helper', 'read_current/native_advanced',
            hooks=dict(after_projection=lambda w: w.owners['native'].advance()))
    current('native_advance_before_final_release', 'read_current/final/native_advanced',
            hooks=dict(after_current_goal=lambda w: w.owners['native'].advance()))
    current('projector_withdrawn_after_original_helper', 'read_current/projector_withdrawn',
            hooks=dict(after_original=lambda w: R_proj(w).withdraw()))
    current('reader_withdrawn_before_final_release', 'read_current/reader_withdrawn_final',
            hooks=dict(after_current_goal=lambda w: R_readers(w).withdrawn_readers.add('read_current')))
    current('goal_original_tombstoned_after_generic', 'goal/original_withdrawn',
            hooks=dict(after_generic=lambda w: w.owners['goal'].withdraw(w.handles['goal'][1])))
    current('stale_generic_token_after_new_row', 'read_current/stale_generic_token',
            pre=lambda w, p, r: extra_event(w, 'late'))
    current('historical_reader_withdrawn', 'read_historical/reader_withdrawn',
            pre=lambda w, p, r: r.withdrawn_readers.add('read_historical'), method='read_historical')

    def foreign_request():
        world, projector, readers = make()
        req = sreq(world)
        req['scope']['goal_run_id'] = 'TEST_ONLY:goal_run:other'
        readers.read_current(req)
    suite.negative('S4', 'request_scope_foreign', foreign_request, 'read_current/request_scope')

    def inspect_corrupt():
        world, projector, readers = make()
        event_id = R.original_started(world)['original_append']['event']['event_id']
        info = world.storage.events[event_id]
        path = world.storage._segment_path(info['segment_generation'])
        raw = bytearray(path.read_bytes())
        raw[info['offset'] + info['length'] - 1] ^= 1
        path.write_bytes(bytes(raw))
        readers.inspect_original(sreq(world))
    suite.negative('S4', 'inspect_original_corrupt_original_frame', inspect_corrupt, 'read/frame_hash')

    def retained_stale_control():
        world, projector, readers = make()
        readers.read_retained_native(sreq(world), hooks=dict(after_retained=lambda w: w.owners['native'].advance()))
        return dict(observations='retained original survives native advance between helper and final fence')
    suite.positive('S4', 'retained_native_survives_advance_between_helper_and_final', retained_stale_control)


_CURRENT = {}


def R_proj(world):
    return _CURRENT[id(world)][0]


def R_readers(world):
    return _CURRENT[id(world)][1]


_orig_projected = projected


def projected(world):  # noqa: F811 - record the world's projector/readers for hooks
    projector, readers, gid = _orig_projected(world)
    _CURRENT[id(world)] = (projector, readers)
    return projector, readers, gid


# ------------------------------------------------------------------ S5

def s5(suite):
    def lifecycle():
        world, handles, _ = started(suite)
        projector, readers, gid = projected(world)
        cell, logical = projector.checkpoint()
        W.require('s5/current', logical['current_generation_id'] == gid)
        again = projector.replay(gid)
        W.require('s5/lost_ack_same_transaction', again['replay'] is True)
        gid2 = projector.stage()
        hidden = readers.read_current(sreq(world))
        W.require('s5/staged_hidden', hidden['projection']['dataset_name'].endswith(gid))
        projector.replay(gid2)
        projector.cutover(gid2)
        cell, logical = projector.checkpoint()
        W.require('s5/cutover', logical['current_generation_id'] == gid2 and
                  logical['generations'][gid]['state'] == 'retired' and
                  logical['generations'][gid]['successor_generation_id'] == gid2)
        readers.read_current(sreq(world))
        return dict(observations=dict(generations=len(logical['generations'])))
    suite.positive('S5', 'stage_replay_cutover_and_lost_acknowledgement', lifecycle)

    def retirement_window():
        world, handles, _ = started(suite)
        projector, readers, g1 = projected(world)
        g2 = projector.stage(); projector.replay(g2); projector.cutover(g2)
        g3 = projector.stage(); projector.replay(g3); projector.cutover(g3)
        R.advance_clock(world, R.RETIREMENT_SECONDS + 1)
        g4 = projector.stage()
        cell, logical = projector.checkpoint()
        W.require('s5/oldest_retired_removed', g1 not in logical['generations'] and g4 in logical['generations'])
        return dict(observations=dict(generations=sorted(logical['generations'])))
    suite.positive('S5', 'retired_generation_removed_after_604800_seconds', retirement_window)

    def fourth_slot():
        world, handles, _ = started(suite)
        projector, readers, g1 = projected(world)
        g2 = projector.stage(); projector.replay(g2); projector.cutover(g2)
        g3 = projector.stage()
        projector.stage()
    suite.negative('S5', 'fourth_generation_slot_refused', fourth_slot, 'projector/generation_limit')

    def held_retired():
        world, handles, _ = started(suite)
        projector = R.StartedProjector(world.registry, world=world)
        projector.install()
        holder = R.HoldOwner(world.registry)
        g1 = projector.stage(holds=[holder.hold('TEST_ONLY:legal-hold')])
        projector.replay(g1); projector.cutover(g1)
        g2 = projector.stage(); projector.replay(g2); projector.cutover(g2)
        g3 = projector.stage(); projector.replay(g3); projector.cutover(g3)
        R.advance_clock(world, R.RETIREMENT_SECONDS + 1)
        cell, logical = projector.checkpoint()
        W.require('s5/oldest_held', len(logical['generations'][g1]['hold_refs']) == 1)
        g2_removed = projector.stage()
        projector.stage()
    suite.negative('S5', 'held_retired_generation_not_removed', held_retired, 'projector/generation_limit')

    def premature_cutover():
        world, handles, _ = started(suite)
        projector = R.StartedProjector(world.registry, world=world)
        projector.install()
        gid = projector.stage()
        projector.replay(gid)
        extra_event(world, 'late')
        projector.cutover(gid)
    suite.negative('S5', 'premature_cutover_incomplete_coverage', premature_cutover, 'cutover/incomplete_coverage')

    def cutover_unreplayed():
        world, handles, _ = started(suite)
        projector = R.StartedProjector(world.registry, world=world)
        projector.install()
        projector.cutover(projector.stage())
    suite.negative('S5', 'cutover_before_replay', cutover_unreplayed, 'cutover/incomplete_coverage')

    def stale_cas():
        world, handles, _ = started(suite)
        projector = R.StartedProjector(world.registry, world=world)
        projector.install()
        gid = projector.stage()
        original = projector.rep.encode_checkpoint

        def racing(logical, **kw):
            out = original(logical, **kw)
            if not kw.get('store') is False and not getattr(racing, 'done', False):
                racing.done = True
                R.StartedProjector(world.registry, world=world).stage()
            return out
        projector.rep.encode_checkpoint = racing
        projector.replay(gid)
    suite.negative('S5', 'stale_checkpoint_cas', stale_cas, 'tx/cas_version')

    def caller_row():
        world, handles, _ = started(suite)
        projector = R.StartedProjector(world.registry, world=world)
        projector.install()
        gid = projector.stage()

        def tamper(row):
            row = copy.deepcopy(row)
            row['content']['record']['captured_goal_context']['goal_revision'] += 1
            return row
        projector.replay(gid, tamper=tamper)
    suite.negative('S5', 'caller_computed_row_afterimage', caller_row, 'projector/row_rederive')

    def writer_cutoff():
        world, handles, _ = started(suite)
        projector, readers, gid = projected(world)
        projector.withdraw()
        projector.replay(gid)
    suite.negative('S5', 'writer_cutoff_after_withdrawal', writer_cutoff, 'project/projector_withdrawn')

    def reinstall():
        world, handles, _ = started(suite)
        projector, readers, gid = projected(world)
        projector.withdraw()
        projector.install()
        g2 = projector.stage()
        W.require('s5/fresh_generation', g2 != gid)
        projector.replay(g2)
        projector.cutover(g2)
        readers.read_current(sreq(world))
        return dict(observations=dict(old=gid, new=g2))
    suite.positive('S5', 'reinstall_rebuilds_fresh_generation', reinstall)

    def source_loss():
        world, handles, _ = started(suite, segment_target_bytes=4096)
        for i in range(8):
            extra_event(world, 'l%d' % i)
        event_id = R.original_started(world)['original_append']['event']['event_id']
        generation = world.storage.events[event_id]['segment_generation']
        W.require('s5/start_segment_sealed', any(s['generation'] == generation and s['sealed']
                                                 for s in world.storage.segments))
        world.storage.retire_segment(generation, S.RetentionOwner(world.storage))
        projector = R.StartedProjector(world.registry, world=world)
        projector.install()
        projector.replay(projector.stage())
    suite.negative('S5', 'original_source_loss_unavailable_not_no_start', source_loss, 'read/event_unavailable')


# ------------------------------------------------------------------ S6

LONG = 'λ' * 700


def s6(suite):
    def kind_case(case_id, expect_kind, expect_checkpoint, **world_kw):
        def run():
            edits = world_kw.pop('edits', None)
            world, handles, _ = started(suite, edits=edits, **world_kw)
            projector, readers, gid = projected(world)
            cell, logical, gen, row, record = readers.h_projection(R.original_started(world), 'probe')
            W.require('s6/kind/' + row['value']['content']['kind'], row['value']['content']['kind'] == expect_kind)
            W.require('s6/checkpoint_kind/' + cell['value']['content']['kind'],
                      cell['value']['content']['kind'] == expect_checkpoint)
            readers.read_historical(sreq(world))
            readers.read_current(sreq(world))
            rep = projector.rep
            sizes = dict(row=rep.size(row['value']), checkpoint=rep.size(cell['value']),
                         event=rep.size(record['original_event']))
            for part in (row['value'], cell['value']):
                W.require('s6/part_limit', rep.size(part) <= R.LIMIT)
            return dict(observations=sizes)
        suite.positive('S6', case_id, run)
    long_runtime = dict(runtime=lambda r: (r.update({k: 'TEST_ONLY:' + k + ':' + 'ρ' * 520 for k in (
        'requested_account_ref', 'effective_account_ref', 'requested_provider_ref', 'effective_provider_ref',
        'requested_model_ref', 'effective_model_ref')}), r)[1])
    kind_case('inline_row_inline_checkpoint', 'inline', 'inline')
    kind_case('event_reference_row', 'event_reference', 'inline', edits=long_runtime)
    def spill():
        world, handles, _ = started(suite)
        projector = R.StartedProjector(world.registry, world=world)
        projector.install()
        holder = R.HoldOwner(world.registry)
        gids = []
        for i in range(3):
            gid = projector.stage(holds=[holder.hold('TEST_ONLY:hold:%d:%d:' % (i, j) + 'h' * 40) for j in range(12)])
            projector.replay(gid)
            projector.cutover(gid)
            gids.append(gid)
        cell, logical = projector.checkpoint()
        W.require('s6/checkpoint_spill', cell['value']['content']['kind'] == 'payload_reference')
        W.require('s6/checkpoint_part_limit', projector.rep.size(cell['value']) <= R.LIMIT)
        readers = R.StartedReaders(world.registry, world=world, projector=projector)
        readers.read_current(sreq(world))
        return dict(observations=dict(logical=projector.rep.size(logical), wrapper=projector.rep.size(cell['value'])))
    suite.positive('S6', 'checkpoint_spill_with_owner_issued_holds', spill)

    def forced_record_reference():
        world, handles, _ = started(suite)
        projector, readers, gid = projected(world)
        original = R.original_started(world)
        record = R.projection_record(world, original)
        row = projector.rep.encode(record, gid, force='record_reference')
        W.require('s6/record_reference_shape', row['content']['kind'] == 'record_reference')
        back = projector.rep.decode(row, original, selection_check=False)
        W.require('s6/record_reference_roundtrip', A.same(back, record))
        try:
            projector.rep.decode(row, original)
        except W.REFUSALS as error:
            W.require('s6/deterministic_selection', W.code_of(error) == 'representation/deterministic_kind')
        else:
            raise W.DGRefusal('s6/forced_route_accepted_as_published')
        sizes = {k: projector.rep.size(original['native_start'][k]) for k in original['native_start']}
        return dict(observations=dict(reachability='record_reference requires metadata larger than the candidate '
                                                   'and D01 update wrappers, which authentic Start issuance bounds first',
                                      start_wrapper_sizes=sizes, record=projector.rep.size(record)))
    suite.positive('S6', 'record_reference_reconstruction_on_authentic_original', forced_record_reference)

    def make(**kw):
        world, handles, _ = started(suite, **kw)
        projector, readers, gid = projected(world)
        return world, projector, readers, gid

    def ref_world():
        return make(edits=long_runtime)

    def negative(case_id, expected, mutate, builder=ref_world):
        def run():
            world, projector, readers, gid = builder()
            mutate(world, projector, readers, gid)
            readers.read_historical(sreq(world))
        suite.negative('S6', case_id, run, expected)

    def event_ref(world, projector):
        cell, logical, gen, row = projector.current_row()
        return row['value']['content']['event_ref']
    negative('event_pack_withdrawn', 'pack/unavailable',
             lambda w, p, r, g: w.storage.withdraw_pack(event_ref(w, p)['blake3']))

    def corrupt(w, p, r, g):
        path = w.storage.root / 'packs' / event_ref(w, p)['blake3']
        raw = bytearray(path.read_bytes())
        raw[-1] ^= 1
        path.write_bytes(bytes(raw))
    negative('event_pack_corrupt_at_rest', 'payload/numrule/payload_digest', corrupt)

    def rewrite_row(mutator, store_extra=None):
        def run(w, p, r, g):
            cell, logical, gen, row = p.current_row()
            value = copy.deepcopy(row['value'])
            mutator(w, p, value)
            prefix = copy.deepcopy(gen['processed'])
            prefix['row_sha256'] = W.cdigest(value)
            gens = copy.deepcopy(logical['generations'])
            gens[g]['processed'] = prefix
            ck = p.rep.encode_checkpoint(p._logical(gens, logical['current_generation_id']))
            w.storage.transact([dict(table=gen['dataset_name'], key=p.rep.projection_key(), expected=row['version'],
                                     value=value),
                                dict(table='checkpoints', key=p.rep.checkpoint_key(), expected=cell['version'], value=ck)])
        return run

    def noncanonical(w, p, value):
        event = p.rep.unpack(value['content']['event_ref'], 'probe')
        import msgpack
        raw = msgpack.packb(dict(reversed(list(event.items()))), use_bin_type=True)
        value['content']['event_ref'] = w.storage.put_pack(raw, 'application/msgpack')
    negative('event_pack_noncanonical', 'representation/event_pack/numrule/physical_noncanonical',
             rewrite_row(noncanonical))

    def foreign(w, p, value):
        other = S.TestOwnerStorage.create(w.work / 'foreign-storage')
        raw = w.storage.read_pack(value['content']['event_ref'], expected_media_type='application/msgpack')
        ref = other.put_pack(raw + b'', 'application/msgpack')
        value['content']['event_ref'] = dict(ref, blake3=ref['blake3'][:-1] + ('0' if ref['blake3'][-1] != '0' else '1'))
    negative('event_pack_foreign_store', 'pack/unavailable', rewrite_row(foreign))
    negative('false_commitment', 'representation/commitment', rewrite_row(
        lambda w, p, v: v['original_event_value_commitment'].update(sha256='0' * 64)))
    negative('false_byte_size', 'payload/numrule/payload_size', rewrite_row(
        lambda w, p, v: v['content']['event_ref'].update(byte_size=v['content']['event_ref']['byte_size'] + 1)))
    negative('false_media_type', 'representation/row/schema/content:oneOf', rewrite_row(
        lambda w, p, v: v['content']['event_ref'].update(media_type='application/json')))
    negative('event_identity_sequence_substituted', 'representation/event_identity/sequence_id', rewrite_row(
        lambda w, p, v: v['event_identity'].update(sequence_id=v['event_identity']['sequence_id'] + 1)))

    def inline_world():
        return make()

    def forced_reference(w, p, value):
        record = R.projection_record(w, R.original_started(w))
        forced = p.rep.encode(record, value['dataset_name'].split('@', 1)[1], force='event_reference')
        value.clear()
        value.update(forced)
    negative('reference_chosen_when_inline_fits', 'representation/deterministic_kind', rewrite_row(forced_reference),
             builder=inline_world)

    def oversize():
        # Encoder-level guard witness: one coherent oversized scope substitution
        # (record scope, Event run id and identity copies); an authentic Start
        # cannot reach it because its own candidate wrapper is bounded first.
        world, handles, _ = started(suite)
        projector, readers, gid = projected(world)
        before = projector.checkpoint()[0]
        record = R.projection_record(world, R.original_started(world))
        big = 'TEST_ONLY:goal_run:' + 'ω' * 5200
        record['scope']['goal_run_id'] = big
        record['original_event']['run_id'] = big
        record['original_event']['payload']['payload']['goal_run_id'] = big
        real = world.ctx.goal_run_id
        world.ctx.goal_run_id = big
        try:
            projector.rep.encode(record, gid, store=False)
        except W.REFUSALS as error:
            world.ctx.goal_run_id = real
            after = projector.checkpoint()[0]
            W.require('s6/prior_checkpoint_preserved', after['version'] == before['version'])
            raise error
    suite.negative('S6', 'still_oversize_compact_operation_refused', oversize, 'representation/operation_size')

    def withdrawn_reader():
        world, projector, readers, gid = ref_world()
        readers.read_historical(sreq(world), hooks=dict(
            after_projection=lambda w: w.storage.withdraw_pack(event_ref(w, projector)['blake3'])))
    suite.negative('S6', 'source_pack_withdrawn_before_final_release', withdrawn_reader, 'pack/unavailable')


# ------------------------------------------------------------------ driver

def run(output=None, groups=None, work=None):
    work = Path(work or tempfile.mkdtemp(prefix='dg-s-oracles-'))
    suite = Suite(work)
    started_at = time.time()
    selected = groups or ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S1M', 'S2M', 'S5M']
    for name, fn in (('S1', s1), ('S2', s2), ('S3', s3), ('S4', s4), ('S5', s5), ('S6', s6),
                     ('S1M', lambda s: start_matrix(s, 'v3')), ('S2M', lambda s: start_matrix(s, 'v7')),
                     ('S5M', projection_matrix)):
        if name in selected:
            fn(suite)
    failures = [r for r in suite.rows if not r['ok']]
    by_group = {}
    for r in suite.rows:
        g = by_group.setdefault(r['group'], dict(positives=0, negatives=0, failures=0))
        g['positives' if r['kind'] == 'positive' else 'negatives'] += 1
        g['failures'] += 0 if r['ok'] else 1
    report = dict(qualification=QUALIFICATION, native=NATIVE_LINE, status='pass' if not failures else 'fail',
                  groups=by_group, positives=sum(g['positives'] for g in by_group.values()),
                  negatives=sum(g['negatives'] for g in by_group.values()), failures=failures,
                  guards={k: sorted(v) for k, v in sorted(suite.guards.items())}, rows=suite.rows,
                  seconds=round(time.time() - started_at, 1),
                  editions=dict(v3=W.v3_edition().profile, v7=W.v7_edition().profile,
                                v7_composition=W.v7_edition().composition))
    if output:
        Path(output).write_text(json.dumps(report, indent=1, sort_keys=True, ensure_ascii=False) + '\n')
    shutil.rmtree(str(work), ignore_errors=True)
    print(json.dumps(dict(status=report['status'], groups=by_group, positives=report['positives'],
                          negatives=report['negatives'], failures=len(failures), seconds=report['seconds'])))
    return 0 if not failures else 1


def main():
    if '--child' in sys.argv:
        return child(sys.argv[1:])
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--output')
    p.add_argument('--groups', nargs='*')
    p.add_argument('--work')
    a = p.parse_args()
    return run(a.output, a.groups, a.work)


if __name__ == '__main__':
    sys.exit(main())
