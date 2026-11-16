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
import pm_goal_test_storage as S

C1_SITE = 'dg5/site/pm_goal_dg_ca_c1.py:'
C2_SITE = 'dg5/site/pm_goal_dg_ca_c2.py:'
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
    add('shared/registry_role', registry_role, 'registry/role', AD_SITE + '247')

    def registry_unregistered():
        w, r = DGO.c1_route(suite)
        w.plan_inventory.owner_id = O.uid('TEST_ONLY:foreign-owner')
        return w, r.capture_source
    add('shared/registry_unregistered', registry_unregistered, 'registry/unregistered_owner', AD_SITE + '246')

    def original_withdrawn():
        w, r = DGO.c1_route(suite)
        w.sir.withdraw(r.sir_handle)
        return w, r.capture_source
    add('shared/original_withdrawn', original_withdrawn, 'original/withdrawn', AD_SITE + '401')

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
