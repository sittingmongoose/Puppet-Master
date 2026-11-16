#!/usr/bin/env python3
"""DG-OWN-A source, custody and projection oracles for goal_run.stopped and goal_run.blocked (ATS-1110..1112).

TEST_ONLY. A private owner store models original issuance: the actual registration and birth, the native
Workflow body and its D01 chronology, the Goal, each cause owner's original, Storage's global Event prefix with
SP-286 first-receipt custody, the stop/block operation records, and the physical projection/checkpoint keys.
Callers supply only a Request and the producer-owned append request; every source is resolved from the store,
and checks repeat at the final boundary. Nothing here installs a source, runs native code or proves a guard
by removal: the emitted guard_negative_inventory is input for the shared guard-isolation sweep (s3ao).

Review fixes (reviews/DG-OWN-A-sol/REVIEW.md): F1 GRS-202 revision relation over the authenticated D01
chronology; F2 complete EventRecord, exact append dispatch, Goal/cause joins, Storage-resolved projector and
recovery, and the whole SB5 token/anchor/frontier/CAS/cutover transaction; F3 per-status row metadata in the
closed StorageProjection root; F4 typed receipt equality and closed StoredPart branches; F5 inline selection by
the complete encoded wrapper; F6 one-defect fixtures; F7 the occurred_at_utc join negative; F8 exact token
identifier lengths; F9 the typed fresh consumer graph resolved eagerly with every argument root.
"""
from __future__ import annotations

import copy
import datetime
import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import urldefrag

import jsonschema
import msgpack
from blake3 import blake3
from referencing import Registry, Resource
import referencing.jsonschema as rjs

from pm_goal_run_stop_block_oracles import recipe, LEGAL, EDGES, NON_EMITTING_NATIVE_STEPS
from pm_goal_oracle_common import current_integer_number, same_json_value, semantic_digest, SEMANTIC_FIELDS
import pm_goal_oracle_common as common
import pm_goal_gc_adapter as adapter
import pm_event_numbers as numbers

ROOT = Path(__file__).resolve().parents[1]
PKG = ROOT / 'Plans/goal_run_stop_block_contracts'
OWN = 'https://puppetmaster.local/proposals/goal_run_stop_block.v1.schema.json#/$defs/'
REC = 'https://puppetmaster.local/schemas/event_append_receipt_contracts/2.0.0#/$defs/'
EVR = 'https://puppetmaster.local/schemas/event_record/2.0.0/event_record.schema.json'
PROFILE = 'pm.executor.workflow_source.all_writers.stop_block.v1'
PROFILE_DIGEST = hashlib.sha256(json.dumps(json.loads((PKG / 'profile.json').read_text()), sort_keys=True,
                                           separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()
TIME = '2026-11-05T00:00:00Z'
SID = '00000000-0000-4000-8000-000000000001'
SCOPE = dict(storage_instance_id=SID, scope_partition='project~cHJvamVjdDphbHBoYQ',
             project_id='project:alpha', goal_id='goal:1', goal_run_id='run:1')
WRITERS = {'goal_run.stopped': 'owner.executor.workflow_run.stop.v1', 'goal_run.blocked': 'owner.executor.workflow_run.block.v1'}
ROUTES = {'goal_run.stopped': ('cmd.orchestrator.pause', 'cmd.runtime.abort_run'), 'goal_run.blocked': ('scheduler.run_block',)}
RULE = {'goal_run.stopped': 'original_run_stop', 'goal_run.blocked': 'original_run_block'}
PAYLOAD = {f: 'pm.goal_runtime_event.' + f.replace('.', '_') + '.schema.v3' for f in ('goal_run.stopped', 'goal_run.blocked', 'goal_run.started')}
INLINE_LIMIT = 16384
PAYLOAD_RESOURCES = {f: f'Plans/executor_cancellation_contracts/schemas/{f.replace("_", "-").replace(".", "-")}.v3.schema.json'
                     for f in ('goal_run.stopped', 'goal_run.blocked', 'goal_run.started')}
GUARDS: dict[str, list[str]] = {}


class Refusal(Exception):
    pass


def require(code, value):
    """One named owner predicate; under the Goal sweep only its gated table decides (pm_goal_gc_adapter)."""
    if adapter.gated(code, value) is not None:
        raise Refusal(code)


def refuses(code, condition):
    """A consumer halt_before predicate, gated exactly like require."""
    return adapter.gated(code, condition) is not None


# ---------------------------------------------------------------- codecs and schema roots

def order(value):
    if isinstance(value, dict):
        return {k: order(v) for k, v in sorted(value.items())}
    if isinstance(value, list):
        return [order(v) for v in value]
    return value


def packed(value):
    """Bounded test physical bytes; number types are preserved, floats never normalized."""
    return msgpack.packb(order(value), use_bin_type=True)


def sha(value):
    return hashlib.sha256(packed(value)).hexdigest()


def k(value):
    import base64
    return base64.urlsafe_b64encode(value.encode()).decode().rstrip('=')


def hexc(value):
    return value.encode().hex()


def load(rel):
    return common.load(ROOT / rel)  # source-bound: a file changed during a run refuses the run


def build_registry():
    registry = Registry()
    for rel in ['Plans/goal_run_stop_block_contracts/contracts.schema.json', 'Plans/event_record.schema.json',
                'Plans/event_append_receipt_contracts.schema.json',
                'Plans/executor_cancellation_contracts/schemas/goal-run-stopped.v3.schema.json',
                'Plans/executor_cancellation_contracts/schemas/goal-run-blocked.v3.schema.json',
                'Plans/executor_cancellation_contracts/schemas/goal-run-started.v3.schema.json']:
        doc = load(rel)
        registry = registry.with_resource(doc['$id'], Resource.from_contents(common.runtime_schema(doc), default_specification=rjs.DRAFT202012))
    return registry.crawl()


REGISTRY = build_registry()
_VALIDATORS: dict[str, jsonschema.Draft202012Validator] = {}


def valid(ref, value):
    """The whole owner definition through the shared Goal validator: every keyword, ECMA patterns, owner
    formats, the shared date-time profiles (EventRecord; Storage UTC-Z for stored observed/persisted) and the
    CV-1100 current integer grammar of these current v3 writes."""
    if ref not in _VALIDATORS:
        _VALIDATORS[ref] = adapter.validator({'$ref': ref}, REGISTRY)
    return adapter.check_schema(_VALIDATORS[ref], value, ref)


def selection_table():
    """Registered (event_type, scope_kind, payload_schema_id) rows plus the prepared v3 stop/block rows."""
    table = set()
    for row in load('Plans/event_family_registry.json')['families']:
        for version in row.get('payload_versions') or [{'scope_kind': 'project', 'payload_schema_id': row['payload_schema_id']}]:
            table.add((row['event_type'], version['scope_kind'], version['payload_schema_id']))
    for row in load('Plans/goal_run_stop_block_contracts/prepared-registry-rows.json')['rows']:
        for version in row['registry_row']['payload_versions']:
            table.add((row['registry_row']['event_type'], version['scope_kind'], version['payload_schema_id']))
    return table


SELECTIONS = selection_table()


def dispatch_selection(family, scope_kind):
    """Exact append dispatch from the prepared v3 row (EP-1110 births only); no fallback to the registered v2."""
    rows = [r['registry_row'] for r in load('Plans/goal_run_stop_block_contracts/prepared-registry-rows.json')['rows']
            if r['registry_row']['event_type'] == family]
    hits = [v['payload_schema_id'] for r in rows for v in r['payload_versions'] if v['scope_kind'] == scope_kind]
    return hits[0] if len(hits) == 1 else None


# ---------------------------------------------------------------- SP-337 stored parts (F4, F5)

def store_part(value, packs):
    """Inline only when the complete encoded StoredPart wrapper fits; otherwise an SP-337 reference."""
    inline = {'inline': copy.deepcopy(value), 'payload_ref': None}
    if len(packed(inline)) <= INLINE_LIMIT:
        return inline
    raw = packed(value)
    identity = blake3(raw).hexdigest()
    packs[identity] = raw
    return {'inline': None, 'payload_ref': {'blake3': identity, 'byte_size': len(raw), 'media_type': 'application/msgpack'}}


def resolve_part(part, packs):
    require('part/branch', valid(OWN + 'StoredPart', part))
    if part['payload_ref'] is None:
        require('part/inline_size', len(packed(part)) <= INLINE_LIMIT)
        return copy.deepcopy(part['inline'])
    ref = part['payload_ref']
    require('part/present', ref['blake3'] in packs)
    raw = packs[ref['blake3']]
    require('part/hash', blake3(raw).hexdigest() == ref['blake3'])
    require('part/size', len(raw) == ref['byte_size'])
    return msgpack.unpackb(raw, raw=False)


def selection(key, schema_id, value):
    return {'key': key, 'schema_id': schema_id, 'schema_version': '1.0.0', 'physical_sha256': sha(value)}


def opkey(kind, op):
    return f"goal_run_{kind}.v1:{hexc(SID)}:{hexc(SCOPE['project_id'])}:{hexc(SCOPE['goal_run_id'])}:{hexc(op)}"


# ---------------------------------------------------------------- the owner store

def payload_for(family, op, expected, goal_revision=2, cause=None):
    f = load('Plans/goal_run_stop_block_oracle_fixtures.json')['families'][family]
    payload = copy.deepcopy(f['payload_cases'][0]['value'])
    payload.update(project_id=SCOPE['project_id'], goal_id=SCOPE['goal_id'], goal_revision=goal_revision,
                   occurred_at_utc=TIME, expected_goal_run_revision=expected, goal_run_revision=expected + 1)
    payload['payload']['goal_run_id'] = SCOPE['goal_run_id']
    if family == 'goal_run.stopped':
        payload['payload']['settlement_refs'] = list(cause['settlement_refs'])
        payload['payload']['safe_point_ref'] = cause['safe_point']
    else:
        payload['payload']['block_receipt_ref'] = cause['receipt_ref']
        payload['payload']['blocked_reason_code'] = cause['reason_code']
        payload['payload']['preserved_work_refs'] = list(cause['preserved_work_refs'])
    payload['evidence_refs'] = list(cause['evidence'])
    _, key = recipe(family, {**SCOPE, 'expected_goal_run_revision': expected, 'operation_id': op})
    payload['idempotency_key'] = key
    return payload


def event_for(family, payload, op, expected, scope=SCOPE):
    event_id, key = recipe(family, {**scope, 'expected_goal_run_revision': expected, 'operation_id': op})
    return dict(schema_id='pm.event.v0', schema_version='2.0.0', scope_kind='project', event_id=event_id, event_type=family,
                project_id=scope['project_id'], thread_id=None, run_id=scope['goal_run_id'], node_id=None, attempt_id=None,
                actor_ref=payload['actor_ref'], requested_account_ref=payload['requested_account_ref'],
                effective_account_ref=payload['effective_account_ref'], occurred_at_utc=payload['occurred_at_utc'],
                observed_at_utc=None, persisted_at_utc=None, sequence_id=None, producer_sequence_id=None,
                correlation_id=payload['correlation_id'], causation_event_id=None, parent_event_id=None,
                idempotency_key=key, payload_schema_id=payload['schema_version'], payload=payload, payload_ref=None,
                redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
                migration=dict(migrated_from_schema_id=None, migrated_from_schema_version=None, migration_id=None,
                               compatibility_event_type=None))


def cause_for(family, op, revision, n=1):
    base = dict(scope=copy.deepcopy(SCOPE), operation_id=op, native_revision=revision, evidence=[f'evidence:{op}'],
                mutation_started=False, complete=True, unresolved=[])
    if family == 'goal_run.stopped':
        base.update(kind='settlement', issuer='owner.bounded_safe_stop', settlement_refs=[f'safestop:settle:{op}'],
                    required_flush=True, safe_point=f'safe_point:{n}')
    else:
        base.update(kind='block', issuer='owner.permissions', receipt_ref=f'permission_denial:{op}',
                    reason_code='permission_denied', preserved_work_refs=[f'worknode:{n}'])
    return base


def new_world():
    w = dict(registration=dict(operation_id='native-birth:1', profile=PROFILE, profile_sha256=PROFILE_DIGEST,
                               writers=list(WRITERS.values())),
             birth=dict(scope=copy.deepcopy(SCOPE), profile=PROFILE, profile_sha256=PROFILE_DIGEST,
                        original_registration='native-birth:1'),
             native=dict(scope=copy.deepcopy(SCOPE), revision=1, status='running', activation_revision=2,
                         activation_state='started', goal_revision=2,
                         protected={'worknodes': ['wn:1'], 'scheduler_epoch': 1, 'run_control_epoch': 4}),
             d01=[dict(before_revision=0, after_revision=1, kind='original_start', d01_receipt_ref='d01:start')],
             goal=dict(project_id=SCOPE['project_id'], goal_id=SCOPE['goal_id'], revision=2, state='active',
                       objective_text='fixture objective', control_epoch=3),
             causes={}, authority=dict(permission=True, recovery_hold=False, storage_writable=True,
                                       writer_withdrawn=False, reader_withdrawn=False),
             storage=dict(log=[], first={}, next_sequence=1, clock=0, current_bytes='current:1', manifest_generation=1),
             operations={}, inherited={}, packs={}, kv={}, seeds=['11' * 32, '22' * 32, '33' * 32, '44' * 32])
    issue_started(w)
    return w


def storage_append(w, event):
    """Storage assigns sequence/observation/persistence and issues the SP-286 first receipt with full-value custody."""
    st = w['storage']
    stored = copy.deepcopy(event)
    st['clock'] += 1
    stamp = f"2026-11-05T00:00:{st['clock']:02d}Z"
    stored.update(sequence_id=st['next_sequence'], observed_at_utc=stamp, persisted_at_utc=stamp)
    commitment = dict(schema_id='pm.storage.original_event_value_commitment.v1', schema_version='1.0.0',
                      codec='pm.seglog_frame_v2.event_value.canonical_msgpack.v1',
                      domain='pm.storage.original_event_value_commitment.v1', event_schema_id='pm.event.v0',
                      event_schema_version='2.0.0', sha256=sha(stored))
    receipt = dict(event_id=stored['event_id'], sequence_id=stored['sequence_id'], segment_generation=1,
                   segment_name='segment-1', byte_offset=128 * stored['sequence_id'], commit_group_id=f"group:{stored['sequence_id']}",
                   durability_class='barrier', durable_end_offset=128 * stored['sequence_id'] + 127,
                   durability_state='synced', manifest_generation=st['manifest_generation'], acknowledged_at_utc=stamp)
    frame = dict(sequence_id=stored['sequence_id'], event_id=stored['event_id'], event=stored, commitment=commitment, receipt=receipt)
    st['log'].append(frame)
    sealed, installed = adapter.issue(stored, SID, receipt, PAYLOAD_RESOURCES.get(stored['event_type']))
    st.setdefault('sealed_receipts', []).append(sealed)
    if installed not in st.setdefault('installed_recipes', []):
        st['installed_recipes'].append(installed)
    st['first'][stored['event_id']] = copy.deepcopy(dict(commitment=commitment, receipt=receipt,
                                                         full_value=dict(first_append_receipt=receipt, original_segment_ref='segment-1',
                                                                         original_event_value_commitment=commitment)))
    st['next_sequence'] += 1
    st['current_bytes'] = f"current:{st['next_sequence']}"
    return frame


def issue_started(w):
    """Inherited branch original: a fresh-birth goal_run.started at native revision 1 (its authentication is the
    rebound certified-consumer predicate set; this bounded store records that original by commitment only)."""
    payload = payload_for('goal_run.stopped', 'op:start', 0, cause=cause_for('goal_run.stopped', 'op:start', 0))
    started = load('Plans/executor_cancellation_contracts/schemas/goal-run-started.v3.schema.json')
    payload = {k2: v for k2, v in payload.items() if k2 in started['properties']}
    payload.update(event_name='goal_run.started', schema_version=PAYLOAD['goal_run.started'], expected_goal_run_revision=1,
                   goal_run_revision=1, evidence_refs=[], idempotency_key='goal_run.started.writer.v1:fixture')
    payload['payload'] = dict(goal_run_id=SCOPE['goal_run_id'], workgraph_ref='workgraph:1', activation_receipt_ref='activation:1',
                              active_worknode_request_refs=['wn:1'], write_mode='leased_writer', certification_tier='standard')
    event = dict(event_for('goal_run.stopped', {**payload, 'schema_version': PAYLOAD['goal_run.started']}, 'op:start', 0),
                 event_type='goal_run.started', event_id='goal_run.started.v3:fixture', idempotency_key='goal_run.started.writer.v1:fixture',
                 payload_schema_id=PAYLOAD['goal_run.started'], payload=payload)
    frame = storage_append(w, event)
    w['inherited'][frame['event_id']] = dict(branch='started', commitment_sha256=frame['commitment']['sha256'],
                                             goal_run_revision=1, authenticated=True)


def progress(w, steps=2, kind='original_execution_progress'):
    for _ in range(steps):
        r = w['native']['revision']
        w['d01'].append(dict(before_revision=r, after_revision=r + 1, kind=kind, d01_receipt_ref=f'd01:progress:{r}'))
        w['native']['revision'] = r + 1


def baseline(family, steps=2, op=None):
    w = new_world()
    progress(w, steps)
    return case_for(w, family, op or ('op:pause:1' if family == 'goal_run.stopped' else 'op:block:1'))


def case_for(w, family, op, n=1):
    rev = w['native']['revision']
    w['causes'][op] = cause_for(family, op, rev, n)
    payload = payload_for(family, op, rev, w['goal']['revision'], w['causes'][op])
    return dict(world=w, request=dict(family=family, scope=copy.deepcopy(SCOPE), operation_id=op, route=ROUTES[family][0],
                                      expected_goal_run_revision=rev, event=event_for(family, payload, op, rev),
                                      supplied_receipt=None, supplied_digest=None, retry_event=None,
                                      late_append_family=None, fail_at=None, final_change=None,
                                      current_authority_members=1))


# ---------------------------------------------------------------- the writer (SB2/SB3, EP-1111/1112)

def freeze(event):
    frozen = copy.deepcopy(event)
    for field in ('sequence_id', 'observed_at_utc', 'persisted_at_utc'):
        frozen[field] = None
    return frozen


def admit_static(c):
    """The part of admission that does not read the run's mutable native state."""
    w, r = c['world'], c['request']
    family, event = r['family'], r['event']
    reg, birth = w['registration'], w['birth']
    require('request/schema', valid(OWN + 'Request', {k2: r[k2] for k2 in ('scope', 'operation_id', 'expected_goal_run_revision', 'route')}))
    require('registration/profile', reg['profile'] == PROFILE and reg['profile_sha256'] == PROFILE_DIGEST)
    require('birth/original', birth['original_registration'] == reg['operation_id'])
    require('birth/profile', birth['profile'] == reg['profile'] and birth['profile_sha256'] == reg['profile_sha256'])
    require('registration/writer', WRITERS[family] in reg['writers'])
    require('birth/scope', same_json_value(birth['scope'], r['scope']) and same_json_value(r['scope'], SCOPE))
    require('route', r['route'] in ROUTES[family])
    a = w['authority']
    require('authority/permission', a['permission'] is True)
    require('authority/recovery', a['recovery_hold'] is False)
    require('authority/storage', a['storage_writable'] is True)
    require('writer/withdrawal', a['writer_withdrawn'] is False)
    require('event/replay_policy', event['replay_policy'] != 'projector_replay_only')
    require('event/envelope_schema', valid(EVR, freeze_for_schema(event)))


def admit(c):
    """Entry and final predicate: every fact independently resolved from the owner store."""
    w, r = c['world'], c['request']
    family, op, event = r['family'], r['operation_id'], r['event']
    admit_static(c)
    require('native/exists', isinstance(w.get('native'), dict))
    require('cause/exists', op in w['causes'])
    require('goal/exists', isinstance(w.get('goal'), dict))
    native, cause, goal = w['native'], w['causes'][op], w['goal']
    require('native/scope', same_json_value(native['scope'], SCOPE))
    require('goal/scope', goal['project_id'] == SCOPE['project_id'] and goal['goal_id'] == SCOPE['goal_id'])
    require('native/value_revision_type', current_integer_number(native['revision']))
    require('goal/revision_type', current_integer_number(goal['revision']))
    require('native/revision', r['expected_goal_run_revision'] == native['revision'])
    require('native/d01_head', bool(w['d01']) and w['d01'][-1]['after_revision'] == native['revision'])
    require('native/status', native['status'] in LEGAL[family])
    if native['status'] == family.split('.')[1]:
        prior = [o for o in w['operations'].values() if o['family'] == family and o['phase'] == 'published']
        prior_cause = w['causes'].get(prior[-1]['intent']['record']['operation_id']) if prior else None
        require('native/self_evidence', op in w['causes'] and (prior_cause is None or not same_json_value(w['causes'][op]['evidence'], prior_cause['evidence'])))
    require('cause/scope', same_json_value(cause['scope'], SCOPE))
    require('cause/operation', cause['operation_id'] == op)
    require('cause/revision_type', current_integer_number(cause['native_revision']))
    require('cause/revision', cause['native_revision'] == native['revision'])
    require('cause/kind', cause['kind'] == ('settlement' if family == 'goal_run.stopped' else 'block'))
    require('cause/issuer', cause['issuer'] == ('owner.bounded_safe_stop' if family == 'goal_run.stopped' else 'owner.permissions'))
    require('cause/complete', cause['complete'] is True)
    require('cause/mutation_type', type(cause['mutation_started']) is bool)
    require('cause/unresolved', cause['unresolved'] == [])
    inner = event['payload'].get('payload', {}) if isinstance(event.get('payload'), dict) else {}
    if family == 'goal_run.stopped':
        require('cause/required_flush', cause['required_flush'] is True)
        require('cause/settlements', same_json_value(inner.get('settlement_refs'), cause['settlement_refs']))
        if inner.get('resumable') is True:
            require('cause/safe_point', inner.get('safe_point_ref') == cause['safe_point'] and cause['safe_point'] is not None)
    else:
        require('cause/receipt', inner.get('block_receipt_ref') == cause['receipt_ref'])
        require('cause/reason', inner.get('blocked_reason_code') == cause['reason_code'])
        require('cause/preserved_work', same_json_value(inner.get('preserved_work_refs'), cause['preserved_work_refs']))
    require('cause/evidence', same_json_value(event['payload'].get('evidence_refs'), cause['evidence']))
    require('event/family', event['event_type'] == family)
    require('event/dispatch', r['late_append_family'] in (None, family))
    require('event/selector', dispatch_selection(family, event['scope_kind']) == event['payload_schema_id'])
    require('event/payload_schema', valid(PAYLOAD[family], event['payload']))
    require('event/scope', event['scope_kind'] == 'project' and event['project_id'] == SCOPE['project_id'])
    require('event/run', event['run_id'] == SCOPE['goal_run_id'])
    payload = event['payload']
    require('event/payload_scope', payload['project_id'] == SCOPE['project_id'] and payload['goal_id'] == SCOPE['goal_id'])
    require('event/payload_run', payload['payload']['goal_run_id'] == SCOPE['goal_run_id'])
    require('event/goal_revision', payload['goal_revision'] == goal['revision'])
    require('event/expected', payload['expected_goal_run_revision'] == native['revision'])
    require('event/successor', payload['goal_run_revision'] == native['revision'] + 1)
    event_id, key = recipe(family, {**SCOPE, 'expected_goal_run_revision': native['revision'], 'operation_id': op})
    require('event/identity', event['event_id'] == event_id)
    require('event/key', event['idempotency_key'] == key)
    require('event/inner_key', payload['idempotency_key'] == key)
    for label in ('requested_account_ref', 'effective_account_ref', 'actor_ref', 'correlation_id', 'occurred_at_utc'):
        require('event/join/' + label, event[label] == payload[label])
    representable = adapter.representable(event)
    require('event/producer_representable', representable != 'producer')
    require('event/storage_representable', representable != 'storage')
    if r['supplied_digest'] is not None:
        require('event/digest', r['supplied_digest'] == semantic_digest(event))
    return native, cause, goal


def freeze_for_schema(event):
    """The producer request is an EventRecord whose Storage-assigned fields are not yet assigned; validate it with
    lawful placeholders for exactly those three fields, never with caller values."""
    probe = copy.deepcopy(event)
    probe.update(sequence_id=0, observed_at_utc=TIME, persisted_at_utc=TIME)
    return probe


def wrapper(family, kind, record):
    stem = 'stop' if family == 'goal_run.stopped' else 'block'
    root = {'intent': 'Intent', 'control': 'Control', 'native_result': 'NativeResult', 'origin': 'Origin', 'result': 'Result'}[kind]
    value = dict(schema_id=f"pm.storage_value.goal_run_{stem}_{kind.replace('_', '')}.v1", schema_version='1.0.0', record=record)
    require('root/Storage' + stem.capitalize() + root, valid(OWN + 'Storage' + stem.capitalize() + root, value))
    require('wrapper/size', len(packed(value)) <= INLINE_LIMIT)
    return value


def request_view(r):
    return dict(request={k2: r[k2] for k2 in ('scope', 'operation_id', 'expected_goal_run_revision', 'route')},
                frozen_event=freeze(r['event']), producer_semantic_digest=semantic_digest(r['event']))


def held_view(w, held):
    record = held['intent']['record']
    return dict(request=record['request'], frozen_event=resolve_part(record['frozen_event'], w['packs']),
                producer_semantic_digest=record['producer_semantic_digest'])


def retry_checks(c, frozen):
    r = c['request']
    first = c['world']['storage']['first'].get(frozen['event_id'])
    if r['supplied_receipt'] is not None:
        require('receipt/type', valid(REC + 'AppendReceipt', r['supplied_receipt']))
        require('receipt/original', first is not None and same_json_value(r['supplied_receipt'], first['receipt']))
    if r['retry_event'] is not None:
        require('retry/replay_policy', r['retry_event']['replay_policy'] != 'projector_replay_only')
        require('retry/semantic', same_json_value({x: r['retry_event'][x] for x in SEMANTIC_FIELDS},
                                                  {x: frozen[x] for x in SEMANTIC_FIELDS}))


def run_writer(c):
    """Bounded SB2/SB3 phases. Returns the outcome; the owner store holds every issued original."""
    w, r = c['world'], c['request']
    family, op = r['family'], r['operation_id']
    stem = 'stop' if family == 'goal_run.stopped' else 'block'
    held = w['operations'].get(op)
    if held is not None:
        # Same operation: the request-derived intent must be identical; current native state has moved, so the
        # original is resolved from custody rather than re-admitted (SB2/SB3 "equal occupancy").
        admit_static(c)
        require('operation/immutable_conflict', same_json_value(held_view(w, held), request_view(r)))
        retry_checks(c, held_view(w, held)['frozen_event'])
        return recover(c, None)
    native, cause, goal = admit(c)
    event = r['event']
    frozen = freeze(event)
    packs = w['packs']
    members = [('birth', w['birth']), ('native', native), ('d01', w['d01'][-1]), ('goal', goal), ('cause', cause)]
    members += [('current_authority', dict(w['authority'], member=i)) for i in range(r['current_authority_members'])]
    sources = dict(source_argument_sha256=sha([m for _, m in members]),
                   original_selections=[selection(f'{role}:{i}', f'pm.source.{role}', m) for i, (role, m) in enumerate(members)])
    intent_record = dict(scope=copy.deepcopy(SCOPE), operation_id=op, writer=WRITERS[family], profile_sha256=PROFILE_DIGEST,
                         request={k2: r[k2] for k2 in ('scope', 'operation_id', 'expected_goal_run_revision', 'route')},
                         sources=sources, frozen_event=store_part(frozen, packs), producer_semantic_digest=semantic_digest(event),
                         expected_native=selection('native:' + SCOPE['goal_run_id'], 'pm.native.workflow', native),
                         next_goal_run_revision=native['revision'] + 1)
    intent = wrapper(family, 'intent', intent_record)
    w['operations'][op] = dict(family=family, intent=intent, phase='prepared', native_result=None, origin=None, result=None,
                               event_id=event['event_id'])
    control = lambda phase: wrapper(family, 'control', dict(scope=copy.deepcopy(SCOPE), operation_id=op, revision=len(PHASES[:PHASES.index(phase) + 1]),
                                                           phase=phase, intent=selection(opkey(stem + '_intent', op), intent['schema_id'], intent),
                                                           native_result=None, first_receipt=None, result=None))
    w['operations'][op]['control'] = control('prepared')
    if r['fail_at'] == 'prepared':
        return dict(outcome='recovery_required', phase='prepared')
    return commit_native(c)


PHASES = ['prepared', 'native_committed', 'event_issued', 'published']


def commit_native(c):
    w, r = c['world'], c['request']
    family, op = r['family'], r['operation_id']
    stem = 'stop' if family == 'goal_run.stopped' else 'block'
    native, cause, goal = admit(c)  # final predicate repeated over fresh sources at this boundary
    require('final/native', r['final_change'] != 'native')
    require('final/permission', r['final_change'] != 'permission')
    require('final/source', r['final_change'] != 'source')
    before = copy.deepcopy(native)
    after = copy.deepcopy(native)
    after.update(status=family.split('.')[1], revision=native['revision'] + 1)
    held = w['operations'][op]
    native_record = dict(scope=copy.deepcopy(SCOPE), operation_id=op, rule=RULE[family],
                         before=selection('native:before', 'pm.native.workflow', before),
                         after=selection('native:after', 'pm.native.workflow', after),
                         cause=selection('cause:' + op, 'pm.cause.' + cause['kind'], cause),
                         intent=selection(opkey(stem + '_intent', op), held['intent']['schema_id'], held['intent']),
                         before_status=before['status'], after_status=after['status'],
                         before_revision=before['revision'], after_revision=after['revision'])
    native_result = wrapper(family, 'native_result', native_record)
    origin = wrapper(family, 'origin', dict(scope=copy.deepcopy(SCOPE), operation_id=op, transaction_id=f'txn:native:{op}',
                                            writer=WRITERS[family], intent=native_record['intent'],
                                            native_result=selection(opkey(stem + '_native_result', op), native_result['schema_id'], native_result),
                                            source_argument_sha256=held['intent']['record']['sources']['source_argument_sha256']))
    # One native transaction: native body, D01 update and the operation's native phase.
    w['native'] = after
    w['d01'].append(dict(before_revision=before['revision'], after_revision=after['revision'], kind=RULE[family],
                         d01_receipt_ref=f'd01:{op}', operation_id=op))
    held.update(phase='native_committed', native_result=native_result, origin=origin)
    if r['fail_at'] == 'native_committed':
        return dict(outcome='recovery_required', phase='native_committed')
    return append(c)


def append(c):
    w, r = c['world'], c['request']
    family, op = r['family'], r['operation_id']
    a = w['authority']
    require('append/writer_withdrawal', a['writer_withdrawn'] is False)
    require('append/authority', a['permission'] is True and a['storage_writable'] is True and a['recovery_hold'] is False)
    held = w['operations'][op]
    frozen = resolve_part(held['intent']['record']['frozen_event'], w['packs'])
    st = w['storage']
    if frozen['event_id'] in st['first']:
        original = next(f for f in st['log'] if f['event_id'] == frozen['event_id'])
        require('storage/semantic_body', same_json_value({x: original['event'][x] for x in SEMANTIC_FIELDS},
                                                         {x: frozen[x] for x in SEMANTIC_FIELDS}))
    else:
        storage_append(w, frozen)
    first = st['first'][frozen['event_id']]
    require('receipt/schema', valid(REC + 'AppendReceipt', first['receipt']) and valid(REC + 'full_value_result', first['full_value']))
    retry_checks(c, frozen)
    held['phase'] = 'event_issued'
    if r['fail_at'] == 'event_issued':
        return dict(outcome='recovery_required', phase='event_issued')
    return publish(c)


def publish(c):
    w, r = c['world'], c['request']
    family, op = r['family'], r['operation_id']
    stem = 'stop' if family == 'goal_run.stopped' else 'block'
    held = w['operations'][op]
    frame = next(f for f in w['storage']['log'] if f['event_id'] == held['event_id'])
    first = w['storage']['first'][held['event_id']]
    terminal = {'kind': 'command_result' if family == 'goal_run.stopped' else 'scheduler_pass', 'operation_id': op}
    result = wrapper(family, 'result', dict(
        scope=copy.deepcopy(SCOPE), operation_id=op,
        native_result=dict(role='native_result', selection=selection(opkey(stem + '_native_result', op), held['native_result']['schema_id'], held['native_result']),
                           value=store_part(held['native_result'], w['packs'])),
        d01_update=dict(role='d01_update', selection=selection('d01:' + op, 'pm.native.d01_update', w['d01'][-1]),
                        value=store_part(w['d01'][-1], w['packs'])),
        event=store_part(frame['event'], w['packs']), full_value_result=first['full_value'],
        first_receipt_custody=dict(role='first_receipt', selection=selection('first:' + held['event_id'], 'pm.storage.first_append_receipt', first['receipt']),
                                   value=store_part(first['receipt'], w['packs'])),
        terminal_result=store_part(terminal, w['packs'])))
    held.update(phase='published', result=result)
    return dict(outcome='published', phase='published', event_id=held['event_id'], terminal=terminal['kind'], first=copy.deepcopy(first))


def recover(c, claimed):
    """Same original operation only; Storage custody, never a caller claim, decides what was issued."""
    w, r = c['world'], c['request']
    op = r['operation_id']
    held = w['operations'].get(op)
    require('recovery/operation', held is not None and (claimed is None or claimed.get('operation_id') == op))
    require('recovery/frozen', same_json_value(resolve_part(held['intent']['record']['frozen_event'], w['packs']), freeze(r['event'])))
    if claimed is not None and claimed.get('first') is not None:
        original = w['storage']['first'].get(held['event_id'])
        require('recovery/original_custody', original is not None and same_json_value(claimed['first'], original))
    if held['phase'] == 'published':
        return dict(outcome='published', phase='published', event_id=held['event_id'], first=copy.deepcopy(w['storage']['first'][held['event_id']]))
    if held['phase'] == 'prepared':
        return commit_native(c)
    if held['phase'] == 'native_committed':
        return append(c)  # never repeats the native move, settlement or timestamps
    return publish(c)


def inspect(c, event_id, claim=None, current=False):
    """Historical reader: resolves the original record from Storage; a caller claim must equal it exactly."""
    w = c['world']
    require('reader/withdrawal', w['authority']['reader_withdrawn'] is False)
    frame = next((f for f in w['storage']['log'] if f['event_id'] == event_id), None)
    first = w['storage']['first'].get(event_id)
    require('reader/present', frame is not None and first is not None)
    held = next((o for o in w['operations'].values() if o['event_id'] == event_id), None)
    require('reader/original_result', held is not None and held['phase'] == 'published')
    require('reader/whole_value', sha(frame['event']) == frame['commitment']['sha256'])
    require('reader/first_custody', same_json_value(frame['commitment'], first['commitment']) and same_json_value(frame['receipt'], first['receipt']))
    require('reader/receipt', first['receipt']['event_id'] == event_id and first['receipt']['sequence_id'] == frame['event']['sequence_id']
            and type(first['receipt']['sequence_id']) is int)
    snapshot = dict(sealed_receipts=w['storage'].get('sealed_receipts', []), installed_recipes=w['storage'].get('installed_recipes', []),
                    original_value=frame['event'], custody=first['receipt'], content_permitted=w['authority'].get('content_permitted', True) is True)
    reason = adapter.retained_reason(snapshot, frame['event'], w['storage'].get('storage_instance_id', SID), recipe_override=w['authority'].get('recipe_override'))
    for code in adapter.RETAINED_REASONS:
        require('reader/retained/' + code, reason != code)
    if claim is not None:
        require('reader/claim', same_json_value(claim, first))
    if current:
        after = held['native_result']['record']['after']
        require('reader/current_native', after['physical_sha256'] == sha(w['native']))
    return copy.deepcopy(first)


# ---------------------------------------------------------------- the fresh consumer (SB5, SP-1112, GRS-202)

def generic_token(w, generation='eig_' + 'a' * 64):
    st = w['storage']
    sel = dict(storage_instance_id=SID, current_ref='storage/seglog/CURRENT', current_bytes_sha256=hashlib.sha256(st['current_bytes'].encode()).hexdigest(),
               selected_segment_generation=1, manifest_ref='storage/seglog/manifest.v1.msgpack',
               manifest_bytes_sha256=hashlib.sha256(f"manifest:{st['manifest_generation']}".encode()).hexdigest(),
               manifest_generation=st['manifest_generation'], recovery_epoch=0,
               manifest_survivor_prefix_sha256=sha([f['commitment']['sha256'] for f in st['log']]),
               retained_inventory_sha256=sha(['inventory']), durable_watermarks_sha256=sha([len(st['log'])]),
               excluded_ranges_sha256=sha([]), retired_inputs_sha256=sha([]))
    return dict(storage_instance_id=SID, checkpoint_key='event_record_index_checkpoint.v1:' + k(SID),
                checkpoint_ref='checkpoints/event_record_index', generation_id=generation,
                generation_anchor_sha256=hashlib.sha256(generation.encode()).hexdigest(),
                frontier_revision=len(st['log']), frontier_sha256=sha([f['event_id'] for f in st['log']]),
                index_dataset_name='event_record_index.v1@' + generation, source_selection=sel)


def keys():
    root = f"goal_run_stop_block_checkpoint.v1:{k(SID)}:{k(SCOPE['project_id'])}:{k(SCOPE['goal_id'])}:{k(SCOPE['goal_run_id'])}"
    row = f"goal_run_stop_block_projection.v1:{k(SCOPE['project_id'])}:{k(SCOPE['goal_run_id'])}"
    return root, row


def metadata(family, payload):
    inner = payload['payload']
    if family == 'goal_run.stopped':
        return dict(kind='stopped', stop_reason_code=inner['stop_reason_code'], resumable=inner['resumable'],
                    safe_point_ref=inner.get('safe_point_ref'))
    if family == 'goal_run.blocked':
        return dict(kind='blocked', blocked_reason_code=inner['blocked_reason_code'], block_receipt_ref=inner['block_receipt_ref'])
    return None


def reduce(c, token):
    """SBP2..SBP7 over the complete global prefix read from Storage custody. Returns (row, processed facts) or a Halt."""
    w = c['world']
    st = w['storage']
    require('project/token_schema', valid(OWN + 'DurableToken', token))
    require('project/token_storage', token['storage_instance_id'] == SID and token['source_selection']['storage_instance_id'] == SID)
    require('project/token_current', same_json_value(token, generic_token(w, token['generation_id'])))
    status, revision, last, row_meta, last_family, last_evidence = None, None, None, None, None, None
    coverage = []
    for frame in st['log']:
        event = frame['event']
        first = st['first'].get(frame['event_id'])
        require('project/frame_custody', sha(event) == frame['commitment']['sha256'])
        require('project/first_custody', first is not None and same_json_value(first['commitment'], frame['commitment'])
                and same_json_value(first['receipt'], frame['receipt']))
        require('project/frame_envelope', valid(EVR, event))
        selection_key = (event['event_type'], event['scope_kind'], event['payload_schema_id'])
        coverage.append([frame['sequence_id'], frame['commitment']['sha256']])
        if refuses('project/selection', selection_key in SELECTIONS):
            return dict(outcome='halt_before', sequence_id=frame['sequence_id'], event_id=frame['event_id'], reason='project/selection')
        if not (event['project_id'] == SCOPE['project_id'] and event['run_id'] == SCOPE['goal_run_id']):
            continue  # off-run: validated above, then a no-op
        family = event['event_type']
        if family in ('goal_run.stopped', 'goal_run.blocked') and refuses('project/v2_row', event['payload_schema_id'] == PAYLOAD[family]):
            return dict(outcome='halt_before', sequence_id=frame['sequence_id'], event_id=frame['event_id'], reason='project/v2_row')
        if refuses('project/unsupported', family in ('goal_run.started', 'goal_run.stopped', 'goal_run.blocked', 'goal_run.cancelled', 'goal_run.certified')):
            return dict(outcome='halt_before', sequence_id=frame['sequence_id'], event_id=frame['event_id'], reason='project/unsupported')
        if family == 'goal_run.started':
            original = w['inherited'].get(frame['event_id'])
            require('project/inherited_original', status is None and original is not None and original['authenticated'] is True
                    and original['commitment_sha256'] == frame['commitment']['sha256'])
            status, revision, last, row_meta, last_family = 'started', original['goal_run_revision'], frame['event_id'], None, family
            continue
        if refuses('project/edge', status is not None and (status, family) in EDGES):
            return dict(outcome='halt_before', sequence_id=frame['sequence_id'], event_id=frame['event_id'], reason='project/edge')
        payload = event['payload']
        require('project/payload_schema', valid(PAYLOAD[family], payload))
        held = next((o for o in w['operations'].values() if o['event_id'] == frame['event_id']), None)
        require('project/original_result', held is not None and held['phase'] == 'published'
                and same_json_value(resolve_part(held['result']['record']['event'], w['packs']), event))
        op = held['intent']['record']['operation_id']
        event_id, key = recipe(family, {**SCOPE, 'expected_goal_run_revision': payload['expected_goal_run_revision'], 'operation_id': op})
        require('project/identity', event['event_id'] == event_id and event['idempotency_key'] == key and payload['idempotency_key'] == key)
        cause = w['causes'].get(op)
        require('project/cause', cause is not None and held['native_result']['record']['cause']['physical_sha256'] == sha(cause))
        expected, successor = payload['expected_goal_run_revision'], payload['goal_run_revision']
        require('project/native_after', current_integer_number(expected) and current_integer_number(successor) and successor == expected + 1)
        step = [d for d in w['d01'] if d.get('operation_id') == op]
        require('project/native_d01', len(step) == 1 and step[0]['kind'] == RULE[family]
                and step[0]['before_revision'] == expected and step[0]['after_revision'] == successor)
        require('project/native_floor', expected >= revision)
        between = [d for d in w['d01'] if revision <= d['before_revision'] < expected]
        require('project/native_chronology', len(between) == expected - revision
                and all(d['before_revision'] == revision + i and d['after_revision'] == revision + i + 1
                        and d['kind'] in NON_EMITTING_NATIVE_STEPS for i, d in enumerate(sorted(between, key=lambda d: d['before_revision']))))
        if family == last_family:
            require('project/new_evidence', not same_json_value(payload['evidence_refs'], last_evidence))
        status, revision, last, last_family = family.split('.')[1], successor, frame['event_id'], family
        last_evidence = payload['evidence_refs']
        row_meta = metadata(family, payload)
    return dict(outcome='reduced', status=status, revision=revision, last=last, metadata=row_meta,
                through=st['log'][-1]['sequence_id'] if st['log'] else None, count=len(st['log']), coverage=coverage)


def anchor_for(seed, birth_token):
    return hashlib.sha256(packed(['goal_run_stop_block_anchor.v1', SCOPE, PROFILE_DIGEST, seed, birth_token])).hexdigest()


def frontier_for(anchor, revision, prior, processed, txn):
    return hashlib.sha256(packed(['goal_run_stop_block_frontier.v1', anchor, revision, prior, processed, txn])).hexdigest()


def plan_generation(w, token, rebuild):
    """Advance the selected generation; stage a fresh one (seed collision rejection, at most three slots) only for
    the first birth of the projection or an explicit full-scan rebuild."""
    root_key, _ = keys()
    old = w['kv'].get(('checkpoints', root_key))
    rec = old['record'] if old else None
    generations = copy.deepcopy(rec['generations']) if rec else []
    if rec and rec['selected_generation_id'] and not rebuild:
        return generations, next(g for g in generations if g['generation_id'] == rec['selected_generation_id'])
    taken = {g['seed_hex'] for g in generations}
    seed = next(x for x in w['seeds'] if x not in taken)
    anchor = anchor_for(seed, token)
    gen = dict(generation_id='grsbg_' + anchor, seed_hex=seed, anchor_sha256=anchor, birth_token=copy.deepcopy(token),
               profile_sha256=PROFILE_DIGEST, dataset_name='goal_run_stop_block_projection.v1@grsbg_' + anchor, state='staged',
               first_prepared_at_utc=TIME, first_activated_at_utc=None, retired_at_utc=None, successor_generation_id=None,
               frontier_revision=0, prior_frontier_sha256=None, frontier_sha256='0' * 64, last_transaction_id='txn:none',
               processed=None)
    require('generation/slots', len(generations) < 3)
    generations.append(gen)
    return generations, gen


def candidate_for(c, reduced, token, preimage, txn, cutover=True, rebuild=False):
    """Derive the complete candidate (row + whole checkpoint) from the reducer output and the read preimage."""
    w = c['world']
    root_key, row_key = keys()
    old = preimage['checkpoint']['record'] if preimage['checkpoint'] else None
    generations, gen = plan_generation(w, token, rebuild)
    gen = next(g for g in generations if g['generation_id'] == gen['generation_id'])
    projection = None
    if reduced['status'] is not None:
        projection = dict(schema_id='pm.storage_value.goal_run_stop_block_projection.v1', schema_version='1.0.0',
                          record=dict(scope=copy.deepcopy(SCOPE), generation_id=gen['generation_id'], profile_sha256=PROFILE_DIGEST,
                                      lifecycle_status=reduced['status'], projected_goal_run_revision=reduced['revision'],
                                      last_supported_event_id=reduced['last'],
                                      last_original_result=selection('result:' + reduced['last'], 'pm.storage_value.goal_run_result', reduced['last']),
                                      event_commitment=next(f['commitment']['sha256'] for f in w['storage']['log'] if f['event_id'] == reduced['last']),
                                      lifecycle_metadata=reduced['metadata']))
    processed = dict(generic_token=copy.deepcopy(token), through_sequence_id=reduced['through'], record_count=reduced['count'],
                     coverage_sha256=sha(reduced['coverage']), retention_gap_sha256=sha([]),
                     row_key=row_key if projection else None, row_sha256=sha(projection) if projection else None)
    prior = gen['frontier_sha256'] if gen['frontier_revision'] else None
    gen.update(frontier_revision=gen['frontier_revision'] + 1, prior_frontier_sha256=prior, last_transaction_id=txn, processed=processed)
    gen['frontier_sha256'] = frontier_for(gen['anchor_sha256'], gen['frontier_revision'], prior, processed, txn)
    selected = old['selected_generation_id'] if old else None
    if cutover or gen['state'] == 'current':
        require('cutover/coverage', reduced['through'] == (w['storage']['log'][-1]['sequence_id'] if w['storage']['log'] else None))
    if cutover and gen['state'] == 'staged':
        for g in generations:
            if g['generation_id'] == selected:
                g.update(state='retired', retired_at_utc=TIME, successor_generation_id=gen['generation_id'])
        gen['first_activated_at_utc'] = TIME
        gen['state'] = 'current'
        selected = gen['generation_id']
    checkpoint = dict(schema_id='pm.storage_value.goal_run_stop_block_checkpoint.v1', schema_version='1.0.0',
                      record=dict(scope=copy.deepcopy(SCOPE), root_revision=(old['root_revision'] + 1 if old else 0),
                                  selected_generation_id=selected, generations=generations))
    return dict(transaction_id=txn, preimage=copy.deepcopy(preimage), checkpoint=checkpoint, projection=projection)


def read_state(w, table):
    root_key, row_key = keys()
    return dict(checkpoint_key=root_key, row_table=table, row_key=row_key,
                checkpoint=copy.deepcopy(w['kv'].get(('checkpoints', root_key))),
                projection=copy.deepcopy(w['kv'].get((table, row_key))))


def publish_projection(c, candidate, token, *, crash=None, change_between=None, cutover=True, rebuild=False):
    """owner.storage.goal_run.stop_block.publish.v1: rederive, then one Storage transaction under full-preimage CAS."""
    w = c['world']
    reduced = reduce(c, token)
    if reduced['outcome'] == 'halt_before':
        require('assert/halt_root', valid(OWN + 'Halt', reduced))
        return reduced
    require('publish/candidate_schema', valid(OWN + 'ProjectionCandidate', candidate))
    expected = candidate_for(c, reduced, token, candidate['preimage'], candidate['transaction_id'], cutover, rebuild)
    require('publish/candidate', same_json_value(candidate, expected))
    if change_between == 'generic':
        storage_append(w, foreign_event('op:between'))
    if change_between == 'root':
        w['kv'][('checkpoints', candidate['preimage']['checkpoint_key'])] = {'concurrent': True}
    if change_between == 'row':
        w['kv'][(candidate['preimage']['row_table'], candidate['preimage']['row_key'])] = {'concurrent': True}
    # --- one Storage write transaction: compare every whole preimage, then write row and root together
    require('publish/cas_generic', same_json_value(generic_token(w, token['generation_id']), token))
    now = read_state(w, candidate['preimage']['row_table'])
    require('publish/cas_root', same_json_value(now['checkpoint'], candidate['preimage']['checkpoint']))
    require('publish/cas_row', same_json_value(now['projection'], candidate['preimage']['projection']))
    if crash == 'before':
        return dict(outcome='crashed_before_commit')
    gen = next(g for g in candidate['checkpoint']['record']['generations'] if g['last_transaction_id'] == candidate['transaction_id'])
    writes = {('checkpoints', candidate['preimage']['checkpoint_key']): candidate['checkpoint']}
    if candidate['projection'] is not None:
        writes[(gen['dataset_name'], candidate['preimage']['row_key'])] = candidate['projection']
    w['kv'].update(copy.deepcopy(writes))
    result = dict(outcome='success', generation_id=gen['generation_id'], processed=gen['processed'], projection=candidate['projection'])
    require('assert/result_root', valid(OWN + 'ConsumerResult', result))
    return result


def project_prefix(c, *, crash=None, change_between=None, cutover=True, rebuild=False, token=None, edit=None, request=None):
    """owner.goal_run.stop_block.project_prefix.v1 over owner-acquired sources only."""
    w = c['world']
    request = request if request is not None else dict(scope=copy.deepcopy(SCOPE), method='owner.goal_run.stop_block.project_prefix.v1')
    require('project/request', valid(OWN + 'ConsumerRequest', request) and request['method'] == 'owner.goal_run.stop_block.project_prefix.v1')
    require('project/request_scope', same_json_value(request['scope'], w['birth']['scope']))
    require('project/birth', w['birth']['profile'] == PROFILE and w['birth']['profile_sha256'] == PROFILE_DIGEST)
    require('project/registration', w['birth']['original_registration'] == w['registration']['operation_id']
            and w['registration']['profile_sha256'] == PROFILE_DIGEST)
    token = token if token is not None else generic_token(w)
    reduced = reduce(c, token)
    if reduced['outcome'] == 'halt_before':
        require('assert/halt_root', valid(OWN + 'Halt', reduced))
        return reduced
    _, gen = plan_generation(w, token, rebuild)
    preimage = read_state(w, gen['dataset_name'])
    require('assert/state_root', valid(OWN + 'ProjectionState', preimage))
    candidate = candidate_for(c, reduced, token, preimage, f"txn:{len(w['storage']['log'])}:{len(w['kv'])}", cutover, rebuild)
    if edit is not None:
        edit(candidate)
    require('candidate/schema', valid(OWN + 'StorageCheckpoint', candidate['checkpoint'])
            and (candidate['projection'] is None or valid(OWN + 'StorageProjection', candidate['projection'])))
    return publish_projection(c, candidate, token, crash=crash, change_between=change_between, cutover=cutover, rebuild=rebuild)


def read_projection(c, current=False):
    """read_historical.v1 / read_current.v1: reopen root, row and the reducer; current also needs the live frontier and native head."""
    w = c['world']
    require('read/withdrawal', w['authority']['reader_withdrawn'] is False)
    root_key, row_key = keys()
    state = dict(checkpoint=copy.deepcopy(w['kv'].get(('checkpoints', root_key))), row_key=row_key)
    require('read/root', state['checkpoint'] is not None and state['checkpoint']['record']['selected_generation_id'] is not None)
    gen = next(g for g in state['checkpoint']['record']['generations'] if g['generation_id'] == state['checkpoint']['record']['selected_generation_id'])
    row = w['kv'].get((gen['dataset_name'], state['row_key']))
    require('read/row', gen['processed']['row_sha256'] == (sha(row) if row is not None else None))
    require('read/frontier', gen['frontier_sha256'] == frontier_for(gen['anchor_sha256'], gen['frontier_revision'], gen['prior_frontier_sha256'],
                                                                    gen['processed'], gen['last_transaction_id']))
    if current:
        require('read/current_frontier', same_json_value(gen['processed']['generic_token'], generic_token(w)))
        require('read/current_native', row is not None and row['record']['projected_goal_run_revision'] == w['native']['revision'])
    return copy.deepcopy(row)


def foreign_event(op, project='project:beta', run='run:9'):
    scope = dict(SCOPE, project_id=project, goal_run_id=run, scope_partition='project~' + k(project))
    cause = cause_for('goal_run.stopped', op, 3)
    payload = payload_for('goal_run.stopped', op, 3, cause=cause)
    payload.update(project_id=project)
    payload['payload']['goal_run_id'] = run
    return event_for('goal_run.stopped', payload, op, 3, scope)


# ---------------------------------------------------------------- consumer graph (F9) and eager resources

def eager_resources():
    """Every fresh realm (resource-bank.json + consumer-resource-bank.json) resolves every $ref eagerly, the own
    contract resolves inside the union of fresh realms, and every typed method argument root resolves."""
    banks = {**load('Plans/goal_run_stop_block_contracts/resource-bank.json'),
             **load('Plans/goal_run_stop_block_contracts/consumer-resource-bank.json')}
    fresh = {r: d for r, d in banks.items() if d['mode'] == 'fresh_whole_resource_namespace'}
    shared = [load('Plans/event_append_receipt_contracts.schema.json'), load('Plans/event_record.schema.json')]
    own = load('Plans/goal_run_stop_block_contracts/contracts.schema.json')

    def registry(realms):
        reg = Registry()
        for realm in realms:
            for row in fresh[realm]['resources']:
                reg = reg.with_resource(row['retrieval_uri'], Resource.from_contents(row['schema'], default_specification=rjs.DRAFT202012))
        for doc in shared + [own]:
            reg = reg.with_resource(doc['$id'], Resource.from_contents(doc, default_specification=rjs.DRAFT202012))
        return reg.crawl()

    count = refs = 0
    unresolved = []

    def visit(value, resolver, realm):
        nonlocal refs
        if isinstance(value, dict):
            if isinstance(value.get('$id'), str):
                resolver = resolver.in_subresource(Resource.from_contents(value, default_specification=rjs.DRAFT202012))
            if isinstance(value.get('$ref'), str):
                try:
                    resolver.lookup(value['$ref'])
                    refs += 1
                except Exception as exc:
                    unresolved.append({'realm': realm, 'ref': value['$ref'], 'error': str(exc)[:120]})
            for key, child in value.items():
                if key != '$ref':
                    visit(child, resolver, realm)
        elif isinstance(value, list):
            for child in value:
                visit(child, resolver, realm)

    union = registry(list(fresh))
    for realm, description in fresh.items():
        reg = union if description.get('resolution', '').startswith('location-scoped') else registry([realm])
        for row in description['resources']:
            visit(row['schema'], reg.resolver(row['retrieval_uri']), realm)
            count += 1
    visit(own, union.resolver(own['$id']), 'own')
    methods = load('Plans/goal_run_stop_block_contracts/methods.json')
    argument_roots = 0
    for method in methods['consumer_methods']:
        for arg in method['arguments'] + [res for v in method['return_variants'] for res in v['results']]:
            try:
                union.resolver(own['$id']).lookup(arg['schema_ref'])
                argument_roots += 1
            except Exception as exc:
                unresolved.append({'method': method['method'], 'argument': arg['name'], 'error': str(exc)[:120]})
    if unresolved:
        raise ValueError(json.dumps(unresolved[:40]))
    return count, refs, argument_roots


def consumer_graph_checks():
    """F9 structure: five typed methods, each inherited argument keeps its original name, realm and predicate
    source, and its rebound root is exactly resource-map.json[realm] of the original root."""
    methods = load('Plans/goal_run_stop_block_contracts/methods.json')
    rmap = load('Plans/goal_run_stop_block_contracts/resource-map.json')
    cert = {m['method']: m for m in load('Plans/goal_run_certified_consumer_contracts/methods.json')['methods']}
    problems = []
    names = [m['method'] for m in methods['consumer_methods']]
    if names != ['owner.goal_run.stop_block.project_prefix.v1', 'owner.storage.goal_run.stop_block.read_sources.v1',
                 'owner.storage.goal_run.stop_block.publish.v1', 'owner.goal_run.stop_block.read_historical.v1',
                 'owner.goal_run.stop_block.read_current.v1']:
        problems.append('consumer method set')
    for method in methods['consumer_methods']:
        if not method['entry_predicates'] or method['entry_predicates'] != method['final_post_all_helpers_predicates']:
            problems.append(method['method'] + ' predicate tuple')
        for arg in method['arguments']:
            if 'inherited_from' in arg:
                src_method, _, src_arg = arg['inherited_from'].split('#')[1].rpartition('/')
                original = next(a for a in cert[src_method]['arguments'] if a['name'] == src_arg)
                base, frag = urldefrag(original['schema_ref'])
                if arg['realm'] != original['realm'] or arg['schema_ref'] != rmap[original['realm']][base] + ('#' + frag if frag else ''):
                    problems.append(method['method'] + '/' + arg['name'])
    stopped = load('Plans/executor_cancellation_contracts/schemas/goal-run-stopped.v3.schema.json')['$defs']['event_payload']['properties']
    blocked = load('Plans/executor_cancellation_contracts/schemas/goal-run-blocked.v3.schema.json')['$defs']['event_payload']['properties']
    own = load('Plans/goal_run_stop_block_contracts/contracts.schema.json')['$defs']
    if own['StoppedRowMetadata']['properties']['stop_reason_code'] != stopped['stop_reason_code']:
        problems.append('stopped metadata enum drift from v3 payload')
    if own['BlockedRowMetadata']['properties']['blocked_reason_code'] != blocked['blocked_reason_code']:
        problems.append('blocked metadata enum drift from v3 payload')
    return problems


# ---------------------------------------------------------------- cases

def main():
    results, failures = [], []

    def check(name, fn, expected=None):
        adapter.begin_case(name)
        try:
            out = fn()
            got = None
            if isinstance(out, dict) and out.get('outcome') == 'halt_before':
                got = 'halt:' + out['reason']
        except Refusal as exc:
            got = str(exc)
        except Exception as exc:  # noqa: BLE001 - an unexpected error is a failure, never a refusal
            got = 'ERROR:' + repr(exc)
        if expected is not None:
            GUARDS.setdefault(expected, []).append(name)
        adapter.end_case(name, expected, got)
        results.append({'id': name, 'expected': expected, 'actual': got})
        if got != expected:
            failures.append(results[-1])

    def mutate(base, path, value, delete=False):
        c = copy.deepcopy(base)
        target = c
        for item in path[:-1]:
            target = target[item]
        if delete:
            del target[path[-1]]
        else:
            target[path[-1]] = value
        return c

    def published(base):
        c = copy.deepcopy(base)
        out = run_writer(c)
        require('assert/published', out['outcome'] == 'published')
        return c, out

    fixtures = load('Plans/goal_run_stop_block_contracts/oracle-fixtures.json')
    for family in WRITERS:
        c = baseline(family)
        op = c['request']['operation_id']
        check(family + '/published_after_non_emitting_progress', lambda: run_writer(copy.deepcopy(c)))
        adjacent = baseline(family, steps=0)
        check(family + '/published_adjacent_to_start', lambda: run_writer(copy.deepcopy(adjacent)))
        check(family + '/route_alternate', lambda: run_writer(mutate(c, ['request', 'route'], ROUTES[family][-1])))
        # -- one-defect writer negatives from the fixture file (paths into the case)
        for row in fixtures['writer_negatives']:
            path = [op if p == '$op' else p for p in row['path']]
            check(family + '/' + row['id'], lambda row=row, path=path: run_writer(mutate(c, path, row.get('value'), row.get('delete', False))), row['refusal'])
        for row in fixtures['family_negatives'][family]:
            path = [op if p == '$op' else p for p in row['path']]
            check(family + '/' + row['id'], lambda row=row, path=path: run_writer(mutate(c, path, row.get('value'), row.get('delete', False))), row['refusal'])
        # -- scope: one component changed, peers kept; one component missing (F6)
        for owner_path, code in [(['world', 'causes', op, 'scope'], 'cause/scope'), (['world', 'native', 'scope'], 'native/scope')]:
            for comp in SCOPE:
                check(f"{family}/{code.split('/')[0]}_scope_changed/{comp}", lambda p=owner_path, comp=comp, code=code:
                      run_writer(mutate(c, p + [comp], 'foreign:' + comp if comp != 'storage_instance_id' else '00000000-0000-4000-8000-000000000009')), code)
                check(f"{family}/{code.split('/')[0]}_scope_missing/{comp}", lambda p=owner_path, comp=comp, code=code:
                      run_writer(mutate(c, p + [comp], None, delete=True)), code)
        # -- typed revisions (Boolean aliases of a lawful revision-1 baseline)
        one = baseline(family, steps=0)
        check(family + '/revision_one_positive', lambda: run_writer(copy.deepcopy(one)))
        check(family + '/cause_boolean_alias', lambda: run_writer(mutate(one, ['world', 'causes', one['request']['operation_id'], 'native_revision'], True)), 'cause/revision_type')
        check(family + '/native_boolean_alias', lambda: run_writer(mutate(one, ['world', 'native', 'revision'], True)), 'native/value_revision_type')
        goal_one = copy.deepcopy(c)
        goal_one['world']['goal']['revision'] = 1
        goal_one['request']['event']['payload']['goal_revision'] = 1
        check(family + '/goal_revision_one_positive', lambda: run_writer(copy.deepcopy(goal_one)))
        check(family + '/goal_boolean_alias', lambda: run_writer(mutate(goal_one, ['world', 'goal', 'revision'], True)), 'goal/revision_type')
        # -- legal / repeated / illegal source statuses
        for status in sorted(['ready', 'running', 'provisional_success', 'verifying', 'failed_verification', 'repairing', 'blocked',
                              'stopped', 'certified', 'failed', 'cancelled']):
            check(family + '/status/' + status, lambda status=status: run_writer(mutate(c, ['world', 'native', 'status'], status)),
                  None if status in LEGAL[family] else 'native/status')
        repeat, _ = published(c)
        again_case = case_for(repeat['world'], family, op + ':again', 2)
        check(family + '/self_edge_with_new_evidence', lambda: run_writer(copy.deepcopy(again_case)))
        stale_case = copy.deepcopy(again_case)
        stale_case['world']['causes'][op + ':again']['evidence'] = list(repeat['world']['causes'][op]['evidence'])
        stale_case['request']['event']['payload']['evidence_refs'] = list(repeat['world']['causes'][op]['evidence'])
        check(family + '/self_edge_repeated_evidence', lambda: run_writer(stale_case), 'native/self_evidence')
        # -- type-strict authority flags
        for field, code in [('permission', 'authority/permission'), ('recovery_hold', 'authority/recovery'), ('storage_writable', 'authority/storage')]:
            for wrong in ['false', '0', 0, None, [], {}]:
                check(f'{family}/wrong_type/{field}/{wrong!r}', lambda field=field, wrong=wrong: run_writer(mutate(c, ['world', 'authority', field], wrong)), code)
        for wrong in ['false', '0', 0, None, [], {}]:
            check(f'{family}/cause_type/{wrong!r}', lambda wrong=wrong: run_writer(mutate(c, ['world', 'causes', op, 'mutation_started'], wrong)), 'cause/mutation_type')
        # -- timestamps: both copies malformed fail the payload grammar; one lawful copy one second apart fails the join (F7)
        for stamp in ['2026-11-05T24:00:00Z', '2026-11-05T00:00:00', '2026-02-30T00:00:00Z', TIME + '\n', '2026-11-05T00:00:60Z']:
            bad = mutate(c, ['request', 'event', 'occurred_at_utc'], stamp)
            bad['request']['event']['payload']['occurred_at_utc'] = stamp
            check(f'{family}/timestamp/{stamp!r}', lambda bad=bad: run_writer(bad), 'event/envelope_schema')
        check(family + '/timestamp_join_one_second', lambda: run_writer(mutate(c, ['request', 'event', 'occurred_at_utc'], '2026-11-05T00:00:01Z')), 'event/join/occurred_at_utc')
        # -- complete EventRecord, exact dispatch (F2)
        check(family + '/outer_schema_id', lambda: run_writer(mutate(c, ['request', 'event', 'schema_id'], 'pm.event.v9')), 'event/envelope_schema')
        check(family + '/outer_schema_version', lambda: run_writer(mutate(c, ['request', 'event', 'schema_version'], '1.0.0')), 'event/envelope_schema')
        check(family + '/outer_replay_policy', lambda: run_writer(mutate(c, ['request', 'event', 'replay_policy'], 'replay_freely')), 'event/envelope_schema')
        v2 = mutate(c, ['request', 'event', 'payload_schema_id'], 'pm.goal_runtime_event.' + family.replace('.', '_') + '.schema.v2')
        check(family + '/dispatch_registered_v2_selector', lambda: run_writer(v2), 'event/selector')
        check(family + '/goal_source_project', lambda: run_writer(mutate(c, ['world', 'goal', 'project_id'], 'project:beta')), 'goal/scope')
        check(family + '/goal_source_goal', lambda: run_writer(mutate(c, ['world', 'goal', 'goal_id'], 'goal:9')), 'goal/scope')
        check(family + '/d01_head_missing', lambda: run_writer(mutate(c, ['world', 'd01'], c['world']['d01'][:-1])), 'native/d01_head')
        # -- faults, recovery and lost acknowledgement
        for phase in ['prepared', 'native_committed', 'event_issued']:
            interrupted = mutate(c, ['request', 'fail_at'], phase)
            out = run_writer(interrupted)
            check(f'{family}/fault/{phase}', lambda out=out: require('assert/fault_outcome', out['outcome'] == 'recovery_required'))
            resumed = copy.deepcopy(interrupted)
            resumed['request']['fail_at'] = None
            check(f'{family}/recover_from/{phase}', lambda resumed=resumed: require('recovered', recover(resumed, None)['outcome'] == 'published'
                                                                                     and resumed['world']['native']['revision'] == c['world']['native']['revision'] + 1))
        lost = mutate(c, ['request', 'fail_at'], 'event_issued')
        run_writer(lost)
        lost['request']['fail_at'] = None
        first = copy.deepcopy(lost['world']['storage']['first'][lost['request']['event']['event_id']])
        check(family + '/lost_ack_returns_original', lambda: require('original', same_json_value(recover(copy.deepcopy(lost), dict(operation_id=op, first=first))['first'], first)))
        forged_first = copy.deepcopy(first)
        forged_first['receipt']['sequence_id'] = 99
        forged_first['full_value']['first_append_receipt']['sequence_id'] = 99
        forged_first['commitment']['sha256'] = sha(['forged'])
        forged_first['full_value']['original_event_value_commitment']['sha256'] = forged_first['commitment']['sha256']
        check(family + '/recover_coherent_forged_first', lambda: recover(copy.deepcopy(lost), dict(operation_id=op, first=forged_first)), 'recovery/original_custody')
        check(family + '/recover_foreign_operation', lambda: recover(copy.deepcopy(lost), dict(operation_id='op:foreign')), 'recovery/operation')
        changed = copy.deepcopy(lost)
        changed['request']['event']['actor_ref'] = 'foreign'
        changed['request']['event']['payload']['actor_ref'] = 'foreign'
        check(family + '/recover_changed_candidate', lambda: recover(changed, None), 'recovery/frozen')
        # -- Storage-assigned metadata, semantic retry, replay-only
        done, out = published(c)
        retry_base = copy.deepcopy(c)
        retry_base['world'] = copy.deepcopy(done['world'])
        for name, value in [('sequence_id', 99), ('observed_at_utc', '2026-11-05T00:00:41Z'), ('persisted_at_utc', '2026-11-05T00:00:42Z')]:
            retry = copy.deepcopy(c['request']['event'])
            retry[name] = value
            check(f'{family}/storage_metadata_retry/{name}', lambda retry=retry: require('same', run_writer(mutate(retry_base, ['request', 'retry_event'], retry))['outcome'] == 'published'))
        retry = copy.deepcopy(c['request']['event'])
        retry['payload']['expected_goal_run_revision'] = float(retry['payload']['expected_goal_run_revision'])
        # CV-1100 (PNC-019 GC): a retry spelling the original integer 3 as the runtime float 3.0 is a different typed
        # current input, so the typed semantic comparison refuses it (s3d accepted it under the retained grammar).
        check(family + '/integral_float_retry_refused', lambda: run_writer(mutate(retry_base, ['request', 'retry_event'], retry)), 'retry/semantic')
        retry = copy.deepcopy(c['request']['event'])
        retry['correlation_id'] = 'different'
        retry['payload']['correlation_id'] = 'different'
        check(family + '/semantic_retry', lambda: run_writer(mutate(retry_base, ['request', 'retry_event'], retry)), 'retry/semantic')
        retry = copy.deepcopy(c['request']['event'])
        retry['replay_policy'] = 'projector_replay_only'
        check(family + '/replay_only_retry', lambda: run_writer(mutate(retry_base, ['request', 'retry_event'], retry)), 'retry/replay_policy')
        conflict = copy.deepcopy(retry_base)
        conflict['request']['event']['correlation_id'] = 'different'
        conflict['request']['event']['payload']['correlation_id'] = 'different'
        check(family + '/same_operation_conflicting_intent', lambda: run_writer(conflict), 'operation/immutable_conflict')
        receipt = out['first']['receipt']
        check(family + '/supplied_receipt_original', lambda: run_writer(mutate(retry_base, ['request', 'supplied_receipt'], copy.deepcopy(receipt))))
        check(family + '/supplied_receipt_boolean_alias', lambda: run_writer(mutate(retry_base, ['request', 'supplied_receipt'], {**receipt, 'sequence_id': True})), 'receipt/type')
        check(family + '/supplied_receipt_forged', lambda: run_writer(mutate(retry_base, ['request', 'supplied_receipt'], {**receipt, 'sequence_id': 99})), 'receipt/original')
        check(family + '/storage_assigns_first_metadata', lambda: require('assigned', out['first']['receipt']['sequence_id'] == done['world']['storage']['log'][-1]['sequence_id']))
        # -- historical and current readers (Storage-resolved)
        eid = out['event_id']
        check(family + '/reader_original', lambda: inspect(done, eid))
        check(family + '/reader_claim_equal', lambda: inspect(done, eid, claim=copy.deepcopy(out['first'])))
        claim = copy.deepcopy(out['first'])
        claim['receipt']['sequence_id'] = 99
        claim['full_value']['first_append_receipt']['sequence_id'] = 99
        check(family + '/reader_claim_coherent_forgery', lambda: inspect(done, eid, claim=claim), 'reader/claim')
        claim = copy.deepcopy(out['first'])
        claim['receipt']['sequence_id'] = True
        claim['full_value']['first_append_receipt']['sequence_id'] = True
        check(family + '/reader_claim_boolean_alias', lambda: inspect(done, eid, claim=claim), 'reader/claim')
        corrupt = copy.deepcopy(done)
        corrupt['world']['storage']['log'][-1]['event']['correlation_id'] = 'at-rest-change'
        check(family + '/reader_at_rest_corruption', lambda: inspect(corrupt, eid), 'reader/whole_value')
        split = copy.deepcopy(done)
        split['world']['storage']['first'][eid]['receipt']['byte_offset'] += 1
        check(family + '/reader_first_custody_split', lambda: inspect(split, eid), 'reader/first_custody')
        check(family + '/reader_withdrawn', lambda: inspect(mutate(done, ['world', 'authority', 'reader_withdrawn'], True), eid), 'reader/withdrawal')
        check(family + '/reader_unknown_event', lambda: inspect(done, 'goal_run.stopped.v1:unknown'), 'reader/present')
        retained = copy.deepcopy(done)
        retained['world']['authority']['writer_withdrawn'] = True
        retained['world']['native']['status'] = 'cancelled'
        check(family + '/retained_after_live_and_writer_change', lambda: inspect(retained, eid))
        check(family + '/current_after_live_change', lambda: inspect(retained, eid, current=True), 'reader/current_native')
        pending = mutate(c, ['request', 'fail_at'], 'event_issued')
        run_writer(pending)
        check(family + '/reader_pending_original', lambda: inspect(pending, pending['request']['event']['event_id']), 'reader/original_result')
        withdrawn = mutate(c, ['request', 'fail_at'], 'native_committed')
        run_writer(withdrawn)
        withdrawn['request']['fail_at'] = None
        withdrawn['world']['authority']['writer_withdrawn'] = True
        check(family + '/withdrawn_after_native_commit', lambda: recover(withdrawn, None), 'append/writer_withdrawal')
        # -- projection (SB5) over the real prefix, GRS-202 relation (F1), metadata (F3), token (F8)
        check(family + '/project_after_non_emitting_progress', lambda: require('row', (lambda r: r['projection']['record']['projected_goal_run_revision'] == 4
                                                                                and r['projection']['record']['lifecycle_metadata']['kind'] == family.split('.')[1])(project_prefix(copy.deepcopy(done)))))
        adj_done, _ = published(adjacent)
        check(family + '/project_adjacent', lambda: project_prefix(copy.deepcopy(adj_done)))
        check(family + '/project_metadata_from_original', lambda: require('meta', project_prefix(copy.deepcopy(done))['projection']['record']['lifecycle_metadata']
                                                                    == metadata(family, c['request']['event']['payload'])))
        check(family + '/projection_root_rejects_missing_metadata', lambda: require('closed', not valid(OWN + 'Projection', {k2: v for k2, v in
                                                                                    project_prefix(copy.deepcopy(done))['projection']['record'].items() if k2 != 'lifecycle_metadata'})))
        other = 'goal_run.blocked' if family == 'goal_run.stopped' else 'goal_run.stopped'
        check(family + '/projection_root_rejects_other_family_metadata', lambda: require('closed', not valid(OWN + 'Projection', {**project_prefix(copy.deepcopy(done))['projection']['record'],
                                                                                         'lifecycle_metadata': metadata(other, payload_for(other, 'op:x', 3, cause=cause_for(other, 'op:x', 3)))})))
        forge_metadata = forge_stopped_metadata if family == 'goal_run.stopped' else forge_blocked_metadata
        check(family + '/project_metadata_edited_candidate', lambda: project_prefix(copy.deepcopy(done), edit=forge_metadata), 'publish/candidate')
        gap = copy.deepcopy(done)
        gap['world']['d01'] = [d for d in gap['world']['d01'] if d['before_revision'] != 2]
        check(family + '/project_unauthenticated_gap', lambda: project_prefix(gap), 'project/native_chronology')
        emitting = copy.deepcopy(done)
        next(d for d in emitting['world']['d01'] if d['before_revision'] == 2)['kind'] = 'original_run_block' if family == 'goal_run.stopped' else 'original_run_stop'
        check(family + '/project_emitting_intervening_step', lambda: project_prefix(emitting), 'project/native_chronology')
        lower = copy.deepcopy(done)
        lower['world']['inherited']['goal_run.started.v3:fixture']['goal_run_revision'] = 4
        check(family + '/project_expected_below_projected', lambda: project_prefix(lower), 'project/native_floor')
        no_d01 = copy.deepcopy(done)
        no_d01['world']['d01'] = [d for d in no_d01['world']['d01'] if d.get('operation_id') != op]
        check(family + '/project_missing_d01_update', lambda: project_prefix(no_d01), 'project/native_d01')
        unsupported = copy.deepcopy(adj_done)
        frame = unsupported['world']['storage']['log'].pop()
        ev = copy.deepcopy(frame['event'])
        ev.update(event_type='goal_run.replanned', event_id='goal_run.replanned.v1:x', payload_schema_id='pm.goal_runtime_event.goal_run_replanned.schema.v2',
                  sequence_id=None, observed_at_utc=None, persisted_at_utc=None)
        unsupported['world']['storage']['next_sequence'] -= 1
        unsupported['world']['storage']['first'].pop(frame['event_id'])
        storage_append(unsupported['world'], ev)
        storage_append(unsupported['world'], freeze(frame['event']))
        check(family + '/project_intervening_unsupported_event', lambda: project_prefix(unsupported), 'halt:project/unsupported')
        unregistered = copy.deepcopy(done)
        storage_append(unregistered['world'], dict(foreign_event('op:unreg'), payload_schema_id='pm.goal_runtime_event.goal_run_stopped.schema.v9'))
        check(family + '/project_unregistered_selection', lambda: project_prefix(unregistered), 'halt:project/selection')
        v2row = copy.deepcopy(adj_done)
        last = v2row['world']['storage']['log'][-1]
        last['event']['payload_schema_id'] = 'pm.goal_runtime_event.' + family.replace('.', '_') + '.schema.v2'
        last['commitment']['sha256'] = sha(last['event'])
        v2row['world']['storage']['first'][last['event_id']]['commitment'] = copy.deepcopy(last['commitment'])
        check(family + '/project_v2_row', lambda: project_prefix(v2row), 'halt:project/v2_row')
        foreign = copy.deepcopy(done)
        storage_append(foreign['world'], foreign_event('op:foreign'))
        row_facts = lambda r: {x: r['projection']['record'][x] for x in ('lifecycle_status', 'projected_goal_run_revision', 'last_supported_event_id',
                                                                           'event_commitment', 'lifecycle_metadata')}
        check(family + '/project_foreign_original_not_counted', lambda: require('same row', (lambda a, b: row_facts(a) == row_facts(b)
              and a['processed']['record_count'] == b['processed']['record_count'] - 1)(project_prefix(copy.deepcopy(done)), project_prefix(copy.deepcopy(foreign)))))
        tamper = copy.deepcopy(done)
        tamper['world']['storage']['log'][-1]['event']['correlation_id'] = 'tampered'
        check(family + '/project_frame_at_rest_corruption', lambda: project_prefix(tamper), 'project/frame_custody')
        tamper = copy.deepcopy(done)
        f = tamper['world']['storage']['log'][-1]
        f['event']['correlation_id'] = 'tampered'
        f['commitment']['sha256'] = sha(f['event'])
        check(family + '/project_frame_rehashed_without_first_custody', lambda: project_prefix(tamper), 'project/first_custody')
        tamper = copy.deepcopy(done)
        f = tamper['world']['storage']['log'][-1]
        f['event']['payload']['correlation_id'] = 'tampered'
        f['event']['correlation_id'] = 'tampered'
        f['commitment']['sha256'] = sha(f['event'])
        tamper['world']['storage']['first'][f['event_id']]['commitment'] = copy.deepcopy(f['commitment'])
        check(family + '/project_coherent_storage_forgery', lambda: project_prefix(tamper), 'project/original_result')
        tamper = copy.deepcopy(done)
        f = tamper['world']['storage']['log'][-1]
        f['event']['schema_version'] = '1.0.0'
        f['commitment']['sha256'] = sha(f['event'])
        tamper['world']['storage']['first'][f['event_id']]['commitment'] = copy.deepcopy(f['commitment'])
        check(family + '/project_frame_envelope', lambda: project_prefix(tamper), 'project/frame_envelope')
        nocause = copy.deepcopy(done)
        nocause['world']['causes'][op]['evidence'] = ['evidence:replaced']
        check(family + '/project_cause_changed', lambda: project_prefix(nocause), 'project/cause')
        noinh = copy.deepcopy(done)
        noinh['world']['inherited'] = {}
        check(family + '/project_inherited_start_unauthenticated', lambda: project_prefix(noinh), 'project/inherited_original')
        check(family + '/project_old_birth', lambda: project_prefix(mutate(done, ['world', 'birth', 'profile'], 'pm.executor.workflow_source.all_writers.v7')), 'project/birth')
        check(family + '/project_forged_registration', lambda: project_prefix(mutate(done, ['world', 'birth', 'original_registration'], 'forged')), 'project/registration')
        token = generic_token(done['world'])
        for field in ['generation_id', 'generation_anchor_sha256', 'frontier_sha256']:
            check(f'{family}/token_lf/{field}', lambda field=field: project_prefix(copy.deepcopy(done), token={**token, field: token[field] + '\n'}), 'project/token_schema')
        sel = copy.deepcopy(token)
        sel['source_selection']['current_bytes_sha256'] += '\n'
        check(family + '/token_lf/source_selection.current_bytes_sha256', lambda: project_prefix(copy.deepcopy(done), token=sel), 'project/token_schema')
        for field in ['checkpoint_key', 'checkpoint_ref', 'index_dataset_name']:
            check(f'{family}/token_lf/{field}', lambda field=field: project_prefix(copy.deepcopy(done), token={**token, field: token[field] + '\n'}), 'project/token_schema')
        check(family + '/token_persisted_snapshot_id', lambda: project_prefix(copy.deepcopy(done), token={**token, 'redb_snapshot_id': 'snap:1'}), 'project/token_schema')
        check(family + '/token_foreign_storage', lambda: project_prefix(copy.deepcopy(done), token={**token, 'storage_instance_id': '00000000-0000-4000-8000-000000000009'}), 'project/token_storage')
        stale = copy.deepcopy(token)
        stale['frontier_revision'] -= 1
        check(family + '/token_stale_frontier', lambda: project_prefix(copy.deepcopy(done), token=stale), 'project/token_current')
        # -- coherent at-rest forgeries of a stored row: every Storage copy re-cohered, only the named fact wrong
        def forge(base, fn, rename=None):
            f2 = copy.deepcopy(base)
            recohere(f2['world'], eid, fn, rename)
            return f2
        check(family + '/project_identity_coherent_forgery', lambda: project_prefix(forge(done, lambda e: None, rename='goal_run.forged.v1:' + '0' * 64)), 'project/identity')
        check(family + '/project_successor_coherent_forgery', lambda: project_prefix(forge(done, lambda e: e['payload'].update(goal_run_revision=e['payload']['expected_goal_run_revision'] + 2))), 'project/native_after')
        check(family + '/project_payload_coherent_forgery', lambda: project_prefix(forge(done, lambda e: e['payload'].update(event_name='goal_run.cancelled'))), 'project/payload_schema')
        check(family + '/project_request_foreign_scope', lambda: project_prefix(copy.deepcopy(done), request=dict(scope={**SCOPE, 'goal_id': 'goal:9'}, method='owner.goal_run.stop_block.project_prefix.v1')), 'project/request_scope')
        check(family + '/project_request_wrong_method', lambda: project_prefix(copy.deepcopy(done), request=dict(scope=copy.deepcopy(SCOPE), method='owner.goal_run.stop_block.read_current.v1')), 'project/request')
        # -- sequences through the writer: self-edge with new evidence, blocked -> stopped
        self_done = copy.deepcopy(repeat)
        run_writer(case_for(self_done['world'], family, op + ':again', 2))
        check(family + '/project_self_edge_new_evidence', lambda: require('self edge', project_prefix(copy.deepcopy(self_done))['projection']['record']['projected_goal_run_revision'] == 5))
        same_ev = copy.deepcopy(self_done)
        second = same_ev['world']['operations'][op + ':again']['event_id']
        same_ev['world']['causes'][op + ':again']['evidence'] = list(same_ev['world']['causes'][op]['evidence'])
        held2 = same_ev['world']['operations'][op + ':again']
        held2['native_result']['record']['cause']['physical_sha256'] = sha(same_ev['world']['causes'][op + ':again'])
        recohere(same_ev['world'], second, lambda e: e['payload'].update(evidence_refs=list(same_ev['world']['causes'][op]['evidence'])))
        check(family + '/project_self_edge_repeated_evidence', lambda: project_prefix(same_ev), 'project/new_evidence')
        if family == 'goal_run.blocked':
            then_stop = copy.deepcopy(done)
            run_writer(case_for(then_stop['world'], 'goal_run.stopped', 'op:pause:after-block', 3))
            check('goal_run.blocked/project_blocked_then_stopped', lambda: require('edge', project_prefix(copy.deepcopy(then_stop))['projection']['record']['lifecycle_status'] == 'stopped'))
            # GRS-202 edge table: stopped -> blocked is not an edge. A coherent stored blocked row after the stop
            # (frame and first custody agree) halts at the edge before any payload or original-result read.
            illegal = copy.deepcopy(then_stop)
            forged = copy.deepcopy(next(f for f in illegal['world']['storage']['log'] if f['event']['event_type'] == 'goal_run.blocked')['event'])
            forged.update(event_id='goal_run.blocked.v1:' + '1' * 64, sequence_id=None, observed_at_utc=None, persisted_at_utc=None)
            storage_append(illegal['world'], forged)
            check('goal_run.blocked/project_stopped_then_blocked_edge', lambda: project_prefix(copy.deepcopy(illegal)), 'halt:project/edge')
            check('goal_run.blocked/writer_block_after_stop', lambda: run_writer(case_for(copy.deepcopy(then_stop)['world'], 'goal_run.blocked', 'op:block:after-stop', 4)), 'native/status')
        # -- readers, Storage and recovery boundaries without a negative before this round
        check(family + '/read_before_any_projection', lambda: read_projection(copy.deepcopy(done)), 'read/root')
        projected = copy.deepcopy(done)
        project_prefix(projected)
        frontier_forged = copy.deepcopy(projected)
        frontier_forged['world']['kv'][('checkpoints', keys()[0])]['record']['generations'][-1]['frontier_sha256'] = '0' * 64
        check(family + '/read_frontier_forged', lambda: read_projection(frontier_forged), 'read/frontier')
        receipt_forged = copy.deepcopy(done)
        for holder in (receipt_forged['world']['storage']['log'][-1]['receipt'], receipt_forged['world']['storage']['first'][eid]['receipt'],
                       receipt_forged['world']['storage']['first'][eid]['full_value']['first_append_receipt']):
            holder['event_id'] = 'goal_run.other.v1:0'
        check(family + '/reader_receipt_names_other_event', lambda: inspect(receipt_forged, eid), 'reader/receipt')
        racing = mutate(c, ['request', 'fail_at'], 'native_committed')
        run_writer(racing)
        racing['request']['fail_at'] = None
        other_body = freeze(racing['request']['event'])
        other_body['correlation_id'] = 'correlation:other'
        other_body['payload']['correlation_id'] = 'correlation:other'
        storage_append(racing['world'], other_body)
        check(family + '/append_existing_different_body', lambda: recover(racing, None), 'storage/semantic_body')
        revoked = mutate(c, ['request', 'fail_at'], 'native_committed')
        run_writer(revoked)
        revoked['request']['fail_at'] = None
        revoked['world']['authority']['permission'] = False
        check(family + '/append_after_permission_revoked', lambda: recover(revoked, None), 'append/authority')
        check(family + '/candidate_extra_member', lambda: project_prefix(copy.deepcopy(done), edit=add_candidate_note), 'publish/candidate_schema')
        check(family + '/candidate_checkpoint_extra_member', lambda: project_prefix(copy.deepcopy(done), edit=add_checkpoint_note), 'candidate/schema')
        malformed = mutate(c, ['request', 'fail_at'], 'native_committed')
        run_writer(malformed)
        malformed['request']['fail_at'] = None
        storage_append(malformed['world'], freeze(malformed['request']['event']))
        malformed['world']['storage']['first'][malformed['request']['event']['event_id']]['receipt']['durability_state'] = 'pending'
        check(family + '/append_existing_malformed_receipt', lambda: recover(malformed, None), 'receipt/schema')
        check(family + '/cutover_short_coverage_refused', lambda: cutover_attempt(copy.deepcopy(projected)), 'cutover/coverage')
        check(family + '/cutover_short_coverage_keeps_selection', lambda: require('kept', cutover_short(copy.deepcopy(projected))))
        # -- each own closed root refuses one extra member and one wrong schema id
        held = done['world']['operations'][op]
        for kind in ('intent', 'control', 'native_result', 'origin', 'result'):
            value = held[kind]
            stem = 'Stop' if family == 'goal_run.stopped' else 'Block'
            root = {'intent': 'Intent', 'control': 'Control', 'native_result': 'NativeResult', 'origin': 'Origin', 'result': 'Result'}[kind]
            name = 'root/Storage' + stem + root
            check(f'{family}/root_valid/{kind}', lambda value=value, name=name: root_check(name, value))
            check(f'{family}/root_extra_member/{kind}', lambda value=value, name=name: root_check(name, {**value, 'record': {**value['record'], 'extra': 1}}), name)
            check(f'{family}/root_wrong_schema_id/{kind}', lambda value=value, name=name: root_check(name, {**value, 'schema_id': value['schema_id'] + '.x'}), name)
        cp = projected['world']['kv'][('checkpoints', keys()[0])]
        check(family + '/root_checkpoint_extra_member', lambda: root_check('root/StorageCheckpoint', {**cp, 'record': {**cp['record'], 'extra': 1}}), 'root/StorageCheckpoint')
        check(family + '/root_checkpoint_four_generations', lambda: root_check('root/StorageCheckpoint', {**cp, 'record': {**cp['record'], 'generations': cp['record']['generations'] * 4}}), 'root/StorageCheckpoint')
        # -- the whole transaction: CAS on every preimage, atomicity, slots, cutover
        check(family + '/cas_generic_changed', lambda: project_prefix(copy.deepcopy(done), change_between='generic'), 'publish/cas_generic')
        check(family + '/cas_root_changed', lambda: project_prefix(copy.deepcopy(done), change_between='root'), 'publish/cas_root')
        check(family + '/cas_row_changed', lambda: project_prefix(copy.deepcopy(done), change_between='row'), 'publish/cas_row')
        crashed = copy.deepcopy(done)
        check(family + '/crash_before_commit_writes_nothing', lambda: require('none', project_prefix(crashed, crash='before')['outcome'] == 'crashed_before_commit' and crashed['world']['kv'] == {}))
        after = copy.deepcopy(done)
        project_prefix(after)
        check(family + '/commit_writes_row_and_root_together', lambda: require('both', len(after['world']['kv']) == 2 and read_projection(after) is not None))
        check(family + '/read_historical', lambda: read_projection(copy.deepcopy(after)))
        check(family + '/read_current', lambda: read_projection(copy.deepcopy(after), current=True))
        moved = copy.deepcopy(after)
        progress(moved['world'], 1)
        check(family + '/read_historical_after_native_advance', lambda: read_projection(copy.deepcopy(moved)))
        check(family + '/read_current_after_native_advance', lambda: read_projection(copy.deepcopy(moved), current=True), 'read/current_native')
        appended = copy.deepcopy(after)
        storage_append(appended['world'], foreign_event('op:later'))
        check(family + '/read_current_stale_frontier', lambda: read_projection(appended, current=True), 'read/current_frontier')
        check(family + '/read_withdrawn', lambda: read_projection(mutate(after, ['world', 'authority', 'reader_withdrawn'], True)), 'read/withdrawal')
        rowfork = copy.deepcopy(after)
        key = next(kk for kk in rowfork['world']['kv'] if kk[0] != 'checkpoints')
        rowfork['world']['kv'][key]['record']['projected_goal_run_revision'] = 9
        check(family + '/read_row_substituted', lambda: read_projection(rowfork), 'read/row')
        again = copy.deepcopy(after)
        storage_append(again['world'], foreign_event('op:again'))
        check(family + '/second_transaction_advances_frontier', lambda: require('frontier', (lambda r: r['processed']['record_count'] == len(again['world']['storage']['log']))(project_prefix(again))))
        slots = copy.deepcopy(after)
        root_key, _ = keys()
        rec = slots['world']['kv'][('checkpoints', root_key)]['record']
        cur = rec['generations'][0]
        rec['generations'] = [dict(copy.deepcopy(cur), state='retired', generation_id='grsbg_' + c2 * 64, seed_hex=c2 * 64, retired_at_utc=TIME, successor_generation_id=cur['generation_id'])
                              for c2 in ('5', '6')] + [cur]
        rec['generations'][2]['state'] = 'current'
        storage_append(slots['world'], foreign_event('op:slots'))
        check(family + '/generation_slot_limit', lambda: project_prefix(slots, rebuild=True), 'generation/slots')
        rebuilt = copy.deepcopy(after)
        storage_append(rebuilt['world'], foreign_event('op:rebuild'))
        check(family + '/rebuild_stages_and_cuts_over', lambda: require('cutover', (lambda r, w: r['outcome'] == 'success'
              and [g['state'] for g in w['kv'][('checkpoints', keys()[0])]['record']['generations']] == ['retired', 'current'])(project_prefix(rebuilt, rebuild=True), rebuilt['world'])))
        check(family + '/cutover_requires_full_coverage', lambda: require('refused, prior selection kept', cutover_short(copy.deepcopy(after))))
    gc_cases(check, mutate, published)
    # -- SP-337 parts (F4, F5)
    packs = {}
    for label, value in [('ascii', {'x': 'a' * 16000}), ('two_byte', {'x': 'é' * 8000}), ('four_byte', {'x': '\U0001f9f5' * 4000})]:
        lo, hi = 1, 20000
        filler = value['x'][0]
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if len(packed({'inline': {'x': filler * mid}, 'payload_ref': None})) <= INLINE_LIMIT:
                lo = mid
            else:
                hi = mid - 1
        fits, over = {'x': filler * lo}, {'x': filler * (lo + 1)}
        check(f'parts/{label}_largest_inline', lambda fits=fits: require('inline', store_part(fits, packs)['payload_ref'] is None and resolve_part(store_part(fits, packs), packs) == fits))
        check(f'parts/{label}_first_reference', lambda over=over: require('ref', store_part(over, packs)['payload_ref'] is not None and resolve_part(store_part(over, packs), packs) == over))
        check(f'parts/{label}_body_fits_but_wrapper_does_not', lambda over=over: require('wrapper measured', len(packed(over)) <= INLINE_LIMIT
              and len(packed({'inline': over, 'payload_ref': None})) > INLINE_LIMIT and store_part(over, packs)['payload_ref'] is not None))
        check(f'parts/{label}_inline_overlimit', lambda over=over: resolve_part({'inline': over, 'payload_ref': None}, packs), 'part/inline_size')
    big = {'whole_original_source': '\U0001f9f5' * 20000}
    part = store_part(big, packs)
    check('parts/large_source_roundtrip', lambda: require('roundtrip', resolve_part(part, packs) == big))
    check('parts/false_byte_size', lambda: resolve_part({**part, 'payload_ref': {**part['payload_ref'], 'byte_size': part['payload_ref']['byte_size'] + 1}}, packs), 'part/size')
    check('parts/false_media', lambda: resolve_part({**part, 'payload_ref': {**part['payload_ref'], 'media_type': 'text/plain'}}, packs), 'part/branch')
    check('parts/missing_original', lambda: resolve_part(part, {}), 'part/present')
    check('parts/forged_original', lambda: resolve_part(part, {part['payload_ref']['blake3']: b'forged'}), 'part/hash')
    for label, inline in [('string', 'text'), ('array', [1]), ('number', 1)]:
        check(f'parts/inline_{label}', lambda inline=inline: resolve_part({'inline': inline, 'payload_ref': None}, packs), 'part/branch')
    check('parts/inline_null_without_ref', lambda: resolve_part({'inline': None, 'payload_ref': None}, packs), 'part/branch')
    check('parts/inline_and_ref', lambda: resolve_part({'inline': {'x': 1}, 'payload_ref': part['payload_ref']}, packs), 'part/branch')
    check('parts/extra_member', lambda: resolve_part({**part, 'note': 'x'}, packs), 'part/branch')
    wide = baseline('goal_run.stopped')
    wide['request']['current_authority_members'] = 400
    check('parts/compact_wrapper_still_over_limit', lambda: run_writer(wide), 'wrapper/size')
    check('parts/compact_wrapper_writes_nothing', lambda: require('nothing', (lambda c2: (run_writer_safe(c2), c2['world']['operations'] == {} and c2['world']['storage']['log'][-1]['event']['event_type'] == 'goal_run.started')[1])(copy.deepcopy(wide))))
    # -- prepared v3 registry rows (criteria 4 and 5) and the profile's member pins
    family_schema = load('Plans/event_family_registry.schema.json')
    fam_reg = Registry().with_resource(family_schema['$id'], Resource.from_contents(family_schema)).crawl()
    fam_validator = jsonschema.Draft202012Validator({'$ref': family_schema['$id'] + '#/$defs/family'}, registry=fam_reg)
    live = {row['event_type']: row for row in load('Plans/event_family_registry.json')['families']}
    for prepared in load('Plans/goal_run_stop_block_contracts/prepared-registry-rows.json')['rows']:
        row = prepared['registry_row']
        fam = row['event_type']
        check(f'{fam}/prepared_row_family_schema', lambda row=row: require('prepared/row_schema', not any(True for _ in fam_validator.iter_errors(row))))
        check(f'{fam}/prepared_row_identity', lambda row=row, fam=fam: require('prepared/identity', row['family_id'] == live[fam]['family_id']
              and row['scope_policy'] == live[fam]['scope_policy'] and replaces_or_selected(prepared, live[fam])))
        ref = row['payload_schema_ref']
        check(f'{fam}/prepared_row_payload_ref', lambda ref=ref: require('prepared/payload_ref', load(ref['path'])['$id'] == ref['schema_id']
              and load(ref['path']).get('additionalProperties') is False))
        sample, _ = published(baseline(fam))
        event = sample['world']['storage']['log'][-1]['event']
        check(f'{fam}/prepared_row_pointers_join', lambda row=row, event=event: require('prepared/pointers', all(
            resolve_pointer(event, pointer) == event[field] for field, pointers in row['legacy']['identity_json_pointers'].items()
            for pointer in pointers if resolve_pointer(event, pointer) is not MISSING)))
        bad = copy.deepcopy(row)
        bad['payload_versions'][0]['producer_admission'] = 'implicit'
        check(f'{fam}/prepared_row_rejects_unknown_admission', lambda bad=bad: require('prepared/row_schema', not any(True for _ in fam_validator.iter_errors(bad))), 'prepared/row_schema')
    profile = load('Plans/goal_run_stop_block_contracts/profile.json')
    for member in profile['members']:
        check('profile/member/' + member['path'].rsplit('/', 1)[1], lambda member=member: require('profile/member_sha256',
              hashlib.sha256((ROOT / member['path']).read_bytes()).hexdigest() == member['sha256']))
    check('profile/not_held', lambda: require('profile/status', profile['status'] == 'PREPARED_WITHOUT_ADMISSION_NATIVE_NOT_RUN' and 'blocking_condition' not in profile))
    # -- F9 consumer graph and every fresh resource
    for problem in consumer_graph_checks():
        failures.append({'consumer_graph': problem})
    try:
        resource_count, ref_count, argument_roots = eager_resources()
    except Exception as exc:  # noqa: BLE001
        resource_count = ref_count = argument_roots = 0
        failures.append({'eager_resources': repr(exc)[:2000]})
    output = dict(status='fail' if failures else 'pass', native_execution='NOT_RUN', source_installation='TEST_ONLY',
                  case_count=len(results), positive_count=sum(r['expected'] is None for r in results),
                  negative_count=sum(r['expected'] is not None for r in results), resource_count=resource_count,
                  resolved_refs=ref_count, consumer_argument_roots=argument_roots, guard_negative_inventory=GUARDS,
                  failures=failures,
                  limits=['Inherited started/positive-D06 cancelled/clean certified branch rows are authenticated by the rebound certified-consumer roots and predicates; this bounded store records them by commitment and does not instantiate their complete argument graphs.',
                          'Native execution, actual source installation and physical redb/seglog bytes are not exercised.',
                          'Guard rows are the predicates above; their removal proof, the shared number/date-time calls and sealed-receipt retained reads belong to the Goal oracle sweep (lane s3ao).'])
    print(json.dumps(output, indent=2))
    return 1 if failures else 0


def add_candidate_note(cand):
    cand.update(note='x')


def add_checkpoint_note(cand):
    cand['checkpoint']['record'].update(note='x')


def forge_stopped_metadata(cand):
    cand['projection']['record']['lifecycle_metadata'].update(resumable=False, safe_point_ref=None)
    cand['checkpoint']['record']['generations'][-1]['processed']['row_sha256'] = sha(cand['projection'])


def forge_blocked_metadata(cand):
    cand['projection']['record']['lifecycle_metadata'].update(block_receipt_ref='permission_denial:forged')
    cand['checkpoint']['record']['generations'][-1]['processed']['row_sha256'] = sha(cand['projection'])


def at_revision(family, revision, op=None):
    """A coherent writer case whose native run revision is `revision` (D01 head, cause, payload and identity agree)."""
    w = new_world()
    w['native']['revision'] = revision
    w['d01'].append(dict(before_revision=1, after_revision=revision, kind='original_execution_progress', d01_receipt_ref='d01:corpus'))
    return case_for(w, family, op or ('op:pause:1' if family == 'goal_run.stopped' else 'op:block:1'))


def gc_cases(check, mutate, published):
    """PNC-019 lane GC additions: shared number and date-time corpus at the complete writer, reader and consumer
    boundaries, sealed-receipt retained reads, and distinct-copy join witnesses. Every case is a complete call."""
    import pm_event_numbers_corpus as corpus_codec
    corpus = load('Plans/event_number_recipe_corpus.json')
    integers = [x for x in corpus['cases'] if x['op'] == 'integer' and 'value' in x]
    stamps = [x for x in corpus['cases'] if x['op'] == 'datetime' and x.get('profile') is None]
    storage_ok = lambda x: x.get('error') is None and type(x['value']) is str and re.fullmatch(r'[0-9-]+T[0-9:.]+Z', x['value']) is not None
    for family in WRITERS:
        c = baseline(family)
        op = c['request']['operation_id']
        # -- CV-1100 current integer grammar at the request boundary (Request.expected_goal_run_revision >= 0): a
        #    grammar refusal is request/schema; a lawful integer is admitted by grammar and then refused by the native CAS.
        for x in integers:
            value = corpus_codec._value(x['value'])
            lawful = type(value) is int and value >= 0
            check(f"{family}/numbers/request_expected/{x['id']}", lambda value=value: run_writer(mutate(c, ['request', 'expected_goal_run_revision'], value)),
                  'native/revision' if lawful else 'request/schema')
        # The integral float equals the native revision, so only the CV-1100 grammar row can refuse it.
        same = c['request']['expected_goal_run_revision']
        for label, value in [('float_integral', float(same)), ('exponent_spelling', json.loads(f'{same}e0'))]:
            check(f'{family}/numbers/request_expected/{label}_equal', lambda value=value: run_writer(mutate(c, ['request', 'expected_goal_run_revision'], value)), 'request/schema')
        for label, value in [('float_integral', 4.0), ('exponent_spelling', json.loads('4e0')), ('negative_zero', json.loads('-0.0'))]:
            check(f'{family}/numbers/request_expected/{label}', lambda value=value: run_writer(mutate(c, ['request', 'expected_goal_run_revision'], value)), 'request/schema')
            check(f'{family}/numbers/native_revision/{label}', lambda value=value: run_writer(mutate(c, ['world', 'native', 'revision'], value)), 'native/value_revision_type')
            check(f'{family}/numbers/cause_revision/{label}', lambda value=value: run_writer(mutate(c, ['world', 'causes', op, 'native_revision'], value)), 'cause/revision_type')
            check(f'{family}/numbers/goal_revision/{label}', lambda value=value: run_writer(mutate(c, ['world', 'goal', 'revision'], value)), 'goal/revision_type')
        # -- coherent arbitrary-precision revisions: exact JCS through 2^53; past it the producer projection refuses
        #    before any effect (no invented ceiling, no float narrowing); 4,400 digits never crash a conversion.
        # The successor (revision + 1) is in the same payload, so 2^53 - 1 is the largest exact coherent revision.
        for label, revision, expected in [('2^53-1', (1 << 53) - 1, None), ('2^53', 1 << 53, 'event/producer_representable'),
                                          ('2^60', 1 << 60, 'event/producer_representable'),
                                          ('4400_digits', numbers.current_integer_token('9' * 4400), 'event/producer_representable')]:
            check(f'{family}/numbers/coherent_revision/{label}', lambda revision=revision: run_writer(at_revision(family, revision)), expected)
        # -- shared date-time corpus, EventRecord profile, both producer copies coherent (envelope and payload)
        for x in stamps:
            bad = mutate(c, ['request', 'event', 'occurred_at_utc'], x['value'])
            bad['request']['event']['payload']['occurred_at_utc'] = x['value']
            check(f"{family}/datetime/occurred_at_utc/{x['id']}", lambda bad=bad: run_writer(bad), None if x.get('error') is None else 'event/envelope_schema')
        done, out = published(c)
        eid = out['event_id']
        # -- Storage-assigned observed/persisted on a stored original take Storage UTC-Z; acknowledged_at_utc the
        #    EventRecord profile (E5-2). Each stored copy is re-cohered so only the named clock differs.
        for x in stamps:
            for field in ('observed_at_utc', 'persisted_at_utc'):
                forged = copy.deepcopy(done)
                recohere(forged['world'], eid, lambda e, field=field, v=x['value']: e.update({field: v}))
                check(f"{family}/datetime/stored_{field}/{x['id']}", lambda forged=forged: project_prefix(forged), None if storage_ok(x) else 'project/frame_envelope')
            racing = mutate(c, ['request', 'fail_at'], 'native_committed')
            run_writer(racing)
            racing['request']['fail_at'] = None
            storage_append(racing['world'], freeze(racing['request']['event']))
            racing['world']['storage']['first'][racing['request']['event']['event_id']]['receipt']['acknowledged_at_utc'] = x['value']
            check(f"{family}/datetime/acknowledged_at_utc/{x['id']}", lambda racing=racing: recover(racing, None), None if x.get('error') is None else 'receipt/schema')
        # -- Storage-assigned sequence_id on a stored original: uint64 storage slot (SP-1100), never JCS. A value past
        #    2^64 - 1 cannot be committed at rest (the physical codec refuses it), so it has no stored witness here.
        for label, value, lawful in [('uint64_max', (1 << 64) - 1, True), ('negative', -1, False),
                                     ('boolean', True, False), ('integral_float', 2.0, False)]:
            forged = copy.deepcopy(done)
            recohere(forged['world'], eid, lambda e, v=value: e.update(sequence_id=v))
            check(f'{family}/numbers/stored_sequence_id/{label}', lambda forged=forged: project_prefix(forged), None if lawful else 'project/frame_envelope')
        # -- sealed original receipt selection at the historical reader; every refused read keeps the whole store
        def store_edit(fn):
            changed = copy.deepcopy(done)
            fn(changed)
            return changed
        def reseal_other(d):
            st = d['world']['storage']
            index = next(i for i, f in enumerate(st['log']) if f['event_id'] == eid)
            row = st['sealed_receipts'][index]
            foreign = copy.deepcopy(st['log'][index]['event'])
            foreign['correlation_id'] = 'correlation:other-original'
            row['original']['record_bytes'] = numbers.storage_value_bytes(foreign)
            original = numbers.OriginalCustody(numbers.OriginalBinding(**row['original']['binding']), numbers.RecipeTuple(**row['original']['recipe']),
                                               row['original']['record_bytes'], row['original']['result_bytes'], row['original']['receipt_bytes'])
            row['seal'] = adapter.retained.seal(original)
        retained_cases = [
            ('missing', lambda d: d['world']['storage'].update(sealed_receipts=[]), 'original_receipt_missing'),
            ('ambiguous', lambda d: d['world']['storage'].update(sealed_receipts=d['world']['storage']['sealed_receipts'] * 2), 'original_receipt_ambiguous'),
            ('bad_seal', lambda d: [r.update(seal='0' * 64) for r in d['world']['storage']['sealed_receipts']], 'original_receipt_seal'),
            ('bad_shape', lambda d: [r.update(original={'binding': {'event_id': r['original']['binding']['event_id']}}) for r in d['world']['storage']['sealed_receipts']], 'original_receipt_shape'),
            ('foreign_storage', lambda d: d['world']['storage'].update(storage_instance_id='00000000-0000-4000-8000-000000000009'), 'original_binding'),
            ('unknown_recipe', lambda d: d['world']['storage'].update(installed_recipes=[]), 'recipe_unknown'),
            ('recipe_catalog_malformed', lambda d: d['world']['storage'].update(installed_recipes=[{'recipe': 'caller'}]), 'recipe_catalog'),
            ('resealed_other_original', reseal_other, 'original_verification'),
            ('caller_recipe_override', lambda d: d['world']['authority'].update(recipe_override='caller-selected'), 'caller_recipe_override'),
            ('disclosure_denied', lambda d: d['world']['authority'].update(content_permitted=False), 'current_disclosure'),
        ]
        check(f'{family}/retained/receipt_selected_original', lambda: inspect(copy.deepcopy(done), eid))
        for label, fn, reason in retained_cases:
            check(f'{family}/retained/{label}', lambda changed=store_edit(fn): inspect(changed, eid), 'reader/retained/' + reason)
        # -- coherent forgeries that isolate one predicate (every other copy re-cohered)
        coherent = copy.deepcopy(c)
        for holder in (coherent['world']['registration'], coherent['world']['birth']):
            holder['profile_sha256'] = 'f' * 64
        check(f'{family}/registration_profile_coherent_forgery', lambda: run_writer(copy.deepcopy(coherent)), 'registration/profile')
        # Positives for rows that only optional inputs reach: a supplied digest, a current read, a stored checkpoint root.
        check(f'{family}/supplied_digest_original', lambda: run_writer(mutate(c, ['request', 'supplied_digest'], semantic_digest(c['request']['event']))))
        check(f'{family}/reader_current_original', lambda: inspect(copy.deepcopy(done), eid, current=True))
        projected = copy.deepcopy(done)
        project_prefix(projected)
        stored_root = projected['world']['kv'][('checkpoints', keys()[0])]
        check(f'{family}/root_valid/checkpoint', lambda: root_check('root/StorageCheckpoint', copy.deepcopy(stored_root)))
        # -- distinct-copy joins: each independently held copy changed alone refuses at its own join row
        envelope = c['request']['event']
        for label in ('requested_account_ref', 'effective_account_ref', 'actor_ref', 'correlation_id', 'occurred_at_utc'):
            other = '2026-11-05T00:00:01Z' if label == 'occurred_at_utc' else (envelope[label] or 'ref') + ':other-copy'
            check(f'{family}/join/{label}/envelope_copy', lambda label=label, other=other: run_writer(mutate(c, ['request', 'event', label], other)), 'event/join/' + label)
            check(f'{family}/join/{label}/payload_copy', lambda label=label, other=other: run_writer(mutate(c, ['request', 'event', 'payload', label], other)), 'event/join/' + label)
        key = envelope['idempotency_key']
        other_key = key[:-1] + ('0' if key[-1] != '0' else '1')
        check(f'{family}/join/idempotency_key/envelope_copy', lambda: run_writer(mutate(c, ['request', 'event', 'idempotency_key'], other_key)), 'event/key')
        check(f'{family}/join/idempotency_key/payload_copy', lambda: run_writer(mutate(c, ['request', 'event', 'payload', 'idempotency_key'], other_key)), 'event/inner_key')
        cause_pairs = [('evidence', 'evidence_refs', ['evidence:other-copy'], 'cause/evidence', False)]
        if family == 'goal_run.stopped':
            cause_pairs.append(('settlement_refs', 'settlement_refs', ['safestop:settle:other-copy'], 'cause/settlements', True))
        else:
            cause_pairs += [('receipt_ref', 'block_receipt_ref', 'permission_denial:other-copy', 'cause/receipt', True),
                            ('preserved_work_refs', 'preserved_work_refs', ['worknode:other-copy'], 'cause/preserved_work', True)]
        for cause_field, payload_field, other, code, inner in cause_pairs:
            check(f'{family}/join/{payload_field}/cause_copy', lambda f=cause_field, o=other: run_writer(mutate(c, ['world', 'causes', op, f], o)), code)
            path = ['request', 'event', 'payload'] + (['payload'] if inner else []) + [payload_field]
            check(f'{family}/join/{payload_field}/payload_copy', lambda path=path, o=other: run_writer(mutate(c, path, o)), code)
        # -- the run-history projection reads each stored original's copies independently
        def frame_copy(d, holder):
            st = d['world']['storage']
            if holder == 'frame_receipt':
                st['log'][-1]['receipt']['byte_offset'] += 1
            else:
                st['first'][eid]['receipt']['byte_offset'] += 1
        for holder in ('frame_receipt', 'first_receipt'):
            check(f'{family}/join/first_custody/{holder}', lambda h=holder: project_prefix(store_edit(lambda d: frame_copy(d, h))), 'project/first_custody')


def recohere(w, event_id, fn, rename=None):
    """TEST_ONLY at-rest forgery: change a stored row and re-cohere every Storage copy and its operation's result."""
    frame = next(f for f in w['storage']['log'] if f['event_id'] == event_id)
    first = w['storage']['first'].pop(event_id)
    fn(frame['event'])
    held = next(o for o in w['operations'].values() if o['event_id'] == event_id)
    if rename is not None:
        frame['event']['event_id'] = rename
        frame['event_id'] = rename
        for holder in (frame['receipt'], first['receipt'], first['full_value']['first_append_receipt']):
            holder['event_id'] = rename
        held['event_id'] = rename
        event_id = rename
    frame['commitment']['sha256'] = sha(frame['event'])
    first['commitment'] = copy.deepcopy(frame['commitment'])
    first['full_value']['original_event_value_commitment'] = copy.deepcopy(frame['commitment'])
    w['storage']['first'][event_id] = first
    held['result']['record']['event'] = store_part(frame['event'], w['packs'])


def root_check(name, value):
    require(name, valid(OWN + name.split('/', 1)[1], value))
    return None


def cutover_attempt(c):
    w = c['world']
    token = generic_token(w)
    reduced = reduce(c, token)
    reduced = dict(reduced, through=reduced['through'] - 1, count=reduced['count'] - 1, coverage=reduced['coverage'][:-1])
    _, gen = plan_generation(w, token, True)
    return candidate_for(c, reduced, token, read_state(w, gen['dataset_name']), 'txn:short', cutover=True, rebuild=True)


MISSING = object()


def resolve_pointer(doc, pointer):
    for part in pointer.lstrip('/').split('/'):
        if not isinstance(doc, dict) or part not in doc:
            return MISSING
        doc = doc[part]
    return doc


def prepared_replaces_ok(prepared, live_row):
    return (prepared['replaces']['family_revision'] == live_row['family_revision']
            and prepared['replaces']['payload_schema_id'] == live_row['payload_schema_id']
            and prepared['registry_row']['family_revision'] == '3.0.0'
            and prepared['registry_row']['retention_policy_ref'] == live_row['retention_policy_ref'])


def run_writer_safe(c):
    try:
        return run_writer(c)
    except Refusal as exc:
        return str(exc)


def cutover_short(c):
    """A cutover whose processed prefix does not reach the current generic frontier refuses and keeps the old selection."""
    w = c['world']
    token = generic_token(w)
    reduced = reduce(c, token)
    reduced = dict(reduced, through=reduced['through'] - 1, count=reduced['count'] - 1, coverage=reduced['coverage'][:-1])
    storage_append(w, foreign_event('op:short'))
    before = copy.deepcopy(w['kv'])
    try:
        token = generic_token(w)
        _, gen = plan_generation(w, token, True)
        candidate_for(c, reduced, token, read_state(w, gen['dataset_name']), 'txn:short', cutover=True, rebuild=True)
    except Refusal as exc:
        return str(exc) == 'cutover/coverage' and w['kv'] == before
    return False


def _world_store(args):
    return args[0]['world']


def _halt(out):
    return out['reason'] if isinstance(out, dict) and out.get('outcome') == 'halt_before' else None


# PNC-019 GC: each top-level writer/consumer/reader call is one complete call of the Goal sweep. Reads also record
# the whole owner store before and after; a read that changed it would fail the run (never a refusal or a kill).
for _name in ('run_writer', 'recover', 'project_prefix', 'cutover_attempt', 'root_check'):
    globals()[_name] = adapter.complete_entry(globals()[_name], 'own_a', Refusal, halt=_halt)
for _name in ('inspect', 'read_projection'):
    globals()[_name] = adapter.complete_entry(globals()[_name], 'own_a', Refusal, store=_world_store)
resolve_part = adapter.complete_entry(resolve_part, 'own_a', Refusal, store=lambda args: args[1])


def replaces_or_selected(prepared, live_row):
    """prepared_replaces_ok over the predecessor of the exact selected successor (S5b revision-aware mode).

    While the family is unrevised the predecessor is the live row, judged exactly as before. Once the live row is
    byte-equal to the pinned prepared successor and its applied revision record (DL-2435..DL-2442) exists and
    matches (scripts/pm_ea_admission_mode.py revision_verdict), the predecessor is the row that record proves the
    revision replaced, and prepared_replaces_ok judges it unchanged. Anything else (a successor without its
    record, a record that does not match, a live row other than the prepared successor) has no predecessor and
    prepared/identity refuses it.
    """
    import pm_ea_admission_mode as admission_mode
    mode = admission_mode.revision_verdict(live_row['event_type'], root=ROOT, successor_row=prepared['registry_row'],
                                           predecessor=prepared['replaces'])
    before = {'unrevised': live_row, 'revised': mode.get('before_row')}.get(mode['mode'])
    return before is not None and prepared_replaces_ok(prepared, before)


if __name__ == '__main__':
    sys.exit(main())
