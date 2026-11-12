#!/usr/bin/env python3
"""DG-CA C2: bound-Plan goal.cancelled original path (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

APR-017 / SQR-011 / GRS-076 / SIR-051 bound route on the shared adapters and
the DG-CA assignment tuple (``pm_goal_dg_ca_assignment``):

* ``PlanOwner`` (actual AssistantPlan owner) issues the approved plan, the
  goal-driven PlanRun, their SourceOrigins, the safe-stop result after the actual
  Stop, and participates in ``commit_plan_binding`` (one transaction with the Goal
  binding revision1/origin1/control and the seven-field GoalPlanBinding).
* ``SchedulerOwner`` issues run-specific schedules, run bindings and quota-resume
  consents plus one unrelated scheduled message, states its complete run
  selection, and admits callbacks only for the current run epoch and Stop epoch.
* ``BoundPlanCancel`` runs: bound C-source -> assignment (reserve/audit/admit) ->
  ``prepare.v3`` (BeforeStopSources -> BeforeStopPrepared: reserved identities,
  future slots, complete value templates, numeric assignments, codec and carrier
  admissions over the current AssignmentAdmission) -> C-stop -> receipt ->
  ``commit.v3`` with Scheduler ``participate.v3`` (PreparedBoundCancelRequest ->
  CommitAdmission: one joint Plan/Scheduler/Storage transaction whose values must
  equal the evaluated templates) -> bound settlement -> freeze -> append_reserved
  -> control -> bound terminal, plus the current/retained effect readers.

One builder runs twice: in template mode future values are placeholders that
become SlotTerm/ConcatTerm; in commit mode the same builder uses the actual joint
commit time, the genuine receipt hashes and each value's real hash. Commit refuses
unless every evaluated template equals the value it actually writes.
"""
from __future__ import annotations

import copy
import hashlib
import json

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_dg_ca_owners import (WorldOwner, require, Refusal, uid, row_sha, same, sha, scoped_key, CANCEL, BINDING,
                                  QUALIFICATION, ROOT, exact_numbers, transaction_record)
import pm_goal_dg_ca_c1 as C1
import pm_goal_dg_ca_assignment as AS

PLAN = 'https://puppetmaster.local/schemas/assistant_plan_cancel_custody/1.0.0/schema.json#/$defs/'
BOUND = 'https://puppetmaster.local/schemas/assistant_plan_cancel_bound_entry/1.0.0/schema.json#/$defs/'
SLOT = '\x00SLOT:%s\x00'
CANCELLABLE_RUN = ('running', 'paused', 'waiting_quota', 'waiting_window', 'blocked')
FAMILY_SCHEMA = dict(assistant_plan_record='StorageAssistantPlanRecord', assistant_plan_run='StoragePlanRun',
                     execution_schedule='StorageExecutionSchedule', quota_resume_consent='StorageQuotaResumeConsent',
                     execution_schedule_run_binding='StorageScheduleRunBinding', plan_cancel_effect='StoragePlanEffect',
                     schedule_quota_cancel_effect='StorageScheduleQuotaEffect', assistant_plan_cancel_result='StoragePlanCancelResult',
                     plan_cancel_source_origin='StorageSourceOrigin')
FAMILIES = json.loads((ROOT / 'Plans/assistant_plan_cancel_contracts/physical-families.json').read_text())['families']


def hx(text):
    return text.encode('utf-8').hex()


def oid(kind):
    """An owner-minted identifier of realistic length (its own random UUID bits)."""
    import uuid as _uuid
    return 'TO-%s-%s' % (kind, _uuid.uuid4().hex[:20])


MAX_SLOT = dict(commit_time='0000-00-00T00:00:00.000Z')


def check(world, name, value, uri=PLAN):
    world.roots.check('plan', uri + name, value)
    return exact_numbers(value, 'check')


def selector(world, family, key, value):
    return dict(storage_instance_id=world.storage_id, family_id=family, physical_key=key, schema_id=value['schema_id'],
                schema_version='1.0.0', physical_value_sha256=row_sha(value))


class PlanStoreOwner(WorldOwner):
    """Shared logic for owners whose sources carry SourceOrigins (wrapper/origin rules)."""

    def native_owner(self):
        return dict(owner_ref=self.owner_id, owner_epoch=self.owner_epoch, server_id=self.world.sir.server_id, server_claim_epoch=1)

    def wrap(self, family, key, record, source_revision=None, **extra):
        value = dict(schema_id='pm.storage_value.%s.v1' % family, schema_version='1.0.0', storage_instance_id=self.world.storage_id,
                     physical_key=key)
        if source_revision is not None:
            value['source_revision'] = source_revision
        value['record'] = record
        value.update(extra)
        return check(self.world, FAMILY_SCHEMA[family], value)

    def origin(self, family, key, value, *, issuer_method, operation_id, transaction_id, causation_ref, prior, at, anchor=None):
        record = dict(storage_instance_id=self.world.storage_id, project_id=value['record'].get('project_id') or self.project_id,
                      owner=self.native_owner(), original_operation_id=operation_id, original_transaction_id=transaction_id,
                      issuer_method=issuer_method, issued_family_id=family, issued_physical_key=key,
                      issued_physical_sha256=row_sha(value), prior_physical_sha256=prior,
                      source_revision=value.get('source_revision', 1), original_causation_ref=causation_ref, issued_at_utc=at,
                      run_completion_anchor=anchor)
        okey = 'plan_cancel_source_origin.v1:%s:%s:%s' % (hx(self.world.storage_id), hx(key), record['issued_physical_sha256'])
        return okey, self.wrap('plan_cancel_source_origin', okey, record)

    def binding(self, family, key):
        """SourceBinding of the current stored source and its stored origin."""
        w = self.world
        value = w.value(family, key)
        require('plan_store/source_unavailable/' + family, value is not None)
        okey = 'plan_cancel_source_origin.v1:%s:%s:%s' % (hx(w.storage_id), hx(key), row_sha(value))
        origin = w.value('plan_cancel_source_origin', okey)
        require('plan_store/origin_unavailable/' + family, origin is not None)
        return dict(source=selector(w, family, key, value), origin=selector(w, 'plan_cancel_source_origin', okey, origin))


class PlanOwner(PlanStoreOwner):
    role = 'assistant_plan'
    CONTENT = 'TEST_ONLY:assistant_plan_content'
    SAFE_STOP = 'TEST_ONLY:assistant_plan_safe_stop_result'

    def keys(self, scope, plan_id, run_id=None):
        base = '%s:%s:%s' % (hx(self.world.storage_id), hx(scope['project_id']), hx(scope['thread_id']))
        out = dict(plan='assistant_plan_record.v1:%s:%s' % (base, hx(plan_id)))
        if run_id is not None:
            out['run'] = 'assistant_plan_run.v1:%s:%s' % (base, hx(run_id))
        return out

    def create_and_start(self, scope, goal_id):
        """Approve one plan version and start its goal-driven run (two original births with origins)."""
        w = self.world
        self.project_id = scope['project_id']
        with self.recorder.call(self.owner_id, 'create_and_start') as slot:
            plan_id, run_id = oid('plan'), oid('run')
            content = dict(schema_id='pm.test_only.assistant_plan_content.v1', schema_version='1.0.0', assistant_plan_id=plan_id,
                           version=1, steps=['TEST_ONLY step 1', 'TEST_ONLY step 2'])
            plan_hash = row_sha(content)
            k = self.keys(scope, plan_id, run_id)
            plan = self.wrap('assistant_plan_record', k['plan'], dict(schema_id='pm.assistant_plan.record.v1', schema_version='1.0.0',
                             assistant_plan_id=plan_id, project_id=scope['project_id'], thread_id=scope['thread_id'], strategy='standard',
                             backend='direct', current_version=1, approved_version=1, approved_hash=plan_hash, control_state='building',
                             named_plan_id=None), source_revision=1)
            operation, tx = uid('TEST_ONLY:plan-birth'), uid('TEST_ONLY:plan-birth-tx')
            pkey, porigin = self.origin('assistant_plan_record', k['plan'], plan, issuer_method='owner.assistant_plan.original.write.v1',
                                        operation_id=operation, transaction_id=tx, causation_ref=operation, prior=None, at=self.clock.now())
            run = self.wrap('assistant_plan_run', k['run'], dict(schema_id='pm.assistant_plan.run.v1', schema_version='1.0.0',
                            plan_run_id=run_id, assistant_plan_id=plan_id, plan_version=1, plan_hash=plan_hash, execution_topology='goal_driven',
                            todo_list_revision=0, runtime_snapshot_ref=uid('TEST_ONLY:runtime-snapshot'),
                            permission_snapshot_id=uid('TEST_ONLY:permission-snapshot'), project_context_ref=uid('TEST_ONLY:project-context'),
                            schedule_ref=None, state='running', goal_ref=goal_id, plan_run_epoch=0), source_revision=1, run_completion_anchor=None)
            rkey, rorigin = self.origin('assistant_plan_run', k['run'], run, issuer_method='owner.assistant_plan.run.original.write.v1',
                                        operation_id=operation, transaction_id=tx, causation_ref=operation, prior=None, at=self.clock.now())
            w.write([w.put(self.CONTENT, plan_id, content), w.put('assistant_plan_record', k['plan'], plan), w.put('plan_cancel_source_origin', pkey, porigin),
                     w.put('assistant_plan_run', k['run'], run), w.put('plan_cancel_source_origin', rkey, rorigin)])
            self._issue(None, dict(plan=k['plan'], run=k['run']), kind='plan_birth')
            slot.set(dict(plan_id=plan_id, run_id=run_id))
            return plan_id, run_id

    def transition_run(self, scope, plan_id, run_id, new_state):
        """A genuine owner run-state change: whole-value CAS, source_revision+1, new origin."""
        w = self.world
        with self.recorder.call(self.owner_id, 'transition_run', dict(state=new_state)):
            key = self.keys(scope, plan_id, run_id)['run']
            cell = w.cell('assistant_plan_run', key)
            before = cell['value']
            after = copy.deepcopy(before)
            after['source_revision'] = before['source_revision'] + 1
            after['record']['state'] = new_state
            check(w, 'StoragePlanRun', after)
            op = uid('TEST_ONLY:run-transition')
            okey, origin = self.origin('assistant_plan_run', key, after, issuer_method='owner.assistant_plan.run.original.write.v1',
                                       operation_id=op, transaction_id=uid('TEST_ONLY:tx'), causation_ref=op, prior=row_sha(before), at=self.clock.now())
            w.write([w.put('assistant_plan_run', key, after, expected=cell['version']), w.put('plan_cancel_source_origin', okey, origin)])
            return [('assistant_plan_run', key), ('plan_cancel_source_origin', okey)]

    def approve_new_version(self, scope, plan_id):
        """A genuine later approval: current/approved version +1 with a new approved hash."""
        w = self.world
        with self.recorder.call(self.owner_id, 'approve_new_version'):
            key = self.keys(scope, plan_id)['plan']
            cell = w.cell('assistant_plan_record', key)
            before = cell['value']
            after = copy.deepcopy(before)
            after['source_revision'] = before['source_revision'] + 1
            version = before['record']['current_version'] + 1
            after['record'].update(current_version=version, approved_version=version,
                                   approved_hash=row_sha(dict(plan=plan_id, version=version, steps=['TEST_ONLY revised step'])))
            check(w, 'StorageAssistantPlanRecord', after)
            op = uid('TEST_ONLY:plan-approval')
            okey, origin = self.origin('assistant_plan_record', key, after, issuer_method='owner.assistant_plan.original.write.v1',
                                       operation_id=op, transaction_id=uid('TEST_ONLY:tx'), causation_ref=op, prior=row_sha(before), at=self.clock.now())
            w.write([w.put('assistant_plan_record', key, after, expected=cell['version']), w.put('plan_cancel_source_origin', okey, origin)])
            return [('assistant_plan_record', key), ('plan_cancel_source_origin', okey)]

    def safe_stop(self, scope, plan_id, run_id, stop_epoch):
        """The actual safe-stop result of the run after the genuine Stop; written by the joint commit."""
        w = self.world
        with self.recorder.call(self.owner_id, 'safe_stop') as slot:
            run = w.value('assistant_plan_run', self.keys(scope, plan_id, run_id)['run'])
            require('plan/safe_stop_run', run is not None and run['record']['state'] in CANCELLABLE_RUN)
            key = uid('TEST_ONLY:safe-stop-result')
            value = dict(schema_id='pm.test_only.plan_safe_stop_result.v1', schema_version='1.0.0', plan_run_id=run_id,
                         plan_run_epoch=run['record']['plan_run_epoch'], user_stop_epoch=stop_epoch, safe=True, at=self.clock.now())
            self._issue(None, value, kind='safe_stop_result', ref=key)
            slot.set(dict(key=key))
            return key, value


class SchedulerOwner(PlanStoreOwner):
    role = 'scheduling'
    SELECTION = 'TEST_ONLY:scheduler_run_selection'
    CALLBACKS = 'TEST_ONLY:scheduler_callback_admission'

    def keys(self, scope, schedule_id):
        base = '%s:%s' % (hx(self.world.storage_id), hx(scope['project_id']))
        return dict(schedule='execution_schedule.v1:%s:%s' % (base, hx(schedule_id)),
                    binding='execution_schedule_run_binding.v1:%s:%s' % (base, hx(schedule_id)))

    def consent_key(self, scope, consent):
        return 'quota_resume_consent.v1:%s:%s:%s:%s:%s:%s' % (hx(self.world.storage_id), hx(scope['project_id']), hx(consent['run_id']),
                                                              hx(consent['provider_id']), hx(consent['account_id']), hx(consent['consent_id']))

    def schedule_record(self, scope, schedule_id, target_kind, target_id, version, plan_hash):
        return dict(schema_id='pm.execution.schedule.v1', schema_version='1.0.0', schedule_id=schedule_id, project_id=scope['project_id'],
                    target_kind=target_kind, target_id=target_id, exact_target_version=version, exact_target_hash=plan_hash,
                    schedule_kind='recurring_window', timezone='UTC', local_start='09:00', local_pause='17:00', days_of_week=[1, 2, 3, 4, 5],
                    wind_down_seconds=300, missed_policy='hold', auto_resume_next_window=True, state='active', revision=1,
                    invalidated_reason=None, dst_policy='skip_missing_shift_repeated')

    def schedule_run(self, scope, plan_id, run, stop_epoch, *, consents=1, schedules=1):
        """Run-specific schedules, run bindings and quota-resume consents (with origins)."""
        w = self.world
        self.project_id = scope['project_id']
        with self.recorder.call(self.owner_id, 'schedule_run') as slot:
            writes, ids = [], dict(schedules=[], consents=[])
            operation, tx = uid('TEST_ONLY:schedule-birth'), uid('TEST_ONLY:schedule-birth-tx')
            for _ in range(schedules):
                sid = oid('sched')
                k = self.keys(scope, sid)
                sched = self.wrap('execution_schedule', k['schedule'], self.schedule_record(scope, sid, 'assistant_plan_run', run['plan_run_id'],
                                  run['plan_version'], run['plan_hash']), source_revision=1)
                binding = self.wrap('execution_schedule_run_binding', k['binding'], dict(schema_id='pm.execution.schedule_run_binding.v1',
                                    schema_version='1.0.0', schedule_id=sid, project_id=scope['project_id'], plan_run_id=run['plan_run_id'],
                                    target_kind='assistant_plan_run', target_id=run['plan_run_id'], assistant_plan_id=plan_id,
                                    plan_version=run['plan_version'], plan_hash=run['plan_hash'],
                                    original_schedule_admission_ref=uid('TEST_ONLY:schedule-admission')), source_revision=1)
                for family, key, value, method in (('execution_schedule', k['schedule'], sched, 'owner.scheduling.schedule.original.write.v1'),
                                                   ('execution_schedule_run_binding', k['binding'], binding, 'owner.scheduling.run_binding.original.write.v1')):
                    okey, origin = self.origin(family, key, value, issuer_method=method, operation_id=operation, transaction_id=tx,
                                               causation_ref=operation, prior=None, at=self.clock.now())
                    writes += [w.put(family, key, value), w.put('plan_cancel_source_origin', okey, origin)]
                ids['schedules'].append(sid)
            for _ in range(consents):
                now = self.clock.now()
                consent = dict(schema_id='pm.runtime.quota_resume_consent.v1', schema_version='1.0.0', consent_id=oid('consent'),
                               run_id=run['plan_run_id'], provider_id='TO-provider', account_id=oid('acct'), enabled=True,
                               reset_time=None, reset_truth='unknown', confidence=None,
                               execution_schedule_id=ids['schedules'][0] if ids['schedules'] else None, user_stop_epoch=stop_epoch,
                               created_at=now, updated_at=now)
                key = self.consent_key(scope, consent)
                value = self.wrap('quota_resume_consent', key, consent, source_revision=1)
                okey, origin = self.origin('quota_resume_consent', key, value, issuer_method='owner.scheduling.consent.original.write.v1',
                                           operation_id=operation, transaction_id=tx, causation_ref=operation, prior=None, at=self.clock.now())
                writes += [w.put('quota_resume_consent', key, value), w.put('plan_cancel_source_origin', okey, origin)]
                ids['consents'].append(key)
            if writes:
                w.write(writes)
            slot.set(ids)
            return ids

    def schedule_message(self, scope):
        """An unrelated scheduled message in the same project; cancellation must leave it byte-unchanged."""
        w = self.world
        sid = uid('TEST_ONLY:schedule-message')
        k = self.keys(scope, sid)
        value = self.wrap('execution_schedule', k['schedule'], self.schedule_record(scope, sid, 'scheduled_message', uid('TEST_ONLY:message'),
                          None, None), source_revision=1)
        operation = uid('TEST_ONLY:message-schedule')
        okey, origin = self.origin('execution_schedule', k['schedule'], value, issuer_method='owner.scheduling.schedule.original.write.v1',
                                   operation_id=operation, transaction_id=uid('TEST_ONLY:tx'), causation_ref=operation, prior=None, at=self.clock.now())
        w.write([w.put('execution_schedule', k['schedule'], value), w.put('plan_cancel_source_origin', okey, origin)])
        return k['schedule']

    def selection(self, scope, run_id):
        """The owner's complete run selection: every run-targeted schedule, its binding and every run consent."""
        w = self.world
        with self.recorder.call(self.owner_id, 'state_run_selection') as slot:
            require('scheduler/database_unavailable', getattr(self, 'available', True) is True)
            schedules = sorted(k for k, c in w.storage.cells.get('execution_schedule', {}).items()
                               if c['value']['record']['target_kind'] == 'assistant_plan_run' and c['value']['record']['target_id'] == run_id)
            consents = sorted(k for k, c in w.storage.cells.get('quota_resume_consent', {}).items() if c['value']['record']['run_id'] == run_id)
            statement = dict(schema_id='pm.test_only.scheduler_run_selection.v1', schema_version='1.0.0', run_id=run_id,
                             schedules=[dict(schedule=k, schedule_sha256=row_sha(w.value('execution_schedule', k)),
                                             binding=k.replace('execution_schedule.v1:', 'execution_schedule_run_binding.v1:')) for k in schedules],
                             consents=[dict(consent=k, consent_sha256=row_sha(w.value('quota_resume_consent', k))) for k in consents],
                             owner=self.native_owner(), complete=True)
            key = uid('TEST_ONLY:scheduler-selection')
            self._issue(None, statement, kind='run_selection', ref=key)
            slot.set(dict(key=key, schedules=len(schedules), consents=len(consents)))
            return key, statement

    def callback(self, scope, plan_owner, plan_id, run_id, *, run_epoch, stop_epoch):
        """Admit a late execution callback only for the current run epoch, unfinished run and current Stop epoch."""
        w = self.world
        with self.recorder.call(self.owner_id, 'admit_callback', dict(run_epoch=run_epoch, stop_epoch=stop_epoch)) as slot:
            run = w.value('assistant_plan_run', plan_owner.keys(scope, plan_id, run_id)['run'])
            stop = w.host_stop.record(scope)
            require('scheduler/callback_run_state', run['record']['state'] in CANCELLABLE_RUN)
            require('scheduler/callback_run_epoch', run['record']['plan_run_epoch'] == run_epoch)
            require('scheduler/callback_stop_epoch', stop['user_stop_epoch'] == stop_epoch and stop['latched'] is False)
            key = uid('TEST_ONLY:callback-admission')
            w.write([w.put(self.CALLBACKS, key, dict(run_id=run_id, run_epoch=run_epoch, stop_epoch=stop_epoch))])
            slot.set(dict(key=key))
            return key


class HoldOwner(WorldOwner):
    """Current deletion/hold source for the scope (no hold, no deletion request)."""
    role = 'deletion_hold'
    FAMILY = 'TEST_ONLY:deletion_hold_source'

    def source(self, scope):
        w = self.world
        key = 'deletion_hold:' + scoped_key(scope)
        if w.value(self.FAMILY, key) is None:
            w.write([w.put(self.FAMILY, key, dict(schema_id='pm.test_only.deletion_hold_source.v1', schema_version='1.0.0',
                                                  scope=copy.deepcopy(scope), holds=[], deletion_requested=False, owner_epoch=self.owner_epoch))])
        return key, w.value(self.FAMILY, key)


# ------------------------------------------------------------------ template engine

class Mode:
    """Template mode: placeholders. Commit mode: actual values, recording substitutions."""

    def __init__(self, template, time=None, receipts=None):
        self.template, self.actual_time, self.receipts = template, time, receipts or {}
        self.slots = {}

    def time(self):
        if self.template:
            return SLOT % 'commit_time'
        self.slots['commit_time'] = self.actual_time
        return self.actual_time

    def receipt(self, kind):
        if self.template:
            return SLOT % ('receipt_sha:' + kind)
        self.slots['receipt_sha:' + kind] = self.receipts[kind]
        return self.receipts[kind]

    def h(self, target, value):
        if self.template:
            return SLOT % ('sha:' + target)
        digest = row_sha(value)
        self.slots['sha:' + target] = digest
        return digest


def to_term(value):
    if type(value) is dict:
        return dict(kind='object', members=[dict(name=k, value=to_term(value[k])) for k in sorted(value, key=lambda s: s.encode('utf-8'))])
    if type(value) is list:
        return dict(kind='array', items=[to_term(v) for v in value])
    if type(value) is str and '\x00SLOT:' in value:
        parts, rest = [], value
        while rest:
            i = rest.find('\x00SLOT:')
            if i < 0:
                parts.append(dict(literal=rest))
                break
            if i > 0:
                parts.append(dict(literal=rest[:i]))
            j = rest.index('\x00', i + 1)
            parts.append(dict(slot_id=rest[i + 6:j]))
            rest = rest[j + 1:]
        if len(parts) == 1 and 'slot_id' in parts[0]:
            return dict(kind='slot', slot_id=parts[0]['slot_id'])
        return dict(kind='concat', parts=parts)
    return dict(kind='literal', value=value)


def evaluate(term, slots):
    kind = term['kind']
    if kind == 'literal':
        return term['value']
    if kind == 'array':
        return [evaluate(t, slots) for t in term['items']]
    if kind == 'object':
        return {m['name']: evaluate(m['value'], slots) for m in term['members']}
    if kind == 'slot':
        require('template/unbound_slot/' + term['slot_id'], term['slot_id'] in slots)
        return slots[term['slot_id']]
    if kind == 'concat':
        out = ''
        for part in term['parts']:
            if 'literal' in part:
                out += part['literal']
            else:
                require('template/unbound_slot/' + part['slot_id'], part['slot_id'] in slots)
                out += slots[part['slot_id']]
        return out
    raise Refusal('template/kind')


def slot_uses(term, target, path=''):
    kind = term['kind']
    if kind == 'slot':
        return [(term['slot_id'], target, path or '/')]
    if kind == 'concat':
        return [(p['slot_id'], target, path or '/') for p in term['parts'] if 'slot_id' in p]
    out = []
    if kind == 'array':
        for i, t in enumerate(term['items']):
            out += slot_uses(t, target, '%s/%d' % (path, i))
    if kind == 'object':
        for m in term['members']:
            out += slot_uses(m['value'], target, path + '/' + m['name'].replace('~', '~0').replace('/', '~1'))
    return out


def integer_paths(value, path=''):
    if type(value) is dict:
        return [p for k in value for p in integer_paths(value[k], path + '/' + k.replace('~', '~0').replace('/', '~1'))]
    if type(value) is list:
        return [p for i, v in enumerate(value) for p in integer_paths(v, '%s/%d' % (path, i))]
    if type(value) is int and type(value) is not bool:
        return [(path, value)]
    return []


def pointer_get(value, pointer):
    for part in pointer.split('/')[1:]:
        part = part.replace('~1', '/').replace('~0', '~')
        if type(value) is list:
            value = value[int(part)]
        elif type(value) is dict and part in value:
            value = value[part]
        else:
            return None
    return value


# ------------------------------------------------------------------ route

class BoundPlanCancel(AS.AssignedCancel):
    code = 'C2'

    def __init__(self, world, *, state='active', schedules=1, consents=1, **kw):
        self.n_schedules, self.n_consents = schedules, consents
        super().__init__(world, state=state, **kw)
        if kw.get('birth', True):
            self.bind_plan()

    # ---------------------------------------------------------- association setup
    def bind_plan(self):
        w = self.world
        for attr, cls in (('plans', PlanOwner), ('scheduler', SchedulerOwner), ('holds', HoldOwner)):
            if not hasattr(w, attr):
                setattr(w, attr, cls(w))
        self.plan_id, self.run_id = w.plans.create_and_start(self.scope, self.scope['goal_id'])
        run = w.value('assistant_plan_run', w.plans.keys(self.scope, self.plan_id, self.run_id)['run'])['record']
        self.schedule_ids = w.scheduler.schedule_run(self.scope, self.plan_id, run, w.host_stop.record(self.scope)['user_stop_epoch'],
                                                    schedules=self.n_schedules, consents=self.n_consents)
        self.message_schedule_key = w.scheduler.schedule_message(self.scope)
        w.holds.source(self.scope)
        self.commit_plan_binding(run)

    def commit_plan_binding(self, run):
        """reserve_binding then commit_plan_binding: one joint Goal/Plan transaction (PGOAL joint issuer)."""
        w = self.world
        with self.call('commit_plan_binding') as slot:
            sel = w.binding.require_writer('plan_goal_birth_or_attach')
            read = w.binding.read_current(self.scope)
            control = read['control']
            gk = dict(storage_instance_id=w.storage_id, **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')})
            binding_key = 'goal_plan_binding.v1:%s:%s' % (scoped_key(self.scope), hx(self.run_id))
            gpb = dict(goal_id=self.scope['goal_id'], assistant_plan_id=self.plan_id, plan_version=run['plan_version'], plan_hash=run['plan_hash'],
                       plan_run_id=self.run_id, todo_list_ref=uid('TEST_ONLY:todo-list'), planunit_bundle_ref=None)
            gpb_w = C1.wrapper(w, BINDING, 'StorageGoalPlanBinding', gpb, binding_key)
            run_key = w.plans.keys(self.scope, self.plan_id, self.run_id)['run']
            run_value = w.value('assistant_plan_run', run_key)
            psel = lambda family, key, value: dict(family_id=family, physical_key=key, schema_id=value['schema_id'],
                                                   schema_version=value['schema_version'], codec_id='pm.storage.canonical_msgpack.v1',
                                                   complete_value_sha256=row_sha(value))
            tx_id = uid('TEST_ONLY:plan-binding-tx')
            association = dict(association_kind='assistant_plan', binding=gpb, original_binding_source=psel('goal_plan_binding', binding_key, gpb_w),
                               original_plan_run_source=psel('assistant_plan_run', run_key, run_value), execution_owner_ref=w.plans.owner_id,
                               execution_owner_epoch=w.plans.owner_epoch, original_binding_transaction_id=tx_id)
            prev = control['value']['record']['current_revision']
            revision = check(w, 'BindingRevision', dict(scope=gk, binding_revision=1, previous_revision=prev, active_run_ref=self.run_id,
                             associations=[association], host_execution_owner_ref=w.host_stop.owner_id,
                             host_execution_owner_epoch=w.host_stop.owner_epoch, writer_domain=sel,
                             original_goal_birth_or_binding_operation=tx_id), BINDING + '#/$defs/')
            bk = w.binding.keys(self.scope, 1)
            rev_w = w.binding.wrap('StorageBindingRevision', bk['revision'], revision)
            _, decision = w.permissions.grant(w.plans.owner_id, copy.deepcopy(self.scope), 'goal.execution_binding.plan_attach')
            origin = check(w, 'BindingOrigin', dict(scope=gk, binding_revision=1, issued_revision_key=bk['revision'],
                           issued_revision_sha256=row_sha(rev_w), before_control_sha256=row_sha(control['value']),
                           original_goal_body_sha256=row_sha(w.goal.body_cell(self.scope)['value']),
                           original_goal_control_sha256=row_sha(w.goal.control(self.scope)['value']),
                           original_stop_control_sha256=row_sha(w.host_stop.current(self.scope)['value']),
                           original_source_members=[psel('goal_plan_binding', binding_key, gpb_w), psel('assistant_plan_run', run_key, run_value)],
                           issuer=transaction_record(w.plans, 'owner.goal.execution_binding.commit_plan_binding.v1', tx_id,
                                                     w.permissions.selection(decision), tx_id, self.run_id)), BINDING + '#/$defs/')
            origin_w = w.binding.wrap('StorageBindingOrigin', bk['origin'], origin)
            new_control = dict(control['value']['record'], control_epoch=NR.uint64(control['value']['record']['control_epoch'] + 1, 'C2/control'),
                               binding_revision=1, current_revision=psel(w.binding.REVISION, bk['revision'], rev_w),
                               current_origin=psel(w.binding.ORIGIN, bk['origin'], origin_w), pending=None)
            check(w, 'BindingControl', new_control, BINDING + '#/$defs/')
            ctl_key = w.binding.keys(self.scope)['control']
            tx = w.write([w.put('goal_plan_binding', binding_key, gpb_w), w.put(w.binding.REVISION, bk['revision'], rev_w),
                          w.put(w.binding.ORIGIN, bk['origin'], origin_w),
                          w.put(w.binding.CONTROL, ctl_key, w.binding.wrap('StorageBindingControl', ctl_key, new_control), expected=control['version'])])
            w.plan_inventory.add(self.scope, 'assistant_plan_association', dict(plan_run_id=self.run_id, binding_key=binding_key))
            self.binding_key = binding_key
            slot.set(dict(tx=tx['tx_id']))

    # ---------------------------------------------------------- sources
    def plan_keys(self):
        return self.world.plans.keys(self.scope, self.plan_id, self.run_id)

    def observe_sources(self):
        out = super().observe_sources()
        w = self.world
        observe = A.observation_digest
        k = self.plan_keys()
        out['plan'] = observe([w.cell('assistant_plan_record', k['plan']), w.cell('assistant_plan_run', k['run']), w.plans.owner_epoch])
        out['scheduler'] = observe([sorted((key, c['version']) for key, c in w.storage.cells.get('execution_schedule', {}).items()),
                                    sorted((key, c['version']) for key, c in w.storage.cells.get('quota_resume_consent', {}).items()),
                                    w.scheduler.owner_epoch])
        return out

    def plan_expected(self, plan, run):
        w = self.world
        k = self.plan_keys()
        return check(w, 'PlanExpected', dict(plan=plan, plan_source=w.plans.binding('assistant_plan_record', k['plan']), run=run,
                     run_source=w.plans.binding('assistant_plan_run', k['run']), expected_version=plan['record']['approved_version'],
                     expected_hash=plan['record']['approved_hash'], expected_currentness_hash=row_sha(run)))

    def plan_scope(self):
        return dict(self.scope, assistant_plan_id=self.plan_id, plan_run_id=self.run_id)

    def goal_carriers(self, *, with_source):
        w = self.world
        read = w.binding.read_current(self.scope)
        hkey = 'goal_execution_writer_domain_head.v1:' + w.binding.storage_key()
        out = dict(body_control=w.goal.control(self.scope)['value'], host_stop_control=w.host_stop.current(self.scope)['value'],
                   binding_selection=w.value('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection')),
                   binding_control=read['control']['value'], binding_revision=read['revision']['value'], binding_origin=read['origin']['value'],
                   writer_domain=read['domain'], writer_domain_head=w.value(w.binding.HEAD, hkey),
                   goal_plan_binding=w.value('goal_plan_binding', self.binding_key))
        body = w.goal.body_cell(self.scope)['value']
        out.update(original_owner_source_ref=w.goal.keys(self.scope)['body'], original_owner_source_sha256=row_sha(body))
        if with_source:
            out['original_source_audit'] = w.value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'))
        return copy.deepcopy(out)

    # ---------------------------------------------------------- bound C-source
    def capture_source(self, request=None, sir_handle=None):
        w = self.world
        request = copy.deepcopy(self.request if request is None else request)
        sir_handle = self.sir_handle if sir_handle is None else sir_handle
        with self.call('capture_source', dict(request=request)) as slot:
            entry = self.observe_sources()
            self.check('GoalCancelRequestV2', request)
            ref, accepted = A.acquire(w.registry, w.sir.owner_id, 'sir', sir_handle)
            require('C2/capture_source/accepted_dispatch', same(accepted['request'], request))
            require('C2/capture_source/accepted_custody', same(w.sir.stored(request['command_instance_id']), accepted))
            existing = w.value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'))
            if existing is not None:
                require('C2/capture_source/retry_conflict', same(existing['record']['request'], request))
                return copy.deepcopy(existing['record'])
            require('C2/capture_source/writer_cutoff', w.binding.domain_withdrawn is False)
            require('C2/capture_source/permission', w.permissions.allowed(request['permission_snapshot_ref'], request['actor_ref'], 'goal.cancel'))
            snapshot = w.goal.snapshot(self.scope)
            body = snapshot['body']
            control_cell = w.goal.control(self.scope)
            control = control_cell['value']['record']
            require('C2/capture_source/legal_state', body['state'] in C1.LEGAL_STATES)
            require('C2/capture_source/not_cancelled', control['cancellation_receipt_ref'] is None and control['cancellation_pending'] is None)
            require('C2/capture_source/expected_revision', request['expected_revision'] == body['revision'])
            require('C2/capture_source/expected_currentness', request['expected_currentness_hash'] == body['currentness_hash'])
            require('C2/capture_source/pending_unresolved', control['pending'] is None)
            read = w.binding.read_current(self.scope)
            self.at('capture_source', 'after_binding_read')
            self.recheck('capture_source', 'after_binding_read', entry)
            brev, bctl = read['revision']['value']['record'], read['control']['value']['record']
            require('C2/capture_source/single_plan_association', len(brev['associations']) == 1
                    and brev['associations'][0]['association_kind'] == 'assistant_plan')
            require('C2/capture_source/binding_pending', bctl['pending'] is None)
            association = brev['associations'][0]
            gpb_cell = w.value('goal_plan_binding', self.binding_key)
            require('C2/capture_source/goal_plan_binding_source', gpb_cell is not None and same(gpb_cell['record'], association['binding'])
                    and row_sha(gpb_cell) == association['original_binding_source']['complete_value_sha256'])
            k = self.plan_keys()
            plan, run = w.value('assistant_plan_record', k['plan']), w.value('assistant_plan_run', k['run'])
            self.at('capture_source', 'after_plan_read')
            self.recheck('capture_source', 'after_plan_read', entry)
            require('C2/capture_source/plan_join', plan is not None and run is not None
                    and association['binding']['assistant_plan_id'] == plan['record']['assistant_plan_id'] == run['record']['assistant_plan_id']
                    and association['binding']['plan_run_id'] == run['record']['plan_run_id']
                    and association['binding']['plan_version'] == run['record']['plan_version'] == plan['record']['approved_version']
                    and association['binding']['plan_hash'] == run['record']['plan_hash'] == plan['record']['approved_hash'])
            require('C2/capture_source/run_cancellable', run['record']['state'] in CANCELLABLE_RUN and plan['record']['control_state'] == 'building')
            require('C2/capture_source/run_goal', run['record']['goal_ref'] == self.scope['goal_id'] and brev['active_run_ref'] == self.run_id)
            require('C2/capture_source/execution_owner', association['execution_owner_ref'] == w.plans.owner_id
                    and association['execution_owner_epoch'] == w.plans.owner_epoch)
            for owner in (w.workflow_inventory,):
                handle = owner.inventory(self.scope)
                _, statement = A.acquire(w.registry, owner.owner_id, owner.role, handle)
                require('C2/capture_source/no_workflow_association', statement['members'] == [])
            stop = w.host_stop.record(self.scope)
            history = w.goal.history_cells(self.scope)
            inventory = [dict(revision_key=w.goal.keys(self.scope, int(n))['revision'], revision_outer_sha256=row_sha(c[0]['value']),
                              origin_key=w.goal.keys(self.scope, int(n))['origin'], origin_outer_sha256=row_sha(c[1]['value']))
                         for n, c in sorted(history.items(), key=lambda x: int(x[0]))]
            gk = w.goal.keys(self.scope)
            selection_key = self.key('goal_cancel_binding_selection')
            binding = self.check('ExecutionBinding', dict(kind='bound_plan', active_run_ref=self.run_id, goal_plan_binding_ref=self.binding_key,
                                 goal_plan_binding_sha256=row_sha(gpb_cell), assistant_plan_id=self.plan_id, plan_run_id=self.run_id,
                                 plan_version=run['record']['plan_version'], plan_hash=run['record']['plan_hash'],
                                 execution_owner_ref=association['execution_owner_ref'], original_binding_source_ref=selection_key))
            body_selection = self.check('BodySelection', {**self.scope, 'body_key': gk['body'],
                'body_outer_sha256': row_sha(w.goal.body_cell(self.scope)['value']), 'body_semantic_sha256': control['body_sha256'],
                'revision': body['revision'], 'currentness_hash': body['currentness_hash'], 'control_key': gk['control'],
                'control_outer_sha256': row_sha(control_cell['value']), 'control_epoch': control['control_epoch'],
                'latest_objective_revision': control['latest_objective_revision'], 'latest_revision_hash': control['latest_revision_hash'],
                'origin_key': control['origin_key'], 'complete_history_origin_inventory_sha256': self.h(inventory),
                'state': body['state'], 'active_run_ref': body['active_run_ref']})
            from pm_goal_current_writer_oracles import recipe
            self.event_id, self.event_key = recipe('goal.cancelled', {**self.scope, 'command_id': C1.COMMAND,
                                                   'command_instance_id': request['command_instance_id'], 'operation_id': self.operation_id})
            metadata = self.check('ProducerMetadata', dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project',
                event_id=self.event_id, event_type='goal.cancelled', project_id=self.scope['project_id'], thread_id=self.scope['thread_id'],
                run_id=None, node_id=None, attempt_id=None, actor_ref=request['actor_ref'], requested_account_ref=None, effective_account_ref=None,
                occurred_at_utc=w.sir.clock.now(), producer_sequence_id=None, correlation_id=accepted['dispatch_id'], causation_event_id=None,
                parent_event_id=None, idempotency_key=self.event_key, payload_schema_id=C1.PAYLOAD_SCHEMA, payload_ref=None,
                redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key', migration=dict(migrated_from_schema_id=None,
                migrated_from_schema_version=None, migration_id=None, compatibility_event_type=None)))
            source = self.check('SourceAudit', dict(schema_id='pm.goal.cancel.source_audit.v1', schema_version='1.0.0', **self.scope,
                request=request, normalized_identity=accepted['identity'], dispatch_id=accepted['dispatch_id'],
                command_outcome_ref=accepted['command_outcome_ref'], nonterminal_outcome=accepted['nonterminal'],
                original_user_cancel_acceptance_ref=accepted['acceptance_ref'], source_authority_ref=accepted['source_authority_ref'],
                source_authority_epoch=accepted['owner_epoch'], original_body=body_selection, original_execution_binding=binding,
                original_stop_control_sha256=row_sha(w.host_stop.current(self.scope)['value']), captured_user_stop_epoch=stop['user_stop_epoch'],
                captured_continuation_epoch=stop['continuation_epoch'], producer_metadata=metadata, captured_at=w.goal.clock.now()))
            source_w = self.wrap('StorageSourceAudit', source)
            progress = self.check('Progress', dict(schema_id='pm.goal.cancel.progress.v1', schema_version='1.0.0', **self.scope,
                operation_id=self.operation_id, source_audit_sha256=row_sha(source_w), progress_epoch=0, phase='source_admitted',
                stop_intent=None, stop_receipt=None, reservation_sha256=None, cancellation_receipt=None, owner_settlement=None,
                producer_input=None, publication=None, control_publication=None, resolution_owner_ref=self.coordinator_id))
            bsel = lambda family, cell: dict(family_id=family, physical_key=cell['value']['physical_key'], schema_id=cell['value']['schema_id'],
                                             schema_version=cell['value']['schema_version'], codec_id='pm.storage.canonical_msgpack.v1',
                                             complete_value_sha256=row_sha(cell['value']))
            hkey = 'goal_execution_writer_domain_head.v1:' + w.binding.storage_key()
            reader = transaction_record(w.binding, 'owner.goal.execution_binding.read_current_for_cancel.v1', self.operation_id,
                                        w.permissions.selection(self.cancel_decision), uid('TEST_ONLY:binding-read-tx'), self.binding_key)
            selection = self.check('BindingSelection', dict(scope=copy.deepcopy(self.scope), operation_id=self.operation_id,
                original_command_instance_id=request['command_instance_id'], original_dispatch_id=accepted['dispatch_id'],
                binding_control=bsel(w.binding.CONTROL, read['control']), binding_revision=bsel(w.binding.REVISION, read['revision']),
                binding_origin=bsel(w.binding.ORIGIN, read['origin']), writer_domain_head=bsel(w.binding.HEAD, w.cell(w.binding.HEAD, hkey)),
                writer_domain=read['domain_selection'], original_goal_body_sha256=body_selection['body_outer_sha256'],
                original_goal_control_sha256=body_selection['control_outer_sha256'], original_stop_control_sha256=source['original_stop_control_sha256'],
                actual_active_run_ref=self.run_id, original_pending_binding_operation_id=None, original_pending_binding_candidate_sha256=None,
                association_count=1, disposition='bound_plan_requires_owner_settlement', original_reader=reader), BINDING)
            selection_w = self.wrap('StorageBindingSelection', selection, selection_key, BINDING)
            carriers = self.goal_carriers(with_source=False)
            carriers['binding_selection'] = selection_w
            capture_entry = check(w, 'BoundSourceCaptureEntry', dict(request=request, normalized_identity=accepted['identity'],
                original_nonterminal_outcome=accepted['nonterminal'], producer_metadata=metadata, original_binding_selection=selection,
                original_goal_sources=carriers, original_plan=self.plan_expected(plan, run), original_plan_owner=w.plans.native_owner()), BOUND)
            self.at('capture_source', 'final')
            self.recheck('capture_source', 'final', entry)
            tx = w.write([w.put('goal_cancel_source_audit', self.key('goal_cancel_source_audit'), source_w),
                          w.put('goal_cancel_progress', self.progress_key(0), self.wrap('StorageProgress', progress)),
                          w.put('goal_cancel_progress', self.key('goal_cancel_progress') + ':head', self.wrap('StorageProgress', self._head(0, progress))),
                          w.put('goal_cancel_binding_selection', selection_key, selection_w)])
            self.source, self.progress, self.capture_entry = source, progress, capture_entry
            self.proof_key = None
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(source)

    def numeric_domains(self, reservation_source, control_epoch, pending_count):
        out = super().numeric_domains(reservation_source, control_epoch, pending_count)
        version = self.source['original_execution_binding']['plan_version']
        out.append(dict(target='goal_cancel_result', schema_branch='SucceededResult',
                        json_pointer='/control_publication/original_owner_settlement/original_execution_binding/plan_version',
                        values=[dict(minimum=version, maximum=version, step=1)],
                        original_derivation=dict(kind='original_integer_plus_offsets', source_role='source_audit',
                                                 source_json_pointer='/original_execution_binding/plan_version', additive_offsets=[0])))
        out.sort(key=lambda r: (r['target'], r['schema_branch'], r['json_pointer'].encode('utf-8')))
        return out

    def issue_assignment_audit(self):
        audit = super().issue_assignment_audit()
        check(self.world, 'BoundAssignmentEntry', dict(source_audit=self.source,
              original_binding_selection=self.world.value('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection'))['record'],
              input=self.assignment_input), BOUND)
        return audit

    # ---------------------------------------------------------- prepare.v3
    def link(self, mode):
        w = self.world
        source = w.value('goal_cancel_source_audit', self.key('goal_cancel_source_audit'))
        selection = w.value('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection'))
        return dict(scope=self.plan_scope(), operation_id=self.operation_id, cancellation_id=self.source['normalized_identity']['operation_id'],
                    original_execution_binding=self.source['original_execution_binding'],
                    original_scope_proof_ref=self.key('goal_cancel_binding_selection'), original_scope_proof_sha256=row_sha(selection),
                    cancel_source_ref=self.key('goal_cancel_source_audit'), cancel_source_sha256=row_sha(source),
                    cancellation_receipt_ref=self.key('goal_cancel_receipt'), cancellation_receipt_sha256=mode.receipt('cancellation'),
                    stop_receipt_ref=self.key('goal_cancel_stop_receipt'), stop_receipt_sha256=mode.receipt('stop'),
                    user_stop_epoch=NR.uint64(self.source['captured_user_stop_epoch'] + 1, 'C2/link_epoch'))

    def build(self, mode):
        """Every Plan/Scheduler commit value; ``mode`` supplies future time/receipt/hash values."""
        w = self.world
        ids = self.reserved
        k = self.plan_keys()
        pid = w.storage_id
        plan_b, run_b = w.value('assistant_plan_record', k['plan']), w.value('assistant_plan_run', k['run'])
        targets = {}
        link = self.link(mode)
        at = mode.time()
        cancel_id = link['cancellation_id']
        plan_a = dict(copy.deepcopy(plan_b), source_revision=plan_b['source_revision'] + 1)
        plan_a['record']['control_state'] = 'canceled'
        run_a = dict(copy.deepcopy(run_b), source_revision=run_b['source_revision'] + 1)
        run_a['record'].update(state='cancelled', plan_run_epoch=run_b['record']['plan_run_epoch'] + 1)
        anchor = dict(storage_instance_id=pid, project_id=self.scope['project_id'], thread_id=self.scope['thread_id'],
                      assistant_plan_id=self.plan_id, plan_run_id=self.run_id, terminal_state='cancelled',
                      original_operation_id=ids['plan_operation'], original_transaction_id=ids['joint_transaction'], settled_at_utc=at,
                      settlement_source_revision=run_a['source_revision'], settlement_plan_run_epoch=run_a['record']['plan_run_epoch'])
        run_a['run_completion_anchor'] = anchor
        targets['plan'] = ('assistant_plan_record', k['plan'], plan_a, 'changed_original', plan_b)
        targets['run'] = ('assistant_plan_run', k['run'], run_a, 'changed_original', run_b)
        reason = 'assistant_plan_run_cancelled:' + cancel_id
        schedule_rows, consent_rows = [], []
        for sel in self.scheduler_statement['schedules']:
            before = w.value('execution_schedule', sel['schedule'])
            after = copy.deepcopy(before)
            if before['record']['state'] in ('active', 'paused'):
                after['source_revision'] = before['source_revision'] + 1
                after['record'].update(state='invalidated', revision=before['record']['revision'] + 1, invalidated_reason=reason)
            tid = 'schedule:' + before['record']['schedule_id']
            targets[tid] = ('execution_schedule', sel['schedule'], after, 'changed_original' if after != before else 'preserved_original', before)
            binding = w.value('execution_schedule_run_binding', sel['binding'])
            targets['run_binding:' + before['record']['schedule_id']] = ('execution_schedule_run_binding', sel['binding'], binding,
                                                                         'preserved_original', binding)
            schedule_rows.append((tid, before, after, sel['binding']))
        for sel in self.scheduler_statement['consents']:
            before = w.value('quota_resume_consent', sel['consent'])
            after = copy.deepcopy(before)
            if before['record']['enabled'] is True:
                after['source_revision'] = before['source_revision'] + 1
                after['record'].update(enabled=False, updated_at=at)
            tid = 'consent:' + before['record']['consent_id']
            targets[tid] = ('quota_resume_consent', sel['consent'], after, 'changed_original' if after != before else 'preserved_original', before)
            consent_rows.append((tid, before, after))
        origins = {}

        def origin_for(tid, owner, method, operation, anchor_value=None):
            family, key, value, disposition, before = targets[tid]
            digest = mode.h(tid, value)
            record = dict(storage_instance_id=pid, project_id=self.scope['project_id'], owner=owner.native_owner(), original_operation_id=operation,
                          original_transaction_id=ids['joint_transaction'], issuer_method=method, issued_family_id=family, issued_physical_key=key,
                          issued_physical_sha256=digest, prior_physical_sha256=None if before is None else row_sha(before),
                          source_revision=value.get('source_revision', 1), original_causation_ref=self.key('goal_cancel_receipt'),
                          issued_at_utc=at, run_completion_anchor=anchor_value)
            okey = 'plan_cancel_source_origin.v1:%s:%s:%s' % (hx(pid), hx(key), digest)
            ovalue = dict(schema_id='pm.storage_value.plan_cancel_source_origin.v1', schema_version='1.0.0', storage_instance_id=pid,
                          physical_key=okey, record=record)
            otid = 'origin:' + tid
            targets[otid] = ('plan_cancel_source_origin', okey, ovalue, 'new_original', None)
            origins[tid] = (okey, ovalue, digest, mode.h(otid, ovalue))
            return origins[tid]

        def after_binding(tid):
            family, key, value, _, _ = targets[tid]
            okey, ovalue, digest, odigest = origins[tid]
            return dict(source=dict(storage_instance_id=pid, family_id=family, physical_key=key, schema_id=value['schema_id'], schema_version='1.0.0',
                                    physical_value_sha256=digest),
                        origin=dict(storage_instance_id=pid, family_id='plan_cancel_source_origin', physical_key=okey,
                                    schema_id='pm.storage_value.plan_cancel_source_origin.v1', schema_version='1.0.0', physical_value_sha256=odigest))

        P, SQ = 'owner.assistant_plan.cancel_bound_run.commit.v1', 'owner.scheduling.invalidate_cancelled_execution.commit.v1'
        origin_for('plan', w.plans, P, ids['plan_operation'])
        origin_for('run', w.plans, P, ids['plan_operation'], anchor_value=anchor)
        schedule_effects, consent_effects = [], []
        for tid, before, after, bkey in schedule_rows:
            if targets[tid][3] == 'changed_original':
                origin_for(tid, w.scheduler, SQ, ids['scheduler_operation'])
                schedule_effects.append(dict(schedule_id=before['record']['schedule_id'], run_binding=w.scheduler.binding('execution_schedule_run_binding', bkey),
                                             change=dict(before=w.scheduler.binding('execution_schedule', targets[tid][1]), after=after_binding(tid)),
                                             original_state=before['record']['state'], result_state='invalidated',
                                             invalidated_reason_sha256=sha(reason.encode('utf-8'))))
        for tid, before, after in consent_rows:
            if targets[tid][3] == 'changed_original':
                origin_for(tid, w.scheduler, SQ, ids['scheduler_operation'])
                consent_effects.append(dict(consent_id=before['record']['consent_id'], provider_id=before['record']['provider_id'],
                                            account_id=before['record']['account_id'],
                                            change=dict(before=w.scheduler.binding('quota_resume_consent', targets[tid][1]), after=after_binding(tid)),
                                            result_enabled=False))
        base = '%s:%s' % (hx(pid), hx(self.scope['project_id']))
        effect_key = 'plan_cancel_effect.v1:%s:%s:%s:%s' % (base, hx(self.scope['thread_id']), hx(self.run_id), hx(cancel_id))
        effect = dict(schema_id='pm.storage_value.plan_cancel_effect.v1', schema_version='1.0.0', storage_instance_id=pid, physical_key=effect_key,
                      record=dict(link=link, original_operation_id=ids['plan_operation'], original_transaction_id=ids['joint_transaction'],
                                  owner=w.plans.native_owner(),
                                  plan_change=dict(before=w.plans.binding('assistant_plan_record', k['plan']), after=after_binding('plan')),
                                  run_change=dict(before=w.plans.binding('assistant_plan_run', k['run']), after=after_binding('run')),
                                  plan_control_state='canceled', plan_run_state='cancelled', prior_plan_run_epoch=run_b['record']['plan_run_epoch'],
                                  result_plan_run_epoch=run_a['record']['plan_run_epoch'], safe_stop_source_ref=w.plans.owner_id,
                                  callback_domain_ref=self.callback_domain, committed_at_utc=at))
        targets['plan_effect'] = ('plan_cancel_effect', effect_key, effect, 'new_original', None)
        origin_for('plan_effect', w.plans, P, ids['plan_operation'])
        sq_key = 'schedule_quota_cancel_effect.v1:%s:%s:%s' % (base, hx(self.run_id), hx(cancel_id))
        sq = dict(schema_id='pm.storage_value.schedule_quota_cancel_effect.v1', schema_version='1.0.0', storage_instance_id=pid, physical_key=sq_key,
                  record=dict(link=link, original_operation_id=ids['scheduler_operation'], original_transaction_id=ids['joint_transaction'],
                              owner=w.scheduler.native_owner(), scheduler_selection_source_ref=self.scheduler_selection_key,
                              scheduler_complete_selection_sha256=row_sha(self.scheduler_statement), schedule_effects=schedule_effects,
                              consent_effects=consent_effects, committed_at_utc=at))
        targets['schedule_quota_effect'] = ('schedule_quota_cancel_effect', sq_key, sq, 'new_original', None)
        origin_for('schedule_quota_effect', w.scheduler, SQ, ids['scheduler_operation'])
        result_key = 'assistant_plan_cancel_result.v1:%s:%s:%s:%s' % (base, hx(self.scope['thread_id']), hx(self.run_id), hx(cancel_id))
        result = dict(schema_id='pm.storage_value.assistant_plan_cancel_result.v1', schema_version='1.0.0', storage_instance_id=pid,
                      physical_key=result_key, record=dict(status='committed', committed=True, revision=run_a['source_revision'],
                      currentness_hash=origins['run'][2], receipt_refs=[effect_key, sq_key], observable_work=None, error=None, reason=None,
                      replay_of=None, original_plan_effect=after_binding('plan_effect')),
                      original_operation_identity=self.operation_identity())
        targets['result'] = ('assistant_plan_cancel_result', result_key, result, 'new_original', None)
        origin_for('result', w.plans, P, ids['plan_operation'])
        settlement = dict(kind='bound_plan_settled', original_execution_binding=self.source['original_execution_binding'],
                          original_scope_proof_ref=link['original_scope_proof_ref'], original_scope_proof_sha256=link['original_scope_proof_sha256'],
                          original_owner_settlement_ref=result_key, original_owner_settlement_sha256=origins['result'][2],
                          original_schedule_quota_invalidation_ref=sq_key, original_schedule_quota_invalidation_sha256=origins['schedule_quota_effect'][2])
        settled = dict(plan_result=result, plan_result_origin=origins['result'][1], replay_of=None, plan_effect=effect,
                       plan_origin=origins['plan_effect'][1], schedule_quota_effect=sq, schedule_quota_origin=origins['schedule_quota_effect'][1],
                       owner_settlement=settlement)
        targets['link'] = (None, None, link, 'passive_delivery', None)
        targets['owner_settlement'] = (None, None, settlement, 'passive_delivery', None)
        targets['settled_result'] = (None, None, settled, 'passive_delivery', None)
        return targets

    def operation_identity(self):
        ids = self.reserved
        return dict(scope=self.plan_scope(), normalized_identity=self.source['normalized_identity'], operation_id=self.operation_id,
                    cancellation_id=self.source['normalized_identity']['operation_id'],
                    original_goal_cancel_request_ref=self.source['normalized_identity']['request_ref'],
                    original_goal_cancel_request_sha256=self.source['normalized_identity']['payload_sha256'],
                    idempotency_key=self.request['idempotency_key'], original_plan_operation_id=ids['plan_operation'],
                    original_scheduler_operation_id=ids['scheduler_operation'], original_joint_transaction_id=ids['joint_transaction'])

    def before_stop_sources(self):
        w = self.world
        k = self.plan_keys()
        plan, run = w.value('assistant_plan_record', k['plan']), w.value('assistant_plan_run', k['run'])
        hold_key, hold = w.holds.source(self.scope)
        perm = w.permissions.current(self.cancel_decision)
        schedules, consents = self.expected_schedules(), self.expected_consents()
        return check(w, 'BeforeStopSources', dict(identity=dict(scope=self.plan_scope(), operation_id=self.operation_id,
            cancellation_id=self.source['normalized_identity']['operation_id'], original_execution_binding=self.source['original_execution_binding'],
            original_scope_proof_ref=self.key('goal_cancel_binding_selection'),
            original_scope_proof_sha256=row_sha(w.value('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection'))),
            original_goal_cancel_request_ref=self.source['normalized_identity']['request_ref'],
            original_goal_cancel_request_sha256=self.source['normalized_identity']['payload_sha256'], idempotency_key=self.request['idempotency_key'],
            original_plan_operation_id=self.reserved['plan_operation'], original_scheduler_operation_id=self.reserved['scheduler_operation'],
            original_joint_transaction_id=self.reserved['joint_transaction'], original_preparation_id=self.reserved['preparation']),
            current_goal=self.goal_carriers(with_source=True), plan_owner=w.plans.native_owner(), scheduler_owner=w.scheduler.native_owner(),
            plan=self.plan_expected(plan, run), schedules=schedules, consents=consents,
            scheduler_complete_selection_sha256=row_sha(self.scheduler_statement), scheduler_selection_source_ref=self.scheduler_selection_key,
            original_safe_stop_owner_ref=w.plans.owner_id, original_callback_domain_ref=self.callback_domain,
            original_permission_source_ref=self.cancel_decision, original_permission_source_sha256=row_sha(perm),
            original_deletion_hold_source_ref=hold_key, original_deletion_hold_source_sha256=row_sha(hold)))

    def expected_schedules(self):
        w = self.world
        out = []
        for sel in self.scheduler_statement['schedules']:
            out.append(dict(schedule=w.value('execution_schedule', sel['schedule']), schedule_source=w.scheduler.binding('execution_schedule', sel['schedule']),
                            run_binding=w.value('execution_schedule_run_binding', sel['binding']),
                            run_binding_source=w.scheduler.binding('execution_schedule_run_binding', sel['binding'])))
        return out

    def expected_consents(self):
        w = self.world
        return [dict(consent=w.value('quota_resume_consent', sel['consent']), consent_source=w.scheduler.binding('quota_resume_consent', sel['consent']))
                for sel in self.scheduler_statement['consents']]

    def prepare(self):
        """owner.assistant_plan.cancel_bound_run.prepare.v3: reservations and full domain preparation only."""
        w = self.world
        with self.call('prepare') as slot:
            entry = self.observe_sources()
            self._require_progress('prepare', ('source_admitted',))
            require('C2/prepare/assignment_admission', self.assignment is not None and w.storage.fence is self.fence)
            require('C2/prepare/permission', w.permissions.allowed(self.cancel_decision, self.actor_ref, 'goal.cancel'))
            self.scheduler_selection_key, self.scheduler_statement = w.scheduler.selection(self.scope, self.run_id)
            self.at('prepare', 'after_scheduler_selection')
            self.recheck('prepare', 'after_scheduler_selection', entry)
            require('C2/prepare/scheduler_selection_complete', self.scheduler_statement['complete'] is True
                    and len(self.scheduler_statement['schedules']) == self.n_schedules and len(self.scheduler_statement['consents']) == self.n_consents)
            self.callback_domain = 'TEST_ONLY:callback-domain:' + self.run_id
            k = self.plan_keys()
            plan_now, run_now = w.value('assistant_plan_record', k['plan']), w.value('assistant_plan_run', k['run'])
            captured = self.capture_entry['original_plan']
            binding = self.source['original_execution_binding']
            require('C2/prepare/plan_source', same(plan_now, captured['plan']) and plan_now['record']['approved_version'] == binding['plan_version']
                    and plan_now['record']['approved_hash'] == binding['plan_hash'])
            require('C2/prepare/run_source', same(run_now, captured['run']) and run_now['record']['state'] in CANCELLABLE_RUN)
            ids, reserved = {}, []
            for role, owner in (('plan_operation', w.plans), ('scheduler_operation', w.scheduler), ('joint_transaction', w.plans),
                                ('preparation', w.plans)):
                value = uid('TEST_ONLY:' + role.replace('_', '-'))
                record = dict(identity_role=role, value=value, owner=owner.owner_id, operation_id=self.operation_id, reserved_at=owner.clock.now())
                key = 'TEST_ONLY:plan_identity_reservation:%s:%s' % (self.operation_id.encode().hex(), role)
                ids[role] = value
                reserved.append((key, record, owner))
            self.reserved = ids
            sources = self.before_stop_sources()
            templates = self.build(Mode(template=True))
            # Every stored target must fit SP-306/SP-340's 16 KiB at the widest admissible slot values.
            widest = {}
            for tid in templates:
                widest['sha:' + tid] = '0' * 64
            widest.update(MAX_SLOT, **{'receipt_sha:stop': '0' * 64, 'receipt_sha:cancellation': '0' * 64})
            for tid, (family, key, value, disposition, before) in templates.items():
                if family is None or disposition == 'preserved_original':
                    continue
                size = len(S.canonical(evaluate(to_term(value), widest)))
                if size > S.STORED_PART_CAP:
                    unavailable = check(w, 'PreparationResult', dict(status='unavailable', reason='unrepresentable_required_value',
                                                                     action_authority='none'))
                    w.storage.abandon(self.operation_id)
                    self.fence = None
                    self.preparation_unavailable = dict(unavailable, target=tid, measured_bytes=size)
                    raise Refusal('C2/prepare/unrepresentable_required_value')
            targets, uses = [], []
            for tid, (family, key, value, disposition, before) in templates.items():
                term_value = to_term(value)
                schema = PLAN + (FAMILY_SCHEMA[family] if family else {'link': 'CancellationLink', 'owner_settlement': 'OwnerSettlement',
                                                                       'settled_result': 'SettledResult'}[tid])
                bsrc = None
                if before is not None:
                    bsrc = (w.plans if family in ('assistant_plan_record', 'assistant_plan_run') else w.scheduler).binding(family, key)
                targets.append(dict(target_id=tid, schema_ref=schema, physical_key_template=None if key is None else to_term(key),
                                    disposition=disposition, before_source=bsrc, complete_value_template=term_value))
                uses += slot_uses(term_value, tid)
                if key is not None:
                    uses += slot_uses(to_term(key), tid, '#physical_key')
            clock_key = 'TEST_ONLY:plan_commit_clock:' + self.operation_id.encode().hex()
            clock = dict(owner=w.plans.owner_id, owner_epoch=w.plans.owner_epoch, clock='monotonic_ms_utc', profile='storage_utc_z')
            receipt_owner = dict(owner=w.host_stop.owner_id, goal_owner=w.goal.owner_id, receipts=[self.key('goal_cancel_stop_receipt'),
                                                                                                  self.key('goal_cancel_receipt')])
            slots = []
            for slot_id in sorted({u[0] for u in uses}):
                consumers = [dict(target_id=t, json_pointer=p) for s, t, p in uses if s == slot_id]
                if slot_id == 'commit_time':
                    slots.append(dict(slot_id=slot_id, kind='original_timestamp', owner_source_ref=clock_key, owner_source_sha256=row_sha(clock),
                                      source_target_id=None, source_json_pointer='#joint_commit_time', output_schema_ref=PLAN + 'PlanEffect',
                                      consumer_paths=consumers))
                elif slot_id.startswith('receipt_sha:'):
                    slots.append(dict(slot_id=slot_id, kind='complete_physical_sha256', owner_source_ref=receipt_owner['receipts'][0 if slot_id.endswith('stop') else 1],
                                      owner_source_sha256=row_sha(receipt_owner), source_target_id=None, source_json_pointer='#whole_value',
                                      output_schema_ref=CANCEL + '#/$defs/' + ('StorageStopReceipt' if slot_id.endswith('stop') else 'StorageCancellationReceipt'),
                                      consumer_paths=consumers))
                else:
                    target = slot_id[4:]
                    family = templates[target][0]
                    owner = w.plans if family in ('assistant_plan_record', 'assistant_plan_run', 'plan_cancel_effect', 'assistant_plan_cancel_result') else w.scheduler
                    slots.append(dict(slot_id=slot_id, kind='complete_physical_sha256', owner_source_ref=owner.owner_id,
                                      owner_source_sha256=row_sha(owner.native_owner()), source_target_id=target, source_json_pointer='#whole_value',
                                      output_schema_ref=PLAN + FAMILY_SCHEMA[family], consumer_paths=consumers))
            numeric = []
            for tid, (family, key, value, disposition, before) in templates.items():
                if family is None:
                    continue
                for pointer, number in integer_paths(value):
                    prior, source_ref, source_pointer = self.numeric_origin(tid, templates, before, key, pointer)
                    if pointer.endswith('/link/user_stop_epoch'):
                        derivation = 'original_cancel_domain'
                    elif prior is None:
                        derivation = 'literal_native_initial'
                    elif prior == number:
                        derivation = 'preserve_original'
                    else:
                        require('C2/prepare/numeric_delta/' + tid + pointer, type(prior) is int and number == prior + 1)
                        derivation = 'increment_original_once'
                    numeric.append(dict(target_id=tid, schema_branch=FAMILY_SCHEMA[family], json_pointer=pointer, primitive_type='integer',
                                        derivation=derivation, original_source_ref=source_ref, original_json_pointer=source_pointer,
                                        original_exact_decimal=str(prior if prior is not None else number),
                                        result_exact_decimal=str(number), canonical_domain_ref=None))
            bank = json.loads((ROOT / 'Plans/assistant_plan_cancel_schema_resources.json').read_text())
            codecs = [dict(retrieval_uri=r['retrieval_uri'], document_sha256=r['sha256'], codec_id='pm.storage.canonical_msgpack.v1',
                           original_installed_owner_ref=w.codecs.owner_id, original_installed_owner_epoch=w.codecs.owner_epoch,
                           original_domain_admission_ref=w.codecs.resources[2]['original_registration_ref'])
                      for r in bank['resources'] if r['path'] in ('Plans/assistant_plan_cancel_custody.schema.json', 'Plans/goal_cancel_command_custody.schema.json')]
            policies = []
            for family in sorted({v[0] for v in templates.values() if v[0]}):
                row = next(f for f in FAMILIES if f['family_id'] == family)
                policies.append(dict(family_id=family, exact_registry_row_sha256=sha(json.dumps(row, sort_keys=True, separators=(',', ':')).encode()),
                                     policy_ref=row['retention_policy_ref'], policy_version='1.0.0',
                                     original_owner_admission_ref=w.plans.owner_id, original_storage_admission_ref=w.storage_id))
            assignment = dict(reserved_identities=[dict(identity_role=r['identity_role'], value=r['value'], original_owner_ref=o.owner_id,
                                                         original_reservation_ref=key, original_reservation_sha256=row_sha(r)) for key, r, o in reserved],
                              future_slots=slots, targets=targets, numeric_assignments=numeric, codec_resources=codecs,
                              carrier_policy_admissions=policies, current_cancel_assignment=copy.deepcopy(self.assignment))
            prepared = check(w, 'BeforeStopPrepared', dict(status='prepared_not_effected', sources=sources, **assignment,
                             complete_original_input_sha256=w.assigner.h_domain('pm.assistant_plan.cancel.before_stop_sources.v1', sources),
                             complete_assignment_sha256=w.assigner.h_domain('pm.assistant_plan.cancel.prepared_assignment.v1', assignment),
                             action_authority='none'))
            self.at('prepare', 'final')
            self.recheck('prepare', 'final', entry)
            require('C2/prepare/fence_final', w.storage.fence is self.fence)
            tx = w.write([w.put('TEST_ONLY:plan_identity_reservation', key, r) for key, r, o in reserved]
                         + [w.put('TEST_ONLY:plan_commit_clock', clock_key, clock), w.put('TEST_ONLY:plan_receipt_owner', clock_key, receipt_owner),
                            w.put(w.scheduler.SELECTION, self.scheduler_selection_key, self.scheduler_statement)])
            self.prepared, self.templates = prepared, templates
            slot.set(dict(tx=tx['tx_id'], targets=len(targets), slots=len(slots), numeric=len(numeric)))
            return copy.deepcopy(prepared)

    def numeric_origin(self, tid, templates, before, key, pointer):
        """(prior original integer, its source key, its pointer) for one target integer."""
        k = self.plan_keys()
        run_b = self.world.value('assistant_plan_run', k['run'])
        if before is not None:
            return pointer_get(before, pointer), key, pointer
        if pointer.endswith('/link/user_stop_epoch'):
            return self.source['captured_user_stop_epoch'], self.key('goal_cancel_source_audit'), '/record/captured_user_stop_epoch'
        if pointer.endswith('prior_plan_run_epoch') or pointer.endswith('result_plan_run_epoch') or pointer.endswith('settlement_plan_run_epoch'):
            return run_b['record']['plan_run_epoch'], k['run'], '/record/plan_run_epoch'
        if pointer.endswith('settlement_source_revision') or (tid == 'result' and pointer == '/record/revision'):
            return run_b['source_revision'], k['run'], '/source_revision'
        if tid.startswith('origin:') and pointer == '/record/source_revision':
            inner = templates[tid[7:]]
            prior = None if inner[4] is None else inner[4].get('source_revision')
            return prior, inner[1] if inner[4] is not None else self.key('goal_cancel_source_audit'), '/source_revision'
        if pointer.endswith('/owner_epoch') or pointer.endswith('/server_claim_epoch'):
            return pointer_get(templates[tid][2], pointer), self.world.plans.owner_id, pointer
        return None, self.key('goal_cancel_source_audit'), pointer

    def latch_and_reserve(self):
        w = self.world
        require('C2/latch_and_reserve/plan_prepared', getattr(self, 'prepared', None) is not None)
        check(w, 'BoundBeforeStopEntry', dict(source_audit=self.source,
              original_binding_selection=w.value('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection'))['record'],
              assignment_input=self.assignment_input, assignment_audit=self.assignment_audit, assignment_admission=self.assignment,
              plan_prepared=self.prepared), BOUND)
        require('C2/latch_and_reserve/prepared_assignment', same(self.prepared['current_cancel_assignment'], self.assignment))
        return super().latch_and_reserve()

    # ---------------------------------------------------------- commit.v3 + participate.v3
    def plan_commit(self, *, lose_ack=False):
        w = self.world
        with self.call('plan_commit') as slot:
            entry = self.observe_sources()
            self._require_progress('plan_commit', ('receipt_committed',))
            stop_receipt = w.value('goal_cancel_stop_receipt', self.key('goal_cancel_stop_receipt'))
            cancel_receipt = w.value('goal_cancel_receipt', self.key('goal_cancel_receipt'))
            require('C2/plan_commit/genuine_receipts', stop_receipt is not None and cancel_receipt is not None
                    and same(stop_receipt['record'], self.progress['stop_receipt'])
                    and same(cancel_receipt['record'], self.progress['cancellation_receipt']))
            stop = w.host_stop.record(self.scope)
            require('C2/plan_commit/stop_latched', stop['latched'] is True and stop['user_stop_epoch'] == self.progress['stop_receipt']['after_user_stop_epoch'])
            prepared = self.prepared
            assignment_fields = {k: prepared[k] for k in ('reserved_identities', 'future_slots', 'targets', 'numeric_assignments',
                                                          'codec_resources', 'carrier_policy_admissions', 'current_cancel_assignment')}
            checked = w.assigner.h_domain('pm.assistant_plan.cancel.prepared_assignment.v1', assignment_fields)
            require('C2/plan_commit/prepared_assignment', checked == prepared['complete_assignment_sha256'])
            for r in prepared['reserved_identities']:
                stored = w.value('TEST_ONLY:plan_identity_reservation', r['original_reservation_ref'])
                require('C2/plan_commit/reserved_identity', stored is not None and row_sha(stored) == r['original_reservation_sha256']
                        and stored['value'] == r['value'] and stored['operation_id'] == self.operation_id)
            # Current sources must still be exactly the prepared before-sources (no concurrent owner write).
            for target in prepared['targets']:
                if target['before_source'] is not None:
                    fam, key = target['before_source']['source']['family_id'], target['before_source']['source']['physical_key']
                    current = w.value(fam, key)
                    require('C2/plan_commit/before_source/' + target['target_id'], current is not None
                            and row_sha(current) == target['before_source']['source']['physical_value_sha256'])
            safe_key, safe = w.plans.safe_stop(self.scope, self.plan_id, self.run_id, stop['user_stop_epoch'])
            self.at('plan_commit', 'after_safe_stop')
            self.recheck('plan_commit', 'after_safe_stop', entry)
            require('C2/plan_commit/safe_stop_epoch', safe['user_stop_epoch'] == stop['user_stop_epoch'] and safe['safe'] is True)
            sel_key, statement = w.scheduler.selection(self.scope, self.run_id)
            require('C2/plan_commit/scheduler_membership', same({k: v for k, v in statement.items()}, self.scheduler_statement))
            self.at('plan_commit', 'after_scheduler_selection')
            self.recheck('plan_commit', 'after_scheduler_selection', entry)
            mode = Mode(template=False, time=w.plans.clock.now(), receipts=dict(stop=row_sha(stop_receipt), cancellation=row_sha(cancel_receipt)))
            actual = self.build(mode)
            slots = mode.slots
            for target in prepared['targets']:
                family, key, value, disposition, before = actual[target['target_id']]
                require('C2/plan_commit/template_value/' + target['target_id'], same(evaluate(target['complete_value_template'], slots), value))
                if target['physical_key_template'] is not None:
                    require('C2/plan_commit/template_key/' + target['target_id'], evaluate(target['physical_key_template'], slots) == key)
            substitutions = []
            for s in prepared['future_slots']:
                value = slots[s['slot_id']]
                if s['kind'] == 'original_timestamp':
                    src_ref, src_sha = s['owner_source_ref'], row_sha(dict(clock=s['owner_source_ref'], at=value))
                elif s['slot_id'].startswith('receipt_sha:'):
                    src_ref, src_sha = s['owner_source_ref'], value
                else:
                    src_ref, src_sha = actual[s['source_target_id']][1], value
                substitutions.append(dict(slot_id=s['slot_id'], actual_value=value, actual_original_source_ref=src_ref, actual_original_source_sha256=src_sha))
            bound_request = dict(selection=dict(link=actual['link'][2], plan_owner=w.plans.native_owner(), scheduler_owner=w.scheduler.native_owner(),
                                                plan=prepared['sources']['plan'], schedules=prepared['sources']['schedules'], consents=prepared['sources']['consents'],
                                                scheduler_complete_selection_sha256=prepared['sources']['scheduler_complete_selection_sha256'],
                                                scheduler_selection_source_ref=self.scheduler_selection_key, original_safe_stop_source_ref=safe_key,
                                                original_callback_domain_ref=self.callback_domain),
                                 original_goal_cancel_request_ref=self.source['normalized_identity']['request_ref'],
                                 original_goal_cancel_request_sha256=self.source['normalized_identity']['payload_sha256'],
                                 idempotency_key=self.request['idempotency_key'])
            request = check(w, 'PreparedBoundCancelRequest', dict(preparation=prepared, genuine_post_stop_request=bound_request,
                            genuine_stop_receipt=stop_receipt, genuine_cancellation_receipt=cancel_receipt, actual_safe_stop_result_ref=safe_key,
                            actual_safe_stop_result_sha256=row_sha(safe)))
            admission = check(w, 'CommitAdmission', dict(prepared_request=request, substitutions=substitutions,
                              independently_checked_complete_assignment_sha256=checked,
                              actual_original_joint_transaction_id=self.reserved['joint_transaction'], actual_result=actual['settled_result'][2],
                              action_authority='none'))
            for tid, (family, key, value, disposition, before) in actual.items():
                check(w, FAMILY_SCHEMA[family] if family else {'link': 'CancellationLink', 'owner_settlement': 'OwnerSettlement',
                                                               'settled_result': 'SettledResult'}[tid], value)
            writes = []
            for tid, (family, key, value, disposition, before) in actual.items():
                if family is None or disposition == 'preserved_original':
                    continue
                cell = w.cell(family, key)
                if disposition == 'changed_original':
                    require('C2/plan_commit/cas_present/' + tid, cell is not None)
                    writes.append(w.put(family, key, value, expected=cell['version']))
                else:
                    require('C2/plan_commit/new_absent/' + tid, cell is None)
                    writes.append(w.put(family, key, value))
            writes.append(w.put(w.plans.SAFE_STOP, safe_key, safe))
            self.at('plan_commit', 'final')
            self.recheck('plan_commit', 'final', entry)
            tx = w.write(writes)
            slot.set(dict(tx=tx['tx_id'], writes=len(writes)))
            if lose_ack:
                raise Refusal('C2/plan_commit/ack_lost')
            self.commit_admission, self.actual_targets = admission, actual
            return copy.deepcopy(admission)

    def resolve_commit(self):
        """After a lost joint-commit acknowledgement: resolve the one original commit from Storage only."""
        w = self.world
        with self.call('resolve_plan_commit') as slot:
            keys = {t['target_id']: evaluate(t['physical_key_template'], {}) for t in self.prepared['targets']
                    if t['target_id'] in ('plan_effect', 'schedule_quota_effect', 'result')}
            families = dict(plan_effect='plan_cancel_effect', schedule_quota_effect='schedule_quota_cancel_effect', result='assistant_plan_cancel_result')
            actual = {}
            for tid, key in keys.items():
                value = w.value(families[tid], key)
                require('C2/resolve_plan_commit/unknown/' + tid, value is not None)
                require('C2/resolve_plan_commit/joint_transaction/' + tid,
                        (value['record'].get('original_transaction_id') or value['original_operation_identity']['original_joint_transaction_id'])
                        == self.reserved['joint_transaction'])
                actual[tid] = (families[tid], key, value, 'new_original', None)
            result = actual['result'][2]
            settlement = dict(kind='bound_plan_settled', original_execution_binding=self.source['original_execution_binding'],
                              original_scope_proof_ref=self.key('goal_cancel_binding_selection'),
                              original_scope_proof_sha256=row_sha(w.value('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection'))),
                              original_owner_settlement_ref=keys['result'], original_owner_settlement_sha256=row_sha(result),
                              original_schedule_quota_invalidation_ref=keys['schedule_quota_effect'],
                              original_schedule_quota_invalidation_sha256=row_sha(actual['schedule_quota_effect'][2]))
            actual['owner_settlement'] = (None, None, settlement, 'passive_delivery', None)
            self.actual_targets = actual
            self.commit_admission = dict(actual_original_joint_transaction_id=self.reserved['joint_transaction'], resolved=True)
            slot.set(dict(resolved=True))
            return actual

    def scheduler_participate(self):
        """owner.scheduling.invalidate_cancelled_execution.participate.v3: same enlisted joint commit only."""
        w = self.world
        with self.call('scheduler_participate') as slot:
            require('C2/scheduler_participate/joint_commit', getattr(self, 'commit_admission', None) is not None)
            sq = self.actual_targets['schedule_quota_effect']
            stored = w.value(sq[0], sq[1])
            require('C2/scheduler_participate/same_transaction', stored is not None and same(stored, sq[2])
                    and stored['record']['original_transaction_id'] == self.commit_admission['actual_original_joint_transaction_id'])
            if not self.commit_admission.get('resolved'):
                check(w, 'CommitResult', copy.deepcopy(self.commit_admission))
            slot.set(dict(participated=True))
            return copy.deepcopy(self.commit_admission)

    # ---------------------------------------------------------- effect readers
    def effect_selector(self):
        return check(self.world, 'EffectSelector', dict(scope=self.plan_scope(), operation_id=self.operation_id,
                     cancellation_id=self.source['normalized_identity']['operation_id'],
                     original_goal_cancel_request_ref=self.source['normalized_identity']['request_ref'],
                     original_goal_cancel_request_sha256=self.source['normalized_identity']['payload_sha256'],
                     idempotency_key=self.request['idempotency_key']))

    def read_boundary(self):
        w = self.world
        hold_key, hold = w.holds.source(self.scope)
        perm = w.permissions.current(self.cancel_decision)
        dsel, _, _ = w.binding.domain_selection()
        regs = w.registration.rows()
        return dict(storage_instance_id=w.storage_id, project_id=self.scope['project_id'], original_read_operation_id=uid('TEST_ONLY:effect-read'),
                    actual_storage_owner=dict(owner_ref=w.storage_id, owner_epoch=w.storage.recovery_epoch, server_id=w.sir.server_id, server_claim_epoch=1),
                    original_read_principal_ref=self.actor_ref, current_root_source_ref=dsel['physical_key'], current_root_source_sha256=dsel['complete_value_sha256'],
                    current_role_installation_ref=w.registration.registrations['goal_birth'], current_role_installation_sha256=row_sha(regs[0]),
                    current_permission_source_ref=self.cancel_decision, current_permission_source_sha256=row_sha(perm),
                    current_deletion_hold_source_ref=hold_key, current_deletion_hold_source_sha256=row_sha(hold),
                    current_backup_restore_source_ref=dsel['physical_key'], current_backup_restore_source_sha256=dsel['complete_value_sha256'])

    def stored_settled(self):
        w = self.world
        a = self.actual_targets
        out = {}
        for name, tid in (('plan_result', 'result'), ('plan_effect', 'plan_effect'), ('schedule_quota_effect', 'schedule_quota_effect')):
            fam, key = a[tid][0], a[tid][1]
            value = w.value(fam, key)
            require('C2/effects/unavailable/' + tid, value is not None)
            out[name] = value
            okey = 'plan_cancel_source_origin.v1:%s:%s:%s' % (hx(w.storage_id), hx(key), row_sha(value))
            origin = w.value('plan_cancel_source_origin', okey)
            require('C2/effects/origin_unavailable/' + tid, origin is not None and origin['record']['issued_physical_sha256'] == row_sha(value)
                    and origin['record']['original_transaction_id'] == self.reserved['joint_transaction'])
            out[{'plan_result': 'plan_result_origin', 'plan_effect': 'plan_origin', 'schedule_quota_effect': 'schedule_quota_origin'}[name]] = origin
        settlement = copy.deepcopy(a['owner_settlement'][2])
        require('C2/effects/settlement_join', settlement['original_owner_settlement_sha256'] == row_sha(out['plan_result'])
                and settlement['original_schedule_quota_invalidation_sha256'] == row_sha(out['schedule_quota_effect']))
        return check(w, 'SettledResult', dict(plan_result=out['plan_result'], plan_result_origin=out['plan_result_origin'], replay_of=None,
                     plan_effect=out['plan_effect'], plan_origin=out['plan_origin'], schedule_quota_effect=out['schedule_quota_effect'],
                     schedule_quota_origin=out['schedule_quota_origin'], owner_settlement=settlement))

    def current_effect_sources(self):
        w = self.world
        k = self.plan_keys()
        plan, run = w.value('assistant_plan_record', k['plan']), w.value('assistant_plan_run', k['run'])
        safe = next(iter(sorted(w.storage.cells.get(w.plans.SAFE_STOP, {}).items())), None)
        require('C2/effects/safe_stop_unavailable', safe is not None)
        return check(w, 'CurrentEffectSources', dict(current_goal=self.goal_carriers(with_source=True), plan_owner=w.plans.native_owner(),
                     scheduler_owner=w.scheduler.native_owner(), plan=plan, plan_source=w.plans.binding('assistant_plan_record', k['plan']), run=run,
                     run_source=w.plans.binding('assistant_plan_run', k['run']), schedules=self.expected_schedules(), consents=self.expected_consents(),
                     scheduler_complete_selection_sha256=row_sha(self.scheduler_statement), scheduler_selection_source_ref=self.scheduler_selection_key,
                     actual_safe_stop_result_ref=safe[0], actual_safe_stop_result_sha256=row_sha(safe[1]['value']),
                     original_callback_domain_ref=self.callback_domain, current_read_boundary=self.read_boundary()))

    def read_current_plan_effects(self):
        """owner.goal.cancel.read_current_plan_effects.v3 over the inner verify_current_custody.v3."""
        w = self.world
        with self.call('read_current_plan_effects') as slot:
            generation = w.storage.cell_generation
            selector = self.effect_selector()
            request = check(w, 'CurrentEffectReadRequest', dict(selector=selector, actual_current_sources=self.current_effect_sources()))
            result = self.verify_current_custody(request)
            require('C2/read_current_plan_effects/passive', w.storage.cell_generation == generation)
            slot.set(dict(status='settled' if 'plan_result' in result else 'not_settled'))
            return result

    def verify_current_custody(self, request):
        w = self.world
        src = request['actual_current_sources']
        require('C2/verify_current_custody/selector', same(request['selector'], self.effect_selector()))
        require('C2/verify_current_custody/permission', w.permissions.allowed(self.cancel_decision, self.actor_ref, 'goal.cancel'))
        require('C2/verify_current_custody/run_cancelled', src['run']['record']['state'] == 'cancelled' and src['plan']['record']['control_state'] == 'canceled')
        current = self.current_effect_sources()
        for name in ('plan', 'run', 'schedules', 'consents'):
            require('C2/verify_current_custody/current/' + name, same(current[name], src[name]))
        settled = self.stored_settled()
        return check(w, 'CurrentEffectReadResult', settled)

    def read_retained_plan_effects(self, read_kind='retained_audit'):
        """owner.goal.cancel.read_retained_plan_effects.v3 over read_original_custody.v3 (selector-only)."""
        w = self.world
        with self.call('read_retained_plan_effects', dict(kind=read_kind)) as slot:
            generation = w.storage.cell_generation
            require('C2/read_retained_plan_effects/disclosure_permission',
                    w.permissions.allowed(self.cancel_decision, self.actor_ref, 'goal.cancel') or getattr(self, 'audit_permission', False))
            request = check(w, 'RetainedEffectSelector', dict(selector=self.effect_selector(), read_kind=read_kind))
            settled = self.stored_settled()
            run_key = self.plan_keys()['run']
            run = w.value('assistant_plan_run', run_key)
            okey = 'plan_cancel_source_origin.v1:%s:%s:%s' % (hx(w.storage_id), hx(run_key), row_sha(run))
            run_origin = w.value('plan_cancel_source_origin', okey)
            sources = check(w, 'RetainedEffectReadSources', dict(request=request, original_custody=dict(original_settled_result=settled,
                            original_run_settlement_origin=run_origin), current_read_boundary=self.read_boundary()))
            result = check(w, 'RetainedEffectReadSuccess', dict(read_kind=read_kind, original_custody=sources['original_custody'],
                           full_run_read='not_requested', action_authority='none'))
            require('C2/read_retained_plan_effects/passive', w.storage.cell_generation == generation)
            slot.set(dict(kind=read_kind))
            return result

    # ---------------------------------------------------------- bound settlement
    def settle_owner(self):
        w = self.world
        with self.call('settle_owner') as slot:
            entry = self.observe_sources()
            self._require_progress('settle_owner', ('receipt_committed',))
            require('C2/settle_owner/genuine_effects', getattr(self, 'commit_admission', None) is not None)
            settled = self.read_current_plan_effects()
            self.at('settle_owner', 'after_effect_read')
            self.recheck('settle_owner', 'after_effect_read', entry)
            settlement = settled['owner_settlement']
            require('C2/settle_owner/bound_kind', settlement['kind'] == 'bound_plan_settled')
            before_stop = check(w, 'BoundBeforeStopEntry', dict(source_audit=self.source,
                                original_binding_selection=w.value('goal_cancel_binding_selection', self.key('goal_cancel_binding_selection'))['record'],
                                assignment_input=self.assignment_input, assignment_audit=self.assignment_audit,
                                assignment_admission=self.assignment, plan_prepared=self.prepared), BOUND)
            check(w, 'BoundOwnersEntry', dict(before_stop=before_stop, original_stop_receipt=self.progress['stop_receipt'],
                  original_cancellation_receipt=self.progress['cancellation_receipt'], actual_current_plan_sources=self.current_effect_sources(),
                  actual_current_settlement=settled), BOUND)
            check(w, 'OwnerSettlement', settlement)
            progress = self._progress('owners_settled', owner_settlement=settlement)
            self.at('settle_owner', 'final')
            self.recheck('settle_owner', 'final', entry)
            tx = w.write(self._progress_writes(progress))
            self.progress = progress
            slot.set(dict(tx=tx['tx_id']))
            return copy.deepcopy(settlement)

    def terminal(self, kind='succeeded', *, lose_ack=False):
        if kind == 'succeeded':
            w = self.world
            self._require_progress('terminal', ('control_published',))
            result = self.check('SucceededResult', dict(schema_id='pm.goal.cancel.result.v2', schema_version='2.0.0', command_id=C1.COMMAND,
                command_instance_id=self.request['command_instance_id'], operation_id=self.operation_id,
                **{k: self.scope[k] for k in ('project_id', 'thread_id', 'goal_id')}, status='succeeded',
                cancellation_receipt=self.progress['cancellation_receipt'], publication=self.progress['publication'],
                control_publication=self.progress['control_publication']))
            terminal, prepared, terminal_input = self._terminal_values('succeeded', result)
            _, audit = w.assigner.resolve_audit(self.audit_key)
            check(w, 'BoundTerminalEntry', dict(original_source=self.source, original_assignment_audit=audit['record'], terminal_input=terminal_input), BOUND)
        return super().terminal(kind, lose_ack=lose_ack)

    def retained_replay(self):
        """BoundRetainedReplayEntry: passive original terminal plus original retained Plan effects."""
        w = self.world
        terminal = w.value('goal_cancel_terminal_audit', self.key('goal_cancel_terminal_audit'))
        require('C2/retained_replay/terminal', terminal is not None and terminal['record']['kind'] == 'succeeded')
        effects = self.read_retained_plan_effects('original_result_replay')
        return check(w, 'BoundRetainedReplayEntry', dict(original_source=self.source, original_terminal=terminal['record'],
                     original_retained_plan_effects=effects), BOUND)

    def run(self, until='terminal'):
        steps = [('capture_source', self.capture_source), ('reserve_append_assignment', self.reserve_append_assignment),
                 ('issue_assignment_audit', self.issue_assignment_audit), ('admit_codec_domain', self.admit_codec_domain),
                 ('prepare', self.prepare), ('latch_and_reserve', self.latch_and_reserve), ('commit_receipt', self.commit_receipt),
                 ('plan_commit', self.plan_commit), ('scheduler_participate', self.scheduler_participate), ('settle_owner', self.settle_owner),
                 ('freeze_event', self.freeze_event), ('append_reserved', self.append_original), ('publish_control', self.publish_control),
                 ('terminal', self.terminal)]
        if getattr(self, 'request', None) is None:
            self.dispatch(self.user_request())
        for name, step in steps:
            step()
            if name == until:
                break
        return self
