#!/usr/bin/env python3
"""DG-CA3 TEST_ONLY native owners for the goal.cancelled Workflow route (C3/C4).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Protocol W2 (``Plans/goal_own_c_contracts/protocol.md``), GRS-078 steps 1-12 and
the DG judge's C3 complete case. Every owner here is a TEST_ONLY executable model
registered in DG-CA's ``OwnerRegistry`` and writing through the same
``LeasedStorage`` (``pm_goal_dg_ca_assignment.assigned_world``) as the Goal
coordinator, so the late assignment and the private inspection read one Storage.

Native graph (``cancel-workflow-resources.v2.json`` realm ``native``):

* ``WriterGraphOwner``: the exhaustive native writer inventory (WriterRegistration
  originals, including the Goal and Workflow terminal publishers), the native
  boot/root principal, the run's reservation allocation and DomainBirth, issued
  *before* the run is allocated; OriginalBoundary per native operation.
* ``RunOwner`` (D01): run identity, versioned GoalRunBody/GoalRunControl
  physicals (immutable per revision, a current pointer), the D01 lineage
  update/head/origin of every transition, reservation lineage joins.
* ``StartOwner``: the original Start; ``goal_run.started`` is appended by Storage
  (sequence, times, first custody are Storage's) and the CurrentStartSource joins
  that custody.
* ``SchedulerStopOwner``: the SchedulerStop issued after the Goal's own Stop.
* ``EffectOwner``: capabilities (birth, Stop-time revocation, reopening),
  FileSafe and process invocations with their original resolutions, the inventory
  cut and the required final flush (durable/failed/unknown). Its inventory is the
  owner's complete statement.
* ``D05Owner``: safe-stop aggregation derived only from the effect owner's current
  complete inventory; a resolved aggregate issues result/origin physicals and a
  whole ``SuccessfulReadback``; anything unresolved is a typed refusal.
* ``D06Owner``: positive disposition (prepare, publish) with its own
  ``goal_run.cancelled`` Event appended by Storage, or terminal preservation with
  no Event; ``read_current`` returns the whole ``CurrentSuccessfulReadback``.

Members that no Goal-route or native-reader predicate reads are filled by the
family's schema specimen factory (``pm_goal_own_c3_w12b_roots.Roots.make``);
every selector among them resolves to a stored TEST_ONLY ancillary provenance
original that carries no semantic authority. ``verify_custody`` resolves EVERY
selector of a native value against this Storage (instance, family, key, schema
id/version and the SHA-256 of the exact stored canonical MessagePack), so a
substituted or stale stored value anywhere in the graph refuses.
"""
from __future__ import annotations

import copy
import hashlib
import json

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_dg_ca_owners import (WorldOwner, require, Refusal, uid, short_id, row_sha, same, sha, scoped_key, exact_numbers,
                                  QUALIFICATION, NATIVE_LINE, ROOT)

D06 = 'https://puppetmaster.local/proposals/workflow_cancel_positive_safestop.v1.schema.json#/$defs/'
SS = 'https://puppetmaster.local/proposals/executor_safestop_original_start_source.v1.schema.json#/$defs/'
SA = 'https://puppetmaster.local/proposals/executor_safestop_start_arguments.v1.schema.json#/$defs/'
PA = 'https://puppetmaster.local/proposals/workflow_cancel_positive_arguments.v1.schema.json#/$defs/'
NA = 'https://puppetmaster.local/proposals/goal_workflow_cancel_native_arguments.v1.schema.json#/$defs/'
WA = 'https://puppetmaster.local/proposals/workflow_activation_sources.v4.schema.json#/$defs/'
WS = 'https://puppetmaster.local/proposals/workflow_start_original_custody.v2.schema.json#/$defs/'
STARTED_PAYLOAD = 'https://puppetmaster.local/proposals/pm.goal_runtime_event.goal_run_started.schema.v3'
CANCELLED_PAYLOAD = 'file:///home/sittingmongoose/PM-Experiments/workflow-cancel-disposition-source-20260913/v2/goal_run_cancelled.v3.schema.json'
SPECIMEN_TIME = '2026-11-05T00:00:00Z'
ANCILLARY = 'TEST_ONLY:ancillary_provenance'
ANCILLARY_SCHEMA = 'pm.test_only.ancillary_provenance.v1'

SRC_KEYS = frozenset(('storage_instance_id', 'family_id', 'physical_key', 'schema_id', 'schema_version', 'physical_value_sha256'))
D05_KEYS = frozenset(('storage_instance_id', 'family_id', 'schema_id', 'schema_version', 'physical_key', 'physical_sha256', 'codec'))
PHYS_KEYS = frozenset(('family_id', 'physical_key', 'schema_id', 'schema_version', 'codec_id', 'complete_value_sha256'))
SELECTOR_SHAPES = {SRC_KEYS: 'physical_value_sha256', D05_KEYS: 'physical_sha256', PHYS_KEYS: 'complete_value_sha256'}


def shape_of(value):
    return SELECTOR_SHAPES.get(frozenset(value)) if type(value) is dict else None


def walk_selectors(value, path=''):
    """Every selector-shaped member of a value, with its JSON path."""
    if type(value) is dict:
        if shape_of(value):
            yield path, value
            return
        for key, item in value.items():
            yield from walk_selectors(item, path + '/' + key)
    elif type(value) is list:
        for index, item in enumerate(value):
            yield from walk_selectors(item, '%s/%d' % (path, index))


def k_hex(text):
    return text.encode('utf-8').hex()


# ------------------------------------------------------------------ selectors over stored cells

def stored(world, table, key, where):
    cell = world.storage.cell(table, key)
    require(where + '/unavailable', cell is not None)
    return cell


def src_sel(world, table, key):
    v = stored(world, table, key, 'native/selector')['value']
    return dict(storage_instance_id=world.storage_id, family_id=table, physical_key=key, schema_id=v['schema_id'],
                schema_version=v['schema_version'], physical_value_sha256=row_sha(v))


def d05_sel(world, table, key):
    v = stored(world, table, key, 'native/selector')['value']
    return dict(storage_instance_id=world.storage_id, family_id=table, schema_id=v['schema_id'], schema_version=v['schema_version'],
                physical_key=key, physical_sha256=row_sha(v), codec='messagepack_canonical')


def phys_sel(world, table, key):
    v = stored(world, table, key, 'native/selector')['value']
    return dict(family_id=table, physical_key=key, schema_id=v['schema_id'], schema_version=v['schema_version'],
                codec_id='pm.storage.canonical_msgpack.v1', complete_value_sha256=row_sha(v))


def origin_locator(world, table, key, operation_id):
    v = stored(world, table, key, 'native/locator')['value']
    return dict(storage_instance_id=world.storage_id, family_id=table, schema_id=v['schema_id'], schema_version=v['schema_version'],
                physical_key=key, operation_id=operation_id, codec='messagepack_canonical')


def verify_custody(world, value, where):
    """Resolve every selector in ``value`` against this Storage's exact stored bytes."""
    count = 0
    for path, sel in walk_selectors(value):
        digest_field = shape_of(sel)
        if 'storage_instance_id' in sel:
            require(where + '/selector_instance', sel['storage_instance_id'] == world.storage_id)
        cell = world.storage.cell(sel['family_id'], sel['physical_key'])
        require(where + '/selector_unavailable', cell is not None)
        current = row_sha(cell['value']) == sel[digest_field]
        retained = not current and getattr(world.storage, 'committed_version', lambda *a: False)(sel['family_id'], sel['physical_key'], sel[digest_field])
        require(where + '/selector_hash', current or retained)
        if current:
            require(where + '/selector_schema', cell['value'].get('schema_id') == sel['schema_id']
                    and cell['value'].get('schema_version') == sel['schema_version'])
        count += 1
    return count


def seed_divergence(value, seed, path=''):
    """The first seeded member the specimen did not keep exactly (None when every seed leaf survived)."""
    if type(seed) is dict:
        if type(value) is not dict:
            return path or '/'
        for k, v in seed.items():
            if k not in value:
                return path + '/' + k
            hit = seed_divergence(value[k], v, path + '/' + k)
            if hit:
                return hit
        return None
    if type(seed) is list:
        if type(value) is not list or len(value) < len(seed):
            return path or '/'
        for i, (a, b) in enumerate(zip(value, seed)):
            hit = seed_divergence(a, b, '%s/%d' % (path, i))
            if hit:
                return hit
        return None
    if seed is None:
        return None
    return None if (type(value) is type(seed) and value == seed) else (path or '/')


def overlay(base, seed):
    """Deep-merge ``seed`` over ``base``: dicts merge key by key, everything else is replaced."""
    if type(base) is dict and type(seed) is dict:
        out = dict(base)
        for k, v in seed.items():
            out[k] = overlay(base.get(k), v)
        return out
    return copy.deepcopy(seed)


def replace_filler_times(value, seed, clock):
    if type(value) is dict:
        return {k: replace_filler_times(v, seed.get(k) if type(seed) is dict else None, clock) for k, v in value.items()}
    if type(value) is list:
        return [replace_filler_times(v, seed[i] if type(seed) is list and i < len(seed) else None, clock) for i, v in enumerate(value)]
    if seed is None and value == SPECIMEN_TIME:
        return clock.now()
    return value


# ------------------------------------------------------------------ owners

class NativeOwner(WorldOwner):
    """A native TEST_ONLY owner issuing whole-root originals into Storage."""
    role = 'native'

    def make(self, ref, seed, *, realm='native'):
        """Whole root from the specimen factory under the owner's seed; filler selectors bound to ancillaries.

        A seed that already validates as the whole root is returned unchanged (no filler at all).
        """
        try:
            self.world.roots.check(realm, ref, seed)
            return exact_numbers(copy.deepcopy(seed), 'native/make')
        except Exception:  # noqa: BLE001 - incomplete seed: fill it below
            pass
        value = self.world.roots.make(realm, ref, seed)
        missing = seed_divergence(value, seed)
        require('native/seed_not_preserved' + (missing or ''), missing is None)
        value = self.bind_filler(value, seed, ref)
        value = replace_filler_times(value, seed, self.clock)
        self.world.roots.check(realm, ref, value)
        self.world.native.ancillary.flush()
        return exact_numbers(value, 'native/make')

    def composed(self, cache_key, ref, seed, *, realm='native'):
        """A composite re-read: its filler skeleton is built once by the issuing owner, current values overlay it."""
        skel = self.world.native.skeletons.get(cache_key)
        if skel is None:
            value = self.make(ref, seed, realm=realm)
            self.world.native.skeletons[cache_key] = copy.deepcopy(value)
            return value
        return self.make(ref, overlay(copy.deepcopy(skel), seed), realm=realm)

    def bind_filler(self, value, seed, path):
        if type(value) is dict:
            if seed is None and shape_of(value):
                return self.world.native.ancillary.selector(value, path, self)
            return {k: self.bind_filler(v, seed.get(k) if type(seed) is dict else None, path + '/' + k) for k, v in value.items()}
        if type(value) is list:
            return [self.bind_filler(v, seed[i] if type(seed) is list and i < len(seed) else None, '%s/%d' % (path, i))
                    for i, v in enumerate(value)]
        return value

    def store(self, table, key, value, *, expected=None):
        tx = self.world.write([self.world.put(table, key, value, expected=expected)])
        self._issue(None, value, kind=table, ref='%s|%s' % (table, key))
        return tx

    def issue(self, table, ref, seed, *, key=None, realm='native', keyed=True):
        """Issue one stored physical wrapper: specimen + seed, bound, validated, written once."""
        key = key or '%s:%s' % (table, uid('TEST_ONLY:key'))
        seed = copy.deepcopy(seed)
        if keyed:
            seed.setdefault('storage_instance_id', self.world.storage_id)
            seed.setdefault('physical_key', key)
        value = self.make(ref, seed, realm=realm)
        require('native/issue_absent', self.world.cell(table, key) is None)
        tx = self.store(table, key, value)
        return key, value, tx


class AncillaryOwner(NativeOwner):
    """TEST_ONLY ancillary provenance: stored originals behind filler selectors, no semantic authority."""
    role = 'ancillary_provenance'

    def __init__(self, world, **kw):
        super().__init__(world, **kw)
        self.memo = {}
        self.pending = []

    def selector(self, specimen_sel, path, requester):
        """One stored ancillary per (requesting owner, schema position, shape), issued once and reused."""
        digest_field = shape_of(specimen_sel)
        memo_key = (requester.role, path, digest_field, specimen_sel['family_id'], specimen_sel['schema_id'])
        if memo_key not in self.memo:
            free = specimen_sel['schema_id'] in ('x', '') and specimen_sel['family_id'] in ('x', '')
            table = ANCILLARY if free else specimen_sel['family_id']
            value = dict(schema_id=ANCILLARY_SCHEMA if free else specimen_sel['schema_id'],
                         schema_version='1.0.0' if free else specimen_sel['schema_version'], qualification=QUALIFICATION,
                         kind='ancillary_provenance', semantic_authority='none', requested_by=requester.owner_id,
                         schema_path=path[-300:], issued_at=self.clock.now())
            key = '%s:%s' % (table, uid('TEST_ONLY:ancillary'))
            self.memo[memo_key] = (table, key, value)
            self.pending.append(self.world.put(table, key, value))
            self.world.native.ancillary_count += 1
        table, key, value = self.memo[memo_key]
        h = row_sha(value)
        if digest_field == 'physical_value_sha256':
            return dict(storage_instance_id=self.world.storage_id, family_id=table, physical_key=key, schema_id=value['schema_id'],
                        schema_version=value['schema_version'], physical_value_sha256=h)
        if digest_field == 'physical_sha256':
            return dict(storage_instance_id=self.world.storage_id, family_id=table, schema_id=value['schema_id'],
                        schema_version=value['schema_version'], physical_key=key, physical_sha256=h, codec='messagepack_canonical')
        return dict(family_id=table, physical_key=key, schema_id=value['schema_id'], schema_version=value['schema_version'],
                    codec_id='pm.storage.canonical_msgpack.v1', complete_value_sha256=h)

    def flush(self):
        """All ancillaries of one issuance land in one Storage transaction."""
        if self.pending:
            writes, self.pending = self.pending, []
            self.world.write(writes)


class WriterGraphOwner(NativeOwner):
    """Exhaustive native writer inventory, principal, run reservation allocation and DomainBirth."""
    role = 'native_writer_graph'
    KINDS = ('workflow_activation', 'workflow_lineage', 'executor_materialization', 'attempt_owner', 'scheduler', 'goal_stop',
             'executor_cancel', 'filesafe_restore', 'disposable_process_supervisor', 'event_normalizer', 'seglog_append',
             'checkpoint_owner', 'native_launch_allocator', 'native_compile', 'executor_intake', 'models_resolver',
             'executor_provision', 'activation_decision')
    # The run's domain registers the writer categories the cancellation route needs (a whole DomainBirth
    # with all eighteen inline registrations measures over the 16 KiB stored-part cap).
    DOMAIN = ('goal_stop', 'executor_cancel', 'scheduler', 'filesafe_restore', 'disposable_process_supervisor', 'event_normalizer',
              'seglog_append', 'workflow_lineage')

    def __init__(self, world, **kw):
        super().__init__(world, **kw)
        self.native_root = uid('TEST_ONLY:native-root')
        self.host = uid('TEST_ONLY:execution-host')
        self.boot = world.storage.boot_session
        self.registrations = {}
        self.enrolled = False
        self.contract_uri = 'Plans/goal_workflow_cancel_contracts/methods.json'
        self.contract_sha256 = sha((ROOT / self.contract_uri).read_bytes())

    def principal(self, owner):
        return dict(owner_ref=owner.owner_id, owner_epoch=owner.owner_epoch, native_root_ref=self.native_root,
                    native_root_generation=1, execution_host_ref=self.host, native_host_boot_ref=self.boot)

    def boundary(self, owner, operation_id):
        """OriginalBoundary of one native operation: issued and kept by this owner."""
        value = dict(principal=self.principal(owner), operation_id=operation_id, transaction_id=uid('TEST_ONLY:native-tx'),
                     native_operation_handle_ref=uid('TEST_ONLY:native-op-handle'), native_writer_lease_ref=uid('TEST_ONLY:writer-lease'),
                     native_capability_fence_ref=uid('TEST_ONLY:capability-fence'), observed_at_utc=self.clock.now())
        self.world.roots.check('native', SS + 'OriginalBoundary', value)
        self._issue(None, value, kind='original_boundary', ref='boundary|' + operation_id + '|' + value['transaction_id'])
        return value

    def origin(self, run_scope, operation_id, write_kind, issued, sequence=1, previous=None):
        """A stored D05-family Origin (executor_safestop_origin v2) for ``issued`` selectors."""
        record = self.make(SS + 'Origin', dict(scope=run_scope, operation_id=operation_id, transaction_id=uid('TEST_ONLY:native-tx'),
                                              sequence=sequence, previous_origin=previous, native_boundary=self.boundary(self, operation_id),
                                              write_kind=write_kind, issued_records=issued))
        key, value, _ = self.issue('executor_safestop_origin', SS + 'OriginPhysical', dict(value=record))
        return key, value

    def enroll(self, run_scope):
        """Register every writer category before the run is allocated (GRS-078)."""
        with self.recorder.call(self.owner_id, 'enroll_writers', dict(run=run_scope['goal_run_id'])) as slot:
            require('writers/already_enrolled', not self.enrolled)
            for kind in self.KINDS:
                reg_op = uid('TEST_ONLY:writer-registration-op')
                reg_key = 'executor_safestop_origin:' + uid('TEST_ONLY:registration-origin')
                writer = dict(writer_id=uid('TEST_ONLY:writer:' + kind), principal=self.principal(self), component_kind=kind,
                              source_contract_uri=self.contract_uri, source_contract_sha256=self.contract_sha256,
                              native_original_registration_operation_id=reg_op, native_entrypoint_ref=uid('TEST_ONLY:entrypoint:' + kind),
                              native_pre_effect_gate_ref=uid('TEST_ONLY:pre-effect-gate:' + kind), native_parent_registration_ref=None,
                              first_registered_epoch=self.owner_epoch)
                self.registrations[kind] = writer
            # each registration is its own stored original; the inventory statement joins them by hash
            rows = []
            for kind in self.KINDS:
                rkey = 'TEST_ONLY:native_writer_registration:' + self.registrations[kind]['writer_id']
                self.store('TEST_ONLY:native_writer_registration', rkey, dict(
                    schema_id='pm.test_only.native_writer_registration_record.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                    registration=copy.deepcopy(self.registrations[kind])))
                rows.append(dict(component_kind=kind, writer_id=self.registrations[kind]['writer_id'], key=rkey,
                                 sha256=row_sha(self.world.value('TEST_ONLY:native_writer_registration', rkey))))
            inventory_key = 'TEST_ONLY:native_writer_inventory:' + self.native_root
            self.store('TEST_ONLY:native_writer_inventory', inventory_key, dict(
                schema_id='pm.test_only.native_writer_inventory.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                native_root_ref=self.native_root, complete=True, owner_epoch=self.owner_epoch, writers=rows, stated_at=self.clock.now()))
            okey, _ = self.origin(run_scope, uid('TEST_ONLY:writer-registration'), 'writer_registration',
                                  [d05_sel(self.world, 'TEST_ONLY:native_writer_inventory', inventory_key)])
            for kind in self.KINDS:
                self.registrations[kind]['original_registration_origin'] = origin_locator(
                    self.world, 'executor_safestop_origin', okey, self.registrations[kind]['native_original_registration_operation_id'])
                self.world.roots.check('native', SS + 'WriterRegistration', self.registrations[kind])
            self.registration_origin_key = okey
            self.inventory_key = inventory_key
            self.enrolled = True
            slot.set(dict(writers=len(self.KINDS)))

    def inventory(self):
        """The owner's exhaustive current writer inventory: every row resolved by its stored hash."""
        value = self.world.value('TEST_ONLY:native_writer_inventory', self.inventory_key)
        require('writers/inventory_unavailable', value is not None and value['complete'] is True)
        out = {}
        for row in value['writers']:
            rec = self.world.value('TEST_ONLY:native_writer_registration', row['key'])
            require('writers/registration_unavailable', rec is not None and row_sha(rec) == row['sha256'])
            reg = copy.deepcopy(rec['registration'])
            reg['original_registration_origin'] = origin_locator(self.world, 'executor_safestop_origin', self.registration_origin_key,
                                                                 reg['native_original_registration_operation_id'])
            out[row['component_kind']] = reg
        return out

    def goal_terminal_writer(self):
        return copy.deepcopy(self.registrations['goal_stop'])

    def workflow_terminal_writer(self):
        return copy.deepcopy(self.registrations['executor_cancel'])

    def disable(self, kind):
        """A genuine change in the exhaustive inventory: one writer withdrawn at original dispatch."""
        with self.recorder.call(self.owner_id, 'disable_writer', dict(kind=kind)):
            cell = self.world.cell('TEST_ONLY:native_writer_inventory', self.inventory_key)
            value = copy.deepcopy(cell['value'])
            value['writers'] = [w for w in value['writers'] if w['component_kind'] != kind]
            value['stated_at'] = self.clock.now()
            self.world.write([self.world.put('TEST_ONLY:native_writer_inventory', self.inventory_key, value, expected=cell['version'])])


WO = 'https://puppetmaster.local/proposals/executor_workflow_original_start.v2.schema.json#/$defs/'
NONTERMINAL = ('ready', 'running', 'provisional_success', 'verifying', 'failed_verification', 'repairing', 'blocked', 'stopped')
TERMINAL = ('certified', 'failed', 'cancelled')


def record_sha(record):
    return sha(S.canonical(record, 'native/record'))


class RunOwner(NativeOwner):
    """D01 native run owner: allocation, versioned body/control physicals, lineage, current pointer."""
    role = 'native_run'
    BODY, CONTROL, POINTER = 'workflow_goal_run_body', 'workflow_goal_run_control', 'TEST_ONLY:workflow_goal_run_current'

    def __init__(self, world, **kw):
        super().__init__(world, **kw)
        self.runs = {}

    def reserve_identity(self, goal_scope):
        """Launch identity reservation: the run id exists before writers enroll and before allocation."""
        with self.recorder.call(self.owner_id, 'reserve_run_identity'):
            run_id = short_id('run')
            return dict(storage_instance_id=self.world.storage_id, project_id=goal_scope['project_id'], goal_id=goal_scope['goal_id'],
                        goal_run_id=run_id)

    def allocate(self, rs, goal_scope, execution_owner_ref, execution_owner_epoch):
        """Reservation allocation, then DomainBirth: only after the writer graph is enrolled."""
        w, n = self.world, self.world.native
        with self.recorder.call(self.owner_id, 'allocate_run') as slot:
            require('run/writers_unenrolled', n.writers.enrolled)
            run_id = rs['goal_run_id']
            compile_run = short_id('compile')
            principal = n.writers.principal(self)
            alloc_op = uid('TEST_ONLY:allocation-op')
            identity = dict(storage_instance_id=w.storage_id, project_id=rs['project_id'], goal_id=rs['goal_id'], plan_compile_run_id=compile_run,
                            native_allocation_operation_id=alloc_op, native_idempotency_key=uid('TEST_ONLY:allocation-key'),
                            native_allocator=principal)
            goal_ctl = w.goal.keys(goal_scope)['control']
            alloc = self.make(SS + 'ReservationAllocation', dict(scope=rs, identity=identity, native_boundary=n.writers.boundary(self, alloc_op),
                              original_goal_control_source=src_sel(w, w.goal.CONTROL, goal_ctl),
                              original_stop_source=src_sel(w, w.host_stop.FAMILY, w.host_stop.key(goal_scope)),
                              allocated_at_utc=self.clock.now()))
            akey, _, _ = self.issue('executor_safestop_reservation_allocation', SS + 'ReservationAllocationPhysical', dict(value=alloc))
            asel = d05_sel(w, 'executor_safestop_reservation_allocation', akey)
            okey, origin = n.writers.origin(rs, alloc_op, 'reservation_allocation', [asel])
            birth_op = uid('TEST_ONLY:domain-birth-op')
            writers = n.writers.inventory()
            birth = self.make(SS + 'DomainBirth', dict(scope=rs, operation_id=birth_op, native_boundary=n.writers.boundary(self, birth_op),
                              registered_writers=[writers[k] for k in WriterGraphOwner.DOMAIN], reservation_allocation=asel,
                              native_allocation_identity=identity, born_at_utc=self.clock.now()))
            bkey, _, _ = self.issue('executor_safestop_domain_birth', SS + 'DomainBirthPhysical', dict(value=birth))
            cjoin = self.make(SS + 'CompileReservationJoin', dict(scope=rs, allocation=asel, operation_id=uid('TEST_ONLY:compile-join-op')))
            ckey, _, _ = self.issue('executor_safestop_compile_reservation_join', SS + 'CompileReservationJoinPhysical', dict(value=cjoin))
            csel = d05_sel(w, 'executor_safestop_compile_reservation_join', ckey)
            cokey, corigin = n.writers.origin(rs, cjoin['operation_id'], 'compile_reservation_join', [csel])
            wjoin = self.make(SS + 'WorkflowReservationJoin', dict(scope=rs, allocation=asel, compile_join=csel, operation_id=uid('TEST_ONLY:workflow-join-op')))
            wkey, _, _ = self.issue('executor_safestop_workflow_reservation_join', SS + 'WorkflowReservationJoinPhysical', dict(value=wjoin))
            wsel = d05_sel(w, 'executor_safestop_workflow_reservation_join', wkey)
            wokey, worigin = n.writers.origin(rs, wjoin['operation_id'], 'workflow_reservation_join', [wsel])
            lineage = self.make(SS + 'ReservationLineage', dict(
                allocation=dict(allocation=alloc, allocation_source=asel, allocation_origin=origin['value'],
                                allocation_origin_source=d05_sel(w, 'executor_safestop_origin', okey), native_current_allocator=principal,
                                native_original_allocation_operation_ref=alloc_op, current_boundary=n.writers.boundary(self, alloc_op)),
                compile_join=cjoin, compile_join_source=csel, compile_join_origin=corigin['value'],
                compile_join_origin_source=d05_sel(w, 'executor_safestop_origin', cokey),
                workflow_join=wjoin, workflow_join_source=wsel, workflow_join_origin=worigin['value'],
                workflow_join_origin_source=d05_sel(w, 'executor_safestop_origin', wokey)))
            perm_key = 'permission_snapshot_record:' + uid('TEST_ONLY:permission-snapshot')
            perm = self.make('https://puppetmaster.local/schemas/storage_value/permission_snapshot_record/1.0.0/permission_snapshot_record.schema.json',
                             dict(project_id=rs['project_id'], run_id=rs['goal_run_id'], snapshot_id=uid('TEST_ONLY:permission-snapshot-id'),
                                  captured_at_utc=self.clock.now(), resolved_permissions={'workflow.cancel': None}))
            self.store('permission_snapshot_record', perm_key, perm)
            run = dict(run_scope=rs, compile_run=compile_run, permission_key=perm_key, execution_owner_ref=execution_owner_ref, execution_owner_epoch=execution_owner_epoch,
                       allocation_key=akey, birth_key=bkey, lineage=lineage, revision=0, workgraph_id=short_id('workgraph'))
            self.runs[run_id] = run
            slot.set(dict(run=run_id))
            return run

    def identity(self, run):
        rs = run['run_scope']
        return dict(project_id=rs['project_id'], goal_id=rs['goal_id'], goal_run_id=rs['goal_run_id'], plan_compile_run_id=run['compile_run'],
                    workgraph_id=run['workgraph_id'], workgraph_revision=1, workgraph_ref='TEST_ONLY:workgraph:' + run['workgraph_id'],
                    workgraph_sha256=sha(run['workgraph_id'].encode()))

    def keys(self, run, revision):
        return ('run:%s:revision:%d' % (k_hex(run['run_scope']['goal_run_id']), revision),
                'run:%s:control:%d' % (k_hex(run['run_scope']['goal_run_id']), revision))

    def body_values(self, run, revision, status, goal_scope):
        w = self.world
        bkey, ckey = self.keys(run, revision)
        body = self.make(WA + 'GoalRunBodyPhysical', dict(storage_instance_id=w.storage_id, physical_key=bkey, record=dict(
            identity=self.identity(run), revision=revision, status=status,
            original_goal_body=src_sel(w, w.goal.BODY, w.goal.keys(goal_scope)['body']),
            execution_owner_ref=run['execution_owner_ref'], execution_owner_epoch=run['execution_owner_epoch'])))
        control = self.make(WA + 'GoalRunControlPhysical', dict(storage_instance_id=w.storage_id, physical_key=ckey, record=dict(
            identity=self.identity(run), revision=revision, body_record_sha256=record_sha(body['record']),
            execution_owner_epoch=run['execution_owner_epoch'], pending_operation_id=None)))
        return bkey, body, ckey, control

    def pointer_writes(self, run, revision, bkey, ckey):
        w = self.world
        pkey = 'run:' + k_hex(run['run_scope']['goal_run_id'])
        cell = w.cell(self.POINTER, pkey)
        value = dict(schema_id='pm.test_only.workflow_goal_run_current.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                     run_scope=run['run_scope'], revision=revision, body_key=bkey, control_key=ckey)
        return [w.put(self.POINTER, pkey, value, expected=None if cell is None else cell['version'])]

    def transition(self, run, status, goal_scope):
        """A genuine earlier native run transition (e.g. certified/failed) at revision+1."""
        with self.recorder.call(self.owner_id, 'transition_run', dict(status=status)):
            revision = NR.uint64(run['revision'] + 1, 'run/revision')
            bkey, body, ckey, control = self.body_values(run, revision, status, goal_scope)
            self.world.write([self.world.put(self.BODY, bkey, body), self.world.put(self.CONTROL, ckey, control)] +
                             self.pointer_writes(run, revision, bkey, ckey))
            run['revision'] = revision

    def current(self, run):
        """Current native body/control: the pointer's versioned physicals, hash-joined."""
        w = self.world
        pointer = w.value(self.POINTER, 'run:' + k_hex(run['run_scope']['goal_run_id']))
        require('run/pointer_unavailable', pointer is not None)
        body = w.value(self.BODY, pointer['body_key'])
        control = w.value(self.CONTROL, pointer['control_key'])
        require('run/body_unavailable', body is not None and control is not None)
        require('run/body_join', control['record']['body_record_sha256'] == record_sha(body['record'])
                and body['record']['revision'] == pointer['revision'] == control['record']['revision'])
        require('run/owner_epoch', body['record']['execution_owner_epoch'] == run['execution_owner_epoch'])
        return pointer, body, control


class StartOwner(NativeOwner):
    """Original Workflow Start: goal_run.started appended by Storage, then the Start custody."""
    role = 'native_start'

    def start(self, run, goal_scope, actor_ref):
        w, n = self.world, self.world.native
        with self.recorder.call(self.owner_id, 'commit_start', dict(run=run['run_scope']['goal_run_id'])) as slot:
            require('start/already_started', 'start' not in run)
            rs = run['run_scope']
            op = uid('TEST_ONLY:start-op')
            revision = NR.uint64(run['revision'] + 1, 'start/revision')
            bkey, body, ckey, control = n.run.body_values(run, revision, 'running', goal_scope)
            payload = self.make(STARTED_PAYLOAD, dict(project_id=rs['project_id'], goal_id=rs['goal_id'], actor_ref=actor_ref,
                                occurred_at_utc=self.clock.now(), payload=dict(goal_run_id=rs['goal_run_id'])))
            candidate = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project', event_id=uid('TEST_ONLY:goal_run.started'),
                             event_type='goal_run.started', project_id=rs['project_id'], thread_id=goal_scope['thread_id'], run_id=rs['goal_run_id'],
                             node_id=None, attempt_id=None, actor_ref=actor_ref, requested_account_ref=None, effective_account_ref=None,
                             occurred_at_utc=payload['occurred_at_utc'], producer_sequence_id=None, correlation_id=uid('TEST_ONLY:start-correlation'),
                             causation_event_id=None, parent_event_id=None, idempotency_key=uid('TEST_ONLY:start-key'),
                             payload_schema_id='pm.goal_runtime_event.goal_run_started.schema.v3', payload=payload, payload_ref=None,
                             redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
                             migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None, compatibility_event_type=None))
            events, _, _ = w.appender.append_original(op, dict(kind='TEST_ONLY:goal_run.started', op=op), [candidate], durability_class='barrier')
            event = w.appender.event(events[0])
            custody = w.storage.first_custody(event['event_id'])
            tx = w.write([w.put(n.run.BODY, bkey, body), w.put(n.run.CONTROL, ckey, control)] + n.run.pointer_writes(run, revision, bkey, ckey))
            commit_seed = dict(record=dict(scope=rs, operation_id=op, transaction_id=tx['tx_id'], event_id=event['event_id'],
                                           event_value_commitment=custody['original_event_value_commitment'],
                                           first_append_receipt=custody['first_append_receipt'],
                                           producer_semantic_digest=custody['producer_semantic_digest'],
                                           after_body=src_sel(w, n.run.BODY, bkey), after_control=src_sel(w, n.run.CONTROL, ckey)))
            ckey2, commit, _ = self.issue('workflow_start_commit', WS + 'StorageCommit', commit_seed)
            control_seed = dict(record=dict(scope=rs, epoch=1, original_operation_id=op))
            skey, start_control, _ = self.issue('workflow_start_control', WS + 'StorageControl', control_seed)
            okey, origin, _ = self.issue('workflow_start_origin', WS + 'StorageOrigin', dict(record=dict(
                scope=rs, operation_id=op, transaction_id=tx['tx_id'], commit=src_sel(w, 'workflow_start_commit', ckey2),
                native_body=src_sel(w, n.run.BODY, bkey), native_control=src_sel(w, n.run.CONTROL, ckey),
                start_control=src_sel(w, 'workflow_start_control', skey),
                original_event_value_commitment=custody['original_event_value_commitment'],
                first_append_receipt=custody['first_append_receipt'])))
            run.update(revision=revision, start=dict(operation_id=op, event_id=event['event_id'], commit_key=ckey2, control_key=skey, origin_key=okey))
            slot.set(dict(event_id=event['event_id'], sequence_id=event['sequence_id']))
            return event

    def current_start(self, run):
        """CurrentStartArgument (original_started): re-read from Storage custody at each call."""
        w, n = self.world, self.world.native
        st = run.get('start')
        require('start/not_started', st is not None)
        commit = w.value('workflow_start_commit', st['commit_key'])
        control = w.value('workflow_start_control', st['control_key'])
        origin = w.value('workflow_start_origin', st['origin_key'])
        require('start/custody_unavailable', commit is not None and control is not None and origin is not None)
        custody = w.storage.first_custody(st['event_id'])
        require('start/first_custody', custody is not None and same(custody['first_append_receipt'], commit['record']['first_append_receipt'])
                and same(custody['original_event_value_commitment'], commit['record']['event_value_commitment']))
        require('start/origin_join', origin['record']['commit']['physical_value_sha256'] == row_sha(commit))
        if not hasattr(self, '_ioc'):
            self._ioc = {}
        rid = run['run_scope']['goal_run_id']
        if rid not in self._ioc:
            self._ioc[rid] = self.make(WS + 'CurrentStartSource', dict(d01_current=dict(scope=run['run_scope']), control=control, commit=commit,
                                                                   origin=origin))['initial_control_origin']
            self._d01 = getattr(self, '_d01', {})
            self._d01[rid] = self.make(WS + 'CurrentStartSource', dict(d01_current=dict(scope=run['run_scope']), control=control, commit=commit,
                                                                   origin=origin, initial_control_origin=self._ioc[rid]))['d01_current']
        value = self.composed(('current_start', rid), SA + 'CurrentStartArgument', dict(kind='original_started', value=dict(
            d01_current=self._d01[rid], control=control, initial_control_origin=self._ioc[rid], commit=commit, origin=origin)))
        return value


class SchedulerStopOwner(NativeOwner):
    """SchedulerStop for the run, issued only after the Goal's own latched Stop."""
    role = 'native_scheduler_stop'
    TABLE = 'TEST_ONLY:workflow_scheduler_stop'

    def stop(self, run, goal_scope):
        w = self.world
        with self.recorder.call(self.owner_id, 'scheduler_stop', dict(run=run['run_scope']['goal_run_id'])) as slot:
            stop = w.host_stop.record(goal_scope)
            require('scheduler_stop/goal_not_latched', stop['latched'] is True)
            source = self.make(WO + 'StopSource', dict(scope=run['run_scope']))
            key = 'scheduler_stop:' + k_hex(run['run_scope']['goal_run_id'])
            value = dict(schema_id='pm.test_only.workflow_scheduler_stop.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                         run_scope=run['run_scope'], goal_user_stop_epoch=stop['user_stop_epoch'],
                         goal_stop_receipt_sha256=stop['last_original_stop_receipt_sha256'], source=source, stopped_at=self.clock.now())
            self.store(self.TABLE, key, value)
            run['scheduler_stop_key'] = key
            slot.set(dict(key=key))
            return key


class EffectOwner(NativeOwner):
    """Capabilities, FileSafe/process invocations, inventory cut and required final flush of one run."""
    role = 'native_effects'
    CAP, INV, FLUSH, CUT, STATEMENT = ('TEST_ONLY:native_capability', 'TEST_ONLY:native_effect_invocation', 'TEST_ONLY:native_final_flush',
                                       'TEST_ONLY:native_inventory_cut', 'TEST_ONLY:native_effect_inventory')

    def __init__(self, world, **kw):
        super().__init__(world, **kw)
        self.members = {}

    def _put(self, table, key, value, expected=None):
        self.world.write([self.world.put(table, key, value, expected=expected)])

    def birth(self, run, *, capabilities=('workflow_mutation', 'process_spawn', 'filesafe_mutation'), filesafe=1, processes=1):
        """Genuine run effects before Stop: capability births and in-flight invocations."""
        with self.recorder.call(self.owner_id, 'birth_effects') as slot:
            rid = run['run_scope']['goal_run_id']
            members = self.members.setdefault(rid, dict(capabilities=[], invocations=[], flush=None))
            for kind in capabilities:
                cid = uid('TEST_ONLY:capability:' + kind)
                key = 'cap:%s:%s' % (k_hex(rid), k_hex(cid))
                self._put(self.CAP, key, dict(schema_id='pm.test_only.native_capability.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                                              run_scope=run['run_scope'], capability_id=cid, kind=kind, revision=1, disposition='active',
                                              born_at=self.clock.now()))
                members['capabilities'].append(key)
            for kind, count in (('filesafe', filesafe), ('process', processes)):
                for _ in range(count):
                    iid = uid('TEST_ONLY:invocation:' + kind)
                    key = 'inv:%s:%s' % (k_hex(rid), k_hex(iid))
                    self._put(self.INV, key, dict(schema_id='pm.test_only.native_effect_invocation.v1', schema_version='1.0.0',
                                                  qualification=QUALIFICATION, run_scope=run['run_scope'], invocation_id=iid, kind=kind,
                                                  status='in_flight', resolution=None, started_at=self.clock.now()))
                    members['invocations'].append(key)
            slot.set(dict(capabilities=len(members['capabilities']), invocations=len(members['invocations'])))

    def drain(self, run, *, outcome=None):
        """Stop-time drain by each owner: revoke capabilities, resolve invocations, final flush.

        ``outcome`` maps an invocation index to 'unknown'/'failed', or names 'flush_failed',
        'flush_unknown', 'reopen' (a capability reopened after revocation): genuine owner states.
        """
        outcome = outcome or {}
        w = self.world
        with self.recorder.call(self.owner_id, 'drain_effects', dict(outcome=sorted(map(str, outcome)))) as slot:
            rid = run['run_scope']['goal_run_id']
            members = self.members[rid]
            for key in members['capabilities']:
                cell = w.cell(self.CAP, key)
                self._put(self.CAP, key, dict(cell['value'], revision=NR.uint64(cell['value']['revision'] + 1, 'cap/revision'),
                                              disposition='revoked', revoked_at=self.clock.now()), expected=cell['version'])
            for index, key in enumerate(members['invocations']):
                cell = w.cell(self.INV, key)
                status = outcome.get(index, 'resolved')
                resolution = None
                if status == 'resolved':
                    rkey = 'resolution:' + key
                    kind = cell['value']['kind']
                    self._put(self.INV + '_resolution', rkey, dict(
                        schema_id='pm.test_only.native_effect_resolution.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                        invocation_key=key, kind='filesafe_original_resolution' if kind == 'filesafe' else 'process_original_shutdown',
                        restored_to_safe_point=kind == 'filesafe', terminated=kind == 'process', resolved_at=self.clock.now()))
                    resolution = rkey
                self._put(self.INV, key, dict(cell['value'], status=status, resolution=resolution), expected=cell['version'])
            if outcome.get('reopen'):
                key = members['capabilities'][0]
                cell = w.cell(self.CAP, key)
                self._put(self.CAP, key, dict(cell['value'], revision=NR.uint64(cell['value']['revision'] + 1, 'cap/revision'),
                                              disposition='active', reopened_at=self.clock.now()), expected=cell['version'])
            flush_status = ('original_required_flush_failed' if outcome.get('flush_failed') else
                            'unknown' if outcome.get('flush_unknown') else 'original_required_flush_durable')
            fkey = 'flush:' + k_hex(rid)
            self._put(self.FLUSH, fkey, dict(schema_id='pm.test_only.native_final_flush.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                                             run_scope=run['run_scope'], status=flush_status, completed_at=self.clock.now()),
                      expected=None if w.cell(self.FLUSH, fkey) is None else w.cell(self.FLUSH, fkey)['version'])
            members['flush'] = fkey
            ckey = 'cut:' + k_hex(rid)
            self._put(self.CUT, ckey, dict(schema_id='pm.test_only.native_inventory_cut.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                                           run_scope=run['run_scope'], capabilities=list(members['capabilities']),
                                           invocations=list(members['invocations']), cut_at=self.clock.now()),
                      expected=None if w.cell(self.CUT, ckey) is None else w.cell(self.CUT, ckey)['version'])
            members['cut'] = ckey
            slot.set(dict(flush=flush_status))

    def add_foreign(self, run, other_run_scope):
        """A genuine invocation of ANOTHER run that this owner wrongly lists under the run (foreign effect)."""
        rid = run['run_scope']['goal_run_id']
        iid = uid('TEST_ONLY:invocation:foreign')
        key = 'inv:%s:%s' % (k_hex(rid), k_hex(iid))
        self._put(self.INV, key, dict(schema_id='pm.test_only.native_effect_invocation.v1', schema_version='1.0.0', qualification=QUALIFICATION,
                                      run_scope=other_run_scope, invocation_id=iid, kind='filesafe', status='in_flight', resolution=None,
                                      started_at=self.clock.now()))
        self.members[rid]['invocations'].append(key)

    def inventory(self, run):
        """The owner's complete statement: every member re-read from Storage."""
        w = self.world
        rid = run['run_scope']['goal_run_id']
        members = self.members.get(rid)
        require('effects/inventory_unavailable', members is not None)
        caps = [w.value(self.CAP, k) for k in members['capabilities']]
        invs = [w.value(self.INV, k) for k in members['invocations']]
        require('effects/member_unavailable', all(v is not None for v in caps + invs))
        flush = w.value(self.FLUSH, members['flush']) if members.get('flush') else None
        return dict(complete=True, run_scope=copy.deepcopy(run['run_scope']), capabilities=caps, invocations=invs, flush=flush,
                    cut_key=members.get('cut'), capability_keys=list(members['capabilities']), invocation_keys=list(members['invocations']))


class D05Owner(NativeOwner):
    """EP-119 bounded safe-stop aggregation, derived only from the effect owner's current complete inventory."""
    role = 'native_d05'
    RESULT, ORIGIN, FLUSH = 'executor_safestop_result', 'executor_safestop_origin', 'executor_safestop_final_flush'

    def goal_stop_sources(self, goal_scope):
        """The Goal's own original Stop intent/receipt and source audit, read from Storage custody."""
        w = self.world
        stop = w.host_stop.record(goal_scope)
        require('d05/goal_stop_not_latched', stop['latched'] is True and stop['last_original_stop_receipt_ref'] is not None)
        rkey = stop['last_original_stop_receipt_ref']
        receipt = w.value('goal_cancel_stop_receipt', rkey)
        require('d05/goal_stop_receipt', receipt is not None and row_sha(receipt) == stop['last_original_stop_receipt_sha256'])
        op = receipt['record']['operation_id']
        base = scoped_key(goal_scope) + ':' + op.encode().hex()
        source_key = 'goal_cancel_source_audit:' + base
        progress = w.value('goal_cancel_progress', 'goal_cancel_progress:' + base + ':epoch:1')
        require('d05/goal_stop_progress', progress is not None and progress['record']['stop_receipt'] == receipt['record'])
        intent = progress['record']['stop_intent']
        require('d05/goal_stop_intent', sha(b'pm.goal.cancel.stop_intent.v1\n' + w.codec.raw(intent)) == receipt['record']['stop_intent_sha256'])
        source = w.value('goal_cancel_source_audit', source_key)
        require('d05/goal_source_audit', source is not None and row_sha(source) == receipt['record']['source_audit_sha256'])
        return dict(original_stop_intent=copy.deepcopy(intent), original_stop_receipt=copy.deepcopy(receipt['record']),
                    original_stop_receipt_selection=src_sel(w, 'goal_cancel_stop_receipt', rkey),
                    original_source_audit_selection=src_sel(w, 'goal_cancel_source_audit', source_key)), rkey

    def assess(self, run, inventory):
        codes = []
        rs = run['run_scope']
        for cap in inventory['capabilities']:
            if cap['disposition'] != 'revoked':
                codes.append('d05/capability_reopened' if cap.get('reopened_at') else 'd05/capability_active')
        for inv in inventory['invocations']:
            if inv['run_scope'] != rs:
                codes.append('d05/effect_foreign')
            elif inv['status'] == 'unknown':
                codes.append('d05/effect_unknown')
            elif inv['status'] == 'failed':
                codes.append('d05/effect_failed')
            elif inv['status'] != 'resolved' or inv['resolution'] is None:
                codes.append('d05/effect_unresolved')
            elif self.world.value(EffectOwner.INV + '_resolution', inv['resolution']) is None:
                codes.append('d05/effect_missing')
        flush = inventory['flush']
        if flush is None:
            codes.append('d05/flush_missing')
        elif flush['status'] == 'original_required_flush_failed':
            codes.append('d05/flush_failed')
        elif flush['status'] != 'original_required_flush_durable':
            codes.append('d05/flush_unknown')
        return codes

    def aggregate(self, run, goal_scope):
        """Issue the original aggregate result/origin (resolved or not) after the Goal Stop and SchedulerStop."""
        w, n = self.world, self.world.native
        with self.recorder.call(self.owner_id, 'aggregate', dict(run=run['run_scope']['goal_run_id'])) as slot:
            require('d05/already_aggregated', 'd05' not in run)
            gss, rkey = self.goal_stop_sources(goal_scope)
            require('d05/scheduler_stop', run.get('scheduler_stop_key') is not None
                    and w.value(SchedulerStopOwner.TABLE, run['scheduler_stop_key'])['goal_stop_receipt_sha256']
                    == row_sha(w.value('goal_cancel_stop_receipt', rkey)))
            inventory = n.effects.inventory(run)
            codes = self.assess(run, inventory)
            rs = run['run_scope']
            op = uid('TEST_ONLY:d05-aggregate-op')
            boundary = n.writers.boundary(self, op)
            fstatus = inventory['flush']['status'] if inventory['flush'] else 'unknown'
            flush = self.make(SS + 'FinalFlushRecord', dict(
                scope=rs, aggregate_operation_id=op, operation_id=uid('TEST_ONLY:final-flush-op'), original_boundary=boundary,
                domain_birth=d05_sel(w, 'executor_safestop_domain_birth', run['birth_key']), status=fstatus,
                failure_stage=None if fstatus == 'original_required_flush_durable' else ('segment_sync' if fstatus == 'original_required_flush_failed' else 'unknown'),
                original_failure_ref=None if fstatus == 'original_required_flush_durable' else uid('TEST_ONLY:flush-failure'),
                unresolved_admissions=[], required_terminal_outcome='not_decided_here' if fstatus == 'original_required_flush_durable' else 'not_ready',
                diagnostic_persistence='not_required' if fstatus == 'original_required_flush_durable' else 'durable',
                writer_cuts=[], event_commitments=[]))
            fkey, _, _ = self.issue(self.FLUSH, SS + 'FinalFlushRecordPhysical', dict(value=flush))
            settlements = []
            for key, inv in zip(inventory['invocation_keys'], inventory['invocations']):
                if inv['status'] == 'resolved' and inv['resolution'] and inv['run_scope'] == rs:
                    rsel = d05_sel(w, EffectOwner.INV + '_resolution', inv['resolution'])
                    isel = d05_sel(w, EffectOwner.INV, key)
                    settlements.append(dict(kind='filesafe_original_resolution' if inv['kind'] == 'filesafe' else 'process_original_shutdown',
                                            original_result=rsel, original_origin=isel))
            resolved = not codes
            disposition = ('bounded_original_safe_stop_resolved' if resolved else
                           'original_required_flush_failed' if 'd05/flush_failed' in codes else 'original_safe_stop_unresolved')
            okey = '%s:%s' % (self.ORIGIN, uid('TEST_ONLY:d05-origin'))
            result = self.make(SS + 'AggregateResult', dict(
                scope=rs, operation_id=op, transaction_id=uid('TEST_ONLY:d05-tx'),
                goal_stop=src_sel(w, 'goal_cancel_stop_receipt', rkey),
                scheduler_stop=src_sel(w, SchedulerStopOwner.TABLE, run['scheduler_stop_key']),
                inventory_cut=src_sel(w, EffectOwner.CUT, inventory['cut_key']),
                domain_birth=d05_sel(w, 'executor_safestop_domain_birth', run['birth_key']),
                original_final_flush=d05_sel(w, self.FLUSH, fkey), required_checkpoint_set=[],
                settlements=self.settlement_values(settlements), disposition=disposition,
                unresolved_sources=[] if resolved else [{} for _ in codes[:1]],
                original_terminal_requirement='done.cancelled' if resolved else 'not_ready', original_boundary=boundary,
                origin=dict(storage_instance_id=w.storage_id, physical_key=okey, operation_id=op), completed_at_utc=self.clock.now(),
                reservation_allocation=d05_sel(w, 'executor_safestop_reservation_allocation', run['allocation_key'])))
            akey, _, _ = self.issue(self.RESULT, SS + 'AggregateResultPhysical', dict(value=result))
            origin = self.make(SS + 'Origin', dict(scope=rs, operation_id=op, transaction_id=result['transaction_id'], sequence=1, previous_origin=None,
                               native_boundary=boundary, write_kind='aggregate_result', issued_records=[d05_sel(w, self.RESULT, akey)]))
            self.issue(self.ORIGIN, SS + 'OriginPhysical', dict(value=origin), key=okey)
            run['d05'] = dict(operation_id=op, result_key=akey, origin_key=okey, flush_key=fkey, resolved=resolved, codes=codes,
                              stop_receipt_key=rkey)
            slot.set(dict(disposition=disposition, codes=codes))
            return run['d05']

    def settlement_values(self, settlements):
        out = []
        for s in settlements:
            item = self.make(SS + 'SettlementCommitment', dict(kind=s['kind']))
            if s['kind'] == 'process_original_shutdown':
                item['original_result'], item['original_origin'] = s['original_result'], s['original_origin']
            self.world.roots.check('native', SS + 'SettlementCommitment', item)
            out.append(item)
        return out

    def readback(self, run, goal_scope):
        """SuccessfulReadback: the stored original result/origin plus a FRESH current boundary."""
        w, n = self.world, self.world.native
        d = run.get('d05')
        require('d05/not_aggregated', d is not None)
        require('d05/unresolved', d['resolved'] is True)
        result = w.value(self.RESULT, d['result_key'])
        origin = w.value(self.ORIGIN, d['origin_key'])
        require('d05/result_unavailable', result is not None and origin is not None)
        require('d05/origin_join', origin['value']['issued_records'][0]['physical_sha256'] == row_sha(result))
        codes = self.assess(run, n.effects.inventory(run))
        require(codes[0] if codes else 'd05/current_resolved', not codes)
        gss, rkey = self.goal_stop_sources(goal_scope)
        require('d05/goal_stop_changed', rkey == d['stop_receipt_key'])
        rs = run['run_scope']
        birth = w.value('executor_safestop_domain_birth', run['birth_key'])
        flush = w.value(self.FLUSH, d['flush_key'])
        seed = dict(status='bounded_original_safe_stop_resolved', scope=rs, operation_id=d['operation_id'],
                    goal_stop=result['value']['goal_stop'], scheduler_stop=result['value']['scheduler_stop'],
                    inventory_cut=result['value']['inventory_cut'],
                    source_readback=dict(scope=rs, aggregate_operation_id=d['operation_id'], goal_stop=gss, domain_birth=birth['value'],
                                         domain_birth_source=d05_sel(w, 'executor_safestop_domain_birth', run['birth_key']),
                                         final_flush=dict(record=flush['value'], record_source=d05_sel(w, self.FLUSH, d['flush_key'])),
                                         reservation_lineage=run['lineage']),
                    original_result=result['value'], result_source=d05_sel(w, self.RESULT, d['result_key']),
                    original_origin=origin['value'], origin_source=d05_sel(w, self.ORIGIN, d['origin_key']),
                    current_boundary=dict(scope=rs, original_boundary=n.writers.boundary(self, d['operation_id']), current_goal_stop=gss,
                                          reservation_lineage=run['lineage'],
                                          current_permission_snapshot=dict(selector=d05_sel(w, 'permission_snapshot_record', run['permission_key']),
                                                                           value=w.value('permission_snapshot_record', run['permission_key']))),
                    recovery=None, action_authority='none')
        return self.composed(('d05_readback', rs['goal_run_id']), SS + 'SuccessfulReadback', seed)


class D06Owner(NativeOwner):
    """EP-118 positive D06 disposition: prepare/publish, own goal_run.cancelled Event, readbacks."""
    role = 'native_d06'
    INTENT, CONTROL, RESULT, ORIGIN, CANDIDATE = ('workflow_cancel_intent', 'workflow_cancel_control', 'workflow_cancel_result',
                                                  'workflow_cancel_origin', 'workflow_cancel_event_candidate')

    def key(self, run, name, n=0):
        return '%s:%s:%d' % (name, k_hex(run['run_scope']['goal_run_id']), n)

    def association_selection(self, goal_scope):
        w = self.world
        read = w.binding.read_current(goal_scope)
        rsel = read['control']['value']['record']['current_revision']
        return src_sel(w, rsel['family_id'], rsel['physical_key'])

    def event_candidate(self, run, goal_scope, op, tx_id, before, after, settlement_refs, actor_ref):
        w = self.world
        rs = run['run_scope']
        payload = self.make(CANCELLED_PAYLOAD, dict(
            project_id=rs['project_id'], goal_id=rs['goal_id'], goal_revision=w.goal.body_cell(goal_scope)['value']['record']['revision'],
            actor_ref=actor_ref, occurred_at_utc=self.clock.now(), thread_id=goal_scope['thread_id'],
            payload=dict(goal_run_id=rs['goal_run_id'], cancel_reason='user_cancelled', mutation_started=bool(settlement_refs),
                         settlement_refs=settlement_refs),
            expected_goal_run_revision=before, goal_run_revision=after, idempotency_key=uid('TEST_ONLY:goal-run-cancel-key')))
        event = dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project', event_id=uid('TEST_ONLY:goal_run.cancelled'),
                     event_type='goal_run.cancelled', project_id=rs['project_id'], thread_id=goal_scope['thread_id'], run_id=rs['goal_run_id'],
                     node_id=None, attempt_id=None, actor_ref=actor_ref, requested_account_ref=None, effective_account_ref=None,
                     occurred_at_utc=payload['occurred_at_utc'], producer_sequence_id=None, correlation_id=uid('TEST_ONLY:d06-correlation'),
                     causation_event_id=run['start']['event_id'], parent_event_id=None, idempotency_key=payload['idempotency_key'],
                     payload_schema_id='pm.goal_runtime_event.goal_run_cancelled.schema.v3', payload=payload, payload_ref=None,
                     redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
                     migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None, compatibility_event_type=None))
        candidate = self.make(D06 + 'EventCandidate', dict(scope=rs, operation_id=op, transaction_id=tx_id,
                                                          producer_semantic_digest=NR.producer_digest(event)))
        return event, candidate

    def prepare(self, run, goal_scope, actor_ref):
        w, n = self.world, self.world.native
        with self.recorder.call(self.owner_id, 'prepare_disposition', dict(run=run['run_scope']['goal_run_id'])) as slot:
            require('d06/already_prepared', 'd06' not in run)
            n.d05.readback(run, goal_scope)
            d = run['d05']
            pointer, body, control = n.run.current(run)
            rs = run['run_scope']
            op = uid('TEST_ONLY:d06-op')
            tx_id = uid('TEST_ONLY:d06-tx')
            status = body['record']['status']
            kind = 'cancel_nonterminal' if status in NONTERMINAL else 'preserve_terminal'
            require('d06/unsupported_status', status in NONTERMINAL + TERMINAL)
            before_bsel, before_csel = src_sel(w, n.run.BODY, pointer['body_key']), src_sel(w, n.run.CONTROL, pointer['control_key'])
            after_rev = NR.uint64(body['record']['revision'] + 1, 'd06/revision') if kind == 'cancel_nonterminal' else body['record']['revision']
            if kind == 'cancel_nonterminal':
                bkey, pbody, ckey, pcontrol = n.run.body_values(run, after_rev, 'cancelled', goal_scope)
            else:
                bkey, pbody, ckey, pcontrol = pointer['body_key'], body, pointer['control_key'], control
            settlement_refs = [s['original_result']['physical_key'] for s in w.value(n.d05.RESULT, d['result_key'])['value']['settlements']
                               if 'physical_key' in s['original_result']]
            ckey_cand = None
            if kind == 'cancel_nonterminal':
                event, candidate = self.event_candidate(run, goal_scope, op, tx_id, body['record']['revision'], after_rev, settlement_refs, actor_ref)
                ckey_cand = self.key(run, self.CANDIDATE)
                self.issue(self.CANDIDATE, D06 + 'StorageEventCandidate', dict(record=candidate), key=ckey_cand, keyed=False)
            cand_sel = src_sel(w, self.CANDIDATE, ckey_cand) if ckey_cand else None
            intent = self.make(D06 + 'Intent', dict(
                scope=rs, operation_id=op, transaction_id=tx_id, workflow_owner_ref=run['execution_owner_ref'],
                workflow_owner_epoch=run['execution_owner_epoch'], association_selection=self.association_selection(goal_scope),
                goal_stop=src_sel(w, 'goal_cancel_stop_receipt', d['stop_receipt_key']),
                scheduler_stop=src_sel(w, SchedulerStopOwner.TABLE, run['scheduler_stop_key']),
                inventory_cut=src_sel(w, EffectOwner.CUT, n.effects.members[rs['goal_run_id']]['cut']),
                safe_stop_source=src_sel(w, n.d05.RESULT, d['result_key']), before_body=before_bsel, before_control=before_csel,
                prepared_body_sha256=row_sha(pbody), prepared_control_sha256=row_sha(pcontrol), kind=kind, prepared_at_utc=self.clock.now(),
                event_candidate=cand_sel))
            ikey = self.key(run, self.INTENT)
            self.issue(self.INTENT, D06 + 'StorageIntent', dict(record=intent), key=ikey, keyed=False)
            ctl = self.make(D06 + 'Control', dict(scope=rs, operation_id=op, revision=1, intent=src_sel(w, self.INTENT, ikey), phase='prepared',
                                                 result=None, last_origin_operation_id=op))
            ckey1 = self.key(run, self.CONTROL)
            self.issue(self.CONTROL, D06 + 'StorageControl', dict(record=ctl), key=ckey1, keyed=False)
            origin = self.make(D06 + 'Origin', dict(scope=rs, issuer_method='owner.workflow.executor_cancel.prepare_disposition.v3', operation_id=op,
                               transaction_id=tx_id, workflow_owner_ref=run['execution_owner_ref'], workflow_owner_epoch=run['execution_owner_epoch'],
                               causation=src_sel(w, n.d05.RESULT, d['result_key']), beforeimages=[before_bsel, before_csel],
                               afterimages=dict(kind='prepare', intent=src_sel(w, self.INTENT, ikey), control=src_sel(w, self.CONTROL, ckey1),
                                                event_candidate=cand_sel), issued_at_utc=self.clock.now()))
            self.issue(self.ORIGIN, D06 + 'StorageOrigin', dict(record=origin), key=self.key(run, self.ORIGIN, 1), keyed=False)
            run['d06'] = dict(operation_id=op, transaction_id=tx_id, kind=kind, intent_key=ikey, control_key=ckey1, candidate_key=ckey_cand,
                              prepared=dict(bkey=bkey, body=pbody, ckey=ckey, control=pcontrol, before_bsel=before_bsel, before_csel=before_csel),
                              event=event if kind == 'cancel_nonterminal' else None, phase='prepared')
            slot.set(dict(kind=kind, operation_id=op))
            return run['d06']

    def publish(self, run, goal_scope):
        w, n = self.world, self.world.native
        with self.recorder.call(self.owner_id, 'publish_disposition', dict(run=run['run_scope']['goal_run_id'])) as slot:
            d6 = run.get('d06')
            require('d06/not_prepared', d6 is not None and d6['phase'] == 'prepared')
            n.d05.readback(run, goal_scope)
            pointer, body, control = n.run.current(run)
            pre = d6['prepared']
            require('d06/before_changed', src_sel(w, n.run.BODY, pointer['body_key']) == pre['before_bsel']
                    and src_sel(w, n.run.CONTROL, pointer['control_key']) == pre['before_csel'])
            rs, d = run['run_scope'], run['d05']
            writes, receipt, commitment = [], None, None
            if d6['kind'] == 'cancel_nonterminal':
                events, _, _ = w.appender.append_original(d6['operation_id'], dict(kind='TEST_ONLY:goal_run.cancelled', op=d6['operation_id']),
                                                          [d6['event']], durability_class='barrier')
                stored_event = w.appender.event(events[0])
                custody = w.storage.first_custody(stored_event['event_id'])
                require('d06/event_candidate_digest', custody['producer_semantic_digest']
                        == w.value(self.CANDIDATE, d6['candidate_key'])['record']['producer_semantic_digest'])
                receipt, commitment = custody['first_append_receipt'], custody['original_event_value_commitment']
                writes = [w.put(n.run.BODY, pre['bkey'], pre['body']), w.put(n.run.CONTROL, pre['ckey'], pre['control'])] + \
                    n.run.pointer_writes(run, pre['body']['record']['revision'], pre['bkey'], pre['ckey'])
                d6['event_id'] = stored_event['event_id']
            tx = w.write(writes) if writes else None
            after_bsel, after_csel = src_sel(w, n.run.BODY, pre['bkey']), src_sel(w, n.run.CONTROL, pre['ckey'])
            intent = w.value(self.INTENT, d6['intent_key'])['record']
            common = dict(scope=rs, operation_id=d6['operation_id'], transaction_id=d6['transaction_id'], workflow_owner_ref=run['execution_owner_ref'],
                          workflow_owner_epoch=run['execution_owner_epoch'], intent=src_sel(w, self.INTENT, d6['intent_key']),
                          before_body=pre['before_bsel'], before_control=pre['before_csel'], after_body=after_bsel, after_control=after_csel,
                          safe_stop_source=intent['safe_stop_source'], scheduler_stop=intent['scheduler_stop'], inventory_cut=intent['inventory_cut'],
                          association_selection=intent['association_selection'], committed_at_utc=self.clock.now(), action_authority='none')
            if d6['kind'] == 'cancel_nonterminal':
                result = self.make(D06 + 'CancelledResult', dict(common, kind='cancelled_from_nonterminal', append_receipt=receipt,
                                   original_event_value=commitment, event_candidate=intent['event_candidate']))
            else:
                result = self.make(D06 + 'PreservedResult', dict(common, kind='terminal_preserved', preserved_status=body['record']['status']))
            rkey = self.key(run, self.RESULT)
            self.issue(self.RESULT, D06 + 'StorageResult', dict(record=result), key=rkey, keyed=False)
            ccell = w.cell(self.CONTROL, d6['control_key'])
            ctl = dict(ccell['value']['record'], revision=2, phase='committed', result=src_sel(w, self.RESULT, rkey))
            self.world.roots.check('native', D06 + 'Control', ctl)
            w.write([w.put(self.CONTROL, d6['control_key'], dict(ccell['value'], record=ctl), expected=ccell['version'])])
            origin = self.make(D06 + 'Origin', dict(scope=rs, issuer_method='owner.workflow.executor_cancel.publish_disposition.v3',
                               operation_id=d6['operation_id'], transaction_id=d6['transaction_id'], workflow_owner_ref=run['execution_owner_ref'],
                               workflow_owner_epoch=run['execution_owner_epoch'], causation=src_sel(w, self.INTENT, d6['intent_key']),
                               beforeimages=[pre['before_bsel'], pre['before_csel']],
                               afterimages=dict(kind='publish', result=src_sel(w, self.RESULT, rkey), control=src_sel(w, self.CONTROL, d6['control_key']),
                                                native_body=after_bsel, native_control=after_csel), issued_at_utc=self.clock.now()))
            okey = self.key(run, self.ORIGIN, 2)
            self.issue(self.ORIGIN, D06 + 'StorageOrigin', dict(record=origin), key=okey, keyed=False)
            lineage = self.make(D06 + 'OriginalD01Lineage', dict())
            lkeys = {}
            for part in ('update', 'head', 'pointer', 'origin'):
                table = 'TEST_ONLY:d01_lineage_' + part
                lkeys[part] = self.key(run, table)
                self.store(table, lkeys[part], lineage[part])
            d6.update(phase='published', result_key=rkey, origin_key=okey, lineage_keys=lkeys, tx=tx['tx_id'] if tx else None)
            run['revision'] = pre['body']['record']['revision']
            self.readback(run, goal_scope)  # the issuing owner builds the readback's provenance skeleton once
            slot.set(dict(kind=d6['kind'], result_key=rkey))
            return result

    def native_preimage(self, run, lineage):
        w, n = self.world, self.world.native
        pointer, body, control = n.run.current(run)
        return self.composed(('native_preimage', run['run_scope']['goal_run_id']), D06 + 'NativePreimage', dict(
            body=body, body_selection=src_sel(w, n.run.BODY, pointer['body_key']), control=control,
            control_selection=src_sel(w, n.run.CONTROL, pointer['control_key'])))

    def readback(self, run, goal_scope):
        """The whole current positive D06 readback, every member re-read from Storage now."""
        w, n = self.world, self.world.native
        d6 = run.get('d06')
        require('d06/not_published', d6 is not None and d6['phase'] == 'published')
        safe = n.d05.readback(run, goal_scope)
        intent = w.value(self.INTENT, d6['intent_key'])
        control = w.value(self.CONTROL, d6['control_key'])
        result = w.value(self.RESULT, d6['result_key'])
        origin = w.value(self.ORIGIN, d6['origin_key'])
        require('d06/custody_unavailable', None not in (intent, control, result, origin))
        require('d06/control_result', control['record']['phase'] == 'committed'
                and control['record']['result']['physical_value_sha256'] == row_sha(result))
        require('d06/control_intent', control['record']['intent']['physical_value_sha256'] == row_sha(intent))
        lineage = {part: w.value('TEST_ONLY:d01_lineage_' + part, key) for part, key in d6['lineage_keys'].items()}
        d = run['d05']
        join = dict(scope=run['run_scope'], operation_id=d['operation_id'], goal_stop=src_sel(w, 'goal_cancel_stop_receipt', d['stop_receipt_key']),
                    scheduler_stop=src_sel(w, SchedulerStopOwner.TABLE, run['scheduler_stop_key']),
                    inventory_cut=src_sel(w, EffectOwner.CUT, n.effects.members[run['run_scope']['goal_run_id']]['cut']),
                    whole_original_safe_stop=safe)
        preimage = self.native_preimage(run, lineage)
        common = dict(result=result['record'], origin=origin['record'], intent=intent['record'], control=control['record'], safe_stop=join,
                      original_d01_lineage=lineage)
        if d6['kind'] == 'cancel_nonterminal':
            ev = w.storage.read_event(d6['event_id'])
            custody = w.storage.first_custody(d6['event_id'])
            candidate = w.value(self.CANDIDATE, d6['candidate_key'])
            gbody, gctl = w.goal.keys(goal_scope)['body'], w.goal.keys(goal_scope)['control']
            rjoin = self.composed(('revision_join', run['run_scope']['goal_run_id']), D06 + 'OriginalRevisionJoin', dict(
                scope=run['run_scope'], operation_id=d6['operation_id'], transaction_id=d6['transaction_id'],
                current_goal_body_selection=src_sel(w, w.goal.BODY, gbody), current_goal_control_selection=src_sel(w, w.goal.CONTROL, gctl),
                association_selection=intent['record']['association_selection'],
                expected_goal_run_revision=ev['payload']['expected_goal_run_revision'], goal_run_revision=ev['payload']['goal_run_revision'],
                original_event=ev, original_append=w.storage.full_value_result(d6['event_id']), original_custody=custody, current_native=preimage,
                original_transition=lineage['update'], original_transition_origin=lineage['origin'],
                event_candidate=intent['record']['event_candidate']))
            d06 = self.composed(('d06_readback', run['run_scope']['goal_run_id']), D06 + 'ReadbackCancelled', dict(common, kind='cancelled_from_nonterminal', native_after=preimage, original_event=dict(
                event=ev, append=w.storage.full_value_result(d6['event_id']), custody=custody, original_revision_join=rjoin,
                original_candidate=candidate)))
        else:
            d06 = self.composed(('d06_readback', run['run_scope']['goal_run_id']), D06 + 'ReadbackPreserved', dict(common, kind='terminal_preserved', native_unchanged=preimage))
        return self.make(PA + 'CurrentSuccessfulReadback', dict(d06_readback=d06, current_start=n.start.current_start(run)))

    def retained(self, run):
        """RetainedWorkflowEntry: the original result/origin only, no current runtime."""
        w = self.world
        d6 = run.get('d06')
        require('d06/not_published', d6 is not None and d6['phase'] == 'published')
        result = w.value(self.RESULT, d6['result_key'])
        origin = w.value(self.ORIGIN, d6['origin_key'])
        require('d06/retained_unavailable', result is not None and origin is not None)
        return self.make(NA + 'RetainedWorkflowEntry', dict(original_disposition=dict(result=result['record'], origin=origin['record'],
                                                                                      action_authority='none'),
                                                            original_result_storage=result, original_origin_storage=origin))


class NativeWorld:
    """The native owners of one Workflow cancellation case, attached to a DG-CA World."""

    def __init__(self, world):
        self.world = world
        world.native = self
        self.ancillary_count = 0
        self.skeletons = {}
        self.ancillary = AncillaryOwner(world)
        self.writers = WriterGraphOwner(world)
        self.run = RunOwner(world)
        self.start = StartOwner(world)
        self.scheduler = SchedulerStopOwner(world)
        self.effects = EffectOwner(world)
        self.d05 = D05Owner(world)
        self.d06 = D06Owner(world)
