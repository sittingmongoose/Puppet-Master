#!/usr/bin/env python3
"""DG-CF3 combined started/cancelled/certified consumer on the certified
reference successor (TEST_ONLY).

native evidence stays NOT_RUN and is a separate claim; a planning PASS must
never read as native proof.

* ``reduce_prefix`` is the bounded P4 reducer.  It runs over the adapter's
  ``GenericSource`` snapshot (whole CURRENT/manifest/segments, every raw frame
  decoded and CRC-checked, index rows rebuilt and compared with first custody,
  retention gaps authenticated) in exact global order.  Every row is checked
  against the registered family table before any off-run no-op; same-run
  started/cancelled/certified rows apply their original branch predicates
  against the exact stored native/D01/Standard/coordinator/D05/D06 records of
  the same Storage snapshot; unsupported same-run rows, second terminals,
  Start after terminal and certification without a scanned Start or an
  authenticated expired-Start survivor proof halt before the row.
* ``derive`` computes stage/advance/cutover afterimages: P5 keys (K(s) is
  unpadded base64url of exact UTF-8), anchor, frontier chain, processed
  coverage/gap digests, the reference-successor row form and the checkpoint.
* ``LowerStorage`` (owner.storage...publish.reference.v1) is the only writer.
  It independently re-acquires everything, rederives the afterimages with the
  Storage-issued transaction id and time, compares the whole candidate,
  verifies every referenced pack, reruns a final predicate after the last
  helper and commits row + checkpoint in one Storage transaction under
  per-key CAS.  ``Projector`` (owner.goal_run...project_prefix.reference.v1)
  only requests publication.
* ``Reader`` reopens root/row/checkpoint in one snapshot and rederives the row
  from lawful retained originals.

Lifecycle follows RP-PROJECTION-3GEN@1.0.0: at most three generations, current
without TTL, retired + 604800 s eligibility subject to actual hold authority.
"""
from __future__ import annotations

import copy
import json

import blake3

import pm_goal_test_numrule as NR
import pm_goal_test_storage as S
import pm_goal_test_owner_adapters as A
from pm_goal_test_source import GenericSource, SourceSnapshot
import pm_goal_dg_cf3_world as W
from pm_goal_dg_cf3_world import F, LaneRefusal, require, run_key, selector_for, value_sha, resolve

QUALIFICATION = 'TEST_ONLY'
NATIVE_LINE = W.NATIVE_LINE
D = 'Plans/goal_run_projection_reference_contracts/'
ROW_PREFIX = 'goal_run_projection.started_cancelled_certified.reference.v1'
CHECKPOINT_TABLE = 'checkpoints'
CHECKPOINT_SCHEMA = 'pm.goal_run_started_cancelled_certified_checkpoint.reference.v1'
PROFILE_NAME = 'goal_run_started_cancelled_certified_projector.reference.v1'
ANCHOR_DOMAIN = 'goal_run_started_cancelled_certified_anchor.v1'
FRONTIER_DOMAIN = 'goal_run_started_cancelled_certified_frontier.v1'
PROJECT_METHOD = 'owner.goal_run.started_cancelled_certified.project_prefix.reference.v1'
PUBLISH_METHOD = 'owner.storage.goal_run.started_cancelled_certified.publish.reference.v1'
RETIREMENT_SECONDS = 604800
MAX_GENERATIONS = 3
CONTROL_TABLE = 'TEST_ONLY:consumer_controls'
HOLD_TABLE = 'TEST_ONLY:projection_hold_authority'
SUPPORTED = ('goal_run.started', 'goal_run.cancelled', 'goal_run.certified')
REGISTERED = {'goal_run.started': W.STARTED_PAYLOAD, 'goal_run.cancelled': W.CANCELLED_PAYLOAD,
              'goal_run.certified': W.CERTIFIED_PAYLOAD, 'goal_test.note': W.NOTE_PAYLOAD,
              'goal_test.cause': W.CAUSE_PAYLOAD, **W.OTHER_GOAL_RUN}
SEGLOG_FENCE_EXCLUDED = ('current_bytes_sha256', 'manifest_bytes_sha256', 'manifest_generation')


class Halt(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


def halt(code, condition):
    if not condition:
        raise Halt(code)


def exact(a, b):
    from pm_goal_own_c3_w5_projection_oracles import exact as _exact
    return _exact(a, b)


def canon(value):
    return S.canonical(value, 'projector/canonical')


def sha(value):
    return W.sha256(canon(value))


# ----------------------------------------------------------------- bank/rep

_BANK = {}


def representation():
    """One W5 projection bank + representation per process (read-only import)."""
    if 'rep' not in _BANK:
        from pm_goal_own_c3_w5_projection_oracles import ProjectionBank, Representation
        rep = Representation(ProjectionBank())
        validate, memo = rep.validate, {}

        def cached(root, value, *, original=False):
            # Pure on identical bytes: the memo key is the exact typed JSON text.
            key = (root, original, json.dumps(value, sort_keys=True, ensure_ascii=False))
            if key not in memo:
                try:
                    validate(root, value, original=original)
                    memo[key] = None
                except Exception as error:  # remember the refusal for these exact bytes
                    memo[key] = error
            if memo[key] is not None:
                raise memo[key]
        rep.validate = cached
        _BANK['rep'] = rep
    return _BANK['rep']


def installed_profile():
    """Acquire the complete installed derived profile and compute P5's digest."""
    if 'profile' not in _BANK:
        selection = json.loads((W.ROOT / (D + 'certified.selection.json')).read_bytes())
        member = selection['installed_profile']
        raw = (W.ROOT / member['path']).read_bytes()
        require('profile/file_sha256', W.sha256(raw) == member['sha256'])
        doc = json.loads(raw)
        digest = W.sha256(json.dumps(doc, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8'))
        require('profile/logical_digest', digest == selection['installed_profile_logical_sha256'])
        _BANK['profile'] = dict(profile_digest=digest, file_sha256=member['sha256'], path=member['path'])
    return copy.deepcopy(_BANK['profile'])


class StoragePacks:
    """SP-337 pack route through the actual Storage pack owner."""

    def __init__(self, storage, controls, rep):
        self.storage, self.controls, self.rep = storage, controls, rep

    def raw(self, value):
        return self.rep.pack(value)

    def put(self, value):
        raw = self.raw(value)
        return self.storage.put_pack(raw, 'application/msgpack')

    def describe(self, value):
        raw = self.raw(value)
        return dict(blake3=blake3.blake3(raw).hexdigest(), byte_size=len(raw), media_type='application/msgpack')

    def get(self, reference):
        require('pack/reference_fields', type(reference) is dict and
                set(reference) == {'blake3', 'byte_size', 'media_type'})
        require('pack/access', not self.controls.state(self.storage)['pack_access_revoked'])
        raw = self.storage.read_pack(reference, expected_media_type='application/msgpack')
        try:
            value = self.rep.unpack(raw)
        except (ValueError, UnicodeError, TypeError):
            raise LaneRefusal('pack/canonical_decode') from None
        require('pack/noncanonical', self.rep.pack(value) == raw)
        return value


class Rep:
    """Successor row/checkpoint forms with packs bound to one Storage."""

    def __init__(self, storage, controls):
        self.w5 = representation()
        self.store = StoragePacks(storage, controls, self.w5)

    def _bind(self):
        self.w5.store = self.store
        return self.w5

    def encode(self, record, dataset, *, publish):
        return self._bind().encode(record, dataset, publish_payloads=publish)

    def decode(self, row, expected, dataset):
        return self._bind().decode(row, expected, dataset)

    def encode_checkpoint(self, checkpoint, *, publish):
        return self._bind().encode_checkpoint(checkpoint, publish_payloads=publish)

    def decode_checkpoint(self, row):
        w5 = self._bind()
        w5.validate('StorageCheckpoint', row)
        require('checkpoint/size', w5.fits(row, True))
        content = row['content']
        value = content['checkpoint'] if content['kind'] == 'inline' else self.store.get(content['reference'])
        return w5.decode_checkpoint(row, value)

    def validate(self, root, value, *, original=False):
        return self.w5.validate(root, value, original=original)

    def refs(self, row):
        content = row['content']
        if content['kind'] == 'event_reference':
            return [content['event_ref']]
        if content['kind'] == 'record_reference':
            return [content['metadata_ref'], content['event_ref']]
        if content['kind'] == 'payload_reference':
            return [content['reference']]
        return []


def row_table(generation_id):
    return ROW_PREFIX + '@' + generation_id


def row_key(scope):
    return ROW_PREFIX + ':' + W.K(scope['project_id']) + ':' + W.K(scope['goal_run_id'])


def checkpoint_key(scope):
    return 'goal_run_started_cancelled_certified_checkpoint.reference.v1:' + ':'.join(
        W.K(scope[k]) for k in ('storage_instance_id', 'project_id', 'goal_id', 'goal_run_id'))


def seglog_fence(token):
    """Token fields the seglog alone determines.  The adapter Storage co-persists
    redb cells in its manifest, so CURRENT/manifest bytes, manifest generation and
    checkpoint_ref move with any cell transaction (adapter note, same as DG-CF2)."""
    token = copy.deepcopy(token)
    token.pop('checkpoint_ref')
    for key in SEGLOG_FENCE_EXCLUDED:
        token['source_selection'].pop(key)
    return token


# ----------------------------------------------------------------- controls

class ControlOwner(W.StorageCellOwner):
    """TEST_ONLY disclosure/withdrawal/access/tombstone owner (durable cells)."""
    role = 'consumer_controls'
    DEFAULT = dict(projector_withdrawn=False, reader_withdrawn=False, pack_access_revoked=False,
                   source_disclosure_revoked=False, tombstones=[], epoch=0)

    def state(self, storage=None):
        storage = storage or self.storage
        cell = storage.cell(CONTROL_TABLE, 'controls:' + W.K(storage.storage_instance_id))
        return copy.deepcopy(cell['value']['state']) if cell else copy.deepcopy(self.DEFAULT)

    def set(self, **changes):
        key = 'controls:' + W.K(self.storage.storage_instance_id)
        cell = self.storage.cell(CONTROL_TABLE, key)
        state = self.state()
        state.update(changes)
        state['epoch'] += 1
        value = W.record(CONTROL_TABLE, owner_id=self.owner_id, state=state)
        return self.storage.transact([dict(table=CONTROL_TABLE, key=key, expected=cell['version'] if cell else None,
                                           value=value)])


class HoldOwner(W.StorageCellOwner):
    """TEST_ONLY hold authority: an actual issued hold record per generation.
    A string in ``hold_refs`` without this record holds nothing."""
    role = 'hold_authority'

    def hold(self, generation_id, reason='TEST_ONLY:legal-hold'):
        value = W.record(HOLD_TABLE, owner_id=self.owner_id, owner_epoch=self.owner_epoch,
                         generation_id=generation_id, reason=reason)
        return self.storage.transact([dict(table=HOLD_TABLE, key=generation_id, expected=None, value=value)])

    def release(self, generation_id):
        cell = self.storage.cell(HOLD_TABLE, generation_id)
        return self.storage.transact([dict(table=HOLD_TABLE, key=generation_id, expected=cell['version'],
                                           delete=True)])

    @staticmethod
    def held(cells, generation_id, registry):
        cell = cells.get(HOLD_TABLE, {}).get(generation_id)
        if cell is None:
            return False
        owner_id = cell['value'].get('owner_id')
        try:
            registry.owner(owner_id, 'hold_authority')
        except A.AdapterRefusal:
            return False
        return cell['value'].get('generation_id') == generation_id


# ----------------------------------------------------------------- sources

class Sources:
    """One coordinated acquisition: generic source + Storage cells, same seglog."""

    def __init__(self, storage, scope, controls, *, snapshot=None):
        self.storage = storage
        self.scope = copy.deepcopy(scope)
        src = storage.acquire_source()
        cells_snapshot = storage.snapshot()
        require('sources/coordinated_snapshot', seglog_fence(src['token']) == seglog_fence(cells_snapshot['token']))
        self.generic = GenericSource(storage).acquire(snapshot or src)
        self.cells = cells_snapshot['cells']
        self.cell_generation = cells_snapshot['cell_generation']
        self.token = copy.deepcopy(src['token'])
        self.controls = controls.state(storage)
        self.issued_seeds = list(storage.seeds)
        cp = self.cells.get(CHECKPOINT_TABLE, {}).get(checkpoint_key(scope))
        self.checkpoint_cell = copy.deepcopy(cp)
        self.profile = installed_profile()

    def fence(self):
        cp = self.checkpoint_cell
        return dict(seglog=seglog_fence(self.token), checkpoint_version=None if cp is None else cp['version'],
                    controls=self.controls, coverage=self.generic.coverage_sha256, defect=self.generic.defect,
                    rows=len(self.generic.rows),
                    authority=sha({t: v for t, v in self.cells.items()
                                   if not t.startswith(ROW_PREFIX) and t != CHECKPOINT_TABLE}))


# ----------------------------------------------------------------- reducer

def index_row(row):
    return [row.event_id, row.sequence_id, row.segment_generation, row.offset, row.length, row.frame_sha256,
            row.scope_partition, row.event_type, row.idempotency_key, copy.deepcopy(row.receipt), row.group_digest]


def _cell(cells, table, key):
    cell = cells.get(table, {}).get(key)
    return None if cell is None else cell


def _sel_of(sid, cells, table, key, code):
    cell = _cell(cells, table, key)
    halt(code, cell is not None)
    return selector_for(sid, table, key, cell['value'])


def _resolve(cells, selector, sid, code):
    try:
        return resolve(cells, selector, sid, where=code)[0]
    except LaneRefusal as error:
        raise Halt(error.code) from None


def _commitment_shape(c):
    return type(c) is dict and c.get('kind') == 'historical_native_issuance_commitment'


def _common_original(row, ev):
    custody = row.custody
    halt('reducer/first_receipt_barrier', row.receipt['durability_class'] == 'barrier')
    halt('reducer/custody_receipt', exact(custody['first_append_receipt'], row.receipt))
    return custody


def _start_record(state, row, scope, cells, sid):
    ev = row.event
    halt('reducer/start_after_terminal', state['terminal'] is None)
    halt('reducer/duplicate_start', state['start'] is None)
    custody = _common_original(row, ev)
    commit = _cell(cells, F['start_commit'], run_key(scope, 'start_commit'))
    halt('start/commit_unavailable', commit is not None)
    c = commit['value']
    halt('start/commit_event', c['event_id'] == ev['event_id'] and c['sequence_id'] == row.sequence_id)
    halt('start/first_receipt', c['first_receipt_sha256'] == value_sha(row.receipt))
    cand = _resolve(cells, c['candidate'], sid, 'start/candidate')
    halt('start/candidate_event', cand['event_id'] == ev['event_id'] and
         cand['producer_semantic_digest'] == custody['producer_semantic_digest'])
    update = _resolve(cells, c['d01_update'], sid, 'start/d01_update')
    origin = _resolve(cells, c['d01_origin'], sid, 'start/d01_origin')
    head = _resolve(cells, c['d01_head'], sid, 'start/d01_head')
    halt('start/d01_join', exact(update['before'], cand['before']) and exact(origin['update'], c['d01_update']) and
         exact(head['update'], c['d01_update']) and exact(head['after'], update['after']))
    before, after = update['before'], update['after']
    halt('start/native_transition', before['status'] == 'ready' and after['status'] == 'running' and
         after['activation_state'] == 'active' and after['body_revision'] == before['body_revision'] + 1)
    p = ev['payload']
    halt('start/revisions', p['expected_goal_run_revision'] == before['body_revision'] and
         p['goal_run_revision'] == after['body_revision'])
    halt('start/goal_revision', p['goal_revision'] == c['goal_revision'])
    for name, sel in c['goal_context'].items():
        _resolve(cells, sel, sid, 'start/goal_context/' + name)
    o = _cell(cells, F['start_origin'], run_key(scope, 'start_origin'))
    halt('start/origin_unavailable', o is not None)
    halt('start/origin_join', exact(o['value']['commit'], selector_for(sid, F['start_commit'],
                                                                         run_key(scope, 'start_commit'), c)))
    record = dict(scope=copy.deepcopy(scope), status_at_original_event='running', activation_at_original_event='active',
                  original_event=copy.deepcopy(ev), native_after_commitment=copy.deepcopy(after),
                  captured_goal_context=dict(**copy.deepcopy(c['goal_context']), goal_revision=c['goal_revision'],
                                             source_argument_sha256=value_sha(c['goal_context'])),
                  original_commit=selector_for(sid, F['start_commit'], run_key(scope, 'start_commit'), c),
                  original_origin=selector_for(sid, F['start_origin'], run_key(scope, 'start_origin'), o['value']),
                  original_d01_update=copy.deepcopy(c['d01_update']), original_d01_origin=copy.deepcopy(c['d01_origin']),
                  original_event_value_commitment=copy.deepcopy(custody['original_event_value_commitment']),
                  producer_semantic_digest=custody['producer_semantic_digest'],
                  first_append_receipt=copy.deepcopy(row.receipt), action_authority=False)
    state['start'] = dict(event_id=ev['event_id'], sequence_id=row.sequence_id, after=copy.deepcopy(after),
                          commit=copy.deepcopy(c))
    state['status'] = 'running'
    state['record'] = record


def _start_survivor(state, scope, cells, sid, gaps, sequence_id, code):
    """Expired-Start survivor proof: retained native Start lineage whose Start
    sequence is covered by an authenticated retention gap before this row."""
    commit = _cell(cells, F['start_commit'], run_key(scope, 'start_commit'))
    halt(code + '/start_lineage_missing', commit is not None)
    c = commit['value']
    covered = [g for g in gaps if g['first_sequence'] <= c['sequence_id'] <= g['last_sequence']]
    halt(code + '/without_start_proof', len(covered) == 1 and c['sequence_id'] < sequence_id)
    for name in ('d01_update', 'd01_origin', 'd01_head', 'candidate'):
        _resolve(cells, c[name], sid, code + '/survivor/' + name)
    return c


def _cancel_record(state, row, scope, cells, sid, gaps):
    ev = row.event
    halt('reducer/second_terminal', state['terminal'] is None)
    custody = _common_original(row, ev)
    res = _cell(cells, F['d06_result'], run_key(scope, 'd06_result'))
    halt('cancel/d06_unavailable', res is not None)
    r = res['value']
    halt('cancel/d06_event', r['event_id'] == ev['event_id'] and r['first_receipt_sha256'] == value_sha(row.receipt))
    sels = {}
    for name in ('d06_candidate', 'd06_intent', 'd06_result', 'd06_prepare_origin', 'd06_publish_origin'):
        sels[name] = _sel_of(sid, cells, F[name], run_key(scope, name), 'cancel/%s_unavailable' % name)
    for name in ('d06_candidate', 'd06_intent'):
        v = _cell(cells, F[name], run_key(scope, name))['value']
        halt('cancel/%s_join' % name, v['event_id'] == ev['event_id'] and exact(v['before'], r['before']) and
             exact(v['after'], r['after']))
    for name in ('d06_prepare_origin', 'd06_publish_origin'):
        halt('cancel/%s_join' % name, exact(_cell(cells, F[name], run_key(scope, name))['value']['result'],
                                             sels['d06_result']))
    d05 = _resolve(cells, r['d05'], sid, 'cancel/d05')
    halt('cancel/d05_outcome', d05['outcome'] == 'success' and d05['mutation_started'] is False)
    d05_origin = _cell(cells, F['d05_origin'], run_key(scope, 'd05_origin'))
    halt('cancel/d05_origin', d05_origin is not None and exact(d05_origin['value']['result'], r['d05']))
    for name in ('d01_update', 'd01_origin', 'd01_head'):
        _resolve(cells, r['d01'][name], sid, 'cancel/' + name)
    update = _resolve(cells, r['d01']['d01_update'], sid, 'cancel/d01_update')
    halt('cancel/d01_join', exact(update['before'], r['before']) and exact(update['after'], r['after']))
    before, after = r['before'], r['after']
    halt('cancel/native_transition', after['status'] == 'cancelled' and
         after['body_revision'] == before['body_revision'] + 1 and before['status'] != 'certified')
    p = ev['payload']
    halt('cancel/revisions', p['expected_goal_run_revision'] == before['body_revision'] and
         p['goal_run_revision'] == after['body_revision'])
    if state['start'] is not None:
        s = state['start']
        halt('cancel/causal_order', s['sequence_id'] < row.sequence_id and
             s['after']['body_revision'] <= before['body_revision'])
        c = s['commit']
        cause = dict(kind='original_started',
                     control=_sel_of(sid, cells, F['control'], run_key(scope, 'control'), 'cancel/control'),
                     initial_control_origin=_sel_of(sid, cells, F['initial_control_origin'],
                                                    run_key(scope, 'initial_control_origin'), 'cancel/ico'),
                     candidate=copy.deepcopy(c['candidate']),
                     commit=_sel_of(sid, cells, F['start_commit'], run_key(scope, 'start_commit'), 'cancel/start'),
                     origin=_sel_of(sid, cells, F['start_origin'], run_key(scope, 'start_origin'), 'cancel/start'),
                     original_d01_update=copy.deepcopy(c['d01_update']),
                     original_d01_origin=copy.deepcopy(c['d01_origin']), original_d01_head=copy.deepcopy(c['d01_head']))
    elif before['activation_state'] == 'activation_pending':
        halt('cancel/initialized_no_start', _cell(cells, F['start_commit'], run_key(scope, 'start_commit')) is None)
        cause = dict(kind='original_initialized_no_start',
                     control=_sel_of(sid, cells, F['control'], run_key(scope, 'control'), 'cancel/control'),
                     initial_control_origin=_sel_of(sid, cells, F['initial_control_origin'],
                                                    run_key(scope, 'initial_control_origin'), 'cancel/ico'),
                     original_workflow_birth=_sel_of(sid, cells, F['birth'], run_key(scope, 'birth'), 'cancel/birth'),
                     original_workflow_birth_origin=_sel_of(sid, cells, F['birth_origin'], run_key(scope, 'birth_origin'),
                                                            'cancel/birth'))
    else:
        c = _start_survivor(state, scope, cells, sid, gaps, row.sequence_id, 'cancel')
        cause = dict(kind='original_started',
                     control=_sel_of(sid, cells, F['control'], run_key(scope, 'control'), 'cancel/control'),
                     initial_control_origin=_sel_of(sid, cells, F['initial_control_origin'],
                                                    run_key(scope, 'initial_control_origin'), 'cancel/ico'),
                     candidate=copy.deepcopy(c['candidate']),
                     commit=_sel_of(sid, cells, F['start_commit'], run_key(scope, 'start_commit'), 'cancel/start'),
                     origin=_sel_of(sid, cells, F['start_origin'], run_key(scope, 'start_origin'), 'cancel/start'),
                     original_d01_update=copy.deepcopy(c['d01_update']),
                     original_d01_origin=copy.deepcopy(c['d01_origin']), original_d01_head=copy.deepcopy(c['d01_head']))
    d05sel = lambda name: dict(storage_instance_id=sid, family_id=F[name], schema_id=W.schema_of(F[name]),
                               schema_version='1.0.0', physical_key=run_key(scope, name),
                               physical_sha256=value_sha(_cell(cells, F[name], run_key(scope, name))['value']),
                               codec='messagepack_canonical')
    record = dict(scope=copy.deepcopy(scope), status_at_original_event='cancelled',
                  activation_at_original_event=after['activation_state'], original_event=copy.deepcopy(ev),
                  native_before_commitment=copy.deepcopy(before), native_after_commitment=copy.deepcopy(after),
                  original_candidate=sels['d06_candidate'], original_intent=sels['d06_intent'],
                  original_result=sels['d06_result'], original_prepare_origin=sels['d06_prepare_origin'],
                  original_publish_origin=sels['d06_publish_origin'], original_d01_update=copy.deepcopy(r['d01']['d01_update']),
                  original_d01_origin=copy.deepcopy(r['d01']['d01_origin']), original_d01_head=copy.deepcopy(r['d01']['d01_head']),
                  original_d05_result=d05sel('d05_result'), original_d05_origin=d05sel('d05_origin'),
                  original_start_cause=cause,
                  original_event_value_commitment=copy.deepcopy(custody['original_event_value_commitment']),
                  producer_semantic_digest=custody['producer_semantic_digest'],
                  first_append_receipt=copy.deepcopy(row.receipt), action_authority=False)
    state['terminal'] = 'cancelled'
    state['status'] = 'cancelled'
    state['record'] = record


def _certified_record(state, row, scope, cells, sid, gaps):
    ev = row.event
    halt('reducer/second_terminal', state['terminal'] is None)
    custody = _common_original(row, ev)
    ck = run_key(scope, 'coordinator_commit')
    commit = _cell(cells, F['coordinator_commit'], ck)
    halt('certified/commit_unavailable', commit is not None)
    c = commit['value']
    halt('certified/commit_event', c['event_id'] == ev['event_id'])
    halt('certified/commit_first_receipt', c['first_receipt_sha256'] == value_sha(row.receipt))
    halt('certified/commit_value_commitment',
         c['value_commitment_sha256'] == custody['original_event_value_commitment']['sha256'])
    halt('certified/commit_producer_digest', c['producer_semantic_digest'] == custody['producer_semantic_digest'])
    commit_sel = selector_for(sid, F['coordinator_commit'], ck, c)
    release = _cell(cells, F['coordinator_release'], run_key(scope, 'coordinator_release'))
    halt('certified/release_missing', release is not None)
    rv = release['value']
    halt('certified/release_selects_commit', exact(rv['commit'], commit_sel))
    halt('certified/release_readback', rv['readback'] is True and rv['commit_transaction'] == commit['tx'] and
         rv['event_id'] == ev['event_id'])
    halt('certified/release_after_commit', W.tx_number(release['tx']) > W.tx_number(commit['tx']))
    corigin = _cell(cells, F['coordinator_origin'], run_key(scope, 'coordinator_origin'))
    halt('certified/coordinator_origin', corigin is not None and exact(corigin['value']['commit'], commit_sel))
    result = _resolve(cells, c['native_result'], sid, 'certified/native_result')
    norigin = _resolve(cells, c['native_origin'], sid, 'certified/native_origin')
    halt('certified/native_origin_join', exact(norigin['result'], c['native_result']))
    halt('certified/native_result_event', result['event_id'] == ev['event_id'] and result['decision'] == 'certified')
    before, after = result['before'], result['after']
    halt('certified/native_transition', _commitment_shape(before) and _commitment_shape(after) and
         before['status'] in ('provisional_success', 'verifying') and after['status'] == 'certified' and
         after['body_revision'] == before['body_revision'] + 1)
    halt('certified/native_protected', before['activation_state'] == after['activation_state'] == 'active' and
         before['activation_revision'] == after['activation_revision'] and
         exact(before['identity'], after['identity']) and before['workflow_owner_ref'] == after['workflow_owner_ref']
         and before['workflow_owner_epoch'] == after['workflow_owner_epoch'] and exact(before['control'], after['control']))
    update = _resolve(cells, c['d01_update'], sid, 'certified/d01_update')
    d01o = _resolve(cells, c['d01_origin'], sid, 'certified/d01_origin')
    head = _resolve(cells, c['d01_head'], sid, 'certified/d01_head')
    halt('certified/d01_join', exact(update['before'], before) and exact(update['after'], after) and
         exact(d01o['update'], c['d01_update']) and exact(head['update'], c['d01_update']) and
         exact(head['after'], after) and head['revision'] == after['body_revision'])
    halt('certified/d01_same_transaction', update['transaction_ref'] == result['transaction_ref'] == commit['tx'])
    standard = _resolve(cells, c['standard_receipt'], sid, 'certified/standard_receipt')
    capture = _resolve(cells, c['standard_capture_origin'], sid, 'certified/standard_capture_origin')
    halt('certified/standard_semantics', standard['final_certifier_decision'] == 'certified' and
         standard['tier'] == 'standard' and standard['unresolved_risk_refs'] == [] and
         standard['exception_refs'] == [] and standard['approval_refs'] == [])
    halt('certified/standard_capture_join', exact(capture['receipt'], c['standard_receipt']) and
         exact(result['standard'], c['standard_receipt']))
    std_cell = _cell(cells, c['standard_receipt']['family_id'], c['standard_receipt']['physical_key'])
    p = ev['payload']
    halt('certified/standard_receipt_ref', p['payload']['certification_receipt_ref'] ==
         'TEST_ONLY:standard-receipt:' + std_cell['tx'])
    halt('certified/revisions', p['expected_goal_run_revision'] == before['body_revision'] and
         p['goal_run_revision'] == after['body_revision'])
    if state['start'] is not None:
        s = state['start']
        halt('certified/causal_order', s['sequence_id'] < row.sequence_id and
             s['after']['body_revision'] <= before['body_revision'])
    else:
        _start_survivor(state, scope, cells, sid, gaps, row.sequence_id, 'certified')
    record = dict(scope=copy.deepcopy(scope), status_at_original_event='certified', activation_at_original_event='active',
                  original_event=copy.deepcopy(ev), native_before_commitment=copy.deepcopy(before),
                  native_after_commitment=copy.deepcopy(after), original_native_result=copy.deepcopy(c['native_result']),
                  original_native_origin=copy.deepcopy(c['native_origin']), original_d01_update=copy.deepcopy(c['d01_update']),
                  original_d01_origin=copy.deepcopy(c['d01_origin']), original_d01_head=copy.deepcopy(c['d01_head']),
                  original_standard_receipt=copy.deepcopy(c['standard_receipt']),
                  original_standard_capture_origin=copy.deepcopy(c['standard_capture_origin']),
                  original_coordinator_commit=commit_sel,
                  original_coordinator_origin=selector_for(sid, F['coordinator_origin'], run_key(scope, 'coordinator_origin'),
                                                           corigin['value']),
                  original_coordinator_release=selector_for(sid, F['coordinator_release'],
                                                            run_key(scope, 'coordinator_release'), rv),
                  original_event_value_commitment=copy.deepcopy(custody['original_event_value_commitment']),
                  producer_semantic_digest=custody['producer_semantic_digest'],
                  first_append_receipt=copy.deepcopy(row.receipt), action_authority=False)
    state['terminal'] = 'certified'
    state['status'] = 'certified'
    state['record'] = record


def reduce_prefix(generic, scope, cells, *, limit=None, through=None):
    """P4 bounded reducer over the validated global prefix.

    ``limit`` bounds the number of survivor rows; ``through`` bounds by global
    sequence (historical rederivation).  Returns the processed prefix and the
    halt (code, position, event_id) before which it stopped, if any."""
    require('reduce/snapshot_type', isinstance(generic, SourceSnapshot))
    sid = generic.storage_instance_id
    require('reduce/storage', scope['storage_instance_id'] == sid)
    state = dict(status=None, start=None, terminal=None, record=None)
    pairs, last, stop = [], None, None
    rows = generic.rows
    for row in rows:
        if limit is not None and len(pairs) >= limit:
            break
        if through is not None and row.sequence_id > through:
            break
        try:
            halt('reducer/pending_custody', row.custody is not None)
            ev = row.event
            halt('reducer/unregistered_record', REGISTERED.get(ev['event_type']) == ev['payload_schema_id'])
            same = ev['project_id'] == scope['project_id'] and ev['run_id'] == scope['goal_run_id']
            if same:
                halt('reducer/unsupported_same_run', ev['event_type'] in SUPPORTED)
                if ev['event_type'] == 'goal_run.started':
                    _start_record(state, row, scope, cells, sid)
                elif ev['event_type'] == 'goal_run.cancelled':
                    _cancel_record(state, row, scope, cells, sid, generic.gaps)
                else:
                    _certified_record(state, row, scope, cells, sid, generic.gaps)
        except Halt as error:
            stop = (error.code, row.position, row.event_id)
            break
        pairs.append([index_row(row), row.custody['original_event_value_commitment']['sha256']])
        last = row.sequence_id
    exhausted = len(pairs) == len(rows)
    if stop is None and exhausted and generic.defect is not None and (through is None or True):
        stop = generic.defect
    gaps = [g for g in generic.gaps if last is not None and g['last_sequence'] < last] if generic.gaps else []
    if gaps and last is not None:
        last = max(last, max(g['last_sequence'] for g in gaps))
    return dict(record=state['record'], status=state['status'], pairs=pairs, through=last, halt=stop, gaps=gaps,
                complete=stop is None and exhausted)


def processed_of(red, token, row_value, scope):
    return dict(generic_token=copy.deepcopy(token), verified_row_count=len(red['pairs']),
                through_sequence_id=red['through'],
                coverage_sha256=sha(['pm.goal_test.dg_cf3.coverage.v1', red['pairs']]),
                retention_gap_sha256=sha(['pm.goal_test.dg_cf3.retention_gaps.v1', red['gaps']]),
                row_key=None if row_value is None else row_key(scope),
                row_sha256=None if row_value is None else value_sha(row_value))


def anchor_of(sid, scope, profile_digest, seed_hex, token):
    return W.sha256(canon([ANCHOR_DOMAIN, sid, scope, PROFILE_NAME, profile_digest, seed_hex, token]))


def frontier_of(anchor, revision, prior, processed, tx_id):
    return W.sha256(canon([FRONTIER_DOMAIN, anchor, revision, prior, processed, tx_id]))


# ----------------------------------------------------------------- derive

def logical_checkpoint(cell, rep):
    if cell is None:
        return None
    return rep.decode_checkpoint(cell['value'])


def derive(rep, src, request, tx_id, at_utc, *, publish):
    """Pure afterimage derivation shared by the projector and the lower owner.

    Returns (after_checkpoint_logical, after_row or None, row generation id,
    deletions)."""
    scope, sid = src.scope, src.storage.storage_instance_id
    op = request['operation']
    before = logical_checkpoint(src.checkpoint_cell, rep)
    gens = {} if before is None else copy.deepcopy(before['generations'])
    profile = src.profile
    token = copy.deepcopy(src.token)
    after = copy.deepcopy(before) if before is not None else dict(
        schema_id=CHECKPOINT_SCHEMA, schema_version='1.0.0', storage_instance_id=sid, scope=copy.deepcopy(scope),
        physical_key=checkpoint_key(scope), current_generation_id=None, generations={}, root_revision=-1,
        last_transaction_id=tx_id)
    row, row_gen, deletions = None, None, []
    if op == 'stage':
        require('stage/fourth_generation', len(gens) < MAX_GENERATIONS)
        seed = request['seed_hex']
        require('stage/seed_type', type(seed) is str and len(seed) == 64)
        anchor = anchor_of(sid, scope, profile['profile_digest'], seed, token)
        gid = 'grsccg_' + anchor
        require('stage/anchor_collision', gid not in gens)
        red = dict(pairs=[], gaps=[], through=None)
        processed = processed_of(red, token, None, scope)
        gens[gid] = dict(generation_id=gid, state='staged', anchor_sha256=anchor, seed_hex=seed, profile=PROFILE_NAME,
                         scope=copy.deepcopy(scope), source_token_at_birth=copy.deepcopy(token),
                         dataset_name=row_table(gid), frontier_revision=0, prior_frontier_sha256=None,
                         frontier_sha256=frontier_of(anchor, 0, None, processed, tx_id), processed=processed,
                         last_transaction_id=tx_id, activated_at_utc=None, retired_at_utc=None,
                         first_prepared_at_utc=at_utc, successor_generation_id=None, hold_refs=[],
                         profile_digest=profile['profile_digest'])
        row_gen = gid
    elif op == 'advance':
        gid = request['generation_id']
        require('advance/unknown_generation', gid in gens)
        gen = gens[gid]
        require('advance/generation_state', gen['state'] in ('staged', 'current'))
        require('advance/expected_frontier', gen['frontier_revision'] == request['expected_frontier_revision'])
        require('advance/profile', gen['profile_digest'] == profile['profile_digest'])
        birth = gen['source_token_at_birth']
        require('advance/source_selection_changed', birth['generation_id'] == token['generation_id'] and
                birth['storage_instance_id'] == token['storage_instance_id'] and
                birth['generation_anchor_sha256'] == token['generation_anchor_sha256'])
        prior = gen['processed']
        if prior['verified_row_count']:
            red0 = reduce_prefix(src.generic, scope, src.cells, limit=prior['verified_row_count'])
            p0 = processed_of(red0, prior['generic_token'], None, scope)
            require('advance/prior_prefix_mismatch', len(red0['pairs']) == prior['verified_row_count'] and
                    p0['coverage_sha256'] == prior['coverage_sha256'] and
                    p0['retention_gap_sha256'] == prior['retention_gap_sha256'] and
                    p0['through_sequence_id'] == prior['through_sequence_id'])
        batch = NR.integer(request['batch_limit'], 'advance/batch_limit', minimum=1)
        red = reduce_prefix(src.generic, scope, src.cells, limit=prior['verified_row_count'] + batch)
        if red['halt'] is not None and len(red['pairs']) < prior['verified_row_count'] + batch:
            raise LaneRefusal('advance/halt/' + red['halt'][0])
        require('advance/no_progress', len(red['pairs']) > prior['verified_row_count'])
        if red['record'] is not None:
            row = rep.encode(red['record'], gen['dataset_name'], publish=publish)
        processed = processed_of(red, token, row, scope)
        old_row = prior['row_key'] is not None
        require('advance/row_removed', row is not None or not old_row)
        rev = gen['frontier_revision'] + 1
        gen.update(frontier_revision=rev, prior_frontier_sha256=gen['frontier_sha256'], processed=processed,
                   frontier_sha256=frontier_of(gen['anchor_sha256'], rev, gen['frontier_sha256'], processed, tx_id),
                   last_transaction_id=tx_id)
        row_gen = gid
    elif op == 'cutover':
        gid = request['generation_id']
        require('cutover/unknown_generation', gid in gens)
        gen = gens[gid]
        require('cutover/not_staged', gen['state'] == 'staged')
        require('cutover/expected_frontier', gen['frontier_revision'] == request['expected_frontier_revision'])
        red = reduce_prefix(src.generic, scope, src.cells)
        require('cutover/unsupported_or_malformed_row', red['halt'] is None)
        require('cutover/source_defect', src.generic.defect is None)
        full = processed_of(red, gen['processed']['generic_token'], None, scope)
        p = gen['processed']
        require('cutover/incomplete_coverage', p['verified_row_count'] == len(src.generic.rows) and
                full['coverage_sha256'] == p['coverage_sha256'] and full['through_sequence_id'] == p['through_sequence_id']
                and full['retention_gap_sha256'] == p['retention_gap_sha256'])
        require('cutover/seglog_frontier', seglog_fence(p['generic_token']) == seglog_fence(token))
        if red['record'] is not None:
            expect_row = rep.encode(red['record'], gen['dataset_name'], publish=False)
            require('cutover/row_binding', p['row_sha256'] == value_sha(expect_row))
        else:
            require('cutover/row_binding', p['row_sha256'] is None)
        old = after['current_generation_id']
        if old is not None:
            gens[old].update(state='retired', retired_at_utc=at_utc, successor_generation_id=gid)
        gen.update(state='current', activated_at_utc=at_utc)
        after['current_generation_id'] = gid
        row_gen = None
    elif op == 'collect':
        gid = request['generation_id']
        require('collect/unknown_generation', gid in gens)
        gen = gens[gid]
        if gen['state'] == 'retired':
            elapsed = _seconds_between(gen['retired_at_utc'], at_utc)
            require('collect/retention_window', elapsed >= RETIREMENT_SECONDS)
        else:
            require('collect/not_retired_or_abandoned', gen['state'] == 'staged' and gen['activated_at_utc'] is None
                    and request.get('abandon') is True)
        require('collect/held', not HoldOwner.held(src.cells, gid, src.registry))
        if gen['processed']['row_key'] is not None:
            deletions.append((gen['dataset_name'], gen['processed']['row_key']))
        del gens[gid]
        row_gen = None
    else:
        raise LaneRefusal('derive/operation')
    after['generations'] = gens
    after['root_revision'] = after['root_revision'] + 1
    after['last_transaction_id'] = tx_id
    rep.validate('LogicalCheckpoint', after)
    return after, row, row_gen, deletions


def _seconds_between(a, b):
    import datetime as _dt
    pa = _dt.datetime.strptime(a, '%Y-%m-%dT%H:%M:%S.%fZ')
    pb = _dt.datetime.strptime(b, '%Y-%m-%dT%H:%M:%S.%fZ')
    return int((pb - pa).total_seconds())


def project_state(rep, checkpoint_row, row):
    return dict(checkpoint=copy.deepcopy(checkpoint_row), row=copy.deepcopy(row))


# ----------------------------------------------------------------- owners

class LowerStorage(A.TestOwner):
    """owner.storage...publish.reference.v1: the only derived writer."""
    role = 'storage_publisher'

    def __init__(self, registry, storage, controls):
        super().__init__(registry, owner_id=PUBLISH_METHOD + ':' + storage.storage_instance_id)
        self.storage, self.controls = storage, controls
        self.rep = Rep(storage, controls)

    def read_sources(self, scope):
        """Passive: actual observed source/state only; no progress effect."""
        with self.recorder.call(self.owner_id, 'read_sources') as slot:
            src = Sources(self.storage, scope, self.controls)
            src.registry = self.registry
            slot.set(dict(rows=len(src.generic.rows), checkpoint=src.checkpoint_cell is not None))
            return src

    def open_transaction(self):
        return self.storage.begin()

    def issue_seed(self):
        return self.storage.new_seed()

    def _state(self, src, gid):
        cp = None if src.checkpoint_cell is None else src.checkpoint_cell['value']
        row = None
        if gid is not None:
            cell = src.cells.get(row_table(gid), {}).get(row_key(src.scope))
            row = None if cell is None else cell['value']
        return project_state(self.rep, cp, row)

    def publish(self, scope, request, candidate, handle, *, hooks=None):
        hooks = hooks or {}
        with self.recorder.call(self.owner_id, 'publish:' + request['operation']) as slot:
            tx_id, at_utc = self.storage.tx_info(handle)
            src = self.read_sources(scope)
            require('publish/withdrawn', not src.controls['projector_withdrawn'])
            require('publish/candidate_type', type(candidate) is dict)
            self.rep.validate('ProjectionCandidate', candidate)
            require('publish/operation', candidate['operation'] == request['operation'])
            if request['operation'] == 'stage':
                require('stage/seed_unissued', request['seed_hex'] in src.issued_seeds)
                used = set()
                cp = logical_checkpoint(src.checkpoint_cell, self.rep)
                for g in (cp or {}).get('generations', {}).values():
                    used.add(g['seed_hex'])
                require('stage/seed_reused', request['seed_hex'] not in used)
            replay = self._replay(src, request)
            if replay is not None:
                slot.set(dict(replay=True))
                return replay
            gid_before = request.get('generation_id')
            require('publish/stale_before', exact(candidate['before'], self._state(src, gid_before)))
            after_cp, after_row, row_gen, deletions = derive(self.rep, src, request, tx_id, at_utc, publish=True)
            after_cp_row = self.rep.encode_checkpoint(after_cp, publish=True)
            op = request['operation']
            state_row = after_row if op == 'advance' else (None if op == 'stage' else self._state(src, gid_before)['row'])
            expected_after = project_state(self.rep, after_cp_row, state_row)
            require('publish/candidate_mismatch', exact(candidate['after'], expected_after))
            for ref in self.rep.refs(after_cp_row) + (self.rep.refs(after_row) if after_row else []):
                self.storage.read_pack(ref, expected_media_type='application/msgpack')
            self.storage.lane_cut('publish_after_pack')
            if 'after_helpers' in hooks:
                hooks['after_helpers'](self)
            final = Sources(self.storage, scope, self.controls)
            for ref in self.rep.refs(after_cp_row) + (self.rep.refs(after_row) if after_row else []):
                self.rep.store.get(ref)
            fb, fa = src.fence(), final.fence()
            for name in ('seglog', 'checkpoint_version', 'controls', 'coverage', 'defect', 'rows', 'authority'):
                require('publish/final/' + name, exact(fb[name], fa[name]))
            require('publish/final/withdrawn', not final.controls['projector_withdrawn'])
            cp_cell = src.checkpoint_cell
            writes = [dict(table=CHECKPOINT_TABLE, key=checkpoint_key(scope),
                           expected=None if cp_cell is None else cp_cell['version'], value=after_cp_row)]
            if after_row is not None:
                cell = src.cells.get(row_table(row_gen), {}).get(row_key(scope))
                if cell is None or not exact(cell['value'], after_row):
                    writes.append(dict(table=row_table(row_gen), key=row_key(scope),
                                       expected=None if cell is None else cell['version'], value=after_row))
            for table, key in deletions:
                cell = src.cells.get(table, {}).get(key)
                if cell is not None:
                    writes.append(dict(table=table, key=key, expected=cell['version'], delete=True))
            self.storage.lane_cut('publish_before_commit')
            tx = self.storage.commit(handle, writes)
            self.storage.lane_cut('publish_after_commit')
            result = dict(checkpoint=after_cp_row, projection=after_row, effects='projection_and_own_checkpoint_only')
            self.rep.validate('ProjectorResult', result)
            slot.set(dict(tx=tx['tx_id'], writes=[[w['table'], w['key']] for w in writes]))
            return dict(result=result, tx_id=tx['tx_id'], logical=after_cp, replay=False)

    def collect(self, scope, generation_id, *, abandon=False, hooks=None):
        """Existing Storage maintenance: delete one retired generation after
        retirement + 604800 s, or abandon a never-activated stage; refused while
        an actual hold authority exists.  Not a projector publication."""
        hooks = hooks or {}
        with self.recorder.call(self.owner_id, 'collect') as slot:
            handle, tx_id = self.open_transaction()
            _, at_utc = self.storage.tx_info(handle)
            src = self.read_sources(scope)
            require('collect/checkpoint', src.checkpoint_cell is not None)
            request = dict(operation='collect', generation_id=generation_id, abandon=abandon)
            after_cp, _, _, deletions = derive(self.rep, src, request, tx_id, at_utc, publish=True)
            after_cp_row = self.rep.encode_checkpoint(after_cp, publish=True)
            if 'after_helpers' in hooks:
                hooks['after_helpers'](self)
            final = Sources(self.storage, scope, self.controls)
            require('collect/final/held', not HoldOwner.held(final.cells, generation_id, self.registry))
            require('collect/final/checkpoint', exact(final.checkpoint_cell, src.checkpoint_cell))
            writes = [dict(table=CHECKPOINT_TABLE, key=checkpoint_key(scope), expected=src.checkpoint_cell['version'],
                           value=after_cp_row)]
            for table, key in deletions:
                cell = src.cells.get(table, {}).get(key)
                if cell is not None:
                    writes.append(dict(table=table, key=key, expected=cell['version'], delete=True))
            tx = self.storage.commit(handle, writes)
            slot.set(dict(tx=tx['tx_id']))
            return dict(tx_id=tx['tx_id'], logical=after_cp)

    def _replay(self, src, request):
        """Lost acknowledgement: the same request after its commit resolves the
        genuine durable state without a second effect."""
        if request['operation'] not in ('advance', 'cutover') or src.checkpoint_cell is None:
            return None
        cp = logical_checkpoint(src.checkpoint_cell, self.rep)
        gen = cp['generations'].get(request['generation_id'])
        if gen is None or gen['frontier_revision'] == request['expected_frontier_revision']:
            if request['operation'] == 'cutover' and gen is not None and gen['state'] == 'current':
                return dict(result=None, tx_id=cp['last_transaction_id'], logical=cp, replay=True)
            return None
        if request['operation'] == 'advance' and gen['frontier_revision'] == request['expected_frontier_revision'] + 1:
            return dict(result=None, tx_id=gen['last_transaction_id'], logical=cp, replay=True)
        raise LaneRefusal('publish/replay_conflict')


class Projector(A.TestOwner):
    """owner.goal_run...project_prefix.reference.v1: requests publication only."""
    role = 'goal_runtime_projector'

    def __init__(self, registry, lower):
        super().__init__(registry, owner_id=PROJECT_METHOD + ':' + lower.storage.storage_instance_id)
        self.lower = lower

    def request_for(self, scope, operation, *, generation_id=None, batch_limit=None, src=None):
        request = dict(operation=operation, generation_id=generation_id)
        if operation in ('advance', 'cutover'):
            cp = logical_checkpoint(src.checkpoint_cell, self.lower.rep)
            request['expected_frontier_revision'] = cp['generations'][generation_id]['frontier_revision']
        if operation == 'advance':
            request['batch_limit'] = batch_limit
        return request

    def project_prefix(self, scope, operation, *, generation_id=None, batch_limit=None, edit=None, request_edit=None,
                       hooks=None, abandon=False, request=None):
        with self.recorder.call(self.owner_id, 'project_prefix:' + operation) as slot:
            seed = self.lower.issue_seed() if operation == 'stage' and request is None else None
            src = self.lower.read_sources(scope)
            handle, tx_id = self.lower.open_transaction()
            _, at_utc = self.lower.storage.tx_info(handle)
            if request is None:
                request = self.request_for(scope, operation, generation_id=generation_id, batch_limit=batch_limit,
                                           src=src)
                if operation == 'stage':
                    request['seed_hex'] = seed
            if request_edit:
                request = request_edit(request)
            before = self.lower._state(src, request.get('generation_id'))
            try:
                after_cp, after_row, row_gen, _ = derive(self.lower.rep, src, request, tx_id, at_utc, publish=False)
                cp_row = self.lower.rep.encode_checkpoint(after_cp, publish=False)
                op = request['operation']
                state_row = after_row if op == 'advance' else (None if op == 'stage' else before['row'])
                candidate = dict(before=before, after=project_state(self.lower.rep, cp_row, state_row),
                                 operation=op, effects='projection_and_own_checkpoint_only')
            except LaneRefusal:
                if request['operation'] in ('advance', 'cutover') and self.lower._replay(src, request) is not None:
                    candidate = dict(before=before, after=before, operation=request['operation'],
                                     effects='projection_and_own_checkpoint_only')
                else:
                    raise
            if edit:
                candidate = edit(candidate)
            out = self.lower.publish(scope, request, candidate, handle, hooks=hooks)
            slot.set(dict(tx=out['tx_id'], replay=out['replay']))
            return out


class Reader(A.TestOwner):
    """Historical/current-selection reads; passive, no checkpoint progress."""
    role = 'projection_reader'

    def __init__(self, registry, storage, controls):
        super().__init__(registry)
        self.storage, self.controls = storage, controls
        self.rep = Rep(storage, controls)
        self.hooks = {}

    def read(self, scope, *, generation=None, current=True):
        with self.recorder.call(self.owner_id, 'read_historical') as slot:
            src = Sources(self.storage, scope, self.controls)
            require('read/reader_withdrawn', not src.controls['reader_withdrawn'])
            require('read/disclosure_revoked', not src.controls['source_disclosure_revoked'])
            require('read/checkpoint_unavailable', src.checkpoint_cell is not None)
            cp = self.rep.decode_checkpoint(src.checkpoint_cell['value'])
            require('read/checkpoint_key', cp['physical_key'] == checkpoint_key(scope) and exact(cp['scope'], scope))
            if current:
                gid = cp['current_generation_id']
                require('read/no_current', gid is not None)
                require('read/selection', generation is None or generation == gid)
            else:
                gid = generation
                require('read/unknown_generation', gid in cp['generations'])
            gen = cp['generations'][gid]
            if current:
                require('read/current_state', gen['state'] == 'current')
            p = gen['processed']
            table = src.cells.get(gen['dataset_name'], {})
            require('read/unbound_row', set(table) <= ({p['row_key']} if p['row_key'] else set()))
            cell = table.get(row_key(scope))
            if p['row_key'] is None:
                require('read/row_binding', cell is None)
                slot.set(dict(generation=gid, record=None))
                return dict(record=None, generation_id=gid, checkpoint=cp, current_state_asserted=False,
                            action_authority='none')
            require('read/row_binding', cell is not None and value_sha(cell['value']) == p['row_sha256'])
            red = reduce_prefix(src.generic, scope, src.cells, through=p['through_sequence_id'])
            require('read/source_unavailable', red['record'] is not None)
            record = self.rep.decode(cell['value'], red['record'], gen['dataset_name'])
            if 'after_helpers' in self.hooks:
                self.hooks['after_helpers'](self)
            final = Sources(self.storage, scope, self.controls)
            require('read/final/controls', exact(final.controls, src.controls))
            require('read/final/checkpoint', exact(final.checkpoint_cell, src.checkpoint_cell))
            require('read/final/seglog', seglog_fence(final.token) == seglog_fence(src.token))
            slot.set(dict(generation=gid, record=record['status_at_original_event']))
            return dict(record=record, row=cell['value'], generation_id=gid, checkpoint=cp,
                        current_state_asserted=False, action_authority='none')


class Consumer:
    """Bundle of the owners bound to one Storage (one process)."""

    def __init__(self, storage, registry=None):
        self.registry = registry or A.OwnerRegistry()
        self.storage = storage
        self.controls = ControlOwner(self.registry, storage)
        self.holds = HoldOwner(self.registry, storage)
        self.lower = LowerStorage(self.registry, storage, self.controls)
        self.projector = Projector(self.registry, self.lower)
        self.reader = Reader(self.registry, storage, self.controls)

    def checkpoint(self, scope):
        cell = self.storage.cell(CHECKPOINT_TABLE, checkpoint_key(scope))
        return None if cell is None else self.lower.rep.decode_checkpoint(cell['value'])

    def rebuild(self, scope, *, batch=1000):
        """Stage a fresh generation, advance over the whole prefix, cut over."""
        out = self.projector.project_prefix(scope, 'stage')
        gid = [g for g, v in out['logical']['generations'].items() if v['state'] == 'staged' and
               v['last_transaction_id'] == out['tx_id']][0]
        while True:
            cp = self.checkpoint(scope)
            src = self.lower.read_sources(scope)
            if cp['generations'][gid]['processed']['verified_row_count'] >= len(src.generic.rows):
                break
            self.projector.project_prefix(scope, 'advance', generation_id=gid, batch_limit=batch)
        self.projector.project_prefix(scope, 'cutover', generation_id=gid)
        return gid
