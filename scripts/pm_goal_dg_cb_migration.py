#!/usr/bin/env python3
"""DG-CB TEST_ONLY StorageMigrationCoordinator: goal.cancelled C5 (M2-M6) and C6 (M7-M9).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

``owner.storage.goal_binding_migration.capture.v1`` (C5) takes only the closed
MigrationSelector. Under a stored all-writer exclusion for the Goal scope it
acquires each of the six independently registered original owners from the
registry (Goal, host Stop through ``read_for_binding_migration.v1``, Plan,
Workflow, Scheduler, SIR), takes each owner's issued OwnerMapping statement,
and authenticates every SourceImage against Storage's own physical bytes, its
original codec, its original schema realm and its issuance origin. Membership
is compared with the owner's own database read, pending effects with what the
images themselves say, and the seven SP-305 writer categories with every
native implementation registered at dispatch. It then derives the M3/M5/M6
joins field by field: the Goal snapshot and receipt chain, the exact old Stop
projection, Plan/Workflow associations against the Goal's active_run_ref,
Scheduler sources against the Plan run, representable pending candidates, and
unknown or contradictory effects (``blocked_unresolved``). Missing data is
unavailable, never empty or virgin. Every helper return is followed by a
recheck of all owners; a concurrent real host Stop makes capture release its
snapshot and recapture the whole newer domain.

``commit.v1`` (C6) independently rereads every source at entry and after its
last helper, requires the presented request to equal that capture, derives the
complete destination (BindingRevision/Origin/Control with the optional
PlanAssociation or WorkflowAssociation and BindingPending, body control v1->v2,
the unchanged host Stop mapping, WriterDomain/head installation or join, the
ordered content-free manifest parts and the immutable MigrationResult), checks
every stored part and operation against 16 KiB, and publishes all of it in ONE
test-owner Storage transaction under whole-source and whole-head CAS.
``recover.v1``/``read_result.v1`` take only the selector; ``withdraw.v1``
records an immutable MigrationWithdrawalResult and the SP-423 cutoff.
"""
from __future__ import annotations

import copy

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_dg_ca_owners import (WorldOwner, require, Refusal, uid, row_sha, same, sha, scoped_key, CANCEL, BINDING, BODY,
                                  QUALIFICATION, NATIVE_LINE, transaction_record, WRITERS, MSGPACK)
import pm_goal_dg_cb_owners as B
from pm_goal_dg_cb_owners import (ROLES, ROLE_FAMILIES, FAMILY_CODECS, CODECS, ORIGINS, EXCLUSION, DISPATCH, TOS, physical, phys_sha,
                                  schema_ref_for, validate_original, origin_key, hx, lane_bank)

PART_CAP = S.STORED_PART_CAP
RESULT = 'goal_binding_migration_result'
PART = 'goal_binding_migration_manifest_part'
WITHDRAWAL = 'goal_binding_migration_withdrawal'
CONTRACTS = B.ContractsBank.URI
ADOPT = 'goal.execution_binding.adopt_existing'
AUDIT = 'goal.binding_migration.audit'
WITHDRAW = 'goal.binding_migration.withdraw'
REINSTALL = 'goal.execution_binding.install_writer_domain'
REGISTRY_ROLES = dict(goal='goal_body', host_stop='host_stop', plan='assistant_plan', workflow='workflow', scheduler='scheduling', sir='sir')
IMMUTABLE_FAMILIES = ('goal_execution_writer_domain', 'goal_execution_binding_revision', 'goal_execution_binding_origin')


def txrec(owner, method, operation_id, permission, tx_ref, cause_ref, at):
    """OriginalTransaction with an explicit commit time (one value per commit call)."""
    return dict(owner_method=method, original_owner_ref=owner.owner_id, original_owner_epoch=owner.owner_epoch,
                original_operation_id=operation_id, original_transaction_id=tx_ref, original_permission_source=permission,
                original_causation_ref=cause_ref, committed_at=at)


class Yield(Exception):
    """A concurrent real host Stop: release the snapshot and recapture the newer domain."""


def split(physical_key):
    family, _, key = physical_key.partition('|')
    require('M/selection/physical_key', family != '' and key != '')
    return family, key


def size(value):
    return len(S.canonical(value, 'M/size'))


class Capture:
    """Transient private capture under held owners: never persisted, never caller authority."""

    def __init__(self):
        self.images = {}
        self.blocked = []
        self.associations = []
        self.pending_attach = None
        self.pending_ids = []
        self.receipts = []


class Coordinator(WorldOwner):
    """The original StorageMigrationCoordinator (TEST_ONLY)."""
    role = 'storage_migration'

    def __init__(self, world, **kw):
        super().__init__(world, **kw)
        self.inject = {}
        self.visited = []
        self.max_recaptures = 3
        self.recaptures = 0

    # ---- boundary discipline -----------------------------------------------------------
    def at(self, method, point):
        self.visited.append((method, point))
        hook = self.inject.pop((method, point), None)
        if hook is not None:
            hook(self)

    def scope_cells(self, role, scope):
        """The owner's own database read for the Goal scope (physical cells), used for every helper-boundary recheck."""
        w = self.world
        owner = w.owner_for(role)
        if role == 'goal':
            keys = owner.goal_keys(scope)
        elif role == 'host_stop':
            keys = [(owner.FAMILY, owner.key(scope))] + [(owner.RECEIPTS, k) for k in owner.receipt_keys(scope)]
        elif role == 'plan':
            keys = owner.plan_sources(scope)
        elif role == 'workflow':
            keys = owner.workflow_sources(scope)
        elif role == 'scheduler':
            runs = set()
            for k in w.plans.run_keys(scope):
                runs.add(w.plans.decoded('assistant_plan_run', k)['record']['plan_run_id'])
            keys = owner.scheduler_sources(scope, runs)
        else:
            keys = [(f, k) for key in owner.command_keys(scope) for f, k in ((owner.ACCEPTED, key), (owner.OUTCOME, key))]
        return [[f, k, w.cell(f, k)] for f, k in keys]

    def observe_sources(self, scope):
        """Observation of every participant the migration depends on (owners' scope databases, registration, maintenance, domain)."""
        w = self.world
        obs = A.observation_digest
        out = {}
        for role in ROLES:
            owner = w.owner_for(role)
            out[role] = obs([owner.owner_epoch, getattr(owner, 'available', True), self.scope_cells(role, scope)])
        out['registration'] = obs([w.registration.owner_epoch, w.storage.cells.get(DISPATCH, {}), w.storage.cells.get(w.registration.FAMILY, {})])
        out['maintenance'] = obs(w.storage.cells.get(B.MAINTENANCE, {}))
        out['domain'] = obs([w.storage.cells.get(w.binding.HEAD, {}), w.storage.cells.get(w.binding.DOMAIN, {}), w.storage.cells.get(B.CUTOFF, {})])
        out['binding'] = obs(w.cell(w.binding.CONTROL, w.binding.keys(scope)['control']))
        out['permission'] = obs(w.value(w.permissions.FAMILY, w.constants.get('decision:%s:%s' % (self.owner_id, ADOPT), '')))
        return out

    def recheck(self, method, point, entry, scope):
        now = self.observe_sources(scope)
        if now['host_stop'] != entry['host_stop'] and all(now[k] == entry[k] for k in entry if k != 'host_stop'):
            raise Yield()
        for name in entry:
            require('M/%s/%s/%s' % (method, point, name), now[name] == entry[name])

    def call(self, method, args=None):
        return self.recorder.call(self.owner_id, method, args)

    def permission(self, action, actor=None):
        w = self.world
        actor = actor or self.owner_id
        key = 'decision:%s:%s' % (actor, action)
        decision = w.constants.get(key)
        if decision is None:
            _, decision = w.permissions.grant(actor, {'storage_instance_id': w.storage_id}, action)
            w.constants[key] = decision
        return decision

    def allowed(self, action, actor=None):
        actor = actor or self.owner_id
        decision = self.world.constants.get('decision:%s:%s' % (actor, action))
        return decision is not None and self.world.permissions.allowed(decision, actor, action)

    # ---- keys ----------------------------------------------------------------------------
    def result_key(self, scope, migration_id):
        return '%s.v1:%s:%s' % (RESULT, scoped_key(scope), hx(migration_id))

    def part_key(self, scope, migration_id, n):
        return '%s.v1:%s:%s:%d' % (PART, scoped_key(scope), hx(migration_id), n)

    def withdrawal_key(self, scope, withdrawal_id):
        return '%s.v1:%s:%s' % (WITHDRAWAL, scoped_key(scope), hx(withdrawal_id))

    def scope_of(self, selector):
        return {k: selector['scope'][k] for k in ('storage_instance_id', 'project_id', 'thread_id', 'goal_id')}

    # ---- exclusion -----------------------------------------------------------------------
    def acquire_exclusion(self, scope, migration_id):
        w = self.world
        key = w.exclusion_key(scope)
        current = w.value(EXCLUSION, key)
        require('M/capture/exclusion_held', current is None)
        value = dict(schema_id='pm.test_only.migration_exclusion.v1', qualification=QUALIFICATION, scope=copy.deepcopy(scope),
                     migration_id=migration_id, holder_ref=self.owner_id, exclusion_epoch=w.storage.cell_generation + 1, state='held',
                     acquired_at=self.clock.now())
        lane_bank().validate(TOS + 'MigrationExclusion', value, 'M/exclusion')
        w.write([w.put(EXCLUSION, key, value)])
        return value

    def release_exclusion(self, scope):
        w = self.world
        cell = w.cell(EXCLUSION, w.exclusion_key(scope))
        if cell is not None:
            w.write([dict(table=EXCLUSION, key=w.exclusion_key(scope), expected=cell['version'], delete=True)])

    def exclusion(self, scope):
        return self.world.cell(EXCLUSION, self.world.exclusion_key(scope))

    # ---- C5: capture ---------------------------------------------------------------------
    def capture(self, selector):
        """owner.storage.goal_binding_migration.capture.v1 (M2-M6)."""
        w = self.world
        with self.call('capture', dict(selector=selector)) as slot:
            w.contracts.validate('MigrationSelector', selector)
            scope, mid = self.scope_of(selector), selector['migration_id']
            require('M/capture/storage_instance', scope['storage_instance_id'] == w.storage_id)
            require('M/capture/permission', self.allowed(ADOPT))
            require('M/capture/result_exists', w.value(RESULT, self.result_key(scope, mid)) is None)
            require('M/capture/already_enrolled', w.cell(w.binding.CONTROL, w.binding.keys(scope)['control']) is None)
            acquired = self.acquire_exclusion(scope, mid)
            try:
                w.storage.mcut('after_exclusion')
                cap = self.read_all(selector, method='capture')
            except Exception:
                # a refused capture leaves no exclusion behind (an in-process Crash is a BaseException and keeps it)
                current = w.value(EXCLUSION, w.exclusion_key(scope))
                if current is not None and current['migration_id'] == mid and current['exclusion_epoch'] == acquired['exclusion_epoch']:
                    self.release_exclusion(scope)
                raise
            slot.set(dict(disposition='blocked_unresolved' if cap.blocked else 'enrolled', sources=len(cap.images)))
            self.last_capture = cap
            return copy.deepcopy(cap.request)

    def read_all(self, selector, *, method):
        """Read and authenticate the complete original source graph, yielding to a concurrent real Stop."""
        attempts = 0
        while True:
            try:
                return self._read_once(selector, method)
            except Yield:
                attempts += 1
                self.recaptures += 1
                require('M/%s/stop_unstable' % method, attempts < self.max_recaptures)

    def _read_once(self, selector, method):
        w = self.world
        scope, mid = self.scope_of(selector), selector['migration_id']
        entry = self.observe_sources(scope)
        cap = Capture()
        cap.scope, cap.migration_id = scope, mid
        maintenance = w.maintenance.source()
        state = w.maintenance.scope_state(scope)
        require('M/%s/deletion_requested' % method, state['deletion_requested'] is False)
        cap.maintenance = dict(root_identity=maintenance['root_identity'], namespace=maintenance['namespace'],
                               restore_epoch=maintenance['restore_epoch'], maintenance_epoch=maintenance['maintenance_epoch'])
        cap.expected_domain, cap.domain_state = self.writer_domain_source(method)
        self.at(method, 'after_registration')
        self.recheck(method, 'after_registration', entry, scope)
        mappings = {}
        plan_runs = None
        for role in ROLES:
            owner = w.registry.owner(w.owner_for(role).owner_id, REGISTRY_ROLES[role])
            if role == 'host_stop':
                handle, projection = owner.read_for_binding_migration(copy.deepcopy(selector))
                cap.stop = projection
            elif role == 'scheduler':
                handle = owner.enumerate_for_migration(scope, sorted(plan_runs))
            else:
                handle = owner.enumerate_for_migration(scope)
            _, mapping = A.acquire(w.registry, owner.owner_id, owner.role, handle)
            self.at(method, 'after_' + role)
            self.recheck(method, 'after_' + role, entry, scope)
            self.authenticate_mapping(cap, role, owner, mapping, method)
            mappings[role] = mapping
            if role == 'plan':
                plan_runs = {cap.images[(f, k)]['value']['record']['plan_run_id'] for (f, k) in cap.images
                             if f == 'assistant_plan_run' and cap.images[(f, k)]['role'] == 'plan'}
        self.derive_joins(cap, method)
        self.at(method, 'final')
        self.recheck(method, 'final', entry, scope)
        request = dict(scope=copy.deepcopy(selector['scope']), migration_id=mid, expected_writer_domain=copy.deepcopy(cap.expected_domain),
                       owner_mappings=[mappings[r] for r in ROLES])
        w.contracts.validate('MigrationRequest', request)
        cap.request = request
        cap.entry = entry
        return cap

    def writer_domain_source(self, method):
        """All seven writer categories and every native implementation; the pre-migration domain selection."""
        w = self.world
        reg = w.registration
        state = reg.state()
        implementations = state['implementations']
        for operation in WRITERS:
            ref = state['registrations'].get(operation)
            require('M/%s/writer_unregistered/%s' % (method, operation), ref is not None and w.value(reg.FAMILY, ref) is not None)
            impls = [i for i in implementations if i['descriptor']['operation'] == operation]
            require('M/%s/writer_missing/%s' % (method, operation), len(impls) >= 1)
            for impl in impls:
                require('M/%s/writer_unenrolled/%s' % (method, operation), impl['enrollment'] == 'enrolled')
                require('M/%s/writer_registration_join/%s' % (method, operation), impl['descriptor']['original_registration_ref'] == ref)
                require('M/%s/writer_storage/%s' % (method, operation), impl['descriptor']['storage_instance_id'] == w.storage_id)
        dispatch = dict(domain='pm.goal.execution_dispatch.v1', storage_instance_id=w.storage_id, native_root_identity=state['root_identity'],
                        complete_descriptors=reg.descriptors())
        w.roots.check('producer', BINDING + '#/$defs/DispatchCommitmentInput', dispatch)
        if w.binding.domain_generation == 0:
            return dict(owner=reg.owner_id, physical_key=DISPATCH + '|' + reg.state_key(), schema_ref=BINDING + '#/$defs/DispatchCommitmentInput',
                        sha256=sha(S.canonical(dispatch))), dict(installed=False, dispatch=dispatch)
        require('M/%s/domain_withdrawn' % method, w.binding.domain_withdrawn is False)
        dsel, domain, head = w.binding.domain_selection()
        require('M/%s/domain_registration_changed' % method,
                domain['record']['complete_original_dispatch_registration_sha256'] == w.codec.h(dispatch)
                and domain['record']['writers'] == reg.writer_registrations())
        return dict(owner=w.binding.owner_id, physical_key=w.binding.DOMAIN + '|' + dsel['physical_key'], schema_ref=BINDING + '#/$defs/StorageWriterDomain',
                    sha256=dsel['complete_value_sha256']), dict(installed=True, selection=dsel, head_key=w.binding.head_key())

    def authenticate_mapping(self, cap, role, owner, mapping, method):
        """Every SourceImage against Storage's own physical bytes, original codec, realm and issuance origin."""
        w = self.world
        w.contracts.validate('OwnerMapping', mapping)
        require('M/%s/mapping_role/%s' % (method, role), mapping['role'] == role)
        seen = []
        for image in mapping['sources']:
            family, key = split(image['selection']['physical_key'])
            require('M/%s/foreign_family/%s' % (method, role), family in ROLE_FAMILIES[role])
            require('M/%s/image_owner/%s' % (method, role), image['selection']['owner'] == owner.owner_id)
            cell = w.cell(family, key)
            require('M/%s/source_absent/%s' % (method, family), cell is not None)
            codec, raw = physical(cell['value'])
            require('M/%s/unsupported_codec/%s' % (method, family), codec in FAMILY_CODECS[family] and codec in CODECS)
            require('M/%s/source_codec/%s' % (method, family), image['codec_id'] == codec)
            require('M/%s/source_bytes/%s' % (method, family), image['bytes_hex'] == raw.hex())
            require('M/%s/source_hash/%s' % (method, family), image['selection']['sha256'] == sha(raw))
            value = CODECS[codec][1](raw)
            ref = schema_ref_for(family, value)
            require('M/%s/schema_ref/%s' % (method, family), image['selection']['schema_ref'] == ref)
            validate_original(w, ref, value, 'M/%s/source_schema' % method)
            ofamily, okey = split(image['origin']['physical_key'])
            require('M/%s/origin_join/%s' % (method, family), ofamily == ORIGINS and okey == origin_key(family, key, sha(raw)))
            origin = w.value(ORIGINS, okey)
            require('M/%s/origin_absent/%s' % (method, family), origin is not None)
            require('M/%s/origin_hash/%s' % (method, family), image['origin']['sha256'] == row_sha(origin) and image['origin']['owner'] == owner.owner_id)
            lane_bank().validate(TOS + 'IssuanceOrigin', origin, 'M/%s/origin_schema' % method)
            require('M/%s/origin_owner/%s' % (method, family), origin['owner_ref'] == owner.owner_id and origin['owner_role'] == role
                    and origin['issuer']['original_owner_ref'] == owner.owner_id)
            require('M/%s/origin_issued/%s' % (method, family), origin['issued_family_id'] == family and origin['issued_physical_key'] == key
                    and origin['issued_physical_sha256'] == sha(raw) and origin['codec_id'] == codec and origin['schema_ref'] == ref)
            permission = origin['issuer']['original_permission_source']
            pvalue = w.value(permission['family_id'], permission['physical_key'])
            require('M/%s/origin_permission/%s' % (method, family), pvalue is not None and row_sha(pvalue) == permission['complete_value_sha256']
                    and pvalue['actor_ref'] == owner.owner_id and pvalue['decision'] == 'allowed')
            require('M/%s/duplicate_image/%s' % (method, family), (family, key) not in cap.images)
            cap.images[(family, key)] = dict(role=role, codec=codec, raw=raw, value=value, version=cell['version'], image=image, origin=origin,
                                             schema_ref=ref)
            seen.append((family, key))
        # membership: the owner's own database read (not its statement) must name exactly these originals
        expected = self.owner_database(role, owner, cap)
        require('M/%s/inventory_incomplete/%s' % (method, role), sorted(seen) == sorted(expected))
        # pending effects and prior receipts as the images themselves say
        derived_pending, derived_receipts = self.image_pending(role, cap, seen)
        require('M/%s/pending_mismatch/%s' % (method, role), sorted(mapping['pending_operations']) == sorted(derived_pending))
        require('M/%s/receipts_mismatch/%s' % (method, role), same(mapping['prior_receipts'], derived_receipts))
        cap.pending_ids += derived_pending
        cap.receipts += copy.deepcopy(derived_receipts)

    def owner_database(self, role, owner, cap):
        if role == 'goal':
            return owner.goal_keys(cap.scope)
        if role == 'host_stop':
            return [(owner.FAMILY, owner.key(cap.scope))] + [(owner.RECEIPTS, k) for k in owner.receipt_keys(cap.scope)]
        if role == 'plan':
            return owner.plan_sources(cap.scope)
        if role == 'workflow':
            return owner.workflow_sources(cap.scope)
        if role == 'scheduler':
            runs = {v['value']['record']['plan_run_id'] for (f, k), v in cap.images.items() if f == 'assistant_plan_run'}
            return owner.scheduler_sources(cap.scope, runs)
        return [(f, k) for key in owner.command_keys(cap.scope) for f, k in ((owner.ACCEPTED, key), (owner.OUTCOME, key))]

    def image_pending(self, role, cap, seen):
        pending, receipts = [], []
        for family, key in seen:
            item = cap.images[(family, key)]
            value = item['value']
            if role == 'goal':
                if family == 'goal_body_control':
                    if value['record'].get('pending') is not None:
                        pending.append(value['record']['pending']['operation_id'])
                    if value['record'].get('cancellation_pending') is not None:
                        pending.append(value['record']['cancellation_pending']['operation_id'])
                if family == 'goal_body_mutation_receipt':
                    receipts.append(item['image']['selection'])
            elif role == 'host_stop' and family == 'TEST_ONLY:host_stop_receipt':
                receipts.append(item['image']['selection'])
            elif role == 'plan' and family == 'TEST_ONLY:plan_pending_attach':
                pending.append(value['operation_id'])
            elif role == 'workflow' and family == 'workflow_goal_run_control' and value['record']['pending_operation_id'] is not None:
                pending.append(value['record']['pending_operation_id'])
            elif role == 'scheduler' and family == 'TEST_ONLY:scheduler_callback_admission' and value['state'] == 'admitted':
                pending.append(value['admission_id'])
            elif role == 'sir' and family == 'sir_command_outcome':
                if value['record']['outcome'] == 'acknowledged':
                    accepted = cap.images[('TEST_ONLY:sir_accepted_dispatch', key)]['value']
                    pending.append(accepted['identity']['operation_id'])
                else:
                    receipts.append(item['image']['selection'])
        return pending, receipts

    def by_family(self, cap, family, role=None):
        return {k: v for (f, k), v in cap.images.items() if f == family and (role is None or v['role'] == role)}

    def derive_joins(self, cap, method):
        """M3/M5/M6: field-by-field cross-owner comparison; unavailable vs blocked_unresolved."""
        w = self.world
        scope = cap.scope
        m = w.shared.goal_model
        gk = w.goal.keys(scope)
        body_item = cap.images.get(('goal_body_record', gk['body']))
        control_item = cap.images.get(('goal_body_control', gk['control']))
        require('M/%s/goal_unavailable' % method, body_item is not None or control_item is not None)
        require('M/%s/goal_body_unavailable' % method, body_item is not None)
        require('M/%s/goal_control_unavailable' % method, control_item is not None)
        body, control = body_item['value']['record'], control_item['value']['record']
        require('M/%s/goal_scope' % method, all(body[k] == scope[k] for k in ('project_id', 'thread_id', 'goal_id'))
                and all(control[k] == scope[k] for k in scope))
        revisions = sorted((v['value']['record'] for k, v in self.by_family(cap, 'goal_objective_revision').items()), key=lambda r: r['revision'])
        origins = {str(v['value']['record']['goal_revision']): v['value']['record'] for v in self.by_family(cap, 'goal_objective_origin').values()}
        control_v1 = {k: v for k, v in control.items() if k != 'cancellation_pending'}
        control_v1['schema_id'] = 'pm.goal.body_control.v1'
        try:
            m.validate_snapshot(dict(body=copy.deepcopy(body), control=control_v1, revisions=revisions, origins=origins))
        except Exception as error:  # noqa: BLE001 - the original model raises Rejected(<reason>)
            raise Refusal('M/%s/goal_snapshot/%s' % (method, error)) from error
        receipts = [v['value']['record'] for v in self.by_family(cap, 'goal_body_mutation_receipt').values()]
        require('M/%s/goal_birth_receipt' % method, any(r['before_revision'] is None and r['after_revision'] == 1 for r in receipts))
        require('M/%s/goal_receipt_head' % method, any(r['after_revision'] == body['revision'] and r['after_currentness_hash'] == body['currentness_hash']
                                                       for r in receipts))
        for r in receipts:
            require('M/%s/goal_receipt_scope' % method, all(r[k] == scope[k] for k in scope) and r['owner_ref'] == w.goal.owner_id)
        if control['cancellation_receipt_ref'] is not None:
            cap.blocked.append(dict(kind='old_cancellation_receipt_unavailable', operation=control['cancellation_receipt_ref']))
        if control.get('cancellation_pending') is not None:
            cap.blocked.append(dict(kind='old_cancellation_pending_receipt_unavailable', operation=control['cancellation_pending']['operation_id']))
        cap.body, cap.control, cap.body_item, cap.control_item = body, control, body_item, control_item
        # host Stop
        stop_item = cap.images[(w.host_stop.FAMILY, w.host_stop.key(scope))]
        require('M/%s/stop_projection' % method, same(cap.stop['stop_control'], stop_item['value']['record'])
                and cap.stop['host_owner_ref'] == w.host_stop.owner_id)
        cap.stop_item = stop_item
        # Plan associations and pending attaches
        plans = self.by_family(cap, 'assistant_plan_record')
        runs = {v['value']['record']['plan_run_id']: (k, v) for k, v in self.by_family(cap, 'assistant_plan_run').items()}
        gpbs = self.by_family(cap, 'goal_plan_binding')
        attaches = self.by_family(cap, 'TEST_ONLY:plan_pending_attach')
        bound_runs = set()
        for key, item in gpbs.items():
            gpb = item['value']['record']
            require('M/%s/plan_binding_scope' % method, gpb['goal_id'] == scope['goal_id'] and item['value']['storage_instance_id'] == w.storage_id)
            require('M/%s/plan_absent_reverse_row' % method, gpb['plan_run_id'] in runs)
            rkey, run = runs[gpb['plan_run_id']]
            r = run['value']['record']
            pkey = 'assistant_plan_record.v1:%s:%s:%s:%s' % (hx(w.storage_id), hx(scope['project_id']), hx(scope['thread_id']), hx(r['assistant_plan_id']))
            require('M/%s/plan_record_unavailable' % method, pkey in plans)
            plan = plans[pkey]['value']['record']
            if not (r['goal_ref'] == scope['goal_id'] and gpb['assistant_plan_id'] == r['assistant_plan_id'] == plan['assistant_plan_id']
                    and gpb['plan_version'] == r['plan_version'] and gpb['plan_hash'] == r['plan_hash']
                    and plan['approved_version'] == r['plan_version'] and plan['approved_hash'] == r['plan_hash']):
                cap.blocked.append(dict(kind='contradicting_plan_association', operation=gpb['plan_run_id']))
            bound_runs.add(gpb['plan_run_id'])
            cap.associations.append(dict(kind='plan', gpb_key=key, run_key=rkey, run=r, gpb=gpb))
        attach_runs = set()
        for key, item in attaches.items():
            a = item['value']
            attach_runs.add(a['plan_run_id'])
            require('M/%s/plan_absent_reverse_row' % method, a['plan_run_id'] in runs)
            if a['disposition'] != 'no_effect':
                cap.blocked.append(dict(kind='unknown_pending_attach', operation=a['operation_id']))
                continue
            representable = (a['expected_goal_body_sha256'] == body_item['image']['selection']['sha256']
                             and a['expected_goal_control_sha256'] == control_item['image']['selection']['sha256']
                             and a['expected_stop_control_sha256'] == stop_item['image']['selection']['sha256']
                             and a['owner_ref'] == w.plans.owner_id and cap.pending_attach is None)
            if not representable:
                cap.blocked.append(dict(kind='unrepresentable_pending_attach', operation=a['operation_id']))
                continue
            cap.pending_attach = dict(key=key, value=a, run_key=runs[a['plan_run_id']][0])
        for run_id in runs:
            require('M/%s/plan_absent_reverse_row' % method, run_id in bound_runs or run_id in attach_runs)
        # Workflow associations
        wf_bodies = self.by_family(cap, 'workflow_goal_run_body')
        for key, item in wf_bodies.items():
            rec = item['value']['record']
            run_id = rec['identity']['goal_run_id']
            k = w.workflows.keys(scope, run_id)
            control_w = cap.images.get(('workflow_goal_run_control', k['control']))
            head = cap.images.get(('executor_workflow_workflow_head', k['head']))
            birth = cap.images.get(('executor_workflow_workflow_birth', k['birth']))
            require('M/%s/workflow_member_unavailable' % method, control_w is not None and head is not None and birth is not None)
            require('M/%s/workflow_goal_join' % method, rec['identity']['goal_id'] == scope['goal_id'] and rec['identity']['project_id'] == scope['project_id']
                    and rec['original_goal_body']['physical_key'] == gk['body'] and rec['original_goal_body']['storage_instance_id'] == w.storage_id)
            require('M/%s/workflow_join' % method, control_w['value']['record']['identity'] == rec['identity']
                    and head['value']['record']['current_body']['physical_value_sha256'] == item['image']['selection']['sha256']
                    and birth['value']['record']['activation_body']['physical_key'] == key
                    and head['value']['record']['workflow_owner_ref'] == rec['execution_owner_ref'] == w.workflows.owner_id)
            if control_w['value']['record']['pending_operation_id'] is not None:
                cap.blocked.append(dict(kind='unknown_workflow_operation', operation=control_w['value']['record']['pending_operation_id']))
            cap.associations.append(dict(kind='workflow', body_key=key, run_id=run_id, rec=rec))
        # Scheduler sources against the bound Plan run
        for key, item in self.by_family(cap, 'execution_schedule', 'scheduler').items():
            rec = item['value']['record']
            run = runs.get(rec['target_id'])
            require('M/%s/scheduler_unaccounted' % method, run is not None)
            if not (rec['exact_target_version'] == run[1]['value']['record']['plan_version'] and rec['exact_target_hash'] == run[1]['value']['record']['plan_hash']):
                cap.blocked.append(dict(kind='contradicting_schedule', operation=rec['schedule_id']))
        for key, item in self.by_family(cap, 'execution_schedule_run_binding', 'scheduler').items():
            rec = item['value']['record']
            run = runs.get(rec['plan_run_id'])
            require('M/%s/scheduler_unaccounted' % method, run is not None)
            r = run[1]['value']['record']
            if not (rec['assistant_plan_id'] == r['assistant_plan_id'] and rec['plan_version'] == r['plan_version'] and rec['plan_hash'] == r['plan_hash']):
                cap.blocked.append(dict(kind='contradicting_run_binding', operation=rec['schedule_id']))
        for key, item in self.by_family(cap, 'quota_resume_consent', 'scheduler').items():
            require('M/%s/scheduler_unaccounted' % method, item['value']['record']['run_id'] in runs)
        for key, item in self.by_family(cap, 'TEST_ONLY:scheduler_callback_admission').items():
            require('M/%s/scheduler_unaccounted' % method, item['value']['run_id'] in runs)
            if item['value']['state'] == 'admitted':
                cap.blocked.append(dict(kind='unknown_scheduler_callback', operation=item['value']['admission_id']))
        # SIR pending commands
        for key, item in self.by_family(cap, 'sir_command_outcome').items():
            if item['value']['record']['outcome'] == 'acknowledged':
                accepted = cap.images[('TEST_ONLY:sir_accepted_dispatch', key)]['value']
                cap.blocked.append(dict(kind='unknown_sir_command', operation=accepted['identity']['operation_id']))
        # association cardinality and the Goal's own active_run_ref
        if len(cap.associations) > 1:
            cap.blocked.append(dict(kind='contradicting_associations', operation=','.join(sorted(
                a.get('run_id') or a['gpb']['plan_run_id'] for a in cap.associations))))
        elif len(cap.associations) == 1:
            a = cap.associations[0]
            run_ref = a['run_id'] if a['kind'] == 'workflow' else a['gpb']['plan_run_id']
            if body['active_run_ref'] != run_ref:
                cap.blocked.append(dict(kind='contradicting_active_run', operation=run_ref))
            if cap.pending_attach is not None:
                cap.blocked.append(dict(kind='contradicting_pending_attach', operation=cap.pending_attach['value']['operation_id']))
        else:
            require('M/%s/unaccounted_active_run' % method, body['active_run_ref'] is None)
        cap.pending_ids = sorted(set(cap.pending_ids))

    # ---- C6: derivation ------------------------------------------------------------------
    def psel(self, family, key, value):
        return dict(family_id=family, physical_key=key, schema_id=value['schema_id'], schema_version=value.get('schema_version', '1.0.0'),
                    codec_id=MSGPACK, complete_value_sha256=row_sha(value))

    def image_psel(self, cap, family, key):
        item = cap.images[(family, key)]
        return dict(family_id=family, physical_key=key, schema_id=item['value']['schema_id'],
                    schema_version=item['value'].get('schema_version', '1.0.0'), codec_id=item['codec'], complete_value_sha256=sha(item['raw']))

    def selection(self, family, key, value, ref):
        return dict(owner=self.owner_id, physical_key=family + '|' + key, schema_ref=ref, sha256=row_sha(value))

    def manifest(self, cap):
        """Ordered, content-free Selection members: each source image then its issuance origin, in role order."""
        members = []
        for mapping in cap.request['owner_mappings']:
            for image in mapping['sources']:
                members.append(copy.deepcopy(image['selection']))
                members.append(copy.deepcopy(image['origin']))
        return members

    def manifest_parts(self, cap, members):
        scope, mid = cap.request['scope'], cap.migration_id
        whole = sha(S.canonical(members))
        groups, current = [], []
        for member in members:
            trial = current + [member]
            probe = dict(scope=copy.deepcopy(scope), migration_id=mid, ordinal=2 ** 32, part_count=2 ** 32, whole_manifest_sha256=whole, members=trial)
            if current and size(dict(physical_key=self.part_key(cap.scope, mid, 2 ** 32), value=probe)) > PART_CAP:
                groups.append(current)
                current = [member]
            else:
                current = trial
        groups.append(current)
        parts = []
        for n, group in enumerate(groups):
            part = dict(scope=copy.deepcopy(scope), migration_id=mid, ordinal=n, part_count=len(groups), whole_manifest_sha256=whole, members=group)
            self.world.contracts.validate('ManifestPart', part)
            parts.append((self.part_key(cap.scope, mid, n), part))
        return whole, parts

    def derive(self, cap, *, tx_ref, at):
        """Complete destination candidate and write/check set for one atomic transaction (deterministic in cap, tx_ref, at)."""
        w = self.world
        scope, mid = cap.scope, cap.migration_id
        gscope = dict(storage_instance_id=w.storage_id, project_id=scope['project_id'], thread_id=scope['thread_id'], goal_id=scope['goal_id'])
        members = self.manifest(cap)
        whole, parts = self.manifest_parts(cap, members)
        permission = w.permissions.selection(self.permission(ADOPT))
        writes, checks, published, refs = [], [], [], {}
        for (family, key), item in sorted(cap.images.items()):
            checks.append(dict(table=family, key=key, expected=item['version']))
        for (family, key) in [(ORIGINS, split(i['image']['origin']['physical_key'])[1]) for i in cap.images.values()]:
            checks.append(dict(table=family, key=key, expected=w.cell(family, key)['version']))
        exclusion = self.exclusion(scope)
        require('M/commit/exclusion_not_held', exclusion is not None and exclusion['value']['migration_id'] == mid)
        association_refs = []
        for a in cap.associations:
            if a['kind'] == 'plan':
                association_refs += [copy.deepcopy(cap.images[('goal_plan_binding', a['gpb_key'])]['image']['selection']),
                                     copy.deepcopy(cap.images[('assistant_plan_run', a['run_key'])]['image']['selection'])]
            else:
                association_refs.append(copy.deepcopy(cap.images[('workflow_goal_run_body', a['body_key'])]['image']['selection']))
        original_stop = dict(user_stop_epoch=cap.stop['user_stop_epoch'], continuation_epoch=cap.stop['continuation_epoch'],
                             stop_latched=cap.stop['stop_latched'])
        blocked = bool(cap.blocked)
        if blocked:
            domain_selection = copy.deepcopy(cap.expected_domain)
        else:
            # writer domain: install generation 1 or join the installed one (whole-head CAS)
            if not cap.domain_state['installed']:
                descriptors = cap.domain_state['dispatch']['complete_descriptors']
                domain = w.roots.check('producer', BINDING + '#/$defs/WriterDomain', dict(
                    storage_instance_id=w.storage_id, domain_generation=1, native_root_identity=cap.domain_state['dispatch']['native_root_identity'],
                    schema_resources_sha256=w.shared.producer_bank_sha256,
                    complete_original_dispatch_registration_sha256=w.codec.h(cap.domain_state['dispatch']),
                    writers=w.registration.writer_registrations(),
                    original_installation=txrec(self, 'owner.storage.goal_binding_migration.commit.v1', mid, permission, tx_ref, mid, at)))
                dkey = 'goal_execution_writer_domain.v1:%s:epoch:1' % w.binding.storage_key()
                dwrap = w.binding.wrap('StorageWriterDomain', dkey, domain)
                dsel = self.psel(w.binding.DOMAIN, dkey, dwrap)
                hkey = w.binding.head_key()
                head = w.roots.check('producer', BINDING + '#/$defs/WriterDomainHead', dict(
                    storage_instance_id=w.storage_id, domain_generation=1, domain=dsel,
                    original_installation_transaction_id=domain['original_installation']['original_transaction_id']))
                hwrap = w.binding.wrap('StorageWriterDomainHead', hkey, head)
                writes += [w.put(w.binding.DOMAIN, dkey, dwrap), w.put(w.binding.HEAD, hkey, hwrap)]
                published += [self.selection(w.binding.DOMAIN, dkey, dwrap, BINDING + '#/$defs/StorageWriterDomain'),
                              self.selection(w.binding.HEAD, hkey, hwrap, BINDING + '#/$defs/StorageWriterDomainHead')]
                domain_selection = self.selection(w.binding.DOMAIN, dkey, dwrap, BINDING + '#/$defs/StorageWriterDomain')
                checks.append(dict(table=w.binding.HEAD, key=hkey, expected=None))
            else:
                dsel = cap.domain_state['selection']
                hcell = w.cell(w.binding.HEAD, cap.domain_state['head_key'])
                checks.append(dict(table=w.binding.HEAD, key=cap.domain_state['head_key'], expected=hcell['version']))
                checks.append(dict(table=w.binding.DOMAIN, key=dsel['physical_key'], expected=w.cell(w.binding.DOMAIN, dsel['physical_key'])['version']))
                domain_selection = copy.deepcopy(cap.expected_domain)
            # associations (the Goal owner derives them from the authenticated original images)
            associations, active = [], None
            for a in cap.associations:
                if a['kind'] == 'plan':
                    gitem = cap.images[('goal_plan_binding', a['gpb_key'])]
                    associations.append(dict(association_kind='assistant_plan', binding=copy.deepcopy(a['gpb']),
                                             original_binding_source=self.image_psel(cap, 'goal_plan_binding', a['gpb_key']),
                                             original_plan_run_source=self.image_psel(cap, 'assistant_plan_run', a['run_key']),
                                             execution_owner_ref=w.plans.owner_id, execution_owner_epoch=w.plans.owner_epoch,
                                             original_binding_transaction_id=gitem['origin']['issuer']['original_transaction_id']))
                    active = a['gpb']['plan_run_id']
                else:
                    bitem = cap.images[('workflow_goal_run_body', a['body_key'])]
                    associations.append(dict(association_kind='workflow', active_run_ref=a['run_id'],
                                             original_run_source=self.image_psel(cap, 'workflow_goal_run_body', a['body_key']),
                                             execution_owner_ref=w.workflows.owner_id, execution_owner_epoch=a['rec']['execution_owner_epoch'],
                                             original_binding_transaction_id=bitem['origin']['issuer']['original_transaction_id']))
                    active = a['run_id']
            bk = w.binding.keys(scope, 0)
            revision = w.roots.check('producer', BINDING + '#/$defs/BindingRevision', dict(
                scope=gscope, binding_revision=0, previous_revision=None, active_run_ref=active, associations=associations,
                host_execution_owner_ref=cap.stop['host_owner_ref'], host_execution_owner_epoch=cap.stop['host_owner_epoch'], writer_domain=dsel,
                original_goal_birth_or_binding_operation=mid))
            rwrap = w.binding.wrap('StorageBindingRevision', bk['revision'], revision)
            rsel = self.psel(w.binding.REVISION, bk['revision'], rwrap)
            part_sels = [dict(family_id=PART, physical_key=k, schema_id=CONTRACTS + 'ManifestPart', schema_version='1.0.0', codec_id=MSGPACK,
                              complete_value_sha256=row_sha(p)) for k, p in parts]
            origin = w.roots.check('producer', BINDING + '#/$defs/BindingOrigin', dict(
                scope=gscope, binding_revision=0, issued_revision_key=bk['revision'], issued_revision_sha256=rsel['complete_value_sha256'],
                before_control_sha256=None, original_goal_body_sha256=cap.body_item['image']['selection']['sha256'],
                original_goal_control_sha256=cap.control_item['image']['selection']['sha256'],
                original_stop_control_sha256=cap.stop_item['image']['selection']['sha256'], original_source_members=part_sels,
                issuer=txrec(w.goal, 'owner.goal.execution_binding.adopt_existing.v1', mid, permission, tx_ref, mid, at)))
            owrap = w.binding.wrap('StorageBindingOrigin', bk['origin'], origin)
            osel = self.psel(w.binding.ORIGIN, bk['origin'], owrap)
            base_control = dict(scope=gscope, control_epoch=0, binding_revision=0, current_revision=rsel, current_origin=osel, writer_domain=dsel,
                                pending=None)
            pending = None
            if cap.pending_attach is not None:
                a = cap.pending_attach['value']
                candidate = dict(scope=gscope, binding_revision=1, previous_revision=rsel, active_run_ref=a['plan_run_id'],
                                 associations=[dict(association_kind='assistant_plan', binding=copy.deepcopy(a['binding']),
                                                    original_binding_source=self.image_psel(cap, 'TEST_ONLY:plan_pending_attach', cap.pending_attach['key']),
                                                    original_plan_run_source=self.image_psel(cap, 'assistant_plan_run', cap.pending_attach['run_key']),
                                                    execution_owner_ref=a['owner_ref'], execution_owner_epoch=a['owner_epoch'],
                                                    original_binding_transaction_id=cap.images[('TEST_ONLY:plan_pending_attach', cap.pending_attach['key'])]
                                                    ['origin']['issuer']['original_transaction_id'])],
                                 host_execution_owner_ref=cap.stop['host_owner_ref'], host_execution_owner_epoch=cap.stop['host_owner_epoch'],
                                 writer_domain=dsel, original_goal_birth_or_binding_operation=a['operation_id'])
                pending = dict(operation_id=a['operation_id'], operation=a['operation'],
                               expected_control_sha256=row_sha(w.binding.wrap('StorageBindingControl', bk['control'], base_control)),
                               expected_goal_body_sha256=a['expected_goal_body_sha256'], expected_goal_control_sha256=a['expected_goal_control_sha256'],
                               expected_stop_control_sha256=a['expected_stop_control_sha256'], expected_writer_domain=dsel, candidate=candidate,
                               original_owner_ref=a['owner_ref'], original_owner_epoch=a['owner_epoch'])
            control = w.roots.check('producer', BINDING + '#/$defs/BindingControl', dict(base_control, pending=pending))
            cwrap = w.binding.wrap('StorageBindingControl', bk['control'], control)
            for family, key, value in ((w.binding.REVISION, bk['revision'], rwrap), (w.binding.ORIGIN, bk['origin'], owrap),
                                       (w.binding.CONTROL, bk['control'], cwrap)):
                writes.append(w.put(family, key, value))
                published.append(self.selection(family, key, value, BINDING + '#/$defs/Storage' + {
                    w.binding.REVISION: 'BindingRevision', w.binding.ORIGIN: 'BindingOrigin', w.binding.CONTROL: 'BindingControl'}[family]))
            # body control v1 -> v2 (every original field and pending object preserved; cancellation_pending per the old disposition)
            old = cap.control
            if old['schema_id'] == 'pm.goal.body_control.v1':
                v2 = dict(old, schema_id='pm.goal.body_control.v2', cancellation_pending=None)
                v2wrap = w.roots.check('producer', CANCEL + '#/$defs/StorageBodyControlV2',
                                       dict(schema_id='pm.storage_value.goal_body_control.v2', schema_version='2.0.0', record=v2))
                gck = w.goal.keys(scope)['control']
                writes.append(w.put(w.goal.CONTROL, gck, v2wrap, expected=cap.control_item['version']))
                checks = [c for c in checks if not (c['table'] == w.goal.CONTROL and c['key'] == gck)]
                published.append(self.selection(w.goal.CONTROL, gck, v2wrap, CANCEL + '#/$defs/StorageBodyControlV2'))
            else:
                published.append(dict(owner=self.owner_id, physical_key=w.goal.CONTROL + '|' + w.goal.keys(scope)['control'],
                                      schema_ref=CANCEL + '#/$defs/StorageBodyControlV2', sha256=cap.control_item['image']['selection']['sha256']))
            # the original host Stop authority is mapped with its unchanged value (whole-source CAS keeps it)
            published.append(dict(owner=self.owner_id, physical_key=w.host_stop.FAMILY + '|' + w.host_stop.key(scope),
                                  schema_ref=CANCEL + '#/$defs/StorageStopControl', sha256=cap.stop_item['image']['selection']['sha256']))
            refs['revision'], refs['origin'], refs['control'] = bk['revision'], bk['origin'], bk['control']
        result = dict(scope=copy.deepcopy(cap.request['scope']), migration_id=mid, disposition='blocked_unresolved' if blocked else 'enrolled',
                      capture_sha256=sha(S.canonical(cap.request)), original_stop=original_stop, original_association_refs=association_refs,
                      pending_operation_ids=sorted(cap.pending_ids), prior_receipts=copy.deepcopy(cap.receipts), published_members=published,
                      writer_domain=domain_selection)
        w.contracts.validate('MigrationResult', result)
        rkey = self.result_key(scope, mid)
        for key, part in parts:
            writes.append(w.put(PART, key, part))
        writes.append(w.put(RESULT, rkey, result))
        writes.append(dict(table=EXCLUSION, key=w.exclusion_key(scope), expected=exclusion['version'], delete=True))
        return dict(result=result, writes=writes, checks=checks, parts=parts, whole=whole, result_key=rkey, refs=refs, members=members)

    # ---- C6: commit / recover / read_result ----------------------------------------------
    def commit(self, request, *, lose_ack=False):
        """owner.storage.goal_binding_migration.commit.v1 (M7, with M8 replay)."""
        w = self.world
        with self.call('commit', dict(request_sha256=A.observation_digest(request))) as slot:
            w.contracts.validate('MigrationRequest', request)
            selector = dict(scope=copy.deepcopy(request['scope']), migration_id=request['migration_id'])
            scope, mid = self.scope_of(selector), request['migration_id']
            stored = w.value(RESULT, self.result_key(scope, mid))
            if stored is not None:
                require('M/commit/replay_conflict', stored['capture_sha256'] == sha(S.canonical(request)))
                generation = w.storage.cell_generation
                result = self.read_result(selector, actor=self.owner_id)
                require('M/commit/replay_no_effect', w.storage.cell_generation == generation)
                slot.set(dict(replay=True))
                return result
            require('M/commit/permission', self.allowed(ADOPT))
            exclusion = self.exclusion(scope)
            require('M/commit/exclusion_not_held', exclusion is not None and exclusion['value']['migration_id'] == mid)
            cap = self.read_all(selector, method='commit')
            require('M/commit/independent_capture', same(cap.request, request))
            tx_ref, at = uid('TEST_ONLY:migration-tx'), self.clock.now()
            candidate = self.derive(cap, tx_ref=tx_ref, at=at)
            self.at('commit', 'after_derive')
            try:
                final = self._read_once(selector, 'commit_final')
            except Yield:
                raise Refusal('M/commit_final/stop_changed')
            require('M/commit/final_capture', same(final.request, request))
            require('M/commit/final_maintenance', same(final.maintenance, cap.maintenance))
            require('M/commit/final_permission', self.allowed(ADOPT))
            again = self.derive(final, tx_ref=tx_ref, at=at)
            require('M/commit/final_candidate', same(again['writes'], candidate['writes']) and same(again['checks'], candidate['checks']))
            for write in candidate['writes']:
                if write.get('delete'):
                    continue
                require('M/commit/stored_part_cap', size(write['value']) <= PART_CAP)
                require('M/commit/operation_cap', size(dict(physical_key=write['key'], value=write['value'])) <= PART_CAP)
                if write.get('expected') is None:
                    require('M/commit/destination_present', w.cell(write['table'], write['key']) is None)
            tx = w.storage.transact(candidate['writes'], checks=candidate['checks'], mcut_before='before_migration_tx',
                                    mcut_after='after_migration_tx')
            for write in candidate['writes']:
                if not write.get('delete'):
                    require('M/commit/readback', same(w.value(write['table'], write['key']), write['value']))
            self._issue(None, dict(qualification=QUALIFICATION, migration_id=mid, tx=tx['tx_id'],
                                   result_sha256=row_sha(candidate['result'])), kind='migration_result')
            slot.set(dict(tx=tx['tx_id'], disposition=candidate['result']['disposition']))
            if lose_ack:
                raise Refusal('M/commit/ack_lost')
            return copy.deepcopy(candidate['result'])

    def recover(self, selector):
        """owner.storage.goal_binding_migration.recover.v1: the immutable result decides; never retries birth."""
        w = self.world
        with self.call('recover', dict(selector=selector)) as slot:
            w.contracts.validate('MigrationSelector', selector)
            scope, mid = self.scope_of(selector), selector['migration_id']
            stored = w.value(RESULT, self.result_key(scope, mid))
            if stored is not None:
                result = self.read_result(selector, actor=self.owner_id)
                slot.set(dict(recovered=True))
                return result
            for family in (w.binding.REVISION, w.binding.ORIGIN, w.binding.CONTROL):
                require('M/recover/ambiguous_destination', not any(k.startswith('%s.v1:%s:' % (family, scoped_key(scope)))
                                                                  for k in w.storage.cells.get(family, {})))
            require('M/recover/ambiguous_manifest', not any(k.startswith('%s.v1:%s:%s:' % (PART, scoped_key(scope), hx(mid)))
                                                            for k in w.storage.cells.get(PART, {})))
            exclusion = self.exclusion(scope)
            if exclusion is not None and exclusion['value']['migration_id'] == mid:
                self.release_exclusion(scope)
            raise Refusal('M/recover/not_committed')

    def read_result(self, selector, *, actor=None, helper=None):
        """owner.storage.goal_binding_migration.read_result.v1: passive original metadata audit."""
        w = self.world
        with self.call('read_result', dict(selector=selector)) as slot:
            w.contracts.validate('MigrationSelector', selector)
            scope, mid = self.scope_of(selector), selector['migration_id']
            actor = actor or self.owner_id
            generation = w.storage.cell_generation

            def predicate():
                require('M/read_result/audit_permission', actor == self.owner_id and self.allowed(ADOPT) or self.allowed(AUDIT, actor))
                require('M/read_result/deleted', w.maintenance.scope_state(scope)['deletion_requested'] is False)
                stored = w.value(RESULT, self.result_key(scope, mid))
                require('M/read_result/result_unavailable', stored is not None)
                w.contracts.validate('MigrationResult', stored)
                require('M/read_result/result_identity', same(stored['scope'], selector['scope']) and stored['migration_id'] == mid)
                prefix = '%s.v1:%s:%s:' % (PART, scoped_key(scope), hx(mid))
                parts = sorted((w.value(PART, k) for k in w.storage.cells.get(PART, {}) if k.startswith(prefix)), key=lambda p: p['ordinal'])
                require('M/read_result/manifest_unavailable', bool(parts))
                for n, part in enumerate(parts):
                    w.contracts.validate('ManifestPart', part)
                    require('M/read_result/manifest_identity', same(part['scope'], selector['scope']) and part['migration_id'] == mid)
                    require('M/read_result/manifest_ordinal', part['ordinal'] == n and part['part_count'] == len(parts))
                    require('M/read_result/manifest_part_cap', size(dict(physical_key=self.part_key(scope, mid, n), value=part)) <= PART_CAP)
                members = [m for p in parts for m in p['members']]
                require('M/read_result/manifest_commitment', all(p['whole_manifest_sha256'] == sha(S.canonical(members)) for p in parts))
                origin_value = None
                for member in stored['published_members']:
                    family, key = split(member['physical_key'])
                    if family in IMMUTABLE_FAMILIES:
                        value = w.value(family, key)
                        require('M/read_result/destination_unavailable', value is not None)
                        require('M/read_result/destination_hash', row_sha(value) == member['sha256'])
                        if family == 'goal_execution_binding_origin':
                            origin_value = value
                if stored['disposition'] == 'enrolled':
                    # the immutable BindingOrigin selects the exact original manifest parts
                    require('M/read_result/origin_member', origin_value is not None)
                    anchors = origin_value['record']['original_source_members']
                    require('M/read_result/manifest_anchor', [a['physical_key'] for a in anchors] == [self.part_key(scope, mid, n) for n in range(len(parts))]
                            and [a['complete_value_sha256'] for a in anchors] == [row_sha(p) for p in parts])
                else:
                    require('M/read_result/blocked_unpublished', stored['published_members'] == [])
                return stored
            result = predicate()
            if helper is not None:
                helper(self)
            again = predicate()
            require('M/read_result/final', same(result, again))
            require('M/read_result/passive', w.storage.cell_generation == generation)
            slot.set(dict(disposition=result['disposition']))
            return copy.deepcopy(result)

    def manifest_parts_of(self, scope, mid):
        prefix = '%s.v1:%s:%s:' % (PART, scoped_key(scope), hx(mid))
        return sorted(((k, self.world.value(PART, k)) for k in self.world.storage.cells.get(PART, {}) if k.startswith(prefix)),
                      key=lambda kv: kv[1]['ordinal'])

    # ---- M9: withdrawal and reinstall ------------------------------------------------------
    def result_selection(self, scope, mid):
        stored = self.world.value(RESULT, self.result_key(scope, mid))
        return None if stored is None else self.selection(RESULT, self.result_key(scope, mid), stored, CONTRACTS + 'MigrationResult')

    def current_domain_selection(self):
        w = self.world
        if w.binding.domain_generation == 0:
            sel, _ = self.writer_domain_source('withdraw')
            return sel
        dsel, domain, _ = w.binding.domain_selection()
        return dict(owner=w.binding.owner_id, physical_key=w.binding.DOMAIN + '|' + dsel['physical_key'], schema_ref=BINDING + '#/$defs/StorageWriterDomain',
                    sha256=dsel['complete_value_sha256'])

    def withdraw(self, request):
        """owner.storage.goal_binding_migration.withdraw.v1 (M9)."""
        w = self.world
        with self.call('withdraw', dict(request=request)) as slot:
            w.contracts.validate('MigrationWithdrawalRequest', request)
            scope, mid, wid = self.scope_of(request), request['migration_id'], request['withdrawal_id']
            key = self.withdrawal_key(scope, wid)
            stored = w.value(WITHDRAWAL, key)
            if stored is not None:
                require('M/withdraw/replay_conflict', stored['original_result'] == request['expected_original_result']
                        and stored['migration_id'] == mid and same(stored['fenced_writer_domain'], request['expected_writer_domain']))
                slot.set(dict(replay=True))
                return copy.deepcopy(stored)
            require('M/withdraw/permission', self.allowed(WITHDRAW))
            original = self.result_selection(scope, mid)
            require('M/withdraw/original_result', same(request['expected_original_result'], original))
            if original is not None:
                result = self.read_result(dict(scope=request['scope'], migration_id=mid), actor=self.owner_id)
                preserved = list(result['pending_operation_ids'])
                require('M/withdraw/writer_domain', same(request['expected_writer_domain'], result['writer_domain'])
                        and (result['disposition'] == 'blocked_unresolved' or same(result['writer_domain'], self.current_domain_selection())))
            else:
                require('M/withdraw/writer_domain', same(request['expected_writer_domain'], self.current_domain_selection()))
                preserved = self.pending_now(scope)
            value = dict(scope=copy.deepcopy(request['scope']), migration_id=mid, withdrawal_id=wid, disposition='withdrawn',
                         original_result=copy.deepcopy(original), fenced_writer_domain=copy.deepcopy(request['expected_writer_domain']),
                         preserved_pending_operation_ids=sorted(set(preserved)))
            w.contracts.validate('MigrationWithdrawalResult', value)
            self.at('withdraw', 'final')
            require('M/withdraw/final_original_result', same(self.result_selection(scope, mid), original))
            writes = [w.put(WITHDRAWAL, key, value)]
            require('M/withdraw/operation_cap', size(dict(physical_key=key, value=value)) <= PART_CAP)
            if original is not None and w.binding.domain_generation > 0 and not w.binding.domain_withdrawn and \
                    w.value(RESULT, self.result_key(scope, mid))['disposition'] == 'enrolled':
                writes.append(w.binding.cutoff_write(wid, mid))
            exclusion = self.exclusion(scope)
            if exclusion is not None and exclusion['value']['migration_id'] == mid:
                writes.append(dict(table=EXCLUSION, key=w.exclusion_key(scope), expected=exclusion['version'], delete=True))
            w.storage.transact(writes, mcut_before='before_withdrawal_tx', mcut_after='after_withdrawal_tx')
            slot.set(dict(withdrawn=True))
            return copy.deepcopy(value)

    def pending_now(self, scope):
        """Genuine pending operations as the owners hold them now (for an uncommitted withdrawal)."""
        w = self.world
        out = []
        for role in ROLES:
            owner = w.owner_for(role)
            if role == 'host_stop':
                continue
            if role == 'scheduler':
                runs = {w.plans.decoded('assistant_plan_run', k)['record']['plan_run_id'] for k in w.plans.run_keys(scope)}
                handle = owner.enumerate_for_migration(scope, sorted(runs))
            else:
                handle = owner.enumerate_for_migration(scope)
            _, mapping = A.acquire(w.registry, owner.owner_id, owner.role, handle)
            out += mapping['pending_operations']
        return out

    def reinstall(self, scopes):
        """A new genuine writer-domain admission (next generation) that remaps each enrolled binding with complete source mapping."""
        w = self.world
        with self.call('reinstall', dict(scopes=scopes)) as slot:
            require('M/reinstall/permission', self.allowed(REINSTALL))
            gen = w.binding.domain_generation
            require('M/reinstall/domain_not_withdrawn', gen > 0 and w.binding.domain_withdrawn)
            permission = w.permissions.selection(self.permission(REINSTALL))
            w.registration.register_all(generation=gen + 1)
            state = w.registration.state()
            dispatch = dict(domain='pm.goal.execution_dispatch.v1', storage_instance_id=w.storage_id, native_root_identity=state['root_identity'],
                            complete_descriptors=w.registration.descriptors())
            op, tx_ref = uid('TEST_ONLY:reinstall'), uid('TEST_ONLY:reinstall-tx')
            domain = w.roots.check('producer', BINDING + '#/$defs/WriterDomain', dict(
                storage_instance_id=w.storage_id, domain_generation=gen + 1, native_root_identity=state['root_identity'],
                schema_resources_sha256=w.shared.producer_bank_sha256, complete_original_dispatch_registration_sha256=w.codec.h(dispatch),
                writers=w.registration.writer_registrations(),
                original_installation=transaction_record(self, 'owner.goal.execution_binding.install_writer_domain.v1', op, permission, tx_ref, op)))
            dkey = 'goal_execution_writer_domain.v1:%s:epoch:%d' % (w.binding.storage_key(), gen + 1)
            dwrap = w.binding.wrap('StorageWriterDomain', dkey, domain)
            dsel = self.psel(w.binding.DOMAIN, dkey, dwrap)
            hkey = w.binding.head_key()
            hcell = w.cell(w.binding.HEAD, hkey)
            head = w.roots.check('producer', BINDING + '#/$defs/WriterDomainHead', dict(
                storage_instance_id=w.storage_id, domain_generation=gen + 1, domain=dsel,
                original_installation_transaction_id=domain['original_installation']['original_transaction_id']))
            writes = [w.put(w.binding.DOMAIN, dkey, dwrap), w.put(w.binding.HEAD, hkey, w.binding.wrap('StorageWriterDomainHead', hkey, head),
                                                                   expected=hcell['version'])]
            for scope in scopes:
                ccell = w.cell(w.binding.CONTROL, w.binding.keys(scope)['control'])
                require('M/reinstall/binding_unavailable', ccell is not None)
                control = ccell['value']['record']
                rev_cell = w.cell(w.binding.REVISION, control['current_revision']['physical_key'])
                org_cell = w.cell(w.binding.ORIGIN, control['current_origin']['physical_key'])
                require('M/reinstall/revision_join', row_sha(rev_cell['value']) == control['current_revision']['complete_value_sha256'])
                n = control['binding_revision'] + 1
                bk = w.binding.keys(scope, n)
                revision = dict(rev_cell['value']['record'], binding_revision=n, previous_revision=control['current_revision'], writer_domain=dsel,
                                original_goal_birth_or_binding_operation=op)
                w.roots.check('producer', BINDING + '#/$defs/BindingRevision', revision)
                rwrap = w.binding.wrap('StorageBindingRevision', bk['revision'], revision)
                origin = w.roots.check('producer', BINDING + '#/$defs/BindingOrigin', dict(
                    scope=control['scope'], binding_revision=n, issued_revision_key=bk['revision'], issued_revision_sha256=row_sha(rwrap),
                    before_control_sha256=row_sha(ccell['value']), original_goal_body_sha256=phys_sha(w.cell(w.goal.BODY, w.goal.keys(scope)['body'])['value']),
                    original_goal_control_sha256=phys_sha(w.cell(w.goal.CONTROL, w.goal.keys(scope)['control'])['value']),
                    original_stop_control_sha256=phys_sha(w.cell(w.host_stop.FAMILY, w.host_stop.key(scope))['value']),
                    original_source_members=[control['current_revision'], control['current_origin'], self.psel(w.binding.CONTROL, w.binding.keys(scope)['control'],
                                                                                                                ccell['value'])],
                    issuer=transaction_record(w.goal, 'owner.goal.execution_binding.install_writer_domain.v1', op, permission, tx_ref, op)))
                owrap = w.binding.wrap('StorageBindingOrigin', bk['origin'], origin)
                new_control = dict(control, control_epoch=NR.uint64(control['control_epoch'] + 1, 'M/reinstall/control_epoch'), binding_revision=n,
                                   current_revision=self.psel(w.binding.REVISION, bk['revision'], rwrap),
                                   current_origin=self.psel(w.binding.ORIGIN, bk['origin'], owrap), writer_domain=dsel)
                w.roots.check('producer', BINDING + '#/$defs/BindingControl', new_control)
                writes += [w.put(w.binding.REVISION, bk['revision'], rwrap), w.put(w.binding.ORIGIN, bk['origin'], owrap),
                           w.put(w.binding.CONTROL, w.binding.keys(scope)['control'],
                                 w.binding.wrap('StorageBindingControl', w.binding.keys(scope)['control'], new_control), expected=ccell['version'])]
            tx = w.write(writes)
            slot.set(dict(tx=tx['tx_id'], generation=gen + 1))
            return dsel


def migration_world(work, **kw):
    """A MigrationWorld with its coordinator registered and permissioned."""
    w = B.MigrationWorld(work, **kw)
    attach_coordinator(w)
    return w


def attach_coordinator(w, roster=None):
    owners = (w.value(B.ROSTER, 'roster') or {}).get('owners', {})
    kw = {}
    if 'coordinator' in owners:
        kw = dict(owner_id=owners['coordinator']['owner_id'], owner_epoch=owners['coordinator']['owner_epoch'])
    w.coordinator = Coordinator(w, **kw)
    if 'coordinator' not in owners:
        cell = w.cell(B.ROSTER, 'roster')
        value = copy.deepcopy(cell['value'])
        value['owners']['coordinator'] = dict(owner_id=w.coordinator.owner_id, owner_epoch=w.coordinator.owner_epoch)
        for action in (ADOPT, AUDIT, WITHDRAW, REINSTALL):
            w.coordinator.permission(action)
        value['constants']['permissions'] = dict(w.constants)
        w.write([w.put(B.ROSTER, 'roster', value, expected=cell['version'])])
    return w.coordinator


def open_world(work, **kw):
    w = B.MigrationWorld.open(work, **kw)
    attach_coordinator(w)
    return w


def selector(scope, migration_id=None):
    return dict(scope=copy.deepcopy(scope), migration_id=migration_id or uid('TEST_ONLY:migration'))
