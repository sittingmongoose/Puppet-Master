#!/usr/bin/env python3
"""DG-CA3 C4: SP-313 v2 private current inspection and the C1/C2 inspect_current edition (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

GRS-078 ("Current event inspection independently requires genuine current SP-278 full
value/source/index evidence and the original first receipt/custody"), GRS-081/SIR-053/
SP-313 and ``Plans/goal_workflow_cancel_contracts/current-inspection-*.v2.json``.

``Inspector`` is the qualified private inspector boundary. Every lower source route is
independently callable and reads its member from Storage by the key derived from the
request alone (scope, operation id, selector), never from a coordinator's memory:

* ``read_source_audit`` / ``read_stop_receipt`` / ``read_cancellation_receipt`` -- the shared
  unchanged V1 physical sources, admitted only for a genuinely accepted Workflow V3 operation;
* ``read_progress_pair`` -- the current v2 head and its selected immutable epoch
  (CurrentInspectionProgressPairV1: event_ready..control_published, workflow_settled);
* ``read_frozen_producer`` -- the producer frozen in the selected epoch;
* ``read_original_inspection_custody`` (``read_original_inspection_custody.v1``) -- the whole
  OriginalInspectionCustodyV1, final predicate repeated after every lower route;
* ``current_event_source`` -- OriginalGoalAppendReadback re-read now from Storage custody, the
  lane-local SP-278 index owner and the seglog owner;
* ``inspect_current_event_v2`` -- InspectCurrentEventEntryV2 and the outer final disclosure:
  only the narrow EventObservation or a typed UnavailableRead;
* ``inspect_current_event_v1`` -- the frozen v1 Workflow inspector lineage, not installed for the
  V3 profile: ``installation_unavailable``;
* ``inspect_current`` -- coverage row 10, the C1/C2 edition over CANCEL's EventInspectRequest.

Failures are typed ``UnavailableRead`` results (``member_pending``, ``missing_original``,
``source_unavailable``, ``permission_denied``, ``unsupported_version``,
``contradictory_original``); ``last_code`` keeps the exact invariant for the corpus. Every
call is passive: Storage's cell generation, Events and the index frontier are unchanged.
"""
from __future__ import annotations

import copy
import re

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_dg_ca_owners import WorldOwner, require, Refusal, uid, row_sha, same, sha, scoped_key, exact_numbers, CANCEL
import pm_goal_dg_ca3_route as R
import pm_goal_dg_ca3_index as IX

CI = 'https://puppetmaster.local/proposals/goal_workflow_cancel_current_inspection.v2.schema.json#/$defs/'
WFD = R.WF + '#/$defs/'
INSPECT_ACTION = 'goal.cancel.inspect_current'
REASONS = {'pending': 'member_pending', 'missing': 'missing_original', 'source': 'source_unavailable', 'permission': 'permission_denied',
           'version': 'unsupported_version', 'contradictory': 'contradictory_original', 'installation': 'installation_unavailable'}


def key_of(prefix, scope, operation_id):
    return prefix + ':' + scoped_key(scope) + ':' + operation_id.encode().hex()


class Inspector(WorldOwner):
    """TEST_ONLY private inspector of one Storage (qualified boundary, no public API)."""
    role = 'goal_cancel_inspector'

    def __init__(self, world, **kw):
        super().__init__(world, **kw)
        self.last_code = None
        self.actor_ref = uid('TEST_ONLY:inspector')
        self.decisions = {}

    def grant(self, scope):
        _, decision = self.world.permissions.grant(self.actor_ref, copy.deepcopy(scope), INSPECT_ACTION)
        self.decisions[scoped_key(scope)] = decision
        return decision

    def check(self, realm, ref, value):
        self.world.roots.check(realm, ref, value)
        return exact_numbers(value, 'inspect')

    # ------------------------------------------------------------------ boundary helpers
    def passive(self, fn, result_ref, realm):
        """Run one inspection; refusals become a typed UnavailableRead; nothing may change."""
        st = self.world.storage
        before = (st.cell_generation, len(st.events), getattr(self.world, 'index', None) and self.world.index.frontier and
                  self.world.index.frontier['publication_revision'])
        self.last_code = None
        try:
            result = fn()
        except (A.AdapterRefusal, S.StorageRefusal) as error:
            self.last_code = A.refusal_code(error)
            parts = self.last_code.split('/')
            seg = parts[2] if parts[0] == 'C4I' and len(parts) > 2 else ''
            reason = REASONS.get(re.split('[_:]', seg)[0], 'contradictory_original')
            result = dict(kind='unavailable', reason=reason, action_authority='none')
        after = (st.cell_generation, len(st.events), getattr(self.world, 'index', None) and self.world.index.frontier and
                 self.world.index.frontier['publication_revision'])
        require('C4I/passive', before == after)
        return self.check(realm, result_ref, result)

    def scope_of(self, value):
        return dict(storage_instance_id=value['storage_instance_id'], project_id=value['project_id'], thread_id=value['thread_id'],
                    goal_id=value['goal_id'])

    def permitted(self, scope, method):
        decision = self.decisions.get(scoped_key(scope))
        require('C4I/%s/permission' % method, decision is not None and self.world.permissions.allowed(decision, self.actor_ref, INSPECT_ACTION))

    # ------------------------------------------------------------------ lower source routes (independently callable)
    def read_source_audit(self, scope, operation_id, method='read_source_audit'):
        value = self.world.value('goal_cancel_source_audit', key_of('goal_cancel_source_audit', scope, operation_id))
        require('C4I/%s/missing' % method, value is not None)
        require('C4I/%s/contradictory' % method, value['record']['normalized_identity']['operation_id'] == operation_id
                and all(value['record'][k] == scope[k] for k in scope))
        binding = value['record']['original_execution_binding']
        require('C4I/%s/version' % method, binding['kind'] == 'no_bound_plan' and binding['active_run_ref'] is not None)
        return self.check('goal', R.GA + 'WorkflowSourceAudit', value)

    def read_stop_receipt(self, scope, operation_id, source, method='read_stop_receipt'):
        value = self.world.value('goal_cancel_stop_receipt', key_of('goal_cancel_stop_receipt', scope, operation_id))
        require('C4I/%s/missing' % method, value is not None)
        require('C4I/%s/contradictory' % method, value['record']['source_audit_sha256'] == row_sha(source)
                and value['record']['operation_id'] == operation_id)
        return self.check('goal', WFD + 'StorageStopReceipt', value)

    def read_cancellation_receipt(self, scope, operation_id, source, stop_receipt, method='read_cancellation_receipt'):
        value = self.world.value('goal_cancel_receipt', key_of('goal_cancel_receipt', scope, operation_id))
        require('C4I/%s/missing' % method, value is not None)
        require('C4I/%s/contradictory' % method, value['record']['source_audit_sha256'] == row_sha(source)
                and value['record']['stop_receipt_sha256'] == row_sha(stop_receipt)
                and value['record']['cancellation_id'] == source['record']['normalized_identity']['operation_id'])
        return self.check('goal', WFD + 'StorageCancellationReceipt', value)

    def read_progress_pair(self, selector, source, method='read_progress_pair'):
        scope, op = self.scope_of(selector), selector['operation_id']
        head = self.world.value('goal_cancel_progress', key_of('goal_cancel_progress', scope, op) + ':head')
        require('C4I/%s/missing' % method, head is not None)
        require('C4I/%s/version' % method, head['schema_id'] == 'pm.storage_value.goal_cancel_progress.v2')
        require('C4I/%s/source' % method, head['record']['progress_epoch'] == selector['progress_epoch'])
        epoch = self.world.value('goal_cancel_progress', selector['snapshot_key'])
        require('C4I/%s/missing_epoch' % method, epoch is not None)
        require('C4I/%s/contradictory' % method, selector['snapshot_key'] == key_of('goal_cancel_progress', scope, op) + ':epoch:%d' % selector['progress_epoch']
                and head['record']['snapshot_sha256'] == row_sha(epoch) and epoch['record']['progress_epoch'] == selector['progress_epoch']
                and epoch['record']['source_audit_sha256'] == row_sha(source))
        require('C4I/%s/pending' % method, epoch['record']['phase'] in ('event_ready', 'event_unknown', 'event_issued', 'control_published'))
        pair = dict(current_head=head, current_selected_epoch=epoch)
        require('C4I/%s/version_settlement' % method, epoch['record']['owner_settlement']['kind'] == 'workflow_settled')
        return self.check('goal_current_inspection', CI + 'CurrentInspectionProgressPairV1', pair)

    def read_frozen_producer(self, pair, source, method='read_frozen_producer'):
        producer = pair['current_selected_epoch']['record']['producer_input']
        require('C4I/%s/missing' % method, producer is not None)
        metadata = source['record']['producer_metadata']
        require('C4I/%s/contradictory' % method, all(producer[k] == metadata[k] for k in metadata if k != 'payload'))
        return self.check('goal', WFD + 'ProducerInput', copy.deepcopy(producer))

    # ------------------------------------------------------------------ read_original_inspection_custody.v1
    def custody(self, request, method='read_original_inspection_custody'):
        self.check('goal_current_inspection', CI + 'OriginalInspectionCustodyReadRequestV1', request)
        selector = request['progress_selector']
        scope, op = self.scope_of(selector), selector['operation_id']
        self.permitted(scope, method)
        entry_fence = self.fence(scope, op)
        source = self.read_source_audit(scope, op)
        require('C4I/%s/source_after_source_audit' % method, self.fence(scope, op) == entry_fence)
        stop = self.read_stop_receipt(scope, op, source)
        require('C4I/%s/source_after_stop_receipt' % method, self.fence(scope, op) == entry_fence)
        receipt = self.read_cancellation_receipt(scope, op, source, stop)
        require('C4I/%s/source_after_receipt' % method, self.fence(scope, op) == entry_fence)
        pair = self.read_progress_pair(selector, source)
        require('C4I/%s/source_after_progress' % method, self.fence(scope, op) == entry_fence)
        require('C4I/%s/contradictory_receipt_progress' % method, pair['current_selected_epoch']['record']['cancellation_receipt'] == receipt['record']
                and pair['current_selected_epoch']['record']['stop_receipt'] == stop['record'])
        producer = self.read_frozen_producer(pair, source)
        require('C4I/%s/source_after_producer' % method, self.fence(scope, op) == entry_fence)
        require('C4I/%s/contradictory_event' % method, producer['event_id'] == request['event_id'])
        custody = dict(selection=copy.deepcopy(request), source_audit=source, stop_receipt=stop, cancellation_receipt=receipt,
                       current_progress=pair, frozen_producer=producer)
        self.check('goal_current_inspection', CI + 'OriginalInspectionCustodyReadEntryV1', dict(request=request, actual_custody=custody))
        # final predicate: every member re-read now and equal; no helper between it and the release
        self.permitted(scope, method)
        require('C4I/%s/source_final' % method, self.fence(scope, op) == entry_fence)
        return custody

    def fence(self, scope, op):
        w = self.world
        return A.observation_digest([w.cell('goal_cancel_source_audit', key_of('goal_cancel_source_audit', scope, op)),
                                     w.cell('goal_cancel_stop_receipt', key_of('goal_cancel_stop_receipt', scope, op)),
                                     w.cell('goal_cancel_receipt', key_of('goal_cancel_receipt', scope, op)),
                                     w.cell('goal_cancel_progress', key_of('goal_cancel_progress', scope, op) + ':head')])

    def read_original_inspection_custody(self, request):
        def run():
            return dict(kind='original_inspection_custody', custody=self.custody(request), action_authority='none')
        return self.passive(run, CI + 'OriginalInspectionCustodyReadResultV1', 'goal_current_inspection')

    # ------------------------------------------------------------------ current event source and inspect_current_event.v2
    def current_event_source(self, route, event_id, method='current_event_source'):
        """OriginalGoalAppendReadback re-read now (Storage custody, index owner, seglog owner)."""
        w = self.world
        require('C4I/%s/pending' % method, event_id in w.storage.events)
        try:
            return route.append_readback(event_id, 'inspect')
        except (A.AdapterRefusal, S.StorageRefusal) as error:
            raise Refusal('C4I/%s/source:%s' % (method, A.refusal_code(error)))

    def inspect_current_event_v2(self, route, request):
        w = self.world

        def run():
            method = 'inspect_current_event'
            self.check('goal', WFD + 'EventInspectRequest', request)
            scope = self.scope_of(request)
            op = self.operation_for(scope, request['event_id'])
            selector = dict(scope, operation_id=op['operation_id'], progress_epoch=op['progress_epoch'], snapshot_key=op['snapshot_key'])
            custody = self.custody(dict(event_id=request['event_id'], progress_selector=selector), method)
            phase = custody['current_progress']['current_selected_epoch']['record']['phase']
            require('C4I/%s/pending' % method, phase in ('event_issued', 'control_published'))
            # the presented read token must be the index owner's current token (the snapshot id is transient)
            try:
                token = w.index.verify_token(request['read_token'])
            except A.AdapterRefusal as error:
                raise Refusal('C4I/%s/source:%s' % (method, A.refusal_code(error)))
            source = self.current_event_source(route, request['event_id'])
            row = source['actual_index_row']
            require('C4I/%s/source_index_key' % method, request['event_index_key'] == w.index.row_key(token['generation_id'], row['sequence_id']))
            event = source['event']
            require('C4I/%s/contradictory_sequence' % method, request['sequence_id'] == event['sequence_id'] == row['sequence_id']
                    == source['original_custody']['first_append_receipt']['sequence_id'])
            require('C4I/%s/contradictory_producer' % method, same(S.producer25(event), custody['frozen_producer']))
            publication = custody['current_progress']['current_selected_epoch']['record']['publication']
            require('C4I/%s/contradictory_publication' % method, same(publication, source['publication']))
            require('C4I/%s/contradictory_assignment' % method, source['original_assignment']['record']['original_event_id'] == event['event_id']
                    and source['original_assignment']['record']['actual_late_reservation']['reserved_sequence_id'] == event['sequence_id'])
            self.check('goal_current_inspection', CI + 'InspectCurrentEventEntryV2', dict(request=request, actual_custody=custody,
                                                                                        actual_current_event_source=source))
            # outer final disclosure: repeat the whole predicate under the same held boundary
            self.permitted(scope, method)
            require('C4I/%s/source_final_token' % method, w.index.verify_token(request['read_token'])['frontier_revision'] == token['frontier_revision'])
            return dict(kind='original_cancellation_event', event_id=event['event_id'], sequence_id=event['sequence_id'],
                        payload_version=event['payload']['schema_version'], project_id=event['project_id'], thread_id=event['thread_id'],
                        goal_id=event['payload']['goal_id'], revision=event['payload']['revision'], occurred_at_utc=event['occurred_at_utc'],
                        action_authority='none')
        return self.passive(run, WFD + 'EventInspectResult', 'goal')

    def operation_for(self, scope, event_id):
        """The accepted operation whose frozen producer names ``event_id`` (current head of its v2 progress)."""
        w = self.world
        prefix = 'goal_cancel_progress:' + scoped_key(scope) + ':'
        for key, cell in sorted(w.storage.cells.get('goal_cancel_progress', {}).items()):
            if key.startswith(prefix) and key.endswith(':head'):
                op = bytes.fromhex(key[len(prefix):-len(':head')]).decode()
                epoch = cell['value']['record']['progress_epoch']
                snap = key[:-len(':head')] + ':epoch:%d' % epoch
                stored = w.value('goal_cancel_progress', snap)
                producer = stored and stored['record'].get('producer_input')
                if producer and producer['event_id'] == event_id:
                    return dict(operation_id=op, progress_epoch=epoch, snapshot_key=snap)
        raise Refusal('C4I/inspect_current_event/missing_operation')

    def inspect_current_event_v1(self, request):
        """The frozen original v1 inspector lineage: not installed for the Workflow V3 profile."""
        def run():
            self.check('goal', WFD + 'EventInspectRequest', request)
            raise Refusal('C4I/inspect_current_event_v1/installation')
        return self.passive(run, WFD + 'EventInspectResult', 'goal')

    # ------------------------------------------------------------------ row 10: C1/C2 edition (CANCEL custody)
    def inspect_current(self, route, request):
        w = self.world

        def run():
            method = 'inspect_current'
            self.check('producer', CANCEL + '#/$defs/EventInspectRequest', request)
            scope = self.scope_of(request)
            self.permitted(scope, method)
            op = route.operation_id
            head = w.value('goal_cancel_progress', key_of('goal_cancel_progress', scope, op) + ':head')
            require('C4I/%s/missing' % method, head is not None)
            epoch = w.value('goal_cancel_progress', key_of('goal_cancel_progress', scope, op) + ':epoch:%d' % head['record']['progress_epoch'])
            require('C4I/%s/contradictory_head' % method, epoch is not None and head['record']['snapshot_sha256'] == row_sha(epoch))
            record = epoch['record']
            producer = record['producer_input']
            require('C4I/%s/pending' % method, producer is not None and record['phase'] in ('event_issued', 'control_published')
                    and request['event_id'] in w.storage.events)
            require('C4I/%s/contradictory_event' % method, producer['event_id'] == request['event_id'])
            try:
                token = w.index.verify_token(request['read_token'])
                row = w.index.row(request['event_id'])
            except A.AdapterRefusal as error:
                raise Refusal('C4I/%s/source:%s' % (method, A.refusal_code(error)))
            require('C4I/%s/source_index_key' % method, request['event_index_key'] == w.index.row_key(token['generation_id'], row['sequence_id']))
            try:
                event = w.storage.read_event(request['event_id'])
            except S.StorageRefusal as error:
                raise Refusal('C4I/%s/source:%s' % (method, A.refusal_code(error)))
            custody = w.storage.first_custody(request['event_id'])
            require('C4I/%s/contradictory_sequence' % method, request['sequence_id'] == event['sequence_id'] == row['sequence_id']
                    == custody['first_append_receipt']['sequence_id'] == record['publication']['first_append_receipt']['sequence_id'])
            require('C4I/%s/contradictory_producer' % method, same(S.producer25(event), producer)
                    and custody['producer_semantic_digest'] == row['producer_semantic_digest'])
            self.permitted(scope, method)
            return dict(kind='original_cancellation_event', event_id=event['event_id'], sequence_id=event['sequence_id'],
                        payload_version=event['payload']['schema_version'], project_id=event['project_id'], thread_id=event['thread_id'],
                        goal_id=event['payload']['goal_id'], revision=event['payload']['revision'], occurred_at_utc=event['occurred_at_utc'],
                        action_authority='none')
        return self.passive(run, CANCEL + '#/$defs/EventInspectResult', 'producer')


def request_for(world, route, *, event_id=None, token=None):
    """The inspector's request for the route's Goal Event, with the index owner's current token."""
    producer = route.progress['producer_input'] or route.expected_producer()
    event_id = event_id or producer['event_id']
    info = world.storage.events.get(event_id)
    token = token or world.index.read_token()
    seq = info['sequence_id'] if info else 0
    return dict(reader_binding='storage.goal_cancelled.inspect_current.v1', storage_instance_id=world.storage_id,
                project_id=route.scope['project_id'], thread_id=route.scope['thread_id'], goal_id=route.scope['goal_id'], event_id=event_id,
                sequence_id=seq, event_index_key=world.index.row_key(token['generation_id'], seq), read_token=token)


def custody_request(route):
    return dict(event_id=route.progress['producer_input']['event_id'], progress_selector=route._selector())
