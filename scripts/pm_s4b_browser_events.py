#!/usr/bin/env python3
"""PNC-019 lane s4b: the complete static checker for the 51 prepared Browser Program families.

Owner text: Section 15 `#browser-program-event-authority-*`, CV-2500..CV-2550, SP-2500..SP-2550 and ATS-2500, all newly
authored under DL-046; per-family identifiers in reports/event-authority-20261114/S4B-contracts.json.

Structure (Method B, after W3I phase 2 fix 2):
- ROWS is the guard table. Every row is ONE predicate over one subject; its decision code is generated from its
  template into scripts/pm_s4b_table_<table>.py by scripts/pm-s4b-table-generate.py (at most eight rows per table).
  Those table modules are what the gated guard tool (scripts/pm_guard_isolation.py, 004bdedd63) scans and cuts.
- The checker refuses ONLY through those table predicates (evaluate()).
- A row's inputs are the presented value and the independent authority it must equal (the committed owner transition
  the producer resolved, Storage's own record, the store's registry, dedupe, log, selection, checkpoint and sealed
  receipts, or a recomputed identity), or a shared helper's own result where the rule IS that helper (the full owner
  schemas with the shared CV-1101 format checker, pm_event_datetime.date_time, storage_uint64, current_integer,
  storage_value_bytes, qualified_jcs, producer_semantic_digest, full_value_commitment, RetainedDispatcher). An input is
  never a row verdict.
- 'applies' is the row's precondition (family, and readiness gates derived from the case, never from table results).
- Cases are built by one pipeline (build_case): authority first (store, owner transition), then every dependent value
  derived from it. A single-defect witness applies one hook at one stage; every later stage is re-derived from it, so
  copies, digests and receipts stay coherent and only the changed value is wrong.
- Store operations (dedupe, retry, compare-and-swap advance, withdrawal, rebuild, cleanup, retained read) are computed
  by the store model below, never asserted by a fixture flag.

No lane-local number cap, serializer or timestamp parser. No admission, no registry append, no native execution.
Deterministic: no clock, network, randomness or machine-dependent input.
"""
import argparse
import base64
import copy
import functools
import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))

from jsonschema import Draft202012Validator  # noqa: E402
from referencing import Registry, Resource  # noqa: E402
from referencing.jsonschema import DRAFT202012  # noqa: E402

import pm_event_numbers  # noqa: E402
from pm_event_numbers import (  # noqa: E402
    EVENT_VALUE, INDEX_BINDING, Refusal,
    storage_uint64, current_integer, current_append_policy, qualified_jcs,
    producer_semantic_digest, storage_value_bytes, decode_storage_value, full_value_commitment,
    RecipeTuple, OriginalBinding, OriginalCustody, FrozenRecipe, RetainedDispatcher,
)
from pm_event_datetime import date_time, format_checker, EVENT_RECORD, STORAGE_UTC_Z  # noqa: E402
from pm_contract_formats import instant, after_seconds  # noqa: E402

TABLE_PREFIX = 'pm_s4b_table_'
SPEC = json.loads((ROOT / 'reports/event-authority-20261114/S4B-contracts.json').read_text())
FAM = {f['event_type']: f for f in SPEC['families']}
FAMILIES = tuple(FAM)
INLINE_LIMIT = 16384
JSON_BUDGET = 65536
UINT64_MAX = (1 << 64) - 1
RETENTION_WINDOW_SECONDS = 604800
STORAGE_INSTANCE_ID = '7c1e2f3a-4b5d-4e6f-8a9b-0c1d2e3f4a5b'
OTHER_STORAGE_INSTANCE_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d'
SERVER_ID = 'server-browser'
PROJECT_ID = 'project-browser'
OCCURRED = '2026-11-14T10:00:00Z'
OBSERVED = '2026-11-14T10:00:01.250Z'
PERSISTED = '2026-11-14T10:00:02Z'
ACKNOWLEDGED = '2026-11-14T10:00:03Z'
WITHDRAWN_AT = '2026-11-14T12:00:00Z'
CLEANUP_NOW = '2026-11-21T12:00:00Z'      # exactly 604800 s after WITHDRAWN_AT
INDEX_CHECKPOINT_PREFIX = 'event_record_index_checkpoint.v1:'
DATASET_PREFIX = 'event_record_index.v2@'
NULL_MIGRATION = {'migrated_from_schema_id': None, 'migrated_from_schema_version': None, 'migration_id': None,
                  'compatibility_event_type': None}
LINEAGE = ('project_id', 'thread_id', 'run_id', 'node_id', 'attempt_id')
SOURCE_COPIES = ('actor_ref', 'requested_account_ref', 'effective_account_ref', 'occurred_at_utc', 'correlation_id',
                 'causation_event_id', 'parent_event_id', 'producer_sequence_id')
PAYLOAD_REFS = ('owner_record_ref', 'owner_record_schema_id', 'transition_receipt_ref', 'permission_snapshot_ref',
                'capability_snapshot_ref', 'artifact_refs')
RECEIPT_FIELDS = ('event_id', 'sequence_id', 'segment_generation', 'segment_name', 'byte_offset', 'commit_group_id',
                  'durability_class', 'durable_end_offset', 'durability_state', 'manifest_generation',
                  'acknowledged_at_utc')
RECEIPT_SLOTS = ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation')


def partition_of(project_id):
    """CV-25xx: scope_partition = project~base64url_no_pad(UTF8(project_id))."""
    return 'project~' + base64.urlsafe_b64encode(project_id.encode('utf-8')).decode('ascii').rstrip('=')


def _hex(label):
    return hashlib.sha256(label.encode('utf-8')).hexdigest()


def _structural_digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=True, separators=(',', ':'),
                                     default=repr).encode()).hexdigest()


# ---- Owner schemas, validated in full with the shared CV-1101 format checker -------------------------------------

def _load(name):
    return json.loads((ROOT / 'Plans' / name).read_text())


PAYLOADS = _load('browser_event_payloads.schema.json')
OWNER = _load('section15_browser_program_contracts.schema.json')
EVENT_RECORD_SCHEMA = _load('event_record.schema.json')
RECEIPT_SCHEMA = _load('event_append_receipt_contracts.schema.json')
CHECKPOINTS = _load('browser_program_event_contracts.schema.json')
ADMISSION = _load('browser_event_admission.json')
FIXTURES = _load('browser_event_admission_fixtures.json')
PAYLOADS_ID, OWNER_ID = PAYLOADS['$id'], OWNER['$id']
EVENT_RECORD_ID, RECEIPT_ID, CHECKPOINTS_ID = EVENT_RECORD_SCHEMA['$id'], RECEIPT_SCHEMA['$id'], CHECKPOINTS['$id']
def _plans_resources():
    """Every Plans schema under its $id and its path URI (as the shared Browser owner gate resolves them), offline."""
    out = []
    for path in sorted((ROOT / 'Plans').rglob('*.schema.json')):
        if '/.audits/' in str(path) or '/_shards/' in str(path):
            continue
        doc = json.loads(path.read_text())
        if not isinstance(doc, dict) or '$id' not in doc:
            continue
        res = Resource.from_contents(doc, default_specification=DRAFT202012)
        out.append((doc['$id'], res))
        out.append(('https://puppetmaster.local/' + str(path.relative_to(ROOT)), res))
    return out


REGISTRY = Registry().with_resources(_plans_resources()).with_resources([
    (PAYLOADS_ID, Resource.from_contents(PAYLOADS, default_specification=DRAFT202012)),
    (OWNER_ID, Resource.from_contents(OWNER, default_specification=DRAFT202012)),
    (urljoin(PAYLOADS_ID, OWNER_ID), Resource.from_contents(OWNER, default_specification=DRAFT202012)),
    (EVENT_RECORD_ID, Resource.from_contents(EVENT_RECORD_SCHEMA, default_specification=DRAFT202012)),
    (RECEIPT_ID, Resource.from_contents(RECEIPT_SCHEMA, default_specification=DRAFT202012)),
    (CHECKPOINTS_ID, Resource.from_contents(CHECKPOINTS, default_specification=DRAFT202012)),
])
# CV-1101: the shared helper's explicitly installed date-time predicate. Every owner date-time format these resources
# carry (EventRecord times, AppendReceipt acknowledged_at_utc, checkpoint withdrawal times) takes the broad EventRecord
# profile; Storage's observed/persisted times add CV-253 storage_utc_z at their own rows.
DATETIME_FORMATS = format_checker(profile=EVENT_RECORD)


@functools.lru_cache(maxsize=None)
def _validator(root_id, pointer):
    ref = root_id + (('#' + pointer) if pointer else '')
    return Draft202012Validator({'$ref': ref}, registry=REGISTRY, format_checker=DATETIME_FORMATS)


def schema_errors(root_id, pointer, value):
    """Full owner validation (every keyword, every format the shared checker owns). Callers run it only on a value
    whose integers encode physically (SP-1100), so no conversion limit is reached and nothing is translated."""
    return sorted('/'.join(str(p) for p in e.absolute_path) + ':' + str(e.validator)
                  for e in _validator(root_id, pointer).iter_errors(value))


def eager_refs(schema, base):
    """Resolve every $ref eagerly, including dormant definitions (standing check 9). Returns the count."""
    resolver = REGISTRY.resolver(base_uri=base)
    count = 0

    def walk(node):
        nonlocal count
        if isinstance(node, dict):
            if isinstance(node.get('$ref'), str):
                resolver.lookup(node['$ref'])
                count += 1
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)
    walk(schema)
    return count


# ---- Shared-rule wrappers: the refusal reason or None (never a verdict) ------------------------------------------

def reason_of(fn, *args, **kwargs):
    try:
        fn(*args, **kwargs)
        return None
    except Refusal as refusal:
        return refusal.reason


def physical_reason(value):
    return reason_of(storage_value_bytes, value, profile=EVENT_VALUE)


def physical_size(value):
    try:
        return len(storage_value_bytes(value, profile=EVENT_VALUE))
    except Refusal:
        return None


def json_size(value):
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        return len(json.dumps(value, separators=(',', ':'), ensure_ascii=False).encode('utf-8'))
    finally:
        sys.set_int_max_str_digits(previous)


def digest_of(event):
    """CV-317 producer-semantic digest through the shared helper, producer_sequence_id type-sensitive (CV-332)."""
    return producer_semantic_digest(event, type_sensitive_paths={('producer_sequence_id',)})


def binding_hash(value):
    """SP-25xx: SHA-256 of the predecessor value's SP-278 INDEX_BINDING bytes."""
    return hashlib.sha256(storage_value_bytes(value, profile=INDEX_BINDING)).hexdigest()


def subject_of(family, payload):
    node = payload
    for part in FAM[family]['subject_pointer']:
        node = node[part]
    return node


def identity(family, payload):
    """CV-25xx: RFC 8785 (shared qualified_jcs) of [event_type, project_id, subject, owner_record_ref,
    transition_receipt_ref]; lowercase SHA-256; evt_browser_ / browser@1: prefixes."""
    tuple_ = [family, payload['context']['project_id'], subject_of(family, payload), payload['owner_record_ref'],
              payload['transition_receipt_ref']]
    digest = hashlib.sha256(qualified_jcs(tuple_)).hexdigest()
    return FAM[family]['event_id_prefix'] + digest, FAM[family]['idempotency_prefix'] + digest


def payload_integer_paths(schema_node, value, path=()):
    """Every integer slot the family payload schema declares that the value presents (resolving $ref/allOf/anyOf)."""
    out = []
    resolver = REGISTRY.resolver(base_uri=PAYLOADS_ID)

    def resolve(node, res):
        while isinstance(node, dict) and '$ref' in node:
            r = res.lookup(node['$ref'])
            node, res = r.contents, r.resolver
        return node, res

    def walk(node, res, v, p):
        node, res = resolve(node, res)
        if not isinstance(node, dict):
            return
        types = node.get('type')
        if (types == 'integer' or (isinstance(types, list) and 'integer' in types)) and v is not None:
            out.append(p)   # a null is not a number spelling: the owner schema decides null-ness
        for key in ('allOf', 'anyOf', 'oneOf'):
            for sub in node.get(key, []):
                sub_node, sub_res = resolve(sub, res)
                if isinstance(sub_node, dict) and sub_node.get('type') == 'null' and v is None:
                    continue
                walk(sub, res, v, p)
        if isinstance(v, dict):
            for k, sub in node.get('properties', {}).items():
                if k in v:
                    walk(sub, res, v[k], p + (k,))
        if isinstance(v, list) and 'items' in node:
            for i, item in enumerate(v):
                walk(node['items'], res, item, p + (i,))
    walk(schema_node, resolver, value, path)
    return sorted(set(out))


def payload_integer_reason(family, payload):
    """CV-1100: every presented integer slot of the closed payload is an exact JSON integer (shared current_integer)."""
    for p in payload_integer_paths(PAYLOADS['$defs'][FAM[family]['payload_def']], payload):
        node = payload
        for part in p:
            node = node[part]
        reason = reason_of(current_integer, node)
        if reason is not None:
            return reason
    return None


# ---- The store model (Storage's authoritative state) --------------------------------------------------------------

def frame_for(sequence_id):
    """Storage's frame record of one log entry (synthetic, deterministic)."""
    slot = sequence_id % 1000000    # synthetic frame position; never derived beyond the uint64 offset domain
    return {'segment_generation': 1, 'segment_name': 'seg-000001-%020d.active' % 1,
            'byte_offset': 1024 * slot, 'frame_end_offset': 1024 * slot + 900}


def selection_for(label, frontier_revision):
    generation_id = 'eig_' + _hex('s4b-generation-' + label)
    return {
        'generation_id': generation_id,
        'generation_anchor_sha256': _hex('s4b-anchor-' + label),
        'frontier_revision': frontier_revision,
        'frontier_sha256': _hex('s4b-frontier-%s-%d' % (label, frontier_revision)),
        'source_selection': {
            'storage_instance_id': STORAGE_INSTANCE_ID,
            'current_ref': 'storage/seglog/CURRENT',
            'current_bytes_sha256': _hex('s4b-current-' + label),
            'selected_segment_generation': 1,
            'manifest_ref': 'storage/seglog/manifest.v1.msgpack',
            'manifest_bytes_sha256': _hex('s4b-manifest-' + label),
            'manifest_generation': 11,
            'recovery_epoch': 3,
            'manifest_survivor_prefix_sha256': _hex('s4b-survivor-' + label),
            'retained_inventory_sha256': _hex('s4b-inventory-' + label),
            'durable_watermarks_sha256': _hex('s4b-watermarks-' + label),
            'excluded_ranges_sha256': _hex('s4b-excluded-' + label),
            'retired_inputs_sha256': _hex('s4b-retired-' + label),
        },
    }


def durable_token(selection):
    """The SP-278 nine-field durable read token (DL-076) the selection determines."""
    g = selection['generation_id']
    return {
        'storage_instance_id': STORAGE_INSTANCE_ID,
        'checkpoint_key': INDEX_CHECKPOINT_PREFIX + STORAGE_INSTANCE_ID,
        'checkpoint_ref': 'checkpoint:' + g,
        'generation_id': g,
        'generation_anchor_sha256': selection['generation_anchor_sha256'],
        'frontier_revision': selection['frontier_revision'],
        'frontier_sha256': selection['frontier_sha256'],
        'index_dataset_name': DATASET_PREFIX + g,
        'source_selection': copy.deepcopy(selection['source_selection']),
    }


def checkpoint_key(family, storage_instance_id, project_id):
    return FAM[family]['checkpoint_family_id'] + '.v1:' + storage_instance_id + ':' + partition_of(project_id)


def scan(family, log, project_id):
    """SP-278 complete prefix scan: every log entry in order, filtered after coverage to the exact family and Project
    partition. Returns (matched_count, through, cursor)."""
    if not log:
        return 0, None, None
    partition = partition_of(project_id)
    count = sum(1 for e in log if e['event_type'] == family and e['partition'] == partition)
    last = log[-1]
    cursor = dict(frame_for(last['sequence_id']), last_sequence_id=last['sequence_id'], last_event_id=last['event_id'])
    return count, last['sequence_id'], cursor


def retired_core(value):
    """The retired-generation core a withdrawn checkpoint value becomes in its key's history."""
    return {k: copy.deepcopy(value[k]) for k in ('publication_id', 'publication_revision', 'index_read_token',
                                                  'index_through_sequence_id', 'matched_count', 'source_cursor',
                                                  'state', 'withdrawn_at_utc', 'withdrawal_receipt_ref', 'hold_refs')}


# ---- Deterministic builders ----------------------------------------------------------------------------------------

FIXTURE_PAYLOAD = {c['event_type']: c['payload'] for c in FIXTURES['valid']}
CONTEXT_DEF = PAYLOADS['$defs']['context']['properties']


def _context_nullable(family, field):
    own = PAYLOADS['$defs'][FAM[family]['payload_def']]['properties']['context'].get('properties', {})
    spec = own.get(field, CONTEXT_DEF[field])
    return 'anyOf' in spec and any(s.get('type') == 'null' for s in spec['anyOf'])


def base_payload(family, linked=False):
    """The owner fixture's valid payload with family-specific, pairwise distinct identifiers (so a copy that reads a
    sibling field is visible). linked=True also fills every nullable lineage field with a distinct non-null value."""
    f = FAM[family]
    payload = copy.deepcopy(FIXTURE_PAYLOAD[family])
    ctx = payload['context']
    for k, v in list(ctx.items()):
        if isinstance(v, str) and k not in ('session_security_class',):
            ctx[k] = k.replace('_id', '').replace('_', '-') + '-' + f['slug'].replace('_', '-')
    ctx['project_id'] = PROJECT_ID
    if linked:
        for k in ('thread_id', 'node_id', 'plan_id', 'goal_id', 'agent_id'):
            if ctx[k] is None and _context_nullable(family, k):
                ctx[k] = k.replace('_id', '') + '-linked-' + f['slug'].replace('_', '-')
        if ctx['run_id'] is None and _context_nullable(family, 'run_id') and _context_nullable(family, 'attempt_id'):
            ctx['run_id'] = 'run-linked-' + f['slug'].replace('_', '-')
            ctx['attempt_id'] = 'attempt-linked-' + f['slug'].replace('_', '-')
    payload['owner_record_ref'] = 'record:' + f['slug'].replace('_', '-') + '-1'
    payload['transition_receipt_ref'] = 'receipt:transition-' + f['slug'].replace('_', '-') + '-1'
    payload['permission_snapshot_ref'] = 'policy:permission-' + f['slug'].replace('_', '-')
    payload['capability_snapshot_ref'] = 'policy:capability-' + f['slug'].replace('_', '-')
    payload['artifact_refs'] = ['artifact:' + f['slug'].replace('_', '-') + '-1'] if linked else []
    return payload


def base_source(family, linked=False):
    """The committed owner transition the producer resolves independently (Section 15 'Producer and order'). It is the
    authority for every payload and envelope copy; only the append boundary reads it."""
    f = FAM[family]
    s = f['slug'].replace('_', '-')
    return {
        'resolved': True,
        'outcome': 'committed',
        'event_type': family,
        'producer_component': f['producer_component'],
        'payload': base_payload(family, linked),
        'transition_sequence': 7,
        'actor_ref': 'service:browser-runtime-' + s,
        'requested_account_ref': ('account:requested-' + s) if linked else None,
        'effective_account_ref': ('account:effective-' + s) if linked else None,
        'occurred_at_utc': OCCURRED,
        'correlation_id': 'correlation-' + s,
        'causation_event_id': ('evt_cause_' + _hex('cause-' + s)) if linked else None,
        'parent_event_id': ('evt_parent_' + _hex('parent-' + s)) if linked else None,
    }


def other_family(family):
    i = FAMILIES.index(family)
    return FAMILIES[(i + 1) % len(FAMILIES)]


def base_store(family, tail=40):
    """Storage's state before the append: the family admitted (a synthetic separate admission), writers open, dedupe
    caught up to the log tail, a prefix of unrelated records."""
    log = [{'sequence_id': n, 'event_id': 'evt_prior_%d_' % n + _hex('prior-%d' % n)[:16],
            'event_type': other_family(family), 'partition': partition_of(PROJECT_ID)} for n in range(1, tail + 1)]
    return {'storage_instance_id': STORAGE_INSTANCE_ID, 'server_id': SERVER_ID, 'registry': [family], 'withdrawn': [],
            'log': log, 'dedupe_through': tail, 'issuance': 'synced', 'dedupe': {}, 'sealed': []}


def safe_identity(family, payload):
    try:
        return identity(family, payload)
    except (KeyError, TypeError, Refusal):
        return FAM[family]['event_id_prefix'] + '0' * 64, FAM[family]['idempotency_prefix'] + '0' * 64


def derive_event(family, payload, source, meta):
    ctx = payload.get('context') if type(payload) is dict else None
    ctx = ctx if type(ctx) is dict else {}
    event_id, key = safe_identity(family, payload) if type(payload) is dict else (None, None)
    return {
        'schema_id': 'pm.event.v0', 'schema_version': '2.0.0', 'scope_kind': 'project',
        'event_id': event_id, 'event_type': family,
        **{k: ctx.get(k) for k in LINEAGE},
        'actor_ref': source['actor_ref'], 'requested_account_ref': source['requested_account_ref'],
        'effective_account_ref': source['effective_account_ref'], 'occurred_at_utc': source['occurred_at_utc'],
        'observed_at_utc': meta['observed_at_utc'], 'persisted_at_utc': meta['persisted_at_utc'],
        'sequence_id': meta['sequence_id'], 'producer_sequence_id': source['transition_sequence'],
        'correlation_id': source['correlation_id'], 'causation_event_id': source['causation_event_id'],
        'parent_event_id': source['parent_event_id'], 'idempotency_key': key,
        'payload_schema_id': FAM[family]['payload_schema_id'], 'payload': payload, 'payload_ref': None,
        'redaction_profile': 'no_secrets', 'replay_policy': 'dedupe_by_idempotency_key',
        'migration': dict(NULL_MIGRATION),
    }


def derive_record(event, meta):
    """Storage's own assigned record and first receipt for this append (authority). The event ID is the one Storage
    appended; sequence, times and receipt fields are Storage's assignment."""
    seq = meta['sequence_id']
    frame = frame_for(seq if type(seq) is int else 0)
    return {
        'event_id': event.get('event_id') if type(event) is dict else None,
        'sequence_id': seq,
        'segment_generation': 1,
        'segment_name': frame['segment_name'],
        'byte_offset': frame['byte_offset'],
        'commit_group_id': 'group-s4b-1',
        'durability_class': 'ordinary',
        'durable_end_offset': frame['frame_end_offset'],
        'durability_state': 'synced',
        'manifest_generation': 11,
        'acknowledged_at_utc': ACKNOWLEDGED,
        'observed_at_utc': meta['observed_at_utc'],
        'persisted_at_utc': meta['persisted_at_utc'],
    }


def _or(fn, fallback):
    try:
        return fn()
    except (Refusal, KeyError, TypeError, ValueError):
        return fallback


def derive_custody(event, record, store, partition):
    return {
        'schema_id': 'pm.storage_value.event_append_receipt_custody.v2',
        'schema_version': '2.0.0',
        'original_event_value_commitment': {
            'schema_id': 'pm.storage.original_event_value_commitment.v1', 'schema_version': '1.0.0',
            'codec': EVENT_VALUE, 'domain': 'pm.storage.original_event_value_commitment.v1',
            'event_schema_id': 'pm.event.v0', 'event_schema_version': '2.0.0',
            'sha256': _or(lambda: full_value_commitment(event), '0' * 64),
        },
        'storage_instance_id': store['storage_instance_id'],
        'event_id': event.get('event_id') if type(event) is dict else None,
        'scope_partition': partition,
        'event_type': event.get('event_type') if type(event) is dict else None,
        'idempotency_key': event.get('idempotency_key') if type(event) is dict else None,
        'producer_semantic_digest': _or(lambda: digest_of(event), '0' * 64),
        'group_digest': _hex('s4b-group:' + str(record.get('commit_group_id'))),
        'first_append_receipt': {k: record.get(k) for k in RECEIPT_FIELDS},
        'redaction_profile': 'no_secrets',
        'original_segment_ref': 'segment:s4b-original',
    }


def _apply(hooks, stage, value, ctx):
    fn = hooks.get(stage)
    if fn is not None:
        out = fn(value, ctx)
        if out is not None:
            return out
    return value


def build_case(family, variant='base', hooks=None):
    """One complete append world, built authority-first. hooks: {stage: fn(value, ctx) -> value|None} applied at
    'store', 'source', 'payload', 'meta', 'event', 'record', 'custody' and 'case'; later stages re-derive from it."""
    hooks = hooks or {}
    ctx = {'family': family, 'variant': variant}
    store = _apply(hooks, 'store', base_store(family), ctx)
    ctx['store'] = store
    source = _apply(hooks, 'source', base_source(family, linked=(variant == 'linked')), ctx)
    ctx['source'] = source
    payload = _apply(hooks, 'payload', copy.deepcopy(source['payload']), ctx)
    meta = _apply(hooks, 'meta', {'sequence_id': (store['log'][-1]['sequence_id'] if store['log'] else 0) + 1,
                                  'observed_at_utc': OBSERVED, 'persisted_at_utc': PERSISTED}, ctx)
    event = _apply(hooks, 'event', derive_event(family, payload, source, meta), ctx)
    record = _apply(hooks, 'record', derive_record(event, meta), ctx)
    project = event.get('project_id') if type(event) is dict else None
    partition = _apply(hooks, 'partition', partition_of(project) if type(project) is str else 'project~', ctx)
    custody = _apply(hooks, 'custody', derive_custody(event, record, store, partition), ctx)
    case = {'family': family, 'variant': variant, 'store': store, 'source': source, 'event': event,
            'storage_record': record, 'custody_receipt': custody, 'scope_partition': partition,
            'producer': FAM[family]['producer_component'], 'reported_outcome': 'success'}
    return _apply(hooks, 'case', case, ctx)


# ---- Family predicates: the shared Browser owner validator's rules, one function each ------------------------------
# Each mirrors exactly one GS row of scripts/pm-browser-event-admission.py semantic_failures; evaluate() cross-checks
# the two on every case whose payload the owner schema accepts (predicate_agreement).

def _ctx(p):
    return p['context']


def _fx(p):
    return p['facts']


def _cov(p):
    return _fx(p)['coverage']


def _complete(p):
    return _cov(p)['status'] == 'complete'


def _identity_same(p):
    old, new = _fx(p)['old_fence'], _fx(p)['new_fence']
    return [k for k in ('lease_id', 'holder_id', 'lease_epoch', 'lease_generation') if old[k] != new[k]] == []


def _other_terminal(p):
    t = _fx(p).get('terminal_state')
    return bool(t) and t != 'timed_out_effect_state_unknown'


PREDICATES = {
    'run_attempt_paired': lambda p: (_ctx(p)['run_id'] is None) == (_ctx(p)['attempt_id'] is None),
    'session_workspace_paired': lambda p: (_ctx(p)['browser_session_id'] is None) == (_ctx(p)['browser_workspace_id'] is None),
    'page_generation_paired': lambda p: (_ctx(p)['browser_page_id'] is None) == (_ctx(p)['page_generation'] is None),
    'page_has_workspace': lambda p: _ctx(p)['browser_page_id'] is None or _ctx(p)['browser_workspace_id'] is not None,
    'prior_generation_present': lambda p: _fx(p)['prior_page_generation'] is not None,
    'generation_advances': lambda p: _fx(p)['prior_page_generation'] is None or _fx(p)['prior_page_generation'] < _ctx(p)['page_generation'],
    'generation_not_regressed': lambda p: _fx(p)['prior_page_generation'] is None or _fx(p)['prior_page_generation'] <= _ctx(p)['page_generation'],
    'representation_base_generation': lambda p: _fx(p)['base_page_generation'] == _ctx(p)['page_generation'],
    'representation_not_self_base': lambda p: _fx(p)['base_representation_id'] != _fx(p)['representation_id'],
    'coverage_bounds': lambda p: _cov(p)['frames_covered'] <= _cov(p)['frames_total'],
    'complete_frames': lambda p: not _complete(p) or _cov(p)['frames_total'] == _cov(p)['frames_covered'],
    'complete_no_omissions': lambda p: not _complete(p) or not _cov(p)['omission_codes'],
    'complete_budget': lambda p: not _complete(p) or not _cov(p)['budget_exhausted'],
    'complete_no_collisions': lambda p: not _complete(p) or not _cov(p)['synthetic_id_collisions'],
    'invalidation_matches': lambda p: _fx(p)['invalidated'] == (_cov(p)['status'] == 'stale_rejected'),
    'lease_generation_not_regressed': lambda p: _fx(p)['new_fence']['lease_generation'] >= _fx(p)['old_fence']['lease_generation'],
    'lease_epoch_not_regressed': lambda p: _fx(p)['new_fence']['lease_epoch'] >= _fx(p)['old_fence']['lease_epoch'],
    'last_sequence_not_regressed': lambda p: _fx(p)['new_fence']['last_sequence'] >= _fx(p)['old_fence']['last_sequence'],
    'new_fence_page_generation': lambda p: _fx(p)['new_fence']['page_generation'] == _ctx(p)['page_generation'],
    'old_fence_page_generation': lambda p: _fx(p)['old_fence']['page_generation'] == _ctx(p)['page_generation'],
    'renew_identity': _identity_same,
    'takeover_epoch_advances': lambda p: _fx(p)['new_fence']['lease_epoch'] > _fx(p)['old_fence']['lease_epoch'],
    'takeover_holder_changes': lambda p: _fx(p)['new_fence']['holder_id'] != _fx(p)['old_fence']['holder_id'],
    'takeover_request_identity': _identity_same,
    'workspace_revision_not_regressed': lambda p: _fx(p)['result_workspace_revision'] >= _fx(p)['expected_workspace_revision'],
    'checkpoint_ref_present': lambda p: bool(_fx(p).get('checkpoint_ref')),
    'no_action_overlap': lambda p: not (set(_fx(p)['unknown_effect_action_ids']) & set(_fx(p)['completed_action_ids'])),
    'unknown_state_no_retry': lambda p: not (_fx(p)['effect_state'] == 'effect_unknown' and _fx(p)['retry_allowed']),
    'unknown_actions_no_retry': lambda p: not (_fx(p)['unknown_effect_action_ids'] and _fx(p)['retry_allowed']),
    'no_effect_no_unknown': lambda p: not (_fx(p)['effect_state'] == 'no_effect' and _fx(p)['unknown_effect_action_ids']),
    'no_effect_no_completed': lambda p: not (_fx(p)['effect_state'] == 'no_effect' and _fx(p)['completed_action_ids']),
    'failed_no_effect_state': lambda p: _fx(p).get('terminal_state') != 'failed_no_effect' or _fx(p)['effect_state'] == 'no_effect',
    'timed_out_unknown_state': lambda p: _fx(p).get('terminal_state') != 'timed_out_effect_state_unknown' or _fx(p)['effect_state'] == 'effect_unknown',
    'terminal_no_unknown_actions': lambda p: not _other_terminal(p) or not _fx(p)['unknown_effect_action_ids'],
    'terminal_known_state': lambda p: not _other_terminal(p) or _fx(p)['effect_state'] != 'effect_unknown',
    'screenshot_artifact': lambda p: bool(_fx(p)['screenshot_artifact_ref']),
    'handoff_source_fenced': lambda p: bool(_fx(p)['source_fenced']),
    'handoff_no_unknown_effects': lambda p: not _fx(p)['unknown_effects'],
}
GS_OF = {c['id']: c['owner_rule'] for c in SPEC['predicate_catalog']}
FAMILY_PREDICATES = {f: tuple(p['id'] for p in FAM[f]['predicates']) for f in FAMILIES}
assert set(PREDICATES) == set(GS_OF), sorted(set(PREDICATES) ^ set(GS_OF))


@functools.lru_cache(maxsize=1)
def owner_gate():
    import importlib.util
    spec = importlib.util.spec_from_file_location('s4b_browser_owner_gate', ROOT / 'scripts/pm-browser-event-admission.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def owner_semantic_codes(payload):
    """The shared Browser owner validator's own semantic refusals (GSxx row names), for the agreement cross-check."""
    return sorted(owner_gate().semantic_failures(payload))


# ---- Checkpoint world: the SP-278 filtered checkpoint and its store operations ------------------------------------

@functools.lru_cache(maxsize=None)
def _mixed_log_cached(family):
    return _mixed_log(family)


def mixed_log(family):
    return copy.deepcopy(_mixed_log_cached(family))


def _mixed_log(family):
    """A complete captured prefix: unrelated records, this family in another Project, two matching originals (39 and 41)
    and a final frame of another family (42), so the cursor is not this family's. Matching entries carry real events."""
    other = other_family(family)
    log = []
    for n in range(1, 38):
        log.append({'sequence_id': n, 'event_id': 'evt_prior_%d_' % n + _hex('mixed-%d' % n)[:16],
                    'event_type': other, 'partition': partition_of(PROJECT_ID)})
    log.append({'sequence_id': 38, 'event_id': 'evt_other_project_' + _hex('op-' + family)[:16], 'event_type': family,
                'partition': partition_of('project-elsewhere')})
    for n in (39, 40, 41, 42):
        if n in (39, 41):
            label = '1' if n == 39 else '2'
            c = build_case(family, hooks={'meta': lambda m, ctx, n=n: dict(m, sequence_id=n),
                                          'source': lambda s, ctx, label=label: _relabel_source(s, label)})
            log.append({'sequence_id': n, 'event_id': c['event']['event_id'], 'event_type': family,
                        'partition': partition_of(PROJECT_ID), 'case': c})
        else:
            log.append({'sequence_id': n, 'event_id': 'evt_tail_%d_' % n + _hex('tail-%d-%s' % (n, family))[:16],
                        'event_type': other, 'partition': partition_of(PROJECT_ID)})
    return log


def _relabel_source(source, label):
    p = source['payload']
    p['owner_record_ref'] = p['owner_record_ref'][:-1] + label
    p['transition_receipt_ref'] = p['transition_receipt_ref'][:-1] + label
    return source


def sealed_receipt_for(case):
    """The independently sealed SP-1101 write receipt Storage wrote for one exact original. Reading never creates one."""
    event, custody = case['event'], case['custody_receipt']
    binding = original_binding(event)
    recipe = recipe_tuple(case['family'])
    return {
        'original_ref': original_ref_of(event),
        'binding': {f: getattr(binding, f) for f in BINDING_FIELDS},
        'recipe': {f: getattr(recipe, f) for f in RECIPE_FIELDS},
        'record_hex': storage_value_bytes(event, profile=EVENT_VALUE).hex(),
        'result_hex': storage_value_bytes(append_result(event), profile=EVENT_VALUE).hex(),
        'receipt_hex': storage_value_bytes(custody, profile=EVENT_VALUE).hex(),
    }


def checkpoint_store(family, log=None, selection_label='current'):
    log = mixed_log(family) if log is None else log
    sealed = [sealed_receipt_for(e['case']) for e in log if 'case' in e]
    return {'storage_instance_id': STORAGE_INSTANCE_ID, 'log': log, 'sealed': sealed,
            'selection': selection_for(selection_label, log[-1]['sequence_id'] if log else 0),
            'access': {PROJECT_ID: True}, 'tombstones': [], 'withdrawn': [],
            'withdrawal': {'receipt_ref': 'receipt:withdrawal-' + FAM[family]['slug'].replace('_', '-'),
                           'at': WITHDRAWN_AT}}


def fresh_value(family, store, publication_id, revision, previous, holds=(), retired=()):
    count, through, cursor = scan(family, store['log'], PROJECT_ID)
    f = FAM[family]
    return {
        'schema_id': f['checkpoint_schema_id'], 'schema_version': '1.0.0',
        'checkpoint_key': checkpoint_key(family, store['storage_instance_id'], PROJECT_ID),
        'event_type': family,
        'writer_id': f['index_writer_id'].rsplit('@', 1)[0], 'writer_version': '1.0.0',
        'consumer_id': f['consumer_id'].rsplit('@', 1)[0], 'consumer_version': '1.0.0',
        'storage_instance_id': store['storage_instance_id'], 'project_id': PROJECT_ID,
        'scope_partition': partition_of(PROJECT_ID),
        'publication_id': publication_id, 'publication_revision': revision,
        'previous_checkpoint_sha256': None if previous is None else binding_hash(previous),
        'index_read_token': durable_token(store['selection']),
        'index_through_sequence_id': through, 'matched_count': count, 'source_cursor': cursor,
        'filter_complete': True, 'state': 'current', 'withdrawn_at_utc': None, 'withdrawal_receipt_ref': None,
        'hold_refs': list(holds), 'retired_generations': copy.deepcopy(list(retired)),
    }


def advance(family, prior, store):
    """SP-25xx compare-and-swap advance: predecessor revision plus one and predecessor binding hash."""
    revision = 0 if prior is None else prior['publication_revision'] + 1
    pub = 'pub-' + FAM[family]['slug'].replace('_', '-') + '-1' if prior is None else prior['publication_id']
    holds = () if prior is None else prior['hold_refs']
    retired = () if prior is None else prior['retired_generations']
    return fresh_value(family, store, pub, revision, prior, holds, retired)


def withdraw(prior, store):
    value = copy.deepcopy(prior)
    value.update(state='withdrawn', withdrawn_at_utc=store['withdrawal']['at'],
                 withdrawal_receipt_ref=store['withdrawal']['receipt_ref'],
                 publication_revision=prior['publication_revision'] + 1,
                 previous_checkpoint_sha256=binding_hash(prior))
    return value


def rebuild(family, prior, store):
    retired = [retired_core(prior)] + copy.deepcopy(prior['retired_generations'])
    pub = 'pub-' + FAM[family]['slug'].replace('_', '-') + '-r%d' % (prior['publication_revision'] + 1)
    return fresh_value(family, store, pub, prior['publication_revision'] + 1, prior, (), retired)


def cleanup(prior, target):
    value = copy.deepcopy(prior)
    value['retired_generations'] = [r for r in prior['retired_generations'] if r['publication_id'] != target]
    value['publication_revision'] = prior['publication_revision'] + 1
    value['previous_checkpoint_sha256'] = binding_hash(prior)
    return value


# ---- Retained reads: SP-1101 sealed-receipt dispatch --------------------------------------------------------------

RESOURCE_MANIFEST_SHA256 = _structural_digest({'payloads': PAYLOADS, 'owner': OWNER, 'event_record': EVENT_RECORD_SCHEMA,
                                               'receipt': RECEIPT_SCHEMA})
RECIPE_FIELDS = ('envelope_schema_id', 'envelope_schema_version', 'payload_schema_id', 'payload_schema_version',
                 'owner_source_id', 'owner_edition', 'registry_revision', 'identity_recipe', 'producer_recipe',
                 'physical_profile', 'full_value_profile', 'local_source_profile', 'payload_profile',
                 'resource_manifest_sha256')
BINDING_FIELDS = ('storage_instance_id', 'scope_kind', 'server_id', 'project_id', 'event_type', 'event_id',
                  'idempotency_key', 'owner_operation_id', 'source_commitment')
SEALED_KEYS = ('original_ref', 'binding', 'recipe', 'record_hex', 'result_hex', 'receipt_hex')


def recipe_tuple(family):
    return RecipeTuple(
        envelope_schema_id='pm.event.v0', envelope_schema_version='2.0.0',
        payload_schema_id=FAM[family]['payload_schema_id'], payload_schema_version='1.0.0',
        owner_source_id=FAM[family]['publication_operation'], owner_edition='browser-program-prepared-v1',
        registry_revision='s4b-prepared-no-admission',
        identity_recipe='browser-string-tuple-rfc8785-sha256-v1',
        producer_recipe='cv-317-producer-semantic-v1',
        physical_profile=EVENT_VALUE,
        full_value_profile='pm.storage.original_event_value_commitment.v1',
        local_source_profile='browser-owner-transition-v1',
        payload_profile='pm.browser_event.payload.v1',
        resource_manifest_sha256=RESOURCE_MANIFEST_SHA256,
    )


def original_binding(event):
    return OriginalBinding(
        storage_instance_id=STORAGE_INSTANCE_ID, scope_kind='project', server_id=SERVER_ID,
        project_id=event['project_id'], event_type=event['event_type'], event_id=event['event_id'],
        idempotency_key=event['idempotency_key'], owner_operation_id=event['payload']['transition_receipt_ref'],
        source_commitment=full_value_commitment(event),
    )


def append_result(event):
    return {'schema_id': 'pm.storage_value.browser_append_result.v1', 'schema_version': '1.0.0',
            'event_id': event['event_id'], 'sequence_id': event['sequence_id'], 'status': 'appended'}


def original_ref_of(event):
    return 'original:' + str(event.get('event_id') if type(event) is dict else None)


def _custody_from_sealed(sealed):
    """Build the authenticated original from one sealed store row; a malformed row refuses sealed_receipt_malformed,
    including the shared constructors' own refusals (scripts/pm_event_numbers.py RecipeTuple/OriginalBinding)."""
    if (type(sealed) is not dict or set(sealed) != set(SEALED_KEYS) or type(sealed['binding']) is not dict
            or set(sealed['binding']) != set(BINDING_FIELDS) or type(sealed['recipe']) is not dict
            or set(sealed['recipe']) != set(RECIPE_FIELDS)
            or any(type(sealed[k]) is not str or len(sealed[k]) % 2 or sealed[k].strip('0123456789abcdef')
                   for k in ('record_hex', 'result_hex', 'receipt_hex'))):
        raise Refusal('sealed_receipt_malformed')
    try:
        binding, recipe = OriginalBinding(**sealed['binding']), RecipeTuple(**sealed['recipe'])
    except Refusal:
        raise Refusal('sealed_receipt_malformed') from None
    return OriginalCustody(binding=binding, recipe=recipe, record_bytes=bytes.fromhex(sealed['record_hex']),
                           result_bytes=bytes.fromhex(sealed['result_hex']),
                           receipt_bytes=bytes.fromhex(sealed['receipt_hex']))


class SealedReceiptOwner:
    """Resolves the sealed receipt for one exact original_ref from Storage's sealed store. It reads the store, never a
    caller-supplied custody object, and never writes it."""

    def __init__(self, store):
        self._store = store

    def authenticated_original(self, original_ref):
        matches = [r for r in self._store if type(r) is dict and r.get('original_ref') == original_ref]
        if not matches:
            raise Refusal('original_receipt_missing')
        if len(matches) > 1:
            raise Refusal('original_receipt_ambiguous')
        return _custody_from_sealed(matches[0])


class AccessLoggingOwner(SealedReceiptOwner):
    """A faulty owner composition (negative only): it writes an access receipt into the sealed store while resolving.
    The store-snapshot row refuses it; no fixture field reports it."""

    def authenticated_original(self, original_ref):
        original = super().authenticated_original(original_ref)
        logged = copy.deepcopy(self._store[0])
        logged['original_ref'] = 'access-log:' + original_ref
        self._store.append(logged)
        return original


OWNERS = {'sealed_store': SealedReceiptOwner, 'access_logging': AccessLoggingOwner}


def frozen_components(custody):
    """The frozen browser@1 verifier's checks over the sealed original, each its own (presented, expected) pair or
    shared-helper result. A component is computed only when the components it depends on hold, so one defect yields
    one failing component. Only the sealed bytes and recipe are read: no live owner state, no current writer gate."""
    out = {}
    try:
        record = decode_storage_value(custody.record_bytes, profile=EVENT_VALUE)
        receipt = decode_storage_value(custody.receipt_bytes, profile=EVENT_VALUE)
        result = decode_storage_value(custody.result_bytes, profile=EVENT_VALUE)
        decodes = type(record) is dict and type(receipt) is dict and type(result) is dict
    except Refusal:
        decodes = False
    out['decodes'] = decodes
    if not decodes:
        return out
    out['envelope_schema'] = schema_errors(EVENT_RECORD_ID, '', record)
    if out['envelope_schema']:
        return out
    family = record['event_type']
    out['family'] = family in FAMILIES
    out['recipe_family'] = (custody.recipe.payload_schema_id, record['payload_schema_id'])
    out['observed_utc_z'] = reason_of(date_time, record['observed_at_utc'], profile=STORAGE_UTC_Z)
    out['persisted_utc_z'] = reason_of(date_time, record['persisted_at_utc'], profile=STORAGE_UTC_Z)
    commitment = _or(lambda: full_value_commitment(record), None)
    out['source_commitment'] = (custody.binding.source_commitment, commitment)
    out['result_event_id'] = (result.get('event_id'), record['event_id'])
    out['receipt_schema'] = schema_errors(RECEIPT_ID, '/$defs/custody_v2', receipt)
    if not out['receipt_schema']:
        out['receipt_full_value'] = (receipt['original_event_value_commitment']['sha256'], commitment)
        out['receipt_event_id'] = (receipt['event_id'], record['event_id'])
    if out['family']:
        out['payload_schema_id'] = (record['payload_schema_id'], FAM[family]['payload_schema_id'])
        out['payload_schema'] = (schema_errors(PAYLOADS_ID, '/$defs/' + FAM[family]['payload_def'], record['payload'])
                                 if type(record['payload']) is dict else ['payload:type'])
        if not out['payload_schema']:
            event_id, key = identity(family, record['payload'])
            out['identity'] = (record['event_id'], event_id)
            out['key'] = (record['idempotency_key'], key)
            if not out['receipt_schema']:
                semantic = _or(lambda: digest_of(record), 'unqualified')
                out['receipt_semantic'] = (receipt['producer_semantic_digest'], semantic)
    return out


def component_holds(name, value):
    if name in ('decodes', 'family'):
        return value is True
    if name in ('envelope_schema', 'payload_schema', 'receipt_schema'):
        return value == []
    if name in ('observed_utc_z', 'persisted_utc_z'):
        return value is None
    return type(value[0]) is type(value[1]) and value[0] == value[1]


def _frozen_verify(custody):
    """browser@1 frozen verifier: exactly the conjunction of the frozen rows."""
    return all(component_holds(name, value) for name, value in frozen_components(custody).items())


def _current_gated_verify(custody):
    """A faulty frozen verifier (negative only): it runs the current writer gate on the retained original."""
    record = decode_storage_value(custody.record_bytes, profile=EVENT_VALUE)
    current_append_policy(record['replay_policy'])
    return _frozen_verify(custody)


FROZEN_MAPS = {
    'installed': {recipe_tuple(f): FrozenRecipe(verify_original=_frozen_verify) for f in FAMILIES},
    'current_gated': {recipe_tuple(f): FrozenRecipe(verify_original=_current_gated_verify) for f in FAMILIES},
}


class _RecordingOwner:
    """Records the original the dispatcher received from the owner, so the frozen rows read exactly it."""

    def __init__(self, inner):
        self.inner, self.seen = inner, None

    def authenticated_original(self, original_ref):
        original = self.inner.authenticated_original(original_ref)
        self.seen = original
        return original


REQUEST_STRINGS = ('event_type', 'event_id', 'idempotency_key', 'project_id')


def retained_request(event):
    """The expected binding of the original the read asks for, or None when the request cannot name one original; the
    shared dispatcher refuses None as original_query itself."""
    if (type(event) is not dict or any(type(event.get(k)) is not str for k in REQUEST_STRINGS)
            or type(event.get('payload')) is not dict
            or type(event['payload'].get('transition_receipt_ref')) is not str):
        return None
    try:
        return original_binding(event)
    except (Refusal, KeyError, TypeError):
        return None


def resolve_retained(world):
    """One SP-1101 resolution through the shared RetainedDispatcher, instrumented: the sealed store is snapshotted
    before and after, and every call of the shared current writer gate during the read is counted."""
    store = world['sealed_store']
    before = _structural_digest(store)
    owner = _RecordingOwner(OWNERS[world['owner_impl']](store))
    recipes = FROZEN_MAPS[world['frozen_map']]
    calls = []
    real = pm_event_numbers.current_append_policy
    module = sys.modules[__name__]

    def counting(value):
        calls.append(value)
        return real(value)
    pm_event_numbers.current_append_policy = counting
    module.current_append_policy = counting
    try:
        RetainedDispatcher(owner, recipes).resolve(
            world['original_ref'], retained_request(world['request_event']),
            disclose=lambda binding: world['disclosure_allowed'] is True,
            recipe_override=world['recipe_override'])
        reason = None
    except Refusal as refusal:
        reason = refusal.reason
    finally:
        pm_event_numbers.current_append_policy = real
        module.current_append_policy = real
    after = _structural_digest(store)
    return {'reason': reason, 'store_before': before, 'store_after': after, 'gate_calls': len(calls),
            'seen': owner.seen}


# ---- Boundary worlds other than append -----------------------------------------------------------------------------

def dedupe_key(partition, family, key):
    return json.dumps([partition, family, key])


def retry_op(store, candidate, family):
    """Storage's lost-ack retry: a dedupe hit with the same producer-semantic digest returns the original first
    receipt and result and appends nothing; a different digest conflicts. Computed, never asserted."""
    project = candidate.get('project_id') if type(candidate) is dict else None
    hit = store['dedupe'].get(dedupe_key(partition_of(project) if type(project) is str else '', family,
                                         candidate.get('idempotency_key') if type(candidate) is dict else None))
    if hit is None:
        return {'status': 'miss', 'event_id': None, 'sequence_id': None, 'receipt_hex': None}
    if _or(lambda: digest_of(candidate), None) != hit['digest']:
        return {'status': 'conflict', 'event_id': None, 'sequence_id': None, 'receipt_hex': None}
    sealed = [r for r in store['sealed'] if r.get('original_ref') == 'original:' + hit['event_id']]
    return {'status': 'original', 'event_id': hit['event_id'], 'sequence_id': hit['sequence_id'],
            'receipt_hex': sealed[0]['receipt_hex'] if len(sealed) == 1 else None}


def build_retry(family, variant='base', hooks=None):
    hooks = hooks or {}
    ctx = {'family': family, 'variant': variant}
    original = build_case(family, 'linked' if variant == 'linked' else 'base')
    e = original['event']
    store = copy.deepcopy(original['store'])
    store['log'].append({'sequence_id': e['sequence_id'], 'event_id': e['event_id'], 'event_type': family,
                         'partition': original['scope_partition']})
    store['dedupe_through'] = e['sequence_id']
    store['dedupe'][dedupe_key(original['scope_partition'], family, e['idempotency_key'])] = {
        'event_id': e['event_id'], 'sequence_id': e['sequence_id'], 'digest': digest_of(e)}
    store['sealed'] = [sealed_receipt_for(original)]
    store = _apply(hooks, 'store', store, ctx)
    candidate = copy.deepcopy(e)
    candidate.update(sequence_id=e['sequence_id'] + 5, observed_at_utc='2026-11-14T10:05:00Z',
                     persisted_at_utc='2026-11-14T10:05:01Z')   # a retry carries different Storage metadata
    candidate = _apply(hooks, 'candidate', candidate, ctx)
    log_before = len(store['log'])
    result = _apply(hooks, 'result', retry_op(store, candidate, family), ctx)
    world = {'family': family, 'variant': variant, 'store': store, 'candidate': candidate, 'result': result,
             'log_before': log_before, 'log_after': len(store['log'])}
    return _apply(hooks, 'world', world, ctx)


def _cw_stores(family, variant):
    full = checkpoint_store(family) if variant != 'empty' else checkpoint_store(family, log=[])
    prefix = dict(full, log=full['log'][:40], selection=selection_for('prior', 40)) if variant != 'empty' else None
    return full, prefix


def older_retired(family):
    """An older withdrawn generation of the same key (its own token, cursor and first withdrawal time)."""
    store = dict(checkpoint_store(family, log=mixed_log(family)[:30]), selection=selection_for('older', 30))
    old = withdraw(advance(family, None, store), dict(store, withdrawal={'receipt_ref': 'receipt:withdrawal-older',
                                                                        'at': '2026-11-13T08:00:00Z'}))
    core = retired_core(old)
    core['publication_id'] = 'pub-' + FAM[family]['slug'].replace('_', '-') + '-older'
    return core


def build_derived(family, variant='base', hooks=None):
    hooks = hooks or {}
    ctx = {'family': family, 'variant': variant}
    full, prefix = _cw_stores(family, variant)
    store = _apply(hooks, 'store', full, ctx)
    prior = None if prefix is None else advance(family, None, prefix)
    if variant == 'held':
        prior['hold_refs'] = ['hold:legal-' + FAM[family]['slug'].replace('_', '-')]
    if variant == 'retired':
        prior['retired_generations'] = [older_retired(family)]
    prior = _apply(hooks, 'prior', prior, ctx)
    proposed = _apply(hooks, 'proposed', advance(family, prior, store), ctx)
    world = {'family': family, 'variant': variant, 'store': store, 'prior': prior, 'proposed': proposed,
             'project_id': PROJECT_ID}
    return _apply(hooks, 'world', world, ctx)


def build_read(family, variant='base', hooks=None):
    hooks = hooks or {}
    ctx = {'family': family, 'variant': variant}
    full, prefix = _cw_stores(family, 'base')
    stored = advance(family, advance(family, None, prefix), copy.deepcopy(full))
    store = _apply(hooks, 'store', full, ctx)
    checkpoint = _apply(hooks, 'checkpoint', stored, ctx)
    target = [e for e in full['log'] if 'case' in e][-1]
    request = _apply(hooks, 'request', {'sequence_id': target['sequence_id'], 'event_id': target['event_id'],
                                        'project_id': PROJECT_ID}, ctx)
    world = {'family': family, 'variant': variant, 'store': store, 'checkpoint': checkpoint, 'request': request}
    return _apply(hooks, 'world', world, ctx)


def build_withdrawal(family, variant='base', hooks=None):
    hooks = hooks or {}
    ctx = {'family': family, 'variant': variant}
    full, prefix = _cw_stores(family, 'base')
    store = copy.deepcopy(full)
    store['withdrawn'] = [family]                     # writers are cut off first
    store = _apply(hooks, 'store', store, ctx)
    prior = _apply(hooks, 'prior', advance(family, advance(family, None, prefix), full), ctx)
    log_before = len(store['log'])
    proposed = _apply(hooks, 'proposed', withdraw(prior, store), ctx)
    world = {'family': family, 'variant': variant, 'store': store, 'prior': prior, 'proposed': proposed,
             'log_before': log_before, 'log_after': len(store['log'])}
    return _apply(hooks, 'world', world, ctx)


def build_rebuild(family, variant='base', hooks=None):
    hooks = hooks or {}
    ctx = {'family': family, 'variant': variant}
    full, prefix = _cw_stores(family, 'base')
    store = _apply(hooks, 'store', full, ctx)
    current = advance(family, advance(family, None, prefix), full)
    if variant == 'retired':
        current['retired_generations'] = [older_retired(family)]
    prior = withdraw(current, dict(full, withdrawn=[family]))
    prior = _apply(hooks, 'prior', prior, ctx)
    ctx['prior_pub'] = prior['publication_id'] if type(prior) is dict else None
    proposed = _apply(hooks, 'proposed', rebuild(family, prior, store), ctx)
    world = {'family': family, 'variant': variant, 'store': store, 'prior': prior, 'proposed': proposed}
    return _apply(hooks, 'world', world, ctx)


def build_cleanup(family, variant='base', hooks=None):
    hooks = hooks or {}
    ctx = {'family': family, 'variant': variant}
    full, prefix = _cw_stores(family, 'base')
    withdrawn = withdraw(advance(family, advance(family, None, prefix), full), dict(full, withdrawn=[family]))
    prior = _apply(hooks, 'prior', rebuild(family, withdrawn, full), ctx)
    ctx['prior_value'] = copy.deepcopy(prior)
    target = _apply(hooks, 'target', withdrawn['publication_id'], ctx)
    now = _apply(hooks, 'now', CLEANUP_NOW, ctx)
    proposed = _apply(hooks, 'proposed', cleanup(prior, target), ctx)
    world = {'family': family, 'variant': variant, 'prior': prior, 'target': target, 'now': now, 'proposed': proposed}
    return _apply(hooks, 'world', world, ctx)


def build_retained(family, variant='base', hooks=None):
    """A retained read of one sealed original. 'live' changes the live owner state after the write (the family is
    withdrawn and no longer admitted, the owner transition is gone); 'replay_only' is an original written with
    projector_replay_only, which the current writer refuses; 'linked' carries distinct non-null lineage."""
    hooks = hooks or {}
    ctx = {'family': family, 'variant': variant}
    ehooks = {}
    if variant == 'replay_only':
        ehooks['event'] = lambda e, c: dict(e, replay_policy='projector_replay_only')
    original = build_case(family, 'linked' if variant == 'linked' else 'base', hooks.get('original_hooks') or ehooks)
    original = _apply(hooks, 'original', original, ctx)
    sealed = _apply(hooks, 'sealed', [sealed_receipt_for(original)], ctx)
    live = {'registry': [] if variant == 'live' else [family], 'withdrawn': [family] if variant == 'live' else [],
            'source_present': variant != 'live'}
    world = {'family': family, 'variant': variant, 'sealed_store': sealed, 'owner_impl': 'sealed_store',
             'frozen_map': 'installed', 'original_ref': original_ref_of(original['event']),
             'request_event': copy.deepcopy(original['event']), 'disclosure_allowed': True, 'recipe_override': None,
             'live': live}
    return _apply(hooks, 'world', world, ctx)


BUILD = {'append': build_case, 'retry': build_retry, 'derived': build_derived, 'read': build_read,
         'withdrawal': build_withdrawal, 'rebuild': build_rebuild, 'cleanup': build_cleanup,
         'retained': build_retained}
BOUNDARIES = tuple(BUILD)


# ---- Row engine ----------------------------------------------------------------------------------------------------

TEMPLATES = {
    # template: (input keys, refusal condition over `record`)
    'eq': (('presented', 'expected'),
           "type(record['presented']) is not type(record['expected']) or record['presented'] != record['expected']"),
    'ne': (('presented', 'forbidden'),
           "type(record['presented']) is type(record['forbidden']) and record['presented'] == record['forbidden']"),
    'true': (('presented',), "record['presented'] is not True"),
    'none': (('presented',), "record['presented'] is not None"),
    'empty': (('presented',), "type(record['presented']) is not list or len(record['presented']) != 0"),
    'member': (('presented', 'collection'),
               "type(record['collection']) is not list or record['presented'] not in record['collection']"),
    'not_member': (('presented', 'collection'),
                   "type(record['collection']) is not list or record['presented'] in record['collection']"),
    'at_most': (('presented', 'limit'),
                "type(record['presented']) is not int or type(record['limit']) is not int "
                "or record['presented'] > record['limit']"),
    'handled': (('presented', 'handled'),
                "record['presented'] is not None and record['presented'] not in record['handled']"),
}

ROWS = []
ROW_BY_ID = {}
ENTAILED = {}   # row id -> (rows that always refuse first, written proof)
MAX_ROWS_PER_TABLE = 8


class Memo:
    def __init__(self, world, boundary):
        self.world, self.boundary, self.values = world, boundary, {}

    def get(self, name):
        if name not in self.values:
            self.values[name] = DERIVED[name](self.world, self)
        return self.values[name]


DERIVED = {}


def derived(fn):
    DERIVED[fn.__name__] = fn
    return fn


def row(boundary, table, rid, code, field, words, kind, inputs, gates=(), families=None, when=None, witnesses=()):
    assert rid not in ROW_BY_ID, rid
    assert kind in TEMPLATES, kind
    assert boundary in BOUNDARIES, boundary
    entry = {'boundary': boundary, 'table': table, 'id': rid, 'code': code, 'field': field, 'words': words,
             'kind': kind, 'inputs': inputs, 'gates': tuple(gates),
             'families': None if families is None else tuple(families), 'when': when,
             'witnesses': tuple(witnesses), 'line': sys._getframe(1).f_lineno}
    ROWS.append(entry)
    ROW_BY_ID[rid] = entry
    return entry


def entailed(rid, first, proof):
    ENTAILED[rid] = (tuple(first), proof)


def record_for(r, w, m):
    applies = (r['families'] is None or w['family'] in r['families']) and all(m.get(g) for g in r['gates'])
    if applies and r['when'] is not None:
        applies = r['when'](w, m) is True
    record = {'applies': applies is True}
    if record['applies']:
        values = r['inputs'](w, m)
        assert set(values) == set(TEMPLATES[r['kind']][0]), (r['id'], sorted(values))
        record.update(values)
    return record


def EQ(presented, expected):
    return {'presented': presented, 'expected': expected}


def NE(presented, forbidden):
    return {'presented': presented, 'forbidden': forbidden}


def V(presented):
    return {'presented': presented}


def W(label, **hooks):
    """One witness: a label and the build hooks of its single defect."""
    return (label, hooks)


def per_family(fn):
    """A witness generator: fn(family) -> list of (label, hooks) or []."""
    return ('per_family', fn)


# ---- Append: derived values ------------------------------------------------------------------------------------------

def E(w):
    return w['event']


def P(w):
    return w['event']['payload']


def S(w):
    return w['source']


def SP_(w):
    return w['source']['payload']


@derived
def fam(w, m):
    return w['family'] in FAMILIES and type(w.get('event')) is dict


@derived
def seq_ok(w, m):
    return m.get('fam') and ('sequence_id' not in E(w) or reason_of(storage_uint64, E(w)['sequence_id']) is None)


@derived
def pseq_ok(w, m):
    return m.get('fam') and ('producer_sequence_id' not in E(w) or
                             reason_of(current_integer, E(w)['producer_sequence_id'], minimum=0) is None)


@derived
def phys_ok(w, m):
    return m.get('seq_ok') and m.get('pseq_ok') and physical_reason(E(w)) is None


@derived
def pay_dict(w, m):
    return m.get('phys_ok') and type(E(w).get('payload')) is dict


@derived
def ints_ok(w, m):
    return m.get('pay_dict') and _or(lambda: payload_integer_reason(w['family'], P(w)), 'walk') is None


@derived
def env_errors(w, m):
    return schema_errors(EVENT_RECORD_ID, '', E(w))


@derived
def env_ok(w, m):
    return m.get('phys_ok') and m.get('env_errors') == []


@derived
def pay_errors(w, m):
    return schema_errors(PAYLOADS_ID, '/$defs/' + FAM[w['family']]['payload_def'], P(w))


@derived
def pay_ok(w, m):
    return m.get('env_ok') and m.get('ints_ok') and m.get('pay_errors') == []


@derived
def project_scope(w, m):
    return m.get('env_ok') and E(w)['scope_kind'] == 'project'


@derived
def policy_reason(w, m):
    return reason_of(current_append_policy, E(w)['replay_policy'])


@derived
def recomputed(w, m):
    return identity(w['family'], P(w))


@derived
def digest_reason(w, m):
    return reason_of(digest_of, E(w))


@derived
def route_ok(w, m):
    return m.get('pay_ok') and m.get('digest_reason') is None


def _receipt(w):
    c = w.get('custody_receipt')
    r = c.get('first_append_receipt') if type(c) is dict else None
    return r if type(r) is dict else {}


@derived
def custody_slots_ok(w, m):
    r = _receipt(w)
    return all(reason_of(storage_uint64, r.get(k)) is None for k in RECEIPT_SLOTS)


@derived
def custody_ok(w, m):
    return (m.get('env_ok') and m.get('custody_slots_ok') and physical_reason(w['custody_receipt']) is None
            and schema_errors(RECEIPT_ID, '/$defs/custody_v2', w['custody_receipt']) == [])


# ---- Append rows ---------------------------------------------------------------------------------------------------

A = 'append'
ALL = FAMILIES


def _src(fn):
    """A 'case' hook changing only the committed owner transition (the authority), after every presented value was
    derived from the unchanged one."""
    def hook(case, ctx):
        fn(case['source'])
        return case
    return hook


def _ev(fn):
    def hook(event, ctx):
        fn(event)
        return event
    return hook


def _alt(value, salt='alt'):
    """A different value of the same JSON type that every owner grammar used here still accepts."""
    if value is None:
        return salt + '-value'
    if type(value) is bool:
        return not value
    if type(value) is int:
        return value + 1
    if type(value) is str:
        return value + '-' + salt if not value.endswith('Z') else value[:-1].rsplit(':', 1)[0] + ':59Z'
    if type(value) is list:
        return value + ['artifact:' + salt] if not value or type(value[0]) is str else value[:-1]
    if type(value) is dict:
        return None
    raise TypeError(value)


row(A, 'append_admission', 'append_event_object', 'event_schema', '/event',
    'the presented EventRecord is a JSON object', 'true', lambda w, m: V(type(w.get('event')) is dict),
    witnesses=[W('event is a list', event=lambda e, c: []), W('event is a string', event=lambda e, c: 'event')])
row(A, 'append_admission', 'append_family_known', 'unknown_family', '/family',
    'the family is one of the 51 prepared Browser Program families', 'member',
    lambda w, m: {'presented': w['family'], 'collection': list(FAMILIES)},
    witnesses=[W('unprepared Browser name', case=lambda c, x: dict(c, family='browser.session.navigated')),
               W('admitted sibling name', case=lambda c, x: dict(c, family='browser.workspace.created'))])
row(A, 'append_admission', 'append_admitted', 'missing_event_registration', '/store/registry',
    'the registry admits this exact family before any effect (prepared rows return missing_event_registration)',
    'member', lambda w, m: {'presented': w['family'], 'collection': w['store']['registry']}, gates=('fam',),
    witnesses=[W('prepared, not admitted', store=lambda s, c: dict(s, registry=[])),
               W('only a sibling admitted', store=lambda s, c: dict(s, registry=[other_family(c['family'])]))])
row(A, 'append_admission', 'append_writer_cutoff', 'family_withdrawn', '/store/withdrawn',
    'the family is not withdrawn; the writer cutoff runs before dedupe', 'not_member',
    lambda w, m: {'presented': w['family'], 'collection': w['store']['withdrawn']}, gates=('fam',),
    witnesses=[W('family withdrawn', store=lambda s, c: dict(s, withdrawn=[c['family']]))])
row(A, 'append_admission', 'append_dedupe_caught_up', 'dedupe_unavailable', '/store/dedupe_through',
    'authoritative lifetime dedupe has caught up to the log tail', 'eq',
    lambda w, m: EQ(w['store']['dedupe_through'], w['store']['log'][-1]['sequence_id'] if w['store']['log'] else 0),
    gates=('fam',),
    witnesses=[W('dedupe one behind', store=lambda s, c: dict(s, dedupe_through=s['dedupe_through'] - 1)),
               W('dedupe string through', store=lambda s, c: dict(s, dedupe_through=str(s['dedupe_through'])))])
row(A, 'append_admission', 'append_source_resolved', 'source_unavailable', '/source/resolved',
    'the producer resolved the committed owner transition independently', 'true', lambda w, m: V(S(w)['resolved']),
    gates=('fam',),
    witnesses=[W('unresolved', case=_src(lambda s: s.update(resolved=False))),
               W('string true', case=_src(lambda s: s.update(resolved='true')))])
row(A, 'append_admission', 'append_source_committed', 'transition_not_committed', '/source/outcome',
    'only a committed owner transition emits; pending, rejected, unavailable, acceptance-only and no-change append '
    'nothing', 'eq', lambda w, m: EQ(S(w)['outcome'], 'committed'), gates=('fam',),
    witnesses=[W('acceptance only', case=_src(lambda s: s.update(outcome='acceptance_only'))),
               W('no change', case=_src(lambda s: s.update(outcome='no_change'))),
               W('rejected', case=_src(lambda s: s.update(outcome='pre_dispatch_rejection'))),
               W('pending', case=_src(lambda s: s.update(outcome='pending')))])
row(A, 'append_admission', 'append_source_family', 'transition_family', '/source/event_type',
    'the committed owner transition entitles exactly this family', 'eq', lambda w, m: EQ(S(w)['event_type'], w['family']),
    gates=('fam',),
    witnesses=[W('sibling transition', case=lambda c, x: (c['source'].update(event_type=other_family(c['family'])), c)[1])])
row(A, 'append_producer', 'append_producer_component', 'producer_unauthorized', '/producer',
    'the publishing component is the family\'s sole producer', 'eq',
    lambda w, m: EQ(w['producer'], FAM[w['family']]['producer_component']), gates=('fam',),
    witnesses=[W('client click', case=lambda c, x: dict(c, producer='BrowserClient.click')),
               W('external adapter', case=lambda c, x: dict(c, producer='ExternalAdapter.ego'))])
row(A, 'append_producer', 'append_source_producer', 'producer_unauthorized', '/source/producer_component',
    'the owner transition was committed by the family\'s sole producer component', 'eq',
    lambda w, m: EQ(S(w)['producer_component'], FAM[w['family']]['producer_component']), gates=('fam',),
    witnesses=[W('cached projection', case=_src(lambda s: s.update(producer_component='BrowserProjection.cache'))),
               W('protected auth owner', case=_src(lambda s: s.update(producer_component='ProtectedAuthBrowserOwner')))])

# numbers (SP-1100 / CV-1100) before any shape or packing
LONG_INT = 10 ** 4399


def _meta_seq(v):
    return lambda m, c: dict(m, sequence_id=v)


row(A, 'append_numbers', 'append_sequence_uint64', 'number_domain', '/event/sequence_id',
    'sequence_id is Storage\'s exact uint64 (shared storage_uint64)', 'none',
    lambda w, m: V(reason_of(storage_uint64, E(w)['sequence_id'])), gates=('fam',),
    when=lambda w, m: 'sequence_id' in E(w),
    witnesses=[W('2**64', meta=_meta_seq(1 << 64)), W('-1', meta=_meta_seq(-1)), W('float 41.0', meta=_meta_seq(41.0)),
               W('string', meta=_meta_seq('41')), W('boolean', meta=_meta_seq(True)), W('null', meta=_meta_seq(None)),
               W('4400-digit', meta=_meta_seq(LONG_INT))])
row(A, 'append_numbers', 'append_producer_sequence', 'number_domain', '/event/producer_sequence_id',
    'producer_sequence_id is the transition\'s exact non-negative integer (shared current_integer)', 'none',
    lambda w, m: V(reason_of(current_integer, E(w)['producer_sequence_id'], minimum=0)), gates=('fam',),
    when=lambda w, m: 'producer_sequence_id' in E(w),
    witnesses=[W('-1', source=lambda s, c: dict(s, transition_sequence=-1)),
               W('float', source=lambda s, c: dict(s, transition_sequence=7.0)),
               W('string', source=lambda s, c: dict(s, transition_sequence='7')),
               W('boolean', source=lambda s, c: dict(s, transition_sequence=True)),
               W('null', source=lambda s, c: dict(s, transition_sequence=None)),
               W('-4400-digit', source=lambda s, c: dict(s, transition_sequence=-LONG_INT))])
row(A, 'append_numbers', 'append_event_physical', 'number_domain', '/event',
    'the whole event value encodes under SP-1100 EVENT_VALUE (every integer in the physical range)', 'none',
    lambda w, m: V(physical_reason(E(w))), gates=('seq_ok', 'pseq_ok'),
    witnesses=[W('producer sequence 2**64', source=lambda s, c: dict(s, transition_sequence=1 << 64)),
               W('producer sequence 4400 digits', source=lambda s, c: dict(s, transition_sequence=LONG_INT)),
               W('payload extra 2**64', payload=lambda p, c: dict(p, extra_integer=1 << 64)),
               W('payload extra -2**63-1', payload=lambda p, c: dict(p, extra_integer=-(1 << 63) - 1))])


def _int_slot_witness(family):
    paths = payload_integer_paths(PAYLOADS['$defs'][FAM[family]['payload_def']], base_payload(family))
    if not paths:
        # The only integer slot is the nullable context page_generation: the owner transition itself names a page of
        # an ordinary workspace with a non-integer generation (every pairing predicate holds once it is an integer).
        def page(v):
            def hook(s, c):
                s['payload']['context'].update(browser_session_id=s['payload']['context']['browser_session_id'] or 'session-x',
                                               browser_workspace_id=s['payload']['context']['browser_workspace_id'] or 'workspace-x',
                                               browser_page_id='page-x', page_generation=v)
                return s
            return hook
        return [W('float page_generation', source=page(8.0)), W('boolean page_generation', source=page(True)),
                W('string page_generation', source=page('8'))]
    path = paths[0]

    def setter(v):
        def hook(p, c):
            node = p
            for part in path[:-1]:
                node = node[part]
            node[path[-1]] = v
            return p
        return hook
    return [W('float at ' + '/'.join(map(str, path)), payload=setter(8.0)),
            W('boolean at ' + '/'.join(map(str, path)), payload=setter(True)),
            W('string at ' + '/'.join(map(str, path)), payload=setter('8'))]


row(A, 'append_numbers', 'append_payload_integers', 'number_domain', '/event/payload',
    'every integer slot the closed payload declares holds an exact JSON integer (shared current_integer)', 'none',
    lambda w, m: V(payload_integer_reason(w['family'], P(w))), gates=('pay_dict',),
    witnesses=[per_family(_int_slot_witness)])

# envelope
OTHER_TIMES_BAD = (('missing zone', '2026-11-14T10:00:00'), ('hour 24', '2026-11-14T24:00:00Z'),
                   ('trailing LF', '2026-11-14T10:00:00Z\n'), ('February 30', '2026-02-30T10:00:00Z'),
                   ('space separator', '2026-11-14 10:00:00Z'), ('non-leap 60th second', '2026-11-14T10:00:60Z'))
row(A, 'append_envelope', 'append_envelope_schema', 'event_schema', '/event',
    'the full EventRecord 2.0.0 owner schema accepts the event (shared CV-1101 date-time checker)', 'empty',
    lambda w, m: V(m.get('env_errors')), gates=('phys_ok',),
    witnesses=[W('unknown envelope member', event=lambda e, c: dict(e, extra_member='x')),
               W('missing actor_ref', event=lambda e, c: {k: v for k, v in e.items() if k != 'actor_ref'}),
               W('schema_version 3.0.0', event=lambda e, c: dict(e, schema_version='3.0.0'))] +
              [W('occurred ' + n, source=(lambda v: lambda s, c: dict(s, occurred_at_utc=v))(v)) for n, v in OTHER_TIMES_BAD] +
              [W('observed ' + n, meta=(lambda v: lambda mm, c: dict(mm, observed_at_utc=v))(v)) for n, v in OTHER_TIMES_BAD[:3]])
row(A, 'append_envelope', 'append_event_type', 'event_type_join', '/event/event_type',
    'event_type is exactly this family', 'eq', lambda w, m: EQ(E(w)['event_type'], w['family']), gates=('env_ok',),
    witnesses=[W('sibling event_type', event=lambda e, c: dict(e, event_type=other_family(c['family']))),
               W('trailing LF event_type', event=lambda e, c: dict(e, event_type=c['family'] + '\n'))])
row(A, 'append_envelope', 'append_payload_schema_id', 'payload_schema_id', '/event/payload_schema_id',
    'payload_schema_id is exactly this family\'s closed payload schema', 'eq',
    lambda w, m: EQ(E(w)['payload_schema_id'], FAM[w['family']]['payload_schema_id']), gates=('env_ok',),
    witnesses=[W('sibling payload schema', event=lambda e, c: dict(e, payload_schema_id=FAM[other_family(c['family'])]['payload_schema_id'])),
               W('candidate schema id', event=lambda e, c: dict(e, payload_schema_id=e['payload_schema_id'].replace('browser_event', 'browser_event_candidate')))])
row(A, 'append_envelope', 'append_scope_kind', 'scope_join', '/event/scope_kind',
    'scope_kind is project (CV-332: Browser families are Project-only)', 'eq',
    lambda w, m: EQ(E(w)['scope_kind'], 'project'), gates=('env_ok',),
    witnesses=[W('application scope', event=lambda e, c: dict(e, scope_kind='application', project_id=None))])
row(A, 'append_envelope', 'append_observed_utc_z', 'timestamp_invalid', '/event/observed_at_utc',
    'Storage\'s observed_at_utc passes shared date_time with the CV-253 storage_utc_z profile', 'none',
    lambda w, m: V(reason_of(date_time, E(w)['observed_at_utc'], profile=STORAGE_UTC_Z)), gates=('env_ok',),
    witnesses=[W('+00:00', meta=lambda mm, c: dict(mm, observed_at_utc='2026-11-14T10:00:01+00:00')),
               W('lowercase z', meta=lambda mm, c: dict(mm, observed_at_utc='2026-11-14T10:00:01z')),
               W('-00:00', meta=lambda mm, c: dict(mm, observed_at_utc='2026-11-14T10:00:01-00:00'))])
row(A, 'append_envelope', 'append_persisted_utc_z', 'timestamp_invalid', '/event/persisted_at_utc',
    'Storage\'s persisted_at_utc passes shared date_time with the CV-253 storage_utc_z profile', 'none',
    lambda w, m: V(reason_of(date_time, E(w)['persisted_at_utc'], profile=STORAGE_UTC_Z)), gates=('env_ok',),
    witnesses=[W('+02:00', meta=lambda mm, c: dict(mm, persisted_at_utc='2026-11-14T12:00:02+02:00')),
               W('-00:00', meta=lambda mm, c: dict(mm, persisted_at_utc='2026-11-14T10:00:02-00:00'))])
row(A, 'append_envelope', 'append_redaction_profile', 'envelope_join', '/event/redaction_profile',
    'redaction_profile is no_secrets', 'eq', lambda w, m: EQ(E(w)['redaction_profile'], 'no_secrets'),
    gates=('env_ok',), witnesses=[W('other profile', event=lambda e, c: dict(e, redaction_profile='redacted'))])
row(A, 'append_envelope', 'append_migration_null', 'envelope_join', '/event/migration',
    'every migration member is null (no alias, legacy extension or transform is admitted)', 'eq',
    lambda w, m: EQ(E(w)['migration'], dict(NULL_MIGRATION)), gates=('env_ok',),
    witnesses=[W('migration id', event=lambda e, c: dict(e, migration=dict(NULL_MIGRATION, migration_id='mig-legacy'))),
               W('compatibility type', event=lambda e, c: dict(e, migration=dict(NULL_MIGRATION, compatibility_event_type='browser_run_code')))])

# policy and body route
row(A, 'append_policy', 'append_replay_only', 'replay_only_not_appendable', '/event/replay_policy',
    'a current append refuses projector_replay_only (shared current_append_policy)', 'ne',
    lambda w, m: NE(m.get('policy_reason'), 'replay_only_not_appendable'), gates=('env_ok',),
    witnesses=[W('projector_replay_only', event=lambda e, c: dict(e, replay_policy='projector_replay_only'))])
row(A, 'append_policy', 'append_replay_policy', 'family_current_replay_policy', '/event/replay_policy',
    'every current write selects dedupe_by_idempotency_key', 'eq',
    lambda w, m: EQ(E(w)['replay_policy'], 'dedupe_by_idempotency_key'), gates=('env_ok',),
    when=lambda w, m: m.get('policy_reason') != 'replay_only_not_appendable',
    witnesses=[W('append_once', event=lambda e, c: dict(e, replay_policy='append_once')),
               W('dedupe_by_event_id', event=lambda e, c: dict(e, replay_policy='dedupe_by_event_id'))])
row(A, 'append_policy', 'append_payload_ref_null', 'payload_route', '/event/payload_ref',
    'payload_ref is null: this family keeps the 2.0.0 inline route (CV-332)', 'none',
    lambda w, m: V(E(w)['payload_ref']), gates=('env_ok',),
    witnesses=[W('blake3 ref string', event=lambda e, c: dict(e, payload_ref='blake3:' + '0' * 64)),
               W('pack ref string', event=lambda e, c: dict(e, payload_ref='pm-payload-ref:v1:blake3:' + 'a' * 64))])


def _big_artifacts(n=64, length=500):
    def hook(s, c):
        s['payload']['artifact_refs'] = ['artifact:' + ('%03d' % i) + 'x' * (length - 12) for i in range(n)]
        return s
    return hook


row(A, 'append_policy', 'append_inline_limit', 'payload_inline_limit', '/event/payload',
    'the canonical MessagePack payload map is at most 16384 bytes (CV-332 2.0.0 inline route)', 'at_most',
    lambda w, m: {'presented': physical_size(P(w)), 'limit': INLINE_LIMIT}, gates=('pay_dict',),
    witnesses=[W('64 artifact refs of 500 bytes', source=_big_artifacts()),
               W('40 artifact refs of 420 bytes', source=_big_artifacts(40, 420))])
row(A, 'entailed_append_json_budget', 'append_json_budget', 'payload_byte_budget', '/event/payload',
    'the complete payload is at most 65536 UTF-8 JSON bytes (CV-332 budget)', 'at_most',
    lambda w, m: {'presented': json_size(P(w)), 'limit': JSON_BUDGET}, gates=('pay_dict',),
    when=lambda w, m: (physical_size(P(w)) or INLINE_LIMIT + 1) <= INLINE_LIMIT)

# Storage-assigned metadata is Storage's own record
for _k, _alt_v in (('event_id', None), ('sequence_id', None), ('observed_at_utc', '2026-11-14T10:00:01.5Z'),
                   ('persisted_at_utc', '2026-11-14T10:00:02.5Z')):
    row(A, 'append_storage', 'append_storage_' + _k.replace('_at_utc', ''), 'storage_metadata', '/event/' + _k,
        'the event ' + _k + ' equals Storage\'s own record', 'eq',
        (lambda k: lambda w, m: EQ(E(w)[k], w['storage_record'][k]))(_k), gates=('env_ok',),
        witnesses=[W('record differs', record=(lambda k, v: lambda r, c: dict(r, **{k: v if v is not None else (
            r[k] + 7 if type(r[k]) is int else r[k] + '-storage')}))(_k, _alt_v))])
row(A, 'append_storage', 'append_partition', 'partition_join', '/scope_partition',
    'Storage appended into project~base64url_no_pad(UTF8(project_id)) of the event\'s Project', 'eq',
    lambda w, m: EQ(w['scope_partition'], partition_of(E(w)['project_id'])), gates=('project_scope',),
    witnesses=[W('raw project id', partition=lambda p, c: PROJECT_ID),
               W('another project partition', partition=lambda p, c: partition_of('project-elsewhere')),
               W('padded base64', partition=lambda p, c: p + '==')])

# payload
row(A, 'append_payload', 'append_payload_schema', 'payload_schema', '/event/payload',
    'the full closed family payload owner schema accepts the payload (every keyword and $ref kept)', 'empty',
    lambda w, m: V(m.get('pay_errors')), gates=('env_ok', 'ints_ok'),
    witnesses=[('schema_walk', 'payload')])

# identity
row(A, 'append_identity', 'append_event_id', 'identity_join', '/event/event_id',
    'event_id is evt_browser_ + SHA-256 of the recomputed RFC 8785 identity tuple', 'eq',
    lambda w, m: EQ(E(w)['event_id'], m.get('recomputed')[0]), gates=('pay_ok',),
    witnesses=[W('other digest', event=lambda e, c: dict(e, event_id='evt_browser_' + _hex('other'))),
               W('uppercase digest', event=lambda e, c: dict(e, event_id='evt_browser_' + e['event_id'][12:].upper())),
               W('trailing LF', event=lambda e, c: dict(e, event_id=e['event_id'] + '\n')),
               W('caller nonce prefix', event=lambda e, c: dict(e, event_id='evt_' + e['event_id'][12:]))])
row(A, 'append_identity', 'append_idempotency_key', 'idempotency_key_join', '/event/idempotency_key',
    'idempotency_key is browser@1: + the same digest', 'eq',
    lambda w, m: EQ(E(w)['idempotency_key'], m.get('recomputed')[1]), gates=('pay_ok',),
    witnesses=[W('fixture key', event=lambda e, c: dict(e, idempotency_key='browser-transition-1')),
               W('application-format key', event=lambda e, c: dict(e, idempotency_key='application@1:' + e['idempotency_key'][10:]))])
row(A, 'append_identity', 'append_producer_route', 'producer_route', '/event',
    'the CV-317 producer-semantic digest qualifies (shared producer_semantic_digest, producer_sequence_id '
    'type-sensitive); a schema-legal value outside the route refuses without narrowing the schema', 'none',
    lambda w, m: V(m.get('digest_reason')), gates=('pay_ok',),
    witnesses=[W('producer sequence 2**53+1', source=lambda s, c: dict(s, transition_sequence=(1 << 53) + 1)),
               W('producer sequence 2**60', source=lambda s, c: dict(s, transition_sequence=1 << 60))])

# envelope lineage = payload context
for _k in LINEAGE:
    def _lineage_w(family, k=_k):
        out = [W('event ' + k + ' differs', event=lambda e, c: dict(e, **{k: _alt(e[k], 'envelope')}))]
        if k != 'project_id':
            linked = base_payload(family, linked=True)['context']
            sib = {'thread_id': 'node_id', 'run_id': 'thread_id', 'node_id': 'attempt_id', 'attempt_id': 'run_id'}[k]
            if linked[k] is not None and linked[sib] is not None and linked[sib] != linked[k]:
                out.append(('linked swap ' + k + '<-' + sib,
                            {'variant': 'linked', 'event': lambda e, c, sib=sib: dict(e, **{k: e['payload']['context'][sib]})}))
        return out
    row(A, 'append_lineage', 'append_lineage_' + _k.replace('_id', ''), 'envelope_join', '/event/' + _k,
        'the envelope ' + _k + ' equals the payload context ' + _k, 'eq',
        (lambda k: lambda w, m: EQ(E(w)[k], P(w)['context'][k]))(_k),
        gates=('pay_ok', 'project_scope') if _k == 'project_id' else ('pay_ok',),
        witnesses=[per_family(_lineage_w)])

# envelope copies of the committed owner transition
COPY_SOURCE = {'producer_sequence_id': 'transition_sequence'}
SWAPS = {'requested_account_ref': 'effective_account_ref', 'effective_account_ref': 'requested_account_ref',
         'causation_event_id': 'parent_event_id', 'parent_event_id': 'causation_event_id'}
for _i, _k in enumerate(SOURCE_COPIES):
    def _copy_w(family, k=_k):
        sk = COPY_SOURCE.get(k, k)
        out = [W('transition ' + sk + ' differs', case=_src(lambda s: s.update(**{sk: _alt(s[sk], 'transition')})))]
        if k in SWAPS:
            out.append(('linked swap ' + k + '<-' + SWAPS[k],
                        {'variant': 'linked', 'event': lambda e, c, sw=SWAPS[k]: dict(e, **{k: c['source'][sw]})}))
        if k == 'occurred_at_utc':
            out.append(W('event offset time', event=lambda e, c: dict(e, occurred_at_utc='2026-11-14T12:00:00+02:00')))
        return out
    row(A, 'append_copies_%d' % (1 + _i // 4), 'append_copy_' + _k.replace('_at_utc', '').replace('_id', '').replace('_ref', ''),
        'source_join', '/event/' + _k,
        'the envelope ' + _k + ' is the committed owner transition\'s own value (required-present nulls included)', 'eq',
        (lambda k: lambda w, m: EQ(E(w)[k], S(w)[COPY_SOURCE.get(k, k)]))(_k), gates=('pay_ok',),
        witnesses=[per_family(_copy_w)])


def _ctx_alt(field, value):
    if field == 'page_generation':
        return 0 if value is None else value + 1
    if field == 'session_security_class':
        return None
    return _alt(value, 'transition')


CONTEXT_FIELDS = tuple(PAYLOADS['$defs']['context']['required'])
for _i, _k in enumerate(f for f in CONTEXT_FIELDS if f != 'session_security_class'):
    row(A, 'append_context_%d' % (1 + _i // 7), 'append_context_' + _k.replace('_id', ''), 'source_join',
        '/event/payload/context/' + _k,
        'payload context ' + _k + ' is the committed owner transition\'s value', 'eq',
        (lambda k: lambda w, m: EQ(P(w)['context'][k], SP_(w)['context'][k]))(_k), gates=('pay_ok',),
        witnesses=[(lambda k: W('transition ' + k + ' differs',
                                case=_src(lambda s: s['payload']['context'].update(**{k: _ctx_alt(k, s['payload']['context'][k])}))))(_k)])
for _i, _k in enumerate(PAYLOAD_REFS):
    row(A, 'append_refs', 'append_ref_' + _k.replace('_ref', '').replace('_snapshot', ''), 'source_join',
        '/event/payload/' + _k, 'payload ' + _k + ' is the committed owner transition\'s value', 'eq',
        (lambda k: lambda w, m: EQ(P(w)[k], SP_(w)[k]))(_k), gates=('pay_ok',),
        witnesses=[(lambda k: W('transition ' + k + ' differs',
                                case=_src(lambda s: s['payload'].update(**{k: _alt(s['payload'][k], 'transition')}))))(_k)])

FACT_FIELDS = sorted({k for f in FAMILIES for k in FAM[f]['fact_fields']})


def _fact_alt(value):
    if type(value) is dict:
        out = copy.deepcopy(value)
        k = sorted(out)[0]
        out[k] = _fact_alt(out[k]) if type(out[k]) is not list else out[k]
        if out == value:
            k = [x for x in sorted(out) if type(out[x]) in (int, str, bool)][0]
            out[k] = _alt(out[k], 'transition')
        return out
    return _alt(value, 'transition')


for _i, _k in enumerate(FACT_FIELDS):
    row(A, 'append_facts_%d' % (1 + _i // 8), 'append_fact_' + _k, 'source_join', '/event/payload/facts/' + _k,
        'payload fact ' + _k + ' is the committed owner transition\'s value', 'eq',
        (lambda k: lambda w, m: EQ(P(w)['facts'][k], SP_(w)['facts'][k]))(_k), gates=('pay_ok',),
        families=tuple(f for f in FAMILIES if _k in FAM[f]['fact_fields']),
        witnesses=[(lambda k: W('transition fact ' + k + ' differs',
                                case=_src(lambda s: s['payload']['facts'].update(**{k: _fact_alt(s['payload']['facts'][k])}))))(_k)])

# family predicates (Section 15 'Transition'; GS rows of the shared Browser owner validator)
PRED_IDS = [c['id'] for c in SPEC['predicate_catalog']]
for _i, _pid in enumerate(PRED_IDS):
    row(A, 'append_predicates_%d' % (1 + _i // 8), 'append_pred_' + _pid, 'transition_predicate',
        '/event/payload', GS_OF[_pid] + ': ' + [c['words'] for c in SPEC['predicate_catalog'] if c['id'] == _pid][0],
        'true', (lambda pid: lambda w, m: V(PREDICATES[pid](P(w))))(_pid), gates=('pay_ok',),
        families=tuple(f for f in FAMILIES if _pid in FAMILY_PREDICATES[f]),
        witnesses=[('predicate_search', _pid)])

# custody v2 first receipt (SP-286 / CV-339)
for _i, _k in enumerate(RECEIPT_SLOTS):
    row(A, 'append_custody_slots', 'append_custody_slot_' + _k, 'number_domain', '/custody_receipt/first_append_receipt/' + _k,
        'the first receipt ' + _k + ' is Storage\'s exact uint64 (shared storage_uint64)', 'none',
        (lambda k: lambda w, m: V(reason_of(storage_uint64, _receipt(w).get(k))))(_k), gates=('env_ok',),
        witnesses=[(lambda k: W('custody %s 2**64' % k, custody=lambda cu, c: (cu['first_append_receipt'].update(**{k: 1 << 64}), cu)[1]))(_k),
                   (lambda k: W('custody %s float' % k, custody=lambda cu, c: (cu['first_append_receipt'].update(**{k: 1.0}), cu)[1]))(_k)])
row(A, 'append_custody_1', 'append_custody_schema', 'custody_schema', '/custody_receipt',
    'the full SP-286 custody_v2 owner schema accepts the custody row (acknowledged_at_utc on the EventRecord profile)',
    'empty', lambda w, m: V(schema_errors(RECEIPT_ID, '/$defs/custody_v2', w['custody_receipt'])),
    gates=('env_ok', 'custody_slots_ok'),
    witnesses=[W('unknown member', custody=lambda cu, c: dict(cu, extra='x')),
               W('durability_state pending', custody=lambda cu, c: (cu['first_append_receipt'].update(durability_state='pending'), cu)[1]),
               W('event_schema_version 3.0.0', custody=lambda cu, c: (cu['original_event_value_commitment'].update(event_schema_version='3.0.0'), cu)[1]),
               W('ack garbage', custody=lambda cu, c: (cu['first_append_receipt'].update(acknowledged_at_utc='garbage'), cu)[1]),
               W('ack hour 25', custody=lambda cu, c: (cu['first_append_receipt'].update(acknowledged_at_utc='2026-11-14T25:00:03Z'), cu)[1]),
               W('ack missing zone', custody=lambda cu, c: (cu['first_append_receipt'].update(acknowledged_at_utc='2026-11-14T10:00:03'), cu)[1])])
CUSTODY_JOINS = (
    ('storage_instance', 'storage_instance_id', lambda w: w['store']['storage_instance_id']),
    ('event', 'event_id', lambda w: E(w)['event_id']),
    ('partition', 'scope_partition', lambda w: w['scope_partition']),
    ('event_type', 'event_type', lambda w: E(w)['event_type']),
    ('key', 'idempotency_key', lambda w: E(w)['idempotency_key']),
    ('semantic', 'producer_semantic_digest', lambda w: digest_of(E(w))),
    ('full_value', None, lambda w: full_value_commitment(E(w))),
)
for _i, (_n, _f, _auth) in enumerate(CUSTODY_JOINS):
    def _cj_inputs(w, m, f=_f, auth=_auth):
        presented = w['custody_receipt']['original_event_value_commitment']['sha256'] if f is None else w['custody_receipt'][f]
        return EQ(presented, auth(w))

    def _cj_hook(f=_f, n=_n):
        def hook(cu, c):
            if f is None:
                cu['original_event_value_commitment']['sha256'] = _hex('forged-full-value')
            elif f == 'storage_instance_id':
                cu[f] = OTHER_STORAGE_INSTANCE_ID
            elif f == 'scope_partition':
                cu[f] = partition_of('project-elsewhere')
            elif f == 'producer_semantic_digest':
                cu[f] = _hex('forged-semantic')
            elif f == 'event_type':
                cu[f] = 'browser.workspace.created'
            else:
                cu[f] = cu[f] + '-forged'
            return cu
        return hook
    row(A, 'append_custody_%d' % (1 + (_i + 1) // 8), 'append_custody_' + _n, 'receipt_join',
        '/custody_receipt/' + (_f or 'original_event_value_commitment/sha256'),
        'the custody row\'s ' + _n + ' equals its authority (Storage, the event, or the shared recomputation)', 'eq',
        _cj_inputs, gates=('custody_ok', 'pay_ok') if _n in ('semantic', 'full_value') else ('custody_ok',),
        when=(lambda w, m: m.get('route_ok')) if _n == 'semantic' else None,
        witnesses=[W('custody ' + _n + ' forged', custody=_cj_hook())])
for _i, _k in enumerate(RECEIPT_FIELDS):
    def _rf_hook(k=_k):
        alt = {'durability_class': 'barrier', 'durability_state': 'synced', 'segment_name': 'seg-000002-%020d.active' % 1,
               'acknowledged_at_utc': '2026-11-14T10:00:04Z', 'commit_group_id': 'group-forged'}

        def hook(cu, c):
            r = cu['first_append_receipt']
            if k == 'durability_state':
                return None
            r[k] = alt[k] if k in alt else (r[k] + 1 if type(r[k]) is int else r[k] + '-forged')
            return cu
        return hook
    wit = [W('custody receipt ' + _k + ' differs from Storage', custody=_rf_hook())]
    if _k == 'durability_state':
        wit = [W('Storage pending, custody claims synced',
                 record=lambda r, c: dict(r, durability_state='pending'),
                 custody=lambda cu, c: (cu['first_append_receipt'].update(durability_state='synced'), cu)[1])]
    row(A, 'append_receipt_%d' % (1 + _i // 6), 'append_receipt_' + _k.replace('_at_utc', ''), 'receipt_join',
        '/custody_receipt/first_append_receipt/' + _k,
        'the first receipt ' + _k + ' equals Storage\'s own record', 'eq',
        (lambda k: lambda w, m: EQ(_receipt(w).get(k), w['storage_record'][k]))(_k), gates=('custody_ok',),
        witnesses=wit)
row(A, 'append_disclosure', 'append_success_receipt', 'success_without_receipt', '/reported_outcome',
    'success is reported only when Storage issued and synced this event\'s first receipt; otherwise the outcome stays '
    'unresolved', 'eq',
    lambda w, m: EQ(w['reported_outcome'], 'success' if w['store']['issuance'] == 'synced' else 'unresolved'),
    gates=('fam',),
    witnesses=[W('uncertain append reported as success', store=lambda s, c: dict(s, issuance='unknown')),
               W('failed group reported as success', store=lambda s, c: dict(s, issuance='failed'))])


# ---- Retry rows (lost-ack retry of an issued original) ----------------------------------------------------------

R = 'retry'
C = lambda w: w['candidate']  # noqa: E731


def _hit(w):
    c = C(w)
    project = c.get('project_id') if type(c) is dict else None
    return w['store']['dedupe'].get(dedupe_key(partition_of(project) if type(project) is str else '', w['family'],
                                               c.get('idempotency_key') if type(c) is dict else None))


def _sealed_for(w, event_id):
    return [r for r in w['store']['sealed'] if type(r) is dict and r.get('original_ref') == 'original:' + str(event_id)]


@derived
def r_obj(w, m):
    return w['family'] in FAMILIES and type(C(w)) is dict


@derived
def r_phys(w, m):
    return m.get('r_obj') and physical_reason(C(w)) is None


@derived
def r_env(w, m):
    return m.get('r_phys') and schema_errors(EVENT_RECORD_ID, '', C(w)) == []


@derived
def r_hit(w, m):
    return m.get('r_env') and _hit(w) is not None


@derived
def r_same(w, m):
    return m.get('r_hit') and _or(lambda: digest_of(C(w)), None) == _hit(w)['digest']


@derived
def r_sealed_one(w, m):
    return m.get('r_same') and len(_sealed_for(w, _hit(w)['event_id'])) == 1


def _cand(fn):
    return lambda c, ctx: fn(c) or c


row(R, 'retry', 'retry_candidate_object', 'event_schema', '/candidate', 'the retry candidate is a JSON object', 'true',
    lambda w, m: V(type(C(w)) is dict), witnesses=[W('candidate list', candidate=lambda c, x: [])])
row(R, 'retry', 'retry_writer_cutoff', 'family_withdrawn', '/store/withdrawn',
    'a withdrawn family refuses even a same-key retry: the writer cutoff runs before dedupe', 'not_member',
    lambda w, m: {'presented': w['family'], 'collection': w['store']['withdrawn']}, gates=('r_obj',),
    witnesses=[W('same-key retry after withdrawal', store=lambda s, c: dict(s, withdrawn=[c['family']]))])
row(R, 'retry', 'retry_physical', 'number_domain', '/candidate',
    'the retry candidate encodes under SP-1100 EVENT_VALUE', 'none', lambda w, m: V(physical_reason(C(w))),
    gates=('r_obj',), witnesses=[W('candidate sequence 2**64', candidate=lambda c, x: dict(c, sequence_id=1 << 64))])
row(R, 'retry', 'retry_envelope_schema', 'event_schema', '/candidate',
    'the full EventRecord owner schema accepts the retry candidate', 'empty',
    lambda w, m: V(schema_errors(EVENT_RECORD_ID, '', C(w))), gates=('r_phys',),
    witnesses=[W('candidate unknown member', candidate=lambda c, x: dict(c, extra='x')),
               W('candidate malformed observed time', candidate=lambda c, x: dict(c, observed_at_utc='not-a-time'))])
row(R, 'retry', 'retry_replay_only', 'replay_only_not_appendable', '/candidate/replay_policy',
    'a current retry refuses projector_replay_only (shared current_append_policy)', 'ne',
    lambda w, m: NE(reason_of(current_append_policy, C(w)['replay_policy']), 'replay_only_not_appendable'),
    gates=('r_env',), witnesses=[W('replay-only retry', candidate=lambda c, x: dict(c, replay_policy='projector_replay_only'))])
row(R, 'retry', 'retry_original_present', 'retry_original_missing', '/store/dedupe',
    'the scoped (partition, event_type, idempotency_key) identity resolves an issued original', 'true',
    lambda w, m: V(_hit(w) is not None), gates=('r_env',),
    witnesses=[W('dedupe entry absent', store=lambda s, c: dict(s, dedupe={}))])
row(R, 'retry', 'retry_semantic', 'idempotency_conflict', '/candidate',
    'the same key with a different CV-317 producer-semantic digest is an idempotency conflict', 'eq',
    lambda w, m: EQ(_or(lambda: digest_of(C(w)), None), _hit(w)['digest']), gates=('r_hit',),
    witnesses=[W('changed actor', candidate=lambda c, x: dict(c, actor_ref=c['actor_ref'] + '-retry')),
               W('changed payload ref', candidate=lambda c, x: (c['payload'].update(permission_snapshot_ref='policy:other'), c)[1]),
               W('changed producer sequence', candidate=lambda c, x: dict(c, producer_sequence_id=8))])
row(R, 'retry_result', 'retry_result_status', 'receipt_join', '/result/status',
    'a same-digest retry returns the original', 'eq', lambda w, m: EQ(w['result']['status'], 'original'),
    gates=('r_same',), witnesses=[W('result reports a fresh append', result=lambda r, c: dict(r, status='appended'))])
row(R, 'retry_result', 'retry_result_event', 'receipt_join', '/result/event_id',
    'the returned event ID is the original\'s', 'eq', lambda w, m: EQ(w['result']['event_id'], _hit(w)['event_id']),
    gates=('r_same',), witnesses=[W('result names a new event', result=lambda r, c: dict(r, event_id=r['event_id'] + '-new'))])
row(R, 'retry_result', 'retry_result_sequence', 'retry_transition', '/result/sequence_id',
    'the returned sequence is the original\'s; a retry assigns no new sequence', 'eq',
    lambda w, m: EQ(w['result']['sequence_id'], _hit(w)['sequence_id']), gates=('r_same',),
    witnesses=[W('result has a new sequence', result=lambda r, c: dict(r, sequence_id=r['sequence_id'] + 1))])
row(R, 'retry_result', 'retry_sealed_unique', 'receipt_join', '/store/sealed',
    'exactly one sealed receipt holds the original', 'eq',
    lambda w, m: EQ(len(_sealed_for(w, _hit(w)['event_id'])), 1), gates=('r_same',),
    witnesses=[W('two sealed receipts for the original', store=lambda s, c: dict(s, sealed=s['sealed'] + copy.deepcopy(s['sealed'])))])
row(R, 'retry_result', 'retry_result_receipt', 'receipt_join', '/result/receipt_hex',
    'a lost-ack retry returns the original sealed first receipt (storage.first_append_receipt.resolve.v2)', 'eq',
    lambda w, m: EQ(w['result']['receipt_hex'], _sealed_for(w, _hit(w)['event_id'])[0]['receipt_hex']),
    gates=('r_sealed_one',),
    witnesses=[W('result returns another receipt', result=lambda r, c: dict(r, receipt_hex=r['receipt_hex'][:-2] + 'c0'))])
row(R, 'retry_result', 'retry_no_append', 'retry_transition', '/log_after',
    'a retry appends no second record', 'eq', lambda w, m: EQ(w['log_after'], w['log_before']), gates=('r_obj',),
    witnesses=[W('retry appended again', world=lambda x, c: dict(x, log_after=x['log_before'] + 1))])


# ---- Derived rows (SP-278 filtered checkpoint advance) ---------------------------------------------------------

D = 'derived'
PV = lambda w: w['proposed']  # noqa: E731
TOK = lambda w: w['proposed']['index_read_token']  # noqa: E731


def _expected_scan(w):
    return scan(w['family'], w['store']['log'], w['project_id'])


CK_SLOTS = (('publication_revision', ('publication_revision',)), ('matched_count', ('matched_count',)),
            ('index_through_sequence_id', ('index_through_sequence_id',)),
            ('frontier_revision', ('index_read_token', 'frontier_revision')),
            ('selected_segment_generation', ('index_read_token', 'source_selection', 'selected_segment_generation')),
            ('manifest_generation', ('index_read_token', 'source_selection', 'manifest_generation')),
            ('recovery_epoch', ('index_read_token', 'source_selection', 'recovery_epoch')),
            ('cursor_segment_generation', ('source_cursor', 'segment_generation')),
            ('cursor_byte_offset', ('source_cursor', 'byte_offset')),
            ('cursor_frame_end_offset', ('source_cursor', 'frame_end_offset')),
            ('cursor_last_sequence_id', ('source_cursor', 'last_sequence_id')))


def at_path(node, path):
    for part in path:
        if type(node) is not dict or part not in node:
            return None, False
        node = node[part]
    return node, True


def slot_reason(value, path):
    v, present = at_path(value, path)
    if not present or (v is None and path[-1] in ('index_through_sequence_id',)) or (path[0] == 'source_cursor' and value.get('source_cursor') is None):
        return None
    return reason_of(storage_uint64, v)


def checkpoint_ok(value, family):
    return (type(value) is dict and all(slot_reason(value, p) is None for _n, p in CK_SLOTS)
            and physical_reason(value) is None
            and schema_errors(CHECKPOINTS_ID, '/$defs/' + FAM[family]['slug'] + '_index_checkpoint', value) == [])


@derived
def d_obj(w, m):
    return w['family'] in FAMILIES and type(PV(w)) is dict


@derived
def d_slots(w, m):
    return m.get('d_obj') and all(slot_reason(PV(w), p) is None for _n, p in CK_SLOTS)


@derived
def d_phys(w, m):
    return m.get('d_slots') and physical_reason(PV(w)) is None


@derived
def d_ok(w, m):
    return m.get('d_phys') and schema_errors(CHECKPOINTS_ID, '/$defs/' + FAM[w['family']]['slug'] + '_index_checkpoint',
                                             PV(w)) == []


@derived
def d_cursor_both(w, m):
    return m.get('d_ok') and PV(w)['source_cursor'] is not None and _expected_scan(w)[2] is not None


def _set(path, value):
    def hook(v, c):
        node = v
        for part in path[:-1]:
            node = node[part]
        node[path[-1]] = value(node[path[-1]]) if callable(value) else value
        return v
    return hook


row(D, 'derived_shape', 'derived_value_object', 'checkpoint_schema', '/proposed',
    'the proposed checkpoint value is a JSON object', 'true', lambda w, m: V(type(PV(w)) is dict),
    witnesses=[W('value list', proposed=lambda v, c: [])])
for _i, (_n, _p) in enumerate(CK_SLOTS):
    row(D, 'derived_slots_%d' % (1 + _i // 6), 'derived_slot_' + _n, 'number_domain', '/proposed/' + '/'.join(_p),
        _n + ' is an exact uint64 (shared storage_uint64)', 'none',
        (lambda p: lambda w, m: V(slot_reason(PV(w), p)))(_p), gates=('d_obj',),
        witnesses=[(lambda p: W(lbl, proposed=_set(p, val)))(_p) for lbl, val in
                   (('2**64', 1 << 64), ('-1', -1), ('float', 2.0), ('string', '2'), ('boolean', True))])
row(D, 'derived_shape', 'derived_value_physical', 'number_domain', '/proposed',
    'the checkpoint value encodes under the shared SP-236 profile', 'none', lambda w, m: V(physical_reason(PV(w))),
    gates=('d_slots',), witnesses=[W('extra 2**64 member', proposed=lambda v, c: dict(v, extra=1 << 64))])
row(D, 'derived_shape', 'derived_value_size', 'checkpoint_size', '/proposed',
    'the stored checkpoint value is at most 16384 physical bytes', 'at_most',
    lambda w, m: {'presented': physical_size(PV(w)), 'limit': INLINE_LIMIT}, gates=('d_phys',),
    witnesses=[W('64 holds of 500 bytes carried forward',
                 prior=lambda v, c: dict(v, hold_refs=['hold:%03d' % i + 'x' * 492 for i in range(64)]))])
row(D, 'derived_shape', 'derived_value_schema', 'checkpoint_schema', '/proposed',
    'the full closed checkpoint owner schema accepts the value (format, allOf state and cursor rules kept)', 'empty',
    lambda w, m: V(schema_errors(CHECKPOINTS_ID, '/$defs/' + FAM[w['family']]['slug'] + '_index_checkpoint', PV(w))),
    gates=('d_phys',), witnesses=[('schema_walk', 'checkpoint')])
D_JOINS = (
    ('key', 'checkpoint_key_join', ('checkpoint_key',), lambda w: checkpoint_key(w['family'], w['store']['storage_instance_id'], w['project_id'])),
    ('storage_instance', 'storage_instance_join', ('storage_instance_id',), lambda w: w['store']['storage_instance_id']),
    ('project', 'scope_join', ('project_id',), lambda w: w['project_id']),
    ('partition', 'partition_join', ('scope_partition',), lambda w: partition_of(PV(w)['project_id'])),
    ('through', 'coverage_join', ('index_through_sequence_id',), lambda w: _expected_scan(w)[1]),
    ('count', 'count_join', ('matched_count',), lambda w: _expected_scan(w)[0]),
    ('revision', 'checkpoint_cas_conflict', ('publication_revision',), lambda w: 0 if w['prior'] is None else w['prior']['publication_revision'] + 1),
    ('previous', 'checkpoint_cas_conflict', ('previous_checkpoint_sha256',), lambda w: None if w['prior'] is None else binding_hash(w['prior'])),
    ('state', 'checkpoint_state', ('state',), lambda w: 'current'),
    ('publication', 'publication_join', ('publication_id',), lambda w: PV(w)['publication_id'] if w['prior'] is None else w['prior']['publication_id']),
    ('retired', 'retired_join', ('retired_generations',), lambda w: [] if w['prior'] is None else w['prior']['retired_generations']),
    ('holds', 'hold_join', ('hold_refs',), lambda w: [] if w['prior'] is None else w['prior']['hold_refs']),
)
D_JOIN_W = {
    'key': [W('key of another instance', proposed=_set(('checkpoint_key',), lambda k: k.replace(STORAGE_INSTANCE_ID, OTHER_STORAGE_INSTANCE_ID)))],
    'storage_instance': [W('foreign instance', proposed=_set(('storage_instance_id',), OTHER_STORAGE_INSTANCE_ID))],
    'project': [W('another project', proposed=lambda v, c: dict(v, project_id='project-elsewhere', scope_partition=partition_of('project-elsewhere')))],
    'partition': [W('partition of another project', proposed=_set(('scope_partition',), partition_of('project-elsewhere')))],
    'through': [W('filtered maximum as coverage', proposed=_set(('index_through_sequence_id',), 41))],
    'count': [W('count 3', proposed=_set(('matched_count',), 3)), W('count-only 1', proposed=_set(('matched_count',), 1))],
    'revision': [W('revision skips', proposed=_set(('publication_revision',), lambda r: r + 1))],
    'previous': [W('stale predecessor hash', proposed=_set(('previous_checkpoint_sha256',), _hex('stale-predecessor')))],
    'state': [W('advance publishes withdrawn', proposed=lambda v, c: dict(v, state='withdrawn', withdrawn_at_utc=WITHDRAWN_AT, withdrawal_receipt_ref='receipt:forged'))],
    'publication': [W('publication reminted', proposed=_set(('publication_id',), 'pub-reminted'))],
    'retired': [W('retired history dropped', variant='retired', proposed=_set(('retired_generations',), []))],
    'holds': [W('holds dropped', variant='held', proposed=_set(('hold_refs',), []))],
}
for _i, (_n, _code, _p, _auth) in enumerate(D_JOINS):
    row(D, 'derived_joins_%d' % (1 + _i // 6), 'derived_' + _n, _code, '/proposed/' + '/'.join(_p),
        'the checkpoint ' + '/'.join(_p) + ' equals its authority (the store, the complete prefix scan or the predecessor)',
        'eq', (lambda p, auth: lambda w, m: EQ(at_path(PV(w), p)[0], auth(w)))(_p, _auth), gates=('d_ok',),
        witnesses=D_JOIN_W[_n])
row(D, 'derived_joins_3', 'derived_prior_current', 'checkpoint_withdrawn', '/prior/state',
    'a withdrawn checkpoint never advances', 'true',
    lambda w, m: V(w['prior'] is None or w['prior'].get('state') == 'current'), gates=('d_ok',),
    witnesses=[W('advance over a withdrawn predecessor', prior=lambda v, c: withdraw(v, dict(checkpoint_store(c['family']))))])
TOKEN_FIELDS = ('storage_instance_id', 'checkpoint_key', 'checkpoint_ref', 'generation_id', 'generation_anchor_sha256',
                'frontier_revision', 'frontier_sha256', 'index_dataset_name', 'source_selection')
for _i, _k in enumerate(TOKEN_FIELDS):
    def _tok_alt(v, k=_k):
        if k == 'storage_instance_id':
            return OTHER_STORAGE_INSTANCE_ID
        if k == 'generation_id':
            return 'eig_' + _hex('stale-generation')
        if k in ('generation_anchor_sha256', 'frontier_sha256'):
            return _hex('stale-' + k)
        if k == 'frontier_revision':
            return v - 1
        if k == 'source_selection':
            return dict(v, manifest_generation=v['manifest_generation'] - 1)
        return v + '-stale'
    row(D, 'derived_token_%d' % (1 + _i // 5), 'derived_token_' + _k.replace('_sha256', ''), 'token_join',
        '/proposed/index_read_token/' + _k,
        'the durable token ' + _k + ' equals the current SP-278 selection\'s nine-field token (DL-076)', 'eq',
        (lambda k: lambda w, m: EQ(TOK(w)[k], durable_token(w['store']['selection'])[k]))(_k), gates=('d_ok',),
        witnesses=[(lambda k, alt: W('token ' + k + ' stale', proposed=lambda v, c: (v['index_read_token'].update(**{k: alt(v['index_read_token'][k])}), v)[1]))(_k, _tok_alt)])
for _k in ('segment_generation', 'segment_name', 'byte_offset', 'frame_end_offset', 'last_sequence_id', 'last_event_id'):
    def _cur_alt(v, k=_k):
        return {'segment_generation': 2, 'segment_name': 'seg-000002-%020d.active' % 1}.get(k, (v + 1) if type(v) is int else v + '-other')
    row(D, 'derived_cursor', 'derived_cursor_' + _k, 'cursor_join', '/proposed/source_cursor/' + _k,
        'the inclusive cursor ' + _k + ' is the last scanned frame\'s, even when it is another family\'s', 'eq',
        (lambda k: lambda w, m: EQ(PV(w)['source_cursor'][k], _expected_scan(w)[2][k]))(_k), gates=('d_cursor_both',),
        witnesses=[(lambda k, alt: W('cursor ' + k + ' differs', proposed=lambda v, c: (v['source_cursor'].update(**{k: alt(v['source_cursor'][k])}), v)[1]))(_k, _cur_alt)])


# ---- Read rows (operating reader disclosure) --------------------------------------------------------------------

RD = 'read'
CP = lambda w: w['checkpoint']  # noqa: E731


@derived
def rd_ok(w, m):
    return w['family'] in FAMILIES and checkpoint_ok(CP(w), w['family'])


@derived
def rd_covered(w, m):
    if not m.get('rd_ok'):
        return False
    t = CP(w)['index_through_sequence_id']
    return type(t) is int and type(w['request']['sequence_id']) is int and w['request']['sequence_id'] <= t


def _log_entry(w):
    hits = [e for e in w['store']['log'] if e['sequence_id'] == w['request']['sequence_id']]
    return hits[0] if hits else None


row(RD, 'read', 'read_checkpoint_valid', 'checkpoint_unavailable', '/checkpoint',
    'the stored checkpoint passes its slots, physical encoding and full owner schema', 'true',
    lambda w, m: V(checkpoint_ok(CP(w), w['family'])),
    witnesses=[W('checkpoint absent', checkpoint=lambda v, c: []),
               W('checkpoint unknown member', checkpoint=lambda v, c: dict(v, extra='x'))])
row(RD, 'read', 'read_state_current', 'checkpoint_withdrawn', '/checkpoint/state',
    'only a current checkpoint discloses', 'eq', lambda w, m: EQ(CP(w)['state'], 'current'), gates=('rd_ok',),
    witnesses=[W('withdrawn checkpoint', checkpoint=lambda v, c: withdraw(v, checkpoint_store(c['family'])))])
for _k in ('generation_id', 'frontier_revision', 'frontier_sha256'):
    row(RD, 'read', 'read_token_' + _k.replace('_sha256', '_hash'), 'token_stale', '/checkpoint/index_read_token/' + _k,
        'the stored token\'s ' + _k + ' is the current SP-278 selection\'s', 'eq',
        (lambda k: lambda w, m: EQ(CP(w)['index_read_token'][k], w['store']['selection'][k]))(_k), gates=('rd_ok',),
        witnesses=[(lambda k: W('selection moved: ' + k, store=lambda s, c: (s['selection'].update(**{k: ('eig_' + _hex('newer')) if k == 'generation_id' else (s['selection'][k] + 1 if k == 'frontier_revision' else _hex('newer-' + k))}), s)[1]))(_k)])
row(RD, 'read', 'read_coverage', 'coverage_incomplete', '/request/sequence_id',
    'coverage reaches the requested sequence', 'true', lambda w, m: V(m.get('rd_covered')), gates=('rd_ok',),
    witnesses=[W('request past coverage', request=lambda r, c: dict(r, sequence_id=43))])
row(RD, 'read_access', 'read_access', 'current_disclosure', '/store/access',
    'current Project access permits the read', 'true',
    lambda w, m: V(w['store']['access'].get(w['request']['project_id']) is True), gates=('rd_ok',),
    witnesses=[W('access revoked', store=lambda s, c: dict(s, access={PROJECT_ID: False}))])
row(RD, 'read_access', 'read_not_tombstoned', 'current_disclosure', '/store/tombstones',
    'the requested original is not tombstoned', 'not_member',
    lambda w, m: {'presented': w['request']['event_id'], 'collection': w['store']['tombstones']}, gates=('rd_ok',),
    witnesses=[W('original deleted', store=lambda s, c: dict(s, tombstones=[[e for e in s['log'] if 'case' in e][-1]['event_id']]))])
row(RD, 'read_access', 'read_original_logged', 'recovery_required', '/store/log',
    'the requested original is the retained record at that sequence', 'eq',
    lambda w, m: EQ(_log_entry(w)['event_id'] if _log_entry(w) else None, w['request']['event_id']), gates=('rd_covered',),
    witnesses=[W('restored log lost the original', store=lambda s, c: dict(s, log=[dict(e, event_id='evt_replaced') if 'case' in e and e['sequence_id'] == 41 else e for e in s['log']]))])
row(RD, 'read_access', 'read_original_sealed', 'recovery_required', '/store/sealed',
    'the requested original\'s sealed write receipt survives (coherent backup and restore)', 'eq',
    lambda w, m: EQ(len([r for r in w['store']['sealed'] if r.get('original_ref') == 'original:' + str(w['request']['event_id'])]), 1),
    gates=('rd_covered',),
    witnesses=[W('restore dropped the sealed receipt', store=lambda s, c: dict(s, sealed=s['sealed'][:1]))])


# ---- Withdrawal, rebuild and cleanup rows ------------------------------------------------------------------------

WD, RB, CL = 'withdrawal', 'rebuild', 'cleanup'


@derived
def wd_ok(w, m):
    return w['family'] in FAMILIES and checkpoint_ok(PV(w), w['family'])


row(WD, 'withdrawal', 'withdrawal_value_valid', 'checkpoint_schema', '/proposed',
    'the withdrawn value passes its slots, physical encoding and full owner schema (state allOf kept)', 'true',
    lambda w, m: V(checkpoint_ok(PV(w), w['family'])),
    witnesses=[W('withdrawn without time', proposed=lambda v, c: dict(v, withdrawn_at_utc=None)),
               W('withdrawal time malformed', proposed=lambda v, c: dict(v, withdrawn_at_utc='2026-11-14T12:00:00')),
               W('withdrawn without receipt', proposed=lambda v, c: dict(v, withdrawal_receipt_ref=None))])
row(WD, 'withdrawal', 'withdrawal_writer_cutoff', 'withdrawal_order', '/store/withdrawn',
    'writers are cut off before the consumer is withdrawn', 'member',
    lambda w, m: {'presented': w['family'], 'collection': w['store']['withdrawn']}, gates=('wd_ok',),
    witnesses=[W('consumer withdrawn while writers open', store=lambda s, c: dict(s, withdrawn=[]))])
for _n, _code, _auth, _wit in (
        ('withdrawn_at_utc', 'withdrawal_time_join', lambda w: w['store']['withdrawal']['at'], ('withdrawal time differs', '2026-11-14T12:00:01Z')),
        ('withdrawal_receipt_ref', 'withdrawal_receipt_join', lambda w: w['store']['withdrawal']['receipt_ref'], ('caller receipt', 'receipt:caller')),
        ('publication_revision', 'checkpoint_cas_conflict', lambda w: w['prior']['publication_revision'] + 1, ('revision unchanged', None)),
        ('previous_checkpoint_sha256', 'checkpoint_cas_conflict', lambda w: binding_hash(w['prior']), ('stale predecessor', _hex('stale')))):
    if _n == 'publication_revision':
        wit = [W('revision unchanged', proposed=lambda v, c: dict(v, publication_revision=v['publication_revision'] - 1,
                                                                 previous_checkpoint_sha256=v['previous_checkpoint_sha256']))]
    else:
        wit = [(lambda n, val: W(_wit[0], proposed=lambda v, c: dict(v, **{n: val})))(_n, _wit[1])]
    row(WD, 'withdrawal', 'withdrawal_' + _n.replace('_at_utc', '').replace('_ref', '').replace('_sha256', ''), _code,
        '/proposed/' + _n, 'the withdrawal ' + _n + ' equals its authority', 'eq',
        (lambda n, auth: lambda w, m: EQ(PV(w)[n], auth(w)))(_n, _auth), gates=('wd_ok',), witnesses=wit)
WD_KEEP = ('publication_id', 'index_read_token', 'index_through_sequence_id', 'matched_count', 'source_cursor',
           'hold_refs', 'retired_generations', 'filter_complete', 'checkpoint_key', 'project_id')
row(WD, 'withdrawal_keep', 'withdrawal_core_unchanged', 'withdrawal_join', '/proposed',
    'withdrawal changes only state, time, receipt and the CAS fields; the core is the predecessor\'s', 'eq',
    lambda w, m: EQ({k: PV(w)[k] for k in WD_KEEP}, {k: w['prior'][k] for k in WD_KEEP}), gates=('wd_ok',),
    witnesses=[W('count rewritten at withdrawal', proposed=lambda v, c: dict(v, matched_count=v['matched_count'] + 1)),
               W('holds cleared at withdrawal', proposed=lambda v, c: dict(v, hold_refs=['hold:new']))])
row(WD, 'withdrawal_keep', 'withdrawal_no_event', 'withdrawal_event', '/log_after',
    'withdrawal appends no event', 'eq', lambda w, m: EQ(w['log_after'], w['log_before']), gates=('wd_ok',),
    witnesses=[W('withdrawal appended an event', world=lambda x, c: dict(x, log_after=x['log_before'] + 1))])


@derived
def rb_ok(w, m):
    return w['family'] in FAMILIES and checkpoint_ok(PV(w), w['family'])


row(RB, 'rebuild', 'rebuild_value_valid', 'checkpoint_schema', '/proposed',
    'the rebuilt value passes its slots, physical encoding and full owner schema (at most two retired generations)',
    'true', lambda w, m: V(checkpoint_ok(PV(w), w['family'])),
    witnesses=[W('no lawful slot: third retired generation', prior=lambda v, c: dict(v, retired_generations=[
        dict(retired_core(withdraw(v, checkpoint_store(c['family']))), publication_id='pub-old-a', state='withdrawn'),
        dict(retired_core(withdraw(v, checkpoint_store(c['family']))), publication_id='pub-old-b', state='withdrawn')]))])
RB_JOINS = (
    ('state', 'checkpoint_state', lambda w: PV(w)['state'], lambda w: 'current'),
    ('retired_head', 'retired_join', lambda w: PV(w)['retired_generations'][:1], lambda w: [retired_core(w['prior'])]),
    ('retired_tail', 'retired_join', lambda w: PV(w)['retired_generations'][1:], lambda w: w['prior']['retired_generations']),
    ('count', 'count_join', lambda w: PV(w)['matched_count'], lambda w: scan(w['family'], w['store']['log'], PROJECT_ID)[0]),
    ('through', 'coverage_join', lambda w: PV(w)['index_through_sequence_id'], lambda w: scan(w['family'], w['store']['log'], PROJECT_ID)[1]),
    ('cursor', 'cursor_join', lambda w: PV(w)['source_cursor'], lambda w: scan(w['family'], w['store']['log'], PROJECT_ID)[2]),
    ('token', 'token_join', lambda w: PV(w)['index_read_token'], lambda w: durable_token(w['store']['selection'])),
    ('revision', 'checkpoint_cas_conflict', lambda w: PV(w)['publication_revision'], lambda w: w['prior']['publication_revision'] + 1),
    ('previous', 'checkpoint_cas_conflict', lambda w: PV(w)['previous_checkpoint_sha256'], lambda w: binding_hash(w['prior'])),
)
RB_W = {
    'state': [W('rebuild publishes withdrawn', proposed=lambda v, c: dict(v, state='withdrawn', withdrawn_at_utc=WITHDRAWN_AT, withdrawal_receipt_ref='receipt:x'))],
    'retired_head': [W('withdrawal time refreshed', proposed=lambda v, c: (v['retired_generations'][0].update(withdrawn_at_utc='2026-11-14T13:00:00Z'), v)[1]),
                     W('withdrawn core not retired', proposed=lambda v, c: dict(v, retired_generations=v['retired_generations'][1:]))],
    'retired_tail': [W('older retired generation dropped', variant='retired', proposed=lambda v, c: dict(v, retired_generations=v['retired_generations'][:1]))],
    'count': [W('rebuild count differs', proposed=lambda v, c: dict(v, matched_count=v['matched_count'] + 1))],
    'through': [W('rebuild stops early', proposed=lambda v, c: dict(v, index_through_sequence_id=41))],
    'cursor': [W('rebuild cursor on the last match', proposed=lambda v, c: dict(v, source_cursor=dict(v['source_cursor'], last_sequence_id=41)))],
    'token': [W('rebuild keeps the withdrawn token', proposed=lambda v, c: (v['index_read_token'].update(frontier_sha256=_hex('withdrawn-token')), v)[1])],
    'revision': [W('rebuild revision skips', proposed=lambda v, c: dict(v, publication_revision=v['publication_revision'] + 1))],
    'previous': [W('rebuild predecessor stale', proposed=lambda v, c: dict(v, previous_checkpoint_sha256=_hex('stale')))],
}
for _i, (_n, _code, _pres, _auth) in enumerate(RB_JOINS):
    row(RB, 'rebuild_joins_%d' % (1 + _i // 5), 'rebuild_' + _n, _code, '/proposed',
        'the rebuild ' + _n + ' equals its authority (the retained prefix, the selection or the withdrawn predecessor)',
        'eq', (lambda pres, auth: lambda w, m: EQ(pres(w), auth(w)))(_pres, _auth), gates=('rb_ok',), witnesses=RB_W[_n])
row(RB, 'rebuild', 'rebuild_publication_new', 'publication_join', '/proposed/publication_id',
    'the rebuilt publication ID is new: neither the withdrawn one nor a retired one', 'not_member',
    lambda w, m: {'presented': PV(w)['publication_id'],
                  'collection': [w['prior']['publication_id']] + [r['publication_id'] for r in w['prior']['retired_generations']]},
    gates=('rb_ok',), witnesses=[W('withdrawn publication reused', proposed=lambda v, c: dict(v, publication_id=c.get('prior_pub')))])


@derived
def cl_ok(w, m):
    return w['family'] in FAMILIES and checkpoint_ok(w['prior'], w['family']) and checkpoint_ok(PV(w), w['family'])


@derived
def cl_target(w, m):
    hits = [r for r in w['prior']['retired_generations'] if r['publication_id'] == w['target']]
    return hits[0] if len(hits) == 1 else None


@derived
def cl_times(w, m):
    return (m.get('cl_target') is not None and reason_of(date_time, w['now']) is None)


row(CL, 'cleanup', 'cleanup_values_valid', 'checkpoint_schema', '/prior',
    'the predecessor and the cleaned value pass their slots, encoding and full owner schema', 'true',
    lambda w, m: V(m.get('cl_ok')),
    witnesses=[W('cleaned value malformed', proposed=lambda v, c: dict(v, extra='x'))])
row(CL, 'cleanup', 'cleanup_target_retired', 'cleanup_target', '/target',
    'only one retired generation is removed, never the current value', 'true',
    lambda w, m: V(m.get('cl_target') is not None), gates=('cl_ok',),
    witnesses=[W('target is the current publication', target=lambda t, c: 'pub-' + FAM[c['family']]['slug'].replace('_', '-') + '-r2')])
row(CL, 'cleanup', 'cleanup_not_held', 'hold_active', '/target/hold_refs',
    'a held retired generation is never removed', 'empty', lambda w, m: V(m.get('cl_target')['hold_refs']),
    gates=('cl_ok',), when=lambda w, m: m.get('cl_target') is not None,
    witnesses=[W('held retired generation', prior=lambda v, c: (v['retired_generations'][0].update(hold_refs=['hold:legal']), v)[1])])
row(CL, 'cleanup', 'cleanup_now_time', 'timestamp_invalid', '/now',
    'the cleanup time passes the shared date_time predicate', 'none', lambda w, m: V(reason_of(date_time, w['now'])),
    gates=('cl_ok',), when=lambda w, m: m.get('cl_target') is not None,
    witnesses=[W('zoneless cleanup time', now=lambda n, c: '2026-11-21T12:00:00')])
row(CL, 'cleanup', 'cleanup_window', 'retention_window', '/now',
    'removal waits 604800 seconds after the retired generation\'s first withdrawn_at_utc (RP-PROJECTION-3GEN)', 'true',
    lambda w, m: V(instant(w['now']) >= after_seconds(instant(m.get('cl_target')['withdrawn_at_utc']), RETENTION_WINDOW_SECONDS)),
    gates=('cl_ok', 'cl_times'),
    witnesses=[W('one second early', now=lambda n, c: '2026-11-21T11:59:59Z'),
               W('offset time one second early', now=lambda n, c: '2026-11-21T13:59:59+02:00')])
row(CL, 'cleanup_joins', 'cleanup_remaining', 'cleanup_join', '/proposed/retired_generations',
    'the cleaned value keeps every other retired generation exactly', 'eq',
    lambda w, m: EQ(PV(w)['retired_generations'], [r for r in w['prior']['retired_generations'] if r['publication_id'] != w['target']]),
    gates=('cl_ok', 'cl_times'),
    witnesses=[W('target kept', proposed=lambda v, c: dict(v, retired_generations=c['prior_value']['retired_generations']))])
row(CL, 'cleanup_joins', 'cleanup_current_unchanged', 'cleanup_join', '/proposed',
    'cleanup changes no current field other than the CAS fields', 'eq',
    lambda w, m: EQ({k: PV(w)[k] for k in WD_KEEP if k != 'retired_generations'} | {'state': PV(w)['state']},
                    {k: w['prior'][k] for k in WD_KEEP if k != 'retired_generations'} | {'state': w['prior']['state']}),
    gates=('cl_ok', 'cl_times'),
    witnesses=[W('cleanup rewrote the count', proposed=lambda v, c: dict(v, matched_count=v['matched_count'] + 1))])
row(CL, 'cleanup_joins', 'cleanup_revision', 'checkpoint_cas_conflict', '/proposed/publication_revision',
    'cleanup is one compare-and-swap: revision plus one', 'eq',
    lambda w, m: EQ(PV(w)['publication_revision'], w['prior']['publication_revision'] + 1), gates=('cl_ok', 'cl_times'),
    witnesses=[W('cleanup revision skips', proposed=lambda v, c: dict(v, publication_revision=v['publication_revision'] + 1))])
row(CL, 'cleanup_joins', 'cleanup_previous', 'checkpoint_cas_conflict', '/proposed/previous_checkpoint_sha256',
    'cleanup names the predecessor\'s binding hash', 'eq',
    lambda w, m: EQ(PV(w)['previous_checkpoint_sha256'], binding_hash(w['prior'])), gates=('cl_ok', 'cl_times'),
    witnesses=[W('cleanup predecessor stale', proposed=lambda v, c: dict(v, previous_checkpoint_sha256=_hex('stale')))])


# ---- Retained rows (SP-1101 sealed-receipt dispatch) -------------------------------------------------------------

T = 'retained'
RES = lambda m: m.get('retained')['reason']  # noqa: E731


@derived
def retained(w, m):
    return resolve_retained(w)


@derived
def frozen(w, m):
    seen = m.get('retained')['seen']
    return frozen_components(seen) if seen is not None else {}


@derived
def t_verified(w, m):
    """The dispatcher reached the frozen verifier (no earlier dispatch reason)."""
    return m.get('retained')['reason'] in (None, 'original_verification', 'current_disclosure') and m.get('retained')['seen'] is not None


def _sealed_set(field, value):
    def hook(s, c):
        s[0][field] = value(s[0][field]) if callable(value) else value
        return s
    return hook


def _repack(field, fn):
    """Change one value inside the sealed bytes and re-encode them, keeping every other sealed member as sealed."""
    def hook(s, c):
        decoded = decode_storage_value(bytes.fromhex(s[0][field]), profile=EVENT_VALUE)
        s[0][field] = storage_value_bytes(fn(decoded), profile=EVENT_VALUE).hex()
        return s
    return hook


DISPATCH_ROWS = (
    ('override', 'caller_recipe_override', 'a caller recipe override is refused',
     [W('caller override', world=lambda x, c: dict(x, recipe_override='browser@0'))]),
    ('query', 'original_query', 'the request names exactly one original',
     [W('request without transition ref', world=lambda x, c: (x['request_event']['payload'].pop('transition_receipt_ref'), x)[1])]),
    ('receipt_present', 'original_receipt_missing', 'a sealed receipt exists for this exact original',
     [W('no sealed receipt', sealed=lambda s, c: []),
      W('only another original\'s receipt', sealed=lambda s, c: [dict(s[0], original_ref='original:evt_browser_' + _hex('another'))])]),
    ('receipt_unique', 'original_receipt_ambiguous', 'exactly one sealed receipt exists for it',
     [W('two sealed receipts', sealed=lambda s, c: s + copy.deepcopy(s))]),
    ('receipt_wellformed', 'sealed_receipt_malformed', 'the sealed receipt is well formed',
     [W('missing record bytes', sealed=lambda s, c: [{k: v for k, v in s[0].items() if k != 'record_hex'}]),
      W('odd hex', sealed=_sealed_set('record_hex', lambda h: h + 'a')),
      W('recipe member wrong type', sealed=lambda s, c: (s[0]['recipe'].update(owner_edition=7), s)[1]),
      W('binding member wrong type', sealed=lambda s, c: (s[0]['binding'].update(server_id=7), s)[1]),
      W('recipe hash not hex', sealed=lambda s, c: (s[0]['recipe'].update(resource_manifest_sha256='zz'), s)[1])]),
    ('binding', 'original_binding', 'the sealed binding is the requested original\'s',
     [W('sealed for another storage instance', sealed=lambda s, c: (s[0]['binding'].update(storage_instance_id=OTHER_STORAGE_INSTANCE_ID), s)[1]),
      W('sealed owner operation differs', sealed=lambda s, c: (s[0]['binding'].update(owner_operation_id='receipt:other'), s)[1])]),
    ('recipe_known', 'recipe_unknown', 'the sealed recipe is an installed frozen recipe',
     [W('unknown recipe edition', sealed=lambda s, c: (s[0]['recipe'].update(owner_edition='browser-program-prepared-v0'), s)[1]),
      W('frozen map not installed', world=lambda x, c: dict(x, frozen_map='current_gated') if False else dict(x, frozen_map='installed', sealed_store=[dict(x['sealed_store'][0], recipe=dict(x['sealed_store'][0]['recipe'], identity_recipe='browser-guess-v0'))]))]),
    ('disclosure', 'current_disclosure', 'current access, deletion and withdrawal permit disclosure',
     [W('access revoked', world=lambda x, c: dict(x, disclosure_allowed=False))]),
)
for _n, _reason, _words, _wit in DISPATCH_ROWS:
    row(T, 'retained_dispatch', 'retained_' + _n, _reason, '/sealed_store', _words + ' (shared RetainedDispatcher)', 'ne',
        (lambda reason: lambda w, m: NE(RES(m), reason))(_reason), witnesses=_wit)
def _forged(**original_hooks):
    """A coherent forged original: built by the normal pipeline with one defect, its custody, sealed receipt and the
    request all derived from it, so only the frozen component that owns the defect fails."""
    return {'original_hooks': original_hooks}


def _sibling_recipe(record_too):
    def hook(s, c):
        sib = other_family(c['family'])
        r = recipe_tuple(sib)
        s[0]['recipe'] = {f: getattr(r, f) for f in RECIPE_FIELDS}
        return s
    return hook


def _new_observed(s, c):
    record = decode_storage_value(bytes.fromhex(s[0]['record_hex']), profile=EVENT_VALUE)
    record['observed_at_utc'] = '2026-11-14T10:00:01.5Z'
    receipt = decode_storage_value(bytes.fromhex(s[0]['receipt_hex']), profile=EVENT_VALUE)
    receipt['original_event_value_commitment']['sha256'] = full_value_commitment(record)
    s[0]['record_hex'] = storage_value_bytes(record, profile=EVENT_VALUE).hex()
    s[0]['receipt_hex'] = storage_value_bytes(receipt, profile=EVENT_VALUE).hex()
    return s


FROZEN_ROWS = (
    ('decodes', 'the sealed record, result and receipt decode canonically',
     [W('record bytes decode to a boolean', sealed=_sealed_set('record_hex', 'c2')),
      W('noncanonical receipt bytes', sealed=_sealed_set('receipt_hex', lambda h: 'de' + '%04x' % int(h[1:2], 16) + h[2:]))]),
    ('envelope_schema', 'the sealed record passes the EventRecord owner schema',
     [W('forged original with an unknown member', **_forged(event=lambda e, c: dict(e, extra='x')))]),
    ('family', 'the sealed record is a prepared Browser Program family',
     [W('forged original of an admitted sibling type', **_forged(event=lambda e, c: dict(e, event_type='browser.workspace.created')))]),
    ('recipe_family', 'the sealed recipe names the record\'s payload schema',
     [W('sealed recipe of a sibling family', sealed=_sibling_recipe(False))]),
    ('observed_utc_z', 'the sealed observed_at_utc is storage_utc_z',
     [W('forged original observed +00:00', **_forged(meta=lambda mm, c: dict(mm, observed_at_utc='2026-11-14T10:00:01+00:00')))]),
    ('persisted_utc_z', 'the sealed persisted_at_utc is storage_utc_z',
     [W('forged original persisted lowercase z', **_forged(meta=lambda mm, c: dict(mm, persisted_at_utc='2026-11-14T10:00:02z')))]),
    ('source_commitment', 'the binding commitment is the shared full-value commitment of the sealed record',
     [W('sealed record and receipt rewritten under the old binding', sealed=_new_observed)]),
    ('result_event_id', 'the sealed result names the record',
     [W('result of another event', sealed=_repack('result_hex', lambda r: dict(r, event_id='evt_browser_' + _hex('x'))))]),
    ('receipt_schema', 'the sealed custody receipt passes custody_v2',
     [W('sealed receipt unknown member', sealed=_repack('receipt_hex', lambda r: dict(r, extra='x')))]),
    ('receipt_full_value', 'the sealed receipt commitment is the record\'s',
     [W('sealed receipt commitment forged', sealed=_repack('receipt_hex', lambda r: (r['original_event_value_commitment'].update(sha256=_hex('forged')), r)[1]))]),
    ('receipt_event_id', 'the sealed receipt names the record',
     [W('sealed receipt of another event', sealed=_repack('receipt_hex', lambda r: dict(r, event_id='evt_browser_' + _hex('y'))))]),
    ('payload_schema_id', 'the sealed record selects its family payload schema',
     [W('forged original naming a sibling payload, sibling recipe',
        sealed=_sibling_recipe(True),
        **_forged(event=lambda e, c: dict(e, payload_schema_id=FAM[other_family(c['family'])]['payload_schema_id'])))]),
    ('payload_schema', 'the sealed payload passes its closed owner schema',
     [W('forged original payload unknown member', **_forged(payload=lambda pl, c: dict(pl, extra='x')))]),
    ('identity', 'the sealed event_id recomputes from the identity tuple',
     [W('forged original event_id', **_forged(event=lambda e, c: dict(e, event_id='evt_browser_' + _hex('forged-id'))))]),
    ('key', 'the sealed idempotency_key recomputes',
     [W('forged original idempotency key', **_forged(event=lambda e, c: dict(e, idempotency_key='browser@1:' + _hex('forged-key'))))]),
    ('receipt_semantic', 'the sealed receipt digest is the record\'s producer-semantic digest',
     [W('sealed receipt digest forged', sealed=_repack('receipt_hex', lambda r: dict(r, producer_semantic_digest=_hex('forged-digest'))))]),
)
for _i, (_n, _words, _wit) in enumerate(FROZEN_ROWS):
    row(T, 'retained_frozen_%d' % (1 + _i // 6), 'retained_frozen_' + _n, 'original_verification', '/sealed_store',
        'frozen browser@1 verifier: ' + _words, 'true',
        (lambda n: lambda w, m: V(component_holds(n, m.get('frozen')[n])))(_n), gates=('t_verified',),
        when=(lambda n: lambda w, m: n in m.get('frozen'))(_n), witnesses=_wit)
row(T, 'retained_effects', 'retained_no_receipt_creation', 'retained_store_mutated', '/sealed_store',
    'reading creates no receipt and leaves the sealed store byte-identical (store snapshot before and after)', 'eq',
    lambda w, m: EQ(m.get('retained')['store_after'], m.get('retained')['store_before']),
    witnesses=[W('owner logs an access receipt', world=lambda x, c: dict(x, owner_impl='access_logging'))])
row(T, 'retained_effects', 'retained_no_current_gate', 'retained_current_gate', '/frozen_map',
    'the retained read never calls the current writer gate (instrumented shared current_append_policy)', 'eq',
    lambda w, m: EQ(m.get('retained')['gate_calls'], 0),
    witnesses=[W('verifier runs the writer gate', world=lambda x, c: dict(x, frozen_map='current_gated'))])
HANDLED_REASONS = sorted({r for _n, r, _w, _x in DISPATCH_ROWS} | {'original_verification'})
row(T, 'entailed_retained_resolved', 'retained_resolved', 'retained_unavailable', '/sealed_store',
    'any other dispatcher reason refuses (catch-all)', 'handled',
    lambda w, m: {'presented': RES(m), 'handled': HANDLED_REASONS})


# ---- Tables and the refusal path ---------------------------------------------------------------------------------

def build_tables():
    order, rows = [], {}
    for r in ROWS:
        if r['table'] not in rows:
            order.append(r['table'])
            rows[r['table']] = []
        rows[r['table']].append(r)
    for t, rs in rows.items():
        assert len(rs) <= MAX_ROWS_PER_TABLE, (t, len(rs))
        assert len({r['boundary'] for r in rs}) == 1, t
        if t.startswith('entailed_'):
            assert len(rs) == 1, t
    return tuple(order), rows


TABLES, TABLE_ROWS = build_tables()
ROW_TABLE = {r['id']: r['table'] for r in ROWS}
ENTAILED_TABLES = frozenset(t for t in TABLES if t.startswith('entailed_'))
_MODULES = {}


def table_module(table):
    if table not in _MODULES:
        import importlib
        _MODULES[table] = importlib.import_module(TABLE_PREFIX + table)
    return _MODULES[table]


def project_table(table, world, memo):
    return {r['id']: record_for(r, world, memo) for r in TABLE_ROWS[table]}


def evaluate(world, boundary, memo=None):
    """The checker's result for one boundary: the refusals the generated table predicates return, in table order.
    Nothing else refuses. Also returns each table's projected inputs (what the gated tool is given)."""
    memo = memo or Memo(world, boundary)
    refusals, values = [], {}
    for table in TABLES:
        if TABLE_ROWS[table][0]['boundary'] != boundary:
            continue
        value = project_table(table, world, memo)
        values[table] = value
        module = table_module(table)
        for name in module.FIELDS:
            reason = getattr(module, name)(value, None)
            if reason is not None:
                refusals.append((name, reason))
    return refusals, values


# ---- Entailment proofs -------------------------------------------------------------------------------------------

def _resolve(node, res):
    while isinstance(node, dict) and '$ref' in node:
        r = res.lookup(node['$ref'])
        node, res = r.contents, r.resolver
    return node, res


def json_overhead_bound(node, res):
    """An upper bound of len(JSON) - len(canonical MessagePack) over every value the schema node accepts: a closed
    object/array/scalar walk. Strings must forbid every character JSON escapes; otherwise the bound is None."""
    node, res = _resolve(node, res)
    if not isinstance(node, dict):
        return None
    if 'const' in node:
        v = node['const']
        return 4 if type(v) is bool else (3 if v is None else (21 if type(v) is int else (2 if type(v) is str else None)))
    if 'enum' in node:
        return 2 if all(type(v) is str and v.isascii() and '"' not in v and '\\' not in v for v in node['enum']) else None
    branches = [b for k in ('anyOf', 'oneOf') for b in node.get(k, [])]
    if branches:
        parts = [json_overhead_bound(b, res) for b in branches]
        own = {k: v for k, v in node.items() if k not in ('anyOf', 'oneOf', 'allOf', 'description', 'not')}
        if own:
            parts.append(json_overhead_bound(own, res))
        return None if None in parts else max(parts)
    if 'allOf' in node and node.get('type') is None and 'properties' not in node:
        parts = [json_overhead_bound(b, res) for b in node['allOf']]
        return None if None in parts else min(parts)
    t = node.get('type')
    if t == 'object' or 'properties' in node:
        props = dict(node.get('properties', {}))
        for sub in node.get('allOf', []):
            s2, r2 = _resolve(sub, res)
            for k, v in s2.get('properties', {}).items():
                props.setdefault(k, v)
        total = 2 + len(props)
        for k, v in props.items():
            b = json_overhead_bound(v, res)
            if b is None:
                return None
            total += 2 + b
        return total
    if t == 'array':
        items, _r = _resolve(node.get('items'), res)
        cap = node.get('maxItems')
        if cap is None and node.get('uniqueItems') is True and isinstance(items, dict) and 'enum' in items:
            cap = len(items['enum'])
        if cap is None:
            return None
        b = json_overhead_bound(node['items'], res)
        return None if b is None else 2 + cap * (b + 1)
    if t == 'integer':
        return 21
    if t == 'boolean':
        return 4
    if t == 'null':
        return 3
    if t == 'string':
        return 2 if _escape_free(node.get('pattern')) or node.get('format') == 'date-time' else None
    if isinstance(t, list):
        parts = [json_overhead_bound(dict(node, type=x), res) for x in t]
        return None if None in parts else max(parts)
    return None


def _escape_free(pattern):
    """True when every string the anchored pattern matches uses only characters JSON never escapes: no negated
    class, no escape other than an escaped dot, and literal characters from a safe ASCII set."""
    if type(pattern) is not str or not pattern.startswith('^'):
        return False
    body = pattern[1:]
    if body.endswith('(?![\\s\\S])'):
        body = body[:-len('(?![\\s\\S])')]
    if '[^' in body or body.replace('\\.', '').count('\\'):
        return False
    return all(ch.isascii() and (ch.isalnum() or ch in '._:/#~@-[]{}()*+?,|$') for ch in body.replace('\\.', '.'))


@functools.lru_cache(maxsize=None)
def json_budget_bound(family):
    res = REGISTRY.resolver(base_uri=PAYLOADS_ID)
    return json_overhead_bound(PAYLOADS['$defs'][FAM[family]['payload_def']], res)


entailed('append_json_budget', ('append_inline_limit', 'append_payload_schema'),
         'A payload this row judges passed append_payload_schema (gate pay_dict and table order) and its canonical '
         'MessagePack map is at most 16384 bytes (the row applies only then, and append_inline_limit refuses every larger '
         'one). For every family, json_budget_bound(family) (scripts/pm_s4b_browser_events.py) walks the closed '
         'payload schema and bounds len(JSON) - len(MessagePack) per accepted value: +2 per string (two quotes; every '
         'string grammar admits only ASCII characters JSON does not escape), +21 per integer, +4 per boolean, +3 per '
         'null, +2 per key, separators and brackets, arrays by maxItems. main() checks every family\'s bound is finite '
         'and 16384 + bound <= 65536 (reported as json_budget_bounds), so no payload reaching this row exceeds 65536 '
         'UTF-8 JSON bytes.')
entailed('retained_resolved', tuple(r[0] for r in []) + ('retained_override', 'retained_query', 'retained_receipt_present',
         'retained_receipt_unique', 'retained_receipt_wellformed', 'retained_binding', 'retained_recipe_known',
         'retained_disclosure', 'retained_no_current_gate') + tuple('retained_frozen_' + n for n, _w, _x in FROZEN_ROWS),
         'RetainedDispatcher.resolve (scripts/pm_event_numbers.py:523-545) refuses itself only with '
         'caller_recipe_override, original_query, original_authority, original_binding, recipe_selection, recipe_unknown, '
         'original_bytes_type, original_verification or current_disclosure; any other reason is raised by the owner or '
         'the frozen verifier. SealedReceiptOwner.authenticated_original raises only original_receipt_missing and '
         'original_receipt_ambiguous, then _custody_from_sealed, which refuses sealed_receipt_malformed unless the row has '
         'exactly SEALED_KEYS, BINDING_FIELDS and RECIPE_FIELDS and three even-length lowercase-hex strings, and re-raises '
         'the shared constructors\' own refusals (RecipeTuple: recipe_tuple, recipe_resource_hash; OriginalBinding: '
         'original_binding, original_scope; scripts/pm_event_numbers.py:442-485) as sealed_receipt_malformed. It returns '
         'an OriginalCustody of an OriginalBinding, a RecipeTuple and three bytes values, so original_authority, '
         'recipe_selection and original_bytes_type cannot occur. retained_request returns an OriginalBinding or None, '
         'and None is refused as original_query. _frozen_verify is the conjunction of frozen_components, which raises no '
         'Refusal (decoding and digest refusals are caught; identity runs only on a schema-valid payload). The '
         'negative-only current_gated verifier may raise the current writer gate\'s reason; it calls the instrumented '
         'gate whenever it runs, so retained_no_current_gate refuses first. Every remaining reason has its own '
         'dispatch row, and original_verification is refused exactly when a retained_frozen row refuses.')


# ---- Controls (positives) ----------------------------------------------------------------------------------------

def _artifact_control(s, c):
    s['payload']['artifact_refs'] = ['artifact:%03d' % i + 'y' * 380 for i in range(30)]
    return s


CONTROL_SPECS = (
    ('append', 'append', 'base', {}),
    ('append-linked', 'append', 'linked', {}),
    ('append-artifacts', 'append', 'base', {'source': _artifact_control}),
    ('append-uncertain', 'append', 'base', {'store': lambda s, c: dict(s, issuance='unknown'),
                                            'case': lambda x, c: dict(x, reported_outcome='unresolved')}),
    ('retry', 'retry', 'base', {}),
    ('retry-linked', 'retry', 'linked', {}),
    ('derived', 'derived', 'base', {}),
    ('derived-empty', 'derived', 'empty', {}),
    ('derived-held', 'derived', 'held', {}),
    ('derived-retired', 'derived', 'retired', {}),
    ('read', 'read', 'base', {}),
    ('withdrawal', 'withdrawal', 'base', {}),
    ('rebuild', 'rebuild', 'base', {}),
    ('rebuild-retired', 'rebuild', 'retired', {}),
    ('cleanup', 'cleanup', 'base', {}),
    ('cleanup-offset-time', 'cleanup', 'base', {'now': lambda n, c: '2026-11-21T14:00:00+02:00'}),
    ('retained', 'retained', 'base', {}),
    ('retained-live', 'retained', 'live', {}),
    ('retained-replay-only', 'retained', 'replay_only', {}),
    ('retained-linked', 'retained', 'linked', {}),
)


def build_controls(families=FAMILIES):
    out = []
    for family in families:
        for name, boundary, variant, hooks in CONTROL_SPECS:
            out.append(('%s:%s' % (name, family), boundary, BUILD[boundary](family, variant, hooks)))
    return out


# ---- Generated witnesses: schema walks and family-predicate search ------------------------------------------------

def _leaves(value, path=()):
    yield path, value
    if type(value) is dict:
        for k, v in value.items():
            yield from _leaves(v, path + (k,))
    elif type(value) is list:
        for i, v in enumerate(value):
            yield from _leaves(v, path + (i,))


def _variants(v):
    if type(v) is str:
        return [('trailing LF', v + '\n'), ('empty string', ''), ('overlong', 'x' * 600), ('integer type', 5),
                ('null', None), ('boolean type', True), ('protected-auth text', v + 'AuthBrowserSession'),
                ('space', v + ' ')]
    if type(v) is bool:
        return [('string boolean', 'true' if v else 'false'), ('integer', 1 if v else 0), ('null', None)]
    if type(v) is int:
        return [('negative', -1), ('string number', str(v)), ('null', None)]
    if v is None:
        return [('integer', 5), ('boolean', True), ('object', {}), ('array', [])]
    if type(v) is list:
        out = [('string type', 'x'), ('object type', {})]
        if v:
            out.append(('duplicate item', v + [v[0]]))
            out.append(('wrong item type', [5] + v[1:]))
        return out
    if type(v) is dict:
        out = [('unknown member', dict(v, unexpected_member='x')), ('array type', [])]
        if v:
            k = sorted(v)[0]
            out.append(('missing ' + k, {x: y for x, y in v.items() if x != k}))
        return out
    return []


def _set_at(root, path, value):
    if not path:
        return value
    node = root
    for part in path[:-1]:
        node = node[part]
    node[path[-1]] = value
    return root


def schema_walk(family, subject):
    """Single-value schema defects at every leaf of the family's valid payload ('payload' stage) or proposed
    checkpoint ('proposed' stage). Only those whose sole refusal is the owner-schema row are credited."""
    if subject == 'payload':
        base, stage, boundary = base_payload(family), 'payload', 'append'
    else:
        base, stage, boundary = build_derived(family)['proposed'], 'proposed', 'derived'
    out = []
    for path, v in _leaves(base):
        for label, new in _variants(v):
            out.append(('%s at /%s' % (label, '/'.join(map(str, path))),
                        {stage: (lambda p, n: lambda val, c: _set_at(val, p, copy.deepcopy(n)))(path, new)}))
    return out, boundary


def _pmut(fn):
    """A family-predicate defect: the committed owner transition itself carries it, so the payload copies it and every
    payload-to-source join still holds; only the predicate row should refuse."""
    def hook(s, c):
        fn(s['payload'])
        return s
    return {'source': hook}


def _fx_set(**kv):
    return lambda p: p['facts'].update(**kv)


def predicate_candidates(pid):
    c = {
        'run_attempt_paired': [lambda p: p['context'].update(run_id='run-only', attempt_id=None),
                               lambda p: p['context'].update(run_id=None, attempt_id='attempt-only'),
                               lambda p: p['context'].update(attempt_id=None), lambda p: p['context'].update(run_id=None)],
        'session_workspace_paired': [lambda p: p['context'].update(browser_session_id='session-only', browser_workspace_id=None),
                                     lambda p: p['context'].update(browser_session_id=None),
                                     lambda p: p['context'].update(browser_workspace_id=None, browser_page_id=None, page_generation=None)],
        'page_generation_paired': [lambda p: p['context'].update(page_generation=None),
                                   lambda p: p['context'].update(browser_page_id=None),
                                   lambda p: p['context'].update(browser_page_id='page-only', page_generation=None, browser_session_id='s', browser_workspace_id='w')],
        'page_has_workspace': [lambda p: p['context'].update(browser_workspace_id=None, browser_session_id=None),
                               lambda p: p['context'].update(browser_page_id='page-x', page_generation=3, browser_workspace_id=None, browser_session_id=None)],
        'prior_generation_present': [_fx_set(prior_page_generation=None)],
        'generation_advances': [lambda p: p['facts'].update(prior_page_generation=p['context']['page_generation'])],
        'generation_not_regressed': [lambda p: p['facts'].update(prior_page_generation=p['context']['page_generation'] + 1)],
        'representation_base_generation': [lambda p: p['facts'].update(base_page_generation=p['facts']['base_page_generation'] + 1)],
        'representation_not_self_base': [lambda p: p['facts'].update(base_representation_id=p['facts']['representation_id'])],
        'coverage_bounds': [lambda p: p['facts']['coverage'].update(status='partial', frames_covered=p['facts']['coverage']['frames_total'] + 1),
                            lambda p: p['facts']['coverage'].update(status='stale_rejected', frames_covered=p['facts']['coverage']['frames_total'] + 1)],
        'complete_frames': [lambda p: p['facts']['coverage'].update(status='complete', frames_total=2, frames_covered=1)],
        'complete_no_omissions': [lambda p: p['facts']['coverage'].update(status='complete', omission_codes=['frame_timeout'])],
        'complete_budget': [lambda p: p['facts']['coverage'].update(status='complete', budget_exhausted=True)],
        'complete_no_collisions': [lambda p: p['facts']['coverage'].update(status='complete', synthetic_id_collisions=1)],
        'invalidation_matches': [lambda p: p['facts']['coverage'].update(status='stale_rejected'),
                                 lambda p: p['facts']['coverage'].update(status='partial')],
        'lease_generation_not_regressed': [lambda p: p['facts']['old_fence'].update(lease_generation=p['facts']['new_fence']['lease_generation'] + 1)],
        'lease_epoch_not_regressed': [lambda p: p['facts']['old_fence'].update(lease_epoch=p['facts']['new_fence']['lease_epoch'] + 1)],
        'last_sequence_not_regressed': [lambda p: p['facts']['old_fence'].update(last_sequence=p['facts']['new_fence']['last_sequence'] + 1)],
        'new_fence_page_generation': [lambda p: p['facts']['new_fence'].update(page_generation=p['facts']['new_fence']['page_generation'] + 1)],
        'old_fence_page_generation': [lambda p: p['facts']['old_fence'].update(page_generation=p['facts']['old_fence']['page_generation'] + 1)],
        'renew_identity': [lambda p: p['facts']['new_fence'].update(holder_id='holder-other')],
        'takeover_epoch_advances': [lambda p: p['facts']['new_fence'].update(lease_epoch=p['facts']['old_fence']['lease_epoch'])],
        'takeover_holder_changes': [lambda p: p['facts']['new_fence'].update(holder_id=p['facts']['old_fence']['holder_id'])],
        'takeover_request_identity': [lambda p: p['facts']['new_fence'].update(holder_id='holder-requester')],
        'workspace_revision_not_regressed': [lambda p: p['facts'].update(expected_workspace_revision=p['facts']['result_workspace_revision'] + 1)],
        'checkpoint_ref_present': [_fx_set(checkpoint_ref=None)],
        'no_action_overlap': [lambda p: p['facts'].update(effect_state='effect_unknown', retry_allowed=False,
                                                          unknown_effect_action_ids=list(p['facts']['completed_action_ids'][:1]) or ['action-x'],
                                                          completed_action_ids=list(p['facts']['completed_action_ids'][:1]) or ['action-x']),
                              _fx_set(effect_state='effect_unknown', retry_allowed=False, unknown_effect_action_ids=['action-x'],
                                      completed_action_ids=['action-x'], terminal_state='timed_out_effect_state_unknown')],
        'unknown_state_no_retry': [_fx_set(effect_state='effect_unknown', retry_allowed=True, unknown_effect_action_ids=[]),
                                   _fx_set(effect_state='effect_unknown', retry_allowed=True, unknown_effect_action_ids=[],
                                           terminal_state='timed_out_effect_state_unknown')],
        'unknown_actions_no_retry': [_fx_set(retry_allowed=True, unknown_effect_action_ids=['action-unknown'], effect_state='effect_unknown'),
                                     _fx_set(retry_allowed=True, unknown_effect_action_ids=['action-unknown'], effect_state='effects_reconciled')],
        'no_effect_no_unknown': [_fx_set(effect_state='no_effect', unknown_effect_action_ids=['action-unknown'], completed_action_ids=[], retry_allowed=False)],
        'no_effect_no_completed': [_fx_set(effect_state='no_effect', completed_action_ids=['action-done'], unknown_effect_action_ids=[])],
        'failed_no_effect_state': [_fx_set(terminal_state='failed_no_effect', effect_state='effects_reconciled')],
        'timed_out_unknown_state': [_fx_set(terminal_state='timed_out_effect_state_unknown', effect_state='effects_reconciled', retry_allowed=False)],
        'terminal_no_unknown_actions': [_fx_set(unknown_effect_action_ids=['action-unknown'], retry_allowed=False, effect_state='effects_reconciled'),
                                        _fx_set(unknown_effect_action_ids=['action-unknown'], retry_allowed=False, effect_state='effects_reconciled',
                                                terminal_state='failed_effects_reconciled')],
        'terminal_known_state': [_fx_set(effect_state='effect_unknown', retry_allowed=False, unknown_effect_action_ids=[]),
                                 _fx_set(effect_state='effect_unknown', retry_allowed=False, unknown_effect_action_ids=[],
                                         terminal_state='failed_effects_reconciled')],
        'screenshot_artifact': [_fx_set(screenshot_artifact_ref=None)],
        'handoff_source_fenced': [_fx_set(source_fenced=False)],
        'handoff_no_unknown_effects': [_fx_set(unknown_effects=True)],
    }[pid]
    return [('%s candidate %d' % (pid, i + 1), _pmut(fn)) for i, fn in enumerate(c)]


def witness_list(r, family):
    """(label, boundary, variant, hooks, generated) for every witness of row r in this family."""
    out = []
    for w in r['witnesses']:
        if w[0] == 'per_family':
            items, gen = w[1](family), False
        elif w[0] == 'schema_walk':
            items, _b = schema_walk(family, w[1])
            gen = True
        elif w[0] == 'predicate_search':
            items, gen = predicate_candidates(w[1]), True
        else:
            items, gen = [w], False
        for label, hooks in items:
            hooks = dict(hooks)
            variant = hooks.pop('variant', 'base')
            out.append((label, r['boundary'], variant, hooks, gen))
    return out


def build_negatives(families=FAMILIES):
    """Every row's witnesses in every family it applies to. An explicit witness must be refused by exactly its row;
    a generated one is credited only then. Returns (negatives, findings, coverage)."""
    negatives, findings = [], []
    coverage = {}
    for r in ROWS:
        if r['id'] in ENTAILED:
            continue
        for family in (r['families'] or FAMILIES):
            if family not in families:
                continue
            credited = 0
            discarded = []
            for label, boundary, variant, hooks, gen in witness_list(r, family):
                try:
                    world = BUILD[boundary](family, variant, hooks)
                except (KeyError, IndexError, TypeError, AttributeError, ValueError, Refusal) as error:
                    if not gen:
                        findings.append({'row': r['id'], 'family': family, 'witness': label, 'build_error': repr(error)[:200]})
                    continue
                refusals, _v = evaluate(world, boundary)
                want = [(r['id'], r['code'])]
                if refusals == want:
                    credited += 1
                    negatives.append({'row': r['id'], 'family': family, 'defect': label, 'boundary': boundary,
                                      'case': world, 'generated': gen})
                elif not refusals:
                    if not (gen and label.startswith(r['id'].replace('append_pred_', '') + ' candidate')):
                        findings.append({'row': r['id'], 'family': family, 'witness': label, 'accepted': True})
                elif not gen:
                    findings.append({'row': r['id'], 'family': family, 'witness': label, 'refusals': refusals[:4]})
                else:
                    discarded.append(refusals[0][0])
            coverage[(r['id'], family)] = {'credited': credited, 'discarded_first_rows': sorted(set(discarded))}
    return negatives, findings, coverage


# ---- Cross-checks ------------------------------------------------------------------------------------------------

def predicate_agreement(world, m):
    """On every append case whose payload the owner schema accepts, this lane's failing family-predicate rows equal
    the shared Browser owner validator's own semantic refusals (GSxx), exactly."""
    if not m.get('pay_ok'):
        return None
    code_of = owner_gs_codes()
    mine = sorted({code_of[GS_OF[pid]] for pid in FAMILY_PREDICATES[world['family']] if not PREDICATES[pid](P(world))})
    owner = sorted(set(owner_semantic_codes(P(world))))
    return None if mine == owner else {'mine': mine, 'owner': owner}


@functools.lru_cache(maxsize=1)
def owner_gs_codes():
    """GSxx -> the shared Browser owner validator's refusal code for that row (its own table, scripts/pm_ds_tables)."""
    owner_gate()
    import pm_ds_tables
    return {row.split('_', 1)[0]: code for row, _pred, code in pm_ds_tables.table('gate_semantic')[1]}


def frozen_agreement(world, m):
    """Once the shared dispatcher reaches the frozen verifier, it refuses original_verification exactly when a
    retained_frozen row refuses (the verifier it ran is observed in both directions)."""
    if not m.get('t_verified'):
        return None
    any_frozen = not all(component_holds(n, v) for n, v in m.get('frozen').items())
    reason = m.get('retained')['reason']
    return None if (reason == 'original_verification') == any_frozen else {'reason': reason, 'frozen_fails': any_frozen}


TIMESTAMP_FIELDS = (
    ('EventRecord', 'occurred_at_utc', 'event_record', 'append_envelope_schema (format); copy append_copy_occurred'),
    ('EventRecord', 'observed_at_utc', 'event_record + storage_utc_z', 'append_envelope_schema; append_observed_utc_z; append_storage_observed; retained_frozen_observed_utc_z'),
    ('EventRecord', 'persisted_at_utc', 'event_record + storage_utc_z', 'append_envelope_schema; append_persisted_utc_z; append_storage_persisted; retained_frozen_persisted_utc_z'),
    ('custody_v2', 'first_append_receipt/acknowledged_at_utc', 'event_record (E5-2)', 'append_custody_schema (format); append_receipt_acknowledged'),
    ('checkpoint', 'withdrawn_at_utc', 'event_record', 'derived_value_schema / withdrawal_value_valid / rebuild_value_valid / read_checkpoint_valid; withdrawal_withdrawn'),
    ('checkpoint', 'retired_generations/*/withdrawn_at_utc', 'event_record', 'checkpoint schema rows; rebuild_retired_head; cleanup_window (instant)'),
    ('cleanup', 'now', 'event_record', 'cleanup_now_time; cleanup_window (shared instant/after_seconds)'),
)


def timestamp_inventory():
    """Every format: date-time location in the subjects this lane validates; the checker fails on any difference
    from TIMESTAMP_FIELDS."""
    found = set()

    def walk(node, path, res):
        node, res = _resolve(node, res)
        if not isinstance(node, dict):
            return
        if node.get('format') == 'date-time':
            found.add(path)
            return
        for k, v in node.get('properties', {}).items():
            walk(v, path + (k,), res)
        for key in ('anyOf', 'oneOf', 'allOf'):
            for v in node.get(key, []):
                walk(v, path, res)
        if 'items' in node:
            walk(node['items'], path + ('*',), res)
    walk(EVENT_RECORD_SCHEMA, ('EventRecord',), REGISTRY.resolver(base_uri=EVENT_RECORD_ID))
    walk(RECEIPT_SCHEMA['$defs']['custody_v2'], ('custody_v2',), REGISTRY.resolver(base_uri=RECEIPT_ID))
    for f in FAMILIES:
        walk(PAYLOADS['$defs'][FAM[f]['payload_def']], ('payload',), REGISTRY.resolver(base_uri=PAYLOADS_ID))
        walk(CHECKPOINTS['$defs'][FAM[f]['slug'] + '_index_checkpoint'], ('checkpoint',), REGISTRY.resolver(base_uri=CHECKPOINTS_ID))
    documented = {(s,) + tuple(fld.split('/')) for s, fld, _p, _r in TIMESTAMP_FIELDS if s != 'cleanup'}
    return sorted(found), sorted(documented ^ found)


def spec_consistency():
    """Each family's authored identifiers appear in its own owner text, registry row and admission row."""
    problems = []
    s15 = (ROOT / 'Plans/Section15_MVP_Promoted_Features_Spec.md').read_text()
    cv = (ROOT / 'Plans/Contracts_V0.md').read_text()
    sp = (ROOT / 'Plans/storage-plan.md').read_text()
    reg = {x['family_id']: x for x in json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())['families']}

    def unit_text(doc, uid):
        start = doc.index('### ' + uid + ' - ')
        end = doc.index('\n### ', start + 5)
        return doc[start:end]
    for f in FAMILIES:
        spec = FAM[f]
        anchor = '<a id="' + spec['semantic_anchor'] + '"></a>'
        if s15.count(anchor) != 1:
            problems.append((f, 'section15_anchor'))
        else:
            sec = s15[s15.index(anchor):s15.index('\n<a id=', s15.index(anchor) + 5) if '\n<a id=' in s15[s15.index(anchor) + 5:] else len(s15)]
            for token in (spec['producer_component'], spec['publication_operation'], spec['consumer_id'],
                          spec['checkpoint_family_id'], spec['cv_unit'], spec['sp_unit'], spec['retention_policy']):
                if token not in sec:
                    problems.append((f, 'section15', token))
        cvt = unit_text(cv, spec['cv_unit'])
        for token in (f, spec['payload_schema_id'], 'evt_browser_', 'browser@1:', 'dedupe_by_idempotency_key',
                      'projector_replay_only', 'payload_inline_limit'):
            if token not in cvt:
                problems.append((f, spec['cv_unit'], token))
        spt = unit_text(sp, spec['sp_unit'])
        for token in (f, spec['checkpoint_family_id'], spec['checkpoint_key_shape'], spec['checkpoint_schema_ref'],
                      spec['index_writer_id'], spec['consumer_id'], 'RP-PROJECTION-3GEN', spec['retention_policy'],
                      'original_receipt_missing', 'family_withdrawn', 'checkpoint_cas_conflict'):
            if token not in spt:
                problems.append((f, spec['sp_unit'], token))
        row_ = reg.get(spec['checkpoint_family_id'])
        if (row_ is None or row_['key_shape'] != spec['checkpoint_key_shape'] or row_['consumers'] != [spec['consumer_id']]
                or row_['producer'] != [spec['index_writer_id']] or row_['value_schema_ref'] != spec['checkpoint_schema_ref']
                or row_['retention_policy_ref'] != 'RP-PROJECTION-3GEN'):
            problems.append((f, 'storage_registry_row'))
        arow = ADMISSION['rows'][spec['admission_row_index']]
        if (arow['event_type'] != f or arow['admission_status'] != 'prepared_not_admitted'
                or arow['semantic_owner_ref'] != 'Plans/Section15_MVP_Promoted_Features_Spec.md#' + spec['semantic_anchor']
                or 'Plans/storage-plan.md#' + spec['sp_unit'] not in arow['consumer_contract_refs']
                or arow['retention_policy_ref']['policy_id'] + '@' + arow['retention_policy_ref']['policy_version'] != spec['retention_policy']):
            problems.append((f, 'admission_row'))
    return problems


# ---- Shared number corpus through the complete append route ----------------------------------------------------

def corpus_tokens():
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    raws = []
    for case in corpus['cases']:
        if case.get('date_time_profile'):
            continue
        op = case.get('op')
        if op in ('token', 'parse', 'parse_token', 'slot') and type(case.get('raw')) is str:
            raws.append(case['raw'])
        if op == 'json_number' and type(case.get('token')) is str:
            raws.append(case['token'])
        if op in ('integer', 'uint64') and type(case.get('value')) is dict and '@int' in case['value']:
            raws.append(case['value']['@int'])
    long = '1' + '0' * 4399
    raws += [long, '-' + long, str(UINT64_MAX), str(1 << 64), str((1 << 53) + 1)]
    return list(dict.fromkeys(raws))


def _load_with(text_obj, placeholder, token):
    from pm_event_numbers import loads_current_json
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        text = json.dumps(text_obj).replace('"' + placeholder + '"', token)
    finally:
        sys.set_int_max_str_digits(previous)
    return loads_current_json(text)


def corpus_checks(families=FAMILIES):
    """Every shared number spelling enters through loads_current_json at (a) Storage's sequence slot (the event and
    Storage's record) and (b) the transition's producer_sequence_id, and runs the complete append route. The
    expectation is composed from the shared helpers alone; any disagreement fails the run."""
    from pm_event_numbers import loads_current_json
    tokens = corpus_tokens()
    totals = {'accepted': 0, 'refused': 0, 'load_refused': 0}
    disagreements = []
    jcs_ok = lambda v: reason_of(qualified_jcs, {'n': v}, type_sensitive_paths={('n',)}) is None  # noqa: E731
    for family in families:
        for slot in ('sequence', 'producer_sequence'):
            for token in tokens:
                try:
                    value = loads_current_json(token)
                    loaded_ok = True
                except Refusal:
                    loaded_ok, value = False, None
                if slot == 'sequence':
                    expected = loaded_ok and reason_of(storage_uint64, value) is None
                else:
                    expected = (loaded_ok and reason_of(current_integer, value, minimum=0) is None
                                and physical_reason(value) is None and jcs_ok(value))
                if not loaded_ok:
                    totals['load_refused'] += 1
                    if expected:
                        disagreements.append((family, slot, token[:40], 'load_refused'))
                    continue
                # The loaded value enters the complete pipeline at its slot; every later value is derived from it.
                if slot == 'sequence':
                    probe = build_case(family, hooks={'meta': lambda mm, c, v=value: dict(mm, sequence_id=v)})
                else:
                    probe = build_case(family, hooks={'source': lambda s, c, v=value: dict(s, transition_sequence=v)})
                actual = evaluate(probe, 'append')[0] == []
                if actual != expected:
                    disagreements.append((family, slot, token[:40], actual))
                totals['accepted' if actual else 'refused'] += 1
    return totals, len(tokens), disagreements


def oracle_self_check():
    """Standing check 8: the comparison flags an accepted negative, a refused positive and a wrong refusing row."""
    want = [('row_a', 'code_a')]
    return (want != [] and [('row_b', 'code_b')] != want and [] != want and [('row_a', 'code_a')] == want)


# ---- Known-answer checks: the authorities the builders and the rows share are pinned independently --------------

def known_answer_checks():
    """The builders and the rows share identity(), scan(), binding_hash() and partition_of(); a defect there would move
    both sides together. These checks pin each one against an independent derivation of the same owner rule."""
    problems = []
    f = 'browser.program.completed'
    p = base_payload(f)
    tuple_ = [f, p['context']['project_id'], p['context']['program_id'], p['owner_record_ref'], p['transition_receipt_ref']]
    # RFC 8785 of an array of ASCII strings without escapes is the compact JSON text; computed here without the helper.
    assert all(type(x) is str and x.isascii() and '"' not in x and '\\' not in x for x in tuple_)
    digest = hashlib.sha256(('[' + ','.join('"' + x + '"' for x in tuple_) + ']').encode('ascii')).hexdigest()
    if identity(f, p) != ('evt_browser_' + digest, 'browser@1:' + digest):
        problems.append('identity_recipe')
    if partition_of('project-browser') != 'project~' + base64.b64encode(b'project-browser').decode().replace('+', '-').replace('/', '_').rstrip('='):
        problems.append('partition_recipe')
    for fam_ in (f, 'browser.routine.disabled'):
        log = mixed_log(fam_)
        count, through, cursor = scan(fam_, log, PROJECT_ID)
        # The designed prefix: matching originals at 39 and 41 only (38 is another Project); last frame 42.
        if (count, through) != (2, 42) or cursor['last_sequence_id'] != 42 or cursor['last_event_id'] != log[41]['event_id']:
            problems.append(('scan', fam_))
        if scan(fam_, log[:40], PROJECT_ID)[:2] != (1, 40) or scan(fam_, [], PROJECT_ID) != (0, None, None):
            problems.append(('scan_prefix', fam_))
    v = build_derived(f)['prior']
    from pm_event_index_binding import binding_bytes
    if binding_hash(v) != hashlib.sha256(binding_bytes(v)).hexdigest():
        problems.append('binding_hash')
    return problems


def probe(row_id, families):
    """Mutation support: every witness of one row (explicit and generated) and every control of these families,
    with the refusals the checker returns now, and the named cross-checks."""
    r = ROW_BY_ID[row_id]
    out = {'witnesses': {}, 'controls': {}, 'agreement': [], 'known_answers': known_answer_checks()}
    for family in families:
        if r['families'] is not None and family not in r['families']:
            continue
        for label, boundary, variant, hooks, gen in witness_list(r, family):
            try:
                world = BUILD[boundary](family, variant, hooks)
            except (KeyError, IndexError, TypeError, AttributeError, ValueError, Refusal):
                continue
            memo = Memo(world, boundary)
            refusals, _v = evaluate(world, boundary, memo)
            out['witnesses'][family + '|' + label] = refusals[:3]
            if boundary == 'retained' and frozen_agreement(world, memo):
                out['agreement'].append(('frozen', family, label))
            if boundary == 'append' and predicate_agreement(world, memo):
                out['agreement'].append(('predicate', family, label))
    for cid, boundary, world in build_controls(families):
        memo = Memo(world, boundary)
        out['controls'][cid] = evaluate(world, boundary, memo)[0][:3]
        if boundary == 'retained' and frozen_agreement(world, memo):
            out['agreement'].append(('frozen', cid))
    return out


# ---- Per-family entailment: (row, family) pairs that can never refuse alone, each with a checked reason -----------

def _facts_schema(family):
    return PAYLOADS['$defs'][FAM[family]['payload_def']]['properties']['facts']['properties']


def _fact_nullable(family, field):
    spec = _facts_schema(family).get(field, {})
    return 'anyOf' in spec and any(s.get('type') == 'null' for s in spec['anyOf'])


def _terminal_enum(family):
    spec = _facts_schema(family).get('terminal_state')
    return () if spec is None else tuple(spec.get('enum', [spec.get('const')]))


CONTEXT_PAIRS = {'run_attempt_paired': ('run_id', 'attempt_id'),
                 'session_workspace_paired': ('browser_session_id', 'browser_workspace_id'),
                 'page_generation_paired': ('browser_page_id', 'page_generation')}
OTHER_TERMINAL_UNKNOWN_ACTIONS = ('no_action_overlap', 'unknown_actions_no_retry', 'no_effect_no_unknown')


def entailment_reason(pid, family):
    """Why predicate pid can never be the only refusal in this family, or None. Each reason is a fact about the
    family's closed payload schema or a logical implication between two of its own predicate rows."""
    if pid in CONTEXT_PAIRS and not any(_context_nullable(family, k) for k in CONTEXT_PAIRS[pid]):
        a, b = CONTEXT_PAIRS[pid]
        return ('schema', 'the closed payload makes %s and %s non-null, so they are never unpaired; append_payload_schema '
                          'refuses every null first' % (a, b))
    if pid == 'page_has_workspace' and not _context_nullable(family, 'browser_workspace_id'):
        return ('schema', 'the closed payload makes browser_workspace_id non-null; append_payload_schema refuses a null first')
    if pid == 'checkpoint_ref_present' and not _fact_nullable(family, 'checkpoint_ref'):
        return ('schema', 'the closed payload makes checkpoint_ref a non-empty non_secret_ref; append_payload_schema refuses '
                          'null or an empty string first')
    if pid == 'generation_not_regressed' and 'generation_advances' in FAMILY_PREDICATES[family]:
        return ('implied', 'prior_page_generation > page_generation also violates generation_advances '
                           '(prior < page_generation), the row before it, so both refuse together')
    if pid in ('lease_generation_not_regressed', 'lease_epoch_not_regressed') and (
            'renew_identity' in FAMILY_PREDICATES[family] or 'takeover_request_identity' in FAMILY_PREDICATES[family]):
        return ('implied', 'a regressed %s changes a fence identity field, which renew_identity / takeover_request_identity '
                           '(old and new lease_id, holder_id, lease_epoch, lease_generation equal) also refuses' % pid.split('_not')[0])
    if pid == 'lease_epoch_not_regressed' and 'takeover_epoch_advances' in FAMILY_PREDICATES[family]:
        return ('implied', 'new lease_epoch < old also violates takeover_epoch_advances (new > old)')
    terms = _terminal_enum(family)
    if terms and pid in ('no_effect_no_unknown', 'unknown_actions_no_retry'):
        need = 'effect_state no_effect' if pid == 'no_effect_no_unknown' else 'retry_allowed true'
        return ('implied', 'it needs a non-empty unknown_effect_action_ids with %s; for every terminal_state this family '
                           'allows (%s) another family row refuses that too: timed_out_effect_state_unknown forces '
                           'effect_unknown through timed_out_unknown_state (%s), and any other terminal_state makes '
                           'terminal_no_unknown_actions refuse the unknown actions'
                           % (need, ', '.join(terms), 'which then refuses no_effect' if pid == 'no_effect_no_unknown'
                              else 'so unknown_state_no_retry refuses retry_allowed'))
    if terms and 'timed_out_effect_state_unknown' not in terms:
        if pid in OTHER_TERMINAL_UNKNOWN_ACTIONS:
            return ('implied', 'it needs a non-empty unknown_effect_action_ids, and every terminal_state this family allows '
                               '(%s) makes terminal_no_unknown_actions refuse that too' % ', '.join(terms))
        if pid == 'unknown_state_no_retry':
            return ('implied', 'it needs effect_state effect_unknown, and every terminal_state this family allows (%s) makes '
                               'terminal_known_state refuse that too' % ', '.join(terms))
    if terms == ('timed_out_effect_state_unknown',) and pid in ('no_effect_no_unknown', 'no_effect_no_completed'):
        return ('implied', 'it needs effect_state no_effect, and this family\'s only terminal_state '
                           'timed_out_effect_state_unknown makes timed_out_unknown_state refuse that too')
    if (pid in ('complete_frames', 'complete_no_omissions', 'complete_budget', 'complete_no_collisions')
            and _facts_schema(family).get('invalidated', {}).get('const') is True):
        return ('implied', 'it needs coverage status complete, and this family\'s invalidated is const true, so '
                           'invalidation_matches (invalidated == status stale_rejected) refuses that too')
    return None


@functools.lru_cache(maxsize=1)
def PER_FAMILY_ENTAILED_PAIRS():
    out = {}
    for f in FAMILIES:
        for pid in FAMILY_PREDICATES[f]:
            reason = entailment_reason(pid, f)
            if reason:
                out[('append_pred_' + pid, f)] = reason
    return out


# ---- Main ----------------------------------------------------------------------------------------------------------

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('--json', help='write the full report here')
    parser.add_argument('--family', action='append', help='limit to these families (debug only; not a lane result)')
    parser.add_argument('--no-corpus', action='store_true', help='skip the number corpus (debug only)')
    args = parser.parse_args(argv)
    families = tuple(args.family) if args.family else FAMILIES
    failures = []
    eager = {'payloads': eager_refs(PAYLOADS, PAYLOADS_ID), 'owner': eager_refs(OWNER, OWNER_ID),
             'event_record': eager_refs(EVENT_RECORD_SCHEMA, EVENT_RECORD_ID),
             'receipt': eager_refs(RECEIPT_SCHEMA, RECEIPT_ID), 'checkpoints': eager_refs(CHECKPOINTS, CHECKPOINTS_ID)}
    spec_problems = spec_consistency()
    if spec_problems:
        failures.append({'spec_consistency': spec_problems[:20]})
    bounds = {f: json_budget_bound(f) for f in FAMILIES}
    if any(b is None or INLINE_LIMIT + b > JSON_BUDGET for b in bounds.values()):
        failures.append({'json_budget_bound': bounds})
    ts_found, ts_diff = timestamp_inventory()
    if ts_diff:
        failures.append({'timestamp_inventory_difference': ts_diff})
    if not oracle_self_check():
        failures.append({'oracle_self_check': False})
    kats = known_answer_checks()
    if kats:
        failures.append({'known_answer_checks': kats})
    controls = build_controls(families)
    refused_entailed = set()
    agree = {'predicate': 0, 'frozen': 0}
    for cid, boundary, world in controls:
        memo = Memo(world, boundary)
        refusals, _v = evaluate(world, boundary, memo)
        if refusals:
            failures.append({'control_refused': cid, 'refusals': refusals[:5]})
        if boundary == 'append':
            d = predicate_agreement(world, memo)
            agree['predicate'] += 1
            if d:
                failures.append({'predicate_agreement': cid, 'detail': d})
        if boundary == 'retained':
            d = frozen_agreement(world, memo)
            agree['frozen'] += 1
            if d:
                failures.append({'frozen_agreement': cid, 'detail': d})
    negatives, findings, coverage = build_negatives(families)
    failures.extend({'negative_finding': f} for f in findings)
    by_row = {}
    for n in negatives:
        by_row.setdefault(n['row'], set()).add(n['family'])
        memo = Memo(n['case'], n['boundary'])
        if n['boundary'] == 'append':
            evaluate(n['case'], 'append', memo)
            d = predicate_agreement(n['case'], memo)
            agree['predicate'] += 1
            if d:
                failures.append({'predicate_agreement': n['row'], 'family': n['family'], 'defect': n['defect'], 'detail': d})
        if n['boundary'] == 'retained':
            evaluate(n['case'], 'retained', memo)
            d = frozen_agreement(n['case'], memo)
            agree['frozen'] += 1
            if d:
                failures.append({'frozen_agreement': n['row'], 'family': n['family'], 'defect': n['defect'], 'detail': d})
    uncovered = sorted(k for k, v in coverage.items() if v['credited'] == 0)
    unexplained = [k for k in uncovered if k not in PER_FAMILY_ENTAILED_PAIRS()]
    if unexplained:
        failures.append({'rows_without_family_witness': unexplained[:40], 'count': len(unexplained)})
    contradicted = [k for k in PER_FAMILY_ENTAILED_PAIRS() if k in coverage and coverage[k]['credited'] > 0]
    if contradicted:
        failures.append({'entailment_contradicted_by_a_witness': contradicted})
    unwitnessed = sorted(r['id'] for r in ROWS if r['id'] not in by_row and r['id'] not in ENTAILED
                         and any(f in families for f in (r['families'] or FAMILIES))
                         and not all((r['id'], f) in PER_FAMILY_ENTAILED_PAIRS()
                                     for f in (r['families'] or FAMILIES) if f in families))
    if unwitnessed:
        failures.append({'rows_without_any_witness': unwitnessed})
    corpus = None
    if not args.no_corpus:
        totals, ntokens, disagreements = corpus_checks(families)
        corpus = {'tokens': ntokens, 'totals': totals, 'disagreements': len(disagreements)}
        if disagreements:
            failures.append({'number_corpus_disagreements': disagreements[:20]})
    generated = sum(1 for n in negatives if n['generated'])
    report = {
        'schema_id': 'pm.event_authority.s4b_browser_checker_report.v1',
        'status': 'fail' if failures else 'pass',
        'families': len(families), 'rows': len(ROWS), 'tables': len(TABLES), 'entailed_rows': sorted(ENTAILED),
        'max_rows_per_table': max(len(v) for v in TABLE_ROWS.values()),
        'controls': len(controls), 'negatives': len(negatives), 'negatives_explicit': len(negatives) - generated,
        'negatives_generated_credited': generated,
        'row_family_pairs': len(coverage), 'row_family_pairs_witnessed': len(coverage) - len(uncovered),
        'row_family_pairs_entailed': [list(k) + [PER_FAMILY_ENTAILED_PAIRS().get(k)] for k in uncovered],
        'agreement_checks': agree, 'eager_refs': eager, 'json_budget_bounds_max': max(bounds.values()),
        'timestamp_fields': [list(x) for x in TIMESTAMP_FIELDS], 'timestamp_locations': [list(x) for x in ts_found],
        'number_corpus': corpus, 'oracle_self_check': oracle_self_check(), 'known_answer_checks': 'pass' if not kats else kats,
        'native_execution': 'NOT_RUN',
        'failures': failures[:200], 'failure_count': len(failures),
    }
    text = json.dumps(report, indent=1, default=str)
    if args.json:
        Path(args.json).write_text(text + '\n')
    print(json.dumps({k: report[k] for k in ('status', 'families', 'rows', 'tables', 'controls', 'negatives',
                                             'negatives_generated_credited', 'row_family_pairs',
                                             'row_family_pairs_witnessed', 'agreement_checks', 'number_corpus',
                                             'failure_count')}, default=str))
    for f in failures[:15]:
        print(json.dumps(f, default=str)[:400])
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
