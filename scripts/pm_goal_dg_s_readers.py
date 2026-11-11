#!/usr/bin/env python3
"""DG-S TEST_ONLY passive readers, generic-source reducer, projection
transaction/lifecycle and reference representation for goal_run.started.

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

S3: ``GenericStartSource`` acquires the whole generic source through the shared
adapter (every frame of every scope validated before off-run filtering, custody
compared with the frame-derived receipt), builds the whole ``GenericSnapshot``
root from the actual frame bytes and index rows, and runs ``StartReducer``: one
authentic Start per run joined to its retained native Start, off-run rows no-ops
only after validation, unsupported same-run rows and a second Start halt before
themselves.
S4: ``StartedReaders`` implements read_retained_native, inspect_original,
read_historical and read_current; each acquires its own complete source graph,
every helper reacquires its sources, and the final boundary rechecks them all.
S5/S6: ``StartedProjector`` owns the successor projection edition
(started.physical.json): generations on the TEST_ONLY Storage cells, the atomic
row+checkpoint transaction under full CAS, staging/cutover, withdrawal and
rebuild; ``Representation`` implements inline / event_reference /
record_reference rows and inline / payload_reference checkpoints over Storage
packs, with every stored part and complete operation measured.
"""
from __future__ import annotations

import base64
import copy
import json

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
import pm_goal_test_source as G
import pm_goal_dg_s_world as W
import pm_goal_dg_s_start as ST
from pm_goal_dg_s_world import require, same, cdigest, K, DGRefusal

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = NR.NATIVE_LINE
SUCCESSOR = 'https://puppetmaster.local/schemas/goal_run_projection_reference/started/1.0.0'
LIMIT = 16384
RETIREMENT_SECONDS = 604800
UNSUPPORTED_REASON = {
    'missing': 'MISSING_ORIGINAL_VALUE', 'expired': 'SOURCE_EXPIRED', 'custody': 'CUSTODY_MISMATCH',
    'unsupported': 'UNSUPPORTED_RELEVANT_EVENT', 'coverage': 'INCOMPLETE_GLOBAL_COVERAGE',
    'token': 'STALE_GENERIC_TOKEN', 'native': 'STALE_NATIVE', 'stopped': 'PENDING_OR_STOPPED',
    'generation': 'GENERATION_LIMIT', 'checkpoint': 'INVALID_CHECKPOINT'}


def op_keys(world, op):
    s = world.start
    return dict(candidate=s._key(_prefix(world, 'StorageCandidate', '.v2'), op),
                commit=s._key(_prefix(world, 'StorageCommit', '.v1'), op),
                origin=s._key(_prefix(world, 'StorageOrigin', '.v2'), op),
                update=s._key('executor_workflow_workflow_update.v4', op),
                d01_origin=s._key('executor_workflow_lineage_origin.v4', op),
                control=world.owners['native'].start_control_key())


def _prefix(world, root, suffix):
    e = world.edition
    return W.skeleton(e.bank, e.custody + '#/$defs/' + root)['schema_id'].split('.')[-2].replace('_v6', '') + suffix


# ------------------------------------------------------------------ retained originals

def retained_native(world, op=None, *, where='retained'):
    """Acquire the eight retained native Start objects from Storage custody."""
    e, ctx = world.edition, world.ctx
    storage = ctx.storage
    native = world.owners['native']
    control_cell = storage.cell('workflow_start_control', native.start_control_key())
    require(where + '/control_missing', control_cell is not None)
    control = control_cell['value']
    op = op or control['record']['original_operation_id']
    require(where + '/no_committed_start', control['record']['committed_start'] is not None and op is not None)
    keys = op_keys(world, op)
    commit = W.resolve_selector(storage, control['record']['committed_start'], where + '/commit')
    candidate = W.resolve_selector(storage, commit['record']['candidate'], where + '/candidate')
    origin_cell = storage.cell('workflow_start_origin', keys['origin'])
    require(where + '/origin_missing', origin_cell is not None)
    origin = origin_cell['value']
    fam = ST.d01_families(e)
    update_cell = storage.cell(fam['workflow_update'], keys['update'])
    d01o_cell = storage.cell('executor_workflow_lineage_origin', keys['d01_origin'])
    require(where + '/d01_missing', update_cell is not None and d01o_cell is not None)
    update, d01_origin = update_cell['value'], d01o_cell['value']
    head = W.resolve_selector(storage, d01_origin['record']['afterimages']['workflow_head'], where + '/d01_head')
    ico = storage.cell('workflow_start_control_origin', ctx.run_key('workflow_start_control_origin.v1'))
    require(where + '/initial_origin_missing', ico is not None)
    retained = dict(control=control, initial_control_origin=ico['value'], candidate=candidate, commit=commit,
                    origin=origin, original_d01_update=update, original_d01_origin=d01_origin, original_d01_head=head)
    e.bank.validate(e.consumer + '#/$defs/RetainedNativeStart', retained, where + '/root')
    return retained


def original_append(world, event_id, where='append'):
    storage = world.ctx.storage
    custody = storage.first_custody(event_id)
    require(where + '/first_custody_missing', custody is not None)
    event = storage.read_event(event_id)
    value = dict(event=event, first_append_receipt=custody['first_append_receipt'],
                 full_value_result=storage.full_value_result(event_id), exact_custody=custody)
    world.edition.bank.validate(world.edition.custody + '#/$defs/FullOriginalAppend', value, where + '/root')
    return value


def birth_record(world):
    native = world.owners['native']
    ref = native.inventory('birth')
    require('retained/birth_unissued', len(ref) == 1)
    return native.authenticate(ref[0], A.CODECS['msgpack'][1](native._originals[ref[0]]['raw']))


def relations(world, original):
    """Every retained native/Start/D01/Event/receipt relation, recomputed from the
    acquired values and Storage custody (no caller hashes)."""
    e, ctx = world.edition, world.ctx
    n, append = original['native_start'], original['original_append']
    c, m, o = (n[k]['record'] for k in ('candidate', 'commit', 'origin'))
    u, d, head = (n[k]['record'] for k in ('original_d01_update', 'original_d01_origin', 'original_d01_head'))
    b, a = u['transition']['before'], u['transition']['after']
    control = n['control']['record']
    sel = world.start._selector_of
    initial = birth_record(world)['start_control']
    op = control['original_operation_id']
    keys = op_keys(world, op)
    checks = {}

    def eq(name, actual, expected):
        checks[name] = same(actual, expected)
    for name in ('candidate', 'commit', 'origin', 'original_d01_update', 'original_d01_origin', 'original_d01_head',
                 'control'):
        r = n[name]['record']
        if 'scope' in r:
            eq('scope/' + name, r['scope'], ctx.scope)
        if 'storage_instance_id' in n[name]:
            eq('storage/' + name, n[name]['storage_instance_id'], ctx.sid)
    for name, key in (('candidate', 'candidate'), ('commit', 'commit'), ('origin', 'origin'), ('control', 'control')):
        eq('key/' + name, n[name]['physical_key'], keys[key])
    for name in ('candidate', 'commit', 'origin', 'original_d01_update', 'original_d01_origin'):
        r = n[name]['record']
        eq(name + '/operation_id', r['operation_id'], op)
        eq(name + '/transaction_id', r['transaction_id'], world.start.tx_id(op))
        if 'owner' in r:
            eq(name + '/owner', r['owner'], ctx.workflow_owner)
    eq('control/commit', control['committed_start'], sel(n['commit'], 'workflow_start_commit'))
    eq('control/no_pending', control['pending_candidate'], None)
    eq('control/epoch', control['epoch'], initial['record']['epoch'] + 1)
    eq('control/owner', control['owner'], ctx.workflow_owner)
    eq('candidate/before_start_control', c['before_start_control'], sel(initial, 'workflow_start_control'))
    ico = n['initial_control_origin']['record']
    eq('birth/key', ico['issued_value_key'], initial['physical_key'])
    eq('birth/record', ico['issued_record_sha256'], cdigest(initial['record']))
    for prefix, r in (('commit', m), ('origin', o)):
        eq(prefix + '/candidate', r['candidate'], sel(n['candidate'], 'workflow_start_candidate'))
    eq('origin/commit', o['commit'], sel(n['commit'], 'workflow_start_commit'))
    eq('origin/control', o['start_control'], sel(n['control'], 'workflow_start_control'))
    eq('commit/goal', m['goal_context'], c['goal_context'])
    eq('commit/outbox', m['prepared_outbox'], c['prepared_outbox'])
    eq('origin/source_argument', o['actual_source_argument_sha256'], c['actual_source_argument_sha256'])
    eq('origin/goal_argument', o['goal_source_argument_sha256'], c['goal_context']['source_argument_sha256'])
    for label, actual, expected in (
            ('candidate/before_body', c['before_body'], b['body']), ('candidate/before_control', c['before_control'], b['control']),
            ('candidate/after_body', c['candidate_body'], a['body']), ('candidate/after_control', c['candidate_control'], a['control']),
            ('commit/before_body', m['before_body'], b['body']), ('commit/before_control', m['before_control'], b['control']),
            ('commit/after_body', m['after_body'], a['body']), ('commit/after_control', m['after_control'], a['control']),
            ('origin/after_body', o['native_body'], a['body']), ('origin/after_control', o['native_control'], a['control']),
            ('d01/result', u['original_owner_result'], sel(n['commit'], 'workflow_start_commit')),
            ('d01/origin', u['original_owner_origin'], sel(n['origin'], 'workflow_start_origin')),
            ('d01/transition_result', u['transition']['original_owner_result'], sel(n['commit'], 'workflow_start_commit')),
            ('d01/transition_origin', u['transition']['original_owner_origin'], sel(n['origin'], 'workflow_start_origin')),
            ('head/body', head['current_body'], a['body']), ('head/control', head['current_control'], a['control']),
            ('d01_origin/head', d['afterimages']['workflow_head'],
             dict(d['afterimages']['workflow_head'], physical_value_sha256=cdigest(n['original_d01_head']))),
            ('d01_origin/update', d['afterimages']['workflow_update']['physical_value_sha256'], cdigest(n['original_d01_update'])),
            ('head/update', head['last_update']['physical_value_sha256'], cdigest(n['original_d01_update'])),
            ('d01_origin/cause', d['causation'], sel(n['origin'], 'workflow_start_origin'))):
        eq(label, actual, expected)
    eq('transition/from', m['transition']['from_state'], 'start_event_pending')
    eq('transition/to', m['transition']['to_state'], 'active')
    eq('transition/outbox', m['transition']['outbox_ref'], c['prepared_outbox']['physical_key'])
    eq('d01/cause', u['cause'], 'owner_status')
    eq('d01/writer', u['transition']['original_writer_method'], e.start_method)
    eq('d01_origin/method', d['method'], ST.D01_METHOD)
    eq('native/before_status', b['status'], 'ready')
    eq('native/before_activation', b['activation_state'], 'start_event_pending')
    eq('native/after_status', a['status'], 'running')
    eq('native/after_activation', a['activation_state'], 'active')
    eq('native/body_revision', a['body_revision'], b['body_revision'] + 1)
    eq('native/activation_revision', a['activation_revision'], b['activation_revision'] + 1)
    eq('native/identity', a['identity'], b['identity'])
    for key in ('workflow_owner_ref', 'workflow_owner_epoch'):
        eq('native/' + key, a[key], b[key])
    # retained body/control issuance selectors resolve in immutable Storage custody
    for label, selector in (('before_body', b['body']), ('before_control', b['control']), ('after_body', a['body']),
                            ('after_control', a['control'])):
        try:
            W.resolve_selector(ctx.storage, selector, 'relation/' + label)
            checks['resolve/' + label] = True
        except W.REFUSALS:
            checks['resolve/' + label] = False
    event, receipt, custody = append['event'], append['first_append_receipt'], append['exact_custody']
    commitment = custody['original_event_value_commitment']
    eq('custody/commitment_recomputed', commitment['sha256'], NR.full_value_commitment(event, 'relation'))
    for prefix, r, field in (('commit', m, 'event_value_commitment'), ('origin', o, 'original_event_value_commitment')):
        eq(prefix + '/event_commitment', r[field], commitment)
        eq(prefix + '/receipt', r['first_append_receipt'], receipt)
    producer = NR.producer_digest(S.producer25(event), 'relation')
    for prefix, r in (('candidate', c), ('commit', m)):
        eq(prefix + '/semantic_digest', r['producer_semantic_digest'], producer)
    eq('commit/event_id', m['event_id'], event['event_id'])
    p = event['payload']
    eq('event/project', event['project_id'], ctx.project_id)
    eq('event/run', event['run_id'], ctx.goal_run_id)
    eq('event/actor', event['actor_ref'], p['actor_ref'])
    eq('event/time', event['occurred_at_utc'], p['occurred_at_utc'])
    eq('event/correlation', event['correlation_id'], p['correlation_id'])
    for key in ('requested_account_ref', 'effective_account_ref'):
        eq('event/' + key, event[key], p[key])
    eq('payload/goal_revision', p['goal_revision'], c['goal_context']['goal_revision'])
    eq('payload/before_revision', p['expected_goal_run_revision'], b['body_revision'])
    eq('payload/after_revision', p['goal_run_revision'], a['body_revision'])
    eq('payload/run', p['payload']['goal_run_id'], ctx.goal_run_id)
    eq('payload/workgraph', p['payload']['workgraph_ref'], b['identity']['workgraph_ref'])
    partition = ST.partition_of(ctx.project_id)
    eq('event/key_recipe', event['idempotency_key'], ST.idempotency_key(partition, p))
    eq('event/key_copy', event['idempotency_key'], p['idempotency_key'])
    eq('event/id_recipe', event['event_id'], ST.event_id_of(partition, event['idempotency_key']))
    eq('receipt/event', receipt['event_id'], event['event_id'])
    eq('receipt/sequence', receipt['sequence_id'], event['sequence_id'])
    eq('receipt/durability_class', receipt['durability_class'], 'barrier')
    eq('full/receipt', append['full_value_result']['first_append_receipt'], receipt)
    eq('full/commitment', append['full_value_result']['original_event_value_commitment'], commitment)
    eq('custody/receipt', custody['first_append_receipt'], receipt)
    eq('custody/segment', custody['original_segment_ref'], append['full_value_result']['original_segment_ref'])
    for key, expected in (('storage_instance_id', ctx.sid), ('event_id', event['event_id']),
                          ('event_type', event['event_type']), ('idempotency_key', event['idempotency_key']),
                          ('producer_semantic_digest', producer), ('scope_partition', partition)):
        eq('custody/' + key, custody[key], expected)
    eq('custody/group_digest', custody['group_digest'],
       world.ctx.storage.active_durable_group(event['event_id'])['group_digest'])
    try:
        world.ctx.storage.authenticate_receipt(event['event_id'], receipt)
        checks['custody/storage_authenticated'] = True
    except W.REFUSALS:
        checks['custody/storage_authenticated'] = False
    return checks


def original_started(world, op=None, where='original'):
    retained = retained_native(world, op, where=where)
    append = original_append(world, retained['commit']['record']['event_id'], where + '/append')
    value = dict(original_append=append, native_start=retained)
    world.edition.bank.validate(world.edition.consumer + '#/$defs/OriginalStarted', value, where + '/root')
    failed = sorted(k for k, ok in relations(world, value).items() if not ok)
    require(where + '/relation/' + (failed[0] if failed else ''), not failed)
    return value


def projection_record(world, original):
    """Original logical record (consumer #/$defs/Projection) from S1 originals."""
    e = world.edition
    n, append = original['native_start'], original['original_append']
    sel = world.start._selector_of
    keys = op_keys(world, n['control']['record']['original_operation_id'])
    record = W.skeleton(e.bank, e.consumer + '#/$defs/Projection')
    record.update(scope=copy.deepcopy(world.ctx.scope), original_event=copy.deepcopy(append['event']),
                  native_after_commitment=copy.deepcopy(n['original_d01_update']['record']['transition']['after']),
                  captured_goal_context=copy.deepcopy(n['candidate']['record']['goal_context']),
                  original_commit=sel(n['commit'], 'workflow_start_commit'),
                  original_origin=sel(n['origin'], 'workflow_start_origin'),
                  original_d01_update=_keyed(world, n['original_d01_update'], ST.d01_families(e)['workflow_update'],
                                             keys['update']),
                  original_d01_origin=_keyed(world, n['original_d01_origin'], 'executor_workflow_lineage_origin',
                                             keys['d01_origin']),
                  original_event_value_commitment=copy.deepcopy(append['exact_custody']['original_event_value_commitment']),
                  producer_semantic_digest=append['exact_custody']['producer_semantic_digest'],
                  first_append_receipt=copy.deepcopy(append['first_append_receipt']), action_authority=False)
    e.bank.validate(e.consumer + '#/$defs/Projection', record, 'projection/record')
    return record


def _keyed(world, value, family, key):
    return dict(storage_instance_id=world.ctx.sid, family_id=family, physical_key=key, schema_id=value['schema_id'],
                schema_version=value['schema_version'], physical_value_sha256=cdigest(value))


# ------------------------------------------------------------------ S3 generic source + reducer

class StartReducer:
    """Bounded started reducer: one authentic Start per run, joined to its
    retained native Start; every other same-run family halts before itself."""

    def __init__(self, world, retained_by_event):
        self.world = world
        self.retained = retained_by_event

    def initial(self):
        return dict(qualification=QUALIFICATION, run_id=self.world.ctx.goal_run_id, started=None)

    def step(self, state, event, custody):
        if event['event_type'] != 'goal_run.started':
            raise G.Halt('reducer/unsupported_same_run:' + event['event_type'])
        if state['started'] is not None:
            raise G.Halt('reducer/second_start')
        retained = self.retained.get(event['event_id'])
        if retained is None:
            raise G.Halt('reducer/start_without_retained_native')
        commit = retained['commit']['record']
        if not same(commit['first_append_receipt'], custody['first_append_receipt']):
            raise G.Halt('reducer/native_receipt_join')
        if not same(commit['event_value_commitment'], custody['original_event_value_commitment']):
            raise G.Halt('reducer/native_commitment_join')
        try:
            self.world.edition.bank.validate(self.world.edition.custody + '#/$defs/TypedOriginalEvent', event,
                                             'reducer/event')
        except A.AdapterRefusal as error:
            raise G.Halt(error.code)
        state['started'] = dict(event_id=event['event_id'], sequence_id=event['sequence_id'],
                                group_digest=custody['group_digest'])
        return state


class GenericStartSource:
    """Whole generic source acquisition for the started family."""

    def __init__(self, world):
        self.world = world
        self.source = G.GenericSource(world.ctx.storage)

    def acquire(self, raw=None):
        return self.source.acquire(raw)

    def generic_snapshot(self, snap, where='generic'):
        """The whole consumer GenericSnapshot root from the actual frames."""
        e, storage = self.world.edition, self.world.ctx.storage
        frames = []
        frame_skeleton = W.skeleton(e.bank, e.consumer + '#/$defs/GenericFrame')
        for row in snap.rows:
            raw = storage.read_frame(row.event_id)
            require(where + '/frame_hash', W.sha256(raw) == row.frame_sha256)
            frame = copy.deepcopy(frame_skeleton)
            ix = frame['index_row']
            ev = row.event
            ix.update(scope_kind=ev['scope_kind'], project_id=ev['project_id'], scope_partition=row.scope_partition,
                      sequence_id=row.sequence_id, event_id=row.event_id, event_type=row.event_type,
                      idempotency_key=row.idempotency_key, correlation_id=ev['correlation_id'],
                      causation_event_id=ev['causation_event_id'], persisted_at_utc=ev['persisted_at_utc'],
                      redaction_profile=ev['redaction_profile'], source_schema_id=ev['payload_schema_id'],
                      producer_semantic_digest=NR.producer_digest(S.producer25(ev), where),
                      payload_sha256=W.sha256(S.canonical(ev['payload'])),
                      projector_replay_only=ev['replay_policy'] == 'projector_replay_only')
            ix['source_locator'].update(segment_generation=row.segment_generation,
                                        segment_name='segment-%d' % row.segment_generation, byte_offset=row.offset,
                                        sequence_id=row.sequence_id)
            ix['publication_locator'].update(manifest_generation=row.receipt['manifest_generation'],
                                             recovery_epoch=snap.token['source_selection']['recovery_epoch'],
                                             survivor_prefix_sha256=snap.token['source_selection'][
                                                 'manifest_survivor_prefix_sha256'],
                                             checkpoint_ref=snap.token['checkpoint_ref'])
            frame['frame_bytes_base64'] = base64.b64encode(raw).decode('ascii')
            ov = frame['original_value']
            for key in list(ov):
                if key == 'event':
                    ov['event'] = copy.deepcopy(ev)
                elif key in ('first_append_receipt', 'receipt'):
                    ov[key] = copy.deepcopy(row.receipt)
                elif key in ('exact_custody', 'custody') and row.custody is not None:
                    ov[key] = copy.deepcopy(row.custody)
                elif key == 'full_value_result' and row.custody is not None:
                    ov[key] = storage.full_value_result(row.event_id)
            frames.append(frame)
        return dict(frames=frames, token=copy.deepcopy(snap.token), coverage_sha256=snap.coverage_sha256,
                    gap_count=len(snap.gaps), complete=snap.complete)

    def project(self, snap, retained_by_event):
        run = self.world.ctx.goal_run_id
        project = self.world.ctx.project_id
        return self.source.project(snap, StartReducer(self.world, retained_by_event),
                                   select=lambda e: e['run_id'] == run and e['project_id'] == project)


def processed_prefix(world, result, row_key, row_value):
    e = world.edition
    gaps = world.ctx.storage.read_token()['source_selection']['retired_inputs_sha256']
    value = dict(generic_token=copy.deepcopy(result['token']), verified_row_count=result['processed'],
                 through_sequence_id=result['frontier_sequence'], coverage_sha256=result['coverage_sha256'],
                 retention_gap_sha256=gaps, row_key=row_key,
                 row_sha256=None if row_value is None else cdigest(row_value))
    e.bank.validate(e.consumer + '#/$defs/ProcessedPrefix', value, 'prefix/root')
    return value


# ------------------------------------------------------------------ S6 representation

class Representation:
    """started.physical.json successor rows and checkpoints over Storage packs."""

    def __init__(self, world):
        self.world = world
        self.selection = world.edition.selection
        self.bank = world.edition.bank

    def validate(self, name, value, code):
        self.bank.validate(SUCCESSOR + '#/$defs/' + name, value, code)

    def projection_key(self):
        c = self.world.ctx
        return 'goal_run_projection.started.reference.v1:%s:%s' % (K(c.project_id), K(c.goal_run_id))

    def checkpoint_key(self):
        c = self.world.ctx
        return 'goal_run_started_checkpoint.reference.v1:' + ':'.join(K(x) for x in (c.sid, c.project_id, c.goal_id,
                                                                                    c.goal_run_id))

    def dataset(self, generation_id):
        return 'goal_run_projection.started.reference.v1@' + generation_id

    def identity(self, record):
        ev = record['original_event']
        return dict(storage_instance_id=self.world.ctx.sid, scope=copy.deepcopy(record['scope']),
                    event_id=ev['event_id'], event_type=ev['event_type'], sequence_id=ev['sequence_id'],
                    idempotency_key=ev['idempotency_key'])

    @staticmethod
    def size(value):
        return len(S.canonical(value, 'representation/size'))

    def fits_row(self, wrapper):
        return self.size(wrapper) <= LIMIT and self.size(dict(table=wrapper['dataset_name'], key=wrapper['physical_key'],
                                                               value=wrapper)) <= LIMIT

    def fits_checkpoint(self, wrapper):
        return self.size(wrapper) <= LIMIT and self.size(dict(table='checkpoints', key=wrapper['physical_key'],
                                                               value=wrapper)) <= LIMIT

    def encode(self, record, generation_id, *, store=True, force=None):
        storage = self.world.ctx.storage
        wrapper = dict(schema_id='pm.goal_run_projection.started.reference.v1', schema_version='1.0.0',
                       storage_instance_id=self.world.ctx.sid, physical_key=self.projection_key(),
                       dataset_name=self.dataset(generation_id), event_identity=self.identity(record),
                       original_event_value_commitment=copy.deepcopy(record['original_event_value_commitment']),
                       content=dict(kind='inline', record=copy.deepcopy(record)))

        def ref(raw):
            if store:
                return storage.put_pack(raw, 'application/msgpack')
            from blake3 import blake3
            return dict(blake3=blake3(raw).hexdigest(), byte_size=len(raw), media_type='application/msgpack')
        if force != 'inline' and (force in ('event_reference', 'record_reference') or not self.fits_row(wrapper)):
            metadata = copy.deepcopy(record)
            event = metadata.pop('original_event')
            event_ref = ref(S.canonical(event))
            wrapper['content'] = dict(kind='event_reference', metadata=metadata, event_ref=event_ref)
            if force == 'record_reference' or (force is None and not self.fits_row(wrapper)):
                wrapper['content'] = dict(kind='record_reference', metadata_ref=ref(S.canonical(metadata)),
                                          event_ref=event_ref)
        self.validate('StorageProjection', wrapper, 'representation/row')
        require('representation/operation_size', self.fits_row(wrapper))
        return wrapper

    def unpack(self, reference, where):
        storage = self.world.ctx.storage
        raw = storage.read_pack(reference, expected_media_type='application/msgpack')
        return S.decode_canonical(raw, where)  # the shared decoder refuses noncanonical bytes

    def decode(self, wrapper, original, selection_check=True):
        """Reconstruct the whole original record and recheck every join."""
        self.validate('StorageProjection', wrapper, 'representation/row')
        require('representation/operation_size', self.fits_row(wrapper))
        content = wrapper['content']
        if content['kind'] == 'inline':
            record = copy.deepcopy(content['record'])
        elif content['kind'] == 'event_reference':
            record = copy.deepcopy(content['metadata'])
            record['original_event'] = self.unpack(content['event_ref'], 'representation/event_pack')
        else:
            record = self.unpack(content['metadata_ref'], 'representation/metadata_pack')
            require('representation/metadata_has_no_event', 'original_event' not in record)
            record['original_event'] = self.unpack(content['event_ref'], 'representation/event_pack')
        record = {k: record[k] for k in sorted(record)}
        self.bank.validate(self.world.edition.consumer + '#/$defs/Projection', record, 'representation/record')
        expected = projection_record(self.world, original)
        require('representation/record_equal', same(record, expected))
        for field, value in self.identity(record).items():
            require('representation/event_identity/' + field, same(wrapper['event_identity'][field], value))
        require('representation/commitment', same(wrapper['original_event_value_commitment'],
                                                  original['original_append']['exact_custody']['original_event_value_commitment']))
        require('representation/commitment_recomputed', wrapper['original_event_value_commitment']['sha256'] ==
                NR.full_value_commitment(record['original_event'], 'representation'))
        require('representation/key', wrapper['physical_key'] == self.projection_key())
        require('representation/storage', wrapper['storage_instance_id'] == self.world.ctx.sid)
        if selection_check:
            selected = self.encode(expected, wrapper['dataset_name'].split('@', 1)[1], store=False)
            require('representation/deterministic_kind', content['kind'] == selected['content']['kind'])
        return record

    def encode_checkpoint(self, logical, *, store=True, force=None):
        wrapper = dict(schema_id='pm.goal_run_started_checkpoint.reference.v1.storage', schema_version='1.0.0',
                       storage_instance_id=self.world.ctx.sid, physical_key=self.checkpoint_key(),
                       content=dict(kind='inline', checkpoint=copy.deepcopy(logical)))
        if force == 'payload_reference' or (force is None and not self.fits_checkpoint(wrapper)):
            raw = S.canonical(logical)
            reference = (self.world.ctx.storage.put_pack(raw, 'application/msgpack') if store else
                         dict(blake3=__import__('blake3').blake3(raw).hexdigest(), byte_size=len(raw),
                              media_type='application/msgpack'))
            wrapper['content'] = dict(kind='payload_reference', reference=reference)
        self.validate('StorageCheckpoint', wrapper, 'representation/checkpoint')
        require('representation/checkpoint_operation_size', self.fits_checkpoint(wrapper))
        return wrapper

    def decode_checkpoint(self, wrapper):
        self.validate('StorageCheckpoint', wrapper, 'representation/checkpoint')
        require('representation/checkpoint_operation_size', self.fits_checkpoint(wrapper))
        content = wrapper['content']
        logical = (copy.deepcopy(content['checkpoint']) if content['kind'] == 'inline'
                   else self.unpack(content['reference'], 'representation/checkpoint_pack'))
        logical = {k: logical[k] for k in sorted(logical)}
        self.validate('LogicalCheckpoint', logical, 'representation/logical_checkpoint')
        require('checkpoint/storage', wrapper['storage_instance_id'] == self.world.ctx.sid ==
                logical['storage_instance_id'])
        require('checkpoint/key', wrapper['physical_key'] == self.checkpoint_key() == logical['physical_key'])
        require('checkpoint/scope', same(logical['scope'], self.world.ctx.scope))
        selected = self.encode_checkpoint(logical, store=False)
        require('checkpoint/deterministic_kind', content['kind'] == selected['content']['kind'])
        return logical


# ------------------------------------------------------------------ S5 projector

class HoldOwner(W.DGOwner):
    """TEST_ONLY projection hold owner (RP-PROJECTION-3GEN holds)."""
    role = 'projection_hold'

    def hold(self, reason):
        return self.owner_id, self.issue(None, dict(qualification=QUALIFICATION, reason=reason), kind='hold')


class StartedProjector(W.DGOwner):
    """``owner.goal_run.started.project_prefix.reference.v1`` and its lower
    Storage publisher. State lives only in TEST_ONLY Storage cells."""
    role = 'goal_run_started_projector'

    def __init__(self, registry, *, world=None, **kw):
        self.world = world
        super().__init__(registry, **kw)
        self.rep = Representation(world)

    def install_key(self):
        return self.world.ctx.run_key('goal_run_started_projector_installation.reference.v1')

    def installation(self):
        cell = self.world.ctx.storage.cell('goal_run_started_projector_installation', self.install_key())
        return None if cell is None else cell

    def install(self):
        e = self.world.edition
        value = dict(qualification=QUALIFICATION, profile='goal_run_started_projector.reference.v1',
                     selection=e.selection['new_whole_schema'], method=e.selection['projection_method'],
                     state='installed', epoch=1)
        current = self.installation()
        if current is not None:
            value['epoch'] = current['value']['epoch'] + 1
        self.world.ctx.storage.transact([dict(table='goal_run_started_projector_installation', key=self.install_key(),
                                              expected=None if current is None else current['version'], value=value)])
        return value

    def withdraw(self):
        current = self.installation()
        require('projector/not_installed', current is not None)
        value = dict(current['value'], state='withdrawn')
        self.world.ctx.storage.transact([dict(table='goal_run_started_projector_installation', key=self.install_key(),
                                              expected=current['version'], value=value)])

    def require_installed(self, where):
        current = self.installation()
        require(where + '/projector_withdrawn', current is not None and current['value']['state'] == 'installed')
        return current

    def checkpoint(self):
        cell = self.world.ctx.storage.cell('checkpoints', self.rep.checkpoint_key())
        if cell is None:
            return None, None
        return cell, self.rep.decode_checkpoint(cell['value'])

    def _logical(self, generations, current_id):
        c = self.world.ctx
        logical = dict(schema_id='pm.goal_run_started_checkpoint.reference.v1', schema_version='1.0.0',
                       storage_instance_id=c.sid, scope=copy.deepcopy(c.scope), physical_key=self.rep.checkpoint_key(),
                       current_generation_id=current_id, generations=generations)
        self.rep.validate('LogicalCheckpoint', logical, 'projector/logical')
        return logical

    def stage(self, holds=()):
        """Reserve a fresh isolated generation (max three slots). Holds are
        owner-issued originals acquired through the registry, never strings."""
        storage, c = self.world.ctx.storage, self.world.ctx
        with self.recorder.call(self.owner_id, 'stage'):
            self.require_installed('stage')
            holds = [A.acquire(self.registry, owner_id, 'projection_hold', handle)[0] for owner_id, handle in holds]
            cell, logical = self.checkpoint()
            generations = {} if logical is None else copy.deepcopy(logical['generations'])
            if len(generations) >= 3:
                self._retire_eligible(generations)
            require('projector/generation_limit', len(generations) < 3)
            seed = storage.new_seed()
            token = storage.read_token()
            anchor = W.sha256(S.binding(['pm.goal_test.dg_s.generation_anchor.v1', seed, c.sid, c.project_id, c.goal_id,
                                         c.goal_run_id, 'goal_run_started_projector.reference.v1',
                                         token['frontier_sha256']]))
            gid = 'grsg_' + anchor
            gen = W.skeleton(self.world.edition.bank, SUCCESSOR + '#/$defs/Generation')
            empty = W.sha256(S.binding(['pm.goal_test.dg_s.empty_frontier.v1', anchor]))
            gen.update(generation_id=gid, state='staged', anchor_sha256=anchor, seed_hex=seed, scope=copy.deepcopy(c.scope),
                       source_token_at_birth=token, dataset_name=self.rep.dataset(gid), frontier_revision=0,
                       prior_frontier_sha256=None, frontier_sha256=empty,
                       processed=dict(generic_token=token, verified_row_count=0, through_sequence_id=None,
                                      coverage_sha256=empty, retention_gap_sha256=token['source_selection'][
                                          'retired_inputs_sha256'], row_key=None, row_sha256=None),
                       last_transaction_id='TEST_ONLY:none', activated_at_utc=None, retired_at_utc=None,
                       first_prepared_at_utc=c.now(), successor_generation_id=None, hold_refs=sorted(holds))
            generations[gid] = gen
            current_id = None if logical is None else logical['current_generation_id']
            wrapper = self.rep.encode_checkpoint(self._logical(generations, current_id))
            storage.transact([dict(table='checkpoints', key=self.rep.checkpoint_key(),
                                   expected=None if cell is None else cell['version'], value=wrapper)])
            return gid

    def _retire_eligible(self, generations):
        now = NR.storage_time(self.world.ctx.storage._tick(), 'projector/now')
        for gid, gen in sorted(generations.items()):
            if gen['state'] != 'retired' or gen['hold_refs']:
                continue
            retired = gen['retired_at_utc']
            if retired is None:
                continue
            if _seconds(now) - _seconds(retired) >= RETIREMENT_SECONDS:
                del generations[gid]
                return

    def replay(self, gid, retained_by_event=None, *, cut=None, tamper=None):
        """Replay the full authentic source into a staged generation and publish
        row + checkpoint in one transaction under full CAS."""
        storage = self.world.ctx.storage
        with self.recorder.call(self.owner_id, 'project_prefix', dict(generation=gid)) as slot:
            self.require_installed('project')
            cell, logical = self.checkpoint()
            require('projector/no_checkpoint', logical is not None and gid in logical['generations'])
            gen = logical['generations'][gid]
            require('projector/generation_state', gen['state'] in ('staged', 'current'))
            source = GenericStartSource(self.world)
            snap = source.acquire()
            original = original_started(self.world, where='project/original')
            retained = retained_by_event or {original['original_append']['event']['event_id']: original['native_start']}
            result = source.project(snap, retained)
            require('projector/' + (result['halt'][0] if result['halt'] else 'halt'), result['complete'])
            require('projector/no_start', result['state']['started'] is not None)
            record = projection_record(self.world, original)
            row = self.rep.encode(record, gid)
            if tamper:
                row = tamper(row)
            # lower publisher: rederive the afterimage itself; never trust a caller row
            expected = self.rep.encode(projection_record(self.world, original_started(
                self.world, where='project/lower_original')), gid, store=False)
            require('projector/row_rederive', same(row, expected))
            self.rep.decode(row, original)
            prefix = processed_prefix(self.world, result, self.rep.projection_key(), row)
            new = copy.deepcopy(gen)
            frontier = W.sha256(S.binding(['pm.goal_test.dg_s.frontier.v1', gen['frontier_sha256'],
                                           prefix['coverage_sha256'], prefix['row_sha256']]))
            new.update(frontier_revision=gen['frontier_revision'] + 1, prior_frontier_sha256=gen['frontier_sha256'],
                       frontier_sha256=frontier, processed=prefix)
            existing = storage.cell(gen['dataset_name'], self.rep.projection_key())
            done = gen['processed']
            if (existing is not None and same(existing['value'], row) and done['row_sha256'] == prefix['row_sha256']
                    and done['coverage_sha256'] == prefix['coverage_sha256']
                    and done['generic_token']['frontier_sha256'] == prefix['generic_token']['frontier_sha256']):
                slot.set(dict(replay='lost_acknowledgement'))
                return dict(tx_id=gen['last_transaction_id'], replay=True, row=row)
            generations = copy.deepcopy(logical['generations'])
            generations[gid] = new
            # the joint transaction id is Storage's; record it after commit in the same write set
            next_tx = 'TEST_ONLY:tx:%s:%d' % (storage.storage_instance_id, storage.tx_counter + 1)
            new['last_transaction_id'] = next_tx
            ck = self.rep.encode_checkpoint(self._logical(generations, logical['current_generation_id']))
            writes = [dict(table=gen['dataset_name'], key=self.rep.projection_key(),
                           expected=None if existing is None else existing['version'], value=row),
                      dict(table='checkpoints', key=self.rep.checkpoint_key(), expected=cell['version'], value=ck)]
            self.require_installed('project_final')
            tx = storage.transact(writes, cut_before=cut if cut == 'before_terminal' else None,
                                  cut_after=cut if cut == 'after_terminal' else None)
            require('projector/transaction_id', tx['tx_id'] == next_tx)
            result_value = dict(checkpoint=ck, projection=row, effects='projection_and_own_checkpoint_only')
            self.rep.validate('ProjectorResult', result_value, 'projector/result')
            slot.set(dict(tx=tx['tx_id']))
            return dict(tx_id=tx['tx_id'], replay=False, row=row, result=result_value)

    def cutover(self, gid):
        storage, c = self.world.ctx.storage, self.world.ctx
        with self.recorder.call(self.owner_id, 'cutover', dict(generation=gid)):
            self.require_installed('cutover')
            cell, logical = self.checkpoint()
            gen = logical['generations'].get(gid)
            require('cutover/unknown_generation', gen is not None and gen['state'] == 'staged')
            token = storage.read_token()
            snap = GenericStartSource(self.world).acquire()
            require('cutover/incomplete_coverage', snap.complete and gen['processed']['coverage_sha256'] ==
                    snap.coverage_sha256 and gen['processed']['generic_token']['frontier_sha256'] ==
                    token['frontier_sha256'])
            row = storage.cell(gen['dataset_name'], self.rep.projection_key())
            require('cutover/row_missing', row is not None and gen['processed']['row_sha256'] == cdigest(row['value']))
            original = original_started(self.world, where='cutover/original')
            self.rep.decode(row['value'], original)
            generations = copy.deepcopy(logical['generations'])
            now = c.now()
            old = logical['current_generation_id']
            if old is not None:
                generations[old].update(state='retired', retired_at_utc=now, successor_generation_id=gid)
            generations[gid].update(state='current', activated_at_utc=now)
            ck = self.rep.encode_checkpoint(self._logical(generations, gid))
            return storage.transact([dict(table='checkpoints', key=self.rep.checkpoint_key(), expected=cell['version'],
                                          value=ck)])

    def current_row(self, where='projection'):
        cell, logical = self.checkpoint()
        require(where + '/no_checkpoint', logical is not None and logical['current_generation_id'] is not None)
        gen = logical['generations'][logical['current_generation_id']]
        row = self.world.ctx.storage.cell(gen['dataset_name'], self.rep.projection_key())
        require(where + '/row_missing', row is not None)
        require(where + '/row_checkpoint_join', gen['processed']['row_sha256'] == cdigest(row['value']))
        return cell, logical, gen, row


def _seconds(text):
    import datetime as dt
    return dt.datetime.strptime(text[:19], '%Y-%m-%dT%H:%M:%S').replace(tzinfo=dt.timezone.utc).timestamp()


def advance_clock(world, seconds):
    """TEST_ONLY modeled time: the test-owner Storage clock jumps forward."""
    storage = world.ctx.storage
    storage.clock_last_ms = NR.uint64(storage.clock_last_ms + seconds * 1000, 'clock/advance')
    storage._commit_state()


# ------------------------------------------------------------------ S4 readers

class StartedReaders(W.DGOwner):
    """read_retained_native / inspect_original / read_historical / read_current."""
    role = 'goal_run_started_consumer'

    def __init__(self, registry, *, world=None, projector=None, **kw):
        self.world = world
        self.projector = projector
        super().__init__(registry, **kw)
        self.withdrawn_readers = set()

    def _request(self, request, where):
        e = self.world.edition
        e.bank.validate(e.consumer + '#/$defs/ScopeRequest', request, where + '/request')
        require(where + '/request_scope', same(request['scope'], self.world.ctx.scope) and
                request['storage_instance_id'] == self.world.ctx.sid)

    def _hook(self, hooks, name):
        if hooks and name in hooks:
            storage = self.world.ctx.storage
            before = (storage.manifest_generation, storage.cell_generation)
            hooks[name](self.world)
            self._delta[0] += storage.manifest_generation - before[0]
            self._delta[1] += storage.cell_generation - before[1]

    def _unavailable(self, code):
        reason = 'MISSING_ORIGINAL_VALUE'
        for key, value in UNSUPPORTED_REASON.items():
            if key in code:
                reason = value
        value = dict(scope=copy.deepcopy(self.world.ctx.scope), reason=reason, effects='none', current_state_asserted=False)
        self.world.edition.bank.validate(self.world.edition.consumer + '#/$defs/Unavailable', value, 'reader/unavailable')
        return value

    def _passive(self, method, where, body, request, hooks):
        storage = self.world.ctx.storage
        with self.recorder.call(self.owner_id, method, request) as slot:
            generation = storage.manifest_generation
            cells = storage.cell_generation
            self._delta = [0, 0]
            try:
                self._request(request, where)
                require(where + '/reader_withdrawn', method not in self.withdrawn_readers)
                result = body(hooks)
                require(where + '/reader_withdrawn_final', method not in self.withdrawn_readers)
            finally:
                require(where + '/passive_effect', storage.manifest_generation - generation == self._delta[0] and
                        storage.cell_generation - cells == self._delta[1])
            slot.set(result)
            return result

    # helpers ---------------------------------------------------------------
    def h_retained(self, where):
        with self.recorder.call(self.owner_id, 'helper:retained_native'):
            return retained_native(self.world, where=where + '/retained')

    def h_original(self, where):
        with self.recorder.call(self.owner_id, 'helper:original'):
            return original_started(self.world, where=where + '/original')

    def h_generic(self, original, where):
        with self.recorder.call(self.owner_id, 'helper:generic'):
            source = GenericStartSource(self.world)
            snap = source.acquire()
            event_id = original['original_append']['event']['event_id']
            rows = [r for r in snap.rows if r.event_id == event_id]
            require(where + '/generic_row_missing', len(rows) == 1)
            row = rows[0]
            require(where + '/generic_custody', row.custody is not None and same(row.custody,
                                                                                 original['original_append']['exact_custody']))
            require(where + '/generic_event', same(row.event, original['original_append']['event']))
            generic = source.generic_snapshot(snap)
            return snap, generic

    def h_projection(self, original, where):
        with self.recorder.call(self.owner_id, 'helper:projection'):
            require(where + '/no_projector', self.projector is not None)
            self.projector.require_installed(where)
            cell, logical, gen, row = self.projector.current_row(where)
            record = self.projector.rep.decode(row['value'], original)
            return cell, logical, gen, row, record

    def h_current_start(self, original, where):
        with self.recorder.call(self.owner_id, 'helper:current_start'):
            w = self.world
            native = w.owners['native'].current()
            n = original['native_start']
            after = n['original_d01_update']['record']['transition']['after']
            require(where + '/native_advanced', native['body']['record']['revision'] == after['body_revision'])
            require(where + '/native_status', native['body']['record']['status'] == 'running' and
                    native['body']['record']['activation_state']['state'] == 'active')
            require(where + '/native_body_join', cdigest(native['body']) == after['body']['physical_value_sha256'])
            control = w.owners['native'].start_control()['value']
            require(where + '/start_control_current', same(control, n['control']))
            d01 = w.owners['d01']
            pointer = w.ctx.storage.cell(ST.d01_families(w.edition)['pointer'], d01.pointer_key())
            require(where + '/d01_pointer_current', pointer is not None and
                    pointer['value']['record']['workflow_head']['physical_value_sha256'] ==
                    cdigest(n['original_d01_head']))
            source = d01.current_source(native)
            current = dict(d01_current=source, control=control, initial_control_origin=n['initial_control_origin'],
                           commit=n['commit'], origin=n['origin'])
            w.edition.bank.validate(w.edition.custody + '#/$defs/CurrentStartSource', current, where + '/current_start')
            return current

    def h_current_goal(self, where):
        with self.recorder.call(self.owner_id, 'helper:current_goal'):
            w = self.world
            goal = w.owners['goal'].current_argument()
            w.edition.goal_bank.validate(w.edition.goal_arg + '#/$defs/CurrentGoalArgument', goal, where + '/current_goal')
            require(where + '/goal_stopped', goal['stop']['record']['latched'] is False)
            require(where + '/goal_association', goal['binding_revision']['record']['active_run_ref'] ==
                    w.ctx.goal_run_id)
            require(where + '/goal_state', goal['body']['record']['state'] == 'active')
            return goal

    # methods ---------------------------------------------------------------
    def read_retained_native(self, request, hooks=None):
        where = 'read_retained_native'

        def body(hooks):
            retained = self.h_retained(where)
            self._hook(hooks, 'after_retained')
            final = retained_native(self.world, where=where + '/final')
            require(where + '/final_fence', same(final, retained))
            return retained
        return self._passive(where, where, body, request, hooks)

    def inspect_original(self, request, hooks=None):
        where = 'inspect_original'

        def body(hooks):
            original = self.h_original(where)
            self._hook(hooks, 'after_original')
            snap, generic = self.h_generic(original, where)
            self._hook(hooks, 'after_generic')
            private = dict(generic=generic['frames'], native_start=original['native_start'])
            final = original_started(self.world, where=where + '/final')
            require(where + '/final_fence', same(final, original))
            snap2 = GenericStartSource(self.world).acquire()
            require(where + '/final_generic', snap2.complete and snap2.coverage_sha256 == snap.coverage_sha256)
            self.last_private = private
            return original
        return self._passive(where, where, body, request, hooks)

    def read_historical(self, request, hooks=None):
        where = 'read_historical'

        def body(hooks):
            original = self.h_original(where)
            self._hook(hooks, 'after_original')
            snap, generic = self.h_generic(original, where)
            self._hook(hooks, 'after_generic')
            cell, logical, gen, row, record = self.h_projection(original, where)
            self._hook(hooks, 'after_projection')
            final = original_started(self.world, where=where + '/final')
            require(where + '/final_fence', same(final, original))
            _, _, _, row2, _ = self.h_projection(original, where + '/final')
            require(where + '/final_projection', same(row2['value'], row['value']))
            value = dict(original=original, projection=row['value'], current_state_asserted=False)
            self.world.edition.bank.validate(SUCCESSOR + '#/$defs/HistoricalRead', value, where + '/root')
            return value
        return self._passive(where, where, body, request, hooks)

    def read_current(self, request, hooks=None):
        where = 'read_current'

        def body(hooks):
            original = self.h_original(where)
            self._hook(hooks, 'after_original')
            snap, generic = self.h_generic(original, where)
            require(where + '/incomplete_coverage', snap.complete)
            self._hook(hooks, 'after_generic')
            cell, logical, gen, row, record = self.h_projection(original, where)
            require(where + '/stale_generic_token', gen['processed']['generic_token']['frontier_sha256'] ==
                    snap.token['frontier_sha256'] and gen['processed']['coverage_sha256'] == snap.coverage_sha256)
            self._hook(hooks, 'after_projection')
            current = self.h_current_start(original, where)
            self._hook(hooks, 'after_current_start')
            goal = self.h_current_goal(where)
            self._hook(hooks, 'after_current_goal')
            # final boundary: every source reacquired after the last helper
            require(where + '/final_original', same(original_started(self.world, where=where + '/final'), original))
            snap2 = GenericStartSource(self.world).acquire()
            require(where + '/final_generic', snap2.complete and snap2.coverage_sha256 == snap.coverage_sha256)
            cell2, _, _, row2, _ = self.h_projection(original, where + '/final')
            require(where + '/final_projection', same(row2['value'], row['value']) and same(cell2['value'], cell['value']))
            require(where + '/final_current_start', same(self.h_current_start(original, where + '/final'), current))
            require(where + '/final_current_goal', same(self.h_current_goal(where + '/final'), goal))
            value = dict(original=original, projection=row['value'], checkpoint=cell['value'], current_native=current,
                         interpretation='native_verified_running_as_of_same_snapshot', action_authority=False)
            self.world.edition.bank.validate(SUCCESSOR + '#/$defs/CurrentRead', value, where + '/root')
            return value
        return self._passive(where, where, body, request, hooks)
