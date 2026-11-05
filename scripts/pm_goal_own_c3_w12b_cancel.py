"""Complete-root no-association cancellation fixture owner for W12b.

TEST_ONLY execution of original closed roots, original source/Stop custody,
first full append receipt and immutable terminal. Native execution NOT_RUN.
Bound Plan and Workflow must use their own native tuples, never this route.
"""
from __future__ import annotations

import copy
import json
import weakref
from pm_goal_own_c_oracles import ROOT, require, equal, Refusal, Validator, FORMAT
from pm_goal_own_c_roots import digest
from pm_goal_oracle_common import SEMANTIC_FIELDS, canonical
from pm_goal_current_writer_oracles import recipe
from pm_goal_own_c_source_oracles import scoped_key
from pm_goal_own_c3_w12b_roots import CANCEL, BINDING

APPEND = 'https://puppetmaster.local/schemas/event_append_receipt_contracts/2.0.0'
TIME = '2026-11-05T00:00:00Z'
_GRAPH_BIRTHS = weakref.WeakSet()
_APPEND_SOURCES = weakref.WeakKeyDictionary()
_ISSUED_WRAPPERS = weakref.WeakKeyDictionary()
_SHARED_ISSUED = weakref.WeakKeyDictionary()


class OriginalAppendOwner:
    """Independent fixture Storage owner issuing full receipt and first group."""
    def __init__(self, roots, codec, storage):
        self.roots, self.codec, self.storage = roots, codec, storage
        self.sequence = 37
        self.frame_offset = 128
        self.generation = 3
        self.epoch = 1
        self.available = True
        self.reservation = None
        self.issued = {}
        self.frames = []
        _SHARED_ISSUED[self] = {}
        self.registry_row = copy.deepcopy(next(r for r in json.loads((ROOT / 'Plans/event_family_registry.json').read_text())['families'] if r['event_type'] == 'goal.cancelled'))
        self.event_validator = Validator(json.loads((ROOT / 'Plans/event_record.schema.json').read_text()), format_checker=FORMAT)

    def reserve(self, operation):
        require('C12/append_available', self.available is True)
        require('C12/reservation_absent', self.reservation is None)
        reservation = dict(operation_id=operation, sequence_id=self.sequence, byte_offset=self.frame_offset,
            generation=self.generation, owner_epoch=self.epoch, lease_id='TEST_ONLY:lease:' + str(self.sequence))
        self.sequence += 1  # original lease is consumed even if later abandoned
        self.reservation = copy.deepcopy(reservation)
        return reservation

    def _check_original_producer(self, producer):
        reference = _APPEND_SOURCES.get(self)
        source = None if reference is None else reference()
        require('C12/producer_owner_birth', source in _GRAPH_BIRTHS and source.append_owner is self)
        source.admission()
        key = source.key('goal_cancel_progress') + ':epoch:4'
        raw = source.physical.get(key)
        require('C12/frozen_progress_issued', raw is not None and _ISSUED_WRAPPERS.get(source, {}).get(key) == raw)
        record = self.codec.storage_unpack(raw)['record']
        require('C12/frozen_progress_phase', record['phase'] == 'event_ready')
        require('C12/frozen_producer_original', equal(producer, record['producer_input']))

    def append(self, producer, reservation, helper=lambda owner, candidate: None, *, lose_ack=False):
        require('C12/append_available', self.available is True)
        require('C12/append_family', producer['event_type'] == 'goal.cancelled')
        require('C12/append_policy', producer['replay_policy'] == 'dedupe_by_idempotency_key')
        self.roots.check('producer', CANCEL + '#/$defs/ProducerInput', producer)
        self._check_original_producer(producer)
        identity = producer['idempotency_key']
        if identity in self.issued:
            original = self.issued[identity]
            self.resolve(producer, original['publication'])
            require('C12/semantic_retry', equal({k: producer[k] for k in SEMANTIC_FIELDS}, original['semantic']))
            if lose_ack:
                raise Refusal('C12/append_ack_lost')
            return copy.deepcopy(original['publication'])
        before = [self.generation, self.epoch]
        fixed = copy.deepcopy(producer)
        def predicate(candidate):
            require('C12/append_available', self.available is True)
            require('C12/append_owner', equal(before, [self.generation, self.epoch]))
            require('C12/reservation', equal(reservation, self.reservation))
            require('C12/fixed_producer', equal(candidate, fixed))
            require('C12/selector', candidate['payload_schema_id'] == self.registry_row['payload_schema_id'])
            self._check_original_producer(candidate)
        predicate(producer)
        candidate = copy.deepcopy(producer)
        helper(self, candidate)
        predicate(candidate)
        event = {**candidate, 'sequence_id': reservation['sequence_id'], 'observed_at_utc': TIME, 'persisted_at_utc': TIME}
        require('C12/whole_event_schema', not list(self.event_validator.iter_errors(event)))
        raw = self.codec.storage_pack(event)
        require('C12/event_size', len(raw) <= 16384)
        receipt = self.roots.make('producer', APPEND + '#/$defs/AppendReceipt', dict(
            storage_instance_id=self.storage, event_id=event['event_id'], sequence_id=event['sequence_id'],
            segment_generation=self.generation, segment_name='TEST_ONLY:segment:3', byte_offset=self.frame_offset,
            commit_group_id='TEST_ONLY:first-group:' + identity, durability_class='barrier', durable_end_offset=self.frame_offset + len(raw) + 32,
            durability_state='synced', manifest_generation=self.generation, acknowledged_at_utc=TIME))
        commitment = self.commitment(event)
        publication = self.roots.make('producer', CANCEL + '#/$defs/OriginalPublication', dict(event_id=event['event_id'],
            first_append_receipt=receipt, original_append_result=dict(event_id=event['event_id'], sequence_id=event['sequence_id'],
                byte_offset=self.frame_offset, segment_ref=receipt['segment_name']), original_event_value_commitment=commitment))
        record = dict(event=copy.deepcopy(event), raw=raw, receipt=copy.deepcopy(receipt), publication=copy.deepcopy(publication),
            semantic={k: copy.deepcopy(producer[k]) for k in SEMANTIC_FIELDS},
            first_group=dict(storage_instance_id=self.storage, commit_group_id=receipt['commit_group_id'],
                members=[event['event_id']], first_receipts=[copy.deepcopy(receipt)], synced=True))
        self.issued, self.frames, self.reservation = {**self.issued, identity: record}, self.frames + [raw], None
        _SHARED_ISSUED[self][identity] = (record, copy.deepcopy(record))
        self.frame_offset = receipt['durable_end_offset']
        if lose_ack:
            raise Refusal('C12/append_ack_lost')
        return publication

    def commitment(self, event):
        domain = 'pm.storage.original_event_value_commitment.v1'
        codec = 'pm.seglog_frame_v2.event_value.canonical_msgpack.v1'
        preimage = [domain, '1.0.0', codec, event['schema_id'], event['schema_version'], event]
        return self.roots.make('producer', APPEND + '#/$defs/original_event_value_commitment', {'sha256': digest(self.codec.storage_pack(preimage))})

    def resolve(self, producer, publication, *, helper=lambda owner, value: None):
        require('C12/original_append_issued', producer['idempotency_key'] in self.issued)
        issued = self.issued[producer['idempotency_key']]
        value = copy.deepcopy(issued)
        def predicate(candidate):
            require('C12/read_access', self.available is True)
            origin = _SHARED_ISSUED.get(self, {}).get(producer['idempotency_key'])
            require('C12/first_row_issuance', origin is not None and self.issued.get(producer['idempotency_key']) is origin[0]
                    and equal(self.issued[producer['idempotency_key']], origin[1]))
            require('C12/first_publication', equal(publication, issued['publication']))
            require('C12/first_event', equal(candidate['event'], issued['event']))
            require('C12/first_raw', candidate['raw'] == self.codec.storage_pack(candidate['event']) == issued['raw'])
            require('C12/first_receipt', equal(candidate['receipt'], issued['receipt']))
            require('C12/first_group', equal(candidate['first_group'], issued['first_group']))
            require('C12/group_members', candidate['first_group']['members'] == [producer['event_id']])
            require('C12/value_commitment', equal(self.commitment(candidate['event']), publication['original_event_value_commitment']))
            event_template = {k: v for k, v in candidate['event'].items() if k not in ('sequence_id', 'observed_at_utc', 'persisted_at_utc')}
            require('C12/template_keyset', event_template.keys() == producer.keys())
            require('C12/template', equal(event_template, producer))
            require('C12/storage_identity', candidate['first_group']['storage_instance_id'] == self.storage)
        predicate(value)
        helper(self, value)
        predicate(value)
        return value


class CancellationGraph:
    def __init__(self, migration):
        self.migration = migration
        self.roots, self.codec = migration.roots, migration.codec
        self.scope = copy.deepcopy(migration.scope)
        self.snapshot = copy.deepcopy(migration.original_snapshot)
        self.registration_fence = migration.fence()
        self.registration_fence.pop('effective_stop')
        self.initial_stop = copy.deepcopy(self.stop)
        self.permission = True
        self.content = True
        self.epoch = 1
        self.source = None
        self.progress = None
        self.terminal = None
        self.pending_resolution = None
        self.source_current = True
        self.effects = []
        self.physical = {}
        self.append_owner = OriginalAppendOwner(self.roots, self.codec, self.scope['storage_instance_id'])
        self.operation_id = 'cancel-operation:W12b'
        body = self.snapshot['body']
        self.accepted_request = self.make('GoalCancelRequestV2', dict(command_instance_id='command:W12b',
            **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')}, expected_revision=body['revision'],
            expected_currentness_hash=body['currentness_hash'], actor_ref='person:W12b', permission_snapshot_ref='permission:W12b',
            idempotency_key='sir:W12b', source_surface='chat_goal_cancel', return_route_ref='chat:W12b'))
        self.identity = self.make('NormalizedIdentity', dict(request_ref='request:W12b', command_instance_id='command:W12b',
            operation_id=self.operation_id, payload_sha256=self.hash(self.accepted_request), idempotency_key='sir:W12b',
            dispatch_frame_id='dispatch-frame:W12b', owner_identity=dict(scope_kind='project', project_id=self.scope['project_id'],
                project_home_server_id='server:W12b', thread_id=self.scope['thread_id'], goal_id=self.scope['goal_id'],
                command_instance_id='command:W12b', operation_id=self.operation_id)))
        self.nonterminal = self.make('NonterminalOutcome', dict(command_id='cmd.chat.goal.cancel',
            command_instance_id='command:W12b', identity=self.identity['owner_identity'], payload_sha256=self.identity['payload_sha256'],
            idempotency_key=self.identity['idempotency_key'], dispatch_frame_id=self.identity['dispatch_frame_id'],
            outcome='acknowledged', acknowledgement_receipt_ref='acknowledgement:W12b', acknowledgement_frame_offset=8))
        self.binding = self.make('ExecutionBinding', dict(kind='no_bound_plan', active_run_ref=None,
            goal_plan_binding_ref=None, goal_plan_binding_sha256=None, assistant_plan_id=None, plan_run_id=None,
            plan_version=None, plan_hash=None, execution_owner_ref=migration.host_owner,
            original_binding_source_ref=self.key('goal_cancel_binding_selection')))
        self.event_id, self.event_key = recipe('goal.cancelled', {**self.scope, 'command_id': 'cmd.chat.goal.cancel',
            'command_instance_id': self.accepted_request['command_instance_id'], 'operation_id': self.operation_id})
        self.producer_metadata = self.make('ProducerMetadata', dict(event_id=self.event_id, idempotency_key=self.event_key,
            occurred_at_utc=TIME, actor_ref=self.accepted_request['actor_ref']))
        self._capture_binding_read()
        _GRAPH_BIRTHS.add(self)
        _APPEND_SOURCES[self.append_owner] = weakref.ref(self)
        _ISSUED_WRAPPERS[self] = {}

    def _capture_binding_read(self):
        members = self.migration.results[self.migration.migration_id]['published_members']
        sources = {}
        self.binding_sources_raw = {}
        physical = {}
        for slot, name in [('control', 'StorageBindingControl'), ('revision', 'StorageBindingRevision'),
                           ('origin', 'StorageBindingOrigin'), ('domain', 'StorageWriterDomain'), ('head', 'StorageWriterDomainHead')]:
            selection = next(s for s in members if s['schema_ref'].endswith('/' + name))
            raw = self.migration.cells[selection['physical_key']]
            value = self.codec.storage_unpack(raw)
            self.roots.check('producer', selection['schema_ref'], value)
            self.binding_sources_raw[selection['physical_key']] = raw
            sources[slot] = value['record']
            physical[slot] = self.migration.physical_selection(selection['physical_key'], value,
                {'control': 'goal_execution_binding_control', 'revision': 'goal_execution_binding_revision',
                 'origin': 'goal_execution_binding_origin', 'domain': 'goal_execution_writer_domain', 'head': 'goal_execution_writer_domain_head'}[slot])
        body_source = next(i for i in self.migration.goal_images if i['selection']['schema_ref'].endswith('/storage_body'))
        reader = self.migration.transaction('goal', self.operation_id)
        reader['owner_method'] = 'owner.goal.execution_binding.read_current_for_cancel.v1'
        self.binding_selection = self.roots.make('producer', BINDING + '#/$defs/BindingSelection', dict(scope=self.scope,
            operation_id=self.operation_id, original_command_instance_id=self.accepted_request['command_instance_id'], original_dispatch_id='dispatch:W12b',
            binding_control=physical['control'], binding_revision=physical['revision'], binding_origin=physical['origin'],
            writer_domain_head=physical['head'], writer_domain=physical['domain'],
            original_goal_body_sha256=body_source['selection']['sha256'], original_goal_control_sha256=self.row_hash('BodyControlV2', self.control),
            original_stop_control_sha256=self.row_hash('StopControl', self.stop), actual_active_run_ref=None,
            original_pending_binding_operation_id=None, original_pending_binding_candidate_sha256=None, association_count=0,
            disposition='no_execution_association', original_reader=reader))
        self.binding_read = self.roots.make('producer', BINDING + '#/$defs/BindingReadCurrent', dict(scope=self.scope,
            control=sources['control'], revision=sources['revision'], origin=sources['origin'], domain=sources['domain'],
            original_execution_binding=self.binding, selection=self.binding_selection))
        self.original_binding_read = copy.deepcopy(self.binding_read)
        self.binding_selection_wrapper = self.roots.make('producer', BINDING + '#/$defs/StorageBindingSelection', {'record': self.binding_selection})

    @property
    def stop(self):
        return self.migration.stop

    @property
    def control(self):
        return self.migration.current_body_control

    def make(self, name, seed=None):
        return self.roots.make('producer', CANCEL + '#/$defs/' + name, seed)

    def hash(self, value):
        # SP-304 retains this original canonical JSON *digest preimage* recipe;
        # SP-340 changes stored bytes to the separately selected MessagePack.
        return self.codec.h(value)

    def key(self, prefix):
        return prefix.removesuffix('.v1') + ':' + scoped_key(self.scope) + ':' + self.operation_id.encode().hex()

    def row_hash(self, name, record):
        wrapper = self.make({'SourceAudit': 'StorageSourceAudit', 'StopControl': 'StorageStopControl',
            'StopReceipt': 'StorageStopReceipt', 'CancellationReceipt': 'StorageCancellationReceipt',
            'BodyControlV2': 'StorageBodyControlV2', 'Progress': 'StorageProgress'}[name], {'record': record})
        return digest(self.codec.storage_pack(wrapper))

    def intent_hash(self, intent):
        return digest(b'pm.goal.cancel.stop_intent.v1\n' + self.codec.raw(intent))

    def result_hash(self, result):
        # Existing bounded CV-333 fixture helper; full number/recipe-domain
        # qualification belongs to the shared sweep, not a new local codec.
        return digest(canonical(result))

    def admission(self, *, current=True):
        require('C12/permission', self.permission is True)
        require('C12/content', self.content is True)
        require('C12/graph_epoch_type', type(self.epoch) is int)
        if self.source is not None:
            require('C12/graph_epoch', self.epoch == self.source['source_authority_epoch'])
        require('C12/migration_not_withdrawn', self.migration.withdrawn is False)
        current_registration = self.migration.fence()
        current_registration.pop('effective_stop')
        require('C12/original_registration', equal(self.registration_fence, current_registration))
        result = self.migration.read_result(self.migration.selector())
        require('C12/enrolled', result['disposition'] == 'enrolled')
        if current:
            require('C12/current_source', self.source_current is True)
        require('C12/no_association', self.binding['kind'] == 'no_bound_plan' and self.binding['active_run_ref'] is None)
        require('C12/original_binding', equal(self.binding, self.original_binding_read['original_execution_binding']))
        require('C12/binding_read_original', equal(self.binding_read, self.original_binding_read))
        require('C12/binding_source_current', all(self.migration.cells.get(key) == raw for key, raw in self.binding_sources_raw.items()))
        require('C12/body_preserved', equal(self.snapshot, self.migration.original_snapshot))

    def fence(self):
        return dict(epoch=self.epoch, stop=copy.deepcopy(self.stop), control=copy.deepcopy(self.control),
                    source=copy.deepcopy(self.source), progress=copy.deepcopy(self.progress), binding_read=copy.deepcopy(self.binding_read))

    def _effect(self, operation, values, helper=lambda owner, values: None, fault=None):
        before = self.fence()
        expected = copy.deepcopy(values)
        self.admission()
        helper(self, values)
        self.admission()
        require('C12/whole_preimage/' + operation, equal(before, self.fence()))
        require('C12/whole_candidate/' + operation, equal(values, expected))
        for name, value in values.items():
            if name.startswith('_'):
                continue
            self.roots.check('producer', CANCEL + '#/$defs/' + name, value)
        stored = {}
        routes = {'SourceAudit': ('StorageSourceAudit', 'goal_cancel_source_audit'),
                  'StopReceipt': ('StorageStopReceipt', 'goal_cancel_stop_receipt'),
                  'CancellationReceipt': ('StorageCancellationReceipt', 'goal_cancel_receipt'),
                  'ControlPublication': ('StorageControlPublication', 'goal_cancel_control_publication'),
                  'Terminal': ('StorageTerminal', 'goal_cancel_terminal_audit')}
        for name, (wrapper, prefix) in routes.items():
            if name in values:
                key = self.key(prefix)
                stored[key] = self.make(wrapper, dict(storage_instance_id=self.scope['storage_instance_id'], physical_key=key, record=values[name]))
        if 'Progress' in values:
            key = self.key('goal_cancel_progress') + ':epoch:' + str(values['Progress']['progress_epoch'])
            stored[key] = self.make('StorageProgress', dict(storage_instance_id=self.scope['storage_instance_id'], physical_key=key, record=values['Progress']))
            head_key = self.key('goal_cancel_progress') + ':head'
            head = self.make('ProgressHead', dict(**self.scope, operation_id=self.operation_id, progress_epoch=values['Progress']['progress_epoch'], snapshot_sha256=digest(self.codec.storage_pack(stored[key]))))
            stored[head_key] = self.make('StorageProgress', dict(storage_instance_id=self.scope['storage_instance_id'], physical_key=head_key, record=head))
        if operation == 'capture_source':
            selection_wrapper = copy.deepcopy(values['_binding_selection'])
            self.roots.check('producer', BINDING + '#/$defs/StorageBindingSelection', selection_wrapper)
            stored[self.key('goal_cancel_binding_selection')] = selection_wrapper
        for key, value in stored.items():
            require('C12/part_size/' + operation, len(self.codec.storage_pack(value)) <= 16384)
            require('C12/operation_size/' + operation, len(self.codec.storage_pack({'physical_key': key, 'value': value})) <= 16384)
        if fault == 'before':
            raise Refusal('C12/before/' + operation)
        # All owned publications of this boundary appear in one assignment.
        after = copy.deepcopy(values.get('_state', {}))
        for name in ('StopControl', 'BodyControlV2'):
            if name in values:
                after['stop' if name == 'StopControl' else 'control'] = copy.deepcopy(values[name])
        if 'Progress' in values:
            after['progress'] = copy.deepcopy(values['Progress'])
        if 'SourceAudit' in values:
            after['source'] = copy.deepcopy(values['SourceAudit'])
        if 'Terminal' in values:
            after['terminal'] = copy.deepcopy(values['Terminal'])
        new_physical = {**self.physical, **{key: self.codec.storage_pack(v) for key, v in stored.items()}}
        new_stop = after.pop('stop', self.stop)
        new_control = after.pop('control', self.control)
        self.migration.publish_same_host_domain(new_stop, new_control)
        self.__dict__.update(after, physical=new_physical, effects=self.effects + [operation])
        _ISSUED_WRAPPERS[self].update({key: self.codec.storage_pack(v) for key, v in stored.items()})
        if fault == 'after':
            raise Refusal('C12/lost_ack/' + operation)
        return copy.deepcopy(values)

    def capture(self, request=None, **options):
        request = copy.deepcopy(self.accepted_request if request is None else request)
        self.roots.check('producer', CANCEL + '#/$defs/GoalCancelRequestV2', request)
        require('C12/accepted_dispatch', equal(request, self.accepted_request))
        require('C12/legal_state', self.snapshot['body']['state'] in ('active', 'paused', 'blocked'))
        require('C12/not_cancelled', self.control['cancellation_receipt_ref'] is None)
        if self.source is not None:
            return copy.deepcopy(self.source)
        body = self.snapshot['body']
        images = self.migration.goal_images
        body_source = next(i for i in images if i['selection']['schema_ref'].endswith('/storage_body'))
        current_result = self.migration.results[self.migration.migration_id]
        control_source = next(s for s in current_result['published_members'] if s['schema_ref'].endswith('/StorageBodyControlV2'))
        revisions, origins = {}, {}
        for image in images:
            selected = image['selection']
            record = self.codec.decode(bytes.fromhex(image['bytes_hex']))['record']
            if selected['schema_ref'].endswith('/storage_revision'):
                revisions[record['revision']] = selected
            elif selected['schema_ref'].endswith('/storage_origin'):
                origins[record['goal_revision']] = selected
        inventory = [dict(revision_key=revisions[n]['physical_key'], revision_outer_sha256=revisions[n]['sha256'],
            origin_key=origins[n]['physical_key'], origin_outer_sha256=origins[n]['sha256']) for n in sorted(revisions)]
        selection = self.make('BodySelection', {**self.scope, 'body_key': self.control['body_key'],
            'body_outer_sha256': body_source['selection']['sha256'], 'body_semantic_sha256': self.control['body_sha256'],
            'revision': body['revision'], 'currentness_hash': body['currentness_hash'], 'control_key': control_source['physical_key'],
            'control_outer_sha256': self.row_hash('BodyControlV2', self.control), 'control_epoch': self.control['control_epoch'],
            'latest_objective_revision': self.control['latest_objective_revision'], 'latest_revision_hash': self.control['latest_revision_hash'],
            'origin_key': self.control['origin_key'], 'complete_history_origin_inventory_sha256': self.hash(inventory),
            'state': body['state'], 'active_run_ref': body['active_run_ref']})
        source = self.make('SourceAudit', {**self.scope, 'request': request, 'normalized_identity': self.identity,
            'dispatch_id': 'dispatch:W12b', 'command_outcome_ref': 'outcome:W12b', 'nonterminal_outcome': self.nonterminal,
            'original_user_cancel_acceptance_ref': 'TEST_ONLY:protected-user-action:W12b', 'source_authority_ref': 'TEST_ONLY:SIR:W12b',
            'source_authority_epoch': self.epoch, 'original_body': selection, 'original_execution_binding': self.binding,
            'original_stop_control_sha256': self.row_hash('StopControl', self.stop), 'captured_user_stop_epoch': self.stop['user_stop_epoch'],
            'captured_continuation_epoch': self.stop['continuation_epoch'], 'producer_metadata': self.producer_metadata, 'captured_at': TIME})
        progress = self.make('Progress', {**self.scope, 'operation_id': self.operation_id, 'source_audit_sha256': self.row_hash('SourceAudit', source),
            'phase': 'source_admitted', 'progress_epoch': 0, 'resolution_owner_ref': 'TEST_ONLY:resolution:W12b'})
        self._effect('capture_source', dict(SourceAudit=source, Progress=progress,
            _binding_selection=copy.deepcopy(self.binding_selection_wrapper)), **options)
        return copy.deepcopy(self.source)

    def _progress(self, phase, **updates):
        value = copy.deepcopy(self.progress)
        value.update(phase=phase, progress_epoch=value['progress_epoch'] + 1, **updates)
        return self.make('Progress', value)

    def latch(self, **options):
        require('C12/phase/latch', self.progress is not None and self.progress['phase'] == 'source_admitted')
        require('C12/original_stop', self.row_hash('StopControl', self.stop) == self.source['original_stop_control_sha256'])
        intent = self.make('StopIntent', {**self.scope, 'operation_id': self.operation_id, 'source_audit_sha256': self.row_hash('SourceAudit', self.source),
            'before_stop_control_sha256': self.row_hash('StopControl', self.stop), 'before_user_stop_epoch': self.stop['user_stop_epoch'],
            'after_user_stop_epoch': self.stop['user_stop_epoch'] + 1, 'before_continuation_epoch': self.stop['continuation_epoch'],
            'after_continuation_epoch': self.stop['continuation_epoch'] + 1, 'expected_revision': self.accepted_request['expected_revision'],
            'expected_currentness_hash': self.accepted_request['expected_currentness_hash'], 'original_execution_binding': self.binding,
            'original_host_owner_epoch': self.migration.owners['host_stop'].epoch,
            'original_accepted_cancel_ref': self.source['original_user_cancel_acceptance_ref'], 'requested_at': TIME})
        receipt = self.make('StopReceipt', {**self.scope, 'operation_id': self.operation_id, 'stop_intent_sha256': self.intent_hash(intent),
            'source_audit_sha256': self.row_hash('SourceAudit', self.source), **{k: intent[k] for k in ('before_user_stop_epoch', 'after_user_stop_epoch',
                'before_continuation_epoch', 'after_continuation_epoch')}, 'original_host_transaction_ref': 'TEST_ONLY:C-stop:W12b', 'committed_at': TIME})
        stop = copy.deepcopy(self.stop)
        stop.update(user_stop_epoch=intent['after_user_stop_epoch'], continuation_epoch=intent['after_continuation_epoch'], latched=True,
            last_original_stop_receipt_ref=self.key('goal_cancel_stop_receipt.v1'), last_original_stop_receipt_sha256=self.row_hash('StopReceipt', receipt))
        pending = self.make('CancellationPending', {**self.scope, 'operation_id': self.operation_id, 'source_audit_sha256': self.row_hash('SourceAudit', self.source),
            'stop_intent_sha256': self.intent_hash(intent), 'accepted_user_stop_epoch': stop['user_stop_epoch'], 'accepted_continuation_epoch': stop['continuation_epoch'],
            'expected_revision': self.control['current_revision'], 'expected_currentness_hash': self.control['currentness_hash'],
            'expected_body_semantic_sha256': self.control['body_sha256'], 'expected_latest_objective_revision': self.control['latest_objective_revision'],
            'expected_latest_revision_hash': self.control['latest_revision_hash'], 'original_goal_owner_epoch': self.epoch,
            'original_sir_source_ref': self.source['source_authority_ref'], 'original_cancel_authority_ref': self.source['original_user_cancel_acceptance_ref']})
        control = copy.deepcopy(self.control)
        control.update(control_epoch=control['control_epoch'] + 1, cancellation_pending=pending)
        progress = self._progress('stop_reserved', stop_intent=intent, stop_receipt=receipt, reservation_sha256=self.hash(pending))
        return self._effect('latch_and_reserve', dict(StopIntent=intent, StopReceipt=receipt, StopControl=stop, BodyControlV2=control, Progress=progress), **options)

    def commit_receipt(self, **options):
        require('C12/phase/receipt', self.progress['phase'] == 'stop_reserved')
        stop_receipt = self.progress['stop_receipt']
        receipt = self.make('CancellationReceipt', {**self.scope, 'operation_id': self.operation_id, 'cancellation_id': self.operation_id,
            'source_audit_sha256': self.row_hash('SourceAudit', self.source), 'original_revision': self.accepted_request['expected_revision'],
            'original_currentness_hash': self.accepted_request['expected_currentness_hash'], 'stop_receipt_ref': self.key('goal_cancel_stop_receipt.v1'),
            'stop_receipt_sha256': self.row_hash('StopReceipt', stop_receipt), 'user_stop_epoch': stop_receipt['after_user_stop_epoch'], 'accepted_at': TIME})
        return self._effect('commit_receipt', dict(CancellationReceipt=receipt, Progress=self._progress('receipt_committed', cancellation_receipt=receipt)), **options)

    def settle(self, **options):
        require('C12/phase/settle', self.progress['phase'] == 'receipt_committed')
        settlement = self.make('OwnerSettlement', dict(kind='none_required', original_execution_binding=self.binding,
            original_scope_proof_ref='TEST_ONLY:original-binding-selection:W12b', original_scope_proof_sha256=self.hash(self.migration.results),
            original_owner_settlement_ref=None, original_owner_settlement_sha256=None,
            original_schedule_quota_invalidation_ref=None, original_schedule_quota_invalidation_sha256=None))
        return self._effect('settle_owner', dict(OwnerSettlement=settlement, Progress=self._progress('owners_settled', owner_settlement=settlement)), **options)

    def freeze(self, **options):
        require('C12/phase/freeze', self.progress['phase'] == 'owners_settled')
        producer = self.make('ProducerInput', {**self.producer_metadata, 'event_id': self.event_id, 'idempotency_key': self.event_key,
            'event_type': 'goal.cancelled', 'project_id': self.scope['project_id'], 'thread_id': self.scope['thread_id'],
            'run_id': None, 'node_id': None, 'attempt_id': None, 'payload_ref': None, 'occurred_at_utc': TIME,
            'payload': dict(schema_id='pm.goal_runtime_event.goal_cancelled.schema.v3', schema_version='3.0.0',
                **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')}, operation_id=self.operation_id,
                command_instance_id=self.accepted_request['command_instance_id'], cancellation_id=self.operation_id,
                revision=self.accepted_request['expected_revision'], currentness_hash=self.accepted_request['expected_currentness_hash'],
                cancel_reason='user_cancelled', user_stop_epoch=self.progress['cancellation_receipt']['user_stop_epoch'],
                cancellation_receipt_ref=self.key('goal_cancel_receipt.v1'), cancellation_receipt_sha256=self.row_hash('CancellationReceipt', self.progress['cancellation_receipt']),
                source_audit_sha256=self.row_hash('SourceAudit', self.source), cancelled_at_utc=self.progress['cancellation_receipt']['accepted_at'])})
        return self._effect('freeze_event', dict(ProducerInput=producer, Progress=self._progress('event_ready', producer_input=producer)), **options)

    def append(self, *, lost_ack=False, helper=lambda owner, candidate: None):
        require('C12/phase/append', self.progress['phase'] in ('event_ready', 'event_unknown'))
        self.admission()
        producer = copy.deepcopy(self.progress['producer_input'])
        reservation = None if producer['idempotency_key'] in self.append_owner.issued else (self.append_owner.reservation or self.append_owner.reserve(self.operation_id))
        try:
            publication = self.append_owner.append(producer, reservation, helper, lose_ack=lost_ack)
        except Refusal as error:
            if str(error) != 'C12/append_ack_lost':
                raise
            # Storage's write survived; this owner received no publication.
            progress = self._progress('event_unknown', publication=None)
        else:
            self.append_owner.resolve(producer, publication)
            progress = self._progress('event_issued', publication=publication)
        return self._effect('append_original', dict(Progress=progress))

    def resolve_append(self):
        require('C12/phase/resolve_append', self.progress['phase'] == 'event_unknown')
        producer = self.progress['producer_input']
        record = self.append_owner.issued.get(producer['idempotency_key'])
        require('C12/original_append_issued', record is not None)
        publication = copy.deepcopy(record['publication'])
        self.append_owner.resolve(producer, publication)
        return self._effect('resolve_original', dict(Progress=self._progress('event_issued', publication=publication)))

    def publish(self, **options):
        require('C12/phase/publish', self.progress['phase'] == 'event_issued')
        self.append_owner.resolve(self.progress['producer_input'], self.progress['publication'])
        control = copy.deepcopy(self.control)
        require('C12/no_unresolved_body_pending', control['pending'] is None)
        control.update(control_epoch=control['control_epoch'] + 1, cancellation_receipt_ref=self.key('goal_cancel_receipt.v1'), cancellation_pending=None)
        publication = self.make('ControlPublication', {**self.scope, 'operation_id': self.operation_id,
            'source_audit_sha256': self.row_hash('SourceAudit', self.source), 'cancellation_receipt_ref': self.key('goal_cancel_receipt.v1'),
            'cancellation_receipt_sha256': self.row_hash('CancellationReceipt', self.progress['cancellation_receipt']), 'original_publication': self.progress['publication'],
            'before_control_sha256': self.row_hash('BodyControlV2', self.control), 'after_control_sha256': self.row_hash('BodyControlV2', control),
            'before_control_epoch': self.control['control_epoch'], 'after_control_epoch': control['control_epoch'],
            'body_semantic_sha256': control['body_sha256'], 'revision': control['current_revision'], 'currentness_hash': control['currentness_hash'],
            'original_owner_settlement': self.progress['owner_settlement'], 'original_transaction_ref': 'TEST_ONLY:C-publish:W12b', 'published_at': TIME})
        return self._effect('publish_control', dict(ControlPublication=publication, BodyControlV2=control,
            Progress=self._progress('control_published', control_publication=publication)), **options)

    def finish(self, kind='succeeded', **options):
        require('C12/terminal_not_issued', self.terminal is None)
        require('C12/terminal_kind', kind in ('succeeded', 'unknown', 'no_effect'))
        if kind == 'succeeded':
            require('C12/phase/terminal', self.progress['phase'] == 'control_published')
            self.append_owner.resolve(self.progress['producer_input'], self.progress['publication'])
            result = self.make('SucceededResult', dict(command_instance_id=self.accepted_request['command_instance_id'], operation_id=self.operation_id,
                **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')}, cancellation_receipt=self.progress['cancellation_receipt'],
                publication=self.progress['publication'], control_publication=self.progress['control_publication']))
        elif kind == 'no_effect':
            require('C12/no_effect_original_phase', self.progress['phase'] == 'source_admitted' and self.effects == ['capture_source'])
            require('C12/no_effect_stop_unchanged', equal(self.stop, self.initial_stop))
            result = self.make('NoEffectResult', dict(command_instance_id=self.accepted_request['command_instance_id'], operation_id=self.operation_id,
                **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')}, status='failed', no_effect_proof_ref='TEST_ONLY:original-zero-effect:W12b'))
            progress = self._progress('no_effect')
            self._effect('record_no_effect', dict(Progress=progress))
        else:
            require('C12/unknown_preserves_effect', self.progress['phase'] != 'source_admitted')
            selector = self.make('ProgressSnapshotSelector', dict(**self.scope, operation_id=self.operation_id,
                progress_epoch=self.progress['progress_epoch'], snapshot_key=self.key('goal_cancel_progress') + ':epoch:' + str(self.progress['progress_epoch'])))
            result = self.make('RecoveryRequiredResult', dict(command_instance_id=self.accepted_request['command_instance_id'], operation_id=self.operation_id,
                **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')}, original_progress_selector=selector,
                stop_effect='latched', receipt_effect='committed' if self.progress['cancellation_receipt'] else 'not_committed',
                event_effect='unknown' if self.progress['phase'] == 'event_unknown' else ('issued' if self.progress['publication'] else 'not_attempted'),
                control_effect='published' if self.progress['control_publication'] else 'not_published',
                original_effect_evidence_refs=[self.key('goal_cancel_stop_receipt.v1')], resolution_owner_ref=self.progress['resolution_owner_ref']))
        selector = self.make('ProgressSnapshotSelector', dict(**self.scope, operation_id=self.operation_id,
            progress_epoch=self.progress['progress_epoch'], snapshot_key=self.key('goal_cancel_progress') + ':epoch:' + str(self.progress['progress_epoch'])))
        result_ref = self.key('goal_cancel_result.v2')
        terminal_input = self.make('TerminalInput', dict(source_audit=self.source, selected_progress=self.progress,
            selected_progress_selector=selector, selected_progress_sha256=self.row_hash('Progress', self.progress), original_current_outcome=self.nonterminal,
            result=result, owner_result_ref=result_ref, owner_result_sha256=self.result_hash(result), expected_sir_owner_epoch=self.epoch))
        result_status = 'succeeded' if kind == 'succeeded' else ('recovery_required' if kind == 'unknown' else result['status'])
        outcome_name = {'succeeded': 'TerminalSuccessOutcome', 'unknown': 'TerminalUnknownOutcome', 'no_effect': 'TerminalNoEffectOutcome'}[kind]
        response_name = {'succeeded': 'SuccessResponse', 'unknown': 'UnknownResponse', 'no_effect': 'NoEffectResponse'}[kind]
        outcome_seed = copy.deepcopy(self.nonterminal)
        outcome_seed.update(outcome='succeeded' if kind == 'succeeded' else ('failed' if kind == 'unknown' else result['status']),
            owner_result_ref=result_ref, owner_result_sha256=self.result_hash(result), result_receipt_ref=result_ref)
        outcome = self.make(outcome_name, outcome_seed)
        response = self.make(response_name, dict(command_instance_id=self.accepted_request['command_instance_id'], command_id='cmd.chat.goal.cancel',
            owner_result_ref=result_ref, owner_result_sha256=self.result_hash(result), result_status=result_status,
            receipt_ref=result_ref, event_refs=[self.event_id] if kind == 'succeeded' else []))
        terminal = self.make('Terminal', dict(**self.scope, operation_id=self.operation_id, source_audit_sha256=self.row_hash('SourceAudit', self.source),
            terminal_progress_sha256=self.row_hash('Progress', self.progress), owner_result_ref=result_ref, owner_result_sha256=self.result_hash(result),
            terminal_authority_ref='TEST_ONLY:SIR-terminal:W12b', committed_at=TIME, kind=kind, result=result,
            outcome=outcome, response=response, terminal_progress_selector=selector))
        prepared = self.make('TerminalPrepared', dict(input_sha256=self.hash(terminal_input), candidate_terminal=terminal,
            actual_original_sir_participant_ref='TEST_ONLY:SIR-participant:W12b', expected_original_source_sha256=self.row_hash('SourceAudit', self.source)))
        return self._effect('terminal', dict(TerminalInput=terminal_input, TerminalPrepared=prepared, Terminal=terminal), **options)

    def replay_terminal(self, terminal, helper=lambda owner, value: None):
        require('C12/replay_issued', self.terminal is not None)
        expected = copy.deepcopy(self.terminal)
        def predicate(value):
            require('C12/replay_audit_permission', self.migration.audit_permission is True)
            require('C12/replay_original_terminal', equal(value, expected))
            raw = self.physical[self.key('goal_cancel_terminal_audit')]
            require('C12/terminal_row_issuance', _ISSUED_WRAPPERS.get(self, {}).get(self.key('goal_cancel_terminal_audit')) == raw)
            require('C12/replay_original_bytes', equal(self.codec.storage_unpack(raw)['record'], value))
            self.roots.check('producer', CANCEL + '#/$defs/Terminal', value)
        predicate(terminal)
        output = copy.deepcopy(terminal)
        helper(self, output)
        predicate(output)
        return output

    def run_to(self, phase='control_published'):
        operations = [('source_admitted', self.capture), ('stop_reserved', self.latch), ('receipt_committed', self.commit_receipt),
                      ('owners_settled', self.settle), ('event_ready', self.freeze), ('event_issued', self.append), ('control_published', self.publish)]
        for wanted, operation in operations:
            operation()
            if wanted == phase:
                return self
        return self
