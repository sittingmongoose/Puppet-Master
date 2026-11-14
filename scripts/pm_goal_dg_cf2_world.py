#!/usr/bin/env python3
"""DG-CF2 TEST_ONLY certified coordinator world on the shared owner adapters.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Lane DG-CF2 (stream E, 2026-11-11) composes, for `goal_run.certified`, the
original coordinator path that CF-06, CF-07, CF-08, CF-09 and P7 need:

* fresh birth (B1, prerequisite only: CF-05 belongs to DG-CF1) coissuing the
  native Workflow birth, compact Birth and empty Control in one Storage
  transaction;
* the durable Standard capture (Phase 0), I0/I1 identity and producer
  preparation through the adapter's CF-01 demonstration owners (imported,
  never edited);
* prepare and arm (Phase 1/2) with the compact Intent and armed Control;
* append_held (Phase 3) split into F5a pre-append admission, F5b frame and
  CURRENT/manifest barriers, F5c all-member first custody over the actual
  durable group (including an unrelated scope's member) and F5d EventPhase
  plus the held return;
* commit_native (Phase 4): native body/control, Standard result/origin, D01
  update/head/origin and compact Commit/Origin/Control in ONE Storage
  transaction of the native database instance;
* readback (Phase 5), release (Phase 6), coordinator read_current, passive
  recover_original/read_retained (R1-R3) and the guard reader
  owner.storage.certified_event.read_guard.v1 (Q1-Q4).

Every value is issued by a registered TEST_ONLY owner from its own execution;
Storage assigns sequences, times, transaction ids and seeds. Every compact
coordinator record is validated against its whole root in the coordinator
package's isolated `coordinator` realm (pm_goal_own_c3_w5_oracles realm bank,
read-only). The native Workflow, D01, Standard and Goal participants here are
compact TEST_ONLY owner records: the whole native-realm roots
(OriginalCertificationSource, PublishedWorkflow, CertificationCandidateResult)
are composed by CF-02/CF-03 owners (DG-CF1) and are listed as a merge item,
not claimed here.
"""
from __future__ import annotations

import base64
import copy
import hashlib
import json
import os
from pathlib import Path

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as GS
import pm_goal_test_demo_cf01 as D
import pm_goal_dg_cf2_native as N

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
ROOT = NR.ROOT
COORD = 'https://puppetmaster.local/proposals/goal_certified_event_coordinator.v1.schema.json#/$defs/'
APPEND = 'https://puppetmaster.local/proposals/goal_certified_event_append_phase.v1.schema.json#/$defs/'
EVENT_RECORD = 'https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json'
RC = 'https://puppetmaster.local/schemas/event_append_receipt_contracts/2.0.0#/$defs/'
PROFILE_PATH = 'Plans/goal_certified_event_coordinator_contracts/installed-profile.json'
PROFILE_DIGEST_PATH = 'Plans/goal_certified_event_coordinator_contracts/installed-profile-digest.txt'
FAMILIES = ('birth', 'control', 'intent', 'eventphase', 'commit', 'origin', 'release')
WRAPPER = {f: 'pm.storage_value.goal_certified_event_%s.v1' % f for f in FAMILIES}
WRAPPER_ROOT = dict(birth='StorageBirth', control='StorageControl', intent='StorageIntent',
                    eventphase='StorageEventPhase', commit='StorageCommit', origin='StorageOrigin',
                    release='StorageRelease')
RECORD_ROOT = dict(birth='Birth', control='Control', intent='Intent', eventphase='EventPhase', commit='Commit',
                   origin='Origin', release='Release')
NATIVE_BODY = N.T_BODY
NATIVE_CONTROL = N.T_CONTROL
NATIVE_BIRTH = N.T_BIRTH
GOAL_BODY = 'TEST_ONLY:goal_body'
GOAL_CONTROL = 'TEST_ONLY:goal_control'
PERMISSION = 'TEST_ONLY:disclosure_permission'
TX_ISSUANCE = 'TEST_ONLY:transaction_issuance'
LANE_CUTS = ('before_arm', 'after_arm', 'before_event_phase', 'after_event_phase', 'before_native_commit',
             'after_native_commit', 'before_release', 'after_release')
CRASH_EXIT = S.CRASH_EXIT
Refusal = A.AdapterRefusal
require = A.require


class LaneCrash(BaseException):
    def __init__(self, point):
        super().__init__(point)
        self.point = point


# ------------------------------------------------------------------ banks

_BANK = None


class RealmBank:
    """Whole roots in the coordinator package's isolated realms (read-only reuse)."""

    def __init__(self):
        from pm_goal_own_c3_w5_oracles import LOCATIONS, OriginalPrecondition
        from pm_goal_own_c3_w5_successor_oracles import ScopedInstances
        locations = json.loads(LOCATIONS.read_bytes())['whole_resource_locations']
        self.precondition = OriginalPrecondition('goal_certified_event_coordinator_contracts', locations)
        self.scoped = ScopedInstances(self.precondition)

    def errors(self, realm, root, value):
        return self.scoped.errors(realm, root, value)

    def validate(self, realm, root, value, code):
        errors = self.errors(realm, root, value)
        if errors:
            first = sorted(errors, key=lambda e: list(e.absolute_path))[0]
            raise Refusal(code + '/schema/' + '/'.join(str(p) for p in first.absolute_path))
        return value


def realm_bank():
    global _BANK
    if _BANK is None:
        _BANK = RealmBank()
    return _BANK


# ------------------------------------------------------------------ codecs

def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def mp(value, where='cf2/msgpack'):
    return A.canonical(value, where)


def sj(value):
    return D.source_json(value)


def hexk(text):
    require('key/utf8', type(text) is str and text != '')
    return text.encode('utf-8', 'strict').hex()


def family_key(family, scope, operation_id=None):
    base = 'goal_certified_event_%s.v1:%s:%s' % (family, hexk(scope['project_id']), hexk(scope['goal_run_id']))
    if family in ('birth', 'control'):
        require('key/no_operation', operation_id is None)
        return base
    return base + ':' + hexk(operation_id)


def family_table(family):
    return 'goal_certified_event_%s.v1' % family


def selector(key, value):
    return dict(key=key, sha256=sha(mp(value)))


def wrap(family, record):
    return dict(schema_id=WRAPPER[family], schema_version='1.0.0', record=record)


def body_commitment(storage_instance_id, nk, body, control):
    """BodyIssuanceCommitment from the actual issued body/control values."""
    return dict(kind='historical_native_issuance_commitment',
                body=dict(storage_instance_id=storage_instance_id, family_id='workflow_goal_run_body', physical_key=nk,
                          schema_id='pm.storage_value.workflow_goal_run_body.v1', schema_version='1.0.0',
                          physical_value_sha256=sha(mp(body))),
                control=dict(storage_instance_id=storage_instance_id, family_id='workflow_goal_run_control',
                             physical_key=nk, schema_id='pm.storage_value.workflow_goal_run_control.v1',
                             schema_version='1.0.0', physical_value_sha256=sha(mp(control))),
                identity=copy.deepcopy(body['identity']), body_revision=body['body_revision'],
                activation_revision=body['activation_revision'], status=body['status'],
                activation_state=body['activation_state'], workflow_owner_ref=body['workflow_owner_ref'],
                workflow_owner_epoch=body['workflow_owner_epoch'])


def d01_key(scope, operation_id):
    return native_key(scope) + ':' + hexk(operation_id)


def _without_snapshot(source):
    return {k: v for k, v in source.items() if k != 'snapshot_id'}


def native_key(scope):
    return 'wf:' + S.k_component(scope['project_id']) + ':' + S.k_component(scope['goal_run_id'])


# ------------------------------------------------------------------ storage

class CF2Storage(S.TestOwnerStorage):
    """TEST_ONLY Storage with Storage-stamped transaction ids inside the write set."""

    def next_tx_id(self):
        return 'TEST_ONLY:tx:%s:%d' % (self.storage_instance_id, self.tx_counter + 1)

    def transact_stamped(self, build, *, writer):
        """One write set whose records carry this transaction's Storage-assigned id.

        The transaction also writes Storage's own issuance row (time and writer)
        for the guard reader's GuardOriginalIssue; it is part of the same write set.
        """
        tx_id = self.next_tx_id()
        issued_at = self.now()
        writes = build(tx_id) + [dict(table=TX_ISSUANCE, key=tx_id, expected=None,
                                      value=dict(qualification=QUALIFICATION, transaction_id=tx_id,
                                                 issued_at_utc=issued_at, writer=copy.deepcopy(writer)))]
        tx = self.transact(writes)
        require('tx/stamp', tx['tx_id'] == tx_id)
        return tx

    def now(self):
        return self._tick()

    def cell_value(self, table, key):
        cell = self.cell(table, key)
        return None if cell is None else cell['value']


# ------------------------------------------------------------------ owners

class NativeWorkflowOwner(A.TestOwner):
    """Native Workflow body/control in the native database instance (TEST_ONLY)."""
    role = 'native'

    def __init__(self, registry, storage, **kw):
        super().__init__(registry, **kw)
        self.storage = storage

    def body(self, scope):
        return self.storage.cell(NATIVE_BODY, native_key(scope))

    def control(self, scope):
        return self.storage.cell(NATIVE_CONTROL, native_key(scope))

    def advance(self, world, scope, status, *, kind='progress', operation_id=None):
        """Pre-certification native publication (CF-03 owns the whole source chain)."""
        with self.recorder.call(self.owner_id, 'native_publish:' + kind, dict(status=status)):
            lin = N.current_lineage(self.storage, scope)
            require('native/unborn', lin is not None)
            require('native/terminal', lin['body']['value']['status'] not in ('certified', 'cancelled'))
            self._ops = getattr(self, '_ops', 0) + 1
            op = operation_id or 'TEST_ONLY:operation:native-%s-%d' % (kind, self._ops)
            after_body = dict(lin['body']['value'], status=status,
                              body_revision=NR.uint64(lin['body']['value']['body_revision'] + 1, 'native/revision'))
            after_control = dict(lin['control']['value'], control_revision=NR.uint64(
                lin['control']['value']['control_revision'] + 1, 'native/control_revision'))
            issued_at = self.storage.now()
            goal_sha = sha(sj(world.goal.current(scope['goal_id'])[0]))

            def build(tx_id):
                pub = N.publication(world, scope, kind=kind, op=op, tx=tx_id, issued_at=issued_at, lineage=lin,
                                    after_body=after_body, after_control=after_control,
                                    source_sha=sha(sj(dict(kind=kind, operation_id=op))), goal_sha=goal_sha)
                return pub['writes']
            return self.storage.transact_stamped(build, writer=dict(owner_id=self.owner_id, owner_epoch=self.owner_epoch,
                                                                    operation_id=op))

    def certification_source(self, scope, decision, values):
        """Issue the native certification source at the actual current revision."""
        body = self.body(scope)['value']
        record = copy.deepcopy(values['native'])
        record.update(goal_run_id=scope['goal_run_id'], goal_id=scope['goal_id'], project_id=scope['project_id'],
                      work_graph_id=scope['work_graph_id'], status=body['status'], revision=body['body_revision'],
                      final_certifier_decision=decision)
        return self.issue(None, record, kind='native_certification_source')


class GoalOwner(A.TestOwner):
    """Goal body/control/Stop/binding in its own store (separate from native)."""
    role = 'goal'

    def __init__(self, registry, store, **kw):
        super().__init__(registry, **kw)
        self.store = store

    def key(self, goal_id):
        return 'goal:' + S.k_component(goal_id)

    def seed(self, values):
        goal = values['goal']
        self.store.transact([
            dict(table=GOAL_BODY, key=self.key(goal['goal_id']), expected=None, value=dict(goal)),
            dict(table=GOAL_CONTROL, key=self.key(goal['goal_id']), expected=None,
                 value=dict(qualification=QUALIFICATION, goal_id=goal['goal_id'], stop_state='none', stop_epoch=0,
                            binding_epoch=1, bound_goal_run_id=values['run']))])

    def current(self, goal_id):
        body = self.store.cell_value(GOAL_BODY, self.key(goal_id))
        control = self.store.cell_value(GOAL_CONTROL, self.key(goal_id))
        require('goal/unavailable', body is not None and control is not None)
        return body, control

    def issue_current(self, goal_id):
        body, _ = self.current(goal_id)
        return self.issue(None, body, kind='current_goal')

    def edit(self, goal_id, **changes):
        cell = self.store.cell(GOAL_BODY, self.key(goal_id))
        return self.store.transact([dict(table=GOAL_BODY, key=self.key(goal_id), expected=cell['version'],
                                         value=dict(cell['value'], **changes))])

    def stop(self, goal_id):
        cell = self.store.cell(GOAL_CONTROL, self.key(goal_id))
        value = dict(cell['value'], stop_state='effective', stop_epoch=cell['value']['stop_epoch'] + 1)
        return self.store.transact([dict(table=GOAL_CONTROL, key=self.key(goal_id), expected=cell['version'],
                                         value=value)])


class PermissionOwner(A.TestOwner):
    """Current permission/availability/disclosure control (own store)."""
    role = 'permission'

    def __init__(self, registry, store, **kw):
        super().__init__(registry, **kw)
        self.store = store

    def grant(self, run):
        self.store.transact([dict(table=PERMISSION, key='perm:' + S.k_component(run), expected=None,
                                  value=dict(qualification=QUALIFICATION, goal_run_id=run, state='granted',
                                             epoch=1))])

    def revoke(self, run):
        cell = self.store.cell(PERMISSION, 'perm:' + S.k_component(run))
        self.store.transact([dict(table=PERMISSION, key='perm:' + S.k_component(run), expected=cell['version'],
                                  value=dict(cell['value'], state='revoked', epoch=cell['value']['epoch'] + 1))])

    def current(self, run):
        value = self.store.cell_value(PERMISSION, 'perm:' + S.k_component(run))
        require('permission/unavailable', value is not None)
        return value


class UnrelatedProducer(A.TestOwner):
    """Another scope's producer whose queued candidate shares the durable group."""
    role = 'unrelated_producer'

    def queue(self, tag):
        candidate = dict(
            schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
            event_id='TEST_ONLY:goal_test.unrelated:' + tag, event_type='goal_test.unrelated',
            project_id='TEST_ONLY-project-unrelated-' + tag, thread_id=None, run_id=None, node_id=None,
            attempt_id=None, actor_ref='TEST_ONLY:actor:unrelated', requested_account_ref=None,
            effective_account_ref=None, occurred_at_utc='2026-11-11T12:00:01Z', producer_sequence_id=None,
            correlation_id='TEST_ONLY:correlation:unrelated', causation_event_id=None, parent_event_id=None,
            idempotency_key='TEST_ONLY:unrelated:' + tag, payload_schema_id='TEST_ONLY:unrelated.v1',
            payload=dict(qualification=QUALIFICATION, tag=tag), payload_ref=None, redaction_profile='no_secrets',
            replay_policy='dedupe_by_idempotency_key',
            migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                           compatibility_event_type=None))
        return self.issue(None, candidate, kind='queued_candidate')


class GroupCommitOwner(A.TestOwner):
    """Storage's group batcher: one durable group from queued candidates."""
    role = 'group_commit'

    def __init__(self, registry, storage, **kw):
        super().__init__(registry, **kw)
        self.storage = storage
        self.queue = []

    def enqueue(self, owner_id, handle):
        self.queue.append((owner_id, handle))

    def reserve(self, operation_id, request):
        if self.storage.reservation_state(operation_id) is None:
            return self.storage.reserve(operation_id, request)
        handle, _ = self.storage.resume(operation_id, request)
        return handle

    def queued(self):
        out = []
        for owner_id, handle in self.queue:
            out.append(A.acquire(self.registry, owner_id, 'unrelated_producer', handle)[1])
        return out


# ------------------------------------------------------------------ world

class World:
    """One TEST_ONLY execution of the certified coordinator path."""

    def __init__(self, work, *, faults=None, lane_cut=None, lane_mode='raise', reopen=False, separate_d01=False):
        self.work = Path(work)
        self.bank = D.bank()
        self.realm = realm_bank()
        self.registry = A.OwnerRegistry()
        self.recorder = self.registry.recorder
        self.lane_cut, self.lane_mode = lane_cut, lane_mode
        opener = CF2Storage.open if reopen else CF2Storage.create
        self.storage = opener(self.work / 'storage', faults=faults or S.FaultPlan())
        self.goal_store = opener(self.work / 'goal-db')
        self.d01_store = opener(self.work / 'd01-db') if separate_d01 else self.storage
        for store in {id(s): s for s in (self.storage, self.goal_store, self.d01_store)}.values():
            self.recorder.observe('storage:' + store.storage_instance_id, store.observe)
        self.assignment = type('AssignmentOwner', (A.TestOwner,), {'role': 'assignment'})(self.registry)
        self.invocation = type('InvocationOwner', (A.TestOwner,), {'role': 'invocation'})(self.registry)
        self.causality = type('CausalityOwner', (A.TestOwner,), {'role': 'causality'})(self.registry)
        self.descriptor = type('DescriptorOwner', (A.TestOwner,), {'role': 'descriptor'})(self.registry)
        self.native = NativeWorkflowOwner(self.registry, self.storage)
        self.goal = GoalOwner(self.registry, self.goal_store)
        self.permission = PermissionOwner(self.registry, self.goal_store)
        self.partition = D.StoragePartitionOwner(self.registry, self.storage, bank=self.bank)
        self.standard = StandardCaptureOwner(self.registry, self.storage)
        self.identity = D.IdentityOwner(self.registry, self.storage)
        self.producer = D.Producer(self.registry)
        self.appender = A.AppendOwner(self.registry, self.storage)
        self.unrelated = UnrelatedProducer(self.registry)
        self.group = GroupCommitOwner(self.registry, self.storage)
        self.guard = GuardReader(self.registry, self)
        self.coordinator = Coordinator(self.registry, self)
        self.hooks = {}
        self.profile_sha = (ROOT / PROFILE_DIGEST_PATH).read_text().strip()

    def cut(self, point):
        if self.lane_cut == point:
            if self.lane_mode == 'exit':
                os._exit(CRASH_EXIT)
            raise LaneCrash(point)

    def hook(self, name, *args):
        fn = self.hooks.get(name)
        if fn is not None:
            return fn(self, *args)
        return None


# ------------------------------------------------------------------ guard (Q1-Q4)

class GuardReader(A.TestOwner):
    """owner.storage.certified_event.read_guard.v1: acquires its own source."""
    role = 'guard_reader'
    METHOD = 'owner.storage.certified_event.read_guard.v1'

    def __init__(self, registry, world, **kw):
        super().__init__(registry, **kw)
        self.world = world

    def store_source(self, scope, operation_id):
        """Q1: GuardStoreSource from the authenticated native database snapshot."""
        w = self.world
        snap = w.storage.snapshot()
        cells = snap['cells']
        run_prefixes = ['goal_certified_event_%s.v1:%s:%s' % (f, hexk(scope['project_id']), hexk(scope['goal_run_id']))
                        for f in FAMILIES]
        inventory = sorted(k for f in FAMILIES for k in cells.get(family_table(f), {})
                           if any(k == p or k.startswith(p + ':') for p in run_prefixes))
        rows, issuances = [], []
        selected = FAMILIES if operation_id is not None else ('birth', 'control')
        for family in selected:
            key = family_key(family, scope, None if family in ('birth', 'control') else operation_id)
            cell = cells.get(family_table(family), {}).get(key)
            if cell is None:
                rows.append(dict(key=key, state='absent', codec='messagepack_canonical', whole_bytes_base64=None,
                                 byte_count=0, whole_bytes_sha256=None, whole_value=None))
                continue
            raw = mp(cell['value'])
            rows.append(dict(key=key, state='present', codec='messagepack_canonical',
                             whole_bytes_base64=base64.b64encode(raw).decode('ascii'), byte_count=len(raw),
                             whole_bytes_sha256=sha(raw), whole_value=copy.deepcopy(cell['value'])))
            issue = cells.get(TX_ISSUANCE, {}).get(cell['tx'])
            if issue is None:
                continue  # no Storage issuance row: the derivation reports missing_origin
            issuances.append(dict(scope=copy.deepcopy(scope), key=key, value_sha256=sha(raw),
                                  actual_original_owner=copy.deepcopy(issue['value']['writer']),
                                  transaction_id=cell['tx'], original_issued_at_utc=issue['value']['issued_at_utc'],
                                  native_issuance_read_id='TEST_ONLY:issuance-read:' + snap['snapshot_id']))
        nb = cells.get(NATIVE_BIRTH, {}).get(native_key(scope))
        profile_raw = (ROOT / PROFILE_PATH).read_bytes()
        source = dict(scope=copy.deepcopy(scope), storage_instance_id=w.storage.storage_instance_id,
                      database_instance_id='TEST_ONLY:native-db:' + w.storage.storage_instance_id,
                      actual_reader_owner=dict(owner_id=self.owner_id, owner_epoch=self.owner_epoch,
                                               operation_id='TEST_ONLY:operation:guard-read'),
                      native_snapshot_read_id=snap['snapshot_id'],
                      snapshot_transaction_id='TEST_ONLY:snapshot-tx:%d' % snap['cell_generation'],
                      snapshot_generation=snap['cell_generation'], root_generation=snap['cell_generation'],
                      installed_descriptor_bytes_base64=base64.b64encode(profile_raw).decode('ascii'),
                      installed_descriptor_sha256=sha(profile_raw),
                      complete_run_family_prefixes=run_prefixes, complete_key_inventory=inventory, rows=rows,
                      original_issuances=issuances, native_run_birth_present=nb is not None,
                      native_run_birth_selection=None if nb is None else selector(native_key(scope), nb['value']))
        return source, snap['cell_generation']

    def read_guard(self, request, *, source_edit=None):
        """Q1-Q2 at the guard owner; returns the whole GuardReadResult."""
        w = self.world
        with self.recorder.call(self.owner_id, 'read_guard', request) as slot:
            w.realm.validate('coordinator', COORD + 'GuardReadRequest', request, 'guard/request')
            scope, op = request['scope'], request['operation_id']
            source, generation = self.store_source(scope, op)
            if source_edit:
                source = source_edit(source)
            result = self.derive(scope, op, source, generation)
            w.realm.validate('coordinator', COORD + 'GuardReadResult', result, 'guard/result')
            slot.set(result)
            return result

    def derive(self, scope, op, source, generation):
        w = self.world
        unavailable = lambda reason: dict(outcome='unavailable', reason=reason, action_authority='none')
        # Q1: rebuild the source independently and compare whole values (no caller replacement).
        fresh, fresh_generation = self.store_source(scope, op)
        if fresh_generation != generation:
            return unavailable('mixed_restore')
        for field in ('rows', 'complete_key_inventory', 'complete_run_family_prefixes', 'installed_descriptor_sha256',
                      'native_run_birth_present', 'native_run_birth_selection', 'snapshot_generation',
                      'storage_instance_id'):
            if not A.same(source[field], fresh[field]):
                return unavailable('source_changed')
        if source['installed_descriptor_sha256'] != sha((ROOT / PROFILE_PATH).read_bytes()):
            return unavailable('missing_profile')
        rows = {r['key']: r for r in source['rows']}
        values = {}
        selected = FAMILIES if op is not None else ('birth', 'control')
        for family in selected:
            key = family_key(family, scope, None if family in ('birth', 'control') else op)
            row = rows.get(key)
            if row is None:
                return unavailable('partial_authority')
            if row['state'] == 'present':
                raw = base64.b64decode(row['whole_bytes_base64'])
                if sha(raw) != row['whole_bytes_sha256'] or len(raw) != row['byte_count'] or raw != mp(row['whole_value']):
                    return unavailable('codec_unavailable')
                errors = w.realm.errors('coordinator', COORD + WRAPPER_ROOT[family], row['whole_value'])
                if errors:
                    return unavailable('schema_unavailable')
                issue = [i for i in source['original_issuances'] if i['key'] == key]
                if len(issue) != 1 or issue[0]['value_sha256'] != row['whole_bytes_sha256']:
                    return unavailable('missing_origin')
                if not A.same(issue[0], next(i for i in fresh['original_issuances'] if i['key'] == key) | dict(
                        native_issuance_read_id=issue[0]['native_issuance_read_id'])):
                    return unavailable('missing_origin')
                values[family] = row['whole_value']
        present = set(values)
        if not source['native_run_birth_present']:
            if present or source['complete_key_inventory']:
                return unavailable('partial_authority')
            return dict(outcome='authentic_unborn_absence', source=source, action_authority='none')
        if 'birth' not in present or 'control' not in present:
            return unavailable('missing_control')
        if op is None and values['control']['record']['phase'] != 'empty':
            return unavailable('missing_source')
        control = values['control']['record']
        birth_sel = selector(family_key('birth', scope), values['birth'])
        if not A.same(control['birth'], birth_sel):
            return unavailable('partial_authority')
        if not A.same(values['birth']['record']['original_native_birth'], source['native_run_birth_selection']):
            return unavailable('partial_authority')
        phase = control['phase']
        expected = dict(empty=set(), armed={'intent'}, event_durable={'intent', 'eventphase'},
                        native_committed={'intent', 'eventphase', 'commit', 'origin'},
                        released={'intent', 'eventphase', 'commit', 'origin', 'release'})[phase]
        if present - {'birth', 'control'} != expected:
            return unavailable('partial_authority')
        names = dict(intent='intent', eventphase='event_phase', commit='commit', origin='origin', release='release')
        for family, field in names.items():
            if op is None:
                break
            sel = control[field]
            if family in values:
                if not A.same(sel, selector(family_key(family, scope, op), values[family])):
                    return unavailable('partial_authority')
            elif sel is not None:
                return unavailable('partial_authority')
        if phase == 'empty':
            if control['epoch'] != 0:
                return unavailable('partial_authority')
            return dict(outcome='authentic_no_coordinator_operation', source=source, birth=values['birth'],
                        control=values['control'], action_authority='none')
        base = dict(source=source, birth=values['birth'], control=values['control'], intent=values['intent'],
                    event_phase=values.get('eventphase'), commit=values.get('commit'), origin=values.get('origin'),
                    action_authority='none')
        if phase == 'released':
            return dict(outcome='authentic_released', release=values['release'], **base)
        return dict(outcome='authentic_pending', release=None, **base)


def guard_request(world, scope, op, purpose, request_id):
    return dict(scope=copy.deepcopy(scope), request_id=request_id, operation_id=op, purpose=purpose,
                installed_profile_sha256=world.profile_sha)


# ------------------------------------------------------------------ coordinator

class Coordinator(A.TestOwner):
    """The coordinator adapter; it never replaces the original issuers."""
    role = 'coordinator'

    def __init__(self, registry, world, **kw):
        super().__init__(registry, **kw)
        self.world = world

    # -- shared acquisitions -------------------------------------------
    def owner_ref(self, op):
        return dict(owner_id=self.owner_id, owner_epoch=self.owner_epoch, operation_id=op)

    def compact(self, family, scope, op=None):
        key = family_key(family, scope, None if family in ('birth', 'control') else op)
        return key, self.world.storage.cell(family_table(family), key)

    def acquire_guard(self, ctx, purpose, *, stage):
        """Q3: each participant acquires its own guard; never a reusable token."""
        w = self.world
        override = w.hook('guard:' + stage, ctx)
        if override is not None:
            return override
        req = guard_request(w, ctx['scope'], ctx['op'], purpose, 'TEST_ONLY:guard-request:%s:%s' % (stage, ctx['op']))
        return w.guard.read_guard(req)

    def check_guard(self, ctx, guard, allowed, *, stage):
        require(stage + '/guard_type', type(guard) is dict)
        w = self.world
        w.realm.validate('coordinator', COORD + 'GuardReadResult', guard, stage + '/guard')
        require(stage + '/guard_unavailable', guard['outcome'] != 'unavailable')
        source = guard['source']
        require(stage + '/guard_scope', A.same(source['scope'], ctx['scope']))
        require(stage + '/guard_reader', source['actual_reader_owner']['owner_id'] == w.guard.owner_id)
        require(stage + '/guard_outcome', guard['outcome'] in allowed)
        fresh, generation = w.guard.store_source(ctx['scope'], ctx['op'])
        require(stage + '/guard_stale', source['snapshot_generation'] == generation and
                A.same(source['rows'], fresh['rows']))
        return guard

    def current_sources(self, ctx, *, stage):
        """F2: current Goal/Stop/permission and native preimage at this boundary."""
        w = self.world
        goal_body, goal_control = w.goal.current(ctx['values']['goal']['goal_id'])
        require(stage + '/goal_current', A.same(goal_body, ctx['goal']))
        require(stage + '/effective_stop', goal_control['stop_state'] == 'none')
        require(stage + '/goal_binding', goal_control['bound_goal_run_id'] == ctx['scope']['goal_run_id'])
        permission = w.permission.current(ctx['scope']['goal_run_id'])
        require(stage + '/permission', permission['state'] == 'granted')
        return dict(goal=goal_body, goal_control=goal_control, permission=permission)

    def native_preimage(self, ctx, *, stage):
        """Current native body/control and the D01 head the current pointer selects."""
        lin = N.current_lineage(self.world.storage, ctx['scope'])
        require(stage + '/native_unavailable', lin is not None and lin['body'] is not None and
                lin['control'] is not None and lin['head'] is not None)
        head = dict(lin['head'], key=lin['head_key'], pointer=lin['pointer'])
        return lin['body'], lin['control'], head

    def source_commitments(self, ctx):
        s = ctx['src']
        return dict(original_certification_source_sha256=sha(sj(s['native'])),
                    whole_goal_argument_sha256=sha(sj(ctx['goal'])),
                    whole_standard_durable_read_sha256=sha(sj(s['standard'])),
                    whole_producer_source_sha256=sha(sj(ctx['producer_source'])),
                    whole_identity_input_sha256=ctx['identity']['whole_input_sha256'],
                    whole_identity_result_sha256=sha(sj(ctx['identity'])))

    def native_candidate(self, ctx, body, control):
        """Whole native candidate (compact TEST_ONLY; CertificationCandidateResult is CF-03's root)."""
        b = body['value']
        after = dict(b, status='certified', body_revision=NR.uint64(b['body_revision'] + 1, 'native/after'),
                     certification_receipt=ctx['src']['standard']['receipt_ref'])
        after_control = dict(control['value'], control_revision=NR.uint64(control['value']['control_revision'] + 1,
                                                                          'native/after_control'))
        return dict(qualification=QUALIFICATION, goal_run_id=b['goal_run_id'], from_status=b['status'],
                    to_status='certified', before_body=copy.deepcopy(b), after_body=after,
                    before_control=copy.deepcopy(control['value']), after_control=after_control,
                    certification_receipt_ref=ctx['src']['standard']['receipt_ref'],
                    final_certifier_decision=ctx['src']['native']['final_certifier_decision'])

    def derive_intent(self, ctx, tx_id):
        w = self.world
        body, control, head = self.native_preimage(ctx, stage='intent')
        identity, p25 = ctx['identity'], ctx['producer25']
        candidate = self.native_candidate(ctx, body, control)
        birth_key, birth = self.compact('birth', ctx['scope'])
        require('intent/birth_unavailable', birth is not None)
        origin_key = N.capture_key(ctx['scope'])
        origin = w.storage.cell(N.T_CAPTURE, origin_key)
        require('intent/standard_origin', origin is not None)
        intent = dict(
            scope=copy.deepcopy(ctx['scope']), owner=self.owner_ref(ctx['op']), installed_profile_sha256=w.profile_sha,
            original_birth=selector(birth_key, birth['value']),
            clocks=dict(expected_goal_run_revision=identity['input']['expected_goal_run_revision'],
                        goal_run_revision=identity['input']['goal_run_revision'],
                        expected_workflow_control_revision=control['value']['control_revision'],
                        workflow_control_revision=control['value']['control_revision'] + 1,
                        observed_goal_revision=ctx['goal']['goal_revision'],
                        whole_unchanged_goal_argument_sha256=sha(sj(ctx['goal']))),
            source_commitments=self.source_commitments(ctx),
            candidate_commitments=dict(whole_producer25_sha256=sha(sj(p25)),
                                       whole_native_candidate_sha256=sha(sj(candidate)),
                                       producer_semantic_digest=NR.producer_digest(p25, 'intent/producer_digest')),
            event_id=identity['event_id'], idempotency_key=identity['idempotency_key'],
            certification_receipt_ref=ctx['src']['standard']['receipt_ref'],
            standard_capture_origin=selector(origin_key, origin['value']),
            native_before_body=selector(native_key(ctx['scope']), body['value']),
            native_before_control=selector(native_key(ctx['scope']), control['value']),
            native_before_head=selector(head['key'], head['value']),
            original_occurred_at_utc=p25['occurred_at_utc'], transaction_id=tx_id)
        w.realm.validate('coordinator', COORD + 'Intent', intent, 'intent')
        return intent, candidate

    # -- Phase 1: prepare ------------------------------------------------
    def prepare(self, ctx):
        w = self.world
        with self.recorder.call(self.owner_id, 'owner.workflow.certified_event.prepare.v1', dict(op=ctx['op'])) as slot:
            guard = self.check_guard(ctx, self.acquire_guard(ctx, 'original_certification', stage='prepare'),
                                     ('authentic_no_coordinator_operation',), stage='prepare')
            self.current_sources(ctx, stage='prepare')
            body, control, _ = self.native_preimage(ctx, stage='prepare')
            require('prepare/native_status', body['value']['status'] in ('verifying', 'provisional_success'))
            require('prepare/native_revision', body['value']['body_revision'] ==
                    ctx['identity']['input']['expected_goal_run_revision'])
            intent, candidate = self.derive_intent(ctx, 'TEST_ONLY:candidate-transaction:unissued')
            prepared = dict(outcome='prepared', intent=intent, intent_sha256=sha(mp(intent)), action_authority='none')
            w.realm.validate('coordinator', COORD + 'Prepared', prepared, 'prepare/result')
            ctx['native_candidate'] = candidate
            ctx['guards']['prepare'] = guard
            slot.set(prepared)
            return prepared

    # -- Phase 2: arm ----------------------------------------------------
    def arm(self, ctx, prepared):
        w = self.world
        with self.recorder.call(self.owner_id, 'owner.storage.certified_event.arm.v1', dict(op=ctx['op'])) as slot:
            req = ctx['request']
            w.realm.validate('coordinator', COORD + 'Request', req, 'arm/request')
            require('arm/request_scope', A.same(req['scope'], ctx['scope']))
            require('arm/installed_profile', req['installed_profile_sha256'] == w.profile_sha)
            guard = self.check_guard(ctx, self.acquire_guard(ctx, 'original_certification', stage='arm'),
                                     ('authentic_no_coordinator_operation',), stage='arm')
            control_key, control = self.compact('control', ctx['scope'])
            require('arm/control_epoch', control['value']['record']['epoch'] == req['expected_control_epoch'])
            require('arm/control_not_empty', control['value']['record']['phase'] == 'empty')
            self.current_sources(ctx, stage='arm')
            w.hook('after_helper:arm', ctx)
            intent_key = family_key('intent', ctx['scope'], ctx['op'])

            def build(tx_id):
                intent, candidate = self.derive_intent(ctx, tx_id)
                cand = copy.deepcopy(prepared['intent'])
                cand['transaction_id'] = tx_id
                require('arm/prepared_intent', A.same(cand, intent))
                require('arm/native_candidate', A.same(candidate, ctx['native_candidate']))
                stored_intent = wrap('intent', intent)
                new_control = dict(control['value']['record'], epoch=control['value']['record']['epoch'] + 1,
                                   phase='armed', intent=selector(intent_key, stored_intent))
                stored_control = wrap('control', new_control)
                for fam, value in (('intent', stored_intent), ('control', stored_control)):
                    w.realm.validate('coordinator', COORD + WRAPPER_ROOT[fam], value, 'arm/' + fam)
                # final predicate after the last helper (F0/F1-F4), immediately before the effect
                self.current_sources(ctx, stage='arm_final')
                fresh = self.compact('control', ctx['scope'])[1]
                require('arm/control_changed', fresh['version'] == control['version'])
                ctx['stored_intent'], ctx['stored_control_armed'] = stored_intent, stored_control
                w.hook('arm_built', ctx)
                return [dict(table=family_table('intent'), key=intent_key, expected=None, value=stored_intent),
                        dict(table=family_table('control'), key=control_key, expected=control['version'],
                             value=stored_control)]
            w.cut('before_arm')
            tx = w.storage.transact_stamped(build, writer=self.owner_ref(ctx['op']))
            w.cut('after_arm')
            ctx['guards']['arm'] = guard
            slot.set(dict(tx=tx['tx_id']))
            return ctx['stored_intent'], ctx['stored_control_armed']

    # -- Phase 3: append_held (F5a-F5d) ----------------------------------
    def preappend_source(self, ctx):
        """complete_preappend_storage_source: the real current source before the new Event."""
        w = self.world
        src = w.storage.acquire_source()
        generic = GS.GenericSource(w.storage).acquire(src)
        return dict(qualification=QUALIFICATION, storage_instance_id=src['storage_instance_id'],
                    generic=dict(complete=generic.complete, defect=None if generic.defect is None else list(generic.defect),
                                 rows=len(generic.rows), coverage_sha256=generic.coverage_sha256,
                                 through_sequence_id=generic.rows[-1].sequence_id if generic.rows else None),
                    current_bytes_sha256=sha(src['current_raw']), manifest_bytes_sha256=sha(src['manifest_raw']),
                    segments=[dict(generation=s['generation'], name=s['name'], watermark=s['watermark'],
                                   bytes_sha256=sha(s['raw'])) for s in src['segments']],
                    custody_event_ids=sorted(src['custody']), token=src['token'],
                    dedupe_tail=dict(event_id_present=ctx['identity']['event_id'] in w.storage.events,
                                     scoped_present=w.storage.event_by_identity(
                                         ctx['scope']['scope_partition'], 'goal_run.certified',
                                         ctx['identity']['idempotency_key']) is not None))

    def f5a(self, ctx, intent, control, preappend):
        """F5a: genuine pre-append admission; no future receipt/barrier/custody is an input."""
        w = self.world
        stage = 'f5a'
        req = ctx['request']
        w.realm.validate('coordinator', COORD + 'Request', req, stage + '/request')
        require(stage + '/request_scope', A.same(req['scope'], ctx['scope']))
        require(stage + '/installed_profile', req['installed_profile_sha256'] == w.profile_sha)
        w.realm.validate('coordinator', COORD + 'StorageIntent', intent, stage + '/intent')
        w.realm.validate('coordinator', COORD + 'StorageControl', control, stage + '/control')
        ikey, icell = self.compact('intent', ctx['scope'], ctx['op'])
        require(stage + '/intent_unissued', icell is not None)
        require(stage + '/intent_bytes', mp(icell['value']) == mp(intent))
        ckey, ccell = self.compact('control', ctx['scope'])
        require(stage + '/control_bytes', mp(ccell['value']) == mp(control))
        rec = control['record']
        require(stage + '/control_phase', rec['phase'] == 'armed')
        require(stage + '/expected_control_epoch', rec['epoch'] == req['expected_control_epoch'] + 1)
        require(stage + '/control_intent', A.same(rec['intent'], selector(ikey, intent)))
        bkey, bcell = self.compact('birth', ctx['scope'])
        require(stage + '/birth', A.same(intent['record']['original_birth'], selector(bkey, bcell['value'])))
        i = intent['record']
        require(stage + '/source_commitments', A.same(i['source_commitments'], self.source_commitments(ctx)))
        p25 = ctx['producer25']
        for field in S.STORAGE_FIELDS:
            require(stage + '/storage_assigned_supplied', field not in p25)
        require(stage + '/replay_policy', p25.get('replay_policy') == 'dedupe_by_idempotency_key')
        require(stage + '/producer25', i['candidate_commitments']['whole_producer25_sha256'] == sha(sj(p25)))
        require(stage + '/producer_semantic_digest', i['candidate_commitments']['producer_semantic_digest'] ==
                NR.producer_digest(p25, stage + '/producer_digest'))
        require(stage + '/native_candidate', i['candidate_commitments']['whole_native_candidate_sha256'] ==
                sha(sj(ctx['native_candidate'])))
        require(stage + '/identity', p25['event_id'] == ctx['identity']['event_id'] == i['event_id'] and
                p25['idempotency_key'] == ctx['identity']['idempotency_key'] == i['idempotency_key'])
        self.current_sources(ctx, stage=stage)
        body, ncontrol, head = self.native_preimage(ctx, stage=stage)
        require(stage + '/native_current', A.same(i['native_before_body'], selector(native_key(ctx['scope']), body['value']))
                and A.same(i['native_before_control'], selector(native_key(ctx['scope']), ncontrol['value']))
                and A.same(i['native_before_head'], selector(head['key'], head['value'])))
        # The presented pre-append source must equal Storage's own current source now.
        fresh = self.preappend_source(ctx)
        require(stage + '/preappend_source', A.same(_without_snapshot(preappend), _without_snapshot(fresh)))
        require(stage + '/generic_prefix', fresh['generic']['complete'] is True)
        # No receipt, frame, barrier, custody or EventPhase for this operation exists yet.
        require(stage + '/future_receipt', not preappend['dedupe_tail']['event_id_present'] and
                not preappend['dedupe_tail']['scoped_present'] and
                ctx['identity']['event_id'] not in preappend['custody_event_ids'])
        epkey, epcell = self.compact('eventphase', ctx['scope'], ctx['op'])
        require(stage + '/future_event_phase', epcell is None)
        require(stage + '/future_inputs', not any(k in ctx.get('presented', {}) for k in
                                                  ('first_custody', 'append_receipt', 'event_phase',
                                                   'original_event_prerequisite')))
        res = w.storage.reservation_state(ctx['op'])
        require(stage + '/append_attempted', res is None)
        return fresh

    def append_held(self, ctx, intent, control):
        w = self.world
        with self.recorder.call(self.owner_id, 'owner.storage.certified_event.append_held.v1',
                                dict(op=ctx['op'])) as slot:
            # Exact retry of this original operation: read original results only.
            epkey, epcell = self.compact('eventphase', ctx['scope'], ctx['op'])
            if epcell is not None:
                result = self.held_retry(ctx, intent, control)
                slot.set(result)
                return result
            guard = self.check_guard(ctx, self.acquire_guard(ctx, 'original_certification', stage='append'),
                                     ('authentic_pending',), stage='append')
            require('append/guard_phase', guard['control']['record']['phase'] == 'armed')
            preappend = ctx.get('presented_preappend') or self.preappend_source(ctx)
            w.hook('preappend', ctx)
            self.f5a(ctx, intent, control, preappend)
            # ---- F5b: the original append writer reruns F5a after its last helper, then writes.
            w.hook('after_helper:f5a', ctx)
            self.f5a(ctx, intent, control, preappend)
            request = dict(kind='TEST_ONLY:goal_run.certified.append_held', operation_id=ctx['op'],
                           event_id=ctx['identity']['event_id'], intent_sha256=sha(mp(intent)))
            handle = w.group.reserve(ctx['op'], request)
            candidates = [copy.deepcopy(ctx['producer25'])] + w.group.queued()
            w.hook('candidates', ctx, candidates)
            outcome = w.storage.append(handle, candidates, durability_class=w.hook('durability', ctx) or 'barrier')
            require('f5b/appended', outcome['status'] == 'appended')
            w.hook('after_append', ctx)
            barrier = self.f5b_readback(ctx, preappend, candidates)
            # ---- F5c: original all-member first custody, only after both barriers.
            w.hook('before_custody', ctx)
            receipts = w.storage.issue_first_receipt(handle)
            receipts = w.hook('receipts', ctx, receipts) or receipts
            evidence = self.f5c_readback(ctx, barrier, receipts)
            w.hook('evidence', ctx, evidence)
            # ---- F5d: compact EventPhase/event_durable Control after authentic readback.
            appended = self.f5d(ctx, intent, control, evidence, barrier)
            ctx['guards']['append'] = guard
            slot.set(appended)
            return appended

    def f5b_readback(self, ctx, preappend, candidates):
        w = self.world
        stage = 'f5b'
        group = w.storage.active_durable_group(ctx['identity']['event_id'])
        ids = [c['event_id'] for c in candidates]
        require(stage + '/group_members', [m['event_id'] for m in group['members']] == ids)
        for member in group['members']:
            raw = w.storage.read_frame(member['event_id'])
            require(stage + '/frame_sha256', sha(raw) == member['frame_sha256'] and len(raw) == member['frame_length'])
            event = w.storage.read_event(member['event_id'])
            require(stage + '/frame_value', A.same(S.producer25(event),
                                                   next(c for c in candidates if c['event_id'] == member['event_id'])))
        post = self.preappend_source(ctx)
        # The current source after the owned publication equals the derived postimage.
        require(stage + '/manifest_postimage', post['current_bytes_sha256'] != preappend['current_bytes_sha256'] and
                post['token']['frontier_revision'] == preappend['token']['frontier_revision'] + 1)
        before = {s['generation']: s for s in preappend['segments']}
        gen = group['segment_generation']
        others_same = all(A.same(s, before.get(s['generation'])) for s in post['segments'] if s['generation'] != gen)
        start = before[gen]['watermark'] if gen in before else 0
        require(stage + '/own_changes_only', others_same and group['durable_start_offset'] == start and
                post['custody_event_ids'] == preappend['custody_event_ids'])
        return dict(group=group, post=post)

    def f5c_readback(self, ctx, barrier, receipts):
        w = self.world
        stage = 'f5c'
        generic = GS.GenericSource(w.storage).acquire()
        require(stage + '/generic_prefix', generic.complete)
        group = barrier['group']
        member_ids = [m['event_id'] for m in group['members']]
        issued = [w.storage.receipt_of(h)['event_id'] for h in receipts]
        require(stage + '/all_members', sorted(issued) == sorted(member_ids))
        members = []
        for m in group['members']:
            event = w.storage.read_event(m['event_id'])
            custody = w.storage.first_custody(m['event_id'])
            require(stage + '/custody_unavailable', custody is not None)
            fvr = w.storage.full_value_result(m['event_id'])
            require(stage + '/group_digest', custody['group_digest'] == group['group_digest'])
            require(stage + '/receipt_frame', custody['first_append_receipt']['sequence_id'] == m['sequence_id'] ==
                    event['sequence_id'] and custody['first_append_receipt']['byte_offset'] == m['byte_offset'])
            require(stage + '/value_commitment', custody['original_event_value_commitment']['sha256'] ==
                    NR.full_value_commitment(event, stage + '/full_value'))
            require(stage + '/producer_digest', custody['producer_semantic_digest'] ==
                    NR.producer_digest(event, stage + '/producer'))
            members.append(dict(event=event, custody=custody, full_value_result=fvr))
        evidence = dict(active_durable_group=group, members=members, target_event_id=ctx['identity']['event_id'])
        w.realm.validate('coordinator', APPEND + 'AppendEvidence', evidence, stage + '/evidence')
        return evidence

    def check_evidence(self, ctx, evidence, *, stage):
        """F5 post-append predicate over presented AppendEvidence against Storage custody."""
        w = self.world
        w.realm.validate('coordinator', APPEND + 'AppendEvidence', evidence, stage + '/evidence')
        target = ctx['identity']['event_id']
        require(stage + '/target', evidence['target_event_id'] == target)
        group = w.storage.active_durable_group(target)
        require(stage + '/group', A.same(evidence['active_durable_group'], group))
        ids = [m['event']['event_id'] for m in evidence['members']]
        require(stage + '/member_set', ids == [m['event_id'] for m in group['members']])
        for member in evidence['members']:
            eid = member['event']['event_id']
            stored = w.storage.read_event(eid)
            require(stage + '/member_event', A.same(member['event'], stored))
            custody = w.storage.first_custody(eid)
            require(stage + '/member_custody', custody is not None and A.same(member['custody'], custody))
            require(stage + '/member_full_value', A.same(member['full_value_result'], w.storage.full_value_result(eid)))
        target_member = next(m for m in evidence['members'] if m['event']['event_id'] == target)
        require(stage + '/target_producer25', A.same(S.producer25(target_member['event']), ctx['producer25']))
        require(stage + '/barrier_durability', target_member['custody']['first_append_receipt']['durability_class']
                == 'barrier')
        return target_member

    def event_phase_record(self, ctx, intent, evidence, tx_id, issued_at):
        target = next(m for m in evidence['members'] if m['event']['event_id'] == ctx['identity']['event_id'])
        custody = target['custody']
        ikey = family_key('intent', ctx['scope'], ctx['op'])
        return dict(
            scope=copy.deepcopy(ctx['scope']), owner=self.owner_ref(ctx['op']), intent=selector(ikey, intent),
            event_id=target['event']['event_id'], idempotency_key=target['event']['idempotency_key'],
            producer_semantic_digest=custody['producer_semantic_digest'],
            whole_producer25_sha256=sha(sj(S.producer25(target['event']))),
            first_custody=selector('custody_v2:' + target['event']['event_id'], custody),
            whole_first_append_receipt_sha256=sha(mp(custody['first_append_receipt'])),
            original_full_value_result_sha256=sha(mp(target['full_value_result'])),
            original_event_value_sha256=custody['original_event_value_commitment']['sha256'],
            active_group_sha256=sha(mp(evidence['active_durable_group'])),
            all_member_custody_sha256=sha(mp([m['custody'] for m in evidence['members']])),
            issued_at_utc=issued_at, transaction_id=tx_id)

    def f5d(self, ctx, intent, control, evidence, barrier):
        w = self.world
        stage = 'f5d'
        ckey, ccell = self.compact('control', ctx['scope'])
        epkey = family_key('eventphase', ctx['scope'], ctx['op'])

        def final(evidence_now):
            self.check_evidence(ctx, evidence_now, stage=stage)
            self.current_sources(ctx, stage=stage + '_final')
            body, ncontrol, head = self.native_preimage(ctx, stage=stage)
            i = intent['record']
            require(stage + '/native_current', A.same(i['native_before_body'],
                                                      selector(native_key(ctx['scope']), body['value'])))
            fresh = self.compact('control', ctx['scope'])[1]
            require(stage + '/control_changed', fresh['version'] == ccell['version'] and
                    fresh['value']['record']['phase'] == 'armed')
        w.hook('after_helper:f5d', ctx)
        final(evidence)
        issued_at = w.storage.now()

        def build(tx_id):
            final(evidence)
            record = self.event_phase_record(ctx, intent, evidence, tx_id, issued_at)
            stored = wrap('eventphase', record)
            new_control = dict(ccell['value']['record'], epoch=ccell['value']['record']['epoch'] + 1,
                               phase='event_durable', event_phase=selector(epkey, stored))
            stored_control = wrap('control', new_control)
            w.realm.validate('coordinator', COORD + 'StorageEventPhase', stored, stage + '/event_phase')
            w.realm.validate('coordinator', COORD + 'StorageControl', stored_control, stage + '/control')
            ctx['stored_event_phase'], ctx['stored_control_event'] = stored, stored_control
            return [dict(table=family_table('eventphase'), key=epkey, expected=None, value=stored),
                    dict(table=family_table('control'), key=ckey, expected=ccell['version'], value=stored_control)]
        w.cut('before_event_phase')
        w.storage.transact_stamped(build, writer=self.owner_ref(ctx['op']))
        w.cut('after_event_phase')
        # compact readback, then the outer responder's final predicate before disclosure
        epcell = self.compact('eventphase', ctx['scope'], ctx['op'])[1]
        require(stage + '/event_phase_readback', mp(epcell['value']) == mp(ctx['stored_event_phase']))
        w.hook('after_helper:append_outer', ctx)
        self.check_evidence(ctx, evidence, stage='append_outer')
        self.current_sources(ctx, stage='append_outer')
        appended = dict(outcome='event_durable_held', evidence=evidence, event_phase=ctx['stored_event_phase']['record'],
                        control=ctx['stored_control_event']['record'], certification_visible=False)
        w.realm.validate('coordinator', APPEND + 'AppendedHeld', appended, 'append/result')
        ctx['evidence'] = evidence
        return appended

    def held_retry(self, ctx, intent, control):
        """Equal retry of the same original operation reads original results only."""
        w = self.world
        epcell = self.compact('eventphase', ctx['scope'], ctx['op'])[1]
        icell = self.compact('intent', ctx['scope'], ctx['op'])[1]
        require('retry/intent_conflict', mp(icell['value']) == mp(intent))
        record = epcell['value']['record']
        require('retry/producer25_conflict', record['whole_producer25_sha256'] == sha(sj(ctx['producer25'])))
        target = record['event_id']
        group = w.storage.active_durable_group(target)
        members = [dict(event=w.storage.read_event(m['event_id']), custody=w.storage.first_custody(m['event_id']),
                        full_value_result=w.storage.full_value_result(m['event_id'])) for m in group['members']]
        evidence = dict(active_durable_group=group, members=members, target_event_id=target)
        self.check_evidence(ctx, evidence, stage='retry')
        ccell = self.compact('control', ctx['scope'])[1]
        appended = dict(outcome='event_durable_held', evidence=evidence, event_phase=record,
                        control=ccell['value']['record'], certification_visible=False)
        w.realm.validate('coordinator', APPEND + 'AppendedHeld', appended, 'retry/result')
        return appended

    # -- Phase 4: commit_native (F6) ------------------------------------
    def commit_native(self, ctx, appended):
        w = self.world
        stage = 'commit'
        with self.recorder.call(self.owner_id, 'owner.workflow.certified_event.commit_native.v1',
                                dict(op=ctx['op'])) as slot:
            require(stage + '/missing_participant', w.d01_store is w.storage and
                    w.native.storage is w.storage)
            guard = self.check_guard(ctx, self.acquire_guard(ctx, 'original_certification', stage='commit'),
                                     ('authentic_pending',), stage=stage)
            require(stage + '/guard_phase', guard['control']['record']['phase'] == 'event_durable')
            ckey, ccell = self.compact('control', ctx['scope'])
            crec = ccell['value']['record']
            require(stage + '/control_phase', crec['phase'] == 'event_durable')
            ikey, icell = self.compact('intent', ctx['scope'], ctx['op'])
            epkey, epcell = self.compact('eventphase', ctx['scope'], ctx['op'])
            require(stage + '/event_phase_unissued', epcell is not None)
            require(stage + '/event_phase_selector', A.same(crec['event_phase'], selector(epkey, epcell['value'])))
            require(stage + '/event_phase_bytes', mp(appended['event_phase']) == mp(epcell['value']['record']))
            self.check_evidence(ctx, appended['evidence'], stage=stage)
            intent = icell['value']['record']
            body, ncontrol, head = self.native_preimage(ctx, stage=stage)
            require(stage + '/native_preimage', A.same(intent['native_before_body'], selector(native_key(ctx['scope']), body['value']))
                    and A.same(intent['native_before_control'], selector(native_key(ctx['scope']), ncontrol['value'])))
            require(stage + '/d01_preimage', A.same(intent['native_before_head'], selector(head['key'], head['value'])))
            require(stage + '/native_status', body['value']['status'] in ('verifying', 'provisional_success'))
            candidate = self.native_candidate(ctx, body, ncontrol)
            require(stage + '/native_candidate', intent['candidate_commitments']['whole_native_candidate_sha256'] ==
                    sha(sj(candidate)))
            self.current_sources(ctx, stage=stage)
            w.hook('after_helper:commit', ctx)
            issued_at = w.storage.now()
            okey = family_key('origin', ctx['scope'], ctx['op'])
            mkey = family_key('commit', ctx['scope'], ctx['op'])

            def build(tx_id):
                # F6 final predicate after every helper, immediately before the joint write.
                self.check_evidence(ctx, appended['evidence'], stage=stage + '_final')
                self.current_sources(ctx, stage=stage + '_final')
                b2, c2, h2 = self.native_preimage(ctx, stage=stage + '_final')
                require(stage + '/native_changed', b2['version'] == body['version'] and c2['version'] == ncontrol['version']
                        and h2['pointer']['version'] == head['pointer']['version'])
                standard = dict(receipt_key=N.receipt_key(ctx['scope']), capture_key=N.capture_key(ctx['scope']),
                                receipt=w.storage.cell_value(N.T_RECEIPT, N.receipt_key(ctx['scope'])),
                                capture=w.storage.cell_value(N.T_CAPTURE, N.capture_key(ctx['scope'])))
                require(stage + '/standard_unavailable', standard['receipt'] is not None and standard['capture'] is not None)
                require(stage + '/standard_origin', A.same(intent['standard_capture_origin'],
                                                           selector(standard['capture_key'], standard['capture'])))
                lineage = dict(body=body, control=ncontrol, head=head, head_key=head['key'], pointer=head['pointer'])
                pub = N.publication(w, ctx['scope'], kind='certification', op=ctx['op'], tx=tx_id, issued_at=issued_at,
                                    lineage=lineage, after_body=candidate['after_body'],
                                    after_control=candidate['after_control'],
                                    source_sha=intent['source_commitments']['original_certification_source_sha256'],
                                    goal_sha=intent['source_commitments']['whole_goal_argument_sha256'], standard=standard)
                union, keys = pub['values'], pub['keys']
                sel = {name: selector(keys[name][1], union[name]) for name in union}
                commit = dict(scope=copy.deepcopy(ctx['scope']), owner=self.owner_ref(ctx['op']),
                              intent=selector(ikey, icell['value']), event_phase=selector(epkey, epcell['value']),
                              native_result=sel['native_result'], native_origin=sel['native_origin'],
                              d01_update=sel['d01_update'], d01_origin=sel['d01_origin'], d01_head=sel['d01_head'],
                              native_after_body=sel['native_after_body'], native_after_control=sel['native_after_control'],
                              standard_capture_origin=copy.deepcopy(intent['standard_capture_origin']),
                              clocks=copy.deepcopy(intent['clocks']),
                              whole_native_published_union_sha256=sha(mp(union)), issued_at_utc=issued_at,
                              transaction_id=tx_id)
                stored_commit = wrap('commit', commit)
                origin = dict(scope=copy.deepcopy(ctx['scope']), owner=self.owner_ref(ctx['op']),
                              issuer_method='owner.workflow.certified_event.commit_native.v1',
                              commit=selector(mkey, stored_commit), intent=selector(ikey, icell['value']),
                              event_phase=selector(epkey, epcell['value']), issued_at_utc=issued_at, transaction_id=tx_id)
                stored_origin = wrap('origin', origin)
                new_control = dict(crec, epoch=crec['epoch'] + 1, phase='native_committed',
                                   commit=selector(mkey, stored_commit), origin=selector(okey, stored_origin))
                stored_control = wrap('control', new_control)
                w.realm.validate('coordinator', COORD + 'NativeCandidates', dict(commit=commit, origin=origin,
                                                                                  control=new_control), stage + '/candidates')
                expected_union = copy.deepcopy(union)
                edited = w.hook('commit_writes', ctx, union)
                if edited is not None:
                    union = edited
                ctx['union'], ctx['union_keys'] = union, keys
                ctx['stored_commit'], ctx['stored_origin'], ctx['stored_control_committed'] = \
                    stored_commit, stored_origin, stored_control
                by_table = {keys[name][0]: union[name] for name in union}
                writes = [dict(x, value=by_table[x['table']]) for x in pub['writes']] + [
                    dict(table=family_table('commit'), key=mkey, expected=None, value=stored_commit),
                    dict(table=family_table('origin'), key=okey, expected=None, value=stored_origin),
                    dict(table=family_table('control'), key=ckey, expected=ccell['version'], value=stored_control)]
                drop = w.hook('drop_write', ctx)
                if drop:
                    writes = [x for x in writes if x['table'] != drop]
                # F6: the whole write set is independently checked before the joint commit.
                required = {N.T_BODY, N.T_CONTROL, N.T_RESULT, N.T_ORIGIN, N.T_UPDATE, N.T_HEAD, N.T_MUTATION, N.T_POINTER,
                            family_table('commit'), family_table('origin'), family_table('control')}
                require(stage + '/write_set', sorted(x['table'] for x in writes) == sorted(required))
                expected_by_table = {keys[name][0]: expected_union[name] for name in expected_union}
                for x in writes:
                    if x['table'] in expected_by_table:
                        require(stage + '/write_value', A.same(x['value'], expected_by_table[x['table']]))
                require(stage + '/union_commitment', commit['whole_native_published_union_sha256'] == sha(mp(union)))
                return writes
            w.cut('before_native_commit')
            tx = w.storage.transact_stamped(build, writer=self.owner_ref(ctx['op']))
            w.cut('after_native_commit')
            published = dict(qualification=QUALIFICATION, transaction_id=tx['tx_id'], union=ctx['union'],
                             keys=ctx['union_keys'])
            ctx['guards']['commit'] = guard
            out = dict(outcome='native_committed_held', published_native_held=published,
                       commit=ctx['stored_commit'], origin=ctx['stored_origin'], control=ctx['stored_control_committed'],
                       all_member_append_evidence=appended['evidence'])
            slot.set(dict(tx=tx['tx_id']))
            return out

    # -- Phase 5: readback (F7) -----------------------------------------
    def readback(self, ctx, committed):
        w = self.world
        stage = 'readback'
        with self.recorder.call(self.owner_id, 'owner.storage.certified_event.readback_held.v1',
                                dict(op=ctx['op'])) as slot:
            union = committed['published_native_held']['union']
            keys = committed['published_native_held']['keys']
            tx_id = committed['published_native_held']['transaction_id']
            cells = {name: w.storage.cell(*keys[name]) for name in keys}
            for name, cell in cells.items():
                require(stage + '/missing/' + name, cell is not None)
                require(stage + '/member/' + name, A.same(cell['value'], union[name]))
                require(stage + '/transaction/' + name, cell['tx'] == tx_id)
            for fam, stored in (('commit', committed['commit']), ('origin', committed['origin']),
                                ('control', committed['control'])):
                key, cell = self.compact(fam, ctx['scope'], ctx['op'])
                require(stage + '/compact/' + fam, cell is not None and mp(cell['value']) == mp(stored))
                require(stage + '/transaction/' + fam, cell['tx'] == tx_id)
            commit = committed['commit']['record']
            for name in ('native_result', 'native_origin', 'd01_update', 'd01_origin', 'd01_head', 'native_after_body',
                         'native_after_control'):
                require(stage + '/commit_selects/' + name, A.same(commit[name], selector(keys[name][1], union[name])))
            require(stage + '/union_commitment', commit['whole_native_published_union_sha256'] == sha(mp(union)))
            self.check_evidence(ctx, committed['all_member_append_evidence'], stage=stage)
            goal_body, _ = w.goal.current(ctx['values']['goal']['goal_id'])
            require(stage + '/goal_unchanged', A.same(goal_body, ctx['goal']))
            readback = dict(union={k: c['value'] for k, c in cells.items()}, transaction_id=tx_id,
                            commit_sha256=sha(mp(committed['commit'])), origin_sha256=sha(mp(committed['origin'])))
            slot.set(readback)
            return readback

    # -- Phase 6: release (F8) ------------------------------------------
    def release(self, ctx, committed, readback):
        w = self.world
        stage = 'release'
        with self.recorder.call(self.owner_id, 'owner.workflow.certified_event.release.v1', dict(op=ctx['op'])) as slot:
            guard = self.check_guard(ctx, self.acquire_guard(ctx, 'original_certification', stage='release'),
                                     ('authentic_pending',), stage=stage)
            require(stage + '/guard_phase', guard['control']['record']['phase'] == 'native_committed')
            ckey, ccell = self.compact('control', ctx['scope'])
            crec = ccell['value']['record']
            require(stage + '/control_phase', crec['phase'] == 'native_committed')
            require(stage + '/readback', readback is not None and readback['transaction_id'] ==
                    committed['commit']['record']['transaction_id'])
            fresh = self.readback(ctx, committed)
            require(stage + '/readback_stale', A.same(fresh, readback))
            sources = self.current_sources(ctx, stage=stage)
            w.hook('after_helper:release', ctx)
            issued_at = w.storage.now()
            rkey = family_key('release', ctx['scope'], ctx['op'])

            def build(tx_id):
                self.current_sources(ctx, stage=stage + '_final')
                again = self.readback(ctx, committed)
                require(stage + '/readback_changed', A.same(again, readback))
                rec = dict(scope=copy.deepcopy(ctx['scope']), owner=self.owner_ref(ctx['op']),
                           commit=copy.deepcopy(crec['commit']), origin=copy.deepcopy(crec['origin']),
                           intent=copy.deepcopy(crec['intent']), event_phase=copy.deepcopy(crec['event_phase']),
                           original_event_id=ctx['identity']['event_id'],
                           whole_post_native_readback_sha256=sha(mp(readback)),
                           whole_release_current_sources_sha256=sha(sj(sources)), issued_at_utc=issued_at,
                           transaction_id=tx_id)
                stored = wrap('release', rec)
                new_control = dict(crec, epoch=crec['epoch'] + 1, phase='released', release=selector(rkey, stored))
                stored_control = wrap('control', new_control)
                w.realm.validate('coordinator', COORD + 'ReleaseCandidates', dict(release=rec, control=new_control),
                                 stage + '/candidates')
                ctx['stored_release'], ctx['stored_control_released'] = stored, stored_control
                return [dict(table=family_table('release'), key=rkey, expected=None, value=stored),
                        dict(table=family_table('control'), key=ckey, expected=ccell['version'], value=stored_control)]
            w.cut('before_release')
            tx = w.storage.transact_stamped(build, writer=self.owner_ref(ctx['op']))
            w.cut('after_release')
            retained = self.retained_authority(ctx['scope'], ctx['op'])
            out = dict(outcome='original_complete', retained=retained, control=ctx['stored_control_released'])
            ctx['guards']['release'] = guard
            slot.set(dict(tx=tx['tx_id']))
            return out

    def retained_authority(self, scope, op):
        w = self.world
        values = {}
        for fam in ('birth', 'intent', 'eventphase', 'commit', 'origin', 'release'):
            cell = self.compact(fam, scope, op)[1]
            require('retained/missing/' + fam, cell is not None)
            values[fam] = cell['value']['record']
        authority = dict(birth=values['birth'], intent=values['intent'], event_phase=values['eventphase'],
                         commit=values['commit'], origin=values['origin'], release=values['release'])
        w.realm.validate('coordinator', COORD + 'RetainedAuthority', authority, 'retained/authority')
        return authority

    # -- current and retained responders --------------------------------
    def read_current(self, ctx):
        w = self.world
        stage = 'current'
        with self.recorder.call(self.owner_id, 'owner.workflow.certified_event.read_current.v1',
                                dict(op=ctx['op'])) as slot:
            guard = self.check_guard(ctx, self.acquire_guard(ctx, 'current_source', stage='current'),
                                     ('authentic_released',), stage=stage)
            ckey, ccell = self.compact('control', ctx['scope'])
            require(stage + '/released', ccell['value']['record']['phase'] == 'released')
            authority = self.retained_authority(ctx['scope'], ctx['op'])
            self.chain(ctx['scope'], ctx['op'], stage=stage)
            nk = native_key(ctx['scope'])
            body, control, head = self.native_preimage(ctx, stage=stage)
            commit = authority['commit']
            require(stage + '/native_current', A.same(commit['native_after_body'], selector(nk, body['value'])) and
                    A.same(commit['native_after_control'], selector(nk, control['value'])))
            require(stage + '/d01_current', A.same(commit['d01_head'], selector(head['key'], head['value'])))
            self.current_sources(ctx, stage=stage)
            target = ctx['identity']['event_id']
            custody = w.storage.first_custody(target)
            require(stage + '/event_custody', custody is not None and
                    authority['event_phase']['first_custody']['sha256'] == sha(mp(custody)))
            w.hook('after_helper:current', ctx)
            # final predicate after all helpers under the held read fence
            self.check_guard(ctx, guard, ('authentic_released',), stage=stage + '_final')
            self.current_sources(ctx, stage=stage + '_final')
            b2 = w.native.body(ctx['scope'])
            require(stage + '/native_changed', b2['version'] == body['version'])
            out = dict(outcome='current_complete', retained=authority, published_native=body['value'])
            slot.set(out)
            return out

    def chain(self, scope, op, *, stage):
        """Complete original cross-commitments of the compact authority."""
        cells = {f: self.compact(f, scope, op) for f in FAMILIES}
        val = {f: c[1]['value'] if c[1] else None for f, c in cells.items()}
        key = {f: c[0] for f, c in cells.items()}
        sel = lambda f: selector(key[f], val[f])
        ctrl = val['control']['record']
        require(stage + '/chain_birth', A.same(ctrl['birth'], sel('birth')) and
                A.same(val['intent']['record']['original_birth'], sel('birth')))
        require(stage + '/chain_event_phase', A.same(val['eventphase']['record']['intent'], sel('intent')))
        c = val['commit']['record']
        require(stage + '/chain_commit', A.same(c['intent'], sel('intent')) and A.same(c['event_phase'], sel('eventphase')))
        o = val['origin']['record']
        require(stage + '/chain_origin', A.same(o['commit'], sel('commit')) and A.same(o['intent'], sel('intent')) and
                A.same(o['event_phase'], sel('eventphase')) and o['transaction_id'] == c['transaction_id'])
        r = val['release']['record']
        require(stage + '/chain_release', A.same(r['commit'], sel('commit')) and A.same(r['origin'], sel('origin')) and
                A.same(r['intent'], sel('intent')) and A.same(r['event_phase'], sel('eventphase')) and
                r['original_event_id'] == val['eventphase']['record']['event_id'])
        require(stage + '/chain_control', A.same(ctrl['release'], sel('release')) and A.same(ctrl['commit'], sel('commit'))
                and A.same(ctrl['origin'], sel('origin')) and A.same(ctrl['intent'], sel('intent')) and
                A.same(ctrl['event_phase'], sel('eventphase')))
        return val

    def reenter(self, request):
        """A fresh process after a crash: passive classification only, never completion."""
        w = self.world
        before = w.storage.observe()
        result = self.recover_original(request)
        after = w.storage.observe()
        require('reenter/passive_changed_storage', A.same(before, after))
        if result['outcome'] == 'original_complete':
            return result
        # No recovery path re-executes the certifier, re-appends, reapplies native CAS or releases.
        raise Refusal('reenter/live_invocation_lost')

    def recover_original(self, request):
        """R1-R3: passive; reads only surviving compact/custody/reservation authority."""
        w = self.world
        with self.recorder.call(self.owner_id, 'owner.workflow.certified_event.recover_original.v1', request) as slot:
            w.realm.validate('coordinator', COORD + 'RecoveryRequest', request, 'recover/request')
            require('recover/profile', request['installed_profile_sha256'] == w.profile_sha)
            scope, op = request['scope'], request['operation_id']
            cells = {f: self.compact(f, scope, op)[1] for f in FAMILIES}
            present = {f for f, c in cells.items() if c is not None}
            reservation = w.storage.reservation_state(op)
            sel = lambda f: None if cells[f] is None else selector(family_key(f, scope, None if f in ('birth', 'control') else op), cells[f]['value'])
            if 'intent' in present:
                require('recover/intent_mismatch', sha(mp(cells['intent']['value']['record'])) == request['expected_intent_sha256'])
            unknown = lambda phase, reason: dict(outcome='pending_unknown', reason=reason, scope=copy.deepcopy(scope),
                                                 operation_id=op, known_phase=phase, intent=sel('intent'),
                                                 event_phase=sel('eventphase'), commit=sel('commit'),
                                                 release=sel('release'), action_authority='none')
            control = cells['control']['value']['record'] if cells['control'] else None
            if {'intent', 'eventphase', 'commit', 'origin', 'release'} <= present and control and control['phase'] == 'released':
                self.chain(scope, op, stage='recover')
                result = dict(outcome='original_complete', authority=self.retained_authority(scope, op),
                              action_authority='none')
            elif 'commit' in present or (control and control['phase'] == 'native_committed'):
                result = unknown('native_committed', 'release_unknown')
            elif 'eventphase' in present:
                result = unknown('event_durable', 'native_unknown')
            elif reservation is not None:
                missing = [e for e in reservation['event_ids'] if w.storage.first_custody(e) is None]
                if reservation['state'] == 'reserved':
                    result = unknown('append_attempted', 'append_unknown')
                elif missing:
                    result = unknown('append_attempted', 'custody_unknown')
                else:
                    result = unknown('append_attempted', 'barrier_unknown')
            elif 'intent' in present:
                # Armed, and Storage's durable reservation table proves no append attempt was made;
                # the live original invocation is gone and cannot be resumed.
                result = dict(outcome='no_append', reason='current_source_unavailable', standard_receipt_preserved=True,
                              event_appended=False, native_changed=False, action_authority='none')
            else:
                result = dict(outcome='no_append', reason='current_source_unavailable', standard_receipt_preserved=True,
                              event_appended=False, native_changed=False, action_authority='none')
            w.realm.validate('coordinator', COORD + 'RecoveryResult', result, 'recover/result')
            slot.set(result)
            return result


# ------------------------------------------------------------------ path

def birth_run(w, values, scope):
    """B1 prerequisite: native birth + D01 lineage + compact Birth + empty Control in one transaction."""
    nk = native_key(scope)
    issued_at = w.storage.now()

    def build(tx_id):
        native_birth = dict(qualification=QUALIFICATION, goal_run_id=scope['goal_run_id'], goal_id=scope['goal_id'],
                            project_id=scope['project_id'], work_graph_id=scope['work_graph_id'],
                            installed_profile_sha256=w.profile_sha, transaction_id=tx_id)
        body = dict(qualification=QUALIFICATION, goal_run_id=scope['goal_run_id'], goal_id=scope['goal_id'],
                    project_id=scope['project_id'], work_graph_id=scope['work_graph_id'], status='running',
                    body_revision=1, activation_revision=1, activation_state='active', certification_receipt=None,
                    identity=dict(project_id=scope['project_id'], goal_id=scope['goal_id'],
                                  goal_run_id=scope['goal_run_id'], plan_compile_run_id='TEST_ONLY:plan-compile-run:1',
                                  workgraph_id=scope['work_graph_id'], workgraph_revision=1,
                                  workgraph_ref='TEST_ONLY:workgraph-ref:1', workgraph_sha256=sha(b'TEST_ONLY:graph')),
                    workflow_owner_ref='TEST_ONLY:workflow-owner', workflow_owner_epoch=1)
        control = dict(qualification=QUALIFICATION, goal_run_id=scope['goal_run_id'], control_revision=1, owner_epoch=1,
                       admission='open')
        lineage = N.birth_writes(w, scope, tx=tx_id, issued_at=issued_at, native_birth=native_birth, body=body,
                                 control=control, op='TEST_ONLY:operation:birth')
        birth = dict(scope=copy.deepcopy(scope), owner=w.coordinator.owner_ref('TEST_ONLY:operation:birth'),
                     profile_sha256=w.profile_sha, original_native_birth=selector(nk, native_birth),
                     initial_control_key=family_key('control', scope), initial_control_epoch=0, initial_phase='empty',
                     issued_at_utc=issued_at, transaction_id=tx_id)
        stored_birth = wrap('birth', birth)
        control_rec = dict(scope=copy.deepcopy(scope), epoch=0, phase='empty', intent=None, event_phase=None,
                           commit=None, origin=None, release=None,
                           birth=selector(family_key('birth', scope), stored_birth))
        stored_control = wrap('control', control_rec)
        w.realm.validate('coordinator', COORD + 'StorageBirth', stored_birth, 'birth/birth')
        w.realm.validate('coordinator', COORD + 'StorageControl', stored_control, 'birth/control')
        return [dict(table=NATIVE_BIRTH, key=nk, expected=None, value=native_birth),
                dict(table=NATIVE_BODY, key=nk, expected=None, value=body),
                dict(table=NATIVE_CONTROL, key=nk, expected=None, value=control)] + lineage + [
                dict(table=family_table('birth'), key=family_key('birth', scope), expected=None, value=stored_birth),
                dict(table=family_table('control'), key=family_key('control', scope), expected=None,
                     value=stored_control)]
    return w.storage.transact_stamped(build, writer=w.coordinator.owner_ref('TEST_ONLY:operation:birth'))


class StandardCaptureOwner(D.StandardOwner):
    """Phase 0: whole current Standard receipt and capture origin in one Storage transaction."""

    def capture_whole(self, world, scope, values, native_source, goal):
        body = world.native.body(scope)['value']
        issued_at = self.storage.now()
        out = {}

        def build(tx_id):
            v = N.standard_values(world, scope, tx=tx_id, issued_at=issued_at, values=values,
                                  native_source=native_source, goal=goal, body=body)
            out.update(v, tx_id=tx_id)
            return [dict(table=N.T_RECEIPT, key=v['receipt_key'], expected=None, value=v['receipt']),
                    dict(table=N.T_CAPTURE, key=v['capture_key'], expected=None, value=v['capture'])]
        self.storage.transact_stamped(build, writer=dict(owner_id=self.owner_id, owner_epoch=self.owner_epoch,
                                                         operation_id='TEST_ONLY:operation:standard-capture'))
        record = dict(qualification=QUALIFICATION, goal_run_id=scope['goal_run_id'], final_certifier_decision='certified',
                      receipt_ref=out['receipt_id'], storage_key=out['receipt_key'], tx_id=out['tx_id'],
                      durable_read=out['durable'])
        return self.issue(None, record, kind='standard_receipt')

    def durable(self, record):
        cell = self.storage.cell(N.T_RECEIPT, record['storage_key'])
        return cell is not None and cell.get('tx') == record['tx_id'] and \
            A.same(cell['value'], record['durable_read']['physical_receipt'])


def default_values(before=6):
    values = D.default_values(before=before)
    return values


def build_context(w, values=None, *, op='TEST_ONLY:operation:certified:1', unrelated=True, mutate=None):
    """Run birth, native progression, Standard capture, identity and producer preparation."""
    values = values or default_values()
    if mutate:
        values = mutate(copy.deepcopy(values))
    run, project = values['run'], values['project']
    w.goal.seed(values)
    w.permission.grant(run)
    h = {}
    h['assignment'] = (w.assignment.owner_id, w.assignment.issue(None, values['assignment'], kind='assignment'))
    h['invocation'] = (w.invocation.owner_id, w.invocation.issue(None, values['invocation'], kind='invocation'))
    cause_id = D.cause_event(w, values)
    h['causality'] = (w.causality.owner_id, w.causality.issue(None, dict(qualification=QUALIFICATION,
                                                                         causation_event_id=cause_id), kind='cause'))
    partition_handle = w.partition.register_route(project)
    part = w.partition.resolve(partition_handle)[1]
    scope = dict(project_id=project, goal_id=values['goal']['goal_id'], goal_run_id=run,
                 work_graph_id=values['native']['work_graph_id'], storage_instance_id=w.storage.storage_instance_id,
                 scope_partition=part['scope_partition'])
    birth_run(w, values, scope)
    for _ in range(values['before'] - 2):
        w.native.advance(w, scope, 'running', kind='progress')
    w.native.advance(w, scope, 'provisional_success', kind='provisional')
    native_handle = w.native.certification_source(scope, 'certified', values)
    h['native'] = (w.native.owner_id, native_handle)
    h['goal'] = (w.goal.owner_id, w.goal.issue_current(values['goal']['goal_id']))
    standard_handle = w.standard.capture_whole(w, scope, values, w.native.resolve(native_handle)[1],
                                               w.goal.resolve(h['goal'][1])[1])
    h['standard'] = (w.standard.owner_id, standard_handle)
    h['storage_partition'] = (w.partition.owner_id, partition_handle)
    h['descriptor'] = (w.descriptor.owner_id, w.descriptor.issue(None, values['descriptor'], kind='descriptor'))
    identity_handles = {k: v for k, v in h.items() if k != 'causality'}
    identity_h = (w.identity.owner_id, w.identity.derive_original_identity(w, identity_handles))
    p25 = w.producer.prepare(w, identity_h, h)
    identity = w.identity.resolve(identity_h[1])[1]
    src = {role: A.acquire(w.registry, owner_id, role, handle)[1] for role, (owner_id, handle) in h.items()}
    if unrelated:
        w.group.enqueue(w.unrelated.owner_id, w.unrelated.queue('cf2'))
    ctx = dict(values=values, scope=scope, op=op, handles=h, src=src, identity=identity, producer25=p25,
               goal=src['goal'], producer_source=dict(assignment=src['assignment'], invocation=src['invocation'],
                                                      causality=src['causality'], native=src['native'],
                                                      goal=src['goal'], standard=src['standard'], identity=identity),
               request=dict(scope=copy.deepcopy(scope), owner=w.coordinator.owner_ref(op), expected_control_epoch=0,
                            installed_profile_sha256=w.profile_sha), guards={}, presented={})
    w.realm.validate('coordinator', COORD + 'Request', ctx['request'], 'context/request')
    return ctx


def full_path(work, *, values=None, hooks=None, faults=None, lane_cut=None, lane_mode='raise', unrelated=True,
              separate_d01=False, stop_after=None):
    """The complete original path; returns (world, ctx, observations)."""
    w = World(work, faults=faults, lane_cut=lane_cut, lane_mode=lane_mode, separate_d01=separate_d01)
    w.hooks.update(hooks or {})
    ctx = build_context(w, values, unrelated=unrelated)
    obs = dict(prepared=None)
    obs['guard_birth'] = w.guard.read_guard(guard_request(w, ctx['scope'], ctx['op'], 'original_certification',
                                                          'TEST_ONLY:guard-request:birth'))
    obs['prepared'] = w.coordinator.prepare(ctx)
    if stop_after == 'prepare':
        return w, ctx, obs
    obs['intent'], obs['control_armed'] = w.coordinator.arm(ctx, obs['prepared'])
    if stop_after == 'arm':
        return w, ctx, obs
    obs['appended'] = w.coordinator.append_held(ctx, obs['intent'], obs['control_armed'])
    if stop_after == 'append':
        return w, ctx, obs
    obs['committed'] = w.coordinator.commit_native(ctx, obs['appended'])
    if stop_after == 'commit':
        return w, ctx, obs
    obs['readback'] = w.coordinator.readback(ctx, obs['committed'])
    obs['released'] = w.coordinator.release(ctx, obs['committed'], obs['readback'])
    if stop_after == 'release':
        return w, ctx, obs
    obs['current'] = w.coordinator.read_current(ctx)
    return w, ctx, obs


def recovery_request(w, ctx, intent_record):
    return dict(scope=copy.deepcopy(ctx['scope']), operation_id=ctx['op'], installed_profile_sha256=w.profile_sha,
                expected_intent_sha256=sha(mp(intent_record)), disclosure_request_id='TEST_ONLY:disclosure:recover')
