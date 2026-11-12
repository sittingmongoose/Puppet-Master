#!/usr/bin/env python3
"""DG-INT P7 legacy current branches: certified consumer, reference edition (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

DG-CF2 closed P7's certified current branch; the judge's P7 case also names
the old-profile and native-v7 Start/cancelled branches
(``read_current_started`` and ``read_current_cancelled`` in
``Plans/goal_run_projection_reference_contracts/certified.methods.json``).
This module executes the original-profile pair on the cross-family world
``pm_goal_dg_int_world.S1CancelWorld``:

* the Start is issued by DG-S's S1 owner and the positive cancellation by
  DG-R's R2 owners, in one Storage;
* the legacy row is published through DG-CF2's projection publisher
  (``pm_goal_dg_cf2_consumer.Consumer.publish_projection``: one generation,
  row plus logical checkpoint in ONE Storage transaction, W5 successor
  ``Representation``) with the legacy record derived from the whole
  original (``OriginalStarted`` from S1's retained reader, ``OriginalCancelled``
  from R2's passive consumer) instead of a certified record;
* each current read independently reacquires root, row and checkpoint, the
  whole original, the fresh current native source (S1 ``CurrentStartSource``,
  or the R2 ``CurrentSuccessfulReadback``/``CurrentRead`` built at one held
  boundary), the fresh Goal argument, requires the row to equal the record
  rederived from that original and the processed prefix to equal the exact
  current global prefix, and repeats every source after the last helper;
  every method argument is validated in the realm ``certified.methods.json``
  names, and every result against the successor's adapted root.

Lawful retained history still passes after native advance; current refuses.
"""
from __future__ import annotations

import copy
import types

import pm_goal_test_numrule as NR
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as GS
import pm_goal_dg_s_world as SW
import pm_goal_dg_s_start as ST
import pm_goal_dg_s_readers as SR
import pm_goal_dg_r_world as RW
import pm_goal_dg_r_readers as RR
import pm_goal_dg_r_projector as RP
import pm_goal_dg_cf2_consumer as C2
import pm_goal_dg_int_world as IW

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
Unavailable = C2.Unavailable
unavailable_if = C2.unavailable_if
require = A.require
CONSUMER_REALM = 'native_consumer'  # DG-R's W4 bank: the methods' cancelled_native_consumer realm
GOAL_REALM = 'goal_consumer'
FILESAFE_REALM = 'filesafe_consumer'
METHODS = {
    'started': 'owner.goal_run.started_cancelled_certified.read_current_started.original_profile.reference.v1',
    'cancelled': 'owner.goal_run.started_cancelled_certified.read_current_cancelled.original_profile.reference.v1',
}
LEGACY_OP = 'TEST_ONLY:operation:dg-int-legacy'


class _Permission:
    """CF2's disclosure control, read from the R2 world's disclosure-permission owner state."""

    def __init__(self, world):
        self.world = world

    def current(self, run):
        return dict(state='granted' if self.world.permissions['read'] is True else 'revoked', run=run)


def started_world(cfg=None, base=None):
    """S1 Start only (no cancellation): the running run the started branch reads."""
    w = IW.S1CancelWorld(cfg, base=base)
    sw = w.start_world
    w.native = IW.S1NativeOwner(w, sw.owners['native'])
    w.d01 = IW.S1D01Owner(w, sw.owners['d01'], sw.edition)
    w.start = IW.AdoptedCustody(w, 'workflow_start', sw.start.owner_id)
    w.out = {}
    w._birth()
    w._start()
    w.safe_stop, w.process_effects, w.goal_cause, w.filesafe_invocations = {}, {}, {}, []
    return w


def cancelled_world(cfg=None, base=None):
    return IW.S1CancelWorld(cfg, base=base).build()


class LegacyConsumer(C2.Consumer):
    """DG-CF2's certified consumer with its legacy original-profile current branches."""

    def __init__(self, world, branch):
        shim = types.SimpleNamespace(storage=world.storage, permission=_Permission(world))
        super().__init__(world.registry, shim)
        self.iw, self.branch = world, branch
        self.sw = world.start_world
        self.readers = SR.StartedReaders(self.sw.registry, world=self.sw, projector=None)
        self.r2 = RR.Consumer(world)
        self.r2_projector = RP.Projector(world)

    # -- whole originals, acquired independently ---------------------------------
    def original(self, *, stage):
        if self.branch == 'started':
            try:
                return SR.original_started(self.sw, where=stage + '/original')
            except SW.DGRefusal as error:
                raise Unavailable(error.code, 'MISSING_ORIGINAL_VALUE') from None
        try:
            return self.r2.inspect_original(self.request(), RR.Presentation(self.iw))
        except (RW.Refusal, A.AdapterRefusal) as error:
            raise Unavailable(RW.code_of(error), 'MISSING_ORIGINAL_VALUE') from None

    def request(self):
        w = self.iw
        return dict(scope={k: w.scope[k] for k in ('storage_instance_id', 'project_id', 'goal_id', 'goal_run_id')},
                    storage_instance_id=w.sid)

    def record_of(self, original):
        """The legacy Projection record, derived from the whole original only."""
        st = self.iw.storage
        run_scope = self.request()['scope']
        if self.branch == 'started':
            n, append = original['native_start'], original['original_append']
            keys = SR.op_keys(self.sw, n['control']['record']['original_operation_id'])
            fam = ST.d01_families(self.sw.edition)
            sel = lambda family, key, value: dict(storage_instance_id=st.storage_instance_id, family_id=family,  # noqa: E731
                                                  physical_key=key, schema_id=value['schema_id'],
                                                  schema_version=value['schema_version'],
                                                  physical_value_sha256=SW.cdigest(value))
            update = n['original_d01_update']
            record = dict(
                scope=copy.deepcopy(run_scope), status_at_original_event='running', activation_at_original_event='active',
                original_event=copy.deepcopy(append['event']),
                native_after_commitment=copy.deepcopy(update['record']['transition']['after']),
                captured_goal_context=copy.deepcopy(n['commit']['record']['goal_context']),
                original_commit=sel('workflow_start_commit', n['commit']['physical_key'], n['commit']),
                original_origin=sel('workflow_start_origin', n['origin']['physical_key'], n['origin']),
                original_d01_update=sel(fam['workflow_update'], keys['update'], update),
                original_d01_origin=sel('executor_workflow_lineage_origin', keys['d01_origin'],
                                        n['original_d01_origin']),
                original_event_value_commitment=copy.deepcopy(append['exact_custody']['original_event_value_commitment']),
                producer_semantic_digest=append['exact_custody']['producer_semantic_digest'],
                first_append_receipt=copy.deepcopy(append['first_append_receipt']), action_authority=False)
            require('legacy/started_commit_event', n['commit']['record']['event_id'] == append['event']['event_id'])
            require('legacy/started_receipt', A.same(n['commit']['record']['first_append_receipt'],
                                                     append['first_append_receipt']))
        else:
            event = original['original_value']['event']
            custody = st.first_custody(event['event_id'])
            record = self.r2_projector.cancelled_record(original['native_cancellation'], event, custody)
        self.validate('Projection', record, 'legacy/record')
        require('legacy/commitment', A.same(record['original_event_value_commitment'],
                                            self.rep.commitment(record['original_event'])))
        return record

    # -- DG-CF2 publisher hooks (publish_projection is CF2's, unchanged) ---------
    def retained_sources(self, scope, op, *, stage):
        return self.original(stage=stage)

    def inspect_original(self, scope, op, *, presented=None):
        source = GS.GenericSource(self.iw.storage).acquire()
        require('legacy/source_defect', source.complete)
        return dict(generic=source)

    def projection_record(self, scope, op, retained, inspected):
        return self.record_of(retained)

    def publish(self):
        return self.publish_projection(self.request()['scope'], LEGACY_OP)

    # -- method arguments, each validated in its realm -----------------------------
    def legacy_sources(self, original):
        started = [original] if self.branch == 'started' else []
        cancelled = [original] if self.branch == 'cancelled' else []
        if self.branch == 'cancelled':
            started = [SR.original_started(self.sw, where='legacy_sources/started')]
        value = dict(originals=[dict(profile='original_started_cancelled', started=started, cancelled=cancelled)],
                     native_v7_starts=[], native_v7_cancellations=[])
        self.validate('LegacyProjectionEvidence', value, 'argument/legacy_sources')
        return value

    def private_argument(self, current_native, readback=None, current_read=None):
        """original_0: the original-profile current read's whole private argument (W4 realm)."""
        rp = self.r2_projector
        source, snapshot, starts, cancellations, _goal, _effects = rp.acquire()
        projection_sources = dict(generic=rp.generic_snapshot(snapshot, None), actual_generic_sources=rp.actual_sources(snapshot),
                                  native_starts=starts, native_cancellations=cancellations, checkpoint=None,
                                  existing_row=None)
        self.iw.repair_filler(CONSUMER_REALM, RW.PR + 'CombinedProjectPrivate', projection_sources,
                              {'/native_starts', '/native_cancellations', '/checkpoint', '/existing_row', '/generic/frames'})
        self.iw.roots.validate(CONSUMER_REALM, RW.PR + 'CombinedProjectPrivate', projection_sources,
                               'argument/projection_sources')
        if self.branch == 'started':
            value = dict(projection_sources=projection_sources, current_native=current_native)
            self.iw.roots.validate(CONSUMER_REALM, RW.C + 'CurrentStartedPrivate', value, 'argument/original_0')
        else:
            value = dict(projection_sources=projection_sources, actual_current_read=current_read,
                         current_disposition=readback)
            self.iw.roots.validate(CONSUMER_REALM, RW.C + 'CurrentCancelledPrivate', value, 'argument/original_0')
        return value, snapshot

    def goal_causes(self, original):
        if self.branch == 'started':
            causes, effects = [], []
        else:
            _native, causes, effects = self.r2.assemble(self.r2.tuple(RR.Presentation(self.iw)))
        self.iw.roots.validate(GOAL_REALM, RW.GA + 'ProjectGoalCauses', causes, 'argument/goal_causes')
        self.iw.roots.validate(FILESAFE_REALM, RW.FA + 'RetainedFileSafeEffects', effects, 'argument/filesafe_effects')
        return causes, effects

    # -- current native sources ----------------------------------------------------
    def current_started(self, original, *, stage):
        try:
            native = self.readers.h_current_start(original, stage)
            goal = self.readers.h_current_goal(stage)
        except SW.DGRefusal as error:
            reason = 'PENDING_OR_STOPPED' if 'goal' in error.code else 'STALE_NATIVE'
            raise Unavailable(error.code, reason) from None
        self.iw.roots.validate(GOAL_REALM, RW.GA + 'CurrentStartedGoal', goal, stage + '/original_1')
        return native, goal

    def current_cancelled(self, original, *, stage):
        """R2's current sources at one held boundary, with native truth read through S1's current pointer."""
        w = self.iw
        current = w.native.s1.current()
        unavailable_if(stage + '/native_current', 'STALE_NATIVE',
                       current['pointer']['value']['body_key'] == w.body2.key and
                       RW.physical_sha256(current['body']) == w.body2.sha256 and
                       RW.physical_sha256(current['control']) == w.control2.sha256)
        for name, stored in (('d06_control', w.cancellation['committed_control']),
                             ('d01_head', w.cancellation['original_d01_head'])):
            cell = w.storage.cell(stored.family, stored.key)
            unavailable_if(stage + '/' + name, 'SOURCE_CHANGED',
                           cell is not None and RW.physical_sha256(cell['value']) == stored.sha256)
        fam = ST.d01_families(self.sw.edition)
        pointer = w.storage.cell(fam['pointer'], w.d01.s1.pointer_key())
        unavailable_if(stage + '/d01_pointer', 'STALE_NATIVE', pointer['value']['record']['workflow_head'][
            'physical_value_sha256'] == w.cancellation['original_d01_head'].sha256)
        stop = w.goal_cause['original_stop_receipt']
        latest = [s for (f, k, h), s in w.issued.items() if f == stop.family]
        unavailable_if(stage + '/goal_stop', 'SOURCE_CHANGED', all(
            s is stop or s.wrapper['record']['operation_id'] == stop.wrapper['record']['operation_id'] for s in latest))
        readback, current_read, goal = w.current_boundary()
        rec = lambda v: v.get('record', v.get('value'))  # noqa: E731
        native = original['native_cancellation']
        d = readback['d06_readback']
        require(stage + '/readback_d06', A.same([d['result'], d['intent'], d['control'], d['origin']],
                                                [rec(native['result']), rec(native['intent']),
                                                 rec(native['committed_control']), rec(native['publish_origin'])]))
        require(stage + '/readback_native', A.same([d['native_after']['body'], d['native_after']['control']],
                                                   [current['body'], current['control']]))
        require(stage + '/readback_event', A.same(d['original_event']['event'], original['original_value']['event']))
        require(stage + '/one_boundary', A.same(current_read['current_start'], readback['current_start']))
        self.iw.roots.validate(GOAL_REALM, RW.GA + 'CurrentCancelledGoal', goal, stage + '/original_1')
        return readback, current_read, goal

    # -- the two legacy current methods ------------------------------------------
    def read_current(self, hooks=None):
        hooks = hooks or {}
        scope = self.request()['scope']
        stage = 'legacy_current_' + self.branch
        before = self.iw.storage.snapshot()['cell_generation']
        with self.recorder.call(self.owner_id, METHODS[self.branch], dict(scope=scope)) as slot:
            self.validate('ScopeRequest', self.request(), stage + '/request')
            self.disclosure(scope, stage=stage)
            opened = self.reopen(scope)
            original = self.original(stage=stage)
            if self.branch == 'started':
                current_native, goal = self.current_started(original, stage=stage)
                private, snapshot = self.private_argument(current_native)
            else:
                readback, current_read, goal = self.current_cancelled(original, stage=stage)
                current_native = readback
                private, snapshot = self.private_argument(None, readback, current_read)
            causes, effects = self.goal_causes(original)
            legacy = self.legacy_sources(original)
            expected = self.record_of(original)
            try:
                record = self.rep.decode(opened['row'], expected, opened['generation']['dataset_name'])
            except Exception as error:  # noqa: BLE001
                raise Unavailable(stage + '/row/' + str(getattr(error, 'args', [''])[0]), 'CUSTODY_MISMATCH') from None
            require(stage + '/row_record', A.same(record, expected))
            self.current_prefix(opened, stage=stage)
            if hooks.get('after_helpers'):
                hooks['after_helpers'](self.iw)
            # final predicate after every returning helper, under the held read fence
            again = self.reopen(scope)
            unavailable_if(stage + '/root_changed', 'SOURCE_CHANGED', A.same(again['stored'], opened['stored']) and
                           A.same(again['row'], opened['row']))
            self.current_prefix(again, stage=stage + '_final')
            self.disclosure(scope, stage=stage + '_final')
            unavailable_if(stage + '/final_original', 'SOURCE_CHANGED', A.same(self.original(stage=stage + '_final'),
                                                                              original))
            if self.branch == 'started':
                native2, goal2 = self.current_started(original, stage=stage + '_final')
                unavailable_if(stage + '/final_current', 'SOURCE_CHANGED', A.same(native2, current_native) and
                               A.same(goal2, goal))
                out = dict(kind='native_verified_running_as_of_same_snapshot', original=original,
                           projection=opened['row'], checkpoint=opened['stored'], current_native=current_native,
                           action_authority='none')
                self.validate('CurrentStartedOriginal', out, stage + '/result', original=False)
            else:
                readback2, _read2, goal2 = self.current_cancelled(original, stage=stage + '_final')
                owned = lambda rb, g: (  # noqa: E731  owner-set members only (filler is rebuilt per boundary)
                    [rb['d06_readback'][k] for k in ('kind', 'result', 'intent', 'control', 'origin')] +
                    [rb['d06_readback']['native_after'][k] for k in ('body', 'control', 'body_selection',
                                                                     'control_selection')] +
                    [rb['d06_readback']['original_event']['event'],
                     rb['d06_readback']['original_d01_lineage']['pointer']] +
                    [rb['current_start']['value'][k] for k in ('control', 'initial_control_origin', 'commit', 'origin',
                                                                'd01_current')] +
                    [g['current_stop'][k] for k in ('original_stop_intent', 'original_stop_receipt',
                                                    'original_source_audit')])
                unavailable_if(stage + '/final_current', 'SOURCE_CHANGED',
                               A.same(owned(readback2, goal2), owned(readback, goal)))
                out = dict(kind='native_verified_cancelled_as_of_same_snapshot', original=original,
                           projection=opened['row'], checkpoint=opened['stored'], current_native=current_native,
                           action_authority='none')
                self.validate('CurrentCancelledOriginal', out, stage + '/result', original=False)
            require(stage + '/passive', self.iw.storage.snapshot()['cell_generation'] == before)
            slot.set(dict(row=opened['row']['physical_key']))
            self.last_arguments = dict(request=self.request(), legacy_sources=legacy, goal_causes=causes,
                                       filesafe_effects=effects, original_0=private, original_1=goal)
            return out

    def read_historical(self):
        """Lawful retained history: the row and the whole original, no current-state claim."""
        scope = self.request()['scope']
        stage = 'legacy_historical_' + self.branch
        with self.recorder.call(self.owner_id, 'owner.goal_run.started_cancelled_certified.read_historical_legacy.reference.v1',
                                dict(scope=scope)):
            self.disclosure(scope, stage=stage)
            opened = self.reopen(scope)
            original = self.original(stage=stage)
            expected = self.record_of(original)
            record = self.rep.decode(opened['row'], expected, opened['generation']['dataset_name'])
            require(stage + '/row_record', A.same(record, expected))
            kind = 'original_started' if self.branch == 'started' else 'original_cancelled'
            out = dict(kind=kind, original=original, projection=opened['row'], checkpoint=opened['stored'],
                       current_state_asserted=False)
            self.validate('HistoricalStartedOriginal' if self.branch == 'started' else 'HistoricalCancelledOriginal', out,
                          stage + '/result', original=False)
            return out
