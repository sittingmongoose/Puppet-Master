#!/usr/bin/env python3
"""DG-CF2 TEST_ONLY certified consumer readers (CF-09, P7) on the coordinator world.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

Readers of `goal_run.certified` (Plans/goal_run_certified_consumer_contracts/
protocol.md P2, P3, P7; explicit successor selection
Plans/goal_run_projection_reference_contracts/certified.selection.json):

* read_retained_native (P2) reads only surviving original custody: the native
  Standard result/origin, the Standard receipt and capture origin, the D01
  update/head/origin and the seven compact coordinator wrappers. It never
  reacquires the Goal body or the current native body; it returns success only
  for an actually released original chain.
* inspect_original (P3) reads the raw frame through Storage (frame hash, CRC,
  boundaries), the first custody and group, recomputes the whole-value
  commitment and producer digest and requires P2's EventPhase to select the
  same Event and first custody.
* publish_projection is this lane's P7 fixture publisher: it derives the
  complete CertifiedProjection from P2/P3 originals, encodes the selected
  reference.v1 row (the W5 successor's Representation, imported read-only) and
  commits row plus logical checkpoint in ONE Storage transaction. The complete
  P5/P6/CF-11 stage, CAS, crash and cutover corpus belongs to DG-CF3.
* read_historical (P7) reopens row and checkpoint in one snapshot and
  rederives the row from currently lawful retained originals; no current state.
* read_current (P7) additionally runs the coordinator's fresh read_current
  tuple (guard, native/D01 current, Goal/Stop/permission), requires the
  processed prefix to equal the exhaustive current generic prefix (adapter
  GenericSource) and rechecks everything after the last helper.

Whole roots validated here: RetainedCoordinator, CertifiedEventCustody,
CertifiedProjection (consumer realm), StorageProjection and LogicalCheckpoint
(reference.v1). The native-realm wrappers inside RetainedCertifiedNative
(StorageWorkflowResult/Origin, D01 StorageWorkflowUpdate/Head/MutationOrigin,
standard_certification_custody_v2, StorageStandardCaptureOrigin) are compact
TEST_ONLY owner records in this lane and are listed for the merge.
"""
from __future__ import annotations

import copy
import hashlib
import json

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as GS
import pm_goal_dg_cf2_world as W
import pm_goal_dg_cf2_native as N

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
ROW_TABLE_PREFIX = 'goal_run_projection.started_cancelled_certified.reference.v1@'
CHECKPOINTS = 'checkpoints'
require = A.require

_REP = None


def representation():
    global _REP
    if _REP is None:
        from pm_goal_own_c3_w5_projection_oracles import ProjectionBank, Representation
        _REP = Representation(ProjectionBank())
    return _REP


class Unavailable(A.AdapterRefusal):
    """Consumer Unavailable: a source-quality result with no effects."""

    def __init__(self, code, reason):
        super().__init__(code)
        self.reason = reason


def unavailable_if(code, reason, condition):
    if not condition:
        raise Unavailable(code, reason)


def seglog_frontier(token):
    """The complete stable durable token issued by adapter batch 2."""
    return copy.deepcopy(token)


def selector6(storage, family_id, key, schema_id, value):
    return dict(storage_instance_id=storage.storage_instance_id, family_id=family_id, physical_key=key,
                schema_id=schema_id, schema_version='1.0.0', physical_value_sha256=W.sha(W.mp(value)))


class Consumer(A.TestOwner):
    role = 'consumer'

    def __init__(self, registry, world, **kw):
        super().__init__(registry, **kw)
        self.world = world
        self.rep = representation()

    def validate(self, root, value, code, *, original=True):
        uri = (self.rep_uri_consumer() if original else self.rep_uri_reference()) + '#/$defs/' + root
        errors = self.rep.scoped.errors('consumer', uri, value)
        if errors:
            first = sorted(errors, key=lambda e: list(e.absolute_path))[0]
            raise A.AdapterRefusal(code + '/schema/' + '/'.join(str(p) for p in first.absolute_path))

    @staticmethod
    def rep_uri_consumer():
        from pm_goal_own_c3_w5_projection_oracles import CONSUMER_URI
        return CONSUMER_URI

    @staticmethod
    def rep_uri_reference():
        from pm_goal_own_c3_w5_projection_oracles import URI
        return URI

    # ------------------------------------------------------------ P2
    def retained_sources(self, scope, op, *, stage):
        """Surviving original custody only; no Goal body or current native body."""
        w = self.world
        st = w.storage
        nk = W.native_key(scope)
        coord = {}
        for fam in W.FAMILIES:
            key, cell = w.coordinator.compact(fam, scope, op)
            unavailable_if(stage + '/missing/' + fam, 'MISSING_ORIGINAL_VALUE', cell is not None)
            issue = st.cell(W.TX_ISSUANCE, cell['tx'])
            unavailable_if(stage + '/unissued/' + fam, 'CUSTODY_MISMATCH', issue is not None)
            coord[fam] = dict(key=key, value=cell['value'], tx=cell['tx'], issue=issue['value'])
        control = coord['control']['value']['record']
        unavailable_if(stage + '/not_released', 'MISSING_ORIGINAL_VALUE', control['phase'] == 'released')
        try:
            w.coordinator.chain(scope, op, stage=stage)
        except A.AdapterRefusal as error:
            raise Unavailable(error.code, 'CUSTODY_MISMATCH') from None
        commit = coord['commit']['value']['record']
        native = {}
        tables = dict(native_result=N.T_RESULT, native_origin=N.T_ORIGIN, d01_update=N.T_UPDATE, d01_origin=N.T_MUTATION,
                      d01_head=N.T_HEAD)
        # Original native/D01 values are the ones the original Commit selects; the current head is not required.
        for name, table in tables.items():
            cell = st.cell(table, commit[name]['key'])
            unavailable_if(stage + '/missing/' + name, 'MISSING_ORIGINAL_VALUE', cell is not None)
            unavailable_if(stage + '/commit_selects/' + name, 'CUSTODY_MISMATCH',
                           A.same(commit[name], W.selector(commit[name]['key'], cell['value'])))
            unavailable_if(stage + '/transaction/' + name, 'CUSTODY_MISMATCH', cell['tx'] == commit['transaction_id'])
            native[name] = cell
        intent = coord['intent']['value']['record']
        rkey, ckey = N.receipt_key(scope), N.capture_key(scope)
        receipt, origin = st.cell(N.T_RECEIPT, rkey), st.cell(N.T_CAPTURE, ckey)
        unavailable_if(stage + '/standard_expired', 'SOURCE_EXPIRED', receipt is not None and origin is not None)
        unavailable_if(stage + '/standard_origin', 'CUSTODY_MISMATCH',
                       A.same(intent['standard_capture_origin'], W.selector(ckey, origin['value'])) and
                       A.same(commit['standard_capture_origin'], intent['standard_capture_origin']) and
                       origin['value']['record']['physical_sha256'] == W.sha(W.mp(receipt['value'])) and
                       origin['value']['record']['original_transaction_id'] == receipt['tx'] == origin['tx'])
        cert = receipt['value']['original_certification']
        unavailable_if(stage + '/standard_receipt', 'CUSTODY_MISMATCH',
                       intent['certification_receipt_ref'] == cert['receipt_id'] and
                       cert['final_certifier_decision'] == 'certified' and cert['certification_tier'] == 'standard' and
                       cert['unresolved_risk_refs'] == [] and cert['approval_refs'] == [])
        result = native['native_result']['value']['record']
        unavailable_if(stage + '/native_result', 'CUSTODY_MISMATCH',
                       result['operation'] == 'standard_certification' and result['operation_id'] == op and
                       A.same(result['standard_receipt'], dict(source=N.selof(st, N.T_RECEIPT, rkey, receipt['value']),
                                                               origin=N.selof(st, N.T_CAPTURE, ckey, origin['value']))))
        origin_rec = native['native_origin']['value']['record']
        unavailable_if(stage + '/native_origin', 'CUSTODY_MISMATCH',
                       origin_rec['issuer_method'] == 'owner.workflow.standard.publish_certified_joint.v1' and
                       A.same(origin_rec['result'], N.selof(st, N.T_RESULT, commit['native_result']['key'],
                                                            native['native_result']['value'])))
        # D01 original transition: provisional_success/verifying -> certified, revision +1, activation unchanged.
        upd = native['d01_update']['value']['record']
        t = upd['transition']
        unavailable_if(stage + '/d01_transition', 'CUSTODY_MISMATCH',
                       t['rule'] == 'original_standard_certification' and upd['cause'] == 'completion_certification' and
                       t['before']['status'] in ('verifying', 'provisional_success') and t['after']['status'] == 'certified'
                       and t['after']['body_revision'] == t['before']['body_revision'] + 1 and
                       t['after']['activation_revision'] == t['before']['activation_revision'] and
                       t['after']['activation_state'] == t['before']['activation_state'] and
                       A.same(t['original_owner_result'], N.selof(st, N.T_RESULT, commit['native_result']['key'],
                                                                  native['native_result']['value'])) and
                       t['before']['body']['physical_value_sha256'] == intent['native_before_body']['sha256'] and
                       t['after']['body']['physical_value_sha256'] == commit['native_after_body']['sha256'])
        head = native['d01_head']['value']['record']
        unavailable_if(stage + '/d01_head', 'CUSTODY_MISMATCH',
                       A.same(head['last_update'], N.selof(st, N.T_UPDATE, commit['d01_update']['key'],
                                                           native['d01_update']['value'])))
        unavailable_if(stage + '/native_revision', 'CUSTODY_MISMATCH',
                       t['after']['body_revision'] == intent['clocks']['goal_run_revision'])
        release = coord['release']['value']['record']
        unavailable_if(stage + '/release_order', 'CUSTODY_MISMATCH',
                       release['issued_at_utc'] >= commit['issued_at_utc'] and release['transaction_id'] != commit['transaction_id'])
        retained_coord = {('event_phase' if f == 'eventphase' else f): coord[f]['value'] for f in W.FAMILIES}
        self.validate('RetainedCoordinator', retained_coord, stage + '/coordinator')
        retained = dict(scope=N.run_scope(scope),
                        native=dict(result=native['native_result']['value'], origin=native['native_origin']['value'],
                                    action_authority='none'),
                        standard=receipt['value'], standard_capture_origin=origin['value'],
                        d01=dict(original_update=native['d01_update']['value'], original_head=native['d01_head']['value'],
                                 original_origin=native['d01_origin']['value']),
                        coordinator=retained_coord, action_authority='none', complete_event_availability_asserted=False)
        self.validate('RetainedCertifiedNative', retained, stage + '/retained_native')
        return dict(coordinator=retained_coord, native=native, receipt=receipt, origin=origin, origin_key=ckey,
                    standard_key=rkey, retained=retained)

    def disclosure(self, scope, *, stage):
        """Current disclosure controls (permission) are acquired even for retained reads."""
        perm = self.world.permission.current(scope['goal_run_id'])
        unavailable_if(stage + '/disclosure_denied', 'DISCLOSURE_DENIED', perm['state'] == 'granted')
        return perm

    def read_retained_native(self, scope, op):
        with self.recorder.call(self.owner_id, 'owner.goal_run.certified.read_retained_native.reference.v1',
                                dict(op=op)) as slot:
            self.disclosure(scope, stage='retained')
            src = self.retained_sources(scope, op, stage='retained')
            out = src['retained']
            slot.set(out)
            return out

    # ------------------------------------------------------------ P3
    def inspect_original(self, scope, op, *, presented=None):
        w = self.world
        st = w.storage
        stage = 'inspect'
        with self.recorder.call(self.owner_id, 'owner.goal_run.certified.inspect_original.reference.v1',
                                dict(op=op)) as slot:
            self.disclosure(scope, stage=stage)
            retained = self.retained_sources(scope, op, stage=stage)
            ep = retained['coordinator']['event_phase']['record']
            target = ep['event_id']
            if presented is not None:
                # A presented payload, receipt hash or index row is never the original Event.
                unavailable_if(stage + '/presented_not_original', 'MISSING_ORIGINAL_VALUE', False)
            unavailable_if(stage + '/event_unavailable', 'MISSING_ORIGINAL_VALUE', target in st.events)
            try:
                raw = st.read_frame(target)
                event = st.read_event(target)
            except S.StorageRefusal as error:
                raise Unavailable(stage + '/frame/' + error.code, 'CUSTODY_MISMATCH') from None
            custody = st.first_custody(target)
            unavailable_if(stage + '/custody_unavailable', 'MISSING_ORIGINAL_VALUE', custody is not None)
            fvr = st.full_value_result(target)
            group = st.active_durable_group(target)
            member = [m for m in group['members'] if m['event_id'] == target]
            unavailable_if(stage + '/group_membership', 'CUSTODY_MISMATCH', len(member) == 1 and
                           member[0]['frame_sha256'] == W.sha(raw) and member[0]['frame_length'] == len(raw))
            unavailable_if(stage + '/value_commitment', 'CUSTODY_MISMATCH',
                           custody['original_event_value_commitment']['sha256'] ==
                           NR.full_value_commitment(event, stage + '/full_value') == ep['original_event_value_sha256'])
            unavailable_if(stage + '/producer_digest', 'CUSTODY_MISMATCH',
                           custody['producer_semantic_digest'] == NR.producer_digest(event, stage + '/producer') ==
                           ep['producer_semantic_digest'])
            unavailable_if(stage + '/first_custody', 'CUSTODY_MISMATCH',
                           ep['first_custody']['sha256'] == W.sha(W.mp(custody)) and
                           ep['whole_first_append_receipt_sha256'] == W.sha(W.mp(custody['first_append_receipt'])) and
                           ep['original_full_value_result_sha256'] == W.sha(W.mp(fvr)))
            unavailable_if(stage + '/identity', 'CUSTODY_MISMATCH',
                           event['event_id'] == ep['event_id'] and event['idempotency_key'] == ep['idempotency_key'] and
                           retained['coordinator']['release']['record']['original_event_id'] == event['event_id'])
            unavailable_if(stage + '/scope', 'CUSTODY_MISMATCH', event['project_id'] == scope['project_id'] and
                           event['run_id'] == scope['goal_run_id'] and event['payload']['goal_id'] == scope['goal_id'])
            unavailable_if(stage + '/goal_vs_native_revision', 'CUSTODY_MISMATCH',
                           event['payload']['goal_run_revision'] ==
                           retained['native']['d01_update']['value']['record']['transition']['after']['body_revision'])
            custody_value = dict(event=event, first_append_receipt=custody['first_append_receipt'],
                                 whole_value_commitment=custody['original_event_value_commitment'],
                                 full_value_result=fvr, exact_custody=custody)
            self.validate('CertifiedEventCustody', custody_value, stage + '/custody')
            original = dict(native=retained['retained'], original_event=custody_value, current_state_asserted=False,
                            action_authority='none')
            self.validate('OriginalCertified', original, stage + '/original_certified')
            out = dict(native_retained=retained, original_event=custody_value, original_certified=original,
                       current_state_asserted=False, action_authority='none', frame_sha256=W.sha(raw))
            slot.set(dict(event_id=target))
            return out

    # ------------------------------------------------------------ projection fixture
    def projection_record(self, scope, op, retained, inspected):
        st = self.world.storage
        nk = W.native_key(scope)
        coord = retained['coordinator']
        commit = coord['commit']['record']
        upd = retained['native']['d01_update']['value']['record']
        run_scope = N.run_scope(scope)
        intent = coord['intent']['record']
        n = retained['native']
        csel = lambda fam: dict(storage_instance_id=st.storage_instance_id, family_id='goal_certified_event_%s' % fam,
                                physical_key=W.family_key(fam, scope, op), schema_id=W.WRAPPER[fam], schema_version='1.0.0',
                                physical_value_sha256=W.sha(W.mp(coord[fam])))
        ev = inspected['original_event']
        record = dict(
            scope=run_scope, status_at_original_event='certified', activation_at_original_event='active',
            original_event=ev['event'],
            native_before_commitment=copy.deepcopy(upd['transition']['before']),
            native_after_commitment=copy.deepcopy(upd['transition']['after']),
            original_native_result=N.selof(st, N.T_RESULT, commit['native_result']['key'], n['native_result']['value']),
            original_native_origin=N.selof(st, N.T_ORIGIN, commit['native_origin']['key'], n['native_origin']['value']),
            original_d01_update=N.selof(st, N.T_UPDATE, commit['d01_update']['key'], n['d01_update']['value']),
            original_d01_origin=N.selof(st, N.T_MUTATION, commit['d01_origin']['key'], n['d01_origin']['value']),
            original_d01_head=N.selof(st, N.T_HEAD, commit['d01_head']['key'], n['d01_head']['value']),
            original_standard_receipt=N.selof(st, N.T_RECEIPT, retained['standard_key'], retained['receipt']['value']),
            original_standard_capture_origin=N.selof(st, N.T_CAPTURE, retained['origin_key'], retained['origin']['value']),
            original_coordinator_commit=csel('commit'), original_coordinator_origin=csel('origin'),
            original_coordinator_release=csel('release'),
            original_event_value_commitment=ev['whole_value_commitment'],
            producer_semantic_digest=ev['exact_custody']['producer_semantic_digest'],
            first_append_receipt=ev['first_append_receipt'], action_authority=False)
        self.validate('CertifiedProjection', record, 'projection/record')
        require('projection/before_after', upd['transition']['before']['body']['physical_value_sha256'] ==
                intent['native_before_body']['sha256'] and
                upd['transition']['after']['body']['physical_value_sha256'] == commit['native_after_body']['sha256'])
        require('projection/commitment', A.same(record['original_event_value_commitment'],
                                                self.rep.commitment(record['original_event'])))
        return record

    def processed(self, source, row_key, row):
        rows = source.rows
        return dict(generic_token=copy.deepcopy(source.token), verified_row_count=len(rows),
                    through_sequence_id=rows[-1].sequence_id if rows else None,
                    coverage_sha256=source.coverage_sha256,
                    retention_gap_sha256=W.sha(self.rep.pack([g['proof_sha256'] for g in source.gaps])),
                    row_key=row_key, row_sha256=None if row is None else W.sha(self.rep.pack(row)))

    def publish_projection(self, scope, op):
        """P7 fixture: one generation, row + checkpoint in ONE Storage transaction."""
        w = self.world
        st = w.storage
        with self.recorder.call(self.owner_id, 'TEST_ONLY:dg_cf2.publish_projection_fixture', dict(op=op)) as slot:
            retained = self.retained_sources(scope, op, stage='publish')
            inspected = self.inspect_original(scope, op)
            record = self.projection_record(scope, op, retained, inspected)
            source = GS.GenericSource(st).acquire()
            require('publish/source_defect', source.complete)
            seed = st.new_seed()
            profile_raw = (W.ROOT / 'Plans/goal_run_projection_reference_contracts/certified.installed-profile.json').read_bytes()
            profile_digest = W.sha(json.dumps(json.loads(profile_raw), sort_keys=True, separators=(',', ':'),
                                              ensure_ascii=False).encode('utf-8'))
            run_scope = dict(storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                             goal_id=scope['goal_id'], goal_run_id=scope['goal_run_id'])
            profile = 'goal_run_started_cancelled_certified_projector.reference.v1'
            anchor = W.sha(self.rep.pack(['goal_run_started_cancelled_certified_anchor.v1', st.storage_instance_id,
                                          run_scope, profile, profile_digest, seed, source.token]))
            gen_id = 'grsccg_' + anchor
            dataset = ROW_TABLE_PREFIX + gen_id
            row = self.rep.encode(record, dataset)
            issued_at = st.now()
            ckey = self.rep.checkpoint_key(run_scope)

            def build(tx_id):
                processed = self.processed(source, row['physical_key'], row)
                frontier = W.sha(self.rep.pack(['goal_run_started_cancelled_certified_frontier.v1', anchor, 1, None,
                                                processed, tx_id]))
                generation = dict(generation_id=gen_id, state='current', anchor_sha256=anchor, seed_hex=seed,
                                  profile=profile, scope=run_scope, source_token_at_birth=copy.deepcopy(source.token),
                                  dataset_name=dataset, frontier_revision=1, prior_frontier_sha256=None,
                                  frontier_sha256=frontier, processed=processed, last_transaction_id=tx_id,
                                  activated_at_utc=issued_at, retired_at_utc=None, first_prepared_at_utc=issued_at,
                                  successor_generation_id=None, hold_refs=[], profile_digest=profile_digest)
                logical = dict(schema_id='pm.goal_run_started_cancelled_certified_checkpoint.reference.v1',
                               schema_version='1.0.0', storage_instance_id=st.storage_instance_id, scope=run_scope,
                               physical_key=ckey, current_generation_id=gen_id, generations={gen_id: generation},
                               root_revision=0, last_transaction_id=tx_id)
                stored = self.rep.encode_checkpoint(logical)
                self.published = dict(row=row, logical=logical, stored_checkpoint=stored, dataset=dataset, record=record)
                return [dict(table=dataset, key=row['physical_key'], expected=None, value=row),
                        dict(table=CHECKPOINTS, key=ckey, expected=None, value=stored)]
            tx = st.transact_stamped(build, writer=dict(owner_id=self.owner_id, owner_epoch=self.owner_epoch,
                                                        operation_id='TEST_ONLY:operation:projection-publish'))
            slot.set(dict(tx=tx['tx_id']))
            return self.published

    # ------------------------------------------------------------ P7
    def reopen(self, scope):
        st = self.world.storage
        run_scope = dict(storage_instance_id=scope['storage_instance_id'], project_id=scope['project_id'],
                         goal_id=scope['goal_id'], goal_run_id=scope['goal_run_id'])
        snap = st.snapshot()
        ckey = self.rep.checkpoint_key(run_scope)
        stored = snap['cells'].get(CHECKPOINTS, {}).get(ckey)
        unavailable_if('historical/checkpoint_missing', 'INVALID_CHECKPOINT', stored is not None)
        logical = stored['value']['content']['checkpoint']
        try:
            self.validate('LogicalCheckpoint', logical, 'historical/checkpoint', original=False)
        except A.AdapterRefusal as error:
            raise Unavailable(error.code, 'INVALID_CHECKPOINT') from None
        gen = logical['generations'].get(logical['current_generation_id'])
        unavailable_if('historical/generation', 'INVALID_CHECKPOINT', gen is not None and gen['state'] == 'current')
        row_cell = snap['cells'].get(gen['dataset_name'], {}).get(gen['processed']['row_key'])
        unavailable_if('historical/row_missing', 'INVALID_CHECKPOINT', row_cell is not None)
        unavailable_if('historical/row_binding', 'INVALID_CHECKPOINT',
                       W.sha(self.rep.pack(row_cell['value'])) == gen['processed']['row_sha256'])
        unavailable_if('historical/atomic_publication', 'INVALID_CHECKPOINT',
                       row_cell['tx'] == stored['tx'] == logical['last_transaction_id'] == gen['last_transaction_id'])
        return dict(snapshot=snap, stored=stored['value'], logical=logical, generation=gen, row=row_cell['value'])

    def read_historical(self, scope, op):
        stage = 'historical'
        with self.recorder.call(self.owner_id, 'owner.goal_run.certified.read_historical.reference.v1',
                                dict(op=op)) as slot:
            self.disclosure(scope, stage=stage)
            opened = self.reopen(scope)
            retained = self.retained_sources(scope, op, stage=stage)
            inspected = self.inspect_original(scope, op)
            expected = self.projection_record(scope, op, retained, inspected)
            try:
                record = self.rep.decode(opened['row'], expected, opened['generation']['dataset_name'])
            except Exception as error:
                raise Unavailable(stage + '/row/' + str(getattr(error, 'args', [''])[0]), 'CUSTODY_MISMATCH') from None
            out = dict(original=inspected['original_certified'], projection=opened['row'], checkpoint=opened['stored'],
                       current_state_asserted=False, action_authority='none')
            self.validate('HistoricalCertified', out, stage + '/historical_certified', original=False)
            slot.set(dict(row=opened['row']['physical_key']))
            return out

    def current_prefix(self, opened, *, stage):
        """P7: processed prefix equals the exhaustive actual current generic frontier."""
        st = self.world.storage
        source = GS.GenericSource(st).acquire()
        unavailable_if(stage + '/source_defect', 'UNSUPPORTED_RELEVANT_EVENT', source.complete)
        processed = opened['generation']['processed']
        unavailable_if(stage + '/stale_generic_token', 'STALE_GENERIC_TOKEN',
                       A.same(seglog_frontier(processed['generic_token']), seglog_frontier(source.token)))
        unavailable_if(stage + '/incomplete_global_coverage', 'INCOMPLETE_GLOBAL_COVERAGE',
                       processed['verified_row_count'] == len(source.rows) and
                       processed['through_sequence_id'] == (source.rows[-1].sequence_id if source.rows else None) and
                       processed['coverage_sha256'] == source.coverage_sha256)
        return source

    def read_current(self, ctx):
        w = self.world
        stage = 'consumer_current'
        scope, op = ctx['scope'], ctx['op']
        with self.recorder.call(self.owner_id, 'owner.goal_run.certified.read_current.reference.v1', dict(op=op)) as slot:
            self.disclosure(scope, stage=stage)
            opened = self.reopen(scope)
            try:
                coordinator = w.coordinator.read_current(ctx)
            except A.AdapterRefusal as error:
                reason = 'PENDING_OR_STOPPED' if any(x in error.code for x in ('guard_outcome', 'released', 'effective_stop')) \
                    else 'STALE_NATIVE' if 'native' in error.code or 'd01' in error.code else 'SOURCE_CHANGED'
                raise Unavailable(error.code, reason) from None
            historical = self.read_historical(scope, op)
            self.current_prefix(opened, stage=stage)
            w.hook('after_helper:consumer_current', ctx)
            # final predicate after every helper under the held read fence
            again = self.reopen(scope)
            unavailable_if(stage + '/root_changed', 'SOURCE_CHANGED', A.same(again['stored'], opened['stored']) and
                           again['snapshot']['cell_generation'] == opened['snapshot']['cell_generation'])
            self.current_prefix(again, stage=stage + '_final')
            try:
                w.coordinator.current_sources(ctx, stage=stage + '_final')
                guard = w.coordinator.acquire_guard(ctx, 'current_source', stage='consumer_current_final')
                w.coordinator.check_guard(ctx, guard, ('authentic_released',), stage=stage + '_final')
            except A.AdapterRefusal as error:
                raise Unavailable(error.code, 'SOURCE_CHANGED') from None
            out = dict(original=historical['original'], projection=historical['projection'],
                       checkpoint=historical['checkpoint'], published_native=coordinator['published_native'],
                       interpretation='native_verified_certified_as_of_same_snapshot', action_authority='none')
            slot.set(dict(row=historical['projection']['physical_key']))
            return out
