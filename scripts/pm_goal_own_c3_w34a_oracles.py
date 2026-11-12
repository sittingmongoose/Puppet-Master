#!/usr/bin/env python3
"""W3 whole retained-tuple relation corpus against the selected reference successor.

These are TEST_ONLY semantic witnesses, not original Start issuance or a complete
W3 qualification. The default exit is 2 while the explicitly listed whole-path
obligations remain open. --component-only checks this bounded corpus alone.
No original resource, codec, native participant or guard-proof engine is replaced.
"""
from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import json
from pathlib import Path

from pm_goal_own_c_oracles import ROOT, Refusal, equal, require
from pm_goal_oracle_common import canonical, semantic_digest
from pm_goal_own_c3_w34_oracles import specimen
from pm_goal_own_c3_w34_reference_oracles import (
    select_bank, original_codec, commitment, Representation,
)

URI = 'https://puppetmaster.local/proposals/goal_run_started_consumer.v1.schema.json'
START = 'https://puppetmaster.local/proposals/workflow_start_original_custody.v2.schema.json'
D01 = 'https://puppetmaster.local/proposals/executor_workflow_original_start.v2.schema.json'
STORE = '12345678-1234-1234-1234-123456789abc'
TIME = '2026-11-05T12:00:00Z'

REMAINING = [
    'Original before-birth installed descriptor and all original Start/Goal argument '
    'sources, original producer/native/D01 transaction, publication, first group '
    'custody, equal retry/conflict and factual recovery.',
    'Separate native-v7 complete source-method dispatch and original arguments.',
    'Actual SP-278 CURRENT/manifest/segment frames, full index, retention gaps and '
    'first custody before off-run filtering; supported reducer and all nine token fields.',
    'Whole independently acquired CurrentStartSource and separate CurrentGoalArgument; '
    'all independently callable lower/passive/outer entry and final predicates.',
    'Whole actual source/root/frontier CAS, row/checkpoint transaction, crash/retry, '
    'isolated staging/cutover and SP-424 withdrawal/reinstallation.',
    'Full original-path inline/Event-reference/metadata-reference/checkpoint-spill '
    'specimens. Relation witnesses and inherited representation specimens do not close these.',
]


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def h(value):
    return value.encode('utf-8').hex()


def seed(bank, uri, name):
    resolved = bank.registry.resolver().lookup(uri + '#/$defs/' + name)
    return specimen([(resolved.contents, resolved.resolver)])


def at(value, path):
    for key in path:
        value = value[key]
    return value


def put(value, path, replacement):
    target = at(value, path[:-1])
    target[path[-1]] = copy.deepcopy(replacement)


class TupleWitness:
    """Complete eight-object retained tuple with topological selector rebinding.

    The source is explicitly an authored relation witness. Immutable issuance,
    original source acquisition and native installation are not inferred from it.
    A mutation is applied before dependent selectors are computed, so changing a
    leaf never accidentally leaves a stale downstream whole-value hash.
    """
    def __init__(self, bank, codec, edits=(), project='project-α', actor='person:1'):
        self.bank, self.codec = bank, codec
        self.scope = dict(storage_instance_id=STORE, project_id=project,
                          goal_id='goal:1', goal_run_id='run:1')
        self.owner = dict(owner_ref='workflow:owner:1', owner_epoch=3,
                          server_id='server:1', server_claim_epoch=4)
        self.op, self.tx, self.cause = 'start:1', 'start-transaction:1', 'accepted:start:1'
        self.r = ':'.join(h(self.scope[k]) for k in
                          ('storage_instance_id', 'project_id', 'goal_id', 'goal_run_id'))
        self.edits = list(edits)
        self.values, self.keys = {}, {}
        self.build(actor)

    def finish(self, name, value):
        value = copy.deepcopy(value)
        for target, path, replacement in self.edits:
            if target == name:
                put(value, path, replacement)
        self.values[name] = value
        return value

    def key(self, name):
        return self.keys.get(name, 'TEST_ONLY:historical-selection:' + self.r + ':' + name)

    def selector(self, name, family=None):
        value = self.values[name]
        return dict(storage_instance_id=STORE, family_id=family or {
            'candidate': 'workflow_start_candidate', 'commit': 'workflow_start_commit',
            'control': 'workflow_start_control', 'origin': 'workflow_start_origin',
            'initial_control': 'workflow_start_control',
            'original_d01_update': 'executor_workflow_workflow_update',
            'original_d01_origin': 'executor_workflow_lineage_origin',
            'original_d01_head': 'executor_workflow_workflow_head',
        }.get(name, name), physical_key=self.key(name),
            schema_id=value['schema_id'], schema_version=value['schema_version'],
            physical_value_sha256=sha(self.codec.pack(value)))

    def build(self, actor):
        template = seed(self.bank, URI, 'RetainedNativeStart')
        for name, value in template.items():
            if name in ('candidate', 'commit', 'origin'):
                prefix = {'candidate': 'workflow_start_candidate.v2',
                          'commit': 'workflow_start_commit.v1',
                          'origin': 'workflow_start_origin.v2'}[name]
                self.keys[name] = prefix + ':' + self.r + ':' + h(self.op)
            elif name == 'control':
                self.keys[name] = 'workflow_start_control.v1:' + self.r
            else:
                self.keys[name] = value['schema_id'].split('.')[-2] + ':' + self.r + ':' + h(self.op)
            if 'storage_instance_id' in value:
                value['storage_instance_id'] = STORE
            if 'physical_key' in value:
                value['physical_key'] = self.keys[name]
            record = value['record']
            if 'scope' in record:
                record['scope'] = copy.deepcopy(self.scope)
            if 'owner' in record:
                record['owner'] = copy.deepcopy(self.owner)
            for key, replacement in [('operation_id', self.op), ('transaction_id', self.tx),
                                     ('issued_at_utc', TIME)]:
                if key in record:
                    record[key] = replacement
        # Historical body commitments deliberately do not resolve an old body.
        before = seed(self.bank, D01, 'BodyIssuanceCommitment')
        before.update(body_revision=7, activation_revision=11, status='ready',
                      activation_state='start_event_pending',
                      workflow_owner_ref=self.owner['owner_ref'],
                      workflow_owner_epoch=self.owner['owner_epoch'])
        before['identity'].update(project_id=self.scope['project_id'], goal_id=self.scope['goal_id'],
                                  goal_run_id=self.scope['goal_run_id'])
        for key in ('body', 'control'):
            before[key].update(storage_instance_id=STORE,
                               physical_key='historical:' + key + ':' + self.r + ':7')
            before[key]['physical_value_sha256'] = sha(self.codec.pack([key, before['identity'], 7, 11]))
        before = self.finish('before', before)
        after = copy.deepcopy(before)
        after.update(body_revision=8, activation_revision=12, status='running', activation_state='active')
        for key in ('body', 'control'):
            after[key]['physical_key'] = 'historical:' + key + ':' + self.r + ':8'
            after[key]['physical_value_sha256'] = sha(self.codec.pack([key, after['identity'], 8, 12]))
        after = self.finish('after', after)

        # A retained selector's contents are not a fresh source argument.
        opaque = copy.deepcopy(before['body'])
        opaque.update(family_id='TEST_ONLY_historical_dependency', physical_key='historical:dependency')
        goal = seed(self.bank, START, 'GoalContextCommitment')
        for key in ('goal_body', 'goal_control', 'goal_stop', 'binding_revision', 'binding_control'):
            goal[key] = dict(opaque, physical_key='historical:' + key)
        goal['source_argument_sha256'] = sha(self.codec.pack(['TEST_ONLY historical Goal argument']))
        goal = self.finish('goal', goal)

        initial = copy.deepcopy(template['control'])
        initial['record'].update(epoch=0, pending_candidate=None, committed_start=None,
                                 original_operation_id=None)
        self.keys['initial_control'] = self.keys['control']
        initial = self.finish('initial_control', initial)
        initial_origin = template['initial_control_origin']
        initial_origin['record'].update(issuer_method='owner.workflow.activation.begin.v1',
            owner_ref=self.owner['owner_ref'], owner_epoch=self.owner['owner_epoch'],
            original_operation_id='birth:1', original_causation_ref='accepted:birth:1',
            issued_value_key=self.keys['control'], issued_record_sha256=sha(self.codec.pack(initial['record'])))
        for key in ('actual_permission_source', 'actual_stop_source', 'actual_cancellation_source'):
            initial_origin['record'][key] = copy.deepcopy(opaque)
        self.finish('initial_control_origin', initial_origin)

        original = seed(self.bank, START, 'FullOriginalAppend')
        event = original['event']
        event.update(scope_kind='project', project_id=self.scope['project_id'],
            run_id=self.scope['goal_run_id'], event_id='started-event:1',
            thread_id='thread:1', actor_ref=actor, occurred_at_utc=TIME,
            observed_at_utc=TIME, persisted_at_utc=TIME, sequence_id=25,
            correlation_id='correlation:1', causation_event_id=None,
            replay_policy='dedupe_by_idempotency_key')
        payload = event['payload']
        payload.update(project_id=self.scope['project_id'], goal_id=self.scope['goal_id'],
            goal_revision=goal['goal_revision'], actor_ref=actor, occurred_at_utc=TIME,
            correlation_id=event['correlation_id'], expected_goal_run_revision=before['body_revision'],
            goal_run_revision=after['body_revision'])
        payload['payload'].update(goal_run_id=self.scope['goal_run_id'],
                                  workgraph_ref=before['identity']['workgraph_ref'],
                                  activation_receipt_ref='activation:receipt:1')
        for key in ('requested_account_ref', 'effective_account_ref'):
            event[key] = payload[key]
        partition = 'project~' + base64.urlsafe_b64encode(self.scope['project_id'].encode()).decode().rstrip('=')
        body = payload['payload']
        identity = ['pm.goal-runtime-event-idempotency.v3', partition, 'goal_run.started',
            payload['project_id'], payload['goal_id'], payload['goal_revision'],
            payload['expected_goal_run_revision'], payload['goal_run_revision'],
            body['goal_run_id'], body['workgraph_ref'], body['activation_receipt_ref']]
        event['idempotency_key'] = payload['idempotency_key'] = 'pm.goal-runtime-event.v3:' + sha(canonical(identity))
        event = self.finish('event', event)
        # An identity-bearing payload mutation changes the whole derived recipe,
        # even when its intended failure is a different source/payload join.
        # Preserve an explicitly substituted key only for the key-copy witness.
        payload = event['payload']; body = payload['payload']
        identity = ['pm.goal-runtime-event-idempotency.v3', partition, 'goal_run.started',
            payload['project_id'], payload['goal_id'], payload['goal_revision'],
            payload['expected_goal_run_revision'], payload['goal_run_revision'],
            body['goal_run_id'], body['workgraph_ref'], body['activation_receipt_ref']]
        key = 'pm.goal-runtime-event.v3:' + sha(canonical(identity))
        if not any(name=='event' and path==('idempotency_key',) for name,path,_ in self.edits):
            event['idempotency_key'] = key
        if not any(name=='event' and path==('payload','idempotency_key') for name,path,_ in self.edits):
            payload['idempotency_key'] = key
        event_commitment = commitment(self.codec, event)
        receipt = original['first_append_receipt']
        receipt.update(event_id=event['event_id'], sequence_id=event['sequence_id'],
                       segment_name='segment-0.seglog', commit_group_id='group:1',
                       durability_class='barrier', durability_state='synced',
                       durable_end_offset=4096, acknowledged_at_utc=TIME)
        receipt = self.finish('receipt', receipt)
        full = dict(first_append_receipt=copy.deepcopy(receipt), original_segment_ref='original-segment:0',
                    original_event_value_commitment=copy.deepcopy(event_commitment))
        custody = original['exact_custody']
        custody.update(storage_instance_id=STORE, event_id=event['event_id'], scope_partition=partition,
            event_type=event['event_type'], idempotency_key=event['idempotency_key'],
            producer_semantic_digest=semantic_digest(event), first_append_receipt=copy.deepcopy(receipt),
            original_segment_ref=full['original_segment_ref'],
            original_event_value_commitment=copy.deepcopy(event_commitment))
        # This opaque group commitment is an explicit unclosed acquisition edge.
        custody['group_digest'] = sha(self.codec.pack(['TEST_ONLY unresolved first group']))
        original = self.finish('append', dict(event=event, first_append_receipt=receipt,
                                             full_value_result=full, exact_custody=custody))
        event, receipt = original['event'], original['first_append_receipt']
        event_commitment = commitment(self.codec, event)

        candidate = template['candidate']
        candidate['record'].update(before_body=before['body'], before_control=before['control'],
            before_d01_pointer=copy.deepcopy(opaque), before_start_control=self.selector('initial_control'),
            prepared_outbox=dict(opaque, physical_key='prepared:outbox:1'), goal_context=goal,
            producer_semantic_digest=semantic_digest(event),
            actual_source_argument_sha256=sha(self.codec.pack(['TEST_ONLY unresolved Start argument'])),
            candidate_body=after['body'], candidate_control=after['control'])
        candidate = self.finish('candidate', candidate)
        cr = candidate['record']
        commit = template['commit']
        commit['record'].update(candidate=self.selector('candidate'), goal_context=goal,
            prepared_outbox=cr['prepared_outbox'], before_body=before['body'], before_control=before['control'],
            after_body=after['body'], after_control=after['control'], event_id=event['event_id'],
            event_value_commitment=event_commitment, first_append_receipt=receipt,
            producer_semantic_digest=semantic_digest(event), dispatch_released=False,
            transition=dict(activation_id='activation:1', from_state='start_event_pending', to_state='active',
                outbox_ref=cr['prepared_outbox']['physical_key'], causation_ref=self.cause))
        commit = self.finish('commit', commit)
        control = template['control']
        control['record'].update(epoch=1, committed_start=self.selector('commit'),
                                 pending_candidate=None, original_operation_id=self.op)
        self.finish('control', control)
        origin = template['origin']
        origin['record'].update(candidate=self.selector('candidate'), commit=self.selector('commit'),
            native_body=after['body'], native_control=after['control'], start_control=self.selector('control'),
            original_event_value_commitment=event_commitment, first_append_receipt=receipt,
            actual_source_argument_sha256=cr['actual_source_argument_sha256'],
            goal_source_argument_sha256=goal['source_argument_sha256'])
        self.finish('origin', origin)
        update = template['original_d01_update']
        transition = update['record']['transition']
        transition.update(rule='original_workflow_start', before=before, after=after,
            original_writer_method='owner.workflow.activation.commit_start.v2',
            original_owner_result=self.selector('commit'), original_owner_origin=self.selector('origin'))
        update['record'].update(revision=8, previous_head=dict(opaque, physical_key='historical:head:7'),
            before_body=before['body'], before_control=before['control'],
            after_body=after['body'], after_control=after['control'], cause='owner_status',
            original_owner_result=self.selector('commit'), original_owner_origin=self.selector('origin'))
        self.finish('original_d01_update', update)
        head = template['original_d01_head']
        head['record'].update(revision=8, current_body=after['body'], current_control=after['control'],
            last_update=self.selector('original_d01_update'), previous_head=update['record']['previous_head'],
            workflow_owner_ref=self.owner['owner_ref'], workflow_owner_epoch=self.owner['owner_epoch'])
        self.finish('original_d01_head', head)
        d01_origin = template['original_d01_origin']
        pointer_selection = copy.deepcopy(d01_origin['record']['afterimages']['pointer'])
        pointer_selection.update(storage_instance_id=STORE, physical_key='historical:pointer:8')
        d01_origin['record'].update(method='owner.executor.workflow_source.update_workflow.v3',
            causation=self.selector('origin'), preimages=[before['body'], before['control']],
            afterimages=dict(workflow_update=self.selector('original_d01_update'),
                             workflow_head=self.selector('original_d01_head'), pointer=pointer_selection))
        self.finish('original_d01_origin', d01_origin)
        self.native = {key: copy.deepcopy(self.values[key]) for key in template}
        self.original = dict(original_append=copy.deepcopy(self.values['append']), native_start=self.native)

    def relations(self):
        """All observations, without guard removal or causal-error collapsing."""
        n, values = self.native, self.values
        c, m, o = (n[key]['record'] for key in ('candidate', 'commit', 'origin'))
        u, d, head = (n[key]['record'] for key in
                     ('original_d01_update', 'original_d01_origin', 'original_d01_head'))
        b, a = u['transition']['before'], u['transition']['after']
        checks = {}
        def eq(name, actual, expected):
            checks[name] = equal(actual, expected)
        for name, value in n.items():
            if 'scope' in value['record']:
                eq('scope/' + name, value['record']['scope'], self.scope)
            if 'storage_instance_id' in value:
                eq('storage/' + name, value['storage_instance_id'], STORE)
            if 'physical_key' in value:
                eq('key/' + name, value['physical_key'], self.key(name))
        for name in ('candidate', 'commit', 'origin', 'original_d01_update', 'original_d01_origin'):
            r = n[name]['record']
            for key, expected in [('operation_id', self.op), ('transaction_id', self.tx)]:
                eq(name + '/' + key, r[key], expected)
            if 'owner' in r:
                eq(name + '/owner', r['owner'], self.owner)
        control = n['control']['record']
        eq('control/commit', control['committed_start'], self.selector('commit'))
        eq('control/no_pending', control['pending_candidate'], None)
        eq('control/original_operation', control['original_operation_id'], self.op)
        eq('control/owner', control['owner'], self.owner)
        eq('candidate/before_start_control', c['before_start_control'], self.selector('initial_control'))
        initial_origin = n['initial_control_origin']['record']
        eq('birth/key', initial_origin['issued_value_key'], self.keys['control'])
        eq('birth/record', initial_origin['issued_record_sha256'], sha(self.codec.pack(values['initial_control']['record'])))
        for prefix, r in [('commit', m), ('origin', o)]:
            eq(prefix + '/candidate', r['candidate'], self.selector('candidate'))
        eq('origin/commit', o['commit'], self.selector('commit'))
        eq('origin/control', o['start_control'], self.selector('control'))
        eq('commit/goal', m['goal_context'], c['goal_context'])
        eq('commit/outbox', m['prepared_outbox'], c['prepared_outbox'])
        eq('origin/source_argument', o['actual_source_argument_sha256'], c['actual_source_argument_sha256'])
        eq('origin/goal_argument', o['goal_source_argument_sha256'], c['goal_context']['source_argument_sha256'])
        for label, actual, expected in [
            ('candidate/before_body', c['before_body'], b['body']),
            ('candidate/before_control', c['before_control'], b['control']),
            ('candidate/after_body', c['candidate_body'], a['body']),
            ('candidate/after_control', c['candidate_control'], a['control']),
            ('commit/before_body', m['before_body'], b['body']),
            ('commit/before_control', m['before_control'], b['control']),
            ('commit/after_body', m['after_body'], a['body']),
            ('commit/after_control', m['after_control'], a['control']),
            ('origin/after_body', o['native_body'], a['body']),
            ('origin/after_control', o['native_control'], a['control']),
            ('d01/result', u['original_owner_result'], self.selector('commit')),
            ('d01/origin', u['original_owner_origin'], self.selector('origin')),
            ('d01/transition_result', u['transition']['original_owner_result'], self.selector('commit')),
            ('d01/transition_origin', u['transition']['original_owner_origin'], self.selector('origin')),
            ('head/body', head['current_body'], a['body']),
            ('head/control', head['current_control'], a['control']),
            ('head/update', head['last_update'], self.selector('original_d01_update')),
            ('d01_origin/update', d['afterimages']['workflow_update'], self.selector('original_d01_update')),
            ('d01_origin/head', d['afterimages']['workflow_head'], self.selector('original_d01_head')),
            ('d01_origin/cause', d['causation'], self.selector('origin')),
        ]:
            eq(label, actual, expected)
        eq('transition/from', m['transition']['from_state'], 'start_event_pending')
        eq('transition/to', m['transition']['to_state'], 'active')
        eq('transition/outbox', m['transition']['outbox_ref'], c['prepared_outbox']['physical_key'])
        eq('transition/cause', m['transition']['causation_ref'], self.cause)
        eq('d01/cause', u['cause'], 'owner_status')
        # The closed rule enum plus each non-Start rule's exact writer predicate
        # and d01/writer below already imply original_workflow_start. Do not add
        # an unreachable independent rule-mutation claim that disables a peer.
        eq('d01/writer', u['transition']['original_writer_method'], 'owner.workflow.activation.commit_start.v2')
        eq('d01_origin/method', d['method'], 'owner.executor.workflow_source.update_workflow.v3')
        eq('native/before_status', b['status'], 'ready')
        eq('native/before_activation', b['activation_state'], 'start_event_pending')
        eq('native/after_status', a['status'], 'running')
        eq('native/after_activation', a['activation_state'], 'active')
        eq('native/body_revision', a['body_revision'], b['body_revision'] + 1)
        eq('native/activation_revision', a['activation_revision'], b['activation_revision'] + 1)
        eq('native/identity', a['identity'], b['identity'])
        for key in ('workflow_owner_ref', 'workflow_owner_epoch'):
            eq('native/' + key, a[key], b[key])
        event = values['append']['event']
        receipt = values['append']['first_append_receipt']
        for prefix, r, field in [('commit', m, 'event_value_commitment'),
                                 ('origin', o, 'original_event_value_commitment')]:
            eq(prefix + '/event_commitment', r[field], commitment(self.codec, event))
            eq(prefix + '/receipt', r['first_append_receipt'], receipt)
        for prefix, r in [('candidate', c), ('commit', m)]:
            eq(prefix + '/semantic_digest', r['producer_semantic_digest'], semantic_digest(event))
        eq('commit/event_id', m['event_id'], event['event_id'])
        payload = event['payload']
        eq('event/project', event['project_id'], self.scope['project_id'])
        eq('event/run', event['run_id'], self.scope['goal_run_id'])
        eq('event/actor', event['actor_ref'], payload['actor_ref'])
        eq('event/time', event['occurred_at_utc'], payload['occurred_at_utc'])
        eq('event/correlation', event['correlation_id'], payload['correlation_id'])
        for key in ('requested_account_ref', 'effective_account_ref'):
            eq('event/' + key, event[key], payload[key])
        eq('payload/project', payload['project_id'], self.scope['project_id'])
        eq('payload/goal', payload['goal_id'], self.scope['goal_id'])
        eq('payload/goal_revision', payload['goal_revision'], c['goal_context']['goal_revision'])
        eq('payload/before_revision', payload['expected_goal_run_revision'], b['body_revision'])
        eq('payload/after_revision', payload['goal_run_revision'], a['body_revision'])
        eq('payload/run', payload['payload']['goal_run_id'], self.scope['goal_run_id'])
        eq('payload/workgraph', payload['payload']['workgraph_ref'], b['identity']['workgraph_ref'])
        eq('event/key_copy', event['idempotency_key'], payload['idempotency_key'])
        append = values['append']
        full, custody = append['full_value_result'], append['exact_custody']
        eq('receipt/event', receipt['event_id'], event['event_id'])
        eq('receipt/sequence', receipt['sequence_id'], event['sequence_id'])
        eq('receipt/durability_class', receipt['durability_class'], 'barrier')
        eq('receipt/durability_state', receipt['durability_state'], 'synced')
        eq('full/receipt', full['first_append_receipt'], receipt)
        eq('full/commitment', full['original_event_value_commitment'], commitment(self.codec, event))
        eq('custody/receipt', custody['first_append_receipt'], receipt)
        eq('custody/commitment', custody['original_event_value_commitment'], commitment(self.codec, event))
        eq('custody/segment', custody['original_segment_ref'], full['original_segment_ref'])
        for key, expected in [('storage_instance_id', STORE), ('event_id', event['event_id']),
            ('event_type', event['event_type']), ('idempotency_key', event['idempotency_key']),
            ('producer_semantic_digest', semantic_digest(event))]:
            eq('custody/' + key, custody[key], expected)
        partition = 'project~' + base64.urlsafe_b64encode(self.scope['project_id'].encode()).decode().rstrip('=')
        eq('custody/partition', custody['scope_partition'], partition)
        return checks

    def validate(self):
        self.bank.validate(URI + '#/$defs/OriginalStarted', self.original)
        for name, valid in self.relations().items():
            require('tuple/' + name, valid)
        return self.projection()

    def projection(self):
        n = self.native
        record = seed(self.bank, URI, 'Projection')
        record.update(scope=self.scope, original_event=self.values['append']['event'],
            native_after_commitment=n['original_d01_update']['record']['transition']['after'],
            captured_goal_context=n['candidate']['record']['goal_context'],
            original_commit=self.selector('commit'), original_origin=self.selector('origin'),
            original_d01_update=self.selector('original_d01_update'),
            original_d01_origin=self.selector('original_d01_origin'),
            original_event_value_commitment=commitment(self.codec, self.values['append']['event']),
            producer_semantic_digest=semantic_digest(self.values['append']['event']),
            first_append_receipt=self.values['append']['first_append_receipt'])
        self.bank.validate(URI + '#/$defs/Projection', record)
        return record

    def missing_member(self, name, path):
        """Schema-seam specimen with every downstream physical hash refreshed."""
        result = copy.deepcopy(self.original)
        del at(result['native_start'][name],path[:-1])[path[-1]]
        # This is the retained DAG's real dependency order. There are no origin
        # self-hashes or source identities manufactured by this rebinding.
        order = ['initial_control_origin','candidate','commit','control','origin',
                 'original_d01_update','original_d01_head','original_d01_origin']
        def replace(value, old, new):
            if isinstance(value,dict):
                if equal(value,old):
                    return copy.deepcopy(new)
                return {key:replace(child,old,new) for key,child in value.items()}
            if isinstance(value,list):
                return [replace(child,old,new) for child in value]
            return value
        for target in order:
            if target=='initial_control_origin':
                continue  # no later selector selects this passive origin
            before = self.selector(target)
            after = dict(before,physical_value_sha256=sha(self.codec.pack(result['native_start'][target])))
            result = replace(result,before,after)
        return result


class Corpus:
    def __init__(self):
        self.rows, self.guards = [], {}
        self.captures = {}

    def case(self, name, run, expected=None):
        observed, detail = 'PASS', None
        try:
            run()
        except Refusal as error:
            observed = str(error)
        except Exception as error:
            observed, detail = 'EXCEPTION', repr(error)
        success = observed == ('PASS' if expected is None else expected)
        self.rows.append(dict(id=name, expected=expected or 'PASS', observed=observed,
                              pass_=success, detail=detail))
        if expected:
            self.guards.setdefault(expected, []).append(name)

    def capture(self, name, root, value):
        self.captures[name] = dict(root=root, value=copy.deepcopy(value))


class TupleRepresentation(Representation):
    """Selected successor codec with the witness's actual scope and physical keys."""
    def encode(self, record, store_payload=True):
        scope = record['scope']
        generation = self.selection['generation_prefix'] + '0'*64
        key = self.selection['projection']['key'].split(':K(')[0] + ':' + ':'.join(
            h(scope[k]) for k in ('project_id', 'goal_run_id'))
        wrapper = dict(schema_id=self.selection['projection']['schema_id'], schema_version='1.0.0',
            storage_instance_id=scope['storage_instance_id'], physical_key=key,
            dataset_name=self.selection['projection']['table'].replace('<generation_id>', generation),
            event_identity=self.identity(record),
            original_event_value_commitment=copy.deepcopy(record['original_event_value_commitment']),
            content=dict(kind='inline', record=copy.deepcopy(record)))
        def reference(raw):
            if store_payload:
                return self.packs.put(raw)
            from blake3 import blake3
            return dict(blake3=blake3(raw).hexdigest(), byte_size=len(raw), media_type='application/msgpack')
        if not self.fits(wrapper):
            metadata = copy.deepcopy(record)
            event = metadata.pop('original_event')
            event_ref = reference(self.codec.pack(event))
            wrapper['content'] = dict(kind='event_reference', metadata=metadata, event_ref=event_ref)
            if not self.fits(wrapper):
                wrapper['content'] = dict(kind='record_reference',
                    metadata_ref=reference(self.codec.pack(metadata)), event_ref=event_ref)
        self.validate('StorageProjection', wrapper)
        require('representation/complete_operation_size', self.fits(wrapper))
        return wrapper

    def read_tuple(self, wrapper, witness):
        record = self.decode(wrapper)
        expected = witness.validate()
        require('representation/tuple', equal(record, expected))
        selected = self.encode(expected, store_payload=False)
        for field in ('storage_instance_id', 'physical_key', 'dataset_name', 'event_identity',
                      'original_event_value_commitment'):
            require('representation/' + field, equal(wrapper[field], selected[field]))
        require('representation/kind', wrapper['content']['kind'] == selected['content']['kind'])
        require('representation/complete_operation_size', self.fits(wrapper))
        return record


def schema_observations(errors):
    result = []
    def visit(error):
        if error.context:
            for child in error.context:
                visit(child)
        else:
            result.append(dict(instance_path=list(error.absolute_path),
                schema_path=list(error.absolute_schema_path), keyword=error.validator))
    for error in errors:
        visit(error)
    return result


def wire_cases(suite, bank, codec, witness):
    """Exercise actual frame bytes through the unchanged hash-pinned codec.

    This does not assert an original durable group or the complete SP-278 source.
    The full actual CURRENT/manifest/retention/generic-root join remains open.
    """
    event = copy.deepcopy(witness.values['event'])
    validate = lambda value: bank.validate(START+'#/$defs/TypedOriginalEvent',value)
    raw = codec.encode(event,0,validate)
    def decode(value, generation=0, last=None, seen=None):
        try:
            return codec.decode(value,0,generation,last,validate,seen=seen)
        except codec.WireError as error:
            raise Refusal('wire/'+str(error)) from error
    suite.case('wire/full_event_roundtrip',lambda:require('wire/whole_value',
        equal(decode(raw).event,event)))
    suite.case('wire/payload_commitment',lambda:require('wire/full_value_commitment',
        commitment(codec,decode(raw).event)==commitment(codec,event)))
    # Different bytes from the actual prefix/header/payload domains, one at a time.
    prefix_size = codec.PREFIX
    header_size = len(codec.pack(codec.header(event)))
    for name, offset, expected in [('prefix_crc',40,'prefix_crc'),
        ('header_crc',prefix_size+1,'header_crc'),
        ('payload_crc',prefix_size+header_size+5,'payload_crc')]:
        altered = bytearray(raw); altered[offset] ^= 1
        suite.case('wire/'+name,lambda value=bytes(altered):decode(value),'wire/'+expected)
    suite.case('wire/foreign_generation',lambda:decode(raw,generation=1),'wire/generation_mismatch')
    suite.case('wire/reordered_sequence',lambda:decode(raw,last=event['sequence_id']),
               'wire/sequence_not_strict')
    suite.case('wire/duplicate_event',lambda:decode(raw,seen={event['event_id']}),'wire/duplicate_event_id')
    for cut, expected in [(8,'prefix_truncated'),(prefix_size+3,'frame_truncated'),
                           (len(raw)-1,'frame_truncated')]:
        suite.case('wire/truncated/'+str(cut),lambda value=raw[:cut]:decode(value),'wire/'+expected)
    # Retained replay-only bytes use the original unchanged wire recipe; the
    # current encoder must refuse that policy before append on every retry.
    retained = copy.deepcopy(event); retained['replay_policy']='projector_replay_only'
    header, payload = codec.pack(codec.header(retained)), codec.pack(retained)
    retained_raw = codec.prefix(2,len(header),len(payload),0,0,retained['sequence_id'],
                                codec.crc(header),codec.crc(payload))+header+payload
    suite.case('wire/retained_replay_only',lambda:require('wire/lawful_retained',
        equal(decode(retained_raw).event,retained)))
    def current_replay():
        try:
            codec.encode(retained,0,validate)
        except codec.WireError as error:
            raise Refusal('wire/'+str(error)) from error
    suite.case('wire/current_replay_only',current_replay,'wire/replay_only_not_appendable')
    suite.case('wire/retry_replay_only',current_replay,'wire/replay_only_not_appendable')
    return dict(frame_bytes=len(raw), frame_sha256=sha(raw),
                whole_event_bytes=len(codec.pack(event)),
                qualification='BOUNDED_WIRE_COMPONENT_NOT_GLOBAL_PREFIX_OR_FIRST_GROUP')


def run_corpus(bank, codec):
    suite = Corpus()
    base = TupleWitness(bank, codec)
    suite.case('whole_retained_tuple', base.validate)
    suite.capture('whole_retained_tuple',URI+'#/$defs/OriginalStarted',base.original)
    suite.case('unicode_project_identity', lambda: TupleWitness(bank, codec, project='项目:α').validate())
    # Every mutation occurs before dependent whole selectors are rebuilt.
    mutations = [
        ('transition/from', 'commit', ('record', 'transition', 'from_state'), 'activation_pending'),
        ('transition/to', 'commit', ('record', 'transition', 'to_state'), 'start_event_pending'),
        ('transition/outbox', 'commit', ('record', 'transition', 'outbox_ref'), 'substituted:outbox'),
        ('transition/cause', 'commit', ('record', 'transition', 'causation_ref'), 'substituted:cause'),
        ('native/before_status', 'before', ('status',), 'blocked'),
        ('native/before_activation', 'before', ('activation_state',), 'activation_pending'),
        ('native/after_status', 'after', ('status',), 'blocked'),
        ('native/after_activation', 'after', ('activation_state',), 'start_event_pending'),
        ('native/body_revision', 'after', ('body_revision',), 9),
        ('native/activation_revision', 'after', ('activation_revision',), 13),
        ('native/identity', 'after', ('identity', 'goal_run_id'), 'foreign:run'),
        ('native/workflow_owner_ref', 'after', ('workflow_owner_ref',), 'foreign:owner'),
        ('native/workflow_owner_epoch', 'after', ('workflow_owner_epoch',), 4),
        ('control/no_pending', 'control', ('record', 'pending_candidate'), base.selector('candidate')),
        ('control/original_operation', 'control', ('record', 'original_operation_id'), 'other:op'),
        ('d01/writer', 'original_d01_update', ('record', 'transition', 'original_writer_method'), 'other:writer'),
        ('head/body', 'original_d01_head', ('record', 'current_body'), base.values['before']['body']),
        ('head/control', 'original_d01_head', ('record', 'current_control'), base.values['before']['control']),
        ('birth/key', 'initial_control_origin', ('record', 'issued_value_key'), 'other:key'),
        ('birth/record', 'initial_control_origin', ('record', 'issued_record_sha256'), 'b'*64),
        ('origin/source_argument', 'origin', ('record', 'actual_source_argument_sha256'), 'b'*64),
        ('origin/goal_argument', 'origin', ('record', 'goal_source_argument_sha256'), 'b'*64),
        ('candidate/semantic_digest', 'candidate', ('record', 'producer_semantic_digest'), 'b'*64),
        ('commit/semantic_digest', 'commit', ('record', 'producer_semantic_digest'), 'b'*64),
        ('commit/event_commitment', 'commit', ('record', 'event_value_commitment', 'sha256'), 'b'*64),
        ('origin/event_commitment', 'origin', ('record', 'original_event_value_commitment', 'sha256'), 'b'*64),
        ('commit/event_id', 'commit', ('record', 'event_id'), 'other:event'),
    ]
    # Per-join substitutions preserve each complete selector's grammar and rebuild
    # every downstream wrapper commitment. Schema negatives are separate below.
    join_mutations = [
        ('control/commit', 'control', 'committed_start'),
        ('commit/candidate', 'commit', 'candidate'),
        ('origin/candidate', 'origin', 'candidate'),
        ('origin/commit', 'origin', 'commit'),
        ('origin/control', 'origin', 'start_control'),
        ('candidate/before_body', 'candidate', 'before_body'),
        ('candidate/before_control', 'candidate', 'before_control'),
        ('candidate/before_start_control', 'candidate', 'before_start_control'),
        ('candidate/after_body', 'candidate', 'candidate_body'),
        ('candidate/after_control', 'candidate', 'candidate_control'),
        ('commit/before_body', 'commit', 'before_body'),
        ('commit/before_control', 'commit', 'before_control'),
        ('commit/after_body', 'commit', 'after_body'),
        ('commit/after_control', 'commit', 'after_control'),
        ('origin/after_body', 'origin', 'native_body'),
        ('origin/after_control', 'origin', 'native_control'),
        ('d01/result', 'original_d01_update', 'original_owner_result'),
        ('d01/origin', 'original_d01_update', 'original_owner_origin'),
        ('head/update', 'original_d01_head', 'last_update'),
        ('d01_origin/cause', 'original_d01_origin', 'causation'),
    ]
    for guard, name, field in join_mutations:
        value = copy.deepcopy(base.native[name]['record'][field])
        value['physical_value_sha256'] = 'b'*64
        mutations.append((guard, name, ('record', field), value))
    for name, wrapper in base.native.items():
        r = wrapper['record']
        if 'scope' in r:
            foreign = dict(base.scope, goal_run_id='foreign:run')
            mutations.append(('scope/'+name, name, ('record','scope'), foreign))
        if 'storage_instance_id' in wrapper:
            mutations.append(('storage/'+name, name, ('storage_instance_id',),
                              '87654321-1234-1234-1234-123456789abc'))
        if 'physical_key' in wrapper:
            mutations.append(('key/'+name, name, ('physical_key',), 'foreign:key'))
        if name in ('candidate','commit','origin','original_d01_update','original_d01_origin'):
            for field in ('operation_id','transaction_id'):
                mutations.append((name+'/'+field, name, ('record',field), 'foreign:operation'))
            if 'owner' in r:
                mutations.append((name+'/owner', name, ('record','owner'), dict(base.owner,owner_epoch=4)))
    mutations += [
        ('control/owner','control',('record','owner'),dict(base.owner,owner_epoch=4)),
        ('commit/goal','commit',('record','goal_context','goal_revision'),2),
        ('commit/outbox','commit',('record','prepared_outbox','physical_value_sha256'),'b'*64),
        ('d01/transition_result','original_d01_update',('record','transition','original_owner_result','physical_value_sha256'),'b'*64),
        ('d01/transition_origin','original_d01_update',('record','transition','original_owner_origin','physical_value_sha256'),'b'*64),
        ('d01_origin/update','original_d01_origin',('record','afterimages','workflow_update','physical_value_sha256'),'b'*64),
        ('d01_origin/head','original_d01_origin',('record','afterimages','workflow_head','physical_value_sha256'),'b'*64),
        ('event/project','event',('project_id',),'foreign:project'),
        ('event/run','event',('run_id',),'foreign:run'),
        ('event/actor','event',('actor_ref',),'foreign:actor'),
        ('event/time','event',('occurred_at_utc',),'2026-11-05T12:00:01Z'),
        ('event/correlation','event',('correlation_id',),'foreign:correlation'),
        ('event/requested_account_ref','event',('requested_account_ref',),'foreign:account'),
        ('event/effective_account_ref','event',('effective_account_ref',),'foreign:account'),
        ('payload/project','event',('payload','project_id'),'foreign:project'),
        ('payload/goal','event',('payload','goal_id'),'foreign:goal'),
        ('payload/goal_revision','event',('payload','goal_revision'),2),
        ('payload/before_revision','event',('payload','expected_goal_run_revision'),8),
        ('payload/after_revision','event',('payload','goal_run_revision'),9),
        ('payload/run','event',('payload','payload','goal_run_id'),'foreign:run'),
        ('payload/workgraph','event',('payload','payload','workgraph_ref'),'foreign:workgraph'),
        ('event/key_copy','event',('idempotency_key',),'other:key'),
        ('full/receipt','append',('full_value_result','first_append_receipt','event_id'),'foreign:event'),
        ('full/commitment','append',('full_value_result','original_event_value_commitment','sha256'),'b'*64),
        ('custody/receipt','append',('exact_custody','first_append_receipt','event_id'),'foreign:event'),
        ('custody/commitment','append',('exact_custody','original_event_value_commitment','sha256'),'b'*64),
        ('custody/segment','append',('exact_custody','original_segment_ref'),'foreign:segment'),
        ('custody/storage_instance_id','append',('exact_custody','storage_instance_id'),'foreign:storage'),
        ('custody/event_id','append',('exact_custody','event_id'),'foreign:event'),
        ('custody/event_type','append',('exact_custody','event_type'),'goal_run.cancelled'),
        ('custody/idempotency_key','append',('exact_custody','idempotency_key'),'other:key'),
        ('custody/producer_semantic_digest','append',('exact_custody','producer_semantic_digest'),'b'*64),
        ('custody/partition','append',('exact_custody','scope_partition'),'project~foreign'),
        ('receipt/event','receipt',('event_id',),'foreign:event'),
        ('receipt/sequence','receipt',('sequence_id',),26),
        ('commit/receipt','commit',('record','first_append_receipt','acknowledged_at_utc'),'2026-11-05T12:01:00Z'),
        ('origin/receipt','origin',('record','first_append_receipt','acknowledged_at_utc'),'2026-11-05T12:01:00Z'),
    ]
    other_origin = copy.deepcopy(base.native['original_d01_origin']['record'])
    other_origin['method'] = 'owner.executor.workflow_source.enroll_workflow_birth.v3'
    other_origin['afterimages']['workflow_birth'] = seed(bank,D01,'WorkflowBirthAfterimages')['workflow_birth']
    mutations.append(('d01_origin/method','original_d01_origin',('record',),other_origin))
    for guard, name, path, wrong in mutations:
        changed = TupleWitness(bank, codec, edits=[(name, path, wrong)])
        suite.case(guard, changed.validate, 'tuple/' + guard)
        # Record the actual full predicate observations to expose masked fixtures.
        failed = [key for key, okay in changed.relations().items() if not okay]
        suite.rows[-1]['failed_relations'] = failed
        suite.rows[-1]['pass_'] = suite.rows[-1]['pass_'] and failed == [guard]
        suite.capture(guard,URI+'#/$defs/OriginalStarted',changed.original)

    # These exact-value predicates are also present in the original schema.
    # Report the actual schema site and the runtime observation separately;
    # shared isolation must adjudicate each site, never a merged refusal code.
    for guard, name, path, wrong, leaf in [
        ('d01/cause','original_d01_update',('record','cause'),'materialized',
         'native_start/original_d01_update/record/cause/const'),
        ('receipt/durability_class','receipt',('durability_class',),'ordinary',
         'original_append/first_append_receipt/durability_class/const'),
        ('receipt/durability_state','receipt',('durability_state',),'pending',
         'original_append/first_append_receipt/durability_state/const'),
    ]:
        changed = TupleWitness(bank,codec,edits=[(name,path,wrong)])
        suite.case(guard,changed.validate,'roots/schema//$defs/OriginalStarted/'+leaf)
        suite.guards.setdefault('tuple/'+guard,[]).append(guard)
        failed = [key for key,okay in changed.relations().items() if not okay]
        suite.rows[-1]['failed_relations'] = failed
        suite.rows[-1]['pass_'] = suite.rows[-1]['pass_'] and failed == [guard]
        suite.rows[-1]['shared_isolation_sites'] = ['tuple/'+guard, 'original_schema/'+leaf]
        suite.capture(guard,URI+'#/$defs/OriginalStarted',changed.original)

    # Complete roots, per-object missing members and exact schema types.
    for name, wrapper in base.native.items():
        for field in wrapper:
            mutated = base.missing_member(name,(field,))
            errors = bank.errors(URI+'#/$defs/OriginalStarted', mutated)
            suite.case('schema/missing/' + name + '/' + field,
                lambda e=errors: require('schema/expected_refusal', not e), 'schema/expected_refusal')
            suite.rows[-1]['raw_schema_observations'] = schema_observations(errors)
            suite.capture(suite.rows[-1]['id'],URI+'#/$defs/OriginalStarted',mutated)
        for field in wrapper['record']:
            mutated = base.missing_member(name,('record',field))
            errors = bank.errors(URI+'#/$defs/OriginalStarted', mutated)
            suite.case('schema/missing/' + name + '/record/' + field,
                lambda e=errors: require('schema/expected_refusal', not e), 'schema/expected_refusal')
            suite.rows[-1]['raw_schema_observations'] = schema_observations(errors)
            suite.capture(suite.rows[-1]['id'],URI+'#/$defs/OriginalStarted',mutated)
    # The selected representation uses this tuple's scope-derived keys. This is
    # representation evidence, not an original semantic source invocation.
    for mode, actor in [('inline', 'person:1'), ('event_reference', 'p'*13000)]:
        witness = TupleWitness(bank, codec, actor=actor)
        value = witness.validate()
        rep = TupleRepresentation('started', bank, codec, value)
        encoded = rep.encode(value)
        suite.case('selected_successor/' + mode,
            lambda r=rep, e=encoded, v=value, m=mode: (
                require('representation/selected_kind', e['content']['kind'] == m),
                require('representation/full_tuple_roundtrip', equal(r.decode(e), v))))
        suite.case('selected_successor/' + mode + '/tuple_read',
                   lambda r=rep,e=encoded,w=witness:r.read_tuple(e,w))
        suite.capture('selected_successor/'+mode,rep.uri+'#/$defs/StorageProjection',encoded)
        for field, wrong in [('physical_key','other:key'),('dataset_name','other:dataset'),
                             ('storage_instance_id','87654321-1234-1234-1234-123456789abc')]:
            changed = copy.deepcopy(encoded); changed[field] = wrong
            suite.case('selected_successor/'+mode+'/'+field,
                       lambda r=rep,e=changed,w=witness:r.read_tuple(e,w),'representation/'+field)
            suite.capture(suite.rows[-1]['id'],rep.uri+'#/$defs/StorageProjection',changed)
        for field in ('event_identity','original_event_value_commitment'):
            changed = copy.deepcopy(encoded)
            changed[field]['event_id' if field=='event_identity' else 'sha256'] = (
                'other:event' if field=='event_identity' else 'b'*64)
            suite.case('selected_successor/'+mode+'/'+field,
                lambda r=rep,e=changed,w=witness:r.read_tuple(e,w),'representation/'+field)
            suite.capture(suite.rows[-1]['id'],rep.uri+'#/$defs/StorageProjection',changed)
        changed = copy.deepcopy(value)
        changed['captured_goal_context']['goal_revision'] = 2
        substituted = rep.encode(changed)
        suite.case('selected_successor/'+mode+'/metadata_substitution',
            lambda r=rep,e=substituted,w=witness:r.read_tuple(e,w),'representation/tuple')
        suite.capture(suite.rows[-1]['id'],rep.uri+'#/$defs/StorageProjection',substituted)
        if mode=='inline':
            metadata = copy.deepcopy(value); event = metadata.pop('original_event')
            other = copy.deepcopy(encoded)
            other['content'] = dict(kind='event_reference',metadata=metadata,
                                   event_ref=rep.packs.put(codec.pack(event)))
            suite.case('selected_successor/nonselected_reference',
                lambda:rep.read_tuple(other,witness),'representation/kind')
            suite.capture(suite.rows[-1]['id'],rep.uri+'#/$defs/StorageProjection',other)
    huge = TupleWitness(bank,codec,project='p'*17000)
    value = huge.validate()
    suite.case('selected_successor/unrepresentable_operation',
        lambda:TupleRepresentation('started',bank,codec,value).encode(value),
        'representation/complete_operation_size')
    suite.capture(suite.rows[-1]['id'],URI+'#/$defs/Projection',value)
    wire_summary = wire_cases(suite,bank,codec,base)
    suite.wire_summary = wire_summary
    return suite, base


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--component-only', action='store_true')
    parser.add_argument('--captures',type=Path)
    args = parser.parse_args()
    bank, selection = select_bank('started')
    require('setup/all_original_refs_resolved', bank.failures == [])
    codec = original_codec()
    suite, base = run_corpus(bank, codec)
    captures = []
    if args.captures:
        args.captures.mkdir(parents=True,exist_ok=True)
        for name, capture in suite.captures.items():
            raw = codec.pack(capture['value'])
            filename = sha(name.encode())+'.msgpack'
            (args.captures/filename).write_bytes(raw)
            captures.append(dict(case_id=name,root=capture['root'],path=filename,
                                 sha256=sha(raw),byte_size=len(raw)))
        (args.captures/'manifest.json').write_text(json.dumps(dict(
            qualification='TEST_ONLY_RELATION_WITNESSES_NOT_NATIVE_ISSUANCE',
            codec='pm.seglog_frame_v2.event_value.canonical_msgpack.v1',
            members=captures),indent=2)+'\n')
    failures = [row for row in suite.rows if not row['pass_']]
    result = dict(status='FAIL' if failures else 'PASS_COMPONENT_ONLY',
        whole_root_closure='NOT_COMPLETE', original_path_oracles=dict(positive=0, negative=0),
        component_counts=dict(positive=sum(row['expected']=='PASS' for row in suite.rows),
                              negative=sum(row['expected']!='PASS' for row in suite.rows)),
        selection=selection, native_execution='NOT_RUN', unfillable_technical_blocker=None,
        remaining=REMAINING, reference_qualification=dict(resources=len(bank.documents)+1,
        reference_sites=bank.reference_sites, unresolved=bank.failures),
        cases=suite.rows, guard_negative_inventory=suite.guards,
        assertion_inventory=list(base.relations()),
        unwitnessed_relations=sorted(set(base.relations())-{
            name.removeprefix('tuple/') for name in suite.guards if name.startswith('tuple/')}),
        wire_component=suite.wire_summary,
        captures=captures,
        guard_isolation='DEFERRED_TO_SHARED_TOOL; no local removal engine or clearance',
        source_issuance='AUTHORED_RELATION_WITNESS_ONLY; no native issuer or original group authentication')
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False)+'\n')
    print(json.dumps({key: result[key] for key in ('status','whole_root_closure','component_counts','original_path_oracles')}))
    if failures:
        print(json.dumps(failures[:15], ensure_ascii=False, indent=2))
    return 1 if failures else (0 if args.component_only else 2)


if __name__ == '__main__':
    raise SystemExit(main())
