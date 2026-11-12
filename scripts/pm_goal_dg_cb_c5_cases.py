#!/usr/bin/env python3
"""DG-CB C5 cases: six-owner native source-image mapping and authentic completeness (M2-M6), TEST_ONLY.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Positives run the complete capture (and the commit that publishes its mapping)
on pre-enrollment Goals that the six registered owners issued themselves:
pre-DL-270 canonical-JSON and MessagePack/already-v2 Goal editions, bound Plan
(with Scheduler schedules/bindings/consents/callbacks and an unrelated message),
bound Workflow (D01 run body/control, Start birth/update/head/pointer/lineage),
SIR commands, nonzero unassociated and latched Stop, pending body operations,
a representable pending Plan attach, extra native writer implementations, a
joined installed domain, concurrent Stop recapture, and each contradictory or
unknown source recorded as ``blocked_unresolved``. Negatives refuse missing,
unsupported, substituted, incomplete or drifting sources with their own code.
"""
from __future__ import annotations

import copy

import pm_goal_test_storage as S
import pm_goal_dg_cb_owners as B
import pm_goal_dg_cb_migration as M
import pm_goal_dg_ca_c1 as C1
from pm_goal_dg_ca_owners import row_sha, sha, uid, scoped_key

G = 'C5'
ROLES = B.ROLES


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def mark(w, table, key):
    w.injected.append((table, key))


def new(suite, **kw):
    w = suite.world()
    return w, B.legacy_goal(w, **kw)


def phys(w, family, key):
    cell = w.cell(family, key)
    return None if cell is None else B.physical(cell['value'])


def goal_physical(w, scope):
    return {(f, k): phys(w, f, k) for f, k in w.goal.goal_keys(scope)}


def run(w, scope, mid=None):
    sel = M.selector(scope, mid)
    req = w.coordinator.capture(sel)
    res = w.coordinator.commit(req)
    return sel, req, res


def owner_calls(w):
    """Order of the six owners' issued statements inside the coordinator's capture calls."""
    ids = {w.owner_for(r).owner_id: r for r in ROLES}
    return [ids[c['owner']] for c in w.recorder.calls if c['method'] in ('enumerate_for_migration', 'read_for_binding_migration')
            and c['owner'] in ids]


def verify_request(w, scope, req):
    check([m['role'] for m in req['owner_mappings']] == list(ROLES), 'six mappings in role order')
    for mapping in req['owner_mappings']:
        owner = w.owner_for(mapping['role'])
        for image in mapping['sources']:
            family, key = M.split(image['selection']['physical_key'])
            codec, raw = phys(w, family, key)
            check(image['selection']['owner'] == owner.owner_id, 'image owner is the registered owner')
            check(image['bytes_hex'] == raw.hex() and image['codec_id'] == codec and image['selection']['sha256'] == sha(raw),
                  'image bytes are Storage physical bytes')
    exclusion = w.coordinator.exclusion(scope)
    check(exclusion is not None and exclusion['value']['state'] == 'held', 'all-writer exclusion held after capture')
    return {m['role']: len(m['sources']) for m in req['owner_mappings']}


def verify_enrolled(w, scope, before_goal, before_stop, res, *, associations=0, edition='v1'):
    check(res['disposition'] == 'enrolled', 'enrolled')
    read = w.binding.read_current(scope)
    revision, control = read['revision']['value']['record'], read['control']['value']['record']
    check(len(revision['associations']) == associations, 'association count')
    check(revision['host_execution_owner_ref'] == w.host_stop.owner_id, 'host owner preserved')
    check(revision['original_goal_birth_or_binding_operation'] == res['migration_id'], 'origin records THIS migration')
    origin = read['origin']['value']['record']
    check(origin['issuer']['owner_method'] == 'owner.goal.execution_binding.adopt_existing.v1', 'Goal owner derived the binding')
    for (f, k), value in before_goal.items():
        if f == 'goal_body_control':
            continue
        check(phys(w, f, k) == value, 'original Goal body/history/origin/receipt byte-exact: ' + f)
    old_codec, old_raw = before_goal[('goal_body_control', w.goal.keys(scope)['control'])]
    old = B.CODECS[old_codec][1](old_raw)['record']
    new = w.goal.control(scope)['value']['record']
    check(new['schema_id'] == 'pm.goal.body_control.v2', 'control is v2')
    for k, v in old.items():
        if k != 'schema_id':
            check(new[k] == v, 'v1 field preserved: ' + k)
    if edition == 'v1':
        check(new['cancellation_pending'] is None, 'cancellation_pending added as null')
    check(w.cell(w.host_stop.FAMILY, w.host_stop.key(scope)) == before_stop, 'host Stop cell unchanged (value and version)')
    stop = before_stop['value']['record']
    check(res['original_stop'] == dict(user_stop_epoch=stop['user_stop_epoch'], continuation_epoch=stop['continuation_epoch'],
                                       stop_latched=stop['latched']), 'exact old Stop projection')
    check(w.coordinator.exclusion(scope) is None, 'exclusion released in the commit transaction')
    return revision, control


def plan_bound(w, scope, *, schedules=2, consents=1, callbacks=0, settled=0):
    pid, rid = w.plans.bind_goal(scope)
    run_value = w.plans.decoded('assistant_plan_run', w.plans.keys(scope, pid, rid)['run'])['record']
    stop = w.host_stop.record(scope)
    w.scheduler.schedule_run(scope, pid, run_value, stop['user_stop_epoch'], schedules=schedules, consents=consents)
    keys = [w.scheduler.admit_callback(scope, rid, run_epoch=0, stop_epoch=stop['user_stop_epoch']) for _ in range(callbacks + settled)]
    for key in keys[:settled]:
        w.scheduler.settle_callback(scope, key)
    return pid, rid


def cancel_request(w, scope, actor='TEST_ONLY:person'):
    route = C1.NoAssociationCancel(w, birth=False)
    route.scope, route.actor_ref = scope, actor
    _, route.cancel_decision = w.permissions.grant(actor, copy.deepcopy(scope), 'goal.cancel')
    return route, route.user_request()


# ------------------------------------------------------------------ positives

def positives(suite):
    def no_association(codec, edition, revisions):
        def fn():
            w, scope = new(suite, codec=codec, control_edition=edition, revisions=revisions)
            before_goal, before_stop = goal_physical(w, scope), w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
            sel = M.selector(scope)
            req = w.coordinator.capture(sel)
            counts = verify_request(w, scope, req)
            check(owner_calls(w) == list(ROLES), 'each owner issued its own statement in order')
            check(counts['plan'] == counts['workflow'] == counts['scheduler'] == counts['sir'] == 0, 'authenticated empty inventories')
            goal_codecs = {i['codec_id'] for i in req['owner_mappings'][0]['sources']}
            check(goal_codecs == {codec}, 'Goal images in their original codec')
            res = w.coordinator.commit(req)
            verify_enrolled(w, scope, before_goal, before_stop, res, edition=edition)
            check(res['pending_operation_ids'] == [] and len(res['prior_receipts']) == revisions + 2, 'receipts: Goal mutation + Stop receipts')
            return dict(sources=counts, codec=codec, edition=edition, receipts=len(res['prior_receipts']))
        return fn
    suite.positive(G, 'C5/pos/no_association_json_v1', no_association(B.GOAL_JSON, 'v1', 2))
    suite.positive(G, 'C5/pos/no_association_msgpack_already_v2', no_association(B.MSGPACK, 'v2', 1))
    suite.positive(G, 'C5/pos/no_association_msgpack_v1', no_association(B.MSGPACK, 'v1', 3))

    def plan_bound_positive():
        w, scope = new(suite)
        pid, rid = plan_bound(w, scope, schedules=2, consents=2, settled=1)
        message = w.scheduler.schedule_message(scope)
        message_cell = w.cell('execution_schedule', message)
        before_goal, before_stop = goal_physical(w, scope), w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
        sel, req, res = run(w, scope)
        counts = {m['role']: len(m['sources']) for m in req['owner_mappings']}
        revision, control = verify_enrolled(w, scope, before_goal, before_stop, res, associations=1)
        a = revision['associations'][0]
        gpb_key = w.plans.gpb_key(scope, rid)
        check(a['association_kind'] == 'assistant_plan' and a['binding'] == w.value('goal_plan_binding', gpb_key)['record'], 'exact original GoalPlanBinding')
        check(a['original_binding_source']['complete_value_sha256'] == sha(phys(w, 'goal_plan_binding', gpb_key)[1]), 'binding source is the original row')
        check(revision['active_run_ref'] == rid == w.goal.body_cell(scope)['value']['record']['active_run_ref'], 'Goal active_run_ref joined')
        check(w.cell('execution_schedule', message) == message_cell, 'unrelated scheduled message unchanged')
        manifest_keys = {m['physical_key'] for k, p in w.coordinator.manifest_parts_of(scope, res['migration_id']) for m in p['members']}
        check(not any(message in k for k in manifest_keys), 'unrelated message outside the Goal mapping')
        check(len(res['original_association_refs']) == 2, 'association refs: GoalPlanBinding and PlanRun')
        return dict(sources=counts, association='assistant_plan')
    suite.positive(G, 'C5/pos/plan_bound_with_scheduler', plan_bound_positive)

    def terminal_plan_imported():
        w, scope = new(suite)
        pid, rid = plan_bound(w, scope, schedules=1, consents=0)
        w.plans.transition_run(scope, pid, rid, 'completed')
        before_goal, before_stop = goal_physical(w, scope), w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
        sel, req, res = run(w, scope)
        revision, _ = verify_enrolled(w, scope, before_goal, before_stop, res, associations=1)
        check(revision['active_run_ref'] == rid, 'terminal run still imported; no implicit detach')
        return dict(run_state='completed')
    suite.positive(G, 'C5/pos/terminal_plan_run_still_imported', terminal_plan_imported)

    def workflow_bound():
        w, scope = new(suite, codec=B.MSGPACK, control_edition='v2')
        run_id = w.workflows.attach(scope)
        before_goal, before_stop = goal_physical(w, scope), w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
        sel, req, res = run(w, scope)
        counts = {m['role']: len(m['sources']) for m in req['owner_mappings']}
        revision, _ = verify_enrolled(w, scope, before_goal, before_stop, res, associations=1, edition='v2')
        a = revision['associations'][0]
        body_key = w.workflows.keys(scope, run_id)['body']
        check(a['association_kind'] == 'workflow' and a['active_run_ref'] == run_id, 'Workflow association')
        check(a['original_run_source']['complete_value_sha256'] == sha(phys(w, 'workflow_goal_run_body', body_key)[1]), 'native D01 run body source')
        families = {M.split(i['selection']['physical_key'])[0] for i in req['owner_mappings'][3]['sources']}
        check({'workflow_goal_run_body', 'workflow_goal_run_control', 'executor_workflow_workflow_birth', 'executor_workflow_workflow_update',
               'executor_workflow_workflow_head', 'executor_workflow_current_pointer', 'executor_workflow_lineage_origin'} <= families,
              'complete native D01/Start source images')
        return dict(sources=counts, association='workflow')
    suite.positive(G, 'C5/pos/workflow_bound_native_sources', workflow_bound)

    def terminal_workflow():
        w, scope = new(suite)
        run_id = w.workflows.attach(scope)
        w.workflows.complete_d06(scope, run_id)
        before_goal, before_stop = goal_physical(w, scope), w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
        sel, req, res = run(w, scope)
        revision, _ = verify_enrolled(w, scope, before_goal, before_stop, res, associations=1)
        body = w.workflows.decoded('workflow_goal_run_body', w.workflows.keys(scope, run_id)['body'])['record']
        check(body['status'] == 'cancelled' and revision['active_run_ref'] == run_id, 'terminal D06 run still imported; no implicit detach')
        heads = [M.split(i['selection']['physical_key'])[1] for i in req['owner_mappings'][3]['sources']
                 if i['selection']['physical_key'].startswith('executor_workflow_workflow_head|')]
        check(len(heads) == 2, 'both Workflow heads (activation and D06) in the mapping')
        return dict(status='cancelled', heads=2)
    suite.positive(G, 'C5/pos/terminal_workflow_d06_still_imported', terminal_workflow)

    def nonzero_unassociated_latched():
        w, scope = new(suite)
        for action in ('stop', 'resume', 'stop', 'resume', 'stop'):
            w.host_stop.manual(scope, action)
        before_goal, before_stop = goal_physical(w, scope), w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
        sel, req, res = run(w, scope)
        verify_enrolled(w, scope, before_goal, before_stop, res)
        check(res['original_stop'] == dict(user_stop_epoch=4, continuation_epoch=3, stop_latched=True), 'nonzero latched epochs mapped exactly')
        return res['original_stop']
    suite.positive(G, 'C5/pos/nonzero_unassociated_latched_stop', nonzero_unassociated_latched)

    def latched_with_pending():
        w, scope = new(suite)
        w.host_stop.manual(scope, 'stop')
        pending = w.goal.reserve_pending(scope, w.host_stop.record(scope)['user_stop_epoch'])
        before_goal, before_stop = goal_physical(w, scope), w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
        sel, req, res = run(w, scope)
        verify_enrolled(w, scope, before_goal, before_stop, res)
        check(res['pending_operation_ids'] == [pending['operation_id']], 'pending body operation preserved in the result')
        check(w.goal.control(scope)['value']['record']['pending'] == pending, 'pending object preserved in v2 control')
        check(res['original_stop']['stop_latched'] is True, 'latched Stop preserved')
        return dict(pending=pending['operation_id'])
    suite.positive(G, 'C5/pos/latched_stop_with_pending_body_operation', latched_with_pending)

    def virgin_zero():
        w, scope = new(suite, stop_history=False)
        before_goal, before_stop = goal_physical(w, scope), w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
        sel, req, res = run(w, scope)
        verify_enrolled(w, scope, before_goal, before_stop, res)
        check(res['original_stop'] == dict(user_stop_epoch=0, continuation_epoch=0, stop_latched=False), 'zero only with the host birth proof')
        return res['original_stop']
    suite.positive(G, 'C5/pos/virgin_zero_epoch_with_birth_proof', virgin_zero)

    def concurrent_stop():
        w, scope = new(suite)
        w.coordinator.inject[('capture', 'after_plan')] = lambda c: c.world.host_stop.manual(scope, 'stop')
        sel = M.selector(scope)
        req = w.coordinator.capture(sel)
        reads = [c for c in w.recorder.calls if c['method'] == 'read_for_binding_migration']
        check(len(reads) == 2 and w.coordinator.recaptures == 1, 'snapshot released and the whole newer domain recaptured')
        stop_images = req['owner_mappings'][1]['sources']
        record = B.msgpack_decode(bytes.fromhex(stop_images[0]['bytes_hex']))['record']
        check(record['user_stop_epoch'] == 2 and record['latched'] is True, 'request carries the newer Stop domain')
        res = w.coordinator.commit(req)
        check(res['original_stop'] == dict(user_stop_epoch=2, continuation_epoch=1, stop_latched=True), 'newer Stop mapped, never rolled back')
        return dict(recaptures=1, epoch=2)
    suite.positive(G, 'C5/pos/concurrent_stop_recapture', concurrent_stop)

    def pending_attach():
        w, scope = new(suite)
        op, pid, rid = w.plans.stage_pending_attach(scope, disposition='no_effect')
        before_goal, before_stop = goal_physical(w, scope), w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
        sel, req, res = run(w, scope)
        revision, control = verify_enrolled(w, scope, before_goal, before_stop, res)
        pending = control['pending']
        check(pending is not None and pending['operation_id'] == op and pending['operation'] == 'plan_goal_birth_or_attach', 'original pending identity')
        check(pending['candidate']['active_run_ref'] == rid and pending['original_owner_ref'] == w.plans.owner_id, 'original owner candidate')
        check(pending['expected_stop_control_sha256'] == sha(phys(w, w.host_stop.FAMILY, w.host_stop.key(scope))[1]), 'fenced by the actual Stop')
        check(res['pending_operation_ids'] == [op], 'pending listed in the result')
        return dict(pending=op)
    suite.positive(G, 'C5/pos/pending_attach_mapped_through_original_candidate', pending_attach)

    def extra_writers():
        w, scope = new(suite)
        w.registration.add_implementation('plan_goal_birth_or_attach', 'old_adapter', disposition='disabled_at_original_dispatch')
        w.registration.add_implementation('binding_owner_transfer', 'timer')
        w.registration.add_implementation('binding_restore', 'restore')
        sel, req, res = run(w, scope)
        _, domain, _ = w.binding.domain_selection()
        dispatch = dict(domain='pm.goal.execution_dispatch.v1', storage_instance_id=w.storage_id, native_root_identity=w.registration.root_identity,
                        complete_descriptors=w.registration.descriptors())
        check(len(dispatch['complete_descriptors']) == 10, 'every native implementation in the dispatch commitment')
        check(domain['record']['complete_original_dispatch_registration_sha256'] == w.codec.h(dispatch), 'domain commits the complete dispatch')
        check(len(domain['record']['writers']) == 7, 'seven writer categories')
        return dict(implementations=10)
    suite.positive(G, 'C5/pos/all_writer_implementations_authenticated', extra_writers)

    def join_domain():
        w, first = new(suite)
        run(w, first)
        head_before = w.cell(w.binding.HEAD, w.binding.head_key())
        scope = B.legacy_goal(w)
        before_goal, before_stop = goal_physical(w, scope), w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
        sel, req, res = run(w, scope)
        verify_enrolled(w, scope, before_goal, before_stop, res)
        check(w.cell(w.binding.HEAD, w.binding.head_key()) == head_before, 'joined the installed domain; head unchanged')
        check(req['expected_writer_domain']['schema_ref'].endswith('/StorageWriterDomain'), 'expected domain is the installed one')
        check(not any(m['physical_key'].startswith(w.binding.DOMAIN + '|') for m in res['published_members']), 'no second domain record')
        return dict(joined=True)
    suite.positive(G, 'C5/pos/join_installed_writer_domain', join_domain)

    def sir_terminal():
        w, scope = new(suite)
        route, request = cancel_request(w, scope)
        w.sir.accept(request)
        w.sir.finish_no_effect(request['command_instance_id'])
        sel, req, res = run(w, scope)
        check(res['disposition'] == 'enrolled', 'terminal SIR command does not block')
        sir_receipts = [r for r in res['prior_receipts'] if r['physical_key'].startswith('sir_command_outcome|')]
        check(len(sir_receipts) == 1, 'terminal SIR outcome imported as a prior receipt')
        return dict(sir_receipts=1)
    suite.positive(G, 'C5/pos/sir_terminal_outcome_imported', sir_terminal)

    def blocked(name, setup, kind):
        def fn():
            w, scope = new(suite)
            setup(w, scope)
            before_goal = goal_physical(w, scope)
            before_stop = w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
            before_cells = copy.deepcopy(w.storage.cells)
            sel, req, res = run(w, scope)
            check(res['disposition'] == 'blocked_unresolved' and res['published_members'] == [], 'blocked_unresolved, nothing enrolled')
            cap = w.coordinator.last_capture
            check(any(b['kind'] == kind for b in cap.blocked), 'blocked for ' + kind)
            check(w.cell(w.binding.CONTROL, w.binding.keys(scope)['control']) is None, 'no binding enrollment')
            check(goal_physical(w, scope) == before_goal, 'Goal originals and v1/v2 control untouched')
            check(w.cell(w.host_stop.FAMILY, w.host_stop.key(scope)) == before_stop, 'Stop untouched')
            for table in before_cells:
                if table in (M.RESULT, M.PART, B.EXCLUSION):
                    continue
                check(w.storage.cells.get(table, {}) == before_cells[table], 'no owner source changed: ' + table)
            check(set(res['pending_operation_ids']) >= {b['operation'] for b in cap.blocked if b['kind'].startswith('unknown')}, 'unknown work preserved')
            return dict(kind=kind, pending=res['pending_operation_ids'])
        suite.positive(G, 'C5/pos/blocked/' + name, fn)

    def unknown_workflow(w, scope):
        run_id = w.workflows.attach(scope)
        w.workflows.begin_pending(scope, run_id, kind='d06_cancel', disposition='unknown')
    blocked('unknown_workflow_d06', unknown_workflow, 'unknown_workflow_operation')

    def partial_d05(w, scope):
        run_id = w.workflows.attach(scope)
        w.workflows.begin_pending(scope, run_id, kind='d05_safe_stop', disposition='partial')
    blocked('partial_workflow_d05', partial_d05, 'unknown_workflow_operation')
    blocked('unknown_scheduler_callback', lambda w, s: plan_bound(w, s, callbacks=1), 'unknown_scheduler_callback')

    def pending_sir(w, scope):
        route, request = cancel_request(w, scope)
        w.sir.accept(request)
    blocked('old_cancellation_command_without_receipt', pending_sir, 'unknown_sir_command')

    def both_owners(w, scope):
        plan_bound(w, scope, schedules=0, consents=0)
        w.workflows.attach(scope)
    blocked('contradicting_plan_and_workflow', both_owners, 'contradicting_associations')

    def plan_without_goal_ref(w, scope):
        plan_bound(w, scope, schedules=0, consents=0)
        writes = w.goal._mutation(scope, active_run_ref=None, kind='metadata_update')[0]
        w.write(writes)
    blocked('contradicting_active_run', plan_without_goal_ref, 'contradicting_active_run')
    blocked('unknown_pending_attach', lambda w, s: w.plans.stage_pending_attach(s, disposition='unknown'), 'unknown_pending_attach')

    def unrepresentable(w, scope):
        w.plans.stage_pending_attach(scope, disposition='no_effect')
        w.goal.update_objective(scope, 'TEST_ONLY objective changed after the attach preimage')
    blocked('unrepresentable_pending_attach', unrepresentable, 'unrepresentable_pending_attach')

    def already_v2_cancel_pending():
        w = suite.world()
        scope = B.legacy_goal(w, codec=B.MSGPACK, control_edition='v2')
        w.host_stop.manual(scope, 'stop')
        w.goal.set_cancellation_pending(scope, w.host_stop.record(scope))
        sel, req, res = run(w, scope)
        check(res['disposition'] == 'blocked_unresolved', 'old cancellation without receipt blocks')
        check(any(b['kind'] == 'old_cancellation_pending_receipt_unavailable' for b in w.coordinator.last_capture.blocked), 'kind')
        check(w.goal.control(scope)['value']['record']['cancellation_pending'] is not None, 'no receipt fabricated, pending kept')
        return dict(kind='old_cancellation_pending_receipt_unavailable')
    suite.positive(G, 'C5/pos/blocked/old_cancellation_pending_receipt_unavailable', already_v2_cancel_pending)

    def version_contradiction(w, scope):
        pid, rid = plan_bound(w, scope, schedules=0, consents=0)
        w.plans.approve_new_version_dg(scope, pid)
    blocked('contradicting_plan_version', version_contradiction, 'contradicting_plan_association')

    def reconciled():
        w, scope = new(suite)
        run_id = w.workflows.attach(scope)
        op = w.workflows.begin_pending(scope, run_id, disposition='unknown')
        sel, req, res = run(w, scope)
        check(res['disposition'] == 'blocked_unresolved', 'first migration blocked')
        w.workflows.reconcile_pending(scope, run_id, op)
        sel2, req2, res2 = run(w, scope)
        check(res2['disposition'] == 'enrolled' and res2['migration_id'] != res['migration_id'], 'a later independent capture enrolls')
        check(w.coordinator.read_result(sel)['disposition'] == 'blocked_unresolved', 'the blocked result stays immutable')
        return dict(first='blocked_unresolved', second='enrolled')
    suite.positive(G, 'C5/pos/owner_reconciles_then_new_capture_enrolls', reconciled)


# ------------------------------------------------------------------ negatives

def negatives(suite):
    def neg(name, setup, expected, boundary):
        suite.negative(G, name, setup, expected, boundary=boundary)

    def capture_of(w, scope, mid=None):
        return lambda: w.coordinator.capture(M.selector(scope, mid))

    # owners whose database is unavailable: never empty, never virgin
    for role, attr, code in (('goal', 'goal', 'goal/database_unavailable'), ('host_stop', 'host_stop', 'host_stop/database_unavailable'),
                             ('plan', 'plans', 'plan/database_unavailable'), ('workflow', 'workflows', 'workflow/database_unavailable'),
                             ('scheduler', 'scheduler', 'scheduler/database_unavailable'), ('sir', 'sir', 'sir/database_unavailable')):
        def setup(attr=attr):
            w, scope = new(suite)
            getattr(w, attr).available = False
            return w, capture_of(w, scope)
        neg('C5/neg/database_unavailable/' + role, setup, code, 'owner/enumerate')

    def delete_cells(w, cells):
        for table, key in cells:
            cell = w.cell(table, key)
            w.write([dict(table=table, key=key, expected=cell['version'], delete=True)])
            mark(w, table, key)

    def missing(name, which, code):
        def setup():
            w, scope = new(suite)
            k = w.goal.keys(scope)
            delete_cells(w, [(w.goal.BODY, k['body'])] * ('body' in which) + [(w.goal.CONTROL, k['control'])] * ('control' in which))
            return w, capture_of(w, scope)
        neg('C5/neg/missing/' + name, setup, code, 'derive/goal')
    missing('goal_body', ('body',), 'M/capture/goal_body_unavailable')
    missing('goal_control', ('control',), 'M/capture/goal_control_unavailable')
    missing('goal_body_and_control_never_birth', ('body', 'control'), 'M/capture/goal_unavailable')

    def host_missing():
        w, scope = new(suite, stop_history=False)
        delete_cells(w, [(w.host_stop.FAMILY, w.host_stop.key(scope))])
        return w, capture_of(w, scope)
    neg('C5/neg/missing/host_stop_domain_never_zero', host_missing, 'host_stop/domain_unavailable', 'host_stop/read')

    def host_unsupported():
        w = suite.world()
        scope = w.new_scope()
        w.register_scope(scope)
        w.host_stop.birth_domain(scope, unsupported=True)
        w.goal.create_legacy(scope, 'TEST_ONLY objective')
        return w, capture_of(w, scope)
    neg('C5/neg/unsupported/host_stop_representation', host_unsupported, 'host_stop/unsupported_representation', 'host_stop/read')

    def zero_copy():
        w, scope = new(suite)
        w.host_stop.copy_zero_domain(scope)
        return w, capture_of(w, scope)
    neg('C5/neg/host_stop_zero_without_virgin_proof', zero_copy, 'host_stop/virgin_proof', 'host_stop/read')

    def last_receipt_missing():
        w, scope = new(suite)
        record = w.host_stop.record(scope)
        delete_cells(w, [(w.host_stop.RECEIPTS, record['last_original_stop_receipt_ref'])])
        return w, capture_of(w, scope)
    neg('C5/neg/host_stop_last_receipt_unavailable', last_receipt_missing, 'host_stop/last_receipt', 'host_stop/read')

    def goal_unsupported_codec():
        w, scope = new(suite)
        k = w.goal.keys(scope)
        cell = w.cell(w.goal.BODY, k['body'])
        value = B.CODECS[B.GOAL_JSON][1](B.physical(cell['value'])[1])
        carrier = dict(cell['value'], codec_id='pm.goal.legacy_cbor.v0')
        w.write([w.put(w.goal.BODY, k['body'], carrier, expected=cell['version'])])
        mark(w, w.goal.BODY, k['body'])
        return w, capture_of(w, scope)
    neg('C5/neg/unsupported/goal_body_codec', goal_unsupported_codec, 'M/capture/unsupported_codec/goal_body_record', 'goal/image')

    def noncanonical_json():
        w, scope = new(suite)
        k = w.goal.keys(scope)
        cell = w.cell(w.goal.BODY, k['body'])
        raw = B.physical(cell['value'])[1]
        spaced = raw.replace(b'","', b'", "', 1)
        carrier = dict(cell['value'], bytes_hex=spaced.hex())
        w.write([w.put(w.goal.BODY, k['body'], carrier, expected=cell['version'])])
        mark(w, w.goal.BODY, k['body'])
        return w, capture_of(w, scope)
    neg('C5/neg/unsupported/goal_noncanonical_json_bytes', noncanonical_json, 'codec/json_noncanonical', 'goal/image')

    def history_gap():
        w, scope = new(suite, revisions=2)
        kr = w.goal.keys(scope, 1)
        delete_cells(w, [(w.goal.ORIGIN, kr['origin'])])
        return w, capture_of(w, scope)
    neg('C5/neg/goal_history_origin_missing', history_gap, 'M/capture/goal_snapshot/missing_origin', 'derive/goal')

    def receipt_head():
        w, scope = new(suite, revisions=2)
        receipts = sorted(((w.goal.decoded(w.goal.RECEIPT, k)['record']['after_revision'], k) for f, k in w.goal.goal_keys(scope) if f == w.goal.RECEIPT))
        delete_cells(w, [(w.goal.RECEIPT, receipts[-1][1])])
        return w, capture_of(w, scope)
    neg('C5/neg/goal_latest_receipt_missing', receipt_head, 'M/capture/goal_receipt_head', 'derive/goal')

    def birth_receipt():
        w, scope = new(suite, revisions=2)
        receipts = sorted(((w.goal.decoded(w.goal.RECEIPT, k)['record']['after_revision'], k) for f, k in w.goal.goal_keys(scope) if f == w.goal.RECEIPT))
        delete_cells(w, [(w.goal.RECEIPT, receipts[0][1])])
        return w, capture_of(w, scope)
    neg('C5/neg/goal_birth_receipt_missing', birth_receipt, 'M/capture/goal_birth_receipt', 'derive/goal')

    # seven writer categories and every implementation
    def unenrolled_impl():
        w, scope = new(suite)
        w.registration.add_implementation('binding_owner_transfer', 'timer', enrollment='unenrolled')
        return w, capture_of(w, scope)
    neg('C5/neg/writer_implementation_unenrolled', unenrolled_impl, 'M/capture/writer_unenrolled/binding_owner_transfer', 'registration')

    def registration_missing():
        w, scope = new(suite)
        delete_cells(w, [(w.registration.FAMILY, w.registration.registrations['binding_content_delete'])])
        return w, capture_of(w, scope)
    neg('C5/neg/writer_category_unregistered', registration_missing, 'M/capture/writer_unregistered/binding_content_delete', 'registration')

    def registration_changed():
        w, first = new(suite)
        run(w, first)
        scope = B.legacy_goal(w)
        w.registration.add_implementation('goal_birth', 'old_adapter', disposition='disabled_at_original_dispatch')
        mark(w, B.DISPATCH, w.registration.state_key())
        return w, capture_of(w, scope)
    neg('C5/neg/domain_registration_changed_revokes_selection', registration_changed, 'M/capture/domain_registration_changed', 'registration')

    def domain_withdrawn():
        w, first = new(suite)
        run(w, first)
        scope = B.legacy_goal(w)
        w.binding.withdraw()
        for k in w.storage.cells.get(B.CUTOFF, {}):
            mark(w, B.CUTOFF, k)
        return w, capture_of(w, scope)
    neg('C5/neg/domain_withdrawn', domain_withdrawn, 'M/capture/domain_withdrawn', 'registration')

    # cross-owner joins: absent reverse rows and unaccounted sources are unavailable
    def gpb_without_run():
        w, scope = new(suite)
        pid, rid = plan_bound(w, scope, schedules=0, consents=0)
        delete_cells(w, [('assistant_plan_run', w.plans.keys(scope, pid, rid)['run'])])
        return w, capture_of(w, scope)
    neg('C5/neg/plan_binding_without_run', gpb_without_run, 'M/capture/plan_absent_reverse_row', 'derive/plan')

    def run_without_gpb():
        w, scope = new(suite)
        pid, rid = plan_bound(w, scope, schedules=0, consents=0)
        delete_cells(w, [('goal_plan_binding', w.plans.gpb_key(scope, rid))])
        return w, capture_of(w, scope)
    neg('C5/neg/plan_run_without_binding_row', run_without_gpb, 'M/capture/plan_absent_reverse_row', 'derive/plan')

    def unaccounted_active_run():
        w, scope = new(suite)
        w.write(w.goal.prepare_active_run(scope, 'TEST_ONLY:run-no-owner-accounts-for'))
        return w, capture_of(w, scope)
    neg('C5/neg/goal_active_run_unaccounted', unaccounted_active_run, 'M/capture/unaccounted_active_run', 'derive/association')

    def plan_record_missing():
        w, scope = new(suite)
        pid, rid = plan_bound(w, scope, schedules=0, consents=0)
        delete_cells(w, [('assistant_plan_record', w.plans.keys(scope, pid)['plan'])])
        return w, capture_of(w, scope)
    neg('C5/neg/plan_record_unavailable', plan_record_missing, 'M/capture/plan_record_unavailable', 'derive/plan')

    def workflow_head_missing():
        w, scope = new(suite)
        run_id = w.workflows.attach(scope)
        delete_cells(w, [('executor_workflow_workflow_head', w.workflows.keys(scope, run_id)['head'])])
        return w, capture_of(w, scope)
    neg('C5/neg/workflow_member_unavailable', workflow_head_missing, 'M/capture/workflow_member_unavailable', 'derive/workflow')

    def workflow_latest_head_missing():
        w, scope = new(suite)
        run_id = w.workflows.attach(scope)
        w.workflows.complete_d06(scope, run_id)
        delete_cells(w, [('executor_workflow_workflow_head', w.workflows.latest_head_key(scope, run_id))])
        return w, capture_of(w, scope)
    neg('C5/neg/workflow_d06_head_missing_breaks_chain', workflow_latest_head_missing, 'M/capture/workflow_head_chain', 'derive/workflow')

    # coordinator preconditions
    def deletion():
        w, scope = new(suite)
        w.maintenance.request_deletion(scope)
        return w, capture_of(w, scope)
    neg('C5/neg/deletion_requested', deletion, 'M/capture/deletion_requested', 'capture/maintenance')

    def exclusion_held():
        w, scope = new(suite)
        w.coordinator.capture(M.selector(scope))
        for k in w.storage.cells.get(B.EXCLUSION, {}):
            mark(w, B.EXCLUSION, k)
        return w, capture_of(w, scope)
    neg('C5/neg/exclusion_held_by_another_migration', exclusion_held, 'M/capture/exclusion_held', 'capture/entry')

    def already_enrolled():
        w, scope = new(suite)
        run(w, scope)
        return w, capture_of(w, scope)
    neg('C5/neg/enrolled_source_never_reruns_migration', already_enrolled, 'M/capture/already_enrolled', 'capture/entry')

    def result_exists():
        w, scope = new(suite)
        route, request = cancel_request(w, scope)
        w.sir.accept(request)
        sel, req, res = run(w, scope)
        return w, capture_of(w, scope, sel['migration_id'])
    neg('C5/neg/result_exists_for_migration_identity', result_exists, 'M/capture/result_exists', 'capture/entry')

    def revoked():
        w, scope = new(suite)
        decision = w.constants['decision:%s:%s' % (w.coordinator.owner_id, M.ADOPT)]
        w.permissions.revoke(decision)
        mark(w, w.permissions.FAMILY, decision)
        return w, capture_of(w, scope)
    neg('C5/neg/adopt_permission_revoked', revoked, 'M/capture/permission', 'capture/entry')

    def foreign_storage():
        w, scope = new(suite)
        other = dict(scope, storage_instance_id='00000000-0000-4000-8000-000000000000')
        return w, lambda: w.coordinator.capture(M.selector(other))
    neg('C5/neg/selector_foreign_storage', foreign_storage, 'M/capture/storage_instance', 'capture/entry')

    def selector_extra():
        w, scope = new(suite)
        return w, lambda: w.coordinator.capture(dict(M.selector(scope), owner_mappings=[]))
    neg('C5/neg/selector_carries_caller_mappings', selector_extra, 'contracts/MigrationSelector/schema/', 'capture/entry')

    # writers are excluded while the capture is held
    def excluded(name, prepare, attempt):
        def setup():
            w, scope = new(suite)
            state = prepare(w, scope) if prepare else None
            w.coordinator.capture(M.selector(scope))
            return w, lambda: attempt(w, scope, state)
        neg('C5/neg/writer_excluded/' + name, setup, 'exclusion/%s/excluded' % name, 'exclusion')
    excluded('goal', None, lambda w, s, st: w.goal.set_state(s, 'paused'))
    excluded('plan', None, lambda w, s, st: w.plans.bind_goal(s))
    excluded('workflow', None, lambda w, s, st: w.workflows.attach(s))
    excluded('scheduler', lambda w, s: plan_bound(w, s, schedules=0, consents=0),
             lambda w, s, st: w.scheduler.admit_callback(s, st[1], run_epoch=0, stop_epoch=1))
    excluded('sir', lambda w, s: cancel_request(w, s)[1], lambda w, s, st: w.sir.accept(st))

    # an owner statement with exactly one defect (the registered owner issues it; the coordinator authenticates)
    def stmt(name, role, attr, defect, code, prepare=None):
        def setup():
            w, scope = new(suite)
            if prepare:
                prepare(w, scope)
            getattr(w, attr).statement_defect = defect
            return w, capture_of(w, scope)
        neg('C5/neg/statement/' + name, setup, code, 'statement/' + role)

    def sub_bytes(m):
        image = m['sources'][0]
        raw = bytes.fromhex(image['bytes_hex'])
        flipped = raw[:-2] + bytes([raw[-2] ^ 1]) + raw[-1:]
        image['bytes_hex'] = flipped.hex()
        image['selection']['sha256'] = sha(flipped)
        return m
    stmt('substituted_bytes_coherent_hash', 'goal', 'goal', sub_bytes, 'M/capture/source_bytes/goal_body_record')
    stmt('dropped_image', 'goal', 'goal', lambda m: dict(m, sources=m['sources'][1:]), 'M/capture/inventory_incomplete/goal')
    stmt('false_empty_inventory', 'plan', 'plans', lambda m: dict(m, sources=[]), 'M/capture/inventory_incomplete/plan',
         prepare=lambda w, s: plan_bound(w, s, schedules=0, consents=0))

    def other_owner(m):
        m['sources'][0]['selection']['owner'] = 'TEST_ONLY:owner:goal_body:substituted'
        return m
    stmt('image_owner_substituted', 'goal', 'goal', other_owner, 'M/capture/image_owner/goal')

    def foreign_family(m):
        m['sources'][0]['selection']['physical_key'] = 'goal_execution_binding_control|' + M.split(m['sources'][0]['selection']['physical_key'])[1]
        return m
    stmt('foreign_family_image', 'goal', 'goal', foreign_family, 'M/capture/foreign_family/goal')

    def swap_origin(m):
        m['sources'][0]['origin'], m['sources'][1]['origin'] = m['sources'][1]['origin'], m['sources'][0]['origin']
        return m
    stmt('origin_swapped_between_sources', 'goal', 'goal', swap_origin, 'M/capture/origin_join/goal_body_record')

    def relabel_codec(m):
        m['sources'][0]['codec_id'] = B.MSGPACK
        return m
    stmt('codec_relabelled', 'goal', 'goal', relabel_codec, 'M/capture/source_codec/goal_body_record')

    def schema_ref(m):
        m['sources'][0]['selection']['schema_ref'] = B.BODY + '#/$defs/storage_control'
        return m
    stmt('schema_root_substituted', 'goal', 'goal', schema_ref, 'M/capture/schema_ref/goal_body_record')

    def drop_pending(m):
        return dict(m, pending_operations=[])
    stmt('pending_effect_dropped', 'goal', 'goal', drop_pending, 'M/capture/pending_mismatch/goal',
         prepare=lambda w, s: w.goal.reserve_pending(s, 1))
    stmt('prior_receipt_dropped', 'goal', 'goal', lambda m: dict(m, prior_receipts=m['prior_receipts'][1:]), 'M/capture/receipts_mismatch/goal')
    stmt('mapping_role_substituted', 'sir', 'sir', lambda m: dict(m, role='scheduler'), 'M/capture/mapping_role/sir')

    def duplicate(m):
        return dict(m, sources=m['sources'] + [copy.deepcopy(m['sources'][0])])
    stmt('duplicate_image', 'goal', 'goal', duplicate, 'M/capture/duplicate_image/goal_body_record')

    # issuance origins: the owner that issued an original, and its permission
    def origin_defect(name, mutate, code):
        def setup():
            w, scope = new(suite)
            k = w.goal.keys(scope)
            okey = B.origin_key(w.goal.BODY, k['body'], B.phys_sha(w.cell(w.goal.BODY, k['body'])['value']))
            cell = w.cell(B.ORIGINS, okey)
            value = mutate(w, copy.deepcopy(cell['value']))
            w.write([w.put(B.ORIGINS, okey, value, expected=cell['version'])])
            mark(w, B.ORIGINS, okey)
            return w, capture_of(w, scope)
        neg('C5/neg/origin/' + name, setup, code, 'origin')

    def foreign_issuer(w, v):
        v['owner_ref'] = w.plans.owner_id
        v['issuer']['original_owner_ref'] = w.plans.owner_id
        return v
    origin_defect('issued_by_another_owner', foreign_issuer, 'M/capture/origin_owner/goal_body_record')

    def foreign_permission(w, v):
        decision = w.constants['write_permission:' + w.plans.owner_id]
        v['issuer']['original_permission_source'] = w.permissions.selection(decision)
        return v
    origin_defect('permission_of_another_owner', foreign_permission, 'M/capture/origin_permission/goal_body_record')

    def other_key(w, v):
        v['issued_physical_key'] = v['issued_physical_key'] + ':other'
        return v
    origin_defect('issued_key_substituted', other_key, 'M/capture/origin_issued/goal_body_record')

    # helper-boundary drifts: one genuine change after each returning helper and before the final boundary
    points = ('after_registration', 'after_goal', 'after_host_stop', 'after_plan', 'after_workflow', 'after_scheduler', 'after_sir', 'final')

    def inj_registration(c, scope):
        c.world.registration.add_implementation('binding_restore', 'restore')
        mark(c.world, B.DISPATCH, c.world.registration.state_key())

    def inj_maintenance(c, scope):
        c.world.maintenance.maintenance_window()

    def inj_goal_bypass(c, scope):
        # a writer implementation that did not participate in the exclusion mutates the Goal anyway
        writes = c.world.goal._mutation(scope, state='paused', kind='metadata_update')[0]
        c.world.write(writes)
        for wr in writes:
            mark(c.world, wr['table'], wr['key'])

    def inj_plan_epoch(c, scope):
        c.world.plans.owner_epoch += 1

    def inj_permission(c, scope):
        decision = c.world.constants['decision:%s:%s' % (c.owner_id, M.ADOPT)]
        c.world.permissions.revoke(decision)
        mark(c.world, c.world.permissions.FAMILY, decision)

    for point in points:
        for label, hook, name in (('registration', inj_registration, 'registration'), ('maintenance', inj_maintenance, 'maintenance'),
                                  ('goal_writer_bypass', inj_goal_bypass, 'goal'), ('plan_owner_epoch', inj_plan_epoch, 'plan'),
                                  ('permission', inj_permission, 'permission')):
            def setup(point=point, hook=hook):
                w, scope = new(suite)
                w.coordinator.inject[('capture', point)] = lambda c: hook(c, scope)
                return w, capture_of(w, scope)
            neg('C5/neg/boundary/%s/%s' % (point, label), setup, 'M/capture/%s/%s' % (point, name), 'capture/' + point)

    def unstable_stop():
        w, scope = new(suite)

        def hook(c):
            record = c.world.host_stop.record(scope)
            c.world.host_stop.manual(scope, 'resume' if record['latched'] else 'stop')
            for k in c.world.storage.cells.get(c.world.host_stop.RECEIPTS, {}):
                mark(c.world, c.world.host_stop.RECEIPTS, k)
            for k in c.world.storage.cells.get(B.ORIGINS, {}):
                mark(c.world, B.ORIGINS, k)
            mark(c.world, c.world.host_stop.FAMILY, c.world.host_stop.key(scope))
            c.inject[('capture', 'after_sir')] = hook
        w.coordinator.inject[('capture', 'after_sir')] = hook
        return w, capture_of(w, scope)
    neg('C5/neg/stop_keeps_changing_capture_unavailable', unstable_stop, 'M/capture/stop_unstable', 'capture/yield')


def cases(suite):
    positives(suite)
    negatives(suite)
