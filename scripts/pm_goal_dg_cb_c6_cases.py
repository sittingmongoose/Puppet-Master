#!/usr/bin/env python3
"""DG-CB C6 cases: atomic destination installation, manifests, recovery and withdrawal (M7-M9), TEST_ONLY.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Positives feed C5's authenticated capture to the coordinator's commit and
observe one test-owner Storage transaction: every destination member absent
before and present after, the writer domain installed or joined under
whole-head CAS, bounded MessagePack parts and operations, ordered content-free
manifest parts whose commitment the immutable BindingOrigin anchors, and the
first immutable result. They cover exact replay, lost acknowledgement resolved
from Storage, a concurrent Stop between capture and commit (no overwrite;
recapture enrolls the newer domain), passive result reads after disposed
mutable content, blocked_unresolved publication, committed and uncommitted
withdrawal (pending work and immutable results preserved; SP-423 writer
cutoff; held-reader invalidation), reinstall as a new writer-domain admission,
the enrolled Goal cancelling through DG-CA's unchanged C1 route, and the
child-process crash matrix. Negatives refuse each one-defect change with its
own code and leave Storage unchanged except for the injected change.
"""
from __future__ import annotations

import copy
import os

import pm_goal_test_storage as S
import pm_goal_dg_cb_owners as B
import pm_goal_dg_cb_migration as M
import pm_goal_dg_cb_crash as CRASH
import pm_goal_dg_ca_c1 as C1
from pm_goal_dg_ca_owners import row_sha, sha, uid, scoped_key
from pm_goal_dg_cb_c5_cases import check, mark, new, phys, goal_physical, run, plan_bound, cancel_request

G = 'C6'


def destination_keys(w, scope, mid, *, install):
    bk = w.binding.keys(scope, 0)
    keys = [(w.binding.REVISION, bk['revision']), (w.binding.ORIGIN, bk['origin']), (w.binding.CONTROL, bk['control']),
            (M.RESULT, w.coordinator.result_key(scope, mid)), (M.PART, w.coordinator.part_key(scope, mid, 0))]
    if install:
        keys += [(w.binding.DOMAIN, 'goal_execution_writer_domain.v1:%s:epoch:1' % w.binding.storage_key()), (w.binding.HEAD, w.binding.head_key())]
    return keys


def withdrawal_request(w, scope, mid, *, wid=None, original='auto', domain='auto'):
    result = w.value(M.RESULT, w.coordinator.result_key(scope, mid))
    return dict(scope=copy.deepcopy(scope), migration_id=mid, withdrawal_id=wid or uid('TEST_ONLY:withdrawal'),
                expected_original_result=w.coordinator.result_selection(scope, mid) if original == 'auto' else original,
                expected_writer_domain=(result['writer_domain'] if result else w.coordinator.current_domain_selection()) if domain == 'auto' else domain)


def c1_route(w, scope):
    route, request = cancel_request(w, scope)
    route.dispatch(request)
    return route


# ------------------------------------------------------------------ positives

def positives(suite):
    def atomic_install():
        w, scope = new(suite, revisions=2)
        sel = M.selector(scope)
        req = w.coordinator.capture(sel)
        keys = destination_keys(w, scope, sel['migration_id'], install=True)
        check(all(w.cell(t, k) is None for t, k in keys), 'every destination member absent before commit')
        old_control = w.cell(w.goal.CONTROL, w.goal.keys(scope)['control'])
        generation, txs = w.storage.cell_generation, w.storage.tx_counter
        res = w.coordinator.commit(req)
        check(w.storage.cell_generation == generation + 1 and w.storage.tx_counter == txs + 1, 'exactly one Storage transaction')
        check(all(w.cell(t, k) is not None for t, k in keys), 'every destination member present after commit')
        published = {m['physical_key']: m['sha256'] for m in res['published_members']}
        for t, k in keys:
            if t in (M.RESULT, M.PART):
                continue
            check(published.get(t + '|' + k) == row_sha(w.value(t, k)), 'published member selection equals the stored bytes: ' + t)
        check(w.cell(w.goal.CONTROL, w.goal.keys(scope)['control'])['version'] == old_control['version'] + 1, 'body control v1->v2 CAS in the same transaction')
        sizes = []
        for t, k in keys + [(w.goal.CONTROL, w.goal.keys(scope)['control'])]:
            value = w.value(t, k)
            sizes.append([t, len(S.canonical(value)), len(S.canonical(dict(physical_key=k, value=value)))])
            check(sizes[-1][1] <= 16384 and sizes[-1][2] <= 16384, 'bounded MessagePack part and operation: ' + t)
        parts = w.coordinator.manifest_parts_of(scope, sel['migration_id'])
        members = [m for _, p in parts for m in p['members']]
        check(members == w.coordinator.manifest(w.coordinator.last_capture), 'ordered content-free manifest: each source then its origin')
        check(all(set(m) == {'owner', 'physical_key', 'schema_ref', 'sha256'} for m in members), 'no source body in the manifest')
        check(parts[0][1]['whole_manifest_sha256'] == sha(S.canonical(members)), 'whole manifest commitment')
        origin = w.binding.read_current(scope)['origin']['value']['record']
        check([a['complete_value_sha256'] for a in origin['original_source_members']] == [row_sha(p) for _, p in parts], 'origin anchors the parts')
        check(w.coordinator.exclusion(scope) is None, 'exclusion released atomically')
        gen = w.storage.cell_generation
        check(w.coordinator.read_result(sel) == res and w.storage.cell_generation == gen, 'passive read_result')
        return dict(members=len(keys), sizes=sizes, parts=len(parts))
    suite.positive(G, 'C6/pos/atomic_installation_first_domain', atomic_install)

    def join_with_head_cas():
        w, first = new(suite)
        run(w, first)
        scope = B.legacy_goal(w)
        sel = M.selector(scope)
        req = w.coordinator.capture(sel)
        head = w.cell(w.binding.HEAD, w.binding.head_key())
        generation = w.storage.cell_generation
        res = w.coordinator.commit(req)
        check(w.storage.cell_generation == generation + 1, 'one transaction')
        check(w.cell(w.binding.HEAD, w.binding.head_key()) == head, 'whole head unchanged (checked, not rewritten)')
        check(res['writer_domain'] == req['expected_writer_domain'], 'joined the actual installed domain')
        return dict(joined=True)
    suite.positive(G, 'C6/pos/join_installed_domain_whole_head_cas', join_with_head_cas)

    def multipart():
        w, scope = new(suite)
        plan_bound(w, scope, schedules=12, consents=6)
        sel, req, res = run(w, scope)
        parts = w.coordinator.manifest_parts_of(scope, sel['migration_id'])
        check(len(parts) >= 2, 'manifest split into ordered parts')
        check([p['ordinal'] for _, p in parts] == list(range(len(parts))) and all(p['part_count'] == len(parts) for _, p in parts), 'ordinals')
        for key, part in parts:
            check(len(S.canonical(dict(physical_key=key, value=part))) <= 16384, 'each part operation <= 16 KiB')
        members = [m for _, p in parts for m in p['members']]
        check(members == w.coordinator.manifest(w.coordinator.last_capture), 'concatenated parts are the complete ordered manifest')
        return dict(parts=len(parts), members=len(members))
    suite.positive(G, 'C6/pos/multipart_manifest', multipart)

    def replay():
        w, scope = new(suite)
        sel, req, res = run(w, scope)
        generation = w.storage.cell_generation
        again = w.coordinator.commit(copy.deepcopy(req))
        check(again == res and w.storage.cell_generation == generation, 'identical capture returns the first result, no effect')
        return dict(replay=True)
    suite.positive(G, 'C6/pos/exact_replay_returns_first_result', replay)

    def lost_ack():
        w, scope = new(suite)
        sel = M.selector(scope)
        req = w.coordinator.capture(sel)
        try:
            w.coordinator.commit(req, lose_ack=True)
            raise AssertionError('acknowledgement not lost')
        except M.Refusal as error:
            check(error.code == 'M/commit/ack_lost', 'lost acknowledgement')
        recovered = w.coordinator.recover(sel)
        check(recovered['disposition'] == 'enrolled', 'recover resolves the committed result from Storage')
        generation = w.storage.cell_generation
        check(w.coordinator.commit(req) == recovered and w.storage.cell_generation == generation, 'retry replays; never a second birth')
        try:
            w.coordinator.capture(sel)
            raise AssertionError('recapture after commit')
        except M.Refusal as error:
            check(error.code == 'M/capture/result_exists', 'no recapture under the committed identity')
        return dict(recovered=True)
    suite.positive(G, 'C6/pos/lost_acknowledgement_resolved_from_storage', lost_ack)

    def recover_uncommitted():
        w, scope = new(suite)
        sel = M.selector(scope)
        w.coordinator.capture(sel)
        try:
            w.coordinator.recover(sel)
            raise AssertionError('recover invented a result')
        except M.Refusal as error:
            check(error.code == 'M/recover/not_committed', 'not committed')
        check(w.coordinator.exclusion(scope) is None, 'stale exclusion released')
        check(w.cell(w.binding.CONTROL, w.binding.keys(scope)['control']) is None, 'no enrollment exposed')
        res = w.coordinator.commit(w.coordinator.capture(sel))
        check(res['disposition'] == 'enrolled', 'fresh capture under the same identity enrolls once')
        return dict(not_committed=True)
    suite.positive(G, 'C6/pos/recover_uncommitted_never_births', recover_uncommitted)

    def concurrent_stop_between():
        w, scope = new(suite)
        sel = M.selector(scope)
        req = w.coordinator.capture(sel)
        w.host_stop.manual(scope, 'stop')
        stop_cell = w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
        try:
            w.coordinator.commit(req)
            raise AssertionError('stale capture committed')
        except M.Refusal as error:
            check(error.code == 'M/commit/independent_capture', 'commit refuses the older capture')
        check(w.cell(w.host_stop.FAMILY, w.host_stop.key(scope)) == stop_cell, 'the concurrent Stop is not overwritten')
        check(w.cell(w.binding.CONTROL, w.binding.keys(scope)['control']) is None, 'nothing enrolled')
        req2 = w.coordinator.capture(sel)
        res = w.coordinator.commit(req2)
        check(res['original_stop'] == dict(user_stop_epoch=2, continuation_epoch=1, stop_latched=True), 'the newer domain is enrolled')
        return res['original_stop']
    suite.positive(G, 'C6/pos/concurrent_stop_between_capture_and_commit', concurrent_stop_between)

    def disposed():
        w, scope = new(suite)
        pid, rid = plan_bound(w, scope, schedules=1, consents=1)
        sel, req, res = run(w, scope)
        w.plans.transition_run(scope, pid, rid, 'completed')
        for key in list(w.storage.cells.get('quota_resume_consent', {})):
            w.write([dict(table='quota_resume_consent', key=key, expected=w.cell('quota_resume_consent', key)['version'], delete=True)])
        w.goal.set_state(scope, 'paused')
        generation = w.storage.cell_generation
        check(w.coordinator.read_result(sel) == res and w.storage.cell_generation == generation, 'original result readable after disposal')
        try:
            w.coordinator.capture(M.selector(scope))
            raise AssertionError('recaptured')
        except M.Refusal as error:
            check(error.code == 'M/capture/already_enrolled', 'disposed mutable content is never re-required')
        return dict(read_after_disposal=True)
    suite.positive(G, 'C6/pos/passive_result_read_after_disposed_mutable_content', disposed)

    def blocked_publication():
        w, scope = new(suite)
        run_id = w.workflows.attach(scope)
        w.workflows.begin_pending(scope, run_id)
        sel = M.selector(scope)
        req = w.coordinator.capture(sel)
        generation = w.storage.cell_generation
        res = w.coordinator.commit(req)
        check(w.storage.cell_generation == generation + 1, 'one transaction')
        check(res['disposition'] == 'blocked_unresolved' and res['published_members'] == [], 'blocked result')
        check(w.value(w.binding.HEAD, w.binding.head_key()) is None and w.cell(w.binding.CONTROL, w.binding.keys(scope)['control']) is None,
              'no domain and no binding installed')
        check(w.goal.control(scope)['value']['record']['schema_id'] == 'pm.goal.body_control.v1', 'control not migrated')
        check(res['writer_domain'] == req['expected_writer_domain'], 'records the actual pre-migration selector')
        check(w.coordinator.read_result(sel) == res, 'blocked result readable')
        route = C1.NoAssociationCancel(w, birth=False)
        check(route is not None, 'route object')
        return dict(pending=res['pending_operation_ids'])
    suite.positive(G, 'C6/pos/blocked_unresolved_result_and_manifest_only', blocked_publication)

    def withdraw_committed():
        w, scope = new(suite)
        w.host_stop.manual(scope, 'stop')
        pending = w.goal.reserve_pending(scope, w.host_stop.record(scope)['user_stop_epoch'])
        sel, req, res = run(w, scope)
        binding_before = copy.deepcopy([w.cell(t, k) for t, k in ((w.binding.CONTROL, w.binding.keys(scope)['control']),
                                                                   (w.binding.REVISION, w.binding.keys(scope, 0)['revision']))])
        stop_before = w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
        result_cell = w.cell(M.RESULT, w.coordinator.result_key(scope, sel['migration_id']))
        wreq = withdrawal_request(w, scope, sel['migration_id'])
        out = w.coordinator.withdraw(wreq)
        check(out['disposition'] == 'withdrawn' and out['original_result'] == wreq['expected_original_result'], 'withdrawal result')
        check(out['preserved_pending_operation_ids'] == [pending['operation_id']], 'pending work preserved')
        check(w.cell(M.RESULT, w.coordinator.result_key(scope, sel['migration_id'])) == result_cell, 'original result never replaced')
        check([w.cell(t, k) for t, k in ((w.binding.CONTROL, w.binding.keys(scope)['control']),
                                          (w.binding.REVISION, w.binding.keys(scope, 0)['revision']))] == binding_before, 'never rolled back to empty')
        check(w.cell(w.host_stop.FAMILY, w.host_stop.key(scope)) == stop_before, 'old Stop not cleared')
        check(w.binding.domain_withdrawn is True, 'SP-423 writer cutoff recorded')
        check(w.coordinator.read_result(sel) == res, 'retained result stays audit-readable')
        generation = w.storage.cell_generation
        check(w.coordinator.withdraw(copy.deepcopy(wreq)) == out and w.storage.cell_generation == generation, 'withdrawal replay is immutable')
        return dict(preserved=out['preserved_pending_operation_ids'])
    suite.positive(G, 'C6/pos/withdraw_committed_preserves_result_binding_stop_pending', withdraw_committed)

    def withdraw_uncommitted():
        w, scope = new(suite)
        pid, rid = plan_bound(w, scope, schedules=0, consents=0, callbacks=1)
        sel = M.selector(scope)
        req = w.coordinator.capture(sel)
        out = w.coordinator.withdraw(withdrawal_request(w, scope, sel['migration_id'], original=None))
        check(out['original_result'] is None and w.coordinator.exclusion(scope) is None, 'live capture revoked; null only when uncommitted')
        check(out['preserved_pending_operation_ids'] == req['owner_mappings'][4]['pending_operations'], 'in-flight callback preserved')
        try:
            w.coordinator.commit(req)
            raise AssertionError('committed after withdrawal')
        except M.Refusal as error:
            check(error.code == 'M/commit/exclusion_not_held', 'withdrawn capture cannot commit')
        return dict(preserved=out['preserved_pending_operation_ids'])
    suite.positive(G, 'C6/pos/withdraw_uncommitted_revokes_live_capture', withdraw_uncommitted)

    def blocked_withdrawn():
        w, scope = new(suite)
        plan_bound(w, scope, schedules=0, consents=0, callbacks=1)
        sel, req, res = run(w, scope)
        out = w.coordinator.withdraw(withdrawal_request(w, scope, sel['migration_id']))
        check(out['preserved_pending_operation_ids'] == res['pending_operation_ids'] and not w.storage.cells.get(B.CUTOFF), 'blocked: no cutoff')
        check(w.coordinator.read_result(sel) == res, 'blocked result unchanged')
        return dict(preserved=out['preserved_pending_operation_ids'])
    suite.positive(G, 'C6/pos/withdraw_blocked_result', blocked_withdrawn)

    def c1_after_enrollment():
        w, scope = new(suite, revisions=2)
        before_goal = goal_physical(w, scope)
        sel, req, res = run(w, scope)
        route = c1_route(w, scope)
        route.run()
        check(route.display() == 'cancelled', 'the enrolled Goal cancels through its own unchanged route')
        for (f, k), value in before_goal.items():
            if f != 'goal_body_control':
                check(phys(w, f, k) == value, 'original Goal originals byte-exact through cancellation: ' + f)
        check(w.coordinator.read_result(sel) == res, 'migration result unchanged; migration not rerun')
        return dict(cancelled=True)
    suite.positive(G, 'C6/pos/enrolled_goal_cancels_through_dg_ca_c1_route', c1_after_enrollment)

    def reinstall():
        w, scope = new(suite)
        sel, req, res = run(w, scope)
        other = B.legacy_goal(w)
        sel2, req2, res2 = run(w, other)
        w.coordinator.withdraw(withdrawal_request(w, scope, sel['migration_id']))
        dsel = w.coordinator.reinstall([scope, other])
        check(w.binding.domain_generation == 2 and w.binding.domain_withdrawn is False, 'new writer-domain admission')
        for s in (scope, other):
            read = w.binding.read_current(s)
            rev, origin = read['revision']['value']['record'], read['origin']['value']['record']
            check(rev['binding_revision'] == 1 and rev['writer_domain'] == dsel, 'binding remapped under the new domain')
            check(origin['original_source_members'][0]['physical_key'] == w.binding.keys(s, 0)['revision'], 'complete source mapping recorded')
        route = c1_route(w, scope)
        route.capture_source()
        check(w.coordinator.read_result(sel) == res and w.coordinator.read_result(sel2) == res2, 'original results remain readable')
        return dict(generation=2)
    suite.positive(G, 'C6/pos/fresh_reinstall_after_withdrawal', reinstall)

    if os.environ.get('PM_DG_CB_SKIP_CRASH') != '1':
        rows = CRASH.matrix()
        for row in rows:
            def fn(row=row):
                check(row['status'] == 'pass', row.get('error', 'crash row failed'))
                return {k: row.get(k) for k in ('exit', 'read', 'reentry')}
            suite.positive(G, 'C6/pos/crash/%s' % (row['cut'] or 'control'), fn)


# ------------------------------------------------------------------ negatives

def negatives(suite):
    def neg(name, setup, expected, boundary):
        suite.negative(G, name, setup, expected, boundary=boundary)

    def captured(**kw):
        w, scope = new(suite, **kw)
        sel = M.selector(scope)
        return w, scope, sel, w.coordinator.capture(sel)

    def no_exclusion():
        w, scope, sel, req = captured()
        w.coordinator.withdraw(withdrawal_request(w, scope, sel['migration_id'], original=None))
        return w, lambda: w.coordinator.commit(req)
    neg('C6/neg/commit_without_held_exclusion', no_exclusion, 'M/commit/exclusion_not_held', 'commit/entry')

    def altered(name, fn, expected='M/commit/independent_capture'):
        def setup():
            w, scope, sel, req = captured(revisions=2)
            bad = fn(w, copy.deepcopy(req))
            return w, lambda: w.coordinator.commit(bad)
        neg('C6/neg/caller_request/' + name, setup, expected, 'commit/entry')

    def drop_image(w, r):
        r['owner_mappings'][0]['sources'] = r['owner_mappings'][0]['sources'][1:]
        return r
    altered('dropped_source_image', drop_image)

    def flip(w, r):
        image = r['owner_mappings'][0]['sources'][0]
        raw = bytes.fromhex(image['bytes_hex'])
        raw = raw[:-2] + bytes([raw[-2] ^ 1]) + raw[-1:]
        image['bytes_hex'], image['selection']['sha256'] = raw.hex(), sha(raw)
        return r
    altered('substituted_source_bytes_coherent_hash', flip)

    def domain(w, r):
        r['expected_writer_domain']['sha256'] = sha(b'TEST_ONLY:substituted-domain')
        return r
    altered('substituted_expected_writer_domain', domain)

    def reorder(w, r):
        r['owner_mappings'][2], r['owner_mappings'][3] = r['owner_mappings'][3], r['owner_mappings'][2]
        return r
    altered('mapping_order_substituted', reorder)

    def extra_receipt(w, r):
        r['owner_mappings'][0]['prior_receipts'].append(copy.deepcopy(r['owner_mappings'][0]['prior_receipts'][0]))
        return r
    altered('duplicated_prior_receipt', extra_receipt)

    def pending_added(w, r):
        r['owner_mappings'][5]['pending_operations'] = ['TEST_ONLY:op-never-issued']
        return r
    altered('invented_pending_operation', pending_added)
    altered('extra_member', lambda w, r: dict(r, enrolled=True), 'contracts/MigrationRequest/schema/')

    def replay_conflict():
        w, scope = new(suite, revisions=2)
        sel, req, res = run(w, scope)
        bad = drop_image(w, copy.deepcopy(req))
        return w, lambda: w.coordinator.commit(bad)
    neg('C6/neg/replay_with_altered_capture_conflicts', replay_conflict, 'M/commit/replay_conflict', 'commit/replay')

    def destination_present():
        w, scope, sel, req = captured()
        key = w.binding.keys(scope)['control']
        w.write([w.put(w.binding.CONTROL, key, dict(schema_id='pm.test_only.foreign_binding_control.v1', qualification='TEST_ONLY'))])
        mark(w, w.binding.CONTROL, key)
        return w, lambda: w.coordinator.commit(req)
    neg('C6/neg/destination_member_already_present', destination_present, 'M/commit/destination_present', 'commit/final')

    def concurrent_domain():
        w, scope, sel, req = captured()
        other = B.legacy_goal(w)
        run(w, other)
        return w, lambda: w.coordinator.commit(req)
    neg('C6/neg/domain_installed_after_capture', concurrent_domain, 'M/commit/independent_capture', 'commit/head')

    def oversize():
        w, scope = new(suite, revisions=40)
        sel = M.selector(scope)
        req = w.coordinator.capture(sel)
        return w, lambda: w.coordinator.commit(req)
    neg('C6/neg/result_over_16kib_route_unavailable_before_enrollment', oversize, 'M/commit/stored_part_cap', 'commit/size')

    def permission():
        w, scope, sel, req = captured()
        decision = w.constants['decision:%s:%s' % (w.coordinator.owner_id, M.ADOPT)]
        w.permissions.revoke(decision)
        mark(w, w.permissions.FAMILY, decision)
        return w, lambda: w.coordinator.commit(req)
    neg('C6/neg/commit_permission_revoked', permission, 'M/commit/permission', 'commit/entry')

    def drift(name, point, hook, expected):
        def setup():
            w, scope, sel, req = captured()
            w.coordinator.inject[('commit', point)] = lambda c: hook(c, scope)
            return w, lambda: w.coordinator.commit(req)
        neg('C6/neg/boundary/%s/%s' % (point, name), setup, expected, 'commit/' + point)

    def h_registration(c, scope):
        c.world.registration.add_implementation('binding_restore', 'restore')
        mark(c.world, B.DISPATCH, c.world.registration.state_key())

    def h_maintenance(c, scope):
        c.world.maintenance.restore()

    def h_permission(c, scope):
        decision = c.world.constants['decision:%s:%s' % (c.owner_id, M.ADOPT)]
        c.world.permissions.revoke(decision)
        mark(c.world, c.world.permissions.FAMILY, decision)

    def h_goal(c, scope):
        writes = c.world.goal._mutation(scope, state='paused', kind='metadata_update')[0]
        c.world.write(writes)
        for wr in writes:
            mark(c.world, wr['table'], wr['key'])

    def h_stop(c, scope):
        c.world.host_stop.manual(scope, 'stop')
        for t in (c.world.host_stop.RECEIPTS, B.ORIGINS):
            for k in c.world.storage.cells.get(t, {}):
                mark(c.world, t, k)
        mark(c.world, c.world.host_stop.FAMILY, c.world.host_stop.key(scope))

    def h_plan_epoch(c, scope):
        c.world.plans.owner_epoch += 1

    drift('registration', 'after_derive', h_registration, 'M/commit/final_capture')
    drift('restore', 'after_derive', h_maintenance, 'M/commit/final_maintenance')
    drift('permission', 'after_derive', h_permission, 'M/commit/final_permission')
    drift('goal_writer_bypass', 'after_derive', h_goal, 'M/commit/final_capture')
    drift('concurrent_stop', 'after_derive', h_stop, 'M/commit/final_capture')
    for point in ('after_registration', 'after_goal', 'after_host_stop', 'after_plan', 'after_workflow', 'after_scheduler', 'after_sir', 'final'):
        drift('goal_writer_bypass', point, h_goal, 'M/commit/%s/goal' % point)
        drift('plan_owner_epoch', point, h_plan_epoch, 'M/commit/%s/plan' % point)
        drift('concurrent_stop', point, h_stop, 'M/commit/independent_capture')

    # recovery and passive reads
    def ambiguous():
        w, scope, sel, req = captured()
        key = w.binding.keys(scope, 0)['revision']
        w.write([w.put(w.binding.REVISION, key, dict(schema_id='pm.test_only.partial_member.v1', qualification='TEST_ONLY'))])
        mark(w, w.binding.REVISION, key)
        return w, lambda: w.coordinator.recover(sel)
    neg('C6/neg/recover_partial_destination_stays_unknown', ambiguous, 'M/recover/ambiguous_destination', 'recover')

    def enrolled(**kw):
        w, scope = new(suite, **kw)
        sel, req, res = run(w, scope)
        return w, scope, sel, res

    def no_audit():
        w, scope, sel, res = enrolled()
        auditor = 'TEST_ONLY:auditor-without-grant'
        return w, lambda: w.coordinator.read_result(sel, actor=auditor)
    neg('C6/neg/read_result_without_audit_permission', no_audit, 'M/read_result/audit_permission', 'read_result')

    def deleted():
        w, scope, sel, res = enrolled()
        w.maintenance.request_deletion(scope)
        return w, lambda: w.coordinator.read_result(sel)
    neg('C6/neg/read_result_after_deletion_request', deleted, 'M/read_result/deleted', 'read_result')

    def part_tamper(name, mutate, expected, schedules=0):
        def setup():
            w, scope = new(suite)
            if schedules:
                plan_bound(w, scope, schedules=schedules, consents=schedules // 2)
            sel, req, res = run(w, scope)
            parts = w.coordinator.manifest_parts_of(scope, sel['migration_id'])
            mutate(w, scope, sel, parts)
            return w, lambda: w.coordinator.read_result(sel)
        neg('C6/neg/manifest/' + name, setup, expected, 'read_result')

    def drop_part(w, scope, sel, parts):
        key = parts[0][0]
        w.write([dict(table=M.PART, key=key, expected=w.cell(M.PART, key)['version'], delete=True)])
        mark(w, M.PART, key)
    part_tamper('missing_part', drop_part, 'M/read_result/manifest_ordinal', schedules=12)

    def foreign_part(w, scope, sel, parts):
        key, part = parts[-1]
        w.write([w.put(M.PART, key, dict(part, migration_id='TEST_ONLY:foreign-migration'), expected=w.cell(M.PART, key)['version'])])
        mark(w, M.PART, key)
    part_tamper('foreign_part', foreign_part, 'M/read_result/manifest_identity')

    def coherent_member(w, scope, sel, parts):
        members = [m for _, p in parts for m in p['members']]
        members[0] = dict(members[0], sha256=sha(b'TEST_ONLY:substituted-member'))
        whole = sha(S.canonical(members))
        offset = 0
        for key, part in parts:
            n = len(part['members'])
            value = dict(part, members=members[offset:offset + n], whole_manifest_sha256=whole)
            offset += n
            w.write([w.put(M.PART, key, value, expected=w.cell(M.PART, key)['version'])])
            mark(w, M.PART, key)
    part_tamper('member_substituted_with_coherent_commitment', coherent_member, 'M/read_result/manifest_anchor')

    def reorder_parts(w, scope, sel, parts):
        (k0, p0), (k1, p1) = parts[0], parts[1]
        w.write([w.put(M.PART, k0, dict(p0, ordinal=1), expected=w.cell(M.PART, k0)['version']),
                 w.put(M.PART, k1, dict(p1, ordinal=0), expected=w.cell(M.PART, k1)['version'])])
        mark(w, M.PART, k0)
        mark(w, M.PART, k1)
    part_tamper('reordered_parts', reorder_parts, 'M/read_result/manifest_commitment', schedules=12)

    def revision_tamper():
        w, scope, sel, res = enrolled()
        key = w.binding.keys(scope, 0)['revision']
        cell = w.cell(w.binding.REVISION, key)
        value = copy.deepcopy(cell['value'])
        value['record']['host_execution_owner_epoch'] += 1
        w.write([w.put(w.binding.REVISION, key, value, expected=cell['version'])])
        mark(w, w.binding.REVISION, key)
        return w, lambda: w.coordinator.read_result(sel)
    neg('C6/neg/immutable_destination_substituted', revision_tamper, 'M/read_result/destination_hash', 'read_result')

    # withdrawal
    def wneg(name, build, expected):
        def setup():
            w, scope, sel, res = enrolled()
            return w, build(w, scope, sel, res)
        neg('C6/neg/withdraw/' + name, setup, expected, 'withdraw')
    wneg('null_original_while_committed', lambda w, s, sel, r: (lambda: w.coordinator.withdraw(
        withdrawal_request(w, s, sel['migration_id'], original=None))), 'M/withdraw/original_result')
    wneg('foreign_writer_domain', lambda w, s, sel, r: (lambda: w.coordinator.withdraw(withdrawal_request(
        w, s, sel['migration_id'], domain=dict(r['writer_domain'], sha256=sha(b'TEST_ONLY:other-domain'))))), 'M/withdraw/writer_domain')

    def revoke_withdraw(w, s, sel, r):
        decision = w.constants['decision:%s:%s' % (w.coordinator.owner_id, M.WITHDRAW)]
        w.permissions.revoke(decision)
        mark(w, w.permissions.FAMILY, decision)
        return lambda: w.coordinator.withdraw(withdrawal_request(w, s, sel['migration_id']))
    wneg('permission_revoked', revoke_withdraw, 'M/withdraw/permission')

    def replay_conflict_withdraw(w, s, sel, r):
        req = withdrawal_request(w, s, sel['migration_id'])
        w.coordinator.withdraw(req)
        for t in (M.WITHDRAWAL, B.CUTOFF):
            for k in w.storage.cells.get(t, {}):
                mark(w, t, k)
        bad = dict(req, expected_original_result=None)
        return lambda: w.coordinator.withdraw(bad)
    wneg('replay_with_altered_request', replay_conflict_withdraw, 'M/withdraw/replay_conflict')
    wneg('extra_member', lambda w, s, sel, r: (lambda: w.coordinator.withdraw(dict(withdrawal_request(w, s, sel['migration_id']), rollback=True))),
         'contracts/MigrationWithdrawalRequest/schema/')

    def after_withdrawal(name, action, expected):
        def setup():
            w, scope, sel, res = enrolled()
            route = c1_route(w, scope)
            held = route.hold_current_read()
            w.coordinator.withdraw(withdrawal_request(w, scope, sel['migration_id']))
            return w, lambda: action(w, scope, route, held)
        neg('C6/neg/after_withdrawal/' + name, setup, expected, 'sp423')
    after_withdrawal('c_source_writer_cutoff', lambda w, s, r, h: r.capture_source(), 'C1/capture_source/writer_cutoff')
    after_withdrawal('held_reader_invalidated', lambda w, s, r, h: r.release_held(h), 'C1/held_reader/withdrawn')
    after_withdrawal('binding_writer_refused', lambda w, s, r, h: w.binding.require_writer('binding_owner_transfer'), 'domain/writer_withdrawn')

    def reinstall_unwithdrawn():
        w, scope, sel, res = enrolled()
        return w, lambda: w.coordinator.reinstall([scope])
    neg('C6/neg/reinstall_without_withdrawal', reinstall_unwithdrawn, 'M/reinstall/domain_not_withdrawn', 'reinstall')

    def reinstall_permission():
        w, scope, sel, res = enrolled()
        w.coordinator.withdraw(withdrawal_request(w, scope, sel['migration_id']))
        decision = w.constants['decision:%s:%s' % (w.coordinator.owner_id, M.REINSTALL)]
        w.permissions.revoke(decision)
        for t in (M.WITHDRAWAL, B.CUTOFF):
            for k in w.storage.cells.get(t, {}):
                mark(w, t, k)
        mark(w, w.permissions.FAMILY, decision)
        return w, lambda: w.coordinator.reinstall([scope])
    neg('C6/neg/reinstall_permission_revoked', reinstall_permission, 'M/reinstall/permission', 'reinstall')


def cases(suite):
    positives(suite)
    negatives(suite)
