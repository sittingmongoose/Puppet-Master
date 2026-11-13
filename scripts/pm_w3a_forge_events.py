#!/usr/bin/env python3
"""W3A Forge phase-2 oracles: 35 families, complete checker over guard tables.

Static synthetic oracles for FGI/CV/SP-1200..1234 and ATS-1200. No native
execution: native owner results, Storage records and receipts are fixture
authorities built here, never provider or Storage proof (native NOT_RUN).

Every refusal is decided only by the rows of scripts/pm_w3a_forge_table_<phase>.py
(generated from scripts/pm_w3a_forge_rows.py), evaluated in row order on an
observation dict the checker derives from the complete boundary input. The
derivation code below computes observations; it never decides acceptance.
Shared calls: pm_event_numbers (CV-1100/SP-1100/SP-1101) at every integer slot,
producer digest, physical bytes, CV-339 commitment and the retained dispatcher;
pm_event_datetime.date_time (CV-1101) at every timestamp field with its owner
profile. RECORDER is set only by the guard-table suite builder.
"""
import base64
import copy
import dataclasses
import hashlib
import importlib
import json
import sys
from contextlib import contextmanager
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))

import blake3  # noqa: E402
import msgpack  # noqa: E402
from jsonschema import Draft202012Validator  # noqa: E402
from referencing import Registry, Resource  # noqa: E402
from referencing.jsonschema import DRAFT202012  # noqa: E402

from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time  # noqa: E402
from pm_event_numbers import (  # noqa: E402
    EVENT_VALUE, INDEX_BINDING, PRODUCER_FIELDS, FrozenRecipe, OriginalBinding, OriginalCustody,
    RecipeTuple, Refusal, RetainedDispatcher, current_append_policy, current_integer,
    current_integer_token, decode_storage_value, full_value_commitment, producer_semantic_digest,
    storage_uint64, storage_value_bytes,
)
import pm_w3a_forge_rows as rows_spec  # noqa: E402
import pm_w3a_forge_spec as spec  # noqa: E402

STORAGE = '11111111-1111-4111-8111-111111111111'
OTHER_STORAGE = '22222222-2222-4222-8222-222222222222'
SERVER = 'server-A'
PROJECT = 'project-A'
INLINE_LIMIT = 16 * 1024
WINDOW_SECONDS = 604800
PACK_MEDIA = 'application/vnd.msgpack'
CONSUMER_VERSION = '1.0.0'
GEN_DOMAIN = 'pm.forge.history_checkpoint_generation.v1'
TABLE_PREFIX = 'pm_w3a_forge_table_'
RECORDER = None

# --- schemas (closed preloaded registry; no retrieval) ----------------------
SCHEMA_FILES = ('forge_event_storage_contracts', 'forge_integration_contracts', 'shared_integration_runtime',
                'event_record', 'event_record_index_checkpoint', 'event_append_receipt_contracts')


def _load(path):
    return json.loads((ROOT / path).read_text())


SCHEMAS = {name: _load(f'Plans/{name}.schema.json') for name in SCHEMA_FILES}
PAYLOAD_SCHEMAS = {f['slug']: _load(f['payload_schema_path']) for f in spec.FAMILIES}


def _registry():
    pairs = []
    for name, schema in SCHEMAS.items():
        resource = Resource.from_contents(schema, default_specification=DRAFT202012)
        pairs.append((schema['$id'], resource))
        pairs.append((f'https://puppetmaster.local/Plans/{name}.schema.json', resource))
    for schema in PAYLOAD_SCHEMAS.values():
        pairs.append((schema['$id'], Resource.from_contents(schema, default_specification=DRAFT202012)))
    return Registry().with_resources(pairs)


REGISTRY = _registry()
FORGE_ID = SCHEMAS['forge_event_storage_contracts']['$id']
RECEIPT_ID = SCHEMAS['event_append_receipt_contracts']['$id']
ENVELOPE_VALIDATOR = Draft202012Validator(SCHEMAS['event_record'], registry=REGISTRY)
CUSTODY_VALIDATOR = Draft202012Validator({'$ref': RECEIPT_ID + '#/$defs/custody_v2'}, registry=REGISTRY)
PAYLOAD_VALIDATORS = {slug: Draft202012Validator(s, registry=REGISTRY) for slug, s in PAYLOAD_SCHEMAS.items()}
SOURCE_VALIDATORS = {f['slug']: Draft202012Validator({'$ref': f"{FORGE_ID}#/$defs/{f['slug']}_source"}, registry=REGISTRY)
                     for f in spec.FAMILIES}
CHECKPOINT_VALIDATORS = {f['slug']: Draft202012Validator({'$ref': f"{FORGE_ID}#/$defs/{f['slug']}_checkpoint"}, registry=REGISTRY)
                         for f in spec.FAMILIES}


def resolve_every_ref():
    """Standing check 9: every $ref in the lane schemas resolves (eagerly, all branches)."""
    missing = []

    def walk(node, base, where):
        if isinstance(node, dict):
            ref = node.get('$ref')
            if isinstance(ref, str):
                try:
                    REGISTRY.resolver(base_uri=base).lookup(ref)
                except Exception as error:  # noqa: BLE001 - a dangling ref is the reported defect
                    missing.append((where, ref, type(error).__name__))
            for k, v in node.items():
                walk(v, base, f'{where}/{k}')
        elif isinstance(node, list):
            for i, v in enumerate(node):
                walk(v, base, f'{where}/{i}')
    walk(SCHEMAS['forge_event_storage_contracts'], FORGE_ID, 'forge_event_storage_contracts')
    for slug, schema in PAYLOAD_SCHEMAS.items():
        walk(schema, schema['$id'], slug)
    return missing


# --- exact helpers -----------------------------------------------------------
def same(a, b):
    """Exact typed JSON equality: bool is never an integer, 1.0 is never 1."""
    if type(a) is not type(b):
        return False
    if type(a) is dict:
        return set(a) == set(b) and all(same(a[k], b[k]) for k in a)
    if type(a) is list:
        return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    return a == b


def ok(fn, *args, **kwargs):
    """True when a shared call accepts; a Refusal is the shared refusal, any other error propagates."""
    try:
        fn(*args, **kwargs)
        return True
    except Refusal:
        return False


def uint64_ok(value):
    return ok(storage_uint64, value)


def clock_ok(value, profile):
    """date_time accepts the string under the owner profile and returns it unchanged."""
    if type(value) is not str:
        return False
    try:
        return date_time(value, profile=profile) == value
    except Refusal:
        return False


def sha(data):
    return hashlib.sha256(data).hexdigest()


def hexs(text):
    return text.encode('utf-8').hex()


def is_hex(text):
    return type(text) is str and len(text) % 2 == 0 and all(c in '0123456789abcdef' for c in text) and len(text) > 0


def unhex(text):
    try:
        return bytes.fromhex(text).decode('utf-8')
    except (ValueError, UnicodeDecodeError):
        return None


def digest_or_none(event):
    try:
        return producer_semantic_digest(event)
    except Refusal:
        return None


def value_hash(record):
    try:
        return sha(storage_value_bytes(record, profile=EVENT_VALUE))
    except Refusal:
        return None


def binding_hash(value):
    try:
        return sha(storage_value_bytes(value, profile=INDEX_BINDING))
    except Refusal:
        return None


def encoded_len(value, profile):
    try:
        return len(storage_value_bytes(value, profile=profile))
    except Refusal:
        return None


@contextmanager
def exact_integer_digits():
    """Integers render exactly; a 4,400-digit integer must reach a refusal row, never crash."""
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        yield
    finally:
        sys.set_int_max_str_digits(previous)


# --- identity recipes (CV-12xx, CV-366, Storage project~) --------------------
def partition_for(scope_kind, project_id):
    if scope_kind == 'application':
        return 'app'
    return 'project~' + base64.urlsafe_b64encode(project_id.encode('utf-8')).decode('ascii').rstrip('=')


def components(cap):
    return [cap['scope']['server_id'], cap['scope']['scope_partition'], cap['provider'], cap['instance'],
            cap['account_ref'], cap['subject_ref'], cap['native_operation_ref'], cap['native_fact_revision_ref'],
            cap['event_type']]


def fact_hex(cap):
    return ':'.join(hexs(c) for c in components(cap))


def event_id_for(cap):
    return 'forge@1:' + fact_hex(cap)


def owner_operation_for(cap):
    return 'forge_fact@1:' + fact_hex(cap)


def key_for(cap):
    op = owner_operation_for(cap)
    if cap['scope']['scope_kind'] == 'application':
        return f"application@1:{hexs(cap['scope']['server_id'])}:{hexs(op)}"
    return f'forge@1:{hexs(op)}'


def generation_id(root, seed):
    return binding_hash({'domain': GEN_DOMAIN, 'storage_instance_id': root['storage_instance_id'], 'scope': root['scope'],
                         'event_type': root['event_type'], 'consumer_id': root['consumer_id'],
                         'consumer_version': root['consumer_version'], 'generation_seed_sha256': seed})


# --- world construction --------------------------------------------------------
def make_scope(kind):
    if kind == 'application':
        return {'schema_id': 'pm.workflow_scope.v2', 'schema_version': '2.0.0', 'scope_kind': 'application',
                'scope_partition': 'app', 'project_id': None, 'project_home_server_id': None, 'named_plan_id': None,
                'server_id': SERVER}
    return {'schema_id': 'pm.workflow_scope.v2', 'schema_version': '2.0.0', 'scope_kind': 'project',
            'scope_partition': partition_for('project', PROJECT), 'project_id': PROJECT,
            'project_home_server_id': SERVER, 'named_plan_id': None, 'server_id': SERVER}


def base_native(fam, scope):
    slug = fam['slug']
    native = {
        'owner': fam['producer'], 'accepted': True, 'event_type': fam['event_type'], 'scope': scope,
        'provider': 'github', 'instance': 'github.com', 'account_ref': 'pmref:account.alpha',
        'subject_ref': f'pmref:subject.{slug}', 'native_operation_ref': f'pmref:op.{slug}.0001',
        'native_fact_revision_ref': f'pmref:rev.{slug}.0001', 'fact_ref': f'pmref:fact.{slug}.0001',
        'source_record_ref': f'pmref:source.{slug}.0001',
        'domain': {f: f'pmref:{f}.{slug}.0001' for f in fam['domain_refs']},
        'facts': copy.deepcopy(fam['positive_facts']),
        'occurred_at_utc': '2026-11-01T10:00:00.5+02:00', 'actor_ref': 'pmref:actor.alpha',
        'requested_account_ref': 'pmref:account.alpha', 'effective_account_ref': 'pmref:account.alpha',
        'correlation_id': f'corr-{slug}-0001', 'causation_event_id': None, 'parent_event_id': None,
    }
    if fam['vote']:
        native['vote'] = {'provider': 'github', 'reviewer_ref': 'pmref:reviewer.alpha',
                          'review_revision_ref': native['domain']['review_revision_ref'],
                          'native_vote_ref': f'pmref:vote.{slug}.0001', 'vote_value': fam['vote'],
                          'required_reviewer': True, 'revision_binding_kind': 'provider-asserted',
                          'binding_evidence_ref': f'pmref:binding.{slug}.0001'}
    return native


def make_payload(fam, cap):
    payload = {'schema_id': fam['payload_schema_id'], 'schema_version': '1.0.0', 'event_type': fam['event_type'],
               'fact_ref': cap['fact_ref'], 'provider': cap['provider'], 'subject_ref': cap['subject_ref'],
               'source_record_ref': cap['source_record_ref']}
    for f in fam['domain_refs']:
        payload[f] = cap['domain'][f]
    return payload


def make_envelope(fam, cap, payload, meta):
    scope = cap['scope']
    return {
        'schema_id': 'pm.event.v0', 'schema_version': '2.0.0', 'scope_kind': scope['scope_kind'],
        'event_id': event_id_for(cap), 'event_type': fam['event_type'], 'project_id': scope['project_id'],
        'thread_id': None, 'run_id': None, 'node_id': None, 'attempt_id': None, 'actor_ref': cap['actor_ref'],
        'requested_account_ref': cap['requested_account_ref'], 'effective_account_ref': cap['effective_account_ref'],
        'occurred_at_utc': cap['occurred_at_utc'], 'observed_at_utc': meta['observed_at_utc'],
        'persisted_at_utc': meta['persisted_at_utc'], 'sequence_id': meta['sequence_id'], 'producer_sequence_id': None,
        'correlation_id': cap['correlation_id'], 'causation_event_id': cap['causation_event_id'],
        'parent_event_id': cap['parent_event_id'], 'idempotency_key': key_for(cap),
        'payload_schema_id': fam['payload_schema_id'], 'payload': payload, 'payload_ref': None,
        'redaction_profile': 'secret_refs_only', 'replay_policy': 'dedupe_by_idempotency_key',
        'migration': {'migrated_from_schema_id': None, 'migrated_from_schema_version': None, 'migration_id': None,
                      'compatibility_event_type': None},
    }


def pack_for(intent):
    try:
        raw = storage_value_bytes(intent, profile=EVENT_VALUE)
    except Refusal:
        raw = b'\xc0'
    return raw, f'pm-payload-ref:v1:blake3:{blake3.blake3(raw).hexdigest()}:{len(raw)}:{PACK_MEDIA}'


def unrelated_record(scope, seq):
    return {'schema_id': 'pm.event.v0', 'schema_version': '2.0.0', 'scope_kind': scope['scope_kind'],
            'event_id': f'run-started-{seq}', 'event_type': 'run.started', 'project_id': scope['project_id'],
            'thread_id': None, 'run_id': 'run-1', 'node_id': None, 'attempt_id': None, 'actor_ref': 'pmref:actor.beta',
            'requested_account_ref': None, 'effective_account_ref': None, 'occurred_at_utc': '2026-11-01T09:00:00Z',
            'observed_at_utc': '2026-11-01T09:00:00Z', 'persisted_at_utc': '2026-11-01T09:00:01Z', 'sequence_id': seq,
            'producer_sequence_id': None, 'correlation_id': 'corr-run', 'causation_event_id': None,
            'parent_event_id': None, 'idempotency_key': f'run@1:{seq}', 'payload_schema_id': 'pm.event_payload.run_started.v2',
            'payload': {'run_id': 'run-1'}, 'payload_ref': None, 'redaction_profile': 'no_secrets',
            'replay_policy': 'dedupe_by_idempotency_key',
            'migration': {'migrated_from_schema_id': None, 'migrated_from_schema_version': None,
                          'migration_id': None, 'compatibility_event_type': None}}


RECIPE = RecipeTuple('pm.event.v0', '2.0.0', 'forge-w3a-payload', '1.0.0', 'Forge_Integrations', 'W3A-1.0.0',
                     'pm.event_family_registry', 'forge@1 (CV-1200..1234)', 'CV-317 producer_semantic_digest (CV-1100)',
                     EVENT_VALUE, 'CV-339 full value v2', 'SP-12xx source identity row', 'SP-337 pending pack',
                     sha(b'W3A forge-w3a-v1 frozen resources: payload schemas, forge_event_storage_contracts, event_record 2.0.0'))
UNKNOWN_RECIPE = dataclasses.replace(RECIPE, producer_recipe='unknown-producer-recipe', resource_manifest_sha256=sha(b'unknown'))


def hook(muts, name, obj, W):
    fn = muts.get(name)
    if fn is None:
        return obj
    result = fn(obj, W)
    # A hook replaces the object only by returning one of the same type; side-effect hooks return None or a tuple.
    return result if type(result) is type(obj) else obj


def build(fam, kind, muts=None, empty=False):
    """Complete world for one family and scope. muts: {hook: fn(obj, W)}; derived copies follow forged claims."""
    m = dict(muts or {})
    slug = fam['slug']
    W = {'fam': fam, 'kind': kind}
    scope = make_scope(kind)
    native = base_native(fam, scope)
    native = hook(m, 'native', native, W)
    W['authority'] = {native['fact_ref']: native}
    cap = hook(m, 'capture', copy.deepcopy(native), W)
    W['capture'] = cap
    payload = hook(m, 'payload', make_payload(fam, cap), W)
    meta = hook(m, 'meta', {'sequence_id': 7, 'observed_at_utc': '2026-11-01T08:00:01.250Z',
                            'persisted_at_utc': '2026-11-01T08:00:02Z'}, W)
    W['meta'] = meta
    env = hook(m, 'envelope', make_envelope(fam, cap, payload, meta), W)
    W['env'] = env
    W['admission'] = hook(m, 'admission', {
        'cutoff': False, 'registry': {(fam['event_type'], fam['payload_schema_id'], '1.0.0')},
        'dedupe_available': True, 'controls': {c: True for c in rows_spec.OWNER_CONTROLS}}, W)
    digest = digest_or_none(env) or '0' * 64
    intent = hook(m, 'intent', {k: env[k] for k in PRODUCER_FIELDS if k in env}, W)
    raw, ref = pack_for(intent)
    W['pack'] = hook(m, 'pack', {'store': {ref.split(':')[3]: raw}, 'ref': ref}, W)
    partition = cap['scope']['scope_partition']
    source = {'schema_id': f'pm.storage_value.{slug}_source.v1', 'schema_version': '1.0.0',
              'event_type': fam['event_type'], 'scope': copy.deepcopy(cap['scope']), 'fact_ref': cap['fact_ref'],
              'native_operation_ref': cap['native_operation_ref'], 'native_fact_revision_ref': cap['native_fact_revision_ref'],
              'subject_ref': cap['subject_ref'], 'source_record_ref': cap['source_record_ref'],
              'producer_semantic_digest': digest, 'payload_schema_id': fam['payload_schema_id'],
              'event_id': env['event_id'], 'idempotency_key': env['idempotency_key'], 'phase': 'source_committed',
              'first_append_receipt_ref': None, 'redaction_profile': 'secret_refs_only',
              'pending_intent_ref': W['pack']['ref']}
    if fam['vote']:
        source['vote_evidence'] = copy.deepcopy(cap['vote'])
    W['source'] = hook(m, 'source', source, W)
    W['source_key'] = hook(m, 'source_key', f'{slug}_source.v1:{STORAGE}:{partition}:{fact_hex(cap)}', W)
    W['uniqueness'] = hook(m, 'uniqueness', {(STORAGE, partition, fact_hex(cap)): cap['fact_ref']}, W)
    # Storage: first receipt custody, settlement, retry, publication, read.
    receipt = {'event_id': env['event_id'], 'sequence_id': meta['sequence_id'], 'segment_generation': 3,
               'segment_name': 'seg-000003', 'byte_offset': 4096, 'commit_group_id': f'cg-{slug}',
               'durability_class': 'ordinary', 'durable_end_offset': 8192, 'durability_state': 'synced',
               'manifest_generation': 5, 'acknowledged_at_utc': '2026-11-01T08:00:02.5Z'}
    try:
        commitment = full_value_commitment(env)
    except Refusal:
        commitment = '0' * 64
    custody = {'schema_id': 'pm.storage_value.event_append_receipt_custody.v2', 'schema_version': '2.0.0',
               'storage_instance_id': STORAGE, 'event_id': env['event_id'], 'scope_partition': partition,
               'event_type': fam['event_type'], 'idempotency_key': env['idempotency_key'],
               'producer_semantic_digest': digest, 'group_digest': sha(b'group:' + slug.encode()),
               'first_append_receipt': hook(m, 'receipt', receipt, W), 'redaction_profile': 'no_secrets',
               'original_segment_ref': 'storage/seglog/seg-000003',
               'original_event_value_commitment': {'schema_id': 'pm.storage.original_event_value_commitment.v1',
                                                   'schema_version': '1.0.0', 'codec': EVENT_VALUE,
                                                   'domain': 'pm.storage.original_event_value_commitment.v1',
                                                   'event_schema_id': 'pm.event.v0', 'event_schema_version': '2.0.0',
                                                   'sha256': commitment}}
    W['custody'] = hook(m, 'custody', custody, W)
    receipt_ref = f'pmref:receipt.{slug}.{kind}'
    W['receipt_index'] = hook(m, 'receipt_index', {receipt_ref: W['custody']}, W)
    pack_digest = W['pack']['ref'].split(':')[3]
    settled = dict(copy.deepcopy(W['source']), phase='history_committed', first_append_receipt_ref=receipt_ref, pending_intent_ref=None)
    W['settle'] = hook(m, 'settle', {
        'row': settled, 'pins_before': {pack_digest: [f'pending:{W["source_key"]}', 'hold:protected-backup']},
        'pins_after': {pack_digest: ['hold:protected-backup']}, 'receipts_before': 1, 'receipts_after': 1}, W)
    retry_env = copy.deepcopy(env)
    retry_env['observed_at_utc'] = '2026-11-01T08:05:00Z'
    retry_env['sequence_id'] = 99
    W['retry'] = hook(m, 'retry', {
        'env': retry_env, 'registry': W['admission']['registry'], 'dedupe_available': True,
        'dedupe': {(partition, fam['event_type'], env['idempotency_key']): {'digest': digest, 'receipt': receipt_ref}},
        'result': {'receipt': copy.deepcopy(W['custody']['first_append_receipt']), 'remote_operations': 0}}, W)
    build_publication(W, m, empty)
    build_read(W, m)
    W['replay'] = hook(m, 'replay', {e: [] for e in rows_spec.EFFECTS}, W)
    return W


def node(root, seed, lifecycle, activated, retired, core):
    return {'generation_id': generation_id(root, seed), 'generation_seed_sha256': seed, 'lifecycle': lifecycle,
            'activated_at_utc': activated, 'retired_at_utc': retired, 'core': core}


def build_publication(W, m, empty):
    fam, cap, env = W['fam'], W['capture'], W['env']
    slug, scope = fam['slug'], copy.deepcopy(cap['scope'])
    partition = scope['scope_partition']
    key = f'{slug}_checkpoint.v1:{STORAGE}:{partition}:consumer.1'
    record_m = env
    record_u = unrelated_record(scope, 8)
    log = [] if empty else [record_m, record_u]
    W['log'] = hook(m, 'log', log, W)
    selection = {'storage_instance_id': STORAGE, 'current_ref': 'storage/seglog/CURRENT',
                 'current_bytes_sha256': sha(b'CURRENT'), 'selected_segment_generation': 3,
                 'manifest_ref': 'storage/seglog/manifest.v1.msgpack', 'manifest_bytes_sha256': sha(b'manifest'),
                 'manifest_generation': 5, 'recovery_epoch': 1, 'manifest_survivor_prefix_sha256': sha(b'survivor'),
                 'retained_inventory_sha256': sha(b'inventory'), 'durable_watermarks_sha256': sha(b'watermarks'),
                 'excluded_ranges_sha256': sha(b'excluded'), 'retired_inputs_sha256': sha(b'retired')}
    live = {'storage_instance_id': STORAGE, 'checkpoint_key': f'event_record_index.v1:{STORAGE}:{partition}',
            'checkpoint_ref': f'checkpoints/event_record_index/{partition}', 'generation_id': 'eig_' + sha(b'index-gen'),
            'generation_anchor_sha256': sha(b'anchor'), 'frontier_revision': 0 if empty else 8,
            'frontier_sha256': sha(b'frontier'), 'index_dataset_name': 'event_record_index.g1', 'source_selection': selection,
            'redb_snapshot_id': 'snap-0042'}
    W['storage_live'] = hook(m, 'storage_live', copy.deepcopy(live), W)
    root_id = {'storage_instance_id': STORAGE, 'scope': scope, 'event_type': fam['event_type'],
               'consumer_id': f'consumer.{fam["event_type"]}.history', 'consumer_version': CONSUMER_VERSION}
    seeds = {n: sha(f'W3A-oracle|{fam["event_type"]}|{partition}|{n}'.encode()) for n in ('A', 'B', 'C', 'U')}
    W['seeds'] = seeds
    W['seed_ledger'] = hook(m, 'seed_ledger', {(STORAGE, partition, fam['event_type']): [seeds['A'], seeds['B'], seeds['C']]}, W)

    def core(rev, prev, last, count, token):
        return {'schema_id': f'pm.storage_value.{slug}_checkpoint.generation_core.v1', 'schema_version': '1.0.0',
                'storage_instance_id': STORAGE, 'scope': copy.deepcopy(scope), 'event_type': fam['event_type'],
                'consumer_id': root_id['consumer_id'], 'consumer_version': CONSUMER_VERSION,
                'publication_revision': rev, 'previous_checkpoint_sha256': prev, 'generic_token': token,
                'last_scanned': last, 'matched_count': count, 'state': 'current', 'withdrawal_receipt_ref': None,
                'redaction_profile': 'secret_refs_only'}
    durable = {k: v for k, v in live.items() if k != 'redb_snapshot_id'}
    old_token = dict(copy.deepcopy(durable), frontier_revision=7 if not empty else 0)
    cursor_m = None if empty else {'event_id': record_m['event_id'], 'sequence_id': record_m['sequence_id'],
                                   'event_value_sha256': value_hash(record_m)}
    cursor_u = None if empty else {'event_id': record_u['event_id'], 'sequence_id': 8, 'event_value_sha256': value_hash(record_u)}
    times = {'A': ('2026-10-20T00:00:00Z', None), 'B': ('2026-10-01T00:00:00Z', '2026-10-20T00:00:00Z'), 'C': (None, None)}
    W['recorded_times'] = hook(m, 'recorded_times', {seeds['A']: times['A'], seeds['B']: times['B']}, W)
    root = dict(root_id, schema_id=f'pm.storage_value.{slug}_checkpoint.v1', schema_version='1.0.0')
    b_core = core(3, sha(b'b-prev'), None, 0, copy.deepcopy(old_token))
    c_core = core(0, None, None, 0, copy.deepcopy(old_token))
    pred_a = core(0 if empty else 7, sha(b'a-prev'), cursor_m, 0 if empty else 1, old_token)
    pred = dict(copy.deepcopy(root), generations=[
        node(root, seeds['A'], 'current', *times['A'], pred_a),
        node(root, seeds['B'], 'retired', *times['B'], b_core),
        node(root, seeds['C'], 'staged', *times['C'], c_core)])
    pred['current_generation_id'] = pred['generations'][0]['generation_id']
    pred = {k: pred[k] for k in ('schema_id', 'schema_version', 'storage_instance_id', 'scope', 'event_type', 'consumer_id',
                                 'consumer_version', 'current_generation_id', 'generations')}
    W['pred'] = hook(m, 'pred', pred, W)
    pred_hash = binding_hash(W['pred'])
    cand = copy.deepcopy(W['pred'])
    sel = cand['generations'][0]
    sel['core']['publication_revision'] = W['pred']['generations'][0]['core']['publication_revision'] + 1
    sel['core']['previous_checkpoint_sha256'] = pred_hash
    sel['core']['last_scanned'] = cursor_u if not empty else None
    sel['core']['matched_count'] = 0 if empty else 1
    sel['core']['generic_token'] = copy.deepcopy(durable)
    W['cand'] = hook(m, 'cand', cand, W)
    W['root_key'] = hook(m, 'root_key', key, W)
    W['storage_keys'] = hook(m, 'storage_keys', [W['root_key']], W)
    W['request'] = hook(m, 'request', {
        'expected_revision': W['pred']['generations'][0]['core']['publication_revision'], 'expected_hash': pred_hash,
        'fence': 'fence-0042', 'live_token': copy.deepcopy(live),
        'scanned': [] if empty else [r['sequence_id'] for r in log], 'disclosed': [] if empty else [],
        'empty_proof': empty}, W)
    W['storage_fence'] = 'fence-0042'
    two = copy.deepcopy(W['pred'])
    two['generations'] = two['generations'][:2]
    W['stage'] = hook(m, 'stage', {'op': 'stage', 'root': two, 'target': None, 'holds': [], 'elapsed_seconds': 0}, W)
    withdrawn = copy.deepcopy(W['pred'])
    wnode = withdrawn['generations'][0]
    wnode['lifecycle'] = 'retired'
    wnode['retired_at_utc'] = '2026-11-02T00:00:00Z'
    wnode['core']['state'] = 'withdrawn'
    wnode['core']['withdrawal_receipt_ref'] = f'pmref:withdrawal.{slug}'
    withdrawn['current_generation_id'] = None
    W['withdraw'] = hook(m, 'withdraw', {
        'root': withdrawn, 'storage_receipt': f'pmref:withdrawal.{slug}', 'tokens_invalidated': True, 'appended': 0,
        'recorded_retirement': {seeds['A']: '2026-11-02T00:00:00Z'}}, W)


def build_read(W, m):
    fam, env = W['fam'], W['env']
    partition = W['capture']['scope']['scope_partition']
    original_ref = f'{STORAGE}:{partition}:{env["event_id"]}'
    binding = {'storage_instance_id': STORAGE, 'scope_kind': W['capture']['scope']['scope_kind'],
               'server_id': W['capture']['scope']['server_id'], 'project_id': W['capture']['scope']['project_id'],
               'event_type': fam['event_type'], 'event_id': env['event_id'], 'idempotency_key': env['idempotency_key'],
               'owner_operation_id': owner_operation_for(W['capture']),
               'source_commitment': W['source']['producer_semantic_digest']}
    try:
        record_bytes = storage_value_bytes(env, profile=EVENT_VALUE)
    except Refusal:
        record_bytes = b''
    W['read'] = hook(m, 'read', {
        'original_ref': original_ref, 'expected': copy.deepcopy(binding),
        'sealed': [{'original_ref': original_ref, 'binding': copy.deepcopy(binding), 'recipe': RECIPE}],
        'stored': {original_ref: {'record': record_bytes, 'source_row': W['settle']['row'], 'custody': W['custody']}},
        'reader_writes_receipt': False, 'reader_alters_bytes': False, 'withdrawn': False, 'permission': True,
        'deleted': False, 'ref_available': True, 'live_capability': True}, W)


# --- observations -----------------------------------------------------------
def obs_admission(W):
    a, env = W['admission'], W['env']
    fam = W['fam']
    policy = env.get('replay_policy')
    out = {'cutoff_open': a['cutoff'] is False,
           'membership': (fam['event_type'], fam['payload_schema_id'], '1.0.0') in a['registry'],
           'not_replay_only': policy != 'projector_replay_only' or ok(current_append_policy, policy),
           'replay_policy': policy == 'projector_replay_only' or (ok(current_append_policy, policy) and policy == 'dedupe_by_idempotency_key'),
           'dedupe_available': a['dedupe_available'] is True}
    for c in rows_spec.OWNER_CONTROLS:
        out[f'control_{c}'] = a['controls'].get(c) is True
    return out


def _metadata_strings(env):
    keep = ('event_id', 'idempotency_key', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
            'correlation_id', 'causation_event_id', 'parent_event_id', 'payload_schema_id', 'project_id')
    return [env.get(k) for k in keep if type(env.get(k)) is str]


def obs_envelope(W):
    env, cap, meta = W['env'], W['capture'], W['meta']
    fam = W['fam']
    payload = env.get('payload')
    inline = encoded_len(payload, EVENT_VALUE)
    psid = env.get('producer_sequence_id')
    return {
        'envelope_schema': ENVELOPE_VALIDATOR.is_valid(env),
        'occurred_clock': clock_ok(env.get('occurred_at_utc'), EVENT_RECORD),
        'observed_clock': clock_ok(env.get('observed_at_utc'), STORAGE_UTC_Z),
        'persisted_clock': clock_ok(env.get('persisted_at_utc'), STORAGE_UTC_Z),
        'sequence_uint64': uint64_ok(env.get('sequence_id')),
        'producer_sequence': psid is None or ok(current_integer, psid, minimum=0),
        'producer_qualified': digest_or_none(env) is not None,
        'family': same(env.get('event_type'), fam['event_type']),
        'payload_schema': same(env.get('payload_schema_id'), fam['payload_schema_id']),
        'redaction_join': same(env.get('redaction_profile'), 'secret_refs_only'),
        'project_join': same(env.get('project_id'), cap['scope']['project_id']),
        'thread_null': 'thread_id' in env and env['thread_id'] is None,
        'run_null': 'run_id' in env and env['run_id'] is None,
        'node_null': 'node_id' in env and env['node_id'] is None,
        'attempt_null': 'attempt_id' in env and env['attempt_id'] is None,
        'occurred_join': same(env.get('occurred_at_utc'), cap['occurred_at_utc']),
        'actor_join': same(env.get('actor_ref'), cap['actor_ref']),
        'requested_account_join': same(env.get('requested_account_ref'), cap['requested_account_ref']),
        'effective_account_join': same(env.get('effective_account_ref'), cap['effective_account_ref']),
        'correlation_join': same(env.get('correlation_id'), cap['correlation_id']),
        'causation_join': same(env.get('causation_event_id'), cap['causation_event_id']),
        'parent_join': same(env.get('parent_event_id'), cap['parent_event_id']),
        'inline_size': inline is not None and inline <= INLINE_LIMIT,
        'payload_ref_null': 'payload_ref' in env and env['payload_ref'] is None,
        'migration_null': type(env.get('migration')) is dict and all(v is None for v in env['migration'].values()),
        'sequence_join': same(env.get('sequence_id'), meta['sequence_id']),
        'observed_join': same(env.get('observed_at_utc'), meta['observed_at_utc']),
        'persisted_join': same(env.get('persisted_at_utc'), meta['persisted_at_utc']),
        'metadata_size': all(len(s.encode('utf-8')) <= INLINE_LIMIT for s in _metadata_strings(env)),
    }


def obs_payload(W):
    """Per-keyword attribution of the family's own closed payload schema errors."""
    fam = W['fam']
    schema = PAYLOAD_SCHEMAS[fam['slug']]
    payload = W['env'].get('payload')
    fields = rows_spec.payload_rows(fam)
    out = {field: True for _r, field, *_ in fields}
    for error in PAYLOAD_VALIDATORS[fam['slug']].iter_errors(payload):
        kw = error.validator
        if kw == 'required':
            for name in error.validator_value:
                if type(payload) is dict and name not in payload:
                    out[f'required.{name}'] = False
            continue
        if kw == 'additionalProperties':
            out['closed'] = False
            continue
        path = list(error.absolute_path)
        name = path[0] if path else None
        key = f'{kw}.{name}'
        if key in out:
            out[key] = False
        else:
            out[f'unattributed:{key}'] = False
    del schema
    return out


def obs_identity(W):
    env, cap = W['env'], W['capture']
    eid = env.get('event_id')
    parts = eid.split(':') if type(eid) is str else []
    prefix_ok = type(eid) is str and eid.startswith('forge@1:')
    comps = parts[1:] if len(parts) == 10 else None
    arity = comps is not None and all(is_hex(c) for c in comps)
    names = ('server', 'partition', 'provider', 'instance', 'account', 'subject', 'operation', 'revision', 'event_type')
    out = {'event_prefix': prefix_ok, 'event_arity': arity}
    expect = components(cap)
    for i, n in enumerate(names):
        out[f'component_{n}'] = (not arity) or unhex(comps[i]) == expect[i]
    scope = cap['scope']
    out['partition_recipe'] = (scope['scope_kind'] in ('application', 'project') and
                               same(scope['scope_partition'], partition_for(scope['scope_kind'], scope['project_id'] or '')))
    key = env.get('idempotency_key')
    kparts = key.split(':') if type(key) is str else []
    app = scope['scope_kind'] == 'application'
    out['key_prefix'] = bool(kparts) and kparts[0] == ('application@1' if app else 'forge@1')
    want = 3 if app else 2
    key_arity = len(kparts) == want and all(is_hex(c) for c in kparts[1:])
    out['key_arity'] = key_arity
    out['key_server'] = (not app) or (not key_arity) or kparts[1] == hexs(scope['server_id'])
    out['key_operation'] = (not key_arity) or kparts[-1] == hexs(owner_operation_for(cap))
    return out


def _semantic(kind, args, facts):
    if kind == 'is':
        return same(facts.get(args[0]), args[1])
    if kind == 'eq':
        return args[0] in facts and args[1] in facts and same(facts[args[0]], facts[args[1]])
    if kind in ('ne', 'changed'):
        return args[0] in facts and args[1] in facts and not same(facts[args[0]], facts[args[1]])
    if kind == 'within':
        a, b = facts.get(args[0]), facts.get(args[1])
        return a in spec.LEVELS and b in spec.LEVELS and type(a) is str and type(b) is str and spec.LEVELS.index(a) <= spec.LEVELS.index(b)
    if kind == 'member':
        a, b = facts.get(args[0]), facts.get(args[1])
        return type(b) is list and any(same(a, x) for x in b)
    if kind == 'imp':
        return (not same(facts.get(args[0]), args[1])) or same(facts.get(args[2]), args[3])
    raise ValueError(kind)


def obs_source(W):
    fam, cap, payload = W['fam'], W['capture'], W['env'].get('payload')
    payload = payload if type(payload) is dict else {}
    record = W['authority'].get(cap.get('fact_ref'))
    present = record is not None
    out = {'native_present': present,
           'native_identical': (not present) or same(record, cap),
           'native_owner': same(cap.get('owner'), fam['producer']),
           'native_accepted': cap.get('accepted') is True}
    for f in ('fact_ref', 'provider', 'subject_ref', 'source_record_ref'):
        out[f'join.{f}'] = same(payload.get(f), cap.get(f))
    for f in fam['domain_refs']:
        out[f'join.{f}'] = same(payload.get(f), cap['domain'].get(f))
    if fam['vote']:
        evidence = W['source'].get('vote_evidence')
        evidence = evidence if type(evidence) is dict else {}
        for f in rows_spec.VOTE_FIELDS:
            out[f'vote.{f}'] = f in evidence and same(evidence[f], cap['vote'].get(f))
    for name, kind, args, _neg in fam['semantic']:
        out[f'semantic.{name}'] = _semantic(kind, args, cap.get('facts', {}))
    return out


def obs_source_row(W):
    fam, cap, env, row = W['fam'], W['capture'], W['env'], W['source']
    partition = cap['scope']['scope_partition']
    return {
        'source_schema': SOURCE_VALIDATORS[fam['slug']].is_valid(row),
        'source_key': same(W['source_key'], f"{fam['slug']}_source.v1:{STORAGE}:{partition}:{fact_hex(cap)}"),
        'source_scope': same(row.get('scope'), cap['scope']),
        'source_event_id': same(row.get('event_id'), env.get('event_id')),
        'source_idempotency': same(row.get('idempotency_key'), env.get('idempotency_key')),
        'source_digest': same(row.get('producer_semantic_digest'), digest_or_none(env)),
        'source_fact_ref': same(row.get('fact_ref'), cap['fact_ref']),
        'source_operation': same(row.get('native_operation_ref'), cap['native_operation_ref']),
        'source_revision': same(row.get('native_fact_revision_ref'), cap['native_fact_revision_ref']),
        'source_subject': same(row.get('subject_ref'), cap['subject_ref']),
        'source_record': same(row.get('source_record_ref'), cap['source_record_ref']),
        'source_phase': row.get('phase') == 'source_committed',
        'fact_unique': same(W['uniqueness'].get((STORAGE, partition, fact_hex(cap))), cap['fact_ref']),
    }


def _pack_parts(ref):
    parts = ref.split(':') if type(ref) is str else []
    return parts if len(parts) == 6 and parts[0] == 'pm-payload-ref' else None


def obs_pack(W):
    ref = W['source'].get('pending_intent_ref')
    parts = _pack_parts(ref)
    store = W['pack']['store']
    raw = store.get(parts[3]) if parts else None
    present = raw is not None
    out = {'pack_present': present}
    out['pack_digest'] = (not present) or blake3.blake3(raw).hexdigest() == parts[3]
    out['pack_size'] = (not present) or (ok(current_integer_token, parts[4], minimum=1) and
                                         current_integer_token(parts[4], minimum=1) == len(raw))
    decoded = None
    if present:
        try:
            decoded = decode_storage_value(raw, profile=EVENT_VALUE)
        except Refusal:
            decoded = None
    out['pack_decodes'] = (not present) or decoded is not None
    env = W['env']
    out['pack_intent'] = decoded is None or same(decoded, {k: env[k] for k in PRODUCER_FIELDS if k in env})
    return out


def obs_pack_media(W):
    parts = _pack_parts(W['source'].get('pending_intent_ref'))
    return {'pack_media': parts is not None and parts[5] == PACK_MEDIA}


def obs_receipt(W):
    fam, env, cap = W['fam'], W['env'], W['capture']
    c = W['custody']
    r = c.get('first_append_receipt') if type(c.get('first_append_receipt')) is dict else {}
    s = W['settle']
    row = s['row']
    try:
        commitment = full_value_commitment(env)
    except Refusal:
        commitment = None
    out = {
        'custody_schema': CUSTODY_VALIDATOR.is_valid(c),
        'custody_event': same(c.get('event_id'), env['event_id']),
        'custody_partition': same(c.get('scope_partition'), cap['scope']['scope_partition']),
        'custody_type': same(c.get('event_type'), fam['event_type']),
        'custody_key': same(c.get('idempotency_key'), env['idempotency_key']),
        'custody_digest': same(c.get('producer_semantic_digest'), digest_or_none(env)),
        'custody_storage': same(c.get('storage_instance_id'), STORAGE),
        'full_value': commitment is not None and same((c.get('original_event_value_commitment') or {}).get('sha256'), commitment),
        'receipt_event': same(r.get('event_id'), env['event_id']),
        'receipt_sequence': same(r.get('sequence_id'), env['sequence_id']),
    }
    for s_name in rows_spec.RECEIPT_UINT:
        out[f'receipt_{s_name}_uint64'] = uint64_ok(r.get(s_name))
    out['ack_clock'] = clock_ok(r.get('acknowledged_at_utc'), STORAGE_UTC_Z)
    resolved = W['receipt_index'].get(row.get('first_append_receipt_ref'))
    out['settlement_ref'] = resolved is not None and same(resolved, c)
    out['settlement_phase'] = row.get('phase') == 'history_committed'
    out['settlement_release'] = 'pending_intent_ref' in row and row['pending_intent_ref'] is None
    digest = W['pack']['ref'].split(':')[3]
    before, after = s['pins_before'].get(digest, []), s['pins_after'].get(digest, [])
    pending = [p for p in before if p.startswith('pending:')]
    out['pin_released'] = not any(p in after for p in pending)
    out['other_holds_kept'] = all(p in after for p in before if not p.startswith('pending:'))
    out['no_new_receipt'] = s['receipts_after'] == s['receipts_before']
    return out


def obs_retry(W):
    fam, R = W['fam'], W['retry']
    env = R['env']
    policy = env.get('replay_policy')
    partition = W['capture']['scope']['scope_partition']
    original = R['dedupe'].get((partition, fam['event_type'], env.get('idempotency_key')))
    return {
        'retry_not_replay_only': policy != 'projector_replay_only' or ok(current_append_policy, policy),
        'retry_membership': (fam['event_type'], fam['payload_schema_id'], '1.0.0') in R['registry'],
        'retry_dedupe_available': R['dedupe_available'] is True,
        'retry_original_found': original is not None,
        'retry_digest_equal': original is None or same(digest_or_none(env), original['digest']),
        'retry_receipt_original': same(R['result']['receipt'], W['custody']['first_append_receipt']),
        'retry_no_remote': R['result']['remote_operations'] == 0 and type(R['result']['remote_operations']) is int,
    }


def _nodes(root):
    gens = root.get('generations')
    return [n for n in gens if type(n) is dict] if type(gens) is list else []


def _core(n):
    return n.get('core') if type(n.get('core')) is dict else {}


def _slot_values(n, slot):
    core = _core(n)
    token = core.get('generic_token') if type(core.get('generic_token')) is dict else {}
    selection = token.get('source_selection') if type(token.get('source_selection')) is dict else {}
    last = core.get('last_scanned')
    if slot == 'publication_revision':
        return [core.get('publication_revision')]
    if slot == 'matched_count':
        return [core.get('matched_count')]
    if slot == 'cursor_sequence':
        return [last.get('sequence_id')] if type(last) is dict else []
    if slot == 'frontier_revision':
        return [token.get('frontier_revision')]
    return [selection.get(slot)]


def obs_checkpoint(W, root):
    fam = W['fam']
    scope = W['capture']['scope']
    out = {'root_schema': CHECKPOINT_VALIDATORS[fam['slug']].is_valid(root),
           'root_key': same(W['root_key'], f"{fam['slug']}_checkpoint.v1:{STORAGE}:{scope['scope_partition']}:consumer.1"),
           'root_storage': same(root.get('storage_instance_id'), STORAGE),
           'root_scope': same(root.get('scope'), scope)}
    nodes = _nodes(root)
    for slot in rows_spec.UINT_SLOTS:
        out[f'{slot}_uint64'] = all(uint64_ok(v) for n in nodes for v in _slot_values(n, slot))
    out['activated_clock'] = all(n.get('activated_at_utc') is None or clock_ok(n['activated_at_utc'], STORAGE_UTC_Z) for n in nodes)
    out['retired_clock'] = all(n.get('retired_at_utc') is None or clock_ok(n['retired_at_utc'], STORAGE_UTC_Z) for n in nodes)
    size = encoded_len(root, INDEX_BINDING)
    out['root_size'] = size is None or size <= INLINE_LIMIT
    out['no_fourth_key'] = W['storage_keys'] == [W['root_key']]
    return out


def obs_generation(W, root, recorded_retirement=None):
    nodes = _nodes(root)
    scope = root.get('scope')
    ids = [n.get('generation_id') for n in nodes]
    current = [n for n in nodes if n.get('lifecycle') == 'current']
    selected = root.get('current_generation_id')
    if selected is None:
        selected_ok = not current
    else:
        named = [n for n in nodes if n.get('generation_id') == selected]
        selected_ok = len(named) == 1 and named[0].get('lifecycle') == 'current'
    ledger = W['seed_ledger'].get((STORAGE, W['capture']['scope']['scope_partition'], W['fam']['event_type']), [])
    rec = dict(W['recorded_times'])
    retire = dict(recorded_retirement or {})
    out = {
        'current_cardinality': len(current) <= 1,
        'node_membership': len(ids) == len(set(i for i in ids if type(i) is str)) and all(type(i) is str for i in ids),
        'selected_exists': selected_ok,
        'core_scope': all(same(_core(n).get('scope'), scope) for n in nodes),
        'core_identity': all(same(_core(n).get('storage_instance_id'), root.get('storage_instance_id')) for n in nodes),
        'generation_recipe': all(same(n.get('generation_id'), generation_id(root, n.get('generation_seed_sha256'))) for n in nodes),
        'seed_issuance': all(n.get('generation_seed_sha256') in ledger for n in nodes),
        'staged_times': all(n.get('activated_at_utc') is None and n.get('retired_at_utc') is None
                            for n in nodes if n.get('lifecycle') == 'staged'),
        'current_times': all(n.get('activated_at_utc') is not None and n.get('retired_at_utc') is None for n in current),
    }

    def recorded(n):
        seed = n.get('generation_seed_sha256')
        activation, retirement = rec.get(seed, (None, None))
        return activation, retire.get(seed, retirement)
    out['retired_anchor'] = all(same(n.get('retired_at_utc'), recorded(n)[1]) for n in nodes if n.get('lifecycle') == 'retired')
    out['activation_anchor'] = all(same(n.get('activated_at_utc'), recorded(n)[0]) for n in nodes
                                   if n.get('lifecycle') in ('current', 'retired'))
    return out


def _selected(root):
    sel = root.get('current_generation_id')
    for n in _nodes(root):
        if n.get('generation_id') == sel:
            return n
    return None


def obs_token(W):
    cand = W['cand']
    n = _selected(cand) or {}
    token = _core(n).get('generic_token') if type(_core(n).get('generic_token')) is dict else {}
    live = W['storage_live']
    sel = token.get('source_selection') if type(token.get('source_selection')) is dict else {}
    out = {}
    for f in rows_spec.TOKEN_FIELDS:
        out[f'token_{f}'] = same(token.get(f), live[f])
    for f in rows_spec.SELECTION_FIELDS:
        out[f'selection_{f}'] = same(sel.get(f), live['source_selection'][f])
    claimed = W['request']['live_token']
    out['live_snapshot'] = same(claimed.get('redb_snapshot_id'), live['redb_snapshot_id'])
    out['live_projection'] = same({k: v for k, v in claimed.items() if k != 'redb_snapshot_id'}, token)
    return out


def obs_scan(W):
    fam = W['fam']
    req, log = W['request'], W['log']
    scope = W['capture']['scope']
    cand_core = _core(_selected(W['cand']) or {})
    pred_core = _core(_selected(W['pred']) or {})
    by_seq = {r['sequence_id']: r for r in log if type(r.get('sequence_id')) is int}
    scanned = req['scanned']
    canonical = [r['sequence_id'] for r in log]
    last = cand_core.get('last_scanned')
    final = by_seq.get(scanned[-1]) if scanned else None
    out = {'coverage_complete': scanned == canonical}
    if final is None:
        out.update(cursor_event=last is None, cursor_sequence=last is None, cursor_value=last is None)
    else:
        last = last if type(last) is dict else {}
        out['cursor_event'] = same(last.get('event_id'), final['event_id'])
        out['cursor_sequence'] = same(last.get('sequence_id'), final['sequence_id'])
        out['cursor_value'] = same(last.get('event_value_sha256'), value_hash(final))
    matches = [by_seq[s] for s in scanned if s in by_seq and by_seq[s].get('event_type') == fam['event_type']
               and by_seq[s].get('schema_version') == '2.0.0' and by_seq[s].get('project_id') == scope['project_id']
               and by_seq[s].get('scope_kind') == scope['scope_kind']]
    out['matched_count'] = same(cand_core.get('matched_count'), len(matches))
    prev = pred_core.get('last_scanned')
    if type(prev) is dict:
        record = next((r for r in log if r.get('event_id') == prev.get('event_id')), None)
        out['resume_revalidated'] = (record is not None and same(prev.get('sequence_id'), record['sequence_id'])
                                     and same(prev.get('event_value_sha256'), value_hash(record)))
        out['no_second_disclosure'] = prev.get('event_id') not in req['disclosed']
    else:
        out['resume_revalidated'] = True
        out['no_second_disclosure'] = True
    custody_ids = {c.get('event_id') for c in W['receipt_index'].values() if type(c) is dict}
    out['matched_verified'] = all(r['event_id'] in custody_ids for r in matches)
    empty_claim = cand_core.get('last_scanned') is None and same(cand_core.get('matched_count'), 0)
    out['empty_proof'] = (not empty_claim) or (req['empty_proof'] is True and not log)
    return out


def obs_cas(W):
    pred, cand, req = W['pred'], W['cand'], W['request']
    psel, csel = _selected(pred) or {}, _selected(cand) or {}
    prev_rev = _core(psel).get('publication_revision')
    h = binding_hash(pred)
    excluded = {psel.get('generation_id'), csel.get('generation_id')}
    pred_others = [n for n in _nodes(pred) if n.get('generation_id') not in excluded]
    cand_others = [n for n in _nodes(cand) if n.get('generation_id') not in excluded]
    return {
        'expected_revision': same(req['expected_revision'], prev_rev),
        'revision_step': type(prev_rev) is int and same(_core(csel).get('publication_revision'), prev_rev + 1),
        'expected_hash': same(req['expected_hash'], h),
        'previous_hash': same(_core(csel).get('previous_checkpoint_sha256'), h),
        'siblings_preserved': same(pred_others, cand_others),
        'selector_kept': same(cand.get('current_generation_id'), pred.get('current_generation_id')),
        'fence_current': same(req['fence'], W['storage_fence']),
    }


def obs_slot(W):
    st = W['stage']
    root = st['root']
    nodes = _nodes(root)
    if st['op'] == 'stage':
        return {'slot_free': len(nodes) < 3, 'cleanup_unselected': True, 'cleanup_no_hold': True,
                'cleanup_window': True, 'elapsed_uint64': True}
    target = next((n for n in nodes if n.get('generation_id') == st['target']), {})
    elapsed = st['elapsed_seconds']
    return {'slot_free': True,
            'cleanup_unselected': target.get('generation_id') != root.get('current_generation_id') and target.get('lifecycle') != 'current',
            'cleanup_no_hold': not st['holds'],
            'cleanup_window': type(elapsed) in (int, float) and elapsed >= WINDOW_SECONDS,
            'elapsed_uint64': uint64_ok(elapsed)}


def frozen_verify(original):
    """forge-w3a-v1 frozen verifier: recompute identity, digest and full value from the original bytes."""
    try:
        record = decode_storage_value(original.record_bytes, profile=EVENT_VALUE)
        source_row = decode_storage_value(original.result_bytes, profile=EVENT_VALUE)
        custody = decode_storage_value(original.receipt_bytes, profile=EVENT_VALUE)
    except Refusal:
        return False
    b = original.binding
    digest = digest_or_none(record)
    try:
        commitment = full_value_commitment(record)
    except Refusal:
        return False
    return (record.get('event_id') == b.event_id and record.get('idempotency_key') == b.idempotency_key
            and record.get('event_type') == b.event_type and digest is not None and digest == b.source_commitment
            and source_row.get('producer_semantic_digest') == digest and source_row.get('event_id') == b.event_id
            and custody.get('original_event_value_commitment', {}).get('sha256') == commitment
            and custody.get('event_id') == b.event_id)


FROZEN = {RECIPE: FrozenRecipe(frozen_verify)}


class SealedOwner:
    """Selects only from the one sealed per-original receipt; never creates one (SP-1101, batch 2 fix 1)."""

    def __init__(self, R):
        self.R = R

    def authenticated_original(self, original_ref):
        sealed = [s for s in self.R['sealed'] if s['original_ref'] == original_ref]
        if not sealed:
            raise Refusal('original_unavailable')
        if len(sealed) > 1:
            raise Refusal('recipe_ambiguous')
        stored = self.R['stored'].get(original_ref)
        if stored is None:
            raise Refusal('original_unavailable')
        b = sealed[0]['binding']
        return OriginalCustody(OriginalBinding(**b), sealed[0]['recipe'], stored['record'],
                               storage_value_bytes(stored['source_row'], profile=EVENT_VALUE),
                               storage_value_bytes(stored['custody'], profile=EVENT_VALUE))


def obs_history(W):
    R = W['read']
    ref = R['original_ref']
    sealed = [s for s in R['sealed'] if s['original_ref'] == ref]
    before = len(R['sealed'])
    out = {'receipt_present': len(sealed) >= 1, 'receipt_unique': len(sealed) <= 1}
    one = sealed[0] if len(sealed) == 1 else None
    out['receipt_original'] = one is None or same(one['binding'], R['expected'])
    out['recipe_known'] = all(s['recipe'] in FROZEN for s in sealed)
    verified = True
    if one is not None and out['receipt_original'] and out['recipe_known']:
        original = SealedOwner(R).authenticated_original(ref)
        verified = FROZEN[one['recipe']].verify_original(original) is True
    out['original_verifies'] = verified
    stored = R['stored'].get(ref, {}).get('record')
    returned = (stored + b'\x00') if (stored is not None and R['reader_alters_bytes']) else stored
    out['bytes_preserved'] = returned == stored
    after = before + (1 if R['reader_writes_receipt'] else 0)
    out['no_receipt_created'] = after == before
    out['not_foreign'] = R['expected'].get('storage_instance_id') == STORAGE
    out['reader_enabled'] = R['withdrawn'] is False
    out['permission'] = R['permission'] is True
    out['not_deleted'] = R['deleted'] is False
    out['ref_available'] = R['ref_available'] is True
    return out


def dispatcher_agrees(W):
    """Cross-check: the shared RetainedDispatcher accepts exactly when HI01-HI05 hold."""
    R = W['read']
    o = obs_history(W)
    selection_ok = all(o[k] for k in ('receipt_present', 'receipt_unique', 'receipt_original', 'recipe_known', 'original_verifies'))
    dispatcher = RetainedDispatcher(SealedOwner(R), FROZEN)
    try:
        expected = OriginalBinding(**R['expected'])
        dispatcher.resolve(R['original_ref'], expected, disclose=lambda b: True)
        accepted = True
    except Refusal:
        accepted = False
    return accepted == selection_ok


def obs_replay(W):
    return {f'no_{e}': W['replay'][e] == [] for e in rows_spec.EFFECTS}


def obs_withdrawal(W):
    D = W['withdraw']
    root = D['root']
    seeds = W['seeds']
    a = next((n for n in _nodes(root) if n.get('generation_seed_sha256') == seeds['A']), {})
    core = _core(a)
    withdrawn = core.get('state') == 'withdrawn'
    return {'withdrawn_state': withdrawn,
            'withdrawal_receipt': (not withdrawn) or same(core.get('withdrawal_receipt_ref'), D['storage_receipt']),
            'selector_cleared': root.get('current_generation_id') is None,
            'tokens_invalidated': D['tokens_invalidated'] is True,
            'no_event_created': D['appended'] == 0 and type(D['appended']) is int}


def observe(phase, W):
    if phase == 'admission':
        return obs_admission(W)
    if phase == 'envelope':
        return obs_envelope(W)
    if phase == 'payload':
        return obs_payload(W)
    if phase == 'identity':
        return obs_identity(W)
    if phase == 'source':
        return obs_source(W)
    if phase == 'source_row':
        return obs_source_row(W)
    if phase == 'pack':
        return obs_pack(W)
    if phase == 'pack_media_entailed':
        return obs_pack_media(W)
    if phase == 'receipt':
        return obs_receipt(W)
    if phase == 'retry':
        return obs_retry(W)
    if phase == 'checkpoint':
        return obs_checkpoint(W, W['withdraw']['root'] if W.get('_path') == 'withdraw' else W['cand'])
    if phase == 'generation':
        if W.get('_path') == 'withdraw':
            return obs_generation(W, W['withdraw']['root'], W['withdraw']['recorded_retirement'])
        return obs_generation(W, W['cand'])
    if phase == 'token':
        return obs_token(W)
    if phase == 'scan':
        return obs_scan(W)
    if phase == 'cas':
        return obs_cas(W)
    if phase == 'slot':
        return obs_slot(W)
    if phase == 'history':
        return obs_history(W)
    if phase == 'replay':
        return obs_replay(W)
    if phase == 'withdrawal':
        return obs_withdrawal(W)
    raise KeyError(phase)


# --- guard-table evaluation ---------------------------------------------------
_TABLES = {}


def table(phase_name):
    t = _TABLES.get(phase_name)
    if t is None:
        module = importlib.import_module(TABLE_PREFIX + phase_name)
        case = module.case(None)
        rows = [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]
        t = _TABLES[phase_name] = (module.FIELDS, rows)
    return t


class UnattributedObservation(Exception):
    pass


def refusal(phase_name, facts):
    """First refusing row of one table as (row, code), or None; records the evaluation for the suites."""
    fields, rows = table(phase_name)
    extra = sorted(k for k in facts if k not in fields)
    if extra:
        raise UnattributedObservation(f'{phase_name}: {extra}')
    observed = {k: facts.get(k) is True for k in fields}
    first = None
    for name, predicate, context in rows:
        code = predicate(observed, context)
        if code is not None:
            first = (name, code)
            break
    if RECORDER is not None:
        RECORDER.append((phase_name, dict(observed), first))
    return first, observed


def run_path(path, W):
    """Evaluate a path's phases in order; return (phase_name, row, code, failing_rows) or None."""
    W['_path'] = path
    fam = W['fam']
    for phase in rows_spec.PATHS[path]:
        name = rows_spec.phase_name(phase, fam)
        first, observed = refusal(name, observe(phase, W))
        if first is not None:
            failing = [k for k, v in observed.items() if v is not True]
            return (name, first[0], first[1], failing)
    return None


# --- case catalog -------------------------------------------------------------
def setp(*path_value):
    """Hook that sets obj[path...] = value (deep-copied)."""
    *path, value = path_value

    def fn(obj, W):
        target = obj
        for k in path[:-1]:
            target = target[k]
        target[path[-1]] = copy.deepcopy(value)
    return fn


def delp(*path):
    def fn(obj, W):
        target = obj
        for k in path[:-1]:
            target = target[k]
        del target[path[-1]]
    return fn


def chain(*fns):
    def fn(obj, W):
        for f in fns:
            r = f(obj, W)
            obj = r if type(r) is type(obj) else obj
        return obj
    return fn


BIG = None  # 4,400-digit integer, built under exact_integer_digits()


def big_integer():
    global BIG
    if BIG is None:
        with exact_integer_digits():
            BIG = int('9' * 4400)
    return BIG


def positives(fam, kind):
    out = [
        dict(id='append/fresh-after-separate-admission', path='append', muts={}),
        dict(id='append/broad-occurred-profile', path='append',
             muts={'native': setp('occurred_at_utc', '2026-11-01t10:00:00.123456789-05:00')}),
        dict(id='settle/first-receipt-history-committed', path='settle', muts={}),
        dict(id='settle/restart-after-receipt-issued', path='settle',
             muts={'settle': setp('receipts_before', 1)}),
        dict(id='retry/same-body-other-storage-metadata', path='retry', muts={}),
        dict(id='publish/mixed-scan-unrelated-final-three-generations', path='publish', muts={}),
        dict(id='publish/actual-empty-source', path='publish', muts={}, empty=True),
        dict(id='stage/free-slot', path='stage', muts={}),
        dict(id='stage/lawful-cleanup-of-retired', path='stage',
             muts={'stage': lambda st, W: st.update(op='cleanup', root=copy.deepcopy(W['pred']),
                                                    target=W['pred']['generations'][1]['generation_id'],
                                                    holds=[], elapsed_seconds=WINDOW_SECONDS)}),
        dict(id='read/retained-original', path='read', muts={}),
        dict(id='read/retained-after-live-capability-revoked', path='read',
             muts={'read': setp('live_capability', False), 'admission': setp('controls', 'capability', False)}),
        dict(id='read/retained-projector-replay-only-original', path='read',
             muts={'envelope': setp('replay_policy', 'projector_replay_only')}),
        dict(id='replay/no-effect', path='replay', muts={}),
        dict(id='withdraw/consumer-withdrawn', path='withdraw', muts={}),
    ]
    return out


def _other_hex(text):
    return hexs(text)


def _sub_component(index, value):
    def fn(env, W):
        comps = components(W['capture'])
        comps[index] = value
        env['event_id'] = 'forge@1:' + ':'.join(hexs(c) for c in comps)
    return fn


def _token_both(field, value, selection=False):
    def cand(c, W):
        n = c['generations'][0]['core']['generic_token']
        (n['source_selection'] if selection else n)[field] = copy.deepcopy(value)

    def req(r, W):
        t = r['live_token']
        (t['source_selection'] if selection else t)[field] = copy.deepcopy(value)
    return {'cand': cand, 'request': req}


def _reseal_pack(raw):
    def fn(pack, W):
        digest = blake3.blake3(raw).hexdigest()
        pack['store'] = {digest: raw}
        pack['ref'] = f'pm-payload-ref:v1:blake3:{digest}:{len(raw)}:{PACK_MEDIA}'
    return fn


def _noncanonical_pack(pack, W):
    env = W['env']
    intent = {k: env[k] for k in PRODUCER_FIELDS}
    raw = msgpack.packb(intent, use_bin_type=True)
    _reseal_pack(raw)(pack, W)


def _activate_c(cand, W):
    a, c = cand['generations'][0], cand['generations'][2]
    c['core'] = copy.deepcopy(a['core'])
    c['lifecycle'], c['activated_at_utc'] = 'current', '2026-11-01T12:00:00Z'
    a['core'] = copy.deepcopy(W['pred']['generations'][0]['core'])
    a['lifecycle'], a['retired_at_utc'] = 'retired', '2026-11-01T12:00:00Z'
    cand['current_generation_id'] = c['generation_id']


def _recorded_activation(times, W):
    seeds = W['seeds']
    times[seeds['A']] = (times[seeds['A']][0], '2026-11-01T12:00:00Z')
    times[seeds['C']] = ('2026-11-01T12:00:00Z', None)


def shared_negatives(fam, kind):
    """(row, path, muts[, empty]) single-defect negatives for the shared phases."""
    app = kind == 'application'
    first_ref = fam['domain_refs'][0]
    big = big_integer()
    N = []

    def add(row, path, muts, label='', empty=False, multi=False):
        N.append(dict(row=row, path=path, muts=muts, label=label, empty=empty, multi=multi))
    # admission
    add('AD01_cutoff_open', 'append', {'admission': setp('cutoff', True)})
    add('AD02_membership', 'append', {'admission': setp('registry', set())}, 'current registry: membership ABSENT')
    add('AD03_not_replay_only', 'append', {'envelope': setp('replay_policy', 'projector_replay_only')})
    add('AD04_replay_policy', 'append', {'envelope': setp('replay_policy', 'append_once')})
    add('AD05_dedupe_available', 'append', {'admission': setp('dedupe_available', False)})
    for i, c in enumerate(rows_spec.OWNER_CONTROLS):
        add(f'AD{6 + i:02d}_control_{c}', 'append', {'admission': setp('controls', c, False)})
    # envelope
    add('EN01_envelope_schema', 'append', {'envelope': setp('extension', 1)}, 'closed envelope extra member')
    add('EN01_envelope_schema', 'append', {'envelope': setp('sequence_id', '7'), 'meta': setp('sequence_id', '7')}, 'string number', multi=True)
    add('EN01_envelope_schema', 'append', {'envelope': setp('sequence_id', True)}, 'boolean as integer', multi=True)
    for label, value in (('missing zone', '2026-11-01T10:00:00'), ('hour 24', '2026-11-01T24:00:00Z'),
                         ('trailing LF', '2026-11-01T10:00:00Z\n'), ('Feb 30', '2026-02-30T10:00:00Z'),
                         ('space separator', '2026-11-01 10:00:00Z'), ('invalid leap second', '2026-11-01T10:00:60Z')):
        add('EN02_occurred_clock', 'append', {'native': setp('occurred_at_utc', value)}, label)
    for row, field in (('EN03_observed_clock', 'observed_at_utc'), ('EN04_persisted_clock', 'persisted_at_utc')):
        for label, value in (('+00:00 zone', '2026-11-01T08:00:02+00:00'), ('lowercase z', '2026-11-01T08:00:02z'),
                             ('-00:00 zone', '2026-11-01T08:00:02-00:00'), ('nonzero offset', '2026-11-01T10:00:02+02:00')):
            add(row, 'append', {'meta': setp(field, value)}, label)
    for label, value in (('float spelling 7.0', 7.0), ('2^64', 2 ** 64), ('4,400-digit integer', big)):
        add('EN05_sequence_uint64', 'append', {'meta': setp('sequence_id', value)}, label)
    add('EN06_producer_sequence', 'append', {'envelope': setp('producer_sequence_id', 3.0)}, 'float spelling 3.0')
    add('EN01_envelope_schema', 'append', {'envelope': setp('producer_sequence_id', -1)}, 'negative producer_sequence_id (EN06 also fails)', multi=True)
    for label, value in (('2^53+1 binary64', 2 ** 53 + 1), ('2^60 decimal', 2 ** 60), ('4,400-digit integer', big)):
        add('EN07_producer_qualified', 'append', {'envelope': setp('producer_sequence_id', value)}, label)
    add('EN08_family', 'append', {'envelope': setp('event_type', 'forge.other.event')})
    add('EN09_payload_schema', 'append', {'envelope': setp('payload_schema_id', 'pm.event_payload.other.v1')})
    add('EN10_redaction_join', 'append', {'envelope': setp('redaction_profile', 'no_secrets')})
    if not app:
        add('EN12_project_join', 'append', {'envelope': setp('project_id', 'project-B')})
    for row, field, value in (('EN13_thread_null', 'thread_id', 'thread-1'), ('EN14_run_null', 'run_id', 'provider-pipeline-77'),
                              ('EN15_node_null', 'node_id', 'node-1'), ('EN16_attempt_null', 'attempt_id', 'attempt-1'),
                              ('EN17_occurred_join', 'occurred_at_utc', '2026-11-01T10:00:01Z'),
                              ('EN18_actor_join', 'actor_ref', 'pmref:actor.other'),
                              ('EN19_requested_account_join', 'requested_account_ref', 'pmref:account.other'),
                              ('EN20_effective_account_join', 'effective_account_ref', 'pmref:account.other'),
                              ('EN21_correlation_join', 'correlation_id', 'corr-other'),
                              ('EN22_causation_join', 'causation_event_id', 'evt-other'),
                              ('EN23_parent_join', 'parent_event_id', 'evt-parent')):
        add(row, 'append', {'envelope': setp(field, value)})
    add('EN01_envelope_schema', 'append', {'envelope': delp('thread_id')}, 'thread_id absent instead of present null (EN13 also fails)', multi=True)
    add('EN24_inline_size', 'append', {'envelope': setp('payload', 'extra_body', 'x' * 17000)}, 'inline body above 16 KiB')
    add('EN25_payload_ref_null', 'append', {'envelope': setp('payload_ref', 'pm-payload-ref:v1:blake3:' + '0' * 64 + ':10:application/vnd.msgpack')})
    add('EN26_migration_null', 'append', {'envelope': setp('migration', 'migration_id', 'migration-1')})
    add('EN27_sequence_join', 'append', {'envelope': setp('sequence_id', 8)}, 'caller-supplied sequence')
    add('EN28_observed_join', 'append', {'envelope': setp('observed_at_utc', '2026-11-01T08:00:09Z')})
    add('EN29_persisted_join', 'append', {'envelope': setp('persisted_at_utc', '2026-11-01T08:00:09Z')})
    add('EN30_metadata_size', 'append', {'native': setp('instance', 'h' * 9000)}, 'identity length expansion above 16 KiB')
    # identity
    add('ID01_event_prefix', 'append', {'envelope': lambda e, W: e.__setitem__('event_id', 'forge@2:' + fact_hex(W['capture']))})
    add('ID02_event_arity', 'append', {'envelope': lambda e, W: e.__setitem__('event_id', e['event_id'].upper().replace('FORGE@1', 'forge@1'))}, 'uppercase hex')
    add('ID02_event_arity', 'append', {'envelope': lambda e, W: e.__setitem__('event_id', e['event_id'] + ':00')}, 'tenth component')
    for i, (name, value) in enumerate((('server', 'server-B'), ('partition', 'app2'), ('provider', 'gitlab'),
                                       ('instance', 'github.example'), ('account', 'pmref:account.other'),
                                       ('subject', 'pmref:subject.other'), ('operation', 'pmref:op.other'),
                                       ('revision', 'pmref:rev.other'), ('event_type', 'forge.other.event'))):
        add(f'ID{3 + i:02d}_component_{name}', 'append', {'envelope': _sub_component(i, value)})
    if app:
        add('ID12_partition_recipe', 'append', {'native': setp('scope', 'scope_partition', 'application')}, 'not app')
    else:
        add('ID12_partition_recipe', 'append', {'native': setp('scope', 'scope_partition', PROJECT)}, 'raw project id, no project~')
        add('ID12_partition_recipe', 'append', {'native': setp('scope', 'scope_partition', 'project~cHJvamVjdC1B=')}, 'padded base64')
    add('ID13_key_prefix', 'append', {'envelope': lambda e, W: e.__setitem__('idempotency_key', ('application@2' if app else 'forge@2') + e['idempotency_key'][e['idempotency_key'].index(':'):])})
    add('ID14_key_arity', 'append', {'envelope': lambda e, W: e.__setitem__('idempotency_key', e['idempotency_key'] + ':00')})
    if app:
        add('ID15_key_server', 'append', {'envelope': lambda e, W: e.__setitem__('idempotency_key', f"application@1:{hexs('server-B')}:{hexs(owner_operation_for(W['capture']))}")}, 'not the actual server')
        add('ID16_key_operation', 'append', {'envelope': lambda e, W: e.__setitem__('idempotency_key', f"application@1:{hexs(SERVER)}:{hexs('forge_fact@1:00')}")})
    else:
        add('ID16_key_operation', 'append', {'envelope': lambda e, W: e.__setitem__('idempotency_key', f"forge@1:{hexs('forge_fact@1:00')}")})
    # source row
    add('SR01_source_schema', 'append', {'source': setp('extension', 1)})
    add('SR01_source_schema', 'append', {'source': setp('pending_intent_ref', 'pm-payload-ref:v1:blake3:' + '0' * 64 + ':10:application/json')}, 'pack media json', multi=True)
    add('SR02_source_key', 'append', {'source_key': lambda k, W: k.replace(W['capture']['scope']['scope_partition'], 'raw-partition')})
    add('SR03_source_scope', 'append', {'source': setp('scope', 'server_id', 'server-B')})
    add('SR04_source_event_id', 'append', {'source': setp('event_id', 'forge@1:00')})
    add('SR05_source_idempotency', 'append', {'source': setp('idempotency_key', 'forge@1:00')})
    add('SR06_source_digest', 'append', {'source': setp('producer_semantic_digest', sha(b'other'))})
    for row, field in (('SR07_source_fact_ref', 'fact_ref'), ('SR08_source_operation', 'native_operation_ref'),
                       ('SR09_source_revision', 'native_fact_revision_ref'), ('SR10_source_subject', 'subject_ref'),
                       ('SR11_source_record', 'source_record_ref')):
        add(row, 'append', {'source': setp(field, 'pmref:forged.value')})
    add('SR12_source_phase', 'append', {'source': lambda s, W: s.update(phase='history_committed', first_append_receipt_ref='pmref:receipt.early', pending_intent_ref=None)})
    add('SR13_fact_unique', 'append', {'uniqueness': lambda u, W: {k: 'pmref:fact.reminted' for k in u}})
    # pack
    add('PK01_pack_present', 'append', {'pack': setp('store', {})})
    add('PK02_pack_digest', 'append', {'pack': lambda p, W: p.update(ref=p['ref'].replace(p['ref'].split(':')[3], sha(b'forged-digest')),
                                                                       store={sha(b'forged-digest'): next(iter(p['store'].values()))})})
    add('PK03_pack_size', 'append', {'pack': lambda p, W: p.update(ref=':'.join(p['ref'].split(':')[:4] + [str(int(p['ref'].split(':')[4]) + 1), PACK_MEDIA]))})
    add('PK05_pack_decodes', 'append', {'pack': _noncanonical_pack}, 'non-canonical map order')
    add('PK06_pack_intent', 'append', {'intent': setp('actor_ref', 'pmref:actor.other')})
    # receipt / settlement
    add('RC01_custody_schema', 'settle', {'custody': setp('extension', 1)})
    for row, field, value in (('RC02_custody_event', 'event_id', 'forge@1:00'), ('RC03_custody_partition', 'scope_partition', 'other'),
                              ('RC04_custody_type', 'event_type', 'forge.other.event'), ('RC05_custody_key', 'idempotency_key', 'forge@1:00'),
                              ('RC06_custody_digest', 'producer_semantic_digest', sha(b'other')),
                              ('RC07_custody_storage', 'storage_instance_id', OTHER_STORAGE)):
        add(row, 'settle', {'custody': setp(field, value)})
    add('RC08_full_value', 'settle', {'custody': setp('original_event_value_commitment', 'sha256', sha(b'other'))})
    add('RC09_receipt_event', 'settle', {'receipt': setp('event_id', 'forge@1:00')})
    add('RC10_receipt_sequence', 'settle', {'receipt': setp('sequence_id', 8)})
    add('RC11_receipt_sequence_id_uint64', 'settle', {'meta': setp('sequence_id', 7.0)}, 'float spelling, Storage copy coherent')
    add('RC08_full_value', 'settle', {'meta': setp('sequence_id', big)}, '4,400-digit sequence: no CV-339 preimage (RC11 also fails)', multi=True)
    for i, slot in enumerate(rows_spec.RECEIPT_UINT[1:]):
        add(f'RC{12 + i:02d}_receipt_{slot}_uint64', 'settle', {'receipt': setp(slot, 3.0)}, 'float spelling')
    add('RC16_ack_clock', 'settle', {'receipt': setp('acknowledged_at_utc', '2026-11-01T08:00:02.5+00:00')})
    add('RC17_settlement_ref', 'settle', {'settle': setp('row', 'first_append_receipt_ref', 'pmref:receipt.other')})
    add('RC18_settlement_phase', 'settle', {'settle': setp('row', 'phase', 'source_committed')})
    add('RC19_settlement_release', 'settle', {'settle': lambda s, W: s['row'].__setitem__('pending_intent_ref', W['pack']['ref'])})
    add('RC20_pin_released', 'settle', {'settle': lambda s, W: s.__setitem__('pins_after', copy.deepcopy(s['pins_before']))})
    add('RC21_other_holds_kept', 'settle', {'settle': lambda s, W: s.__setitem__('pins_after', {k: [] for k in s['pins_after']})})
    add('RC22_no_new_receipt', 'settle', {'settle': setp('receipts_after', 2)}, 'restart minted a second receipt')
    # retry
    add('RT01_retry_not_replay_only', 'retry', {'retry': setp('env', 'replay_policy', 'projector_replay_only')})
    add('RT02_retry_membership', 'retry', {'retry': setp('registry', set())})
    add('RT03_retry_dedupe_available', 'retry', {'retry': setp('dedupe_available', False)})
    add('RT04_retry_original_found', 'retry', {'retry': setp('dedupe', {})})
    add('RT05_retry_digest_equal', 'retry', {'retry': setp('env', 'payload', first_ref, 'pmref:changed.body')}, 'same key, different body')
    add('RT06_retry_receipt_original', 'retry', {'retry': setp('result', 'receipt', 'sequence_id', 9)}, 'a new receipt minted')
    add('RT07_retry_no_remote', 'retry', {'retry': setp('result', 'remote_operations', 1)})
    # checkpoint
    add('CP01_root_schema', 'publish', {'cand': setp('extension', 1)})
    add('CP02_root_key', 'publish', {'root_key': lambda k, W: k.replace(W['capture']['scope']['scope_partition'], 'raw-partition')})
    add('CP03_root_storage', 'publish', {'cand': setp('storage_instance_id', OTHER_STORAGE)})
    add('CP04_root_scope', 'publish', {'cand': setp('scope', 'server_id', 'server-B')})
    slot_paths = {'publication_revision': ('core', 'publication_revision'), 'matched_count': ('core', 'matched_count'),
                  'cursor_sequence': ('core', 'last_scanned', 'sequence_id'),
                  'frontier_revision': ('core', 'generic_token', 'frontier_revision')}
    for i, slot in enumerate(rows_spec.UINT_SLOTS):
        path = slot_paths.get(slot, ('core', 'generic_token', 'source_selection', slot))
        add(f'CP{5 + i:02d}_{slot}_uint64', 'publish',
            {'cand': lambda c, W, path=path: _set_float(c['generations'][0], path)}, 'float spelling')
    add('CP01_root_schema', 'publish', {'cand': setp('generations', 0, 'core', 'matched_count', big)}, '4,400-digit matched_count (CP06 also fails)', multi=True)
    add('CP12_activated_clock', 'publish', {'cand': setp('generations', 1, 'activated_at_utc', '2026-10-01T00:00:00+00:00')})
    add('CP13_retired_clock', 'publish', {'cand': setp('generations', 1, 'retired_at_utc', '2026-10-20T00:00:00z')})
    add('CP14_root_size', 'publish', {'cand': setp('generations', 0, 'core', 'generic_token', 'checkpoint_key', 'k' * 17000)})
    add('CP15_no_fourth_key', 'publish', {'storage_keys': lambda k, W: k + [W['root_key'] + '.history']})
    # generation (R1 constructions)
    add('GN01_current_cardinality', 'publish', {'cand': lambda c, W: c['generations'][1].update(lifecycle='current', retired_at_utc=None)})
    add('GN02_node_membership', 'publish', {'cand': lambda c, W: c.__setitem__('generations', [c['generations'][0], c['generations'][1], copy.deepcopy(c['generations'][1])])}, 'A,B,B')
    add('GN03_selected_exists', 'publish', {'cand': setp('current_generation_id', '0' * 64)}, 'nonmember selector X')
    add('GN04_core_scope', 'publish', {'cand': setp('generations', 1, 'core', 'scope', 'server_id', 'server-B')})
    add('GN05_core_identity', 'publish', {'cand': setp('generations', 1, 'core', 'storage_instance_id', OTHER_STORAGE)})
    add('GN06_generation_recipe', 'publish', {'cand': lambda c, W: (c['generations'][0].__setitem__('generation_id', '0' * 64), c.__setitem__('current_generation_id', '0' * 64))}, 'substituted id X, selector repaired')
    add('GN07_seed_issuance', 'publish', {'cand': lambda c, W: c['generations'][2].update(generation_seed_sha256=W['seeds']['U'], generation_id=generation_id(c, W['seeds']['U']))}, 'staged node with unissued seed U')
    add('GN08_staged_times', 'publish', {'cand': setp('generations', 2, 'activated_at_utc', '2026-10-25T00:00:00Z')})
    add('GN09_current_times', 'publish', {'cand': setp('generations', 0, 'retired_at_utc', '2026-10-25T00:00:00Z')})
    add('GN10_retired_anchor', 'publish', {'cand': setp('generations', 1, 'retired_at_utc', '2026-10-21T00:00:00Z')}, 'retirement refreshed on retry')
    add('GN11_activation_anchor', 'publish', {'cand': setp('generations', 0, 'activated_at_utc', '2026-10-21T00:00:00Z')})
    # token
    stale = {'storage_instance_id': OTHER_STORAGE, 'checkpoint_key': 'event_record_index.v1:stale', 'checkpoint_ref': 'checkpoints/stale',
             'generation_id': 'eig_' + sha(b'stale'), 'generation_anchor_sha256': sha(b'stale-anchor'), 'frontier_revision': 7,
             'frontier_sha256': sha(b'stale-frontier'), 'index_dataset_name': 'event_record_index.g0'}
    for i, f in enumerate(rows_spec.TOKEN_FIELDS):
        add(f'TK{1 + i:02d}_token_{f}', 'publish', _token_both(f, stale[f]))
    sel_stale = {'storage_instance_id': OTHER_STORAGE, 'selected_segment_generation': 2, 'manifest_generation': 4, 'recovery_epoch': 0}
    for i, f in enumerate(rows_spec.SELECTION_FIELDS):
        add(f'TS{1 + i:02d}_selection_{f}', 'publish', _token_both(f, sel_stale.get(f, sha(f'stale-{f}'.encode())), selection=True))
    add('TL01_live_snapshot', 'publish', {'request': setp('live_token', 'redb_snapshot_id', 'snap-0041')})
    add('TL02_live_projection', 'publish', {'request': setp('live_token', 'frontier_revision', 9)})
    # scan
    add('SC01_coverage_complete', 'publish', {'request': setp('scanned', [7]),
                                              'cand': lambda c, W: c['generations'][0]['core'].__setitem__('last_scanned', copy.deepcopy(W['pred']['generations'][0]['core']['last_scanned']))},
        'filtered maximum presented as coverage')
    add('SC02_cursor_event', 'publish', {'cand': setp('generations', 0, 'core', 'last_scanned', 'event_id', 'other-event')})
    add('SC03_cursor_sequence', 'publish', {'cand': setp('generations', 0, 'core', 'last_scanned', 'sequence_id', 9)})
    add('SC04_cursor_value', 'publish', {'cand': setp('generations', 0, 'core', 'last_scanned', 'event_value_sha256', sha(b'x'))})
    add('SC05_matched_count', 'publish', {'cand': setp('generations', 0, 'core', 'matched_count', 2)}, 'R2 count-only: 2 instead of 1')
    add('SC06_resume_revalidated', 'publish', {'pred': setp('generations', 0, 'core', 'last_scanned', 'event_value_sha256', sha(b'stale'))})
    add('SC07_no_second_disclosure', 'publish', {'request': lambda r, W: r.__setitem__('disclosed', [W['env']['event_id']])})
    add('SC08_matched_verified', 'publish', {'receipt_index': lambda i, W: {}})
    add('SC09_empty_proof', 'publish', {'request': setp('empty_proof', False)}, 'empty claim without inventory proof', empty=True)
    # cas
    add('CS01_expected_revision', 'publish', {'request': setp('expected_revision', 6)})
    add('CS02_revision_step', 'publish', {'cand': setp('generations', 0, 'core', 'publication_revision', 9)})
    add('CS03_expected_hash', 'publish', {'request': setp('expected_hash', sha(b'x'))})
    add('CS04_previous_hash', 'publish', {'cand': setp('generations', 0, 'core', 'previous_checkpoint_sha256', sha(b'x'))})
    add('CS05_siblings_preserved', 'publish', {'cand': setp('generations', 1, 'core', 'matched_count', 5)})
    add('CS06_selector_kept', 'publish', {'cand': _activate_c, 'recorded_times': _recorded_activation}, 'activation inside an advance')
    add('CS07_fence_current', 'publish', {'request': setp('fence', 'fence-0041')})
    # slot
    add('SL01_slot_free', 'stage', {'stage': lambda st, W: st.__setitem__('root', copy.deepcopy(W['pred']))}, 'blocked fourth generation')
    cleanup = lambda st, W, **kw: st.update(dict(op='cleanup', root=copy.deepcopy(W['pred']), target=W['pred']['generations'][1]['generation_id'],
                                                 holds=[], elapsed_seconds=WINDOW_SECONDS), **kw)  # noqa: E731
    add('SL02_cleanup_unselected', 'stage', {'stage': lambda st, W: cleanup(st, W, target=W['pred']['generations'][0]['generation_id'])})
    add('SL03_cleanup_no_hold', 'stage', {'stage': lambda st, W: cleanup(st, W, holds=['hold:legal'])})
    add('SL04_cleanup_window', 'stage', {'stage': lambda st, W: cleanup(st, W, elapsed_seconds=WINDOW_SECONDS - 1)})
    add('SL05_elapsed_uint64', 'stage', {'stage': lambda st, W: cleanup(st, W, elapsed_seconds=700000.0)}, 'float spelling')
    # history (SP-1101 retained read)
    add('HI01_receipt_present', 'read', {'read': setp('sealed', [])}, 'missing receipt')
    add('HI02_receipt_unique', 'read', {'read': lambda r, W: r['sealed'].append(copy.deepcopy(r['sealed'][0]))}, 'ambiguous: sealed twice')
    add('HI03_receipt_original', 'read', {'read': setp('sealed', 0, 'binding', 'event_id', 'forge@1:00')}, 'receipt for another original')
    add('HI04_recipe_known', 'read', {'read': lambda r, W: r['sealed'][0].__setitem__('recipe', UNKNOWN_RECIPE)})
    add('HI05_original_verifies', 'read', {'read': lambda r, W: r['stored'][r['original_ref']].__setitem__(
        'record', storage_value_bytes(dict(W['env'], actor_ref='pmref:actor.other'), profile=EVENT_VALUE))}, 'stored bytes differ from the sealed original')
    add('HI06_bytes_preserved', 'read', {'read': setp('reader_alters_bytes', True)})
    add('HI07_no_receipt_created', 'read', {'read': setp('reader_writes_receipt', True)}, 'receipt created while reading')
    add('HI08_not_foreign', 'read', {'read': lambda r, W: (r['expected'].__setitem__('storage_instance_id', OTHER_STORAGE),
                                                           r['sealed'][0]['binding'].__setitem__('storage_instance_id', OTHER_STORAGE))}, 'foreign original')
    add('HI09_reader_enabled', 'read', {'read': setp('withdrawn', True)})
    add('HI10_permission', 'read', {'read': setp('permission', False)})
    add('HI11_not_deleted', 'read', {'read': setp('deleted', True)})
    add('HI12_ref_available', 'read', {'read': setp('ref_available', False)})
    # replay
    for i, e in enumerate(rows_spec.EFFECTS):
        add(f'RP{1 + i:02d}_no_{e}', 'replay', {'replay': setp(e, [f'{e}:1'])})
    # withdrawal
    add('WD01_withdrawn_state', 'withdraw', {'withdraw': lambda d, W: d['root']['generations'][0]['core'].update(state='current', withdrawal_receipt_ref=None)})
    add('WD02_withdrawal_receipt', 'withdraw', {'withdraw': setp('root', 'generations', 0, 'core', 'withdrawal_receipt_ref', 'pmref:withdrawal.other')})
    add('WD03_selector_cleared', 'withdraw', {'withdraw': lambda d, W: (d['root']['generations'][2].update(lifecycle='current', activated_at_utc='2026-11-02T00:00:00Z'),
                                                                        d['root'].__setitem__('current_generation_id', d['root']['generations'][2]['generation_id'])),
                                              'recorded_times': lambda t, W: t.__setitem__(W['seeds']['C'], ('2026-11-02T00:00:00Z', None))},
        'withdrawal activates another node')
    add('WD05_tokens_invalidated', 'withdraw', {'withdraw': setp('tokens_invalidated', False)})
    add('WD06_no_event_created', 'withdraw', {'withdraw': setp('appended', 1)})
    return N


def _set_float(node_, path):
    target = node_
    for k in path[:-1]:
        target = target[k]
    target[path[-1]] = float(target[path[-1]])


def family_negatives(fam, kind):
    N = []

    def add(phase, row, path, muts, label='', multi=False):
        N.append(dict(phase=phase, row=row, path=path, muts=muts, label=label, multi=multi))
    slug = fam['slug']
    for row, field, *_ in rows_spec.payload_rows(fam):
        kw, _, name = field.partition('.')
        if kw == 'required':
            add('payload', row, 'append', {'payload': delp(name)})
        elif kw == 'const':
            add('payload', row, 'append', {'payload': setp(name, 'other')})
        elif kw == 'enum':
            add('payload', row, 'append', {'payload': setp(name, 'gitlab2')}, 'retired/unknown provider')
            add('payload', row, 'append', {'payload': setp(name, 7)}, 'wrong type number')
        elif kw == 'type':
            for label, value in (('number', 12345), ('null', None), ('boolean', True), ('array', ['pmref:a.b.c.d']), ('object', {'ref': 'pmref:x'})):
                add('payload', row, 'append', {'payload': setp(name, value)}, f'wrong type {label}')
        elif kw == 'minLength':
            add('payload', row, 'append', {'payload': setp(name, 'pmref:a')}, '7 characters')
        elif kw == 'maxLength':
            add('payload', row, 'append', {'payload': setp(name, 'pmref:' + 'a' * 251)}, '257 characters')
        elif kw == 'pattern':
            add('payload', row, 'append', {'payload': setp(name, 'pmref:bad value')}, 'space')
            add('payload', row, 'append', {'payload': setp(name, 'pmref:abcdefgh\n')}, 'trailing LF')
            add('payload', row, 'append', {'payload': setp(name, 'https://example.com/x')}, 'URL, not a handle')
        elif field == 'closed':
            add('payload', row, 'append', {'payload': setp('extra_ref', 'pmref:extra.0001')})
    add('source', 'SN01_native_present', 'append', {'capture': setp('fact_ref', 'pmref:fact.forged.0001')}, 'self-consistent record lacking native acceptance')
    add('source', 'SN02_native_identical', 'append', {'capture': setp('instance', 'github.example')}, 'capture differs from the owner record')
    add('source', 'SN03_native_owner', 'append', {'native': setp('owner', 'OtherOwner.commit_result@1.0.0')})
    add('source', 'SN04_native_accepted', 'append', {'native': setp('accepted', False)})
    add('source', 'SN04_native_accepted', 'append', {'native': setp('accepted', 'true')}, 'string boolean')
    n = 0
    for f in ('fact_ref', 'provider', 'subject_ref', 'source_record_ref') + fam['domain_refs']:
        n += 1
        add('source', f'SJ{n:02d}_join_{f}', 'append', {'payload': setp(f, 'gitlab' if f == 'provider' else f'pmref:forged.{f}')})
    if fam['vote']:
        values = {'provider': 'gitlab', 'reviewer_ref': 'pmref:reviewer.other', 'review_revision_ref': 'pmref:revision.other',
                  'native_vote_ref': 'pmref:vote.other', 'vote_value': 'comment', 'required_reviewer': False,
                  'revision_binding_kind': 'observed_by_puppet_master', 'binding_evidence_ref': 'pmref:binding.other'}
        for f in rows_spec.VOTE_FIELDS:
            n += 1
            add('source', f'SJ{n:02d}_vote_{f}', 'append', {'source': setp('vote_evidence', f, values[f])})
        add('source', f'SJ{n - 2:02d}_vote_required_reviewer', 'append', {'source': setp('vote_evidence', 'required_reviewer', 'true')}, 'string boolean')
    for i, (name, kind_, args, (fact, value)) in enumerate(fam['semantic']):
        row = f'SM{i + 1:02d}_{name}'
        add('source', row, 'append', {'native': setp('facts', fact, value)}, 'plan non-emitting case')
        if kind_ == 'is' and type(args[1]) is bool:
            add('source', row, 'append', {'native': setp('facts', args[0], 'true' if args[1] else 'false')}, 'string boolean')
    return N


def all_cases(fam, kind):
    out = []
    for p in positives(fam, kind):
        out.append(dict(p, kind='positive'))
    for n in shared_negatives(fam, kind):
        out.append(dict(n, kind='negative', phase=_phase_of(n['row']), id=f"{n['row']}/{n['label'] or 'single defect'}"))
    for n in family_negatives(fam, kind):
        name = rows_spec.phase_name(n['phase'], fam)
        out.append(dict(n, kind='negative', phase=name, id=f"{n['row']}/{n['label'] or 'single defect'}"))
    return out


_ROW_PHASE = {}


def _phase_of(row):
    if not _ROW_PHASE:
        for phase, (_t, rows) in rows_spec.SHARED.items():
            for r in rows:
                _ROW_PHASE[r[0]] = phase
    return _ROW_PHASE[row]


def code_of(phase_name, row):
    phases = rows_spec.all_phases()
    for r in phases[phase_name][1]:
        if r[0] == row:
            return r[3]
    raise KeyError((phase_name, row))


def judge(case, result):
    """None when the case met its expectation, else a mismatch string."""
    if case['kind'] == 'positive':
        return None if result is None else f'positive refused at {result[:3]}'
    if result is None:
        return 'negative accepted'
    phase, row, code, failing = result
    want = (case['phase'], case['row'], code_of(case['phase'], case['row']))
    if (phase, row, code) != want:
        return f'refused at {(phase, row, code)} instead of {want}'
    if not case.get('multi') and len(failing) != 1:
        return f'not single-row: {failing}'
    return None


def run_case(fam, kind, case):
    W = build(fam, kind, case['muts'], empty=case.get('empty', False))
    result = run_path(case['path'], W)
    extra = None
    if case['path'] == 'read' and not dispatcher_agrees(W):
        extra = 'RetainedDispatcher disagrees with HI01-HI05'
    return result, extra


def main(argv=None):
    args = list(sys.argv[1:] if argv is None else argv)
    only = None
    if '--family' in args:
        only = args[args.index('--family') + 1]
    out_path = Path(args[args.index('--json') + 1]) if '--json' in args else None
    summary = dict(families=0, positives=0, negatives=0, single_row=0, multi_row=0, mismatches=[], unresolved_refs=[])
    coverage = {}
    with exact_integer_digits():
        summary['unresolved_refs'] = resolve_every_ref()
        for fam in spec.FAMILIES:
            if only and fam['event_type'] != only:
                continue
            summary['families'] += 1
            witnessed = coverage.setdefault(fam['event_type'], {})
            for kind in ('application', 'project'):
                for case in all_cases(fam, kind):
                    result, extra = run_case(fam, kind, case)
                    mismatch = judge(case, result) or extra
                    if mismatch:
                        summary['mismatches'].append(dict(family=fam['event_type'], kind=kind, case=case['id'], why=mismatch))
                        continue
                    if case['kind'] == 'positive':
                        summary['positives'] += 1
                        continue
                    summary['negatives'] += 1
                    single = len(result[3]) == 1
                    summary['single_row' if single else 'multi_row'] += 1
                    if single:
                        witnessed.setdefault(f"{case['phase']}/{case['row']}", []).append(kind)
            # every reachable row of every table on this family's paths needs a single-row witness
            for phase_name, (_t, rows) in rows_spec.all_phases().items():
                if phase_name.startswith(('payload_', 'source_')) and not phase_name.endswith(fam['slug']):
                    continue
                if phase_name.endswith('_entailed'):
                    continue
                for r in rows:
                    if f'{phase_name}/{r[0]}' not in witnessed:
                        summary['mismatches'].append(dict(family=fam['event_type'], case=f'{phase_name}/{r[0]}', why='row without a single-row witness'))
    summary['rows_witnessed'] = {k: len(v) for k, v in coverage.items()}
    summary['status'] = 'pass' if not summary['mismatches'] and not summary['unresolved_refs'] else 'fail'
    text = json.dumps(summary, indent=1, sort_keys=True, default=str)
    if out_path:
        out_path.write_text(text + '\n')
    print(json.dumps({k: (v if k != 'mismatches' else v[:40]) for k, v in summary.items() if k != 'rows_witnessed'},
                     indent=1, default=str))
    return 0 if summary['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
