#!/usr/bin/env python3
"""DG-CB TEST_ONLY pre-enrollment source owners for goal.cancelled C5/C6 (protocol M1-M9).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

This module models the world BEFORE SP-305 enrollment: a Goal that six
independently registered original owners (Goal body, host Stop, Plan,
Workflow, Scheduler, SIR) already hold in their own databases, with no binding
revision/control/origin and possibly no writer domain. Every owner actually
performs its modeled issuance on the shared test-owner Storage
(``pm_goal_test_storage``): identities are its own random ids, times come from
its own clock through NUMRULE, epochs and revisions advance only through its
own CAS transactions, and every physical original is written by Storage in its
original codec. Each physical original is written together with a TEST_ONLY
issuance origin (an ``OriginalTransaction`` naming the issuing owner, method,
operation and permission source) in the same transaction, so a later migration
can authenticate original issuance rather than trust a caller.

Physical codecs. The original Goal body families are ``json_canonical`` in the
storage value registry; a pre-DL-270 Goal is written in the pinned original
Goal canonical-JSON codec (``pm.goal.canonical_json.v1``, the
``source-witness-inputs.json`` edition) and held by Storage as exact bytes in a
TEST_ONLY physical carrier. A post-DL-270 Goal is written in the Storage
canonical MessagePack codec (``pm.storage.canonical_msgpack.v1``). Every other
owner writes MessagePack. Any other codec is an unsupported representation.

The owners also implement the association-inventory protocol that the DG-CA
C1 route expects (``inventory``/``statement_digest``/``members``), so a Goal
that a migration enrolls can afterwards enter C-source through DG-CA's own
unchanged route. The world persists its owner roster in Storage so that a
fresh process can reopen it after a real child-process crash. No original
bank, URI, hash or stored byte is rewritten; nothing here admits, registers or
installs anything natively.
"""
from __future__ import annotations

import copy
import json
import uuid

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_dg_ca_owners as O
from pm_goal_dg_ca_owners import (World, WorldOwner, Shared, require, Refusal, uid, short_id, row_sha, same, sha, scoped_key,
                                  exact_numbers, CANCEL, BINDING, BODY, QUALIFICATION, NATIVE_LINE, ROOT, transaction_record, WRITERS,
                                  MSGPACK)
import pm_goal_dg_ca_c2 as C2

LANE = 'DG-CB'
TOS_URI = 'https://puppetmaster.local/schemas/goal_own_c/dg-cb/1.0.0/test-only-sources.v1.schema.json'
TOS = TOS_URI + '#/$defs/'
TOS_PATH = 'Plans/goal_own_c_contracts/dg-cb-migration-v1/test-only-sources.v1.schema.json'
PLAN = C2.PLAN
NATIVE_ACT = 'https://puppetmaster.local/proposals/workflow_activation_sources.v4.schema.json#/$defs/'
WF_START = 'https://puppetmaster.local/proposals/executor_workflow_original_start.v2.schema.json#/$defs/'
GOAL_JSON = 'pm.goal.canonical_json.v1'
CARRIER_ID = 'pm.test_only.physical_carrier.v1'
ROLES = ('goal', 'host_stop', 'plan', 'workflow', 'scheduler', 'sir')
ORIGINS = 'TEST_ONLY:original_issuance_origin'
ROSTER = 'TEST_ONLY:world_roster'
EXCLUSION = 'TEST_ONLY:migration_exclusion'
DISPATCH = 'TEST_ONLY:native_dispatch_state'
CUTOFF = 'TEST_ONLY:writer_domain_cutoff'
MAINTENANCE = 'TEST_ONLY:storage_maintenance_source'
hx = C2.hx
oid = C2.oid

# Coordinator's independent table: family -> {stored schema_id: whole schema root}.
FAMILY_SCHEMAS = {
    'goal_body_record': {'pm.storage_value.goal_body_record.v1': BODY + '#/$defs/storage_body'},
    'goal_objective_revision': {'pm.storage_value.goal_objective_revision.v1': BODY + '#/$defs/storage_revision'},
    'goal_objective_origin': {'pm.storage_value.goal_objective_origin.v1': BODY + '#/$defs/storage_origin'},
    'goal_body_control': {'pm.storage_value.goal_body_control.v1': BODY + '#/$defs/storage_control',
                          'pm.storage_value.goal_body_control.v2': CANCEL + '#/$defs/StorageBodyControlV2'},
    'goal_body_mutation_receipt': {'pm.storage_value.goal_body_mutation_receipt.v1': BODY + '#/$defs/storage_receipt'},
    'goal_host_stop_control': {'pm.storage_value.goal_host_stop_control.v1': CANCEL + '#/$defs/StorageStopControl'},
    'TEST_ONLY:host_stop_receipt': {'pm.test_only.host_stop_receipt.v1': TOS + 'HostStopReceipt'},
    'assistant_plan_record': {'pm.storage_value.assistant_plan_record.v1': PLAN + 'StorageAssistantPlanRecord'},
    'assistant_plan_run': {'pm.storage_value.assistant_plan_run.v1': PLAN + 'StoragePlanRun'},
    'plan_cancel_source_origin': {'pm.storage_value.plan_cancel_source_origin.v1': PLAN + 'StorageSourceOrigin'},
    'goal_plan_binding': {'pm.storage_value.goal_plan_binding.v1': BINDING + '#/$defs/StorageGoalPlanBinding'},
    'TEST_ONLY:plan_pending_attach': {'pm.test_only.plan_pending_attach.v1': TOS + 'PlanPendingAttach'},
    'execution_schedule': {'pm.storage_value.execution_schedule.v1': PLAN + 'StorageExecutionSchedule'},
    'execution_schedule_run_binding': {'pm.storage_value.execution_schedule_run_binding.v1': PLAN + 'StorageScheduleRunBinding'},
    'quota_resume_consent': {'pm.storage_value.quota_resume_consent.v1': PLAN + 'StorageQuotaResumeConsent'},
    'TEST_ONLY:scheduler_callback_admission': {'pm.test_only.scheduler_callback_admission.v1': TOS + 'SchedulerCallbackAdmission'},
    'workflow_goal_run_body': {'pm.storage_value.workflow_goal_run_body.v1': NATIVE_ACT + 'GoalRunBodyPhysical'},
    'workflow_goal_run_control': {'pm.storage_value.workflow_goal_run_control.v1': NATIVE_ACT + 'GoalRunControlPhysical'},
    'executor_workflow_workflow_birth': {'pm.storage_value.executor_workflow_workflow_birth.v4': WF_START + 'StorageWorkflowBirth'},
    'executor_workflow_workflow_update': {'pm.storage_value.executor_workflow_workflow_update.v4': WF_START + 'StorageWorkflowUpdate'},
    'executor_workflow_workflow_head': {'pm.storage_value.executor_workflow_workflow_head.v4': WF_START + 'StorageWorkflowHead'},
    'executor_workflow_lineage_origin': {'pm.storage_value.executor_workflow_lineage_origin.v4': WF_START + 'StorageWorkflowMutationOrigin'},
    'executor_workflow_current_pointer': {'pm.storage_value.executor_workflow_current_pointer.v2': WF_START + 'StorageCurrentPointer'},
    'TEST_ONLY:workflow_activation_source': {'pm.test_only.workflow_activation_source.v1': TOS + 'WorkflowActivationSource'},
    'TEST_ONLY:workflow_pending_operation': {'pm.test_only.workflow_pending_operation.v1': TOS + 'WorkflowPendingOperation'},
    'TEST_ONLY:sir_accepted_dispatch': {'pm.test_only.sir_accepted_dispatch.v1': TOS + 'SirAcceptedDispatch'},
    'sir_command_outcome': {'pm.test_only.sir_command_outcome.v1': TOS + 'SirCommandOutcome'},
}
GOAL_FAMILIES = ('goal_body_record', 'goal_objective_revision', 'goal_objective_origin', 'goal_body_control', 'goal_body_mutation_receipt')
ROLE_FAMILIES = {
    'goal': GOAL_FAMILIES,
    'host_stop': ('goal_host_stop_control', 'TEST_ONLY:host_stop_receipt'),
    'plan': ('assistant_plan_record', 'assistant_plan_run', 'plan_cancel_source_origin', 'goal_plan_binding', 'TEST_ONLY:plan_pending_attach'),
    'workflow': ('workflow_goal_run_body', 'workflow_goal_run_control', 'executor_workflow_workflow_birth', 'executor_workflow_workflow_update',
                 'executor_workflow_workflow_head', 'executor_workflow_current_pointer', 'executor_workflow_lineage_origin',
                 'TEST_ONLY:workflow_activation_source',
                 'TEST_ONLY:workflow_pending_operation'),
    'scheduler': ('execution_schedule', 'execution_schedule_run_binding', 'quota_resume_consent', 'plan_cancel_source_origin',
                  'TEST_ONLY:scheduler_callback_admission'),
    'sir': ('TEST_ONLY:sir_accepted_dispatch', 'sir_command_outcome'),
}
FAMILY_CODECS = {f: ((GOAL_JSON, MSGPACK) if f in GOAL_FAMILIES else (MSGPACK,)) for f in FAMILY_SCHEMAS}


# ------------------------------------------------------------------ codecs

def json_encode(value):
    """The pinned original Goal canonical-JSON codec (source-witness-inputs.json edition)."""
    try:
        return Shared.get().goal_model.encode(value)
    except Exception as error:  # noqa: BLE001 - the original codec raises its own Rejected
        raise Refusal('codec/json_encode') from error


def json_decode(raw):
    def pairs(items):
        out = {}
        for k, v in items:
            require('codec/json_duplicate_key', k not in out)
            out[k] = v
        return out

    def bad(_):
        raise Refusal('codec/json_non_integer')
    try:
        value = json.loads(raw.decode('utf-8'), object_pairs_hook=pairs, parse_float=bad, parse_constant=bad)
    except (UnicodeError, ValueError) as error:
        raise Refusal('codec/json_decode') from error
    require('codec/json_noncanonical', json_encode(value) == raw)
    return value


def msgpack_encode(value):
    return S.canonical(value, 'dg_cb/msgpack')


def msgpack_decode(raw):
    try:
        value = S.decode_canonical(raw, 'dg_cb/msgpack')
    except S.StorageRefusal as error:
        raise Refusal('codec/msgpack_decode') from error
    require('codec/msgpack_noncanonical', S.canonical(value) == raw)
    return value


CODECS = {GOAL_JSON: (json_encode, json_decode), MSGPACK: (msgpack_encode, msgpack_decode)}


def store_form(value, codec):
    """What Storage holds for one physical original: the MessagePack value, or exact bytes in a carrier."""
    if codec == MSGPACK:
        return value
    raw = CODECS[codec][0](value) if codec in CODECS else S.canonical(value)
    return dict(schema_id=CARRIER_ID, qualification=QUALIFICATION, codec_id=codec, bytes_hex=raw.hex())


def physical(cell_value):
    """(codec_id, exact physical bytes) of one stored physical original."""
    if type(cell_value) is dict and cell_value.get('schema_id') == CARRIER_ID:
        return cell_value['codec_id'], bytes.fromhex(cell_value['bytes_hex'])
    return MSGPACK, S.canonical(cell_value)


def decode_physical(cell_value, where):
    codec, raw = physical(cell_value)
    require(where + '/unsupported_codec', codec in CODECS)
    return codec, raw, CODECS[codec][1](raw)


def phys_sha(cell_value):
    return sha(physical(cell_value)[1])


_LANE_BANK = None


def lane_bank():
    global _LANE_BANK
    if _LANE_BANK is None:
        _LANE_BANK = A.RootBank([dict(path=TOS_PATH), dict(path='Plans/goal_execution_binding_custody.schema.json')])
    return _LANE_BANK


def validate_original(world, schema_ref, value, code):
    """Whole-root validation in the original realm that owns the schema."""
    if schema_ref.startswith(TOS_URI):
        lane_bank().validate(schema_ref, value, code)
    elif schema_ref.startswith(PLAN.split('#')[0]):
        world.roots.check('plan', schema_ref, value)
    elif schema_ref.startswith((BODY, CANCEL, BINDING)):
        world.roots.check('producer', schema_ref, value)
    elif schema_ref.startswith((NATIVE_ACT.split('#')[0], WF_START.split('#')[0])):
        world.roots.check('native', schema_ref, value)
    else:
        raise Refusal(code + '/unsupported_schema')
    exact_numbers(value, code)
    deep_validate(world, schema_ref, value, code)
    return value


def deep_validate(world, schema_ref, value, code):
    """Canonical members nested in TEST_ONLY envelopes are validated in their own original realm."""
    if schema_ref == TOS + 'SirAcceptedDispatch':
        world.roots.check('producer', CANCEL + '#/$defs/GoalCancelRequestV2', value['request'])
        world.roots.check('producer', CANCEL + '#/$defs/NormalizedIdentity', value['identity'])
        world.roots.check('producer', CANCEL + '#/$defs/NonterminalOutcome', value['nonterminal'])
    elif schema_ref == TOS + 'SirCommandOutcome':
        name = {'acknowledged': 'NonterminalOutcome', 'succeeded': 'TerminalSuccessOutcome', 'terminal_unknown': 'TerminalUnknownOutcome',
                'failed': 'TerminalNoEffectOutcome'}.get(value['record'].get('outcome'))
        require(code + '/sir_outcome_kind', name is not None)
        world.roots.check('producer', CANCEL + '#/$defs/' + name, value['record'])


def schema_ref_for(family, value):
    table = FAMILY_SCHEMAS.get(family)
    require('family/unsupported', table is not None)
    ref = table.get(value.get('schema_id') if type(value) is dict else None)
    require('family/unsupported_schema', ref is not None)
    return ref


def ptr_selection(world, family, key):
    """PhysicalSelection of a stored original over its exact physical bytes and original codec."""
    cell = world.cell(family, key)
    require('selection/unavailable/' + family, cell is not None)
    codec, raw = physical(cell['value'])
    value = CODECS[codec][1](raw) if codec in CODECS else None
    require('selection/unsupported/' + family, value is not None)
    return dict(family_id=family, physical_key=key, schema_id=value['schema_id'], schema_version=value.get('schema_version', '1.0.0'),
                codec_id=codec, complete_value_sha256=sha(raw))


def source_selector(world, family, key):
    """workflow_activation_sources.v4 SourceSelector over the exact physical bytes."""
    cell = world.cell(family, key)
    require('selector/unavailable/' + family, cell is not None)
    codec, raw = physical(cell['value'])
    value = CODECS[codec][1](raw)
    return dict(storage_instance_id=world.storage_id, family_id=family, physical_key=key, schema_id=value['schema_id'],
                schema_version=value.get('schema_version', '1.0.0'), physical_value_sha256=sha(raw))


def origin_key(family, key, digest):
    return 'issuance_origin:%s:%s:%s' % (hx(family), hx(key), digest)


# ------------------------------------------------------------------ Storage

class MigrationStorage(S.TestOwnerStorage):
    """Test-owner Storage plus whole-source CAS checks inside one transaction and migration cut points.

    ``transact(writes, checks=[...])`` verifies every check (``expected`` version,
    or ``None`` for absent) against the same staged state the writes commit
    against, all or none. ``migration_cut`` names a cut inside the migration
    transaction: ``before_migration_tx`` dies before the write set is applied,
    ``after_migration_tx`` dies after it is durable (lost acknowledgement).
    """
    MIGRATION_CUTS = ('before_migration_tx', 'after_migration_tx', 'after_exclusion', 'before_withdrawal_tx', 'after_withdrawal_tx')

    def __init__(self, root, *, migration_cut=None, migration_cut_mode='exit', **kwargs):
        require('migration_cut/name', migration_cut is None or migration_cut in self.MIGRATION_CUTS)
        self.migration_cut, self.migration_cut_mode = migration_cut, migration_cut_mode
        super().__init__(root, **kwargs)

    def mcut(self, point):
        if self.migration_cut == point:
            if self.migration_cut_mode == 'exit':
                import os
                os._exit(S.CRASH_EXIT)
            raise S.Crash(point)

    def transact(self, writes, *, checks=(), operation=None, cut_before=None, cut_after=None, mcut_before=None, mcut_after=None):
        for check in checks:
            require('tx/check_shape', type(check) is dict and set(check) == {'table', 'key', 'expected'})
            current = self.cells.get(check['table'], {}).get(check['key'])
            if check['expected'] is None:
                require('tx/check_absent', current is None)
            else:
                require('tx/check_version', current is not None and current['version'] == check['expected'])
        if mcut_before:
            self.mcut(mcut_before)
        tx = super().transact(writes, operation=operation, cut_before=cut_before, cut_after=cut_after)
        if mcut_after:
            self.mcut(mcut_after)
        return tx


# ------------------------------------------------------------------ owners

class SourceOwnerMixin:
    """Physical issuance with an issuance origin per original, written in the owner's own transaction."""
    migration_role = None

    def write_permission(self):
        w = self.world
        decision = w.constants.get('write_permission:' + self.owner_id)
        require('owner/write_permission_unavailable', decision is not None)
        return w.permissions.selection(decision)

    def physical_writes(self, items, *, method, operation_id, cause_ref=None):
        """items: (family, key, value, codec, expected, canonical_origin) -> Storage writes incl. issuance origins."""
        w = self.world
        tx_ref = uid('TEST_ONLY:owner-tx:' + self.migration_role)
        issuer = transaction_record(self, method, operation_id, self.write_permission(), tx_ref, cause_ref or operation_id)
        writes = []
        for family, key, value, codec, expected, canonical in items:
            validate_original(w, schema_ref_for(family, value), value, 'issue/' + family)
            stored = store_form(value, codec)
            digest = phys_sha(stored)
            writes.append(w.put(family, key, stored, expected=expected))
            origin = dict(schema_id='pm.test_only.original_issuance_origin.v1', qualification=QUALIFICATION, owner_role=self.migration_role,
                          owner_ref=self.owner_id, issued_family_id=family, issued_physical_key=key, issued_physical_sha256=digest,
                          codec_id=codec, schema_ref=schema_ref_for(family, value), issuer=issuer, canonical_origin=canonical)
            lane_bank().validate(TOS + 'IssuanceOrigin', origin, 'issue/origin')
            writes.append(w.put(ORIGINS, origin_key(family, key, digest), origin))
        return writes

    def decoded(self, family, key):
        cell = self.world.cell(family, key)
        if cell is None:
            return None
        _, _, value = decode_physical(cell['value'], 'owner/' + family)
        return value

    def require_unexcluded(self, scope):
        self.world.require_unexcluded(scope, self.migration_role)

    def scoped_rows(self, family, match):
        out = []
        for key, cell in sorted(self.world.storage.cells.get(family, {}).items()):
            try:
                _, _, value = decode_physical(cell['value'], 'owner/' + family)
            except Refusal:
                value = None
            if value is None or match(key, value):
                out.append(key)
        return out

    # ---- association-inventory protocol (DG-CA C1 route) -------------------------------
    def inventory_members(self, scope):
        return []

    @property
    def members(self):
        out = {}
        for scope in self.world.known_scopes():
            rows = self.inventory_members(scope)
            if rows:
                out[scoped_key(scope)] = rows
        return out

    def inventory(self, scope):
        with self.recorder.call(self.owner_id, 'inventory', dict(scope=scope)) as slot:
            require('inventory/unavailable/' + self.role, self.available is True)
            members = sorted(copy.deepcopy(self.inventory_members(scope)), key=lambda m: m['member_ref'])
            statement = dict(schema_id='pm.test_only.association_inventory_statement.v1', schema_version='1.0.0',
                             qualification=QUALIFICATION, owner_id=self.owner_id, owner_role=self.role, owner_epoch=self.owner_epoch,
                             scope=copy.deepcopy(scope), members=members, complete=True, stated_at=self.clock.now())
            handle = self._issue(None, statement, kind='inventory_statement')
            slot.set(dict(count=len(members)))
            return handle

    def statement_digest(self, statement):
        return row_sha({k: v for k, v in statement.items() if k != 'stated_at'})

    def current_membership(self, scope):
        require('inventory/unavailable/' + self.role, self.available is True)
        return sorted(m['member_ref'] for m in self.inventory_members(scope))

    statement_defect = None  # TEST_ONLY negative hook: a defective owner statement (one invariant changed)

    def mapping_statement(self, mapping):
        """Issue an OwnerMapping as this owner's own statement (handle), validated in contracts.schema.json."""
        if self.statement_defect is not None:
            mapping = self.statement_defect(copy.deepcopy(mapping))
        self.world.contracts.validate('OwnerMapping', mapping)
        return self._issue(None, mapping, kind='owner_mapping')

    def image(self, family, key):
        """SourceImage of one stored original, read from Storage (exact physical bytes)."""
        w = self.world
        cell = w.cell(family, key)
        require('image/unavailable/' + family, cell is not None)
        codec, raw = physical(cell['value'])
        value = CODECS[codec][1](raw) if codec in CODECS else None
        schema_ref = schema_ref_for(family, value) if value is not None else 'unsupported:' + family
        digest = sha(raw)
        okey = origin_key(family, key, digest)
        origin = w.value(ORIGINS, okey)
        require('image/origin_unavailable/' + family, origin is not None)
        return dict(selection=dict(owner=self.owner_id, physical_key=family + '|' + key, schema_ref=schema_ref, sha256=digest),
                    codec_id=codec, bytes_hex=raw.hex(),
                    origin=dict(owner=self.owner_id, physical_key=ORIGINS + '|' + okey, schema_ref=TOS + 'IssuanceOrigin', sha256=row_sha(origin)))


class LegacyGoalOwner(SourceOwnerMixin, O.GoalOwner):
    """Sole Goal body owner, pre-enrollment editions (canonical JSON v1 control, or MessagePack already-v2)."""
    migration_role = 'goal'
    RECEIPT = 'goal_body_mutation_receipt'

    def receipt_key(self, scope, operation_id):
        return self.world.shared.goal_model.key('goal_body_mutation_receipt.v1', scope['project_id'], scope['goal_id'], operation_id)

    def wrap_any(self, kind, record):
        names = dict(body=('pm.storage_value.goal_body_record.v1', '1.0.0'), revision=('pm.storage_value.goal_objective_revision.v1', '1.0.0'),
                     origin=('pm.storage_value.goal_objective_origin.v1', '1.0.0'), receipt=('pm.storage_value.goal_body_mutation_receipt.v1', '1.0.0'),
                     control_v1=('pm.storage_value.goal_body_control.v1', '1.0.0'), control_v2=('pm.storage_value.goal_body_control.v2', '2.0.0'))
        schema_id, version = names[kind]
        return dict(schema_id=schema_id, schema_version=version, record=record)

    def codec_of(self, scope):
        cell = self.world.cell(self.BODY, self.keys(scope)['body'])
        require('goal/body_unavailable', cell is not None)
        return physical(cell['value'])[0]

    # ---- reads compatible with DG-CA's GoalOwner (decoded wrappers) -------------------
    def _decoded_cell(self, family, key):
        cell = self.world.cell(family, key)
        if cell is None:
            return None
        _, _, value = decode_physical(cell['value'], 'goal/' + family)
        return dict(cell, value=value)

    def body_cell(self, scope):
        cell = self._decoded_cell(self.BODY, self.keys(scope)['body'])
        require('goal/body_unavailable', cell is not None)
        return cell

    def control(self, scope):
        cell = self._decoded_cell(self.CONTROL, self.keys(scope)['control'])
        require('goal/control_unavailable', cell is not None)
        return cell

    def history_cells(self, scope):
        control = self.control(scope)['value']['record']
        out = {}
        for n in range(1, control['latest_objective_revision'] + 1):
            kr = self.keys(scope, n)
            out[str(n)] = [self._decoded_cell(self.REVISION, kr['revision']), self._decoded_cell(self.ORIGIN, kr['origin'])]
        return out

    def snapshot(self, scope):
        body = self.body_cell(scope)['value']['record']
        control = self.control(scope)['value']['record']
        control_v1 = {k: v for k, v in control.items() if k != 'cancellation_pending'}
        control_v1['schema_id'] = 'pm.goal.body_control.v1'
        revisions, origins = [], {}
        for n, (rev, org) in sorted(self.history_cells(scope).items(), key=lambda kv: int(kv[0])):
            require('goal/history_unavailable', rev is not None and org is not None)
            revisions.append(rev['value']['record'])
            origins[n] = org['value']['record']
        snapshot = dict(body=copy.deepcopy(body), control=control_v1, revisions=revisions, origins=origins)
        self.world.shared.goal_model.validate_snapshot(snapshot)
        return snapshot

    # ---- legacy issuance ---------------------------------------------------------------
    def _receipt(self, scope, operation_id, intent, before, after, accepted):
        m = self.world.shared.goal_model
        return dict(schema_id='pm.goal.body_mutation_receipt.v1', **scope, operation_id=operation_id, intent_sha256=m.digest(intent),
                    owner_ref=self.owner_id, authority_ref=uid('TEST_ONLY:goal-authority'),
                    before_revision=None if before is None else before['revision'],
                    before_currentness_hash=None if before is None else before['currentness_hash'],
                    after_revision=after['revision'], after_currentness_hash=after['currentness_hash'],
                    accepted_objective_revision=None if accepted is None else accepted['revision'],
                    accepted_revision_hash=None if accepted is None else accepted['revision_hash'], committed_at=self.clock.now())

    def _control(self, scope, body, latest, control_epoch, edition, pending=None, cancellation_pending=None, cancellation_receipt_ref=None):
        m = self.world.shared.goal_model
        k = self.keys(scope, latest['revision'])
        record = dict(schema_id='pm.goal.body_control.' + edition, **scope, body_key=k['body'], body_sha256=m.bytehash(body),
                      current_revision=body['revision'], currentness_hash=body['currentness_hash'],
                      latest_objective_revision=latest['revision'], latest_revision_hash=latest['revision_hash'], origin_key=k['origin'],
                      control_epoch=control_epoch, cancellation_receipt_ref=cancellation_receipt_ref, pending=pending)
        if edition == 'v2':
            record['cancellation_pending'] = cancellation_pending
        return record

    def create_legacy(self, scope, objective, *, codec=GOAL_JSON, control_edition='v1', extra_writes=None, active_run_ref=None):
        """A pre-enrollment Goal birth: body/revision1/origin1/control/birth receipt in the owner's codec edition."""
        w = self.world
        with self.recorder.call(self.owner_id, 'create_legacy', dict(codec=codec, control=control_edition)) as slot:
            self.require_unexcluded(scope)
            m = w.shared.goal_model
            now = self.clock.now()
            message = uid('TEST_ONLY:message')
            body = dict(goal_id=scope['goal_id'], project_id=scope['project_id'], thread_id=scope['thread_id'], objective_text=objective,
                        revision=1, state='active', blocked_reason_ref=None, active_run_ref=active_run_ref, created_at=now, updated_at=now)
            body['currentness_hash'] = m.hashbody(body)
            revision = dict(goal_id=scope['goal_id'], revision=1, objective_text=objective, change_source='user_direct', source_message_id=message,
                            approval_id=None, prior_revision_hash=None, created_at=now)
            revision['revision_hash'] = m.hashrev(revision)
            origin = dict(goal_id=scope['goal_id'], goal_revision=1, origin_kind='user_request', source_message_refs=[message],
                          source_context_manifest_ref=uid('TEST_ONLY:context-manifest'), bound_plan_ref=None, owning_workflow_ref=None)
            control = self._control(scope, body, revision, 0, control_edition)
            op = uid('TEST_ONLY:goal-birth')
            receipt = self._receipt(scope, op, dict(kind='goal_birth', scope=scope), None, body, revision)
            k = self.keys(scope, 1)
            writes = self.physical_writes([
                (self.BODY, k['body'], self.wrap_any('body', body), codec, None, None),
                (self.REVISION, k['revision'], self.wrap_any('revision', revision), codec, None, None),
                (self.ORIGIN, k['origin'], self.wrap_any('origin', origin), codec, None, None),
                (self.CONTROL, k['control'], self.wrap_any('control_' + control_edition, control), codec, None, None),
                (self.RECEIPT, self.receipt_key(scope, op), self.wrap_any('receipt', receipt), codec, None, None)],
                method='owner.goal.body.mutation.birth.v1', operation_id=op)
            tx = w.write(writes + list(extra_writes or []))
            w.register_scope(scope)
            self._issue(None, dict(qualification=QUALIFICATION, birth=op, tx=tx['tx_id']), kind='legacy_goal_birth')
            slot.set(dict(tx=tx['tx_id']))
            return op

    def _mutation(self, scope, *, objective=None, state=None, reason_ref=None, active_run_ref=False, kind):
        """prepare one genuine body mutation: returns (writes, op); the caller commits (alone or jointly)."""
        w = self.world
        m = w.shared.goal_model
        codec = self.codec_of(scope)
        body_cell, control_cell = self.body_cell(scope), self.control(scope)
        before = body_cell['value']['record']
        control = control_cell['value']['record']
        require('goal/mutation_completed', before['state'] != 'completed')
        require('goal/mutation_cancelled', control['cancellation_receipt_ref'] is None)
        require('goal/mutation_cancel_pending', control.get('cancellation_pending') is None)
        body = copy.deepcopy(before)
        body.update(revision=NR.uint64(before['revision'] + 1, 'goal/revision'), updated_at=self.clock.now())
        if state is not None:
            body.update(state=state, blocked_reason_ref=reason_ref if state == 'blocked' else None)
        if active_run_ref is not False:
            body['active_run_ref'] = active_run_ref
        items, accepted = [], None
        latest_n = control['latest_objective_revision']
        latest = self.history_cells(scope)[str(latest_n)][0]['value']['record']
        if objective is not None:
            body['objective_text'] = objective
            message = uid('TEST_ONLY:message')
            accepted = dict(goal_id=scope['goal_id'], revision=NR.uint64(latest_n + 1, 'goal/objective_revision'), objective_text=objective, change_source='user_direct',
                            source_message_id=None, approval_id=None, prior_revision_hash=latest['revision_hash'],
                            created_at=body['updated_at'])
            accepted['revision_hash'] = m.hashrev(accepted)
            origin = dict(goal_id=scope['goal_id'], goal_revision=accepted['revision'], origin_kind='user_request',
                          source_message_refs=[message], source_context_manifest_ref=uid('TEST_ONLY:context-manifest'),
                          bound_plan_ref=None, owning_workflow_ref=None)
            kr = self.keys(scope, accepted['revision'])
            items += [(self.REVISION, kr['revision'], self.wrap_any('revision', accepted), codec, None, None),
                      (self.ORIGIN, kr['origin'], self.wrap_any('origin', origin), codec, None, None)]
            latest = accepted
        body['currentness_hash'] = m.hashbody({k: v for k, v in body.items() if k != 'currentness_hash'})
        edition = control['schema_id'].rsplit('.', 1)[1]
        new_control = self._control(scope, body, latest, NR.uint64(control['control_epoch'] + 1, 'goal/control_epoch'), edition,
                                    pending=control['pending'], cancellation_pending=control.get('cancellation_pending'))
        op = uid('TEST_ONLY:goal-mutation')
        receipt = self._receipt(scope, op, dict(kind=kind, scope=scope, after=body), before, body, accepted)
        k = self.keys(scope)
        items += [(self.BODY, k['body'], self.wrap_any('body', body), codec, body_cell['version'], None),
                  (self.CONTROL, k['control'], self.wrap_any('control_' + edition, new_control), codec, control_cell['version'], None),
                  (self.RECEIPT, self.receipt_key(scope, op), self.wrap_any('receipt', receipt), codec, None, None)]
        return self.physical_writes(items, method='owner.goal.body.mutation.%s.v1' % kind, operation_id=op), op

    def update_objective(self, scope, objective):
        with self.recorder.call(self.owner_id, 'update_objective'):
            self.require_unexcluded(scope)
            writes, op = self._mutation(scope, objective=objective, kind='objective_update')
            self.world.write(writes)
            return op

    def set_state(self, scope, state, *, reason_ref=None):
        with self.recorder.call(self.owner_id, 'set_state', dict(state=state)):
            self.require_unexcluded(scope)
            writes, op = self._mutation(scope, state=state, reason_ref=reason_ref or (uid('TEST_ONLY:blocker') if state == 'blocked' else None),
                                        kind='metadata_update')
            self.world.write(writes)
            return op

    def mutate_state(self, scope, new_state, *, reason_ref=None):
        """DG-CA GoalOwner API, routed through the legacy codec edition."""
        return self.set_state(scope, new_state, reason_ref=reason_ref)

    def prepare_active_run(self, scope, run_ref):
        """The Goal half of a joint Plan/Workflow association birth (body active_run_ref)."""
        self.require_unexcluded(scope)
        return self._mutation(scope, active_run_ref=run_ref, kind='metadata_update')[0]

    def reserve_pending(self, scope, stop_epoch):
        """A genuine ordinary pending metadata reservation in the control (control-only write)."""
        w = self.world
        with self.recorder.call(self.owner_id, 'reserve_pending', dict(scope=scope)):
            self.require_unexcluded(scope)
            m = w.shared.goal_model
            codec = self.codec_of(scope)
            cell = self.control(scope)
            control = copy.deepcopy(cell['value']['record'])
            require('goal/pending_exists', control['pending'] is None)
            require('goal/pending_cancel_fenced', control.get('cancellation_pending') is None and control['cancellation_receipt_ref'] is None)
            body = copy.deepcopy(self.body_cell(scope)['value']['record'])
            after = dict(body, revision=NR.uint64(body['revision'] + 1, 'goal/revision'), updated_at=self.clock.now())
            after['currentness_hash'] = m.hashbody({k: v for k, v in after.items() if k != 'currentness_hash'})
            intent = dict(kind='metadata_update', scope=copy.deepcopy(scope), after=after)
            pending = dict(operation_id=uid('TEST_ONLY:pending-body-operation'), owner_ref=self.owner_id, owner_epoch=self.owner_epoch,
                           operation_kind='metadata_update', expected_revision=body['revision'], expected_currentness_hash=body['currentness_hash'],
                           expected_stop_epoch=stop_epoch, intent_sha256=m.digest(intent), after_record=after, accepted_revision=None,
                           origin=None, original_change_authority_ref=uid('TEST_ONLY:metadata-change-authority'), external_authority_ref=None)
            control.update(pending=pending, control_epoch=NR.uint64(control['control_epoch'] + 1, 'goal/control_epoch'))
            edition = control['schema_id'].rsplit('.', 1)[1]
            writes = self.physical_writes([(self.CONTROL, self.keys(scope)['control'], self.wrap_any('control_' + edition, control), codec,
                                            cell['version'], None)], method='owner.goal.body.reserve_pending.v1', operation_id=pending['operation_id'])
            w.write(writes)
            return pending

    def set_cancellation_pending(self, scope, stop_record):
        """An old (already-v2) cancellation that latched Stop and reserved control but whose receipt never issued."""
        w = self.world
        with self.recorder.call(self.owner_id, 'set_cancellation_pending'):
            codec = self.codec_of(scope)
            cell = self.control(scope)
            control = copy.deepcopy(cell['value']['record'])
            require('goal/cancellation_pending_edition', control['schema_id'] == 'pm.goal.body_control.v2')
            body = self.body_cell(scope)['value']['record']
            pending = dict(schema_id='pm.goal.cancel.reservation.v1', schema_version='1.0.0', **scope, operation_id=short_id('op'),
                           source_audit_sha256=sha(b'TEST_ONLY:old-source-audit:' + uuid.uuid4().bytes),
                           stop_intent_sha256=sha(b'TEST_ONLY:old-stop-intent:' + uuid.uuid4().bytes),
                           accepted_user_stop_epoch=stop_record['user_stop_epoch'], accepted_continuation_epoch=stop_record['continuation_epoch'],
                           expected_revision=body['revision'], expected_currentness_hash=body['currentness_hash'],
                           expected_body_semantic_sha256=w.shared.goal_model.bytehash(body),
                           expected_latest_objective_revision=control['latest_objective_revision'],
                           expected_latest_revision_hash=control['latest_revision_hash'], original_goal_owner_epoch=self.owner_epoch,
                           original_sir_source_ref=uid('TEST_ONLY:old-sir-source'), original_cancel_authority_ref=uid('TEST_ONLY:old-cancel-authority'))
            control.update(cancellation_pending=pending, control_epoch=NR.uint64(control['control_epoch'] + 1, 'goal/control_epoch'))
            writes = self.physical_writes([(self.CONTROL, self.keys(scope)['control'], self.wrap_any('control_v2', control), codec,
                                            cell['version'], None)], method='owner.goal.cancel.reserve.v1', operation_id=pending['operation_id'])
            w.write(writes)
            return pending

    # ---- enumeration -------------------------------------------------------------------
    def goal_keys(self, scope):
        """Every physical Goal original this owner holds for the scope (its complete database read)."""
        w = self.world
        k = self.keys(scope)
        out = []
        for family, key in ((self.BODY, k['body']), (self.CONTROL, k['control'])):
            if w.cell(family, key) is not None:
                out.append((family, key))
        prefix_r = w.shared.goal_model.key('goal_revision.v2', scope['project_id'], scope['goal_id']) + ':'
        prefix_o = w.shared.goal_model.key('goal_origin.v1', scope['project_id'], scope['goal_id']) + ':'
        prefix_c = w.shared.goal_model.key('goal_body_mutation_receipt.v1', scope['project_id'], scope['goal_id']) + ':'
        for family, prefix in ((self.REVISION, prefix_r), (self.ORIGIN, prefix_o), (self.RECEIPT, prefix_c)):
            for key in sorted(w.storage.cells.get(family, {})):
                if key.startswith(prefix):
                    out.append((family, key))
        return out

    def enumerate_for_migration(self, scope):
        with self.recorder.call(self.owner_id, 'enumerate_for_migration', dict(scope=scope)) as slot:
            require('goal/database_unavailable', self.available is True)
            sources, pending, receipts = [], [], []
            for family, key in self.goal_keys(scope):
                image = self.image(family, key)
                sources.append(image)
                if family == self.RECEIPT:
                    receipts.append(copy.deepcopy(image['selection']))
                if family == self.CONTROL and image['codec_id'] in CODECS:
                    record = CODECS[image['codec_id']][1](bytes.fromhex(image['bytes_hex']))['record']
                    if record.get('pending') is not None:
                        pending.append(record['pending']['operation_id'])
                    if record.get('cancellation_pending') is not None:
                        pending.append(record['cancellation_pending']['operation_id'])
            mapping = dict(role='goal', sources=sources, pending_operations=sorted(pending), prior_receipts=receipts)
            slot.set(dict(sources=len(sources)))
            return self.mapping_statement(mapping)

    available = True


class LegacyHostStopOwner(SourceOwnerMixin, O.HostStopOwner):
    """Original host Stop authority (single live Stop clock), pre-enrollment."""
    migration_role = 'host_stop'
    available = True
    UNSUPPORTED_CODEC = 'pm.goal.host_stop.legacy_cbor.v0'

    def birth_domain(self, scope, *, unsupported=False):
        """The host's own original Stop domain birth at epoch 0 (proof of a virgin domain is this issuance)."""
        w = self.world
        with self.recorder.call(self.owner_id, 'birth_domain', dict(scope=scope)):
            op = uid('TEST_ONLY:host-stop-domain-birth')
            record = dict(schema_id='pm.goal.cancel.stop_control.v1', schema_version='1.0.0', **scope, user_stop_epoch=0, latched=False,
                          last_original_stop_receipt_ref=None, last_original_stop_receipt_sha256=None, original_birth_or_adoption_ref=op,
                          continuation_epoch=0)
            self.check('producer', CANCEL + '#/$defs/StopControl', record)
            value = self.wrapper(record)
            codec = self.UNSUPPORTED_CODEC if unsupported else MSGPACK
            if unsupported:
                # an original host representation in a codec the mapping does not support
                stored = store_form(value, codec)
                w.write([w.put(self.FAMILY, self.key(scope), stored),
                         w.put(ORIGINS, origin_key(self.FAMILY, self.key(scope), phys_sha(stored)), dict(
                             schema_id='pm.test_only.original_issuance_origin.v1', qualification=QUALIFICATION, owner_role='host_stop',
                             owner_ref=self.owner_id, issued_family_id=self.FAMILY, issued_physical_key=self.key(scope),
                             issued_physical_sha256=phys_sha(stored), codec_id=codec, schema_ref='unsupported:goal_host_stop_control',
                             issuer=transaction_record(self, 'owner.goal.host_stop.birth_domain.v0', op, self.write_permission(), op, op),
                             canonical_origin=None))])
                return op
            w.write(self.physical_writes([(self.FAMILY, self.key(scope), value, MSGPACK, None, None)],
                                         method='owner.goal.host_stop.birth_domain.v1', operation_id=op))
            return op

    def copy_zero_domain(self, scope):
        """A Goal-local zero Stop record written by a copy route, not the host's own birth: it proves no virgin domain."""
        w = self.world
        with self.recorder.call(self.owner_id, 'copy_zero_domain'):
            cell = self.current(scope)
            op = uid('TEST_ONLY:host-stop-copy')
            record = dict(cell['value']['record'], user_stop_epoch=0, continuation_epoch=0, latched=False, last_original_stop_receipt_ref=None,
                          last_original_stop_receipt_sha256=None, original_birth_or_adoption_ref=op)
            w.write(self.physical_writes([(self.FAMILY, self.key(scope), self.wrapper(record), MSGPACK, cell['version'], None)],
                                         method='owner.goal.host_stop.copy_domain.v1', operation_id=op))
            for key in self.receipt_keys(scope):
                w.write([dict(table=self.RECEIPTS, key=key, expected=w.cell(self.RECEIPTS, key)['version'], delete=True)])
            return op

    def manual(self, scope, action):
        """A genuine manual Stop/resume through the host's own CAS. It is never excluded: migration yields to it."""
        require('host_stop/manual_action', action in ('stop', 'resume'))
        w = self.world
        with self.recorder.call(self.owner_id, 'manual_' + action, dict(scope=scope)) as slot:
            cell = self.current(scope)
            require('host_stop/representation', physical(cell['value'])[0] == MSGPACK)
            record = copy.deepcopy(cell['value']['record'])
            receipt_ref = uid('TEST_ONLY:host-stop-receipt')
            if action == 'stop':
                require('host_stop/already_latched', record['latched'] is False)
                record.update(user_stop_epoch=NR.uint64(record['user_stop_epoch'] + 1, 'host_stop/epoch'), latched=True)
            else:
                require('host_stop/not_latched', record['latched'] is True)
                record.update(continuation_epoch=NR.uint64(record['continuation_epoch'] + 1, 'host_stop/epoch'), latched=False)
            receipt = dict(schema_id='pm.test_only.host_stop_receipt.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                           receipt_ref=receipt_ref, action=action, scope=copy.deepcopy(scope), before_sha256=row_sha(cell['value']),
                           user_stop_epoch=record['user_stop_epoch'], continuation_epoch=record['continuation_epoch'],
                           owner_epoch=self.owner_epoch, at=self.clock.now())
            record.update(last_original_stop_receipt_ref=receipt_ref, last_original_stop_receipt_sha256=row_sha(receipt))
            self.check('producer', CANCEL + '#/$defs/StopControl', record)
            tx = w.write(self.physical_writes([(self.RECEIPTS, receipt_ref, receipt, MSGPACK, None, None),
                                               (self.FAMILY, self.key(scope), self.wrapper(record), MSGPACK, cell['version'], None)],
                                              method='owner.goal.host_stop.manual_%s.v1' % action, operation_id=receipt_ref))
            self._issue(None, receipt, kind='stop_receipt', ref=receipt_ref)
            slot.set(dict(tx=tx['tx_id'], receipt_ref=receipt_ref))
            return receipt_ref

    def current(self, scope):
        cell = self.world.cell(self.FAMILY, self.key(scope))
        require('host_stop/unavailable', cell is not None)
        return cell

    def receipt_keys(self, scope):
        return [k for k, c in sorted(self.world.storage.cells.get(self.RECEIPTS, {}).items())
                if type(c['value']) is dict and c['value'].get('scope') == scope]

    def read_for_binding_migration(self, selector):
        """owner.goal.host_stop.read_for_binding_migration.v1 (M4): the ACTUAL effective records and exact StopControl projection.

        Returns (OwnerMapping handle, projection). Each physical original is authenticated in its
        original codec; an unsupported physical host representation is refused, never cloned into a clock.
        """
        w = self.world
        with self.recorder.call(self.owner_id, 'read_for_binding_migration', dict(selector=selector)) as slot:
            w.contracts.validate('MigrationSelector', selector)
            scope = {k: selector['scope'][k] for k in ('storage_instance_id', 'project_id', 'thread_id', 'goal_id')}
            require('host_stop/database_unavailable', self.available is True)
            cell = w.cell(self.FAMILY, self.key(scope))
            require('host_stop/domain_unavailable', cell is not None)
            codec, raw = physical(cell['value'])
            require('host_stop/unsupported_representation', codec == MSGPACK)
            value = msgpack_decode(raw)
            require('host_stop/unsupported_representation', value.get('schema_id') == 'pm.storage_value.goal_host_stop_control.v1')
            self.check('producer', CANCEL + '#/$defs/StorageStopControl', value)
            record = value['record']
            require('host_stop/scope', all(record[k] == scope[k] for k in scope))
            sources = [self.image(self.FAMILY, self.key(scope))]
            receipts = []
            for key in self.receipt_keys(scope):
                image = self.image(self.RECEIPTS, key)
                sources.append(image)
                receipts.append(copy.deepcopy(image['selection']))
            if record['user_stop_epoch'] == 0 and record['continuation_epoch'] == 0:
                # zero requires the actual proof of the virgin domain: the host's own birth issuance at epoch 0
                origin = w.value(ORIGINS, origin_key(self.FAMILY, self.key(scope), sha(raw)))
                require('host_stop/virgin_proof', origin is not None and origin['issuer']['owner_method'] == 'owner.goal.host_stop.birth_domain.v1'
                        and record['original_birth_or_adoption_ref'] == origin['issuer']['original_operation_id'] and receipts == [])
            else:
                require('host_stop/last_receipt', record['last_original_stop_receipt_ref'] is not None
                        and w.cell(self.RECEIPTS, record['last_original_stop_receipt_ref']) is not None
                        and row_sha(w.value(self.RECEIPTS, record['last_original_stop_receipt_ref'])) == record['last_original_stop_receipt_sha256'])
            projection = dict(stop_control=copy.deepcopy(record), host_owner_ref=self.owner_id, host_owner_epoch=self.owner_epoch,
                              user_stop_epoch=record['user_stop_epoch'], continuation_epoch=record['continuation_epoch'],
                              stop_latched=record['latched'])
            mapping = dict(role='host_stop', sources=sources, pending_operations=[], prior_receipts=receipts)
            handle = self.mapping_statement(mapping)
            slot.set(dict(sources=len(sources), epoch=record['user_stop_epoch']))
            return handle, projection


class LegacyPlanOwner(SourceOwnerMixin, C2.PlanOwner):
    """Original AssistantPlan owner with pre-enrollment goal-driven runs and GoalPlanBinding records."""
    migration_role = 'plan'
    available = True
    PENDING = 'TEST_ONLY:plan_pending_attach'

    def gpb_key(self, scope, run_id):
        return 'goal_plan_binding.v1:%s:%s' % (scoped_key(scope), hx(run_id))

    def _plan_items(self, scope, goal_id, operation, tx, *, run_state='running'):
        w = self.world
        self.project_id = scope['project_id']
        plan_id, run_id = oid('plan'), oid('run')
        content = dict(schema_id='pm.test_only.assistant_plan_content.v1', schema_version='1.0.0', assistant_plan_id=plan_id, version=1,
                       steps=['TEST_ONLY step 1', 'TEST_ONLY step 2'])
        plan_hash = row_sha(content)
        k = self.keys(scope, plan_id, run_id)
        plan = self.wrap('assistant_plan_record', k['plan'], dict(schema_id='pm.assistant_plan.record.v1', schema_version='1.0.0',
                         assistant_plan_id=plan_id, project_id=scope['project_id'], thread_id=scope['thread_id'], strategy='standard',
                         backend='direct', current_version=1, approved_version=1, approved_hash=plan_hash, control_state='building',
                         named_plan_id=None), source_revision=1)
        pkey, porigin = self.origin('assistant_plan_record', k['plan'], plan, issuer_method='owner.assistant_plan.original.write.v1',
                                    operation_id=operation, transaction_id=tx, causation_ref=operation, prior=None, at=self.clock.now())
        run = self.wrap('assistant_plan_run', k['run'], dict(schema_id='pm.assistant_plan.run.v1', schema_version='1.0.0', plan_run_id=run_id,
                        assistant_plan_id=plan_id, plan_version=1, plan_hash=plan_hash, execution_topology='goal_driven', todo_list_revision=0,
                        runtime_snapshot_ref=uid('TEST_ONLY:runtime-snapshot'), permission_snapshot_id=uid('TEST_ONLY:permission-snapshot'),
                        project_context_ref=uid('TEST_ONLY:project-context'), schedule_ref=None, state=run_state, goal_ref=goal_id,
                        plan_run_epoch=0), source_revision=1, run_completion_anchor=None)
        rkey, rorigin = self.origin('assistant_plan_run', k['run'], run, issuer_method='owner.assistant_plan.run.original.write.v1',
                                    operation_id=operation, transaction_id=tx, causation_ref=operation, prior=None, at=self.clock.now())
        items = [('assistant_plan_record', k['plan'], plan, MSGPACK, None, None),
                 ('plan_cancel_source_origin', pkey, porigin, MSGPACK, None, None),
                 ('assistant_plan_run', k['run'], run, MSGPACK, None, None),
                 ('plan_cancel_source_origin', rkey, rorigin, MSGPACK, None, None)]
        return plan_id, run_id, run['record'], content, items

    def bind_goal(self, scope):
        """Original Plan build-as-Goal joint birth: plan, goal-driven run, seven-field GoalPlanBinding and the Goal's active_run_ref."""
        w = self.world
        with self.recorder.call(self.owner_id, 'bind_goal', dict(scope=scope)) as slot:
            self.require_unexcluded(scope)
            operation, tx = uid('TEST_ONLY:plan-goal-birth'), uid('TEST_ONLY:plan-goal-birth-tx')
            plan_id, run_id, run, content, items = self._plan_items(scope, scope['goal_id'], operation, tx)
            gpb = dict(goal_id=scope['goal_id'], assistant_plan_id=plan_id, plan_version=run['plan_version'], plan_hash=run['plan_hash'],
                       plan_run_id=run_id, todo_list_ref=uid('TEST_ONLY:todo-list'), planunit_bundle_ref=None)
            gkey = self.gpb_key(scope, run_id)
            gpb_w = dict(schema_id='pm.storage_value.goal_plan_binding.v1', schema_version='1.0.0', storage_instance_id=w.storage_id,
                         physical_key=gkey, record=gpb)
            items.append(('goal_plan_binding', gkey, gpb_w, MSGPACK, None, None))
            writes = self.physical_writes(items, method='owner.assistant_plan.build_as_goal.v1', operation_id=operation)
            writes += w.goal.prepare_active_run(scope, run_id)
            writes.append(w.put(self.CONTENT, plan_id, content))
            w.write(writes)
            slot.set(dict(plan_id=plan_id, run_id=run_id))
            return plan_id, run_id

    def stage_pending_attach(self, scope, *, disposition='no_effect'):
        """An unpublished Plan attach: plan and run are born, the GoalPlanBinding is not; the attach op stays pending."""
        w = self.world
        with self.recorder.call(self.owner_id, 'stage_pending_attach', dict(disposition=disposition)) as slot:
            self.require_unexcluded(scope)
            operation, tx = uid('TEST_ONLY:plan-attach'), uid('TEST_ONLY:plan-attach-tx')
            plan_id, run_id, run, content, items = self._plan_items(scope, scope['goal_id'], operation, tx)
            body_cell = w.cell(w.goal.BODY, w.goal.keys(scope)['body'])
            control_cell = w.cell(w.goal.CONTROL, w.goal.keys(scope)['control'])
            stop_cell = w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))
            pending = dict(schema_id='pm.test_only.plan_pending_attach.v1', qualification=QUALIFICATION, operation_id=operation,
                           operation='plan_goal_birth_or_attach', scope=copy.deepcopy(scope), plan_run_id=run_id, assistant_plan_id=plan_id,
                           owner_ref=self.owner_id, owner_epoch=self.owner_epoch, expected_goal_body_sha256=phys_sha(body_cell['value']),
                           expected_goal_control_sha256=phys_sha(control_cell['value']), expected_stop_control_sha256=phys_sha(stop_cell['value']),
                           binding=dict(goal_id=scope['goal_id'], assistant_plan_id=plan_id, plan_version=run['plan_version'],
                                        plan_hash=run['plan_hash'], plan_run_id=run_id, todo_list_ref=uid('TEST_ONLY:todo-list'),
                                        planunit_bundle_ref=None),
                           disposition=disposition, created_at=self.clock.now())
            items.append((self.PENDING, 'plan_pending_attach:%s:%s' % (scoped_key(scope), hx(operation)), pending, MSGPACK, None, None))
            writes = self.physical_writes(items, method='owner.assistant_plan.attach_goal.reserve.v1', operation_id=operation)
            writes.append(w.put(self.CONTENT, plan_id, content))
            w.write(writes)
            slot.set(dict(operation=operation))
            return operation, plan_id, run_id

    def transition_run(self, scope, plan_id, run_id, new_state):
        """A genuine owner run-state change: whole-value CAS, source_revision+1, new origin."""
        w = self.world
        with self.recorder.call(self.owner_id, 'transition_run', dict(state=new_state)):
            self.require_unexcluded(scope)
            self.project_id = scope['project_id']
            key = self.keys(scope, plan_id, run_id)['run']
            cell = w.cell('assistant_plan_run', key)
            before = cell['value']
            after = copy.deepcopy(before)
            after['source_revision'] = NR.uint64(before['source_revision'] + 1, 'plan/source_revision')
            after['record']['state'] = new_state
            op, tx = uid('TEST_ONLY:run-transition'), uid('TEST_ONLY:tx')
            if new_state in ('completed', 'cancelled'):
                after['run_completion_anchor'] = self.completion_anchor(after, operation_id=op, transaction_id=tx)
            C2.check(w, 'StoragePlanRun', after)
            okey, origin = self.origin('assistant_plan_run', key, after, issuer_method='owner.assistant_plan.run.original.write.v1',
                                       operation_id=op, transaction_id=tx, causation_ref=op, prior=row_sha(before), at=self.clock.now())
            w.write(self.physical_writes([('assistant_plan_run', key, after, MSGPACK, cell['version'], None),
                                          ('plan_cancel_source_origin', okey, origin, MSGPACK, None, None)],
                                         method='owner.assistant_plan.run.transition.v1', operation_id=op))
            return [('assistant_plan_run', key), ('plan_cancel_source_origin', okey)]

    def approve_new_version_dg(self, scope, plan_id):
        """A genuine later approval (current/approved version +1, new approved hash) with its issuance origin."""
        w = self.world
        with self.recorder.call(self.owner_id, 'approve_new_version'):
            self.require_unexcluded(scope)
            self.project_id = scope['project_id']
            key = self.keys(scope, plan_id)['plan']
            cell = w.cell('assistant_plan_record', key)
            before = cell['value']
            after = copy.deepcopy(before)
            after['source_revision'] = NR.uint64(before['source_revision'] + 1, 'plan/source_revision')
            version = NR.uint64(before['record']['current_version'] + 1, 'plan/version')
            after['record'].update(current_version=version, approved_version=version,
                                   approved_hash=row_sha(dict(plan=plan_id, version=version, steps=['TEST_ONLY revised step'])))
            op = uid('TEST_ONLY:plan-approval')
            okey, origin = self.origin('assistant_plan_record', key, after, issuer_method='owner.assistant_plan.original.write.v1',
                                       operation_id=op, transaction_id=uid('TEST_ONLY:tx'), causation_ref=op, prior=row_sha(before),
                                       at=self.clock.now())
            w.write(self.physical_writes([('assistant_plan_record', key, after, MSGPACK, cell['version'], None),
                                          ('plan_cancel_source_origin', okey, origin, MSGPACK, None, None)],
                                         method='owner.assistant_plan.approve_version.v1', operation_id=op))

    def completion_anchor(self, run_value, *, operation_id=None, transaction_id=None):
        """The run's own settlement anchor (APR RunCompletionAnchor) from its actual terminal transition."""
        r = run_value['record']
        return dict(storage_instance_id=self.world.storage_id, project_id=self.project_id, thread_id=run_value['physical_key'] and
                    self._thread_of(run_value), assistant_plan_id=r['assistant_plan_id'], plan_run_id=r['plan_run_id'], terminal_state=r['state'],
                    original_operation_id=operation_id, original_transaction_id=transaction_id, settled_at_utc=self.clock.now(),
                    settlement_source_revision=run_value['source_revision'], settlement_plan_run_epoch=r['plan_run_epoch'])

    def _thread_of(self, run_value):
        # assistant_plan_run.v1:{hex storage}:{hex project}:{hex thread}:{hex run}
        return bytes.fromhex(run_value['physical_key'].split(':')[3]).decode('utf-8')

    def run_keys(self, scope):
        prefix = 'assistant_plan_run.v1:%s:%s:%s:' % (hx(self.world.storage_id), hx(scope['project_id']), hx(scope['thread_id']))
        return [k for k in self.scoped_rows('assistant_plan_run', lambda key, v: key.startswith(prefix) and v['record']['goal_ref'] == scope['goal_id'])]

    def plan_sources(self, scope):
        """(family, key) of every Plan original this owner holds that names the Goal."""
        w = self.world
        out = []
        for rkey in self.run_keys(scope):
            run = self.decoded('assistant_plan_run', rkey)
            pkey = 'assistant_plan_record.v1:%s:%s:%s:%s' % (hx(w.storage_id), hx(scope['project_id']), hx(scope['thread_id']),
                                                             hx(run['record']['assistant_plan_id']))
            for family, key in (('assistant_plan_record', pkey), ('assistant_plan_run', rkey)):
                if (family, key) not in out and w.cell(family, key) is not None:
                    out.append((family, key))
                    prefix = 'plan_cancel_source_origin.v1:%s:%s:' % (hx(w.storage_id), hx(key))
                    for okey in sorted(w.storage.cells.get('plan_cancel_source_origin', {})):
                        if okey.startswith(prefix):
                            out.append(('plan_cancel_source_origin', okey))
        for key in sorted(w.storage.cells.get('goal_plan_binding', {})):
            if key.startswith('goal_plan_binding.v1:%s:' % scoped_key(scope)):
                out.append(('goal_plan_binding', key))
        for key in sorted(w.storage.cells.get(self.PENDING, {})):
            if key.startswith('plan_pending_attach:%s:' % scoped_key(scope)):
                out.append((self.PENDING, key))
        return out

    def enumerate_for_migration(self, scope):
        with self.recorder.call(self.owner_id, 'enumerate_for_migration', dict(scope=scope)) as slot:
            require('plan/database_unavailable', self.available is True)
            sources, pending = [], []
            for family, key in self.plan_sources(scope):
                sources.append(self.image(family, key))
                if family == self.PENDING:
                    pending.append(self.decoded(family, key)['operation_id'])
            mapping = dict(role='plan', sources=sources, pending_operations=sorted(pending), prior_receipts=[])
            slot.set(dict(sources=len(sources)))
            return self.mapping_statement(mapping)

    def inventory_members(self, scope):
        out = []
        for family, key in self.plan_sources(scope):
            if family in ('goal_plan_binding', self.PENDING):
                out.append(dict(member_ref='%s|%s' % (family, key), kind=family))
        return out


class LegacySchedulerOwner(SourceOwnerMixin, C2.SchedulerOwner):
    """Original Scheduler owner: run schedules, run bindings, consents and callback admissions."""
    migration_role = 'scheduler'
    available = True
    CALLBACKS = 'TEST_ONLY:scheduler_callback_admission'

    def schedule_run(self, scope, plan_id, run, stop_epoch, *, consents=1, schedules=1):
        w = self.world
        self.project_id = scope['project_id']
        with self.recorder.call(self.owner_id, 'schedule_run') as slot:
            self.require_unexcluded(scope)
            items, ids = [], dict(schedules=[], consents=[])
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
                    items += [(family, key, value, MSGPACK, None, None), ('plan_cancel_source_origin', okey, origin, MSGPACK, None, None)]
                ids['schedules'].append(sid)
            for _ in range(consents):
                now = self.clock.now()
                consent = dict(schema_id='pm.runtime.quota_resume_consent.v1', schema_version='1.0.0', consent_id=oid('consent'),
                               run_id=run['plan_run_id'], provider_id='TO-provider', account_id=oid('acct'), enabled=True, reset_time=None,
                               reset_truth='unknown', confidence=None, execution_schedule_id=ids['schedules'][0] if ids['schedules'] else None,
                               user_stop_epoch=stop_epoch, created_at=now, updated_at=now)
                key = self.consent_key(scope, consent)
                value = self.wrap('quota_resume_consent', key, consent, source_revision=1)
                okey, origin = self.origin('quota_resume_consent', key, value, issuer_method='owner.scheduling.consent.original.write.v1',
                                           operation_id=operation, transaction_id=tx, causation_ref=operation, prior=None, at=self.clock.now())
                items += [('quota_resume_consent', key, value, MSGPACK, None, None), ('plan_cancel_source_origin', okey, origin, MSGPACK, None, None)]
                ids['consents'].append(key)
            if items:
                w.write(self.physical_writes(items, method='owner.scheduling.schedule_run.v1', operation_id=operation))
            slot.set(ids)
            return ids

    def schedule_message(self, scope):
        """An unrelated scheduled message in the same project; migration must leave it byte-unchanged and outside the Goal."""
        w = self.world
        self.project_id = scope['project_id']
        sid = uid('TEST_ONLY:schedule-message')
        k = self.keys(scope, sid)
        value = self.wrap('execution_schedule', k['schedule'], self.schedule_record(scope, sid, 'scheduled_message', uid('TEST_ONLY:message'),
                          None, None), source_revision=1)
        operation = uid('TEST_ONLY:message-schedule')
        okey, origin = self.origin('execution_schedule', k['schedule'], value, issuer_method='owner.scheduling.schedule.original.write.v1',
                                   operation_id=operation, transaction_id=uid('TEST_ONLY:tx'), causation_ref=operation, prior=None,
                                   at=self.clock.now())
        w.write(self.physical_writes([('execution_schedule', k['schedule'], value, MSGPACK, None, None),
                                      ('plan_cancel_source_origin', okey, origin, MSGPACK, None, None)],
                                     method='owner.scheduling.schedule_message.v1', operation_id=operation))
        return k['schedule']

    def admit_callback(self, scope, run_id, *, run_epoch, stop_epoch):
        """An admitted (pending) execution callback for a run; its effect is unknown until settled."""
        w = self.world
        with self.recorder.call(self.owner_id, 'admit_callback') as slot:
            self.require_unexcluded(scope)
            aid = uid('TEST_ONLY:callback-admission')
            value = dict(schema_id='pm.test_only.scheduler_callback_admission.v1', qualification=QUALIFICATION, admission_id=aid,
                         scope=copy.deepcopy(scope), run_id=run_id, run_epoch=run_epoch, stop_epoch=stop_epoch, state='admitted',
                         effect_receipt_ref=None, owner_ref=self.owner_id, owner_epoch=self.owner_epoch, at=self.clock.now())
            key = 'callback_admission:%s:%s' % (scoped_key(scope), hx(aid))
            w.write(self.physical_writes([(self.CALLBACKS, key, value, MSGPACK, None, None)], method='owner.scheduling.admit_callback.v1',
                                         operation_id=aid))
            slot.set(dict(key=key))
            return key

    def settle_callback(self, scope, key):
        """The Scheduler reconciles its own admitted callback with a genuine settled effect."""
        w = self.world
        with self.recorder.call(self.owner_id, 'settle_callback'):
            self.require_unexcluded(scope)
            cell = w.cell(self.CALLBACKS, key)
            value = dict(cell['value'], state='settled', effect_receipt_ref=uid('TEST_ONLY:callback-effect-receipt'), at=self.clock.now())
            w.write(self.physical_writes([(self.CALLBACKS, key, value, MSGPACK, cell['version'], None)],
                                         method='owner.scheduling.settle_callback.v1', operation_id=value['admission_id']))

    def scheduler_sources(self, scope, run_ids):
        w = self.world
        out = []
        prefix = 'execution_schedule.v1:%s:%s:' % (hx(w.storage_id), hx(scope['project_id']))
        for key in self.scoped_rows('execution_schedule', lambda k, v: k.startswith(prefix) and v['record']['target_kind'] == 'assistant_plan_run'
                                    and v['record']['target_id'] in run_ids):
            bkey = key.replace('execution_schedule.v1:', 'execution_schedule_run_binding.v1:')
            out.append(('execution_schedule', key))
            if w.cell('execution_schedule_run_binding', bkey) is not None:
                out.append(('execution_schedule_run_binding', bkey))
        for key in self.scoped_rows('quota_resume_consent', lambda k, v: v['record']['run_id'] in run_ids and
                                    k.startswith('quota_resume_consent.v1:%s:%s:' % (hx(w.storage_id), hx(scope['project_id'])))):
            out.append(('quota_resume_consent', key))
        with_origins = []
        for family, key in out:
            with_origins.append((family, key))
            oprefix = 'plan_cancel_source_origin.v1:%s:%s:' % (hx(w.storage_id), hx(key))
            for okey in sorted(w.storage.cells.get('plan_cancel_source_origin', {})):
                if okey.startswith(oprefix):
                    with_origins.append(('plan_cancel_source_origin', okey))
        for key in sorted(w.storage.cells.get(self.CALLBACKS, {})):
            if key.startswith('callback_admission:%s:' % scoped_key(scope)):
                with_origins.append((self.CALLBACKS, key))
        return with_origins

    def enumerate_for_migration(self, scope, run_ids):
        with self.recorder.call(self.owner_id, 'enumerate_for_migration', dict(scope=scope, runs=sorted(run_ids))) as slot:
            require('scheduler/database_unavailable', getattr(self, 'available', True) is True)
            sources, pending = [], []
            for family, key in self.scheduler_sources(scope, set(run_ids)):
                sources.append(self.image(family, key))
                if family == self.CALLBACKS:
                    value = self.decoded(family, key)
                    if value['state'] == 'admitted':
                        pending.append(value['admission_id'])
            mapping = dict(role='scheduler', sources=sources, pending_operations=sorted(pending), prior_receipts=[])
            slot.set(dict(sources=len(sources)))
            return self.mapping_statement(mapping)

    def inventory_members(self, scope):
        runs = set()
        for rkey in self.world.plans.run_keys(scope):
            runs.add(self.world.plans.decoded('assistant_plan_run', rkey)['record']['plan_run_id'])
        return [dict(member_ref='%s|%s' % (f, k), kind=f) for f, k in self.scheduler_sources(scope, runs)
                if f in ('execution_schedule', 'quota_resume_consent', self.CALLBACKS)]


class LegacyWorkflowOwner(SourceOwnerMixin, WorldOwner):
    """Original Workflow/native owner: D01 run body/control, Workflow birth/update/head, lineage origin, pending D05/D06."""
    role = 'workflow'
    migration_role = 'workflow'
    available = True
    ACT = 'TEST_ONLY:workflow_activation_source'
    PENDING = 'TEST_ONLY:workflow_pending_operation'

    def keys(self, scope, run_id):
        g = '%s:%s:%s:%s' % (hx(self.world.storage_id), hx(scope['project_id']), hx(scope['goal_id']), hx(run_id))
        return dict(body='workflow_goal_run_body.v1:' + g, control='workflow_goal_run_control.v1:' + g,
                    birth='executor_workflow_workflow_birth.v4:' + g, head='executor_workflow_workflow_head.v4:%s:1' % g,
                    head_prefix='executor_workflow_workflow_head.v4:%s:' % g,
                    pointer='executor_workflow_current_pointer.v2:' + g,
                    update='executor_workflow_workflow_update.v4:%s:' % g, lineage='executor_workflow_lineage_origin.v4:%s:' % g,
                    act='workflow_activation_source:%s:' % g, pending='workflow_pending_operation:%s:' % g)

    def native_owner(self):
        return dict(owner_ref=self.owner_id, owner_epoch=self.owner_epoch, server_id=self.world.sir.server_id, server_claim_epoch=1)

    def _act(self, scope, run_id, kind, detail):
        key = self.keys(scope, run_id)['act'] + kind + ':' + hx(uid('x'))
        return key, dict(schema_id='pm.test_only.workflow_activation_source.v1', qualification=QUALIFICATION, kind=kind, scope=copy.deepcopy(scope),
                         goal_run_id=run_id, owner_ref=self.owner_id, owner_epoch=self.owner_epoch, at=self.clock.now(), detail=detail)

    def attach(self, scope, *, goal_body_scope=None):
        """Original Workflow birth bound to the Goal: D01 run body/control, Start birth/update/head and lineage, one joint transaction.

        ``goal_body_scope`` (negative cases only) makes the run body name another Goal's body as its original Goal body.
        """
        w = self.world
        with self.recorder.call(self.owner_id, 'attach', dict(scope=scope)) as slot:
            self.require_unexcluded(scope)
            run_id = oid('grun')
            k = self.keys(scope, run_id)
            rscope = dict(storage_instance_id=w.storage_id, project_id=scope['project_id'], goal_id=scope['goal_id'], goal_run_id=run_id)
            op, tx = uid('TEST_ONLY:workflow-birth'), uid('TEST_ONLY:workflow-birth-tx')
            identity = dict(project_id=scope['project_id'], goal_id=scope['goal_id'], goal_run_id=run_id, plan_compile_run_id=oid('pcr'),
                            workgraph_id=oid('wg'), workgraph_revision=1, workgraph_ref=uid('TEST_ONLY:workgraph'),
                            workgraph_sha256=sha(uuid.uuid4().bytes))
            # Owner-issued activation sources (decision, lineage, origin, owner result/origin) with their own issuance origins.
            acts = {}
            items = []
            for kind in ('activation_decision', 'goal_lineage', 'activation_origin', 'owner_result', 'owner_origin'):
                key, value = self._act(scope, run_id, kind, dict(identity=identity))
                acts[kind] = key
                items.append((self.ACT, key, value, MSGPACK, None, None))
            first = self.physical_writes(items, method='owner.workflow.activation.sources.v1', operation_id=op)
            w.write(first)
            sel = lambda family, key: source_selector(w, family, key)
            binding_of = lambda kind: dict(source=sel(self.ACT, acts[kind]), origin=sel(ORIGINS, origin_key(self.ACT, acts[kind],
                                                                                                             phys_sha(w.value(self.ACT, acts[kind])))))
            goal_body_key = w.goal.keys(goal_body_scope or scope)['body']
            body = dict(schema_id='pm.storage_value.workflow_goal_run_body.v1', schema_version='1.0.0', storage_instance_id=w.storage_id,
                        physical_key=k['body'], record=dict(identity=identity, revision=1, status='running',
                        activation_state=dict(activation_id=oid('act'), state='active', revision=1, goal_run_id=run_id,
                                              workgraph_ref=identity['workgraph_ref'], idempotency_key=uid('TEST_ONLY:activation-idempotency')),
                        original_goal_body=sel(w.goal.BODY, goal_body_key), original_goal_lineage=binding_of('goal_lineage'),
                        execution_owner_ref=self.owner_id, execution_owner_epoch=self.owner_epoch,
                        source_activation_decision=binding_of('activation_decision'), required_set=None, installed_workgraph=None,
                        certification_receipt=None))
            vsel = lambda family, key, value: dict(storage_instance_id=w.storage_id, family_id=family, physical_key=key,
                                                   schema_id=value['schema_id'], schema_version=value['schema_version'],
                                                   physical_value_sha256=row_sha(value))
            control = dict(schema_id='pm.storage_value.workflow_goal_run_control.v1', schema_version='1.0.0', storage_instance_id=w.storage_id,
                           physical_key=k['control'], record=dict(identity=identity, revision=1, body_record_sha256=row_sha(body['record']),
                                                                  execution_owner_epoch=self.owner_epoch, pending_operation_id=None))
            bsel, csel = vsel('workflow_goal_run_body', k['body'], body), vsel('workflow_goal_run_control', k['control'], control)
            commit = dict(kind='historical_native_issuance_commitment', body=bsel, control=csel, identity=identity, body_revision=1,
                          activation_revision=1, status='running', activation_state='active', workflow_owner_ref=self.owner_id,
                          workflow_owner_epoch=self.owner_epoch)
            update_key = k['update'] + hx(op)
            update = dict(schema_id='pm.storage_value.executor_workflow_workflow_update.v4', schema_version='4.0.0', record=dict(
                scope=rscope, operation_id=op, transaction_id=tx, revision=1, previous_head=None, before_body=None, before_control=None,
                after_body=bsel, after_control=csel, cause='activation', original_owner_result=sel(self.ACT, acts['owner_result']),
                original_owner_origin=sel(self.ACT, acts['owner_origin']),
                transition=dict(rule='activation_begin', before=None, after=commit, original_writer_method='owner.workflow.activation.begin.v1',
                                original_owner_result=sel(self.ACT, acts['owner_result']), original_owner_origin=sel(self.ACT, acts['owner_origin']))))
            birth = dict(schema_id='pm.storage_value.executor_workflow_workflow_birth.v4', schema_version='4.0.0', record=dict(
                scope=rscope, operation_id=op, transaction_id=tx, activation_body=bsel, activation_control=csel,
                activation_origin=sel(self.ACT, acts['activation_origin']), writer_contract='pm.executor.workflow_source.all_writers.v3',
                installed_contract_digest=w.shared.execution_methods_sha256, birth_issuance=commit))
            usel = vsel('executor_workflow_workflow_update', update_key, update)
            head = dict(schema_id='pm.storage_value.executor_workflow_workflow_head.v4', schema_version='4.0.0', record=dict(
                scope=rscope, revision=1, activation_body=bsel, activation_origin=sel(self.ACT, acts['activation_origin']), current_body=bsel,
                current_control=csel, previous_head=None, last_update=usel, workflow_owner_ref=self.owner_id, workflow_owner_epoch=self.owner_epoch,
                pending_operation_id=None))
            hsel = vsel('executor_workflow_workflow_head', k['head'], head)
            pointer_value = dict(schema_id='pm.storage_value.executor_workflow_current_pointer.v2', schema_version='2.0.0', record=dict(
                scope=rscope, revision=1, workflow_head=hsel, inventory_head=None, scheduler_control=None, last_origin_operation_id=op,
                pending_operation_id=None))
            pointer = vsel('executor_workflow_current_pointer', k['pointer'], pointer_value)
            lineage_key = k['lineage'] + hx(op) + ':' + hx('owner.executor.workflow_source.enroll_workflow_birth.v3')
            lineage = dict(schema_id='pm.storage_value.executor_workflow_lineage_origin.v4', schema_version='4.0.0', record=dict(
                scope=rscope, method='owner.executor.workflow_source.enroll_workflow_birth.v3', operation_id=op, transaction_id=tx,
                owner=self.native_owner(), causation=sel(self.ACT, acts['activation_decision']), preimages=[],
                afterimages=dict(workflow_birth=vsel('executor_workflow_workflow_birth', k['birth'], birth), workflow_update=usel,
                                 workflow_head=vsel('executor_workflow_workflow_head', k['head'], head), pointer=pointer),
                issued_at_utc=self.clock.now()))
            writes = self.physical_writes([('workflow_goal_run_body', k['body'], body, MSGPACK, None, None),
                                           ('workflow_goal_run_control', k['control'], control, MSGPACK, None, None),
                                           ('executor_workflow_workflow_update', update_key, update, MSGPACK, None, None),
                                           ('executor_workflow_workflow_birth', k['birth'], birth, MSGPACK, None, None),
                                           ('executor_workflow_workflow_head', k['head'], head, MSGPACK, None, None),
                                           ('executor_workflow_current_pointer', k['pointer'], pointer_value, MSGPACK, None, None),
                                           ('executor_workflow_lineage_origin', lineage_key, lineage, MSGPACK, None, None)],
                                          method='owner.executor.workflow_source.enroll_workflow_birth.v3', operation_id=op)
            writes += w.goal.prepare_active_run(scope, run_id)
            w.write(writes)
            slot.set(dict(run_id=run_id))
            return run_id

    def latest_head_key(self, scope, run_id):
        k = self.keys(scope, run_id)
        heads = [key for key in self.world.storage.cells.get('executor_workflow_workflow_head', {}) if key.startswith(k['head_prefix'])]
        require('workflow/head_unavailable', bool(heads))
        return max(heads, key=lambda key: int(key.rsplit(':', 1)[1]))

    def complete_d06(self, scope, run_id):
        """A positive D06 publication on the native run (status cancelled): body/control, update, head and pointer advance once."""
        w = self.world
        with self.recorder.call(self.owner_id, 'complete_d06') as slot:
            self.require_unexcluded(scope)
            k = self.keys(scope, run_id)
            op, tx = uid('TEST_ONLY:workflow-d06'), uid('TEST_ONLY:workflow-d06-tx')
            rscope = dict(storage_instance_id=w.storage_id, project_id=scope['project_id'], goal_id=scope['goal_id'], goal_run_id=run_id)
            acts, items = {}, []
            for kind in ('owner_result', 'owner_origin'):
                key, value = self._act(scope, run_id, kind, dict(disposition='d06_cancel_nonterminal', operation_id=op))
                acts[kind] = key
                items.append((self.ACT, key, value, MSGPACK, None, None))
            w.write(self.physical_writes(items, method='owner.workflow.executor_cancel.disposition_sources.v3', operation_id=op))
            sel = lambda family, key: source_selector(w, family, key)
            vsel = lambda family, key, value: dict(storage_instance_id=w.storage_id, family_id=family, physical_key=key,
                                                   schema_id=value['schema_id'], schema_version=value['schema_version'],
                                                   physical_value_sha256=row_sha(value))
            bcell, ccell = w.cell('workflow_goal_run_body', k['body']), w.cell('workflow_goal_run_control', k['control'])
            hkey = self.latest_head_key(scope, run_id)
            hcell, pcell = w.cell('executor_workflow_workflow_head', hkey), w.cell('executor_workflow_current_pointer', k['pointer'])
            old_body, old_control, old_head = bcell['value'], ccell['value'], hcell['value']
            require('workflow/d06_pending', old_control['record']['pending_operation_id'] is None)
            body = copy.deepcopy(old_body)
            body['record'].update(revision=NR.uint64(old_body['record']['revision'] + 1, 'workflow/body_revision'), status='cancelled')
            control = copy.deepcopy(old_control)
            control['record'].update(revision=NR.uint64(old_control['record']['revision'] + 1, 'workflow/control_revision'),
                                     body_record_sha256=row_sha(body['record']))

            def commitment(b, c):
                return dict(kind='historical_native_issuance_commitment', body=vsel('workflow_goal_run_body', k['body'], b),
                            control=vsel('workflow_goal_run_control', k['control'], c), identity=b['record']['identity'],
                            body_revision=b['record']['revision'], activation_revision=b['record']['activation_state']['revision'],
                            status=b['record']['status'], activation_state=b['record']['activation_state']['state'],
                            workflow_owner_ref=self.owner_id, workflow_owner_epoch=self.owner_epoch)
            revision = NR.uint64(old_head['record']['revision'] + 1, 'workflow/head_revision')
            update_key = k['update'] + hx(op)
            update = dict(schema_id='pm.storage_value.executor_workflow_workflow_update.v4', schema_version='4.0.0', record=dict(
                scope=rscope, operation_id=op, transaction_id=tx, revision=revision, previous_head=vsel('executor_workflow_workflow_head', hkey, old_head),
                before_body=vsel('workflow_goal_run_body', k['body'], old_body), before_control=vsel('workflow_goal_run_control', k['control'], old_control),
                after_body=vsel('workflow_goal_run_body', k['body'], body), after_control=vsel('workflow_goal_run_control', k['control'], control),
                cause='owner_status', original_owner_result=sel(self.ACT, acts['owner_result']), original_owner_origin=sel(self.ACT, acts['owner_origin']),
                transition=dict(rule='d06_cancel_nonterminal', before=commitment(old_body, old_control), after=commitment(body, control),
                                original_writer_method='owner.workflow.executor_cancel.publish_disposition.v3',
                                original_owner_result=sel(self.ACT, acts['owner_result']), original_owner_origin=sel(self.ACT, acts['owner_origin']))))
            usel = vsel('executor_workflow_workflow_update', update_key, update)
            new_hkey = k['head_prefix'] + str(revision)
            head = dict(old_head, record=dict(old_head['record'], revision=revision, current_body=vsel('workflow_goal_run_body', k['body'], body),
                                              current_control=vsel('workflow_goal_run_control', k['control'], control),
                                              previous_head=vsel('executor_workflow_workflow_head', hkey, old_head), last_update=usel))
            hsel = vsel('executor_workflow_workflow_head', new_hkey, head)
            pointer = dict(pcell['value'], record=dict(pcell['value']['record'], revision=NR.uint64(pcell['value']['record']['revision'] + 1,
                                                                                                     'workflow/pointer_revision'),
                                                       workflow_head=hsel, last_origin_operation_id=op))
            lineage_key = k['lineage'] + hx(op) + ':' + hx('owner.executor.workflow_source.update_workflow.v3')
            lineage = dict(schema_id='pm.storage_value.executor_workflow_lineage_origin.v4', schema_version='4.0.0', record=dict(
                scope=rscope, method='owner.executor.workflow_source.update_workflow.v3', operation_id=op, transaction_id=tx,
                owner=self.native_owner(), causation=sel(self.ACT, acts['owner_result']),
                preimages=[vsel('workflow_goal_run_body', k['body'], old_body), vsel('workflow_goal_run_control', k['control'], old_control),
                           vsel('executor_workflow_workflow_head', hkey, old_head)],
                afterimages=dict(workflow_update=usel, workflow_head=hsel, pointer=vsel('executor_workflow_current_pointer', k['pointer'], pointer)),
                issued_at_utc=self.clock.now()))
            w.write(self.physical_writes([('workflow_goal_run_body', k['body'], body, MSGPACK, bcell['version'], None),
                                          ('workflow_goal_run_control', k['control'], control, MSGPACK, ccell['version'], None),
                                          ('executor_workflow_workflow_update', update_key, update, MSGPACK, None, None),
                                          ('executor_workflow_workflow_head', new_hkey, head, MSGPACK, None, None),
                                          ('executor_workflow_current_pointer', k['pointer'], pointer, MSGPACK, pcell['version'], None),
                                          ('executor_workflow_lineage_origin', lineage_key, lineage, MSGPACK, None, None)],
                                         method='owner.workflow.executor_cancel.publish_disposition.v3', operation_id=op))
            slot.set(dict(op=op, head=new_hkey))
            return op

    def begin_pending(self, scope, run_id, *, kind='d06_cancel', disposition='unknown'):
        """An in-flight D05/D06 operation: control pending_operation_id and the owner's pending record."""
        w = self.world
        with self.recorder.call(self.owner_id, 'begin_pending', dict(kind=kind)) as slot:
            self.require_unexcluded(scope)
            k = self.keys(scope, run_id)
            op = uid('TEST_ONLY:workflow-op')
            cell = w.cell('workflow_goal_run_control', k['control'])
            control = copy.deepcopy(cell['value'])
            control['record'].update(revision=NR.uint64(control['record']['revision'] + 1, 'workflow/control_revision'), pending_operation_id=op)
            pending = dict(schema_id='pm.test_only.workflow_pending_operation.v1', qualification=QUALIFICATION, operation_id=op, kind=kind,
                           scope=copy.deepcopy(scope), goal_run_id=run_id, disposition=disposition, owner_ref=self.owner_id,
                           owner_epoch=self.owner_epoch, at=self.clock.now())
            w.write(self.physical_writes([('workflow_goal_run_control', k['control'], control, MSGPACK, cell['version'], None),
                                          (self.PENDING, k['pending'] + hx(op), pending, MSGPACK, None, None)],
                                         method='owner.workflow.executor_cancel.begin.v3', operation_id=op))
            slot.set(dict(op=op))
            return op

    def reconcile_pending(self, scope, run_id, op):
        """The original owner reconciles its own pending operation as genuinely no-effect."""
        w = self.world
        with self.recorder.call(self.owner_id, 'reconcile_pending'):
            self.require_unexcluded(scope)
            k = self.keys(scope, run_id)
            cell = w.cell('workflow_goal_run_control', k['control'])
            control = copy.deepcopy(cell['value'])
            require('workflow/reconcile_op', control['record']['pending_operation_id'] == op)
            control['record'].update(revision=NR.uint64(control['record']['revision'] + 1, 'workflow/control_revision'), pending_operation_id=None)
            pcell = w.cell(self.PENDING, k['pending'] + hx(op))
            pending = dict(pcell['value'], disposition='no_effect', at=self.clock.now())
            w.write(self.physical_writes([('workflow_goal_run_control', k['control'], control, MSGPACK, cell['version'], None),
                                          (self.PENDING, k['pending'] + hx(op), pending, MSGPACK, pcell['version'], None)],
                                         method='owner.workflow.executor_cancel.reconcile.v3', operation_id=op))

    def run_ids(self, scope):
        prefix = 'workflow_goal_run_body.v1:%s:%s:%s:' % (hx(self.world.storage_id), hx(scope['project_id']), hx(scope['goal_id']))
        return [self.decoded('workflow_goal_run_body', k)['record']['identity']['goal_run_id']
                for k in sorted(self.world.storage.cells.get('workflow_goal_run_body', {})) if k.startswith(prefix)]

    def workflow_sources(self, scope):
        w = self.world
        out = []
        for run_id in self.run_ids(scope):
            k = self.keys(scope, run_id)
            for family, key in (('workflow_goal_run_body', k['body']), ('workflow_goal_run_control', k['control']),
                                ('executor_workflow_workflow_birth', k['birth']), ('executor_workflow_current_pointer', k['pointer'])):
                if w.cell(family, key) is not None:
                    out.append((family, key))
            for family, prefix in (('executor_workflow_workflow_head', k['head_prefix']), ('executor_workflow_workflow_update', k['update']),
                                   ('executor_workflow_lineage_origin', k['lineage']), (self.ACT, k['act']), (self.PENDING, k['pending'])):
                for key in sorted(w.storage.cells.get(family, {})):
                    if key.startswith(prefix):
                        out.append((family, key))
        return out

    def enumerate_for_migration(self, scope):
        with self.recorder.call(self.owner_id, 'enumerate_for_migration', dict(scope=scope)) as slot:
            require('workflow/database_unavailable', self.available is True)
            sources, pending = [], []
            for family, key in self.workflow_sources(scope):
                sources.append(self.image(family, key))
                if family == 'workflow_goal_run_control':
                    op = self.decoded(family, key)['record']['pending_operation_id']
                    if op is not None:
                        pending.append(op)
            mapping = dict(role='workflow', sources=sources, pending_operations=sorted(pending), prior_receipts=[])
            slot.set(dict(sources=len(sources)))
            return self.mapping_statement(mapping)

    def inventory_members(self, scope):
        return [dict(member_ref='workflow_run|' + r, kind='workflow_association') for r in self.run_ids(scope)]


class LegacySIROwner(SourceOwnerMixin, O.SIROwner):
    """Original SIR command acceptance and outcomes for Goal commands (SIR-049/051/052)."""
    migration_role = 'sir'
    available = True

    def __init__(self, world, constants=None, **kw):
        super().__init__(world, **kw)
        if constants:
            self.server_id, self.host_id, self.environment_id = constants['server_id'], constants['host_id'], constants['environment_id']

    def constants(self):
        return dict(server_id=self.server_id, host_id=self.host_id, environment_id=self.environment_id)

    def accept(self, request, *, command_id='cmd.chat.goal.cancel'):
        """Accept one dispatch with issuance origins; identical replay returns the original, altered conflicts."""
        w = self.world
        with self.recorder.call(self.owner_id, 'accept_dispatch', dict(request=request)) as slot:
            self.check('producer', CANCEL + '#/$defs/GoalCancelRequestV2', request)
            existing = w.value(self.ACCEPTED, request['command_instance_id'])
            if existing is not None:
                require('sir/dispatch_conflict', same(existing['request'], request))
                handle = self.accepted.get(request['command_instance_id'], {}).get('handle') or self._issue(None, existing, kind='accepted_dispatch')
                slot.set(dict(replay=True))
                return handle, copy.deepcopy(existing)
            scope = dict(storage_instance_id=w.storage_id, project_id=request['project_id'], thread_id=request['thread_id'], goal_id=request['goal_id'])
            if w.is_known_scope(scope):
                self.require_unexcluded(scope)
            operation_id = short_id('op')
            frame = uid('TEST_ONLY:dispatch-frame')
            owner_identity = self.identity_envelope(request, operation_id)
            identity = self.check('producer', CANCEL + '#/$defs/NormalizedIdentity', dict(
                request_ref=uid('TEST_ONLY:request'), command_id=command_id, command_instance_id=request['command_instance_id'],
                operation_id=operation_id, owner_identity=owner_identity, payload_sha256=self.world.codec.h(request),
                idempotency_key=request['idempotency_key'], target_generation=self.target_generation, dispatch_frame_id=frame))
            nonterminal = self.check('producer', CANCEL + '#/$defs/NonterminalOutcome', self.outcome_record(
                identity, outcome='acknowledged', acknowledgement_receipt_ref=uid('TEST_ONLY:acknowledgement'), acknowledgement_frame_offset=0,
                result_receipt_ref=None, owner_result_ref=None, owner_result_schema_ref=None, owner_result_sha256=None))
            record = dict(schema_id='pm.test_only.sir_accepted_dispatch.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                          request=copy.deepcopy(request), identity=identity, nonterminal=nonterminal, dispatch_id=uid('TEST_ONLY:dispatch'),
                          command_outcome_ref=uid('TEST_ONLY:outcome'), acceptance_ref=uid('TEST_ONLY:protected-user-cancel-acceptance'),
                          source_authority_ref=self.owner_id, owner_epoch=self.owner_epoch, accepted_at=self.clock.now())
            outcome = dict(schema_id='pm.test_only.sir_command_outcome.v1', schema_version='1.0.0', record=nonterminal)
            w.write(self.physical_writes([(self.ACCEPTED, request['command_instance_id'], record, MSGPACK, None, None),
                                          (self.OUTCOME, request['command_instance_id'], outcome, MSGPACK, None, None)],
                                         method='owner.sir.accept_dispatch.v1', operation_id=operation_id))
            require('sir/acknowledgement_readback', same(w.value(self.OUTCOME, request['command_instance_id']), outcome))
            handle = self._issue(None, record, kind='accepted_dispatch', ref=identity['request_ref'])
            self.accepted[request['command_instance_id']] = dict(request=copy.deepcopy(request), handle=handle, record=copy.deepcopy(record))
            slot.set(dict(operation_id=operation_id))
            return handle, copy.deepcopy(record)

    def finish_no_effect(self, command_instance_id):
        """A genuine terminal no-effect outcome (the command was refused before any effect)."""
        w = self.world
        with self.recorder.call(self.owner_id, 'finish_no_effect'):
            accepted = self.stored(command_instance_id)
            cell = w.cell(self.OUTCOME, command_instance_id)
            require('sir/already_terminal', cell['value']['record']['outcome'] == 'acknowledged')
            result_ref = uid('TEST_ONLY:no-effect-result')
            outcome = self.check('producer', CANCEL + '#/$defs/TerminalNoEffectOutcome', self.outcome_record(
                accepted['identity'], outcome='failed', acknowledgement_receipt_ref=accepted['nonterminal']['acknowledgement_receipt_ref'],
                acknowledgement_frame_offset=0, result_receipt_ref=None, owner_result_ref=result_ref, error_ref=uid('TEST_ONLY:permission-denied'),
                owner_result_schema_ref=dict(path='Plans/goal_runtime_contracts.schema.json', json_pointer='#/$defs/GoalCancelResultV2',
                                             schema_id='pm.goal.cancel.result.v2'),
                owner_result_sha256=sha(result_ref.encode())))
            value = dict(schema_id='pm.test_only.sir_command_outcome.v1', schema_version='1.0.0', record=outcome)
            w.write(self.physical_writes([(self.OUTCOME, command_instance_id, value, MSGPACK, cell['version'], None)],
                                         method='owner.sir.terminal_no_effect.v1', operation_id=accepted['identity']['operation_id']))

    def command_keys(self, scope):
        return [k for k, c in sorted(self.world.storage.cells.get(self.ACCEPTED, {}).items())
                if all(c['value']['request'][f] == scope[f] for f in ('project_id', 'thread_id', 'goal_id'))]

    def enumerate_for_migration(self, scope):
        with self.recorder.call(self.owner_id, 'enumerate_for_migration', dict(scope=scope)) as slot:
            require('sir/database_unavailable', self.available is True)
            sources, pending, receipts = [], [], []
            for key in self.command_keys(scope):
                sources.append(self.image(self.ACCEPTED, key))
                outcome = self.image(self.OUTCOME, key)
                sources.append(outcome)
                record = msgpack_decode(bytes.fromhex(outcome['bytes_hex']))['record']
                if record['outcome'] == 'acknowledged':
                    pending.append(self.decoded(self.ACCEPTED, key)['identity']['operation_id'])
                else:
                    receipts.append(copy.deepcopy(outcome['selection']))
            mapping = dict(role='sir', sources=sources, pending_operations=sorted(pending), prior_receipts=receipts)
            slot.set(dict(sources=len(sources)))
            return self.mapping_statement(mapping)


class MigrationRegistrationOwner(O.RegistrationOwner):
    """Native dispatch registration persisted in Storage: one WriterRegistration per category plus every implementation."""

    def __init__(self, world, **kw):
        WorldOwner.__init__(self, world, **kw)

    def state_key(self):
        return 'native_dispatch:' + hx(self.world.storage_id)

    def state(self):
        value = self.world.value(DISPATCH, self.state_key())
        require('registration/state_unavailable', value is not None)
        return value

    @property
    def root_identity(self):
        return self.state()['root_identity']

    @property
    def registrations(self):
        return dict(self.state()['registrations'])

    def register_all(self, *, generation=1):
        """Register the seven categories at native dispatch (primary implementation each)."""
        w = self.world
        with self.recorder.call(self.owner_id, 'register_all', dict(generation=generation)) as slot:
            writes, state = self.registration_writes(generation)
            w.write(writes)
            slot.set(dict(count=len(state['registrations'])))
            return state['registrations']

    def registration_writes(self, generation):
        """The complete registration write set and resulting dispatch state, uncommitted (the caller's transaction commits it)."""
        w = self.world
        if True:
            existing = w.cell(DISPATCH, self.state_key())
            writes, registrations, implementations = [], {}, []
            root = uid('TEST_ONLY:native-root')
            for operation in WRITERS:
                ref = uid('TEST_ONLY:registration:' + operation)
                value = dict(schema_id='pm.test_only.native_writer_registration.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                             operation=operation, registration_ref=ref, native_handler_id=uid('TEST_ONLY:native-handler:' + operation),
                             original_owner_ref=self.owner_id, original_owner_epoch=self.owner_epoch,
                             method_contract_sha256=w.shared.execution_methods_sha256, schema_resources_sha256=w.shared.producer_bank_sha256,
                             disposition='participating', registered_at=self.clock.now())
                writes.append(w.put(self.FAMILY, ref, value))
                registrations[operation] = ref
                implementations.append(self._impl(value, 'primary', generation))
            state = dict(schema_id='pm.test_only.native_dispatch_state.v1', qualification=QUALIFICATION, root_identity=root, generation=generation,
                         registrations=registrations, implementations=implementations)
            lane_bank().validate(TOS + 'NativeDispatchState', state, 'registration/state')
            writes.append(w.put(DISPATCH, self.state_key(), state, expected=None if existing is None else existing['version']))
            return writes, state

    def _impl(self, registration, kind, generation, *, disposition=None, enrollment='enrolled'):
        return dict(descriptor=dict(operation=registration['operation'], native_handler_id=uid('TEST_ONLY:native-handler:%s:%s' % (registration['operation'], kind))
                                    if kind != 'primary' else registration['native_handler_id'],
                                    original_owner_ref=registration['original_owner_ref'], original_owner_epoch=registration['original_owner_epoch'],
                                    storage_instance_id=self.world.storage_id, storage_family_ids=['goal_execution_binding_control'],
                                    route_schema_ids=[BINDING], native_binding_generation=generation,
                                    original_registration_ref=registration['registration_ref'], disposition=disposition or registration['disposition']),
                    implementation_kind=kind, enrollment=enrollment)

    def add_implementation(self, operation, kind, *, disposition='participating', enrollment='enrolled'):
        """Another native implementation of one category (old adapter, timer, restore, owner transfer)."""
        w = self.world
        with self.recorder.call(self.owner_id, 'add_implementation', dict(operation=operation, kind=kind)):
            cell = w.cell(DISPATCH, self.state_key())
            state = copy.deepcopy(cell['value'])
            reg = w.value(self.FAMILY, state['registrations'][operation])
            state['implementations'].append(self._impl(reg, kind, state['generation'], disposition=disposition, enrollment=enrollment))
            lane_bank().validate(TOS + 'NativeDispatchState', state, 'registration/state')
            w.write([w.put(DISPATCH, self.state_key(), state, expected=cell['version'])])

    def implementations(self):
        return copy.deepcopy(self.state()['implementations'])

    def descriptors(self):
        return [i['descriptor'] for i in self.implementations() if i['enrollment'] == 'enrolled']

    def disable(self, operation):
        ref = self.registrations[operation]
        cell = self.world.cell(self.FAMILY, ref)
        self.world.write([self.world.put(self.FAMILY, ref, dict(cell['value'], disposition='disabled_at_original_dispatch'), expected=cell['version'])])
        scell = self.world.cell(DISPATCH, self.state_key())
        state = copy.deepcopy(scell['value'])
        for impl in state['implementations']:
            if impl['descriptor']['operation'] == operation:
                impl['descriptor']['disposition'] = 'disabled_at_original_dispatch'
        self.world.write([self.world.put(DISPATCH, self.state_key(), state, expected=scell['version'])])


class MigrationBindingOwner(O.BindingOwner):
    """Binding/writer-domain owner whose domain generation and SP-423 cutoff are read from Storage."""

    def __init__(self, world, **kw):
        WorldOwner.__init__(self, world, **kw)

    def head_key(self):
        return 'goal_execution_writer_domain_head.v1:' + self.storage_key()

    @property
    def domain_generation(self):
        head = self.world.value(self.HEAD, self.head_key())
        return 0 if head is None else head['record']['domain_generation']

    @domain_generation.setter
    def domain_generation(self, value):
        pass  # derived from the stored head

    @property
    def domain_withdrawn(self):
        gen = self.domain_generation
        return gen > 0 and self.world.value(CUTOFF, 'cutoff:%s:%d' % (hx(self.world.storage_id), gen)) is not None

    @domain_withdrawn.setter
    def domain_withdrawn(self, value):
        pass  # derived from the stored SP-423 cutoff record

    def require_writer(self, operation):
        sel = super().require_writer(operation)
        return sel

    def cutoff_write(self, withdrawal_id, migration_id):
        gen = self.domain_generation
        require('domain/cutoff_without_domain', gen > 0)
        value = dict(schema_id='pm.test_only.writer_domain_cutoff.v1', qualification=QUALIFICATION, storage_instance_id=self.world.storage_id,
                     domain_generation=gen, withdrawal_id=withdrawal_id, migration_id=migration_id, at=self.clock.now())
        lane_bank().validate(TOS + 'WriterDomainCutoff', value, 'domain/cutoff')
        return self.world.put(CUTOFF, 'cutoff:%s:%d' % (hx(self.world.storage_id), gen), value)


class MaintenanceOwner(WorldOwner):
    """Storage root/namespace/maintenance/restore and per-scope deletion/hold source (TEST_ONLY)."""
    role = 'storage_maintenance'

    def key(self):
        return 'maintenance:' + hx(self.world.storage_id)

    def birth(self):
        w = self.world
        value = dict(schema_id='pm.test_only.storage_maintenance_source.v1', qualification=QUALIFICATION, storage_instance_id=w.storage_id,
                     root_identity=uid('TEST_ONLY:storage-root'), namespace='pm.goal.execution_binding', restore_epoch=0, maintenance_epoch=0,
                     owner_epoch=self.owner_epoch, scopes={})
        lane_bank().validate(TOS + 'MaintenanceSource', value, 'maintenance/source')
        w.write([w.put(MAINTENANCE, self.key(), value)])

    def source(self):
        value = self.world.value(MAINTENANCE, self.key())
        require('maintenance/unavailable', value is not None)
        return value

    def _update(self, fn):
        w = self.world
        cell = w.cell(MAINTENANCE, self.key())
        value = copy.deepcopy(cell['value'])
        fn(value)
        lane_bank().validate(TOS + 'MaintenanceSource', value, 'maintenance/source')
        w.write([w.put(MAINTENANCE, self.key(), value, expected=cell['version'])])
        w.injected_keys(MAINTENANCE, self.key())

    def restore(self):
        with self.recorder.call(self.owner_id, 'restore'):
            self._update(lambda v: v.update(restore_epoch=NR.uint64(v['restore_epoch'] + 1, 'maintenance/restore_epoch')))

    def maintenance_window(self):
        with self.recorder.call(self.owner_id, 'maintenance_window'):
            self._update(lambda v: v.update(maintenance_epoch=NR.uint64(v['maintenance_epoch'] + 1, 'maintenance/epoch')))

    def request_deletion(self, scope):
        with self.recorder.call(self.owner_id, 'request_deletion'):
            self._update(lambda v: v['scopes'].setdefault(scoped_key(scope), dict(holds=[], deletion_requested=False)).update(deletion_requested=True))

    def hold(self, scope):
        with self.recorder.call(self.owner_id, 'hold'):
            self._update(lambda v: v['scopes'].setdefault(scoped_key(scope), dict(holds=[], deletion_requested=False))['holds'].append(
                uid('TEST_ONLY:legal-hold')))

    def scope_state(self, scope):
        return copy.deepcopy(self.source()['scopes'].get(scoped_key(scope), dict(holds=[], deletion_requested=False)))


# ------------------------------------------------------------------ world

OWNER_CLASSES = (('permissions', O.PermissionOwner), ('registration', MigrationRegistrationOwner), ('host_stop', LegacyHostStopOwner),
                 ('goal', LegacyGoalOwner), ('binding', MigrationBindingOwner), ('sir', LegacySIROwner), ('plans', LegacyPlanOwner),
                 ('scheduler', LegacySchedulerOwner), ('workflows', LegacyWorkflowOwner), ('maintenance', MaintenanceOwner))
ROLE_ATTR = dict(goal='goal', host_stop='host_stop', plan='plans', workflow='workflows', scheduler='scheduler', sir='sir')


class MigrationWorld(World):
    """One TEST_ONLY Storage plus the registered pre-enrollment owners; reopenable from Storage in a fresh process."""

    def __init__(self, work, *, shared=None, storage=None, roster=None, migration_cut=None, migration_cut_mode='exit'):
        self.shared = shared or Shared.get()
        self.roots, self.codec = self.shared.roots, self.shared.codec
        self.contracts = ContractsBank.get()
        self.recorder = A.MethodRecorder()
        self.registry = A.OwnerRegistry(self.recorder)
        self.storage = storage or MigrationStorage.create(work, migration_cut=migration_cut, migration_cut_mode=migration_cut_mode)
        self.storage_id = self.storage.storage_instance_id
        self.appender = A.AppendOwner(self.registry, self.storage)
        self.injected = []
        owners = (roster or {}).get('owners', {})
        constants = (roster or {}).get('constants', {})
        for name, cls in OWNER_CLASSES:
            kw = {}
            if name in owners:
                kw = dict(owner_id=owners[name]['owner_id'], owner_epoch=owners[name]['owner_epoch'])
            if name == 'sir':
                kw['constants'] = constants.get('sir')
            setattr(self, name, cls(self, **kw))
        self.plan_inventory, self.workflow_inventory, self.scheduler_inventory = self.plans, self.workflows, self.scheduler
        if roster is None:
            self.setup()

    @classmethod
    def open(cls, work, **kw):
        storage = MigrationStorage.open(work, **kw)
        roster = storage.cell(ROSTER, 'roster')
        require('world/roster_unavailable', roster is not None)
        return cls(work, storage=storage, roster=roster['value'])

    # ---- setup and roster ----------------------------------------------------------------
    def setup(self):
        writes = []
        decisions = {}
        for name, _ in OWNER_CLASSES:
            owner = getattr(self, name)
            if name in ('permissions',):
                continue
            decision_id = uid('TEST_ONLY:permission')
            value = dict(schema_id='pm.test_only.permission_decision.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                         decision_id=decision_id, actor_ref=owner.owner_id, scope={'storage_instance_id': self.storage_id},
                         action='original_write:' + name, decision='allowed', owner_epoch=self.permissions.owner_epoch,
                         decided_at=self.permissions.clock.now())
            writes.append(self.put(self.permissions.FAMILY, decision_id, value))
            decisions['write_permission:' + owner.owner_id] = decision_id
        self.write(writes)
        self._constants = decisions
        self.save_roster()
        self.maintenance.birth()
        self.registration.register_all()

    @property
    def constants(self):
        if not hasattr(self, '_constants'):
            roster = self.value(ROSTER, 'roster')
            self._constants = dict(roster['constants'].get('permissions', {})) if roster else {}
        return self._constants

    def save_roster(self):
        owners = {name: dict(owner_id=getattr(self, name).owner_id, owner_epoch=getattr(self, name).owner_epoch) for name, _ in OWNER_CLASSES}
        value = dict(schema_id='pm.test_only.world_roster.v1', qualification=QUALIFICATION, owners=owners,
                     constants=dict(sir=self.sir.constants(), permissions=self.constants, scopes=self.value(ROSTER, 'roster')['constants']['scopes']
                                    if self.value(ROSTER, 'roster') else []))
        lane_bank().validate(TOS + 'WorldRoster', value, 'world/roster')
        cell = self.cell(ROSTER, 'roster')
        self.write([self.put(ROSTER, 'roster', value, expected=None if cell is None else cell['version'])])

    def register_scope(self, scope):
        cell = self.cell(ROSTER, 'roster')
        value = copy.deepcopy(cell['value'])
        if scope not in value['constants']['scopes']:
            value['constants']['scopes'].append(copy.deepcopy(scope))
            self.write([self.put(ROSTER, 'roster', value, expected=cell['version'])])

    def known_scopes(self):
        roster = self.value(ROSTER, 'roster')
        return copy.deepcopy(roster['constants']['scopes']) if roster else []

    def is_known_scope(self, scope):
        return scope in self.known_scopes()

    def new_scope(self):
        return dict(storage_instance_id=self.storage_id, project_id=short_id('proj'), thread_id=short_id('thr'), goal_id=short_id('goal'))

    def injected_keys(self, table, key):
        self.injected.append((table, key))

    # ---- exclusion -----------------------------------------------------------------------
    def exclusion_key(self, scope):
        return 'exclusion:' + scoped_key(scope)

    def require_unexcluded(self, scope, writer):
        value = self.value(EXCLUSION, self.exclusion_key(scope))
        require('exclusion/%s/excluded' % writer, value is None or value['state'] != 'held')

    def owner_for(self, role):
        return getattr(self, ROLE_ATTR[role])


class ContractsBank:
    """contracts.schema.json (MigrationSelector/Request/Result/OwnerMapping/ManifestPart/Withdrawal) as a pinned whole bank."""
    _instance = None
    URI = 'https://puppetmaster.local/schemas/goal_own_c/1.0.0/contracts.schema.json#/$defs/'

    def __init__(self):
        self.bank = A.RootBank([dict(path='Plans/goal_own_c_contracts/contracts.schema.json')])

    @classmethod
    def get(cls):
        if cls._instance is None:
            cls._instance = ContractsBank()
        return cls._instance

    def validate(self, name, value, code=None):
        self.bank.validate(self.URI + name, value, code or ('contracts/' + name))
        exact_numbers(value, 'contracts/' + name)
        return value


def legacy_goal(world, *, codec=GOAL_JSON, control_edition='v1', objective='TEST_ONLY legacy objective 🌱 é', revisions=1, stop_history=True):
    """A pre-enrollment Goal held by its original owners: Goal body/history/control, host Stop domain, prior Stop history."""
    scope = world.new_scope()
    world.register_scope(scope)
    world.host_stop.birth_domain(scope)
    world.goal.create_legacy(scope, objective, codec=codec, control_edition=control_edition)
    for n in range(2, revisions + 1):
        world.goal.update_objective(scope, '%s r%d' % (objective, n))
    if stop_history:
        world.host_stop.manual(scope, 'stop')
        world.host_stop.manual(scope, 'resume')
    return scope


def _binding_withdraw(self):
    """SP-423 writer cutoff written as a stored record (DG-CA's in-memory flag is derived from it here)."""
    with self.recorder.call(self.owner_id, 'withdraw_writer_domain'):
        self.world.write([self.cutoff_write(uid('TEST_ONLY:withdrawal'), 'TEST_ONLY:direct-writer-cutoff')])
        self.owner_epoch = NR.uint64(self.owner_epoch + 1, 'binding/owner_epoch')


MigrationBindingOwner.withdraw = _binding_withdraw
