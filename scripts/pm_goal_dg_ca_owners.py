#!/usr/bin/env python3
"""DG-CA TEST_ONLY original owners for goal.cancelled C1-C4 on the shared adapters.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Every owner here is a TEST_ONLY executable model registered in the shared
``OwnerRegistry`` (``scripts/pm_goal_test_owner_adapters.py``). Each one
actually performs its modeled issuance from its own execution: identities are
random UUIDs minted by the issuing owner, times come from the owner's own
monotonic clock through the shared ``pm_event_datetime`` profile, epochs and
revisions advance only through the owner's own CAS transitions, and every
stored record is written by the test-owner Storage (``transact``/``append``)
whose bytes, versions, transaction ids, sequences and receipts are Storage's.
A caller value never becomes authority: sources are acquired only through the
registry from the issuing owner, an empty inventory is the owner's own issued
statement, and every reference/digest pair names an original that the
consumer re-resolves.

The selected original banks are W12's five explicitly selected successor
realms, loaded unchanged by ``pm_goal_own_c3_w12b_roots.Roots``. The original
canonical-JSON digest preimage recipe (SP-304) and the retained native Goal
model helpers come from the pinned ``source-witness-inputs.json`` editions via
``load_originals``. Stored bytes use the test-owner Storage canonical
MessagePack (byte-identical with the pinned original Storage codec, checked
at load). No original bank, URI, hash or stored byte is rewritten.
"""
from __future__ import annotations

import copy
import hashlib
import json
import time
import uuid

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_own_c3_w12b_roots import Roots, CANCEL, BINDING
from pm_goal_own_c_source_oracles import load_originals, scoped_key

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
ROOT = NR.ROOT
BODY = 'https://puppetmaster.local/schemas/goal_body_custody/1.0.0/goal_body_custody.schema.json'
APPEND = 'https://puppetmaster.local/schemas/event_append_receipt_contracts/2.0.0'
WRITERS = ('goal_birth', 'plan_goal_birth_or_attach', 'workflow_attach', 'binding_owner_transfer',
           'binding_migration', 'binding_restore', 'binding_content_delete')
MSGPACK = 'pm.storage.canonical_msgpack.v1'
Refusal = A.AdapterRefusal


def require(code, condition):
    if not condition:
        raise Refusal(code)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def packed(value):
    return S.canonical(value, 'dg_ca/stored')


def row_sha(value):
    """SHA-256 of the exact stored MessagePack bytes of a whole wrapper."""
    return sha(packed(value))


same = A.same


def exact_numbers(value, where):
    """Exact number type before value: no cancellation record carries a float.

    jsonschema's ``integer`` accepts 2.0, so every whole root check is paired
    with this walk; booleans stay booleans and integers stay ``int``.
    """
    if type(value) is float:
        raise Refusal(where + '/float_number')
    if type(value) is dict:
        for item in value.values():
            exact_numbers(item, where)
    elif type(value) is list:
        for item in value:
            exact_numbers(item, where)
    return value


def uid(kind):
    return '%s:%s' % (kind, uuid.uuid4())


class Shared:
    """Load-once immutable selections: realm banks, codec editions, method maps."""
    _instance = None

    def __init__(self):
        self.roots = Roots()
        self.inputs, self.codec = load_originals()
        probe = {'a': 1, 'b': [None, True, 'é'], 'c': {'d': 2 ** 40}}
        require('shared/storage_codec_identity', self.codec.storage_pack(probe) == S.canonical(probe))
        self.goal_model = self.codec.native_goal
        self.execution_methods_sha256 = sha((ROOT / 'Plans/goal_cancel_contracts/execution-methods.json').read_bytes())
        self.cancel_methods_sha256 = sha((ROOT / 'Plans/goal_cancel_contracts/methods.json').read_bytes())
        self.producer_bank_sha256 = self.roots.selection_rows['producer']['sha256']
        self.registry_row = copy.deepcopy(next(r for r in json.loads((ROOT / 'Plans/event_family_registry.json').read_text())['families']
                                               if r['event_type'] == 'goal.cancelled'))

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = Shared()
        return cls._instance


class Clock:
    """An owner's own monotonic millisecond clock, emitted through NUMRULE."""

    def __init__(self):
        self.last = 0

    def now(self):
        ms = max(self.last + 1, time.time_ns() // 1_000_000)
        self.last = ms
        return S.format_ms(ms)


# ------------------------------------------------------------------ world

class World:
    """One TEST_ONLY Storage plus the registered owners of one cancellation case."""

    def __init__(self, work, *, shared=None, faults=None):
        self.shared = shared or Shared.get()
        self.roots, self.codec = self.shared.roots, self.shared.codec
        self.recorder = A.MethodRecorder()
        self.registry = A.OwnerRegistry(self.recorder)
        self.storage = S.TestOwnerStorage.create(work, faults=faults)
        self.storage_id = self.storage.storage_instance_id
        self.appender = A.AppendOwner(self.registry, self.storage)
        self.permissions = PermissionOwner(self)
        self.registration = RegistrationOwner(self)
        self.host_stop = HostStopOwner(self)
        self.goal = GoalOwner(self)
        self.binding = BindingOwner(self)
        self.sir = SIROwner(self)
        self.plan_inventory = AssociationOwner(self, 'plan_association')
        self.workflow_inventory = AssociationOwner(self, 'workflow_association')
        self.scheduler_inventory = AssociationOwner(self, 'scheduler_association')

    # stored cells ------------------------------------------------------
    def cell(self, table, key):
        return self.storage.cell(table, key)

    def value(self, table, key):
        cell = self.storage.cell(table, key)
        return None if cell is None else cell['value']

    def write(self, writes, *, operation=None):
        """One genuine all-or-none Storage transaction with per-key CAS."""
        return self.storage.transact(writes, operation=operation)

    def put(self, table, key, value, *, expected=None):
        return dict(table=table, key=key, expected=expected, value=value)

    def selection(self, family, key, value):
        """PhysicalSelection of a whole stored value, over Storage's bytes."""
        stored = self.storage.cell(family, key)
        require('world/selection_stored', stored is not None and same(stored['value'], value))
        return dict(family_id=family, physical_key=key, schema_id=value['schema_id'], schema_version=value['schema_version'],
                    codec_id=MSGPACK, complete_value_sha256=row_sha(stored['value']))

    def fence(self):
        """Every registered owner's observation and Storage's cell generation."""
        return {name: obs['sha256'] for name, obs in self.recorder.snapshot().items()}


# ------------------------------------------------------------------ owners

class WorldOwner(A.TestOwner):
    role = 'world_owner'

    def __init__(self, world, **kw):
        self.world = world
        self.clock = Clock()
        super().__init__(world.registry, bank=None, **kw)

    @property
    def storage(self):
        return self.world.storage

    @property
    def roots(self):
        return self.world.roots

    def check(self, realm, ref, value):
        self.world.roots.check(realm, ref, value)
        return exact_numbers(value, 'check')


class PermissionOwner(WorldOwner):
    """Protected person/permission decisions (PS) as stored, revocable originals."""
    role = 'permission'
    FAMILY = 'TEST_ONLY:permission_source'

    def grant(self, actor_ref, scope, action):
        with self.recorder.call(self.owner_id, 'grant', dict(actor=actor_ref, action=action)) as slot:
            decision_id = uid('TEST_ONLY:permission')
            value = dict(schema_id='pm.test_only.permission_decision.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                         decision_id=decision_id, actor_ref=actor_ref, scope=copy.deepcopy(scope), action=action,
                         decision='allowed', owner_epoch=self.owner_epoch, decided_at=self.clock.now())
            self.world.write([self.world.put(self.FAMILY, decision_id, value)])
            handle = self._issue(None, value, kind='permission', ref=decision_id)
            slot.set(dict(decision_id=decision_id))
            return handle, decision_id

    def current(self, decision_id):
        value = self.world.value(self.FAMILY, decision_id)
        require('permission/unavailable', value is not None)
        return value

    def allowed(self, decision_id, actor_ref, action):
        value = self.current(decision_id)
        return value['decision'] == 'allowed' and value['actor_ref'] == actor_ref and value['action'] == action

    def revoke(self, decision_id):
        with self.recorder.call(self.owner_id, 'revoke', dict(decision_id=decision_id)):
            cell = self.world.cell(self.FAMILY, decision_id)
            value = dict(cell['value'], decision='revoked', decided_at=self.clock.now())
            self.world.write([self.world.put(self.FAMILY, decision_id, value, expected=cell['version'])])

    def selection(self, decision_id):
        return self.world.selection(self.FAMILY, decision_id, self.current(decision_id))


class RegistrationOwner(WorldOwner):
    """Original native dispatch registration: one original per writer category."""
    role = 'native_registration'
    FAMILY = 'TEST_ONLY:native_writer_registration'

    def __init__(self, world, **kw):
        super().__init__(world, **kw)
        self.root_identity = uid('TEST_ONLY:native-root')
        self.registrations = {}

    def register_all(self):
        with self.recorder.call(self.owner_id, 'register_all') as slot:
            writes, rows = [], []
            for operation in WRITERS:
                ref = uid('TEST_ONLY:registration:' + operation)
                value = dict(schema_id='pm.test_only.native_writer_registration.v1', schema_version='1.0.0',
                             qualification=QUALIFICATION, operation=operation, registration_ref=ref,
                             native_handler_id=uid('TEST_ONLY:native-handler:' + operation),
                             original_owner_ref=self.owner_id, original_owner_epoch=self.owner_epoch,
                             method_contract_sha256=self.world.shared.execution_methods_sha256,
                             schema_resources_sha256=self.world.shared.producer_bank_sha256,
                             disposition='participating', registered_at=self.clock.now())
                writes.append(self.world.put(self.FAMILY, ref, value))
                self._issue(None, value, kind='registration', ref=ref)
                self.registrations[operation] = ref
                rows.append(value)
            self.world.write(writes)
            slot.set(dict(count=len(rows)))
            return rows

    def rows(self):
        out = []
        for operation in WRITERS:
            value = self.world.value(self.FAMILY, self.registrations[operation])
            require('registration/unavailable/' + operation, value is not None)
            out.append(value)
        return out

    def writer_registrations(self):
        return [dict(operation=r['operation'], original_owner_ref=r['original_owner_ref'], original_owner_epoch=r['original_owner_epoch'],
                     method_id=r['native_handler_id'], method_contract_sha256=r['method_contract_sha256'],
                     schema_resources_sha256=r['schema_resources_sha256'], original_registration_ref=r['registration_ref'],
                     disposition=r['disposition']) for r in self.rows()]

    def descriptors(self):
        return [dict(operation=r['operation'], native_handler_id=r['native_handler_id'], original_owner_ref=r['original_owner_ref'],
                     original_owner_epoch=r['original_owner_epoch'], storage_instance_id=self.world.storage_id,
                     storage_family_ids=['goal_execution_binding_control'], route_schema_ids=[BINDING], native_binding_generation=1,
                     original_registration_ref=r['registration_ref'], disposition=r['disposition']) for r in self.rows()]

    def disable(self, operation):
        ref = self.registrations[operation]
        cell = self.world.cell(self.FAMILY, ref)
        self.world.write([self.world.put(self.FAMILY, ref, dict(cell['value'], disposition='disabled_at_original_dispatch'),
                                         expected=cell['version'])])


def transaction_record(owner, method, operation_id, permission_selection, tx_id, cause_ref):
    return dict(owner_method=method, original_owner_ref=owner.owner_id, original_owner_epoch=owner.owner_epoch,
                original_operation_id=operation_id, original_transaction_id=tx_id,
                original_permission_source=permission_selection, original_causation_ref=cause_ref,
                committed_at=owner.clock.now())


class HostStopOwner(WorldOwner):
    """Original host Stop authority: the single live Stop clock for a Goal."""
    role = 'host_stop'
    FAMILY = 'goal_host_stop_control'
    RECEIPTS = 'TEST_ONLY:host_stop_receipt'

    def key(self, scope):
        return 'goal_host_stop_control:' + scoped_key(scope)

    def birth_record(self, scope, birth_ref):
        record = dict(schema_id='pm.goal.cancel.stop_control.v1', schema_version='1.0.0', **scope, user_stop_epoch=0,
                      latched=False, last_original_stop_receipt_ref=None, last_original_stop_receipt_sha256=None,
                      original_birth_or_adoption_ref=birth_ref, continuation_epoch=0)
        return self.check('producer', CANCEL + '#/$defs/StopControl', record)

    def wrapper(self, record):
        return self.check('producer', CANCEL + '#/$defs/StorageStopControl',
                          dict(schema_id='pm.storage_value.goal_host_stop_control.v1', schema_version='1.0.0', record=record))

    def current(self, scope):
        cell = self.world.cell(self.FAMILY, self.key(scope))
        require('host_stop/unavailable', cell is not None)
        return cell

    def record(self, scope):
        return copy.deepcopy(self.current(scope)['value']['record'])

    def manual(self, scope, action):
        """A genuine prior manual Stop/resume through the host's own CAS."""
        require('host_stop/manual_action', action in ('stop', 'resume'))
        with self.recorder.call(self.owner_id, 'manual_' + action, dict(scope=scope)) as slot:
            cell = self.current(scope)
            record = copy.deepcopy(cell['value']['record'])
            receipt_ref = uid('TEST_ONLY:host-stop-receipt')
            if action == 'stop':
                require('host_stop/already_latched', record['latched'] is False)
                record.update(user_stop_epoch=NR.uint64(record['user_stop_epoch'] + 1, 'host_stop/epoch'), latched=True)
            else:
                require('host_stop/not_latched', record['latched'] is True)
                record.update(continuation_epoch=NR.uint64(record['continuation_epoch'] + 1, 'host_stop/epoch'), latched=False)
            receipt = dict(schema_id='pm.test_only.host_stop_receipt.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                           receipt_ref=receipt_ref, action=action, scope=copy.deepcopy(scope),
                           before_sha256=row_sha(cell['value']), user_stop_epoch=record['user_stop_epoch'],
                           continuation_epoch=record['continuation_epoch'], owner_epoch=self.owner_epoch, at=self.clock.now())
            record.update(last_original_stop_receipt_ref=receipt_ref, last_original_stop_receipt_sha256=row_sha(receipt))
            self.check('producer', CANCEL + '#/$defs/StopControl', record)
            tx = self.world.write([self.world.put(self.RECEIPTS, receipt_ref, receipt),
                                   self.world.put(self.FAMILY, self.key(scope), self.wrapper(record), expected=cell['version'])])
            self._issue(None, receipt, kind='stop_receipt', ref=receipt_ref)
            slot.set(dict(tx=tx['tx_id'], receipt_ref=receipt_ref))
            return receipt_ref

    def receipt(self, ref):
        return self.world.value(self.RECEIPTS, ref)


class GoalOwner(WorldOwner):
    """The sole shared Goal body owner and Goal creator (GRS/SP-287)."""
    role = 'goal_body'
    BODY, REVISION, ORIGIN, CONTROL = 'goal_body_record', 'goal_objective_revision', 'goal_objective_origin', 'goal_body_control'

    def keys(self, scope, revision=None):
        m = self.world.shared.goal_model
        out = dict(body=m.key('goal_record.v2', scope['project_id'], scope['goal_id']),
                   control=m.key('goal_body_control.v1', scope['project_id'], scope['goal_id']))
        if revision is not None:
            out.update(revision=m.rkey(scope['project_id'], scope['goal_id'], revision),
                       origin=m.okey(scope['project_id'], scope['goal_id'], revision))
        return out

    def snapshot(self, scope):
        """Whole native snapshot from the stored originals, model-validated."""
        k = self.keys(scope)
        body = self.world.value(self.BODY, k['body'])
        control = self.world.value(self.CONTROL, k['control'])
        require('goal/body_unavailable', body is not None)
        require('goal/control_unavailable', control is not None)
        control_v1 = {kk: vv for kk, vv in control['record'].items() if kk != 'cancellation_pending'}
        control_v1['schema_id'] = 'pm.goal.body_control.v1'
        revisions, origins = [], {}
        for n in range(1, control['record']['latest_objective_revision'] + 1):
            kr = self.keys(scope, n)
            revision = self.world.value(self.REVISION, kr['revision'])
            origin = self.world.value(self.ORIGIN, kr['origin'])
            require('goal/history_unavailable', revision is not None and origin is not None)
            revisions.append(revision['record'])
            origins[str(n)] = origin['record']
        snapshot = dict(body=copy.deepcopy(body['record']), control=control_v1, revisions=revisions, origins=origins)
        self.world.shared.goal_model.validate_snapshot(snapshot)
        return snapshot

    def control(self, scope):
        cell = self.world.cell(self.CONTROL, self.keys(scope)['control'])
        require('goal/control_unavailable', cell is not None)
        return cell

    def body_cell(self, scope):
        cell = self.world.cell(self.BODY, self.keys(scope)['body'])
        require('goal/body_unavailable', cell is not None)
        return cell

    def history_cells(self, scope):
        control = self.control(scope)['value']['record']
        out = {}
        for n in range(1, control['latest_objective_revision'] + 1):
            kr = self.keys(scope, n)
            out[str(n)] = [self.world.cell(self.REVISION, kr['revision']), self.world.cell(self.ORIGIN, kr['origin'])]
        return out

    def wrap(self, kind, record):
        names = dict(body=('storage_body', 'pm.storage_value.goal_body_record.v1', '1.0.0'),
                     revision=('storage_revision', 'pm.storage_value.goal_objective_revision.v1', '1.0.0'),
                     origin=('storage_origin', 'pm.storage_value.goal_objective_origin.v1', '1.0.0'))
        if kind == 'control':
            return self.check('producer', CANCEL + '#/$defs/StorageBodyControlV2',
                              dict(schema_id='pm.storage_value.goal_body_control.v2', schema_version='2.0.0', record=record))
        name, schema_id, version = names[kind]
        return self.check('producer', BODY + '#/$defs/' + name, dict(schema_id=schema_id, schema_version=version, record=record))

    def birth_values(self, scope, objective_text, source_message_ref, context_ref):
        """The Goal creator's complete fresh birth values (body/history/origin/control)."""
        m = self.world.shared.goal_model
        now = self.clock.now()
        body = dict(goal_id=scope['goal_id'], project_id=scope['project_id'], thread_id=scope['thread_id'],
                    objective_text=objective_text, revision=1, state='active', blocked_reason_ref=None, active_run_ref=None,
                    created_at=now, updated_at=now)
        body['currentness_hash'] = m.hashbody(body)
        revision = dict(goal_id=scope['goal_id'], revision=1, objective_text=objective_text, change_source='user_direct',
                        source_message_id=source_message_ref, approval_id=None, prior_revision_hash=None, created_at=now)
        revision['revision_hash'] = m.hashrev(revision)
        origin = dict(goal_id=scope['goal_id'], goal_revision=1, origin_kind='user_request', source_message_refs=[source_message_ref],
                      source_context_manifest_ref=context_ref, bound_plan_ref=None, owning_workflow_ref=None)
        k = self.keys(scope, 1)
        control = dict(schema_id='pm.goal.body_control.v2', **scope, body_key=k['body'], body_sha256=m.bytehash(body),
                       current_revision=1, currentness_hash=body['currentness_hash'], latest_objective_revision=1,
                       latest_revision_hash=revision['revision_hash'], origin_key=k['origin'], control_epoch=0,
                       cancellation_receipt_ref=None, pending=None, cancellation_pending=None)
        self.check('producer', CANCEL + '#/$defs/BodyControlV2', control)
        return dict(body=body, revision=revision, origin=origin, control=control)

    def mutate_state(self, scope, new_state, *, reason_ref=None):
        """A genuine earlier body mutation (pause/block/resume/complete): body CAS, revision+1."""
        with self.recorder.call(self.owner_id, 'mutate_state', dict(state=new_state)) as slot:
            m = self.world.shared.goal_model
            body_cell, control_cell = self.body_cell(scope), self.control(scope)
            body = copy.deepcopy(body_cell['value']['record'])
            control = copy.deepcopy(control_cell['value']['record'])
            require('goal/mutation_completed', body['state'] != 'completed')
            require('goal/mutation_cancelled', control['cancellation_receipt_ref'] is None)
            require('goal/mutation_cancel_pending', control['cancellation_pending'] is None)
            body.update(state=new_state, revision=NR.uint64(body['revision'] + 1, 'goal/revision'), updated_at=self.clock.now(),
                        blocked_reason_ref=reason_ref if new_state == 'blocked' else None)
            body['currentness_hash'] = m.hashbody({k: v for k, v in body.items() if k != 'currentness_hash'})
            control.update(body_sha256=m.bytehash(body), current_revision=body['revision'], currentness_hash=body['currentness_hash'],
                           control_epoch=NR.uint64(control['control_epoch'] + 1, 'goal/control_epoch'))
            k = self.keys(scope)
            tx = self.world.write([self.world.put(self.BODY, k['body'], self.wrap('body', body), expected=body_cell['version']),
                                   self.world.put(self.CONTROL, k['control'], self.wrap('control', control), expected=control_cell['version'])])
            receipt = dict(qualification=QUALIFICATION, kind='body_mutation', tx_id=tx['tx_id'], revision=body['revision'],
                           state=new_state, body_sha256=control['body_sha256'])
            self._issue(None, receipt, kind='body_mutation')
            slot.set(receipt)
            return receipt

    def reserve_pending(self, scope, stop_epoch):
        """A genuine pending metadata update reservation (control-only, unresolved)."""
        with self.recorder.call(self.owner_id, 'reserve_pending', dict(scope=scope)):
            m = self.world.shared.goal_model
            cell = self.control(scope)
            control = copy.deepcopy(cell['value']['record'])
            require('goal/pending_exists', control['pending'] is None)
            require('goal/pending_cancel_fenced', control['cancellation_pending'] is None and control['cancellation_receipt_ref'] is None)
            body = copy.deepcopy(self.body_cell(scope)['value']['record'])
            after = dict(body, revision=NR.uint64(body['revision'] + 1, 'goal/revision'), updated_at=self.clock.now())
            after['currentness_hash'] = m.hashbody({k: v for k, v in after.items() if k != 'currentness_hash'})
            intent = dict(kind='metadata_update', scope=copy.deepcopy(scope), after=after)
            pending = self.check('producer', BODY + '#/$defs/pending', dict(
                operation_id=uid('TEST_ONLY:pending-body-operation'), owner_ref=self.owner_id, owner_epoch=self.owner_epoch,
                operation_kind='metadata_update', expected_revision=body['revision'], expected_currentness_hash=body['currentness_hash'],
                expected_stop_epoch=stop_epoch, intent_sha256=self.world.codec.h(intent), after_record=after, accepted_revision=None,
                origin=None, original_change_authority_ref=uid('TEST_ONLY:metadata-change-authority'), external_authority_ref=None))
            control.update(pending=pending, control_epoch=NR.uint64(control['control_epoch'] + 1, 'goal/control_epoch'))
            self.world.write([self.world.put(self.CONTROL, self.keys(scope)['control'], self.wrap('control', control), expected=cell['version'])])
            self._issue(None, pending, kind='pending_body_operation', ref=pending['operation_id'])
            return pending


class BindingOwner(WorldOwner):
    """Goal execution binding / writer-domain owner (SP-304/305, GRS-073/074)."""
    role = 'goal_binding'
    REVISION, ORIGIN, CONTROL = 'goal_execution_binding_revision', 'goal_execution_binding_origin', 'goal_execution_binding_control'
    DOMAIN, HEAD = 'goal_execution_writer_domain', 'goal_execution_writer_domain_head'
    PROOF = 'TEST_ONLY:goal_association_inventory_proof'

    def __init__(self, world, **kw):
        super().__init__(world, **kw)
        self.domain_withdrawn = False
        self.domain_generation = 0

    def storage_key(self):
        return self.world.storage_id.encode().hex()

    def keys(self, scope, revision=0):
        g = scoped_key(scope)
        return dict(revision='goal_execution_binding_revision.v1:%s:revision:%d' % (g, revision),
                    origin='goal_execution_binding_origin.v1:%s:revision:%d' % (g, revision),
                    control='goal_execution_binding_control.v1:' + g)

    def wrap(self, name, key, record):
        ref = BINDING + '#/$defs/' + name
        return self.check('producer', ref, self.world.roots.make('producer', ref, dict(
            storage_instance_id=self.world.storage_id, physical_key=key, record=record)))

    def install_writer_domain(self, permission):
        """install_writer_domain: original registration + domain epoch/head only."""
        with self.recorder.call(self.owner_id, 'install_writer_domain') as slot:
            w = self.world
            require('domain/not_installed', self.domain_generation == 0)
            descriptors = w.registration.descriptors()
            dispatch = self.check('producer', BINDING + '#/$defs/DispatchCommitmentInput', dict(
                domain='pm.goal.execution_dispatch.v1', storage_instance_id=w.storage_id,
                native_root_identity=w.registration.root_identity, complete_descriptors=descriptors))
            operation = uid('TEST_ONLY:install-writer-domain')
            domain = self.check('producer', BINDING + '#/$defs/WriterDomain', dict(
                storage_instance_id=w.storage_id, domain_generation=1, native_root_identity=w.registration.root_identity,
                schema_resources_sha256=w.shared.producer_bank_sha256,
                complete_original_dispatch_registration_sha256=w.codec.h(dispatch),
                writers=w.registration.writer_registrations(),
                original_installation=transaction_record(self, 'owner.goal.execution_binding.install_writer_domain.v1', operation,
                                                         permission, uid('TEST_ONLY:domain-install-tx'), operation)))
            dkey = 'goal_execution_writer_domain.v1:%s:epoch:1' % self.storage_key()
            hkey = 'goal_execution_writer_domain_head.v1:' + self.storage_key()
            dwrap = self.wrap('StorageWriterDomain', dkey, domain)
            w.write([w.put(self.DOMAIN, dkey, dwrap)])
            dsel = w.selection(self.DOMAIN, dkey, dwrap)
            head = self.check('producer', BINDING + '#/$defs/WriterDomainHead', dict(
                storage_instance_id=w.storage_id, domain_generation=1, domain=dsel,
                original_installation_transaction_id=domain['original_installation']['original_transaction_id']))
            w.write([w.put(self.HEAD, hkey, self.wrap('StorageWriterDomainHead', hkey, head))])
            self.domain_generation = 1
            self._issue(None, dict(qualification=QUALIFICATION, domain=dsel), kind='writer_domain')
            slot.set(dsel)
            return dsel

    def domain_selection(self):
        hkey = 'goal_execution_writer_domain_head.v1:' + self.storage_key()
        head = self.world.value(self.HEAD, hkey)
        require('domain/head_unavailable', head is not None)
        sel = head['record']['domain']
        stored = self.world.cell(self.DOMAIN, sel['physical_key'])
        require('domain/unavailable', stored is not None)
        require('domain/head_join', row_sha(stored['value']) == sel['complete_value_sha256'])
        return copy.deepcopy(sel), copy.deepcopy(stored['value']), copy.deepcopy(head)

    def require_writer(self, operation):
        """SP-423 writer cutoff and native dispatch participation for one writer."""
        require('domain/writer_withdrawn', self.domain_withdrawn is False)
        sel, domain, _ = self.domain_selection()
        rows = {r['operation']: r for r in self.world.registration.rows()}
        require('domain/writer_registered/' + operation, rows[operation]['disposition'] == 'participating')
        registered = [x for x in domain['record']['writers'] if x['operation'] == operation]
        require('domain/writer_join/' + operation, len(registered) == 1 and registered[0]['original_registration_ref'] == rows[operation]['registration_ref'])
        return sel

    def birth_values(self, scope, birth_operation, host_owner_ref, host_epoch):
        """birth_none revision0/control0 records joined to the actual domain."""
        sel, _, _ = self.domain_selection()
        revision = self.check('producer', BINDING + '#/$defs/BindingRevision', dict(
            scope=copy.deepcopy(scope), binding_revision=0, previous_revision=None, active_run_ref=None, associations=[],
            host_execution_owner_ref=host_owner_ref, host_execution_owner_epoch=host_epoch, writer_domain=sel,
            original_goal_birth_or_binding_operation=birth_operation))
        return revision, sel

    def read_current(self, scope):
        """read_current_for_cancel lower source read: whole stored binding members."""
        k = self.keys(scope)
        control = self.world.cell(self.CONTROL, k['control'])
        require('binding/control_unavailable', control is not None)
        record = control['value']['record']
        rsel, osel = record['current_revision'], record['current_origin']
        revision = self.world.cell(self.REVISION, rsel['physical_key'])
        origin = self.world.cell(self.ORIGIN, osel['physical_key'])
        require('binding/revision_unavailable', revision is not None)
        require('binding/origin_unavailable', origin is not None)
        require('binding/revision_join', row_sha(revision['value']) == rsel['complete_value_sha256'])
        require('binding/origin_join', row_sha(origin['value']) == osel['complete_value_sha256'])
        dsel, domain, head = self.domain_selection()
        require('binding/domain_join', same(record['writer_domain'], dsel) and same(revision['value']['record']['writer_domain'], dsel))
        return dict(control=control, revision=revision, origin=origin, domain=domain, domain_selection=dsel, head=head)

    def withdraw(self):
        """SP-423 writer cutoff: new binding/cancellation writers refuse."""
        with self.recorder.call(self.owner_id, 'withdraw_writer_domain'):
            self.domain_withdrawn = True
            self.owner_epoch = NR.uint64(self.owner_epoch + 1, 'binding/owner_epoch')

    def transfer_owner_epoch(self, scope):
        """A genuine accepted execution-owner epoch transition on the binding control."""
        with self.recorder.call(self.owner_id, 'transfer_binding_owner', dict(scope=scope)):
            self.require_writer('binding_owner_transfer')
            k = self.keys(scope)
            cell = self.world.cell(self.CONTROL, k['control'])
            record = copy.deepcopy(cell['value']['record'])
            record['control_epoch'] = NR.uint64(record['control_epoch'] + 1, 'binding/control_epoch')
            self.world.write([self.world.put(self.CONTROL, k['control'], self.wrap('StorageBindingControl', k['control'], record),
                                             expected=cell['version'])])

    def issue_inventory_proof(self, scope, statements, operation_id):
        """Joins the association owners' issued inventory statements into one stored proof."""
        key = 'TEST_ONLY:goal_association_inventory_proof:%s:%s' % (scoped_key(scope), operation_id.encode().hex())
        value = dict(schema_id='pm.test_only.goal_association_inventory_proof.v1', schema_version='1.0.0',
                     qualification=QUALIFICATION, scope=copy.deepcopy(scope), operation_id=operation_id,
                     statements=copy.deepcopy(statements), association_count=sum(len(s['members']) for s in statements),
                     issued_at=self.clock.now(), owner_epoch=self.owner_epoch)
        return key, value


class SIROwner(WorldOwner):
    """Original SIR command acceptance, outcome and immutable terminal (SIR-049/050)."""
    role = 'sir'
    ACCEPTED = 'TEST_ONLY:sir_accepted_dispatch'

    def __init__(self, world, **kw):
        super().__init__(world, **kw)
        self.server_id = uid('TEST_ONLY:server')
        self.host_id = uid('TEST_ONLY:host')
        self.environment_id = uid('TEST_ONLY:environment')
        self.target_generation = 1
        self.topology_generation = 1
        self.accepted = {}

    def identity_envelope(self, request, operation_id):
        return dict(scope_kind='project', operation_id=operation_id, operation_generation=0, attempt_id=None,
                    command_instance_id=request['command_instance_id'], server_id=self.server_id, project_id=request['project_id'],
                    project_home_server_id=self.server_id, named_plan_id=None, thread_id=request['thread_id'],
                    goal_id=request['goal_id'], execution_host_id=self.host_id, execution_environment_id=self.environment_id,
                    source_location_id=None, topology_generation=self.topology_generation)

    def outcome_record(self, identity, **fields):
        value = dict(schema_id='pm.full_thread_runtime.contracts.v1', record_kind='command_outcome',
                     identity=copy.deepcopy(identity['owner_identity']), command_id=identity['command_id'],
                     payload_sha256=identity['payload_sha256'], idempotency_key=identity['idempotency_key'],
                     target_generation=identity['target_generation'], dispatch_frame_id=identity['dispatch_frame_id'],
                     acknowledgement_frame_id=identity['dispatch_frame_id'], same_frame_acknowledged=True, error_ref=None,
                     observed_at=self.clock.now())
        value.update(fields)
        return value

    def accept(self, request, *, command_id='cmd.chat.goal.cancel'):
        """Accept one dispatch; identical replay returns the original, altered conflicts."""
        with self.recorder.call(self.owner_id, 'accept_dispatch', dict(request=request)) as slot:
            self.check('producer', CANCEL + '#/$defs/GoalCancelRequestV2', request)
            existing = self.accepted.get(request['command_instance_id'])
            if existing is not None:
                require('sir/dispatch_conflict', same(existing['request'], request))
                slot.set(dict(replay=True))
                return existing['handle'], copy.deepcopy(existing['record'])
            operation_id = uid('TEST_ONLY:cancel-operation')
            frame = uid('TEST_ONLY:dispatch-frame')
            owner_identity = self.identity_envelope(request, operation_id)
            request_ref = uid('TEST_ONLY:request')
            identity = self.check('producer', CANCEL + '#/$defs/NormalizedIdentity', dict(
                request_ref=request_ref, command_id=command_id, command_instance_id=request['command_instance_id'],
                operation_id=operation_id, owner_identity=owner_identity, payload_sha256=self.world.codec.h(request),
                idempotency_key=request['idempotency_key'], target_generation=self.target_generation, dispatch_frame_id=frame))
            nonterminal = self.check('producer', CANCEL + '#/$defs/NonterminalOutcome', self.outcome_record(
                identity, outcome='acknowledged', acknowledgement_receipt_ref=uid('TEST_ONLY:acknowledgement'),
                acknowledgement_frame_offset=0, result_receipt_ref=None, owner_result_ref=None,
                owner_result_schema_ref=None, owner_result_sha256=None))
            record = dict(schema_id='pm.test_only.sir_accepted_dispatch.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                          request=copy.deepcopy(request), identity=identity, nonterminal=nonterminal,
                          dispatch_id=uid('TEST_ONLY:dispatch'), command_outcome_ref=uid('TEST_ONLY:outcome'),
                          acceptance_ref=uid('TEST_ONLY:protected-user-cancel-acceptance'), source_authority_ref=self.owner_id,
                          owner_epoch=self.owner_epoch, accepted_at=self.clock.now())
            self.world.write([self.world.put(self.ACCEPTED, request['command_instance_id'], record)])
            handle = self._issue(None, record, kind='accepted_dispatch', ref=request_ref)
            self.accepted[request['command_instance_id']] = dict(request=copy.deepcopy(request), handle=handle, record=copy.deepcopy(record))
            slot.set(dict(operation_id=operation_id))
            return handle, copy.deepcopy(record)

    def restart(self):
        """A genuine SIR owner restart: a new owner epoch."""
        with self.recorder.call(self.owner_id, 'restart'):
            self.owner_epoch = NR.uint64(self.owner_epoch + 1, 'sir/owner_epoch')

    def stored(self, command_instance_id):
        value = self.world.value(self.ACCEPTED, command_instance_id)
        require('sir/accepted_unavailable', value is not None)
        return value


class AssociationOwner(WorldOwner):
    """A Plan, Workflow or Scheduler owner's complete per-Goal association inventory.

    ``inventory`` is the owner's own issued statement of its complete database
    membership for the Goal (associations, pending operations, callbacks); an
    empty list is that statement, never a caller's.
    """
    FAMILY = 'TEST_ONLY:association_inventory'

    def __init__(self, world, role, **kw):
        self.role = role
        super().__init__(world, **kw)
        self.available = True
        self.members = {}

    def add(self, scope, kind, detail):
        """A genuine association/pending effect this owner holds for the Goal."""
        with self.recorder.call(self.owner_id, 'add_member', dict(kind=kind)):
            member = dict(member_ref=uid('TEST_ONLY:%s:%s' % (self.role, kind)), kind=kind, detail=copy.deepcopy(detail),
                          owner_epoch=self.owner_epoch, at=self.clock.now())
            self.members.setdefault(scoped_key(scope), []).append(member)
            key = '%s:%s:%s' % (self.role, scoped_key(scope), member['member_ref'])
            self.world.write([self.world.put(self.FAMILY, key, dict(schema_id='pm.test_only.association_member.v1',
                                                                   schema_version='1.0.0', owner=self.owner_id, **member))])
            self._issue(None, member, kind='member', ref=member['member_ref'])
            return member

    def inventory(self, scope):
        with self.recorder.call(self.owner_id, 'inventory', dict(scope=scope)) as slot:
            require('inventory/unavailable/' + self.role, self.available is True)
            members = sorted(copy.deepcopy(self.members.get(scoped_key(scope), [])), key=lambda m: m['member_ref'])
            statement = dict(schema_id='pm.test_only.association_inventory_statement.v1', schema_version='1.0.0',
                             qualification=QUALIFICATION, owner_id=self.owner_id, owner_role=self.role,
                             owner_epoch=self.owner_epoch, scope=copy.deepcopy(scope), members=members,
                             complete=True, stated_at=self.clock.now())
            handle = self._issue(None, statement, kind='inventory_statement')
            slot.set(dict(count=len(members)))
            return handle

    def statement_digest(self, statement):
        return row_sha({k: v for k, v in statement.items() if k != 'stated_at'})

    def current_membership(self, scope):
        require('inventory/unavailable/' + self.role, self.available is True)
        return sorted([m['member_ref'] for m in self.members.get(scoped_key(scope), [])])
