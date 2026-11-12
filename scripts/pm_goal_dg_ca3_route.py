#!/usr/bin/env python3
"""DG-CA3 C3: goal.cancelled original Workflow route (GRS-078) on DG-CA's framework (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

``WorkflowCancel`` subclasses DG-CA's ``AssignedCancel`` (so it uses the same
``World``/registry, the lease-aware ``LeasedStorage`` lineage, the SIR, host Stop,
Goal body and binding owners) and runs profile
``goal_workflow_cancel_late_assignment.v1`` in GRS-078's order:

1. C-source ``capture_source.v1`` (SourceCaptureEntry + BeforeStopNativeEntry)
2. ``prepare.v1`` after the read-back SIR acknowledgement: immutable BeforeStopReadiness,
   no fence and no sequence
3. C-stop ``latch_and_reserve.v1`` (StopPublicationEntry)
4. C-receipt ``commit_receipt.v1`` (CurrentStoppedGoalEntry + GoalControlPlaneAdmission)
5. the native owners: SchedulerStop, the effect owners' drain, D05 aggregation, positive D06
   prepare/publish (``pm_goal_dg_ca3_native``)
6. C-owners ``settle_owner.v1`` (OriginalOwnersEntry + OriginalOwnersNativeEntry):
   ScopeProof + workflow_settled in one transaction
7. C-event ``freeze_event.v1``
8-10. ``reserve_assignment.v1``, ``issue_assignment_audit.v1``, ``append_original.v1``
   (late assignment; ``pm_goal_dg_ca3_late``)
11. C-publish ``publish_control.v1``
12. ``terminal_succeeded.v1`` / ``terminal_unsettled.v1``; passive
   ``read_retained_success.v1`` / ``read_retained_unsettled.v1``

Every method acquires its whole private Goal and native arguments from the owners
at entry, validates them in their own isolated realm (``goal`` / ``native`` of
``cancel-workflow-resources.v2.json``), rechecks every source after each returning
helper and immediately before its single Storage transaction, and records
before/after observations through the shared recorder. Refusal codes are
``C3/<method>/<invariant>``.
"""
from __future__ import annotations

import copy
import json

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_current_writer_oracles import recipe
import pm_goal_dg_ca_owners as O
import pm_goal_dg_ca_c1 as C1
import pm_goal_dg_ca_assignment as AS
import pm_goal_dg_ca3_native as N
import pm_goal_dg_ca3_index as IX
from pm_goal_dg_ca_owners import (require, Refusal, uid, short_id, row_sha, same, sha, scoped_key, exact_numbers, transaction_record,
                                  QUALIFICATION, NATIVE_LINE, ROOT, BINDING, CANCEL)

WF = 'https://puppetmaster.local/proposals/goal_workflow_cancel_custody.v1.schema.json'
GA = 'https://puppetmaster.local/proposals/goal_workflow_cancel_goal_arguments.v1.schema.json#/$defs/'
CM = 'https://puppetmaster.local/proposals/goal_workflow_cancel_coordinator_metadata.v1.schema.json#/$defs/'
LA = 'https://puppetmaster.local/proposals/goal_workflow_cancel_assignment.v1.schema.json#/$defs/'
BODY = O.BODY
PROFILE = 'goal_workflow_cancel_late_assignment.v1'
PAYLOAD_SCHEMA = C1.PAYLOAD_SCHEMA
RESULT_SCHEMA_REF = dict(path='Plans/goal_runtime_workflow_cancel_contracts.schema.json', json_pointer='#/$defs/GoalCancelResultV3',
                         schema_id='pm.goal.cancel.result.v3')
READINESS, SCOPE_PROOF, LATE_AUDIT = ('goal_workflow_cancel_readiness', 'goal_workflow_cancel_scope_proof',
                                      'goal_workflow_cancel_late_assignment')


def gwrap(world, uri, name, record, key=None):
    """Whole stored wrapper validated in the Goal realm (constant members from the schema)."""
    schema = world.roots.banks['goal'].registry.resolver().lookup(uri + '#/$defs/' + name).contents
    if '$ref' in schema and 'required' not in schema:
        schema = world.roots.banks['goal'].registry.resolver().lookup(schema['$ref']).contents
    value = {}
    for field in schema['required']:
        prop = schema['properties'][field]
        if field == 'record':
            value[field] = record
        elif field == 'storage_instance_id':
            value[field] = world.storage_id
        elif field == 'physical_key':
            require('wrapper/key', type(key) is str and key != '')
            value[field] = key
        else:
            require('wrapper/const/' + field, 'const' in prop)
            value[field] = prop['const']
    world.roots.check('goal', uri + '#/$defs/' + name, value)
    return value


class WorkflowLeasedStorage(AS.LeasedStorage):
    """DG-CA's LeasedStorage plus Storage-assigned late EventRecord times (GRS-078 step 8).

    At the late assignment Storage assigns the complete EventRecord: the reserved sequence and its
    own two clock ticks, kept in the reservation record; the reserved append then uses exactly those
    values. Any other append ticks normally. Listed for the merge (lane-local; adapter untouched).
    """

    def transact(self, writes, **kwargs):
        """Committed versions stay resolvable by hash: a superseded version at a mutable key is retained custody."""
        out = super().transact(writes, **kwargs)
        history = self.__dict__.setdefault('version_history', {})
        for write in writes:
            if not write.get('delete'):
                history.setdefault((write['table'], write['key']), []).append(row_sha(write['value']))
        return out

    def committed_version(self, table, key, digest):
        """True when ``digest`` is a committed version of the key AND the current cell is its latest commit.

        A superseded version stays resolvable; a cell whose current bytes are not its own latest commit
        (an at-rest substitution) resolves nothing.
        """
        versions = self.__dict__.get('version_history', {}).get((table, key), [])
        cell = self.cell(table, key)
        return bool(versions) and cell is not None and row_sha(cell['value']) == versions[-1] and digest in versions

    def assign_late_times(self, operation_id):
        cell = self.cell(AS.RESERVATION_TABLE, operation_id)
        require('assignment/reservation_absent', cell is not None and cell['value']['state'] == 'reserved')
        if 'assigned_observed_at_utc' in cell['value']:
            return cell['value']['assigned_observed_at_utc'], cell['value']['assigned_persisted_at_utc']
        observed, persisted = self._tick(), self._tick()
        self.transact([dict(table=AS.RESERVATION_TABLE, key=operation_id, expected=cell['version'],
                            value=dict(cell['value'], assigned_observed_at_utc=observed, assigned_persisted_at_utc=persisted))])
        return observed, persisted

    def append(self, handle, candidates, *, durability_class='ordinary'):
        op = self._resolve_handle(handle, 'reservation')
        record = self.reservation_record(op)
        if record is None or record['state'] != 'reserved' or 'assigned_observed_at_utc' not in record:
            return super().append(handle, candidates, durability_class=durability_class)
        ticks = [record['assigned_observed_at_utc'], record['assigned_persisted_at_utc']]
        original = self._tick
        self._tick = lambda: ticks.pop(0) if ticks else original()
        try:
            return super().append(handle, candidates, durability_class=durability_class)
        finally:
            self._tick = original


def seglog_view(sources):
    """The seglog selection a held fence freezes: generation, segments, watermarks, ranges and sequence authority.

    ``selection_id`` hashes the TEST_ONLY commit CURRENT bytes, and the lane's
    ``source_generation_ref`` names that commit file. Batch 2 advances both on
    cell-only transactions while the selected seglog generation stays fixed.
    Exclude those publication locators here; keep every seglog generation,
    inventory, watermark, range, prefix and sequence-authority field.
    """
    manifest = copy.deepcopy(sources['manifest'])
    for entry in manifest['selection_entries']:
        entry.pop('selection_id', None)
        entry.pop('source_generation_ref', None)
    current = {k: v for k, v in sources['current'].items() if k != 'selection_id'}
    return S.canonical([current, manifest, sources['sequence_allocator']['current_lease']], 'C3/seglog_view')


def workflow_world(work, **kw):
    """DG-CA's ``assigned_world`` with the late-time Storage subclass and the native owners attached."""
    world = O.World(work, storage_cls=WorkflowLeasedStorage, **kw)
    world.seglog = AS.SeglogControlOwner(world)
    world.codecs = AS.CodecOwner(world)
    world.assigner = AS.AssignmentOwner(world)
    world.codecs.register()
    AS.prior_history(world)
    N.NativeWorld(world)
    world.index = IX.EventIndexOwner(world)
    world.index.publish()
    return world


class WorkflowCancel(AS.AssignedCancel):
    """GRS-078 Workflow route coordinator (C3)."""
    code = 'C3'

    def __init__(self, world, *, state='active', run_status='running', effects=None, **kw):
        self.run_status = run_status
        self.effect_plan = effects or {}
        self.readiness_key = None
        super().__init__(world, state=state, **kw)
        if kw.get('birth', True):
            self.attach_workflow()

    # ------------------------------------------------------------------ helpers (Workflow editions)
    def check(self, name, value, uri=WF):
        self.world.roots.check('goal', uri + '#/$defs/' + name, value)
        return exact_numbers(value, 'check')

    def wrap(self, name, record, key=None, uri=WF):
        return gwrap(self.world, uri, name, record, key)

    def gcheck(self, ref, value):
        self.world.roots.check('goal', ref, value)
        return exact_numbers(value, 'goal_root')

    def ncheck(self, ref, value):
        self.world.roots.check('native', ref, value)
        return exact_numbers(value, 'native_root')

    def h_arg(self, value):
        return sha(S.canonical(value, 'C3/argument'))

    def stored_value(self, table, key, code):
        value = self.world.value(table, key)
        require(code, value is not None)
        return value

    # ------------------------------------------------------------------ Workflow association setup
    def attach_workflow(self):
        """Native run, Start and effects, then commit_workflow_binding (rows 18, 20)."""
        w, n = self.world, self.world.native
        rs = n.run.reserve_identity(self.scope)
        if not n.writers.enrolled:
            n.writers.enroll(rs)
        self.wf_run = n.run.allocate(rs, self.scope, n.run.owner_id, n.run.owner_epoch)
        n.start.start(self.wf_run, self.scope, self.actor_ref)
        if self.run_status in N.TERMINAL:
            n.run.transition(self.wf_run, self.run_status, self.scope)
        n.effects.birth(self.wf_run, **self.effect_plan.get('birth', {}))
        self.commit_workflow_binding()

    def commit_workflow_binding(self):
        """reserve_binding (BindingPending) then commit_workflow_binding: original Workflow association + Goal join."""
        w, n = self.world, self.world.native
        with self.call('commit_workflow_binding') as slot:
            sel = w.binding.require_writer('workflow_attach')
            read = w.binding.read_current(self.scope)
            control = read['control']
            pointer, body, _ = n.run.current(self.wf_run)
            run_id = self.wf_run['run_scope']['goal_run_id']
            tx_id = uid('TEST_ONLY:workflow-binding-tx')
            association = dict(association_kind='workflow', active_run_ref=run_id,
                               original_run_source=N.phys_sel(w, n.run.BODY, pointer['body_key']),
                               execution_owner_ref=self.wf_run['execution_owner_ref'], execution_owner_epoch=self.wf_run['execution_owner_epoch'],
                               original_binding_transaction_id=tx_id)
            gk = dict(storage_instance_id=w.storage_id, **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')})
            revision = w.roots.check('producer', BINDING + '#/$defs/BindingRevision', dict(
                scope=gk, binding_revision=1, previous_revision=control['value']['record']['current_revision'], active_run_ref=run_id,
                associations=[association], host_execution_owner_ref=w.host_stop.owner_id, host_execution_owner_epoch=w.host_stop.owner_epoch,
                writer_domain=sel, original_goal_birth_or_binding_operation=tx_id))
            # reserve_binding: the BindingPending candidate is written first under control CAS.
            pending = w.roots.check('producer', BINDING + '#/$defs/BindingPending', dict(
                operation_id=tx_id, operation='workflow_attach', expected_control_sha256=row_sha(control['value']),
                expected_goal_body_sha256=row_sha(w.goal.body_cell(self.scope)['value']),
                expected_goal_control_sha256=row_sha(w.goal.control(self.scope)['value']),
                expected_stop_control_sha256=row_sha(w.host_stop.current(self.scope)['value']), expected_writer_domain=sel,
                candidate=revision, original_owner_ref=n.run.owner_id, original_owner_epoch=n.run.owner_epoch))
            ctl_key = w.binding.keys(self.scope)['control']
            pctl = dict(control['value']['record'], control_epoch=NR.uint64(control['value']['record']['control_epoch'] + 1, 'C3/binding_control'),
                        pending=pending)
            w.write([w.put(w.binding.CONTROL, ctl_key, w.binding.wrap('StorageBindingControl', ctl_key, pctl), expected=control['version'])])
            control = w.cell(w.binding.CONTROL, ctl_key)
            require('C3/commit_workflow_binding/pending_custody', same(control['value']['record']['pending'], pending))
            bk = w.binding.keys(self.scope, 1)
            rev_w = w.binding.wrap('StorageBindingRevision', bk['revision'], revision)
            _, decision = w.permissions.grant(n.run.owner_id, copy.deepcopy(self.scope), 'goal.execution_binding.workflow_attach')
            origin = w.roots.check('producer', BINDING + '#/$defs/BindingOrigin', dict(
                scope=gk, binding_revision=1, issued_revision_key=bk['revision'], issued_revision_sha256=row_sha(rev_w),
                before_control_sha256=row_sha(control['value']), original_goal_body_sha256=row_sha(w.goal.body_cell(self.scope)['value']),
                original_goal_control_sha256=row_sha(w.goal.control(self.scope)['value']),
                original_stop_control_sha256=row_sha(w.host_stop.current(self.scope)['value']),
                original_source_members=[association['original_run_source']],
                issuer=transaction_record(n.run, 'owner.goal.execution_binding.commit_workflow_binding.v1', tx_id,
                                          w.permissions.selection(decision), tx_id, run_id)))
            origin_w = w.binding.wrap('StorageBindingOrigin', bk['origin'], origin)
            psel = lambda family, key, value: dict(family_id=family, physical_key=key, schema_id=value['schema_id'],
                                                   schema_version=value['schema_version'], codec_id='pm.storage.canonical_msgpack.v1',
                                                   complete_value_sha256=row_sha(value))
            new_control = dict(control['value']['record'], control_epoch=NR.uint64(control['value']['record']['control_epoch'] + 1, 'C3/binding_control'),
                               binding_revision=1, current_revision=psel(w.binding.REVISION, bk['revision'], rev_w),
                               current_origin=psel(w.binding.ORIGIN, bk['origin'], origin_w), pending=None)
            w.roots.check('producer', BINDING + '#/$defs/BindingControl', new_control)
            require('C3/commit_workflow_binding/run_current', same(n.run.current(self.wf_run)[1], body))
            tx = w.write([w.put(w.binding.REVISION, bk['revision'], rev_w), w.put(w.binding.ORIGIN, bk['origin'], origin_w),
                          w.put(w.binding.CONTROL, ctl_key, w.binding.wrap('StorageBindingControl', ctl_key, new_control), expected=control['version'])])
            w.workflow_inventory.add(self.scope, 'workflow_association', dict(goal_run_id=run_id, binding_revision_key=bk['revision']))
            slot.set(dict(tx=tx['tx_id'], run=run_id))

    # ------------------------------------------------------------------ sources
    def observe_sources(self):
        out = super().observe_sources()
        w = self.world
        n = getattr(w, 'native', None)
        run = getattr(self, 'wf_run', None)
        if n is not None and run is not None:
            rid = run['run_scope']['goal_run_id']
            observe = A.observation_digest
            out['run'] = observe([w.cell(n.run.POINTER, 'run:' + N.k_hex(rid)), n.run.owner_epoch])
            out['writers'] = observe([w.cell('TEST_ONLY:native_writer_inventory', n.writers.inventory_key)])
            st = run.get('start') or {}
            out['start'] = observe([w.cell('workflow_start_commit', st.get('commit_key', '-')), w.cell('workflow_start_control', st.get('control_key', '-')),
                                    w.cell('workflow_start_origin', st.get('origin_key', '-'))])
        return out

    def native_sources(self):
        """Native whole-root participants re-read from their owners (BeforeStopNativeEntry)."""
        w, n = self.world, self.world.native
        birth = self.stored_value('executor_safestop_domain_birth', self.wf_run['birth_key'], 'C3/native/domain_birth_unavailable')
        return dict(current_start=n.start.current_start(self.wf_run), original_domain_birth=birth['value'],
                    reservation_lineage=copy.deepcopy(self.wf_run['lineage']),
                    registered_goal_terminal_writer=n.writers.inventory()['goal_stop'],
                    registered_workflow_terminal_writer=n.writers.inventory()['executor_cancel'])

    def before_stop_native(self, method):
        """BeforeStopNativeEntry: registrations checked against the exhaustive inventory and the domain birth."""
        w, n = self.world, self.world.native
        inventory = n.writers.inventory()
        for kind in ('goal_stop', 'executor_cancel'):
            require('C3/%s/native_writer_inventory' % method, kind in inventory)
        src = self.native_sources()
        birth = src['original_domain_birth']
        for name, kind in (('registered_goal_terminal_writer', 'goal_stop'), ('registered_workflow_terminal_writer', 'executor_cancel')):
            reg = src[name]
            require('C3/%s/native_writer_inventory' % method, kind in inventory and same(inventory[kind], reg))
            require('C3/%s/native_writer_domain' % method, any(same(r, reg) for r in birth['registered_writers']))
            require('C3/%s/native_writer_principal' % method, reg['principal']['native_root_ref'] == n.writers.native_root
                    and reg['principal']['native_host_boot_ref'] == w.storage.boot_session)
        require('C3/%s/native_domain_allocation' % method, birth['reservation_allocation'] == src['reservation_lineage']['allocation']['allocation_source'])
        require('C3/%s/native_run_scope' % method, birth['scope'] == self.wf_run['run_scope']
                and src['current_start']['value']['commit']['record']['scope'] == self.wf_run['run_scope'])
        N.verify_custody(w, birth, 'C3/%s/native_custody' % method)
        boundary = n.writers.boundary(w.goal, self.operation_id or 'pre-source')
        entry = self.ncheck(N.NA + 'BeforeStopNativeEntry', dict(src, actual_original_goal_boundary=boundary))
        return entry

    def control_plane(self, method):
        w, n = self.world, self.world.native
        birth = self.stored_value('executor_safestop_domain_birth', self.wf_run['birth_key'], 'C3/native/domain_birth_unavailable')
        reg = n.writers.inventory().get('goal_stop')
        require('C3/%s/control_plane_writer' % method, reg is not None and any(same(r, reg) for r in birth['value']['registered_writers']))
        return self.ncheck(N.NA + 'GoalControlPlaneAdmission', dict(original_domain_birth=birth['value'], registered_goal_terminal_writer=reg,
                                                                     actual_original_goal_boundary=n.writers.boundary(w.goal, self.operation_id)))

    def current_goal(self):
        """WholeCurrentGoalValues from the stored originals."""
        w = self.world
        read = w.binding.read_current(self.scope)
        control = w.goal.control(self.scope)['value']
        history = w.goal.history_cells(self.scope)
        latest = str(control['record']['latest_objective_revision'])
        hkey = 'goal_execution_writer_domain_head.v1:' + w.binding.storage_key()
        value = dict(body=w.goal.body_cell(self.scope)['value'], control=control, accepted_objective=history[latest][0]['value'],
                     accepted_origin=history[latest][1]['value'], stop=w.host_stop.current(self.scope)['value'],
                     binding_revision=read['revision']['value'], binding_origin=read['origin']['value'], binding_control=read['control']['value'],
                     writer_domain=read['domain'], writer_domain_head=w.value(w.binding.HEAD, hkey),
                     complete_accepted_history=[history[k][0]['value'] for k in sorted(history, key=int)],
                     complete_original_history_origins=[history[k][1]['value'] for k in sorted(history, key=int)])
        return self.gcheck(GA + 'WholeCurrentGoalValues', copy.deepcopy(value))

    def workflow_association(self, read):
        brev = read['revision']['value']['record']
        require('C3/association/count', len(brev['associations']) == 1 and brev['associations'][0]['association_kind'] == 'workflow')
        assoc = brev['associations'][0]
        require('C3/association/run', assoc['active_run_ref'] == brev['active_run_ref'] == self.wf_run['run_scope']['goal_run_id'])
        require('C3/association/owner', assoc['execution_owner_ref'] == self.wf_run['execution_owner_ref']
                and assoc['execution_owner_epoch'] == self.wf_run['execution_owner_epoch'])
        return assoc

    def progress_pair(self, method, phases):
        """CurrentProgressPair re-fetched under the Storage owner, phase checked."""
        w = self.world
        head = self.stored_value('goal_cancel_progress', self.key('goal_cancel_progress') + ':head', 'C3/%s/progress_head' % method)
        epoch = head['record']['progress_epoch']
        selected = self.stored_value('goal_cancel_progress', self.progress_key(epoch), 'C3/%s/progress_epoch' % method)
        require('C3/%s/progress_join' % method, head['record']['snapshot_sha256'] == row_sha(selected)
                and head['record']['operation_id'] == selected['record']['operation_id'] == self.operation_id)
        require('C3/%s/phase' % method, selected['record']['phase'] in phases and same(selected['record'], self.progress))
        return self.gcheck(GA + 'CurrentProgressPair', dict(current_head=head, current_selected_epoch=selected))

    # ------------------------------------------------------------------ C-source
    def capture_source(self, request=None, sir_handle=None):
        w, n = self.world, self.world.native
        request = copy.deepcopy(self.request if request is None else request)
        sir_handle = self.sir_handle if sir_handle is None else sir_handle
        with self.call('capture_source', dict(request=request)) as slot:
            entry = self.observe_sources()
            self.check('GoalCancelRequestV2', request)
            ref, accepted = A.acquire(w.registry, w.sir.owner_id, 'sir', sir_handle)
            require('C3/capture_source/accepted_dispatch', same(accepted['request'], request))
            require('C3/capture_source/accepted_custody', same(w.sir.stored(request['command_instance_id']), accepted))
            require('C3/capture_source/accepted_operation', accepted['identity']['operation_id'] == self.operation_id)
            require('C3/capture_source/sir_epoch', accepted['owner_epoch'] == w.sir.owner_epoch)
            existing = w.value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'))
            if existing is not None:
                require('C3/capture_source/retry_conflict', same(existing['record']['request'], request))
                slot.set(dict(replay=True))
                return copy.deepcopy(existing['record'])
            require('C3/capture_source/writer_cutoff', w.binding.domain_withdrawn is False)
            require('C3/capture_source/permission', w.permissions.allowed(request['permission_snapshot_ref'], request['actor_ref'], 'goal.cancel'))
            snapshot = w.goal.snapshot(self.scope)
            body = snapshot['body']
            control_cell = w.goal.control(self.scope)
            control = control_cell['value']['record']
            require('C3/capture_source/scope', all(request[k] == self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')))
            require('C3/capture_source/legal_state', body['state'] in C1.LEGAL_STATES)
            require('C3/capture_source/not_cancelled', control['cancellation_receipt_ref'] is None)
            require('C3/capture_source/not_pending_cancel', control['cancellation_pending'] is None)
            require('C3/capture_source/expected_revision', request['expected_revision'] == body['revision'])
            require('C3/capture_source/expected_currentness', request['expected_currentness_hash'] == body['currentness_hash'])
            require('C3/capture_source/pending_unresolved', control['pending'] is None)
            read = w.binding.read_current(self.scope)
            self.at('capture_source', 'after_binding_read')
            self.recheck('capture_source', 'after_binding_read', entry)
            assoc = self.workflow_association(read)
            require('C3/capture_source/binding_pending', read['control']['value']['record']['pending'] is None)
            native = self.before_stop_native('capture_source')
            self.at('capture_source', 'after_native_read')
            self.recheck('capture_source', 'after_native_read', entry)
            require('C3/capture_source/current_start_run', native['current_start']['value']['commit']['record']['scope']['goal_run_id']
                    == assoc['active_run_ref'])
            stop = w.host_stop.record(self.scope)
            self.at('capture_source', 'after_stop_read')
            self.recheck('capture_source', 'after_stop_read', entry)
            history = w.goal.history_cells(self.scope)
            inventory = [dict(revision_key=w.goal.keys(self.scope, int(k))['revision'], revision_outer_sha256=row_sha(c[0]['value']),
                              origin_key=w.goal.keys(self.scope, int(k))['origin'], origin_outer_sha256=row_sha(c[1]['value']))
                         for k, c in sorted(history.items(), key=lambda x: int(x[0]))]
            gk = w.goal.keys(self.scope)
            selection_key = self.key('goal_cancel_binding_selection')
            binding = self.check('ExecutionBinding', dict(kind='no_bound_plan', active_run_ref=assoc['active_run_ref'], goal_plan_binding_ref=None,
                                 goal_plan_binding_sha256=None, assistant_plan_id=None, plan_run_id=None, plan_version=None, plan_hash=None,
                                 execution_owner_ref=assoc['execution_owner_ref'], original_binding_source_ref=selection_key))
            body_selection = self.check('BodySelection', {**self.scope, 'body_key': gk['body'],
                'body_outer_sha256': row_sha(w.goal.body_cell(self.scope)['value']), 'body_semantic_sha256': control['body_sha256'],
                'revision': body['revision'], 'currentness_hash': body['currentness_hash'], 'control_key': gk['control'],
                'control_outer_sha256': row_sha(control_cell['value']), 'control_epoch': control['control_epoch'],
                'latest_objective_revision': control['latest_objective_revision'], 'latest_revision_hash': control['latest_revision_hash'],
                'origin_key': control['origin_key'], 'complete_history_origin_inventory_sha256': self.h(inventory),
                'state': body['state'], 'active_run_ref': body['active_run_ref']})
            self.event_id, self.event_key = recipe('goal.cancelled', {**self.scope, 'command_id': C1.COMMAND,
                                                   'command_instance_id': request['command_instance_id'], 'operation_id': self.operation_id})
            metadata = self.check('ProducerMetadata', dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
                event_id=self.event_id, event_type='goal.cancelled', project_id=self.scope['project_id'], thread_id=self.scope['thread_id'],
                run_id=None, node_id=None, attempt_id=None, actor_ref=request['actor_ref'], requested_account_ref=None,
                effective_account_ref=None, occurred_at_utc=w.sir.clock.now(), producer_sequence_id=None,
                correlation_id=accepted['dispatch_id'], causation_event_id=None, parent_event_id=None, idempotency_key=self.event_key,
                payload_schema_id=PAYLOAD_SCHEMA, payload_ref=None, redaction_profile='no_secrets',
                replay_policy='dedupe_by_idempotency_key', migration=dict(migrated_from_schema_id=None,
                    migrated_from_schema_version=None, migration_id=None, compatibility_event_type=None)))
            source = self.check('SourceAudit', dict(schema_id='pm.goal.cancel.source_audit.v1', schema_version='1.0.0', **self.scope,
                request=request, normalized_identity=accepted['identity'], dispatch_id=accepted['dispatch_id'],
                command_outcome_ref=accepted['command_outcome_ref'], nonterminal_outcome=accepted['nonterminal'],
                original_user_cancel_acceptance_ref=accepted['acceptance_ref'], source_authority_ref=accepted['source_authority_ref'],
                source_authority_epoch=accepted['owner_epoch'], original_body=body_selection, original_execution_binding=binding,
                original_stop_control_sha256=row_sha(w.host_stop.current(self.scope)['value']),
                captured_user_stop_epoch=stop['user_stop_epoch'], captured_continuation_epoch=stop['continuation_epoch'],
                producer_metadata=metadata, captured_at=w.goal.clock.now()))
            source_w = self.wrap('StorageSourceAudit', source)
            self.gcheck(GA + 'WorkflowSourceAudit', source_w)
            progress = self.check('Progress', dict(schema_id='pm.goal.cancel.progress.v2', schema_version='2.0.0', **self.scope,
                operation_id=self.operation_id, source_audit_sha256=row_sha(source_w), progress_epoch=0, phase='source_admitted',
                stop_intent=None, stop_receipt=None, reservation_sha256=None, cancellation_receipt=None, owner_settlement=None,
                producer_input=None, publication=None, control_publication=None, resolution_owner_ref=self.coordinator_id))
            reader = transaction_record(w.binding, 'owner.goal.execution_binding.read_current_for_cancel.v1', self.operation_id,
                                        w.permissions.selection(self.cancel_decision), uid('TEST_ONLY:binding-read-tx'), selection_key)
            bsel = lambda family, cell: dict(family_id=family, physical_key=cell['value']['physical_key'], schema_id=cell['value']['schema_id'],
                                             schema_version=cell['value']['schema_version'], codec_id='pm.storage.canonical_msgpack.v1',
                                             complete_value_sha256=row_sha(cell['value']))
            hkey = 'goal_execution_writer_domain_head.v1:' + w.binding.storage_key()
            selection = w.roots.check('goal', BINDING + '#/$defs/BindingSelection', dict(scope=copy.deepcopy(self.scope), operation_id=self.operation_id,
                original_command_instance_id=request['command_instance_id'], original_dispatch_id=accepted['dispatch_id'],
                binding_control=bsel(w.binding.CONTROL, read['control']), binding_revision=bsel(w.binding.REVISION, read['revision']),
                binding_origin=bsel(w.binding.ORIGIN, read['origin']), writer_domain_head=bsel(w.binding.HEAD, w.cell(w.binding.HEAD, hkey)),
                writer_domain=read['domain_selection'], original_goal_body_sha256=body_selection['body_outer_sha256'],
                original_goal_control_sha256=body_selection['control_outer_sha256'],
                original_stop_control_sha256=source['original_stop_control_sha256'], actual_active_run_ref=assoc['active_run_ref'],
                original_pending_binding_operation_id=None, original_pending_binding_candidate_sha256=None, association_count=1,
                disposition='workflow_requires_owner_disposition', original_reader=reader))
            selection_w = gwrap(w, BINDING, 'StorageBindingSelection', selection, selection_key)
            goal_entry = self.gcheck(GA + 'SourceCaptureEntry', dict(request=request, normalized_identity=accepted['identity'],
                original_nonterminal_outcome=accepted['nonterminal'], producer_metadata=metadata, current_goal=self.current_goal(),
                binding_selection_candidate=selection_w))
            head = self._head(0, progress)
            self.at('capture_source', 'final')
            self.recheck('capture_source', 'final', entry)
            writes = [w.put('goal_cancel_source_audit', self.key('goal_cancel_source_audit'), source_w),
                      w.put('goal_cancel_progress', self.progress_key(0), self.wrap('StorageProgress', progress)),
                      w.put('goal_cancel_progress', self.key('goal_cancel_progress') + ':head', self.wrap('StorageProgress', head)),
                      w.put('goal_cancel_binding_selection', selection_key, selection_w)]
            tx = w.write(writes)
            self.source, self.progress = source, progress
            self.capture_args = dict(goal_sha256=self.h_arg(goal_entry), native_sha256=self.h_arg(native))
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(source)

    def _head(self, epoch, progress):
        return self.check('ProgressHead', dict(schema_id='pm.goal.cancel.progress_head.v2', schema_version='2.0.0', **self.scope,
                          operation_id=self.operation_id, progress_epoch=epoch,
                          snapshot_sha256=row_sha(self.wrap('StorageProgress', progress))))

    def _require_progress(self, method, phases):
        self.progress_pair(method, phases)
        source = self.world.value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'))
        require('C3/%s/source_custody' % method, source is not None and same(source['record'], self.source)
                and row_sha(source) == self.progress['source_audit_sha256'])

    def _progress(self, phase, **updates):
        value = copy.deepcopy(self.progress)
        value.update(phase=phase, progress_epoch=NR.uint64(value['progress_epoch'] + 1, 'C3/progress_epoch'), **updates)
        return self.check('Progress', value)

    # ------------------------------------------------------------------ late template and numeric inventory
    def late_template(self):
        """The complete fixed Event template: sequence is the late Storage integer, two Storage times, receipt hash."""
        producer = self.expected_producer()
        tree = AS.term(dict(producer, sequence_id=0, observed_at_utc='', persisted_at_utc=''))
        for member in tree['members']:
            if member['key'] == 'sequence_id':
                member['value'] = dict(kind='late_storage_integer', field='sequence_id',
                                       original_owner_method='owner.storage.goal_workflow_cancel.reserve_assignment.v1')
            if member['key'] in ('observed_at_utc', 'persisted_at_utc'):
                member['value'] = dict(term='original_timestamp', source_slot='event.' + member['key'])
            if member['key'] == 'payload':
                for inner in member['value']['members']:
                    if inner['key'] == 'cancellation_receipt_sha256':
                        inner['value'] = dict(term='original_sha256', source_slot='cancellation_receipt_sha256', encoded_utf8_bytes=64)
        return tree

    def numeric_inventory(self, reservation=None):
        """Workflow numeric-paths.json: known domains before Stop; late Storage paths classified, valued only after reservation."""
        raw = (ROOT / 'Plans/goal_workflow_cancel_contracts/numeric-paths.json').read_bytes()
        inv = json.loads(raw)
        src, ack = self.source, self.acknowledged
        control = self.source['original_body']
        control_epoch = self.source_control_epoch
        single = lambda v: [dict(minimum=v, maximum=v, step=1)]
        known, late = [], []
        for row in inv['derivation_inventory']:
            d = row.get('source_derivation') or ''
            target, branch, pointer = AS.TARGETS[row['root']], row['root'], row['path']
            if row['admission_phase'] == 'actual_post_owner_goal_append_before_effect':
                late.append(dict(target=target, schema_branch=branch, json_pointer=pointer,
                                 original_owner_method='owner.storage.goal_workflow_cancel.reserve_assignment.v1',
                                 admission_phase='actual_post_owner_before_goal_append'))
                continue
            if pointer.endswith('plan_version') or pointer == '/producer_sequence_id':
                continue
            if 'original_body.revision' in d:
                kind, role, sp, off, vals = 'original_integer_plus_offsets', 'source_audit', '/original_body/revision', [0], single(src['original_body']['revision'])
            elif 'captured_user_stop_epoch + 1' in d:
                kind, role, sp, off, vals = 'original_integer_plus_offsets', 'source_audit', '/captured_user_stop_epoch', [1], single(src['captured_user_stop_epoch'] + 1)
            elif 'control_epoch + 2' in d:
                kind, role, sp, off, vals = 'original_integer_plus_offsets', 'original_goal_control', '/control_epoch', [2], single(control_epoch + 2)
            elif 'control_epoch + 1' in d:
                kind, role, sp, off, vals = 'original_integer_plus_offsets', 'original_goal_control', '/control_epoch', [1], single(control_epoch + 1)
            elif 'original_fixed_progress_epochs' in d:
                kind, role, sp, off, vals = 'original_finite_progress_set', 'assignment_input', '/original_fixed_progress_epochs', [0], [dict(minimum=0, maximum=7, step=1)]
            elif 'acknowledgement_frame_offset' in d:
                kind, role, sp, off, vals = 'original_integer_plus_offsets', 'original_sir_outcome', '/acknowledgement_frame_offset', [0], single(ack['acknowledgement_frame_offset'])
            elif 'operation_generation' in d:
                kind, role, sp, off, vals = 'original_integer_plus_offsets', 'original_sir_outcome', '/identity/operation_generation', [0], single(ack['identity']['operation_generation'])
            elif 'topology_generation' in d:
                kind, role, sp, off, vals = 'original_integer_plus_offsets', 'original_sir_outcome', '/identity/topology_generation', [0], single(ack['identity']['topology_generation'])
            elif 'target_generation' in d:
                kind, role, sp, off, vals = 'original_integer_plus_offsets', 'original_sir_outcome', '/target_generation', [0], single(ack['target_generation'])
            else:
                raise Refusal('C3/numeric/derivation_unmapped' + pointer)
            known.append(dict(target=target, schema_branch=branch, json_pointer=pointer, values=vals,
                              original_derivation=dict(kind=kind, source_role=role, source_json_pointer=sp, additive_offsets=off)))
        late.append(dict(target='event_value', schema_branch='EventRecord', json_pointer='/sequence_id',
                         original_owner_method='owner.storage.goal_workflow_cancel.reserve_assignment.v1',
                         admission_phase='actual_post_owner_before_goal_append'))
        order = lambda r: (r['target'], r['schema_branch'], r['json_pointer'].encode('utf-8'))
        known.sort(key=order)
        late.sort(key=order)
        if reservation is None:
            return dict(known_paths=known, late_storage_paths=late, complete_original_schema_inventory_sha256=sha(raw))
        # after the actual late reservation: every late path receives its actual reserved domain
        rs = reservation
        actual = {'byte_offset': ('/byte_offset', single(rs['byte_offset'])), 'durable_end_offset': ('/durable_end_offset_domain', [rs['durable_end_offset_domain']]),
                  'manifest_generation': ('/selected_manifest_generation', single(rs['selected_manifest_generation'])),
                  'segment_generation': ('/selected_segment_generation', single(rs['selected_segment_generation'])),
                  'sequence_id': ('/reserved_sequence_id', single(rs['reserved_sequence_id']))}
        out = list(known)
        for row in late:
            field = row['json_pointer'].rsplit('/', 1)[-1]
            sp, vals = actual[field]
            out.append(dict(target=row['target'], schema_branch=row['schema_branch'], json_pointer=row['json_pointer'], values=vals,
                            original_derivation=dict(kind='original_reserved_domain', source_role='append_reservation', source_json_pointer=sp,
                                                     additive_offsets=[0])))
        out.sort(key=order)
        return out

    # ------------------------------------------------------------------ prepare (readiness)
    def acknowledged_outcome(self, method):
        w = self.world
        outcome = w.value(w.sir.OUTCOME, self.request['command_instance_id'])
        require('C3/%s/acknowledgement_readback' % method, outcome is not None and outcome['record']['outcome'] in ('acknowledged', 'executing')
                and outcome['record']['acknowledgement_receipt_ref'] is not None)
        require('C3/%s/acknowledged_identity' % method, outcome['record']['identity']['operation_id'] == self.source['normalized_identity']['operation_id']
                and outcome['record']['dispatch_frame_id'] == self.source['normalized_identity']['dispatch_frame_id'])
        return copy.deepcopy(outcome['record'])

    def before_stop_entry(self, method, phases=('source_admitted',)):
        w = self.world
        self.acknowledged = self.acknowledged_outcome(method)
        self.source_control_epoch = self.source['original_body']['control_epoch']
        return self.gcheck(GA + 'BeforeStopEntry', dict(
            source_audit=self.stored_value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'), 'C3/%s/source_unavailable' % method),
            binding_selection=self.stored_value('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection'), 'C3/%s/selection_unavailable' % method),
            current_goal=self.current_goal(), original_acknowledged_outcome_source=self.stored_selection(w.sir.OUTCOME, self.request['command_instance_id']),
            original_acknowledged_outcome=self.acknowledged, exact_event_encoding_template=self.late_template(),
            complete_numeric_inventory=self.numeric_inventory(), codec_resources=w.codecs.current(),
            current_progress=self.progress_pair(method, phases)))

    def prepare(self):
        w = self.world
        with self.call('prepare') as slot:
            entry = self.observe_sources()
            self._require_progress('prepare', ('source_admitted',))
            require('C3/prepare/writer_cutoff', w.binding.domain_withdrawn is False)
            goal_entry = self.before_stop_entry('prepare')
            self.at('prepare', 'after_goal_read')
            self.recheck('prepare', 'after_goal_read', entry)
            native = self.before_stop_native('prepare')
            self.at('prepare', 'after_native_read')
            self.recheck('prepare', 'after_native_read', entry)
            require('C3/prepare/no_fence', w.storage.fence is None)
            issuer = transaction_record(w.goal, 'owner.goal.workflow_cancel.prepare.v1', self.operation_id,
                                        w.permissions.selection(self.cancel_decision), uid('TEST_ONLY:readiness-tx'),
                                        self.source['nonterminal_outcome']['acknowledgement_receipt_ref'])
            readiness = self.gcheck(CM + 'BeforeStopReadiness', dict(scope=copy.deepcopy(self.scope), operation_id=self.operation_id,
                source_profile=PROFILE, source_audit=self.stored_selection('goal_cancel_source_audit', self.key('goal_cancel_source_audit')),
                binding_selection=self.stored_selection('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection')),
                goal_argument_sha256=self.h_arg(goal_entry), native_argument_sha256=self.h_arg(native),
                exact_encoding_template_sha256=self.h_arg(goal_entry['exact_event_encoding_template']),
                complete_numeric_inventory_sha256=self.h_arg(goal_entry['complete_numeric_inventory']),
                codec_resources=goal_entry['codec_resources'], storage_assignment_phase='after_original_workflow_disposition_before_goal_append',
                original_issuer=issuer))
            key = self.key(READINESS)
            wrapper = gwrap(w, CM.split('#')[0], 'StorageBeforeStopReadiness', readiness, key)
            self.at('prepare', 'final')
            self.recheck('prepare', 'final', entry)
            require('C3/prepare/readiness_absent', w.cell(READINESS, key) is None)
            tx = w.write([w.put(READINESS, key, wrapper)])
            self.readiness_key, self.readiness = key, readiness
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(readiness)

    def readiness_custody(self, method):
        stored = self.world.value(READINESS, self.readiness_key) if self.readiness_key else None
        require('C3/%s/readiness_custody' % method, stored is not None and same(stored['record'], self.readiness))
        return stored

    # ------------------------------------------------------------------ C-stop
    def latch_and_reserve(self):
        w = self.world
        with self.call('latch_and_reserve') as slot:
            entry = self.observe_sources()
            self._require_progress('latch_and_reserve', ('source_admitted',))
            require('C3/latch_and_reserve/writer_cutoff', w.binding.domain_withdrawn is False)
            require('C3/latch_and_reserve/permission', w.permissions.allowed(self.cancel_decision, self.actor_ref, 'goal.cancel'))
            readiness = self.readiness_custody('latch_and_reserve')
            before = self.before_stop_entry('latch_and_reserve')
            require('C3/latch_and_reserve/readiness_goal_argument', self.h_arg(before) == readiness['record']['goal_argument_sha256'])
            native = self.before_stop_native('latch_and_reserve')
            self.at('latch_and_reserve', 'after_native_read')
            self.recheck('latch_and_reserve', 'after_native_read', entry)
            require('C3/latch_and_reserve/no_fence', w.storage.fence is None)
            stop_cell = w.host_stop.current(self.scope)
            stop = copy.deepcopy(stop_cell['value']['record'])
            require('C3/latch_and_reserve/original_stop', row_sha(stop_cell['value']) == self.source['original_stop_control_sha256'])
            control_cell = w.goal.control(self.scope)
            control = copy.deepcopy(control_cell['value']['record'])
            require('C3/latch_and_reserve/original_control', row_sha(control_cell['value']) == self.source['original_body']['control_outer_sha256'])
            source_sha = self.progress['source_audit_sha256']
            intent = self.check('StopIntent', dict(schema_id='pm.goal.cancel.stop_intent.v1', schema_version='1.0.0', **self.scope,
                operation_id=self.operation_id, source_audit_sha256=source_sha, before_stop_control_sha256=row_sha(stop_cell['value']),
                before_user_stop_epoch=stop['user_stop_epoch'], after_user_stop_epoch=NR.uint64(stop['user_stop_epoch'] + 1, 'C3/stop_epoch'),
                before_continuation_epoch=stop['continuation_epoch'],
                after_continuation_epoch=NR.uint64(stop['continuation_epoch'] + 1, 'C3/continuation_epoch'),
                expected_revision=self.request['expected_revision'], expected_currentness_hash=self.request['expected_currentness_hash'],
                original_execution_binding=self.source['original_execution_binding'], original_host_owner_epoch=w.host_stop.owner_epoch,
                original_accepted_cancel_ref=self.source['original_user_cancel_acceptance_ref'], requested_at=w.goal.clock.now()))
            self.gcheck(GA + 'StopPublicationEntry', dict(whole_before_stop=before, original_readiness=readiness, original_stop_intent=intent))
            host_tx_ref = uid('TEST_ONLY:host-stop-transaction')
            receipt = self.check('StopReceipt', dict(schema_id='pm.goal.cancel.stop_receipt.v1', schema_version='1.0.0', **self.scope,
                operation_id=self.operation_id, stop_intent_sha256=self.intent_hash(intent), source_audit_sha256=source_sha,
                **{k: intent[k] for k in ('before_user_stop_epoch', 'after_user_stop_epoch', 'before_continuation_epoch', 'after_continuation_epoch')},
                original_host_transaction_ref=host_tx_ref, committed_at=w.host_stop.clock.now(), latched=True))
            receipt_w = self.wrap('StorageStopReceipt', receipt)
            stop.update(user_stop_epoch=intent['after_user_stop_epoch'], continuation_epoch=intent['after_continuation_epoch'], latched=True,
                        last_original_stop_receipt_ref=self.key('goal_cancel_stop_receipt'), last_original_stop_receipt_sha256=row_sha(receipt_w))
            self.check('StopControl', stop)
            pending = self.check('CancellationPending', dict(schema_id='pm.goal.cancel.reservation.v1', schema_version='1.0.0', **self.scope,
                operation_id=self.operation_id, source_audit_sha256=source_sha, stop_intent_sha256=self.intent_hash(intent),
                accepted_user_stop_epoch=stop['user_stop_epoch'], accepted_continuation_epoch=stop['continuation_epoch'],
                expected_revision=control['current_revision'], expected_currentness_hash=control['currentness_hash'],
                expected_body_semantic_sha256=control['body_sha256'], expected_latest_objective_revision=control['latest_objective_revision'],
                expected_latest_revision_hash=control['latest_revision_hash'], original_goal_owner_epoch=w.goal.owner_epoch,
                original_sir_source_ref=self.source['source_authority_ref'], original_cancel_authority_ref=self.source['original_user_cancel_acceptance_ref']))
            control.update(control_epoch=NR.uint64(control['control_epoch'] + 1, 'C3/control_epoch'), cancellation_pending=pending)
            progress = self._progress('stop_reserved', stop_intent=intent, stop_receipt=receipt, reservation_sha256=self.h(pending))
            self.at('latch_and_reserve', 'final')
            self.recheck('latch_and_reserve', 'final', entry)
            writes = [w.put(w.host_stop.FAMILY, w.host_stop.key(self.scope), w.host_stop.wrapper(stop), expected=stop_cell['version']),
                      w.put('goal_cancel_stop_receipt', self.key('goal_cancel_stop_receipt'), receipt_w),
                      w.put(w.goal.CONTROL, w.goal.keys(self.scope)['control'], gwrap(w, WF, 'StorageBodyControlV2', control),
                            expected=control_cell['version'])]
            tx = w.write(writes + self._progress_writes(progress))
            w.host_stop._issue(None, receipt, kind='cancel_stop_receipt', ref=host_tx_ref)
            self.progress = progress
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(receipt)

    # ------------------------------------------------------------------ C-receipt
    def binding_read_current(self):
        w = self.world
        read = w.binding.read_current(self.scope)
        selection = self.stored_value('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection'), 'C3/binding/selection_unavailable')
        return w.roots.check('goal', BINDING + '#/$defs/BindingReadCurrent', dict(scope=copy.deepcopy(self.scope),
            control=copy.deepcopy(read['control']['value']['record']), revision=copy.deepcopy(read['revision']['value']['record']),
            origin=copy.deepcopy(read['origin']['value']['record']), domain=copy.deepcopy(read['domain']['record']),
            original_execution_binding=self.source['original_execution_binding'], selection=selection['record']))

    def current_stop_argument(self, method):
        w = self.world
        receipt = self.stored_value('goal_cancel_stop_receipt', self.key('goal_cancel_stop_receipt'), 'C3/%s/stop_receipt_unavailable' % method)
        read = w.binding.read_current(self.scope)
        assoc = self.workflow_association(read)
        hkey = 'goal_execution_writer_domain_head.v1:' + w.binding.storage_key()
        controls = dict(binding=self.binding_read_current(), association=assoc, goal_body=w.goal.body_cell(self.scope)['value']['record'],
                        goal_control=w.goal.control(self.scope)['value']['record'], goal_stop=receipt['record'])
        return self.gcheck('https://puppetmaster.local/proposals/executor_safestop_current_goal_arguments.v1.schema.json#/$defs/CurrentGoalStopArgument',
                           dict(current_controls=controls, current_stop_control=w.host_stop.current(self.scope)['value'],
                                current_writer_domain_head=w.value(w.binding.HEAD, hkey), original_stop_intent=self.progress['stop_intent'],
                                original_stop_receipt=receipt,
                                original_source_audit=self.stored_value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'), 'C3/source')))

    def stopped_goal_entry(self, method, phases):
        return self.gcheck(GA + 'CurrentStoppedGoalEntry', dict(
            source_audit=self.stored_value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'), 'C3/%s/source_unavailable' % method),
            binding_selection=self.stored_value('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection'), 'C3/%s/selection' % method),
            original_readiness=self.readiness_custody(method), current_goal=self.current_goal(),
            whole_current_stop=self.current_stop_argument(method), current_progress=self.progress_pair(method, phases)))

    def commit_receipt(self):
        w = self.world
        with self.call('commit_receipt') as slot:
            entry = self.observe_sources()
            self._require_progress('commit_receipt', ('stop_reserved',))
            require('C3/commit_receipt/writer_cutoff', w.binding.domain_withdrawn is False)
            stopped = self.stopped_goal_entry('commit_receipt', ('stop_reserved',))
            stop_receipt = stopped['whole_current_stop']['original_stop_receipt']
            require('C3/commit_receipt/stop_receipt_custody', same(stop_receipt['record'], self.progress['stop_receipt']))
            stop = w.host_stop.record(self.scope)
            require('C3/commit_receipt/stop_latched', stop['latched'] is True and stop['last_original_stop_receipt_sha256'] == row_sha(stop_receipt))
            control = w.goal.control(self.scope)['value']['record']
            require('C3/commit_receipt/pending_unresolved', control['pending'] is None)
            self.control_plane('commit_receipt')
            self.at('commit_receipt', 'after_stop_read')
            self.recheck('commit_receipt', 'after_stop_read', entry)
            receipt = self.check('CancellationReceipt', dict(schema_id='pm.goal.cancel.receipt.v1', schema_version='1.0.0', **self.scope,
                operation_id=self.operation_id, cancellation_id=self.operation_id, source_audit_sha256=self.progress['source_audit_sha256'],
                original_revision=self.request['expected_revision'], original_currentness_hash=self.request['expected_currentness_hash'],
                stop_receipt_ref=self.key('goal_cancel_stop_receipt'), stop_receipt_sha256=row_sha(stop_receipt),
                user_stop_epoch=self.progress['stop_receipt']['after_user_stop_epoch'], cancel_reason='user_cancelled',
                accepted_at=self.source['producer_metadata']['occurred_at_utc']))
            progress = self._progress('receipt_committed', cancellation_receipt=receipt)
            self.at('commit_receipt', 'final')
            self.recheck('commit_receipt', 'final', entry)
            tx = w.write([w.put('goal_cancel_receipt', self.key('goal_cancel_receipt'), self.wrap('StorageCancellationReceipt', receipt))]
                         + self._progress_writes(progress))
            self.progress = progress
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(receipt)

    # ------------------------------------------------------------------ native D05/D06 (the real owners act)
    def run_native(self, outcome=None):
        """GRS-078 step 5: SchedulerStop, the effect owners' drain, D05 aggregation, positive D06."""
        n = self.world.native
        n.scheduler.stop(self.wf_run, self.scope)
        n.effects.drain(self.wf_run, outcome=outcome if outcome is not None else self.effect_plan.get('drain'))
        d05 = n.d05.aggregate(self.wf_run, self.scope)
        try:
            n.d06.prepare(self.wf_run, self.scope, self.actor_ref)
        except Refusal as error:
            # The positive D06 refuses an unresolved D05; the genuine Stop/receipt/D05 effects stay in place.
            d05 = dict(d05, d06_refusal=A.refusal_code(error))
            return d05
        n.d06.publish(self.wf_run, self.scope)
        return d05

    # ------------------------------------------------------------------ C-owners
    def owners_native(self, method):
        """OriginalOwnersNativeEntry acquired from the native owners now, every selector resolved, every join checked."""
        w, n = self.world, self.world.native
        disposition = n.d06.readback(self.wf_run, self.scope)
        entry = self.ncheck(N.NA + 'OriginalOwnersNativeEntry', dict(complete_current_workflow_disposition=disposition,
                                                                      goal_control_plane=self.control_plane(method)))
        N.verify_custody(w, disposition, 'C3/%s/native_custody' % method)
        d06 = disposition['d06_readback']
        rs = self.wf_run['run_scope']
        read = w.binding.read_current(self.scope)
        assoc = self.workflow_association(read)
        result, intent, control, origin = d06['result'], d06['intent'], d06['control'], d06['origin']
        require('C3/%s/d06_scope' % method, result['scope'] == intent['scope'] == control['scope'] == origin['scope'] == rs)
        require('C3/%s/d06_owner' % method, result['workflow_owner_ref'] == intent['workflow_owner_ref'] == assoc['execution_owner_ref']
                and result['workflow_owner_epoch'] == intent['workflow_owner_epoch'] == assoc['execution_owner_epoch'])
        require('C3/%s/d06_operation' % method, result['operation_id'] == intent['operation_id'] == control['operation_id'] == origin['operation_id']
                and result['operation_id'] != self.operation_id)
        require('C3/%s/d06_control_result' % method, control['phase'] == 'committed' and control['result'] is not None)
        rcell = w.cell(control['result']['family_id'], control['result']['physical_key'])
        require('C3/%s/d06_result_custody' % method, rcell is not None and same(rcell['value']['record'], result))
        require('C3/%s/d06_origin_publish' % method, origin['issuer_method'] == 'owner.workflow.executor_cancel.publish_disposition.v3'
                and origin['afterimages']['result'] == control['result'])
        stop_receipt_key = self.key('goal_cancel_stop_receipt')
        require('C3/%s/d06_goal_stop' % method, intent['goal_stop'] == N.src_sel(w, 'goal_cancel_stop_receipt', stop_receipt_key))
        safe = d06['safe_stop']['whole_original_safe_stop']
        require('C3/%s/d05_resolved' % method, safe['status'] == 'bounded_original_safe_stop_resolved'
                and safe['original_result']['disposition'] == 'bounded_original_safe_stop_resolved')
        gss = safe['source_readback']['goal_stop']
        require('C3/%s/d05_goal_stop' % method, gss['original_stop_receipt'] == self.progress['stop_receipt']
                and gss['original_stop_intent'] == self.progress['stop_intent'])
        require('C3/%s/d05_scope' % method, safe['scope'] == rs and safe['original_result']['scope'] == rs)
        require('C3/%s/d06_d05_join' % method, intent['safe_stop_source']['physical_key'] == safe['result_source']['physical_key']
                and intent['safe_stop_source']['physical_value_sha256'] == safe['result_source']['physical_sha256'])
        pointer, body, ctl = n.run.current(self.wf_run)
        native_body = d06['native_after' if d06['kind'] == 'cancelled_from_nonterminal' else 'native_unchanged']
        require('C3/%s/d06_current_body' % method, same(native_body['body'], body) and same(native_body['control'], ctl))
        if d06['kind'] == 'cancelled_from_nonterminal':
            require('C3/%s/d06_cancelled_body' % method, body['record']['status'] == 'cancelled')
            ev = d06['original_event']
            eid = ev['event']['event_id']
            require('C3/%s/d06_event' % method, same(ev['event'], w.storage.read_event(eid)) and ev['event']['event_type'] == 'goal_run.cancelled'
                    and ev['event']['payload']['payload']['goal_run_id'] == rs['goal_run_id'])
            require('C3/%s/d06_first_custody' % method, same(ev['custody'], w.storage.first_custody(eid))
                    and same(ev['append'], w.storage.full_value_result(eid)) and same(result['append_receipt'], ev['custody']['first_append_receipt']))
            settlements = safe['original_result']['settlements']
            require('C3/%s/d06_mutation' % method, ev['event']['payload']['payload']['mutation_started'] is bool(settlements))
        else:
            require('C3/%s/d06_preserved' % method, result['preserved_status'] == body['record']['status'] and body['record']['status'] in N.TERMINAL)
        require('C3/%s/current_start' % method, disposition['current_start']['value']['commit']['record']['scope'] == rs)
        return entry

    def native_selections(self, entry):
        w = self.world
        d06 = entry['complete_current_workflow_disposition']['d06_readback']
        safe = d06['safe_stop']['whole_original_safe_stop']
        rsel = d06['control']['result']
        okey = w.native.d06.key(self.wf_run, w.native.d06.ORIGIN, 2)
        ocell = w.cell(w.native.d06.ORIGIN, okey)
        require('C3/native/d06_origin_custody', ocell is not None and same(ocell['value']['record'], d06['origin']))
        return dict(d06_result=self.stored_selection(rsel['family_id'], rsel['physical_key']),
                    d06_origin=self.stored_selection(w.native.d06.ORIGIN, okey),
                    d05_result=self.stored_selection(safe['result_source']['family_id'], safe['result_source']['physical_key']),
                    d05_origin=self.stored_selection(safe['origin_source']['family_id'], safe['origin_source']['physical_key']),
                    kind=d06['kind'], d06_operation_id=d06['result']['operation_id'],
                    preserved=d06['result'].get('preserved_status'))

    def owners_entry(self, method, phases):
        receipt = self.stored_value('goal_cancel_receipt', self.key('goal_cancel_receipt'), 'C3/%s/receipt_unavailable' % method)
        require('C3/%s/receipt_custody' % method, same(receipt['record'], self.progress['cancellation_receipt']))
        return self.gcheck(GA + 'OriginalOwnersEntry', dict(stopped_goal=self.stopped_goal_entry(method, phases), original_cancellation_receipt=receipt))

    def settle_owner(self):
        w = self.world
        with self.call('settle_owner') as slot:
            entry = self.observe_sources()
            self._require_progress('settle_owner', ('receipt_committed',))
            require('C3/settle_owner/writer_cutoff', w.binding.domain_withdrawn is False)
            goal_entry = self.owners_entry('settle_owner', ('receipt_committed',))
            self.at('settle_owner', 'after_goal_read')
            self.recheck('settle_owner', 'after_goal_read', entry)
            native = self.owners_native('settle_owner')
            self.at('settle_owner', 'after_native_read')
            self.recheck('settle_owner', 'after_native_read', entry)
            control = w.goal.control(self.scope)['value']['record']
            require('C3/settle_owner/pending_unresolved', control['pending'] is None)
            sels = self.native_selections(native)
            issuer = transaction_record(w.goal, 'owner.goal.workflow_cancel.settle_owner.v1', self.operation_id,
                                        w.permissions.selection(self.cancel_decision), uid('TEST_ONLY:scope-proof-tx'), sels['d06_operation_id'])
            proof = self.gcheck(CM + 'WorkflowScopeProof', dict(scope=copy.deepcopy(self.scope), operation_id=self.operation_id, source_profile=PROFILE,
                goal_run_id=self.wf_run['run_scope']['goal_run_id'], execution_owner_ref=self.wf_run['execution_owner_ref'],
                execution_owner_epoch=self.wf_run['execution_owner_epoch'],
                source_audit=self.stored_selection('goal_cancel_source_audit', self.key('goal_cancel_source_audit')),
                binding_selection=self.stored_selection('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection')),
                before_stop_readiness=self.stored_selection(READINESS, self.readiness_key),
                original_stop_receipt=self.stored_selection('goal_cancel_stop_receipt', self.key('goal_cancel_stop_receipt')),
                original_cancellation_receipt=self.stored_selection('goal_cancel_receipt', self.key('goal_cancel_receipt')),
                d06_result=sels['d06_result'], d06_origin=sels['d06_origin'], d06_operation_id=sels['d06_operation_id'],
                d06_disposition=sels['kind'], preserved_terminal_status=sels['preserved'], d05_result=sels['d05_result'],
                d05_origin=sels['d05_origin'], goal_argument_sha256=self.h_arg(goal_entry), native_argument_sha256=self.h_arg(native),
                original_issuer=issuer))
            pkey = self.key(SCOPE_PROOF)
            proof_w = gwrap(w, CM.split('#')[0], 'StorageWorkflowScopeProof', proof, pkey)
            settlement = self.check('WorkflowOwnerSettlement', dict(kind='workflow_settled', original_execution_binding=self.source['original_execution_binding'],
                original_scope_proof_ref=pkey, original_scope_proof_sha256=row_sha(proof_w),
                original_owner_settlement_ref=sels['d06_result']['physical_key'], original_owner_settlement_sha256=sels['d06_result']['complete_value_sha256'],
                original_schedule_quota_invalidation_ref=None, original_schedule_quota_invalidation_sha256=None))
            progress = self._progress('owners_settled', owner_settlement=settlement)
            self.at('settle_owner', 'final')
            self.recheck('settle_owner', 'final', entry)
            require('C3/settle_owner/proof_absent', w.cell(SCOPE_PROOF, pkey) is None)
            tx = w.write([w.put(SCOPE_PROOF, pkey, proof_w)] + self._progress_writes(progress))
            self.progress, self.scope_proof_key, self.settlement = progress, pkey, settlement
            slot.set(dict(tx=tx['tx_id'], d06=sels['kind']))
            return copy.deepcopy(settlement)

    def post_owners_entry(self, method, phases):
        w = self.world
        proof = self.stored_value(SCOPE_PROOF, self.scope_proof_key, 'C3/%s/scope_proof_unavailable' % method)
        require('C3/%s/scope_proof_settlement' % method, row_sha(proof) == self.progress['owner_settlement']['original_scope_proof_sha256'])
        receipt = self.stored_value('goal_cancel_receipt', self.key('goal_cancel_receipt'), 'C3/%s/receipt_unavailable' % method)
        stopped = self.stopped_goal_entry(method, phases)
        return self.gcheck(GA + 'PostOwnersEntry', dict(original_owners=dict(stopped_goal=stopped, original_cancellation_receipt=receipt),
                                                         original_workflow_proof=proof, original_owner_settlement=self.progress['owner_settlement']))

    # ------------------------------------------------------------------ C-event
    def freeze_event(self):
        w = self.world
        with self.call('freeze_event') as slot:
            entry = self.observe_sources()
            self._require_progress('freeze_event', ('owners_settled',))
            post = self.post_owners_entry('freeze_event', ('owners_settled',))
            self.owners_native('freeze_event')
            self.at('freeze_event', 'after_native_read')
            self.recheck('freeze_event', 'after_native_read', entry)
            receipt = self.progress['cancellation_receipt']
            stored = w.value('goal_cancel_receipt', self.key('goal_cancel_receipt'))
            require('C3/freeze_event/accepted_occurrence', receipt['accepted_at'] == self.source['producer_metadata']['occurred_at_utc']
                    and receipt['cancellation_id'] == self.source['normalized_identity']['operation_id'])
            producer = self.expected_producer()
            producer['payload']['cancellation_receipt_sha256'] = row_sha(stored)
            producer = self.check('ProducerInput', producer)
            require('C3/freeze_event/registered_selector', producer['payload_schema_id'] == w.shared.registry_row['payload_schema_id'])
            progress = self._progress('event_ready', producer_input=producer)
            self.at('freeze_event', 'final')
            self.recheck('freeze_event', 'final', entry)
            tx = w.write(self._progress_writes(progress))
            self.progress = progress
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(producer)

    # ------------------------------------------------------------------ late assignment (rows 55-57)
    def event_ready_progress(self, method):
        pair = self.progress_pair(method, ('event_ready',))
        return self.gcheck(LA + 'EventReadyProgress', pair['current_selected_epoch'])

    def reserve_assignment(self):
        w = self.world
        with self.call('reserve_assignment') as slot:
            entry = self.observe_sources()
            self._require_progress('reserve_assignment', ('event_ready',))
            require('C3/reserve_assignment/writer_cutoff', w.binding.domain_withdrawn is False)
            require('C3/reserve_assignment/no_prior_reservation', getattr(self, 'late_reservation', None) is None
                    and w.storage.reservation_record(self.operation_id) is None)
            post = self.post_owners_entry('reserve_assignment', ('event_ready',))
            native = self.owners_native('reserve_assignment')
            self.at('reserve_assignment', 'after_native_read')
            self.recheck('reserve_assignment', 'after_native_read', entry)
            sources = w.assigner.read_sources()
            self.at('reserve_assignment', 'after_seglog_read')
            self.recheck('reserve_assignment', 'after_seglog_read', entry)
            w.roots.check('goal', BINDING + '#/$defs/AppendSourceRead', sources)
            self.gcheck(LA + 'LatePrepareEntry', dict(post_owners=post, original_event_ready_progress=self.event_ready_progress('reserve_assignment'),
                                                      original_producer=self.progress['producer_input'], actual_append_source=sources))
            producer = self.progress['producer_input']
            header_len = len(S.canonical(S.event_header(dict(producer, sequence_id=0, observed_at_utc='x', persisted_at_utc='x'))))
            require('C3/reserve_assignment/header_cap', header_len <= 4096)
            self.at('reserve_assignment', 'final')
            self.recheck('reserve_assignment', 'final', entry)
            require('C3/reserve_assignment/fence_free', w.storage.fence is None)
            self.append_request = dict(kind='TEST_ONLY:goal.cancelled.workflow_late_append', operation_id=self.operation_id,
                                       source_audit_sha256=self.progress['source_audit_sha256'])
            handle, fence, reservation = w.storage.reserve_assignment(self.operation_id, self.append_request)
            self.reservation_handle, self.fence, self.reservation_record = handle, fence, reservation
            # The reservation fixes the selected CURRENT/manifest/lease: the late reservation records them as they now stand.
            # Storage assigns the complete late EventRecord now: the reserved sequence and its own two clock ticks.
            w.storage.assign_late_times(self.operation_id)
            held = w.assigner.read_sources()
            require('C3/reserve_assignment/selected_manifest', held['manifest']['manifest_generation'] == reservation['manifest_generation'])
            late = self.gcheck(CM + 'LateReservation', w.assigner.reservation_source(self.operation_id, reservation, held, header_len))
            self.late_reservation, self.late_sources = late, copy.deepcopy(held)
            slot.set(dict(sequence=late['reserved_sequence_id'], offset=late['byte_offset']))
            return copy.deepcopy(late)

    def assigned_event(self):
        w = self.world
        observed, persisted = w.storage.assign_late_times(self.operation_id)
        return self.gcheck(LA + 'TypedGoalEventRecord', dict(self.progress['producer_input'], sequence_id=self.late_reservation['reserved_sequence_id'],
                                                             observed_at_utc=observed, persisted_at_utc=persisted))

    def late_entry(self, method):
        w = self.world
        post = self.post_owners_entry(method, ('event_ready',))
        live = w.assigner.read_sources()
        # Under the held fence the selected CURRENT/manifest cannot move; the lease may only be this reservation's own grant.
        require('C3/%s/append_source_drift' % method, seglog_view(live) == seglog_view(self.late_sources))
        lease = live['sequence_allocator']['current_lease']
        require('C3/%s/append_lease' % method, lease['first_sequence_id'] <= self.late_reservation['reserved_sequence_id'] <= lease['last_sequence_id'])
        return self.gcheck(LA + 'LateAssignmentEntry', dict(post_owners=post, original_event_ready_progress=self.event_ready_progress(method),
                           original_producer=self.progress['producer_input'], actual_append_source=self.late_sources,
                           actual_late_reservation=self.late_reservation, actual_storage_assigned_event=self.assigned_event(),
                           complete_numeric_domains=self.numeric_inventory(reservation=self.late_reservation), codec_resources=w.codecs.current()))

    def late_evaluate(self, template, slots):
        if template.get('kind') == 'late_storage_integer':
            require('C3/template/late_slot', 'sequence_id' in slots)
            return slots['sequence_id']
        kind = template['term']
        if kind == 'array':
            return [self.late_evaluate(t, slots) for t in template['items']]
        if kind == 'map':
            return {m['key']: self.late_evaluate(m['value'], slots) for m in template['members']}
        return AS.evaluate(template, slots)

    def issue_assignment_audit(self, *, entry_edit=None):
        w = self.world
        with self.call('issue_assignment_audit') as slot:
            entry = self.observe_sources()
            self._require_progress('issue_assignment_audit', ('event_ready',))
            require('C3/issue_assignment_audit/fence', self.fence is not None and w.storage.fence is self.fence)
            stored_res = w.storage.reservation_record(self.operation_id)
            require('C3/issue_assignment_audit/reservation_custody', stored_res is not None and stored_res['state'] == 'reserved'
                    and stored_res['reserved_sequence_id'] == self.late_reservation['reserved_sequence_id']
                    and stored_res['fence_identity'] == self.late_reservation['original_exclusive_fence_id'])
            late = self.late_entry('issue_assignment_audit')
            if entry_edit is not None:
                late = self.gcheck(LA + 'LateAssignmentEntry', entry_edit(copy.deepcopy(late)))
            event = late['actual_storage_assigned_event']
            # Storage-assigned members are compared with Storage's own custody, never only with each other.
            require('C3/issue_assignment_audit/assigned_sequence_custody', event['sequence_id'] == stored_res['reserved_sequence_id']
                    and late['actual_late_reservation']['reserved_sequence_id'] == stored_res['reserved_sequence_id'])
            assigned = w.storage.reservation_record(self.operation_id)
            require('C3/issue_assignment_audit/assigned_times_custody', event['observed_at_utc'] == assigned.get('assigned_observed_at_utc')
                    and event['persisted_at_utc'] == assigned.get('assigned_persisted_at_utc'))
            require('C3/issue_assignment_audit/reservation_entry', late['actual_late_reservation']['byte_offset'] == stored_res['byte_offset']
                    and late['actual_late_reservation']['selected_segment_generation'] == stored_res['segment_generation']
                    and late['actual_late_reservation']['selected_manifest_generation'] == stored_res['manifest_generation'])
            native = self.owners_native('issue_assignment_audit')
            self.at('issue_assignment_audit', 'after_native_read')
            self.recheck('issue_assignment_audit', 'after_native_read', entry)
            readiness = self.readiness_custody('issue_assignment_audit')
            template = self.late_template()
            require('C3/issue_assignment_audit/readiness_template', self.h_arg(template) == readiness['record']['exact_encoding_template_sha256'])
            receipt = w.value('goal_cancel_receipt', self.key('goal_cancel_receipt'))
            evaluated = self.late_evaluate(template, {'cancellation_receipt_sha256': row_sha(receipt), 'sequence_id': event['sequence_id'],
                                                      'event.observed_at_utc': event['observed_at_utc'], 'event.persisted_at_utc': event['persisted_at_utc']})
            require('C3/issue_assignment_audit/template_event', same(evaluated, event))
            require('C3/issue_assignment_audit/producer_unchanged', same(S.producer25(event), self.progress['producer_input']))
            for row in late['complete_numeric_domains']:
                for interval in row['values']:
                    require('C3/issue_assignment_audit/interval', interval['minimum'] <= interval['maximum']
                            and (interval['maximum'] - interval['minimum']) % interval['step'] == 0)
                    if row['target'] in ('producer_semantic_digest', 'goal_cancel_result'):
                        require('C3/issue_assignment_audit/codec_route', interval['maximum'] <= (1 << 53))
            seq_domain = [r for r in late['complete_numeric_domains'] if r['json_pointer'] == '/sequence_id' and r['target'] == 'event_value']
            require('C3/issue_assignment_audit/sequence_domain', len(seq_domain) == 1 and seq_domain[0]['values'][0]['minimum']
                    == event['sequence_id'] == seq_domain[0]['values'][0]['maximum'])
            issuer = transaction_record(w.assigner, 'owner.storage.goal_workflow_cancel.issue_assignment_audit.v1', self.operation_id,
                                        w.permissions.selection(self.cancel_decision), uid('TEST_ONLY:late-audit-tx'),
                                        self.late_reservation['original_reservation_transaction_id'])
            assignment_input = {k: late[k] for k in ('actual_late_reservation', 'actual_storage_assigned_event', 'complete_numeric_domains', 'codec_resources')}
            audit = self.gcheck(CM + 'LateAssignmentAudit', dict(scope=copy.deepcopy(self.scope), operation_id=self.operation_id, source_profile=PROFILE,
                source_audit=self.stored_selection('goal_cancel_source_audit', self.key('goal_cancel_source_audit')),
                binding_selection=self.stored_selection('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection')),
                before_stop_readiness=self.stored_selection(READINESS, self.readiness_key),
                workflow_scope_proof=self.stored_selection(SCOPE_PROOF, self.scope_proof_key), original_event_id=event['event_id'],
                producer_semantic_digest=NR.producer_digest(event), complete_goal_argument_sha256=self.h_arg(late),
                complete_native_argument_sha256=self.h_arg(native), complete_assignment_input_sha256=self.h_arg(assignment_input),
                complete_numeric_inventory_sha256=self.h_arg(late['complete_numeric_domains']), actual_late_reservation=self.late_reservation,
                original_issuer=issuer))
            key = self.key(LATE_AUDIT)
            wrapper = gwrap(w, CM.split('#')[0], 'StorageLateAssignmentAudit', audit, key)
            self.at('issue_assignment_audit', 'final')
            self.recheck('issue_assignment_audit', 'final', entry)
            require('C3/issue_assignment_audit/fence_final', w.storage.fence is self.fence)
            require('C3/issue_assignment_audit/audit_absent', w.cell(LATE_AUDIT, key) is None)
            tx = w.write([w.put(LATE_AUDIT, key, wrapper)])
            self.late_audit_key, self.late_audit = key, audit
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(audit)

    def append_readback(self, event_id, method):
        """OriginalGoalAppendReadback from Storage custody, the index owner and the seglog owner, re-read now."""
        w = self.world
        stored_event = w.storage.read_event(event_id)
        publication, _ = self.publication_from_custody(event_id)
        custody = w.storage.first_custody(event_id)
        checkpoint, generation, frontier = w.index.current()
        token = w.index.read_token()
        row = w.index.row(event_id)
        frame = w.index.source_frame(event_id)
        audit = self.stored_value(LATE_AUDIT, self.late_audit_key, 'C3/%s/late_audit_unavailable' % method)
        require('C3/%s/index_row_event' % method, row['sequence_id'] == stored_event['sequence_id'] == custody['first_append_receipt']['sequence_id']
                and row['source_locator']['byte_offset'] == frame['byte_offset'] == custody['first_append_receipt']['byte_offset']
                and row['producer_semantic_digest'] == custody['producer_semantic_digest'])
        require('C3/%s/index_token' % method, token['generation_id'] == checkpoint['current_generation_id'] == generation['generation_id']
                and token['frontier_revision'] == frontier['publication_revision'])
        require('C3/%s/index_coverage' % method, frontier['coverage']['through_sequence_id'] >= stored_event['sequence_id'])
        require('C3/%s/frame_event' % method, same(frame['event'], stored_event))
        return self.gcheck(LA + 'OriginalGoalAppendReadback', dict(event=stored_event, publication=publication,
            full_value_result=w.storage.full_value_result(event_id), original_custody=custody, original_assignment=audit,
            actual_current_append_source=w.assigner.read_sources(), actual_source_frame=frame, actual_index_checkpoint=checkpoint,
            actual_index_generation=generation, actual_index_frontier=frontier, actual_index_read_token=token, actual_index_row=row))

    def append_original(self, *, lose_ack=False, candidate_edit=None):
        w = self.world
        with self.call('append_original') as slot:
            entry = self.observe_sources()
            self._require_progress('append_original', ('event_ready',))
            require('C3/append_original/writer_cutoff', w.binding.domain_withdrawn is False)
            require('C3/append_original/fence', self.fence is not None and w.storage.fence is self.fence)
            audit = self.stored_value(LATE_AUDIT, getattr(self, 'late_audit_key', None) or '-', 'C3/append_original/audit_unavailable')
            require('C3/append_original/audit_custody', same(audit['record'], self.late_audit))
            require('C3/append_original/audit_fence', audit['record']['actual_late_reservation']['original_exclusive_fence_id'] == self.fence.identity)
            late = self.late_entry('append_original')
            require('C3/append_original/audit_goal_argument', self.h_arg(late) == audit['record']['complete_goal_argument_sha256'])
            self.owners_native('append_original')
            self.at('append_original', 'after_native_read')
            self.recheck('append_original', 'after_native_read', entry)
            producer = copy.deepcopy(self.progress['producer_input'])
            if candidate_edit is not None:
                producer = candidate_edit(producer)
            require('C3/append_original/frozen_producer', same(producer, self.progress['producer_input']))
            require('C3/append_original/audit_producer', NR.producer_digest(late['actual_storage_assigned_event'])
                    == audit['record']['producer_semantic_digest'])
            self.at('append_original', 'final')
            self.recheck('append_original', 'final', entry)
            require('C3/append_original/fence_final', w.storage.fence is self.fence)
            events, reservation, outcome = w.appender.append_original(self.operation_id, self.append_request, [producer], durability_class='barrier')
            self.reservation = reservation
            if lose_ack:
                progress = self._progress('event_unknown', publication=None)
                w.write(self._progress_writes(progress))
                self.progress = progress
                slot.set(dict(lost_ack=True))
                return None
            stored_event = w.appender.event(events[0])
            require('C3/append_original/assigned_event', same(stored_event, late['actual_storage_assigned_event']))
            w.index.publish()
            readback = self.append_readback(stored_event['event_id'], 'append_original')
            self.check_late_domains(readback['publication'], late['complete_numeric_domains'])
            progress = self._progress('event_issued', publication=readback['publication'])
            tx = w.write(self._progress_writes(progress))
            self.progress, self.fence = progress, None
            slot.set(dict(tx=tx['tx_id'], event_id=stored_event['event_id'], sequence_id=stored_event['sequence_id']))
            return copy.deepcopy(readback)

    def check_late_domains(self, publication, domains):
        receipt = publication['first_append_receipt']
        require('C3/append_original/selected_segment_name', receipt['segment_name'] == self.late_reservation['selected_segment_name'])
        index = {(d['schema_branch'], d['json_pointer']): d['values'] for d in domains}
        for field in ('sequence_id', 'byte_offset', 'durable_end_offset', 'manifest_generation', 'segment_generation'):
            value = receipt[field]
            intervals = index[('SucceededResult', '/publication/first_append_receipt/' + field)]
            require('C3/append_original/domain/' + field, any(i['minimum'] <= value <= i['maximum'] and (value - i['minimum']) % i['step'] == 0
                                                              for i in intervals))

    def resolve_original(self):
        """After a lost acknowledgement: the same original from Storage custody (event_unknown -> event_issued)."""
        w = self.world
        with self.call('resolve_original') as slot:
            entry = self.observe_sources()
            self._require_progress('resolve_original', ('event_unknown',))
            producer = self.progress['producer_input']
            event_id = w.storage.event_by_identity(S.scope_partition(producer), producer['event_type'], producer['idempotency_key'])
            require('C3/resolve_original/event_unknown', event_id is not None)
            w.index.publish()
            readback = self.append_readback(event_id, 'resolve_original')
            require('C3/resolve_original/stored_producer', same(S.producer25(readback['event']), producer))
            self.at('resolve_original', 'final')
            self.recheck('resolve_original', 'final', entry)
            progress = self._progress('event_issued', publication=readback['publication'])
            tx = w.write(self._progress_writes(progress))
            self.progress, self.fence = progress, None
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(readback)

    # ------------------------------------------------------------------ C-publish
    def publish_control(self):
        w = self.world
        with self.call('publish_control') as slot:
            entry = self.observe_sources()
            self._require_progress('publish_control', ('event_issued',))
            require('C3/publish_control/writer_cutoff', w.binding.domain_withdrawn is False)
            publication = self.progress['publication']
            w.storage.authenticate_receipt(publication['event_id'], publication['first_append_receipt'])
            # SP-304: only a complete monotonic still-latched Stop successor is allowed; a resumed Goal refuses here.
            require('C3/publish_control/stop_latched', w.host_stop.record(self.scope)['latched'] is True)
            post = self.post_owners_entry('publish_control', ('event_issued',))
            readback = self.append_readback(publication['event_id'], 'publish_control')
            require('C3/publish_control/original_publication', same(readback['publication'], publication))
            self.owners_native('publish_control')
            self.at('publish_control', 'after_custody_read')
            self.recheck('publish_control', 'after_custody_read', entry)
            control_cell = w.goal.control(self.scope)
            control = copy.deepcopy(control_cell['value']['record'])
            require('C3/publish_control/reservation', control['cancellation_pending'] is not None
                    and self.h(control['cancellation_pending']) == self.progress['reservation_sha256'])
            require('C3/publish_control/pending_unresolved', control['pending'] is None)
            before = copy.deepcopy(control_cell['value'])
            control.update(control_epoch=NR.uint64(control['control_epoch'] + 1, 'C3/control_epoch'),
                           cancellation_receipt_ref=self.key('goal_cancel_receipt'), cancellation_pending=None)
            after = gwrap(w, WF, 'StorageBodyControlV2', control)
            receipt_stored = w.value('goal_cancel_receipt', self.key('goal_cancel_receipt'))
            record = self.check('ControlPublication', dict(schema_id='pm.goal.cancel.control_publication.v2', schema_version='2.0.0', **self.scope,
                operation_id=self.operation_id, source_audit_sha256=self.progress['source_audit_sha256'],
                cancellation_receipt_ref=self.key('goal_cancel_receipt'), cancellation_receipt_sha256=row_sha(receipt_stored),
                original_publication=publication, before_control_sha256=row_sha(before), after_control_sha256=row_sha(after),
                before_control_epoch=before['record']['control_epoch'], after_control_epoch=control['control_epoch'],
                body_semantic_sha256=control['body_sha256'], revision=control['current_revision'], currentness_hash=control['currentness_hash'],
                original_owner_settlement=self.progress['owner_settlement'], original_transaction_ref=uid('TEST_ONLY:control-publication-tx'),
                published_at=w.goal.clock.now(), active_projection_removed=True, body_history_unchanged=True))
            progress = self._progress('control_published', control_publication=record)
            self.at('publish_control', 'final')
            self.recheck('publish_control', 'final', entry)
            tx = w.write([w.put(w.goal.CONTROL, w.goal.keys(self.scope)['control'], after, expected=control_cell['version']),
                          w.put('goal_cancel_control_publication', self.key('goal_cancel_control_publication'),
                                self.wrap('StorageControlPublication', record))] + self._progress_writes(progress))
            self.progress = progress
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(record)

    # ------------------------------------------------------------------ terminals
    def selected_epoch(self):
        return self.gcheck(GA + 'WholeStorageProgressEpoch', self.stored_value('goal_cancel_progress', self.progress_key(self.progress['progress_epoch']),
                                                                             'C3/terminal/progress_unavailable'))

    def _terminal_values(self, kind, result):
        w = self.world
        accepted = w.sir.stored(self.request['command_instance_id'])
        if getattr(self, 'result_ref', None) is None:
            self.result_ref = uid('TEST_ONLY:goal-cancel-result')
        result_ref, result_sha, selector = self.result_ref, self.h(result), self._selector()
        terminal_input = self.check('TerminalInput', dict(source_audit=self.source, selected_progress=self.progress,
            selected_progress_selector=selector, selected_progress_sha256=self.row_hash('Progress', self.progress),
            original_current_outcome=accepted['nonterminal'], result=result, owner_result_ref=result_ref, owner_result_sha256=result_sha,
            expected_sir_owner_epoch=w.sir.owner_epoch))
        outcome_name = dict(succeeded='TerminalSuccessOutcome', unknown='TerminalUnknownOutcome', no_effect='TerminalNoEffectOutcome')[kind]
        outcome = self.check(outcome_name, w.sir.outcome_record(accepted['identity'],
            outcome=dict(succeeded='succeeded', unknown='terminal_unknown', no_effect='failed')[kind],
            acknowledgement_receipt_ref=accepted['nonterminal']['acknowledgement_receipt_ref'], acknowledgement_frame_offset=0,
            result_receipt_ref=result_ref if kind == 'succeeded' else None, owner_result_ref=result_ref,
            error_ref=None if kind == 'succeeded' else result['error']['evidence_ref'],
            owner_result_schema_ref=copy.deepcopy(RESULT_SCHEMA_REF), owner_result_sha256=result_sha))
        response_name = dict(succeeded='SuccessResponse', unknown='UnknownResponse', no_effect='NoEffectResponse')[kind]
        response = self.check(response_name, dict(schema_id='pm.ui_command_response.v2', schema_version='2.0.0',
            dispatch_id=accepted['dispatch_id'], request_ref=accepted['identity']['request_ref'], command_id=C1.COMMAND,
            command_instance_id=self.request['command_instance_id'], response_kind='owner_operation', ack_status='accepted',
            result_status=dict(succeeded='succeeded', unknown='recovery_required', no_effect='failed')[kind],
            error=None if kind == 'succeeded' else dict(code='internal_error' if kind == 'unknown' else 'permission_denied',
                                                        reason=result['status'], offending_field=None),
            event_refs=[self.event_id] if kind == 'succeeded' else [], receipt_ref=result_ref if kind == 'succeeded' else None,
            operation_id=self.operation_id, owner_identity=copy.deepcopy(accepted['identity']['owner_identity']),
            command_outcome_ref=accepted['command_outcome_ref'], owner_result_ref=result_ref,
            owner_result_schema_ref=copy.deepcopy(RESULT_SCHEMA_REF), replayed=False, original_dispatch_id=None, ts=w.sir.clock.now()))
        terminal = self.check('Terminal', dict(schema_id='pm.goal.cancel.terminal_audit.v2', schema_version='2.0.0', **self.scope,
            operation_id=self.operation_id, source_audit_sha256=self.progress['source_audit_sha256'],
            terminal_progress_sha256=self.row_hash('Progress', self.progress), owner_result_ref=result_ref, owner_result_sha256=result_sha,
            terminal_authority_ref=w.sir.owner_id, committed_at=w.sir.clock.now(), kind=kind, result=result, outcome=outcome,
            response=response, terminal_progress_selector=selector))
        prepared = self.check('TerminalPrepared', dict(input_sha256=self.h(terminal_input), candidate_terminal=terminal,
            actual_original_sir_participant_ref=w.sir.owner_id, expected_original_source_sha256=self.progress['source_audit_sha256'],
            publicly_released=False))
        return terminal, prepared, terminal_input

    def terminal_succeeded(self, *, lose_ack=False):
        w = self.world
        with self.call('terminal_succeeded') as slot:
            entry = self.observe_sources()
            require('C3/terminal_succeeded/already_issued', w.value('goal_cancel_terminal_audit', self.key('goal_cancel_terminal_audit')) is None)
            self._require_progress('terminal_succeeded', ('control_published',))
            publication = self.progress['publication']
            w.storage.authenticate_receipt(publication['event_id'], publication['first_append_receipt'])
            control = w.goal.control(self.scope)['value']['record']
            require('C3/terminal_succeeded/control_published', control['cancellation_receipt_ref'] == self.key('goal_cancel_receipt'))
            post = self.post_owners_entry('terminal_succeeded', ('control_published',))
            readback = self.append_readback(publication['event_id'], 'terminal_succeeded')
            self.owners_native('terminal_succeeded')
            self.at('terminal_succeeded', 'after_native_read')
            self.recheck('terminal_succeeded', 'after_native_read', entry)
            result = self.check('SucceededResult', dict(schema_id='pm.goal.cancel.result.v3', schema_version='3.0.0', command_id=C1.COMMAND,
                command_instance_id=self.request['command_instance_id'], operation_id=self.operation_id,
                **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')}, status='succeeded',
                cancellation_receipt=self.progress['cancellation_receipt'], publication=publication,
                control_publication=self.progress['control_publication']))
            terminal, prepared, terminal_input = self._terminal_values('succeeded', result)
            self.gcheck(GA + 'SucceededTerminalEntry', dict(post_owners=post, original_assignment=readback['original_assignment'],
                                                            terminal_input=terminal_input, original_selected_progress=self.selected_epoch()))
            self.at('terminal_succeeded', 'final')
            self.recheck('terminal_succeeded', 'final', entry)
            stored = self.wrap('StorageTerminal', terminal)
            handle, tx = self._sir_publisher().publish(self.reservation, 'goal_cancel_terminal_audit', self.key('goal_cancel_terminal_audit'), stored)
            self.terminal_value = terminal
            slot.set(dict(tx=tx['tx_id']))
            if lose_ack:
                raise Refusal('C3/terminal_succeeded/ack_lost')
            return copy.deepcopy(terminal)

    def terminal_unsettled(self, kind='unknown'):
        """no_effect (before any Stop, original no-effect proof) or unknown/recovery_required (after a genuine Stop)."""
        w = self.world
        with self.call('terminal_unsettled', dict(kind=kind)) as slot:
            entry = self.observe_sources()
            require('C3/terminal_unsettled/kind', kind in ('unknown', 'no_effect'))
            require('C3/terminal_unsettled/already_issued', w.value('goal_cancel_terminal_audit', self.key('goal_cancel_terminal_audit')) is None)
            extra, prior = [], None
            if kind == 'no_effect':
                self._require_progress('terminal_unsettled', ('source_admitted',))
                stop = w.host_stop.current(self.scope)['value']
                require('C3/terminal_unsettled/no_effect_stop_unchanged', row_sha(stop) == self.source['original_stop_control_sha256'])
                require('C3/terminal_unsettled/no_effect_unpermitted', not w.permissions.allowed(self.cancel_decision, self.actor_ref, 'goal.cancel'))
                progress = self._progress('no_effect')
                extra = self._progress_writes(progress)
                prior, self.progress = self.progress, progress
                result = self.check('NoEffectResult', dict(schema_id='pm.goal.cancel.result.v3', schema_version='3.0.0', command_id=C1.COMMAND,
                    command_instance_id=self.request['command_instance_id'], operation_id=self.operation_id,
                    **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')}, status='failed', effect_disposition='no_effect',
                    no_effect_proof_ref='%s:progress-epoch:%d' % (self.operation_id, progress['progress_epoch']),
                    error=dict(code='permission_denied', evidence_ref=self.cancel_decision, offending_field='permission_snapshot_ref')))
            else:
                self._require_progress('terminal_unsettled', ('stop_reserved', 'receipt_committed', 'owners_settled', 'event_ready', 'event_unknown'))
                result = self.check('RecoveryRequiredResult', dict(schema_id='pm.goal.cancel.result.v3', schema_version='3.0.0',
                    command_id=C1.COMMAND, command_instance_id=self.request['command_instance_id'], operation_id=self.operation_id,
                    **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')}, status='recovery_required',
                    original_progress_selector=self._selector(), stop_effect='latched',
                    receipt_effect='committed' if self.progress['cancellation_receipt'] else 'not_committed',
                    event_effect='unknown' if self.progress['phase'] == 'event_unknown' else 'not_attempted',
                    control_effect='not_published', original_effect_evidence_refs=[self.key('goal_cancel_stop_receipt')],
                    resolution_owner_ref=self.progress['resolution_owner_ref'],
                    error=dict(code='owner_unavailable', evidence_ref='%s:progress-epoch:%d' % (self.operation_id, self.progress['progress_epoch']),
                               offending_field=None)))
            terminal, prepared, terminal_input = self._terminal_values(kind, result)
            selected = self.wrap('StorageProgress', self.progress)
            self.gcheck(GA + 'UnsettledTerminalEntry', dict(original_source=self.stored_value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'),
                                                                                              'C3/terminal_unsettled/source'),
                                                            terminal_input=terminal_input, original_selected_progress=selected))
            if prior is not None:
                self.progress = prior
            self.at('terminal_unsettled', 'final')
            self.recheck('terminal_unsettled', 'final', entry)
            if prior is not None:
                self.progress = progress
            tx = w.write(extra + [w.put('goal_cancel_terminal_audit', self.key('goal_cancel_terminal_audit'), self.wrap('StorageTerminal', terminal))])
            self.terminal_value = terminal
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(terminal)

    def replay(self, request):
        """Exact duplicate dispatch after the terminal: the original, no new effect (no Stop, D05/D06 or append)."""
        w = self.world
        with self.call('replay', dict(request=request)) as slot:
            generation, events = w.storage.cell_generation, len(w.storage.events)
            handle, accepted = w.sir.accept(request)
            require('C3/replay/operation', accepted['identity']['operation_id'] == self.operation_id)
            stored = w.value('goal_cancel_terminal_audit', self.key('goal_cancel_terminal_audit'))
            require('C3/replay/terminal_issued', stored is not None)
            require('C3/replay/original_terminal', same(stored['record'], self.terminal_value))
            require('C3/replay/no_effect', w.storage.cell_generation == generation and len(w.storage.events) == events)
            slot.set(dict(replay=True))
            return copy.deepcopy(stored['record'])

    # ------------------------------------------------------------------ passive retained readers
    def read_retained_success(self):
        w = self.world
        with self.call('read_retained_success') as slot:
            generation = w.storage.cell_generation
            terminal = self.stored_value('goal_cancel_terminal_audit', self.key('goal_cancel_terminal_audit'), 'C3/read_retained_success/terminal_unavailable')
            require('C3/read_retained_success/succeeded', terminal['record']['kind'] == 'succeeded')
            selector = terminal['record']['terminal_progress_selector']
            selected = self.stored_value('goal_cancel_progress', selector['snapshot_key'], 'C3/read_retained_success/progress_unavailable')
            require('C3/read_retained_success/selected_progress', row_sha(selected) == terminal['record']['terminal_progress_sha256']
                    and selected['record']['progress_epoch'] == selector['progress_epoch'])
            source = self.stored_value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'), 'C3/read_retained_success/source_unavailable')
            require('C3/read_retained_success/source', row_sha(source) == terminal['record']['source_audit_sha256'])
            proof = self.stored_value(SCOPE_PROOF, self.key(SCOPE_PROOF), 'C3/read_retained_success/proof_unavailable')
            settlement = selected['record']['owner_settlement']
            require('C3/read_retained_success/proof_settlement', settlement['kind'] == 'workflow_settled'
                    and row_sha(proof) == settlement['original_scope_proof_sha256'])
            audit = self.stored_value(LATE_AUDIT, self.key(LATE_AUDIT), 'C3/read_retained_success/assignment_unavailable')
            require('C3/read_retained_success/assignment_event', audit['record']['original_event_id'] == selected['record']['publication']['event_id'])
            retained = w.native.d06.retained(self.wf_run)
            require('C3/read_retained_success/d06_result', row_sha(retained['original_result_storage']) == proof['record']['d06_result']['complete_value_sha256']
                    == settlement['original_owner_settlement_sha256'])
            require('C3/read_retained_success/d06_origin', row_sha(retained['original_origin_storage']) == proof['record']['d06_origin']['complete_value_sha256'])
            self.gcheck(GA + 'SucceededRetainedEntry', dict(original_source=source, original_terminal=terminal, original_workflow_proof=proof,
                                                            original_assignment=audit, original_selected_progress=selected))
            result = self.check('AuditReadResult', dict(kind='terminal', value=copy.deepcopy(terminal['record']), action_authority='none'))
            require('C3/read_retained_success/passive', w.storage.cell_generation == generation)
            slot.set(dict(kind='succeeded'))
            return result

    def read_retained_unsettled(self):
        w = self.world
        with self.call('read_retained_unsettled') as slot:
            generation = w.storage.cell_generation
            terminal = self.stored_value('goal_cancel_terminal_audit', self.key('goal_cancel_terminal_audit'), 'C3/read_retained_unsettled/terminal_unavailable')
            require('C3/read_retained_unsettled/kind', terminal['record']['kind'] in ('no_effect', 'unknown'))
            selector = terminal['record']['terminal_progress_selector']
            selected = self.stored_value('goal_cancel_progress', selector['snapshot_key'], 'C3/read_retained_unsettled/progress_unavailable')
            require('C3/read_retained_unsettled/selected_progress', row_sha(selected) == terminal['record']['terminal_progress_sha256'])
            source = self.stored_value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'), 'C3/read_retained_unsettled/source_unavailable')
            require('C3/read_retained_unsettled/source', row_sha(source) == terminal['record']['source_audit_sha256'])
            self.gcheck(GA + 'UnsettledRetainedEntry', dict(original_source=source, original_terminal=terminal, original_selected_progress=selected))
            result = self.check('AuditReadResult', dict(kind='terminal', value=copy.deepcopy(terminal['record']), action_authority='none'))
            require('C3/read_retained_unsettled/passive', w.storage.cell_generation == generation)
            slot.set(dict(kind=terminal['record']['kind']))
            return result

    # ------------------------------------------------------------------ whole run
    STEPS = ('capture_source', 'prepare', 'latch_and_reserve', 'commit_receipt', 'native', 'settle_owner', 'freeze_event',
             'reserve_assignment', 'issue_assignment_audit', 'append_original', 'publish_control', 'terminal_succeeded')

    def run(self, until='terminal_succeeded'):
        if getattr(self, 'request', None) is None:
            self.dispatch(self.user_request())
        for name in self.STEPS:
            (self.run_native if name == 'native' else getattr(self, name))()
            if name == until:
                break
        return self
