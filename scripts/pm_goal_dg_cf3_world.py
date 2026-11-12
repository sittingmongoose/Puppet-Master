#!/usr/bin/env python3
"""DG-CF3 TEST_ONLY world for goal_run.certified F0, CF-10..12 and P4..P8.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Every value here is issued by a registered TEST_ONLY owner from its own
execution on the shared adapters (``pm_goal_test_storage``,
``pm_goal_test_owner_adapters``); Storage assigns sequences, Storage times,
transaction identifiers, seeds and first custody.  The certified Event is
issued through the adapter's CF-01 identity owner and producer (imported
unedited), appended with barrier durability, and then joined by one Storage
transaction that coissues the native certified result/origin, the D01
update/origin/head, the native body CAS and the compact coordinator
Commit/Origin; a later transaction issues the Release.  Start and positive
cancellation owners issue their own whole v3 Events and native/D01/D05/D06
records the same way, so the combined consumer has genuine started,
cancelled and certified originals to reduce.

The native, D01, Standard and coordinator records are compact TEST_ONLY
owner records (whole roots are composed by the CF-02/CF-03/CF-07 owners in
the sibling lanes); every selector the consumer stores is recomputed from the
exact stored bytes of those records.  Nothing here grades a family or proves
native issuance, locking, fsync, crash durability or restore.
"""
from __future__ import annotations

import copy
import hashlib
import os
from pathlib import Path
import weakref

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_demo_cf01 as C

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = ('native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read '
               'as native proof')
ROOT = NR.ROOT
STARTED_PAYLOAD = 'pm.goal_runtime_event.goal_run_started.schema.v3'
CANCELLED_PAYLOAD = 'pm.goal_runtime_event.goal_run_cancelled.schema.v3'
CERTIFIED_PAYLOAD = C.PAYLOAD
NOTE_PAYLOAD = 'TEST_ONLY:goal_test.note.v1'
CAUSE_PAYLOAD = 'TEST_ONLY:cause.v1'
OTHER_GOAL_RUN = {'goal_run.blocked': 'pm.goal_runtime_event.goal_run_blocked.schema.v3',
                  'goal_run.stopped': 'pm.goal_runtime_event.goal_run_stopped.schema.v3',
                  'goal_run.replanned': 'pm.goal_runtime_event.goal_run_replanned.schema.v3'}
CUT_ENV = 'PM_DG_CF3_CUT'
BODY_SCHEMA = 'pm.storage_value.workflow_goal_run_body.v1'
CONTROL_SCHEMA = 'pm.storage_value.workflow_goal_run_control.v1'

# TEST_ONLY family tables (names mirror the canon families they stand for).
F = dict(
    body='workflow_goal_run_body', control='workflow_goal_run_control',
    pointer='executor_workflow_current_pointer.v2', birth='executor_workflow_birth.v1',
    birth_origin='executor_workflow_birth_origin.v1', initial_control_origin='executor_workflow_initial_control_origin.v1',
    start_candidate='executor_workflow_start_candidate.v2', start_commit='executor_workflow_start_commit.v2',
    start_origin='executor_workflow_start_origin.v2', d01_update='executor_workflow_workflow_update.v8',
    d01_origin='executor_workflow_lineage_origin.v8', d01_head='executor_workflow_workflow_head.v8',
    native_result='workflow_standard_result.v4', native_origin='workflow_standard_origin.v4',
    standard_receipt='goal_receipt.v2', standard_capture_origin='workflow_standard_capture_origin.v4',
    coordinator_commit='goal_certified_coordinator_commit.v1', coordinator_origin='goal_certified_coordinator_origin.v1',
    coordinator_release='goal_certified_coordinator_release.v1', d05_result='executor_d05_result.v1',
    d05_origin='executor_d05_origin.v1', d06_candidate='executor_d06_candidate.v1', d06_intent='executor_d06_intent.v1',
    d06_result='executor_d06_result.v1', d06_prepare_origin='executor_d06_prepare_origin.v1',
    d06_publish_origin='executor_d06_publish_origin.v1', goal_body='goal_body.v1', goal_control='goal_control.v1',
    goal_stop='goal_stop.v1', binding_revision='goal_binding_revision.v1', binding_control='goal_binding_control.v1')


class LaneRefusal(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


def require(code, condition):
    if not condition:
        raise LaneRefusal(code)


def refusal_code(error):
    return getattr(error, 'code', None) or type(error).__name__


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def value_sha(value):
    """Exact stored-bytes digest: CV-339 canonical MessagePack, SHA-256."""
    return sha256(S.canonical(value, 'lane/value'))


def K(text):
    return S.k_component(text)


def schema_of(table):
    if table == F['body']:
        return BODY_SCHEMA
    if table == F['control']:
        return CONTROL_SCHEMA
    return 'pm.storage_value.' + table


def record(table, **fields):
    return dict(schema_id=schema_of(table), schema_version='1.0.0', qualification=QUALIFICATION, **fields)


def run_key(scope, suffix):
    return ':'.join(K(scope[k]) for k in ('storage_instance_id', 'project_id', 'goal_run_id')) + ':' + suffix


def selector_for(storage_instance_id, table, key, value):
    return dict(storage_instance_id=storage_instance_id, family_id=table, physical_key=key,
                schema_id=value['schema_id'], schema_version=value['schema_version'],
                physical_value_sha256=value_sha(value))


def resolve(cells, selector, storage_instance_id, *, where):
    """Resolve a selector against one snapshot's exact cells; recompute its digest."""
    require(where + '/selector_type', type(selector) is dict)
    require(where + '/selector_storage', selector.get('storage_instance_id') == storage_instance_id)
    cell = cells.get(selector.get('family_id'), {}).get(selector.get('physical_key'))
    require(where + '/unavailable', cell is not None)
    value = cell['value']
    require(where + '/schema', value.get('schema_id') == selector['schema_id'] and
            value.get('schema_version') == selector['schema_version'])
    require(where + '/digest', value_sha(value) == selector['physical_value_sha256'])
    return value, cell


def substituted(selector):
    """One coherent defect: a selector naming a different stored value."""
    return dict(selector, physical_value_sha256=sha256(b'TEST_ONLY:substituted:' + selector['physical_key'].encode()))


def tx_number(tx_id):
    return int(tx_id.rsplit(':', 1)[1])


# --------------------------------------------------------------------- Storage

class LaneStorage(S.TestOwnerStorage):
    """Adapter Storage plus Storage-issued transaction handles, a TEST_ONLY
    clock-owner control and lane cut points for real child-process deaths.

    The transaction handle is opened before a write set is computed and
    carries the genuine identifier that Storage will assign at commit; a
    commit after any other transaction refuses (``tx/reservation_stale``).
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._tx_handles = weakref.WeakKeyDictionary()
        self.lane_cut_point = os.environ.get(CUT_ENV) or None

    def lane_cut(self, name):
        if self.lane_cut_point == name:
            os._exit(S.CRASH_EXIT)

    def now(self):
        return self._tick()

    def advance_clock(self, seconds):
        """TEST_ONLY clock owner: move Storage's own monotonic clock forward."""
        seconds = NR.integer(seconds, 'clock/advance', minimum=0)
        self.clock_last_ms = NR.uint64(self.clock_last_ms + seconds * 1000, 'clock/advance_ms')
        self._commit_state()

    def begin(self):
        """Open a write transaction: Storage issues its identifier and its time."""
        number = NR.uint64(self.tx_counter + 1, 'tx/next')
        tx_id = 'TEST_ONLY:tx:%s:%d' % (self.storage_instance_id, number)
        handle = S._Handle('transaction')
        self._tx_handles[handle] = (number, tx_id, self.now())
        return handle, tx_id

    def tx_info(self, handle):
        require('tx/handle_type', type(handle) is S._Handle and handle.kind == 'transaction')
        require('tx/handle_issuer', handle in self._tx_handles)
        number, tx_id, at_utc = self._tx_handles[handle]
        return tx_id, at_utc

    def commit(self, handle, writes):
        require('tx/handle_type', type(handle) is S._Handle and handle.kind == 'transaction')
        require('tx/handle_issuer', handle in self._tx_handles)
        number, tx_id, _ = self._tx_handles.pop(handle)
        require('tx/reservation_stale', self.tx_counter + 1 == number)
        result = self.transact(writes)
        require('tx/identifier', result['tx_id'] == tx_id)
        return result

    def stamped(self, build):
        """Open a transaction, build its write set with the genuine id, commit."""
        handle, tx_id = self.begin()
        return self.commit(handle, build(tx_id)), tx_id


# --------------------------------------------------------------------- owners

class StorageCellOwner(A.TestOwner):
    """Owner whose originals are durable Storage cells (survive restarts)."""

    def __init__(self, registry, storage, **kw):
        super().__init__(registry, **kw)
        self.storage = storage

    def write(self, table, key, value, expected=None):
        return dict(table=table, key=key, expected=expected, value=value)

    def sel(self, table, key, value):
        return selector_for(self.storage.storage_instance_id, table, key, value)


class GoalOwner(StorageCellOwner):
    role = 'goal'

    def create(self, scope, *, goal_revision=3, thread_id='TEST_ONLY:thread:1'):
        writes, sel, existing = [], {}, {}
        for name in ('goal_body', 'goal_control', 'goal_stop', 'binding_revision', 'binding_control'):
            key = ':'.join(K(scope[k]) for k in ('storage_instance_id', 'project_id', 'goal_id')) + ':' + name
            cell = self.storage.cell(F[name], key)
            value = cell['value'] if cell else record(F[name], project_id=scope['project_id'], goal_id=scope['goal_id'],
                                                      goal_revision=goal_revision, thread_id=thread_id, epoch=1)
            if cell is None:
                writes.append(self.write(F[name], key, value))
            existing[name] = value
            sel[name] = self.sel(F[name], key, value)
        tx = self.storage.transact(writes) if writes else dict(tx_id=None)
        body = existing['goal_body']
        return dict(selectors=sel, goal_revision=body['goal_revision'], thread_id=body['thread_id'], tx=tx['tx_id'])


class NativeOwner(StorageCellOwner):
    """TEST_ONLY Executor native Workflow + D01 owner (compact records)."""
    role = 'native'

    def birth(self, scope, identity):
        sid = self.storage.storage_instance_id
        body_key, control_key = run_key(scope, 'body:1'), run_key(scope, 'control')
        body = record(F['body'], scope=copy.deepcopy(scope), identity=copy.deepcopy(identity), body_revision=1,
                      activation_revision=1, status='ready', activation_state='activation_pending',
                      workflow_owner_ref=self.owner_id, workflow_owner_epoch=self.owner_epoch)
        control = record(F['control'], scope=copy.deepcopy(scope), control_revision=1, stop_epoch=0)
        birth = record(F['birth'], scope=copy.deepcopy(scope), body=selector_for(sid, F['body'], body_key, body),
                       control=selector_for(sid, F['control'], control_key, control))
        birth_key = run_key(scope, 'birth')
        birth_origin = record(F['birth_origin'], birth=selector_for(sid, F['birth'], birth_key, birth),
                              operation_id='TEST_ONLY:operation:birth:' + K(scope['goal_run_id']))
        ico = record(F['initial_control_origin'], control=selector_for(sid, F['control'], control_key, control))
        pointer = record(F['pointer'], scope=copy.deepcopy(scope), body_key=body_key, body_revision=1)
        writes = [self.write(F['body'], body_key, body), self.write(F['control'], control_key, control),
                  self.write(F['birth'], birth_key, birth),
                  self.write(F['birth_origin'], run_key(scope, 'birth_origin'), birth_origin),
                  self.write(F['initial_control_origin'], run_key(scope, 'initial_control_origin'), ico),
                  self.write(F['pointer'], run_key(scope, 'pointer'), pointer)]
        return self.storage.transact(writes)

    def current(self, scope):
        pointer = self.storage.cell(F['pointer'], run_key(scope, 'pointer'))
        require('native/unborn', pointer is not None)
        body = self.storage.cell(F['body'], pointer['value']['body_key'])
        return pointer, body

    def commitment_of(self, scope, body_key, body):
        sid = self.storage.storage_instance_id
        control_key = run_key(scope, 'control')
        control = self.storage.cell(F['control'], control_key)['value']
        return dict(kind='historical_native_issuance_commitment', body=selector_for(sid, F['body'], body_key, body),
                    control=selector_for(sid, F['control'], control_key, control),
                    identity=copy.deepcopy(body['identity']), body_revision=body['body_revision'],
                    activation_revision=body['activation_revision'], status=body['status'],
                    activation_state=body['activation_state'], workflow_owner_ref=body['workflow_owner_ref'],
                    workflow_owner_epoch=body['workflow_owner_epoch'])

    def publish_writes(self, scope, status, *, activation_state=None, rule, operation_id, tx_ref, rev_offset=0,
                       head_status=None, d01_tx_ref=None, after_edit=None, update_edit=None):
        """Native body CAS + D01 update/origin/head for one native publication."""
        sid = self.storage.storage_instance_id
        pointer, cell = self.current(scope)
        before = cell['value']
        before_key = pointer['value']['body_key']
        rev = before['body_revision'] + 1
        after = copy.deepcopy(before)
        after.update(body_revision=rev, status=status)
        if activation_state is not None and activation_state != before['activation_state']:
            after.update(activation_state=activation_state, activation_revision=before['activation_revision'] + 1)
        after_key = run_key(scope, 'body:%d' % rev)
        before_c = self.commitment_of(scope, before_key, before)
        after_c = self.commitment_of(scope, after_key, after)
        if rev_offset:  # substituted commitment copies (one coherent defect for negatives)
            before_c['body_revision'] += rev_offset
            after_c['body_revision'] += rev_offset
        if after_edit:
            after_edit(after_c)
        update_key, origin_key, head_key = (run_key(scope, 'd01_update:%d' % rev), run_key(scope, 'd01_origin:%d' % rev),
                                            run_key(scope, 'd01_head:%d' % rev))
        update = record(F['d01_update'], scope=copy.deepcopy(scope), rule=rule, operation_id=operation_id,
                        before=copy.deepcopy(before_c), after=copy.deepcopy(after_c),
                        transaction_ref=d01_tx_ref or tx_ref)
        if update_edit:
            update_edit(update)
        origin = record(F['d01_origin'], update=selector_for(sid, F['d01_update'], update_key, update),
                        operation_id=operation_id, transaction_ref=tx_ref)
        head_after = copy.deepcopy(after_c)
        if head_status is not None:
            head_after['status'] = head_status
        head = record(F['d01_head'], scope=copy.deepcopy(scope), revision=rev + rev_offset,
                      update=selector_for(sid, F['d01_update'], update_key, update), after=head_after)
        new_pointer = record(F['pointer'], scope=copy.deepcopy(scope), body_key=after_key, body_revision=rev)
        writes = [self.write(F['body'], after_key, after), self.write(F['d01_update'], update_key, update),
                  self.write(F['d01_origin'], origin_key, origin), self.write(F['d01_head'], head_key, head),
                  self.write(F['pointer'], run_key(scope, 'pointer'), new_pointer, expected=pointer['version'])]
        sels = dict(d01_update=selector_for(sid, F['d01_update'], update_key, update),
                    d01_origin=selector_for(sid, F['d01_origin'], origin_key, origin),
                    d01_head=selector_for(sid, F['d01_head'], head_key, head))
        return writes, before_c, after_c, sels

    def advance(self, scope, status, activation_state=None):
        def build(tx_id):
            return self.publish_writes(scope, status, activation_state=activation_state, rule='TEST_ONLY:advance',
                                       operation_id='TEST_ONLY:operation:advance:%s:%s' % (K(scope['goal_run_id']), status),
                                       tx_ref=tx_id)[0]
        return self.storage.stamped(build)


class LaneStandardOwner(C.StandardOwner):
    """Durable Standard receipt + capture origin in one Storage transaction."""

    def capture(self, goal_run_id, decision, *, scope=None, exception=False, defects=()):
        sid = self.storage.storage_instance_id
        key = 'TEST_ONLY:standard:' + (run_key(scope, 'standard') if scope else K(sid) + ':' + K(goal_run_id))
        row = record(F['standard_receipt'], goal_run_id=goal_run_id, final_certifier_decision=decision,
                     tier='standard', unresolved_risk_refs=[],
                     exception_refs=['TEST_ONLY:approved-exception:1'] if exception else [], approval_refs=[])
        rsel = selector_for(sid, F['standard_receipt'], key, row)
        origin = record(F['standard_capture_origin'],
                        receipt=substituted(rsel) if 'capture_origin_substituted' in defects else rsel,
                        operation_id='TEST_ONLY:operation:standard:' + K(goal_run_id))
        tx = self.storage.transact([dict(table=F['standard_receipt'], key=key, expected=None, value=row),
                                    dict(table=F['standard_capture_origin'], key=key + ':origin', expected=None,
                                         value=origin)])
        rec = dict(qualification=QUALIFICATION, goal_run_id=goal_run_id, final_certifier_decision=decision,
                   receipt_ref='TEST_ONLY:standard-receipt:' + (tx['tx_id'] if 'standard_receipt_ref' not in defects
                                                                else 'TEST_ONLY:tx:other'),
                   storage_key=key, tx_id=tx['tx_id'],
                   receipt_selector=selector_for(sid, F['standard_receipt'], key, row),
                   capture_origin_selector=selector_for(sid, F['standard_capture_origin'], key + ':origin', origin))
        return self.issue(None, rec, kind='standard_receipt')

    def durable(self, rec):
        cell = self.storage.cell(F['standard_receipt'], rec['storage_key'])
        return cell is not None and cell.get('tx') == rec['tx_id']


def lp(text):
    raw = text.encode('utf-8', 'strict')
    return len(raw).to_bytes(8, 'big') + raw


def lane_identity(kind, scope, revision):
    """TEST_ONLY lane identity for Start/cancellation births (their owners' recipes
    belong to S1/R2; certified identity is the coordinator's I1 recipe)."""
    tuple_ = b''.join(lp(x) for x in (kind, scope['project_id'], scope['goal_run_id'], str(revision)))
    digest = sha256(b'pm.goal_test.dg_cf3.identity.v1\0' + tuple_)
    return 'goal_run.%s.v3:%s' % (kind, digest), 'TEST_ONLY:%s:%s' % (kind, digest)


def envelope(*, event_id, event_type, project_id, thread_id, run_id, actor_ref, occurred, correlation, cause,
             key, payload_schema_id, payload, replay_policy='dedupe_by_idempotency_key'):
    return dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project', event_id=event_id,
                event_type=event_type, project_id=project_id, thread_id=thread_id, run_id=run_id, node_id=None,
                attempt_id=None, actor_ref=actor_ref, requested_account_ref='TEST_ONLY:account:1',
                effective_account_ref='TEST_ONLY:account:1', occurred_at_utc=occurred, producer_sequence_id=None,
                correlation_id=correlation, causation_event_id=cause, parent_event_id=None, idempotency_key=key,
                payload_schema_id=payload_schema_id, payload=payload, payload_ref=None, redaction_profile='no_secrets',
                replay_policy=replay_policy,
                migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                               compatibility_event_type=None))


def payload_common(event_name, schema_version, occurred, scope, goal, before, after, key, role):
    return dict(event_name=event_name, schema_version=schema_version, occurred_at_utc=occurred,
                project_id=scope['project_id'], goal_id=scope['goal_id'], goal_revision=goal['goal_revision'],
                thread_id=goal['thread_id'], actor_ref='TEST_ONLY:actor:runtime', execution_role=role,
                requested_provider_ref='TEST_ONLY:provider:a', effective_provider_ref='TEST_ONLY:provider:a',
                requested_model_ref='TEST_ONLY:model:a', effective_model_ref='TEST_ONLY:model:a',
                requested_account_ref='TEST_ONLY:account:1', effective_account_ref='TEST_ONLY:account:1',
                correlation_id='TEST_ONLY:correlation:' + K(scope['goal_run_id'])[:64], evidence_refs=[],
                artifact_refs=[], expected_goal_run_revision=before, goal_run_revision=after, idempotency_key=key)


class StartOwner(StorageCellOwner):
    """TEST_ONLY Start owner: started-v3 Event (barrier) then the joint
    Start/native/D01 publication.  Full S1 OriginalWorkflowArgument sources are
    DG-S's; this owner issues the Start the combined consumer reduces."""
    role = 'start'

    def start(self, world, scope, goal, *, publish=True, tag=None, defects=(), check_state=True):
        sid = self.storage.storage_instance_id
        pointer, cell = world.native.current(scope)
        before = cell['value']
        require('start/state', not check_state or
                (before['status'] == 'ready' and before['activation_state'] == 'activation_pending'))
        occurred = self.storage.now()
        event_id, key = lane_identity('started' if tag is None else 'started-' + tag, scope, before['body_revision'] + 1)
        if tag is not None:
            event_id = 'goal_run.started.v3:' + event_id.split(':', 1)[1]
        offset = 94 if 'start_revision_offset' in defects else 0
        ev_offset = offset + (3 if 'start_event_revision_offset' in defects else 0)
        payload = payload_common('goal_run.started', STARTED_PAYLOAD, occurred, scope, goal,
                                 before['body_revision'] + ev_offset, before['body_revision'] + 1 + ev_offset, key,
                                 'runtime_controller')
        payload['payload'] = dict(goal_run_id=scope['goal_run_id'], workgraph_ref=before['identity']['workgraph_ref'],
                                  activation_receipt_ref='TEST_ONLY:activation-receipt:' + K(scope['goal_run_id'])[:48],
                                  active_worknode_request_refs=['TEST_ONLY:worknode-request:1'],
                                  write_mode='isolated_worktree', certification_tier='standard')
        world.payload_bank.validate(STARTED_PAYLOAD, payload, 'start/payload')
        event = envelope(event_id=event_id, event_type='goal_run.started', project_id=scope['project_id'],
                         thread_id=goal['thread_id'], run_id=scope['goal_run_id'], actor_ref='TEST_ONLY:actor:runtime',
                         occurred=occurred, correlation=payload['correlation_id'], cause=None, key=key,
                         payload_schema_id=STARTED_PAYLOAD, payload=payload)
        handles, _, _ = world.appender.append_original('TEST_ONLY:operation:start:' + event_id,
                                                       dict(kind='start', event_id=event_id), [event],
                                                       durability_class='barrier')
        receipt = world.appender.first_receipt(handles[0])
        if not publish:
            return dict(event_id=event_id, sequence_id=receipt['first_append_receipt']['sequence_id'], tx=None)

        def build(tx_id):
            writes, before_c, after_c, sels = world.native.publish_writes(
                scope, 'running', activation_state='active', rule='TEST_ONLY:start',
                operation_id='TEST_ONLY:operation:start:' + event_id, tx_ref=tx_id, rev_offset=offset,
                head_status='ready' if 'start_head_status' in defects else None)
            cand_key, commit_key, origin_key = run_key(scope, 'start_candidate'), run_key(scope, 'start_commit'), run_key(scope, 'start_origin')
            cand = record(F['start_candidate'], scope=copy.deepcopy(scope), event_id=event_id,
                          producer_semantic_digest=sha256(b'TEST_ONLY:other-producer')
                          if 'start_candidate_digest' in defects else receipt['producer_semantic_digest'],
                          before=before_c)
            first = receipt['first_append_receipt']
            commit = record(F['start_commit'], scope=copy.deepcopy(scope), event_id=event_id,
                            sequence_id=first['sequence_id'] + (1 if 'start_commit_sequence' in defects else 0),
                            first_receipt_sha256=value_sha(dict(first, durability_state='pending')
                                                           if 'start_first_receipt' in defects else first),
                            candidate=self.sel(F['start_candidate'], cand_key, cand),
                            d01_update=sels['d01_update'], d01_origin=sels['d01_origin'], d01_head=sels['d01_head'],
                            goal_context=copy.deepcopy(goal['selectors']),
                            goal_revision=goal['goal_revision'] + (1 if 'start_goal_revision' in defects else 0),
                            transaction_ref=tx_id)
            csel = self.sel(F['start_commit'], commit_key, commit)
            origin = record(F['start_origin'], commit=substituted(csel) if 'start_origin_selector' in defects else csel,
                            operation_id='TEST_ONLY:operation:start:' + event_id, transaction_ref=tx_id)
            out = writes + [self.write(F['start_candidate'], cand_key, cand),
                            self.write(F['start_commit'], commit_key, commit)]
            if 'start_no_origin' not in defects:
                out.append(self.write(F['start_origin'], origin_key, origin))
            return out
        tx, tx_id = self.storage.stamped(build)
        return dict(event_id=event_id, sequence_id=receipt['first_append_receipt']['sequence_id'], tx=tx_id)


class CancelOwner(StorageCellOwner):
    """TEST_ONLY positive cancellation owner: D05, cancelled-v3 Event (barrier),
    then D06 + native/D01 publication.  Full R2 sources are DG-R's."""
    role = 'cancel'

    def cancel(self, world, scope, goal, *, publish=True, tag=None, check_state=True, defects=()):
        sid = self.storage.storage_instance_id
        pointer, cell = world.native.current(scope)
        before = cell['value']
        require('cancel/state', not check_state or
                before['status'] in ('ready', 'running', 'provisional_success', 'verifying'))
        started = before['activation_state'] == 'active'
        d05_key = run_key(scope, 'd05_result')
        d05 = record(F['d05_result'], scope=copy.deepcopy(scope),
                     outcome='failed' if 'd05_failed' in defects else 'success', effects=[], mutation_started=False)
        d05sel = self.sel(F['d05_result'], d05_key, d05)
        d05_origin = record(F['d05_origin'], result=substituted(d05sel) if 'd05_origin_selector' in defects else d05sel,
                            operation_id='TEST_ONLY:operation:d05:' + K(scope['goal_run_id'])[:48])
        if self.storage.cell(F['d05_result'], d05_key) is None:
            self.storage.transact([self.write(F['d05_result'], d05_key, d05),
                                   self.write(F['d05_origin'], run_key(scope, 'd05_origin'), d05_origin)])
        else:
            d05 = self.storage.cell(F['d05_result'], d05_key)['value']
        occurred = self.storage.now()
        event_id, key = lane_identity('cancelled' if tag is None else 'cancelled-' + tag, scope,
                                      before['body_revision'] + 1)
        ev_offset = 3 if 'cancel_event_revision_offset' in defects else 0
        if tag is not None:
            event_id = 'goal_run.cancelled.v3:' + event_id.split(':', 1)[1]
        payload = payload_common('goal_run.cancelled', CANCELLED_PAYLOAD, occurred, scope, goal,
                                 before['body_revision'] + ev_offset, before['body_revision'] + 1 + ev_offset, key,
                                 'runtime_controller')
        payload['payload'] = dict(goal_run_id=scope['goal_run_id'], cancel_reason='user_cancelled',
                                  mutation_started=False, settlement_refs=[])
        world.payload_bank.validate(CANCELLED_PAYLOAD, payload, 'cancel/payload')
        event = envelope(event_id=event_id, event_type='goal_run.cancelled', project_id=scope['project_id'],
                         thread_id=goal['thread_id'], run_id=scope['goal_run_id'], actor_ref='TEST_ONLY:actor:runtime',
                         occurred=occurred, correlation=payload['correlation_id'], cause=None, key=key,
                         payload_schema_id=CANCELLED_PAYLOAD, payload=payload)
        handles, _, _ = world.appender.append_original('TEST_ONLY:operation:cancel:' + event_id,
                                                       dict(kind='cancel', event_id=event_id), [event],
                                                       durability_class='barrier')
        receipt = world.appender.first_receipt(handles[0])
        if not publish:
            return dict(event_id=event_id, sequence_id=receipt['first_append_receipt']['sequence_id'], tx=None,
                        started=started)

        def build(tx_id):
            def update_edit(update):
                update['after']['workflow_owner_epoch'] += 1
            writes, before_c, after_c, sels = world.native.publish_writes(
                scope, 'stopped' if 'cancel_status_stopped' in defects else 'cancelled',
                activation_state=None if started else 'cancelled_before_mutation',
                rule='TEST_ONLY:d06', operation_id='TEST_ONLY:operation:d06:' + event_id, tx_ref=tx_id,
                update_edit=update_edit if 'cancel_update_edit' in defects else None)
            names = {}
            out = list(writes)
            base = dict(scope=copy.deepcopy(scope), event_id=event_id, before=before_c, after=after_c,
                        transaction_ref=tx_id)
            for name in ('d06_candidate', 'd06_intent', 'd06_result'):
                value = record(F[name], **base, first_receipt_sha256=value_sha(receipt['first_append_receipt']),
                               d05=self.sel(F['d05_result'], d05_key, d05), d01=sels)
                if ('d06_result_event' in defects and name == 'd06_result') or \
                        ('d06_candidate_event' in defects and name == 'd06_candidate') or \
                        ('d06_intent_event' in defects and name == 'd06_intent'):
                    value['event_id'] = event_id + ':substituted'
                names[name] = (run_key(scope, name), value)
                out.append(self.write(F[name], *names[name]))
            for name in ('d06_prepare_origin', 'd06_publish_origin'):
                rsel = self.sel(F['d06_result'], *names['d06_result'])
                value = record(F[name], result=substituted(rsel) if name + '_selector' in defects else rsel,
                               operation_id='TEST_ONLY:operation:d06:' + event_id, transaction_ref=tx_id)
                out.append(self.write(F[name], run_key(scope, name), value))
            return out
        tx, tx_id = self.storage.stamped(build)
        return dict(event_id=event_id, sequence_id=receipt['first_append_receipt']['sequence_id'], tx=tx_id,
                    started=started)


class CoordinatorOwner(StorageCellOwner):
    """TEST_ONLY compact coordinator: Commit/Origin coissued with the native
    certified result and D01 in one Storage transaction, Release later."""
    role = 'coordinator'

    def commit_and_release(self, world, scope, event_id, receipt, standard, *, release=True, defects=()):
        sid = self.storage.storage_instance_id

        def build(tx_id):
            writes, before_c, after_c, sels = world.native.publish_writes(
                scope, 'certified', rule='TEST_ONLY:certify', operation_id='TEST_ONLY:operation:certify:' + event_id,
                tx_ref=tx_id, head_status='verifying' if 'd01_head_after' in defects else None,
                d01_tx_ref='TEST_ONLY:tx:%s:0' % sid if 'd01_other_transaction' in defects else None,
                after_edit=(lambda c: c.update(workflow_owner_epoch=c['workflow_owner_epoch'] + 1))
                if 'after_owner_epoch' in defects else None)
            res_key, org_key = run_key(scope, 'native_result'), run_key(scope, 'native_origin')
            result = record(F['native_result'], scope=copy.deepcopy(scope),
                            event_id=event_id + (':substituted' if 'result_event' in defects else ''),
                            decision='certified',
                            before=before_c, after=after_c, standard=standard['receipt_selector'],
                            transaction_ref=tx_id)
            rsel = self.sel(F['native_result'], res_key, result)
            origin = record(F['native_origin'], result=substituted(rsel) if 'native_origin_selector' in defects else rsel,
                            operation_id='TEST_ONLY:operation:certify:' + event_id, transaction_ref=tx_id)
            commit = record(F['coordinator_commit'], scope=copy.deepcopy(scope),
                            event_id=event_id + (':substituted' if 'commit_event' in defects else ''),
                            first_receipt_sha256=value_sha(dict(receipt['first_append_receipt'], durability_state='pending')
                                                           if 'commit_first_receipt' in defects
                                                           else receipt['first_append_receipt']),
                            value_commitment_sha256=sha256(b'TEST_ONLY:other-commitment')
                            if 'commit_value_commitment' in defects
                            else receipt['original_event_value_commitment']['sha256'],
                            producer_semantic_digest=sha256(b'TEST_ONLY:other-producer')
                            if 'commit_producer_digest' in defects else receipt['producer_semantic_digest'],
                            native_result=self.sel(F['native_result'], res_key, result),
                            native_origin=self.sel(F['native_origin'], org_key, origin),
                            d01_update=sels['d01_update'], d01_origin=sels['d01_origin'], d01_head=sels['d01_head'],
                            standard_receipt=standard['receipt_selector'],
                            standard_capture_origin=standard['capture_origin_selector'], transaction_ref=tx_id)
            csel = self.sel(F['coordinator_commit'], run_key(scope, 'coordinator_commit'), commit)
            corigin = record(F['coordinator_origin'], commit=substituted(csel) if 'origin_selector' in defects else csel,
                             operation_id='TEST_ONLY:operation:certify:' + event_id, transaction_ref=tx_id)
            out = writes + [self.write(F['native_result'], res_key, result),
                            self.write(F['native_origin'], org_key, origin),
                            self.write(F['coordinator_commit'], run_key(scope, 'coordinator_commit'), commit),
                            self.write(F['coordinator_origin'], run_key(scope, 'coordinator_origin'), corigin)]
            if 'release_same_transaction' in defects:
                out.append(self.write(F['coordinator_release'], run_key(scope, 'coordinator_release'), record(
                    F['coordinator_release'], commit=csel, commit_transaction=tx_id, readback=True, event_id=event_id)))
            return out
        _, commit_tx = self.storage.stamped(build)
        if 'release_same_transaction' in defects:
            return dict(commit_tx=commit_tx, release_tx=commit_tx)
        if not release:
            return dict(commit_tx=commit_tx, release_tx=None)
        commit_cell = self.storage.cell(F['coordinator_commit'], run_key(scope, 'coordinator_commit'))
        require('release/readback', commit_cell is not None and commit_cell['tx'] == commit_tx)
        csel = self.sel(F['coordinator_commit'], run_key(scope, 'coordinator_commit'), commit_cell['value'])
        rel = record(F['coordinator_release'], commit=substituted(csel) if 'release_selector' in defects else csel,
                     commit_transaction=commit_tx if 'release_commit_transaction' not in defects else 'TEST_ONLY:tx:other',
                     readback=True, event_id=event_id)
        tx = self.storage.transact([self.write(F['coordinator_release'], run_key(scope, 'coordinator_release'), rel)])
        return dict(commit_tx=commit_tx, release_tx=tx['tx_id'])


class NoteOwner(StorageCellOwner):
    """TEST_ONLY off-run registered families (and same-run unsupported GoalRun
    transitions for halting negatives)."""
    role = 'note'

    def note(self, world, project_id, *, run_id=None, event_type='goal_test.note', payload_schema_id=NOTE_PAYLOAD,
             tag='n'):
        occurred = self.storage.now()
        event_id = 'TEST_ONLY:%s:%s:%s' % (event_type, K(project_id)[:24], tag)
        event = envelope(event_id=event_id, event_type=event_type, project_id=project_id, thread_id=None,
                         run_id=run_id, actor_ref='TEST_ONLY:actor:note', occurred=occurred,
                         correlation='TEST_ONLY:correlation:note', cause=None, key='TEST_ONLY:key:' + event_id,
                         payload_schema_id=payload_schema_id, payload=dict(qualification=QUALIFICATION, tag=tag))
        handles, _, _ = world.appender.append_original('TEST_ONLY:operation:note:' + event_id,
                                                       dict(kind='note', event_id=event_id), [event])
        return world.appender.event(handles[0])


# --------------------------------------------------------------------- world

def payload_bank():
    return A.RootBank([dict(path='Plans/executor_cancellation_contracts/schemas/goal-run-started.v3.schema.json'),
                       dict(path='Plans/executor_cancellation_contracts/schemas/goal-run-cancelled.v3.schema.json')])


class World:
    """One TEST_ONLY execution: Storage, registry, recorder and every owner."""

    def __init__(self, work, *, segment_target_bytes=65536, storage=None):
        self.work = Path(work)
        self.bank = C.bank()
        self.payload_bank = payload_bank()
        self.registry = A.OwnerRegistry()
        self.recorder = self.registry.recorder
        self.storage = storage or LaneStorage.create(self.work / 'storage', segment_target_bytes=segment_target_bytes)
        self.appender = A.AppendOwner(self.registry, self.storage)
        self.standard = LaneStandardOwner(self.registry, self.storage)
        self.identity = C.IdentityOwner(self.registry, self.storage)
        self.producer = C.Producer(self.registry)
        self.partition = C.StoragePartitionOwner(self.registry, self.storage, bank=self.bank)
        self.native = NativeOwner(self.registry, self.storage)
        self.goal = GoalOwner(self.registry, self.storage)
        self.starter = StartOwner(self.registry, self.storage)
        self.canceller = CancelOwner(self.registry, self.storage)
        self.coordinator = CoordinatorOwner(self.registry, self.storage)
        self.notes = NoteOwner(self.registry, self.storage)
        self.sources = {}
        for role in ('assignment', 'invocation', 'causality', 'native_source', 'goal_source', 'descriptor'):
            self.sources[role] = type(role.title().replace('_', '') + 'Owner', (A.TestOwner,), {'role': role})(self.registry)
        self.goals = {}
        self.cause_counter = 0

    def scope(self, project_id, goal_id, goal_run_id):
        return dict(storage_instance_id=self.storage.storage_instance_id, project_id=project_id, goal_id=goal_id,
                    goal_run_id=goal_run_id)

    def identity_of(self, scope):
        return dict(project_id=scope['project_id'], goal_id=scope['goal_id'], goal_run_id=scope['goal_run_id'],
                    plan_compile_run_id='TEST_ONLY:plan-compile:1', workgraph_id='TEST_ONLY:workgraph:1',
                    workgraph_revision=1, workgraph_ref='TEST_ONLY:workgraph-ref:1',
                    workgraph_sha256=sha256(b'TEST_ONLY:workgraph:1'))

    def ensure_goal(self, scope):
        gk = (scope['project_id'], scope['goal_id'])
        if gk not in self.goals:
            self.goals[gk] = self.goal.create(scope)
        return self.goals[gk]

    def birth(self, scope):
        self.ensure_goal(scope)
        return self.native.birth(scope, self.identity_of(scope))

    def start(self, scope, **kw):
        return self.starter.start(self, scope, self.ensure_goal(scope), **kw)

    def cancel(self, scope, **kw):
        return self.canceller.cancel(self, scope, self.ensure_goal(scope), **kw)

    def cause(self, project_id):
        import uuid
        return self.notes.note(self, project_id, event_type='goal_test.cause', payload_schema_id=CAUSE_PAYLOAD,
                               tag='cause-' + uuid.uuid4().hex)['event_id']

    def certify(self, scope, *, validators=1, release=True, durability='barrier', commit=True, defects=(),
                check_state=True):
        """Standard capture, CF-01 identity/producer, barrier append, joint
        native/D01/coordinator commit, Release."""
        goal = self.ensure_goal(scope)
        _, cell = self.native.current(scope)
        body = cell['value']
        require('certify/native_state', not check_state or body['status'] in ('provisional_success', 'verifying'))
        decided = self.storage.now()
        run = scope['goal_run_id']
        native_src = dict(qualification=QUALIFICATION, goal_run_id=run, goal_id=scope['goal_id'],
                          project_id=scope['project_id'], work_graph_id=body['identity']['workgraph_id'],
                          status=body['status'],
                          revision=body['body_revision'] + (3 if 'event_revision_offset' in defects else 0),
                          final_certifier_decision='certified',
                          decided_at_utc=decided,
                          validator_outputs=[dict(validator_id='TEST_ONLY:validator:%d' % i, outcome='passed',
                                                  evidence_ref='TEST_ONLY:evidence:%d' % i) for i in range(validators)],
                          worknode_receipt_refs=['TEST_ONLY:worknode-receipt:1'], evidence_refs=['TEST_ONLY:evidence:0'],
                          artifact_refs=[])
        src = self.sources
        h = {}
        h['assignment'] = (src['assignment'].owner_id, src['assignment'].issue(None, dict(
            qualification=QUALIFICATION, assignment_id='TEST_ONLY:assignment:' + K(run)[:48], goal_run_id=run,
            actor_ref='TEST_ONLY:actor:certifier', execution_role='verifier'), kind='assignment'))
        h['invocation'] = (src['invocation'].owner_id, src['invocation'].issue(None, dict(
            qualification=QUALIFICATION, operation_id='TEST_ONLY:invocation:' + K(run)[:48],
            assignment_id='TEST_ONLY:assignment:' + K(run)[:48], requested_provider_ref='TEST_ONLY:provider:a',
            effective_provider_ref='TEST_ONLY:provider:a', requested_model_ref='TEST_ONLY:model:a',
            effective_model_ref='TEST_ONLY:model:a-2026', requested_account_ref='TEST_ONLY:account:1',
            effective_account_ref='TEST_ONLY:account:1', correlation_id='TEST_ONLY:correlation:certified'),
            kind='invocation'))
        h['causality'] = (src['causality'].owner_id, src['causality'].issue(None, dict(
            qualification=QUALIFICATION, causation_event_id=self.cause(scope['project_id'])), kind='cause'))
        h['native'] = (src['native_source'].owner_id, src['native_source'].issue(None, native_src,
                                                                                 kind='native_certification_source'))
        h['standard'] = (self.standard.owner_id, self.standard.capture(run, 'certified', scope=scope,
                                                                       exception='standard_exception' in defects,
                                                                       defects=defects))
        h['goal'] = (src['goal_source'].owner_id, src['goal_source'].issue(None, dict(
            qualification=QUALIFICATION, goal_id=scope['goal_id'], project_id=scope['project_id'],
            goal_revision=goal['goal_revision'], thread_id=goal['thread_id']), kind='current_goal'))
        h['storage_partition'] = (self.partition.owner_id, self.partition.register_route(scope['project_id']))
        h['descriptor'] = (src['descriptor'].owner_id, src['descriptor'].issue(None, dict(
            qualification=QUALIFICATION, recipe_id=C.RECIPE['recipe_id'],
            profile_sha256=(ROOT / 'Plans/goal_certified_event_coordinator_contracts/installed-profile-digest.txt')
            .read_text().strip()), kind='descriptor'))
        # roles are fixed by the CF-01 owners: rebind them to the role names they acquire under
        reg = {'native': 'native_source', 'goal': 'goal_source'}
        handles = {}
        for role, (owner_id, handle) in h.items():
            handles[role] = (owner_id, handle)
        identity = (self.identity.owner_id, self.identity.derive_original_identity(
            _RoleWorld(self, reg), {k: v for k, v in handles.items() if k != 'causality'}))
        event = self.producer.prepare(_RoleWorld(self, reg), identity, handles)
        request = dict(kind='TEST_ONLY:goal_run.certified.append', event_id=event['event_id'])
        ev_handles, _, _ = self.appender.append_original('TEST_ONLY:operation:certified:' + event['event_id'], request,
                                                         [event], durability_class=durability)
        receipt = self.appender.first_receipt(ev_handles[0])
        standard = self.standard.resolve(h['standard'][1])[1]
        if not commit:
            return dict(event_id=event['event_id'], sequence_id=receipt['first_append_receipt']['sequence_id'],
                        commit_tx=None, release_tx=None)
        txs = self.coordinator.commit_and_release(self, scope, event['event_id'], receipt, standard, release=release,
                                                  defects=defects)
        return dict(event_id=event['event_id'], sequence_id=receipt['first_append_receipt']['sequence_id'], **txs)

    def certified_run(self, scope, *, start=True, validators=1, release=True, durability='barrier', defects=(),
                      progress=True, start_defects=()):
        self.birth(scope)
        out = {}
        if start:
            out['start'] = self.start(scope, defects=start_defects)
        else:
            self.native.advance(scope, 'running', 'active')
        if progress:
            self.native.advance(scope, 'provisional_success')
            self.native.advance(scope, 'verifying')
        out['certified'] = self.certify(scope, validators=validators, release=release, durability=durability,
                                        defects=defects, check_state=progress)
        return out


class _RoleWorld:
    """The CF-01 owners acquire by role through ``world.registry``; this shim
    maps the CF-01 role names ('native', 'goal') onto this world's source owners
    without editing the adapter module."""

    def __init__(self, world, roles):
        self._world = world
        self.bank = world.bank
        self.storage = world.storage
        self.standard = world.standard
        self.registry = _RoleRegistry(world.registry, roles)


class _RoleRegistry:
    def __init__(self, registry, roles):
        self._registry = registry
        self._roles = roles
        self.recorder = registry.recorder

    def owner(self, owner_id, role):
        return self._registry.owner(owner_id, self._roles.get(role, role))

    def authenticate_owner(self, owner, role):
        return self._registry.authenticate_owner(owner, self._roles.get(role, role))

    def __getattr__(self, name):
        return getattr(self._registry, name)
