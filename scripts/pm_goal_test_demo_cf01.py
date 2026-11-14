#!/usr/bin/env python3
"""CF-01 demonstration on the shared TEST_ONLY owner adapters (goal_run.certified).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

ATS-057 CF-01 (Plans/Automated_Testing_System.md:5331-5335) with the
coordinator identity contract I0/I1 and the exact recipe
(Plans/goal_certified_event_coordinator_contracts/protocol.md:7-13):

1. Independent TEST_ONLY owners issue every pre-identity source: assignment,
   invocation (requested/effective runtime), causality (an Event genuinely
   appended in Storage), native Workflow run at its before revision with the
   final decision, the durable Standard receipt (a real Storage transaction),
   the current Goal, the Storage-issued partition/route record and the
   installed descriptor.
2. The identity owner acquires each through the registry, runs the I0
   joins, derives IdentityInput / IdentityResult with I1's LP tuple, K and E,
   recomputes them independently, then issues the result.
3. The producer acquires the issued identity (never a candidate) and the
   sources, prepares the whole 25-field producer with required-present nulls,
   validates the whole v3 payload root and maps every field to its source.
4. The append owner appends through Storage, which assigns sequence/times and
   issues the first receipt (custody v2); retry is checked twice: lost
   acknowledgement (same operation, no durable change) and equal retry (new
   operation, dedupe, same first receipt, no second Event).

Negatives change one thing at one boundary and keep every other copy coherent.
This demonstration is for the family lane to adopt; it does not close CF-01's
native claims, which stay NOT_RUN.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unicodedata

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A

ROOT = NR.ROOT
QUALIFICATION = 'TEST_ONLY'
IDENTITY = 'https://puppetmaster.local/proposals/goal_certified_event_identity.v1.schema.json'
COORDINATOR = 'https://puppetmaster.local/proposals/goal_certified_event_coordinator.v1.schema.json'
PAYLOAD = 'pm.goal_runtime_event.goal_run_certified.schema.v3'
RECIPE = dict(recipe_id='pm.goal_run.certified.identity.v3', schema_version='1.0.0', scope='project',
              event_type='goal_run.certified', payload_schema_id=PAYLOAD, replay_policy='dedupe_by_idempotency_key',
              tuple_fields=['goal_run_id', 'certification_receipt_ref', 'final_certifier_decision',
                            'expected_goal_run_revision', 'goal_run_revision'],
              key_codec='length_prefixed_utf8_v1', event_id_codec='sha256_domain_scoped_key_v1')
ENVELOPE_FIELDS = ('schema_id', 'schema_version', 'scope_kind', 'event_id', 'event_type', 'project_id', 'thread_id',
                   'run_id', 'node_id', 'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
                   'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
                   'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload', 'payload_ref',
                   'redaction_profile', 'replay_policy', 'migration')


def bank():
    return A.RootBank([
        dict(path='Plans/goal_certified_event_coordinator_contracts/schemas/coordinator.v1.schema.json'),
        dict(path='Plans/goal_certified_event_coordinator_contracts/schemas/identity.v1.schema.json'),
        dict(path='Plans/workflow_standard_source_contracts/schemas/goal-run-certified.v3.schema.json'),
    ])


# ------------------------------------------------------------ codecs

def source_json(value):
    """pm.goal.certified_producer_source_json.v1 (protocol.md:21): sorted by
    Unicode scalar, exact integers, no floats, no whitespace, UTF-8."""
    def check(v):
        if type(v) is float:
            raise A.AdapterRefusal('source_json/float')
        if type(v) is int:
            NR.integer(v, 'source_json/integer')
        elif type(v) is dict:
            for k, x in v.items():
                if type(k) is not str:
                    raise A.AdapterRefusal('source_json/key')
                check(x)
        elif type(v) is list:
            for x in v:
                check(x)
        elif type(v) is str:
            v.encode('utf-8', 'strict')
        elif v is not None and type(v) is not bool:
            raise A.AdapterRefusal('source_json/type')
    check(value)
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), sort_keys=True,
                      allow_nan=False).encode('utf-8')


def lp(raw: bytes) -> bytes:
    return str(len(raw)).encode('ascii') + b':' + raw


def owner_identity(input_, formula='certified_v3'):
    """I1 as the identity owner computes it."""
    tuple_ = [input_['scope']['goal_run_id'], input_['certification_receipt_ref'],
              input_['final_certifier_decision'], str(input_['expected_goal_run_revision']),
              str(input_['goal_run_revision'])]
    k = b'goal_run.certified.v3:' + b''.join(lp(t.encode('utf-8')) for t in tuple_)
    if formula == 'unprefixed_key':
        k = b''.join(lp(t.encode('utf-8')) for t in tuple_)
    domain = {'certified_v3': b'pm.goal_run.certified.event_id.v3', 'unprefixed_key': b'pm.goal_run.certified.event_id.v3',
              'start_formula': b'pm.goal_run.started.event_id.v3'}[formula]
    e = domain + b'\0' + lp(input_['scope']['scope_partition'].encode('utf-8')) + lp(k)
    return dict(event_id='goal_run.certified.v3:' + hashlib.sha256(e).hexdigest(), idempotency_key=k.decode('utf-8'))


def independent_identity(goal_run_id, receipt, decision, before, after, partition):
    """Second, separately written recomputation from the raw source values."""
    def LP(text):
        data = bytes(text, 'utf-8')
        return b'%d:%s' % (len(data), data)
    key = bytes('goal_run.certified.v3:', 'ascii') + LP(goal_run_id) + LP(receipt) + LP(decision) + \
        LP('%d' % before) + LP('%d' % after)
    preimage = bytes('pm.goal_run.certified.event_id.v3', 'ascii') + bytes(1) + LP(partition) + \
        b'%d:%s' % (len(key), key)
    return 'goal_run.certified.v3:' + hashlib.sha256(preimage).hexdigest(), str(key, 'utf-8')


# ------------------------------------------------------------ owners

class StoragePartitionOwner(A.TestOwner):
    """Storage-owned registration/selection record; the partition comes from Storage."""
    role = 'storage_partition'

    def __init__(self, registry, storage, **kw):
        super().__init__(registry, **kw)
        self.storage = storage

    def register_route(self, project_id, partition_recipe='base64url'):
        event_scope = dict(scope_kind='project', project_id=project_id)
        partition = (S.scope_partition(event_scope) if partition_recipe == 'base64url'
                     else 'project~' + project_id.encode('utf-8').hex())
        record = dict(qualification=QUALIFICATION, storage_instance_id=self.storage.storage_instance_id,
                      project_id=project_id, scope_partition=partition,
                      route='TEST_ONLY:route:goal_run.certified.v3',
                      owner=dict(owner_id=self.owner_id, owner_epoch=self.owner_epoch,
                                 operation_id='TEST_ONLY:operation:partition-registration'))
        self.bank.validate(COORDINATOR + '#/$defs/Owner', record['owner'], 'partition/owner')
        return self.issue(None, record, kind='storage_partition')


class StandardOwner(A.TestOwner):
    """Durable Standard receipt: a genuine Storage transaction before identity."""
    role = 'standard'

    def __init__(self, registry, storage, **kw):
        super().__init__(registry, **kw)
        self.storage = storage

    def capture(self, goal_run_id, decision):
        key = 'TEST_ONLY:standard:' + S.k_component(goal_run_id)
        row = dict(qualification=QUALIFICATION, goal_run_id=goal_run_id, final_certifier_decision=decision)
        tx = self.storage.transact([dict(table='TEST_ONLY:standard_receipt', key=key, expected=None, value=row)])
        record = dict(row, receipt_ref='TEST_ONLY:standard-receipt:' + tx['tx_id'], storage_key=key,
                      tx_id=tx['tx_id'])
        return self.issue(None, record, kind='standard_receipt')

    def durable(self, record):
        cell = self.storage.cell('TEST_ONLY:standard_receipt', record['storage_key'])
        return cell is not None and cell.get('tx') == record['tx_id']


class IdentityOwner(A.TestOwner):
    role = 'identity'
    custody_codec = 'exact_json'  # arbitrary-precision revisions; no msgpack cap on the identity record

    def __init__(self, registry, storage, formula='certified_v3', **kw):
        super().__init__(registry, **kw)
        self.storage = storage
        self.formula = formula

    def derive_original_identity(self, world, handles, input_edit=None):
        reg = world.registry
        with self.recorder.call(self.owner_id, 'derive_original_identity') as slot:
            got = {}
            for role, (owner_id, handle) in handles.items():
                got[role] = A.acquire(reg, owner_id, role, handle)[1]
            descriptor = got.get('descriptor')
            A.require('identity/descriptor_unavailable', descriptor is not None and
                      descriptor.get('recipe_id') == RECIPE['recipe_id'])
            native, standard, goal, part = got['native'], got['standard'], got['goal'], got['storage_partition']
            assignment, invocation = got['assignment'], got['invocation']
            # I0 joins over complete pre-identity sources.
            A.require('identity/partition_storage', part['storage_instance_id'] == self.storage.storage_instance_id)
            A.require('identity/partition_recomputed', part['scope_partition'] ==
                      S.scope_partition(dict(scope_kind='project', project_id=part['project_id'])))
            A.require('identity/project', native['project_id'] == goal['project_id'] == part['project_id'])
            A.require('identity/goal', native['goal_id'] == goal['goal_id'])
            A.require('identity/assignment_run', assignment['goal_run_id'] == native['goal_run_id'])
            A.require('identity/invocation_assignment', invocation['assignment_id'] == assignment['assignment_id'])
            A.require('identity/standard_run', standard['goal_run_id'] == native['goal_run_id'])
            A.require('identity/standard_durable', world.standard.durable(standard))
            A.require('identity/standard_decision', standard['final_certifier_decision'] ==
                      native['final_certifier_decision'])
            before = NR.integer(native['revision'], 'identity/native_revision', minimum=0)
            input_ = dict(scope=dict(project_id=native['project_id'], goal_id=native['goal_id'],
                                     goal_run_id=native['goal_run_id'], work_graph_id=native['work_graph_id'],
                                     storage_instance_id=part['storage_instance_id'],
                                     scope_partition=part['scope_partition']),
                          recipe=copy.deepcopy(RECIPE), original_storage_partition_owner=copy.deepcopy(part['owner']),
                          original_invocation_operation_id=invocation['operation_id'],
                          certification_receipt_ref=standard['receipt_ref'],
                          final_certifier_decision=native['final_certifier_decision'],
                          expected_goal_run_revision=before, goal_run_revision=before + 1,
                          installed_profile_sha256=descriptor['profile_sha256'])
            if input_edit:
                input_ = input_edit(input_)
            A.require('identity/decision', input_['final_certifier_decision'] == 'certified')
            for field in ('expected_goal_run_revision', 'goal_run_revision'):
                NR.integer(input_[field], 'identity/' + field, minimum=0)
            A.require('identity/revision_step', input_['goal_run_revision'] == input_['expected_goal_run_revision'] + 1)
            world.bank.validate(IDENTITY + '#/$defs/IdentityInput', input_, 'identity/input')
            derived = owner_identity(input_, self.formula)
            ind_event, ind_key = independent_identity(
                input_['scope']['goal_run_id'], input_['certification_receipt_ref'], input_['final_certifier_decision'],
                input_['expected_goal_run_revision'], input_['goal_run_revision'], input_['scope']['scope_partition'])
            A.require('identity/independent_key', derived['idempotency_key'] == ind_key)
            A.require('identity/independent_event_id', derived['event_id'] == ind_event)
            result = dict(input=input_, event_id=derived['event_id'], idempotency_key=derived['idempotency_key'],
                          replay_policy='dedupe_by_idempotency_key',
                          recipe_sha256=hashlib.sha256(source_json(RECIPE)).hexdigest(),
                          whole_input_sha256=hashlib.sha256(source_json(input_)).hexdigest())
            world.bank.validate(IDENTITY + '#/$defs/IdentityResult', result, 'identity/result')
            handle = self._issue(IDENTITY + '#/$defs/IdentityResult', result, kind='identity_result')
            slot.set(result)
            return handle


class Producer(A.TestOwner):
    role = 'producer'

    def prepare(self, world, identity, handles, candidate_edit=None):
        reg = world.registry
        with self.recorder.call(self.owner_id, 'prepare_producer') as slot:
            A.require('producer/identity_handle', type(identity) is tuple and len(identity) == 2)
            id_owner = reg.owner(identity[0], 'identity')
            _, result = id_owner.resolve(identity[1], root=IDENTITY + '#/$defs/IdentityResult')
            src = {role: A.acquire(reg, owner_id, role, handle)[1] for role, (owner_id, handle) in handles.items()}
            native, goal, inv, asg, cause = src['native'], src['goal'], src['invocation'], src['assignment'], src['causality']
            standard = src['standard']
            A.require('producer/cause_appended', world.storage.read_event(cause['causation_event_id'])['event_id']
                      == cause['causation_event_id'])
            scope = result['input']['scope']
            payload = dict(event_name='goal_run.certified', schema_version=PAYLOAD,
                           occurred_at_utc=native['decided_at_utc'], project_id=goal['project_id'],
                           goal_id=goal['goal_id'], goal_revision=goal['goal_revision'], thread_id=goal['thread_id'],
                           actor_ref=asg['actor_ref'], execution_role=asg['execution_role'],
                           requested_provider_ref=inv['requested_provider_ref'],
                           effective_provider_ref=inv['effective_provider_ref'],
                           requested_model_ref=inv['requested_model_ref'], effective_model_ref=inv['effective_model_ref'],
                           requested_account_ref=inv['requested_account_ref'],
                           effective_account_ref=inv['effective_account_ref'], correlation_id=inv['correlation_id'],
                           causation_event_ref=cause['causation_event_id'],
                           evidence_refs=list(native['evidence_refs']), artifact_refs=list(native['artifact_refs']),
                           payload=dict(goal_run_id=scope['goal_run_id'],
                                        certification_receipt_ref=result['input']['certification_receipt_ref'],
                                        validator_outputs=copy.deepcopy(native['validator_outputs']),
                                        worknode_receipt_refs=list(native['worknode_receipt_refs']),
                                        unresolved_risk_refs=[], final_certifier_decision='certified'),
                           expected_goal_run_revision=result['input']['expected_goal_run_revision'],
                           goal_run_revision=result['input']['goal_run_revision'],
                           idempotency_key=result['idempotency_key'])
            event = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
                         event_id=result['event_id'], event_type='goal_run.certified', project_id=goal['project_id'],
                         thread_id=goal['thread_id'], run_id=scope['goal_run_id'], node_id=None, attempt_id=None,
                         actor_ref=asg['actor_ref'], requested_account_ref=inv['requested_account_ref'],
                         effective_account_ref=inv['effective_account_ref'], occurred_at_utc=native['decided_at_utc'],
                         producer_sequence_id=None, correlation_id=inv['correlation_id'],
                         causation_event_id=cause['causation_event_id'], parent_event_id=None,
                         idempotency_key=result['idempotency_key'], payload_schema_id=PAYLOAD, payload=payload,
                         payload_ref=None, redaction_profile='no_secrets', replay_policy=result['replay_policy'],
                         migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None,
                                        migration_id=None, compatibility_event_type=None))
            if candidate_edit:
                event = candidate_edit(event)
            self.check(world, event, result, src, standard)
            slot.set(event)
            return event

    def check(self, world, event, result, src, standard):
        """Whole producer predicates over the prepared candidate."""
        A.require('producer/envelope_members', set(event) <= set(ENVELOPE_FIELDS))
        for field in ENVELOPE_FIELDS:
            A.require('producer/required_present/' + field, field in event)
        payload = event['payload']
        A.require('producer/payload_type', type(payload) is dict)
        world.bank.validate(PAYLOAD, payload, 'producer/payload')
        for field in ('goal_revision', 'expected_goal_run_revision', 'goal_run_revision'):
            NR.integer(payload[field], 'producer/payload.' + field, minimum=1)
        NR.event_time(event['occurred_at_utc'], 'producer/occurred_at_utc')
        NR.event_time(payload['occurred_at_utc'], 'producer/payload.occurred_at_utc')
        native, goal, inv, asg, cause = src['native'], src['goal'], src['invocation'], src['assignment'], src['causality']
        expected = {
            'event_id': result['event_id'], 'idempotency_key': result['idempotency_key'],
            'replay_policy': 'dedupe_by_idempotency_key', 'event_type': 'goal_run.certified', 'scope_kind': 'project',
            'payload_schema_id': PAYLOAD, 'project_id': goal['project_id'], 'thread_id': goal['thread_id'],
            'run_id': native['goal_run_id'], 'actor_ref': asg['actor_ref'],
            'requested_account_ref': inv['requested_account_ref'], 'effective_account_ref': inv['effective_account_ref'],
            'occurred_at_utc': native['decided_at_utc'], 'correlation_id': inv['correlation_id'],
            'causation_event_id': cause['causation_event_id'], 'payload_ref': None, 'node_id': None,
            'attempt_id': None, 'parent_event_id': None, 'producer_sequence_id': None,
            'payload.project_id': goal['project_id'], 'payload.goal_id': goal['goal_id'],
            'payload.goal_revision': goal['goal_revision'], 'payload.thread_id': goal['thread_id'],
            'payload.actor_ref': asg['actor_ref'], 'payload.execution_role': asg['execution_role'],
            'payload.occurred_at_utc': native['decided_at_utc'], 'payload.correlation_id': inv['correlation_id'],
            'payload.causation_event_ref': cause['causation_event_id'],
            'payload.requested_provider_ref': inv['requested_provider_ref'],
            'payload.effective_provider_ref': inv['effective_provider_ref'],
            'payload.requested_model_ref': inv['requested_model_ref'],
            'payload.effective_model_ref': inv['effective_model_ref'],
            'payload.requested_account_ref': inv['requested_account_ref'],
            'payload.effective_account_ref': inv['effective_account_ref'],
            'payload.idempotency_key': result['idempotency_key'],
            'payload.expected_goal_run_revision': result['input']['expected_goal_run_revision'],
            'payload.goal_run_revision': result['input']['goal_run_revision'],
            'payload.payload.goal_run_id': native['goal_run_id'],
            'payload.payload.certification_receipt_ref': standard['receipt_ref'],
            'payload.payload.final_certifier_decision': native['final_certifier_decision'],
            'payload.payload.validator_outputs': native['validator_outputs'],
            'payload.payload.worknode_receipt_refs': native['worknode_receipt_refs'],
            'payload.evidence_refs': native['evidence_refs'], 'payload.artifact_refs': native['artifact_refs'],
        }
        for path, value in expected.items():
            actual = event
            for part in path.split('.'):
                actual = actual.get(part, KeyError) if type(actual) is dict else KeyError
            A.require('producer/field/' + path, actual is not KeyError and A.same(actual, value))
        A.require('producer/inner_outer_key_bytes', event['idempotency_key'].encode('utf-8') ==
                  payload['idempotency_key'].encode('utf-8'))
        # protocol.md:19: a permitted value the original Event codec or the
        # CV-1029 RFC 8785 digest cannot represent losslessly fails
        # codec_unavailable; nothing is rounded or re-domained.
        try:
            NR.event_value_bytes(event, 'producer/codec')
            NR.producer_digest(event, 'producer/semantic_digest')
        except NR.NumruleRefusal as error:
            raise A.AdapterRefusal('producer/codec_unavailable') from error


class World:
    """One TEST_ONLY execution: Storage, registry, recorder and every owner."""

    def __init__(self, work, *, identity_formula='certified_v3', other_storage=False):
        self.work = Path(work)
        self.bank = bank()
        self.registry = A.OwnerRegistry()
        self.recorder = self.registry.recorder
        self.storage = S.TestOwnerStorage.create(self.work / 'storage')
        self.recorder.observe('storage:' + self.storage.storage_instance_id, self.storage.observe)
        self.sources = A.SourceOwner(self.registry, bank=self.bank)
        self.assignment = type('AssignmentOwner', (A.TestOwner,), {'role': 'assignment'})(self.registry)
        self.invocation = type('InvocationOwner', (A.TestOwner,), {'role': 'invocation'})(self.registry)
        self.causality = type('CausalityOwner', (A.TestOwner,), {'role': 'causality'})(self.registry)
        self.native = type('NativeOwner', (A.TestOwner,), {'role': 'native'})(self.registry)
        self.goal = type('GoalOwner', (A.TestOwner,), {'role': 'goal'})(self.registry)
        self.descriptor = type('DescriptorOwner', (A.TestOwner,), {'role': 'descriptor'})(self.registry)
        partition_storage = S.TestOwnerStorage.create(self.work / 'other-storage') if other_storage else self.storage
        self.partition = StoragePartitionOwner(self.registry, partition_storage, bank=self.bank)
        self.standard = StandardOwner(self.registry, self.storage)
        self.identity = IdentityOwner(self.registry, self.storage, formula=identity_formula)
        self.producer = Producer(self.registry)
        self.appender = A.AppendOwner(self.registry, self.storage)


def default_values(before=6):
    run = 'TEST_ONLY:goal_run:α-é-🦊'
    return dict(
        project='TEST_ONLY-project-β́', run=run, before=before,
        assignment=dict(qualification=QUALIFICATION, assignment_id='TEST_ONLY:assignment:1', goal_run_id=run,
                        actor_ref='TEST_ONLY:actor:certifier', execution_role='verifier'),
        invocation=dict(qualification=QUALIFICATION, operation_id='TEST_ONLY:invocation:1',
                        assignment_id='TEST_ONLY:assignment:1', requested_provider_ref='TEST_ONLY:provider:a',
                        effective_provider_ref='TEST_ONLY:provider:a', requested_model_ref='TEST_ONLY:model:a',
                        effective_model_ref='TEST_ONLY:model:a-2026', requested_account_ref='TEST_ONLY:account:1',
                        effective_account_ref='TEST_ONLY:account:1', correlation_id='TEST_ONLY:correlation:cf01'),
        native=dict(qualification=QUALIFICATION, goal_run_id=run, goal_id='TEST_ONLY:goal:1',
                    project_id='TEST_ONLY-project-β́', work_graph_id='TEST_ONLY:work_graph:1',
                    status='verifying', revision=before, final_certifier_decision='certified',
                    decided_at_utc='2026-11-11T12:00:00.250+01:00',
                    validator_outputs=[dict(validator_id='TEST_ONLY:validator:1', outcome='passed',
                                            evidence_ref='TEST_ONLY:evidence:1')],
                    worknode_receipt_refs=['TEST_ONLY:worknode-receipt:1'], evidence_refs=['TEST_ONLY:evidence:1'],
                    artifact_refs=[]),
        goal=dict(qualification=QUALIFICATION, goal_id='TEST_ONLY:goal:1', project_id='TEST_ONLY-project-β́',
                  goal_revision=3, thread_id='TEST_ONLY:thread:1'),
        descriptor=dict(qualification=QUALIFICATION, recipe_id=RECIPE['recipe_id'],
                        profile_sha256=(ROOT / 'Plans/goal_certified_event_coordinator_contracts/'
                                        'installed-profile-digest.txt').read_text().strip()))


def cause_event(world, values):
    c = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
             event_id='TEST_ONLY:goal_test.cause:cf01', event_type='goal_test.cause', project_id=values['project'],
             thread_id=None, run_id=values['run'], node_id=None, attempt_id=None, actor_ref='TEST_ONLY:actor:cause',
             requested_account_ref=None, effective_account_ref=None, occurred_at_utc='2026-11-11T11:59:00Z',
             producer_sequence_id=None, correlation_id='TEST_ONLY:correlation:cause', causation_event_id=None,
             parent_event_id=None, idempotency_key='TEST_ONLY:cause:cf01', payload_schema_id='TEST_ONLY:cause.v1',
             payload=dict(qualification=QUALIFICATION), payload_ref=None, redaction_profile='no_secrets',
             replay_policy='dedupe_by_idempotency_key',
             migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                            compatibility_event_type=None))
    events, _, _ = world.appender.append_original('TEST_ONLY:operation:cause', dict(kind='cause'), [c])
    return world.appender.event(events[0])['event_id']


def run_path(work, *, values=None, source_edit=None, input_edit=None, candidate_edit=None, handle_edit=None,
             identity_formula='certified_v3', other_storage=False, unregistered=None, drop_descriptor=False,
             partition_recipe='base64url', identity_wrapper=None, standard_decision='certified'):
    """One complete original path; returns observations or raises the refusal."""
    values = values or default_values()
    if source_edit:
        values = source_edit(copy.deepcopy(values))
    world = World(work, identity_formula=identity_formula, other_storage=other_storage)
    w = world
    h = {}
    h['assignment'] = (w.assignment.owner_id, w.assignment.issue(None, values['assignment'], kind='assignment'))
    h['invocation'] = (w.invocation.owner_id, w.invocation.issue(None, values['invocation'], kind='invocation'))
    cause_id = cause_event(w, values)
    h['causality'] = (w.causality.owner_id, w.causality.issue(None, dict(qualification=QUALIFICATION,
                                                                         causation_event_id=cause_id), kind='cause'))
    h['native'] = (w.native.owner_id, w.native.issue(None, values['native'], kind='native_certification_source'))
    h['standard'] = (w.standard.owner_id, w.standard.capture(values['run'], standard_decision))
    h['goal'] = (w.goal.owner_id, w.goal.issue(None, values['goal'], kind='current_goal'))
    h['storage_partition'] = (w.partition.owner_id, w.partition.register_route(values['project'], partition_recipe))
    if not drop_descriptor:
        h['descriptor'] = (w.descriptor.owner_id, w.descriptor.issue(None, values['descriptor'], kind='descriptor'))
    if unregistered:
        rogue = type('Rogue', (A.TestOwner,), {'role': unregistered})(A.OwnerRegistry())
        h[unregistered] = (rogue.owner_id, rogue.issue(None, values[unregistered], kind=unregistered))
    if handle_edit:
        h = handle_edit(w, h)
    identity_handles = {k: v for k, v in h.items() if k != 'causality'}
    identity = (w.identity.owner_id, w.identity.derive_original_identity(w, identity_handles, input_edit))
    if identity_wrapper:
        identity = identity_wrapper(w, identity)
    event = w.producer.prepare(w, identity, h, candidate_edit)
    request = dict(kind='TEST_ONLY:goal_run.certified.append', event_id=event['event_id'])
    events, reservation, outcome = w.appender.append_original('TEST_ONLY:operation:certified', request, [event])
    stored = w.appender.event(events[0])
    receipt = w.appender.first_receipt(events[0])
    return dict(world=world, event=event, stored=stored, receipt=receipt, outcome=outcome, request=request,
                identity=w.identity.resolve(identity[1])[1], handles=h)


def check_positive(obs):
    w, event, stored, receipt = obs['world'], obs['event'], obs['stored'], obs['receipt']
    A.require('positive/stored_producer25', S.producer25(stored) == event)
    A.require('positive/storage_assigned', all(k in stored for k in S.STORAGE_FIELDS))
    A.require('positive/first_receipt_sequence', receipt['first_append_receipt']['sequence_id'] == stored['sequence_id'])
    A.require('positive/custody_producer_digest', receipt['producer_semantic_digest'] == NR.producer_digest(event))
    A.require('positive/custody_commitment', receipt['original_event_value_commitment']['sha256'] ==
              NR.full_value_commitment(stored))
    A.require('positive/custody_scope_partition', receipt['scope_partition'] ==
              obs['identity']['input']['scope']['scope_partition'])
    A.require('positive/key_bytes', stored['idempotency_key'].encode() == stored['payload']['idempotency_key'].encode())
    A.require('positive/unicode_not_normalized', stored['run_id'] != unicodedata.normalize('NFC', stored['run_id']))
    order = [m for _, m in w.recorder.sequence(True)]
    A.require('positive/identity_before_producer', order.index('derive_original_identity') < order.index('prepare_producer'))
    A.require('positive/standard_before_identity', w.storage.cell('TEST_ONLY:standard_receipt',
              'TEST_ONLY:standard:' + S.k_component(obs['identity']['input']['scope']['goal_run_id'])) is not None)
    # Lost acknowledgement: same operation, no durable change at all.
    generation = (w.storage.manifest_generation, w.storage.commit_generation)
    events_, _, outcome = w.appender.append_original('TEST_ONLY:operation:certified', obs['request'], [copy.deepcopy(event)])
    A.require('retry/lost_ack_status', outcome['status'] == 'already_appended')
    A.require('retry/lost_ack_no_durable_change', (w.storage.manifest_generation, w.storage.commit_generation) == generation)
    A.require('retry/lost_ack_same_receipt', w.appender.first_receipt(events_[0]) == receipt)
    # Equal retry under a new operation: dedupe, same first receipt, no second Event.
    count = len(w.storage.events)
    events_, _, outcome = w.appender.append_original('TEST_ONLY:operation:certified-retry', obs['request'],
                                                     [copy.deepcopy(event)])
    A.require('retry/dedupe_status', outcome['status'] == 'dedupe')
    A.require('retry/no_second_event', len(w.storage.events) == count)
    A.require('retry/same_first_receipt', w.appender.first_receipt(events_[0]) == receipt)
    return dict(event_id=stored['event_id'], sequence_id=stored['sequence_id'],
                recorder=[m for _, m in w.recorder.sequence(True)])


def edit_path(path, value):
    def run(event):
        target = event
        parts = path.split('.')
        for p in parts[:-1]:
            target = target[p]
        if value is DELETE:
            del target[parts[-1]]
        else:
            target[parts[-1]] = value
        return event
    return run


DELETE = object()


def both(*edits):
    def run(v):
        for e in edits:
            v = e(v)
        return v
    return run


def negatives():
    """(id, kwargs, expected refusal). Each changes one fact at one boundary."""
    out = []
    add = lambda i, kw, code: out.append((i, kw, code))  # noqa: E731
    # Number domain and revision text.
    for name, value in (('string', '6'), ('float', 6.0), ('bool', True)):
        add('revision_as_%s' % name, dict(input_edit=lambda i, v=value: dict(i, expected_goal_run_revision=v,
                                                                          goal_run_revision=7)),
            'identity/expected_goal_run_revision/numrule/integer_type')
    add('revision_step_not_plus_one', dict(input_edit=lambda i: dict(i, goal_run_revision=i['goal_run_revision'] + 1)),
        'identity/revision_step')
    add('revision_after_uint64_codec_unavailable', dict(values=default_values(before=(1 << 64) - 1)),
        'producer/codec_unavailable')
    add('revision_after_2p53_plus_1_jcs_unavailable', dict(values=default_values(before=(1 << 53))),
        'producer/codec_unavailable')
    add('decision_with_exception', dict(input_edit=lambda i: dict(i, final_certifier_decision='certified_with_approved_exception')),
        'identity/decision')
    add('identity_input_extra_member', dict(input_edit=lambda i: dict(i, extension='x')),
        'identity/input/schema/')
    # Substituted Start identity formula.
    add('start_identity_formula', dict(identity_formula='start_formula'), 'identity/independent_event_id')
    # Partition and sources.
    add('partition_other_storage', dict(other_storage=True), 'identity/partition_storage')
    add('partition_caller_supplied',
        dict(handle_edit=lambda w, h: dict(h, storage_partition=(w.partition.owner_id, dict(scope_partition='project~x')))),
        'original/handle_type')
    add('assignment_unregistered_owner', dict(unregistered='assignment'), 'registry/unregistered_owner')
    add('invocation_foreign_assignment', dict(source_edit=lambda v: (v['invocation'].update(
        assignment_id='TEST_ONLY:assignment:other'), v)[1]), 'identity/invocation_assignment')
    add('standard_other_run', dict(handle_edit=lambda w, h: dict(h, standard=(
        w.standard.owner_id, w.standard.capture('TEST_ONLY:goal_run:other', 'certified')))), 'identity/standard_run')
    add('descriptor_absent', dict(drop_descriptor=True), 'identity/descriptor_unavailable')
    # Candidate fields: one source-mapped field, every mirror coherent.
    add('changed_actor', dict(candidate_edit=both(edit_path('actor_ref', 'TEST_ONLY:actor:other'),
                                                  edit_path('payload.actor_ref', 'TEST_ONLY:actor:other'))),
        'producer/field/actor_ref')
    add('changed_time', dict(candidate_edit=both(edit_path('occurred_at_utc', '2026-11-11T11:00:00.250Z'),
                                                 edit_path('payload.occurred_at_utc', '2026-11-11T11:00:00.250Z'))),
        'producer/field/occurred_at_utc')
    add('changed_cause', dict(candidate_edit=both(edit_path('causation_event_id', 'TEST_ONLY:event:other'),
                                                  edit_path('payload.causation_event_ref', 'TEST_ONLY:event:other'))),
        'producer/field/causation_event_id')
    add('changed_event_id', dict(candidate_edit=edit_path('event_id', 'goal_run.certified.v3:' + '0' * 64)),
        'producer/field/event_id')
    add('changed_effective_runtime', dict(candidate_edit=edit_path('payload.effective_model_ref', 'TEST_ONLY:model:b')),
        'producer/field/payload.effective_model_ref')
    add('normalized_goal_run_id', dict(candidate_edit=both(
        edit_path('run_id', unicodedata.normalize('NFC', 'TEST_ONLY:goal_run:α-é-🦊')),
        edit_path('payload.payload.goal_run_id', unicodedata.normalize('NFC', 'TEST_ONLY:goal_run:α-é-🦊')))),
        'producer/field/run_id')
    add('missing_nullable_payload_ref', dict(candidate_edit=edit_path('payload_ref', DELETE)),
        'producer/required_present/payload_ref')
    add('missing_nullable_node_id', dict(candidate_edit=edit_path('node_id', DELETE)),
        'producer/required_present/node_id')
    add('envelope_extra_member', dict(candidate_edit=edit_path('extension', 1)), 'producer/envelope_members')
    add('payload_extra_member', dict(candidate_edit=edit_path('payload.extension', 1)), 'producer/payload/schema/')
    # batch 2: the payload carrier must be an object before any field is read (FIX-ROUND check 11)
    add('payload_not_object', dict(candidate_edit=lambda e: dict(e, payload=[e['payload']])), 'producer/payload_type')
    add('inner_key_alternate', dict(candidate_edit=edit_path('payload.idempotency_key', 'goal_run.certified.v3:x')),
        'producer/field/payload.idempotency_key')
    add('replay_only_policy', dict(candidate_edit=edit_path('replay_policy', 'projector_replay_only')),
        'producer/field/replay_policy')
    add('revision_float_in_payload', dict(candidate_edit=edit_path('payload.goal_run_revision', 7.0)),
        'producer/payload.goal_run_revision/numrule/integer_type')
    add('partial_payload_witness', dict(candidate_edit=edit_path('payload.payload', dict(goal_run_id='x'))),
        'producer/payload/schema/payload')
    # Identity joins over the independently issued sources.
    add('goal_project_differs', dict(source_edit=lambda v: (v['goal'].update(project_id='TEST_ONLY-project-γ'), v)[1]),
        'identity/project')
    add('native_goal_differs', dict(source_edit=lambda v: (v['native'].update(goal_id='TEST_ONLY:goal:2'), v)[1]),
        'identity/goal')
    add('assignment_other_run', dict(source_edit=lambda v: (v['assignment'].update(
        goal_run_id='TEST_ONLY:goal_run:other'), v)[1]), 'identity/assignment_run')
    add('standard_receipt_not_durable', dict(handle_edit=lambda w, h: (w.storage.transact([dict(
        table='TEST_ONLY:standard_receipt', key='TEST_ONLY:standard:' + S.k_component(default_values()['run']),
        expected=1, delete=True)]), h)[1]), 'identity/standard_durable')
    add('standard_exception_decision', dict(standard_decision='certified_with_approved_exception'),
        'identity/standard_decision')
    add('partition_lower_hex_recipe', dict(partition_recipe='lower_hex'), 'identity/partition_recomputed')
    add('unprefixed_identity_key', dict(identity_formula='unprefixed_key'), 'identity/independent_key')
    add('cause_not_appended', dict(handle_edit=lambda w, h: dict(h, causality=(w.causality.owner_id, w.causality.issue(
        None, dict(qualification=QUALIFICATION, causation_event_id='TEST_ONLY:event:never-appended'), kind='cause')))),
        'read/event_unavailable')
    add('identity_candidate_not_issued', dict(identity_wrapper=lambda w, i: w.identity.resolve(i[1])[1]),
        'producer/identity_handle')
    add('identity_from_other_owner', dict(identity_wrapper=lambda w, i: (
        IdentityOwner(w.registry, w.storage).owner_id, i[1])), 'original/issuer')
    return out


def run(output=None):
    work = Path(tempfile.mkdtemp(prefix='pm-goal-test-cf01-'))
    cases = []
    try:
        for name, kw in (('positive_unicode_path', {}),
                         ('positive_jcs_boundary_2p53', dict(values=default_values(before=(1 << 53) - 1)))):
            try:
                obs = run_path(work / name, **kw)
                detail = check_positive(obs)
                cases.append(dict(id=name, kind='positive', status='pass', detail=detail,
                                  recorder=obs['world'].recorder.export() if name == 'positive_unicode_path' else None))
            except Exception as error:  # noqa: BLE001
                cases.append(dict(id=name, kind='positive', status='fail', error='%s: %s' % (type(error).__name__, error)))

        def altered_retry():
            obs = run_path(work / 'altered_retry')
            altered = dict(copy.deepcopy(obs['event']), actor_ref='TEST_ONLY:actor:other')
            obs['world'].appender.append_original('TEST_ONLY:operation:certified-altered', obs['request'], [altered])
        for name, kw, expected in negatives() + [('retry_altered_producer', None, 'append/conflict/producer25')]:
            try:
                if kw is None:
                    altered_retry()
                else:
                    run_path(work / name, **kw)
                cases.append(dict(id=name, kind='negative', expected=expected, got='ACCEPTED', status='fail'))
            except (A.AdapterRefusal, S.StorageRefusal, NR.NumruleRefusal) as error:
                got = A.refusal_code(error)
                ok = got == expected or (expected.endswith('*') and got.startswith(expected[:-1]))
                cases.append(dict(id=name, kind='negative', expected=expected, got=got, status='pass' if ok else 'fail'))
            except Exception as error:  # noqa: BLE001
                cases.append(dict(id=name, kind='negative', expected=expected,
                                  got='%s: %s' % (type(error).__name__, error), status='fail'))
    finally:
        shutil.rmtree(work, ignore_errors=True)
    failures = [c for c in cases if c['status'] != 'pass']
    result = dict(qualification=QUALIFICATION, native=NR.NATIVE_LINE, group='CF-01', family='goal_run.certified',
                  positives=sum(c['kind'] == 'positive' for c in cases),
                  negatives=sum(c['kind'] == 'negative' for c in cases), cases=cases,
                  status='pass' if not failures else 'fail', failures=failures)
    if output:
        Path(output).write_text(json.dumps(result, indent=2, sort_keys=True, ensure_ascii=False) + '\n')
    return result


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--output')
    a = p.parse_args()
    result = run(a.output)
    print(json.dumps(dict(status=result['status'], positives=result['positives'], negatives=result['negatives'],
                          failures=[(f['id'], f.get('expected'), f.get('got') or f.get('error'))
                                    for f in result['failures']]), indent=1, ensure_ascii=False))
    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
