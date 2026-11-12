#!/usr/bin/env python3
"""DG-INT TEST_ONLY cross-family world: the DG-S S1 Start owner and the DG-R R2
D06 owners issuing in ONE test-owner Storage and ONE owner registry.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Stream E, DG integration (2026-11-12). The DG family lanes built the Start
source owner (DG-S, ``pm_goal_dg_s_start``) and the positive D06/D05/Goal/
Stop/FileSafe/process owners (DG-R, ``pm_goal_dg_r_world``) on separate
Storages. The cross-family groups (P7 legacy current branches, CF-10/P4
whole-source admission) need both originals in the same Storage, so that a
single generic prefix carries the S1 Start Event and the R2 cancellation
Event, and every retained selector resolves in one place.

How the two owners meet, without either lane's file being edited:

* ``S1CancelWorld`` builds a DG-S ``StartWorld`` first. Its Storage, registry
  and recorder become the DG-R world's; the run scope, workgraph identity and
  workflow owner are the S1 context's. The workflow owner epoch is chosen as 1
  before any issuance, the value the R2 owners already use, so every owner
  epoch the two families copy agrees.
* ``_birth`` and ``_start`` run S1's own issuance (``issue_sources`` then
  ``owner.workflow.activation.commit_start.v2``) and then *adopt* what S1
  published: the retained native Start (eight wrappers) is acquired through
  S1's own retained reader (``pm_goal_dg_s_readers.original_started``), the
  native before/after body and control through S1's native owner, and the D01
  head through S1's D01 pointer. ``AdoptedCustody`` keeps those exact bytes as
  the R2 resolver's custody records; each must equal the Storage cell, so a
  substituted cell or a value that S1 did not publish refuses
  (``adopt/cell_mismatch``, ``adopt/unpublished``).
* The R2 D06 native CAS and D01 publication follow S1's native model:
  immutable per-revision body/control cells plus the ``workflow_goal_run_current``
  pointer, and immutable per-revision D01 heads plus the
  ``executor_workflow_current_pointer``, each moved by CAS in the same Storage
  transaction as the new cells. So S1's own readers see native truth advance
  (current Start refuses after cancellation) while retained history survives.

Everything else in the D06 chain (Goal cancel, SchedulerStop, effects, D05
SafeStop, D06 candidate/intent/control/result/origins, the cancelled v3 Event
as a first barrier) is DG-R's issuance, unchanged.
"""
from __future__ import annotations

import copy
import tempfile
import uuid
from pathlib import Path

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_dg_s_world as SW
import pm_goal_dg_s_start as ST
import pm_goal_dg_s_readers as SR
import pm_goal_dg_r_world as RW
import pm_goal_dg_cf2_world as C2W

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
START_OP = 'TEST_ONLY:start-op:dg-int:1'
Refusal = RW.Refusal
guard = RW.guard


def start_request(sw, op=START_OP):
    return dict(scope=copy.deepcopy(sw.ctx.scope), operation_id=op, causation_ref='TEST_ONLY:accepted-start:dg-int')


def adopt_into(owner, family, key, value, *, root=None, realm=None, current=True):
    """Keep ``value`` as ``owner``'s custody record of a cell another family's owner wrote.

    A current adoption requires the Storage cell at (family, key) to hold exactly
    ``value`` (pack-backed cells are read through their SP-337 pack) in a
    committed transaction. A historical adoption (an earlier version at a
    mutable key, acquired from the issuing owner's own custody) requires the
    current version to be adopted first by the same owner, so the R2 resolver's
    latest-version check still compares the live cell with this owner's latest
    record.
    """
    w = owner.world
    cell = w.storage.cell(family, key)
    guard('adopt/unpublished', cell is not None and cell.get('tx') is not None)
    sha = RW.physical_sha256(value)
    if current:
        at_rest = SW.read_value(w.storage, family, key, 'adopt/pack')['value']
        guard('adopt/cell_mismatch', RW.physical_sha256(at_rest) == sha)
    else:
        latest = owner.current.get((family, key))
        guard('adopt/historical_without_current', latest is not None and latest[0].sha256 != sha)
    if root is not None:
        w.roots.validate(realm, root, value, 'adopt/' + family)
    existing = w.issued.get((family, key, sha))
    if existing is not None:
        guard('adopt/second_custodian', existing.owner_id == owner.owner_id)
        return existing
    with owner.recorder.call(owner.owner_id, 'adopt:' + family, dict(family=family, key=key, current=current,
                                                                      source_owner=owner.source_owner_id)):
        handle = owner._issue(root, copy.deepcopy(value), kind=family)
        stored = RW.Stored(family, key, copy.deepcopy(value), cell['tx'] if current else None, owner.owner_id,
                           handle, root, realm, w.sid)
        owner.by_sha[stored.sha256] = stored
        owner.history[(family, key, stored.sha256)] = stored
        if current:
            owner.current[(family, key)] = (stored, cell['version'])
        w.issued[(family, key, stored.sha256)] = stored
        return stored


def record_version(owner, family, key, value, tx_id, root=None, realm='native_consumer'):
    """Register a version ``owner`` itself just wrote (CAS'd pointer, new cell) as its latest custody record."""
    w = owner.world
    handle = owner._issue(root, copy.deepcopy(value), kind=family)
    stored = RW.Stored(family, key, copy.deepcopy(value), tx_id, owner.owner_id, handle, root, realm, w.sid)
    owner.by_sha[stored.sha256] = stored
    owner.history[(family, key, stored.sha256)] = stored
    owner.current[(family, key)] = (stored, w.storage.cell(family, key)['version'])
    w.issued[(family, key, stored.sha256)] = stored
    return stored


class AdoptedCustody(RW.PhysOwner):
    """R2-side custody view of cells another family's owner published. It never issues."""

    def __init__(self, world, role, source_owner_id):
        super().__init__(world, role)
        self.source_owner_id = source_owner_id

    def adopt(self, family, wrapper, realm, root, key=None):
        return adopt_into(self, family, key if key is not None else wrapper['physical_key'], wrapper,
                          root=root, realm=realm)


class S1NativeOwner(RW.NativeOwner):
    """R2 native participant over S1's native model (per-revision cells + current pointer)."""

    def __init__(self, world, s1_native):
        super().__init__(world)
        self.s1 = s1_native
        self.source_owner_id = s1_native.owner_id

    def adopt(self, wrapper, family, root, key=None):
        return adopt_into(self, family, key if key is not None else wrapper['physical_key'], wrapper,
                          root=root, realm='native_consumer')

    def prepare_body(self, prior, status, knob=None):
        wrapper = super().prepare_body(prior, status, knob=None)
        wrapper['physical_key'] = self.s1.body_key(wrapper['record']['revision'])
        if knob is not None:
            knob(wrapper)
        self.world.roots.validate('native_consumer', RW.WA + 'GoalRunBodyPhysical', wrapper, 'issue/native_candidate')
        return wrapper

    def prepare_control(self, prior, body_wrapper, knob=None):
        wrapper = super().prepare_control(prior, body_wrapper, knob=None)
        wrapper['physical_key'] = self.s1.control_key(body_wrapper['record']['revision'])
        if knob is not None:
            knob(wrapper)
        self.world.roots.validate('native_consumer', RW.WA + 'GoalRunControlPhysical', wrapper,
                                  'issue/native_candidate')
        return wrapper

    def commit(self, body_wrapper, control_wrapper, prior_body, prior_control):
        """Native CAS on S1's current pointer: new immutable cells and the pointer move in one transaction."""
        w = self.world
        current = self.s1.current()
        A.require('native/cas_body', current['pointer']['value']['body_key'] == prior_body.key and
                  RW.physical_sha256(current['body']) == prior_body.sha256)
        A.require('native/cas_control', current['pointer']['value']['control_key'] == prior_control.key and
                  RW.physical_sha256(current['control']) == prior_control.sha256)
        with self.recorder.call(self.owner_id, 'native_cas:s1_model', dict(revision=body_wrapper['record']['revision'])):
            tx = w.storage.transact([
                dict(table=prior_body.family, key=body_wrapper['physical_key'], expected=None, value=body_wrapper),
                dict(table=prior_control.family, key=control_wrapper['physical_key'], expected=None,
                     value=control_wrapper),
                dict(table='workflow_goal_run_current', key=self.s1.current_key(),
                     expected=current['pointer']['version'],
                     value=dict(qualification=QUALIFICATION, body_key=body_wrapper['physical_key'],
                                control_key=control_wrapper['physical_key'],
                                revision=body_wrapper['record']['revision']))])
            out = []
            for family, wrapper, root in ((prior_body.family, body_wrapper, RW.WA + 'GoalRunBodyPhysical'),
                                          (prior_control.family, control_wrapper, RW.WA + 'GoalRunControlPhysical')):
                handle = self._issue(root, copy.deepcopy(wrapper), kind=family)
                stored = RW.Stored(family, wrapper['physical_key'], copy.deepcopy(wrapper), tx['tx_id'], self.owner_id,
                                   handle, root, 'native_consumer', w.sid)
                self.by_sha[stored.sha256] = stored
                self.history[(family, stored.key, stored.sha256)] = stored
                self.current[(family, stored.key)] = (stored, w.storage.cell(family, stored.key)['version'])
                w.issued[(family, stored.key, stored.sha256)] = stored
                out.append(stored)
        self.revision, self.status = body_wrapper['record']['revision'], body_wrapper['record']['status']
        return out[0], out[1]


class S1D01Owner(RW.PhysOwner):
    """R2 D01 participant over S1's D01 model: per-revision heads + the current pointer."""

    def __init__(self, world, s1_d01, edition):
        super().__init__(world, 'd01_workflow_source')
        self.s1, self.edition = s1_d01, edition
        self.source_owner_id = s1_d01.owner_id

    def adopt(self, wrapper, family, root, key=None):
        return adopt_into(self, family, key if key is not None else wrapper['physical_key'], wrapper,
                          root=root, realm='native_consumer')

    def publish_head(self, revision, overlay, knob=None):
        """Issue the immutable head at S1's per-revision key and CAS the D01 pointer in one transaction."""
        w = self.world
        fam = ST.d01_families(self.edition)
        family = fam['workflow_head']
        key = self.s1.head_key(revision)
        wrapper = self.build_wrapper(family, 'native_consumer', RW.WO + 'StorageWorkflowHead', key, overlay, knob=knob)
        pointer = w.storage.cell(fam['pointer'], self.s1.pointer_key())
        A.require('d01/pointer_unavailable', pointer is not None)
        A.require('d01/pointer_revision', pointer['value']['record']['revision'] + 1 == revision)
        new_pointer = copy.deepcopy(pointer['value'])
        head_sel = dict(storage_instance_id=w.sid, family_id=family, physical_key=key, schema_id=wrapper['schema_id'],
                        schema_version=wrapper['schema_version'], physical_value_sha256=RW.physical_sha256(wrapper))
        op = wrapper['record']['last_update']['physical_key']
        new_pointer['record'].update(revision=revision, workflow_head=head_sel, pending_operation_id=None)
        if 'last_origin_operation_id' in new_pointer['record']:
            # the D01 origin the R2 owner issues next for this publication (RW.CancelWorld.continue_d06)
            new_pointer['record']['last_origin_operation_id'] = 'TEST_ONLY:op:d01:' + w.ops['d06'][-12:]
        self.edition.bank.validate(self.edition.d01 + '#/$defs/StorageCurrentPointer', new_pointer, 'd01/new_pointer')
        with self.recorder.call(self.owner_id, 'issue:' + family, dict(family=family, key=key, pointer=True,
                                                                       update=op)) as slot:
            tx = w.storage.transact([dict(table=family, key=key, expected=None, value=wrapper),
                                     dict(table=fam['pointer'], key=self.s1.pointer_key(),
                                          expected=pointer['version'], value=new_pointer)])
            stored = record_version(self, family, key, wrapper, tx['tx_id'], RW.WO + 'StorageWorkflowHead')
            if self.current.get((fam['pointer'], self.s1.pointer_key())) is not None:
                record_version(self, fam['pointer'], self.s1.pointer_key(), new_pointer, tx['tx_id'])
            slot.set(dict(family=family, sha256=stored.sha256, tx_id=tx['tx_id']))
            return stored


class S1CancelWorld(RW.CancelWorld):
    """DG-R's R2 positive cancellation over a Start issued by DG-S's S1 owner, in one Storage.

    cfg keys as ``CancelWorld`` (``effects``, ``knobs``, ``stop_after``) plus
    ``s1_edits`` (S1 issuance edits) and ``project``/``goal``/``run`` ids.
    ``start='no_start'`` and ``terminal`` are not offered: the S1 owner always
    publishes a Start, and terminal preservation is DG-R's own R2 corpus.
    """

    def __init__(self, cfg=None, base=None):
        self.cfg = dict(cfg or {})
        guard('dg_int/start_kind', self.cfg.get('start', 'started') == 'started' and not self.cfg.get('terminal'))
        self.knobs = self.cfg.get('knobs', {})
        RW.World.CURRENT = self
        self.tmp = Path(tempfile.mkdtemp(prefix='dgint-world-', dir=base))
        ids = {k: self.cfg[k] for k in ('project', 'goal', 'run') if k in self.cfg}
        sw = ST.StartWorld(self.tmp / 's1', SW.v3_edition(),
                           segment_target_bytes=int(self.cfg.get('segment_target_bytes', 65536)), **ids)
        # Owner-chosen workflow owner epoch, fixed before any issuance; the R2 owners use 1.
        sw.ctx.workflow_owner['owner_epoch'] = 1
        # The same TestOwnerStorage instance, given DG-CF2's Storage-stamped transaction methods
        # (method-only subclass), so DG-CF2's projection publisher can write into this Storage.
        sw.storage.__class__ = C2W.CF2Storage
        sw.build_owners()
        self.start_world = sw
        self.storage = sw.storage
        self.registry = sw.registry
        self.recorder = sw.recorder
        self.roots = RW.Roots.get()
        self.seeder = RW.Seeder(self.roots)
        self.clock = RW.Clock(self.storage)
        self.sid = self.storage.storage_instance_id
        self.scope = dict(sw.ctx.scope)
        ctx = sw.ctx
        self.ids = dict(execution_owner_ref=ctx.workflow_owner['owner_ref'],
                        workflow_owner_ref=ctx.workflow_owner['owner_ref'],
                        plan_compile_run_id=ctx.plan_compile_run_id, workgraph_id=ctx.workgraph_id,
                        workgraph_ref=ctx.workgraph_ref, activation_id='TEST_ONLY:activation:' + ctx.token,
                        activation_key=None)
        self.workgraph_sha256 = None
        self.activation_revision = None
        self.issued = {}
        self.append = A.AppendOwner(self.registry, self.storage)
        self.ancillary = RW.PhysOwner(self, 'ancillary_provenance')
        self.permissions = dict(read=True, project=True)

    def build(self):
        cfg = self.cfg
        sw = self.start_world
        self.native = S1NativeOwner(self, sw.owners['native'])
        self.d01 = S1D01Owner(self, sw.owners['d01'], sw.edition)
        self.start = AdoptedCustody(self, 'workflow_start', sw.start.owner_id)
        self.goal = RW.PhysOwner(self, 'goal_cancel')
        self.scheduler = RW.PhysOwner(self, 'scheduler')
        self.d05 = RW.PhysOwner(self, 'd05_safe_stop')
        self.filesafe = RW.PhysOwner(self, 'filesafe')
        self.process = RW.PhysOwner(self, 'process')
        self.d06 = RW.PhysOwner(self, 'd06_cancel')
        self.out = {}
        if self.knob('pre_start_events'):
            self.knob('pre_start_events')(self)
        self._birth()
        self._start()
        self._goal_cancel()
        self._scheduler_stop()
        self._effects()
        self._safe_stop()
        self._d06()
        return self

    # -- S1 issuance and adoption -------------------------------------------------
    def _birth(self):
        sw = self.start_world
        self.s1_handles = sw.issue_sources(self.cfg.get('s1_edits'))
        self.workgraph_sha256 = sw.ctx.workgraph_sha256
        birth = SR.birth_record(sw)
        self.body0 = self.native.adopt(birth['body'], 'workflow_goal_run_body', RW.WA + 'GoalRunBodyPhysical')
        self.control0 = self.native.adopt(birth['control'], 'workflow_goal_run_control', RW.WA + 'GoalRunControlPhysical')
        act = birth['body']['record']['activation_state']
        self.ids['activation_key'] = act.get('idempotency_key')
        self.activation_revision = act['revision']
        self.ops = dict(birth=birth['initial_control_origin']['record']['original_operation_id'])

    def _start(self):
        sw = self.start_world
        op = START_OP
        self.ops['start'] = op
        self.s1_result = sw.start.commit_start(start_request(sw, op), dict(self.s1_handles))
        # Independent acquisition through S1's own retained reader, then adoption.
        original = SR.original_started(sw, where='dg_int/adopt')
        native = original['native_start']
        roots = {'control': (RW.WS + 'StorageControl', 'workflow_start_control'),
                 'initial_control_origin': (RW.WA + 'OwnerIssueOriginPhysical', 'workflow_start_control_origin'),
                 'candidate': (RW.WS + 'StorageCandidate', 'workflow_start_candidate'),
                 'commit': (RW.WS + 'StorageCommit', 'workflow_start_commit'),
                 'origin': (RW.WS + 'StorageOrigin', 'workflow_start_origin')}
        fam = ST.d01_families(sw.edition)
        cause = dict(kind='original_started')
        for name, (root, family) in roots.items():
            cause[name] = self.start.adopt(family, native[name], 'native_consumer', root)
        keys = SR.op_keys(sw, op)
        head_key = native['original_d01_origin']['record']['afterimages']['workflow_head']['physical_key']
        cause['original_d01_update'] = self.d01.adopt(native['original_d01_update'], fam['workflow_update'],
                                                      RW.WO + 'StorageWorkflowUpdate', keys['update'])
        cause['original_d01_origin'] = self.d01.adopt(native['original_d01_origin'], 'executor_workflow_lineage_origin',
                                                      RW.WO + 'StorageWorkflowMutationOrigin', keys['d01_origin'])
        cause['original_d01_head'] = self.d01.adopt(native['original_d01_head'], fam['workflow_head'],
                                                    RW.WO + 'StorageWorkflowHead', head_key)
        current = sw.owners['native'].current()
        self.body1 = self.native.adopt(current['body'], 'workflow_goal_run_body', RW.WA + 'GoalRunBodyPhysical')
        self.control1 = self.native.adopt(current['control'], 'workflow_goal_run_control', RW.WA + 'GoalRunControlPhysical')
        self.native.revision = current['body']['record']['revision']
        self.native.status = current['body']['record']['status']
        append = original['original_append']
        self.started_event = append['event']
        self.start_custody = append['exact_custody']
        self.start_cause_candidate = cause['candidate']
        self.start_cause = cause
        self.head = cause['original_d01_head']
        self.activation_origin = cause['initial_control_origin']
        self.s1_original = original
        self._adopt_closure([s.wrapper for k, s in cause.items() if k != 'kind'] +
                            [self.body0.wrapper, self.control0.wrapper, self.body1.wrapper, self.control1.wrapper])

    def _custodian(self, family, writer):
        """One custody owner per family, so a mutable key's versions share one latest record."""
        sw = self.start_world
        d01 = set(ST.d01_families(sw.edition).values()) | {'executor_workflow_lineage_origin'}
        if family in d01:
            return self.d01
        if family in ('workflow_goal_run_body', 'workflow_goal_run_control'):
            return self.native
        if family.startswith('workflow_start'):
            return self.start
        key = writer or sw.start.owner_id
        owner = self._provenance.get(key)
        if owner is None:
            owner = self._provenance[key] = AdoptedCustody(self, 's1_provenance', key)
        return owner

    def _s1_historical(self, ref, commitment):
        """An earlier version at a mutable S1 key, acquired from the issuing S1 owner's own custody."""
        sw = self.start_world
        e = sw.edition
        fam = ST.d01_families(e)
        candidates = []
        if ref['family_id'] == 'workflow_start_control':
            candidates.append(SR.birth_record(sw)['start_control'])
        if ref['family_id'] == fam['pointer']:
            owner_id, handle = sw.handles['d01_current']
            _ref, current_source = A.acquire(sw.registry, owner_id, 'd01_workflow_source', handle)
            pointer = SW.skeleton(e.bank, e.d01 + '#/$defs/StorageCurrentPointer')
            pointer['record'] = copy.deepcopy(current_source['pointer'])
            candidates.append(pointer)
        for value in candidates:
            if RW.physical_sha256(value) == commitment:
                return value
        raise Refusal('adopt/historical_unavailable')

    def _adopt_closure(self, wrappers):
        """Adopt every Storage cell an S1 wrapper selects, transitively.

        A current target is resolved through S1's own selector resolution (exact
        cell, pack-backed values decoded and verified, SHA-256 equal to the
        selector); an earlier version at a mutable key comes from the issuing S1
        owner's custody (birth StartControl, the D01 owner's pre-Start pointer).
        Each is kept by one custodian per family, so the R2 consumer's whole-tuple
        selector walk resolves S1's provenance exactly as it resolves R2's own
        ancillary originals.
        """
        sw = self.start_world
        self._provenance = getattr(self, '_provenance', {})
        todo = list(wrappers)
        while todo:
            value = todo.pop()
            for _path, ref in RW.walk_refs(value):
                commitment = ref.get('physical_value_sha256', ref.get('physical_sha256'))
                if commitment is None or (ref['family_id'], ref['physical_key'], commitment) in self.issued:
                    continue
                guard('adopt/foreign_storage', ref['storage_instance_id'] == self.sid)
                cell = SW.read_value(self.storage, ref['family_id'], ref['physical_key'], 'dg_int/closure')
                guard('adopt/unresolved', cell is not None)
                if SW.cdigest(cell['value']) == commitment:
                    target = cell['value']
                    writer = target.get('issuing_owner') if isinstance(target, dict) else None
                    owner = self._custodian(ref['family_id'], writer)
                    stored = adopt_into(owner, ref['family_id'], ref['physical_key'], target)
                else:
                    owner = self._custodian(ref['family_id'], None)
                    if owner.current.get((ref['family_id'], ref['physical_key'])) is None:
                        adopt_into(owner, ref['family_id'], ref['physical_key'], cell['value'])
                    stored = adopt_into(owner, ref['family_id'], ref['physical_key'],
                                        self._s1_historical(ref, commitment), current=False)
                todo.append(stored.wrapper)

    def resolve(self, ref, family=None):
        """R2 resolution, with S1's pack-backed source cells read through their SP-337 pack."""
        cell = self.storage.cell(ref.get('family_id'), ref.get('physical_key')) if isinstance(ref, dict) else None
        if cell is not None and isinstance(cell['value'], dict) and cell['value'].get('pack_backed') is True:
            commitment = ref.get('physical_value_sha256', ref.get('physical_sha256'))
            stored = self.issued.get((ref['family_id'], ref['physical_key'], commitment))
            guard('select/commitment', stored is not None)
            decoded = SW.read_value(self.storage, ref['family_id'], ref['physical_key'], 'select/pack')['value']
            guard('select/cell_substituted', RW.physical_sha256(decoded) == stored.sha256)
            guard('select/schema', decoded.get('schema_id') == ref['schema_id'] and
                  decoded.get('schema_version') == ref['schema_version'])
            return copy.deepcopy(decoded)
        return super().resolve(ref, family)

    # -- D01 head under S1's model ------------------------------------------------
    def _d01_head(self, revision, update, prior_head, activation_body, activation_origin):
        return self.d01.publish_head(
            revision,
            [('/record/revision', revision), ('/record/activation_body', activation_body.selector()),
             ('/record/activation_origin', activation_origin.selector()),
             ('/record/current_body', update.wrapper['record']['after_body']),
             ('/record/current_control', update.wrapper['record']['after_control']),
             ('/record/previous_head', None if prior_head is None else prior_head.selector()),
             ('/record/last_update', update.selector()), ('/record/workflow_owner_ref', self.ids['workflow_owner_ref']),
             ('/record/workflow_owner_epoch', 1), ('/record/pending_operation_id', None)],
            knob=self.knob('d01_head:%d' % revision))

    # -- current sources under S1's model -----------------------------------------
    def current_start(self):
        """The current Start argument with S1's actual fresh D01 CurrentSource (not filler)."""
        out = RW.World.current_start(self)
        sw = self.start_world
        out['value']['d01_current'] = sw.owners['d01'].current_source(sw.owners['native'].current())
        return out

    def current_readback(self, start=None):
        """R2's current readback, with S1's actual D01 current pointer in the D01 lineage."""
        value = RW.World.current_readback(self, start)
        fam = ST.d01_families(self.start_world.edition)
        pointer = self.storage.cell(fam['pointer'], self.d01.s1.pointer_key())
        value['d06_readback']['original_d01_lineage']['pointer'] = copy.deepcopy(pointer['value'])
        self.roots.validate('native_consumer', RW.CP + 'CurrentSuccessfulReadback', value,
                            'current/CurrentSuccessfulReadback')
        return value

    def close(self):
        RW.World.close(self)


def build(cfg=None, base=None):
    return S1CancelWorld(cfg, base=base).build()
