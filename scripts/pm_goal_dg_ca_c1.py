#!/usr/bin/env python3
"""DG-CA C1: authenticated no-association goal.cancelled original path (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Protocol W2 (``Plans/goal_own_c_contracts/protocol.md``) and the DG judge's C1
complete case: a freshly enrolled Goal (``birth_none`` jointly with its body,
v2 control, host Stop domain and binding revision0/control0, under an
installed writer domain), genuine prior Stop history and body mutations, the
SIR's accepted dispatch, and complete association inventories issued by the
Plan, Workflow and Scheduler owners. The coordinator then runs the original
ordered methods: C-source (``capture_source``), C-stop (``latch_and_reserve``),
the original cancellation receipt, a genuine ``none_required`` settlement
derived from the owners' authenticated empty inventories, the frozen Event,
the original first append and full-value custody issued by the test-owner
Storage, the cancellation control publication and the SIR-050 terminal.

Each method acquires its whole sources at entry, rechecks every one of them
after each returning lower helper and immediately before its single Storage
transaction (``<route>/<method>/<point>/<source>``), validates every complete
argument/result in its selected original realm, and records before/after
observations of every registered owner and Storage. Values come from the
owners' own execution; nothing is copied from a fixture.
"""
from __future__ import annotations

import copy
import json

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_current_writer_oracles import recipe
from pm_goal_dg_ca_owners import (World, require, exact_numbers, Refusal, uid, row_sha, packed, same, sha, scoped_key, CANCEL, BINDING,
                                  BODY, APPEND, QUALIFICATION, NATIVE_LINE, transaction_record)

LEGAL_STATES = ('active', 'paused', 'blocked')
COMMAND = 'cmd.chat.goal.cancel'
PAYLOAD_SCHEMA = 'pm.goal_runtime_event.goal_cancelled.schema.v3'
RESULT_SCHEMA_REF = dict(path='Plans/goal_runtime_contracts.schema.json', json_pointer='#/$defs/GoalCancelResultV2',
                         schema_id='pm.goal.cancel.result.v2')


def wrapper(world, uri, name, record, key=None):
    """Whole stored wrapper with the schema's own constant identity members."""
    schema = world.roots.banks['producer'].registry.resolver().lookup(uri + '#/$defs/' + name).contents
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
    world.roots.check('producer', uri + '#/$defs/' + name, value)
    return value


class Route:
    """Shared boundary discipline for the DG-CA route coordinators."""
    code = 'ROUTE'

    def __init__(self, world):
        self.world = world
        self.coordinator_id = uid('TEST_ONLY:coordinator:' + self.code)
        self.inject = {}
        self.visited = []

    @property
    def recorder(self):
        return self.world.recorder

    def at(self, method, point):
        self.visited.append((method, point))
        hook = self.inject.pop((method, point), None)
        if hook is not None:
            hook(self)

    def observe_sources(self):
        raise NotImplementedError

    def recheck(self, method, point, entry):
        now = self.observe_sources()
        for name in entry:
            require('%s/%s/%s/%s' % (self.code, method, point, name), now.get(name) == entry[name])

    def call(self, method, args=None):
        return self.recorder.call(self.coordinator_id, method, args)


class NoAssociationCancel(Route):
    code = 'C1'

    def __init__(self, world, *, state='active', prior_stop=True, objective='TEST_ONLY original objective 🌱',
                 actor_ref=None, birth=True):
        super().__init__(world)
        self.actor_ref = actor_ref or uid('TEST_ONLY:person')
        self.state_target = state
        self.scope = None
        self.operation_id = None
        self.progress = None
        self.source = None
        self.terminal_value = None
        self.append_request = None
        self.event_handle = None
        self.inventory_handles = {}
        if birth:
            self.setup(state=state, prior_stop=prior_stop, objective=objective)

    # ------------------------------------------------------------ setup
    def setup(self, *, state, prior_stop, objective):
        w = self.world
        w.registration.register_all()
        install_handle, install_decision = w.permissions.grant(w.binding.owner_id, {'storage_instance_id': w.storage_id},
                                                               'goal.execution_binding.install_writer_domain')
        w.binding.install_writer_domain(w.permissions.selection(install_decision))
        _, create_decision = w.permissions.grant(self.actor_ref, {'storage_instance_id': w.storage_id}, 'goal.create')
        self.birth_none(objective, create_decision)
        if prior_stop:
            w.host_stop.manual(self.scope, 'stop')
            w.host_stop.manual(self.scope, 'resume')
        if state == 'paused':
            w.goal.mutate_state(self.scope, 'paused')
        elif state == 'blocked':
            w.goal.mutate_state(self.scope, 'blocked', reason_ref=uid('TEST_ONLY:blocker'))
        elif state == 'completed':
            w.goal.mutate_state(self.scope, 'completed')
        _, self.cancel_decision = w.permissions.grant(self.actor_ref, copy.deepcopy(self.scope), 'goal.cancel')

    def birth_none(self, objective, decision):
        """birth_none: joint Goal birth with binding revision0/control0; no execution."""
        w = self.world
        with self.call('birth_none') as slot:
            sel = w.binding.require_writer('goal_birth')
            require('C1/birth_none/permission', w.permissions.allowed(decision, self.actor_ref, 'goal.create'))
            scope = dict(storage_instance_id=w.storage_id, project_id=uid('TEST_ONLY-project'), thread_id=uid('TEST_ONLY:thread'),
                         goal_id=uid('TEST_ONLY:goal'))
            operation = uid('TEST_ONLY:goal-birth-operation')
            message = uid('TEST_ONLY:message')
            values = w.goal.birth_values(scope, objective, message, uid('TEST_ONLY:context-manifest'))
            gk = w.goal.keys(scope, 1)
            body_w, rev_w, origin_w = w.goal.wrap('body', values['body']), w.goal.wrap('revision', values['revision']), w.goal.wrap('origin', values['origin'])
            control_w = w.goal.wrap('control', values['control'])
            stop_record = w.host_stop.birth_record(scope, operation)
            stop_w = w.host_stop.wrapper(stop_record)
            revision, dsel = w.binding.birth_values(scope, operation, w.host_stop.owner_id, w.host_stop.owner_epoch)
            bk = w.binding.keys(scope, 0)
            rev_bw = w.binding.wrap('StorageBindingRevision', bk['revision'], revision)
            rsel = dict(family_id=w.binding.REVISION, physical_key=bk['revision'], schema_id=rev_bw['schema_id'],
                        schema_version=rev_bw['schema_version'], codec_id='pm.storage.canonical_msgpack.v1',
                        complete_value_sha256=row_sha(rev_bw))
            origin = w.roots.check('producer', BINDING + '#/$defs/BindingOrigin', dict(
                scope=copy.deepcopy(scope), binding_revision=0, issued_revision_key=bk['revision'],
                issued_revision_sha256=rsel['complete_value_sha256'], before_control_sha256=None,
                original_goal_body_sha256=row_sha(body_w), original_goal_control_sha256=row_sha(control_w),
                original_stop_control_sha256=row_sha(stop_w), original_source_members=[],
                issuer=transaction_record(w.goal, 'owner.goal.execution_binding.birth_none.v1', operation,
                                          w.permissions.selection(decision), uid('TEST_ONLY:birth-tx'), message)))
            origin_bw = w.binding.wrap('StorageBindingOrigin', bk['origin'], origin)
            osel = dict(rsel, family_id=w.binding.ORIGIN, physical_key=bk['origin'], schema_id=origin_bw['schema_id'],
                        schema_version=origin_bw['schema_version'], complete_value_sha256=row_sha(origin_bw))
            control = w.roots.check('producer', BINDING + '#/$defs/BindingControl', dict(
                scope=copy.deepcopy(scope), control_epoch=0, binding_revision=0, current_revision=rsel, current_origin=osel,
                writer_domain=dsel, pending=None))
            control_bw = w.binding.wrap('StorageBindingControl', bk['control'], control)
            writes = [w.put(w.goal.BODY, gk['body'], body_w), w.put(w.goal.REVISION, gk['revision'], rev_w),
                      w.put(w.goal.ORIGIN, gk['origin'], origin_w), w.put(w.goal.CONTROL, gk['control'], control_w),
                      w.put(w.host_stop.FAMILY, w.host_stop.key(scope), stop_w),
                      w.put(w.binding.REVISION, bk['revision'], rev_bw), w.put(w.binding.ORIGIN, bk['origin'], origin_bw),
                      w.put(w.binding.CONTROL, bk['control'], control_bw)]
            for write in writes:
                require('C1/birth_none/destination_absent', w.cell(write['table'], write['key']) is None)
            self.at('birth_none', 'final')
            require('C1/birth_none/final/writer', same(w.binding.require_writer('goal_birth'), sel))
            require('C1/birth_none/final/permission', w.permissions.allowed(decision, self.actor_ref, 'goal.create'))
            tx = w.write(writes)
            w.goal._issue(None, dict(qualification=QUALIFICATION, birth=operation, tx_id=tx['tx_id']), kind='goal_birth')
            w.host_stop._issue(None, stop_record, kind='stop_domain_birth', ref=operation)
            self.scope = scope
            w.goal.snapshot(scope)
            read = w.binding.read_current(scope)
            require('C1/birth_none/readback', same(read['control']['value'], control_bw) and same(read['revision']['value'], rev_bw))
            slot.set(dict(tx=tx['tx_id'], scope=scope))
            return scope

    # ------------------------------------------------------------ helpers
    def key(self, prefix):
        return prefix.removesuffix('.v1') + ':' + scoped_key(self.scope) + ':' + self.operation_id.encode().hex()

    def progress_key(self, epoch):
        return self.key('goal_cancel_progress') + ':epoch:%d' % epoch

    def wrap(self, name, record, key=None, uri=CANCEL):
        return wrapper(self.world, uri, name, record, key)

    def row_hash(self, name, record):
        return row_sha(self.wrap({'SourceAudit': 'StorageSourceAudit', 'StopControl': 'StorageStopControl',
                                  'StopReceipt': 'StorageStopReceipt', 'CancellationReceipt': 'StorageCancellationReceipt',
                                  'BodyControlV2': 'StorageBodyControlV2', 'Progress': 'StorageProgress',
                                  'ControlPublication': 'StorageControlPublication', 'Terminal': 'StorageTerminal'}[name], record))

    def h(self, value):
        """SP-304's retained original canonical-JSON digest preimage recipe."""
        return self.world.codec.h(value)

    def intent_hash(self, intent):
        return sha(b'pm.goal.cancel.stop_intent.v1\n' + self.world.codec.raw(intent))

    def check(self, name, value, uri=CANCEL):
        self.world.roots.check('producer', uri + '#/$defs/' + name, value)
        return exact_numbers(value, 'check')

    def display(self):
        """Current Goal display: active until the cancellation control is published."""
        control = self.world.goal.control(self.scope)['value']['record']
        body = self.world.goal.body_cell(self.scope)['value']['record']
        return 'cancelled' if control['cancellation_receipt_ref'] is not None else body['state']

    def observe_sources(self):
        w, scope = self.world, self.scope
        observe = A.observation_digest
        out = dict(
            accepted=observe([w.value(w.sir.ACCEPTED, self.request['command_instance_id']) if getattr(self, 'request', None) else None,
                              w.sir.owner_epoch]),
            permission=observe(w.value(w.permissions.FAMILY, self.cancel_decision)),
            body=observe([w.goal.body_cell(scope), w.goal.history_cells(scope)]),
            control=observe(w.goal.control(scope)),
            stop=observe(w.host_stop.current(scope)),
            binding=observe([w.cell(w.binding.CONTROL, w.binding.keys(scope)['control'])] +
                            [w.cell(t, k) for t, k in self._binding_member_keys()]),
            domain=observe([w.binding.domain_selection(), w.binding.domain_withdrawn, w.registration.rows()]),
            inventory=observe([[o.available, o.owner_epoch, sorted(m['member_ref'] for m in o.members.get(scoped_key(scope), []))]
                               for o in self.association_owners()]),
            progress=observe(w.cell('goal_cancel_progress', self.key('goal_cancel_progress') + ':head') if self.operation_id else None))
        return out

    def _binding_member_keys(self):
        w = self.world
        control = w.value(w.binding.CONTROL, w.binding.keys(self.scope)['control'])
        if control is None:
            return []
        r = control['record']
        return [(r['current_revision']['family_id'], r['current_revision']['physical_key']),
                (r['current_origin']['family_id'], r['current_origin']['physical_key'])]

    def association_owners(self):
        w = self.world
        return [w.plan_inventory, w.workflow_inventory, w.scheduler_inventory]

    # ------------------------------------------------------------ request
    def user_request(self, **changes):
        """The user's explicit Cancel request as the surface submits it."""
        body = self.world.goal.body_cell(self.scope)['value']['record']
        request = dict(schema_id='pm.goal.cancel.request.v2', schema_version='2.0.0', command_id=COMMAND,
                       command_instance_id=uid('TEST_ONLY:command-instance'), project_id=self.scope['project_id'],
                       thread_id=self.scope['thread_id'], goal_id=self.scope['goal_id'], expected_revision=body['revision'],
                       expected_currentness_hash=body['currentness_hash'], actor_ref=self.actor_ref,
                       permission_snapshot_ref=self.cancel_decision, idempotency_key=uid('TEST_ONLY:sir-idempotency'),
                       source_surface='chat_goal_cancel', return_route_ref=uid('TEST_ONLY:return-route'))
        request.update(changes)
        return request

    def dispatch(self, request):
        handle, record = self.world.sir.accept(request)
        self.request, self.sir_handle = copy.deepcopy(request), handle
        self.operation_id = record['identity']['operation_id']
        return handle

    # ------------------------------------------------------------ C-source
    def capture_source(self, request=None, sir_handle=None):
        w = self.world
        request = copy.deepcopy(self.request if request is None else request)
        sir_handle = self.sir_handle if sir_handle is None else sir_handle
        with self.call('capture_source', dict(request=request)) as slot:
            entry = self.observe_sources()
            self.check('GoalCancelRequestV2', request)
            ref, accepted = A.acquire(w.registry, w.sir.owner_id, 'sir', sir_handle)
            require('C1/capture_source/accepted_dispatch', same(accepted['request'], request))
            require('C1/capture_source/accepted_custody', same(w.sir.stored(request['command_instance_id']), accepted))
            require('C1/capture_source/accepted_operation', accepted['identity']['operation_id'] == self.operation_id)
            require('C1/capture_source/sir_epoch', accepted['owner_epoch'] == w.sir.owner_epoch)
            existing = w.value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'))
            if existing is not None:
                require('C1/capture_source/retry_conflict', same(existing['record']['request'], request))
                slot.set(dict(replay=True))
                return copy.deepcopy(existing['record'])
            require('C1/capture_source/writer_cutoff', w.binding.domain_withdrawn is False)
            require('C1/capture_source/permission', w.permissions.allowed(request['permission_snapshot_ref'], request['actor_ref'], 'goal.cancel'))
            snapshot = w.goal.snapshot(self.scope)
            body = snapshot['body']
            control_cell = w.goal.control(self.scope)
            control = control_cell['value']['record']
            require('C1/capture_source/scope', all(request[k] == self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')))
            require('C1/capture_source/legal_state', body['state'] in LEGAL_STATES)
            require('C1/capture_source/not_cancelled', control['cancellation_receipt_ref'] is None)
            require('C1/capture_source/not_pending_cancel', control['cancellation_pending'] is None)
            require('C1/capture_source/expected_revision', request['expected_revision'] == body['revision'])
            require('C1/capture_source/expected_currentness', request['expected_currentness_hash'] == body['currentness_hash'])
            require('C1/capture_source/body_active_run', body['active_run_ref'] is None)
            require('C1/capture_source/pending_unresolved', control['pending'] is None)
            # lower helper: actual Goal association source reader
            read = w.binding.read_current(self.scope)
            self.at('capture_source', 'after_binding_read')
            self.recheck('capture_source', 'after_binding_read', entry)
            brev, bctl = read['revision']['value']['record'], read['control']['value']['record']
            require('C1/capture_source/binding_associations', brev['associations'] == [] and brev['active_run_ref'] is None)
            require('C1/capture_source/binding_pending', bctl['pending'] is None)
            require('C1/capture_source/binding_host_owner', brev['host_execution_owner_ref'] == w.host_stop.owner_id)
            # lower helpers: each association owner's own complete inventory
            statements = []
            for owner in self.association_owners():
                handle = owner.inventory(self.scope)
                sref, statement = A.acquire(w.registry, owner.owner_id, owner.role, handle)
                require('C1/capture_source/inventory_complete/' + owner.role, statement['complete'] is True)
                require('C1/capture_source/inventory_epoch/' + owner.role, statement['owner_epoch'] == owner.owner_epoch)
                require('C1/capture_source/inventory_nonempty/' + owner.role, statement['members'] == [])
                self.inventory_handles[owner.role] = handle
                statements.append(dict(owner_id=owner.owner_id, role=owner.role, statement_ref=sref,
                                       statement_sha256=owner.statement_digest(statement), members=[]))
            self.at('capture_source', 'after_inventory')
            self.recheck('capture_source', 'after_inventory', entry)
            stop = w.host_stop.record(self.scope)
            self.at('capture_source', 'after_stop_read')
            self.recheck('capture_source', 'after_stop_read', entry)
            # entire candidate
            history = w.goal.history_cells(self.scope)
            inventory = [dict(revision_key=w.goal.keys(self.scope, int(n))['revision'], revision_outer_sha256=row_sha(cells[0]['value']),
                              origin_key=w.goal.keys(self.scope, int(n))['origin'], origin_outer_sha256=row_sha(cells[1]['value']))
                         for n, cells in sorted(history.items(), key=lambda x: int(x[0]))]
            gk = w.goal.keys(self.scope)
            selection_key = self.key('goal_cancel_binding_selection')
            binding = self.check('ExecutionBinding', dict(kind='no_bound_plan', active_run_ref=None, goal_plan_binding_ref=None,
                                 goal_plan_binding_sha256=None, assistant_plan_id=None, plan_run_id=None, plan_version=None,
                                 plan_hash=None, execution_owner_ref=brev['host_execution_owner_ref'],
                                 original_binding_source_ref=selection_key))
            body_selection = self.check('BodySelection', {**self.scope, 'body_key': gk['body'],
                'body_outer_sha256': row_sha(w.goal.body_cell(self.scope)['value']), 'body_semantic_sha256': control['body_sha256'],
                'revision': body['revision'], 'currentness_hash': body['currentness_hash'], 'control_key': gk['control'],
                'control_outer_sha256': row_sha(control_cell['value']), 'control_epoch': control['control_epoch'],
                'latest_objective_revision': control['latest_objective_revision'], 'latest_revision_hash': control['latest_revision_hash'],
                'origin_key': control['origin_key'], 'complete_history_origin_inventory_sha256': self.h(inventory),
                'state': body['state'], 'active_run_ref': body['active_run_ref']})
            self.event_id, self.event_key = recipe('goal.cancelled', {**self.scope, 'command_id': COMMAND,
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
            progress = self.check('Progress', dict(schema_id='pm.goal.cancel.progress.v1', schema_version='1.0.0', **self.scope,
                operation_id=self.operation_id, source_audit_sha256=row_sha(source_w), progress_epoch=0, phase='source_admitted',
                stop_intent=None, stop_receipt=None, reservation_sha256=None, cancellation_receipt=None, owner_settlement=None,
                producer_input=None, publication=None, control_publication=None, resolution_owner_ref=self.coordinator_id))
            proof_key, proof = w.binding.issue_inventory_proof(self.scope, statements, self.operation_id)
            reader = transaction_record(w.binding, 'owner.goal.execution_binding.read_current_for_cancel.v1', self.operation_id,
                                        w.permissions.selection(self.cancel_decision), uid('TEST_ONLY:binding-read-tx'), proof_key)
            bsel = lambda family, cell: dict(family_id=family, physical_key=cell['value']['physical_key'], schema_id=cell['value']['schema_id'],
                                             schema_version=cell['value']['schema_version'], codec_id='pm.storage.canonical_msgpack.v1',
                                             complete_value_sha256=row_sha(cell['value']))
            hkey = 'goal_execution_writer_domain_head.v1:' + w.binding.storage_key()
            selection = self.check('BindingSelection', dict(scope=copy.deepcopy(self.scope), operation_id=self.operation_id,
                original_command_instance_id=request['command_instance_id'], original_dispatch_id=accepted['dispatch_id'],
                binding_control=bsel(w.binding.CONTROL, read['control']), binding_revision=bsel(w.binding.REVISION, read['revision']),
                binding_origin=bsel(w.binding.ORIGIN, read['origin']), writer_domain_head=bsel(w.binding.HEAD, w.cell(w.binding.HEAD, hkey)),
                writer_domain=read['domain_selection'], original_goal_body_sha256=body_selection['body_outer_sha256'],
                original_goal_control_sha256=body_selection['control_outer_sha256'],
                original_stop_control_sha256=source['original_stop_control_sha256'], actual_active_run_ref=None,
                original_pending_binding_operation_id=None, original_pending_binding_candidate_sha256=None, association_count=0,
                disposition='no_execution_association', original_reader=reader), BINDING)
            selection_w = self.wrap('StorageBindingSelection', selection, selection_key, BINDING)
            # read_current_for_cancel complete request/return roots over the actual stored members.
            self.binding_read_request = self.check('BindingReadRequest', dict(scope=copy.deepcopy(self.scope), purpose='current_for_cancel',
                operation_id=self.operation_id, expected_selection=selection['binding_control']), BINDING)
            self.binding_read_current = self.check('BindingReadCurrent', dict(scope=copy.deepcopy(self.scope),
                control=copy.deepcopy(bctl), revision=copy.deepcopy(brev), origin=copy.deepcopy(read['origin']['value']['record']),
                domain=copy.deepcopy(read['domain']['record']), original_execution_binding=binding, selection=selection), BINDING)
            head = self._head(0, progress)
            self.at('capture_source', 'final')
            self.recheck('capture_source', 'final', entry)
            writes = [w.put('goal_cancel_source_audit', self.key('goal_cancel_source_audit'), source_w),
                      w.put('goal_cancel_progress', self.progress_key(0), self.wrap('StorageProgress', progress)),
                      w.put('goal_cancel_progress', self.key('goal_cancel_progress') + ':head', self.wrap('StorageProgress', head)),
                      w.put('goal_cancel_binding_selection', selection_key, selection_w),
                      w.put(w.binding.PROOF, proof_key, proof)]
            tx = w.write(writes)
            self.source, self.progress, self.proof_key = source, progress, proof_key
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(source)

    def _head(self, epoch, progress):
        return self.check('ProgressHead', dict(schema_id='pm.goal.cancel.progress_head.v1', schema_version='1.0.0', **self.scope,
                          operation_id=self.operation_id, progress_epoch=epoch,
                          snapshot_sha256=row_sha(self.wrap('StorageProgress', progress))))

    def _progress(self, phase, **updates):
        value = copy.deepcopy(self.progress)
        value.update(phase=phase, progress_epoch=NR.uint64(value['progress_epoch'] + 1, 'C1/progress_epoch'), **updates)
        return self.check('Progress', value)

    def _progress_writes(self, progress):
        w = self.world
        head_key = self.key('goal_cancel_progress') + ':head'
        head_cell = w.cell('goal_cancel_progress', head_key)
        return [w.put('goal_cancel_progress', self.progress_key(progress['progress_epoch']), self.wrap('StorageProgress', progress)),
                w.put('goal_cancel_progress', head_key, self.wrap('StorageProgress', self._head(progress['progress_epoch'], progress)),
                      expected=head_cell['version'])]

    def _require_progress(self, method, phases):
        w = self.world
        head = w.value('goal_cancel_progress', self.key('goal_cancel_progress') + ':head') if self.operation_id else None
        require('C1/%s/phase' % method, head is not None and self.progress is not None and self.progress['phase'] in phases)
        stored = w.value('goal_cancel_progress', self.progress_key(head['record']['progress_epoch']))
        require('C1/%s/progress_custody' % method, stored is not None and same(stored['record'], self.progress)
                and head['record']['snapshot_sha256'] == row_sha(stored))
        source = w.value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'))
        require('C1/%s/source_custody' % method, source is not None and same(source['record'], self.source)
                and row_sha(source) == self.progress['source_audit_sha256'])

    # ------------------------------------------------------------ C-stop
    def latch_and_reserve(self):
        w = self.world
        with self.call('latch_and_reserve') as slot:
            entry = self.observe_sources()
            self._require_progress('latch_and_reserve', ('source_admitted',))
            require('C1/latch_and_reserve/writer_cutoff', w.binding.domain_withdrawn is False)
            require('C1/latch_and_reserve/permission', w.permissions.allowed(self.cancel_decision, self.actor_ref, 'goal.cancel'))
            stop_cell = w.host_stop.current(self.scope)
            self.at('latch_and_reserve', 'after_stop_read')
            self.recheck('latch_and_reserve', 'after_stop_read', entry)
            stop = copy.deepcopy(stop_cell['value']['record'])
            require('C1/latch_and_reserve/original_stop', row_sha(stop_cell['value']) == self.source['original_stop_control_sha256'])
            control_cell = w.goal.control(self.scope)
            self.at('latch_and_reserve', 'after_control_read')
            self.recheck('latch_and_reserve', 'after_control_read', entry)
            control = copy.deepcopy(control_cell['value']['record'])
            require('C1/latch_and_reserve/original_control', row_sha(control_cell['value']) == self.source['original_body']['control_outer_sha256'])
            source_sha = self.progress['source_audit_sha256']
            intent = self.check('StopIntent', dict(schema_id='pm.goal.cancel.stop_intent.v1', schema_version='1.0.0', **self.scope,
                operation_id=self.operation_id, source_audit_sha256=source_sha, before_stop_control_sha256=row_sha(stop_cell['value']),
                before_user_stop_epoch=stop['user_stop_epoch'], after_user_stop_epoch=NR.uint64(stop['user_stop_epoch'] + 1, 'C1/stop_epoch'),
                before_continuation_epoch=stop['continuation_epoch'],
                after_continuation_epoch=NR.uint64(stop['continuation_epoch'] + 1, 'C1/continuation_epoch'),
                expected_revision=self.request['expected_revision'], expected_currentness_hash=self.request['expected_currentness_hash'],
                original_execution_binding=self.source['original_execution_binding'], original_host_owner_epoch=w.host_stop.owner_epoch,
                original_accepted_cancel_ref=self.source['original_user_cancel_acceptance_ref'], requested_at=w.goal.clock.now()))
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
            control.update(control_epoch=NR.uint64(control['control_epoch'] + 1, 'C1/control_epoch'), cancellation_pending=pending)
            progress = self._progress('stop_reserved', stop_intent=intent, stop_receipt=receipt, reservation_sha256=self.h(pending))
            self.at('latch_and_reserve', 'final')
            self.recheck('latch_and_reserve', 'final', entry)
            writes = [w.put(w.host_stop.FAMILY, w.host_stop.key(self.scope), w.host_stop.wrapper(stop), expected=stop_cell['version']),
                      w.put('goal_cancel_stop_receipt', self.key('goal_cancel_stop_receipt'), receipt_w),
                      w.put(w.goal.CONTROL, w.goal.keys(self.scope)['control'], w.goal.wrap('control', control), expected=control_cell['version'])]
            tx = w.write(writes + self._progress_writes(progress))
            w.host_stop._issue(None, receipt, kind='cancel_stop_receipt', ref=host_tx_ref)
            self.progress = progress
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(receipt)

    # ------------------------------------------------------------ receipt
    def commit_receipt(self):
        w = self.world
        with self.call('commit_receipt') as slot:
            entry = self.observe_sources()
            self._require_progress('commit_receipt', ('stop_reserved',))
            require('C1/commit_receipt/writer_cutoff', w.binding.domain_withdrawn is False)
            stop_receipt = w.value('goal_cancel_stop_receipt', self.key('goal_cancel_stop_receipt'))
            require('C1/commit_receipt/stop_receipt_custody', stop_receipt is not None and same(stop_receipt['record'], self.progress['stop_receipt']))
            stop = w.host_stop.record(self.scope)
            require('C1/commit_receipt/stop_latched', stop['latched'] is True and stop['last_original_stop_receipt_sha256'] == row_sha(stop_receipt))
            self.at('commit_receipt', 'after_stop_read')
            self.recheck('commit_receipt', 'after_stop_read', entry)
            receipt = self.check('CancellationReceipt', dict(schema_id='pm.goal.cancel.receipt.v1', schema_version='1.0.0', **self.scope,
                operation_id=self.operation_id, cancellation_id=self.operation_id, source_audit_sha256=self.progress['source_audit_sha256'],
                original_revision=self.request['expected_revision'], original_currentness_hash=self.request['expected_currentness_hash'],
                stop_receipt_ref=self.key('goal_cancel_stop_receipt'), stop_receipt_sha256=row_sha(stop_receipt),
                user_stop_epoch=self.progress['stop_receipt']['after_user_stop_epoch'], cancel_reason='user_cancelled',
                accepted_at=w.goal.clock.now()))
            progress = self._progress('receipt_committed', cancellation_receipt=receipt)
            self.at('commit_receipt', 'final')
            self.recheck('commit_receipt', 'final', entry)
            tx = w.write([w.put('goal_cancel_receipt', self.key('goal_cancel_receipt'), self.wrap('StorageCancellationReceipt', receipt))]
                         + self._progress_writes(progress))
            self.progress = progress
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(receipt)

    # ------------------------------------------------------------ settlement
    def settle_owner(self):
        w = self.world
        with self.call('settle_owner') as slot:
            entry = self.observe_sources()
            self._require_progress('settle_owner', ('receipt_committed',))
            proof = w.value(w.binding.PROOF, self.proof_key)
            require('C1/settle_owner/scope_proof_custody', proof is not None and proof['association_count'] == 0)
            for owner, captured in zip(self.association_owners(), proof['statements']):
                handle = owner.inventory(self.scope)
                _, statement = A.acquire(w.registry, owner.owner_id, owner.role, handle)
                require('C1/settle_owner/inventory_nonempty/' + owner.role, statement['members'] == [] and captured['members'] == [])
                require('C1/settle_owner/inventory_owner/' + owner.role, captured['owner_id'] == owner.owner_id
                        and statement['owner_epoch'] == owner.owner_epoch)
            self.at('settle_owner', 'after_inventory')
            self.recheck('settle_owner', 'after_inventory', entry)
            control = w.goal.control(self.scope)['value']['record']
            require('C1/settle_owner/pending_unresolved', control['pending'] is None)
            settlement = self.check('OwnerSettlement', dict(kind='none_required', original_execution_binding=self.source['original_execution_binding'],
                original_scope_proof_ref=self.proof_key, original_scope_proof_sha256=row_sha(proof), original_owner_settlement_ref=None,
                original_owner_settlement_sha256=None, original_schedule_quota_invalidation_ref=None,
                original_schedule_quota_invalidation_sha256=None))
            progress = self._progress('owners_settled', owner_settlement=settlement)
            self.at('settle_owner', 'final')
            self.recheck('settle_owner', 'final', entry)
            tx = w.write(self._progress_writes(progress))
            self.progress = progress
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(settlement)

    # ------------------------------------------------------------ freeze
    def freeze_event(self):
        w = self.world
        with self.call('freeze_event') as slot:
            entry = self.observe_sources()
            self._require_progress('freeze_event', ('owners_settled',))
            receipt = self.progress['cancellation_receipt']
            stored = w.value('goal_cancel_receipt', self.key('goal_cancel_receipt'))
            require('C1/freeze_event/receipt_custody', stored is not None and same(stored['record'], receipt))
            metadata = self.source['producer_metadata']
            payload = dict(schema_id=PAYLOAD_SCHEMA, schema_version='3.0.0', **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')},
                           operation_id=self.operation_id, command_instance_id=self.request['command_instance_id'],
                           cancellation_id=receipt['cancellation_id'], revision=self.request['expected_revision'],
                           currentness_hash=self.request['expected_currentness_hash'], cancel_reason='user_cancelled',
                           user_stop_epoch=receipt['user_stop_epoch'], cancellation_receipt_ref=self.key('goal_cancel_receipt'),
                           cancellation_receipt_sha256=row_sha(stored), source_audit_sha256=self.progress['source_audit_sha256'],
                           cancelled_at_utc=receipt['accepted_at'])
            producer = self.check('ProducerInput', dict(metadata, payload=payload))
            require('C1/freeze_event/registered_selector', producer['payload_schema_id'] == w.shared.registry_row['payload_schema_id'])
            progress = self._progress('event_ready', producer_input=producer)
            self.at('freeze_event', 'final')
            self.recheck('freeze_event', 'final', entry)
            tx = w.write(self._progress_writes(progress))
            self.progress = progress
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(producer)

    # ------------------------------------------------------------ append
    def publication_from_custody(self, event_id):
        """OriginalPublication from Storage's own first custody, never the caller's."""
        w = self.world
        custody = w.storage.first_custody(event_id)
        require('C1/append_original/custody_unavailable', custody is not None)
        stored = w.storage.read_event(event_id)
        group = w.storage.active_durable_group(event_id)
        require('C1/append_original/group_member', [m['event_id'] for m in group['members']] == [event_id])
        require('C1/append_original/group_digest', custody['group_digest'] == group['group_digest'])
        receipt = custody['first_append_receipt']
        require('C1/append_original/receipt_sequence', receipt['sequence_id'] == stored['sequence_id'])
        require('C1/append_original/value_commitment', custody['original_event_value_commitment']['sha256'] == NR.full_value_commitment(stored))
        require('C1/append_original/producer_digest', custody['producer_semantic_digest'] == NR.producer_digest(stored))
        publication = self.check('OriginalPublication', dict(event_id=event_id, first_append_receipt=copy.deepcopy(receipt),
            original_append_result=dict(event_id=event_id, sequence_id=stored['sequence_id'], byte_offset=receipt['byte_offset'],
                                        segment_ref=custody['original_segment_ref']),
            original_event_value_commitment=copy.deepcopy(custody['original_event_value_commitment'])))
        return publication, stored

    def append_original(self, *, lose_ack=False, candidate_edit=None):
        w = self.world
        with self.call('append_original') as slot:
            entry = self.observe_sources()
            self._require_progress('append_original', ('event_ready',))
            require('C1/append_original/writer_cutoff', w.binding.domain_withdrawn is False)
            producer = copy.deepcopy(self.progress['producer_input'])
            if candidate_edit is not None:
                producer = candidate_edit(producer)
            require('C1/append_original/frozen_producer', same(producer, self.progress['producer_input']))
            self.append_request = dict(kind='TEST_ONLY:goal.cancelled.append', operation_id=self.operation_id,
                                       producer_sha256=row_sha(producer))
            self.at('append_original', 'final')
            self.recheck('append_original', 'final', entry)
            events, reservation, outcome = w.appender.append_original(self.operation_id, self.append_request, [producer],
                                                                     durability_class='barrier')
            self.reservation = reservation
            if lose_ack:
                # Storage committed; this owner never received the outcome.
                progress = self._progress('event_unknown', publication=None)
                w.write(self._progress_writes(progress))
                self.progress = progress
                slot.set(dict(lost_ack=True))
                return None
            self.event_handle = events[0]
            stored = w.appender.event(events[0])
            require('C1/append_original/stored_producer', same(S.producer25(stored), producer))
            publication, _ = self.publication_from_custody(stored['event_id'])
            require('C1/append_original/handle_custody', same(w.appender.first_receipt(events[0]), w.storage.first_custody(stored['event_id'])))
            progress = self._progress('event_issued', publication=publication)
            tx = w.write(self._progress_writes(progress))
            self.progress = progress
            slot.set(dict(tx=tx['tx_id'], event_id=stored['event_id'], sequence_id=stored['sequence_id']))
            return copy.deepcopy(publication)

    def resolve_original(self):
        """After a lost acknowledgement: resolve the same original from Storage custody."""
        w = self.world
        with self.call('resolve_original') as slot:
            entry = self.observe_sources()
            self._require_progress('resolve_original', ('event_unknown',))
            producer = self.progress['producer_input']
            partition = S.scope_partition(producer)
            event_id = w.storage.event_by_identity(partition, producer['event_type'], producer['idempotency_key'])
            require('C1/resolve_original/event_unknown', event_id is not None)
            publication, stored = self.publication_from_custody(event_id)
            require('C1/resolve_original/stored_producer', same(S.producer25(stored), producer))
            self.at('resolve_original', 'final')
            self.recheck('resolve_original', 'final', entry)
            progress = self._progress('event_issued', publication=publication)
            tx = w.write(self._progress_writes(progress))
            self.progress = progress
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(publication)

    # ------------------------------------------------------------ control
    def publish_control(self):
        w = self.world
        with self.call('publish_control') as slot:
            entry = self.observe_sources()
            self._require_progress('publish_control', ('event_issued',))
            require('C1/publish_control/writer_cutoff', w.binding.domain_withdrawn is False)
            publication = self.progress['publication']
            w.storage.authenticate_receipt(publication['event_id'], publication['first_append_receipt'])
            expected, _ = self.publication_from_custody(publication['event_id'])
            require('C1/publish_control/original_publication', same(expected, publication))
            self.at('publish_control', 'after_custody_read')
            self.recheck('publish_control', 'after_custody_read', entry)
            control_cell = w.goal.control(self.scope)
            control = copy.deepcopy(control_cell['value']['record'])
            require('C1/publish_control/reservation', control['cancellation_pending'] is not None
                    and self.h(control['cancellation_pending']) == self.progress['reservation_sha256'])
            require('C1/publish_control/pending_unresolved', control['pending'] is None)
            before = copy.deepcopy(control_cell['value'])
            control.update(control_epoch=NR.uint64(control['control_epoch'] + 1, 'C1/control_epoch'),
                           cancellation_receipt_ref=self.key('goal_cancel_receipt'), cancellation_pending=None)
            after = w.goal.wrap('control', control)
            receipt_stored = w.value('goal_cancel_receipt', self.key('goal_cancel_receipt'))
            publication_record = self.check('ControlPublication', dict(schema_id='pm.goal.cancel.control_publication.v1',
                schema_version='1.0.0', **self.scope, operation_id=self.operation_id, source_audit_sha256=self.progress['source_audit_sha256'],
                cancellation_receipt_ref=self.key('goal_cancel_receipt'), cancellation_receipt_sha256=row_sha(receipt_stored),
                original_publication=publication, before_control_sha256=row_sha(before), after_control_sha256=row_sha(after),
                before_control_epoch=before['record']['control_epoch'], after_control_epoch=control['control_epoch'],
                body_semantic_sha256=control['body_sha256'], revision=control['current_revision'], currentness_hash=control['currentness_hash'],
                original_owner_settlement=self.progress['owner_settlement'], original_transaction_ref=uid('TEST_ONLY:control-publication-tx'),
                published_at=w.goal.clock.now(), active_projection_removed=True, body_history_unchanged=True))
            progress = self._progress('control_published', control_publication=publication_record)
            self.at('publish_control', 'final')
            self.recheck('publish_control', 'final', entry)
            tx = w.write([w.put(w.goal.CONTROL, w.goal.keys(self.scope)['control'], after, expected=control_cell['version']),
                          w.put('goal_cancel_control_publication', self.key('goal_cancel_control_publication'),
                                self.wrap('StorageControlPublication', publication_record))] + self._progress_writes(progress))
            self.progress = progress
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(publication_record)

    # ------------------------------------------------------------ terminal
    def terminal(self, kind='succeeded', *, lose_ack=False):
        w = self.world
        with self.call('terminal', dict(kind=kind)) as slot:
            entry = self.observe_sources()
            require('C1/terminal/kind', kind in ('succeeded', 'unknown', 'no_effect'))
            existing = w.value('goal_cancel_terminal_audit', self.key('goal_cancel_terminal_audit'))
            require('C1/terminal/already_issued', existing is None)
            extra_writes, prior_progress = [], None
            if kind == 'succeeded':
                self._require_progress('terminal', ('control_published',))
                publication = self.progress['publication']
                w.storage.authenticate_receipt(publication['event_id'], publication['first_append_receipt'])
                control = w.goal.control(self.scope)['value']['record']
                require('C1/terminal/control_published', control['cancellation_receipt_ref'] == self.key('goal_cancel_receipt'))
                result = self.check('SucceededResult', dict(schema_id='pm.goal.cancel.result.v2', schema_version='2.0.0', command_id=COMMAND,
                    command_instance_id=self.request['command_instance_id'], operation_id=self.operation_id,
                    **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')}, status='succeeded',
                    cancellation_receipt=self.progress['cancellation_receipt'], publication=publication,
                    control_publication=self.progress['control_publication']))
            elif kind == 'no_effect':
                self._require_progress('terminal', ('source_admitted',))
                stop = w.host_stop.current(self.scope)['value']
                require('C1/terminal/no_effect_stop_unchanged', row_sha(stop) == self.source['original_stop_control_sha256'])
                require('C1/terminal/no_effect_unpermitted', not w.permissions.allowed(self.cancel_decision, self.actor_ref, 'goal.cancel'))
                progress = self._progress('no_effect')
                extra_writes = self._progress_writes(progress)
                self.progress, prior_progress = progress, self.progress
                result = self.check('NoEffectResult', dict(schema_id='pm.goal.cancel.result.v2', schema_version='2.0.0', command_id=COMMAND,
                    command_instance_id=self.request['command_instance_id'], operation_id=self.operation_id,
                    **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')}, status='failed', effect_disposition='no_effect',
                    no_effect_proof_ref='%s:progress-epoch:%d' % (self.operation_id, progress['progress_epoch']),
                    error=dict(code='permission_denied', evidence_ref=self.cancel_decision, offending_field='permission_snapshot_ref')))
            else:
                self._require_progress('terminal', ('stop_reserved', 'receipt_committed', 'owners_settled', 'event_ready', 'event_unknown'))
                result = self.check('RecoveryRequiredResult', dict(schema_id='pm.goal.cancel.result.v2', schema_version='2.0.0',
                    command_id=COMMAND, command_instance_id=self.request['command_instance_id'], operation_id=self.operation_id,
                    **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')}, status='recovery_required',
                    original_progress_selector=self._selector(), stop_effect='latched',
                    receipt_effect='committed' if self.progress['cancellation_receipt'] else 'not_committed',
                    event_effect='unknown' if self.progress['phase'] == 'event_unknown' else 'not_attempted',
                    control_effect='not_published', original_effect_evidence_refs=[self.key('goal_cancel_stop_receipt')],
                    resolution_owner_ref=self.progress['resolution_owner_ref'],
                    error=dict(code='owner_unavailable', evidence_ref='%s:progress-epoch:%d' % (self.operation_id, self.progress['progress_epoch']),
                               offending_field=None)))
            terminal, prepared, terminal_input = self._terminal_values(kind, result)
            if prior_progress is not None:
                self.progress = prior_progress
            self.at('terminal', 'final')
            self.recheck('terminal', 'final', entry)
            if prior_progress is not None:
                self.progress = progress
            stored = self.wrap('StorageTerminal', terminal)
            if kind == 'succeeded':
                handle, tx = self._sir_publisher().publish(self.reservation, 'goal_cancel_terminal_audit',
                                                           self.key('goal_cancel_terminal_audit'), stored)
            else:
                tx = w.write(extra_writes + [w.put('goal_cancel_terminal_audit', self.key('goal_cancel_terminal_audit'), stored)])
            self.terminal_value = terminal
            slot.set(dict(tx=tx['tx_id']))
            if lose_ack:
                raise Refusal('C1/terminal/ack_lost')
            return copy.deepcopy(terminal)

    def _sir_publisher(self):
        w = self.world
        if not hasattr(w, 'sir_publisher'):
            w.sir_publisher = A.PublicationOwner(w.registry, w.storage)
        return w.sir_publisher

    def _selector(self):
        return self.check('ProgressSnapshotSelector', dict(**self.scope, operation_id=self.operation_id,
                          progress_epoch=self.progress['progress_epoch'], snapshot_key=self.progress_key(self.progress['progress_epoch'])))

    def _terminal_values(self, kind, result):
        w = self.world
        accepted = w.sir.stored(self.request['command_instance_id'])
        if getattr(self, 'result_ref', None) is None:
            self.result_ref = uid('TEST_ONLY:goal-cancel-result')
        result_ref = self.result_ref
        result_sha = self.h(result)
        selector = self._selector()
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
            dispatch_id=accepted['dispatch_id'], request_ref=accepted['identity']['request_ref'], command_id=COMMAND,
            command_instance_id=self.request['command_instance_id'], response_kind='owner_operation', ack_status='accepted',
            result_status=dict(succeeded='succeeded', unknown='recovery_required', no_effect='failed')[kind],
            error=None if kind == 'succeeded' else dict(code='internal_error' if kind == 'unknown' else 'permission_denied',
                                                        reason=result['status'], offending_field=None),
            event_refs=[self.event_id] if kind == 'succeeded' else [], receipt_ref=result_ref if kind == 'succeeded' else None,
            operation_id=self.operation_id, owner_identity=copy.deepcopy(accepted['identity']['owner_identity']),
            command_outcome_ref=accepted['command_outcome_ref'], owner_result_ref=result_ref,
            owner_result_schema_ref=copy.deepcopy(RESULT_SCHEMA_REF), replayed=False, original_dispatch_id=None, ts=w.sir.clock.now()))
        terminal = self.check('Terminal', dict(schema_id='pm.goal.cancel.terminal_audit.v1', schema_version='1.0.0', **self.scope,
            operation_id=self.operation_id, source_audit_sha256=self.progress['source_audit_sha256'],
            terminal_progress_sha256=self.row_hash('Progress', self.progress), owner_result_ref=result_ref, owner_result_sha256=result_sha,
            terminal_authority_ref=w.sir.owner_id, committed_at=w.sir.clock.now(), kind=kind, result=result, outcome=outcome,
            response=response, terminal_progress_selector=selector))
        prepared = self.check('TerminalPrepared', dict(input_sha256=self.h(terminal_input), candidate_terminal=terminal,
            actual_original_sir_participant_ref=w.sir.owner_id, expected_original_source_sha256=self.progress['source_audit_sha256'],
            publicly_released=False))
        return terminal, prepared, terminal_input

    # ------------------------------------------------------------ replay / audit
    def replay(self, request):
        """Exact duplicate dispatch after the terminal: the original, no new effect."""
        w = self.world
        with self.call('replay', dict(request=request)) as slot:
            generation = w.storage.cell_generation
            handle, accepted = w.sir.accept(request)
            require('C1/replay/operation', accepted['identity']['operation_id'] == self.operation_id)
            stored = w.value('goal_cancel_terminal_audit', self.key('goal_cancel_terminal_audit'))
            require('C1/replay/terminal_issued', stored is not None)
            require('C1/replay/original_terminal', same(stored['record'], self.terminal_value))
            require('C1/replay/no_effect', w.storage.cell_generation == generation)
            slot.set(dict(replay=True))
            return copy.deepcopy(stored['record'])

    def audit_read(self, member, progress_epoch=None, *, audit_permission=True):
        """reader.goal.cancel_command_audit@1.0.0: passive original metadata audit."""
        w = self.world
        with self.call('audit_read', dict(member=member)) as slot:
            request = self.check('AuditReadRequest', dict(reader_binding='reader.goal.cancel_command_audit@1.0.0', **self.scope,
                                 operation_id=self.operation_id, member=member, progress_epoch=progress_epoch))
            require('C1/audit_read/audit_permission', audit_permission is True)
            table, key = dict(source_audit=('goal_cancel_source_audit', self.key('goal_cancel_source_audit')),
                              stop_receipt=('goal_cancel_stop_receipt', self.key('goal_cancel_stop_receipt')),
                              cancellation_receipt=('goal_cancel_receipt', self.key('goal_cancel_receipt')),
                              control_publication=('goal_cancel_control_publication', self.key('goal_cancel_control_publication')),
                              terminal=('goal_cancel_terminal_audit', self.key('goal_cancel_terminal_audit')),
                              progress_epoch=('goal_cancel_progress', self.progress_key(progress_epoch if progress_epoch is not None else 0)),
                              progress_head=('goal_cancel_progress', self.key('goal_cancel_progress') + ':head'))[member]
            cell = w.cell(table, key)
            require('C1/audit_read/member_unavailable', cell is not None)
            generation = w.storage.cell_generation
            result = self.check('AuditReadResult', dict(kind=member, value=copy.deepcopy(cell['value']['record']), action_authority='none'))
            require('C1/audit_read/passive', w.storage.cell_generation == generation)
            slot.set(dict(member=member))
            return result

    def read_retained_selection(self):
        """read_retained_selection: passive historical binding selection audit (BindingReadAudit)."""
        w = self.world
        with self.call('read_retained_selection') as slot:
            generation = w.storage.cell_generation
            stored = w.value('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection'))
            require('C1/read_retained_selection/unavailable', stored is not None)
            selection = stored['record']
            revision = w.cell(selection['binding_revision']['family_id'], selection['binding_revision']['physical_key'])
            origin = w.cell(selection['binding_origin']['family_id'], selection['binding_origin']['physical_key'])
            require('C1/read_retained_selection/revision_original', revision is not None
                    and row_sha(revision['value']) == selection['binding_revision']['complete_value_sha256'])
            require('C1/read_retained_selection/origin_original', origin is not None
                    and row_sha(origin['value']) == selection['binding_origin']['complete_value_sha256'])
            audit = self.check('BindingReadAudit', dict(original_selection=copy.deepcopy(selection),
                original_revision=copy.deepcopy(revision['value']['record']), original_origin=copy.deepcopy(origin['value']['record']),
                observation='historical_binding_selection_only'), BINDING)
            require('C1/read_retained_selection/passive', w.storage.cell_generation == generation)
            slot.set(dict(audit=True))
            return audit

    def hold_current_read(self):
        """A held current binding reader (SP-423): captured now, released later."""
        read = self.world.binding.read_current(self.scope)
        return dict(read=read, fence=self.observe_sources())

    def release_held(self, held):
        w = self.world
        with self.call('release_held_reader') as slot:
            require('C1/held_reader/withdrawn', w.binding.domain_withdrawn is False)
            now = self.observe_sources()
            for name in ('binding', 'domain', 'stop', 'control'):
                require('C1/held_reader/' + name, now[name] == held['fence'][name])
            slot.set(dict(released=True))
            return held['read']

    def run(self, until='terminal'):
        steps = [('capture_source', self.capture_source), ('latch_and_reserve', self.latch_and_reserve),
                 ('commit_receipt', self.commit_receipt), ('settle_owner', self.settle_owner), ('freeze_event', self.freeze_event),
                 ('append_original', self.append_original), ('publish_control', self.publish_control), ('terminal', self.terminal)]
        if getattr(self, 'request', None) is None:
            self.dispatch(self.user_request())
        for name, step in steps:
            step()
            if name == until:
                break
        return self
