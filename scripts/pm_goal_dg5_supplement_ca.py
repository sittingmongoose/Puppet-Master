"""DG5 supplement negatives for goal.cancelled (lead decision 1116061157-ad82, condition 4).

Registered as the CA suite group 'DG5' (the suite's own negative harness checks each expected code).
Each case is one authored single defect; its declared target is written here before it runs.
"""
import copy

import pm_goal_dg_ca_c1 as C1
import pm_goal_dg_ca_owners as O
import pm_goal_dg_ca_oracles as DGO
import pm_goal_dg_ca_assignment as AS
import pm_goal_dg_ca_c2 as C2
import pm_goal_dg_ca_c2_cases as C2C
import pm_goal_dg_ca_c4_cases as C4C
import pm_goal_dg_ca3_cases as C3C
import pm_goal_dg_ca3_route as R3
import pm_goal_dg_cb_migration as MB
import pm_goal_dg_cb_owners as BO
import pm_goal_dg_cb_c5_cases as C5C
import pm_goal_dg_cb_c6_cases as C6C
import pm_goal_test_storage as S

C1_SITE = 'dg5/site/pm_goal_dg_ca_c1.py:'
C2_SITE = 'dg5/site/pm_goal_dg_ca_c2.py:'
R3_SITE = 'dg5/site/pm_goal_dg_ca3_route.py:'
N3_SITE = 'dg5/site/pm_goal_dg_ca3_native.py:'
IX_SITE = 'dg5/site/pm_goal_dg_ca3_index.py:'
MB_SITE = 'dg5/site/pm_goal_dg_cb_migration.py:'
BO_SITE = 'dg5/site/pm_goal_dg_cb_owners.py:'
AS_SITE = 'dg5/site/pm_goal_dg_ca_assignment.py:'
OWNERS_SITE = 'dg5/site/pm_goal_dg_ca_owners.py:'
MAX_U64 = 2 ** 64 - 1
TARGETS = {}


def cases(suite):
    G = 'DG5'

    def stale_revision_only():
        # C1/entry/stale_revision_coherent_hash stales revision and currentness together, so with
        # :305 cut the currentness check :306 refuses; here only the revision is stale.
        w = suite.world()
        route = C1.NoAssociationCancel(w, state='active')
        old = copy.deepcopy(w.goal.body_cell(route.scope)['value']['record'])
        w.goal.mutate_state(route.scope, 'paused')
        current = w.goal.body_cell(route.scope)['value']['record']
        route.dispatch(route.user_request(expected_revision=old['revision'],
                                          expected_currentness_hash=current['currentness_hash']))
        return w, route.capture_source
    TARGETS['DG5/DG5/entry/stale_revision_only'] = C1_SITE + '305'
    suite.negative(G, 'DG5/entry/stale_revision_only', stale_revision_only, 'C1/capture_source/expected_revision',
                   boundary='capture_source/entry')

    # ---- batch 1 (helper C): direct owner-API sites in pm_goal_dg_ca_owners.py ----
    # One defect each: an absent/substituted stored cell, a bad action word, or a stored
    # counter at the uint64 ceiling. Setup edits precede the harness snapshot, as in C4 cases.
    def add(name, fn, expected, target):
        TARGETS['DG5/DG5/' + name] = target
        suite.negative(G, 'DG5/' + name, fn, expected, boundary='dg5_supplement')

    def born():
        w = suite.world()
        return w, C1.NoAssociationCancel(w, state='active')

    def absent_scope(route):
        return dict(route.scope, project_id=O.short_id('proj'), thread_id=O.short_id('thr'),
                    goal_id=O.short_id('goal'))

    def drop(w, table, key):
        w.storage.cells.get(table, {}).pop(key, None)

    def edit_record(w, table, key, field, value):
        cell = w.storage.cells[table][key]
        new = copy.deepcopy(cell['value'])
        new['record'][field] = value
        cell['value'] = new

    def manual_action_bogus():
        w, r = born()
        w.host_stop.manual(r.scope, 'stop')   # latched, so only the action-word check can refuse 'bogus'
        return w, lambda: w.host_stop.manual(r.scope, 'bogus')
    add('owner/manual_action_bogus', manual_action_bogus, 'host_stop/manual_action', OWNERS_SITE + '336')

    def host_stop_current_absent():
        w, r = born()
        s = absent_scope(r)
        return w, lambda: w.host_stop.current(s)
    add('owner/host_stop_current_absent', host_stop_current_absent, 'host_stop/unavailable', OWNERS_SITE + '328')

    def goal_body_cell_absent():
        w, r = born()
        s = absent_scope(r)
        return w, lambda: w.goal.body_cell(s)
    add('owner/goal_body_cell_absent', goal_body_cell_absent, 'goal/body_unavailable', OWNERS_SITE + '405')

    def goal_control_absent():
        w, r = born()
        s = absent_scope(r)
        return w, lambda: w.goal.control(s)
    add('owner/goal_control_absent', goal_control_absent, 'goal/control_unavailable', OWNERS_SITE + '400')

    def goal_snapshot_body_absent():
        w, r = born()
        drop(w, w.goal.BODY, w.goal.keys(r.scope)['body'])
        return w, lambda: w.goal.snapshot(r.scope)
    add('owner/goal_snapshot_body_absent', goal_snapshot_body_absent, 'goal/body_unavailable', OWNERS_SITE + '382')

    def goal_snapshot_control_absent():
        w, r = born()
        drop(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'])
        return w, lambda: w.goal.snapshot(r.scope)
    add('owner/goal_snapshot_control_absent', goal_snapshot_control_absent, 'goal/control_unavailable', OWNERS_SITE + '383')

    def goal_history_absent():
        w, r = born()
        drop(w, w.goal.REVISION, w.goal.keys(r.scope, 1)['revision'])
        return w, lambda: w.goal.snapshot(r.scope)
    add('owner/goal_history_absent', goal_history_absent, 'goal/history_unavailable', OWNERS_SITE + '391')

    def registration_unavailable():
        w, r = born()
        drop(w, w.registration.FAMILY, w.registration.registrations['goal_birth'])
        return w, w.registration.rows
    add('owner/registration_unavailable', registration_unavailable, 'registration/unavailable/goal_birth', OWNERS_SITE + '277')

    def domain_head_unavailable():
        w = suite.world()   # no route birth: writer domain never installed, no head cell
        return w, w.binding.domain_selection
    add('owner/domain_head_unavailable', domain_head_unavailable, 'domain/head_unavailable', OWNERS_SITE + '554')

    def domain_unavailable():
        w, r = born()
        sel, _, _ = w.binding.domain_selection()
        drop(w, w.binding.DOMAIN, sel['physical_key'])
        return w, w.binding.domain_selection
    add('owner/domain_unavailable', domain_unavailable, 'domain/unavailable', OWNERS_SITE + '557')

    def domain_head_join():
        w, r = born()
        sel, _, _ = w.binding.domain_selection()
        edit_record(w, w.binding.DOMAIN, sel['physical_key'], 'domain_generation', 99)
        return w, w.binding.domain_selection
    add('owner/domain_head_join', domain_head_join, 'domain/head_join', OWNERS_SITE + '558')

    def binding_control_unavailable():
        w, r = born()
        s = absent_scope(r)
        return w, lambda: w.binding.read_current(s)
    add('owner/binding_control_unavailable', binding_control_unavailable, 'binding/control_unavailable', OWNERS_SITE + '584')

    def binding_member(drop_which):
        def make():
            w, r = born()
            read = w.binding.read_current(r.scope)
            rec = read['control']['value']['record']
            sel = rec['current_revision'] if drop_which == 'revision' else rec['current_origin']
            drop(w, sel['family_id'], sel['physical_key'])
            return w, lambda: w.binding.read_current(r.scope)
        return make
    add('owner/binding_revision_unavailable', binding_member('revision'), 'binding/revision_unavailable', OWNERS_SITE + '589')
    add('owner/binding_origin_unavailable', binding_member('origin'), 'binding/origin_unavailable', OWNERS_SITE + '590')

    def binding_join(which, field):
        def make():
            w, r = born()
            read = w.binding.read_current(r.scope)
            sel = read['control']['value']['record']['current_' + which]
            cell = w.storage.cells[sel['family_id']][sel['physical_key']]
            new = copy.deepcopy(cell['value'])
            new['record'][field] = new['record'][field] + 1
            cell['value'] = new
            return w, lambda: w.binding.read_current(r.scope)
        return make
    add('owner/binding_revision_join', binding_join('revision', 'host_execution_owner_epoch'), 'binding/revision_join', OWNERS_SITE + '591')
    add('owner/binding_origin_join', binding_join('origin', 'binding_revision'), 'binding/origin_join', OWNERS_SITE + '592')

    def sir_accepted_unavailable():
        w, r = born()
        return w, lambda: w.sir.stored('TO-cmd-no-such-dispatch')
    add('owner/sir_accepted_unavailable', sir_accepted_unavailable, 'sir/accepted_unavailable', OWNERS_SITE + '699')

    # ---- batch 1b: owner-derived +1 counters at the uint64 ceiling (number rows) ----
    def goal_revision_max():
        w, r = born()
        edit_record(w, w.goal.BODY, w.goal.keys(r.scope)['body'], 'revision', MAX_U64)
        return w, lambda: w.goal.mutate_state(r.scope, 'paused')
    add('number/goal_revision_max', goal_revision_max, 'goal/revision/numrule/integer_range', 'dg5/goal/revision/number')

    def goal_control_epoch_max():
        w, r = born()
        edit_record(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], 'control_epoch', MAX_U64)
        return w, lambda: w.goal.mutate_state(r.scope, 'paused')
    add('number/goal_control_epoch_max', goal_control_epoch_max, 'goal/control_epoch/numrule/integer_range', 'dg5/goal/control_epoch/number')

    def host_stop_epoch_max():
        w, r = born()
        edit_record(w, w.host_stop.FAMILY, w.host_stop.key(r.scope), 'user_stop_epoch', MAX_U64)
        return w, lambda: w.host_stop.manual(r.scope, 'stop')
    add('number/host_stop_epoch_max', host_stop_epoch_max, 'host_stop/epoch/numrule/integer_range', 'dg5/host_stop/epoch/number')

    def binding_owner_epoch_max():
        w, r = born()
        w.binding.owner_epoch = MAX_U64
        return w, w.binding.withdraw
    add('number/binding_owner_epoch_max', binding_owner_epoch_max, 'binding/owner_epoch/numrule/integer_range', 'dg5/binding/owner_epoch/number')

    def sir_owner_epoch_max():
        w, r = born()
        w.sir.owner_epoch = MAX_U64
        return w, w.sir.restart
    add('number/sir_owner_epoch_max', sir_owner_epoch_max, 'sir/owner_epoch/numrule/integer_range', 'dg5/sir/owner_epoch/number')

    def binding_control_epoch_max():
        w, r = born()
        edit_record(w, w.binding.CONTROL, w.binding.keys(r.scope)['control'], 'control_epoch', MAX_U64)
        return w, lambda: w.binding.transfer_owner_epoch(r.scope)
    add('number/binding_control_epoch_max', binding_control_epoch_max, 'binding/control_epoch/numrule/integer_range', 'dg5/binding/control_epoch/number')

    # ---- batch 2 (helper C): C1 route sites ----
    def until(step):
        return DGO.c1_until(suite, step)

    def set_cell(w, table, key, value):
        w.storage.cells[table][key]['value'] = value

    def retry_conflict():
        w, r = until('latch_and_reserve')
        key = r.key('goal_cancel_source_audit')
        cell = w.storage.cells['goal_cancel_source_audit'][key]
        new = copy.deepcopy(cell['value'])
        new['record']['request']['expected_revision'] += 1
        cell['value'] = new
        return w, r.capture_source
    add('c1/retry_conflict', retry_conflict, 'C1/capture_source/retry_conflict', C1_SITE + '292')

    def body_active_run():
        w = suite.world()
        r = C1.NoAssociationCancel(w, state='active')
        m = w.shared.goal_model
        body = copy.deepcopy(w.goal.body_cell(r.scope)['value']['record'])
        body['active_run_ref'] = O.short_id('run')
        body['currentness_hash'] = m.hashbody({k: v for k, v in body.items() if k != 'currentness_hash'})
        control = copy.deepcopy(w.goal.control(r.scope)['value']['record'])
        control.update(body_sha256=m.bytehash(body), currentness_hash=body['currentness_hash'])
        set_cell(w, w.goal.BODY, w.goal.keys(r.scope)['body'], w.goal.wrap('body', body))
        set_cell(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], w.goal.wrap('control', control))
        r.dispatch(r.user_request())
        return w, r.capture_source
    add('c1/body_active_run', body_active_run, 'C1/capture_source/body_active_run', C1_SITE + '307')

    def binding_pending():
        w, r = DGO.c1_route(suite)
        edit_record(w, w.binding.CONTROL, w.binding.keys(r.scope)['control'], 'pending',
                    dict(operation_id=O.uid('TEST_ONLY:binding-pending')))
        return w, r.capture_source
    add('c1/binding_pending', binding_pending, 'C1/capture_source/binding_pending', C1_SITE + '315')

    def binding_host_owner():
        w, r = DGO.c1_route(suite)
        read = w.binding.read_current(r.scope)
        sel = read['control']['value']['record']['current_revision']
        cell = w.storage.cells[sel['family_id']][sel['physical_key']]
        new = copy.deepcopy(cell['value'])
        new['record']['host_execution_owner_ref'] = O.uid('TEST_ONLY:foreign-host-owner')
        cell['value'] = new
        ctl = w.storage.cells[w.binding.CONTROL][w.binding.keys(r.scope)['control']]
        newc = copy.deepcopy(ctl['value'])
        newc['record']['current_revision']['complete_value_sha256'] = O.row_sha(new)
        ctl['value'] = newc
        return w, r.capture_source
    add('c1/binding_host_owner', binding_host_owner, 'C1/capture_source/binding_host_owner', C1_SITE + '316')

    def settle_inventory_owner():
        w, r = until('settle_owner')
        cell = w.storage.cells[w.binding.PROOF][r.proof_key]
        new = copy.deepcopy(cell['value'])
        new['statements'][0]['owner_id'] = O.uid('TEST_ONLY:foreign-inventory-owner')
        cell['value'] = new
        return w, r.settle_owner
    add('c1/settle_inventory_owner', settle_inventory_owner,
        'C1/settle_owner/inventory_owner/plan_association', C1_SITE + '535')

    def settle_pending():
        w, r = until('settle_owner')
        # Genuine reserve_pending is fenced off once a cancellation is pending (owners :478),
        # so the substituted control carries the unresolved body pending directly.
        edit_record(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], 'pending',
                    dict(operation_id=O.uid('TEST_ONLY:pending-body-operation')))
        return w, r.settle_owner
    add('c1/settle_pending_unresolved', settle_pending, 'C1/settle_owner/pending_unresolved', C1_SITE + '540')

    def coherent_progress(w, r):
        cells = w.storage.cells['goal_cancel_progress']
        cells[r.progress_key(r.progress['progress_epoch'])]['value'] = r.wrap('StorageProgress', r.progress)
        cells[r.key('goal_cancel_progress') + ':head']['value'] = r.wrap('StorageProgress',
                                                                         r._head(r.progress['progress_epoch'], r.progress))

    def resolve_stored_producer():
        w, r = until('append_original')
        r.append_original(lose_ack=True)
        r.progress = copy.deepcopy(r.progress)
        r.progress['producer_input']['correlation_id'] = O.uid('TEST_ONLY:correlation')
        coherent_progress(w, r)
        return w, r.resolve_original
    add('c1/resolve_stored_producer', resolve_stored_producer, 'C1/resolve_original/stored_producer', C1_SITE + '648')

    def publish_reservation_missing():
        w, r = until('publish_control')
        edit_record(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], 'cancellation_pending', None)
        return w, r.publish_control
    add('c1/publish_reservation', publish_reservation_missing, 'C1/publish_control/reservation', C1_SITE + '672')

    def publish_pending():
        w, r = until('publish_control')
        edit_record(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], 'pending',
                    dict(operation_id=O.uid('TEST_ONLY:pending-body-operation')))
        return w, r.publish_control
    add('c1/publish_pending_unresolved', publish_pending, 'C1/publish_control/pending_unresolved', C1_SITE + '674')

    def terminal_control_unpublished():
        w, r = until('terminal')
        edit_record(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], 'cancellation_receipt_ref', None)
        return w, r.terminal
    add('c1/terminal_control_published', terminal_control_unpublished, 'C1/terminal/control_published', C1_SITE + '712')

    def replay_other_operation():
        w, r = until('terminal')
        r.terminal()
        req = r.user_request()

        def act():
            # SIR accept of the new dispatch writes its accepted/outcome cells before :819;
            # those two are the injected change, everything else must stay preserved.
            DGO.mark(w, w.sir.ACCEPTED, req['command_instance_id'])
            DGO.mark(w, w.sir.OUTCOME, req['command_instance_id'])
            return r.replay(req)
        return w, act
    add('c1/replay_operation', replay_other_operation, 'C1/replay/operation', C1_SITE + '819')

    def replay_substituted_terminal():
        w, r = until('terminal')
        r.terminal()
        edit_record(w, 'goal_cancel_terminal_audit', r.key('goal_cancel_terminal_audit'), 'kind', 'unknown')
        return w, lambda: r.replay(copy.deepcopy(r.request))
    add('c1/replay_original_terminal', replay_substituted_terminal, 'C1/replay/original_terminal', C1_SITE + '822')

    def retained_member(which):
        def make():
            w, r = until('latch_and_reserve')
            read = w.binding.read_current(r.scope)
            sel = read['control']['value']['record']['current_' + which]
            drop(w, sel['family_id'], sel['physical_key'])
            return w, r.read_retained_selection
        return make
    add('c1/retained_revision_original', retained_member('revision'),
        'C1/read_retained_selection/revision_original', C1_SITE + '859')
    add('c1/retained_origin_original', retained_member('origin'),
        'C1/read_retained_selection/origin_original', C1_SITE + '861')

    def held_stop_changed():
        w, r = DGO.c1_route(suite)
        held = r.hold_current_read()
        w.host_stop.manual(r.scope, 'stop')
        return w, lambda: r.release_held(held)
    add('c1/held_reader_stop', held_stop_changed, 'C1/held_reader/stop', C1_SITE + '881')

    # ---- batch 2b: C1 route number rows ----
    def stop_epoch_max():
        w = suite.world()
        r = C1.NoAssociationCancel(w, state='active')
        edit_record(w, w.host_stop.FAMILY, w.host_stop.key(r.scope), 'user_stop_epoch', MAX_U64)
        r.dispatch(r.user_request())
        r.capture_source()
        return w, r.latch_and_reserve
    add('number/c1_stop_epoch_max', stop_epoch_max, 'C1/stop_epoch/numrule/integer_range', 'dg5/C1/stop_epoch/number')

    def continuation_epoch_max():
        w = suite.world()
        r = C1.NoAssociationCancel(w, state='active')
        edit_record(w, w.host_stop.FAMILY, w.host_stop.key(r.scope), 'continuation_epoch', MAX_U64)
        r.dispatch(r.user_request())
        r.capture_source()
        return w, r.latch_and_reserve
    add('number/c1_continuation_epoch_max', continuation_epoch_max,
        'C1/continuation_epoch/numrule/integer_range', 'dg5/C1/continuation_epoch/number')

    def progress_epoch_max():
        w, r = until('latch_and_reserve')
        old_key = r.progress_key(r.progress['progress_epoch'])
        r.progress = copy.deepcopy(r.progress)
        r.progress['progress_epoch'] = MAX_U64
        cells = w.storage.cells['goal_cancel_progress']
        cells[r.progress_key(MAX_U64)] = copy.deepcopy(cells[old_key])
        coherent_progress(w, r)
        return w, r.latch_and_reserve
    add('number/c1_progress_epoch_max', progress_epoch_max,
        'C1/progress_epoch/numrule/integer_range', 'dg5/C1/progress_epoch/number')

    def c1_control_epoch_max():
        w, r = until('publish_control')
        edit_record(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], 'control_epoch', MAX_U64)
        return w, r.publish_control
    add('number/c1_control_epoch_max', c1_control_epoch_max,
        'C1/control_epoch/numrule/integer_range', 'dg5/C1/control_epoch/number')

    # ---- batch 3 (helper C): C2 capture_source sites + assignment (C4) sites ----
    def body_edit(w, r, **fields):
        """Coherent Goal body+control rewrite (owner recomputes both hashes), as in mutate_state."""
        m = w.shared.goal_model
        body = copy.deepcopy(w.goal.body_cell(r.scope)['value']['record'])
        body.update(fields)
        body['currentness_hash'] = m.hashbody({k: v for k, v in body.items() if k != 'currentness_hash'})
        control = copy.deepcopy(w.goal.control(r.scope)['value']['record'])
        control.update(body_sha256=m.bytehash(body), current_revision=body['revision'],
                       currentness_hash=body['currentness_hash'])
        set_cell(w, w.goal.BODY, w.goal.keys(r.scope)['body'], w.goal.wrap('body', body))
        set_cell(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], w.goal.wrap('control', control))
        return body

    def edit_binding_revision(w, r, fn):
        """Coherent binding-revision substitution: revision cell and its control selection sha."""
        read = w.binding.read_current(r.scope)
        sel = read['control']['value']['record']['current_revision']
        cell = w.storage.cells[sel['family_id']][sel['physical_key']]
        new = copy.deepcopy(cell['value'])
        fn(new['record'])
        cell['value'] = new
        ctl = w.storage.cells[w.binding.CONTROL][w.binding.keys(r.scope)['control']]
        newc = copy.deepcopy(ctl['value'])
        newc['record']['current_revision']['complete_value_sha256'] = O.row_sha(new)
        ctl['value'] = newc

    def c2_accepted_dispatch():
        w, r = C2C.route(suite)
        req = dict(r.request, return_route_ref=O.uid('TEST_ONLY:return-route'))
        return w, lambda: r.capture_source(req)
    add('c2/accepted_dispatch', c2_accepted_dispatch, 'C2/capture_source/accepted_dispatch', C2_SITE + '567')

    def c2_accepted_custody():
        w, r = C2C.route(suite)
        cell = w.storage.cells[w.sir.ACCEPTED][r.request['command_instance_id']]
        new = copy.deepcopy(cell['value'])
        new['acceptance_ref'] = O.uid('TEST_ONLY:foreign-acceptance')
        cell['value'] = new
        return w, r.capture_source
    add('c2/accepted_custody', c2_accepted_custody, 'C2/capture_source/accepted_custody', C2_SITE + '568')

    def c2_permission():
        w, r = C2C.route(suite)
        w.permissions.revoke(r.cancel_decision)
        return w, r.capture_source
    add('c2/permission', c2_permission, 'C2/capture_source/permission', C2_SITE + '574')

    def c2_legal_state():
        suite.n += 1
        w = AS.assigned_world(suite.work / ('b%05d' % suite.n))
        r = C2.BoundPlanCancel(w, state='active')
        body_edit(w, r, state='completed')
        r.dispatch(r.user_request())
        return w, r.capture_source
    add('c2/legal_state', c2_legal_state, 'C2/capture_source/legal_state', C2_SITE + '579')

    def c2_not_cancelled():
        w, r = C2C.route(suite)
        edit_record(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], 'cancellation_pending',
                    dict(operation_id=O.uid('TEST_ONLY:pending-cancel')))
        return w, r.capture_source
    add('c2/not_cancelled', c2_not_cancelled, 'C2/capture_source/not_cancelled', C2_SITE + '580')

    def c2_stale(field):
        def make():
            suite.n += 1
            w = AS.assigned_world(suite.work / ('b%05d' % suite.n))
            r = C2.BoundPlanCancel(w, state='active')
            old = copy.deepcopy(w.goal.body_cell(r.scope)['value']['record'])
            w.goal.mutate_state(r.scope, 'paused')
            cur = w.goal.body_cell(r.scope)['value']['record']
            if field == 'revision':
                r.dispatch(r.user_request(expected_revision=old['revision'],
                                          expected_currentness_hash=cur['currentness_hash']))
            else:
                r.dispatch(r.user_request(expected_revision=cur['revision'],
                                          expected_currentness_hash=old['currentness_hash']))
            return w, r.capture_source
        return make
    add('c2/expected_revision', c2_stale('revision'), 'C2/capture_source/expected_revision', C2_SITE + '581')
    add('c2/expected_currentness', c2_stale('hash'), 'C2/capture_source/expected_currentness', C2_SITE + '582')

    def c2_pending_unresolved():
        w, r = C2C.route(suite)
        w.goal.reserve_pending(r.scope, w.host_stop.record(r.scope)['user_stop_epoch'])
        return w, r.capture_source
    add('c2/pending_unresolved', c2_pending_unresolved, 'C2/capture_source/pending_unresolved', C2_SITE + '583')

    def c2_single_association():
        w, r = C2C.route(suite)
        edit_binding_revision(w, r, lambda rec: rec.update(associations=[]))
        return w, r.capture_source
    add('c2/single_plan_association', c2_single_association, 'C2/capture_source/single_plan_association', C2_SITE + '588')

    def c2_binding_pending():
        w, r = C2C.route(suite)
        edit_record(w, w.binding.CONTROL, w.binding.keys(r.scope)['control'], 'pending',
                    dict(operation_id=O.uid('TEST_ONLY:binding-pending')))
        return w, r.capture_source
    add('c2/binding_pending', c2_binding_pending, 'C2/capture_source/binding_pending', C2_SITE + '590')

    def c2_binding_source():
        w, r = C2C.route(suite)
        drop(w, 'goal_plan_binding', r.binding_key)
        return w, r.capture_source
    add('c2/goal_plan_binding_source', c2_binding_source, 'C2/capture_source/goal_plan_binding_source', C2_SITE + '593')

    def c2_run_goal():
        w, r = C2C.route(suite)
        edit_record(w, 'assistant_plan_run', r.plan_keys()['run'], 'goal_ref', O.short_id('goal'))
        return w, r.capture_source
    add('c2/run_goal', c2_run_goal, 'C2/capture_source/run_goal', C2_SITE + '605')

    def c2_execution_owner():
        w, r = C2C.route(suite)
        edit_binding_revision(w, r, lambda rec: rec['associations'][0].update(
            execution_owner_ref=O.uid('TEST_ONLY:foreign-plan-owner')))
        return w, r.capture_source
    add('c2/execution_owner', c2_execution_owner, 'C2/capture_source/execution_owner', C2_SITE + '606')

    # ---- assignment (C4) storage/seglog/codec sites ----
    def as_active_segment():
        w, r = C4C.until(suite, 'reserve_append_assignment')

        def act():
            DGO.mark(w, AS.LEASE_TABLE, w.storage.lease_key())
            return r.reserve_append_assignment()
        w.storage.segments[-1]['sealed'] = True
        return w, act
    add('c4/active_segment', as_active_segment, 'assignment/active_segment', AS_SITE + '146')

    def as_lease_next():
        w, r = C4C.until(suite, 'reserve_append_assignment')
        w.storage.last_sequence = MAX_U64
        return w, r.reserve_append_assignment
    add('number/lease_next_max', as_lease_next, 'lease/next/numrule/integer_range', 'dg5/lease/next/number')

    def as_manifest_join():
        w, r = C4C.until(suite, 'reserve_append_assignment')
        cur = S.decode_canonical((w.storage.root / 'CURRENT').read_bytes())
        cur['manifest_sha256'] = '0' * 64
        (w.storage.root / 'CURRENT').write_bytes(S.canonical(cur))
        return w, r.reserve_append_assignment
    add('c4/current_manifest_join', as_manifest_join, 'seglog/current_manifest_join', AS_SITE + '240')

    def as_lease_unavailable():
        w, r = C4C.until(suite, 'reserve_append_assignment')
        drop(w, AS.LEASE_TABLE, w.storage.lease_key())
        return w, r.reserve_append_assignment
    add('c4/lease_unavailable', as_lease_unavailable, 'seglog/lease_unavailable', AS_SITE + '242')

    def as_append_setup(mutate):
        w, r = C4C.until(suite, 'append_original')
        mutate(w, r)
        return w, r.append_original

    def _seg(field, value):
        return lambda w, r: w.storage.segments[-1].update({field: value})
    add('c4/selected_segment', lambda: as_append_setup(_seg('sealed', True)),
        'assignment/selected_segment', AS_SITE + '196')
    add('c4/selected_offset', lambda: as_append_setup(
        lambda w, r: w.storage.segments[-1].update(watermark=w.storage.segments[-1]['watermark'] + 1)),
        'assignment/selected_offset', AS_SITE + '197')
    add('c4/selected_manifest', lambda: as_append_setup(
        lambda w, r: setattr(w.storage, 'manifest_generation', w.storage.manifest_generation + 1)),
        'assignment/selected_manifest', AS_SITE + '198')
    add('c4/sequence_reused', lambda: as_append_setup(
        lambda w, r: setattr(w.storage, 'last_sequence', r.reservation_source['reserved_sequence_id'])),
        'assignment/sequence_reused', AS_SITE + '199')

    def as_reservation_abandoned():
        def mut(w, r):
            fence = r.fence
            w.storage.abandon(r.operation_id)
            w.storage.fence = fence   # fence_final passes; the abandoned record is the defect
        return as_append_setup(mut)
    add('c4/reservation_abandoned', as_reservation_abandoned, 'assignment/reservation_abandoned', AS_SITE + '192')

    def as_codec_unavailable():
        w, r = C4C.until(suite, 'issue_assignment_audit')
        drop(w, w.codecs.FAMILY, w.codecs.resources[0]['original_registration_ref'])
        return w, r.issue_assignment_audit
    add('c4/codec_registration_unavailable', as_codec_unavailable, 'codec/registration_unavailable', AS_SITE + '339')

    def as_negative_integer():
        w, r = C4C.until(suite, 'issue_assignment_audit')
        r.reservation_record = dict(r.reservation_record, reserved_sequence_id=-1)
        return w, r.issue_assignment_audit
    add('c4/template_negative_integer', as_negative_integer, 'template/negative_integer', AS_SITE + '355')

    # :377 template/slot_unbound: no case. The audit schema closes source_slot to the three
    # slots append always binds (a bogus slot fails StorageAssignmentAudit schema at resolve),
    # so this row is closed by a written proof in pm_goal_dg5_proofs_ca.py.

    def as_reference_unavailable():
        w, r = C4C.until(suite, 'admit_codec_domain')
        drop(w, AS.AUDIT_TABLE, r.audit_key)
        return w, r.admit_codec_domain
    add('c4/audit_reference_unavailable', as_reference_unavailable,
        'C4A/admit_codec_domain/audit_reference_unavailable', AS_SITE + '432')

    def as_selection_unavailable():
        w, r = C4C.until(suite, 'issue_assignment_audit')
        # Binding selection, not source audit: _require_progress would refuse source custody first.
        drop(w, 'goal_cancel_binding_selection', r.key('goal_cancel_binding_selection'))
        return w, r.issue_assignment_audit
    add('c4/selection_unavailable', as_selection_unavailable,
        'C4A/selection_unavailable/goal_cancel_binding_selection', AS_SITE + '572')

    def as_fence_final():
        w, r = C4C.until(suite, 'issue_assignment_audit')
        r.inject[('issue_assignment_audit', 'final')] = lambda route: setattr(route.world.storage, 'fence', None)
        return w, r.issue_assignment_audit
    add('c4/issue_fence_final', as_fence_final, 'C4A/issue_assignment_audit/fence_final', AS_SITE + '648')

    def as_audit_absent():
        w, r = C4C.until(suite, 'issue_assignment_audit')
        key = w.assigner.audit_key(r.scope, r.operation_id, 0)
        w.write([w.put(AS.AUDIT_TABLE, key, dict(schema_id='pm.test_only.preexisting_audit.v1', record={}))])
        return w, r.issue_assignment_audit
    add('c4/issue_audit_absent', as_audit_absent, 'C4A/issue_assignment_audit/audit_absent', AS_SITE + '649')

    def as_admit_fence():
        w, r = C4C.until(suite, 'admit_codec_domain')
        w.storage.fence = None
        return w, r.admit_codec_domain
    add('c4/admit_fence', as_admit_fence, 'C4A/admit_codec_domain/fence', AS_SITE + '662')

    def as_admit_custody():
        w, r = C4C.until(suite, 'admit_codec_domain')
        r.assignment_audit = dict(r.assignment_audit, assignment_attempt=9)
        return w, r.admit_codec_domain
    add('c4/admit_audit_custody', as_admit_custody, 'C4A/admit_codec_domain/audit_custody', AS_SITE + '664')

    def as_codec_resources():
        w, r = C4C.until(suite, 'admit_codec_domain')
        C4C.substitute_audit(w, r, lambda rec: rec['codec_resources'][0].update(codec_version='9.9.9'))
        return w, r.admit_codec_domain
    add('c4/codec_resources', as_codec_resources, 'C4A/admit_codec_domain/codec_resources', AS_SITE + '668')

    def as_append_writer_cutoff():
        w, r = C4C.until(suite, 'append_original')
        w.binding.withdraw()
        return w, r.append_original
    add('c4/append_writer_cutoff', as_append_writer_cutoff, 'C4A/append_reserved/writer_cutoff', AS_SITE + '698')

    def as_append_admission():
        w, r = C4C.until(suite, 'append_original')
        r.assignment = None
        return w, r.append_original
    add('c4/append_admission', as_append_admission, 'C4A/append_reserved/admission', AS_SITE + '699')

    def as_append_custody():
        w, r = C4C.until(suite, 'append_original')
        r.assignment_audit = dict(r.assignment_audit, assignment_attempt=9)
        return w, r.append_original
    add('c4/append_audit_custody', as_append_custody, 'C4A/append_reserved/audit_custody', AS_SITE + '701')

    def readmit_substituted(w, r):
        """Recompute the in-memory admission for a coherently substituted audit (full_domain)."""
        _, stored = w.assigner.resolve_audit(r.audit_key, where='C4A/append_reserved')
        selection = r.stored_selection(AS.AUDIT_TABLE, r.audit_key)
        r.domain_input = dict(assignment=selection, numeric_path_domains=stored['record']['numeric_path_domains'],
                              codec_resources=stored['record']['codec_resources'],
                              exact_event_encoding_template=stored['record']['exact_event_encoding_template'])
        r.assignment = dict(r.assignment, assignment=selection,
                            full_domain_sha256=w.assigner.h_domain('pm.goal.cancel.assignment_domain.v1', r.domain_input))

    def as_template_keyset():
        w, r = C4C.until(suite, 'append_original')

        def edit(rec):
            t = rec['exact_event_encoding_template']
            t['members'] = [m for m in t['members'] if m['key'] != 'payload']
        C4C.substitute_audit(w, r, edit)
        readmit_substituted(w, r)
        return w, r.append_original
    add('c4/template_keyset', as_template_keyset, 'C4A/append_reserved/template_keyset', AS_SITE + '715')

    # :600 header_cap: no case. Every header member is schema-bounded (actor_ref maxLength
    # refuses an oversize producer at dispatch), so a schema-valid header cannot reach
    # 4096 bytes; closed by a written proof in pm_goal_dg5_proofs_ca.py.

    # ---- batch 4 (helper C): owner mutation fences + C2 plan-effects sites ----
    def mutation_cancelled():
        w, r = until('terminal')   # control published: cancellation_receipt_ref set
        return w, lambda: w.goal.mutate_state(r.scope, 'paused')
    add('owner/mutation_cancelled', mutation_cancelled, 'goal/mutation_cancelled', OWNERS_SITE + '455')

    def mutation_cancel_pending():
        w, r = until('commit_receipt')   # stop reserved: cancellation_pending set, no receipt yet
        return w, lambda: w.goal.mutate_state(r.scope, 'paused')
    add('owner/mutation_cancel_pending', mutation_cancel_pending, 'goal/mutation_cancel_pending', OWNERS_SITE + '456')

    def pending_cancel_fenced():
        w, r = until('commit_receipt')
        return w, lambda: w.goal.reserve_pending(r.scope, w.host_stop.record(r.scope)['user_stop_epoch'])
    add('owner/pending_cancel_fenced', pending_cancel_fenced, 'goal/pending_cancel_fenced', OWNERS_SITE + '478')

    def binding_domain_join():
        w, r = born()
        sel, _, _ = w.binding.domain_selection()
        foreign = dict(sel, physical_key=sel['physical_key'] + ':foreign')
        edit_binding_revision(w, r, lambda rec: rec.update(writer_domain=foreign))
        return w, lambda: w.binding.read_current(r.scope)
    add('owner/binding_domain_join', binding_domain_join, 'binding/domain_join', OWNERS_SITE + '594')

    def settled_until():
        return C2C.until(suite, 'settle_owner')

    def plan_source_unavailable():
        w, r = settled_until()
        drop(w, 'assistant_plan_record', r.plan_keys()['plan'])
        return w, r.settle_owner
    add('c2/plan_source_unavailable', plan_source_unavailable,
        'plan_store/source_unavailable/assistant_plan_record', C2_SITE + '109')

    def plan_origin_unavailable():
        w, r = settled_until()
        key = r.plan_keys()['plan']
        value = w.value('assistant_plan_record', key)
        okey = 'plan_cancel_source_origin.v1:%s:%s:%s' % (C2.hx(w.storage_id), C2.hx(key), O.row_sha(value))
        drop(w, 'plan_cancel_source_origin', okey)
        return w, r.settle_owner
    add('c2/plan_origin_unavailable', plan_origin_unavailable,
        'plan_store/origin_unavailable/assistant_plan_record', C2_SITE + '112')

    def effects_unavailable():
        w, r = settled_until()
        fam, key = r.actual_targets['plan_effect'][0], r.actual_targets['plan_effect'][1]
        drop(w, fam, key)
        return w, r.settle_owner
    add('c2/effects_unavailable', effects_unavailable, 'C2/effects/unavailable/plan_effect', C2_SITE + '1215')

    def settlement_join():
        w, r = settled_until()
        r.actual_targets['owner_settlement'][2]['original_owner_settlement_sha256'] = '0' * 64
        return w, r.settle_owner
    add('c2/settlement_join', settlement_join, 'C2/effects/settlement_join', C2_SITE + '1223')

    def safe_stop_unavailable():
        w, r = settled_until()
        w.storage.cells.get(w.plans.SAFE_STOP, {}).clear()
        return w, r.settle_owner
    add('c2/safe_stop_unavailable', safe_stop_unavailable, 'C2/effects/safe_stop_unavailable', C2_SITE + '1234')

    def run_not_cancelled():
        w, r = settled_until()
        # Owner-shaped run transition back to running (new origin, anchor cleared as the
        # StoragePlanRun schema requires for a non-cancelled run), so bindings join at :1259.
        key = r.plan_keys()['run']
        cell = w.cell('assistant_plan_run', key)
        before, after = cell['value'], copy.deepcopy(cell['value'])
        after['source_revision'] = before['source_revision'] + 1
        after['record']['state'] = 'running'
        after['run_completion_anchor'] = None
        C2.check(w, 'StoragePlanRun', after)
        op = O.uid('TEST_ONLY:run-transition')
        okey, origin = w.plans.origin('assistant_plan_run', key, after,
                                      issuer_method='owner.assistant_plan.run.original.write.v1',
                                      operation_id=op, transaction_id=O.uid('TEST_ONLY:tx'), causation_ref=op,
                                      prior=O.row_sha(before), at=w.plans.clock.now())
        w.write([w.put('assistant_plan_run', key, after, expected=cell['version']),
                 w.put('plan_cancel_source_origin', okey, origin)])
        return w, r.settle_owner
    add('c2/run_cancelled', run_not_cancelled, 'C2/verify_current_custody/run_cancelled', C2_SITE + '1259')

    # :1298 bound_kind: no case. The settlement dict is built only with the literal
    # kind='bound_plan_settled' (prepare/plan_commit) and must pass the SettledResult
    # schema in stored_settled immediately before :1298 in the same call; a wrong kind
    # is schema-refused there. Closed by a written proof in pm_goal_dg5_proofs_ca.py.

    # ---- batch 5 (helper C): C1 append-custody re-checks via resolve_original ----
    # The event is appended in setup (lost ack), so resolve itself performs no append
    # and the harness's preserved-effects rule holds.
    def lost_event(mutate):
        w, r = until('append_original')
        r.append_original(lose_ack=True)
        eid = next(iter(w.storage.events))
        mutate(w, r, eid)
        return w, r.resolve_original

    add('c1/custody_unavailable', lambda: lost_event(lambda w, r, eid: w.storage.custody.pop(eid)),
        'C1/append_original/custody_unavailable', C1_SITE + '587')

    def _group(w, eid):
        return next(g for g in w.storage.groups if g['commit']['commit_group_id'] == w.storage.events[eid]['commit_group_id'])
    add('c1/group_member', lambda: lost_event(lambda w, r, eid: _group(w, eid)['members'].append(list(_group(w, eid)['members'][0]))),
        'C1/append_original/group_member', C1_SITE + '590')
    add('c1/group_digest', lambda: lost_event(lambda w, r, eid: w.storage.custody[eid].update(group_digest='0' * 64)),
        'C1/append_original/group_digest', C1_SITE + '591')
    add('c1/receipt_sequence', lambda: lost_event(
        lambda w, r, eid: w.storage.custody[eid]['first_append_receipt'].update(
            sequence_id=w.storage.custody[eid]['first_append_receipt']['sequence_id'] + 1)),
        'C1/append_original/receipt_sequence', C1_SITE + '593')
    add('c1/value_commitment', lambda: lost_event(
        lambda w, r, eid: w.storage.custody[eid]['original_event_value_commitment'].update(sha256='0' * 64)),
        'C1/append_original/value_commitment', C1_SITE + '594')
    add('c1/producer_digest', lambda: lost_event(lambda w, r, eid: w.storage.custody[eid].update(producer_semantic_digest='0' * 64)),
        'C1/append_original/producer_digest', C1_SITE + '595')

    # ---- batch 6 (helper C): chain-isolating negatives from the ef0 discovery ----
    def audit_reference_join():
        w, r = C4C.until(suite, 'admit_codec_domain')
        cell = w.storage.cells[AS.AUDIT_TABLE][r.audit_key]
        new = copy.deepcopy(cell['value'])
        new['record']['scope'] = dict(new['record']['scope'], goal_id=O.short_id('goal'))
        cell['value'] = new
        return w, r.admit_codec_domain
    add('c4/audit_reference_join', audit_reference_join,
        'C4A/admit_codec_domain/audit_reference_join', AS_SITE + '441')

    def issue_reservation_no_fence():
        w, r = C4C.until(suite, 'issue_assignment_audit')
        r.fence = None
        w.storage.fence = None
        return w, r.issue_assignment_audit
    add('c4/issue_reservation', issue_reservation_no_fence,
        'C4A/issue_assignment_audit/reservation', AS_SITE + '617')

    def template_producer():
        w, r = C4C.until(suite, 'append_original')

        def edit(rec):
            for m in rec['exact_event_encoding_template']['members']:
                if m['key'] == 'payload':
                    for inner in m['value']['members']:
                        if inner['key'] == 'cancel_reason':
                            inner['value'] = dict(term='string', value='other_reason')
        C4C.substitute_audit(w, r, edit)
        readmit_substituted(w, r)
        return w, r.append_original
    add('c4/template_producer', template_producer, 'C4A/append_reserved/template_producer', AS_SITE + '716')

    def fence_clone(w, r):
        clone = AS.Fence(r.fence.operation_id, r.fence.boot_session)
        clone.identity = r.fence.identity
        return clone

    def append_fence_final():
        w, r = C4C.until(suite, 'append_original')
        w.storage.fence = fence_clone(w, r)   # same identity fields, different object: :719 is-check only
        return w, r.append_original
    add('c4/append_fence_final', append_fence_final, 'C4A/append_reserved/fence_final', AS_SITE + '719')

    def fence_lost():
        w, r = C4C.until(suite, 'append_original')
        r.fence.operation_id = O.uid('TEST_ONLY:other-operation')
        return w, r.append_original
    add('c4/fence_lost', fence_lost, 'assignment/fence_lost', AS_SITE + '193')

    def binding_associations():
        suite.n += 1
        w = AS.assigned_world(suite.work / ('b%05d' % suite.n))
        bound = C2.BoundPlanCancel(w, state='active')
        w.plan_inventory.members.clear()   # inventories empty; the binding association remains
        plain = C1.NoAssociationCancel(w, birth=False)
        plain.scope, plain.cancel_decision, plain.actor_ref = bound.scope, bound.cancel_decision, bound.actor_ref
        plain.dispatch(plain.user_request())
        return w, plain.capture_source
    add('c1/binding_associations', binding_associations, 'C1/capture_source/binding_associations', C1_SITE + '314')

    def stop_receipt_custody():
        w, r = until('commit_receipt')
        r.progress = copy.deepcopy(r.progress)
        r.progress['stop_receipt']['original_host_transaction_ref'] = O.uid('TEST_ONLY:host-stop-transaction')
        coherent_progress(w, r)
        return w, r.commit_receipt
    add('c1/stop_receipt_custody', stop_receipt_custody, 'C1/commit_receipt/stop_receipt_custody', C1_SITE + '503')

    def held_withdrawn():
        w, r = DGO.c1_route(suite)
        w.binding.withdraw()
        held = r.hold_current_read()   # held fence already carries the withdrawn domain
        return w, lambda: r.release_held(held)
    add('c1/held_reader_withdrawn', held_withdrawn, 'C1/held_reader/withdrawn', C1_SITE + '878')

    def effects_origin_sha():
        w, r = settled_until()
        fam, key = r.actual_targets['plan_effect'][0], r.actual_targets['plan_effect'][1]
        value = w.value(fam, key)
        okey = 'plan_cancel_source_origin.v1:%s:%s:%s' % (C2.hx(w.storage_id), C2.hx(key), O.row_sha(value))
        edit_record(w, 'plan_cancel_source_origin', okey, 'issued_physical_sha256', '0' * 64)
        return w, r.settle_owner
    add('c2/effects_origin_unavailable', effects_origin_sha,
        'C2/effects/origin_unavailable/plan_effect', C2_SITE + '1219')

    def settle_genuine_effects():
        w, r = settled_until()
        del r.commit_admission
        return w, r.settle_owner
    add('c2/genuine_effects', settle_genuine_effects, 'C2/settle_owner/genuine_effects', C2_SITE + '1293')

    def terminal_bogus_kind():
        w, r = until('commit_receipt')   # phase stop_reserved: the unknown branch's phase set
        return w, lambda: r.terminal('bogus')
    add('c1/terminal_kind', terminal_bogus_kind, 'C1/terminal/kind', C1_SITE + '703')

    def writer_join():
        w, r = born()
        sel, _, _ = w.binding.domain_selection()
        dcell = w.storage.cells[w.binding.DOMAIN][sel['physical_key']]
        new = copy.deepcopy(dcell['value'])
        for row in new['record']['writers']:
            if row['operation'] == 'goal_birth':
                row['original_registration_ref'] = O.uid('TEST_ONLY:foreign-registration')
        dcell['value'] = new
        hkey = 'goal_execution_writer_domain_head.v1:' + w.binding.storage_key()
        hcell = w.storage.cells[w.binding.HEAD][hkey]
        newh = copy.deepcopy(hcell['value'])
        newh['record']['domain']['complete_value_sha256'] = O.row_sha(new)
        hcell['value'] = newh
        return w, lambda: w.binding.require_writer('goal_birth')
    add('owner/writer_join', writer_join, 'domain/writer_join/goal_birth', OWNERS_SITE + '568')

    def user_stop_epoch_max():
        suite.n += 1
        w = AS.assigned_world(suite.work / ('a%05d' % suite.n))
        r = AS.AssignedCancel(w, state='active')
        edit_record(w, w.host_stop.FAMILY, w.host_stop.key(r.scope), 'user_stop_epoch', MAX_U64)
        r.dispatch(r.user_request())
        r.capture_source()
        return w, r.reserve_append_assignment
    add('number/c4a_user_stop_epoch_max', user_stop_epoch_max,
        'C4A/user_stop_epoch/numrule/integer_range', 'dg5/C4A/user_stop_epoch/number')

    def lease_through_max():
        w, r = C4C.until(suite, 'reserve_append_assignment')
        w.storage.last_sequence = MAX_U64 - 10
        return w, r.reserve_append_assignment
    add('number/lease_through_max', lease_through_max,
        'lease/through/numrule/integer_range', 'dg5/lease/through/number')

    def pack_unavailable_only():
        w, r = C4C.until(suite, 'admit_codec_domain')
        ref = w.value(AS.AUDIT_TABLE, r.audit_key)['record']['audit_payload']
        w.storage.packs[ref['blake3']]['durable'] = False   # file kept: only :1726 can refuse
        return w, r.admit_codec_domain
    add('c4/pack_unavailable', pack_unavailable_only, 'pack/unavailable',
        'dg5/site/pm_goal_test_storage.py:1726')

    def pack_present_only():
        w, r = C4C.until(suite, 'admit_codec_domain')
        ref = w.value(AS.AUDIT_TABLE, r.audit_key)['record']['audit_payload']
        (w.storage.root / 'packs' / ref['blake3']).unlink()   # record stays durable: only :1728
        return w, r.admit_codec_domain
    add('c4/pack_present', pack_present_only, 'pack/present',
        'dg5/site/pm_goal_test_storage.py:1728')

    # ---- batch 7 (helper C): shared adapter/storage sites via family entries ----
    ST_SITE = 'dg5/site/pm_goal_test_storage.py:'
    AD_SITE = 'dg5/site/pm_goal_test_owner_adapters.py:'

    def registry_role():
        w, r = DGO.c1_route(suite)
        w.plan_inventory.role = 'bogus_role'
        return w, r.capture_source
    add('shared/registry_role', registry_role, 'registry/role', AD_SITE + '329')

    def registry_unregistered():
        w, r = DGO.c1_route(suite)
        w.plan_inventory.owner_id = O.uid('TEST_ONLY:foreign-owner')
        return w, r.capture_source
    add('shared/registry_unregistered', registry_unregistered, 'registry/unregistered_owner', AD_SITE + '328')

    def original_withdrawn():
        w, r = DGO.c1_route(suite)
        w.sir.withdraw(r.sir_handle)
        return w, r.capture_source
    add('shared/original_withdrawn', original_withdrawn, 'original/withdrawn', AD_SITE + '483')

    def cand_setup(edits=None, first=False):
        w, r = until('append_original')
        p = copy.deepcopy(r.progress['producer_input'])
        if first:
            w.appender.append_original(O.uid('TEST_ONLY:dg5-first'), dict(kind='TEST_ONLY:dg5'), [copy.deepcopy(p)])
        if edits:
            p.update(edits)
        op = O.uid('TEST_ONLY:dg5-append')
        return w, r, op, p

    def append_case(name, setup, expected, target, kw=None):
        def make():
            w, r, op, p = cand_setup(**setup)
            return w, lambda: w.appender.append_original(op, dict(kind='TEST_ONLY:dg5'), [p], **(kw or {}))
        add(name, make, expected, target)

    append_case('shared/durability_class', dict(), 'append/durability_class', ST_SITE + '1450',
                kw=dict(durability_class='bogus'))
    # candidates-shaped cases need the raw candidates argument, not a producer dict:
    def raw_candidates(name, cands, expected, target):
        def make():
            w, r = until('append_original')
            op = O.uid('TEST_ONLY:dg5-append')
            return w, lambda: w.appender.append_original(op, dict(kind='TEST_ONLY:dg5'), cands(r))
        add(name, make, expected, target)
    raw_candidates('shared/append_nonempty', lambda r: [], 'append/nonempty', ST_SITE + '1451')
    raw_candidates('shared/candidate_type', lambda r: ['not-a-dict'], 'append/candidate/type', ST_SITE + '1422')
    append_case('shared/redaction_profile', dict(edits=dict(redaction_profile='secret')),
                'append/candidate/redaction_profile', ST_SITE + '1426')
    append_case('shared/scope_project_id', dict(edits=dict(project_id='')), 'scope/project_id', ST_SITE + '189')
    raw_candidates('shared/duplicate_in_group',
                   lambda r: [copy.deepcopy(r.progress['producer_input'])] * 2,
                   'append/duplicate_in_group', ST_SITE + '1477')
    append_case('shared/append_once_exists', dict(edits=dict(replay_policy='append_once'), first=True),
                'append/append_once_exists', ST_SITE + '1460')

    def conflict(name, edits, expected, target):
        def make():
            w, r, op, p = cand_setup(edits=edits, first=True)
            return w, lambda: w.appender.append_original(op, dict(kind='TEST_ONLY:dg5'), [p])
        add(name, make, expected, target)
    conflict('shared/conflict_event_id', dict(event_id=O.uid('TEST_ONLY:other-event')),
             'append/conflict/event_id', ST_SITE + '1462')
    conflict('shared/conflict_scoped_identity', dict(idempotency_key=O.uid('TEST_ONLY:other-key')),
             'append/conflict/scoped_identity', ST_SITE + '1463')

    def partial_dedupe():
        w, r, op, p = cand_setup(first=True)
        fresh = copy.deepcopy(p)
        fresh.update(event_id=O.uid('TEST_ONLY:fresh-event'), idempotency_key=O.uid('TEST_ONLY:fresh-key'))
        return w, lambda: w.appender.append_original(op, dict(kind='TEST_ONLY:dg5'), [p, fresh])
    add('shared/partial_dedupe', partial_dedupe, 'append/partial_dedupe', ST_SITE + '1466')

    def custody_unavailable():
        w, r = until('publish_control')
        w.storage.custody.pop(r.progress['publication']['event_id'])
        return w, r.publish_control
    add('shared/custody_unavailable', custody_unavailable, 'custody/unavailable', ST_SITE + '1601')

    def read_event_unavailable():
        w, r = until('append_original')
        r.append_original(lose_ack=True)
        w.storage.events.pop(next(iter(w.storage.events)))
        return w, r.resolve_original
    add('shared/read_event_unavailable', read_event_unavailable, 'read/event_unavailable', ST_SITE + '1633')

    def handle_case(name, tamper, expected, target):
        def make():
            w, r = until('terminal')
            tamper(w, r)
            return w, r.terminal
        add(name, make, expected, target)
    handle_case('shared/handle_type', lambda w, r: setattr(r, 'reservation', dict()),
                'handle/type', ST_SITE + '1259')

    def foreign_handle(w, r):
        other = suite.world()
        h = other.storage.reserve(O.uid('TEST_ONLY:foreign-op'), dict(kind='x'))
        r.reservation = h
    handle_case('shared/handle_issuer', foreign_handle, 'handle/issuer', ST_SITE + '1260')

    # ---- batch 8 (helper C): last chain isolations ----
    def fence_held_own():
        w, r = C4C.until(suite, 'append_original')
        op = O.uid('TEST_ONLY:dg5-fenced-op')
        w.storage.fence = AS.Fence(op, w.storage.boot_session)
        p = copy.deepcopy(r.progress['producer_input'])
        return w, lambda: w.appender.append_original(op, dict(kind='TEST_ONLY:dg5'), [p])
    add('c4/fence_held', fence_held_own, 'assignment/fence_held', AS_SITE + '185')

    def second_terminal_same_value():
        w, r = until('terminal')
        last = w.sir.clock.last
        r.terminal()
        w.sir.clock.last = last   # second issue recomputes byte-identical terminal value
        return w, r.terminal
    add('c1/already_issued', second_terminal_same_value, 'C1/terminal/already_issued', C1_SITE + '705')

    # handle/kind (:1261): proof in pm_goal_dg5_proofs_ca.py (_handles only ever holds
    # 'reservation' handles, the only kind _resolve_handle is called with).
    # receipt_handle type/issuer (:1589/:1590): no family entry reaches receipt_of with a
    # caller handle (publish paths use custody directly); left for DG5's adapter source,
    # whose run already kills :1590 - listed in the handover.

    # ---- batch 9 (helper C): C3 Workflow capture + number sites ----
    def c3_manual():
        suite.n += 1
        w = R3.workflow_world(suite.work / ('c3-%05d' % suite.n))
        return w, R3.WorkflowCancel(w, state='active')

    def c3_accepted_dispatch():
        w, r = C3C.wf(suite)
        req = dict(r.request, return_route_ref=O.uid('TEST_ONLY:return-route'))
        return w, lambda: r.capture_source(req)
    add('c3/accepted_dispatch', c3_accepted_dispatch, 'C3/capture_source/accepted_dispatch', R3_SITE + '376')

    def c3_accepted_custody():
        w, r = C3C.wf(suite)
        cell = w.storage.cells[w.sir.ACCEPTED][r.request['command_instance_id']]
        new = copy.deepcopy(cell['value'])
        new['acceptance_ref'] = O.uid('TEST_ONLY:foreign-acceptance')
        cell['value'] = new
        return w, r.capture_source
    add('c3/accepted_custody', c3_accepted_custody, 'C3/capture_source/accepted_custody', R3_SITE + '377')

    def c3_accepted_operation():
        w, r = C3C.wf(suite)
        r.operation_id = O.short_id('op')
        return w, r.capture_source
    add('c3/accepted_operation', c3_accepted_operation, 'C3/capture_source/accepted_operation', R3_SITE + '378')

    def c3_sir_epoch():
        w, r = C3C.wf(suite)
        w.sir.restart()
        return w, r.capture_source
    add('c3/sir_epoch', c3_sir_epoch, 'C3/capture_source/sir_epoch', R3_SITE + '379')

    def c3_retry_conflict():
        w, r = C3C.until(suite, 'prepare')
        key = r.key('goal_cancel_source_audit')
        cell = w.storage.cells['goal_cancel_source_audit'][key]
        new = copy.deepcopy(cell['value'])
        new['record']['request']['expected_revision'] += 1
        cell['value'] = new
        return w, r.capture_source
    add('c3/retry_conflict', c3_retry_conflict, 'C3/capture_source/retry_conflict', R3_SITE + '382')

    def c3_permission():
        w, r = C3C.wf(suite)
        w.permissions.revoke(r.cancel_decision)
        return w, r.capture_source
    add('c3/permission', c3_permission, 'C3/capture_source/permission', R3_SITE + '386')

    def c3_scope():
        w, r = c3_manual()
        r.dispatch(r.user_request(goal_id=r.scope['goal_id'] + '\n'))
        return w, r.capture_source
    add('c3/scope', c3_scope, 'C3/capture_source/scope', R3_SITE + '391')

    def c3_not_cancelled():
        w, r = C3C.wf(suite)
        edit_record(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], 'cancellation_receipt_ref', 'x')
        return w, r.capture_source
    add('c3/not_cancelled', c3_not_cancelled, 'C3/capture_source/not_cancelled', R3_SITE + '393')

    def c3_not_pending():
        w, r = C3C.wf(suite)
        edit_record(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], 'cancellation_pending',
                    dict(operation_id=O.uid('TEST_ONLY:pending-cancel')))
        return w, r.capture_source
    add('c3/not_pending_cancel', c3_not_pending, 'C3/capture_source/not_pending_cancel', R3_SITE + '394')

    def c3_stale_hash():
        w, r = c3_manual()
        old = copy.deepcopy(w.goal.body_cell(r.scope)['value']['record'])
        w.goal.mutate_state(r.scope, 'paused')
        cur = w.goal.body_cell(r.scope)['value']['record']
        r.dispatch(r.user_request(expected_revision=cur['revision'],
                                  expected_currentness_hash=old['currentness_hash']))
        return w, r.capture_source
    add('c3/expected_currentness', c3_stale_hash, 'C3/capture_source/expected_currentness', R3_SITE + '396')

    def c3_pending():
        w, r = C3C.wf(suite)
        w.goal.reserve_pending(r.scope, w.host_stop.record(r.scope)['user_stop_epoch'])
        return w, r.capture_source
    add('c3/pending_unresolved', c3_pending, 'C3/capture_source/pending_unresolved', R3_SITE + '397')

    def c3_binding_pending():
        w, r = C3C.wf(suite)
        edit_record(w, w.binding.CONTROL, w.binding.keys(r.scope)['control'], 'pending',
                    dict(operation_id=O.uid('TEST_ONLY:binding-pending')))
        return w, r.capture_source
    add('c3/binding_pending', c3_binding_pending, 'C3/capture_source/binding_pending', R3_SITE + '402')

    def c3_assoc_run():
        w, r = C3C.wf(suite)
        edit_binding_revision(w, r, lambda rec: rec.update(active_run_ref=O.short_id('run')))
        return w, r.capture_source
    add('c3/association_run', c3_assoc_run, 'C3/association/run', R3_SITE + '351')

    def c3_progress_join():
        w, r = C3C.until(suite, 'prepare')
        edit_record(w, 'goal_cancel_progress', r.key('goal_cancel_progress') + ':head', 'snapshot_sha256', '0' * 64)
        return w, r.prepare
    add('c3/progress_join', c3_progress_join, 'C3/prepare/progress_join', R3_SITE + '362')

    def c3_source_custody():
        w, r = C3C.until(suite, 'prepare')
        r.source = dict(r.source, captured_at='1999-01-01T00:00:00.000Z')
        return w, r.prepare
    add('c3/source_custody', c3_source_custody, 'C3/prepare/source_custody', R3_SITE + '491')

    def c3_ack_identity():
        w, r = C3C.until(suite, 'prepare')
        cell = w.storage.cells[w.sir.OUTCOME][r.request['command_instance_id']]
        new = copy.deepcopy(cell['value'])
        new['record']['identity']['operation_id'] = O.short_id('op')
        cell['value'] = new
        return w, r.prepare
    add('c3/acknowledged_identity', c3_ack_identity, 'C3/prepare/acknowledged_identity', R3_SITE + '587')

    def c3_readiness_goal_argument():
        w, r = C3C.until(suite, 'latch_and_reserve')
        r.readiness = dict(r.readiness, goal_argument_sha256='0' * 64)
        edit_record(w, R3.READINESS, r.readiness_key, 'goal_argument_sha256', '0' * 64)
        return w, r.latch_and_reserve
    add('c3/readiness_goal_argument', c3_readiness_goal_argument,
        'C3/latch_and_reserve/readiness_goal_argument', R3_SITE + '652')

    def c3_latch_no_fence():
        w, r = C3C.until(suite, 'latch_and_reserve')
        w.storage.fence = AS.Fence(O.uid('TEST_ONLY:other-op'), w.storage.boot_session)
        return w, r.latch_and_reserve
    add('c3/latch_no_fence', c3_latch_no_fence, 'C3/latch_and_reserve/no_fence', R3_SITE + '656')

    def c3_coherent_progress(w, r):
        cells = w.storage.cells['goal_cancel_progress']
        cells[r.progress_key(r.progress['progress_epoch'])]['value'] = r.wrap('StorageProgress', r.progress)
        cells[r.key('goal_cancel_progress') + ':head']['value'] = r.wrap(
            'StorageProgress', r._head(r.progress['progress_epoch'], r.progress))

    def c3_reseal_readiness(w, r):
        """Recompute the readiness goal-argument over the edited state (both copies)."""
        before = r.before_stop_entry('latch_and_reserve')
        sha = r.h_arg(before)
        r.readiness = dict(r.readiness, goal_argument_sha256=sha)
        edit_record(w, R3.READINESS, r.readiness_key, 'goal_argument_sha256', sha)

    def c3_original_stop():
        w, r = C3C.until(suite, 'latch_and_reserve')
        edit_record(w, w.host_stop.FAMILY, w.host_stop.key(r.scope), 'last_original_stop_receipt_ref', 'x')
        c3_reseal_readiness(w, r)
        return w, r.latch_and_reserve
    add('c3/original_stop', c3_original_stop, 'C3/latch_and_reserve/original_stop', R3_SITE + '659')

    def c3_original_control():
        w, r = C3C.until(suite, 'latch_and_reserve')
        edit_record(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], 'latest_revision_hash', '0' * 64)
        c3_reseal_readiness(w, r)
        return w, r.latch_and_reserve
    add('c3/original_control', c3_original_control, 'C3/latch_and_reserve/original_control', R3_SITE + '662')

    # C3 number rows (mirror the C1 ceiling constructions)
    def c3_reseal_source(w, r, field, value):
        """Edit one captured-source commitment field and reseal source+progress custody."""
        key = r.key('goal_cancel_source_audit')
        cell = w.storage.cells['goal_cancel_source_audit'][key]
        new = copy.deepcopy(cell['value'])
        new['record'][field] = value
        cell['value'] = new
        r.source = copy.deepcopy(new['record'])
        r.progress = copy.deepcopy(r.progress)
        r.progress['source_audit_sha256'] = O.row_sha(new)
        c3_coherent_progress(w, r)

    def c3_stop_max(field, where):
        def make():
            w, r = c3_manual()
            edit_record(w, w.host_stop.FAMILY, w.host_stop.key(r.scope), field, MAX_U64)
            r.dispatch(r.user_request())
            r.capture_source()
            r.prepare()
            return w, r.latch_and_reserve
        return make

    def c3_stop_epoch_max():
        # Editing before capture makes expected_producer refuse at prepare (C4A row);
        # edit after prepare and reseal the source stop sha + readiness argument instead.
        w, r = C3C.until(suite, 'latch_and_reserve')
        edit_record(w, w.host_stop.FAMILY, w.host_stop.key(r.scope), 'user_stop_epoch', MAX_U64)
        stop_value = w.storage.cells[w.host_stop.FAMILY][w.host_stop.key(r.scope)]['value']
        c3_reseal_source(w, r, 'original_stop_control_sha256', O.row_sha(stop_value))
        c3_reseal_readiness(w, r)
        return w, r.latch_and_reserve
    add('number/c3_stop_epoch_max', c3_stop_epoch_max,
        'C3/stop_epoch/numrule/integer_range', 'dg5/C3/stop_epoch/number')
    add('number/c3_continuation_epoch_max', c3_stop_max('continuation_epoch', None),
        'C3/continuation_epoch/numrule/integer_range', 'dg5/C3/continuation_epoch/number')

    def c3_progress_max():
        w, r = C3C.until(suite, 'latch_and_reserve')
        old = r.progress_key(r.progress['progress_epoch'])
        r.progress = copy.deepcopy(r.progress)
        r.progress['progress_epoch'] = MAX_U64
        cells = w.storage.cells['goal_cancel_progress']
        cells[r.progress_key(MAX_U64)] = copy.deepcopy(cells[old])
        c3_coherent_progress(w, r)
        c3_reseal_readiness(w, r)
        return w, r.latch_and_reserve
    add('number/c3_progress_epoch_max', c3_progress_max,
        'C3/progress_epoch/numrule/integer_range', 'dg5/C3/progress_epoch/number')

    # dg5/C3/control_epoch/number: no case. A control at the uint64 ceiling cannot be
    # carried through before_stop_entry at latch - its numeric inventory derives
    # control_epoch+1/+2 domains and the argument canonical refuses out-of-physical-range
    # (witnessed in smoke: C3/argument/numrule/physical_integer_range) before the latch
    # increment; at publish the native selector sha refuses earlier. Proof in proofs_ca.

    # ---- batch 10 (helper C): C3 settle/freeze/append/publish/terminal/retained ----
    def c3_commit_custody():
        w, r = C3C.until(suite, 'commit_receipt')
        r.progress = copy.deepcopy(r.progress)
        r.progress['stop_receipt']['original_host_transaction_ref'] = O.uid('TEST_ONLY:host-stop-transaction')
        c3_coherent_progress(w, r)
        return w, r.commit_receipt
    add('c3/commit_stop_receipt_custody', c3_commit_custody, 'C3/commit_receipt/stop_receipt_custody', R3_SITE + '742')

    def genuine_pending(w):
        """A schema-valid body pending record from a genuine reservation on a second goal."""
        r2 = C1.NoAssociationCancel(w, state='active')
        w.goal.reserve_pending(r2.scope, w.host_stop.record(r2.scope)['user_stop_epoch'])
        return copy.deepcopy(w.goal.control(r2.scope)['value']['record']['pending'])

    def c3_commit_pending():
        w, r = C3C.until(suite, 'commit_receipt')
        edit_record(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], 'pending', genuine_pending(w))
        return w, r.commit_receipt
    add('c3/commit_pending_unresolved', c3_commit_pending, 'C3/commit_receipt/pending_unresolved', R3_SITE + '746')

    def c3_settle_receipt_custody():
        w, r = C3C.until(suite, 'settle_owner')
        r.progress = copy.deepcopy(r.progress)
        r.progress['cancellation_receipt'] = dict(
            r.progress['cancellation_receipt'],
            stop_receipt_ref=O.uid('TEST_ONLY:host-stop-receipt'))
        c3_coherent_progress(w, r)
        return w, r.settle_owner
    add('c3/settle_receipt_custody', c3_settle_receipt_custody, 'C3/settle_owner/receipt_custody', R3_SITE + '850')

    def c3_settle_pending():
        # Pending introduced before the native run via a genuine transaction, so the
        # D05/D06 disposition selectors verify as retained committed versions.
        w, r = C3C.until(suite, 'native')
        pend = genuine_pending(w)
        key = w.goal.keys(r.scope)['control']
        cell = w.goal.control(r.scope)
        new = copy.deepcopy(cell['value'])
        new['record']['pending'] = pend
        w.write([w.put(w.goal.CONTROL, key, new, expected=cell['version'])])
        r.run_native()
        return w, r.settle_owner
    add('c3/settle_pending_unresolved', c3_settle_pending, 'C3/settle_owner/pending_unresolved', R3_SITE + '866')

    def c3_proof_absent():
        w, r = C3C.until(suite, 'settle_owner')
        key = r.key(R3.SCOPE_PROOF)
        w.write([w.put(R3.SCOPE_PROOF, key, dict(schema_id='pm.test_only.preexisting_proof.v1', record={}))])
        return w, r.settle_owner
    add('c3/proof_absent', c3_proof_absent, 'C3/settle_owner/proof_absent', R3_SITE + '891')

    def c3_freeze_occurrence():
        w, r = C3C.until(suite, 'freeze_event')
        r.progress = copy.deepcopy(r.progress)
        r.progress['cancellation_receipt'] = dict(r.progress['cancellation_receipt'],
                                                  accepted_at='1999-01-01T00:00:00.000Z')
        c3_coherent_progress(w, r)
        return w, r.freeze_event
    add('c3/freeze_accepted_occurrence', c3_freeze_occurrence, 'C3/freeze_event/accepted_occurrence', R3_SITE + '918')

    def c3_append_fence():
        w, r = C3C.until(suite, 'append_original')
        w.storage.fence = None
        return w, r.append_original
    add('c3/append_fence', c3_append_fence, 'C3/append_original/fence', R3_SITE + '1101')

    def c3_append_fence_final():
        w, r = C3C.until(suite, 'append_original')
        r.inject[('append_original', 'final')] = lambda route: setattr(
            route.world.storage, 'fence', fence_clone(route.world, route))
        return w, r.append_original
    add('c3/append_fence_final', c3_append_fence_final, 'C3/append_original/fence_final', R3_SITE + '1118')

    def c3_audit_fence():
        w, r = C3C.until(suite, 'append_original')
        for cellmap in (w.storage.cells[R3.LATE_AUDIT],):
            cell = cellmap[r.late_audit_key]
            new = copy.deepcopy(cell['value'])
            new['record']['actual_late_reservation']['original_exclusive_fence_id'] = O.uid('TEST_ONLY:foreign-fence')
            cell['value'] = new
            r.late_audit = copy.deepcopy(new['record'])
        return w, r.append_original
    add('c3/append_audit_fence', c3_audit_fence, 'C3/append_original/audit_fence', R3_SITE + '1104')

    def c3_audit_goal_argument():
        w, r = C3C.until(suite, 'append_original')
        cell = w.storage.cells[R3.LATE_AUDIT][r.late_audit_key]
        new = copy.deepcopy(cell['value'])
        new['record']['complete_goal_argument_sha256'] = '0' * 64
        cell['value'] = new
        r.late_audit = copy.deepcopy(new['record'])
        return w, r.append_original
    add('c3/append_audit_goal_argument', c3_audit_goal_argument, 'C3/append_original/audit_goal_argument', R3_SITE + '1106')

    def c3_audit_producer():
        w, r = C3C.until(suite, 'append_original')
        cell = w.storage.cells[R3.LATE_AUDIT][r.late_audit_key]
        new = copy.deepcopy(cell['value'])
        new['record']['producer_semantic_digest'] = '0' * 64
        cell['value'] = new
        r.late_audit = copy.deepcopy(new['record'])
        return w, r.append_original
    add('c3/append_audit_producer', c3_audit_producer, 'C3/append_original/audit_producer', R3_SITE + '1114')

    def c3_resolve_producer():
        w, r = C3C.until(suite, 'append_original')
        r.append_original(lose_ack=True)
        r.progress = copy.deepcopy(r.progress)
        r.progress['producer_input'] = dict(r.progress['producer_input'],
                                            correlation_id=O.uid('TEST_ONLY:correlation'))
        c3_coherent_progress(w, r)
        w.index.publish()   # pre-create every index row so the resolve-time publish rewrites only marked keys

        def act():
            for table in ('event_record_index', 'event_record_index_checkpoint'):
                for key in list(w.storage.cells.get(table, {})):
                    DGO.mark(w, table, key)
            return r.resolve_original()
        return w, act
    add('c3/resolve_stored_producer', c3_resolve_producer, 'C3/resolve_original/stored_producer', R3_SITE + '1159')

    def c3_publish_publication():
        w, r = C3C.until(suite, 'publish_control')
        r.progress = copy.deepcopy(r.progress)
        pub = copy.deepcopy(r.progress['publication'])
        pub['original_append_result'] = dict(pub['original_append_result'],
                                             sequence_id=pub['original_append_result']['sequence_id'] + 1)
        r.progress['publication'] = pub
        c3_coherent_progress(w, r)
        return w, r.publish_control
    add('c3/publish_original_publication', c3_publish_publication,
        'C3/publish_control/original_publication', R3_SITE + '1181')

    def c3_publish_reservation():
        w, r = C3C.until(suite, 'publish_control')
        r.progress = copy.deepcopy(r.progress)
        r.progress['reservation_sha256'] = '0' * 64
        c3_coherent_progress(w, r)
        return w, r.publish_control
    add('c3/publish_reservation', c3_publish_reservation, 'C3/publish_control/reservation', R3_SITE + '1187')

    # C3/publish_control/pending_unresolved (:1189): no case - pending at publish
    # entails pending at settle (proof in pm_goal_dg5_proofs_ca.py).

    def c3_terminal_control():
        w, r = C3C.until(suite, 'terminal_succeeded')
        edit_record(w, w.goal.CONTROL, w.goal.keys(r.scope)['control'], 'cancellation_receipt_ref', None)
        return w, r.terminal_succeeded
    add('c3/terminal_control_published', c3_terminal_control,
        'C3/terminal_succeeded/control_published', R3_SITE + '1265')

    def c3_unsettled_issued():
        w, r = C3C.until(suite, 'terminal_succeeded')
        r.terminal_succeeded()
        return w, lambda: r.terminal_unsettled('unknown')
    add('c3/unsettled_already_issued', c3_unsettled_issued,
        'C3/terminal_unsettled/already_issued', R3_SITE + '1295')

    def c3_no_effect_stop():
        w, r = C3C.wf(suite)
        r.capture_source()
        w.host_stop.manual(r.scope, 'stop')
        w.permissions.revoke(r.cancel_decision)
        return w, lambda: r.terminal_unsettled('no_effect')
    add('c3/no_effect_stop_unchanged', c3_no_effect_stop,
        'C3/terminal_unsettled/no_effect_stop_unchanged', R3_SITE + '1300')

    def c3_replay_operation():
        w, r = C3C.until(suite, 'terminal_succeeded')
        r.terminal_succeeded()
        req = r.user_request()

        def act():
            DGO.mark(w, w.sir.ACCEPTED, req['command_instance_id'])
            DGO.mark(w, w.sir.OUTCOME, req['command_instance_id'])
            return r.replay(req)
        return w, act
    add('c3/replay_operation', c3_replay_operation, 'C3/replay/operation', R3_SITE + '1344')

    def c3_replay_terminal():
        w, r = C3C.until(suite, 'terminal_succeeded')
        r.terminal_succeeded()
        edit_record(w, 'goal_cancel_terminal_audit', r.key('goal_cancel_terminal_audit'), 'kind', 'unknown')
        return w, lambda: r.replay(copy.deepcopy(r.request))
    add('c3/replay_original_terminal', c3_replay_terminal, 'C3/replay/original_terminal', R3_SITE + '1347')

    def c3_retained_kind():
        w, r = C3C.until(suite, 'terminal_succeeded')
        r.terminal_succeeded()
        edit_record(w, 'goal_cancel_terminal_audit', r.key('goal_cancel_terminal_audit'), 'kind', 'unknown')
        return w, r.read_retained_success
    add('c3/retained_succeeded', c3_retained_kind, 'C3/read_retained_success/succeeded', R3_SITE + '1358')

    def c3_retained_origin():
        w, r = C3C.until(suite, 'terminal_succeeded')
        r.terminal_succeeded()
        # Chain-edit: proof's d06_origin selector sha, resealed through settlement
        # (selected progress) and the terminal progress sha so earlier joins pass.
        pkey = r.key(R3.SCOPE_PROOF)
        pcell = w.storage.cells[R3.SCOPE_PROOF][pkey]
        newp = copy.deepcopy(pcell['value'])
        newp['record']['d06_origin'] = dict(newp['record']['d06_origin'], complete_value_sha256='0' * 64)
        pcell['value'] = newp
        prog_key = r.progress_key(r.progress['progress_epoch'])
        pcell2 = w.storage.cells['goal_cancel_progress'][prog_key]
        newprog = copy.deepcopy(pcell2['value'])
        newprog['record']['owner_settlement'] = dict(newprog['record']['owner_settlement'],
                                                     original_scope_proof_sha256=O.row_sha(newp))
        pcell2['value'] = newprog
        r.progress = copy.deepcopy(newprog['record'])
        tkey = r.key('goal_cancel_terminal_audit')
        tcell = w.storage.cells['goal_cancel_terminal_audit'][tkey]
        newt = copy.deepcopy(tcell['value'])
        newt['record']['terminal_progress_sha256'] = O.row_sha(newprog)
        tcell['value'] = newt
        return w, r.read_retained_success
    add('c3/retained_d06_origin', c3_retained_origin, 'C3/read_retained_success/d06_origin', R3_SITE + '1374')

    def c3_retained_selected():
        w, r = C3C.wf(suite)
        r.capture_source()
        w.permissions.revoke(r.cancel_decision)
        r.terminal_unsettled('no_effect')
        edit_record(w, 'goal_cancel_progress', r.progress_key(r.progress['progress_epoch']), 'phase', 'tampered')
        return w, r.read_retained_unsettled
    add('c3/retained_selected_progress', c3_retained_selected,
        'C3/read_retained_unsettled/selected_progress', R3_SITE + '1390')

    # index direct-entry cases (EventIndexOwner entries registered by _ca install)
    def ix_case(name, setup, act, expected, target):
        def make():
            w, r = C3C.until(suite, 'terminal_succeeded')
            r.terminal_succeeded()
            setup(w, r)
            return w, lambda: act(w, r)
        add(name, make, expected, target)

    def ix_checkpoint():
        w = suite.world()
        import pm_goal_dg_ca3_index as IX
        ix = IX.EventIndexOwner(w)
        return w, ix.current
    add('c3/index_checkpoint_unavailable', ix_checkpoint, 'index/checkpoint_unavailable', IX_SITE + '177')

    def ix_no_generation(w, r):
        cell = w.storage.cells['event_record_index_checkpoint'][w.index.checkpoint_key()]
        cell['value'] = dict(cell['value'], current_generation_id='eig_bogus')
    ix_case('c3/index_no_current_generation', ix_no_generation,
            lambda w, r: w.index.current(), 'index/no_current_generation', IX_SITE + '180')

    def ix_anchor(w, r):
        key = w.index.checkpoint_key()
        cell = w.storage.cells['event_record_index_checkpoint'][key]
        new = copy.deepcopy(cell['value'])
        gid = new['current_generation_id']
        new['generations'][gid]['anchor']['storage_instance_id'] = 'bogus'
        cell['value'] = new
    ix_case('c3/index_generation_anchor', ix_anchor,
            lambda w, r: w.index.current(), 'index/generation_anchor', IX_SITE + '182')
    ix_case('c3/index_event_unavailable', lambda w, r: None,
            lambda w, r: w.index.row('no-such-event'), 'index/event_unavailable', IX_SITE + '205')
    ix_case('c3/index_frame_event_unavailable', lambda w, r: None,
            lambda w, r: w.index.source_frame('no-such-event'), 'index/event_unavailable', IX_SITE + '214')

    def ix_row_drop(w, r):
        eid = r.progress['publication']['event_id']
        gen = w.index.current()[1]['generation_id']
        info = w.storage.events[eid]
        drop(w, 'event_record_index', w.index.row_key(gen, info['sequence_id']))
    ix_case('c3/index_row_unavailable', ix_row_drop,
            lambda w, r: w.index.row(r.progress['publication']['event_id']),
            'index/row_unavailable', IX_SITE + '207')

    def ix_row_rewritten(w, r):
        gen = w.index.current()[1]['generation_id']
        eid = r.progress['publication']['event_id']
        info = w.storage.events[eid]
        key = w.index.row_key(gen, info['sequence_id'])
        cell = w.storage.cells['event_record_index'][key]
        new = copy.deepcopy(cell['value'])
        new['event_type'] = 'bogus.event'
        cell['value'] = new
    ix_case('c3/index_row_rewritten', ix_row_rewritten,
            lambda w, r: w.index.publish(), 'index/row_rewritten', IX_SITE + '166')

    # ---- batch 11 (helper C): native D05/D06/run/start/writers sites ----
    def tx_edit(w, table, key, fn):
        """Edit one stored cell through a genuine transaction (committed-version clean)."""
        cell = w.storage.cells[table][key]
        new = copy.deepcopy(cell['value'])
        fn(new)
        w.write([w.put(table, key, new, expected=cell['version'])])
        return new

    def native_case(name, setup, expected, target, action='settle_owner', until_step='settle_owner'):
        def make():
            w, r = C3C.until(suite, until_step)
            setup(w, r)
            return w, getattr(r, action)
        add(name, make, expected, target)

    def d06_cell(field_table):
        def setup(w, r):
            table, key_attr, fn = field_table(w, r)
            tx_edit(w, table, key_attr, fn)
        return setup

    native_case('c3n/d06_control_result',
                lambda w, r: tx_edit(w, w.native.d06.CONTROL, r.wf_run['d06']['control_key'],
                                     lambda v: v['record']['result'].update(physical_value_sha256='0' * 64)),
                'd06/control_result', N3_SITE + '1069')
    native_case('c3n/d06_control_intent',
                lambda w, r: tx_edit(w, w.native.d06.CONTROL, r.wf_run['d06']['control_key'],
                                     lambda v: v['record']['intent'].update(physical_value_sha256='0' * 64)),
                'd06/control_intent', N3_SITE + '1071')
    native_case('c3n/d06_custody_unavailable',
                lambda w, r: drop(w, w.native.d06.INTENT, r.wf_run['d06']['intent_key']),
                'd06/custody_unavailable', N3_SITE + '1068')
    native_case('c3n/d06_not_published',
                lambda w, r: r.wf_run['d06'].update(phase='prepared'),
                'd06/not_published', N3_SITE + '1062')
    native_case('c3n/d05_origin_join',
                lambda w, r: tx_edit(w, w.native.d05.ORIGIN, r.wf_run['d05']['origin_key'],
                                     lambda v: v['value']['issued_records'][0].update(physical_sha256='0' * 64)
                                     if 'value' in v else v['issued_records'][0].update(physical_sha256='0' * 64)),
                'd05/origin_join', N3_SITE + '874')
    native_case('c3n/d05_not_aggregated',
                lambda w, r: r.wf_run.pop('d05'),
                'd05/not_aggregated', N3_SITE + '869')
    native_case('c3n/d05_unresolved',
                lambda w, r: r.wf_run['d05'].update(resolved=False, codes=[]),
                'd05/unresolved', N3_SITE + '870')
    native_case('c3n/d05_result_unavailable',
                lambda w, r: drop(w, w.native.d05.RESULT, r.wf_run['d05']['result_key']),
                'd05/result_unavailable', N3_SITE + '873')

    def d05_stop_case(name, setup, expected, target):
        def make():
            w, r = C3C.until(suite, 'settle_owner')
            setup(w, r)
            return w, r.settle_owner
        add(name, make, expected, target)

    def stop_tx(w, r, fn):
        key = w.host_stop.key(r.scope)
        cell = w.storage.cells[w.host_stop.FAMILY][key]
        new = copy.deepcopy(cell['value'])
        fn(new['record'])
        w.write([w.put(w.host_stop.FAMILY, key, new, expected=cell['version'])])

    d05_stop_case('c3n/d05_goal_stop_not_latched',
                  lambda w, r: w.host_stop.manual(r.scope, 'resume'),
                  'd05/goal_stop_not_latched', N3_SITE + '756')
    d05_stop_case('c3n/d05_goal_stop_receipt',
                  lambda w, r: stop_tx(w, r, lambda rec: rec.update(last_original_stop_receipt_sha256='0' * 64)),
                  'd05/goal_stop_receipt', N3_SITE + '759')
    d05_stop_case('c3n/d05_goal_stop_progress',
                  lambda w, r: tx_edit(w, 'goal_cancel_progress',
                                       'goal_cancel_progress:' + __import__('pm_goal_own_c_source_oracles').scoped_key(r.scope)
                                       + ':' + r.operation_id.encode().hex() + ':epoch:1',
                                       lambda v: v['record']['stop_receipt'].update(
                                           original_host_transaction_ref=O.uid('TEST_ONLY:host-stop-transaction'))),
                  'd05/goal_stop_progress', N3_SITE + '764')

    def run_current_case(name, setup, expected, target):
        def make():
            w, r = C3C.until(suite, 'settle_owner')
            setup(w, r)
            return w, r.settle_owner
        add(name, make, expected, target)

    def pointer(w, r):
        return w.value(w.native.run.POINTER, 'run:' + __import__('pm_goal_dg_ca3_native').k_hex(r.wf_run['run_scope']['goal_run_id']))

    run_current_case('c3n/run_pointer_unavailable',
                     lambda w, r: drop(w, w.native.run.POINTER,
                                        'run:' + __import__('pm_goal_dg_ca3_native').k_hex(r.wf_run['run_scope']['goal_run_id'])),
                     'run/pointer_unavailable', N3_SITE + '537')
    run_current_case('c3n/run_body_unavailable',
                     lambda w, r: drop(w, w.native.run.BODY, pointer(w, r)['body_key']),
                     'run/body_unavailable', N3_SITE + '540')
    run_current_case('c3n/run_body_join',
                     lambda w, r: tx_edit(w, w.native.run.BODY, pointer(w, r)['body_key'],
                                          lambda v: v['record'].update(status='paused' if v['record']['status'] != 'paused' else 'running')),
                     'run/body_join', N3_SITE + '541')

    def run_owner_epoch(w, r):
        p = pointer(w, r)
        tx_edit(w, w.native.run.BODY, p['body_key'],
                lambda v: v['record'].update(execution_owner_epoch=v['record']['execution_owner_epoch'] + 1))
        body = w.value(w.native.run.BODY, p['body_key'])
        tx_edit(w, w.native.run.CONTROL, p['control_key'],
                lambda v: v['record'].update(body_record_sha256=__import__('pm_goal_dg_ca3_native').record_sha(body['record'])))
    run_current_case('c3n/run_owner_epoch', run_owner_epoch, 'run/owner_epoch', N3_SITE + '543')

    # ---- batch 11b: writers / start / effects / d05-d06 remainder / route joins ----
    def writers_case(name, setup, expected, target, action='capture_source'):
        def make():
            w, r = C3C.wf(suite)
            setup(w, r)
            return w, getattr(r, action)
        add(name, make, expected, target)

    writers_case('c3n/writers_inventory_unavailable',
                 lambda w, r: drop(w, 'TEST_ONLY:native_writer_inventory', w.native.writers.inventory_key),
                 'writers/inventory_unavailable', N3_SITE + '380')
    writers_case('c3n/writers_registration_unavailable',
                 lambda w, r: drop(w, 'TEST_ONLY:native_writer_registration',
                                   w.native.writers.inventory_key and
                                   w.value('TEST_ONLY:native_writer_inventory', w.native.writers.inventory_key)['writers'][0]['key']),
                 'writers/registration_unavailable', N3_SITE + '384')

    def birth_edit(w, r, fn):
        key = r.wf_run['birth_key']

        def apply(new):
            fn(new['value'])   # birth cell is dict(value=<DomainBirth root>)
        tx_edit(w, 'executor_safestop_domain_birth', key, apply)

    writers_case('c3/writer_domain',
                 lambda w, r: birth_edit(w, r, lambda v: v.update(registered_writers=[
                     x for x in v['registered_writers'] if x['component_kind'] != 'goal_stop'])),
                 'C3/capture_source/native_writer_domain', R3_SITE + '312')
    def writer_principal():
        w, r = C3C.wf(suite)
        wr = w.native.writers
        rkey = 'TEST_ONLY:native_writer_registration:' + wr.registrations['goal_stop']['writer_id']
        new = tx_edit(w, 'TEST_ONLY:native_writer_registration', rkey,
                      lambda v: v['registration']['principal'].update(native_root_ref='bogus'))

        def fix_inventory(v):
            for row in v['writers']:
                if row['key'] == rkey:
                    row['sha256'] = O.row_sha(new)
        tx_edit(w, 'TEST_ONLY:native_writer_inventory', wr.inventory_key, fix_inventory)
        birth_edit(w, r, lambda v: [x['principal'].update(native_root_ref='bogus')
                                     for x in v['registered_writers'] if x['component_kind'] == 'goal_stop'])
        return w, r.capture_source
    add('c3/writer_principal', writer_principal, 'C3/capture_source/native_writer_principal', R3_SITE + '313')
    writers_case('c3/domain_allocation',
                 lambda w, r: birth_edit(w, r, lambda v: v.update(reservation_allocation='bogus')),
                 'C3/capture_source/native_domain_allocation', R3_SITE + '315')
    writers_case('c3/native_run_scope',
                 lambda w, r: birth_edit(w, r, lambda v: v.update(scope=dict(v['scope'], goal_id=O.short_id('goal')))),
                 'C3/capture_source/native_run_scope', R3_SITE + '316')
    def control_plane_writer():
        w, r = C3C.until(suite, 'commit_receipt')
        w.native.writers.disable('goal_stop')
        return w, r.commit_receipt
    add('c3/control_plane_writer', control_plane_writer, 'C3/commit_receipt/control_plane_writer', R3_SITE + '327')

    def start_case(name, setup, expected, target):
        def make():
            w, r = C3C.wf(suite)
            setup(w, r)
            return w, r.capture_source
        add(name, make, expected, target)

    start_case('c3n/start_not_started', lambda w, r: r.wf_run.pop('start'),
               'start/not_started', N3_SITE + '596')
    start_case('c3n/start_custody_unavailable',
               lambda w, r: drop(w, 'workflow_start_commit', r.wf_run['start']['commit_key']),
               'start/custody_unavailable', N3_SITE + '600')
    start_case('c3n/start_first_custody',
               lambda w, r: w.storage.custody[r.wf_run['start']['event_id']]['first_append_receipt'].update(sequence_id=999999),
               'start/first_custody', N3_SITE + '602')

    def effects_case(name, setup, expected, target):
        def make():
            w, r = C3C.until(suite, 'native')
            setup(w, r)
            return w, r.run_native
        add(name, make, expected, target)

    # effects inventory/member unavailable (:738/:741): no case - drain reads the same
    # members/cells immediately before inventory() in one run_native call (proofs_ca).
    def scheduler_not_latched():
        w, r = C3C.wf(suite)
        r.capture_source()
        r.prepare()
        return w, r.run_native
    add('c3n/scheduler_goal_not_latched', scheduler_not_latched, 'scheduler_stop/goal_not_latched', N3_SITE + '628')

    def d05_intent_source(name, which, expected, target):
        def make():
            w, r = C3C.until(suite, 'settle_owner')
            if which == 'intent':
                key = 'goal_cancel_progress:' + __import__('pm_goal_own_c_source_oracles').scoped_key(r.scope) \
                    + ':' + r.operation_id.encode().hex() + ':epoch:1'
                tx_edit(w, 'goal_cancel_progress', key,
                        lambda v: v['record']['stop_intent'].update(expected_revision=v['record']['stop_intent']['expected_revision'] + 1))
            else:
                key = 'goal_cancel_source_audit:' + __import__('pm_goal_own_c_source_oracles').scoped_key(r.scope) \
                    + ':' + r.operation_id.encode().hex()
                tx_edit(w, 'goal_cancel_source_audit', key,
                        lambda v: v['record'].update(captured_at='1999-01-01T00:00:00.000Z'))
            return w, r.settle_owner
        add(name, make, expected, target)
    d05_intent_source('c3n/d05_goal_stop_intent', 'intent',
                      'd05/goal_stop_intent', N3_SITE + '766')

    def d05_source_audit():
        w, r = C3C.until(suite, 'settle_owner')
        c3_reseal_source(w, r, 'captured_at', '1999-01-01T00:00:00.000Z')
        return w, r.settle_owner
    add('c3n/d05_goal_source_audit', d05_source_audit, 'd05/goal_source_audit', N3_SITE + '768')

    def d05_stop_changed(w, r):
        # Copy the genuine receipt to a new key and point the stop record at it (transacted).
        d = r.wf_run['d05']
        old = copy.deepcopy(w.value('goal_cancel_stop_receipt', d['stop_receipt_key']))
        new_key = d['stop_receipt_key'] + ':copy'
        w.write([w.put('goal_cancel_stop_receipt', new_key, old)])
        stop_tx(w, r, lambda rec: rec.update(last_original_stop_receipt_ref=new_key))
    d05_stop_case('c3n/d05_goal_stop_changed', d05_stop_changed,
                  'd05/goal_stop_changed', N3_SITE + '878')

    def d06_retained_not_published():
        w, r = C3C.until(suite, 'terminal_succeeded')
        r.terminal_succeeded()
        r.wf_run['d06'].update(phase='prepared')
        return w, r.read_retained_success
    add('c3n/d06_retained_not_published', d06_retained_not_published, 'd06/not_published', N3_SITE + '1105')
    def d06_retained_unavailable():
        w, r = C3C.until(suite, 'terminal_succeeded')
        r.terminal_succeeded()
        drop(w, w.native.d06.RESULT, r.wf_run['d06']['result_key'])
        return w, r.read_retained_success
    add('c3n/d06_retained_unavailable', d06_retained_unavailable, 'd06/retained_unavailable', N3_SITE + '1108')

    # route joins in owners_native (settle action; tamper one stored record each)
    def join_case(name, setup, expected, target):
        def make():
            w, r = C3C.until(suite, 'settle_owner')
            setup(w, r)
            return w, r.settle_owner
        add(name, make, expected, target)

    # d06 scope/operation/result-custody and d05 scope joins: proofs in proofs_ca
    # (any result-cell tamper breaks the readback control sha at native :1069 first).
    def d06_owner():
        w, r = C3C.until(suite, 'settle_owner')
        foreign = O.uid('TEST_ONLY:foreign-owner')
        new = tx_edit(w, w.native.d06.INTENT, r.wf_run['d06']['intent_key'],
                      lambda v: v['record'].update(workflow_owner_ref=foreign))
        tx_edit(w, w.native.d06.CONTROL, r.wf_run['d06']['control_key'],
                lambda v: v['record']['intent'].update(physical_value_sha256=O.row_sha(new)))
        return w, r.settle_owner
    add('c3/d06_owner', d06_owner, 'C3/settle_owner/d06_owner', R3_SITE + '795')

    # ---- batch 11b: writers/start/effects/route joins/index readback ----
    writers_case('c3/writer_inventory_missing',
                 lambda w, r: w.native.writers.disable('goal_stop'),
                 'C3/capture_source/native_writer_inventory', R3_SITE + '306')

    def start_scope_tamper(w, r, **scope_changes):
        st = r.wf_run['start']
        new = tx_edit(w, 'workflow_start_commit', st['commit_key'],
                      lambda v: v['record']['scope'].update(scope_changes))
        tx_edit(w, 'workflow_start_origin', st['origin_key'],
                lambda v: v['record']['commit'].update(physical_value_sha256=O.row_sha(new)))

    def start_current_run():
        w, r = C3C.wf(suite)
        start_scope_tamper(w, r, goal_run_id=O.short_id('run'))
        return w, r.capture_source
    add('c3/native_run_scope', start_current_run, 'C3/capture_source/native_run_scope', R3_SITE + '316')
    # current_start_run (:406): proof in proofs_ca (entailed by :351 + :316).

    def ack_readback_drop():
        w, r = C3C.until(suite, 'prepare')
        drop(w, w.sir.OUTCOME, r.request['command_instance_id'])
        return w, r.prepare
    add('c3/acknowledgement_readback', ack_readback_drop, 'C3/prepare/acknowledgement_readback', R3_SITE + '585')

    # d06_origin_publish (:802): proof in proofs_ca (issuer is a schema const and the
    # afterimage result selector is custody-bound; tampering is refused earlier).

    def d05_current_resolved():
        w, r = C3C.until(suite, 'settle_owner')
        key = w.native.effects.members[r.wf_run['run_scope']['goal_run_id']]['invocations'][0]
        tx_edit(w, w.native.effects.INV, key, lambda v: v.update(status='failed'))
        return w, r.settle_owner
    add('c3n/d05_current_resolved', d05_current_resolved, 'd05/effect_failed', N3_SITE + '876')

    def d06_cancelled_body():
        w, r = C3C.until(suite, 'settle_owner')
        p = pointer(w, r)
        tx_edit(w, w.native.run.BODY, p['body_key'],
                lambda v: v['record'].update(status='running'))
        body = w.value(w.native.run.BODY, p['body_key'])
        tx_edit(w, w.native.run.CONTROL, p['control_key'],
                lambda v: v['record'].update(body_record_sha256=__import__('pm_goal_dg_ca3_native').record_sha(body['record'])))
        return w, r.settle_owner
    add('c3/d06_cancelled_body', d06_cancelled_body, 'C3/settle_owner/d06_cancelled_body', R3_SITE + '819')

    def d06_preserved():
        w, r = C3C.until(suite, 'settle_owner', run_status='failed')
        p = pointer(w, r)
        tx_edit(w, w.native.run.BODY, p['body_key'],
                lambda v: v['record'].update(status='running'))
        body = w.value(w.native.run.BODY, p['body_key'])
        tx_edit(w, w.native.run.CONTROL, p['control_key'],
                lambda v: v['record'].update(body_record_sha256=__import__('pm_goal_dg_ca3_native').record_sha(body['record'])))
        return w, r.settle_owner
    add('c3/d06_preserved', d06_preserved, 'C3/settle_owner/d06_preserved', R3_SITE + '829')

    def current_start_scope():
        w, r = C3C.until(suite, 'settle_owner')
        start_scope_tamper(w, r, goal_id=O.short_id('goal'))
        return w, r.settle_owner
    add('c3/current_start', current_start_scope, 'C3/settle_owner/current_start', R3_SITE + '830')

    def append_source_drift():
        w, r = C3C.until(suite, 'append_original')
        w.storage.segments[-1]['watermark'] += 1
        return w, r.append_original
    add('c3/append_source_drift', append_source_drift, 'C3/append_original/append_source_drift', R3_SITE + '986')

    def append_lease():
        w, r = C3C.until(suite, 'append_original')
        lease = w.assigner.read_sources()['sequence_allocator']['current_lease']
        r.late_reservation = dict(r.late_reservation, reserved_sequence_id=lease['last_sequence_id'] + 1)
        return w, r.append_original
    add('c3/append_lease', append_lease, 'C3/append_original/append_lease', R3_SITE + '988')

    def index_row_event():
        w, r = C3C.until(suite, 'publish_control')
        gen = w.index.current()[1]['generation_id']
        eid = r.progress['publication']['event_id']
        info = w.storage.events[eid]
        key = w.index.row_key(gen, info['sequence_id'])
        tx_edit(w, 'event_record_index', key, lambda v: v.update(sequence_id=v['sequence_id'] + 1))
        return w, r.publish_control
    add('c3/index_row_event', index_row_event, 'C3/publish_control/index_row_event', R3_SITE + '1083')

    def index_coverage():
        w, r = C3C.until(suite, 'publish_control')
        key = w.index.checkpoint_key()
        cell = w.storage.cells['event_record_index_checkpoint'][key]
        new = copy.deepcopy(cell['value'])
        gid = new['current_generation_id']
        new['generations'][gid]['frontier']['coverage']['through_sequence_id'] = 0
        w.write([w.put('event_record_index_checkpoint', key, new, expected=cell['version'])])
        return w, r.publish_control
    add('c3/index_coverage', index_coverage, 'C3/publish_control/index_coverage', R3_SITE + '1088')

    def second_terminal_clock():
        w, r = C3C.until(suite, 'terminal_succeeded')
        last = w.sir.clock.last
        r.terminal_succeeded()
        w.sir.clock.last = last
        return w, r.terminal_succeeded
    add('c3/already_issued', second_terminal_clock, 'C3/terminal_succeeded/already_issued', R3_SITE + '1260')

    # ---- batch 12 (helper C): CB owner direct sites ----
    def cb_new(**goal_kw):
        suite.n += 1
        w = MB.migration_world(suite.work / ('cb%05d' % suite.n))
        return w, BO.legacy_goal(w, **goal_kw)

    def cb_case(name, setup, act, expected, target):
        def make():
            w, scope = cb_new()
            setup(w, scope)
            return w, lambda: act(w, scope)
        add(name, make, expected, target)

    def mark(w, table, key):
        w.injected.append((table, key))

    def cb_phys_edit(w, family, key, fn):
        cell = w.cell(family, key)
        codec, _raw = BO.physical(cell['value'])
        _rt, _exp, value = BO.decode_physical(cell['value'], 'cb/edit')
        fn(value)
        w.write([w.put(family, key, BO.store_form(value, codec), expected=cell['version'])])
        mark(w, family, key)

    def cb_absent_scope(w, scope):
        return dict(scope, goal_id=O.short_id('goal'), project_id=O.short_id('proj'), thread_id=O.short_id('thr'))

    for _role, _code, _site in (('goal', 'goal/database_unavailable', '663'),
                                ('host_stop', 'host_stop/database_unavailable', '776'),
                                ('plan', 'plan/database_unavailable', '977'),
                                ('scheduler', 'scheduler/database_unavailable', '1110'),
                                ('workflow', 'workflow/database_unavailable', '1378'),
                                ('sir', 'sir/database_unavailable', '1469')):
        def _avail(_r=_role):
            return lambda w, s: setattr(w.owner_for(_r), 'available', False)
        cb_case('cb/%s_database_unavailable' % _role, _avail(),
                lambda w, s: w.coordinator.capture(MB.selector(s)), _code, BO_SITE + _site)
    cb_case('cb/goal_body_unavailable',
            lambda w, s: drop(w, w.goal.BODY, w.goal.keys(s)['body']),
            lambda w, s: w.goal.body_cell(s), 'goal/body_unavailable', BO_SITE + '438')
    cb_case('cb/goal_codec_body_unavailable',
            lambda w, s: drop(w, w.goal.BODY, w.goal.keys(s)['body']),
            lambda w, s: w.goal.codec_of(s), 'goal/body_unavailable', BO_SITE + '425')
    cb_case('cb/goal_control_unavailable',
            lambda w, s: drop(w, w.goal.CONTROL, w.goal.keys(s)['control']),
            lambda w, s: w.goal.control(s), 'goal/control_unavailable', BO_SITE + '443')
    cb_case('cb/goal_history_unavailable',
            lambda w, s: drop(w, w.goal.REVISION, w.goal.keys(s, 1)['revision']),
            lambda w, s: w.goal.snapshot(s), 'goal/history_unavailable', BO_SITE + '461')
    cb_case('cb/goal_mutation_completed',
            lambda w, s: w.goal.mutate_state(s, 'completed'),
            lambda w, s: w.goal.mutate_state(s, 'paused'), 'goal/mutation_completed', BO_SITE + '531')
    cb_case('cb/host_manual_action', lambda w, s: None,
            lambda w, s: w.host_stop.manual(s, 'bogus'), 'host_stop/manual_action', BO_SITE + '731')
    cb_case('cb/host_already_latched', lambda w, s: w.host_stop.manual(s, 'stop'),
            lambda w, s: w.host_stop.manual(s, 'stop'), 'host_stop/already_latched', BO_SITE + '739')
    cb_case('cb/host_unavailable', lambda w, s: None,
            lambda w, s: w.host_stop.current(cb_absent_scope(w, s)), 'host_stop/unavailable', BO_SITE + '759')
    cb_case('cb/host_domain_unavailable', lambda w, s: None,
            lambda w, s: w.host_stop.read_for_binding_migration(MB.selector(cb_absent_scope(w, s))),
            'host_stop/domain_unavailable', BO_SITE + '778')
    cb_case('cb/inventory_unavailable', lambda w, s: setattr(w.goal, 'available', False),
            lambda w, s: w.goal.inventory(s), 'inventory/unavailable/goal_body', BO_SITE + '366')
    cb_case('cb/image_unavailable', lambda w, s: drop(w, w.goal.BODY, w.goal.keys(s)['body']),
            lambda w, s: w.goal.image(w.goal.BODY, w.goal.keys(s)['body']),
            'image/unavailable/goal_body_record', BO_SITE + '395')
    cb_case('cb/image_origin_unavailable',
            lambda w, s: drop(w, BO.ORIGINS,
                              BO.origin_key(w.goal.BODY, w.goal.keys(s)['body'],
                                            BO.sha(BO.physical(w.cell(w.goal.BODY, w.goal.keys(s)['body'])['value'])[1]))),
            lambda w, s: w.goal.image(w.goal.BODY, w.goal.keys(s)['body']),
            'image/origin_unavailable/goal_body_record', BO_SITE + '402')

    # ---- batch 12b: CB migration capture/commit/read_result/writers ----
    def cb_capture(name, setup, expected, target):
        def make():
            w, scope = cb_new()
            setup(w, scope)
            return w, lambda: w.coordinator.capture(MB.selector(scope))
        add(name, make, expected, target)

    def stmt(attr, defect):
        return lambda w, s: setattr(getattr(w, attr), 'statement_defect', defect)

    cb_capture('cb/mapping_role', stmt('goal', lambda m: dict(m, role='plan')),
               'M/capture/mapping_role/goal', MB_SITE + '325')
    cb_capture('cb/foreign_family',
               stmt('goal', lambda m: m['sources'][0]['selection'].update(
                   physical_key='sir_command_outcome|' + MB.split(m['sources'][0]['selection']['physical_key'])[1]) or m),
               'M/capture/foreign_family/goal', MB_SITE + '329')
    cb_capture('cb/image_owner',
               stmt('goal', lambda m: m['sources'][1]['selection'].update(owner='TEST_ONLY:substituted') or m),
               'M/capture/image_owner/goal', MB_SITE + '330')
    cb_capture('cb/source_absent',
               stmt('goal', lambda m: m['sources'][1]['selection'].update(
                   physical_key=m['sources'][1]['selection']['physical_key'] + ':absent') or m),
               'M/capture/source_absent/goal_body_control', MB_SITE + '332')
    cb_capture('cb/source_codec',
               stmt('goal', lambda m: m['sources'][1].update(codec_id=BO.MSGPACK) or m),
               'M/capture/source_codec/goal_body_control', MB_SITE + '335')
    cb_capture('cb/source_bytes',
               stmt('goal', lambda m: m['sources'][1].update(bytes_hex='00' + m['sources'][1]['bytes_hex'][2:]) or m),
               'M/capture/source_bytes/goal_body_control', MB_SITE + '336')
    cb_capture('cb/source_hash',
               stmt('goal', lambda m: m['sources'][1]['selection'].update(sha256=BO.sha(b'TEST_ONLY:other')) or m),
               'M/capture/source_hash/goal_body_control', MB_SITE + '337')
    cb_capture('cb/schema_ref',
               stmt('goal', lambda m: m['sources'][1]['selection'].update(schema_ref=BO.BODY + '#/$defs/storage_body') or m),
               'M/capture/schema_ref/goal_body_control', MB_SITE + '340')
    cb_capture('cb/origin_join',
               stmt('goal', lambda m: m['sources'][0]['origin'].update(physical_key=m['sources'][1]['origin']['physical_key']) or m),
               'M/capture/origin_join/goal_body_record', MB_SITE + '343')
    cb_capture('cb/origin_hash',
               stmt('goal', lambda m: m['sources'][1]['origin'].update(sha256=BO.sha(b'TEST_ONLY:other-origin')) or m),
               'M/capture/origin_hash/goal_body_control', MB_SITE + '346')
    cb_capture('cb/duplicate_image',
               stmt('goal', lambda m: dict(m, sources=m['sources'] + [copy.deepcopy(m['sources'][0])])),
               'M/capture/duplicate_image/goal_body_record', MB_SITE + '356')
    cb_capture('cb/inventory_incomplete',
               stmt('goal', lambda m: dict(m, sources=m['sources'][:-1])),
               'M/capture/inventory_incomplete/goal', MB_SITE + '362')
    cb_capture('cb/pending_mismatch',
               stmt('goal', lambda m: dict(m, pending_operations=['TEST_ONLY:bogus-op'])),
               'M/capture/pending_mismatch/goal', MB_SITE + '365')
    cb_capture('cb/receipts_mismatch',
               stmt('goal', lambda m: dict(m, prior_receipts=[])),
               'M/capture/receipts_mismatch/goal', MB_SITE + '366')

    def origin_cell_edit(field, value):
        def setup(w, s):
            k = w.goal.keys(s)
            okey = BO.origin_key(w.goal.BODY, k['body'], BO.sha(BO.physical(w.cell(w.goal.BODY, k['body'])['value'])[1]))
            cell = w.storage.cells[BO.ORIGINS][okey]
            new = copy.deepcopy(cell['value'])
            new[field] = value
            w.write([w.put(BO.ORIGINS, okey, new, expected=cell['version'])])
            mark(w, BO.ORIGINS, okey)
        return setup
    cb_capture('cb/origin_owner', origin_cell_edit('owner_ref', 'TEST_ONLY:foreign'),
               'M/capture/origin_owner/goal_body_record', MB_SITE + '348')
    cb_capture('cb/origin_issued', origin_cell_edit('issued_family_id', 'bogus_family'),
               'M/capture/origin_issued/goal_body_record', MB_SITE + '350')
    def origin_permission_setup(w, s):
        k = w.goal.keys(s)
        okey = BO.origin_key(w.goal.BODY, k['body'], BO.sha(BO.physical(w.cell(w.goal.BODY, k['body'])['value'])[1]))
        cell = w.storage.cells[BO.ORIGINS][okey]
        new = copy.deepcopy(cell['value'])
        new['issuer'] = dict(new['issuer'], original_permission_source=dict(
            new['issuer']['original_permission_source'], complete_value_sha256='0' * 64))
        w.write([w.put(BO.ORIGINS, okey, new, expected=cell['version'])])
        mark(w, BO.ORIGINS, okey)
    cb_capture('cb/origin_permission', origin_permission_setup,
               'M/capture/origin_permission/goal_body_record', MB_SITE + '354')

    def dispatch_case(name, mutate, expected, target):
        def make():
            w, scope = cb_new()
            key = w.registration.state_key()
            cell = w.cell(BO.DISPATCH, key)
            state = copy.deepcopy(cell['value'])
            mutate(w, state)
            w.write([w.put(BO.DISPATCH, key, state, expected=cell['version'])])
            mark(w, BO.DISPATCH, key)
            return w, lambda: w.coordinator.capture(MB.selector(scope))
        add(name, make, expected, target)
    dispatch_case('cb/writer_unregistered',
                  lambda w, st: st['registrations'].pop('binding_migration'),
                  'M/capture/writer_unregistered/binding_migration', MB_SITE + '300')
    dispatch_case('cb/writer_missing',
                  lambda w, st: st.update(implementations=[i for i in st['implementations']
                                                            if i['descriptor']['operation'] != 'binding_migration']),
                  'M/capture/writer_missing/binding_migration', MB_SITE + '302')
    dispatch_case('cb/writer_unenrolled',
                  lambda w, st: [i.update(enrollment='pending') for i in st['implementations']
                                  if i['descriptor']['operation'] == 'binding_migration'],
                  'M/capture/writer_unenrolled/binding_migration', MB_SITE + '304')
    dispatch_case('cb/writer_registration_join',
                  lambda w, st: [i['descriptor'].update(original_registration_ref=st['registrations']['goal_birth'])
                                  for i in st['implementations'] if i['descriptor']['operation'] == 'binding_migration'],
                  'M/capture/writer_registration_join/binding_migration', MB_SITE + '305')
    dispatch_case('cb/writer_storage',
                  lambda w, st: [i['descriptor'].update(storage_instance_id='00000000-0000-4000-8000-000000000000')
                                  for i in st['implementations'] if i['descriptor']['operation'] == 'binding_migration'],
                  'M/capture/writer_storage/binding_migration', MB_SITE + '306')

    def deletion_case():
        w, scope = cb_new()
        w.maintenance.request_deletion(scope)
        mark(w, BO.MAINTENANCE, w.maintenance.key())
        return w, lambda: w.coordinator.capture(MB.selector(scope))
    add('cb/deletion_requested', deletion_case, 'M/capture/deletion_requested', MB_SITE + '257')

    def derivation_delete(family_key):
        def make():
            w, scope = cb_new()
            fam, key = family_key(w, scope)
            cell = w.cell(fam, key)
            w.write([dict(table=fam, key=key, expected=cell['version'], delete=True)])
            mark(w, fam, key)
            return w, lambda: w.coordinator.capture(MB.selector(scope))
        return make
    add('cb/goal_birth_receipt',
        derivation_delete(lambda w, s: (w.goal.RECEIPT, sorted(w.storage.cells.get(w.goal.RECEIPT, {}))[0])),
        'M/capture/goal_birth_receipt', MB_SITE + '439')
    def head_receipt_key(w, s):
        body = w.goal.body_cell(s)['value']['record']
        for k in sorted(w.storage.cells.get(w.goal.RECEIPT, {})):
            _rt, _exp, value = BO.decode_physical(w.storage.cells[w.goal.RECEIPT][k]['value'], 'cb/head')
            if value['record']['after_revision'] == body['revision']:
                return w.goal.RECEIPT, k
        raise AssertionError('head receipt not found')
    def goal_receipt_head():
        w, scope = cb_new(revisions=3)
        fam, key = head_receipt_key(w, scope)
        cell = w.cell(fam, key)
        w.write([dict(table=fam, key=key, expected=cell['version'], delete=True)])
        mark(w, fam, key)
        return w, lambda: w.coordinator.capture(MB.selector(scope))
    add('cb/goal_receipt_head', goal_receipt_head,
        'M/capture/goal_receipt_head', MB_SITE + '440')

    def cb_run_case(name, setup, expected, target, action='commit'):
        def make():
            w, scope = cb_new()
            sel = MB.selector(scope)
            req = w.coordinator.capture(sel)
            setup(w, scope, req, sel)
            acts = dict(commit=lambda: w.coordinator.commit(req),
                        read_result=lambda: w.coordinator.read_result(sel),
                        recover=lambda: w.coordinator.recover(sel))
            return w, acts[action]
        add(name, make, expected, target)

    def cb_committed_case(name, setup, act, expected, target):
        def make():
            w, scope = cb_new()
            sel, req, res = C5C.run(w, scope)
            setup(w, scope, res, sel)
            return w, lambda: act(w, scope, res, sel)
        add(name, make, expected, target)

    cb_run_case('cb/commit_exclusion_not_held',
                lambda w, s, req, sel: w.coordinator.release_exclusion(s),
                'M/commit/exclusion_not_held', MB_SITE + '764')
    cb_run_case('cb/commit_independent_capture',
                lambda w, s, req, sel: w.host_stop.manual(s, 'stop'),
                'M/commit/independent_capture', MB_SITE + '766')
    # commit replay_no_effect (:759): proof in proofs_ca (read_result passive :868).
    cb_run_case('cb/commit_destination_present',
                lambda w, s, req, sel: w.write([w.put(w.binding.REVISION,
                                                       w.binding.keys(s)['revision'],
                                                       dict(schema_id='pm.test_only.preexisting_destination.v1', record={}))]),
                'M/commit/destination_present', MB_SITE + '785')

    cb_committed_case('cb/read_result_identity',
                      lambda w, s, res, sel: tx_edit(w, MB.RESULT, w.coordinator.result_key(s, res['migration_id']),
                                                     lambda v: v.update(scope=dict(v['scope'], goal_id=O.short_id('goal')))),
                      lambda w, s, res, sel: w.coordinator.read_result(sel),
                      'M/read_result/result_identity', MB_SITE + '834')
    cb_committed_case('cb/read_result_unknown',
                      lambda w, s, res, sel: None,
                      lambda w, s, res, sel: w.coordinator.read_result(MB.selector(s)),
                      'M/read_result/result_unavailable', MB_SITE + '832')
    cb_committed_case('cb/read_result_manifest_identity',
                      lambda w, s, res, sel: tx_edit(w, MB.PART,
                                                     w.coordinator.manifest_parts_of(s, res['migration_id'])[0][0],
                                                     lambda v: v.update(scope=dict(v['scope'], goal_id=O.short_id('goal')))),
                      lambda w, s, res, sel: w.coordinator.read_result(sel),
                      'M/read_result/manifest_identity', MB_SITE + '840')
    cb_committed_case('cb/read_result_manifest_ordinal',
                      lambda w, s, res, sel: tx_edit(w, MB.PART,
                                                     w.coordinator.manifest_parts_of(s, res['migration_id'])[0][0],
                                                     lambda v: v.update(ordinal=99)),
                      lambda w, s, res, sel: w.coordinator.read_result(sel),
                      'M/read_result/manifest_ordinal', MB_SITE + '841')
    cb_committed_case('cb/read_result_manifest_commitment',
                      lambda w, s, res, sel: tx_edit(w, MB.PART,
                                                     w.coordinator.manifest_parts_of(s, res['migration_id'])[0][0],
                                                     lambda v: v.update(whole_manifest_sha256='0' * 64)),
                      lambda w, s, res, sel: w.coordinator.read_result(sel),
                      'M/read_result/manifest_commitment', MB_SITE + '844')
    cb_committed_case('cb/read_result_origin_member',
                      lambda w, s, res, sel: tx_edit(w, MB.RESULT, w.coordinator.result_key(s, res['migration_id']),
                                                     lambda v: v.update(published_members=[])),
                      lambda w, s, res, sel: w.coordinator.read_result(sel),
                      'M/read_result/origin_member', MB_SITE + '856')

    def cb_withdraw_case(name, setup, expected, target):
        def make():
            w, scope = cb_new()
            sel, req, res = C5C.run(w, scope)
            wreq = C6C.withdrawal_request(w, scope, res['migration_id'])
            setup(w, scope, res, wreq)
            return w, lambda: w.coordinator.withdraw(wreq)
        add(name, make, expected, target)
    def withdraw_domain_setup(w, s, res, wreq):
        head = w.value(w.binding.HEAD, w.binding.head_key())
        dkey = head['record']['domain']['physical_key']
        wrapper = copy.deepcopy(w.cell(w.binding.DOMAIN, dkey)['value'])
        newkey = dkey + ':copy'
        w.write([w.put(w.binding.DOMAIN, newkey, wrapper)])
        tx_edit(w, w.binding.HEAD, w.binding.head_key(),
                lambda v: v['record']['domain'].update(physical_key=newkey))
    cb_withdraw_case('cb/withdraw_domain_current', withdraw_domain_setup,
                     'M/withdraw/writer_domain', MB_SITE + '913')

    cb_case('cb/registration_state_unavailable',
            lambda w, s: drop(w, BO.DISPATCH, w.registration.state_key()),
            lambda w, s: w.coordinator.capture(MB.selector(s)), 'registration/state_unavailable', BO_SITE + '1496')
    cb_case('cb/maintenance_unavailable',
            lambda w, s: drop(w, BO.MAINTENANCE, w.maintenance.key()),
            lambda w, s: w.coordinator.capture(MB.selector(s)), 'maintenance/unavailable', BO_SITE + '1634')
    cb_case('cb/goal_mutation_cancelled',
            lambda w, s: cb_phys_edit(w, w.goal.CONTROL, w.goal.keys(s)['control'],
                                  lambda v: v['record'].update(cancellation_receipt_ref='x')),
            lambda w, s: w.goal.mutate_state(s, 'paused'), 'goal/mutation_cancelled', BO_SITE + '532')
    cb_case('cb/goal_mutation_cancel_pending',
            lambda w, s: cb_phys_edit(w, w.goal.CONTROL, w.goal.keys(s)['control'],
                                  lambda v: v['record'].update(cancellation_pending=dict(operation_id=O.uid('TEST_ONLY:op')))),
            lambda w, s: w.goal.mutate_state(s, 'paused'), 'goal/mutation_cancel_pending', BO_SITE + '533')
    def host_repr():
        suite.n += 1
        w = MB.migration_world(suite.work / ('cb%05d' % suite.n))
        s = w.new_scope()
        w.register_scope(s)
        w.host_stop.birth_domain(s, unsupported=True)
        BO.legacy_goal(w)
        return w, lambda: w.host_stop.manual(s, 'stop')
    add('cb/host_representation', host_repr, 'host_stop/representation', BO_SITE + '735')
    cb_case('cb/host_not_latched', lambda w, s: None,
            lambda w, s: w.host_stop.manual(s, 'resume'), 'host_stop/not_latched', BO_SITE + '742')
    cb_case('cb/host_schema_unsupported',
            lambda w, s: tx_edit(w, w.host_stop.FAMILY, w.host_stop.key(s),
                                  lambda v: v.update(schema_id='bogus')),
            lambda w, s: w.host_stop.read_for_binding_migration(MB.selector(s)),
            'host_stop/unsupported_representation', BO_SITE + '782')
    cb_case('cb/host_scope',
            lambda w, s: tx_edit(w, w.host_stop.FAMILY, w.host_stop.key(s),
                                  lambda v: v['record'].update(goal_id=O.short_id('goal'))),
            lambda w, s: w.host_stop.read_for_binding_migration(MB.selector(s)),
            'host_stop/scope', BO_SITE + '785')
    # host_stop last_receipt (:798): proof in proofs_ca (genuine writers maintain
    # epochs>0 => last receipt ref present; tampering breaks image origin first).

    def cb_number(name, setup, act, expected, target):
        def make():
            w, scope = cb_new()
            setup(w, scope)
            return w, lambda: act(w, scope)
        add(name, make, expected, target)
    cb_number('cb/exclusion_epoch_max', lambda w, s: setattr(w.storage, 'cell_generation', MAX_U64),
              lambda w, s: w.coordinator.capture(MB.selector(s)),
              'M/exclusion_epoch/numrule/integer_range', 'dg5/M/exclusion_epoch/number')
    cb_number('cb/maintenance_epoch_max',
              lambda w, s: tx_edit(w, BO.MAINTENANCE, w.maintenance.key(),
                                    lambda v: v.update(maintenance_epoch=MAX_U64)),
              lambda w, s: w.maintenance.maintenance_window(),
              'maintenance/epoch/numrule/integer_range', 'dg5/maintenance/epoch/number')
    cb_number('cb/restore_epoch_max',
              lambda w, s: tx_edit(w, BO.MAINTENANCE, w.maintenance.key(),
                                    lambda v: v.update(restore_epoch=MAX_U64)),
              lambda w, s: w.maintenance.restore(),
              'maintenance/restore_epoch/numrule/integer_range', 'dg5/maintenance/restore_epoch/number')

    # ---- batch 12c: CB derive/commit/read_result/recover + owners remainder ----
    def cb_delete(name, family_key, expected, target, prepare=None):
        def make():
            w, scope = cb_new()
            if prepare:
                prepare(w, scope)
            fam, key = family_key(w, scope)
            cell = w.cell(fam, key)
            w.write([dict(table=fam, key=key, expected=cell['version'], delete=True)])
            mark(w, fam, key)
            return w, lambda: w.coordinator.capture(MB.selector(scope))
        add(name, make, expected, target)
    cb_delete('cb/plan_absent_reverse_gpb',
              lambda w, s: (w.plans and None) or ('assistant_plan_run', w.plans.keys(s, *C5C.plan_bound(w, s, schedules=0, consents=0))['run']),
              'M/capture/plan_absent_reverse_row', MB_SITE + '463')
    cb_delete('cb/plan_record_unavailable',
              lambda w, s: ('assistant_plan_record', 'assistant_plan_record.v1:%s:%s:%s:%s' % (
                  MB.hx(w.storage_id), MB.hx(s['project_id']), MB.hx(s['thread_id']),
                  MB.hx(C5C.plan_bound(w, s, schedules=0, consents=0)[0]))),
              'M/capture/plan_record_unavailable', MB_SITE + '467')

    def cb_scheduler_delete(family):
        def make():
            w, scope = cb_new()
            pid, rid = C5C.plan_bound(w, scope, schedules=1, consents=1, callbacks=1)
            for fam, key in [(w.plans and 'goal_plan_binding', w.plans.gpb_key(scope, rid)),
                             ('assistant_plan_run', w.plans.keys(scope, pid, rid)['run'])]:
                cell = w.cell(fam, key)
                w.write([dict(table=fam, key=key, expected=cell['version'], delete=True)])
                mark(w, fam, key)
            return w, lambda: w.coordinator.capture(MB.selector(scope))
        return make
    add('cb/scheduler_unaccounted_schedule', cb_scheduler_delete('execution_schedule'),
        'M/capture/scheduler_unaccounted', MB_SITE + '521')

    def cb_unaccounted_active():
        w, scope = cb_new()
        pid, rid = C5C.plan_bound(w, scope, schedules=0, consents=0)
        for fam, key in [('goal_plan_binding', w.plans.gpb_key(scope, rid)),
                         ('assistant_plan_run', w.plans.keys(scope, pid, rid)['run'])]:
            cell = w.cell(fam, key)
            w.write([dict(table=fam, key=key, expected=cell['version'], delete=True)])
            mark(w, fam, key)
        return w, lambda: w.coordinator.capture(MB.selector(scope))
    add('cb/unaccounted_active_run', cb_unaccounted_active, 'M/capture/unaccounted_active_run', MB_SITE + '554')

    def cb_commit_case(name, setup, expected, target):
        def make():
            w, scope = cb_new()
            sel = MB.selector(scope)
            req = w.coordinator.capture(sel)
            setup(w, scope, req, sel)
            return w, lambda: w.coordinator.commit(req)
        add(name, make, expected, target)
    cb_commit_case('cb/commit_permission',
                   lambda w, s, req, sel: w.permissions.revoke(w.constants['decision:%s:%s' % (w.coordinator.owner_id, MB.ADOPT)]),
                   'M/commit/permission', MB_SITE + '762')
    def final_permission_setup(w, s, req, sel):
        def hook(c):
            ref = c.world.constants['decision:%s:%s' % (c.owner_id, MB.ADOPT)]
            c.world.permissions.revoke(ref)
            mark(c.world, 'TEST_ONLY:permission_source', ref)
        w.coordinator.inject[('commit', 'after_derive')] = hook
    cb_commit_case('cb/commit_final_permission', final_permission_setup,
                   'M/commit/final_permission', MB_SITE + '776')
    def final_capture_setup(w, s, req, sel):
        def hook(c):
            c.world.host_stop.manual(s, 'stop')
            for table in (w.host_stop.FAMILY, w.host_stop.RECEIPTS, BO.ORIGINS):
                for key in list(w.storage.cells.get(table, {})):
                    mark(w, table, key)
        w.coordinator.inject[('commit', 'after_derive')] = hook
    cb_commit_case('cb/commit_final_capture', final_capture_setup,
                   'M/commit/final_capture', MB_SITE + '774')
    # tx/check_version (BO :291): proof in proofs_ca (final_candidate binds checks to the final capture).
    cb_case('cb/write_permission_unavailable',
            lambda w, s: w.constants.pop('write_permission:' + w.goal.owner_id, None),
            lambda w, s: w.goal.mutate_state(s, 'paused'), 'owner/write_permission_unavailable', BO_SITE + '309')

    def cb_recover_case(name, setup, expected, target):
        def make():
            w, scope = cb_new()
            sel = MB.selector(scope)
            setup(w, scope, sel)
            return w, lambda: w.coordinator.recover(sel)
        add(name, make, expected, target)
    cb_recover_case('cb/recover_ambiguous_destination',
                    lambda w, s, sel: w.write([w.put(w.binding.REVISION,
                                                      w.binding.keys(s)['revision'],
                                                      dict(schema_id='pm.test_only.ambiguous.v1', record={}))]),
                    'M/recover/ambiguous_destination', MB_SITE + '810')
    cb_recover_case('cb/recover_ambiguous_manifest',
                    lambda w, s, sel: w.write([w.put(MB.PART, w.coordinator.part_key(s, sel['migration_id'], 0),
                                                      dict(scope=dict(sel['scope']), migration_id=sel['migration_id'],
                                                           ordinal=0, part_count=1, whole_manifest_sha256='0' * 64, members=[]))]),
                    'M/recover/ambiguous_manifest', MB_SITE + '812')

    def cb_blocked_case(name, setup, expected, target):
        def make():
            w, scope = cb_new()
            C5C.plan_bound(w, scope, schedules=0, consents=0)
            w.workflows.attach(scope)
            sel, req, res = C5C.run(w, scope)
            setup(w, scope, res, sel)
            return w, lambda: w.coordinator.read_result(sel)
        add(name, make, expected, target)
    cb_blocked_case('cb/read_result_blocked_unpublished',
                    lambda w, s, res, sel: tx_edit(w, MB.RESULT, w.coordinator.result_key(s, res['migration_id']),
                                                     lambda v: v.update(published_members=[w.coordinator.manifest_parts_of(s, res['migration_id'])[0][1]['members'][0]])),
                    'M/read_result/blocked_unpublished', MB_SITE + '861')

    def cb_read_case(name, setup, expected, target):
        def make():
            w, scope = cb_new()
            sel, req, res = C5C.run(w, scope)
            setup(w, scope, res, sel)
            return w, lambda: w.coordinator.read_result(sel)
        add(name, make, expected, target)
    cb_read_case('cb/read_result_manifest_unavailable',
                 lambda w, s, res, sel: [w.write([dict(table=MB.PART, key=k, expected=w.cell(MB.PART, k)['version'], delete=True)])
                                          for k, _p in w.coordinator.manifest_parts_of(s, res['migration_id'])],
                 'M/read_result/manifest_unavailable', MB_SITE + '837')
    cb_read_case('cb/read_result_destination_unavailable',
                 lambda w, s, res, sel: [w.write([dict(table=w.binding.REVISION, key=w.binding.keys(s)['revision'],
                                                       expected=w.cell(w.binding.REVISION, w.binding.keys(s)['revision'])['version'], delete=True)])],
                 'M/read_result/destination_unavailable', MB_SITE + '850')
    def origin_member_setup(w, s, res, sel):
        tx_edit(w, MB.RESULT, w.coordinator.result_key(s, res['migration_id']),
                lambda v: v.update(published_members=[
                    m for m in v['published_members']
                    if not m['physical_key'].startswith('goal_execution_binding_origin|')]))
    cb_read_case('cb/read_result_origin_member2', origin_member_setup,
                 'M/read_result/origin_member', MB_SITE + '856')

    # ---- batch 12c: CB derive/commit/recover/codec/tx + CA3 numbers ----
    def cb_delete2(name, prepare, family_key, expected, target):
        def make():
            w, scope = cb_new()
            if prepare:
                prepare(w, scope)
            fam, key = family_key(w, scope)
            cell = w.cell(fam, key)
            w.write([dict(table=fam, key=key, expected=cell['version'], delete=True)])
            mark(w, fam, key)
            return w, lambda: w.coordinator.capture(MB.selector(scope))
        add(name, make, expected, target)
    def plan_absent_attach():
        w, scope = cb_new()
        _op, pid, rid = w.plans.stage_pending_attach(scope, disposition='no_effect')
        fam, key = 'assistant_plan_run', w.plans.keys(scope, pid, rid)['run']
        cell = w.cell(fam, key)
        w.write([dict(table=fam, key=key, expected=cell['version'], delete=True)])
        mark(w, fam, key)
        return w, lambda: w.coordinator.capture(MB.selector(scope))
    add('cb/plan_absent_reverse_attach', plan_absent_attach,
        'M/capture/plan_absent_reverse_row', MB_SITE + '479')
    cb_delete2('cb/plan_absent_reverse_orphan', None,
               lambda w, s: ('goal_plan_binding', w.plans.gpb_key(s, C5C.plan_bound(w, s, schedules=0, consents=0)[1])),
               'M/capture/plan_absent_reverse_row', MB_SITE + '492')


    def cb_edit_reissue(w, family, key, fn):
        cell = w.cell(family, key)
        old_raw = BO.physical(cell['value'])[1]
        old_okey = BO.origin_key(family, key, BO.sha(old_raw))
        old_origin = copy.deepcopy(w.cell(BO.ORIGINS, old_okey)['value'])
        new = tx_edit(w, family, key, fn)
        new_raw = BO.physical(new)[1]
        new_okey = BO.origin_key(family, key, BO.sha(new_raw))
        new_origin = copy.deepcopy(old_origin)
        new_origin['issued_physical_sha256'] = BO.sha(new_raw)
        w.write([w.put(BO.ORIGINS, new_okey, new_origin)])
        mark(w, BO.ORIGINS, new_okey)

    def cb_workflow_delete(name, which, expected, target):
        def make():
            w, scope = cb_new()
            rid = w.workflows.attach(scope)
            k = w.workflows.keys(scope, rid)
            fam = {'control': 'workflow_goal_run_control', 'birth': 'executor_workflow_workflow_birth',
                   'pointer': 'executor_workflow_current_pointer'}[which]
            key = k[which]
            cell = w.cell(fam, key)
            w.write([dict(table=fam, key=key, expected=cell['version'], delete=True)])
            mark(w, fam, key)
            return w, lambda: w.coordinator.capture(MB.selector(scope))
        add(name, make, expected, target)
    cb_workflow_delete('cb/workflow_member_unavailable', 'birth',
                       'M/capture/workflow_member_unavailable', MB_SITE + '504')

    def cb_sched_only(name, keep_family, expected, target):
        def make():
            w, scope = cb_new()
            pid, rid = C5C.plan_bound(w, scope, schedules=1, consents=1, callbacks=1)
            keep = {'execution_schedule': ('execution_schedule',),
                    'execution_schedule_run_binding': ('execution_schedule_run_binding',),
                    'quota_resume_consent': ('quota_resume_consent',),
                    'TEST_ONLY:scheduler_callback_admission': ('TEST_ONLY:scheduler_callback_admission',)}[keep_family]
            for fam, key in [('goal_plan_binding', w.plans.gpb_key(scope, rid)),
                             ('assistant_plan_run', w.plans.keys(scope, pid, rid)['run'])] + \
                            [(f, k) for f in ('execution_schedule', 'execution_schedule_run_binding',
                                              'quota_resume_consent', 'TEST_ONLY:scheduler_callback_admission')
                             if f != keep_family for k in list(w.storage.cells.get(f, {}))]:
                if w.cell(fam, key) is not None:
                    cell = w.cell(fam, key)
                    w.write([dict(table=fam, key=key, expected=cell['version'], delete=True)])
                    mark(w, fam, key)
            return w, lambda: w.coordinator.capture(MB.selector(scope))
        add(name, make, expected, target)
    # scheduler binding/consent unaccounted (:527/:532): proofs (enumerated only for present runs).
    cb_sched_only('cb/scheduler_unaccounted_callback', 'TEST_ONLY:scheduler_callback_admission',
                  'M/capture/scheduler_unaccounted', MB_SITE + '534')

    cb_commit_case('cb/commit_permission',
                   lambda w, s, req, sel: w.permissions.revoke(w.constants['decision:%s:%s' % (w.coordinator.owner_id, MB.ADOPT)]),
                   'M/commit/permission', MB_SITE + '762')
    def derive_exclusion_setup(w, s, req, sel):
        def hook(c):
            c.release_exclusion(s)
            mark(c.world, 'TEST_ONLY:migration_exclusion', c.world.exclusion_key(s))
        w.coordinator.inject[('commit', 'after_sir')] = hook
    cb_commit_case('cb/derive_exclusion_not_held', derive_exclusion_setup,
                   'M/commit/exclusion_not_held', MB_SITE + '613')

    def cb_codec_case(name, raw, expected, target):
        def make():
            w, scope = cb_new()
            k = w.goal.keys(scope)
            cell = w.cell(w.goal.BODY, k['body'])
            carrier = dict(schema_id=BO.CARRIER_ID, qualification=BO.QUALIFICATION,
                           codec_id=BO.GOAL_JSON, bytes_hex=raw.hex())
            w.write([w.put(w.goal.BODY, k['body'], carrier, expected=cell['version'])])
            mark(w, w.goal.BODY, k['body'])
            return w, lambda: w.coordinator.capture(MB.selector(scope))
        add(name, make, expected, target)
    cb_codec_case('cb/json_duplicate_key', b'{"schema_id":"x","schema_id":"y"}',
                  'codec/json_duplicate_key', BO_SITE + '131')
    cb_codec_case('cb/json_noncanonical', BO.json_encode({}) + b' ',
                  'codec/json_noncanonical', BO_SITE + '141')
    cb_case('cb/unsupported_codec',
            lambda w, s: tx_edit(w, w.goal.BODY, w.goal.keys(s)['body'],
                                  lambda v: v.update(codec_id='bogus_codec')),
            lambda w, s: w.goal.body_cell(s), 'goal/goal_body_record/unsupported_codec', BO_SITE + '178')
    def sir_outcome_setup(w, s):
        route, req = C5C.cancel_request(w, s)
        route.dispatch(req)
        for k in list(w.storage.cells.get('sir_command_outcome', {}))[:1]:
            _c, old_raw, _v = BO.decode_physical(w.cell('sir_command_outcome', k)['value'], 'cb/sir')
            old_okey = BO.origin_key('sir_command_outcome', k, BO.sha(old_raw))
            old_origin = copy.deepcopy(w.cell(BO.ORIGINS, old_okey)['value'])
            cb_phys_edit(w, 'sir_command_outcome', k, lambda v: v['record'].update(outcome='bogus'))
            new_raw = BO.physical(w.cell('sir_command_outcome', k)['value'])[1]
            new_okey = BO.origin_key('sir_command_outcome', k, BO.sha(new_raw))
            new_origin = copy.deepcopy(old_origin)
            new_origin['issued_physical_sha256'] = BO.sha(new_raw)
            w.write([w.put(BO.ORIGINS, new_okey, new_origin)])
            mark(w, BO.ORIGINS, new_okey)
    cb_capture('cb/sir_outcome_kind', sir_outcome_setup,
               'M/capture/source_schema/sir_outcome_kind', BO_SITE + '222')
    cb_case('cb/cutoff_without_domain', lambda w, s: None,
            lambda w, s: w.binding.cutoff_write(O.uid('TEST_ONLY:wd'), O.uid('TEST_ONLY:mid')),
            'domain/cutoff_without_domain', BO_SITE + '1610')

    def cb_stop_unstable():
        w, scope = cb_new()

        def hook(c):
            record = c.world.host_stop.record(scope)
            c.world.host_stop.manual(scope, 'resume' if record['latched'] else 'stop')
            for k in c.world.storage.cells.get(c.world.host_stop.RECEIPTS, {}):
                mark(c.world, c.world.host_stop.RECEIPTS, k)
            for k in c.world.storage.cells.get(BO.ORIGINS, {}):
                mark(c.world, BO.ORIGINS, k)
            mark(c.world, c.world.host_stop.FAMILY, c.world.host_stop.key(scope))
            c.inject[('capture', 'after_sir')] = hook
        w.coordinator.inject[('capture', 'after_sir')] = hook
        return w, lambda: w.coordinator.capture(MB.selector(scope))
    add('cb/stop_unstable', cb_stop_unstable, 'M/capture/stop_unstable', MB_SITE + '247')

    def cb_domain_second(name, setup, expected, target):
        def make():
            w, scope = cb_new()
            C5C.run(w, scope)
            w2scope = BO.legacy_goal(w)
            setup(w, scope, w2scope)
            return w, lambda: w.coordinator.capture(MB.selector(w2scope))
        add(name, make, expected, target)
    cb_domain_second('cb/domain_withdrawn',
                     lambda w, s, s2: w.storage.transact(
                         [w.binding.cutoff_write(O.uid('TEST_ONLY:wd'), O.uid('TEST_ONLY:mid'))]),
                     'M/capture/domain_withdrawn', MB_SITE + '313')
    cb_domain_second('cb/domain_registration_changed',
                     lambda w, s, s2: tx_edit(w, BO.DISPATCH, w.registration.state_key(),
                                              lambda v: v.update(root_identity=O.uid('TEST_ONLY:root'))),
                     'M/capture/domain_registration_changed', MB_SITE + '315')
    cb_capture('cb/selection_physical_key',
               stmt('goal', lambda m: m['sources'][0]['selection'].update(physical_key='no-separator') or m),
               'M/selection/physical_key', MB_SITE + '75')
    def unsupported_codec_setup(w, s):
        C5C.plan_bound(w, s, schedules=0, consents=0)
        k = [k for k in w.storage.cells.get('assistant_plan_record', {})][0]
        cell = w.cell('assistant_plan_record', k)
        _codec, old_raw, value = BO.decode_physical(cell['value'], 'cb/codec')
        carrier = BO.store_form(value, BO.GOAL_JSON)
        w.write([w.put('assistant_plan_record', k, carrier, expected=cell['version'])])
        mark(w, 'assistant_plan_record', k)
        old_okey = BO.origin_key('assistant_plan_record', k, BO.sha(old_raw))
        new_raw = BO.physical(carrier)[1]
        new_okey = BO.origin_key('assistant_plan_record', k, BO.sha(new_raw))
        ocell = w.cell(BO.ORIGINS, old_okey)
        new_origin = copy.deepcopy(ocell['value'])
        new_origin['issued_physical_sha256'] = BO.sha(new_raw)
        new_origin['codec_id'] = BO.GOAL_JSON
        w.write([w.put(BO.ORIGINS, new_okey, new_origin)])
        mark(w, BO.ORIGINS, new_okey)
    cb_capture('cb/unsupported_codec_auth', unsupported_codec_setup,
               'M/capture/unsupported_codec/assistant_plan_record', MB_SITE + '334')

    def origin_absent_setup(w, s):
        k = w.goal.keys(s)
        okey = BO.origin_key(w.goal.BODY, k['body'], BO.sha(BO.physical(w.cell(w.goal.BODY, k['body'])['value'])[1]))

        def hook(c):
            cell = c.world.cell(BO.ORIGINS, okey)
            c.world.write([dict(table=BO.ORIGINS, key=okey, expected=cell['version'], delete=True)])
            mark(c.world, BO.ORIGINS, okey)
        w.coordinator.inject[('capture', 'after_goal')] = hook
    cb_capture('cb/origin_absent_auth', origin_absent_setup,
               'M/capture/origin_absent/goal_body_record', MB_SITE + '345')

    # ---- batch 13: CA3 numbers/selectors + CB derive joins remainder ----
    def num_case(name, setup, act, expected, target):
        def make():
            w, r = C3C.until(suite, 'native')
            setup(w, r)
            return w, lambda: act(w, r)
        add(name, make, expected, target)
    def cap_revision_act(w, r):
        try:
            return r.run_native()
        finally:
            for table in ('TEST_ONLY:ancillary_provenance', w.native.effects.CAP, w.native.effects.INV,
                          'TEST_ONLY:workflow_scheduler_stop', 'executor_run_execution_control',
                          'workflow_goal_run_control', 'workflow_goal_run_body'):
                for key in list(w.storage.cells.get(table, {})):
                    mark(w, table, key)
    num_case('number/cap_revision_max',
             lambda w, r: [tx_edit(w, w.native.effects.CAP, k, lambda v: v.update(revision=MAX_U64))
                           for k in list(w.storage.cells.get(w.native.effects.CAP, {}))[:1]],
             cap_revision_act, 'cap/revision/numrule/integer_range', 'dg5/cap/revision/number')
    # d06/revision + d06/unsupported_status: proofs (prepare refusals are caught by run_native).

    def index_revision_max():
        w, r = C3C.wf(suite)
        w.index.frontier = dict(w.index.frontier or {}, publication_revision=MAX_U64)
        return w, w.index.publish
    add('number/index_revision_max', index_revision_max,
        'index/revision/numrule/integer_range', 'dg5/index/revision/number')

    def selector_instance_setup(w, r):
        new = tx_edit(w, w.native.d06.INTENT, r.wf_run['d06']['intent_key'],
                      lambda v: v['record']['association_selection'].update(storage_instance_id='foreign'))
        tx_edit(w, w.native.d06.CONTROL, r.wf_run['d06']['control_key'],
                lambda v: v['record']['intent'].update(physical_value_sha256=O.row_sha(new)))
    native_case('c3n/selector_instance', selector_instance_setup,
                'C3/settle_owner/native_custody/selector_instance', N3_SITE + '135')
    native_case('c3n/selector_unavailable',
                lambda w, r: drop(w, w.native.effects.CUT if hasattr(w.native.effects, 'CUT') else 'TEST_ONLY:native_inventory_cut',
                                  r.wf_run['d05']['cut_key'] if 'cut_key' in r.wf_run.get('d05', {}) else
                                  [k for k in w.storage.cells.get('TEST_ONLY:native_inventory_cut', {})][0]),
                'native/selector/unavailable', N3_SITE + '137')
    native_case('c3n/stored_unavailable',
                lambda w, r: drop(w, 'TEST_ONLY:workflow_scheduler_stop', r.wf_run['scheduler_stop_key']
                                  if 'scheduler_stop_key' in r.wf_run else [k for k in w.storage.cells.get('workflow_scheduler_stop', {})][0]),
                'native/selector/unavailable', N3_SITE + '101')

    # d06_unsupported_status: proof in proofs_ca (prepare-only check, caught by run_native).

    def reservation_absent():
        w, r = C3C.until(suite, 'append_original')
        drop(w, AS.RESERVATION_TABLE, r.operation_id)
        return w, r.append_original
    add('c3/reservation_absent', reservation_absent, 'assignment/reservation_absent', R3_SITE + '116')

    def cb_workflow_head_chain():
        w, scope = cb_new()
        rid = w.workflows.attach(scope)
        k = w.workflows.keys(scope, rid)
        heads = w.workflows.head_keys(scope, rid) if hasattr(w.workflows, 'head_keys') else \
            [kk for kk in w.storage.cells.get('executor_workflow_workflow_head', {}) if kk.startswith(k['head_prefix'])]
        hk = sorted(heads)[-1]
        cb_edit_reissue(w, 'executor_workflow_workflow_head', hk,
                lambda v: v['record'].update(revision=v['record']['revision'] + 5))
        return w, lambda: w.coordinator.capture(MB.selector(scope))
    add('cb/workflow_head_chain', cb_workflow_head_chain, 'M/capture/workflow_head_chain', MB_SITE + '506')

    def cb_workflow_goal_join():
        w, scope = cb_new()
        rid = w.workflows.attach(scope)
        k = w.workflows.keys(scope, rid)
        cb_edit_reissue(w, 'workflow_goal_run_body', k['body'],
                lambda v: v['record']['identity'].update(goal_id=O.short_id('goal')))
        return w, lambda: w.coordinator.capture(MB.selector(scope))
    add('cb/workflow_goal_join', cb_workflow_goal_join, 'M/capture/workflow_goal_join', MB_SITE + '508')

    def cb_workflow_join():
        w, scope = cb_new()
        rid = w.workflows.attach(scope)
        k = w.workflows.keys(scope, rid)
        cb_edit_reissue(w, 'workflow_goal_run_control', k['control'],
                lambda v: v['record']['identity'].update(goal_id=O.short_id('goal')))
        return w, lambda: w.coordinator.capture(MB.selector(scope))
    add('cb/workflow_join', cb_workflow_join, 'M/capture/workflow_join', MB_SITE + '510')

    def audit_custody_case():
        w, r = C3C.until(suite, 'append_original')
        r.late_audit = dict(r.late_audit, assignment_attempt=99)
        return w, r.append_original
    add('c3/append_audit_custody', audit_custody_case, 'C3/append_original/audit_custody', R3_SITE + '1103')

    # ---- batch 14: last route joins ----
    def d06_goal_stop():
        w, r = C3C.until(suite, 'settle_owner')
        intent = w.value(w.native.d06.INTENT, r.wf_run['d06']['intent_key'])['record']
        rkey = intent['goal_stop']['physical_key']
        cell = w.cell('goal_cancel_stop_receipt', rkey)
        newkey = rkey + ':copy'
        w.write([w.put('goal_cancel_stop_receipt', newkey, copy.deepcopy(cell['value']))])
        fake = __import__('pm_goal_dg_ca3_native').src_sel(w, 'goal_cancel_stop_receipt', newkey)
        new = tx_edit(w, w.native.d06.INTENT, r.wf_run['d06']['intent_key'],
                      lambda v: v['record'].update(goal_stop=fake))
        tx_edit(w, w.native.d06.CONTROL, r.wf_run['d06']['control_key'],
                lambda v: v['record']['intent'].update(physical_value_sha256=O.row_sha(new)))
        return w, r.settle_owner
    add('c3/d06_goal_stop', d06_goal_stop, 'C3/settle_owner/d06_goal_stop', R3_SITE + '805')

    def d05_goal_stop_route():
        w, r = C3C.until(suite, 'settle_owner')
        r.progress = copy.deepcopy(r.progress)
        r.progress['stop_receipt'] = dict(r.progress['stop_receipt'],
                                          original_host_transaction_ref=O.uid('TEST_ONLY:host-stop-transaction'))
        c3_coherent_progress(w, r)
        return w, r.settle_owner
    add('c3/d05_goal_stop_route', d05_goal_stop_route, 'C3/settle_owner/d05_goal_stop', R3_SITE + '810')

    def d06_d05_join():
        w, r = C3C.until(suite, 'settle_owner')
        safe_key = r.wf_run['d05']['result_key']
        fake = __import__('pm_goal_dg_ca3_native').src_sel(w, w.native.d05.RESULT, safe_key)
        fake = dict(fake, physical_key=fake['physical_key'] + ':copy')
        cell = w.cell(w.native.d05.RESULT, safe_key)
        w.write([w.put(w.native.d05.RESULT, fake['physical_key'], copy.deepcopy(cell['value']))])
        new = tx_edit(w, w.native.d06.INTENT, r.wf_run['d06']['intent_key'],
                      lambda v: v['record'].update(safe_stop_source=fake))
        tx_edit(w, w.native.d06.CONTROL, r.wf_run['d06']['control_key'],
                lambda v: v['record']['intent'].update(physical_value_sha256=O.row_sha(new)))
        return w, r.settle_owner
    add('c3/d06_d05_join', d06_d05_join, 'C3/settle_owner/d06_d05_join', R3_SITE + '813')
